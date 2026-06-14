import type { Place } from "../types";

// OpenStreetMap の Overpass API を使って現在地周辺の飲食店を検索する。
// APIキー不要で利用できる。失敗時は呼び出し側でフォールバックする。

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

/** 2点間の距離(m) を計算（ハバーサイン） */
export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/** 現在地を取得する Promise ラッパー */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("この端末では位置情報が使えないようだ"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}

/**
 * 指定座標の周辺(半径 radius m)にある飲食店を取得する。
 * amenity=restaurant/cafe/fast_food を対象にする。
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radius = 400
): Promise<Place[]> {
  const query = `
    [out:json][timeout:20];
    (
      node["amenity"~"restaurant|cafe|fast_food"](around:${radius},${lat},${lng});
      way["amenity"~"restaurant|cafe|fast_food"](around:${radius},${lat},${lng});
    );
    out center 40;
  `;

  const res = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error("お店の検索に失敗した (HTTP " + res.status + ")");

  const data = (await res.json()) as {
    elements: Array<{
      id: number;
      type: string;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }>;
  };

  const places: Place[] = data.elements
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      const name = el.tags?.name;
      if (elLat == null || elLng == null || !name) return null;
      return {
        id: `${el.type}/${el.id}`,
        name,
        lat: elLat,
        lng: elLng,
        category: el.tags?.cuisine ?? el.tags?.amenity,
        distance: distanceMeters(lat, lng, elLat, elLng),
      } as Place;
    })
    .filter((p): p is Place => p !== null)
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

  return places;
}
