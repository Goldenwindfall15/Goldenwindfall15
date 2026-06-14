import { useEffect, useRef, useState } from "react";
import type { LunchRecord, Place } from "../types";
import { fetchNearbyPlaces, getCurrentPosition } from "../api/places";
import { uid } from "../storage";
import { StarRating } from "./StarRating";
import { pickFoodEmoji } from "./foodEmoji";

interface Props {
  userId: string;
  onComplete: (record: LunchRecord) => void;
  onCancel: () => void;
}

type Step = 0 | 1 | 2 | 3;

/**
 * ランチ記録フロー
 *  Step0: 位置情報からお店を選ぶ
 *  Step1: 写真 or 食べたものを記録
 *  Step2: 5つ星評価
 *  Step3: 一言コメントして保存
 */
export function RecordFlow({ userId, onComplete, onCancel }: Props) {
  const [step, setStep] = useState<Step>(0);

  // Step0: お店
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [manualName, setManualName] = useState("");

  // Step1: 写真 / 食べたもの
  const [photo, setPhoto] = useState<string | undefined>();
  const [foodName, setFoodName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Step2: 評価
  const [rating, setRating] = useState(0);

  // Step3: コメント
  const [comment, setComment] = useState("");

  useEffect(() => {
    void loadPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPlaces() {
    setLoadingPlaces(true);
    setGeoError(null);
    try {
      const pos = await getCurrentPosition();
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });
      const list = await fetchNearbyPlaces(latitude, longitude);
      setPlaces(list);
      if (list.length === 0) {
        setGeoError("近くにお店が見つからなかった。下から手入力で登録できるぜ。");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "位置情報の取得に失敗した";
      setGeoError(`${msg}。手入力でお店を登録できるぜ。`);
    } finally {
      setLoadingPlaces(false);
    }
  }

  function chooseManual() {
    const name = manualName.trim();
    if (!name) return;
    const place: Place = {
      id: uid("manual-"),
      name,
      lat: coords?.lat ?? 0,
      lng: coords?.lng ?? 0,
      category: "manual",
    };
    setSelected(place);
    setStep(1);
  }

  function onPhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function save() {
    if (!selected) return;
    const record: LunchRecord = {
      id: uid("rec_"),
      userId,
      place: selected,
      date: new Date().toISOString(),
      rating,
      photo,
      foodName: photo ? undefined : foodName.trim() || undefined,
      comment: comment.trim() || undefined,
    };
    onComplete(record);
  }

  return (
    <div>
      <Steps step={step} />

      {step === 0 && (
        <div className="panel">
          <div className="section-title">① お店を選ぶ</div>

          {loadingPlaces ? (
            <div className="center-load">
              <span className="spinner" />
              <p>現在地から近くのお店を偵察中…</p>
            </div>
          ) : (
            <>
              {geoError && <div className="error-box">{geoError}</div>}

              {places.length > 0 && (
                <div className="place-list">
                  {places.map((p) => (
                    <button
                      key={p.id}
                      className={`place-item ${selected?.id === p.id ? "selected" : ""}`}
                      onClick={() => setSelected(p)}
                    >
                      <span className="place-pin">📍</span>
                      <span>
                        <div className="place-name">{p.name}</div>
                        <div className="place-meta">
                          {p.category ? `${p.category}・` : ""}
                          {p.distance != null ? `約${p.distance}m` : ""}
                        </div>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <label className="field" style={{ marginTop: 16 }}>
                <span>リストに無い場合は手入力</span>
                <input
                  type="text"
                  placeholder="お店の名前を入力"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                />
              </label>

              <div className="record-actions">
                <button className="btn btn-ghost" onClick={onCancel}>
                  やめる
                </button>
                {manualName.trim() ? (
                  <button className="btn btn-primary btn-block" onClick={chooseManual}>
                    このお店で記録 →
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-block"
                    disabled={!selected}
                    onClick={() => setStep(1)}
                  >
                    このお店で記録 →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {step === 1 && selected && (
        <div className="panel">
          <div className="section-title">② 食べたものを記録</div>
          <p className="hint">{selected.name} に到着！食べる前に1枚どうだ？</p>

          {photo ? (
            <div className="photo-preview">
              <img src={photo} alt="食べたもの" />
            </div>
          ) : foodName.trim() ? (
            <div className="food-illust">
              <div>
                <div className="bowl">{pickFoodEmoji(foodName)}</div>
                <div className="fname">{foodName}</div>
              </div>
            </div>
          ) : (
            <div className="photo-drop">
              📷 写真を撮るか、食べたものを入力するとイメージ図ができるぜ
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={onPhotoPick}
          />

          <div className="record-actions">
            <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
              📷 {photo ? "撮り直す" : "写真を撮る"}
            </button>
            {photo && (
              <button className="btn btn-ghost" onClick={() => setPhoto(undefined)}>
                写真を消す
              </button>
            )}
          </div>

          {!photo && (
            <label className="field">
              <span>写真が撮れない時は、食べたものを入力</span>
              <input
                type="text"
                placeholder="例）味噌ラーメン 大盛り"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
              />
            </label>
          )}

          <div className="record-actions">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>
              ← 戻る
            </button>
            <button
              className="btn btn-primary btn-block"
              disabled={!photo && !foodName.trim()}
              onClick={() => setStep(2)}
            >
              食べ終わった → 評価へ
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="panel">
          <div className="section-title">③ 5つ星で評価</div>
          <p className="hint" style={{ textAlign: "center" }}>
            このランチ、何点だ？押忍！
          </p>
          <div style={{ margin: "20px 0" }}>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="record-actions">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>
              ← 戻る
            </button>
            <button
              className="btn btn-primary btn-block"
              disabled={rating === 0}
              onClick={() => setStep(3)}
            >
              次へ →
            </button>
          </div>
        </div>
      )}

      {step === 3 && selected && (
        <div className="panel">
          <div className="section-title">④ 一言コメントして保存</div>
          <p className="hint">
            {selected.name}・
            <StarRating value={rating} readOnly />
          </p>
          <label className="field">
            <span>一言コメント（仲間への伝言）</span>
            <textarea
              rows={3}
              placeholder="例）替え玉無料は神。次は辛さ増しでいくぜ。"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </label>
          <div className="record-actions">
            <button className="btn btn-ghost" onClick={() => setStep(2)}>
              ← 戻る
            </button>
            <button className="btn btn-primary btn-block" onClick={save}>
              押忍！記録する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Steps({ step }: { step: Step }) {
  const labels = ["店", "飯", "評", "言"];
  return (
    <div className="steps">
      {labels.map((l, i) => (
        <span key={i} style={{ display: "contents" }}>
          <span
            className={`step-dot ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
          >
            {i < step ? "✓" : l}
          </span>
          {i < labels.length - 1 && <span className="step-bar" />}
        </span>
      ))}
    </div>
  );
}
