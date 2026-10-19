# screens-entry (T51)

**Status** · session_01YHA4ZoaUaEuD38r56tWV9k · depth 2 · COMPLETE · handled B1

## Completion (T51-114)

**Entries applied.** T51-114 whole:
- R25: a part skipped with `setup.skip` shows `screen.setup.state.skipped` in the place of its state mark, with `screen.setup.state.skipped.help` as the tip on the word; it is closed, sends and records nothing, and un-skipping restores the state its read gives (`setup.mjs`, `part()`). The state word is drawn as `S + "state." + …` so the generator sees the dotted head. Part 1 has no skip.
- `words.mjs`: `state.skipped` and `state.skipped.help` added to the `screen.setup.` list of `READS.setup`; the header comment on `words-reads.json` being generated from T49's code is gone.
- `setup.mjs`: the stale comment citing `setup-page` R30 is gone. `front.mjs`:35 `group-logo` is an asset path (`/app/assets/group-logo`): recorded, nothing to change.
- Words finding (W): the one handlist, `front.test.mjs`:55, now takes its keys from the module's own declared list (`o.spec.words`). `checks/words.mjs` shows 0 failures for screens-entry; run over every module together, no line names screens-entry.

**Deferred.** Nothing.

**Found in other modules.** None. For BOB and the design lane: `docs/development/ux-substrate/screens/words-reads.json` lists neither `screen.setup.state.skipped` nor `.help` for screens-entry until the design lane regenerates it from the changed source (DEC-258's run). R24's test reads the module's declared list against `hasWord`, so it passes now and needs nothing from the regeneration.

**Tests and checks.**
- `node --test bio-plane/test/m/screens-entry/`: tests 85, pass 85, fail 0 (R25's new test is in `setup.test.mjs`).
- `checks/format.mjs bio`: 0 failures. `checks/architecture.mjs bio screens-entry`: 0 failures. `checks/coverage.mjs bio screens-entry`: 25 of 25 live requirement ids named by a test, 0 failures. `checks/ownership.mjs bio screens-entry tranche/T51 job/T51/screens-entry`: 0 failures.
- `checks/run.mjs bio`: 0 lines name screens-entry; its other failures are other modules' (wizard-scripts and others).
- `setup-words/build.mjs --check`: rows match words.json and the source.

Size (session_01YHA4ZoaUaEuD38r56tWV9k): test runs 8, module lines 1080

## J1 · COMPLETE

T51-114 applied: R25 (a skipped setup part reads screen.setup.state.skipped with .skipped.help), both keys added to READS.setup, stale comments gone, the one handlist finding fixed; words check 0 failures for screens-entry, and no line names it over all modules. Module tests 85/85; format, architecture, coverage (25 of 25) and ownership 0 failures. For the design lane: words-reads.json lists neither new key until regenerated (DEC-258); R24 passes meanwhile. Details in build/jobs/T51/screens-entry.md.

## Change B2 (K4093)

Merged `tranche/T51`. No local stand-in of a provider (`BROWSER_ACTS`, shell options, patched registry) is held in the module or its tests; the test kit's stand-in of the shell's kit is the module's interface harness, unchanged. Module tests: tests 85, pass 85, fail 0. format, architecture, coverage (25 of 25), words (0 failures) and ownership: 0 failures. Nothing fails; nothing of another module's found.
