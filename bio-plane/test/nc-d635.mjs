/* D-635's NEGATIVE CONTROL HARNESS. Declared in the suite it drives (`d635-append.test.mjs`), run from
 * `bio-plane/` in one step:
 *
 *     node test/nc-d635.mjs            # every arm, baseline first
 *     node test/nc-d635.mjs onepart    # one arm
 *
 * NOT a `.test.mjs`: it EDITS A REAL SOURCE while it runs, so the battery's discovery must not find it. The
 * machinery is `nc-d627.mjs`'s, copied, except that this driver EXITS ON THE COUNT IT PRINTS. `mustNotFail` is
 * CHECKED, an arm that does not arm is a finding, and every restore is verified by sha256 AND by content, with a
 * byte count printed and a minimum guarded, never `git checkout --`. Pristine copies live in `controlPen("d635")`.
 *
 * THE ARMS, each ONE source edit:
 *   onepart  — THE ROW'S DECLARED CONTROL: the appended page is listed in the engine's part ONLY (the layer part
 *              filters out every filled page, as it did before D-635). BOTH PARTS fails by name, and so do the
 *              page-grain readers that rest on it. The text arms hold: the merge still appends.
 *   refuse   — the merge refuses a selected page holding a glyph again (the pre-D-635 rule): KEEP + APPEND fail,
 *              FILL and PARTITION hold.
 *   nopart   — `mergedChain` stops naming each part when parts overlap: two parts with ONE page list merge into a
 *              sequence and the folio's null resolves into the engine's C (SAME PAGES fails); the three-page
 *              document's page cap holds, because its two parts have different page lists.
 *   spelling — OVER-STRICTNESS: the layer part computed from the BASE text's pages, a correct spelling the suite
 *              did not use. Everything MUST pass.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SAFE = controlPen("d635");
mkdirSync(SAFE, { recursive: true });

const INDEX = join(PLANE, "src/index.mjs");
const CHAIN = join(PLANE, "src/textchain.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 50000;   // both sources are far larger; a restore over a stub must fail loudly.

const SUITES = { d635: "test/d635-append.test.mjs" };
function runSuite(key) {
  const r = spawnSync(process.execPath, [SUITES[key]],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  return { key, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
}
/* Every (find, replace) pair must match exactly once, or the arm did not arm. */
function arm(pairs) {
  const counts = pairs.map(([file, find]) => readFileSync(file, "utf8").split(find).length - 1);
  if (counts.some((n) => n !== 1)) return { armed: false, matches: counts.join("/") };
  for (const [file, find, replace] of pairs)
    writeFileSync(file, readFileSync(file, "utf8").replace(find, () => replace));
  return { armed: true, matches: counts.join("/") };
}

const BOTH = ["BOTH PARTS: the chain is the layer part", "BOTH PARTS: page 1 is covered by the layer part"];
const PAGECAP1 = "PAGE CAP: the folio page is UNDETERMINED";
const PROV = ["PROVENANCE: page 1 names both producers", "PROVENANCE: page 1 is credited as transcribed to BOTH"];
const TIERS = "TIERS: tier 1 covers pages 0 and 1";
const SAMEPARTS = "SAME PAGES: both parts name page 0";
const SAMECAP = ["SAME PAGES: the document is UNDETERMINED", "SAME PAGES: and so is its one page",
                 "SAME PAGES: through op=textattest"];
const STAMP = ["BOTH PARTS: the parts overlap, so each names its part", "an overlap stamps every part"];
const KEEP = "KEEP: the text page's own text is untouched";
const APPEND = ["KEEP + APPEND: page 1 holds its folio FIRST", "the basis says a page kept its folio"];
const FILL = "FILL: the scan holds the transcription alone";
const PART = ["PARTITION: the chain is scoped exactly as before", "PARTITION: the text page is undetermined"];
const SCAN_C = "PAGE CAP: the scan the engine alone read takes the engine's C";

const LAYER_FILTER = "                            && (!m.filled.includes(p.page) || appendedTo.includes(p.page))";

const ARMS = {
  baseline: {
    pairs: [], files: [], why: "nothing armed — the row that tells four arms broken from four arms working",
    mustFail: [], mustNotFail: [],
  },
  onepart: {
    files: [INDEX],
    why: "the appended page is listed in the engine's part only: BOTH PARTS fails by name, the text holds",
    mustFail: [...BOTH, PAGECAP1, ...PROV, TIERS, SAMEPARTS],
    mustNotFail: [KEEP, ...APPEND, FILL, ...PART, SCAN_C],
    pairs: [[INDEX, LAYER_FILTER, "                            && !m.filled.includes(p.page)"]],
  },
  refuse: {
    files: [INDEX],
    why: "a selected page holding a glyph is refused again: KEEP + APPEND fail, FILL and PARTITION hold",
    mustFail: [...APPEND, ...BOTH, SAMEPARTS],
    mustNotFail: [KEEP, FILL, ...PART, SCAN_C],
    pairs: [[INDEX, "    if (!target || !wanted.has(p.page)) { refused.push(p.page); continue; }",
                    "    if (!target || !wanted.has(p.page) || !empty) { refused.push(p.page); continue; }"]],
  },
  nopart: {
    files: [CHAIN],
    why: "parts are no longer named when they overlap: two parts with one page list read the engine's C",
    mustFail: [...SAMECAP, ...STAMP],
    mustNotFail: [PAGECAP1, ...BOTH, ...APPEND, ...PART, ...PROV],
    pairs: [[CHAIN, "extent: overlap ? { kind: \"pages\", pages, part: index } : { kind: \"pages\", pages } }",
                    "extent: { kind: \"pages\", pages } }"]],
  },
  spelling: {
    files: [INDEX],
    why: "OVER-STRICTNESS: the layer part read off the BASE text's pages — correct work in another spelling",
    mustFail: [], mustNotFail: [],
    pairs: [[INDEX, "              const layerPages = (Array.isArray(m.text.pages) ? m.text.pages : [])",
                    "              const layerPages = (Array.isArray(baseText.pages) ? baseText.pages : [])"],
            [INDEX, LAYER_FILTER, "                            && true"]],
  },
};
for (const a of Object.values(ARMS)) a.patch = () => (a.pairs.length ? arm(a.pairs) : { armed: true, matches: 0 });

const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
if (only && !ARMS[only]) {
  console.error(`no such arm: ${only}. Arms: ${Object.keys(ARMS).join(", ")}`);
  process.exit(2);
}

let notAsDeclared = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY          ${a.why}`);
  console.log(`  MUST FAIL    ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST NOT     ${a.mustNotFail.length ? a.mustNotFail.join(" | ") : "(nothing — baseline)"}`);
  const saved = [];
  for (const f of a.files) {
    const dest = join(SAFE, `${name}-${f.split("/").pop()}`);
    copyFileSync(f, dest);
    const bytes = statSync(dest).size;
    if (bytes < MIN_BYTES) { console.log(`  ABORT        pristine copy of ${f} is ${bytes} B — below the guarded minimum`); process.exit(3); }
    saved.push({ f, dest, bytes, sha: sha(f) });
    console.log(`  PRISTINE     ${f.replace(REPO + "/", "")}  ${bytes} bytes  sha256 ${sha(f).slice(0, 12)}…`);
  }
  const armed = a.patch();
  console.log(`  ARMED        ${armed.armed ? "yes" : "NO — AN ARM THAT DID NOT ARM IS A FINDING"}  (patch matched ${armed.matches}×)`);
  const results = ["d635"].map(runSuite);
  const totalFail = results.reduce((n, r) => n + (r.fail < 0 ? 1 : r.fail), 0);
  const failing = results.flatMap((r) => r.failing);
  for (const r of results) console.log(`  RESULT       ${SUITES[r.key]}  ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of failing) console.log(`               ${l}`);
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f) === s.sha;
    const same = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED     ${s.f.replace(REPO + "/", "")}  byte-identically: ${back && same ? "YES" : "NO"}`
      + `  ${statSync(s.f).size} bytes  sha256 ${sha(s.f).slice(0, 12)}…`);
    if (!(back && same)) { console.log("  ABORT        a restore that is not byte-identical poisons every later arm"); process.exit(4); }
  }
  if (!armed.armed) { console.log("  VERDICT      ARM DID NOT ARM — a finding, not a retry"); notAsDeclared++; continue; }
  if (!a.mustFail.length) {
    const ok = totalFail === 0;
    console.log(`  VERDICT      ${ok ? "AS DECLARED — green" : "NOT AS DECLARED — the baseline is not green"}`);
    if (!ok) notAsDeclared++;
    continue;
  }
  const hit = a.mustFail.filter((m) => failing.some((l) => l.includes(m)));
  const broke = a.mustNotFail.filter((m) => failing.some((l) => l.includes(m)));
  const ok = totalFail > 0 && hit.length === a.mustFail.length && broke.length === 0;
  console.log(`  VERDICT      ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, `
    + `${broke.length}/${a.mustNotFail.length} held-open assertion(s) ALSO broken, ${totalFail} total failing`);
  if (!ok) {
    for (const m of a.mustFail) if (!failing.some((l) => l.includes(m))) console.log(`               DECLARED BUT NOT SEEN: ${m}`);
    for (const m of broke) console.log(`               HELD OPEN BUT BROKEN: ${m}`);
    notAsDeclared++;
  }
}
console.log(notAsDeclared
  ? `\n${notAsDeclared} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`
  : "\nevery arm AS DECLARED");
/* The exit is the count printed (nc-cpdf10's repaired rule): a driver that exits 0 whatever it found tells a
   gate the control was clean while its log says otherwise. */
process.exit(notAsDeclared ? 1 : 0);
