// 食べ物の名前やジャンルから、それっぽい絵文字を選ぶ。
// 写真が撮れなかったときの「イメージ図」に使う。

const TABLE: Array<[RegExp, string]> = [
  [/ラーメン|らーめん|ramen|麺|つけ麺|noodle/i, "🍜"],
  [/寿司|鮨|sushi/i, "🍣"],
  [/カレー|curry/i, "🍛"],
  [/うどん|そば|udon|soba/i, "🍲"],
  [/牛丼|丼|どん|親子|bowl|rice/i, "🍚"],
  [/焼肉|肉|ステーキ|beef|meat|yakiniku/i, "🥩"],
  [/寿|天ぷら|天丼|フライ|揚|fry|tempura/i, "🍤"],
  [/ハンバーガー|バーガー|burger|マック|mac/i, "🍔"],
  [/ピザ|pizza/i, "🍕"],
  [/パスタ|スパゲ|pasta|イタリア|italian/i, "🍝"],
  [/定食|和食|teishoku|japanese/i, "🍱"],
  [/餃子|中華|chinese|gyoza|炒/i, "🥟"],
  [/カフェ|コーヒー|cafe|coffee/i, "☕"],
  [/パン|サンド|bread|sandwich|ベーカリー|bakery/i, "🥪"],
  [/卵|オムライス|egg|omelet/i, "🍳"],
  [/サラダ|salad|野菜|vegan/i, "🥗"],
  [/魚|刺身|海鮮|fish|seafood/i, "🐟"],
  [/鍋|hotpot|しゃぶ/i, "🍲"],
];

export function pickFoodEmoji(text?: string): string {
  if (!text) return "🍱";
  for (const [re, emoji] of TABLE) {
    if (re.test(text)) return emoji;
  }
  return "🍴";
}
