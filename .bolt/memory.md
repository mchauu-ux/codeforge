# Project memory

## Product intent & audience

- Dual-layer app: a public coding academy facade ("CodeForge Academy") concealing a secret real-time terminal chat room.
- Primary audience: prospective and enrolled coding students; a subset uses the hidden chat.
- Acquisition surface is the landing page with course catalog, filters, sign-up waitlist, and student login.

## Brand personality & voice

- Public facade: professional, educational, structured — a credible online coding academy.
- Hidden chat: stealthy, terminal/hacker aesthetic; insider feel.
- Tone shifts cleanly between the two views.

## Visual design & UX direction

- **Layout:** left sidebar task bar with six sections (Dashboard, Course Catalog, Learning Paths, Certifications, Help Center, Settings); collapses to slide-out menu on mobile.
- **Catalog:** Beginner / Intermediate / Advanced sections with level filter buttons and live result count.
- **Search:** prominent top search bar filters across titles, descriptions, levels, and topic tags; doubles as the secret-chat trigger input.
- **Auth UI:** decoy Sign-Up modal shows local waitlist confirmation (cohort size + position); real Supabase login in a sign-in modal.
- **Chat view:** the original chat layout and an alternate terminal-style layout share the same message history, realtime stream, composer, attachments, pin/recall, and local-delete behavior. Terminal mode left-aligns every message and allows local background and per-participant text color customization.
- **Responsive:** sidebar → slide-out on mobile; chat view adapts to small screens.
- **Interaction:** trigger text `void_pointer_42` is cleared immediately so it never appears as a catalog search term.

## Decisions, constraints & rationale

- **Stack:** Vite + React + Supabase (auth, realtime, Postgres).
- **Supabase `messages` table** columns are fixed: `id`, `sender_id`, `content`, `is_pinned`, `created_at` — renamed safely from prior names with no data loss.
- **Decoy sign-up stays local-only** — no writes to Supabase auth; waitlist is simulated.
- **Trigger logic:** typing `void_pointer_42` in the main search bar opens the original chat layout; `terminal_access_77` opens the same shared room in a terminal-style, single-column layout. Both use the same Supabase messages and realtime stream and require the authorized accounts.
- **RLS policies:** all authenticated users can read the shared chat room; only a message's author can pin or delete their own messages.
- **Post-login handoff:** uses an effect rather than a stale closure to reliably enter chat after login.
- Unused standalone header component was removed; landing page renders its own header.

## Open questions & assumptions

- Single shared chat room is assumed; multi-room support not yet requested.
- Trigger phrase secrecy relies on obscurity only; no rate-limiting or audit logging.
- Course catalog content is currently illustrative; real curriculum data source TBD.
- No persistence of sidebar/collapsed state across sessions yet.