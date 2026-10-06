# public-read (T33)

**Status** · session_01FpBN8hkUyqmxvtFg3izFyL · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

My readings of T33-65, on which I am building now (none of case-grammar, publication or docket has merged; each is an injected dep coded to its requirements, re-pointed before COMPLETE, K1563 (1)).

1. **R23, a calculation's inputs.** No requirement commits a calculation input's canonical bytes to the published projection: publication's requirements name no calculation, and case-authoring R56 writes only the `calculations:` block. Reading: the case file carries each `calculations:` row as one `calculation` file (case-grammar R13), and each input the published projection holds at the row's hash (the published bucket, or `publication.publishedMaterialText`); an input not held is named in `unheld` (`what: "calculation_input"`, K1316's pattern for materials), so the checker reports it missing (case-checker R20) and nothing is left out silently. This module then needs no `calculations` edge (Uses' open point): it drops it. For full R23 compliance some module must commit the input bytes at publish (publication R22's commit, or case-authoring R56); that is a gap outside my module, sent as a REPORT. Paths: I use `caseFilePath("calculation", <calc>)` and `caseFilePath("calculation_input", <sha256>)` until case-grammar's T33-60 spells them, then re-point.
2. **R26.** Each row of `case-grammar.calculationsOf(fm)` answered as `calculations: [{calc, question, outputs, method_version, recompute, label: "computed fact", disclosed}]`: `question` from the recipe's own question when it states one, else null (R18's row carries no question field; I do not read `calculations` live, R10); each output with its key, its value and, for a `share` or `ratio`, its numerator and denominator beside it (a share whose row gives no denominator is answered `denominator: null` with a sentence that it is undetermined, never alone as a bare share). A load-bearing row with `recompute` `differs` or `unbound` carries `disclosed` (the publisher's words) beside it; one with none says the document states no disclosure. Empty list when the block is absent.
3. **R27.** `timeline: {they_did: [...], we_did: [...], placed_nowhere: {they_did: [...], we_did: [...]}}` from `case-grammar.timelineOf(fm)`, each item `{ord, when, label, ref, source}` as signed; an item whose `when` is `nowhere` is listed apart under `placed_nowhere`, an undetermined `when` kept as held. Both lanes empty without the block.
4. **R28, "the docket entry that names the order".** docket provides no synchronous read of one entry, and `publishedCase` is synchronous. Reading: as R20, each stamp is served linked to its entry: `court_orders: [{effect, parts, stamped_at, entry: {seq, id, digest, docket: "op=docketpublic&case=<case>"}}]`, the entry's fields read from the stamp; the entry itself is at the docket's fixed address. If you want the entry whole in the answer, docket needs a synchronous `entryOf({case, seq})`.
5. **R28, what is withheld.** From publication R62's stamps (`stampsOf({case, edition})`), in order: `remove` with no `parts` withholds the whole edition (its signed document's text, its case file's or container's manifest, every file it lists, and each member finding's bytes); `remove` or `seal` with `parts` withholds those parts; `unseal` ends a `seal`'s withholding for the parts it names and never a `remove`'s; `redact` withholds nothing (past editions stand, K1493) and is served as a stamp. A part is matched by its path in the edition's manifest or by its SHA-256. The same hash under another edition no order names is still withheld at `op=publishedbytes` (a hash is one object; compliance over availability), and `publishedCase` states the withholding wherever the bytes would appear.
6. **R28, the code.** Bytes withheld are answered at `op=publishedbytes` by a new row of this module's table, C-98.11 `WITHHELD_BY_COURT_ORDER`, HTTP 451, naming the stamps and their docket entries; translation (yours to change): "A court order this group complied with keeps these contents from being handed over. The order and the record entry that names it are public, and nothing was deleted. Nothing was changed." Its stamp by a release is T34's (K1504's placement of new rows).

## J2 · REPORT

Built on J1's readings and pushed (`job/T33/public-read`; module 122/122; format, architecture, coverage 28/28, ownership 0 failures). Found outside my module:

1. **R23's calculation inputs (publication, or case-authoring).** No module commits a calculation input's canonical bytes to the published projection, so the case file can carry an input only where the published bucket or `publication.publishedMaterialText` already holds it at the row's hash; every other is named in `unheld` (`what: "calculation_input"`), and `case-checker` R20 will report it missing. Full compliance needs `publication`'s commit (its R22, beside R57's materials) or `case-authoring` R56 to commit each input's bytes by hash and register it in `published_shas`.
2. **Row census.** C-98.11 `WITHHELD_BY_COURT_ORDER` (J1 (6)) joins `test/system/row-census.test.mjs`'s rows awaiting promotion's stamp (named red class, K1542). Otherwise the dependent suites I ran (control-plane routes and families, filings, network-notices, op-declarations, plane, publication, ratification, review, case-checker spec, mk6) fail exactly as `tranche/T33` does today: families "CHECK_FAMILIES is total" (K1581), filings R9/R30 (K1519), row-census.
3. **Generated artifact staled.** `bio-plane/dist/bio-plane.bundled.mjs` (the plane's source changed); regenerated at the layer close.
4. **R17's text** lists C-98.1–C-98.10; with J1 (6) accepted it gains C-98.11 (wording yours).

## J3 · COMPLETE

T33-65 complete on `job/T33/public-read`, re-pointed at the merged case-grammar (K1636) and publication (K1643). docket brings nothing new to this entry (R20, R21, R25 unchanged; `docket-real.test.mjs` already reads the real module); merge after docket as B4 says.

**Entries applied (J1 readings, accepted K1632):**
- R26: `publishedCase.calculations`, from `case-grammar.calculationsOf`: each output a computed fact, a share's numerator and denominator beside it (none stated: `denominator: null` with its sentence), method version, recompute status, the publisher's disclosure beside a differing or unbound one; nothing recomputed; `[]` without the block.
- R27: `publishedCase.timeline` from `case-grammar.timelineOf`: lanes apart, items placed nowhere listed apart (`placed_nowhere`), `when` and `source` as signed.
- R23: the case file carries each calculation (`calculationFileText`) at `caseFilePath("calculation", calc)`, each held input at `caseFilePath("calculation", [calc, sha])`, and `calculations/prov.jsonld` (`provOf`) once; an input not held at its hash is named in `unheld`. The end-to-end manifest passes `caseFileManifestCheck`. No `calculations` edge (uses unchanged).
- R28: `court_orders` and `withheld` on `publishedCase`, from `publication.stampsOf`. `remove`/`seal` withhold, `unseal` ends a seal only, and `redact` withholds nothing. Withholding is by hash wherever the bytes would be served: the document and everything read from it, finding bodies (Worker), files, manifest, a successor's quoted statement, and the rows of `publishedmanifest`, `publishedlist` and `publishededitions`. `op=publishedbytes` answers C-98.11 `WITHHELD_BY_COURT_ORDER` (451), a zip carrying a withheld file likewise. New internal store op `withheld`. Each order is linked to its docket entry `{seq, id: <case>#<seq>, digest: null (publication's stamp records only the seq), docket: op=docketpublic&case=}`.
- Improvement in my module: `publishedCase.files` now lists a case file's `manifest.files` (it listed `manifest.parts`, the part digests, for a `/6` case file).

**Deferred:** none.

**Found in other modules (also J2):**
- Generated artifact `bio-plane/dist/bio-plane.bundled.mjs` is staled.
- C-98.11 joins row-census's rows awaiting stamp.
- Wording only: R17's list should name C-98.11; R16 and Uses should name `publication.stampsOf` (R62), which R28 reads. My R16 test now allows it.
- Efficiency: R28's index calls `stampsOf` once per published case edition on each public read (it opens only stamped editions). A set-wide `stampedEditions()` read in publication would make that one query; fine at today's volumes.

**Tests and checks:**
- `node --test bio-plane/test/m/public-read/`: tests 123, pass 123, fail 0.
- Dependent suites (case-checker spec, control-plane, filings, network-notices, op-declarations, plane, publication, ratification, review, docket, mk6, row-census): pass 805, fail 11. These are the same 11 as on `tranche/T33` @ f3c5790+, all named reds: families, control-plane R26/R43, filings R9/R30, plane R2/R5, docket R15 order, case-checker R14 spec, row-census.
- `checks/format.mjs`: 126 modules, 0 failures. `checks/architecture.mjs . public-read`: 0 failures. `checks/coverage.mjs . public-read`: 28 of 28. `checks/ownership.mjs . public-read tranche/T33`: 0 failures.

Size (session_01FpBN8hkUyqmxvtFg3izFyL): test runs 16, module lines 3277
