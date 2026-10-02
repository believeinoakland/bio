# acquisition (T25)

**Status** · session_01VQnDAX596bDF5ZMb1jr9kL · depth 2 · COMPLETE · handled B4

## Completion (T25 L3)

**Entries applied** (B1 START; B2–B4 CHANGE, K1224, K1230, K1231)
- N512, acquisition's user side: `attest` is imported from `attestation` (`bio-plane/src/attestation/`, its R1–R3) in place of provenance's, and an archive-sourced capture's receipt is signed by `cap.attestation.signReceipt` (attestation R4), the instance capture R58/R73 hands in (K1224). With no instance, or no key bound, the answer says the receipt was not signed and the capture stands. Requirements R20 and the `attestation` line of Uses, marked `not yet met: T25`, are met; their marks are BOB's to strike at the merge.
- Re-scan for the N502/N508 kind (N469's rule): no `awaiting stamp` for a stamped row and no retired store or legacy-index named as live in the module's code or tests. Re-worded what the split made stale: index.mjs's header (R1–R32), the co-attestation and receipt-signing comments (attestation, not provenance R31–R34; a misplaced comment moved to the signing block), and checks.test.mjs's list of the C-68.1 door's sites (attestation/ops.mjs).

**Tests changed** (`bio-plane/test/m/acquisition/`)
- `fixture.mjs`: the world builds attestation's real instance (`attestationOf`) over the same storage and record, with a fresh Ed25519 instance key unless a test binds none, handed in as `cap.attestation`; the provenance stand-in keeps only R5 and R13 (its `registerHolds` reports a receipt it was given, as provenance R5 does); the scripted network records co-attestation's requests (the `attest` purpose of R9's agent) in `net.attest`, apart from the act's own in `net.seen`.
- `acquire.test.mjs` R20 R28: rewritten against the real `attest`: every authority and the co-archive asked through the governor under the `attest` agent, each recorded in the register's shape; a granted token kept under its own digest and no later authority asked; no co-archive on the archive arm; a capture in parts attested on the receipt's strength; an unreadable register recorded as an attempt not made; a throwing authority an attempt; the capture filed in every case. R3: the receipt signed with its exact statement and verified against its key; no key bound answers `RECEIPT_NO_KEY` with the capture filed; a direct capture signs nothing.
- `memento.test.mjs`, `sweep-scope.test.mjs`: "nothing signed" reads attestation's `signed_receipts`; the governor counts are over the act's own hosts.

**Deferred**: none.

**Found in other modules** (no REPORT: each is within an accepted red)
- `affordances` test `sources.test.mjs`:117 (R2, reattest) stubs `provenance.attest`, which capture's `reattest` no longer reaches since capture's merge (K1231): red 7 (a moved name's user's fixture), affordances' L11 job.
- No generated artifact staled: `acquisition` feeds no bundle in `build/manifest.md`'s table.

**Tests and checks** (on `job/T25/acquisition` with `tranche/T25` @ capture's merge merged in)
- `node --test test/m/acquisition/`: pass 70, fail 0. Against capture's merged branch, the users of acquisition: capture 116/0, capture-requests 72/0, monitoring 99/0, ratification 199/0, extraction 171/0, instance-setup 88/0, link-sweep 29/0.
- `node --test test/m/`: tests 5314, pass 5218, fail 85, skipped 0; every failure in an accepted red: case-authoring, filings, network-notices and scheduler's network-notices fixture (red 7), retrieval and promotion's write-path through provenance-routes' table (reds 7, 9), control-plane's families and catalogue-end (red 8), affordances sources (red 7, above). None in acquisition or its users.
- `format`: 2 failures, reading-pipeline's absent paths and tests (red 4). `architecture`: 11 product files, 45 imports, 0 failures. `coverage`: 32 of 32 live ids named, 0 failures. `ownership` against `tranche/T25`: 7 files, 0 failures.

Size (session_01VQnDAX596bDF5ZMb1jr9kL): test runs 14, module lines 1567

## J1 · COMPLETE

acquisition T25 complete on job/T25/acquisition (tranche/T25 @ capture's merge merged in): attest from attestation, the receipt signed by cap.attestation.signReceipt (K1224); R20 and the Uses attestation line met, marks yours to strike. Tests: acquisition 70/0, its users (capture, capture-requests, monitoring, ratification, extraction, instance-setup, link-sweep) all green; test/m 5218 pass, 85 fail, all accepted reds (7, 8, 9), incl. affordances sources.test.mjs:117 stubbing provenance.attest since capture's merge (red 7). Checks: format 2 (red 4), architecture, coverage 32/32, ownership 0. No rows added or changed; no bundle staled. Record has the detail.
