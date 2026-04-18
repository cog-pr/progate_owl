"use client";

interface ResultScreenProps {
  imageUrl: string;
  labels: string[];
  message: string;
  onGoTop: () => void;
  onShowHistory: () => void;
}

export default function ResultScreen({
  imageUrl,
  labels,
  message,
  onGoTop,
  onShowHistory,
}: ResultScreenProps) {
  return (
    <div className="animate-screen-enter flex flex-col items-center flex-1 px-6 py-8">
      {/* Title */}
      <h2
        className="text-2xl font-bold mb-2 animate-fade-in-up"
        style={{ color: "var(--accent-gold)" }}
      >
        🌙 今日のフクロウ
      </h2>
      <p
        className="text-sm mb-6 animate-fade-in-up delay-100 text-center"
        style={{ color: "var(--text-secondary)" }}
      >
        {message}
      </p>

      {/* Owl Image */}
      <div className="w-full max-w-sm mb-6 animate-owl-reveal">
        <div className="owl-image-container">
          <img
            src={imageUrl}
            alt="今日のフクロウ"
            className="w-full aspect-square object-cover"
            id="result-owl-image"
          />
        </div>
      </div>

      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6 animate-fade-in-up delay-500">
          {labels.map((label, i) => (
            <span
              key={i}
              className="glass-card-sm px-3 py-1 text-xs"
              style={{ color: "var(--accent-gold)" }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Sub message */}
      <p
        className="text-sm text-center mb-8 animate-fade-in-up delay-700"
        style={{ color: "var(--text-muted)" }}
      >
        あなたの夜を見守る一羽です 🦉
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-sm animate-fade-in-up delay-1000">
        <button onClick={onGoTop} className="btn-gold w-full" id="result-home-btn">
          トップに戻る
        </button>
        <button onClick={onShowHistory} className="btn-ghost w-full" id="result-history-btn">
          📚 これまでのフクロウを見る
        </button>
      </div>
    </div>
  );
}