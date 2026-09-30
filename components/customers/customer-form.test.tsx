import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CustomerForm } from "./customer-form";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const duplicate = {
  error: {
    code: "DUPLICATE_PHONE",
    message: "A customer with this phone number already exists",
    details: [{ id: "c1", name: "Priya Nair", phone: "9000000011", email: null }],
  },
};
const created = { id: "c2", name: "Priya N", phone: "9000000011", email: null };

function setup(responses: { status: number; body: unknown }[]) {
  const fetchMock = vi.fn();
  for (const r of responses) fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(r.body), { status: r.status }));
  vi.stubGlobal("fetch", fetchMock);
  const onSaved = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <CustomerForm onSaved={onSaved} />
    </QueryClientProvider>,
  );
  return { fetchMock, onSaved, user: userEvent.setup() };
}

afterEach(() => vi.unstubAllGlobals());

describe("CustomerForm duplicate phone", () => {
  it("shows the existing customer, then 'Save anyway' resends with allowDuplicatePhone", async () => {
    const { fetchMock, onSaved, user } = setup([
      { status: 409, body: duplicate },
      { status: 201, body: created },
    ]);
    await user.type(screen.getByLabelText("Full name"), "Priya N");
    await user.type(screen.getByLabelText("Mobile number"), "90000 00011");
    await user.click(screen.getByRole("button", { name: "Create customer" }));

    expect(await screen.findByRole("link", { name: "Priya Nair" })).toHaveAttribute("href", "/staff/customers/c1");
    await user.click(screen.getByRole("button", { name: "Save anyway" }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(created));
    const secondBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(secondBody).toMatchObject({ phone: "9000000011", allowDuplicatePhone: true });
  });

  it("editing the phone hides the warning", async () => {
    const { user } = setup([{ status: 409, body: duplicate }]);
    await user.type(screen.getByLabelText("Full name"), "Priya N");
    const phone = screen.getByLabelText("Mobile number");
    await user.type(phone, "9000000011");
    await user.click(screen.getByRole("button", { name: "Create customer" }));
    await screen.findByRole("button", { name: "Save anyway" });

    await user.type(phone, "{Backspace}2");
    expect(screen.queryByRole("button", { name: "Save anyway" })).not.toBeInTheDocument();
  });
});
