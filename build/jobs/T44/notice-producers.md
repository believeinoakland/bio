# notice-producers (T44)

**Status** · session_01RhbWSRE68A8BuBfXi1xUnS · depth 2 · COMPLETE · handled B1

## Completion (T44-10)

**Read.** Whole: `build/requirements/notice-producers.md`; the plan's T44-10 entry and its Rules at the opening (rule 4 as at B1); K2719, K2725, K2726, K2729, K2732, K2736; DEC-191 and DEC-192; `plan/draft-T44.md` § N869; and this module's own code (`index.mjs`, `words.mjs`) and every test file under `test/m/notice-producers/`, every line, not only what changed (P20, rule 2). The used modules' public parts (over the 600 KB set, mechanics §17 (3)): one helper agent read in full the Public parts of civil-time, ai-use, steps, investigation, credentials, queue, question-explorer and review and wrote a digest citing each section. From it: civil-time R1 `localDay` (whole-second UTC instants only; a refusal object for anything else), ai-use R5's entry fields, steps R23's `looked_at`, steps R12's and investigation R3's dates, and queue R51 passing the sentences through. Cited sections were checked against the words file where it mattered.

**Entries applied.**
- R16 (T44): `{date}` is `date.daymonth`, or `date.daymonthyear` when the local day `reached_at` falls on (civil-time, in the profile's zone; UTC with none, K2725) is not in the current local year, which is the year of the read's own local day. `{day}` has no leading zero. `{when}` after "until" is `ai.until.day`, or `ai.until.month` with the next period's month ("… pause until 1 November"). `ai.when.*` is no longer held here, since the refusals keep it and they are ai-use's.
- R16 (DEC-191 (2)): the three new uses' `ai.use.enquire|read|account.inline` are held, so a limit on any of the nine uses reads `ai.queue.limitreached`. A scope words.json names no use for still reads `.overall` (J1 (3)).
- R17 (T44): `{date}` in `queue.step-later-found.detail` (steps R23's `looked_at`, else `at`, read as the local day), `queue.step-date-due.detail` and `queue.milestone-overdue.detail` (their local days) is filled the same way.
- `NOTICE_WORDS` equals `words.json` for every key it holds, which clears rule 4 (6)'s reds: `accounts.test.mjs`:95, 121 and `words.test.mjs`:22. They now read the words file, with no old text pinned.

**Found in my own module, fixed (P8).**
1. `#zone()` read the settings row and combined the profiles on every call. R17 asks it for each dated item, so up to 200 a source. It is now read once per `noticeItems` read and cleared in its `finally`.
2. `#localDay` handed civil-time any string. An instant with a fraction of a second or an offset (a source not stamping whole seconds) was refused, so that `{date}` was null and the item was silently dropped (R16) or left unfilled (R17). Any full ISO date-time is now normalised to whole-second UTC first. A bare day, or anything that is no instant, still reads no day. This is tested.
3. `#localDate` duplicated `#localDay`'s body. It now uses `#localDay`.

**Deferred.** None.

**Found outside my entries (for BOB, no change made).** DEC-191 (3) makes `date.daymonth` "the one format for a local day in a sentence". This module's other sentences still write ISO days because their requirements say so and their sentences are not keyed: R6's (`by 2026-10-10`), R13's DEC-145 (5) sentence (`captured on 2026-09-30`), R14's and R15's (`on 2026-10-06`), and R5's question (`as known on …`). R12's names an instant. The draft's doubt 6 already reads these as a later wording entry once the design stream keys them. Noted, not changed.

**Tests and checks.**
- `node --test test/m/notice-producers/` (from `bio-plane/`): 97 tests, 97 pass, 0 fail. Before the change: 95, 92 pass, 3 fail (the accepted reds). New tests: `R16 (T44) {date}…` (7 October local, the 6th-local/7th-UTC control, a fraction of a second, 31 December 2025 read on 1 January, a year-boundary control in the profile's zone, `{when}` "1 November" after "until") and `R17 (T44) each {date}…` (the three details, in-year and out-of-year, a UTC control, `at` when `looked_at` is absent). Against the old code they fail: 5 fail.
- Users: queue (`test/m/queue/`, `test/conclude-project.test.mjs`): 137 tests, 137 pass, 0 fail. plane (`test/m/plane/`, `test/system/migrate-released.test.mjs`): 191 tests, 191 pass, 0 fail, 0 skipped. No red.
- Checks: `format: 147 modules, 146 requirements files; 0 failures`. `architecture: 15 product files, 71 relative imports …; 0 failures`. `coverage: 1 modules, 17 of 17 live requirement ids named by a test; 0 failures`. `ownership: 6 files changed by notice-producers between tranche/T44 and HEAD; 0 failures`.
- No file was added outside `paths`/`tests`. No generated artifact is touched, but the plane bundle includes this module's source, so it is stale until L11's close regenerates it (rule 4 (5)).

Size (session_01RhbWSRE68A8BuBfXi1xUnS): test runs 11, module lines 1418

## J1 · COMPLETE

T44-10 done (R16, R17). {date} uses date.daymonth, or date.daymonthyear outside the current local year. {when} after "until" uses ai.until.*. NOTICE_WORDS equals words.json, which clears rule 4 (6)'s three notice-producers reds by reading the words file. I fixed three flaws in this module: the zone is now read once per read, ISO instants with a fraction or offset are normalised for civil-time, and a duplicated helper was merged. Tests 97/97. Users: queue 137/137 and plane 191/191, no red. Checks format, architecture, coverage and ownership all 0 (6 files, all in paths/tests). For BOB, unchanged: R5, R6 and R13–R15 sentences still write ISO days because their requirements say so (draft doubt 6). The plane bundle is stale until L11's close. Details are in my record.
