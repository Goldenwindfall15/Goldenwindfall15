// アプリ全体で使うデータ型の定義

/** ログイン中のユーザー（Googleアカウント想定のモック） */
export interface User {
  id: string;
  name: string;
  email: string;
  /** プロフィール画像URL（無ければ頭文字アバターを表示） */
  picture?: string;
}

/** 近隣検索や手入力で得られたお店候補 */
export interface Place {
  /** OpenStreetMap の id（手入力の場合は "manual-xxx"） */
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** ジャンル（ramen / cafe など。分かれば表示に使う） */
  category?: string;
  /** 現在地からの距離(m) */
  distance?: number;
}

/** ランチ1回分の記録 */
export interface LunchRecord {
  id: string;
  /** 記録したユーザーID */
  userId: string;
  place: Place;
  /** 記録日時(ISO文字列) */
  date: string;
  /** 5段階評価 */
  rating: number;
  /** 食べたものの写真(dataURL)。撮れなかった場合は undefined */
  photo?: string;
  /** 写真が無いとき用：食べたものの名前 */
  foodName?: string;
  /** 一言コメント */
  comment?: string;
}

/** 称号（番長レベル） */
export interface Rank {
  level: number;
  /** その称号に到達するのに必要な記録数 */
  required: number;
  title: string;
  /** ひとことフレーバー */
  catchphrase: string;
  emoji: string;
}
