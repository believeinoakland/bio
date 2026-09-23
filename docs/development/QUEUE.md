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

### LED-7 · queued — **SCHEDULER'S OWN ACT, NOT A WORKER SLOT: CONDUCT must never brief a worker into this row, and does not need to ask again (SCHEDULER #2 to CONDUCT #7, 2026-09-19).** **THE FOLD: every open DEBT row TRIAGED AT THE CODE and archived by one of three doors (closed in fact with its evidence · a BACKLOG item in build order keeping its `D-` id · a stated permanent limitation in its home design); then DEBT.md archived whole and new defects written straight into the backlog.** — waits on LED-6 (it writes into the backlog LED-6 creates). **EXEMPT FROM THE M0 HOLD BY NAME.**
order: the debt fold: until it runs, ~222 open DEBT rows — among them disclosure defects that would outrank features — stand outside the order, so the plan cannot be proved in order without it (SCHEDULER, first order audit, 2026-09-18)
milestone: M0 (process, Bob's direction 2026-09-18: *"those debts should be appropriately folded into the build plan so that those debts are retired - in the right build order."*)
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with `docs/development/WORK-PIPELINE.md` §3, which carries LED-7's design and accepts-when.
depends-on: LED-6
scope: as §3 states, EXCEPT the actor — batches of ~20 rows driven by SCHEDULER ITSELF (Bob, 2026-09-19: *"Scheduler should be actively involved in moving debt rows into the build plan (in the proper order)."*), never spawned into a development slot. **218 open rows, measured 2026-09-19 by SCHEDULER #2** (`grep -c '^| D-' docs/development/DEBT.md`); 223 before batch 1, which closed 4 in fact, placed D-158, routed D-325 and D-52 to BOB and carried 3. A single row whose verification needs a build or a long code trace goes to CONDUCT as its OWN row with its own id — never as "LED-7". **OWED FROM M0-109's DELEGATION** (`CLAIMS.md`, 2026-09-22; SCHEDULER #13): the batch that moves D-388 waits on M0-115 (item 1); the CLOSING landing's retargets are §3's list, which BOB #27 widened to items 2 and 3 the same day.
accepts-when: as §3 states it.
added: 2026-09-18 · CONDUCT #5 (BOB #15's inbox entry of that date).

### M0-100 · running — **SPAWNED 2026-09-23 by CONDUCT #14, wave 6. NOT LANDED, CHECKED BY CONTENT on `30475ca6`: `docs/development/` holds one `MEASUREMENTS.md` and no per-entry measurement file. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **NARROWED 2026-09-22 by BOB #27 to `MEASUREMENTS.md` AND `INTERFACE-CHANGES.md`, WHICH STAY ON `main`: under M0-111's train two** … (whole text: the cut archive)
order: after M0-110 and M0-111, where BOB #27 placed it on narrowing: the collision it removes exists only inside M0-111's train (SCHEDULER #12, 2026-09-22)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `docs/development/ORCHESTRATION.md` … (whole text: the cut archive)
depends-on: M0-111.
accepts-when: two `land/*` branches each adding a measurement land in one train with no conflict; every reader's counts over the frozen history are unchanged. How a liar passes it … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #8 (BOB #23's inbox entry; `node tools/mintid.mjs M0`); narrowed 2026-09-22 by BOB #27 (SCHEDULER #12).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-100» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-116 · running — SPAWNED 2026-09-23 by CONDUCT #15. NOT LANDED, CHECKED BY CONTENT on 41c7e0c3: newgroup/src/index.mjs verifyUpdate (L540) reads op=bootstrap only. Authority: BIO_Distribution_v0_1.md §8, with CLAUDE.md §5. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: after D-254, above features: a group can run a stale DO or member with nothing reporting it — CLAUDE.md §2's class, in the distribution path (SCHEDULER #2, 2026-09-19; NARROWED by FLEET #3 and verified at the code by SCHEDULER #4, 2026-09-21: `vf4-live-scratch.mjs` stores the isolate's value as `plane_durable_object`)
milestone: M7
interface: I3 — ONE additive IC: `op=bootstrap`'s reply gains the DO's own build under a DISTINCT field; the op's field pin moves in the same commit.
design: `docs/architecture/BIO_Distribution_v0_1.md` §8, the fleet's version authority, with CLAUDE.md §5: *a deploy verified is not a build serving*.
depends-on: none. DS-2 built the BUILD-side authority; this is the RUNTIME half.
scope: (1) the DO reports its own build under a field that is NEVER `version` — a later spread would REPLACE the isolate's reading — and `verifyUpdate` requires both and names the one that lags; VF-4's DO arm reads it. (2) each member is read back THROUGH THE BINDING after install and deploy (D-115's surviving requirement).
accepts-when: a DO or member whose build differs from the routing isolate's is NAMED, and the install or update does not report success. How a liar passes it: filling the DO field from the isolate's env, so two values agree for free. NEGATIVE CONTROL: copy `env.VERSION` into the DO field in the handler, and the arm fails by name.
added: 2026-09-19 · SCHEDULER #2 (LED-7 batch 3; keeps its `D-` id); narrowed 2026-09-21.
uncut: restored whole from the cut archive on entering the cache (SCHEDULER #14, 2026-09-23), so the worker reads its design here.

### CAP-13 · running — SPAWNED 2026-09-23 by CONDUCT #15. NOT LANDED, CHECKED BY CONTENT on 41c7e0c3: bio-plane/src/store.mjs still counts COUNT(DISTINCT primary_sha) FROM site_asset_refs (3 sites). Authority: CAPTURE-SCALING.md §Job one, reuse condition 3. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: after D-116, above the ledger tooling: CLAUDE.md §2's class — a figure the record cannot support, in content-addressed manifests nothing corrects, on monitoring's normal path; below D-116 because it concerns FURNITURE and the fetch-honesty fields are right (SCHEDULER #6, 2026-09-21; D-339 worker's items 1–2, verified at the code)
milestone: M2
interface: none expected — no op exposes `siteassets` or `sitechrome`; `reused_seen_in_documents` keeps its name and type, only its VALUE becomes true (the integrator classifies).
design: `docs/development/CAPTURE-SCALING.md` §Job one, reuse condition 3 — *"an asset only one page references is that page's own"* — which also states this defect.
depends-on: none.
scope: count distinct primary ADDRESSES (`captured_locators.address_norm` where `capture_sha = primary_sha`) in both readers — a query, not a schema change. D-58 writes the locator unconditionally but in a swallowing `try`, and older captures may lack one: say what such a primary counts as, never drop it silently. Reword the two comments to recency of fetch, and the two that say a re-capture cannot inflate the count. **FULL GATE PROFILE**.
accepts-when: one page captured twice with changed bytes reads 1 document and is NOT reused; two pages sharing a stylesheet read 2 and are; the manifest's N equals the page count. How a liar passes it: a byte-identical re-capture, which never moved the count. NEGATIVE CONTROL: count `primary_sha` again, and the changed-bytes arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (`node tools/mintid.mjs CAP`).
uncut: restored whole from the cut archive on entering the cache (SCHEDULER #14, 2026-09-23), so the worker reads its design here.

### M0-126 · running — SPAWNED 2026-09-23 by CONDUCT #15 against TREE-SHARING.md §3a (landed 619dfa65). NOT LANDED, CHECKED BY CONTENT: no gate-results branch reader/writer in tools/ on 619dfa65. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: FIRST of the backlog (BOB #29): every landing and every lane's gate pays for it, so it CUTS GATE TIME (Bob, 2026-09-22, `CLAUDE.md` §2); its design landed in §3a at `619dfa65` and CONDUCT #15 spawned it on BOB's order (moved into the cache by SCHEDULER #14) (SCHEDULER #14, 2026-09-23; BOB #29's item)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3a (the shared per-suite result record, landed by BOB #29 at `619dfa65`), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none — its design (§3a) and `land/bob/gate-rerun-failed` are on `main`.
scope: a record keyed (unit, hash of its inputs: source, sibling control, transitive imports, files read, as `gates.mjs` derives per unit; a plane or fleet unit always includes the FULL runtime set), value PASS with run id and tree, on an append-only branch, one file per key; `gates.mjs` skips a unit whose key holds a PASS and prints REUSED. SAFETY, all three: a suite reading an undeclared input (clock, network, env, live coord) is NEVER-CACHED; a check FAILS when a unit reads a file its key does not cover; a FULL run at every release cut, controls kept.
accepts-when: a second clone runs 0 suites over a tree whose units a first clone passed, and one input change re-runs exactly the units whose key moved. NEGATIVE CONTROL: drop one input from a unit's hash, and the coverage check fails by name.
added: 2026-09-23 · SCHEDULER #14 (BOB #29's designed item; `node tools/mintid.mjs M0`).
owed-at-integration: HOLD FOR BOB'S READ (BOB #30, 2026-09-23 06:50Z, recorded by CONDUCT #15). When land/worker/M0-126 is pushed, CONDUCT triggers BOB #30 with the branch and tip BEFORE any train takes it, and every train runs with `--drop land/worker/M0-126` until BOB answers LAND (or names a defect). BOB reads the diff whole against TREE-SHARING §3a's three REQUIRED conditions (never-cache honoured, plancheck never cached; the input trace fails under-inclusion BY NAME with no PASS written; release cuts and the GitHub run on main reuse nothing) and its negative control (drop one input file -> that unit fails by name).
owed-at-integration: CORRECTION (BOB #30, 07:12Z; sent to the worker): per TREE-SHARING §3a cond. 3 (s15-rulings), only a FULL run that REUSED NOTHING (no REUSED unit, no --since) is marked a backstop a release cut may rely on; any reuse => never a backstop.

### M0-127 · running — SPAWNED 2026-09-23 by CONDUCT #15. NOT LANDED, CHECKED BY CONTENT on b5ce975a: gates.yml L87 writes the verdict annotation with no FAILED detail beyond suites. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: first of the backlog, near the head: a red that names nothing is a false-looking alarm on Bob's email, and knowing what failed CUTS GATE TIME (Bob, 2026-09-22, `CLAUDE.md` §2); CONDUCT #15's hold lifted with the leak fix (SCHEDULER #14, 2026-09-23; narrowed by SCHEDULER #15)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3 (a red GitHub run is an alarm that reaches Bob; *a gate test depends only on the code*), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none — M0-114's workflow and the leak fix (`cdfaea39`) are on `main`.
scope: (1) the verdict line (`.github/workflows/gates.yml`'s `FAILED=` and the gate's own RED line) names every non-suite failure (a residue check, a leak, a timeout), never `none` on a RED; (2) the battery's per-suite result line carries the suite's pid (`battery.mjs` already records `r.pid`), so a residue names the suite that left it; (3) `hygiene.test.mjs`'s D-186 control text, which predates the race, is corrected with a dated comment.
accepts-when: a run whose only failure is a leaked sandbox reads RED naming the residue and the suite that left it, never `FAILED=none`. NEGATIVE CONTROL: plant one sandbox directory in TMPDIR, and the verdict names it by path.
added: 2026-09-23 · SCHEDULER #14 (CONDUCT #14's runner finding; `node tools/mintid.mjs M0`); narrowed 2026-09-23 by SCHEDULER #15 (CONDUCT #15's report).

### REC-169 · running — SPAWNED 2026-09-23 by CONDUCT #15 (depends-on D-85: landed b5ce975a). NOT LANDED, CHECKED BY CONTENT: store.mjs still upserts `consumed = consumed + ?` (2 sites) on b5ce975a. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: first of the product rows, directly after M0-127: an authority defect on a bound the plane enforces (security outranks features, SCHEDULER.md step 3), live since D-85 made `surfaces` a plane-counted bound (SCHEDULER #15, 2026-09-23; D-85's worker via CONDUCT #15)
milestone: M4
interface: I3 — a new refusal on `op=airuntick`; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §14b item 6, *A RUN IS BOUNDED, AND THE BOUND IS RECORDED*, with §11 item 5 rule 2 (the `surfaces` bound).
depends-on: D-85 (its `surfaces` bound, integrating now).
scope: refuse a `consume` value that is not a non-negative integer, by name, before any write; decide at the code whether a bound the PLANE counts (`surfaces`, and any other it increments itself) may be consumed by the caller at all, and refuse it if not, stating which in the landing.
accepts-when: driven through the op, a negative, a fractional and a non-numeric delta are each refused by name and the bound rows are byte-identical after; a positive integer delta still lands. NEGATIVE CONTROL: drop the check, and the negative-delta arm fails by name.
added: 2026-09-23 · SCHEDULER #15 (D-85's worker's finding via CONDUCT #15, verified at the code; `node tools/mintid.mjs REC`).

### REC-170 · running — SPAWNED 2026-09-23 by CONDUCT #15. NOT LANDED as far as read: publishedmanifest per-case pair absent on b5ce975a; NOTE index.mjs L9248 already spreads strengthUndetermined somewhere — the worker establishes WHICH op. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: directly after REC-169, first of the public-page corrections: a published page saying the record lacks what it holds, CLAUDE.md §2's class, UI-80's sibling on the index; UI-82 follows on the surface (SCHEDULER #15, 2026-09-23)
milestone: M10
interface: I3 — `op=publishedmanifest` gains the per-case pair; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 12 (b)–(d) (the pair is stated once, in the case document, per case), with IC-74 (a finding in several cases answers every case, never one).
depends-on: none — D-442 (rule 12) is on `main`.
scope: each manifest entry whose pinning case documents carry differing pairs serves them per case (case id, edition, pair) or `strengthUndetermined` with its reason; a finding with one pair reads as today.
accepts-when: a fixture finding pinned by two cases with different pairs reads both, each naming its case; a single-case finding is byte-identical. NEGATIVE CONTROL: serve the null again, and the per-case arm fails by name.
added: 2026-09-23 · SCHEDULER #15 (UI-80's worker's finding via CONDUCT #15; `node tools/mintid.mjs REC`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
