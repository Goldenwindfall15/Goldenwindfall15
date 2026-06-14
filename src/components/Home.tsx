import type { LunchRecord } from "../types";
import { getRankProgress } from "../gamification";

interface Props {
  userName: string;
  records: LunchRecord[];
  onStart: () => void;
}

/** ホーム画面。大きなGOボタンと称号バナー。 */
export function Home({ userName, records, onStart }: Props) {
  const progress = getRankProgress(records.length);
  const uniqueStores = new Set(records.map((r) => r.place.id)).size;
  const avg =
    records.length === 0
      ? 0
      : records.reduce((s, r) => s + r.rating, 0) / records.length;

  return (
    <div>
      <div className="go-wrap">
        <button className="go-button" onClick={onStart} aria-label="ランチを記録する">
          GO
          <span className="go-sub">押忍！記録</span>
        </button>
        <p className="go-caption">
          {userName} の出陣だ。
          <br />
          メシ場に入る前に「GO」を押せ。位置情報からお店を探すぜ。
        </p>
      </div>

      <div className="rank-banner">
        <div className="rank-top">
          <div className="rank-emoji">{progress.current.emoji}</div>
          <div>
            <div className="rank-title">{progress.current.title}</div>
            <div className="rank-level">Lv.{progress.current.level}</div>
          </div>
        </div>
        <div className="rank-phrase">「{progress.current.catchphrase}」</div>

        <div className="gauge" aria-hidden="true">
          <span style={{ width: `${Math.round(progress.ratio * 100)}%` }} />
        </div>
        <div className="gauge-label">
          {progress.next
            ? `次の称号「${progress.next.title}」まであと ${progress.remaining} 件`
            : "最高位！押忍！伝説に到達した！"}
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="num">{records.length}</div>
          <div className="lbl">記録数</div>
        </div>
        <div className="stat">
          <div className="num">{uniqueStores}</div>
          <div className="lbl">制覇した店</div>
        </div>
        <div className="stat">
          <div className="num">{avg ? avg.toFixed(1) : "—"}</div>
          <div className="lbl">平均評価</div>
        </div>
      </div>
    </div>
  );
}
