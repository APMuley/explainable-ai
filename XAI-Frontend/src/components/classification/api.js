// api.js
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  const len = binary.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

export async function predictModel(dataUrl, modelKey) {
  // modelKey: "dog-cat" or "tb"
  const fd = new FormData();
  const blob = dataUrlToBlob(dataUrl);
  // send both file blob (for request.files) and base64 (for fallback)
  fd.append("image", blob, "upload.png");
  fd.append("image_b64", dataUrl);
  const endpoint = modelKey === "dog-cat" ? "/api/predict/dogcat/" : "/api/predict/tb/";
  const res = await client.post(endpoint, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function runGradCAM(dataUrl, modelKey, options = {}) {
  const fd = new FormData();
  const blob = dataUrlToBlob(dataUrl);
  fd.append("image", blob, "upload.png");
  fd.append("image_b64", dataUrl);
  fd.append("model", modelKey === "dog-cat" ? "dog_cat" : "tb");
  if (options.blur) fd.append("blur", options.blur);
  if (options.alpha) fd.append("alpha", options.alpha);
  const data = await client.post("/api/gradcam", fd, { headers: { "Content-Type": "multipart/form-data" } });
  return data.data;
}

export async function runSHAP(dataUrl, modelKey, options = {}) {
  const fd = new FormData();
  const blob = dataUrlToBlob(dataUrl);
  fd.append("image", blob, "upload.png");
  fd.append("image_b64", dataUrl);
  fd.append("model", modelKey === "dog-cat" ? "dog_cat" : "tb");
  if (options.blur) fd.append("blur", options.blur);
  if (options.alpha) fd.append("alpha", options.alpha);
  if (options.shap_max_evals) fd.append("shap_max_evals", options.shap_max_evals);
  const res = await client.post("/api/shap", fd, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data;
}


export async function generateReport(imageDataUrl, modelKey, extraMetrics = null) {
    const fd = new FormData();
  
    const blob = dataUrlToBlob(imageDataUrl);
    fd.append("image", blob, "upload.png");
  
    fd.append("model", modelKey === "dog-cat" ? "dog_cat" : "tb");
  
    if (extraMetrics) {
      fd.append("extra_metrics", JSON.stringify(extraMetrics));
    }
  
    const res = await fetch("http://127.0.0.1:5000/api/generate_report/generate", {
      method: "POST",
      body: fd,
    });
  
    if (!res.ok) {
      const err = await res.text();
      throw new Error("Report error: " + err);
    }
  
    return res;
  }

export default {
  predictModel,
  runGradCAM,
  runSHAP,
  generateReport,
};
