# queue (T17)

**Status** · session_01XZjjzfxXvNbYmpNGGMed4o · depth 2 · COMPLETE · handled B2

## Record

**Entries applied** (B1, B2):
- N373 (K531, K566), R8: the feed reads `tasks.recentTasks({viewer, limit: cap * 2, statuses: ["open", "forwarded"]})` (`Queue.TASK_LIVE_STATUSES`), so resolved tasks no longer take the places open ones need. Tested with twelve resolved tasks newer than the only two live ones, at `limit: 2`, for a member and for a machine viewer; the old read fails that test (negative control run).
- N374's share (K565), R19: `taskExists({id, viewer})`, so a hidden task's id is `UNKNOWN_KIND`, identical (but for the id echoed) to an absent one; a member who sees the task is refused `KIND_NOT_PERSONAL` for the same id.
- N375's share, R1: `signer-self-registered` catalogued as an OBLIGATION with its sentence ("a member registered their own signing key; you may revoke it").
- J1, answered by B2 (K607): R12's `instead` and R28's bridge name the per-kind door, `Queue.OBLIGATION_DOORS` (`signerset` for signer-self-registered, `biasdebtresolve` for bias-debt, `taskresolve` otherwise; `queuemute` for a CONDITION). The bridge's bias-debt key now answers `biasdebtresolve` (it answered `taskresolve`); its test changed with it. The requirement text of R12 and R28 is BOB's to edit.
- Stale references: "LIVE: queue/proposals.mjs" at `queuestate.mjs`:102 and :105, and the same staleness through the catalogue's other sentences and comments ("queue #findings…", "queue #obligationsBiasDebt", "queueFeed's FINDING half" now `queue-producers`; "drained by queue" now "drained by tasks"), and `queue/schema.mjs`'s comment naming `queue/index.mjs #findingsStanceDiverged`.

**Deferred:** none.

**Found in other modules (REPORT):**
- `not_product`'s generated `bio-plane/dist/bio-plane.bundled.mjs` is stale: it carries the catalogue's old sentences (regenerate at layer close).
- R8, residual: the feed still drops other members' tasks after the read (the member filter is not a `tasks` R6 parameter), so if more than `cap * 2` live tasks visible to the viewer are assigned to others and are newer, a member's own oldest task can still fall out. A `tasks` R6 `assignees` filter (the member and `unassigned`) would close it; `tasks`' and BOB's call.
- `control-plane`'s tests: 2 fail, identically with the tranche branch's queue code (so not this job's): "R36, R35 (N364): the pull is a route of the record store's door…" and "R22 (N363, K562): the door reads tasks' table — INBOX_REFUSED …".
- Step 2: I read whole the public parts of `tasks`, `queue-producers`, `scheduler`, `observation-log`, `progressions` and `bias`, and of `membership` only R26, R27, R84, R89, R90; not the rest of `legacy-checks`, `record-core`, `membership`, `connections`, `inquiry`, `actions`, `affordances` and `legacy-store`, whose services this job did not change its use of.

**Tests and checks** (on `job/T17/queue` after merging `tranche/T17`):
- `node --test bio-plane/test/m/queue/`: tests 49, pass 49, fail 0.
- Users of queue and its providers: `bio-plane/test/m/control-plane/`, `tasks/`, `queue-producers/`: tests 166, pass 162, fail 2 (the two above, pre-existing).
- `format`: 72 modules, 67 requirements files; 0 failures. `architecture queue`: 13 product files, 42 relative imports; 0 failures. `coverage queue`: 37 of 37 live requirement ids named by a test; 0 failures. `ownership queue tranche/T17`: 6 files changed; legacy-store, legacy-checks, legacy-index 0 lines; 0 failures.

Size (session_01XZjjzfxXvNbYmpNGGMed4o): test runs 9, module lines 2484

## J1 · QUESTION

R12 and N375. R12 says an OBLIGATION's disposition is `available: false` with `instead` `biasdebtresolve` for bias-debt and `taskresolve` otherwise. The new OBLIGATION kind `signer-self-registered` (R1, N375; `queue-producers` R14) has no task row: it is keyed by the key (`OBLIGATION::signer-self-registered::<key>`) and leaves only when the key stops being `active`, through `membership.signerSet` (`op=signerset`, its R26). So `taskresolve` would name a door the item cannot go through (the defect REC-207 fixed for bias-debt).

My best reading, which I am building now: R12's `instead` is `signerset` for `signer-self-registered` (bias-debt `biasdebtresolve`, every other OBLIGATION `taskresolve`), tested at the feed. I leave R28's bridge as written (`instead` `queuemute` or `taskresolve` by class), since its text is explicit; if you want the bridge to name the same per-kind door (it would then say `biasdebtresolve` for a bias-debt key and `signerset` for a signer key), say so and I will change it and its test. The requirement's R12 wording would need your edit either way.

## J2 · COMPLETE

Complete, re B1 and B2. N373 (live-status read, tested with more resolved tasks than the cap, negative control run), N374 (taskExists gated by viewer; hidden id is UNKNOWN_KIND like an absent one), N375's R1 (signer-self-registered catalogued), K607 (R12 and R28 name the per-kind door: signerset, biasdebtresolve, taskresolve), and the stale queue-producers references. Queue tests 49/49; the four checks 0 failures. Reported in the record: the bundle made stale, an R8 residual (others' live tasks can still crowd out a member's; a tasks assignees filter would close it), 2 control-plane failures that fail the same on the tranche's queue code, and that I did not read every Uses module's public part whole.
