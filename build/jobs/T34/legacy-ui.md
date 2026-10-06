# legacy-ui (T34)

**Status** · session_01Tt8vMBj5jdqRcKeLtADYYr · depth 2 · COMPLETE · handled B1

## Completion (LEGACY-UI #2)

**Entries applied.**
- **T34-77 (N628; K1708).** `queue-recipients.test.mjs`: alice connects her own account (`op=accountreferenceset`, the plane's route; `ACCOUNT_SEAL_SECRET` bound, credentials R23) before she opens her two runs (ai-runs R52); the NOBODY run by the machine credential and its §3 are retired (refused C-22.19 under K1481), the header says what is no longer driven (the "nobody" branch stays in the page); cora's still-valid check (named on nothing, shown neither obligation) kept as a slim §3. `several-cases-choice.test.mjs`: Q's `basis: [LEDGER]` dropped (C-120.8 refused case X) and `publish` sends `tieAttested: true` (case-authoring R55); 15/0.
- **T34-87 (DEC-149), 36 rows.** 33 re-worded in `civicos-ui/app.html`. "Your group's Civicsmith" for the member's own screens, reads and refusals; "this group's Civicsmith" where a reader with no credential is answered too (K1821 (2)): the `published` and `published-case` screen purposes and `errPane`, which also paints the public case page. No name where none is needed: the group line (`GROUP_WORDS` and its three markup sites, "Could not read this group just now", "No group is recorded yet"; the public page's header shows it to strangers), the `monitored` mark's meaning, and SSHSIG's "Civicsmith's releases". **Kept, 3 rows:** :26107, :26122 and :26148 sit inside the review-copy range BOB's START keeps, and their "this copy"/"the copy" is the review copy itself ("Export this copy to a file", "Back to the copy"), not the group's Civicsmith. Comments, the HTTP header and `check-mock-envelope.mjs` are unchanged. The new test `civicos-ui/test/dec149-wording.test.mjs` names each changed string: it drives the running script for the group line, `rec`/`recPost`, `teach`/`errPane`, `SURFACES`, `GLOSSARY` and `notifClassLine`, and reads the rest in the page as served. Negative control: against the unchanged `app.html` it fails 6 of 7 tests. No check translation changed, so the catalogue version does not move.
- Tests pinning old wording re-anchored: `group-surface.test.mjs` (`SILENT_RE` admits "this"; 45/45), `notifications.test.mjs` §4, and `document-page.test.mjs`'s errPane guard. None of these weakens a check.

**Left red, not mine (BOB's START: the DEC-88 shares stay N487's; accepted red 5; K1054, K1055, K1708).**
- `queue-recipients.test.mjs` is red on one fixture line only: `op=biasadopt` is refused C-26.21 `BIAS_ADOPTION_NO_REASON` (DEC-88), so the sweep raises nothing and the arms after it fail. Measured with a `&reason=` added to that call in a scratch copy, never committed: 12 pass, 0 fail. The one-line fix is N487's to make or BOB's to move here.
- `progression-revision.test.mjs` and `statement-ack.test.mjs`: unchanged (N487).

**Deferred.** None.

**Found in another module.** None owed. `bio-plane/src/setup.mjs` and `bio-plane/test/m/instance-setup/page.test.mjs` hold their own "This copy could not read its group" (instance-setup/setup-page, T34-81/T34-96 rows), not touched here.

**Tests and checks.**
- `node --test civicos-ui/test/`: 36 files, 33 pass, 3 fail (progression-revision, queue-recipients, statement-ack; N487 as above). It was 27 pass, 4 fail at start (several-cases-choice was the fourth); `dec149-wording` and `stdio-census` are green.
- `node --test bio-plane/test/d57selflink.test.mjs` (reads `app.html`): 1 pass, 0 fail.
- `checks/format.mjs`: 129 modules, 0 failures. `architecture.mjs legacy-ui`: 0 failures. `coverage.mjs legacy-ui`: 0 of 0 ids (no requirements file, K633), 0 failures. `ownership.mjs legacy-ui tranche/T34`: 8 files, 0 failures.

Size (session_01Tt8vMBj5jdqRcKeLtADYYr): test runs 17, module lines 27229

## J1 · COMPLETE

T34-77 and T34-87 applied (record: Completion). several-cases-choice green (15/0). queue-recipients: account and C-22.19 shares cleared; it stays red on one fixture line only, biasadopt refused C-26.21 (DEC-88, N487's share as your START keeps it). With a reason added in a scratch copy it reads 12/0, so the fix is one line if you move it here. DEC-149: 33 of 36 rows re-worded, the 3 review-copy rows (:26107, :26122, :26148) kept, every change named by the new dec149-wording.test.mjs. legacy-ui 33 pass / 3 fail (N487: progression-revision, statement-ack, queue-recipients). Checks: format, architecture, coverage and ownership all 0 failures.
