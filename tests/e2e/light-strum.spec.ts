import { expect, test } from "@playwright/test";

for (const fallback of [false, true]) {
test(`light is an opt-in instrument with real plucked notes and keyboard control${fallback ? " in still SVG fallback" : ""}`, async ({ page }) => {
  if (fallback) await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((fallback: boolean) => {
    if (fallback) Object.defineProperty(HTMLCanvasElement.prototype, "getContext", { configurable: true, value: () => null });
    const NativeAudio = window.AudioContext;
    const notes: OscillatorNode[] = [];
    Object.defineProperty(window, "__lightNotes", { value: notes });
    window.AudioContext = class extends NativeAudio {
      createOscillator() { const note = super.createOscillator(); notes.push(note); return note; }
    };
  }, fallback);
  await page.goto("./");
  await expect(page.getByRole("status").filter({ hasText: "Opening your toolbox" })).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: /Living Light/ }).click();
  const notes = () => page.evaluate(() => (window as unknown as { __lightNotes: OscillatorNode[] }).__lightNotes.map(note => Math.round(note.frequency.value * 100) / 100));
  expect(await notes()).toEqual([]);
  await page.getByRole("button", { name: "Light sound" }).click();
  expect(await notes()).toEqual([]);
  const field = page.getByRole("button", { name: "Shape the light" });
  await field.press("1");
  await expect.poll(notes).toEqual([130.81]);
  await field.press("5");
  await expect.poll(notes).toEqual([130.81, 220]);
  await expect(page.locator(".living-light")).toHaveAttribute("data-note", "4");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(field).toBeDisabled();
});
}

test("touch strums play distinct notes, keep voices bounded, and stop completely on reset", async ({ page, context }) => {
  await page.addInitScript(() => {
    type Entry = { context: AudioContext; oscillator: OscillatorNode; stopAt: number; started: boolean };
    const NativeAudio = window.AudioContext, entries: Entry[] = [];
    Object.defineProperty(window, "__strumVoices", { value: entries });
    window.AudioContext = class extends NativeAudio {
      createOscillator() {
        const oscillator = super.createOscillator(), entry = { context: this, oscillator, stopAt: Infinity, started: false };
        entries.push(entry);
        const start = oscillator.start.bind(oscillator), stop = oscillator.stop.bind(oscillator);
        oscillator.start = (when = 0) => { entry.started = true; start(when); };
        oscillator.stop = (when = 0) => { entry.stopAt = when || this.currentTime; stop(when); };
        return oscillator;
      }
    };
  });
  await page.goto("./");
  await expect(page.getByRole("status").filter({ hasText: "Opening your toolbox" })).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: /Living Light/ }).click();
  await page.getByRole("button", { name: "Light sound" }).click();
  const field = page.getByRole("button", { name: "Shape the light" });
  await field.scrollIntoViewIfNeeded();
  const box = (await field.boundingBox())!;
  const session = await context.newCDPSession(page);
  const x = box.x + box.width / 2;
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: box.y + box.height * .15, id: 1 }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: box.y + box.height * .85, id: 1 }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await session.detach();
  type Entry = { context: AudioContext; oscillator: OscillatorNode; stopAt: number; started: boolean };
  const played = () => page.evaluate(() => (window as unknown as { __strumVoices: Entry[] }).__strumVoices.map(entry => entry.oscillator.frequency.value));
  await expect.poll(async () => new Set(await played()).size).toBeGreaterThan(3);
  const active = () => page.evaluate(() => (window as unknown as { __strumVoices: Entry[] }).__strumVoices.filter(entry => entry.started && entry.context.state !== "closed" && entry.stopAt > entry.context.currentTime).length);
  for (let pass = 0; pass < 4; pass++) {
    await page.waitForTimeout(200);
    for (let key = 1; key <= 8; key++) await field.press(String(key));
    expect(await active()).toBeLessThanOrEqual(8);
  }
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect.poll(active).toBe(0);
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await field.press("3");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect.poll(active).toBe(0);
  await expect(page.getByRole("button", { name: "Light sound" })).toHaveAttribute("aria-pressed", "false");
});

test("unavailable graphics and audio preserve visible keyboard shaping", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", { configurable: true, value: () => null });
    window.AudioContext = class { constructor() { throw new Error("Audio unavailable"); } } as unknown as typeof AudioContext;
  });
  await page.goto("./");
  await expect(page.getByRole("status").filter({ hasText: "Opening your toolbox" })).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: /Living Light/ }).click();
  await page.getByRole("button", { name: "Light sound" }).click();
  await expect(page.getByText("Sound unavailable. The light is still yours to shape.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Shape the light" }).press("6");
  await expect(page.locator(".living-light")).toHaveAttribute("data-note", "5");
  await expect(page.locator(".light-field svg")).toBeVisible();
});
