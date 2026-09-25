/* d546-state-edge.control.mjs — D-546's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it builds ARMED COPIES of
 * `src/` and runs `test/d546-state-edge.test.mjs` against each (D546_SRC), so the battery must not discover it. The
 * real sources are never edited; they are hashed before and after and must be unchanged.
 *
 *   node test/d546-state-edge.control.mjs [arm]      from bio-plane/
 *
 * Each arm's anchor must occur EXACTLY ONCE in the copy (an arm that did not arm is a finding, not a pass), and what
 * it MUST fail and MUST NOT fail is declared below, before it runs. Output goes to a FILE (D-282), the tally is read
 * from the suite's own foot line, and a missing foot reads -1. D-578's driver is the model.
 *
 * RESULTS: recorded in the item's commit message and report (the run's printed lines, verbatim).
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = dirname(PLANE.replace(/\/$/, ""));
const SUITE = join(PLANE, "test", "d546-state-edge.test.mjs");
const REAL = ["src/store.mjs", "src/index.mjs", "checks/bio-checks.mjs"].map((p) => join(PLANE, p));
const digest = () => REAL.map((p) => { const b = readFileSync(p); return `${p.slice(PLANE.length)} ${b.length} B ${createHash("sha256").update(b).digest("hex")}`; });

const FILTER = `          .filter((t) => typeof t === "string" && t !== "bias" && vocabFor(STATES, t));`;
const ASK = "          if (!legalFrom.includes(promotedState))";
const OWN = "          const legalFrom = Object.prototype.hasOwnProperty.call(mEdges, cur.current_state) ? mEdges[cur.current_state] : [];";
const MOVE_ONLY = "      if (cur && promotedState !== undefined && promotedState !== null && promotedState !== cur.current_state) {";
const TABLE = "        if (legal.includes(z.current_state)) continue;";
const ORDER = "SELECT snap_key, base, created, author, files_json FROM manifest WHERE bundle_id=? ORDER BY rowid";
const JOIN = "        const joined = wrote(man[j - 1]) !== null";

const ROW = ["information: collected -> retired is refused", "action: planned -> resolved is refused",
             "project: forming -> matured is refused", "inquiry: open -> surfaced is refused"];
const ACTION_ROW = ["action: planned -> resolved is refused", "action: …and the head is where it stood"];
const OTHER_ROW = ["information: collected -> retired is refused", "project: forming -> matured is refused",
                   "inquiry: open -> surfaced is refused"];
const OVER = ["OVER-STRICTNESS information: collected -> verified LANDS", "OVER-STRICTNESS action: planned -> active LANDS",
              "OVER-STRICTNESS project: forming -> investigating LANDS", "OVER-STRICTNESS inquiry: open -> deferred LANDS",
              "every DECLARED move LANDED", "moves along a live edge"];
const IN_PLACE = ["a revision that stays at verified LANDS", "a revision that stays at active LANDS",
                  "a revision that stays at investigating LANDS", "a revision that stays at deferred LANDS",
                  "amended where it stands"];
const UNREACH = ["an open inquiry named `published` is refused", "cannot be moved to `elevated`"];
const CENSUS = ["it counts EXACTLY the two undeclared moves", "the pre-fence move is listed", "is NOT placed before it"];
const SWEEP = "every UNDECLARED move was refused";
const AFTER = "nothing undeclared landed under the fence";
const JOINED = "every pair of the run's chains JOINED";

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: [...ROW, ...OVER, ...IN_PLACE, ...UNREACH, ...CENSUS, SWEEP, AFTER, JOINED] },

  /* THE ROW'S CONTROL (the row's own words): drop the fence for ONE type, `action`. Its undeclared-move arm LANDS and
     fails by name, the sweep's undeclared half fails on its action pairs, and the census after the run counts the
     action moves that landed; every other type's arm and every over-strictness arm stays green. */
  "drop-one-type": {
    patches: [[FILTER, `          .filter((t) => typeof t === "string" && t !== "bias" && t !== "action" && vocabFor(STATES, t));`]],
    mustFail: [...ACTION_ROW, SWEEP, AFTER],
    mustPass: [...OTHER_ROW, ...OVER, ...IN_PLACE, ...UNREACH, ...CENSUS, JOINED] },

  /* The fence asks nothing at all (its question disarmed, the region and the pre-fence anchor left in place): every
     type's arm lands, both legacy states are reached, and the census after the run counts what landed. */
  "ask-nothing": {
    patches: [[ASK, "          if (false && !legalFrom.includes(promotedState))"]],
    mustFail: [...ROW, ...UNREACH, SWEEP, AFTER],
    mustPass: [...OVER, ...IN_PLACE, ...CENSUS, JOINED] },

  /* OVER-STRICTNESS: a revision that MOVES NO STATE is asked too. No table carries a self-edge, so every in-place
     amendment is refused — correct work the fence must not refuse. */
  "ask-in-place": {
    patches: [[MOVE_ONLY, "      if (cur && promotedState !== undefined && promotedState !== null && true) {"]],
    mustFail: IN_PLACE,
    mustPass: [...ROW, ...UNREACH, ...CENSUS] },

  /* THE CENSUS'S LIAR: every recorded move is counted undeclared, the table never asked. */
  "census-no-table": {
    patches: [[TABLE, "        if (false && legal.includes(z.current_state)) continue;"]],
    mustFail: ["it counts EXACTLY the two undeclared moves", AFTER],
    mustPass: [...ROW, ...OVER, ...IN_PLACE, ...UNREACH, SWEEP] },

  /* THE ORDER THE SUITE'S FIRST RUN MEASURED WRONG: pair by the writer's `created` (REC-182's order). With the join
     check in place the mis-ordered pairs of the pre-fence action (amended in section 3 under an EARLIER date than
     its move) do not join and are counted UNDETERMINED — so the whole-run JOINED arm fails by name, and so does the
     after-run count, which is now SMALLER than the record holds by that bundle's one move (undetermined, not
     invented). Its first declaration said the count would hold; the arm came back NOT AS DECLARED because the join
     it rested on joined nothing (equal by construction) — the census was corrected, not the declaration bent. */
  "census-created-order": {
    patches: [[ORDER, "SELECT snap_key, base, created, author, files_json FROM manifest WHERE bundle_id=? ORDER BY created, rowid"]],
    mustFail: [JOINED, AFTER],
    mustPass: [...ROW, ...OVER, ...IN_PLACE, ...UNREACH, "the pre-fence move is listed"] },

  /* …and the same order with the join check disarmed: the mis-ordered pairs are classified, and the in-place
     amendment the writer dated early reads as a move nobody made — the count grows past what the record holds. */
  "census-created-order-no-join": {
    patches: [[ORDER, "SELECT snap_key, base, created, author, files_json FROM manifest WHERE bundle_id=? ORDER BY created, rowid"],
              [JOIN, "        const joined = true || wrote(man[j - 1]) !== null"]],
    mustFail: [AFTER],
    mustPass: [...ROW, ...OVER, ...IN_PLACE, ...UNREACH, "the pre-fence move is listed"] },

  /* THE JOIN ALONE, in write order: DECLARED NO EFFECT. This suite builds no broken chain (a pre-REC-176 overwrite is
     the one way to get one), so in `rowid` order the join refuses nothing here; `census-created-order-no-join` is the
     arm that shows it load-bearing. Kept so the join's reach is measured, not assumed. */
  "census-no-join": {
    patches: [[JOIN, "        const joined = true || wrote(man[j - 1]) !== null"]],
    mustFail: [],
    mustPass: [...ROW, ...OVER, ...IN_PLACE, ...UNREACH, ...CENSUS, SWEEP, AFTER, JOINED] },

  /* OVER-STRICTNESS: the own-key read spelled another way — everything stays green. */
  spelling: {
    patches: [[OWN, "          const legalFrom = Object.hasOwn(mEdges, cur.current_state) ? mEdges[cur.current_state] : [];"]],
    mustFail: [],
    mustPass: [...ROW, ...OVER, ...IN_PLACE, ...UNREACH, ...CENSUS, SWEEP, AFTER, JOINED] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d546-control-${name}-`));
  cpSync(join(PLANE, "src"), join(root, "bio-plane", "src"), { recursive: true });
  cpSync(join(PLANE, "checks"), join(root, "bio-plane", "checks"), { recursive: true });
  cpSync(join(REPO, "docprofile"), join(root, "docprofile"), { recursive: true });
  const storePath = join(root, "bio-plane", "src", "store.mjs");
  let s = readFileSync(storePath, "utf8");
  const counts = arm.patches.map(([from]) => s.split(from).length - 1);
  for (const [from, to] of arm.patches) s = s.replace(from, () => to);
  writeFileSync(storePath, s);
  const log = join(root, "suite.log"), fd = openSync(log, "w");
  const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, stdio: ["ignore", fd, fd],
    env: { ...process.env, D546_SRC: join(root, "bio-plane", "src") } });
  closeSync(fd);
  const out = readFileSync(log, "utf8");
  rmSync(root, { recursive: true, force: true });
  const foot = out.match(/d546-state-edge: (\d+) passed, (\d+) failed/);
  const failed = [...out.matchAll(/^  FAIL  (.*)$/gm)].map((m) => m[1]);
  const passed = [...out.matchAll(/^  PASS  (.*)$/gm)].map((m) => m[1]);
  const armed = counts.every((c) => c === 1);
  const missFail = arm.mustFail.filter((l) => !failed.some((f) => f.includes(l)));
  const missPass = arm.mustPass.filter((l) => !passed.some((p) => p.includes(l)));
  const asDeclared = armed && !!foot && !missFail.length && !missPass.length
    && (name !== "baseline" || (r.status === 0 && failed.length === 0));
  console.log(`\n=== ${name}: anchors ${JSON.stringify(counts)}${armed ? "" : " — DID NOT ARM"} · exit ${r.status} · `
    + `${foot ? `${foot[1]} pass / ${foot[2]} fail` : "NO FOOT (-1)"} · ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
  for (const f of failed) console.log(`    FAIL  ${f}`);
  for (const l of missFail) console.log(`    DECLARED TO FAIL, DID NOT: ${l}`);
  for (const l of missPass) console.log(`    DECLARED TO PASS, DID NOT: ${l}`);
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
