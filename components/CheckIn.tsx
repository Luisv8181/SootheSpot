import { checkInCopy, type Language } from "@/domain/i18n/copy";
import type { CheckInState } from "@/domain/tools/types";

const options: Array<{ id: CheckInState; symbol: string }> = [
  { id: "okay", symbol: "●" },
  { id: "off", symbol: "○" },
  { id: "overwhelmed", symbol: "◒" },
  { id: "anxious", symbol: "△" },
  { id: "sad", symbol: "▽" },
  { id: "angry", symbol: "◇" },
  { id: "support", symbol: "♡" }
];

export function CheckIn({
  value,
  onChange,
  language
}: {
  value: CheckInState | null;
  onChange: (value: CheckInState) => void;
  language: Language;
}) {
  const labels = checkInCopy[language];

  return (
    <div className="checkin-grid">
      {options.map((option) => (
        <button
          key={option.id}
          className={"checkin-option " + (value === option.id ? "selected" : "")}
          onClick={() => onChange(option.id)}
          aria-pressed={value === option.id}
        >
          <span className="checkin-symbol" aria-hidden="true">{option.symbol}</span>
          <span>{labels[option.id]}</span>
        </button>
      ))}
    </div>
  );
}
