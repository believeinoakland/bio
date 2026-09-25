/* D-627's NEGATIVE CONTROL HARNESS. Declared in the suite it drives
 * (`d627-image-content.test.mjs`), run from `bio-plane/` in one step:
 *
 *     node test/nc-d627.mjs               # every arm, baseline first
 *     node test/nc-d627.mjs nocoverage    # one arm
 *
 * NOT a `.test.mjs`: it EDITS A REAL SOURCE while it runs, so the battery's discovery must not find it. The
 * machinery is `nc-cpdf18.mjs`'s, copied: `mustNotFail` is CHECKED, an arm that does not arm is a finding, and
 * every restore is verified by sha256 AND by content, with a byte count printed and a minimum guarded — never
 * `git checkout --`. Pristine copies live in `controlPen("d627")` (`test/pen.mjs`), outside the worktree.
 *
 * THE ARMS:
 *   nocoverage — THE ROW'S DECLARED CONTROL: drop the coverage arm (`extractPdfStructure` no longer calls
 *                `markImageContent`). INFO-2026-0301's pages 633/634/645-651 read no marker and route nowhere,
 *                by name, while the text page, the blank folio and the scan hold.
 *   noroute    — `TIER3_REASONS` loses `image_content_unread`: the markers stand and the member is never asked.
 *   forcegap   — a page in a measured gap is forced to unread: every gap and edge assertion fails, while the
 *                unread page, the text page and the real pages hold.
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
const SAFE = controlPen("d627");
mkdirSync(SAFE, { recursive: true });

const PDFS = join(PLANE, "src/pdfstructure.mjs");
const INDEX = join(PLANE, "src/index.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 50000;   // both sources are far larger; a restore over a stub must fail loudly.

const SUITES = { d627: "test/d627-image-content.test.mjs" };
function runSuite(key) {
  const r = spawnSync(process.execPath, [SUITES[key]],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  return { key, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
}
function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, () => replace));
  return { armed: true, matches: n };
}

const REAL = [633, 634, 645, 646, 647, 648, 649, 650, 651].map((p) => `REAL PAGES: INFO-2026-0301 p${p} carries`);
const ROUTE_REAL = "THE ROUTE: INFO-2026-0301's nine pages are sent to the OCR member";
const ROUTE_SYN = "exactly the unread pages and the scan are asked about";
const UNREAD = "UNREAD: a folio of 2 glyphs";
const TEXTPAGE = "TEXT PAGE: 30 glyphs over the same image";
const TEXTROUTE = "TEXT PAGE: a text page over an image is never sent";
const BLANK = "BLANK FOLIO";
const SCAN = "SCAN: a page with no font";
const GAPS = ["GLYPH GAP", "SHARE GAP", "EDGE 5:", "EDGE 21:", "SHARE 0.15", "GAP: an undetermined page is never sent"];
const EDGE22 = "EDGE 22:";

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that tells three arms broken from three arms working",
    mustFail: [], mustNotFail: [], patch: () => ({ armed: true, matches: 0 }),
  },
  nocoverage: {
    files: [PDFS],
    why: "drop the coverage arm: the nine pages read no marker and route nowhere, by name",
    mustFail: [...REAL, ROUTE_REAL, UNREAD],
    mustNotFail: [TEXTPAGE, TEXTROUTE, BLANK, SCAN, EDGE22],
    patch: () => arm(PDFS, "  if (imgs.images) markImageContent(doc, pageOrder, text, imgs.images);",
                           "  if (false) markImageContent(doc, pageOrder, text, imgs.images);"),
  },
  noroute: {
    files: [INDEX],
    why: "the route forgets the new marker: the markers stand and the OCR member is never asked about them",
    mustFail: [ROUTE_REAL, ROUTE_SYN],
    mustNotFail: [...REAL, UNREAD, TEXTPAGE, TEXTROUTE, SCAN],
    patch: () => arm(INDEX, 'const TIER3_REASONS = Object.freeze(["no_text_layer", "image_content_unread"]);',
                            'const TIER3_REASONS = Object.freeze(["no_text_layer"]);'),
  },
  forcegap: {
    files: [PDFS],
    why: "a page in a measured gap is forced to the image side: every gap and edge fails, unread and text hold",
    mustFail: GAPS,
    mustNotFail: [...REAL, UNREAD, TEXTPAGE, EDGE22, ROUTE_REAL],
    patch: () => arm(PDFS, "    const unread = share !== null && share >= IMAGE_CONTENT_MIN_SHARE && glyphs <= IMAGE_CONTENT_MAX_GLYPHS;",
                           "    const unread = true;"),
  },
};

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
  const results = ["d627"].map(runSuite);
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
process.exit(0);
