import { expect, test } from "@playwright/test";

test("short screens retain tappable sky controls and scrollable session controls", async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 667, height: 375 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("./");
    await page
      .getByRole("navigation")
      .getByRole("button", { name: "Worlds", exact: true })
      .click();
    await page.getByRole("button", { name: /Vast Sky/ }).click();
    await page
      .getByRole("button", { name: "write your own words", exact: true })
      .click({ timeout: 2000 });
    await expect(
      page.getByRole("textbox", { name: "write it in stars", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Trace next star", exact: true })
      .click({ timeout: 2000 });
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await expect(page.locator(".vsky-root")).toHaveAttribute(
      "data-traced",
      "1",
    );
  }
});

test("reduced motion keeps deliberate tracing static and reset clears the trace", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Worlds", exact: true })
    .click();
  await page.getByRole("button", { name: /Vast Sky/ }).click();
  const next = page.getByRole("button", {
    name: "Trace next star",
    exact: true,
  });
  await next.press("Enter");
  await expect(page.locator(".vsky-root")).toHaveAttribute("data-traced", "1");
  await expect(page.locator(".vsky-root")).toHaveAttribute(
    "data-rendering",
    "still",
  );
  const frames = await page.locator(".vsky-root").getAttribute("data-frames");
  await page.waitForTimeout(350);
  await expect(page.locator(".vsky-root")).toHaveAttribute(
    "data-frames",
    frames!,
  );
  await expect(
    page.getByRole("button", { name: "autoplay the current sky", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator(".vsky-root")).toHaveAttribute("data-traced", "0");
  await next.press("Space");
  await expect(page.locator(".vsky-root")).toHaveAttribute("data-traced", "1");
});

test("session completion stops the sky and reset makes it available again", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("./");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Worlds", exact: true })
    .click();
  await page.getByRole("button", { name: /Vast Sky/ }).click();
  const next = page.getByRole("button", {
    name: "Trace next star",
    exact: true,
  });
  await next.press("Enter");
  await page.clock.fastForward(301000);
  await expect(next).toBeDisabled();
  await expect(page.locator(".vsky-root")).toHaveAttribute(
    "data-rendering",
    "paused",
  );
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(next).toBeEnabled();
  await expect(page.locator(".vsky-root")).toHaveAttribute("data-traced", "0");
});

test("sky tracing is keyboard accessible, silent by default and freezes on pause", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const NativeAudio = window.AudioContext;
    Object.defineProperty(window, "__skyAudioCreated", {
      value: 0,
      writable: true,
    });
    window.AudioContext = class extends NativeAudio {
      constructor(options?: AudioContextOptions) {
        super(options);
        (window as unknown as { __skyAudioCreated: number })
          .__skyAudioCreated++;
      }
    };
  });
  await page.goto("./");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Worlds", exact: true })
    .click();
  await page.getByRole("button", { name: /Vast Sky/ }).click();
  const sky = page.getByRole("dialog", { name: "Vast Sky", exact: true });
  const next = sky.getByRole("button", {
    name: "Trace next star",
    exact: true,
  });
  await expect(next).toBeVisible();
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(sky.locator(".vsky-root")).toHaveAttribute("data-traced", "1");
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __skyAudioCreated: number }).__skyAudioCreated,
    ),
  ).toBe(0);
  await sky.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(next).toBeDisabled();
  await expect(sky.locator(".vsky-root")).toHaveAttribute(
    "data-rendering",
    "paused",
  );
  await expect(sky.locator(".vsky-photo")).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await sky.getByRole("button", { name: "Resume", exact: true }).click();
  await next.press("Space");
  await expect(sky.locator(".vsky-root")).toHaveAttribute("data-traced", "2");
});

test("sky writing contains focus, preserves Spanish accents and explains unsupported letters", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Worlds", exact: true })
    .click();
  await page.getByRole("button", { name: /Vast Sky/ }).click();
  await page
    .getByRole("button", { name: "write your own words", exact: true })
    .click();
  const panel = page.getByRole("dialog", {
    name: "write it in stars",
    exact: true,
  });
  await panel
    .getByLabel("write it in stars", { exact: true })
    .fill("PAZ Y MAÑANA");
  await panel.getByRole("button", { name: "trace it ✦", exact: true }).click();
  await expect(page.locator(".vsky-root")).toHaveAttribute(
    "data-message",
    "PAZ Y MAÑANA",
  );
  await page
    .getByRole("button", { name: "write your own words", exact: true })
    .click();
  await panel.getByLabel("write it in stars", { exact: true }).fill("平静");
  await expect(
    panel.getByRole("button", { name: "trace it ✦", exact: true }),
  ).toBeDisabled();
  await expect(panel.getByRole("alert")).toContainText("not supported");
  await panel.getByRole("button", { name: "Cancel", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(
    panel.getByLabel("write it in stars", { exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(
    page.getByRole("dialog", { name: "Vast Sky", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "write your own words", exact: true }),
  ).toBeFocused();
});

test("vast sky world opens, takes a custom message, and switches stations", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e.message || e)));
  await page.goto("./");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Worlds", exact: true })
    .click();
  await page.getByRole("button", { name: /Vast Sky/ }).click();

  const sky = page.getByRole("dialog", { name: "Vast Sky" });
  await expect(sky.getByRole("heading", { name: "Vast Sky" })).toBeVisible();
  await expect(sky.locator(".vsky-canvas")).toBeVisible();
  await expect(sky.locator(".vsky-photo")).toBeVisible();
  await expect(
    sky.locator(".vsky-station").getByText("YOUR WORDS"),
  ).toBeVisible();

  await sky.getByRole("button", { name: "Start" }).click();

  // write-your-own flow
  await sky.getByRole("button", { name: "write your own words" }).click();
  const panel = page.getByRole("dialog", {
    name: "write it in stars",
    exact: true,
  });
  await expect(panel).toBeVisible();
  await panel.getByLabel("write it in stars").fill("stay soft");
  await panel.getByRole("button", { name: "trace it ✦" }).click();
  await expect(
    sky.locator(".vsky-station").getByText("YOUR WORDS"),
  ).toBeVisible();

  // dial keyboard navigation moves to the next station
  await sky.locator("#vsky-dial").focus();
  await page.keyboard.press("ArrowRight");
  await expect(sky.locator(".vsky-station").getByText("FREE")).toBeVisible();

  // band switch reaches the constellations
  await sky.getByRole("button", { name: "switch dial band" }).click();
  await expect(sky.locator(".vsky-station").getByText("ORION")).toBeVisible();

  await sky.getByRole("button", { name: "Sound & touch", exact: true }).click();
  const settings = page.getByRole("dialog", {
    name: "Sound and touch settings",
    exact: true,
  });
  await expect(
    settings.getByRole("button", { name: "Sky sound", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await settings.getByRole("button", { name: "Done", exact: true }).click();

  // autoplay starts the cinematic trace; grabbing the sky hands control back.
  // (Raw mouse click: the point is open star field in both viewports, and a
  // locator click would trip on the session chrome's hit-testing instead.)
  await sky.getByRole("button", { name: "autoplay the current sky" }).click();
  await expect(
    sky.getByRole("button", { name: "autoplay the current sky" }),
  ).toHaveText("■ stop");
  await expect(
    sky.getByText("Watching one trace. Touch the sky to take over."),
  ).toBeVisible();
  await sky
    .getByRole("button", { name: "Trace next star", exact: true })
    .click();
  await expect(
    sky.getByRole("button", { name: "autoplay the current sky" }),
  ).toHaveText("▶ autoplay");

  expect(errors).toEqual([]);
});

test("sky sound is opt-in, adjustable, and stops on pause, hidden tabs and exit", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const NativeAudio = window.AudioContext;
    const contexts: AudioContext[] = [];
    Object.defineProperty(window, "__skyContexts", { value: contexts });
    window.AudioContext = class extends NativeAudio {
      constructor(options?: AudioContextOptions) {
        super(options);
        contexts.push(this);
      }
    };
  });
  await page.goto("./");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Worlds", exact: true })
    .click();
  await page.getByRole("button", { name: /Vast Sky/ }).click();
  const openSettings = () =>
    page.getByRole("button", { name: "Sound & touch", exact: true }).click();
  const sound = page.getByRole("button", { name: "Sky sound", exact: true });
  await openSettings();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("slider", { name: "Sky sound volume", exact: true })
    .fill("20");
  await expect(
    page.getByRole("slider", { name: "Sky sound volume", exact: true }),
  ).toHaveValue("20");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page
    .getByRole("button", { name: "Trace next star", exact: true })
    .press("Enter");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as unknown as { __skyContexts: AudioContext[] }
        ).__skyContexts.every((context) => context.state === "closed"),
      ),
    )
    .toBe(true);
  const frames = await page.locator(".vsky-root").getAttribute("data-frames");
  await page.waitForTimeout(300);
  await expect(page.locator(".vsky-root")).toHaveAttribute(
    "data-frames",
    frames!,
  );
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await openSettings();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".vsky-root")).toHaveAttribute(
    "data-rendering",
    "paused",
  );
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as unknown as { __skyContexts: AudioContext[] }
        ).__skyContexts.every((context) => context.state === "closed"),
      ),
    )
    .toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await openSettings();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as unknown as { __skyContexts: AudioContext[] }
        ).__skyContexts.every((context) => context.state === "closed"),
      ),
    )
    .toBe(true);
});

test("a trace ends with rest and does not autoplay another round or save words", async ({
  page,
}) => {
  await page.goto("./");
  const before = await page.evaluate(() => JSON.stringify(localStorage));
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Worlds", exact: true })
    .click();
  await page.getByRole("button", { name: /Vast Sky/ }).click();
  await page
    .getByRole("button", { name: "write your own words", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "write it in stars", exact: true })
    .fill("I");
  await page.getByRole("button", { name: "trace it ✦", exact: true }).click();
  await page
    .getByRole("button", { name: "autoplay the current sky", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Trace again", exact: true }),
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.getByRole("button", { name: "autoplay the current sky", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  const traced = await page.locator(".vsky-root").getAttribute("data-traced");
  await page.waitForTimeout(1000);
  await expect(page.locator(".vsky-root")).toHaveAttribute(
    "data-traced",
    traced!,
  );
  await expect(page.getByRole("status")).toContainText("Let your hand rest");
  await page.getByRole("button", { name: "Trace again", exact: true }).click();
  await expect(page.locator(".vsky-root")).toHaveAttribute("data-traced", "0");
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
});

test("still sky, Spanish controls and unavailable graphics retain deliberate tracing", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "2d") return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.route(/vast-sky.*\.webp/, (route) => route.abort());
  await page.goto("./");
  await page
    .getByRole("button", { name: "Change language", exact: true })
    .click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Mundos", exact: true })
    .click();
  await page.getByRole("button", { name: /Cielo inmenso/ }).click();
  await expect(page.getByRole("status")).toContainText("no está disponible");
  await page
    .getByRole("button", { name: "Trazar la siguiente estrella", exact: true })
    .press("Enter");
  await expect(page.locator(".vsky-root")).toHaveAttribute("data-traced", "1");
  await expect(page.locator(".vsky-photo")).toHaveCSS("animation-name", "none");
  await page
    .getByRole("button", { name: "Cerrar experiencia", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("unavailable sky audio reports a silent fallback", async ({ page }) => {
  await page.addInitScript(() => {
    window.AudioContext = class {
      constructor() {
        throw new Error("audio blocked");
      }
    } as unknown as typeof AudioContext;
  });
  await page.goto("./");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Worlds", exact: true })
    .click();
  await page.getByRole("button", { name: /Vast Sky/ }).click();
  await page
    .getByRole("button", { name: "Sound & touch", exact: true })
    .click();
  await page.getByRole("button", { name: "Sky sound", exact: true }).click();
  await expect(
    page
      .getByRole("dialog", { name: "Sound and touch settings", exact: true })
      .getByRole("status"),
  ).toContainText("Sound is unavailable");
  await expect(
    page.getByRole("button", { name: "Sky sound", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Trace next star", exact: true })
    .press("Enter");
  await expect(page.locator(".vsky-root")).toHaveAttribute("data-traced", "1");
});
