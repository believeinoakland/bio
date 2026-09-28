/* d419-content-crop.control.mjs — the NEGATIVE CONTROL for `test/d419-content-crop.test.mjs` (D-419, content R32).
 *
 * WRITTEN 2026-09-28 (T7, LEGACY-TESTS #4 under K219/K220): the suite declared no negative control, so
 * `scripts/coverage.mjs --strict` counted it `uncontrolled` and `owed-controls.test.mjs` A13b stayed red.
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `bio-plane/src/` (and the trees it imports: `bio-plane/checks`,
 * `pdf-worker/src`, `docprofile`, `jurisdictions`) in a temporary directory, and the battery must not discover it.
 * Run from `bio-plane/`: `node test/d419-content-crop.control.mjs [arm]`.
 *
 * Every arm patches a COPY (asserting its anchor occurs EXACTLY ONCE, or the arm reports it did not arm), runs the
 * suite against the copy through `D419_TREE`, and compares the failing assertions with what was DECLARED below
 * before arming: missing and unexpected failures are both printed. The REAL sources the arms name are hashed before
 * and after (sha256, and compared by content): the real file is never the one armed, and the digest pair is the
 * verification of that. `d260-resume.control.mjs`'s design.
 *
 * THE ARMS, DECLARED BEFORE ARMING (what MUST fail, by assertion label):
 *   baseline         — nothing armed. MUST be green (16/0).
 *   stamp-dropped    — op=contentcrop removed from the plane's viewer-stamp list in src/index.mjs, so the caller's
 *                      own `viewer=` (or none) reaches the store -> every served crop fails closed: the grey crop, its
 *                      dimensions, its bytes, its `says`, the JPEG passthrough, the no-rectangle refusal (answered
 *                      NO_SUCH_CONTENT instead), the whole-document refusal (likewise), the forged-viewer arm and the
 *                      store control's sha comparison MUST FAIL.
 *   fail-open        — `cropOf`'s visibility test skipped when no viewer is given (src/content/index.mjs) -> the
 *                      store-with-no-viewer arm and its byte-for-byte arm MUST FAIL; everything else green.
 *   rect-dropped     — `cropOf` hands pdf-pixels no rectangle (the extent's rect ignored) -> the grey crop, its
 *                      dimensions, bytes, `says`, the JPEG passthrough, the forged-viewer arm and the store control
 *                      MUST FAIL; the no-rectangle refusal stays green.
 *   refusal-collapsed — CROP_NOT_A_PAGE_IMAGE answered as NO_SUCH_CONTENT -> the whole-document arm MUST FAIL alone.
 *   detail-respelled — OVER-STRICTNESS: CROP_NOT_A_PAGE_IMAGE's `detail` sentence reworded -> nothing may fail.
 *
 * RESULTS: written into the suite's `NEGATIVE CONTROL:` declaration when run (see its header).
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "d419-content-crop.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["bio-plane/src/index.mjs", "bio-plane/src/content/index.mjs"].map((f) => join(REPO, f));
const before = REAL.map(digest);
const bytesBefore = REAL.map((p) => readFileSync(p));

const IDX = "bio-plane/src/index.mjs", CONTENT = "bio-plane/src/content/index.mjs";
const SEES = "    if (!r || !this.sees(r.bundle_id, viewer))\n      return { ok: false, reason: \"NO_SUCH_CONTENT\", target: id || null,\n";
const CROP_CALL = "cropImage(bytes, { kind: \"image\", page: e.page, rect: Array.isArray(e.rect) ? e.rect : null })";
const NOT_PAGE = "return { ok: false, reason: \"CROP_NOT_A_PAGE_IMAGE\", content_id: r.content_id,";
const NOT_PAGE_DETAIL = "`this row cites a ${r.extent_kind} extent, and only an image on a PDF page has a crop`";

const SERVED = ["the grey image's row", "D-419 crop dimensions", "the bytes handed back hash",
                "and the answer says what it is not", "the JPEG's row"];
const ARMS = {
  baseline: { patches: [], mustFail: [] },
  "stamp-dropped": {
    patches: [[IDX, "        || op === \"contentcrop\"\n", ""]],
    mustFail: [...SERVED, "an image row with NO rectangle", "a WHOLE-DOCUMENT row",
               "a caller's own viewer= is overwritten", "(the control: the same store call"],
  },
  "fail-open": {
    /* The replacement is spelled whole, not derived by a `.replace(…)` of the anchor: m025's A5 reads every
       `.replace(` first argument as an anchor into the subject, and the inner phrase occurs three times there. */
    patches: [[CONTENT, SEES, "    if (!r || (viewer != null && !this.sees(r.bundle_id, viewer)))\n      return { ok: false, reason: \"NO_SUCH_CONTENT\", target: id || null,\n"]],
    mustFail: ["the store route with NO viewer fails closed", "byte for byte as an id nothing cites"],
  },
  "rect-dropped": {
    patches: [[CONTENT, CROP_CALL, "cropImage(bytes, { kind: \"image\", page: e.page, rect: null })"]],
    mustFail: [...SERVED, "a caller's own viewer= is overwritten", "(the control: the same store call"],
  },
  "refusal-collapsed": {
    patches: [[CONTENT, NOT_PAGE, "return { ok: false, reason: \"NO_SUCH_CONTENT\", content_id: r.content_id,"]],
    mustFail: ["a WHOLE-DOCUMENT row"],
  },
  "detail-respelled": {
    patches: [[CONTENT, NOT_PAGE_DETAIL, "`a ${r.extent_kind} extent has no crop: only an image on a PDF page does`"]],
    mustFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d419-crop-${name}-`));
  try {
    const tree = join(root, "tree");
    for (const d of ["bio-plane/src", "bio-plane/checks", "pdf-worker/src", "docprofile", "jurisdictions"])
      cpSync(join(REPO, d), join(tree, d), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, file);
      const s = readFileSync(p, "utf8");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.replace(from, () => to));
    }
    const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, env: { ...process.env, D419_TREE: tree },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /d419-content-crop: (\d+) pass, (\d+) fail/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             exit: r.status, err: tally ? "" : (r.stderr || "").slice(-600),
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const want = process.argv[2];
if (want && !ARMS[want]) { console.error(`unknown arm ${want}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
let bad = 0;
for (const n of want ? [want] : Object.keys(ARMS)) {
  const r = run(n);
  if (!r.armed) { console.log(`  ARM DID NOT ARM  ${n}: ${r.why}`); bad++; continue; }
  console.log(`  ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}  ${n}  pass/fail ${r.tally}  exit ${r.exit}`
    + (r.missing.length ? `\n      declared to fail but passed: ${JSON.stringify(r.missing)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected)}` : "")
    + (r.err ? `\n      stderr: ${r.err}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]) && REAL.every((p, i) => readFileSync(p).equals(bytesBefore[i]));
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-3).join("/")} ${after[i]}`).join(" · ")} — `
  + `untouched (sha256 AND content): ${untouched ? "YES" : "NO"}`);
process.exit(bad || !untouched ? 1 : 0);
