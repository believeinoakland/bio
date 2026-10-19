# T51 local walk: findings traced to fixes (K4111)

**Status** · Written by BOB #227 before the walk's next run (journey-check R1 (a), after the completion round's last merge). The last run (K4105, on the L11 close tree): 201 steps, 125 failures; its whole output was not kept (BOB #226's container), so the groups below are K4105's. A group is closed only by a merged change and a test that covers it; the walk runs again only when every row is closed (Bob, K4111).

| # | group (last run) | owner | fix | covering test | state |
| --- | --- | --- | --- | --- | --- |
| 1 | R27 counts values read from the Oakland profile on `elsewhere` and `places` (data, K4086) | journey-check | B4 | (its J entry) | open: job running |
| 2 | R27 counts vendor names on `setup` (data) | journey-check | B4 | (its J entry) | open: job running |
| 3 | R27 counts the scanner catalogue's labels, hints and legends on `setup` (36 at 1280 px) | file-scanner | CR-17 | CR-17's own test (START note 2) | open: CR |
| 4 | `investigation.mjs`:422, the fixture document's text (words check) | journey-check | B4 | words check 0 | open: job running |
| 5 | `document` draws no `screen.document.passages.head` (R9 step 7, R16): stale step | journey-check | B5 (`document.read.title`) | (its J entry) | open: job running |
| 6 | `dash-project` from Home's door draws "Nothing is here" (R22) | screens-daily | R51, K4107 | screens-daily's door test (several, one, none) | **closed** (K4110) |

## Changes since the last run that could add a finding (each covered by its own test before the run)

| change | owner | covered by |
| --- | --- | --- |
| the compare tab, matched by `capture_sha` (R81) | screens-inquiry CR-19 | its keyed-words test |
| the original-file card and `document.kind.<format>` rows (R82) | screens-inquiry CR-19 | its keyed-words test |
| `lastActivity()` read on the bootstrap facts | credentials CR-16, instance-setup CR-12 | their tests |
| instance-setup's twelve leaf texts read by key | instance-setup CR-12 | words check 0 |
| a reason inside a reason (`word`) | setup-words CR-14 | its R19 test |
