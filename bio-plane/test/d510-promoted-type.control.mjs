/* d510-promoted-type.control.mjs — D-510's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it builds ARMED
 * COPIES of `src/` and runs `test/d510-promoted-type.test.mjs` against each (D510_SRC), so the battery must not
 * discover it. The real sources are never edited; they are hashed before and after and must be unchanged.
 *
 *   node test/d510-promoted-type.control.mjs [arm]      from bio-plane/
 *
 * Each arm's anchor must occur EXACTLY ONCE in the copy (an arm that did not arm is a finding, not a pass), and
 * what it MUST fail and MUST NOT fail is declared below, before it runs. Output is captured to a FILE (D-282: a
 * pipe loses a suite's tail at process.exit), and the tally is read from the suite's own foot line; a missing
 * foot reads -1. The two halves of the item are armed SEPARATELY — the derivation and the refusal are different
 * claims, and a driver that broke both at once could not say which arm each failure belongs to.
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
const SUITE = join(PLANE, "test", "d510-promoted-type.test.mjs");
const REAL = ["src/store.mjs", "checks/bio-checks.mjs"].map((p) => join(PLANE, p));
const digest = () => REAL.map((p) => { const b = readFileSync(p); return `${p.slice(PLANE.length)} ${b.length} B ${createHash("sha256").update(b).digest("hex")}`; });

const GATE = "      if (documentType !== null && envelopeType !== null && documentType !== envelopeType && !pkg.replay) {";
/* MOVED BY D-526 (2026-09-24): the derivation is now ONE line at the top of `promote`, read by every fence as well
   as every projection, so this anchor names that line; arming it types the promotion by the envelope everywhere. */
const DERIVE = "    const promotedType = documentType ?? (meta && typeof meta === \"object\" ? normalizeType(meta.object_type) : undefined);";

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: ["is REFUSED", "the record types it by the DOCUMENT"] },

  /* THE ROW'S CONTROL, HALF ONE — gate the PROJECTED TYPE on the envelope again, which is what `promote` did
     before this item. The refusal is untouched, so only the arms that watch what the record SAYS may move. */
  "envelope-type": {
    patches: [[DERIVE, "    const promotedType = meta && typeof meta === \"object\" ? normalizeType(meta.object_type) : undefined;"]],
    mustFail: ["the record types it by the DOCUMENT", "the action block is there at all",
               "its BASIS is projected", "its CORRESPONDENCE ledger too",
               "the action's kind reads from the same bytes",
               "an envelope stating NO type takes the DOCUMENT's own",
               "the derivation is not the action projection's alone"],
    mustPass: ["is REFUSED", "the refusal names the check the catalogue holds", "NOTHING landed",
               "a MEMBER's promote under the same divergent envelope is refused",
               "the replayed divergent package LANDS",
               "the ordinary shape", "spelling the type `focus`", "a document stating NO type is not a disagreement",
               "an INQUIRY document under an information envelope is refused by the same name"] },

  /* THE ROW'S CONTROL, HALF TWO — remove the refusal and obey the envelope silently again. The derivation is
     untouched, so the record still TYPES these bytes correctly; what is lost is that anybody is told. */
  "no-refusal": {
    patches: [[GATE, "      if (false && documentType !== null && envelopeType !== null && documentType !== envelopeType && !pkg.replay) {"]],
    /* THE TWO "nothing landed" ARMS ARE IN THIS LIST BECAUSE OF WHAT THIS ARM FOUND, and the first
       measurement is recorded rather than smoothed: run once before the fixture was corrected, this arm came
       back NOT AS DECLARED at 13 pass / 6 fail — both of them stayed GREEN with the refusal removed. The
       divergent document's `action_basis` leg named an inquiry the store does not hold, so D-505's union
       reached the action shape checks and refused it ACTION_BASIS_REFUSED anyway: the arms were asserting an
       absence ANOTHER fence was producing. The FIXTURE was corrected (a real fixture question, and a
       correspondence entry that satisfies capture-or-testify by account), never the declaration — a document
       that would LAND is the only one whose non-landing says anything about this refusal. */
    mustFail: ["is REFUSED", "the refusal names the check the catalogue holds",
               "it SAYS BOTH ANSWERS", "its detail says nothing was written", "NOTHING landed",
               "a MEMBER's promote under the same divergent envelope is refused",
               "nothing of the member's landed either",
               "an INQUIRY document under an information envelope is refused by the same name"],
    mustPass: ["the replayed divergent package LANDS", "the record types it by the DOCUMENT",
               "its BASIS is projected", "the ordinary shape", "spelling the type `focus`",
               "an envelope stating NO type takes the DOCUMENT's own"] },

  /* OVER-STRICTNESS (1): the same rule in a spelling this item did not anticipate. The suite is coupled to
     BEHAVIOUR and not to an expression, so every arm must stay green. */
  spelling: {
    patches: [[GATE, "      if (documentType != null && envelopeType != null && !Object.is(documentType, envelopeType) && !pkg.replay) {"]],
    mustFail: [],
    mustPass: ["is REFUSED", "NOTHING landed", "the record types it by the DOCUMENT", "its BASIS is projected",
               "the ordinary shape", "spelling the type `focus`", "a document stating NO type is not a disagreement",
               "an envelope stating NO type takes the DOCUMENT's own"] },

  /* OVER-STRICTNESS (2): a fence tighter than its rule — refuse whenever the document states a type at all,
     equality or not. Every refusal arm goes green for free, so the LANDING arms must fail. */
  "refuse-always": {
    patches: [[GATE, "      if (documentType !== null && !pkg.replay) {"]],
    mustFail: ["the ordinary shape", "spelling the type `focus`",
               "an envelope stating NO type takes the DOCUMENT's own"],
    mustPass: ["is REFUSED", "NOTHING landed", "a document stating NO type is not a disagreement",
               "the replayed divergent package LANDS", "the record types it by the DOCUMENT"] },
};
/* M0-197: the arms' anchors as data (each patches a COPY of src/store.mjs; counted in the real file). */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([find, put]) => ({ arm, file: join(PLANE, "src", "store.mjs"), find, put }))));

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d510-control-${name}-`));
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
    env: { ...process.env, D510_SRC: join(root, "bio-plane", "src") } });
  closeSync(fd);
  const out = readFileSync(log, "utf8");
  rmSync(root, { recursive: true, force: true });
  const foot = out.match(/d510-promoted-type: (\d+) passed, (\d+) failed/);
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
