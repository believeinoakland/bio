# conformance (T20)

**Status** · session_01EBsqtXm8RVa7m7wuunkc8a · depth 2 · WORKING · handled B1

## Completion

**Entry applied:** `build/plan/current.md` (T20) layer 9, conformance (K903 (4), DEC-36; N303, N320), R24 and R9's re-wording, as BOB's B1 states it, in `bio-plane/src/conformance/index.mjs`:
- `UNSEEN` deleted. One read-local sight (`#sight`) withholds what the viewer may not see and leaves it out whole, with no id, placeholder or count. Its `mark` adds `out_of_view: true` only when something was withheld. A viewer who sees everything gets the same answer as before, with no `out_of_view` key.
- `determinationRead`: hidden standards leave `standards` and `outcomes`, along with their rows and disagreement. Hidden findings leave `findings`. A question whose inquiry is hidden loses its `inquiry` key, and `question` and `opened` stay. Hidden evidence ids leave `cause.evidence`, `act.evidence` (`#actView` now takes the sight) and each row's `content`. `outcomes_differ` is computed over every standard (R24).
- `#flag` returns `{causes, withheld}`. A cause is left out when its subject is a finding, standard or passage the viewer may not see, whether it comes from the stored `determination_flags` rows or is derived. A standard the viewer may not see, or whose read is refused, adds no causes. A superseded standard whose successor the viewer may not see keeps its cause without `detail`. `basis_changed` stands while any cause is left.
- `determinationsFor`: the same filtering for the act's evidence, outcomes and findings, with `out_of_view: true` on the item only, never on the page.
- `#proposalView` (`comparisonPropose`, `comparisonRead`): hidden standards leave `standards` with their rows. A hidden `contradiction` is left out (not null), with `out_of_view: true`. A proposal naming none keeps `contradiction: null`. Hidden evidence ids of the act and rows, and a question's hidden `inquiry`, are withheld too (R24's "every read").
- Improvement in my own module: an id the record does not hold (a proposal's free words) is authored text. It stands and is not counted as withheld, so `out_of_view` never claims a withholding that did not happen.

**Tests** (`bio-plane/test/m/conformance/`): `reads.test.mjs`'s old R9 placeholder test is re-keyed to R24 (pat sees empty `findings`, `outcomes` and `standards` with `out_of_view: true` on the read and on the `determinationsFor` item, and no id or placeholder in either; olive is the negative control). Added:
- an R11/R24 test: `out_of_view` appears on the item, never on the page;
- an R6/R24 test: a question whose inquiry is hidden;
- an R10/R24 test: a pinned finding hidden from pat and then reopened. pat sees no cause, no F and `out_of_view: true`, and once a visible cause exists `basis_changed` stands with only that cause. olive's read names the hidden cause;
- an R10/R24 test: a standard superseded by a hidden one loses its `detail`, and a hidden passage cause and hidden evidence are withheld;
- an R12/R24 `comparisonRead` test.

In `contradiction-cause.test.mjs`, the cause test is re-keyed to `evidence: [ev.content]` with `out_of_view: true` (olive's assertion unchanged), and the R12 test to `contradiction` absent from the proposal plus `out_of_view: true`. A proposal naming no contradiction keeps `contradiction: null` and has no `out_of_view` key. No old suite was deleted (K619).

**Tests and checks run:**
- `node --test test/m/conformance/`: `ℹ pass 54`, `ℹ fail 0`.
- The whole `test/m` (`node --test "test/m/**/*.test.mjs"` in `bio-plane/`): `ℹ tests 4639`, `ℹ pass 4619`, `ℹ fail 0`, `ℹ todo 20`. The same suite on the pre-change tree in a scratch worktree had 3 failures (`test-support`'s read-only tree removal and two `extraction` files). These came from the worktree environment, they do not touch conformance, and they pass in the real checkout. There is no new red.
- `node checks/format.mjs`: `format: 84 modules, 82 requirements files; 0 failures`
- `node checks/architecture.mjs … conformance`: `architecture: 9 product files, 42 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs … conformance`: `coverage: 1 modules, 24 of 24 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs … conformance tranche/T20`: `ownership: 4 files changed by conformance between tranche/T20 and HEAD; 0 failures`

**Readers of my answers** (re-scanned in `bio-plane/src` and `bio-plane/test/m`; reported in a REPORT; not edited, §12.2):
- **filings** changes. `#det` (:295–310) maps findings and standards, and `#block` (:404–405) detects a withheld finding by a null `finding` (`fs.length !== det.findings.length`) and a withheld standard by a failed read of its id. A hidden item now simply leaves the list. filings then lists only what is left and says nothing was withheld, unless it reads `out_of_view`. `#fact` (:758–760) and the packet's standards (:941–942) still build their own "an object you may not see" placeholders, which my answer no longer reaches. Its act evidence also now omits hidden ids.
- **action-plans** changes. `#support` (:188–206) loops over `d.findings`' frozen grades. A hidden finding used to be a null entry with no `frozen`, which read as "short". It now leaves the list, so support can read "established" for that viewer unless it reads `out_of_view`.
- **No change:** escalation (:104 `outcomesOf` already dropped non-string standards; :244 and :554 read `live` and `act` only); consequences (:267–278, an outcome lookup by standard id gives null either way); actions (:733, `live` and `superseded_by`); action-clocks (:177, `project`). No test in `test/m` outside conformance went red: under the real sight rule (membership R43) a member sees every non-project bundle, so these arms are reached only through a substituted sight rule.

**Generated artifact made stale:** the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` / `.bundle.json` (`not_product`), regenerated by BOB at layer close. I did not write it.

**Deferred:** none. **No row changes** (read shape only); nothing awaits stamp.

Size (session_01EBsqtXm8RVa7m7wuunkc8a): test runs 4, module lines 1538

## J1 · REPORT

R24 is merged on job/T20/conformance (d712a50ca2). Two readers' answers change for a viewer with something withheld, and BOB accepts each one's red by name until its own L9 job: (1) filings: #det/#block (:295-310, :404-405) detect a withheld finding or standard by a null id or a failed read; a hidden item now leaves the list, so filings must read the determination's out_of_view (and its act evidence now omits hidden ids); its own placeholders at :758-760 and :941-942 are no longer reached from my answer. (2) action-plans: #support (:188-206) treated a hidden finding (null, no frozen) as 'short'; it now leaves the list, so support may read 'established' unless it reads out_of_view. No change: escalation :104/:244/:554, consequences :267-278, actions :733, action-clocks :177. No test in test/m went red. Stale generated artifact: the plane bundle bio-plane/dist/bio-plane.bundled.mjs (.bundle.json).
