# inquiry (T33)

**Status** · session_01DsBk1p4zfVLvAP4c7F8bt7 · depth 2 · COMPLETE · handled B6

## J1 · QUESTION

Readings I am building on while leg-earning and inquiry-grammar run; each is my best reading and I carry on with it unless you answer otherwise. Until your CHANGE I keep the moved code and work only on what does not depend on it: R54–R57 (dated waits), R36 (explicit `declareTable`), and R11's new-leg checks coded against inquiry-grammar R13–R15 and leg-earning R9 as injected deps (K1563 (1)).

1. **CALC- legs (R11): calculations has no synchronous read.** A promotion's check is synchronous (promotion R39), and `calculations.read` is `async` (its internals are synchronous: `#visible` says so). No read contract on its `calculations` table either. Reading: inquiry takes a synchronous port `calculation(calcId, viewer) → {held, visible, accepted}`, injected through `inquiryOf(host, deps)` and wired by plane over calculations; with no port, a `CALC-` leg is refused fail-closed as an unknown target (BASIS_REFUSED, the detail saying the record cannot confirm it here), never passed. I REPORT the gap for calculations: a synchronous `calculationStatus({calcId, viewer})` (or `read` made synchronous) would let plane wire the real module. My tests drive the port.
2. **The viewer of R11's "the viewer may not see"** at a promotion: the promotion's `author` stamp (the control plane's), as the act's viewer.
3. **R55/R57 time zone.** Uses gain `jurisdictions` (layer 1): the active view's `time_zone`, `jurisdictions.combine` over record-core's `jurisdiction_profiles` setting (duties' pattern), with an injectable `view` dep. No zone held: a wait's state is `undetermined` with why (never the UTC day), and `datedWaitsDue`/`Tick`/`Wake` count none.
4. **Scheduler R9's arming notice.** scheduler arms "a dated wait set (inquiry) … through the notice its owner offers". R54–R57 name none. Reading: inquiry offers `onWaitSet(module, fn)` (a one-registration slot via membership's `listenerRefusal`, as R42), `fn({inquiry, date, set_by})` called after a promotion sets or re-dates a wait; a throwing listener never undoes the promotion.
5. **A wait's identity (R54).** Matched across revisions by its text and date: same text and date keeps `set_by`/`set_at`; a changed date ends the old wait `redated` and starts a new one set by this revision's author; a trigger whose text changed or that is gone ends `removed`. `index` is its current position. Held in a new table `inquiry_dated_waits` (`sight: "owner"`, R36), ended waits kept with who and when.
6. **Refusal rows.** R11's new codes (`PORTION_UNKNOWN`, `NO_SUCH_OCCURRENCE`, `CALCULATION_NOT_ACCEPTED`) are findings inside `BASIS_REFUSED` with check `C-2.8` and their code; `waitLook`'s (`MACHINE_CANNOT_LOOK`, `NOT_YOUR_WAIT`, `NO_SUCH_WAIT`) are codes with no catalogue row. No new C-rows (promotion's stamp of T33 rows is T34's anyway).
7. **R55 "only the member who set a wait".** `datedWaits` answers only when `viewer` is that member's own stamp (`member:<id>` naming `member`); an administrator or any other viewer reads none.
8. **inquiry_basis's declaration after the split.** After leg-earning merges it declares `inquiry_basis` (K1505 (2)); I then drop it from my declarations (a second declaration is `TABLE_DECLARED`).

## J2 · REPORT

Where I stand, and what I need next.

**Done on `job/T33/inquiry` (green: 182 pass, 0 fail in `test/m/inquiry/`):** R54–R57 dated waits (table `inquiry_dated_waits`, projection in R12, `datedWaits`, `waitLook`, `datedWaitsDue/Wake/Tick`, `onWaitSet` for scheduler R9; 12 tests); R36 every table declared through `declareTable` (waits `sight: "owner"`); R11's record checks for `STD-` legs (`standards.standardRead` as the promotion author; `PORTION_UNKNOWN`) and `CALC-` legs (fail-closed, K1601).

**Uses edges I add (for `modules.json` at merge):** `jurisdictions` (the view's `time_zone`, K1601 (3)) and `standards` (R11's `STD-` check: `standardRead`; inquiry's Uses do not list it, but R11 needs a held standard and its portion, which only standards answers). I also add an op entry `waitlook` to `inquiryOps` (R56: the look is the stamped member's own act); routing it is control-plane's / op-declarations', not mine.

**Waiting on:** inquiry-grammar's merge (today's grammar refuses `STD-`, `CALC-` and occurrence targets as "not a canonical record id", so R11's new arms cannot be driven through a promotion until its R13–R15 land) and leg-earning's merge with your CHANGE (the deletion, re-points of R11, R12, R29, R39, R40, R52, the occurrence check through leg-earning R9, and the tests of the new leg arms).

## J3 · COMPLETE

**State of the work.** Complete on `job/T33/inquiry`. B4–B6 applied: inquiry-grammar and leg-earning merged from `tranche/T33`; the moved code deleted and re-pointed; the row pin at ten.

**Entries applied (T33-45).**
- **The deletion (K617, K1505).** Deleted: the earned registry, the backfill, the leg versions, `earnedBasis`, `basisFor`, `restingOn`, `restsOnLive`, the cycle walk, `projectsDrawingOn`, `legCapped` and their constants (index.mjs 3,055 → about 2,450 lines; the module 3,903 → 3,183).
  - Re-pointed to leg-earning: R11's earned registry and cycle walk (leg-earning R6), R12's projection (it writes `inquiry_basis` only through `writeBasis`), R29, R39 (`projectsDrawingOn`), R23's live legs, R52 (2) (`earned`, `legCapped`), and the audit context (K783).
  - `inquiry_basis` dropped from `INQUIRY_TABLES`, the schema and the declarations (leg-earning declares it).
  - Rules (9) item 4: `legCapped`, `LEG_BACKFILL_MAX`, `EARNED_TARGETS_MAX`, `PROJECTS_DRAWING_MAX` and `AUTHORED_ROUTE_BASES` are re-exported as leg-earning's own bindings. The instance's `earned`, `earnedForDoc`, `earnedBasis`, `basisFor`, `restingOn`, `restsOnLive`, `cyclePath`, `projectsDrawingOn` and `ensureLegContent` delegate one line each, because a dozen callers ask them through `inquiryOf(host)` (strength, basis-versions, reevaluation, citation, ratification, publication, project-stage, case-disclosures, affordances, action-plans). The op entries `basis`, `restson` and `earnedbasis` in `inquiryOps` delegate the same way until plane takes `legEarningOps`.
  - The moved tests (R13–R17) were deleted here; leg-earning's suite holds them.
- **R4, R11 (K1447 (i)–(iii)).**
  - `STD-` legs: `standards.standardRead` as the promotion's author; an absent standard is refused NO_SUCH_STANDARD, a `target_portion` the standard does not hold PORTION_UNKNOWN.
  - `CALC-` legs: refused fail-closed with CALCULATION_NOT_ACCEPTED (K1601; N576).
  - Occurrence legs: NO_SUCH_OCCURRENCE through leg-earning R9 for a duty duties does not hold (NO_SUCH_DUTY), an occurrence it does not derive (OCCURRENCE_NOT_DERIVED) or duties unreadable; one duties answers undetermined stands.
  - All three are findings inside BASIS_REFUSED at C-2.8. Division's children list no calculation or occurrence target in `references[]` (inquiry-grammar R14, R15).
- **R54–R57, dated waits.**
  - Table `inquiry_dated_waits`, projected at each promotion.
  - The reads and services: `datedWaits`, `waitLook` (op entry `waitlook`; its routing is L11's, K1604), `datedWaitsDue`, `datedWaitsWake` and `datedWaitsTick` for scheduler, and `onWaitSet` for scheduler R9 (K1601 (4)).
  - The zone is the jurisdiction view's `time_zone`; with none held, or an unknown one, a wait is undetermined, never read on the UTC day.
- **R36.** Every table is declared through `declareTable` with the default form's classes; the dated waits are `sight: "owner"`.

**Deferred.** None of this entry. Still not met and not this tranche's: R31 (MK-5, K181; its test is a todo).

**Found in other modules.**
- (1) calculations offers no synchronous held/visible/accepted read (N576, recorded by BOB).
- (2) The fixtures of case-authoring, case-disclosures and consequences reach `connections` and `entities` through `inquiry`'s instance (`inquiry.connections`). I kept those getters. When their jobs re-point they should build these on the host themselves.
- (3) plane's `store.mjs` should compose `legEarningOps` (`basis`, `restson`, `earnedbasis`) in place of inquiry's delegating entries, and register `waitlook`. These are L11's.
- (4) BOB's `inquiry.md` R4 still says a calculation is "listed in `references[]`". inquiry-grammar R14 (K1601) says it is not, and I followed the grammar.

**Final uses (for `modules.json`).** record-grammar, jurisdictions, civil-time, text-chain, record-core, membership, promotion, provenance, extraction, content, entities, connections, progressions, observation-log, standards, retrieval, inquiry-grammar, leg-earning, bias.
- Added beside the declared row: jurisdictions (the zone, K1604), civil-time, standards (R11's `STD-` check, K1604) and leg-earning.
- calculations, though R11 names it, is not imported (K1601).
- text-chain, provenance and extraction are no longer imported by the source: they are reached through leg-earning. They stay in the row until BOB prunes it. The architecture check's 7 failures are exactly these new edges (leg-earning, standards, civil-time, jurisdictions) not yet in `modules.json`.

**Tests and checks.**
- `test/m/inquiry/`: tests 159, pass 158, fail 0, todo 1 (R31).
- The users' tests, compared module by module with `tranche/T33` @ the B6 merge, show no new red:
  - leg-earning 45/0, action-plans 53/0, citation 55/0, strength 115/0, ratification 204/0, publication 109/0, plane 85/0, basis-versions 127/0, consequences 30/0, docket 43/0, ai-runs 69/0, contradiction 119/0, reevaluation 121/0, actions 74/0, project-stage 23/0.
  - case-authoring 121/1 and case-disclosures 47/1: each red is its own no-place test, red on the tranche too.
  - affordances 165/2 (K1550, K1571), capture-requests 76/4, intent 64/1, conformance 53/1 and control-plane 156/3: the same reds as the tranche.
- `format`: 0 failures. `coverage`: 48 of 48 live ids, 0 failures. `ownership`: 17 files, 0 failures. `architecture`: 7 failures, the uses edges above.

Size (session_01DsBk1p4zfVLvAP4c7F8bt7): test runs 24, module lines 3183
