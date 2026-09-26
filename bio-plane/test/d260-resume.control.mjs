/* d260-resume.control.mjs — the NEGATIVE CONTROL for `test/d260-resume.test.mjs` (D-260).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `bio-plane/src/` and `agent-worker/src/` while it runs,
 * and the battery must not discover it. Run from `bio-plane/`: `node test/d260-resume.control.mjs [arm]`.
 *
 * Every arm patches a COPY (asserting its anchor occurs EXACTLY ONCE, or the arm reports it did not arm), runs the
 * suite against the copy, and compares the failing assertions with what was DECLARED before arming: missing and
 * unexpected failures are both printed. The REAL sources are hashed before and after (sha256, and compared by
 * content), so a control that touched them says so — the "restore" of this design is that the real file is never
 * the one armed, and the digest pair is its verification.
 *
 * THE ROW'S CONTROL is `dispatch-every`: the gate hands EVERY woken run to agent-worker whenever the instance
 * credential resolves — the liar the row names, who leans on REC-152 to refuse the member's run downstream. The
 * member arms must fail BY NAME, because they count calls at the binding rather than read a tick's outcome.
 *
 * RESULTS, RUN 2026-09-23 by the D-260 worker (cloud session WORKER D-260 (CONDUCT #18)) on base b0962be0 +
 * this item, every arm AS DECLARED: baseline 22/0 · dispatch-every 15/7 · member-prefix-only 18/4 · dispatch-none
 * 15/7 · equal-by-compare 22/0; real sources untouched (sha256 AND content). TWO FINDINGS ABOUT THE INSTRUMENT,
 * recorded rather than smoothed: (a) the first run read agent-worker's answer as `ANSWERS[0]`, the first call of the
 * alarm, which under dispatch-every is a MEMBER run's refusal — answers are now paired with their own call; and the
 * tick's total `dispatched` count was split out of INSTANCE ARM 3 into COUNT ARM, because a count over the tick is a
 * different fact from the instance run's own dispatch. (b) member-prefix-only's first declaration is corrected at
 * the arm below: the arm was right and the declaration wrong.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "d260-resume.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["bio-plane/src/store.mjs", "bio-plane/src/tokens.mjs", "bio-plane/src/index.mjs",
              "agent-worker/src/index.mjs"].map((f) => join(REPO, f));
const before = REAL.map(digest);
const bytesBefore = REAL.map((p) => readFileSync(p));

const GATE = "    if (resumer && resumer.ready && principal === resumer.stamp)\n";
const ARMS = {
  baseline: { patches: [], mustFail: [] },
  /* THE ROW'S CONTROL: dispatch every woken run. */
  "dispatch-every": {
    patches: [["bio-plane/src/store.mjs", GATE, "    if (resumer && resumer.ready)\n"]],
    mustFail: ["MEMBER ARM 1", "MEMBER ARM 2", "OTHER-KEY ARM", "…and the tick's answer names", "MEMBER ARM 3",
               "…and no withheld run's log", "COUNT ARM"],
  },
  /* A FENCE LOOSER THAN THE RULE, and the subtler liar: withhold only MEMBER runs, so any organisation key's run is
     resumed under the instance's key. The member arms stay green — which is why OTHER-KEY exists.
     DECLARATION CORRECTED after its first run (2026-09-23), and the arm was right: it was first declared to fail
     "…and no withheld run's log" too, and that assertion stayed GREEN. Measured: the other key's run IS handed to
     agent-worker, which answers `ok: true`, and every tick it attempts under the instance's key is refused by
     REC-152 (C-22.12) — so NOTHING lands in the run's log. That is the row's liar exactly: the record reads clean
     while the group's key was handed another principal's run, and only the count at the binding (OTHER-KEY ARM)
     sees it. Recorded rather than smoothed, because it is the measurement that justifies counting calls. */
  "member-prefix-only": {
    patches: [["bio-plane/src/store.mjs", GATE,
               "    if (resumer && resumer.ready && !principal.startsWith(\"member:\"))\n"]],
    mustFail: ["OTHER-KEY ARM", "…and the tick's answer names", "MEMBER ARM 3", "COUNT ARM"],
  },
  /* THE OPPOSITE DEFECT: resume nothing. The instance arms must fail; every member arm must stay green, which is
     what shows the member arms are not satisfied merely by an absent caller. */
  "dispatch-none": {
    patches: [["bio-plane/src/store.mjs", GATE, "    if (false && resumer && resumer.ready && principal === resumer.stamp)\n"]],
    mustFail: ["INSTANCE ARM 1", "INSTANCE ARM 2", "INSTANCE ARM 3", "INSTANCE ARM 4", "COUNT ARM",
               "REFUSED-DISPATCH ARM", "…and the run's own log's LAST entry"],
  },
  /* OVER-STRICTNESS: the same equality in a spelling the suite did not anticipate. Nothing may fail. */
  "equal-by-compare": {
    patches: [["bio-plane/src/store.mjs", GATE,
               "    if (resumer && resumer.ready && principal.localeCompare(resumer.stamp) === 0)\n"]],
    mustFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d260-resume-${name}-`));
  try {
    const tree = join(root, "tree");
    for (const d of ["bio-plane/src", "bio-plane/checks", "agent-worker/src", "docprofile", "jurisdictions"])
      cpSync(join(REPO, d), join(tree, d), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, file);
      const s = readFileSync(p, "utf8");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.replace(from, () => to));
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, D260_TREE: tree },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /d260-resume: (\d+) pass, (\d+) fail/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             exit: r.status, asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
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
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected)}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]) && REAL.every((p, i) => readFileSync(p).equals(bytesBefore[i]));
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-2).join("/")} ${after[i]}`).join(" · ")} — `
  + `untouched (sha256 AND content): ${untouched ? "YES" : "NO"}`);
process.exit(bad || !untouched ? 1 : 0);
