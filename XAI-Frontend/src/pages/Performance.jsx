import { useState } from "react";
import { BarChart3, Cpu } from "lucide-react";

// Import your images
import dogCatConfusion from "../assets/dog_cat_confusion.jpeg";
import dogCatML from "../assets/dog_cat_modelloss.png";
import dogCatMA from "../assets/dog_cat_modelaccuracy.png"
import dogCatROC from "../assets/dog_cat_roc.jpeg";
import tbMA from "../assets/tb_modelaccuracy.png";
import tbML from "../assets/tb_modelloss.png";
import tbConfusion from "../assets/tb_confusion.png";
import tbroc from "../assets/tb_roc.png";

export default function Performance() {
  const [model, setModel] = useState(null);

  const metricsImages = {
    "dog-cat": [
      { title: "Confusion Matrix", src: dogCatConfusion },
      { title: "Model Loss Over Epochs", src: dogCatML },
      { title: "Model Accuracy Over Epochs", src: dogCatMA },
      { title: "ROC", src: dogCatROC },
    ],
    tb: [
        { title: "Confusion Matrix", src: tbConfusion },
        { title: "Model Loss Over Epochs", src: tbML },
        { title: "Model Accuracy Over Epochs", src: tbMA },
        { title: "ROC", src: tbroc },
    ],
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Model Performance</h1>
      <p className="text-gray-600 mb-8">
        Select a model to view its trained performance metrics and architecture.
      </p>

      {/* Model Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => setModel("dog-cat")}
          className={`p-6 rounded-xl border hover:shadow-lg transition-all text-left ${
            model === "dog-cat" ? "border-blue-500 shadow-md" : "border-gray-300"
          }`}
        >
          <Cpu className="w-8 h-8 text-blue-600 mb-3" />
          <h2 className="text-xl font-bold mb-1">Dog vs Cat Model</h2>
          <p className="text-gray-600 text-sm">Binary classifier trained on pets dataset.</p>
        </button>

        <button
          onClick={() => setModel("tb")}
          className={`p-6 rounded-xl border hover:shadow-lg transition-all text-left ${
            model === "tb" ? "border-blue-500 shadow-md" : "border-gray-300"
          }`}
        >
          <BarChart3 className="w-8 h-8 text-indigo-600 mb-3" />
          <h2 className="text-xl font-bold mb-1">Tuberculosis Model</h2>
          <p className="text-gray-600 text-sm">X-ray pathology classifier.</p>
        </button>
      </div>

      {/* Metrics Panel */}
      {model && (
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {model === "dog-cat" ? "Dog vs Cat Model" : "Tuberculosis Model"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metricsImages[model].map((metric, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-xl shadow-sm flex flex-col items-center">
                <p className="text-gray-700 font-semibold mb-2">{metric.title}</p>
                <img
                  src={metric.src}
                  alt={metric.title}
                  className="rounded-lg border border-gray-200 max-h-72 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
