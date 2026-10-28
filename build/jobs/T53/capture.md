# capture (T53)

**Status** · session_018BhcegWsU96peK7X9pCQCk · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

## CAPTURE #1 · T53 R1 · report

**Entries applied**

- **T53-104 (DEC-455, R121)** `previewMore({captureSha, sheet, fromRow, viewer})` and `op=previewmore` (declared). It reads the next `PREVIEW_ROWS` (200, the drawing's "rows 1 to 200") rows from `fromRow` through the reader's `cellsIn`. `next_row` is present while rows remain. It writes nothing. A viewer who cannot see the capture, a machine and an unheld digest all answer `NO_SUCH_CAPTURE` alike. The reader's refusals are answered in words by key. Tests: a CSV and a workbook sheet walked call by call; `declared-ops` for the op.
- **T53-103 (N1266, N1267, R119)** `uploadCapture` (and `beginPartedUpload` / `completePartedUpload`) judges the kind with `format-registry`. A refused kind (RAR, program, installer, script, disk image) is not filed: `FILE_KIND_REFUSED` (new check row C-118.13, 415) names the kind and the reason by the word table's keys and writes nothing. An unlisted kind is filed whole with `held_not_read` (the sentence "held, not read: {name}") and its `reading` row owed. A kind's bound is judged on the declared size before any byte is read, and again on the bytes. `TOO_LARGE` carries `{size, bound, key}` with the kind's own key, before the request ceiling. Parted uploads judge the declared name at begin and the stored object (a range source) at completion.
- **T53-106 (N824, K5506, K5527, R116-R118)** `emailCapture({bytes, headers, statement, by, within})`: member-session fence, her statement (`MAIL_NO_STATEMENT`, new check row C-118.12), `EMPTY`, `TOO_LARGE` at the lower of the mail bound and `CAPTURE_MAX` (key `limit.mail.message_bytes`, judged on a declared size before a byte is read), `within` (`MAIL_WITHIN_FAILED`), one receipt `via: "email"` at `email:<sha>`, the document with method `emailed`, source `{kind: "mailer"}`, origin `email`, the headers as stated under `message`. One `member` job row for each attachment `mail-reader` lists and cuts, keyed `<sha>!<index>`, registered in the filing transaction. The answer lists each attachment (`waiting`, `over_bound` with size and bound, or `not_cut`). `email` joins the received routes of R76.
- **T53-107 (K5471 (6), JOURNEYS)** R-21: `heldCaptures({member})` lists a member's own testimony (the author `provenance` stamps on its register row, its R48), and a testimony row's `actor` is that author. R-22 and R-23 are placed elsewhere by BOB (K5699): R-22 screens-intake; R-23 the control plane's stamp and screens-intake.
- **T53-109 (K5565)** the 14 English sites of capture's five baseline files are converted to the word table's keys, and the words check finds no English in capture's tests. `build/tests-english-baseline.json` is outside capture's paths (the ownership check refuses an edit), so it is BOB's to do at merge: remove these five files from it: `bio-plane/test/d57selflink.test.mjs`, and `bio-plane/test/m/capture/` `converts`, `services`, `t49`, `upload` (`.test.mjs`). One was a B site: `capture.index.bracketing_captures_differ` is now a `localize` in the module.
- **T53-102, T53-105** nothing for capture (K5699, placed elsewhere): T53-102 is acquisition's (T53-97: R36, R130, R137). T53-105: recognising a challenge or CAPTCHA at the fetch, refusing it and counting it per host is acquisition's R140. Matching her file to the waiting request is capture-requests' T53-209 (layer 6), with the Queue item in queue-producers and screens-intake.

**Not done**

- **T53-108 (P9, R120)** waits on PLATFORM's stage timings (K5699: BOB asked PLATFORM #2 to re-run the three-uploader study with per-upload stage timings). R120 is named in a `test.todo` ("waits: PLATFORM stage timings"). Nothing is built for it.
- **R117's filing half** is not mine: capture registers the `member` rows and lists the attachments; filing each member is acquisition's `fileMember` (R136). R117 is therefore not struck.

**Tests that changed because the lower layers changed (named, not weakened)**

- R92's signal assertion now reads the format (`text`) the registry answers.
- R86 R111 quotes `CAPTURE_MAX` (500 MB) from the table.
- R68's replay test streams past `CAPTURE_MAX`.
- R109's keep test: a file of no known kind is read (the document row is 100 MB).
- R109's G152 test: an upload over its kind's bound is refused before it is held (T53 R119), so "stated over the ceiling" can no longer arise from a one-request upload. The `stated` branch remains for parted uploads of kinds without their own bound.
- The three 105 MiB parted tests send a real stored ZIP (`storedZip` in the fixture), since an unlisted kind is bound at 100 MB.
- The check-row lists in `knocker`, `evidence-absent` and `t50-words` carry C-118.12 and C-118.13.

**Red tests inherited (5)**: the five `R107` tests (g41b-t51, g41b-plane) fail on the tranche before my change. The cause is acquisition's `profileOf`, which takes any format other than `undetermined` as known (its own entry T53-526), so a CSV declared `text/csv` in parts now profiles `text`. They pass once that entry lands.

**Found in other modules / stale generated artifacts**

- `provenance` does not yet export `EMAIL_VIA`, nor admit origin `email`, method `emailed` and the `message` block (its R82-R84). capture reads `provenance.EMAIL_VIA ?? "email"`, and the document it builds fails C-18.1 until provenance's job lands.
- `store-assembly`'s test `r9-jobs.test.mjs:481` (R75 R2) begins a parted upload of a 200 MiB file named `.pdf`. Under R119 a document is bound at 100 MB (`limit.document.bytes`), so the begin is now `TOO_LARGE`. Its input should be a kind with the archive bound (a `.zip`). It passed before this change; the other 61 store-assembly failures are red on the tranche before it too.
- `mail-door`'s `modules.json` paths name no directory yet (the format check fails until that job writes them).
- Generated artifacts my change stales, for `proc merge` to regenerate: `bio-plane/dist` (bundles of capture), `bio-plane/src/case-checker/program.mjs` (its words). I regenerated `bio-plane/src/setup-words/rows.mjs` and `words-unreviewed.json` (17 new keys, nothing else) so the module's tests can read them.
- New check rows awaiting promotion's stamp: C-118.12 `MAIL_NO_STATEMENT`, C-118.13 `FILE_KIND_REFUSED` (their words are `localize` stand-ins until the design adds the keys to capture's `reads`).

**Met** · R77, R116, R118, R119, R121

Tests: 390/396. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Inherited reds: ["R107 G41 (platform L): a 9 MB CSV in two parts uploaded through the plane is stored csv, declared text/csv or named x.csv; control: the same bytes with neither stay undetermined","R107 G41: a CSV over one part, declared text/csv, is stored csv, as a one-part CSV is; the declaration is recorded as the uploader's","R107 R93: a text file over two full parts named x.csv with no type is stored csv; the name gives the type, no declaration is recorded","R107: a code point cut at the head's end does not make the head not text (multi-byte text)","R107 controls: a declaration never contradicts the bytes"]
Size (session_018BhcegWsU96peK7X9pCQCk): test runs 1, module lines 5364

## Completion (2026-10-28)

## CAPTURE #1 · T53 R1 · report

**Entries applied**

- **T53-104 (DEC-455, R121)** `previewMore({captureSha, sheet, fromRow, viewer})` and `op=previewmore` (declared). It reads the next `PREVIEW_ROWS` (200, the drawing's "rows 1 to 200") rows from `fromRow` through the reader's `cellsIn`. `next_row` is present while rows remain. It writes nothing. A viewer who cannot see the capture, a machine and an unheld digest all answer `NO_SUCH_CAPTURE` alike. The reader's refusals are answered in words by key. Tests: a CSV and a workbook sheet walked call by call; `declared-ops` for the op.
- **T53-103 (N1266, N1267, R119)** `uploadCapture` (and `beginPartedUpload` / `completePartedUpload`) judges the kind with `format-registry`. A refused kind (RAR, program, installer, script, disk image) is not filed: `FILE_KIND_REFUSED` (new check row C-118.13, 415) names the kind and the reason by the word table's keys and writes nothing. An unlisted kind is filed whole with `held_not_read` (the sentence "held, not read: {name}") and its `reading` row owed. A kind's bound is judged on the declared size before any byte is read, and again on the bytes. `TOO_LARGE` carries `{size, bound, key}` with the kind's own key, before the request ceiling. Parted uploads judge the declared name at begin and the stored object (a range source) at completion.
- **T53-106 (N824, K5506, K5527, R116-R118)** `emailCapture({bytes, headers, statement, by, within})`: member-session fence, her statement (`MAIL_NO_STATEMENT`, new check row C-118.12), `EMPTY`, `TOO_LARGE` at the lower of the mail bound and `CAPTURE_MAX` (key `limit.mail.message_bytes`, judged on a declared size before a byte is read), `within` (`MAIL_WITHIN_FAILED`), one receipt `via: "email"` at `email:<sha>`, the document with method `emailed`, source `{kind: "mailer"}`, origin `email`, the headers as stated under `message`. One `member` job row for each attachment `mail-reader` lists and cuts, keyed `<sha>!<index>`, registered in the filing transaction. The answer lists each attachment (`waiting`, `over_bound` with size and bound, or `not_cut`). `email` joins the received routes of R76.
- **T53-107 (K5471 (6), JOURNEYS)** R-21: `heldCaptures({member})` lists a member's own testimony (the author `provenance` stamps on its register row, its R48), and a testimony row's `actor` is that author. R-22 and R-23 are placed elsewhere by BOB (K5699): R-22 screens-intake; R-23 the control plane's stamp and screens-intake.
- **T53-109 (K5565)** the 14 English sites of capture's five baseline files are converted to the word table's keys, and the words check finds no English in capture's tests. `build/tests-english-baseline.json` is outside capture's paths (the ownership check refuses an edit), so it is BOB's to do at merge: remove these five files from it: `bio-plane/test/d57selflink.test.mjs`, and `bio-plane/test/m/capture/` `converts`, `services`, `t49`, `upload` (`.test.mjs`). One was a B site: `capture.index.bracketing_captures_differ` is now a `localize` in the module.
- **T53-102, T53-105** nothing for capture (K5699, placed elsewhere): T53-102 is acquisition's (T53-97: R36, R130, R137). T53-105: recognising a challenge or CAPTCHA at the fetch, refusing it and counting it per host is acquisition's R140. Matching her file to the waiting request is capture-requests' T53-209 (layer 6), with the Queue item in queue-producers and screens-intake.

**Not done**

- **T53-108 (P9, R120)** waits on PLATFORM's stage timings (K5699: BOB asked PLATFORM #2 to re-run the three-uploader study with per-upload stage timings). R120 is named in a `test.todo` ("waits: PLATFORM stage timings"). Nothing is built for it.
- **R117's filing half** is not mine: capture registers the `member` rows and lists the attachments; filing each member is acquisition's `fileMember` (R136). R117 is therefore not struck.

**Tests that changed because the lower layers changed (named, not weakened)**

- R92's signal assertion now reads the format (`text`) the registry answers.
- R86 R111 quotes `CAPTURE_MAX` (500 MB) from the table.
- R68's replay test streams past `CAPTURE_MAX`.
- R109's keep test: a file of no known kind is read (the document row is 100 MB).
- R109's G152 test: an upload over its kind's bound is refused before it is held (T53 R119), so "stated over the ceiling" can no longer arise from a one-request upload. The `stated` branch remains for parted uploads of kinds without their own bound.
- The three 105 MiB parted tests send a real stored ZIP (`storedZip` in the fixture), since an unlisted kind is bound at 100 MB.
- The check-row lists in `knocker`, `evidence-absent` and `t50-words` carry C-118.12 and C-118.13.

**Red tests inherited (5)**: the five `R107` tests (g41b-t51, g41b-plane) fail on the tranche before my change. The cause is acquisition's `profileOf`, which takes any format other than `undetermined` as known (its own entry T53-526), so a CSV declared `text/csv` in parts now profiles `text`. They pass once that entry lands.

**Found in other modules / stale generated artifacts**

- `provenance` does not yet export `EMAIL_VIA`, nor admit origin `email`, method `emailed` and the `message` block (its R82-R84). capture reads `provenance.EMAIL_VIA ?? "email"`, and the document it builds fails C-18.1 until provenance's job lands.
- `store-assembly`'s test `r9-jobs.test.mjs:481` (R75 R2) begins a parted upload of a 200 MiB file named `.pdf`. Under R119 a document is bound at 100 MB (`limit.document.bytes`), so the begin is now `TOO_LARGE`. Its input should be a kind with the archive bound (a `.zip`). It passed before this change; the other 61 store-assembly failures are red on the tranche before it too.
- `mail-door`'s `modules.json` paths name no directory yet (the format check fails until that job writes them).
- Generated artifacts my change stales, for `proc merge` to regenerate: `bio-plane/dist` (bundles of capture), `bio-plane/src/case-checker/program.mjs` (its words). I regenerated `bio-plane/src/setup-words/rows.mjs` and `words-unreviewed.json` (17 new keys, nothing else) so the module's tests can read them.
- New check rows awaiting promotion's stamp: C-118.12 `MAIL_NO_STATEMENT`, C-118.13 `FILE_KIND_REFUSED` (their words are `localize` stand-ins until the design adds the keys to capture's `reads`).

**Met** · R77, R116, R118, R119, R121

### Change (BOB K5712)
The two R107 tests still red after acquisition's merge were stale expectations, not a cause in acquisition: with no declaration the registry now answers `text` (or `unlisted` for non-text bytes), no longer `undetermined`. The expectations in g41b-t51 and g41b-plane follow it. `EMAIL_VIA` is imported from provenance and the fallback is gone.

**Met** · none

Tests: 395/396. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegWsU96peK7X9pCQCk): test runs 2, module lines 5361
