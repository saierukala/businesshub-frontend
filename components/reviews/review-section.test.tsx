import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReviewSection } from "./review-section";
import type { BookingDetail } from "@/lib/types";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const completed = { id: "b1", status: "COMPLETED", review: null } as unknown as BookingDetail;

function setup(booking: BookingDetail, canReview: boolean, response?: { status: number; body: unknown }) {
  const fetchMock = vi.fn();
  if (response) fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(response.body), { status: response.status }));
  vi.stubGlobal("fetch", fetchMock);
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <ReviewSection booking={booking} canReview={canReview} />
    </QueryClientProvider>,
  );
  return { fetchMock, user: userEvent.setup() };
}

afterEach(() => vi.unstubAllGlobals());

describe("ReviewSection", () => {
  it("asks for stars first, then sends the rating and the comment for this booking", async () => {
    const saved = { id: "r1", rating: 4, comment: "On time", createdAt: "2026-10-05T10:00:00Z" };
    const { fetchMock, user } = setup(completed, true, { status: 201, body: saved });

    await user.click(screen.getByRole("button", { name: "Submit review" }));
    expect(await screen.findByText("Choose how many stars")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("radio", { name: /4 stars/ }));
    await user.type(screen.getByLabelText(/Comment/), "On time");
    await user.click(screen.getByRole("button", { name: "Submit review" }));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/reviews");
    expect(JSON.parse(init.body)).toEqual({ bookingId: "b1", rating: 4, comment: "On time" });
  });

  it("shows the API's message when the review is refused", async () => {
    const { user } = setup(completed, true, { status: 409, body: { error: { code: "ALREADY_REVIEWED", message: "You have already reviewed this repair", details: [] } } });
    await user.click(screen.getByRole("radio", { name: /5 stars/ }));
    await user.click(screen.getByRole("button", { name: "Submit review" }));
    expect(await screen.findByText("You have already reviewed this repair")).toBeInTheDocument();
  });

  it("shows an existing review instead of the form", () => {
    const review = { id: "r1", rating: 5, comment: "Great", createdAt: "2026-10-05T10:00:00Z" };
    setup({ ...completed, review } as BookingDetail, true);
    expect(screen.getByText("Your review")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "5 out of 5" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit review" })).not.toBeInTheDocument();
  });

  it("staff only read the review, and nothing shows before the repair is completed", () => {
    const review = { id: "r1", rating: 3, comment: null, createdAt: "2026-10-05T10:00:00Z" };
    setup({ ...completed, review } as BookingDetail, false);
    expect(screen.getByText("Customer review")).toBeInTheDocument();
  });

  it("is hidden for a booking that is not completed, and for staff when there is no review", () => {
    setup({ ...completed, status: "ASSIGNED" } as BookingDetail, true);
    expect(screen.queryByText("Rate this repair")).not.toBeInTheDocument();
  });

  it("offers no form to staff when there is no review yet", () => {
    setup(completed, false);
    expect(screen.queryByRole("button", { name: "Submit review" })).not.toBeInTheDocument();
  });
});
