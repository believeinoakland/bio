# corpus-export — requirements

**Status** · APPROVED under K102 (carved from `publication`'s requirements, approved by Bob 2026-09-26) by K617 and K1024; written by BOB #91, 2026-10-02, on `tranche/T22` before layer 8, from `build/plan/draft-corpus-export.md` (J10, A42; seam map `build/extraction/corpus-export.md`). No requirement changes meaning: R1–R4 are `publication` R18, R19, R32 and R31's `export_log` clause, moved (the old id is named on each; `publication` retires each as moved), and R5 is a copy of `publication` R34, which holds here as there. Layer 8, immediately before `publication`. No `from`: it is taken by copy from a product module (K624 (1)). The code today is in `bio-plane/src/publication/index.mjs` 89–94 (`EXPORT_LOG_LIMIT_DEFAULT`, `EXPORT_LOG_LIMIT_MAX`, `EXPORT_NOTE_MAX`) and 1919–2007 (`exportManifest`, `exportLog`), and `schema.mjs` 566–578 (`export_log`) with its exemption at 592; its tests today are `test/m/publication/export.test.mjs` and `invariants.test.mjs`:30, :48–50, :55, with the R32 todo at :117. Not yet met: R3 (was `publication` R32; K102), carried by T22 layer 8 (A42). Old ids are listed at the end.

## Public

### Purpose

A group that cannot leave can be held. This module exports the working corpus verifiably, records every export in an append-only log that every administrator can read, and verifies an import of an export, trusting nothing the export asserts (Membership v2 §8.1).

### Provides

#### Verified export (Membership v2 §8)

- **R1** (was `publication` R18) `exportManifest({note})` (`op=export`) answers:
  - every bundle with its files (path, SHA-256, bytes, blob digest, inline);
  - its promotions in write order, its snapshots and its references;
  - the register;
  - the counts.

  In the same act it appends one `export_log` row: the instant, scope `working-corpus`, the counts, and the note cut at 280 characters. The answer says it was logged and how to verify it.
- **R2** (was `publication` R19) `exportLog({limit})` (`op=exportlog`) answers the newest rows first, `limit` clamped to [1, 1000], 200 by default, with `truncated`.

## Private

### Uses

- `record-grammar`: `createSha256`, for R3's re-derivation.
- `record-core`: `recordOf(ctx)` and `declarePurge` (R4); the `bundles`, `files`, `history` and `manifest` read contracts (R1). (record-core R37; `register.bytes`, provenance R48)
- `provenance`: the `register` read contract (R1).
- `connections`: the `refs` read (R1).

### Invariants

- **R3** (was `publication` R32) An import of an export:
  - re-derives every file's hash;
  - re-derives every bundle's history chain and base links;
  - byte-compares every registered capture;
  - trusts nothing the manifest asserts (Membership v2 §8, "What verified must mean").

  The verifying import belongs to this module; the tranche that carries it is BOB's to choose (K102). *(not yet met: T22)*
- **R4** (was `publication` R31, its `export_log` clause) `export_log` is exempt from purge.
- **R5** (was `publication` R34, copied) No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_Membership_Architecture_v2.md` §8.1 (full working-corpus export), and §8's "What verified must mean" (R3).

### Suggestions

- **Factory.** `corpusExportOf(host, deps)` answers the one instance per Durable Object storage (K61). At creation it:
  - creates `export_log` (the same DDL, `CREATE TABLE IF NOT EXISTS`, so a store's existing rows stay);
  - declares it to `record-core`'s purge as exempt (R4).

  Until the plane's op map spreads this module's ops, `publication` creates it and its `export` and `exportlog` ops delegate here (the seam map, §4).
- **For callers.** (was `publication`'s Suggestions, "For callers", its export half) The control plane admits only the root-of-trust credential to `op=export` (`ROOT_OF_TRUST_REQUIRED`) and in-app administrators to `op=exportlog`.
- **R3's scope** (P17, a detail, for the START). The service is handed R1's manifest and the bytes it names, which the manifest itself does not carry. It answers verified, or each failure by name, and writes nothing. Writing a verified corpus into a receiving store is not stated here.
- **Tests.**
  - R1 and R2 move from `test/m/publication/export.test.mjs` with their assertions, renamed.
  - R3: every hash, chain and base link re-derived; a tampered manifest (a file's hash, a broken base link, a capture's bytes) refused by name, with a negative control.
  - R4: the whole-store purge leaves `export_log` byte-identical.
  - The fixture builds on earlier modules only (`test/m/connections/fixture.mjs`, or record-core, provenance and connections), never publication's.

## Old ids (`publication` → this file)

`publication` R18 → R1; R19 → R2; R32 → R3; R31's `export_log` clause → R4; R34 copied as R5. `publication`'s R18, R19 and R32 are retired there as moved (K617, K1024; J10).
