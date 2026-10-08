# promotion (T39)

**Status** · session_01D4tF1JLHNsN3tZR6mHerE1 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N808's `latin1` at `release.mjs`:30 does not touch `bundle.md`: it encodes the release **message** (canonical JSON, :169) and the registry's `signers` text for the root check (:89). `bundle.md` is hashed by the caller's `sha256` (`gate.mjs`:1001: a string as UTF-8, which is its stored bytes under R5; bytes as given), never through `latin1`. So R31's "read as bytes" for the released `bundle.md` I meet by passing the selected copy straight to `sha256`, never through `asText` or `latin1`.

The masking N808 names is real in the message and the registry: `canonicalJson` keeps non-ASCII as is, so a signer, transition timestamp or `registry_sha256` holding a code unit above 0xFF (e.g. `ā`, U+0101) is signed as its low byte; two different messages (or two registry texts) then share one signature.

**My best reading (I am building it; say if you want otherwise):** keep the encoding signers use (one byte per code unit; unchanged for every message and registry that is Latin-1, so no signature that verifies today stops verifying), and fail closed on a code unit above 0xFF: the release is an error stating its message cannot be encoded as signed; the registry root does not verify (`root_signature_invalid:not_latin1` when enforced, as any other root failure). The alternative, UTF-8, would change the signed bytes of every message with a character in 0x80–0xFF and break existing signatures, so I do not take it.

## Completion

**Entries applied (T39-3; N800, N808; K2285, K2343, K2358).**
- **R31, C-18.8 over the released bytes** (`release.mjs`, `releasedBundleMd`). The signature is checked over the `bundle.md` as the promotion that recorded the release left it. That promotion is the first manifest entry, in write order (`historyWriteOrder`, R30), whose `bundle.md` holds the transition in its `state_history`. The bytes are its successor's history copy, or live when it is the head. They go straight to the caller's `sha256`, never decoded (a text entry hashes as its UTF-8, the stored bytes). The release is an error saying "what was signed cannot be read" in four cases: no manifest; a manifest with no entries; a version before the release held only as a blob or absent; or no recorded version holding the release. So a later revision no longer fails a signature that verified over what was released. The live `bundle.md` digest is gone (`release.mjs`:135–136 before).
- **N808, Latin-1 never masked (K2358).** The message and the registry root's `signers` keep one byte per code unit. A unit above 0xFF used to be masked to its low byte. Now it fails closed: the release is an error ("its release message holds a character the signer's one-byte encoding cannot carry"), and the root is `root_signature_invalid:not_latin1` when enforced. A Latin-1 message (U+00E5) verifies as before.
- **R32, C-4.2 never throws** (`history.mjs`). The type is looked up in `STATES` by own key only (name, else its alias), and its `edges` and each `from_state` likewise. `toString`, `constructor` and `__proto__` as a type, or as a state, have no table and add no C-4.2 finding. Both throws are gone: an undefined `spec.edges`, and `edges.includes` on an inherited function. `fenceOf` reads own keys too.
- **The stamp, 1.65.0 → 1.66.0 (MINOR)**, over `tranche/T39` at its layer 2 (membership not yet merged). `ROW_CENSUS` **1551 rows, `51c6423ae8d369139c8cb1f3289f83ac247b9ec08775af657c3bd058c5778f76`**, stamp commit `3c5fc0abec`. The fixture was renamed `row-census-1.65.0.jsonl` → `row-census-1.66.0.jsonl` and rewritten by `censusOf`. Diffed line by line against 1.65.0's. Each row is named by its T38 record:
  - 5 new: case-carriage C-141.7–.10; case-disclosures C-120.19 PHOTO_UNCHECKED.
  - 1 re-keyed: C-141.1 MACHINE_CANNOT_MARK → MACHINE_CANNOT_MARK_PHOTO.
  - 1 retired: instance-setup C-64.18 NO_SUCH_MEMBER.
  - 2 changed, translation only: C-120.17 PHOTO_NOT_COVERABLE, C-122.6 PHOTO_MARKS_CHANGED_SINCE.
  - T39's L1 moved no row. doc-clean's `CLEAN_REFUSALS` (EMBEDDED_MEDIA among them) and image-cover's `STRIP_REFUSALS`/`COVER_REFUSALS` map codes to words and carry no `check`, so R50 reads no row in them. 1.66.0's note says so.
  - C-18.8 and C-4.2 are recorded as changed in what the gates run. Notes are in `gate.mjs` and the census suite's header. Rule 3 item 2's T38 share is cleared.
- **If membership's merge moves a row**, send a CHANGE and I re-pin 1.66.0 in place. Its branch carries no code yet.

**Deferred:** none of this entry's. T38's not-worth-their-code items stand as recorded there (`index.mjs`:807, :553–554, :81, :270/:295, :571–581).

**Found in other modules.**
- `build/modules.json`:42: swap promotion's `tests` entry `row-census-1.65.0.jsonl` → `row-census-1.66.0.jsonl` (BOB's at merge). Until then `format` shows exactly this one failure.
- §14, stale generated artifacts: `bio-plane/src/case-checker/program.mjs` embeds 1.65.0 and the old census, and the plane bundle carries the same, plus `release.mjs` and `history.mjs`. Regenerate both at L2's close (K1540).
- record-grammar (N809, already BOB's): at the gate, `checkBundle` throws first on an inherited-key type (`checkHeadings`, `bundle.mjs`:190, "required is not iterable"; `checkStateLegality` has the same exposure). R32's test drives C-4.2 through `recordChecks`, as the gate and the audit run it.
- Comments in case-carriage `checks.mjs`:3 and case-disclosures `checks.mjs`:140 say their rows were "stamped at 1.65.0". The re-keyed, new and re-worded rows are now 1.66.0's. Wording only, for their next jobs.

**Reading (mechanics §17).** The set measured over 300 KB (code 263 KB, tests about 300 KB, requirements 34 KB), so I followed BOB's (3).
- Read whole myself:
  - my requirements;
  - `layers.md` layer 2's row;
  - the plan's rules and T39-3;
  - K1542, K2285, K2343, K2346, K2351;
  - my T38 record;
  - the files this entry changes: `release.mjs`, `history.mjs`, `record-checks.mjs`, `gate.mjs`, `row-census.mjs`, `row-census.test.mjs`, `release.test.mjs`, `history.test.mjs`;
  - the T38 records' awaiting-stamp passages for each moved row.
- A worker read the rest in full (about 361 KB: `index.mjs`, `checks.mjs`, `info2.mjs`, `names.mjs`, `text.mjs`, the other promotion tests, `fixtures.mjs`, d526) and each used module's Purpose and named services (record-core `readImage`, `transact`/`commit`; signatures `verifySshsig`, whose `message` must be bytes; membership; record-grammar `vocabFor`/`normalizeType`). Its summary is about 2,400 words and cites file:line throughout.
- What it left out did not matter. It confirmed `readImage`'s shape (`_history/bundle_K.md` is the pre-image promotion K replaced; the manifest is sorted by key with `seq`), and that no other suite pins the version literal.

**Tests and checks** (on `3c5fc0abec`, `tranche/T39` merged at `347ccc54c6`):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (1.66.0, 1551 rows, `51c6423a…`).
- `node --test bio-plane/test/m/promotion/ bio-plane/test/d526-refusal-order.test.mjs`: 125 tests, 124 pass, 1 fail.
  - The 1 is `registry.test.mjs` R39/R45/R46: `MODULE_ORDER` lacks `doc-clean`. It is rule 3 item 6's red until T39-M.
  - The new R31 tests (3) and R32 test (1) fail on the old code and pass on the new.
- `checks/format.mjs`: 1 failure (the `modules.json` swap).
- `checks/architecture.mjs bio promotion`: 0 failures.
- `checks/coverage.mjs bio promotion`: 56 of 56, 0 failures. R31 and R32 still carry `*(not yet met: T39)*` for BOB to clear.
- `checks/ownership.mjs bio promotion tranche/T39`: 5 files, 0 failures.

Size (session_01D4tF1JLHNsN3tZR6mHerE1): test runs 16, module lines 3578
