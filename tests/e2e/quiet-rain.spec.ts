import { expect, test } from "@playwright/test";

async function openQuietRain(page: import("@playwright/test").Page) {
  await page.goto("./");
  await expect(page.getByRole("status").filter({ hasText: "Opening your toolbox" })).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await expect(page.getByRole("button", { name: /Quiet Rain/ })).toBeVisible();
  await page.getByRole("button", { name: /Quiet Rain/ }).click();
  await expect(page.getByRole("dialog", { name: "Quiet Rain" })).toBeVisible();
  await expect(page.locator(".quiet-rain[data-artwork=ready]")).toBeVisible();
}

test("quiet rain opens with static glass, accepts keyboard and pointer clearing, and keeps marks ephemeral", async ({ page }) => {
  await openQuietRain(page);
  const canvas = page.locator(".rain-glass");
  const glass = page.getByRole("button", { name: "Clear the glass", exact: true });
  const stored = await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()));

  await expect(canvas).toHaveAttribute("data-animating", "false");
  await expect(canvas).toHaveAttribute("data-marks", "0");
  await glass.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(canvas).toHaveAttribute("data-marks", "1");
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  await expect(canvas).toHaveAttribute("data-animating", "true");

  await glass.click({ position: { x: 90, y: 130 } });
  await expect(canvas).toHaveAttribute("data-marks", "2");
  const box = (await glass.boundingBox())!;
  await page.mouse.move(box.x + 130, box.y + 150);
  await page.mouse.down();
  await page.mouse.move(box.x + 230, box.y + 180, { steps: 5 });
  await page.mouse.up();
  expect(Number(await canvas.getAttribute("data-marks"))).toBeGreaterThan(2);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-animating", "false");
  await expect(glass).toBeDisabled();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-marks", "0");
  await expect(canvas).toHaveAttribute("data-animating", "false");

  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-animating", "true");
  await page.getByRole("checkbox", { name: "Still visuals" }).check();
  await expect(canvas).toHaveAttribute("data-animating", "false");
  await page.getByRole("checkbox", { name: "Still visuals" }).uncheck();
  await expect(canvas).toHaveAttribute("data-animating", "true");
  expect(await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()))).toBe(stored);
});

test("quiet rain instructions fit below the window on short desktop viewports", async ({ page }) => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 667, height: 375 }]) {
    await page.setViewportSize(viewport);
    await openQuietRain(page);
    const windowBox = await page.locator(".rain-window").boundingBox();
    const instructionsBox = await page.locator("#rain-instructions").boundingBox();
    expect(windowBox).not.toBeNull();
    expect(instructionsBox).not.toBeNull();
    expect(instructionsBox!.y).toBeGreaterThanOrEqual(windowBox!.y + windowBox!.height);
    expect(instructionsBox!.x).toBeGreaterThanOrEqual(0);
    expect(instructionsBox!.x + instructionsBox!.width).toBeLessThanOrEqual(viewport.width);
    await page.keyboard.press("Escape");
  }
});

test("quiet rain localizes interaction instructions and controls in Spanish", async ({ page }) => {
  await openQuietRain(page);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Change language" }).click();
  await page.getByRole("navigation").getByRole("button", { name: "Mundos", exact: true }).click();
  await page.getByRole("button", { name: /Lluvia tranquila/ }).click();
  await expect(page.getByRole("button", { name: "Despejar el cristal" })).toBeVisible();
  await expect(page.getByText(/Las flechas mueven; Intro o Espacio despejan/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Sonido de lluvia" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Dejar que vuelva la niebla" })).toBeVisible();
});

test("reduced motion keeps glass unchanged over time but allows deliberate touch clearing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await openQuietRain(page);
  const glass = page.getByRole("button", { name: "Clear the glass", exact: true });
  const canvas = page.locator(".rain-glass");
  await expect(page.getByRole("checkbox", { name: "Still visuals" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Still visuals" })).toBeDisabled();
  await glass.click({ position: { x: 60, y: 90 } });
  await expect(canvas).toHaveAttribute("data-marks", "1");
  const pixels = await canvas.evaluate(node => (node as HTMLCanvasElement).toDataURL());
  await page.clock.fastForward(30_000);
  await expect(canvas).toHaveAttribute("data-animating", "false");
  expect(await canvas.evaluate(node => (node as HTMLCanvasElement).toDataURL())).toBe(pixels);
  await glass.click({ position: { x: 170, y: 210 } });
  await expect(canvas).toHaveAttribute("data-marks", "2");
});

test("rain sound failure is visible and does not block the window", async ({ page }) => {
  await page.addInitScript(() => { window.AudioContext = class { constructor() { throw new Error("Unavailable audio"); } } as unknown as typeof AudioContext; });
  await openQuietRain(page);
  await page.getByRole("button", { name: "Rain sound", exact: true }).click();
  await expect(page.getByText("Sound unavailable. Try again, or enjoy the quiet.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Rain sound", exact: true })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Clear the glass", exact: true }).click({ position: { x: 100, y: 180 } });
  await expect(page.locator(".rain-glass")).toHaveAttribute("data-marks", "1");
});

test("hiding the page suspends rain and never silently resumes it", async ({ page }) => {
  await page.addInitScript(() => {
    const NativeAudio = window.AudioContext;
    const contexts: AudioContext[] = [];
    Object.defineProperty(window, "__rainContexts", { value: contexts });
    window.AudioContext = class extends NativeAudio { constructor(options?: AudioContextOptions) { super(options); contexts.push(this); } };
  });
  await page.clock.install();
  await openQuietRain(page);
  await page.getByRole("button", { name: "Rain sound", exact: true }).click();
  const state = () => page.evaluate(() => (window as unknown as { __rainContexts: AudioContext[] }).__rainContexts[0]?.state);
  await expect.poll(state).toBe("running");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(state).toBe("suspended");
  await expect(page.locator(".rain-glass")).toHaveAttribute("data-animating", "false");
  await page.clock.fastForward(15_000);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: false }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(state).toBe("suspended");
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect.poll(state).toBe("running");
});

test("quiet rain falls back when Canvas is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: () => null
    });
  });
  await openQuietRain(page);
  await expect(page.locator(".quiet-rain")).toHaveAttribute("data-renderer", "fallback");
  await expect(page.getByText(/Glass interaction is unavailable here/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear the glass", exact: true })).toBeDisabled();
});

test("quiet rain uses the gradient fallback when local artwork fails", async ({ page }) => {
  await page.route(/quiet-rain.*\.webp/, (route) => route.abort());
  await page.goto("./");
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: /Quiet Rain/ }).click();
  await expect(page.locator(".quiet-rain")).toHaveAttribute("data-artwork", "unavailable");
  await expect(page.locator(".quiet-rain")).toHaveAttribute("data-renderer", "fallback");
  await expect(page.getByText(/The window is still. Glass interaction is unavailable here/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear the glass", exact: true })).toBeDisabled();
  await expect(page.locator(".world-theme-rain .world-environment")).toBeVisible();
});

test("rain audio is opt-in, suspends on pause, and closes on off, reset, exit and completion", async ({ page }) => {
  await page.addInitScript(() => {
    const NativeAudio = window.AudioContext;
    const contexts: AudioContext[] = [];
    Object.defineProperty(window, "__rainContexts", { value: contexts });
    window.AudioContext = class extends NativeAudio {
      constructor(options?: AudioContextOptions) { super(options); contexts.push(this); }
    };
  });
  await page.clock.install();
  await openQuietRain(page);
  const sound = page.getByRole("button", { name: "Rain sound", exact: false });
  const states = () => page.evaluate(() => (window as unknown as { __rainContexts: AudioContext[] }).__rainContexts.map(context => context.state));
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  expect(await states()).toEqual([]);

  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await expect.poll(states).toEqual(["running"]);
  await expect(page.locator(".rain-glass")).toHaveAttribute("data-animating", "true");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect.poll(states).toEqual(["suspended"]);
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect.poll(states).toEqual(["running"]);
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await expect.poll(states).toEqual(["closed"]);

  await sound.click();
  await expect.poll(states).toEqual(["closed", "running"]);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect.poll(states).toEqual(["closed", "closed"]);
  await expect(page.getByRole("button", { name: "Rain sound", exact: false })).toHaveAttribute("aria-pressed", "false");

  await page.getByRole("button", { name: "Rain sound", exact: false }).click();
  await expect.poll(states).toEqual(["closed", "closed", "running"]);
  await page.clock.fastForward(240_100);
  await expect(page.getByRole("button", { name: "Return to Worlds", exact: true })).toBeVisible();
  await expect.poll(states).toEqual(["closed", "closed", "closed"]);
  await expect(page.getByRole("button", { name: "Rain sound", exact: false })).toHaveAttribute("aria-pressed", "false");
});

test("rain audio closes when the experience exits", async ({ page }) => {
  await page.addInitScript(() => {
    const NativeAudio = window.AudioContext;
    const contexts: AudioContext[] = [];
    Object.defineProperty(window, "__rainContexts", { value: contexts });
    window.AudioContext = class extends NativeAudio {
      constructor(options?: AudioContextOptions) { super(options); contexts.push(this); }
    };
  });
  await openQuietRain(page);
  await page.getByRole("button", { name: "Rain sound", exact: false }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __rainContexts: AudioContext[] }).__rainContexts[0]?.state)).toBe("running");
  await page.getByRole("button", { name: "Close experience" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __rainContexts: AudioContext[] }).__rainContexts[0]?.state)).toBe("closed");
});
