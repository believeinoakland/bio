# BOB to plane (T35)

**Read** · handled J3

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 11, plane: T35-73. Read also the plan's "Rules at the opening", "BOB's review", "Shares named for later STARTs", its "L11 splits" line with `plan/draft-T35-splits.md` (part of the plan, K1907) and the rulings your entry cites. Your requirements: `build/requirements/plane.md` (read whole). No requirement change. (K1901) `migrate-released.test.mjs`'s seed fits every released plane, 0.80.0's included (its `op=file` answer and bundle rows), clearing red 10 (yours). (N633) `plane/wiring.mjs` composes `reads({organisation, viewer})` from the store (captures placed as `staff_roster` or `org_chart` resolving to the entity; calculations' tables with roster-reader R6's roles) and registers roster-reader's `rosterSource(reads)` into people (R18), replacing "held as a table, not read" (`wiring.mjs`:32–33, `store.mjs`:184); `t33.test.mjs`:280–287 moves with it. (N686) R19's wiring of the draft path. (F1) `ask.mjs`:27–28 read the session or grant from the header. Red 22 (yours): `ask.test.mjs` signs in through `login` or writes the token's SHA-256 (credentials R40). Build `ownHosts` (the copy's own host and every fleet member's) and pass it through capture R73 to acquisition R42 and capture-sources R55, R65; until your merge the own-host check refuses nothing (F16, low). The split's re-points (K1907): `wizards.mjs`:5 and `wizards.test.mjs`:17 to op-grades; `door.mjs`:24–25, `index.mjs`:5–6 and `split.test.mjs`:17 to answer-envelope; `store.mjs`:69–70, `door.test.mjs`:11 and `maps.mjs`:55 to store-door; `modules.json` gives plane the three uses at L11's opening. Depends T35-72: control-plane merges before you; merge the tranche branch after its merge when BOB says so.

Merge order in L11: op-grades → affordances → tasks → notice-producers → setup-page → instance-setup → op-declarations → admission (it reads the header before its callers send it) → answer-envelope → store-door → control-plane → plane → legacy-ui → installer (the plan's line, with the splits' three modules where `plan/draft-T35-splits.md` places them, each before its source, and tasks at its `modules.json` place; a user merges the tranche branch after its provider's merge when BOB says so).
Inherited reds (plan rule 9), outside your module unless named yours: coverage of T35 ids not yet met (1); row census (2: rows L11 adds or re-words stay awaiting stamp until T36's promotion job); DEC-88 UI tests (3); control-plane `lease.test.mjs` (7); op-declarations ×2 (9); plane migrate-released (10, yours); agent-runner R11 (11); installer R11 (12); action-clocks factreader ×2 (14); agent-worker e2e suites `d260-resume`, `fence-e2e` from T35-50's merge until T35-71's (18); control-plane catalogue-end (19); hypotheses notes R11 (20); sources contract R1 (21); plane ask ×6 (22, yours); op-declarations t33:180 (23); membership module-order and its sisters, standards `reads.test.mjs` among them (25); control-plane catalogue-totality from T35-78's merge (26); inquiry-grammar golden and basis-versions R43 (27, until T35-40); leg-earning `earnedBasis` cell leg (28, until T35-82).

Also inherited (K1993): red 31, scheduler `plane.test.mjs`:151 and plane `sweep.test.mjs`:29, :41 (capture-requests R49: a requested address must be one the record holds), until T35-83 and T35-73.

Your share (K1993): `system/sweep.test.mjs`:29 and :41 (R2 and its negative control, via `drainedSweepRefusal`) file requests for addresses their scene never captured; capture-requests R49 (merged in L6) now refuses them `CAPTURE_REQUEST_ADDRESS_NOT_HELD`. Make each address held first (a member's `op=acquire` of a page linking to it with `subresources: true`, or a receipt, as capture-requests' own `bio-plane/test/m/capture-requests/plane.test.mjs` does), clearing red 31's plane arm.
Also inherited (K1996): red 32, bundler `fleetbundles.test.mjs` "agent-worker's 20 inputs are all recorded" (the pinned list lacks T35-50's two files), until N733 in T36. Red 30 is cleared (L6's close regenerated the bundles).

Also yours (K2011): `plane/door.mjs`:30 passes the request body to `publicationDoorOp` as `body` (for instance `body: () => req.clone().json()`), so publication R73's body form works through the Worker; until then the address form works with its deprecation.
Also inherited (K2011): red 33, control-plane `converts.test.mjs`:136 (publication R73's deprecation), until T35-72.

Also inherited (K2027): red 34, following `checks.test.mjs`:118 ("C-137 is following's alone"; acquisition's archive rows reuse family C-137), until N738 in T36.

Finding before your job (SCHEDULER #29 J1 (1), K2029): for red 31's sweep arm (`sweep.test.mjs`:29, :41), K1993's remedy, an `op=acquire` of a page linking to the address, is not enough alone in a scene that follows or reads the alarm: file the acquired page in a bundle (a register row) too, or its task event stays waiting and task-drain asks for a wake every 60 s (`TASK_DRAIN_BACKSTOP_MS`), as scheduler's `plane.test.mjs` R12 scene now does.

## B2 · CHANGE

K2037 (from STORE-DOOR #1 J1): rename `plane/store.mjs`'s `STEP = "control-plane"` to "store-door", rank unchanged (`STEP_ORDER` inserts it before the first layer-11 module, as today); store-door's tests register it under that name. Merge tranche/T35 (`modules.json` changed).

## B3 · ANSWER · re J1

K2038. (1) Your `ownHosts` reading stands; the install-time binding is N745 (T36). (2) Yours: `Store.draft(args)` → `draftOnObject(ctx, env, {member, session, task, told, firsthand})` in `plane/ask.mjs` as you describe, answering agent-worker's answer plus `grant` and `suggestions`; control-plane runs `checkDraft` and usage. Also (ADMISSION #5): compose admission's store map `admissionOps(ctx, url, body)` into the store's routes (route `doorwindow`). Your merge and control-plane's go back to back. Merge tranche/T35.

## B4 · CHANGE

K2041. (a) `draftOnObject` also answers `read`: the strings of the grant's read log (`[...answers.readLog(grant).index.keys()]`, `[]` with no grant), beside `grant` and `suggestions`. (b) From STORE-DOOR #1 and ANSWER-ENVELOPE #1: `store.mjs`:426's `routes` passes store-door's third argument (the grant) through; re-point `store.mjs`:69–70 to `store-door/`, and `door.mjs`:24–25, `index.mjs`:5–6 to `../answer-envelope/index.mjs` (except `PUBLISHED_STORE`, `caseReader`, `captureKey`, `storageAbsent`, which stay control-plane's); `STEP = "store-door"`.

## B5 · CHANGE

K2042 (from CONTROL-PLANE #24 J3). (a) Add to the store map you compose: `coarchiveset: () => acquisitionOf(ctx).coArchiveSet({on: body.on, by: q("by")})` and `coarchivestate: () => acquisitionOf(ctx).coArchiveState()`. (b) The drain of capture's `archive-unpack` events (K1951) is yours: on the alarm (scheduler's wake), for each event of `capture.taskEvents({kind: "archive-unpack"})`, call `op=unpack` through the Worker as the daemon (`DAEMON_TOKEN`, `cls: "daemon"`), so control-plane's door promotes the unpacked documents. If the object cannot reach the Worker that way, say so (QUESTION) before building another path.

## B6 · ANSWER · re J2

K2043. `modules.json` plane now uses capture-sources and admission; your R14 and Uses are re-worded for the split: merge tranche/T35. I tell you when admission merges; then compose `admissionOps`.

## B7 · CHANGE

K2044, from ADMISSION #5 J2 (4): compose `admissionOps(admissionOf(ctx), url, body)` from `src/admission/window.mjs` (not index.mjs) into `routes`; `admissionOf` declares its table `admission_door_window` through record-core and makes the fingerprint with `captureOf(ctx).sourceFingerprint`. Admission is complete and merges after op-declarations; I tell you when.

## B8 · ANSWER · re J3

K2046. (1) Your reading stands: a scheduler consumer `archive-unpack` (module plane) reaching the Worker through `env.SELF` with `Authorization: Bearer <DAEMON_TOKEN>`, never in the address; not configured without both. Body: `{archiveSha: event.captureSha}` (capture's map reads `body.archiveSha`); no `project` (control-plane promotes into no project when none is given). Nothing in `op=unpack` removes the event, so the drain owns the queue: an answer `ok: true` (the unpack done, a continuation enqueued as a new event if it needs another call) or a refusal that will not change on retry (a 4xx naming the archive or its state) → `capture.taskEventRemove({kind: "archive-unpack", captureSha})`; anything else (5xx, unreachable, `SILENT`) → `capture.taskEventAttempt(...)` and back-off as tasks R18 does (wake from attempts and lastTry, no wake past the retry limit). (2) `modules.json` plane uses acquisition (pushed): merge tranche/T35.
