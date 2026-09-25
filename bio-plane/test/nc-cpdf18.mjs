/* CPDF-18's NEGATIVE CONTROL HARNESS. Declared in the suite it drives
 * (`cpdf18-pdf-images.test.mjs`), run from `bio-plane/` in one step:
 *
 *     node test/nc-cpdf18.mjs               # every arm, baseline first
 *     node test/nc-cpdf18.mjs droprect      # one arm
 *
 * NOT a `.test.mjs`, deliberately: it EDITS A REAL SOURCE while it runs, so the
 * battery's discovery must not find it. The machinery is `nc-fw19.mjs`'s, copied
 * (that file's own precedent is `nc-coff12.mjs`): `mustNotFail` is CHECKED, an
 * arm that does not arm is a finding, and every restore is verified by sha256
 * AND by content, with a byte count printed and a minimum guarded — never
 * `git checkout --`.
 *
 * THE ARMS, and what each proves (EXTRACTION-BREADTH §8 and the CPDF-18 row):
 *   droprect  — THE ROW'S DECLARED CONTROL: "the rect dropped from the reference
 *               -> the crop cannot be derived and the arm fails by name". The
 *               PRODUCER drops it (`pdfImageRef` writes rect:null), the row still
 *               mints at page grain, and cropping that row fails RECT_REQUIRED.
 *   nocm      — the walk ignores `cm`: every rectangle is wrong while the counts
 *               hold, proving the rect assertions measure placement, not presence.
 *   inlineleak — the image walk tokenises an inline image's sample bytes as
 *               operators: the placement painted AFTER the inline image moves.
 *   emptynull — THE ROW'S OVER-STRICTNESS CLAUSE ("a page with no images yields
 *               no rows and says so"): turn a measured empty list into null and
 *               the measured-zero assertion fails while every rect holds.
 *   textpin   — perturb Tier 1's TEXT walk (not the image walk): the pristine
 *               text digests MUST fail and every image assertion hold — proving
 *               the pin can see a change to the text this item promised not to move.
 *
 * Pristine copies live in a pen OUTSIDE the worktree — `controlPen("cpdf18")` from `test/pen.mjs`
 * (M0-182, BOB #32) — uniquely named per arm.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SAFE = controlPen("cpdf18");
mkdirSync(SAFE, { recursive: true });

const PDFS = join(PLANE, "src/pdfstructure.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 50000;   // pdfstructure.mjs is ~77 KB; a restore over a stub must fail loudly.

const SUITES = { cpdf18: "test/cpdf18-pdf-images.test.mjs" };
function runSuite(key) {
  const r = spawnSync(process.execPath, [SUITES[key]],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  return { key, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
}
function arm(file, find, replace) {
  if (ANCHOR_DRY) return (anchorPatch(file, find, replace), { armed: true, matches: 1 });   /* M0-197: read, never armed */
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, () => replace));
  return { armed: true, matches: n };
}

const P0 = "page 0's four placements come back IN PAINTING ORDER";
const INLINE = "the inline image's sample bytes spell";
const AGENDA = "and that image's rectangle is the one its content stream's `cm` places it at";
const CROP_ROW = "cropping the minted row's own extent succeeds";
const NC_ROW = "NEGATIVE CONTROL (the row's)";
const EMPTY = "paints NO image: a MEASURED EMPTY LIST";
const NOPAINT = "a page that paints nothing yields NO entry";
const COUNTS = "legistar-73545: two images on page 0";
const TEXT = "TIER 1's TEXT over the image fixture";
const CROP_EMPTY = "a crop asked of a page that paints nothing";

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes five-arms-broken from five-arms-working",
    mustFail: [], mustNotFail: [], patch: () => ({ armed: true, matches: 0 }),
  },
  droprect: {
    files: [PDFS],
    why: "the producer drops the rect from the reference: the row mints at page grain and its crop is refused BY NAME",
    mustFail: [P0, CROP_ROW],
    mustNotFail: [NC_ROW, NOPAINT, COUNTS, TEXT],
    patch: () => arm(PDFS, "return { kind: \"image\", ref: `an image on page ${page + 1}`, page, rect, ...extra };",
                           "return { kind: \"image\", ref: `an image on page ${page + 1}`, page, rect: null, ...extra };"),
  },
  nocm: {
    files: [PDFS],
    why: "the image walk ignores `cm`: counts hold, every rectangle is wrong",
    mustFail: [P0, AGENDA],
    mustNotFail: [NOPAINT, COUNTS, EMPTY, TEXT],
    patch: () => arm(PDFS, "          if (nums.length === 6) ctm = mulMatrix(nums, ctm);",
                           "          if (false) ctm = mulMatrix(nums, ctm);"),
  },
  inlineleak: {
    files: [PDFS],
    why: "the image walk reads inline sample bytes as operators: the placement after the inline image moves",
    mustFail: [INLINE, P0],
    mustNotFail: [NOPAINT, COUNTS, EMPTY, AGENDA, TEXT],
    patch: () => arm(PDFS, "    const toks = tokenizeContent(content, { inlineImages: true });",
                           "    const toks = tokenizeContent(content);"),
  },
  emptynull: {
    files: [PDFS],
    why: "a measured empty list is reported as null: the page-with-no-images zero stops SAYING so",
    mustFail: [EMPTY],
    mustNotFail: [P0, NOPAINT, COUNTS, AGENDA, TEXT, CROP_EMPTY],
    patch: () => arm(PDFS, "  return { images: all, why: null };\n}",
                           "  return all.length ? { images: all, why: null } : { images: null, why: \"none\" };\n}"),
  },
  textpin: {
    files: [PDFS],
    why: "perturb Tier 1's text walk: the pristine text digests MUST fail and every image assertion hold",
    mustFail: [TEXT],
    mustNotFail: [P0, NOPAINT, COUNTS, AGENDA, EMPTY, CROP_ROW],
    /* TWO EARLIER FORMS OF THIS ARM ARMED AND BIT NOTHING (29/0 both times),
       recorded rather than smoothed: doubling the newline collapse (the pinned
       texts carry no run of two newlines for it to act on) and moving the TJ word-gap
       threshold from -100 to -50 (no advance on these fixtures falls between).
       Each perturbed a path the pinned inputs do not reach. The line-break
       emission below is on the path EVERY text line takes. */
    patch: () => arm(PDFS, `        pieces.push("\\n"); // a new text line`,
                           `        pieces.push("\\n "); // a new text line`),
  },
};

anchorEach(ARMS, (a) => a.patch());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

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
  const results = ["cpdf18"].map(runSuite);
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
