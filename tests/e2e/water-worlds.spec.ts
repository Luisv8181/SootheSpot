import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";

const imageHash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

test.beforeEach(async ({ page }) => {
  await page.goto("./");
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
});

test("ocean renders moving water, freezes when paused and stays within its pixel budget", async ({ page }) => {
  await page.getByRole("button", { name: /Ocean Calm/ }).click();
  const world = page.getByRole("dialog");
  await expect(world.locator(".water-surface")).toHaveAttribute("data-renderer", "webgl");
  const canvas = world.locator("canvas");
  expect(await canvas.evaluate((node) => (node as HTMLCanvasElement).width * (node as HTMLCanvasElement).height)).toBeLessThanOrEqual(900000);
  await world.getByRole("button", { name: "Start", exact: true }).click();
  const before = imageHash(await canvas.screenshot());
  await page.waitForTimeout(350);
  expect(imageHash(await canvas.screenshot())).not.toBe(before);
  await world.getByRole("button", { name: "Pause", exact: true }).click();
  await page.waitForTimeout(150);
  const paused = imageHash(await canvas.screenshot());
  await page.waitForTimeout(350);
  expect(imageHash(await canvas.screenshot())).toBe(paused);
});

test("keyboard placement can move across the pool and waves remain bounded during drag", async ({ page }) => {
  await page.getByRole("button", { name: /Ripple Field/ }).click();
  const field = page.getByRole("button", { name: "Place a ripple" });
  await field.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");
  await expect(page.locator(".ripple-cursor")).toBeVisible();
  const marker = page.locator(".ripple-mark").first();
  expect(await marker.evaluate((node) => (node as HTMLElement).style.left)).toBe("55%");
  const box = (await field.boundingBox())!;
  await page.mouse.move(box.x + box.width * .15, box.y + box.height * .4);
  await page.mouse.down();
  for (let i = 0; i < 12; i++) {
    await page.mouse.move(box.x + box.width * (.15 + i * .05), box.y + box.height * .4);
    await page.waitForTimeout(100);
  }
  await page.mouse.up();
  expect(await page.locator(".ripple-mark").count()).toBeLessThanOrEqual(8);
  expect(await page.locator(".ripple-mark").count()).toBeGreaterThan(2);
});

test("reduced motion uses still artwork and deliberate static touch feedback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: /Ripple Field/ }).click();
  await expect(page.getByRole("checkbox", { name: "Still visuals" })).toBeChecked();
  await page.getByRole("button", { name: "Place a ripple" }).click({ position: { x: 30, y: 200 } });
  await expect(page.locator(".water-surface")).toHaveAttribute("data-motion", "still");
  await expect(page.locator(".ripple-mark")).toHaveCount(1);
});

test("unavailable graphics preserve artwork, keyboard input and clear controls", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (String(args[0]).startsWith("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.reload();
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: /Ripple Field/ }).click();
  await expect(page.locator(".water-surface")).toHaveAttribute("data-renderer", "fallback");
  await expect(page.locator(".water-artwork")).toBeVisible();
  await page.getByRole("button", { name: "Place a ripple" }).focus();
  await page.keyboard.press("Space");
  await expect(page.locator(".ripple-mark")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear ripples" }).click();
  await expect(page.locator(".ripple-mark")).toHaveCount(0);
});

test("lost graphics keep the exit and static pool usable", async ({ page }) => {
  await page.getByRole("button", { name: /Ripple Field/ }).click();
  await expect(page.locator(".water-surface")).toHaveAttribute("data-renderer", "webgl");
  await page.locator("canvas").evaluate((canvas) => {
    (canvas as HTMLCanvasElement).getContext("webgl")?.getExtension("WEBGL_lose_context")?.loseContext();
  });
  await expect(page.locator(".water-surface")).toHaveAttribute("data-renderer", "fallback");
  await expect(page.locator(".water-surface")).toHaveAttribute("data-motion", "still");
  await page.getByRole("button", { name: "Place a ripple" }).click({ position: { x: 30, y: 200 } });
  await expect(page.locator(".ripple-mark")).toHaveCount(1);
  await page.getByRole("button", { name: "Close experience" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("settled waves expire and cannot return when switching to still visuals", async ({ page }) => {
  await page.clock.install();
  await page.getByRole("button", { name: /Ripple Field/ }).click();
  await page.getByRole("button", { name: "Place a ripple" }).click({ position: { x: 30, y: 200 } });
  await expect(page.locator(".ripple-mark")).toHaveCount(1);
  await page.clock.fastForward(13000);
  await expect(page.locator(".ripple-mark")).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Still visuals" }).check();
  await expect(page.locator(".ripple-mark")).toHaveCount(0);
});

test("missing artwork retains a calm fallback and working controls", async ({ page }) => {
  await page.route("**/*.webp", (route) => route.abort());
  await page.reload();
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: /Ocean Calm/ }).click();
  await expect(page.locator(".water-surface")).toHaveAttribute("data-renderer", "fallback");
  await expect(page.locator(".water-artwork")).toBeHidden();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Close experience" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
