import type { CheckInState } from "@/domain/tools/types";

const options: Array<{ id: CheckInState; label: string; symbol: string }> = [
  { id: "okay", label: "I'm okay", symbol: "●" },
  { id: "off", label: "A bit off", symbol: "○" },
  { id: "overwhelmed", label: "Overwhelmed", symbol: "◒" },
  { id: "anxious", label: "Anxious", symbol: "△" },
  { id: "sad", label: "Sad", symbol: "▽" },
  { id: "angry", label: "Angry", symbol: "◇" },
  { id: "support", label: "I need support", symbol: "♡" }
];

export function CheckIn({
  value,
  onChange
}: {
  value: CheckInState | null;
  onChange: (value: CheckInState) => void;
}) {
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
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
