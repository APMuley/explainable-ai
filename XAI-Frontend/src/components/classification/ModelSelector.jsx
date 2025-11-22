// ModelSelector.jsx
import React from "react";
import { ChevronRight } from "lucide-react";
const models = [
  { id: "dog-cat", name: "Dog-Cat Classifier", description: "CNN model for classifying dog and cat images", icon: "🐕🐈" },
  { id: "tb", name: "TB Diagnosis", description: "Medical imaging model for tuberculosis detection", icon: "🫁" },
];

export default function ModelSelector({ selectedModel, setSelectedModel, goNext }) {
  return (
    <div className="p-8 md:p-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Model</h2>
        <p className="text-gray-600">Select the AI model for your diagnosis task</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {models.map((m) => (
          <button key={m.id} onClick={() => { setSelectedModel(m.id); goNext(); }} className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${selectedModel===m.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
            <div className="relative">
              <div className="text-5xl mb-4">{m.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{m.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{m.description}</p>
              <div className="flex items-center text-blue-600 font-medium"><span>Select Model</span><ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" /></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
