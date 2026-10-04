import { expect, request, type APIRequestContext, type Browser, type Page } from "@playwright/test";
import { WEB_URL } from "./env";

// Demo accounts from the backend seed (password is the same well-known demo password for all).
export const DEMO_PASSWORD = "Password@123";
export const USERS = {
  owner: "owner@homefix.test",
  manager: "manager@homefix.test",
  rahul: "rahul@homefix.test",
  arjun: "arjun@homefix.test",
  suresh: "suresh@homefix.test",
  ravi: "ravi@example.test",
};
export const TECH_EMAIL: Record<string, string> = { "Rahul Sharma": USERS.rahul, "Arjun Reddy": USERS.arjun, "Suresh Kumar": USERS.suresh };

// A fresh, logged-in browser window for one person (own cookies), like a different phone or laptop.
export async function loginPage(browser: Browser, email: string, viewport?: { width: number; height: number }): Promise<Page> {
  const page = await (await browser.newContext(viewport ? { viewport } : {})).newPage();
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL((url) => url.pathname !== "/login");
  return page;
}

// The same, for calling the API directly (used to set things up and to check what the API refuses).
export async function loginApi(email: string): Promise<APIRequestContext> {
  const api = await request.newContext({ baseURL: WEB_URL });
  const res = await api.post("/api/auth/login", { data: { email, password: DEMO_PASSWORD } });
  expect(res.ok(), `login ${email}`).toBeTruthy();
  return api;
}

const istDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d); // YYYY-MM-DD
const istWeekday = (d: Date) => new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short" }).format(d);

// The visit day: tomorrow in India, or the next Monday if tomorrow is a Sunday (every technician is off on Sundays).
export function visitDay() {
  let d = new Date(Date.now() + 24 * 3_600_000);
  while (istWeekday(d) === "Sun") d = new Date(d.getTime() + 24 * 3_600_000);
  const iso = istDay(d); // "2026-10-06"
  const [y, m, day] = iso.split("-").map(Number);
  return { iso, calendarButton: new Date(y, m - 1, day).toLocaleDateString("en-IN") }; // "6/10/2026", the calendar's data-day
}

// Step 4 of the booking flow: pick the visit day in the calendar popover, then a start time.
export async function pickSlot(page: Page, time?: string) {
  await page.locator("#booking-date").click(); // the label "Date" names this button, so find it by id
  await page.locator(`button[data-day="${visitDay().calendarButton}"]`).click();
  const slot = time ? page.getByRole("radio", { name: time, exact: true }) : page.getByRole("radiogroup", { name: "Available times" }).getByRole("radio").first();
  await slot.click();
}

// A customer with an address and a washing machine, created through the staff API (a "second customer").
export async function createCustomer(staff: APIRequestContext, name: string, phone: string) {
  const customer = await (await staff.post("/api/customers", { data: { name, phone } })).json();
  const categories = await (await staff.get("/api/service-categories?pageSize=100")).json();
  const washing = categories.items.find((c: { name: string }) => c.name === "Washing Machine");
  const address = await (await staff.post("/api/addresses", { data: { customerId: customer.id, label: "Home", line1: "Flat 9, Lake View", area: "Kondapur" } })).json();
  const appliance = await (await staff.post("/api/appliances", { data: { customerId: customer.id, categoryId: washing.id, brand: "Samsung" } })).json();
  return { id: customer.id as string, addressId: address.id as string, applianceId: appliance.id as string };
}
