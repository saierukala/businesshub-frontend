# BusinessHub: appliance repair booking and field service

A full-stack booking and field-service platform for **HomeFix Appliance Services** (Hyderabad). Customers book repairs
online, staff (Owner and Manager) take phone bookings and run the day, and technicians work their jobs from a phone.
I designed and built all three parts myself: this **Next.js web app**, a **Node.js/PostgreSQL API**, and a
**React Native mobile app**.

## Demo video
[![Watch the demo video](docs/screenshots/staff-dashboard.png)](docs/demo/HomeFix-demo.mp4)

**[▶ Watch the full demo (MP4)](docs/demo/HomeFix-demo.mp4)**: a customer books a repair, a manager assigns a technician,
the technician does the job, the customer approves an extra charge and pays online, and the owner reviews reports and the audit log.

## Highlights
- **No double booking, even with two requests at the same moment.** A PostgreSQL exclusion constraint (`btree_gist`) on
  each technician's time range, checked inside a transaction. A clash returns `409` and never reaches the database.
- **Availability engine:** free slots come from technician skills, service areas, working hours, time off and existing
  jobs. All business time runs in `Asia/Kolkata` on the server; times are stored in UTC.
- **One booking path for everyone:** customers and staff use the same create, reschedule and cancel services. Staff can
  override the cutoff and cancellation windows only, and must give a reason, which goes into the audit log.
- **Booking status rules:** only allowed status changes are accepted. Each change is recorded in the status history and the audit log.
- **Payments:** Razorpay (test mode). The server creates the order and sets the amount, checks the payment signature,
  and accepts a signed webhook as a backup.
- **Security:** bcrypt passwords, JWT in httpOnly cookies (Bearer tokens for mobile), role and ownership checks on every
  endpoint, and Zod validation on every request.
- **Background jobs:** email and in-app notifications through a pg-boss worker (a PostgreSQL job queue, no Redis).
- **Tested:** Vitest + Supertest API tests, Vitest + Testing Library UI tests, and Playwright end-to-end tests of both
  booking paths against a real API and database. CI runs on GitHub Actions.

## Tech stack
| Part | Stack |
| --- | --- |
| Web (this repo) | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui, TanStack Query, React Hook Form, Zod |
| API (private repo) | Node.js, Express, TypeScript, PostgreSQL, Prisma, Zod, pg-boss, Nodemailer, pino, OpenAPI/Swagger |
| Mobile (separate repo) | React Native, Expo |
| Testing | Vitest, Supertest, Testing Library, Playwright, GitHub Actions |

The backend source is in a private repository. I can share it or walk through it on request.

## Screenshots

| Staff dashboard | Customer home | Booking wizard |
| --- | --- | --- |
| ![Staff dashboard](docs/screenshots/staff-dashboard.png) | ![Customer home](docs/screenshots/customer-home.png) | ![Booking wizard](docs/screenshots/booking-wizard.png) |

| Technician (phone) | Reports | Audit log |
| --- | --- | --- |
| ![Technician on a phone](docs/screenshots/technician-phone.png) | ![Reports](docs/screenshots/staff-reports.png) | ![Audit log](docs/screenshots/audit-log.png) |

## What is in it
- **Customer:** book in 5 steps (appliance, problem and service, address, date and time, review), reschedule and cancel, approve extra charges, receipts, ratings, home dashboard, appliance history.
- **Staff:** dashboard (today by status, pending assignments, revenue, workload), bookings on behalf of phone customers, assignment and the "needs reassignment" queue, customers, technicians (skills, areas, hours, time off), service catalog, users, reports (bookings, revenue, services, technicians), reviews, and the Owner-only audit log.
- **Technician (mobile first):** today's jobs, big one-hand buttons (on my way, arrived, start), visit notes, extra charge proposal, payment, receipt.
- Notification bell, loading / empty / error states on every data screen, light and dark mode.

## Run it locally
The app needs the API (private repo) running on port 4000 with seed data.

```bash
npm install
cp .env.example .env     # BACKEND_URL=http://localhost:4000
npm run dev              # http://localhost:3000
```

Every call goes to `/api/*` on this app, which `next.config.ts` rewrites to `BACKEND_URL`. That keeps the httpOnly login cookie on one origin.

Demo logins (password `Password@123` for all): `owner@homefix.test`, `manager@homefix.test`, `rahul@homefix.test` (technician), `ravi@example.test` (customer).

## Commands
| Command | What |
| --- | --- |
| `npm run dev` / `npm run build` / `npm start` | Develop / production build / run it |
| `npm run lint` / `npm run typecheck` / `npm test` | ESLint / TypeScript / Vitest |
| `npx playwright test` | End-to-end tests (below) |

## End-to-end tests
Two tests, one per path from the project spec, in a real browser against the real API and PostgreSQL:
- `e2e/customer-path.e2e.ts`: Ravi books, a manager assigns Rahul, Rahul works the job and proposes ₹300 extra, Ravi approves, Rahul completes it and records ₹799, Ravi rates it. It also checks that the same technician cannot be booked twice for that time.
- `e2e/staff-path.e2e.ts`: the manager creates a phone-only customer and books for her (source PHONE), marks the technician sick, sees the booking flagged, and reassigns it.

```bash
# needs the backend repo next to this one (or BACKEND_DIR=path) and a local PostgreSQL
npx playwright install chromium          # once (or use your installed Edge: E2E_CHANNEL=msedge)
npx playwright test
```

The run starts its own API (port 4100) and this app (port 3100) against a separate database named `businesshub_e2e`
(derived from the backend's `.env`, or set `E2E_DATABASE_URL`). The database is **emptied and re-seeded before every run**,
and the reset refuses any database whose name does not contain "e2e". `E2E_VIDEO=1` records both paths as video;
`SCREENSHOTS=1 npx playwright test e2e/customer-path.e2e.ts e2e/screenshots.e2e.ts` retakes the README screenshots.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests and the build, then the two E2E tests with a PostgreSQL service
(it checks out the private backend repo with a read-only token in the secret `BACKEND_REPO_TOKEN`).

## Deploying
On Vercel the only setting is `BACKEND_URL` (the API's public URL).

## More
Short notes per feature are in `docs/` (bookings, visits, payments, notifications, dashboards and reports, reviews, audit and hardening).
Browser hardening headers are set in `next.config.ts`.
