"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import StarBackground from "./components/StarBackground";
import TopScreen from "./components/TopScreen";
import CaptureScreen from "./components/CaptureScreen";
import LoadingScreen from "./components/LoadingScreen";
import ResultScreen from "./components/ResultScreen";
import LoginModal from "./components/LoginModal";
import {
  getCurrentUser,
  logoutUser,
  historyKey,
  todayResultKey,
  generatedDateKey,
} from "./lib/authUtils";

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

import { getDB, setDB } from "./lib/dbUtils";

// ─── User-scoped Storage Helpers ─────────────────────

async function loadHistory(email: string): Promise<OwlRecord[]> {
  try {
    const records = await getDB<OwlRecord[]>(historyKey(email));
    return records || [];
  } catch {
    return [];
  }
}

async function saveHistory(email: string, history: OwlRecord[]) {
  try {
    await setDB(historyKey(email), history);
  } catch (err) {
    console.error("Failed to save history to DB:", err);
  }
}

async function loadTodayResult(email: string): Promise<OwlRecord | null> {
  try {
    const record = await getDB<OwlRecord>(todayResultKey(email));
    if (record && record.date === getTodayStr()) return record;
    return null;
  } catch {
    return null;
  }
}

async function saveTodayResult(email: string, record: OwlRecord) {
  try {
    await setDB(todayResultKey(email), record);
    localStorage.setItem(generatedDateKey(email), record.date);
  } catch (err) {
    console.error("Failed to save today result to DB:", err);
  }
}

function hasGeneratedTodayCheck(email: string): boolean {
  try {
    return localStorage.getItem(generatedDateKey(email)) === getTodayStr();
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
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  // ─── 初期化: ログイン状態の復元 ─────────────────────
  useEffect(() => {
    const init = async () => {
      const user = getCurrentUser();
      if (user) {
        setLoggedInUser(user);
        setHasGeneratedToday(hasGeneratedTodayCheck(user));
        
        const [loadedHistory, todayResult] = await Promise.all([
          loadHistory(user),
          loadTodayResult(user)
        ]);

        setHistory(loadedHistory);
        if (todayResult) {
          setCurrentResult(todayResult);
        }
      }
      setAuthChecked(true);
    };
    init();
  }, []);

  // ─── ログイン成功時: ユーザーデータを読み込む ───────
  const handleLogin = useCallback(async (email: string) => {
    setLoggedInUser(email);
    setHasGeneratedToday(hasGeneratedTodayCheck(email));
    
    const [loadedHistory, todayResult] = await Promise.all([
      loadHistory(email),
      loadTodayResult(email)
    ]);

    setHistory(loadedHistory);
    setCurrentResult(todayResult);
    
    setScreen("top");
    setError(null);
  }, []);

  // ─── ログアウト ─────────────────────────────────────
  const handleLogout = useCallback(() => {
    logoutUser();
    setLoggedInUser(null);
    setHasGeneratedToday(false);
    setHistory([]);
    setCurrentResult(null);
    setScreen("top");
    setError(null);
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

  const handleSubmitPhoto = useCallback(
    async (file: File) => {
      if (!loggedInUser) return;

      setScreen("loading");
      setError(null);

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/generate-owl", {
          method: "POST",
          body: formData,
        });

        console.log("res");
        console.log(res);

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error || "フクロウの生成に失敗しました");
        }

        const data: OwlResult = await res.json();

        console.log("data");
        console.log(data);

        const record: OwlRecord = {
          date: getTodayStr(),
          imageUrl: data.image_url,
          labels: data.labels || [],
          message: data.message || "",
        };

        await saveTodayResult(loggedInUser, record);

        const currentHistory = await loadHistory(loggedInUser);
        const updatedHistory = [...currentHistory, record];
        await saveHistory(loggedInUser, updatedHistory);

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
    },
    [loggedInUser]
  );

  // 認証チェックが完了するまではスプラッシュ表示
  if (!authChecked) {
    return (
      <div className="relative flex flex-col flex-1 min-h-dvh">
        <StarBackground />
      </div>
    );
  }

  // ─── ホーム（ランディング）画面 ───────────
  if (showLanding) {
    return (
      <div className="relative flex flex-col flex-1 min-h-dvh items-center justify-center p-6 text-center z-10">
        <StarBackground />
        
        <div className="animate-float-slow mb-6">
          <svg
            width="80"
            height="80"
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="フクロウアイコン"
          >
            <ellipse cx="48" cy="56" rx="28" ry="30" fill="#1a1e3a" stroke="#f0c040" strokeWidth="2" />
            <circle cx="48" cy="32" r="22" fill="#1a1e3a" stroke="#f0c040" strokeWidth="2" />
            <path d="M30 16L36 26" stroke="#f0c040" strokeWidth="2" strokeLinecap="round" />
            <path d="M66 16L60 26" stroke="#f0c040" strokeWidth="2" strokeLinecap="round" />
            <circle cx="39" cy="32" r="8" fill="#0a0e27" stroke="#f0c040" strokeWidth="1.5" />
            <circle cx="57" cy="32" r="8" fill="#0a0e27" stroke="#f0c040" strokeWidth="1.5" />
            <circle cx="40" cy="31" r="3" fill="#f0c040" />
            <circle cx="58" cy="31" r="3" fill="#f0c040" />
            <circle cx="41" cy="30" r="1" fill="white" />
            <circle cx="59" cy="30" r="1" fill="white" />
            <path d="M45 38L48 42L51 38" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinejoin="round" />
            <path d="M20 52C16 56 16 66 22 70" stroke="#f0c040" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M76 52C80 56 80 66 74 70" stroke="#f0c040" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <ellipse cx="48" cy="64" rx="12" ry="14" fill="none" stroke="rgba(240,192,64,0.3)" strokeWidth="1" />
            <ellipse cx="48" cy="60" rx="8" ry="10" fill="none" stroke="rgba(240,192,64,0.15)" strokeWidth="1" />
          </svg>
        </div>

        <h1 
          className="text-5xl font-bold mb-4 animate-fade-in-up" 
          style={{ color: "var(--accent-gold)", letterSpacing: "0.05em" }}
        >
          Owl Snap
        </h1>
        <p 
          className="text-base mb-8 animate-fade-in-up delay-100 max-w-md leading-relaxed" 
          style={{ color: "var(--text-secondary)" }}
        >
          夜ご飯を撮って、あなただけのフクロウを生み出そう。<br />
          忙しい日でも、夜ご飯くらいはちゃんと食べよう。
        </p>
        <button
          className="btn-gold animate-fade-in-up delay-200 animate-pulse-glow"
          onClick={() => setShowLanding(false)}
        >
          アプリを始める
        </button>
      </div>
    );
  }

  // ─── 未ログイン: ログイン画面を全画面表示 ───────────
  if (!loggedInUser) {
    return (
      <div className="relative flex flex-col flex-1 min-h-dvh">
        <StarBackground />
        <LoginModal onLogin={handleLogin} required />
      </div>
    );
  }

  // ─── ログイン済み: アプリ本体 ──────────────────────
  return (
    <div className="relative flex flex-col flex-1 min-h-dvh">
      <StarBackground />

      {/* ログインバー（画面右上固定） */}
      <div className="login-top-bar">
        <div className="login-user-badge">
          <span className="login-user-avatar">🦉</span>
          <span className="login-user-name">{loggedInUser}</span>
          <button
            onClick={handleLogout}
            className="login-logout-btn"
            id="logout-btn"
          >
            ログアウト
          </button>
        </div>
      </div>

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