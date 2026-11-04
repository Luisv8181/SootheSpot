import { expect, test } from "@playwright/test";

async function openForest(page: import("@playwright/test").Page) {
  await page.goto("./");
  await page.getByRole("navigation").getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: /Listening Forest/ }).click();
  const world = page.getByRole("dialog", { name: "Listening Forest", exact: true });
  await expect(world).toBeVisible();
  await expect(world.locator(".listening-forest")).toHaveAttribute("data-artwork", /^(ready|fallback)$/);
  return world;
}

test("forest clearings, keyboard and pointer exploration, optional invitations, and walking work", async ({ page }) => {
  const world = await openForest(page);
  const scene = world.locator(".listening-forest");
  const surface = world.getByRole("button", { name: "Explore the Listening Forest", exact: true });
  await expect(world.getByRole("button", { name: "Forest sound", exact: false })).toHaveAttribute("aria-pressed", "false");
  await surface.focus();
  for (const [key, station] of [["1", "0"], ["2", "1"], ["3", "2"], ["4", "3"]]) {
    await page.keyboard.press(key);
    await expect(scene).toHaveAttribute("data-station", station);
  }
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");
  const canvas = world.locator(".forest-surface canvas");
  const positionBeforePointer = await canvas.getAttribute("data-position");
  const box = (await surface.boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.68, box.y + box.height * 0.35);
  await expect.poll(() => canvas.getAttribute("data-position")).not.toBe(positionBeforePointer);
  await world.getByRole("button", { name: "Walk left", exact: true }).click();
  await world.getByRole("button", { name: "Walk right", exact: true }).click();
  await world.getByRole("button", { name: "Breathing grove", exact: true }).click();
  await world.getByRole("button", { name: "Try this pause", exact: true }).click();
  await expect(world.getByText("Let the flowers set a gentle rhythm.")).toBeVisible();
  await world.getByRole("button", { name: "Next invitation", exact: true }).click();
  await expect(world.getByText(/If comfortable, breathe in/)).toBeVisible();
  await world.getByRole("button", { name: "Just wander", exact: true }).click();
  await expect(world.getByRole("button", { name: "Try this pause", exact: true })).toBeVisible();
  await world.getByRole("button", { name: "Lantern pool", exact: true }).click();
  await world.getByRole("button", { name: "Release a light", exact: true }).click();
});

test("canvas advances while running, freezes paused, and stays still when requested", async ({ page }) => {
  const world = await openForest(page);
  const canvas = world.locator(".forest-surface canvas");
  await world.getByRole("button", { name: "Start", exact: true }).click();
  const runningFrame = Number(await canvas.getAttribute("data-frames"));
  const firstPixels = await canvas.evaluate(node=>(node as HTMLCanvasElement).toDataURL());
  await expect.poll(async () => Number(await canvas.getAttribute("data-frames"))).toBeGreaterThan(runningFrame);
  await expect.poll(()=>canvas.evaluate(node=>(node as HTMLCanvasElement).toDataURL())).not.toBe(firstPixels);
  await world.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(world.locator(".listening-forest")).toHaveAttribute("data-motion", "still");
  // Let the deliberate pause/cleared-mark redraw settle before checking that scheduling stopped.
  await page.waitForTimeout(100);
  const pausedFrame = Number(await canvas.getAttribute("data-frames"));
  await page.waitForTimeout(160);
  expect(Number(await canvas.getAttribute("data-frames"))).toBe(pausedFrame);
  await world.getByRole("button", { name: "Resume", exact: true }).click();
  await world.getByRole("button", { name: "Lantern pool", exact: true }).click();
  await world.getByRole("button", { name: "Release a light", exact: true }).click();
  await expect(world.locator(".listening-forest")).toHaveAttribute("data-lights", "1");
  await page.clock.install();
  await page.clock.fastForward(5000);
  await world.getByRole("checkbox", { name: "Still visuals", exact: true }).check();
  await expect(world.locator(".listening-forest")).toHaveAttribute("data-lights", "0");
  await page.waitForTimeout(100);
  const stillFrame = Number(await canvas.getAttribute("data-frames"));
  await page.waitForTimeout(160);
  expect(Number(await canvas.getAttribute("data-frames"))).toBe(stillFrame);
  await expect(world.locator(".listening-forest")).toHaveAttribute("data-motion", "still");
});

test("reduced motion retains accurate wide-screen navigation and deliberate touch lights", async ({page,context})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.setViewportSize({width:1600,height:900});
  const world=await openForest(page),canvas=world.locator("canvas"),surface=world.getByRole("button",{name:"Explore the Listening Forest",exact:true});
  await expect(world.getByRole("checkbox",{name:"Still visuals",exact:true})).toBeChecked();
  await surface.scrollIntoViewIfNeeded();
  const box=(await surface.boundingBox())!;
  const expected=await canvas.evaluate(node=>{const c=node as HTMLCanvasElement;return Math.min(.94,(c.width/c.height*480)*.8/1440);});
  await page.mouse.click(box.x+box.width*.8,box.y+box.height*.86);
  await expect.poll(async()=>Math.abs(Number(await canvas.getAttribute("data-position"))-expected)).toBeLessThan(.005);
  await world.getByRole("button",{name:"Lantern pool",exact:true}).click();
  await surface.scrollIntoViewIfNeeded();const pool=(await surface.boundingBox())!;
  const session=await context.newCDPSession(page);
  await session.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:pool.x+pool.width*.7,y:pool.y+pool.height*.7,id:1}]});
  await session.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});await session.detach();
  await expect(world.locator(".listening-forest")).toHaveAttribute("data-lights","1");
  const still=await canvas.evaluate(node=>(node as HTMLCanvasElement).toDataURL());await page.waitForTimeout(180);
  expect(await canvas.evaluate(node=>(node as HTMLCanvasElement).toDataURL())).toBe(still);
});

test("unavailable forest audio leaves exploration usable",async({page})=>{
  await page.addInitScript(()=>{window.AudioContext=class{constructor(){throw new Error("Unavailable");}} as unknown as typeof AudioContext;});
  const world=await openForest(page);
  await world.getByRole("button",{name:"Forest sound",exact:true}).click();
  await expect(world.getByRole("button",{name:"Forest sound",exact:true})).toHaveAttribute("aria-pressed","false");
  await expect(world.getByRole("status").filter({hasText:/Sound unavailable/})).toBeVisible();
  await world.getByRole("button",{name:"Waterfall clearing",exact:true}).click();
  await expect(world.locator(".listening-forest")).toHaveAttribute("data-station","2");
});

test("forest audio is opt-in, suspends without visibility auto-resume, and closes at completion and exit", async ({ page }) => {
  await page.addInitScript(() => {
    const NativeAudio = window.AudioContext;
    const contexts: AudioContext[] = [];
    Object.defineProperty(window, "__forestContexts", { value: contexts });
    window.AudioContext = class extends NativeAudio {
      constructor(options?: AudioContextOptions) { super(options); contexts.push(this); }
    };
  });
  const world = await openForest(page);
  const states = () => page.evaluate(() => (window as unknown as { __forestContexts: AudioContext[] }).__forestContexts.map(context => context.state));
  const sound = world.getByRole("button", { name: "Forest sound", exact: false });
  expect(await states()).toEqual([]);
  await sound.click();
  await expect.poll(states).toEqual(["running"]);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(states).toEqual(["suspended"]);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); document.dispatchEvent(new Event("visibilitychange")); });
  await page.waitForTimeout(150);
  expect(await states()).toEqual(["suspended"]);
  await world.getByRole("button", { name: "Reset", exact: true }).click();
  await expect.poll(states).toEqual(["closed"]);
  await sound.click();
  await expect.poll(states).toEqual(["closed", "running"]);
  await page.clock.install();
  await page.clock.fastForward(481000);
  await expect(world.getByRole("button", { name: "Return to Worlds", exact: true })).toBeVisible();
  await expect.poll(states).toEqual(["closed", "closed"]);
  await page.getByRole("button", { name: "Close experience", exact: true }).click();
  await expect(world).toHaveCount(0);
});

test("forest interactions do not write local storage", async ({ page }) => {
  const world = await openForest(page);
  const before = await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()));
  await world.getByRole("button", { name: "Breathing grove", exact: true }).click();
  await world.getByRole("button", { name: "Try this pause", exact: true }).click();
  await world.getByRole("button", { name: "Just wander", exact: true }).click();
  await world.getByRole("button", { name: "Lantern pool", exact: true }).click();
  await world.getByRole("button", { name: "Release a light", exact: true }).click();
  expect(await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()))).toBe(before);
});

test("missing forest artwork uses the fallback and controls remain available", async ({ page }) => {
  await page.route(/listening-forest.*\.webp(\?.*)?$/, route => route.abort());
  const world = await openForest(page);
  await expect(world.locator(".listening-forest")).toHaveAttribute("data-artwork", "fallback");
  await world.getByRole("button", { name: "Waterfall clearing", exact: true }).click();
  await expect(world.getByRole("button", { name: "Try this pause", exact: true })).toBeVisible();
});

test("missing canvas context reports the simple forest while controls remain usable", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = function () { return null; };
  });
  const world = await openForest(page);
  await expect(world.getByRole("status").filter({ hasText: "A simpler forest is available" })).toBeVisible();
  await world.getByRole("button", { name: "Waterfall clearing", exact: true }).click();
  await expect(world.locator(".listening-forest")).toHaveAttribute("data-station", "2");
});

test("Spanish forest controls and desktop/mobile layout remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("./");
  await page.getByRole("button", { name: "Change language", exact: true }).click();
  await page.getByRole("navigation").getByRole("button", { name: "Mundos", exact: true }).click();
  await page.getByRole("button", { name: /Bosque que escucha/ }).click();
  const world = page.getByRole("dialog", { name: "Bosque que escucha", exact: true });
  for (const [viewport, name] of [[{ width: 1280, height: 800 }, "desktop"], [{ width: 390, height: 844 }, "mobile"]] as const) {
    await page.setViewportSize(viewport);
    const surface = world.getByRole("button", { name: "Explorar el bosque", exact: true });
    const box = await surface.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    await expect(world.getByRole("button", { name: "Claro de la cascada", exact: true })).toBeVisible();
    await expect(world.getByRole("button", { name: "Caminar a la derecha", exact: true })).toBeVisible();
    await page.screenshot({ path: test.info().outputPath(`listening-forest-${name}.png`) });
  }
  await world.getByRole("button", { name: "Estanque de luces", exact: true }).click();
  await expect(world.getByRole("button", { name: "Soltar una luz", exact: true })).toBeVisible();
  await world.getByRole("button", { name: "Probar esta pausa", exact: true }).click();
  await expect(world.getByRole("button", { name: "Siguiente invitación", exact: true })).toBeVisible();
});
