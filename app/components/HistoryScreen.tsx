"use client";

interface OwlRecord {
  date: string;
  imageUrl: string;
  labels: string[];
  message: string;
}

interface HistoryScreenProps {
  history: OwlRecord[];
  onGoTop: () => void;
}

export default function HistoryScreen({ history, onGoTop }: HistoryScreenProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="animate-screen-enter flex flex-col flex-1 px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoTop}
          className="text-sm flex items-center gap-1"
          style={{ color: "var(--text-secondary)" }}
          id="history-back-btn"
        >
          ← 戻る
        </button>
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          フクロウの森
        </h2>
        <div style={{ width: "40px" }} /> {/* spacer */}
      </div>

      <p
        className="text-sm text-center mb-6"
        style={{ color: "var(--text-secondary)" }}
      >
        これまでに生まれたフクロウたち（{history.length}羽）
      </p>

      {history.length > 0 ? (
        <div className="history-grid">
          {history
            .slice()
            .reverse()
            .map((record, i) => (
              <div
                key={record.date}
                className="history-card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <img
                  src={record.imageUrl}
                  alt={`${record.date}のフクロウ`}
                  loading="lazy"
                />
                <div className="date-badge">{formatDate(record.date)}</div>
              </div>
            ))}
        </div>
      ) : (
        <div className="empty-state flex-1">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              fill="none"
            />
            <text
              x="32"
              y="38"
              textAnchor="middle"
              fontSize="24"
              fill="rgba(255,255,255,0.15)"
            >
              🦉
            </text>
          </svg>
          <p className="text-base">まだフクロウはいません</p>
          <p className="text-sm">夜ご飯の写真を撮って、最初の一羽を生みましょう</p>
        </div>
      )}
    </div>
  );
}
