#!/usr/bin/env node
/* nc-d375.mjs — the NEGATIVE CONTROL for D-375's arms in `observation-content.test.mjs` (sections B8b-B8i, K).
 * Deliberately NOT a `.test.mjs`: it EDITS REAL SOURCES while it runs, and the battery must not discover
 * it. Harness copied from `nc-d536.mjs` (itself nc-cpdf19's).
 *
 *   node test/nc-d375.mjs            # every arm, in order
 *   node test/nc-d375.mjs nocount    # one arm (plus the baseline)
 *
 * DISCIPLINE: every arm is armed ALONE; a patch must match EXACTLY ONCE or the arm is NOT ARMED and
 * nothing runs; the restore is `copyFileSync` from a UNIQUELY-NAMED per-arm pristine copy held OUTSIDE
 * the worktree (`NC_HOLD`, else the OS tmpdir), verified by sha256 AND by byte comparison with the byte
 * count printed and floored; the result is read from the suite's OWN foot line, and a run whose foot
 * reads -1 (or is missing) is -1/-1.
 *
 * DECLARED BEFORE ARMING — what MUST fail and what MUST NOT, by label:
 *   baseline    nothing armed; MUST be green.
 *   nocount     THE ROW'S OWN CONTROL: "drop the count" — acquire no longer carries `textCountsOf` onto
 *               the reading. K1 and K2 MUST FAIL BY NAME (the scan read to nothing no longer reads
 *               LOOKED_ABSENT), and K5 (it pins the glyph figure); K3/K4 and every pure arm MUST NOT.
 *               THE ROW PREDICTED K2 WOULD READ `PRESENT`. Declared here as measured before arming: it
 *               reads LOOKED_INDETERMINATE, because the reader DECLINES empty text (`read_from_text:
 *               false`) and row 3 answers — PRESENT is what a count-less reading of WHITESPACE text reads
 *               (B8g's legacy arm, `read_from_text: true`).
 *   noresidue   LOOKED_ABSENT no longer requires a zero residue. K5 and B8h MUST FAIL (ink below the floor
 *               filed as no text); K2, K3 MUST NOT.
 *   noshortfall LOOKED_ABSENT no longer refuses a `tier3_candidate` reading. B8c MUST FAIL; K3 MUST NOT —
 *               through the op the unread page ALSO keeps its `no_text_layer` marker as residue, so the
 *               second guard holds it. Two guards, each proved to bite alone.
 *   afterrow3   the row-4 branch reached only for `read_from_text: true` (where it was first written).
 *               K2 and B8i MUST FAIL; the rest MUST NOT.
 *   charsonly   OVER-STRICTNESS: the reading carries the producer's `counts.chars` and no glyph figure.
 *               K1 MUST FAIL (it pins the glyph figure) and NOTHING ELSE: the judgement must still reach
 *               LOOKED_ABSENT off the producer's zero.
 *
 * RESULTS — see the NEGATIVE CONTROL: line at the head of `observation-content.test.mjs`.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOLD = join(process.env.NC_HOLD || tmpdir(), `nc-d375-pristine-${process.pid}`);
const sha = (b) => createHash("sha256").update(b).digest("hex");
const IDX = join(ROOT, "src/index.mjs");
const AIRUN = join(ROOT, "src/airun.mjs");

const K1 = "K1: THE COUNT IS PERSISTED AT ACQUIRE";
const K2 = "K2: A SCAN READ TO NOTHING WRITES LOOKED_ABSENT";
const K3 = "K3: AN UNREAD SCAN DOES NOT";
const K4 = "K4: and the scan OCR read is PRESENT";
const K5 = "K5: and a scan whose one region fell BELOW the floor";
const B8 = "B8: `found: false` with text READ is PRESENT";
const B8B = "B8b: a SCAN READ TO NOTHING";
const B8C = "B8c: AN UNREAD SCAN IS NOT ABSENT";
const B8H = "B8h: INK NOBODY COULD READ IS NOT NO TEXT";
const B8I = "B8i: and the row-4 branch is reached when the reader DECLINED";
const ACQ_SITE = "      { const n = textCountsOf(classifiedText); if (n) Object.assign(reading, n); }\n";
const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: [K1, K2, K3, K4, K5, B8, B8B, B8C, B8H, B8I] },
  nocount: {
    patches: [[IDX, ACQ_SITE, ""]],
    mustFail: [K1, K2, K5],
    mustPass: [K3, K4, B8, B8B, B8C, B8H, B8I],
  },
  noresidue: {
    patches: [[AIRUN, "      const absent = last && ranTier3 && !shortfall && reading.text_undetermined === 0;",
                      "      const absent = last && ranTier3 && !shortfall;"]],
    mustFail: [K5, B8H],
    mustPass: [K2, K3, K4, B8B, B8C],
  },
  noshortfall: {
    patches: [[AIRUN, "      const absent = last && ranTier3 && !shortfall && reading.text_undetermined === 0;",
                      "      const absent = last && ranTier3 && reading.text_undetermined === 0;"]],
    mustFail: [B8C],
    mustPass: [K2, K3, K5, B8B, B8H],
  },
  afterrow3: {
    patches: [[AIRUN, "  if (empty === true) {", "  if (empty === true && reading.read_from_text === true) {"]],
    mustFail: [K2, B8I],
    mustPass: [K3, K4, K5, B8B, B8C],
  },
  charsonly: {
    patches: [[IDX, "    text_glyphs: typeof text.document === \"string\" ? glyphCount(text.document) : null,\n", ""]],
    mustFail: [K1],
    mustPass: [K2, K3, K4, K5, B8B, B8C, B8H, B8I],
    note: "OVER-STRICTNESS: the judgement must survive a reading that carries only the producer's count",
  },
};

function runSuite() {
  const r = spawnSync(process.execPath, ["test/observation-content.test.mjs"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20 });
  const out = (r.stdout || "") + (r.stderr || "");
  const foot = out.match(/^observation-content: (-?\d+) pass, (\d+) fail\s*$/m);
  const fails = [...out.matchAll(/^\s+FAIL\s+(.*)$/gm)].map((m) => m[1]);
  const passes = [...out.matchAll(/^\s+PASS\s+(.*)$/gm)].map((m) => m[1]);
  const reached = !!foot && +foot[1] >= 0;
  return { pass: reached ? +foot[1] : -1, fail: reached ? +foot[2] : -1, fails, passes, foot: reached, exit: r.status };
}

const only = process.argv[2];
const order = only ? ["baseline", only] : Object.keys(ARMS);
if (only && !ARMS[only]) { console.error(`unknown arm ${only}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
mkdirSync(HOLD, { recursive: true });
const report = [];
let wrong = 0;
for (const name of order) {
  const arm = ARMS[name];
  const files = [...new Set(arm.patches.map((p) => p[0]))];
  const kept = files.map((f) => {
    const copy = join(HOLD, `${name}.${f.split("/").pop()}.pristine`);
    copyFileSync(f, copy);
    return { f, copy, digest: sha(readFileSync(f)), bytes: statSync(f).size };
  });
  let armed = true;
  for (const [f, from, to] of arm.patches) {
    const src = readFileSync(f, "utf8");
    const n = src.split(from).length - 1;
    if (n !== 1) { armed = false; console.log(`  arm ${name}: patch matched ${n} times in ${f} — NOT ARMED`); break; }
    writeFileSync(f, src.replace(from, to));
  }
  const res = armed ? runSuite() : null;
  /* RESTORE, and it is only believed when measured. */
  for (const k of kept) {
    copyFileSync(k.copy, k.f);
    const back = readFileSync(k.f), orig = readFileSync(k.copy);
    const same = sha(back) === k.digest && Buffer.compare(back, orig) === 0 && back.length === k.bytes;
    console.log(`  restore ${k.f.split("/").slice(-2).join("/")}: ${back.length} B sha256 ${sha(back).slice(0, 12)}… `
              + `restored byte-identically: ${same ? "YES" : "NO"}`);
    if (!same || back.length < 50000) { console.error("RESTORE FAILED — stop and repair by hand"); process.exit(3); }
    rmSync(k.copy);
  }
  if (!res) { report.push(`${name}: NOT ARMED`); wrong++; continue; }
  const failedAll = (label) => res.fails.some((f) => f.includes(label));
  const passedAll = (label) => res.passes.some((p) => p.includes(label));
  const missFail = arm.mustFail.filter((l) => !failedAll(l));
  const missPass = arm.mustPass.filter((l) => !passedAll(l));
  const asDeclared = res.foot && missFail.length === 0 && missPass.length === 0
                   && (name === "baseline" ? res.fail === 0 : res.fail > 0);
  if (!asDeclared) wrong++;
  const line = `${name}: ${res.pass}/${res.fail}${res.foot ? "" : " (NO FOOT)"} — ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`
             + (missFail.length ? ` · did NOT fail: ${missFail.join(" | ")}` : "")
             + (missPass.length ? ` · did NOT pass: ${missPass.join(" | ")}` : "");
  console.log(line);
  if (res.fails.length && name !== "baseline") console.log(`    failed: ${res.fails.join(" | ")}`);
  report.push(line);
}
rmSync(HOLD, { recursive: true, force: true });
console.log(`\nnc-d375: ${order.length} arm(s) run, ${wrong} not as declared\n  ${report.join("\n  ")}`);
process.exit(wrong ? 1 : 0);
