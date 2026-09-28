# escalation (T9)

**Status** · session_017896epnHBaft9zoBzym1HF · depth 2 · COMPLETE · handled B1

## Completion (ESCALATION #3, re-opened for K316)

**Entry applied** (B1, LEGACY-TESTS #6 J2): `src/escalation/index.mjs` `#rows` now reads every `sql.exec` through a spread (`[...this.sql.exec(q, ...a)]`, as strength does), so `#one` sees the first row in workerd, where `exec` answers a cursor. `migrateEscalation`'s DDL `exec` calls read no rows and are unchanged. No LIKE or GLOB pattern in the module; the one in its tests (`'escalation%'`) is 11 bytes (K313).

**Tests moved onto a cursor.** `test/m/escalation/fixture.mjs`'s `sql.exec` now answers a workerd-style cursor (an iterator read once, with `toArray()`, `one()`, `raw()`, `columnNames`), never an array; the fixture's own `rows`, `count` and `snapshot` and one query in `invariants.test.mjs` spread it. Confirmed red on the old code first: 25 of 28 fail; a second `escalationOpen` on the same determination opened `ESC-2026-0002` beside `ESC-2026-0001` (R1's `ALREADY_OPEN` arm), the owner's read answered `NO_SUCH_ESCALATION` and `escalationsDue` answered no items, the three plane symptoms. R2's test now also asserts the project's owner reads an escalation a joined member opened. After the fix: all green. `real.test.mjs` runs on conformance's fixture (not mine), unchanged.

**Deferred:** none.

**Found elsewhere:** the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (owned by `not_product`) is stale by this change; reported, not rebuilt.

**Tests and checks run**
- `node --test test/m/escalation/` (in `bio-plane/`): tests 28, pass 28, fail 0.
- Modules that use escalation, `node --test test/m/monitoring/ test/m/affordances/`: tests 127, pass 116, fail 0, todo 11 (the same as on `tranche/T9`).
- `checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `checks/architecture.mjs escalation`: 10 product files, 34 relative imports; 0 failures.
- `checks/coverage.mjs escalation`: 21 of 21 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs escalation tranche/T9`: 5 files changed; 0 failures.

Size (session_017896epnHBaft9zoBzym1HF): test runs 7, module lines 1429
