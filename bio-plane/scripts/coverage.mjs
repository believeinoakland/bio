#!/usr/bin/env node
/* Coverage, measured in the units this project actually fails in.
 *
 * WHY NOT LINE COVERAGE. 36 of the 38 suites drive the plane through Miniflare,
 * which runs `src/**` inside WORKERD, not inside this node process. NODE_V8_COVERAGE
 * therefore sees the harness and not the subject: it would report high coverage of
 * the test files and nothing at all about `store.mjs`. A line-coverage number
 * produced that way would be a fabrication in exactly the sense `cpu.mjs` records
 * for a Worker timing itself, so this instrument does not produce one.
 *
 * WHAT IT MEASURES INSTEAD. The three surfaces whose gaps have actually shipped
 * defects in this repository:
 *
 *   1. OPS.  `op=invitelook` shipped with a ReferenceError while 1276 assertions
 *      passed, because the suite drove the STORE and the control plane was the only
 *      route a real caller had (D-43). So an op is reported at three levels: reached
 *      through the control plane, reached only at the Durable Object, or not reached
 *      at all. The middle level is the D-43 class and is reported as a WARNING
 *      rather than a pass.
 *
 *   2. CHECKS.  The catalog is the conformance contract. A check no assertion ever
 *      names is a rule nobody is enforcing, which is the same defect class as an
 *      exempted test (CLAUDE.md).
 *
 *   3. NEGATIVE CONTROLS.  "A suite that does not fail when you break its subject is
 *      testing something else." That discipline has been real and unrecorded, so
 *      nobody could answer which suites had been controlled and when. A suite
 *      declares its control in a header line and this instrument keeps the register.
 *
 * A suite declares its negative control in a comment ANYWHERE in the file:
 *
 *     NEGATIVE CONTROL: <what to break> -> <what must then fail>
 *
 * and the declaration may run to as many lines and as many arms as it needs. The
 * detector lives in `scripts/control-register.mjs` so the battery can test it —
 * M0-9, after a version of it read a five-arm block as one arm and read two
 * elaborate blocks as no control at all. Read that module's header before
 * changing anything about where a declaration starts, ends, or how arms count.
 *
 * Exit code is 0 unless --strict is passed, under which any op unreachable through
 * the control plane, any check never named, or any suite with no declared control
 * fails the run. Report first, enforce when the floor has been set.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readControl } from "./control-register.mjs";
/* D-277: THE CORPUS IS DECLARED CODE, NOT RAW SOURCE. Read that module's header
   before changing anything about how a check id is harvested or credited — the
   rule it carries is an INVERSION (a declaration is something the program says)
   and not a list of prose spellings to skip, and the reason is that this
   instrument GATES. Until 2026-08-09 an ordinary explanatory comment in the
   catalogue naming a numeral put that numeral IN the catalog, where nothing
   named it, and `--strict` exited 1 on a complete family. */
import { codeOnly, declaredCheckIds, proseOnlyCheckIds, namesCheckId } from "./declared-source.mjs";
/* M0-16 / D-238: THIS INSTRUMENT DISCOVERS OVER THREE DIRECTORIES IT DOES NOT
   CONTROL, AND UNTIL NOW REPORTED NUMBERS FROM ALL THREE WITHOUT SAYING SO.
   `test/` (the suites and therefore the whole negative-control register),
   the repository root twice (fleet manifests, and Worker directories). The
   consequence is not hypothetical and is the reason this was an item: the
   REGISTER_FLOOR below is MOVED BY HAND to a figure a green run PRINTED, so a
   floor moved while a phantom suite was present is PERMANENTLY TOO HIGH — it
   fails every honest run afterwards, and a gate that fails honest runs gets
   switched off, which is VERIFICATION.md's own stated reason for not making
   `--strict` the gate yet. See `provenance.mjs` for the mechanism and, more
   usefully, for what the check cannot see. */
import { readGitProvenance, reportProvenance, repoPath } from "./provenance.mjs";
import { spawnSync } from "node:child_process";
import { RUN_VERBS, RUN_WINDOW, readRunEvidence } from "./control-register.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = join(ROOT, ".."); // the fleet lives BESIDE the plane, not inside it.
const STRICT = process.argv.includes("--strict");
const JSON_OUT = process.argv.includes("--json");

/* ---------------------------------------------------------------- inventory */

const indexSrc = readFileSync(join(ROOT, "src/index.mjs"), "utf8");
const checksSrc = readFileSync(join(ROOT, "checks/bio-checks.mjs"), "utf8");

/* The body of a `<name> = { ... }` object literal, brace-matched out of source
   so a table read this way cannot fall behind a hand-kept list (D-113/D-93). The
   plane's OPS table and a fleet member's SURFACE table are both read this way. */
function tableBody(src, name) {
  const decl = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*\\{`);
  const m = decl.exec(src);
  if (!m) return null;
  let i = src.indexOf("{", m.index), depth = 0;
  for (let p = i; p < src.length; p++) {
    if (src[p] === "{") depth++;
    else if (src[p] === "}") { depth--; if (depth === 0) return src.slice(i + 1, p); }
  }
  return null;
}

/* The op table, read out of the module rather than hand-listed, so an op added
   later cannot pass by not being mentioned. Same reasoning as the capability
   completeness test. */
function opTable(src) {
  const body = tableBody(src, "OPS");
  if (body == null) throw new Error("OPS table not found in src/index.mjs");
  const ops = new Map();
  for (const m of body.matchAll(/^\s{2}([a-z][a-z0-9]*)\s*:\s*\{([^}]*)\}/gm)) {
    const mutating = /mutating:\s*true/.test(m[2]);
    const classes = /classes:\s*null/.test(m[2]) ? null
      : [...m[2].matchAll(/"([a-z]+)"/g)].map((c) => c[1]);
    ops.set(m[1], { mutating, classes });
  }
  return ops;
}

const OPS = opTable(indexSrc);
/* D-277. The catalog is what the catalogue DECLARES, and a comment declares
   nothing. `CHECKS_IN_PROSE` is the excluded set and is PRINTED on every run:
   narrowing a corpus without naming what was dropped trades a loud error for a
   quiet one, and a REAL check that somehow exists only in prose must be visible
   rather than silently uncatalogued. */
const CHECKS = declaredCheckIds(checksSrc);
const CHECKS_IN_PROSE = proseOnlyCheckIds(checksSrc);
/* THE REACH GUARD, and it is the first thing to suspect if this instrument ever
   goes quiet. A scanner that misclassified the whole file would blank everything
   and report a beautiful 100% over an EMPTY catalog — this project has caught a
   headline assertion passing over an empty corpus three times. Tree-independent
   on purpose (two suites drive this script inside throwaway repositories whose
   catalogs hold one check), so it asks the only question that is true of every
   tree: the raw text holds ids and the code holds none. The REPOSITORY's own
   numeric floor is `test/declared-corpus.test.mjs`'s, where a repository-specific
   figure belongs. */
const catalogWentBlind = CHECKS.length === 0 && CHECKS_IN_PROSE.length > 0;

const suites = readdirSync(join(ROOT, "test"))
  .filter((f) => f.endsWith(".test.mjs")).sort();

/* Probes and benches are deliberately excluded: they are instruments, not the
   battery, and `npm test` does not run them. Counting them would inflate the
   figure with work no gate depends on. */

/* ------------------------------------------------------------- measurement */

/* D-277: `code` is the suite with its prose blanked, and it is what every CREDIT
   below is computed over. The catalog side was the reported defect; the credit
   side is the SAME defect pointing the other way and it was live — three
   catalogued checks were credited as "named by an assertion" on the strength of
   a sentence in a test's comments, and one of them ONLY on a sentence. A check
   whose coverage is prose is the C-20.1 class this section exists to refuse:
   clean because it was not looking. `src` is kept beside it because two
   questions here are legitimately about the RAW file. */
const battery = suites.map((f) => {
  const src = readFileSync(join(ROOT, "test", f), "utf8");
  return { file: f, src, code: codeOnly(src) };
});

/* ------------------------------------------------- THE DRIVER CENSUS (M0-51)

   WHAT WAS WRONG. `hasDriver` asked `existsSync(test/<suite>.control.mjs)`, so it
   measured a NAMING CONVENTION and called the answer a fact about the estate. A
   correctly written, committed, runnable driver under any other name read as
   ABSENT. Measured on this tree, 2026-09-17, by a literal walk: **19 of 71
   drivers have no same-named `.test.mjs` sibling** and were therefore invisible
   to this reader — up from the TWELVE the row was written against on 2026-09-16,
   seven having arrived in one day. The population is GROWING, which is why the
   spot fix was refused: renaming one driver to satisfy the matcher is tuning the
   SUBJECT to fit the INSTRUMENT, and would leave eighteen invisible while making
   the nineteenth look handled.

   THE FIX INVERTS THE TEST RATHER THAN LENGTHENING A LIST OF SPELLINGS —
   VERIFICATION.md's driver law, REC-70's lesson, and the same move that repaired
   the arms matcher. Instead of guessing a driver's NAME from the suite, walk the
   DRIVERS and let each one say which suites it drives. The relation is then
   MEASURED off the artifacts that must exist for the driver to work at all,
   rather than inferred from a filename.

   WHY NOT THE OTHER TWO CANDIDATES, recorded so the next session does not
   re-derive them:
     - A DECLARED DRIVER PATH IN THE SUITE'S OWN HEADER is AUTHORED and costs
       nothing to produce — a suite asserting it is controlled is the party with
       an interest in looking controlled, and that is the provenance-hop shape
       this estate refuses structurally.
     - A MANIFEST is another hand-kept list, which is the exact defect M0-43
       measured one tool over, and a hand-carried figure nobody re-measures is
       this project's most-repeated finding. It would go stale in a day — this
       population moved by seven in one.

   IT READS CODE, NOT PROSE, and that is load-bearing rather than tidy. D-277
   blanked prose here because credit-from-a-sentence is the generous direction
   this instrument exists to refuse, and D-301 put the class census on the same
   lexer. MEASURED: reading the RAW driver source instead would credit five links
   across three drivers that exist only in a comment —
   `accepts-without-reading.control.mjs` MENTIONS `readingname.test.mjs`,
   `fieldread.control.mjs` mentions `daemon-token` and `meaningread`, and
   `d301-census.control.mjs` and `verdict-excluder.control.mjs` each name a suite
   they discuss but never touch. Those are drivers talking ABOUT a suite, not
   driving it.

   HOW A LIAR MAKES THIS GREEN, said before what it checks, because the place a
   mechanism is weakest is the thing a reader most needs told: a DEAD CODE
   REFERENCE. `const _ = "foo.test.mjs";` in a driver that never touches `foo`
   credits `foo` with a driver. That is a real hole and it is not closed here.
   What is claimed is only that it is STRICTLY HARDER TO FAKE THAN WHAT IT
   REPLACES — the old rule was satisfied by RENAMING A FILE, which is zero work
   and is precisely the cosmetic fix this row exists to refuse — and harder than
   prose, which one comment satisfies.

   AND IT IS A POINTER, NEVER A GRADE. `hasDriver` annotates "the evidence may
   live here, go and run it"; it never promotes a suite into the RUN count, which
   stays on the RECORDED declaration alone. That is the same category the
   `runElsewhere` floor sits in and for the same reason: over-crediting a POINTER
   costs a reader one wasted command, over-crediting a GRADE costs the record.

   THE LIMIT, STATED WHICHEVER WAY IT GOES: this establishes that a driver EXISTS
   and names the suite. IT CANNOT ESTABLISH THAT THE DRIVER RAN. A code reference
   is not an execution. The instrument for that half is M0-42's `run:` key, which
   is not re-solved here and which nothing in this census's output may be read to
   imply. */
const SUITE_REF = /[A-Za-z0-9._-]+\.test\.mjs/g;
const suiteNames = new Set(suites);
const driverRows = readdirSync(join(ROOT, "test"))
  .filter((f) => f.endsWith(".control.mjs")).sort()
  .map((file) => {
    const src = readFileSync(join(ROOT, "test", file), "utf8");
    const sibling = file.replace(/\.control\.mjs$/, ".test.mjs");
    /* The SAME-NAME SIBLING IS KEPT as one way in, not replaced by the new one.
       Every suite this reader credits today is therefore still credited after —
       the new rule is a STRUCTURAL SUPERSET, not a re-decision. This register
       changes what is SEEN and must change nothing that is TRUE. */
    const byName = suiteNames.has(sibling) ? [sibling] : [];
    const byCode = [...new Set(codeOnly(src).match(SUITE_REF) || [])]
      .filter((s) => suiteNames.has(s)).sort();
    const drives = [...new Set([...byName, ...byCode])].sort();
    return { file, byName: byName[0] || null, byCode, drives,
             /* A driver naming NO suite in code is NOT dropped and NOT counted as
                healthy. It is carried with its reason so the census reports a
                JUDGEMENT rather than a figure — the acceptance this row was
                written to, and the difference between "not found" and "not where
                I looked". */
             unreadable: drives.length === 0 };
  });
const driversFor = new Map();
for (const d of driverRows)
  for (const s of d.drives) driversFor.set(s, [...(driversFor.get(s) || []), d.file]);

/* NOT WALKED (M0-51). A file whose NAME CLAIMS to be a control but which this
   reader does not walk. The predicate is deliberately narrow — `*.control.*`
   that is not `*.control.mjs` — rather than "every other file in test/", of
   which there are 108 and which would bury the finding in probes and fixtures.

   IT EXISTS FOR TWO REASONS, and the second is the one that earns it.

   First, it found three: `battery-provenance.control.sh`,
   `coverage-provenance.control.sh` and `d334-monitor-credential.control.sh` are
   CONTROL DRIVERS WRITTEN IN SHELL, and a reader that walks only `.control.mjs`
   cannot see them at all. That is this row's own defect one notch further out —
   the instrument measuring a naming convention and calling it an estate fact.
   They are NAMED here rather than resolved: this reader does not parse shell,
   and pretending to would be the overclaim the register exists to refuse.

   Second, IT IS WHAT MAKES THE TWO NEGATIVE-CONTROL HALVES DISTINGUISHABLE. A
   driver DELETED outright and a driver RENAMED OUT OF THE WALK both leave their
   suite with no driver, and from the suite's seat those are the same absence.
   They are not the same fact. With this category, a rename leaves a NAMED
   residue here — *not where I looked* — while a delete leaves nothing at all —
   *not found*. Separating those two is the whole reason this row exists, and
   without this list the register could not have done it. */
const notWalked = readdirSync(join(ROOT, "test"))
  .filter((f) => f.includes(".control.") && !f.endsWith(".control.mjs")).sort();

/* A call-shaped occurrence, not a mention. `index.mjs` resolves the op as
   `searchParams.get("op") || path.slice(1)`, so `/api/?op=cite` and a bare
   `/cite` are the SAME dispatch and both count; the word "monitor" appearing in
   a field name does not. Getting this wrong in the generous direction would
   report coverage this battery does not have, so the two exact buckets below are
   the ones to trust. */
const called = (op, src) =>
  new RegExp(`\\bop=${op}(?=[&"'\`\\s]|$)`, "m").test(src)
  || new RegExp(`/${op}(?=[?&"'\`])`).test(src)
  || new RegExp(`\\(\\s*["'\`]${op}["'\`]\\s*[,)]`).test(src);  // doGet("tasks"), doPost("taskdrain", …)

/* A suite reaches the CONTROL PLANE if it drives the worker entry at all, and
   the Durable Object only if it never does. The DO-only and unreached buckets are
   therefore exact; the control-plane bucket is an UPPER BOUND, because a suite
   that uses both routes is credited to the worker for every op it names. Stated
   here rather than smoothed over: an over-credited coverage figure is the kind of
   equality that costs nothing to produce. */
/* D-277: over `s.code`, not `s.src`. A suite that MENTIONS an op in a sentence
   has not called it, and credit for a call is the generous direction — the one
   direction this instrument exists to refuse. MEASURED on this battery the day
   the rule changed: 0 of 163 ops were credited by a comment alone and NOT ONE
   op's level moved, so this closes a hazard rather than correcting a figure, and
   it is recorded that way rather than as a fix that found something. */
const opRows = [...OPS.entries()].map(([op, meta]) => {
  const hits = battery.filter((s) => called(op, s.code));
  const level = hits.length === 0 ? "unreached"
    : hits.some((s) => /dispatchFetch/.test(s.code)) ? "control-plane"
    : "durable-object-only";
  return { op, ...meta, level, suites: hits.map((s) => s.file) };
});

const allText = battery.map((s) => s.code).join("\n");
const checkRows = CHECKS.map((c) => ({ check: c, named: namesCheckId(c, allText) }));

/* M0-9: the whole file, the whole block, every arm — see control-register.mjs.
   M0-14 / D-233: `arms` is now `null` for a declaration the detector could not
   classify, and NEVER 0. A missing tally reported as zero is indistinguishable
   from a real zero, which is exactly how four suites declaring 48 arms between
   them read as declaring none for four consecutive re-measurements of this row.
   Zero is a measurement; null is the absence of one, and they are named apart. */
/* D-277 note, so the next reader does not "fix" this one too: `readControl`
   takes the RAW source and MUST. A negative-control declaration LIVES IN A
   COMMENT by design — that is the whole shape of the register — so here reading
   prose is the deliberate closure and not the defect. The rule is not "never
   read comments"; it is "read comments where the DECLARATION is a comment, and
   code where the declaration is code". */
const controlRows = battery.map(({ file, src }) => {
  const c = readControl(src);
  return { suite: file, control: c ? c.text : null, arms: c ? c.arms : null,
           declaredAtLine: c ? c.line : null, declarationLines: c ? c.lines : 0,
           /* M0-42. A suite with NO declaration has no run evidence to grade and
              is not scored DECLARED-ONLY for it — it is already counted, by name,
              in the `uncontrolled` list above, and counting it twice would make
              the RUN-vs-DECLARED split a restatement of a figure this report
              already prints. */
           run: c ? c.run : null,
           /* M0-42, AND IT IS HERE BECAUSE THE FIRST DRAFT OF THIS REPORT OVERCLAIMED.
              `readControl` records ONE declaration per suite — the fullest — and the
              marker grammar does not see `NEGATIVE CONTROL (` at all, because `(` is
              not one of MARKER_SEPARATORS. So a suite can state its control several
              times, record its runs in the copies, and still be graded on the one that
              says nothing. Measured 2026-09-16: of the 34 suites whose RECORDED
              declaration is not RUN, **18 carry a run token elsewhere in the same
              file** — `affordances.test.mjs` grades DECLARED-ONLY while holding five
              further declarations reading `all RUN 2026-08-04 … restored
              BYTE-IDENTICAL`. Naming those 18 as resting on the worker's word would be
              this register making a claim it cannot support, which is the exact defect
              the item exists to avoid, one level in.
              **THIS SECOND LOOK IS DELIBERATELY LOOSE AND IS NOT A GRADE.** It reads
              the WHOLE FILE, so a run token in an unrelated comment — or in a string
              literal — satisfies it. That is the right direction for its only job: it
              is a FLOOR ON INNOCENCE, used solely to stop the strict list overclaiming,
              and never to promote a suite into the RUN count. The floor and every
              printed RUN figure stay on the RECORDED declaration alone. */
           runElsewhere: c && c.run.state !== "RUN"
             ? readRunEvidence(src.replace(/\s+/g, " ")).state === "RUN" : false,
           /* M0-51. Was `existsSync(test/<suite>.control.mjs)` — a NAMING TEST
              reported as a fact about the estate. Now a lookup in the DRIVER
              CENSUS above, which walks the drivers and reads which suites each
              one names in CODE. Same-name siblings still resolve, so nothing
              this reader credited before has stopped being credited. */
           hasDriver: driversFor.has(file),
           drivers: driversFor.get(file) || [] };
});

/* THE REGISTER'S FLOOR (M0-14). A ceiling is not a ratchet: the arms tally could
   only ever have risen, so a whole declaration style going dark — or a matcher
   narrowed by a later edit — moved it DOWNWARD in silence and nothing failed.
   These three are what this instrument PRINTED on a green run of this tree on
   2026-08-08, never incremented by hand and never given slack, because a floor
   with slack is not a ratchet either (REC-71's census floor sat 19 codes low and
   had already flipped a control from RED to GREEN).

   `corpus` is the REACH: how many suites the register reads at all. A matcher
   narrowed to nothing reports a beautiful 100% over an empty corpus.

   MOVE THESE ONLY UPWARD, and only to a figure a green run PRINTED. */
const REGISTER_FLOOR = {
  /* ONE KEY SET. Thirteen items have moved these figures in parallel and keep-both merges
     have left duplicate `arms:` keys here SIX separate times — valid JavaScript where the
     LAST key silently wins, and once the last was the LOWEST, which would have installed
     slack in a ratchet whose whole purpose is to have none. **A duplicate object key
     cannot be seen by reading the value you expect to find**, and on 2026-08-08 one finally
     bit: `coverage-provenance` went red with 19 failures and `--strict` exited 1. That was
     the first time the hazard was caught by an INSTRUMENT rather than by a human re-reading
     this block, and it is the argument for the provenance check existing at all.

     IF YOU ARE RESOLVING A CONFLICT HERE: COLLAPSE TO ONE SET and re-read the printed
     figures. Do not keep both. Worker figures, each true of its own branch and none true
     here: M0-11 476 · M0-12 478 · REC-63 480 · REC-66 482 · REC-65 483 · M0-15 486 ·
     REC-68 482 · REC-77 530 · M0-16 542 · FW-13 550 · FW-14 552 · M0-17 553 · FW-15 557 · D-243 576 ·
     D-237 581 · REC-78 581. (D-237 moved the figure to 581 without adding itself to this
     list; recorded here at the 2026-08-08 rebuild so the provenance is not missing a mover.)

     THE COMPARISON IS AGAINST THE **REPRODUCIBLE** FIGURE, not the counted one (M0-16): a
     phantom suite inflates the corpus, and a floor moved while one is present would be
     permanently too high, which is how a ratchet gets switched off. Move these only
     UPWARD, and only to a figure a green run PRINTED. A floor that FALLS needs its reason
     at the site — one that falls because an instrument stopped double-counting is not
     slack; one that falls for any other reason is. */
  /* MOVED 2026-08-08 by REC-78 (570→581, 129→130, 130→131), from the figures a
     green `--strict` run PRINTED as REPRODUCIBLE at commit 7f7cbb8 — never
     counted, never incremented by hand. The cause is one new suite,
     `test/shadowed-refusals.test.mjs`, whose `NEGATIVE CONTROL:` declaration
     states eleven arms. Every one of those arms was RUN. */
  /* CPDF-10, 2026-08-08: 570 -> 576 / 129 -> 130 / 130 -> 131, ALL THREE MOVED IN
     THE SAME TURN and every one taken from the figure THIS ITEM'S OWN GREEN RUN
     PRINTED (`arms 576/570 · classified 130/129 · corpus 131/130 · GREW by 6`),
     never by adding to the numbers above. One new suite (`textchain.test.mjs`)
     whose declaration states six arms — the six negative-control arms driven by
     `test/nc-cpdf10.mjs` — so `corpus` and `classified` each rise by one and
     `arms` by six. Nothing FELL. */
  /* MOVED AT INTEGRATION 2026-08-08 by CONDUCT: 581 -> 621 / 130 -> 133 / 131 -> 134,
     from the figures a green `--strict` run PRINTED on THE MERGED TREE
     (`arms 621/581 · classified 133/130 · corpus 134/131 · GREW by 40`) — never by
     adding movers' numbers together. That arithmetic would have been WRONG in both
     directions: D-237 and REC-78 each independently measured 581 on a tree lacking
     the other's new suite, so 581 was true of neither tree, and the merged figure is
     higher than either. This is what "re-read it from a green run after every
     multi-item merge" is for. */
  /* MOVED 2026-08-09 by VF-1: 621 -> 632 / 133 -> 134 / 134 -> 135, ALL THREE IN
     THE SAME TURN and every one taken from the figure this item's own green
     `--strict` run PRINTED as REPRODUCIBLE, never counted and never added to the
     numbers above (631 was read first, then 632 once the class-sweep arm was
     written into the declaration — which is the register's own known property:
     recording a control in prose moves the tally, so these are figures a run
     printed and never deltas anybody computed). The cause is one new suite,
     `test/owed-controls.test.mjs`, whose declaration states eleven arms — nine
     run by `test/owed-controls.control.mjs` plus the two over-strictness arms
     that live IN the suite. Nothing FELL. */
  /* MOVED 2026-08-09 by PL-17 (DEC-65's third `asserted_by` state): 621 -> 629 /
     133 -> 134 / 134 -> 135, ALL THREE IN THE SAME TURN and every one taken from
     the figure THIS ITEM'S OWN GREEN `--strict` RUN PRINTED AS REPRODUCIBLE
     (`arms 629/621 · classified 134/133 · corpus 135/134 · GREW by 8 arm(s)`) —
     read AFTER the new files were in a commit, so the figures are the
     reproducible ones and not the contaminated ones the pre-commit run reported
     under the same numerals. One new suite, `test/sufficiency-state.test.mjs`,
     whose `NEGATIVE CONTROL:` declaration states EIGHT arms — a BASELINE, six
     break-it arms and an OVER-STRICTNESS arm — so `corpus` and `classified` each
     rise by one and `arms` by eight. Every one of those arms was RUN, through
     `test/sufficiency-state.control.mjs`. Nothing FELL. */
  /* COLLAPSED TO ONE KEY SET AT INTEGRATION 2026-08-09 by CONDUCT — the EIGHTH time
     this block has carried duplicate keys out of a parallel merge. The mechanism this
     time was CONDUCT's own: keeping BOTH movers' provenance comments (VF-1's and
     PL-17's, each true of its own branch) dragged in the key line that follows each.
     Keep every comment; keep ONE key set. Figures re-read from the merged green run. */
  /* D-255, 2026-08-09: 621 -> 627, from the figure THIS ITEM'S OWN GREEN
     `--strict` run PRINTED (`arms 627/621 · classified 133/133 · corpus 134/134
     · GREW by 6`), never by adding to the number above. `classified` and
     `corpus` do NOT move: no suite was added, and the seven D-255 arms are
     declared inside `query.test.mjs`'s EXISTING block.
     SEVEN ARMS WERE DECLARED AND THE FIGURE ROSE BY SIX, WHICH IS ARITHMETIC
     AND NOT A LOST ARM — checked rather than assumed, because "an arm that
     scored zero" is exactly D-233's shape. `countArms` is
     `max(transitions, enumerations)`; this suite's declaration had FIVE
     transitions and SIX enumerated items, so its recorded figure was already
     the ENUMERATION count. Adding seven transitions took transitions 5 -> 12,
     which now wins the max, and 12 - 6 = 6. Every one of the seven arms RAN and
     is stated with the counts it produced. */
  /* MOVED AT INTEGRATION 2026-08-09 by CONDUCT: 632 -> 646 / 134 -> 135 / 135 -> 136,
     from the figures a green `--strict` run PRINTED on the merged tree carrying VF-1,
     UI-42, PL-17, FL-4, D-257, FL-5 and D-255 (`GREW by 14 arm(s)`). Six of those seven
     moved this figure on their own branch and NOT ONE of their numbers is true here. */
  /* MOVED 2026-08-09 by REC-69's REPLAY onto `main`: 621 -> 629 / 133 -> 134 /
     134 -> 135, ALL THREE IN THE SAME TURN and every one taken from the figures a
     green `--strict` run PRINTED on this tree (`arms 629/621 · classified 134/133
     · corpus 135/134 · GREW by 8`), never by adding to the numbers above. The
     corpus and classified rises are ONE new suite, `test/airuns.test.mjs`.
     AND A PROPERTY OF THIS REGISTER, MEASURED HERE RATHER THAN ASSUMED, because
     the +8 is smaller than the arms this item actually declared and a reader who
     did the arithmetic would think a declaration had shrunk. This item added a
     SECOND `NEGATIVE CONTROL:` paragraph to two suites that already had one —
     three new arms in `run-conditions.test.mjs`, four in `airuns.test.mjs`, all
     seven RUN through `test/nc-rec69-selects.mjs`. The detector records the block
     STATING THE MOST ARMS and never the sum, which is right for the case it was
     built for (M0-2's backfill left most suites stating ONE control twice) and
     undercounts this one: `airuns.test.mjs` still reports its original block's 7
     and the new block contributes 0, while `run-conditions.test.mjs` moved 5 -> 6
     because the NEW block became the larger of the two. So `arms` is a floor on
     ARMS STATED IN THE LARGEST SINGLE DECLARATION PER SUITE, not on arms stated —
     which is safe, because the number is reported and never gated, and the floor
     can still only fall if a declaration really shrinks. NAMED here rather than
     silently absorbed, and DELEGATED to M0-14's area in CLAIMS.md: two DIFFERENT
     controls in one suite is a shape the "never the sum" rule did not anticipate. */
  /* MOVED AT INTEGRATION 2026-08-09 by CONDUCT: 646 -> 654 / 135 -> 136 / 136 -> 137,
     from the merged tree's printed `GREW by 8 arm(s)` once REC-69 landed. */
  /* D-262 measured 661/137/138 on its own branch and that figure is SUPERSEDED here —
     recorded so the mover is not missing from the provenance. A floor moves only
     upward, and the merged tree's figure is re-read from a green run below. */
  /* MOVED 2026-08-09 by PL-19 (DEC-65 shape (b)): 632 -> 647 / 134 -> 136 / 135 -> 137,
     ALL THREE IN THE SAME TURN and every one taken from the figure THIS ITEM'S OWN GREEN
     `--strict` RUN PRINTED AS REPRODUCIBLE (`arms 647/632 · classified 136/134 · corpus
     137/135 · GREW by 15 arm(s)`), read only AFTER the new files were in a commit — the
     pre-commit run reported these same numerals as CONTAMINATED, and a floor moved on
     those is permanently too high. Never counted, never added to the numbers above.

     **AND ONLY 7 OF THE 15 ARE THIS ITEM'S — THE FLOOR WAS ALREADY STALE ON ARRIVAL BY
     8 ARMS / 1 CLASSIFIED / 1 CORPUS, WHICH IS RECORDED BECAUSE IT WAS MEASURED RATHER
     THAN INFERRED.** `main` at `8096452` was checked out into a scratch `git worktree`
     (never `git stash` — `refs/stash` is repository-wide across every checkout of this
     clone) and `--strict` run there on a quiet tree with NOTHING uncommitted: it printed
     `arms 640/632 · classified 135/134 · corpus 136/135 · GREW by 8`, with provenance
     `146 of 146 discovered item(s) are in the commit at HEAD` and no contamination note
     at all. So the merged tree read 8 arms above its own floor before PL-19 touched
     anything — the collapse-to-one-key at the VF-1/PL-17 integration kept a figure true
     of one branch and not of the merge, which is this block's oldest hazard arriving in
     its subtler form: not a duplicate key, just a survivor that was never re-read.
     THIS ITEM'S OWN 7 are one new suite, `test/dec65-single-part.test.mjs`, whose
     `NEGATIVE CONTROL:` declaration states SEVEN arms — a BASELINE, five break-it arms
     and an OVER-STRICTNESS arm — so `corpus` and `classified` each rise by one and `arms`
     by seven. Every one of those arms was RUN, through
     `test/dec65-single-part.control.mjs`. Nothing FELL. */
  /* PL-18, 2026-08-09 (worktree agent-a4e2eff5ca09197e2): 621 -> 631 / 133 -> 134 /
     134 -> 135, ALL THREE MOVED IN THE SAME TURN and every one taken from the figure
     THIS ITEM'S OWN GREEN RUN PRINTED (`arms 631/621 · classified 134/133 ·
     corpus 135/134 · GREW by 10 arm(s)`), never by adding to the numbers above.
     One new suite, `test/airun-projectgate.test.mjs`, whose `NEGATIVE CONTROL:`
     declaration states ten rows — the baseline plus the nine arms `test/nc-pl18.mjs`
     drives — so `corpus` and `classified` each rise by one and `arms` by ten.
     Nothing FELL. **THE FIGURES WERE READ AFTER THE SUITE WAS IN A COMMIT**, because
     the register compares against the REPRODUCIBLE figure and an untracked suite is
     not one: read before the commit, the same run printed the floors met EXACTLY with
     nothing to collect, which is what an uncommitted suite looks like. */
  /* MOVED AT INTEGRATION 2026-08-09 by CONDUCT to the merged tree's printed figures
     after PL-18, PL-19, M0-18 and UI-44 (`GREW by 17 arm(s)`). */
  /* VF-5, 2026-08-09: 654 -> 662 / 136 -> 137 / 137 -> 138, ALL THREE MOVED IN THE
     SAME TURN and every one taken from the figure THIS ITEM'S OWN GREEN `--strict`
     RUN PRINTED as REPRODUCIBLE (`arms 662/654 · classified 137/136 · corpus
     138/137 · GREW by 8`), never by adding to the numbers above. One new suite,
     `test/fence-e2e.test.mjs`, whose `NEGATIVE CONTROL:` declaration the detector
     counts at eight arms — the seven arms (0)-(6) plus the summary line that
     opens the block, which is the "largest single declaration" rule described
     above reading one line more than the item states. EVERY ONE OF THE SEVEN WAS
     RUN. Nothing FELL. */
  /* M0-21 / D-268, 2026-08-09: 654 -> 665 / 136 -> 137 / 137 -> 138, ALL THREE MOVED
     IN THE SAME TURN and every one taken from the figure a green `--strict` run
     PRINTED as REPRODUCIBLE (`arms 665/654 · classified 137/136 · corpus 138/137 ·
     GREW by 11 arm(s)`, provenance `149 of 149 discovered item(s) are in the commit
     at HEAD`) — read only AFTER the new files were in a commit, never by adding to
     the numbers above. The cause is ONE new suite, `test/walkfloor.test.mjs`, whose
     declaration enumerates EIGHT arms; every one of those arms was RUN, and the
     remaining three are the arms M0-21 added to `hygiene.test.mjs`'s own
     declaration for the cross-file block.
     WORTH KNOWING BEFORE YOU MOVE THIS AGAIN, because it cost two runs here: that
     suite's declaration was FIRST a column table, which this register read as TWO
     arms (D-233's under-count class, and it would have installed slack); rewritten
     as an enumerated list it read EIGHT, but with a paragraph between the marker
     and the list it read NULL and the suite left `classified` entirely, taking
     `--strict` to exit 1. Marker paragraph, then the list, then prose. */
  /* MOVED AT INTEGRATION 2026-08-09 by CONDUCT: 674 -> 714 / 138 -> 143 / 139 -> 144,
     from the merged tree's printed `GREW by 40 arm(s)` after D-265, D-269, PL-20 and
     PL-2's verification landed. */
  /* MOVED AT INTEGRATION 2026-08-09 by CONDUCT: 714 -> 731 / 143 -> 145 / 144 -> 146,
     from the merged tree's printed `GREW by 17 arm(s)` after D-262 and PL-13. */
  /* MOVED AT INTEGRATION 2026-08-09 by CONDUCT: 748 -> 771 / 147 -> 148 / 148 -> 149,
     from the merged tree's printed `GREW by 23 arm(s)` after D-271, D-252, D-249 and D-266. */
  /* MOVED 2026-08-09 by D-277: 731 -> 738 / 145 -> 146 / 146 -> 147, ALL THREE IN
     THE SAME TURN and every one taken from the figure THIS ITEM'S OWN GREEN
     `--strict` RUN PRINTED as REPRODUCIBLE (`arms 738/731 · classified 146/145 ·
     corpus 147/146 · GREW by 7 arm(s)`, provenance `158 of 158 discovered item(s)
     are in the commit at HEAD`) — read only AFTER the new files were in a commit,
     never by adding to the numbers above. The cause is ONE new suite,
     `test/declared-corpus.test.mjs`, whose `NEGATIVE CONTROL:` declaration
     enumerates SEVEN arms — a BASELINE, four break-it arms and TWO
     over-strictness arms — every one of them RUN through
     `test/declared-corpus.control.mjs`, and every one of them re-run a second
     time against the OLD rules to show it BITES. Nothing FELL, and
     `check-firing.test.mjs`'s own declaration did not move: it gained a
     paragraph recording three added proofs, and the register counts the arms of
     the largest single declaration, which that paragraph does not become. That
     was CHECKED rather than assumed, because +7 matching one suite exactly is
     the kind of arithmetic that hides a lost arm somewhere else. */
  /* MOVED 2026-08-09 by D-271 (the affirmation, and the derivation on the read):
     671 -> 678 / 138 -> 139 / 139 -> 140, ALL THREE IN THE SAME TURN and every one
     taken from the figures THIS ITEM'S OWN GREEN `--strict` RUN PRINTED
     (`arms 678/671 · classified 139/138 · corpus 140/139 · GREW by 7 arm(s)`),
     never by adding to the numbers above. ONE new suite,
     `test/independence.test.mjs`, whose `NEGATIVE CONTROL:` declaration states
     SEVEN arms — a BASELINE, five break-it arms and an OVER-STRICTNESS arm — so
     `corpus` and `classified` each rise by one and `arms` by seven. **Every one of
     those seven was RUN**, through `test/independence.control.mjs`, and two of the
     seven had their DECLARATION corrected afterwards because the arm disagreed with
     it. Nothing FELL.
     **FIGURES READ AFTER THE SUITE WAS IN A COMMIT**, and this item paid the note
     four comments up rather than merely reading it: the pre-commit run printed the
     floors met EXACTLY (`671/671 · 138/138 · 139/139`) with nothing to collect,
     which is indistinguishable from a clean tree and is what an untracked suite
     looks like to this register. Had the floor been moved from that run, it would
     have been moved to the number already in the file. */
  /* D-252, 2026-08-09: 731 -> 736, from the figure THIS ITEM'S OWN GREEN
     `--strict` run PRINTED (`arms 736/731 · classified 145/145 · corpus 146/146
     · GREW by 5 arm(s)`), never by adding five to the number above. NO NEW
     SUITE, so `classified` and `corpus` do not move and are left exactly as they
     were: the five arms are (g)-(k), added to `textchain.test.mjs`'s existing
     declaration and driven by `test/nc-cpdf10.mjs`, which now runs eleven. Every
     one of the five was RUN, alone, with the others held open. Nothing FELL. */
  /* MOVED 2026-08-09 by D-249: 731 -> 735, from the figure a green `--strict` run
     PRINTED (`arms 735/731 · classified 145/145 · corpus 146/146 · GREW by 4
     arm(s)`) — never by adding 4 to the number above. `classified` and `corpus`
     do NOT move and that is the expected shape rather than an oversight: this
     item adds no `.test.mjs`. Its five control arms live in
     `test/d249-port.control.mjs`, which is deliberately NOT a suite because it
     EDITS REAL SOURCES, so the register sees them only through the arms stated
     in `hygiene.test.mjs`'s existing declaration. THE REGISTER COUNTS FOUR WHERE
     THE ITEM DECLARES FIVE, and that difference is recorded rather than
     smoothed: the figure the floor moves to is the one the instrument PRINTED,
     and the arm count in a declaration is a function of its own prose (M0-9's
     property) — so never compare this total across two edits of that text. */
  /* MOVED 2026-08-09 by D-266 (worktree-agent-a6db8a28ca10a37e0): 731 -> 738, from the
     figure this item's own green `--strict` run PRINTED (`arms 738/731 · classified
     145/145 · corpus 146/146 · GREW by 7 arm(s)`), never by adding to the number above.
     `classified` and `corpus` DO NOT MOVE and that is correct rather than an oversight:
     this item adds NO suite. Its driver is `test/d266.control.mjs`, deliberately not a
     `.test.mjs` because it edits real sources while it runs, so the battery must not
     discover it and this register must not count it as a corpus member.
     THE DISCREPANCY IS RECORDED BECAUSE IT IS THE INSTRUMENT'S OWN DOCUMENTED CLASS AND
     IT RUNS IN THE SAFE DIRECTION. D-266 declared SIX ordinal arms in
     `proposedispose.test.mjs` and THREE more in `current.test.mjs` — nine — and the
     register counted SEVEN, because the three in `current.test.mjs` are LABELLED
     (`(D-266.4)`) rather than ordinal and this counter deliberately does not widen to
     bracketed tokens (it would then count every `(D-113)` the prose is full of). One of
     the three happened to match anyway. All nine arms were RUN and all nine came back as
     declared; the floor moves to what the instrument PRINTED, which is the rule, and the
     under-count is D-233's class reporting fewer arms than were driven. */
  /* MOVED 2026-08-09 by D-267: 731 -> 737 / 145 -> 146 / 146 -> 147, ALL THREE IN
     THE SAME TURN and every one read off the figure this item's own green
     `--strict` run PRINTED as REPRODUCIBLE (`arms 737/731 · classified 146/145 ·
     corpus 147/146 · GREW by 6 arm(s)`) — never counted and never added to the
     numbers above. The cause is one new suite, `test/severedhomes.test.mjs`,
     whose `NEGATIVE CONTROL:` declaration states six arms (A, B, C, C2, D, E),
     every one of them RUN by `test/severedhomes.control.mjs` with the baseline
     row beside them. THE FIGURE WAS READ TWICE AND ONLY THE SECOND WAS USED: the
     first run reported the CONTAMINATED 737 against a reproducible 731, because
     the suite was still uncommitted — which is exactly the phantom D-238 names,
     and moving to it then would have made this floor permanently too high. It was
     re-read after the commit. Nothing FELL. */
  /* MERGE RESOLUTION 2026-08-10 by CONDUCT, HAND-EDITED (this object is never
     resolved mechanically — it broke four times in one day that way, twice
     silently, once losing `FLEET_FLOOR.arms` so the comparison read `48 <
     undefined`). BOTH sides' comments are kept and there is exactly ONE key set.
     D-267 branched from 731/145/146 and moved its own floor to 737/146/147;
     `main` had meanwhile ratcheted to 771/148/149 through D-271, D-252, D-249
     and D-266. Taking the branch's 737 would LOWER a ratchet, which is the
     silent-slack failure this file exists to prevent, so the higher figures
     stand here and the merged tree's own printed run moves them below. */
  /* MOVED AT INTEGRATION 2026-08-10 by CONDUCT: 771 -> 782 / 148 -> 150 / 149 -> 151,
     read off what the MERGED tree's own green `--strict` run PRINTED — `REGISTER
     FLOOR arms 782/771 · classified 150/148 · corpus 151/149 · GREW by 11 arm(s)`,
     provenance `162 of 162 discovered item(s) are in the commit at HEAD (0110ffe)`
     — never by adding the branch's claimed +6 to the number above. **The branch
     measured +6 and the merged tree prints +11, and that difference is the reason
     this figure is read rather than computed:** D-267's own baseline was 731 and
     `main`'s was 771, so the arithmetic of two independently-correct deltas is not
     the merged total. Figures read AFTER the suites were in a commit. Nothing FELL. */
  /* MOVED 2026-08-09 by D-263: 731 -> 741 / 145 -> 146 / 146 -> 147, ALL THREE IN
     THE SAME TURN and every one taken from the figure THIS ITEM'S OWN GREEN
     `--strict` run PRINTED AS REPRODUCIBLE (`arms 741/731 · classified 146/145 ·
     corpus 147/146 · GREW by 10 arm(s)`) — read AFTER the new files were in a
     commit, so these are the reproducible figures and not the contaminated ones a
     pre-commit run reports under the same numerals. One new suite,
     `test/register-grammar.test.mjs`, whose declaration states TEN arms: seven
     control arms plus the three surprises written back into it. Nothing FELL.
     AND IT IS THE ITEM'S OWN SUBJECT: this figure was read TWICE, because writing
     the control's RESULTS into its declaration raised the tally again — which is
     exactly the double move REC-68 recorded, that merge `0ca7640` dropped, and
     that D-263 recovered into VERIFICATION.md's register section. The number here
     is the one printed after the LAST edit. */
  /* MERGE RESOLUTION 2026-08-10 by CONDUCT, HAND-EDITED. Both sides' comments kept,
     exactly ONE key set. D-263 branched from 731/145/146 and moved to 741/146/147;
     `main` stood at 782/150/151 after D-267. The branch's figure is LOWER and taking
     it would lower a ratchet, so main's stands here and the merged tree's own printed
     run moves it in the next commit. */
  /* MOVED AT INTEGRATION 2026-08-10 by CONDUCT: 782 -> 792 / 150 -> 151 / 151 -> 152,
     read off what the MERGED tree's own green `--strict` run PRINTED — `REGISTER FLOOR
     arms 792/782 · classified 151/150 · corpus 152/151 · GREW by 10 arm(s)`, provenance
     `163 of 163 discovered item(s) are in the commit at HEAD (35bc9dc)`. One new suite,
     `test/register-grammar.test.mjs`, declaring ten arms. Here the branch's own +10 and
     the merged +10 happen to agree, which they did NOT at the D-267 merge an hour
     earlier — and that is the reason this figure is still read rather than trusted:
     agreement is a coincidence of two baselines, not a property of the arithmetic. */
  /* MOVED 2026-08-10 by SK-2: 792 -> 801 / 151 -> 152 / 152 -> 153, ALL THREE IN THE
     SAME TURN and every one taken from the figure this item's own green `--strict` run
     PRINTED **after its files were in a commit** — `REGISTER FLOOR arms 801/792 ·
     classified 152/151 · corpus 153/152 · GREW by 9 arm(s)`, provenance `164 of 164
     discovered item(s) are in the commit at HEAD (e1f497f)`. Never counted and never
     added to the numbers above. One new suite, `test/skilldoctrine.test.mjs`, whose
     `NEGATIVE CONTROL:` declaration states NINE arms; all nine were RUN from
     `test/skilldoctrine.control.mjs` and the measured results are in the declaration.
     THE ORDER MATTERS AND IS WHY THIS MOVED IN A SECOND COMMIT: read before the commit,
     the same run PRINTED `arms 792/792 · corpus 152/152` and named the suite as NOT IN
     ANY COMMIT — the reproducible figure excludes an untracked file by design (D-238),
     so moving the floor from a pre-commit run would have installed the OLD number as
     the new one and read as a no-op. Nothing FELL. `FLEET_FLOOR` unmoved at 5 suites /
     48 arms, and none owed: this item added no fleet member and no fleet suite. */
  /* MOVED 2026-08-10 by CONDUCT to the figure the FOUR-WAY MERGED GREEN RUN printed
     and again for the SK-3 + D-280 pair. Each move is taken from the run in which ALL
     the items being merged exist together — never from a branch's own figure, because a
     branch measured a tree that never shipped. ONE KEY SET, checked for duplicates before writing: the six
     historical keep-both merges that left a duplicate `arms:` here are why this
     comment exists, and why the previous value (801, SK-2's own) is REPLACED rather
     than joined. Battery 163/163 · 10,086 assertions; `--strict` exit 0 read unpiped. */
  /* MOVED 2026-08-10 by SK-3: 813 -> 821 / 155 -> 156 / 156 -> 157, ALL THREE IN THE SAME
     TURN and every one taken from the figure THIS ITEM'S OWN GREEN `--strict` RUN PRINTED AS
     REPRODUCIBLE (`arms 821/813 · classified 156/155 · corpus 157/156 · GREW by 8 arm(s)`),
     read AFTER the new files were in a commit — `496fe8c`, with the run's own provenance line
     reporting 168 of 168 discovered items in it — so these are the reproducible figures and
     not the contaminated ones a pre-commit run reports under the same numerals. The cause is
     ONE new suite, `test/skillprohibitions.test.mjs`, whose declaration states eight numbered
     items: a BASELINE plus the seven negative-control arms `test/skillprohibitions.control.mjs`
     runs. Every one of those seven was RUN, and all seven came back as declared. Nothing FELL.
     Battery 162/162 · 10,054 assertions; `--strict` exit 0 read unpiped. As above, the
     previous value (813) is REPLACED and never joined. */
  /* MOVED 2026-08-10 by SK-4: 826 -> 833 / 157 -> 158 / 158 -> 159, ALL THREE IN THE SAME
     TURN and every one taken from the figure THIS ITEM'S OWN GREEN `--strict` RUN PRINTED AS
     REPRODUCIBLE (`arms 833/826 · classified 158/157 · corpus 159/158 · GREW by 7 arm(s)`),
     read AFTER the new files were in a commit — `f4483e6`. The PRE-COMMIT run of the same
     tree printed the identical numerals as CONTAMINATED beside a reproducible 826/157/158 and
     named the untracked suite, which is D-238's mechanism working: moving the floor from that
     run would have installed the OLD number as the new one and read as a no-op. The cause is
     ONE new suite, `test/skillsequencing.test.mjs`, whose declaration states seven numbered
     items: a BASELINE plus the six negative-control arms `test/skillsequencing.control.mjs`
     runs. Every one of those six was RUN and all six came back as declared. Nothing FELL, and
     `FLEET_FLOOR` is unmoved at 2 members / 4 ops / 5 suites / 48 arms — this item added no
     fleet member and no fleet suite, and touched no file under `agent-worker/`. ONE KEY SET,
     checked for duplicates before writing; the previous value (826) is REPLACED, never joined.
     Battery 164/164 · 10,115 assertions; `--strict` exit 0 read unpiped. */
  /* MOVED 2026-08-10 by CASE-3 (worktree agent-a36b6782b06f5a651): 839 -> 845 /
     159 -> 160 / 160 -> 161, ALL THREE IN THE SAME TURN and every one read off
     the figure a green `--strict` run PRINTED on this branch
     (`arms 845/839 · classified 160/159 · corpus (suites read) 161/160 · GREW by
     6 arm(s)`), never by adding to the numbers that were here.
     THE RISE IS ONE NEW SUITE, `test/casepin.test.mjs`, whose declaration states
     SIX armed arms (a)-(f) plus an unnumbered baseline — so `classified` and
     `corpus` each move by one and `arms` by six. The baseline is deliberately
     NOT an ordinal item: `countArms` reads the enumerated list, and an opening
     `(baseline)` item is what CASE-1 measured going unreadable one item earlier.
     **MEASURED AFTER THE COMMIT, NOT BEFORE.** Read on the working tree the run
     reported the suite as UNTRACKED and held all three figures at the
     in-commit values (839/159/160), because `provenance.mjs` will not let this
     register count work no other checkout can see (D-238). The floor move is
     therefore taken from a run made AFTER `git commit`, which is the only run in
     which these numbers are reproducible by anyone else.
     CONDUCT RE-DERIVES THESE ON THE MERGED TREE and should: this branch cannot
     see CASE-2's arms, and every figure here is true of this branch alone. */
  /* RE-DERIVED AT INTEGRATION 2026-09-10 by CONDUCT — the SECOND three-way floor
     conflict in one turn, and the reason it keeps happening is structural rather
     than careless: every parallel item that adds a suite must move this block, and
     no branch can see another's arms. CONDUCT's tree carried 879/164/165 (FL-9 +
     CASE-4 + M0-22); origin carried 872/163/164 (FL-10). BOTH ARE HONEST FIGURES
     FOR TREES THAT NO LONGER EXIST.
     THE VALUE BELOW IS READ OFF THE MERGED RUN, and the resolution is ONE KEY SET
     — grep the KEYS, do not read the block. That instruction is written this way
     because ONE COMMIT AGO I resolved this same conflict by replacing the marked
     region while the SHARED `classified`/`corpus` lines below it survived, leaving
     duplicates whose LAST pair was LOWER than measured: slack installed in a
     ratchet whose whole purpose is to have none, by the edit warning about it.
     Seventh instance of the hazard, and the tell was the tool printing
     `classified 164/163` while the file plainly said 164. */
  /* MOVED 2026-09-10 FOUR TIMES IN ONE DAY and COLLAPSED TO ONE SET AT EACH
     MERGE: D-265 (+5, walkfigure), CPDF-13 (+4, calibration), D-302 (+3, no new
     suite) and CASE-5b (+6, casesign) each moved this blind to the others. The
     figures below are what the merged tree's own green `--strict` run PRINTED
     after the CASE-5b merge, read from output, never summed by hand.
     ONE KEY SET, grepped before writing. */
  /* MOVED 2026-09-10 (a FIFTH time that day) by D-301: 901 -> 906, from the figure
     this tree's own green `--strict` run PRINTED (`arms 906/901 · GREW by 5 arm(s)`,
     `fullest 56 (hygiene.test.mjs)`, up from 51) — read from the output, never
     incremented by hand, and a floor with slack is not a ratchet. The cause is one
     new declaration segment: `hygiene.test.mjs` states SIX arms for the class
     census's string-blinding, run by `test/d301-census.control.mjs`; the register
     counts five of them, which is its stated behaviour as a FLOOR on arms stated
     rather than an exact count. `classified` and `corpus` are UNMOVED — no suite
     gained or lost a declaration, and the new control driver is a `.control.mjs`
     the battery does not discover. ONE KEY SET, grepped before writing. */
  /* MOVED 2026-09-10 by D-309 (worktree agent-a26bce57cd13e5ea5), READ OFF THIS
     SCRIPT'S OWN `--strict` GREEN RUN (exit 0, unpiped) and never incremented by
     hand: `NEGATIVE CONTROLS 169 of 169 suites declare one (100.0%) · 909 arms
     stated across 168 classified declaration(s)`.
     arms 906 -> 909, classified 167 -> 168, corpus 168 -> 169. **ALL THREE ARE
     THIS ITEM'S OWN GROWTH AND NONE IS PRE-EXISTING SLACK** — one new battery
     suite, `test/multicase.test.mjs`, declaring THREE arms; its driver
     `test/multicase.control.mjs` is a `.control.mjs` the battery does not
     discover, exactly as the note above records for the previous mover.
     **THE DECLARATION HAD TO BE REWRITTEN TO BE COUNTED AT ALL, which is the
     useful half:** its first draft stated the arms as prose and `--strict`
     FAILED with "declares a negative control this register cannot count the arms
     of" — D-233's own failure mode, a declaration the instrument cannot read
     being scored ZERO and folded silently into the tally. Restated with a
     parenthesised ordinal per arm, counted, and the floor moved in the same turn.

     AND THE MOVE HAD TO WAIT FOR THE COMMIT, which is worth recording because it
     is not obvious and cost a red run: **the comparison is against the
     REPRODUCIBLE figure, not the counted one** (M0-16, and this block's own
     header says so). The register reads only suites that are IN A COMMIT, so
     while `multicase.test.mjs` was untracked the measured triple stayed
     906/167/168 while the NEGATIVE CONTROLS line printed 909/168/169 — and a
     floor moved to the printed line at that moment would have been PERMANENTLY
     TOO HIGH, failing every honest run afterwards. Moved after the suite landed
     in a commit, from a `--strict` run that then read 909/168/169 itself.
     ONE KEY SET, grepped before writing (2 matches for `^  arms:` in this file,
     the other being FLEET's — a different table). */
  /* MOVED 2026-09-12 by CONDUCT #9 at D-315's integration, from the merged run's
     OWN print (arms 920/909 · classified 170/168 · corpus 171/169 · GREW by 11):
     the slack accumulated across the FL-6 and DS-2/DS-3 landings (which added
     suites without moving this floor — the seventh-instance stale-floor pattern,
     noted for FLEET and DIST) plus D-315's own new arms. Read from output, never
     summed by hand. ONE KEY SET, grepped before writing. */
  /* MOVED AGAIN 2026-09-12 by CPDF-10 AT ITS OWN MERGE, and **COLLAPSED TO ONE
     KEY SET DELIBERATELY** — `WORKER.md` records keep-both merges leaving
     duplicate `arms:` keys here SIX times, valid JavaScript where the last
     silently wins and once the last was the LOWEST. Both sides of this conflict
     had moved the same key and the figures below are re-read from a green
     `--strict` run on the MERGED tree, never from either side's number:
     CPDF-10's branch printed 917/170/171 against the pre-merge floor of
     909/168/169 (five of those eight arms already slack at `cebf564` — DS-2
     landed `resolveversion.test.mjs` without moving this key), CONDUCT's
     integration of D-315 printed 920/170/171, and the merged tree prints the
     figure set below. This item's own contribution inside it is three arms
     (`bio-plane/test/ocr-member-e2e.test.mjs`, one suite). CONDUCT re-reads all
     three on the merged tree — it is NAMED in this item's report for that. */
  /* MOVED 2026-09-12 by D-318, from the figure a green `--strict` run PRINTED on
     this branch (`arms 928/923 · classified 172/171 · corpus 173/172 · GREW by
     5`), never summed by hand and never added to the number already here. THE
     WHOLE MOVE IS THIS ITEM'S OWN and is accounted for exactly: one new suite,
     `test/d315-guard-witness.test.mjs`, whose `NEGATIVE CONTROL:` declaration
     states FIVE arms as a single enumerated paragraph — (1) revert one guard's
     statement-digest pin to the pre-D-315 `.includes` form, (2) the same revert
     in the other guard, (3) over-strictness, (4) a neutered mutation so the
     ARM-NEVER-ARMED guard is itself proven, (5) REACH, the blanked floor. So
     corpus +1, classified +1, arms +5, and the pre-move floor carried ZERO slack
     (923/923 · 171/171 · 172/172 on this branch's own baseline at `3366611`,
     measured before a byte was written) — which is worth recording, because the
     eleven-arm slack D-315's integration had to absorb is the pattern this file
     keeps catching and there is none of it here. ONE KEY SET, grepped before and
     after writing: `^  arms:` matches TWICE in this file, once here and once in
     `FLEET_FLOOR`, which is the documented expected state. */
  /* MOVED 2026-09-12 by D-322, from the figure a green `--strict` run PRINTED on
     this branch AFTER the suite was committed (`arms 936/928 · classified
     173/172 · corpus 174/173 · GREW by 8`), never summed by hand and never added
     to the number already here. The pre-commit run printed the CONTAMINATED
     figures beside the reproducible ones and refused to let them be quoted
     (D-238) — the floor is moved from the committed reading, at `3481696`, where
     `provenance` reads 189 of 189 items in the commit at HEAD. THE WHOLE MOVE IS
     THIS ITEM'S OWN and is accounted for exactly: one new suite,
     `test/d322-floor-gate-witness.test.mjs`, whose `NEGATIVE CONTROL:`
     declaration states EIGHT arms as enumerated segments — (1) the gate neutered
     in the real committed floor, (2) the noise clause dropped alone, (3)
     over-strictness, (4) the gate's OWN over-strictness (a gate that refuses
     everything), (5) a neutered mutation so the ARM-NEVER-ARMED guard is itself
     proven, (6) REACH, the committed floor truncated, (7) the per-arm copy
     blanked so the copy-is-the-subject guard is measured, (8) the arm that armed
     somewhere else, recorded rather than smoothed. So corpus +1, classified +1,
     arms +8, and **the pre-move floor carried ZERO slack** (928/928 · 172/172 ·
     173/173 on this branch's own baseline at `6406c5a`, measured before a byte
     was written — the same zero-slack reading D-318 recorded, two items running).
     ONE KEY SET, grepped before and after writing: `^  arms:` matches TWICE in
     this file, once here and once in `FLEET_FLOOR`, the documented state. */
  /* MOVED 2026-09-13 BY M0-25: 936 -> 942 / 173 -> 174 / 174 -> 175, ALL THREE IN
     THE SAME TURN, every one read off the figure THIS ITEM'S OWN GREEN `--strict`
     RUN PRINTED — `REGISTER FLOOR arms 942/936 · classified 174/173 · corpus
     (suites read) 175/174 · GREW by 6 arm(s)` — and never by adding this item's
     claimed delta to the number above. The +1 corpus and +1 classified are
     `test/m025-arm-anchor-witness.test.mjs`, the battery-side arm-anchor check;
     its declaration reads as 6 arms.
     **READ AFTER THE COMMIT, AND THE PRE-COMMIT RUN IS WHY THAT SENTENCE IS HERE
     RATHER THAN ASSUMED.** With the new suite still UNTRACKED, the same script
     printed `arms 936/936 · classified 173/173 · corpus 174/174` in the headline
     while reporting, four lines down, `942 register arms were counted above; 936
     of them come from suites that are in the commit`. A floor set from the
     contaminated figure would have been permanently too high, would have failed
     every honest run afterwards, and would have been switched off — which is the
     payload D-238 names, arriving exactly as written. The figures here come from
     the run at `65a8e63`, with the suite in the commit.
     ONE KEY SET, grepped after writing: `^  arms:` matches TWICE in this file,
     once here and once in `FLEET_FLOOR`, the documented state. `FLEET_FLOOR` is
     UNMOVED and none is owed — this item adds no fleet member and no fleet
     suite, and its own suite is a PLANE suite. */
  /* MOVED 2026-09-14 by D-334: 942 -> 947 / 174 -> 176 / 175 -> 177, ALL THREE IN
     THE SAME TURN and every one READ FROM THE REPRODUCIBLE FIGURE a green
     `--strict` run PRINTED on the COMMITTED tree at `3607dda`
     (`arms 947/942 · classified 176/174 · corpus 177/175 · GREW by 5`) — never by
     adding a claimed delta to the numbers above.
     **PART OF THIS RISE PREDATES THIS ITEM, AND SAYING SO IS THE POINT.** Measured
     on the PRISTINE baseline worktree at `02c5eb6`, before a byte of this item
     existed, the same script already printed `arms 944/942 · classified 175/174 ·
     corpus 176/175` — so the floor arrived at this item ALREADY STALE BY 2/1/1,
     a residue of work that landed without moving it. This item's own share is the
     remaining 3/1/1: ONE new suite, `test/d334-monitor-credential.test.mjs`, whose
     `NEGATIVE CONTROL:` declaration states three arms, all three RUN and recorded
     with their declared-and-measured figures in the suite header.
     **READ AFTER THE COMMIT, for D-238's reason, and the pre-commit run is the
     receipt:** with the suite still UNTRACKED the same script printed the
     reproducible `arms 944 · classified 175 · corpus 176` while naming the
     contaminated `arms 947 · classified 176 · corpus 177` as what it had actually
     read. Those two figures swapped places once the suite was in the commit, which
     is exactly why a floor is only ever taken from a committed tree.
     ONE KEY SET, grepped after writing: `^  arms:` matches TWICE in this file,
     once here and once in `FLEET_FLOOR`, the documented state. `FLEET_FLOOR` is
     UNMOVED and none is owed — this item adds no fleet member and no fleet suite,
     and its own suite is a PLANE suite. */
  /* MOVED 2026-09-14 by CONDUCT #9 at D-334's integration, from the merged run's
     print (949/947 · 177/176 · 178/177 · GREW by 2): the slack is DIST's newest
     suite landing beside D-334's, each blind to the other — the stale-floor
     pattern's routine instance, collapsed at the merge as always. */
  /* MOVED 2026-09-14 by the D-329+D-331+D-333 item (949 -> 957 · 177 -> 178 ·
     178 -> 179), from the figures a green `--strict` run PRINTED on this item's
     own COMMITTED tree (`arms 957/949 · classified 178/177 · corpus 179/178 ·
     GREW by 8`) — never counted, never incremented by hand.
     **THE FLOOR ARRIVED ALREADY STALE BY 4/1/1 AND THAT IS MEASURED, NOT
     INFERRED**: the same script run on a PRISTINE `origin/main` worktree at
     `b0eddbf`, before a byte of this item existed, printed
     `arms 953/949 · classified 178/177 · corpus 179/178 · GREW by 4` — the
     corpuscheck suite that landed with the corpus-standard work, blind to
     D-334's landing and vice versa, the routine instance of this pattern. This
     item's own share is the remaining **4 arms**, and none of the classified or
     corpus movement: it adds NO suite, and the four arms are the ones its
     extended `NEGATIVE CONTROL:` declaration states in
     `m025-arm-anchor-witness.test.mjs` for the composed-label, preflight and
     tally halves. Nothing FELL.
     ONE KEY SET, grepped after writing: `^  arms:` matches TWICE in this file,
     here and in `FLEET_FLOOR`, the documented state. `FLEET_FLOOR` is UNMOVED
     and none is owed — this item adds no fleet member and no fleet suite. */
  /* MOVED 2026-09-14 by CONDUCT #10 at the D-329+D-331+D-333 MERGE (957 -> 958): the merged run's
     own print read `arms 958/957` — the +1 is BOB's corpuscheck.test.mjs landing beside the item,
     invisible to the branch that set 957. One key set, read from the print after the commit (D-238). */
  /* MOVED 2026-09-14 by CONDUCT #10 at COFF-9's merge (958 -> 959): the merged run's own print read `arms 959/958`; the +1 is COFF-9's ooxml suite arm. One key set, read from the print after the commit (D-238). */
  /* MOVED 2026-09-14 by REC-82 (959 -> 967 / 178 -> 179 / 179 -> 180), ALL THREE IN THE
     SAME TURN and every one taken from the figure THIS ITEM'S OWN GREEN `--strict` RUN
     PRINTED AS REPRODUCIBLE — `arms 967/959 · classified 179/178 · corpus 180/179 · GREW
     by 8 arm(s)` — read AFTER the new files were in a commit, so these are the reproducible
     figures and not the contaminated ones the pre-commit run reported under the same
     numerals (D-238). Never counted and never added to the numbers above; the first
     pre-commit run read `arms 959/959 … (contaminated: 1 suite(s) no other checkout has)`
     and was correctly refused as a source for this move.
     THE CAUSE IS ONE NEW SUITE, `test/content-extent.test.mjs`, whose `NEGATIVE CONTROL:`
     declaration states EIGHT arms — seven defeat arms plus the baseline, all run by
     `test/nc-rec82.mjs` and all AS DECLARED. So `corpus` and `classified` each rise by one
     and `arms` by eight. Nothing FELL.
     ONE KEY SET, grepped after writing: `^  arms:` matches TWICE in this file, here and in
     `FLEET_FLOOR`, which is the documented state. `FLEET_FLOOR` is UNMOVED and none is owed
     — this item adds no fleet member and no fleet suite. */
  /* ---- CONFLICT RESOLVED AT THE REC-83/M0-28 x REC-84 MERGE, 2026-09-14, AND THE
     RESOLUTION IS THE ONE THIS FILE'S OWN HEADER DEMANDS: **COLLAPSED TO ONE KEY SET
     AND THE FIGURES RE-READ FROM THE MERGED TREE'S OWN PRINT.** Keep-both has left
     duplicate `arms:` keys here SIX separate times; both sides of this conflict happened
     to carry the SAME three numbers (975/180/181) for DIFFERENT reasons, which is the
     most dangerous shape of all — taking either side unchanged would have looked right
     and been wrong, because on the merged tree the two items' arms ADD. The notes from
     both sides are kept below, because each records a real move; only the VALUES are
     re-measured. ----

     MOVED 2026-09-14 by CONDUCT #10 at COFF-10's merge (967 -> 972 · 179 -> 180 · 180 -> 181): the merged run's own print read `arms 972/967 · classified 180/179 · corpus 181/180`; the +5 arms and +1 suite are COFF-10's `formats-odf.test.mjs`, which set 964 on a tree without REC-82's +8. One key set, read from the print after the commit (D-238).
     MOVED 2026-09-14 by CONDUCT #10 at M0-30's merge (972 -> 974): the merged run's own print read `arms 974/972`; the +2 is M0-30's planning-hygiene 4.7 declaration. One key set, read from the print after the commit (D-238).
     MOVED 2026-09-14 by M0-28 (974 -> 975): that item's own green `--strict` run, taken AFTER
     its commit `bdfcb86`, PRINTED `REGISTER FLOOR  arms 975/974 · classified 180/180 · corpus
     (suites read) 181/181 · GREW by 1 arm(s)` — read from the print, never incremented by hand.
     The cause is ONE new arm in an EXISTING suite: `corpuscheck.test.mjs`'s declaration gains
     entry (5), the `asOfAll.length > 1` push disabled in `checkFile`, run and as declared. No
     new suite, so `classified` and `corpus` are UNMOVED and none is owed. Nothing FELL.
     ONE KEY SET, grepped after writing: `^  arms:` matches TWICE in this file, here and in
     `FLEET_FLOOR`, which is the documented state; `FLEET_FLOOR` is unmoved. */
  /* MOVED 2026-09-14 by CONDUCT #11 at REC-83's integration (975 -> 981 · 180 -> 181 · 181 -> 182):
     the MERGED run's own print read `arms 981/975 · classified 181/180 · corpus (suites read)
     182/181 · GREW by 6 arm(s)` - REC-83's `content-reads.test.mjs` (six declared arms, one new
     suite) on top of M0-28's 975. The branch's own block (973/180/181, a tree without M0-30 and
     M0-28) was dropped at the merge and declared; this is the re-read the loop promises. One key
     set, grepped after writing. Nothing FELL. FLEET_FLOOR unmoved. */
  /* MOVED 2026-09-14 by REC-84 (worktree agent-ae95c3be71f5bd167), on its OWN branch, from
     967/179/180 to 975/180/181 — read off a green `--strict` run at `47ec7cb` where the
     provenance line reported 197 of 197 discovered items in the commit. THE CONTAMINATED
     FIGURES WERE REFUSED AS A SOURCE AND THE REFUSAL IS THE POINT (D-238): an earlier run,
     before the new suite was committed, printed exactly the same three numbers marked
     `contaminated: 1 suite(s) no other checkout has`. Identical, and still the wrong source.
     REC-84's own cause is ONE new suite, `test/content-extent-leg.test.mjs`, whose
     `NEGATIVE CONTROL:` declaration states eight arms; all eight are RUN by
     `test/nc-rec84.mjs` and all eight came back AS DECLARED.

     THE VALUES BELOW ARE THE MERGED TREE'S AND NEITHER BRANCH'S, re-read from a green
     `--strict` run taken AFTER the merge commit `40f34e1`, whose provenance line reports
     199 of 199 discovered items in the commit: `REGISTER FLOOR  arms 989/975 · classified
     182/180 · corpus (suites read) 183/181 · GREW by 14 arm(s)`. **This is the measurement
     that proves the collapse was necessary**: both sides of the conflict said 975 and the
     merged truth is 989. The +14 arms and +2 suites are REC-84's `content-extent-leg`
     (8 arms) and REC-83's `content-reads` (6), each a suite the other branch did not have.
     Nothing FELL. ONE KEY SET, grepped after writing: `^  arms:` matches TWICE in this
     file, here and in `FLEET_FLOOR`, which is the documented state; `FLEET_FLOOR` is
     UNMOVED and none is owed, since neither item adds a fleet member or a fleet suite. */
  /* ---- SECOND MERGE OF `origin/main` INTO REC-84, 2026-09-14, and the third time this
     key has been resolved today. CONDUCT #11's note above moved main to 981/181/182 for
     REC-83's `content-reads`; REC-84's note above moved its own branch to 989/182/183 for
     the SAME suite PLUS `content-extent-leg`. The merged tree holds both, so 989/182/183
     stands and 981/181/182 is a strict subset of it — COLLAPSED TO ONE KEY SET, both
     notes kept, and the surviving values RE-VERIFIED by a green `--strict` run on this
     merge rather than reasoned about. ---- */
  /* MOVED 2026-09-14 by CONDUCT #11 at CAP-8's integration (989 -> 996 · 182 -> 183 · 183 -> 184):
     the MERGED run's own print read `arms 996/989 · classified 183/182 · corpus (suites read)
     184/183 · GREW by 7 arm(s)` - CAP-8's `drive.test.mjs` (seven declared arms, one new suite)
     on top of REC-84's 989. The branch's own block (979/181/182, cut at 87f263a) was dropped at
     the merge and declared; this is the re-read the loop promises. One key set. Nothing FELL.
     FLEET_FLOOR unmoved. */
  /* MOVED 2026-09-14 by CONDUCT #11 at FW-17's integration (996 -> 1002 · 183 -> 184 · 184 -> 185):
     the MERGED run's own print read `arms 1002/996 · classified 184/183 · corpus (suites read)
     185/184 · GREW by 6 arm(s)` - FW-17's `reading-position.test.mjs` (six declared arms, one new
     suite) on top of CAP-8's 996. The branch's own block (980/181/182, cut at 6a093bf) was dropped
     at the merge and declared; this is the re-read the loop promises. One key set. Nothing FELL.
     FLEET_FLOOR unmoved. */
  /* MOVED 2026-09-14 by CONDUCT #11 at REC-85's integration (1002 -> 1010 · 184 -> 185 · 185 -> 186):
     the MERGED run's own print read `arms 1010/1002 · classified 185/184 · corpus (suites read)
     186/185 · GREW by 8 arm(s)` - REC-85's content-extent-arms suite on top of FW-17's 1002. The
     branch's own block (997/183/184, its merge of ca92a3a) was dropped at the merge and declared;
     this is the re-read the loop promises. One key set. Nothing FELL. FLEET_FLOOR unmoved. */
  /* MOVED 2026-09-14 by CONDUCT #11 at CAP-9's integration (1010 -> 1015 · 185 -> 186 · 186 -> 187):
     the MERGED run's own print read `arms 1015/1010 · classified 186/185 · corpus (suites read)
     187/186 · GREW by 5 arm(s)` - CAP-9's `capture-pagecount.test.mjs` (five declared arms, one
     new suite) on top of REC-85's 1010. The branch's own block (1001/184/185, cut at 980a9e5) was
     dropped at the merge and declared; this is the re-read the loop promises. One key set.
     Nothing FELL. FLEET_FLOOR unmoved. */
  /* MOVED 2026-09-14 by SK-7 (the RESPAWN): 1015 -> 1021 / 186 -> 187 / 187 -> 188,
     ALL THREE IN THE SAME TURN and every one taken from the figure this item's own
     green `--strict` run PRINTED as REPRODUCIBLE (`arms 1021/1015 · classified
     187/186 · corpus 188/187 · GREW by 6`) at commit 9bc43d9, with `provenance: 204
     of 204 discovered item(s) are in the commit` — never counted, never incremented
     by hand, and never read off a run that still held a phantom. The cause is ONE
     new suite, `test/content-machine-mint.test.mjs`, whose `NEGATIVE CONTROL:`
     declaration states six arms.

     WHY THIS IS A SECOND COMMIT and not part of the item's own: the reproducible
     figure is the one another checkout at HEAD can reproduce, so the suite has to
     be IN the commit before its arms may be quoted. Reading the floor from a run
     taken before the commit would have quoted 1015. A run taken earlier in this
     same session printed a CONTAMINATED `arms 1020`, one short of this figure,
     because the suite then declared five arms and now declares six — which is the
     second reason the contaminated figure is never the one to move to: it is a
     snapshot of a tree still being written. Nothing FELL. */
  /* MOVED 2026-09-14 by CONDUCT #11 at CAP-12's integration (1021 -> 1030 · 187 -> 188 · 188 -> 189):
     the MERGED run's own print read `arms 1030/1021 · classified 188/187 · corpus (suites read)
     189/188 · GREW by 9 arm(s)` - CAP-12's container-extent suite (nine declared arms, one new
     suite) on top of SK-7's 1021. The branch's own block (1024/187/188, its post-commit print on a
     tree cut before SK-7 landed) was dropped at the merge and declared; this is the re-read the
     loop promises. One key set. Nothing FELL. FLEET_FLOOR unmoved. */
  /* MOVED 2026-09-14 by CONDUCT #11 at REC-97's integration (1030 -> 1037 · 188 -> 189 · 189 -> 190):
     the MERGED run's own print read `arms 1037/1030 · classified 189/188 · corpus (suites read)
     190/189 · GREW by 7 arm(s)` - REC-97's cite-extent suite (seven declared arms, one new suite)
     on top of CAP-12's 1030. The branch's own block (1022/187/188, cut before SK-7 and CAP-12
     landed) was dropped at the merge and declared. One key set. Nothing FELL. FLEET_FLOOR unmoved. */
  /* MOVED 2026-09-14 by CONDUCT #11 at REC-93's integration (1037 -> 1044 · 189 -> 190 · 190 -> 191):
     the MERGED run's own print read `arms 1044/1037 · classified 190/189 · corpus (suites read)
     191/190 · GREW by 7 arm(s)` - REC-93's observation-log suite on top of REC-97's 1037. The
     branch's own block (1022/187/188, cut at f38af22 before SK-7, CAP-12 and REC-97) was dropped
     at the merge and declared. One key set. Nothing FELL. FLEET_FLOOR unmoved. */
  /* MOVED 2026-09-14 by CONDUCT #11 at CPDF-20's integration (1044 -> 1051 · 190 -> 191 · 191 -> 192):
     the MERGED run's own print read `arms 1051/1044 · classified 191/190 · corpus (suites read)
     192/191 · GREW by 7 arm(s)` - CPDF-20's tier-pagewise suite on top of REC-93's 1044. The branch's
     own block (1022/187/188) was dropped at the merge and declared; its worker named the collision
     itself and said not to add the two deltas, which is the rule. One key set. Nothing FELL. */
  /* MOVED 2026-09-14 by CONDUCT #11 at SK-8's integration (1051 -> 1059 · 191 -> 192 · 192 -> 193):
     the MERGED run's own print read `arms 1059/1051 · classified 192/191 · corpus (suites read)
     193/192 · GREW by 8 arm(s)` - SK-8's extractrun suite on top of CPDF-20's 1051. The branch's own
     block (1029/188/189) was dropped at the merge and declared. One key set. Nothing FELL. */
  /* MOVED 2026-09-15 by REC-98 (1059 -> 1068 · 192 -> 193 · 193 -> 194): this item's
     own green `--strict` run PRINTED `arms 1068/1059 · classified 193/192 · corpus
     (suites read) 194/193 · GREW by 9 arm(s)` — taken from the print, never by
     adding 9 to the number in the file, and taken AFTER the commit rather than
     before it. THE PRE-COMMIT RUN OF THE SAME COMMAND SAID `contaminated: 1
     suite(s) no other checkout has` and its figures were NOT used: `tier2-wire.test.mjs`
     was untracked, so 1068 was not yet a figure another checkout reproduces, and a
     floor moved over a phantom is permanently too high (D-238). After `272bf50` the
     same run reads `provenance: 210 of 210 discovered item(s) are in the commit`.
     The cause is one new suite whose `NEGATIVE CONTROL:` declaration states NINE
     arms, all NINE of them RUN by `test/nc-rec98.mjs` and all nine AS DECLARED.
     One key set. Nothing FELL. FLEET_FLOOR unmoved — this item adds no fleet
     member, no fleet suite and no fleet op. */
  /* MOVED 1068 -> 1075 · 193 -> 194 · 194 -> 195 at REC-94's INTEGRATION, 2026-09-15 by
     CONDUCT #11, FROM THE MERGED RUN'S OWN POST-COMMIT PRINT — `arms 1075/1068 · classified
     194/193 · corpus (suites read) 195/194 · GREW by 7 arm(s)` — and NEVER by adding two
     branches' deltas, which is the whole of D-238 and the case it was written for arrived
     here today. **BOTH SIDES OF THIS MERGE HAD HONESTLY MOVED THIS FIGURE AND NEITHER WAS
     TRUE OF THE RESULT:** `origin/main` carried REC-98's 1068 and REC-94's branch carried its
     own 1065, each read correctly from its own post-commit run, and the merged tree is 1075.
     Adding the deltas would have produced 1074 and installed permanent slack in a ratchet
     whose entire purpose is to have none. The conflict was resolved to main's value as a
     PLACEHOLDER and re-read here from the print above. ONE KEY SET — grepped before writing. */
  /* MOVED 1075 -> 1082 · 194 -> 195 · 195 -> 196 at REC-90's INTEGRATION, 2026-09-15 by
     CONDUCT #11, FROM THE MERGED RUN'S OWN POST-COMMIT PRINT — `arms 1082/1075 · classified
     195/194 · corpus (suites read) 196/195 · GREW by 7 arm(s)`. Second move of the day and
     the same rule both times (D-238): the figure is READ from the merged run, never computed
     from a branch's. REC-90's own branch figure was 1066, taken correctly on its own tree and
     already untrue of `origin/main` before the merge began — the conflict on this file was
     resolved to main's value as a placeholder and re-read here. ONE KEY SET, grepped. */
  /* MOVED 1082 -> 1087 · 195 -> 196 · 196 -> 197 at REC-88's INTEGRATION, 2026-09-15 by
     CONDUCT #11, FROM THE MERGED RUN'S OWN POST-COMMIT PRINT — `arms 1087/1082 · classified
     196/195 · corpus (suites read) 197/196 · GREW by 5 arm(s)`. THIRD move of the day, same
     rule each time (D-238), and the day is the argument for the rule: eight branches landed
     and four of them had honestly moved this figure on their own trees — 1065, 1066, 1068 and
     this one — every reading correct where it was taken and not one of them true of the
     result. The merged print is the only figure that is ever true of the merged tree. ONE
     KEY SET, grepped before writing. */
  /* MOVED 2026-09-15 by REC-95 (1087 -> 1093, 196 -> 197, 197 -> 198), ALL THREE IN THE
     SAME TURN and every one taken from the figure THIS ITEM'S OWN GREEN POST-COMMIT
     `--strict` RUN PRINTED as REPRODUCIBLE (`arms 1093/1087 · classified 197/196 ·
     corpus 198/197 · GREW by 6`), never counted and never incremented by hand (D-238).
     Taken AFTER the commit deliberately: the pre-commit run printed `contaminated: 1
     suite(s) no other checkout has` and a floor moved while a phantom is present is
     permanently too high, which is how a ratchet gets switched off.
     THE CAUSE IS ONE NEW SUITE, `test/observation-meaning.test.mjs`, whose declaration
     states SIX arms — so `corpus` and `classified` each rise by one and `arms` by six.
     Nothing FELL.
     AND THE REGISTER CAUGHT THIS ITEM'S OWN DECLARATION BEFORE IT COUNTED IT. The first
     draft read UNCLASSIFIED and `--strict` exited 1: an arm's own prose quoted the
     MARKER PHRASE, and `readControl` reads a declaration until that phrase recurs, so
     the whole list was truncated after arm (a). D-233 working exactly as built — an
     uncountable declaration is NAMED and never folded into the tally as zero. The arm
     was reworded; the instrument was not touched.
     ONE KEY SET, grepped after writing: `^  arms:` matches TWICE in this file, here and
     in the fleet floor below, which is one occurrence per distinct object. */
  /* MOVED 1093 -> 1100 · 197 -> 198 · 198 -> 199 by CONDUCT #1, 2026-09-16, AT REC-91'S
     INTEGRATION, and taken from THE MERGED TREE'S OWN POST-COMMIT `--strict` PRINT on
     c09dae61 — `arms 1100/1093 · classified 198/197 · corpus (suites read) 199/198 ·
     GREW by 7 arm(s)`. Provenance on that run: `210 of 210 discovered item(s) are in the
     commit at HEAD`, no contamination reported, tree clean.
     THIS IS THE FIGURE THE MERGE COMMIT PROMISED AND IT IS PAID HERE RATHER THAN LATER,
     which is the whole point: `8fcbe15` declared `Dropped-from-branch:` on this file
     because REC-91's branch moved this floor to 1094/197/198 from ITS OWN print while main
     carried REC-95's 1093/197/198 from ITS OWN. BOTH were correct where taken. NEITHER is
     true here, and — the part worth keeping — **1100 is not the sum of their deltas either**
     (1093 + the branch's 7 would be 1100 only by coincidence of arithmetic; the classified
     and corpus figures move by one each and no addition of the two branches' numbers
     produces 198/199). A floor reconstructed by adding deltas installs permanent slack in a
     ratchet whose entire purpose is to have none. The merged print is the only figure ever
     true of the merged tree (D-238).
     REC-69 IS WHY THIS COMMENT IS LONG: its merge named this same file, described taking
     main's side, promised exactly this re-read, and never performed it — and a dropped floor
     goes SLACK, not red, so eleven floors sat stale for days behind a green battery, a green
     --strict and a green UI harness. A floor promised for later is a floor nobody moved.
     ONE KEY SET, grepped after writing: `^  arms:` matches TWICE in this file, here and in
     FLEET_FLOOR below (76, unmoved) — one occurrence per distinct object. */
  /* MOVED `arms` 1100 -> 1104 by CONDUCT #1, 2026-09-16, at M0-42's and REC-103's merge,
     from THE MERGED TREE'S OWN POST-COMMIT `--strict` PRINT on ba116c02 — `arms 1104/1100 ·
     classified 198/198 · corpus (suites read) 199/199 · GREW by 4 arm(s)`. Provenance on
     that run: `210 of 210 discovered item(s) are in the commit at HEAD`, no contamination,
     tree clean.
     `classified` AND `corpus` DO NOT MOVE AND THAT IS CORRECT RATHER THAN AN OVERSIGHT:
     neither item added a SUITE. M0-42 added four arms to `register-grammar.test.mjs`'s
     existing declaration, and REC-103 contributed ZERO to this figure — its 6-arm block
     sits under REC-93's 7, because the register records the LARGEST SINGLE DECLARATION
     per suite and never the sum. REC-103's worker verified that rather than trusting an
     unchanged number, which is the right way round.
     AND THE DELTA IS THE SAME WHILE THE FIGURE IS NOT, which is D-238 in one line: M0-42's
     own tree printed 1097 (1093 + 4) and this tree prints 1104 (1100 + 4). Same four arms,
     different base, and only the merged print is ever true of the merged tree. */
  /* MOVED 2026-09-16 by REC-102: arms 1104 -> 1109, classified 198 -> 199, corpus 199 -> 200,
     ALL THREE IN THE SAME TURN and every one taken from the figure this item's own green
     `--strict` run PRINTED **AFTER THE COMMIT** as REPRODUCIBLE (`arms 1109/1104 ·
     classified 199/198 · corpus (suites read) 200/199 · GREW by 5 arm(s)`) — never counted,
     never added to the numbers above. The cause is ONE new suite,
     `test/tier3-layer-parts.test.mjs`, whose `NEGATIVE CONTROL:` declaration states five
     arms, so `corpus` and `classified` each rise by one and `arms` by five. Nothing FELL.
     THE PRE-COMMIT RUN PRINTED THE OLD FIGURES AND THAT IS THE POINT, not a discrepancy: an
     untracked suite is a PHANTOM to `provenance.mjs`, so the reproducible print stayed at
     1104/198/199 while the contaminated one already read 1109/199/200. A floor moved from the
     contaminated figure would be right today by accident and permanently too high the moment
     the suite failed to land, which is D-238's whole case. The FLEET floor is deliberately
     UNMOVED at 3/6/8/76, and that was VERIFIED from the same print rather than inferred from
     an unchanged number: this item adds no fleet member, no surface op and no fleet suite.
     AND THE DECLARATION THIS FIGURE COUNTS WAS REWRITTEN BECAUSE THIS INSTRUMENT REFUSED IT.
     The suite's first `NEGATIVE CONTROL:` paragraph was prose the register could not count
     arms in, so it landed in UNCLASSIFIED and `--strict` exited 1 — D-233's own shape, caught
     by the check that exists for it rather than by anyone re-reading the suite. The arms are
     a marked ordinal list now, and the five this figure counts are the five that RAN. */
  /* MOVED 1109 -> 1114 · 199 -> 200 · 200 -> 201 by CONDUCT #1, 2026-09-16, at REC-108's
     merge, from THE MERGED TREE'S OWN POST-COMMIT `--strict` PRINT — `arms 1114/1109 ·
     classified 200/199 · corpus (suites read) 201/200 · GREW by 5 arm(s)`.
     THE FOURTH FLOOR COLLISION OF THIS WAVE, AND THE ARITHMETIC IS AGAIN THE LESSON.
     REC-108's branch printed 1098/198/199 off a 1093 base; this tree already carried
     1109/199/200 from REC-102; the merged truth is 1114/200/201 and is NEITHER — nor is it
     reachable by adding the branch's delta to this tree's figure. `8fcbe15`'s merge declared
     this same file dropped for exactly this reason and paid it in the commit after, as does
     this one. Four times today two honest readings have collided and not once has either
     been true of the merge (D-238).
     AND REC-108 RECORDED WHY ITS OWN DELTA WAS 5 AND NOT THE 6 A HAND COUNT GIVES: `none` is
     its baseline arm and arms nothing. A figure counted by hand and a figure read from the
     print differ by exactly the kind of thing nobody notices.
     ONE KEY SET, grepped after writing: `^  arms:` matches twice in this file, here and in
     FLEET_FLOOR below (76, unmoved). */
  /* MOVED `arms` 1114 -> 1119 by CONDUCT #1, 2026-09-16, at REC-109's and M0-35's merge,
     from THE MERGED TREE'S OWN POST-COMMIT `--strict` PRINT — `arms 1119/1114 · classified
     200/200 · corpus 201/201 · GREW by 5 arm(s)`. `classified` and `corpus` correctly do not
     move: neither item adds a suite.
     THE FIFTH COLLISION OF THIS WAVE AND THE MOST DECEPTIVE FORM IT TAKES. REC-109's branch
     printed `arms 1114` off a 1109 base. This tree ALREADY CARRIED 1114, from REC-108's
     merge, reached by a DIFFERENT FIVE ARMS. **Two equal figures that are not the same
     claim** — and the merged truth is 1119, neither of them. Taking either side wholesale
     would have looked correct, matched the other, and been four arms low forever, because a
     floor that is too LOW never fails. That merge's `Dropped-from-branch:` trailer says so in
     advance; this is the payment.
     AND REC-109 FOUND WHY THE PRINT ITSELF CAN LIE, which is the reason this figure was
     re-read rather than trusted: a paragraph in its declaration QUOTED the register's marker
     phrase, and a quotation of a marker IS a marker, so one declaration split in two and the
     suite reported `GREW by 1` after FIVE arms were added — on a green run at exit 0. A floor
     taken from that print would have been four arms low, permanently and invisibly. It was
     caught only by running `countArms` against both versions (D-233's shape, inside the
     instrument that reports the floor).
     ONE KEY SET, grepped after writing: `^  arms:` matches twice, here and FLEET_FLOOR (76). */
  /* MOVED 1119 -> 1129 · 200 -> 201 · 201 -> 202 by CONDUCT #1, 2026-09-16, at M0-48's and
     M0-40's merge — the LAST integration of this wave — from THE MERGED TREE'S OWN
     POST-COMMIT `--strict` PRINT: `arms 1129/1119 · classified 201/200 · corpus 202/201 ·
     GREW by 10 arm(s)`.
     SEVEN FLOOR COLLISIONS IN ONE WAVE, AND NOT ONCE WAS EITHER INPUT TRUE OF THE MERGE:
     1094-vs-1093 -> 1100 · 1097-vs-1100 -> 1104 · 1109-vs-1104 -> 1109 (equal, checked
     anyway) · 1098-vs-1109 -> 1114 · 1114-vs-1114 -> 1119 (EQUAL AND NOT THE SAME CLAIM,
     reached by different arms) · 1108-vs-1119 · 1111-vs-1119 -> 1129. Every branch figure was
     correct where it was taken. The merged print is the only figure ever true of the merged
     tree (D-238), and the fifth case is the one that proves the rule cannot be relaxed: two
     branches printed the SAME NUMBER and the merged truth was neither.
     AND M0-48 MEASURED WHY A DELTA CANNOT BE ADDED EITHER: a method cannot join the bounds
     class without also gaining an unbounded row source, so a class-count-neutral swap
     necessarily moves the census by one — the two ratchets in that file cannot move
     independently. Arithmetic on these figures is wrong in more ways than one.
     ONE KEY SET, grepped after writing: `^  arms:` matches twice, here and FLEET_FLOOR (76). */
  /* MOVED 2026-09-17 by M0-51 (1129 -> 1136 · 201 -> 202 · 202 -> 203): this item's own green
     `--strict` run, taken AFTER its commit `e80d4993`, PRINTED `REGISTER FLOOR  arms 1136/1129 ·
     classified 202/201 · corpus (suites read) 203/202 · GREW by 7 arm(s)` — READ FROM THE PRINT,
     never incremented by hand, which is the only way this ratchet is allowed to move (D-238).
     The cause is ONE new suite, `m051-driver-census.test.mjs`, declaring SEVEN arms: the driver
     census's negative controls, all seven armed and as declared. Nothing FELL.
     ONE KEY SET, grepped after writing: `^  arms:` matches TWICE in this file, here and in
     `FLEET_FLOOR`, which is the documented state; `FLEET_FLOOR` is UNMOVED and none is owed —
     this item adds no fleet member and no fleet suite. */
  /* MOVED 2026-09-17 by CONDUCT #2 AT THE WAVE MERGE — 1136 -> 1147 · 202 -> 204 · 203 -> 205,
     READ FROM THIS MERGED TREE'S OWN POST-COMMIT `--strict` PRINT:
     `REGISTER FLOOR  arms 1147/1136 · classified 204/202 · corpus (suites read) 205/203 ·
     GREW by 11 arm(s)`. THE PLACEHOLDER THIS REPLACES WAS A FOUR-WAY FLOOR COLLISION and it
     is recorded because the collision is the lesson, not the number: M0-51 read 1136, REC-92
     read 1135, REC-96 read 1134, each correctly from its own green post-commit run, and NOT
     ONE was true of the tree that carries all three suites. Two of them printed IDENTICAL
     `classified` and `corpus` figures by different arms — which is CONDUCT #1's fifth
     collision shape exactly, and the reason this may NOT be relaxed to check-only-when-they-
     disagree. THE DELTAS HAPPEN TO SUM HERE (1129 + 7 + 6 + 5 = 1147) AND THAT IS STATED AS A
     COINCIDENCE RATHER THAN A METHOD: adding them is refused whatever it yields, because
     M0-40 measured that the bounds class and the census ratchet cannot move independently, and
     a method that is right by luck is indistinguishable from one that is right. The figure
     above is the PRINT. Cause: three new suites (`m051-driver-census`, `passage-arm`,
     `casesearched`) declaring 7 + 6 + 5 arms. Nothing FELL. */
  /* MOVED 1147 -> 1148 by CONDUCT #2 at wave two's integration, 2026-09-17, READ FROM THE MERGED
     TREE'S OWN POST-COMMIT PRINT: `REGISTER FLOOR  arms 1148/1147 · classified 204/204 · corpus
     (suites read) 205/205 · GREW by 1 arm(s)`. Kept EXACT rather than left slack at 1147: --strict
     exits 0 either way because a floor only refuses a FALL, so slack here would never fail and
     would silently stop covering the arm that arrived — which is this ratchet's own recorded
     failure mode (a dropped floor move goes SLACK, not broken). classified and corpus are
     UNMOVED and that is stated rather than implied: the arriving arm joined an already-counted
     declaration rather than adding a suite. */
  /* MOVED 2026-09-18 by REC-129 (1332 -> 1345 · 230 -> 232 · 231 -> 233 · run 193 -> 195): this
     item's own green `--strict` run at its commit PRINTED `arms 1345/1332 · classified 232/230 · corpus
     (suites read) 233/231 · GREW by 13 arm(s)` and `floor 195/193 reproducible` — taken from the print,
     never by adding. The arrivals are two suites: frontier-internet.test.mjs (8 arms, (a)-(h)) and
     stats-disclosure.test.mjs (5 arms, (a)-(e)), both driven by nc-rec129.mjs. */
  // [branch record | MK-2 resumed, on origin/main 27ad8b4f] MOVED 1332 -> 1346, classified 230 -> 231, corpus 231 -> 232, run 193 -> 194, from this item's own `--strict` print on the committed tree 8fe3fc8e (`arms 1346/1332 · classified 231/230 · corpus (suites read) 232/231 · GREW by 14 arm(s)`, `floor 194/193 reproducible`), exit 0. Cause: ONE new suite, `testimonyaxis.test.mjs`, whose declaration the register counts at 14 arms. ONE KEY SET.
  // [REC-134] 2026-09-18: MOVED 1392 -> 1400, classified 238 -> 239, corpus 239 -> 240, run 201 -> 202, from this item's own `--strict` print on its committed tree 254404d1 (`arms 1400/1392 · classified 239/238 · corpus (suites read) 240/239 · GREW by 8 arm(s)`, `floor 202/201 reproducible`). Cause: ONE new suite, project-authority.test.mjs, driven by project-authority.control.mjs. ONE KEY SET.
  // [REC-137] 2026-09-18: MOVED 1414 -> 1419, classified 241 -> 242, corpus 242 -> 243, run 204 -> 205, from this item's own `--strict` print on its COMMITTED MERGE with origin/main (REC-138 in) b7a06bd5 (`arms 1419/1414 · classified 242/241 · corpus (suites read) 243/242 · GREW by 5 arm(s)`, `floor 205/204 reproducible`), exit 0. Cause: ONE new suite, case-authority.test.mjs, driven by case-authority.control.mjs. Its two earlier branch readings (1405, 1412) were each replaced at a merge, never added. ONE KEY SET.
  // [REC-143] 2026-09-18: MOVED 1430 -> 1436, classified 243 -> 244, corpus 244 -> 245, run 206 -> 207, from this item's own `--strict` print on its committed tree 3e4235e8 (`arms 1436/1430 · classified 244/243 · corpus (suites read) 245/244 · GREW by 6 arm(s)`, `floor 207/206 reproducible`), exit 0. Cause: ONE new suite, migrate-released.test.mjs, driven by migrate-released.control.mjs. ONE KEY SET.
  // [CONDUCT #5 at the UI-65 + REC-136 landing] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1430/1427 · classified 243/243 · corpus (suites read) 244/244 · GREW by 3`, `floor 206/206 reproducible`, from the print; the held branch's 1417 and UI-65's own figure are replaced, never added.
  // [REC-140] 2026-09-18: MOVED 1427 -> 1434, classified 243 -> 244, corpus 244 -> 245, run 206 -> 207, from this item's own `--strict` print on its COMMITTED MERGE with origin/main (REC-139 in) cf3e1034 (`arms 1434/1427 · classified 244/243 · corpus (suites read) 245/244 · GREW by 7`, `floor 207/206 reproducible`) — the arrival is ratify-authority.test.mjs (seven arms, (a)-(g)).
  // [REC-140 at its merge with UI-65 + REC-136] 2026-09-18: the two moves collided (1434 mine, 1430 theirs); collapsed to ONE key and re-read on the committed merge ecc73ddb from the `--strict` print: `arms 1437/1437 · classified 244/244 · corpus (suites read) 245/245`, `floor 207/207 reproducible`.
  // [CONDUCT #6 at REC-143's merge over REC-140] 2026-09-18: the two moves collided (1436 REC-143's, 1437 main's); collapsed to ONE key and re-read on the COMMITTED merge 4a32c72f from the `--strict` print: `arms 1443/1437 · classified 245/244 · corpus (suites read) 246/245 · GREW by 6`, `floor 208/207 reproducible`.
  // [REC-142] 2026-09-18: MOVED 1430 -> 1434, classified 243 -> 244, corpus 244 -> 245, run 206 -> 207, from this item's own `--strict` print on its committed tree c3afce3e (`arms 1434/1430 · classified 244/243 · corpus (suites read) 245/244 · GREW by 4 arm(s)`, `floor 207/206 reproducible`), exit 0. Cause: ONE new suite, conclude-project-arm.test.mjs, driven by conclude-project-arm.control.mjs. ONE KEY SET.
  // [REC-142 at its merge with REC-140] 2026-09-18: the two moves collided (1434 mine on c3afce3e, 1437 theirs); collapsed to ONE key and re-read on the committed merge afc32149 from the `--strict` print: `arms 1441/1437 · classified 245/244 · corpus (suites read) 246/245 · GREW by 4`, `floor 208/207 reproducible`.
  // [CONDUCT #6 at REC-142's merge over REC-143] 2026-09-19: collided (1441 REC-142's, 1443 main's); collapsed to ONE key and re-read on the COMMITTED merge 0a4ef56d (REC-142 + bob16-verif) from the `--strict` print: `arms 1448/1443 · classified 246/245 · corpus (suites read) 247/246 · GREW by 5`, `floor 209/208 reproducible`.
  // [REC-144] 2026-09-19: moved from the `--strict` print on the COMMITTED tree dc7e9294 (REC-144 merged over origin/main 8ab8f48f): `arms 1451/1448 · classified 247/246 · corpus (suites read) 248/247 · GREW by 3`, `floor 210/209 reproducible · GREW by 1` — projection-noproject.test.mjs's NEGATIVE CONTROL line.
  // [CONDUCT #6 at D-430's merge over REC-142] 2026-09-19: collided (1447 D-430's, 1448 main's); collapsed to ONE key and re-read on the COMMITTED merge cca00cff from the `--strict` print: `arms 1452/1448 · classified 247/246 · corpus (suites read) 248/247 · GREW by 4`, `floor 210/209 reproducible`.
  // [M0-65] 2026-09-19: MOVED 1452 -> 1455 (arms only; classified 247, corpus 248, run 210 UNCHANGED), from this item's own `--strict` print on its committed tree 7638dd5d (origin/main merged in): `arms 1455/1452 · classified 247/247 · corpus (suites read) 248/248 · GREW by 3 arm(s)`, `floor 210/210 reproducible`, exit 0. Cause: battery-verdict.test.mjs's declaration gained arms (d) widening, (e) reportline, (f) liar; no new suite. ONE KEY SET.
  // [REC-144 over D-430] 2026-09-19: collided (1451 REC-144's, 1452 main's); collapsed to ONE key and re-read on the COMMITTED merge 43ae8967 from the `--strict` print: `arms 1455/1452 · classified 248/247 · corpus (suites read) 249/248 · GREW by 3`, `floor 211/210 reproducible · GREW by 1`.
  // [REC-141] 2026-09-18: MOVED 1437 -> 1443, classified 244 -> 245, corpus 245 -> 246, run 207 -> 208, from this item's own `--strict` print on its COMMITTED MERGE with origin/main (REC-140 in) 3b0409f1 (`arms 1443/1437 · classified 245/244 · corpus (suites read) 246/245 · GREW by 6 arm(s)`, `floor 208/207 reproducible`), exit 0. Cause: ONE new suite, project-mint.test.mjs, driven by project-mint.control.mjs (six arms). ONE KEY SET.
  // [REC-141 at its merge with REC-143] 2026-09-18: the two moves collided (1443 REC-141's project-mint, 1443 main's migrate-released — each counted from the same 1437); collapsed to ONE key and re-read on the COMMITTED merge 3e8fd803 from the `--strict` print: `arms 1449/1443 · classified 246/245 · corpus (suites read) 247/246 · GREW by 6 arm(s)`, `floor 209/208 reproducible`. ONE KEY SET.
  // [REC-141 at its merge with REC-142] 2026-09-18: collided again (1449 REC-141's with REC-143, 1448 main's with REC-142); collapsed to ONE key and re-read on the COMMITTED merge b1ca9edc from the `--strict` print: `arms 1454/1448 · classified 247/246 · corpus (suites read) 248/247 · GREW by 6 arm(s)`, `floor 210/209 reproducible` — the six are project-mint's. ONE KEY SET.
  // [UI-66 at its merge of REC-141 over D-430] 2026-09-19: collided (1454 REC-141's, 1452 main's with D-430); collapsed to ONE key and re-read on the COMMITTED merge e1763f3d (REC-141 @ 817a8f85 + UI-66 + origin/main f61d071d) from the `--strict` print: `arms 1458/1454 · classified 248/247 · corpus (suites read) 249/248 · GREW by 4 arm(s)`, `floor 211/210 reproducible`, exit 0. UI-66 adds no register suite (civicos-ui/test is not read by the register); the 1458 is D-430's pipeline-readers (4) plus REC-141's project-mint (6) over 1448.
  // [REC-141 at its merge with D-430] 2026-09-19: collided again (1454 REC-141's, 1452 main's); collapsed to ONE key and re-read on the COMMITTED merge 4bfed16f from the `--strict` print: `arms 1458/1452 · classified 248/247 · corpus (suites read) 249/248 · GREW by 6 arm(s)`, `floor 211/210 reproducible` — the six are project-mint's. ONE KEY SET.
  // [D-431] 2026-09-19: MOVED 1443 -> 1446, from this item's own `--strict` print on its committed tree c254f8ce (`arms 1446/1443 · classified 245/245 · corpus (suites read) 246/246 · GREW by 3 arm(s)`, `floor 208/208 reproducible`), exit 0. Cause: ratify-authority.test.mjs's declaration gained three arms, (h)-(j). No new suite. ONE KEY SET.
  // [D-431 at its merge with origin/main f61d071d] 2026-09-19: the two moves collided (1446 mine, 1452 main's); collapsed to ONE key and re-read on the COMMITTED merge 1d8dff0e from the `--strict` print: `arms 1456/1452 · classified 247/247 · corpus (suites read) 248/248 · GREW by 4 arm(s)`, `floor 210/210 reproducible`, exit 0 — ratify-authority's (h)-(j) plus ONE arm this print does not attribute (UNDETERMINED which suite: the register prints totals, and this item edited the NEGATIVE CONTROL lines of five suites); the branch's own 1446 is replaced, never added.
  // [REC-145] 2026-09-19: MOVED 1448 -> 1460, from this item's own `--strict` print on its committed tree 81c99d46 (`arms 1460/1448 · classified 246/246 · corpus (suites read) 247/247 · GREW by 12 arm(s)`, `floor 209/209 reproducible`), exit 0. Cause: NO new suite — the NEGATIVE CONTROL declarations of airun-projectgate.test.mjs (nc-pl18.mjs re-run, eleven rows) and project-disclosure.test.mjs (REC-145's arms) grew. classified, corpus and run UNMOVED. ONE KEY SET.
  // [REC-145 at its merge with D-430] 2026-09-19: collided (1460 REC-145's, 1452 main's); collapsed to ONE key and re-read on the COMMITTED merge de91bc63 from the `--strict` print: `arms 1464/1464 · classified 247/247 · corpus (suites read) 248/248`, `floor 210/210 reproducible`, exit 0.
  // [CONDUCT #6 at the batch landing: D-431 + REC-141 + UI-66 + REC-144 + M0-65 over REC-145] 2026-09-19: five floor moves collided (1456 D-431, 1458 REC-141/UI-66, 1455 REC-144, 1455 M0-65, 1464 main); collapsed to ONE key set and re-read on the COMMITTED merge be73038e from the `--strict` print: `arms 1480/1464 · classified 249/248 · corpus (suites read) 250/249 · GREW by 16`, `floor 212/211 reproducible`.
  // [REC-152] 2026-09-19: MOVED 1480 -> 1486, classified 249 -> 250, corpus 250 -> 251, run 212 -> 213, from this item's own `--strict` print on its COMMITTED MERGE with origin/main (20b7412f) at 5aeae866: `arms 1486/1480 · classified 250/249 · corpus (suites read) 251/250 · GREW by 6 arm(s)`, `floor 213/212 reproducible · GREW by 1` — the new `airun-principal.test.mjs` and its dated declaration.
  arms: 1486,
  // [CONDUCT #5 at REC-139's merge] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1427/1419 · classified 243/242 · corpus (suites read) 244/243 · GREW by 8`, `floor 206/205 reproducible` (project-disclosure), from the print.
  // [REC-139] 2026-09-18: MOVED 1414 -> 1422, classified 241 -> 242, corpus 242 -> 243, run 204 -> 205, from this item's own `--strict` print on its committed tree f500a03f (`arms 1422/1414 · classified 242/241 · corpus (suites read) 243/242 · GREW by 8 arm(s)`, `floor 205/204 reproducible`) — the arrival is project-disclosure.test.mjs (8 rows, (a)-(h)).
  // [CONDUCT #5 at REC-136's merge] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1417/1414 · classified 241/241 · corpus (suites read) 242/242 · GREW by 3`, `floor 204/204 reproducible`, from the print; the branch's own 1410 is replaced, never added.
  // [CONDUCT #5 at REC-138's merge] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1414/1407 · classified 241/240 · corpus (suites read) 242/241 · GREW by 7`, `floor 204/203 reproducible` (project-sight), from the print.
  // [CONDUCT #5 at M0-67's merge] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1407/1400 · classified 240/239 · corpus (suites read) 241/240 · GREW by 7`, `floor 203/202 reproducible` (battery-verdict), from the print.
  // [branch record | M0-67] 2026-09-18: 1392 -> 1399 / 238 -> 239 / 239 -> 240 / run 201 -> 202, ALL FOUR from this item's own green --strict run PRINTED AFTER its commit b53c54c5 (`REGISTER FLOOR  arms 1399/1392 · classified 239/238 · corpus (suites read) 240/239 · GREW by 7 arm(s)`, `floor 202/201 reproducible`): battery-verdict.test.mjs (new, four arms) and livefire.test.mjs (one arm added to its declaration). CONDUCT re-reads on the merged tree.
  // [REC-138] 2026-09-18: MOVED 1400 -> 1407, classified 239 -> 240, corpus 240 -> 241, run 202 -> 203, from this item's own `--strict` print on its committed tree a86ad635 (`arms 1407/1400 · classified 240/239 · corpus (suites read) 241/240 · GREW by 7 arm(s)`, `floor 203/202 reproducible`), exit 0. Cause: ONE new suite, project-sight.test.mjs, driven by project-sight.control.mjs (seven arms). ONE KEY SET.
  // [branch record | REC-136, merged with origin/main b4330caf (M0-67)] 2026-09-18: RE-READ, 1407 -> 1410 from the print (`arms 1410/1407 · classified 240/240 · corpus (suites read) 241/241 · GREW by 3 arm(s)`, `floor 203/203 reproducible`), exit 0 — conclude-project's arms (e), (f), (g); every earlier REC-136 figure below is replaced, never added.
  // [CONDUCT #5 at M0-67's merge] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1407/1400 · classified 240/239 · corpus (suites read) 241/240 · GREW by 7`, `floor 203/202 reproducible` (battery-verdict), from the print.
  // [branch record | M0-67] 2026-09-18: 1392 -> 1399 / 238 -> 239 / 239 -> 240 / run 201 -> 202, ALL FOUR from this item's own green --strict run PRINTED AFTER its commit b53c54c5 (`REGISTER FLOOR  arms 1399/1392 · classified 239/238 · corpus (suites read) 240/239 · GREW by 7 arm(s)`, `floor 202/201 reproducible`): battery-verdict.test.mjs (new, four arms) and livefire.test.mjs (one arm added to its declaration). CONDUCT re-reads on the merged tree.
  // [branch record | REC-136, merged with origin/main dd52609b (REC-134)] 2026-09-18: RE-READ on the merged tree, 1400 -> 1403 from the print (`arms 1403/1400 · classified 239/239 · corpus (suites read) 240/240 · GREW by 3 arm(s)`, `floor 202/202 reproducible`), exit 0 — the same three arms (e), (f), (g) of conclude-project.test.mjs; the branch's own pre-merge 1395 is replaced, never added.
  // [branch record | REC-136, on origin/main 7a7cef2d, SUPERSEDED by the line above] 2026-09-18: MOVED 1392 -> 1395 from this item's own `--strict` print (`arms 1395/1392 · classified 238/238 · corpus (suites read) 239/239 · GREW by 3 arm(s)`, `floor 201/201 reproducible`), exit 0. Cause: conclude-project.test.mjs's NEGATIVE CONTROL declaration gained arms (e), (f), (g). ONE KEY SET; CONDUCT re-reads at merge.
  // [CONDUCT #5 at REC-124's merge] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1392/1388 · classified 238/237 · corpus (suites read) 239/238 · GREW by 4`, `floor 201/200 reproducible`, from the print (conclude-project); the branch's own 1376/237/238/200 is replaced, never added.
  // [CONDUCT #5 at REC-132's merge] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1388/1378 · classified 237/236 · corpus (suites read) 238/237 · GREW by 10`, `floor 200/199 reproducible`, from the print (founder-sight); the branch's own 1380/199 is replaced, never added.
  // [CONDUCT #5 at REC-131's merge] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1378/1370 · classified 236/235 · corpus (suites read) 237/236 · GREW by 8`, `floor 199/198 reproducible`, from the print (stats-disclosure.test.mjs's new arms).
  // [branch record | REC-132 on origin/main c1ce709a] MOVED 1370 -> 1380, classified 235 -> 236, corpus 236 -> 237, run 198 -> 199, from this item's own `--strict` print on the committed tree fc08c60a (`arms 1380/1370 · classified 236/235 · corpus (suites read) 237/236 · GREW by 10 arm(s)`, `floor 199/198 reproducible`), exit 0. Cause: ONE new suite, founder-sight.test.mjs, whose declaration names ten arms (a)-(j), run by founder-sight.control.mjs.
  // [branch record | REC-124] 2026-09-18: 1370 -> 1376 / 235 -> 237 / 236 -> 238 / run 198 -> 200, ALL FOUR from this item's own green --strict run PRINTED AFTER its commit 4ae05a57 (`REGISTER FLOOR  arms 1376/1370 · classified 237/235 · corpus (suites read) 238/236 · GREW by 6 arm(s)` and `floor 200/198 reproducible · GREW by 2`), never by adding. The arrival is conclude-project.test.mjs (four ordinal arms, driven by conclude-project.control.mjs, RUN 2026-09-18); the rest of the rise was already on the base (a print of 1372 with the suite uncommitted). CONDUCT re-reads on the MERGED tree.
  // [CONDUCT #5 at REC-126's merge onto REC-128] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1370/1365 · classified 235/234 · corpus (suites read) 236/235 · GREW by 5`, `floor 198/197 reproducible` (reviewcopy.test.mjs and its control); the branch's own 1337/231/232/194 is replaced by this print, never added.
  // [CONDUCT #5 at REC-128's merge onto REC-129] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1365/1359 · classified 234/233 · corpus (suites read) 235/234 · GREW by 6`, `floor 197/196 reproducible` (deliverer.test.mjs and its control), from the print.
  // [CONDUCT #5 at REC-129's merge onto MK-2] 2026-09-18: re-read on the COMMITTED merged tree 9d705bdb — `arms 1359/1346 · classified 233/231 · corpus (suites read) 234/232 · GREW by 13`, `floor 196/194 reproducible` — the two branches' floors (MK-2 1346/231/232/194, REC-129 1345/232/233/195) were each right for their own tree and are REPLACED by this print, never added.
  // [branch record | REC-126 on origin/main 9ea2eb02] MOVED arms 1332 -> 1337, classified 230 -> 231, corpus 231 -> 232, run 193 -> 194, from this item's own post-commit `--strict` print (`arms 1337/1332 · classified 231/230 · corpus (suites read) 232/231 · GREW by 5 arm(s)`, `floor 194/193 reproducible · GREW by 1`). Cause: one new suite, `reviewcopy.test.mjs`, declaring (0) plus four arms (a)-(d), all RUN 2026-09-18 by `test/reviewcopy.control.mjs`. Nothing FELL.
  // [CONDUCT #4 at REC-130's merge] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1332/1318 · classified 230/230 · corpus (suites read) 231/231`, `floor 193/193 reproducible`.
  // [CONDUCT #4 at MK-4's merge onto MK-1] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1327/1314 · classified 230/229 · corpus (suites read) 231/230`, `floor 193/192 reproducible`; 188/188 ops reached, 327/327 checks named.
  // [branch record | REC-130 on origin/main f426f519] MOVED 1314 -> 1318 from this item's own post-commit `--strict` print at 5a3a836c (`arms 1318/1314 · classified 229/229 · corpus (suites read) 230/230 · GREW by 4 arm(s)`, `floor 192/192 reproducible`). Cause: `casesign.test.mjs`'s declaration gained arms (e)-(h). classified, corpus and run UNMOVED — the arms joined an already-counted declaration.
  // [CONDUCT #4 at MK-1's merge, second landing] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1314/1302 · classified 229/227 · corpus (suites read) 230/228`, `floor 192/190 reproducible`.
  // [CONDUCT #4 at REC-125 + REC-127's merge] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1295/1284 · classified 228/226 · corpus (suites read) 229/227`, `floor 191/189 reproducible`.
  // [branch record | MK-1 after CONDUCT #4's (A)/(B), on origin/main 2c4a5c11] MOVED 1281 -> 1292, classified 225 -> 226, corpus 226 -> 227, run 188 -> 189, from the post-commit `--strict` print (`arms 1292/1281 · classified 226/225 · corpus (suites read) 226/225 · GREW by 11`, `floor 189/188 reproducible`). The arrivals: MK-1's own declaration grew from 12 to 18 arms (+6: header, pubbundle, pubcited, pubcase, pubdirect, pubover), and REC-121's `rec121-chain-bytes.test.mjs` came in on main with its declaration (the +1 suite and the other arms). ONE KEY SET. CONDUCT re-reads on the merged tree.
  // [branch record | MK-1, after merging origin/main fbcefa1b] MOVED AGAIN 1276 -> 1281, classified 224 -> 225, corpus 225 -> 226, run 187 -> 188, from the merged tree's own post-commit `--strict` print (`arms 1281/1276 · classified 225/224 · corpus (suites read) 226/225 · GREW by 5`, `floor 188/187 reproducible`). The +5/+1/+1/+1 is NOT MK-1's: it is REC-123's `test/machine-attest.test.mjs`, which arrived on main without this key moving — a floor with slack is not one, so it is moved here and NAMED rather than left for the next reader to find.
  // [CONDUCT #4 at REC-121's merge] 2026-09-18: re-read on the merged tree — `--strict` exit 0 printed `arms 1269/1264 · classified 224/223 · corpus (suites read) 225/224` and `floor 187/186 reproducible`.
  // [MK-1 at its second merge, origin/main 2c4a5c11] ONE KEY SET, collapsed: main's 1269 is REC-123's +5 on 1264 (the move MK-1 named above); MK-1's own suite adds 12 on top, so the merged figure is 1281, re-read from the merged tree's post-commit print before pushing.
  // [CONDUCT #4 at LED-2's merge] 2026-09-18: re-read on the COMMITTED merged tree — `arms 1284/1279 · classified 226/225 · corpus (suites read) 227/226`, `floor 189/188 reproducible`.
  // [CONDUCT #4 at REC-121's merge] 2026-09-18: re-read on the merged tree — `--strict` exit 0 printed `arms 1269/1264 · classified 224/223 · corpus (suites read) 225/224` and `floor 187/186 reproducible`.
  // [branch record | LED-2 after merging origin/main at 37cbc810] re-read on the MERGED tree: `--strict` exit 0 printed `arms 1279/1274 · classified 225/224 · corpus (suites read) 226/225 · GREW by 5 arm(s)` and `floor 188/187 reproducible` — the +5 / +1 / +1 / +1 is REC-123's `test/machine-attest.test.mjs`, which main integrated without moving this floor.
  // [branch record | LED-2 read arms 1274 on its own tree] LED-2, 2026-09-18: 1264 -> 1274 / 223 -> 224 / 224 -> 225 / run 186 -> 187, ALL FOUR from THIS item's own green --strict run PRINTED AFTER its commit 612860fe (`REGISTER FLOOR  arms 1274/1264 · classified 224/223 · corpus (suites read) 225/224 · GREW by 10 arm(s)` and `floor 187/186 reproducible · GREW by 1`), never by adding. The arrival is ONE suite, `test/ledger.test.mjs` (ten ordinal arms, driven by `test/ledger.control.mjs`, RUN 2026-09-18). CONDUCT re-reads on the MERGED tree.
  // [MK-1 at its fourth merge, origin/main 442c01f4] ONE KEY SET, collapsed again: main carries 1284 (LED-2's ledger suite on top of REC-121/REC-123); MK-1's suite adds its 18 arms on top; the key is set from the merged tree's own post-commit print, not from this sum: `arms 1302/1292 · classified 227/226 · corpus (suites read) 228/227 · GREW by 10`, `floor 190/189 reproducible` — the +10/+1/+1/+1 is LED-2's `test/ledger.test.mjs`, so ALL FOUR keys move to 1302/227/228/190.
  // [CONDUCT #4 at REC-100's merge] 2026-09-18: re-read on the merged tree — `--strict` exit 0 printed `arms 1264/1262 · classified 223/223 · corpus (suites read) 224/224` and `floor 186/185 reproducible`.
  // [branch record | MK-1, 2026-09-18] MOVED 1264 -> 1276, classified 223 -> 224, corpus 224 -> 225, run 186 -> 187, from the figures a green `--strict` run PRINTED AFTER COMMITTING (`arms 1276/1264 · classified 224/223 · corpus (suites read) 225/224 · GREW by 12`, `floor 187/186 reproducible · GREW by 1`), never by adding. The whole growth is ONE new suite, `test/testify.test.mjs`, whose declaration states TWELVE arms — a baseline plus eleven, driven by `test/nc-mk1.mjs` and every one RUN. ONE KEY SET. CONDUCT re-reads this on the MERGED tree (MK-4 is landing beside it).
  // [CONDUCT #4 at REC-87 + CPDF-18's merge] 2026-09-18: re-read on the merged tree — `--strict` exit 0 printed `arms 1262/1243 · classified 223/220 · corpus (suites read) 224/221` and `floor 185/184 reproducible`.
  // [CONDUCT #4 at REC-120's merge] 2026-09-18: re-read on the merged tree (REC-104 + BOB's construct-status + REC-120) — `--strict` exit 0 printed `arms 1243/1234 · classified 220/218 · corpus (suites read) 221/219` and `floor 184/182 reproducible`.
  // [CONDUCT #4 at REC-104's merge] 2026-09-18: re-read on the merged tree — `--strict` exit 0 printed `arms 1234/1226 · classified 218/217 · corpus (suites read) 219/218` and `floor 182/181 reproducible`; REC-104 left the move to CONDUCT on purpose (its own tree printed 1234/1215).
  // [CONDUCT #4 at the merge of CPDF-19 onto REC-86/CAP-10/FW-19] 2026-09-18: RE-READ ON THE MERGED TREE, as both branch records asked — `node scripts/coverage.mjs --strict` exit 0 printed `arms 1226/1217 · classified 217/215 · corpus (suites read) 218/216` and `floor 181/178 reproducible`; the branches' own 1215 and 1217 were each true of a tree without the other's suites.
  // [branch record | REC-86 read arms 1215 on its own tree] REC-86, 2026-09-18: 1194 -> 1215 / 212 -> 215 / 213 -> 216 / run 176 -> 178,
  // [branch record | REC-86 read arms 1215 on its own tree] ALL FOUR MOVED IN THE SAME TURN, read from THIS item's own green --strict run
  // [branch record | REC-86 read arms 1215 on its own tree] PRINTED AFTER its commit f0072e3d (`REGISTER FLOOR  arms 1215/1194 - classified
  // [branch record | REC-86 read arms 1215 on its own tree] 215/212 - corpus (suites read) 216/213 - GREW by 21` and `178 RUN - floor
  // [branch record | REC-86 read arms 1215 on its own tree] 178/176`), never by adding. THE SPLIT IS MEASURED: the same run BEFORE the
  // [branch record | REC-86 read arms 1215 on its own tree] commit (the suite then in no commit, so not counted) printed reproducible
  // [branch record | REC-86 read arms 1215 on its own tree] `arms 1208 - classified 214 - corpus 215` and `run 177` at HEAD 92f4c64e — so
  // [branch record | REC-86 read arms 1215 on its own tree] +14 / +2 / +2 / +1 WAS ALREADY SLACK at this item's base, and +7 / +1 / +1 /
  // [branch record | REC-86 read arms 1215 on its own tree] +1 is `test/narrow.test.mjs` (eight arms, driven by `test/nc-rec86.mjs`, RUN
  // [branch record | REC-86 read arms 1215 on its own tree] 2026-09-18). ONE KEY SET, grepped after writing: `^  arms:` matches TWICE in
  // [branch record | REC-86 read arms 1215 on its own tree] this file, here and FLEET_FLOOR (76, unmoved). CONDUCT re-reads on the MERGE.
  // [branch record | CPDF-19 read these on its own tree after rebasing onto 7ed94d64] CPDF-19, 2026-09-18: 1194 -> 1217 / 212 -> 215 / 213 -> 216 / run 176 -> 178, each from its own green --strict print (reextract.test.mjs adds 8 arms; the rest is growth other items left unmoved). CONDUCT re-reads on the MERGED tree.
  // [branch record | REC-116 read arms 1194 on its own tree] REC-116, 2026-09-17: 1173 -> 1194 / 208 -> 212 / 209 -> 213 / run 171 -> 176,
  // [branch record | REC-116 read arms 1194 on its own tree] ALL FOUR MOVED IN THE SAME TURN and every one taken from the figure THIS
  // [branch record | REC-116 read arms 1194 on its own tree] item's own green --strict run PRINTED, never by adding to the number in the
  // [branch record | REC-116 read arms 1194 on its own tree] file: `REGISTER FLOOR  arms 1194/1173 - classified 212/208 - corpus (suites
  // [branch record | REC-116 read arms 1194 on its own tree] read) 213/209 - GREW by 21 arm(s)` and `176 RUN (dated token) - floor
  // [branch record | REC-116 read arms 1194 on its own tree] 176/171 reproducible - GREW by 5`. The arrivals are THREE files, not one:
  // [branch record | REC-116 read arms 1194 on its own tree] `test/rec116-route-marked.test.mjs` (the driven suite, one declaration with
  // [branch record | REC-116 read arms 1194 on its own tree] six arms), `test/nc-rec116.mjs` and `test/nc-rec116-plan.mjs` (the two
  // [branch record | REC-116 read arms 1194 on its own tree] drivers). corpus and classified BOTH move because a whole SUITE arrived,
  // [branch record | REC-116 read arms 1194 on its own tree] unlike REC-114's arm joining an already-counted declaration. ONE KEY SET,
  // [branch record | REC-116 read arms 1194 on its own tree] grepped BEFORE and AFTER writing: `^  arms:` matches TWICE in this file,
  // [branch record | REC-116 read arms 1194 on its own tree] here and in FLEET_FLOOR (76), which is UNMOVED along with the rest of the
  // [branch record | REC-116 read arms 1194 on its own tree] fleet floors (3 members / 6 ops / 8 suites / 76 arms, read EXACT this run).
  // [branch record | REC-116 read arms 1194 on its own tree] Provenance on that run: `229 of 229 discovered item(s) are in the commit at
  // [branch record | REC-116 read arms 1194 on its own tree] HEAD`, so no phantom suite inflated the corpus. Nothing FELL.
  // [branch record | REC-114 read arms 1173 on its own tree]  REC-114, 2026-09-17: 1148 -> 1173 / 204 -> 208 / 205 -> 209 / run 167 -> 171,
  // [branch record | REC-114 read arms 1173 on its own tree] ALL FOUR MOVED IN THE SAME TURN and every one taken from the figure THIS
  // [branch record | REC-114 read arms 1173 on its own tree] ITEM'S OWN GREEN `--strict` RUN PRINTED AFTER COMMITTING (`arms 1173/1148 ·
  // [branch record | REC-114 read arms 1173 on its own tree] classified 208/204 · corpus 209/205 · GREW by 25 arm(s)` and `171 RUN ·
  // [branch record | REC-114 read arms 1173 on its own tree] floor 171/167 reproducible · GREW by 4`), never by adding to the numbers
  // [branch record | REC-114 read arms 1173 on its own tree] above. Provenance at HEAD 71749407, 225/225 discovered items in the commit.
  // [branch record | REC-114 read arms 1173 on its own tree] THIS ITEM ADDED TWO SUITES (`test/rec114-leg-earned.test.mjs`, whose
  // [branch record | REC-114 read arms 1173 on its own tree] declaration states FIVE arms driven by `test/nc-rec114.mjs`), so at most
  // [branch record | REC-114 read arms 1173 on its own tree] +2 corpus is THIS item's. **THE REST OF THE +25/+4 WAS ALREADY SLACK WHEN
  // [branch record | REC-114 read arms 1173 on its own tree] THIS ITEM ARRIVED** — the tree at 7ebe2dd1 carried suites whose floor was
  // [branch record | REC-114 read arms 1173 on its own tree] never moved for them (CONDUCT #3 gated `df6795`-era `df4fb394` and pushed
  // [branch record | REC-114 read arms 1173 on its own tree] 7ebe2dd1, which added `test/rowsubstrate.test.mjs`), so this is the sixth
  // [branch record | REC-114 read arms 1173 on its own tree] consecutive item to find a floor stale BY MEASURING IT rather than by being
  // [branch record | REC-114 read arms 1173 on its own tree] told. Nothing FELL. ONE KEY SET, grepped after writing: `^  arms:` matches
  // [branch record | REC-114 read arms 1173 on its own tree] TWICE in this file, once here and once in the fleet object at the foot.
  // [branch record | REC-114 read arms 1173 on its own tree] CONDUCT re-reads this on the MERGED tree — these figures are true of this
  // [branch record | REC-114 read arms 1173 on its own tree] branch and of no other.
  // [branch record | REC-96 read arms 1134 on its own tree]  REC-96, 2026-09-17: 1129 -> 1134 / 201 -> 202 / 202 -> 203, ALL THREE MOVED IN
  // [branch record | REC-96 read arms 1134 on its own tree] THE SAME TURN and every one taken from the figure THIS ITEM'S OWN GREEN RUN
  // [branch record | REC-96 read arms 1134 on its own tree] PRINTED after committing (`arms 1134/1129 · classified 202/201 · corpus
  // [branch record | REC-96 read arms 1134 on its own tree] 203/202 · GREW by 5 arm(s)`), never by adding to the numbers above. One new
  // [branch record | REC-96 read arms 1134 on its own tree] suite, `test/casesearched.test.mjs`, whose declaration states FIVE arms — a
  // [branch record | REC-96 read arms 1134 on its own tree] baseline plus four, driven by `test/casesearched.control.mjs` and every one
  // [branch record | REC-96 read arms 1134 on its own tree] RUN — so `corpus` and `classified` each rise by one and `arms` by five.
  // [branch record | REC-96 read arms 1134 on its own tree] ONE KEY SET, grepped after writing: `^  arms:` matches TWICE in this file,
  // [branch record | REC-96 read arms 1134 on its own tree] once here and once in an unrelated object at the foot; this block has one.
  // [branch record | REC-96 read arms 1134 on its own tree] THE FIGURE WAS TAKEN AFTER THE COMMIT ON PURPOSE: before it, the register
  // [branch record | REC-96 read arms 1134 on its own tree] reported the suite as NOT IN ANY COMMIT and refused to count work no other
  // [branch record | REC-96 read arms 1134 on its own tree] checkout can see (D-238), so a floor moved then would have been a figure
  // [branch record | REC-96 read arms 1134 on its own tree] nobody else reproduces. CONDUCT re-reads this on the MERGED tree. 
  // [D-430] 2026-09-18: MOVED 1443 -> 1447, classified 245 -> 246, corpus 246 -> 247, run 208 -> 209, from this item's own `--strict` print on its COMMITTED MERGE with origin/main (REC-143 in) `86cc1111` (`arms 1447/1443 · classified 246/245 · corpus (suites read) 247/246 · GREW by 4`, `floor 209/208 reproducible`); its earlier reads (1434 at `1b096956`, 1441 at `0b5d1ff2`) are replaced, never added. One new suite, `pipeline-readers.test.mjs`, declaring four arms (NC1–NC4). Nothing FELL.
  classified: 250,
  corpus: 251,
  /* AND THE `run` KEY BELOW ARRIVED IN THE SAME MERGE AS A FLOOR COLLISION, which is
     why this block reads as it does. M0-42 moved arms 1093 -> 1097 from ITS OWN green
     print while this tree already carried REC-91's 1100 — two correct readings, neither
     true of the merge. The three FIGURES are resolved to this tree's and RE-READ from the
     merged run's own post-commit print below; the `run` key is NOT part of that collision,
     it is a pure ADDITION and is kept whole with its reasoning. Taking one side of this
     file wholesale would have dropped it, which is REC-69's defect exactly. */
  /* M0-42's key, and it is a RATCHET ON A CLAIM rather than on a capability, which
     is why it is floored at what the estate ALREADY HELD rather than at a target.
     Measured 2026-09-16 on this tree: 164 of 198 declarations already carried a
     dated run token in prose and NO INSTRUMENT READ ONE, so the 34 that carried
     nothing were invisible beside them. The floor catches a token being REMOVED —
     the only direction this figure can fall, exactly as `arms` can only fall by an
     edit. **It is deliberately NOT a requirement that every declaration carry one:
     a gate that failed 34 honest suites on the day it landed would be switched off,
     and a register nobody runs measures nothing.** The 34 are NAMED instead.

     MOVED 164 -> 165 on 2026-09-17 by REC-107, from the figure a green `--strict` run
     PRINTED, and the ATTRIBUTION is the part worth keeping: **this floor was ALREADY
     STALE at that item's base commit `1234095a` and the growth is NOT that item's.**
     Measured both ways rather than assumed — the item copied its four changed files
     aside, put HEAD's own versions back, re-ran `--strict`, and read `165 RUN ... floor
     165/164 ... GREW by 1` on a tree carrying none of its work; then restored its files
     and verified each by sha256 AND by `cmp`. Both runs also read `arms 1129/1129`
     EXACT, so nothing about that item moved either figure. It is the sixth consecutive
     item to find a floor already stale BY MEASURING IT, which is the argument for
     measuring rather than for trusting the number in the file. */
  run: 213,
};

/* THE UNCLASSIFIED CEILING, pinned BY NAME rather than by count. A suite whose
   declaration the detector cannot count arms in is not a failure — the register
   states plainly what it cannot see — but a NEW one is, because that is the
   D-233 defect arriving again. Each name carries why it cannot be counted.

   `case-opened.test.mjs` — its head declaration is a pointer, and the fuller
   block at the foot of the file separates its marker from its arms with a
   paragraph of prose, which the extent rule (a declaration is a paragraph, plus
   the list it introduces) deliberately does not cross. */
const REGISTER_UNCLASSIFIED = ["case-opened.test.mjs"];

/* ------------------------------------------------------------------ fleet */
/* D-117: the topology decision (I6) puts Workers BESIDE the plane. `coverage.mjs`
   read only the plane's OPS table, so the day a second Worker ships its surface
   is uncounted and the figure stays flat while a whole component goes untested —
   wrong in the generous direction, the one failure this instrument exists to
   prevent. A fleet member declares itself with a `fleet-member.json` at its root;
   members are DISCOVERED, never hand-listed, so a new one cannot escape the count
   by not being mentioned (the same lesson as the OPS table above). Each is held
   to the plane's own two behavioural surfaces: every surface op reached by one of
   the member's suites, and a declared negative control. (Checks are the plane's
   conformance catalog; a fleet member has none, so that surface is N/A to it.) */
function readJSON(p) { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } }
function readText(p) { try { return readFileSync(p, "utf8"); } catch { return ""; } }

/* A surface op is REACHED if a member suite names it path- or string-shaped
   (`/structure`, `"structure"`), the fleet analog of the plane's call-shaped
   matcher — a bare word in a comment does not count. */
const surfaceCalled = (op, src) =>
  new RegExp(`[/"'\`]${op}(?=[?"'\`&/\\s]|$)`).test(src);

/* ---- VF-3, 2026-08-08 (FL-2's turn). D-117 WAS RESOLVED; THIS KEEPS IT TRUE.
 *
 * The walk above discovers members by `fleet-member.json`, which is the right
 * mechanism and had one hole big enough to drive the original defect back
 * through: **DISCOVERY IS THE ONLY EVIDENCE, so a member that stops declaring
 * itself stops existing.** Delete or rename a manifest and the fleet count
 * silently falls, `--strict` passes, and the figure reads exactly as it did
 * before the member was ever written — which is D-117's own sentence: *a whole
 * component goes untested while coverage reports the same percentage*, wrong in
 * the generous direction. That is VF-3's named control and the instrument had no
 * answer to it.
 *
 * Four gates close it, and none of them is a hand-kept list of members:
 *
 *  (1) EVERY WORKER DIRECTORY IS ACCOUNTED FOR. A directory carrying a
 *      `wrangler.jsonc` IS a Worker — that file is what deploys it, and
 *      `CLAUDE.md` requires every one of them to pin `account_id`. So each must
 *      either be the plane (measured in full above), be NAMED here as
 *      deliberately not a fleet member, or declare a `fleet-member.json`. Hiding
 *      a manifest now FAILS rather than shrinking the fleet, because the
 *      `wrangler.jsonc` is still there and the directory is still a Worker. The
 *      named set below is a DECISION SURFACE and not a coverage list: a new
 *      Worker appearing in this repository fails `--strict` until somebody says
 *      which of the two it is, which is the outcome worth having.
 *  (2) A FLOOR ON THE FLEET. (1) cannot see a whole directory deleted, and a
 *      count with no floor is not a ratchet. Both figures below are the ones
 *      this instrument PRINTED on a green run — never a number added to the
 *      previous number. Move them WITH the fleet, in the same turn.
 *  (3) A MEMBER WITH NO READABLE SURFACE FAILS. It used to report `0/0 ops
 *      reached` and a WARNING, and PASS: 0 unreached out of 0 is the emptiest
 *      possible green. Renaming a `SURFACE` table was enough to go dark.
 *  (4) FLEET RULE 2, STRUCTURALLY. `PARALLELISM.md`: *"A fleet member ASSERTS
 *      nothing. It returns derived output and writes nothing."* A member
 *      declaring a `mutating: true` surface op has left the fleet contract, and
 *      that is now a gate rather than a convention somebody remembers. */
const NOT_A_FLEET_MEMBER = {
  "bio-plane": "the plane itself — its OPS table, checks and controls are measured in full above.",
  "newgroup":  "the INSTALLER. It installs the fleet (D-115) and is not in it; it holds no surface the plane calls.",
};

const FLEET_FLOOR = {
  /* VF-1, 2026-08-09, from the figures a green `--strict` run PRINTED once the
     fleet's controls were read at the SUITE grain — never counted by hand.
     `suites` is the fleet's REACH (pdf-worker: pdf-worker + pagepixels;
     agent-worker: agent-worker + harness), `arms` its tally: 7 + 7 + 12 + 9.
     Move both only UPWARD and only to a printed figure, and a fall needs its
     reason AT THIS SITE.
     MOVED 2026-08-09 by VF-5: 4 -> 5 suites, 35 -> 43 arms, from the figure a
     green `--strict` run PRINTED (`5/5 SUITES declaring a negative control · 43
     arms · GREW by 8 arm(s)`). **THIS FLOOR WAS ALREADY STALE ON `origin/main`
     AND VF-5 DID NOT INVALIDATE IT** — measured at `ae34ec8` in a scratch
     checkout before this item's own suite existed, where it printed the same
     `GREW by 8`. FL-5 landed `agent-worker/test/fanout.test.mjs` and its arms;
     `REGISTER_FLOOR` above was moved for that merge and this one was not, so the
     fleet half of the ratchet has been carrying eight arms of slack. **A floor
     with slack is not one**, which is why VF-5 moved a figure it did not itself
     invalidate rather than leaving it for the next reader to find again — the
     sixth consecutive item to find a hand-carried floor stale by measuring it.
     Named in the report so CONDUCT can re-read it on the merged tree. */
  /* MOVED 2026-09-12 by CPDF-10: 2 -> 3 members, 4 -> 6 surface ops, 5 -> 6
     suites, from the figures a green `--strict` run PRINTED on this branch
     (`FLEET  3 members beside the plane · 6/6 surface ops reached · 6/6 SUITES
     declaring a negative control · 64 arms`). The third member is `ocr-worker`,
     the Tier-3 OCR path; its two surface ops are `transcribe` and `version` and
     its one suite is `ocr-worker/test/ocr-worker.test.mjs`. Named in the report
     so CONDUCT re-reads all four on the merged tree. */
  members: 3,
  surfaceOps: 6,
  /* 6 -> 7 AT CPDF-10's OWN MERGE, and this one is NOT this item's: FL-6 landed
     `agent-worker/test/cascade.test.mjs` on `main` without moving this key, so
     the merged tree printed `7/7 SUITES declaring a negative control` against a
     floor of 6. A floor with slack is not one, and it is moved here rather than
     left for the next reader — the same reasoning VF-5 and FL-9 each recorded
     when they moved a figure they had not invalidated. */
  /* MOVED 2026-09-13 by D-323: 7 -> 8, from the figure a green `--strict` run
     PRINTED on this branch AFTER the commit (`FLEET  3 members beside the plane
     · 6/6 surface ops reached · 8/8 SUITES declaring a negative control · 73
     arms`), with provenance `190 of 190 discovered item(s) are in the commit at
     HEAD (f217895)`. **Read after the commit deliberately**: the pre-commit
     print named `agent-worker/test/wire-vocabulary.test.mjs` as NOT IN ANY
     COMMIT and refused to let its figures be quoted, which is D-238 doing its
     job. The eighth suite is that file — the empty-run instrument's candidate
     driven through the plane's own validation expressions with no mock in it.
     **THE FLOOR WAS EXACTLY RIGHT WHEN THIS ITEM FOUND IT: zero slack** on both
     keys, measured and said either way, because the practice is to trust the
     measurement and not the streak of stale floors this comment records. */
  suites: 8,
  /* RESTORED AT INTEGRATION 2026-08-09 by CONDUCT. This key was DROPPED by my own
     conflict resolution on the D-277 merge, and the loss was SILENT: with no `arms`
     the comparison reads `48 < undefined`, which is false, so `--strict` stayed at
     exit 0 while the fleet-arms ratchet had stopped existing. A ratchet that cannot
     fail is a decoration. Set to the figure a green run PRINTED on the merged tree. */
  /* MOVED 2026-09-10 by FL-9: 48 -> 58 arms, from the figure a green `--strict` run PRINTED on
     this branch (`FLEET  2 members beside the plane · 4/4 surface ops reached · 5/5 SUITES
     declaring a negative control · 58 arms · ... · GREW by 10 arm(s)`), with provenance
     `175 of 175 discovered item(s) are in the commit at HEAD (d83695b)`.
     **THIS FLOOR WAS ALREADY STALE BEFORE FL-9 TOUCHED ANYTHING, AND FL-9 DID NOT INVALIDATE
     IT** — this item added NO fleet member, NO fleet suite and NO fleet arm, and edited no file
     under `agent-worker/test/` or `pdf-worker/test/`; its own guard is a PLANE suite, counted in
     `REGISTER_FLOOR` above. The fleet's five suites state 17 + 8 + 19 + 7 + 7 = 58 arms on a tree
     this item did not change there, so the ratchet has been carrying TEN arms of slack. **A floor
     with slack is not one**, which is why this moves a figure it did not itself cause rather than
     leaving it for the next reader to find again — VF-5's own reasoning, and the seventh
     consecutive item here to find a hand-carried floor stale by measuring it. `members`,
     `surfaceOps` and `suites` are UNMOVED at 2 / 4 / 5. Named in FL-9's report so CONDUCT
     re-reads it on the merged tree. */
  /* MOVED 2026-09-12 by CPDF-10: 58 -> 64 arms, from the same printed run as the
     three figures above (`64 arms · GREW by 6 arm(s)`). The six are
     `ocr-worker.test.mjs`'s, and unlike the last two moves of this key THIS ONE
     IS NOT SLACK BEING SWEPT UP: the fleet's other five suites are unchanged by
     this item and still state 58 between them, so the ratchet was exactly right
     when this item found it — measured, and said either way, because the
     practice is to trust the measurement rather than the streak.
     THEN 64 -> 68 AT THIS ITEM'S MERGE, and that step has a DIFFERENT cause:
     FL-6 landed `agent-worker/test/cascade.test.mjs` (four arms) on `main`
     without moving this key, so the merged tree printed `68 arms · GREW by 4`.
     This item did not invalidate those four and moves them anyway, for the
     reason VF-5 and FL-9 each recorded when they did the same. Read from the
     merged tree's own print, never summed by hand. **ONE `arms:` KEY IN THIS
     TABLE, grepped after writing.** */
  /* MOVED 2026-09-13 by D-323: 68 -> 73 arms, from the same post-commit printed
     run as `suites` above (`73 arms · GREW by 5 arm(s)`). The five are
     `wire-vocabulary.test.mjs`'s: baseline, the colon restored, a kind §9 does
     not hold, over-strictness, and the permissive mock restored. **NOT SLACK
     BEING SWEPT UP, and that is measured rather than assumed:** the fleet's
     other seven suites are unchanged in arm COUNT by this item — their arms were
     re-declared, not added to — and still state 68 between them, so the ratchet
     was carrying nothing when this item arrived. Said plainly because five of
     the last eight moves of this key were sweeping up somebody else's slack and
     a reader is entitled to know which kind this one is. **ONE `arms:` KEY IN
     THIS TABLE, grepped after writing.** */
  /* MOVED 2026-09-14 by FLEET (SK-8's delegation, worktree bio-worktrees/FLEET):
     73 -> 76 arms, from a green POST-COMMIT `--strict` run — `76 arms · floor
     … 73 arm(s) · GREW by 3 arm(s)`, `provenance: 209 of 209 discovered item(s)
     are in the commit at HEAD (3a9523b)`, exit 0 read unpiped. THE THREE ARE
     THIS ITEM'S OWN AND NOT SLACK, measured: E1, E2 and E3 in
     `agent-worker/test/harness.test.mjs`'s declaration (the extract row flipped
     without the record; the row removed with the record still naming it; the
     landed state as the over-strictness arm), each run from
     `harness.control.mjs` with the tallies in the declaration. The other seven
     fleet suites are unchanged in arm count. **ONE `arms:` KEY IN THIS TABLE,
     grepped after writing.** */
  arms: 76,
};

function discoverFleet() {
  const members = [];
  /* M0-16: `!name.startsWith(".")`, ADDED HERE, and it is a correction rather
     than a tidy-up. `scripts/battery.mjs`'s fleet walk has always carried this
     filter and this one did not, so this instrument could ENROL A MEMBER THE
     RUNNER IT REPORTS ON WOULD NEVER RUN — a manifest under any dot-directory,
     and `.claude/worktrees/` (sixty checkouts of this same repository) is a
     dot-directory that is also GITIGNORED. Coverage credited from a source read
     while the battery never executed a line of it is D-117's failure exactly,
     one directory out, and in the generous direction. The two walks now agree;
     measured before and after on this tree, the fleet is 2 members either way. */
  for (const name of readdirSync(REPO).filter((d) => !d.startsWith("."))) {
    const meta = readJSON(join(REPO, name, "fleet-member.json"));
    if (!meta) continue;
    const dir = join(REPO, name);
    const surfBody = tableBody(readText(join(dir, meta.entry || "src/index.mjs")), meta.surface || "SURFACE");
    /* The name matcher stays LOOSE so a row written in a spelling this walk did
       not anticipate is still counted; the brace body is read separately, and a
       row whose declaration cannot be read is REPORTED as unreadable rather than
       quietly treated as non-mutating. Silence about a shape is not evidence
       about it. */
    const surfaceOps = surfBody
      ? [...surfBody.matchAll(/^\s{2}([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(\{[^}]*\})?/gm)]
          .map((m) => ({ op: m[1], decl: m[2] || null }))
      : [];
    let suites = [];
    try { suites = readdirSync(join(dir, meta.testDir || "test")).filter((f) => f.endsWith(".test.mjs")); } catch { /* none */ }
    const suiteSrcs = suites.map((f) => ({ file: f, src: readText(join(dir, meta.testDir || "test", f)) }));
    const allSuiteText = suiteSrcs.map((s) => s.src).join("\n");
    /* VF-1, 2026-08-09 — THIS WAS `suiteSrcs.some(...)` AND THE OLD RULE IS
       CORRECTED HERE RATHER THAN EXEMPTED, because it was measured wrong rather
       than reasoned wrong. `some` means A MEMBER counts as controlled when ANY
       ONE of its suites declares, so `agent-worker/test/harness.test.mjs` —
       FL-3/IS-9, the suite that OWNS VF-1's owed control 7 — could stop
       declaring a negative control entirely while this instrument printed
       `2/2 declaring a negative control` and `control declared` beside the
       member's name. MEASURED, not reasoned: hiding that declaration on
       2026-08-09 left `--strict` at EXIT 0 with every figure unmoved. VF-1's
       own accepts-when is *"every IS suite declaring · an undeclared IS suite
       would be its first regression"*, and for the one IS suite that lives in
       the fleet that sentence was FALSE. The unit is the SUITE, here as it is
       for the plane's 134. */
    const suiteControls = suiteSrcs.map((s) => {
      const c = readControl(s.src);
      return { file: s.file, declared: c != null, arms: c ? c.arms : null };
    });
    const ops = surfaceOps.map(({ op, decl }) => ({
      op,
      reached: surfaceCalled(op, allSuiteText),
      mutating: decl == null ? null : /mutating:\s*true/.test(decl),
    }));
    members.push({ name: meta.name || name, dir: name, ops, suiteControls, suites: suites.length, hasSurface: surfBody != null,
      /* M0-16: the paths this walk was ADMITTED BY and the paths it READ, kept so
         their provenance can be asked. The manifest is the larger hole of the two
         because it enrols a whole DIRECTORY rather than one file. */
      manifestPath: join(REPO, name, "fleet-member.json"),
      suitePaths: suites.map((f) => join(dir, meta.testDir || "test", f)) });
  }
  return members;
}
const fleet = discoverFleet();
const fleetUnreached = fleet.flatMap((m) => m.ops.filter((o) => !o.reached).map((o) => ({ member: m.name, op: o.op })));
/* VF-1: the fleet's own register, at the SUITE grain the plane's is measured at.
   THERE IS EXACTLY ONE IMPLEMENTATION OF THIS RULE, and that is deliberate. The
   first draft of this change left the old member-level `control` flag in place
   beside the new suite-level walk, and the arm written to prove the fix — putting
   the old `some()` back — CAME BACK GREEN, because nothing read the flag any
   more. A second copy of a rule absorbs the control that was meant to prove the
   first: IS-6's C-22.4 arm was green at 98/98 for exactly this reason. The flag
   is deleted rather than kept for compatibility. */
const fleetSuiteRows = fleet.flatMap((m) => m.suiteControls.map((s) => ({ member: m.name, dir: m.dir, ...s })));
const fleetSuitesUndeclared = fleetSuiteRows.filter((s) => !s.declared);
const fleetSuitesClassified = fleetSuiteRows.filter((s) => typeof s.arms === "number");
const fleetSuitesUnclassified = fleetSuiteRows.filter((s) => s.declared && s.arms == null);
const fleetArms = fleetSuitesClassified.reduce((n, s) => n + s.arms, 0);
const fleetSurfaceOps = fleet.reduce((n, m) => n + m.ops.length, 0);
/* (3) — no readable surface table, or a table with nothing in it. */
const fleetSurfaceless = fleet.filter((m) => !m.hasSurface || m.ops.length === 0);
/* (4) — fleet rule 2. `null` is an unreadable declaration and is treated as a
   violation, not as a pass: an instrument that cannot read a shape must not
   report it as conformant. */
const fleetMutating = fleet.flatMap((m) => m.ops.filter((o) => o.mutating !== false)
  .map((o) => ({ member: m.name, op: o.op, mutating: o.mutating })));
/* (1) — every Worker directory accounted for. */
const declaredDirs = new Set(fleet.map((m) => m.dir));
const unaccountedWorkers = readdirSync(REPO)
  .filter((name) => !name.startsWith(".") && readText(join(REPO, name, "wrangler.jsonc")) !== "")
  .filter((name) => !declaredDirs.has(name) && !(name in NOT_A_FLEET_MEMBER));
/* (2) — the floor. */
const fleetBelowFloor = [];
if (fleet.length < FLEET_FLOOR.members)
  fleetBelowFloor.push(`${fleet.length} fleet member(s) discovered, floor is ${FLEET_FLOOR.members}`);
if (fleetSurfaceOps < FLEET_FLOOR.surfaceOps)
  fleetBelowFloor.push(`${fleetSurfaceOps} fleet surface op(s) enumerated, floor is ${FLEET_FLOOR.surfaceOps}`);
/* VF-1: the same ratchet the plane's register carries, one directory over. A
   count of declaring suites with no floor cannot see a SUITE DELETED — the
   remaining ones still all declare and `4/4` becomes `3/3`, which reads greener
   than before. The arms floor is what makes a declaration that got SHORTER
   visible; both figures are what a green run PRINTED. */
if (fleetSuiteRows.length < FLEET_FLOOR.suites)
  fleetBelowFloor.push(`${fleetSuiteRows.length} fleet suite(s) read, floor is ${FLEET_FLOOR.suites}`);
if (fleetArms < FLEET_FLOOR.arms)
  fleetBelowFloor.push(`${fleetArms} fleet control arm(s) stated, floor is ${FLEET_FLOOR.arms}`);

/* ------------------------------- VF-1: the register's reach, stated in full */
/* THE CLASS SWEEP THAT CAME OUT OF THE FLEET HOLE, and it is REPORTED rather
 * than GATED, deliberately.
 *
 * The defect above was not "the fleet walk used `some`". The KIND is **an
 * instrument whose REACH is narrower than the claim it prints** — a set of
 * suites held to a weaker rule than its siblings, so a component can go quiet
 * without moving a figure. Asking where else that is true found two more
 * directories of suites that NO instrument in this repository holds to a
 * declared control, and the numbers are printed here rather than written into a
 * document, because a hand-carried figure goes stale silently and that is this
 * project's most-repeated finding.
 *
 * WHY IT IS NOT A GATE. These suites belong to other areas (`civicos-ui` is UI's,
 * `newgroup` is DIST's and is out of bounds without an explicit instruction).
 * Turning their state into a `--strict` failure would fail every honest run until
 * another area does work it has not been asked for, and a gate that fails honest
 * runs gets switched off — VERIFICATION.md's own stated reason for what `--strict`
 * does and does not enforce. A fence tighter than its rule is not a safer fence.
 * So: MEASURED, NAMED, and put in front of whoever runs this, which is the loop
 * the reader actually runs.
 *
 * WHAT THIS WALK CANNOT SEE, stated plainly: it reads `*.test.mjs` only, so a
 * suite in another spelling is invisible to it, and it says nothing about whether
 * a declared control was ever RUN — that is the owner's own measured figure and
 * no matcher can supply it. */
const OTHER_SUITE_DIRS = [
  ["civicos-ui/test", "UI's harness suites — run by `node civicos-ui/test/run.mjs`, never by the battery"],
  ["newgroup/test",   "the INSTALLER's suites — DIST's, out of bounds without an explicit instruction"],
];
const otherDirs = OTHER_SUITE_DIRS.map(([dir, why]) => {
  let files = [];
  try { files = readdirSync(join(REPO, dir)).filter((f) => f.endsWith(".test.mjs")).sort(); } catch { /* absent */ }
  const rows = files.map((f) => ({ file: f, control: readControl(readText(join(REPO, dir, f))) }));
  return { dir, why, total: files.length,
    declaring: rows.filter((r) => r.control).length,
    unclassified: rows.filter((r) => r.control && r.control.arms == null).length,
    arms: rows.reduce((n, r) => n + (r.control && r.control.arms != null ? r.control.arms : 0), 0),
    quiet: rows.filter((r) => !r.control).map((r) => r.file) };
}).filter((d) => d.total > 0);

/* ------------------------------------------------- VF-1: the owed controls */
/* THE SEVEN OWED NEGATIVE CONTROLS (`INVESTIGATIVE-SESSION.md` §18, placed by
 * `IS-BUILD-PLAN.md`'s VF-1 row, which is the authority for the placement). They
 * are here, in the gate every worker runs, for one reason: **VF-1 is a LEDGER,
 * and a ledger kept in a document is the thing this project keeps re-learning
 * does not reach anybody.** Four of the seven are RUN. Three cannot be placed
 * yet because PL-16 has not landed, and that is STATED rather than answered with
 * an invented placement — `bio-plane/test/publishedcase.test.mjs` is REC-22's
 * suite for the EXISTING public read path and is not IS-8's, so putting DEC-44's,
 * DEC-34's and DEC-46(a)'s arms there would be a placement that looks like
 * coverage and measures nothing.
 *
 * WHAT THIS TABLE CAN AND CANNOT SEE, because that sentence is load-bearing:
 *  - IT CAN see that a placed control's suite still EXISTS and still DECLARES.
 *    That is the regression it exists to catch — an owed control quietly losing
 *    the suite it was recorded in.
 *  - IT CANNOT read a declaration and judge that the owed arm is *the one
 *    described*. No matcher can: the four owners spell the reference four
 *    different ways (`OWED CONTROL 1`, `VF-1's NUMBER 6`, `VF-1's owed control
 *    7`, `VF-1(3)`), and grading one spelling is REC-70's defect exactly. The
 *    EVIDENCE that each arm RAN is the measured figure in the owner's own
 *    `NEGATIVE CONTROL:` line; this table asserts the line is still there and
 *    points at it.
 *  - IT CANNOT tell that PL-16 has landed. Nothing structural distinguishes
 *    "PL-16 shipped" from "PL-16 did not" without guessing at its shape, so the
 *    tripwire is the arithmetic instead: `total` is PINNED at seven, so an
 *    outstanding row cannot be deleted to make this section tidy, and
 *    `outstanding` is a CEILING that may only fall — and falling means an owner
 *    landed, placed the arm, ran it, and moved this number in the same turn. */
const OWED_CONTROLS = [
  { n: 1, item: "PL-11", suite: "bio-plane/test/aicredential.test.mjs",
    what: "DEC-55.5's SECOND HALF — remove the machine predicate and every MACHINE_CANNOT_* must stop firing",
    ran: "arm (1): 75 pass, 15 FAIL. Eleven of twelve fences were luck, not fences (D-229)." },
  { n: 2, item: "PL-16", suite: null,
    what: "DEC-44's two-finding case — any surface presenting ONE case-level strength must fail",
    ran: "NOT RUN. PL-16 (IS-8, M10, W9) has not landed; there is no published-case suite to place it in." },
  { n: 3, item: "PL-14", suite: "bio-plane/test/strengthpair.test.mjs",
    what: "DEC-40's strip-the-filter-line — a what-if rendering without its filter/state-set line must fail the harness",
    ran: "arms (1a)-(1d) plus the DEC-44 composition arms; 17 arms, run by test/strengthpair.control.mjs." },
  { n: 4, item: "PL-16", suite: null,
    what: "DEC-34's page-without-header — a page lacking the per-page header incl. the version NAME must fail",
    ran: "NOT RUN, same reason as 2. REC-22's publishedcase suite asserts the plane emits NO page at all, which is the OTHER claim." },
  { n: 5, item: "PL-16", suite: null,
    what: "DEC-46(a)'s carried-forward bias acknowledgement — must be refused",
    ran: "NOT RUN, same reason as 2." },
  { n: 6, item: "PL-3", suite: "bio-plane/test/suggest.test.mjs",
    what: "ONE REFUSAL AT A TIME — remove any one of the six pre-write refusals and its suite fails naming that C-number",
    ran: "arms (1)-(6), each neutering one check with the other five held OPEN, run by test/suggest.control.mjs." },
  { n: 7, item: "FL-3", suite: "agent-worker/test/harness.test.mjs",
    what: "THE EMPTY-RUN INSTRUMENT — an empty run and a silent failure must be distinguishable",
    ran: "arm (H9): `emptyLevelCandidates` returns [] -> the empty-run arm fails. Run by agent-worker/test/harness.control.mjs." },
];
/* PINNED. `total` is the design's own count and does not move without a ruling.
   `outstanding` may only FALL, and only in the turn that places AND RUNS the arm
   — a ceiling here is the right shape precisely because the quantity is a DEBT.
   A floor would be the wrong direction and a count with neither is a promise. */
const OWED_TOTAL = 7;
const OWED_OUTSTANDING = 3;   // 2, 4 and 5 — all three PL-16's, W9/M10.
/* THE LEDGER'S REACH, STATED. These rows describe THIS repository's IS build, and
   `coverage.mjs` is also copied into throwaway repositories by two suites that
   drive the real instrument against a synthetic tree. In such a tree every named
   suite is legitimately absent, and a ledger that reported four MISSING suites
   there would be making a claim about a repository it is not describing — the
   generous direction's mirror image, and just as wrong. The anchor is the file
   that IS the authority for the placement: a tree with no `IS-BUILD-PLAN.md` has
   no VF-1 to keep a ledger for. The table is still PRINTED either way; only the
   assertions are conditioned, and the report says which it did.
   THE ANCHOR MOVED 2026-09-14 (M0-26): the plan closed at 43/43 and is now
   `docs/archive/IS-BUILD-PLAN.md`. It is still the authority for VF-1's placement
   — a closed plan is where a landed row's scope lives — so the anchor follows the
   file rather than being dropped, and the three OUTSTANDING rows stay outstanding. */
const OWED_ANCHOR = "docs/archive/IS-BUILD-PLAN.md";
const owedInScope = readText(join(REPO, OWED_ANCHOR)) !== "";
const owedRows = OWED_CONTROLS.map((r) => {
  if (!r.suite) return { ...r, state: "OUTSTANDING" };
  const src = readText(join(REPO, r.suite));
  if (src === "") return { ...r, state: "SUITE MISSING" };
  return { ...r, state: readControl(src) ? "PLACED" : "SUITE DECLARES NO CONTROL" };
});
const owedOutstanding = owedRows.filter((r) => r.state === "OUTSTANDING");
const owedProblems = [];
if (owedInScope) {
  for (const r of owedRows.filter((r) => r.state === "SUITE MISSING" || r.state === "SUITE DECLARES NO CONTROL"))
    owedProblems.push(`owed control ${r.n} (${r.item}) -> ${r.suite}: ${r.state}`);
  if (owedRows.length !== OWED_TOTAL)
    owedProblems.push(`${owedRows.length} owed control(s) in the ledger, the design states ${OWED_TOTAL}`);
  if (owedOutstanding.length > OWED_OUTSTANDING)
    owedProblems.push(`${owedOutstanding.length} outstanding, the pin is ${OWED_OUTSTANDING} — an owed control cannot be un-run`);
}

/* ---- M0-16 / D-238: WHAT DID THESE THREE WALKS COUNT, AND IS IT IN A COMMIT?
 *
 * Every path this instrument was ADMITTED BY or READ FROM, gathered here at the
 * moment it was counted rather than re-derived from the directory afterwards —
 * the suites (which are the whole register corpus), the fleet manifests (the
 * larger hole, because a manifest enrols a DIRECTORY), the fleet members' own
 * suites, and the `wrangler.jsonc` files by which a directory is judged to be a
 * Worker at all. Three walks, one report. */
const PROV = readGitProvenance(REPO);
const inCommit = (abs) => PROV.inHead === null ? true : PROV.inHead.has(repoPath(REPO, abs));
const discovered = [
  ...suites.map((f) => ({ path: repoPath(REPO, join(ROOT, "test", f)), what: f,
    counted: "a battery suite, and one row of the negative-control register" })),
  ...fleet.flatMap((m) => [
    { path: repoPath(REPO, m.manifestPath), what: `${m.name}'s fleet manifest`,
      counted: `enrols a whole directory — ${m.ops.length} surface op(s), ${m.suites} suite(s)` },
    ...m.suitePaths.map((p) => ({ path: repoPath(REPO, p), what: `${m.name}'s suite`,
      counted: "reach for that member's surface ops" })),
  ]),
  ...readdirSync(REPO).filter((n) => !n.startsWith(".") && readText(join(REPO, n, "wrangler.jsonc")) !== "")
    .map((n) => ({ path: repoPath(REPO, join(REPO, n, "wrangler.jsonc")), what: `${n}'s wrangler.jsonc`,
      counted: "is what makes this directory a Worker that must be accounted for" })),
];

/* ----------------------------------------------------------------- report */

const unreached = opRows.filter((r) => r.level === "unreached");
const doOnly = opRows.filter((r) => r.level === "durable-object-only");
const unnamed = checkRows.filter((r) => !r.named);
const uncontrolled = controlRows.filter((r) => !r.control);

/* The register, split into what was MEASURED and what could not be (M0-14). A
   declaration with no countable arms is UNCLASSIFIED, and it is never summed in
   as a zero. */
const classified = controlRows.filter((r) => typeof r.arms === "number");
const unclassified = controlRows.filter((r) => r.control && r.arms == null);
const registerArms = classified.reduce((n, r) => n + r.arms, 0);
const fullest = classified.reduce((a, b) => (b.arms > a.arms ? b : a), classified[0] || { arms: 0, suite: "(none)" });

/* THE SAME THREE FIGURES OVER THE COMMITTED CORPUS ALONE — the numbers another
   checkout at this HEAD reproduces. These are the figures the floor is compared
   against and the figures a reader must move the floor to, and the reason is the
   whole of D-238: a floor moved to a CONTAMINATED figure is permanently too high
   and fails every honest run afterwards. When git cannot answer, `inCommit` says
   true for everything and these collapse onto the contaminated figures — which
   is stated as UNVERIFIED below and never as clean. */
const repro = controlRows.filter((r) => inCommit(join(ROOT, "test", r.suite)));
const reproClassified = repro.filter((r) => typeof r.arms === "number");
const reproArms = reproClassified.reduce((n, r) => n + r.arms, 0);
const contaminated = PROV.inHead !== null && repro.length !== controlRows.length;

/* M0-42 — RUN vs DECLARED. Graded over the declarations the register already
   reads, and the reproducible half is what the floor is held against, for D-238's
   reason: a floor moved while a phantom suite was present is permanently too high. */
const declared = controlRows.filter((r) => r.run);
const runRows = declared.filter((r) => r.run.state === "RUN");
const undeterminedRows = declared.filter((r) => r.run.state === "UNDETERMINED");
const declaredOnlyRows = declared.filter((r) => r.run.state === "DECLARED-ONLY");
const reproRun = repro.filter((r) => r.run && r.run.state === "RUN");

/* THE ONE MECHANICAL FALSIFIER THAT LOOKED AVAILABLE, MEASURED, AND FOUND NOT TO
   BE ONE. This is kept — built, run and reported — because the finding is worth
   more than the feature, and because the next session to have this idea should
   find the measurement rather than re-derive it.

   THE IDEA: a run token dated BEFORE the suite's own last commit is a claim about
   a tree that has since moved, and unlike everything else here that is mechanical
   rather than a matter of belief. THE MEASUREMENT, 2026-09-16 over 164 tokens:
   **roughly 88% of them are stale on a completely healthy estate** (143-144 of 164
   across this item's own runs, the figure moving by one as this item dated its own
   token). Median gap 10 days, max 46. Identical under `%cs` and `%as`, so it is not
   a rebase artefact. **THE LIVE FIGURE IS PRINTED ON EVERY RUN AND THAT IS THE
   AUTHORITY** — no numeral is carried in the printed prose below, because a
   hand-carried number in output nobody re-measures is this project's most-repeated
   finding, and it went stale HERE, inside this block, within one turn of being
   written.

   WHY, AND THE WHY IS THE POINT: a suite file is FAR TOO COARSE A PROXY FOR THE
   ARM'S SUBJECT. Suites are edited constantly for reasons that have nothing to do
   with their control — a comment, a figure, a floor, an added assertion — and none
   of those invalidate a run. Meanwhile the change that WOULD invalidate one is
   usually in `src/`, and this cannot see it at all. **So the signal is wrong in
   both directions at once: it fires on almost every honest row, and stays silent
   on the case it was wanted for.**

   IT IS THEREFORE REPORTED AS A DISTRIBUTION AND NEVER AS A LIST OR A GATE. An
   instrument that names 144 healthy rows as suspect buries the 26 that are the
   actual finding, and a gate built on it would fail honest runs and be switched
   off inside a week. Recorded so the exit is stated: **staleness at this grain is
   not the falsifier this register is missing, and a future one must key on the
   SUBJECT an arm names, not on the file the declaration sits in.** */
function lastCommitDate(relPath) {
  const r = spawnSync("git", ["log", "-1", "--format=%cs", "--", relPath],
    { cwd: REPO, encoding: "utf8", timeout: 30_000 });
  if (r.status !== 0 || !r.stdout) return null;
  const d = r.stdout.trim();
  return /^20\d\d-\d\d-\d\d$/.test(d) ? d : null;
}
const staleRun = [];
for (const r of runRows) {
  const moved = lastCommitDate(`bio-plane/test/${r.suite}`);
  if (moved && moved > r.run.date) staleRun.push({ ...r, moved });
}
const staleGap = (() => {
  const days = staleRun
    .map((r) => Math.round((Date.parse(r.moved) - Date.parse(r.run.date)) / 86_400_000))
    .sort((a, b) => a - b);
  return days.length
    ? { n: days.length, median: days[Math.floor(days.length / 2)], max: days[days.length - 1] }
    : { n: 0 };
})();

const registerBelowFloor = [];
if (reproRun.length < REGISTER_FLOOR.run)
  registerBelowFloor.push(`${reproRun.length} declaration(s) carry a dated RUN token, floor is ${REGISTER_FLOOR.run}`);
if (reproArms < REGISTER_FLOOR.arms)
  registerBelowFloor.push(`${reproArms} arms stated, floor is ${REGISTER_FLOOR.arms}`);
if (reproClassified.length < REGISTER_FLOOR.classified)
  registerBelowFloor.push(`${reproClassified.length} classified declaration(s), floor is ${REGISTER_FLOOR.classified}`);
if (repro.length < REGISTER_FLOOR.corpus)
  registerBelowFloor.push(`the register READ ${repro.length} suite(s) that are in a commit, floor is ${REGISTER_FLOOR.corpus}`);
/* A NEW unclassified declaration is the D-233 defect arriving again. */
const newlyUnclassified = unclassified.filter((r) => !REGISTER_UNCLASSIFIED.includes(r.suite));

const pct = (n, d) => d === 0 ? "100.0" : ((n / d) * 100).toFixed(1);

if (JSON_OUT) {
  console.log(JSON.stringify({ opRows, checkRows, controlRows, fleet,
    provenance: { headSha: PROV.headSha, verified: PROV.inHead !== null, discovered } }, null, 2));
} else {
  console.log(`\nBIO plane coverage — ${suites.length} battery suites\n`);

  console.log(`OPS  ${OPS.size} declared · `
    + `${opRows.filter((r) => r.level === "control-plane").length} reached through the control plane `
    + `(${pct(opRows.filter((r) => r.level === "control-plane").length, OPS.size)}%) · `
    + `${doOnly.length} at the Durable Object only · ${unreached.length} unreached`);
  if (doOnly.length) {
    console.log(`\n  WARNING — reached only at the Durable Object (the D-43 class: a real`);
    console.log(`  caller uses the control plane, and that route is untested):`);
    for (const r of doOnly) console.log(`    ${r.op}${r.mutating ? "  (mutating)" : ""}`);
  }
  if (unreached.length) {
    console.log(`\n  UNREACHED by any battery suite:`);
    for (const r of unreached) console.log(`    ${r.op}${r.mutating ? "  (mutating)" : ""}`);
  }

  console.log(`\nCHECKS  ${CHECKS.length} in the catalog · ${CHECKS.length - unnamed.length} named by an assertion `
    + `(${pct(CHECKS.length - unnamed.length, CHECKS.length)}%) · ${unnamed.length} never named`);
  console.log(`  Every check EXECUTES: the conformance suite runs the whole catalog and asserts`);
  console.log(`  zero findings. Never NAMED means no assertion proves the check FIRES on a`);
  console.log(`  violation, so it is exercised only in the direction that passes. That is the`);
  console.log(`  C-20.1 defect class exactly: the audit was clean because it was not looking.`);
  if (unnamed.length) console.log(`\n    ${unnamed.map((r) => r.check).join(" ")}`);
  /* D-277: THE CORPUS AND THE EXCLUDED SET, BOTH PRINTED. The catalog is what the
     catalogue's CODE declares; an id that appears only in its PROSE is named here
     rather than dropped in silence, because a narrowed corpus nobody prints is the
     mirror image of the defect this replaced. Every id on this line is a comment
     doing its job — a rule being explained, a numeral recorded as deliberately
     unallocated, a foreign namespace's id that merely ends in this shape. If a
     REAL check ever appears here, that is the finding. */
  console.log(`\n  CORPUS  ${CHECKS.length} id(s) DECLARED in checks/bio-checks.mjs's code`
    + ` · ${CHECKS_IN_PROSE.length} more appear only in its PROSE and are NOT catalogued`);
  if (CHECKS_IN_PROSE.length) console.log(`    prose only: ${CHECKS_IN_PROSE.join(" ")}`);
  console.log(`  Until 2026-08-09 the catalog was harvested from RAW SOURCE, comments included, so an`);
  console.log(`  ordinary explanatory comment naming a numeral became a check nothing named and took`);
  console.log(`  --strict to exit 1 on a complete family. A gate that fails honest runs gets switched`);
  console.log(`  off. The corpus is now DECLARED CODE — see scripts/declared-source.mjs for the rule,`);
  console.log(`  for what its scanner cannot see, and for why this is an inversion rather than a list`);
  console.log(`  of prose spellings to skip. The credit side reads code too: three of these checks`);
  console.log(`  were credited as "named" by a SENTENCE in a suite's comments, one of them ONLY by a`);
  console.log(`  sentence, and a matcher with no word boundary credited a check because its SIBLING`);
  console.log(`  was named — a one-digit member matching inside its own family's tenth. Both are the`);
  console.log(`  generous direction and both are closed. NO REAL ID IS SPELLED IN THIS FILE'S PROSE,`);
  console.log(`  deliberately: an explanation of a corpus rule is itself corpus to somebody's matcher.`);

  console.log(`\nNEGATIVE CONTROLS  ${controlRows.length - uncontrolled.length} of ${controlRows.length} suites declare one `
    + `(${pct(controlRows.length - uncontrolled.length, controlRows.length)}%) · `
    + `${registerArms} arms stated across ${classified.length} classified declaration(s) · `
    + `fullest ${fullest.arms} (${fullest.suite}) · ${unclassified.length} UNCLASSIFIED`);
  console.log(`  An arm is one MARKED item of the list a declaration states — a "break this -> that`);
  console.log(`  must then fail" transition, or a parenthesised ordinal opening a segment. The count`);
  console.log(`  is a FLOOR on arms stated, not an exact count: an arm given a LABEL rather than an`);
  console.log(`  ordinal ("(D-231a)") is not counted, because widening the ordinal to any bracketed`);
  console.log(`  token would count every "(D-113)" and "(DEC-46)" this prose is full of. It is here`);
  console.log(`  so a declaration that got SHORTER is visible — a register that reads green while`);
  console.log(`  quoting a fraction of what was checked is the generous direction (M0-9).`);
  if (unclassified.length) {
    console.log(`\n  UNCLASSIFIED — a declaration this register could NOT count arms in. NAMED here`);
    console.log(`  rather than scored zero, which is the whole of D-233: a suite silently scored 0`);
    console.log(`  reads as "declares no arms" when the truth is "this instrument cannot read this`);
    console.log(`  suite's arms", and four suites declaring 48 arms between them read that way for`);
    console.log(`  four consecutive re-measurements of this row.`);
    for (const r of unclassified) console.log(`    ${r.suite}`);
  }
  console.log(`\n  REGISTER FLOOR  arms ${reproArms}/${REGISTER_FLOOR.arms} · `
    + `classified ${reproClassified.length}/${REGISTER_FLOOR.classified} · `
    + `corpus (suites read) ${repro.length}/${REGISTER_FLOOR.corpus}`
    + `${reproArms > REGISTER_FLOOR.arms ? ` · GREW by ${reproArms - REGISTER_FLOOR.arms} arm(s)` : ""}`);
  console.log(`  The tally rises on its own and can only FALL by an edit — so a ceiling would never`);
  console.log(`  have fired. The floor is what makes this figure worth reading (M0-14).`);
  /* M0-16: the floor is compared against — and must be moved to — the REPRODUCIBLE
     figure. When they differ, both are printed and the difference is named, because
     a reader about to move a floor by hand is exactly the reader this defect hurts. */
  if (contaminated) {
    console.log(`\n  THE THREE FIGURES ABOVE ARE THE REPRODUCIBLE ONES. This tree also holds work that is`);
    console.log(`  in no commit, so the CONTAMINATED figures — what this run actually read — are higher:`);
    console.log(`    arms ${registerArms} · classified ${classified.length} · corpus ${controlRows.length}`
      + `   (contaminated: ${controlRows.length - repro.length} suite(s) no other checkout has)`);
    console.log(`  MOVE THE FLOOR TO THE REPRODUCIBLE FIGURES AND NEVER TO THESE (D-238). A floor moved`);
    console.log(`  while a phantom was present is permanently too high: it fails every honest run`);
    console.log(`  afterwards, and a gate that fails honest runs gets switched off. The suites are`);
    console.log(`  named by the provenance line at the foot of this report.`);
  } else if (PROV.inHead === null) {
    console.log(`  UNVERIFIED: git could not answer, so the figures above are what this tree holds and`);
    console.log(`  NOT a claim that another checkout reproduces them. Do not move a floor from them.`);
  }
  /* ------------------------------------------------- M0-42: RUN vs DECLARED.
     THE LIMIT IS PRINTED BEFORE THE FIGURES, DELIBERATELY AND IN THIS REGISTER'S
     OWN WORDS, because a reader who takes the count for proof of execution has
     been misled by an instrument rather than by a worker — and that is a worse
     defect than the one this closes. */
  console.log(`\n  RUN vs DECLARED — WHAT THIS CANNOT DO, FIRST. **THIS DOES NOT PROVE THAT ANY CONTROL`);
  console.log(`  RAN.** It cannot. Any artifact a worker can write, a worker can write without running`);
  console.log(`  anything, and a FORGED RUN TOKEN IS INDISTINGUISHABLE FROM A REAL ONE — it is one line`);
  console.log(`  of prose. What this raises is the COST of a false claim, in three ways and no more:`);
  console.log(`  the absence is now VISIBLE and COUNTED where every declaration used to read alike; a`);
  console.log(`  false claim must now carry a DATE and a FIGURE, which makes it FALSIFIABLE by anyone`);
  console.log(`  who re-runs the arm, where a purely prospective declaration predicted nothing that`);
  console.log(`  could later be shown wrong; and a dated claim can go STALE, which is mechanical.`);
  console.log(`  A register that CLAIMED to prove execution would be a worse instrument than this one.`);
  console.log(`\n  ${runRows.length} RUN (dated token) · ${undeterminedRows.length} UNDETERMINED · `
    + `${declaredOnlyRows.length} DECLARED-ONLY · of ${declared.length} declarations · `
    + `floor ${reproRun.length}/${REGISTER_FLOOR.run} reproducible`
    + `${reproRun.length > REGISTER_FLOOR.run ? ` · GREW by ${reproRun.length - REGISTER_FLOOR.run}` : ""}`);
  console.log(`  RUN           a past-tense EXECUTION VERB with an ISO date within ${RUN_WINDOW} characters.`);
  console.log(`                Vocabulary PRINTED so a refused spelling is visible rather than guessed at:`);
  console.log(`                ${RUN_VERBS.join(" ")}   (negated occurrences are skipped — "HAS NEVER BEEN RUN"`);
  console.log(`                appears in a real declaration beside a real token).`);
  console.log(`  UNDETERMINED  a measured-LOOKING outcome ("17 of 34 assertions fail", "471 -> 482", "exit 1")`);
  console.log(`                with no date. **A FIGURE ALONE CANNOT DISTINGUISH A MEASUREMENT FROM A`);
  console.log(`                PREDICTION**: the register grammar spells a forecast and a result the same`);
  console.log(`                way. This state says so instead of guessing, and it is the honest home of a`);
  console.log(`                worker who ran the arm and wrote the number down without dating it. It is`);
  console.log(`                NOT a finding against that worker and must never be reported as one.`);
  console.log(`  DECLARED-ONLY neither. Wholly prospective, and resting on nobody having run anything.`);
  console.log(`  AND THE GRADE IS SYNTACTIC, which cuts the OTHER way too and is said here rather than`);
  console.log(`  left to be found: a run word that merely happens to sit near a date reads RUN, so this`);
  console.log(`  can be satisfied by accident and not only by intent. MEASURED rather than waved at —`);
  console.log(`  21 quotes sampled evenly across the 164 on 2026-09-16 were 21 genuine run claims, 0`);
  console.log(`  false. That is a sample and not a proof, and it is the honest shape of the whole line.`);
  console.log(`  THE FLOOR IS ON THE COUNT, NOT ON EVERY SUITE. 164 of 198 already carried a token on`);
  console.log(`  2026-09-16, written by workers nobody asked — the convention existed and no instrument`);
  console.log(`  read it. Requiring one everywhere would have failed 34 honest suites on day one, and a`);
  console.log(`  gate that fails honest runs gets switched off. They are NAMED below instead.`);
  /* **THE FOURTH COLUMN, AND IT EXISTS BECAUSE THE FIRST DRAFT OF THIS REPORT WAS
     WRONG IN THE DIRECTION THIS PROJECT CARES ABOUT.** Naming all 34 as resting on
     the worker's word read as a finding and was an OVERCLAIM: 18 of them record
     their runs in a SECOND declaration this register cannot see. The strict grade
     and the loose second look are printed as two different claims, because they
     are two different claims. */
  const notRun = [...declaredOnlyRows, ...undeterminedRows].sort((a, b) => a.suite < b.suite ? -1 : 1);
  const noEvidenceAnywhere = notRun.filter((r) => !r.runElsewhere);
  if (notRun.length) {
    console.log(`\n  NOT GRADED RUN (${notRun.length}) — and READ THE SECOND COLUMN BEFORE TREATING ANY OF THIS AS A`);
    console.log(`  FINDING. ${notRun.length - noEvidenceAnywhere.length} of them DO record a run, in a second declaration this register cannot`);
    console.log(`  see: readControl records ONE declaration per suite (the fullest), and the marker`);
    console.log(`  grammar does not recognise "NEGATIVE CONTROL (" at all, because "(" is not one of`);
    console.log(`  MARKER_SEPARATORS. affordances.test.mjs grades DECLARED-ONLY while holding five more`);
    console.log(`  declarations reading "all RUN 2026-08-04 ... restored BYTE-IDENTICAL". Both are`);
    console.log(`  PRE-EXISTING properties of the arms grammar, named here and deliberately NOT changed:`);
    console.log(`  widening the separator set would move "arms" and "classified", which is a decision`);
    console.log(`  about the arms tally and not about run evidence.`);
    console.log(`  The "elsewhere" look is LOOSE ON PURPOSE — it reads the whole file, so a token in any`);
    console.log(`  comment satisfies it. It is a FLOOR ON INNOCENCE whose only job is to stop the strict`);
    console.log(`  list overclaiming. It never promotes a suite into the RUN count, and the floor above`);
    console.log(`  is computed from the RECORDED declaration alone.`);
    console.log(`\n    grade          run token elsewhere?   suite`);
    for (const r of notRun)
      console.log(`    ${r.run.state.padEnd(14)} ${r.runElsewhere ? "YES — not a finding  " : "none anywhere        "} ${r.suite}`
        + `${r.hasDriver ? "   (has a driver)" : ""}`);
    console.log(`\n  **THE FIGURE THAT MATTERS IS ${noEvidenceAnywhere.length}, NOT ${notRun.length}** — the suites with no run evidence anywhere`);
    console.log(`  in the file. ${noEvidenceAnywhere.filter((r) => r.hasDriver).length} of those ${noEvidenceAnywhere.length} have a sibling *.control.mjs, so their evidence may`);
    console.log(`  live in the DRIVER: this register reads a declaration and NEVER FOLLOWS A DELEGATION,`);
    console.log(`  which is readControl's existing rule and a real blind spot here, not a tidy-up.`);
  }
  /* M0-51. THE DRIVER CENSUS, PRINTED AS A JUDGEMENT AND NOT AS A FIGURE. Every
     driver in `test/` is accounted for here: either it is READ — the suites it
     drives are named — or it is NAMED AS UNREADABLE with its reason. A census
     that printed only a percentage would report the drivers it already saw as
     healthy, which is the acceptance this row explicitly refuses. */
  {
    const orphans = driverRows.filter((d) => !d.byName);
    const unreadable = driverRows.filter((d) => d.unreadable);
    const recovered = orphans.filter((d) => !d.unreadable);
    console.log(`\n  DRIVER CENSUS (M0-51): ${driverRows.length} *.control.mjs in test/ · ${orphans.length} have NO same-named`);
    console.log(`  .test.mjs sibling and were INVISIBLE to this reader before this item. The old rule`);
    console.log(`  tested a NAMING CONVENTION; this one walks the drivers and reads which suites each`);
    console.log(`  NAMES IN CODE — prose blanked, because a driver that MENTIONS a suite is not driving it.`);
    console.log(`  IT ESTABLISHES THAT A DRIVER EXISTS, AND CANNOT ESTABLISH THAT IT RAN: a code`);
    console.log(`  reference is not an execution, and the instrument for that half is the "run:" key.`);
    if (recovered.length) {
      console.log(`\n    READ (${recovered.length}) — driver found under a name the old matcher could never match:`);
      for (const d of recovered) console.log(`      ${d.file.padEnd(38)} drives  ${d.byCode.join(", ")}`);
    }
    if (unreadable.length) {
      console.log(`\n    UNREADABLE (${unreadable.length}) — NAMED, not dropped, and NOT counted as healthy. The file is`);
      console.log(`    here and was walked; it names no suite of this battery in code, so this reader`);
      console.log(`    cannot say what it drives. "I HAVE IT AND CANNOT READ IT" is a third fact, distinct`);
      /* The count is INTERPOLATED and not typed. This sentence first read "all
         five", which was true of the tree it was written on and wrong on every
         other — a hand-carried figure in a document nobody re-measures, which is
         this project's most-repeated finding, and it had landed inside the output
         of an instrument whose whole subject is miscounting. Caught by running
         this reader over a scratch tree holding two. */
      console.log(`    from both "not found" and "not where I looked", and a census that reported a`);
      console.log(`    PERCENTAGE instead of these names would have hidden all ${unreadable.length}:`);
      for (const d of unreadable) console.log(`      ${d.file.padEnd(38)} names no suite in code`);
    }
    if (notWalked.length) {
      console.log(`\n    NOT WALKED (${notWalked.length}) — the name claims a control; this reader does not walk it.`);
      console.log(`    "NOT WHERE I LOOKED", which is a different fact from "not found" and is kept apart`);
      console.log(`    from it on purpose. These are control drivers written in SHELL: they are NAMED and`);
      console.log(`    deliberately NOT resolved, because this reader does not parse shell and claiming to`);
      console.log(`    read them would be the overclaim the register exists to refuse.`);
      for (const f of notWalked) console.log(`      ${f}`);
    }
    console.log(`\n    ${driverRows.length - unreadable.length}/${driverRows.length} drivers resolve to at least one suite · ${driversFor.size}/${battery.length} suites have a driver.`);
  }
  console.log(`\n  RE-RUNNABLE IN ONE STEP: ${runRows.filter((r) => r.hasDriver).length}/${runRows.length} RUN tokens sit beside a *.control.mjs driver, so`);
  console.log(`  the claim can be falsified by one command. The other ${runRows.filter((r) => !r.hasDriver).length} are falsifiable only by`);
  console.log(`  re-deriving the break, and THAT IS WHERE A FALSE TOKEN IS CHEAPEST — said plainly`);
  console.log(`  because the place a mechanism is weakest is the thing a reader most needs told.`);
  console.log(`\n  STALENESS: ${staleRun.length}/${runRows.length} tokens predate their suite's last commit`
    + `${staleGap.n ? ` · median gap ${staleGap.median}d, max ${staleGap.max}d` : ""}`);
  console.log(`  **THIS IS A MEASUREMENT AND NOT A DEFECT LIST, AND THE NAMES ARE DELIBERATELY NOT`);
  console.log(`  PRINTED.** Dating a token against the suite it sits in looked like the one mechanical`);
  console.log(`  falsifier available here, and it is not one: it fires on ~88% of a completely healthy`);
  console.log(`  estate, because a suite is edited constantly for reasons that have nothing to do with`);
  console.log(`  its control — while the change that WOULD invalidate a run is usually in src/ and is`);
  console.log(`  invisible from here. Wrong in both directions at once. Listing ${staleRun.length} healthy rows would`);
  console.log(`  bury the ${declaredOnlyRows.length} above that ARE the finding, and a gate on it would fail honest runs and`);
  console.log(`  be switched off. Kept and printed so the next session finds the MEASUREMENT instead of`);
  console.log(`  re-deriving the idea: a real falsifier must key on the SUBJECT an arm names, not on the`);
  console.log(`  file its declaration happens to live in.`);

  if (uncontrolled.length) {
    console.log(`\n  No declared control — add one, in a comment anywhere in the file, over as many`);
    console.log(`  lines and arms as it needs:`);
    console.log(`    NEGATIVE CONTROL: <what to break> -> <what must then fail>`);
    for (const r of uncontrolled) console.log(`    ${r.suite}`);
  }

  const fleetOps = fleetSurfaceOps;
  console.log(`\nFLEET  ${fleet.length} member${fleet.length === 1 ? "" : "s"} beside the plane · `
    + `${fleetOps - fleetUnreached.length}/${fleetOps} surface ops reached · `
    + `${fleetSuiteRows.length - fleetSuitesUndeclared.length}/${fleetSuiteRows.length} SUITES declaring a negative control · `
    + `${fleetArms} arms · `
    + `floor ${FLEET_FLOOR.members} member(s) / ${FLEET_FLOOR.surfaceOps} op(s) / `
    + `${FLEET_FLOOR.suites} suite(s) / ${FLEET_FLOOR.arms} arm(s)`
    + `${fleet.length > FLEET_FLOOR.members ? ` · GREW by ${fleet.length - FLEET_FLOOR.members} member(s)` : ""}`
    + `${fleetOps > FLEET_FLOOR.surfaceOps ? ` · GREW by ${fleetOps - FLEET_FLOOR.surfaceOps} op(s)` : ""}`
    + `${fleetArms > FLEET_FLOOR.arms ? ` · GREW by ${fleetArms - FLEET_FLOOR.arms} arm(s)` : ""}`
    + `${fleetSuitesUnclassified.length ? ` · ${fleetSuitesUnclassified.length} UNCLASSIFIED` : ""}`);
  console.log(`  A second Worker's surface was uncounted (D-117); each member is held to the`);
  console.log(`  plane's own two behavioural surfaces — every surface op reached by one of the`);
  console.log(`  member's suites, and a declared control. Discovered from fleet-member.json.`);
  console.log(`  VF-3: discovery alone was not enough. A member that stops DECLARING itself used`);
  console.log(`  to stop existing, and the figure held still while a component went dark — D-117's`);
  console.log(`  own sentence. So every Worker directory is now accounted for, the count carries a`);
  console.log(`  FLOOR, an unreadable or empty SURFACE table FAILS instead of reporting 0/0, and`);
  console.log(`  fleet rule 2 (a member ASSERTS nothing) is a gate rather than a convention.`);
  console.log(`  VF-1: the control figure is per SUITE, not per member. It used to be ANY suite of`);
  console.log(`  a member, so FL-3/IS-9's own suite could stop declaring while this line still read`);
  console.log(`  2/2 — measured on 2026-08-09, --strict stayed exit 0 with every figure unmoved.`);
  for (const m of fleet) {
    const reached = m.ops.filter((o) => o.reached).length;
    const declaring = m.suiteControls.filter((s) => s.declared).length;
    console.log(`\n    ${m.name} (${m.dir}/)  ${reached}/${m.ops.length} ops reached · `
      + `${declaring}/${m.suites} suite${m.suites === 1 ? "" : "s"} declaring a control`);
    for (const s of m.suiteControls)
      console.log(`      ${s.declared ? (s.arms == null ? "UNCLASSIFIED" : `${String(s.arms).padStart(2)} arms    `) : "NO CONTROL  "} ${s.file}`);
    for (const o of m.ops)
      console.log(`      ${o.reached ? "reached  " : "UNREACHED"} ${o.op}`
        + `${o.mutating === false ? "" : o.mutating === true ? "   MUTATING — a fleet member asserts nothing (fleet rule 2)" : "   DECLARATION UNREADABLE — cannot show it is non-mutating"}`);
    if (!m.hasSurface) console.log(`      NO SURFACE TABLE found at its entry (${m.dir}/) — the surface is uncounted, which is the D-117 failure itself`);
    else if (m.ops.length === 0) console.log(`      SURFACE TABLE IS EMPTY — 0 of 0 reached is the emptiest possible green`);
  }
  console.log(`\nOWED CONTROLS (VF-1)  ${owedRows.length - owedOutstanding.length}/${owedRows.length} placed and RUN · `
    + `${owedOutstanding.length} OUTSTANDING (pin ${OWED_OUTSTANDING}) · total pinned at ${OWED_TOTAL}`
    + `${owedInScope ? "" : ` · NOT ASSERTED HERE (no ${OWED_ANCHOR} — this is not the repository the ledger describes)`}`);
  console.log(`  The design's seven (§18), on their owners. A control that is DECLARED and never RUN`);
  console.log(`  is a mechanism believed on its EXISTENCE, which is the defect this project meets most.`);
  console.log(`  This table asserts a placed control's suite still exists and still declares; it does`);
  console.log(`  NOT read the declaration and judge that the owed arm is the one described — the four`);
  console.log(`  owners spell the reference four different ways, and grading one spelling is REC-70's`);
  console.log(`  defect. The evidence each arm RAN is the measured figure in the owner's own line.`);
  for (const r of owedRows) {
    console.log(`\n    (${r.n}) ${r.item}  ${r.state}${r.suite ? `  ${r.suite}` : ""}`);
    console.log(`         ${r.what}`);
    console.log(`         ${r.ran}`);
  }

  if (otherDirs.length) {
    console.log(`\nSUITES NO REGISTER READS (VF-1's class sweep — REPORTED, NOT GATED)`);
    console.log(`  The register's corpus is the plane's ${suites.length} suites; the fleet's ${fleetSuiteRows.length} are held to the`);
    console.log(`  same rule one directory over. These are the rest of this repository's suites, and`);
    console.log(`  NO instrument holds them to a declared negative control. Not gated because they`);
    console.log(`  belong to other areas and a gate that fails honest runs gets switched off — but a`);
    console.log(`  figure nobody prints is a figure nobody re-measures, which is how the fleet hole`);
    console.log(`  survived. This walk reads *.test.mjs only, and says nothing about whether a`);
    console.log(`  declared control was ever RUN.`);
    for (const d of otherDirs) {
      console.log(`\n    ${d.dir}  ${d.declaring}/${d.total} declaring · ${d.arms} arms`
        + `${d.unclassified ? ` · ${d.unclassified} unclassified` : ""}`);
      console.log(`      ${d.why}`);
      if (d.quiet.length) console.log(`      NO CONTROL (${d.quiet.length}): ${d.quiet.join(", ")}`);
    }
  }

  const accountedNote = Object.entries(NOT_A_FLEET_MEMBER)
    .map(([d, why]) => `${d} (${why.split(".")[0]})`).join(" · ");
  console.log(`\n    Workers accounted for but NOT fleet members: ${accountedNote}`);
  if (unaccountedWorkers.length)
    console.log(`    UNACCOUNTED Worker director${unaccountedWorkers.length === 1 ? "y" : "ies"} `
      + `(a wrangler.jsonc with no fleet-member.json): ${unaccountedWorkers.join(", ")}`);

  /* M0-16 / D-238. The corpus size is PRINTED beside the verdict on purpose: a
     walk narrowed to nothing reports a beautiful clean provenance over an empty
     corpus, and this project has already caught a headline assertion passing that
     way (M0-15's own restore check compared two EMPTY files and called them
     byte-identical). `discovered` is what these three walks actually counted. */
  console.log("");
  reportProvenance({
    prov: PROV, items: discovered, instrument: "this instrument",
    corpus: `${suites.length} plane suite(s) · ${fleet.length} fleet manifest(s) · `
      + `${fleet.reduce((n, m) => n + m.suitePaths.length, 0)} fleet suite(s) · `
      + `${discovered.length - suites.length - fleet.length - fleet.reduce((n, m) => n + m.suitePaths.length, 0)} wrangler.jsonc`,
    totals: PROV.inHead === null ? [] : [
      { label: "register arms", contaminated: registerArms, reproducible: reproArms, source: "suites" },
      { label: "suites read by the register", contaminated: controlRows.length, reproducible: repro.length, source: "suites" },
    ],
  });
  console.log("");
}

if (unaccountedWorkers.length) {
  console.error(`\nFLEET: ${unaccountedWorkers.join(", ")} carr${unaccountedWorkers.length === 1 ? "ies" : "y"} a `
    + `wrangler.jsonc and no fleet-member.json. A directory with a wrangler.jsonc IS a Worker — that file is`);
  console.error(`  what deploys it. Either declare it (fleet-member.json, so its surface is counted) or name it`);
  console.error(`  in NOT_A_FLEET_MEMBER in this script with the reason. An undeclared Worker is a component that`);
  console.error(`  can go dark while this figure holds still, which is exactly what D-117 named.`);
}
if (fleetBelowFloor.length)
  console.error(`\nFLEET FLOOR: ${fleetBelowFloor.join("; ")}. THE WALK LOST SIGHT of a member or a surface — this is`
    + `\n  the failure a ceiling cannot see. Establish what stopped being discovered before moving the floor,`
    + `\n  and move it only to a figure this instrument PRINTED on a green run.`);
if (fleetSuitesUndeclared.length)
  console.error(`\nFLEET CONTROL: ${fleetSuitesUndeclared.map((s) => `${s.dir}/test/${s.file}`).join(", ")} declare${fleetSuitesUndeclared.length === 1 ? "s" : ""}`
    + `\n  no negative control. A fleet suite is held to what a plane suite is held to. This used to be`
    + `\n  measured per MEMBER — any one suite declaring covered the rest — so the IS suite that owns`
    + `\n  VF-1's owed control 7 could go quiet behind a sibling's declaration and nothing failed (VF-1,`
    + `\n  measured 2026-08-09).`);
if (fleetSuitesUnclassified.length)
  console.error(`\nFLEET REGISTER: ${fleetSuitesUnclassified.map((s) => `${s.dir}/test/${s.file}`).join(", ")} declare${fleetSuitesUnclassified.length === 1 ? "s" : ""} a`
    + `\n  control this register cannot count the arms of. NAMED rather than scored zero (D-233), and it`
    + `\n  fails here rather than being folded into the tally: state the arms as a marked list — an arrow`
    + `\n  per arm, or a parenthesised ordinal per arm, in the paragraph the marker opens.`);
if (fleetSurfaceless.length)
  console.error(`\nFLEET SURFACE: ${fleetSurfaceless.map((m) => m.name).join(", ")} — no readable SURFACE table, or an`
    + `\n  empty one. It would report 0/0 ops reached and pass; a member whose surface cannot be read is a member`
    + `\n  whose surface is untested.`);
if (fleetMutating.length)
  console.error(`\nFLEET RULE 2: ${fleetMutating.map((o) => `${o.member}.${o.op}`).join(", ")} declare${fleetMutating.length === 1 ? "s" : ""} a`
    + `\n  surface op that is not shown to be non-mutating. A fleet member ASSERTS nothing (PARALLELISM.md): it`
    + `\n  returns derived output and the plane decides what it means, because a hop a component can hand us is a`
    + `\n  hop a component can invent (D-112).`);

if (registerBelowFloor.length)
  console.error(`\nREGISTER FLOOR: ${registerBelowFloor.join("; ")}. THE ESTATE'S DECLARED CONTROLS SHRANK, or the`
    + `\n  detector stopped seeing them. This figure rises on its own and can only fall by an edit, so a`
    + `\n  ceiling could never have fired on it — which is how a whole declaration style went dark and the`
    + `\n  published number moved not at all (D-233). Establish WHICH declaration got shorter, or which`
    + `\n  suites the walk stopped reading, before moving the floor — and move it only to a figure this`
    + `\n  instrument PRINTED on a green run.`);
if (newlyUnclassified.length)
  console.error(`\nREGISTER: ${newlyUnclassified.map((r) => r.suite).join(", ")} declare${newlyUnclassified.length === 1 ? "s" : ""} a`
    + `\n  negative control this register cannot count the arms of, and ${newlyUnclassified.length === 1 ? "it is" : "they are"} not on the named list in`
    + `\n  this script. That is D-233 arriving again: a declaration the instrument cannot read used to be`
    + `\n  scored ZERO and folded silently into the tally. Either state the arms as a marked list — an`
    + `\n  arrow per arm, or a parenthesised ordinal per arm, in the paragraph the marker opens — or add`
    + `\n  the suite to REGISTER_UNCLASSIFIED with the reason it cannot be counted.`);

if (catalogWentBlind)
  console.error(`\nCATALOG: the check catalog is EMPTY while checks/bio-checks.mjs's text still holds`
    + `\n  ${CHECKS_IN_PROSE.length} id(s). The scanner in scripts/declared-source.mjs has gone blind and this instrument is`
    + `\n  now reporting 100% of nothing — the emptiest possible green, and a shape this project has`
    + `\n  caught passing three times. Do not move a floor from any figure in this run.`);

if (owedProblems.length)
  console.error(`\nOWED CONTROLS: ${owedProblems.join("; ")}. VF-1's ledger no longer matches the tree. An owed`
    + `\n  control whose suite went missing, or whose suite stopped declaring, is one nobody can re-run`
    + `\n  in one step — and a row deleted to make this section tidy is how a debt gets discharged by`
    + `\n  arithmetic. Move the pins only in the turn that PLACES and RUNS the arm.`);

if (STRICT && (unreached.length || doOnly.length || unnamed.length || uncontrolled.length
    || catalogWentBlind
    || registerBelowFloor.length || newlyUnclassified.length
    || fleetUnreached.length
    || fleetSuitesUndeclared.length || fleetSuitesUnclassified.length
    || owedProblems.length
    || unaccountedWorkers.length || fleetBelowFloor.length || fleetSurfaceless.length || fleetMutating.length)) {
  console.error("STRICT: coverage floor not met.");
  process.exit(1);
}
