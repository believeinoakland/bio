# action-clocks (T22)

**Status** · session_01Vhi9tLSEX7yiZfPiG1CwhD · depth 2 · WAITING ON BOB (J3) · handled B3

ACTION-CLOCKS #5, T22 layer 9. Started from `tranche/T22` @ f75a1d2162 (fast-forward of `job/T22/action-clocks`).

## Entries applied

- **R12 (N474, D6; K998, K1038).** `factReader(localFacts, viewer)` is exported from `bio-plane/src/action-clocks/index.mjs`, made from the private `holidayFact` and `factAnswer`; the class's `#factOf(viewer)` is now `factReader(this.localFacts, viewer)`, one reader, not two. Settled, not papered over: an instance whose local-facts cannot be created or has no `factStatus` no longer reads every entry `absent` (the count undetermined); the reader is null and the count states its calendar `not_read` and counts, as R12 says. None of my R2, R10 or R11 tests pinned the old answer, so no QUESTION was needed. The reader never throws: an entry naming no local fact (`factPath` null, or `holidayFact` throwing on a non-object) is `absent` "the holiday entry names no local fact"; a `factStatus` that throws is `absent` "local facts' read failed: <message>"; a refusal (`ok: false`) is `absent` "local facts refused the read: <reason>"; no answer is `absent` "local facts did not answer"; a status outside local-facts' `LOCAL_FACT_STATUSES` (its R7), or an answer whose fields throw when read, is `absent` with why. An accessor `factStatus` that throws is read as none (null). Writes nothing.
- **Re-scan (N469, N471, N480).** No note in my paths names a T20-deleted file, `tools/`, `legacy-tests` or the deleted plane `index.mjs` as live. One stale name fixed: `test/m/action-clocks/fixture.mjs` registered the `producingGroup` stand-in under the retired `legacy-store`; it now names its owner `instance-setup` (instance-setup R1, promotion R40), as bias's fixture does. No row changes.

## Deferred

None.

## Found in other modules (REPORT J1)

1. Stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`), from my change under `bio-plane/src/action-clocks/index.mjs`; regenerate at the layer close (not regenerated here).
2. Requirements wording, for BOB: `factAnswer` now reads local-facts' `LOCAL_FACT_STATUSES` (local-facts R7, which names action-clocks among its readers) to judge "an answer local-facts cannot give"; action-clocks' Uses line names only `factStatus` (R2) and `factPath` (R6). The module edge is already there; only the Uses wording lacks R7.
3. The same stale `"legacy-store"` registration of `producingGroup` stands in other modules' fixtures (`test/m/{action-plans,monitoring,case-authoring,capture-requests,actions,content,retrieval,standards}/fixture.mjs`, `test/m/tasks/grammar.test.mjs`:30): test-only, harmless, each owner's to re-word.

## Tests and checks

- `node --test test/m/action-clocks/`: 32 pass, 0 fail. R12 is named by five tests in `factreader.test.mjs` over the real `local-facts` (`localFactsOf`, the fixture's): an unconfirmed, a confirmed, a corrected (its value, `says`, member and day) and a disputed entry, each answered as R10's count reads it, and writes nothing; a lapsed confirmation; negative controls (an entry naming no local fact, a throwing, a refusing or a silent `factStatus`, an unknown status, a throwing answer: each `absent` with why, nothing thrown); `localFacts` without `factStatus` answers null and the count states `not_read` (also through `clockPropose` on an instance whose local-facts lacks it); one reader (the same count through `factReader` and through `clockPropose` answers alike at every status).
- Users: filings 58/0, action-plans 43/0, monitoring 73/0, affordances 138/0, escalation 38/0; queue-producers 45/4 (`proposals.test.mjs`, the 4 accepted, L11), control-plane 100/2 (`doorbell.test.mjs`:310, `catalogue-end.test.mjs`:15, accepted, L11); the same counts with my change stashed.
- Whole `bio-plane/test/m`: 4931 tests, 4902 pass, 11 fail, 18 todo (other modules' long-standing), 0 skipped. Every red accepted by name: actions `t18.test.mjs`:299; control-plane `catalogue-end.test.mjs`:15, `doorbell.test.mjs`:310; accepted red 4 (membership `module-order.test.mjs`:12, `t9-notice-sight-bounds.test.mjs`:185, promotion `registry.test.mjs`:58); queue-producers `proposals.test.mjs` (4); scheduler `plane.test.mjs`:85. No new red.
- `format`: 86 modules, 85 requirements files; 0 failures. `architecture action-clocks`: 8 product files, 36 relative imports; 0 failures. `coverage action-clocks`: 12 of 12 live requirement ids named by a test; 0 failures. `ownership action-clocks tranche/T22`: 0 failures.

Size (session_01Vhi9tLSEX7yiZfPiG1CwhD): test runs 14, module lines 884

## J1 · REPORT

Found in other modules (record, 'Found in other modules'): (1) Stale generated artifact: bio-plane/dist/bio-plane.bundled.mjs (not_product), from my change under bio-plane/src/action-clocks/index.mjs; regenerate at the layer close. (2) Requirements wording: factAnswer now reads local-facts' LOCAL_FACT_STATUSES (local-facts R7, which names action-clocks) to judge 'an answer local-facts cannot give'; my Uses names only factStatus (R2) and factPath (R6). The edge exists; only the Uses wording lacks R7. (3) Other modules' fixtures still register the producingGroup stand-in under the retired 'legacy-store' (action-plans, monitoring, case-authoring, capture-requests, actions, content, retrieval, standards fixture.mjs; tasks grammar.test.mjs:30): test-only, harmless, each owner's to re-word. I re-worded mine to instance-setup.

## J2 · COMPLETE

B1 applied. R12 met: factReader(localFacts, viewer) exported from bio-plane/src/action-clocks/index.mjs, made from holidayFact and factAnswer; #factOf(viewer) is now factReader(this.localFacts, viewer), one reader. Without factStatus the reader is null and the count states its calendar not_read and counts (the old all-absent answer is gone; no R2/R10/R11 test pinned it, so no QUESTION). Never throws: an entry naming no local fact, a factStatus that throws, refuses or answers nothing, a status outside LOCAL_FACT_STATUSES, or an answer whose fields throw are each absent with why. Tests: factreader.test.mjs, 5 'R12' tests over the real local-facts (unconfirmed, confirmed, corrected with value, says, member and day, disputed, lapsed; the negative controls; null and not_read, also through clockPropose; one reader, the same through factReader and clockPropose at every status). Re-scan (N469, N471, N480): nothing live in my paths; my fixture's producingGroup stand-in re-pointed from legacy-store to instance-setup. No row changes. action-clocks 32/0; filings 58/0, action-plans 43/0, monitoring 73/0, affordances 138/0, escalation 38/0, queue-producers 45/4 and control-plane 100/2 (accepted, the same with my change stashed). Whole test/m: 4902 pass, 11 fail, 18 todo, every red accepted by name (actions t18:299; control-plane catalogue-end:15, doorbell:310; accepted red 4 x3; queue-producers proposals x4; scheduler plane:85), no new red. format, architecture, coverage (12/12), ownership: 0 failures. Deferred: none. Stale: the plane's bundle (REPORT J1). Ready to merge first in L9; filings may import factReader. Record: build/jobs/T22/action-clocks.md.

## J3 · QUESTION

B2 done but one check fails: the architecture check refuses my fixture's import of bio-plane/src/provenance/index.mjs, because action-clocks' uses (build/modules.json) does not name provenance. My best reading: add provenance (layer 3, earlier in the order) to action-clocks' uses in modules.json, a test-fixture edge only (no product file of mine imports it); actions' fixture does the same. Proof so far: on a scratch merge of origin/job/T22/actions, my old fixture gives 2 pass, 30 fail ('no such column: authored'); with the fix, 32/0. On my branch, 32/0. format and coverage (12/12): 0 failures; architecture: 1 failure, this import. B3 merged (tranche/T22 @ 9e3c197c15 and on). If you would rather I avoid the edge, name the route (e.g. a provenance schema export through a module I already use) and I will take it. Pushed: job/T22/action-clocks.
