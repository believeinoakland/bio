# WORKER — the standing brief. Every spawned worker reads this FIRST, WHOLE.

One rule per line, each naming its ruling. **The receipts and the reasoning are in
`docs/archive/WORKER-kickoff-2026-09-24.md`, verbatim, under the same headings** (M0-194, BOB #34 2026-09-24 22:50Z);
`node tools/decided.mjs "<id>"` finds them. `id undetermined`: the old text named no ruling for that rule; the rule
stands, and its receipt is in the archive. Every line carries a tag `W<n>`; the map
from the old text's rules to these tags is `measurements/M-147.md`, checked by `node tools/rulemap.mjs`.

- **W1** · A spawn brief is the ITEM and nothing else; the practices live here (id undetermined — Bob caught the hand-carried brief four times).
- **W2** · Your brief contradicts this file → your brief wins. Your brief is silent → this file governs (id undetermined).

## Read the design before the code

- **W3** · Read the design section your row names FIRST, then the code; its front matter says how complete it is (`CORPUS-STANDARD.md` §4.7, 2026-09-14).
- **W4** · Code and design disagree → the document's Status says which is the authority; never resolve it silently (§4.7).
- **W5** · A gap in the design goes in your REPORT under `DESIGN GAP:` naming document and section (§4.7).
- **W6** · The section your row names does not exist → stop and report before building anything (§4.7).

## Waiting

- **W7** · To wait for a quiet machine run `node tools/waitquiet.mjs` (`--check` answers once); never hand-roll the loop (id undetermined; receipt 2026-08-09, the tool's header).
- **W8** · A wait you do write: its negative control is running the predicate once with nothing running (id undetermined).
- **W9** · Launch a long run so its EXIT is your signal — foreground, or backgrounded through the harness (id undetermined; receipt CASE-4, 2026-09-10).
- **W10** · A hand-rolled wait is BOUNDED and checks the PROCESS, not the signal; no process means the run is over — read what it wrote (id undetermined; CASE-4).
- **W11** · A worker is RUNNING A TOOL or DONE AND SAYING SO; "waiting for X" with no pending call is a hang (id undetermined; CASE-4).

## Your environment

- **W12** · No `node_modules`? `npm ci` in `bio-plane/`, `pdf-worker/`, `ocr-worker/`; read every exit status UNPIPED (id undetermined; `CLAUDE.md` §5, §6).
- **W13** · Your worktree may be one merge behind `main`: check, and bring it level before you measure (id undetermined).
- **W14** · Never `git stash` — `refs/stash` is shared by every checkout; need a clean tree, `git worktree add` one (id undetermined).
- **W15** · Files YOU make — logs, baselines, copies of files, a clone of the repo — go in your session scratchpad, never the worktree (BOB #32, 2026-09-24).
- **W16** · A control driver's or tool's own pen, GITIGNORED and ITEM-NAMED, stays in the worktree: it is not scratch (BOB #33, 2026-09-24 17:12Z).
- **W17** · The scratchpad is neither isolated nor durable: name files for YOUR item; COMMIT what a claim rests on (BOB #32; REC-194 F6).
- **W18** · PUSH your own branch: `git push origin HEAD:refs/heads/land/worker/<row id>`; never to `main`, never force, never merge (D-288, BOB #12; M0-111).
- **W19** · A branch the train RETURNS comes back by name: rebase it on `origin/main` and push the same ref (M0-111, TREE-SHARING §2).
- **W20** · Name `store=scratch` on every live call. A confined credential makes the naming REDUNDANT, not OPTIONAL (BOB #34, 2026-09-24 22:22Z; D-463).

## Measurement

- **W21** · Measure your own baseline and trust it over your brief; report either way (id undetermined).
- **W22** · Attribute your delta PER SUITE by re-running the true baseline, never by subtraction (id undetermined).
- **W23** · A vendor's documentation is a CLAIM, labelled as theirs (id undetermined; `CLAUDE.md` §5).
- **W24** · An equality or outcome that costs nothing to produce is not evidence (id undetermined; `CLAUDE.md` §5).
- **W25** · A corpus figure moves while a battery runs on the same checkout: take instrument figures on a quiet tree (id undetermined).
- **W82** · A measurement that gates nothing is not an instrument: a figure you add must fail a gate when it moves the wrong way, or be labelled report-only (D-550).
- **W83** · A verdict must not depend on load: a suite that passes alone and fails under a concurrent battery is a defect in the suite, fixed by controlling what it waits on, never by retrying (D-571).

## Negative controls

- **W26** · Break what you tested and see the suite fail; each arm ALONE; declare before arming what MUST fail and what MUST NOT (id undetermined; `CLAUDE.md` §5).
- **W27** · Always include an over-strictness arm: correct work in a spelling you did not anticipate must PASS (id undetermined).
- **W28** · Verify every restore by sha256 AND `cmp` against uniquely-named per-arm pristine copies, printing a byte count and guarding a minimum (id undetermined).
- **W29** · A surprising green is a finding about your ARM: record it, do not smooth it (id undetermined).
- **W30** · Check your suite reached its own FOOT before believing a count; a missing tally is `-1`, never `0` (id undetermined).
- **W31** · A digest of `e3b0c442…` is the empty string: a restore "identical" over an EMPTY manifest proves nothing (id undetermined).
- **W32** · An arm that never ARMED (zero matches, a doubled anchor, a missing path) is a finding (id undetermined).
- **W33** · An arm that could never have been honoured (a field on objects the code rebuilds) is a finding (id undetermined).
- **W34** · Totality assertions pass over an empty corpus: assert the fixture non-empty, print it, floor it (id undetermined).
- **W35** · Keep a BASELINE row: it alone tells six arms broken from six arms working (id undetermined).
- **W36** · An idempotent transform hides a revert from behaviour; pin the structure too (id undetermined).
- **W37** · A sweep arm can fail by citing itself, and a check catch its own correction: suspect the instrument first (id undetermined).

## Sweep for the class

- **W38** · Never fix only what was reported: find every instance of the KIND, print corpus size and reach, and state what your matcher cannot see (id undetermined).
- **W39** · Distinguish a defect from a deliberate closure, and say which (id undetermined).
- **W40** · Invert, do not lengthen a list; and print what you could not classify, never score it zero (id undetermined).

## The record's rules

- **W41** · Undetermined is first-class and must be STATED; never invent an attribution to pass a gate (`CLAUDE.md` §4).
- **W42** · A defect that makes the record claim more than it can support is worse than a missing feature (`CLAUDE.md` §2).
- **W43** · Correct superseded tests, never exempt them, with a comment saying why the old one was wrong (`CLAUDE.md` §5).
- **W44** · Test through the op: a store-level test is not evidence a caller can reach the feature (`CLAUDE.md` §5; receipt `op=invitelook`).
- **W45** · A mechanism believed for its EXISTENCE rather than its behaviour is this project's commonest defect: drive it (id undetermined).
- **W46** · A fence tighter than its rule is an undeclared interface change, not a safer fence (id undetermined).

## DEC-49 and the floors

- **W47** · Every refusable condition has a code with a canned translation, a STRING LITERAL at its site through the helper `refusal` (DEC-49).
- **W48** · A row's `where` names the SMALLEST span: a `DEC-49 REGION <name>` / `END DEC-49 REGION <name>` pair, never a whole function (DEC-49).
- **W49** · Move every floor you invalidate in the SAME TURN, from the figures the instrument PRINTED, never by arithmetic on the file (DEC-49).
- **W50** · A ceiling is not a ratchet, and a floor with slack is not one either (DEC-49).
- **W51** · A floor that FALLS carries its reason at the site (DEC-49).
- **W52** · `regionLines` is a property of the MERGED source: touch a governed region and say so in your report (DEC-49).
- **W53** · `REGISTER_FLOOR` in `bio-plane/scripts/coverage.mjs` has ONE key set: on a conflict, collapse to one and re-read the printed figures (DEC-49).
- **W54** · `_CHECKS` is a reserved suffix: the DEC-49 guard harvests every `/_CHECKS$/` export as a refusal family (DEC-49).
- **W81** · A governed refusal is built as a LITERAL, never spread: the DEC-49 guard cannot resolve a verdict inherited through a spread, so a spread refusal reads as a region with no refusal (D-468; BOB #34 2026-09-24 23:51Z).

## Ids

- **W55** · Take every new id with `node tools/mintid.mjs <NS>`: a compare-and-swap push to `origin/coord`; if it cannot push it refuses — report that, never number by hand (D-242).
- **W56** · Never write a worked example naming "the next free number" into a corpus file (id undetermined).

## Boundaries

- **W57** · Claim your paths in `CLAIMS.md` on `coord`, through `node tools/coord.mjs`, before an edit that spans landings; none for one landing (BOB #27, 2026-09-22; M0-110).
- **W58** · Do not edit another area's paths: append a DELEGATION and continue (`CLAUDE.md` §4).
- **W59** · A DELEGATION you raise carries `**open as of YYYY-MM-DD** — <why>` on its own line, or `plancheck` fails (M0-37).
- **W60** · Your landing closes someone's delegation → write the discharge IN THAT BLOCK (M0-37).
- **W61** · An owed act never lives only in a note: a DELEGATION or your report's "for CONDUCT" list, as an ACT with its actor (id undetermined; receipt FL-10, 2026-09-14).
- **W62** · Do not deploy, bump a version or cut a tag — DIST's; `newgroup/**` is out of bounds without an explicit instruction (`CLAUDE.md` §4).
- **W63** · Never block on Bob: ship a provisional recorded in the shape `kickoffs/README.md` defines (`CLAUDE.md` §3).
- **W64** · Change a shape another area builds against → file the IC as `interface-changes/<id>.md` with MEASURED consumer impact; CONDUCT takes the bump and RESOLUTION (M0-100).

## Before you finish

- **W65** · Touched a bundled source → `node tools/bundles.mjs` rebuilds every stale bundle, BEFORE the battery; a comment-only change may move one (M0-178; REC-110, REC-119).
- **W66** · Edited a governed design doc → move its Status `as of` to today, `node tools/corpuscheck.mjs` to 0 fail (M0-141).
- **W67** · Built or removed something → `construct-status.json` in the same commit, probes on CODE naming a symbol that matches exactly once; `status.mjs --check` to 0 drift (M0-155, M0-160).
- **W84** · Edit `construct-status.json` TEXTUALLY, never round-tripped through a JSON serialiser (D-468 rewrote 4,486 lines unseen).
- **W68** · `cd bio-plane && npm run test:battery` — the WHOLE battery, green (id undetermined).
- **W69** · `node scripts/coverage.mjs --strict` — directly, `$?` read unpiped, exit 0 (id undetermined).
- **W70** · `node civicos-ui/test/run.mjs` from the REPO ROOT, exit 0, even if you think you did not touch the UI (id undetermined).
- **W71** · `node tools/plancheck.mjs` — 0 fail once your branch is pushed; it refuses a merge marker anywhere (D-569).
- **W72** · Commit, PUSH, then `git ls-remote --heads origin land/worker/<row id>` must answer your sha (D-288).

## Report back

- **W73** · Your final text is the return value: pushed branch and sha read from `git ls-remote`, what landed, the numbers, every control arm declared and actual, the sweep and its blind spots, delegations, decisions for Bob (D-288).
- **W74** · State plainly what you could NOT do; a narrowed unknown is a legitimate result (id undetermined).

## Logs and the scratchpad

- **W75** · A log with a generic name is not yours: name every scratchpad file for your item, and check a log's `provenance:` line against your HEAD before believing it (id undetermined; receipt REC-98).
- **W76** · A scratchpad file can vanish mid-session: print each figure as you take it and COMMIT the artifact a claim rests on (M0-183; receipt REC-194).

## Killing processes

- **W77** · Kill by PID, or the process group you started — never `pkill -f` a machine-wide pattern (id undetermined; receipt REC-105).
- **W78** · Read the battery's own completion line and exit, never a wrapper's; no completion line means it did not finish (id undetermined; receipt M0-38).
- **W79** · Killed something on a shared machine → say so in your report and name the window (id undetermined; receipt REC-105).

## Searching

- **W80** · A search is an instrument: check it COMPILED before believing it, most of all when a search for absence returns hits (id undetermined; receipt BOB #11).
