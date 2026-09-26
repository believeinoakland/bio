/* d86-bias-debt.control.mjs — the NEGATIVE CONTROL for `test/d86-bias-debt.test.mjs` (D-86, NOTIFICATIONS.md
 * §The catalogue, framework §13).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `src/` while it runs, and the battery must not discover it.
 * Run from `bio-plane/`: `node test/d86-bias-debt.control.mjs [arm]`. D-85's driver's shape: every arm patches a COPY
 * of `src/` and `checks/` in a fresh temporary tree, asserting each anchor occurs EXACTLY the declared number of
 * times (or the arm reports it did not arm), runs the suite against the copy, and compares what failed with what was
 * DECLARED before arming — a declared failure that passed, an undeclared failure, and a declared PASS that failed are
 * all printed. The real sources are hashed (byte count and sha256) before and after, so a control that touched them
 * says so; nothing real is ever edited, so nothing is ever restored. Each arm breaks ONE thing — except `liar+flip`,
 * whose whole point is the pair.
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
const SUITE = join(PLANE, "test", "d86-bias-debt.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/schema.mjs", "src/queuestate.mjs", "checks/bio-checks.mjs"]
  .map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* THE ANCHORS. */
const REG = "      { name: \"bias-debt\",\n"
  + "        due:  (now) => this.#biasDebtPending() ? now : null,\n"
  + "        wake: (now) => this.#biasDebtPending() ? now + this.#biasDebtDelayMs() : null,\n"
  + "        tick: (now) => this.#biasDebtSweep(now).then((b) => ({ biasdebt: b })) },\n";
const REG_OFF = "      /* the bias-debt registration removed by the control */\n";
/* aiRunRead's ONE comparison (`#biasForRun`), at its three sites — the recorded-open arm of each return. */
const CMP = "openSha !== nowSha";
const CMP_FLIP = "openSha === nowSha";
const CMP_NULL = "null";
/* The sweep's READ of that comparison. */
const READ = "      const moved = bias ? bias.moved : null;\n";
const READ_LIAR = "      const moved = bias ? (((bias.at_open && bias.at_open.statements_sha) ?? null)\n"
  + "        !== ((bias.now && bias.now.statements_sha) ?? null)) : null;\n";
const READ_SPELLING = "      const { moved = null } = bias || {};\n";
const OWNERS = "    if (session?.context?.type === \"project\")\n";
const OWNERS_OFF = "    if (false)\n";

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: ["ARM M1 ", "ARM A1 "] },

  /* THE ROW'S CONTROL: drop the sweep's registration. The moved-lens arm must fail BY NAME (M1), with every arm
     that rests on an item existing; the arms asserting an ABSENCE stay green, which is why they are not evidence. */
  "drop-registration": {
    patches: [["store.mjs", REG, REG_OFF, 1]],
    mustFail: ["ARM L1 ", "ARM M1 ", "ARM M2 ", "ARM M3 ", "ARM A1 ", "ARM I1:", "ARM R1 ", "ARM R2 ", "ARM C1:",
               "ARM C2:", "ARM B1 ", "ARM B2:"],
    mustPass: ["ARM M4 ", "ARM R3 ", "ARM R4 ", "ARM Z1 ", "ARM W1:"],
  },

  /* THE ONE FUNCTION CHANGED: aiRunRead's comparison inverted. The honest sweep FOLLOWS it — so ARM A1 (an item
     exactly where op=airun reads moved) stays GREEN while every fixed expectation goes red. */
  flip: {
    patches: [["store.mjs", CMP, CMP_FLIP, 3]],
    mustFail: ["ARM L1 ", "ARM M1 ", "ARM M2 ", "ARM M3 ", "ARM M4 ", "ARM I1:", "ARM R1 ", "ARM R2 ", "ARM D1:",
               "ARM C1:", "ARM C2:", "ARM B2:"],
    mustPass: ["ARM A1 "],
  },

  /* THE ONE FUNCTION MADE UNDETERMINED: `moved: null` everywhere a recorded open is compared. Nothing may be raised
     and nothing cleared — so ARM A1 and the absence arms stay green. This is the suite's only reach into
     `moved: null` (WHAT THIS SUITE CANNOT SEE, iii). */
  "moved-null": {
    patches: [["store.mjs", CMP, CMP_NULL, 3]],
    mustFail: ["ARM L1 ", "ARM M1 ", "ARM M2 ", "ARM M3 ", "ARM I1:", "ARM R1 ", "ARM R2 ", "ARM D1:", "ARM C1:",
               "ARM C2:", "ARM B2:"],
    mustPass: ["ARM A1 ", "ARM M4 "],
  },

  /* THE LIAR, ALONE: a second comparison in the sweep. It agrees with aiRunRead today, so NOTHING fails — declared
     so, and that is the finding that makes the next arm necessary. */
  liar: { patches: [["store.mjs", READ, READ_LIAR, 1]], mustFail: [], mustPass: ["ARM A1 ", "ARM M1 "] },

  /* THE LIAR, CAUGHT: the second comparison PLUS the one function changed. The items no longer follow op=airun, and
     ARM A1 fails BY NAME; the arms that read op=airun's own `moved` fail with it. */
  "liar+flip": {
    patches: [["store.mjs", READ, READ_LIAR, 1], ["store.mjs", CMP, CMP_FLIP, 3]],
    mustFail: ["ARM A1 ", "ARM L1 ", "ARM D1:", "ARM C1:"],
    mustPass: ["ARM M1 ", "ARM M2 "],
  },

  /* A FENCE TIGHTER THAN THE RULE: recipients narrowed to the principal alone. The project's owner is no longer
     told (R2); nothing else moves. */
  "owners-dropped": { patches: [["store.mjs", OWNERS, OWNERS_OFF, 1]], mustFail: ["ARM R2 "], mustPass: ["ARM R1 "] },

  /* OVER-STRICTNESS: the same read in a spelling the suite did not anticipate. Nothing may fail. */
  spelling: { patches: [["store.mjs", READ, READ_SPELLING, 1]], mustFail: [], mustPass: ["ARM A1 ", "ARM M1 "] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d86-${name.replace(/\W/g, "_")}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    cpSync(join(REPO, "jurisdictions"), join(tree, "jurisdictions"), { recursive: true });
    for (const [file, from, to, times] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "latin1");
      const n = s.split(from).length - 1;
      if (n !== times) return { name, armed: false, why: `anchor in ${file} occurs ${n} times, declared ${times}: ${from.slice(0, 70)}` };
      writeFileSync(p, s.split(from).join(to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, D86_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /d86-bias-debt: (\d+) pass, (\d+) fail/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const passed = out.split("\n").filter((l) => /^\s+PASS\s/.test(l)).map((l) => l.replace(/^\s+PASS\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    const notPassed = arm.mustPass.filter((m) => !passed.some((f) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected, notPassed,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 && notPassed.length === 0 };
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
    + (r.notPassed.length ? `\n      declared to pass but did not: ${JSON.stringify(r.notPassed)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected.map((u) => u.slice(0, 60)))}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
process.exit(bad || !untouched ? 1 : 0);
