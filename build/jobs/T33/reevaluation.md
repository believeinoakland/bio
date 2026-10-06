# reevaluation (T33)

**Status** · session_01VKWCnWDafoCDNgYEnahSya · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Four readings for T33-59. I am building on each now; none stops the job unless you answer otherwise.

1. **R34's leg on an event.** `inquiry` R4 (and `inquiry-grammar` R13–R15) admit no `EVT-` target, and "an action is never a leg (D113)", so through inquiry's checked path no live leg targets an event or an `ACT-` id today; only a replayed or legacy document can hold one. My reading: R34's arm matches any `inquiry_basis` row (live, R7) whose target is the event id, or an `ACT-` id `events.eventForAct` answers as that event, so it works the day a leg kind admits events, and my tests lay such legs down by a replayed promotion. If you mean an event leg kind to exist in T33, that is inquiry-grammar's and inquiry's, not mine.
2. **R34/R35 rows (the job's choice, Suggestions).** A telling is kept as one row only when some basis leg (any state) names that event (or an ACT- alias of it), or that calculation, at the telling; a telling nothing rests on writes nothing (it could never raise a cause: R34/R35 need the telling later than the dependent's last write). `merged` and `split` tellings from `events` are not R34's two kinds and are ignored. A telling carries no instant from `events`/`calculations`, so `since` is this module's clock when told.
3. **R36's reads of `standards`.** `standards` offers no service answering "which standard's portion is this content id" or "the standards at key K, portion P"; its tables are not a stated read contract. My reading: the sweep pages `standardsIn` (machine viewer) once per batch to index each standard's `instrument.key`, `portion.path` and `portion.content_id`, and calls `addressesOf({key, portion})` (its R24, renumbers and recodifies both, as R24 says reevaluation reads it). A reference matches when its content id is a held standard's portion content id. A candidate is another standard at the same key and portion, or at an address `addressesOf` names, whose portion's capture differs, is retrieved later (provenance `captured_locators.first_retrieved`, earliest per capture), and is held at no address the pinned capture is held at (`address_norm` sets disjoint; never matched by text). `content.passageNotice`/`noticeForRow` grade only within one address's chain, so a cross-address notice is graded `undetermined` by name (R21) until content can compare two captures (the START question in Suggestions: today it cannot). The notice row gains `newer_content` and `across` (standards, key, portion, relation), and `adoptVersion` re-pins the leg to that content row.
4. **`uses`.** `modules.json` does not yet list `events`, `calculations`, `standards` for reevaluation (K1505 (7): stated at COMPLETE); the architecture check will be red on those imports until you add them. I will state the final list in COMPLETE.

## Completion

**Entries applied.** T33-59 whole (B1a.11, C:A-10, X73; K1470, K1446; the readings of J1, all accepted by B2, K1624).
- **R34** (`event_changed`). The factory registers once on `events.onEventChanged`. `eventChanged({eventId, change})` keeps one row in `reevaluation_event_changes` (event, change, instant; no value) for a `when_moved` or `participant_re_resolved` telling, only when some basis leg names the event or an `ACT-` id that `events.eventForAct` answers as it. `merged` and `split` tellings are ignored. It then tells R8's listeners as `kind: "event_changed"` with the live legs on the event and its aliases: direct dependents only, one level (Choices 19). On read, `#heardChanges` derives the cause per live leg when the telling is later than the dependent's last write. The cause carries `event`, `change`, `since`, and `act` when the leg names an alias.
- **R35** (`calculation_input_changed`). The same pattern, over `calculations.onInputChanged`: table `reevaluation_input_changes` (calculation, input, instant). Nothing is recomputed here.
- **R8, R9, R16, R18.** R8 now covers the two new kinds and the cross-address passage notice (`across`). R9 (`changesOf`), R16's closing and the R1 listing all carry R34 and R35, through the same paths as R28–R33. R18's rows: the two new tables, declared to purge with no bundle key.
- **R36** (across addresses). `raiseNotices` builds `#acrossReader` once per batch. It pages `standards.standardsIn` (machine viewer) to index each standard's composed instrument key, portion path and portion content id, and calls `standards.addressesOf({key, portion})`. A leg whose content id is a held standard's portion is told of a version of the same key and portion, or at an address `addressesOf` names (a renumbering or recodification). That version's capture must have been first retrieved later (`captured_locators`) and be held at none of the pinned capture's addresses, so nothing is matched by text. Such a notice is graded `UNDETERMINED`, with `affects: undetermined` (R21; content cannot compare across addresses, which is N589). The notice row gains `newer_content` and `across` (an ALTER for tables created before this job). `notices()` lists both, and nulls `newer_content` with the capture for a viewer who does not see it. `adoptVersion` re-pins the leg to `newer_content` in that passage's document.
- **Improvements in this module.**
  - An `EVT-`, `ACT-`, `CALC-` or `occurrence:` target is a row its own module holds. It no longer reads as a `deletion` cause (since T33-45, a `CALC-` leg did read as one).
  - R20 for those targets: an event is seen as `events.readEvent` answers it for the viewer. A calculation is not seen by a member (fail closed; see REPORT).
  - A sweep leg whose chain is unread still has R36's other addresses read.

**M-V5** (`mv5.test.mjs`, synthetic Legistar re-import over the real `events`): 240 events had their `when` moved once; 60 of them are cited, with 3 direct dependents each.

| measure | result |
|---|---|
| tellings | 240 (1 per event) |
| rows written | 60 (0.25 per event; none for an uncited event) |
| dependents named | 180 (0.75 per event) |
| listener time | 30.0 ms in all; 0.125 ms per event; 0.86 ms at most |
| untargeted read of the 180 obligations | 68 ms |
| bound | 30,000 ms (a Durable Object invocation's default; the plane's `wrangler.jsonc` pins no CPU limit) |

Far inside the bound; it gates nothing in T33.

**Final `uses`** (K1505 (7)): the current list plus `events`, `calculations` and `standards`. With those three added to a scratch copy of `modules.json`, `architecture.mjs` reads 0 failures.

**Deferred.** None of this module's own.

**Found in other modules (REPORT).**
- `calculations`: it has no synchronous read of whether a viewer may see a calculation (`#visible` is private; `read` is async). So R35's obligation is withheld from a member in R1's listing and refused as their target (fail closed, R20). R9 and R8 still carry it. A sync `seesCalculation(calcId, viewer)` would let R1 show it.
- `standards`: it has no service answering "the standard whose portion is this content id" or "the standards at key K, portion P". R36 therefore pages `standardsIn` once per sweep batch, which costs O(held standards) per batch. A `standardsAt({key, portion})` read, or a stated read contract on `standards.instrument`, `portion_path` and `portion_content`, would bound it.
- `events`: its R16 telling carries no instant, so `since` is this module's clock when told (K1624). The commit instant in the payload would be the truer `since`.
- `content`: it cannot grade across addresses (N589, already carried).
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale by this change, as by every plane module's. BOB regenerates it at the layer close.

**Tests and checks.**
- `node --test bio-plane/test/m/reevaluation/`: tests 135, pass 135, fail 0. That is the 121 before plus `heard.test.mjs` (9: R34, R35 against the real `events` and `calculations`, with R8, R9, R16, R18, R19 and R20 arms), `across.test.mjs` (4: R36 against the real `standards`, with R14, R15, R21) and `mv5.test.mjs` (1).
- Dependants' suites:

| suite | pass | fail |
|---|---|---|
| ratification | 204 | 0 |
| publication | 109 | 0 |
| case-import | 75 | 0 |
| docket | 43 | 0 |
| queue-producers | 80 | 0 |
| monitoring | 111 | 0 |
| plane `docket` and `accepted` | 14 | 0 |
| case-authoring | 121 | 1 |
| scheduler | 65 | 1 |
| conformance | 53 | 1 |

  The three failures are named reds from B1: case-authoring R30 `invariants.test.mjs:124`, scheduler R12, and conformance R21 `comparisonFacts`.
- `format.mjs`: 126 modules, 125 requirements files; 0 failures.
- `coverage.mjs … reevaluation`: 36 of 36 live ids named by a test; 0 failures.
- `ownership.mjs … reevaluation tranche/T33`: 7 files; 0 failures.
- `architecture.mjs … reevaluation`: 6 failures, all the three new edges (`events`, `calculations`, `standards`) from `index.mjs` and the fixture, which BOB sets at the merge (K1624). With them, 0 failures.
- P6: `bio-plane/src/reevaluation/` is 3,429 lines (index 3,036), under 4,000.

Size (session_01VKWCnWDafoCDNgYEnahSya): test runs 16, module lines 3429

## J2 · COMPLETE

T33-59 complete on `job/T33/reevaluation` (commit 93fbed7fca, record fab70e1657; "Completion" above has the detail).

- **What was built.**
  - R34 and R35 heard from the real `events` and `calculations`.
  - Each kept as a row only when a leg names the subject, derived on read as a cause, told to R8's listeners with direct dependents only, answered by R9 and closed by R16.
  - R36: notices across addresses through `standards.standardsIn` and `addressesOf`, graded UNDETERMINED (N589); `adoptVersion` re-pins to the new address.
  - An event, act, calculation or occurrence target no longer reads as a deletion.
- **M-V5.** 240 events re-imported, 60 cited: 60 rows (0.25 per event) and 180 dependents named (0.75 per event). The listener took 0.125 ms per event against a 30,000 ms bound. It gates nothing.
- **Tests.** reevaluation 135/135. The dependants' suites are green except the three named reds from B1 (case-authoring R30, scheduler R12, conformance R21).
- **Checks.** format, coverage (36/36) and ownership: 0 failures each. Architecture: 6 failures, all the three new edges. They read 0 with `uses` + `events`, `calculations`, `standards`, which is the final list for you to set at the merge (K1624).
- **REPORTs, for the next plan.**
  - `calculations` has no synchronous sight read, so R35's obligation is withheld from members in R1 (fail closed).
  - `standards` has no read by key and portion, or by portion content, so R36 pages `standardsIn` once per sweep batch.
  - `events`' R16 telling carries no instant.
- **Stale artifact.** The plane bundle (`not_product`), for your layer close.
