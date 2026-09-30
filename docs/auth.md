# Auth (Phase 2)

API contract: `../BusinessHub-backend/docs/api/auth.md`.

## How the session works
- The backend sets an httpOnly cookie `bh_session`. JS never reads it.
- The browser calls `/api/*`; `next.config.ts` rewrites it to `BACKEND_URL`, so the cookie is same-origin.
- Server layouts call `getCurrentUser()` (`lib/session.ts`), which forwards the cookie to `GET /auth/me`.
  After login/logout/verify, client code calls `router.refresh()` so layouts re-run with the new session.
- Guards are UX only. The backend checks role and ownership on every request.

## Pages
| URL | Who | Notes |
|---|---|---|
| `/` | anyone | Redirects to `/login` or the role's home |
| `/login`, `/register` | logged out | Logged-in users are redirected. `?next=` is honoured only for same-site paths |
| `/forgot-password` | anyone | Also how phone-booked customers claim their account |
| `/reset-password?token=` | anyone | Link from email (1 h) |
| `/accept-invite?token=` | anyone | Link from staff invite email (7 days) |
| `/verify-email?token=` | anyone | Verifies automatically on open (once, even in React dev double-render) |
| `/account` | CUSTOMER | Placeholder until later phases |
| `/staff` | OWNER, MANAGER | Placeholder until later phases |
| `/tech` | TECHNICIAN | Placeholder until Phase 8 |

Wrong role → redirected to their own home. Logged out → `/login?next=<area>`.

## Files
- `lib/api.ts` fetch wrapper + `ApiError`; `lib/form.ts` maps API errors onto form fields.
- `lib/queries/auth.ts` TanStack mutations; `lib/schemas/auth.ts` Zod schemas (mirror the backend).
- `components/form/*` Field-based inputs (text, password with show/hide, +91 phone).
- `components/auth/*` the forms; `components/layout/*` shell, logout, verify-email banner.

Note: this shadcn setup uses the `base-nova` style, whose primitives are **Base UI** (`@base-ui/react`), not Radix.
Use `render={<Link …/>}` instead of Radix's `asChild`.
