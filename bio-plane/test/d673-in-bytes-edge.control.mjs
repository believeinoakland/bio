/* d673-in-bytes-edge.control.mjs — D-673's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it builds ARMED COPIES of
 * `src/` and `checks/` in a per-arm `controlPen` (M0-182) OUTSIDE the tree and runs `test/d673-in-bytes-edge.test.mjs`
 * against each (D673_SRC), so the battery must not discover it. The real sources are never edited; they are hashed
 * before and after and must be unchanged. D-546's driver is the model.
 *
 *   node test/d673-in-bytes-edge.control.mjs [arm]      from bio-plane/
 *
 * Each arm's anchor must occur EXACTLY ONCE in the copy (an arm that did not arm is a finding, not a pass), and what it
 * MUST fail and MUST NOT fail is declared below, before it runs. Output goes to a FILE (D-282), the tally is read from
 * the suite's own foot line, and a missing foot reads -1.
 *
 * RESULTS: recorded in the item's commit message and report (the run's printed lines, verbatim).
 */
import { readFileSync, writeFileSync, cpSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { controlPen } from "./pen.mjs";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "d673-in-bytes-edge.test.mjs");
const REAL = [join(PLANE, "src", "store.mjs"), join(PLANE, "src", "index.mjs"), join(PLANE, "src", "gate.mjs"),
              join(PLANE, "checks", "bio-checks.mjs")];
const digest = () => REAL.map((p) => { const b = readFileSync(p); return `${p.slice(PLANE.length)} ${b.length} B ${createHash("sha256").update(b).digest("hex")}`; });

const CK = "checks/bio-checks.mjs", ST = "src/store.mjs";
const FIND = "      const k = corroborating.findIndex((m) => m.from === e.from_state && m.to === e.to_state";
const DATE = "        && stateMoveBeforeFence(fence, m.date));";
const TAKE = "        const m = corroborating.splice(k, 1)[0];";
const AUDIT = "            recordedMoves: this.recordedMovesFor(row.bundle_id),";
const FACTS = "      recordedMoves: this.recordedMovesFor(bundleId),";

const GATE_ROW = "THE ROW: the corroborated twin PASSES C-4.2";
const GATE_NEG = "THE ROW: the uncorroborated twin";
const LATE = "a writer's timestamp never buys it";
const TWICE = "the reading is never larger than the record's count";
const O_OVER = "OVER-STRICTNESS: the bytes' own timestamp after the fence";
const D_OVER = "OVER-STRICTNESS: a declared edge is neither stated nor refused";
const OP_ROW = "THE ROW through the op";
const OP_REST = "…and L and M keep their ERROR, O and D none";
const OP_COUNT = "…and the stated count is whole";
const FACTS_T = "FIXTURE: the store's gate facts carry the record's moves";
const FLOOR = "FIXTURE: every judged image carries its bundle.md";
const ALL = [GATE_ROW, GATE_NEG, LATE, TWICE, O_OVER, D_OVER, OP_ROW, OP_REST, OP_COUNT, FACTS_T, FLOOR];
const except = (...xs) => ALL.filter((l) => !xs.includes(l));

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: ALL },

  /* THE ROW'S CONTROL, first half: nothing is ever corroborated (C-4.2 as it was). The corroborated twin — and every
     reading that rests on the record — fails by name; the uncorroborated twin and the declared twin stay as they are. */
  "no-corroboration": {
    patches: [[CK, FIND, "      const k = [].findIndex((m) => m.from === e.from_state && m.to === e.to_state"]],
    mustFail: [GATE_ROW, TWICE, O_OVER, OP_ROW, OP_REST, OP_COUNT],
    mustPass: [GATE_NEG, LATE, D_OVER, FACTS_T, FLOOR] },

  /* THE ROW'S CONTROL, second half — the ruling's own words: the BYTES' timestamp buys the reading with no record
     move at all. The backdated twin with no corroboration now passes, so its arm fails BY NAME, in the gate and through
     the op. (O's in-bytes entry is dated after the fence, so it reads ERROR here: over-strictness fails too.) */
  "timestamp-alone": {
    patches: [[CK, FIND, "      const k = stateMoveBeforeFence(fence, e.timestamp) ? 0 : -1; ((m) => m.from === e.from_state && m.to === e.to_state"],
              [CK, TAKE, "        const m = corroborating.splice(k, 1)[0] || { date: e.timestamp };"]],
    mustFail: [GATE_NEG, OP_ROW, O_OVER],
    /* GATE_ROW is declared neither way: the arm takes whichever record move is first, so C's sentence names the
       wrong one's date, which is the arm's own damage and not the subject. */
    mustPass: [D_OVER, FACTS_T, FLOOR] },

  /* The record is asked, but the date is the BYTES' own: L (record dated after the fence, bytes backdated) now passes,
     and O (record before, bytes after) now fails. */
  "bytes-date": {
    patches: [[CK, DATE, "        && stateMoveBeforeFence(fence, e.timestamp));"]],
    mustFail: [LATE, O_OVER, OP_REST, OP_COUNT],
    mustPass: [GATE_ROW, GATE_NEG, TWICE, D_OVER, FACTS_T, FLOOR] },

  /* The fence's date is not asked at all: a record move its writer dated after the fence corroborates. */
  "no-fence-date": {
    patches: [[CK, DATE, "        && true);"]],
    mustFail: [LATE, OP_REST, OP_COUNT],
    mustPass: [GATE_ROW, GATE_NEG, TWICE, O_OVER, D_OVER, FACTS_T, FLOOR] },

  /* One record move corroborates EVERY matching entry: the reading grows past the record's count. */
  "no-consume": {
    patches: [[CK, TAKE, "        const m = corroborating[k];"]],
    mustFail: [TWICE, OP_REST, OP_COUNT],
    mustPass: [GATE_ROW, GATE_NEG, LATE, O_OVER, D_OVER, FACTS_T, FLOOR] },

  /* The audit sweep is blinded (the registry not injected): the op's verdicts fail, the gate's stay green. */
  "audit-blind": {
    patches: [[ST, AUDIT, "            recordedMoves: null,"]],
    mustFail: [OP_ROW, OP_REST, OP_COUNT],
    mustPass: [GATE_ROW, GATE_NEG, LATE, TWICE, O_OVER, D_OVER, FACTS_T, FLOOR] },

  /* The ratify gate's facts are blinded: the gate's corroborated verdicts fail, the op's stay green. */
  "facts-blind": {
    patches: [[ST, FACTS, "      recordedMoves: null,"]],
    mustFail: [FACTS_T, GATE_ROW, TWICE, O_OVER],
    mustPass: [GATE_NEG, LATE, D_OVER, OP_ROW, OP_REST, OP_COUNT, FLOOR] },

  /* OVER-STRICTNESS: the take spelled another way — everything stays green. */
  spelling: {
    patches: [[CK, TAKE, "        const m = corroborating.splice(k, 1).pop();"]],
    mustFail: [], mustPass: ALL },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = controlPen(`d673-${name}`, { quiet: true });
  cpSync(join(PLANE, "src"), join(root, "bio-plane", "src"), { recursive: true });
  cpSync(join(PLANE, "checks"), join(root, "bio-plane", "checks"), { recursive: true });
  cpSync(join(REPO, "docprofile"), join(root, "docprofile"), { recursive: true });
  const counts = [];
  for (const [file, from, to] of arm.patches) {
    const p = join(root, "bio-plane", file);
    const s = readFileSync(p, "utf8");
    counts.push(s.split(from).length - 1);
    writeFileSync(p, s.replace(from, () => to));
  }
  const log = join(root, "suite.log"), fd = openSync(log, "w");
  const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, stdio: ["ignore", fd, fd],
    env: { ...process.env, D673_SRC: join(root, "bio-plane", "src") } });
  closeSync(fd);
  const out = readFileSync(log, "utf8");
  rmSync(root, { recursive: true, force: true });
  const foot = out.match(/d673-in-bytes-edge: (\d+) passed, (\d+) failed/);
  const failed = [...out.matchAll(/^  FAIL  (.*)$/gm)].map((m) => m[1]);
  const passed = [...out.matchAll(/^  PASS  (.*)$/gm)].map((m) => m[1]);
  const armed = counts.every((c) => c === 1);
  const missFail = arm.mustFail.filter((l) => !failed.some((f) => f.includes(l)));
  const missPass = arm.mustPass.filter((l) => !passed.some((p) => p.includes(l)));
  const asDeclared = armed && !!foot && !missFail.length && !missPass.length
    && (name !== "baseline" || (r.status === 0 && failed.length === 0));
  console.log(`\n=== ${name}: anchors ${JSON.stringify(counts)}${armed ? "" : " — DID NOT ARM"} · exit ${r.status} · `
    + `${foot ? `${foot[1]} pass / ${foot[2]} fail` : "NO FOOT (-1)"} · ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
  for (const f of failed) console.log(`    FAIL  ${f.split("\n")[0]}`);
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
