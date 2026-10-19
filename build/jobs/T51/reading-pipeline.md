# reading-pipeline (T51)

**Status** · session_01GJErmRTWWrhmqcKEnHY1X6 · depth 2 · WAITING ON BOB (J2) · handled B1

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

## J2 · BLOCKED

BLOCKED, cause: reading (K3678).

Job T51-190 (words pass, 11 findings + 10 plain + 4 test copies). I have made no change to any file.

Why I stopped: step 2 requires reading the module's code whole, and the words fixes touch
- bio-plane/src/reading-pipeline/index.mjs (1,435 lines), of which I have read only the regions around the findings (about 300 lines);
- bio-plane/src/reading-pipeline/readingprov.mjs (260 lines), of which I have read only lines 165-256;
- the finding-holding tests origin.test.mjs, convert-tiers.test.mjs, read.test.mjs (586 lines), text-units.test.mjs (435 lines), and dec149.test.mjs (its NO_STORE copy changes with the key below).
Reading those whole is about 80k tokens in this session, past the half-window point (mechanics §6.1), so I cannot finish the reads in this window either. I am not editing from partial reads.

What the fixes need from BOB, decided before I start:
1. reading-pipeline.no_evidence_store already holds a row ("Your team's Civicsmith has no evidence store set up, so the capture's bytes cannot be read." - capital Y, final period). The source sentence is lowercase with no period. Plan: use word("reading-pipeline.no_evidence_store"), which changes the member-facing casing and adds a period. OK to change the wording this way? (Alternative: a new localize id with the current text, leaving the reserved key unused.)
2. Fragments with no row (the "reported characters" count, "no reference carries where it was read: this document was read as one undivided string", and the test copies of the `origin` register sentences): plan to add localize('reading-pipeline.index.<slug>', en) at the site, with no test copying the text. OK?
3. Every other finding maps to an existing row (for example why.ocr_member_name, why.ocr_member_reported, why.ocr_member_returned, reader_parse_text, read_reader_tier, reader_found_entities, text_layer_read, document_text_layer, already_text_kept, text_read_back, text_carries_per, says.read_classified_different, says.read_classified_different_text, reader_say). Plan: word() at each site; no rows.mjs edit.

Next step on your word (or on reading the whole files if you prefer I continue in a fresh window): I will read index.mjs, readingprov.mjs and the five test files whole, make the edits, and run the module's tests and checks.

Session: session_01GJErmRTWWrhmqcKEnHY1X6. Branch: job/T51/reading-pipeline at its origin head.
