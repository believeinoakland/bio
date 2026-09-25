/* rulemap.test — a kickoff cut to one line per rule keeps every rule and every ruling (M0-194, BOB #34 2026-09-24 22:50Z).
 *
 * The subject is `tools/rulemap.mjs` over the live map (`measurements/M-147.md`), the live `kickoffs/WORKER.md` and its
 * archive. Every arm breaks ONE input IN MEMORY, so nothing on disk is touched and nothing needs restoring.
 * Declared before arming: the live inputs MUST pass with nothing missing; dropping one mapped line MUST name its R and W;
 * deleting one anchor from the archive MUST name its R; a ruling no longer found MUST be named; an anchor re-wrapped
 * across lines (the old text's own wrapping) MUST NOT be reported (over-strictness).
 *
 * NEGATIVE CONTROL: RUN 2026-09-24 by the M0-194 worker, ON DISK, one line of WORKER.md deleted per arm:
 *   (a) W12 (R12) deleted -> `node tools/rulemap.mjs` exit 1 printing exactly `MISSING  LINE NOT IN KICKOFF  R12 -> W12
 *       Your environment`; this suite 9 pass / 2 fail, at "the live map is complete" and "...79 old rules onto 80 lines";
 *   (b) W44 (R43) deleted -> the tool names exactly `R43 -> W44`; this suite 7 pass / 4 fail, the same two plus section 2,
 *       which drops W44 itself and so cannot arm ("the arm armed" FAILS, as it must).
 *   Each restored by cp from a per-item scratchpad copy (11,934 B), sha256 b1980453… and `cmp` identical; 11 pass after.
 *   A first run of (b), before `added()`, failed 7 assertions: arms 3-5 compared against an empty baseline, so one live
 *   defect failed every arm. Fixed before recording.
 */
import "./stdio.mjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { check, parseMap, DEFAULTS, ROOT } from "../../tools/rulemap.mjs";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n      got ${JSON.stringify(got)}\n     want ${JSON.stringify(want)}`}`);
};
const rd = (p) => readFileSync(join(ROOT, p), "utf8");
const live = { mapText: rd(DEFAULTS.map), currentText: rd(DEFAULTS.current), archiveText: rd(DEFAULTS.archive) };
const { rules, rulings } = parseMap(live.mapText);
/* Each arm is judged by what it ADDS to the live result, so a live defect is reported once, in section 1, and does not
   bleed into every arm (the first control run failed 7 assertions for one dropped line). */
const base = new Set(check(live).missing.map((m) => JSON.stringify(m)));
const added = (r) => r.missing.filter((m) => !base.has(JSON.stringify(m)));

console.log("1 — the live map, kickoff and archive");
{
  /* The corpus is floored: a map that parsed to nothing would pass every arm below for free. */
  t("the map parses to 84 rule rows and 33 rulings", [rules.length, rulings.length], [84, 33]);
  const r = check(live);
  t("the live map is complete", r.missing, []);
  t("...79 old rules onto 84 lines", [r.oldRules, r.lines], [79, 84]);
}
console.log("2 — dropping one mapped line is NAMED");
{
  const cur = live.currentText.split("\n").filter((l) => !l.startsWith("- **W44** ·")).join("\n");
  t("the arm armed (one line fewer)", live.currentText.split("\n").length - cur.split("\n").length, 1);
  const r = check({ ...live, currentText: cur });
  t("exactly R43 -> W44 is named", added(r).map((m) => [m.kind, m.r, m.w]), [["LINE NOT IN KICKOFF", "R43", "W44"]]);
}
console.log("3 — an anchor missing from the archive is NAMED (nothing may be deleted)");
{
  const x = rules.find((y) => y.r === "R14");
  const arch = live.archiveText.replace(x.anchor, "");
  t("the arm armed", arch.length < live.archiveText.length, true);
  t("exactly R14 is named", added(check({ ...live, archiveText: arch })).map((m) => [m.kind, m.r]), [["ANCHOR NOT IN ARCHIVE", "R14"]]);
}
console.log("4 — a line with no map row, and a ruling decided.mjs no longer finds, are NAMED");
{
  const r = check({ ...live, currentText: live.currentText + "\n- **W999** · an unmapped rule\n" });
  t("an unmapped line is named", added(r).map((m) => [m.kind, m.w]), [["LINE NOT IN MAP", "W999"]]);
  const g = check({ ...live, found: (id) => (id === "D-288" ? 0 : 1) });
  t("a lost ruling is named", added(g).map((m) => [m.kind, m.what]), [["RULING NO LONGER FOUND", "D-288"]]);
}
console.log("5 — over-strictness: an anchor re-wrapped across lines still matches");
{
  const x = rules.find((y) => y.r === "R7");        /* on ONE line in the archive, so the arm can re-wrap it */
  const arch = live.archiveText.replace(x.anchor, x.anchor.split(" ").join("\n  "));
  t("the arm armed (the anchor is no longer on one line)", arch !== live.archiveText && !arch.includes(x.anchor), true);
  t("the re-wrapped archive adds nothing missing", added(check({ ...live, archiveText: arch })), []);
}
console.log(`\nrulemap: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
