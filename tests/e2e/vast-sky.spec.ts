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
  await expect(sky.getByRole("button", { name: "toggle sound" })).toHaveText("♪ off");

  expect(errors).toEqual([]);
});
