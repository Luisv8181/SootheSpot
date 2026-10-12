import { expect, test } from "@playwright/test";

async function openSanctuary(page: import("@playwright/test").Page) {
  await page.goto("./");
  await expect(page.getByRole("status").filter({ hasText: "Opening your toolbox" })).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await expect(page.getByRole("button", { name: /Quiet Sanctuary/ })).toBeVisible();
  await page.getByRole("button", { name: /Quiet Sanctuary/ }).click();
  const world = page.getByRole("dialog", { name: "Quiet Sanctuary", exact: true });
  await expect(world).toBeVisible();
  await expect(world.locator(".quiet-sanctuary")).toHaveAttribute("data-artwork", /^(ready|fallback)$/);
  return world;
}

test("quiet sanctuary supports keyboard exploration, area selection, notes, and flowers", async ({ page }) => {
  const world = await openSanctuary(page);
  const scene = world.locator(".quiet-sanctuary");
  const explore = world.getByRole("button", { name: "Explore the sanctuary", exact: true });
  await expect(scene).toHaveAttribute("data-area", "pool");
  await expect(scene).toHaveAttribute("data-note", "-1");
  await expect(scene).toHaveAttribute("data-bloom", "false");
  await expect(scene).toHaveAttribute("data-movement", "stationary");
  await expect(world.getByRole("button", { name: "Sanctuary sound", exact: true })).toHaveAttribute("aria-pressed", "false");

  await explore.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).toHaveAttribute("data-area", "arch");
  await page.keyboard.press("ArrowRight");
  await expect(scene).toHaveAttribute("data-area", "flowers");
  await page.keyboard.press("ArrowLeft");
  await expect(scene).toHaveAttribute("data-area", "arch");
  for (const note of ["1", "3", "5"]) {
    await page.keyboard.press(note);
    await expect(scene).toHaveAttribute("data-note", String(Number(note)-1));
  }
  await page.keyboard.press("Enter");
  await expect(scene).toHaveAttribute("data-note", "0");
  await world.getByRole("button", { name: "Flower garden", exact: true }).click();
  await expect(scene).toHaveAttribute("data-area", "flowers");
  await world.getByRole("button", { name: "Open flowers", exact: true }).click();
  await expect(scene).toHaveAttribute("data-bloom", "true");
  await world.getByRole("button", { name: "Let flowers rest", exact: true }).click();
  await expect(scene).toHaveAttribute("data-bloom", "false");
});

test("area controls and ripple action work, with no new local storage entries", async ({ page }) => {
  const world = await openSanctuary(page);
  const storedBefore = await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()));
  const scene = world.locator(".quiet-sanctuary");

  for (const [label, area] of [["Musical arch", "arch"], ["Flower garden", "flowers"], ["Reflection pool", "pool"]]) {
    const button = world.getByRole("button", { name: label, exact: true });
    await button.click();
    await expect(scene).toHaveAttribute("data-area", area);
    await expect(button).toHaveAttribute("aria-pressed", "true");
  }
  await world.getByRole("button", { name: "Place a ripple", exact: true }).click();
  await expect(scene).toHaveAttribute("data-area", "pool");
  await expect(scene).toHaveAttribute("data-note", "-1");
  expect(await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()))).toBe(storedBefore);
});

test("sound stays opt-in and creates notes only after sound is enabled", async ({ page }) => {
  await page.addInitScript(() => {
    const NativeAudio = window.AudioContext;
    const contexts: AudioContext[] = [];
    const notes: OscillatorNode[] = [];
    Object.defineProperty(window, "__sanctuaryNotes", { value: notes });
    Object.defineProperty(window, "__sanctuaryContexts", { value: contexts });
    window.AudioContext = class extends NativeAudio {
      createOscillator() { const note = super.createOscillator(); notes.push(note); return note; }
      constructor(options?: AudioContextOptions) {
        super(options);
        contexts.push(this);
      }
    };
  });
  const world = await openSanctuary(page);
  const scene = world.locator(".quiet-sanctuary");
  const states = () => page.evaluate(() => (window as unknown as { __sanctuaryContexts: AudioContext[] }).__sanctuaryContexts.map(context => context.state));
  const notes = () => page.evaluate(() => (window as unknown as { __sanctuaryNotes: OscillatorNode[] }).__sanctuaryNotes.map(note => Math.round(note.frequency.value * 100) / 100));
  const sound = world.getByRole("button", { name: "Sanctuary sound", exact: true });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  expect(await states()).toEqual([]);
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await expect.poll(states).toEqual(["running"]);
  expect(await notes()).toEqual([]);
  await world.getByRole("button", { name: "Musical arch", exact: true }).click();
  await world.getByRole("button", { name: "Play sanctuary note 2", exact: true }).click();
  await expect(scene).toHaveAttribute("data-note", "1");
  await expect.poll(notes).toEqual([146.83]);
  await expect.poll(states).toEqual(["running"]);

  await world.getByRole("button", { name: "Pause", exact: true }).click();
  await expect.poll(states).toEqual(["suspended"]);
  await world.getByRole("button", { name: "Resume", exact: true }).click();
  await world.getByRole("button", { name: "Play sanctuary note 3", exact: true }).click();
  await expect.poll(states).toEqual(["running"]);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(states).toEqual(["suspended"]);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(states).toEqual(["suspended"]);
  await world.getByRole("button", { name: "Resume", exact: true }).click();
  await page.clock.install();
  await page.clock.fastForward(241000);
  await expect(world.getByRole("button", { name: "Return to Worlds", exact: true })).toBeVisible();
  await expect.poll(states).toEqual(["closed"]);
  await page.getByRole("button", { name: "Close experience", exact: true }).click();
  await expect.poll(states).toEqual(["closed"]);
});

test("session pause, resume, reset, and close preserve an idle sanctuary", async ({ page }) => {
  const world = await openSanctuary(page);
  const scene = world.locator(".quiet-sanctuary");
  await world.getByRole("button", { name: "Start", exact: true }).click();
  await world.getByRole("button", { name: "Flower garden", exact: true }).click();
  await world.getByRole("button", { name: "Open flowers", exact: true }).click();
  await world.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(world.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
  await world.getByRole("button", { name: "Resume", exact: true }).click();
  await world.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(scene).toHaveAttribute("data-area", "pool");
  await expect(scene).toHaveAttribute("data-bloom", "false");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Quiet Sanctuary" })).toHaveCount(0);
  await page.getByRole("button", { name: "Change language", exact: true }).click();
  await page.getByRole("button", { name: /Refugio tranquilo/ }).click();
  const spanish = page.getByRole("dialog", { name: "Refugio tranquilo", exact: true });
  await spanish.getByRole("button", { name: "Jardín de flores", exact: true }).click();
  await spanish.getByRole("button", { name: "Abrir las flores", exact: true }).click();
  await expect(spanish.locator(".quiet-sanctuary")).toHaveAttribute("data-bloom", "true");
  await expect(spanish.getByRole("button", { name: "Sonido del refugio", exact: true })).toHaveAttribute("aria-pressed", "false");
});

test("reduced motion keeps the camera stationary while pool and flower actions remain available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const world = await openSanctuary(page);
  const scene = world.locator(".quiet-sanctuary");
  const movement = world.getByRole("button", { name: "Explore view", exact: true });
  await expect(movement).toBeDisabled();
  await expect(scene).toHaveAttribute("data-movement", "stationary");
  await world.getByRole("button", { name: "Place a ripple", exact: true }).click();
  await expect(scene).toHaveAttribute("data-area", "pool");
  await world.getByRole("button", { name: "Flower garden", exact: true }).click();
  await world.getByRole("button", { name: "Open flowers", exact: true }).click();
  await expect(scene).toHaveAttribute("data-bloom", "true");
  await expect(scene).toHaveAttribute("data-artwork", "ready");
});

test("missing sanctuary artwork uses the local fallback and keeps controls usable", async ({ page }) => {
  await page.route(/sanctuary-.*\.(jpg|png|webp)(\?.*)?$/, route => route.abort());
  const world = await openSanctuary(page);
  const scene = world.locator(".quiet-sanctuary");
  await expect(scene).toHaveAttribute("data-artwork", "fallback");
  await world.getByRole("button", { name: "Flower garden", exact: true }).click();
  await world.getByRole("button", { name: "Open flowers", exact: true }).click();
  await expect(scene).toHaveAttribute("data-bloom", "true");
});

test("sanctuary audio failure leaves the visual controls usable", async ({ page }) => {
  await page.addInitScript(() => {
    window.AudioContext = class {
      constructor() { throw new Error("audio blocked"); }
    } as unknown as typeof AudioContext;
  });
  const world = await openSanctuary(page);
  await world.getByRole("button", { name: "Sanctuary sound", exact: true }).click();
  await world.getByRole("button", { name: "Musical arch", exact: true }).click();
  await world.getByRole("button", { name: "Play sanctuary note 1", exact: true }).click();
  await expect(world.locator(".quiet-sanctuary")).toHaveAttribute("data-note", "0");
  await expect(world.getByRole("button", { name: "Sanctuary sound", exact: true })).toHaveAttribute("aria-pressed", "false");
});

test("sanctuary fits desktop and mobile viewports", async ({ page }) => {
  for (const [viewport, screenshot] of [
    [{ width: 1280, height: 800 }, "test-results/sanctuary-desktop.png"],
    [{ width: 390, height: 844 }, "test-results/sanctuary-mobile.png"],
  ] as const) {
    await page.setViewportSize(viewport);
    const world = await openSanctuary(page);
    const visual = await world.locator(".quiet-sanctuary").boundingBox();
    expect(visual).not.toBeNull();
    expect(visual!.x).toBeGreaterThanOrEqual(0);
    expect(visual!.x + visual!.width).toBeLessThanOrEqual(viewport.width);
    await expect(world.getByRole("button", { name: "Reflection pool", exact: true })).toBeVisible();
    await expect(world.getByRole("button", { name: "Musical arch", exact: true })).toBeVisible();
    await page.screenshot({ path: screenshot.replace(".png", `-${test.info().project.name}.png`) });
    await page.keyboard.press("Escape");
  }
});

test("touch strums all five strings and reset releases audio", async ({ page, context }) => {
  await page.addInitScript(() => {
    const NativeAudio = window.AudioContext;
    const notes: OscillatorNode[] = [], contexts: AudioContext[] = [];
    Object.defineProperty(window, "__touchSanctuary", { value: { notes, contexts } });
    window.AudioContext = class extends NativeAudio {
      constructor(options?: AudioContextOptions) { super(options); contexts.push(this); }
      createOscillator() { const note = super.createOscillator(); notes.push(note); return note; }
    };
  });
  const world = await openSanctuary(page);
  await world.getByRole("button", { name: "Sanctuary sound", exact: true }).click();
  const field = world.getByRole("button", { name: "Explore the sanctuary", exact: true });
  await field.scrollIntoViewIfNeeded();
  const box = (await field.boundingBox())!;
  const session = await context.newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x + box.width * .46, y: box.y + box.height * .3, id: 1 }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: box.x + box.width * .68, y: box.y + box.height * .3, id: 1 }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await session.detach();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __touchSanctuary: { notes: OscillatorNode[] } }).__touchSanctuary.notes.map(note => Math.round(note.frequency.value * 100) / 100))).toEqual([130.81, 146.83, 164.81, 196, 220]);
  await world.getByRole("button", { name: "Reset", exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __touchSanctuary: { contexts: AudioContext[] } }).__touchSanctuary.contexts.map(item => item.state))).toEqual(["closed"]);
});
