# progressions (T14)

**Status** · session_01TuM9BqWVJmKhPaVJPp6FHs · depth 2 · COMPLETE · handled B0

## Completion

**Entries applied.** N340 (B1): `DISPOSITIONS` is no longer declared here. `src/progressions/checks.mjs` imports `promotion`'s one list (its R51) and re-exports it, so `progressions/index.mjs` still publishes it, and `inquiry`, `affordances` and `basis-versions` keep re-exporting it through this module and `inquiry`, unchanged. The `uses` edge progressions → promotion is already in `build/modules.json`. No import cycle: promotion imports none of this module's dependants. `notADisposition` (R35) is unchanged and answers with that same array.

**`not yet met` marks this work meets:** R35 `(not yet met: N340)`. BOB can strike it.

**Tests** (`test/m/progressions/dispose.test.mjs`, the R35 test): `DISPOSITIONS` from `index.mjs` and from `checks.mjs` is `===` promotion's `DISPOSITIONS` and `REOPENABLE_FROM`; it is frozen, and a push throws with the list unchanged; the refusal's `dispositions` field is the same array. `notADisposition` gives the same answers as before for both words and for every other word.

**Check rows:** none added, moved or retired, so nothing is awaiting stamp.

**Grep for code added or retired** (the local `DISPOSITIONS` declaration): `civicos-ui/app.html`:18583 is a comment ("imports the SAME published `DISPOSITIONS` array"); `civicos-ui/test/conclude-act.test.mjs`:380 checks that app.html declares none; `civicos-ui/test/intent-write.test.mjs`:414 is a comment. All three still read true. `affordances.mjs`:117–118 re-exports through `inquiry`, unchanged. No code in either needs to change.

**Generated artifacts made stale (reported, not rebuilt):** `agent-worker/dist/agent-worker.bundled.mjs` and `bio-plane/dist/bio-plane.bundled.mjs`, because both bundle `src/progressions/checks.mjs`. `test/fleetbundles.test.mjs` shows agent-worker STALE (input hash and bytes). They get regenerated at layer close.

**Found in other modules:** nothing.

**Deferred:** nothing. R32 stays `test.todo` (K102's trigger, as before).

**Tests and checks run:**
- `node --test test/m/progressions/`: tests 43, pass 42, fail 0, todo 1 (R32)
- Modules that use the list, and promotion: inquiry 61/60 pass, 1 todo; basis-versions 47/47; queue 61/60, 1 todo; scheduler 48/46, 2 todo; intent 51/51; affordances 76/76; promotion 70/70; control-plane 45/45. 0 fail in all of them.
- `checks/format.mjs`: 69 modules, 64 requirements files; 0 failures
- `checks/architecture.mjs … progressions`: 10 product files, 36 relative imports; 0 failures
- `checks/coverage.mjs … progressions`: 35 of 35 live requirement ids named by a test; 0 failures
- `checks/ownership.mjs … progressions tranche/T14`: 0 failures (re-run after the commit, below)

Size (session_01TuM9BqWVJmKhPaVJPp6FHs): test runs 11, module lines 14

## J1 · COMPLETE

N340 applied: checks.mjs imports and re-exports promotion's DISPOSITIONS (R51); === identity, frozen, notADisposition unchanged, tested in dispose.test.mjs (R35). R35's 'not yet met: N340' is met; BOB strikes it. No row changes. progressions 42 pass/0 fail/1 todo (R32); inquiry, basis-versions, queue, scheduler, intent, affordances, promotion, control-plane tests pass, 0 fail. format, architecture, coverage (35/35) and ownership: 0 failures. Stale, reported not rebuilt: agent-worker and bio-plane bundles (both include progressions/checks.mjs). civicos-ui hits are comments only; details in the record.
