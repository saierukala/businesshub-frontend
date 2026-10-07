import { mkdirSync } from "node:fs";
import type { Browser, Locator, Page } from "@playwright/test";
import { DEMO_PASSWORD, loginApi } from "../e2e/helpers";

// One scene = one video clip (demo-videos/NN-name.webm), recorded in its own browser window.
// Web only, 720p HD: the page (viewport) and the video are both exactly 1280x720 at scale 1, so nothing is cropped or scaled.
// Recorded headless by Playwright itself (page video, not a screen capture), so no desktop or other windows can appear.
const OUT = "demo-videos";
const SIZE = { width: 1280, height: 720 };

let count = 0;

// DEMO_SCENES=1,3,11 re-records only those clips. Every scene still plays (each one needs the data the earlier ones made),
// but only the listed clips are saved, so the good ones you already have are left alone.
const only = process.env.DEMO_SCENES?.split(",").map((s) => s.trim().padStart(2, "0"));
export const keep = (n: string) => !only || only.includes(n);

type SceneOptions = {
  typeLogin?: boolean; // start on the login page and type the email and password on camera (else already logged in)
  start?: string; // the first page
};

export async function scene(browser: Browser, name: string, email: string, opts: SceneOptions, play: (page: Page) => Promise<void>) {
  const n = String(++count).padStart(2, "0");
  mkdirSync(OUT, { recursive: true });

  // Log in through the API first, so the clip does not start with a login screen (unless asked to show it).
  const storageState = opts.typeLogin ? undefined : await (await loginApi(email)).storageState();
  const context = await browser.newContext({
    viewport: SIZE,
    deviceScaleFactor: 1,
    storageState,
    recordVideo: { dir: `${OUT}/raw`, size: SIZE },
  });
  await context.addInitScript(cursorScript);
  context.setDefaultTimeout(30_000); // a wrong step fails fast instead of hanging the recording
  const page = await context.newPage();

  if (opts.typeLogin) {
    await page.goto("/login");
    await pause(page, 1200);
    await type(page.getByLabel("Email"), email);
    await type(page.getByLabel("Password", { exact: true }), DEMO_PASSWORD);
    await page.getByRole("button", { name: "Log in" }).click();
    await page.waitForURL((url) => url.pathname !== "/login");
  } else {
    await page.goto(opts.start ?? "/");
  }
  if (opts.typeLogin && opts.start) await page.goto(opts.start);
  await settle(page, 2000);
  await checkLayout(page, `${n}-${name}-start`);

  let ok = false;
  try {
    await play(page);
    await checkLayout(page, `${n}-${name}-end`);
    await pause(page, 2500); // hold the last screen for a moment
    ok = true;
  } finally {
    const video = page.video();
    await context.close();
    if (ok && keep(n)) { // a scene that failed never replaces a good clip
      await video?.saveAs(`${OUT}/${n}-${name}.webm`);
      console.log(`  saved ${OUT}/${n}-${name}.webm`);
    }
    await video?.delete();
  }
}

// Human-ish pacing helpers.
export const pause = (page: Page, ms = 1500) => page.waitForTimeout(ms);

// Wait until the screen is fully drawn (no network traffic, no loading skeletons or spinners), then give the
// viewer time to read it. Use after every page load and every click that loads something.
export async function settle(page: Page, ms = 1500) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page
    .waitForFunction(() => !document.querySelector(".animate-pulse, .animate-spin, [aria-busy='true']"), null, { timeout: 15_000 })
    .catch(() => {}); // something that keeps spinning should not stop the recording
  await page.waitForTimeout(ms);
  // A toast is read during the pause above; let it go before the next action so it never covers what we click or show.
  await page.waitForFunction(() => !document.querySelector("[data-sonner-toast]"), null, { timeout: 10_000 }).catch(() => {});
}

// The app must look normal: nothing wider than the page (cut off on the right). A screenshot of each check is kept in
// demo-videos/checks/ so the start and end of every clip can be looked at without playing it.
async function checkLayout(page: Page, label: string) {
  await page.screenshot({ path: `${OUT}/checks/${label}.png` });
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  if (scrollWidth > innerWidth) throw new Error(`${label}: the page is ${scrollWidth}px wide in a ${innerWidth}px window (cut off)`);
}

export async function type(field: Locator, text: string) {
  await field.click();
  await field.pressSequentially(text, { delay: 100 });
}

// Smoothly scroll something into the middle of the screen (Playwright's own scrolling jumps).
export async function show(target: Locator, ms = 1200) {
  await target.first().evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
  await target.page().waitForTimeout(ms);
}

export async function scrollBy(page: Page, y: number, ms = 1200) {
  await page.evaluate((dy) => window.scrollBy({ top: dy, behavior: "smooth" }), y);
  await page.waitForTimeout(ms);
}

// Videos do not show the mouse. This draws a soft cursor that glides to each click and pulses on it.
// Only in the top page: Razorpay's secure window is left untouched.
const cursorScript = () => {
  if (window.top !== window) return;
  const add = () => {
    const style = document.createElement("style"); // no scrollbars in the video: the page still scrolls
    style.textContent = "html{scrollbar-width:none} ::-webkit-scrollbar{display:none}";
    document.head.appendChild(style);
    const dot = document.createElement("div");
    dot.style.cssText =
      "position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;z-index:2147483647;pointer-events:none;" +
      "background:rgba(37,99,235,.35);border:2px solid rgba(37,99,235,.9);transition:transform .35s ease-out, opacity .2s;transform:translate(-50px,-50px)";
    document.body.appendChild(dot);
    let x = -50;
    let y = -50;
    const at = (s = 1) => (dot.style.transform = `translate(${x}px,${y}px) scale(${s})`);
    document.addEventListener("mousemove", (e) => ((x = e.clientX), (y = e.clientY), at()), true);
    document.addEventListener("mousedown", () => at(0.6), true);
    document.addEventListener("mouseup", () => at(1), true);
  };
  if (document.body) add();
  else document.addEventListener("DOMContentLoaded", add);
};
