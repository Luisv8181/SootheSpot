import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("./");
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
});

test("focus is immersive and its optional light drift freezes on pause and resets to steady", async ({ page }) => {
  await page.getByRole("button", { name: /Soft Focus/ }).click();
  const scene = page.locator(".atmosphere-scene");
  await expect(scene).toBeVisible();
  await expect(scene).toHaveAttribute("data-artwork", "ready");
  await expect(page.locator(".immersive-scene")).toHaveCount(0);
  expect((await scene.boundingBox())!.width).toBe(page.viewportSize()!.width);
  expect(await scene.locator("img").evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(1000);
  const anchor = page.locator(".focus-anchor");
  await expect(scene).toHaveAttribute("data-motion", "steady");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Slow drift", exact: true }).click();
  const transform = () => anchor.evaluate((node) => getComputedStyle(node).transform);
  const first = await transform();
  await page.waitForTimeout(700);
  expect(await transform()).not.toBe(first);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.waitForTimeout(100);
  const paused = await transform();
  await page.waitForTimeout(400);
  expect(await transform()).toBe(paused);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("button", { name: "Steady light", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(scene).toHaveAttribute("data-motion", "steady");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Slow drift", exact: true }).click();
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(scene).toHaveAttribute("data-motion", "paused");
  expect(await anchor.evaluate((node) => getComputedStyle(node).animationPlayState)).toBe("paused");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.clock.install();
  await page.clock.fastForward(181000);
  await expect(page.getByRole("button", { name: "Return to Worlds", exact: true })).toBeFocused();
  await expect(scene).toHaveAttribute("data-motion", "paused");
  expect(await anchor.evaluate((node) => getComputedStyle(node).animationPlayState)).toBe("paused");
});

test("garden trail follows notice, skip and back without saving interaction state", async ({ page }) => {
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  await page.getByRole("button", { name: /Grounding Garden/ }).click();
  await expect(page.locator(".atmosphere-scene")).toBeVisible();
  const trail = page.locator(".garden-trail");
  await expect(trail.locator(".current")).toHaveCount(1);
  await page.getByRole("button", { name: "I noticed something", exact: true }).click();
  await expect(trail.locator(".visited")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Hear", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Skip this sense", exact: true }).click();
  await expect(trail.locator(".visited")).toHaveCount(2);
  await expect(page.getByText("1 sense noticed", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(trail.locator(".visited")).toHaveCount(1);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(trail.locator(".visited")).toHaveCount(0);
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).toBe(stored);
});

test("reduced motion stops focus drift and garden feedback transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: /Soft Focus/ }).click();
  await expect(page.getByRole("button", { name: "Slow drift", exact: true })).toBeDisabled();
  await expect(page.locator(".atmosphere-scene")).toHaveAttribute("data-motion", "still");
  expect(await page.locator(".focus-anchor").evaluate((node) => getComputedStyle(node).animationName)).toBe("none");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Grounding Garden/ }).click();
  expect(await page.locator(".garden-trail span").first().evaluate((node) => getComputedStyle(node).transitionDuration)).toBe("0s");
});

test("failed scene artwork retains the activity and a calm fallback", async ({ page }) => {
  await page.route("**/*.webp", (route) => route.abort());
  await page.reload();
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: /Grounding Garden/ }).click();
  await expect(page.locator(".atmosphere-scene")).toHaveAttribute("data-artwork", "fallback");
  await page.getByRole("button", { name: "Skip this sense", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Hear", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close experience" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
