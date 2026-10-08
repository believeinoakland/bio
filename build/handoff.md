# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #143 (`session_01YCBYkMVtZpK8zWkFJcsNkZ`), 2026-10-08 ~21:45 UTC, for BOB #144. Read `build/rulings-active.md` first; this BOB's rulings are K2329–K2368.

## Open with Bob

None. Answered today: N806 Q1 A (K2334); N796 held with the investigation lane, not raised again (K2334); N812's A1–A4 (K2352, K2353: a project's account is an API key, or a member's own subscription only while the project has one member; any one owner sets it; cascade project → member → group, each with its own limits; an account at its limit refuses). Meter 69% at ~21:00 (K2357); pause at 80% (K2341); Bob says when to ask each layer, do not ask before.

## Open with UX-DESIGN

B115/B116 answered (U137, U138: DEC-187). U139/U140: **MERGE of PR #16** (DEC-184–DEC-187) at T39's close (K2348; B118 sent, U141 acknowledged).

## Where things stand

- **T38** closed by PR #17 (K2339); **T39** open on `tranche/T39` (plan `build/plan/current.md`). L1, L2, L3, L6 merged and closed; L4, L5, L7 empty. Coverage 0 failures except case-carriage R15, R17 (T39-10, accepted).
- **L8 running** (started ~21:43, K2367): CASE-GRAMMAR #12 `session_015c5pkGR6f8FDqbTSrFjvzi`, CASE-CARRIAGE #6 `session_01LmwYYcJzTZXw2vJWwsENHv`, PUBLICATION #26 `session_01WbD8jksEcAKJZvuvR4ohT8`, PUBLIC-READ #17 `session_01Djbnfgfma73t1Qd5xWboXx`, RATIFICATION #22 `session_01Ky2nmjoLmrWwGBPjKWFCBF`, CASE-CHECKER #9 `session_013nDuZWRyji4rYH9ax6JrLQ`, CASE-DISCLOSURES #7 `session_017U4puvgg5SbVfxAghkjSpV`. Merge in `modules.json` order; publication, public-read and case-disclosures build against case-carriage's R13/R15/R16 and merge the tranche when told (CHANGE) case-carriage has merged.
- **L10** ready: requirements applied (K2365), START `starts-T39/scheduler.txt` written.
- **L11** not yet prepared: T39-16a/b (setup-words split by copy from instance-setup, N807, K2343; `setup-words` in `modules.json` with empty paths; requirements file to write, ids moved "moved to setup-words R<n>"), the plane's composition (case-carriage's `onReceipt` listener, scheduler's consumer) and N810 (`pdfjs-dist` dev dependency of `bio-plane/package.json`), and the L1–L10 new codes' shares (op-declarations, op-grades, affordances, answer-envelope) fixed from the merged codes. Draft and START them while L8 runs (P18).
- **N812** (AI settings, T40): draft `plan/draft-T40-N812.md`, Bob's answers K2352, K2353, H7 K2350; parts C–E to adopt and fold with one K before T40 opens.

## Next steps, in order

1. Take over (§5.1): archive BOB #143, its `BOB-final` row under T39; `mail xwriter`; arm backstop and WATCH; delete mine (backstop `trig_012xxgxTkNeCR9xQucCJyP9A`, WATCH `trig_012neKkLEqN7JrCcLkofWGVM`).
2. Merge L8 jobs as each completes (CHANGE users when case-carriage merges); close L8 (§5.6); start L10, then L11.
3. Close T39 (§5.7): (1) merge PR #16 into `main` first, ordered by UX-DESIGN's MERGE U140 (K2348); authority Bob's standing direction in the product's `CLAUDE.md` (K1177), standing list `mcp__github__merge_pull_request`; no refusal recorded since K2273; then merge `main` into `tranche/T39` (never a rebase), keeping the design stream's text, and run the checks. (2) archive the plan `CLOSING`. (3) PR `tranche/T39` → `main` merged with the GitHub merge tool, same authority (K2339 did this for T38). (4)–(6) as §5.7. T40 then carries N797–N799, N811 (DEC-184–DEC-187 on `main`), N812, N813, N809 and `next.md`'s rest.

## Process notes

- After a container restart: `npm ci --ignore-scripts` in agent-runner, `npm ci` in sheet-worker and file-scanner before `fleetbundles`.
- `mail addjob --name` takes the name with a space ("CASE-CARRIAGE #6").
