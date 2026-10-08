import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext;
    const contexts: AudioContext[] = [];
    const gains: GainNode[] = [];
    Object.assign(window, { audioProbe: { contexts, gains } });
    window.AudioContext = class extends Original {
      constructor(options?: AudioContextOptions) { super(options); contexts.push(this); }
      createGain() { const gain = super.createGain(); gains.push(gain); return gain; }
    };
  });
  await page.goto("./");
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: /Ocean Calm/ }).click();
});

test("ocean is silent until requested, with adjustable sound and pause/reset/exit cleanup", async ({ page }) => {
  const storage = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  let soundRequests = 0;
  page.on("request", (request) => { if (request.url().endsWith("ocean-shore.mp3")) soundRequests++; });
  const probe = () => page.evaluate(() => {
    const data = (window as unknown as { audioProbe: { contexts: AudioContext[]; gains: GainNode[] } }).audioProbe;
    return { states: data.contexts.map((context) => context.state), gains: data.gains.map((gain) => gain.gain.value) };
  });
  const sound = page.getByRole("button", { name: "Ocean sound", exact: true });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Close experience" }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator(".world-audio-credits summary")).toBeFocused();
  expect((await probe()).states).toEqual([]);
  expect(soundRequests).toBe(0);
  await page.getByRole("button", { name: "Start", exact: true }).click();
  expect((await probe()).states).toEqual([]);
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Sound is playing", { exact: true })).toBeVisible();
  expect(soundRequests).toBe(1);
  await expect.poll(async () => (await probe()).states.at(-1)).toBe("running");
  const volume = page.getByRole("slider", { name: "Sound volume" });
  await volume.fill("10");
  await expect.poll(async () => (await probe()).gains.at(-1)).toBeCloseTo(.06);
  await volume.focus();
  await page.keyboard.press("Tab");
  await expect(page.locator(".world-audio-credits summary")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: "Shore recording by Luftrum" })).toBeVisible();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect.poll(async () => (await probe()).states.at(-1)).toBe("suspended");
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect.poll(async () => (await probe()).states.at(-1)).toBe("running");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await expect.poll(async () => (await probe()).states.at(-1)).toBe("closed");
  await sound.click();
  await expect(page.getByText("Sound is playing", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close experience" }).click();
  await expect.poll(async () => (await probe()).states.at(-1)).toBe("closed");
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).toBe(storage);
});

test("failed sound shows an honest error and leaves the scene usable", async ({ page }) => {
  await page.route("**/ocean-shore.mp3", (route) => route.abort());
  await page.getByRole("button", { name: "Ocean sound", exact: true }).click();
  await expect(page.getByText("Sound couldn't load. You can try again.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ocean sound", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeEnabled();
});

test("hiding and completing the session stops audio without restarting it automatically", async ({ page }) => {
  const state = () => page.evaluate(() => (window as unknown as { audioProbe: { contexts: AudioContext[] } }).audioProbe.contexts.at(-1)?.state);
  await page.getByRole("button", { name: "Ocean sound", exact: true }).click();
  await expect(page.getByText("Sound is playing", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: "Still visuals" }).check();
  await expect.poll(state).toBe("running");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(state).toBe("suspended");
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(state).toBe("suspended");
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect.poll(state).toBe("running");
  await page.clock.install();
  await page.clock.fastForward(301000);
  await expect(page.getByRole("button", { name: "Return to Worlds", exact: true })).toBeVisible();
  await expect.poll(state).toBe("closed");
  await expect(page.getByRole("button", { name: "Ocean sound", exact: true })).toHaveAttribute("aria-pressed", "false");
});

test("turning sound off while it loads cancels playback and Spanish controls start off", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/ocean-shore.mp3", async (route) => { await gate; await route.continue().catch(() => {}); });
  const sound = page.getByRole("button", { name: "Ocean sound", exact: true });
  await sound.click();
  await expect(page.getByText("Loading sound…", { exact: true })).toBeVisible();
  await sound.click();
  release();
  await expect(page.getByText("Sound is off", { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as unknown as { audioProbe: { contexts: AudioContext[] } }).audioProbe.contexts.at(-1)?.state)).toBe("closed");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Change language" }).click();
  await page.getByRole("button", { name: /Calma del océano/ }).click();
  await expect(page.getByRole("button", { name: "Sonido del océano", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("slider", { name: "Volumen del sonido" })).toBeDisabled();
});
