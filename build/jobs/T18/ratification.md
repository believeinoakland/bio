# ratification (T18)

**Status** · session_014e4Qm4LmSVt6paxgY9qkJD · depth 2 · WORKING · handled B1

## Progress (RATIFICATION #9)

Entries (plan layer 8, ratification; B1):
- [x] N400: `Store.release` and `RELEASE_ACK_MAX` extracted to `src/ratification/release.mjs` (with its own copies of `#appendStateHistory` and `#setScalar`, which `retire` keeps in the store); the store's op-map entry deleted and `release` added to `ratificationOps` (the store already spreads them; nothing new in `dispatch.mjs`). R20–R27 tested in `test/m/ratification/release.test.mjs` (converted from `release.test.mjs`, left in place, K619). Rows C-32.1, C-33.10–.12 and C-102.10 copied into `checks.mjs` (`RELEASE_CHECKS`, `RATIFY_REGISTRATION_CHECKS`), each `awaiting stamp`; the catalogue's copies stay for T19 (rule (3)).
- [x] K674 (4): `refuse-gate`'s release arm converted (R21, R27 test: a query selection swapped at a constant count is SET_MOVED and moves nothing; a fresh one releases).

## J1 · QUESTION

Two points; I am carrying on with my best reading of each.

1. N417 (the ratify gate through promotion's instance). `op=ratify`'s gate runs in the Worker (`ratification/ops.mjs` `ratifyOp`), which holds no host: `promotionOf(host).runGate` reads `record.grammars()`, and the grammars (capture's C-2.7) are registered on the store's host at the Durable Object. A Worker-side `promotionOf(...)` would see none, so the entry cannot be met where the call stands today. Best reading: move the gate call into the store half, as `op=caseratify`'s gate already is (K233): a store-half op `ratifygate` in `ratificationOps` runs `promotionOf(host).runGate` over the image with the gate facts, `hasCapture` answered in-process through record-core's `evidenceStore()` (its R38), provenance's `partsHeld` and the `registerholds` read; the Worker keeps the fences, the signature, the case-member, register and bias arms, the commit and the copy, and relays `ratifygate` by R17 (the `registerholds` relay becomes in-process, so R17's relay list changes from registerholds to ratifygate; its tests follow). This changes no requirement's meaning (R4: "GATE_REFUSED from promotion.runGate"). If you would rather it wait for T19 (nothing is lost this tranche: the catalogue's built-in C-2.7 still runs at the ratify gate, PROMOTION #19 J2), say so and I leave `ops.mjs` as it is.

2. T17's finding: `CASE_ROLES_DIVERGED` is emitted by nothing. It has no catalogue row anywhere (none in the catalogue or any module's table), and its only mention in code is `ratifyOp`'s list of commit refusals answered 409, beside four more `publication.commitEdition` no longer emits since CASE-5b (`CASE_MEMBERSHIP_DIVERGED`, `CASE_NAMES_NO_PROJECT`, `CASE_ROSTER_EXCLUDES_SELF`; and `CASE_PRODUCTION_DIVERGED`, which only the case commit answers). Best reading: retired by ruling (K6: no row to delete; it went with the format, publication/index.mjs:628); I drop the five dead codes from that list in `ops.mjs` (my own code; no answer changes, since none can arrive).
- [x] N211: `checks.test.mjs`' parity arms re-pointed (the catalogue no longer exports either; `isCaseMemberBytes`' parity kept, Decided 6); `store.mjs`' unused `SUBJECT_POSITIONS` import deleted (with its orphaned comment); ✱ `SUBJECT_POSITIONS` and `caseEditionClaimed` deleted from the catalogue (80 lines; no product importer: affordances and case-authoring read ratification's; `test/publish.test.mjs`, an old suite, loses its import and stays unrun, K653).
- [x] T17's findings: (1) `CASE_ROLES_DIVERGED` emitted by nothing: J1 QUESTION (2); on my best reading the five dead codes left `ratifyOp`'s 409 list. (2) the fixtures now gate `/5` documents (`cleanCase`, `caseMd`, `checks.test.mjs`' `doc()`), with a `/4` arm kept.
- [ ] N417: J1 QUESTION (1) — the ratify gate runs in the Worker, which holds no host whose `record.grammars()` it could read.
- [x] K649: `checks.mjs`' `STRENGTH_STATES` re-pointed to `strength` (the architecture check fails until `strength` is in ratification's `uses`: REPORT J2); `ops.mjs`' `userAgent` re-pointed to `acquisition`.
- [x] N407 (K649 (4)): R18's pre-flight reads a viewer `{stamp, aiCred}`; an agent credential holds C-32.13 and C-32.15 whatever its stamp (tested with a stub viewer; admission stamps it in layer 11).
- [x] legacy-index map §4.4: `src/index.mjs`' `caseratify` and `ratify` dispatch lines replaced by one call to `ratificationOp` (`ops.mjs`), the context both handlers read handed in (2 lines added, 3 removed there). `assembleCaseContainer` still handed in by the door until public-read merges (its re-point waits for BOB's CHANGE, with `ratify-op.test.mjs`:210–211's).

## J2 · REPORT

Two things for you, each needing an edit only you make.

1. `uses` edge: the plan's K649 addition re-points `ratification/checks.mjs`' `STRENGTH_STATES` to `strength`, which is not in ratification's `uses` (`modules.json`) or its requirements' Uses. The re-point is pushed (93c1acda9e); `node checks/architecture.mjs bio ratification` fails on it ("imports ... strength, which ratification does not declare in uses") until you add `strength` (layer 6) to both. Proposed Uses line: "- `strength`: `STRENGTH_STATES` (R9, C-2.8's frozen-axis states)."

2. N407's shape, for admission (layer 11) and a wording for R18: the pre-flight now reads a viewer that is either the control plane's stamp (as today) or `{stamp, aiCred}`; a viewer carrying `aiCred` (a minted agent credential) holds C-32.13 and C-32.15, each byte-identical to the act's own for class `ai`, whatever its stamp. Proposed R18 addition after the fences: "a viewer carrying a minted agent credential (`{stamp, aiCred}`, admission's stamp) holds both, whatever its stamp (N407)." Tested with a stub viewer (`preflight.test.mjs`, "R18 (N407)").

Also, for the record: the bulk release (N400) is extracted and pushed (5ad5eca9f2), R20–R27 tested (`release.test.mjs`, 16 tests, the refuse-gate release arm among them, K674 (4)). One flaw fixed in doing it: R22's crucial class read only `bundles.criticality`, which promotion writes from the envelope and never from the bytes, so a document whose own front matter says `criticality: crucial` under an envelope that did not could ride a batch (R27). It now counts as crucial when the column or the document says so (tested). The envelope-only column is promotion's (R39's `meta`); I report it, not change it.
