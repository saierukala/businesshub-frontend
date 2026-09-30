# Bookings (Phase 6)

One wizard, two paths. `components/booking/booking-wizard.tsx` is used by both; the API is the same
(`POST /api/bookings`, see backend `docs/api/bookings.md`).

## Customer (`/book`, `/bookings`, `/bookings/[id]`)
1. Appliance (pick or add) 2. Problem + service (services filtered by the appliance type) 3. Address (pick or add)
4. Date + time (slots come from `GET /api/availability`; the browser never computes availability) 5. Review + confirm.
- "My bookings": paginated list with a status filter. Detail shows history, **Reschedule** and **Cancel**.
- Windows and limits (4 hours, 2 reschedules) are enforced by the API; its message is shown when refused.
- A 409 (slot taken meanwhile) sends the user back to step 4 with a refreshed list.

## Staff (`/staff/bookings`, `/staff/bookings/new`, `/staff/bookings/[id]`)
- New booking: pick or create a customer (phone search, duplicate-phone warning), then the same wizard.
- Extra for staff: choose a free technician for the slot (or "assign automatically"), choose the source
  (phone / WhatsApp / walk-in), and give a reason when the API asks for one (inside the 2-hour cutoff,
  or cancelling/rescheduling late). The reason field appears only after the API says it is needed.
- Detail also shows customer and source, history with who made each change, and **Mark no-show**
  (from technician assigned / on the way / arrived).

## Files
- `lib/queries/bookings.ts` hooks, `components/status-badge.tsx` the one status colour map,
  `components/booking/*` wizard steps, slot picker, cancel and reschedule dialogs.
- The date picker is a native date input limited to today .. +30 days (IST). The slots are the source of truth.
