/* d615-promoted-dates.control.mjs — D-615's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it builds ARMED COPIES of
 * `src/` and runs `test/d615-promoted-dates.test.mjs` against each (D615_SRC), so the battery must not discover it. The
 * real sources are never edited; they are hashed before and after and must be unchanged.
 *
 *   node test/d615-promoted-dates.control.mjs [arm]      from bio-plane/
 *
 * The row's control is "project the envelope's dates again and the date arm fails by name" — arm `projection-envelope`.
 * One arm more per reader moved back to the envelope, each declaring what it must fail and what it must not; an
 * over-strictness arm and a spelling arm. Each anchor must occur EXACTLY ONCE in its copy (an arm that did not arm is a
 * finding, not a pass). Output goes to a FILE (D-282) and the tally is read from the suite's own foot; a missing foot
 * reads -1. d563-promoted-title-state.control.mjs's pattern exactly.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = dirname(PLANE.replace(/\/$/, ""));
const SUITE = join(PLANE, "test", "d615-promoted-dates.test.mjs");
const REAL = ["src/store.mjs", "src/index.mjs", "checks/bio-checks.mjs"].map((p) => join(PLANE, p));
const digest = () => REAL.map((p) => { const b = readFileSync(p); return `${p.slice(PLANE.length)} ${b.length} B ${createHash("sha256").update(b).digest("hex")}`; });

const S = "src/store.mjs";
/* Held in every arm but the one that moves it: a correctly labelled creation lands with the document's dates. */
const LABELLED_ALL = ["LABELLED truly: LANDS with the document's dates"];

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: LABELLED_ALL },

  /* THE ROW'S OWN CONTROL: the projection records the envelope's two dates again. */
  "projection-envelope": {
    patches: [[S, "promotedCreated, promotedLastUpdated, meta.criticality ?? null, newSha, bundleId);",
                  "meta.created, meta.last_updated, meta.criticality ?? null, newSha, bundleId);"]],
    mustFail: ["UNLABELLED: LANDS, and the projection shows the document's created and last_updated",
               "OVER-STRICTNESS: a label RESPELLING the document's instants LANDS"],
    mustPass: [...LABELLED_ALL, "MISLABELLED created: refused ENVELOPE_DATES_DISAGREE",
               "MISLABELLED last_updated: refused ENVELOPE_DATES_DISAGREE",
               "a document stating neither date LANDS under the envelope's two dates"] },

  /* The manifest rows dated by the envelope's last_updated again (both arms: creation and revision). */
  "manifest-envelope": {
    patches: [[S, "          promotedLastUpdated || new Date().toISOString(),\n", "          meta.last_updated || new Date().toISOString(),\n"],
              [S, "promotedLastUpdated || new Date().toISOString(),   /* D-615", "meta.last_updated || new Date().toISOString(),   /* D-615"]],
    mustFail: ["…and the creation's manifest row is dated by the document's last_updated",
               "…and the revision's manifest row is dated by the document's last_updated"],
    mustPass: [...LABELLED_ALL, "UNLABELLED: LANDS, and the projection shows the document's created and last_updated",
               "…and its manifest row is dated by the envelope's last_updated"] },

  /* The refusal removed: a label contradicting the document's dates LANDS. */
  "no-refusal": {
    patches: [[S, "if (dateContradiction && !pkg.replay) {", "if (dateContradiction && false) {"]],
    mustFail: ["MISLABELLED created: refused ENVELOPE_DATES_DISAGREE", "MISLABELLED last_updated: refused ENVELOPE_DATES_DISAGREE",
               "…and nothing landed", "MISLABELLED (the label keeps the OLD last_updated): refused ENVELOPE_DATES_DISAGREE",
               "…and nothing was written"],
    mustPass: [...LABELLED_ALL, "a document stating neither date LANDS under the envelope's two dates"] },

  /* OVER-STRICTNESS: an exact text comparison, so a respelling of one instant is a contradiction. */
  "exact-compare": {
    patches: [[S, "return Number.isFinite(x) && Number.isFinite(y) ? x === y : String(a).trim() === String(b).trim();",
                  "return a === b;"]],
    mustFail: ["OVER-STRICTNESS: a label RESPELLING the document's instants LANDS"],
    mustPass: [...LABELLED_ALL, "MISLABELLED created: refused ENVELOPE_DATES_DISAGREE"] },

  /* The fork's bytes keep the origin's `created` again (its envelope's `when` now contradicts them). */
  "fork-unstamped": {
    patches: [[S, "    text = Store.#setOrAddScalar(text, \"created\", `\"${when}\"`);\n    text = Store.#setScalar(text, \"last_updated\", `\"${when}\"`);\n    const entry = `### Session ${when} | forked from",
                  "    text = Store.#setScalar(text, \"last_updated\", `\"${when}\"`);\n    const entry = `### Session ${when} | forked from"]],
    mustFail: ["the fork LANDS", "the fork's document states its OWN creation"],
    mustPass: [...LABELLED_ALL] },

  /* The derivation in a spelling this item did not write. Coupled to behaviour, all green. */
  spelling: {
    patches: [[S, "const promotedLastUpdated = documentLastUpdated ?? (envelopeMeta ? envelopeMeta.last_updated : undefined);",
                  "const promotedLastUpdated = documentLastUpdated !== null ? documentLastUpdated : envelopeMeta?.last_updated;"]],
    mustFail: [], mustPass: LABELLED_ALL },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d615-control-${name}-`));
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
    env: { ...process.env, D615_SRC: join(root, "bio-plane", "src") } });
  closeSync(fd);
  const out = readFileSync(log, "utf8");
  rmSync(root, { recursive: true, force: true });
  const foot = out.match(/d615-promoted-dates: (\d+) passed, (\d+) failed/);
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
