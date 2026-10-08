# instance-setup (T39)

**Status** · session_01LAKZqntsHmW1zsfg2HmycE · depth 2 · COMPLETE · handled B2


## Completion (T39-16b)

**Entries applied.** T39-16b (N807; K2375; B2): `bio-plane/src/setup-words.mjs` deleted (its rows equal `setup-words/index.mjs`'s `WORD_ROWS` value for value, and its commit, checked before deleting); `setup.mjs`:40–41 imports `WORD_ROWS`, `WORDS_COMMIT` from `./setup-words/index.mjs`, the R68 comments re-worded (holds no copy); `test/m/instance-setup/interface-words.test.mjs` reduced to R68's share (`INTERFACE_WORDS` is `WORD_ROWS` in order as frozen `{key, en, note, means, protected}`, keys in that order, the list frozen, writes throw, `INTERFACE_WORDS_COMMIT === WORDS_COMMIT`). The word-by-word check against words.json is setup-words' own test now. The draft's optional source-text test is not written (JOB step 5: interface only). R68's "holds no copy" is now met.

**Old path gone.** `bio-plane/src/setup-words.mjs` no longer exists; no product file or test names it. For BOB at the merge: drop it from instance-setup's `paths`, add `setup-words` to its `uses` (format and architecture fail until then, below).

**Deferred.** None.

**Other modules.** The plane bundle (`bio-plane/dist/bio-plane.bundle.json`:2545, `bio-plane.bundled.mjs`) still names `src/setup-words.mjs`: stale, regenerated at L11's close (rule 3 (7)); not written here (mechanics §14). `translations.test.mjs` and `store-door/routes.test.mjs` read `INTERFACE_WORDS` as fixtures only; unchanged, green.

**Tests.** `node --test test/m/instance-setup/ test/m/store-door/routes.test.mjs test/m/setup-words/`: tests 143, pass 143, fail 0. (Baseline before the change, instance-setup alone: 130 pass, 0 fail.)

**Checks.** format: 139 modules, 1 failure (`modules.json` instance-setup paths names `bio-plane/src/setup-words.mjs`: BOB's edit at the merge). architecture: 2 failures (`setup.mjs` and `interface-words.test.mjs` import setup-words, not yet in uses: BOB's edit at the merge). coverage: 57 of 57 live ids named, 0 failures. ownership: 4 files changed between tranche/T39 and HEAD, 0 failures.

Size (session_01LAKZqntsHmW1zsfg2HmycE): test runs 2, module lines 3299

## J1 · REPORT

B1 read and acted on. Reading set read (requirements whole, K2337/K2343/K2375, draft §2–§4, setup-words' requirements, layer 11's row, setup.mjs's word-list sites, interface-words.test.mjs, the INTERFACE_WORDS sites in translations.test.mjs and store-door/routes.test.mjs); well under 300 KB. Baseline: node --test test/m/instance-setup/ 130 pass, 0 fail. Prepared, not committed: interface-words.test.mjs reduced to R68's share (INTERFACE_WORDS = WORD_ROWS mapped to frozen {key, en, note, means, protected} in order; commit equal; writes throw), no source-text test (JOB rule 5), and the setup.mjs:40–41 re-point with its comment. No question. Waiting on your CHANGE that setup-words has merged.

## J2 · COMPLETE

B2 applied (record, Completion T39-16b). bio-plane/src/setup-words.mjs is deleted, confirmed gone (no product file or test names it); setup.mjs imports ./setup-words/index.mjs; interface-words.test.mjs reduced to R68's share. Tests: instance-setup + store-door routes + setup-words 143 pass, 0 fail. Checks: coverage 57/57, ownership 0; format 1 and architecture 2 failures are exactly your merge edits (drop the old path from instance-setup's paths, add setup-words to its uses). Stale generated artifact for the layer's close: the plane bundle still names src/setup-words.mjs.
