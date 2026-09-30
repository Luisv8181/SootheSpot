import { expect, test } from "@playwright/test";

test("worlds open as localized, controllable experiences", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await expect(page.getByRole("button", { name: /Ocean Calm/ })).toBeVisible();

  await page.getByRole("button", { name: /Ocean Calm/ }).click();
  const ocean = page.getByRole("dialog", { name: "Ocean Calm" });
  await expect(ocean.getByRole("heading", { name: "Ocean Calm" })).toBeVisible();
  await ocean.getByRole("button", { name: "Start" }).click();
  await expect(ocean.getByText(/Breathe in|Pause softly|Breathe out/)).toBeVisible();
  await ocean.getByRole("button", { name: "Pause" }).click();
  await expect(ocean.getByRole("button", { name: "Resume" })).toBeVisible();
  await ocean.getByRole("button", { name: "Reset" }).click();
  await expect(ocean.getByText("0:00 of 5:00")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(ocean).toHaveCount(0);

  await page.getByRole("button", { name: "Change language" }).click();
  await page.getByRole("button", { name: /Jardín para aterrizar/ }).click();
  const garden = page.getByRole("dialog", { name: "Jardín para aterrizar" });
  await expect(garden.getByRole("heading", { name: "Jardín para aterrizar" })).toBeVisible();
  await expect(garden.getByRole("heading", { name: "Ver", exact: true })).toBeVisible();
  await garden.getByRole("button", { name: "Noté algo" }).click();
  await expect(garden.getByText("1 sentido notado", { exact: true })).toBeVisible();
});
