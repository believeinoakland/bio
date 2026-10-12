# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #163 (`session_01XJwmd7ojTKoYqSxUPEVE2t`, primary account, depth 1), 2026-10-12 ~11:50 UTC, refreshing at 51% of its window right after T46's close, with no step half done: no tranche is open and no job runs. Read `build/rulings-active.md` first; this BOB's rulings are K3002–K3024.

## Where things stand

- **T46 is closed** (K3024): PR #32 `tranche/T46` → `main` merged with the GitHub merge tool (`main` @ b4dd9d2616); `main` holds `build/plan/archive/T46.md` (Status CLOSING, its Outcome: 64 of 65 entries, six new interface modules served at `/app`, 2,059,815,557 tokens over 67 rows). The design stream's PR #30 (DEC-198, K3021) and PR #31 (DEC-199, K3023) were merged into `main` first and into the tranche without conflict.
- **No tranche is open; no layer runs; no job session is live.** All L11 sessions are archived with their rows. BOB #163's timers are deleted; its own successor-check routine (below) is the only one.
- **Reds accepted by name to T47** (K3022, K3023), to become T47's rule 5: the design-file reds of PR #30/#31 (affordances 2, op-declarations 8, answer-envelope 1, ai-use 5, run-rules 1, action-replies 2, case-authoring 1; N992); membership REC-41 `members.test.mjs` 2 (N989) and R83's tolerance 1 (N991); file-scanner R10 2 (N990); bundler fleetbundles (N950's pin); promotion's row census (T47's stamp); legacy-ui's three (N794, N865).
- **`draft-T47-plan.md`** on the tranche branch (now on `main`): a worker's draft (66 entries by layer, 29 left out, 12 doubts at its end), **not yet reviewed**. It predates N981–N992: fold those in (N992 is the DEC-198/DEC-199 re-take across eleven modules; N989 is a requirements conflict BOB rules).
- **Channel:** BOB's Writer line on `mail/BOB` is BOB #163's; UX-DESIGN read through U177 (ACK B155). Lanes: investigation H43, actions H31, nothing new.
- **Container:** `npm ci` done in agent-runner (`--ignore-scripts`), sheet-worker, newgroup, file-scanner (lost on a container restart; rerun before regenerating bundles).

## ROOT

ROOT #5 (`session_0187SrKsqhqzSTqwDk2hzcXy`) read about 41% at BOB #163's takeover (Bob's threshold 55%, K2679). Bob has been asked for ROOT #7 (prompt below) and has not named it; ring ROOT #5 for BOB #165 until he does. When it runs, record its id in `build/manifest.md` ("Starting a session") with a ruling and archive ROOT #5 (Bob's direction; ROOT is replaced only by Bob, mechanics §2). ROOT #7's prompt for Bob: "You are ROOT #7 for BIO/CivicOS, started by Bob. Attach believeinoakland/civicos-process, read roles/ROOT.md and PROCESS-MECHANICS.md §2 and §13 whole, and follow roles/ROOT.md."

## Bob's rulings since the last handoff

None.

## Next steps, in order

1. Take over (§5.1): archive BOB #163 once idle, its `BOB-final` row under T46; delete its successor-check routine `trig_` named "BOB #163 successor check"; write your Writer line on `mail/BOB` (`mail.mjs xwriter`). No backstop or WATCH until T47 opens.
2. §5.7 (5) for T46: ask Bob for his weekly meter reading and report T46 to him in plain words (BOB #163 told him the close; give him the report: elapsed ~8 h, 64 entries, the new interface at `/app`, what was deferred and why, the work left, the cost).
3. Open T47 at once (§5.2): review `draft-T47-plan.md` whole against `next.md` (through N992), the design stream's DEC-198/DEC-199 on `main`, and its doubts list; rule N989 (membership REC-41 against instance-setup R80/R81's `bootstrap` fields) yourself (P17: a technical conflict); doubt 9 (hiding the setup page's day-to-day sections) is Bob's UX, asked only when it lands. Fold L1's requirements, then open `tranche/T47` from `main` and start L1.
4. Release 0.83.0 (archive/T46.md "BOB's acts"): cut from the open tranche (§11), the same steps as 0.82.0 plus trial §4 steps 15–17 (`CIVICSMITH_TEST_INSTANCE=biosmoke7`, verified; Bob's first sign-in on `connect`, M-T46-2). Each deploy to `biosmoke7` and each signature verify is Bob's approval in session, never on the standing list (K1715–K1717, K1905, K1910, K1915); signing runs in the GitHub `release` environment with the development key (K2893, K2910).

## Open with Bob

- His weekly meter reading (T46's close).
- ROOT #7's start (prompt above).
- The stewards' contact address (K2799): installer R48's address part and stewards R7 (T46-61) wait on it.
