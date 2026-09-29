# instance-setup (T14)

**Status** · session_01DPmbhhprRy4e11XMiCZMiE · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** N339 with N349, R43 (B1). The eight relays in `bio-plane/src/setup.mjs` (T14's :2475, :2479, :2487, :2496, :2569, :2580, :2588, :2610) now answer through one private function, `notAnswered(out, op, io)`: a `refused` reply (control-plane R23, `ok: false` below 500) is relayed with the store's status, code and sentence through `storeRefusal` when the caller hands it, else as `json(out.reply.body, out.reply.status)` (the same answer); anything else is `storeSilent(op, out.correlation)`, so the store's correlation id is carried when it gave one (R25). `runtime`'s three sub-reads relay the first of them, in read order, that is not an answer (K444). `cpuprobe`'s two "answered but not confirmed" arms (no state result; a start not `recorded`) stay silences with no correlation, since the store answered and gave none. `selftest` is unchanged (a report). `instanceSetupStore` and `instanceSetupRoute` stay (T15, N348). The R39 checkpoint path is unchanged: an unconfirmed step, refused or silent, still ends the probe with the incomplete-trail answer.

**Not yet met marks my work meets.** R43 *(not yet met: N339, N349)*: met; BOB strikes it.

**What legacy-index must hand me at layer 11, per call site** (`bio-plane/src/index.mjs` on `tranche/T14`): add control-plane's `storeRefusal` to the handed object at :260 (`instanceGroupOp`), :276 (`groupIdentityOp`), :386 (`bootstrapReport`), :632 (`runtimeOp`) and :639 (`cpuProbeOp`), and to the import at :117. `selftest` (:572) needs nothing. Until then each answers the same refusal through `json`, tested both ways.

**Deferred.** None.

**Found in other modules.**
- `ratification` / `legacy-tests`: `bio-plane/test/plane-envelope.test.mjs` exits failing on `tranche/T14` @ this job's base, with or without my change (the same three lines, compared): `CLOSED (i)`, `CLOSED (i), THE OTHER DIRECTION` and `REACH (D2), AS A DELTA` (the ratify region's `do/list` guard and the commit-site guard, read by source over `src/ratification/ops.mjs`). Not this module's.
- `legacy-index`: `setupPage` is imported at `index.mjs`:2 and unused there (the `/` route is control-plane's), as `draft-T14-wordings-2.md` §5 says.
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`, built from the plane's source, which includes `src/setup.mjs`). Not rebuilt.
- No check row added, moved or retired: nothing awaiting stamp. `civicos-ui/` and affordances' lists: no hit for `notAnswered` or for the handed `storeRefusal`.

**Tests** (a stand-in of control-plane's `doAnswer`, `storeSilent` and `storeRefusal` in `fixture.mjs`, since control-plane is later in the order):
- `node --test bio-plane/test/m/instance-setup/`: tests 56, pass 56, fail 0, todo 0 (new `relay.test.mjs`: R43 × 11 relay reads × 4 bad replies × with and without `storeRefusal`, and the unchanged 200 path). Negative control: `relay.test.mjs` against the base `setup.mjs` fails 2 of 3.
- Users of the module: `bio-plane/test/m/control-plane/` with `bootstrap`, `d116-serving-builds`, `group-identity`, `group-public`, `instance-group`, `gate-reads` and `plane-envelope`: tests 108, pass 107, fail 1 (`plane-envelope`, pre-existing, above). `newgroup/test/` (installer): tests 35, pass 30, fail 0, todo 5.
- No layer tests are named in `build/manifest.md`.

**Checks.** `format`: 69 modules, 64 requirements files; 0 failures. `architecture instance-setup`: 12 product files, 40 relative imports; 0 failures. `coverage instance-setup`: 43 of 43 live ids named by a test; 0 failures. `ownership instance-setup tranche/T14`: 4 files changed; legacy-store, legacy-checks, legacy-index 0 lines added, 0 removed; 0 failures.

Size (session_01DPmbhhprRy4e11XMiCZMiE): test runs 8, module lines 2894

## J1 · COMPLETE

R43 (N339, N349) applied: the eight relays answer a store refusal with its status, code and sentence (storeRefusal when handed, else json(body, status)), and a silence with the store's correlation; runtime's three sub-reads too (K444); selftest unchanged. Tests 56/56 in the module, checks 0 failures. legacy-index must hand storeRefusal at index.mjs:260, :276, :386, :632, :639 (listed in the record). Reported: plane-envelope.test.mjs fails 3 lines in the ratify region on the base too (not mine); bio-plane.bundled.mjs made stale, not rebuilt. R43's not-yet-met mark is met. Details in the record's Completion.
