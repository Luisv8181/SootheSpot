import { expect, test } from "@playwright/test";

test("vast sky world opens, takes a custom message, and switches stations", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e.message || e)));
  await page.goto("./");
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: /Vast Sky/ }).click();

  const sky = page.getByRole("dialog", { name: "Vast Sky" });
  await expect(sky.getByRole("heading", { name: "Vast Sky" })).toBeVisible();
  await expect(sky.locator(".vsky-canvas")).toBeVisible();
  await expect(sky.locator(".vsky-photo")).toBeVisible();
  await expect(sky.locator(".vsky-station").getByText("YOUR WORDS")).toBeVisible();

  await sky.getByRole("button", { name: "Start" }).click();

  // visual smoke (bug-journal rule): the sky must actually render pixels,
  // not a blank or failed canvas. 2D canvas retains its bitmap, so a single
  // sampled read is deterministic; the star field always has bright stars
  // on a dark sky, a blank canvas has ~zero variance.
  const skyVariance = await sky.locator(".vsky-canvas").evaluate((node) => {
    const c = node as HTMLCanvasElement;
    const ctx = c.getContext("2d");
    if (!ctx || c.width === 0 || c.height === 0) return 0;
    const sx = Math.floor(c.width * 0.2), sy = Math.floor(c.height * 0.4);
    const sw = Math.floor(c.width * 0.6), sh = Math.floor(c.height * 0.3);
    const data = ctx.getImageData(sx, sy, sw, sh).data;
    let min = 255, max = 0;
    for (let i = 0; i < data.length; i += 12) {
      const v = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return max - min;
  });
  expect(skyVariance).toBeGreaterThan(24);

  // write-your-own flow
  await sky.getByRole("button", { name: "write your own words" }).click();
  const panel = sky.getByRole("dialog", { name: "write it in stars" });
  await expect(panel).toBeVisible();
  await panel.getByLabel("write it in stars").fill("stay soft");
  await sky.getByRole("button", { name: "trace it ✦" }).click();
  await expect(sky.locator(".vsky-station").getByText("YOUR WORDS")).toBeVisible();

  // dial keyboard navigation moves to the next station
  await sky.locator("#vsky-dial").focus();
  await page.keyboard.press("ArrowRight");
  await expect(sky.locator(".vsky-station").getByText("FREE")).toBeVisible();

  // band switch reaches the constellations
  await sky.getByRole("button", { name: "switch dial band" }).click();
  await expect(sky.locator(".vsky-station").getByText("ORION")).toBeVisible();

  // mute toggle is honest
  await sky.getByRole("button", { name: "toggle sound" }).click();
  await expect(sky.getByRole("button", { name: "toggle sound" })).toHaveText("♪ muted");

  // autoplay starts the cinematic trace; grabbing the sky hands control back.
  // (Raw mouse click: the point is open star field in both viewports, and a
  // locator click would trip on the session chrome's hit-testing instead.)
  await sky.getByRole("button", { name: "autoplay the current sky" }).click();
  await expect(sky.getByRole("button", { name: "autoplay the current sky" })).toHaveText("■ stop");
  await expect(sky.getByText("tap any star to take over")).toBeVisible();
  await page.mouse.click(195, 400);
  await expect(sky.getByRole("button", { name: "autoplay the current sky" })).toHaveText("▶ autoplay");

  expect(errors).toEqual([]);
});
