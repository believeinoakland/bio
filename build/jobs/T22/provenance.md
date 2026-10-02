# provenance (T22)

**Status** · session_01HXBQRNxoQMo9TDAz7Fou7D · depth 2 · COMPLETE · handled B1

PROVENANCE #11, T22 layer 3. Entries from BOB's B1 START (`build/plan/current.md` L3 provenance). Comments only; no behaviour changed; no line added (module 3,938 lines before and after).

## Completion

**Applied**
- **N471.** `src/provenance/checks.mjs`:234–235, C-53's mint note in the past tense, in `inquiry-grammar/checks.mjs`' form: "minted with the old process's `node tools/mintid.mjs C` (retired in T19)".
- **N480** (G1). `src/provenance/schema.mjs`:141–142: the route act is "a WRITE (op-declarations declares provenanceroute mutating:true)", no longer "registered … in index.mjs". Left as BOB named: `index.mjs`:9, `ops.mjs`:2 (extraction provenance), `register-checks.mjs`:11 (my own `index.mjs`).
- **Re-scan** (my paths and the three new suites, for N480's kind and N469's), each re-worded without a line added:
  - `index.mjs`: the route vocabulary "taken LIVE from `airun.mjs`" (deleted in T19) now names observation-log's `OBSERVATION_STATES`; R52's `testimonySlot` doc and `testify`'s slot note said the slot runs where "the legacy store's promotion step runs that work today" (store.mjs deleted in T19): now control-plane's promotion step (its R42), where that step ran it; two notes naming the legacy store's `auditPass` as the reader sharing the `MAX(seq)` clause and the page-range shape now name `routeTally` (record-core's `auditPass` no longer reads the marks).
  - `schema.mjs`:105: "taken from airun.mjs's OBSERVATION_STATES" -> observation-log's (airun.mjs's then).
  - `test/mk6-bundle-names-no-author.test.mjs`: the plane is booted from `src/plane/index.mjs` (`src/index.mjs` deleted in T21); ratify's `_history/` skip is in `src/ratification/ops.mjs`; `mk7-attribution.test.mjs` (deleted in T17) put in the past, pointing at `test/m/publication/attribution.test.mjs`. The dated NEGATIVE CONTROL record and the "kept for the record" paragraph stay (provenance notes).
  - `test/m/provenance/testimony-slot.test.mjs` header and `slotted`'s note; `test/m/provenance/fixture.mjs` `world`'s note (the producing group is instance-setup's fact since K69).
  - Kept as provenance notes: every "deleted at T20" note already in the past tense, "Extracted from" / "converted from" headers, `publishingproject.mjs`:19.

**Deferred.** The stand-in module name `"legacy-store"` in my test fixtures (`fixture.mjs` `registerFact`, `testimony-slot.test.mjs` `registerStep`) is a label for a stand-in, not a claim; renaming it is a code change this comments-only job does not make. Their comments now say it is a stand-in.

**Found in other modules / BOB's files.** Generated artifact made stale: the plane's bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`), inputs under `src/provenance/` changed; not regenerated (mechanics §14). Requirement wording in `build/requirements/provenance.md` (BOB's), no meaning changed: R52 says the slot runs "at the place `legacy-store`'s step runs it today" and "While `legacy-store`'s step exists"; it has been control-plane's promotion step (its R42, `src/control-plane/step.mjs`, registered by plane R10) since T19. Suggestions' "Testify's later work" ("Until T19's layers 4–5, `legacy-store`'s promotion step …") is history; R53's and R55's last sentences ("`legacy-store`'s own job …") are history; the Status line's "Code today: inside the legacy modules" is history. Both in REPORT J1.

**Tests and checks**
- `node --test bio-plane/test/m/provenance/`: 113 pass, 0 fail.
- `node --test bio-plane/test/mk6-bundle-names-no-author.test.mjs`: 10 pass, 0 fail (1/1 file).
- Whole `bio-plane/test/m`: 4815 tests, 4795 pass, 0 fail, 20 todo. No red, so no new red.
- `checks/format.mjs`: 85 modules, 84 requirements files, 0 failures. `checks/architecture.mjs bio provenance`: 23 files, 0 failures. `checks/coverage.mjs bio provenance`: 55 of 55 live ids named, 0 failures. `checks/ownership.mjs bio provenance tranche/T22`: 7 files, 0 failures.

Size (session_01HXBQRNxoQMo9TDAz7Fou7D): test runs 3, module lines 3938

## J1 · REPORT

Generated artifact made stale by this job: the plane's bundle, bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (comments changed in src/provenance/checks.mjs, index.mjs, schema.mjs). Not regenerated (mechanics §14). Also requirement wording in build/requirements/provenance.md (BOB's file), no meaning changed, seen in the re-scan: R52 says the testimony slot runs 'at the place legacy-store's step runs it today' and 'While legacy-store's step exists'; since T19 it is control-plane's promotion step (its R42, src/control-plane/step.mjs, registered by plane R10). The Suggestions' 'Testify's later work' (Until T19's layers 4-5, legacy-store's promotion step ...), the last sentences of R53 and R55 (legacy-store's own job ...) and the Status line's 'Code today: inside the legacy modules' are history.
