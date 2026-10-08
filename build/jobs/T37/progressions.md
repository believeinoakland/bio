# progressions (T37)

**Status** · session_01Q8jnptX8F9t9Vmj1SzQSsy · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied.** T37-12 (test only; K2090, N752): `order.test.mjs` (R41) no longer pins a literal layer 5. It reads layers 5 and 5–8 from `build/modules.json`, as membership's R83 test does, and checks each is one run of `MODULE_ORDER` in the file's order, so red 4 clears (law-relations is now in the run) and a module added to a layer never stales it.

**Fixes in my own module, found during the job.**
- `instance.test.mjs` (R33) pinned the literal call order `bias, intent, scheduler`, the same staleness as red 4. It now reads that order from `MODULE_ORDER`, checks the three are in it and the two stand-ins are not, and still requires the out-of-order modules last, in registration order.
- `progressionsOf` (`src/progressions/index.mjs`) cached the instance before `declareTable` and `registerFigures`. When record-core refused the tables, the first call threw, but a later call on the same host got an instance whose tables were never declared (R42). It now caches the instance only after both succeed. New test `dispose.test.mjs` "R42: a host whose record refuses the tables gets no instance…" fails without the fix (8/1) and passes with it. The success path is unchanged and no service changed.

**Reading (mechanics §17).** I measured the set at about 316 KB: own requirements 26 KB, the Purposes of the 14 used modules 8 KB, code and tests 282 KB, plus the used services. That is over 300 KB, so I followed START's (3).
- Read whole myself: `build/requirements/progressions.md`; layer 5's row of `build/layers.md`; `order.test.mjs`; `fixture.mjs`; membership's R83 and its `module-order.test.mjs`; `progressionsOf` (index.mjs 1520–1545); R33's test (instance.test.mjs 225–260); R42's test (dispose.test.mjs 1–20, 210–233).
- Two workers read the rest in full, `src/progressions/*` (2,113 lines) and the other 12 test files (2,033 lines). Their summaries are about 1,400 and 1,500 words, and every statement cites file and line.
- What the summaries left out did not matter: the code orders listeners only through `MODULE_ORDER.indexOf` (index.mjs:945), reads `modules.json` nowhere, and has no listener order but R33's slot.

**Deferred.** These are flaws the src summary reported in my module, outside a test-only entry, left as they are:
- `threadInstance` runs a whole-store `overdueScan` on each thread when a listener is registered (index.mjs:891). It also uses the write clock rather than the configured `nowMs` for `nextDeadline`, which R33 states at the thread's instant, so that part is as specified.
- Listeners are awaited one after another, so one that never settles delays the answer (893). R33 covers only throws and rejections. This one is a design question for BOB.
- The `zoneOf` doc comment (38–39) names the wrong default.

**Other modules.** Nothing found.

**Tests and checks.**
- progressions: `tests 62, pass 62, fail 0`.
- Tests of the modules that import progressions (affordances, calculations, control-plane, inquiry, intent, money-checks, plane, queue, queue-producers, store-door): 1,104 pass, 32 fail. The same 32 fail with my change stashed (65 identical `✖` lines before and after), so none is mine: affordances fails 29, plane 3, every other module 0.
- Layer tests: none named in `build/manifest.md`.
- format: `136 modules, 135 requirements files; 0 failures`.
- architecture: `16 product files, 66 relative imports …; 0 failures`.
- coverage: `42 of 42 live requirement ids named by a test; 0 failures`.
- ownership: `0 failures`, re-run after commit below.

Size (session_01Q8jnptX8F9t9Vmj1SzQSsy): test runs 20, module lines 2114

## J1 · COMPLETE

T37-12 applied: order.test.mjs (R41) reads layers 5 and 5–8 from modules.json, so red 4 clears. Also fixed in my module: instance.test.mjs (R33) no longer pins a literal call order; progressionsOf caches its instance only after declareTable and registerFigures succeed (R42), with a new test. progressions 62/0. Users' tests 1104/32, the same 32 failing without my change (affordances 29, plane 3). format, architecture, coverage (42/42) and ownership all 0 failures. Deferrals are in the record.

## B2 · CHANGE (K2204)

**Applied.**
- (1) R33 says `nextDeadline` is R17's `next_deadline` at the thread's instant, and that is the whole store's earliest deadline. A scan of the thread's own instance would change that answer whenever another instance falls due sooner. My reading of "only that thread where R33 allows" is therefore this: the whole-store scan runs only when a listener reads `nextDeadline`, and then once for the thread, with the answer unchanged (J2 QUESTION).
  - Each listener now gets its own event, with `nextDeadline` as a memoised enumerable getter (index.mjs, `threadInstance`).
  - Scheduler's listener ignores the event (scheduler/index.mjs:680), so a thread with scheduler listening now costs no scan.
- (2) The `zoneOf` comment now names its real default, `governingZone(localFactsOf(host, {record}))`, and what it answers (`{zone: null, why}` when none or several zones govern).
- The awaited listeners stay as they are (K2204).

**Test.** New: instance.test.mjs "R33 R17: a listener's nextDeadline is the whole store's next deadline at the thread's instant, scanned only when a listener reads it, once per thread". It shows:
- a listener that ignores the deadline costs no events reads;
- two listeners that read it share one scan, each gets its own event, and both get the store's deadline (another instance's, earlier than this thread's).
- It fails on the old code (12/1, "no scan for a listener that ignores the deadline") and passes with the change.

**Tests and checks.**
- progressions: `tests 63, pass 63, fail 0`.
- Users: affordances 188/29 and plane 140/3 (rule 6 items 7, 14, 17). Calculations, control-plane, inquiry, intent, money-checks, queue, queue-producers and store-door have 0 failures.
- scheduler, which registers on R33: 109/5. The same 5 fail with the change stashed (identical `✖` lines). They concern requests, promotion clocks, entities and selection sweeps, none of them progressions.
- format, architecture and coverage (42 of 42): 0 failures. Ownership (5 files): 0 failures.

Size (session_01Q8jnptX8F9t9Vmj1SzQSsy): test runs 30, module lines 2127
