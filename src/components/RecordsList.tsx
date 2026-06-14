import type { LunchRecord } from "../types";
import { StarRating } from "./StarRating";
import { pickFoodEmoji } from "./foodEmoji";

interface Props {
  records: LunchRecord[];
  onDelete: (id: string) => void;
  onShare: (record: LunchRecord) => void;
  onStart: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

/** 記録一覧画面 */
export function RecordsList({ records, onDelete, onShare, onStart }: Props) {
  if (records.length === 0) {
    return (
      <div>
        <div className="section-title">ランチ記録</div>
        <div className="empty panel">
          <div className="big">🍱</div>
          <div className="msg">
            まだ記録がねぇ。
            <br />
            ホームの「GO」ボタンから最初のランチを刻め！
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onStart}>
            記録を始める
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-title">ランチ記録（{records.length}件）</div>
      {records.map((r) => (
        <div className="record-card" key={r.id}>
          {r.photo ? (
            <div
              className="record-photo"
              style={{ backgroundImage: `url(${r.photo})` }}
            >
              <div className="rating-badge">
                <StarRating value={r.rating} readOnly />
              </div>
            </div>
          ) : (
            <div className="food-illust" style={{ borderRadius: 0, borderWidth: "0 0 2px 0" }}>
              <div>
                <div className="bowl">{pickFoodEmoji(r.foodName ?? r.place.category)}</div>
                {r.foodName && <div className="fname">{r.foodName}</div>}
              </div>
            </div>
          )}
          <div className="record-body">
            <div className="record-name">{r.place.name}</div>
            <div className="record-sub">
              {formatDate(r.date)}　<StarRating value={r.rating} readOnly />
            </div>
            {r.comment && <div className="record-comment">{r.comment}</div>}
            <div className="record-actions">
              <button className="btn btn-ghost" onClick={() => onShare(r)}>
                📣 共有
              </button>
              <button className="link-btn" onClick={() => onDelete(r.id)}>
                削除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
