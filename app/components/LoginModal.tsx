"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { loginUser, registerUser } from "../lib/authUtils";

type AuthTab = "login" | "register";

interface LoginModalProps {
  onClose?: () => void;
  onLogin: (username: string) => void;
  /** true の場合は閉じるボタンを非表示（ログイン必須画面） */
  required?: boolean;
  /** 初期表示タブ */
  initialTab?: AuthTab;
}

export default function LoginModal({
  onClose,
  onLogin,
  required = false,
  initialTab = "login",
}: LoginModalProps) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // タブ切替時にフォームリセット
  const switchTab = useCallback((newTab: AuthTab) => {
    setTab(newTab);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  }, []);

  // ESCで閉じる（required でない場合のみ）
  useEffect(() => {
    if (required) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, required]);

  // スクロールロック
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (tab === "register") {
        // ─── 新規登録 ───
        if (password !== confirmPassword) {
          setError("パスワードが一致しません");
          return;
        }

        setIsLoading(true);
        const result = await registerUser(username, password);
        setIsLoading(false);

        if (result.ok) {
          onLogin(result.username);
        } else {
          setError(result.error);
        }
      } else {
        // ─── ログイン ───
        setIsLoading(true);
        const result = await loginUser(username, password);
        setIsLoading(false);

        if (result.ok) {
          onLogin(result.username);
        } else {
          setError(result.error);
        }
      }
    },
    [tab, username, password, confirmPassword, onLogin]
  );

  if (!mounted) return null;

  const content = (
    <div
      className={`login-modal-overlay ${required ? "login-required-bg" : ""}`}
      onClick={required ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-label={tab === "login" ? "ログイン" : "新規登録"}
      id="login-modal"
    >
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 閉じるボタン（required でない場合のみ） */}
        {!required && (
          <button
            className="login-modal-close"
            onClick={onClose}
            aria-label="閉じる"
            id="login-modal-close-btn"
          >
            ✕
          </button>
        )}

        {/* ヘッダー */}
        <div className="login-modal-header">
          <div className="login-modal-icon">🦉</div>
          <h2 className="login-modal-title">
            {tab === "login" ? "おかえりなさい" : "はじめまして"}
          </h2>
          <p className="login-modal-subtitle">
            {tab === "login"
              ? "ユーザー名とパスワードでサインイン"
              : "アカウントを作成して始めましょう"}
          </p>
        </div>

        {/* タブ切替 */}
        <div className="login-tabs">
          <button
            className={`login-tab ${tab === "login" ? "login-tab-active" : ""}`}
            onClick={() => switchTab("login")}
            type="button"
            id="tab-login"
          >
            ログイン
          </button>
          <button
            className={`login-tab ${tab === "register" ? "login-tab-active" : ""}`}
            onClick={() => switchTab("register")}
            type="button"
            id="tab-register"
          >
            新規登録
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="login-modal-form" noValidate>
          {/* ユーザー名 */}
          <div className="login-field">
            <label htmlFor="login-username" className="login-label">
              ユーザー名
            </label>
            <input
              id="login-username"
              type="text"
              className="login-input"
              placeholder="お好きな名前を入力"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              disabled={isLoading}
              maxLength={20}
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
                autoComplete={
                  tab === "login" ? "current-password" : "new-password"
                }
                disabled={isLoading}
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "パスワードを隠す" : "パスワードを表示"
                }
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* パスワード確認（新規登録のみ） */}
          {tab === "register" && (
            <div className="login-field animate-fade-in">
              <label htmlFor="login-confirm-password" className="login-label">
                パスワード（確認）
              </label>
              <div className="login-input-wrap">
                <input
                  id="login-confirm-password"
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* パスワード注意書き（新規登録のみ） */}
          {tab === "register" && (
            <div className="login-password-warning animate-fade-in">
              <span className="login-warning-icon">⚠️</span>
              <p>
                パスワードを忘れると再設定できません。
                <br />
                大切に保管してください。
              </p>
            </div>
          )}

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
            ) : tab === "login" ? (
              "ログイン"
            ) : (
              "アカウントを作成"
            )}
          </button>
        </form>

        {/* フッター */}
        <p className="login-footer">
          {tab === "login" ? (
            <>
              アカウントをお持ちでない方は
              <button
                className="login-link"
                id="login-signup-link"
                onClick={() => switchTab("register")}
                type="button"
              >
                新規登録
              </button>
            </>
          ) : (
            <>
              既にアカウントをお持ちの方は
              <button
                className="login-link"
                id="login-signin-link"
                onClick={() => switchTab("login")}
                type="button"
              >
                ログイン
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
