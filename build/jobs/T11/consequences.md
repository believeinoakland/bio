# consequences (T11)

**Status** · session_014niSbgTxMSArkDJwhCLLE4 · depth 2 · COMPLETE · handled B1

## Completion (CONSEQUENCES #2)

**Entries applied** (B1; plan layer 9):
- **N257** (R5, R9; Bob, K283). A part whose measure is zero (value 0, or range [0, 0], computed or assessed) answers causation `not_applicable`, with why, whatever inquiry is named (the id is kept, and read again when a revision gives the part a measure that is not zero). `consequencesOf` does not list it `unproven`, `addressed` does not count it `unproven`, so a group's judgment of no consequence, addressed with evidence, reads `addressed`. R8 raises no causation notice on a zero part. Tested: `assessed.test.mjs` "R5 R12 (N257)", `addressed.test.mjs` "R9 R5 (N257, K172, K283)", which replaces the literal K249 (3) arm that read such a part `undetermined`.
- **N297** (this module's share of the DEC-49 guard). The two short translations are sentences now (C-114.10 `NO_RATIONALE`, C-114.17 `BAD_REASON`). The nine arm C failures came from codes minted in functions their rows' `where` did not name; every code of this module is now minted at one site, the function its row names (K231): helpers `noSuchDetermination`, `noSuchPart`, `alreadySuperseded`, `reasonRefusal` (`NO_REASON`, `BAD_REASON`), `basisUnreadable`, `#evidenceRefusal` (`NO_SUCH_EVIDENCE`), `#participantRefusal` (`NOT_A_PARTICIPANT`), and `checkAffected` restructured so `AFFECTED_INDIVIDUAL` and `AFFECTED_UNKNOWN_KIND` each have one site (same order of refusals as before). The guard names no arm C, translation or in-module arm G failure of this module (64 → 49 failures over the tree). Every refusal the R1 test drives is asserted to carry its own row's `check` and `translation`.
- **N296**: each id confirmed against its tests; see the marks below.

**Also, in my own module:** `conformance` defaults to `conformanceOf(host)` (it is merged; a caller building this module on a host without passing `conformance`, as `filings` does, no longer reads every determination as absent). R13: a part's causation inquiry is no longer named to a reader who may not see it, whatever the causation's state (it was only for `established`); a superseded causation's words no longer name the superseding inquiries. The fixture is workerd-shaped (K316: `sql.exec` answers a cursor; K313: a LIKE/GLOB pattern over 50 bytes throws); the module's SQL holds no LIKE or GLOB. Comments that said conformance and content's `passageText` were not merged are corrected.

**Marks for BOB to strike** (met, and tested at the interface): the Status paragraph's "Every requirement is *(not yet met: new module)*" and the `(not yet met: new module)` on each of R1–R14 (15 marks). R1, R10, R13, R14: `record.test.mjs`; R2, R4, R11: `computed.test.mjs`; R3, R5, R6, R12: `assessed.test.mjs`; R7, R8: `reads.test.mjs`; R9: `addressed.test.mjs`.

**For BOB (requirements wording):** R12 says every part answers its causation "`established` … or `unproven`"; with N257 a zero part answers `not_applicable`. Built and tested on the reading that R12 holds with that third answer for a zero measure only (a zero part claims no harm, so none is assumed); R12's words want the case added.

**Found in other modules and artifacts:**
1. **promotion** (R34): C-114 rows changed: `where` of .1, .3, .12, .13, .14, .15, .16, .17 (now the helpers named above); translation of .3 (it also covers an addressed record), .10, .12 (it also covers an assessment's rests-on) and .17. `CATALOG_VERSION` needs its stamp.
2. **legacy-tests** (the DEC-49 guard's ratchets, re-pinned on the merged tree): my helpers lower arm C's measures: codes compared 876 → 864 (floor 866), return-position outcomes 261 → 259 (floor 261), refusals judged 855 → 843 (floor 842), governed sites 486 → 489 (floor 485); arm G's multi-site count 78 → 73.
3. **Cross-module arm G, still failing, not my entries (K275, N217):** `NO_SUCH_DETERMINATION` (conformance, consequences, escalation: conformance's condition; its `refuseNoSuchDetermination` is not exported, so conformance should provide it and hold the one row); `NOT_NONCOMPLIANT` (consequences, escalation: the same condition, so by K275 the earliest module, consequences, would provide the helper, which needs a Provides line); `NOT_A_PARTICIPANT` (conformance, consequences, escalation, membership's own; the conditions differ, so each wants a code of its own); `ALREADY_SUPERSEDED` (conformance's determination, this module's part: different conditions, one wants renaming).
4. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`) is stale against `src/consequences/`; not rebuilt (mechanics §14).
5. `test/refusal-wire.test.mjs` fails identically before and after this change (0/1 on the base; only the line numbers of consequences' two machine fences move in its print): legacy-tests'.

**Deferred:** nothing of my entries.

**Tests and checks:**
- `node --test bio-plane/test/m/consequences/`: tests 24, pass 24, fail 0, todo 0.
- Users of the module: `test/m/filings/` 33/0, `test/m/escalation/` 28/0, `test/m/actions/` 30/0. Layer tests: none (manifest).
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures. `architecture.mjs … consequences`: 0 failures. `coverage.mjs … consequences`: 14 of 14 live requirement ids named by a test; 0 failures. `ownership.mjs … consequences tranche/T11`: 8 files changed; 0 failures.
- `civicos-ui/check-refusal-codes.mjs`: 49 failures (64 before), none of them this module's own; the four cross-module ones above name it.

Size (session_014niSbgTxMSArkDJwhCLLE4): test runs 14, module lines 1034

## J1 · COMPLETE

Job complete (record § Completion, pushed). N257: a zero measure (value 0 or range [0,0], computed or assessed) answers causation not_applicable; consequencesOf and addressed do not count it unproven, so an addressed no-consequence part reads addressed (tested; the literal K249 (3) arm replaced). N297: two translations lengthened (C-114.10, .17); every code minted at one site, its row's where naming the helper (K231); the guard names no arm C, translation or in-module arm G failure of consequences (64 -> 49 over the tree). N296: all 15 not-yet-met marks hold (R1-R14 and the Status sentence), listed with their tests for you to strike. Also: conformance defaults to conformanceOf(host); an unseen causation inquiry is never named (R13); fixture workerd-shaped (K313, K316). For BOB: R12's wording lacks N257's not_applicable; C-114 rows changed (where of .1 .3 .12-.17, translations .3 .10 .12 .17) for promotion R34's stamp; legacy-tests re-pins the guard (codesChecked 864 < 866, return outcomes 259 < 261); cross-module arm G left (NO_SUCH_DETERMINATION conformance's helper, NOT_NONCOMPLIANT with escalation, NOT_A_PARTICIPANT, ALREADY_SUPERSEDED with conformance; K275/N217); plane bundle stale. Tests 24/0; filings 33/0, escalation 28/0, actions 30/0; format, architecture, coverage (14/14), ownership: 0 failures.
