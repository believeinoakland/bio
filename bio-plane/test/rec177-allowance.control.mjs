/* rec177-allowance.control.mjs — the NEGATIVE CONTROL for `test/rec177-allowance.test.mjs`
 * (REC-177, INVESTIGATIVE-SESSION.md §14b item 6, BOB #30).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `src/` while it runs, and the battery must not discover it.
 * Run from `bio-plane/`: `node test/rec177-allowance.control.mjs [arm]`. REC-172's driver's shape: every arm patches a
 * COPY of `src/` and `checks/` in a fresh temporary tree, asserting each anchor occurs EXACTLY ONCE (or the arm reports
 * it did not arm), runs the suite against the copy, and compares the failing arms with what was DECLARED before
 * arming — missing and unexpected failures are both printed. The real sources are hashed (byte count and sha256)
 * before and after, so a control that touched them says so; nothing is ever restored because nothing real is ever
 * edited. Each arm breaks ONE thing.
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
const SUITE = join(PLANE, "test", "rec177-allowance.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/airun.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* THE ANCHORS, each occurring once. */
const CHECK = "    if (allowance && (v == null || v === 0))\n";
const CHECK_OFF = "    if (false)\n";
const CHECK_ABSENT_ONLY = "    if (allowance && (v == null))\n";
const CHECK_RESPELT = "    if (allowance && (v === undefined || v === null || (typeof v === \"number\" && Math.abs(v) === 0)))\n";
const CHECK_TOO_WIDE = "    if (allowance && !(typeof v === \"number\" && v > 0))\n";
const STORE_WRITE = "b.allowed,    /* REC-177:";
const STORE_DEFAULT = "b.allowed == null ? 0 : b.allowed,    /* REC-177:";

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL — THE PRE-ITEM PLANE, byte for byte in effect: the check dropped AND the store's
     `absent is 0` default restored (dropping the check alone would bind `undefined` into the insert, a SECOND
     variable — a crash is not the pre-item behaviour). Both refusal families fail by name; the undeclared bound,
     the precedence and the over-strictness arms stay green. */
  "drop-check": {
    patches: [["src/airun.mjs", CHECK, CHECK_OFF], ["src/store.mjs", STORE_WRITE, STORE_DEFAULT]],
    mustFail: ["ARM A1 ", "ARM A2 ", "ARM A3 ", "ARM A4 ", "ARM A5 ", "ARM A6:",
               "ARM Z1 ", "ARM Z2 ", "ARM Z3 ", "ARM Z4 ", "ARM Z5:", "ARM M1:", "ARM M2:"],
  },

  /* THE LIAR: refuse only an ABSENT allowance and admit 0 — the brief's first way to pass. Every zero arm fails by
     name, and so does M2 (a zero before a good entry). */
  "liar-absent-only": {
    patches: [["src/airun.mjs", CHECK, CHECK_ABSENT_ONLY]],
    mustFail: ["ARM Z1 ", "ARM Z2 ", "ARM Z3 ", "ARM Z4 ", "ARM Z5:", "ARM M2:"],
  },

  /* A FENCE WIDER THAN ITS RULE: refuse every allowance that is not a positive number under THIS code. The same runs
     are refused — so every refusal arm stays green — but a numeric string and a negative are now told they stated no
     allowance, which is false: they stated one of the wrong form (C-22.13). Only the precedence arm can see it. */
  "too-wide": {
    patches: [["src/airun.mjs", CHECK, CHECK_TOO_WIDE]],
    mustFail: ["ARM P1-P4:"],
  },

  /* OVER-STRICTNESS: the same rule in a spelling the suite did not anticipate. Nothing may fail. */
  overstrict: { patches: [["src/airun.mjs", CHECK, CHECK_RESPELT]], mustFail: [] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `rec177-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    cpSync(join(REPO, "jurisdictions"), join(tree, "jurisdictions"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", file);
      const s = readFileSync(p, "latin1");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.split(from).join(to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], {
      env: { ...process.env, REC177_SRC: join(tree, "bio-plane", "src") },
      encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /rec177-allowance: (\d+) pass, (\d+) fail/.exec(out);
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
