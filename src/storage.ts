import type { LunchRecord, User } from "./types";

// localStorage を使ったシンプルな永続化レイヤー。
// 本番ではここを Firebase / Supabase 等のバックエンドに差し替える想定。

const USER_KEY = "ore-no-lunch:user";
const RECORDS_KEY = "ore-no-lunch:records";

export function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User | null): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function loadRecords(): LunchRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as LunchRecord[];
    // 新しい順に並べる
    return list.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

export function saveRecords(records: LunchRecord[]): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function addRecord(record: LunchRecord): LunchRecord[] {
  const next = [record, ...loadRecords()];
  saveRecords(next);
  return next;
}

export function deleteRecord(id: string): LunchRecord[] {
  const next = loadRecords().filter((r) => r.id !== id);
  saveRecords(next);
  return next;
}

/** 簡易ユニークID */
export function uid(prefix = ""): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
