@AGENTS.md

# BusinessHub Frontend

Next.js UI for BusinessHub (HomeFix Appliance Services, Hyderabad): appliance repair booking + field service.
The backend (`../BusinessHub-backend`) is the source of truth. This app only displays data and sends requests.

Spec lives in the backend repo: `../BusinessHub-backend/docs/spec/`. Start from `PHASES.md`, read ONLY the files the current phase lists.
Do NOT open `../BusinessHub-backend/docs/BusinessHub-Spec.md`. Do not read backend `src/` unless an API shape is unclear; prefer its route schemas (`src/routes/*.schemas.ts`) or API docs.

## Current phase
Phase: 5 (Availability engine)   <!-- keep in sync with backend CLAUDE.md -->
Frontend pages for a phase are built only after that phase's API is finished.

## Stack (fixed, ask before changing)
- Next.js 16 (App Router), React 19, TypeScript, Tailwind v4
- UI: shadcn/ui (Radix primitives), lucide-react icons, sonner toasts
- Data: TanStack Query. Forms: React Hook Form + Zod (`@hookform/resolvers`)
- Dates: date-fns + `@date-fns/tz` (display in `Asia/Kolkata`)
- Tests: Vitest + Testing Library, Playwright (one E2E per path)
- NOT Reka UI (it is Vue-only). NOT MUI/Chakra/Mantine. No Redux/Zustand (TanStack Query + URL state is enough).

## Layout
- `app/` routes. Route groups: `(public)` login/register/reset, `(customer)`, `(staff)` owner+manager, `(tech)` technician.
- `components/ui/` shadcn components (generated, edit only to restyle). `components/` app components.
- `lib/api.ts` single fetch wrapper. `lib/queries/` TanStack Query hooks per feature. `lib/schemas/` Zod schemas. `lib/format.ts` money/date helpers.
- API calls go to `/api/*`, rewritten to the backend in `next.config.ts` (same origin, so httpOnly cookies just work).

## Non-negotiable rules
1. Never decide availability, prices, or allowed transitions in the UI. Show what the API returns; disable/hide actions the API says are not allowed.
2. Auth: JWT lives in an httpOnly cookie. Never read, store, or copy tokens in JS/localStorage. Get the user from `GET /api/auth/me`.
3. Route guards (proxy/layout redirects) are UX only. The backend enforces role and ownership.
4. Times: the API sends UTC ISO strings. Always format with `Asia/Kolkata` via `lib/format.ts`. Never `new Date().toLocaleString()` without a timeZone. Send dates as the API expects (ISO or `YYYY-MM-DD` local IST date), never browser-local.
5. Money in INR: `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
6. Errors: API shape is `{ error: { code, message, details } }`. `lib/api.ts` throws a typed `ApiError`. Map `details` to form field errors; show `message` in a toast or inline alert.
7. 409 on booking = slot taken or invalid transition: show a clear message and refetch availability. 401 = redirect to login. 403 = "not allowed" page.
8. Every list is paginated (use the API's page params, show pagination controls).
9. Staff "book on behalf" uses the same booking UI as customers, plus a customer picker. Customers never see or send `customerId`.
10. Staff overrides (cutoff/cancellation window only) require a reason field.
11. No features that are not in the spec. No secrets in the repo; keep `.env.example` updated.

## UI and design
Goal: calm, trustworthy, fast. Looks like a good modern SaaS, not a template.
- shadcn/ui components only for primitives (Button, Input, Select, Dialog, Sheet, Calendar, Popover, Table, Tabs, Badge, Card, Skeleton, Sonner). Add with `npx shadcn@latest add <name>`. Do not hand-write primitives.
- Theme via CSS variables in `app/globals.css` (shadcn tokens). One brand color (primary), neutral grays, semantic colors for status only. Light + dark mode.
- Typography: Geist Sans (already set up). Base 14-16px, clear hierarchy, max 2 font weights per screen.
- Spacing: 4px scale, generous whitespace, `rounded-lg`, subtle borders over heavy shadows.
- Mobile-first. Technician screens are used on a phone: large tap targets (min 44px), sticky primary action at bottom.
- Booking status = `Badge` with a fixed color map in one file (`components/status-badge.tsx`).

### Forms (must look and work well)
- Use shadcn `Field` components (`Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`) with React Hook Form `Controller` + `zodResolver`. This is shadcn's current form pattern.
- Every input has a visible label (no placeholder-only labels), helpful placeholder, correct `type`/`inputMode`/`autoComplete` (e.g. `tel` + `inputMode="numeric"` for Indian 10-digit phone, `email`, `current-password`, `new-password`).
- Invalid state: set `aria-invalid` and `data-invalid` so shadcn styles the red ring; error text under the field.
- Validate on blur, re-validate on change after first error (`mode: "onTouched"`).
- Submit button shows a spinner and is disabled while pending. Disable double submit.
- Password fields have a show/hide toggle. Phone field shows a fixed `+91` prefix.
- Dates: shadcn `Calendar` in a `Popover`. Time slots come from the API as buttons (grid), never a free time input.
- Reuse Zod schemas for the same request shape as the backend where possible; the backend still validates.

### Every data screen has
Loading (`Skeleton`), empty state (short text + next action), error state (message + retry), and success feedback (toast).

### Accessibility
Keyboard reachable, visible focus rings (keep shadcn's), color contrast AA, dialogs trap focus (Radix does this), icons-only buttons get `aria-label`.

## How to work with me
- I am learning Next.js and React. Explain the key decision in 1-3 sentences, then write the code.
- One phase at a time. Do not jump ahead.
- Ask before adding any library not listed above or changing architecture. shadcn adding its own deps when running `shadcn add` is fine.
- Server Components by default. Add `"use client"` only for interactivity (forms, queries, state).
- Keep files small (a page = composition of small components). No premature abstractions.
- Be concise: no long recaps, no repeating code I can already see. End each task with: what changed, how to run it, how to test it.
- Point out real-world problems (timezones, stale cache after mutations, auth redirects, race on double click).

## Token habits
- Read only the files you need. Never read `node_modules` (except the specific Next.js guide AGENTS.md points to), lockfiles, `.next`, or build output.
- Do not read `components/ui/*` unless changing one; they are standard shadcn.
- Prefer targeted searches (grep/glob) over opening whole files. Read line ranges for big files.
- Edit files in place. Do not rewrite whole files for small changes.
- Show only trimmed test and command output (failures, errors), not full logs.
- Before a new phase, I will run `/clear`. Re-read this file and the relevant spec section only.

## Commands
- `npm run dev` (backend must be running), `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`
- E2E: `npx playwright test`
- Add UI component: `npx shadcn@latest add <name>`

## Definition of done
Page wired to the real API, Zod-validated form, loading/empty/error states, role-correct navigation, works on mobile width, tests, short docs.
For booking or customer features: works for both the customer path and the staff-on-behalf path (unless the spec says otherwise).
