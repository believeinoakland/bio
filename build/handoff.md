# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #165 (`session_018LZeYsyDy9gwXyhVrZuG8i`, primary account, depth 1), 2026-10-12, after Bob's review (K3049–K3054). **The work resumes on Bob's secondary account** (Bob: "all of this work will be done under the secondary account because it refreshes tomorrow morning"), when Bob says to resume.

## How the work resumes (Bob's acts first, then BOB #166's)

1. **Bob** starts BOB #166 on the secondary account, through ROOT #6 there (`session_01FXbdTJZyPp3Bhcv7pfVSR1`): he opens that session and pastes `START BOB #166: tranche/T47 @ <this handoff's commit>`. If ROOT #6 is gone or past 55% of its window, he starts a new ROOT on the secondary with roles/ROOT.md's prompt, and BOB #166 records its id in `build/manifest.md`.
2. **BOB #166 takes over** (§5.1) on the secondary. Account-switch rule (rulings-active §1): primary sessions (BOB #165, ROOT #5, the UX-DESIGN session) cannot be rung or archived from there: leave them, no `BOB-final` row for BOB #165. Write BOB's channel Writer line (`mail xwriter`, account secondary); the `BOB` row of `build/channels.md` follows the account at T47's close. Read the channel (UX-DESIGN U178–U181 unread, and any answer to B158, B159) and the lanes (investigation H43, actions H31 at this handoff).
3. **Read Bob's direction whole before acting:** rulings-active §1 "Real users" (K3052), K3053, K3054, and the review https://claude.ai/artifact/8zmjrqyU4EgKRBy12kLQUn (K3051).

## Bob's direction since the pause (in force)

- **K3052, real users:** a UX real users understand and are comfortable with, journeys that make sense and reflect their interests; the top-level screen exactly what it needs to be, sharp and fully functional, and every other screen too; no user meets an old interface; BOB pushes back, with reasons, on any ruling or plan that would not fit real users (his included). BOB audits every plan screen by screen and journey by journey before it opens; every release is walked as administrator and member before Bob is told it is ready.
- **K3053, production:** the next release Bob tries carries the installer and the whole journey, seamless: a founder clicking "Create your new Civicsmith group", the install, the founder's group setup, inviting a member, the member joining, their account settings, their first work. All screens, journeys and wizards fully developed, tested and debugged; the dashboards re-centre comes later but today's system must be clean and functional. Identify every held-back task, why it is held, and clear the roadblocks. Claude connect does not work (Bob tried): the release carries enough logging in it to debug it fast, then the assistant's tests are written, run and debugged.
- **K3054:** tokens are scarce; nothing more on the primary. The release walk-through is for release time, by the automated check (N1004), not by hand now.
- K3051's D1 and D2 are settled A by K3052 (the address opens the new interface with a designed sign-in; install, setup and join built as designed); D3 is withdrawn (the front door joins T47's L11).

## Everything that needs doing, in order

**A. Before any layer runs (BOB #166, through workers; P20)**
1. **N1000, the census** of every held entry (`next.md`, `current.md`'s Left-out table, the handoff): its reason, whether it still holds, the act that clears it, who does it. Pull every cleared entry into T47 where its layer has not started (P10). The worker for it was stopped unfinished (K3054): start fresh.
2. **N1001, the connect trace:** the member's Claude sign-in flow end to end (the `connect` screen, its ops, credentials, agent-runner/agent-worker), its likely failure points on biosmoke7, and a logging design (each step, outcome, refusal code, Anthropic's HTTP status, timing, a correlation id; never a token, secret or code, K1874; readable by BOB from the test instance). Fold it as requirements into T47 (stopped unfinished; start fresh).
3. **Fold the design:** DEC-200 and the 50-screen registry (PR #33, U178–U181; words.json, file-safety R42's wording, registry rows read by key), and UX-DESIGN's answers to B158 and B159 (front door, sign-in, sign-out, expiry, forgotten password, the founder's link, the installer, the hand-over) into requirements: N999 (front door and administrator's path: `/` opens the new interface, sign-in kept across tabs, interface-shell R3 vs R12 reconciled), N1005 (install, setup, join, places, recovery, help and the sign-in screens in `/app`), N1002 (setup page and legacy-ui retired for users), N1003 (installer journey and deploy), N1004 (automated journey check). If UX-DESIGN has not answered, ring nothing (cross-account): ask Bob to nudge that session.
4. **The plan audit (K3052):** walk T47's plan, screen by screen and journey by journey, against the design; every missing screen or state becomes an entry. Measure the reading sets (K2053).
5. **Bring Bob one rendered page:** the census's roadblocks (what BOB cleared, what is his), Q1–Q4 (N1006), the installer's Cloudflare dashboard act (N1003: OAuth client lacks `connectivity-directory.bind`, K2164) walked in plain clicks, the stewards' contact address (K2799, N923), and his weekly meter (secondary).

**B. Resume T47 (paused in L3)**
6. host-governor is COMPLETE: read its J1 (unread), run ownership, merge (§5.5).
7. Restart CAPTURE, FILE-SAFETY, SOURCES as `<MODULE> #n+1` on their branches with the fixed prompt (§5.4's restart; their pushes are kept on `job/T47/<module>`). sources has B2 (K3045's answer) to act on. Arm backstop and `WATCH` (into the secondary's ROOT).
8. Carry T47 through L4–L11 as planned; merge order notes are in each layer's line; the START bodies script form is in `build/plan/starts-T47/`. L11 now also carries N999, N1001, N1002, N1003, N1004, N1005 (and N1006's answers).
9. Other acts owed from T47's opening, not yet started: N943 (file-safety split map), N945 (bootstrap study: `claimed:false, rearmed:true` on biosmoke7), N996 (credentials split map), N898 (mail tool, process repository, between tranches).

**C. Close T47 and release (only when the whole journey works)**
10. At the close: merge PR #33 (U180's MERGE; keep the design session's text, K945), merge `main` into the tranche, run every module's tests (K2704) and the checks, archive the plan, PR to `main` (§5.7). Move `build/channels.md`'s `BOB` row to the secondary.
11. Release: run N1004's journey check on a test instance and look at its screenshots; only when every step passes, cut, sign and deploy (each deploy and signing is Bob's approval in session, K1716; the installer's deploy too), then walk Bob through trying it.

## Where things stand

- **T47 open, paused in L3** (`tranche/T47`, plan `build/plan/current.md`, 77 entries T47-1…T47-77; its Counts line says 75). L1 closed (K3035), L2 closed (K3043); requirements for every layer folded (K3028, K3030, K3033, K3038, K3041). L3's four sessions archived (K3046).
- **Live on biosmoke7:** 0.83.0 = `main` @ `b4dd9d2616` (T46's close), signed and live (K3048). `/` serves the old setup page to everyone; `/app` holds 17 of the design's 50 screens (6 partly); the founder is admitted to `/app` but the session lasts one tab (`sessionStorage`) and `/` never forwards (K3051).
- **Channel:** BOB's Writer line is BOB #165's (primary). Posted B158, B159 (questions for the undrawn screens and the founder's journey). Unread: U178–U181 (DEC-200, N997 drawn, U180 MERGE).
- **ROOTs:** primary ROOT #5 (`session_0187SrKsqhqzSTqwDk2hzcXy`) at 45% of its window (K2679: no ROOT #7 needed); secondary ROOT #6 as above.

## Open with Bob

- Q1–Q4 (K3041; N1006): the welcome wizard's entry, what People opens, where readers see a published case, signing in the new interface.
- The installer's Cloudflare dashboard act (K2164; N1003), to be walked through.
- The stewards' contact address (K2799; N923).
- His weekly meter on the secondary at resume.
