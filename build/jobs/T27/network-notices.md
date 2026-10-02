# network-notices (T27)

**Status** · session_01MRJKiiGZ1Mddztgdog1A5d · depth 2 · COMPLETE · handled B3

## J1 · REPORT

Started and read (requirements, docket's public part, L8 contract, my code and tests). N502/N508 re-scan of network-notices: nothing stale. N520's share is small: groupKeysPublic (R21) adds docket.docketSigners() keys to the signed set, docket reached lazily on the host like publication, plus a test naming R21 over a real docket signer. docket is not yet on tranche/T27 (job/T27/docket has no code yet), so I wait for your CHANGE saying it is merged, then merge the tranche and finish.

## Completion

**Entries applied.** L8 N520 (DEC-116 item 6): R21's `owners` also keeps every key that signed a public docket entry. `groupKeysPublic` adds `docket.docketSigners()` (docket R5) to the signed set beside revision signers and published-edition attestors; `docket` is reached as `docketOf(host, …)` on the same host unless given (the header's deps list names it). Built against `tranche/T27` after docket's merge (B3, K1278).

**N502/N508 re-scan** of the module and its tests: nothing stale.

**Deferred.** Nothing.

**Found in other modules.** Nothing.

**Catalogue rows added.** None (no `awaiting stamp` rows from this job).

**Tests.** New: `reads.test.mjs` "R21 owners: every key that signed a public docket entry …" over the real `docket` (its signers read through `docketSigners`; a negative control of members who own and signed nothing; each signer listed once; no member named; a revoked docket signer stays listed with its own `status_at` date). Checked red with the change removed (1 fail), green with it. The fixture builds the real `docket` with a recorder for its reevaluation registration.
- `node --test test/m/network-notices/`: tests 63, pass 63, fail 0.
- Users of the module, run as a check (no provided service changed): ratification pass 199 fail 0; case-authoring pass 100 fail 0; scheduler pass 66 fail 0; queue-producers pass 70 fail 0.

**Checks** (process repository):
- format: 92 modules, 91 requirements files; 0 failures
- architecture: 10 product files, 56 relative imports; 0 failures
- coverage: 30 of 30 live requirement ids named by a test; 0 failures
- ownership: 0 failures

Size (session_01MRJKiiGZ1Mddztgdog1A5d): test runs 7, module lines 1382
