# monitoring (T24)

**Status** · session_01LubdwpQSMaaKPPQPfezUV3 · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Two readings I am building on; I carry on with the job on them, and none of them decides what I build next.

(1) C-18.16 `SWEEP_TERM_REFUSED` stays in monitoring's table, as `SWEEP_TERM_CHECKS` (renamed from `SWEEP_CHECKS`), its row unchanged (`where` stays `src/monitoring/index.mjs gatheringCheck > is-sweep-term`): R66 keeps that refusal minted in monitoring's `gatheringCheck` (one refusal, `SWEEP_TERM_REFUSED` before `GATHERING_REFUSED`), and a row lives with the site that mints its code (DEC-49). A registered grammar marks a refused term by a finding carrying `code: "SWEEP_TERM_REFUSED"`. C-18.17 and C-18.18 leave with the fence (`sweepFence` moves to link-sweep), so their `where`s change in link-sweep's job. Consequence: from my merge until link-sweep's, the row census (`row-census.test.mjs`) reads two rows fewer (1071, not 1073); I ask that this be accepted with red 7 (the sweep's composition), or name it red 10. Link-sweep's requirements' Suggestion that its table holds all three codes binds nothing; if you rule C-18.16 moves too, I move it (the refusal's row then has to reach monitoring through the registration, which R66's signature does not carry).

(2) R66 "With nothing registered, C-18.5 reads no sweep arm (a `sweeps[]` entry draws no finding of R27's)": I read it whole, so with nothing registered no `sweeps[]` entry draws any finding, not even "is not an object"; with a share registered, a non-object entry is monitoring's finding and an object entry is the grammar's.

Also, for your planning: `sweep_runs` and `sweep_filed` leave my schema and purge declaration (link-sweep's, per its Size and Suggestions); `queue-producers` calls `monitoring.sweepConditions` (its index.mjs:2911), which leaves with N506, so its R26 sweep items go dark from my merge until its L11 re-point. I report every red my merge makes in `bio-plane/test/m`, by file and line, in COMPLETE.

## Completion

Entries applied, signatures, reds and reports: as in J2 below. Deferred: none.

Tests and checks run, with summary lines:
- `node --test bio-plane/test/m/monitoring/` → tests 99, pass 99, fail 0.
- `node --test bio-plane/test/m/` → tests 5246, pass 5222, fail 13 (each named in J2; baseline before my change: fail 4).
- `node --test bio-plane/test/system/fleetbundles.test.mjs` → the plane bundle STALE (reported, not regenerated).
- `node --test bio-plane/test/system/row-census.test.mjs` → census 1070 rows against the pin's 1073 (red 7, K1206).
- `checks/format.mjs` → 2 failures (red 4). `checks/architecture.mjs monitoring` → 0 failures. `checks/coverage.mjs monitoring` → 57 of 65, 1 failure (the requirements file's retirement wording, J2). `checks/ownership.mjs monitoring tranche/T24` → 15 files, 0 failures.

Size (session_01LubdwpQSMaaKPPQPfezUV3): test runs 30, module lines 3208

## J2 · COMPLETE

monitoring T24 L10 done on `job/T24/monitoring` (merged `tranche/T24` @ 20fe9ea18a; K1206 and B3 applied). Ready to merge first in L10.

**Entries applied.**
(1) N506's removal side: `src/monitoring/sweep.mjs`, `sweep-match.mjs` and `test/m/monitoring/sweep-{grammar,reads,run}.test.mjs` deleted; `new Sweeps(...)`, `this.sweep`, `sweepDue/Wake/Tick`, `sweeps`, `sweepConditions`, `registerSweepScope`, the `sweeps` route, every import and re-export of the moved files, the `sweep_runs`/`sweep_filed` tables and their purge declarations, the sweep half of `checks.mjs` (`sweepErrors`, `SWEEP_FIELDS`, `SWEEP_ID_RE`, `SWEEP_CADENCES`, `SWEEP_BOUNDS`) and all of `SWEEP_CHECKS` (C-18.16–.18, K1206). **Edges I no longer import: `project-stage`, `capture-requests`** (also `format-registry.listFormats`; `detectFormat` stays, so the `format-registry` edge stays).
(2) R65 and R66 built (signatures below); R42's and R30's arms are the registered ones; C-18.5 stays one refusal; a throwing or malformed grammar or fence fails closed; nothing registered reads no `sweeps[]` entry at all, fences nothing, lists no sweep. R53–R64 named by no test of mine.
(3) N506's tail: `fixture.mjs` creates, as `PLANE_TABLES`, the plane's `refs` and `inquiry_bundle_facts` **and four more a post-wake promotion reads in this world** (`inquiry_basis`, `inquiry_exclusions`, `inquiry_contradiction_links`, `content`), statements copied; `seam.test.mjs` proves a promotion after the wakes lands, and fails without them (negative control). `sweepDef` kept in the fixture only because scheduler's `consumers.test.mjs` imports it.
(4) N502: `checks.mjs` :13, :14, :84 re-worded to 1.49.0 / 1.53.0; S1's :119 left with the rows (C-18.16–.18 gone). Re-scan: no other N502/N508 kind in my module.

**R65, R66 as built (for link-sweep):**
- `sweepHost()` → the same frozen object every call: `paused()`; `openEpoch(consumer, now, staleAfterMs)`; `claim(consumer, subject, epoch)` → boolean; `closeEpoch(consumer, epoch)` → undefined; `running` (a `Set`); `ranked(list, item, rank, now)`; `land(request, filed, at, say?)` with `request` `{id, bundle, locators, target}`, `filed` `{locator, doc}` (capture's `document`), `say` `{title, summary, notes, trigger}` → `{ok: true, bundle_id, state: "collected"}` | `{ok: false, reason, detail}`; `gate(viewer)` → `{sql, args}`; `recheckMs()`.
- `registerSweep(module, {grammar, fence, dueForSlate})` → `{ok: true, module}` | `{ok: false, reason}` (words). Methods are bound to the object passed, so `this` works.
  - `grammar(entry, ids)` → `[{check: "C-18.5", severity, field, message}]`, message beginning with its field (`field` null for none); monitoring prefixes `gathering.json sweeps[i]` + (`field` ? "." : " ") + message. A refused term's finding also carries `code: "SWEEP_TERM_REFUSED"` and `refusal: {code, check, translation}`; R27 answers `{ok: false, reason, code, check, translation, detail, findings}` from it. A term finding whose `refusal` is not whole falls to `GATHERING_REFUSED`. No `severity` reads as `error`.
  - `fence(c, nextText)` → null/undefined admits; `{ok: false, …}` is returned as the promotion's answer; anything else, or a throw, is `GATHERING_REFUSED` with one C-18.5 finding.
  - `dueForSlate(now, sees)` → `[{kind: "ratified-sweep", bundle, id, definition}]`; a throw or non-list lists none and the slate carries `sweeps_unread`.

**Reds my merge makes in `bio-plane/test/m`** (baseline reds 6, 8, 9 unchanged: `affordances/catalogue.test.mjs`:524, `scheduler/consumers.test.mjs`:161, `plane/notices.test.mjs`:33), all red 7, the sweep's composition:
- `scheduler/consumers.test.mjs`:226, :250, :260; `scheduler/plane.test.mjs`:206 (gathering-sweep through monitoring)
- `plane/notices.test.mjs`:140 (monitoring R64's scope registration, now link-sweep R12)
- `control-plane/r45-routes.test.mjs`:68 and `affordances/catalogue.test.mjs`:903 (`sweeps` in monitoring's op map)
- `plane/compose.test.mjs`:101 and `plane/door.test.mjs`:183: **op=queue through the plane throws** (`this[#monitoring].sweepConditions is not a function`, queue-producers `index.mjs`:2911) until queue-producers' L11 re-point.
Outside `test/m`: `test/system/row-census.test.mjs` 1070 rows against the 1073 pin (K1206: red 7).
Intermittent, not mine: `review/doors.test.mjs`:51 failed once in the full run, passed 3/3 alone.

**For BOB:**
- **Coverage fails on your requirements file, not my tests:** `build/requirements/monitoring.md`:69–80 marks R53–R64 `**retired**`, but the checks' parser (`checks/lib.mjs` `requirementIds`) only reads `*(retired …)*`, so they count as live (R55–R60, R62, R63 unnamed; R53, R54, R61, R64 only pass by chance, matching other modules' ids in comments). Re-wording those 12 lines `*(retired: moved to link-sweep R1, N506, T24)*` clears it.
- **Stale artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (inputs `src/monitoring/{checks,index,schema}.mjs` changed, `sweep.mjs` and `sweep-match.mjs` gone); I regenerated nothing.
- Rows: none added or changed; three removed (C-18.16–.18), none `awaiting stamp`.

**Checks:** format 2 failures (red 4, link-sweep's directories); architecture 0 failures (15 files, 71 imports); coverage 57/65 (the retirement wording above); ownership 0 failures (15 files). Monitoring tests 99/99.
