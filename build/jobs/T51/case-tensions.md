# case-tensions (T51)

**Status** · session_01TSmueyvUPtNYuxRUg58uBu · depth 2 · WORKING · handled B2

## Completion (T51-229: the words findings)

**Entries applied.** T51-229, the findings of `build/plan/words-pass/case-tensions.md`: the 3 `plain` findings (`index.mjs`), the test copy of the C-92.13 translation (`attribution.test.mjs:68`, with its second line at :69) and the part copy in `fixture.mjs:103`. The words check on this module reported 5 failures on tranche/T51, and this job fixed all of them. In the same words rule, I also converted the test regexes that hold a sentence with a words row (`attribution.test.mjs`, `tensions.test.mjs:55`), which the check does not count.

**Product changes (`bio-plane/src/case-tensions/index.mjs`).** Every sentence a member reads now goes through `localize('case-tensions.index.<slug>', en, vars)`, including the sentences the check does not count (K3964): `NO_PROVIDER` (the reason an undetermined relation gives), "this call carries nobody", "no level was chosen" (an interpolated template), "give the reason you choose this level", "the reason is blank", and the `ATTRIBUTION_NAME_NO_HANDLE` detail. Refusal translations were already `word(...)` rows in `checks.mjs`; no change there.

**Test changes (`bio-plane/test/m/case-tensions/`).**
- `attribution.test.mjs`: the C-92.13 translation is compared with `word('refusal.ATTRIBUTION_NO_REASON')`; the regex checks on `case_document_carries`, `author_chosen_level`, `author_chose_edition` (with `level3` = handle), `ATTRIBUTION_NOT_AN_OBSERVATION` and `ATTRIBUTION_NOT_THE_AUTHOR` are equality checks with `word()`.
- `fixture.mjs`: the publication stand-in's "this case document is signed" is `word('publication.why.case_document_signed')`.
- `tensions.test.mjs`: `/No strength is composed/` is `word('case-tensions.says.contradiction_found_published')`.

**Deferred, and why.**
- `relation.test.mjs`, two assertions: the undetermined reason (`NO_PROVIDER`, `/publication provider/`) and the revision-flag doctrine (`/SET AND NEVER CLEARED/`) are `localize` text with no `words.json` row, so a test cannot compare them by key (a test copy of the `en` is itself a finding). They now assert the value is stated, not its wording. Restoring the wording check needs a `words.json` row for each (the design stream's file). See REPORT.

**Other modules.** None found from this job's reads. Note: `checks/run.mjs` reports 2,260 words failures and 25 coverage failures across other modules, none in `case-tensions`.

**Checks and tests** (module at `job/T51/case-tensions` after the merge of `tranche/T51` at 6437fd791d; the merge touched no file of this module):
- `node --test bio-plane/test/m/case-tensions/`: 23 pass, 0 fail.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs case-tensions`: 0 failures (8 files). `checks/coverage.mjs case-tensions`: 11 of 11 live requirement ids named by a test, 0 failures.
- `checks/words.mjs case-tensions`: 0 failures (was 5).
- `checks/run.mjs /home/user/bio`: exit 1 from other modules (above); no `case-tensions` line.
- `setup-words/build.mjs --check`: the stale-rows note, expected: the new `localize` ids are not yet in `rows.mjs` (BOB regenerates it at the layer close). No refusal names this module.
- `checks/ownership.mjs /home/user/bio case-tensions tranche/T51 job/T51/case-tensions`: see the COMPLETE entry.

Size (session_01BXkX7UvYkvSAS5FNme8396): test runs 2, module lines 972 (`bio-plane/src/case-tensions/*.mjs`).

## J1 · REPORT

Two test assertions in bio-plane/test/m/case-tensions/relation.test.mjs cannot be compared by key yet, so they assert presence only (the value is stated), not wording:
1. R1, undetermined reason: NO_PROVIDER, "no module has registered the publication provider, so this module reads no case". It is localize text (case-tensions.index.no_module_has_registered) with no words.json row.
2. R2/R3 flag doctrine: "a revision flag is SET AND NEVER CLEARED ...", localize text (case-tensions.index.a_revision_flag_is_set), no words.json row.
A test may not copy the en of a localize call (the testcopy check, tag code), so the wording check needs a words.json row for each id. That file is the design stream's. Bob, please decide: add rows for the two ids (then this job, or a later one, compares them with word()), or accept presence-only here. The rows are not added by this job.

## J2 · COMPLETE

T51-229 (case-tensions, words) is done on job/T51/case-tensions at b991d71be9.
- Words check on case-tensions: 0 failures (was 5). Module tests 23/23. format, architecture, coverage (11 of 11), ownership: 0 failures.
- Product: every member-read sentence in index.mjs goes through localize('case-tensions.index.<slug>'), including the ones the check does not count (K3964): NO_PROVIDER, the no-level template, the reason details, the name-without-handle detail.
- Tests compare by key (word) where a words row exists: the C-92.13 translation, the why/says rows, the publication stand-in's "signed" reason.
- Deferred, see REPORT: two localize-only texts in relation.test.mjs (R1 reason, R2/R3 doctrine) assert presence only until the design stream adds words rows.
- Other modules: none found in my reads. checks/run.mjs from the process repo exits 1 on other modules (2,260 words failures, 25 coverage failures); none is in case-tensions.
- setup-words --check: stale-rows note only (expected; BOB regenerates rows.mjs at the layer close).
Size (session_01BXkX7UvYkvSAS5FNme8396): test runs 2, module lines 972.
