# Service visits (Phase 8)

API details: backend `docs/api/visits.md`.

## Technician (phone, `/tech`)
- **My jobs:** today first, then what is coming up (only jobs assigned to them; cancelled and no-show are left out).
- **Job page:** call the customer (`tel:` link), open the address in Maps, and one big button fixed to the bottom for the next step:
  *I'm on my way* -> *I've arrived* -> *Start work*. The API refuses skipped steps.
- **Once the work starts:**
  - *Visit notes* (what was found, what was done, parts, result, notes). *Save notes* keeps a draft.
  - *Extra work needed*: amount + reason, sent to the customer. The page shows *Waiting*, then *approved* (with the total to collect)
    or *declined*, refreshing itself every 10 s.
  - *Complete visit* (bottom bar) needs the diagnosis and the work done, and is disabled while an extra charge is waiting.
  - *Needs a second visit*: pick a date and time, creates a linked follow-up booking.

## Customer (`/bookings/[id]`)
- When the technician asks for an extra charge, an **Approve / Decline** card appears (and the page refreshes itself while the work is in progress).
- The **Visit report** shows what was found and done, the extra charge and the **total to pay** (base price + approved extra, computed by the API).
- **Service history** for each appliance (menu on the appliance card on My account): completed visits with amount and technician.

## Staff (`/staff/bookings/[id]`)
- Same visit report. The extra-charge card says *Record the customer's answer* so a manager can enter a phone answer (saved with their name).
- **Book follow-up** (when in progress or completed): choose date/time and, optionally, the technician.
- A follow-up shows *Follow-up to BH-...* and links to the original.
