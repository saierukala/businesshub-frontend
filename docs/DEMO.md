# Demo recorder

Records the HomeFix demo as 720p HD clips (1280x720, web only, no voiceover), one per part of the story.
It is not a test: it drives the real app at human speed in headless Edge and saves Playwright's own page video
(`demo-videos/NN-name.webm`), so no desktop, other windows or scrollbars appear. Page size = video size, scale 1.
Before and after each scene it checks that nothing is cut off and keeps a screenshot in `demo-videos/checks/`.

## Run it

```bash
npm run demo
```

- Needs PostgreSQL running and the backend repo next to this one (`../BusinessHub-backend`), like the E2E tests.
- Uses its OWN database, `businesshub_demo_e2e`, wiped and re-seeded every run. Never the dev database.
- The demo API runs in development mode with a worker (`npm run worker`), so in-app notifications appear. Email is
  forced off (SMTP_URL empty), so no real email is ever sent.
- Online payment needs Razorpay **test** keys in the backend `.env` (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
- `DEMO_SCENES=1,8` re-records only those clips (the whole story still plays; a failed scene never replaces a clip).
- `DEMO_HEADED=1` shows the browser while it records (the clips still come from the page, not the screen). `DEMO_CHANNEL=chrome` uses Chrome instead of Edge.
- Already built the frontend? Skip the build: `E2E_FRONTEND_CMD="npx next start -p 3100" npm run demo`.

## The clips

| Clip | What it shows |
| --- | --- |
| 01-customer-books-a-repair | Ravi logs in and books a washing machine repair (5 steps) |
| 02-manager-assigns-technician | The manager assigns Rahul |
| 03-technician-on-the-job | Rahul: on the way, arrived, start work, asks for a ₹300 extra |
| 04-customer-approves-extra-charge | Ravi opens the notification bell, then approves the extra charge |
| 05-technician-completes-visit | Rahul completes the visit (₹799 due) |
| 06-customer-pays-online | Checkout page, Razorpay test payment, "Payment successful", receipt |
| 07-customer-reviews | Ravi gives 5 stars |
| 08-owner-dashboard-reports-audit | Dashboard with revenue, reports, audit log |
| 09-phone-booking-for-priya | Staff books for a phone-only customer |
| 10-time-off-and-reassignment | Technician off sick: booking flagged, reassigned |
| 11-double-booking-refused | Someone takes the slot first: "That time slot is no longer available" |
| 12-customer-reschedule-limit | Ravi moves a booking (his 2nd time), then a 3rd move is refused (max 2) |
| 13-staff-override-with-reason | The manager moves it anyway, with a reason that goes into the audit log |
| 14-customer-cancels | Ravi cancels for free (more than 4 hours ahead); the history shows every step |

The Razorpay test account offers Cards, Netbanking and Wallet (no UPI on desktop), so the recorder pays with
test Netbanking (Canara Bank → Success). No real money moves.

## Stitching (Windows Clipchamp)

1. Open Clipchamp → Create a new video → drag in the clips in number order.
2. `06` shows the whole payment: checkout, the Razorpay window, processing, success, receipt.
3. Add a short text caption at the start of each clip (Text → Plain), export at 1080p.
