// PredictStep.jsx
import React, { useState } from "react";
import { Check } from "lucide-react";
import api from "./api";

export default function PredictStep({ uploadedImage, selectedModel, setModelPrediction, setCurrentStep, setIsAnalyzing }) {
  const [loading, setLoading] = useState(false);

  const doPredict = async () => {
    setLoading(true);
    setIsAnalyzing(true);
    try {
      const data = await api.predictModel(uploadedImage, selectedModel);
      // backend returns keys like { prediction, confidence, raw_score } or { prediction_label, score }
      const prediction = data.prediction || data.prediction_label || "Unknown";
      setModelPrediction(prediction);
      setCurrentStep(4);
    } catch (err) {
      console.error("predict error", err);
      alert("Prediction failed. Check server / CORS / console.");
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 md:p-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Predict Model Output</h2>
        <p className="text-gray-600">Generate the model’s prediction before running explainability.</p>
      </div>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <img src={uploadedImage} alt="Preview" className="w-full h-72 object-cover" />
        </div>
        <button onClick={doPredict} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
          {loading ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> <span>Predicting...</span></>) : (<><Check className="w-5 h-5" /><span>Predict Output</span></>)}
        </button>
      </div>
    </div>
  );
}
