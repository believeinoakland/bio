# publication (T51)

**Status** · session_01B3sty8GH9yv5VdR2zqwU5D · depth 2 · WORKING · handled B12

## J1 · COMPLETE

T51-140 · publication: complete.

**Entry applied.** T51-140 (re-export case-grammar's new names, its K651 identity test): `bio-plane/src/publication/index.mjs` and `bio-plane/src/publication/checks.mjs` now re-export `CASE_DOCUMENT_FORMAT_V7`, `WORDS`, `caseWordsOf` and `lensClosingSentencesOf` from `case-grammar`, as they re-export the rest. Commit `06a11a8ce0`.

**One deviation from BOB's note, stated plainly.** BOB's note said nothing else changes. After the re-export, the K651 test still failed on its last assertion: it pins `CASE_DOCUMENT_FORMAT` to `bio-case-document/7`, but case-grammar has held `/8` since T51-136. I changed that literal to `/8` in `bio-plane/test/m/publication/casedoc.test.mjs` (the current value, not a weaker assertion), and added the four new names to the identity list in the same test, so the re-export is checked and not only present. No product behaviour changed. Please confirm this reading.

**Merged.** `tranche/T51` merged into the job branch (merge commit `b954ec7576`, not a rebase) because BOB's plan changed; my entry was not among the changes.

**Deferred.** None.

**Found in another module.** None in publication's code. `checks/run.mjs` reports 22 coverage failures, all in other modules' requirement ids (affordances, agent-harness, agent-runner, control-plane, installer, screens-*, queue, translations and others). None is publication's. Not mine to change; reported here for BOB.

**Tests and checks** (from `/home/user/bio` with the process repository):
- `node --test test/m/publication/*.test.mjs` in `bio-plane`: `tests 151, pass 150, fail 0, todo 1` (the todo was already there).
- `node checks/format.mjs /home/user/bio`: `format: 174 modules, 173 requirements files; 0 failures`
- `node checks/architecture.mjs /home/user/bio publication`: `architecture: 32 product files, 119 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs /home/user/bio publication`: `coverage: 1 modules, 48 of 48 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs /home/user/bio publication tranche/T51 job/T51/publication`: `ownership: 4 files changed by publication between tranche/T51 and job/T51/publication; 0 failures`
- `node checks/run.mjs /home/user/bio`: architecture `0 failures` over 3578 product files; no publication failure; the 22 coverage failures above are other modules'.

**Size (session_012cEVybgodVvn1Sr4P4VDf9): test runs 4, module lines 2444** (code lines, comments and blanks excluded; 4470 lines in all across `deliverer.mjs` and `publication/`).

## J2 · REPORT

Started on T51-234. One edge for BOB (a uses edge is BOB's): publication's code now imports setup-words (deliverer.mjs, and checks.mjs/index.mjs next), and the architecture check fails with 'setup-words, which publication does not declare in uses'. Please add "setup-words" to publication's uses in build/modules.json (as for case-carriage, K3911) and the requirements' Uses list if wanted. I carry on with the words conversion meanwhile and merge tranche/T51 when it lands.

## J3 · BLOCKED

BLOCKED (cause: needs BOB, one act): add "setup-words" to publication's uses in build/modules.json (K3911, as for case-carriage; a uses edge is BOB's). The words conversion is done and pushed on job/T51/publication (commit 5d679fdcca): words check 0 failures (inline 0, plain 0, testcopy 0); publication tests 151 (150 pass, 0 fail, the 1 todo was there); format 0 failures; coverage 48 of 48; ownership 0 failures. The only open check is architecture: 8 failures, every one 'imports setup-words, which publication does not declare in uses' (src: deliverer, checks, index, door; tests: fixture, t28, t35, t45). Once the edge is on tranche/T51 I merge it, re-run architecture and post COMPLETE. No refusal text was judged unread: all 14 plain findings were member-facing and converted.

## T51-234 · completion (PUBLICATION #34, session_01W7ArLV5djt9odo9CqsoN5L)

**Entry applied.** T51-234 (words, K3949, K3957): all 73 findings and 14 plain findings fixed; every one was member-facing, none listed as unread. Sentences read through `word` where `words.json` holds the row (refusal.* rows, standard labels, access words, publication.why.*), else `localize('publication.<file>.<slug>', en, vars)` with the English unchanged. Also converted five short refusal `detail`s the check does not count (R13). The counsel-matter `detail` is built from whole localized sentences, verified equal to the old output for every project/findings case. Tests hold no sentence: they compare with `word`, or use neutral stand-ins. `setup-words` edge added to `uses` by BOB (B3, K4024). No inherited reds named; K3958 reds not in my entry.

**Deferred.** None. **Found in another module.** Words findings in other modules still show in `checks/run.mjs` (case-check, case-checker, case-disclosures, case-grammar, public-read's `worker.mjs:338`); none is publication's.

**Checks.** words 0 failures; tests `tests 151, pass 150, fail 0` (1 todo, pre-existing); `format: 0 failures`; `architecture: 32 product files … 0 failures`; `coverage: 48 of 48 … 0 failures`; `ownership: 13 files changed by publication … 0 failures`; `setup-words build --check`: stale-rows note only (expected).

**Size (session_01W7ArLV5djt9odo9CqsoN5L): test runs 6, module lines 2020**

## J4 · COMPLETE

T51-234 done: 73 words findings and 14 plain findings converted, tests 151 (150 pass, 0 fail, 1 todo), format/architecture/coverage/ownership 0 failures; details in my record. Other modules' words findings remain (not mine).

## J5 · COMPLETE

T51 fix round 5, E4's provider half (plan merge 6): complete.

**What changed.** `bio-plane/src/publication/index.mjs`: `caseDocument` (R1) now answers `findings: [{target, version_sha, role}]` beside `citations` (shape unchanged, `{state, rows}`), read by the new private `#pinnedFindings(docText)` right after `caseDocument`. It lists `case_findings` in the document's own order and takes each target's `version_sha` and `role` from its `case_roles` row (null where no row pins it). Null, never `[]`, when the bytes state no `case_findings` (R28); never throws. A signed and an unsigned edition answer the same; a refusal (`NO_CASE_DOCUMENT`) carries no field. `op=casedocument` passes the answer through unchanged. New data only: no stored row changes.

**Failing-first.** `bio-plane/test/m/publication/t51.test.mjs`, three tests named R1. Red first (before the code): `actual: undefined` for `findings` on the unsigned edition, and `undefined !== null` for the no-roster case. Green after: `tests 154, pass 153, fail 0, todo 1` (the todo was already there). The tests assert: an unsigned two-finding edition (one load-bearing, one supporting) answers exactly the pinned roster in order; `citations` stays `{state, rows}` and is not an array; the signed edition answers the same findings to anybody; a refusal has none; a document with no roster answers null and one with an empty roster `[]`.

**Equal to the `publish` answer.** The `publish` answer's findings come from case-authoring (`written`, `{target, bundleSha, ...}`); the document it stores pins the same targets and `version_sha` (= `bundleSha`). publication cannot use case-authoring (not in its uses), so the equality is tested against the roster the preparation pinned, and screens-publish (merge 9) closes the seam with the real `publish`.

**Reader.** The plan said "through case-grammar (one reader)". `case-grammar` has no roster reader (`signedCitations`, `caseDocumentBlocks` read other blocks), and I may not change it, so the reader is private to this module beside R55's `#caseDocMemberFrozen` and `#pinnedMemberBasis`, which already read `case_roles` with `parseFrontmatter`. If BOB wants one reader in case-grammar, that is a small move for case-grammar's job; nothing here blocks on it.

**Requirement line proposed (BOB writes `build/requirements/`).** In R1, after "and `citations` (...)": "and `findings`: `[{target, version_sha, role}]`, the roster the document pins (`case_findings` in its order, each with its `case_roles` row's `version_sha` and `role`, null where no row pins it), the same for a signed and an unsigned document; null when the bytes state no roster (R28). `citations` is not the roster." Tests name R1.

**Deferred.** None. **Found in another module.** Nothing new.

**Tests and checks.**
- `node --test --test-force-exit test/m/publication/*.test.mjs`: `tests 154, pass 153, fail 0, todo 1`.
- Readers of `casedocument` (impact.mjs names 56 modules, 958 test files; I ran the modules whose code calls `caseDocument` or `op=casedocument`): case-authoring 228/228, ratification 254/254, case-inputs 71/71, case-tensions 24/24, case-checker 95/95, case-catalogue 16/16, screens-publish 255 of 257 pass, fail 0 (2 skipped or todo, already so). I did not run the other 49 modules' suites: the change only adds a field.
- `node checks/run.mjs /home/user/bio`: format `0 failures`; architecture `4160 product files ... 0 failures`; coverage `6605 of 6605 live requirement ids named by a test; 0 failures`; channels `0 failures`; words `18421 words ... 0 failures` (my change adds no sentence, so the count does not rise).
- `node checks/ownership.mjs /home/user/bio publication tranche/T51 job/T51/publication`: `ownership: 3 files changed by publication between tranche/T51 and job/T51/publication; 0 failures`.
- No platform check is needed: the field is a parse of a document already read (N).

Size (session_01SuyGTiBzRae5USVsWZvCRa): test runs 5, module lines 2464

## G47 · completion (PUBLICATION #36, session_01QheArVvjbWvvMPvEMfwKVF; fix round 6, START B5)

**Providers' state.** At my start none of G47's other owners had merged (CASE-GRAMMAR #20, CASE-CHECKER #16, CASE-DISCLOSURES #17, CASE-INPUTS #8, CASE-AUTHORING #41). Mine needs none of them: the bound is at the store and the re-author, and publication's tests drive it directly. No seam test of mine is red by name.

**What changed.** `bio-plane/src/publication/index.mjs`:
- new export `CASE_DOCUMENT_BYTES_MAX = 1572864` (1.5 MiB), beside `EDITIONS_OF_MAX` (:155).
- `storeCaseDocument` (:491-494): after the MALFORMED check and before the hash, the SQL and any read, a text over the bound answers `{ok: false, reason: "CASE_DOCUMENT_TOO_LARGE", bytes, bound}`, writes nothing, throws nothing. Prefilter on `text.length * 3` (no byte count when it cannot exceed), then the exact UTF-8 count (`TextEncoder`).
- `reauthorSection` (:542-547): after the unchanged-text check, a splice whose result is over the bound AND larger (in bytes) than the stored text answers `{ok: true, ..., reauthored: false, too_large: {bytes, bound}, why}`, the stored text unchanged. `why` is `localize("publication.index.the_case_document_would_pass", en, {bytes, bound})`. A splice that shrinks or keeps an over-bound unsigned text is allowed. A signed or moved document is refused as before (its own `why`), before its size is looked at.
- R-OLD: new documents only; a stored document is never rewritten; none over the bound can exist (the write threw).

**Failing-first.** `bio-plane/test/m/publication/g47-bound.test.mjs`, four tests naming R21: (a) the bound + 1 B refused with `{bytes, bound}`, no row, no throw; exactly the bound stored; 2-, 3- and 4-byte characters counted in bytes; a refused replace leaves the stored unsigned text; (b) a growing splice past the bound refused with `too_large` and `why` (compared with `localize` by equality, no copied sentence), the text unchanged; a small splice is allowed; (c) a shrinking splice of an over-bound unsigned text is allowed, a growing one refused; (d) controls: a normal document stored byte for byte, a signed document never touched. RED on the unfixed code: with the constant inlined, `pass 0, fail 4` (e.g. `actual: {ok: true, ... stored: true}`, expected `CASE_DOCUMENT_TOO_LARGE`); as written, the import of the constant fails. GREEN after: `tests 4, pass 4, fail 0`.

**Measures (K1881: give BOB these numbers).** Bound set: **1,572,864 B**, BOB's constant, not lowered. It is above R17's measured ~1.24 MB times 1.2 (= 1.49 MB). In a child with `--max-old-space-size=128` under the preload, a document padded to exactly the bound: `storeCaseDocument` ok, `caseDocument` ok, `commitCaseEdition` (signing) ok, `publishedCaseDocumentText` returns all 1,572,864 B; 57 ms, rss 185 MB. At 1.2x the bound (1,887,436 B, written past the bound by SQL, since the store refuses it): the same four steps answer, 60 ms, rss 190 MB; 1.2x is still under the platform's 2,098,176 B. These are the steps publication owns. The act's renders, `casedocfacts`, `caseratify`'s parse, `case-check` and the public page belong to other modules, whose G47 providers have not merged: not measured here, and the bound stays to be confirmed by case-authoring #41's seam run at k = 501. **Platform check L:** Miniflare's DO SQLite (local) accepted a 1.5 MiB, a 1.2x and a 2,098,187 B text in one row without refusing: it does not enforce the production bound, so only the preload (`platform-sqlite.mjs`) holds it here.

**Callers of `reauthorSection` read.** `case-inputs` (`index.mjs:879-886`) drops the `why` and `too_large` (CASE-INPUTS #8 fixes it, as the entry says); `case-tensions` (`#splice`, :508-514) passes the answer through whole; `case-authoring` calls `storeCaseDocument` only (`index.mjs:1206`, uses `stored.doc_sha`; CASE-AUTHORING #41 reads `ok: false`). No other caller in `bio-plane/src` presents `reauthored: false` as success.

**Census.** No op I own changes its accepted keys: `storeCaseDocument` and `reauthorSection` are services (the latter a case-tensions provider door), not ops; `op=casedocument` is unchanged.

**Words.** One new sentence, `localize("publication.index.the_case_document_would_pass", ...)`; the refusal `CASE_DOCUMENT_TOO_LARGE` carries no sentence of mine (case-authoring's row).

**Requirement lines proposed (BOB writes `build/requirements/`).** In R21, after "never throw on a signed or moved document": "`storeCaseDocument` refuses a text over `CASE_DOCUMENT_BYTES_MAX` (1,572,864 UTF-8 bytes; K4666) as `{ok: false, reason: "CASE_DOCUMENT_TOO_LARGE", bytes, bound}`, writing nothing and throwing nothing; `reauthorSection` refuses only a splice whose result is over the bound and larger than the stored text, answering `{ok: true, ..., reauthored: false, too_large: {bytes, bound}, why}`, the stored text unchanged, so an unsigned document stored larger can still be mended by a splice that shrinks or keeps it."

**Deferred.** None. **Found in another module.** Nothing new beyond the entry's list.

**Checks.** `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/publication/*.test.mjs`: `tests 158, pass 157, fail 0, todo 1` (the todo was there). `checks/run.mjs /home/user/bio`: format `0 failures`; architecture `4297 product files ... 0 failures`; coverage `6685 of 6685 live requirement ids named by a test; 0 failures`; channels `0 failures`; words `18524 words ... 0 failures` (inline 0, plain 0, testcopy 0). Users: the change only adds a refusal at a size no existing test reaches; the readers' suites run in their own jobs once the providers merge. Ownership: run below.

Size (session_01QheArVvjbWvvMPvEMfwKVF): test runs 9, module lines 2481

## J6 · COMPLETE

G47 (store bound): complete. CASE_DOCUMENT_BYTES_MAX = 1,572,864 B (BOB's constant, not lowered; report to Bob, K1881). storeCaseDocument refuses over-bound as CASE_DOCUMENT_TOO_LARGE {bytes, bound}, writes/throws nothing; reauthorSection refuses only a splice that is over the bound AND larger than stored (reauthored:false, too_large, why); shrinking is allowed. Failing-first g47-bound.test.mjs: red (fail 4) then green (4/4); publication suite 158 (157 pass, 0 fail, 1 todo); format/architecture/coverage/words/ownership 0 failures. Measure (publication-owned steps, 128MB old space, preload): store, casedocument, sign, publishedCaseDocumentText ok at the bound (rss 185MB) and at 1.2x = 1,887,436 B (rss 190MB), under 2,098,176. Not measured: the other modules' steps (their providers are unmerged). Miniflare local DO SQLite did NOT enforce the production value bound (accepted 2.1 MB), so only the preload holds it here. No seam test of mine is red. case-inputs drops why/too_large (CASE-INPUTS #8). No op's census keys change. Requirement line proposed in my record. Details: build/jobs/T51/publication.md section G47.

## G47t · completion (PUBLICATION #36; CHANGE B6, K4677)

**Providers' state.** CASE-CARRIAGE #15 (107) had not merged when I did this: `holdMaterials` answers no `capture_sha` yet. My tests drive the real commit with `case-carriage` real and `holdMaterials` answering the `files` the test names; the one seam test over the real carriage is red by name until #15 merges (below).

**What changed.**
- `bio-plane/src/publication/schema.mjs`: `published_shas` gains `capture_sha TEXT` in the `CREATE TABLE` (:96) and in `ADDITIVE_COLUMNS` (`["published_shas", "capture_sha", "TEXT"]`, with the comment's form: NULL says no single capture is named). Never back-filled. New export `ATTESTATION_SHA_UPSERT`: the seven-column insert with `ON CONFLICT(sha256,bundle_id,path) DO UPDATE SET capture_sha = NULL WHERE capture_sha IS NOT NULL AND capture_sha IS NOT excluded.capture_sha`.
- `bio-plane/src/publication/index.mjs` (R57 registration, :1171-1181): a `files` entry of kind `attestation` is inserted with that statement and `capture_sha` (lowercased, null when absent); every other kind keeps its six-column `DO NOTHING` insert, so its `capture_sha` is null. The other five writers are untouched. No reader changes; `public-read`'s `shas:` read keeps its explicit columns.
- R-OLD: a stored NULL is never filled; new rows only.

**Tests, `test/m/publication/g47t-registry.test.mjs` (red first, then green).** Against the unfixed source: 4 of 6 red (k = 2 case; later editions; migration; seam) and the 2 controls green. With the fix: 5 of 6 green; the seam test stays red.
- (a) k = 2: each attestation row holds its own capture's sha, a carriage-null token null, every other kind null.
- (b) edition 2 keeps A's token with A, a token A then B becomes NULL, B's own holds B, the same capture again changes nothing, a later commit never fills a NULL, an entry without the key stores null.
- Controls: (c) a one-capture case's six old columns of every row as the entries state; (d) R-OLD migration: the old six-column table with a token row migrated, six columns identical, `capture_sha` null, a second boot changes nothing, a later commit never fills the null; (e) `declaredTables()` entry of `published_shas` unchanged (exempt, admin-only, none, stored, bundle).
- **Seam, red by name:** "R57 R40 seam, over the real case-carriage ..." fails today with `[null]` where the stamped capture's sha is expected; it waits for CASE-CARRIAGE #15 (merge `tranche/T51` again when BOB says it merged).

**L (real Durable Object SQLite).** New `test/m/publication/g47t-miniflare.test.mjs` (the plane's Miniflare pattern, `sandbox.mjs` import, narrowed to the one table): in Miniflare with `useSQLite`, publication's real `schema.mjs` runs on a store whose `published_shas` holds an old six-column row: `migratePublication`'s `ALTER TABLE ... ADD COLUMN` adds the column, the old row reads `capture_sha` null and a second boot changes nothing, and `ATTESTATION_SHA_UPSERT` through the real engine keeps A, clears A-then-B to NULL, and never fills the old null. Passes. I did not extend a full-plane Miniflare suite: the whole-plane k = 2 commit needs the real carriage, which is #15's.

**Census.** No op I own changes its accepted keys or answers. **P:** none.

**Requirement lines proposed (BOB writes `build/requirements/`).** R40: the `published_shas` column list gains `capture_sha` (TEXT, nullable): set only for kind `attestation`, the sha of the one capture the token stamps; NULL for every row written before, every other kind, and a token two different captures name; read by `public-read`. R57: "a kind `attestation` file is registered with its `capture_sha`; a stored capture that differs from the new one is cleared to NULL, a stored NULL is never rewritten to a value, the same capture again changes nothing."

**Deferred.** None. **Found in another module.** Nothing new.

**Checks.** publication suite under the preload: `tests 165, pass 163, fail 1 (the seam above), todo 1`; public-read suite `244/244`. `checks/run.mjs /home/user/bio`: format `0 failures`; architecture `4300 product files ... 0 failures`; coverage `6685 of 6685 ... 0 failures`; words `18524 words ... 0 failures` (no new sentence); channels `0 failures`. Ownership: below.

Size (session_01QheArVvjbWvvMPvEMfwKVF): test runs 17, module lines 2503

## J7 · COMPLETE

G47t (CHANGE B6): complete, one seam red by name. published_shas.capture_sha added (CREATE + ADDITIVE_COLUMNS, never back-filled); kind attestation files inserted with it through ATTESTATION_SHA_UPSERT (differing stored capture -> NULL, stored NULL never filled, same capture unchanged); every other kind and writer unchanged. g47t-registry.test.mjs: 4 of 6 red on unfixed source, now 5 green (k=2, later editions, R-OLD migration, declaration unchanged, one-capture control). SEAM RED BY NAME: 'R57 R40 seam, over the real case-carriage' waits for CASE-CARRIAGE #15 (holdMaterials does not yet answer capture_sha); tell me to merge tranche/T51 when it lands. L: g47t-miniflare.test.mjs passes in a real DO SQLite (ALTER ADD COLUMN, 7-col insert, DO UPDATE). Publication suite 165 (163 pass, 1 seam fail, 1 todo); public-read 244/244; format/architecture/coverage/words/ownership 0 failures. No census op changes. Proposed R40/R57 lines in my record (section G47t).

## G47t · re-completion (CHANGE B7, K4678)

CASE-CARRIAGE #15 is merged; `tranche/T51` merged into my branch (a merge, not a rebase). The seam test "R57 R40 seam, over the real case-carriage" is now green: no seam red remains. Publication suite under the preload: `tests 165, pass 164, fail 0, todo 1`; public-read: `244/244`. Checks: format, architecture, coverage, words, ownership `0 failures` (as run just after the merge). Nothing in the code changed.

**Requirement lines proposed (BOB writes them)**, as in the section above: R40: `published_shas` gains `capture_sha` (TEXT, nullable): set only for kind `attestation`, the sha of the one capture the token stamps; NULL for rows written before, every other kind, and a token two different captures name; read by `public-read`. R57: "a kind `attestation` file is registered with its `capture_sha`; a stored capture that differs from the new one is cleared to NULL, a stored NULL is never rewritten to a value, the same capture again changes nothing." Plus G47's R21 line (the byte bound) from the first section.

Size (session_01QheArVvjbWvvMPvEMfwKVF): test runs 19, module lines 2503

## J8 · COMPLETE

G47t re-complete (B7): tranche/T51 merged; the seam test over the real case-carriage is green, no seam red remains. Publication 165 (164 pass, 0 fail, 1 todo); public-read 244/244; format/architecture/coverage/words/ownership 0 failures. Proposed lines: R21 (byte bound, first section), R40 (published_shas.capture_sha) and R57 (attestation registration), in my record.

## J9 · COMPLETE

Correction to J8: my 'architecture 0 failures' was wrong at the time (1 failure: g47t-miniflare.test.mjs imported test-support's sandbox.mjs, which publication does not declare). Fixed and pushed (the test owns its temp directory); now architecture 0 failures, format/coverage/words/ownership 0 failures; the Miniflare test still passes. Everything else in J8 stands: seam green, publication 165 (164 pass, 1 todo), public-read 244/244.

## G54 · completion (PUBLICATION #37, session_01B2MtWpS48XnZkx7Fbo2FBa; fix round 6, START B8)

**What changed.**
- `bio-plane/src/publication/schema.mjs`: `published_cases` gains `casefile_state`, `casefile_attempts`, `casefile_attempted_at`, `casefile_why` in the `CREATE TABLE` (:249 block) and in `ADDITIVE_COLUMNS` (end of the list). Nullable, never back-filled.
- `bio-plane/src/publication/index.mjs`: exported constants `CASEFILE_STATES`, `CASEFILE_STEPS`, `CASEFILE_MISSING_MAX_ATTEMPTS` (6), `CASEFILE_GRACE_MS` (2 min), `CASEFILE_BUILDING_WAIT_MS` (2 min), `CASEFILE_BACKOFF_FIRST_MS` (15 s), `CASEFILE_BACKOFF_MAX_MS` (1 h), `CASEFILES_OWED_MAX` (100), `CASEFILE_WHY_BYTES_MAX` (1024), `CASEFILE_TEXT_MAX` (160), pinned by `g54-casefile.test.mjs`. After `recordCaseManifest`: `recordCaseFileAttempt({caseId, edition, state, why, at, absent})`, `caseFilesOwed({now, limit})`, `caseFileNextAt()`. Dispatcher: `recordcasefile` beside `recordcasemanifest` in `publicationOps`. `recordCaseManifest` is unchanged and leaves the columns alone.
- Writer rules: callers write `building`, `failed` or `built`. `building`/`failed` add one attempt; `built` adds none, clears `why`, and needs a recorded manifest (else `NO_MANIFEST`). `stopped` is the writer's own: a `failed` with `why.code` `MATERIAL_MISSING` and `absent: true` (the caller's probe confirmed the object gone) that is the 6th in a row (counted in `why.run`; a `building` keeps the run, another code resets it). A late `building`/`failed` never undoes a `built` or a `stopped`; a `built` is accepted over anything. `why` is reduced to `code` (`^[A-Z][A-Z0-9_]*$`), `step` (the list), cut `error`/`detail` (160 chars), `bytes`, `files`, `run`; under 1 KB. Anything else is `MALFORMED` and writes nothing. No new sentence (Words: none).
- Owed rule (one place): complete by `caseEditionState`, not `stopped`, and (no manifest, or ledger state `building`/`failed`). Due at `ratified_at` + 2 min if never attempted, else `attempted_at` + `min(15 s * 2^(attempts-1), 1 h)` (a `building` at least 2 min). Oldest due first. A manifest with a null state is built (R-OLD). `caseFileNextAt()` is the earliest due as an ISO string, null when none.

**Tests** (`test/m/publication/g54-casefile.test.mjs`, 9 tests naming R15/R40/R31; `g54-miniflare.test.mjs`, L). Red on the old tree: every behavioural test fails (no method, no hop; seen with the constants stubbed so the file loads). Green now: 9/9 and the L test. They cover the entry's list: owed after grace, incomplete never, doubling to the cap (11 steps), building 2 min and kill-loop backoff, stopped never owed and not rewritten, built never owed, recordCaseManifest leaves the columns, null state with a manifest never owed, controls (no other table or existing column changes), migration once and a second boot nothing, `declaredTables` unchanged (exempt/admin-only/none/stored/group), the real dispatcher, and no other op of the map writes the ledger.

**L (real Durable Object SQLite, Miniflare).** An old-shape `published_cases` row takes the four `ALTER TABLE ... ADD COLUMN` once, reads them null, a second boot adds nothing, the writer's UPDATE and the owed query (`IS NOT`, `IN`) run on the platform. P: none.

**Census.** `recordcasefile` is a store-internal hop declared like `recordcasemanifest`; no accepted key of any op changes; it is reachable from no op (test). Publication owns no `DECLARED_OPS`.

**Found in another module (for BOB).** `test/m/op-declarations/t33.test.mjs` `IN_PROCESS.publication` (line ~99) lists the internal hops; it must gain `"recordcasefile"`, else "R19, R6 ... publication: recordcasefile has no spec" fails. That file is op-declarations', not mine; red by name until its job adds the hop.

**Requirement lines proposed (BOB writes them).**
- R15: add "`recordCaseManifest` leaves the case file's ledger alone. `recordCaseFileAttempt({caseId, edition, state, why, at, absent})` (store-internal hop `recordcasefile`, no caller's op) is the one writer of `published_cases.casefile_state` (`building`|`failed`|`stopped`|`built`), `casefile_attempts`, `casefile_attempted_at` and `casefile_why` (JSON `{code, step, error?, detail?, bytes?, files?, run?}`, under 1 KB). `building` and `failed` add one attempt; `built` needs a recorded manifest; `stopped` follows the 6th `MATERIAL_MISSING` failure in a row with the absence confirmed; a built or stopped edition is not rewritten by a late `building` or `failed`. `caseFilesOwed({now, limit})` answers the complete editions with no manifest or a `building`/`failed` ledger, not `stopped`, once due (never attempted: `ratified_at` + 2 minutes; else `attempted_at` + min(15 s * 2^(attempts-1), 1 h), a `building` at least 2 minutes), oldest due first; `caseFileNextAt()` the earliest due, null when none. A manifest with a null state is built."
- R40: `published_cases` gains `casefile_state`, `casefile_attempts`, `casefile_attempted_at`, `casefile_why` (nullable, never back-filled), read by `public-read`, `publish-schedule` and `ratification` only through R15's reads and this contract.

**Deferred.** None.

**Tests and checks.**
- Publication suite under the preload: `tests 175, pass 174, fail 0, todo 1` (the todo is R30, there before).
- Impact set (`impact.mjs origin/tranche/T51 HEAD`: 56 modules, 1013 files, run one at a time): fails only the inherited reds (case-checker R13, R25; plane `release` R24; the common R24 screen-words red) plus two not on the list: op-declarations t33 R19/R6 (mine, above) and journey-check `pseudo.test.mjs` R29 (environment: `playwright-core` not installed in `src/journey-check`; unrelated to this change).
- `checks/run.mjs /home/user/bio`: format 0, architecture 0 (4339 files), coverage 0 (6686 of 6686), channels 0, words 1 failure (the inherited `case-checker/spec.mjs:11` inline 1).
- `checks/ownership.mjs /home/user/bio publication tranche/T51 job/T51/publication`: 5 files changed by publication; 0 failures.

Size (session_01B2MtWpS48XnZkx7Fbo2FBa): test runs 9, module lines 4645 (physical lines of src/publication/*.mjs and deliverer.mjs, comments included)

## J10 · COMPLETE

G54 (publication) complete: four casefile_* columns on published_cases, recordCaseFileAttempt (hop recordcasefile), caseFilesOwed, caseFileNextAt. g54-casefile.test.mjs 9/9 (red on old tree), L Miniflare test green; publication 175 (174 pass, 0 fail, 1 todo); checks 0 failures except inherited words inline 1. FOUND IN OTHER MODULE: op-declarations t33.test.mjs IN_PROCESS.publication must gain 'recordcasefile' (R19/R6 red by name). journey-check pseudo R29 red is environment (playwright-core missing). Record section 'G54 · completion' holds R15/R40 lines. Size (session_01B2MtWpS48XnZkx7Fbo2FBa): test runs 9, module lines 4645.

## J11 · QUESTION

Two things decide whether I can reach zero on my lines; the rest of the job is done and green (publication suite 179 pass, 0 fail, 1 todo).

1. `modules.json`: add `retrieval` to publication's `uses`. My own line `fixture.mjs:137` (the hand-built `NO_SUCH_SELECTION`) is FIX-E: retrieval is earlier and publishes `noSelection` in `test/m/retrieval/fixtures.mjs`. I re-pointed it, but `checks/architecture.mjs` then fails: "bio-plane/test/m/publication/fixture.mjs imports retrieval/fixtures.mjs of retrieval, which publication does not declare in uses". Without the import the line stays hand-built; letting `inquiry` build its own lazy `retrievalOf(host)` instead fails 18 tests (the host has no retrieval tables). Please add `retrieval` (as you added `setup-words` at B3) and post a CHANGE; I will then run the check and COMPLETE.

2. `assembleCaseContainerRefusal` (and the build refusals of `caseFileLedger`: MATERIAL_MISSING, BUCKET_FAILED, CASE_FILE_NOT_ASSEMBLED) cannot be published by publication: `modules.json` gives `bio-plane/src/publication/worker.mjs` (`assembleCaseContainer`, `recordCaseFileFailure`) and `public-read/casefile.mjs` to `public-read` (112, after me at 109), and a publication test may not import it. The fixtures check agrees: it names `public-read (earlier)` as the provider of the three ratification lines (g54-paths:310, :455, g57-heal:426). So `public-read` should publish it. I published the ledger half that is mine (`caseFileLedger`: the real `recordCaseFileAttempt` hop, `caseFilesOwed`, `caseFileNextAt`, `recordCaseManifest`, and the writer's own refusals MALFORMED / NO_SUCH_CASE_EDITION / NO_MANIFEST). Please move that fixture to public-read's START.

## J12 · COMPLETE

Fix round 10, Wave A batch 2: publication complete (only test files of my module changed; no product code).

**Fixtures published** (`bio-plane/test/m/publication/fixtures.mjs`, new; each made by real code at call time; checked by `fixtures.test.mjs`, 5 tests): `caseDocumentFacts` (NO_CASE_DOCUMENT for none and for a viewer without standing; the stored unsigned and signed document), `caseFileLedger` (real `recordcasefile` hop, `caseFilesOwed`, `caseFileNextAt`, `recordCaseManifest`; the writer's own refusals MALFORMED / NO_SUCH_CASE_EDITION / NO_MANIFEST), `publicationWorld` (real `restingCapturesOf` over findings made to rest on documents by the real acts), `stampEditionRefusal` (NO_SUCH_CASE_EDITION, STAMP_NO_ORDER), `storeCaseDocumentRefusal` (MALFORMED).
**Not mine (B10):** `assembleCaseContainerRefusal` and the build refusals: public-read publishes them.

**Own lines:** fixture.mjs:137 now takes retrieval's `noSelection`; t35.test.mjs (:37, :245), t37.test.mjs:32, t47.test.mjs:24 take standards' real answer through `absentStandard` (fixture.mjs, over `standardReadWorld`). door.test.mjs:95 carries `// fixtures-contract: store-door store-replies`: the one line left, `contract-no-run`, waiting for store-door's `fixtures-run`. No `fixtures-own` or `fixtures-generic` marker added.

**Runs:** publication suite under the preload: tests 180, pass 179, fail 0, todo 1 (the old one). Checks: format 0 failures; architecture 0; publication coverage 48 of 48 (the whole-tree coverage's 13 failures are other modules'); words 0; ownership 0; fixtures for publication: 1 line, the one above. Impact: the diff touches only publication's tests, so no other module's behaviour changed; I did not run the impact users' 123 test files.
Deferred: none. Found in other modules: none.

Size (session_01XbERoEwBuhJPVYwb5wJ3HY): test runs 5, module lines 190

## Follow-up 18 · completion (PUBLICATION #39, session_01Cz7XXhRgKLEhdaMNQ5hG3Y; fix round 10, cause R27a's store half; START B11)

**Entry applied.** R15's amendment (K5084): `recordCaseManifest({caseId, edition, manifest, manifestSha, bytes?, built?})`. With `built: true` the case file is recorded built (`casefile_state='built'`, why cleared, attempts unchanged) in the same transaction as the manifest, so `caseFilesOwed` no longer lists it; also on the same-hash retry (a manifest recorded without `built`, then called again with it, builds the file). Without `built`, or `built: false`, the act is as before. `built` that is not absent, null or a boolean is `MALFORMED`, nothing written. The hop `recordcasemanifest` passes the body whole, so the Worker can send `built`. `recordCaseFileAttempt` is unchanged.

**Test, seen red first.** `g54-casefile.test.mjs`, "R15 recordCaseManifest built:true": failed before the change (`casefile_state` null after the call, expected `built`), 16/16 with `fixtures.test.mjs` after. Controls: without `built` the ledger is left alone; a failed ledger with a manifest stays owed without it and is built by the retry with it; six malformed values write nothing; `NO_SUCH_CASE_EDITION` and `MANIFEST_EXISTS` keep their reasons.

**Fixture.** `bio-plane/test/m/publication/fixtures.mjs`: `caseFileLedger(...).manifest(caseId, edition, {built})` passes `built` to the real `recordCaseManifest`; `fixtures.test.mjs` has one new test for it. No `fixtures-own` or `fixtures-generic` marker added.

**Deferred.** None. **Found in other modules.** None. `public-read` can now call it (its job waits).

**Tests and checks.**
- Publication suite under the preload: tests 181, pass 180, fail 0, todo 1 (R30, before).
- Impact set (`impact.mjs origin/tranche/T51 HEAD`: 56 modules): the only caller of the hop is `public-read`; I ran the modules that use publication's manifest or ledger: public-read 307/307, ratification 335/335, publish-schedule 34/34, docket 90/90. The change is an added optional field, so I did not run the other 50 modules' 1,100 test files.
- format 0 failures; architecture 0; coverage 48 of 48, 0 failures; ownership 0 (5 files); words 0 failures; fixtures for publication: 1 line, `door.test.mjs:95` `contract-no-run`, waiting for store-door's `fixtures-run` (before this job).

Size (session_01Cz7XXhRgKLEhdaMNQ5hG3Y): test runs 8, module lines 4790

## J13 · COMPLETE

Follow-up 18 complete: R15's amendment (K5084) met. recordCaseManifest takes built:true, recording the case file built in the same transaction (also on a same-hash retry); absent/false as before; a malformed built is MALFORMED. Test seen red first (g54-casefile.test.mjs); fixture caseFileLedger(...).manifest(case, edition, {built}) published in fixtures.mjs with a fixtures.test.mjs test. Publication suite 180 pass, 0 fail, 1 todo (R30); public-read 307, ratification 335, publish-schedule 34, docket 90, all pass. format, architecture, coverage (48/48), ownership, words 0 failures; fixtures: only the old door.test.mjs:95 contract-no-run. No fixtures-own or fixtures-generic marker added. Deferred none; nothing found in other modules. public-read (#34) may now call it. Size (session_01Cz7XXhRgKLEhdaMNQ5hG3Y): test runs 8, module lines 4790.

## Follow-up 27 · completion (PUBLICATION #40, session_016A5pnT8yWBYi5ogyJCNRvX; fix round 10, START B12; K5094)

**Entry applied (test files only).** New fixture in `bio-plane/test/m/publication/fixtures.mjs`: **`restingOf(held)`**, `held = [{finding, projects, digests}]`. Each finding is a real published finding (its inquiry, one case per named project pinning it, its signature with a `serve` edge to each document) resting on exactly the captures `digests` names (each a real register document holding that sha; a digest two findings name is one capture). Answers `{world, publication, restingCapturesOf(q)}`; `restingCapturesOf` is the real module's (R42): its paging, cursor, caps, and project ids are the ones the caller names. Throws if a finding is named twice or names no project. To state the digests, `fixture.mjs`'s `doc(id, {digest})` takes an optional capture sha (default unchanged: the sha of its own text); `provDoc` takes it too.
Test: `fixtures.test.mjs`, "R42 fixtures: restingOf …", against the real module (captures in order, findings and projects per capture, paging by `limit` and `after`, empty). No product code changed.

**fixtures-own / fixtures-generic markers added:** none. `checks/fixtures.mjs … publication --list`: `answer 0 … stub 0, code 0, contract 0, accepted 1; 0 failures` (the one accepted line, `door.test.mjs:95`, was already there).

**Deferred.** None. **Found in another module.** Nothing. monitoring's `stubPublication` (`fixture.mjs:339`) can now be re-pointed to `restingOf(...).publication` (a monitoring session).

**Checks.** publication suite under the preload: `tests 183, pass 182, fail 0, todo 1`; format `0 failures`; architecture `0 failures`; coverage `48 of 48 … 0 failures`; ownership run after commit.

Size (session_016A5pnT8yWBYi5ogyJCNRvX): test runs 3, module lines 2503

## J14 · COMPLETE

Follow-up 27 (B12, K5094): complete. New fixture restingOf(held) in bio-plane/test/m/publication/fixtures.mjs, held = [{finding, projects, digests}]: real published findings (real inquiry, a case per named project, real signature with serve edges) resting on exactly the named capture digests; answers {world, publication, restingCapturesOf(q)}, restingCapturesOf the real R42 over the project ids named. fixture.mjs doc() takes an optional digest. Tested in fixtures.test.mjs against the real module. No marker added; fixtures.mjs --list: 0 failures (1 accepted, door.test.mjs:95, pre-existing). Suite 183 (182 pass, 0 fail, 1 todo); format/architecture/coverage/words/ownership 0 failures. monitoring can re-point stubPublication to restingOf(...).publication. Record: build/jobs/T51/publication.md.

## J15 · COMPLETE

**Follow-up 39 applied (test files only).** New file `bio-plane/test/m/publication/contract-case-parts.test.mjs` (commit `6057c635be`), carrying `// fixtures-run: reevaluation case-cited-parts` (line 12). Two tests call the real `caseCitedParts`, the function publication hands to reevaluation's `registerCaseParts`, against reevaluation's contract: a ratified case built by the ratification acts (prepare, signCase, signFinding, as `cases.test.mjs` plays them), and a case with no ratified edition. No hand-built answer. No `fixtures-own` or `fixtures-generic` marker added.

**Difference from the contract, for BOB (no product code changed).** The contract names `{case, edition, project, parts}` for a ratified case and `{ok: false, reason: "NO_SUCH_CASE_EDITION"}` for none. The real answers carry more:
- success: also `ok: true`, `limit`, `truncated` (`limit` and `truncated` are R41's bound, CITED_PARTS_MAX)
- refusal: also `case`, `edition`, `detail`

The refusal code matches the contract, and each part is exactly `{bundle_id, capture_sha}`. The test pins the extra keys, with a comment naming them, so it stays green and the difference is visible. Reevaluation's line `caseparts.test.mjs:31` is now accepted by the checker. Whether the contract or the real shape should move is BOB's call; reevaluation's line follows his ruling.

**Checks** (absolute root `/home/user/bio`):
- `fixtures.mjs … publication --list`: 0 failures (accepted 1: `door.test.mjs:95`, already there)
- `fixtures.mjs … reevaluation --list`: 0 failures (accepted `case-cited-parts`; before this job, `caseparts.test.mjs:31` failed `contract-no-run`)
- `format`, `architecture` (40 product files), `coverage` (48 of 48), `words`, `ownership` (1 file): 0 failures

**Tests.** `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/publication/*.test.mjs`: `tests 185, pass 184, fail 0, todo 1` (the todo was already there). The new file alone: 2 pass.

**Merged.** `tranche/T51` merged into the job branch at takeover (8 commits, merge commit `d646f8e67f`, no conflicts).

**Deferred:** none. **Found in another module:** none.

START B13 carried another job's "Re-point" paragraph and its "Done" line; CHANGE B14 said to ignore them, and I did.

**Size (session_01B3sty8GH9yv5VdR2zqwU5D): test runs 4, module lines 2645** (code lines, comments and blanks excluded, across `deliverer.mjs` and `publication/`).
