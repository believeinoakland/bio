# legacy-tests (T21)

**Status** · session_01Wo7cuGi149GPKzvhNUPnDo · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

legacy-tests T21: N469 applied and row-census re-pinned to 1.51.0 (K941). Commits 5cac624ed9 and ac3594bbb8 on `job/T21/legacy-tests`. Only my `tests` paths are touched.

**Entries applied.**
- **K941, row census.** I took 1.51.0's snapshot (`bio-plane/test/fixtures/row-census-1.51.0.jsonl`) on PROMOTION #22's stamp commit a289ef6478. This reader reproduces the pin there exactly: 984 rows, b7c43a32…. The 1.50.0 snapshot is deleted (no stamp reads it). T20's four declarations are stamped in 1.51.0 and retired. I diffed the tree against the snapshot (1022 rows now) and declared each row that moved, from the record that names it `awaiting stamp`. Nothing else moved:
  - provenance: C-53.13 changed.
  - filing-templates: C-115.32, .33, .35, .37 and .38 re-sited. C-115.31 and C-115.36 were re-keyed, so each departs under its old code and arrives under its new one. C-125.1–.32 arrive.
  - filings: C-115.41–.43 arrive. C-115.12, .19, .34, .39 and .40 changed. C-115.6 and C-115.17 depart.
  - local-facts: C-126.1–.5 arrive.
  - Compositions: intent's registration (INTENT #9, no row) is declared in `COMPOSITIONS_AWAITING`.
  - Membership's rows that left its table are held unchanged in credentials' table, so the census does not move with them.
- **One reading I made:** FILINGS #9's record lists its rows under one line, "**Rows, each `awaiting stamp` (T22):**". The verification now accepts a row named anywhere in that line's paragraph (up to a blank line). I added three control asserts for this: a row named in another paragraph, or before the naming line, is not accepted.
- **Accepted red cleared.** `row-census.test.mjs` is green: 8 pass, 0 fail. Rows any running L11 job changes after this are not declared. If one does, the next re-pin declares it.
- **N469.** I re-scanned my paths and read every note that names a deleted file or the battery. Live claims are re-worded, either to the module test that now proves the claim, or as "deleted in T20" in the past tense where nothing does. I have no requirements, so no new test was added. Provenance notes stay, as listed in B1.
  - `civicos-ui/test/run.mjs` no longer runs the deleted `check-semantics.mjs` and `check-refusal-codes.mjs`. The DEC-49 totality is now control-plane R22 (`test/m/control-plane/families.test.mjs`).
  - BOB's named sites are all done: `fleetbundles.test.mjs`:28/:587, `budget.mjs`, `tier-pagewise.probe.mjs`, `conclude-project`:633, `pdfstructure`:556 (now extraction R11/R12 in `convert-chain.test.mjs`), `caseceremony.mjs`, `publishingproject.mjs`, `analyst-vocabulary.test.mjs` (`DIFFERENT_QUESTION` emptied), `meaning-arms`, `queue-allclear-limit`, `stdio-census`:92, `finder`:196, `elicitation`:47.
  - The re-scan found more of the same kind, also fixed:
    - the shared stdio header in 13 UI suites, `run.mjs` and `stdio-census`: the guard they named, `tally-through-pipe.test.mjs`, was deleted in T17. It is now test-support's R6 (`test/m/test-support/test-support.test.mjs`).
    - "NEGATIVE CONTROL: run X.control.mjs" headers whose drivers T20 deleted: they are now marked deleted, with the record of each run kept.
    - `tier2-wire`:9 (now text-chain R102), `members`:286 (now credentials' `keys.test.mjs`), `inquiry-page`:228, `conclude-act`:586, `project-workspace`:419/424, `several-cases-choice`:24, `review-copy`:64, `analyst-vocabulary.mjs`:113/:120, `fleetbundles.control.mjs`:37, `ocr-measure-probe.mjs`:3, `migrate-released`:294.
- **Fixed in my module (found by the proof).** `mk6-bundle-names-no-author`, `review-copy`, `several-cases-choice` and `statement-ack` were red on `tranche/T21` before my change. Their fixtures created a project at `investigating`, which project-stage now refuses (PROJECT_STAGE_COMPUTED, C-86.15). The fixtures (`publishingproject.mjs` and the three UI suites) now create it at `forming`, and all four are green.

**Deferred:** none.

**Found in other modules (REPORT):**
1. legacy-ui: `civicos-ui/check-mock-envelope.mjs` fails on every run: `test/envelope-probe.mjs` is missing, and arm C cannot read the deleted `bio-plane/src/store.mjs`. `run.mjs` (not the regression) counts that as a failure. It also still names `preauth-vocabulary.test.mjs`. This is Bob's UX (K633); I left it unchanged.
2. No test drives the UI queue's all-clear behaviour since `queue.test.mjs` was deleted. `queue-allclear-limit` is structural only.
3. Generated artifacts: none staled. The change is test-only and I regenerated nothing.

**Tests and checks.**
- The proof (`node --test bio-plane/test/*.test.mjs bio-plane/test/system/*.test.mjs civicos-ui/test/*.test.mjs` from the root): tests 47, pass 47, fail 0, skipped 0, no SKIP printed. Baseline `origin/tranche/T21` @ start: 42 pass, 5 fail (row-census and the four fixture suites).
- `node test/fleetbundles.control.mjs` from `bio-plane/`: exit 0. Every arm held as declared, and every restore was verified by content and sha256.
- `row-census.test.mjs`: 8 pass, 0 fail.
- Checks: format 0 failures, architecture 0, coverage 0 of 0 live ids (no requirements file), ownership 41 files and 0 failures.

Size (session_01Wo7cuGi149GPKzvhNUPnDo): test runs 17, module lines 527

## J2 · COMPLETE

B2 applied. I merged `tranche/T21` into my branch. `bio-plane/test/conclude-project.test.mjs`:85–86 now starts Miniflare from `SRC("plane/index.mjs")`, the plane's entry and the same one `members.test.mjs` and `d526-refusal-order.test.mjs` use. Nothing else had to change: `modulesRoot: "/"` and the ESModule rule already resolve its imports. Commit 55d7ef2040.

I re-scanned my paths for any other reader of `bio-plane/src/index.mjs` and found none. The remaining `src/index.mjs` names are other members' entries (agent-worker, pdf-worker, newgroup), synthetic fixture members, and prose.

**Tests and checks.**
- `conclude-project`: 75 pass, 0 fail.
- The root proof (`node --test bio-plane/test/*.test.mjs bio-plane/test/system/*.test.mjs civicos-ui/test/*.test.mjs`): tests 47, pass 47, fail 0, skipped 0, no SKIP printed. That run includes fleetbundles, which is green.
- `node test/fleetbundles.control.mjs` from `bio-plane/`: exit 0, with every arm as declared.
- Checks: format 0 failures, architecture 0, coverage 0 of 0, ownership 0 (2 files).
- Generated artifacts: none staled (the change is test-only).

Size (session_01Wo7cuGi149GPKzvhNUPnDo): test runs 20, module lines 529
