# conformance (T18)

**Status** · session_01Api7vqXVAc7EyWoQRiM9r9 · depth 2 · WORKING · handled B2

## Completion (CONFORMANCE #6)

**Entries applied.**
- **N242's share** (`is-outcome-stated`; the 3-line regions; `NO_SUCH_PROJECT`'s translation identical to intent's): already met since T11 (CONFORMANCE #5's N297: `OUTCOME_UNKNOWN`'s `where` names `determine`, where its region is; `is-act-complete`, `is-comparison-complete`, `is-question-named` widened; `NO_SUCH_PROJECT` answered through membership's `noSuchProject`, C-113.2 retired). Confirmed on this branch: the real-tree guard (`node civicos-ui/check-refusal-codes.mjs`) prints no FAIL naming `src/conformance/` or a C-113 code; `NO_REASON` and `BAD_REASON` appear only in arm G's DECLARED closures (cross-module, not this module's share). Nothing changed for it.
- **N249's clause** (J1, answered B2, K700): `determination_questions.opened` (0/1, whether this act opened the question's inquiry) and the case's `opened` (an instant) are distinct; the name stays, no migration. Added the R6/R9 module test that states it at the interface: `opened` a boolean on every question, in the act's answer, the read and the row, true exactly for the inquiries the act created.
- **K680** (INQUIRY #7's REPORT): `test/m/conformance/reads.test.mjs`' R10 arm no longer writes `bundles.inquiry_superseded_by`; the reopened finding is divided through a real `inquiry.divide` (its R23–R26; a published case member cannot be divided, inquiry R35, so the arm divides after the reopen), and `supersededBy` answers its two children. The fixture no longer adds `inquiry_basis_count` and `inquiry_superseded_by` to `bundles` (inquiry R36 holds them in its own table). The layer-6 accepted red is green.

**Fixed in my module (found by K680's real division).** R10 named one supersession twice: reevaluation's notice (its R2's word `supersession`) and this module's own read (`superseded`) did not de-duplicate. `#flag` now reads a finding notice's `supersession` as `superseded`, so each cause is named once; the stored notice is kept as told. The R10 notice test re-worded to the one word, with the stored row asserted. No requirement changed (R10: "naming each cause"); no user module reads the source word (their tests unchanged, below).

**Deferred.** None.

**Found in other modules.** None new. Users' baselines, identical with and without this change: filings 31/4 (layer 8's K651 accepted reds, cleared by filings' own job in this layer), control-plane 79/1.

**Generated artifacts.** `bio-plane/dist/bio-plane.bundled.mjs` is stale by `src/conformance/index.mjs` (BOB regenerates at the layer close, §14).

**Rows changed.** None (no `awaiting stamp`).

**Tests and checks.**
- `node --test bio-plane/test/m/conformance/`: 48 pass, 0 fail (47/1 at the start: K680's red).
- Users: consequences 24/0, actions 47/0, escalation 29/0, affordances 106/0, filings 31/4 and control-plane 79/1 (both unchanged from the base); action-plans has no tests yet.
- DEC-49 guard, real tree: no conformance failure.
- `checks/format.mjs`: 0 failures; `architecture.mjs conformance`: 0 failures; `coverage.mjs conformance`: 22 of 22 live ids named, 0 failures; `ownership.mjs conformance tranche/T18`: see the line below.

## J1 · QUESTION

N249's clause: `determination_questions.opened` vs the case field `opened`. My reading: **they are distinct; keep the name, no migration.**
- Case `opened` (`cases.opened`, `published_cases.opened`; publication's answers `opened`) is TEXT, the instant a case identity or edition came into being.
- Conformance's `opened` (`determination_questions.opened`, and `questions[].opened` in R9's read) is INTEGER 0/1: whether this determination's own act opened that question's inquiry (R6), as against naming an existing one.
- Different object, type and meaning; nothing in `bio-plane/src` reads both, and no later module (consequences, actions, filings, escalation) reads conformance's `opened`. The only cost is the two legacy suites that set it aside by line and shape (`bio-plane/test/case-opened.test.mjs`; `civicos-ui/test/publishedcase.test.mjs`:2918), which are not run and are deleted at the release (K619).
- I add a module test naming R6 that pins the field's shape (a boolean on each question, true only for an inquiry this act opened), so the distinction is stated at the interface.
Alternative, if you rule a rename (N71: an interface name changes only with a migration you schedule): column and answer key `opened` → `opened_here`, by an idempotent `ALTER TABLE determination_questions RENAME COLUMN` in `migrateConformance` (run only when the old column exists), the R9 shape and its tests re-worded; ~15 lines; the two legacy set-asides then go stale (legacy-tests', reported).
I carry on with the rest on my reading; the answer changes only these ~15 lines.
