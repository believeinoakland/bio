/* m0193-surfacing-fixture.control.mjs — the NEGATIVE CONTROL for `test/m0193-surfacing-fixture.test.mjs` (M0-193).
 *
 * Deliberately NOT a `.test.mjs`: it runs the suite against ARMED COPIES of `test/surfacing-run.mjs`, and the battery
 * must not discover it. Run from `bio-plane/`: `node test/m0193-surfacing-fixture.control.mjs [arm]`. The shape is
 * `m0187-surfacing-fixture.control.mjs`'s: every arm patches a COPY in a fresh temporary directory, asserting its
 * anchor occurs EXACTLY ONCE (or the arm reports that it did not arm), runs the real suite against the copy, and
 * compares the failing arms with what was DECLARED before arming. The real fixture is hashed before and after.
 *
 * RESULTS: recorded on the suite's `NEGATIVE CONTROL:` line.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const SUITE = join(PLANE, "test", "m0193-surfacing-fixture.test.mjs");
const REAL_FIXTURE = join(PLANE, "test", "surfacing-run.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const before = digest(REAL_FIXTURE);

/* THE SUBJECT, both halves. */
const KEY = "      base: null, snapKey: `${now.replace(/[-:]/g, \"\")}_5171f1a0_${nth}`,";
const KEY_NO_NTH = "      base: null, snapKey: `${now.replace(/[-:]/g, \"\")}_5171f1a0`,";
const KEY_UUID = "      base: null, snapKey: `${now.replace(/[-:]/g, \"\")}_${crypto.randomUUID().slice(0, 8)}`,";
const CLEAR = "      if (said && said.ok === true) runs.clear();";
const CLEAR_ANY = "      runs.clear();";
const CLEAR_NEVER = "      void said;";
const CLEAR_STATUS = "      if (answer.status < 400 && said && said.ok !== false) runs.clear();";
const READ = "      try { said = await answer.clone().json(); } catch { said = null; }";
const READ_CONSUMING = "      try { said = await answer.json(); } catch { said = null; }";

const F2 = "ARM 1 (F2)", F3 = ["ARM 2 (no confirm) (F3)", "ARM 2 (wrong confirm) (F3)", "ARM 2 (member class) (F3)"];
const A3 = ["ARM 3 (no confirm)", "ARM 3 (wrong confirm)", "ARM 3 (member class)"];

const ARMS = {
  baseline: { patches: [], mustFail: [] },
  /* THE ROW'S CONTROL, each half ALONE. */
  "no-nth": { patches: [[KEY, KEY_NO_NTH]], mustFail: [F2] },
  "clear-on-attempt": { patches: [[CLEAR, CLEAR_ANY]], mustFail: F3 },
  /* THE TREE AS IT STOOD: both halves back — the REPRODUCTION of the two defects. */
  "as-it-stood": { patches: [[KEY, KEY_NO_NTH], [CLEAR, CLEAR_ANY]], mustFail: [F2, ...F3] },
  /* THE LIARS the suite's header names. */
  "never-clear": { patches: [[CLEAR, CLEAR_NEVER]], mustFail: ["ARM 4:"] },
  /* The wrapper still reads `ok:true` and clears, so ARM 4's FRESH-run line stands; only what the CALLER reads falls
     (first declared with ARM 4's second line too, and it passed: the declaration was wrong, not the suite). */
  "consume-body": { patches: [[READ, READ_CONSUMING]], mustFail: [...A3, "ARM 4 FIXTURE"] },
  /* OVER-STRICTNESS: correct work in spellings this item did not write. Nothing may fail. */
  "key-by-uuid": { patches: [[KEY, KEY_UUID]], mustFail: [] },
  "clear-on-status": { patches: [[CLEAR, CLEAR_STATUS]], mustFail: [] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `m0193-${name}-`));
  try {
    /* The copy sits where `import "../checks/bio-checks.mjs"` resolves: a `test/` beside a copied `checks/`. */
    cpSync(join(PLANE, "checks"), join(root, "checks"), { recursive: true });
    const p = join(root, "test", "surfacing-run.mjs");
    cpSync(REAL_FIXTURE, p);
    for (const [from, to] of arm.patches) {
      const s = readFileSync(p, "utf8");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.split(from).join(to), "utf8");
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, M0193_FIXTURE: p },
      encoding: "utf8", maxBuffer: 64 << 20 });
    const out = (r.stdout || "") + (r.stderr || "");
    const tally = /m0193-surfacing-fixture: (\d+) pass, (\d+) fail/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const suiteError = /SUITE ERROR/.test(out);
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.startsWith(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.startsWith(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             suiteError, asDeclared: !!tally && !suiteError && !missing.length && !unexpected.length };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const want = process.argv[2];
if (want && !ARMS[want]) { console.error(`unknown arm ${want}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
let bad = 0;
for (const n of want ? [want] : Object.keys(ARMS)) {
  const r = run(n);
  if (!r.armed) { console.log(`  ARM DID NOT ARM  ${n}: ${r.why}`); bad++; continue; }
  console.log(`  ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}  ${n}  pass/fail ${r.tally}`
    + (r.suiteError ? "\n      SUITE ERROR in the run" : "")
    + (r.missing.length ? `\n      declared to fail but passed: ${JSON.stringify(r.missing)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected.map((u) => u.slice(0, 60)))}` : ""));
  if (!r.asDeclared) bad++;
}
const after = digest(REAL_FIXTURE);
console.log(`\nreal test/surfacing-run.mjs: ${after} — untouched: ${before === after ? "YES" : "NO"}`);
process.exit(bad || before !== after ? 1 : 0);
