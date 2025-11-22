import { useState } from "react";
import { Upload, X, CheckCircle, AlertTriangle, Trash } from "lucide-react";
import axios from "axios";

const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [deleteAfter, setDeleteAfter] = useState(60); // default 60 sec
  const [status, setStatus] = useState(""); // idle, uploading, success, error
  const [message, setMessage] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("error");
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("delete_after", deleteAfter);

    try {
      setStatus("uploading");
      const res = await axios.post("/api/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus("success");
      setMessage(res.data.message);
      setUploadedFile(res.data);
      setFile(null); // clear selected file
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.error || "An error occurred while uploading."
      );
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus("");
    setMessage("");
    setUploadedFile(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <Upload className="w-6 h-6 mr-2 text-blue-600" /> Upload Image
      </h2>

      {/* File input */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          min={10}
          max={3600}
          value={deleteAfter}
          onChange={(e) => setDeleteAfter(e.target.value)}
          className="w-24 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Delete after (s)"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
        {uploadedFile && (
          <button
            onClick={handleReset}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-1"
          >
            <Trash className="w-4 h-4" /> Reset
          </button>
        )}
      </div>

      {/* Status Messages */}
      {status === "uploading" && (
        <p className="mt-4 text-sm text-blue-600">Uploading file...</p>
      )}
      {status === "success" && (
        <div className="mt-4 flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" /> {message}
          <div className="ml-2 text-sm text-gray-500 break-words">
            Path: {uploadedFile?.file_path}
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" /> {message}
        </div>
      )}
    </div>
  );
};

export default UploadFile;
