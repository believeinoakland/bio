# answers (T47)

**Status** · session_01C7z3ksZT88uRq5xSFCgo2P · depth 2 · WORKING · handled B1

## Completion (ANSWERS #9)

**Entry applied** · T47-84 (K3084): `standing.test.mjs`'s R19 sign-in arm re-pointed to a held sign-in. Credentials R70 now answers a "connected" fact with no token held as not connected, so the test that served carol by `subscriptionConnected` alone was red (`{condition: "no_account"}` where `{switch_off, member}` was expected, :343). It now records the fact, shows `accountFor` answers `NO_ACCOUNT` while no token is held (the negative control), then holds a sentinel token by `subscriptionTokenHold` (credentials R70); every arm it proved before stands unchanged (use off: `{switch_off, member}`, no grant, no model; R32's `STANDING_SWITCH_OFF` the same hold; use on: the limit read for `member:carol`, then the grant minted for her and the model stub called once). Added: the held token appears in nothing this module answers or keeps (the answerer's arguments, `standing_runs`, `standing_questions`, the tallies, `standingAnswersFor`). No source change: `heldBack` already drops the account (and its `key`) once its level and owner are read (`standing.mjs`:363).

**Read** · requirements (whole); credentials' R70 and R71; all module code (`index`, `standing`, `check`, `checks`, `sentences`, `rules`, `scope`, `readlog`, `ops`, `schema`) and all tests (`fixture` and the ten test files) whole, myself.

**Deferred** · none in my entry.

**Found (REPORT J1)** · a read log's use is fixed by the grant's first read. `ruleAnswer` opens a log with use `ask` (it takes no `use`), and the plane's `logRead` (`plane/store.mjs`:634, `draftUse`) passes `use: "draft"` for a draft's grant to `logRead` only; `store-door`'s `underGrant` skips `op=rule`. So under a draft grant whose first read is `op=rule`, the log opens as `ask` and every later draft read is scrubbed with the projects kept away from asks, not from drafts (R30's widening of R2 for the grant's use). Fix needs both sides: answers' `ruleAnswer` and `rule` op taking a `use` (or the plane handing the draft use to the `rule` op's grant), and the plane passing it. Not done here: outside a test-only entry and needs the plane's half; left for BOB to plan.

**Tests and checks** (on `job/T47/answers`)
- `node --test bio-plane/test/m/answers/*.test.mjs`: before, 1 fail (R19 sign-in arm, :343); after, tests 63, pass 63, fail 0.
- No service of mine changed, so no user's tests re-run.
- `checks/format.mjs`: 0 failures; `architecture.mjs … answers`: 0 failures (21 files); `coverage.mjs … answers`: 34 of 34 live ids named, 0 failures; `ownership.mjs … tranche/T47`: 1 file, 0 failures.
- `checks/run.mjs`: format 0, architecture 0 failures (3071 files), channels 0; coverage 44 failures, none answers' (screens-* modules, public-read R35, queue R53, ratification R51, setup-words R6, wizard-scripts R31–R34 and others).

Size (session_01C7z3ksZT88uRq5xSFCgo2P): test runs 3, module lines 1894

## J1 · REPORT

A grant's read log takes its use from its first read. answers' ruleAnswer opens a log with use 'ask' (it takes no use), and the plane passes use 'draft' (plane/store.mjs:634, draftUse) to logRead only; store-door's underGrant skips op=rule. So a draft grant whose first read is op=rule opens as 'ask', and its later draft reads are scrubbed of projects kept away from asks, not from drafts (R30's widening of R2). Fixing it needs both sides: answers' ruleAnswer and rule op taking a use, and the plane passing the draft use for op=rule. Not done in this test-only entry; for BOB to plan.

## J2 · COMPLETE

T47-84 applied: standing.test.mjs R19 sign-in arm re-pointed to a held token (credentials R70: subscriptionTokenHold), with a control that the fact alone answers NO_ACCOUNT and a check that the token appears in nothing answers keeps. Test only, no source change. answers 63/63; format, architecture (21 files), coverage (34/34), ownership 0 failures; run.mjs architecture 0 (coverage's 44 failures none answers'). One finding in REPORT J1. Record: build/jobs/T47/answers.md on job/T47/answers.
