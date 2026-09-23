/* rec172-bounds.control.mjs — the NEGATIVE CONTROL for `test/rec172-bounds.test.mjs`
 * (REC-172, INVESTIGATIVE-SESSION.md §14b.6).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `src/` while it runs, and the battery must not discover it.
 * Run from `bio-plane/`: `node test/rec172-bounds.control.mjs [arm]`. REC-169's driver's shape: every arm patches a
 * COPY of `src/` and `checks/` (and, for the vf4 arm, a copy of `test/vf4-live-scratch.mjs`) in a fresh temporary tree,
 * asserting each anchor occurs EXACTLY ONCE (or the arm reports it did not arm), runs the suite against the copy, and
 * compares the failing arms with what was DECLARED before arming — missing and unexpected failures are both printed.
 * The real sources are hashed (byte count and sha256) before and after, so a control that touched them says so;
 * nothing is ever restored because nothing real is ever edited. Each arm breaks ONE thing.
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
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "rec172-bounds.test.mjs");
const VF4 = join(PLANE, "test", "vf4-live-scratch.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/airun.mjs", "checks/bio-checks.mjs", "test/vf4-live-scratch.mjs"]
  .map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* THE ANCHORS, each occurring once. */
const UNKNOWN = '      return refusal("AI_RUN_BOUND_UNKNOWN",\n        `\'${b === ""';
const UNKNOWN_CONTINUE = '      continue; void refusal("AI_RUN_BOUND_UNKNOWN",\n        `\'${b === ""';
const NOT_A_MAP = '    if (typeof entries !== "object" || Array.isArray(entries))\n      return refusal(';
const NOT_A_MAP_IGNORED = '    if (typeof entries !== "object" || Array.isArray(entries))\n      return null; void refusal(';
const DECIDED = "    if (PLANE_DECIDED_BOUNDS.includes(b))\n";
const OFF = "    if (false)\n";
const ALLOWANCE = '    return checkConsume(entries.map((e) => [e.bound == null ? "" : String(e.bound), e.allowed]),\n'
                + "                        { seed: true, allowance: true })\n        || ";
const ALLOWANCE_OFF = "    return null || ";
const ALLOWED_WRITE = "b.allowed == null ? 0 : b.allowed,";
const ALLOWED_COERCED = "Number(b.allowed) || 0,";
const NOT_A_LIST = "    if (!Array.isArray(entries))\n      return refusal(";
const NOT_A_LIST_IGNORED = "    if (!Array.isArray(entries))\n      return null; void refusal(";
const OWN = "    if (!Object.prototype.hasOwnProperty.call(RUN_BOUNDS, b))\n      return refusal(\"AI_RUN_BOUND_UNKNOWN\"";
const OWN_RESPELT = "    if (!Object.keys(RUN_BOUNDS).includes(b))\n      return refusal(\"AI_RUN_BOUND_UNKNOWN\"";
const VF4_MAP = "consume: { fetches: 1 } } });";
const VF4_ARRAY = 'consume: [{ bound: "fetches", amount: 1 }] } });';

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: restore the `continue` on an unknown key (REC-169's code, byte for byte in effect). The tick
     accepts `{ fetchs: 1 }` and spends nothing (K1), spends the good half of a mixed map (K2 — the ignorer's tell),
     and the open drops a misspelt bound and an entry naming none (U1, U4). An ARRAY is still refused: that is the map
     check's, a separate door (ARM A stays green, and that is declared). */
  "restore-continue": {
    patches: [["src/airun.mjs", UNKNOWN, UNKNOWN_CONTINUE]],
    mustFail: ["ARM K1 ", "ARM K1b:", "ARM K2 ", "ARM K3:", "ARM K4 ", "ARM U1 ", "ARM U4 "],
  },

  /* THE LIAR: IGNORE a `consume` that is not a map rather than refuse it — the tick answers `ticked: true` and spends
     nothing, which is exactly what the plane did for vf4's array. Every "nothing moved" assertion about the BUDGET
     would pass; what fails is every arm asking for the refusal BY NAME, and the witness (the tick counted and the log
     grew under a tick the caller was told succeeded). */
  "liar-ignore-array": {
    patches: [["src/airun.mjs", NOT_A_MAP, NOT_A_MAP_IGNORED]],
    mustFail: ["ARM A1 ", "ARM A2 ", "ARM A3 ", "ARM A4 ", "ARM A5 ", "ARM A6 ", "ARM A7:"],
  },

  /* `lease` spendable again: a caller's figure for it is written into the run's budget, zero included, and a member
     may declare it at the open. */
  "lease-spendable": {
    patches: [["src/airun.mjs", DECIDED, OFF]],
    mustFail: ["ARM L1:", "ARM L2:", "ARM L3:", "ARM L4 ", "ARM L5:"],
  },

  /* THE PRE-ITEM ALLOWANCE: the shape check dropped AND the store's coercion `Number(b.allowed) || 0` restored. A
     negative, fractional, numeric-string, non-finite or boolean allowance opens a run. */
  "allowance-coerced": {
    patches: [["src/airun.mjs", ALLOWANCE, ALLOWANCE_OFF], ["src/store.mjs", ALLOWED_WRITE, ALLOWED_COERCED]],
    mustFail: ["ARM W1 ", "ARM W2 ", "ARM W3 ", "ARM W4 ", "ARM W5 ", "ARM W6 ", "ARM W7:"],
  },

  /* The open's list check ignored: a MAP `bounds` opens a run with no bounds at all. */
  "bounds-map-ignored": {
    patches: [["src/airun.mjs", NOT_A_LIST, NOT_A_LIST_IGNORED]],
    mustFail: ["ARM U2 "],
  },

  /* vf4 sends its array again: ARM V's reach still finds the literal (V0 green) and the tick is refused (V1). */
  "vf4-array": {
    patches: [["vf4", VF4_MAP, VF4_ARRAY]],
    mustFail: ["ARM V1:"],
  },

  /* OVER-STRICTNESS: the same membership rule in a spelling the suite did not anticipate. Nothing may fail. */
  overstrict: { patches: [["src/airun.mjs", OWN, OWN_RESPELT]], mustFail: [] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `rec172-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    const vf4 = join(root, "vf4-live-scratch.mjs");
    cpSync(VF4, vf4);
    for (const [file, from, to] of arm.patches) {
      const p = file === "vf4" ? vf4 : join(tree, "bio-plane", file);
      const s = readFileSync(p, "latin1");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.split(from).join(to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], {
      env: { ...process.env, REC172_SRC: join(tree, "bio-plane", "src"), REC172_VF4: vf4 },
      encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /rec172-bounds: (\d+) pass, (\d+) fail/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    /* NC_VERBOSE=1 prints every FAIL with its want/got, so a surprising arm is read rather than guessed at. */
    if (process.env.NC_VERBOSE) console.log(out.split("\n").filter((l, i, a) => /^\s+FAIL\s/.test(l)
      || /^\s+FAIL\s/.test(a[i - 1] ?? "") || /^\s+FAIL\s/.test(a[i - 2] ?? "")).join("\n"));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm ${want}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
let bad = 0;
for (const n of names) {
  const r = run(n);
  if (!r.armed) { console.log(`  ARM DID NOT ARM  ${n}: ${r.why}`); bad++; continue; }
  console.log(`  ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}  ${n}  pass/fail ${r.tally}`
    + (r.missing.length ? `\n      declared to fail but passed: ${JSON.stringify(r.missing)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected.map((u) => u.slice(0, 60)))}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
process.exit(bad || !untouched ? 1 : 0);
