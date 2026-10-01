# strength (T21)

**Status** · session_016S9APVD77hDCq9MtoPtEwc · depth 2 · COMPLETE · handled B1

STRENGTH #7, T21 layer 6. Worked on `job/T21/strength` as BOB created it from `tranche/T21`; no merge was needed (BOB changed no file I read).

## Entries applied

- **N458 (B1 (1)): "record" for "bundle" in text members read.** Re-scanned my paths first. Two refusal `detail`s held the word: `inquiryStrength`'s `NO_ID` ("pass id=<bundle id>" → "pass id=<record id>"; the argument `id` stays) and, found by the re-scan, `NOT_AN_INQUIRY`'s fallback type word (`${ty ?? "bundle"}` → `"record"`). Every other "bundle" in my paths is an interface name N71 keeps (`bundle_id`, `bundleId`, `bundle.md`, `NO_SUCH_BUNDLE`, SQL, the independence origin token `bundle:<id>` in `shared[].through`) or a code comment. No test pinned the old words; `reads.test.mjs` R6 now pins `<record id>` and that neither refusal detail says "bundle".
- **N469 (B1 (2)): notes naming a deleted file as live.** `checks.mjs`:31 named `test/strengthpair.control.mjs` as what drives C-30.7 and C-30.8: re-pointed to `test/m/strength/version.test.mjs` (R10, R24), which arms both through `refusePairComposed`. `schema.mjs`:20 named `hygiene.test.mjs` as carrying the bar's purge exemption: re-pointed to `test/m/strength/cache.test.mjs` (R23), which proves it (a bundle purge and a whole-store purge leave `group_strength_bar`). The re-scan found one more live note: `checks.mjs`:152 gave `node tools/mintid.mjs C` as how C-71 "is minted"; `tools/` is retired, so it now reads as provenance ("was minted … by the old process's id tool, since retired"). The test headers `cache.test.mjs`:3 ("convert share of"), `converts.test.mjs`:1–4, `version.test.mjs`:285 and `vocabulary.test.mjs`:5 ("Carries") are provenance and stay. No requirement carries a `not yet met: T21` mark.
- **Improvement in my own module:** `versionStrength`'s `VERSION_STRENGTH_NO_VERSION` detail told the caller to pass `project=<PRJ-…>`, a prefix no id has (record-grammar R1: `PROJ`); it now says `<PROJ-…>`.

## Deferred

None.

## Found in other modules (REPORT J1)

1. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`) carry strength's old sentences; regenerate at the layer close (manifest, "Generated artifacts").
2. **The retired id tool named as live elsewhere:** `node tools/mintid.mjs` (deleted with `tools/`) is named in notes in `inquiry-grammar/checks.mjs`, `content/checks.mjs`, `connections/checks.mjs`, `ratification/checks.mjs`, `run-rules/checks.mjs`, `basis-versions/checks.mjs`, `observation-log/checks.mjs`, `provenance/checks.mjs`, `src/queuestate.mjs` and `src/textchain.mjs` (paths under `bio-plane/src/`). Not a T20-deleted file, so outside N469's list; worth the same re-wording where a note reads as an instruction (layers.md rule 6's provenance kind otherwise).
3. **Red in modules that use strength, not caused by this job** (the same counts on `origin/tranche/T21` without my commit): `filings` 13 pass / 35 fail (L9's filing-templates folds not yet made); `control-plane` 92 / 1 (`catalogue-end.test.mjs`: C-53.13's translation, provenance's N458 change, `awaiting stamp` for T22).

## Tests and checks

- `node --test test/m/strength/` (in `bio-plane/`): **69 pass, 0 fail** (69 before; R6's test gained three assertions). `build/manifest.md` names no layer tests.
- No provided service changed; as a precaution, every module whose `uses` names strength: run-productions 39/0, skills 39/0, reevaluation 76/0, ratification 181/0, case-authoring 80/0, review 33/0, conformance 54/0, consequences 30/0, action-plans 43/0, plane 28/0; filings 13/35 and control-plane 92/1, both identical on the base (above).
- `format`: 86 modules, 84 requirements files, 0 failures. `architecture strength`: 13 product files, 45 relative imports, 0 failures. `coverage strength`: 28 of 28 live ids named by a test, 0 failures. `ownership strength tranche/T21` (after commit): 5 files changed, 0 failures.

Size (session_016S9APVD77hDCq9MtoPtEwc): test runs 17, module lines 1553

## J1 · REPORT

Found in other modules (record, 'Found in other modules'): (1) stale generated artifact: bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (not_product) carry strength's old sentences; regenerate at the layer close. (2) 'node tools/mintid.mjs' (tools/ retired) is named as live in notes in bio-plane/src/{inquiry-grammar,content,connections,ratification,run-rules,basis-versions,observation-log,provenance}/checks.mjs, src/queuestate.mjs and src/textchain.mjs; outside N469's list, the same re-wording would suit. (3) Red in modules that use strength, identical on origin/tranche/T21 without my commit, so not this job's: filings 13/35 (L9 folds not yet made), control-plane 92/1 (catalogue-end.test.mjs, C-53.13's translation from provenance's N458, awaiting stamp T22).
