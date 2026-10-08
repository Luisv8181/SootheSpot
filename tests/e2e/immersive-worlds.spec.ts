import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("./");
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
});

test("garden presents one sense and supports skip, back and reset", async ({ page }) => {
  await page.getByRole("button", { name: /Grounding Garden/ }).click();
  const world = page.getByRole("dialog");
  await expect(world.getByRole("heading", { name: "See", exact: true })).toBeVisible();
  await expect(world.getByRole("heading", { name: "Hear", exact: true })).toHaveCount(0);
  await world.getByRole("button", { name: "I noticed something" }).click();
  await expect(world.getByRole("heading", { name: "Hear", exact: true })).toBeVisible();
  await world.getByRole("button", { name: "Skip this sense" }).click();
  await expect(world.getByRole("heading", { name: "Feel", exact: true })).toBeVisible();
  await world.getByRole("button", { name: "Back", exact: true }).click();
  await expect(world.getByRole("heading", { name: "Hear", exact: true })).toBeVisible();
  for (let i = 0; i < 4; i++) await world.getByRole("button", { name: "Skip this sense" }).click();
  await expect(world.getByText("That is enough for this round.")).toBeVisible();
  await expect(world.getByText("1 sense noticed", { exact: true })).toBeVisible();
  await world.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(world.getByRole("heading", { name: "See", exact: true })).toBeVisible();
});

test("focus respects reduced motion and offers a steady anchor", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: /Soft Focus/ }).click();
  const world = page.getByRole("dialog");
  await expect(world.getByRole("checkbox", { name: "Still visuals" })).toBeChecked();
  await expect(world.getByRole("button", { name: "Slow drift" })).toBeDisabled();
  await expect(world.getByRole("button", { name: "Steady light" })).toHaveAttribute("aria-pressed", "true");
});

test("ripple field supports keyboard, pointer, pause, clear and ephemeral state", async ({ page }) => {
  await page.getByRole("button", { name: /Ripple Field/ }).click();
  const world = page.getByRole("dialog");
  await expect(world.getByText("Experimental", { exact: true })).toBeVisible();
  const field = world.getByRole("button", { name: "Place a ripple" });
  await field.focus();
  await page.keyboard.press("Enter");
  await expect(world.locator(".ripple-mark")).toHaveCount(1);
  await field.click({ position: { x: 30, y: 200 } });
  await expect(world.locator(".ripple-mark")).toHaveCount(2);
  await world.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(field).toBeDisabled();
  await world.getByRole("button", { name: "Clear ripples" }).click();
  await expect(world.locator(".ripple-mark")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Ripple Field/ }).click();
  await expect(page.locator(".ripple-mark")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Change language" }).click();
  await page.getByRole("button", { name: /Campo de ondas/ }).click();
  await expect(page.getByRole("button", { name: "Crear una onda" })).toBeVisible();
});

test("ocean breathing has semantic progress and an optional still scene", async ({ page }) => {
  await page.getByRole("button", { name: /Ocean Calm/ }).click();
  const world = page.getByRole("dialog");
  await expect(world.getByText("No need to hold your breath. Follow only if comfortable.")).toBeVisible();
  await world.getByRole("checkbox", { name: "Still visuals" }).check();
  await world.getByRole("button", { name: "Start", exact: true }).click();
  await expect(world.getByText("Breathe in", { exact: true })).toBeVisible();
  await world.getByRole("button", { name: "Pause", exact: true }).click();
  await world.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(world.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
});
