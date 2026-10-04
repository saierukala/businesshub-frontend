import { test } from "@playwright/test";
import { USERS, loginPage } from "./helpers";

// Not a test: takes the README screenshots (docs/screenshots/*.png). It only runs when asked:
//   SCREENSHOTS=1 E2E_CHANNEL=msedge npx playwright test e2e/customer-path.e2e.ts e2e/screenshots.e2e.ts
// The customer path runs first, so there is a finished repair with a payment and a review to show.
test.skip(!process.env.SCREENSHOTS, "set SCREENSHOTS=1 to take the README screenshots");

const out = (name: string) => `docs/screenshots/${name}.png`;

test("README screenshots", async ({ browser }) => {
  const desktop = { width: 1280, height: 800 };

  const owner = await loginPage(browser, USERS.owner, desktop);
  await owner.goto("/staff");
  await owner.getByText("Technician workload").waitFor();
  await owner.waitForTimeout(800);
  await owner.screenshot({ path: out("staff-dashboard") });

  await owner.goto("/staff/reports?tab=bookings");
  await owner.getByText("Rescheduled").waitFor();
  await owner.waitForTimeout(800);
  await owner.screenshot({ path: out("staff-reports") });

  await owner.goto("/staff/audit");
  await owner.getByText("Booking created").first().waitFor();
  await owner.screenshot({ path: out("audit-log") });

  const ravi = await loginPage(browser, USERS.ravi, desktop);
  await ravi.goto("/home");
  await ravi.getByText("Recent visits").waitFor();
  await ravi.waitForTimeout(800);
  await ravi.screenshot({ path: out("customer-home") });

  await ravi.goto("/book");
  await ravi.getByRole("radio", { name: /LG Washing Machine/ }).click();
  await ravi.getByRole("button", { name: "Continue" }).click();
  await ravi.getByLabel("What is wrong?").fill("Machine is not draining water.");
  await ravi.screenshot({ path: out("booking-wizard") });

  // The technician's phone.
  const rahul = await loginPage(browser, USERS.rahul, { width: 390, height: 844 });
  await rahul.goto("/tech");
  await rahul.getByRole("link", { name: /Ravi Kumar/ }).first().waitFor();
  await rahul.waitForTimeout(800);
  await rahul.screenshot({ path: out("technician-phone") });
});
