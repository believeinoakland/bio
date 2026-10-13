# conformance (T47)

**Status** · session_01NR4xupHUaVCnuPH6iymd1X · depth 2 · WORKING · handled B2

## J1 · QUESTION

Entry T47-34, second part (N995, K3038): `edition_date`.

`case-import` R4 (and its code as T46 built it) answers no date of the source edition: per edition only `imported_at`/`imported_by` (this copy's import instant, not the edition's date), `group_fields` (no date but `read_at` and `domain_verified_at`) and R19's publisher facts. So nothing in R4 names the edition's date.

My best reading, which I am building on: **the read is removed**. `conformance` no longer reads `edition_date` from `importedCase` (from the edition or from `group_fields`). The key stays in R32's `basis` shape and always answers `edition_date: null`, because R32 names it and `actions` R75 and `filings` read it (`b.edition_date ?? null`, printing "a date not stated"). `imported_at` is not used in its place. A test asserts it is null even when `importedCase` answers a field named `edition_date`.

The requirement text that would match is BOB's: R32's "`edition_date`, ... read from `case-import.importedCase` ... where it records them" would say that `edition_date` is null because no source records it. If you would rather the key were dropped from the shape, say so and I will drop it.

Also, for R39, not a question: the read of `importedCase` now passes the reading viewer. The old code passed `viewer: null`, which case-import R4 answers as a non-member ("no such edition"), so identity and stake were always unrecorded in the composed plane. The stand-in now follows R4's viewer rule.

## Completion (CONFORMANCE #21, T47-34)

**How the reading set was read (mechanics §17; BOB's START measured it at 1051 KB).** Read whole myself: `build/requirements/conformance.md` (both parts); the module's code, `index.mjs`, `checks.mjs` and `schema.mjs` (P20); the tests `t45.test.mjs` and `fixture.mjs`; layer 9's contract in `build/layers.md`; my plan entry T47-34 with N951, N995 and K3038; and `case-import` R4's public text, with the parts of `case-import/index.mjs` that answer `importedCase` (`#editionsOf`, `#groupFields`, `#editionView`, `#isActiveMember`, `#watchFacts`), to state R39 against R4 as T46 built it. A helper in my session read the other twelve test files whole (`act-event`, `contradiction-cause`, `dec149`, `determine`, `helpers`, `purpose`, `reads`, `record`, `t35`, `t36`, `t37`, `t46-words`) and wrote me a digest citing each test. The sources stay binding.

**Entries applied (T47-34).**
- (N951) **R39**: R32's `identity` and `stake` are mapped field by field from the `group_fields` `case-import.importedCase` answers for the accepted edition. `identity` is `{group, name, domain, domain_verified_at, read_at}`, labelled `identity_label` (`SOURCE_DECLARATION_SAYS`: the source's declaration when read at import, never as of the edition's signing). `stake` is `group_fields.stake` as answered (`null` stays `null`; a stake not answered at all reads `"undetermined"`, never `null`). `group_fields: null`, an edition not answered, an answer for another edition, a read that throws, or a reader case-import does not answer each read `identity: null, stake: "undetermined"` with `identity_says` (`SOURCE_FACTS_UNRECORDED`). No `identity` key is taken from the answer, and nothing is composed.
- **Fixed with it:** the read now passes the reading viewer. The old code asked `importedCase` with `viewer: null`, which case-import R4 answers as a non-member, so in the composed plane identity and stake always read unrecorded. The fixture's stand-in hid this, and now follows R4's viewer rule. The read is made only by `determinationRead` (R9), memoised per import, edition and viewer. A list (R11), which answers no basis, reads none.
- (N995, K3038; J1, answered B2 / K3121) **`edition_date`**: the read is removed. The key stays in R32's `basis` and is always `null`; `imported_at` is never put in its place. Tested.

**Fixed in my own tests (P8).** `dec149`'s member-sentence list now holds the T35/T45/T47 sentences (`ACCEPTED_SAYS`, `SOURCE_FACTS_UNRECORDED`, `SOURCE_DECLARATION_SAYS`, `VOID_SAYS`, `BELOW_BENCHMARK`, `BINDS_NOT_READ`, `MEASURE_SAYS`, `determinationVoided`'s detail). The helper had found the list incomplete.

**Deferred, BOB's (words).** C-113.6 `NO_FINDINGS`'s translation still says "at least one published finding", while R2 and R14 (T45) accept three kinds. It is a catalogue row's words, BOB's draft and the UX stream's to revise, and it needs a promotion stamp. I left it unchanged so that no row changes outside a stamp. Also R39's one sentence for an unread import says the facts "were not recorded at import". That is also its answer when the import could not be read, or to a reader case-import does not answer. The wording is R39's own; BOB may want a second sentence.

**Found in other modules.** None needing a REPORT. Notes:
- `filings`' `identityWords` (outward.mjs) already reads `identity` as an object (name, domain), so it fits R39.
- It prints a stake with `String(d.stake)`, which would print "[object Object]" for a structured stake. Its R35 owns that if `public-read` R34's stake is ever an object.
- `action-replies`' tests have 6 failures, and the same 6 fail on `tranche/T47` without this job: R3 ×3, R8 ×1, R7 ×2 (case-authoring R70's registration, words.json rows). That module's own L9 job owns them.

**Tests and checks run.**
- `node --test bio-plane/test/m/conformance/`: tests 114, pass 114, fail 0 (after merging `tranche/T47` at B2).
- The modules that use conformance (`actions`, `filings`, `consequences`, `escalation`, `action-plans`, `action-clocks`, `action-replies`, `plan-work`, `action-holds`): tests 621, pass 614, fail 6. All 6 are in `action-replies` and fail identically on `tranche/T47` (6/23 there).
- `checks/format.mjs`: 168 modules, 167 requirements files; 0 failures.
- `checks/architecture.mjs bio conformance`: 18 product files, 74 relative imports; 0 failures.
- `checks/coverage.mjs bio conformance`: 39 of 39 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bio conformance tranche/T47`: 6 files changed; 0 failures.
- `checks/run.mjs`: format 0, architecture 0 (none in my files), channels 0. Coverage has 36 failures, all in other modules (screens-*, setup-words, signin-door, tasks, wizard-scripts); none is conformance's.

Size (session_01NR4xupHUaVCnuPH6iymd1X): test runs 7, module lines 2770
