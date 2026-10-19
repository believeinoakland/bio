# T51 local walk: findings traced to fixes (K4111)

**Status** · Run at K4145 (BOB #228): 120 failures, groups A–C below, open; the walk runs again only once each is closed by a fix whose test exercises the live page's path. Written by BOB #227 before the walk's next run (journey-check R1 (a), after the completion round's last merge). The last run (K4105, on the L11 close tree): 201 steps, 125 failures; its whole output was not kept (BOB #226's container), so the groups below are K4105's. A group is closed only by a merged change and a test that covers it; the walk runs again only when every row is closed (Bob, K4111).

| # | group (last run) | owner | fix | covering test | state |
| --- | --- | --- | --- | --- | --- |
| 1 | R27 counts values read from the Oakland profile on `elsewhere` and `places` (data, K4086) | journey-check | B4 | `dec340.test.mjs` "R27 (K4086, K4111)": profile values not reported, a hard-coded sentence beside them reported | **closed** (K4113) |
| 2 | R27 counts vendor names on `setup` (data) | journey-check | B4 | same test: vendor names not reported, control | **closed** (K4113) |
| 3 | R27 counts the scanner catalogue's labels, hints and legends on `setup` (36 at 1280 px) | file-scanner | CR-17 (K4123) | `catalogue-words.test.mjs`: GET /providers under a pseudo-locale, no plain sentence in any member-facing field, a control per field | **closed** (K4123) |
| 4 | `investigation.mjs`:422, the fixture document's text (words check) | journey-check | B4 (the reading is the fixture's `NOTICE_PASSAGE`) | words check 0 | **closed** (K4113) |
| 5 | `document` draws no `screen.document.passages.head` (R9 step 7, R16): stale step | journey-check | B5 (`document.read.title`) | `dec340.test.mjs`, `words.test.mjs` | **closed** (K4113) |
| 3b | `security`'s catalogue sentence `ADMIN` ("stated by the administrator"), excluded by R27 as a row name (JOURNEY-CHECK #7 J3) | file-scanner | CR-17 (K4123) | same test (`ADMIN` keyed) | **closed** (K4123) |
| 3c | three `lines.index.*` rows hold `{a, b}` braces a member would see literally (setup-words R13) | UX-DESIGN | DEC-369 @ e2b319b55d (U400, K4119) | setup-words R13 (`word-list.test.mjs`:247) | **closed** (K4122: 21 of 21 on the merged tree) |
| 6 | `dash-project` from Home's door draws "Nothing is here" (R22) | screens-daily | R51, K4107 | screens-daily's door test (several, one, none) | **closed** (K4110) |

## Changes since the last run that could add a finding (each covered by its own test before the run)

| change | owner | covered by |
| --- | --- | --- |
| the compare tab, matched by `capture_sha` (R81) | screens-inquiry CR-19 | its keyed-words test |
| the original-file card and `document.kind.<format>` rows (R82) | screens-inquiry CR-19 | its keyed-words test |
| `lastActivity()` read on the bootstrap facts | credentials CR-16, instance-setup CR-12 | their tests |
| instance-setup's twelve leaf texts read by key | instance-setup CR-12 | words check 0 |
| a reason inside a reason (`word`) | setup-words CR-14 | its R19 test |
| the original-file card's kind from `format` (R83, extraction R78) | screens-inquiry, extraction | screens-inquiry's R83 test (`document.kind.<format>`), extraction's R78 tests |
| `security` reads `handling.on_own` (R62, file-scanner R33) | screens-settings, file-scanner | R62's Spanish-recipient test and control; R33's tests |
| the four `screen.members.*` removal keys listed (DEC-371) | screens-settings | R39 (`contract.test.mjs`) green |
| the ask reads `readingLanguage` from `translations` (plane R67, instance-setup R99) | plane, instance-setup | `door.test.mjs`, `t48.test.mjs`; R99's test |

## Seen by journey-check, already fixed before the last run

- `held`'s project slug "roof-repairs-at": screens-intake drew the project's name since K4094 (`held.test.mjs`:373–380).
- `elsewhere`'s link slugs ("Report-an-Issue-OAK", "get-legal-help"): screens-daily draws the label or the site since B9 (`elsewhere.test.mjs`:41–51).

## The run at K4145 (`walk-T51-run.txt`): open

| # | group | owner | fix | covering test | state |
| --- | --- | --- | --- | --- | --- |
| A | R22: Home draws no door to `dash-action` (R20's control fails only as its echo) | journey-check | CR-25 (R22 amended) | `live.test.mjs` R22 (Action block absent, by address, noted) | **closed** (K4148) |
| B | R27 on `setup`: catalogue labels, hints, legends, vendor names escape (the pseudo route rewrites only the document's word pairs) | journey-check | CR-25 (R29 (a), (b), (c)) | `pseudo.test.mjs` R29 (a): real `setup`, `security` (fold open) | **closed** (K4148) |
| C | R27 on `places`, `elsewhere`: profile values outside `DATA`'s `li` selectors | journey-check | CR-25 (R29 (b)) | `pseudo.test.mjs`: real `places` (chooser), `elsewhere` | **closed** (K4148) |
| D | R27's `RUN` on comma-joined lists and fills (Home with three languages and places; not reached by this run) | journey-check | CR-25 (R29 (b)) | `pseudo.test.mjs` R29 (b): real Home | **closed** (K4148) |
