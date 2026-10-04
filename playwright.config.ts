import { defineConfig } from "@playwright/test";
import { API_PORT, BACKEND_DIR, JWT_SECRET, WEB_PORT, WEB_URL, e2eDatabaseUrl } from "./e2e/env";

// One end-to-end test per path (spec §18): A = customer self-service, B = staff books for a phone customer.
// Two servers are started for the run: the API (port 4100, its own database) and this Next.js app (port 3100)
// that proxies /api/* to it, exactly like production.
//   Locally, to use your installed Edge/Chrome instead of downloading a browser:  E2E_CHANNEL=msedge npx playwright test
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1, // both paths share one database and one technician pool, so they run one after the other
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: WEB_URL,
    locale: "en-IN", // the calendar's day buttons are labelled in this locale
    timezoneId: "Asia/Kolkata",
    channel: process.env.E2E_CHANNEL || undefined,
    video: process.env.E2E_VIDEO ? { mode: "on", size: { width: 1280, height: 720 } } : "off", // E2E_VIDEO=1 records both paths (test-results/**/video.webm): a ready-made demo clip
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      // First apply every migration (including the no-overlap constraint), then empty the E2E database and load the demo seed,
      // so every run starts from the same data. Then start the API.
      // NODE_ENV=test: no auth rate limit (the tests log in many times) and no pg-boss worker needed.
      command: "npx prisma migrate deploy && npm run e2e:reset && npx tsx src/server.ts",
      cwd: BACKEND_DIR,
      url: `http://localhost:${API_PORT}/health/ready`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NODE_ENV: "test",
        PORT: String(API_PORT),
        DATABASE_URL: e2eDatabaseUrl(),
        JWT_SECRET,
        FRONTEND_URL: WEB_URL,
        LOG_LEVEL: "warn",
      },
    },
    {
      command: process.env.E2E_FRONTEND_CMD ?? `npm run build && npx next start -p ${WEB_PORT}`,
      url: WEB_URL,
      reuseExistingServer: false,
      timeout: 300_000,
      env: { BACKEND_URL: `http://localhost:${API_PORT}` },
    },
  ],
});
