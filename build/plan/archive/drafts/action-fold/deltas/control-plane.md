# control-plane — the fold's changes

**Status** · Written by a worker for BOB #74, 2026-09-30, against `build/requirements/control-plane.md` on `tranche/T17` (highest id R40; R39 held for `op=purge`'s gate, K607). No new id: R26 ("the routes are the modules' own maps"), R29 (no caller-supplied stamp) and R31 ("an op spec for every op any module serves") already require what the new ops need; the job applies them. One new `uses` edge: `action-plans`.

## What the job applies (no text change)

- **R31, R29:** an op spec, with its stamps and capability, for each new op: `action-plans`' `planopen`, `plansubjectadd`, `plansubjectremove`, `plan`, `plans`, `optionadd`, `optionrevise`, `optionpropose` (any credential, stamped `proposer`), `optionadopt`, `optiondispose`, `scenarioset`, `checkpointrecord`, `optionstart`, `planclose` (`author` and `viewer` stamped, as `actions`' ops are); `actions`' `actioncreate`, `action`, `actions`, `actionpressure` (its R47, R48); `filings`' `communicationprepare` (its R23, stamped `preparer`). Each is tested for R29.
- **R22:** `action-plans`' own check table is added to the tables the door reads (`MODULE_CHECK_FILES`, or `CHECK_FAMILIES` if T18's K585 (1) lands first), so its refusals are decorated.
- **R27:** `plans` names a project; it joins the declared `PROJECT_NAMING_READS`.

## Uses (add)

> - `action-plans`: `actionPlansOps` (R26), its check table (R22).
