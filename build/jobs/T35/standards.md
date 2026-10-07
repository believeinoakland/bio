# standards (T35)

**Status** · session_01XCY7KyghJZH9SEre4scpDf · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

Five readings; I am building on each now, and change course only if you answer otherwise.

1. **R41, a capture's author (needs an edge).** No `content` read answers who captured a capture (Uses says content does). The only record is `capture`'s `capture_actors`, read by `capture.captureAccountsOf(sha, {viewer})`. Reading: `standards` uses `capture` (layer 3, earlier); a text passage's capture is member-captured when an actor there is a `member:` id that is not a machine identity. Otherwise `TEXT_NOT_MEMBER_CAPTURED`. Asks: the `modules.json` edge standards → capture.
2. **R38 `version_basis` (needs an edge).** "Two held captures of one address" and each capture's retrieval instant are `provenance`'s receipts (`receipts({addressNorm})` and a capture's receipt). Reading: `standards` uses `provenance` (layer 3, earlier), read only for this. Asks: the edge standards → provenance.
3. **R35 `forcePropose`'s label.** `record-grammar`'s `proposalLabel` has no force subject. R35 says "labelled through the same composer (subject `standard`)", so I use `standard`. Reporting it, not changing it: its sentences speak of "this standard", and a `force` subject would be a record-grammar requirement later.
4. **R35 `portion`.** A standard records at most one `portion_path`. Reading: a force's portion is admitted when it is a portion path (R31) and either equals the standard's recorded portion, or the standard records none (the whole instrument, any of whose clauses may be named). Otherwise `PORTION_UNKNOWN`.
5. **R37, "a bundle not every member may see".** Reading: a text passage's bundle whose `bundles.project` is set (filed in a project). A `policy` with any such text is held at that bundle's sight (every such bundle must be seen), and the owners of that bundle's project may release it (`membership.projectOwners`).

Also: my new rows are C-112.33–.52 and .54–.58. I leave .53 to law-relations' `LAW_RELATION_NO_EDITION`, as its requirement suggests.

## J2 · COMPLETE

T35-31 is done, with B2 (K1967) and B3's CHANGE (K1970) applied. Branch `job/T35/standards`, which has `tranche/T35` @ 00d0892258 merged in.

**Entries applied**
- **T35-31 (N643, N659):**
  - R1, R2, R9, R12 and R14 amended: seven kinds through `STANDARD_SOURCE_KINDS`; `held`; text only when held `text`; adoption as cited; the new tables.
  - R33 to R43 new: family; held, cited, absent and `isMeasure`; force per provision (`forceDeclare`, `forcePropose`, `forceConfirm`, `forceWithdraw`, `forcesOf`); copy widened and `copy_claimed`; sight from the source and `releaseStandard`; `version_basis`, `overrides`, `force_source` and `overridesOf`; designation, edition and issuer as an entity; `adoptionRecord` and `editionInForce`; access and member-captured text; targets; `bindsAt`, `impositionRecord` and `benchmarkDeclare`.
  - R45: the members' words, in `words.mjs`.
  - R47: a found extent, and the question beside a declaration.
- **DEC-149, 2 rows:** `index.mjs` :203 and :206 are now R46's two sentences, and a test names each.
- **N698:** R47.
- **K1961/K1970, R48:**
  - `law.mjs` deleted. `LawRecords` from `law-relations` is constructed over my host, with `idsAtKey`, `idsOfKind` and `idsCovering` added, and each law service is delegated to it.
  - The ops are kept, and the names re-exported as the same objects.
  - The five law tables are dropped from my schema and my declaration, and the nine law rows from my checks.
- **Tests moved:** I deleted `test/m/standards/law.test.mjs` (its cases are law-relations' R1 to R6 and R14, now in `test/m/law-relations/`). The R25 and R28 cases in `reads.test.mjs`, and the R23 label case in `t34.test.mjs`, stay, re-labelled R48 because they drive the delegation.
- **New ops** (op-declarations to declare them, T35-70): `standardforce` (confirms when given `proposal`), `standardforcepropose`, `standardforcewithdraw`, `forcesof`, `standardrelease`, `overridesof`, `standardadoption`, `editioninforce`, `bindsat`, `standardimpose`, `standardbenchmark`. `standards` also takes `family`.

**Catalogue rows**
- **New, awaiting stamp:** C-112.33 to .52 and .54 to .58 (25 rows). C-112.53 stays law-relations'.
- **Re-worded, awaiting stamp:** C-112.3 (`STANDARD_KIND_UNKNOWN`, the seven kinds) and C-112.21 (`STANDARD_FIELD_INVALID`: its translation is wider, and its `where` is now `refuseFieldInvalid`).
- **Moved out with law.mjs:** C-112.23, .24 and .26 to .32.

**My readings (BOB's to overrule)**
- A force proposal is labelled with subject `standard` (J1 (3)).
- R1's "R40 (`adoption`)" is read as nothing on the declaration: an adoption is recorded only by `adoptionRecord`.
- `designation` and `edition` read back as plain values, with `designation_read` and `edition_read` beside them carrying what the cite reads and any difference.
- A standard's `says` is now an object (R45's phrases plus `note`, which is R5's old sentence). No module outside `standards` reads `standardRead().says`; I grepped the users to confirm.
- Improvement: the instrument key now takes a series' own `number` group (`HSO 4/21 para 3` gives `/eli/…/harbour-master/4-21`, not `/3`). A `/` inside a number becomes `-`.

**Deferred**
- R7 says three states, and R20 now also answers `overridden` (R38). `inForce`, R7's alias, passes it through unchanged. `IN_FORCE_STATES` stays three. Wording is BOB's.
- R38's `version_basis` reads all of `provenance.receipts()`, which has no read by capture. That is fine at today's volumes; a read by capture would be provenance's.

**Found in other modules (REPORT)**
- **law-relations:** it does not export the functions that mint `MACHINE_CANNOT_RELATE` and `LAW_RELATION_NO_CITATION`. My R40 and R43 answer these codes, so I mint them through its exported `refusal`, from its rows, in two local functions. It should export `machineRelate` and `refuseNoCitation`, so that each code is minted at one site (DEC-49).
- **leg-earning** R1/R3 "earnedBasis for a cell leg" and **action-clocks** R12 ×2 (accepted red 14) fail on `tranche/T35` with or without my change, so they are not mine.

**Tests and checks**
- standards 73 tests: 72 pass, 1 fail (R29, accepted red 25).
- law-relations: 25 pass, 0 fail.
- Users of standards:
  - conformance 66/0, filings 67/0, action-plans 63/0, duties 37/0, progressions 61/0, actions 96/0, inquiry 175/0, reevaluation 140/0.
  - leg-earning 46/1 and action-clocks 51/2, the same failures as on `tranche/T35`.
- Checks:
  - `format`: 0 failures.
  - `architecture standards`: 0 failures.
  - `coverage standards`: 39 of 39 ids, 0 failures.
  - `ownership standards tranche/T35`: 14 files, 0 failures.

Size (session_01XCY7KyghJZH9SEre4scpDf): test runs 16, module lines 2952.

## J3 · REPORT

law-relations: it exports no minting function for MACHINE_CANNOT_RELATE or LAW_RELATION_NO_CITATION, which standards R40 and R43 answer. standards mints them through law-relations' exported `refusal`, from its rows, in two local functions. Exporting `machineRelate` and `refuseNoCitation` would keep each code at one site (DEC-49). Separately: leg-earning's 'R1 R3 earnedBasis for a cell leg' test fails on tranche/T35 with or without standards' change (not mine; owner unknown to me).

## J4 · COMPLETE

B4 is applied. I merged tranche/T35 @ e7a590241f. IN_FORCE_STATES now names four states, `overridden` included, and a test shows inForce answering `overridden` as inForceAt does (R7). standards: 65 of 66 pass; the one failure is R29, accepted red 25. The format, architecture, coverage (39/39) and ownership checks each show 0 failures. The two local minting functions stay until your CHANGE after law-relations' R21 re-merge. Size (session_01XCY7KyghJZH9SEre4scpDf): test runs 18, module lines 2952.
