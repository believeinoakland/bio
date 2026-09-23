/* GATE: never-cache (history) — M0-126, BOB #30 (TREE-SHARING §3a condition 1): its verdict reads the handoffs (`*-NEXT.md`) on `coord` through the coord layer, which no
   result key can name; traced 2026-09-23. M0-136 (2026-09-23): it no longer reads the LIVE `origin/coord` — the coord state
   is read at `COORD_PIN` (`./coordpin.mjs`, named there with its why and its cost), and a planted-ref arm below proves the
   verdict identical whatever `origin/coord` holds.
   NEGATIVE CONTROL (M0-136, RUN 2026-09-23 by the M0-136 worker): `node bio-plane/test/coordpin.control.mjs readbudget` —
   this suite pointed back at the live `origin/coord` (arm L1, one line after the pin's import) -> exactly two FAILs,
   "…reads the PINNED coord commit, never a ref name" and "…is IDENTICAL whatever origin/coord holds", 14 pass / 2 fail, exit 1;
   the pin spelled out in the suite instead (S0, over-strictness) PASSES; each restored, sha256 and `cmp` identical. */
/* readbudget.test — the reading budget (`CLAUDE.md` §1; Bob, 2026-09-18).
 *
 * NEGATIVE CONTROL: RUN 2026-09-18 by BOB #15, both arms ON THE SUBJECT'S INPUTS rather than by editing
 * the tool, so nothing on disk needs restoring: (a) a budget set BELOW a file's size -> the file must be
 * NAMED with its byte count; (b) the same over-budget file marked CUT -> its verdict must be FAIL, and
 * unmarked it must be WARN. Break the tool instead (make `check` return []) and sections 1, 2 and 4 fail.
 * RUN 2026-09-19 by BOB #16 on the budget-key fix: `check` put back to recomputing the budget from the filename
 * -> exactly "...and check() judges it at that budget, not the kickoff's" FAILS (11 pass, 1 fail); restored by cp,
 * verified by sha256 (0d520d6f6e1ab758 before and after), 12 pass.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { check, readSet, BUDGET, CUT, ROOT } from "../../tools/readbudget.mjs";
import { plantedCoord, assertPlanted, REPO as PIN_REPO } from "./coordpin.mjs";   /* M0-136: coord read at a PINNED commit */

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n      got ${JSON.stringify(got)}\n     want ${JSON.stringify(want)}`}`);
};

const root = mkdtempSync(join(tmpdir(), "readbudget-"));
const kd = join(root, "docs/development/kickoffs");
mkdirSync(kd, { recursive: true });
writeFileSync(join(root, "CLAUDE.md"), "x".repeat(1000));
writeFileSync(join(kd, "LANE.md"), "x".repeat(3000));
writeFileSync(join(kd, "LANE-NEXT.md"), "x".repeat(500));
writeFileSync(join(kd, "README.md"), "x".repeat(99999));
const small = { "CLAUDE.md": 2000, kickoff: 2000, next: 2000 };

console.log("1 — an over-budget kickoff is NAMED, with its size");
{
  const o = check(root, { budget: small, cut: new Set() });
  t("exactly one file is over", o.map((x) => x.file), ["docs/development/kickoffs/LANE.md"]);
  t("...with its measured bytes and budget", [o[0].bytes, o[0].budget], [3000, 2000]);
  t("...and it WARNs while its cut has not landed", o[0].verdict, "WARN");
}
console.log("2 — a file past its cut FAILS when it grows back");
{
  const o = check(root, { budget: small, cut: new Set(["docs/development/kickoffs/LANE.md"]) });
  t("the cut file's verdict is FAIL", o[0].verdict, "FAIL");
}
console.log("3 — what is in the read-whole set, and what is not");
{
  const files = readSet(root).map((r) => r.file);
  t("CLAUDE.md, the kickoff and its -NEXT are read whole", files,
    ["CLAUDE.md", "docs/development/kickoffs/LANE-NEXT.md", "docs/development/kickoffs/LANE.md"]);
  t("README.md (the kickoff index) is not a lane's reading", files.includes("docs/development/kickoffs/README.md"), false);
  t("a -NEXT handoff gets the handoff budget", readSet(root).find((r) => r.file.endsWith("-NEXT.md")).budget, BUDGET.next);
}
console.log("4 — the budgets, declared once, and the live CLAUDE.md is inside its own");
{
  /* CORRECTED 2026-09-19 (BOB #16): the construct map joined the read set with its own budget, so the declared table
     gained `map`; the old assertion pinned three keys because there were three classes then, not because a fourth
     was wrong. */
  t("the budgets", BUDGET, { "CLAUDE.md": 16384, kickoff: 24576, next: 12288, map: 49152 });
  t("the construct map is read whole, at its own budget", readSet(ROOT).find((r) => r.file === "docs/architecture/BIO_System_Design.md")?.budget, BUDGET.map);
  t("...and check() judges it at that budget, not the kickoff's", check(ROOT).some((o) => o.file === "docs/architecture/BIO_System_Design.md"), false);
  t("CLAUDE.md is marked CUT", CUT.has("CLAUDE.md"), true);
  t("the live CLAUDE.md is NOT over its budget", check(ROOT).some((o) => o.file === "CLAUDE.md"), false);
}
console.log("5 — M0-136: the coord reads are at the PINNED commit, and the verdict does not move with origin/coord");
{
  /* §4's `check(ROOT)` and `readSet(ROOT)` list and measure the handoffs on `coord`, which until M0-136 was the LIVE `origin/coord`: a lane's over-long handoff changed this suite's input with `main` unmoved. The probe is that call; the planted commit grows BOB-NEXT.md past its budget, which `check` names when it reads it. */
  const p = plantedCoord({
    probe: `const { check, readSet, ROOT } = await import(${JSON.stringify(PIN_REPO + "/tools/readbudget.mjs")});\nconsole.log(JSON.stringify({ over: check(ROOT), set: readSet(ROOT).map((r) => r.file) }));`,
    plant: { "docs/development/kickoffs/BOB-NEXT.md": "planted by M0-136: a handoff past its budget\n" + "x".repeat(40000) } });
  assertPlanted(t, "readbudget", p);
}

rmSync(root, { recursive: true, force: true });
console.log(`\nreadbudget: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
