# provenance (T24)

**Status** · session_01Tohc8CMuv7F1WY3Kqsr8dU · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (BOB's B1):
- **N504, R57**: `instanceKeyBound()` (`src/provenance/index.mjs`) answers `true` exactly when R34's key can be read (so `instanceSign` signs) and `false` otherwise, an unset, blank or unreadable key included; it reads the key and nothing else, so it signs nothing and writes nothing (`receipt_keys` and every `first_used` unchanged), and it never rejects. It is asynchronous (a `Promise<boolean>`), as reading the key through WebCrypto is: network-notices R1 awaits it.
- **An unreadable key is no key** (an improvement in this module, to keep R57's "so `instanceSign` would sign" exact): before, a bound key that could not be imported made `instanceSign` and `signReceipt` reject; now `#key` answers null for it, so both answer `RECEIPT_NO_KEY` (C-103.7, R56's stated refusal), its detail now saying "no receipt-signing key it can read". No other behaviour moved.
- **Re-scan for the N502/N508 kind** (`plan/t24-stale-notes.md` names no provenance line; my own scan found four and re-worded each): `index.mjs` the R54 block (the legacy store's `auditPass` "now answers" → record-core's audit, its R68, answers it; the store retired), `routeOf` (`#withRoute` named as the retired store's), `counts` ("as the legacy store's `#counts` takes them" → took them, the store retired); `ops.mjs` header (the map "for its spread" → now spread by the plane store, `src/plane/store.mjs`). No `awaiting stamp` note is in the module. Past-tense history notes left as they are.

**Tests**: four R57 tests in `test/m/provenance/instance-key.test.mjs`, with B1's negative controls: bound (true, asked twice; every table unchanged, `receipt_keys` empty; then `instanceSign` signs); `first_used` (asked before the key's first statement and after it, at later instants: the key's `first_used` is its first statement's and nothing moves); unbound (`null`, `""`, blank: false, nothing written, `instanceSign` answers `RECEIPT_NO_KEY`); unreadable (four keys: not base64, base64 of no key, a P-256 key, an Ed25519 key cut short: resolves false, never rejects, nothing written, `instanceSign` and `signReceipt` answer `RECEIPT_NO_KEY`). Against the module before the change all four fail (3 pass, 4 fail).

**Deferred**: none.

**Found in other modules / generated artifacts** (REPORT):
- The change under `bio-plane/src/provenance/` stales the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` (not regenerated, `build/manifest.md`).
- `build/requirements/provenance.md` R57 still carries `*(not yet met: T24)*`, BOB's to strike at the merge.
- Size: `bio-plane/src/provenance/` is now 4,001 lines (3,984 at T23's close), at the ~4,000 mark of `layers.md` ruling 1, for BOB to report.
- No row added or changed (red 5: none to list).

**Tests and checks**:
- `node --test bio-plane/test/m/provenance/`: tests 121, pass 121, fail 0.
- `node --test bio-plane/test/mk6-bundle-names-no-author.test.mjs`: tests 1, pass 1, fail 0.
- `node --test bio-plane/test/m/` (network-notices, provenance's R57 consumer, among it): tests 5234, pass 5223, fail 0, cancelled 0, skipped 0, todo 11. No red.
- `checks/format.mjs`: 88 modules, 87 requirements files; 2 failures, both `link-sweep`'s absent directories (accepted red 4). `checks/architecture.mjs provenance`: 24 product files, 0 failures. `checks/coverage.mjs provenance`: 57 of 57 live requirement ids named by a test, 0 failures. `checks/ownership.mjs provenance tranche/T24`: 4 files changed, 0 failures.

Size (session_01Tohc8CMuv7F1WY3Kqsr8dU): test runs 4, module lines 4001
