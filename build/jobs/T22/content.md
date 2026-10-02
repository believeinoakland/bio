# content (T22)

**Status** · session_01GDJYyoNJjSDAFBJbwSiC7V · depth 2 · WORKING · handled B0

## Completion

**Entries applied** (B1, `build/plan/current.md` T22 layer 4; code at 1485e6f962).
- **(2) DEC-88: R25, R43, R38 met.** C-52.10 `ATTEST_NO_NOTE` is one new row in `TRANSCRIBE_CHECKS` (`checks.mjs`, after C-52.9), its `where` naming both sites. `transcriptionAttest` asks it after C-52.8, `checkAttestation` and C-52.9 (inside `is-transcription-attest`); `attestText` after text-chain's refusals and both `NO_READING` arms (new region `is-text-attest`). Refused, before any write, when the `note` is absent, not a string, blank (white space only) or over `ATTEST_NOTE_MAX` = 2,000 characters (code points, as capture's `REASON_MAX`); the refusal carries `reason`/`code`, `check`, `translation`, `detail` and `max_chars`. An accepted note is kept as given (no longer nulled when blank or not a string). The ops map already carried `note` for both arms; unchanged.
- **(1) N471 and the re-scan.** `checks.mjs`:19 (C-52's minting note) now past tense in `inquiry-grammar/checks.mjs`' form. :221–:223 ("no `mintid C`") read as saying no tool was used: kept. The re-scan of every file in my path found no note naming the plane's deleted `src/index.mjs` (N480) and none naming a T20-deleted file or the battery as live; it found notes naming the catalogue (`bio-checks.mjs`) and the legacy store (`store.mjs`), both deleted in T19, as live, the same kind, re-worded to what is true now (past tense, or the module that holds it): `checks.mjs` header (the catalogue's copy) and C-80.3's note (the store's `versionNotice`; `reevaluation` now returns this module's answer); `extent-core.mjs` header, :46, `CONTENT_EXTENT_DOCUMENT_ONLY`'s note, the checker's note, the CAP-12 and `.ods` paragraphs (now `./index.mjs`' `#containerExtentFor`/`#pageSetFor`), the D-440 and REC-84 notes, `imagePartUndetermined`'s note; `extent.mjs` `legContentId` and `containerBoundUndetermined` notes; `index.mjs` `legRefusals` and `standings`/`#standing` notes (the connection map is `inquiry`'s earned read); `schema.mjs`'s `page_count` note ("nothing persists a page count today" was false since D-345). Provenance notes stay.
- **Flaws fixed in my module.** (a) `attestText`'s "one per (capture, attestor, extent), a repeat replacing it" (R43) failed for a `page` or `document` extent: the key holds `extent_page`/`extent_rect`, NULL there, and SQLite keys NULLs apart, so `INSERT OR REPLACE` kept both. Now the held row is deleted (matched with `IS`) and the new one inserted, in one transaction. Test added (R43, context.test.mjs), with a negative control run by hand (reverting the delete fails 2 tests). Rows a live store already holds twice are not touched (testimony; readers list both). (b) `mintContent`, the legacy store's alias for `mint`, had no caller left anywhere (`bio-plane/`, `agent-worker/`, `civicos-ui/`): removed.

**Deferred:** none.

**Other modules (REPORT J1):**
- `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`) stale: `src/content/` changed (behaviour). Not regenerated.
- inquiry: `test/m/inquiry/content-legs.test.mjs`:395 (R13) red: :399 `attestText` without a note is now refused C-52.10 (its :409 `transcriptionAttest` likewise). Inquiry's L6 job sends the note (B1).
- `row-census.test.mjs` (promotion's): C-52.10 `ATTEST_NO_NOTE` arrives with no record, **awaiting stamp** (accepted red 3).
- record-grammar: `src/record-grammar/labels.mjs`:198 names "`mintContent`'s default", a method content no longer has (its default is `mint`'s `mintedBy`); a comment, N469's kind.
- affordances: `attesttext` and `transcriptionattest` in `RUNG_ABSENT` (affordances' L11, B1); their `is` sentences do not mention the note. No change made.

**Tests and checks** (in `bio-plane/` unless said):
- `node --test test/m/content/`: tests 115, pass 115, fail 0. New: R25 (C-52.10 after C-52.9, negative controls absent, null, a number, an object, a list, empty, white space, 2,001 characters, 2,001 astral characters, each refused with the whole database unchanged and `transcriptionRead` unchanged; through the route arm too; 2,000 astral and 2,000 plain characters accepted and read back; a refused repeat changes nothing, an accepted one replaces with its note); R43 (the same set after NO_READING, with `attestationsFor`'s attestations and ceiling and `contentContextFor` unchanged; route arm; 2,000 accepted and read back; repeat); R38 (exactly the ten rows, C-52.1–C-52.10, C-52.10's `where`).
- Users' suites: inquiry 163/1 (the content-legs R13 above, new, for BOB to accept or route); basis-versions 118/0; connections 107/0; reevaluation 82/0; case-authoring 80/0; control-plane 100/2 (`catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310, the accepted K1037 reds; same 2 fail on the unchanged tree).
- `node --test "test/m/**/*.test.mjs"`: tests 4841, pass 4819, fail 3, skipped 0, todo 19: the two accepted control-plane reds and inquiry's content-legs R13. No other red; test-support R2 passed here.
- `test/system/row-census.test.mjs`: fails, C-52.10 arrived with no record (accepted red 3; its other moved rows are capture's).
- `test/system/fleetbundles.test.mjs`: bio-plane's member stale (above); every other member passes.
- `node checks/format.mjs`: 85 modules, 84 requirements files; 0 failures
- `node checks/architecture.mjs … content`: 22 product files, 68 relative imports; 0 failures
- `node checks/coverage.mjs … content`: 51 of 51 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … content tranche/T22`: 12 files changed; 0 failures

**For COMPLETE:** R25, R43 and R38 met (their `not yet met: T22` marks are BOB's to strike); C-52.10 `awaiting stamp`.

Size (session_01GDJYyoNJjSDAFBJbwSiC7V): test runs 16, module lines 3523

## J1 · REPORT

Reds and stale artifacts from my change, for acceptance by name or routing (P4), before my merge. (1) inquiry: test/m/inquiry/content-legs.test.mjs:395 (R13) red: :399 attestText and :409 transcriptionAttest send no note, now refused C-52.10 ATTEST_NO_NOTE (inquiry's L6 job sends it, as B1 says). (2) row-census.test.mjs (promotion's): C-52.10 ATTEST_NO_NOTE arrived with no record, awaiting stamp (accepted red 3). (3) bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (not_product) stale: src/content/ changed (behaviour); not regenerated. (4) Finding, record-grammar: src/record-grammar/labels.mjs:198 names `mintContent`'s default; content's mintContent (the legacy store's alias, no caller left) is removed, so that comment names a method that no longer exists (N469's kind). (5) Note for affordances (L11): attesttext and transcriptionattest's `is` sentences do not mention the now-required note; nothing changed there. No other red: test/m 4841 tests, 3 fail = control-plane catalogue-end.test.mjs:15 and doorbell.test.mjs:310 (accepted, K1037) and (1).

## J2 · COMPLETE

Done at 0f4103c173 on job/T22/content (code 1485e6f962). DEC-88: R25, R43, R38 met: C-52.10 ATTEST_NO_NOTE (one new row, awaiting stamp) refuses a note absent, not a string, blank or over 2,000 characters, after C-52.9 in transcriptionAttest and after NO_READING in attestText, before any write; tests with negative controls (whole-database snapshot unchanged, ceiling and reads unchanged; 2,000 accepted and read back). N471: checks.mjs:19 past tense; :221-223 kept (names no live tool). Re-scan: no N480 or N469 notes; notes naming the T19-deleted catalogue and legacy store as live re-worded in checks, extent-core, extent, index, schema. Flaws fixed: attestText's repeat over a page or document extent now replaces (NULLs in the key made INSERT OR REPLACE keep both; R43 test added); mintContent (no caller) removed. content 115/115; users: basis-versions, connections, reevaluation, case-authoring green; inquiry 1 red and control-plane 2 accepted (REPORT J1); test/m 3 fail as J1 names; format, architecture, coverage (51/51), ownership (12 files): 0 failures. Record: build/jobs/T22/content.md.
