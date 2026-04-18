"use client";

import { useState, useEffect } from "react";

const MESSAGES = [
  "夜ご飯を見つめています…",
  "今夜のフクロウを呼んでいます…",
  "あなたのごはんから、フクロウが生まれようとしています…",
  "夜空の向こうから、一羽が近づいています…",
  "もうすぐ会えます…",
];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
      setFadeKey((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-screen-enter flex flex-col items-center justify-center flex-1 px-6 py-12">
      {/* Moon */}
      <div className="mb-10 relative">
        <div
          className="animate-moon-glow"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, #fef3c7, #f0c040, #d97706)",
            position: "relative",
          }}
        >
          {/* Moon spots */}
          <div
            style={{
              position: "absolute",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.08)",
              top: "25px",
              left: "30px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.06)",
              top: "55px",
              left: "60px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.05)",
              top: "70px",
              left: "35px",
            }}
          />
        </div>
        {/* Spinning ring */}
        <div
          className="animate-spin-slow"
          style={{
            position: "absolute",
            inset: "-16px",
            border: "2px dashed rgba(240, 192, 64, 0.2)",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* Message */}
      <div className="h-16 flex items-center justify-center" aria-live="polite">
        <p
          key={fadeKey}
          className="text-base text-center animate-message-fade"
          style={{ color: "var(--text-secondary)" }}
        >
          {MESSAGES[messageIndex]}
        </p>
      </div>

      {/* Loading dots */}
      <div className="loading-dots mt-6">
        <span />
        <span />
        <span />
      </div>

      <p
        className="text-xs mt-8"
        style={{ color: "var(--text-muted)" }}
      >
        少しだけお待ちください
      </p>
    </div>
  );
}