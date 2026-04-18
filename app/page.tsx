"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import StarBackground from "./components/StarBackground";
import TopScreen from "./components/TopScreen";
import CaptureScreen from "./components/CaptureScreen";
import LoadingScreen from "./components/LoadingScreen";
import ResultScreen from "./components/ResultScreen";

type Screen = "top" | "capture" | "loading" | "result";

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

export default function Home() {
  const router = useRouter();

  const [screen, setScreen] = useState<Screen>("top");
  const [hasGeneratedToday, setHasGeneratedToday] = useState(false);
  const [history, setHistory] = useState<OwlRecord[]>([]);
  const [currentResult, setCurrentResult] = useState<OwlRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHasGeneratedToday(hasGeneratedTodayCheck());
    setHistory(loadHistory());

    const todayResult = loadTodayResult();
    if (todayResult) {
      setCurrentResult(todayResult);
    }
  }, []);

  const handleStartCapture = useCallback(() => {
    setScreen("capture");
    setError(null);
  }, []);

  const handleViewTodayOwl = useCallback(() => {
    if (currentResult) {
      setScreen("result");
    }
  }, [currentResult]);

  const handleShowHistory = useCallback(() => {
    router.push("/forest");
  }, [router]);

  const handleGoTop = useCallback(() => {
    setScreen("top");
    setError(null);
  }, []);

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

      saveTodayResult(record);

      const updatedHistory = [...loadHistory(), record];
      saveHistory(updatedHistory);

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
      <StarBackground />

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
      </main>
    </div>
  );
}