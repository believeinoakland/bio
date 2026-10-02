# affordances (T24)

**Status** · session_016oZC5sJyfvVMQZwh1cyyE1 · depth 2 · RUNNING until 2026-10-02T16:56:41Z (node --test bio-plane/test/m) · handled B1

## Completion

**Entries applied** (B1 START; `build/plan/current.md` T24 L11):
- **N490** (R7's rule; action-plans R37, DEC-115): `NON_ACTS.optionstartpreview`, "read: what starting a chosen option would do at this instant, keyed by (plan, option) — the action it would compose, the reminders it would set, and whether it would start or the refusal it would answer; allocates no id, sets no reminder and writes nothing". No requirement changed (K1134 (7)). The K727 comment on action-plans' reads now says the preview is the one that carries a `NEEDS` row. Test: `catalogue.test.mjs`'s layer-9 test (R3 R7 R12) holds the 62 ops of the layer-9 op maps, the preview as a gated read with a `read:` reason ending "writes nothing", no rung, no act; negative controls: carried by no row or ungated it reads `stale`, and an ungated plan read carried gated reads `unpublished`. Run without the entry, that test fails (checked). Red 6's affordances share is cleared.
- **N502/N508 re-scan** of the module and its tests, re-worded: `affordances.mjs` `Store.VERSION_ACT_TO` → `basis-versions`' `VERSION_ACT_TO`; escalation's op names "legacy-index's" → its own `escalationOps` (R25); the REC-35 paragraph on `store.mjs` put in the past tense and marked history; `catalogue.test.mjs` "as legacy-index's K263 routes them" → "as op-declarations declares them"; `plane.test.mjs`:21 no longer names `src/index.mjs` as live, and the R19 test's title no longer says intent's ops wait for the control plane to admit them (op-declarations declares them). No `awaiting stamp` note in the module.
- **R32 test after N506:** `sweeps` left monitoring's op map for link-sweep's (T24 L10), so the R32 test no longer asserts it in `monitoringOps`; link-sweep is not in this module's uses, so the op is named as R32 names it (its NON_ACTS reason and its stale/gated controls stay).

**Deferred:** none.

**Found in other modules:**
- **Plane bundle stale:** `bio-plane/src/affordances.mjs` is an input of `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`); nothing regenerated.
- **op-declarations (red 6's other share):** with `NON_ACTS.optionstartpreview` present, control-plane `totality.test.mjs`:13 answers `stale: ['optionstartpreview']` over the real door table until op-declarations declares the op with a `NEEDS` row (gated as `optionstart`, stamped `author` and `viewer`; action-plans R37's note).
- **Uses:** if BOB wants R32's test to check `sweeps` in its owner's op map again, `link-sweep` would join this module's uses (layer 10, earlier in the order).

**Tests and checks:**
- `node --test bio-plane/test/m/affordances/`: tests 147, pass 147, fail 0 (before: 145 pass, 2 fail, `catalogue.test.mjs`:524 and :903).
- Whole `bio-plane/test/m`: tests 5275, pass 5257, fail 7: control-plane `families.test.mjs`:47, `r45-routes.test.mjs`:68, plane `compose.test.mjs`:101, `door.test.mjs`:183, `notices.test.mjs`:140 (red 7) and `notices.test.mjs`:33 (red 9) — the same six SCHEDULER #26 recorded on `tranche/T24` — and control-plane `totality.test.mjs`:13 (red 6, op-declarations' share, above). No red beyond those named.
- Checks: format, 88 modules, 87 requirements files, 0 failures. Architecture, 13 product files, 135 relative imports, 0 failures. Coverage, 32 of 32 live requirement ids named by a test, 0 failures. Ownership: 0 failures.
- Red 5: no catalogue row added or changed, so none `awaiting stamp`.

Size (session_016oZC5sJyfvVMQZwh1cyyE1): test runs 4, module lines 68

## J1 · COMPLETE

COMPLETE. N490 applied: NON_ACTS.optionstartpreview, a 'read: …' reason (R7's rule; no requirement changed), tested in catalogue.test.mjs's layer-9 test with negative controls; red 6's affordances share cleared. N502/N508 re-scan: five stale notes re-worded (list in the record). R32's test no longer asserts sweeps in monitoringOps (moved to link-sweep by N506; link-sweep is not in my uses). Affordances suite 147/147. Whole test/m: 5257 pass, 7 fail: the six reds 7 and 9 SCHEDULER #26 recorded, plus control-plane totality.test.mjs:13, stale ['optionstartpreview'] until op-declarations gives it a NEEDS row (red 6, op-declarations' share). All four checks 0 failures. No catalogue row changed (red 5: none). Report: the plane's bundle is stale (affordances.mjs is an input); nothing regenerated. Please merge job/T24/affordances.
