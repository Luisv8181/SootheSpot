import { expect, test, type Page } from "@playwright/test";

async function openProfile(page: Page) {
  await page.getByRole("navigation").getByRole("button", { name: "You", exact: true }).click();
}

test("create, use, remember, export, reset, and delete a personal tool", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await page.getByRole("navigation").getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByRole("button", { name: "Create a tool", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Tool name").fill("A quiet stretch");
  await dialog.getByLabel("What is it?").fill("Stretch my shoulders for a moment.");
  await dialog.getByLabel("Steps, one per line").fill("Sit comfortably.\nGently move your shoulders.");
  await dialog.getByRole("button", { name: "Add to My Toolbox" }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: /A quiet stretch/ }).click();
  await page.getByRole("button", { name: "A lot", exact: true }).click();
  await page.reload();
  await page.getByRole("navigation").getByRole("button", { name: "Tools", exact: true }).click();
  await expect(page.getByRole("button", { name: /A quiet stretch/ })).toBeVisible();
  await expect(page.getByText("Used 1 time · 1 marked helpful", { exact: true })).toBeVisible();
  await openProfile(page);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export my data" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const exported = JSON.parse(Buffer.concat(chunks).toString());
  expect(exported.data.customTools[0].title).toBe("A quiet stretch");
  expect(exported.data.feedback).toHaveLength(1);
  page.on("dialog", (confirmation) => confirmation.accept());
  await page.getByRole("button", { name: "Reset learned history" }).click();
  await expect(page.getByRole("button", { name: "Reset learned history" })).toBeDisabled();
  await page.getByRole("navigation").getByRole("button", { name: "Tools", exact: true }).click();
  await expect(page.getByRole("button", { name: /A quiet stretch/ })).toBeVisible();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("button", { name: /A quiet stretch/ })).toHaveCount(0);
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("soothespot.customTools") ?? "[]"))).toEqual([]);
  expect(errors).toEqual([]);
});

test("hide and restore recommendations, including an honest empty state", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Anxious", exact: true }).click();
  await page.getByRole("button", { name: "2 min", exact: true }).click();
  await page.getByRole("button", { name: /4-7-8 Breathing/ }).click();
  await page.getByRole("button", { name: "Don't recommend this", exact: true }).click();
  await expect(page.getByText(/No tools match these choices/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Let's give your attention somewhere steady to land.", exact: true })).toBeFocused();
  await page.reload();
  await page.getByRole("button", { name: "Anxious", exact: true }).click();
  await expect(page.getByRole("button", { name: /4-7-8 Breathing/ })).toHaveCount(0);
  await openProfile(page);
  await page.getByText("Hidden recommendations (1)", { exact: true }).click();
  await page.getByRole("button", { name: "Restore", exact: true }).click();
  await page.getByRole("navigation").getByRole("button", { name: "Home", exact: true }).click();
  await expect(page.getByRole("button", { name: /4-7-8 Breathing/ })).toBeVisible();
});

test("support requires an explicit region, respects Spanish, and keeps contact data transient", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "I need support", exact: true }).click();
  await expect(page.getByRole("button", { name: "Open Ocean Calm", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "See support options" }).click();
  await expect(page.getByRole("link", { name: "Call 988", exact: true })).toHaveCount(0);
  await page.getByLabel("Where are you right now?").selectOption("CA");
  await expect(page.getByRole("link", { name: "Official service website" })).toHaveAttribute("href", "https://988.ca/");
  await page.getByLabel("Their phone number (optional)").fill("+1 212 555 0100");
  await expect(page.getByRole("link", { name: "Call this person" })).toHaveAttribute("href", "tel:+12125550100");
  await page.getByRole("button", { name: "Change language" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { name: "Puedes pedir apoyo." })).toBeVisible();
  await page.getByLabel("¿Dónde estás ahora?").selectOption("other");
  await expect(page.getByRole("link", { name: "Llamar al 988", exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain("212");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: test.info().outputPath("support.png"), fullPage: true });
});

test("corrupt storage does not crash or erase valid collections", async ({ page }) => {
  await page.goto("./");
  await page.evaluate(() => {
    localStorage.setItem("soothespot.customTools", '{"bad":true}');
    localStorage.setItem("soothespot.savedToolIds", '["five-senses"]');
  });
  await page.reload();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("could not be read");
  await page.getByRole("navigation").getByRole("button", { name: "Tools", exact: true }).click();
  await expect(page.getByRole("button", { name: /5 Senses Grounding/ })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("soothespot.customTools"))).toBe('{"bad":true}');
});

test("a stale second tab cannot resurrect cleared feedback", async ({ page, context }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Anxious", exact: true }).click();
  await page.getByRole("button", { name: /4-7-8 Breathing/ }).click();
  await page.getByRole("button", { name: "A lot", exact: true }).click();
  const second = await context.newPage();
  await second.addInitScript(() => window.addEventListener("storage", (event) => event.stopImmediatePropagation()));
  await second.goto("./");
  await second.getByRole("button", { name: "Anxious", exact: true }).click();
  await second.getByRole("button", { name: /5 Senses Grounding/ }).click();
  await openProfile(page);
  page.on("dialog", (confirmation) => confirmation.accept());
  await page.getByRole("button", { name: "Reset learned history" }).click();
  await second.getByRole("button", { name: "A little", exact: true }).click();
  await expect(second.getByRole("dialog")).toHaveCount(0);
  const history = await second.evaluate(() => JSON.parse(localStorage.getItem("soothespot.feedback") ?? "[]"));
  expect(history).toHaveLength(1);
  expect(history[0].toolId).toBe("five-senses");
});

test("two requests to hide the same tool cannot restore it", async ({ page, context }) => {
  await page.goto("./");
  const second = await context.newPage();
  await second.addInitScript(() => window.addEventListener("storage", (event) => event.stopImmediatePropagation()));
  await second.goto("./");
  for (const tab of [page, second]) {
    await tab.getByRole("button", { name: "Anxious", exact: true }).click();
    await tab.getByRole("button", { name: /4-7-8 Breathing/ }).click();
  }
  await page.getByRole("button", { name: "Don't recommend this", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await second.getByRole("button", { name: "Don't recommend this", exact: true }).click();
  await expect(second.getByRole("dialog")).toHaveCount(0);
  expect(await second.evaluate(() => JSON.parse(localStorage.getItem("soothespot.hiddenToolIds") ?? "[]"))).toContain("breathing-478");
});

test("blocked writes keep the tool open and never claim it was saved", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Storage blocked", "QuotaExceededError"); };
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Anxious", exact: true }).click();
  await page.getByRole("button", { name: /4-7-8 Breathing/ }).click();
  await page.getByRole("button", { name: "Save to My Toolbox", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("could not be saved");
  await expect(page.getByRole("button", { name: "Save to My Toolbox", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "A lot", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("soothespot.feedback"))).toBeNull();
});

test("dialogs keep keyboard focus inside and restore focus on Escape", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Anxious", exact: true }).click();
  const opener = page.getByRole("button", { name: /4-7-8 Breathing/ });
  await opener.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Not really", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: test.info().outputPath("home.png"), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
