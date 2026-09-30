# Catalog, customers and users (Phase 3)

API contract: `../BusinessHub-backend/docs/api/catalog-customers-users.md`.

## Pages
| URL | Who | What |
|---|---|---|
| `/account` | CUSTOMER | Own addresses and appliances |
| `/staff/customers` | OWNER, MANAGER | Search (name/phone/email, in the URL as `?q=&page=`), create customer |
| `/staff/customers/[id]` | OWNER, MANAGER | Profile + edit, invite to online account, addresses, appliances |
| `/staff/services` | OWNER | Services table, create/edit, bookable switch |
| `/staff/users` | OWNER | Staff list with role filter, add manager/technician (invite email), deactivate/reactivate, resend invite |

Managers opening `/staff/services` or `/staff/users` are redirected to `/staff`. The nav shows only each role's links.

## Both paths, one component
`components/records/*` (addresses, appliances) is used by the customer page **and** the staff customer page.
`customerId` omitted → the backend uses the session (customer); passed → staff acting for that customer.

## Duplicate phone
`POST /customers` answers 409 `DUPLICATE_PHONE` with the matches. The form lists them (links to open the
existing record) and offers "Save anyway", which resends with `allowDuplicatePhone: true`.
The warning is tied to the number it was shown for: editing the phone hides it.

## Shared pieces
- `hooks/use-list-params.ts` list state in the URL (search, page, filters).
- `components/common/*` loading/empty/error states, pagination, confirm dialog, form dialog, debounced search.
- `components/form/select-field.tsx`, `textarea-field.tsx` join the Phase 2 field components.
