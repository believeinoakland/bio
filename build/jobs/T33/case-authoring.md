# case-authoring (T33)

**Status** · session_019WZS24Hy714ZhHvn9X7j5A · depth 2 · COMPLETE · handled B9

## Completion (CASE-AUTHORING #17)

**Entries applied.** T33-69 (C:A-15, K1448) whole, on K1633 and K1634:
- R56: the async gather `calculationsAtPublication` before the act (the ops `publishcase` and `publishpreflight` are async arms; `publishCase` stays synchronous, R18); each calculation a member's chain reaches recomputed then read, each workbook among its captures read and never recomputed; the judgment in R55's order, `CALCULATION_NOT_DISCLOSED` (C-136.1, translation BOB's draft) only for an undisclosed differing or unbound load-bearing one, `CALCULATIONS_UNREAD` without the gathered facts; the `calculations:` block through case-grammar R18 (`not_recomputed` for a workbook, K1642) and a body section.
- R57: the `timeline:` block through case-grammar R20 from `events.timeline` over the members' subjects and event legs, two lanes, each item with its source, the unsourced left out and counted; a body section.
- R55: the steps after the flags: R56's judgment, then case-disclosures' `peopleNamed` over the parts this act assembles (its shape), `peopleJudged` (`peopleBases`), `tieAttestationJudged` (the author's `tieAttested: true`, stamped `[{signer, at}]`); the `people:` and `member_ties:` blocks through its renderers. R34's blockers gain all three.
- R8, R55: `caseRelation` and `attributionStatements` through `case-tensions` (`caseTensionsOf`), after publication's merge (K1643).
- The red named in START (K1545): R30 reads the places through `jurisdictions.list()`.
- B6's red: R29's pins widened to C-120.14–.16.

**Deferred.** Nothing in this module. Two findings are scheduled elsewhere (K1639): inquiry admits no `CALC-` leg yet (N576), so R56 is reached end to end only in my tests, which give case-authoring's view of inquiry the legs; `calculations.read` states no SHA-256 for a non-table input (N596), so such a row's `inputs` and `result_key` are written null.

**Found in other modules.** J3 (1)–(4), answered by K1639. Also: affordances' `catalogue.test.mjs` fails 3 on the tranche as on my branch (the named R3/R7/R12 reds, and R19's `ATTRIBUTION_NO_REASON` row, which moved with publication's split); none is this module's.

**Final uses** (for `modules.json`, K1633/K1634): add calculations, workbooks, events, case-tensions, jurisdictions; and, for the fixture's record of people built on the host (K1619), entities, connections, lines, money, people. inquiry-grammar, publication, case-grammar and case-disclosures are already listed.

**Tests and checks** (on `job/T33/case-authoring` after merging `tranche/T33` @ K1643):
- `node --test bio-plane/test/m/case-authoring/`: tests 137, pass 137, fail 0.
- review, case-tensions, publication (users and providers of what I changed): pass 155, fail 0. affordances `catalogue.test.mjs`: pass 47, fail 3, identical on the tranche.
- format: 126 modules, 125 requirements files; 0 failures. coverage: 41 of 41 live ids named; 0 failures. ownership: 13 files; 0 failures. architecture: 11 failures, every one a `uses` edge listed above, set by BOB at the merge.

Size (session_019WZS24Hy714ZhHvn9X7j5A): test runs 27, module lines 3277

## J1 · QUESTION

Four points from reading T33-69 against the code. My best reading is stated on each; I am building on it now and stop only if you answer otherwise.

(1) **Sync vs async (R18 against R56).** `calculations.read` and `recompute` and `workbooks.readWorkbook` are async in the merged code (table bytes come from the evidence store; WORKBOOKS #1 J2 says so). R18 keeps `publishCase` synchronous inside the caller's transaction, and `review` runs it that way and rolls back (review R13, its index.mjs:519); `case-disclosures` R23 is synchronous too. **Best reading:** the async part runs before the act, never inside it. A new async service `calculationsAtPublication({targets|target, project, viewer})` (inside this module) follows each member's chain to its `calculation` legs (inquiry-grammar R14) and workbook targets, calls `calculations.recompute` then `read` for each calculation (the recompute writes only calculations' own status, as its R8 allows "at publication") and `workbooks.readWorkbook` for each workbook, and answers the facts. The ops `publishcase` and `publishpreflight` become async arms: they gather first, then run the synchronous `publishCase` / `publishPreflight` with the facts passed in (`calculationFacts`, an internal argument; never a caller's body field: the arm overwrites it). `publishCase` run without them (review's in-transaction run) reads no calculation; for a member whose chain reaches one it answers `CALCULATIONS_UNREAD` (no catalogue row) naming them, so a dry run never treats an unread calculation as agreeing. R18, R56 and review's call stay as written. If you would rather make `publishCase` async (a change to a provided service; review is affected), say so.

(2) **R56's row.** R29 makes `CALCULATION_NOT_DISCLOSED` a new row of this module's table, its translation BOB's. **Best reading:** a new `PUBLISH_ACT_CHECKS` entry, id `C-136.1` if free (C-135 is the highest I find on the tranche), translation: "A calculation a load-bearing finding rests on gives a different result when the instance recomputes it, or rests on a figure typed in without a source, and this publication does not say so. List it with your own words, and publish again; the published case will state it. Nothing was published." `CATALOG_VERSION` moves at promotion's stamp (Choices settled: T34). Please give the id and words, or confirm.

(3) **The new inputs' names.** **Best reading:** `publishCase` takes `calculationsDisclosed: [{calc, words}]` (R56; a workbook is listed by its capture sha in `calc`), `peopleBases` (handed whole to `case-disclosures.peopleJudged`, its R25), and `tieAttested` (handed whole as `attested` to `tieAttestationJudged`, its R27), with `signers` = `[author]`, the owner who will sign. The `people:` and `member_ties:` blocks (its R28) are written by its `peopleLines` and `memberTieLines` in R14's document, after `calculations:` and `timeline:`, before `completeness:`.

(4) **`uses` and unmerged upstreams.** My final `uses` gain `calculations`, `workbooks`, `events`, `case-tensions` (and `inquiry-grammar` for the leg kind). Architecture will fail on my imports until `modules.json` carries them: please add them, or tell me to hold the imports as injected deps. case-grammar (R18, R20 renderers), case-tensions and case-disclosures (R24–R28) are unmerged, so per K1563 (1) I reach them through injected deps (case-grammar's renderers through a namespace read, so a missing name does not break the module's load) and re-point my tests at the real modules after each merges, before COMPLETE.

Also, from START: R30's red is fixed through `jurisdictions`' loaded profiles (its `covers`), not their source text.

## J2 · QUESTION

Replaces J1: J1's four points stand as written, with three refinements found in design. Answer this one.

(1) **Sync vs async**, as J1 (1), refined. The gather (`calculationsAtPublication`, async) runs before the act in both async arms: `publishcase` and `publishpreflight`. In both it calls `calculations.recompute` for each calculation a member's chain reaches (then `read`), because DEC-8 needs the pre-flight's `first` to be exactly op=publish's refusal, and only a recompute tells whether a calculation differs now. **Best reading:** that recompute writes only `calculations`' own recompute status (its R8: "recomputed … at publication"), which is the ceremony's record, not a write of the case; R34's "writes nothing" holds for the case, this module's tables, publication's and every other. A workbook is read through `workbooks.readWorkbook` and never recomputed (its R8: only its own act recomputes). The chain is followed through inquiry legs (`inquiry.basisFor`), each finding once, bounded; a workbook is a capture `case-disclosures.restingCaptures` answers that `readWorkbook` finds in the publishing project.

(2) **The state written** (case-grammar R18's `recompute`: `agrees`, `differs`, `unbound`). A calculation `differs` when the recompute disagrees, else `unbound` when an input is unbound (`read`'s grade facts, R9), else `agrees`. A workbook `differs` when its latest recompute is `differs` or a binding differs (its R4), else `unbound` when an input cell is unbound (its R5), else `agrees` when its latest recompute agrees, else `not_recomputed` (its R7's "not recomputed here", never a gate, K1506). Only `differs` and `unbound` on a load-bearing member's chain need disclosure. A calculation the viewer may not see (withheld whole, calculations R10) is not written and not judged. A listed calculation that needs no disclosure is not refused (R56: no other state refuses) and its `disclosed` is null.

(3) **One more edge.** R30's fixed test now reads the places through `jurisdictions.list()` (its R1), so case-authoring's `uses` also gains `jurisdictions` (layer 1). With J1 (4): `calculations`, `workbooks`, `events`, `case-tensions`, `inquiry-grammar`, `jurisdictions`.

J1 (2) (the row's id and words) and (3) (the input names `calculationsDisclosed`, `peopleBases`, `tieAttested`, signers `[author]`) are unchanged.

## J3 · REPORT

Built on K1633/K1634: R56 (gather, judgment, C-136.1, the `calculations:` block and a body section), R57 (the `timeline:` block, two lanes, a body section), R55's new steps (calculations, then `peopleNamed`/`peopleJudged`, then `tieAttestationJudged`), R34's new blockers, R8/R55 reaching `caseRelation`/`attributionStatements` through a `caseTensions` dep (publication's re-export until T33-62 merges), R30's red fixed through `jurisdictions.list()`. 137/137 module tests; format 0, coverage 41/41, ownership 0; architecture fails only on the four `uses` edges you set at the merge (calculations, workbooks, events, jurisdictions). Pushed on `job/T33/case-authoring`. I now wait for case-grammar, case-tensions and case-disclosures to merge, to re-point my tests at them before COMPLETE.

Findings in other modules:

(1) **inquiry: no finding can rest on a calculation today.** `inquiry`'s promote gate refuses every `CALC-` leg (`inquiry/index.mjs:512`, C-2.8 `CALCULATION_NOT_ACCEPTED`: "whether it is held, visible to you and accepted cannot be confirmed here"), against inquiry-grammar R14 and inquiry R4's calculation leg. So R56 is reachable only in my tests (which give case-authoring's view of inquiry the legs). The likely cause is that `calculations`' reads are async; a synchronous read of a calculation's acceptance and visibility (calculations has `#visible` sync already) registered with inquiry would close it. For inquiry's or calculations' next job.

(2) **calculations: `read` states each input's SHA-256 only for a table.** case-grammar R18's `inputs` ("each input's name and SHA-256, the canonical bytes calc-grammar evaluates") and publication R22 as amended (K1632: the commit stores each input's bytes at its SHA-256) need it for every input; `calculations.#compute` computes these hashes (`hashes`) but `read` does not answer them. I write `{name, sha}` with the table's sha and null for a figure, money or calculation input. For calculations' next job (or now, if you route it as a CHANGE).

(3) **case-grammar (T33-60): one more `recompute` value.** Per K1634 a workbook not recomputed here is written `recompute: not_recomputed`, beside R18's `agrees`, `differs`, `unbound`; its `calculationsLines`/`calculationsOf` should carry it. A workbook row has `calc` = its capture sha, `recipe`, `results`, `result_key` null, `inputs` [], `method_version` "<engine> <version>".

(4) **case-disclosures (T33-68): the shapes I hand it**, for its job to code against (or tell me to change mine):
- `peopleNamed(prepared, parts, viewer)` with `parts = {statement, scope, justification, bias, excluded, conclusions: [{target, …conclusion}], subjects: [{target, entity}], lens: [lens statements as R40 reads them], timeline: [{lane, ord, when, label, ref, source, participants: [entity ids]}], money: [money fact ids the case's calculations cite]}`; I read back `{named, unresolved}` only by handing it to `peopleJudged` and `tieAttestationJudged`.
- `peopleJudged(named, peopleBases, viewer)`: `peopleBases` is the act's body field, handed whole.
- `tieAttestationJudged([author], named, moneyFactIds, tieAttested, viewer)`: `tieAttested` is the act's body field, handed whole; `moneyParties` is the money fact ids (it resolves payer and payee).
- `peopleLines(rows)` and `memberTieLines(rows)` are written after `timeline:` and before `completeness:`.
The pre-flight asks all three over the same parts.

## J4 · COMPLETE

T33-69 complete on job/T33/case-authoring @ 29d3061ad0 (tranche merged @ K1643). R56, R57, R55's new steps, R34's blockers, R8/R55 through case-tensions; R30's and R29's reds fixed. 137/137; format, coverage 41/41, ownership 0; architecture fails only on the uses edges to add at the merge: calculations, workbooks, events, case-tensions, jurisdictions, and (fixture) entities, connections, lines, money, people. Details and Size line in the record's Completion section.
