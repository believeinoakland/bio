# acquisition (T41)

**Status** · session_01EA4bemqG5MNcZ6DDzxcD2d · depth 2 · WORKING · handled B0

## Completion (ACQUISITION #16)

**Reading set** (mechanics §17, K2304): measured over 300 KB (requirements 50 KB, own code 199 KB, own tests 371 KB, plus the used modules' public parts). Read whole myself: `build/requirements/acquisition.md`; layer 3's row of `build/layers.md`; the plan's entry T41-8b and K2442; membership's Purpose/Terms and the service my Uses names for R41, `viewerPredicate` (its R43, with R44, R77, R85, R120 as they bear on it) and its code (`src/membership/index.mjs`:1–140); `archivelist.test.mjs`; the code that test exercises (`unpack.mjs` `sees` :292–299 and `archiveList` :733–800). Two workers read the rest whole: one the four source files (`index.mjs`, `checks.mjs`, `keyed.mjs`, `unpack.mjs`; a ~5 KB summary citing file:line: `Acquisition.sees` the one sight seam, catching a throwing gate as not visible; refusal order BAD_SHA → sight ARCHIVE_NOT_HELD → holding → NOT_AN_ARCHIVE; no other export consults sight; R10's EMPTY/TOO_LARGE at `index.mjs`:988–1002 and `profileOf` :1317–1384 independent of membership), the other the eighteen other test files and `fixture.mjs` (a ~6 KB summary citing file:line: every other `archiveList` call uses the machine viewer `class:admin` with no home set; no other test reads membership's tables or project bundles; R10 EMPTY/TOO_LARGE at `acquire.test.mjs`:299–337, `profileOf` at `origin.test.mjs`:66–95, `profile.test.mjs`:323–347). Nothing they left out mattered: all 157 tests pass.

**Entry applied (T41-8b, tests only).** Cause of both reds: the test's stand-in for membership's tables lacked `project_sight`, which D54's rule now reads, so the gate's SQL threw and `sees` answered false even to a participant. `archivelist.test.mjs`'s `sight()` now creates `project_sight` (R120's columns) with `set(project, setting)` and `admin(member)` helpers. Re-stated:
- the refusals test (was :137–:160): an outsider, an active administrator and the founder (`admin`, `member:admin`) neither invited nor joined to a hidden project's archive get exactly the not-held answer; a project absent from `project_sight` reads hidden; negative controls: a participant, an administrator who joined, and a machine viewer see it with each entry's bundle; once discoverable, administrators and the founder see it and an outsider still does not; an entry's bundle in a hidden project is null for outsider, administrator and founder and answered to a participant.
- the office-file test (was :235–:260): the hidden office file answers ARCHIVE_NOT_HELD (no `format`, no `part`) to outsider, administrator and founder; negative controls: a participant gets NOT_AN_ARCHIVE, and so do administrator and founder once the project is discoverable, the outsider still not.
No code changed; no requirement assumes the old sight (R41 defers to membership R43), so no QUESTION. `capture` R86's R10 refusals and `profileOf` are unchanged.

**Tests and checks.**
- `node --test test/m/acquisition/`: tests 157, pass 157, fail 0. No layer tests named in the manifest. No provided service changed, so users' suites not run.
- `format` 0 failures; `architecture` acquisition 0 failures; `coverage` 45 of 45; `ownership` 1 file, 0 failures.

**Deferred.** None. **Found in other modules.** None. Generated artifacts: none staled (tests only).

Size (session_01EA4bemqG5MNcZ6DDzxcD2d): test runs 3, module lines 0
