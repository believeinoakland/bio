#!/usr/bin/env node
/* M0-121's NEGATIVE CONTROL DRIVER — three arms plus a baseline — over `tools/statepaths.mjs`, `tools/coord.mjs` and
 * `bio-plane/scripts/op-claims.mjs`, each driven through `bio-plane/test/statepaths.test.mjs`.
 *
 *   node bio-plane/test/statepaths.control.mjs        (from the repo root)
 *
 * The suite measures a scratch clone of THIS working tree, so an arm is a patch to a real file here; each arm is armed
 * ALONE against pristine copies kept in a temp directory of its own (never the repository), and every restore is
 * verified by sha256 AND `cmp` AND a floored byte count — never `git checkout --`. An exit hook restores any armed file
 * on EVERY exit (0, 1, a throw, a signal). RUN LOCALLY ONLY: an armed tree is never committed or pushed (BOB, TREE-SHARING §3).
 *
 * THE ARMS, each with what MUST fail and what MUST NOT, declared before arming:
 *
 *   a  `op-claims.mjs` imports `isMovedPath` from      -> "selects at most N units" FAILS, and "at most N MEASUREMENTS
 *      `tools/coord.mjs` again (the row's control)        readers reach it through tools/coord.mjs" FAILS. MUST NOT: the
 *                                                         one-definition arms, the clone arms.
 *   b  THE LIAR: `statepaths.mjs` re-exports from       -> "selects at most N units" FAILS (BY COUNT), and "imports
 *      `coord.mjs`, which holds the definitions again     nothing" FAILS. MUST NOT: "the same binding" arms (the liar
 *                                                         keeps one binding, which is why an identity check is no proof).
 *   c  OVER-STRICTNESS: `op-claims.mjs` imports the     -> NOTHING fails: the suite is GREEN.
 *      module by namespace (`import * as`), a spelling
 *      the brief did not anticipate
 */
import { readFileSync, writeFileSync, statSync, mkdtempSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const SUITE = join(REPO, "bio-plane/test/statepaths.test.mjs");
const PEN = mkdtempSync(join(tmpdir(), "statepaths-control-"));
const FILES = {
  statepaths: { abs: join(REPO, "tools/statepaths.mjs"), min: 1500 },
  coord: { abs: join(REPO, "tools/coord.mjs"), min: 30000 },
  opclaims: { abs: join(REPO, "bio-plane/scripts/op-claims.mjs"), min: 20000 },
};
const DECLARED_ARMS = 3;

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (b) => createHash("sha256").update(b).digest("hex");

for (const [k, f] of Object.entries(FILES)) {
  f.pristine = readFileSync(f.abs);
  f.copy = join(PEN, `pristine--${k}`);
  writeFileSync(f.copy, f.pristine);
  f.digest = sha(f.pristine);
  if (f.pristine.length < f.min) { console.log(`** ${k} is implausibly small (${f.pristine.length} B); refusing to arm`); process.exit(2); }
  console.log(`  pristine ${k}: ${f.pristine.length} bytes, sha256 ${f.digest.slice(0, 12)}…`);
}
function restoreAll() {
  let ok = true;
  for (const [k, f] of Object.entries(FILES)) {
    writeFileSync(f.abs, readFileSync(f.copy));
    const got = sha(readFileSync(f.abs));
    const cmp = spawnSync("cmp", ["-s", f.abs, f.copy]).status === 0;
    const size = statSync(f.abs).size;
    const good = got === f.digest && cmp && size === f.pristine.length && size >= f.min;
    if (!good) console.log(`  ** RESTORE ${k}: ${size} B, sha256 ${got.slice(0, 12)}…, cmp ${cmp ? "identical" : "DIFFERS"}`);
    ok = ok && good;
  }
  return ok;
}
let armed = false;
process.on("exit", () => { if (armed) restoreAll(); try { rmSync(PEN, { recursive: true, force: true }); } catch { /* temp */ } });
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => process.exit(130));

const patch = (f, from, to) => {
  const src = readFileSync(f.abs, "utf8");
  const hits = src.split(from).length - 1;
  if (hits === 1) writeFileSync(f.abs, src.replace(from, to));
  return hits;
};
const suiteRun = () => {
  const r = spawnSync(process.execPath, [SUITE], { cwd: join(REPO, "bio-plane"), encoding: "utf8", maxBuffer: 1 << 26 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const tally = out.match(/^(\d+) pass, (\d+) fail$/m);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]);
  const printed = (out.match(/^ {2}PRINTED: .*$/m) || [""])[0].trim();
  return { pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, status: r.status, failed, printed };
};
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));

const IMPORT_LINE = 'import { isMovedPath } from "../../tools/statepaths.mjs";';
const COORD_BLOCK = 'import { MOVED_FILES, MOVED_DIRS, NEXT_RE, isMovedPath } from "./statepaths.mjs";\nexport { MOVED_FILES, MOVED_DIRS, NEXT_RE, isMovedPath };';
const DEFS = FILES.statepaths.pristine.toString("utf8").slice(FILES.statepaths.pristine.toString("utf8").indexOf("export const MOVED_FILES"));

console.log("\n=== ARM baseline · nothing armed ===");
{
  const s = suiteRun();
  console.log(`  ${s.printed}\n  suite: ${s.pass} pass, ${s.fail} fail`);
  t("baseline · the suite is GREEN and reached its tally", [s.pass > 15, s.fail, s.status], [true, 0, 0]);
}

const ARMS = [
  { id: "a", title: "op-claims.mjs imports the predicate from coord.mjs again",
    arm: () => [patch(FILES.opclaims, IMPORT_LINE, 'import { isMovedPath } from "../../tools/coord.mjs";')],
    mustBreak: ["selects at most", "reach it through tools/coord.mjs"],
    mustHold: ["IS statepaths.mjs' isMovedPath", "byte for byte"] },
  { id: "b", title: "THE LIAR — statepaths.mjs re-exports from coord.mjs, which holds the definitions again",
    arm: () => [patch(FILES.coord, COORD_BLOCK, DEFS.trimEnd()),
      (writeFileSync(FILES.statepaths.abs, 'export { MOVED_FILES, MOVED_DIRS, NEXT_RE, isMovedPath } from "./coord.mjs";\n'), 1)],
    mustBreak: ["selects at most", "imports nothing"],
    mustHold: ["IS statepaths.mjs' isMovedPath", "byte for byte"] },
  { id: "c", title: "OVER-STRICTNESS — op-claims.mjs imports the module by namespace",
    arm: () => [patch(FILES.opclaims, IMPORT_LINE,
      'import * as STATEPATHS from "../../tools/statepaths.mjs";\nconst { isMovedPath } = STATEPATHS;')],
    mustBreak: [], mustHold: ["selects at most", "reach it through tools/coord.mjs", "imports nothing"] },
];

let ran = 0;
for (const a of ARMS) {
  console.log(`\n=== ARM ${a.id} · ${a.title} ===`);
  armed = true;
  const hits = a.arm();
  const armedOk = hits.every((h) => h === 1);
  t(`arm ${a.id} · ARMED (every patch matched exactly once: [${hits.join(", ")}])`, armedOk, true);
  if (armedOk) {
    const s = suiteRun();
    ran++;
    console.log(`  ${s.printed}\n  suite: ${s.pass} pass, ${s.fail} fail${s.failed.length ? ` — failed: ${s.failed.map((f) => `"${f}"`).join(" · ")}` : ""}`);
    t(`arm ${a.id} · the suite reached its tally`, s.pass >= 0, true);
    for (const m of a.mustBreak) t(`arm ${a.id} · MUST FAIL: "${m}…"`, broke(s, m), true);
    for (const m of a.mustHold) t(`arm ${a.id} · MUST NOT FAIL: "${m}…"`, broke(s, m), false);
    if (!a.mustBreak.length) t(`arm ${a.id} · the suite is GREEN over a correct spelling`, [s.fail, s.status], [0, 0]);
  }
  const back = restoreAll();
  armed = false;
  t(`arm ${a.id} · RESTORED all three files byte-identically (sha256 + cmp + size floor)`, back, true);
}

t(`FOOT — ${DECLARED_ARMS} arms declared, ${ran} ran`, ran, DECLARED_ARMS);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
