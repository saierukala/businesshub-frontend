import { defineConfig, type PlaywrightTestConfig } from "@playwright/test";
import config from "./playwright.config";
import { e2eDatabaseUrl } from "./e2e/env";

// The demo recorder (not a test): drives the whole app at human speed and saves one HD clip per part in demo-videos/.
//   npm run demo                (Edge by default; DEMO_CHANNEL=chrome to use Chrome, DEMO_HEADED=1 to watch it, but the clips come from the page itself, not the screen)
// Same two servers as the E2E run, but on its OWN database (businesshub_demo_e2e), wiped and re-seeded every run.
// Razorpay test keys come from the backend's .env (the API reads it itself), so "Pay online" works.
type WebServer = Extract<NonNullable<PlaywrightTestConfig["webServer"]>, unknown[]>[number];
const [api, web] = config.webServer as WebServer[];

export default defineConfig({
  ...config,
  testDir: "./demo",
  testMatch: "**/*.demo.ts",
  timeout: 20 * 60_000,
  retries: 0,
  reporter: "list",
  use: {
    ...config.use,
    channel: process.env.DEMO_CHANNEL || "msedge", // the real browser: Razorpay's checkout window works there
    headless: !process.env.DEMO_HEADED,
    launchOptions: { slowMo: 120, args: ["--window-size=1280,720"] }, // a little slower, like a person; a headed window matches the 1280x720 page
    video: "off", // each scene records its own clip (demo/scene.ts)
    trace: "off",
  },
  webServer: [
    { ...api, env: { ...api.env, DATABASE_URL: e2eDatabaseUrl("businesshub_demo_e2e", process.env.DEMO_DATABASE_URL) } },
    web,
  ],
});
