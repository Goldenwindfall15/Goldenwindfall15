import type { Rank } from "./types";

/**
 * 称号テーブル。記録数が増えるほどレベルアップして
 * 「ランチ番長」へ昇格していく。押忍！
 */
export const RANKS: Rank[] = [
  { level: 1, required: 0, title: "ランチ新入り", catchphrase: "腹が減っては戦はできぬ", emoji: "🍙" },
  { level: 2, required: 3, title: "ランチ見習い", catchphrase: "今日もメシ場へ向かうぜ", emoji: "🥢" },
  { level: 3, required: 7, title: "ランチ三下", catchphrase: "舌が肥えてきたな", emoji: "🍜" },
  { level: 4, required: 15, title: "ランチ突撃隊長", catchphrase: "新店に突っ込むのが信条よ", emoji: "🔥" },
  { level: 5, required: 25, title: "ランチ若頭", catchphrase: "この界隈のメシは俺が仕切る", emoji: "🍱" },
  { level: 6, required: 40, title: "ランチ番長", catchphrase: "押忍！ランチを制する者よ", emoji: "💢" },
  { level: 7, required: 60, title: "総長", catchphrase: "我が舌に狂いなし", emoji: "⚔️" },
  { level: 8, required: 90, title: "伝説のランチ番長", catchphrase: "語り継がれる胃袋の覇者", emoji: "👑" },
];

export interface RankProgress {
  current: Rank;
  next: Rank | null;
  /** 現在の記録数 */
  count: number;
  /** 次のレベルまでの残り記録数 */
  remaining: number;
  /** 現レベル内の進捗(0-1) */
  ratio: number;
}

/** 記録数から現在の称号と進捗を計算する */
export function getRankProgress(count: number): RankProgress {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (count >= r.required) current = r;
  }
  const next = RANKS.find((r) => r.level === current.level + 1) ?? null;

  if (!next) {
    return { current, next: null, count, remaining: 0, ratio: 1 };
  }
  const span = next.required - current.required;
  const done = count - current.required;
  return {
    current,
    next,
    count,
    remaining: Math.max(0, next.required - count),
    ratio: span === 0 ? 1 : Math.min(1, done / span),
  };
}
