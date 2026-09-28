/* D-178's negative control for test/audit-inheritance.test.mjs. Run from `bio-plane/`: `node test/nc-d178.mjs`.
 * Each arm edits src/store.mjs ALONE, runs the suite, and restores from a uniquely-named per-arm pristine copy,
 * verified by sha256 AND by content. Declared BEFORE arming:
 *   baseline — nothing armed: MUST be green.
 *   drop     — THE ROW'S CONTROL, the injection dropped (the sweep blind again): MUST FAIL "the inheriting inquiry
 *              is not an offender" (it reads C-2.8), the blindness-sentence arm, the C-21.2 arm, its detail and the
 *              tally; MUST NOT fail the fixture arms or the ungraded-leg arm.
 *   liar     — the row's liar, an EMPTY registry object: MUST FAIL the inherited arm, the C-21.2 arm, its detail and
 *              the tally; the blindness-sentence arm stays GREEN (an empty registry says "is not a published case",
 *              a different sentence) — declared, not a gap: the inherited arm catches it by name. */
import { readFileSync, writeFileSync, copyFileSync, mkdtempSync, statSync, unlinkSync, rmdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";

const SRC = "src/store.mjs";
/* RE-ANCHORED 2026-09-28 (T7 LEGACY-TESTS #4): RECORD-CORE #1 (d7bf074cb0) moved the sweep's per-row loop into
   record-core's `auditPass` (R18–R20); the injection this control arms is now the store's `auditPass` `context`
   callback, which hands record-core `{earnedRegistry, publishedRegistry}` per bundle id. `drop` removes the key
   (the callback's object closes on the same line), `liar` hands an empty object, as before. RE-RUN
   2026-09-28 on a scratch copy of the tree (K187's re-fixtured suite): baseline 8/0, drop 3/5, liar 4/4, each by the
   names declared below, every restore byte-identical. */
const ANCHOR = "                 publishedRegistry: this.publishedRegistryFor(id, targets) };\n";
const ARMS = {
  baseline: null,
  drop: "                 };\n",
  liar: "                 publishedRegistry: {} };\n",
};
const h = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const dir = mkdtempSync(join(process.cwd(), "test/.nc-d178-"));
const orig = h(SRC);
for (const [arm, repl] of Object.entries(ARMS)) {
  const pristine = join(dir, `store.mjs.${arm}.pristine`);
  copyFileSync(SRC, pristine);
  if (statSync(pristine).size < 1_000_000) throw new Error(`pristine copy too small for ${arm}`);
  if (repl !== null) {
    const s = readFileSync(SRC, "utf8");
    if (s.split(ANCHOR).length !== 2) throw new Error(`arm ${arm} DID NOT ARM: anchor count ${s.split(ANCHOR).length - 1}`);
    writeFileSync(SRC, s.replace(ANCHOR, repl));
  }
  const r = spawnSync(process.execPath, ["test/audit-inheritance.test.mjs"], { encoding: "utf8" });
  copyFileSync(pristine, SRC);
  const same = h(SRC) === orig && Buffer.compare(readFileSync(SRC), readFileSync(pristine)) === 0;
  const fails = (r.stdout || "").split("\n").filter((l) => /^\s+FAIL/.test(l)).map((l) => l.trim());
  const foot = (r.stdout || "").match(/(\d+) passed, (\d+) failed/);
  console.log(`${arm}: exit=${r.status} ${foot ? `${foot[1]}/${foot[2]}` : "NO FOOT (-1)"} restore=${same ? "byte-identical" : "MISMATCH"} `
    + `(${statSync(SRC).size} B sha256 ${h(SRC).slice(0, 12)}…)`);
  for (const l of (r.stdout || "").split("\n").filter((l) => /^\s+(corpus:|offender) /.test(l))) console.log(`    ${l.trim()}`);
  for (const f of fails) console.log(`    ${f}`);
  if (!same) process.exit(3);
  unlinkSync(pristine);            /* only after the restore is verified; a mismatch keeps it */
}
rmdirSync(dir);
