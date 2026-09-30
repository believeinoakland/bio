# promotion (T15)

**Status** · session_01ND9SZzuGAjq4MyXXivuefV · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied: the stamp (N318, K425, K482)** (2545e421b6). `CATALOG_VERSION` moves 1.44.0 -> 1.45.0.

Method: I diffed R50's census lines of this tree (`tranche/T15` after layer 1 merged, @ e8141407bb) against 1.44.0's own lines (`test/fixtures/row-census-1.44.0.jsonl`), reading with legacy-tests' `test/row-census.mjs`. Two rows arrived and four departed; nothing else moved. Every one is named by a job record. The note above the constant names each:
- arrived: C-118.1 `EVIDENCE_NOT_HELD` (capture, N347); C-19.2 `INBOX_REFUSED` (queue, N325);
- departed: C-118.1 `NOT_FOUND` (the re-key's old key); C-26.20 (bias, N327); C-111.16 (intent, N327); C-29.12 `AI_CREDENTIAL_ORG_NOT_ADMIN` (legacy-checks, T15 layer 1);
- changed composition: the promote gate gains queue's registered step (C-19.1 judged at the write, refused C-19.2; N325, K462, K464). The catalogue's copy of `checkInboxGrammar` is gone; `checkBundle`'s composition is unchanged (it stopped running C-19.1 in 1.44.0).

**`ROW_CENSUS` (R50) re-pinned:** `{version: "1.45.0", rows: 825, digest: "dacbe36f6e5dda03bfaf6b13d8e721ffcb5794a0dcda55026cffc64f018a5fac"}`. The census reads 245 files. No file is blind, and no script left out holds a `check:` key.

**`gate.mjs`:191** (legacy-checks' J1 item 3): C-29.12 there is 1.33.0's history note. `gate.mjs` holds no live row list, so nothing went. The 1.45.0 note records its departure.

**Check rows this job added, moved or retired (N318).** None of promotion's own. Every row change since 1.44.0 is in the stamp.

**Layer 2 (a question of fact for BOB).** Membership (layer 2, N352 `hiddenBundles`) has not merged into `tranche/T15` yet. Its entry names no row, so I stamped without it. If its merge moves any row, the stamp must be re-read: send a `CHANGE` and I'll re-diff and re-pin.

**`not yet met` marks my work meets:** none. Promotion's requirements carry none.

**Found in other modules.**
- **legacy-tests: `test/row-census.test.mjs`.**
  - It needs `test/fixtures/row-census-1.45.0.jsonl`, the stamp's own lines. That is 825 lines, reproduced by `row-census.mjs` on 2545e421b6; I can hand it over.
  - Its `AWAITING_STAMP` and `COMPOSITIONS_AWAITING` declarations for 1.44.0 are stamped and can be retired.
  - Today it runs 7 pass, 1 fail: the negative control, which cannot name rows without the snapshot. Its main arm, "the tree holds the pin", passes. With the fixture in place (tried, not committed) it runs 8 pass, 0 fail.
- **legacy-tests: `test/d470-catalog-census.test.mjs`.** It needs its 1.45.0 row: `"1.45.0": { count: 356, digest: "968acdfb95e0ea07805a2727b1095090bf760ac6adac654a0c9f5ed80ab57510", source: "b7d4112b8a54b44118429e5ffaa63683c8959423c38cd6cc563529b594060181" }`, plus A1's floor (358 -> 356) and A5's literal (`plane-gate/1.0 (bio-checks 1.45.0)`). Today it runs 11 pass, 3 fail (A1, A3, A5). A9 passes once the version moves.
- **legacy-tests: `civicos-ui/check-refusal-codes.mjs`.** Its ratchet re-pins are as legacy-checks' J1 and queue's T14 record list them. Nothing in them is from this job.
- **Grep of `civicos-ui/` and affordances.** No code added or retired. No pin of `1.44.0` or of the old digest outside the two legacy-tests suites above.
- **Generated artifacts made stale** by `gate.mjs`: `bio-plane/dist/bio-plane.bundled.mjs` and `agent-worker/dist/agent-worker.bundled.mjs` (both manifests list it). Reported, not rebuilt.

**Deferred.** Nothing.

**Tests and checks.**
- `node --test bio-plane/test/m/promotion/`: tests 70, pass 70, fail 0, todo 0.
- Legacy suites that read the stamp:
  - `test/ratify.test.mjs`: 43 pass, 0 fail.
  - `test/conformance.test.mjs`: 59 pass, 0 fail.
  - `test/row-census.test.mjs`: 7 pass, 1 fail (the fixture above).
  - `test/d470-catalog-census.test.mjs`: 11 pass, 3 fail (the re-pin above).
- Layer tests: `build/manifest.md` names none.
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture promotion`: 16 product files, 59 relative imports; 0 failures.
- `coverage promotion`: 51 of 51 live requirement ids named by a test; 0 failures.
- `ownership promotion tranche/T15`: 1 file; legacy-checks and legacy-store 0 lines; 0 failures.

Size (session_01ND9SZzuGAjq4MyXXivuefV): test runs 9, module lines 20
