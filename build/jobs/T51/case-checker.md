# case-checker (T51)

**Status** · session_01CceTzYEaENCZieJw3upijk · depth 2 · COMPLETE · handled B0

## Completion (T51-142)

**Entry applied.** R13 and R25 against `bio-case-document/8`. Diagnosis: both reds are the one stale artifact, not the module's code. `program.mjs` (generated, bundles `case-grammar` and `strength`, so it is stale since T51-136) no longer equals the build, so R13's "committed program is that build" and R25's "program read equals the built file byte for byte" fail; every other assertion of both tests passes. The checker's code needed no change for `/8`: it reads every format through `case-grammar` (`completeEditionOf` renders each document in its own format's words), and a new test proves `/8` is accepted as `/7` is.
- `spec.mjs` (R14): the readable specification now names `bio-case-document/8` beside `/7` and `/6`, and states that a `/8` edition says "team" where earlier formats say "group" in the sentences naming the publishing body, identifiers unchanged, each document rendered in its own format's words.
- Tests: `check.test.mjs` new `R10 R25 (T51-142)`: a `/8` case file recreates every finding with its complete edition equal; the `/7` edition carried in a `/8` file differs, and the `/8` edition in a `/7` file differs (controls); a `/7` case file is as before. The words are never copied: the test compares renders. `spec.test.mjs` asserts `/8` is named.

**Generated artifact made stale (REPORT to BOB, manifest §14):** `bio-plane/src/case-checker/program.mjs` (and its SHA-256 in the `casechecker` read), stale by T51-136 and again by this job's `spec.mjs` change. Regenerate at L8's close: `node bio-plane/src/case-checker/build-program.mjs`. Then R13 and R25 turn green with no other change. Bundles that carry it follow in K1540's order.

**Deferred:** none. **Found in other modules:** none.

**Ran.** `node --test bio-plane/test/m/case-checker/`: tests 88, pass 86, fail 2 (R13 and R25, the stale program, as above). `checks/format.mjs`: 0 failures. `checks/architecture.mjs`: 0 failures. `checks/coverage.mjs`: 26 of 26 ids named, 0 failures.

Size (session_01CceTzYEaENCZieJw3upijk): test runs 4, module lines 31 (spec.mjs 2 changed lines).

## J1 · COMPLETE

T51-142 done. The checker needed no code change for /8 (it reads each format through case-grammar); spec.mjs now names /8 and a new test proves /8 is accepted as /7 with its own words (R10 R25). R13 and R25 stay red only because program.mjs (generated) is stale since T51-136, and again by my spec.mjs edit: REGENERATE at L8 close with node bio-plane/src/case-checker/build-program.mjs, then both pass. Module tests 88 (86 pass, the 2 are those). format, architecture, coverage, ownership: 0 failures. Details in build/jobs/T51/case-checker.md.
