# docket (T47)

**Status** · session_01LdRUdodYLfpSaz5xmhmwfA · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (T47-28):
- (N952) R12: `withdrawalOf` already answered `entry` (the public entry's id `<case>#<seq>`, `docketPublic`'s `entries[].entry`), which `public-read` `#withdrawnStamp` reads as `w.entry`. No code change needed. New test `t47.test.mjs` "R12 (T47, N952) …": for a one-edition and an `all` withdrawal, `entry` equals the posted entry and the entry `docketPublic` answers; the answer has exactly R12's fields; an unwithdrawn edition answers null.
- (N992) R29: C-129.29's translation is now read by key from a frozen `DOCKET_WORDS` (`checks.mjs`, exported from `index.mjs`), as `HANDLE_WORDS`/`TRANSCRIBE_WORDS`/`DUTIES_WORDS` are. Its code, number and `where` are unchanged. Two new tests in `t47.test.mjs` check:
  - the row equals `words.json`'s sentence verbatim;
  - T45's wording is no longer answered;
  - no other row uses this sentence;
  - each of R1's four arms (missing, unknown kind, dated after filing, stated on another kind), plus R4's re-check at prepare, answers it and writes nothing, each beside its control.
- The row waits for T48's stamp (plan rule 5 (2)); that is inherited, not mine.

**Flaw fixed (P8):** `file.test.mjs` "R1 `author` not a joined participant…" chose which arm to test by branching on the answer. It now drives the arm directly: carol, invited and not joined, is refused, and bob, joined, files as the control.

**Deferred (own module), with why:**
- `place.test.mjs` R7 asserts that methods are absent (`!("redact" in w.docket)`), which is structure. R7's behaviour (bytes listed whole) is tested beside it. I left it because removing an assertion should be BOB's call.
- `t45.test.mjs` builds the pre-T45 schema by string-replacing `DOCKET_SCHEMA`. It is a fixture for the migration test, not an assertion on source. Kept.

**Found elsewhere (REPORT):**
- `docket.md` R29 says the other rows are ones "which `words.json` does not hold". `words.json` also holds `refusal.DOCKET_PRESSURE_REFUSED`, word for word C-129.13's present translation. That is harmless today, but the wording is inexact. BOB's call whether C-129.13 should read by key too.
- `docket.md` Uses is stale against the code (per the digest):
  - Used but not listed: record-core `mintOpaqueId`, `readFile`, `evidenceStore`, `registerMintSeed`; membership `positionalMember`; provenance `homeOf`.
  - Listed but never called: `viewerPredicate`, publication `publishedEditionsOf`/`ratifiedCases`, `createSha256`.
  - Acquisition R21 is read through the bundle's `provenance.json`, not called.
- `layers.md` docket Uses line (:178) omits events, case-tensions and project-roster.

**How the reading set was read (§17):**
- Read whole by me: `docket.md`, `src/docket/index.mjs`, `src/docket/checks.mjs`, and the parts of the tests I changed.
- Read whole by a helper in this session, digested with citations: every docket test file, `fixture.mjs`, each used module's Purpose and the named services, `public-read` R20 and its link code, and `layers.md` layer 8.
- Not read whole: `feed.mjs` and `schema.mjs`, which this job did not change.

**Tests and checks run:**
- `node --test test/m/docket/`: tests 78, pass 78, fail 0.
- Users' tests (public-read, affordances, answer-envelope, plane/docket, network-notices, queue-producers, control-plane r48, case-import, action-holds, filings, promotion): tests 995, pass 990, fail 5. The same 5 fail with my change stashed (affordances plane/t36, answer-envelope envelope, promotion registry), so they are inherited and none is docket's.
- `format`: 0 failures. `architecture … docket`: 0 failures. `coverage … docket`: 29 of 29, 0 failures. `ownership … docket tranche/T47`: 0 failures.
- `run.mjs`: architecture 0 failures (3084 files); coverage 44 failures, none docket's; channels 0.

Size (session_01LdRUdodYLfpSaz5xmhmwfA): test runs 5, module lines 1648
