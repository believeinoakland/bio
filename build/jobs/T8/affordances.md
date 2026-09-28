# affordances (T8)

**Status** · session_01GC8QNKei7sU5uBHF2DgCy8 · depth 2 · COMPLETE · handled B3

## J1 · REPORT

For legacy-index (N177, N80), as B1 asks. Both are on `tranche/T8` already; nothing below waits on my job.

**1. `decorate(act, gate)` (R11), exported by `bio-plane/src/affordances.mjs`.**
- `act`: an entry of `ACTS`, `CAPTURE_ACTS` or `PER_ITEM_ACTS` (it reads `id`, `label`, `weight`, `prompt`).
- `gate`: `{needs(op), mode(op)}`, both functions of the op id:
  - `needs: (op) => NEEDS[op] ?? null`
  - `mode: (op) => SESSION_OPS.member.has(op) ? "session" : SESSION_OPS.admin.has(op) ? "admin-session" : "machine"`
- Answer: `{id, label, weight, needs, mode, rung, rung_absence, prompt}`, every key present, an absent value a stated `null`.
- With that `gate` the answer equals today's `decorateAct(a)` (index.mjs 2781) key for key, so `op=affordances` (`catalog`, `acts`, `capture_acts`) and `op=queue`'s item options (index.mjs 4780, 4906) can call `decorate(a, gate)` with one `gate` built once at module level. `op=affordances`' `set_acts` rows spread `decorate(a, gate)` and add `set_key`, `item_keys`, `shared_keys`, `max_items` as today.

**2. N80.** `ACQUIRE_GRADE_NOTE` is imported by index.mjs 94 from `./affordances.mjs` and used at 5194. Capture already exports `acquireGradeNote` and `ACQUIRE_GRADE_NOTE` from `./capture/index.mjs` (the same composed string). When I drop my copy, index.mjs must import it from capture in the same merge or earlier, or the plane fails to load. My plan: drop both from affordances in this job; legacy-index's re-point should merge first (or with mine). If you would rather I keep a re-export from capture until legacy-index lands, say so.

**3. R5's text** still names `ACQUIRE_GRADE_NOTE` and `acquireGradeNote` as this module's. Once N80 lands they are capture's, so R5 should lose that sentence (a fold for you). My R5 test will check only the attest fence and the prompts.

## J2 · QUESTION

Two questions. I carry on with my best reading of each; neither blocks the op rows (the bulk of my entries), N80 or the imports.

**Q1. R26: how actions' live kinds reach `op=affordances`.** Actions answers the kinds per instance: `Actions#kinds()` reads the `jurisdiction_profiles` setting in the Durable Object and returns `actionKinds(view)` (the product's kinds, then the view's). `op=affordances` is composed in the Worker (index.mjs 4777), which publishes the module-level `VOCABULARIES` and, with no target, makes no Durable Object call at all. So no change inside my paths alone can make `vocabularies.action_kind` the value actions answers at the moment of the call.
- Best reading:
  - My module exports a pure `vocabulariesFor(kinds)` → `VOCABULARIES` with `action_kind` replaced by the given kinds (the same object for every other key, R4).
  - `VOCABULARIES.action_kind` at module level becomes actions' own `PRODUCT_KINDS` (what actions answers with no profile), and `risk_tiers` actions' `RISK_TIERS`. No kind is held here.
  - The handler (legacy-index) asks the Durable Object for the instance's kinds (a read answering `actionsOf(host).kinds()`) and publishes `vocabulariesFor(kinds)`, in both the target and no-target answers, and `op=queue`'s.
  - I test R26 at my interface: `vocabulariesFor(actions' kinds for a view with and without profiles)` equals what actions answers, and the module-level value equals the no-profile answer. The live half in the plane stays a `test.todo` naming legacy-index's route until it lands.
- The alternative is to extract the composition (R17, map §1: index.mjs `op=affordances`) into my module this tranche. That rewires the same handler lines legacy-index is changing for N177, concurrently, so I have not done it.

**Q2. N144: `surfaces` and `recipes` in `op=affordances`.** Three things stand in the way of my share as written:
1. **R17 fixes the answer's keys.** The no-target answer is `{target, catalog, vocabularies, capture_acts, set_acts, detail}`, and my plane test pins exactly those keys. R17 needs your fold first: say which answers gain `surfaces` and `recipes`, and their shapes.
2. **The data is legacy-ui's.** `SURFACES` (app.html 2191, 18 surfaces) and `RECIPES` (2484, 3 recipes) live in `civicos-ui/app.html`. `civicos-ui/test/surface-registry.test.mjs` proves them against app.html's own routing. The plane can publish them only by holding them: either a copy in my module (the drift DEC-8 forbids, since the UI's walk would then prove the UI's copy and not the plane's), or by moving them out of app.html, which is a legacy-ui change (no job this tranche, ruling 4).
3. **The shapes disagree.** Skills R10 validates each recipe step's `act` against `published.catalog`'s ids, which are `ACTS` only. The recipes' steps name an `op` (`searchfields`, `search`, `meaningrows`, `concerns`, `image`, `acquire`, `projection`, `cite`, `queue`, …), most of which are reads, not acts. Published as they are, `renderPack` would throw on the first step.

Best reading: N144 cannot be applied in this job. I leave R17 as it is and defer my share with this cause. It needs your R17 fold, a ruling on where the registry lives (moved into the plane with legacy-ui reading it, or the UI build publishing it), and a skills R10 reading of `act` against the ops the plane emits. If you rule instead that the registry moves into my module now (for example `bio-plane/src/affordances/surfaces.mjs`, published under R17's new keys, with app.html's copy left for legacy-ui), say so and I will build it.

## J3 · QUESTION

The op rows are done: every op layers 7–10 route is accounted for, keyed to each module's op map (escalation's names are LEGACY-INDEX #5 J1's). Two questions remain, and then COMPLETE.

**Rows applied** (K208 (2), R27's rule):
- **23 mutating ops** get a `NON_ACTS` row: standards 3, conformance 2, consequences 3, filings 6, escalation 8, and `actionriskpropose`.
- **Rungs:**
  - `reasoned`, each refusing `NO_REASON` without the member's reason (no new code): `consequencerevise`, `addressedrecord`, `escalationevaluate`, `escalationadvance`, `escalationdecline`, `escalationsuspend`. Each is driven at its own module's interface in `backing.test.mjs`, refused without its reason and accepted with one.
  - `reversible`: `escalationresume`, which asks no reason; a further suspension takes it back, and the test drives that.
  - `substrate`: `counselpacketexport`, on `export`'s ground.
  - `undetermined` (15): `standarddeclare`, `standardadopt`, `consequencerecord`, `filingapprove`, `filingsent` (`actioncorrespond`'s ground), `counselpacket`, `escalationopen`, `escalationattach`, `escalationend`, `determine` (see Q3); and the proposals `standardpropose`, `theorypropose`, `actionriskpropose`, `comparisonpropose`, `filingprepare`. The first three ask a why, and stay `undetermined` on `contradictionpropose`'s and `actionlawspropose`'s precedent.
- **The reads** (`standard`, `standards`, `standardinforce`, `determination`, `determinations`, `comparison`, `consequence`, `consequencesof`, `addressed`, `counselpacketread`, `filingsfor`, `availableactions`, `escalation`, `escalationsdue`, and monitoring R32's `monitoring`) get no `NON_ACTS` row. Legacy-index gives reads no `NEEDS` row (K153), so R12 would call such a row `stale`. `monitoring` is `driveshells`' cut, a read like it.
- **Transient red, as K208 (2)'s:**
  - Until legacy-index's `OPS`/`NEEDS` rows merge, `unaccounted` over today's table answers these 23 as `stale`.
  - The legacy `affordances.test.mjs` ("NON_ACTS names only ops in NEEDS") and `rung-ladder.test.mjs` (BACKWARD, and its exact count) are red the same way.
  - `rung-ladder`'s NO UNDER-CLAIM and backing scans do not read layer 9's op maps (`T5_OP_MAPS`), and escalation's `NO_REASON` sits behind a module-level `refuseReason`, which that scan does not follow. Both are for legacy-tests.

**Q3. `determine` and `BAD_REASON`.** Conformance asks a reason only where a determination supersedes one (`#supersession`). That is `triage`'s and `inquiryground`'s shape under K212. But it refuses under `BAD_REASON`, for both an absent and a malformed reason. Everywhere else in the plane, `BAD_REASON` is the malformed code beside `NO_REASON` (store, citation, actions, inquiry, progressions, basis-versions, promotion). So adding it to `JUSTIFICATION_REFUSALS` would widen the family to a code that means "malformed" at nine sites. Best reading, applied: `determine` is `undetermined`. The alternatives are to add `BAD_REASON` to the family and grade it `reasoned`, or for conformance to answer an absent reason with `NO_REASON` (conformance's change, N-row).

**Q4. Uses.** Keying the rows to the op maps and driving the backing means my tests import `standards`, `conformance`, `consequences`, `filings` (their `*Ops` maps) and `escalation`'s and `consequences`' fixtures. The architecture check fails on those five imports (6 failures), because none is in my `uses`. All are layer 9, before 11, and affordances grades their acts, so the uses are real (K212's and K221's precedent). Best reading: add all five to affordances' `uses` in `modules.json` and to its Uses list. The other checks pass: format 0 failures; coverage 27 of 27; ownership 0 legacy lines added or removed.

**Tests** (with index.mjs's `ACQUIRE_GRADE_NOTE` import re-pointed to capture locally, legacy-index's N80 share; not committed): `node --test bio-plane/test/m/affordances/` → 75 tests, 72 pass, 0 fail, 3 todo (R16, R18: N176; R26 live: N231).

## J4 · COMPLETE

**Entries applied** (plan layer 11; B1–B3, K262, K264), on `job/T8/affordances` after merging `tranche/T8` @ B3:
- **N65 (3) and R26:** the action loop's vocabularies are `actions'`:
  - `PRODUCT_KINDS` as the module-level `action_kind`, plus `RISK_TIERS`, `LAW_LEVELS` (jurisdictions', which `op=actionlaws` refuses against; not legacy-checks' copy), `ACTION_BASIS_KINDS`, `CORRESPONDENCE_DIRECTIONS`, `CORRESPONDENCE_STAGES`, `CORRESPONDENCE_OUTCOMES` and `RESOLUTIONS`;
  - `SUBJECT_POSITIONS` is ratification's, `BASIS_ROLES` inquiry's, the version machine basis-versions', and `CONTENT_MINT_STATES` content's;
  - no action kind is held here, and the only vocabulary still read from legacy-checks is `SUFFICIENCY_CLAIM_STATES`, which has not moved;
  - `vocabulariesFor(kinds)` (K262 Q1) publishes the instance's kinds as `action_kind` and every other key as the same object.
  - **R26 is met at this interface.** Its live half in `op=affordances` is a `test.todo` naming N231.
- **N80:** `acquireGradeNote` and `ACQUIRE_GRADE_NOTE` are dropped (capture's). R5's test checks the fence and that no copy remains.
- **ACTIONS #1 J2.1:** the plane fixture creates a `records_request`.
- **K208 (2) rows, as K263 and K264 rule:**
  - `actionriskpropose` (actions R28) gets a `NON_ACTS` row and a stated absence, `undetermined`, on `actionlawspropose`'s ground.
  - `monitoring` gets none: it is a read with no `NEEDS` row, `driveshells`' cut.
  - Layer 9's 22 other rows are held for T9 (N216), exactly as J3 states them:
    - `NON_ACTS` for each;
    - `reasoned`: `consequencerevise`, `addressedrecord`, `escalationevaluate`, `escalationadvance`, `escalationdecline`, `escalationsuspend`;
    - `reversible`: `escalationresume`;
    - `substrate`: `counselpacketexport`;
    - `undetermined`: `standarddeclare`, `standardpropose`, `standardadopt`, `determine` (K264: `BAD_REASON` stays out of the family; N233), `comparisonpropose`, `consequencerecord`, `filingprepare`, `filingapprove`, `filingsent`, `counselpacket`, `theorypropose`, `escalationopen`, `escalationattach`, `escalationend`.
    - Their `is:` sentences and `NON_ACTS` reasons are in `bio-plane/src/affordances.mjs` at commit `92ebb0abeb` on this branch, ready to restore with N216.
  - The backing the held rungs rest on is tested now, at each module's interface (`backing.test.mjs`): each of the six `reasoned` acts is refused without its reason (`NO_REASON`) and accepted with one; `escalationresume` is taken back by a further suspension.
  - `catalogue.test.mjs` holds the held ops out of every table.

**Deferred:**
- N144 (N232, K262 Q2).
- R16 and R18 (N176, with `affordanceFacts`' extraction, T9).
- R26's live half (N231).
Each is a `test.todo` naming its cause, except N144, which R17 does not yet state.

**Other modules** (for BOB, not changed by me):
1. **legacy-index:**
   - `index.mjs` 93–94 still imports `ACQUIRE_GRADE_NOTE` from `./affordances.mjs`, so the plane fails to load until its N80 re-point merges (B2: legacy-index merges first).
   - Until its `OPS`/`NEEDS` row for `actionriskpropose` lands, `unaccounted` answers it as `stale`. Legacy `affordances.test.mjs` "NON_ACTS names only ops in NEEDS" and `rung-ladder` BACKWARD and EXACTLY are red on that one op.
2. **legacy-tests:** `affordances.test.mjs`
   - "the published action_kind vocabulary IS the array C-2.10 enforces", "neither enforcement site keeps a literal copy of the four resolutions" and "the catalogue publishes … the eight action kinds" pin legacy-checks' objects, which N65 (3) retired here. Re-anchor them on actions' (R26).
   - Its fixture's `ACTN-2026-0001-rec19` uses `cpra_request`, which is refused `ACTION_KIND_UNKNOWN` (red since layer 9).
   - `rung-ladder`'s "ROUTES to the publishing path" and "NO UNBACKED CLAIM" are red identically on `tranche/T8` without my change.
3. **conformance:** N233 (K264).
4. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` embeds `src/affordances.mjs` and is stale; yours to regenerate at the close.

**Tests and checks** (index.mjs' import re-pointed to capture locally for the runs, not committed):
- Module: `node --test bio-plane/test/m/affordances/` → tests 75, pass 72, fail 0, todo 3.
- `test/m/` whole: tests 2300, pass 2273, fail 2 (`citation/invariants`, `connections/factory`, red on the base), todo 25.
- Legacy: `rung-ladder` 45 pass, 4 fail (2 on the base, 2 the transient `actionriskpropose` row); `affordances.test.mjs` as item 2.
- `node checks/format.mjs /home/user/bio` → format: 69 modules, 64 requirements files; 0 failures
- `node checks/architecture.mjs /home/user/bio affordances` → architecture: 6 product files, 41 relative imports (0 naming no tracked file, not judged); 0 failures
- `node checks/coverage.mjs /home/user/bio affordances` → coverage: 1 modules, 27 of 27 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs /home/user/bio affordances tranche/T8` → ownership: 5 files changed by affordances between tranche/T8 and HEAD; legacy-store: 0 line(s) added, 0 removed; legacy-index: 0 line(s) added, 0 removed; 0 failures

Size (session_01GC8QNKei7sU5uBHF2DgCy8): test runs 14, module lines 2416
