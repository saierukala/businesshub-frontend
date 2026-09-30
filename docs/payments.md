# Payments and receipts (Phase 9)

API details: backend `docs/api/payments.md`. Cash and UPI for now.

## Technician (phone, job page)
After **Complete visit**, the job page shows **Collect payment**: the amount to collect (from the API: visit charge + approved
extra charge), **Cash** or **UPI** (optional transaction ID), and **Payment received**. The request carries only the method (and
reference): the server works out the amount, so it cannot be changed from the browser.
Once recorded it shows *Paid ₹749 by UPI*, who recorded it, and a **View receipt** link. In *My jobs*, completed jobs show
*Payment due* or *Paid*.

## Manager (`/staff/bookings/[id]`)
Same panel on a completed booking, so a manager can record a payment for any job. The bookings list shows *Payment due* / *Paid*
on completed bookings.

## Customer (`/bookings/[id]`)
Sees *X to pay* until it is recorded (they pay the technician), then *Paid ...* and **View receipt**.

## Receipt (`.../receipt` in each area)
A simple printable page: business name, receipt number, date, customer, booking, address, technician, the lines
(visit charge, approved extra), total and method. **Print or save as PDF** uses the browser's print dialog; the menu and buttons
are hidden when printing.

## Files
`components/payment/payment-section.tsx`, `components/payment/receipt-view.tsx`, `lib/queries/payments.ts`.
Links that look like buttons are real links (`buttonVariants` on `<Link>`/`<a>`), so screen readers announce them as links.
