/* d563-promoted-title-state.control.mjs — D-563's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it builds ARMED
 * COPIES of `src/` and runs `test/d563-promoted-title-state.test.mjs` against each (D563_SRC), so the battery must not
 * discover it. The real sources are never edited; they are hashed before and after and must be unchanged.
 *
 *   node test/d563-promoted-title-state.control.mjs [arm]      from bio-plane/
 *
 * The row's control is "read meta.title in the name scan again, and the taken-title arm lands, failing by name" —
 * arm `name-envelope`. One arm more PER READER moved back to the envelope, each declaring what it must fail and what
 * it must not; two over-strictness arms. Each anchor must occur EXACTLY ONCE in its copy (an arm that did not arm is
 * a finding, not a pass). Output goes to a FILE (D-282) and the tally is read from the suite's own foot; a missing
 * foot reads -1. d526-refusal-order.control.mjs's pattern exactly.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = dirname(PLANE.replace(/\/$/, ""));
const SUITE = join(PLANE, "test", "d563-promoted-title-state.test.mjs");
const REAL = ["src/store.mjs", "src/index.mjs", "checks/bio-checks.mjs"].map((p) => join(PLANE, p));
const digest = () => REAL.map((p) => { const b = readFileSync(p); return `${p.slice(PLANE.length)} ${b.length} B ${createHash("sha256").update(b).digest("hex")}`; });

const S = "src/store.mjs";
/* Every LABELLED fence arm must hold in every arm: a reader moved back to the envelope still sees a correctly
   labelled promotion, so a red LABELLED would mean the arm broke more than the one reader. */
const LABELLED_ALL = ["LABELLED: refused NAME_TAKEN", "LABELLED: a machine credential deactivating is refused NOT_THE_OWNER",
  "LABELLED: refused CITED"];

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: LABELLED_ALL },

  /* THE ROW'S OWN CONTROL: 7.1's name scan reads meta.title again. The taken name under a FREE label lands. */
  "name-envelope": {
    patches: [[S, "const key = Store.projectNameKey(promotedTitle);", "const key = Store.projectNameKey(meta.title);"]],
    /* RECORDED, NOT SMOOTHED: declared first (from the row) with "…and no second project landed" in mustFail, and it
       came back NOT AS DECLARED — the taken name under a FREE label is refused by name, but by
       ENVELOPE_TITLE_DISAGREES, the net this item puts behind the fences, and so does NOT land. The arm was right and
       the declaration was wrong; the landing the row names is measured by `name-envelope-unnetted` below. The
       unlabelled creations meet NO_TITLE here (the envelope names none), which is this one reader's consequence. */
    mustFail: ["MISLABELLED: refused NAME_TAKEN", "UNLABELLED: refused NAME_TAKEN"],
    mustPass: [...LABELLED_ALL, "…and no second project landed", "MISLABELLED state: a machine credential",
               "UNLABELLED: refused CITED"] },

  /* THE ROW'S LANDING: the name scan on meta.title AND the title refusal disarmed — the taken name LANDS. */
  "name-envelope-unnetted": {
    patches: [[S, "const key = Store.projectNameKey(promotedTitle);", "const key = Store.projectNameKey(meta.title);"],
              [S, "&& !(documentQuestionTitle !== null && sameText(envelopeTitle, documentQuestionTitle)) && !pkg.replay) {",
                  "&& !(documentQuestionTitle !== null && sameText(envelopeTitle, documentQuestionTitle)) && false) {"]],
    mustFail: ["MISLABELLED: refused NAME_TAKEN", "…and no second project landed"],
    mustPass: [...LABELLED_ALL] },

  /* 7.11's owner test reads the envelope's state and reason again. */
  "owner-envelope": {
    patches: [[S, "const to = promotedState, from = cur.current_state;", "const to = meta.current_state, from = cur.current_state;"],
              [S, 'to === "closed" && promotedClosedReason === "abandoned";', 'to === "closed" && meta.closed_reason === "abandoned";']],
    mustFail: ["MISLABELLED state: a machine credential deactivating is refused NOT_THE_OWNER",
               "MISLABELLED reason: a machine credential deactivating is refused NOT_THE_OWNER",
               "UNLABELLED: a machine credential deactivating is refused NOT_THE_OWNER",
               "…and the project still stands where it was"],
    mustPass: [...LABELLED_ALL, "MISLABELLED: refused NAME_TAKEN", "MISLABELLED: refused CITED"] },

  /* REC-181's retirement arm reads the envelope's state again. */
  "retire-envelope": {
    patches: [[S, 'if (promotedState === "retired" && (!cur', 'if (meta.current_state === "retired" && (!cur']],
    mustFail: ["MISLABELLED: refused CITED", "UNLABELLED: refused CITED", "…and the item is still verified"],
    mustPass: [...LABELLED_ALL, "UNLABELLED: refused NAME_TAKEN"] },

  /* The projection writes the envelope's title and state again. */
  "projection-envelope": {
    patches: [[S, "projectedTitle, promotedState, promotedPriorState,", "projectedTitle, meta.current_state, meta.prior_state ?? null,"],
              [S, '        : promotedTitle);', '        : meta.title);']],
    mustFail: ["UNLABELLED: a project by a free name LANDS, and the projection shows the document's title",
               "OVER-STRICTNESS: a label that only RESPACES the title LANDS",
               "UNLABELLED information LANDS titled by its document",
               "UNLABELLED: LANDS, and the projection shows the document's current_state and prior_state"],
    mustPass: [...LABELLED_ALL] },

  /* The refusals removed: a label contradicting the document, which no fence speaks to, LANDS. */
  "no-refusal": {
    patches: [[S, "&& !(documentQuestionTitle !== null && sameText(envelopeTitle, documentQuestionTitle)) && !pkg.replay) {",
                  "&& !(documentQuestionTitle !== null && sameText(envelopeTitle, documentQuestionTitle)) && false) {"],
              [S, "if (stateContradiction && !pkg.replay) {", "if (stateContradiction && false) {"]],
    mustFail: ["MISLABELLED (a free name under a TAKEN label): refused ENVELOPE_TITLE_DISAGREES",
               "MISLABELLED information: refused ENVELOPE_TITLE_DISAGREES",
               "MISLABELLED current_state: refused ENVELOPE_STATE_DISAGREES",
               "…and nothing was written"],
    mustPass: [...LABELLED_ALL, "MISLABELLED: refused NAME_TAKEN", "MISLABELLED state: a machine credential"] },

  /* OVER-STRICTNESS (1): an exact comparison, so a respacing is a contradiction. */
  "exact-compare": {
    patches: [[S, 'const sameText = (a, b) => String(a).trim().replace(/\\s+/g, " ") === String(b).trim().replace(/\\s+/g, " ");',
                  "const sameText = (a, b) => a === b;"]],
    mustFail: ["OVER-STRICTNESS: a label that only RESPACES the title LANDS"],
    mustPass: [...LABELLED_ALL, "OVER-STRICTNESS: an inquiry labelled with its QUESTION's title LANDS"] },

  /* OVER-STRICTNESS (2): the question's title is not accepted as the document's. */
  "no-question-title": {
    patches: [[S, "&& !(documentQuestionTitle !== null && sameText(envelopeTitle, documentQuestionTitle)) && !pkg.replay) {",
                  "&& !pkg.replay) {"]],
    mustFail: ["OVER-STRICTNESS: an inquiry labelled with its QUESTION's title LANDS"],
    mustPass: [...LABELLED_ALL, "OVER-STRICTNESS: a label that only RESPACES the title LANDS"] },

  /* OVER-STRICTNESS (3): the derivation in a spelling this item did not write. Coupled to behaviour, all green. */
  spelling: {
    patches: [[S, "const promotedState = documentState ?? (envelopeMeta ? envelopeMeta.current_state : undefined);",
                  "const promotedState = documentState !== null ? documentState : envelopeMeta?.current_state;"]],
    mustFail: [], mustPass: LABELLED_ALL },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d563-control-${name}-`));
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
    env: { ...process.env, D563_SRC: join(root, "bio-plane", "src") } });
  closeSync(fd);
  const out = readFileSync(log, "utf8");
  rmSync(root, { recursive: true, force: true });
  const foot = out.match(/d563-promoted-title-state: (\d+) passed, (\d+) failed/);
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
