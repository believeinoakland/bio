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
 * RUN 2026-09-24 by the M0-194 worker on the word budget: `check`'s word test disarmed (`if (n > w)` -> `if (false)`) ->
 * exactly "three words over a budget of 2 are NAMED, in words" and "...and FAIL, the file being CUT" FAIL (20 pass,
 * 2 fail); restored by cp, sha256 30784e3530062b12 and `cmp` identical, 22 pass.
 * RUN 2026-09-24 by the M0-194 worker on the word COUNTER: `wordCount` put back to a plain whitespace split -> exactly
 * "a word is counted as `wc -w` counts it…" and "the live WORKER.md is inside its word budget" FAIL (21 pass, 2 fail;
 * the split read the live file at 2,004 words where `wc -w` reads 1,899); restored by cp, sha256 1acd186890c551a8 and
 * `cmp` identical, 23 pass.
 * RUN 2026-09-25 by the M0-172 worker on `describe`: its words branch disarmed (`o.unit === "words" ?` -> `false ?`)
 * -> exactly "a word overrun is DESCRIBED in words, never as `undefined B`" FAILS (25 pass, 1 fail); restored by cp,
 * sha256 5d00b0dcc07609e7 and `cmp` identical, 26 pass.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { check, readSet, BUDGET, CUT, ROOT, WORD_BUDGET, wordCount, describe } from "../../tools/readbudget.mjs";
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
  /* CORRECTED 2026-09-24 by c19-unionfix, map 49152 -> 51200, on BOB #32 2026-09-24 02:10Z ruling (a): STOPGAP until (b) — status.mjs renders each cell's first sentence capped at a word boundary with '…'; BOB builds (b) and lowers the budget back to 49,152 B. */
  /* CORRECTED BACK 2026-09-24 by BOB #32: (b) landed (status.mjs CELL_CAP), so the stopgap 51200 returns to 49152. */
  /* CORRECTED 2026-09-25 by BOB #34: map 49152 -> 53248. The map grows by a capped cell per BUILT construct, and c21-batch28 read 50,427 B; the old pin would block every train that finishes work. */
  t("the budgets", BUDGET, { "CLAUDE.md": 16384, kickoff: 24576, next: 12288, map: 53248 });
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

console.log("6 — M0-194: a WORD budget for one file (BOB #34 2026-09-24 22:50Z: WORKER.md at half its 3,959 words)");
{
  /* Arms on the INPUTS, as sections 1-2: the fixture kickoff is 3,000 bytes of ONE word, so a word budget of 1 must NOT
     name it (the over-strictness arm), and 3 words over a budget of 2 must, in words, FAIL once CUT. */
  const wk = "docs/development/kickoffs/LANE.md";
  const big = { ...small, kickoff: 99999 };
  t("one word under a word budget of 1 is NOT over (bytes are not words)",
    check(root, { budget: big, cut: new Set(), words: { [wk]: 1 } }), []);
  writeFileSync(join(kd, "LANE.md"), "one two three");
  const o = check(root, { budget: big, cut: new Set([wk]), words: { [wk]: 2 } });
  t("three words over a budget of 2 are NAMED, in words", o.map((x) => [x.file, x.unit, x.words, x.budget]), [[wk, "words", 3, 2]]);
  t("...and FAIL, the file being CUT", o[0]?.verdict, "FAIL");
  /* M0-172: plancheck spelled every overrun in bytes, so this one printed "undefined B against 2 B". */
  t("a word overrun is DESCRIBED in words, never as `undefined B`", describe(o[0]), `${wk} is 3 words against 2 words`);
  t("a byte overrun is described in bytes", describe({ file: "x.md", bytes: 9, budget: 8 }), "x.md is 9 B against 8 B");
  t("plancheck's READING BUDGET line is spelled by `describe`, not by a second template",
    /READING BUDGET — \$\{R\.describe\(o\)\}/.test(readFileSync(join(ROOT, "tools/plancheck.mjs"), "utf8")), true);
  t("a word is counted as `wc -w` counts it: a lone `·` or `→` is not one, `a·b` and `—x` are", wordCount("a · b → c a·b —x"), 5);
  t("the declared word budget is half of 3,959, on WORKER.md", WORD_BUDGET, { "docs/development/kickoffs/WORKER.md": 1979 });
  t("WORKER.md is marked CUT", CUT.has("docs/development/kickoffs/WORKER.md"), true);
  t("the live WORKER.md is inside its word budget", check(ROOT).some((x) => x.file === "docs/development/kickoffs/WORKER.md"), false);
}

rmSync(root, { recursive: true, force: true });
console.log(`\nreadbudget: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
