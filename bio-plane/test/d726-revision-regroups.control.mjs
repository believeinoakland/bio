/* d726-revision-regroups.control.mjs — D-726's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it builds ARMED COPIES of
 * `src/` and runs `test/d726-revision-regroups.test.mjs` against each (D726_SRC), so the battery must not discover it. The
 * real sources are never edited; they are hashed before and after and must be unchanged.
 *
 *   node test/d726-revision-regroups.control.mjs [arm]      from bio-plane/
 *
 * The row's control is "disarm C-86.14 and the regrouped revision lands" — arm `no-regroup-refusal`. Plus an
 * over-strictness arm (any stated group refused), the replay exemption removed, and a spelling arm. Each anchor must
 * occur EXACTLY ONCE in its copy (an arm that did not arm is a finding, not a pass). Output goes to a FILE (D-282) and
 * the tally is read from the suite's own foot; a missing foot reads -1. d615-promoted-dates.control.mjs's pattern exactly.
 *
 * RESULTS: see the RESULTS line at the head of the suite.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = dirname(PLANE.replace(/\/$/, ""));
const SUITE = join(PLANE, "test", "d726-revision-regroups.test.mjs");
const REAL = ["src/store.mjs", "src/index.mjs", "checks/bio-checks.mjs"].map((p) => join(PLANE, p));
const digest = () => REAL.map((p) => { const b = readFileSync(p); return `${p.slice(PLANE.length)} ${b.length} B ${createHash("sha256").update(b).digest("hex")}`; });

const S = "src/store.mjs";
const FENCE = "      if (cur && revisionGroup !== null && revisionGroup !== String(cur.group_id).trim() && !pkg.replay) {";
const REFUSED = ["REGROUPED: a revision whose bytes say another group", "SAYS BOTH GROUPS", "its detail says nothing was written",
                 "NOTHING WAS WRITTEN: the head, the row's group", "QUOTED: the other group in a quoted spelling",
                 "STAMPED: revising with the caller's pre-stamp group"];
const LANDS = ["FIXTURE: the creation is held", "a revision restating the SAME group (quoted, padded) LANDS",
               "a revision stating no group LANDS", "FIXTURE: the creation's bytes were stamped",
               "REPLAY: a REPLAYED revision"];

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: [...REFUSED, ...LANDS] },

  /* THE ROW'S OWN CONTROL: C-86.14 disarmed — a regrouped revision lands again. */
  "no-regroup-refusal": {
    patches: [[S, FENCE, "      if (false) {"]],
    mustFail: REFUSED, mustPass: LANDS },

  /* OVER-STRICTNESS: a fence tighter than its rule — any group stated in a revision's bytes refused. */
  "regroup-any-statement": {
    patches: [[S, FENCE, "      if (cur && revisionGroup !== null && !pkg.replay) {"]],
    mustFail: ["a revision restating the SAME group (quoted, padded) LANDS"],
    mustPass: ["REGROUPED: a revision whose bytes say another group", "a revision stating no group LANDS", "REPLAY: a REPLAYED revision"] },

  /* The replay exemption removed: only the REPLAY arm fails. */
  "regroup-no-replay-exemption": {
    patches: [[S, FENCE, "      if (cur && revisionGroup !== null && revisionGroup !== String(cur.group_id).trim()) {"]],
    mustFail: ["REPLAY: a REPLAYED revision"], mustPass: [...REFUSED, ...LANDS.filter((l) => !l.startsWith("REPLAY"))] },

  /* The fence in a spelling this item did not write. Coupled to behaviour, all green. */
  "regroup-spelling": {
    patches: [[S, FENCE, "      if (cur != null && pkg.replay !== true && typeof revisionGroup === \"string\" && String(cur.group_id).trim() !== revisionGroup) {"]],
    mustFail: [], mustPass: [...REFUSED, ...LANDS] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d726-control-${name}-`));
  cpSync(join(PLANE, "src"), join(root, "bio-plane", "src"), { recursive: true });
  cpSync(join(PLANE, "checks"), join(root, "bio-plane", "checks"), { recursive: true });
  cpSync(join(REPO, "docprofile"), join(root, "docprofile"), { recursive: true });
  const counts = arm.patches.map(([file, from, to]) => {
    const p = join(root, "bio-plane", file);
    const s = readFileSync(p, "utf8");
    const n = s.split(from).length - 1;
    writeFileSync(p, s.replace(from, () => to));
    return n;
  });
  const log = join(root, "suite.log"), fd = openSync(log, "w");
  const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, stdio: ["ignore", fd, fd],
    env: { ...process.env, D726_SRC: join(root, "bio-plane", "src") } });
  closeSync(fd);
  const out = readFileSync(log, "utf8");
  rmSync(root, { recursive: true, force: true });
  const foot = out.match(/d726-revision-regroups: (\d+) passed, (\d+) failed/);
  const failed = [...out.matchAll(/^  FAIL  (.*)$/gm)].map((m) => m[1]);
  const passed = [...out.matchAll(/^  PASS  (.*)$/gm)].map((m) => m[1]);
  const armed = counts.every((c) => c === 1);
  const asDeclared = armed && !!foot
    && arm.mustFail.every((l) => failed.some((f) => f.includes(l)))
    && arm.mustPass.every((l) => passed.some((p) => p.includes(l)))
    && (arm.mustFail.length > 0 || failed.length === 0)
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
