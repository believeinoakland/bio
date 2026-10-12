# record-grammar (T46)

**Status** · session_01WTxZEji9hScnnv3kyz3xtf · depth 2 · RUNNING until 2026-10-12T04:17:30Z (every module's tests under bio-plane/test/m, per module) · handled B0

## Completion (RECORD-GRAMMAR #15)

**Reading set** (mechanics §17): measured at START at 321 KB, under 600 KB; read whole myself: `build/requirements/record-grammar.md`; layer 1's row and contract in `build/layers.md` (with its Helper modules note); the plan's entry T46-1, its L1 merge order and its rules at the opening (rule 5 as at my START); every file of `bio-plane/src/record-grammar/` (all 15) and of `bio-plane/test/m/record-grammar/` (all 10 test files and `fixtures/bundles.mjs`; `fixtures/expected.json`'s data excepted, K2053), not only what I changed (P20). For the entries' meaning: N910, N911, N912, N914 in `plan/next.md`, and escalation R31, action-plans R40, consequences R17, action-replies R1 and R4. No Uses (first in the order).

**Entries applied** (T46-1; commit 4b27eb2db4).
- R57 (N910; `document.mjs`): `STATES.escalation` legal `open suspended ended stopped_pursuing`; `open` → `suspended ended stopped_pursuing`; `suspended` → `open ended stopped_pursuing`; `stopped_pursuing` → `open`; `ended` none. Every earlier state and edge kept; `legal[0]` still `open`.
- R58 (N914; `document.mjs`): `STATES.action_plan` legal `open paused closed`; `open` → `paused closed`; `paused` → `open closed`; `closed` none. `goal` unchanged (`open` → `closed`).
- R59 (N911; `ids.mjs`, `types.mjs`, `document.mjs`, `index.mjs`): `ID_TABLE` gains `SUC` (owner `consequences`, sequential), last; `OBJECT_TYPES.SUC = 'success_record'`; `STATES.success_record` legal `recorded`, no edge; `isSuccessRecordId(v)` (a string matching `idPattern('SUC')`, never throws), exported from the entry. `SUC` is not a bundle prefix: R1's patterns, `HEADINGS`, `checkBundle`'s types and schemas unchanged (the bundle check reads only R1's prefixes' types, so `success_record` is still an unknown bundle type there). Every `SUC-<year>-<4 digits>` id consequences has minted stays valid.
- R60 (N912; `labels.mjs`): `PROPOSAL_STATES` gains `bearing` after `account_check`, frozen, three sentences: a proposed reading of how a reply bears on each claim of an action, never the group's reading until a member records it; machine work labelled as machine work, which can propose a layout and never record one. The `RangeError` names the sixteen subjects. The fifteen earlier tables are byte-identical (digest over their canonical JSON, taken from the committed module at START, pinned in the test).

**Flaws found and fixed in this module (P8).**
- R36: `sectionText` sliced an array or a `String` object as if it were text (they have `indexOf` and `slice`); it now throws a `TypeError` for every non-string body, as R36 says.
- R31: `inquiryQuestionOf` took any white space but a newline after `## Question` (form feed, vertical tab, no-break and other Unicode spaces); it now takes spaces or tabs only, then the line break, `\n` or `\r\n`. My reading: the CR of a CRLF line ending is part of the break, not trailing content (a CRLF document's question is read as before).

**Tests.** `ids-types.test.mjs`: R59 (the `SUC` row pinned and last, the type, the machine, no bundle prefix and no headings, the ids since T45 and the 10,000th accepted, controls refused) and R59 `isSuccessRecordId` (against `idPattern('SUC')` over every prefix's ids; controls: `CONS-`, `HYP-`, a short counter, an opaque tail, a slug, every non-string); the R3 and R46 pins gain `SUC`; R55's "after T41's rows" now pins ACD's place after `STP`, `GUD` rather than last. `document.test.mjs`: the R35 pin gains R57–R59; R57 and R58 each by name with controls (no edge from `stopped_pursuing` to `ended`; nothing leaves `ended` or `closed`; `goal` unchanged); R36 non-string bodies and R31 trailing characters, each with controls. `labels.test.mjs`: R60 (place, frozen, sentences, every identity through `proposalLabel`, the fifteen earlier tables' digest) and R60's negative control (near spellings); the earlier tests' "fifteen" pins become sixteen where R60 amends them (R38 subject list, R54's count and RangeError list), their unchanged-digests now excluding `bearing` too. `invariants.test.mjs`: `isSuccessRecordId` in the one-binding list; the purity battery reads the new machines and the `bearing` label. Every new test fails on the module as it was at START and passes now.

**Ran.**
- `node --test bio-plane/test/m/record-grammar/`: tests 95, pass 95, fail 0. No layer tests named in the manifest.
- Users' suites: every module under `bio-plane/test/m`, run per module on my branch: tests 10677, pass 10648, fail 14, cancelled 0, skipped 1, todo 14. The 11 files holding the 14 re-run with `bio-plane/src/record-grammar` as on `origin/tranche/T46` (my change taken out, then restored): 12 of the 14 red identically there.
  - **Mine, in another module's test (REPORT):** escalation `invariants.test.mjs:272` ("R21 an escalation is a record object …") pins `STATES.escalation.legal` as `["open", "suspended", "ended"]`; R57 adds `stopped_pursuing`, so it is red from my merge until escalation's L9 job (T46, R31) re-pins it. Green on the tranche without me. I cannot keep it green without changing another module.
  - **Generated artifacts staled (§14; not mine to write):** case-checker `program.test.mjs:19` (`program.mjs`; rule 5.4); the plane bundle (rule 5.4); and, not in rule 5.4, **agent-worker's bundle** (its input `record-grammar/ids.mjs` changed: `fleetbundles.test.mjs` "agent-worker: no staleness …" STALE BUNDLE) and **newgroup's bundle** (its input `record-grammar/document.mjs`: `newgroup-bundle-fresh.test.mjs` red). All regenerate with `node bio-plane/scripts/bundles.mjs` and newgroup's build at layer close.
  - **Red on the tranche without me (the accepted reds of rule 5):** affordances `t36.test.mjs:56` (5.7); control-plane `r48-routes.test.mjs:52`, `totality.test.mjs:17` (5.8); membership `module-order.test.mjs:13`, `:123`, `:190`, `t9-notice-sight-bounds.test.mjs:161` (5.6); op-declarations `t34.test.mjs:148`, `:329`, `t37.test.mjs:180`, `t38.test.mjs:76` (5.7); promotion `registry.test.mjs:64` (modules.json order, as membership's 5.6, from the opening's act).
- Checks: `format` 0 failures (159 modules); `architecture record-grammar` 0 failures; `coverage record-grammar` 58 of 58, 0 failures; `ownership record-grammar tranche/T46` 11 files, 0 failures.

**Deferred.** None.

**Found in other modules.**
- `escalation`: `invariants.test.mjs:272` pins the pre-R57 legal set (above); its L9 job's R31 re-pins it.
- `action-plans`, `consequences`, `action-replies`: the services R58, R59 and R60 provide are in place for their L9 jobs (R40's `paused` as `current_state`; R17's promotion to `success_record` with `isSuccessRecordId`; R1's `proposalLabel(_, "bearing")`).
- Generated artifacts staled: agent-worker's and newgroup's bundles (not named in rule 5.4), the plane bundle and `program.mjs` (named).

Size (session_01WTxZEji9hScnnv3kyz3xtf): test runs 9, module lines 2583
