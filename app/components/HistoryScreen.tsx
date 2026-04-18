"use client";

import { useState, useEffect, useCallback } from "react";

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
  const [selected, setSelected] = useState<OwlRecord | null>(null);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const closeLightbox = useCallback(() => setSelected(null), []);

  // ESCキーで閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    if (selected) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, closeLightbox]);

  // モーダル表示中はスクロールをロック
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  return (
    <>
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
                  style={{ animationDelay: `${i * 0.05}s`, cursor: "pointer" }}
                  onClick={() => setSelected(record)}
                  role="button"
                  aria-label={`${record.date}のフクロウを拡大表示`}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelected(record)}
                >
                  <img
                    src={record.imageUrl}
                    alt={`${record.date}のフクロウ`}
                    loading="lazy"
                  />
                  <div className="date-badge">{formatDateShort(record.date)}</div>
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

      {/* ライトボックスモーダル */}
      {selected && (
        <div
          className="owl-lightbox-overlay"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="フクロウ拡大表示"
          id="owl-lightbox"
        >
          <div
            className="owl-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <button
              className="owl-lightbox-close"
              onClick={closeLightbox}
              aria-label="閉じる"
              id="owl-lightbox-close-btn"
            >
              ✕
            </button>

            {/* 画像 */}
            <img
              src={selected.imageUrl}
              alt={`${selected.date}のフクロウ`}
              className="owl-lightbox-img"
            />

            {/* 情報エリア */}
            <div className="owl-lightbox-info">
              <p className="owl-lightbox-date">📅 {formatDate(selected.date)}</p>
              {selected.labels.length > 0 && (
                <div className="owl-lightbox-labels">
                  {selected.labels.map((label) => (
                    <span key={label} className="owl-lightbox-label">
                      {label}
                    </span>
                  ))}
                </div>
              )}
              {selected.message && (
                <p className="owl-lightbox-message">"{selected.message}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}