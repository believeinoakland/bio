# extraction (T50)

**Status** · session_013sZYarANSXJ3Zy6EV93zJZ · depth 2 · WORKING · handled B1

## Completion (T50-9)

**Entries applied.**
- N1082 (R72, R71): `pageTranscribe` takes `trace` and `memberRef`; `transcription({member, project, at})` receives each only when it is a non-empty string (a call with none passes neither key). `pageTranscribeOp` forwards them from the control plane's stamps (beside `author`, query keys `trace`, `memberRef`) and never from the caller's url or a body; `extractionOps.pagetranscribe` reads them from that query. Nothing stores or answers either string. Tested at the registered-transcriber stub, through both `pageTranscribe` and `pageTranscribeOp` (t50.test.mjs).
- N1066: `t43` and `t44` pin the exact status (403 for a refusal stating none); the key-leak check runs on 14 paths (filled, none to fill, AI filled nothing, declined, silent, four malformed `transcribe` answers, account, limit, keep-away, worker refusal after the post, not deployed); `t43`'s `deployable` stub gains its false arm, and t50 has `deployable` answering anything but `true` (false, undefined, null, 0, 1, "true", {}, a throw) refused 501.
- Flaw fixed in my module (P8): the keep-away refusal was always answered 403; R71 says a relayed refusal keeps its own whole-number 400–499 status, so it now answers `refusalStatus(away)` like the other three ways (a keep-away refusal carrying 429 answers 429).
- Plan rule 6 / Text: fold: new `bio-plane/src/extraction/words.mjs` (the 43 keys of `words-reads.json` for `extraction`); `checks.mjs` rows (C-51.1–C-51.5, C-51.6 `NO_SHA`, C-51.7) and `TRANSCRIBE_WORDS` (now `rawWords`, read from setup-words' list) and the sentences in `index.mjs` and `filemembership.mjs` that the list keys are read through `setup-words`' `word`. `words.test.mjs` checks the key list equals the owner's declaration. This turns the four inherited reds in this module's tests (the "group"/"team" words of t43, t44, t46, pagetranscribe) green.

**Deferred / reported to BOB (sentences no key holds; not invented by this job).** Still inline English in the module, in no `reads` or `unkeyed` entry of `words-reads.json`: `reextraction.candidates` ("…what your group's Civicsmith can read; this one is re-read now"), `reextraction.cost` is `unkeyed`; `text_provenance.why` ("this reading carries no text provenance…") and `reading_history`'s undetermined-provenance `why` in `readingFor`; `calibrationDrift`'s `why` when obligations exist and `drift.mjs`'s per-obligation `why`; `migrated.n26.why`, `migrated.n439.why`; `pageTranscribe`'s and `pdfStructure`'s refusal `detail`s are `unkeyed` by DEC-258 (3). Three of these say "group": the `candidates` sentence is drawn on a screen. The requirements' R75 still describes `transcribe.reason.requestfault` as an interim word "until the design stream conforms the key (K2919)": words.json now holds the conformed key and this job reads it, so that clause can be retired.

**Found in another module.** None.

**Tests.** `node --test bio-plane/test/m/extraction/`: 184 tests, 184 pass, 0 fail (was 173, 169 pass, 4 fail at START: the four were the "group"/"team" words). Dependent suites (plane, control-plane, op-declarations, entities, progressions, content, retrieval, connections, observation-log, acquisition, standards, case-carriage): 1,780 tests, 14 fail, the same 14 at START (op-declarations registry and acquisition reds named in the plan's rule 5; none this module's).
**Checks** (`/home/user/civicos-process`, product `/home/user/bio`): format 171 modules, 0 failures; architecture 34 product files, 0 failures; coverage 52 of 52 live requirement ids named by a test, 0 failures.

Size (session_013sZYarANSXJ3Zy6EV93zJZ): test runs 12, module lines 3325
