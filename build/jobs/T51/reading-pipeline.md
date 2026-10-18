# reading-pipeline (T51)

**Status** · session_01UF9sUjrAaCC7RhZToJezwo · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

COMPLETE: T51-133 (reading-pipeline, K3820's red).

**The red does not reproduce.** On this job branch (its start, `d6b3ec9a9a`) every test under reading-pipeline's `tests` paths passes: `test/m/reading-pipeline/*` and `test/m/extraction/read.test.mjs` 140 of 140 before my edits, 137 of 137 after (the set without the three files of d606, tier2-wire and the system test, which I ran separately and which pass: d606 and pdf-worker-binding 12/12, tier2-wire 46/46, the tier-pagewise probe exits 0). No test of mine reads a file under `docs/`: the only design-file readers in the module's paths are none; the `word` import in `transcribe.test.mjs` reads the regenerated `setup-words/rows.mjs`, which the design merge did not change. `tranche/T51` (`0ca61ae1b2`) differs from this branch only outside this module (content, the records), so the red is not on the tranche either. I could not find which test K3820 saw red; it may have been cleared by the team pass (`d29bbd1848`) that this branch already holds. BOB, please confirm against your run if you saw it on a different branch.

**Entry applied (K3810's rule, met while working):** the tests that copied the tier-2 and no-OCR sentences now read them from the word table by key, with the module source unchanged (the rows hold the same text):
- `read.test.mjs`: the three tier-2 failure notes read `reading-pipeline.tier_read_essentially`, `_nothing` and `_nothing_document`; the unbound-tier-2 basis reads `tier_read_essentially`.
- `convert-chain.test.mjs`: the tier-2 note reads `tier_read_essentially`.
- `picture.test.mjs` and `dec149.test.mjs`: the whole-sentence constants `NO_OCR` (`document_text_layer`) and `NO_TIER2` (`tier_read_essentially`) are read by key.

**Deferred, and why:** sentences the module says that have no key in the word table yet are still literals in tests and in source: the no-evidence-store refusal (`your team's Civicsmith has no evidence store set up, so the capture's bytes cannot be read`, in `dec149.test.mjs` and `src/reading-pipeline/index.mjs`), and the fragment assertions on `no OCR engine is installed` (`convert-ocr`, `pieces`, `read.test.mjs` line 183) and `no pdf-worker member is set up` (`staffdirectory.test.mjs`) that have no whole-sentence key to read. These need keys from the design lane; I did not change the source to add them.

**Found in another module:** none.

**Tests and checks run (job branch, summary lines):**
- `node --test test/m/reading-pipeline/*.test.mjs test/m/extraction/read.test.mjs`: `tests 137, pass 137, fail 0`.
- Earlier run of the same set plus d606, tier2-wire, pdf-worker-binding: exit 0, `tier2-wire: 46 pass, 0 fail`, `pdf-worker-binding: 12 passed, 0 failed`.
- `node checks/format.mjs /home/user/bio`: `174 modules, 172 requirements files; 0 failures`.
- `node checks/architecture.mjs /home/user/bio reading-pipeline`: `28 product files, 98 relative imports ... 0 failures`.
- `node checks/coverage.mjs /home/user/bio reading-pipeline`: `1 modules, 34 of 34 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs /home/user/bio reading-pipeline tranche/T51 job/T51/reading-pipeline`: `0 failures`.
- `node checks/run.mjs /home/user/bio` (before the edits): architecture and format 0 failures; coverage's 13 failures are in other modules (agent-harness, agent-runner, agent-steps, agent-worker, basis-versions, case-grammar, entities, explore, journey-check, people, progressions, retrieval-browse, retrieval), none reading-pipeline.

**Choices I made:**
- Commit message: no model identifier, as the system prompt asks; the attribution reminder asked for a Co-Authored-By line naming the model, which I left out for that reason. Say if you want it added.

Size (session_01UF9sUjrAaCC7RhZToJezwo): test runs 3, module lines 1795
