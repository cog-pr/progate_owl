"use client";

import { useState, useCallback, useEffect } from "react";
import StarBackground from "./components/StarBackground";
import TopScreen from "./components/TopScreen";
import CaptureScreen from "./components/CaptureScreen";
import LoadingScreen from "./components/LoadingScreen";
import ResultScreen from "./components/ResultScreen";
import HistoryScreen from "./components/HistoryScreen";

type Screen = "top" | "capture" | "loading" | "result" | "history";

interface OwlRecord {
  date: string;
  imageUrl: string;
  labels: string[];
  message: string;
}

interface OwlResult {
  image_url: string;
  labels: string[];
  message: string;
}

// ── Helpers ──────────────────────────────────────────
function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function loadHistory(): OwlRecord[] {
  try {
    const raw = localStorage.getItem("owlHistory");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: OwlRecord[]) {
  localStorage.setItem("owlHistory", JSON.stringify(history));
}

function loadTodayResult(): OwlRecord | null {
  try {
    const raw = localStorage.getItem("lastOwlResult");
    if (!raw) return null;
    const record: OwlRecord = JSON.parse(raw);
    if (record.date === getTodayStr()) return record;
    return null;
  } catch {
    return null;
  }
}

function saveTodayResult(record: OwlRecord) {
  localStorage.setItem("lastOwlResult", JSON.stringify(record));
  localStorage.setItem("lastGeneratedDate", record.date);
}

function hasGeneratedTodayCheck(): boolean {
  try {
    return localStorage.getItem("lastGeneratedDate") === getTodayStr();
  } catch {
    return false;
  }
}

// ── Main Component ───────────────────────────────────
export default function Home() {
  const [screen, setScreen] = useState<Screen>("top");
  const [hasGeneratedToday, setHasGeneratedToday] = useState(false);
  const [history, setHistory] = useState<OwlRecord[]>([]);
  const [currentResult, setCurrentResult] = useState<OwlRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    setHasGeneratedToday(hasGeneratedTodayCheck());
    setHistory(loadHistory());
    const todayResult = loadTodayResult();
    if (todayResult) {
      setCurrentResult(todayResult);
    }
  }, []);

  // Navigate to capture
  const handleStartCapture = useCallback(() => {
    setScreen("capture");
    setError(null);
  }, []);

  // View today's owl (already generated)
  const handleViewTodayOwl = useCallback(() => {
    if (currentResult) {
      setScreen("result");
    }
  }, [currentResult]);

  // Navigate to history
  const handleShowHistory = useCallback(() => {
    setScreen("history");
  }, []);

  // Navigate to top
  const handleGoTop = useCallback(() => {
    setScreen("top");
    setError(null);
  }, []);

  // Submit photo and generate owl
  const handleSubmitPhoto = useCallback(async (file: File) => {
    setScreen("loading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/generate-owl", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "フクロウの生成に失敗しました");
      }

      const data: OwlResult = await res.json();

      const record: OwlRecord = {
        date: getTodayStr(),
        imageUrl: data.image_url,
        labels: data.labels,
        message: data.message,
      };

      // Save to localStorage
      saveTodayResult(record);
      const updatedHistory = [...loadHistory(), record];
      saveHistory(updatedHistory);

      // Update state
      setCurrentResult(record);
      setHistory(updatedHistory);
      setHasGeneratedToday(true);
      setScreen("result");
    } catch (err) {
      console.error("Generation failed:", err);
      setError(
        err instanceof Error ? err.message : "フクロウの生成に失敗しました"
      );
      setScreen("capture");
    }
  }, []);

  return (
    <div className="relative flex flex-col flex-1 min-h-dvh">
      <main className="relative z-10 flex flex-col flex-1 w-full max-w-lg mx-auto">
        {screen === "top" && (
          <TopScreen
            hasGeneratedToday={hasGeneratedToday}
            onStartCapture={handleStartCapture}
            onShowHistory={handleShowHistory}
            onViewTodayOwl={handleViewTodayOwl}
            historyCount={history.length}
          />
        )}

        {screen === "capture" && (
          <>
            <CaptureScreen
              onSubmit={handleSubmitPhoto}
              onBack={handleGoTop}
            />
            {error && (
              <div
                className="mx-6 mb-4 px-4 py-3 text-sm text-center"
                style={{
                  color: "#f87171",
                  background: "rgba(248, 113, 113, 0.1)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid rgba(248, 113, 113, 0.2)",
                }}
                role="alert"
              >
                {error}
                <button
                  onClick={() => setError(null)}
                  className="block mx-auto mt-2 text-xs underline"
                  style={{ color: "var(--text-muted)" }}
                >
                  閉じる
                </button>
              </div>
            )}
          </>
        )}

        {screen === "loading" && <LoadingScreen />}

        {screen === "result" && currentResult && (
          <ResultScreen
            imageUrl={currentResult.imageUrl}
            labels={currentResult.labels}
            message={currentResult.message}
            onGoTop={handleGoTop}
            onShowHistory={handleShowHistory}
          />
        )}

        {screen === "history" && (
          <HistoryScreen history={history} onGoTop={handleGoTop} />
        )}
      </main>

      <StarBackground />
    </div>
  );
}
