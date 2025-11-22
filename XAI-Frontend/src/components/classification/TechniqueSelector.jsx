// TechniqueSelector.jsx
import React from "react";
import { Check, Sparkles } from "lucide-react";

const techniques = [
  { id: "gradcam", name: "Grad-CAM", description: "Visualize which regions of the image influenced the decision", icon: "🔥" },
  { id: "shap", name: "SHAP", description: "Game-theory based feature importance visualization", icon: "📊" },
];

export default function TechniqueSelector({ selectedTechnique, setSelectedTechnique, runXAI, isAnalyzing }) {
  return (
    <div className="p-8 md:p-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose XAI Technique</h2>
        <p className="text-gray-600">Select an explainability method to understand the prediction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
        {techniques.map((t) => (
          <button key={t.id} onClick={() => setSelectedTechnique(t.id)} className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${selectedTechnique === t.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
            <div className="text-5xl mb-4">{t.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t.name}</h3>
            <p className="text-sm text-gray-600">{t.description}</p>
            {selectedTechnique === t.id && (<div className="mt-4 flex items-center text-green-600 font-medium"><Check className="w-5 h-5 mr-2" /><span>Selected</span></div>)}
          </button>
        ))}
      </div>

      {selectedTechnique && (
        <div className="max-w-md mx-auto">
          <button onClick={runXAI} disabled={isAnalyzing} className="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
            {isAnalyzing ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Analyzing...</span></>) : (<><Sparkles className="w-5 h-5" /><span>Run Analysis</span></>)}
          </button>
        </div>
      )}
    </div>
  );
}
