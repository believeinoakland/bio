# screens-intake (T48)

**Status** · session_01AsreeRSDo9rX7WgGKSQiar · depth 2 · COMPLETE · handled B3

## Completion

**Read, whole:** build/requirements/screens-intake.md; my T48-85 entry; the L11 section of build/layers.md (by grep of the contract); all seven files of bio-plane/src/screens-intake except words.mjs (read by its changed rows); capture.test.mjs (R1/R14/R16), held.test.mjs, archive.test.mjs, open-file.test.mjs, common.test.mjs, page.mjs; of interface-shell, the requirement lines R10, R19, R21, R35, R56, R61 and the kit's field/state/sec; of capture (L3), heldCaptures and its row helpers.

**Entries applied:** R17 (every class defined by a served stylesheet: `cs-tab` → the design's `mk-tabs2` spans, `cs-refusal` → `cs-state` failed, `cs-untested` → `mk-small muted`, the bare file label → `cs.field` type file, `mk-drop` gone; counts at zero not drawn in the archive summary, the held archive line, the archive's facts and the scanners' line, each by interim words marked for UX-DESIGN; a files section of no files not drawn). R18 (tab bar; one act row; Watch and Check, with the frequency, join it only after a capture; no watching section before one). R19 (Set aside drawn only with rows, a waiting question or a failed read, nothing while loading). R20 (bare or non-digest `archive` and `open-file` draw the shell's own "Nothing is here" words with the way back, as screens-publish does; the two "Name a …" words removed).

**R19's stall, traced:** I could not read biosmoke7 (401 without a member session). By code: the walk's unfiltered `heldcaptures` stayed loading while the filtered `set_aside` read (an empty list) answered, so the cost is per row. `Capture.heldCaptures` (capture/index.mjs 1041–1054) per row awaits `#archiveRow` (an `archiveList` on every capture of the row's document, which reads the archive's bytes, then pages of its entries) and `#eligibility` (an awaited reader with no time bound), for up to the limit asked (the screen asked 200). Fixed on my side: both reads now ask 50 rows (the screen already says more are waiting). Not fixed, not mine (capture is L3, closed): the unbounded per-row awaits. Unconfirmed against live data; see the REPORT.

**Deferred:** a screen whose reads are all empty draws its existing empty sentences; R17 says an empty state names the first step, and `screen.held.empty` does not (BOB's text; REPORT). The "a read that never answers is drawn failed at the shell's limit" control belongs to interface-shell R10's limit; here a refused read is drawn failed, and one still pending draws no Set aside.

**Found in other modules:** (1) capture `heldCaptures`, above. (2) `cs-pickc`, drawn by the shell's `cs.rows`, is on R17's list to rename (interface-shell's job); my R17 test exempts it by name. (3) interface-assets R7 (`shell.css`) has not merged: my test reads the design page's rules as its stand-in.

**Tests and checks:** node --test bio-plane/test/m/screens-intake/: 64 pass, 0 fail (new t48.test.mjs: R17 ×2, R18, R19 ×2, R20). format: 0 failures. architecture screens-intake: 14 files, 0 failures. coverage screens-intake: 20 of 20 ids named, 0 failures. ownership vs tranche/T48: 1 file changed... 0 failures. checks/run.mjs over the product: format, architecture, channels 0 failures; coverage failures are other modules' open ids only (none of screens-intake's).

Size (session_01AsreeRSDo9rX7WgGKSQiar): test runs 6, module lines 1190

## J1 · REPORT

Found outside my module: (1) capture heldCaptures (L3, capture/index.mjs 1041-1054) awaits per row, with no time bound, #archiveRow (an archiveList on every capture of the row's document) and #eligibility; the unfiltered heldcaptures the walk saw stall is per-row cost (the empty set_aside read answered). I could not read biosmoke7 (401), so it is unconfirmed; I cut the screen's page from 200 to 50 rows. A CHANGE to capture to bound or batch that work is yours to decide. (2) screen.held.empty does not name a first step, which R17's single empty state asks; the wording is BOB's. (3) cs-pickc, drawn by the shell's cs.rows, is on R17's rename list (interface-shell's job).

## J2 · COMPLETE

T48-85 done: R17-R20 met, 64 tests pass, format/architecture/coverage/ownership 0 failures for screens-intake. Record: build/jobs/T48/screens-intake.md.

## CHANGE B2 (K3303: interface-shell merged)

Merged origin/tranche/T48. Dropped my stand-ins: the R17 test now composes the real `SCREENS` under `checkClasses` (interface-shell R56) and no longer reads the design page as a stand-in; the `cs-pickc` exemption is gone. The real check found one class I had missed, `tw` (the safe view's table wrapper, defined by no served stylesheet); the wrapper is removed (`mk-table` stays). Two held tests now expect interface-shell R61: a refusal with its own words is drawn as those words alone, never wrapped in "Could not read this". Result: 65 tests pass, 0 fail; format, architecture (15 files), coverage (20 of 20) and ownership 0 failures. Nothing of mine stays red. Open as before: the capture `heldCaptures` per-row cost (J1, BOB's to route) and `screen.held.empty` naming no first step (BOB's text).

## J3 · COMPLETE

B2 done: tranche/T48 merged, stand-ins dropped, R17 now composes the real SCREENS under interface-shell R56 (one real find fixed: class tw). 65 tests pass; format, architecture, coverage (20 of 20), ownership 0 failures. Nothing of mine stays red; open items are BOB's (J1: capture heldCaptures per-row cost; screen.held.empty wording).

## CHANGE B3 (K3312: the Add tab bodies were hidden)

Merged origin/tranche/T48. `capture.mjs` wrapped each tab body in the design's `st`, which the served `shell.css` carries as `.st { display: none; }` (the mock's state switch), so all three tabs were invisible. The body now carries no class (`<div data-tab=…>`). New test (R18): each Add tab's body is drawn with its fields and none of its classes, or its ancestors', is one a served stylesheet hides; control: the same check finds `st` hidden. I had missed it because my class check asked only whether a class is defined, never what its rule does. 66 tests pass; format, architecture, coverage (20 of 20) and ownership 0 failures.

## J4 · COMPLETE

B3 done: the tab bodies no longer carry the design's st (hidden by shell.css); new R18 test that each Add tab body is visible under the served stylesheets, with a control showing st is hidden. 66 tests pass; format, architecture, coverage (20 of 20), ownership 0 failures; nothing of mine red.
