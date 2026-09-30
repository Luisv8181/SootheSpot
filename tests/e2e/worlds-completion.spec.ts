import { expect, test } from "@playwright/test";

test("ripple cap, session completion and reset do not write personal storage", async ({ page }) => {
  await page.clock.install();
  await page.goto("./");
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  const before = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  await page.getByRole("button", { name: /Ripple Field/ }).click();
  const world = page.getByRole("dialog");
  const field = world.getByRole("button", { name: "Place a ripple" });
  for (let i = 0; i < 12; i++) await field.click();
  await expect(world.locator(".ripple-mark")).toHaveCount(8);
  await page.clock.fastForward(181000);
  await expect(world.getByText("That is enough for this round.")).toBeVisible();
  await expect(field).toBeDisabled();
  await world.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(world.locator(".ripple-mark")).toHaveCount(0);
  await expect(world.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  await expect(field).toBeEnabled();
  await world.getByRole("checkbox", { name: "Still visuals" }).check();
  await expect(world).toHaveClass(/visuals-still/);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).toBe(before);
});
