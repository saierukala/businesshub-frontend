# Technicians (Phase 4)

Owner and Manager. Nav: **Technicians** (`/staff/technicians`).

- **List** (`components/technicians/technicians-list.tsx`): search by name, paginated, shows skills, areas, status. Technicians themselves are created on the Users page (owner).
- **Detail** (`/staff/technicians/[id]`): four independent cards, each with its own Save.
  - Skills: toggle buttons per appliance category.
  - Service areas: add/remove; spelling is tidied the same way the backend does.
  - Working hours: Mon-first, 7 days, switch + `time` inputs (IST). Save is disabled while any day has end <= start.
  - Time off: whole days. The form sends IST midnight-to-midnight (`lib/schemas/time-off.ts`), the API stores UTC. Only upcoming/current time off is listed.
- API calls: `lib/queries/technicians.ts` -> `/api/technicians/*` (see backend `docs/api/technicians.md`).
- Errors: mutations show the API message in a toast (or under the form field for validation errors).
