# format-registry (T51)

**Status** · session_0147VzMb43eV1VmXi1y6293X · depth 2 · COMPLETE · handled B5

## J1 · COMPLETE

T51-251 (the words check's four `plain` findings, K3957) is applied and pushed as e3d48dccc2 on job/T51/format-registry.

**Applied**
- `bio-plane/src/formats.mjs`: the four flagged sentences are read through `localize` with dotted ids, English unchanged:
  - `format-registry.formats.no_magic_byte_match`, "no registered magic-byte signature matched" (was :134; R12)
  - `format-registry.formats.no_bytes_to_sniff`, "no bytes were available to sniff" (was :134; R12)
  - `format-registry.formats.no_content_type_declared`, "no content type was declared" (was :135; R12)
  - `format-registry.formats.magic_doctype_root_tag`, "magic: doctype/root tag in the first 1024 bytes" (was :161; R17, the html signal)
- `bio-plane/test/m/format-registry/registry.test.mjs`: the R9 and R12 tests read those sentences through `localize` with literal arguments, not as copied text. One new test, "R12, R17: the reasons the registry states are read by their word keys", names the four ids (K874).
- `build/words` generated files (`rows.mjs`, `words-unreviewed.json`) not touched. Until BOB regenerates at the layer close, `localize` answers the English and `hasWord` is false for the four new keys. That is expected, and it is the only step left for BOB.

**Deferred:** none.

**Found in another module:** none.

**Not changed, noted:** `formats.mjs:187` (pdf's "magic: %PDF- header in the first 1024 bytes") is a sibling sentence the plain arm does not count, because of the `%` and `-`. I left it as is. BOB may want it keyed in the same pass.

**Tests and checks** (from `/home/user/bio`, the process repo's checks)
- `node --test test/m/format-registry/`: 43 pass, 0 fail (42 before the new test).
- `checks/format.mjs`: 174 modules, 173 requirements files; 0 failures.
- `checks/architecture.mjs format-registry`: 0 failures.
- `checks/coverage.mjs format-registry`: 30 of 30 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio format-registry tranche/T51 job/T51/format-registry`: 0 failures.
- `checks/words.mjs`, this module: 0 findings (`marker` was 4 before the test rewrite, now 0).
- `checks/run.mjs /home/user/bio`: format 0 failures, architecture 0 failures, channels 0 failures. Repo-wide coverage shows 33 failures and repo-wide words shows 4840 failures, both in other modules. This module's own coverage and words are clean.

Size (session_01GtJpPC5eXPwseWqdbYXLRA): test runs 3, module lines 394

## J2 · QUESTION

START says ooxml (3) and csv-reader (4) are merged before me. They are not: tranche/T51 holds neither decodeText (ooxml R36), ooxml.discriminate over a range source (ooxml R11) nor isDelimitedText (csv-reader R21); both jobs (OOXML #4, CSV-READER #5) have only posted their start. My best reading: I code to the section-2c interfaces through namespace imports (import * as ooxml / csv-reader), so the module loads before and after their merge; G130a (picture order) and the structure of R31/R32/R17 are built now; tests that need a provider's real function stay red by name (R-SEAM) until it merges, then I re-run and go COMPLETE. Say if you would rather I wait or stub differently. I do not need an answer to carry on.

## J3 · REPORT

Work done and pushed (job/T51/format-registry), awaiting providers. Done in formats.mjs: (G130a, R23) jpeg and png registered first, so a JPEG with %PDF-1.4 in COM or <html in EXIF and a PNG with %PDF- in tEXt are pictures; (G141, R17) html detect decodes the first KiB through ooxml.decodeText and answers only when the text BEGINS with a doctype or <html> after a BOM, white space, comments and an XML declaration; (G130b, R9, R31) detectFormat(bytes, contentType, name) with pass 3 calling csv-reader isDelimitedText(name, type, head<=1 MiB), only while the csv entry is registered; (G130c, R32) detectFormat accepts {size, readRange} and answers a Promise: head by the entries' own detect, containers by ooxml.discriminate({size, read}) over the range source, then passes 2 and 3; a source of 1 MiB or less is read whole and answered exactly as bytes; (R15) readingDialect projects assumed (boolean or null) and disagree (finite numbers). G131g audit: the only text decode in the sniff was the html latin1 head, now ooxml.decodeText; pdf detect stays a latin1 byte search for a signature (no text produced). Tests: new detect-round9.test.mjs names R9 R13 R17 R23 R25 R31 R32; existing R15, R17, R23 tests updated. Coverage 32/32 once committed. Checked with local stand-ins for decodeText, discriminate over a range source and isDelimitedText (never committed): all module tests green except 3 that need the real providers: R31 C23/C24 (the tsv pass-2 type and a real binary-signature check), R31 OLE control, and R32 pulled-bytes count. These stay red by name until ooxml R36/R11 and csv-reader R2/R21 merge into tranche/T51; the module as committed does not load decodeText/isDelimitedText calls until then (html detect and pass 3 throw). I will re-merge tranche/T51, re-run and go COMPLETE when they are in. Proposed requirement wording: none.

## J4 · REPORT

CHANGE B4 applied: tranche merged, ooxml's decodeText and range discriminate are real. Green now: R17 (T13), R23 (A12), R15, R25 and the R32 range tests that need only ooxml (O9 containers as the same bytes whole, pulled bytes at most the 1 MiB head plus 256 KiB, ODF confidence certain as whole). Still red by name, all with 'csv.isDelimitedText is not a function': R9, R13, R31 (x3) and two R32 tests that use the name pass; csv-reader (R21) has not merged. Send a CHANGE when it does; I then re-run, run the checks and post COMPLETE.

## J5 · COMPLETE

COMPLETE, fix round 9, pushed on job/T51/format-registry (tranche T51 merged, ooxml and csv-reader real).
Entries applied (R-FOUR (1) root cause, (2) why tests missed it, (3) failing-first, (4) platform):
- G130a (R23). (1) formats.mjs: jpeg and png were registered after html and pdf, whose 1 KiB scans found %PDF- / <html inside a picture; now registered first. (2) no polyglot in the suite. (3) detect-round9 'R23: SCAN A12' and pictures.test R23 (JPEG %PDF-1.4 in COM, <html in EXIF, PNG %PDF- in tEXt) were red on the old order (they asserted pdf/html), green now. (4) N here (L is the corpus's).
- G141 (R17). (1) html detect took any text mentioning <html> or <!doctype html> in the first KiB; now the first KiB is decoded through ooxml.decodeText and must BEGIN with the root after BOM, white space, comments, XML declaration. (2) no note-that-mentions-html case. (3) builtins R17 and detect-round9 'R17: DOCS T13' (red on the old detect, green now). (4) N.
- G130b (R9, R13, R31). (1) detectFormat had no name pass; pass 3 now calls csv-reader isDelimitedText(name, type, head<=1 MiB) while the csv entry is registered; bytes never override pass 1. (2) tests passed a declared type only. (3) detect-round9 R9/R31/R13 (SHEET C23 C24 C32 C33 shapes). (4) L is the corpus's.
- G130c (R32). (1) detection saw only a 1 KiB prefix; detectFormat now takes {size, readRange}, answers a Promise: head through the entries, containers through ooxml.discriminate over the range (confidence as the same bytes whole: ODF certain, others likely), then passes 2 and 3; a source of 1 MiB or less is read whole. (2) ladder tests stopped at 8 MiB. (3) detect-round9 R32 tests (O9 scaled: 2 MiB files past the 1 MiB head; reads counted: at most head + 256 KiB, never the file). (4) L is the corpus's.
- R15: readingDialect projects assumed (boolean or null) and disagree (finite numbers); dialect.test R15.
- G131g audit: the only text decode in my sniff was the html latin1 head, now ooxml.decodeText; pdf detect stays a latin1 byte search for the %PDF- signature, producing no text.
Deferred: none. New file outside paths: none.
FOUND IN ANOTHER MODULE (reading-pipeline, job 27): test/m/reading-pipeline/read.test.mjs:370 'R13: dialect absent when no entry answered...' deep-equals the readingDialect key list and now fails on the two new keys assumed and disagree (R15 as BOB amended it). It is the only new red among the users; otherwise acquisition 276/276 pass, file-safety 100/103 and reading-pipeline 303/319 with exactly the failures the unchanged tranche formats.mjs also gives (same names, checked against origin/tranche/T51's file). Needs reading-pipeline's job to accept the two keys.
Tests and checks: format-registry suite 56 pass, 0 fail. checks format 0 failures; architecture 0 failures; coverage 32 of 32 live ids; words 0 failures; ownership 0 failures. Words owed to later-ux: the stand-in ids format-registry.formats.name_and_delimited_head and format-registry.formats.container_judged_from_end (new signal sentences, English only).
Size (session_019Jfv3mJzeNs65nwh7mC8TQ): test runs 14, module lines 502

## Fix round 9, job 52 (R20, K4900) · FORMAT-REGISTRY #6

Merged tranche/T51 first (BOB's R20 amendment read). Entry applied:
- **R20.** (1) Cause: `formats.mjs` pdf `detect` (was :325) answered `pdf` for any head containing `%PDF-` in its first 1024 bytes, and R23 asks `pdf` before `zip`, so a ZIP whose first member is a PDF stored with method 0 (the PDF's bytes sit inside the first KiB) was a `pdf`. Fix: the bytes must not begin with the ZIP local-file magic (`ooxml.hasZipMagic`); such a file falls through to R28's `zip` or the office/ODF entries. A range source needed no change: its head goes through the same entry, and a container above the head is judged by `ooxml.discriminate` (R32). (2) No test: no fixture put a stored PDF first in a ZIP; G130a's polyglot set was pictures and HTML. (3) Failing-first: `test/m/format-registry/zip-pdf.test.mjs`, three tests seen RED before the edit, GREEN after:
  - `R20: a ZIP whose first member is a PDF stored uncompressed is a zip, whole and from a range source` — RED `Expected values to be strictly equal: actual 'pdf' expected 'zip'` (zip-pdf.test.mjs:22).
  - `R20: an office file whose first stored entry holds %PDF- stays docx, and an OpenDocument one odt` — RED `actual 'pdf' expected 'docx'` (:36).
  - `R20: a real PDF is a pdf — %PDF- at byte 0, and after junk that is not the ZIP magic; the ZIP magic first is not` — RED `the ZIP magic first is never a PDF` (:53); the `pdf` at 0 and after 500 junk bytes (Acrobat's rule) and `application/pdf` alone stay `pdf`.
  (4) Platform check N.
- Through the door: file-safety `r56-structure.test.mjs` X19 (`R6 R56 G136b (X19)`) green now; with acquisition `unpack.test.mjs` and `r9-unpack-transient.test.mjs`: 24 pass, 0 fail.

Deferred: none. New file outside paths: none. Found in another module: none. No generated artifact made stale by me beyond the plane's bundle (formats.mjs is a bundled input; BOB regenerates at the round end). No new sentence, no words row owed.

Tests and checks: format-registry suite 59 pass, 0 fail. Users: acquisition 321 pass, 0 fail; file-safety + capture 466 pass, 1 fail (`file-safety/rows.test.mjs:85`, the R24 words red the START carries round-wide). `impact.mjs origin/tranche/T51 HEAD`: 114 of 176 modules, 1971 of 2634 test files (every user of the registry); the named users above were run. Checks: format 0 failures; architecture 0 failures; coverage 32 of 32 live ids, 0 failures; words 0 failures; ownership 0 failures.

Size (session_0147VzMb43eV1VmXi1y6293X): test runs 8, module lines 507

## J6 · COMPLETE

COMPLETE (job 52, R20, K4900): a ZIP whose first member is a stored PDF is now detected as zip (or its office kind), not pdf; real PDFs unchanged. Failing-first zip-pdf.test.mjs seen red then green; file-safety X19 green; acquisition 321/321; checks 0 failures; record section 'Fix round 9, job 52'. Only red among users: file-safety rows.test.mjs R24 words (carried). Platform N. Generated artifact stale: plane bundle (formats.mjs).
