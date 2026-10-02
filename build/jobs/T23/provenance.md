# provenance (T23)

**Status** · session_01WHtvgo4BtJdCWMLR7cpZLQ · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied** (BOB's B1; K1126 answers J1):
- **N496** (K1058, K1076): `bio-plane/test/mk6-bundle-names-no-author.test.mjs` sends a `reason` with `op=attribute` (publication R17, C-92.13). A successful attribution now answers the reason it keeps, which the suite's `okOf` read as a refusal code; the act is now checked by `attributedOf` (ok, and no code when ok). Red 8 clears: 10 pass, 0 fail.
- **N484**: a test named R48 in `test/m/provenance/register.test.mjs` reads `register` with corpus-export's own statement (`SELECT bundle_id, path, capture_sha, bytes FROM register ORDER BY bundle_id`, `src/corpus-export/index.mjs`:108) and finds each capture's size as its entry stated it (12, 0, 5,000,000,000), every row a whole number; negative control: an entry stating no size is refused (R50) and adds no row.
- **R56** (DEC-111, K1031 (2)): `instanceStatement(kind, sha)` (exported, and as a method) returns exactly `${kind}\nsha256: ${sha}\n` and throws on `bio-receipt/1` or a kind not of `^[a-z][a-z0-9-]*/[0-9]+$`; `instanceSign(statement)` signs with R34's key through one signing site shared with `signReceipt` (`#signWith`), records the key in `receipt_keys`, answers `{ok, signature, key_id, public_key}` or `RECEIPT_NO_KEY`, and throws on text that is not an instance statement (J1 (a)); `instanceKeys()` answers `[{key_id, public_key, first_used}]` by first use (J1 (b)). Tests in `test/m/provenance/instance-key.test.mjs`, with the negative controls B1 names: the receipt's kind and 15 malformed kinds throw; `RECEIPT_NO_KEY` with its catalogue row and nothing written when no key is bound; a receipt's text and other non-statements are never signed and write nothing; neither private key is in `instanceKeys`; signatures checked independently with node's Ed25519.
- **N497** (K1087, K1099): `test/m/provenance/fixture.mjs` registers promotion's facts under their providers (`instance-setup` `producingGroup`, `connections` `citedBy`, `publication` `caseMember`); `testimony-slot.test.mjs` registers the stand-in step as `control-plane`.

**Deferred**: none.

**Found in other modules / generated artifacts**: the change under `bio-plane/src/provenance/` stales the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` (not regenerated, `build/manifest.md`). `build/requirements/provenance.md` R48 and R56 still carry their `*(not yet met: T23 …)*` marks, which are BOB's to lift.

**Tests and checks**:
- `node --test bio-plane/test/m/provenance/`: tests 117, pass 117, fail 0.
- `node --test bio-plane/test/mk6-bundle-names-no-author.test.mjs`: 10 pass, 0 fail.
- `node --test bio-plane/test/m/` (every user of provenance among it): tests 5025, pass 5012, fail 1, todo 12. The one red is control-plane `inbox-door.test.mjs`:81 (accepted red 9, until capture's merge); no other red.
- `checks/format.mjs`: 87 modules, 0 failures. `checks/architecture.mjs provenance`: 0 failures. `checks/coverage.mjs provenance`: 56 of 56 live ids named by a test, 0 failures. `checks/ownership.mjs provenance tranche/T23`: 7 files changed, 0 failures.

Size (session_01WHtvgo4BtJdCWMLR7cpZLQ): test runs 9, module lines 3984

## J1 · QUESTION

R56, two points its items leave open; I am building on this reading and carry on. (a) instanceSign(statement) given text that is not one instanceStatement makes (a receipt's bio-receipt/1 text, a malformed kind, a non-string) THROWS, as instanceStatement does, before the key is asked: R56 names no refusal for it and RECEIPT_MALFORMED's catalogue row speaks of a receipt, so I mint no code; this keeps the door from ever signing a receipt. (b) instanceKeys() answers a plain array [{key_id, public_key, first_used}] ordered by first_used then key_id (R11's shape for a list), not an {ok, keys} envelope. Say if either should differ. Lines after R56: 3,985 of 4,000.

## J2 · COMPLETE

provenance T23 complete (record: Completion). N496 (mk6 sends reason; red 8 clears, 10/0), N484 (R48 test as corpus-export reads register.bytes), R56 (instanceStatement/instanceSign/instanceKeys per K1126, tests with B1's negative controls), N497 (fixture providers; control-plane step). provenance 117/117; test/m 5025 tests, 1 fail = accepted red 9 (control-plane inbox-door:81) only; format/architecture/coverage (56/56)/ownership 0 failures. REPORT: the plane's bundle bio-plane/dist/bio-plane.bundled.mjs is stale (not regenerated); R48 and R56 'not yet met' marks are yours to lift. Lines 3,984 of 4,000.
