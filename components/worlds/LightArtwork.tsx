import { lightThreadPoint, type LightGesture } from "@/domain/worlds/livingLight";

export function LightArtwork({ gesture = { x: .5, y: .5, held: false, spread: 1, rotation: 0 }, note = -1 }: { gesture?: LightGesture; note?: number }) {
  return <svg className="light-static" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true">
    <rect width="1000" height="650" fill="#081421" />
    {Array.from({ length: 32 }, (_, thread) => {
      const points = Array.from({ length: 64 }, (_, step) => { const p = lightThreadPoint(thread * 3, step, 0, gesture.held ? 1 : 0, gesture); return `${step ? "L" : "M"}${p.x * 1000},${p.y * 650}`; }).join(" ");
      const musical = thread % 4 === 2, group = Math.floor(thread / 4);
      return <path key={thread} d={points} fill="none" stroke={group % 3 === 0 ? "#c0abde" : group % 3 === 1 ? "#8edcc9" : "#d8c796"} strokeOpacity={group === note ? .85 : musical ? .65 : .24} strokeWidth={musical ? 2.5 : 1} />;
    })}
  </svg>;
}
