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
