import { appendClearMark, rainCanvasSize, type ClearMark } from "@/domain/worlds/rain";

export function createRainEngine(canvas: HTMLCanvasElement, image: HTMLImageElement, sampleTime: () => number) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("Canvas unavailable");
  const fog = document.createElement("canvas");
  const fogContext = fog.getContext("2d");
  if (!fogContext) throw new Error("Canvas unavailable");
  let width = 1, height = 1, scale = 1;
  let marks: ClearMark[] = [];
  let running = false, still = false, destroyed = false, frame = 0, last = 0;
  let stillStarted = 0, stillOffset = 0;
  const sceneTime = () => (still ? stillStarted : sampleTime()) - stillOffset;
  const random = (n: number) => { const value = Math.sin(n * 127.1 + 31.7) * 43758.5453; return value - Math.floor(value); };

  function cover(target: CanvasRenderingContext2D) {
    if (!image.naturalWidth) return;
    const ratio = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    target.drawImage(image, (width - image.naturalWidth * ratio) / 2, (height - image.naturalHeight * ratio) / 2, image.naturalWidth * ratio, image.naturalHeight * ratio);
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
    const size = rainCanvasSize(width, height, window.devicePixelRatio);
    canvas.width = size.width; canvas.height = size.height; scale = size.scale;
    fog.width = size.width; fog.height = size.height;
    fogContext!.setTransform(scale, 0, 0, scale, 0, 0);
    fogContext!.clearRect(0, 0, width, height);
    fogContext!.filter = "blur(8px)";
    cover(fogContext!);
    fogContext!.filter = "none";
    fogContext!.fillStyle = "rgba(157,182,182,.19)";
    fogContext!.fillRect(0, 0, width, height);
    draw();
  }
  function draw() {
    if (destroyed) return;
    const ctx = context!;
    const now = sceneTime();
    marks = marks.filter(mark => now - mark.born < 24);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = .78;
    ctx.drawImage(fog, 0, 0, width, height);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "destination-out";
    for (const mark of marks) {
      const x = mark.x * width, y = mark.y * height;
      const opacity = Math.max(0, 1 - (now - mark.born) / 24);
      const radius = Math.max(28, Math.min(45, width * .06));
      const gradient = ctx.createRadialGradient(x, y, radius * .35, x, y, radius);
      gradient.addColorStop(0, `rgba(0,0,0,${opacity})`); gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    ctx.globalCompositeOperation = "source-over";
    const visualTime = now;
    for (let i = 0; i < 96; i++) {
      const x = random(i + 1) * width;
      const moving = i < 14;
      const y = (random(i + 97) * height + (moving ? visualTime * (4 + random(i + 201) * 6) : 0)) % height;
      const radius = moving ? 3.5 + random(i + 304) * 4 : 1.4 + random(i + 304) * 3.2;
      const erased = marks.some(mark => Math.hypot(mark.x * width - x, mark.y * height - y) < 27 && now - mark.born < 12);
      if (erased) continue;
      if (moving && !still) {
        const trail = ctx.createLinearGradient(0, y - 40, 0, y);
        trail.addColorStop(0, "rgba(220,236,232,0)"); trail.addColorStop(1, "rgba(220,236,232,.13)");
        ctx.strokeStyle = trail; ctx.lineWidth = radius * .6;
        ctx.beginPath(); ctx.moveTo(x, y - 40); ctx.lineTo(x, y); ctx.stroke();
      }
      ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, radius, radius * 1.35, 0, 0, Math.PI * 2); ctx.clip();
      if (image.naturalWidth) {
        const ratio = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const sx = (x - (width - image.naturalWidth * ratio) / 2) / ratio;
        const sy = (y - (height - image.naturalHeight * ratio) / 2) / ratio;
        const crop = radius * 10 / ratio;
        ctx.translate(x, y); ctx.scale(1, -1);
        ctx.drawImage(image, Math.max(0, sx - crop / 2), Math.max(0, sy - crop / 2), crop, crop, -radius, -radius * 1.35, radius * 2, radius * 2.7);
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
      }
      const lens = ctx.createRadialGradient(x - radius * .3, y - radius * .4, 0, x, y, radius * 1.5);
      lens.addColorStop(0, "rgba(237,245,231,.18)"); lens.addColorStop(.55, "rgba(6,27,30,.2)"); lens.addColorStop(1, "rgba(5,19,24,.55)");
      ctx.fillStyle = lens; ctx.fillRect(x - radius, y - radius * 1.4, radius * 2, radius * 2.8); ctx.restore();
      ctx.strokeStyle = "rgba(221,238,230,.35)"; ctx.lineWidth = .65;
      ctx.beginPath(); ctx.ellipse(x, y, radius * .7, radius, -.2, Math.PI * 1.1, Math.PI * 1.65); ctx.stroke();
    }
    canvas.dataset.marks = String(marks.length);
  }
  function tick(time: number) {
    frame = 0;
    if (!running || still || document.hidden || destroyed) return;
    if (time - last >= 1000 / 30) { last = time; draw(); }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0;
    canvas.dataset.animating = String(running && !still && !document.hidden && !destroyed);
    if (!destroyed) { draw(); if (running && !still && !document.hidden) frame = requestAnimationFrame(tick); }
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  document.addEventListener("visibilitychange", sync);
  resize();
  return {
    mark(x: number, y: number) { marks = appendClearMark(marks, x, y, sceneTime()); draw(); },
    reset() { marks = []; draw(); },
    setMotion(active: boolean, quiet: boolean) {
      if (quiet && !still) stillStarted = sampleTime();
      if (!quiet && still) stillOffset += sampleTime() - stillStarted;
      running = active; still = quiet; sync();
    },
    destroy() { destroyed = true; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener("visibilitychange", sync); marks = []; fog.width = 1; fog.height = 1; }
  };
}
