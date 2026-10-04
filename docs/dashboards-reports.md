# Dashboards and reports (Phase 11)

API: backend `docs/api/dashboards-reports.md`. Every number is counted by the API (SQL); the screens only show it.

## Where each role lands
- **Customer: `/home`** (new landing page, first item in the nav): next appointment, appliances, recent visits, payments (receipt links), reviews.
- **Technician: `/tech`**: the job list as before, plus "2 of 5 done today" from `GET /dashboard/technician`.
- **Owner / Manager: `/staff`**: stat cards (bookings today, revenue today and this month, technicians free now), today by status,
  technician workload, waiting for assignment, needs reassignment, bookings made (14 days), popular services, booked via.
  The bars are plain divs (no chart library).

All dashboards refresh every 60 s while open, and straight away after a booking, visit or payment changes.

## Reports: `/staff/reports` (Owner and Manager)
Tabs: Bookings, Revenue (daily / weekly / monthly), Services, Technicians (with average rating).
Tab, dates, grouping and page are in the URL (`?tab=revenue&groupBy=week&from=2026-10-01&to=2026-10-31&page=2`).
No dates = last 30 days. Days are India time (IST), both included.

## Files
`lib/queries/dashboard.ts`, `lib/queries/reports.ts`, `components/dashboard/*`, `components/reports/reports-view.tsx`,
`app/(customer)/home`, `app/(staff)/staff/page.tsx`, `app/(staff)/staff/reports`.
