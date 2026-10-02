# attestation — requirements

> **DRAFT by a worker for BOB #100, not reviewed.** 2026-10-02, on `tranche/T24` (P18), for T25's opening fold 1 (N512). Not yet in `build/requirements/`.

**Status** · Split from `provenance` by N512 (K617's split of a module along seams BOB names; K1193; `build/plan/draft-T25-splits.md` P-2; `build/plan/draft-T25.md` fold 1 and BOB #100's review), with no change of meaning. R1–R7 are `provenance` R31, R32, R33, R34, R56, R57 and R49, in that order, and R8 is its R39: their text is kept, and only their cross-references are re-pointed (a reference to a requirement that moved here is to its id here; one that stays is `provenance R<n>` or `provenance.<service>`). R9 is a copy of `provenance` R40, stated in both modules. R10 is new wording for what `layers.md` ruling 3 and `provenance/schema.mjs`' comment already state, and `provenance` R41 never did: the wording is BOB's to settle (`draft-T25.md` fold 6). `provenance` retires R31–R34, R39, R49, R56 and R57 as moved, and never reuses them. Every moved requirement was met in `provenance` (R57 at T24, N504). Each is marked not yet met (T25) here, because the move itself is T25's L3 job (accepted red 3). Layer 3, directly after `provenance` and before `provenance-routes`. For BOB's review and Bob's approval (a product module, P17). The text is the text Bob's rulings K59, K171, K1031 and DEC-111 already settled.

| old (`provenance`) | new | |
|---|---|---|
| R31 | R1 | `attest`: the capture asked about |
| R32 | R2 | the RFC 3161 token |
| R33 | R3 | the co-archive |
| R34 | R4 | the instance's signed receipt |
| R56 | R5 | `instanceStatement`, `instanceSign`, `instanceKeys` |
| R57 | R6 | `instanceKeyBound` (met at T24) |
| R49 | R7 | `attestationsOf` |
| R39 | R8 | invariant: the only network calls |
| R40 | R9 | invariant: no place (a copy; `provenance` keeps R40) |
| — | R10 | invariant: owns `receipt_keys`, `signed_receipts` (new wording, BOB's) |

**Size (P6).** About 421 lines of `provenance`'s code move here (`build/plan/draft-T25-splits.md` P-2): from `index.mjs`, `attest` and `attestStatus` with their header (674–825), `RECEIPT_KIND`, `STATEMENT_KIND`, `instanceStatement` and `noKey` (850–870), `attestationsOf` (1318–1373), and the R34/R56 block (`receiptStatement`, `#key`, `#signWith`, `signReceipt`, `instanceSign`, `instanceKeyBound`, `instanceKeys`, `signedReceipts`, and the `signingKey` constructor option; 1566–1671); C-89 `ATTEST_CHECKS` from `checks.mjs` (146–168); `receipt_keys` and `signed_receipts` from `schema.mjs` (197–215); `attestOp` from `ops.mjs` (84–115). The tests are `test/m/provenance/attest.test.mjs` (240), `instance-key.test.mjs` (159) and the R31/R32 case of `ops.test.mjs` (53–98). Well under 4,000.

## Public

### Purpose

Co-attestation and the instance's own key. It asks the timestamp authorities `signatures` names for a trusted timestamp over a capture's hash, and on request a co-archive of its locator. It answers every attestation the record holds for a capture. It holds the instance's signing key, which signs this instance's receipt for an archive-sourced capture and the statements later modules ask it to sign. A timestamp proves that the bytes existed at an instant. It never proves where they came from, and never the credibility of their content.

### Provides

Terms. A **capture**, its **home** and the **register** are `provenance`'s (its Provides, Terms; R1, R4). Every refusal names a `reason`; a refusal with a catalogue row also carries its `check` id and `translation`.

**attest({sha256, archive, locator}, {head, put, fetch}) → `{ok, attempts, archive?, attestation?, held?, note}` or refusal**
- **R1** `sha256` must be 64 hex (`BAD_SHA`). When no object is held under it: an acquisition receipt naming it lets the attestation proceed, answering `held: {form: "parts", on: "acquisition_receipt"}`; a register row alone is refused `CAPTURE_HELD_IN_PARTS` (C-89.1), which does not call the bytes missing; neither is `NO_SUCH_CAPTURE`, saying what was asked, and whether the store could be asked. *(not yet met: T25)*
- **R2** Asks the timestamp authorities in `signatures.TSA_ENDPOINTS` order, each with a fresh RFC 3161 request over the digest, and stops at the first response `parseTimestampResponse` accepts as bound to it. The token is stored in the evidence store under its own SHA-256 and named `snapshots/timestamp-<first 12 hex>.tsr`, `kind: "rfc3161"`, `over` the capture. Every attempt, failed or not, is in `attempts` with its service, instant and outcome. No token answers `ok: false`, `reason: "NO_ATTESTATION"`. The token's signature is not verified here, and the answer says so. *(not yet met: T25)*
- **R3** With `archive: true` and a public https `locator`, also asks the co-archive (`signatures.ARCHIVE_SAVE_BASE`) and records the archived locator from `archiveLocatorFrom`, or the failed attempt. Without it, no archive is asked. *(not yet met: T25)*
- **R4** When this instance files an archive-sourced capture, it signs its own receipt: that on this date it fetched these bytes from this retrieval locator and they hashed to this value. The signing key is the instance's own, one per instance, held as a secret and replaceable by the operator; a receipt signed before a replacement stays verifiable against the public key it was signed with (Bob, K59). *(not yet met: T25)*
- Errors: never throws for a well-formed call; an authority or archive failure is an attempt, never a throw.

**instanceStatement(kind, sha), instanceSign(statement), instanceKeys(), instanceKeyBound()** (the instance key of R4, for later modules: `network-notices` R1, R13, R21)
- **R5** (DEC-111, K1031 (2)) The instance key of R4 also signs statements for later modules. *(not yet met: T25)*
  - `instanceStatement(kind, sha)` returns exactly `` `${kind}\nsha256: ${sha}\n` ``. It throws when `kind` is `bio-receipt/1`, or is not of the form `^[a-z][a-z0-9-]*/[0-9]+$`, so no statement can be read as a receipt.
  - `instanceSign(statement)` answers `{ok, signature, key_id, public_key}`, or `RECEIPT_NO_KEY` when no key is bound. It records the key in `receipt_keys`.
  - `instanceKeys()` answers every key that has signed anything, each with its `first_used`, never the private part.
- **R6** (N504) `instanceKeyBound()` answers `true` when an instance key is bound (so `instanceSign` would sign), and `false` otherwise, a key that cannot be read included. It signs nothing and writes nothing: `receipt_keys`, and every key's `first_used`, are unchanged by it. Never throws. *(not yet met: T25)*

**attestationsOf(captureSha) → `{sha256, registered, attestations: [{kind, service?, locator?, at?, file?, token_sha?, bundle, path}], undetermined?, note}` or refusal**
- **R7** Answers every attestation recorded for the capture, from each document entry that registers it (the register, provenance R48), in the entry's order: its `timestamp` (daemon era), each `attestations[]` entry of kind `rfc3161` (R2's token, as `op=attest`'s answer is recorded: `kind: "rfc3161"`, its service, the token's file and SHA-256), and its `co_archive` (R3's archived locator, a string or `{service, locator}`, `kind: "co_archive"`), as the entry states them (C-18), each naming the bundle and path it is recorded in; `at` is the matching attempt's instant where one is recorded. The answer also states `registered`, and `undetermined` with why when no register row names the capture under an existing bundle (a capture registered only by its parts) or the home's register cannot be read; `attestations: []` alone means none is recorded. A read over what `attest` and promotion already write: it asks no authority and verifies no token's signature, and its `note` says so. `BAD_SHA` for a digest not 64 hex. It is the read `filings` R9's exhibits use. *(not yet met: T25)*

## Private

### Uses

- `record-grammar`: `isPublicHttpsLocator` (R3).
- `signatures`: `timestampRequest`, `parseTimestampResponse`, `TSA_ENDPOINTS`, `TSA_CONTENT_TYPE`, `TSA_ACCEPT` (R2), `ARCHIVE_SAVE_BASE`, `ARCHIVE_SERVICE`, `archiveLocatorFrom` (R3).
- `record-core`: the evidence store (`head`, `put` by digest with integrity; its R38) for R1 and R2; `readFile` (its R13; the home's `data/provenance.json`, R7); `declarePurge` (`receipt_keys`, purge-exempt, and `signed_receipts`, keyless, as `provenance` declared them).
- `provenance`: `registerHolds` (its R5; R1's receipt and register question); `homeOf` (its R4) and the register's read contract (its R48), for R7; the C-103 rows `RECEIPT_MALFORMED` (C-103.6) and `RECEIPT_NO_KEY` (C-103.7) through `PROVENANCE_ACT_CHECKS` (its R58, the seam), for R4 and R5.
- `membership`, `credentials`, `promotion`, `test-support`: only the test world (`provenance`'s fixture, which this module's tests share), no service.

### Invariants

- **R8** Network calls are made only by `attest`, only to the compiled endpoints `signatures` names. *(not yet met: T25)*
- **R9** No place is named in this module's behaviour or outward text (`layers.md`, "No jurisdiction in the product"). *(not yet met: T25)*
- **R10** This module owns `receipt_keys` and `signed_receipts`; no other module writes them. *(not yet met: T25)* *(wording proposed by the worker; BOB's, `draft-T25.md` fold 6)*

### Satisfies

- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §3 (co-attestation by trusted timestamp and co-archive), §3b (SHA-256, RFC 3161, plain JSON), §8 (what attest may claim; a capture held in parts).
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 (the daemon-era anatomy of `timestamp` and `co_archive`, read by R7).
- `docs/development/ARCHIVE-FALLBACK.md` §Shape on the capture (the instance's signed receipt, R4).
- Rulings: K59 (the instance key), K171 (`attestationsOf` for `filings`), DEC-111 and K1031 (statements for later modules), D-530 (a whole-hash miss is not absence, R1).

(Copied from `provenance`'s Satisfies: the share R1–R8 serve. `provenance` keeps its own lines.)

### Suggestions

- **Checks carried here.** C-89.1 (`ATTEST_CHECKS`) moves with this module, its `where` re-pointed to this module's file (the census pins `where`, so its row is `awaiting stamp` until T26's L2, accepted red 6). C-103.6 and C-103.7 stay in `provenance`'s `PROVENANCE_ACT_CHECKS` and are imported, with only their `where` re-pointed, so one family is not split between two files (`draft-T25-splits.md` P-2 risks; decision 6, BOB's).
- **The key.** The `signingKey` constructor option moves with R4: the composition root hands it in from `env.RECEIPT_SIGNING_KEY` (`plane/store.mjs`:99 today, plane's L11 job). `signReceipt`, `receiptStatement` and `signedReceipts` are R4's services. `acquisition` reaches `signReceipt` through the instance the composition hands it in `cap` (`acquisition/index.mjs`:1025).
- **`attestOp`** (the `op=attest` arm, `ops.mjs` 84–115) moves here. `attest` takes `holds(sha)` beside `head`, `put` and `fetch`, answered by `provenance.registerHolds`.
- **Private helpers.** `hexOf`, `b64`, `unb64`, `bareSha`, `safeJson` and `isObj` are one-liners: copy them, or take them from `record-grammar` where it exports an equivalent.
- **Option B (BOB #100's review 1).** Until each importer re-points, `provenance` keeps exporting `instanceStatement` (network-notices, L8) and `attestOp` with `attest` (plane, L11), as copies deleted in `provenance`'s T26 job. The stateful services (`instanceSign`, `instanceKeys`, `instanceKeyBound`, `signReceipt`) are this module's alone from T25's L3 merge, because they write `receipt_keys` and `signed_receipts` (R10). `attestationsOf` is not on the review's list of kept names. Their callers' reds stand (accepted red 7).
- Tests: `attest.test.mjs`, `instance-key.test.mjs` and the R31/R32 case of `ops.test.mjs` move to `test/m/attestation/`. Their R-id citations are re-pointed by the map above, and their assertions do not change.

## Open for Bob

None. The text is `provenance`'s, already settled by Bob's rulings cited above.

## Decided by BOB (for the rulings)

- (N512, K1193) The split from `provenance`, R1–R8 = `provenance` R31–R34, R56, R57, R49, R39, with no change of meaning, and R9 a copy of R40. Layer 3, directly after `provenance`. `paths` is `bio-plane/src/attestation/`, which this module's T25 job creates by moving the code.
- (fold 6, owed) R10's wording; the C-103.6/.7 rows staying in `provenance` (its R58).
