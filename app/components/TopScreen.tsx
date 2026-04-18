"use client";

interface TopScreenProps {
  hasGeneratedToday: boolean;
  onStartCapture: () => void;
  onShowHistory: () => void;
  onViewTodayOwl: () => void;
  historyCount: number;
}

export default function TopScreen({
  hasGeneratedToday,
  onStartCapture,
  onShowHistory,
  onViewTodayOwl,
  historyCount,
}: TopScreenProps) {
  return (
    <div className="animate-screen-enter flex flex-1 flex-col items-center justify-center px-6 py-6 text-center">
      {/* Owl Icon */}
      <div className="animate-float-slow mb-4">
        <svg
          width="80"
          height="80"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="フクロウアイコン"
        >
          <ellipse
            cx="48"
            cy="56"
            rx="28"
            ry="30"
            fill="#1a1e3a"
            stroke="#f0c040"
            strokeWidth="2"
          />
          <circle
            cx="48"
            cy="32"
            r="22"
            fill="#1a1e3a"
            stroke="#f0c040"
            strokeWidth="2"
          />
          <path
            d="M30 16L36 26"
            stroke="#f0c040"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M66 16L60 26"
            stroke="#f0c040"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle
            cx="39"
            cy="32"
            r="8"
            fill="#0a0e27"
            stroke="#f0c040"
            strokeWidth="1.5"
          />
          <circle
            cx="57"
            cy="32"
            r="8"
            fill="#0a0e27"
            stroke="#f0c040"
            strokeWidth="1.5"
          />
          <circle cx="40" cy="31" r="3" fill="#f0c040" />
          <circle cx="58" cy="31" r="3" fill="#f0c040" />
          <circle cx="41" cy="30" r="1" fill="white" />
          <circle cx="59" cy="30" r="1" fill="white" />
          <path
            d="M45 38L48 42L51 38"
            fill="#f59e0b"
            stroke="#f59e0b"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M20 52C16 56 16 66 22 70"
            stroke="#f0c040"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M76 52C80 56 80 66 74 70"
            stroke="#f0c040"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse
            cx="48"
            cy="64"
            rx="12"
            ry="14"
            fill="none"
            stroke="rgba(240,192,64,0.3)"
            strokeWidth="1"
          />
          <ellipse
            cx="48"
            cy="60"
            rx="8"
            ry="10"
            fill="none"
            stroke="rgba(240,192,64,0.15)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Title */}
      <h1
        className="mb-2 text-3xl font-bold animate-fade-in-up"
        style={{ color: "var(--accent-gold)" }}
      >
        fukurou_app
      </h1>

      {/* Subtitle */}
      <p
        className="mb-1 text-base animate-fade-in-up delay-100"
        style={{ color: "var(--text-secondary)" }}
      >
        夜ご飯を撮ると、今日のフクロウが生まれます
      </p>

      <p
        className="mb-8 text-sm animate-fade-in-up delay-200"
        style={{ color: "var(--text-muted)" }}
      >
        忙しい日でも、夜ご飯くらいはちゃんと食べよう
      </p>

      {/* Main Action */}
      {hasGeneratedToday ? (
        <div className="animate-fade-in-up delay-300 flex flex-col items-center gap-4">
          <div
            className="glass-card-sm px-6 py-4 text-center"
            style={{ color: "var(--text-secondary)" }}
          >
            <p className="mb-1 text-sm">🦉 今日のフクロウは生まれ済みです</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              また明日の夜ご飯で会いましょう
            </p>
          </div>

          <button
            onClick={onViewTodayOwl}
            className="btn-gold"
            id="view-today-owl-btn"
          >
            今日のフクロウを見る
          </button>
        </div>
      ) : (
        <button
          onClick={onStartCapture}
          className="btn-gold animate-pulse-glow animate-fade-in-up delay-300"
          id="start-capture-btn"
        >
          🦉 今夜のフクロウを召喚する
        </button>
      )}

      {/* Forest Button */}
      <button
        onClick={onShowHistory}
        className="btn-ghost mt-6 animate-fade-in-up delay-500"
        id="show-history-btn"
      >
        🌲 フクロウの森を見る
        <span className="ml-1">
          {historyCount > 0 ? `（${historyCount}羽）` : "（まだ0羽）"}
        </span>
      </button>
    </div>
  );
}