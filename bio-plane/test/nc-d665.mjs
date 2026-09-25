/* D-665's NEGATIVE CONTROL HARNESS. Declared in the suite it drives
 * (`d665-image-unread.test.mjs`), run from `bio-plane/` in one step:
 *
 *     node test/nc-d665.mjs               # every arm, baseline first
 *     node test/nc-d665.mjs invert        # one arm
 *
 * NOT a `.test.mjs`: it EDITS A REAL SOURCE while it runs, so the battery's discovery must not find it. The
 * machinery is `nc-d627.mjs`'s, copied: `mustNotFail` is CHECKED, an arm that does not arm is a finding, and
 * every restore is verified by sha256 AND by content, with a byte count printed and a minimum guarded — never
 * `git checkout --`. Pristine copies live in `controlPen("d665")` (`test/pen.mjs`), outside the worktree.
 *
 * THE ARMS:
 *   invert     — THE ROW'S DECLARED CONTROL: the rule inverted, `TIER3_REASONS` gains `image_unread`. The chart
 *                under a title is sent to OCR, so CHART ROUTE fails by name (and the photo wall and the chart
 *                beside the folio are sent too), while the markers and THE OP hold.
 *   nomarker   — `extractPdfStructure` stops calling `markImagesUnread`: every stated image goes silent, while
 *                the bullets, the floor-below page, the plain page and both routes hold.
 *   nofloor    — the floor drops to 0: the bullets and the floor-below image are stated, while the chart, the
 *                photos and the floor-above image hold.
 *   nodecode   — `decodeView` hands its input back: the photo wall's 30 markers outnumber its 25 glyphs, so it
 *                is sent to tier 2 and its reading fails as undecodable, while the routes and THE OP hold.
 *   reorder    — OVER-STRICTNESS: the per-image markers go BEFORE the page's other markers. That is correct work
 *                in an order the suite did not anticipate, and it MUST be green.
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
const SAFE = controlPen("d665");
mkdirSync(SAFE, { recursive: true });

const PDFS = join(PLANE, "src/pdfstructure.mjs");
const INDEX = join(PLANE, "src/index.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 50000;   // both sources are far larger; a restore over a stub must fail loudly.

const SUITES = { d665: "test/d665-image-unread.test.mjs" };
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

const CHART = "CHART: an image under a 30-glyph title";
const PHOTOS = "PHOTOS: a photo page";
const BULLETS = "BULLETS:";
const ABOVE = "FLOOR ABOVE:";
const BELOW = "FLOOR BELOW:";
const FOLIO = "FOLIO: D-627's page marker AND";
const SCAN = "SCAN: a page with no font";
const OFFPAGE = "OFF-PAGE:";
const VIAFORM = "VIA FORM:";
const PLAIN = "PLAIN:";
const REALCOUNT = "REAL PAGES: every page has as many image_unread markers";
const FLOORPIN = "the floor is M-182's";
const OP = "THE OP: op=pdfstructure hands a caller";
const CHART_ROUTE = "CHART ROUTE:";
const FOLIO_ROUTE = "THE FOLIO ROUTE:";
const WALL_T2 = "PHOTO WALL: 30 photo markers";
const WALL_OCR = "PHOTO WALL: nor to OCR";
const WALL_READ = "PHOTO WALL: its reading";

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that tells five arms broken from five arms working",
    mustFail: [], mustNotFail: [], patch: () => ({ armed: true, matches: 0 }),
  },
  invert: {
    files: [INDEX],
    why: "the rule inverted: image_unread routes to OCR, and the chart under a title is sent, by name",
    mustFail: [CHART_ROUTE, FOLIO_ROUTE, WALL_OCR],
    mustNotFail: [CHART, PHOTOS, BULLETS, OP, WALL_T2],
    patch: () => arm(INDEX, 'const TIER3_REASONS = Object.freeze(["no_text_layer", "image_content_unread"]);',
                            'const TIER3_REASONS = Object.freeze(["no_text_layer", "image_content_unread", "image_unread"]);'),
  },
  nomarker: {
    files: [PDFS],
    why: "the per-image statement dropped: every stated image goes silent",
    mustFail: [CHART, PHOTOS, ABOVE, FOLIO, SCAN, OFFPAGE, VIAFORM, REALCOUNT, OP],
    mustNotFail: [BULLETS, BELOW, PLAIN, CHART_ROUTE, FOLIO_ROUTE],
    patch: () => arm(PDFS, "  if (imgs.images) markImagesUnread(doc, pageOrder, text, imgs.images);",
                           "  if (false) markImagesUnread(doc, pageOrder, text, imgs.images);"),
  },
  nofloor: {
    files: [PDFS],
    why: "the floor dropped to 0: the bullets and the floor-below image are stated",
    mustFail: [BULLETS, BELOW, FLOORPIN],
    mustNotFail: [CHART, PHOTOS, ABOVE, REALCOUNT],
    patch: () => arm(PDFS, "export const IMAGE_UNREAD_MIN_SHARE = 0.001;", "export const IMAGE_UNREAD_MIN_SHARE = 0;"),
  },
  nodecode: {
    files: [INDEX],
    why: "decodeView hands its input back: the photo wall's picture count reads as undecoded text",
    mustFail: [WALL_T2, WALL_READ],
    mustNotFail: [CHART_ROUTE, FOLIO_ROUTE, OP, CHART],
    patch: () => arm(INDEX, "function decodeView(text) {\n", "function decodeView(text) {\n  return text;\n"),
  },
  reorder: {
    files: [PDFS],
    why: "OVER-STRICTNESS: the per-image markers go first on the page — correct, and must be green",
    mustFail: [], mustNotFail: [],
    patch: () => arm(PDFS, "    pg.undetermined = [...(Array.isArray(pg.undetermined) ? pg.undetermined : []), ...marks];",
                           "    pg.undetermined = [...marks, ...(Array.isArray(pg.undetermined) ? pg.undetermined : [])];"),
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
  const results = ["d665"].map(runSuite);
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
    console.log(`  VERDICT      ${ok ? "AS DECLARED — green" : "NOT AS DECLARED — the arm is not green"}`);
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
