# file-safety (T47)

**Status** · session_01SVm2D1MtCDCXBehFW6dBUB · depth 2 · COMPLETE · handled B3

## Completion (FILE-SAFETY #8)

**Entries applied** · T47-12, all of it:
- **R43** (N941, K231): `renderBatch` reads both queues (the files queued to render and the safe copies queued) before rendering anything, in a new region `is-render-queue-readable`; an unreadable queue answers `RENDER_QUEUE_UNREADABLE` with its new row C-140.43 (`where` renderBatch > is-render-queue-readable, members' words), renders, copies and counts nothing, and answers no count. `RENDERER_ABSENT` keeps its one condition, no renderer bound (region `is-renderer-bound`, the binding test only). A fault once rendering began answers the same code with `rendered` and `copies_made` as numbers (J1 (2), confirmed B3).
- **R39** (K3063, amended on BOB's B3): `renderWake` answers the last `renderBatch` plus `FILE_SAFETY_POLL_MS`, never before now, while the queue cannot be read (the last batch found it so, or the wake's own read fails); still null with no renderer bound.
- **R42a** (K3062, DEC-200 (5); B2 CHANGE): "file scanner" and "safe view" in every text a member reads. C-140.2, C-140.3, C-140.13 and C-140.38 re-worded (codes, numbers and `where`s unmoved; C-140.3 and C-140.38 by J1 (1), confirmed B3), and every R42 detail at the six sites.
- **R44** (N971): `onOwnServers` kept as it was (whole words "the organization", word boundary, J1 (4) confirmed B3), its comment now states R44; R28 and R32 decide by it alone.

**Read** · whole, by me: `build/requirements/file-safety.md` (both parts, and again after each tranche merge); my plan entry and BOB's START notes; `build/layers.md`'s table and its layer-3 sections; all five files of `bio-plane/src/file-safety/`; all eleven files of `bio-plane/test/m/file-safety/`. The used modules' public parts (13 modules, 424 KB, the reading set's excess over 600 KB, K2032) were read whole by a helper given my entry, which wrote a digest citing each section (scratchpad `uses-digest.md`); nothing in it bore on the entry beyond the row conventions (record-core R81, R84; membership R133) and DEC-149's words, both followed.

**Flaws fixed in my module** · the one `catch` around `renderBatch` answered RENDERER_ABSENT for every fault (now R43's code, the binding test alone answering RENDERER_ABSENT); `renderWake` answered null when its own read failed, so an unreadable queue was never woken again (now R39's poll).

**Deferred** · none.

**Found in other modules** (REPORT J2):
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) inlines file-safety's source; regenerated at the layer close (mechanics §14). I did not touch it.
- The row census (`bio-plane/src/gate.mjs`, promotion's stamp) names C-140 through .42 with the old translations of C-140.2, .3, .13, .38: red for those four and the new C-140.43, accepted until T48's stamp (B1, B3).
- `file-scanner`'s Purpose says "safe-copy makers"; if any text of file-scanner reaches a member, R42a's term rule (DEC-200 (5)) would apply there too. Its own requirements, not mine.

**Tests and checks** (on `job/T47/file-safety`)
- `node --test bio-plane/test/m/file-safety/`: before 56 tests (one failing after my row change until R42's control was brought to R42a); after, tests 59, pass 59, fail 0. New tests: R42a (absent.test.mjs), R43 (view.test.mjs), R44 (tools.test.mjs), R39's render clause (wakes.test.mjs); R42's control re-stated for R42a's translations.
- Users' tests (renderWake's answer changed): scheduler 129/0, notice-producers 106/0, setup-page 87/0, store-door 45/0, control-plane 242/0, plane system `migrate-released` 1/0; affordances 243 pass 2 fail, op-declarations 147/9, answer-envelope 32/1, plane 222/1, each the same counts on `origin/tranche/T47` without my change (act registry, project-roster routes, doors' rows), so none is mine.
- `checks/format.mjs`: 0 failures; `architecture.mjs … file-safety`: 0 failures; `coverage.mjs … file-safety`: 44 of 44 live ids named, 0 failures; `ownership.mjs … file-safety tranche/T47`: 0 failures.
- `checks/run.mjs`: format 0, architecture 0 (3063 files), channels 0; coverage 44 failures, none file-safety's (other modules' open ids).

Size (session_01SVm2D1MtCDCXBehFW6dBUB): test runs 12, module lines 4871

## J1 · QUESTION

Four readings I am building on; each is my best reading, so I carry on unless you say otherwise.

1. **R42a reaches two more rows.** "every text a member reads from this module" also covers C-140.3 SCANNER_UNREACHABLE ("The virus scanner your group's Civicsmith uses did not answer …") and C-140.38 SAFE_COPY_WITHHELD ("… found clean by the virus scanner …"). I re-word both to "file scanner", codes, numbers and `where`s unmoved. That widens the accepted row-census red from 2 rows (C-140.2, C-140.13) to 4 (plus C-140.3, C-140.38), on top of the new C-140.43, all for T48's stamp.
2. **R43, a fault after the queue was read.** `renderBatch` reads both queues (views and safe copies) before rendering anything, inside region `is-render-queue-readable`; an unreadable queue answers RENDER_QUEUE_UNREADABLE with no counts. A fault after rendering has begun (say, the bucket refusing a write) can no longer answer RENDERER_ABSENT (R43). It answers RENDER_QUEUE_UNREADABLE with `rendered` and `copies_made` as numbers (what was done), "the rest wait for the next round", as R36's second catch does for DEEPER_CHECKS_UNREADABLE.
3. **R39's render wake while the queue cannot be read.** Today `renderWake` answers null when its own read throws, so nothing wakes `renderBatch` again and C-140.43's "read again on the next round" would not hold. Following R39's deeper rule, it answers the last `renderBatch` plus FILE_SAFETY_POLL_MS (never before now) while the last batch found the queue unreadable or the wake's own read fails; still null with no renderer bound. If you want this in R39's text, it is a one-clause amendment: "and the last `renderBatch` plus `FILE_SAFETY_POLL_MS` while its queue cannot be read".
4. **R44, "begins 'the organization'".** I read this as the whole words: "the organization", "the organization's own …" are true; "the organizational partner's cloud" is false. Code today uses a word boundary (`/^the organization\b/i`), and I keep it. If you mean a literal prefix, say so and I change it.

## J2 · REPORT

Found outside file-safety (record, Found in other modules): (1) bio-plane/dist/bio-plane.bundled.mjs (not_product) is stale, it inlines file-safety's source; for the layer close's regeneration. (2) The row census in bio-plane/src/gate.mjs holds the old translations of C-140.2, .3, .13, .38 and lacks C-140.43: the red you accepted until T48's stamp (B1, B3). (3) file-scanner's Purpose says "safe-copy makers"; if any file-scanner text reaches a member, DEC-200 (5)'s one-term rule applies there. Not mine to change.
