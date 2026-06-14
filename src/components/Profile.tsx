import type { LunchRecord, User } from "../types";
import { RANKS, getRankProgress } from "../gamification";

interface Props {
  user: User;
  records: LunchRecord[];
  onShareProfile: () => void;
  onLogout: () => void;
}

/** プロフィール／称号画面 */
export function Profile({ user, records, onShareProfile, onLogout }: Props) {
  const progress = getRankProgress(records.length);

  return (
    <div>
      <div className="section-title">番長プロフィール</div>

      <div className="panel" style={{ textAlign: "center" }}>
        <div className="avatar" style={{ width: 72, height: 72, margin: "0 auto", fontSize: 32 }}>
          {user.picture ? <img src={user.picture} alt="" /> : user.name.slice(0, 1)}
        </div>
        <div className="rank-title" style={{ marginTop: 10 }}>
          {user.name}
        </div>
        <div className="rank-level">{user.email}</div>

        <div className="rank-banner" style={{ marginTop: 14, textAlign: "left" }}>
          <div className="rank-top">
            <div className="rank-emoji">{progress.current.emoji}</div>
            <div>
              <div className="rank-title">{progress.current.title}</div>
              <div className="rank-level">Lv.{progress.current.level}・記録 {records.length} 件</div>
            </div>
          </div>
          <div className="gauge" aria-hidden="true">
            <span style={{ width: `${Math.round(progress.ratio * 100)}%` }} />
          </div>
          <div className="gauge-label">
            {progress.next
              ? `次「${progress.next.title}」まであと ${progress.remaining} 件`
              : "最高位制覇！押忍！"}
          </div>
        </div>

        <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={onShareProfile}>
          📣 戦績を仲間に共有する
        </button>
      </div>

      <div className="section-title" style={{ marginTop: 22 }}>
        称号一覧
      </div>
      <div className="panel">
        {RANKS.map((r) => {
          const reached = records.length >= r.required;
          const isCurrent = r.level === progress.current.level;
          return (
            <div
              key={r.level}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 4px",
                borderBottom: "1px solid var(--line)",
                opacity: reached ? 1 : 0.4,
              }}
            >
              <span style={{ fontSize: 28 }}>{reached ? r.emoji : "🔒"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: isCurrent ? "var(--gold)" : "var(--ink)" }}>
                  {r.title} {isCurrent && "← 今ここ"}
                </div>
                <div className="record-sub">
                  Lv.{r.level}・記録 {r.required} 件で解放
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn btn-ghost btn-block" style={{ marginTop: 20 }} onClick={onLogout}>
        ログアウト
      </button>
    </div>
  );
}
