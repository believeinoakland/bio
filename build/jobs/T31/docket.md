# docket (T31)

**Status** · session_01Qyoizgt1w9CACfsTkAN1sV · depth 2 · WORKING · handled B3

## Completion

**Entries applied** (`plan/current.md` T31 L8; B1):
- **N538, R6** (DEC-124, K1365): a new public entry carries `civicsmith-docket-entry/1` (`ENTRY_FORMAT`). The old label is exported as `LEGACY_ENTRY_FORMAT`, both as `ENTRY_FORMATS`, with `isEntryFormat(label)` for any reader. An entry published before T31 keeps its stored bytes and label; nothing in this module branches on the label, so a chain holding both reads whole, `previous` being the prior entry's digest over its own stored bytes. Tests (`formats.test.mjs`): "R6 the labels" (both accepted, others refused), and "R6 R14 R15 a case's chain holding both labels": two old-label entries, as the code before T31 left them (fixture `legacyEntry`), still verify against the owner's key over `signatures.docketStatement` (negative control: the same bytes relabelled do not); a holder files under the old-label grant; new entries chain onto them under the new label; `docketPublic` answers all five in order, each verifying and chaining; the feed lists all five, newest first.
- **R15** (K1365 (3)), stated permanent, unmarked: the Atom ids' prefix is now the named constant `FEED_ID_PREFIX` (`urn:civicos:docket`), unchanged; the mixed-chain test proves no id moves.
- **N534, R24**: `docketPublic({case, captures})`. With `captures: "omit"`, `captures` is `{}`, the answer adds `captures_omitted: true`, and no capture's bytes are read (the evidence store is not touched). Any other value reads them as R14 says. Tests: "R24 docketPublic's exact form" (the answer's and each entry's keys exactly, json canonical with its digest, fields parsed, the signature verifying in `NS_DOCKET`, `taken_back` `{seq, date}` or null, an old-label entry in the same form) and "R24 with captures: \"omit\"" (no store read, nothing written, all else equal to the full answer, other values not omitting).
- **A flaw put right for R24's exact form:** the answer used to add `captures_unread` (a list of hashes the store could not answer) when any was missing. No requirement named it, no other module reads it, and R24 fixes the answer's keys, so it is gone: an unread capture is `null` under its hash, as K1274 says. The R14 test now asserts that form.

**Deferred:** nothing.

**In other modules (REPORT to BOB):**
- **bio-plane bundle** (generated artifact, mechanics §14, owned by `not_product`): `bio-plane/dist/bio-plane.bundled.mjs` bundles `src/docket/`, so this change makes it stale. I did not write it; regenerate at the layer close.
- `network-notices`' test fixture (`test/m/network-notices/fixture.mjs:194`) writes a docket entry with the old label. It still passes (both labels are one format); it is that module's to re-label, if it wants to.

**Tests and checks:**
- `node --test bio-plane/test/m/docket/`: tests 43, pass 43, fail 0.
- Tests of every module that uses docket (`modules.json`): public-read 105/105, network-notices 63/63, case-import 52/52, affordances 156/156, queue-producers 73/73, control-plane 147/147, plane 76/76, `test/system/migrate-released.test.mjs` 1/1; 0 failures.
- `node checks/format.mjs`: 98 modules, 97 requirements files; 0 failures.
- `node checks/architecture.mjs … docket`: 8 product files, 42 relative imports; 0 failures.
- `node checks/coverage.mjs … docket`: 24 of 24 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … docket tranche/T31`: 6 files changed by docket; 0 failures.
- The Uses modules' public parts read for the services these entries touch (`signatures` R39, R40; `case-import` R18's reading of R6 and R24); the others were not re-read whole, since no entry touches them.

Size (session_01Qyoizgt1w9CACfsTkAN1sV): test runs 11, module lines 1313

## J1 · COMPLETE

N538 R6 and N534 R24 applied. New entries carry civicsmith-docket-entry/1; civicos-docket-entry/1 accepted as the same format (LEGACY_ENTRY_FORMAT, ENTRY_FORMATS, isEntryFormat); a mixed chain proven to verify, chain and read whole and in order, feed ids unchanged (FEED_ID_PREFIX urn:civicos:docket). docketPublic takes captures: "omit" (captures {}, captures_omitted: true, no bytes read); its exact form tested. Fixed for R24's exact form: the undocumented captures_unread key is dropped (an unread capture is null, K1274; nothing reads it). docket 43/43; every user module's tests green (public-read, network-notices, case-import, affordances, queue-producers, control-plane, plane); format, architecture, coverage (24/24), ownership: 0 failures. Report, in the record: bio-plane/dist/bio-plane.bundled.mjs (not_product's generated bundle) is stale from this change.

## J2 · REPORT

B2 applied: tranche/T31 (case-grammar merged) merged into job/T31/docket and pushed. docket 43/43; network-notices 63/63, case-import 52/52, plane 76/76. public-read 102/105: the same 3 fail on origin/tranche/T31 itself without docket's change (R23 case file manifest, R23 co-attestation tokens, R3 a /6 document's method and materials blocks), from case-grammar's /7; public-read's L8 job's, not docket's. Not posting COMPLETE yet: my provider publication is not merged; I will merge and post COMPLETE after your CHANGE for it.

**After B2 and B3** (tranche/T31 merged with case-grammar, then publication): docket 43/43; network-notices 63/63, case-import 52/52, affordances 156/156, queue-producers 73/73, control-plane 147/147, plane 76/76, migrate-released 1/1; public-read 103/105, the same 2 failing on `origin/tranche/T31` without docket's change (R23 the case file; R23 co-attestation tokens), public-read's own. format, architecture (9 product files, 46 imports), coverage (24/24), ownership (6 files): 0 failures. Test runs since: 18.
