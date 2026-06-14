import { useState } from "react";
import type { User } from "../types";
import { mockGoogleSignIn, isGoogleConfigured } from "../api/auth";

interface Props {
  onLogin: (user: User) => void;
}

/** Googleアカウントでログイン（デモはモック）。 */
export function Login({ onLogin }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      const user = await mockGoogleSignIn(name);
      onLogin(user);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <div className="hero-emoji">💢🍱</div>
      <div className="hero-title">俺のランチ</div>
      <div className="hero-sub">
        〜押忍！ランチ番長〜
        <br />
        好きなランチを記録して、仲間と共有しろ。
        <br />
        記録を重ねてレベルアップ、目指せ伝説のランチ番長！
      </div>

      <div className="card panel">
        <label className="field">
          <span>呼び名（番長名）</span>
          <input
            type="text"
            placeholder="例）押忍 太郎"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <button className="google-btn" onClick={handleSignIn} disabled={loading}>
          {loading ? (
            <span className="spinner" />
          ) : (
            <>
              <GoogleMark />
              Googleでログインして始める
            </>
          )}
        </button>

        <p className="hint">
          {isGoogleConfigured()
            ? "Google連携が設定されています。"
            : "※デモ版です。ログイン情報とランチ記録はこの端末（ブラウザ）に保存されます。"}
        </p>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.3 17.6 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-17z"/>
      <path fill="#FBBC05" d="M10.3 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.8-6.1z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.5 2.1-8.8 2.1-6.4 0-11.8-3.8-13.7-9.9l-7.8 6.1C6.4 42.6 14.6 48 24 48z"/>
    </svg>
  );
}
