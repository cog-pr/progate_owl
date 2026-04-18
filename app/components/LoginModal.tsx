"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface LoginModalProps {
  onClose: () => void;
  onLogin: (email: string) => void;
}

export default function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ESCで閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // スクロールロック
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("メールアドレスを入力してください");
      return;
    }
    if (!password) {
      setError("パスワードを入力してください");
      return;
    }

    setIsLoading(true);
    // 認証処理（現時点はダミー：1秒後にログイン成功）
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    onLogin(email);
  }, [email, password, onLogin]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="login-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="ログイン"
      id="login-modal"
    >
      <div
        className="login-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          className="login-modal-close"
          onClick={onClose}
          aria-label="閉じる"
          id="login-modal-close-btn"
        >
          ✕
        </button>

        {/* ヘッダー */}
        <div className="login-modal-header">
          <div className="login-modal-icon">🦉</div>
          <h2 className="login-modal-title">ログイン</h2>
          <p className="login-modal-subtitle">アカウントにサインインして続ける</p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="login-modal-form" noValidate>
          {/* メールアドレス */}
          <div className="login-field">
            <label htmlFor="login-email" className="login-label">
              メールアドレス
            </label>
            <input
              id="login-email"
              type="email"
              className="login-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {/* パスワード */}
          <div className="login-field">
            <label htmlFor="login-password" className="login-label">
              パスワード
            </label>
            <div className="login-input-wrap">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* エラー */}
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          {/* 送信ボタン */}
          <button
            type="submit"
            className="btn-gold login-submit"
            disabled={isLoading}
            id="login-submit-btn"
          >
            {isLoading ? (
              <span className="login-loading-dots">
                <span />
                <span />
                <span />
              </span>
            ) : (
              "ログイン"
            )}
          </button>
        </form>

        {/* フッター */}
        <p className="login-footer">
          アカウントをお持ちでない方は
          <button className="login-link" id="login-signup-link">
            新規登録
          </button>
        </p>
      </div>
    </div>,
    document.body
  );
}
