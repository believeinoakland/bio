/* M0-197 — THE CONTROL-ANCHOR DRIFT READER (`tools/anchordrift.mjs`), DRIVEN OVER A SCRATCH ESTATE WHOSE EVERY
 * VERDICT IS KNOWN, IN BOTH DIRECTIONS.
 *
 * The row (BOB #35, 2026-09-25 04:25Z): a PURE READER loads every driver's arm table AS DATA, counts each anchor
 * without editing, and FAILS naming driver and arm when an anchor matches 0 times, or more than once where the arm
 * edits one site; a driver whose arms cannot be loaded is named UNREADABLE, never skipped. The reader runs in every
 * gate profile over the real estate (`tools/gates.mjs`); THIS suite is where the instrument itself is tested, so a
 * matcher gone blind (every anchor LIVE) or gone generous (a correct spelling refused) fails here by name.
 *
 * HOW A LIAR PASSES IT, stated first: a driver that ARMS while being read. The reader spawns the driver up to its
 * `anchorTable()` call under `scripts/anchordry.mjs`, so the load-bearing property is the TRIPWIRE: a write outside
 * the reader's throwaway $TMPDIR, or any spawn, before the table must stop the driver AND the write must not land.
 * Arms (u2)/(u3) assert both halves — the verdict AND the absence of the file the driver tried to write.
 *
 * NEGATIVE CONTROL: RUN 2026-09-25 by the M0-197 worker, driver `test/anchordrift.control.mjs` — a BASELINE and
 * three arms over a PEN COPY of `project-sight.control.mjs` and its subjects (never the real tree), each ALONE,
 * each declared before it ran, every pen file restored and verified by sha256 AND `cmp` against a per-arm
 * pristine copy, the real subjects hashed before and after. (baseline) nothing changed -> GREEN, 24 LIVE.
 * (1) THE ROW'S CONTROL: reword ONE anchored line in the pen's `store.mjs` (the `sight-via-redactor` arm's
 * `viewerPredicate` line) -> RED, and the failure names `project-sight.control.mjs · arm sight-via-redactor` and
 * "matches 0 times". (2) the same line DOUBLED -> RED naming the same arm and "matches 2 times where the arm edits
 * ONE site". (3) OVER-STRICTNESS: whitespace changed OUTSIDE every anchor's span in the same file -> GREEN,
 * nothing named. Results as recorded by that driver's own run; re-run it in one step. THE DECLARATION'S FIRST
 * SPELLING WAS WRONG AND THE INSTRUMENT SAID SO: arm (1) first reworded `viewerPredicate(viewer)`, which TWO arms
 * quote, and the reader named both — corrected to a line one arm quotes (the driver's header records it).
 *   Two arms on the INSTRUMENT, run by hand the same day, each restored by `cp` from a scratchpad copy and verified by
 * sha256 AND `cmp`: (m) `judge` stops comparing a count with `sites` (`ok = n > 0`) -> 26/4, failing at (r3) "TWO
 * matches where the arm edits ONE site", (a2), (r11), (a7); every zero-match and tripwire arm held. (t) the tripwire's
 * fs traps removed from `scripts/anchordry.mjs` -> 25/5, failing at (u2) and at (u3) "...AND THE WRITE DID NOT LAND" —
 * the write landed — plus (u5), (r11), (a7); the spawn arm (u4) held, its trap untouched.
 */
import "./stdio.mjs";
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { run, drivers, count, judge } from "../../tools/anchordrift.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ---- the scratch estate --------------------------------------------------------------------------------- */
const ROOT = mkdtempSync(join(tmpdir(), "anchordrift-suite-"));
const put = (rel, body) => { mkdirSync(dirname(join(ROOT, rel)), { recursive: true }); writeFileSync(join(ROOT, rel), body); };
for (const f of ["anchortable.mjs", "anchordry.mjs"]) {
  mkdirSync(join(ROOT, "bio-plane/scripts"), { recursive: true });
  copyFileSync(join(REPO, "bio-plane/scripts", f), join(ROOT, "bio-plane/scripts", f));
}
put("bio-plane/src/subject.mjs", [
  "export const ONE = 1;",
  "  if (twice) return;",
  "  if (twice) return;",
  "export const CHAIN_A = 'a';",
  "export function f(x) { return x + 1; }",
  ""].join("\n"));
const SUBJ = join(ROOT, "bio-plane/src/subject.mjs");
const HEAD = 'import { join, dirname } from "node:path";\nimport { fileURLToPath } from "node:url";\n'
  + 'import { anchorTable, anchorEach, anchorPatch, ANCHOR_DRY } from "../scripts/anchortable.mjs";\n'
  + 'const SUBJ = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "subject.mjs");\n';
const TAIL = 'throw new Error("ARMED FOR REAL: the reader let this driver run past its table");\n';
const D = (name, body) => put(`bio-plane/test/${name}`, HEAD + body + TAIL);

D("live.control.mjs", 'const ARMS = { a: [["export const ONE = 1;", "export const ONE = 2;"]] };\n'
  + 'anchorTable(Object.entries(ARMS).flatMap(([arm, ps]) => ps.map(([find, put]) => ({ arm, file: SUBJ, find, put }))));\n');
D("drift0.control.mjs", 'anchorTable([{ arm: "gone", file: SUBJ, find: "export const ONE = 3;" }, { arm: "fine", file: SUBJ, find: "export const ONE = 1;" }]);\n');
D("double.control.mjs", 'anchorTable([{ arm: "twice", file: SUBJ, find: "  if (twice) return;" }]);\n');
D("any.control.mjs", 'anchorTable([{ arm: "all", file: SUBJ, find: "  if (twice) return;", sites: "any" }, { arm: "two", file: SUBJ, find: "  if (twice) return;", sites: 2 }]);\n');
D("chain.control.mjs", 'anchorTable([{ arm: "c", file: SUBJ, find: "CHAIN_A = \'a\'", put: "CHAIN_A = \'b\'" }, { arm: "c", file: SUBJ, find: "CHAIN_A = \'b\'" }]);\n');
D("regex.control.mjs", 'anchorTable([{ arm: "re", file: SUBJ, find: /return x \\+ \\d;/ }, { arm: "re0", file: SUBJ, find: /return y/ }]);\n');
D("closure.control.mjs", 'function patch(file, find, to) { if (ANCHOR_DRY) return (anchorPatch(file, find, to), true); throw new Error("armed"); }\n'
  + 'const ARMS = { k: { go: () => patch(SUBJ, "export function f(x)", "export function f(y)") } };\nanchorEach(ARMS, (a) => a.go());\n');
D("none.control.mjs", 'anchorTable([{ arm: "fixture", none: "patches a fixture it composes" }, { arm: "a", file: SUBJ, find: "export const ONE = 1;" }]);\n');
D("empty.control.mjs", "anchorTable([]);\n");
D("notable.control.mjs", "const x = 1;\n");
const WROTE = join(ROOT, "bio-plane/src/WRITTEN-BY-SIDE.txt");
D("side.control.mjs", `import { writeFileSync as w } from "node:fs";\nw(${JSON.stringify(WROTE)}, "armed");\nanchorTable([{ arm: "a", file: SUBJ, find: "export const ONE = 1;" }]);\n`);
D("spawn.control.mjs", 'import { spawnSync } from "node:child_process";\nspawnSync(process.execPath, ["-e", "1"]);\nanchorTable([{ arm: "a", file: SUBJ, find: "export const ONE = 1;" }]);\n');
D("pen.control.mjs", 'import { mkdtempSync, writeFileSync as w, readFileSync } from "node:fs";\nimport { tmpdir } from "node:os";\n'
  + 'const pen = mkdtempSync(join(tmpdir(), "nc-pen-"));\nw(join(pen, "pristine"), readFileSync(SUBJ));\nanchorTable([{ arm: "a", file: SUBJ, find: "export const ONE = 1;" }]);\n');
D("nc-class.mjs", 'anchorTable([{ arm: "a", file: SUBJ, find: "export const ONE = 1;" }]);\n');
put("bio-plane/test/nc-class.probe.mjs", "console.log('a probe is not a driver');\n");
put("tools/x-controls.mjs", HEAD.replace("../scripts/", "../bio-plane/scripts/").replace('"..", "src"', '"..", "bio-plane", "src"')
  + 'anchorTable([{ arm: "a", file: SUBJ, find: "export const ONE = 1;" }]);\n');

/* ---- (e) enumeration ---------------------------------------------------------------------------------- */
console.log("\n(e) the class: *.control.mjs, *-controls.mjs, nc-*.mjs — a .probe.mjs is not a driver");
const list = drivers(ROOT);
t("(e1) 15 fixture drivers found, the nc- class and a tools/*-controls.mjs among them", [list.length, list.includes("bio-plane/test/nc-class.mjs"), list.includes("tools/x-controls.mjs")], [15, true, true]);
t("(e2) the probe is NOT enrolled", list.includes("bio-plane/test/nc-class.probe.mjs"), false);

/* ---- (c) counting, pure --------------------------------------------------------------------------------- */
console.log("\n(c) counting");
t("(c1) a string anchor is counted, every occurrence", count("a b a", "a"), 2);
t("(c2) a RegExp anchor is counted with the global flag added", count("x1 x2", { re: "x\\d", flags: "" }), 2);
t("(c3) an EMPTY anchor is -1 (unanswerable), never a count", count("abc", ""), -1);
t("(c4) chained rows: a later anchor is counted against the earlier arm's PUT, in memory",
  judge(ROOT, "d", [{ arm: "c", file: SUBJ, find: "ONE = 1", put: "ONE = 9", sites: 1 }, { arm: "c", file: SUBJ, find: "ONE = 9", sites: 1 }]).map((r) => r.state), ["LIVE", "LIVE"]);
t("(c5) ...and the subject on disk is UNCHANGED by the judging", readFileSync(SUBJ, "utf8").includes("export const ONE = 1;"), true);

/* ---- (r) the estate read, no allowances -------------------------------------------------------------------- */
console.log("\n(r) the reader over the scratch estate, no allowance file");
const res = await run({ root: ROOT, allowFile: join(ROOT, "no-such.json") });
const f = (frag) => res.failures.filter((x) => x.includes(frag));
const U = (d) => res.unreadable.find((u) => u.driver === `bio-plane/test/${d}`);
console.log(`  ${res.drivers} drivers · ${res.readable} readable · ${res.rows.length} rows · ${res.failures.length} failures`);
t("(r1) ZERO matches FAILS naming driver AND arm", f("drift0.control.mjs · arm gone").length === 1 && f("drift0.control.mjs · arm gone")[0].includes("matches 0 times"), true);
t("(r2) ...and only that arm: its sibling arm is LIVE", res.rows.find((r) => r.driver.endsWith("drift0.control.mjs") && r.arm === "fine").state, "LIVE");
t("(r3) TWO matches where the arm edits ONE site FAILS naming driver and arm", f("double.control.mjs · arm twice")[0]?.includes("matches 2 times where the arm edits ONE site"), true);
t("(r4) OVER-STRICTNESS: sites \"any\" and sites 2 over the same two matches are LIVE", res.rows.filter((r) => r.driver.endsWith("any.control.mjs")).map((r) => r.state), ["LIVE", "LIVE"]);
t("(r5) OVER-STRICTNESS: a chained second anchor that exists only after the first PUT is LIVE", res.rows.filter((r) => r.driver.endsWith("chain.control.mjs")).map((r) => r.state), ["LIVE", "LIVE"]);
t("(r6) a RegExp anchor is judged: one LIVE, one DRIFT by name", [res.rows.find((r) => r.driver.endsWith("regex.control.mjs") && r.arm === "re").state, f("regex.control.mjs · arm re0").length], ["LIVE", 1]);
t("(r7) a CLOSURE driver's anchors are read from its arms through anchorEach, under the arm's name", res.rows.filter((r) => r.driver.endsWith("closure.control.mjs")).map((r) => [r.arm, r.state]), [["k", "LIVE"]]);
t("(r8) an arm anchored in no tree file is NAMED with its reason, not counted", res.noTree.map((r) => [r.arm, r.why]), [["fixture", "patches a fixture it composes"]]);
t("(r9) a driver with NO table is UNREADABLE and FAILS by name", [!!U("notable.control.mjs"), f("UNREADABLE  bio-plane/test/notable.control.mjs").length], [true, 1]);
t("(r10) an EMPTY table is UNREADABLE, never a clean driver", U("empty.control.mjs")?.unreadable, "its anchor table is EMPTY");
t("(u1) a pen made in $TMPDIR before the table is allowed: the driver is READABLE", !U("pen.control.mjs") && res.rows.some((r) => r.driver.endsWith("pen.control.mjs")), true);
t("(u2) A WRITE BEFORE THE TABLE: UNREADABLE naming the trapped call", U("side.control.mjs")?.unreadable, "a side effect (fs.writeFileSync) runs BEFORE its anchorTable() call");
t("(u3) ...AND THE WRITE DID NOT LAND — the reader never arms", existsSync(WROTE), false);
t("(u4) A SPAWN BEFORE THE TABLE: UNREADABLE naming the trapped call", U("spawn.control.mjs")?.unreadable, "a side effect (child_process.spawnSync) runs BEFORE its anchorTable() call");
t("(u5) the reach: 15 drivers, 11 READABLE, the 4 unreadable ones each NAMED", [res.drivers, res.readable, res.unreadable.length], [15, 11, 4]);
t("(r11) the verdict: RED, and every failure is one of the planted ones (7)", res.failures.length, 7);

/* ---- (a) allowances ------------------------------------------------------------------------------------ */
console.log("\n(a) the dated allowance file");
put("tools/anchordrift.json", JSON.stringify({
  allowances: [
    { driver: "bio-plane/test/drift0.control.mjs", arm: "gone", anchor: "export const ONE = 3", row: "D-900", since: "2026-09-25", why: "fixture" },
    { driver: "bio-plane/test/double.control.mjs", arm: "twice", anchor: "SOME OTHER ANCHOR", row: "D-901", since: "2026-09-25", why: "fixture" },
    { driver: "bio-plane/test/live.control.mjs", arm: "a", anchor: "export const ONE", row: "D-902", since: "2026-09-25", why: "fixture" },
  ],
  unreadable: { row: "D-903", since: "2026-09-25", drivers: ["bio-plane/test/notable.control.mjs", "bio-plane/test/empty.control.mjs",
    "bio-plane/test/side.control.mjs", "bio-plane/test/spawn.control.mjs", "bio-plane/test/live.control.mjs"],
    inflight: [{ driver: "bio-plane/test/elsewhere.control.mjs", branch: "land/worker/X-1" }] },
}));
const a = await run({ root: ROOT });
const af = (frag) => a.failures.filter((x) => x.includes(frag));
t("(a1) an allowance keyed on the drifted anchor FORGIVES it, and it prints ALLOWED with its row",
  [af("drift0.control.mjs · arm gone").length, a.allowed.map((x) => [x.arm, x.row])], [0, [["gone", "D-900"]]]);
t("(a2) an allowance for the same arm keyed on ANOTHER anchor forgives NOTHING — a new drift still fails", af("double.control.mjs · arm twice").length, 1);
t("(a3) an allowance forgiving no drift (D-902: its drift is gone; D-901: the wrong anchor) is STALE: said, not failed", [a.stale.map((x) => x.row), af("D-902").length], [["D-901", "D-902"], 0]);
t("(a4) a listed UNREADABLE driver is NAMED but does not fail", [a.unreadable.some((u) => u.driver.endsWith("notable.control.mjs")), af("notable.control.mjs").length], [true, 0]);
t("(a5) a listed driver that is now READABLE FAILS as stale, so the list only shrinks", af("STALE UNREADABLE bio-plane/test/live.control.mjs").length, 1);
t("(a6) an IN-FLIGHT driver absent from the tree is a note, not a failure", [a.pending.map((p) => p.branch), af("elsewhere").length], [["land/worker/X-1"], 0]);
t("(a7) the rest: re0, twice, and the stale list entry", a.failures.length, 3);

rmSync(ROOT, { recursive: true, force: true });   /* the scratch estate is this suite's; the battery fences residue */
console.log(`\nanchordrift: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
