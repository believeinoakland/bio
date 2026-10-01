# actions (T20)

**Status** · session_01Fwao5PLUk8ZP3e1RQa7N1d · depth 2 · WORKING · handled B0

## J1 · REPORT

Status: every entry built and pushed on `job/T20/actions` (9b1a51182c..HEAD); one test waits on action-grammar's merge.

- **N447.** Re-scan over `bio-plane/src` and `test/m` (and `scripts`): no file imports `actions/checks.mjs` any more (setup.mjs, the instance-setup tests and escalation's `stages.test.mjs` re-pointed in T19; `control-plane/families.mjs` lists action-grammar's file, not this one). It held nothing of its own, so it is deleted. Also dropped: `index.mjs`'s vocabulary re-export (`PRODUCT_KINDS` … `actionKinds`, marked "N447 drops it in T20"), read by no product file or `test/m` suite (affordances reads action-grammar since T19 L11); only old suites read the file's text (`test/system/bounds.test.mjs`, `test/d526-refusal-order.control.mjs`; not run, K619).
- **R52, R54.** `actionHold` (`op=actionhold`, beside `actionpressure`), `holdsDue`, table `action_holds` (in `ACTIONS_TABLES`, purged with the action), the read's `legal` marks with `holds` and `hold`. Regions `is-hold` (machine and shape) and `is-hold-legal-mark`, both in `actionHold`, as the drafted `where`s name. `holdsDue`'s project is read as action-clocks' is (first `rests_on` determination's project).
- **K899 (1).** Re-scan of my paths: the only member-read string holding "bundle" was `index.mjs`:958 ("a record the catalog rejects"); every other hit is an identifier (`bundle.md`, `bundle_id`, `bundles`) or SQL/comment. No test pinned the old words; a new one pins the new.
- **Tests:** `test/m/actions/` 59 pass, 1 fail: the R52 test pinning C-117.20–.22 (`grammar.ACTION_CATALOGUE_CHECKS.MACHINE_CANNOT_SET_HOLD` is undefined until ACTION-GRAMMAR #2 merges). Users of this module green: action-clocks 21, filings 45, escalation 35, action-plans 38, monitoring 72, plane 28, affordances 131, control-plane 85, action-grammar 22 (0 fail each). Checks: format 0, architecture 0, coverage 42/42, ownership 0.
- **Found elsewhere (comments only):** `control-plane/families.mjs`:55 and the action-grammar/action-clocks headers still say `actions/checks.mjs` re-exports or is deleted later; golden data in `test/m/action-grammar/golden.json`:202 names its old `where` (a record of the move, harmless).
- **Stale artifact:** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`).

Next: when action-grammar is on `tranche/T20`, I merge it, re-run steps 5–7 and post COMPLETE. Send me a CHANGE (or ring) when it lands.
