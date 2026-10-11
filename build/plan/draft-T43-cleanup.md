<!-- DRAFT for BOB, uncommitted, 2026-10-11, on tranche/T42 (T42-28, -29, -30 not merged yet). -->
# Draft: T43's clean-up entries (N849, N850, N851, N854, N857, N860, N863, N864, N853)

## 0. Order in L3 (N849, N851, N863, N864 together)

**The constraint.** `doorbell/checks.mjs` imports its rows from `../capture/checks.mjs`, so capture's delete merging first breaks doorbell and the plane. Doorbell R25's held arm must stay until capture's six tables leave `CAPTURE_EXEMPT_TABLES`, or doorbell throws `TABLE_DECLARED`.

**Recommended L3 order (three merges):**
1. **T43-a doorbell:** the rows become its own (N851's half). R25's tests are written to doorbell's ownership. The call and the held arm stay in the code.
2. **T43-b capture:** N849's delete, rows included. Also N863 and N864's R87.
3. **T43-c doorbell:** drops the `capture.declareTables()` call and the held arm (R25's text).

Between 1 and 2 the rows are defined twice and R25's ownership arm is red; both clear at 2.

From 2 until answer-envelope's L11 job, doorbell's family is missing from `CHECK_FAMILY_FILES`. That turns R7's totality and pinned-row tests red, a **new accepted red**. Doorbell's refusals still carry their rows (R4–R8).

## N849 · capture: delete the doorbell copy

**(a) Module:** capture (L3).

**(b) Requirement lines.**
- Status, last sentence: "… by copy, its ids retired here; the copy deleted in T43 (T43-b; N849; K625, K2607)."
- R37, append: "C-85.1–C-85.5 and C-118.2, .3, .4, .7 are defined in `doorbell`'s table alone; this module's table holds none of them (T43; N849, N851; K2609)." *(not yet met: T43)*
- No other line changes: the twenty ids are already retired.

**(c) Tests.**
- `knocker.test.mjs`:210–250 (R37): the moved rows absent, `KNOCK_CHECKS` gone; control: capture's six rows present.
- `evidence-absent.test.mjs`:26–27: the key list loses the four codes.
- `t42.test.mjs`: see N864.
- `plane.test.mjs`:67–75 is carried out by T42-30. If it is still in capture's tree, it is deleted here.
- Clears T42 rule 4 (9), together with T43-a's tests.

**(d) Dependencies:**
- T42-28 (store-door's `inboxpullfile` still calls `pullAndFile({capture})`, `dispatch.mjs`:444);
- T42-30 (`plane/door.mjs`:16 still imports `capture/doorbell.mjs`; `store.mjs`:583);
- T43-a merged first.

**(e) Doubt:** none.

**(f) Doable** once T42 closes with T42-28 and T42-30 merged. If either slips, the delete is held (hard reason: the order).

## N851 · doorbell, answer-envelope: the rows move physically

**(a) Modules:** doorbell (L3) defines the rows; answer-envelope (L11) reads the file.

**(b) Requirement lines.**
- doorbell R21, strike the last sentence ("(K2609) Until `capture`'s delete … no row is held twice.") and append: "The rows are defined in `src/doorbell/checks.mjs` alone (T43; N851; K2609)." *(not yet met: T43)*
- doorbell Suggestions: strike "In the window …".
- answer-envelope, new:
  - **R12** (T43; N851; K2609; R2, R7) `CHECK_FAMILY_FILES` lists `src/doorbell/checks.mjs` (`DOORBELL_CHECKS`, `KNOCK_CHECKS`) directly after `src/capture/checks.mjs` and before `src/file-safety/checks.mjs`, its place in `build/modules.json`. C-85.1–C-85.5 and C-118.2, .3, .4, .7 decorate with the same `code`, `check` and `translation` as R7 pins, read from doorbell's family. *(not yet met: T43)*
- answer-envelope Uses gains `doorbell`. The `modules.json` edge answer-envelope → doorbell is BOB's edit at the opening.

**(c) Tests.**
- `doorbell/rows.test.mjs`:22–36: drop "the one row, not a copy" (:26) and :31 (`KNOCK_CHECKS === CAPTURE.KNOCK_CHECKS`). Add a check that `capture/checks.mjs` holds none of the nine.
- `answer-envelope/families.test.mjs`:353: file-safety follows doorbell, no longer capture. Add R12's arm, with a negative control: the list without doorbell's file misses C-85.
- Row census: nine rows change home, stamped at T43's promotion job.

**(d) Dependencies:** T43-a precedes N849. Answer-envelope's job in L11 clears the new red named in §0.

**(e) Doubt:** answer-envelope is L11, so the red window from L3 to L11 cannot be avoided. Keeping the re-export one more tranche would move the whole delete to T44. *Reading:* accept the red by name.

**(f) Doable.**

## N863 · capture: `captureOf` and `acquisition`

**(a) Module:** capture (L3).

**(b) Requirement line.** R58, append: "(T43; N863; K2672) A later call that supplies no option reaches no other module's instance and creates no table: an option is compared only when the caller supplies it." *(not yet met: T43)*

**(c) Tests.** Add a capture arm in a new `t43.test.mjs`:
- `captureOf(ctx)` twice on a host whose acquisition was never reached: the table list is the same before and after, and `acquisition`'s `archive_entries` and `unpack_days` are absent.
- Control: a different `acquisition` supplied still throws R58.

The code fix is `index.mjs`:264–265: read `c.acquisition` only when `opts.acquisition != null`. No accepted red; rule 4 (14) was already cleared by a fixture.

**(d) Dependencies:** with T43-b.

**(e) Doubt:** none.

**(f) Doable.**

## N864 · doorbell R25, capture R87: undeclared, uncreated tables

**Choice: the second fix.** Capture's `declareTables` declares its tables only when they exist.

*Why not the first.* `doorbellOf` is reached lazily inside `sources`' reads (K2643): capture's `migrate()` there runs all its DDL, `CAPTURE_RESHAPE`'s `DROP TABLE` included, inside a caller's transaction, the fault N863 removes.

*Why the second.* It fixes the fault where it lies (absent tables declared); after N849 doorbell needs capture's call no longer.

**(a) Modules:** capture (L3), doorbell (L3).

**(b) Requirement lines.**
- capture R87, replace with: **R87** (T42; K2629; T43, N864, K2680) `declareTables()` declares capture's tables to `record-core` (R74's purge declarations) once per storage, and only when every one of them exists in the storage, as after `migrate`. Before that it declares none and answers `{ok: true, module: "capture", declared: false}`. Once they are declared it answers the same `declared: true` answer on every later call, never throwing for a table it already holds. *(not yet met: T43)*
- doorbell R25 (T43-c), strike "(K2629) Before declaring its own tables it calls `capture.declareTables()` (`capture` R87), so capture's declaration is always first and the held arm is the one taken, in whatever order a host builds the two."
- doorbell R25, replace the held-arm sentence with: "Any refusal of the declaration throws, naming the table, before the caller gets an instance; since `capture`'s delete (T43; N849, N864; K2680) no other module declares these tables." *(not yet met: T43)*

**What doorbell's job must change.**
- In code: drop the call (`index.mjs`:168) and the held arm (:170).
- In tests, `instance.test.mjs`:
  - :46 and :53 expect `["doorbell", "exempt"]`;
  - :48–53 (doorbell built before capture's migrate) assert that capture's migrate then declares capture's own tables without throwing;
  - :76–77's "capture's TABLE_DECLARED is held" becomes a throw.

The ownership arm then holds, as rule 4 (9) expected.

**(c) Tests.**
- capture `t42.test.mjs`:
  - :23–35 becomes "before migrate: none declared, `declared: false`; after: every table";
  - :41–43 uses a table still capture's (`task_queue`), since `inbox` leaves its lists.
- action-clocks `overdue.test.mjs`:151 and action-plans `invariants.test.mjs`:50 go green with no edit. Clears rule 4 (17) at T43-b.

**(d) Dependencies:** T43-b after T43-a, and T43-c after T43-b (§0).

**(e) Doubt:** after T43-b, doorbell's call to `capture.declareTables()` is harmless until T43-c removes it.

**(f) Doable.**

## N850 · case-authoring: delete the three pass-throughs

**(a) Module:** case-authoring (L8).

**(b) Requirement lines.**
- R69: strike its last paragraph ("Until T43 (N850; …) and T43 deletes them.") and append: "(T43; N850; K2608) This module answers none of `accountPropose`, `accountDrafts` or `registerReviewComments`; they are `case-account`'s alone." *(not yet met: T43)*
- Uses (line 85): strike "R69's three pass-throughs until T43 (N850)".
- case-account (wording, no id): Uses line 91 strikes "and keeps three one-line pass-throughs … until T43 (N850)"; Suggestion R7 (:111) strikes the pass-through clause.

**(c) Tests.** `case-authoring/account.test.mjs`:
- :168–193, 205, 244, 247, 262, 266, 269, 319–321, 351 and 475 move from `w.ca.` to `w.cacc.`;
- :475–481 (the pass-through equivalence) is deleted, leaving a check that `w.ca.accountPropose` is undefined.

No accepted red is cleared.

**(d) Dependencies:**
- T42-29 (`control-plane/owner-ops.mjs`:37–38 still calls `of.caseAuthoring()`);
- T42-30;
- review is already re-pointed (`review/index.mjs`:980).

**(e) Doubt:** none.

**(f) Doable** once T42-29 and T42-30 merge.

## N854 · promotion R38: one judgment for C-1.1 and C-2.1

**The difference:** C-1.1 at the door (`promotion/index.mjs`:694) trims (`String(id).trim()`); the catalogue (`bundle.mjs`:98) compares a string id strictly. C-2.1 at the door refuses only `data === null`; `parseFrontmatter` also raises C-2.1 for duplicate keys, indentation and off-grammar lines, which return data.

**(a) Modules:** record-grammar (L1) adds a share; promotion (L2) does the work.

**(b) Requirement lines.**
- record-grammar, new: **R56** (T43; N854; K231, K2625) `idDisagrees(fm, folderName)` answers whether `checkIdentity`'s C-1.1 arm (R40) refuses that front matter filed under `folderName`: true exactly when `fm.id` is a string not equal, byte for byte, to `folderName`. It is the one function `checkBundle` and the write door both run. *(not yet met: T43)*
- promotion R38, append: "(T43; N854; K2625) C-1.1 and C-2.1 are judged at the door by `record-grammar`'s arms: a non-replay creation or revision is refused `BUNDLE_ID_DISAGREES` exactly when `record-grammar.idDisagrees(fm, bundleId)` is true (an id differing only by surrounding white space is refused; a non-string id is C-1.2's, not refused here); a revision's `bundle.md` is refused `BUNDLE_MD_UNREADABLE` whenever `parseFrontmatter` answers any C-2.1 finding, not only when it answers no data." *(not yet met: T43)*

**(c) Tests:**
- `promotion/write-path.test.mjs`:137, 144, 223–225;
- `promote.test.mjs`:291–292, 360–364, 592;
- `registry.test.mjs`:163 gains both arms: a padded id refused, and a duplicate-key front matter refused, each with a negative control (an exact id passes, a clean front matter passes);
- the users' suites (`d526-refusal-order`, then every module that calls `promote`).

**(d) Dependencies:** record-grammar's T43 job (with N857) before promotion's (L1 before L2).

**(e) Doubt:** this changes which promotions are refused (stricter). The job first reads, over the store and the fixtures, which held bundles would now be refused on their next revision, and reports them. *Reading:* this is BOB's, not Bob's. R38 already states the rule, so this meets R38 rather than changing it.

**(f) Doable.** L2 opens again in T43.

## N857 · record-grammar R29: every `NO_BASIS` site

**(a) Module:** record-grammar (L1).

**(b) Requirement line.** R29, replace its last sentence with: "(N827, K2467; T43, N857, K2643) C-33.40's `where` names every site that raises `NO_BASIS`: inquiry's `actNoBasis` (basis-versions through it), progressions' `refusal`, entities' `actShapeRefusal`, money's `refusal` (`setFundType`) and lines' `noBasis` (`recordLine`'s basis forms); the row change is stamped with the census." *(not yet met: T43)*

**(c) Tests.** A new record-grammar test pins the five sites (none does today); census stamp at T43's promotion.

**(d) Dependencies:** none. It shares a job with N854's R56.

**(e) Doubt:** none.

**(f) Doable.**

## N860 · bundler: agent-worker's 26 inputs

**(a) Module:** bundler (L1).

**(b) Tests and code only, no requirement change.** The pin is a fixture of the committed manifest. No requirement counts inputs.

**(c) Tests.** `fleetbundles.test.mjs`:248 "25" → "26"; the list (:250–261) gains `src/transcribe.mjs` (RE-PINNED, N860, K2650). The committed manifest holds 26 (checked). Clears rule 4 (15).

**(d) Dependencies:** none.

**(e) Doubt:** none.

**(f) Doable.**

## N853 · extraction, reading-pipeline: picture files and refusals

**Doubt 3 (refusals): doable in T43.**

**(a) Modules:** reading-pipeline, then extraction (both L4).

**(b) Requirement lines.**
- reading-pipeline R29, append: "(T43; N853; K2611) When the paying account or its limits refuse (`credentials.accountFor`'s or `useCheck`'s answer, `NO_ACCOUNT`, `AI_USE_SWITCHED_OFF`, `AI_LIMIT_REACHED`, `GROUP_KEY_NOTICE_DUE` among them), `tier4Extend` answers that refusal as given in `aiRefusal`, beside `aiNote`, and fills nothing; every other stop is `aiNote` alone." *(not yet met: T43)*
- extraction R71, append: "(T43; N853) A `tier4Extend` answer carrying `aiRefusal` is answered as that refusal (`ok: false`, its code, check and translation, the status the door gives a refusal), never as 200 with `performed: false`; nothing is written." *(not yet met: T43)*

**(c) Tests:**
- reading-pipeline: the tier 4 tests, with a stub `accountFor` answering `NO_ACCOUNT` and a stub `useCheck` answering `AI_LIMIT_REACHED`, each giving `aiRefusal` (control: a declining AI gives `aiNote` only);
- extraction: the `pageTranscribe` tests, where `NO_ACCOUNT` gives `ok: false` with nothing written (control: no page left still gives 200 with `performed: false`).

**(d) Dependencies:** reading-pipeline before extraction.

**Doubt 4 (a page captured as an image file).**

**Not ready.** `formats.mjs` registers no image format. An image capture has no reading, so R71 answers `REEXTRACT_NOT_READ`. Making it work needs a chain that has not been drafted:
- `format-registry` (L1): an image entry read as one page with no text layer;
- possibly `ocr-worker` (L1, tier 3 over an image);
- `reading-pipeline` and `extraction` (L4);
- `plane` R36 (L11, re-encoding the image as PNG, not rendering a PDF page).

*Reading:* split N853 in two:
- **N853a**, the refusals, goes into T43;
- **N853b**, photographed pages, gets a draft first. It is taken in T43 only if the draft is ready before L1's START; otherwise its hard reason is "a dependency not yet designed".

BOB's under D21 (Bob's).
