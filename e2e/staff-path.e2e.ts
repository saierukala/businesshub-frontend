import { expect, test } from "@playwright/test";
import { USERS, loginApi, loginPage, pickSlot, visitDay } from "./helpers";

// Scenario B (spec §18): Priya (a new phone-only customer) calls. The manager books an AC repair for her with
// source PHONE; the audit log names the manager as the creator. Then the technician is marked sick, the booking
// is flagged "needs reassignment", and the manager moves it to another qualified technician.
test("staff books for a phone customer, then reassigns after the technician's time off", async ({ browser }) => {
  const staffApi = await loginApi(USERS.manager);
  const phone = "9000000123";

  // Setup through the API: a second technician who can also repair ACs in Gachibowli, so a reassignment is possible.
  const technicians = (await (await staffApi.get("/api/technicians?pageSize=100")).json()).items as {
    id: string;
    name: string;
    skills: { id: string; name: string }[];
    areas: string[];
  }[];
  const categories = (await (await staffApi.get("/api/service-categories?pageSize=100")).json()).items as { id: string; name: string }[];
  const ac = categories.find((c) => c.name === "Air Conditioner")!;
  const suresh = technicians.find((t) => t.name === "Suresh Kumar")!;
  await staffApi.put(`/api/technicians/${suresh.id}/skills`, { data: { categoryIds: [...suresh.skills.map((s) => s.id), ac.id] } });
  await staffApi.put(`/api/technicians/${suresh.id}/areas`, { data: { areas: [...suresh.areas, "Gachibowli"] } });

  const manager = await loginPage(browser, USERS.manager);

  // ---- 1. Search by phone: no record, so create Priya (phone only, no email) ----
  await manager.goto("/staff/bookings/new");
  await manager.getByLabel("Search customers").fill(phone);
  await expect(manager.getByText("No customer found")).toBeVisible();
  await manager.getByRole("button", { name: "New customer" }).click();
  await manager.getByLabel("Full name").fill("Priya Menon");
  await manager.getByLabel("Mobile number").fill(phone);
  await manager.getByRole("button", { name: "Create customer" }).click();
  await expect(manager.getByText("Booking for")).toBeVisible();

  // ---- 2. Her AC and her address ----
  await manager.getByRole("button", { name: "Add another appliance" }).click();
  await manager.getByLabel("Appliance type").click();
  await manager.getByRole("option", { name: "Air Conditioner" }).click();
  await manager.getByLabel("Brand").fill("Daikin");
  await manager.getByRole("button", { name: "Add appliance" }).click();
  await manager.getByRole("radio", { name: /Daikin Air Conditioner/ }).click();
  await manager.getByRole("button", { name: "Continue" }).click();

  await manager.getByLabel("What is wrong?").fill("AC is not cooling.");
  await manager.getByRole("radio", { name: /AC Repair/ }).click();
  await manager.getByRole("button", { name: "Continue" }).click();

  await manager.getByRole("button", { name: "Add another address" }).click();
  await manager.getByLabel("House / flat and street").fill("Villa 12, Green Meadows");
  await manager.getByLabel("Area").fill("Gachibowli");
  await manager.getByRole("button", { name: "Add address" }).click();
  await manager.getByRole("radio", { name: /Gachibowli/ }).click();
  await manager.getByRole("button", { name: "Continue" }).click();

  // ---- 3. The slot, the source, confirm ----
  await pickSlot(manager, "10:00 am");
  await manager.getByRole("button", { name: "Continue" }).click();
  await manager.getByLabel("Where did this booking come from?").click();
  await manager.getByRole("option", { name: "Phone call" }).click();
  await manager.getByRole("button", { name: "Confirm booking" }).click();
  await manager.waitForURL(/\/staff\/bookings\/[0-9a-f-]{36}$/);
  const bookingId = manager.url().split("/").pop()!;
  await expect(manager.getByText("Priya Menon ·")).toBeVisible();

  // The audit log (owner) shows the manager as the creator.
  const owner = await loginApi(USERS.owner);
  const audit = await (await owner.get(`/api/audit-logs?entityType=Booking&entityId=${bookingId}`)).json();
  const created = audit.items.find((a: { action: string }) => a.action.includes("CREATED"));
  expect(created.user.name).toBe("Vikram Singh");
  expect(JSON.stringify(created.metadata)).toContain("PHONE");

  // ---- 4. The assigned technician is sick that day: the booking is flagged, not moved or deleted ----
  const booking = await (await staffApi.get(`/api/bookings/${bookingId}`)).json();
  const original = booking.technician.name as string;
  const replacement = original === "Arjun Reddy" ? "Suresh Kumar" : "Arjun Reddy";
  await manager.goto(`/staff/technicians/${booking.technician.id}`);
  await manager.getByRole("button", { name: "Add time off" }).first().click();
  const dialog = manager.getByRole("dialog");
  await dialog.getByLabel("First day off").fill(visitDay().iso);
  await dialog.getByLabel("Last day off").fill(visitDay().iso);
  await dialog.getByRole("button", { name: "Add time off" }).click();
  await expect(manager.getByText(/1 booking in this period now needs reassignment/)).toBeVisible();

  // ---- 5. The reassignment queue; the manager picks another qualified, free technician ----
  await manager.goto("/staff/reassignments");
  await manager.getByRole("link", { name: booking.bookingNumber }).click();
  await expect(manager.getByText("Needs a new technician")).toBeVisible();
  await manager.getByRole("button", { name: /Assign technician|Change technician/ }).click();
  await manager.getByRole("radio", { name: new RegExp(replacement) }).click();
  await manager.getByRole("dialog").getByRole("button", { name: /^(Assign|Change technician)$/ }).click();
  await expect(manager.getByText("Needs a new technician")).toBeHidden();
  await expect(manager.getByText(replacement).first()).toBeVisible();

  // ---- 6. The history shows every change ----
  const after = await (await staffApi.get(`/api/bookings/${bookingId}`)).json();
  expect(after.technician.name).toBe(replacement);
  expect(after.needsReassignment).toBe(false);
  const actions = (await (await owner.get(`/api/audit-logs?entityType=Booking&entityId=${bookingId}`)).json()).items.map((a: { action: string }) => a.action);
  expect(actions).toEqual(expect.arrayContaining(["BOOKING_CREATED", "BOOKING_FLAGGED_REASSIGNMENT", "TECHNICIAN_ASSIGNED"]));
});
