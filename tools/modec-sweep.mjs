#!/usr/bin/env node
/* M0-29's ONE MEASUREMENT OF D-333 DECAY MODE (c) ACROSS THE ESTATE.
 *
 *     node tools/modec-sweep.mjs             # from the repo root
 *     node tools/modec-sweep.mjs --self-test # the negative control for THIS sweep
 *
 * WHAT MODE (c) IS, in D-333's own words: *"the arm's subject stopped existing as
 * a thing to compare against"*. D-330's worked instance is `dec65` arm (5), whose
 * subject was ANOTHER TREE that became the mainline. D-333 says it is "a
 * judgement at attribution time, not a number" — so this sweep does NOT claim to
 * decide it. It measures the ONE HALF THAT IS MECHANICAL and names the rest.
 *
 * WHAT THIS MATCHER CAN SEE (and it is the load-bearing sentence):
 *   - A FILE PATH a driver names that exists NOWHERE: not in the working tree,
 *     not at the driver's own directory, not under `bio-plane/`, and not in
 *     `git ls-tree -r HEAD`. A subject that is not a file any more is mode (c)'s
 *     only mechanically visible shape.
 *   - A driver naming a path under a DIRECTORY THAT IS GONE — the dec65 shape
 *     (the other tree). Reported as a distinct class because the whole subject,
 *     not one file, is what left.
 *   - Prose in a driver that RETIRES an arm in words (`RETIRED`, `WITHDRAWN`,
 *     `NO LONGER EXISTS`, `STOPPED EXISTING`, `SUBJECT IS GONE`). A driver that
 *     already said it is the honest handling D-330 used, and finding it is how
 *     this sweep distinguishes an undeclared instance from a declared one.
 *
 * WHAT IT CANNOT SEE, stated rather than left for the next reader to re-derive:
 *   - An arm whose subject FILE still exists but whose CONSTRUCT inside it is
 *     gone. That is mode (a) when the anchor stops matching (M0-25's witness
 *     sees it) and a JUDGEMENT when the anchor still matches something that no
 *     longer means the same thing. No static matcher reaches it.
 *   - An arm whose subject is a PROCESS, a URL, an account or a credential
 *     rather than a path. Those are named in the UNCLASSIFIED list, never scored.
 *   - Which of two files a driver would actually write, when it builds the path
 *     at runtime from a variable this matcher never evaluates. Every path this
 *     sweep reads is a LITERAL.
 *
 * FALSE-POSITIVE CLASSES THIS SWEEP SEPARATES RATHER THAN DROPS. A control
 * driver's job includes WRITING files that do not exist — phantoms, pens,
 * pristine copies, shimmed binaries. Those are listed under CREATED-BY-THE-ARM
 * with the reason, so a reader can see what was set aside and check it.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SELFTEST = process.argv.includes("--self-test");

const TEST_DIRS = ["agent-worker/test", "bio-plane/test", "civicos-ui/test", "newgroup/test",
  "ocr-worker/test", "pdf-worker/test"];

/* The SAME estate the census enumerates, by the same convention plus the same
   four off-convention drivers, so the two figures are about one corpus. */
const OFF_CONVENTION = ["bio-plane/test/cpdf16-floor-controls.mjs", "bio-plane/test/d315-guard-controls.mjs",
  "bio-plane/test/ocr-composed-probe.mjs", "bio-plane/test/cpdf15-tesseract-runtime.probe.mjs"];

function drivers() {
  const out = [];
  for (const d of TEST_DIRS) {
    const abs = join(ROOT, d);
    if (!existsSync(abs)) continue;
    for (const f of readdirSync(abs)) if (f.endsWith(".control.mjs")) out.push(`${d}/${f}`);
  }
  for (const f of OFF_CONVENTION) if (existsSync(join(ROOT, f))) out.push(f);
  return out.sort();
}

/* HEAD is git's, not the working tree's: a subject deleted-but-not-committed and
   a subject that never existed are different facts and only git separates them. */
const tracked = new Set(
  execFileSync("git", ["ls-tree", "-r", "--name-only", "HEAD"], { cwd: ROOT, encoding: "utf8" })
    .split("\n").filter(Boolean));

/* A path literal: at least one `/`, a known source extension, no whitespace. The
   extension list is a FLOOR and is printed, so a subject with an unlisted
   extension is a gap this sweep names rather than a zero it scores. */
const EXTS = ["mjs", "js", "cjs", "mts", "ts", "json", "jsonc", "html", "md", "txt", "wasm",
  "sql", "yml", "yaml", "sh", "css", "pdf", "png"];
const PATH_RE = new RegExp(
  String.raw`(?:^|[^A-Za-z0-9_./-])((?:[A-Za-z0-9_.-]+\/)+[A-Za-z0-9_.-]+\.(?:${EXTS.join("|")}))\b`, "g");

/* CREATED BY THE ARM, not a subject of it. Every one of these is a thing a
   control driver makes on purpose while it runs, so its absence from the tree is
   the CORRECT state and not decay. Listed, never silently dropped. */
const CREATED = [
  { re: /phantom/i, why: "a PHANTOM the arm writes to reproduce an untracked arrival" },
  { re: /(^|\/)zz-/i, why: "the `zz-` prefix this estate uses for a file an arm writes and removes" },
  { re: /(^|\/)\.[A-Za-z0-9_.-]*\//, why: "inside a dot-directory: a pen or a pristine-copy store the arm owns" },
  { re: /pristine|harness-copy|\.bak$|\.orig$/i, why: "a pristine copy the arm takes and restores from" },
  { re: /node_modules\//, why: "a dependency path, renamed or removed by an arm on purpose" },
  { re: /(^|\/)(tmp|temp)[-./]/i, why: "a scratch path the arm creates" },
];

const RETIRE_RE = /\b(RETIRED|WITHDRAWN|NO LONGER EXISTS|STOPPED EXISTING|SUBJECT IS GONE|SUBJECT NO LONGER|THE ARM IS DEAD)\b/i;

/* EVERY PACKAGE ROOT IS TRIED, NOT ONLY THE DRIVER'S OWN, AND THAT IS A FINDING
   THIS SWEEP PAID FOR RATHER THAN A GENEROSITY. The first draft resolved a path
   against the repo root, the driver's OWN package and the driver's directory —
   and reported NINETEEN candidates, of which at least eleven were drivers in one
   package naming a path in ANOTHER (`agent-worker/test/fanout.control.mjs` names
   `scripts/battery.mjs`, which is `bio-plane/scripts/battery.mjs`; a control
   driver crossing packages is the normal case here, not the exception). A sweep
   whose residue is mostly its own resolver is a sweep looking in the wrong
   place, so the resolution is widened and the WIDENING IS THE REASON the residue
   below is worth reading. The cost is stated too: a path that exists under SOME
   package but not the one the driver meant now resolves, so this sweep cannot
   see a subject that MOVED between packages. That is named, not hidden. */
const PKGS = ["", "bio-plane", "agent-worker", "civicos-ui", "newgroup", "ocr-worker", "pdf-worker"];
function resolveCandidate(rel, driverRel) {
  const tries = [join(ROOT, dirname(driverRel), rel)];
  for (const p of PKGS) tries.push(join(ROOT, p, rel));
  for (const t of tries) if (existsSync(t)) return { found: true, at: t };
  for (const p of PKGS) if (tracked.has(p ? `${p}/${rel}` : rel)) return { found: true, at: "HEAD" };
  return { found: false };
}

/* ------------------------------------------------------ THE ADJUDICATED SET
   D-333 says mode (c) is "a judgement at attribution time, not a number", so the
   judgement is RECORDED HERE, dated and reasoned, rather than re-derived by
   whoever runs this next. Every row below was checked BY HAND on 2026-09-14
   (M0-29) against the tree at `e9ba393`. A candidate NOT in this table is
   unadjudicated and is what the figure counts. */
const ADJUDICATED = [
  { driver: "bio-plane/test/m025-anchor-witness.control.mjs", path: "agent-worker/src/fanout.mjs",
    verdict: "NOT mode (c) — A REAL DEFECT OF A DIFFERENT KIND, and it is corrected in this item. "
      + "Arm A2's SUBJECT is `FANOUT_SRC`, which is `agent-worker/src/subsession.mjs` and exists; "
      + "only the arm's `what:` PROSE named `fanout.mjs`, a file this repository has never held. "
      + "The arm is live and green. A wrong path in an arm's own description is the record claiming "
      + "more than it can support, so it is fixed rather than adjudicated away." },
  { driver: "agent-worker/test/agent-worker.control.mjs", path: "agent-worker/agent-worker.test.mjs",
    verdict: "NOT A PATH. It is the LABEL `scripts/battery.mjs` prints in its FAILED list "
      + "(`<member>/<basename>`), which the arm asserts on as a string. Nothing opens it." },
  { driver: "pdf-worker/test/pdf-worker.control.mjs", path: "pdf-worker/pdf-worker.test.mjs",
    verdict: "NOT A PATH — the same battery FAILED-list label as the row above." },
  { driver: "bio-plane/test/rowdesign.control.mjs", path: "docs/development/M030-PLANTED-DESIGN.md",
    verdict: "CREATED-BY-THE-ARM in the strongest sense: the arm PLANTS this name in a queue row and "
      + "asserts the row FAILS while the document is absent. Its non-existence is the arm's subject." },
  { driver: "bio-plane/test/cpdf15-tesseract-runtime.probe.mjs", path: "dist/tesseract-core.wasm",
    verdict: "ABSENT BY DESIGN — it appears only under `--engine <dir>`, an npm install of "
      + "`tesseract-wasm` plus a model fetched over the network. The census reports the engine arms "
      + "as NOT EXERCISED for this reason rather than hiding them." },
  { driver: "bio-plane/test/cpdf15-tesseract-runtime.probe.mjs", path: "dist/lib.js",
    verdict: "ABSENT BY DESIGN — the same `--engine` install as the row above." },
];
const isAdjudicated = (d, p) => ADJUDICATED.some((a) => a.driver === d && a.path === p);

const list = drivers();
const missing = [];        /* candidate mode (c): a named path that resolves nowhere */
const created = [];        /* set aside with the reason */
const retired = [];        /* a driver that already says an arm is retired */
const unclassified = [];   /* named, never scored */
let literals = 0;

for (const rel of list) {
  const src = readFileSync(join(ROOT, rel), "utf8");
  for (const line of src.split("\n")) {
    if (RETIRE_RE.test(line)) retired.push({ driver: rel, line: line.trim().slice(0, 160) });
  }
  const seen = new Set();
  let m;
  PATH_RE.lastIndex = 0;
  while ((m = PATH_RE.exec(src))) {
    const p = m[1];
    if (seen.has(p)) continue;
    seen.add(p);
    literals++;
    const c = CREATED.find((c) => c.re.test(p));
    if (c) { created.push({ driver: rel, path: p, why: c.why }); continue; }
    /* A bare `a/b.mjs` with no repo-ish first segment is usually a node builtin
       or an npm specifier, not a repo path. NAMED rather than scored. */
    if (!/^(agent-worker|bio-plane|civicos-ui|newgroup|ocr-worker|pdf-worker|docs|tools|release|src|test|scripts|checks|dist)\//.test(p)) {
      unclassified.push({ driver: rel, path: p, why: "first segment is not a known repo directory — specifier or a path built elsewhere" });
      continue;
    }
    const r = resolveCandidate(p, rel);
    if (!r.found) missing.push({ driver: rel, path: p });
  }
}

/* ------------------------------------------------------------- THE SELF-TEST
   The sweep's own negative control, and it is ONE command because a predicate
   nobody ran once with a known answer is a predicate that can only agree with
   itself. A path that cannot exist MUST be found; a path that does exist MUST
   NOT be. Both directions, because a matcher that finds everything is as useless
   as one that finds nothing. */
if (SELFTEST) {
  const fake = "bio-plane/src/this-file-cannot-exist-m029.mjs";
  const real = "bio-plane/src/store.mjs";
  const a = resolveCandidate(fake, "bio-plane/test/x.control.mjs");
  const b = resolveCandidate(real, "bio-plane/test/x.control.mjs");
  console.log(`SELF-TEST · a path that cannot exist  : found=${a.found}  (MUST be false)`);
  console.log(`SELF-TEST · a path that does exist    : found=${b.found}  (MUST be true)`);
  const ok = a.found === false && b.found === true;
  console.log(`SELF-TEST · ${ok ? "BOTH DIRECTIONS AS DECLARED" : "NOT AS DECLARED — THIS SWEEP'S RESULT IS NOT BELIEVABLE"}`);
  console.log(`SELF-TEST · corpus is non-empty       : ${list.length} driver(s), ${literals >= 0 ? "" : ""}floored at 1`);
  if (!ok || list.length < 1) process.exit(2);
}

console.log(`M0-29 · D-333 DECAY MODE (c) — ONE MEASUREMENT ACROSS THE ESTATE`);
console.log(`root: ${ROOT}`);
console.log(`\nREACH`);
console.log(`  drivers read                 : ${list.length}`);
console.log(`  path literals extracted      : ${literals}`);
console.log(`  extensions the matcher knows : ${EXTS.join(" ")}`);
console.log(`  tracked paths at HEAD        : ${tracked.size}`);
if (list.length === 0 || literals === 0) {
  console.log(`\n  EMPTY CORPUS — this result is not evidence of anything. Stopping.`);
  process.exit(2);
}

const open = missing.filter((r) => !isAdjudicated(r.driver, r.path));
const judged = missing.filter((r) => isAdjudicated(r.driver, r.path));

console.log(`\nCANDIDATE MODE (c) — a named subject that resolves NOWHERE: ${missing.length}`);
console.log(`  of which UNADJUDICATED (the figure that matters): ${open.length}`);
for (const r of open) console.log(`    >>> ${r.driver}\n        ${r.path}`);
if (!open.length) console.log(`    none unadjudicated.`);
console.log(`\n  ADJUDICATED 2026-09-14 (M0-29), by hand, each against the tree at e9ba393:`);
for (const r of judged) {
  const a = ADJUDICATED.find((a) => a.driver === r.driver && a.path === r.path);
  console.log(`    ${r.driver} :: ${r.path}\n        ${a.verdict}`);
}
/* A ROW IN THE TABLE THAT NO LONGER MATCHES ANYTHING IS ITSELF DECAY — the same
   shape this whole item is about — so it is reported rather than left to rot. */
const stale = ADJUDICATED.filter((a) => !missing.some((r) => r.driver === a.driver && r.path === a.path));
console.log(`\n  ADJUDICATION ROWS THAT MATCHED NOTHING THIS RUN: ${stale.length}`);
for (const a of stale) console.log(`    ${a.driver} :: ${a.path}  — the candidate is gone; re-read this row before trusting it`);

console.log(`\nDRIVERS THAT ALREADY RETIRE AN ARM IN WORDS: ${retired.length}`);
for (const r of retired) console.log(`    ${r.driver}\n        ${r.line}`);
if (!retired.length) console.log(`    none.`);

console.log(`\nSET ASIDE — CREATED BY THE ARM, absence is the CORRECT state: ${created.length}`);
const byWhy = {};
for (const c of created) (byWhy[c.why] ||= []).push(`${c.driver} :: ${c.path}`);
for (const [why, rows] of Object.entries(byWhy)) console.log(`    ${rows.length}  ${why}`);

console.log(`\nUNCLASSIFIED — NAMED, NEVER SCORED: ${unclassified.length}`);
const uniqU = [...new Set(unclassified.map((u) => u.path))];
console.log(`    ${uniqU.length} distinct literal(s); first 25:`);
for (const p of uniqU.slice(0, 25)) console.log(`      ${p}`);

console.log(`\nTHE FIGURE`);
console.log(`  mode (c) candidates          : ${missing.length}`);
console.log(`  UNADJUDICATED candidates     : ${open.length}`);
console.log(`  arms retired in words        : ${retired.length}`);
console.log(`  set aside (arm-created)      : ${created.length}`);
console.log(`  unclassified (named)         : ${unclassified.length}`);
