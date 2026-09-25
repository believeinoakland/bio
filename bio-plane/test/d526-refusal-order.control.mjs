/* d526-refusal-order.control.mjs — D-526's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it builds ARMED
 * COPIES of `src/` and runs `test/d526-refusal-order.test.mjs` against each (D526_SRC), so the battery must not
 * discover it. The real sources are never edited; they are hashed before and after and must be unchanged.
 *
 *   node test/d526-refusal-order.control.mjs [arm]      from bio-plane/
 *
 * The row's control is "read the envelope's type in ONE fence again and that arm's refusal differs, failing by
 * name" — so there is one arm PER FENCE, each moving that fence alone back to the envelope, each declaring the
 * section it must fail and the sections it must not. Each anchor must occur EXACTLY ONCE in its copy (an arm that
 * did not arm is a finding, not a pass). Output goes to a FILE (D-282) and the tally is read from the suite's own
 * foot; a missing foot reads -1. d510-promoted-type.control.mjs's pattern exactly.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { anchorTable } from "../scripts/anchortable.mjs";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = dirname(PLANE.replace(/\/$/, ""));
const SUITE = join(PLANE, "test", "d526-refusal-order.test.mjs");
const REAL = ["src/store.mjs", "src/index.mjs", "checks/bio-checks.mjs"].map((p) => join(PLANE, p));
const digest = () => REAL.map((p) => { const b = readFileSync(p); return `${p.slice(PLANE.length)} ${b.length} B ${createHash("sha256").update(b).digest("hex")}`; });

const S = "src/store.mjs", I = "src/index.mjs";
const ENV_S = 'normalizeType(meta.object_type)';
/* Every section's LABELLED arm must stay green in every fence arm: a fence moved back to the envelope still sees a
   correctly labelled promotion, so a red LABELLED would mean the arm broke more than the one fence. */
const LABELLED_ALL = ["LABELLED: refused GOVERNING_LAWS_REWRITTEN", "LABELLED: refused SURFACE_NO_RUN",
  "LABELLED: refused NOT_CAPABLE", "LABELLED: refused NAME_TAKEN", "LABELLED: LANDS with surfaced_by",
  "LABELLED: refused BIAS_REFUSED"];

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: LABELLED_ALL },

  /* THE ROW'S OWN CONTROL: D-149's carry-forward reads the envelope's type again. */
  "laws-envelope": {
    patches: [[S, '|| (!cur && promotedType === "action"))) {', `|| (!cur && ${ENV_S} === "action"))) {`]],
    mustFail: ["MISLABELLED: refused GOVERNING_LAWS_REWRITTEN", "UNLABELLED: refused GOVERNING_LAWS_REWRITTEN",
               "UNLABELLED: …and nothing landed"],
    mustPass: [...LABELLED_ALL, "MISLABELLED: refused SURFACE_NO_RUN", "MISLABELLED: refused NOT_CAPABLE",
               "MISLABELLED: refused NAME_TAKEN", "UNLABELLED: refused BIAS_REFUSED"] },

  /* D-85's surfacing gate, in the store. */
  "surface-envelope": {
    patches: [[S, 'if (base === null && meta && typeof meta === "object" && promotedType === "inquiry"',
                  `if (base === null && meta && typeof meta === "object" && ${ENV_S} === "inquiry"`]],
    mustFail: ["MISLABELLED: refused SURFACE_NO_RUN", "UNLABELLED: refused SURFACE_NO_RUN"],
    mustPass: [...LABELLED_ALL, "MISLABELLED: refused GOVERNING_LAWS_REWRITTEN", "MISLABELLED: refused NOT_CAPABLE"] },

  /* 7.1's name scan, in the store — back to the raw envelope key it compared before this item. */
  "name-envelope": {
    patches: [[S, '      if (promotedType === "project") {', '      if (meta.object_type === "project") {']],
    mustFail: ["MISLABELLED: refused NAME_TAKEN", "UNLABELLED: refused NAME_TAKEN"],
    mustPass: [...LABELLED_ALL, "MISLABELLED: refused NOT_CAPABLE", "UNLABELLED: refused NOT_CAPABLE",
               "OVER-STRICTNESS UNLABELLED: a project by a free name LANDS"] },

  /* section 5's create_projects gate, on the CONTROL PLANE. It is also the one stamp of `ownerMemberId`, so the
     unlabelled free project's owner goes with it. */
  "capable-envelope": {
    patches: [[I, 'if (b.base === null && b.meta && promotedType === "project" && viaSession) {',
                  'if (b.base === null && b.meta && b.meta.object_type === "project" && viaSession) {']],
    /* "…and no project of that id exists" is NOT in this list, and the first run is recorded rather than smoothed:
       declared there, this arm came back NOT AS DECLARED at 28/3 with it GREEN. With only this gate moved back, the
       STORE still types the creation by its document, so REC-141 refuses the id the caller named
       (PROJECT_ID_SUPPLIED) — the absence is carried by ANOTHER fence here, and asserting it would be crediting
       this one with it. The suite's section 3 says so at the arm. */
    mustFail: ["MISLABELLED: refused NOT_CAPABLE", "UNLABELLED: refused NOT_CAPABLE",
               "its creator is its one participant"],
    mustPass: [...LABELLED_ALL, "MISLABELLED: refused NAME_TAKEN", "UNLABELLED: refused NAME_TAKEN"] },

  /* the owner row, in the store: the stamp still arrives, the store ignores it for an unlabelled creation. */
  "owner-envelope": {
    patches: [[S, 'if (!cur && ownerMemberId && promotedType === "project") {',
                  'if (!cur && ownerMemberId && meta.object_type === "project") {']],
    mustFail: ["its creator is its one participant"],
    mustPass: [...LABELLED_ALL, "OVER-STRICTNESS UNLABELLED: a project by a free name LANDS",
               "UNLABELLED: refused NOT_CAPABLE", "UNLABELLED: refused NAME_TAKEN"] },

  /* D-78's surfaced_by restamp, on the CONTROL PLANE. */
  "restamp-envelope": {
    patches: [[I, '            && promotedType === "inquiry"\n            && Array.isArray(b.files)) {',
                  '            && normalizeType(b.meta.object_type) === "inquiry"\n            && Array.isArray(b.files)) {']],
    mustFail: ["UNLABELLED: LANDS with surfaced_by"],
    mustPass: [...LABELLED_ALL, "UNLABELLED: refused SURFACE_NO_RUN"] },

  /* C-26's bias gate, in the store: the envelope ALONE, as before this item. */
  "bias-envelope": {
    patches: [[S, 'if ((promotedType === "bias" || normalizeType(meta.object_type) === "bias") && !pkg.replay) {',
                  'if (normalizeType(meta.object_type) === "bias" && !pkg.replay) {']],
    mustFail: ["UNLABELLED: refused BIAS_REFUSED"],
    mustPass: [...LABELLED_ALL, "MISLABELLED: refused ENVELOPE_TYPE_DISAGREES"] },

  /* OVER-STRICTNESS (1): the derivation in a spelling this item did not write. Coupled to behaviour, all green. */
  spelling: {
    patches: [[S, '    const promotedType = documentType ?? (meta && typeof meta === "object" ? normalizeType(meta.object_type) : undefined);',
                  '    const promotedType = documentType !== null ? documentType : (meta && typeof meta === "object" ? normalizeType(meta.object_type) : undefined);']],
    mustFail: [], mustPass: LABELLED_ALL },

  /* OVER-STRICTNESS (2): a fence tighter than its rule — D-510's refusal treating an envelope that states NO type
     as a disagreement. Every refusal arm stays green for free; the arms that must LAND unlabelled go red. */
  "refuse-unlabelled": {
    patches: [[S, 'if (documentType !== null && envelopeType !== null && documentType !== envelopeType && !pkg.replay) {',
                  'if (documentType !== null && documentType !== envelopeType && !pkg.replay) {']],
    mustFail: ["an action stating no laws LANDS",
               "OVER-STRICTNESS UNLABELLED: a project by a free name LANDS", "UNLABELLED: LANDS with surfaced_by"],
    mustPass: [...LABELLED_ALL.filter((l) => !l.includes("surfaced_by")), "UNLABELLED: refused GOVERNING_LAWS_REWRITTEN",
               "UNLABELLED: refused SURFACE_NO_RUN", "UNLABELLED: refused NAME_TAKEN"] },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). The arms patch a COPY;
   the anchor is counted in the tree file the copy is taken from. */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([file, find, put]) => ({ arm, file: join(PLANE, file), find, put }))));

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d526-control-${name}-`));
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
    env: { ...process.env, D526_SRC: join(root, "bio-plane", "src") } });
  closeSync(fd);
  const out = readFileSync(log, "utf8");
  rmSync(root, { recursive: true, force: true });
  const foot = out.match(/d526-refusal-order: (\d+) passed, (\d+) failed/);
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
