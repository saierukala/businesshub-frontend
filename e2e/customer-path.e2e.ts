import { expect, test } from "@playwright/test";
import { USERS, createCustomer, loginApi, loginPage, pickSlot } from "./helpers";

// Scenario A (spec §18): the customer books a washing machine repair themselves. A manager assigns Rahul,
// Rahul works the job on his phone, proposes an extra charge, the customer approves, Rahul completes it,
// records the payment (499 + 300 = 799), and the customer rates the repair.
test("customer self-service: book, assign, repair with an extra charge, pay, review", async ({ browser }) => {
  // ---- 1. Ravi books (customer path) ----
  const ravi = await loginPage(browser, USERS.ravi);
  await expect(ravi).toHaveURL(/\/home$/);
  await ravi.getByRole("link", { name: "Book a repair" }).first().click();

  await ravi.getByRole("radio", { name: /LG Washing Machine/ }).click();
  await ravi.getByRole("button", { name: "Continue" }).click();

  await ravi.getByLabel("What is wrong?").fill("Machine is not draining water.");
  await ravi.getByRole("radio", { name: /Washing Machine Repair/ }).click();
  await ravi.getByRole("button", { name: "Continue" }).click();

  await ravi.getByRole("radio", { name: /Home/ }).click();
  await ravi.getByRole("button", { name: "Continue" }).click();

  await pickSlot(ravi, "10:00 am");
  await ravi.getByRole("button", { name: "Continue" }).click();

  await expect(ravi.getByText("₹499").first()).toBeVisible(); // the visit charge on the review step (also in the summary panel)
  await ravi.getByRole("button", { name: "Confirm booking" }).click();
  await ravi.waitForURL(/\/bookings\/[0-9a-f-]{36}$/);
  const bookingId = ravi.url().split("/").pop()!;
  await expect(ravi.getByText("Confirmed", { exact: true }).first()).toBeVisible();

  // ---- 2. The slot is protected: the same technician cannot be booked again for that time ----
  const staffApi = await loginApi(USERS.manager);
  const booking = await (await staffApi.get(`/api/bookings/${bookingId}`)).json();
  const other = await createCustomer(staffApi, "Second Customer", "9000000099");

  // ---- 3. The manager assigns Rahul ----
  const manager = await loginPage(browser, USERS.manager);
  await manager.goto(`/staff/bookings/${bookingId}`);
  await manager.getByRole("button", { name: "Assign technician" }).click();
  await manager.getByRole("radio", { name: /Rahul Sharma/ }).click();
  // Wait for the server's answer: "Technician assigned" is also a step label in the page's progress tracker,
  // so waiting for that text alone could read the booking before the assignment is saved.
  await Promise.all([
    manager.waitForResponse((r) => r.url().includes(`/bookings/${bookingId}/assign`) && r.ok()),
    manager.getByRole("dialog").getByRole("button", { name: "Assign", exact: true }).click(),
  ]);
  await expect(manager.getByText("Technician assigned", { exact: true }).first()).toBeVisible();

  const assigned = await (await staffApi.get(`/api/bookings/${bookingId}`)).json();
  expect(assigned.technician.name).toBe("Rahul Sharma");
  const clash = await staffApi.post("/api/bookings", {
    data: {
      customerId: other.id,
      applianceId: other.applianceId,
      serviceId: booking.service.id,
      addressId: other.addressId,
      problemDescription: "Same slot, same technician",
      startAt: booking.startAt,
      source: "PHONE",
      technicianId: assigned.technician.id,
    },
  });
  expect(clash.status()).toBe(409);
  expect((await clash.json()).error.code).toBe("SLOT_UNAVAILABLE");

  // ---- 4. Rahul, on his phone: on the way, arrived, start, extra charge ----
  const rahul = await loginPage(browser, USERS.rahul);
  await rahul.goto("/tech");
  await rahul.getByRole("link", { name: /Ravi Kumar/ }).click();
  await rahul.getByRole("button", { name: "I'm on my way" }).click();
  await rahul.getByRole("button", { name: "I've arrived" }).click();
  await rahul.getByRole("button", { name: "Start work" }).click();
  await expect(rahul.getByRole("button", { name: "Complete visit" })).toBeVisible();

  await rahul.getByRole("button", { name: "Extra work needed" }).click();
  await rahul.getByLabel("Extra amount (₹)").fill("300");
  await rahul.getByLabel("What is the extra work?").fill("Drain pump clean");
  await rahul.getByRole("button", { name: "Ask the customer to approve" }).click();
  await expect(rahul.getByText("Waiting for the customer to answer the extra charge.")).toBeVisible();

  // ---- 5. Ravi approves in the app ----
  await ravi.reload();
  await expect(ravi.getByText("The technician needs your approval")).toBeVisible();
  await ravi.getByRole("button", { name: "Approve" }).click();
  await expect(ravi.getByText("The technician needs your approval")).toBeHidden();

  // ---- 6. Rahul completes the visit and records the payment: 499 + 300 = 799 ----
  await rahul.reload();
  await rahul.getByLabel("What did you find?").fill("Drain pump blockage");
  await rahul.getByLabel("What did you do?").fill("Pump cleaned, hose checked, machine tested");
  await rahul.getByRole("button", { name: "Complete visit" }).click();

  await expect(rahul.getByText("₹799")).toBeVisible(); // the amount to collect comes from the server
  await rahul.getByRole("radio", { name: "Cash" }).click();
  await rahul.getByRole("button", { name: "Payment received" }).click();
  await expect(rahul.getByText("Paid in cash")).toBeVisible();

  // ---- 7. Ravi sees the receipt and rates the repair ----
  await ravi.reload();
  await expect(ravi.getByText("Paid in cash")).toBeVisible();
  await expect(ravi.getByText("₹799").first()).toBeVisible();
  await expect(ravi.getByRole("link", { name: /View receipt/ })).toBeVisible();
  await ravi.getByRole("radio", { name: /5 stars/ }).click();
  await ravi.getByLabel("Comment (optional)").fill("Quick and tidy work");
  await ravi.getByRole("button", { name: "Submit review" }).click();
  await expect(ravi.getByRole("heading", { name: "Your review" })).toBeVisible();

  // The history on the booking shows every step.
  await expect(ravi.getByText("Completed", { exact: true }).first()).toBeVisible();
});
