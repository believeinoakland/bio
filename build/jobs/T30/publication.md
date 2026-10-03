# publication (T30)

**Status** · session_01Ez4jm4BPM9Hw57fyKwKCSW · depth 2 · COMPLETE · handled B1

## Completion

On `job/T30/publication`, from `tranche/T30` @ a25e4244f7.

**Entries applied.** N537, from BOB's B1 START: I removed the one-line `get acceptedWork()` delegate to case-carriage from `bio-plane/src/publication/index.mjs` (it was at line 191), together with its comment. Before removing it, I searched every `.mjs`/`.js`/`.ts` file in the repository, outside `node_modules` and `dist/`, for a read of `.acceptedWork` on a publication instance. There is none:
- The plane's `accepted.test` R16 reads `caseCarriageOf(x.ctx).acceptedWork` (K1355).
- My `t28.test.mjs` reads `w.acceptedWork`, which is the fixture's own `acceptedWorkOf` instance and not the delegate. So no test of mine needed re-pointing.

The forwarding of a given `acceptedWork` to case-carriage (test injection, in the `caseCarriage` getter) is unchanged. No requirement changed. R59 still reads accepted work through `caseCarriage.acceptedWorkLapsed`.

**Deferred.** None.

**Found in other modules.**
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`). It still embeds the removed delegate. I did not regenerate it; that is BOB's job at the layer close.

**Tests and checks** (on the job commit):
- `node --test bio-plane/test/m/publication/`: 109 tests, 108 pass, 0 fail, 1 todo. The todo is R30, already marked not met (D-246, A41).
- `node --test bio-plane/test/m/plane/accepted.test.mjs`: 7 pass, 0 fail.
- `node --test --test-timeout=120000 bio-plane/test/m/`: 5793 tests, 5782 pass, 0 fail, 11 todo.
- `checks/format.mjs`: 97 modules, 96 requirements files; 0 failures.
- `architecture.mjs … publication`: 24 product files, 85 relative imports; 0 failures.
- `coverage.mjs … publication`: 43 of 43 live requirement ids named by a test; 0 failures.
- `ownership.mjs … publication tranche/T30`: 1 file changed; 0 failures.

Size (session_01Ez4jm4BPM9Hw57fyKwKCSW): test runs 3, module lines 4613
