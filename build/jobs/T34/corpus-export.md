# corpus-export (T34)

**Status** · session_01NKwzp2HcZSKsKytmRSrj16 · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied (T34-42).**
- (N593, K1632) R7: a `derived-rebuildable` table's rule now carries `from` exactly as `record-core.declaredTables()` answers it on that entry (record-core R77): a list given at declaration travels as given (copied, in its order), and `from: null` travels as `null`, its `rebuild` sentence saying the declaration did not state it. Never an empty list, and this module never fills it in (`tables.mjs` `tableEntry`). New test: `R7 a derived-rebuildable table travels as its rule naming its from…`. It covers a list, `null`, every derived-rebuildable entry in the store against `declaredTables()`, no rows travelling, and pages refused. The existing R7 test also checks `rule.from` against each declaration.
- (N594, K1791) `member_ties` is now declared `never` by people, so it travels under R7's `never` arm (named with its owner and class, no row). The interim `HELD_NEVER` override is retired (constant, its re-export, its branch in `tableEntry` and its check in `exportPage`). It was dead once the owner declared `never`, and no other module imported it. `tables.test.mjs` (the old :84) now asserts people's `never` declaration and the named entry. This clears K1795's/K1791's red.
- (N554) R4: the test follows record-core R80's refusal shape (`code`, `check: "C-102.27"`, `translation`, `detail` naming the table; `table`, `module`, `declaredBy` kept). This clears K1754's red. R4 itself is unchanged.
- DEC-149: no member-facing string in my paths calls the group's Civicsmith "instance", "copy", "plane" or "server", and the strings I added name none.

**Deferred.** Nothing.

**Other modules.**
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` include corpus-export's source, so they are stale until BOB regenerates them at L8's close (manifest, generated artifacts).
- Reds seen in users' suites, identical on `tranche/T34` before my change, so none are mine: op-declarations 1 (t33 R19/R6, K1764); affordances 3 (t33 R19 ×2 and R40/R12, K1805/K1807); plane 1 (`R2, R10 (K1416; control-plane R42)`: control-plane's step ranks directly before the first layer-11 module). The plane red is not among the start's named inherited reds that I could match. It may follow K1824's `modules.json` change (case-catalogue). Reported to BOB.

**Tests and checks.**
- `node --test bio-plane/test/m/corpus-export/`: tests 25, pass 25, fail 0. R8 re-measured: 200,000 rows, 200 pages, 2,493 ms CPU, heap delta 18 MB.
- Users (I changed the R7 manifest entry I provide): publication 97/0, conformance 64/0, queue-producers 85/0, op-declarations 68/1, affordances 189/3, plane 109/1. The fails are the inherited ones above.
- `format`: 127 modules, 126 requirements files, 0 failures. `architecture corpus-export`: 12 product files, 31 relative imports, 0 failures. `coverage corpus-export`: 10 of 10 live requirement ids named by a test, 0 failures. `ownership corpus-export tranche/T34`: 5 files changed, 0 failures.

Size (session_01NKwzp2HcZSKsKytmRSrj16): test runs 4, module lines 1032
