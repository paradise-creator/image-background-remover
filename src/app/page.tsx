"use client";

import { useState, useRef, useCallback } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>("");
  const [resultPreview, setResultPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      processFile(droppedFile);
    } else {
      setError("Please upload JPG, PNG or WebP image");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    // Check file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Image size cannot exceed 10MB");
      return;
    }

    setError("");
    setFile(selectedFile);
    setResultPreview("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveBackground = async () => {
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      // Convert to base64
      const base64 = await fileToBase64(file);
      const base64Data = base64.split(",")[1];

      const response = await fetch("/api/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Processing failed");
      }

      const result = await response.json();
      setResultPreview(result.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDownload = () => {
    if (!resultPreview) return;
    const link = document.createElement("a");
    link.href = resultPreview;
    link.download = "removed-bg.png";
    link.click();
  };

  const handleReset = () => {
    setFile(null);
    setOriginalPreview("");
    setResultPreview("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            🖼️ Image Background Remover
          </h1>
          <p className="text-slate-400 text-lg">
            Remove background from images instantly with AI
          </p>
        </div>

        {/* Upload Area */}
        {!originalPreview && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer
              transition-all duration-300 mb-8
              ${
                isDragging
                  ? "border-cyan-400 bg-cyan-400/10 scale-[1.02]"
                  : "border-slate-600 hover:border-purple-400 hover:bg-slate-800/50"
              }
            `}
          >
            <div className="text-6xl mb-4">📁</div>
            <p className="text-xl text-slate-300 mb-2">
              Click or drag image here
            </p>
            <p className="text-slate-500 text-sm">
              Supports JPG, PNG, WebP (max 10MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-6 py-4 rounded-xl mb-8 text-center">
            {error}
          </div>
        )}

        {/* Preview Section */}
        {originalPreview && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center justify-between bg-slate-800/50 px-6 py-3 rounded-xl">
              <span className="text-slate-300">
                📄 {file?.name} ({file ? (file.size / 1024).toFixed(1) : 0} KB)
              </span>
              <button
                onClick={handleReset}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕ Remove
              </button>
            </div>

            {/* Action Button */}
            {!resultPreview && (
              <button
                onClick={handleRemoveBackground}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing... Please wait
                  </span>
                ) : (
                  "✨ Remove Background"
                )}
              </button>
            )}

            {/* Results */}
            {resultPreview && (
              <div className="space-y-6">
                {/* Preview Images */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-3 text-center">
                      Original
                    </h3>
                    <div className="bg-white rounded-lg overflow-hidden">
                      <img
                        src={originalPreview}
                        alt="Original"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-3 text-center">
                      Result
                    </h3>
                    <div className="bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGA4A8MwNQAkNCB4h4GBgUwMDAzMDAQZIAyYGDKBqAEMDAzMOFUPAAAEGwEP/RMh9wAAAABJRU5ErkJggg==')] rounded-lg overflow-hidden">
                      <img
                        src={resultPreview}
                        alt="Result"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl font-semibold text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  ⬇️ Download PNG
                </button>

                {/* Process Another */}
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 transition-colors"
                >
                  Process Another Image
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-slate-500 text-sm">
          <p>Powered by Remove.bg API</p>
        </div>
      </div>
    </div>
  );
}
