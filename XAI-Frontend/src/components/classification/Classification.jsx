// Classification.jsx
import React, { useState } from "react";
import StepProgress from "./StepProgress";
import ModelSelector from "./ModelSelector";
import ImageUploader from "./ImageUploader";
import PredictStep from "./PredictStep";
import TechniqueSelector from "./TechniqueSelector";
import ResultsView from "./ResultsView";
import api from "./api";
import { Brain, Upload, Check, Sparkles, FileText } from "lucide-react";

const steps = [
  { number: 1, name: "Select Model", icon: Brain },
  { number: 2, name: "Upload Image", icon: Upload },
  { number: 3, name: "Predict Output", icon: Check },
  { number: 4, name: "Choose XAI", icon: Sparkles },
  { number: 5, name: "View Results", icon: FileText },
];

export default function Classification() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedModel, setSelectedModel] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelPrediction, setModelPrediction] = useState(null);

  const goNext = () => setCurrentStep((s) => Math.min(5, s + 1));
  const goPrev = () => setCurrentStep((s) => Math.max(1, s - 1));

  const runXAI = async () => {
    if (!selectedTechnique || !uploadedImage || !selectedModel) {
      alert("Choose model, upload image and select technique first.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const modelKeyForApi = selectedModel === "dog-cat" ? "dog_cat" : "tb";
      let data;
      if (selectedTechnique === "gradcam") {
        data = await api.runGradCAM(uploadedImage, selectedModel);
      } else {
        data = await api.runSHAP(uploadedImage, selectedModel);
      }

      // determine b64 field name returned by backend
      let imgData = data.overlay_base64 || data.shap_overlay_base64 || data.overlay_base64 || null;

      // If backend provided URL, fetch it and convert to dataURL
      if (!imgData && data.overlay_url) {
        const url = `${process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000"}${data.overlay_url}`;
        const resp = await fetch(url);
        const blob = await resp.blob();
        imgData = await new Promise((res) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result);
          reader.readAsDataURL(blob);
        });
      }

      // fallback to uploaded image if none
      if (!imgData) imgData = uploadedImage;

      // prediction label & score (backend returns different keys)
      const predLabel = data.prediction_label || data.prediction || modelPrediction || "Unknown";
      const score = data.score || data.confidence || data.raw_score || 0.0;

      
      // --- FIXED LOGIC FOR BINARY-SIGMOID MODEL ---

      // "score" = sigmoid probability of class 1
      // Ensure safe fallback:
      const prob = typeof score === "number" ? score : 0.5;

      // Frontend canonical class names
      const class1 = selectedModel === "dog-cat" ? "Dog" : "Tuberculosis";
      const class0 = selectedModel === "dog-cat" ? "Cat" : "Normal";

      // Backend decides predLabel, but we compute scores correctly
      const primaryClass = predLabel;
      const secondaryClass = predLabel === class1 ? class0 : class1;

      const primaryProb =
        predLabel === class1 ? prob * 100 : (1 - prob) * 100;

      const secondaryProb =
        predLabel === class1 ? (1 - prob) * 100 : prob * 100;

      setResults({
        prediction: predLabel,
        confidence: Math.round(primaryProb * 100) / 100,
        visualization: imgData,
        details: {
          primaryClass,
          secondaryClass,
          primaryProb: Math.round(primaryProb * 100) / 100,
          secondaryProb: Math.round(secondaryProb * 100) / 100,
        },
      });


      setCurrentStep(5);
    } catch (err) {
      console.error("XAI call failed", err);
      alert("Explainability (Grad-CAM/SHAP) failed. Check server logs and backend shap installation.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = async () => {
    if (!uploadedImage || !selectedModel)
      return alert("Need image & model to generate report.");
  
    try {
      const response = await api.generateReport(uploadedImage, selectedModel);
  
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${selectedModel}_${Date.now()}.pdf`;
      a.click();
    } catch (err) {
      console.error(err);
      alert("Report generation failed: " + err.message);
    }
  };
  
  

  const reset = () => {
    setCurrentStep(1);
    setSelectedModel(null);
    setUploadedImage(null);
    setSelectedTechnique(null);
    setResults(null);
    setModelPrediction(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <StepProgress steps={steps} currentStep={currentStep} />
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {currentStep === 1 && <ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} goNext={goNext} />}
          {currentStep === 2 && <ImageUploader uploadedImage={uploadedImage} setUploadedImage={setUploadedImage} goNext={goNext} />}
          {currentStep === 3 && uploadedImage && (<PredictStep uploadedImage={uploadedImage} selectedModel={selectedModel} setModelPrediction={setModelPrediction} setCurrentStep={setCurrentStep} setIsAnalyzing={setIsAnalyzing} />)}
          {currentStep === 4 && (<TechniqueSelector selectedTechnique={selectedTechnique} setSelectedTechnique={setSelectedTechnique} runXAI={runXAI} isAnalyzing={isAnalyzing} />)}
          {currentStep === 5 && results && (<ResultsView results={results} selectedTechnique={selectedTechnique} onDownloadReport={downloadReport} resetFlow={reset} />)}
        </div>
      </div>
    </div>
  );
}
