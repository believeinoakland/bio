# provenance (T9)

**Status** · session_017KrztZChBMPxWJ41xnLD4i · depth 2 · WORKING · handled B1

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
