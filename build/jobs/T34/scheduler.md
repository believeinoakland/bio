# scheduler (T34)

**Status** · session_01DWGvb5ymJ1hBtv8vEfM6AM · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied: T34-51, all five parts.**
1. **R22.** `scheduled-publish` sits after `deadline-recheck` and before `working-on-seal` (R5) and answers under `scheduledpublish` (R2). Its `wake` and `due` are `publication.publishWake()`. Its `tick` awaits `publication.publishDue(now)`, with `now` given as ISO instant text, which publication R67 reads. A firing inside the grace before the set time takes nothing, and the reconcile re-arms at the time. R11's start re-derives the alarm from `publishWake`, so an edition whose time passed is taken at the next firing.
   - Guard against spinning. An edition can still be waiting after a tick at or past its time: a take that threw, or one another firing holds. That set time is then held, wanting no wake, until publication's next R71 notice or the instance's next start. It is never retried on an interval of this module's (R7).
2. **R9 and R22's arming.** The scheduler registers once with `publication.onPublishScheduled` (R71), and each call runs `arm` (R4). A take's notice arrives inside this module's own tick. It arms nothing there, so `onAlarm`'s authoritative reconcile stands (R1).
3. **R23.** The scheduler registers once with `answers.onStandingSet` (R27), and each call runs `arm`.
   - A refused registration of any notice is kept as a start-up fault, answered by a new `faults()` and logged with `console.error`; it is never ignored.
4. **R9.** The scheduler registers with `duties.onDutyTracked` (R26), `people.onChecksChanged` (R35) and `moneyChecks.onDetectorSwitchedOn` (R16). Each notice asks its daily consumer for a pass at the next firing, even if that local day's pass already ran or found nothing, and then arms. Without this the change would wait for the next local day (money-checks R16's "at once").
   - The request is held in memory only, so a notice writes nothing but the alarm (R17). If the instance is evicted before the alarm fires, the request falls back to the next local day.
   - `schedulerOf` passes `publication`, `answers`, `duties`, `people` and `moneyChecks` to `listenTo`, and `publication` among the owners.
5. **R12.** Part (5) is cleared. The plane test now connects ruth's account through `op=accountreferenceset` (member named, kind `apikey`) before `airunopen`. Its Miniflare bindings gain `ACCOUNT_SEAL_SECRET`, as capture-requests' plane test has.

**Deferred:** none.

**Found in other modules:** none.
- Generated artifacts: the plane bundle includes scheduler's source, so it is stale until BOB regenerates it at L10's close (mechanics §14).
- For BOB: R2, R5, R9, R22 and R23 can lose their `*(not yet met: T34)*` marks.

**Tests and checks:**
- `node --test bio-plane/test/m/scheduler/`: 95 pass, 0 fail (was 81 pass, 1 fail with R12 red). The new `t34.test.mjs` has 13 tests:
  - against stand-ins: R22's placement, wake, tick, grace and late take, and the hold; R9 and R22's notice, including a take inside the tick; R23's notice and its fault; R9's three daily notices;
  - against the real owners: publication (set, move, cancel and take, with an asynchronous publisher), answers, duties, people and money-checks, each act driven and the alarm read.
  - `consumers.test.mjs` and `registry.test.mjs` re-pinned for the new R5 place.
- Modules that build the scheduler, compared before and after the change: plane 109/1 both (accepted red 8, `store.test.mjs`:91), tasks 74/0, queue 124/0, instance-setup 112/0.
- Process checks:
  - `format`: 127 modules, 126 requirements files; 0 failures.
  - `architecture`: 10 product files, 49 relative imports; 0 failures.
  - `coverage`: 23 of 23 live requirement ids named by a test; 0 failures.
  - `ownership`: 7 files changed by scheduler between tranche/T34 and HEAD; 0 failures.

Size (session_01DWGvb5ymJ1hBtv8vEfM6AM): test runs 9, module lines 657
