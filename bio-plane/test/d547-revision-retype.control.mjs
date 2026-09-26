/* d547-revision-retype.control.mjs — D-547's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it builds ARMED
 * COPIES of `src/` and runs `test/d547-revision-retype.test.mjs` against each (D547_SRC), so the battery must not
 * discover it. The real sources are never edited; they are hashed before and after and must be unchanged.
 *
 *   node test/d547-revision-retype.control.mjs [arm]      from bio-plane/
 *
 * Each arm's anchor must occur EXACTLY ONCE in the copy (an arm that did not arm is a finding, not a pass), and what
 * it MUST fail and MUST NOT fail is declared below, before it runs. Output goes to a FILE (D-282), the tally is read
 * from the suite's own foot line, and a missing foot reads -1. D-510's driver is the model.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = dirname(PLANE.replace(/\/$/, ""));
const SUITE = join(PLANE, "test", "d547-revision-retype.test.mjs");
const REAL = ["src/store.mjs", "checks/bio-checks.mjs"].map((p) => join(PLANE, p));
const digest = () => REAL.map((p) => { const b = readFileSync(p); return `${p.slice(PLANE.length)} ${b.length} B ${createHash("sha256").update(b).digest("hex")}`; });

const GATE = "      if (cur && typeof promotedType === \"string\" && promotedType !== normalizeType(cur.object_type) && !pkg.replay) {";

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: ["is REFUSED", "TYPE IS UNCHANGED", "keeps its type LANDS"] },

  /* THE ROW'S CONTROL: drop the comparison, which is what `promote` did before this item. The retype LANDS and the
     bundle's type changes in place, so every arm that watches the refusal or the unchanged type must fail by name. */
  "no-compare": {
    patches: [[GATE, "      if (false && cur && typeof promotedType === \"string\" && promotedType !== normalizeType(cur.object_type) && !pkg.replay) {"]],
    mustFail: ["over a head that is an `action`, is REFUSED", "the refusal names the check the catalogue holds",
               "it SAYS BOTH TYPES", "its detail says nothing was written",
               "TYPE IS UNCHANGED", "its head is the same bytes",
               "an inquiry revised as an action is REFUSED", "the inquiry is still an inquiry"],
    mustPass: ["FIXTURE", "the catalogue row is C-86.2", "keeps its type LANDS", "`focus` over an `inquiry` head",
               "refused CAS_STALE", "REPLAYED revision that retypes"] },

  /* OVER-STRICTNESS (1): the same rule in a spelling this item did not anticipate — everything stays green. */
  spelling: {
    patches: [[GATE, "      if (cur != null && promotedType != null && normalizeType(cur.object_type) != promotedType && pkg.replay !== true) {"]],
    mustFail: [],
    mustPass: ["is REFUSED", "TYPE IS UNCHANGED", "keeps its type LANDS", "`focus` over an `inquiry` head",
               "refused CAS_STALE", "REPLAYED revision that retypes"] },

  /* OVER-STRICTNESS (2): a fence tighter than its rule — compare the RAW spelling the document wrote, so a legacy
     `focus` over an `inquiry` head reads as a retype. Only the spelling arm may fail. */
  "raw-spelling": {
    patches: [[GATE, "      if (cur && sentFm && sentFm.object_type !== cur.object_type && !pkg.replay) {"]],
    mustFail: ["`focus` over an `inquiry` head"],
    mustPass: ["over a head that is an `action`, is REFUSED", "TYPE IS UNCHANGED", "keeps its type LANDS",
               "an inquiry revised as an action is REFUSED", "refused CAS_STALE", "REPLAYED revision that retypes"] },

  /* The replay exemption: without it the replayed retype is refused, and only that arm may fail. */
  "no-replay-exemption": {
    patches: [[GATE, "      if (cur && typeof promotedType === \"string\" && promotedType !== normalizeType(cur.object_type)) {"]],
    mustFail: ["REPLAYED revision that retypes"],
    mustPass: ["over a head that is an `action`, is REFUSED", "TYPE IS UNCHANGED", "keeps its type LANDS",
               "`focus` over an `inquiry` head", "refused CAS_STALE"] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d547-control-${name}-`));
  cpSync(join(PLANE, "src"), join(root, "bio-plane", "src"), { recursive: true });
  cpSync(join(PLANE, "checks"), join(root, "bio-plane", "checks"), { recursive: true });
  cpSync(join(REPO, "docprofile"), join(root, "docprofile"), { recursive: true });
  cpSync(join(REPO, "jurisdictions"), join(root, "jurisdictions"), { recursive: true });
  const storePath = join(root, "bio-plane", "src", "store.mjs");
  let s = readFileSync(storePath, "utf8");
  const counts = arm.patches.map(([from]) => s.split(from).length - 1);
  for (const [from, to] of arm.patches) s = s.replace(from, () => to);
  writeFileSync(storePath, s);
  const log = join(root, "suite.log"), fd = openSync(log, "w");
  const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, stdio: ["ignore", fd, fd],
    env: { ...process.env, D547_SRC: join(root, "bio-plane", "src") } });
  closeSync(fd);
  const out = readFileSync(log, "utf8");
  rmSync(root, { recursive: true, force: true });
  const foot = out.match(/d547-revision-retype: (\d+) passed, (\d+) failed/);
  const failed = [...out.matchAll(/^  FAIL  (.*)$/gm)].map((m) => m[1]);
  const passed = [...out.matchAll(/^  PASS  (.*)$/gm)].map((m) => m[1]);
  const armed = counts.every((c) => c === 1);
  const asDeclared = armed && !!foot
    && arm.mustFail.every((l) => failed.some((f) => f.includes(l)))
    && arm.mustPass.every((l) => passed.some((p) => p.includes(l)))
    && (name !== "baseline" || (r.status === 0 && failed.length === 0));
  console.log(`\n=== ${name}: anchors ${JSON.stringify(counts)}${armed ? "" : " — DID NOT ARM"} · exit ${r.status} · `
    + `${foot ? `${foot[1]} pass / ${foot[2]} fail` : "NO FOOT (-1)"} · ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
  for (const f of failed) console.log(`    FAIL  ${f}`);
  return asDeclared;
};

const before = digest();
console.log("real sources before:\n  " + before.join("\n  "));
const names = process.argv[2] ? [process.argv[2]] : Object.keys(ARMS);
const results = names.map((n) => [n, run(n)]);
const after = digest();
const untouched = JSON.stringify(before) === JSON.stringify(after);
console.log(`\nreal sources after: ${untouched ? "UNCHANGED" : "CHANGED:\n  " + after.join("\n  ")}`);
const ok = untouched && results.every(([, v]) => v);
console.log(`${results.filter(([, v]) => v).length}/${results.length} arms AS DECLARED`);
process.exit(ok ? 0 : 1);
