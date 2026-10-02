# capture (T25)

**Status** · session_01DBaNZTnhW4WpM4Cc51PGKx · depth 2 · WORKING · handled B3

## J1 · QUESTION

**Does capture's store, handed to `acquisition` (R73), carry `attestation`'s instance?**

`acquisition` reaches the receipt signer through capture's instance: `cap.provenance?.signReceipt?.(…)` (`acquisition/index.mjs`:1025; attestation's Suggestion "The key" says the same). After N512, `signReceipt` is attestation's (its R4), a stateful method provenance keeps no copy of (option B). So unless capture's instance carries attestation's, acquisition's archive-sourced receipt goes unsigned silently (the `?.` answers undefined).

**My best reading:** yes. `captureOf(ctx, opts)` takes an `attestation` option as it takes `provenance` (default `attestationOf(ctx)`, or whatever attestation's job names its instance getter), exposed as `cap.attestation`, under R58's rule (a differing one refused by name); R73's list of what the store serves gains "attestation's instance (its R4's `signReceipt`)". That is a requirement change to R58/R73 (BOB's), and acquisition's job then reads `cap.attestation.signReceipt`. R68 itself needs none of it: `attest` is a pure function, imported from `bio-plane/src/attestation/`.

**Carrying on meanwhile:** R68 through attestation's `attest`, its tests against the real module with a scripted TSA and archive. I add nothing to `captureOf` until you answer.

## Completion (CAPTURE #17)

**Entries applied.** L3 capture, N512's user side (B1), with K1224 (B2) and B3:
- R68: `reattest` asks `attestation`'s `attest` (its R1–R3), imported from `bio-plane/src/attestation/`; provenance's `attest` and the `provenance.attest` injection seam are gone from `index.mjs`.
- R58, R73 (K1224): `captureOf` takes an `attestation` option, by default `attestationOf(ctx, {record, provenance})` (attestation's instance for the host, over the record and provenance capture holds), held as `cap.attestation` for acquisition's receipt signer (attestation R4); a different one from what a caller gave is refused by a throw naming `attestation`, and it takes part in R58's judge-before-adopt.
- Tests: the fixture's provenance stand-in no longer stands in for `attest` (it gains `acquired` for a capture held in parts) and offers `granted(digest)`, a bound RFC 3161 response; R68's four tests run the real `attest` over a scripted network (the authorities in order, the co-archive's save, its raw replay), checking the requests, the governor, the token stored under its own digest, each late outcome and every refusal. R58's test checks the default attestation instance, a given one, and the refusal. R74's `reattest` arm runs under a scripted network; R46's broken-storage arm is handed an attestation stand-in (attestation's own boot reads the storage).

**Stale-note rescan (N502/N508's kind).** One found and re-worded: `schema.mjs`'s comment on `knock_rate` called it "Fixed-window" accounting; it is R31's two-bucket sliding window. The other legacy names in the module (`doorbell.mjs`:2, :151; `ops.mjs`:1, :117, :142, :171; `index.mjs`:6–7; the two legacy suites' headers) are past-tense history of the moves, not stale.

**Deferred.** None.

**Found in other modules.**
- `affordances`: `test/m/affordances/sources.test.mjs`:117 ("R2: reattest … through provenance's attest") stubs `provenance.attest` through capture's fixture and asserts it was asked. Since N512 R68 asks attestation's `attest` (affordances' own premise is stale), so it fails on this branch (TypeError on `attests`); it passes on `tranche/T25` only because capture still read the stub there. Not a red named at the opening: it is red 7's kind (a user of a moved name, through a fixture). Its fix is affordances' (L11): drive `reattest` through a scripted network as capture's R68 tests now do, or assert on the late outcome alone. Reported (J3).
- Bundle: capture's source is an input of `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`, regenerated at layer close); this job staled it. Regenerated nothing. `fleetbundles.test.mjs` (the workers' bundles) is unaffected: 0 fail.

**Tests and checks** (on `job/T25/capture` with `tranche/T25` merged after attestation's and provenance-routes' merges, B3):
- `node --test bio-plane/test/m/capture/`: 116 tests, 116 pass, 0 fail (R68, R58, R73 named, against the real attestation module; `plane.test.mjs` under Miniflare included).
- `node bio-plane/test/cap13-reuse-pages.test.mjs`: 22 pass, 0 fail. `node bio-plane/test/d57selflink.test.mjs`: 24 pass, 0 fail.
- `node --test bio-plane/test/m/`: 5314 tests, 5218 pass, 85 fail. 84 fail identically on `tranche/T25` without this branch (same 14 files, same counts): red 7 (network-notices 54, case-authoring 13, filings 3, scheduler `consumers.test.mjs` 1, retrieval 10, promotion `write-path.test.mjs` 1) and red 8 (control-plane `families.test.mjs`, `catalogue-end.test.mjs`). The 85th is affordances' `sources.test.mjs`:117 above.
- `node checks/format.mjs`: 2 failures, reading-pipeline's absent directories (red 4). `architecture.mjs … capture`: 23 files, 95 relative imports; 0 failures. `coverage.mjs … capture`: 55 of 55; 0 failures. `ownership.mjs … capture tranche/T25`: 7 files; 0 failures.

Size (session_01DBaNZTnhW4WpM4Cc51PGKx): test runs 10, module lines 3459
