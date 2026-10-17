# T14 wordings (2): N342, N343, N347, N348, N349 (a worker for BOB #66, 2026-09-29; P18)

**Reviewed** · by BOB #66, 2026-09-29 (K445): corrections rechecked; every MEANING? point ruled as drafted, N349 widened.

Read on `tranche/T13` @ 1557c10385 (T13's layer 11 closed, K443; legacy-tests is the only job still running, and it reads none of these requirement files). Not folded. Each id below is the next free one in its file, counted after `draft-T14-wordings.md` folds (it takes queue R41, bias R44, capture R64, instance-setup R43). None of these files marks a retired id.

| file | next free id | used by |
|---|---|---|
| record-core | R63 | N342 R63 |
| queue | R42 | N342 R42 |
| bias | R45 | N343 R45 |
| capture | R65 | not needed (R21, R32, R63 amended) |
| extraction | R64 | not needed (R31 amended); R64 only if BOB takes N349's widening |
| control-plane | R35 | N348 R35 (R22 amended for N347) |
| instance-setup | R44 | not needed |
| host-governor | R27 | only if BOB takes N349's widening |

Codes, row numbers, helpers, bounds, key order and the sequencing of a removal are wording under meaning Bob already holds (K238, K275, K338, K391). Places where meaning might move are marked **MEANING?**. Each one says whether it goes to Bob or stays with BOB.

**Folding.** At T14's opening (P10). No T13 job reads these files now.

---

## 1. N342: record-core's counts registration; queue's counts and TASK seed

**Correction to the entry.** `#counts` reads four of queue's tables by name, not only `tasks`:
- `tasks: n("tasks", "refers_to")` (`store.mjs`:2150);
- `findingDispositions: n("finding_dispositions", "project_id")` (:2194);
- `queueState: n("queue_state", "case_id")` (:2205);
- `queueItemMutes: n("queue_item_mutes")` (:2207).

All four are queue's (queue R36; `queue/schema.mjs`:21, 78, 99, 137). Purge's `removed` names two of them, `tasks` and `queueState` (:2436, :2462). The TASK row of `#MINT_LEDGER_LIVE` is at :2018–2025 and is seeded at every boot (:800). So queue registers all four figures, not `{tasks}` alone.

**Decision.** As K435 chose (option (a)): record-core provides a counts registration beside `declarePurge`. It follows `registerAuditCheck`'s shape (R59), with the keys named up front, as `declarePurge` names tables, so two modules can never report one key. Queue registers its four figures and seeds its own TASK ledger row, in review's `seedLedger` shape (`review/index.mjs`:257–268). legacy-store spreads the registered figures.

**record-core.md, new after R62:**

> **registerCounts(module, keys, counts); counts(hid) → figures** (N342, K435; the R59 pattern, for `op=stats` and purge's proof)
> - **R63** A module that owns tables registers once, at start, the names of the figures it reports (`keys`, a non-empty list of names) and `counts(hid)`, a synchronous function answering them. `hid` is the caller's `{sql, args}` naming the bundles the caller may not see, or null; this module passes it on and never reads it. `counts(hid)` answers every registered key, in registration order, each the number its module's function gave, or null when that function threw or gave no finite number for it: a figure that could not be read is never zero. A key another registration already holds is refused `COUNTS_DECLARED`, naming the holder, and so is a second registration by the same module; a registration without a module name, a key list or a function is refused `COUNTS_MALFORMED`. A refused registration registers nothing. Each refusal carries its `check` and `translation`: C-102.13 and C-102.14, this module's rows. It writes nothing, and `counts` never throws. *(not yet met: N342)*

**record-core.md, Suggestions.** Add: "`counts`' reader is `legacy-store`'s `#counts` (`op=stats`, purge's proof), which spreads it until `op=stats` moves to `control-plane` (N342)."

**queue.md, new after R41 (under a new heading):**

> **Its share of the store's counts and the id ledger** (N342, K435; `record-core` R63, R40)
> - **R42** At start this module registers with `record-core` (its R63) the figures of its four tables: `tasks` (a task naming a bundle in `hid` is left out, by `refers_to`), `findingDispositions` (by `project_id`), `queueState` (by `case_id`) and `queueItemMutes` (not keyed to a bundle). These are the keys and the subtraction `op=stats` and purge's proof answer today. It seeds `record-core`'s id ledger (its R40) with `["TASK", "tasks", "id"]` at start and again before its first mint; on a store whose ledger table is not yet created it learns nothing and never throws. *(not yet met: N342)*

**queue.md, Uses.**
- `record-core` line: append "`registerCounts` (its R63) and `seedMintLedger` (its R40) (R42; N342)".
- The `tasks` line becomes: "`tasks` is this module's own table (R36): read and written only here, through no provider's service. `op=stats` and purge's proof read this module's four figures through `record-core`'s `counts` (its R63), which this module registers (R42; N342)."

**`build/modules.json`.** No edge. Queue already uses record-core; legacy-store uses `*earlier`.

**Rows.**
- New C-102.13 `COUNTS_DECLARED` and C-102.14 `COUNTS_MALFORMED`, in record-core's own `RECORD_CORE_CHECKS` (K174). They are the next two numbers of C-102 after N128's C-102.11 and C-102.12. This is the C-96.13 pattern (a module's row in a catalogue family, K343).
- Each `where` is `src/record-core/index.mjs registerCounts > is-counts-registration` (one region, as C-102.1/.2 share one).
- Translations, in C-102.1/.2's words:
  - C-102.13: "A part of this instance tried to report a figure another part already reports, or to register its figures twice, so the second registration was refused and the first still stands. This is a fault in how the instance was built, not in the record, and nothing in the record changed."
  - C-102.14: "A part of this instance tried to register its figures without naming itself, the figures or a function to count them, so nothing was registered. This is a fault in how the instance was built, not in the record, and nothing in the record changed."
- Promotion stamps them in T14's layer 2 (K425). `ROW_CENSUS` (R50) moves; the d470 census does not (these rows are not in the catalogue file).

**Sequencing.** legacy-store (layer 10) runs before queue (11).
- In T14, legacy-store adds the spread `...recordOf(this.ctx).counts(hid)` after its own literal keys. It keeps its four reads and its TASK row for one tranche. A spread key replaces a literal of the same name and keeps its position, so `op=stats` answers the same keys, in the same order, with the same figures, before and after queue registers. A second TASK seed is harmless (`INSERT OR IGNORE`).
- In T15, legacy-store drops its four reads and the TASK row (K408 (4)'s pattern). queue's four keys then answer at the spread's place in `op=stats`.

**Interface tests:**
- record-core: two registrations answer their keys in registration order; `hid` reaches the function unchanged; a throwing function answers null for each of its keys, never 0; a key already held is `COUNTS_DECLARED` naming its holder; a second registration by one module is `COUNTS_DECLARED`; a malformed one is `COUNTS_MALFORMED`; `extra` fields never replace `check`.
- queue: the four figures equal the direct `count(*)`, whole and under a `hid`; a task on a hidden bundle is not counted; a first boot seeds nothing and throws nothing; the drain's first mint seeds first; a TASK id live in `tasks` before the ledger existed is never drawn again.
- legacy-store (by its suites): `op=stats` and purge's `removed` are unchanged in keys, order and figures.

**Jobs:** record-core (2); promotion's stamp (2); legacy-store (10, the spread); queue (11); legacy-store in T15 (the drop). legacy-tests: `mint-ledger.test.mjs` S8 reads the TASK seed beside the store's `#MINT_LEDGER_LIVE` (its lines 75–78, 388), re-anchored in T15 when the store's row goes; `test/m/queue/inbox.test.mjs`:195 is unchanged.

**MEANING?** (all BOB's):
- (a) Rows for C-102.13/.14. `TABLE_DECLARED`, the `declarePurge` precedent, has no row; `AUDIT_CHECK_DECLARED`, the R59 precedent, has one. The draft follows R59 (DEC-49: a code has its row).
- (b) A count that cannot be read answers null. Today a failed `count(*)` throws, and `op=stats` fails whole. Null is the store saying it does not know (REC-52), which is wording under meaning already held.
- (c) The one-tranche overlap. The alternative is legacy-store dropping its reads in T14 and the figures going missing on the tranche branch between layers 10 and 11.

**T13.** No T13 job left reads these files.

Evidence: `bio-plane/src/store.mjs`:599 (`queueOf` at construction), 800 (the seed), 2018–2025 (`#MINT_LEDGER_LIVE`), 2072–2111 (`#counts`, `nx`), 2150, 2194, 2205, 2207, 2318 (bias's spread, N328), 2424–2462 (purge's `removed`); `src/record-core/index.mjs`:767–774 (R59), 853–870 (`declarePurge`), 376–388 (`seedMintLedger`); `src/queue/index.mjs`:3769 (the TASK mint), 4108–4131 (`queueOf`); `src/review/index.mjs`:257–268, 740–741; `src/bias/index.mjs`:909–920 (R42, the shape); `build/jobs/T13/legacy-store.md`:36–42.

---

## 2. N343: bias adds its own column

**Correction to the entry.** bias does not yet create its tables either. Its schema text (`bias/schema.mjs`) is spliced into legacy-store's schema pass (`schema.mjs`:5, 65), and bias has no `migrate()`. The column is already in the `CREATE` (`bias/schema.mjs`:104), so only an older store needs the `ALTER`, which legacy-store's `ADDITIVE_COLUMNS` does (`store.mjs`:733). So bias gains a `migrate()`, as membership, provenance, entities and intent have, and legacy-store calls it.

**bias.md, new after R44 (the heading gains `migrate`):**

> **migrate()** (N343; this module's tables, as `membership`'s R57–R59)
> - **R45** `migrate()` creates this module's tables and indexes where they are absent (R30's five, from its own schema text), and adds the column `settled_kind` (TEXT, nullable) to a `bias_debts` that lacks it. It never fills that column for a debt already held: such a debt reads its kind as undetermined (R36). It is idempotent and runs at every boot, inside the host's boot, after the schema pass. No other module adds or alters a column of these tables. *(not yet met: N343)*

**bias.md, Suggestions, "Factory".** Add: "The host calls `migrate()` (R45) in its boot. `legacy-store`'s schema pass still splices `BIAS_SCHEMA` until it drops the splice; both use `IF NOT EXISTS`, so the two agree."

**legacy-store's share (code only).** Call `biasOf(this.ctx).migrate()` beside the other modules' `migrate()` calls (`store.mjs`:746–762), and drop the `["bias_debts", "settled_kind", "TEXT"]` line and its comment (:726–733).

**Uses, edges, rows.** None change.

**Interface tests (bias):**
- A `bias_debts` built without `settled_kind` and holding a settled debt gains the column; the debt keeps its row, and `biasDebt` answers `kind_state: undetermined`.
- A second `migrate()` changes nothing.
- A fresh store has all five tables and the column.

**Jobs:** bias (5); legacy-store (10). No rows.

**MEANING?** (BOB's): the splice stays in `schema.mjs` for now. That is the provenance and ai-runs precedent (each has its own `migrate()` and is still spliced). Dropping the splice is legacy-store cleanup, which moves `hygiene.test.mjs`' harvest of table names out of `schema.mjs` and belongs to its own entry.

Evidence: `bio-plane/src/store.mjs`:670–745 (`ADDITIVE_COLUMNS`, both passes), 733; `src/schema.mjs`:5, 65; `src/bias/schema.mjs`:1–6, 93–108; `src/bias/index.mjs`:992–1010 (`biasOf`, no `migrate`); `src/membership/index.mjs`:191–205 (the pattern).

---

## 3. N347: capture renames its generic code; the door reads capture's rows

**Correction to the entry.** Both of capture's sites already put their own `code`, `check` and `translation` on the refusal: `evidenceAbsent` (`capture/ops.mjs`:44–48) and `#noSuchKnock` (`capture/index.mjs`:366–371). The door's `dec49Decorate` fills only absent fields (`control-plane/index.mjs`:811–822). So no answer today goes out bare. The gap is in R22 as a rule: a refusal with one of these codes that reaches the door without its fields gets nothing, because `MODULE_CHECK_FILES` (:776–781) does not read `src/capture/checks.mjs`.

**What else mints `NOT_FOUND`.** In the plane, only `evidenceAbsent`. `content/notice.mjs`'s `NOT_FOUND` is a grade inside an answer, not a refusal. Outside the plane, `pdf-worker` (`src/index.mjs`:168) and `ocr-worker` (`src/member.mjs`:264) answer `NOT_FOUND` for the same condition, a capture absent from storage. Their replies are read only by extraction's pipeline (`extraction/pipeline.mjs`:86–91, 307–313), which keeps `ok` and the status and never relays the code.

**Decision.** As K440 ruled: capture renames the code, then control-plane reads capture's table.
- The code becomes `EVIDENCE_NOT_HELD`. C-118.1 keeps its number and translation; only its key changes.
- `NO_SUCH_KNOCK` (C-118.2) keeps its code.
- `build/modules.json`: control-plane's `uses` gains `capture` (layer 3, earlier).

**capture.md:**
- **R63**: "`{ok: false, reason: "NOT_FOUND", code, …}`" becomes "`{ok: false, reason: "EVIDENCE_NOT_HELD", code, …}` (renamed from `NOT_FOUND`, a word every module could mint, so the door can read its row without lending it to them: N347, K440)". Append *(not yet met: N347)*.
- **R21**: "or R63's `NOT_FOUND`" becomes "or R63's `EVIDENCE_NOT_HELD`".
- **R32**: "(404, its own row in this module's table, K275; not `NOT_FOUND`, R63's)" becomes "(404, its own row in this module's table, K275; not R63's `EVIDENCE_NOT_HELD`)".

**extraction.md, R31.** "(`evidenceAbsent`, its R63: `NOT_FOUND`, 404)" becomes "(`evidenceAbsent`, its R63: `EVIDENCE_NOT_HELD`, 404)". Append *(not yet met: N347)*.

**control-plane.md:**
- **R22**: "whose `reason` or `code` has a catalogue row" becomes "whose `reason` or `code` has a row, in the catalogue or in a module's own table the door reads (`capture`'s among them, N347)". Append *(not yet met: N347)*.
- **Uses**: add "`capture`: `CAPTURE_CHECKS` (R22; N347)."

**Rows.**
- C-118.1 is re-keyed `EVIDENCE_NOT_HELD`. Nothing is retired and nothing is added.
- The row is capture's (layer 3), which changes after promotion's T14 stamp (layer 2). So `ROW_CENSUS` (R50) moves at T15's layer-2 stamp (N318's pattern). legacy-tests re-pins `check-refusal-codes` (one departed and one arrived, by name).

**Interface tests:**
- capture: `evidenceAbsent` answers `EVIDENCE_NOT_HELD` with C-118.1. A source sweep finds no `"NOT_FOUND"` refusal minted under `src/`.
- extraction: R31's absent object answers `EVIDENCE_NOT_HELD`. This re-anchors `test/m/extraction/pdfstructure.test.mjs`:55, 68.
- control-plane: `dec49Row("EVIDENCE_NOT_HELD")` is C-118.1; `dec49Row("NO_SUCH_KNOCK")` is C-118.2; `dec49Row("NOT_FOUND")` is null. A forwarded `{ok: false, reason: "NO_SUCH_KNOCK"}` under `result` gains C-118.2's `check` and `translation`. An answer that already carries them is unchanged.

**Jobs:**
- capture (3)
- extraction (4): R31's text and its two test lines
- control-plane (11): `MODULE_CHECK_FILES` and R22
- legacy-tests: `test/pdfstructure-op.test.mjs`:126 and the guard's re-pin
- legacy-ui (optional): the fixtures at `civicos-ui/test/snapshot-render.test.mjs`:93, 168 and `artifact-fetch.test.mjs`:21, 44 imitate the plane's code. `app.html` does not branch on it.
- Promotion's stamp in T15.

**MEANING?** (BOB's; a code is interface detail, K238):
- (a) The new code's name. `EVIDENCE_NOT_HELD` follows R63's own words ("no evidence object is held").
- (b) The two Workers keep `NOT_FOUND` for the same condition. Under K275 one condition has one code. But their answer is a contract between Workers that no member receives, and it is written into their layer-1 requirements (`pdf-worker.md`:30, `ocr-worker.md`:42–44). Converging them would be a separate entry, and the draft does not propose it.
- The translation a member reads is unchanged, so nothing goes to Bob.

Evidence: `bio-plane/src/capture/checks.mjs`:18–27; `src/capture/ops.mjs`:31–48, 77; `src/capture/index.mjs`:363–371; `src/extraction/index.mjs`:854; `src/control-plane/index.mjs`:776–803, 811–837, 3505; `build/jobs/T13/control-plane.md`:21, 42.

---

## 4. N348: instance-setup's routes pass the store's one frame

**Correction to the entry.** `instanceSetupRoute` (`setup.mjs`:2420–2434) does read `BAD_JSON`, with its own copy of R26's words. What it lacks:
- **R25's catch.** A throw answers `{ok: false, error: <stack>}` at 500. The stack leaves the Durable Object, and nothing is logged under a correlation id. The Worker's door reads that 500 as silence with no correlation (`doAnswer` carries one only from `STORE_INTERNAL_ERROR`, `control-plane/index.mjs`:910–914).
- **R27's existence read.** It never runs. But none of instance-setup's 14 ops names a bundle id, so R27 would answer nothing on them anyway.

**Decision.** The Durable Object class is control-plane's (K93), and `dispatch.mjs`'s `Store` already wraps legacy-store's. That class takes instance-setup's start and routes. `instanceSetupStore` and `instanceSetupRoute` then have no user and go. There is no key clash: none of the 14 route names is in legacy-store's map.

**control-plane.md, new after R34:**

> **The Durable Object class** (K93; N348)
> - **R35** The Durable Object class the instance exports is this module's (`dispatch.mjs`'s `Store`). At construction it starts `instance-setup` once per object (`instanceSetupOf(ctx, env).start()`, the composition root's share), and `instance-setup`'s routes (`instanceSetupOps`) are part of R26's route map, beside `legacy-store`'s. So every store route passes the one frame: R26's body read and envelope, R27's existence read and R25's catch. No module answers a store route outside it. *(not yet met: N348)*

**control-plane.md, Uses.** The `instance-setup` line gains "`instanceSetupOf` and its `start`, `instanceSetupOps` (R35; N348)".

**instance-setup.md, Suggestions, "Factory and start".** "Until `control-plane` holds the root (K93), `legacy-index`'s `Store` export wraps `legacy-store`'s class to do it, since `legacy-store`, earlier, cannot call this module" becomes "`control-plane`'s `Store` does it (its R35; N348)". This is not a requirement, and there is no mark.

**legacy-index's share (code only).** Export control-plane's `Store` as it is, and drop `instanceSetupStore` (`index.mjs`:3, 111–112).

**Edges.** None: control-plane already uses instance-setup.

**Sequencing.** `start()` is idempotent (`setup.mjs`:1910–1912). So control-plane taking the start and routes while legacy-index still wraps is harmless: the wrapper answers first, the same way. Order in T14:
1. control-plane (R35);
2. legacy-index (the export);
3. instance-setup removes `instanceSetupStore` and `instanceSetupRoute` in its T15 job (K408 (4)'s pattern), since it precedes legacy-index in the layer. Its test fixture (`test/m/instance-setup/fixture.mjs`:9, 137) builds its own frame over `instanceSetupOps` then.

**Interface tests (control-plane, through its `Store`):**
- Each of the 14 ops answers `{ok: true, result}` as before.
- A POST of non-JSON to `instancegroupseed` is R26's `BAD_JSON`.
- A throwing instance-setup route answers `STORE_INTERNAL_ERROR` with a correlation id and no stack.
- A second construction on the same storage starts nothing.

**Jobs:** control-plane (11); legacy-index (11); instance-setup (T15). legacy-tests: `test/identity-claims.test.mjs`:183 and `test/bounds.test.mjs`:175–192 describe the wrapper and are re-anchored when it goes.

**MEANING?** None. R25 already says no stack leaves either door. One point is BOB's: the timing of the wrapper's removal (T15 as drafted, or T14 if instance-setup's job is started after legacy-index merges).

Evidence: `bio-plane/src/setup.mjs`:2398–2449; `src/control-plane/dispatch.mjs`:125–162; `src/index.mjs`:3, 99, 111–112; `src/store.mjs`:2851 (`routes`).

---

## 5. N349: legacy-index's silences carry the correlation; its dead imports

**Claim checked.** legacy-index answers `storeSilent(op)` without `out.correlation` at 16 sites. They are of four kinds:
- **10 of its own relays after `doAnswer`**: `index.mjs`:214, 235, 317, 351, 424, 482, 542, 547, 562, 666. These are the same ten N339 lists (its 238 … 690, shifted by LEGACY-INDEX #9's removals). Each passes `out.correlation`.
- **2 answered-but-empty results**, `index.mjs`:484 and 544. There is no correlation to carry, and they stay.
- **3 through control-plane's `caseReader`**, `index.mjs`:259, 275, 340. It answers `{silent: op}` and drops the correlation (`control-plane/index.mjs`:684–685, 692–693).
- **1 through host-governor's `governorOp`**, `index.mjs`:672. It answers `{silent: true}`.

**Correction: the gap is wider than legacy-index.**
- control-plane's own silences drop it too: `control-plane/index.mjs`:1394, 1471 (through `presentedAi` and `caseReader`), 1583, 3447, 3478. Only :640, :948 and :3502 carry it.
- Every relay in N339's table (instance-setup, ratification, publication, capture, monitoring) also calls `storeSilent(op)` without it.
- N339's table misses two modules that open the store's envelope with their own readers instead of `doAnswer`. They relay no store refusal (N339) and carry no correlation (N349):
  - extraction: `ask`, `extraction/ops.mjs`:10–15, used at :32 and :43;
  - host-governor: `answerOf`, `host-governor/index.mjs`:325–330, used at :343–344 and :358.

**Decision (proposed).** Keep N349 as legacy-index's code share. Carry the correlation rule in N339's wording, since N339 already touches every one of these sites.

- **control-plane R23**, as N339 appends it: after "never as `STORE_DID_NOT_ANSWER` (N339)", add: "; and a reply that is no answer is `STORE_DID_NOT_ANSWER` carrying the correlation id `doAnswer` read from the store's internal error, when it gave one (R25; N349)".
- **N339's per-module line** (ratification R17, publication R48, capture R64, instance-setup R43, monitoring R49): "only a reply that is no answer is `STORE_DID_NOT_ANSWER`" becomes "only a reply that is no answer is `STORE_DID_NOT_ANSWER`, with the store's correlation id when it gave one (`control-plane` R25; N349)".
- The same line for the two modules N339 missed, if BOB widens it:
  - extraction **R64**
  - host-governor **R27**

  Each reads through the plane's `doAnswer`, handed in as capture's handlers take it.
- control-plane's own sites, including `caseReader`'s and `presentedAi`'s `silent`, carry it under R23 as amended. No new id is needed.

**legacy-index's dead imports.** Checked against the code (comments stripped). All of these are unused in `index.mjs`:
- `SIGN_HTML`, `GATE_VERSION`, `ratifyStatement`, `publishedGraphEdges`, `inbandQuartet`
- `odfEvidentiaryDigest`, `ODF_FORMATS`
- `driveHop`, `callerSuppliedHopFacts`, `DRIVE_PRODUCER`, `driveConvertStep`
- `captureSubresources`, `normalizeAddress`, `normalizeCitation`
- `render.mjs`' nine names, `formats.mjs`' three (`detectFormat`, `getFormat`, `readingDialect`) and `cdx.mjs`' five
- docprofile's **seven**, not six as the record says: `identify`, `doctypeFor`, `profileRecord`, `digests`, `CONFIDENCE`, `readText`, `CONTRACT`
- the uncalled local `governedFetch` (:95), with `fetchGoverned`, `governorOverStub` and `userAgent`, which only it uses

Two more that the record does not list are also unused: `setupPage` (from `setup.mjs`) and `decorate` (from `affordances.mjs`).

The record's worry about load-time registration does not bite. Every one of these files is imported by at least one other plane module (`formats.mjs` by six, docprofile's registry by four), so none leaves the bundle's graph. The job still confirms with the worker suites.

**Requirements.** legacy-index has no file. Its share is code only. The rule is carried by control-plane R23 and N339's lines, as above.

**Interface tests:** a stub store answering `STORE_INTERNAL_ERROR` with a correlation, behind each of the ten relays, gets 502 `STORE_DID_NOT_ANSWER` carrying that correlation. The same holds through `caseReader`'s session read. A store answering 500 without one still gets no `correlation` key.

**Jobs:** legacy-index (11): the ten relays (in one job with N339's share) and the imports. control-plane (11): its sites under N339. extraction (4) and host-governor (3) only if BOB widens N339. No rows.

**MEANING?** (BOB's): whether N339 widens to extraction and host-governor, and takes the correlation rule. The meaning is R25's, already held: a silence the store explained carries the one thing the caller and the log share.

Evidence: `bio-plane/src/index.mjs`:1–110 (imports), 95–98, 214–672 (the sites); `src/control-plane/index.mjs`:640, 668–700, 903–950, 1394, 1471, 1583, 3447, 3478, 3502; `src/host-governor/index.mjs`:325–359; `src/extraction/ops.mjs`:10–45; `build/jobs/T13/legacy-index.md`, "Deferred".

---

## Jobs T14 needs for these entries

| layer | module | entries |
|---|---|---|
| 2 | record-core | N342 (R63, C-102.13, C-102.14) |
| 2 | promotion | the stamp (N342's rows) |
| 3 | capture | N347 |
| 3 | host-governor | N349, only if N339 widens |
| 4 | extraction | N347 (R31 and two test lines); N349, only if N339 widens |
| 5 | bias | N343 |
| 10 | legacy-store | N342 (the spread, its own reads kept), N343 |
| 11 | queue | N342 |
| 11 | control-plane | N347, N348, N349 (its sites, with N339) |
| 11 | legacy-index | N348 (the export), N349 |
| 11 | legacy-ui | N347's fixtures (optional) |
| last | legacy-tests | the re-anchors named above; `check-refusal-codes` re-pin (N347) |
| T15 | legacy-store | N342: its four reads and the TASK row go |
| T15 | instance-setup | N348: `instanceSetupStore`, `instanceSetupRoute` go; its fixture |
| T15 | promotion | the stamp for C-118.1's new key (N347) |

## Questions for Bob

None. Every **MEANING?** point above is BOB's: codes, rows, key order, a null for an unread figure, sequencing and scope. The one code a member could see change is capture's `NOT_FOUND`, and its sentence stays the same (K238).
