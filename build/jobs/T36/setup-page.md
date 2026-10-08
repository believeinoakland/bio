# setup-page (T36)

**Status** · session_01KpmmveDcVwoSp31P7oGuzY · depth 2 · WORKING · handled B3

## J1 · QUESTION

R30 offers "every file" (`use: "routine"`) only for a tool on the organization's own servers (file-safety R32), with a monthly limit defaulting to `DEEPER_CHECKS_PER_MONTH`. The catalogue entry (R27) carries `handling.recipient` but no flag saying whether it is the organization's own; that rule is file-safety's exported `onOwnServers(recipient)`. My Uses says file-safety is "for its tests only".

Best reading (carrying on with it): the page injects file-safety's `onOwnServers` (by its `toString()`, as it injects action-grammar's `riskTierState`) and `DEEPER_CHECKS_PER_MONTH`, never a copy, so setup-page's code imports file-safety (the `modules.json` edge exists; layer 3 before 11). That makes the Uses line "R30's rule for `routine` and the monthly limit's default, injected; and for its tests, R30's ops" rather than "tests only". If you would rather keep the edge tests-only, the alternative is to offer "every file" for every tool and state file-safety's `USE_NOT_ALLOWED` when it refuses, which R30's "only for" forbids.
