# Plan T53 · the completion round (P10)

**Status** · The tranche's completion round, after layer 11 and before the release (P10; needs no further approval): one job per module whose layer had closed when the work was found, run concurrently, lower layers first where one uses another. BOB adds each entry as it is placed, with its ruling; the requirement lines are written just before the round's START (K5377). Opened by `proc round open` from this file once R1's last layer closes.

## Layer 1
**signatures**
- T53-592 · K5751, signatures R58 · `CATALOGUE_KEYS` holds Bob's two catalogue keys (sitting 1) in place of the test keys; tests pass throwaway keys as `allowedKeys`; ai-catalogue's and ai-issuer's users re-run
  - its line, written into signatures.md at the round's START (K5377): **R58** (T53; K5751, the catalogue key ceremony's sitting 1, 2026-10-28; K5625, K5577 (5); amends R50) *(not yet met: T53)* **`CATALOGUE_KEYS` holds exactly Bob's two catalogue keys.** Its lines are, in this order and nothing else: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICzjuXnpqLaVYtDu31PbDKjswFWytmmhkU2SsgdkY50J bio-ai-catalogue` (the signing key; SHA256:RpBqiKYcBfY0ZXvLJVJIazLH8TCAgUMTSwbLF6x0qLM) and `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMcDvL37Gr543+bDycYk53h83ZVfCxmIquuIlV+Ptn9c bio-ai-catalogue-recovery` (the recovery key; SHA256:34muQ7LZW9VVCrllKQqOfhHpTkTKJUSugGbQ67J3Klg). No test key is in the list; a test signs with its own throwaway key and passes it as `allowedKeys` (R53, R54, R56), never by adding it to the list. Test: the list equals these two lines (normalised as R2 reads them), each differs from every `RELEASE_KEYS` line, and a statement signed by a throwaway key fails against the default list and verifies with that key passed as `allowedKeys`. Control: a statement signed by a release key fails against `CATALOGUE_KEYS`.
**image-cover**
- T53-570 · K5705, file-safety R66 · a redraw from decoded pixels (the container's other picture kinds), so file-safety can draw a picture from pixels another reader decoded; its line written before START
**runtime-limits**
- T53-572 · K5705, T53-510 (FILE-SAFETY's measurement) · `file_safety.grade_read`'s standard lowered from 100 MiB to the whole-read figure a Worker holds (a 100 MiB PDF graded whole measured 315 MiB above idle against 206 MiB headroom); the figure from FILE-SAFETY's ranged-grading report, larger containers graded by pieces (K1881, K5637's pattern)

**register-readers**
- T53-580 · K5715, ACQUISITION's finding · `register-readers` R9: `createReducer` offers a `snapshot()`/resume of its carry (the unfinished row, the row number, the hashes), so acquisition R127's offset checkpoint can be built; and `createRowParser` reads a separate header file in the header piece's own delimiter (acquisition's `headerInDelimiter` work-around then removed). With acquisition R127 after it
**runtime-limits** (also)
- T53-581 · K5715, acquisition R126 · the two `register` rows of `READ_BOUNDS` (runtime-limits R47) once M-R7 records them; acquisition R126 then met
- T53-586 · K5736, extraction R122 · the alarm reading's units-and-index-rows budget becomes a runtime-limits row, extraction reading it from there

**ocr-worker**
- T53-594 · K5762, reading-pipeline R68 · the member returns each unclear word's place (its page, the word box's line and offset in the page's text), from the recognition it already runs (`frame.mjs` R25's word boxes), so reading-pipeline can state each unclear word's unit and offset; reading-pipeline's T53-595 after it

**jurisdictions**
- T53-609 · local-facts' report (R29, K5786) · `validate` judges a team layer's holidays per government (R99, R115: names are unique within a government), so the same holiday list for two cities is accepted; local-facts R29's two-cities case then written

## Layer 2
**promotion**
- T53-582 · K5715, capture's new rows · the census re-stamped for C-118.12 (`MAIL_NO_STATEMENT`), C-118.13 (`FILE_KIND_REFUSED`), C-139.22-.24 and every other check row minted in T53, last in its layer
**record-core**
- T53-574 · K5705, FILE-SAFETY's finding · `purge` removes rows only, so derived objects of a purged capture (safe views, copies, pictures) stay in the store unreferenced: purge removes them too (whether record-core finds them or their owners register them for purge, settled at START)

## Layer 3
**mail-door**
- T53-591 · K5748, mail-door R15 · the clearing's owners kept as counts until notice-producers (R36) has read them
**provenance**
- T53-588 · N1200 (K5747) · registers its reader of a project's reach (its captures) through `membership.registerProjectReach` (N1186)
**acquisition**
- T53-583 · K5715, R126, R127 · met once T53-580 and T53-581 land
- T53-589 · N1261 (K5747) · `checks.mjs` reads DEC-412's `refusal.CAPTURE_NOT_KEPT` row (R29, R31) instead of its stand-in
**file-safety**
- T53-589 · N1261 (K5747) · `checks.mjs` reads `refusal.SIGNATURES_RUN_RECENT` by `rowWord` (R24) instead of its stand-in
- T53-571 · K5705, R66 · the container's other picture kinds: uses reader-container (the edge entered at START) and image-cover's redraw (T53-570)

## Layer 4
**extraction**
- T53-610 · progressions' report (K5786) · `nosha.test.mjs` passes its own input string, not progressions' sentence; then progressions T53-611
**reading-pipeline**
- T53-595 · K5762, R68 · `reading.unclear_words.positions` states each word's unit and offset from ocr-worker's places (T53-594); R68 then met
- T53-596 · K5762, R45 · the structured readers' registry entries (json, xml, ics, vcf, srt and the rest) are read through the entry's `plan`/`read`, so a wired JSON gives structured units by path, not "no text was supplied"; until then `READ_AS_TEXT` stands
- T53-597 · K5762, R29-R31 · its 13 R29-R31 tests call ai-accounts' `accountSet` (its R1, renamed from `accountReferenceSet` in T53), not the retired name
- T53-598 · K5762, R54 · the email clause re-worded: `eml` and `msg` have mail-reader's registry reader, so email is no longer `UNSUPPORTED_FORMAT`; its test re-stated
- T53-599 · K5762, R12 R21 · the `PPTX_OVERBOUND` fixture rebuilt against the office bound of today
- T53-600 · K5762 · a run of its tests writes no stored answer fixture of case-checker, plane or public-read (they are read, never rewritten, by another module's tests)

## Layer 5
**progressions**
- T53-611 · K5786 · feeds:179's noSha sentence keyed by `localize` at its use and read by key in the test (after extraction T53-610)

## Carried from the handoff
- mail-door R12's `email()` wiring waits on M1 (K5692 (3)): a P19 deferral unless M1 is made.
- capture R120 / T53-108 if PLATFORM's stage timings come after layer 3 can otherwise close (K5699).
