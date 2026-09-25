/* GATE: never-cache (history) — D-569: its verdicts are git ancestry over fixture repositories under os.tmpdir(), which
   no result key can name. It reads no live ref of this checkout: every git call names a scratch repository as its cwd. */
/* D-569 — plancheck §1's UNPUSHED arm, GRADED AS ITS OWN TEXT SAYS: "a failure on main and a note anywhere else".
 *
 * THE DEFECT. The arm fires when HEAD is ahead of `origin/main`. Its message said a worker's own branch is EXPECTED
 * to be there and that it is "a failure on main and a note anywhere else" — and the code called `fail()` on every
 * branch. So the brief's "plancheck 0 fail" could not be met on a pushed `land/` branch: D-559's, D-541's and
 * M0-188's workers each read the same 1 fail over work that was published, and a gate that fails correct work
 * teaches its reader to read past its FAILs.
 *
 * THE GRADE (`unpushedGrade` in tools/strandedwork.mjs, imported by plancheck — the suite drives the function the
 * gate calls, and section 4 pins that the gate routes by it):
 *   FAIL on main; FAIL where no ref on origin carries HEAD; NOTE where one does, under ANY name.
 *
 * WHY BOTH DIRECTIONS ARE ARMED IN THE SAME RUN. The cheapest fix is a note everywhere, which loses D-288's alarm
 * for work on one disk; the defect was a fail everywhere. Section 2 drives the NOTE shapes and section 3 the FAIL
 * shapes, so neither collapse can pass. The over-strictness arms are S2c (a detached HEAD, pushed — how a spawned
 * worker actually pushes), S2b (pushed under a DIFFERENT name than the local branch) and S2d (the remote is AHEAD
 * of HEAD — carried by ancestry, not equality).
 *
 * NEGATIVE CONTROL: RUN 2026-09-25 by WORKER D-569, by hand, each arm ALONE, restored by `cp` from a pristine copy in
 * the session scratchpad (strandedwork.mjs 31,137 B, plancheck.mjs 79,366 B) and verified by `cmp` AND sha256
 * (strandedwork b22bbb96…, plancheck 4f624ba0…, identical before and after). Baseline 14 pass / 0 fail, exit 0.
 *   (N1) `unpushedGrade`'s carried branch made unreachable, so it grades FAIL on every branch (the defect, at the
 *        predicate) -> the four NOTE arms fail by name (S2a "a worker branch pushed under its own name is a NOTE",
 *        S2b, S2c, S2d); section 3 passes. 10 pass / 4 fail, exit 1.
 *   (N2) plancheck's routing reverted to `fail()` unconditionally (the defect, at the gate) -> "S4 plancheck routes
 *        a NOTE grade to notes, not to fail()" fails by name; sections 2-3 pass. 13 pass / 1 fail, exit 1.
 *   (N3) every `grade: "fail"` in `unpushedGrade` made `"note"` (the cheap over-correction) -> section 3's four
 *        FAIL arms fail by name (S3a "main ahead of origin/main is a FAIL even when another ref carries it", S3b,
 *        S3c, S3d); section 2 passes. 10 pass / 4 fail, exit 1. ITS FIRST ARMING WAS UNSOUND and is recorded: an
 *        early `return { grade: "note", carrier: null }` also dropped the CARRIER, a second variable, so section 2
 *        failed too (6 pass / 8 fail) — re-armed on the grade alone as above.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { unpushedGrade } from "../../tools/strandedwork.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const SECTIONS = 4;
let reached = 0;
const section = (n) => { reached++; console.log(`\n--- ${n} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "d569-unpushed-"));
const g = (repo, ...args) =>
  execFileSync("git", args, { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

let n = 0;
/* A working clone with a BARE `origin`, `origin/main` a FETCHED tracking ref — the shape plancheck reads. */
function scratch() {
  const id = `r${++n}`;
  const bare = join(SANDBOX, `${id}.git`), work = join(SANDBOX, id);
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", bare], { encoding: "utf8" });
  execFileSync("git", ["init", "-q", "-b", "main", work], { encoding: "utf8" });
  for (const [k, v] of [["user.name", "d-569"], ["user.email", "d-569@example.invalid"],
                        ["commit.gpgsign", "false"]]) g(work, "config", k, v);
  g(work, "remote", "add", "origin", bare);
  commit(work, "base");
  g(work, "push", "-q", "origin", "main");
  g(work, "fetch", "-q", "origin");
  return work;
}
function commit(work, what) {
  writeFileSync(join(work, `${what}.md`), `${what}\n`);
  g(work, "add", "-A"); g(work, "commit", "-q", "-m", what);
}
/* What plancheck hands the predicate: the branch as `rev-parse --abbrev-ref HEAD` spells it, and HEAD's sha. */
const grade = (work) => {
  g(work, "fetch", "-q", "origin");
  const r = unpushedGrade({ repo: work, branch: g(work, "rev-parse", "--abbrev-ref", "HEAD"),
                            head: g(work, "rev-parse", "HEAD") });
  return { grade: r.grade, carrier: r.carrier?.ref ?? null };
};
const ahead = (work) => +g(work, "rev-list", "--count", "origin/main..HEAD");

/* ========================================================================== */
section("1 — the sandbox is outside the estate, and every fixture is ahead of origin/main (the arm's trigger)");
{
  t("the sandbox is not inside this checkout", SANDBOX.startsWith(REPO), false);
}

/* ========================================================================== */
section("2 — PUSHED work off main is a NOTE (the arm's own text)");
{
  const a = scratch();
  g(a, "checkout", "-q", "-b", "land/worker/X-1"); commit(a, "work");
  g(a, "push", "-q", "origin", "land/worker/X-1");
  t("S2a fixture is ahead of origin/main", ahead(a) > 0, true);
  t("S2a a worker branch pushed under its own name is a NOTE", grade(a),
    { grade: "note", carrier: "land/worker/X-1" });

  const b = scratch();
  g(b, "checkout", "-q", "-b", "my-local-name"); commit(b, "work");
  g(b, "push", "-q", "origin", "HEAD:refs/heads/land/worker/X-2");
  t("S2b a branch pushed under a DIFFERENT name is a NOTE, naming the carrier", grade(b),
    { grade: "note", carrier: "land/worker/X-2" });

  const c = scratch();
  g(c, "checkout", "-q", "--detach"); commit(c, "work");
  g(c, "push", "-q", "origin", "HEAD:refs/heads/land/worker/X-3");
  t("S2c a DETACHED HEAD pushed to a land/ ref is a NOTE", grade(c),
    { grade: "note", carrier: "land/worker/X-3" });

  /* Carried by ANCESTRY, not equality: the remote branch moved past this HEAD (another clone pushed on top). */
  const d = scratch();
  g(d, "checkout", "-q", "-b", "land/worker/X-4"); commit(d, "work");
  g(d, "push", "-q", "origin", "land/worker/X-4");
  const mine = g(d, "rev-parse", "HEAD");
  commit(d, "later"); g(d, "push", "-q", "origin", "land/worker/X-4");
  g(d, "checkout", "-q", "--detach", mine); g(d, "branch", "-q", "-f", "land/worker/X-4", mine);
  g(d, "checkout", "-q", "land/worker/X-4");
  t("S2d a HEAD the remote branch has moved PAST is still a NOTE (ancestry)", grade(d),
    { grade: "note", carrier: "land/worker/X-4" });
}

/* ========================================================================== */
section("3 — main, and work no origin ref carries, still FAIL");
{
  const a = scratch();
  commit(a, "integration");
  g(a, "push", "-q", "origin", "HEAD:refs/heads/land/conduct/elsewhere");
  t("S3a fixture: main is ahead of origin/main", ahead(a) > 0, true);
  t("S3a main ahead of origin/main is a FAIL even when another ref carries it", grade(a).grade, "fail");

  const b = scratch();
  g(b, "checkout", "-q", "-b", "land/worker/Y-1"); commit(b, "work");
  t("S3b a worker branch never pushed is a FAIL", grade(b), { grade: "fail", carrier: null });

  const c = scratch();
  g(c, "checkout", "-q", "-b", "land/worker/Y-2"); commit(c, "work");
  g(c, "push", "-q", "origin", "land/worker/Y-2");
  commit(c, "one more, not pushed");
  t("S3c a pushed branch with a NEWER local commit is a FAIL (HEAD itself is not carried)", grade(c),
    { grade: "fail", carrier: null });

  const d = scratch();
  commit(d, "unpushed main");
  t("S3d main ahead and carried by nothing is a FAIL", grade(d), { grade: "fail", carrier: null });
}

/* ========================================================================== */
section("4 — plancheck routes by the grade (the gate, not only the library)");
{
  const src = readFileSync(join(REPO, "tools/plancheck.mjs"), "utf8");
  const arm = src.slice(src.indexOf("const ahead = sh(\"git rev-list --count origin/main..HEAD\")"),
                        src.indexOf("warn(`local main is behind origin/main"));
  t("S4 the UNPUSHED arm was found in plancheck.mjs", arm.length > 200 && arm.includes("UNPUSHED —"), true);
  t("S4 plancheck imports unpushedGrade from strandedwork.mjs",
    /import\("\.\/strandedwork\.mjs"\)/.test(arm) && /unpushedGrade\(\{ branch, head \}\)/.test(arm), true);
  t("S4 plancheck routes a NOTE grade to notes, not to fail()",
    /if \(graded\.grade === "note"\) notes\.push\(/.test(arm) && !/^\s*fail\(`UNPUSHED/m.test(arm), true);
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`unpushedgrade: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
