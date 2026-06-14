import type { User } from "../types";
import { uid } from "../storage";

// Googleアカウント連携のモック。
// 実運用では Google Identity Services (GIS) のトークンを検証して
// User を組み立てる。ここではログイン体験を再現するスタブを用意する。
//
// 環境変数 VITE_GOOGLE_CLIENT_ID が設定されていれば、将来的に
// 本物の GIS フローへ差し替えられるようにしてある。

export function isGoogleConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
}

/** モックのGoogleログイン。名前を受け取ってUserを生成する。 */
export async function mockGoogleSignIn(name: string): Promise<User> {
  const clean = name.trim() || "ランチ番長";
  // 体験としてのわずかな待ち時間
  await new Promise((r) => setTimeout(r, 350));
  return {
    id: uid("u_"),
    name: clean,
    email: `${clean.replace(/\s+/g, "").toLowerCase()}@gmail.com`,
  };
}
