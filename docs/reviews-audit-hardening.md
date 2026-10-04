# Reviews, audit log and hardening (Phase 12)

API: backend `docs/api/reviews-audit-hardening.md`.

## Reviews
- **Customer, completed booking (`/bookings/:id`):** "Rate this repair": 1 to 5 stars (required) and an optional comment.
  After sending, the page shows "Your review". One review per booking; the API decides who may review (own, completed, once).
- **Staff:** the booking page shows "Customer review" when there is one. **`/staff/reviews`** lists all reviews
  (filter by rating, average shown). The technician report on `/staff/reports` shows each technician's average rating.
- The customer home lists their latest reviews.

## Audit log: `/staff/audit` (Owner only; managers are sent back to `/staff`)
Newest first. Filter by action and date range (in the URL). Shows who, what, which record, and the useful details
(override reasons, amounts, ratings).

## Error and loading states
- `app/error.tsx`: if a page crashes, "Something went wrong" with **Try again** (this Next.js version calls the function `retry`, not `reset`).
- `app/not-found.tsx`: friendly 404.
- `loading.tsx` in `(customer)`, `(staff)`, `(tech)`: a skeleton while a page loads.
- A failed API call inside a screen still shows the API's message and its own **Try again**.

## Security headers (`next.config.ts`)
`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
A Content-Security-Policy is left for later: Next's inline scripts need per-request nonces.
Rate limiting is in the backend (login and other auth routes): after too many tries the form shows the API's
"Too many attempts. Please try again in N min." message.
