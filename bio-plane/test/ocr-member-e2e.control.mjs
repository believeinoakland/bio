/* CPDF-10's THREE NEGATIVE CONTROLS — the ones the QUEUE ROW names — armed on
 * the REAL path: the plane, the real service binding, the real engine, a real
 * scanned Oakland page.
 *
 * A DRIVER, deliberately NOT named `*.test.mjs`: it EDITS REAL SOURCES and
 * REBUILDS the member's committed artifact while it runs. THE PEN LIVES INSIDE
 * THIS WORKTREE and never in a shared scratchpad (PL-10).
 *
 * ---- RESTORES ---------------------------------------------------------------
 * By `cp` from a per-arm pristine copy, verified by sha256 AND by `cmp`, byte
 * counts printed and floored. **NEVER `git checkout -- <file>`**: it restores to
 * HEAD rather than to what was there, exits 0 either way, and CLAUDE.md records
 * it costing a whole implementation twice in two days on control arms doing
 * exactly this.
 *
 * ---- ONE ARM REACHES OUTSIDE THIS ITEM'S GROUND, AND SAYS SO ---------------
 * Arm (3) mutates `bio-plane/src/index.mjs`, which CPDF-10's claim deliberately
 * excludes from EDITS. A control arm is not an edit: the file is copied aside,
 * mutated, run, restored and verified byte-identical, and the run stops if the
 * restore is anything less. That is `nc-cpdf10.mjs`'s own precedent, which arms
 * `pdfstructure.mjs` the same way for the same reason — the rule the row states
 * lives in the plane, so the arm that proves it lives there too.
 *
 * Run:  node test/ocr-member-e2e.control.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { ANCHOR_DRY, anchorRows, anchorTable } from "../scripts/anchortable.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const REPO = join(PLANE, "..");
const MEMBER = join(REPO, "ocr-worker");
/* M0-197: under the dry read of tools/anchordrift.mjs the pristine copies land in its throwaway $TMPDIR, not the tree. */
const PEN = ANCHOR_DRY ? join(tmpdir(), "cpdf10-e2e-pen") : join(PLANE, ".cpdf10-e2e-pen");
const SUITE = join(HERE, "ocr-member-e2e.test.mjs");

const F = {
  engine: join(MEMBER, "src/tessengine.mjs"),
  index: join(MEMBER, "src/index.mjs"),
  planeIndex: join(PLANE, "src/index.mjs"),
  artifact: join(MEMBER, "dist/ocr-worker.bundled.mjs"),
  manifest: join(MEMBER, "dist/ocr-worker.bundle.json"),
};
const TOUCHABLE = Object.values(F);

const sha = (b) => createHash("sha256").update(b).digest("hex");
const shaFile = (p) => sha(readFileSync(p));
const rel = (p) => p.slice(REPO.length + 1);

const rebuild = () => spawnSync(process.execPath, [join(MEMBER, "scripts/build.mjs")],
  { cwd: MEMBER, encoding: "utf8" });

function runSuite() {
  const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8",
                                                   maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = /^ocr-member-e2e: (\d+) passed, (\d+) failed$/m.exec(out);
  const foot = !!m && !/SUITE ENDED BEFORE ITS OWN FOOT/.test(out);
  const failed = [...out.matchAll(/^  FAIL  (.+)$/gm)].map((x) => x[1]);
  return { code: r.status, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, foot, failed, out };
}

if (existsSync(PEN)) rmSync(PEN, { recursive: true, force: true });
mkdirSync(PEN, { recursive: true });
const pristine = new Map();
for (const p of TOUCHABLE) {
  const to = join(PEN, rel(p).replace(/\//g, "__"));
  copyFileSync(p, to);
  pristine.set(p, to);
  const n = readFileSync(to).length;
  console.log(`pristine: ${rel(p)} -> ${n} B, sha256 ${shaFile(to)}`);
  if (n < 500) { console.error(`PRISTINE TOO SMALL: ${rel(p)} is ${n} B — refusing to run`); process.exit(2); }
}

function restore() {
  let ok = true;
  for (const p of TOUCHABLE) {
    const from = pristine.get(p);
    copyFileSync(from, p);
    const a = readFileSync(from), b = readFileSync(p);
    const same = a.equals(b) && sha(a) === sha(b);
    let cmpOk = true;
    try { execFileSync("cmp", ["-s", from, p]); } catch { cmpOk = false; }
    console.log(`   restored ${rel(p)}: ${b.length} B · sha256 ${sha(b)}`
      + ` · content ${same ? "IDENTICAL" : "DIFFERENT"} · cmp ${cmpOk ? "IDENTICAL" : "DIFFERENT"}`);
    if (!same || !cmpOk) ok = false;
  }
  return ok;
}

let armsRun = 0, surprises = 0, BASE = null;

function arm(id, declared, edits, judge) {
  if (ANCHOR_DRY) return void anchorRows(edits.map(([file, from, to]) => ({ arm: id.split(" ")[0], file, find: from, put: to })));   /* M0-197: read, never armed */
  armsRun++;
  console.log(`\n=== ARM ${id} — ${declared.what}`);
  console.log(`    MUST FAIL:     ${declared.mustFail}`);
  console.log(`    MUST NOT FAIL: ${declared.mustNot}`);
  for (const [file, from, to] of edits) {
    const src = readFileSync(file, "utf8");
    if (!src.includes(from)) {
      console.log(`    *** ARM NEVER ARMED: the patch anchor is absent from ${rel(file)}.`
        + ` AN ARM THAT DID NOT ARM IS A FINDING. ***`);
      surprises++; restore(); rebuild(); return;
    }
    if (src.split(from).length > 2) {
      console.log(`    *** ARM AMBIGUOUS: the anchor occurs more than once in ${rel(file)}. ***`);
      surprises++; restore(); rebuild(); return;
    }
    writeFileSync(file, src.replace(from, to));
  }
  const b = rebuild();
  if (b.status !== 0) console.log(`    (rebuild exited ${b.status} — noted)`);
  const r = runSuite();
  console.log(`    RESULT: ${r.pass} pass, ${r.fail} fail, exit ${r.code}, foot ${r.foot ? "reached" : "NOT REACHED"}`);
  for (const f of r.failed.slice(0, 12)) console.log(`      FAILED: ${f}`);
  if (r.failed.length > 12) console.log(`      … and ${r.failed.length - 12} more`);
  const v = judge(r);
  console.log(`    ${v.ok ? "AS DECLARED" : "*** NOT AS DECLARED — A FINDING ABOUT THIS ARM ***"}: ${v.why}`);
  if (!v.ok) surprises++;
  if (!restore()) { console.error("RESTORE FAILED — stopping"); process.exit(2); }
  const rb = rebuild();
  if (rb.status !== 0) { console.error("REBUILD AFTER RESTORE FAILED — stopping"); process.exit(2); }
  if (shaFile(F.artifact) !== shaFile(pristine.get(F.artifact))) {
    console.error("THE REBUILT ARTIFACT IS NOT THE COMMITTED ONE AFTER RESTORE — stopping");
    process.exit(2);
  }
}

console.log("\n=== BASELINE — without this row, three-arms-broken and three-arms-working read alike ===");
if (!ANCHOR_DRY) {   /* M0-197: no suite runs under the dry read */
  BASE = runSuite();
  console.log(`    BASELINE: ${BASE.pass} pass, ${BASE.fail} fail, exit ${BASE.code}, foot ${BASE.foot ? "reached" : "NOT REACHED"}`);
  if (BASE.code !== 0 || BASE.fail !== 0 || !BASE.foot) {
    console.error("BASELINE IS NOT GREEN — every arm below would be uninterpretable. Stopping.");
    process.exit(2);
  }
}

/* (1) THE ROW'S FIRST ARM: strip the `text_source` marker. The marker's SOURCE
   in this path is the member naming what performed the derivation — the plane
   composes the chain from `engine`+`version`+`cap`, and with no engine name
   there is nothing to compose. The suite must then fail naming an OCR'd document
   that cannot be told from a published text layer. */
arm("1 · STRIP THE `text_source` MARKER (the member stops naming what performed the derivation)",
  { what: "an OCR'd document with no chain — nothing in the record separating it from a published text layer",
    mustFail: "the chain arms, the PROJECTION, the INDEX and the EXPORT distinguishability arms",
    mustNot: "the text-layer document's own arms — it never touches the member" },
  [[F.engine, 'export const ENGINE_NAME = "tesseract-wasm";', 'export const ENGINE_NAME = "";']],
  (r) => ({ ok: r.fail > 0 && r.foot, why: `${r.fail} failure(s); the distinguishability arms are the subject` }));

/* (2) THE ROW'S SECOND ARM: drop the confidence floor so a garbled region emits
   a best guess. The floor is an INSTANCE setting the member reports; dropping
   the plumbing makes the floored instance behave as if no floor were set, and
   the page's text — every line of it below the configured threshold — reaches
   the record as the engine's best attempt. */
arm("2 · DROP THE CONFIDENCE FLOOR (a region below it emits a best guess instead of nothing)",
  { what: "the member stops reporting the floor its instance is configured with",
    mustFail: "the floor arms in section 9 — the floored instance reads the page instead of refusing to guess",
    mustNot: "the un-floored instance's arms, which never had a floor to lose" },
  [[F.index, "  const raw = env && env.OCR_CONFIDENCE_FLOOR;",
             "  const raw = null;  /* NC ARM 2 */"]],
  (r) => ({ ok: r.fail > 0 && r.foot, why: `${r.fail} failure(s); the section-9 floor arms are the subject` }));

/* (3) THE ROW'S THIRD ARM: collapse the chain. Not to a literal string — the
   plane's own `checkChain` refuses that outright and the arm would prove the
   type check rather than the rule — but to ONE STEP, which is the collapse that
   can actually happen: a chain that stops naming each thing that touched the
   text while still being a well-formed chain. THIS MUTATES `bio-plane/src`,
   which this item does not own; see the header. */
arm("3 · COLLAPSE THE CHAIN TO ONE LABEL (the wire stops recording the `pixels` step)",
  { what: "a chain that names the engine but not the derivation before it — a label where a chain was",
    mustFail: "every arm asserting the chain names EACH step, in the acquire path AND in the export",
    mustNot: "the index and the terminal-step projection, which read only the LAST step and cannot see this" },
  [[F.planeIndex,
    'let chain = appendStep([{ step: "pixels", cap: r.cap, measured_by: r.measured_by,\n                            calibration }],\n                         { step: "ocr", engine: r.engine, version: r.version,\n                           cap: r.cap, measured_by: r.measured_by, calibration });',
    'let chain = [{ step: "ocr", engine: r.engine, version: r.version,\n                 cap: r.cap, measured_by: r.measured_by, calibration }];  /* NC ARM 3 */']],
  (r) => ({ ok: r.fail > 0 && r.foot, why: `${r.fail} failure(s); the chain-shape arms are the subject` }));

anchorTable();   /* M0-197: prints the arms read above and exits, under the dry read only */
console.log("\n=== POST-RESTORE — the tree is back where it started ===");
{
  const r = runSuite();
  console.log(`    ${r.pass} pass, ${r.fail} fail, exit ${r.code}, foot ${r.foot ? "reached" : "NOT REACHED"}`);
  if (!(r.pass === BASE.pass && r.fail === 0 && r.code === 0)) {
    console.error("THE TREE DID NOT COME BACK — stopping"); process.exit(2);
  }
  for (const p of TOUCHABLE)
    console.log(`   ${rel(p)}: sha256 ${shaFile(p)} (pristine ${shaFile(pristine.get(p))})`);
}

rmSync(PEN, { recursive: true, force: true });
console.log(`\nocr-member-e2e.control: ${armsRun} arm(s) run, ${surprises} NOT as declared`);
process.exit(surprises ? 1 : 0);
