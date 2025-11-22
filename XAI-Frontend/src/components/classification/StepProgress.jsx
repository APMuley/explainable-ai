// StepProgress.jsx
import React from "react";
import { Check } from "lucide-react";

export default function StepProgress({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between mb-12">
      {steps.map((step, idx) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const Icon = step.icon;
        return (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? "bg-green-500 text-white" : isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50" : "bg-gray-200 text-gray-400"}`}>
                {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
              </div>
              <span className={`mt-2 text-sm font-medium ${isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"}`}>{step.name}</span>
            </div>
            {idx < steps.length - 1 && <div className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${isCompleted ? "bg-green-500" : "bg-gray-200"}`} />}
          </div>
        );
      })}
    </div>
  );
}
