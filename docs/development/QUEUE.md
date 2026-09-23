# The work queue

**The cache of the build plan** (`docs/development/WORK-PIPELINE.md`): the BOB INBOX's undrained entries, then the open
rows IN ORDER. **SCHEDULER owns this file** (`kickoffs/SCHEDULER.md`): it drains the inbox, orders the rows, and marks,
archives and replenishes; **CONDUCT writes one word — a row's `queued` → `running`**, pushed before its worker spawns.
READ WHOLE by every session.

**Statuses.** `queued`: runnable and unclaimed. `running`: a live worker holds an `agent-*` worktree with a claim on the
row's paths — and when none does, the row is UNDETERMINED between `queued` and done-awaiting-integration: read (1) a
`worktree-agent-*` branch whose commits name the item, then (2) the item's block in `CLAIMS.md` (`released:` means it
finished on purpose); only with neither does it fall back to `queued`. `blocked`: cannot run until something outside the
queue moves, and says what. `done` and `superseded` leave for the archive (`node tools/ledger.mjs archive <ID>`). **A
worker reads its own row from `coord` (`node tools/coord.mjs read docs/development/QUEUE.md`; M0-110, corrected by SCHEDULER #14) before it touches anything, and STOPS if the row does not read `running`.**

This file's history until 2026-09-18 — its earlier preambles, the 2026-08-04 handover, the per-area narrative — is in
`docs/archive/ledgers/QUEUE-narrative-2026-09-18.md`; drained inbox entries are in
`docs/archive/ledgers/BOB-INBOX-drained.md`; closed rows in `docs/archive/ledgers/QUEUE-closed.md`. All verbatim; look
them up (`node tools/ledger.mjs find <ID>`), do not read them whole.


## BOB INBOX — append-only. BOB writes here; SCHEDULER drains it (from 2026-09-18; CONDUCT did until then).

BOB appends a designed item, a correction or an order change here, with its intended place; SCHEDULER gates it at its cited design section and its depends-on, places it, and moves the drained entry to `docs/archive/ledgers/BOB-INBOX-drained.md` in the same commit.

## THE CACHE — the next rows, in order

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 8 in all. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### M0-126 · running — SPAWNED 2026-09-23 by CONDUCT #15 against TREE-SHARING.md §3a (landed 619dfa65). NOT LANDED, CHECKED BY CONTENT: no gate-results branch reader/writer in tools/ on 619dfa65. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: FIRST of the backlog (BOB #29): every landing and every lane's gate pays for it, so it CUTS GATE TIME (Bob, 2026-09-22, `CLAUDE.md` §2); its design landed in §3a at `619dfa65` and CONDUCT #15 spawned it on BOB's order (moved into the cache by SCHEDULER #14) (SCHEDULER #14, 2026-09-23; BOB #29's item)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3a (the shared per-suite result record, landed by BOB #29 at `619dfa65`), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none — its design (§3a) and `land/bob/gate-rerun-failed` are on `main`.
scope: a record keyed (unit, hash of its inputs: source, sibling control, transitive imports, files read, as `gates.mjs` derives per unit; a plane or fleet unit always includes the FULL runtime set), value PASS with run id and tree, on an append-only branch, one file per key; `gates.mjs` skips a unit whose key holds a PASS and prints REUSED. SAFETY, all three: a suite reading an undeclared input (clock, network, env, live coord) is NEVER-CACHED; a check FAILS when a unit reads a file its key does not cover; a FULL run at every release cut, controls kept.
accepts-when: a second clone runs 0 suites over a tree whose units a first clone passed, and one input change re-runs exactly the units whose key moved. NEGATIVE CONTROL: drop one input from a unit's hash, and the coverage check fails by name.
added: 2026-09-23 · SCHEDULER #14 (BOB #29's designed item; `node tools/mintid.mjs M0`).
owed-at-integration (BOB #30, 2026-09-23; each sent to the worker, recorded by CONDUCT #15): (1) HOLD: trigger BOB with land/worker/M0-126's tip BEFORE any train; every train `--drop`s it until BOB says LAND (he reads it against §3a's 3 required conditions + its negative control). (2) §3a cond. 3: only a FULL run that REUSED NOTHING is a backstop a cut may rely on. (3) §3a cond. 1: any unit reading git history or a live ref is NEVER-CACHE (`GATE: never-cache (history)`), listed and marked; a reused record still runs them.

### M0-127 · running — SPAWNED 2026-09-23 by CONDUCT #15. NOT LANDED, CHECKED BY CONTENT on b5ce975a: gates.yml L87 writes the verdict annotation with no FAILED detail beyond suites. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: first of the backlog, near the head: a red that names nothing is a false-looking alarm on Bob's email, and knowing what failed CUTS GATE TIME (Bob, 2026-09-22, `CLAUDE.md` §2); CONDUCT #15's hold lifted with the leak fix (SCHEDULER #14, 2026-09-23; narrowed by SCHEDULER #15)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3 (a red GitHub run is an alarm that reaches Bob; *a gate test depends only on the code*), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none — M0-114's workflow and the leak fix (`cdfaea39`) are on `main`.
scope: (1) the verdict line (`.github/workflows/gates.yml`'s `FAILED=` and the gate's own RED line) names every non-suite failure (a residue check, a leak, a timeout), never `none` on a RED; (2) the battery's per-suite result line carries the suite's pid (`battery.mjs` already records `r.pid`), so a residue names the suite that left it; (3) `hygiene.test.mjs`'s D-186 control text, which predates the race, is corrected with a dated comment.
accepts-when: a run whose only failure is a leaked sandbox reads RED naming the residue and the suite that left it, never `FAILED=none`. NEGATIVE CONTROL: plant one sandbox directory in TMPDIR, and the verdict names it by path.
added: 2026-09-23 · SCHEDULER #14 (CONDUCT #14's runner finding; `node tools/mintid.mjs M0`); narrowed 2026-09-23 by SCHEDULER #15 (CONDUCT #15's report).

### REC-171 · running — SPAWNED 2026-09-23 by CONDUCT #15. NOT LANDED, CHECKED BY CONTENT on 4355bfda: store.mjs (≈L14572) sets the assistantPrincipal run stamp for an ai credential ONLY. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: directly after REC-169, the same D-85 fence widened (BOB #30: *"Place it directly after D-85"*; D-85 sits in the cache, so this is the first backlog place after it and the authority row that precedes it) (SCHEDULER #15, 2026-09-23; BOB #30's inbox entry)
milestone: M9
interface: I3 — deploy-token creations are refused outside a run; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5, *"Rule 2's reach"* (BOB #30, 2026-09-23, landed at `4355bfda`).
depends-on: D-85 (it widens D-85's stamp; done).
scope: a creation stamped `agent` names a running run whose principal is the caller (`token:<class>` for a deploy token, `runPrincipalGate` unchanged), under the `surfaces` bound, sight check, C-66.1–.4 and the `inquiry_run_surfacings` row; every non-test caller creating under a deploy token (livefire, setup scripts, `agent-worker`) moves inside a run, or is brought to BOB, never exempted.
accepts-when: an admin-, member- and probe-token creation naming no run is refused `SURFACE_NO_RUN`; one inside the token's own running run lands with its row; a member's session creation is unchanged. NEGATIVE CONTROL: restore the `cls === "ai"` condition, and the deploy-token arms fail by name.
added: 2026-09-23 · SCHEDULER #15 (BOB #30's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

### UI-81 · running — SPAWNED 2026-09-23 by CONDUCT #15. NOT LANDED, CHECKED BY CONTENT on 4355bfda: FINDING_IN_SEVERAL_CASES appears 0 times in civicos-ui/app.html. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: directly after REC-170, the same public page: machine vocabulary shown to a stranger where the record holds the answer; before UI-82 because it needs no plane change (SCHEDULER #15, 2026-09-23)
milestone: M10
interface: I3 consumer (IC-74's `cases` on `FINDING_IN_SEVERAL_CASES`).
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 12, with DEC-49 as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it (every code a surface can receive has a translation).
depends-on: none.
scope: `pubOpen` offers the named cases as choices and opens the chosen one; and the code gets a translation row in its checks family, so the guard sees it.
accepts-when: against the real plane, opening a finding two cases pin offers both and opens each; no raw code renders. NEGATIVE CONTROL: drop the translation row, and the DEC-49 guard fails naming the code.
added: 2026-09-23 · SCHEDULER #15 (UI-80's worker's finding via CONDUCT #15; `node tools/mintid.mjs UI`).

### D-286 · running — SPAWNED 2026-09-23 09:15Z by CONDUCT #15 (the 7th worker under BOB #30's cap, REC-169's worker having finished). NOT LANDED, CHECKED BY CONTENT on 4355bfda: ai-session-context.test.mjs L162-163 draw with unseeded Math.random(). Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: near the head with M0-106, after DIST-6: a result that moves with the draw, not the code, is a DEFECT by Bob's ruling of 2026-09-23 (`TREE-SHARING.md` §3, *a gate test depends only on the code*); on `main` its red is an ALARM to Bob, and under M0-126 a lucky PASS is cached, so it cuts gate time (SCHEDULER #15, 2026-09-23, LED-7)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3 (*"A GATE TEST DEPENDS ONLY ON THE CODE"*), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none.
scope: the draw rejects and redraws any fixture whose derived values (each remainder, sum or ratio D1 looks for) equal a published value, or draws from ranges proven disjoint, stated at the site; D0b unchanged; the drawn values are printed so a failure is reproducible.
accepts-when: the suite passes on every one of 500 consecutive runs of the draw alone; D0b still fails when a colliding fixture is forced. NEGATIVE CONTROL: force the measured collision (3354, 1278, 2076), and D0b fails by name.
added: 2026-09-23 · SCHEDULER #15 (LED-7; D-286's DEBT row of 2026-08-10, verified at the code; keeps its `D-` id).

### REC-172 · running — SPAWNED 2026-09-23 by CONDUCT #15 (REC-169 landed 91913d6b). NOT LANDED as read on 91913d6b (vf4 still sends an array consume). Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: first of the backlog (REC-171 is cached), the same bound fence REC-169 closes on the tick: an allowance or consumption the plane cannot trust is authority-class (SCHEDULER.md step 3); (3) is low and rides the same worker (SCHEDULER #15, 2026-09-23)
milestone: M4
interface: I3 — new C-22 refusals on `op=airuntick` and `op=airunopen`; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §14b item 6, *A RUN IS BOUNDED, AND THE BOUND IS RECORDED*.
depends-on: REC-169 (its `checkConsume` shape is reused).
scope: (1) refuse a non-object `consume` and an unknown key by a new C-22 code; `vf4-live-scratch.mjs` sends `{ fetches: 1 }`, with a dated note; (2) `aiRunOpen` applies `checkConsume`'s shape to `allowed` and `consumed`; (3) `lease` is refused as a consumable, with C-22.14's rationale (the plane decides it).
accepts-when: through the ops, an array `consume`, an unknown key, a negative or fractional allowance and a `lease` consumption are each refused by name with the bound rows byte-identical; vf4's fetch is counted. NEGATIVE CONTROL: restore the `continue` on an unknown key, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #15 (REC-169's worker's findings via CONDUCT #15, verified at the code; `node tools/mintid.mjs REC`).

### UI-82 · running — SPAWNED 2026-09-23 by CONDUCT #15 (REC-170 landed 91913d6b). NOT LANDED, CHECKED BY CONTENT: app.html names strengthByCase 0 times on 91913d6b. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: directly after UI-81, on REC-170's field (SCHEDULER #15, 2026-09-23)
milestone: M10
interface: I3 consumer (REC-170's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 12 (b)–(d), with DEC-8 (a surface invents nothing).
depends-on: REC-170.
scope: `pubList` renders the pair per case, naming each case, or the undetermined state with its reason; one pair renders as today.
accepts-when: against the real plane, a finding two cases pin with different pairs lists both, each with its case; none reads "no frozen pair". NEGATIVE CONTROL: read the single field again, and the per-case arm fails by name.
added: 2026-09-23 · SCHEDULER #15 (UI-80's worker's finding via CONDUCT #15; `node tools/mintid.mjs UI`).

### D-389 · running — SPAWNED 2026-09-23 by CONDUCT #15. NOT LANDED, CHECKED BY CONTENT: no `raw.length === R` disjunct in bio-plane/src on 91913d6b. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: after CAP-13, above the ledger tooling: CLAUDE.md §2's class, in the read that must say WHICH absence is true. The row's open question — is `true` more often acceptable? — §2 answers: a coverage claim the method did not establish is not made, and fail-safe is the direction (SCHEDULER #6, 2026-09-21, LED-7 batch 13)
milestone: M3
interface: I3 — `truncated` reads `true` on a full raw fetch at all three arms; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §5 (the frontier is a view over the log) and §6 (the readers), which compute `truncated` from what the viewer may read.
depends-on: none.
scope: ONE disjunct, `raw.length === R` (the supply was not exhausted), in the ONE over-fetch the three arms share — never per arm, the mirror-and-drift class this row was raised to avoid. The row's analysis stands: it leaks nothing, since an entitled viewer on a full fetch already reads `true`. Arm G5 moves in the same commit with a dated reason.
accepts-when: a fixture whose raw supply exceeds the over-fetch reads `truncated: true` at every arm for every viewer; an exhausted supply reads as before. How a liar passes it: fixing one arm, so the fixture drives all three. NEGATIVE CONTROL: drop the disjunct, and the full-fetch arm fails by name at each level.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 13; keeps its `D-` id).
uncut: restored whole from the cut archive on entering the cache (SCHEDULER #15, 2026-09-23), so the worker reads its design here.

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
