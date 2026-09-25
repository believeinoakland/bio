#!/usr/bin/env node
/* M0-197's NEGATIVE CONTROL DRIVER for `tools/anchordrift.mjs` — a BASELINE and three arms, run over a PEN COPY of a
 * real converted driver (`bio-plane/test/project-sight.control.mjs`) and the sources it patches, NEVER the real tree.
 *
 *   node bio-plane/test/anchordrift.control.mjs        (from anywhere)
 *
 * The pen is `controlPen("m0197")` (M0-182: outside the worktree). Each arm edits ONE pen file (`store.mjs`), ALONE,
 * against a per-arm pristine copy; the restore is verified by sha256 AND `cmp` AND a floored byte count; the REAL
 * subjects are hashed before and after the whole run and must be untouched.
 *
 * DECLARED BEFORE ARMING — what MUST fail and what MUST NOT:
 *   baseline  nothing changed                                     -> GREEN; every project-sight row LIVE.
 *   1 reword  THE ROW'S CONTROL: one anchored line reworded      -> RED; a failure names `project-sight.control.mjs ·
 *             (`SELECT 1 AS x` -> `SELECT 1 AS y` in the line        arm sight-via-redactor` and "matches 0 times".
 *             only that arm quotes)                                  MUST NOT: any other project-sight arm.
 *             CORRECTED after its FIRST run (2026-09-25): it reworded `viewerPredicate(viewer)` instead, and the reader
 *             named TWO arms — `not-found-to-everyone` quotes that line too. The instrument was right and the
 *             declaration wrong; the arm now rewords a line exactly one arm quotes, so it moves one variable.
 *   2 double  the same anchored span written TWICE                -> RED naming the same arm, "matches 2 times where
 *                                                                    the arm edits ONE site". MUST NOT: any other arm.
 *   3 over-   OVER-STRICTNESS: a comment appended at the end of    -> GREEN, nothing named: an edit outside every
 *     strict  the file, outside every anchor's span                   anchor's span is not drift.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";
import { anchorTable } from "../scripts/anchortable.mjs";
import { run } from "../../tools/anchordrift.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const DRIVER = "bio-plane/test/project-sight.control.mjs";
const STORE = "bio-plane/src/store.mjs";
const ARM = "sight-via-redactor";
const LINE = "    const g = viewerPredicate(viewer);\n    return !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${g.sql})`, bundleId, ...g.args);";
anchorTable([{ arm: "reword", file: join(REPO, STORE), find: LINE }, { arm: "double", file: join(REPO, STORE), find: LINE },
  { arm: "overstrict", none: "appends a comment at the END of the pen copy; it quotes nothing" }]);

const COPY = [DRIVER, STORE, "bio-plane/src/index.mjs", "bio-plane/src/query.mjs",
  "bio-plane/scripts/anchortable.mjs", "bio-plane/scripts/anchordry.mjs"];
const sha = (b) => createHash("sha256").update(b).digest("hex");
const realBefore = COPY.map((p) => sha(readFileSync(join(REPO, p))));
const PEN = controlPen("m0197");
const TREE = join(PEN, "tree");
for (const p of COPY) { mkdirSync(dirname(join(TREE, p)), { recursive: true }); copyFileSync(join(REPO, p), join(TREE, p)); }
const PSTORE = join(TREE, STORE);
const MIN = 500_000;

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const read = async () => {
  const r = await run({ root: TREE, allowFile: join(TREE, "none.json") });
  const mine = r.rows.filter((x) => x.driver === DRIVER);
  console.log(`  reader: ${r.failures.length ? "RED" : "GREEN"} · ${mine.length} ${DRIVER} rows, ${mine.filter((x) => x.state === "LIVE").length} LIVE`);
  for (const f of r.failures) console.log(`    ${f.slice(0, 200)}`);
  return r;
};
const ARMS = [
  { id: "1 reword", edit: (s) => s.replace(LINE, () => LINE.replace("SELECT 1 AS x", "SELECT 1 AS y")),
    want: (r) => [r.failures.length, r.failures.some((f) => f.includes(`${DRIVER} · arm ${ARM}`) && f.includes("matches 0 times"))], exp: [1, true] },
  { id: "2 double", edit: (s) => `${s}\n/* M0-197 control arm 2 */\n${LINE}\n`,
    want: (r) => [r.failures.length, r.failures.some((f) => f.includes(`${DRIVER} · arm ${ARM}`) && f.includes("matches 2 times where the arm edits ONE site"))], exp: [1, true] },
  { id: "3 overstrict", edit: (s) => `${s}\n/* M0-197 control arm 3: outside every anchor's span */\n`,
    want: (r) => [r.failures.length], exp: [0] },
];

console.log(`\n=== BASELINE · nothing changed (pen ${PEN})`);
{
  const r = await read();
  const mine = r.rows.filter((x) => x.driver === DRIVER);
  t("baseline · GREEN, every project-sight row LIVE, and there ARE rows", [r.failures.length, mine.length > 10, mine.every((x) => x.state === "LIVE")], [0, true, true]);
}
for (const a of ARMS) {
  console.log(`\n=== ARM ${a.id}`);
  const pristine = join(PEN, `pristine-${a.id.replace(/\W+/g, "-")}.store.mjs`);
  copyFileSync(PSTORE, pristine);
  const before = readFileSync(PSTORE);
  if (before.length < MIN) { console.log(`** pen store.mjs is implausibly small (${before.length} B); refusing to arm`); process.exit(2); }
  const src = before.toString("utf8");
  const armed = a.edit(src);
  t(`arm ${a.id} · ARMED (the pen copy changed)`, armed !== src, true);
  writeFileSync(PSTORE, armed);
  const r = await read();
  t(`arm ${a.id} · AS DECLARED`, a.want(r), a.exp);
  writeFileSync(PSTORE, readFileSync(pristine));
  const back = readFileSync(PSTORE);
  const cmp = spawnSync("cmp", ["-s", PSTORE, pristine]).status === 0;
  console.log(`  restored pen store.mjs: ${back.length} B sha256 ${sha(back).slice(0, 12)}… cmp ${cmp ? "identical" : "DIFFERS"}`);
  t(`arm ${a.id} · RESTORED (sha256 + cmp + size floor)`, [sha(back) === sha(before), cmp, statSync(PSTORE).size >= MIN], [true, true, true]);
}
const realAfter = COPY.map((p) => sha(readFileSync(join(REPO, p))));
t("the REAL subjects are untouched (sha256 before = after, all six)", realAfter.every((h, i) => h === realBefore[i]), true);
console.log(`\nanchordrift.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
