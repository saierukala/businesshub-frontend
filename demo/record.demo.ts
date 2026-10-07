import { expect, test, type Page } from "@playwright/test";
import { USERS, createCustomer, loginApi, visitDay } from "../e2e/helpers";
import { keep, pause, scene, scrollBy, settle, show, type } from "./scene";

// Not a test: records the LinkedIn demo, one clip per part, in story order (see docs/DEMO.md).
//   npm run demo
test.skip(!!process.env.CI, "the demo recorder only runs on a developer machine");

test("record the demo", async ({ browser }) => {
  const staffApi = await loginApi(USERS.manager);
  let bookingId = "";

  // ---- 1. Ravi logs in and books a washing machine repair (5 steps) ----
  await scene(browser, "customer-books-a-repair", USERS.ravi, { typeLogin: true }, async (ravi) => {
    await pause(ravi, 1500);
    await ravi.getByRole("link", { name: "Book a repair" }).first().click();
    await settle(ravi);
    await ravi.getByRole("radio", { name: /LG Washing Machine/ }).click();
    await next(ravi);
    await type(ravi.getByLabel("What is wrong?"), "Machine is not draining water.");
    await ravi.getByRole("radio", { name: /Washing Machine Repair/ }).click();
    await next(ravi);
    await ravi.getByRole("radio", { name: /Home/ }).click();
    await next(ravi);
    await pickSlot(ravi, "10:00 am");
    await pause(ravi);
    await next(ravi);
    await pause(ravi, 2000); // the review step
    await ravi.getByRole("button", { name: "Confirm booking" }).click();
    await ravi.waitForURL(/\/bookings\/[0-9a-f-]{36}$/);
    bookingId = ravi.url().split("/").pop()!;
    await expect(ravi.getByText("Confirmed", { exact: true }).first()).toBeVisible();
    await pause(ravi, 2000);
  });

  // ---- 2. The manager sees it on the dashboard and assigns Rahul ----
  await scene(browser, "manager-assigns-technician", USERS.manager, { start: "/staff" }, async (m) => {
    await pause(m, 1500);
    await m.goto(`/staff/bookings/${bookingId}`);
    await settle(m, 1500);
    await m.getByRole("button", { name: "Assign technician" }).click();
    await settle(m);
    await m.getByRole("radio", { name: /Rahul Sharma/ }).click();
    await settle(m, 800);
    await Promise.all([
      m.waitForResponse((r) => r.url().includes(`/bookings/${bookingId}/assign`) && r.ok()),
      m.getByRole("dialog").getByRole("button", { name: "Assign", exact: true }).click(),
    ]);
    await pause(m, 1500);
  });

  // ---- 3. Rahul (technician view): on the way, arrived, start work, extra charge ----
  await scene(browser, "technician-on-the-job", USERS.rahul, { start: "/tech" }, async (r) => {
    await r.getByRole("link", { name: /Ravi Kumar/ }).click();
    await settle(r, 1500);
    for (const step of ["I'm on my way", "I've arrived", "Start work"]) {
      await r.getByRole("button", { name: step }).click();
      await settle(r, 1500);
    }
    await expect(r.getByRole("button", { name: "Complete visit" })).toBeVisible();
    await r.getByRole("button", { name: "Extra work needed" }).click();
    await settle(r, 800);
    await type(r.getByLabel("Extra amount (₹)"), "300");
    await type(r.getByLabel("What is the extra work?"), "Drain pump clean");
    await r.getByRole("button", { name: "Ask the customer to approve" }).click();
    await settle(r);
    await show(r.getByText("Waiting for the customer to answer the extra charge."), 2000);
  });

  // ---- 4. Ravi approves the extra charge ----
  await scene(browser, "customer-approves-extra-charge", USERS.ravi, { start: `/bookings/${bookingId}` }, async (ravi) => {
    await show(ravi.getByText("The technician needs your approval"), 2000);
    await ravi.getByRole("button", { name: "Approve" }).click();
    await expect(ravi.getByText("The technician needs your approval")).toBeHidden();
    await pause(ravi, 1500);
  });

  // ---- 5. Rahul completes the visit (the customer will pay online) ----
  await scene(browser, "technician-completes-visit", USERS.rahul, { start: `/tech` }, async (r) => {
    await r.getByRole("link", { name: /Ravi Kumar/ }).click();
    await settle(r, 1200);
    await type(r.getByLabel("What did you find?"), "Drain pump blockage");
    await type(r.getByLabel("What did you do?"), "Pump cleaned, hose checked, machine tested");
    await r.getByRole("button", { name: "Complete visit" }).click();
    await settle(r);
    await show(r.getByText("₹799").first(), 2500);
  });

  // ---- 6. Ravi pays ₹799 online: checkout page, Razorpay (test Netbanking), Payment successful, receipt ----
  await scene(browser, "customer-pays-online", USERS.ravi, { start: `/bookings/${bookingId}` }, async (ravi) => {
    const payLink = ravi.getByRole("link", { name: /Pay ₹799 online/ });
    await show(payLink, 1800);
    await payLink.click();
    await expect(ravi.getByRole("heading", { name: "Pay for your repair" })).toBeVisible();
    await pause(ravi, 2500);
    await ravi.getByRole("button", { name: /Pay ₹799 securely/ }).click();
    await payWithTestNetbanking(ravi, "06b");
    await expect(ravi.getByRole("heading", { name: "Payment successful" })).toBeVisible({ timeout: 60_000 });
    await pause(ravi, 3000);
    await ravi.getByRole("link", { name: "View receipt" }).click();
    await settle(ravi, 2000);
    await scrollBy(ravi, 400, 2000);
  });

  // ---- 7. Ravi rates the repair ----
  await scene(browser, "customer-reviews", USERS.ravi, { start: `/bookings/${bookingId}` }, async (ravi) => {
    const stars = ravi.getByRole("radio", { name: /5 stars/ });
    await show(stars);
    await stars.click();
    await type(ravi.getByLabel("Comment (optional)"), "Quick and tidy work");
    await ravi.getByRole("button", { name: "Submit review" }).click();
    await settle(ravi);
    await show(ravi.getByRole("heading", { name: "Your review" }), 2000);
  });

  // ---- 8. The owner: dashboard (revenue), reports, audit log ----
  await scene(browser, "owner-dashboard-reports-audit", USERS.owner, { start: "/staff" }, async (o) => {
    await o.getByText("Technician workload").waitFor();
    await pause(o, 2500);
    await scrollBy(o, 500, 2000);
    await scrollBy(o, 500, 2000);
    // Reports, Revenue tab: the ₹799 paid today. (The Bookings tab counts visits by visit day, which is tomorrow,
    // so in this fresh demo database it would only show zeros.)
    await o.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Reports" }).click();
    await settle(o);
    await o.getByRole("tab", { name: "Revenue" }).or(o.getByRole("link", { name: "Revenue" })).or(o.getByRole("button", { name: "Revenue" })).first().click();
    await settle(o, 3000);
    await scrollBy(o, 400, 2000);
    await o.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Audit log" }).click();
    await settle(o);
    await o.getByText("Booking created").first().waitFor();
    await pause(o, 3000);
  });

  // ---- 9. Priya calls: the manager books an AC repair for her (staff path, phone-only customer) ----
  // Off camera: Suresh also repairs ACs in Gachibowli, so scene 10 has someone to reassign to.
  await prepareSecondAcTechnician(staffApi);
  let priyaBookingId = "";
  await scene(browser, "phone-booking-for-priya", USERS.manager, { start: "/staff/bookings/new" }, async (m) => {
    const phone = "9000000123";
    await type(m.getByLabel("Search customers"), phone);
    await expect(m.getByText("No customer found")).toBeVisible();
    await pause(m);
    await m.getByRole("button", { name: "New customer" }).click();
    await type(m.getByLabel("Full name"), "Priya Menon");
    await type(m.getByLabel("Mobile number"), phone);
    await m.getByRole("button", { name: "Create customer" }).click();
    await expect(m.getByText("Booking for")).toBeVisible();
    await pause(m);

    await m.getByRole("button", { name: "Add another appliance" }).click();
    await m.getByLabel("Appliance type").click();
    await m.getByRole("option", { name: "Air Conditioner" }).click();
    await type(m.getByLabel("Brand"), "Daikin");
    await m.getByRole("button", { name: "Add appliance" }).click();
    await m.getByRole("radio", { name: /Daikin Air Conditioner/ }).click();
    await next(m);

    await type(m.getByLabel("What is wrong?"), "AC is not cooling.");
    await m.getByRole("radio", { name: /AC Repair/ }).click();
    await next(m);

    await m.getByRole("button", { name: "Add another address" }).click();
    await type(m.getByLabel("House / flat and street"), "Villa 12, Green Meadows");
    await type(m.getByLabel("Area"), "Gachibowli");
    await m.getByRole("button", { name: "Add address" }).click();
    await m.getByRole("radio", { name: /Gachibowli/ }).click();
    await next(m);

    await pickSlot(m, "10:00 am");
    await pause(m);
    await next(m);
    await m.getByLabel("Where did this booking come from?").click();
    await m.getByRole("option", { name: "Phone call" }).click();
    await settle(m, 1500);
    await m.getByRole("button", { name: "Confirm booking" }).click();
    await m.waitForURL(/\/staff\/bookings\/[0-9a-f-]{36}$/);
    priyaBookingId = m.url().split("/").pop()!;
    await show(m.getByText("Priya Menon has no email"), 2500);
  });

  // ---- 10. Priya's technician is sick: time off flags the booking; the manager reassigns it ----
  const priya = await (await staffApi.get(`/api/bookings/${priyaBookingId}`)).json();
  const replacement = priya.technician.name === "Arjun Reddy" ? "Suresh Kumar" : "Arjun Reddy";
  await scene(browser, "time-off-and-reassignment", USERS.manager, { start: `/staff/technicians/${priya.technician.id}` }, async (m) => {
    await pause(m, 1500);
    await m.getByRole("button", { name: "Add time off" }).first().click();
    const dialog = m.getByRole("dialog");
    await dialog.getByLabel("First day off").fill(visitDay().iso);
    await dialog.getByLabel("Last day off").fill(visitDay().iso);
    await pause(m, 1000);
    await dialog.getByRole("button", { name: "Add time off" }).click();
    await show(m.getByText(/1 booking in this period now needs reassignment/), 2500);

    await m.goto("/staff/reassignments");
    await settle(m);
    await m.getByText(priya.bookingNumber).waitFor();
    await pause(m, 2500);
    await m.goto(`/staff/bookings/${priyaBookingId}`);
    await settle(m);
    await show(m.getByText("Needs a new technician"), 2000);
    await m.getByRole("button", { name: /Assign technician|Change technician/ }).click();
    await settle(m);
    await m.getByRole("radio", { name: new RegExp(replacement) }).click();
    await settle(m, 800);
    await m.getByRole("dialog").getByRole("button", { name: /^(Assign|Change technician)$/ }).click();
    await expect(m.getByText("Needs a new technician")).toBeHidden();
    await pause(m, 2000);
  });

  // ---- 11. No double booking: someone else takes Rahul's 2:00 pm while the manager is still on the review step ----
  await scene(browser, "double-booking-refused", USERS.manager, { start: "/staff/bookings/new" }, async (m) => {
    await type(m.getByLabel("Search customers"), "Ravi");
    await m.getByRole("button", { name: /Ravi Kumar/ }).click();
    await m.getByRole("radio", { name: /LG Washing Machine/ }).click();
    await next(m);
    await type(m.getByLabel("What is wrong?"), "Door does not lock.");
    await m.getByRole("radio", { name: /Washing Machine Repair/ }).click();
    await next(m);
    await m.getByRole("radio", { name: /Home/ }).click();
    await next(m);
    await pickSlot(m, "2:00 pm");
    await m.locator("#technician").click();
    await m.getByRole("option", { name: "Rahul Sharma" }).click();
    await settle(m);
    await next(m);
    await pause(m, 1500);

    await m.getByLabel("Where did this booking come from?").click();
    await m.getByRole("option", { name: "Phone call" }).click();
    await pause(m);

    await takeRahulAt(staffApi, "14:00"); // the other booking lands first (off camera)

    await m.getByRole("button", { name: "Confirm booking" }).click();
    await m.getByText(/no longer available|just taken|not available/i).first().waitFor();
    await pause(m, 3500); // the error, and the wizard back on the time step with a fresh list
  });
});

const next = async (page: Page) => {
  await page.getByRole("button", { name: "Continue" }).click();
  await settle(page);
};

// Step 4 of the booking flow at a viewer's pace: open the calendar, pick the visit day, wait for the free times, pick one.
async function pickSlot(page: Page, time: string) {
  await page.locator("#booking-date").click();
  await settle(page, 1000);
  await page.locator(`button[data-day="${visitDay().calendarButton}"]`).click();
  await settle(page);
  await page.getByRole("radio", { name: time, exact: true }).click();
  await settle(page);
}

// Razorpay's test checkout (an iframe from api.razorpay.com). The test account offers Cards, Netbanking and Wallet
// (no UPI on desktop), so: Netbanking → a bank → Razorpay's mock bank window → "Success". No card numbers needed.
// The mock bank window is a popup; it is saved as its own clip (NN-razorpay-bank-window.webm).
async function payWithTestNetbanking(page: Page, clipPrefix: string) {
  const frame = page.locator("iframe.razorpay-checkout-frame").contentFrame();
  try {
    await frame.getByText("Netbanking", { exact: true }).first().click({ timeout: 30_000 });
    await pause(page, 1500);
    const popup = page.waitForEvent("popup", { timeout: 25_000 }); // may open on the bank click or on Pay
    await frame.getByText("Canara Bank", { exact: true }).first().click(); // a bank from "Suggested Banks"
    await pause(page, 1200);
    const payNow = frame.getByRole("button", { name: /^(Pay|Continue|Proceed)/ }).first();
    if (await payNow.isVisible()) await payNow.click();
    const bank = await popup;
    await bank.waitForLoadState();
    await bank.waitForTimeout(2000);
    await bank.getByRole("button", { name: /^success$/i }).or(bank.getByText(/^success$/i)).first().click();
    if (!bank.isClosed()) await bank.waitForEvent("close", { timeout: 20_000 }).catch(() => bank.close());
    if (keep("06")) await bank.video()?.saveAs(`demo-videos/${clipPrefix}-razorpay-bank-window.webm`);
  } catch (err) {
    await page.screenshot({ path: "test-results/razorpay-at-failure.png" }).catch(() => {});
    throw err;
  }
}

async function prepareSecondAcTechnician(staffApi: Awaited<ReturnType<typeof loginApi>>) {
  type Tech = { id: string; name: string; skills: { id: string }[]; areas: string[] };
  const techs = (await (await staffApi.get("/api/technicians?pageSize=100")).json()).items as Tech[];
  const categories = (await (await staffApi.get("/api/service-categories?pageSize=100")).json()).items as { id: string; name: string }[];
  const ac = categories.find((c) => c.name === "Air Conditioner")!;
  const suresh = techs.find((t) => t.name === "Suresh Kumar")!;
  await staffApi.put(`/api/technicians/${suresh.id}/skills`, { data: { categoryIds: [...suresh.skills.map((s) => s.id), ac.id] } });
  await staffApi.put(`/api/technicians/${suresh.id}/areas`, { data: { areas: [...suresh.areas, "Gachibowli"] } });
}

// Another customer books Rahul at the given IST time on the visit day, straight through the API.
async function takeRahulAt(staffApi: Awaited<ReturnType<typeof loginApi>>, time: string) {
  const other = await createCustomer(staffApi, "Second Customer", "9000000099");
  const techs = (await (await staffApi.get("/api/technicians?pageSize=100")).json()).items as { id: string; name: string }[];
  const services = (await (await staffApi.get("/api/services?pageSize=100")).json()).items as { id: string; name: string }[];
  const res = await staffApi.post("/api/bookings", {
    data: {
      customerId: other.id,
      applianceId: other.applianceId,
      serviceId: services.find((s) => s.name === "Washing Machine Repair")!.id,
      addressId: other.addressId,
      problemDescription: "Booked by phone a moment earlier",
      startAt: new Date(`${visitDay().iso}T${time}:00+05:30`).toISOString(),
      source: "PHONE",
      technicianId: techs.find((t) => t.name === "Rahul Sharma")!.id,
    },
  });
  expect(res.status(), await res.text()).toBe(201);
}
