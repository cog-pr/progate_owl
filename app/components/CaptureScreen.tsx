"use client";

import { useRef, useState, useCallback } from "react";

interface CaptureScreenProps {
  onSubmit: (file: File) => void;
  onBack: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export default function CaptureScreen({ onSubmit, onBack }: CaptureScreenProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".heic")) {
        setError("JPEG、PNG、WebP形式の画像を選んでください");
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError("画像サイズは5MB以下にしてください");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedFile) {
      onSubmit(selectedFile);
    }
  }, [selectedFile, onSubmit]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="animate-screen-enter flex flex-col items-center flex-1 px-6 py-8">
      {/* Header */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={onBack}
          className="text-sm flex items-center gap-1"
          style={{ color: "var(--text-secondary)" }}
          id="capture-back-btn"
        >
          ← 戻る
        </button>
      </div>

      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        夜ご飯を撮影しよう
      </h2>
      <p
        className="text-sm mb-8 text-center"
        style={{ color: "var(--text-secondary)" }}
      >
        今日の夜ご飯の写真を撮ってね 📸
      </p>

      {/* Upload Area */}
      <div className="w-full max-w-md mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          id="photo-input"
        />

        {previewUrl ? (
          <div className={`upload-area has-image p-2`}>
            <img
              src={previewUrl}
              alt="選択した夜ご飯の写真"
              className="preview-image"
            />
            <button
              onClick={handleReset}
              className="w-full mt-2 text-sm py-2 text-center"
              style={{ color: "var(--text-muted)" }}
              id="reset-photo-btn"
            >
              写真を変更する
            </button>
          </div>
        ) : (
          <div
            className="upload-area flex flex-col items-center justify-center py-16 px-6"
            onClick={handleUploadClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleUploadClick()}
            id="upload-area"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className="mb-4"
              aria-hidden="true"
            >
              <rect
                x="8"
                y="12"
                width="32"
                height="24"
                rx="4"
                stroke="rgba(240,192,64,0.5)"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="7"
                stroke="rgba(240,192,64,0.5)"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="24" cy="24" r="3" fill="rgba(240,192,64,0.3)" />
              <circle cx="34" cy="17" r="2" fill="rgba(240,192,64,0.4)" />
            </svg>
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              タップして写真を撮影・選択
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              JPEG / PNG / WebP（5MB以下）
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="w-full max-w-md mb-4 px-4 py-3 text-sm text-center"
          style={{
            color: "#f87171",
            background: "rgba(248, 113, 113, 0.1)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(248, 113, 113, 0.2)",
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedFile}
        className="btn-gold w-full max-w-md"
        id="submit-photo-btn"
      >
        🌙 フクロウを生み出す
      </button>
    </div>
  );
}