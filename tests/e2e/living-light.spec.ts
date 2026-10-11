import { expect, test } from "@playwright/test";

async function openLivingLight(page: import("@playwright/test").Page) {
  await page.goto("./");
  await expect(page.getByRole("status").filter({ hasText: "Opening your toolbox" })).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await expect(page.getByRole("button", { name: /Living Light/ })).toBeVisible();
  await page.getByRole("button", { name: /Living Light/ }).click();
  const world = page.getByRole("dialog", { name: "Living Light" });
  await expect(world).toBeVisible();
  return world;
}

test("living light opens quietly and supports keyboard gather and release", async ({ page }) => {
  const world = await openLivingLight(page);
  await expect(world.locator(".living-light")).toHaveAttribute("data-renderer", "canvas");
  const field = world.getByRole("button", { name: "Shape the light" });
  const gather = world.getByRole("button", { name: "Gather a bloom" });

  await expect(world.getByText("Quiet by default", { exact: true })).toBeVisible();
  await expect(world.getByRole("button", { name: "Light sound" })).toHaveAttribute("aria-pressed", "false");
  await expect(field).toBeEnabled();
  await field.focus();
  await page.keyboard.press("Enter");
  await expect(world.locator(".living-light")).toHaveAttribute("data-held", "true");
  await expect(world.getByRole("button", { name: "Release bloom" })).toHaveAttribute("aria-pressed", "true");

  await page.keyboard.press("Space");
  await expect(world.locator(".living-light")).toHaveAttribute("data-held", "false");
  await expect(gather).toHaveAttribute("aria-pressed", "false");
  await expect(world.locator("#light-instructions")).toContainText("Hold to gather a bloom; release to unfurl");
  await expect(world.locator(".world-guidance")).toBeHidden();
});

test("still mode stops light animation while keeping the visual available", async ({ page }) => {
  const world = await openLivingLight(page);
  const canvas = world.locator(".light-canvas");
  await world.getByRole("button", { name: "Start", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-animating", "true");

  await world.getByRole("checkbox", { name: "Still visuals" }).check();
  await expect(canvas).toHaveAttribute("data-animating", "false");
  const before = await canvas.evaluate(element => (element as HTMLCanvasElement).toDataURL());
  await world.getByRole("button", { name: "Gather a bloom" }).click();
  await expect(canvas).toHaveAttribute("data-gather", "1.00");
  const gathered = await canvas.evaluate(element => (element as HTMLCanvasElement).toDataURL());
  expect(gathered).not.toBe(before);
  await page.waitForTimeout(120);
  expect(await canvas.evaluate(element => (element as HTMLCanvasElement).toDataURL())).toBe(gathered);
  await expect(world.locator(".light-field")).toBeEnabled();
  await world.getByRole("checkbox", { name: "Still visuals" }).uncheck();
  await expect(canvas).toHaveAttribute("data-animating", "true");
});

test("pointer holds gather, releases unfurl, and pause/reset clear the hold without saving gestures", async ({ page }) => {
  const world = await openLivingLight(page);
  const stored = await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()));
  const canvas = world.locator(".light-canvas");
  const field = world.getByRole("button", { name: "Shape the light" });
  const box = (await field.boundingBox())!;
  await page.mouse.move(box.x + box.width * .6, box.y + box.height * .4);
  await page.mouse.down();
  await expect.poll(async () => Number(await canvas.getAttribute("data-gather"))).toBeGreaterThan(.5);
  await page.mouse.up();
  await expect(world.locator(".living-light")).toHaveAttribute("data-held", "false");
  await expect.poll(async () => Number(await canvas.getAttribute("data-gather"))).toBeLessThan(.2);
  await world.getByRole("button", { name: "Gather a bloom" }).click();
  await world.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(field).toBeDisabled();
  await expect(world.locator(".living-light")).toHaveAttribute("data-held", "false");
  await world.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-gather", "0.00");
  const size = await canvas.evaluate(element => ({ width: (element as HTMLCanvasElement).width, height: (element as HTMLCanvasElement).height }));
  expect(size.width * size.height).toBeLessThanOrEqual(1_200_000);
  expect(await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()))).toBe(stored);
});

test("living light keeps keyboard interaction available when canvas is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: () => null
    });
  });
  const world = await openLivingLight(page);
  await expect(world.locator(".living-light")).toHaveAttribute("data-renderer", "fallback");
  await expect(world.locator(".light-field svg")).toBeVisible();

  await world.getByRole("button", { name: "Shape the light" }).focus();
  await page.keyboard.press("Enter");
  await expect(world.locator(".living-light")).toHaveAttribute("data-held", "true");
  await expect(world.getByRole("button", { name: "Release bloom" })).toBeEnabled();
});

test("sound is opt-in, follows session pause and closes on exit", async ({ page }) => {
  await page.addInitScript(() => {
    const NativeAudio = window.AudioContext;
    const contexts: AudioContext[] = [];
    Object.defineProperty(window, "__lightContexts", { value: contexts });
    window.AudioContext = class extends NativeAudio {
      constructor(options?: AudioContextOptions) {
        super(options);
        contexts.push(this);
      }
    };
  });
  const world = await openLivingLight(page);
  const sound = world.getByRole("button", { name: "Light sound" });
  const states = () => page.evaluate(() => (window as unknown as { __lightContexts: AudioContext[] }).__lightContexts.map(context => context.state));

  await expect(sound).toHaveAttribute("aria-pressed", "false");
  expect(await states()).toEqual([]);
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await expect.poll(states).toEqual(["running"]);
  await expect(world.getByRole("slider", { name: "Light volume" })).toBeVisible();

  await world.getByRole("button", { name: "Pause", exact: true }).click();
  await expect.poll(states).toEqual(["suspended"]);
  await world.getByRole("button", { name: "Resume", exact: true }).click();
  await expect.poll(states).toEqual(["running"]);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(states).toEqual(["suspended"]);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: false }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(world.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
  await expect.poll(states).toEqual(["suspended"]);
  await world.getByRole("button", { name: "Resume", exact: true }).click();
  await expect.poll(states).toEqual(["running"]);
  await page.getByRole("button", { name: "Close experience", exact: true }).click();
  await expect.poll(states).toEqual(["closed"]);
});

test("two fingers spread the material and releasing both ends the hold", async ({ page, context }) => {
  const world = await openLivingLight(page);
  const field = world.getByRole("button", { name: "Shape the light" });
  await field.scrollIntoViewIfNeeded();
  const box = (await field.boundingBox())!;
  const session = await context.newCDPSession(page);
  const centerX = box.x + box.width / 2, centerY = box.y + box.height / 2;
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: centerX - 30, y: centerY, id: 1 }, { x: centerX + 30, y: centerY, id: 2 }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: centerX - 45, y: centerY - 10, id: 1 }, { x: centerX + 45, y: centerY + 10, id: 2 }] });
  await expect.poll(async () => Number(await world.locator(".living-light").getAttribute("data-spread"))).toBeGreaterThan(1.3);
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(world.locator(".living-light")).toHaveAttribute("data-held", "false");
  await session.detach();
});

test("Spanish and reduced motion preserve deliberate shaping", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openLivingLight(page);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Change language" }).click();
  await page.getByRole("navigation").getByRole("button", { name: "Mundos", exact: true }).click();
  await page.getByRole("button", { name: /Luz viva/ }).click();
  await expect(page.getByRole("checkbox", { name: "Imágenes quietas" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Imágenes quietas" })).toBeDisabled();
  await page.getByRole("button", { name: "Reunir una flor" }).click();
  await expect(page.locator(".light-canvas")).toHaveAttribute("data-gather", "1.00");
  await expect(page.getByRole("button", { name: "Sonido de luz" })).toHaveAttribute("aria-pressed", "false");
});

test("living light keeps its guide and controls below the visual on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const world = await openLivingLight(page);
  const visual = await world.locator(".light-field").boundingBox();
  const guide = await world.locator("#light-instructions").boundingBox();
  const viewportWidth = page.viewportSize()!.width;

  expect(visual).not.toBeNull();
  expect(guide).not.toBeNull();
  expect(guide!.y).toBeGreaterThanOrEqual(visual!.y + visual!.height);
  expect(guide!.x).toBeGreaterThanOrEqual(0);
  expect(guide!.x + guide!.width).toBeLessThanOrEqual(viewportWidth);
  await expect(world.getByRole("button", { name: "Gather a bloom" })).toBeVisible();
  await expect(world.getByRole("button", { name: "Turn gently" })).toBeVisible();
});
