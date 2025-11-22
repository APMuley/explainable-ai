// ImageUploader.jsx
import React from "react";
import { Upload, X } from "lucide-react";

export default function ImageUploader({ uploadedImage, setUploadedImage, goNext }) {
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUploadedImage(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-8 md:p-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Upload Your Image</h2>
        <p className="text-gray-600">Upload an image for analysis</p>
      </div>
      <div className="max-w-2xl mx-auto">
        {!uploadedImage ? (
          <label className="block cursor-pointer">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <div className="border-4 border-dashed border-gray-300 rounded-2xl p-16 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300">
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">PNG, JPG, JPEG (Max 10MB)</p>
            </div>
          </label>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img src={uploadedImage} alt="Uploaded" className="w-full h-96 object-cover" />
              <button onClick={() => setUploadedImage(null)} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <button onClick={goNext} className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300">Continue to Prediction</button>
          </div>
        )}
      </div>
    </div>
  );
}
