/* NEGATIVE CONTROL: run 2026-09-13 under M0-25, each arm ALONE against the REAL tree with every other defence held open, restores verified by sha256 AND `cmp` against uniquely-named per-arm pristine copies with the byte count printed and floored — the driver is `test/m025-anchor-witness.control.mjs` and re-runs every arm in one step. (1) THE ARM THIS SUITE EXISTS FOR, and it is the D-276 class reproduced exactly: change a line IN PLACE in a subject a control driver quotes (`agent-worker/src/index.mjs`'s `MEANING_ARM` call site, the very line D-276 moved) so the driver's anchor now matches zero times -> arm A4 FAILS naming the driver, the anchor and the subject, while the driver's own file is untouched and every other arm holds. (2) THE OVER-STRICTNESS DIRECTION — re-spell the same line in a way the quote still matches (whitespace outside the anchor's span) -> NOTHING fails, because a fence tighter than its rule is an undeclared interface change wearing the costume of caution. (3) THE REACH ARM, because a detector that finds nothing passes every clean corpus: neuter the extractor so it reads no anchor at all -> the corpus floors FAIL (A1/A2/A3) while the zero-match arm A4 reports a triumphant empty list, which is exactly why the floors are asserted and printed rather than assumed. (4) THE MULTIPLICITY HALF — plant a SECOND copy of an anchored line in its subject so the anchor occurs twice -> A5 FAILS naming the driver and the file, which is the "anchor occurred twice" receipt WORKER.md records and which silently disarms a first-occurrence patch. (5) THE NAMED LIST'S OWN STALENESS — remove one deliberate multi-occurrence closure from its subject -> A6 FAILS naming the entry that has stopped being true, so a naming cannot outlive the thing it named. (6) THE BASELINE, and it is not decoration: nothing armed -> every arm green, which is what distinguishes five-arms-broken from five-arms-working.
 *
 * NEGATIVE CONTROL — EXTENDED 2026-09-14 (D-329 + D-331 + D-333), seven arms added to the same driver, each ALONE, restores verified by sha256 AND `cmp`; all thirteen arms of the driver ran and twelve were as declared first time. (7) THE COMPOSED-LABEL ARM, and it is this item's reason to exist: put D-329's own historical defect back into `aicredential.control.mjs` — a `mustNotFail` fragment carrying the rendered count `26` against a label the suite composes -> L3 FAILS naming the driver, naming `aicredential.test.mjs` as the composer, and naming `"26"` as the value that sat in the slot, while A4, A5 and every S-arm stay green so the LABEL half and the ANCHOR half are measurably distinguishable. **THE EDIT IS ADDITIVE AND ITS FIRST SPELLING WAS NOT** — replacing the fragment consumed this driver's own edit-tuple anchor and A4 fired on the arm itself, which is the estate's self-citation receipt in a new costume. (8) THE OVER-STRICTNESS DIRECTION — the same fragment re-spelled to start MID-SEGMENT, still quoting only the invariant part -> NOTHING fails, because a fence tighter than its rule is an undeclared interface change wearing the costume of caution. (9) THE LABEL REACH ARM — neuter `isLabelQuote` so no label is read at all -> L1 and S9 FAIL while L3 reports a triumphant EMPTY LIST, which is exactly why the reach is floored and printed. (10) D-331's ARM, run against `casepin.control.mjs` rather than this suite: stale TWO anchors in `src/store.mjs`, one belonging to arm (a) and one shared by (e) and (f) -> the preflight reports ALL SIX rows with THREE not live and names an arm BEHIND the first casualty, and the driver refuses to arm anything. Before the preflight this run reported ONE casualty and died. (11) ITS OVER-STRICTNESS DIRECTION — a healthy `casepin` preflights all-live, runs its baseline arm green and exits 0. (12) D-333's ARM, run against the CENSUS: decay `casesign.control.mjs`'s head from five arms to four WITHOUT MOVING ONE ANCHOR -> the census reports `TALLY NOT AS DECLARED` naming casesign with both numbers and exits non-zero, while reporting ZERO stale arms — the two decay shapes stay separable. (13) ITS OVER-STRICTNESS DIRECTION — `casepin`, whose corrected declaration now agrees with its run, leaves the tally section silent and the census at exit 0. **ONE PRE-EXISTING ARM CORRECTED, NEVER EXEMPTED**: A5 declared `mustNot: A4` and returned [A4, A6], measured identically on a pristine `origin/main` worktree at `b0eddbf` — its patch necessarily consumes its own anchor, so A4 is a correct consequence; the declaration now requires A4 to fail with EXACTLY this driver's own anchor in its finding list.
 *
 * m025-arm-anchor-witness.test.mjs — M0-25. THE ANCHOR-LIVENESS CHECK THE
 * BATTERY RUNS, AND WHAT IT DELIBERATELY DOES NOT CLAIM.
 *
 * WHY THIS FILE EXISTS, measured rather than argued. D-323 re-ran the only two
 * control drivers its own subject touched and found BOTH carrying arms that no
 * longer arm — `harness.control.mjs` H8 and `fanout.control.mjs` F4b, each killed
 * by D-276 changing the LINE THE ARM QUOTES without moving the arm's copy of it.
 * One was the arm whose whole job is proving `fanout`'s strongest assertion CAN
 * fail. Both sat half-armed on a green `main` for a month, and the only reason
 * either surfaced was an item happening to touch its subject. M0-25's census
 * (`test/m025-arm-census.mjs`) then ran the whole estate and found more. **A
 * census is a periodic act, and the defect it finds is created by an ORDINARY
 * EDIT on any day between two censuses.** This suite is the part of the census
 * that can run on every battery.
 *
 * ========================================================================
 * THE DECISION M0-25 OWED, TAKEN HERE RATHER THAN DEFERRED, AND THE DECLINED
 * OPTION PRICED.
 *
 * The row asked whether a cheap check could assert each arm's anchor occurs
 * exactly once in its subject WITHOUT running the arms, or whether the census
 * must stay periodic. **It can, for a MEASURED FRACTION of the estate, and the
 * fraction is printed by this suite on every run rather than claimed here.**
 * That is the whole decision, and the honesty is in the word `fraction`.
 *
 * WHAT THE CHECK IS. Every control driver in this estate arms by quoting a line
 * of its subject verbatim and requiring that quote to occur a declared number of
 * times — `patch()`'s `n !== 1`, `uniq()`, `count(s, x, 2)`. The quote is a
 * STRING LITERAL sitting in the driver's source in an anchor-bearing position.
 * So the liveness of an arm is a STATIC property of two files, and this suite
 * reads it: extract the literals, count them in the estate, and a literal that
 * occurs ZERO times is an arm that cannot arm.
 *
 * WHAT WAS DECLINED, AND WHAT IT WOULD HAVE COST. The alternative shape was to
 * give every driver a `--dry-anchors` mode and have a battery suite spawn all 87
 * of them for their self-reported anchor tables. **It is the more complete
 * answer and it was not free of the defect it fixes.** Priced honestly: it
 * reaches 100% of arms rather than this suite's measured fraction, including
 * every anchor built by interpolation at run time, which is the half this suite
 * is blind to and says so. Against that — it is an edit to 87 files written by
 * dozens of items over two months, with no shared harness between them (they
 * report an unarmed arm in eleven different spellings; there is no `arm()` to
 * change once); each of those 87 edits is a new place for the SAME staleness to
 * live one level up, since a `--dry-anchors` table that stops matching its own
 * arm table is exactly this defect wearing a third costume; and spawning 87 node
 * processes is not a <1s battery suite. **The declined option is the right one
 * the day this estate grows a shared arm harness, and that is the trigger to
 * record rather than a preference to hold.** Until then it buys completeness
 * with 87 new staleness sites, which is the trade this item exists to refuse.
 *
 * AND THE CENSUS STAYS. This suite does NOT retire `m025-arm-census.mjs`, and
 * saying so is load-bearing: the census RUNS the arms, so it sees an arm that
 * arms correctly and then measures nothing, an arm whose declaration is wrong,
 * and every arm this suite cannot extract. The two instruments are not
 * duplicates — this one runs on every battery and sees a fraction; the census
 * runs periodically and sees everything, at ~an hour of machine time.
 *
 * ========================================================================
 * WHAT THIS SUITE CANNOT SEE. Stated here because a matcher's reach is the one
 * thing the next reader cannot re-derive, and because this estate has now twice
 * recorded an instrument that reported a triumphant figure over a corpus it had
 * narrowed to nothing.
 *
 *   - **It reads only anchors that are LITERAL.** An anchor assembled at run
 *     time — a template with `${…}`, a string built from a variable, a RegExp —
 *     is invisible to it. The reach figure below is printed every run and names
 *     the drivers from which it extracted NOTHING, so the blind half is a list,
 *     not a silence.
 *   - **It counts occurrences across a CANDIDATE CORPUS, not in the arm's
 *     resolved subject.** Resolving `file: COVERAGE` to a path means constant-
 *     folding the driver, and this suite does not run the driver. The claim it
 *     makes is therefore weaker than "exactly once in its subject" and is the
 *     one it can support: **the anchor occurs somewhere a driver could be
 *     quoting, and in no single file more than once unless a driver DECLARES the
 *     multiplicity.** A zero is unambiguous — the D-276 class — and that is the
 *     half that cost this estate a month.
 *   - **It cannot see an arm that arms and then asserts the wrong thing**, an
 *     arm deleted from a table, or a driver deleted entirely. The census sees
 *     the first; the driver-count floor below sees the third.
 *   - **It cannot see a subject the driver WRITES at run time** — a fixture the
 *     driver composes and then patches. Those anchors correctly match nothing in
 *     the committed estate and would read as findings, so they are NAMED below
 *     with the reason, the same shape `hygiene.test.mjs` uses for its walks.
 *
 * ========================================================================
 * EXTENDED 2026-09-14 BY D-329 + D-333. TWO MORE DECAY SHAPES, AND THE FIRST
 * OF THEM OVERTURNS ITS OWN DEBT ROW'S CONCLUSION.
 * ========================================================================
 *
 * Everything above is about an ANCHOR — a line of SOURCE a driver quotes. Two
 * other things a driver holds decay independently of any anchor, and M0-25's
 * census found both after this suite was written.
 *
 * **THE LABEL HALF (D-329), AND THE ROW SAID IT WAS IMPOSSIBLE.** A driver also
 * quotes the SUITE'S OWN ASSERTION NAMES — the `mustFail` / `mustNotFail`
 * fragments it expects among the failing assertions. D-329's row concluded that
 * *"an assertion label composed at run time exists in no file, so no static
 * instrument can see it and only a periodic census can."* **That is true of the
 * RENDERED label and false of the TEMPLATE**, which sits in the suite in plain
 * sight. `composedSpan()` in `scripts/armdecay.mjs` is the predicate: a fragment
 * that resolves against a template ONLY BY EATING AN INTERPOLATION SLOT is a
 * fragment quoting a rendered value, and the gap it ate is that value. Arms L1
 * to L4 below run it over the estate every battery. The row is closed on the
 * strength of the measurement, not of the argument: the historical 26-ops
 * fragment is caught by name with `gap: "26"`, and the hand repair that replaced
 * it — quoting only the invariant part — passes, which is the over-strictness
 * direction and is arm (8) of the control.
 *
 * **THE LABEL EXTRACTION IS AN INVERSION, AND MEASUREMENT FORCED IT.** A matcher
 * keyed on the property name `mustFail:` reads 140 quotes from 9 drivers **and
 * cannot see `aicredential.control.mjs` at all** — D-329's own exhibit passes its
 * fragments as POSITIONAL ARGUMENTS to `arm(title, edits, mustFail, mustNotFail)`.
 * Asking instead what a LABEL IS (prose, one line, no statement punctuation, as
 * against an anchor, which is code) reads 2,640 from 87 of 88. A list of key
 * spellings would have gone stale at the first driver that did not use one, and
 * the first driver that did not use one was the one the row was about.
 *
 * **THE TALLY HALF (D-333) IS HERE ONLY AS ITS READER.** A driver's DECLARED arm
 * count — *"five arms plus a baseline"* — is a claim about a RUN, so nothing
 * static can falsify it; D-330 found two drivers whose anchors were all live and
 * whose expectations were false. The comparison therefore belongs to the census,
 * which runs the drivers, and it is asserted there. What this suite owes is that
 * the READER is honest: arm T1 floors its reach and NAMES every driver it cannot
 * read, so a tally-reader narrowed to nothing cannot report a clean estate. The
 * same null-never-zero rule `control-register.mjs` states for its own grammar.
 */

import "./stdio.mjs";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readGitProvenance, classifyDiscovered, repoPath } from "../scripts/provenance.mjs";
import { readLabelQuotes, isLabelQuote, templatePairs, indexPairs, composedSpan,
         readDeclaredArms, tallyHonoured, stripComments,
         MIN_SIDE, MAX_GAP } from "../scripts/armdecay.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = fileURLToPath(new URL("../../", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ------------------------------------------------------------------ THE ESTATE
   Six test directories, named so `newgroup/test` is recorded as LOOKED IN and
   holding no driver rather than being absent from a list for an unstated
   reason. The convention is `*.control.mjs`; the four instruments it misses are
   enumerated beside it, because "we also checked some others" is not a reach. */
const TEST_DIRS = ["agent-worker/test", "bio-plane/test", "civicos-ui/test",
                   "newgroup/test", "ocr-worker/test", "pdf-worker/test"];
const OFF_CONVENTION = [
  "bio-plane/test/cpdf16-floor-controls.mjs",
  "bio-plane/test/d315-guard-controls.mjs",
  "bio-plane/test/ocr-composed-probe.mjs",
  "bio-plane/test/cpdf15-tesseract-runtime.probe.mjs",
];

const drivers = [];
for (const d of TEST_DIRS) {
  const abs = join(REPO, d);
  if (!existsSync(abs)) continue;
  for (const f of readdirSync(abs).sort()) if (f.endsWith(".control.mjs")) drivers.push(`${d}/${f}`);
}
for (const f of OFF_CONVENTION) if (existsSync(join(REPO, f))) drivers.push(f);

/* ---------------------------------------------------------------- THE CORPUS
   Everything a driver plausibly quotes. The control drivers THEMSELVES are
   excluded, and that exclusion is the difference between a real measurement and
   a sweep that passes by citing itself — a driver's own `find:` and `replace:`
   both contain the anchor, so an unexcluded corpus scores every anchor as
   present no matter what its subject holds. Measured: 128 anchors read 96
   "duplicated" against a self-including corpus and 3 against this one. */
/* PROBES ARE SUBJECTS AND STAY IN, and this was MEASURED rather than reasoned:
   excluding every `*probe*.mjs` made `d315-guard-controls.mjs`'s anchor read ZERO
   and this suite reported a false finding on its first run. D-315's driver quotes
   `test/ocr-measure-probe.mjs` — a probe is a comparability instrument, which is
   exactly the kind of file a control driver guards. The two probes that are ALSO
   drivers (`--controls`) patch COPIES OF THEMSELVES, so their anchors occurring in
   their own source is the correct answer rather than a self-citation. What must
   stay out is the `*.control.mjs` / `*-controls.mjs` set, where an anchor appears
   in the arm's `find` AND its `replace` and every anchor would score present no
   matter what its subject held (measured: 96 "duplicated" against a self-including
   corpus, 3 against this one). */
const IS_DRIVER = (p) => /\.control\.mjs$|-controls\.mjs$|m025-arm-(census|anchor-witness)/.test(p);
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === ".git" || e.startsWith(".")) continue;
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(mjs|js|html|json|css|md)$/.test(e) && s.size < 8e6) out.push(p);
  }
  return out;
}
const corpusPaths = [
  ...walk(join(REPO, "bio-plane/src")), ...walk(join(REPO, "bio-plane/checks")),
  ...walk(join(REPO, "bio-plane/scripts")), ...walk(join(REPO, "bio-plane/test")),
  ...walk(join(REPO, "agent-worker/src")), ...walk(join(REPO, "agent-worker/test")),
  ...walk(join(REPO, "ocr-worker/src")), ...walk(join(REPO, "ocr-worker/test")),
  ...walk(join(REPO, "pdf-worker/src")), ...walk(join(REPO, "pdf-worker/test")),
  ...walk(join(REPO, "civicos-ui")),
  /* `docs/development/` is in the corpus because two of `register-grammar.control.mjs`'s
     arms quote VERIFICATION.md — a control driver's subject is not always code, and a
     corpus that assumed it was would have reported those two as stale. Measured, not
     anticipated: they were the first two false findings this extractor produced. */
  ...walk(join(REPO, "docs/development")).filter((p) => p.endsWith(".md")),
].filter((p) => !IS_DRIVER(p));

const corpus = new Map();
for (const p of corpusPaths) { try { corpus.set(repoPath(REPO, p), readFileSync(p, "utf8")); } catch { /* unreadable: not counted, and the floor below is what notices */ } }

/* --------------------------------------------------------------- EXTRACTION
   An anchor-bearing POSITION, not "any long string". Seven shapes, taken from
   reading the estate rather than from a guess, and the union is a FLOOR: a
   driver that invents an eighth is invisible here and shows up in the printed
   list of drivers this suite extracted nothing from. */
const LIT = String.raw`(?:"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\`(?:[^\\\`]|\\.)*\`)`;
const PATTERNS = [
  ["find:",        new RegExp(String.raw`\bfind\s*:\s*(${LIT})`, "g")],
  ["anchor=",      new RegExp(String.raw`\banchor\w*\s*=\s*(${LIT})`, "g")],
  [".replace(",    new RegExp(String.raw`\.replace\(\s*(${LIT})\s*,`, "g")],
  [".replaceAll(", new RegExp(String.raw`\.replaceAll\(\s*(${LIT})\s*,`, "g")],
  [".includes(",   new RegExp(String.raw`\.includes\(\s*(${LIT})\s*\)`, "g")],
  [".split(",      new RegExp(String.raw`\.split\(\s*(${LIT})\s*\)`, "g")],
  ["edit-tuple",   new RegExp(String.raw`\[\s*\w+\s*,\s*(${LIT})\s*,\s*${LIT}\s*\]`, "g")],
  /* ADDED 2026-09-13 MID-ITEM, AND IT IS THE CENSUS PAYING FOR THIS SUITE. The
     runtime census found six drivers with dead anchors; THREE of them
     (`casepin`, `casesign`, `caseproduction`) write their arms as
     `edit(SUBJECT, "<anchor>", "<replacement>")` — a CALL, not a key and not a
     method on a source string — and the first seven shapes read none of it. The
     eighth shape this suite's own header predicted somebody would invent was
     already there, in the drivers the runtime half had just caught. Adding it
     moved the reach from 30 drivers to more, and the figure is printed below
     rather than claimed here. */
  ["edit(…)",      new RegExp(String.raw`\bedit\w*\(\s*\w+\s*,\s*(${LIT})\s*,`, "g")],
];

function unquote(s) {
  const q = s[0], body = s.slice(1, -1);
  if (q === "`") return body.replace(/\\`/g, "`").replace(/\\\\/g, "\\").replace(/\\n/g, "\n");
  try { return JSON.parse(q === "'" ? `"${body.replace(/\\'/g, "'").replace(/"/g, '\\"')}"` : s); }
  catch { return null; }
}

/* The filters, each one a statement about what an ANCHOR is rather than a
   convenience: it must be literal (no interpolation), long enough to be a quoted
   line rather than a word, and carry code-shaped punctuation. Loosening any of
   them is the over-strictness direction and is what arm (2) of the control
   drives. */
function extract(src) {
  const out = [];
  for (const [shape, re] of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) {
      const lit = unquote(m[1]);
      if (lit === null || lit.includes("${") || lit.length < 20) continue;
      if (!/[(){};=.\[\]<>]/.test(lit)) continue;
      out.push({ shape, lit });
    }
  }
  return out;
}

/* ------------------------------------------------------------- THE NAMINGS
   A defect is not a deliberate closure, and this estate's rule is that the
   difference is WRITTEN DOWN at the site. Each entry below is an anchor whose
   count is not one ON PURPOSE, with the reason; `A6` fails when an entry stops
   being true, so a naming cannot outlive the thing it named. */
const NAMED_MULTI = [
  { driver: "bio-plane/test/query.control.mjs",
    match: "let raw = String(tok.value);",
    why: "DELIBERATE, and the driver says so at the site: `let raw = String(tok.value);` occurs twice — in "
       + "`selector()` and in `meaningAtom()` — and the arm's own `count(s, x, 2)` guard ASSERTS the two before "
       + "patching both, because an equivalent-mechanism revert that fixed only one would fail the arm for a "
       + "reason other than the one declared. The driver was saved by its own uniqueness guard here; that is the "
       + "mechanism working, not a stale anchor." },
  { driver: "bio-plane/test/walkfloor.control.mjs",
    match: "braceBody(stripped, afterParams(stripped, m.index + m[0].length - 1))",
    why: "DELIBERATE: the arm patches with `.replaceAll`, which is the spelling that HANDLES a repeated anchor "
       + "rather than being defeated by it, and the paired `.includes` is a presence check rather than a patch "
       + "site. An exactly-once rule applied here would refuse a correct arm." },
];

/* ---------------------------------------------------------------- THE FIGURES */
console.log("\n--- the estate, and what this suite can read of it ---");

const prov = readGitProvenance(REPO);
const disc = classifyDiscovered(prov, drivers.map((d) => ({ path: d, what: "control driver", counted: 1 })));
console.log(`  provenance: ${disc.verified ? `VERIFIED at ${disc.headSha}` : "UNVERIFIED (git could not answer)"}`
  + ` · ${disc.accounted - disc.off.length} of ${disc.accounted} driver(s) are in the commit at HEAD`
  + `${disc.off.length ? ` · NOT IN ANY COMMIT: ${disc.off.map((r) => `${r.path} (${r.state})`).join(", ")}` : ""}`);

/* RULE 2's third state honoured: when git cannot answer, nothing is treated as
   committed and the figure is reported UNVERIFIED rather than taken silently
   from the working tree. An UNTRACKED driver is EXCLUDED from the graded set —
   `git stash` is repository-wide across sixty checkouts, so a phantom driver
   deposited here would otherwise be graded, and a failure nobody else can
   reproduce is worse than a miss. It is NAMED in the line above either way. */
const graded = disc.verified ? drivers.filter((d) => disc.inCommit.includes(d)) : drivers;

const anchors = [];
const silentDrivers = [];
for (const d of graded) {
  const got = extract(readFileSync(join(REPO, d), "utf8"));
  if (!got.length) { silentDrivers.push(d); continue; }
  for (const a of got) anchors.push({ driver: d, ...a });
}

for (const a of anchors) {
  a.where = [];
  for (const [p, text] of corpus) {
    const n = text.split(a.lit).length - 1;
    if (n) a.where.push({ path: p, n });
  }
  a.hits = a.where.reduce((s, w) => s + w.n, 0);
}

const reachPct = ((graded.length - silentDrivers.length) / graded.length * 100).toFixed(0);
console.log(`  drivers: ${drivers.length} found (${TEST_DIRS.length} test dirs; \`*.control.mjs\` plus ${OFF_CONVENTION.length} the convention misses)`
  + ` · ${graded.length} graded`);
console.log(`  corpus:  ${corpus.size} candidate subject file(s) — the \`*.control.mjs\` / \`*-controls.mjs\` set EXCLUDED (an`);
console.log(`           arm's anchor sits in its own \`find\` AND its \`replace\`, so an unexcluded corpus scores every`);
console.log(`           anchor present whatever its subject holds); PROBES KEPT IN, because a probe is a subject`);
console.log(`  anchors: ${anchors.length} literal anchor(s) read from ${graded.length - silentDrivers.length} of ${graded.length} drivers (${reachPct}%)`);
console.log(`  THE BLIND HALF, NAMED RATHER THAN LEFT AS A SILENCE — ${silentDrivers.length} driver(s) yield no literal anchor to this`);
console.log(`  matcher (their anchors are interpolated, computed, or written in an eighth shape). The census`);
console.log(`  \`test/m025-arm-census.mjs\` is what covers them, by RUNNING them:`);
for (const d of silentDrivers) console.log(`      ${d}`);

/* THE REACH FLOORS. A detector that found nothing would pass A4 and A5 with a
   triumphant empty list — this estate has recorded exactly that three times, so
   the corpus is asserted non-empty AND floored, and the figures are PRINTED. */
t(`A1 the driver walk reaches the estate rather than a corner of it (${drivers.length} driver(s), floor 80)`,
  drivers.length >= 80, true);
t(`A2 the subject corpus is real and floored (${corpus.size} file(s), floor 300)`,
  corpus.size >= 300, true);
t(`A3 the extractor actually read anchors, from more than one driver (${anchors.length} anchor(s) from ${graded.length - silentDrivers.length} driver(s), floors 100 and 20)`,
  [anchors.length >= 100, graded.length - silentDrivers.length >= 20], [true, true]);

console.log("\n--- every anchor still exists in something a driver could be quoting ---");

/* A DRIVER'S SUBJECT IS SOMETIMES ANOTHER DRIVER, AND THIS SUITE WAS BLIND TO IT
   UNTIL ITS OWN CONTROL PROVED IT — recorded here rather than smoothed, because
   the blindness was in the instrument and it was found by paying for it.

   The corpus above EXCLUDES every `*.control.mjs` file, and it must: an arm's
   anchor sits in its own `find` AND its `replace`, so a self-including corpus
   scored 96 anchors "duplicated" against this one's 3. But a negative-control
   driver's subject is frequently ANOTHER control driver — D-329's own arms patch
   `aicredential.control.mjs` to put the historical defect back — and those
   anchors then live in a file this corpus cannot see, so they read as ZERO and
   A4 reports a driver-on-driver arm as the D-276 class. Measured: adding those
   arms took A4 from 0 findings to 2, both false.

   THE FIX IS STRUCTURAL RATHER THAN A NAMED LIST, because a list of literals
   goes stale the moment a sixth arm is written. An anchor that is absent from
   every non-driver candidate is re-counted against the OTHER drivers — never its
   own file, which is what the exclusion was always about. Found there, it is a
   driver-on-driver arm and is LIVE; found nowhere, it is dead and A4 says so.
   The rescued set is PRINTED in full, so a widening that starts swallowing real
   deaths is visible rather than silent, and A7 floors it against the opposite
   failure: a rescue rule that rescues everything. */
const driverText = new Map();
for (const d of graded) { try { driverText.set(d, readFileSync(join(REPO, d), "utf8")); } catch { /* named by the floor */ } }
const onDriver = [];
for (const a of anchors) {
  if (a.hits !== 0) continue;
  a.elsewhere = [];
  for (const [p, text] of driverText) {
    if (p === a.driver) continue;
    const n = text.split(a.lit).length - 1;
    if (n) a.elsewhere.push({ path: p, n });
  }
  if (a.elsewhere.length) onDriver.push(a);
}
if (onDriver.length) {
  console.log(`  ${onDriver.length} anchor(s) are absent from every NON-driver candidate and present in another CONTROL`);
  console.log(`  DRIVER — an arm whose subject is a driver. LIVE, and listed rather than counted silently:`);
  for (const a of onDriver) console.log(`      ${a.driver} [${a.shape}] -> ${a.elsewhere.map((w) => `${w.path}×${w.n}`).join(", ")}`);
}

/* THE ARM THIS SUITE EXISTS FOR. A zero is unambiguous: the literal the driver
   will search for is in no candidate subject, so the arm cannot arm. This is the
   D-276 class and it is the half that cost a month. */
const deadAnchors = anchors.filter((a) => a.hits === 0 && !onDriver.includes(a))
  .map((a) => `${a.driver} [${a.shape}] ${JSON.stringify(a.lit.length > 90 ? a.lit.slice(0, 90) + "…" : a.lit)}`);
t(`A4 no arm's anchor has gone to ZERO — the D-276 class, which is a line CHANGED IN PLACE under a quote that was not moved with it (${deadAnchors.length} found)`,
  deadAnchors, []);
t(`A7 and the driver-on-driver rescue has not become a blanket amnesty — it rescues a MINORITY of anchors and each is named above (${onDriver.length} rescued of ${anchors.length} anchor(s); ceiling: a tenth of the set)`,
  onDriver.length * 10 <= anchors.length, true);

console.log("\n--- and no anchor is ambiguous in its own subject, unless a driver says so ---");
/* A first-occurrence patch over a doubled anchor silently arms the wrong site,
   which is WORKER.md's "anchor occurred twice" receipt. A driver that DECLARES
   the multiplicity is a deliberate closure and is named above. */
/* THE RULE IS "NO FILE HOLDS IT EXACTLY ONCE", NOT "SOME FILE HOLDS IT TWICE",
   AND THE DIFFERENCE WAS MEASURED RATHER THAN REASONED. The first form failed on
   `pdf-worker/test/pdf-worker.control.mjs`, whose anchor
   `  const obj = await env.CAPTURES.get(` is unique in ITS subject
   (`pdf-worker/src/index.mjs`) and appears FOUR times in `bio-plane/src/index.mjs`
   — a different Worker's file that this arm will never touch. That is a CROSS-FILE
   HOMONYM, not a duplicate, and failing on it would be a fence tighter than its
   rule: this suite does not resolve an arm's subject (see the header), so it must
   not pretend to. An arm can only be defeated by multiplicity when NO candidate
   file holds its anchor exactly once — then the exactly-once guard every driver
   applies cannot succeed anywhere.
   WHAT THIS COSTS, stated rather than left to be discovered: a real duplicate in
   the arm's true subject is INVISIBLE here whenever some OTHER file happens to
   hold the same line exactly once. The runtime census sees it — the driver's own
   guard counts in the file it is about to write — which is one more thing the
   periodic run does that this one cannot. */
const multi = anchors.filter((a) => a.where.length && !a.where.some((w) => w.n === 1))
  .filter((a) => !NAMED_MULTI.some((n) => n.driver === a.driver && a.lit.includes(n.match)))
  .map((a) => `${a.driver} [${a.shape}] in ${a.where.map((w) => `${w.path}×${w.n}`).join(", ")}`);
t(`A5 every anchor occurs at most ONCE per candidate subject, or is NAMED as a deliberate multiplicity (${multi.length} unnamed)`,
  multi, []);

const staleNamings = NAMED_MULTI.filter((n) =>
  !anchors.some((a) => a.driver === n.driver && a.lit.includes(n.match)
                    && a.where.length && !a.where.some((w) => w.n === 1)))
  .map((n) => `${n.driver}: ${n.match}`);
t(`A6 and the named list has not gone stale — every deliberate multiplicity is still there and still multiple (${staleNamings.length} stale)`,
  staleNamings, []);

/* --------------------------------------------------------------- THE SELF-TEST
   M0-14's rule: naming alone would be a walk that never counts anything new, so
   the extractor is driven over a FIXTURE with a known answer as well as over the
   real corpus. Without this, a matcher narrowed to nothing reports [] above and
   reads as a clean estate. */
console.log("\n--- the extractor itself, driven (a detector that finds nothing passes everything) ---");
{
  const FIXTURE = [
    'arm({ id: "x", file: SUBJECT,',
    '  find: `  const answer = compute(input, { strict: true });`,',
    '  replace: `  const answer = compute(input, { strict: false });` });',
    'const patched = src.replace("export const LEVELS = [\\"a\\", \\"b\\"];", "");',
    'if (!src.includes("this one is prose")) throw 0;',
    'const interpolated = s.replace(`  const ${name} = 1;`, "");',
  ].join("\n");
  const got = extract(FIXTURE);
  t("S1 the extractor reads a `find:` template anchor",
    got.some((g) => g.shape === "find:" && g.lit === "  const answer = compute(input, { strict: true });"), true);
  t("S2 it reads a `.replace(` anchor with escaped quotes inside",
    got.some((g) => g.shape === ".replace(" && g.lit === 'export const LEVELS = ["a", "b"];'), true);
  t("S3 it REFUSES an interpolated anchor rather than scoring it (an anchor built at run time is not a literal)",
    got.some((g) => g.lit.includes("${")), false);
  t("S4 it refuses prose with no code-shaped punctuation, which is the over-strictness direction",
    got.some((g) => g.lit === "this one is prose"), false);
  /* And the counting half, over a corpus with a KNOWN answer — the arm that
     would catch a matcher that counts nothing. */
  const mini = new Map([["a.mjs", "x\n  const answer = compute(input, { strict: true });\ny\n"],
                        ["b.mjs", "dup\ndup\n"]]);
  const count = (lit) => [...mini.values()].reduce((s, txt) => s + (txt.split(lit).length - 1), 0);
  t("S5 the counter finds a planted anchor exactly once", count("  const answer = compute(input, { strict: true });"), 1);
  t("S6 and reports ZERO for one that was changed in place (the D-276 shape, driven)",
    count("  const answer = compute(input, { strict: FALSE });"), 0);
}

/* ==================================================================== D-329
   THE LABEL HALF. A driver quotes the SUITE'S assertion names as well as its
   subject's source, and a name the suite COMPOSES moves under the quote. See
   this file's header for why the row's "no static instrument can see it" was
   true of the rendered label and false of the template. */
console.log("\n--- D-329 · the labels a driver quotes, evaluated the way the SUITE composes them ---");

/* THE LIVE CORPUS FOR A LABEL EXCLUDES `docs/`, AND IT IS THE CONTROL THAT SAYS
   SO. An assertion's NAME lives in a suite; the RECORD quotes the defects it
   records, and `DEBT.md`'s own D-329 row carries the stale fragment verbatim.
   With `docs/` in, this check reads that row, scores the defect "present", and
   goes green over a fully armed subject — measured, because that is exactly how
   the first draft of arm (7) failed. The ANCHOR half above keeps `docs/` IN and
   must: two of `register-grammar.control.mjs`'s arms quote `VERIFICATION.md`. */
const labelCorpus = [...corpus].filter(([p]) => !p.startsWith("docs/"));

const pairIndex = indexPairs(
  labelCorpus.reduce((acc, [p, text]) => (text.includes("`") ? templatePairs(text, p, acc) : acc), []));

const labelQuotes = [];
const labelSilent = [];
for (const d of graded) {
  const got = readLabelQuotes(readFileSync(join(REPO, d), "utf8"));
  if (!got.length) { labelSilent.push(d); continue; }
  for (const lit of got) labelQuotes.push({ driver: d, lit });
}

const composed = [];
for (const q of labelQuotes) {
  const sp = composedSpan(q.lit, pairIndex);
  if (!sp) continue;
  /* THE CONFIRMATION, AND IT IS WHAT MAKES THE PREDICATE USABLE. Six fragments
     in this estate span a template's shoulders AND sit verbatim in a file — a
     driver quoting another driver's printed line, an install command whose
     version number also appears interpolated elsewhere. A fragment that is
     literally present is not a rendered value, so it is NOT scored, and the six
     are what the over-strictness arm (8) of the control holds in place. */
  if (labelCorpus.some(([, text]) => text.includes(q.lit))) continue;
  composed.push({ ...q, sp });
}

const labelReach = ((graded.length - labelSilent.length) / graded.length * 100).toFixed(0);
console.log(`  label quotes: ${labelQuotes.length} read from ${graded.length - labelSilent.length} of ${graded.length} drivers (${labelReach}%)`);
console.log(`  composed templates: ${pairIndex.length} distinct interpolation shoulder-pair(s) over ${labelCorpus.length} non-doc candidate file(s)`);
console.log(`                      (shoulders ${MIN_SIDE} chars each side; a rendered value is at most ${MAX_GAP} chars — both FLOORS AGAINST NOISE, both measured)`);
if (labelSilent.length) {
  console.log(`  ${labelSilent.length} driver(s) yield NO label quote — named, never silently scored:`);
  for (const d of labelSilent) console.log(`      ${d}`);
}

t(`L1 the label extractor reaches the estate rather than a corner of it (${labelQuotes.length} quote(s) from ${graded.length - labelSilent.length} driver(s), floors 800 and 40)`,
  [labelQuotes.length >= 800, graded.length - labelSilent.length >= 40], [true, true]);
t(`L2 there are composed labels in the estate AT ALL to be wrong about — a predicate with nothing to match passes every corpus (${pairIndex.length} shoulder-pair(s), floor 400)`,
  pairIndex.length >= 400, true);
t(`L3 NO DRIVER QUOTES A RENDERED VALUE — a fragment that resolves against a suite's label ONLY by eating its \`\${…}\` slot will go stale the moment the value moves (${composed.length} found)`,
  composed.map((c) => `${c.driver} quotes ${JSON.stringify(c.lit.length > 80 ? c.lit.slice(0, 80) + "…" : c.lit)}`
    + ` — composed in ${c.sp.path} with the rendered value ${JSON.stringify(c.sp.gap)} in the slot`), []);

/* THE RULE D-329 ASKED TO BE MADE EXPLICIT, stated as an assertion rather than
   as prose so it is enforced rather than remembered: a driver quotes the
   INVARIANT part of an assertion name. `L3` is that rule; `L4` is the receipt
   that the predicate can still tell the two apart, driven on the estate's own
   historical instance rather than on a fixture. */
{
  const HIST_HEAD = "every one of the 26", HIST_TAIL = " ops no member reaches is refused at the mint, by name";
  const INVARIANT = HIST_TAIL.trim();
  t("L4 the predicate, driven on D-329's OWN historical instance: the fragment carrying the rendered count is caught, and the hand repair that quotes only the invariant part is NOT",
    [!!composedSpan(HIST_HEAD + HIST_TAIL, pairIndex), !!composedSpan(INVARIANT, pairIndex)], [true, false]);
}

/* The extractor itself, over a fixture with a known answer — the arm that
   catches a label matcher narrowed to nothing or widened into the anchor set. */
console.log("\n--- the label extractor and the span predicate, driven over a fixture ---");
{
  const SUITE_FIXTURE = 't(`the register holds ${rows.length} rows and every one of them is backed`, a, b);';
  const idx = indexPairs(templatePairs(SUITE_FIXTURE, "fixture.mjs", []));
  t("S7 a rendered fragment of that label SPANS the slot, and the gap is the rendered value",
    (composedSpan("the register holds 41 rows and every one of them is backed", idx) || {}).gap, "41");
  t("S8 while the invariant tail of the SAME label spans nothing (the over-strictness direction: the correct spelling must pass)",
    composedSpan("rows and every one of them is backed", idx), null);
  t("S9 the label shape accepts an assertion name and REFUSES a source anchor — prose against code, not a list of key names",
    [isLabelQuote("A PUBLICATION NAMING NO PROJECT IS REFUSED BY NAME"),
     isLabelQuote("  if (to !== null && this.#caseRelationOf(target).member)"),
     isLabelQuote("short one")],
    [true, false, false]);
  t("S10 and a driver's own COMMENTARY is not its code — a driver quoting the defect it fixed must not be scored as holding it",
    readLabelQuotes('/* he quoted "every one of the 26 ops that nobody reaches at all" here */\nconst x = 1;').length, 0);
}

/* ==================================================================== D-333
   THE TALLY READER. The comparison is the census's — a tally is a claim about a
   RUN — but the reader is shared, so its reach is floored and its blind half
   NAMED here, on every battery. */
console.log("\n--- D-333 · the arm tally each driver DECLARES about itself (the census holds it against the run) ---");
const declared = [], tallyBlind = [];
for (const d of graded) {
  const r = readDeclaredArms(readFileSync(join(REPO, d), "utf8"));
  if (r) declared.push({ driver: d, ...r }); else tallyBlind.push(d);
}
console.log(`  declared tallies read: ${declared.length} of ${graded.length} driver(s) (${(declared.length / graded.length * 100).toFixed(0)}%)`);
console.log(`  ${tallyBlind.length} driver(s) declare no arm count this reader can see — reported UNKNOWN, NEVER zero:`);
for (const d of tallyBlind) console.log(`      ${d}`);
t(`T1 the tally reader reaches a real fraction of the estate and names the rest (${declared.length} readable, floor 30)`,
  declared.length >= 30, true);
t("T2 and it is null-never-zero, driven: a driver stating no count reads as UNREADABLE rather than as a declaration of none",
  [readDeclaredArms("/* a driver with no count at all */\nimport x from 'y';"),
   (readDeclaredArms("/* five arms plus a baseline */\nimport x from 'y';") || {}).n,
   (readDeclaredArms("/* five arms plus a baseline */\nimport x from 'y';") || {}).plusBaseline],
  [null, 5, true]);
t("T3 the baseline is an ANNOUNCEMENT and not a declared arm, so a driver that runs one may announce exactly one more than it declares — and nothing else",
  [tallyHonoured({ n: 5, plusBaseline: true }, 6), tallyHonoured({ n: 5, plusBaseline: true }, 5),
   tallyHonoured({ n: 5, plusBaseline: true }, 7), tallyHonoured({ n: 5, plusBaseline: false }, 6)],
  [true, true, false, false]);

console.log(`\n--- m025-arm-anchor-witness.test.mjs: ${pass} pass, ${fail} fail ---`);
process.exit(fail ? 1 : 0);
