/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/owed-controls.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and neither the battery nor the fleet walk must discover it (PL-3/PL-11/FL-3's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. Every arm is armed ALONE with the other defences held OPEN, every restore is verified BY sha256 AND BY CONTENT (`cmp`), and every arm declares BEFORE it runs what MUST fail and what MUST NOT.
   (1) THE ARM THIS SUITE EXISTS FOR, AND IT WAS MEASURED BEFORE THE FIX EXISTED. Hide the declaration in `agent-worker/test/harness.test.mjs` -> `node scripts/coverage.mjs --strict` must EXIT 1 and NAME that suite. Run against the tree as it stood on 2026-08-09 it exited 0 with EVERY figure unmoved, printing `2/2 declaring a negative control` — the fleet's controls were counted per MEMBER, so FL-3/IS-9's own suite could go quiet behind its sibling's declaration. The plane register's 134/134 and 621 arms MUST NOT move under this arm: the hole is in the fleet walk and nowhere else.
   (2) THE FLEET ARMS FLOOR. Delete arms from a fleet suite's declaration -> `--strict` EXITS 1 at the fleet arms floor. A count of DECLARING suites cannot see a declaration that got shorter, which is M0-14's lesson one directory over.
   (3) THE FLEET SUITE FLOOR. Move a fleet suite out of its test directory -> `--strict` EXITS 1 saying the walk read fewer suites than the floor. Without it `4/4` becomes `3/3`, which reads GREENER than before — the failure a ceiling cannot see.
   (4) AN OWED CONTROL LOSES ITS SUITE. Move `bio-plane/test/suggest.test.mjs` aside -> `--strict` EXITS 1 naming owed control 6 and PL-3. The register's own `No declared control` walk cannot see this: a suite that is GONE is not a suite that fails to declare.
   (5) AN OWED CONTROL'S SUITE STOPS DECLARING. Hide the declaration in `bio-plane/test/strengthpair.test.mjs` -> `--strict` EXITS 1 twice over, at the register AND at owed control 3 naming PL-14 — the second is what says the ledger is pinned to that file rather than to a count.
   (6) THE LEDGER CANNOT BE TIDIED. Delete an OUTSTANDING row from `OWED_CONTROLS` -> `--strict` EXITS 1 on the pinned total of seven. Discharging a debt by deleting the row is the one failure a bare outstanding-count would have permitted.
   (7) OVER-STRICTNESS, and these must PASS rather than fail: (7a) a fleet declaration whose marker separator is an EM DASH rather than a colon; (7b) a fleet declaration that GREW by two arms; and (7c) a tree with no IS-BUILD-PLAN.md at all, where the ledger PRINTS and asserts nothing — that one is arm B6 IN this suite rather than in the harness, because it needs no source edit. A gate that fires on correct work in a spelling nobody anticipated is a defect in the gate.
   ALL EIGHT ARMS RUN 2026-08-09 IN WORKTREE agent-a66f1cf86b51a86bd, each ALONE against a whole tree with the other defences held OPEN, each ARMING REPORTED (every patch matched exactly once), every restore sha256-EQUAL and `cmp`-IDENTICAL against a per-arm pristine copy with its byte count printed and a 2,000-byte minimum guarded. EVERY ONE BEHAVED AS DECLARED. MEASURED on the committed tree, as `EXIT · plane register · plane arms · fleet suites/declaring/arms`, against a BASELINE row that armed nothing (`0 · 135/135 · 631 · 4/4/35`): (1) `1 · 135/135 · 631 · 3/4/26` naming harness.test.mjs — THE PLANE'S FIGURES DID NOT MOVE, which is what says the hole was the fleet walk alone. (2) `1 · 135/135 · 631 · 4/4/34`, FLEET FLOOR on arms, control message silent. (3) `1 · 135/135 · 631 · 3/3/28` — note `3/3`, which without a suite floor reads GREENER than 4/4. (4) `1 · 134/134 · 622 · 4/4/35`, the ledger naming owed control 6 / PL-3 while the register's `No declared control` walk stayed SILENT, because a suite that is GONE declares nothing to nobody — the two instruments are not one thing measured twice. (5) `1 · 134/135 · 614 · 4/4/35`, both firing. (6) `1 · 135/135 · 631 · 4/4/35` on the pinned total, the outstanding CEILING silent (deleting a row LOWERS that count, which is exactly why the total is pinned at all). (7a) `0`, nothing moved. (7b) `0 · fleet 4/4/37`, the tally RISEN. THE PROPERTY M0-9 AND M0-14 BOTH RECORDED APPLIES HERE TOO: writing this record into a declaration moves the register's own total upward, so these are DELTAS against the baseline row and an absolute must never be compared across two edits of this text.
   ONE ARM CAME BACK WRONG BEFORE ANY OF THIS AND IT IS THE FINDING WORTH CARRYING: the first version of arm (1) put the old `some()` rule back into `coverage.mjs` and this suite STAYED GREEN AT 36/0. The fix had left the member-level flag in place beside the new suite-level walk, so nothing read it any more — a second copy of a rule absorbing the control meant to prove the first, which is IS-6's C-22.4 arm at 98/98 one instrument over. The flag was DELETED rather than kept, and the arm was re-pointed at the rule that is actually load-bearing.
 * ========================================================================= */

/* VF-1 — THE SEVEN OWED NEGATIVE CONTROLS, AND THE REACH OF THE INSTRUMENT THAT
 * IS SUPPOSED TO KEEP THEM.
 *
 * VF-1's accepts-when is that `coverage.mjs`'s register *"shows every IS suite
 * declaring"* and that *"an undeclared IS suite would be its first regression."*
 * THAT SENTENCE WAS FALSE WHEN THIS SUITE WAS WRITTEN, for exactly one suite and
 * it was the worst one: `agent-worker/test/harness.test.mjs` is FL-3/IS-9 and it
 * OWNS owed control 7, and the fleet walk asked whether ANY of a member's suites
 * declared a control. Measured on 2026-08-09 by hiding that declaration: exit 0,
 * `2/2 declaring a negative control`, nothing moved anywhere.
 *
 * So this suite has two jobs and they are different in kind:
 *
 *   PART A · THE LEDGER IS TRUE OF THE TREE. The seven are read out of the real
 *     instrument's own printed report, and the ground truth is computed HERE from
 *     the files themselves — never read back from the instrument, which would be
 *     an agreement that costs nothing to produce.
 *
 *   PART B · THE REACH IS REAL, DRIVEN. Scratch repositories built around the
 *     REAL `scripts/coverage.mjs`, because the only way to know a gate fires is to
 *     give it something that must trip it. A fixture copy of the rule would agree
 *     with itself for free.
 *
 * WHAT THIS SUITE DOES NOT DO, stated plainly rather than discovered later: it
 * does not read an owed control's declaration and judge that the arm described is
 * the arm that ran. No matcher can. The four owners spell their reference to VF-1
 * four different ways, and grading one spelling is REC-70's defect exactly — the
 * evidence an arm RAN is the measured figure in the owner's own declaration, and
 * what is mechanised here is that the declaration is still there to be read.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync, readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
/* Built from the instrument's own constant, never typed as a literal: a real
   marker written in this file would plant a declaration in the corpus the
   register reads, and this suite's own fixtures would then be counted as part of
   the estate they are measuring (coverage-provenance's precedent). */
import { CONTROL_MARKER, MARKER_PHRASE, readControl } from "../scripts/control-register.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SCRIPTS = join(DIR, "..", "scripts");
const REPO = join(DIR, "..", "..");
/* The REAL instrument and the REAL modules it imports. */
const REAL = ["coverage.mjs", "control-register.mjs", "provenance.mjs"];

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  if (!ok) console.log(`FAIL: ${name}\n  got:  ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`);
};

/* ==================================================================== PART A
   THE LEDGER, AGAINST THE REAL TREE. */

const realRun = spawnSync(process.execPath, ["scripts/coverage.mjs"],
  { cwd: join(DIR, ".."), encoding: "utf8", timeout: 120_000 });
const realOut = `${realRun.stdout || ""}${realRun.stderr || ""}`;

/* The report's own rows, parsed back out. `(n) ITEM STATE [suite]`. */
const ledgerRows = [...realOut.matchAll(/^ {4}\((\d)\) (\S+) {2}(PLACED|OUTSTANDING|SUITE MISSING|SUITE DECLARES NO CONTROL)(?: {2}(\S+))?$/gm)]
  .map((m) => ({ n: +m[1], item: m[2], state: m[3], suite: m[4] || null }));

t("A1 the instrument ran at all", [realRun.status, realOut.length > 0], [0, true]);
/* THE COUNT IS THE DESIGN'S, AND IT IS ASSERTED AS SEVEN RATHER THAN AS
   `ledgerRows.length` — an assertion against the thing it is measuring passes
   over an empty list, and a headline totality assertion has passed over an empty
   corpus in this repository three separate times. */
t("A2 the ledger states the design's seven owed controls", ledgerRows.length, 7);
t("A3 they are numbered 1..7 with no gap and no repeat",
  ledgerRows.map((r) => r.n), [1, 2, 3, 4, 5, 6, 7]);
console.log(`corpus (A): ${ledgerRows.length} owed control row(s) read back from the real instrument's report`);

/* GROUND TRUTH COMPUTED HERE, from the files, and then COMPARED. The instrument
   says PLACED; this suite opens the file and asks. */
const placed = ledgerRows.filter((r) => r.state === "PLACED");
t("A4 at least the four whose owners have landed are placed", placed.length >= 4, true);
for (const r of placed) {
  const abs = join(REPO, r.suite);
  const exists = existsSync(abs);
  t(`A5 owed control ${r.n} (${r.item}) names a suite that is in the tree: ${r.suite}`, exists, true);
  t(`A6 owed control ${r.n} (${r.item}) names a suite that DECLARES a control`,
    exists ? readControl(readFileSync(abs, "utf8")) != null : null, true);
}
/* The OUTSTANDING half, and it is a first-class result rather than a hole in the
   table. Each names the item that owes it, so "not runnable yet" points at
   somebody rather than at nobody. */
const outstanding = ledgerRows.filter((r) => r.state === "OUTSTANDING");
t("A7 every outstanding owed control names its owning item and NO suite",
  outstanding.map((r) => [r.item, r.suite]),
  outstanding.map((r) => [r.item, null]));
t("A8 the outstanding ones are 2, 4 and 5 — PL-16's three, W9/M10",
  outstanding.map((r) => `${r.n}:${r.item}`), ["2:PL-16", "4:PL-16", "5:PL-16"]);
/* A9 IS THE ONE THAT WILL FAIL WHEN PL-16 LANDS AND NOBODY PLACES ITS THREE, and
   that is its purpose. It reads the plan's own row rather than a copy of it. */
const planRow = readFileSync(join(REPO, "docs/development/IS-BUILD-PLAN.md"), "utf8")
  .split("\n").find((l) => l.startsWith("| VF-1 |")) || "";
t("A9 the plan's VF-1 row still places 2, 4 and 5 on PL-16",
  [/\(2\) DEC-44's two-finding case → PL-16/.test(planRow),
   /\(4\) DEC-34's page-without-header → PL-16/.test(planRow),
   /\(5\) DEC-46\(a\)'s carried-forward acknowledgement → PL-16/.test(planRow)],
  [true, true, true]);

/* THE FLEET'S OWN SUITES ARE NOW IN THE REGISTER AT SUITE GRAIN. Asserted against
   the report the instrument PRINTED, with the count computed here from the
   directories rather than taken from the same line. */
const fleetLine = realOut.match(/^FLEET .*?(\d+)\/(\d+) SUITES declaring a negative control · (\d+) arms/m);
t("A10 the fleet's controls are reported per SUITE", fleetLine != null, true);
if (fleetLine) {
  const [, declaring, total, arms] = fleetLine;
  t("A10b every fleet suite declares", declaring === total, true);
  t("A10c the fleet states arms rather than a bare yes/no", +arms > 0, true);
}
/* THE IS SUITE BY NAME. Owed control 7's owner is a FLEET suite, and it is the
   whole reason this row exists — the plane's register never read it. */
t("A11 FL-3/IS-9's own suite is named in the fleet register",
  /^ {6}(?:\s*\d+ arms|UNCLASSIFIED|NO CONTROL) +harness\.test\.mjs$/m.test(realOut), true);

/* ==================================================================== PART B
   THE REACH, DRIVEN THROUGH SCRATCH REPOSITORIES. */

const opsSrc = `const OPS = {\n  ping: { mutating: false, classes: null },\n};\nexport { OPS };\n`;
const checksSrc = `/* C-1.1 the scratch catalog's only check */\nexport const CHECKS = ["C-1.1"];\n`;
/* A plane suite that reaches the op through the control plane and names the
   check, so the scratch tree is measurable at all. */
const planeSuite = (arms) =>
  `/* ${CONTROL_MARKER} the arms, each RUN\n`
  + Array.from({ length: arms }, (_, i) => `   (${i + 1}) break check ${i + 1} -> its own assertion fails`).join("\n")
  + ` */\n/* drives doGet("ping") via dispatchFetch, names C-1.1 */\nconsole.log("scratch ok");\n`;
const surfaceSrc = `const SURFACE = {\n  version: { mutating: false },\n};\nexport { SURFACE };\n`;
/* A fleet suite that reaches its member's surface op. `declare` chooses the
   marker's separator so the OVER-STRICTNESS arm can use a spelling this suite did
   not otherwise write. */
const fleetSuite = ({ arms = 2, declare = true, sep = ":" } = {}) =>
  (declare
    ? `/* ${MARKER_PHRASE}${sep} the arms\n`
      + Array.from({ length: arms }, (_, i) => `   (${i + 1}) break part ${i + 1} -> its own assertion fails`).join("\n")
      + ` */\n`
    : `/* no control is declared in this fixture, on purpose */\n`)
  + `/* names "/version" */\nconsole.log("member ok");\n`;

let scratches = 0;
/* Build a throwaway repository around the REAL instrument and run it. Returns
   the combined output and the exit status. `strict` is off by default because a
   scratch tree cannot meet the real fleet floors — in scratch the signal is the
   NAMED message, and the exit status is the real tree's job (the control file). */
const drive = ({ files = {}, anchor = false, strict = false } = {}) => {
  scratches++;
  const repo = mkdtempSync(join(tmpdir(), "vf1-owed-"));
  const put = (rel, body) => {
    mkdirSync(join(repo, dirname(rel)), { recursive: true });
    writeFileSync(join(repo, rel), body);
  };
  mkdirSync(join(repo, "bio-plane", "scripts"), { recursive: true });
  for (const f of REAL) copyFileSync(join(SCRIPTS, f), join(repo, "bio-plane", "scripts", f));
  put("bio-plane/src/index.mjs", opsSrc);
  put("bio-plane/checks/bio-checks.mjs", checksSrc);
  put("bio-plane/test/tracked.test.mjs", planeSuite(5));
  if (anchor) put("docs/development/IS-BUILD-PLAN.md", "| VF-1 | the scratch row |\n");
  for (const [rel, body] of Object.entries(files)) put(rel, body);
  const r = spawnSync(process.execPath, ["scripts/coverage.mjs", ...(strict ? ["--strict"] : [])],
    { cwd: join(repo, "bio-plane"), encoding: "utf8", timeout: 60_000 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  rmSync(repo, { recursive: true, force: true });
  return { out, code: r.status };
};

const MEMBER = {
  "member-a/fleet-member.json": JSON.stringify({ name: "member-a" }),
  "member-a/src/index.mjs": surfaceSrc,
};
/* The four suites the ledger names, so a scratch tree carrying the anchor is a
   tree the ledger can honestly be asserted against. */
const LEDGER_SUITES = {
  "bio-plane/test/aicredential.test.mjs": planeSuite(1),
  "bio-plane/test/strengthpair.test.mjs": planeSuite(1),
  "bio-plane/test/suggest.test.mjs": planeSuite(1),
  "agent-worker/test/harness.test.mjs": fleetSuite(),
  "agent-worker/fleet-member.json": JSON.stringify({ name: "agent-worker" }),
  "agent-worker/src/index.mjs": surfaceSrc,
};

/* ---- B1: ONE SUITE OF TWO GOES QUIET. The arm the old rule could not see. --- */
{
  const { out } = drive({ files: { ...MEMBER,
    "member-a/test/loud.test.mjs": fleetSuite({ arms: 3 }),
    "member-a/test/quiet.test.mjs": fleetSuite({ declare: false }) } });
  t("B1 the undeclared FLEET suite is NAMED", /FLEET CONTROL:.*member-a\/test\/quiet\.test\.mjs/.test(out), true);
  t("B1b the member is not credited by its sibling's declaration",
    /1\/2 SUITES declaring a negative control/.test(out), true);
  t("B1c the quiet suite is shown as NO CONTROL beside the loud one",
    [/NO CONTROL.*quiet\.test\.mjs/.test(out), / 3 arms.*loud\.test\.mjs/.test(out)], [true, true]);
}

/* ---- B2: OVER-STRICTNESS. Correct work in a spelling nobody anticipated. ---- */
{
  const { out } = drive({ files: { ...MEMBER,
    "member-a/test/dash.test.mjs": fleetSuite({ arms: 4, sep: "—" }),
    "member-a/test/colon.test.mjs": fleetSuite({ arms: 6 }) } });
  t("B2 a DASH-separated declaration is a declaration", /2\/2 SUITES declaring a negative control/.test(out), true);
  t("B2b nothing is named as uncontrolled", /FLEET CONTROL:/.test(out), false);
  t("B2c both declarations' arms are counted, never one of them",
    /2\/2 SUITES declaring a negative control · 10 arms/.test(out), true);
}

/* ---- B3: THE LEDGER, IN SCOPE, TRUE OF ITS TREE ---------------------------- */
{
  const { out } = drive({ anchor: true, files: { ...MEMBER,
    "member-a/test/m.test.mjs": fleetSuite(), ...LEDGER_SUITES } });
  t("B3 with every named suite present the ledger raises nothing",
    /OWED CONTROLS:/.test(out), false);
  t("B3b and it says so with all four placed", /OWED CONTROLS \(VF-1\) {2}4\/7 placed and RUN/.test(out), true);
}

/* ---- B4: AN OWED CONTROL LOSES ITS SUITE ----------------------------------- */
{
  const without = { ...LEDGER_SUITES };
  delete without["bio-plane/test/suggest.test.mjs"];
  const { out } = drive({ anchor: true, files: { ...MEMBER, "member-a/test/m.test.mjs": fleetSuite(), ...without } });
  t("B4 the ledger names the owed control whose suite is GONE",
    /OWED CONTROLS: owed control 6 \(PL-3\) -> bio-plane\/test\/suggest\.test\.mjs: SUITE MISSING/.test(out), true);
  /* THE DISTINCTION THE ROW EXISTS FOR: the register's "No declared control"
     walk reads suites it FINDS. A suite that is gone declares nothing to nobody
     and the register is silent about it — which is why a ledger pinned to a PATH
     is not the same instrument as a register counting declarations. */
  t("B4b the register itself is silent about a suite that is not there",
    /No declared control/.test(out), false);
}

/* ---- B5: AN OWED CONTROL'S SUITE STOPS DECLARING --------------------------- */
{
  const muted = { ...LEDGER_SUITES,
    "bio-plane/test/strengthpair.test.mjs": `/* nothing is declared here */\nconsole.log("x");\n` };
  const { out } = drive({ anchor: true, files: { ...MEMBER, "member-a/test/m.test.mjs": fleetSuite(), ...muted } });
  t("B5 the ledger names the owed control whose suite went quiet",
    /OWED CONTROLS: owed control 3 \(PL-14\) -> bio-plane\/test\/strengthpair\.test\.mjs: SUITE DECLARES NO CONTROL/.test(out), true);
  t("B5b and the register catches it independently, at the suite",
    /strengthpair\.test\.mjs/.test(out.split("No declared control")[1] || ""), true);
}

/* ---- B6: OUT OF SCOPE — the ledger PRINTS and asserts nothing -------------- */
{
  const { out, code } = drive({ files: { ...MEMBER, "member-a/test/m.test.mjs": fleetSuite() } });
  t("B6 with no IS-BUILD-PLAN.md the ledger asserts nothing", /OWED CONTROLS:/.test(out), false);
  t("B6b and it SAYS that is why, rather than reading as four clean rows",
    /NOT ASSERTED HERE \(no docs\/development\/IS-BUILD-PLAN\.md/.test(out), true);
  t("B6c the table is still printed — a ledger that hides is not a ledger",
    /OWED CONTROLS \(VF-1\)/.test(out) && /DEC-44's two-finding case/.test(out), true);
  t("B6d the run is otherwise ordinary", code === 0 || code === 1, true);
}

console.log(`corpus (B): ${scratches} scratch repositories driven through the REAL scripts/coverage.mjs`);
t("B7 the reach arm drove every scratch repository it declared", scratches, 6);

console.log(`\nowed-controls: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
