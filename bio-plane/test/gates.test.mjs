/* D-293 WITH M0-98 — THE GATE'S VERDICT, RECORDED BY TREE AND REFUSED AT THE PUSH; AND THE TARGETED
 * CLASS WITH `--since`. One file set (`tools/gates.mjs`, `tools/pushguard.mjs`), one suite, one gate.
 *
 * NEGATIVE CONTROL (BOB #29, 2026-09-23, run by hand, each arm ALONE, restored by `cp` and sha256- and cmp-identical):
 *   (R1) `pushguard.mjs` effectiveVerdict's failedUnits branch disabled (a named failure opens the whole step again)
 *        -> 85/2: "...so the tree is open at that one unit and no other" and "the NEXT plain run … is a RERUN of
 *        the failed suite alone"; sha256 298c768b… before and after.
 *   (R2) `gates.mjs` §2d disabled (the gate reads no record of its own tree) -> 85/2: the RERUN arm and "a run on a
 *        tree already recorded GREEN runs NOTHING"; sha256 b0649dd8… before and after.
 * NEGATIVE CONTROL: RAN 2026-09-21 by the D-293/M0-98 worker, driver `test/gates.control.mjs` (thirteen arms plus
 * a baseline), each arm ALONE against pristine copies restored by sha256 AND `cmp` AND a byte floor; baseline
 * 62 pass / 0 fail, closing 62 / 0, the driver 96 pass / 0 fail (its D-331 preflight refused to arm ANYTHING on
 * an earlier run, when the comment-blind refactor had moved arm 4's anchor — the driver law doing its job) —
 *   (1) the guard's lookup dropped, BOB #22's own control -> "a RED gate then a push of that tree is REFUSED" FAILS
 *       by name, with the amend, other-worktree, narrower-GREEN and GREEN-note arms; an unrecorded, a GREEN, a changed
 *       tree and a GREEN re-run each still push;
 *   (2) the record keyed on the COMMIT, writer and reader alike -> the AMEND arm FAILS, and every arm reading the
 *       record by the tree; the plain RED-then-push refusal HOLDS, same commit, which is why a commit key looks right;
 *   (3) `bio-plane/src/` dropped from FULL -> "a src/ edit BESIDE a tools edit reads FULL" FAILS, and the plane-merge
 *       `--since` arm with it; tools-only still reads TARGETED and every other FULL category still FULL;
 *   (4) selection by import alone -> the COMPUTED-path arm FAILS, with the walker arm; the importer is still selected;
 *   (5) the clean-at-start check removed -> "...and the gate says why" FAILS; the dirty run is still not recorded,
 *       because the end-of-run check backs it — a real redundancy, kept. **TRUE WHEN WRITTEN, FALSE FROM
 *       2026-09-23 (`7eace1e21` put a second verdict write in front of §4) AND TRUE AGAIN FROM M0-157**: the
 *       dated control block at the foot of this header says what it measured;
 *   (6) the end-of-run check removed -> "a tree that CHANGES while the gate runs is NOT recorded" FAILS;
 *   (7) `--since` ignoring the record -> both fallback arms FAIL; disjoint docs still re-run only plancheck;
 *   (8) both sides read as the SAME FILE changed on both -> "a unit reading BOTH sides re-runs" FAILS;
 *   (9) the register gate dropped -> "selects the register gate (coverage --strict)" FAILS;
 *   (10) the last run's verdict wins -> "a NARROWER GREEN does not clear a WIDER RED" FAILS, with the guard's own
 *       in-process control; a GREEN re-run still clears and a lone RED still refuses;
 *   (11) a change made after the gate read as the other side's -> "a commit made AFTER the gate is re-checked"
 *       FAILS; disjoint docs and both-sides hold;
 *   (12) an imported helper read WITH its comments -> the helper-COMMENT arm FAILS (the suite is selected over a
 *       path its helper only cites in prose); the helper-CODE arm holds;
 *   (13) the other side's prose read unbounded by DOCS in a `--since` pairing -> the CITES arm FAILS (a suite
 *       that only names the moved note in its own prose re-runs); the doc-facing reader still re-runs.
 * THE ELEVENTH ARM EXISTS BECAUSE THE FIRST `--since` WAS UNSOUND, found while measuring this item's own landing:
 * it read EVERY difference from the measured tree as the other side's already-gated change, so a commit added
 * on top of a GREEN tree re-ran nothing of its own. The difference the other side does not explain is now
 * re-checked as TARGETED would; the bases are taken against `origin/main`, never against HEAD.
 * TWO ARMS FOUND DEFECTS IN THIS SUITE BEFORE THOSE FIGURES, both fixed and both said at their sites: the first
 * run of arm 1 left the amend arm GREEN because the amended push failed as a NON-FAST-FORWARD over the pre-amend
 * commit the broken guard had let land — so every refusal is now read from the guard's own text and pushed to a
 * ref of its own; and the first run of arm 4 broke the mid-run arm through SELECTION (no suite selected, so the
 * dirtying battery step never ran), so that arm now runs `--full`.
 * RE-RUN 2026-09-22 by the M0-99 worker, after the fixture stopped copying `decided.mjs` and regenerating the index
 * before each commit: all thirteen as declared again, driver 96 pass / 0 fail, baseline and closing 62 / 0.
 * RE-RUN 2026-09-22 by the M0-107 worker with two arms added and G10's anchor corrected for the third verdict:
 *   (14) an expired budget recorded GREEN -> "a timeouts-only run writes NO RED record: it records NOT MEASURED"
 *       FAILS (with the gate's NOT MEASURED line); the bare-124 arm and the RED refusal hold;
 *   (15) ANY exit 124 taken as an expired budget -> "a battery exiting 124 WITHOUT a verdict file naming a
 *       timeout is RED" FAILS alone; the NOT MEASURED push and the RED refusal hold.
 * All fifteen as declared, driver 110 pass / 0 fail, baseline and closing 74 / 0.
 * RE-RUN 2026-09-22 by the M0-116 worker with two arms added, G4's anchor moved off the line M0-116 rewrote, and two
 * fixtures corrected (a comment no longer stands for a read — see `prose` and `cites` in FILES):
 *   (16) a unit's OWN files read with their comments again, BOB #27's control -> "a suite whose OWN COMMENT is its only
 *       mention of the file is NOT selected" FAILS alone; the string-path reader is still selected;
 *   (17) strings blanked with the comments, the LIAR (selecting nothing reads as "fewer units") -> "a suite that READS
 *       the file through a STRING path is selected" FAILS, with the computed-path and walker arms; the comment-only
 *       suite is still not selected. G12 now also fails the own-comment arm (it reads every file whole), as it should.
 * All seventeen as declared, driver 123 pass / 0 fail, baseline and closing 78 / 0. On the REAL estate the same break
 * (16) takes a MEASUREMENTS-only TARGETED plant from 85 selected units back to 109 (`MEASUREMENTS.md` M-106).
 *
 * NEGATIVE CONTROL: RAN 2026-09-24 by the M0-173 worker, same driver, arm G22 ALONE (`node
 * bio-plane/test/gates.control.mjs G22`), driver 13 pass / 0 fail, exit 0, `gates.mjs` restored byte-identically:
 *   (22) THE COORD PIN NOT SET — `gates.mjs` §0b's `process.env.BIO_COORD_REF = sha` replaced by `void sha`, so every
 *       unit reads the moving `origin/coord` again, which is the state CONDUCT #20 measured red on the hour ->
 *       baseline 110 pass / 0 fail, armed 106 / 4, and the four are EXACTLY the declared ones: "every unit of one run
 *       read the SAME coord commit and the SAME state", the battery's read AFTER its own fetch, the gate's printed
 *       PINNED line and the RECORD's `coord` field. Closing 110 / 0.
 *       THE PRINTED LINE AND THE RECORD BREAKING IS THE FINDING, and it was DESIGNED IN after the arm's first
 *       reading: with `pinned` hardcoded true they went on claiming a pin over units reading the moved ref — a
 *       mechanism believed on its existence rather than its behaviour. They are now read back from the variable the
 *       children are actually given, so a gate that fails to pin cannot report that it did.
 *       MUST NOT, and did not: the mid-run fetch still MOVES the ref (the arm is armed), the same reader unpinned
 *       still reads the moved state (the identity costs something), a PLANTED override is still kept, and a checkout
 *       with no `origin/coord` still says NOT PINNED.
 *       RE-RUN 2026-09-24 after the fixture was SEALED from the outer run's own pin (see the section): the same
 *       four, baseline and closing 110 / 0, driver exit 0.
 * NEGATIVE CONTROL: RAN 2026-09-24 by the M0-143 worker, same driver, arms G17-G19 each ALONE, baseline and closing
 * 96 pass / 0 fail, driver 30 pass / 0 fail, both subjects restored sha256- and cmp-identical at 86,802 and 94,212
 * bytes after every arm:
 *   (18) the DOC-FACING selector reading a suite's own files WHOLE again -> "...and a suite whose ONLY `docs/`
 *       mention is in a COMMENT is NOT doc-facing" FAILS by name, with the tool-comment arm and the whole-set pin;
 *       the STRING reader and the tool-named-in-CODE reader both still doc-facing (3 fail of 96);
 *   (19) the SECOND site, `toolReachesDocs`, reading a tool WHOLE again — the HALF-FIX, which is the shape this
 *       row's own defect would take if only `docFacing` were patched -> "a TOOL whose own `docs/` mention is only in
 *       ITS comment reaches no prose…" FAILS by name, with the whole-set pin, and NOTHING else (2 fail of 96);
 *   (17) re-read: blanking strings now also fails the doc-facing STRING reader and the whole-set pin, because M0-143
 *       put §2 under the SAME `codeOf`. Declared in the arm rather than discovered — 11 fail of 96.
 *
 * NEGATIVE CONTROL: G5 RE-RUN 2026-09-24 by the M0-157 worker, ALONE, on the fix it drove — the arm asserts a
 * REDUNDANCY, and it was the assertion that was right and the SUBJECT that was wrong:
 *   (5) re-read, BEFORE the fix: baseline 96/0, armed **93/3** and NOT isolated. The MUST NOT failed — the dirty run
 *       WAS recorded — and a THIRD failure nobody had declared came with it. Diagnosed at the armed gate's own
 *       output rather than by reading the source: `gates.mjs` §2d's tree-keyed shortcut, reached because the armed
 *       `CLEAN_AT_START` read clean, wrote a SECOND record for that tree (`GREEN`, class `REUSED`, `already GREEN by
 *       <the clean run's record>`) and exited 0 — BEFORE §4, which is the ONLY site the end-of-run check guards. The
 *       undeclared third failure, "a tree that CHANGES while the gate runs is NOT recorded", asserts the same record
 *       COUNT and fell with it: collateral, and it is now DECLARED in G5's `mustNotBreak` so a re-run cannot absorb it.
 *   (5) re-read, AFTER it: baseline 96/0, armed **95/1** — the one being the declared `mustBreak` — closing 96/0,
 *       both subjects restored sha256- and cmp-identical. §2d now re-reads `status` and `HEAD^{tree}` itself, declines
 *       the shortcut when its own read disagrees with the start check, and lets the run reach §4. MEASURED at the
 *       sentence, not inferred: the armed gate prints `NOT RECORDED — the tree changed while the gate ran (1 path(s)
 *       dirty at the end)`, so the check doing the refusing really is the end-of-run one this arm names.
 *   AND THE ARM IS UNCHANGED, which is the finding's shape: **the declaration was TRUE when it was written and a
 *   landing in the SUBJECT made it false, with nothing re-running it.** Dated: G5 last read isolated on 2026-09-22
 *   (M0-116's re-run, seventeen arms as declared, driver 123/0), when §4 held the only `appendRun` in `gates.mjs`
 *   and its end-of-run check therefore backed every verdict write there was. §2d itself (BOB #29, `6873215ac`,
 *   2026-09-23) still wrote none — CHECKED, not assumed: that commit's `gates.mjs` holds ONE `appendRun` call. The
 *   SECOND landed later the same day in `7eace1e21` (BOB #29, "a gate that finds its tree already GREEN still RECORDS
 *   its answer (REUSED)"), whose own reason is sound and is quoted at the site — a caller reads its verdict from the
 *   run it caused, so writing nothing read as UNDETERMINED. It is the SITE, not the reason, that invalidated this arm.
 *   The 2026-09-24 re-run above ran G17-G19 only, so no run of G5 stood between that landing and M0-146's worker
 *   finding it. The general form,
 *   which is why it is written here rather than in a report: **an arm that asserts a REDUNDANCY is invalidated by a
 *   change that adds a SITE, not by a change to either check it names** — so `gates.mjs` gaining an `appendRun` is
 *   the event that owes this driver a re-run, and `grep -n appendRun tools/gates.mjs` (2 sites, 2026-09-24) is the
 *   one-line instrument that says whether it does.
 *   AND ONE TRAP PAID FOR HERE, so the next editor of this header does not pay it again: the first draft of the line
 *   above pointed a reader at this block BY NAMING THE REGISTER'S MARKER PHRASE, and `control-register.mjs`
 *   `declarationAt` ends a declaration at any line CONTAINING that phrase (`text.includes(MARKER_PHRASE)` — "the next
 *   declaration begins"). So a CITATION reads as a new marker: the (1)-(17) declaration was cut off at (5) and this
 *   file's recorded arms fell 17 -> 5, taking `coverage --strict` to `arms 2081/2093` and exit 1 — MEASURED both ways
 *   against origin/main 68fecb8d, which prints 2093/2093 and exit 0. The line is reworded, not the floor moved: a
 *   floor that falls for a citation is not slack. Refer to a control block by where it sits, never by the phrase.
 *   AND THE WHOLE DRIVER RAN, not only the arm whose row it was — the subject `tools/gates.mjs` is every arm's
 *   subject, so a change to it owes all of them. RUN TWICE, and the SECOND run is the one that stands:
 *     (i) on M0-157's own branch, 19 arms, driver 145 pass / 0 fail, baseline and closing 96/0.
 *     (ii) ON THE MERGE WITH `land/worker/M0-153` @ 8dde5a55, which corrected this same arm the OTHER way and added
 *     G20/G21: **21 arms plus baseline and closing, driver 166 pass / 0 fail, exit 0 read UNPIPED**, baseline and
 *     closing 101/0, both subjects restored sha256- and cmp-identical at 92,570 and 94,212 bytes after every arm.
 *     Every arm as declared, M0-153's two included. Per-arm armed tallies of 101: G1 92/9 · G2 72/29 · G3 92/9 ·
 *     G4 92/9 · G5 100/1 · G6 99/2 · G7 98/3 · G8 100/1 · G11 100/1 · G12 93/8 · G13 100/1 · G9 100/1 ·
 *     G10 99/2 · G14 98/3 · G15 100/1 · G16 99/2 · G17 70/31 · G18 98/3 · G19 99/2 · G20 99/2 · G21 100/1.
 *   G5's ONE failure under (ii) is its `mustBreak`, with all FOUR `mustNotBreak` assertions holding — the two this
 *   item restored and the two M0-153 added. That is the arm isolated on the union of both items' changes to the
 *   subject, which is the only tree either figure is about.
 *
 * NEGATIVE CONTROL: RAN 2026-09-24 by the M0-176 worker, same driver, arms G23-G25 each ALONE, baseline and
 * closing 124 pass / 0 fail, driver 55 pass / 0 fail read UNPIPED at exit 0, `tools/gates.mjs` restored sha256-
 * and cmp-identical at 105,884 bytes after every arm (`pushguard.mjs` untouched at 98,150). The three break the
 * ONE function every site reads through (`docsTaken`), which is why a single patch moves the key, the DOCS step
 * and both of `readersOf`'s bounds together:
 *   (23) the WHOLE-`docs/` door restored, the row's own control -> "the plan for each note is EXACTLY its readers
 *       plus the backstop" FAILS by name, with eight more: the path-granular arms, the TARGETED "net" arm and the
 *       `--since` cap arm. 115/9. The DERIVATION arms all hold, which is what says the door moved and §2 did not.
 *   (24) clause 3's BACKSTOP dropped — the false green this row can produce -> "a doc-facing suite that names NO
 *       path and NO directory keeps the whole tree" FAILS, 117/7; the three units that DO name their prose stay
 *       exactly where they were, so "fewer units" cannot pass for the fix.
 *   (25) clause 2 dropped -> "...and is BOUNDED to that directory" FAILS, 117/7 — and the shape is the finding:
 *       the assembly reader does not MISS its note, it falls through to clause 3 and takes the whole tree, so the
 *       arm fails WIDER rather than narrower. That is the two clauses being different rules, not one written twice.
 * ONE DECLARATION WAS WRONG AND IS CORRECTED RATHER THAN SMOOTHED. G24 declared the EMPTY-diff arm among its
 * expected failures; armed, it did not fail, and the subject is right: the DOCS step short-circuits on
 * `!docsChanged.length` before it asks any clause anything. It is now asserted UNBROKEN by all three arms.
 * ON THE REAL ESTATE, arm 23 by hand in an isolated clone: the MEASUREMENTS-only, kickoffs-only and
 * architecture-only probes go 39 / 35 / 30 back to 42 / 42 / 42 — the same list every time, `calibration.test.mjs`
 * among them — which is the door not looking at the path (`docs/development/measurements/M-146.md`).
 *
 * WHY THIS SUITE DRIVES A FIXTURE AND NEVER THIS REPOSITORY. `gates.mjs` is every lane's gate and
 * `pushguard.mjs` runs on every lane's push; a refusal arranged against this repository's remote
 * would be a real refusal of a real push. So every arm builds a REAL repository under the battery's
 * own temp ground — the REAL `gates.mjs` and `pushguard.mjs` copied in (and, until M0-99, `decided.mjs`), the REAL hook
 * installed the way `plancheck` installs it, a REAL bare remote — and stubs only the four gates the
 * gate RUNS (battery, coverage, the UI harness, plancheck), each of which logs what it was asked to
 * run and exits as the arm tells it. The verdict, the record, the refusal and the selection are the
 * real code; only the suites a gate would execute are stand-ins.
 *
 * HOW A LIAR PASSES THIS, STATED BEFORE WHAT IT CHECKS:
 *   - D-293's: keying the record on the COMMIT. An amend of the message alone makes a new commit over
 *     the same tree; a commit-keyed record reads it as never measured. So an arm AMENDS and asserts the
 *     refusal holds, and another asserts the key is `HEAD^{tree}` read by this suite, not the module.
 *   - M0-98's: selecting by exact IMPORT alone, which misses a suite reading its tool through a
 *     COMPUTED path. So the fixture carries one (`join(REPO, "tools", NAME + ".mjs")`) and an arm
 *     asserts it is selected.
 *   - `--since`'s: re-running only suites that read a file changed on both sides (the intersection of
 *     the two FILE sets). A tool moved on one side and its suite on the other shares no file, and that
 *     pairing was never measured anywhere. So an arm asserts the suite re-runs.
 * NEGATIVE CONTROL: RAN 2026-09-25 by the M0-152 worker, by hand, ALONE: `tools/gates.mjs`'s `if (cls === "DOCS" ||
 *   EXPLAIN)` put back to `if (cls === "DOCS")` (copied aside, restored sha256- and cmp-identical at 106,257 B) ->
 *   baseline 126 pass / 0 fail; armed 125 / 1, EXACTLY "M0-152: ...and `--explain` prints the SAME derived doc-facing
 *   set there"; its sibling (the diff reads TARGETED) held, so the arm moved the printing and nothing else.
 */
/* NEGATIVE CONTROL: RAN 2026-09-24 by the M0-154 worker, by hand, over the DERIVED fixture copy list
 * (`test/gatedeps.mjs`). Declared before arming; each arm ALONE, the other three suites held open; every
 * restore by `cp` from a uniquely-named pristine copy, verified by sha256 AND `cmp` AND a byte count.
 *   BASELINE (this tree, before the arms): gates.test.mjs 96 pass / 0 fail.
 *   (A1) ACCEPTS-WHEN — `tools/m0154probe.mjs` added and imported by `tools/gates.mjs`. MUST NOT fail:
 *        all four suites GREEN, each fixture's printed `gatedeps:` list one file longer. ACTUAL: green
 *        (gates 96/0, gateresults 52/0, entries 59/0, train 53/0), every list carrying `tools/m0154probe.mjs`.
 *   (A2) THE CONTROL THE ROW NAMES — A1 still armed, and this suite's HAND copy list restored verbatim.
 *        MUST fail, BY NAME, at "the fixture carries the REAL … (DERIVED)". ACTUAL (in `gates.test.mjs`,
 *        the suite armed): 24 pass / 72 fail, that assertion first and naming the file —
 *        `want [true,true,true,[]] got [true,true,true,["tools/m0154probe.mjs"]]`.
 *   (A2') A FINDING ABOUT THE ARM, not smoothed: A2's FIRST run threw `ENOENT` out of the assertion and
 *        ended the module with NO TALLY AT ALL — a control that dies proves nothing (`kickoffs/WORKER.md`).
 *        `missingFrom` below is that correction; A2 as recorded is the re-run against it.
 *   (A3) OVER-STRICTNESS — the same import written three ways the derivation was not written against:
 *        `await import("./m0154probe.mjs")`, `export { … } from "./m0154reexport.mjs"`, and an
 *        `import … from "./m0154absent.mjs"` inside a COMMENT whose target EXISTS on disk. MUST pass, and
 *        MUST copy the first two and NOT the third. ACTUAL: exactly that; gates 96/0, entries 59/0.
 *   (A4) THE HELPER'S OWN REFUSALS, driven directly: a `without` naming a file outside the closure THROWS
 *        (a stale exclusion cannot outlive its import); a missing root THROWS; `const IMPORT_RE` renamed in
 *        a scratch copy of `tools/gates.mjs` THROWS naming the line. All three as declared.
 */
/* NEGATIVE CONTROL: RAN 2026-09-25 by the D-566 worker, by a scratch driver, over the coord layer's DERIVED copy list
 * (section "M0-173 · THE COORD SNAPSHOT"). Declared before arming; each arm ALONE; every restore by `cp` from a
 * uniquely-named pristine copy, verified by `cmp`, sha256 and byte count (`tools/coord.mjs` 75bda677… 65,647 B), the probe
 * module deleted after every arm. BASELINE 124 pass / 0 fail.
 *   (A1) ACCEPTS-WHEN — `tools/d566probe.mjs` added and imported STATICALLY by `tools/coord.mjs`. MUST NOT fail.
 *        ACTUAL: 124 / 0.
 *   (A2) THE ROW'S CONTROL — A1 armed, and this suite's HAND list `["coord.mjs", "statepaths.mjs"]` restored (origin/main's
 *        file whole). MUST fail. ACTUAL: exit 1 — the suite DIES in that section with `ERR_MODULE_NOT_FOUND … coord-fx/
 *        tools/d566probe.mjs imported from … coord-fx/tools/coord.mjs`, naming the missing module, after "a checkout where
 *        origin/coord does not resolve says NOT PINNED" and before the FOOT: a crash, not a named assertion — recorded as
 *        what it is. Its loudness is the FOOT line's (no tally, never a green count).
 *   (A4) OVER-STRICTNESS — the hand list restored with NO import. MUST pass (the list was right on its day): 124 / 0.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, appendFileSync, existsSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { install, hooksDir, readRuns, effectiveVerdict, recordDir } from "../../tools/pushguard.mjs";
import { gateDeps } from "./gatedeps.mjs";     /* M0-154: the fixture's copy list is DERIVED, never kept by hand */
import { moduleClosure } from "./moduleclosure.mjs";   /* D-566: the coord layer's copy list, likewise */

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "../..");
/* M0-154 · WHAT THE FIXTURE CARRIES, DERIVED FROM `tools/gates.mjs`'s OWN IMPORTS, transitively, by the
   ONE shared helper — never a hand list here, which is the D-93 defect and cannot fail when it falls
   behind (`gates.mjs` loads each of these under a `try` and DEGRADES rather than crashing, so a missing
   copy silently weakens every assertion below). ONE derived dependency is deliberately NOT carried,
   `tools/gateresults.mjs`, and `without` is checked against the closure so the exclusion cannot outlive
   the import it names. Both reasons MEASURED 2026-09-24: (1) its mere PRESENCE turns the per-unit record
   on — `PER_UNIT_ON` in `gates.mjs` is `isFile(tools/gateresults.mjs)` — and this suite's subject is the tree-keyed D-293 shortcut, which BOB #30 suspends
   when that record is on: armed, two assertions here failed by name ("a run on a tree already recorded
   GREEN runs NOTHING and says so"). (2) this suite hands the
   fixture's gate `process.env` whole, so under a real outer gate the fixture would inherit
   `BIO_GATE_RESULTS_REMOTE` and write its own PASS records to the OUTER gate's results remote: the
   incident `gateresults.test.mjs` records against itself, which only its `CLEAN_ENV` prevents. */
const GATE_DEPS = gateDeps({ repo: REPO, without: ["tools/gateresults.mjs"] });
console.log(`gatedeps: gates.test.mjs fixture carries ${GATE_DEPS.length} derived file(s) — ${GATE_DEPS.join(", ")}`);
/* A FILE THE FIXTURE LACKS MUST FAIL AN ASSERTION, NEVER THROW PAST ONE. Found by this item's own control
   arm (M0-154, 2026-09-24): the first draft compared with a bare `readFileSync` on both sides, so a fixture
   missing a derived file ended the module with an ENOENT and NO TALLY AT ALL — a control that "fails" by
   dying proves nothing about the assertion, and `kickoffs/WORKER.md` records the same shape as a suite whose
   count reads clean. It reports the offending paths BY NAME instead. */
const missingFrom = (dir) => GATE_DEPS.filter((p) => {
  try { return !readFileSync(join(dir, p)).equals(readFileSync(join(REPO, p))); } catch { return true; }
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
/* The FOOT sentinel (`mintid.test.mjs`'s): a TypeError inside an assertion ends the module while the
   tally still reads clean, so every section bumps this and the last assertion requires all of them. */
const SECTIONS = 13;  /* M0-107: +1; M0-116: +1; BOB #29 (re-run only what failed): +1; M0-143: +1; M0-153: +1; M0-173 (the coord snapshot): +1; M0-176 (the path-granular doc-facing door): +1 */
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "gates-"));
const LOG = join(SANDBOX, "stub.log");
const ID = ["-c", "user.email=d293@example.invalid", "-c", "user.name=D-293 suite"];
const git = (args, cwd) => spawnSync("git", args, { cwd, encoding: "utf8" });
const out1 = (args, cwd) => git(args, cwd).stdout.trim();

/* ------------------------------------------------------------------ the fixture
 *
 * The stubs: each logs `<name> <argv>` to GATES_FIXTURE_LOG and exits 1 when its name is in
 * GATES_FIXTURE_FAIL. The battery stub, told GATES_FIXTURE_DIRTY=<repo-relative path>, writes that
 * TRACKED file mid-run — the tree changing under a running gate. The path arrives by environment so
 * no stub's SOURCE names a fixture file: a stub that did would read, to MENTION, as a unit reading it. */
const stub = (name) => [
  `import { appendFileSync, writeFileSync } from "node:fs";`,
  `import { spawnSync } from "node:child_process";`,
  `const name = ${JSON.stringify(name)};`,
  `if (process.env.GATES_FIXTURE_LOG) appendFileSync(process.env.GATES_FIXTURE_LOG, name + " " + process.argv.slice(2).join(" ") + "\\n");`,
  `if (name === "battery" && process.env.GATES_FIXTURE_DIRTY) writeFileSync(new URL("../../" + process.env.GATES_FIXTURE_DIRTY, import.meta.url), "dirtied mid-run\\n");`,
  /* M0-107: the battery stub told GATES_FIXTURE_TIMEOUT=<unit> behaves as a real battery whose only failure was
     an expired budget: it writes the verdict file the gate hands it and exits 124. GATES_FIXTURE_BARE124 exits
     124 and writes NOTHING — a 124 the gate must not take on trust. The unit arrives by environment, as above. */
  `if (name === "battery" && process.env.GATES_FIXTURE_TIMEOUT && process.env.BIO_BATTERY_VERDICT) { writeFileSync(process.env.BIO_BATTERY_VERDICT, JSON.stringify({ v: 1, verdict: "NOT MEASURED", exit: 124, failed: [], notMeasured: [{ unit: process.env.GATES_FIXTURE_TIMEOUT, timeouts: ["a planted expiry"] }] })); process.exit(124); }`,
  `if (name === "battery" && process.env.GATES_FIXTURE_BARE124) process.exit(124);`,
  /* M0-173: THE COORD READER, and the MOVE. Told GATES_FIXTURE_COORDREAD=<state path> and COORDMOD=<absolute path of
     the fixture's real `tools/coord.mjs`>, a stub logs what the REAL reading layer answers for that path — the ref it
     resolved and the state's first line — so a run's readings can be held against each other and against the state the
     ref held when the gate began. Told GATES_FIXTURE_COORDFETCH, the battery stub then FETCHES `coord` and reads AGAIN:
     a lane's write arriving mid-gate the way it really arrives, through this checkout's own fetch (`mintid` ran 31 in
     one pass, measured 2026-09-23). Both paths arrive by environment, as GATES_FIXTURE_DIRTY does and for the same
     reason. The cache is reset before each read: two reads in one process are two reads. */
  `const coordRead = async (tag) => {`,
  `  const C = await import("file://" + process.env.GATES_FIXTURE_COORDMOD);`,
  `  C.resetCoordCache();`,
  `  const w = C.whereReads(C.ROOT);`,
  `  const st = String(C.readState(C.ROOT, process.env.GATES_FIXTURE_COORDREAD) ?? "ABSENT").trim().split("\\n")[0];`,
  `  appendFileSync(process.env.GATES_FIXTURE_LOG, [name, tag, (w.sha || "none").slice(0, 8), st].join(" ") + "\\n");`,
  `};`,
  `if (process.env.GATES_FIXTURE_COORDREAD && process.env.GATES_FIXTURE_COORDMOD) await coordRead("coord");`,
  `if (name === "battery" && process.env.GATES_FIXTURE_COORDFETCH) {`,
  `  spawnSync("git", ["fetch", "-q", "origin", "+refs/heads/coord:refs/remotes/origin/coord"], { cwd: process.cwd() });`,
  `  if (process.env.GATES_FIXTURE_COORDREAD && process.env.GATES_FIXTURE_COORDMOD) await coordRead("coord-after");`,
  `}`,
  /* BOB #29: GATES_FIXTURE_REDSUITE=<unit> behaves as a real battery that ran every suite and names ONE failure: it
     writes the verdict file with `failed: [<unit>]` and exits 1. GATES_FIXTURE_LEAK adds `leaking: true` — a finding
     that is the run's, not a suite's. */
  `if (name === "battery" && process.env.GATES_FIXTURE_REDSUITE && process.env.BIO_BATTERY_VERDICT) { writeFileSync(process.env.BIO_BATTERY_VERDICT, JSON.stringify({ v: 1, verdict: "RED", exit: 1, failed: [process.env.GATES_FIXTURE_REDSUITE], leaking: !!process.env.GATES_FIXTURE_LEAK, sharedLog: false, notMeasured: [] })); process.exit(1); }`,
  `process.exit(String(process.env.GATES_FIXTURE_FAIL || "").split(",").includes(name) ? 1 : 0);`,
  "",
].join("\n");

const FILES = {
  "tools/plancheck.mjs": stub("plancheck"),
  "tools/widget.mjs": "export const widget = () => 1;\n",
  "tools/computed.mjs": "export const computed = () => 2;\n",
  "tools/lonely.mjs": "export const lonely = () => 3;\n",
  "bio-plane/package.json": `${JSON.stringify({ name: "fixture-plane", private: true, type: "module",
    scripts: { "test:battery": "node scripts/battery.mjs" } }, null, 1)}\n`,
  "bio-plane/scripts/battery.mjs": stub("battery"),
  "bio-plane/scripts/coverage.mjs": stub("coverage"),
  "bio-plane/src/index.mjs": `import { registry } from "../../docprofile/registry.mjs";\nexport default { registry };\n`,
  "bio-plane/src/store.mjs": "export const store = 1;\n",
  "bio-plane/checks/checks.mjs": "export const checks = [];\n",
  /* the IMPORTER of tools/widget.mjs */
  "bio-plane/test/widget.test.mjs": `import { widget } from "../../tools/widget.mjs";\nprocess.exit(widget() === 1 ? 0 : 1);\n`,
  /* a suite reading its tool through a COMPUTED path — no import edge names it */
  "bio-plane/test/computed.test.mjs": [
    `import { join, dirname } from "node:path";`,
    `import { fileURLToPath } from "node:url";`,
    `const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");`,
    `const NAME = "computed";`,
    `const mod = await import(join(REPO, "tools", NAME + ".mjs"));`,
    `process.exit(mod.computed() === 2 ? 0 : 1);`, ""].join("\n"),
  /* a suite that WALKS tools/ */
  "bio-plane/test/walker.test.mjs": [
    `import { readdirSync } from "node:fs";`,
    `import { join, dirname } from "node:path";`,
    `import { fileURLToPath } from "node:url";`,
    `const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");`,
    `process.exit(readdirSync(join(REPO, "tools")).length > 0 ? 0 : 1);`, ""].join("\n"),
  /* a doc-facing suite.
     CORRECTED 2026-09-22 (M0-116), never exempted: it "read" the note in a COMMENT, which stood for a read only while
     a unit's own files were read whole; read as code, a comment reads nothing. A real reader names the path in a
     string, which is what this fixture now does, so the --since arm below still asks what it asked. */
  "bio-plane/test/prose.test.mjs": `const NOTE = "docs/notes/a.md";\nprocess.exit(NOTE ? 0 : 1);\n`,
  /* a suite whose CODE CITES a note by its bare name (a label, the shape of a real suite's assertion text) and
     reads no prose at all — NOT doc-facing.
     CORRECTED 2026-09-22 (M0-116), never exempted: the citation was a COMMENT, which a unit's own files were read
     whole for until M0-116; they are now read as code, so a comment cites nothing and the arm below would pass over
     a cap that did nothing (G13 stopped breaking it). A string label is the citation MENTION still sees. */
  "bio-plane/test/cites.test.mjs": `console.log("the a.md note explains this suite's shape; the suite reads nothing");\nprocess.exit(0);\n`,
  /* M0-143: the DOC-FACING selector, read as code. `prosetool.mjs` READS a note (a string path); `commenttool.mjs`
     only names one in its prose. Their note is `c.md`, never `a.md`, so these fixtures cannot widen the `--since`
     arms below, whose other side moves `a.md` and `b.md`. */
  "docs/notes/c.md": "# c\n",
  "tools/prosetool.mjs": `export const NOTE = "docs/notes/c.md";\nexport const read = () => NOTE;\n`,
  "tools/commenttool.mjs": `/* the note this tool was written against is docs/notes/c.md; it reads nothing */\nexport const nothing = () => 0;\n`,
  /* a suite whose ONLY `docs/` mention is in a COMMENT — it reads no prose */
  "bio-plane/test/doccomment.test.mjs": `/* tuned against docs/notes/c.md, which this suite does not read */\nprocess.exit(0);\n`,
  /* a suite that names a doc-READING tool in CODE, and one that names the same tool only in a COMMENT */
  "bio-plane/test/toolstring.test.mjs": `const TOOL = "tools/prosetool.mjs";\nprocess.exit(TOOL ? 0 : 1);\n`,
  "bio-plane/test/toolcomment.test.mjs": `/* the prose behind this suite is what tools/prosetool.mjs reads */\nprocess.exit(0);\n`,
  /* a suite that names, in CODE, a tool whose own `docs/` mention is only in ITS comment — the tool reaches no prose */
  "bio-plane/test/toolproseonly.test.mjs": `const TOOL = "tools/commenttool.mjs";\nprocess.exit(TOOL ? 0 : 1);\n`,
  /* M0-116: a data file two suites mention — one READS it through a string path, one only cites it in a comment */
  "data/figures.txt": "M-1 42\n",
  "bio-plane/test/figstring.test.mjs": [
    `import { readFileSync } from "node:fs";`,
    `const F = new URL("../../data/figures.txt", import.meta.url);`,
    `process.exit(readFileSync(F, "utf8").length ? 0 : 1);`, ""].join("\n"),
  "bio-plane/test/figcomment.test.mjs": `/* the figures this suite was tuned against are in figures.txt (M-1) */\nprocess.exit(0);\n`,
  /* M0-153: the CLOSURE'S EDGES, read as code. `figtool.mjs` READS the figures (a string path); one suite names it
     through the ASSEMBLED spelling `join(REPO, "tools", "figtool.mjs")` — the slash never written — and one names
     it only in its prose. Neither spells `data/figures.txt` itself, so what selects them is the EDGE and nothing else. */
  "tools/figtool.mjs": `export const F = "data/figures.txt";\nexport const read = () => F;\n`,
  "bio-plane/test/asmtool.test.mjs": [
    `import { join, dirname } from "node:path";`,
    `import { fileURLToPath } from "node:url";`,
    `const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");`,
    `const mod = await import(join(REPO, "tools", "figtool.mjs"));`,
    `process.exit(mod.read() ? 0 : 1);`, ""].join("\n"),
  "bio-plane/test/asmcomment.test.mjs": `/* the figures behind this suite are what tools/figtool.mjs reads */\nprocess.exit(0);\n`,
  /* two suites through a shared HELPER: one helper names a tool only in a COMMENT, the other in CODE */
  "bio-plane/test/helper-prose.mjs": `/* this helper's prose cites tools/lonely.mjs and reads nothing */\nexport const h = 1;\n`,
  "bio-plane/test/helped.test.mjs": `import { h } from "./helper-prose.mjs";\nprocess.exit(h === 1 ? 0 : 1);\n`,
  "bio-plane/test/helper-code.mjs": `export const TOOL = "tools/computed.mjs";\n`,
  "bio-plane/test/helped2.test.mjs": `import { TOOL } from "./helper-code.mjs";\nprocess.exit(TOOL ? 0 : 1);\n`,
  "bio-plane/test/unrelated.test.mjs": "process.exit(0);\n",
  "civicos-ui/test/run.mjs": stub("ui-harness"),
  /* CORRECTED 2026-09-24 (M0-153), never exempted: it named `tools/widget.mjs` in a `//` COMMENT, which stood
     for "drives the tool" only while the CLOSURE'S EDGES were cut from a unit's whole text. They are now cut from
     its code, so a comment drives nothing and the arm below asked its question of a suite that named no tool at
     all. A UI suite that really drives a tool spells it in code, which is what this fixture now does. */
  "civicos-ui/test/uiwidget.test.mjs": `const TOOL = "tools/widget.mjs"; // driven from the UI side\n${stub("ui-uiwidget")}`,
  /* ...and the other direction, so "fewer units" cannot pass for the fix: a UI suite whose ONLY mention of that
     same tool is a comment. */
  "civicos-ui/test/uicomment.test.mjs": `// tuned against tools/widget.mjs, which this suite does not drive\n${stub("ui-uicomment")}`,
  "civicos-ui/app.html": "<!doctype html>\n",
  "pdf-worker/fleet-member.json": `${JSON.stringify({ name: "pdf-worker", entry: "src/index.mjs", testDir: "test" })}\n`,
  "pdf-worker/src/index.mjs": "export default {};\n",
  "pdf-worker/test/member.test.mjs": "process.exit(0);\n",
  "newgroup/src/index.mjs": "export default {};\n",
  "docprofile/registry.mjs": "export const registry = 1;\n",
  "docs/notes/a.md": "# a\n",
  "docs/notes/b.md": "# b\n",
  /* M0-176: WHICH prose a doc-facing suite takes — one fixture per clause of `gates.mjs` §2f. Their note lives in
     `docs/pack/`, never in `docs/notes/`, so clause 2's bounded suite cannot widen the `--since` arms below, whose
     other side moves `notes/a.md` and `notes/b.md`.
       - clause 2: `dirtool.mjs` NAMES a docs DIRECTORY as a quoted token and never enumerates one — it reads prose
         by ASSEMBLY, which clause 1 cannot see and `isWalker` does not call a walk. Its take is BOUNDED to that
         directory, which is what separates it from clause 3 below;
       - clause 3: `asmdocs.mjs` spells `docs/` ONLY inside a template with an interpolated segment, so it names no
         path and no directory. It is the unit MENTION is blind to, and the whole tree is what keeps it from being a
         false green. A suite whose own source spelled the path would test clause 1 twice and clause 3 never. */
  "docs/pack/p.md": "# p\n",
  "tools/dirtool.mjs": [
    `import { readFileSync } from "node:fs";`,
    `export const DIR = "docs/pack";`,
    `export const read = (n) => readFileSync(DIR + "/" + n, "utf8");`, ""].join("\n"),
  "bio-plane/test/dirnamed.test.mjs": `const TOOL = "tools/dirtool.mjs";\nprocess.exit(TOOL ? 0 : 1);\n`,
  "tools/asmdocs.mjs": "export const of = (a) => \`docs/${a}/note.md\`;\n",
  "bio-plane/test/assembled.test.mjs": `const TOOL = "tools/asmdocs.mjs";\nprocess.exit(TOOL ? 0 : 1);\n`,
  "CLAUDE.md": "# fixture\n",
  ".gitignore": "node_modules/\n",
};
const put = (root, rel, body) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), body); };
/* CORRECTED 2026-09-22 (M0-99), never exempted. Every commit here used to regenerate `docs/DECIDED.md`
   first and commit it, so the guard's index arm was never the refusal an arm saw; and the fixture carried
   the REAL `decided.mjs` for that step. M0-99 retired that arm and took the index out of every commit, so
   the regeneration guarded against a refusal that no longer exists — and committing the index in a
   fixture would model the very shape M0-99 removed. Both go: the fixture carries the two tools it tests. */
const commitAll = (root, msg) => { git(["add", "-A"], root); return git([...ID, "commit", "-q", "-m", msg], root); };
/* CORRECTED 2026-09-22 (M0-111), never exempted. The fixture's `main` moved by a plain `git push origin main` through
   the real hook, which was right while any session could push `main`. M0-111's guard now refuses a push to `main`
   without the train's mark (`train.test.mjs` drives that refusal and the train's own push), so this suite — whose
   subject is the gate and the D-293 record, not who lands `main` — MODELS the other side's landing below the hook:
   the remote's creation and each upstream move are a landing already made, exactly what `origin/main` moving means. */
const landMain = (root) => git(["push", "-q", "--no-verify", "origin", "main"], root);
/* M0-173: a commit on the fixture's `coord` branch, built through a TEMPORARY INDEX — no checkout, no touch of the
   working tree, nothing of this repository's index — holding one state file at `rel`, which is the shape
   `tools/coord.mjs` reads (M0-110). Returns its sha. */
const coordCommit = (root, rel, text, parent) => {
  const idx = join(SANDBOX, "coord.index");
  try { unlinkSync(idx); } catch { /* the first call */ }
  const env = { ...process.env, GIT_INDEX_FILE: idx };
  const run = (args, input) => spawnSync("git", args, { cwd: root, encoding: "utf8", env, input }).stdout.trim();
  const blob = run(["hash-object", "-w", "--stdin"], text);
  run(["update-index", "--add", "--cacheinfo", `100644,${blob},${rel}`]);
  const tree = run(["write-tree"]);
  return run([...ID, "commit-tree", tree, ...(parent ? ["-p", parent] : []), "-m", `coord: ${rel}`]);
};

function fixture(name) {
  const root = join(SANDBOX, name);
  for (const p of GATE_DEPS) put(root, p, readFileSync(join(REPO, p)));
  for (const [rel, body] of Object.entries(FILES)) put(root, rel, body);
  git(["init", "-q", "-b", "main"], root);
  commitAll(root, "base");
  const remote = join(SANDBOX, `${name}-remote.git`);
  git(["init", "-q", "--bare", remote], SANDBOX);
  git(["remote", "add", "origin", remote], root);
  install({ repo: root });
  landMain(root);
  git(["fetch", "-q", "origin"], root);
  return { root, remote };
}

const gates = (root, args = [], env = {}) => {
  writeFileSync(LOG, "");
  const r = spawnSync(process.execPath, [join(root, "tools/gates.mjs"), ...args],
    { cwd: root, encoding: "utf8", env: { ...process.env, GATES_FIXTURE_LOG: LOG, ...env } });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  return { status: r.status, out,
           cls: (out.match(/^gates: change class (\w+)/m) || [])[1] || null,
           plan: (out.match(/^gates: plan — (.*)$/m) || [])[1] || null,
           units: [...out.matchAll(/^gates: {3}(\S+) {2}<- /gm)].map((m) => m[1]),
           ran: readFileSync(LOG, "utf8").split("\n").filter(Boolean) };
};
const push = (root, spec) => { const r = git(["push", "origin", spec], root); return { status: r.status, err: `${r.stdout}${r.stderr}` }; };
/* REFUSED BY THE GATE RECORD, not merely refused: a push can fail for a reason that is not the
   guard at all — a non-fast-forward, say — and an assertion reading only the exit status passes
   over it. Found by G1's first run: with the lookup dropped, the amend arm still "held", because
   the amended commit was a non-fast-forward over the pre-amend one the broken guard had let land. */
const refusedByGate = (p) => p.status !== 0 && p.err.includes("THE GATE RECORDED THIS TREE RED (D-293)");
const onRemote = (remote, ref) => out1(["rev-parse", "--verify", "--quiet", `refs/heads/${ref}`], remote);
const treeAt = (root, rev = "HEAD") => out1(["rev-parse", `${rev}^{tree}`], root);
const runsFor = (root, tree) => readRuns({ repo: root, tree }).runs;
const branch = (root, b, from = "origin/main") => git(["checkout", "-q", "-B", b, from], root);
/* Uncommitted edits for an --explain arm, restored after it (the fixture is this suite's own). */
function withEdits(root, rels, fn) {
  for (const rel of rels) {
    if (existsSync(join(root, rel))) appendFileSync(join(root, rel), rel.endsWith(".json") ? " " : "\n// edited by an arm\n");
    else put(root, rel, "created by an arm\n");
  }
  try { return fn(); } finally { git(["checkout", "-q", "--", "."], root); git(["clean", "-qfd"], root); }
}
const planOf = (g) => (g.plan || "").split(" · ");
const batteryOf = (g) => ((g.plan || "").match(/battery \[([^\]]*)\]/) || [, ""])[1].split(", ").filter(Boolean).sort();
/* M0-176: the DERIVED doc-facing set, read off the line §2 prints, NOT off what the plan selects. The two were the
   same thing until this row made selection path-granular, and the arms below that ask "is this suite doc-facing?"
   ask the derivation — which is the question they were always about. */
const docFacingOf = (g) => ((g.out || "").match(/doc-facing suites derived fresh[^\n]*?plane \[([^\]]*)\]/) || [, ""])[1]
  .split(", ").filter(Boolean).sort();

/* ========================================================================== */
section("THE FIXTURE — a real repository, the real tools, a real remote, the real hook");
const F = fixture("main-fx");
{
  /* CORRECTED 2026-09-24 (M0-154), never exempted: this named the same files the copy list did, so it agreed
     for free and could not fail when the list fell behind `gates.mjs`'s imports. It now reads the DERIVED list —
     the same one the fixture was built from — and floors its size, since a totality assertion over an empty
     corpus passes (three receipts in `kickoffs/WORKER.md`). The list is PRINTED so the selection is auditable. */
  t("the fixture carries the REAL gates.mjs and everything it imports, byte for byte (DERIVED)",
    [GATE_DEPS.length >= 5, GATE_DEPS.includes("tools/gates.mjs"), GATE_DEPS.includes("tools/pushguard.mjs"),
     missingFrom(F.root)],
    [true, true, true, []]);
  t("the fixture's origin/main exists, so the gate measures a real diff",
    out1(["rev-parse", "--verify", "--quiet", "origin/main"], F.root).length, 40);
  t("the hook is installed where git reads hooks", existsSync(join(hooksDir({ repo: F.root }).dir, "pre-push")), true);
  t("the fixture starts CLEAN", out1(["status", "--porcelain"], F.root), "");
}

/* ========================================================================== */
section("D-293 · THE RECORD — keyed by the TREE, written only for a CLEAN tree");
{
  branch(F.root, "g1");
  appendFileSync(join(F.root, "tools/lonely.mjs"), "// a committed change\n");
  commitAll(F.root, "g1: a tools change");
  const tree = out1(["rev-parse", "HEAD^{tree}"], F.root);
  const g = gates(F.root);
  t("a CLEAN run exits GREEN", g.status, 0);
  const runs = runsFor(F.root, tree);
  t("a CLEAN run is RECORDED, keyed by HEAD's tree", [runs.length, runs[0] && runs[0].tree], [1, tree]);
  t("...with its verdict, its class and every step's units",
    [runs[0] && runs[0].verdict, runs[0] && runs[0].class,
     !!(runs[0] && runs[0].steps.some((s) => s.label === "plancheck --local" && s.ok && s.units[0] === "plancheck"))],
    ["GREEN", "TARGETED", true]);
  t("...and the record lives in the git COMMON dir, not the working tree",
    [!!runs[0] && runs[0].file.startsWith(recordDir({ repo: F.root })), out1(["status", "--porcelain"], F.root)], [true, ""]);
  t("...and the gate SAYS it recorded", g.out.includes(`RECORDED GREEN for tree ${tree.slice(0, 8)}`), true);

  const ex = gates(F.root, ["--explain"]);
  t("--explain records nothing", [ex.status, runsFor(F.root, tree).length], [0, 1]);

  appendFileSync(join(F.root, "tools/lonely.mjs"), "// uncommitted\n");
  const dirty = gates(F.root);
  t("a DIRTY tree is NOT recorded", runsFor(F.root, tree).length, 1);
  /* M0-146: AND NAMES THE PATH. "not clean" alone cost D-487 fourteen minutes against a gate log it had written
     itself, so the refusal names the dirty paths and where a worker's scratch belongs instead. */
  t("...and the gate says why, and NAMES the path that made the tree dirty",
    [dirty.out.includes("NOT RECORDED — the tree was not clean"), dirty.out.includes("tools/lonely.mjs"),
     dirty.out.includes("SESSION")], [true, true, true]);
  git(["checkout", "-q", "--", "."], F.root);

  /* --full, so the battery step that dirties the tree RUNS whatever the selection rule says: this arm
     is about the record, and must not move when an arm moves selection (found by G4's first run). */
  const mid = gates(F.root, ["--full"], { GATES_FIXTURE_DIRTY: "docs/notes/a.md" });
  t("a tree that CHANGES while the gate runs is NOT recorded", runsFor(F.root, tree).length, 1);
  t("...and it says the run measured a tree that never existed", mid.out.includes("measured a tree that never existed"), true);
  git(["checkout", "-q", "--", "."], F.root);
}

/* ========================================================================== */
section("D-293 · THE REFUSAL — a RED record refuses the push of that tree, by name");
{
  branch(F.root, "red");
  appendFileSync(join(F.root, "tools/widget.mjs"), "// red change\n");
  commitAll(F.root, "red: a change the gate measures RED");
  const c1 = out1(["rev-parse", "HEAD"], F.root);
  const tree = treeAt(F.root);
  const g = gates(F.root, [], { GATES_FIXTURE_FAIL: "battery" });
  t("the gate is RED and RECORDS it", [g.status, g.out.includes(`RECORDED RED for tree ${tree.slice(0, 8)}`)], [1, true]);

  const p1 = push(F.root, "red");
  t("a RED gate then a push of that tree is REFUSED", refusedByGate(p1), true);
  t("...naming the record: the verdict, the tree and D-293",
    [p1.err.includes("THE GATE RECORDED THIS TREE RED (D-293)"), p1.err.includes(`tree ${tree.slice(0, 8)}`)], [true, true]);
  t("...and the RED bytes did NOT reach the remote", onRemote(F.remote, "red"), "");

  git([...ID, "commit", "-q", "--amend", "-m", "red: reworded, the same tree"], F.root);
  const c2 = out1(["rev-parse", "HEAD"], F.root);
  t("the amend made a NEW commit over the SAME tree", [c2 !== c1, treeAt(F.root) === tree], [true, true]);
  /* A ref of its own, so nothing but the guard can refuse it. */
  const p2 = push(F.root, "red:refs/heads/red-amended");
  t("AN AMEND OF THE MESSAGE ALONE does not clear the refusal (the key is the tree)", refusedByGate(p2), true);

  /* The record lives in the COMMON dir, so every worktree of the clone reads it. */
  const other = join(SANDBOX, "main-fx-second-worktree");
  git(["worktree", "add", "-q", "--detach", other, "red"], F.root);
  const p3 = push(other, "HEAD:refs/heads/red-elsewhere");
  t("a tree gated RED in one worktree is refused from ANOTHER worktree of the clone", refusedByGate(p3), true);

  const again = gates(F.root);
  t("the same tree re-gated GREEN (a flaky suite, say) records GREEN", again.status, 0);
  /* A ref of its own, so this arm cannot fail on a non-fast-forward when a control has let an
     earlier push of the pre-amend commit through (found by G1's first run). */
  t("a GREEN re-run of what failed, on the same tree, CLEARS it", push(F.root, "red:refs/heads/red-cleared").status, 0);
  t("...and the ref landed", onRemote(F.remote, "red-cleared"), c2);

  branch(F.root, "wide");
  appendFileSync(join(F.root, "tools/widget.mjs"), "// wide change\n");
  commitAll(F.root, "wide");
  const w1 = gates(F.root, ["--full"], { GATES_FIXTURE_FAIL: "battery" });
  const w2 = gates(F.root);
  t("the wide tree is RED under FULL, then GREEN under TARGETED", [w1.cls, w1.status, w2.cls, w2.status], ["FULL", 1, "TARGETED", 0]);
  t("a NARROWER GREEN does not clear a WIDER RED", refusedByGate(push(F.root, "wide")), true);
  appendFileSync(join(F.root, "tools/widget.mjs"), "// and fixed\n");
  commitAll(F.root, "wide: fixed");
  t("a CHANGED tree after a RED pushes (no verdict is recorded for it)", push(F.root, "wide").status, 0);

  branch(F.root, "fresh");
  appendFileSync(join(F.root, "tools/lonely.mjs"), "// never gated\n");
  commitAll(F.root, "fresh: never gated");
  const pf = push(F.root, "fresh");
  t("an UNRECORDED tree pushes", pf.status, 0);
  t("...and the guard SAYS NOTHING about a gate verdict it does not have",
    [pf.err.includes("gate verdict"), pf.err.includes("GATE RECORDED")], [false, false]);

  branch(F.root, "green");
  appendFileSync(join(F.root, "tools/computed.mjs"), "// gated green\n");
  commitAll(F.root, "green");
  gates(F.root);
  const pg = push(F.root, "green");
  t("a GREEN tree pushes", pg.status, 0);
  t("...and the guard says the GREEN record it read", pg.err.includes("gate verdict GREEN recorded"), true);

  t("a DELETION is never refused by a record", push(F.root, ":refs/heads/wide").status, 0);

  const ctl = spawnSync(process.execPath, [join(REPO, "tools/pushguard.mjs"), "--control"], { cwd: REPO, encoding: "utf8" });
  t("the guard's own in-process control passes, its D-293 verdict arms included",
    [ctl.status, (ctl.stdout || "").includes("a NARROWER GREEN cannot clear a WIDER failure")], [0, true]);
}

/* ========================================================================== */
section("M0-98 · THE CLASS — TARGETED by MENTION, and what stays FULL");
{
  branch(F.root, "classes");
  const tools = withEdits(F.root, ["tools/widget.mjs"], () => gates(F.root, ["--explain"]));
  t("a tools-only diff reads TARGETED", tools.cls, "TARGETED");
  t("...and selects its IMPORTER", tools.units.includes("plane:widget.test.mjs"), true);
  t("...and the suite that WALKS tools/", tools.units.includes("plane:walker.test.mjs"), true);
  t("...and a UI suite that names the tool in CODE", tools.units.includes("ui:uiwidget.test.mjs"), true);
  t("...and NOT a UI suite that names it only in a COMMENT", tools.units.includes("ui:uicomment.test.mjs"), false);
  t("...and NOT a suite that reads none of it",
    ["plane:unrelated.test.mjs", "plane:computed.test.mjs", "plane:prose.test.mjs", "fleet:pdf-worker/member.test.mjs"]
      .filter((u) => tools.units.includes(u)), []);
  t("...and runs no coverage when no test file changed", planOf(tools).includes("coverage --strict"), false);
  t("...and its plan names exactly what the battery runs", batteryOf(tools), ["walker.test.mjs", "widget.test.mjs"]);

  const withSuite = withEdits(F.root, ["tools/widget.mjs", "bio-plane/test/widget.test.mjs"], () => gates(F.root, ["--explain"]));
  t("a tools diff WITH its suite selects the register gate (coverage --strict)",
    [withSuite.cls, planOf(withSuite).includes("coverage --strict")], ["TARGETED", true]);

  const computed = withEdits(F.root, ["tools/computed.mjs"], () => gates(F.root, ["--explain"]));
  t("SELECTION IS BY MENTION: a suite reading its tool through a COMPUTED path is selected",
    computed.units.includes("plane:computed.test.mjs"), true);
  t("...and a suite whose imported HELPER names the tool in CODE is selected",
    computed.units.includes("plane:helped2.test.mjs"), true);
  const lonely = withEdits(F.root, ["tools/lonely.mjs"], () => gates(F.root, ["--explain"]));
  t("a path named only in the COMMENT of a helper a suite imports does NOT select that suite",
    [lonely.cls, lonely.units.includes("plane:helped.test.mjs")], ["TARGETED", false]);
  t("...because the estate's lexer read that helper as code, and the plan says so",
    lonely.out.includes("read as code, comments blanked"), true);

  const both = withEdits(F.root, ["bio-plane/src/store.mjs", "tools/widget.mjs"], () => gates(F.root, ["--explain"]));
  t("a src/ edit BESIDE a tools edit reads FULL", [both.cls, planOf(both)[0]], ["FULL", "battery (all)"]);

  const docs = withEdits(F.root, ["docs/notes/a.md"], () => gates(F.root, ["--explain"]));
  t("a docs-only diff still reads DOCS", docs.cls, "DOCS");

  const cats = {};
  for (const rel of ["civicos-ui/app.html", "pdf-worker/src/index.mjs", "newgroup/src/index.mjs", "bio-plane/package.json",
                     ".gitignore", "docprofile/registry.mjs"])
    cats[rel] = withEdits(F.root, [rel], () => gates(F.root, ["--explain"])).cls;
  t("every FULL category still reads FULL: the UI, a fleet member, the installer, a package file, a root dotfile, code the plane imports",
    Object.values(cats), ["FULL", "FULL", "FULL", "FULL", "FULL", "FULL"]);

  const om = out1(["rev-parse", "origin/main"], F.root);
  git(["update-ref", "-d", "refs/remotes/origin/main"], F.root);
  const noBase = withEdits(F.root, ["docs/notes/a.md"], () => gates(F.root, ["--explain"]));
  git(["update-ref", "refs/remotes/origin/main", om], F.root);
  t("no merge-base with origin/main reads FULL, never DOCS", noBase.cls, "FULL");
}

/* ========================================================================== */
section("M0-116 · A UNIT'S OWN FILES ARE READ AS CODE — a comment reads nothing, a string path still reads");
{
  /* BOB #27's defect: ~30 suites were selected for a MEASUREMENTS-only change because their OWN prose cites a
     measurement. THE LIAR: selecting nothing for the file passes a naive "fewer units" check — so the suite that
     READS it through a string path must stay selected, and G17 blanks strings to prove that arm has teeth. */
  branch(F.root, "owncode");
  const figs = withEdits(F.root, ["data/figures.txt"], () => gates(F.root, ["--explain"]));
  t("a data-only diff reads TARGETED", figs.cls, "TARGETED");
  t("a suite that READS the file through a STRING path is selected — selecting nothing is not the fix",
    figs.units.includes("plane:figstring.test.mjs"), true);
  t("a suite whose OWN COMMENT is its only mention of the file is NOT selected — a comment reads nothing",
    figs.units.includes("plane:figcomment.test.mjs"), false);
  t("...and the plan says a unit's own files are read as code",
    figs.out.includes("a unit's source and control, the tools/scripts it names and their relative imports, all read as code, comments blanked"), true);
}

/* ========================================================================== */
section("M0-143 · THE DOC-FACING SET IS READ AS CODE — a comment names `docs/` but reads nothing");
{
  /* HOW A LIAR PASSES THIS, stated first: drop the `docs/` test altogether and every count falls, which reads as a
     win. So the comment-only arms are asserted BESIDE the readers that must stay, and the set is pinned WHOLE —
     a filter that selects nothing fails the pin. Measured on the estate at 16fe1e7f: 72 doc-facing suites before
     (plane 60 · ui 12), 41 after (plane 37 · ui 4) — 23 plane and 8 ui qualified by a comment mention ALONE, and
     none was added (`measurements/M-134.md`). */
  branch(F.root, "docfacing");
  /* CORRECTED 2026-09-24 (M0-176), never exempted. Every arm here asks "is this suite DOC-FACING?" and every one
     asked it THROUGH `batteryOf` — what the DOCS class runs — because until this row those were the same set: the
     door handed every doc-facing unit any `docs/` change, so running it and being in the set were one fact. They
     are now two, and reading membership off the plan would ask the WRONG one: `toolstring.test.mjs` reaches
     `notes/c.md` and would drop out of a `notes/a.md` plan while staying exactly as doc-facing as before. So the
     arms read `docFacingOf` — the derived set §2 itself prints — and keep the teeth G17-G19 need, which a
     selection-shaped assertion would have lost: under G18 a comment-only suite becomes doc-facing but is still
     MENTION-blind to the note, so its selection would not move and the arm would pass over a broken §2. */
  const d = withEdits(F.root, ["docs/notes/a.md"], () => gates(F.root, ["--explain"]));
  t("a docs-only diff reads DOCS", d.cls, "DOCS");
  t("a suite that READS `docs/` through a STRING is doc-facing — dropping the `docs/` test is not the fix",
    docFacingOf(d).includes("prose.test.mjs"), true);
  t("...and a suite whose ONLY `docs/` mention is in a COMMENT is NOT doc-facing",
    docFacingOf(d).includes("doccomment.test.mjs"), false);
  t("a suite that names a doc-READING tool in CODE is doc-facing — the tool's own string path still reads",
    docFacingOf(d).includes("toolstring.test.mjs"), true);
  t("...and a suite that names that same tool only in a COMMENT is NOT",
    docFacingOf(d).includes("toolcomment.test.mjs"), false);
  t("a TOOL whose own `docs/` mention is only in ITS comment reaches no prose, so a suite naming it in CODE is NOT",
    docFacingOf(d).includes("toolproseonly.test.mjs"), false);
  t("the doc-facing set is EXACTLY this, and it is NOT EMPTY — a selector that selects nothing fails here",
    [docFacingOf(d), docFacingOf(d).length > 0],
    [["assembled.test.mjs", "dirnamed.test.mjs", "prose.test.mjs", "toolstring.test.mjs"], true]);
  t("...and the plan SAYS the set was read as code, so the selection stays auditable",
    d.out.includes("doc-facing suites derived fresh, read as code, comments blanked (strings kept)"), true);
  /* M0-152: a caller that asks the gate "is this suite doc-facing?" (`fleetbundles.control.mjs` arm 5b) asks it over
     a tree whose diff is CODE — its own control edits a suite — so `--explain` must print the same derived set in a
     TARGETED plan, or the caller is left to restate the rule, which is how arm 5b went stale. */
  const tg = withEdits(F.root, ["data/figures.txt"], () => gates(F.root, ["--explain"]));
  t("M0-152: a code-only diff reads TARGETED, so the next arm is not asking a DOCS plan", tg.cls, "TARGETED");
  t("M0-152: ...and `--explain` prints the SAME derived doc-facing set there — the derivation is not a DOCS-only fact",
    [docFacingOf(tg), docFacingOf(tg).length > 0], [docFacingOf(d), true]);
}

/* ========================================================================== */
section("M0-176 · A DOC-FACING UNIT TAKES ONLY THE PROSE IT NAMES — and the whole tree when it names none");
{
  /* HOW A LIAR PASSES THIS, stated before what it checks. The row asks for FEWER units, so the two cheapest
     liars both narrow: (a) select nothing at all for prose, which reads as the biggest win there is; (b) narrow
     the DERIVED SET instead of the door, which drops the same suites and looks identical in a plan. So every
     arm that asserts a suite is NOT selected sits beside one asserting a different suite IS, the derived set is
     pinned WHOLE and non-empty in the M0-143 section above, and the note each suite reaches is different from
     every other's — a door that ignored the path would select all four for all four notes, which is the
     measured BEFORE state on the real estate (`docs/development/measurements/M-146.md`: a MEASUREMENTS-only
     diff and a kickoffs-only diff each selected the SAME 42 doc-facing units, the same list).
     THE THIRD CLAUSE IS THE ONE THAT CAN COST A FALSE GREEN, so it is driven rather than believed: a unit whose
     prose is read through an ASSEMBLED path names nothing, and if narrowing dropped it, a change to the note it
     really reads would go unmeasured with the gate green. `assembled.test.mjs` is that unit, and it is asserted
     SELECTED for every note below, including one no fixture names at all. */
  branch(F.root, "docsgranular");
  const A = withEdits(F.root, ["docs/notes/a.md"], () => gates(F.root, ["--explain"]));
  const C = withEdits(F.root, ["docs/notes/c.md"], () => gates(F.root, ["--explain"]));
  const P = withEdits(F.root, ["docs/pack/p.md"], () => gates(F.root, ["--explain"]));
  const B = withEdits(F.root, ["docs/notes/b.md"], () => gates(F.root, ["--explain"]));
  const AC = withEdits(F.root, ["docs/notes/a.md", "docs/notes/c.md"], () => gates(F.root, ["--explain"]));

  t("every arm here is still the DOCS class — the door is what moved, never the classification",
    [A.cls, C.cls, P.cls, B.cls, AC.cls], ["DOCS", "DOCS", "DOCS", "DOCS", "DOCS"]);

  /* Clause 1: the path the unit's own reach covers, and NOT the one it does not. */
  t("a suite that reads ONE note is selected for THAT note", batteryOf(A).includes("prose.test.mjs"), true);
  t("...and NOT for a note it does not read — which is the whole of this row",
    [batteryOf(C).includes("prose.test.mjs"), batteryOf(P).includes("prose.test.mjs"),
     batteryOf(B).includes("prose.test.mjs")], [false, false, false]);
  t("a suite that reads its note THROUGH A TOOL is selected for that note, and not for another's",
    [batteryOf(C).includes("toolstring.test.mjs"), batteryOf(A).includes("toolstring.test.mjs")], [true, false]);

  /* Clause 2: a docs DIRECTORY named in code, with nothing enumerating it — and BOUNDED to that directory. */
  t("a suite whose tool NAMES a docs directory and walks nothing takes the prose IN it",
    batteryOf(P).includes("dirnamed.test.mjs"), true);
  t("...and is BOUNDED to that directory — clause 2 is not a second way of saying 'everything'",
    [batteryOf(A).includes("dirnamed.test.mjs"), batteryOf(C).includes("dirnamed.test.mjs"),
     batteryOf(B).includes("dirnamed.test.mjs")], [false, false, false]);

  /* Clause 3: the backstop. Narrowing THIS unit is the false green the row can produce. */
  t("a doc-facing suite that names NO path and NO directory keeps the whole tree — it is MENTION-blind, and a "
    + "narrowing that dropped it would be the false green",
    [batteryOf(A).includes("assembled.test.mjs"), batteryOf(C).includes("assembled.test.mjs"),
     batteryOf(P).includes("assembled.test.mjs"), batteryOf(B).includes("assembled.test.mjs")],
    [true, true, true, true]);

  /* The plan is EXACT at every note, so "fewer units" cannot pass for the fix. */
  t("the plan for each note is EXACTLY its readers plus the backstop, and never empty",
    [batteryOf(A), batteryOf(C), batteryOf(P), batteryOf(B)],
    [["assembled.test.mjs", "prose.test.mjs"], ["assembled.test.mjs", "toolstring.test.mjs"],
     ["assembled.test.mjs", "dirnamed.test.mjs"], ["assembled.test.mjs"]]);
  t("a note NOBODY names still runs the backstop and nothing else — absence of a reader is not absence of a read",
    batteryOf(B), ["assembled.test.mjs"]);
  t("two notes together select the UNION, never one of them",
    batteryOf(AC), ["assembled.test.mjs", "prose.test.mjs", "toolstring.test.mjs"]);

  /* The narrowing is PRINTED, as the derivation it narrows is. */
  t("the plan SAYS the selection is path-granular, and counts it against the derived set",
    /doc-facing selection is PATH-GRANULAR \(M0-176\) — 2 of 4 doc-facing unit\(s\) take a changed path/.test(A.out), true);
  t("...and an EMPTY diff, which has no path to narrow by, runs the WHOLE derived set and says so",
    (() => { const e = gates(F.root, ["--explain"]);
             return [e.cls, batteryOf(e), /EMPTY diff: nothing to narrow by/.test(e.out)]; })(),
    ["DOCS", ["assembled.test.mjs", "dirnamed.test.mjs", "prose.test.mjs", "toolstring.test.mjs"], true]);

  /* TARGETED's "net" bound is the same rule now, so prose is never checked more narrowly there than DOCS checks it. */
  const mixed = withEdits(F.root, ["tools/widget.mjs", "docs/notes/a.md"], () => gates(F.root, ["--explain"]));
  t("a TARGETED diff carrying prose selects the doc-facing units that TAKE it, not every doc-facing unit",
    [mixed.cls, mixed.units.includes("plane:prose.test.mjs"), mixed.units.includes("plane:assembled.test.mjs"),
     mixed.units.includes("plane:dirnamed.test.mjs"), mixed.units.includes("plane:toolstring.test.mjs")],
    ["TARGETED", true, true, false, false]);
  t("...and the suites that read the CODE side are still selected — the docs half narrowed, nothing else did",
    [mixed.units.includes("plane:widget.test.mjs"), mixed.units.includes("plane:walker.test.mjs")], [true, true]);
}

/* ========================================================================== */
section("M0-153 · THE CLOSURE'S EDGES ARE READ AS CODE — a tool NAMED IN PROSE is a tool nothing runs");
{
  /* THE LAST RAW READER IN THE SELECTION PATH. `fileHit` and `isWalker` were corrected by M0-116 and §2's two
     sites by M0-143, but `edgesOf` still cut a unit's edges from its WHOLE text — so a tool named in a comment
     entered the closure, and everything that tool reads became something the unit "reads". Measured on the estate
     at 68fecb8d by `statepaths.test.mjs`'s own printed line: a MEASUREMENTS-only change selected 47 units before
     and 45 after, and `plane:m025-arm-anchor-witness.test.mjs` stopped being NEVER-CACHED — it never ran
     `tools/plancheck.mjs`, it only quotes the name in the paragraph explaining why its corpus walks `tools/`.

     HOW A LIAR PASSES THIS, stated first: blanking the comments ALSO blanks the only literal spelling of a tool a
     unit really runs through an ASSEMBLED path (`join(REPO, "tools", "x.mjs")`) — eight files on the estate, among
     them `entries.control.mjs`, whose lost edge was `tools/entries.mjs`, the very tool it drives. So the
     comment-only arm is asserted BESIDE the assembled reader that must STAY, and a fix that merely selects fewer
     units fails here. */
  branch(F.root, "edgecode");
  const figs = withEdits(F.root, ["data/figures.txt"], () => gates(F.root, ["--explain"]));
  t("a data-only diff reads TARGETED", figs.cls, "TARGETED");
  t("a suite naming, through the ASSEMBLED spelling in CODE, a tool that READS the file is selected — it is the edge, "
    + "not the path, that selects it", figs.units.includes("plane:asmtool.test.mjs"), true);
  t("...and a suite whose ONLY mention of that same tool is a COMMENT is NOT selected — a comment runs nothing",
    figs.units.includes("plane:asmcomment.test.mjs"), false);
  t("...and the plan SAYS the edges were read as code, so the selection stays auditable",
    figs.out.includes("the `tools/x.mjs` spelling and the assembled `join(…, \"tools\", \"x.mjs\")` one both name a tool (M0-153)"), true);
}

/* ========================================================================== */
section("M0-98 · --since — after a rebase, only what BOTH sides touched, plus plancheck");
{
  /* The other side moves: a commit on main, pushed, and fetched — `origin/main` moves as it does. */
  const upstream = (rel, text) => {
    branch(F.root, "main", "origin/main");
    appendFileSync(join(F.root, rel), text);
    commitAll(F.root, `upstream: ${rel}`);
    landMain(F.root);
    git(["fetch", "-q", "origin"], F.root);
  };
  const mine = (b, rel, env = {}, gate = true) => {
    branch(F.root, b);
    appendFileSync(join(F.root, rel), `// ${b}\n`);
    commitAll(F.root, `${b}: my side`);
    return gate ? gates(F.root, [], env) : null;
  };
  const rebase = (b) => { git(["checkout", "-q", b], F.root); return git([...ID, "rebase", "-q", "origin/main"], F.root).status; };

  mine("since-docs", "tools/widget.mjs");
  upstream("docs/notes/b.md", "moved upstream\n");
  t("the rebase over the docs commit is clean", rebase("since-docs"), 0);
  const d = gates(F.root, ["--since", "--explain"]);
  /* CORRECTED 2026-09-25 by M0-197, never exempted: the steps that ALWAYS run are now TWO — the control-anchor
     reader (`tools/anchordrift.mjs`, BOB #35: every gate profile) beside plancheck — so "only plancheck" was a claim
     about the plan before that row. What this arm guards is unchanged: no suite is selected. */
  t("a rebase over DISJOINT docs commits re-runs ONLY the always-run steps (anchordrift, plancheck)", [d.cls, d.plan], ["SINCE", "anchordrift (M0-197) · plancheck --local"]);
  const dRun = gates(F.root, ["--since"]);
  const newTree = treeAt(F.root);
  t("...and the --since run is GREEN and RECORDS the new tree",
    [dRun.status, runsFor(F.root, newTree).map((r) => r.class)], [0, ["SINCE"]]);

  /* A commit made AFTER the gate, with no rebase at all: it differs from the measured tree, the other
     side does not explain it, and nobody measured it — so it must be re-checked, never read as the
     other side's already-gated change. */
  mine("since-after", "tools/widget.mjs");
  const measured = out1(["rev-parse", "HEAD"], F.root);
  appendFileSync(join(F.root, "tools/computed.mjs"), "// a commit made after the gate\n");
  commitAll(F.root, "since-after: a commit on top of the measured tree");
  const af = gates(F.root, ["--since", measured, "--explain"]);
  t("a commit made AFTER the gate is re-checked as TARGETED would, never assumed measured",
    [af.cls, af.units.includes("plane:computed.test.mjs")], ["SINCE", true]);

  mine("since-both", "tools/widget.mjs");
  upstream("bio-plane/test/widget.test.mjs", "// the suite moved upstream\n");
  rebase("since-both");
  const b = gates(F.root, ["--since", "--explain"]);
  t("a unit reading BOTH sides re-runs, though no single file changed on both", b.units.includes("plane:widget.test.mjs"), true);
  t("...and a unit reading only ONE side does not", b.units.includes("ui:uiwidget.test.mjs"), false);

  mine("since-unrec", "tools/widget.mjs", {}, false);
  upstream("docs/notes/b.md", "moved again\n");
  rebase("since-unrec");
  const u = gates(F.root, ["--since", "--explain"]);
  t("--since over an UNRECORDED tree falls back to the ordinary class, and says so",
    [u.out.includes("cannot narrow — no verdict is recorded"), u.cls], [true, "TARGETED"]);

  mine("since-red", "tools/widget.mjs", { GATES_FIXTURE_FAIL: "battery" });
  upstream("docs/notes/b.md", "and again\n");
  rebase("since-red");
  const r = gates(F.root, ["--since", "--explain"]);
  t("--since over a RED tree falls back, and says so", [r.out.includes("is recorded RED"), r.cls], [true, "TARGETED"]);

  mine("since-plane", "bio-plane/src/store.mjs");
  upstream("docs/notes/a.md", "the prose a suite reads moved\n");
  rebase("since-plane");
  const pl = gates(F.root, ["--since", "--explain"]);
  t("a plane change gated FULL, rebased over docs, re-runs the READERS of those docs, not the battery",
    [pl.cls, pl.units.includes("plane:prose.test.mjs")], ["SINCE", true]);
  /* CORRECTED 2026-09-24 (M0-176), never exempted: the expected set was `["prose.test.mjs"]` and is now two, and
     the SECOND one is the point rather than noise. `assembled.test.mjs` reads prose through a path assembled at
     run time, so §2f clause 3 hands it the whole tree and the cap re-runs it over ANY moved note — which is the
     cap doing what it says (never narrower than DOCS), now that DOCS itself is path-granular. The arm's own
     subject is unchanged and still has its teeth: `cites.test.mjs` names the note in its own prose, is not
     doc-facing, and is still NOT re-run. */
  t("...and NOT a suite that only CITES the moved note in its own prose — the other side's prose is bounded by DOCS",
    [pl.units.includes("plane:cites.test.mjs"), batteryOf(pl)], [false, ["assembled.test.mjs", "prose.test.mjs"]]);
}

/* ========================================================================== */
section("M0-107 · AN EXPIRED BUDGET — recorded NOT MEASURED, never RED, never GREEN");
{
  /* HOW A LIAR PASSES THIS, stated first: record an expiry as GREEN (the push goes through and the tree
     reads measured), or take ANY exit 124 as a timeout (a tool that dies with 124 launders a failure). So
     the arms assert the record's verdict, the refusal NOT happening, `--since` refusing to narrow, and a
     bare 124 with no verdict file read as RED. */
  branch(F.root, "nm");
  appendFileSync(join(F.root, "tools/widget.mjs"), "// a change whose battery runs out of time\n");
  commitAll(F.root, "nm: a change measured under load");
  const tree = treeAt(F.root);
  const g = gates(F.root, [], { GATES_FIXTURE_TIMEOUT: "plane:widget.test.mjs" });
  t("a battery step whose only failures were expired budgets makes the gate NOT MEASURED, exit 124",
    [g.status, /^gates: NOT MEASURED · class TARGETED$/m.test(g.out)], [124, true]);
  t("...and it NAMES the unmeasured suite", /a budget EXPIRED in 1 suite\(s\): plane:widget\.test\.mjs — NOT MEASURED \(M0-107\)/.test(g.out), true);
  const runs = runsFor(F.root, tree);
  const bat = runs[0] && runs[0].steps.find((s) => s.label.startsWith("battery"));
  t("a timeouts-only run writes NO RED record: it records NOT MEASURED, the step flagged with what it did not measure",
    [runs.length, runs[0] && runs[0].verdict, runs[0] && runs[0].v, !!(bat && bat.timedOut), bat && bat.unmeasured],
    [1, "NOT MEASURED", 2, true, ["plane:widget.test.mjs"]]);
  t("...and the gate SAYS it recorded NOT MEASURED", g.out.includes(`RECORDED NOT MEASURED for tree ${tree.slice(0, 8)}`), true);
  t("the verdict rule reads the tree NOT MEASURED — not RED, not GREEN", effectiveVerdict(runsFor(F.root, tree)).verdict, "NOT MEASURED");

  const p = push(F.root, "nm");
  t("a NOT MEASURED tree is NOT refused by the push guard", [p.status, refusedByGate(p)], [0, false]);
  t("...and the guard SAYS the verdict, never GREEN", [p.err.includes("gate verdict NOT MEASURED recorded"), p.err.includes("gate verdict GREEN")], [true, false]);

  /* --since over the NOT MEASURED tree: nobody measured it, so it licenses no narrowing. */
  const upstreamDocs = () => {
    branch(F.root, "main", "origin/main");
    appendFileSync(join(F.root, "docs/notes/b.md"), "moved while nm was unmeasured\n");
    commitAll(F.root, "upstream: docs");
    landMain(F.root);
    git(["fetch", "-q", "origin"], F.root);
  };
  upstreamDocs();
  git(["checkout", "-q", "nm"], F.root);
  git([...ID, "rebase", "-q", "origin/main"], F.root);
  const s = gates(F.root, ["--since", "--explain"]);
  t("--since over a NOT MEASURED tree falls back, and says why", [s.out.includes("is recorded NOT MEASURED"), s.cls], [true, "TARGETED"]);

  /* The same tree re-gated with the budget holding: the unmeasured suite is measured, the tree GREEN. */
  const nmTree = treeAt(F.root);
  const again = gates(F.root, [], { GATES_FIXTURE_TIMEOUT: "plane:widget.test.mjs" });
  t("(the rebased tree is gated NOT MEASURED first)", again.status, 124);
  const green = gates(F.root);
  t("an unmeasured suite re-run GREEN on the same tree reads GREEN", [green.status, effectiveVerdict(runsFor(F.root, nmTree)).verdict], [0, "GREEN"]);

  /* A 124 the gate must not take on trust: no verdict file, no timeout. */
  branch(F.root, "bare124");
  appendFileSync(join(F.root, "tools/widget.mjs"), "// a battery that exits 124 and says nothing\n");
  commitAll(F.root, "bare124");
  const bare = gates(F.root, [], { GATES_FIXTURE_BARE124: "1" });
  t("a battery exiting 124 WITHOUT a verdict file naming a timeout is RED — never NOT MEASURED",
    [bare.status, effectiveVerdict(runsFor(F.root, treeAt(F.root))).verdict], [1, "RED"]);

  /* RED outranks NOT MEASURED inside one run. */
  branch(F.root, "nmred");
  appendFileSync(join(F.root, "tools/widget.mjs"), "// a timeout beside a real failure\n");
  commitAll(F.root, "nmred");
  const both = gates(F.root, ["--full"], { GATES_FIXTURE_TIMEOUT: "plane:widget.test.mjs", GATES_FIXTURE_FAIL: "coverage" });
  t("an expired budget BESIDE a failing gate is RED, exit 1, and the push is refused",
    [both.status, /^gates: RED · class FULL$/m.test(both.out), refusedByGate(push(F.root, "nmred"))], [1, true, true]);
}

/* ========================================================================== */
section("BOB #29 · A TREE'S OWN RECORD IS READ FIRST — re-run only what FAILED on it; a GREEN tree runs nothing");
/* Bob, 2026-09-23: "every lane that experienced the bug then went and ran ALL suites even though they'd just passed
   those suites without making any further changes." The gate read no record but under --since, and --since refuses
   a RED base, so a RED on an UNCHANGED tree cost the whole battery again. */
{
  branch(F.root, "rerun");
  appendFileSync(join(F.root, "bio-plane/src/store.mjs"), "// a plane change: FULL\n");
  commitAll(F.root, "rerun: a plane change");
  const tree = treeAt(F.root);
  const red = gates(F.root, [], { GATES_FIXTURE_REDSUITE: "plane:widget.test.mjs" });
  t("a FULL run whose battery names ONE failed suite is RED", [red.status, red.cls], [1, "FULL"]);
  const step = (runsFor(F.root, tree)[0]?.steps || []).find((s) => s.label === "battery (all)");
  t("...and the record names that suite, not the whole battery", step?.failedUnits, ["plane:widget.test.mjs"]);
  t("...so the tree is open at that one unit and no other",
    effectiveVerdict(runsFor(F.root, tree)).open, ["plane:widget.test.mjs"]);

  const again = gates(F.root);
  t("the NEXT plain run on the same tree is a RERUN of the failed suite alone",
    [again.status, again.cls, batteryOf(again), again.ran.filter((l) => /^(coverage|ui-harness)\b/.test(l)).length],
    [0, "RERUN", ["widget.test.mjs"], 0]);
  t("...which turns the tree GREEN through the guard's own verdict rule", effectiveVerdict(runsFor(F.root, tree)).verdict, "GREEN");

  const idle = gates(F.root);
  t("a run on a tree already recorded GREEN runs NOTHING and says so",
    [idle.status, idle.ran.length, /already recorded GREEN/.test(idle.out)], [0, 0, true]);
  const last = runsFor(F.root, tree).slice(-1)[0];
  t("...and still RECORDS its answer (a caller reads the run it caused), as a step-less REUSED GREEN the verdict rule ignores",
    [last?.class, last?.verdict, (last?.steps || []).length, !!last?.reusedFrom, effectiveVerdict(runsFor(F.root, tree)).verdict],
    ["REUSED", "GREEN", 0, true, "GREEN"]);
  const forced = gates(F.root, ["--full"]);
  t("...and --full still forces the whole run", [forced.status, forced.cls, forced.ran.some((l) => l.startsWith("battery"))], [0, "FULL", true]);

  /* OVER-STRICTNESS, both ways: a finding that is the RUN's (a leak) names no suite to re-run, so it is not narrowed */
  branch(F.root, "rerun-leak");
  appendFileSync(join(F.root, "bio-plane/src/store.mjs"), "// another plane change\n");
  commitAll(F.root, "rerun-leak");
  const leak = gates(F.root, [], { GATES_FIXTURE_REDSUITE: "plane:widget.test.mjs", GATES_FIXTURE_LEAK: "1" });
  t("a battery RED that is a LEAK records the whole step open", [leak.status,
    (runsFor(F.root, treeAt(F.root))[0]?.steps || []).find((s) => s.label === "battery (all)")?.failedUnits ?? null], [1, null]);
  const leakAgain = gates(F.root);
  t("...so the next run is FULL again, never a narrowed RERUN", [leakAgain.status, leakAgain.cls], [0, "FULL"]);
}

/* ========================================================================== */
section("THE VERDICT RULE, driven over the module the guard imports");
{
  /* The record the gate wrote above, read back through the SAME functions the guard calls. */
  const tree = treeAt(F.root, "green");
  const eff = effectiveVerdict(runsFor(F.root, tree));
  t("the GREEN tree's record reads GREEN through the guard's own verdict rule", eff.verdict, "GREEN");
  t("a tree with no run reads NO verdict — not GREEN", effectiveVerdict(runsFor(F.root, "0".repeat(40))).verdict, null);
}

/* ========================================================================== */
section("M0-173 · THE COORD SNAPSHOT — ONE commit for the whole run, whatever a lane writes mid-gate");
/* THE DEFECT, MEASURED by CONDUCT #20 on 2026-09-24: a train's gate read `planning-hygiene` 75 pass / 1 fail at
   ~17:1xZ and the IDENTICAL tree, re-run by hand, read 76 / 0. That suite holds its OWN read of the plan against the
   figure a separately-spawned `plancheck` printed — two reads of `origin/coord`, a LIVE remote-tracking ref this very
   checkout moves when a unit's CLI fetches it — so the verdict moved with the hour rather than with the tree.
   The mechanism is driven END TO END here: the REAL reading layer (`tools/coord.mjs` in the fixture), a REAL remote
   `coord`, and a REAL fetch by the battery step mid-run. What is asserted is what the units READ. */
{
  const CX = fixture("coord-fx");
  const STATE = "docs/development/QUEUE.md";                 /* the switch file and the state read (M0-110) */
  const STATE_A = "### A-1 · the plan as this gate began";
  const STATE_B = "### B-1 · a row a lane wrote while the gate ran";
  const MOD = join(CX.root, "tools/coord.mjs");
  const readings = (g, tag = null) => g.ran.filter((l) => / coord(-after)? [0-9a-f]{8}| coord(-after)? none /.test(l))
    .filter((l) => tag === null || l.includes(` ${tag} `));
  const stateOf = (l) => l.split(" ").slice(3).join(" ");
  const shaOf = (l) => l.split(" ")[2];
  /* SEALED FROM THE OUTER RUN. This suite runs UNDER a gate, which pins `BIO_COORD_REF` for its whole run (§0b) — and
     that pin names a commit of the REAL repository, which this fixture does not hold. MEASURED 2026-09-24: with the
     variable inherited, five of this section's assertions fail and the state reads ABSENT, so the suite would have
     turned the gate red on its own fix. Every fixture gate below is therefore run with the variable CLEARED (empty is
     unset to both readers), except the arm that plants one deliberately. */
  const env = { GATES_FIXTURE_COORDMOD: MOD, GATES_FIXTURE_COORDREAD: STATE, BIO_COORD_REF: "" };

  /* (1) BEFORE there is a `coord` at all: a clone that never fetched it is told so, and nothing is pinned. (No coord
     environment here: the fixture does not carry the reading layer yet, and a stub told to import a module that is not
     there would fail the step — measured on this arm's first run.) */
  const none = gates(CX.root, ["--full"], { BIO_COORD_REF: "" });
  t("a checkout where origin/coord does not resolve says NOT PINNED and names the fetch",
    [/^gates: coord NOT PINNED — origin\/coord does not resolve in this checkout/m.test(none.out), none.status], [true, 0]);

  /* The real reading layer, so a unit's read is the estate's own read and not a model of it; and THE SWITCH — the
     state file on disk is the one-line pointer, so `readState` answers from the ref (M0-110). */
  /* CORRECTED 2026-09-25 by D-566: the reading layer was a HAND LIST (`["coord.mjs", "statepaths.mjs"]`), right on the
     day and silent the day `coord.mjs` gains a static import: the copied module would not load and this section would go
     red for the FIXTURE's reason. It is now derived by `moduleClosure`'s STATIC mode (M0-169, as M0-170 did) from the
     module itself; its `await import("./ledger.mjs")` and kin are lazy branches this section never reaches. */
  for (const rel of moduleClosure({ repo: REPO, roots: ["tools/coord.mjs"], dynamic: false }))
    put(CX.root, rel, readFileSync(join(REPO, rel)));
  const { pointerText } = await import(`file://${MOD}`);
  put(CX.root, STATE, pointerText(STATE));
  commitAll(CX.root, "coord-fx: the real coord layer, and a switched state file");
  landMain(CX.root);
  git(["fetch", "-q", "origin"], CX.root);

  /* A is what `origin/coord` holds when the gate begins; B is the lane's write, pushed but NOT yet fetched here. */
  const A = coordCommit(CX.root, STATE, `${STATE_A}\n`, null);
  git(["push", "-q", "--no-verify", "origin", `${A}:refs/heads/coord`], CX.root);
  git(["fetch", "-q", "origin", "+refs/heads/coord:refs/remotes/origin/coord"], CX.root);
  const B = coordCommit(CX.root, STATE, `${STATE_B}\n`, A);
  git(["push", "-q", "--no-verify", "origin", `${B}:refs/heads/coord`], CX.root);
  /* A PUSH ALSO MOVES THE PUSHER'S OWN REMOTE-TRACKING REF — measured on this arm's first run, which read B
     everywhere and looked exactly like a broken pin. The state being modelled is the lane's write landed ON THE
     REMOTE and NOT YET FETCHED here, which is what a lane's write looks like to another clone, so the ref goes back. */
  git(["update-ref", "refs/remotes/origin/coord", A], CX.root);
  t("the fixture is SWITCHED and reads A, with B pushed and not yet fetched (else the arms below cost nothing)",
    [out1(["rev-parse", "origin/coord"], CX.root) === A, A !== B, out1(["rev-parse", "refs/heads/coord"], CX.remote) === B],
    [true, true, true]);

  /* (2) THE RUN, with the lane's write arriving mid-gate through the battery's own fetch. */
  const tree = treeAt(CX.root);
  const g = gates(CX.root, ["--full"], { ...env, GATES_FIXTURE_COORDFETCH: "1" });
  const reads = readings(g);
  t("the gate PINNED the commit origin/coord held when it began, and SAYS so",
    [new RegExp(`^gates: coord PINNED at ${A.slice(0, 8)} —`, "m").test(g.out), g.status], [true, 0]);
  t("the fetch mid-run really MOVED origin/coord (the arm armed: a pin over a ref that never moves proves nothing)",
    out1(["rev-parse", "origin/coord"], CX.root), B);
  t("every unit of one run read the SAME coord commit and the SAME state — the snapshot, never the moving ref",
    [reads.length > 3, [...new Set(reads.map(shaOf))], [...new Set(reads.map(stateOf))]],
    [true, [A.slice(0, 8)], [STATE_A]]);
  t("...including the battery's own read AFTER its fetch, which is where the move would have landed",
    readings(g, "coord-after").map((l) => `${shaOf(l)} ${stateOf(l)}`), [`${A.slice(0, 8)} ${STATE_A}`]);
  const run = runsFor(CX.root, tree).slice(-1)[0];
  t("...and the RECORD names the pinned coord commit, so a verdict says which state it rests on",
    [run && run.coord, run && run.coordPinned, run && run.verdict], [A, true, "GREEN"]);

  /* (3) THE IDENTITY MUST COST SOMETHING: the same reader, unpinned, sees the move. */
  const bare = spawnSync(process.execPath, [join(CX.root, "tools/plancheck.mjs")],
    { cwd: CX.root, encoding: "utf8", env: { ...process.env, ...env, GATES_FIXTURE_LOG: LOG, BIO_COORD_REF: "" } });
  const unpinned = readFileSync(LOG, "utf8").split("\n").filter((l) => / coord [0-9a-f]{8} /.test(l)).slice(-1)[0] || "";
  t("the SAME reader with no pin reads the MOVED state (else the identity above costs nothing)",
    [bare.status, shaOf(unpinned), stateOf(unpinned)], [0, B.slice(0, 8), STATE_B]);

  /* (4) A PLANT IS NEVER OVERRIDDEN: an override already in the environment is a fixture's or a driver's, and this
     run reads what it names — `origin/coord` now being B. */
  const planted = gates(CX.root, ["--full"], { ...env, BIO_COORD_REF: A });
  t("an override already set when the gate began is kept, and the gate says it is not its own pin",
    [/^gates: coord NOT PINNED — BIO_COORD_REF was already set when the gate began/m.test(planted.out),
     [...new Set(readings(planted).map(stateOf))]], [true, [STATE_A]]);
}

/* ========================================================================== */
t(`FOOT — all ${SECTIONS} sections reached (a section that dies silently cannot leave a green count)`, reached, SECTIONS);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
