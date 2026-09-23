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

### REC-172 · running — SPAWNED 2026-09-23 by CONDUCT #15 (REC-169 landed 91913d6b). NOT LANDED as read on 91913d6b (vf4 still sends an array consume). Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: first of the backlog (REC-171 is cached), the same bound fence REC-169 closes on the tick: an allowance or consumption the plane cannot trust is authority-class (SCHEDULER.md step 3); (3) is low and rides the same worker (SCHEDULER #15, 2026-09-23)
milestone: M4
interface: I3 — new C-22 refusals on `op=airuntick` and `op=airunopen`; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §14b item 6, *A RUN IS BOUNDED, AND THE BOUND IS RECORDED*.
depends-on: REC-169 (its `checkConsume` shape is reused).
scope: (1) refuse a non-object `consume` and an unknown key by a new C-22 code; `vf4-live-scratch.mjs` sends `{ fetches: 1 }`, with a dated note; (2) `aiRunOpen` applies `checkConsume`'s shape to `allowed` and `consumed`; (3) `lease` is refused as a consumable, with C-22.14's rationale (the plane decides it).
accepts-when: through the ops, an array `consume`, an unknown key, a negative or fractional allowance and a `lease` consumption are each refused by name with the bound rows byte-identical; vf4's fetch is counted. NEGATIVE CONTROL: restore the `continue` on an unknown key, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #15 (REC-169's worker's findings via CONDUCT #15, verified at the code; `node tools/mintid.mjs REC`).

### M0-132 · running — SPAWNED 2026-09-23 by CONDUCT #15 (D-286 landed d89e04d1). NOT LANDED, CHECKED BY CONTENT on d89e04d1: ai-session-wire.test.mjs still draws with unseeded Math.random. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: directly after UI-82, with D-286's class near the head: a result that moves with the draw is a DEFECT by Bob's ruling of 2026-09-23, and on `main` its red is an alarm to Bob (SCHEDULER #15, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3 (*"A GATE TEST DEPENDS ONLY ON THE CODE"*), with `docs/development/VERIFICATION.md` (admitted for M0 by name); D-286's fix as landed is the precedent.
depends-on: D-286 (its interval proof is reused; landing in CONDUCT's next train).
scope: (1) D-286's interval proof plus a D0c: disjoint ranges (e.g. FETCH_ALLOWED 3001–3999, SUBS_CONSUMED 4003–4499, SUBS_ALLOWED 9001–9973), the proof checked against every published value; (2) a per-suite counter suffix for every snap key built from `Math.random`, swept by one grep and listed in the landing.
accepts-when: the wire suite passes 500 consecutive draws and fails by name on a forced collision; no suite builds a snap key from `Math.random`. NEGATIVE CONTROL: restore one overlapping range, and D0c fails by name.
added: 2026-09-23 · SCHEDULER #15 (D-286's worker's findings via CONDUCT #15, verified at the code; `node tools/mintid.mjs M0`).

### REC-173 · running — SPAWNED 2026-09-23 12:19Z by CONDUCT #15 (handed off; relays this worker's report to CONDUCT #16). NOT LANDED as read on b41d1edb: migrate.mjs still refused SURFACE_NO_RUN (REC-171). Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: FIRST of the backlog, directly after REC-171 (in the cache) as BOB #30 placed it: REC-171 makes migration refuse, and a group that cannot migrate cannot start (SCHEDULER #15, 2026-09-23; BOB #30's inbox entry)
milestone: M7
interface: I3 — `op=promote` admits the replay; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5, *"A MIGRATION IS A REPLAY, NOT A SURFACING"* (BOB #30, 2026-09-23, landed at `80c5fb3f`).
depends-on: REC-171 (it made migration refuse; done at `ac4bdaae`).
scope: the exemption as ruled; `migrate.mjs`'s token narrows to admin; the builder confirms the provenance capture is registered BEFORE the promote.
accepts-when: as the paragraph states it: a replay naming a matching registered provenance capture lands keeping its Drive-era stamp and reads `not recorded (migrated from the Drive era)`; a non-admin, or a capture not listing the bundle and SHA, is refused. NEGATIVE CONTROL as the paragraph names it.
added: 2026-09-23 · SCHEDULER #15 (BOB #30's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

### M0-134 · running — 27 suites green on a thrown fixture. SPAWNED 2026-09-23 by CONDUCT #16. NOT LANDED, CHECKED BY CONTENT on e62e08e1: severedhomes.test.mjs names makePublishingProject 0 times and still carries the literal PROJ-2026-9101. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: FIRST of the backlog: a green that measured nothing is the record claiming more than it supports (CLAUDE.md §2), in the gate every landing trusts, and under M0-126 such a false PASS is cached (SCHEDULER #15, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): *verify by the positive artifact, never the absence of an error*; a suite is evidence only where it can fail.
depends-on: none.
scope: (1) `severedhomes.test.mjs` mints its project fixtures and takes the returned id, as `makePublishingProject` does; (2) every suite whose `finally` exits gains a `catch` that counts a failure, listed in the landing; (3) a hygiene rule: a suite's finally-exit must follow a catch, and the census of such suites is printed and floored; any assertion newly reached that fails is stated, never re-pinned.
accepts-when: `severedhomes.test.mjs` runs every assertion; a planted throw in any listed suite exits 1 naming it. NEGATIVE CONTROL: remove one `catch`, and the hygiene rule fails by name.
added: 2026-09-23 · SCHEDULER #15 (REC-160's worker's finding via CONDUCT #15, verified at the code; `node tools/mintid.mjs M0`).

### M0-130 · running — mergecarry's historical arm reads live origin/main. SPAWNED 2026-09-23 by CONDUCT #16 (M0-126 landed e62e08e1). NOT LANDED, CHECKED BY CONTENT on e62e08e1: mergecarry.test.mjs names origin/main 3 times. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: first of the gate-honesty rows, directly after UI-82: a red on `main` emails Bob as an ALARM and this one came from history, not code — Bob's ruling of 2026-09-23, *a gate test depends only on the code*; it cuts gate time (SCHEDULER #15, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3 (*"A GATE TEST DEPENDS ONLY ON THE CODE"*; (c): a check depending on anything but the tree never decides the verdict), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-126 (BOB #30's never-cache ruling rides it; this row's residue is re-read when it lands, so it waits rather than building what M0-126 may already answer).
scope: the arm reads a FIXED, stated range (the merges up to a pinned commit, named at the site) or HEAD's own first-parent history, never a remote ref; the M0-126 input set then covers what it reads.
accepts-when: the arm's verdict on one tree is identical whatever `origin/main` holds (driven with a planted remote ref carrying a dropped-edit merge). NEGATIVE CONTROL: read `origin/main` again, and the planted-ref arm fails by name.
narrowed: 2026-09-23 by SCHEDULER #15 on CONDUCT #15's report: under BOB #30's ruling a history-reading unit is never-cache, which answers the reuse half (M0-131); re-read this row's residue once M0-126 and `land/bob/nevercache` land.
added: 2026-09-23 · SCHEDULER #15 (CONDUCT #15's report of run #20; `node tools/mintid.mjs M0`).

### M0-131 · running — the train's reused tree record skips history-reading checks. SPAWNED 2026-09-23 by CONDUCT #16 (M0-126 landed e62e08e1; NOT ABSORBED: tools/train.mjs recordedGreen names never-cache 0 times on e62e08e1). Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: directly after M0-130, the same red: M0-130 makes `mergecarry` depend on the tree alone; this closes the door for every other history-reading check (plancheck's carry arm) (SCHEDULER #15, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §2 (M0-122's reuse: *"a union whose TREE this clone's D-293 record already holds GREEN … lands with no gate run"*) and §3 (a red on `main` is an alarm), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-126 (it builds on M0-126's landed shape). **Carries BOB #30's inbox item 2 of 2026-09-23** (a REUSED tree record still runs the never-cache units; TREE-SHARING §3a condition 1 as BOB #30 ruled it: a unit reading git history or a live ref is `GATE: never-cache (history)`, on `land/bob/nevercache` until it lands). If M0-126 lands carrying it, this row closes as ABSORBED.
scope: on a reused tree record the train still runs the history-reading checks (`mergecarry`, `plancheck`'s carry arm, any unit that reads commits rather than the tree) on the union before pushing; the set is derived, not hand-listed, or stated at the site.
accepts-when: a union whose tree is recorded GREEN but whose merge drops a carried edit is refused by the train naming the check. NEGATIVE CONTROL: skip the history checks on reuse, and that arm lands the bad merge and fails by name.
added: 2026-09-23 · SCHEDULER #15 (CONDUCT #15's report of run #20; `node tools/mintid.mjs M0`).

### REC-174 · running — frontier never-looked/missing lists' full-fetch hole. SPAWNED 2026-09-23 by CONDUCT #16 (D-389 landed e62e08e1). NOT LANDED, CHECKED BY CONTENT on e62e08e1: store.mjs still calls #frontierNeverLooked((cap + 1) * 2) outside the exhaustion disjunct. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: directly before D-57 and after D-389 (in the cache), the same coverage claim in the same read, CLAUDE.md §2's class: a list saying it is complete when the reader could not see its end (SCHEDULER #15, 2026-09-23)
milestone: M3
interface: I3 — `truncated` reads `true` on a full fetch of these lists; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §5 (the frontier is a view over the log) and §6 (the readers), with D-389's landed exhaustion disjunct as the precedent.
depends-on: D-389 (its disjunct in `Store#frontierPage` is reused).
scope: route every never-looked and missing fetch through D-389's exhaustion disjunct, OR-ed into each arm's `truncated`; the meaning arm's three lists gain the same over-fetch.
accepts-when: a fixture whose never-looked or missing supply exceeds the fetch reads `truncated: true` at every arm for every viewer; an exhausted supply reads as before. NEGATIVE CONTROL: drop the disjunct from one arm, and that arm's fixture fails by name.
added: 2026-09-23 · SCHEDULER #15 (D-389's worker's finding via CONDUCT #15, verified at the code; `node tools/mintid.mjs REC`).

### REC-175 · running — op=promote stores a caller-supplied sha256 unchecked. SPAWNED 2026-09-23 by CONDUCT #16. NOT LANDED, CHECKED BY CONTENT on 14faa089: store.mjs writes INSERT INTO files (...sha256) with f.sha256 as given and reads newSha from it, no digest computed. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: FIRST of the backlog: a record stating a false digest of its own bytes is CLAUDE.md §2's worst class (the whole product is the trustworthiness of the record), above M0-134's gate honesty (SCHEDULER #15, 2026-09-23; REC-173's worker via CONDUCT #15)
milestone: M6
interface: I3 — a new refusal on `op=promote`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` (the bundle's anatomy and the Mechanical Verification Law: a stored digest is of the stored bytes), with `CLAUDE.md` §5 (*an equality that costs nothing to produce is not evidence*).
depends-on: none.
scope: promote computes the SHA-256 of every inline text file's bytes and refuses a supplied value that differs, by a new refusal code with its canned translation, before any write; a file with no supplied sha stores the computed one; blob-backed files state what is checked; a census of rows already stored whose digest disagrees with their content is measured and stated, never silently rewritten.
accepts-when: through the op, a mismatched `sha256` is refused by name with the bundle byte-identical after; a matching one lands; the census is in the landing. NEGATIVE CONTROL: drop the comparison, and the `fff…` arm lands and fails by name.
added: 2026-09-23 · SCHEDULER #15 (REC-173's worker's finding via CONDUCT #15, verified at the code; `node tools/mintid.mjs REC`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
