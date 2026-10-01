/* row-census — promotion R50's census suite (N319, K382, K408, K431; LEGACY-TESTS #11, T13).

   Promotion pins `ROW_CENSUS` = {version, rows, digest} beside `CATALOG_VERSION`: the census of every refusal row, in
   any module's table, as its last stamp read them (R34, R50). Promotion cannot read a later module's table (P4), so
   this suite holds the pin against the tree, computing the census EXACTLY as R50 words it (`row-census.mjs`, whose
   header states the reading; this suite reproduced promotion's own figure on its stamp commit 54abd9a659: 820 rows,
   f01ed42a…).

   WHAT PASSES. The census of the tree IS the pin; or it is the pin once the rows the open tranche's job records name
   `awaiting stamp` are taken back out (R50, K408: a row changed after the stamp by a job in a later layer, which the
   next tranche's layer-2 promotion job stamps). Each such row is declared below with the record that names it, the
   declaration is VERIFIED against that record (a line naming the check and `awaiting stamp`), and the row is LISTED.
   WHAT FAILS, naming the row: any other difference (a row that arrived, departed, or changed its check, code, `where`
   or translation with no record, or a stamp that missed one), found by diffing against the stamp's own lines
   (`fixtures/row-census-<version>.jsonl`, itself held to the pin's digest).
   NEGATIVE CONTROL: (run 2026-09-29, LEGACY-TESTS #11; the first three arms are in the suite and run with it, the
   fourth on a scratch worktree, restored by `git checkout`) (1) a row added to the census without a re-pin -> the
   comparison fails naming `arrived with no record: C-999.1 CONTROL_ARRIVAL`; (2) a stamped row taken out -> it fails
   naming `departed with no record: C-59.6 MINT_EXHAUSTED`; (3) that row's translation changed -> it fails naming
   `changed with no record: C-59.6 MINT_EXHAUSTED`, and a declared `awaiting stamp` row the tree does not bear out is a
   failure, not an exemption; (4) a row `C-59.99 CONTROL_ROW` added to record-core's own `RECORD_CORE_CHECKS` on the real
   tree -> 7 pass 1 fail, `CENSUS MOVED: arrived with no record: C-59.99 CONTROL_ROW`.
   RE-PINNED 2026-09-30 (LEGACY-TESTS #12, T14; PROMOTION #15, N318, N350): over 1.44.0, the stamp's own lines
   (`fixtures/row-census-1.44.0.jsonl`, 827 lines) reproduced by this reader on the stamp commit 872f6d4bd8 (827 rows,
   5eae043f…); the sort's tie broken by the line (N350); C-96.1's held-twice and open-tie assertions and 1.43.0's
   declarations retired.
   RE-PINNED 2026-09-30 (LEGACY-TESTS #14, T16; PROMOTION #17): over 1.46.0, the stamp's own lines
   (`fixtures/row-census-1.46.0.jsonl`, 877 lines) reproduced by this reader on the stamp commit 1dcde36e8b (877 rows,
   1002f871…); 1.45.0's declarations retired, T16's layers 3+ declared (see AWAITING_STAMP). Negative control re-run
   (private worktree): arms (1)-(3) in the suite pass; (4) C-59.99 CONTROL_ROW added to `RECORD_CORE_CHECKS` -> 7 pass
   1 fail, `CENSUS MOVED: arrived with no record: C-59.99 CONTROL_ROW`.
   RE-PINNED 2026-09-30 (LEGACY-TESTS #15, T17; PROMOTION #18, K577, K579): over 1.47.0, the stamp's own lines
   (`fixtures/row-census-1.47.0.jsonl`, 879 lines) reproduced by this reader on the stamp commit 6645daa0e0 (879 rows,
   b8bbd059…); 1.46.0's declarations (T16's layers 3+) and the queue split's composition are stamped in 1.47.0 and
   retired; T17's layers 3+ declared (see AWAITING_STAMP).
   RE-PINNED 2026-10-01 (LEGACY-TESTS #18, T20; PROMOTION #21, K884): over 1.50.0, the stamp's own lines
   (`fixtures/row-census-1.50.0.jsonl`, 986 lines) reproduced by this reader on the stamp commit 49c6e2762a (986 rows,
   dd61926a…); the 1.43.0–1.47.0 snapshots (no stamp reads them) deleted; 1.47.0's declarations retired, T20's layers 3+
   declared (see AWAITING_STAMP). The negative control no longer needs a snapshot: it drives `compare` against a stamp
   it makes from the tree's own lines, so it holds at every stamp (K884).
   RE-PINNED 2026-10-01 (LEGACY-TESTS #19, T21; PROMOTION #22, K941): over 1.51.0, the stamp's own lines
   (`fixtures/row-census-1.51.0.jsonl`, 984 lines) reproduced by this reader on the stamp commit a289ef6478 (984 rows,
   b7c43a32…); the 1.50.0 snapshot (no stamp reads it) deleted; 1.50.0's declarations retired, T21's layers 3+ declared
   (see AWAITING_STAMP), intent's registration among the compositions. A record may name its rows as a list under one
   line naming them `awaiting stamp` (FILINGS #9's record): the verification reads the line's paragraph. */
import "../stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { censusRows, censusOf, lineOf } from "./row-census.mjs";
import { ROW_CENSUS, CATALOG_VERSION } from "../../src/gate.mjs";
const LEGACY_DIR = new URL("../", import.meta.url);   /* moved to test/system/ (K612): its relative reads resolve from bio-plane/test/ */

const REPO = fileURLToPath(new URL("../../..", import.meta.url));
const FIXTURE = (v) => fileURLToPath(new URL(`./fixtures/row-census-${v}.jsonl`, LEGACY_DIR));

/* THE OPEN TRANCHE'S ROWS AWAITING STAMP, each as its job record names it. `after` is the version they were changed
   after; a declaration for an older version is stamped since and is listed to be retired, never applied. `departed`
   carries the line as the stamp read it (so the stamp's census can be rebuilt); `arrived` names the row by check and
   code (its line is the tree's). */
const AWAITING_STAMP = [
  /* RE-ANCHORED 2026-10-01 (LEGACY-TESTS #19, T21; PROMOTION #22, K941): over 1.51.0, the stamp's own lines
     (`fixtures/row-census-1.51.0.jsonl`, 984 lines) reproduced by this reader on the stamp commit a289ef6478 (984 rows,
     b7c43a32…). T20's declarations (C-68.1's `where`, C-117.20–.22) are stamped in 1.51.0 and retired. T21's rows
     changed at layers 3+, after the layer-2 stamp, for T22's stamp, found by diffing the tree's census against the 1.51.0
     fixture and each named `awaiting stamp` by its job's record: provenance's C-53.13 (re-worded, N458); filing-templates'
     C-115 moves (C-115.32–.33, .35, .37–.38 re-sited; C-115.31 and C-115.36 re-keyed, so each departs under its old code
     and arrives under its new one) and its new C-125.1–.32; filings' C-115 rows (C-115.41–.43 new, C-115.12, .19, .34,
     .39, .40 re-worded or re-sited, C-115.6 and C-115.17 retired); local-facts' new C-126.1–.5. Membership's rows that
     left its table (MEMBERSHIP #15) are held, unchanged, in credentials', so the census does not move with them. Nothing
     else moved. A record that lists its rows under one line naming them `awaiting stamp` (filings') is read as naming
     each (see the verification below); `named` is the record's own text for a range (C-125.1–C-125.32, C-126.1–.5). */
  { after: "1.51.0", kind: "changed", by: "PROVENANCE #10 (N458, C-53.13 re-worded)", record: "build/jobs/T21/provenance.md",
    line: ["C-53.13","CAPTURE_HELD_BY_ANOTHER_BUNDLE","src/provenance/index.mjs #testimonyFence > is-register-home","The record already holds this document, under another bundle. A document has one home in the record — the first bundle that registered it — and registering it again here would move it away from there. Nothing was written. Cite the bundle that holds it, or, if you found it at a new address, that sighting is already recorded as a corroboration of the one it holds."] },
  { after: "1.51.0", kind: "departed", by: "FILINGS #9 (K921, R28)", record: "build/jobs/T21/filings.md",
    line: ["C-115.6","KIND_NO_TEMPLATE","src/filings/index.mjs filingPrepare > is-filing-prepare","The jurisdiction profile holds no template for this kind of action (or its profiles disagree on one), so there is nothing to pre-fill."] },
  { after: "1.51.0", kind: "changed", by: "FILINGS #9 (K921, R28)", record: "build/jobs/T21/filings.md",
    line: ["C-115.12","TEXT_UNWRITABLE","src/filings/index.mjs filingApprove > is-filing-approve","The text is empty, too long, or not readable as text, so it cannot be recorded as approved."] },
  { after: "1.51.0", kind: "departed", by: "FILINGS #9 (K921, R28)", record: "build/jobs/T21/filings.md",
    line: ["C-115.17","NOT_TIER3","src/filings/index.mjs counselPacket > is-counsel-packet","A counsel packet is assembled only for an action whose governing tier is 3. A Tier 1 or 2 action is prepared as a filing."] },
  { after: "1.51.0", kind: "changed", by: "FILINGS #9 (K921, R28)", record: "build/jobs/T21/filings.md",
    line: ["C-115.19","NO_DETERMINATION","src/filings/index.mjs counselPacket > is-counsel-packet","The action rests on no live determination you can read, so there are no facts to assemble for counsel."] },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, C-115 row moved to its table)", record: "build/jobs/T21/filing-templates.md", check: "C-115.31", code: "MACHINE_CANNOT_DRAFT_TEMPLATE" },
  { after: "1.51.0", kind: "departed", by: "FILING-TEMPLATES #1 (K921, C-115 row moved to its table)", record: "build/jobs/T21/filing-templates.md",
    line: ["C-115.31","MACHINE_CANNOT_SAVE_TEMPLATE","src/filings/index.mjs templateSave > is-template-save","Only a named member can add a template to the group's library. A machine may draft words; it never makes them the group's boilerplate."] },
  { after: "1.51.0", kind: "changed", by: "FILING-TEMPLATES #1 (K921, C-115 row moved to its table)", record: "build/jobs/T21/filing-templates.md",
    line: ["C-115.32","TEMPLATE_NAME_REFUSED","src/filings/index.mjs templateSave > is-template-save","Name the template in one line of at most 200 characters."] },
  { after: "1.51.0", kind: "changed", by: "FILING-TEMPLATES #1 (K921, C-115 row moved to its table)", record: "build/jobs/T21/filing-templates.md",
    line: ["C-115.33","TEMPLATE_KIND_REFUSED","src/filings/index.mjs templateSave > is-template-save","A template's kind is written as a kind is: lower-case letters, digits and underscores. Leave it out for a template of no kind."] },
  { after: "1.51.0", kind: "changed", by: "FILINGS #9 (K921, R28)", record: "build/jobs/T21/filings.md",
    line: ["C-115.34","TEMPLATE_FROM_UNAPPROVED","src/filings/index.mjs templateSave > is-template-save","A template is kept from a draft a member has approved. Approve the draft first."] },
  { after: "1.51.0", kind: "changed", by: "FILING-TEMPLATES #1 (K921, C-115 row moved to its table)", record: "build/jobs/T21/filing-templates.md",
    line: ["C-115.35","TEMPLATE_TEXT_REFUSED","src/filings/index.mjs templateSave > is-template-save","The template's words are empty, too long, or not readable as text."] },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, C-115 row moved to its table)", record: "build/jobs/T21/filing-templates.md", check: "C-115.36", code: "TEMPLATE_TIER3_FILE" },
  { after: "1.51.0", kind: "departed", by: "FILING-TEMPLATES #1 (K921, C-115 row moved to its table)", record: "build/jobs/T21/filing-templates.md",
    line: ["C-115.36","TEMPLATE_KIND_TIER3","src/filings/index.mjs templateSave > is-template-save","This kind's tier is 3: it requires competent counsel, and no template is kept for it."] },
  { after: "1.51.0", kind: "changed", by: "FILING-TEMPLATES #1 (K921, C-115 row moved to its table)", record: "build/jobs/T21/filing-templates.md",
    line: ["C-115.37","TEMPLATE_NAME_TAKEN","src/filings/index.mjs templateSave > is-template-save","The group's library already holds a template by this name. Choose another name."] },
  { after: "1.51.0", kind: "changed", by: "FILING-TEMPLATES #1 (K921, C-115 row moved to its table)", record: "build/jobs/T21/filing-templates.md",
    line: ["C-115.38","NO_SUCH_TEMPLATE","src/filings/index.mjs filingPrepare > is-filing-prepare","There is no template by that id in the group's library that you can read here. One you may not see answers exactly as one that does not exist."] },
  { after: "1.51.0", kind: "changed", by: "FILINGS #9 (K921, R28)", record: "build/jobs/T21/filings.md",
    line: ["C-115.39","TEMPLATE_KIND_MISMATCH","src/filings/index.mjs filingPrepare > is-filing-prepare","The template named was kept for another kind of action. Name one kept for this kind, or for none."] },
  { after: "1.51.0", kind: "changed", by: "FILINGS #9 (K921, R28)", record: "build/jobs/T21/filings.md",
    line: ["C-115.40","TEMPLATE_NOT_NAMED","src/filings/index.mjs filingPrepare > is-filing-prepare","The jurisdiction profile holds no template for this kind, but the group's library does: name the one to fill."] },
  { after: "1.51.0", kind: "arrived", by: "FILINGS #9 (K921, R28)", record: "build/jobs/T21/filings.md", check: "C-115.41", code: "TEMPLATE_USE_BRIEF" },
  { after: "1.51.0", kind: "arrived", by: "FILINGS #9 (K921, R28)", record: "build/jobs/T21/filings.md", check: "C-115.42", code: "TEMPLATE_USE_FILE" },
  { after: "1.51.0", kind: "arrived", by: "FILINGS #9 (K921, R28)", record: "build/jobs/T21/filings.md", check: "C-115.43", code: "TEMPLATE_AND_TEXT" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.1", code: "TEMPLATE_KIND_UNKNOWN" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.2", code: "TEMPLATE_USE_REFUSED" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.3", code: "TEMPLATE_PROFILE_UNKNOWN" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.4", code: "TEMPLATE_BLANK_UNKNOWN" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.5", code: "TEMPLATE_SCOPE_REFUSED" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.6", code: "TEMPLATE_DRAFT_OPEN" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.7", code: "TEMPLATE_RETIRED" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.8", code: "TEMPLATE_FROM_REFUSED" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.9", code: "NOT_A_DRAFT" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.10", code: "TEMPLATE_NO_PROPOSER" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.11", code: "TEMPLATE_WHY_REFUSED" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.12", code: "REVIEWER_UNKNOWN" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.13", code: "NO_REVIEWERS" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.14", code: "GRANT_RECIPIENT_REFUSED" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.15", code: "GRANT_NO_SECRET" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.16", code: "NO_SUCH_GRANT" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.17", code: "NO_TEMPLATE_GRANT" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.18", code: "MACHINE_CANNOT_REVIEW_TEMPLATE" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.19", code: "NOT_IN_REVIEW" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.20", code: "REVIEW_REFUSED" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.21", code: "REVIEW_STALE" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.22", code: "MACHINE_CANNOT_APPROVE_TEMPLATE" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.23", code: "TEMPLATE_NOT_APPROVED" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.24", code: "NOT_AN_APPROVER" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.25", code: "APPROVER_IS_AUTHOR" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.26", code: "REVIEWS_INSUFFICIENT" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.27", code: "TEMPLATE_REASON_REFUSED" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.28", code: "TEMPLATE_ALREADY_ENDED" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.29", code: "TEMPLATE_NOTES_REFUSED" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.30", code: "COMMENT_REFUSED" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.31", code: "TEMPLATE_NOT_OFFERED" },
  { after: "1.51.0", kind: "arrived", by: "FILING-TEMPLATES #1 (K921, new C-125 rows)", record: "build/jobs/T21/filing-templates.md", named: "C-125.1–C-125.32", check: "C-125.32", code: "TEMPLATES_STATE_REFUSED" },
  { after: "1.51.0", kind: "arrived", by: "LOCAL-FACTS #1 (K921, new C-126 rows)", record: "build/jobs/T21/local-facts.md", named: "C-126.1–.5", check: "C-126.1", code: "MACHINE_CANNOT_CONFIRM" },
  { after: "1.51.0", kind: "arrived", by: "LOCAL-FACTS #1 (K921, new C-126 rows)", record: "build/jobs/T21/local-facts.md", named: "C-126.1–.5", check: "C-126.2", code: "NO_SUCH_FACT" },
  { after: "1.51.0", kind: "arrived", by: "LOCAL-FACTS #1 (K921, new C-126 rows)", record: "build/jobs/T21/local-facts.md", named: "C-126.1–.5", check: "C-126.3", code: "FACT_ACT_REFUSED" },
  { after: "1.51.0", kind: "arrived", by: "LOCAL-FACTS #1 (K921, new C-126 rows)", record: "build/jobs/T21/local-facts.md", named: "C-126.1–.5", check: "C-126.4", code: "FACT_HOW_REFUSED" },
  { after: "1.51.0", kind: "arrived", by: "LOCAL-FACTS #1 (K921, new C-126 rows)", record: "build/jobs/T21/local-facts.md", named: "C-126.1–.5", check: "C-126.5", code: "FACT_VALUE_REFUSED" },
];
/* COMPOSITIONS AWAITING STAMP: a change to which checks a gate runs moves no row, so the census cannot see it; each is
   declared here by name, verified against its record like a row, and listed (R50, K408, K464). Queue's registered step
   (1.44.0's declaration) is stamped in 1.45.0 and retired (LEGACY-TESTS #13, T15). LEGACY-TESTS #14 (T16, 2026-09-30):
   inquiry's step (1.45.0's declaration) is stamped in 1.46.0 and retired; the queue split's is declared for T17.
   LEGACY-TESTS #15 (T17, 2026-09-30): the queue split's (1.46.0's declaration) is stamped in 1.47.0 (PROMOTION #18) and
   retired; no T17 job names a composition change. LEGACY-TESTS #19 (T21, 2026-10-01): intent's registration changed its
   ids after the 1.51.0 stamp (INTENT #9, no row), declared for T22. */
const COMPOSITIONS_AWAITING = [
  { after: "1.51.0", what: "intent's registration (its ids changed, no row)", by: "INTENT #9 (P8)",
    record: "build/jobs/T21/intent.md", needle: "ids of my registration" },
];
/* The plane's suite shape: every arm printed PASS or FAIL with its reason, the tally last, the exit its verdict. */
let pass = 0, fail = 0;
const test = (label, fn) => {
  try { fn(); pass++; console.log(`  PASS  ${label}`); }
  catch (e) { fail++; console.log(`  FAIL  ${label}\n         ${String(e && e.message || e).split("\n").join("\n         ")}`); }
};
const keyOf = (check, code) => `${check} ${code}`;
const keyOfLine = (l) => { const [check, code] = JSON.parse(l); return keyOf(check, code); };

/** The comparison, as a function so the negative control drives the SAME code: `lines` are the tree's census lines. */
function compare(lines, { pin = ROW_CENSUS, awaiting = AWAITING_STAMP, stamped = null } = {}) {
  const live = awaiting.filter((a) => a.after === pin.version);
  const byKey = new Map(lines.map((l) => [keyOfLine(l), l]));
  const listed = [], problems = [];
  const rebuilt = [...lines];   /* a multiset: two row objects with one line (C-41.x, held twice) are two lines */
  const drop = (l) => { const i = rebuilt.indexOf(l); if (i >= 0) rebuilt.splice(i, 1); };
  for (const a of live) {
    if (a.kind === "arrived") {
      const l = byKey.get(keyOf(a.check, a.code));
      if (!l) problems.push(`declared arrived after ${a.after} but not in the tree: ${keyOf(a.check, a.code)} (${a.by})`);
      else { drop(l); listed.push(`awaiting stamp, arrived: ${keyOf(a.check, a.code)} (${a.by})`); }
    } else if (a.kind === "departed") {
      const l = JSON.stringify(a.line);
      if (byKey.has(keyOf(a.line[0], a.line[1]))) problems.push(`declared departed after ${a.after} but still in the tree: ${keyOf(a.line[0], a.line[1])} (${a.by})`);
      else { rebuilt.push(l); listed.push(`awaiting stamp, departed: ${keyOf(a.line[0], a.line[1])} (${a.by})`); }
    } else if (a.kind === "changed") {
      const was = JSON.stringify(a.line), l = byKey.get(keyOf(a.line[0], a.line[1]));
      if (!l || l === was) problems.push(`declared changed after ${a.after} but ${l ? "unchanged" : "not"} in the tree: ${keyOf(a.line[0], a.line[1])} (${a.by})`);
      else { drop(l); rebuilt.push(was); listed.push(`awaiting stamp, changed: ${keyOf(a.line[0], a.line[1])} (${a.by})`); }
    }
  }
  const c = censusOf(rebuilt.map((l) => { const [check, code, where, translation] = JSON.parse(l); return { check, code, where, translation }; }));
  const held = c.rows === pin.rows && c.digest === pin.digest;
  const named = [];
  if (!held && stamped) {
    const S = new Map(stamped.map((l) => [keyOfLine(l), l])), R = new Map(c.lines.map((l) => [keyOfLine(l), l]));
    const plural = (m) => { const n = new Map(); for (const k of m) n.set(k, (n.get(k) || 0) + 1); return n; };
    const sCount = plural(stamped.map(keyOfLine)), rCount = plural(c.lines.map(keyOfLine));
    for (const [k, l] of R) if (!S.has(k)) named.push(`arrived with no record: ${k}`);
      else if (S.get(k) !== l && !stamped.includes(l)) named.push(`changed with no record: ${k}`);
    for (const k of S.keys()) if (!R.has(k)) named.push(`departed with no record: ${k}`);
    for (const [k, n] of rCount) if (S.has(k) && n !== sCount.get(k)) named.push(`held ${n} times, stamped ${sCount.get(k)}: ${k}`);
  }
  return { held: held && !problems.length, census: c, listed, problems, named };
}

const tree = await censusRows(REPO);
const now = censusOf(tree.rows);
const stampedPath = FIXTURE(ROW_CENSUS.version);
const stamped = existsSync(stampedPath) ? readFileSync(stampedPath, "utf8").split("\n").filter(Boolean) : null;
console.log(`  CENSUS (R50): ${tree.files.length} files, ${now.rows} rows, sha256 ${now.digest}`);
console.log(`  PIN: ${ROW_CENSUS.version}, ${ROW_CENSUS.rows} rows, sha256 ${ROW_CENSUS.digest}`);
console.log(`  not importable under node (no row literal in any, else BLIND below): ${tree.unimportable.map((u) => u.file).join(", ") || "none"}`);
console.log(`  scripts that run when imported, left out: ${tree.scripts.map((s) => s.file).join(", ") || "none"}`);

test("R50: the census is a census — its files, its tables read, no file holding rows left unread", () => {
  assert.ok(tree.files.length >= 200, `only ${tree.files.length} files: the module paths were not read`);
  assert.ok(now.rows >= 800, `only ${now.rows} rows: the tables were not read`);
  assert.deepEqual(tree.blind, [], "a file node cannot import holds a row literal, so its rows are not in the census");
  assert.deepEqual(tree.scripts.filter((s) => s.checkKey).map((s) => s.file), [],
    "a script left out holds a `check:` key, so leaving it out could move the census");
});

test("R50: one row object in two tables, or one table under two exports, counts once; two row objects with one check count twice", () => {
  /* RETIRED 2026-09-30 (LEGACY-TESTS #12, T14; K408 (4), K458): the assertion that C-96.1 is held twice. The catalogue's
     copy left (LEGACY-CHECKS #8) and 1.44.0 counts membership's row once. What stays is the reader's own half: nothing
     is doubled by the reader, every repeated (check, code) being two DISTINCT row objects in two tables. */
  const where = new Map();
  for (const r of tree.rows) where.set(keyOf(r.check, r.code), [...(where.get(keyOf(r.check, r.code)) || []), `${r.file}#${r.table}`]);
  for (const [k, homes] of where) if (homes.length > 1) assert.equal(new Set(homes).size, homes.length, `${k} read twice from one table: ${homes}`);
  assert.equal(now.lines.filter((l) => l.startsWith('["C-96.1",')).length, 1, "C-96.1 is held once, membership's");
});

/* R50 sorts by check, then code, then the line itself (N350, PROMOTION #15): no two lines tie, so the digest does not
   depend on the order the rows are read in. RE-ANCHORED 2026-09-30 (LEGACY-TESTS #12, T14): the "open tie" this arm
   pinned (C-96.1 held twice, T13) is gone with the catalogue's copy, and the sort's third key closes the class. */
test("R50: the digest does not depend on the order rows are read — the sort's third key is the line itself", () => {
  assert.equal(censusOf([...tree.rows].reverse()).digest, now.digest);
  const shuffled = tree.rows.map((r, i) => [((i * 7919) % 104729), r]).sort((x, y) => x[0] - y[0]).map(([, r]) => r);
  assert.equal(censusOf(shuffled).digest, now.digest);
  /* The third key does work: two lines sharing check and code sort by the line in either read order. */
  const a = { check: "C-1.1", code: "X", where: "a", translation: "t" }, b = { ...a, where: "b" };
  assert.deepEqual(censusOf([b, a]).lines, censusOf([a, b]).lines);
  assert.equal(censusOf(tree.rows.map((r) => ({ ...r, where: r.where ?? undefined }))).digest, now.digest, "a missing where reads null");
});

test("R50 R34: the pin names the stamp it moves with — ROW_CENSUS.version is CATALOG_VERSION", () => {
  assert.equal(ROW_CENSUS.version, CATALOG_VERSION);
});

/* LEGACY-TESTS #14 (T16, 2026-09-30), K567: a record may name its row with the exact phrase
   "for promotion's stamp" (RATIFICATION #7's wording, build/jobs/T16/ratification.md:20) beside
   `awaiting stamp`; nothing broader is accepted. */
const AWAITING = /awaiting stamp|for promotion's stamp/i;
/* LEGACY-TESTS #19 (T21, 2026-10-01): a record may also list its rows under one line naming them `awaiting stamp`
   (FILINGS #9: "**Rows, each `awaiting stamp` (T22):**", then one bullet per kind of change). A line naming the row
   counts when it, or an earlier line of its paragraph (the lines up to a blank one), names `awaiting stamp`. */
const namesAwaiting = (text, needle) => {
  let para = false;
  for (const l of text.split("\n")) {
    if (!l.trim()) { para = false; continue; }
    if (AWAITING.test(l)) para = true;
    if (para && l.includes(needle)) return true;
  }
  return false;
};
test("R50: every row awaiting stamp is named so by its job record", () => {
  /* The paragraph reading's own control: a row named only in another paragraph, or before the naming line, is not named. */
  assert.equal(namesAwaiting("**Rows, `awaiting stamp`:**\n- C-1.1 X\n\n- C-1.2 Y", "C-1.1"), true);
  assert.equal(namesAwaiting("**Rows, `awaiting stamp`:**\n- C-1.1 X\n\n- C-1.2 Y", "C-1.2"), false);
  assert.equal(namesAwaiting("- C-1.3 Z\n**Rows, `awaiting stamp`:**", "C-1.3"), false);
  for (const a of AWAITING_STAMP.filter((x) => x.after === ROW_CENSUS.version)) {
    const check = a.named ?? (a.kind === "arrived" ? a.check : a.line[0]);
    const text = readFileSync(join(REPO, a.record), "utf8");
    assert.ok(namesAwaiting(text, check),
      `${a.record} has no line naming ${check} and "awaiting stamp" (${a.by})`);
  }
  for (const c of COMPOSITIONS_AWAITING.filter((x) => x.after === ROW_CENSUS.version)) {
    const text = readFileSync(join(REPO, c.record), "utf8");
    assert.ok(namesAwaiting(text, c.needle),
      `${c.record} has no line naming the ${c.needle} and "awaiting stamp" (${c.by})`);
    console.log(`  awaiting stamp, composition: ${c.what} (${c.by})`);
  }
  for (const c of COMPOSITIONS_AWAITING.filter((x) => x.after !== ROW_CENSUS.version))
    console.log(`  STAMPED SINCE, retire this declaration: composition ${c.what} (after ${c.after})`);
  for (const a of AWAITING_STAMP.filter((x) => x.after !== ROW_CENSUS.version))
    console.log(`  STAMPED SINCE, retire this declaration: ${a.kind} ${a.kind === "arrived" ? keyOf(a.check, a.code) : keyOf(a.line[0], a.line[1])} (after ${a.after})`);
});

test("R50: the stamp's own lines are the pin — the snapshot this suite names rows against is the stamp's", () => {
  if (!stamped) { console.log(`  no snapshot of ${ROW_CENSUS.version}: a failure below cannot name its rows until one is taken`); return; }
  const c = censusOf(stamped.map((l) => { const [check, code, where, translation] = JSON.parse(l); return { check, code, where, translation }; }));
  assert.deepEqual({ rows: c.rows, digest: c.digest }, { rows: ROW_CENSUS.rows, digest: ROW_CENSUS.digest });
});

test("R50: the tree holds the pin, the rows awaiting stamp listed — any other difference fails naming the row", () => {
  const r = compare(now.lines, { stamped });
  for (const l of r.listed) console.log(`  ${l}`);
  for (const l of [...r.problems, ...r.named]) console.log(`  CENSUS MOVED: ${l}`);
  assert.deepEqual(r.problems, []);
  assert.ok(r.held, `the census, less the rows awaiting stamp, is ${r.census.rows} rows sha256 ${r.census.digest}, `
    + `not the pin ${ROW_CENSUS.rows} ${ROW_CENSUS.digest}: ${r.named.join("; ") || "(no snapshot to name the rows)"}`);
});

test("R50 NEGATIVE CONTROL: a row added without a re-pin fails, naming it; so do a departure and a changed translation", () => {
  /* The control's own stamp, made from the tree's lines (K884): the arm drives the SAME `compare` at every stamp, with
     or without that stamp's snapshot, and first proves its stamp holds so a red below is the arm and not the stamp. */
  const own = censusOf(now.lines.map((l) => { const [check, code, where, translation] = JSON.parse(l); return { check, code, where, translation }; }));
  const ctl = { pin: { version: "control", rows: own.rows, digest: own.digest }, stamped: own.lines, awaiting: [] };
  assert.equal(compare(now.lines, ctl).held, true, "the control's own stamp does not hold over the lines it was made from");
  const added = lineOf({ check: "C-999.1", code: "CONTROL_ARRIVAL", where: "src/nowhere.mjs control", translation: "A control arm's row." });
  const a = compare([...now.lines, added], ctl);
  assert.equal(a.held, false);
  assert.ok(a.named.includes("arrived with no record: C-999.1 CONTROL_ARRIVAL"), a.named.join("; "));
  const gone = now.lines.find((l) => l.startsWith('["C-59.6",'));
  const d = compare(now.lines.filter((l) => l !== gone), ctl);
  assert.equal(d.held, false);
  assert.ok(d.named.includes("departed with no record: C-59.6 MINT_EXHAUSTED"), d.named.join("; "));
  const moved = JSON.parse(gone); moved[3] = `${moved[3]} (a control arm's edit)`;
  const m = compare(now.lines.map((l) => (l === gone ? JSON.stringify(moved) : l)), ctl);
  assert.equal(m.held, false);
  assert.ok(m.named.includes("changed with no record: C-59.6 MINT_EXHAUSTED"), m.named.join("; "));
  /* And a declaration the tree does not bear out is itself a failure, not an exemption. */
  const x = compare(now.lines, { ...ctl, awaiting: [
    { after: "control", kind: "arrived", by: "a control arm", record: "-", check: "C-999.2", code: "NOWHERE" }] });
  assert.equal(x.held, false);
  assert.ok(x.problems.some((p) => p.includes("C-999.2 NOWHERE")), x.problems.join("; "));
  /* A row declared changed whose line the tree still bears as stamped is a failure too (LEGACY-TESTS #13, T15). */
  const y = compare(now.lines, { ...ctl, awaiting: [
    { after: "control", kind: "changed", by: "a control arm", record: "-", line: JSON.parse(gone) }] });
  assert.equal(y.held, false);
  assert.ok(y.problems.some((p) => p.includes("unchanged in the tree: C-59.6 MINT_EXHAUSTED")), y.problems.join("; "));
});

console.log(`\nrow-census: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
