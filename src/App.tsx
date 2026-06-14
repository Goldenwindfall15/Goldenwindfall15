import { useEffect, useMemo, useState } from "react";
import type { LunchRecord, Rank, User } from "./types";
import {
  addRecord,
  deleteRecord,
  loadRecords,
  loadUser,
  saveUser,
} from "./storage";
import { getRankProgress, RANKS } from "./gamification";
import { Login } from "./components/Login";
import { Home } from "./components/Home";
import { RecordFlow } from "./components/RecordFlow";
import { RecordsList } from "./components/RecordsList";
import { MapView } from "./components/MapView";
import { Profile } from "./components/Profile";
import { StarRating } from "./components/StarRating";

type Tab = "home" | "records" | "map" | "profile";

export function App() {
  const [user, setUser] = useState<User | null>(() => loadUser());
  const [records, setRecords] = useState<LunchRecord[]>(() => loadRecords());
  const [tab, setTab] = useState<Tab>("home");
  const [recording, setRecording] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState<Rank | null>(null);

  // ユーザー固有の記録のみ表示
  const myRecords = useMemo(
    () => (user ? records.filter((r) => r.userId === user.id) : []),
    [records, user]
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function handleLogin(u: User) {
    saveUser(u);
    setUser(u);
    setTab("home");
  }

  function handleLogout() {
    saveUser(null);
    setUser(null);
    setRecording(false);
  }

  function handleComplete(record: LunchRecord) {
    const before = myRecords.length;
    const next = addRecord(record);
    setRecords(next);
    setRecording(false);
    setTab("records");

    // レベルアップ判定
    const after = before + 1;
    const beforeLevel = getRankProgress(before).current.level;
    const afterRank = getRankProgress(after).current;
    if (afterRank.level > beforeLevel) {
      setLevelUp(afterRank);
    } else {
      setToast("押忍！記録したぜ💢");
    }
  }

  function handleDelete(id: string) {
    if (!confirm("この記録を削除するか？")) return;
    setRecords(deleteRecord(id));
    setToast("削除した");
  }

  async function shareText(text: string) {
    try {
      if (navigator.share) {
        await navigator.share({ title: "俺のランチ", text });
        return;
      }
    } catch {
      // ユーザーがキャンセルした等。クリップボードにフォールバック。
    }
    try {
      await navigator.clipboard.writeText(text);
      setToast("クリップボードにコピーしたぜ📋");
    } catch {
      setToast("共有に対応していない端末だ");
    }
  }

  function shareRecord(r: LunchRecord) {
    const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
    const text =
      `【俺のランチ】${r.place.name}\n` +
      `${stars}` +
      (r.foodName ? `\n🍴 ${r.foodName}` : "") +
      (r.comment ? `\n💬 ${r.comment}` : "") +
      `\n#俺のランチ`;
    void shareText(text);
  }

  function shareProfile() {
    const p = getRankProgress(myRecords.length);
    const text =
      `俺は「${p.current.title}」${p.current.emoji}（Lv.${p.current.level}）！\n` +
      `ランチ記録 ${myRecords.length} 件、制覇した店 ${
        new Set(myRecords.map((r) => r.place.id)).size
      } 軒。\n押忍！目指せ伝説のランチ番長！\n#俺のランチ`;
    void shareText(text);
  }

  if (!user) {
    return (
      <div className="app">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  const progress = getRankProgress(myRecords.length);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="logo">俺</div>
          <div className="titles">
            <div className="title">俺のランチ</div>
            <div className="sub">
              {progress.current.emoji} {progress.current.title}・Lv.{progress.current.level}
            </div>
          </div>
        </div>
        <button
          className="avatar"
          onClick={() => setTab("profile")}
          aria-label="プロフィール"
        >
          {user.picture ? <img src={user.picture} alt="" /> : user.name.slice(0, 1)}
        </button>
      </header>

      <main className="content">
        {recording ? (
          <RecordFlow
            userId={user.id}
            onComplete={handleComplete}
            onCancel={() => setRecording(false)}
          />
        ) : (
          <>
            {tab === "home" && (
              <Home
                userName={user.name}
                records={myRecords}
                onStart={() => setRecording(true)}
              />
            )}
            {tab === "records" && (
              <RecordsList
                records={myRecords}
                onDelete={handleDelete}
                onShare={shareRecord}
                onStart={() => setRecording(true)}
              />
            )}
            {tab === "map" && <MapView records={myRecords} />}
            {tab === "profile" && (
              <Profile
                user={user}
                records={myRecords}
                onShareProfile={shareProfile}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </main>

      {!recording && (
        <nav className="nav">
          <NavButton active={tab === "home"} onClick={() => setTab("home")} ico="🏠" label="ホーム" />
          <NavButton active={tab === "records"} onClick={() => setTab("records")} ico="📒" label="記録" />
          <NavButton active={tab === "map"} onClick={() => setTab("map")} ico="🗺️" label="MAP" />
          <NavButton active={tab === "profile"} onClick={() => setTab("profile")} ico="💢" label="番長" />
        </nav>
      )}

      {toast && <div className="toast">{toast}</div>}

      {levelUp && <LevelUp rank={levelUp} onClose={() => setLevelUp(null)} />}
    </div>
  );
}

function NavButton({
  active,
  onClick,
  ico,
  label,
}: {
  active: boolean;
  onClick: () => void;
  ico: string;
  label: string;
}) {
  return (
    <button className={active ? "active" : ""} onClick={onClick}>
      <span className="ico">{ico}</span>
      <span>{label}</span>
    </button>
  );
}

function LevelUp({ rank, onClose }: { rank: Rank; onClose: () => void }) {
  const isMax = rank.level === RANKS[RANKS.length - 1].level;
  return (
    <div className="levelup" onClick={onClose}>
      <div>
        <div className="burst">＼ LEVEL UP ／</div>
        <div className="new-emoji">{rank.emoji}</div>
        <div className="new-title">{rank.title}</div>
        <div className="rank-phrase" style={{ marginTop: 8 }}>
          「{rank.catchphrase}」
        </div>
        <div style={{ marginTop: 6 }}>
          <StarRating value={5} readOnly />
        </div>
        <p className="hint" style={{ marginTop: 18 }}>
          {isMax ? "押忍！頂点に立った！" : "称号を獲得した！押忍！タップで閉じる"}
        </p>
      </div>
    </div>
  );
}
