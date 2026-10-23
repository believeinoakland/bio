# The final pass of T51, in substance: brief for each walker (Bob K4781-K4785, K4787; K4426; K4733)

**Status** · DRAFT by BOB #268 (on branch `prep/bob268-final-brief`, after its handoff; K4781 and K4782 said this file existed when it did not), for BOB #269 to review, correct and adopt. Its areas are the draft coverage map's (`walk-coverage-T51.md` §3, K4784): **BOB #269 re-cuts them from COVERAGE #1's completed map before any walker starts**, and fills the copy's commit and the new room's details.

**What:** one real investigation, worked through every construct a team uses, from biosmoke8's new, empty, claimed room (K4752), first **offline** through the door, then **live**. Alpha is declared only when it completes (Bob, K4781). Scope (Bob, K4782): every row of the coverage map that is STALE or NEVER, plus the last fix round's changes; a WALKED-CURRENT row is crossed only as the journey passes it.

**Read first, whole:** this brief; the coverage map's rows for your area (§4) and how to read them (§1); `build/plan/fix-round-7-T51.md` §0 (R-PROXY, R-QUIET, R-CLOCK); the plan of the last fix round for its causes in your area; your area's rows of the last re-walk (`walk-T51-rewalk7/A.md`, `B.md`) for how each was reproduced.

## The investigation

One investigation a real team would run, the same in both phases, chosen by BOB #269 from the canon's sample investigations (a public body's spending against its stated policy is the default): it needs a regulation (a code chapter and its sections), a policy, a standard held from three document kinds, a court decision and its citations, a proceeding, people with careers and organizations with offices and holders on dates, ties between them, a money table ingested and reconciled, a timeline, a question carried to a conclusion with a claim check, a case signed and published, and an act (a records request and a filing). Every input is made by the walkers' own acts in the room, never seeded.

## Areas (draft; one walker each, in founder order)

1. Open the room (claim, first invitation, sign in and out, roster, administrators' acts, account, updates, declared bias).
2. Daily rhythm and projects (Home, Queue, a project, membership both ways, objective, themes, dashboards).
3. Bring documents in (one file of every kind: web page, visitor view, PDF ordinary, large and scanned, text, CSV, Word, PowerPoint, OpenDocument, RTF, email, image, ZIP; an observation).
4. Receive, vouch, watch, read, cite (held list, vouching, Inbox, source protection, watches and leads, reading to the last page, Find in this, a changing source, contradiction).
5. People, organizations, ties.
6. Money, time, connections, registers.
7. Law and courts (regulations, a standard, a policy, a court decision and citations, a proceeding).
8. Question to conclusion.
9. Case to publication (ceremony, a refusal read in full, a reload before signing, set-time publish, verify and recreate, docket and correction, an imported case).
10. Act (records request to reply, plan to start-and-send, determination to consequences, counsel, hold and notice, template).

Areas 2-10 depend on area 1's room and people; later areas use the documents and constructs earlier ones made, so the offline phase runs the areas in order as one journey, and the live phase starts each area once its inputs exist.

## Phase 1: offline, through the door (K4781, BOB's detail)

The whole plane in Miniflare (the seam files' way: `bio-plane/test/m/control-plane/t51-round*-seam.test.mjs`), every input made by the member's own acts through the real ops, never a hand-written answer shape (R-SEAM). Each walker is its **own session** (K4782), running its area as a script that BOB #269 commits as a journey test, so the journey is re-run at every round end afterwards. Each failure is a cause with its four fields (K4426) before anything is deployed; a red here is never "load" (K4787).

## Phase 2: live, at everyday load (Bob, K4783, K4785)

- **Five member walkers at once** (Bob: "5 at once sounds right to start. But measure once that starts."), each a member of the room (BOB #269 makes the five by script after the claim), each its own session; every screen and act timed with the answer's `Server-Timing` (`do-<route>`, `in-<route>`) and the wall time, against K4354's bars (a screen or act 2 s, a web capture 15 s), judged on `Server-Timing` with the proxy's share stated apart. The measurement Bob asked for: contention (the same acts on a quiet copy, PERFORMANCE's re-time, R-QUIET, beside them), the object's own timings, and whether 5 is the right figure.
- **Reaching the copy (R-PROXY, K4733):** through the environment's proxy only, unchanged (Chromium from `/opt/pw-browsers` with `proxy: {server: process.env.HTTPS_PROXY}`, default HOME). Never `--noproxy`, unset proxy variables, a private HOME or trust store. Every call is made inside the signed-in page; **no credential is written to a file** (re-walk 7's walker B was refused for it). Sign in through the sign-in screen with the environment's variables by name; never print a credential, token or invitation link. An act a safety check refuses is recorded as refused and never retried another way.
- **The ledger** first and last through the administrator (`op=owedwork`, the five watchdog fields: `alarm_at` in the future, `watchdog_seen` within 5 minutes, `stale` true whenever it should be).

## Records

- Each walker writes `build/plan/walk-T51-final/<area>.md` **as it goes, one row per check the moment it is done** (re-walk 7's walker A wrote only at the end; BOB checks the file at every backstop and asks once if it is empty after 20 minutes). Row: `row id | check | width | role | what I did | WORKS / BROKEN / NOT REACHED | what I saw (Server-Timing, wall) | screenshot`. Screenshots under `shots/<area>/`, small PNG, at 1280 and 390 px.
- End: counts with severity (BLOCKER a journey cannot complete; MAJOR wrong result, error, a bar missed on `Server-Timing`, a member would not understand; MINOR layout or wording, to `later-ux.md`).
- **Leftovers:** everything a walker makes is in the walk's room and named in its record; a signed case is published for good, so only the area 9 walker signs.
- No walker fixes, commits, pushes or deploys; BOB commits the records.
