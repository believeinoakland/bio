# filing-templates (T50)

**Status** · session_01WzaSmrRQDqba6v379sWLsz · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied (T50-39, N1130; BOB's note 1: R33 by key, rule 6's second and third items).**
- **R33 by key.** `RFC_QUOTING_SENTENCE` is now `word("filing-templates.rfc_quoting_sentence")`, and the C-115.47 row's translation is `word("refusal.RFC_QUOTING_MISSING")` through `FILING_TEMPLATES_WORDS` (setup-words, layer 1). Both keys are in `words.json` (DEC-260) and in setup-words' generated `rows.mjs`, and `words-reads.json` already lists them for this module. The strings are identical to the pinned texts, so no row, sentence, code or `where` moved.
- **Tests, changed to match the by-key source.** `r33.test.mjs`: the first test pinned the DEC-234 withdrawal (words.json holds neither key); it now pins the two keys' texts in `words.json` against the module's constants. The row's message reads "read by key". `t46-words.test.mjs`: adds one assertion that the RFC word equals `en("refusal.RFC_QUOTING_MISSING")`; its key list and every other pin are unchanged.
- **Rule 6, second item ("labeled").** Nothing applied: this module's member-facing words hold no "labelled". The word appears only in code comments and test titles, which are not member-facing.
- **Rule 6, third item (N1073).** `fixture.mjs` `PROFILE_IDS` was a hand-written list of the test profile's five templates, a jurisdictions declaration. It now reads them from `jurisdictions.get(TEST)` (each kind's `template` and `templates`). The rest of the module's tests name only its own rows (C-115.31–.38, .45–.46, C-125.x) and its own ops; no other foreign list is held.

**Deferred.**
- **Rule 6, first item (N1116), not done:** it is not a Haiku item (BOB's note 1). `checks.mjs` still holds 44 inline translations, and `FILING_TEMPLATES_WORDS["refusal.TEMPLATE_NOT_REVIEWED"]` is a copy of `words.json`'s sentence, where R29 says "never a copy". Inline refusal text in `index.mjs` was not counted. Needs a Sonnet job or BOB's routing.

**Reports to BOB (not my decisions to make; no change made for them).**
1. **R33's text conflicts with DEC-260.** R33 says the sentence "is not read from `words.json`" and the row's word is "declared in this module, no longer in `words.json`". Both keys are now in `words.json`, and this job reads them by key, which BOB's note asks for. The R33 text needs BOB's update. The consequence to decide: the sentence is a live word, so an edit to `filing-templates.rfc_quoting_sentence` in `words.json` would refuse every request already prepared (K2953). Options: keep by key with the pin test (done here), or keep a module constant with a test that the key agrees.
2. **The refusal's `key` field.** `rfcQuotingRefusal` still answers `key: "rfc.quoting"`, a key withdrawn from `words.json` (DEC-234); the sentence's key is now `filing-templates.rfc_quoting_sentence`. The r33 test pins `rfc.quoting`, so I left it. A screen that looks `key` up through `word()` would get UNKNOWN_WORD. BOB to rule which key the field names.
3. **Ruling for `build/rulings.md`** (outside my write set, so not written by me; BOB to number it): "filing-templates reads the RFC sentence and the row's word by key from `words.json` (DEC-260), text unchanged; R33's text to follow BOB's update."
4. **Reds in other modules, not mine, identical before and after this change:** `filings` (3 failures, R23, R51, R52: "group"/"team" wording and the RFC row's neighbours) and `action-producers` (3 failures, R24: queue words). Measured against the unmodified tree by stash: 6 failures on the base, the same 6 with the change. The product-wide `checks/run.mjs` reports 30 coverage failures, all in other modules' ids.

**Checks** (from the process repository, run over `/home/user/bio`):
- `checks/format.mjs /home/user/bio`: `format: 171 modules, 170 requirements files; 0 failures`
- `checks/architecture.mjs /home/user/bio filing-templates`: `architecture: 17 product files, 52 relative imports (0 naming no tracked file, not judged); 0 failures`
- `checks/coverage.mjs /home/user/bio filing-templates`: `coverage: 1 modules, 33 of 33 live requirement ids named by a test; 0 failures`
- `checks/ownership.mjs /home/user/bio filing-templates tranche/T50`: run after the commit below (see the entry's COMPLETE body)
- `checks/run.mjs /home/user/bio`: architecture `0 failures` over 3,479 product files; coverage `5691 of 5848`, 30 failures, none in filing-templates; channels `0 failures`.

**Tests** (`bio-plane`, `node --test`):
- `test/m/filing-templates/`: `tests 79, pass 79, fail 0`
- `test/m/wizard-scripts/`: `tests 97, pass 97, fail 0`
- `test/m/filings/`: `tests 113, pass 110, fail 3`, and `test/m/action-producers/`: `tests 53, pass 50, fail 3`; the same six fail on the unmodified tree (report 4).

Size (session_01WzaSmrRQDqba6v379sWLsz): test runs 11, module lines 1922

## J1 · COMPLETE

COMPLETE: T50-39 (R33 by key; rule 6 items 2 and 3). Module tests 79/79 pass; wizard-scripts 97/97; filings and action-producers fail the same 6 as the base tree (reported). Checks: format, architecture (module and product), coverage (filing-templates 33/33) and ownership pass. Commit d24b948dcf pushed to job/T50/filing-templates. Reports for BOB, in the record's Completion section: (1) R33's text conflicts with DEC-260 and needs your update, plus the live-word consequence; (2) the refusal's key field still names rfc.quoting; (3) a rulings line for you to number; (4) the other modules' reds, unchanged; N1116 (rule 6 item 1) deferred, not a Haiku item.

**CHANGE (B2, BOB #205, K3739) applied.** `tranche/T50` merged into the job branch. `rfcQuotingRefusal`'s `key` field now names the sentence's current key, `filing-templates.rfc_quoting_sentence`, read from one constant that also feeds the sentence's own `word()` lookup, so the two cannot drift. The r33 test pins that key on both answers (the direct refusal and the profile read, R33), beside the by-key pin and the sentence's text. Module tests: 79 of 79 pass. Checks: format, architecture (module), coverage (33 of 33) and ownership pass; ownership run after the commit below.

Size line above updated for this change.

## J2 · COMPLETE

COMPLETE again after CHANGE B2 (J2). Merged tranche/T50 (K3739 in place). rfcQuotingRefusal's key field now names filing-templates.rfc_quoting_sentence, from one constant that also feeds the sentence's word() lookup; the r33 test pins it on the direct refusal and on the profile read, beside the by-key pin and the sentence's text. Module tests 79/79 pass. format, architecture (module), coverage (33 of 33) and ownership pass. Commit 03d7d647ac pushed to job/T50/filing-templates; the record's Completion section carries the B2 note and Size line (test runs 11, module lines 1922).
