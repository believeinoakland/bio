# Plan T53 · the completion round (P10)

**Status** · The tranche's completion round, after layer 11 and before the release (P10; needs no further approval): one job per module whose layer had closed when the work was found, run concurrently, lower layers first where one uses another. BOB adds each entry as it is placed, with its ruling; the requirement lines are written just before the round's START (K5377). Opened by `proc round open` from this file once R1's last layer closes.

## Layer 1
**civil-time**
- T53-612 · the independent audit (K5794) · R31: the "spans two fiscal years" undetermined reason's `vars` name the body asked about (`recurrence.mjs` gives only value and labels; probe body "B", date "2026"); the R31 test asserts the body
**register-readers**
- T53-613 · the independent audit (K5794) · R1: memory stays bounded with `row_key_basis: content` (the `seen` Map grows one entry per distinct row; 200 MiB of distinct rows ran out of a 64 MB heap), a heap test with the content-keyed definition; R6: "all filers of X" refused `FILTER_PATTERN_REFUSED` (not built). Both disclosed by the job
**record-grammar**
- T53-614 · the independent audit (K5794) · what its T53 report claims and its merge (a32663ea1) lacks: the seven keys' reads and the two baseline lines (bundle.test.mjs 4, labels.test.mjs 7) were reverted before COMPLETE; settled at START against K5681 (BOB adds reads rows; wording is the design stream's)
**connection-grammar**
- T53-615 · the independent audit (K5794) · R23's Test: `bounds-walk.test.mjs`'s R14 case amended with the strength step (line 64 still states the old order)
**mail-reader**
- T53-616 · the independent audit (K5794) · R6 is claimed met while only "both routes give the same answer" is tested: R6 tested whole (one record, with capture R116) or its line re-stated at START; and R10's single nesting count applied to messages inside an MBOX (uncertain: settled by a test)
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
**reader-container**
- T53-625 · K5800, PLATFORM P-52 (lane/platform 53e09c0b4b; `proto/levels-2-3-1f` a28847e91e) · no archive member reaches the caller whole beyond what one Worker isolate can hold: `reader.mjs` `readRecords` delivers each payload "whole, as one Uint8Array" while `read-bounds.mjs`'s `archive.member_bytes` allows 2 GiB (a 400 MiB member came back as one 419,430,400-byte payload, caller peak 941 MB, local); a member over the window is passed on in windows (or the bound set to what an isolate holds, a runtime-limits row, by K1881's pattern), test: a 400 MiB member read with the caller's peak bounded; FILES and reading-pipeline told at START
- T53-626 · K5801, PLATFORM P-53 (lane/platform d21c7f8097; the published reader image run locally at standard-1) · the image's ImageMagick policy (memory 256 MiB, map 512 MiB, disk 1 GiB) refuses a photo from about 58 MP (8000x7200 converts, 8000x7600 fails "cache resources exhausted"; the 40-page TIFF too) while `image.pixels` admits 120,000,000, so a 58-120 MP photo passes the product's check and is answered UNREADABLE: the policy and the bound agree (the policy raised within the instance's 4 GiB, or the bound lowered by a runtime-limits row, K1881's pattern), and a picture over what the image can draw gets the over-bound refusal, never UNREADABLE; test: one photo either side of the agreed bound on the image
- T53-627 · K5802, PLATFORM P-54 (lane/platform c95cc6c03b; `proto/levels-2-3-1f` f43dc6c1d1; the published image in local docker at standard-1's 4 GiB) · the container holds an archive member whole too (`archives.mjs` `walkSeven` collects each member's output whole; `walkTar` concatenates it): a 1.8 MB zero-filled ZIP with one 1,900 MiB member, within every bound (ratio about 1,032 against 1,100, member and unpacked under 2 GiB), was killed for memory (oom_killed) and the caller saw only "fetch failed", so one small upload ends a standard-1 instance; with T53-625: a member is streamed out in windows (or the member bound set to what the instance holds), and a member over what the instance can unpack gets the over-bound refusal, never a killed instance; test: that ZIP refused or read with the instance alive
- T53-628 · K5804, the probe run (K5800, K5803; `proto/levels-2-3-1f` remote-idle and remote-state files) · the reader's idle stop is not seen to work: with `sleepAfter = '5m'` (worker.mjs:17, as the product's reader), @cloudflare/containers 0.3.7 recorded no stop for an instance pinged once and left idle for 20 minutes, nor within minutes of an explicit `Container.stop()`, while an awake standard-1 instance costs up to about $53 a month; the reader's instances are shown to stop when idle (the library's stop confirmed, or the reader's own stop after its last request), test: an instance pinged once records its stop within sleepAfter plus the library's alarm interval

## Layer 2
**member-roster**
- T53-617 · the independent audit (K5794) · R84's "at four" test uses `threeAdmins()` (three administrators, fixture.mjs:72-80): run it at four; R86 needs a run at four where the two non-founders other than the target are `VOTES_SHORT` (need 3)
**promotion**
- T53-582 · K5715, capture's new rows · the census re-stamped for C-118.12 (`MAIL_NO_STATEMENT`), C-118.13 (`FILE_KIND_REFUSED`), C-139.22-.24 and every other check row minted in T53, last in its layer
**record-core**
- T53-574 · K5705, FILE-SAFETY's finding · `purge` removes rows only, so derived objects of a purged capture (safe views, copies, pictures) stay in the store unreferenced: purge removes them too (whether record-core finds them or their owners register them for purge, settled at START)

## Layer 3
**mail-door**
- T53-618 · the independent audit (K5794) · PRIVACY, first in the round (K5506, R6): a message sent again after it was brought in stores its private bytes again and nothing deletes them (`receiveMail` stores at index.mjs:375, returns `existed: true` at :384; `clearWaitingMail` reads only waiting rows): a resend after bring-in holds no bytes past R6's bound; test: bring in, resend, clear 30 days on, the bytes are gone
**capture-sources**
- T53-619 · the independent audit (K5794) · drive.test.mjs R42 again exercises a detection that carries no fields (`{format: "odt"}` alone), as its comment says
**doorbell**
- T53-620 · the independent audit (K5794) · R31's PDF case asserts each page as a picture (t53.test.mjs:657 asserts only `v.pages >= 0`); the stale "waits on file-safety R71" comment (:590-591) removed; R30's order (row, then bytes; the code deletes bytes first) checked against its text at START
**mail-door**
- T53-591 · K5748, mail-door R15 · the clearing's owners kept as counts until notice-producers (R36) has read them
**provenance**
- T53-588 · N1200 (K5747) · registers its reader of a project's reach (its captures) through `membership.registerProjectReach` (N1186)
**acquisition**
- T53-583 · K5715, R126, R127 · met once T53-580 and T53-581 land
- T53-589 · N1261 (K5747) · `checks.mjs` reads DEC-412's `refusal.CAPTURE_NOT_KEPT` row (R29, R31) instead of its stand-in
- ONB-2 · onboarding (`next.md` ONB-2, placed here) · `checks.mjs:24`: the contact URL names `believeinoakland/bio`: it names `civicsmith/civicsmith`, as instance-setup ONB-2 in round 2
**file-safety**
- T53-589 · N1261 (K5747) · `checks.mjs` reads `refusal.SIGNATURES_RUN_RECENT` by `rowWord` (R24) instead of its stand-in
- T53-571 · K5705, R66 · the container's other picture kinds: uses reader-container (the edge entered at START) and image-cover's redraw (T53-570)

## Layer 4
**content**
- T53-621 · the independent audit (K5794) · R68: a test stubbing the constants to two other letters sees them at every interface; R64's hidden bundle tested with a member who cannot see it, not `viewer: "nobody"`; register-row.test.mjs uses registers' provider in place of its hand-built one (K4990) once registers is merged
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
**query-language**
- T53-622 · the independent audit (K5794) · the English regex sites at grammar.test.mjs:154-156 and :283 read by key, and the baseline lines its report said it removed (grammar.test.mjs 1, t33.test.mjs 2); to its open layer-5 job if work resumes before layer 5 closes
**people**
- T53-623 · the independent audit (K5794) · identity.test.mjs:111's copied grade-C sentence read by `word(...)`, as the grade B and D cases two lines away; to its open layer-5 job if work resumes before layer 5 closes
**events**
- T53-624 · the independent audit (K5794) · R60's test uses the walked standard's fixture and 200 captures, as its Test says (register.test.mjs uses synthetic captures only); to its open layer-5 job if work resumes before layer 5 closes
**progressions**
- T53-611 · K5786 · feeds:179's noSha sentence keyed by `localize` at its use and read by key in the test (after extraction T53-610)

## Carried from the handoff
- mail-door R12's `email()` wiring waits on M1 (K5692 (3)): a P19 deferral unless M1 is made.
- capture R120 / T53-108 if PLATFORM's stage timings come after layer 3 can otherwise close (K5699).
