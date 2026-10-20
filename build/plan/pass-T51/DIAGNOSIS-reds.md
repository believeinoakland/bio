# Diagnosis of the unaccepted reds on tranche/T51 (before the declaration pass)

Tree: /tmp/claude-0/-home-user-bio/7f04f2a5-78b7-5d38-b02a-defdf7ec1d59/scratchpad/base (detached, HEAD 4de0350ceb). Raw outputs are in this directory (`<module>.txt`, and `promotion-*.txt`, `ae-families.txt`, `ocr-probe.txt`). No product file was changed. Each proposed test change was tried on a throwaway copy of the test (an untracked `zz-*` file, since deleted) and passed.

## One cause behind 13 of the 16 reds: the design stream's words merges

Commits on `main`/T51 on 2026-10-20 (04:57 to 05:51), after the last generated-artifact round of 2026-10-19:

- `3f8b0d2dc8`, `1c55a6e16e`, `8bb0e1e9b2`, `3f8b0d2dc8` ("B411 live walk"): `docs/development/ux-substrate/screens/words.json` re-worded `refusal.NO_REVIEW_COPY`, `refusal.NOT_SCANNED`, `refusal.SCAN_STALE`, `refusal.ACCEPT_MUST_REAUTHOR` and others.
- `d6abb59351` (DEC-383), `840099da7c` (DEC-384), `1cc4a957f0` (DEC-385): design words merged; `rows.mjs` regenerated in `bd7ada8806`, `4e1b0e353a`, `6a474f5756` (setup-words rows, sha256 now 50aff45b..., bundles were built from 4cedecef...).

Words moved: "—" went to ": " in strength's arithmetic sentences; "UNRATED/UNDETERMINED/DERIVES" went to plain words in strength and review; "machine" went to "assistant", "Read" to "Show", and the NO_REVIEW_COPY sentence was re-worded. Nobody re-pinned the tests, snapshots or generated bundles that copy those words or hash those rows.

Note on the worktree: 19 untracked `*.txt` files (`strength.txt`, `answers.txt`, ...) sit in the worktree root, dated 09:14. They are spec-reporter output of a test run from before my runs; I did not make them and left them. The agent-worker run changed no tracked file (`git status` clean apart from those and node_modules).

---

## 1. ocr-worker

### 1a. `ocr-worker/test/ocr-worker.test.mjs`, arm "R19 the committed manifest's input and asset hashes match the tree (a swapped engine is caught as stale)"
- Message: `want [] got ["ocr-worker: STALE BUNDLE — the source ../bio-plane/src/setup-words/rows.mjs has changed since dist/ocr-worker.bundled.mjs was built (source is now sha256 50aff45b..., the bundle was built from 4cedecef...). Run node bio-plane/scripts/bundles.mjs ..."]`. 248 other arms pass.
- Cause: stale generated artifact. `dist/ocr-worker.bundled.mjs` and its manifest embed `setup-words/rows.mjs`, which the DEC-383/384/385 regenerations changed.
- Owner: ocr-worker (`ocr-worker/dist/*`, its manifest); the trigger is setup-words.
- Fix (plan entry): in ocr-worker's job, from the repo root run `node bio-plane/scripts/bundles.mjs`, then keep only the ocr-worker artifacts (dist bundle and manifest) for this module. Test: `node --test --test-force-exit ocr-worker/test/`, R19 arm green. Control: the arm's own swapped-engine control stays. Expect the other fleet bundles to be stale for the same reason (agent-worker below, and `bio-plane/scripts/bundles.mjs` rebuilds all); each module commits its own.
- Fragile test? No. It is the intended staleness guard.
- Confidence: high.

### 1b. `bio-plane/test/ocr-measure-probe.mjs` (file exits 1, 100 s)
- Message: the file-level "test failed"; the output ends `NEGATIVE CONTROL noise (CPDF-11 recipe, seed 11): chars=7558 ... -> FAIL (invented text on uniform noise — D-314's class)` and the process sets `exitCode = 1`.
- Cause: environment. The file is "A PROBE, not a suite": it does `npm install` of tesseract.js and tesseract-wasm, downloads traineddata and a Legistar PDF, needs python3 with pypdf and Pillow, and times OCR. Here the engines invent text on the noise page, so its own gate fails. Not a word change, nothing in the repo moved it. It also takes about 5 minutes alone.
- Owner: ocr-worker (listed in its `tests`), as an instrument.
- Fix: no code change. Recommend BOB rule it out of the module's test list, or accept it by name as a network/engine-dependent measurement. If kept, a plan entry could make it exit 0 and print "undetermined" when the noise gate fails, but D-314 says that run is a valid "undetermined", so the exit code is the probe's design. Confidence in the diagnosis: medium-high (I ran it alone: same exit 1).

---

## 2. promotion

The three failing files in the batch were `d526-refusal-order.test.mjs`, `m/promotion/write-path.test.mjs` and `system/row-census.test.mjs`. Only row-census is a real red.

### 2a. `bio-plane/test/system/row-census.test.mjs`, arm "R50: the tree holds the pin, the rows awaiting stamp listed — any other difference fails naming the row"
- Message: `the census ... is 1923 rows sha256 34fed4f2..., not the pin 1923 c5885eaf...: changed with no record: C-140.4 NOT_SCANNED; C-140.7 SCAN_STALE; C-33.54 ACCEPT_MUST_REAUTHOR; C-87.1 NO_REVIEW_COPY`.
- Cause: four translations (rows read by key from words.json) changed after the 1.79.0 stamp: C-140.4 and C-140.7 file-safety "Read the safe view" became "Show the safe view"; C-33.54 record-grammar "the machine wrote" became "the assistant wrote"; C-87.1 review's whole sentence re-worded. All come from the design words merges of 2026-10-20 (the B411 live walk, `3f8b0d2dc8` and neighbours). Count of changed lines: exactly these four (checked with a diff of the census against `fixtures/row-census-1.79.0.jsonl`; no arrival, no departure).
- Owner: promotion (the pin `ROW_CENSUS` in `bio-plane/src/gate.mjs` and its fixture); the rows belong to file-safety, record-grammar and review, which read words by key and did nothing wrong.
- Fix (plan entry), either one:
  - (preferred, the convention of the file's header) promotion's stamp: bump `CATALOG_VERSION` in `gate.mjs`, set `ROW_CENSUS` to `{rows: 1923, digest: 34fed4f266339d175bdb1a08eb02af5a272f25fce0973a2242115d0633537b61}`, write `bio-plane/test/fixtures/row-census-<new>.jsonl` with `censusOf` lines (delete 1.79.0's), add the RE-PINNED header paragraph naming the four rows and the design commits. Test: row-census 10 of 10, and whatever else pins `CATALOG_VERSION`. Control: the suite's arms (1) to (3) run with it. Check that nothing else hard-codes the version (grep `1.79.0`).
  - (if BOB wants no version bump now) declare the four rows in `AWAITING_STAMP` as `kind: "changed"` with a job record under `build/jobs/T51/` that has a paragraph reading "awaiting stamp" and naming C-140.4, C-140.7, C-33.54, C-87.1. The suite's "named by its job record" arm checks the record text.
- Fragile test? No. The row census is meant to catch exactly this; the header says the red is accepted by name until the next layer-2 stamp. It does need that acceptance or a stamp.
- Confidence: high.

### 2b. `bio-plane/test/d526-refusal-order.test.mjs` and `bio-plane/test/m/promotion/write-path.test.mjs` (file level "test failed", no failing arm)
- Cause: environment load. Run alone, each exits 0 (d526: 1 of 1; write-path: 6 of 6). In the batch (7 files in parallel on 4 CPUs, 21 to 24 s each), they ended "test failed" with every arm printed as passing. Not a code cause.
- Fix: none. Run these files alone or with `--test-concurrency=1`. Confidence: medium (I did not reproduce a pass of the full batch).

---

## 3. strength

### 3a. `bio-plane/test/m/strength/reads.test.mjs:50` "R6, R22: a member the viewer may not see is withheld whole ..."
- Message: `The input did not match /^connection C — /. Input: 'connection C: no stronger than the weakest connection grade it rests on, which is INQ-2026-0002-a. Listed, but not counted yet: INQ-2026-0002-a. Part of what this rests on is out of your view.'`
- Cause: word row `strength.arithmetic.no_stronger_than_the_weakest` is now "{axis} {grade}: no stronger than the weakest {axis} grade it rests on, which is {leg}{via}." (DEC-384, B411 I-23/A8). The test pins the old "—" separator. The code (`strength/arithmetic.mjs:182`) reads the row through `localize`, so the code is right.
- Owner: strength (test).
- Fix: `reads.test.mjs` line 73: change `/^connection C — /` to `/^connection C: no stronger than the weakest connection grade it rests on/`. Control kept: the next line (`detail.endsWith(word("strength.out_of_view_words"))`) and the no-leak checks. Verified on a copy: 27 of 27 pass with 3b.
- Fragile (K3268)? Yes: it copies the words' punctuation. Better: assert the start with `localize`-free structure only, i.e. `/^connection C\b/`, plus the endsWith check, which already reads the key.
- Confidence: high.

### 3b. `bio-plane/test/m/strength/vocabulary.test.mjs:118` "R28: every named member's why ... carries no analyst's word"
- Message: `AssertionError: a sub-inquiry unrated` (the corpus does not match `/INQ-2026-0007-a is UNRATED on/`).
- Cause: `strength.why.unrated_load_bearing` is now "{from} has no grade on {axis} yet, so it is not counted here"; `strength.why.undetermined` now carries the plain sentence "There is no strength for {axis} yet: ...". The test's totality list still looks for the old analyst-flavoured words. A second regex in the same list would fail next: `/INQ-2026-0008-a is undetermined on connection: this connection axis/`.
- Owner: strength (test). The code is the intended result (the whole point of the pass was removing analyst words).
- Fix: in the totality list change the two regexes to `/INQ-2026-0007-a has no grade on capture yet, so it is not counted here/` and `/INQ-2026-0008-a is undetermined on connection: There is no strength for connection yet: /`. Controls kept: `clean(corpus)` (no analyst word), the other eight totality entries. Verified passing on a copy.
- Fragile (K3268)? Yes, it copies sentence text. Better: build the expectations from `word("strength.why.unrated_load_bearing", { from, axis })` and `word("strength.why.undetermined", ...)` prefixes.
- Confidence: high.

---

## 4. agent-worker

### 4a. `agent-worker/test/requirements.test.mjs`, arms "R45: the static check finds nothing" and "R45: a fresh build is byte-identical to the committed bundle"
- Message: `STALE BUNDLE — the source ../bio-plane/src/setup-words/rows.mjs has changed since dist/agent-worker.bundled.mjs was built (source now 50aff45b..., bundle built from 4cedecef...)`; fresh build 6,617,512 B / d5124aba..., committed 6,136,446 B / 9e69c7c8....
- Cause: stale generated artifact (same as 1a). The bundle embeds the word table.
- Owner: agent-worker (`agent-worker/dist/`).
- Fix (plan entry): regenerate with `node bio-plane/scripts/bundles.mjs` and commit agent-worker's artifacts only. Test: `node --test --test-force-exit agent-worker/test/` (about 200 s; never interrupt, it runs mutating negative controls; afterwards `git status`). Control: the R45 manifest arm and the other 20 pass.
- Fragile? No.
- Confidence: high. After the run, the tree was clean.

---

## 5. case-checker

### 5a. `bio-plane/test/m/case-checker/program.test.mjs:22` "R13: the build gives the same bytes every time, and the committed program.mjs is that build"
- Message: `program.mjs is stale: run node bio-plane/src/case-checker/build-program.mjs`: committed sha256 `a4d63bc2...`, fresh build `853c172a...`.
- Cause: stale generated artifact. `program.mjs` embeds the standalone checker with the whole word table (R27); it was last regenerated 2026-10-19 23:35 (`42053533e3`), before the rows regenerations on 10-20. A rebuild in memory differs in about 2,000 diff lines, starting with word rows (for example `weight.reasoned.name` "Reasoned" became "Asks for a reason").
- Owner: case-checker (`bio-plane/src/case-checker/program.mjs`).
- Fix (plan entry): `node bio-plane/src/case-checker/build-program.mjs`, commit `program.mjs`. Test: `node --test --test-force-exit bio-plane/test/m/case-checker/` (95 of 95 expected; the other 91 pass now). Control: the same-bytes-twice arm and the self-fingerprint arm. Downstream the plane bundle is staled by it (bundles.mjs).
- Fragile? No.
- Confidence: high.

---

## 6. review (5 tests, one cause)

Cause for all five: DEC-384 (B411 L14) re-worded the draft's case-identity sentences, and the tests pin the old analyst words. The code builds the sentences through `word`/`localize` (`review/index.mjs:166-173, 560`) and is the intended result. Rows now: `review.text.next_edition_draft` ("the next edition ({edition}) of {case_id}, but this draft also asks for a new case, and publication refuses those two requests together, so which case it is stays open until one of them is withdrawn"), `review.text.new_case_whose` ("a new case, which gets its number when it is published"), `review.index.derived_case_identity` and `review.text.case_draft_name` ("a draft that does not name a case yet; which case it becomes is settled when it is published").

Owner for all: review (tests). The stale in-code English in `index.mjs:172` ("... DERIVES ... UNDETERMINED ...") is ignored when the row exists (`localize` never compares `en`), but it should be replaced by the row's sentence so the fallback does not drift (same module, same job).

Shared fix: import `word` from `../../../src/setup-words/index.mjs` and compare to the keys. All of them are fragile (K3268) in that they copy words; reading the keys removes that. Verified on copies: acts 12 of 12 and doors/zone 13 of 13 pass.

| # | Test | Message | Fix |
|---|---|---|---|
| 6a | `acts.test.mjs:154` "R5: a draft's case identity is read from the published record every time ..." | `input did not match /UNDETERMINED/ ... 'the next edition (4) of CASE-2026-0001, but this draft also asks for a new case, ...'` | Line 168: `assert.equal(both.caseIdentity, word("review.text.next_edition_draft", {edition: "4", case_id: "CASE-2026-0001"}))`; line 174: `assert.equal(derived.caseIdentity, word("review.index.derived_case_identity"))`. Keeps the four-distinct-sentences control. |
| 6b | `acts.test.mjs:179` "R6: grant's refusals in order, and a grant bound ..." | `did not match /DERIVES.*It ends when it is revoked, and when that edition is published and signed\.$/s` | Line 194: `assert.equal(g.boundTo, \`this grant reads ${word("review.index.derived_case_identity")} and nothing else. It ends when it is revoked, and when that edition is published and signed.\`)`. |
| 6c | `acts.test.mjs:366` "R5: the four identity sentences, in every answer that prints one ..." | `did not match /^the next edition \(2\) of CASE-2026-0001 — /` | Lines 395 to 408: `both` equals `word("review.text.next_edition_draft", {edition:"2", case_id:"CASE-2026-0001"})` and still matches `/refuses/` and `/stays open/`; `NEW` becomes `/gets its number/`; `fresh` equals `word("review.text.new_case_whose")`; `derived` equals `word("review.index.derived_case_identity")`; drop the `/undetermined/i` and `/minted only by publication/` assertions. Controls kept: one sentence in all five answers per draft, `CODE` regex finds no code, `derived` does not match NEW, the four are distinct, `fresh` does not say "undetermined". These later lines would have failed next (hidden by the first failure); the patched copy passes them. |
| 6d | `doors.test.mjs:124` "R19: the list of a project's drafts ..." | `did not match /DERIVES/ ... 'a draft that does not name a case yet; ...'` | Line 144: `assert.equal(d0.case.identity, word("review.index.derived_case_identity"))` (add the `word` import). |
| 6e | `zone-concluded.test.mjs:112` "R36: draft takes the chosen concluded questions ..." | `did not match /^a case this draft does not name and publication DERIVES/` | Line 122: `assert.equal(d.caseIdentity, word("review.index.derived_case_identity"))` (add the import). |

Confidence: high for all five.

---

## 7. answer-envelope (4 tests, one cause)

Tests: `catalogue-end.test.mjs:17` ("R7, R2, R10, R13: every code decorated before the catalogue's end reads the same check and translation ..."), `catalogue-end.test.mjs:80` ("R13 (T46; DEC-194 ...) C-124.30 ..."), `catalogue-end.test.mjs:124` ("R7, N1128 (K3765): a row that reads its words by key is pinned by that key's sentence ..."), and `families.test.mjs:689` ("R15, R7, R2 (T47; N908 §5; case-inputs ...)").

- Messages: `NO_REVIEW_COPY ["C-87.1","ad82e7f5959ccca1"] → ["C-87.1","98c5b7df4bccde75"]` (the other three: `NO_REVIEW_COPY ... + 98c5b7df4bccde75 - ad82e7f5959ccca1`). Only one pin differs among the 900+ codes.
- Cause: review's row C-87.1 reads `word('refusal.NO_REVIEW_COPY')` (review/checks.mjs:65), and `3f8b0d2dc8` (design B411 live walk) re-worded that key in `words.json` ("There is no review copy here for you to read. Ask the owner of the project for a new review link, ..."). The pinned digest in `rows-before-r43.json` is the old sentence's. This is a design merge of words, in the same family as the two earlier ones (N1128 pins move with the key).
- Owner: answer-envelope (`bio-plane/test/m/answer-envelope/rows-before-r43.json` and the pin note). The word is review's, merged by design, and nobody there did wrong.
- Fix (plan entry): in `rows-before-r43.json` set `rows.NO_REVIEW_COPY` to `["C-87.1","98c5b7df4bccde75"]` and append one sentence to `changed.note` naming the cause: review's C-87.1 NO_REVIEW_COPY re-pinned to the words its row reads by key (refusal.NO_REVIEW_COPY, words.json, design B411 live walk `3f8b0d2dc8`, ruling to be cited by BOB). Test: `node --test --test-force-exit bio-plane/test/m/answer-envelope/` (all four go green; verified on a copy: 4 of 4 for catalogue-end; families.test uses the same file). Controls kept: the "old pin would be seen" negative controls and the 70-keyed-rows floor.
- Fragile? Partly. The snapshot approach is deliberate (a pin moves with a re-word under a ruling), but every design re-word of a key-read refusal turns it red. A cheaper long-term form: skip the digest compare for rows whose translation equals their `refusal.<CODE>` key (test 3 already proves these are tied to the key), and keep digests only for inline rows. Suggest BOB's decision, not needed now.
- Confidence: high.

---

## Summary by cause

- Stale generated artifact (rows.mjs changed): ocr-worker 1a, agent-worker 4a, case-checker 5a. Fix: regenerate in each owner.
- Test copies words that design merged: strength 3a, 3b; review 6a to 6e; answer-envelope 7 (a pin). Fix: in the owner's tests.
- Census pin unstamped for four design re-words: promotion 2a.
- Environment: ocr probe 1b (network, python, engine noise), promotion batch files 2b (parallel load; green alone).
