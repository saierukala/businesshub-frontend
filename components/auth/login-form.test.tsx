import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

const router = { replace: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

function renderForm(next?: string) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <LoginForm next={next} />
    </QueryClientProvider>,
  );
}

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Log in" }));
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe("LoginForm", () => {
  it("shows field errors and does not call the API when the form is invalid", async () => {
    const fetchMock = mockFetch(200, {});
    renderForm();
    await userEvent.setup().click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(screen.getByText("Enter your password")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the API message on wrong credentials", async () => {
    mockFetch(401, { error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect", details: [] } });
    renderForm();
    await fillAndSubmit("ravi@example.test", "wrong-pass");

    expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is incorrect");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("sends a normalised email and redirects to the role's home", async () => {
    const fetchMock = mockFetch(200, { user: { id: "1", role: "MANAGER", name: "V", email: "m@t.test" } });
    renderForm();
    await fillAndSubmit("  Manager@HomeFix.TEST ", "password123");

    await vi.waitFor(() => expect(router.replace).toHaveBeenCalledWith("/staff"));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/login");
    expect(JSON.parse(init.body)).toEqual({ email: "manager@homefix.test", password: "password123" });
    expect(router.refresh).toHaveBeenCalled();
  });

  it("honours a safe ?next= but ignores an off-site one", async () => {
    mockFetch(200, { user: { id: "1", role: "CUSTOMER" } });
    renderForm("https://evil.example");
    await fillAndSubmit("ravi@example.test", "password123");
    await vi.waitFor(() => expect(router.replace).toHaveBeenCalledWith("/account"));
  });
});
