# record-grammar (T48)

**Status** · session_01P1VBJ85hjxVdZM5G9HKPT5 · depth 2 · WORKING · handled B0

## Completion (RECORD-GRAMMAR #17)

**Reading set** (mechanics §17): 353 KB at START, under 600 KB. I read all of these myself: `build/requirements/record-grammar.md`; layer 1's row and contract in `build/layers.md` (with its general rules and the record-grammar helper entry); the plan's entry T48-1, the L1 merge order and its rules at the opening (rule 5 as at my START); every file of `bio-plane/src/record-grammar/` (all 15) and every file of `bio-plane/test/m/record-grammar/` (all 10 test files and `fixtures/bundles.mjs`; `fixtures/expected.json`'s data excepted, K2053). For R63 I also read the form `case-inputs` mints: `mintOpaqueId(CARRIED_OUTCOME_PREFIX = "OUTC", year, "", …)` (src/case-inputs/index.mjs:79, :253) and record-core R6 (four random digits). There are no Uses (record-grammar is first in the order). For N994, RECORD-GRAMMAR #16's record (T47, Deferred) names the two stale comments.

**Entries applied** (T48-1).
- R63 (N1017, K3112; `ids.mjs`): `ID_TABLE` gains `OUTC` (owner `case-inputs`, form `sequential`), appended last after `SUC`, following the convention of one row per tranche at the end. Its comment says the row is drawn at random by record-core's R6, as `WCD` is. `case-inputs` mints `OUTC-<year>-DDDD`, which this form reads, so every id already minted stays valid. The `WCD` row's owner is now `case-inputs` (form and place unchanged). No other row changes. `OUTC` gets no `OBJECT_TYPES`, `HEADINGS`, `STATES` or `checkBundle` entry and is not one of R1's prefixes.
- N994 (K3034; no requirement change): two stale comments corrected. In `ids.mjs`, the SUC row comment no longer says "no `checkBundle` schema"; it now says that since T47 (R62) `checkBundle` admits its document under `success_record@1`. In `document.mjs`, the `success_record` machine comment no longer says "`checkBundle`'s schemas gain nothing"; it now says that `HEADINGS` gains nothing and that since T47 `checkBundle` admits the document and judges its state by this machine.

**Own flaws fixed** (P8; all comment or whitespace, no behaviour change):
- `types.mjs`: the T33 comment said "`checkBundle` admits only the bundle prefixes' types". It now says "… and `SUC`'s, below", which agrees with the T47 note under it.
- `labels.mjs`: `PROPOSAL_STATES`' header comment had a sentence broken across three lines mid-phrase. It is rejoined.
- `bundle.mjs`: `checkStateLegality`'s `readable` line was indented one level too deep. It is re-indented.

None of these is an input to a bundle that the R63 change did not already stale (`ids.mjs` stales agent-worker's bundle; `ids.mjs`, `types.mjs`, `document.mjs` and `bundle.mjs` are all inputs to newgroup's bundle). Nothing deferred.

**Tests** (`ids-types.test.mjs`).
- Re-pinned: R46's whole-table pin (`WCD` owner `case-inputs`, `OUTC` last; title and header say so), and R46's sequential set now includes `OUTC`. The R59 test pinned `SUC` as `ID_TABLE.at(-1)`, which R59 does not require; it now pins `SUC` directly after `ACD`.
- New, R63 (K874), with its controls:
  - The `OUTC` row exactly, once, last.
  - `idPattern('OUTC')` matches the ids `case-inputs` mints (`OUTC-<year>-DDDD`, 0000–9999), the 10,000th and later.
  - It refuses the same core under every other `ID_TABLE` prefix and under near spellings, plus a short counter, an opaque tail, a slug, a short year and padding.
  - `OUTC` is no bundle or annotation id and has no type, headings or machine.
- New, R63 (`WCD` owner):
  - The `WCD` row is `case-inputs`/sequential, once, in its place between `CASE` and `DRAFT`, and the old owner is gone (control: `case-authoring` still owns `CASE`).
  - `WCD` ids stay valid.
  - Compared with the table as T47 held it, the only row that changed is `WCD`.
- Control run: with the old `ids.mjs` (stashed), both R63 tests and the R46 pin fail (4 fail); with the change, all pass.

**Ran.**
- `node --test bio-plane/test/m/record-grammar/`: tests 101, pass 101, fail 0. The manifest names no layer tests.
- Users' suites: the `tests` of the 18 modules that read `ID_TABLE`/`idPattern`, or whose generated artifact bundles a changed file. They are record-core, inquiry-grammar, bias, connection-grammar, connections, hypotheses, calculations, signatures, consequences, observation-log, case-account, case-inputs, case-authoring, leg-earning, case-checker, agent-worker, bundler and installer. I ran them on the tranche base (cfa23da0db) and on my change. Results:
  - Identical on both trees: record-core `stats-disclosure.test.mjs` and agent-worker's 4 files fail on both (base reds; not mine).
  - Mine, 3 generated artifacts, each another module's (mechanics §14, not written by me):
    - case-checker `program.test.mjs` R13 (`program.mjs`; rule 5.5).
    - bundler `fleetbundles.test.mjs`: **agent-worker's bundle** is stale, because `ids.mjs` is its input (this is the change that #16 avoided by deferring N994). It is not named in rule 5.5. Regenerate with `node bio-plane/scripts/bundles.mjs`.
    - installer `newgroup-bundle-fresh.test.mjs`: **newgroup's bundle** is stale (its inputs are `bundle.mjs` and its imports). It is not named in rule 5.5. Regenerate with `cd newgroup && npm run build`.
    - The plane bundle is staled too (rule 5.5).
- Checks (process repository):
  - `format`: 168 modules, 0 failures.
  - `architecture record-grammar`: 27 files, 0 failures.
  - `coverage record-grammar`: 61 of 61, 0 failures.
  - `ownership record-grammar tranche/T48`: 7 files, 0 failures.
  - `checks/run.mjs`: format 0 failures; architecture 0 failures; channels 0 failures. Coverage has 6 failures, all other L1 modules' T48 ids (bundler R32, court-citations R11, file-scanner R32, jurisdictions R89–R92, ooxml R34, signatures R45 R48), accepted by rule 5.1.

**Found in other modules.**
- Generated artifacts staled (listed above): agent-worker's bundle and newgroup's bundle (neither in rule 5.5), plus the plane bundle and case-checker's `program.mjs` (5.5).
- No module's code needs a change for R63. Every reader takes the row from `ID_TABLE`: record-core's `OPAQUE_PREFIXES` is unchanged, since `OUTC` is sequential, and no reader keys on a row's `owner`.

Size (session_01P1VBJ85hjxVdZM5G9HKPT5): test runs 4, module lines 2618
