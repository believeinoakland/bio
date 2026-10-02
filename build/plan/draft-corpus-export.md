# corpus-export — requirements

**Status** · DRAFT by a read-only worker for BOB #90, 2026-10-01, on `tranche/T22` before layer 8 (J10, A42; P18), for BOB's review. It is carved from `publication`'s requirements (APPROVED by Bob 2026-09-26, K102) by K617's second split of publication (seam map `extraction-publication-split.md`), and no requirement changes meaning.

Layer 8, immediately before `publication`. The code today is in `bio-plane/src/publication/index.mjs`:
- 89–94: `EXPORT_LOG_LIMIT_DEFAULT`, `EXPORT_LOG_LIMIT_MAX`, `EXPORT_NOTE_MAX`;
- 1919–2007: `exportManifest`, `exportLog`;
- `schema.mjs` 566–578: `export_log`, and its exemption at 592.

Tests today are `test/m/publication/export.test.mjs`, and `invariants.test.mjs`:30, :48–50, :55 and the R32 todo at :117.

Not yet met: R3 (was publication R32; K102), carried by T22 layer 8 (A42). The old ids are listed at the end.

## Public

### Purpose

A group that cannot leave can be held. This module exports the working corpus verifiably, records every export in an append-only log that every administrator can read, and verifies an import of an export, trusting nothing the export asserts (Membership v2 §8.1).

### Provides

#### Verified export (Membership v2 §8)

- **R1** (was publication R18) `exportManifest({note})` (`op=export`) answers:
  - every bundle with its files (path, SHA-256, bytes, blob digest, inline);
  - its promotions in write order, its snapshots and its references;
  - the register;
  - the counts.

  In the same act it appends one `export_log` row: the instant, scope `working-corpus`, the counts, and the note cut at 280 characters. The answer says it was logged and how to verify it.
- **R2** (was publication R19) `exportLog({limit})` (`op=exportlog`) answers the newest rows first, `limit` clamped to [1, 1000], 200 by default, with `truncated`.

## Private

### Uses

- `record-core`: `recordOf(ctx)` and `declarePurge` (R4). The `bundles`, `files`, `history` and `manifest` read contracts (R1). *(not yet provided: T8's record-core entry)* (as in publication's Uses, unchanged)
- `provenance`: the `register` read contract (R1).
- `connections`: the `refs` read (R1).
- `record-grammar`: `createSha256`, for R3's re-derivation (when R3 is built).

### Invariants

- **R3** (was publication R32) An import of an export:
  - re-derives every file's hash;
  - re-derives every bundle's history chain and base links;
  - byte-compares every registered capture;
  - trusts nothing the manifest asserts (Membership v2 §8, "What verified must mean").

  The verifying import belongs to this module; the tranche that carries it is BOB's to choose (K102). *(not yet met: T22 layer 8, A42; K102)*
- **R4** (was publication R31, its `export_log` clause) `export_log` is exempt from purge.
- **R5** (was publication R34, copied) No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_Membership_Architecture_v2.md` §8.1 (full working-corpus export), and §8's "What verified must mean" (R3).

### Suggestions

- **Factory.** `corpusExportOf(host, deps)` answers the one instance per Durable Object storage (K61). At creation it:
  - creates `export_log` (the same DDL, `CREATE TABLE IF NOT EXISTS`, so a store's existing rows stay);
  - declares it to `record-core`'s purge as exempt (R4).

  Until the plane's op map spreads this module's ops, `publication` creates it and its `export` and `exportlog` ops delegate here (the seam map, §4).
- **For callers.** (was publication's Suggestions, "For callers", its export half)
  - The control plane admits only the root-of-trust credential to `op=export` (`ROOT_OF_TRUST_REQUIRED`) and in-app administrators to `op=exportlog`.
- **R3's scope** (P17, a detail, for the START). The service is handed R1's manifest and the bytes it names, which the manifest itself does not carry. It answers verified, or each failure by name, and writes nothing. Writing a verified corpus into a receiving store is not stated here.
- **Tests.**
  - R1 and R2 move from `test/m/publication/export.test.mjs` with their assertions, renamed.
  - R3: every hash, chain and base link re-derived; a tampered manifest (a file's hash, a broken base link, a capture's bytes) refused by name, with a negative control.
  - R4: the whole-store purge leaves `export_log` byte-identical.
  - The fixture builds on earlier modules only (`test/m/connections/fixture.mjs` or record-core, provenance and connections), never publication's.

## Open for Bob

None. The split is BOB's (K617), and no requirement changes meaning.

## Decided by BOB (for rulings)

1. (was publication's Decided by BOB 4) `#findingsExportPerformed` (N-1) is `queue`'s, reading R2 (K94). It reads it today as `queue-producers`, through `publication`'s delegate.
2. The table `export_log` is this module's. Its exemption moves here from publication's R31. Publication's `PUBLICATION_EXEMPT` drops it in publication's L8 job, in the same commit that starts creating this module, so no table is declared twice (`TABLE_DECLARED`).

## Old ids (publication → this file)

publication R18 → R1; R19 → R2; R32 → R3; R31's `export_log` clause → R4; R34 copied as R5. Publication's R18, R19 and R32 are retired there as moved (K617, J10).
