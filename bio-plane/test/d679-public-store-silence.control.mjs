/* d679-public-store-silence.control.mjs — the NEGATIVE CONTROL for `test/d679-public-store-silence.test.mjs` (D-679:
 * the four credential-free doors answer a store failure as a failure, never at HTTP 200). NOT a `.test.mjs`: the
 * battery must not discover it.
 *
 *   node test/d679-public-store-silence.control.mjs            every arm
 *   node test/d679-public-store-silence.control.mjs <arm>      one arm
 *
 * `d629-internal-error.control.mjs`'s method exactly: each arm copies `src/` and `checks/` (and `docprofile/`) into a
 * uniquely-named temporary tree, applies its patch THERE (each anchor must occur EXACTLY ONCE — an arm that did not arm
 * is a finding, not a pass), and runs the suite with D679_SRC pointed at the copy. The real sources are hashed before
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
const SUITE = join(PLANE, "test", "d679-public-store-silence.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* Anchors, each quoted verbatim from the subject: a door's D-679 read, and the pre-D-679 read it replaced. */
const DOOR = {
  claim: ["        const out = await doAnswer(stub.fetch(new Request(`http://do/claim?fp=${fp}`, {\n"
          + "          method: \"POST\", body: JSON.stringify({ role: \"admin\", password: body.password }) })));\n"
          + "        if (!out.answered) return storeSilent(\"claim\");\n"
          + "        return json({ ok: true, result: out.result }, 200);",
          "        const r = await stub.fetch(new Request(`http://do/claim?fp=${fp}`, {\n"
          + "          method: \"POST\", body: JSON.stringify({ role: \"admin\", password: body.password }) }));\n"
          + "        return json(await r.json(), 200);"],
  login: ["        const out = await doAnswer(stub.fetch(new Request(\"http://do/login\", {\n"
          + "          method: \"POST\", body: JSON.stringify({ role: body.role || \"admin\", password: body.password }) })));\n"
          + "        if (!out.answered) return storeSilent(\"login\");\n"
          + "        return json({ ok: true, result: out.result }, 200);",
          "        const r = await stub.fetch(new Request(\"http://do/login\", {\n"
          + "          method: \"POST\", body: JSON.stringify({ role: body.role || \"admin\", password: body.password }) }));\n"
          + "        return json(await r.json(), 200);"],
};
for (const op of ["invitelook", "enroll"])
  DOOR[op] = [`        const out = await doAnswer(invStub.fetch(new Request("http://do/${op}", {\n`
              + "          method: \"POST\", body: JSON.stringify(body) })));\n"
              + `        if (!out.answered) return storeSilent("${op}");\n`
              + "        return json({ ok: true, result: out.result }, 200);",
              `        const r = await invStub.fetch(new Request("http://do/${op}", {\n`
              + "          method: \"POST\", body: JSON.stringify(body) }));\n"
              + "        return json(await r.json(), 200);"];
const N = { claim: 1, login: 2, invitelook: 3, enroll: 4 };
const bare = (op) => ["index.mjs", DOOR[op][0], DOOR[op][1]];

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL, ONE DOOR AT A TIME: that door's read restored to `json(await r.json(), 200)`. Its throw arm and
     its not-JSON arm fail; the other three doors, every answer arm and the baseline stay green. */
  ...Object.fromEntries(Object.keys(DOOR).map((op) => [`${op}-bare`,
    { patches: [bare(op)], mustFail: [`S${N[op]}:`, `G${N[op]}:`] }])),

  /* THE DEFECT AS IT STOOD — all four doors restored together, which is the source at land/worker/D-629 @ 5e202b33
     for these lines: the reproduction through the op, run on the same instrument. */
  "pre-d679": { patches: Object.keys(DOOR).map(bare),
                mustFail: ["S1:", "S2:", "S3:", "S4:", "G1:", "G2:", "G3:", "G4:"] },

  /* THE OTHER DIRECTION: a refusal the store RETURNED read as a silence. Only the refusal-answer arm may fail. */
  "refusal-as-silence": {
    patches: [["index.mjs", "        if (!out.answered) return storeSilent(\"login\");",
               "        if (!out.answered || out.result?.ok === false) return storeSilent(\"login\");"]],
    mustFail: ["A2:"],
  },

  /* THE SUITE'S OWN OVER-STRICTNESS: login's answer built by another spelling with the same bytes on the wire. */
  "over-strict": {
    patches: [["index.mjs", "        if (!out.answered) return storeSilent(\"login\");\n        return json({ ok: true, result: out.result }, 200);",
               "        if (out.answered !== true) return storeSilent(String(\"login\"));\n"
               + "        const answer = {}; answer.ok = true; answer.result = out.result; return json(answer, 200);"]],
    mustFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d679-control-${name}-`));
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
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, D679_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /d679-public-store-silence: (\d+) passed, (\d+) failed/.exec(out);
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
