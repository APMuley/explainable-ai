# routes/report_generator.py
import os
import io
import json
import time
import base64
import traceback
import datetime
from typing import Optional

from flask import Blueprint, request, jsonify, current_app, send_file
from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML
import tempfile

import cloudinary
import cloudinary.uploader
import cloudinary.api

cloudinary.config(
    cloud_name="di6fh4byq",
    api_key="432998634592643",
    api_secret="DQivpwLbJSEpn8NoiP0pm90q2AE",
    secure=True
)


# ============ GROQ API CLIENT ============
from groq import Groq

# Import utilities from your existing gradcam/shap module
from routes.explain_shap_routes import (
    load_model_h5,
    preprocess_image_bytes,
    compute_gradcam_highres,
    get_or_create_shap_gradient_explainer,
    compute_shap_overlay_gradient,
    img_to_base64,
    save_rgb_image_and_url,
    schedule_file_deletion,
    MODEL_FILES
)

report_bp = Blueprint("report_bp", __name__)

# Where to store generated PDFs
REPORTS_DIR = os.path.join("static", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

# Template setup: expect report_template.html in same folder (routes/)
TEMPLATE_DIR = os.path.dirname(__file__)
TEMPLATE_FILE = "report_template.html"
env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(["html", "xml"])
)

# ---------- GROQ CLIENT ------------
GROQ_API_KEY = "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"   # <-- Put your actual key!
client = Groq(api_key=GROQ_API_KEY)


# ---------- Call LLM (Groq) ----------
def call_llm(prompt, model="llama-3.3-70b-versatile", max_tokens=500):

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content
    except Exception as e:
        print("GROQ ERROR:", e)
        return "(LLM unavailable) " + simple_rule_based_response(prompt)


# ---------- RULE-BASED FALLBACK ----------
def simple_rule_based_response(prompt: str) -> str:
    p = prompt.lower()
    if "grad-cam" in p or "gradcam" in p:
        return ("Grad-CAM highlights spatial regions that strongly influence the model’s prediction. "
                "Warm regions reflect high importance and should ideally align with meaningful object structure.")
    if "shap" in p:
        return ("SHAP assigns pixel-level contribution scores. Red increases prediction confidence, "
                "blue decreases it, enabling feature-level interpretation.")
    if "compare" in p:
        return ("Grad-CAM explains *where* the model looks; SHAP explains *how much* each pixel affects prediction. "
                "Combined, they give spatial + feature attribution.")
    return ("Automated explanation unavailable. This is a fallback analysis summarizing relevant model behavior.")


# ---------- Data URI helper ----------
def ensure_b64_data_uri(b64_or_datauri: str) -> str:
    if b64_or_datauri.startswith("data:"):
        return b64_or_datauri
    return "data:image/png;base64," + b64_or_datauri


# ---------- BUILD REPORT ----------
def build_report(
    model_key: str,
    prediction_label: str,
    confidence: float,
    input_image_b64: str,
    gradcam_b64: str,
    shap_b64: str,
    extra_metrics: Optional[dict] = None,
    llm_model: str = "llama-3.3-70b-versatile"
) -> str:

    try:
        input_img_uri = ensure_b64_data_uri(input_image_b64)
        gradcam_img_uri = ensure_b64_data_uri(gradcam_b64)
        shap_img_uri = ensure_b64_data_uri(shap_b64)

        # LLM Prompts
        g_prompt = (
            f"You are an ML interpretability expert. Explain the Grad-CAM heatmap.\n\n"
            f"Model: {model_key}\nPrediction: {prediction_label}\nConfidence: {confidence:.4f}\n\n"
            "Explain what regions the heatmap highlights, whether they align with meaningful structure, "
            "and any concerns about spurious focus. Keep it technical (3–6 sentences)."
        )

        s_prompt = (
            f"You are an ML interpretability expert. Explain the SHAP visualization.\n\n"
            f"Model: {model_key}\nPrediction: {prediction_label}\nConfidence: {confidence:.4f}\n\n"
            "Explain positive/negative pixel contributions and how SHAP complements Grad-CAM. "
            "Keep it technical (3–6 sentences)."
        )

        cmp_prompt = (
            f"Compare Grad-CAM and SHAP for prediction '{prediction_label}'. "
            "Discuss strengths, weaknesses, and combined interpretation. (3–6 sentences)"
        )

        # LLM calls
        gradcam_text = call_llm(g_prompt, model=llm_model)
        shap_text = call_llm(s_prompt, model=llm_model)
        comparison_text = call_llm(cmp_prompt, model=llm_model)

        # Combined interpretation
        interp_prompt = (
            "You are an expert summarizer. Write a single paragraph combining Grad-CAM and SHAP insights:\n\n"
            f"Grad-CAM: {gradcam_text}\n\n"
            f"SHAP: {shap_text}\n\n"
            "Produce a unified explanation of how the model forms its decision. (3–6 sentences)"
        )
        interpretation_text = call_llm(interp_prompt, model=llm_model)

        # Fidelity & Robustness
        if extra_metrics:
            fidelity_text = json.dumps(extra_metrics.get("fidelity", {}), indent=2)
            robustness_text = json.dumps(extra_metrics.get("robustness", {}), indent=2)
        else:
            fidelity_text = "Fidelity metrics not computed yet."
            robustness_text = "Robustness metrics not computed yet."

        # Render HTML
        tpl = env.get_template(TEMPLATE_FILE)
        now = datetime.datetime.utcnow().isoformat()

        html = tpl.render(
            model_name=MODEL_FILES.get(model_key, {}).get("class_names", model_key),
            model_key=model_key,
            prediction=prediction_label,
            confidence=f"{confidence:.4f}",
            input_image=input_img_uri,
            gradcam_image=gradcam_img_uri,
            shap_image=shap_img_uri,
            gradcam_text=gradcam_text,
            shap_text=shap_text,
            comparison_text=comparison_text,
            fidelity_text=fidelity_text,
            robustness_text=robustness_text,
            interpretation_text=interpretation_text,
            generated_at=now
        )

        # Save PDF
        ts = int(time.time() * 1000)
        filename = f"report_{model_key}_{ts}.pdf"
        out_path = os.path.join(REPORTS_DIR, filename)
        HTML(string=html).write_pdf(out_path)

        # Auto-delete after 10 minutes (optional)
        try:
            schedule_file_deletion(out_path, delay_seconds=600)
        except:
            pass

        return f"/static/reports/{filename}"

    except Exception as e:
        traceback.print_exc()
        raise


# ---------- FLASK ENDPOINT ----------
@report_bp.route("/generate", methods=["POST"])
def report_generate_endpoint():

    tmp_path = None
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400

        model_key = request.form.get("model")
        if not model_key or model_key not in MODEL_FILES:
            return jsonify({"error": f"Invalid model. Use: {list(MODEL_FILES.keys())}"}), 400

        extra_metrics = None
        if request.form.get("extra_metrics"):
            try:
                extra_metrics = json.loads(request.form.get("extra_metrics"))
            except:
                extra_metrics = None

        upload = request.files["image"]
        fname = upload.filename or f"upload_{int(time.time()*1000)}.png"
        tmp_path = os.path.join("uploads", fname)
        upload.save(tmp_path)

        # Preprocess
        cfg = MODEL_FILES[model_key]
        batch, orig_bgr, resized_bgr = preprocess_image_bytes(
            open(tmp_path, "rb").read(),
            cfg["img_size"]
        )

        if batch is None:
            raise ValueError("Invalid image file")

        # Load model
        model = load_model_h5(model_key)

        # Grad-CAM
        pred_score, pred_class, heat_rgb, overlay_rgb = compute_gradcam_highres(
            model=model,
            last_conv_name=cfg["last_conv"],
            preproc_batch=batch,
            orig_image_bgr=orig_bgr,
            blur_ksize=(15, 15),
            alpha=0.6
        )
        gradcam_b64 = img_to_base64(overlay_rgb)

        # SHAP
        explainer = get_or_create_shap_gradient_explainer(model_key, model, cfg["img_size"])
        shap_vals, shap_heat_rgb, shap_overlay_rgb = compute_shap_overlay_gradient(
            explainer, batch, orig_bgr, blur_ksize=(15, 15), alpha=0.6
        )
        shap_b64 = img_to_base64(shap_overlay_rgb)

        # Input image base64
        with open(tmp_path, "rb") as f:
            raw = f.read()
        input_b64 = "data:image/png;base64," + base64.b64encode(raw).decode("ascii")

        # Prediction
        class_names = MODEL_FILES[model_key]["class_names"]
        label = class_names[int(pred_class)]
        conf = float(pred_score)

        # Generate report
        report_url = build_report(
            model_key,
            label,
            conf,
            input_b64,
            gradcam_b64,
            shap_b64,
            extra_metrics
        )

        # Clean temp
        try:
            os.remove(tmp_path)
        except:
            pass

        # Local path of PDF
        local_pdf_path = "/Users/ashishmuley/Desktop/major_project/Major_Project/Backend" + report_url

        # Upload to Cloudinary
        cloud_resp = cloudinary.uploader.upload(
            local_pdf_path,
            resource_type="raw",  
            folder="reports",     
            public_id=f"{model_key}_{int(time.time())}"  
        )

        # Get URL of uploaded PDF
        pdf_cloud_url = cloud_resp.get("secure_url")
        print("PDF uploaded to Cloudinary:", pdf_cloud_url)

        """
        Can also return cloudinary url instead
        return jsonify({
            "message": "Report generated successfully",
            "pdf_url": pdf_cloud_url
        })

        """
               
        return send_file(local_pdf_path, mimetype="application/pdf", as_attachment=True)

    except Exception as e:
        traceback.print_exc()
        try:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)
        except:
            pass
        return jsonify({"error": str(e)}), 500
