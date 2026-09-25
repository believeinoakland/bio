/* d629-internal-error.control.mjs — the NEGATIVE CONTROL for `test/d629-internal-error.test.mjs` (D-629: an op that
 * throws answers a named internal-error code, never its stack). NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/d629-internal-error.control.mjs            every arm
 *   node test/d629-internal-error.control.mjs <arm>      one arm
 *
 * `group-public.control.mjs`'s method exactly: each arm copies `src/` and `checks/` (and `docprofile/`) into a
 * uniquely-named temporary tree, applies its patch THERE (each anchor must occur EXACTLY ONCE — an arm that did not arm
 * is a finding, not a pass), and runs the suite with D629_SRC pointed at the copy. The real sources are hashed before
 * the first arm and after the last; the run fails if any moved. What each arm MUST fail (by label prefix) is DECLARED
 * below before it arms; every other assertion MUST stay green.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "d629-internal-error.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* Anchors, each quoted verbatim from the subject. */
const STORE_CATCH = "      return Response.json(storeInternalError(e, op), { status: 500 });";
const PLANE_CATCH = "    try { return await PLANE.fetch(req, env); }\n    catch (e) { return planeInternalError(e, req); }";
const STORE_ENVELOPE = "  return { ok: false, error: \"internal error\", reason: \"STORE_INTERNAL_ERROR\", code: \"STORE_INTERNAL_ERROR\",\n"
  + "           check: row.check, translation: row.translation, correlation };";
const STORE_LOG = "    console.error(JSON.stringify({ event: answer.reason, correlation, op: String(op || \"\"),\n"
  + "                                   stack: String(e && e.stack || e) }));";

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL — THE STACK RETURNED: the store's catch as it stood on origin/main before D-629. The member and
     public no-stack arms fail, and so do the log arms, because the stack is answered instead of logged. */
  "store-stack-back": {
    patches: [["store.mjs", STORE_CATCH, "      return Response.json({ ok: false, error: String(e && e.stack || e) }, { status: 500 });"]],
    mustFail: ["M1:", "M2:", "U1:", "U2:", "L1:", "L3:"],
  },

  /* THE CONTROL PLANE'S CATCH REMOVED: a throw in `PLANE.fetch` reaches the runtime uncaught again. */
  "plane-catch-removed": {
    patches: [["index.mjs", PLANE_CATCH, "    return PLANE.fetch(req, env);"]],
    mustFail: ["P1:", "P2:", "L2:", "L3:"],
  },

  /* THE SUITE'S OWN OVER-STRICTNESS: the same envelope with its keys in another order, and the log written as plain
     text with the stack on lines of its own rather than as JSON. Nothing may fail. */
  "over-strict": {
    patches: [["store.mjs", STORE_ENVELOPE,
               "  return { correlation, translation: row.translation, check: row.check, code: \"STORE_INTERNAL_ERROR\",\n"
               + "           reason: \"STORE_INTERNAL_ERROR\", error: \"internal error\", ok: false };"],
              ["store.mjs", STORE_LOG,
               "    console.error(answer.reason + \" \" + correlation + \" op=\" + String(op || \"\") + \"\\n\" + String(e && e.stack || e));"]],
    mustFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d629-control-${name}-`));
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
      writeFileSync(p, s.replace(from, () => to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, D629_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /d629-internal-error: (\d+) passed, (\d+) failed/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.startsWith(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.startsWith(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const wanted = process.argv[2];
const names = wanted ? [wanted] : Object.keys(ARMS);
if (wanted && !ARMS[wanted]) { console.error(`unknown arm ${wanted}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
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
