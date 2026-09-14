/* NEGATIVE CONTROL: run 2026-09-13 under M0-25, each arm ALONE against the REAL tree with every other defence held open, restores verified by sha256 AND `cmp` against uniquely-named per-arm pristine copies with the byte count printed and floored — the driver is `test/m025-anchor-witness.control.mjs` and re-runs every arm in one step. (1) THE ARM THIS SUITE EXISTS FOR, and it is the D-276 class reproduced exactly: change a line IN PLACE in a subject a control driver quotes (`agent-worker/src/index.mjs`'s `MEANING_ARM` call site, the very line D-276 moved) so the driver's anchor now matches zero times -> arm A4 FAILS naming the driver, the anchor and the subject, while the driver's own file is untouched and every other arm holds. (2) THE OVER-STRICTNESS DIRECTION — re-spell the same line in a way the quote still matches (whitespace outside the anchor's span) -> NOTHING fails, because a fence tighter than its rule is an undeclared interface change wearing the costume of caution. (3) THE REACH ARM, because a detector that finds nothing passes every clean corpus: neuter the extractor so it reads no anchor at all -> the corpus floors FAIL (A1/A2/A3) while the zero-match arm A4 reports a triumphant empty list, which is exactly why the floors are asserted and printed rather than assumed. (4) THE MULTIPLICITY HALF — plant a SECOND copy of an anchored line in its subject so the anchor occurs twice -> A5 FAILS naming the driver and the file, which is the "anchor occurred twice" receipt WORKER.md records and which silently disarms a first-occurrence patch. (5) THE NAMED LIST'S OWN STALENESS — remove one deliberate multi-occurrence closure from its subject -> A6 FAILS naming the entry that has stopped being true, so a naming cannot outlive the thing it named. (6) THE BASELINE, and it is not decoration: nothing armed -> every arm green, which is what distinguishes five-arms-broken from five-arms-working.
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
 */

import "./stdio.mjs";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readGitProvenance, classifyDiscovered, repoPath } from "../scripts/provenance.mjs";

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
/* THE ARM THIS SUITE EXISTS FOR. A zero is unambiguous: the literal the driver
   will search for is in no candidate subject, so the arm cannot arm. This is the
   D-276 class and it is the half that cost a month. */
const deadAnchors = anchors.filter((a) => a.hits === 0)
  .map((a) => `${a.driver} [${a.shape}] ${JSON.stringify(a.lit.length > 90 ? a.lit.slice(0, 90) + "…" : a.lit)}`);
t(`A4 no arm's anchor has gone to ZERO — the D-276 class, which is a line CHANGED IN PLACE under a quote that was not moved with it (${deadAnchors.length} found)`,
  deadAnchors, []);

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

console.log(`\n--- m025-arm-anchor-witness.test.mjs: ${pass} pass, ${fail} fail ---`);
process.exit(fail ? 1 : 0);
