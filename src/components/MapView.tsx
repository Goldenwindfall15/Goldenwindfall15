import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { LunchRecord } from "../types";
import { StarRating } from "./StarRating";
import { pickFoodEmoji } from "./foodEmoji";

interface Props {
  records: LunchRecord[];
}

// 絵文字ピンのアイコン（バンドラでの画像パス問題を避けるため divIcon を使う）
function pinIcon(emoji: string) {
  return L.divIcon({
    className: "",
    html: `<div style="font-size:30px;line-height:1;filter:drop-shadow(0 2px 2px #000)">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  });
}

/** 記録したお店を地図上に表示する。Googleマップ的なお気に入りマップ。 */
export function MapView({ records }: Props) {
  const located = records.filter((r) => r.place.lat !== 0 || r.place.lng !== 0);

  if (located.length === 0) {
    return (
      <div>
        <div className="section-title">俺のランチMAP</div>
        <div className="empty panel">
          <div className="big">🗺️</div>
          <div className="msg">
            位置情報つきの記録がまだ無い。
            <br />
            お店を記録すると、ここに自分だけのランチマップが育つぜ。
          </div>
        </div>
      </div>
    );
  }

  // 記録の重心を中心に
  const center: [number, number] = [
    located.reduce((s, r) => s + r.place.lat, 0) / located.length,
    located.reduce((s, r) => s + r.place.lng, 0) / located.length,
  ];

  return (
    <div>
      <div className="section-title">俺のランチMAP</div>
      <div className="map-box">
        <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {located.map((r) => (
            <Marker
              key={r.id}
              position={[r.place.lat, r.place.lng]}
              icon={pinIcon(pickFoodEmoji(r.foodName ?? r.place.category))}
            >
              <Popup>
                <strong>{r.place.name}</strong>
                <br />
                <StarRating value={r.rating} readOnly />
                {r.comment && (
                  <>
                    <br />
                    {r.comment}
                  </>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <p className="hint" style={{ marginTop: 10 }}>
        記録した {located.length} 店をマップに表示中。ピンをタップで詳細が出るぜ。
      </p>
    </div>
  );
}
