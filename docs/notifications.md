# Notifications (Phase 10)

API and the list of events: backend `docs/api/notifications.md`. The emails are sent by the background worker
(`npm run worker` in the backend); the app shows the same messages.

## The bell (top bar, every role)
- Shows the number of unread notifications (checked every 30 s while the page is open).
- Click it for the latest ones, newest first, 8 per page (Newer / Older). Unread ones are bold with a dot.
- Click a notification: it is marked read and opens the related page for that role
  (customer `/bookings/:id`, technician `/tech/jobs/:id`, manager/owner `/staff/bookings/:id`, "bookings need a new technician" -> `/staff/reassignments`).
- **Mark all read** clears the count.

## Phone-only customers (managers and owners)
A customer with no email cannot be messaged (no SMS/WhatsApp in v1). Instead:
- the bell shows a phone-marked note, e.g. *Call Priya Nair on 9000000011: Your AC Repair is booked for Wed 21 Oct, 10:00 am.*
- the booking page shows **Phone-only customer: call to keep them informed**, and when an extra charge is waiting it reminds staff to ask the
  customer and record the answer.

## Files
`components/notifications/notification-bell.tsx`, `lib/queries/notifications.ts`; the bell is in `components/layout/app-shell.tsx`.
