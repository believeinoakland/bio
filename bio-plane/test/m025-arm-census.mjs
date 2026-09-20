#!/usr/bin/env node
/* m025-arm-census.mjs — THE ARM-LIVENESS CENSUS (M0-25).
 *
 *     node bio-plane/test/m025-arm-census.mjs                  # every driver, whole
 *     node bio-plane/test/m025-arm-census.mjs --list           # enumerate only, run nothing
 *     node bio-plane/test/m025-arm-census.mjs --only harness.control.mjs [...]
 *     node bio-plane/test/m025-arm-census.mjs --timeout 1800   # seconds per driver
 *     node bio-plane/test/m025-arm-census.mjs --logs <dir>     # where the per-driver logs go
 *
 * WHY THIS FILE EXISTS, and it is a measured failure rather than tidiness.
 * D-323 re-ran the only two control drivers its subject touched and found BOTH
 * had arms that no longer arm: `harness.control.mjs` H8 and `fanout.control.mjs`
 * F4b, each killed by D-276 changing the LINE THE ARM QUOTES without moving the
 * arm's copy of it. One of the two was the arm whose whole job is proving
 * `fanout`'s strongest assertion CAN fail. Both sat half-armed on a green `main`
 * for a month. **Nothing in this estate runs the control drivers**, so the only
 * way either was ever going to surface was an item happening to touch its
 * subject — which is not a mechanism, it is luck with a schedule.
 *
 * DELIBERATELY NOT A `.test.mjs`. It RUNS the drivers, and the drivers EDIT REAL
 * SOURCES while they run — that is the whole reason none of them is discovered
 * either. A census the battery discovered would rewrite `src/` underneath every
 * suite running beside it. It also runs the drivers STRICTLY SEQUENTIALLY for the
 * same reason: two drivers arming at once would each restore the other's patch.
 *
 * WHAT IT CLASSIFIES, AND WHAT IT CANNOT SEE. This is the load-bearing sentence
 * and it is stated rather than left for the next reader to re-derive.
 *
 *   - It reads each driver's OWN report. The estate has no shared arm harness:
 *     84 drivers, written over two months, report an unarmed arm in at least
 *     eleven spellings (`THE ARM DID NOT ARM`, `NEVER ARMED`, `PATCH MATCHED
 *     ZERO TIMES`, `armed: false`, `ARM FAILED TO ARM`, …). The matcher below is
 *     a UNION of those spellings, case-insensitive, and it is a FLOOR on what is
 *     stale, never a ceiling: **a driver that invents a twelfth spelling is
 *     invisible to it.** That is why the exit code is carried beside the phrase
 *     match and why a NON-ZERO exit with no recognised phrase is reported as
 *     `UNCLASSIFIED` rather than scored as either outcome.
 *   - It counts arm ANNOUNCEMENTS by a union of the estate's announcement
 *     spellings. A driver announcing its arms in a shape not in that union
 *     reports `arms: ?` — printed as unknown, NEVER as zero. WORKER.md's rule:
 *     a thing the matcher does not understand must be NAMED.
 *   - It cannot see an arm that arms CORRECTLY but tests the wrong thing. It CAN
 *     now see an arm table that was silently shortened or grown — see D-333
 *     below, added 2026-09-14; before that it saw only the liveness of the
 *     anchors still declared.
 *   - It says nothing about drivers it could not run. A driver that needs an
 *     engine, a network fetch or a credential is reported as NOT-RUN WITH THE
 *     REASON, never skipped silently.
 *
 * ---------------------------------------------------------------------------
 * EXTENDED 2026-09-14 — D-333 AND D-331, THE TWO SHAPES ONLY A RUN CAN SEE.
 *
 * **D-333 · DECLARED vs MEASURED.** A driver's ANCHORS can all be perfectly live
 * while its declared arm COUNT is false: D-330 measured exactly that on two
 * drivers, on a green `main`, and neither announced anything. A tally is a CLAIM
 * ABOUT A RUN, so no static instrument can falsify it — **this census is the only
 * instrument in the estate that HAS the run**, which is why the comparison lives
 * here rather than in the battery-side witness. The declaration is read from the
 * driver's own head by `scripts/armdecay.mjs`'s `readDeclaredArms`; the
 * measurement is the arm announcements this census already counted. A mismatch
 * is a finding and CARRIES THE EXIT CODE, because a number nobody can falsify
 * trains every session to trust it (D-231). An UNKNOWN on either side does not:
 * an unreadable declaration is a gap in the instrument, not a defect in the
 * driver, and gating on it would turn the reach figure into a punishment.
 *
 * **D-331 · THE PREFLIGHT, AND WHAT THIS CENSUS MEASURED TO EARN IT.** Half this
 * estate's drivers THROW on a zero-match anchor, and in a throwing driver the
 * throw ends the process: `casepin.control.mjs` had FOUR dead anchors and
 * reported ONE, because the throw fired at arm (a) and arms (c), (d) and (e)
 * were never reached. The three throwing drivers this census named
 * (`casepin`, `casesign`, `caseproduction`) now run a DRY PASS that counts every
 * arm's quote in the file that arm will write and prints the WHOLE table before
 * anything is armed. The throw is kept, so a half-armed tree is still never
 * measured. Their tables are collected and reported below under ANCHOR
 * PREFLIGHTS — and the preflight's own heading is EXCLUDED from the arm
 * announcement tally, which is a finding about this matcher recorded at the site
 * rather than smoothed: `--- ARM PREFLIGHT ·` matches the `--- ARM <id>`
 * announcement shape, and left alone it would have added one to every
 * preflighting driver's measured tally and failed all three under D-333 for this
 * instrument's reason rather than for theirs.
 *
 * A TIMEOUT IS NOT A RESULT, IT IS A POISONED TREE — MEASURED ON THIS
 * INSTRUMENT'S OWN FIRST FULL RUN AND FIXED HERE RATHER THAN NOTED.
 * `fieldread.control.mjs` runs THE WHOLE BATTERY inside one of its arms (its
 * line 425), so ten arms is ten batteries and it passed a 1500s timeout while
 * perfectly healthy. `spawnSync`'s timeout SIGTERMs it — and a driver killed
 * between ARM and RESTORE leaves its patch on disk. It did: `bio-plane/src/query.mjs`
 * was left carrying a D-255 tripwire, and the NEXT driver then measured a tree
 * nobody meant to hand it. **Every result after a dirty-tree event is worthless,
 * and worthless results that LOOK like results are what this whole item is
 * about**, so the census now STOPS at the first one rather than filling a report
 * with them. The run is resumed with `--only` after the tree is restored and the
 * restore is MEASURED (sha256 against the HEAD blob, byte count floored) — which
 * is what was done on the run of record, and the discarded rows are named in it.
 * The timeout stays a timeout rather than becoming "wait forever": a driver that
 * genuinely hangs must still end the run.
 *
 * THE CONVENTION AND WHAT IT MISSES. The estate's convention is `*.control.mjs`.
 * Three instruments in this repository are negative-control drivers that the
 * convention does not name, and they are enumerated separately below rather than
 * left out: `cpdf16-floor-controls.mjs` and `d315-guard-controls.mjs` (both
 * `*-controls.mjs`, both deliberately undiscovered, both hand-run), and the two
 * probes that carry their arm tables behind a `--controls` FLAG rather than in a
 * filename (`ocr-composed-probe.mjs`, `cpdf15-tesseract-runtime.probe.mjs`).
 * `newgroup/test/` holds no driver of either kind (two `.test.mjs` files) and is
 * DIST's ground regardless.                                                    */

import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { readDeclaredArms, tallyHonoured } from "../scripts/armdecay.mjs";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const argv = process.argv.slice(2);
const flag = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const LIST_ONLY = argv.includes("--list");
/* RE-CLASSIFY THE LAST RUN'S SAVED LOGS WITHOUT RUNNING ANYTHING. The run costs
   ~an hour of machine time and the logs ARE its evidence, so when the phrase
   table is widened mid-item the honest move is to re-read what the run actually
   printed rather than to re-run and quietly measure a different tree. Every
   figure this mode reports comes from the same bytes the drivers wrote. */
const FROM_LOGS = argv.includes("--from-logs");
const TIMEOUT_S = Number(flag("--timeout", "1800"));
const LOGS = flag("--logs", join(ROOT, "_m025", "logs"));
const ONLY = (() => {
  const i = argv.indexOf("--only");
  if (i < 0) return [];
  return argv.slice(i + 1).filter((a) => !a.startsWith("--"));
})();

/* ------------------------------------------------------------------ THE ESTATE

   Six test directories. `newgroup/test` is named so the reach figure can say it
   was LOOKED AT and holds nothing of this kind, rather than being absent from a
   list for an unstated reason. */
const TEST_DIRS = [
  { dir: "agent-worker/test", cwd: "agent-worker" },
  { dir: "bio-plane/test", cwd: "bio-plane" },
  { dir: "civicos-ui/test", cwd: "." },
  { dir: "newgroup/test", cwd: "newgroup" },
  { dir: "ocr-worker/test", cwd: "ocr-worker" },
  { dir: "pdf-worker/test", cwd: "pdf-worker" },
];

/* The drivers the CONVENTION does not name. Each carries the reason it is here
   and how it must be invoked, because "we also ran some others" is not a reach. */
const OFF_CONVENTION = [
  { rel: "bio-plane/test/cpdf16-floor-controls.mjs", cwd: "bio-plane", args: [],
    why: "`*-controls.mjs`, not `*.control.mjs` — CPDF-16's floor-gate driver, mutates the REAL floor" },
  { rel: "bio-plane/test/d315-guard-controls.mjs", cwd: "bio-plane", args: [],
    why: "`*-controls.mjs` — D-315's guard driver, mutates the REAL floor (D-318 kept it undiscovered on purpose)" },
  { rel: "bio-plane/test/ocr-composed-probe.mjs", cwd: "bio-plane", args: ["--controls"],
    why: "arm table behind a `--controls` FLAG, not in the filename (CPDF-14)" },
  { rel: "bio-plane/test/cpdf15-tesseract-runtime.probe.mjs", cwd: "bio-plane", args: ["--controls"],
    why: "arm table behind a `--controls` FLAG (CPDF-15); its ENGINE arms additionally need `--engine <dir>`, "
       + "which is an npm install of `tesseract-wasm` plus a model fetched over the network — run here WITHOUT "
       + "`--engine`, so the engine pins are NOT exercised and that is reported, not hidden" },
];

/* ------------------------------------------------------- THE MATCHERS, AND WHY

   An arm that did not arm is reported in at least eleven spellings across this
   estate. Both tables are UNIONS and both are floors. */
const DID_NOT_ARM = [
  /THE ARM DID NOT ARM/i,
  /ARM DID NOT ARM/i,
  /\bNEVER ARMED\b/i,
  /\bdid not arm\b/i,
  /PATCH MATCHED ZERO TIMES/i,
  /matched zero times/i,
  /\bmatched 0 time/i,
  /armed:\s*false/i,
  /ARM FAILED TO ARM/i,
  /anchor (?:occurs|matches|matched) ZERO/i,
  /\bFAILED TO ARM\b/i,
  /\bNOT ARMED\b/i,
  /\bDID-NOT-ARM\b/i,
  /* ---- ADDED 2026-09-13, MID-ITEM, AND THE ADDITION IS A FINDING ABOUT THIS
     MATCHER RATHER THAN A TIDY-UP. The header above predicted that a driver
     inventing a further spelling would be invisible here. It then happened, four
     times in one run, in TWO spellings the first table did not hold — and each
     one THROWS out of the driver rather than printing a verdict, so nothing in
     the run's own prose said "did not arm" at all:

         Error: ARM NEEDLE not unique in <file>: found 0 occurrence(s)
         Error: ARM REFUSED TO ARM BLIND: '<anchor>' occurs 0 times in <file>

     THE ONLY REASON THEY WERE SEEN is the design choice directly below: a
     non-zero exit with no recognised phrase is reported UNCLASSIFIED and read by
     a human, never scored as either outcome. A census that had trusted its phrase
     table would have reported four stale arms as four clean passes, which is
     precisely the defect this item exists to close, one level up. Recorded here,
     not smoothed. */
  /ARM NEEDLE not unique/i,
  /REFUSED TO ARM/i,
  /occurs 0 times/i,
  /found 0 occurrence/i,
  /occurrence\(s\)/i,
];

/* ==================================================================== M0-78
   THE ARM THAT ARMED PERFECTLY AND MEASURED NOTHING — a shape every instrument
   in this estate was blind to BY CONSTRUCTION, and the blindness is structural
   rather than a missing spelling.

   D-331's `preflight` counts an arm's own quote in the file that arm will
   WRITE. That proves the ANCHOR IS LIVE. **It can never prove the FIXTURE
   RUNS**, and those are different claims: an arm can patch exactly the site it
   meant to, and the suite it then drives can die before evaluating a single
   assertion. `caseproduction.control.mjs` arms (C) and (H) did precisely that —
   `ALL 8 ANCHORS LIVE`, and both arms ending in an uncaught throw inside
   `caseceremony.mjs`, with their declared `mustFail` assertions never reached.
   The census scored them by the ONLY evidence it had, and had none.

   WHY THAT IS THE WORST OF THE THREE SHAPES THIS FILE ALREADY KNOWS. A stale
   anchor is loud: something says `occurs 0 times`. A decayed tally is
   arithmetic. But a fixture-level throw produces a driver that ran, patched a
   live site, restored cleanly, and reported — and the only trace is the ABSENCE
   of a tally. **An absence is exactly what a phrase table cannot match**, which
   is why this is a second union and not four more rows in the one above.

   WHAT A THROWN FIXTURE IS: an arm whose measurement does not exist. Reported as
   a DEAD ARM rather than passed, because that is what it is — the arm did not
   arm anything that could be observed. Note the suite's own `-1` convention is
   read here, which is `control-register.mjs`'s null-never-zero rule arriving one
   level out: a suite that threw reports `-1 pass, -1 fail`, never `0, 0`, and an
   instrument that folded those two together would score a dead arm as a clean
   one. The driver `caseproduction.control.mjs` already prints all three of these
   phrases; they are matched here so that EVERY driver reporting the same fact in
   the same words is read, rather than this one being special-cased. */
const FIXTURE_THREW = [
  /NO TALLY\b/i,
  /produced no tally at all/i,
  /\bthe suite THREW\b/i,
  /-1 pass, -1 fail/,
  /\bassertions unknown\b/i,
];
/* A driver's own PROSE describes these failures too — every one of these files
   is half commentary. A phrase hit inside a line the driver merely PRINTED as
   documentation is not a finding, so hits are taken from the RUN's stdout, and
   the reporting distinguishes a hit on a line that also carries a live arm id
   from one that does not. The census prints every hit line so the reader
   judges; it never scores a hit away. */

const ARM_ANNOUNCE = [
  /^\s*={2,}\s*ARM\s+\S+/i,          // `=== ARM H8 · …`
  /^\s*-{2,}\s*ARM\s+\S+/i,          // `--- ARM b …`
  /^\s*ARM\s+[A-Za-z0-9_.-]+\s*[:·—-]/,  // `ARM F4b: …`
  /^\s*>>>\s*ARM\s+\S+/i,
  /^\s*\[ARM\s+\S+\]/i,
];

const NOT_AS_DECLARED = [
  /NOT WHAT WAS DECLARED/i,
  /NOT AS DECLARED/i,
  /\bFINDING ABOUT THE ARM\b/i,
  /<<< /,
];

/* ------------------------------------------------------------------ ENUMERATE */
function enumerate() {
  const found = [];
  for (const { dir, cwd } of TEST_DIRS) {
    const abs = join(ROOT, dir);
    const files = existsSync(abs) ? readdirSync(abs).sort() : null;
    if (files === null) { found.push({ missingDir: dir }); continue; }
    for (const f of files) {
      if (!f.endsWith(".control.mjs")) continue;
      found.push({ rel: join(dir, f), cwd, args: [], convention: true });
    }
  }
  return found;
}

/* ---------------------------------------------------------------------- RUN */
const logPathFor = (d) => join(LOGS, d.rel.replace(/[^\w.-]/g, "__")
  + (d.args.length ? "__" + d.args.join("_").replace(/[^\w.-]/g, "_") : "") + ".log");

function runDriver(d) {
  const abs = join(ROOT, d.rel);
  const cwd = join(ROOT, d.cwd === "." ? "" : d.cwd);
  const started = Date.now();
  let r, ms;
  if (FROM_LOGS) {
    const p = logPathFor(d);
    if (!existsSync(p)) return { ...d, ms: 0, status: null, verdict: "NO-LOG", arms: null,
      armLines: [], stale: [], wrong: [], out: "", err: "no saved log from a previous run",
      leftDirty: false, dirtyNow: "" };
    /* The exit code is not in the log. It is recovered from the previous run's
       summary file, and where it cannot be, it is reported as `?` rather than
       assumed — an assumed zero here would invent the very outcome this instrument
       exists to refuse. */
    r = { stdout: readFileSync(p, "utf8"), stderr: "", status: PRIOR_EXITS.get(d.rel) ?? null };
    ms = PRIOR_MS.get(d.rel) ?? 0;
  } else {
    r = spawnSync(process.execPath, [abs, ...d.args], {
      cwd, encoding: "utf8", timeout: TIMEOUT_S * 1000, maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, M025_CENSUS: "1" },
    });
    ms = Date.now() - started;
  }
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const lines = out.split("\n");

  /* D-331's PREFLIGHT TABLE IS NOT AN ARM ANNOUNCEMENT, AND THIS EXCLUSION IS A
     FINDING ABOUT THIS MATCHER RATHER THAN A TIDY-UP. The preflight's own heading
     is `--- ARM PREFLIGHT · <driver> ...`, which the second ARM_ANNOUNCE shape
     (`--- ARM <id>`) reads as an arm — so adding the pass would have silently
     added ONE to the measured tally of every driver that adopted it, and the
     D-333 comparison directly below would then have failed three drivers for the
     instrument's reason rather than for theirs. Caught by driving it. */
  const preflightLines = lines.filter((l) => /ARM PREFLIGHT/i.test(l));
  const armLines = lines.filter((l) => ARM_ANNOUNCE.some((re) => re.test(l)) && !/ARM PREFLIGHT/i.test(l));

  /* PROSE IS NOT A VERDICT, AND THIS TOO WAS MEASURED RATHER THAN ANTICIPATED.
     `dec65-strength-reach.control.mjs` was classified DID-NOT-ARM on a run where
     every arm armed perfectly: one of its SUITE'S ASSERTION NAMES is literally
     "the mutation the sensitivity arm needs actually applied (an arm that never
     armed is a finding)", and that assertion FAILING is the guard working. The
     driver's own declaration prose quotes the same sentence a second time. A
     matcher that reads a driver's commentary as its verdict manufactures
     findings, which is the same defect as missing them and is worse here,
     because this estate's rule is that a surprising result is a finding about
     the ARM — so a false one costs a real investigation.
     TWO SHAPES ARE EXCLUDED, both structural rather than a list of sentences:
     a line whose first token is an assertion RESULT (`PASS`/`FAIL`/`ok`/`not
     ok`), and a line where every hit sits inside BACKTICKS — a driver quoting a
     rule is talking ABOUT the rule. Excluded lines are still PRINTED, under
     their own heading, because a thing the matcher chose not to score must be
     named and never silently dropped. */
  const isResultLine = (l) => /^\s*(?:PASS|FAIL|ok|not ok)\b/i.test(l.trim());
  /* TWO MORE SHAPES, BOTH MEASURED ON THE RUN OF RECORD AND BOTH FINDINGS ABOUT
     THIS MATCHER RATHER THAN ABOUT A DRIVER.
     (c) A DRIVER REPORTING ITS OWN ZERO. `query.control.mjs` ends
     `arms run: 7 · arms that never armed: 0` — a clean bill of health, read by
     the first matcher as the opposite of what it says. **A count of zero is the
     GOOD news, and an instrument that cannot tell "none" from "some" is worse
     than one that cannot see either.** The driver's exit 0 disagreed with the
     verdict, which is how it was caught.
     (d) THE PHRASE AS A HYPHENATED NOUN. `dec65-strength-reach.control.mjs`
     DECLARES an arm against "the suite's own arm-did-not-arm guard" — the rule
     named as a thing, not a verdict about this run. */
  const reportsZero = (l) => /(?:never armed|did not arm|did-not-arm|arms? that never armed)\s*[:=]\s*0(?!\d)/i.test(l);
  const hyphenatedNoun = (l) => {
    const bare = l.replace(/\b[\w']*(?:arm-did-not-arm|did-not-arm)[\w']*\b/gi, "");
    return DID_NOT_ARM.some((re) => re.test(l)) && !DID_NOT_ARM.some((re) => re.test(bare));
  };
  const onlyInBackticks = (l) => {
    const bare = l.replace(/`[^`]*`/g, "");
    return DID_NOT_ARM.some((re) => re.test(l)) && !DID_NOT_ARM.some((re) => re.test(bare));
  };
  const rawHits = lines.filter((l) => DID_NOT_ARM.some((re) => re.test(l)));
  const prose = rawHits.filter((l) => isResultLine(l) || onlyInBackticks(l) || reportsZero(l) || hyphenatedNoun(l));
  const stale = rawHits.filter((l) => !prose.includes(l));
  /* M0-78 — the same two exclusions the union above earns, for the same reasons:
     a driver's own PROSE about thrown fixtures is not a thrown fixture, and a
     phrase inside backticks is a rule being named rather than a verdict. The
     `-1 pass, -1 fail` row is deliberately NOT excluded by the backtick rule:
     it is a measurement, and it is printed as one. */
  const threwRaw = lines.filter((l) => FIXTURE_THREW.some((re) => re.test(l)));
  const threw = threwRaw.filter((l) => {
    const bare = l.replace(/`[^`]*`/g, "");
    return /-1 pass, -1 fail/.test(l) || FIXTURE_THREW.some((re) => re.test(bare));
  });
  const wrong = lines.filter((l) => NOT_AS_DECLARED.some((re) => re.test(l)));

  /* A tally that cannot be read is reported as unknown, never as zero. */
  const arms = armLines.length ? armLines.length : null;

  /* A DRIVER THAT DIED MID-ARM LEAVES THE TREE PATCHED, and the next driver
     would then measure a tree nobody meant to hand it. Every driver here
     restores by sha256 AND cmp, so this should always read clean — which is
     exactly why it is CHECKED rather than assumed. The tracked-file diff is
     taken against the census's own starting state, so this worker's own
     uncommitted work does not read as a driver's residue. */
  const st = FROM_LOGS ? { stdout: DIRTY_AT_START }
    : spawnSync("git", ["status", "--porcelain", "--untracked-files=no"], { cwd: ROOT, encoding: "utf8" });
  const dirtyNow = (st.stdout || "").trim().split("\n").filter(Boolean).sort().join("\n");
  /* In `--from-logs` the tree question belongs to the run that produced the logs
     and is NOT re-asked here — answering it from today's tree would be a
     different measurement wearing the old run's name. */
  const leftDirty = FROM_LOGS ? false : dirtyNow !== DIRTY_AT_START;

  let verdict;
  if (r.error && r.error.code === "ETIMEDOUT") verdict = "TIMEOUT";
  else if (r.error) verdict = "SPAWN-ERROR";
  else if (stale.length) verdict = "DID-NOT-ARM";
  /* M0-78: A THROWN FIXTURE IS A DEAD ARM AND IS RANKED WITH THE STALE ANCHORS,
     ABOVE the exit-status test. That order is the whole fix. Put below it, a
     driver that exits 0 while one of its arms measured nothing reads ALL-ARMED —
     which is exactly how arms (C) and (H) passed this census, and a census that
     grades an unmeasured arm as armed is the defect it exists to catch, one
     level up. It is a SEPARATE verdict from DID-NOT-ARM rather than folded into
     it, because the two need different repairs: a stale anchor is re-anchored,
     a thrown fixture is repaired in the SUITE. Collapsing them would point the
     next reader at the wrong file. */
  else if (threw.length) verdict = "FIXTURE-THREW";
  else if (r.status === 0) verdict = "ALL-ARMED";
  else verdict = "UNCLASSIFIED";   // non-zero exit, no recognised stale phrase

  /* ------------------------------------------------------------------ D-333
     THE DECLARED TALLY, HELD AGAINST THE RUN. A driver's arm count is a CLAIM
     ABOUT A RUN — no static check can falsify it, which is why D-330 found two
     drivers whose anchors were all live and whose expectations were false. This
     census is the only instrument that HAS the run, so the comparison is made
     here. `null` on either side is UNKNOWN and never a verdict: an unreadable
     declaration and a declaration of none are different claims. */
  const declared = (() => { try { return readDeclaredArms(readFileSync(abs, "utf8")); } catch { return null; } })();
  /* A DRIVER THAT DID NOT RUN TO COMPLETION HAS NO MEASURED TALLY, AND THE FIRST
     FULL RUN OF THIS COMPARISON PROVED IT THE HARD WAY. `fieldread.control.mjs`
     hit the per-driver timeout mid-run — it runs the WHOLE BATTERY inside each of
     its arms — and was SIGTERMed after announcing ten of its twelve. The
     comparison then read `DECLARES 12 · ANNOUNCED 10` and scored it decay, which
     is a manufactured finding about a driver whose declaration is fine: the
     announcements were simply truncated by the kill. This census's own header
     already says it "says nothing about drivers it could not run", and that rule
     now binds the tally too — a count from a partial run is not a measurement. */
  const completed = !(r.error || r.signal);
  const tallyOk = completed ? tallyHonoured(declared, arms) : null;

  return { ...d, ms, status: r.status, signal: r.signal, verdict, arms, leftDirty, dirtyNow,
           armLines, preflightLines, declared, tallyOk, threw,
           stale, prose, wrong, out, err: r.error ? String(r.error.message) : null };
}

/* -------------------------------------------------------------------- REPORT */
const DIRTY_AT_START = FROM_LOGS ? "" : (() => {
  const st = spawnSync("git", ["status", "--porcelain", "--untracked-files=no"], { cwd: ROOT, encoding: "utf8" });
  return (st.stdout || "").trim().split("\n").filter(Boolean).sort().join("\n");
})();

/* The previous run's exit codes and durations, read from the summary it wrote.
   Used only by `--from-logs`; absent means `?`, never 0. */
const PRIOR_EXITS = new Map(), PRIOR_MS = new Map();
if (FROM_LOGS) {
  const p = join(LOGS, "..", "census-summary.txt");
  if (existsSync(p)) for (const line of readFileSync(p, "utf8").split("\n")) {
    const c = line.split("\t");
    if (c.length < 5) continue;
    const rel = c[4].split(" ")[0];
    PRIOR_EXITS.set(rel, c[1] === "null" ? null : Number(c[1]));
    PRIOR_MS.set(rel, Number(String(c[3]).replace("s", "")) * 1000);
  }
}

const drivers = enumerate();
const missingDirs = drivers.filter((d) => d.missingDir).map((d) => d.missingDir);
const conv = drivers.filter((d) => d.rel);
const all = [...conv, ...OFF_CONVENTION.map((d) => ({ ...d, convention: false }))];
const chosen = ONLY.length
  ? all.filter((d) => ONLY.some((o) => d.rel === o || basename(d.rel) === o))
  : all;

console.log(`M0-25 · THE ARM-LIVENESS CENSUS — ${new Date().toISOString()}`);
console.log(`root: ${ROOT}`);
console.log(`\nREACH`);
console.log(`  test dirs looked in            : ${TEST_DIRS.length} (${TEST_DIRS.map((d) => d.dir).join(", ")})`);
console.log(`  dirs absent                    : ${missingDirs.length ? missingDirs.join(", ") : "none"}`);
console.log(`  drivers by the CONVENTION      : ${conv.length}  (\`*.control.mjs\`)`);
console.log(`  drivers the convention MISSES  : ${OFF_CONVENTION.length}`);
for (const d of OFF_CONVENTION) console.log(`      ${d.rel}${d.args.length ? ` ${d.args.join(" ")}` : ""}\n        — ${d.why}`);
console.log(`  total in this census           : ${all.length}`);
if (ONLY.length) console.log(`  RESTRICTED BY --only to        : ${chosen.length}`);

/* Per-directory census, so a reader can see the distribution rather than a total. */
const byDir = {};
for (const d of conv) { const k = dirname(d.rel); byDir[k] = (byDir[k] || 0) + 1; }
console.log(`\n  by directory:`);
for (const [k, v] of Object.entries(byDir).sort()) console.log(`      ${String(v).padStart(3)}  ${k}`);
for (const { dir } of TEST_DIRS) if (!byDir[dir]) console.log(`        0  ${dir}   (looked in; holds no \`*.control.mjs\`)`);

if (LIST_ONLY) { console.log(`\n--list: enumerated only, nothing run.`); process.exit(0); }

mkdirSync(LOGS, { recursive: true });
/* In `--from-logs` the ORIGINAL summary is the run's own receipt and is never
   overwritten by a re-reading of it. */
const SUMMARY = join(LOGS, "..", FROM_LOGS ? "census-summary-reclassified.txt" : "census-summary.txt");
writeFileSync(SUMMARY, `M0-25 census — ${new Date().toISOString()}\n`);

const results = [];
console.log(`\nRUNNING ${chosen.length} DRIVERS, STRICTLY SEQUENTIALLY (they edit real sources).`);
console.log(`per-driver timeout: ${TIMEOUT_S}s · logs: ${LOGS}\n`);
for (const d of chosen) {
  process.stdout.write(`  ${d.rel.padEnd(56)} `);
  const r = runDriver(d);
  results.push(r);
  if (!FROM_LOGS) writeFileSync(logPathFor(d), r.out);
  const armsTxt = r.arms === null ? "arms=?" : `arms=${r.arms}`;
  const tallyTxt = r.declared === null ? "decl=?" : `decl=${r.declared.n}${r.declared.plusBaseline ? "+b" : ""}`;
  console.log(`${String(r.verdict).padEnd(13)} exit=${String(r.status)} ${armsTxt.padEnd(9)} ${tallyTxt.padEnd(9)} ${(r.ms / 1000).toFixed(1)}s`
    + `${r.tallyOk === false ? "  <<< TALLY NOT AS DECLARED" : ""}`
    + `${r.stale.length ? `  <<< ${r.stale.length} STALE LINE(S)` : ""}${r.leftDirty ? "  <<< LEFT THE TREE DIRTY" : ""}`);
  appendFileSync(SUMMARY, `${r.verdict}\t${r.status}\t${r.arms ?? "?"}\t${(r.ms / 1000).toFixed(1)}s\t${d.rel}${d.args.length ? " " + d.args.join(" ") : ""}\n`);
  /* STOP AT THE FIRST DIRTY TREE. Everything measured after a driver dies
     mid-arm is measured against somebody else's patch, and a wrong result that
     looks like a result is the exact defect this census exists to find. */
  if (r.leftDirty) {
    console.log(`\n${"!".repeat(78)}`);
    console.log(`STOPPING: ${d.rel} left the tree MODIFIED relative to this run's start.`);
    console.log(`Everything after this point would measure a tree nobody meant to hand it.`);
    console.log(`The residue, against the run's own starting state:`);
    for (const l of r.dirtyNow.split("\n").filter((l) => !DIRTY_AT_START.includes(l))) console.log(`    ${l}`);
    console.log(`RESTORE the named paths, VERIFY the restore (sha256 against the HEAD blob and a`);
    console.log(`floored byte count — a restore is only believable if it is measured), then resume`);
    console.log(`with --only over the drivers this run did not reach. ${chosen.length - results.length} were not reached.`);
    console.log(`${"!".repeat(78)}`);
    break;
  }
}

console.log(`\n${"=".repeat(78)}\nFINDINGS\n${"=".repeat(78)}`);
const staleDrivers = results.filter((r) => r.verdict === "DID-NOT-ARM");
if (!staleDrivers.length) console.log(`  none: no driver reported an unarmed arm in any spelling this matcher knows.`);
for (const r of staleDrivers) {
  console.log(`\n  ${r.rel}  (exit ${r.status})`);
  for (const l of r.stale) console.log(`      ${l.trim()}`);
}

/* ==================================================================== M0-78
   THE ARM THAT ARMED AND MEASURED NOTHING. Reported in its own block, ABOVE the
   prose hits and beside the stale anchors, because it is a DEAD ARM by a
   different mechanism and wants a different repair: a stale anchor is
   re-anchored in the DRIVER, a thrown fixture is repaired in the SUITE. */
const threwDrivers = results.filter((r) => r.verdict === "FIXTURE-THREW");
console.log(`\n${"-".repeat(78)}\nFIXTURE THREW — THE ARM ARMED AND MEASURED NOTHING (M0-78)`);
console.log(`An arm here patched a LIVE anchor and then drove a suite that died before evaluating`);
console.log(`a single assertion, so its declared \`mustFail\` was never reached. D-331's preflight`);
console.log(`cannot see this BY CONSTRUCTION: it proves the ANCHOR is live, never that the FIXTURE`);
console.log(`runs. The only trace is an ABSENT tally, which no phrase table can match, so the`);
console.log(`suite's own \`-1\` (never 0) is what is read. Counted as a DEAD ARM, never passed.`);
if (!threwDrivers.length) console.log(`  none: every arm this census ran produced a tally to be judged on.`);
for (const r of threwDrivers) {
  console.log(`\n  ${r.rel}  (exit ${r.status})`);
  for (const l of r.threw) console.log(`      ${l.trim()}`);
}

const proseHits = results.filter((r) => r.prose && r.prose.length);
if (proseHits.length) {
  console.log(`\n${"-".repeat(78)}\nPROSE HITS, NOT SCORED — a driver quoting the rule, or an assertion NAME that`);
  console.log(`carries the words. Printed because a thing the matcher declined to score must be`);
  console.log(`named. Read these before believing the verdict beside them.`);
  for (const r of proseHits) {
    console.log(`\n  ${r.rel}  (verdict ${r.verdict})`);
    for (const l of r.prose.slice(0, 6)) console.log(`      ${l.trim().slice(0, 150)}`);
  }
}

const unclassified = results.filter((r) => r.verdict === "UNCLASSIFIED");
if (unclassified.length) {
  console.log(`\n${"-".repeat(78)}\nUNCLASSIFIED — non-zero exit, no stale phrase this matcher recognises.`);
  console.log(`THESE ARE NOT SCORED AS EITHER OUTCOME. Read the log.`);
  for (const r of unclassified) {
    console.log(`\n  ${r.rel}  (exit ${r.status}${r.signal ? `, signal ${r.signal}` : ""})`);
    for (const l of r.wrong.slice(0, 8)) console.log(`      ${l.trim()}`);
    const tailLines = r.out.split("\n").filter((l) => l.trim()).slice(-6);
    for (const l of tailLines) console.log(`      | ${l.trim()}`);
  }
}

const notRun = results.filter((r) => r.verdict === "TIMEOUT" || r.verdict === "SPAWN-ERROR");
if (notRun.length) {
  console.log(`\n${"-".repeat(78)}\nNOT RUN TO COMPLETION — named with the reason, never skipped silently.`);
  for (const r of notRun) console.log(`  ${r.rel}: ${r.verdict}${r.err ? ` — ${r.err}` : ""} after ${(r.ms / 1000).toFixed(1)}s`);
}

/* ===================================================================== D-333
   DECLARED vs MEASURED. The half M0-25's witness is structurally blind to: a
   driver whose every anchor is perfectly live and whose NUMBER is false. A
   mismatch is a FINDING and it is counted into this instrument's exit code,
   because a figure nobody can falsify trains every session to trust it (D-231).
   `?` on either side is UNKNOWN and is listed apart — never scored as agreement,
   which would be the generous direction on a tally that is about to be a gate. */
const tallyWrong = results.filter((r) => r.tallyOk === false);
const tallyBlind = results.filter((r) => r.tallyOk === null);
console.log(`\n${"-".repeat(78)}\nDECLARED vs MEASURED ARM TALLIES (D-333) — a driver states its arm count in its own`);
console.log(`head; this census is the only instrument that has the RUN to hold it against. A`);
console.log(`baseline is an ANNOUNCEMENT and not a declared arm, so "N arms plus a baseline" honours`);
console.log(`N or N+1 and nothing else.`);
if (!tallyWrong.length) console.log(`  none: every driver whose declaration AND announcements are both readable agrees with itself.`);
for (const r of tallyWrong) {
  console.log(`  <<< ${r.rel}`);
  console.log(`      DECLARES ${r.declared.n}${r.declared.plusBaseline ? " plus a baseline" : ""} (\`${r.declared.phrase}\`) · ANNOUNCED ${r.arms}`);
}
if (tallyBlind.length) {
  console.log(`\n  UNKNOWN on one side or both — NOT scored as agreement, named instead:`);
  for (const r of tallyBlind) console.log(`      ${r.rel}  (declared ${r.declared === null ? "?" : r.declared.n} · announced ${r.arms ?? "?"})`);
}

/* ===================================================================== D-331
   THE PREFLIGHT TABLES. A driver that validates every anchor before it arms
   anything reports its WHOLE anchor set in one run, so a dead anchor can no
   longer hide the arms behind it. Printed here so the census reader gets the set
   rather than only the first casualty. */
const preflighted = results.filter((r) => r.preflightLines && r.preflightLines.length);
console.log(`\n${"-".repeat(78)}\nANCHOR PREFLIGHTS (D-331) — ${preflighted.length} driver(s) validated their whole anchor set`);
console.log(`BEFORE arming. In a throwing driver without this pass, a zero-match anchor ends the run`);
console.log(`and every arm behind it goes unmeasured AND unreported (casepin: 4 stale, 1 visible).`);
for (const r of preflighted) {
  const bad = r.preflightLines.filter((l) => /<<</.test(l));
  /* The ROWS, not the heading. `--- ARM PREFLIGHT · <driver>` is the table's own
     title and counting it read casepin as 7 anchors against a printed 6 — an
     off-by-one in the instrument, caught by reading its output against the
     driver's, and exactly the class of figure this estate keeps paying for. */
  console.log(`  ${r.rel}: ${r.preflightLines.filter((l) => /ARM PREFLIGHT\s+\S+\s+(?:ok|<<<)/.test(l)).length} anchor(s), ${bad.length} NOT LIVE`);
  for (const l of bad) console.log(`      ${l.trim()}`);
}

const unknownArms = results.filter((r) => r.arms === null);
if (unknownArms.length) {
  console.log(`\n${"-".repeat(78)}\nARM COUNT UNREADABLE (announcement shape not in the matcher's union) — printed as`);
  console.log(`unknown, NEVER as zero. The verdict for these still stands; only the tally is blind.`);
  for (const r of unknownArms) console.log(`  ${r.rel}`);
}

const dirtyDrivers = results.filter((r) => r.leftDirty);
if (dirtyDrivers.length) {
  console.log(`\n${"-".repeat(78)}\nLEFT THE TREE DIRTY — a driver that died mid-arm hands the NEXT driver a tree`);
  console.log(`nobody meant it to measure. Every result AFTER one of these is suspect.`);
  for (const r of dirtyDrivers) console.log(`  ${r.rel}\n${r.dirtyNow.split("\n").map((l) => `      ${l}`).join("\n")}`);
} else {
  console.log(`\nTREE: every driver restored — the tracked-file diff after each run equals the`);
  console.log(`census's own starting state. Checked, not assumed.`);
}

const tally = {};
for (const r of results) tally[r.verdict] = (tally[r.verdict] || 0) + 1;
const armsTotal = results.reduce((a, r) => a + (r.arms || 0), 0);
console.log(`\n${"=".repeat(78)}\nTHE FIGURE`);
console.log(`  drivers found        : ${all.length}  (${conv.length} by convention + ${OFF_CONVENTION.length} off-convention)`);
console.log(`  drivers RUN          : ${results.length}`);
console.log(`  arms announced       : ${armsTotal}  (over ${results.length - unknownArms.length} drivers whose announcements this matcher reads; ${unknownArms.length} unreadable)`);
console.log(`  drivers with a STALE arm : ${staleDrivers.length}`);
console.log(`  drivers whose FIXTURE THREW : ${threwDrivers.length}  (M0-78 — an armed anchor that measured nothing)`);
console.log(`  declared tallies read : ${results.filter((r) => r.declared !== null).length} of ${results.length}  (the rest report UNKNOWN, never zero)`);
console.log(`  tally NOT AS DECLARED : ${tallyWrong.length}   ·   tally unknown on one side: ${tallyBlind.length}`);
console.log(`  anchor preflights     : ${preflighted.length} driver(s) reported their whole anchor set before arming`);
for (const [k, v] of Object.entries(tally).sort()) console.log(`      ${k.padEnd(14)} ${v}`);
console.log(`\nsummary written to ${SUMMARY}`);

/* The census EXITS NON-ZERO on a stale arm. A census that always exits 0 is a
   report, not a gate — and this item exists because nothing gated.
   EXTENDED 2026-09-14 (D-333): a declared tally the run contradicts is the same
   kind of failure one level out — the anchors are live and the CLAIM is false —
   so it carries the same exit. An UNKNOWN on either side does NOT, because an
   unreadable declaration is a gap in this instrument and not a defect in the
   driver, and gating on it would make the reach figure a punishment. */
/* EXTENDED 2026-09-19 (M0-78): a thrown fixture carries the same exit. It is an
   arm that produced no measurement, which is the same failure as an arm that
   never armed — and the whole reason this row existed is that two such arms sat
   on a green `main` being counted as coverage. A dead arm that exits 0 is the
   defect, not the report of it. */
process.exit(staleDrivers.length || tallyWrong.length || threwDrivers.length ? 1 : 0);
