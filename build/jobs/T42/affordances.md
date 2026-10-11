# affordances (T42)

**Status** · session_01PxX2Bm2JD3fpmmPKa3jkr5 · depth 2 · WORKING · handled B1

## Record

**Entry applied.** T42-25b (N832; N826; K2656), tests only, no requirement changed:
- `catalogue.test.mjs` (R27's test): `LATER` gains `"pagetranscribe"` (op-grades R31), with an explicit check that it is `undetermined` and unranked, and a negative control (left out of the pinned list, it is seen among the rest; K874).
- `backing.test.mjs` (R19): `inboxresolve` is driven at `doorbell`'s interface (`test/m/doorbell/fixture.mjs`, its R3) instead of capture's copy, so capture's T43 delete is clean.
- Also for the clean T43 delete (same intent, my own tests): `catalogue.test.mjs` reads `inboxpull`, `knocksof`, `pulledknocks`, `doorbelltally` and `doorbellrefused` from `doorbellOps`, not `captureOps`, and `RESOLVE_NO_REASON`'s row from `doorbell/checks.mjs` (the same object capture's table holds until T43). After this job, no affordances file reaches capture's doorbell copy.
- `build/modules.json`: edge **affordances → doorbell** added to `uses` (after `capture`), as B1 asked.
- Own flaws fixed (comments only): `affordances.mjs`:1431 said "three" set acts (there are four, R1); the header of `sources.test.mjs` now names doorbell beside capture.

**Depends on T42-25a.** Until op-grades' R31 merges, `catalogue.test.mjs`:510 (R27's test) is red with `pagetranscribe: undefined !== 'undetermined'`. That is expected and it is the only red. With R31's grade simulated locally (`RUNG_ABSENT.pagetranscribe` `undetermined` plus a `NON_ACTS` row, never committed, reverted), all 232 affordances tests pass.

**Reading (mechanics §17; K2304).** Read whole myself: `build/requirements/affordances.md`; layer 11's row of `build/layers.md`; `build/plan/draft-T42-l11.md`; K2656; op-grades R31; doorbell's public part and `test/m/doorbell/fixture.mjs`; `doorbellOps` (`doorbell/index.mjs`:742–770); `catalogue.test.mjs` and `backing.test.mjs`. A worker of mine read the rest of the module's code and tests whole and wrote a summary of 5,949 bytes, each statement citing file and line. It found no other place that pins the `undetermined` count and no other import of capture's doorbell surface.

**Found in other places (for BOB; none blocks this job).**
- `build/requirements/affordances.md`, Size paragraph: stale. It gives `affordances.mjs` 2,225 lines (it is 1,554) and names `store.mjs` and `index.mjs`, which are now `facts.mjs`, `door.mjs` and `words.mjs`. BOB's file.
- Several affordances test titles still name ids retired to op-grades (R2, R3, R7, R27, R35, R38, R40, R42, R43, R45) beside live ones. Coverage passes (34 of 34 live ids named). I left them, because re-keying the titles is a wider re-wording than this entry.

**Tests and checks.**
- affordances: 232 tests, 231 pass, 1 fail (the R27 test, waiting on T42-25a, above); 232 of 232 pass with R31 simulated.
- Users' suites (P11), all green: tasks 106/106, queue 136/136, op-declarations 128/128, store-door 43/43, control-plane 216/216, plane 166/166.
- Layer tests: none (manifest).
- format: 0 failures. architecture: 0 failures. coverage: 34 of 34 live ids, 0 failures. ownership: see the line below.

Size (session_01PxX2Bm2JD3fpmmPKa3jkr5): test runs 10, module lines 28
