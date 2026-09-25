/* GATE: never-cache (history) — M0-126, BOB #30 (TREE-SHARING §3a condition 1): its verdict reads git ls-tree/show of pinned historical commits, which no
   result key can name; traced 2026-09-23. M0-136 (2026-09-23): it no longer reads the LIVE `origin/coord` — the coord state
   is read at `COORD_PIN` (`./coordpin.mjs`, named there with its why and its cost), and a planted-ref arm below proves the
   verdict identical whatever `origin/coord` holds.
   NEGATIVE CONTROL (M0-136, RUN 2026-09-23 by the M0-136 worker): `node bio-plane/test/coordpin.control.mjs op-claims` —
   this suite pointed back at the live `origin/coord` (arm L1, one line after the pin's import) -> exactly two FAILs,
   "…reads the PINNED coord commit, never a ref name" and "…is IDENTICAL whatever origin/coord holds", 39 pass / 2 fail, exit 1;
   the pin spelled out in the suite instead (S0, over-strictness) PASSES; each restored, sha256 and `cmp` identical. */
/* NEGATIVE CONTROL (D-302, run 2026-09-10, worktree agent-abe820d46ab667b7d): THE FIFTH
   FLOOR'S ARM, and it is the one this suite's own residual existed for. `node
   test/walkfloor.control.mjs phantom` plants an UNCOMMITTED file carrying a TRUE routing
   claim — the publish op, in this suite's own attribution grammar, stated to dispatch to
   the method the table really routes it to — and runs THIS SUITE: 35 pass,
   0 fail, and the attribution label prints `5 of 6 attribution(s)`. The SIX is the
   working-tree count, which is the figure this floor read until D-302 and is therefore
   the BEFORE state proved rather than described — a floor moved to the 6 a contaminated
   run PRINTED would be permanently too high and would fail every honest run afterwards
   (D-238's payload). The FIVE is `attributionsRepro`, restricted to `git ls-tree HEAD`,
   which is what the floor reads now and what no phantom can reach. Removing the plant
   prints `5 of 5`. THE FIXTURE COMPOSES ITS TOKEN AT RUNTIME AND SO DOES THIS PARAGRAPH,
   for the reason §5 below gives at length: a control whose fixture is SPELLED in a
   committed file is a claim sitting in the corpus it measures, and this arm's own
   expected figure would have moved by exactly the arm. Measured, not avoided by habit —
   the first draft of this block spelled it and the phantom's `5 of 6` became `6 of 7`.
   The companion arm `guardimport` points `walkfloor.mjs`'s grade back at
   the import spelling and hygiene then names THIS FILE as misgraded — 661/4 — because it
   does not import `provenance.mjs` while its five floors are the only guarded ones on the
   estate. Both armed ALONE, restores verified by sha256 AND by byte compare. */
/* NEGATIVE CONTROL (M0-18, run 2026-08-09, worktree agent-a62aec7acd493144e): the
   provenance floor added to this file is armed by `test/provenance-floor.control.mjs`
   — COMMITTED, so it re-runs in one step. 58 of 58 checks as declared over eight arms,
   each armed ALONE with every other defence held open, every restore verified by sha256
   AND by a full byte comparison against a UNIQUELY-NAMED per-arm pristine copy with the
   byte count printed and floored. ARM 8a/8b is armed on this file: a dot-directory of copied prose leaves this
   suite GREEN under M0-18's rule and REDS it under the pre-M0-18 named list.
   TWO ARMS CAME BACK WRONG FIRST AND BOTH FOUND DEFECTS IN THE HARNESS RATHER THAN IN
   THE SUBJECT — the harness pinned the very refusal codes its arm was about to test, and
   spelled an `op=` token that op-claims then read as a real claim. Recorded at their
   sites in the control, not smoothed. */
/* NEGATIVE CONTROL: (run 2026-08-08, m0-12-agent, M0-12) SIX arms, each RUN ALONE
   with the others held open, every edited file restored and verified by sha256 AND
   by `cmp` content compare, with every snapshot named uniquely by ARM as well as by
   path. Driven by `node test/op-claims.control.mjs`.
   Baseline 33 pass / 0 fail. Every arm came back AS DECLARED; the counts below are
   the ones MEASURED, not predicted.
   (a) plant a comment naming an op that does not exist, in `bio-plane/src/store.mjs`
       -> FAILS naming the file, the line and the op -> 32 pass / 1 FAIL.
   (b) plant IC-22's actual false sentence — the DO path written as an op — into a
       planning document -> FAILS as WRONG-LEVEL, naming `docs/development/
       VERIFICATION.md:<line>` and the op that really routes there (`op=publish`)
       -> 32 pass / 1 FAIL.
   (c) NEUTER THE WALK: `corpus()` returns nothing -> 27 pass / 6 FAIL, the corpus
       PRINTS `0 files`, and the reach fails as a DELTA. **AND THE FINDING THIS ARM
       EXISTS FOR REPRODUCED: the headline "no false claim anywhere" assertion
       STILL PASSED over the empty corpus** — vacuously true of nothing. It is
       caught only by the paired non-triviality assertions in section 2, which is
       why they are there and why they are asserted rather than printed.
   (d) NEUTER THE MATCHER: `mentionsIn()` returns `[]` -> 25 pass / 8 FAIL, the
       reach fixtures and the ledger both.
   (e) OVER-STRICTNESS: legitimate prose in spellings this suite did not author —
       `const op = q.get("op")`, a template-built name, `stop=`/`noop=`/`crop=`, a
       heading, a URL and a bare mention — planted into a REAL document
       -> 33 pass / 0 FAIL. **THE ARM PASSES ONLY BY NOT FIRING**, and it is the arm
       that decides whether this check survives contact with the estate.
   (f) break the dispatch reader's ALIAS half (`DO_PATH` emptied, routes kept)
       -> 29 pass / 4 FAIL. Existence alone was never the check; this is the half
       that catches IC-22 and it is the half that fails when it is removed. */

/* M0-12 — A COMMENT NAMING AN OP IS A CLAIM ABOUT THE DISPATCH TABLE.
 *
 * REC-58 was a whole queue item spent on one sentence in IC-22's SETTLED text.
 * The sentence was false, it had already been COPIED into the item's own scope,
 * and nothing in this repository could have told anybody. This suite is the thing
 * that tells somebody.
 *
 * WHAT IT ESTABLISHES, and read this before quoting it as a defence:
 *
 *   IT DOES     say that every `op=<name>` written anywhere in the corpus names a
 *               key of the OPS whitelist, or is registered with a human's reason.
 *   IT DOES     separate the two LEVELS — an op and a Durable Object path are not
 *               the same table, and the alias means the names do not correspond.
 *               This is the half that catches IC-22's sentence.
 *   IT DOES     check a stated ROUTING: prose saying an op dispatches to a named
 *               method must agree with the table.
 *   IT DOES NOT check what an op RETURNS. Nothing here reads a response shape.
 *               IC-22's sentence was wrong twice — wrong op AND wrong field — and
 *               only the op half is mechanical. **A field arriving through a
 *               SPREAD declares no key**, so no source-level instrument can see
 *               it; REC-58 measured that precisely and it is why this suite says
 *               so rather than reading as complete.
 *   IT DOES NOT verify that a stated NON-existence is true. See the long note in
 *               `scripts/op-claims.mjs`: that inversion was built, measured at a
 *               100% false-positive rate on this corpus, and removed.
 *
 * WOULD IT HAVE CAUGHT IC-22? YES, AND FOR A REASON WORTH BEING PRECISE ABOUT.
 * Not because it verifies the return shape — it does not — but because the
 * sentence named `publishcase` as an op and there is no such op. `DO_PATH` aliases
 * `op=publish` onto that DO path. The item that would have been saved was saved by
 * the level check, not by the behaviour check, and a report that claimed otherwise
 * would be exactly the overclaim this project treats as worse than a gap.
 */

import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import {
  sweep, readDispatch, corpus, mentionsIn, routeOf, opReaching,
  generatedReason, LEDGER_STATE, PLANNED_OPS, REPO,
} from "../scripts/op-claims.mjs";
/* M0-116: the MAIN half of the ledger is a module of its own, and THIS SUITE IS ITS ONLY IMPORTER — the one unit that
   sweeps the whole tree against it. Every other importer of `op-claims.mjs` inherited its 18 named files as inputs to
   `tools/gates.mjs` while reading none of them (why, and the figures: `../scripts/op-claims-ledger.mjs`'s head). */
import { LEDGER, LEDGER_MAIN } from "../scripts/op-claims-ledger.mjs";
import { isMovedPath } from "../../tools/statepaths.mjs";   /* M0-121: the predicate's walk-free home; coord.mjs re-exports it */
import { stripComments } from "../scripts/walkfloor.mjs";
import { fresh } from "../../tools/decided.mjs";   /* M0-99: the ruling index's ONE freshness call */
import { plantedCoord, assertPlanted, REPO as PIN_REPO } from "./coordpin.mjs";   /* M0-136: coord read at a PINNED commit */

const DIR = dirname(fileURLToPath(import.meta.url));

/* ---- D-265 · THE THREE PASSAGES THIS SUITE MAKES THROUGH THE CHOKEPOINT -------
 *
 * `sweep()` and `corpus()` now hand back their WORKING-TREE figures CLASSIFIED, so
 * a floor written on one refuses itself at the line that wrote it. Three uses here
 * legitimately need the bare value, and each says why — the reasons are named
 * constants rather than inline strings so `hygiene.test.mjs`'s ratchet reads three
 * DECISIONS instead of three occurrences of a spelling, and so a fourth passage
 * cannot be added without writing a fourth reason.
 *
 * The unwrap is not a way round the classification. It IS the classification: the
 * difference between the old state and this one is that a floor on the whole
 * working tree used to be indistinguishable, in the source, from a subset check. */
const FIGURE_IS_THE_SUBJECT =
  "the relationship between the two populations is what is being asserted, so the "
  + "working-tree figure is the SUBJECT of the comparison and not a ratchet";
const WHOLE_TREE_IS_THE_SUBJECT =
  "the dot-segment rule is a claim about what the WALK admitted, so it must be asked "
  + "of the whole working tree; narrowing it to HEAD would hide exactly the arrival it checks";
/* D-302 REMOVED THE THIRD REASON THAT STOOD HERE. `ATTRIBUTIONS_NOT_YET_REPRODUCIBLE`
   named the one passage through the chokepoint that was a REAL floor over the working
   tree — D-265's residual, and the only one of D-268's five that naming could not
   rescue. `sweep()` now publishes `attributionsRepro`, so the floor below reads the
   HEAD-reproducible figure and the unwrap is GONE rather than re-justified. The two
   constants above remain because their sites genuinely need the working-tree number:
   each is a SUBSET or COLLAPSE check whose subject IS that population. */

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`
    + (ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`));
  ok ? pass++ : fail++;
};

/* ---------------------------------------------------- 1. the authority is real */
/* A dispatch reader that read NOTHING would make every claim below vacuously true,
   so the table is asserted to be non-trivial BEFORE anything is checked against it.
   This is the empty-corpus failure one level up: an authority of size zero agrees
   with every sentence ever written. */
console.log("\n--- 1. the dispatch table was actually READ, at both levels ---");
const table = readDispatch();
t("OPS is a non-trivial whitelist read out of src/index.mjs", table.ops.size >= 120, true);
t("the store's dispatch map is a non-trivial route table read out of src/store.mjs",
  table.routes.size >= 120, true);
t("DO_PATH — the alias map — was read and is non-empty", table.doPath.size >= 1, true);

/* THE ALIAS IS THE WHOLE REASON EXISTENCE ALONE IS NOT THE CHECK. Pinned by value:
   if this stops being true the level check below stops meaning what it says. */
t("`op=publish` is an ALIAS onto the DO path `publishcase` — the op whose NAME matches "
+ "the method is routed AWAY from it, which is why a name-existence check would have "
+ "passed IC-22's sentence",
  table.doPath.get("publish"), "publishcase");
t("and the DO path `publishcase` is NOT itself an op — sending it as `op=` is `unknown op`",
  table.ops.has("publishcase"), false);
t("the routing chain resolves end to end: op=publish -> publishcase -> publishCase()",
  routeOf("publish", table), { doPath: "publishcase", method: "publishCase" });
t("and the wrong-level answer names the op that DOES reach that path",
  opReaching("publishcase", table), "publish");

/* ------------------------------------------------------ 2. the corpus was READ */
/* PRINTED EVERY RUN, so a corpus that SHRANK is visible rather than silent. Three
   separate walks in this repository this week reported a beautiful clean verdict
   over an empty corpus, twice inside the instrument built to prevent it. */
console.log("\n--- 2. the corpus, PRINTED, and asserted non-trivial ---");
/* M0-99, 2026-09-22: `docs/DECIDED.md` is no longer COMMITTED, so a working tree holds it only once
   something has asked for it — never in a fresh checkout. The generated-artifact assertion below is
   about this walk recognising the index BY ITS BANNER, so the index is produced first through the ONE
   freshness call every reader of it makes, rather than the assertion depending on whether this
   checkout happened to run the tool. */
/* NEGATIVE CONTROL (M0-116, RAN 2026-09-22 by the M0-116 worker): one MAIN ledger entry (MEASUREMENTS.md · inboxlist)
   put back into `op-claims.mjs`'s `LEDGER_STATE` -> 35 pass / 2 fail, exactly the two M0-116 arms: "the ledger is ONE
   ledger in two halves" (53 main + 12 state, a main file among the state entries) and "op-claims.mjs, read as code, names
   none of the 18 file(s)"; restored by cp, sha256 and `cmp` identical, 42,034 bytes. The OVER-STRICTNESS arm is live in
   the tree and needs no plant: `op-claims.mjs` still names MEASUREMENTS.md in a COMMENT (its language-reading note),
   and the code-read arm stays GREEN over it. */
/* NEGATIVE CONTROL (M0-99, run 2026-09-22 by the M0-99 worker): the index moved aside, as a fresh checkout
   has it, and the `fresh();` line below deleted -> "EVERY generated artifact is excluded" FAILS, 34 pass / 1 fail,
   exit 1; with the line, over the same absent index, 35 / 0. Restored by cp-back, sha256 and `cmp` identical. */
fresh();
/* M0-116: the ledger is PASSED. Until 2026-09-22 `sweep()` defaulted to the main half, which meant `op-claims.mjs`
   imported it; it now defaults to NOTHING excused, so this call names the ledger it is held to. */
const result = sweep({ ledger: LEDGER_MAIN });
console.log(`  M0-12 CORPUS: ${result.files} files, ${result.chars} chars scanned; `
  + `${result.mentions} op= mentions over ${result.names.count} distinct names; `
  + `${result.dynamic} dynamic (template-built) skipped; `
  + `${result.excluded.length} generated artifact(s) excluded `
  + `(${result.excluded.map((x) => `${x.rel} ${x.chars} — ${x.why}`).join("; ")})`);
console.log(`  M0-12 LEDGER: ${LEDGER.length} (file,name) registrations · `
  + `${LEDGER.reduce((a, e) => a + e.n, 0)} sites · ${PLANNED_OPS.length} PLANNED op name(s)`);

/* ---- M0-18 · THE FLOORS BELOW ARE THE REPRODUCIBLE FIGURES ------------------
 *
 * THE WALK IS IN `scripts/op-claims.mjs` AND THE FLOOR IS HERE, WHICH IS WHY
 * `hygiene.test.mjs`'s class census never enumerated this exposure: that census
 * grades a file by whether IT contains a `readdirSync(`, and this file performs
 * no walk. The census named `scripts/op-claims.mjs` as "reports a claim census",
 * which understated it — the walk feeds four floors, and they are here.
 *
 * `refs/stash` is repository-wide across all sixty worktrees of this repository
 * and `git stash push -u` carries untracked files, so a phantom arrives from a
 * tree that never wrote it (D-238) and can only push these floors UP. A floor
 * moved to the figure a contaminated run PRINTED is permanently too high, fails
 * every honest run afterwards, and gets switched off.
 *
 * THE SWEEP IS UNCHANGED AND STILL READS EVERY BYTE OF THE WORKING TREE. A
 * sentence naming a non-existent op in a file nobody has committed is still a
 * false claim and still a FINDING — the headline arms below are deliberately
 * left over the whole corpus. Only the REACH FLOORS narrow.
 *
 * WHAT THIS DOES NOT CLOSE: provenance answers about a PATH. A tracked file
 * whose CONTENT arrived from elsewhere counts toward the reproducible figure.
 * This detects an ARRIVAL, not a MODIFICATION. */
const HEAD_SAYS = result.prov.inHead === null
  ? "UNVERIFIED — git could not answer `ls-tree HEAD`, so these are the whole working-tree figures and are NOT a claim about any commit"
  : `in the commit at HEAD (${result.prov.headSha})`;
console.log(`  M0-18 CORPUS, REPRODUCIBLE: ${result.filesRepro} of ${result.files} file(s), `
  + `${result.charsRepro} of ${result.chars} chars, ${result.mentionsRepro} of ${result.mentions} mention(s) `
  + `over ${result.namesRepro.length} of ${result.names.count} distinct name(s) are ${HEAD_SAYS} `
  + `— the floors below apply to THESE`);
console.log(`  M0-18 SKIPPED BY THE DOT-SEGMENT RULE: ${result.skipped.length} path(s) `
  + `(${result.skipped.slice(0, 12).join(", ")}${result.skipped.length > 12 ? ", …" : ""}) `
  + `— the ruling and what it costs are at the rule in scripts/op-claims.mjs`);

/* CORRECTED 2026-08-09 BY M0-18, NEVER EXEMPTED. Both arms floored on figures
   read off the working tree, where an untracked arrival raises them and nothing
   said so. The questions are unchanged; the corpus they are asked about is now
   the one another checkout at this HEAD reproduces. */
t(`the corpus is non-trivial — a walk over nothing reports its verdict triumphantly — counted over the `
+ `files another checkout REPRODUCES (${result.filesRepro} file(s), ${result.charsRepro} chars, ${HEAD_SAYS})`,
  [result.filesRepro >= 300, result.charsRepro >= 10_000_000], [true, true]);
t(`and it found a non-trivial population of op= mentions to check, over that same reproducible corpus `
+ `(${result.mentionsRepro} mention(s), ${result.namesRepro.length} distinct name(s))`,
  [result.mentionsRepro >= 5000, result.namesRepro.length >= 150], [true, true]);
t("the provenance check either verified against `git ls-tree HEAD` or reported UNVERIFIED — never a silent "
+ "third state, and under UNVERIFIED every pair of figures COLLAPSES rather than the reproducible one reading zero",
  /* D-265: the three comparisons below read the WORKING-TREE figure, and the walk now
     refuses a bare comparison on one. They are NOT floors — each is a SUBSET or a
     COLLAPSE check whose whole subject is the relationship between the two
     populations, so the working-tree number is the thing being asked about rather
     than a ratchet somebody moves. The unwrap says so at the site, which is the
     point: this is the one shape that has to be allowed, and it is now visible
     instead of indistinguishable from a floor. */
  [result.prov.inHead instanceof Set || result.prov.inHead === null,
   result.filesRepro <= result.files.overWorkingTree(FIGURE_IS_THE_SUBJECT)
     && result.mentionsRepro <= result.mentions.overWorkingTree(FIGURE_IS_THE_SUBJECT),
   result.prov.inHead === null
     ? result.filesRepro === result.files.overWorkingTree(FIGURE_IS_THE_SUBJECT)
       && result.mentionsRepro === result.mentions.overWorkingTree(FIGURE_IS_THE_SUBJECT) : true],
  [true, true, true]);
/* THE DOT-SEGMENT RULE IS ENFORCED, NOT DESCRIBED. A rule stated in a comment
   and enforced by nothing is the defect this project meets most often, so the
   walk is asked directly whether it admitted anything under a dot. */
t("no file under a dot path segment is in the corpus — the rule at the walk is DRIVEN rather than described",
  corpus().files.overWorkingTree(WHOLE_TREE_IS_THE_SUBJECT)
    .filter((f) => f.rel.split("/").some((s) => s.startsWith("."))).map((f) => f.rel), []);
/* CORRECTED 2026-08-10, never exempted, and the count moved from 2 to 3 for a
   REASON rather than to make a red suite green. `docs/DECIDED.md` is generated by
   `tools/decided.mjs` and QUOTES every ruling in the corpus, so each quoted `op=`
   token arrived here a second time and was attributed to the INDEX rather than to
   the line that made the claim — one fact counted twice, which is the very class
   ("a second place a fact is stated") this repository refuses everywhere else. The
   source line is still swept where it lives, so nothing stopped being checked.
   The THREE named assertions below are what actually matter; the count is the arm
   that notices a fourth arriving unannounced, and it is kept for that. */
t("EVERY generated artifact is excluded, each recognised STRUCTURALLY at "
+ "byte 0 and NONE by filename — a walk excluding only the warned-about one reads "
+ "the plane's own comments as a third party's claims about it",
  [result.excluded.length,
   result.excluded.some((x) => /newgroup\/src\/release\.mjs/.test(x.rel)),
   result.excluded.some((x) => /release\/bio-plane\.bundled\.mjs/.test(x.rel)),
   result.excluded.some((x) => /docs\/DECIDED\.md/.test(x.rel)),
   /* ADDED 2026-09-13 (DS-4): release 0.57.0 publishes the fleet, and
      release/pdf-worker.bundled.mjs INLINES bio-plane/src — an embed of the plane
      for the same reason the other two are. */
   result.excluded.some((x) => /release\/pdf-worker\.bundled\.mjs/.test(x.rel))],
  [4, true, true, true, true]);
t("AND THE GENERATOR IS KEPT IN — `newgroup/scripts/embed-release.mjs` carries the "
+ "banner because it WRITES it; excluding it would hide a real claim while still reading green",
  generatedReason(readFileSync(join(REPO, "newgroup/scripts/embed-release.mjs"), "utf8")), null);

/* --------------------------------------- 3. THE HEADLINE: no unaccounted claim */
console.log("\n--- 3. every op= mention names a real op, or is registered with a reason ---");
const nameFinding = (f) => `${f.site} · ${f.class} · ${f.detail}`;
t(`no comment and no planning document names an op that is not in the dispatch table `
+ `(${result.mentions} mentions checked)`,
  result.findings.filter((f) => f.class !== "WRONG-METHOD").map(nameFinding), []);
t("and no prose attributes an op to a method the dispatch table does not route it to",
  result.findings.filter((f) => f.class === "WRONG-METHOD").map(nameFinding), []);
/* CORRECTED 2026-09-10 BY D-302, NEVER EXEMPTED — AND THE CORRECTION IS THE ITEM.
   D-268 found this floor: the FIFTH, the one no census row and no brief had named.
   D-265 could only NAME it, because by D-257's ruling it should be GUARDED — floored
   over `git ls-tree HEAD` — and `sweep()` published no reproducible pair to floor on.
   It does now, so the question is unchanged and the corpus it is asked about is the
   one another checkout at this HEAD reproduces. The old assertion was wrong in the
   D-238 direction: an attributed routing sentence in a file nobody committed — a
   phantom carried in by `git stash push -u`, which is repository-wide across every
   worktree here — could only push it UP, and a floor moved to the figure a
   contaminated run PRINTED is permanently too high and gets switched off.

   THE FLOOR IS THE FIGURE THE INSTRUMENT PRINTED, 5, AND NOT A ROUND NUMBER BELOW IT.
   Its four siblings above are floored at 300 / 10,000,000 / 5,000 / 150 against
   corpora of hundreds and millions, where an exact pin would red on every commit that
   adds a paragraph. This population is FIVE HAND-WRITTEN SENTENCES, all of them in
   append-only history or in a SETTLED IC, so the exact figure is the honest ratchet
   and a fall is a real event somebody should read — which is the identical argument
   `LEDGER` makes for holding its own counts exactly rather than as a ceiling. The
   label prints both figures, so a legitimate move is a one-line edit and the number
   to write is already on screen.
   MOVED 5 -> 3 ON 2026-09-22 BY M0-110, FROM THE PRINTED FIGURE, AND IT IS NOT SLACK: two of the five sentences sit
   in STATE files (`docs/archive/ledgers/QUEUE-2026-08.md` and one more in the archive family), which left `main` for
   the branch `coord`; this walk no longer sweeps state (BOB #28's ruling 2), and those two are judged by the coord
   write's ledger check LC-op-claims, which runs this same `sweep()` over the state texts. The population did not
   fall; it was partitioned, and the two halves together still hold all five. */
t(`the attribution half found real routing claims to check — a grammar matching `
+ `nothing would pass this vacuously — counted over the corpus another checkout `
+ `REPRODUCES (${result.attributionsRepro.length} of ${result.attributions.count} `
+ `attribution(s), ${HEAD_SAYS})`,
  result.attributionsRepro.length >= 3, true);

console.log("\n--- 4. the ledger is held EXACTLY, and every entry can expire ---");
t("no ledger entry has drifted: each registered (file,name) appears exactly as many "
+ "times as it says, and each kind's own assertion still holds",
  result.ledgerDrift, []);
t("no PLANNED op has been BUILT — a registration that outlived its deferral is a "
+ "document that became true while nobody re-read it",
  result.plannedBuilt, []);
t("the ledger is non-empty and every entry carries a reason",
  [LEDGER.length >= 20, LEDGER.every((e) => typeof e.why === "string" && e.why.length >= 8)],
  [true, true]);
/* M0-116 · THE TWO HALVES ARE ONE LEDGER, PARTITIONED BY BRANCH, AND THE MODULE 38 UNITS IMPORT NAMES NONE OF MAIN'S
   FILES. The partition was a filter over one list until 2026-09-22; it is now two files, so which file an entry sits in
   is asserted against `isMovedPath` rather than trusted. And the reason the main half moved is asserted where it
   bites: `op-claims.mjs`, read as CODE (comments blanked by the estate's one lexer, strings kept — exactly how
   `tools/gates.mjs` reads a file a unit imports), names no file the main half registers. A main entry moved back into
   it turns this RED by name; the gate would otherwise just quietly re-run a third of the battery again. */
const opClaimsCode = stripComments(readFileSync(join(REPO, "bio-plane/scripts/op-claims.mjs"), "utf8"));
const mainFiles = [...new Set(LEDGER_MAIN.map((e) => e.file))];
t(`the ledger is ONE ledger in two halves: ${LEDGER_MAIN.length} main + ${LEDGER_STATE.length} state = ${LEDGER.length}, `
+ "every state entry is a state file and no main entry is",
  [LEDGER.length === LEDGER_MAIN.length + LEDGER_STATE.length, LEDGER_STATE.length > 0, LEDGER_MAIN.length > 0,
   LEDGER_STATE.filter((e) => !isMovedPath(e.file)).map((e) => e.file),
   LEDGER_MAIN.filter((e) => isMovedPath(e.file)).map((e) => e.file)],
  [true, true, true, [], []]);
t(`op-claims.mjs, read as code, names none of the ${mainFiles.length} file(s) the main half registers `
+ "(M0-116: its importers are not readers of them)",
  mainFiles.length > 0 ? mainFiles.filter((f) => opClaimsCode.includes(f)) : ["(the main half names no file)"], []);

/* ------------------------------------------------------- 5. REACH, AS A DELTA */
/* Every arm below is a DELTA between text that must fire and text that must not,
   never an absolute count. A detector that finds nothing passes every absolute. */
console.log("\n--- 5. REACH: the matcher fires on what it must, as a delta ---");

const flagged = (text) => {
  const out = [];
  for (const mt of mentionsIn(text)) {
    if (mt.kind === "DYNAMIC") continue;
    if (table.ops.has(mt.name)) continue;
    out.push(mt.name);
  }
  return out;
};

/* THE FIXTURES ARE BUILT, NEVER SPELLED, AND THAT IS NOT A STYLE CHOICE.
   This suite sits INSIDE the corpus it sweeps. A fixture written literally is a
   claim about the dispatch table sitting in a file the walk reads, and the first
   draft of this suite FAILED ITSELF in four places — exactly the "sweep arm that
   failed by citing itself" shape this project has already paid for. Composing the
   token at runtime leaves no claim in the source while the test carries the whole
   one. `scripts/op-claims.mjs` obeys the same rule in its own header, for the same
   reason: an instrument that cannot live under its own rule is telling you the
   rule is wrong. */
const OP = (n) => "op=" + n;

const CLEAN = `the caller sends ${OP("publish")} and the plane answers; see ${OP("ratify")} and ${OP("audit")}.`;
const PLANTED_UNKNOWN = `the caller sends ${OP("notarealopatall")} and the plane answers.`;
const PLANTED_WRONGLEVEL = `${OP("publishcase")} returns \`opened\` to the member who just published.`;

t("REACH (a) AS A DELTA — a planted comment naming an op that DOES NOT EXIST is "
+ "flagged, and the same sentence with a real op is not",
  [flagged(CLEAN), flagged(PLANTED_UNKNOWN)], [[], ["notarealopatall"]]);
t("REACH (b) AS A DELTA — IC-22's ACTUAL SENTENCE, the DO path written as an op, is "
+ "flagged; this is the arm the whole item exists for",
  [flagged(CLEAN), flagged(PLANTED_WRONGLEVEL)], [[], ["publishcase"]]);

/* The two classes must be DISTINGUISHED, not merged: "no such name anywhere" and
   "a real name at the wrong level" need different corrections, and only the second
   can name the op that actually routes there. */
const classOf = (text) => {
  const r = sweepText(text);
  return r.map((f) => f.class);
};
function sweepText(text) {
  const out = [];
  for (const mt of mentionsIn(text)) {
    if (mt.kind === "DYNAMIC" || table.ops.has(mt.name)) continue;
    out.push({ class: table.routes.has(mt.name) ? "WRONG-LEVEL" : "NO-SUCH-OP", name: mt.name });
  }
  return out;
}
t("REACH (c) — the two classes are told apart, because they need different corrections",
  [classOf(PLANTED_UNKNOWN), classOf(PLANTED_WRONGLEVEL)], [["NO-SUCH-OP"], ["WRONG-LEVEL"]]);

/* The attribution half, both directions, on fixtures. */
const attributedIn = (text) => mentionsIn(text)
  .filter((m) => m.kind !== "DYNAMIC" && m.attributed)
  .map((m) => `${m.name}->${m.attributed}`);
t("REACH (d) AS A DELTA — a stated routing is READ, and the right one and the wrong "
+ "one are read identically; it is the comparison that separates them",
  [attributedIn(`${OP("publish")} dispatches to \`Store.publishCase()\`, which is correct.`),
   attributedIn(`${OP("publish")} dispatches to \`Store.publishSomethingElse()\`, which is not.`),
   attributedIn(`${OP("publish")} is the state act.`)],
  [["publish->publishCase"], ["publish->publishSomethingElse"], []]);

/* ------------------------------------------- 6. OVER-STRICTNESS, THE ARM THAT
   DECIDES WHETHER THIS SURVIVES CONTACT WITH THE ESTATE. A hygiene check that
   cries wolf gets switched off, which is VERIFICATION.md's own stated reason for
   not making --strict the gate yet. Each fixture below is a REAL shape from this
   tree, in a spelling this suite's author did not invent. */
console.log("\n--- 6. OVER-STRICTNESS: legitimate prose in unanticipated spellings must NOT fire ---");
const MUSTNOT = [
  ["a JS assignment, live in three civicos-ui suites",
   `fetch: async u => { const q = new URL(u,"https://x.test").searchParams, ${OP("q")}.get("op"); }`],
  ["another assignment spelling, same class",
   `const p = new URL(u).searchParams; const ${OP("p")}.get("op");`],
  ["a name BUILT at runtime, which no source reader can resolve",
   "return `" + OP("version") + "${act} moves what the record stands on`;"],
  ["a longer word ENDING in op=, which is not an op mention at all",
   "the request carried stop=1 and noop=true and crop=full"],
  ["a real op named in ordinary prose, no backticks, mid-sentence",
   `the operator then runs ${OP("audit")} and reads the findings`],
  ["a real op inside a URL with parameters after it",
   `await GET("${OP("image")}&token=mem-rec17&id=" + encodeURIComponent(id))`],
  ["a real op named at the very start of a line",
   `${OP("promote")} is the write path\nand nothing else is`],
  ["an ANGLE-BRACKETED placeholder in a rule's own template text",
   "every `" + OP("<name>") + "` appearing in a comment must name a real op"],
  ["an op named in a heading with punctuation immediately after",
   `### ${OP("ratify")}, and what it refuses`],
  ["a real op followed immediately by a closing backtick and a comma",
   `see \`${OP("promote")}\`, \`${OP("acquire")}\` and \`${OP("attest")}\``],
];
for (const [why, text] of MUSTNOT)
  t(`MUST NOT FIRE — ${why}`, flagged(text), []);

/* And the arm's own control: the fixtures are not passing because the matcher is
   dead. One planted violation in the SAME shapes must still fire. */
t("...and the must-not-fire fixtures are not passing because the matcher is dead — "
+ "one planted violation in the same shapes still fires",
  flagged(`the operator then runs ${OP("notarealopatall")} and reads the findings`),
  ["notarealopatall"]);

/* --------------------------------------------------- 7. the walk reads FILES */
/* corpus() is the half a neutering hits hardest, so it is asserted directly rather
   than only through the headline. */
console.log("\n--- 7. the walk reads real files from both halves of the named corpus ---");
const rels = new Set(corpus().files.overWorkingTree(WHOLE_TREE_IS_THE_SUBJECT).map((f) => f.rel));
t("the walk reaches bio-plane source, bio-plane tests, docs/development, the "
+ "kickoffs, the installer and the UI — the sentence that cost REC-58 an item was "
+ "in a planning document, not in code",
  [rels.has("bio-plane/src/store.mjs"), rels.has("bio-plane/src/index.mjs"),
   rels.has("bio-plane/test/case-opened.test.mjs"),
   rels.has("docs/development/INTERFACE-CHANGES.md"),
   /* CORRECTED 2026-09-22 by M0-110: this read `QUEUE.md`, which is STATE and left `main` for `coord`; the walk
      no longer sweeps state (the ledger check does), so the planning-document half of the reach is asked of a
      planning document that stays on `main`. The question — does the walk reach the planning prose — is unchanged. */
   rels.has("docs/development/ORCHESTRATION.md"),
   [...rels].some((r) => r.startsWith("docs/development/kickoffs/")),
   [...rels].some((r) => r.startsWith("newgroup/")),
   rels.has("civicos-ui/app.html")],
  [true, true, true, true, true, true, true, true]);

console.log("M0-136: the coord reads are at the PINNED commit, and the verdict does not move with origin/coord");
{
  /* This suite's one coord read is the `fresh()` call above: it renders the ruling index from the corpus, state half included, which until M0-136 was the LIVE `origin/coord`. The probe is what `fresh()` renders; the planted commit empties CLAIMS.md, which moves it when read. */
  const p = plantedCoord({
    probe: `const { createHash } = await import("node:crypto");\nconst { scan, render } = await import(${JSON.stringify(PIN_REPO + "/tools/decided.mjs")});\nconst reg = []; const rows = scan(undefined, undefined, { sink: reg });\nconsole.log(JSON.stringify({ rows: rows.length, register: reg.length, index: createHash("sha256").update(render(rows, reg)).digest("hex").slice(0, 16) }));`,
    plant: { "docs/development/CLAIMS.md": "planted by M0-136: a CLAIMS.md with no rulings\n" } });
  assertPlanted(t, "op-claims", p);
}

console.log(`\nop-claims: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
