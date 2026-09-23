/* REC-179's NEGATIVE CONTROL — deliberately NOT a `.test.mjs`: it patches COPIES of `src/` and `checks/` in a temp
 * directory and runs `rec179-surfaced-by.test.mjs` against each copy (`REC179_SRC`). The real sources are digested
 * before and after and must be untouched. Run from `bio-plane/`: `node test/rec179-surfaced-by.control.mjs [arm]`.
 *
 * Each arm is armed ALONE, and declares BEFORE it runs which assertions MUST fail (by the start of their label) —
 * every other assertion must pass. An arm whose anchor does not occur exactly once DID NOT ARM, and says so.
 *
 * RESULTS: recorded on the suite's first line (`rec179-surfaced-by.test.mjs`), by the run that produced them.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "rec179-surfaced-by.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const CMP = "        if (was !== now)\n          return refusal(\"SURFACED_BY_REWRITTEN\",";
const cmpWhen = (cond) => CMP.replace("if (was !== now)", `if (${cond})`);
const READS = "        const was = surfacedOf(heldMd ? heldMd.content : null);\n"
  + "        const now = surfacedOf(nextMd ? nextMd.text : null);\n";
/* A LINE SCAN: the FIRST `surfaced_by:` line's raw text, as D-78's creation restamp reads a document. */
const SCAN = "((x) => { const m = typeof x === \"string\" ? /\\nsurfaced_by:(.*)\\n/.exec(x) : null; return m ? m[1].trim() : \"absent\"; })";
const READS_SCAN = `        const was = ${SCAN}(heldMd ? heldMd.content : null);\n`
  + `        const now = ${SCAN}(nextMd ? nextMd.text : null);\n`;

const FLIPS = ["ARM F1 (", "ARM F1:", "ARM F2 (", "ARM F2:", "ARM F2b ", "ARM F2b:", "ARM F3 (", "ARM F3:",
               "ARM F4 (", "ARM F4:", "ARM F5 (", "ARM F5:", "ARM F6 "];

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: drop the comparison. Every flip lands, so every F arm fails BY NAME (its refusal and its
     byte-identity); every K arm, the fixture and the witness arms must stay green. */
  "drop-comparison": { patches: [["store.mjs", CMP, cmpWhen("false")]], mustFail: FLIPS },

  /* LIAR 1: refuse only agent -> human. The human -> agent arms and the DROP arm must fail by name. */
  "one-direction": { patches: [["store.mjs", CMP, cmpWhen("was === '\"agent\"' && now === '\"human\"'")]],
                     mustFail: ["ARM F2 (", "ARM F2:", "ARM F2b ", "ARM F2b:", "ARM F5 (", "ARM F5:"] },

  /* LIAR 2: compare by a LINE SCAN of the first `surfaced_by:` line instead of the catalog's parser. The second-line
     flip (F3) lands, and the quoted respelling (K2) is refused — both directions of a wrong reader. F1's value-naming
     assertion also moves (the scan returns raw text, not the parser's JSON), which is the reader changing, declared. */
  "line-scan": { patches: [["store.mjs", READS, READS_SCAN]],
                 mustFail: ["ARM F1:", "ARM F3 (", "ARM F3:", "ARM K2 "] },

  /* LIAR 3: exempt a revision that says `replay: true` — a caller's word on a revision. F4 must fail by name. */
  "exempt-replay": { patches: [["store.mjs", CMP, cmpWhen("was !== now && !pkg.replay")]], mustFail: ["ARM F4 (", "ARM F4:"] },

  /* LIAR 4: let a revision DROP the field (absent is not a value). F5 must fail by name. */
  "allow-drop": { patches: [["store.mjs", CMP, cmpWhen("was !== now && now !== \"absent\"")]], mustFail: ["ARM F5 (", "ARM F5:"] },

  /* OVER-STRICTNESS: the same rule in a spelling the suite did not anticipate. Nothing may fail. */
  "same-rule-respelt": { patches: [["store.mjs", CMP, cmpWhen("![was].includes(now)")]], mustFail: [] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `rec179-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "latin1");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.split(from).join(to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, REC179_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /rec179-surfaced-by: (\d+) pass, (\d+) fail/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.startsWith(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.startsWith(m)));
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
