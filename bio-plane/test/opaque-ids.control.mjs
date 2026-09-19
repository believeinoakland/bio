/* opaque-ids.control.mjs — the NEGATIVE CONTROL for `test/opaque-ids.test.mjs` (REC-151 / IC-164, Membership v2
 * §7 *"A MINTED ID CARRIES NO COUNT"*). NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/opaque-ids.control.mjs            every arm
 *   node test/opaque-ids.control.mjs <arm>      one arm
 *
 * `project-mint.control.mjs`'s method exactly: each arm copies `src/` (and `checks/`, `docprofile/`) into a
 * uniquely-named temporary tree, applies its patch THERE (asserting each anchor occurs EXACTLY ONCE — an arm that
 * did not arm is a finding, not a pass), and runs the suite with OPAQUE_IDS_SRC pointed at the copy. The real
 * `src/index.mjs` and `src/store.mjs` are hashed (sha256 and byte length) before the first arm and after the
 * last; the run fails if either moved. What each arm MUST fail (by label fragment) is DECLARED before it arms;
 * every other assertion MUST stay green.
 *
 * RESULTS: see the header of `test/opaque-ids.test.mjs` and IC-164.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "opaque-ids.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: the counter RESTORED for one prefix — a new case's id taken from allocId's CASE sequence
     again. CASE's count arms fail by name, and so do the two structural pins that see the site. DRAFT, RVG, TASK
     and PROJ stay green: one prefix broken, one prefix red. */
  "counter-restored-case": {
    patches: [["store.mjs", "      theCase = this.#mintOpaqueId(\"CASE\", new Date().toISOString().slice(0, 4), \"\", (id) =>",
               "      theCase = ((y, _t, _f) => this.allocId(\"CASE\", y).id)(new Date().toISOString().slice(0, 4), \"\", (id) =>"]],
    mustFail: ["CASE NO COUNT: the three ids are NOT the counter's answer", "CASE NO COUNT: two mints in a row",
               "NO gated prefix is minted from the counter anywhere", "the CASE mint calls the one minter"],
  },

  /* THE LIAR (a): Math.random in place of the CSPRNG. Every BEHAVIOURAL arm stays green — which is the point —
     and only the source-by-name arms can see it. */
  "math-random": {
    patches: [["store.mjs", "      for (;;) { crypto.getRandomValues(u); if (u[0] < 60000)",
               "      for (;;) { u[0] = Math.floor(Math.random() * 60000); if (u[0] < 60000)"]],
    mustFail: ["it draws from the CSPRNG BY NAME", "and from nothing weaker or counted"],
  },

  /* THE LIAR (b): a suffix DERIVED from the counter — the counter's value through a fixed permutation. Not +1,
     not 0001..0003, so every behavioural arm stays green; the minter now steps `#nextSeq`, and only the
     source pin names it. */
  "counter-derived": {
    patches: [["store.mjs", "      const id = `${prefix}-${year}-${draw()}${tail}`;",
               "      const id = `${prefix}-${year}-${String((Number(this.#nextSeq(prefix, year).id.split(\"-\").pop()) * 7919) % 10000).padStart(4, \"0\")}${tail}`;"]],
    mustFail: ["and from nothing weaker or counted"],
  },

  /* op=allocid's refusal removed: every gated counter readable again. The five refusal arms and the dash arm
     fail; the over-strictness arms stay green. */
  "allocid-open": {
    patches: [["store.mjs", "    if (gated) {\n      const row = PROJECT_ID_CHECKS.ALLOCID_PREFIX_GATED;",
               "    if (false) {\n      const row = PROJECT_ID_CHECKS.ALLOCID_PREFIX_GATED;"]],
    mustFail: ["op=allocid prefix=PROJ is REFUSED", "op=allocid prefix=CASE is REFUSED", "op=allocid prefix=DRAFT is REFUSED",
               "op=allocid prefix=RVG is REFUSED", "op=allocid prefix=TASK is REFUSED", "a gated scope reached another way"],
  },

  /* AN OVER-STRICT FENCE: a prefix gated if it merely BEGINS with a gated one's letters. The over-strictness arm
     must catch it. */
  "allocid-overstrict": {
    patches: [["store.mjs", "Store.GATED_ID_PREFIXES.find((g) => scope.startsWith(`${g}-`));",
               "Store.GATED_ID_PREFIXES.find((g) => scope.startsWith(g));"]],
    mustFail: ["OVER-STRICTNESS: a prefix that merely begins"],
  },

  /* THE SUITE'S OWN OVER-STRICTNESS: the same CSPRNG draw in a spelling the suite did not anticipate (a 32-bit
     draw, rejection-sampled against its own bound). Correct work — nothing may fail. */
  "csprng-other-spelling": {
    patches: [["store.mjs", "      const u = new Uint16Array(1);\n      for (;;) { crypto.getRandomValues(u); if (u[0] < 60000)",
               "      const u = new Uint32Array(1);\n      for (;;) { crypto.getRandomValues(u); if (u[0] < 4294960000)"]],
    mustFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `opaque-ids-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "utf8");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.replace(from, () => to));
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, OPAQUE_IDS_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /opaque-ids: (\d+) passed, (\d+) failed/.exec(out);
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
