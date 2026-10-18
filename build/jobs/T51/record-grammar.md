# record-grammar (T51)

**Status** · session_011VXhNRgAkPtLh1zWD7xHc3 · depth 2 · WORKING · handled B0

## J1 · COMPLETE

T51-1 · record-grammar: done.

**Entries applied.** T51-1 (stale comments):
- `bio-plane/src/record-grammar/labels.mjs`:290–292: the reference to `civicos-ui/app.html` (deleted in T51-126) is now "a surface that renders `Asserted by ${…}` verbatim is one field over from it"; the word TODAY is gone.
- `bio-plane/src/record-grammar/titles.mjs`:12–14: "the setup page embeds this function's source verbatim" (the setup page was deleted at T47-74) is now "its source text, evaluated alone, gives the same answers, so a client that embeds it cannot drift from the store (R30)".
- A sweep of the module's code and tests for `civicos-ui`, "setup page", `app.html` and TODAY found nothing else. No behaviour change.

**Deferred.** Nothing.

**Found in other modules.** Coverage, not this module's: `checks/coverage.mjs` names three live ids with no test: agent-harness R17, agent-runner R36, R37, R38, R40, journey-check R19. Those belong to their own jobs; I changed none of them. The Requirements file of record-grammar still says "instance-setup embeds it verbatim" in R30. It is a requirement, so I left it for BOB: the sentence describes a present embedder that the code no longer has (no caller embeds it today).

**Tests and checks.**
- `node --test bio-plane/test/m/record-grammar/`: 101 pass, 0 fail.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage 3 failures, all in other modules (above); channels 0 failures.
- `node checks/ownership.mjs /home/user/bio record-grammar tranche/T51 job/T51/record-grammar`: 1 file changed by record-grammar, 0 failures.

Size (session_01MURMfVW6xakigf2Z7K2GRE): test runs 1, module lines 2618

## J2 · COMPLETE

T51-171 · record-grammar: done (commit ef5ec79af7 on job/T51/record-grammar).

**Entries applied.** T51-171, the words pass: the nine findings of `checks/words.mjs` (`build/plan/words-pass/record-grammar.md`), each fixed by the words rule.
- `bio-plane/src/record-grammar/bundle.mjs`:194 (inline): the C-2.5 refusal "schema stamp … is not of the form <type>@<n>" was a template string. It is now `localize('record-grammar.bundle.schema_stamp_form', …)` with `{schema}` filled. The English is unchanged; the list wins once BOB regenerates the rows.
- `bio-plane/test/m/record-grammar/labels.test.mjs`:284–291 (eight testcopy findings): the copied sentences `NO_BASIS_T` and `NO_CITATION_T` are removed. The R29 test now compares each `translation` of `SHARED_ACT_CHECKS` with `word('refusal.NO_BASIS')` and `word('refusal.NO_CITATION')`, both rows present in `words.json`. The test imports `word` from setup-words.
- `bio-plane/test/m/record-grammar/bundle.test.mjs` (appended): a test naming `record-grammar.bundle.schema_stamp_form`. A malformed stamp (`information1`) raises exactly one C-2.5 that names it; a well-formed `information@1` raises none.

**Choices I made.** The new id is a code-origin row, so it will appear in `words-unreviewed.json` at the next regeneration for the design stream's review. No string was judged as one no member reads, so nothing is listed for a REPORT.

**Deferred.** Nothing.

**Found in other modules.** Nothing new in this module's code. On the whole-tree run, the words check reports failures in other modules (wizard-scripts test copies and similar; 2,812 in all) and coverage reports 33 failures; none is in record-grammar. Not this job's, and not touched.

**Tests and checks** (run from `civicos-process` against `/home/user/bio`):
- `node --test bio-plane/test/m/record-grammar/`: 102 pass, 0 fail.
- `node checks/words.mjs /home/user/bio record-grammar`: 0 failures (was 9).
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio record-grammar`: 0 failures.
- `node checks/coverage.mjs /home/user/bio record-grammar`: 61 of 61 live ids named by a test, 0 failures.
- `node checks/ownership.mjs /home/user/bio record-grammar tranche/T51 job/T51/record-grammar`: 4 files changed by record-grammar (the three code files and this record), 0 failures.
- `node checks/run.mjs /home/user/bio` (whole tree): format 0, architecture 0, channels 0; words and coverage failures only in other modules (above).

Size (session_011VXhNRgAkPtLh1zWD7xHc3): test runs 2, module lines 4595
