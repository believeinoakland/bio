/* CPDF-10 NEGATIVE-CONTROL DRIVER for `ocr-worker` — the third fleet member.
 *
 * A DRIVER, deliberately NOT named `*.test.mjs`, because the battery's discovery
 * rule is readdir + `endsWith(".test.mjs")` and this file EDITS REAL SOURCES and
 * REBUILDS the committed artifact while it runs. THE PEN LIVES INSIDE THIS
 * WORKTREE and never in a shared scratchpad, which a concurrent worker
 * overwrote between ARM and RESTORE once already (PL-10).
 *
 * ---- HOW A RESTORE IS DONE HERE, AND WHY NOT THE OBVIOUS WAY ---------------
 *
 * By `cp` from a per-arm pristine copy, verified by sha256 AND by `cmp`, with
 * the byte count printed and floored. **NEVER `git checkout -- <file>`**, which
 * restores to HEAD rather than to what was there: in a tree with uncommitted
 * work it is "throw mine away" and it exits 0 either way. CLAUDE.md records that
 * costing a whole implementation twice in two days, both times on a control arm
 * doing exactly what this file does.
 *
 * ---- WHAT IS REBUILT, AND WHY THAT MATTERS -------------------------------
 *
 * The suite boots the COMMITTED BUNDLE, so mutating a source and not rebuilding
 * would arm nothing at all — the arm would run against the artifact it was
 * trying to break, and every arm would come back a beautiful green. So each arm
 * mutates a source, REBUILDS, runs the suite, and restores BOTH the source and
 * the artifact. That the rebuild is required is itself FL-9's guard being real:
 * an unrebuilt mutation fails the staleness arm instead, which is the other
 * correct outcome and is checked below in the baseline row.
 *
 * Run:  node test/ocr-worker.control.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const MEMBER = join(HERE, "..");
const PEN = join(MEMBER, ".cpdf10-pen");
const SUITE = join(HERE, "ocr-worker.test.mjs");

const SRC = {
  png: join(MEMBER, "src/pngsamples.mjs"),
  contract: join(MEMBER, "src/contract.mjs"),
  transcribe: join(MEMBER, "src/transcribe.mjs"),
};
const ARTIFACT = join(MEMBER, "dist/ocr-worker.bundled.mjs");
const MANIFEST = join(MEMBER, "dist/ocr-worker.bundle.json");
const TOUCHABLE = [...Object.values(SRC), ARTIFACT, MANIFEST];

const sha = (b) => createHash("sha256").update(b).digest("hex");
const shaFile = (p) => sha(readFileSync(p));

const rebuild = () => spawnSync(process.execPath, [join(MEMBER, "scripts/build.mjs")],
  { cwd: MEMBER, encoding: "utf8" });

/** Run the suite and read its own tally from its own FOOT line. A count with no
 *  foot is a module that died before it finished, and is reported as -1 rather
 *  than as a clean zero (WORKER.md's first receipt). */
function runSuite() {
  const r = spawnSync(process.execPath, [SUITE], { cwd: MEMBER, encoding: "utf8",
                                                   maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = /^ocr-worker: (\d+) passed, (\d+) failed$/m.exec(out);
  const foot = !!m && !/SUITE ENDED BEFORE ITS OWN FOOT/.test(out);
  return { code: r.status, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, foot, out };
}

/* ---- the pen ------------------------------------------------------------- */
if (existsSync(PEN)) rmSync(PEN, { recursive: true, force: true });
mkdirSync(PEN, { recursive: true });
const pristine = new Map();
for (const p of TOUCHABLE) {
  const to = join(PEN, p.split("/").slice(-2).join("__"));
  copyFileSync(p, to);
  pristine.set(p, to);
  console.log(`pristine: ${p.slice(MEMBER.length + 1)} -> ${readFileSync(to).length} B, sha256 ${shaFile(to)}`);
}
/* THE CORPUS FLOOR. A restore verified against an EMPTY pristine copy agrees
   for free — two harnesses in this estate reported byte-identical over an empty
   manifest, caught only because a digest read `e3b0c442…`. */
for (const [p, to] of pristine) {
  const n = readFileSync(to).length;
  if (n < 500) { console.error(`PRISTINE TOO SMALL: ${p} is ${n} B — refusing to run`); process.exit(2); }
}

function restore(paths) {
  let ok = true;
  for (const p of paths) {
    const from = pristine.get(p);
    copyFileSync(from, p);
    const a = readFileSync(from), b = readFileSync(p);
    const same = a.equals(b) && sha(a) === sha(b);
    /* `cmp` as well as the in-process compare, because the point of the second
       instrument is that it is a second instrument. */
    let cmpOk = true;
    try { execFileSync("cmp", ["-s", from, p]); } catch { cmpOk = false; }
    console.log(`   restored ${p.slice(MEMBER.length + 1)}: ${b.length} B · sha256 ${sha(b)}`
      + ` · content ${same ? "IDENTICAL" : "DIFFERENT"} · cmp ${cmpOk ? "IDENTICAL" : "DIFFERENT"}`);
    if (!same || !cmpOk) ok = false;
  }
  return ok;
}

/* ---- the arms, DECLARED BEFORE ARMING ------------------------------------ */
let armsRun = 0, surprises = 0;
let BASE = null;

function arm(id, declared, files, mutate, judge) {
  armsRun++;
  console.log(`\n=== ARM ${id} — ${declared.what}`);
  console.log(`    MUST FAIL:     ${declared.mustFail}`);
  console.log(`    MUST NOT FAIL: ${declared.mustNot}`);
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    const next = mutate(src, f);
    if (next === src) {
      console.log(`    *** ARM NEVER ARMED: the patch matched nothing in ${f.slice(MEMBER.length + 1)}.`
        + ` AN ARM THAT DID NOT ARM IS A FINDING. ***`);
      surprises++;
      restore(TOUCHABLE);
      return;
    }
    writeFileSync(f, next);
  }
  const b = rebuild();
  if (b.status !== 0) console.log(`    (rebuild exited ${b.status} — noted; the suite still runs against whatever stands)`);
  const r = runSuite();
  console.log(`    RESULT: ${r.pass} pass, ${r.fail} fail, exit ${r.code}, foot ${r.foot ? "reached" : "NOT REACHED"}`);
  const verdict = judge(r);
  console.log(`    ${verdict.ok ? "AS DECLARED" : "*** NOT AS DECLARED — A FINDING ABOUT THIS ARM ***"}: ${verdict.why}`);
  if (!verdict.ok) surprises++;
  if (!restore(TOUCHABLE)) { console.error("RESTORE FAILED — stopping"); process.exit(2); }
  const rb = rebuild();
  if (rb.status !== 0) { console.error("REBUILD AFTER RESTORE FAILED — stopping"); process.exit(2); }
  if (shaFile(ARTIFACT) !== shaFile(pristine.get(ARTIFACT))) {
    console.error("THE REBUILT ARTIFACT IS NOT THE COMMITTED ONE AFTER RESTORE — stopping");
    process.exit(2);
  }
}

console.log("\n=== BASELINE — the row that distinguishes six-arms-broken from six-arms-working ===");
{
  const r = runSuite();
  BASE = r;
  console.log(`    BASELINE: ${r.pass} pass, ${r.fail} fail, exit ${r.code}, foot ${r.foot ? "reached" : "NOT REACHED"}`);
  if (r.code !== 0 || r.fail !== 0 || !r.foot) {
    console.error("BASELINE IS NOT GREEN — every arm below would be uninterpretable. Stopping.");
    process.exit(2);
  }
}

arm("a · the PNG reader stops stripping the scanline FILTER BYTE",
  { what: "samples shift by one byte per row, so the frame is plausible and wrong",
    mustFail: "the INDEPENDENT-digest arm (the expectation is Pillow's, not ours) and the real page's text pins",
    mustNot: "the refusal arms, the chunk rule, the frame bound — none of them touch the raster" },
  [SRC.png],
  (s) => s.replace(
    "packed.set(raw.subarray(y * (rowBytes + 1) + 1, (y + 1) * (rowBytes + 1)), y * rowBytes);",
    "packed.set(raw.subarray(y * (rowBytes + 1), (y + 1) * (rowBytes + 1) - 1), y * rowBytes);"),
  (r) => ({ ok: r.fail > 0 && r.foot, why: `${r.fail} failure(s); the digest and text arms are the subject` }));

arm("b · `chooseChunk` stops naming what it DEFERRED",
  { what: "the member does one page and says nothing about the rest",
    mustFail: "the ONE-PAGE-PER-INVOCATION arms — a member that quietly drops pages returns half a document with no way to tell",
    mustNot: "the real page's arms, the refusals, the writes-nothing arms" },
  [SRC.contract],
  (s) => s.replace("return { take: clean.length ? clean[0] : null, deferred: clean.slice(1) };",
                   "return { take: clean.length ? clean[0] : null, deferred: [] };"),
  (r) => ({ ok: r.fail > 0 && r.foot, why: `${r.fail} failure(s); the deferred-pages arms are the subject` }));

arm("c · the measured frame bound is raised past the figure that was KILLED",
  { what: "a page whose RGBA frame CPDF-15 measured being killed is attempted instead of refused",
    mustFail: "the over-bound refusal arm",
    mustNot: "everything about the real page, which is well under either bound" },
  [SRC.contract],
  (s) => s.replace("export const MAX_FRAME_BYTES = 61_300_000;",
                   "export const MAX_FRAME_BYTES = 500_000_000;"),
  (r) => ({ ok: r.fail > 0 && r.foot, why: `${r.fail} failure(s); the frame-bound arms are the subject` }));

arm("d · the confidence basis is reported as a model's SELF-REPORT",
  { what: "the pseudo-confidence DEC-35 forbids, arriving from a member that could have named `engine`",
    mustFail: "the basis arm AND the plane's own imported `checkConfidence`, which refuses by BASIS and not by value",
    mustNot: "the anchor arms, the refusals, the chunk rule" },
  [SRC.transcribe],
  (s) => s.replace('confidence: rated ? { value: c, basis: "engine" } : "none",',
                   'confidence: rated ? { value: c, basis: "self_reported" } : "none",'),
  (r) => ({ ok: r.fail > 0 && r.foot, why: `${r.fail} failure(s); the confidence arms are the subject` }));

arm("e · the anchor's rect is dropped from every region",
  { what: "text nobody can point at a page to verify — the thing CPDF-10 exists to refuse",
    mustFail: "the anchor arms AND the plane's own imported `checkAnchor`",
    mustNot: "the version arm, the writes-nothing arms, the refusals" },
  [SRC.transcribe],
  (s) => s.replace('source: { kind: "pdf-page", ref, page, rect: [l, t0, r, b], space: "image-px",',
                   'source: { kind: "pdf-page", ref, page, space: "image-px",'),
  (r) => ({ ok: r.fail > 0 && r.foot, why: `${r.fail} failure(s); the anchor arms are the subject` }));

arm("f · OVER-STRICTNESS: a real but irrelevant field on the member's wire answer",
  { what: "a change that is correct in a spelling the suite did not anticipate",
    mustFail: "NOTHING — a suite that fails on any change at all is a suite nobody can edit",
    mustNot: "every arm; the tally must equal the baseline exactly" },
  [SRC.transcribe],
  (s) => s.replace("    deferred,\n    image: one.image,",
                   "    deferred,\n    transcribed_at_grain: one.grain,\n    image: one.image,"),
  (r) => ({ ok: r.fail === 0 && r.code === 0 && r.pass === BASE.pass && r.foot,
            why: `${r.pass}/${r.fail} against a baseline of ${BASE.pass}/${BASE.fail}` }));

console.log("\n=== POST-RESTORE — the tree is back where it started ===");
{
  const r = runSuite();
  console.log(`    ${r.pass} pass, ${r.fail} fail, exit ${r.code}, foot ${r.foot ? "reached" : "NOT REACHED"}`);
  const same = r.pass === BASE.pass && r.fail === 0 && r.code === 0;
  if (!same) { console.error("THE TREE DID NOT COME BACK — stopping"); process.exit(2); }
  for (const p of TOUCHABLE)
    console.log(`   ${p.slice(MEMBER.length + 1)}: sha256 ${shaFile(p)} (pristine ${shaFile(pristine.get(p))})`);
}

rmSync(PEN, { recursive: true, force: true });
console.log(`\nocr-worker.control: ${armsRun} arm(s) run, ${surprises} NOT as declared`);
process.exit(surprises ? 1 : 0);
