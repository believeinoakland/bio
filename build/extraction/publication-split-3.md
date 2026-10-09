<!-- Extraction map for publication's third split (K617, K624, K2418; N823), written for BOB on 2026-10-09 on tranche/T41 by a worker, before L8's START (P18). Uncommitted; BOB reviews it. -->
# publication → publish-schedule — extraction map (third split, N823)

**Status** · DRAFT for BOB, 2026-10-09, on `tranche/T41`, uncommitted. **Why:** plan T41-36, T41-37 and doubt 4: `publication` measures 3,835 lines over its own paths (K1821; `worker.mjs` is `public-read`'s), and T40-13 would take it to about 3,900, so its publishing at a set time moves out (N823, K2418), no requirement changing meaning. **Read whole:** `requirements/README.md`, `requirements/publication.md`, `extraction/instance-setup-split.md` (the format model), `publication/schedule.mjs`, `publication/index.mjs`, `publication/checks.mjs`, `publication/schema.mjs` (its DDL tail, declarations and migration whole; the other tables' DDL scanned), `layers.md` "Layer 8: publication's third split", the plan's T41-36, -37, -39, -43, -49, -53, -63 and doubt 4, and rulings K31, K617, K624, K1821, K2418 (with K1811, K1816, K1826, K1832, K1833 for the moved ids). **Callers** found by grep of every moved export, method, op and the table over `bio-plane/src` and `bio-plane/test` (the bundles excluded).

## 0. The answer

**The seam is publishing at a set time.** `schedule.mjs` is the whole of it except three things that stay with publication's own writes:
- R21's waiting clause: a waiting document counts as signed in `storeCaseDocument` and `reauthorSection`;
- R70's columns: the commit's `signed_at` and `published_at`, written on the `published_cases` row;
- `hasCaseStanding`, R1's standing test, which the moved code calls.

Each of the three reads the waiting edition through **one registration** that `publish-schedule` fills at its creation (K31's pattern, as R23's review provider and R62's order source). The new module is **`publish-schedule`**, layer 8, directly after `publication` (already in `modules.json` and `layers.md`). It holds the table `scheduled_editions`, the publisher registration, the listener registration, the three ops and the C-122.5 row. It is about **520 lines**; publication falls to **about 3,450**, about 3,510 after T40-13.

**Where the plan's wording differs from the code (§8 doubts 1–3):**
- `publish-schedule` never calls R22's commit. `ratification`'s publisher commits, and the moved code only reads `case_documents` to see whether that commit happened.
- R70 is publication's own commit and reads, with only one share (the set time's signing instant) coming from the moved table.
- `queue-producers` (R37) and `actions`' test also call the moved code, and T41-53 has no N823 part.

## 1. The new module

- **Name:** `publish-schedule`.
- **Place:** layer 8, in `modules.json` directly after `publication` (line 106, present with empty `paths` and `tests`, K1043).
- **Paths:** `bio-plane/src/publish-schedule/` (`index.mjs`, `schedule.mjs`, `schema.mjs`, `checks.mjs`).
- **Tests:** `bio-plane/test/m/publish-schedule/`.
- **Factory:** `publishScheduleOf(host, deps)`, one instance per host (K61). At creation it:
  - creates `scheduled_editions` (`CREATE TABLE IF NOT EXISTS`, the same DDL, so a running store's rows are kept as they are, with no data move);
  - declares the table to `record-core` (its purge class as built);
  - registers R8's seam with `publication`.
- **Uses** (each earlier):
  - `civil-time`: `bounds`, `isCalendarDate`.
  - `jurisdictions`: `combine`.
  - `record-core`: `getSetting("jurisdiction_profiles")`, `transact`, `declareTable`.
  - `membership`: `viewerPredicate`, `isProjectOwner`, `listenerRefusal`.
  - `publication`:
    - `hasCaseStanding` (its R1);
    - its R40 read contract, on `cases.project_id` and `case_documents` (`case_id`, `edition`, `doc_sha`, `text`, `sig_armored`, `ratified_at`);
    - the new seam registration (§4).
  - `record-grammar` is in the `uses` already written, but the moved code imports nothing from it (doubt 6).
- **Who creates it:**
  - `ratification`'s factory, which registers its publisher with it (its R43 re-pointed, T41-39);
  - `case-authoring` and `scheduler` reach it through `publishScheduleOf(ctx)`;
  - the plane builds and migrates it in the modules' order, directly after `publication` (T41-63).
- **Why not created by publication's factory** (as `case-tensions` and `case-carriage` are): those come before publication in the order, and this one comes after it (P4).

## 2. What moves (by copy, K624)

| moved | file and lines today | to (publish-schedule) | id |
|---|---|---|---|
| The whole file: header (1–14), imports of `civil-time`, `jurisdictions`, `membership.viewerPredicate`, `checks.rowOf` (16–19) | `publication/schedule.mjs` 1–312 | `schedule.mjs` | — |
| `SCHEDULED_EDITIONS_MAX`, `SCHEDULE_STATES`, `SCHEDULED_CHECK_UNAVAILABLE` (exported) | `schedule.mjs` 21–27 | `schedule.mjs`, re-exported by `index.mjs` | R2, R4, R9 |
| helpers `HHMM`, `str`, `safeJson`, `rows`, `one`, `ms`, `clock` | `schedule.mjs` 29–35 | `schedule.mjs` | — |
| `groupZone` (exported) | `schedule.mjs` 37–46 | `schedule.mjs` | R1 |
| `resolveAt` | `schedule.mjs` 48–67 | `schedule.mjs` | R1, R3 |
| `entryOf`, `projectOf` | `schedule.mjs` 69–86 | `schedule.mjs` | R4 |
| `waitingRow`, `isWaiting` (exported) | `schedule.mjs` 88–94 | `schedule.mjs`, answered through the seam (§4) | R8 |
| `waitingEditionOf` | `schedule.mjs` 96–108 | `schedule.mjs` | R7 |
| `scheduleEdition` | `schedule.mjs` 110–144 | `schedule.mjs` | R1 |
| `publishWake`, `TAKING`, `publishDue`, `takeOne` | `schedule.mjs` 146–199 | `schedule.mjs` | R2 |
| `unchecked` (DEC-49 region `is-scheduled-check-available`) | `schedule.mjs` 201–206 | `schedule.mjs` | R2, R9 |
| `ownersRow`, `publishAtMove`, `publishAtCancel` | `schedule.mjs` 208–262 | `schedule.mjs` | R3 |
| `scheduledEditions` | `schedule.mjs` 264–298 | `schedule.mjs` | R4 |
| `signedAtFor` (exported) | `schedule.mjs` 300–306 | `schedule.mjs`, answered through the seam (§4) | R5, R8 |
| `tell` | `schedule.mjs` 308–312 | `schedule.mjs` | R6 |
| `import * as schedule` and the re-export of the three constants | `publication/index.mjs` 110, 133 | `index.mjs` | — |
| the fields `#publisher`, `#publishListeners` | `index.mjs` 203–204 | the class in `index.mjs` | R2, R6 |
| `registerScheduledPublisher`, `scheduledPublisher`, `onPublishScheduled` (and the `listenerRefusal` import, 93, used only here), `publishListeners`, and the delegates `scheduleEdition`, `publishWake`, `publishDue`, `publishAtMove`, `publishAtCancel`, `scheduledEditions`, `groupZone`, `waitingEditionOf` | `index.mjs` 320–362 | the class in `index.mjs` | R1–R4, R6, R7 |
| the ops `publishatmove`, `publishatcancel`, `publishschedule` | `index.mjs` 2605–2610 (in `publicationOps`) | `publishScheduleOps(ps, url, body)` | R3, R4 |
| header paragraphs naming R66–R71, R74, C-122.5 | `index.mjs` 31–35, 40–41 (parts) | the new header | — |
| the table `scheduled_editions` with its comment and two indexes | `publication/schema.mjs` 488–519 | `schema.mjs` | R1, R10 |
| its purge entry `{name: "scheduled_editions", keys: [], whole: "state <> 'published'"}` | `schema.mjs` 529–530 | `schema.mjs`, declared by this module | R10 |
| the header sentence on `scheduled_editions` | `schema.mjs` 11–13 (part) | the new header | — |
| row C-122.5 `SCHEDULED_CHECK_UNAVAILABLE` (code, number and translation unchanged; `where` re-pointed to `src/publish-schedule/schedule.mjs unchecked > is-scheduled-check-available`) and its own `rowOf` | `publication/checks.mjs` 58–66 (and header 5) | `checks.mjs` | R9 |

**In the copy:** each `p.<x>` in `schedule.mjs` becomes the new instance's own member, except two:
- `p.hasCaseStanding(doc, viewer)` becomes `publication.hasCaseStanding`.
- `p.record`, `p.sql`, `p.membership` and `p.now` are this module's own deps, on the same storage and clock.

The SQL is unchanged.

## 3. What stays in publication

Everything else stays: every case-document and published table, R21, R22 and R35 (the commits), R70's two columns and the reads that answer them, R33's other rows, and `hasCaseStanding`. Three sites now read the seam in place of `./schedule.mjs`:

| site | today | after |
|---|---|---|
| `storeCaseDocument` (R21) | `index.mjs` 399–400: the upsert's `WHERE … AND NOT EXISTS (SELECT 1 FROM scheduled_editions …)`; 405: `stored` asks `schedule.isWaiting` | Asks the seam's `isWaiting(case, edition)` first, in the same transaction, and skips the upsert when it answers true. The exclusions are still re-projected (402), as today. `stored` reads the same answer. Publication's SQL no longer names `scheduled_editions`. |
| `reauthorSection` (R21) | `index.mjs` 427–429: `schedule.isWaiting` | The seam's `isWaiting`, with the same answer and words. |
| `commitCaseEdition` (R22, R70) | `index.mjs` 1030–1032: `schedule.signedAtFor(this, id, ed, when)` | The seam's `signedAtOf(case, edition)`, or the commit's instant when it answers null. |

Removed with the copy:
- `index.mjs` 93's `listenerRefusal` import;
- `index.mjs` 110 and 133;
- `index.mjs` 203–204 and 320–362;
- `index.mjs` 2605–2610;
- `schema.mjs` 488–519 and 529–530;
- `checks.mjs` 58–66.

`modules.json`: publication's `uses` drops `civil-time` and `jurisdictions` (K1821 (1) added them for R66 alone; nothing else in its paths imports them).

## 4. The seam (K31's pattern)

`publication` gains one registration, filled once at start by `publish-schedule` (the plan's "registration T41-37 fills"; the name is this map's proposal):

`registerWaitingEditions(moduleOrSource, maybeSource)` takes `{isWaiting(caseId, edition), signedAtOf(caseId, edition)}`:
- `isWaiting` answers whether that case edition's document waits (R1 here, publication R21's waiting clause).
- `signedAtOf` answers the instant the waiting edition was signed (R5 here), or null when it does not wait.
- A second registration is refused `PROVIDER_DECLARED`, one missing a door `PROVIDER_MALFORMED`, as R23 and R62 refuse.
- With none registered, `isWaiting` answers false and `signedAtOf` null, so a commit's `signed_at` is its own instant. This is exactly today's answer for a store holding no waiting edition.

Both doors are synchronous and read only `scheduled_editions`, inside publication's caller's transaction (same storage). The answers are those of `schedule.mjs`' `isWaiting` and `signedAtFor` today, which move unchanged.

**Publication requirement text (BOB's, at T41-36):**
- R21 keeps its waiting clause, naming `publish-schedule` R1 and R3 for the waiting edition and R8 for the seam.
- R70 keeps the columns and both answers, its set-time signing read through the seam (doubt 2).
- A new publication id states the registration, as R61 was new at the fourth split.

## 5. Requirement ids

| publication | publish-schedule | what |
|---|---|---|
| R66 | **R1** | `scheduleEdition`: refusals of `at`, the waiting edition, the signature held beside the document |
| R67 | **R2** | `publishWake`, `publishDue`, `registerScheduledPublisher`; the stop C-122.5 |
| R68 | **R3** | `publishAtMove`, `publishAtCancel` (`op=publishatmove`, `op=publishatcancel`) |
| R69 | **R4** | `scheduledEditions` (`op=publishschedule`) |
| R70 (its set-time share) | **R5** | a waiting edition's signing instant, answered to publication's commit; the rest of R70 stays (doubt 2) |
| R71 | **R6** | `onPublishScheduled` |
| R74 | **R7** | `waitingEditionOf` |
| new (the seam; R21's waiting clause and R70's share as built) | **R8** | registers `{isWaiting, signedAtOf}` with publication at creation |
| R33's C-122.5 share | **R9** | the row C-122.5, moved with its raiser (K93 (3); the C-92 precedent, case-tensions R9) |
| R31's share (the table as built in T34-79) | **R10** | `scheduled_editions` declared to purge |
| R34 (copy) | **R11** | no place named |

**Retired in publication as "moved to publish-schedule R<n>":** R66 → R1, R67 → R2, R68 → R3, R69 → R4, R71 → R6, R74 → R7. Also R70 → R5 if BOB keeps the plan's reading; this map recommends R70 stays, re-worded (doubt 2). BOB does the retirement.

**Re-worded in publication** (wording only, BOB's at T41-36):
- R21 (its waiting clause, through R8);
- R33 (C-122.5 leaves its table for `publish-schedule` R9, number and translation unchanged);
- R40's readers (gain `publish-schedule`, for R1–R4's reads of `cases` and `case_documents`);
- Purpose and Status (the third split, in K1505 (1)'s form, with the old → new table);
- Uses (`civil-time` and `jurisdictions` go; `ratification` registers R67's publisher with `publish-schedule`);
- Satisfies (DEC-147's line names `publish-schedule` R1–R5);
- the Suggestions line T34-79.

## 6. Callers in other modules (grep of `bio-plane/src` for every moved export, method, op and the table)

| module (file:line) | what it calls | requirement text | re-pointed by |
|---|---|---|---|
| `ratification` (`index.mjs` 1455–1457) | `pub.registerScheduledPublisher({publishScheduled})` in its factory | R43 | **T41-39** |
| `ratification` (`index.mjs` 737–746, `#waitingEntry`; used by R3's `#waitingRefusal` 749–757 and R40's `publishAt` 789) | `publication.scheduledEditions({case, state: "waiting", after, limit})` | R3's waiting arm, R40 | **T41-39** |
| `ratification` (`index.mjs` 789, 799) | `publication.scheduleEdition({...})` | R40 (`op=publishat`) | **T41-39** |
| `ratification` (`index.mjs` 649–660, R44) | Reads the zone itself through `jurisdictions.combine`, never `publication.groupZone`. | R44 says "as `publication` R66 reads it", which becomes `publish-schedule` R1. | T41-39 (wording only) |
| `ratification` (R41, R42, R48 text) | Names `publication` R66/R67 as the waiting edition and its publisher; the code stays. | wording | T41-39 |
| `case-authoring` (`index.mjs` 730, R58; 1679, R59's `#waits`) | `publication.waitingEditionOf(caseId)` | R58, R59 | **T41-43** (the plan names R58; R59's `#waits` is the same read and must move with it) |
| `scheduler` (`index.mjs` 361–375, consumer `scheduled-publish`) | `o("publication").publishWake()`, `.publishDue(now)` | R22 | **T41-49** |
| `scheduler` (`index.mjs` 684–687) | `publication.onPublishScheduled("scheduler", …)`; its owner map (726, 735) gains `publishSchedule` | R22 | **T41-49** |
| `queue-producers` (`index.mjs` 3064–3066, `#scheduledEditionItems`) | `this.#publication.scheduledEditions({after})`, guarded by `typeof … !== "function"`, so after T41-36 it answers no item, silently | R37 | **none planned**: T41-53 has no N823 part (doubt 3) |
| `plane` (`store.mjs` 564) | spreads `publicationOps`, which today carries the three ops; must also spread `publishScheduleOps(publishScheduleOf(ctx), url, body)` and build and migrate the module after `publication` (the docket line, 447, is the model) | R2, R30's composition | **T41-63** |
| `op-declarations` (377, 3226, 3265), `op-grades` (307, 581, 1465–1467), `wizard-scripts` (`writing-help.mjs` 13), `affordances` (act help) | The op names only (`publishatmove`, `publishatcancel`, `publishschedule`), which are unchanged. | op-grades' comment "publication R68" may be re-worded | none needed |
| `promotion` (`gate.mjs` 760, the 1.63.0 history) | names "publication C-122.5" | the census | promotion's stamp at T41's close: one CHANGED row (`where` re-pointed, words unchanged), as C-92 was |

**Tests in other modules that call the moved code** (each that module's job updates its stand-ins; none imports `schedule.mjs`):

| test | calls | re-pointed by |
|---|---|---|
| `ratification/schedule.test.mjs` | `scheduleEdition`, `scheduledEditions`, `registerScheduledPublisher` | T41-39 |
| `ratification/scheduled-commit.test.mjs` (9 sites) | `scheduleEdition`, `scheduledEditions`, `registerScheduledPublisher` | T41-39 |
| `case-authoring/waiting.test.mjs` (5) | `waitingEditionOf`, `scheduleEdition` | T41-43 |
| `scheduler/fixture.mjs` 119–123, `scheduler/t34.test.mjs` (18) | the stand-in `publication.publishWake` / `publishDue` / `onPublishScheduled` | T41-49 |
| `queue-producers/world.mjs` 134, `feeditems.test.mjs` 98, `scheduled.test.mjs` | the fake `publication.scheduledEditions` | none planned (doubt 3) |
| `actions/t34.test.mjs` 204 | `w.publication.scheduleEdition = …` (a stand-in under ratification's `publishat`) | none planned (doubt 3) |

## 7. publication's tests

**Move to `test/m/publish-schedule/`** (re-labelled with the new ids; they may import publication's fixture, publication being earlier):
- `t34.test.mjs`:
  - the `sched` and `publisher` helpers (31–46);
  - R66 (109–166);
  - R67 (187–286);
  - R68 (287–343);
  - R69 (344–383);
  - R71 (423–468);
  - R31/R66's purge (469–481);
- `t35.test.mjs`: the `waiting` helper (171–185), R74 (186–219) and R33/R67's C-122.5 (220–239);
- `t39.test.mjs` R67's kept stop entries (130–168), over publication's real commit.

**Stay in publication:**
- `t34` R21 (167–186) and R70 (384–422) are publication's. Each needs a waiting edition, so it registers a stand-in for R8's seam (a test cannot import `publish-schedule`, the later module: checks 1 and 2).
- `invariants.test.mjs` 141 (R33) becomes "C-122.1–.4, .6, .7"; C-122.5's arm moves with R9.

## 8. Doubts for BOB (best readings)

1. **"It calls publication R22's commit."** The moved code never calls `commitCaseEdition`. The registered publisher (`ratification` R42) commits, and `takeOne` (`schedule.mjs` 184–186) reads `case_documents` (R40) to see whether the commit landed. *Reading:* the `uses` edge to `publication` stands, for R1's standing, R40 and the seam. The plan's and `layers.md`'s "commits through R22" should read "is published by ratification's commit (publication R22)".
2. **R70 is publication's, but for one share.** R70's subject is publication's commit and reads: the two columns of `published_cases`, R53's `document`, and `public-read`'s answers. Only "a set time's signing instant" comes from `scheduled_editions` (`signedAtFor`). Moving R70 whole would leave publication's commit and reads with no requirement, and `publish-schedule` with one it cannot test at its interface (P7). *Reading:*
   - R70 stays in publication, re-worded to read the signing instant through the seam;
   - `publish-schedule` R5 states the share;
   - the retired set is R66–R69, R71 and R74.

   If BOB keeps the plan's "R66–R71", R70 retires as "moved to publish-schedule R5", and publication's commit is then covered only by R22 and R40's column names.
3. **Callers no entry re-points.**
   - `queue-producers` R37 calls `scheduledEditions`. The call is guarded, so after T41-36 the queue silently loses its three scheduled items.
   - `actions/t34.test.mjs` stubs `publication.scheduleEdition`.

   *Reading:* T41-53 gains "(N823) R37 re-pointed to `publish-schedule` R4 (`modules.json` edge)". Actions' test stand-in follows ratification's re-point in actions' own job, or BOB names the window as accepted red.
4. **The window between merges (K624: copy then delete within T41).** From T41-36's merge until each re-pointing job merges, these are red or absent:
   - `op=publishat` (`ratification` still calls `publication.scheduleEdition`);
   - `case-authoring` R58/R59;
   - scheduler's `scheduled-publish`;
   - the three ops (absent from the op map until T41-63);
   - the queue items.

   *Reading:* accept them as named reds closed by T41-39, -43, -49, -53 and -63 inside T41 (the tranche never ships between). The alternative is keeping publication delegates through the seam until T41-63 (N597's precedent across T34/T35). It widens the seam and holds code twice, and is not recommended.
5. **The table declared twice in the window.** While publication still declares `scheduled_editions` (before T41-36), `publish-schedule`'s declaration is refused `TABLE_DECLARED` by `record-core.declareTable` (nothing declared; the answer is kept, as publication keeps `purgeDeclaration`). Both create the table with the same DDL, harmlessly. *Reading:* `publish-schedule` R10's owner arm is an accepted red until T41-36. Its purge-class arm passes throughout, since the classes are identical.
6. **`record-grammar` in `uses`.** The moved code imports nothing from it. *Reading:* keep it only if the job's code uses it (for instance `canonicalJson` for `checked`, which today is stored as handed); otherwise the job's COMPLETE drops the edge.
7. **`groupZone()` has no caller.** Its comment says "for ratification R44's offer", but ratification reads the zone itself (`index.mjs` 649–660). *Reading:* it moves as R1's read, unchanged. Re-pointing R44 to it is not this split's.
8. **The plane "registers its publisher" (T41-63).** The publisher is registered by `ratification`'s factory (its R43), not by the plane. *Reading:* T41-63's N823 part is to build and migrate `publish-schedule` after publication, spread `publishScheduleOps`, and add the `uses` edge. Ratification's T41-39 moves R43's registration.
9. **Size.** The plan says ~500; this map counts about 520 (below). Publication: 3,835 − about 408 moved + about 30 for the seam ≈ **3,455**; with T40-13's ~60 ≈ **3,515**. Both stay clear of ~4,000 (P6).

## 9. Line counts

| | lines |
|---|---|
| moved from publication | `schedule.mjs` 312; `index.mjs` about 53 (110, 133, 203–204, 320–362, 2605–2610); `schema.mjs` 34 (488–519, 529–530); `checks.mjs` 9 (58–66): **about 408** |
| `publish-schedule` after T41-37 | `schedule.mjs` ~312, `index.mjs` ~140 (header, class with the two registrations and the seam, factory, ops), `schema.mjs` ~45, `checks.mjs` ~25: **~520** |
| `publication` after T41-36 | 3,835 − ~408 + ~30 (the registration, two doors' calls, R21's re-written guard) ≈ **3,455**; ≈ 3,515 with T40-13 |
