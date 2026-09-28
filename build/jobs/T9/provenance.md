# provenance (T9)

**Status** · session_0161QPugnHiTsuxwXcBoAXHa · depth 2 · COMPLETE · handled B2

## Completion (PROVENANCE #3)

**Entries applied** (plan layer 3):
- **N133** (R48's whole-second spelling): `recordReceipt` spells `first_retrieved`/`last_retrieved` `YYYY-MM-DDTHH:MM:SSZ` on every write, through record-core's `stampInstant("second")` (R47): a readable `retrieved` in any ISO spelling is re-spelled to its whole second (fraction dropped, offset read to UTC); none, or one naming no instant, takes this module's clock. This fixes the millisecond default B1 named (`#now()` was stored as given). `migrate` re-spells receipts stored before (SQLite `strftime`, idempotent); a stored value naming no instant is left as it is, not invented.
- **N145**: a test naming R48's `authored` column (with `author`): 1 exactly for an authored observation, `author` set exactly then.
- **N213** (its share): tests naming `register.bytes` (as the entry states it, parts-held whole included, revision carries the new size) and `register.author`.
- **N227**: a test naming `captured_locators.via` (part of the key; `direct` by default) and `last_retrieved` (R13's latest, widened as instants).
- **N202** (its share): `onReceipt` refuses through membership's `listenerRefusal` (R81); this module mints neither `LISTENER_MALFORMED` nor `LISTENER_DECLARED` any more. Tested against `listenerRefusal`'s own answer for the same condition.

**Flaws fixed in this module:**
- R47's listeners ran in registration order in production: `provenanceOf` passed no order, and the default was `[]`. The default is now membership's `MODULE_ORDER`, the list promotion's steps run in; tested.
- A stale comment in `registerRows` said record-core's read contract did not state `history.sha256`; R37 states it now.

**Deferred:** none of the plan's share.

**Found in other modules / for BOB:**
- `build/requirements/provenance.md` lines 111–112: `attestationsOf`'s header appears twice, in two shapes (with and without `registered`/`undetermined?`/`note`); the first matches R49's text and the code. The second should go (BOB's file).
- A register entry whose `bytes` is absent or null makes the promotion answer `PROMOTE_FAILED` (a NOT NULL error), and `-1` or `1.5` are stored as stated. R48 says "as the entry that registers it states it", so I kept that and tested it; a named refusal of a malformed size would need a catalogue row (legacy-checks), so it is proposed, not built.
- `MODULE_ORDER` is exported by membership and read by promotion and now this module, but membership's Provides does not name it.
- Generated artifact made stale: `agent-worker/dist/agent-worker.bundled.mjs` (its inputs include `src/provenance/index.mjs` and `schema.mjs`); not rebuilt (§14).
- `connections`' test `R24, R18, K155` (factory.test.mjs) fails on `tranche/T9` with and without this change: `captureOf` refuses a second `env` (capture R58). Not this module's.

**Tests and checks:**
- `node --test bio-plane/test/m/provenance/*.test.mjs`: tests 61, pass 61, fail 0, todo 0.
- Users of provenance, each module's tests: capture 59/0, content 50/0, entities 34/0, connections 59 pass 1 fail (above, not this change's), progressions 40/0 (1 todo), observation-log 42/0, retrieval 58/0, inquiry 50/0, basis-versions 42/0, strength 40/0, intent 35/0, reevaluation 39/0, publication 53/0 (2 todo), ratification 65/0 (1 todo), case-authoring 38/0, consequences 22/0, actions 30/0, filings 30/0, monitoring 43/0 (10 todo), queue 10/0.
- `format`: 0 failures. `architecture provenance`: 0 failures. `coverage provenance`: 49 of 49 live ids named; 0 failures. `ownership provenance tranche/T9`: 0 failures (re-run after commit below).

Size (session_017KrztZChBMPxWJ41xnLD4i): test runs 8, module lines 3175

## Completion (PROVENANCE #4, re-opened by B2, K313)

**Entry applied** (B2): `respellReceiptInstants` (`bio-plane/src/provenance/schema.mjs`, R48, N133) no longer uses a GLOB pattern. The 76-byte `NOT GLOB` whole-second test exceeded workerd's 50-byte LIKE/GLOB cap, so any durable object holding a `captured_locators` row failed at boot. The already-spelled test is now `strftime('%Y-%m-%dT%H:%M:%SZ', col) <> col` (with `IS NOT NULL`, so a value naming no instant is left): a row whose value is its own whole-second spelling is untouched, so the respelling stays idempotent. No LIKE or GLOB anywhere in the module now.

**Test added:** `R48: the whole-second respelling runs at every boot under workerd's 50-byte LIKE/GLOB cap, idempotent` (register.test.mjs) wraps the record's `sql.exec` to refuse any LIKE/GLOB pattern over 50 bytes, literal or bound, as workerd does. It migrates twice over receipts that have a fraction, an offset, a space-separated spelling, garbage and an already whole-second value, then runs the receipt services under the same cap. It was red on the old code (`LIKE or GLOB pattern too complex` from `respellReceiptInstants`) and is green now.

**Also:** R50 (N263, added since my last job, `not yet met: T10`) had no test, so coverage failed. It now has a `test.todo` that names its cause, as B1 directs. Nothing else is deferred.

**Found in other modules / for BOB:** Generated artifact made stale again: the plane bundle (`agent-worker/dist/agent-worker.bundled.mjs`, inputs include `src/provenance/schema.mjs`). It was not rebuilt (§14).

**Tests and checks:**
- `node --test bio-plane/test/m/provenance/*.test.mjs`: tests 63, pass 62, fail 0, todo 1 (R50).
- `node --test bio-plane/test/versionnotice.test.mjs`: `versionnotice: 42 pass, 0 fail` (on the old code, 3 pass, 1 fail).
- `format`: 0 failures. `architecture provenance`: 0 failures. `coverage provenance`: 50 of 50 live ids named; 0 failures. `ownership provenance tranche/T9`: 0 failures.

Size (session_0161QPugnHiTsuxwXcBoAXHa): test runs 9, module lines 3177

## J1 · REPORT

Found outside my module (details in my record's Completion): (1) provenance.md lines 111-112 state attestationsOf's header twice in two shapes; the first matches R49 and the code, the second should go. (2) A register entry with bytes absent/null fails the promotion as PROMOTE_FAILED (NOT NULL); -1 or 1.5 are stored as stated (R48: 'as the entry states it'); a named refusal would need a legacy-checks row — proposed for a later tranche, not built. (3) membership exports MODULE_ORDER, read by promotion and now provenance (R47's order; production passed none, so listeners ran in registration order — fixed), but membership's Provides does not name it. (4) Stale artifact: agent-worker/dist/agent-worker.bundled.mjs (inputs src/provenance/index.mjs, schema.mjs); not rebuilt. (5) connections' test 'R24, R18, K155' (factory.test.mjs) fails on tranche/T9 with and without my change: captureOf refuses a second env (capture R58).

## J2 · COMPLETE

T9 provenance complete at 576b3110a9 on job/T9/provenance. Applied N133 (whole-second first_retrieved/last_retrieved on every write via stampInstant, the millisecond default fixed; migrate re-spells old rows), N145, N213 and N227 (R48 tests for authored, author, bytes, via, last_retrieved), N202 (onReceipt refuses through membership's listenerRefusal). Also fixed: R47 listeners now default to MODULE_ORDER. Provenance tests 61/61; users' tests pass except connections' pre-existing factory failure (REPORT). format, architecture, coverage (49/49), ownership: 0 failures. Nothing deferred.
