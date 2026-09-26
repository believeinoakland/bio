/* conclude-project-arm.control.mjs — the NEGATIVE CONTROL for `test/conclude-project-arm.test.mjs`
 * (REC-142). NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/conclude-project-arm.control.mjs            every arm
 *   node test/conclude-project-arm.control.mjs <arm>      one arm
 *
 * HOW IT ARMS, and why it never edits a real source — `project-authority.control.mjs`'s method
 * exactly. Each arm copies `src/` and `checks/` into a uniquely-named temporary tree, applies ONE
 * patch there (asserting its anchor occurs EXACTLY ONCE — an arm that did not arm is a finding, not
 * a pass), and runs the suite with CONCLUDE_ARM_SRC pointed at the copy. The real
 * `src/affordances.mjs`, `src/store.mjs` and `checks/bio-checks.mjs` are hashed (sha256 and byte
 * length) before the first arm and after the last, and the run fails loudly if any moved.
 *
 * EACH ARM BREAKS ONE THING. DECLARED BEFORE ARMING — what MUST fail (by label fragment); every
 * other assertion MUST stay green. The declarations are repeated in the suite's header.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "conclude-project-arm.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/affordances.mjs", "src/store.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const NOT_OFFERED = ["NOT OFFERED: vera", "NOT OFFERED: olga", "NOT OFFERED: ruth", "NOT OFFERED: the ADMIN"];
const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* (a) THE ROW'S CONTROL: the project arm removed — `conclude` keyed on the edge table alone. */
  "no-project-arm": {
    patches: [["src/affordances.mjs",
               "applies: (f, ty) => ty === \"inquiry\" && (edgesFrom(f).includes(\"concluded\")\n"
               + "                     || (f.current_state === \"concluded\" && f.concludes_for_project === true)) },",
               "applies: (f, ty) => ty === \"inquiry\" && edgesFrom(f).includes(\"concluded\") },"]],
    mustFail: ["OFFERED: iris (an OWNER", "OFFERED: iris — and it is conclude's own entry", "OFFERED: jonah"],
  },

  /* (b) THE LIAR: a `concluded -> concluded` edge in the catalog's inquiry machine. */
  "liar-edge": {
    patches: [["checks/bio-checks.mjs", "      concluded: ['open', 'surfaced', 'deferred', 'dismissed', 'divided'],",
               "      concluded: ['open', 'surfaced', 'deferred', 'dismissed', 'divided', 'concluded'],"]],
    mustFail: [...NOT_OFFERED, "CANNOT conclude twice", "and nothing was written by the second", "NO concluded -> concluded edge"],
  },

  /* (c) the project arm keyed on the STATE alone, the positional fact ignored. */
  "fact-unnarrowed": {
    patches: [["src/affordances.mjs", "(f.current_state === \"concluded\" && f.concludes_for_project === true)",
               "(f.current_state === \"concluded\")"]],
    mustFail: NOT_OFFERED,
  },

  /* (d) OVER-STRICTNESS: the fact asks OWNERSHIP instead of joined participation. */
  "owners-only": {
    patches: [["src/store.mjs", "if (this.#inSight(pid, viewer) && this.#isJoinedParticipant(pid, memberId)) return true;",
               "if (this.#inSight(pid, viewer) && this.#isProjectOwner(pid, memberId)) return true;"]],
    mustFail: ["OFFERED: jonah"],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `conclude-project-arm-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    cpSync(join(REPO, "jurisdictions"), join(tree, "jurisdictions"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", file);
      const s = readFileSync(p, "utf8");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.replace(from, to));
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, CONCLUDE_ARM_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /conclude-project-arm: (\d+) passed, (\d+) failed/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
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
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected)}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
if (!untouched) bad++;
process.exit(bad ? 1 : 0);
