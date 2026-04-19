/**
 * 認証ユーティリティ（localStorage ベース）
 *
 * - ユーザー一覧: fukurou_users  →  { username, passwordHash }[]
 * - ログイン中ユーザー: fukurou_current_user  →  username string
 * - ユーザーごとのデータキー: owlHistory_{username}, lastOwlResult_{username}, lastGeneratedDate_{username}
 */

// ─── Types ───────────────────────────────────────────
export interface StoredUser {
  username: string;
  passwordHash: string;
}

export type AuthResult =
  | { ok: true; username: string }
  | { ok: false; error: string };

// ─── Constants ───────────────────────────────────────
const USERS_KEY = "fukurou_users";
const CURRENT_USER_KEY = "fukurou_current_user";

// ─── Hash ────────────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Internal Helpers ────────────────────────────────
function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ─── Public API ──────────────────────────────────────

/** 新規登録 */
export async function registerUser(
  username: string,
  password: string
): Promise<AuthResult> {
  const trimmed = username.trim();

  if (!trimmed) {
    return { ok: false, error: "ユーザー名を入力してください" };
  }
  if (trimmed.length < 2) {
    return { ok: false, error: "ユーザー名は2文字以上にしてください" };
  }
  if (trimmed.length > 20) {
    return { ok: false, error: "ユーザー名は20文字以内にしてください" };
  }
  if (!password) {
    return { ok: false, error: "パスワードを入力してください" };
  }

  const users = loadUsers();
  if (users.some((u) => u.username === trimmed)) {
    return { ok: false, error: "このユーザー名は既に使われています" };
  }

  const passwordHash = await hashPassword(password);
  users.push({ username: trimmed, passwordHash });
  saveUsers(users);

  // 自動ログイン
  localStorage.setItem(CURRENT_USER_KEY, trimmed);

  return { ok: true, username: trimmed };
}

/** ログイン */
export async function loginUser(
  username: string,
  password: string
): Promise<AuthResult> {
  const trimmed = username.trim();

  if (!trimmed) {
    return { ok: false, error: "ユーザー名を入力してください" };
  }
  if (!password) {
    return { ok: false, error: "パスワードを入力してください" };
  }

  const users = loadUsers();
  const user = users.find((u) => u.username === trimmed);

  if (!user) {
    return { ok: false, error: "アカウントが見つかりません" };
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return { ok: false, error: "パスワードが正しくありません" };
  }

  localStorage.setItem(CURRENT_USER_KEY, trimmed);
  return { ok: true, username: trimmed };
}

/** ログアウト */
export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/** 現在ログイン中のユーザーを取得 */
export function getCurrentUser(): string | null {
  try {
    return localStorage.getItem(CURRENT_USER_KEY);
  } catch {
    return null;
  }
}

// ─── User-scoped Storage Keys ────────────────────────

/** ユーザーごとの owlHistory キー */
export function historyKey(username: string): string {
  return `owlHistory_${username}`;
}

/** ユーザーごとの lastOwlResult キー */
export function todayResultKey(username: string): string {
  return `lastOwlResult_${username}`;
}

/** ユーザーごとの lastGeneratedDate キー */
export function generatedDateKey(username: string): string {
  return `lastGeneratedDate_${username}`;
}
