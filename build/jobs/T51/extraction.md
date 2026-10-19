# extraction (T51)

**Status** · session_01AMS17zW7T6NQQhJwzerr6u · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Findings in other modules (not mine; for their jobs or BOB):
- `observation-log` `bio-plane/src/observation-log/index.mjs:313` [plain] "document is text and no extraction step stands between them"
- `observation-log` `bio-plane/src/observation-log/vocabulary.mjs:1367` [plain] "the archive fallback became eligible: three failures or fourteen da..."
- The whole `checks/run.mjs` run reports 3905 words failures across the repository. None is in extraction or extractrun.

For BOB (a wording decision, not taken by me):
- The two sentences I localized that say "your team's Civicsmith" keep "team" exactly as they read. K3803 (3) says "group" for "team" in every text a person reads; `words.test.mjs` (DEC-149) asserts "group's Civicsmith" is never in a refusal translation. I left the wording unchanged. Please rule: keep "team" (the DEC-149 form) or change it to "group" through the design stream.

Rows the design stream may want (setup-words `--check` reports rows.mjs stale on these; expected, BOB regenerates at the layer close):
- extraction.index.no_text_provenance_recorded
- extraction.index.no_evidence_store_set_up
- extraction.index.reread_candidates_frontier
- extraction.extractrun.undetermined_ceiling
- extraction.extractrun.position_unreadable

## J2 · COMPLETE

T51-189 (extraction, words) is done. Commits: 6015179aee (the change), cf6e6249a9 (merge of tranche/T51).

Entries applied:
- Part 1, the two test copies: `t44.test.mjs:145` and `t48.test.mjs:112` read the key `ai.refused.projectkeptaway` through WORD, not the sentence. `t44`'s "placeholders kept" assertion now compares with WORD("transcribe.refused") filled with the relayed translation, not a regex on the old sentence.
- Part 2, the seven plain findings: `index.mjs` 982, 1280 and 1485 are `localize` (ids `extraction.index.*`); `extractrun.mjs` 312 and 430 are `word` on rows the list already holds (`extractrun.why.earned_nothing_proposal`, `extractrun.says.machine_credential_marked`); `extractrun.mjs` 351 and 363 are `localize` (ids `extraction.extractrun.*`). Every one is member-readable, so none is listed as unkeyed.
- Bundler R38, `words.mjs`: `WORD_ROWS` is no longer imported; each key has its own literal `word()` call in one table; `say(key)` looks the key up there, so no `word()` call takes a variable key. `rawWords` is replaced by a literal `TRANSCRIBE_WORDS` in `checks.mjs`, its placeholders left as written.
- Also, not in the findings: `words-reads.json` declares nine `extractrun.*` keys for extraction, which the module did not list. The words test was red before this job; `WORD_KEYS` now declares them and it passes.
- A consequence of my own localize: `n26.test.mjs:208` copied the new sentence; it now asserts the fragment "evidence store set up".

Deferred: none.

Other modules (for their jobs or BOB): in REPORT J1.
Decision for BOB: "team" vs "group" in the converted sentences, in REPORT J1.

Tests and checks (the last run after the merge):
- `node --test bio-plane/test/m/extraction/`: 184 tests, 184 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio extraction`: 0 failures.
- `checks/coverage.mjs /home/user/bio extraction`: 52 of 52 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio extraction tranche/T51 job/T51/extraction`: 0 failures (8 files changed by extraction, all inside its paths).
- `checks/run.mjs /home/user/bio`: no finding in extraction or extractrun. The repository's total is 3905 words failures (not mine).
- `setup-words/build.mjs --check`: exit 1, a stale-rows note that names six new localize ids (listed in REPORT J1). It is the expected note, not a refusal; BOB regenerates rows.mjs at the layer close.

Size (session_01AMS17zW7T6NQQhJwzerr6u): test runs 6, module lines 3303 (`wc -l` over `bio-plane/src/extractrun.mjs` and `bio-plane/src/extraction/*.mjs`).

Note on the commit message: it names the session link but not a model identifier, which the system prompt forbids in commit messages.

## J3 · COMPLETE

Answer to B3 (K3988), and the COMPLETE again.

- (1) "team" stays: no change.
- (2) `n26.test.mjs:208` compares its reason with the product's `localize` call by equality (the id `extraction.index.no_evidence_store_set_up` with its en), no substring copy. Commit on job/T51/extraction.
- (3) Code-written ids need no row: noted.
- Merged `tranche/T51` into the job branch (4 files, no changes to extraction files other than this test).

Tests and checks after the merge:
- `node --test bio-plane/test/m/extraction/`: 184 tests, 184 pass, 0 fail.
- `checks/run.mjs /home/user/bio`: no finding in extraction or extractrun.
- `checks/format.mjs`, `architecture.mjs` and `coverage.mjs` for extraction: exit 0. `ownership.mjs` for extraction: 0 failures.
- `setup-words/build.mjs --check`: exit 1 with only the stale-rows note for the six new localize ids (expected; BOB regenerates at the layer close).

Size (session_01AMS17zW7T6NQQhJwzerr6u): test runs 8, module lines 3303.
