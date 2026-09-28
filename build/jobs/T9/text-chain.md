# text-chain (T9)

**Status** · session_01LkjS5fE3osSrYaAkNn6uqe · depth 2 · COMPLETE · handled B2

## Completion (TEXT-CHAIN #2)

**Entries applied** (plan layer 1, the text-chain bullet), under the ids proposed in J1 (Q1), which BOB words into the requirements:
- **N98** (D-670, built on `land/worker/D-670`, judged and rebuilt inside the module): `RECT_USER_SPACE` and `rectSpace(holder)` exported (R87); `readingSource`'s `pdf-page` arm carries a non-user `space` beside a valid rect, `"user"` and unstated give the same bytes, and an unreadable space drops the rect as a malformed rect does (R87; the branch took any value through `String`, here only a non-empty string is a space); `extentCovers` (R88) and `readingPositionInExtent` (R89) answer no across spaces or on an unreadable one. The branch imported `extentSpace` from the catalogue, where it is not (content holds it, layer 4), so text-chain holds the rule itself.
- **N102** (D-665/D-697): `mergeTier2Text` carries each of the base page's `image_unread` markers onto a page tier 2 won, after tier 2's own, unless tier 2 states the same one (reason and rect); base order kept beside the `image_content_*` carry (R90).
- **N104** (K143): `ocr` and `ai` declare `machine: true` in `STEP_KINDS`; `MACHINE_READ_KINDS` (frozen, derived from the declaration, `["ocr", "ai"]`) exported for query-language to re-export (R91).

**Deferred:** none.

**Found in other modules** (REPORT J2): content's `extentSpace` duplicates `rectSpace`; extraction's `carryImageUnread` is now a no-op after the merge; query-language re-exports `MACHINE_READ_KINDS`; connections' factory test red on the baseline (capture R58); two generated bundles stale; R72's wording.

**Tests and checks run:**
- `node --test test/m/text-chain/`: tests 93, pass 93, fail 0. Negative control: the new tests against the module before this job: pass 46, fail 3 (chain and space suites fail to load for the missing exports, R90 fails).
- Users' suites (a provided service changed): extraction 65/0, content 50/0, observation-log 42/0, query-language 24/0, inquiry 50/0, basis-versions 42/0, run-productions 33/0, `ocr-worker/test/` 1/0; connections 59 pass, 1 fail, the same failure on the module before this job (not text-chain's, J2).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs … text-chain`: 6 product files, 9 relative imports; 0 failures. `checks/coverage.mjs … text-chain`: 86 of 86 live requirement ids named by a test; 0 failures (R87–R91 are named by tests and join the count once worded). `checks/ownership.mjs … text-chain tranche/T9`: 0 failures.

B2 (K278) applied: `tranche/T9` merged, R87–R91 worded as proposed and R72's stale text struck; no code change. Re-run: `test/m/text-chain/`: tests 93, pass 93, fail 0. `format`: 0 failures. `architecture … text-chain`: 7 product files, 11 relative imports; 0 failures. `coverage … text-chain`: 91 of 91 live requirement ids named by a test; 0 failures. `ownership … text-chain tranche/T9`: 5 files; 0 failures.

Size (session_01LkjS5fE3osSrYaAkNn6uqe): test runs 10, module lines 1692

## J1 · QUESTION

Q1 · the requirement ids for my three entries. `build/requirements/text-chain.md` states none of N98, N102, N104 yet, and it is not mine to write. My best reading, which I am building and testing under these ids (renumber freely; I will follow):

- **R87** (N98, D-670) `RECT_USER_SPACE` (`"user"`) and `rectSpace(holder) → string | null` in Provides: a holder's `.space` absent or `null` reads as `"user"`; a non-empty string is that space; anything else is `null` (unreadable, comparable to nothing). `readingSource`'s `pdf-page` arm carries `space` (truncated to 40) beside a valid rect only when it is not user space, so an explicit `"user"` and the unstated spelling give the same bytes (R66, R67 unchanged for every position written before D-670); a rect with an unreadable space drops to `null`, as a malformed rect does (R62). `readingSourceJson`, `readingOccurrenceKey` and `readingSourceFromColumns` carry it through.
- **R88** (N98) `extentCovers`: a `region` extent covers a target only when `rectSpace(extent.source)` equals `rectSpace(target)`, neither `null` (added to R54's conditions; the default stays no).
- **R89** (N98) `readingPositionInExtent`, `pdf-page` with a rect on both sides: `false` unless both rects are in the same readable space (added to R71's `pdf-page` rule).
- **R90** (N102, D-665/D-697) `mergeTier2Text`: when tier 2 wins a page, each of the base page's `image_unread` markers is carried onto the merged page after tier 2's own, unless tier 2 states one with the same `reason` and `rect`; it counts 0 undetermined characters so no award moves (R77's family; extraction's `carryImageUnread` becomes a no-op on the merge's output).
- **R91** (N104, K143) each `STEP_KINDS` entry that is a machine reading declares `machine: true` (`ocr`, `ai`), and no other; `MACHINE_READ_KINDS` in Provides is the frozen array of those keys in `STEP_KINDS` order (`["ocr", "ai"]`), which query-language re-exports.

Also, wording only: R72 still says "Today R71's equal-kind rule answers false" and "built but not merged", but it is met and tested (T2); the Status line says the same.

`rectSpace` duplicates content's `extentSpace` (content/extent.mjs), except that a non-string space is unreadable here rather than `String(v)`; content uses text-chain, so it could read mine (a report, not my change).

## J2 · REPORT

Found in other modules while applying N98, N102, N104:

1. **content** (one reader of one fact): `extentSpace`/`EXTENT_USER_SPACE` in `src/content/extent.mjs` state the rule text-chain now provides as `rectSpace`/`RECT_USER_SPACE` (R87). Content uses text-chain, so it can read mine. One difference to settle: content reads any non-null `space` through `String(v)`, text-chain reads a non-string or empty space as unreadable (comparable to nothing).
2. **extraction** (efficiency): `carryImageUnread` in `src/extraction/pipeline.mjs` (D-697, its R9) is now a no-op on `mergeTier2Text`'s output, which carries `image_unread` itself (R90) with the same reason-and-rect dedupe. Extraction can drop it and read R90; its suite is green either way (65/0).
3. **query-language** (N104's other share): `MACHINE_READ_KINDS` in `src/query.mjs` can re-export text-chain's (same value, `["ocr", "ai"]`, frozen).
4. **connections / capture** (red on the baseline, not text-chain's): `test/m/connections/factory.test.mjs` "R24, R18, K155 …" fails with capture's R58 refusal from `captureOf` (a second `env` for one storage). Same result with text-chain before this job.
5. **Generated artifacts stale** (manifest §14): `bio-plane/dist/bio-plane.bundled.mjs` and `agent-worker/dist/agent-worker.bundled.mjs` include `src/textchain.mjs`. Not rebuilt; for the layer close.
6. **text-chain requirements** (wording): R72 still reads as not met ("Today R71's equal-kind rule answers false", "built but not merged"); it is met and tested.

## J3 · COMPLETE

Every entry applied (N98, N102, N104) under J1's proposed ids R87–R91; record's Completion section has the tests and checks. 93/93 text-chain tests; users' suites green except connections' baseline failure (J2). Q1 still open: say if you renumber and I will follow.

## J4 · COMPLETE

B2 (K278) applied: tranche/T9 merged; R87–R91 tested at the interface. text-chain 93/93; coverage 91 of 91 live ids; format, architecture, ownership 0 failures.
