#!/usr/bin/env node
/* M0-30's NEGATIVE CONTROL DRIVER — five arms plus a baseline — over the §4.7 row-design
 * check in `tools/rowdesign.mjs`, its arm in `tools/plancheck.mjs` and its suite arm in
 * `test/planning-hygiene.test.mjs`.
 *
 *   node bio-plane/test/rowdesign.control.mjs        (from the repo root)
 *
 * COMMITTED so the next session re-runs it in ONE step instead of re-deriving how to break
 * the subject. Every arm is armed ALONE with the others held open, against a UNIQUELY-NAMED
 * pristine copy in this worktree's own pen (`.m030-harness/`, never a shared scratchpad), and
 * every restore is verified by sha256 AND by `cmp` AND by a floored byte count — because
 * `git checkout --` restores to HEAD, which in a tree with uncommitted work is "throw mine
 * away" and exits 0 either way (CLAUDE.md, measured twice in two days).
 *
 * THE BASELINE ROW IS NOT DECORATION. A harness once reported `null` for every arm including
 * the baseline, and only the baseline row distinguished six-arms-broken from six-arms-working.
 *
 * The arms, each with what MUST fail and what MUST NOT, declared before arming:
 *   A1  remove one open row's `design:` line          -> plancheck FAILS naming THAT row, and
 *                                                        no other row is named.
 *   A2  replace that row's pointer with a ROUTED GAP  -> plancheck passes (an admitted gap is
 *                                                        honest). Over-strictness.
 *   A2b a `done` row carrying no pointer              -> NOT JUDGED. Over-strictness.
 *   A3  delete the arm from `plancheck.mjs`           -> the SUITE fails by name ("plancheck
 *                                                        RUNS the row-design check").
 *   A4  plant a row in CORPUS-STANDARD.md §5's table  -> a row naming the planted path passes,
 *                                                        and FAILS again once the plant is
 *                                                        gone. The governed set is the TABLE's.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PEN = join(REPO, ".m030-harness");
const QUEUE = join(REPO, "docs/development/QUEUE.md");
const PLANCHECK = join(REPO, "tools/plancheck.mjs");
const STANDARD = join(REPO, "docs/architecture/CORPUS-STANDARD.md");
const SUITE = join(REPO, "bio-plane/test/planning-hygiene.test.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

mkdirSync(PEN, { recursive: true });
/* One uniquely-named pristine copy per armed file, taken ONCE, before anything is armed. */
const pristine = new Map();
for (const [name, p] of [["queue", QUEUE], ["plancheck", PLANCHECK], ["standard", STANDARD]]) {
  const copy = join(PEN, `pristine.${name}`);
  writeFileSync(copy, readFileSync(p));
  pristine.set(p, { copy, sha: sha(p), bytes: statSync(p).size });
  console.log(`  pristine ${name}: ${statSync(p).size} bytes, sha256 ${sha(p).slice(0, 8)}…`);
}
const MIN_BYTES = { [QUEUE]: 100000, [PLANCHECK]: 15000, [STANDARD]: 10000 };
function restore(p) {
  const { copy, sha: want, bytes } = pristine.get(p);
  writeFileSync(p, readFileSync(copy));
  const got = sha(p), size = statSync(p).size;
  const cmp = spawnSync("cmp", ["-s", p, copy]).status === 0;
  const ok = got === want && cmp && size === bytes && size >= MIN_BYTES[p];
  console.log(`  restored ${p.slice(REPO.length + 1)}: ${size} bytes, sha256 ${got.slice(0, 8)}…, `
    + `cmp ${cmp ? "identical" : "DIFFERS"} — byte-identical: ${ok ? "YES" : "NO"}`);
  return ok;
}

const plancheck = () => {
  const r = spawnSync(process.execPath, [PLANCHECK, "--local"], { cwd: REPO, encoding: "utf8" });
  const out = r.stdout || "";
  const m = out.match(/ROW NAMES NO DESIGN[\s\S]*?§4\.7/);
  return { out, named: [...(m ? m[0] : "").matchAll(/^\s+([A-Z][A-Z0-9]*-\d+) \((queued|running)/gm)].map((x) => x[1]) };
};
const suiteRun = () => {
  const r = spawnSync(process.execPath, [SUITE], { cwd: REPO, encoding: "utf8" });
  const out = r.stdout || "";
  const tally = out.match(/planning-hygiene: (\d+) pass, (\d+) fail/);
  return { out, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1,
           reachedFoot: !!tally, status: r.status };
};

/* --------------------------------------------------------------- BASELINE */
console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const p = plancheck();
  t("baseline · plancheck names NO row", p.named, []);
  const s = suiteRun();
  t("baseline · the suite reached its own FOOT (a TypeError inside an assertion ends the "
  + "module with the tally reading clean)", s.reachedFoot, true);
  t("baseline · the suite is green", [s.pass > 250, s.fail], [true, 0]);
  console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail`);
}

/* ------------------------------------------------- A1 · the arm this item exists for */
console.log("\n--- ARM A1 · one open row's `design:` line REMOVED (armed ALONE) ---");
{
  const before = readFileSync(QUEUE, "utf8");
  const line = before.split("\n").find((l) => /^design: `docs\/development\/VERIFICATION\.md` §"A THROWING/.test(l));
  t("A1 · the arm ARMED (the pointer line was found — an arm that did not arm is a finding)",
    typeof line === "string" && line.length > 40, true);
  writeFileSync(QUEUE, before.replace(line + "\n", ""));
  const p = plancheck();
  t("A1 · plancheck FAILS naming M0-30's swept row M0-29, and ONLY it", p.named, ["M0-29"]);
  t("A1 · the failure carries §4.7's own sentence, not a paraphrase",
    /A queue row names the design it builds from/.test(p.out), true);
  t("A1 · RESTORED byte-identically", restore(QUEUE), true);
}

/* ---------------------------------------------- A2 · over-strictness, the routed gap */
console.log("\n--- ARM A2 · the same row's pointer replaced by an EXPLICIT ROUTED GAP (armed ALONE) ---");
{
  const before = readFileSync(QUEUE, "utf8");
  const line = before.split("\n").find((l) => /^design: `docs\/development\/VERIFICATION\.md` §"A THROWING/.test(l));
  const routed = "design: MISSING — routed to BOB (CLAIMS.md DELEGATION 2026-09-14 M0 (M0-30) -> BOB)";
  t("A2 · the arm ARMED", typeof line === "string", true);
  writeFileSync(QUEUE, before.replace(line, routed));
  const p = plancheck();
  t("A2 · an admitted gap PASSES — no row is named", p.named, []);
  t("A2 · and plancheck REPORTS the routing rather than swallowing it",
    /\d+ explicitly ROUTED as a missing design/.test(p.out), true);
  t("A2 · RESTORED byte-identically", restore(QUEUE), true);
}

/* -------------------------------------- A2b · over-strictness, a closed row is not judged */
console.log("\n--- ARM A2b · a `done` row with no pointer (nothing armed — the live state) ---");
{
  const { rowDesignAudit } = await import(join(REPO, "tools/rowdesign.mjs"));
  const a = rowDesignAudit({ repo: REPO });
  const noPointer = a.skipped.filter((r) => !r.body.some((l) => /^design:/.test(l)));
  t("A2b · the live queue HAS closed rows carrying no pointer (else this arm is vacuous)",
    noPointer.length >= 50, true);
  t("A2b · not one of them is judged, and none appears in the findings",
    a.findings.filter((f) => noPointer.some((r) => r.id === f.id)), []);
  console.log(`  ${noPointer.length} closed row(s) carry no \`design:\` line and none is judged`);
}

/* ----------------------------------------------------- A3 · the arm's own arm */
console.log("\n--- ARM A3 · the check DELETED from plancheck.mjs (armed ALONE) ---");
{
  const before = readFileSync(PLANCHECK, "utf8");
  const start = before.indexOf("/* ------------------------------------------- 7. A ROW NAMES THE DESIGN");
  const end = before.indexOf("/* ------------------------------------------------------------- report */");
  t("A3 · the arm ARMED (both anchors found, exactly once each)",
    [start > 0, end > start, before.split("7. A ROW NAMES THE DESIGN").length], [true, true, 2]);
  writeFileSync(PLANCHECK, before.slice(0, start) + before.slice(end));
  t("A3 · plancheck no longer reports the check", /queue design pointers:/.test(plancheck().out), false);
  const s = suiteRun();
  t("A3 · the SUITE goes red, and by NAME", [s.fail >= 1, /FAIL  plancheck RUNS the row-design check/.test(s.out)],
    [true, true]);
  console.log(`  armed suite: ${s.pass} pass, ${s.fail} fail`);
  t("A3 · RESTORED byte-identically", restore(PLANCHECK), true);
}

/* -------------------------- A4 · the governed set is §5's TABLE, read, not a list */
console.log("\n--- ARM A4 · a row PLANTED in CORPUS-STANDARD.md §5's governed table (armed ALONE) ---");
{
  const PLANTED = "docs/development/M030-PLANTED-DESIGN.md";
  const FIX = [`### ZZ-99 · queued — a row naming the planted document`, `milestone: M8`,
               `design: \`${PLANTED}\` §1`, ``].join("\n");
  /* Imported FRESH per reading, because `governed()` reads the file at call time and the
     module is cached — the audit takes no snapshot, which is what makes this arm possible. */
  const { rowDesignAudit } = await import(join(REPO, "tools/rowdesign.mjs"));
  t("A4 · BEFORE the plant, the row FAILS", rowDesignAudit({ repo: REPO, queue: FIX }).findings.map((f) => f.id), ["ZZ-99"]);

  const before = readFileSync(STANDARD, "utf8");
  const anchor = "| `docs/development/ASSISTANT-PILOT.md` |";
  t("A4 · the arm ARMED (the table anchor occurs exactly once)",
    before.split(anchor).length, 2);
  writeFileSync(STANDARD, before.replace(anchor,
    `| \`${PLANTED}\` | 2 | planted by rowdesign.control.mjs | 2026-09-14 |\n${anchor}`));
  t("A4 · WITH the plant in §5's table, the SAME row passes — the table decides, not a list",
    rowDesignAudit({ repo: REPO, queue: FIX }).findings, []);
  t("A4 · RESTORED byte-identically", restore(STANDARD), true);
  t("A4 · and after the restore the row FAILS again", rowDesignAudit({ repo: REPO, queue: FIX }).findings.map((f) => f.id), ["ZZ-99"]);
}

/* ------------------------------------------------------------ final restore check */
console.log("\n--- every armed file, after every arm ---");
for (const [p, { sha: want }] of pristine)
  t(`${p.slice(REPO.length + 1)} is pristine at the end`, sha(p), want);

/* THE COPIES go on a clean run, and ONLY the copies — never the pen directory.
   **MEASURED, ON THIS DRIVER'S OWN SECOND RUN, and it is the sharpest finding of the item:**
   the first spelling was `rmSync(PEN, { recursive: true })`, and the pen also held this
   session's BASELINE — a `git worktree add .m030-harness/baseline` checkout, plus every saved
   battery, `--strict` and gates log the item quotes. One clean run deleted all of it and left
   a PRUNABLE worktree registration in the shared `.git`, with exit 0 and a cheerful "pen
   removed". Nothing was lost that could not be re-measured and `git worktree prune` cleared
   the registration, but the shape is exactly this estate's `git checkout --` receipt in a new
   costume: a cleanup that owns a DIRECTORY rather than its own FILES throws away whatever
   somebody else parked there. A driver removes what it wrote. A red run keeps the copies,
   because then they are evidence. */
if (!fail) {
  for (const { copy } of pristine.values()) rmSync(copy, { force: true });
  console.log(`  ${pristine.size} pristine copy/copies removed (clean run); the pen itself is left alone`);
} else console.log(`  pristine copies KEPT in .m030-harness/ — a red run's copies are evidence`);

console.log(`\nrowdesign.control: ${pass} pass, ${fail} fail  `
  + `(five arms plus a baseline; ${pass + fail} checks)`);
process.exit(fail ? 1 : 0);
