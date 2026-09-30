# case-authoring (T18)

**Status** · session_01PqWQooG9fBVam8LWu6weou · depth 2 · WORKING · handled B3

## J1 · BLOCKED

Cause: needs Bob.

NEEDS BOB: push commit 03dae517e4 to `job/T18/case-authoring`. This session's permission check refused it. It is step 7's push of this job's whole work: C-32.6 and C-33.14 copied into `PUBLISH_ACT_CHECKS`, R10's two codes made literal, and the seven converts' shares as module tests.

The work is done and checked:
- `test/m/case-authoring`: 78 of 78 pass.
- format, architecture, coverage and ownership: 0 failures each.

The commit is held on this session's checkout, on the local branch `hold/case-authoring-T18`, and nothing of it is pushed. The completion entry is written and waits for the push; I post it as COMPLETE once the push lands.

Bob approves the push in this session: CASE-AUTHORING #7, https://claude.ai/code/session_01Xx2am8dyaXCugZmbzsHsnk.

## J2 · COMPLETE

CASE-AUTHORING #8 redid CASE-AUTHORING #7's lost work (B2), in four pushed commits (6ef6a6e97c … 010dc50493), with tranche/T18 merged first.

**Entries applied (layer 8, case-authoring):**
- **C-32.6 and C-33.14 copied into `PUBLISH_ACT_CHECKS`** (`src/case-authoring/checks.mjs`). The ids, codes, `where`s and translations are unchanged; they are byte-identical to the catalogue's rows. The machine fence (R1) and `NO_STATEMENT` (R3) now answer from this table, and `NO_STATEMENT` now carries its row (check, code, translation), which it lacked before. `MACHINE_FENCE_CHECKS` is no longer imported. Both rows are **awaiting stamp** (T19, rule (4)).
  - **Held twice for one tranche (K529):** the catalogue still holds `MACHINE_FENCE_CHECKS.MACHINE_CANNOT_PUBLISH` and `ACT_SHAPE_CHECKS.NO_STATEMENT`. `skills` reads the former by key. The catalogue's next job deletes both. I did not edit the catalogue.
- **N242's share:** both `where`s name `src/case-authoring/index.mjs #publishCase` (no longer `store.mjs`), and each code is the literal at its mint site.
- **R10's two codes made literal:** `COMPLETENESS_CARRIED_FORWARD` and `BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD` each have their own return. The field order, answer keys and detail words are unchanged.
- **The seven converts' shares as module tests.** Six are in `test/m/case-authoring/converts.test.mjs`; reviewcopy's is in `statement.test.mjs`.
  - `casesign`: R14 reader prose and headings; R17 all levels partial and `unidentified` counted once; R15 `next` names caseratify before ratify.
  - `grounds`: R14 a grouped member's `case_strength_grounds` rows, none for an ungrouped member, none in the finding.
  - `d84-case-manifest`: R14/R15 the manifest with no lens, and the pairs and hash in prose when a lens is in force.
  - `d442-publish-writes-nothing`: R14/R13 body sections, pin and edition, and the receipt.
  - `caseproduction`: R2 the owner fence keyed on the pair, and authority before authored fields; R6/R14/R15 the bar read at the act, with the old document keeping its bar.
  - `publish`: R15 `weakest` among several legs.
  - `reviewcopy`: R20 a derived draft's acknowledgement states edition null on both doors (1 for a new case's draft, 2 for a named one), with the row still keyed at (no case, 1).
  - Legacy suites untouched (K619). The parts of these suites that are other modules' were left to them.
- **Existing tests re-pointed:** `fences.test.mjs` R1 and `invariants.test.mjs` R29/R30 now read `PUBLISH_ACT_CHECKS`. The R3 test now asserts C-33.14. Membership's `PROJECT_VISIBILITY_CHECKS` import waits for T19, as the plan says.

**Deferred:** none.

**Found, for BOB (requirements):** R29's list names C-32.6 but not C-33.14, which this module now holds for R3. I suggest R29 read "… C-82.2–C-82.7, C-32.6 and C-33.14 (R3's `NO_STATEMENT`) …". Its sentence "C-32.6 is the catalogue's row" no longer holds; the module test's title was updated.

**Tests and checks:**
- `node --test bio-plane/test/m/case-authoring/*.test.mjs`: tests 79, pass 79, fail 0.
- format: 82 modules, 77 requirements files; 0 failures.
- architecture: 15 product files, 75 relative imports; 0 failures.
- coverage: 37 of 37 live requirement ids named by a test; 0 failures.
- ownership: 7 files changed; legacy-store 0/0, legacy-checks 0/0; 0 failures.

Size (session_01PqWQooG9fBVam8LWu6weou): test runs 9, module lines 363 (325 added, 38 removed)
