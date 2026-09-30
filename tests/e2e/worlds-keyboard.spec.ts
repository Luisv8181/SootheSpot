import { expect, test } from "@playwright/test";

test("keyboard grounding completion keeps focus and Escape inside the dialog", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: /Grounding Garden/ }).click();
  const world = page.getByRole("dialog");
  for (let i = 0; i < 5; i++) {
    await world.getByRole("button", { name: "I noticed something" }).focus();
    await page.keyboard.press("Enter");
  }
  await expect(world.getByRole("button", { name: "Return to Worlds" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(world).toHaveCount(0);
});
