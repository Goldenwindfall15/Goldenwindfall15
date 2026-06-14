interface Props {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}

/** 5つ星評価。readOnly のときは表示専用。 */
export function StarRating({ value, onChange, readOnly }: Props) {
  if (readOnly) {
    return (
      <span className="stars-sm" aria-label={`評価 ${value} / 5`}>
        {"★".repeat(value)}
        {"☆".repeat(5 - value)}
      </span>
    );
  }
  return (
    <div className="stars" role="radiogroup" aria-label="5段階評価">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${n <= value ? "on" : ""}`}
          aria-label={`${n}つ星`}
          aria-pressed={n <= value}
          onClick={() => onChange?.(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
