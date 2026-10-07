import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Where the backend repo is (next to this one by default; CI checks it out into ./backend).
export const BACKEND_DIR = resolve(process.env.BACKEND_DIR ?? "../BusinessHub-backend");

export const API_PORT = 4100;
export const WEB_PORT = 3100;
export const WEB_URL = `http://localhost:${WEB_PORT}`;

// The E2E run uses its OWN database, which is wiped and re-seeded before every run. Never the dev database.
// `override` (E2E_DATABASE_URL) wins; otherwise take the backend's DATABASE_URL and swap the database name for `name`.
// The demo recorder passes its own name and override, so it never shares the tests' database.
export function e2eDatabaseUrl(name = "businesshub_e2e", override = process.env.E2E_DATABASE_URL): string {
  let url = override;
  if (!url) {
    const envFile = resolve(BACKEND_DIR, ".env");
    const dev = existsSync(envFile) ? readFileSync(envFile, "utf8").match(/^DATABASE_URL="?([^"\r\n]+)"?/m)?.[1] : undefined;
    if (!dev) throw new Error("Set E2E_DATABASE_URL (a Postgres database whose name contains 'e2e').");
    url = dev.replace(/\/[^/?]+(\?|$)/, `/${name}$1`);
  }
  const dbName = new URL(url).pathname.slice(1);
  if (!dbName.includes("e2e")) throw new Error(`Refusing to wipe database "${dbName}": the E2E database name must contain "e2e".`);
  return url;
}

export const JWT_SECRET = "e2e-only-secret-e2e-only-secret-e2e-only-secret-0123456789";
