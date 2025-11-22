// ResultsView.jsx
import React from "react";
import { Check, Download, ChevronRight } from "lucide-react";

export default function ResultsView({ results, selectedTechnique, onDownloadReport, resetFlow }) {
  if (!results) return null;

  return (
    <div className="p-8 md:p-12">
      <div className="text-center mb-10">
        <div className="inline-block p-3 bg-green-100 rounded-full mb-4"><Check className="w-8 h-8 text-green-600" /></div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Analysis Complete</h2>
        <p className="text-gray-600">Here are your results with explainability insights.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">PREDICTION</h3>
              <p className="text-4xl font-bold text-gray-900 mb-4">{results.prediction}</p>

              <h3 className="text-sm font-semibold text-gray-600 mb-2">CONFIDENCE</h3>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div className="bg-linear-to-r from-blue-500 to-indigo-600 h-full transition-all duration-1000" style={{ width: `${results.confidence}%` }} />
                </div>
                <span className="text-2xl font-bold text-blue-600">{results.confidence}%</span>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-700">{results.details.primaryClass}</span><span className="font-semibold text-blue-600">{results.details.primaryProb}%</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-700">{results.details.secondaryClass}</span><span className="font-semibold text-gray-600">{results.details.secondaryProb}%</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">{selectedTechnique === "gradcam" ? "GRAD-CAM VISUALIZATION" : "SHAP ANALYSIS"}</h3>
              <div className="rounded-xl overflow-hidden shadow-lg"><img src={results.visualization} alt="XAI Visualization" className="w-full h-64 object-cover" /></div>
              <p className="text-xs text-gray-500 mt-2">Highlighted regions show areas influencing the model decision.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={onDownloadReport} className="flex items-center justify-center space-x-2 bg-linear-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
            <Download className="w-5 h-5" />
            <span>Download Report</span>
          </button>

          <button onClick={resetFlow} className="flex items-center justify-center space-x-2 bg-gray-600 text-white py-4 rounded-xl font-semibold hover:bg-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <ChevronRight className="w-5 h-5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
}
