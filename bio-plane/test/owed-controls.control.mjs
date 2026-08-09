/* VF-1's OWN NEGATIVE CONTROL HARNESS. Declared in `test/owed-controls.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/owed-controls.control.mjs
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it (PL-3/PL-11/FL-3's precedent).
 *
 * THE RULES THIS HARNESS OBEYS, because the receipts for each are in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing, so "six arms broken" and "six arms
 *     working" cannot read the same. A harness whose first run reported the same
 *     verdict for every arm INCLUDING the baseline is why this row exists.
 *   - EVERY ARM DECLARES what MUST fail and what MUST NOT, before it runs.
 *   - EVERY ARM REPORTS WHETHER IT ARMED (the patch's match count) and every
 *     restore is verified against a UNIQUELY-NAMED per-arm pristine copy by
 *     sha256 AND by CONTENT, with a byte count printed and a minimum guarded.
 *     An arm that did not arm is a finding; a restore over an empty file is the
 *     `e3b0c442…` receipt.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, renameSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* THE PRISTINE COPIES LIVE INSIDE THIS WORKTREE and never in a shared scratchpad
   — a worker's harness was overwritten mid-turn by a concurrent worker on
   2026-08-07, and a harness silently replaced between ARM and RESTORE reports a
   restore it never performed. A DOT-directory, so neither the battery's
   discovery nor `coverage.mjs`'s fleet walk can enrol what it holds. */
const SAFE = join(REPO, ".vf1-control-pristine");
mkdirSync(SAFE, { recursive: true });

const P = (rel) => join(REPO, rel);
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 2000;   // every file this harness touches is far larger; a restore over a stub must fail loudly.

const strict = () => {
  const r = spawnSync(process.execPath, ["scripts/coverage.mjs", "--strict"],
    { cwd: PLANE, encoding: "utf8", timeout: 180_000 });
  return { code: r.status, out: `${r.stdout || ""}${r.stderr || ""}` };
};
const figures = (out) => ({
  register: (out.match(/^NEGATIVE CONTROLS {2}(\d+) of (\d+) suites/m) || []).slice(1, 3).join("/"),
  arms: +(out.match(/· (\d+) arms stated/) || [0, -1])[1],
  fleet: (out.match(/(\d+)\/(\d+) SUITES declaring a negative control · (\d+) arms/) || []).slice(1, 4).join("/"),
});

let rows = [];
/* `patch` returns [newText, matchCount]; `moves` is a list of files to rename
   aside instead. Exactly one of them is used per arm. */
function arm({ id, what, mustFail, mustNot, file, patch, move }) {
  const rel = file || move;
  const abs = P(rel);
  const pristine = join(SAFE, `${id}-${basename(rel)}`);
  copyFileSync(abs, pristine);
  const before = sha(pristine);
  const bytes = readFileSync(pristine).length;
  console.log(`\n=== ARM ${id} — ${what}`);
  console.log(`    MUST FAIL: ${mustFail}`);
  console.log(`    MUST NOT:  ${mustNot}`);
  console.log(`    pristine ${rel}: ${bytes} bytes · sha256 ${before.slice(0, 12)}…`);
  if (bytes < MIN_BYTES) { console.log(`    ABORT: pristine is ${bytes} bytes, under the ${MIN_BYTES}-byte guard`); process.exit(2); }

  let armed = 0, aside = null;
  if (move) { aside = `${abs}.vf1-aside`; renameSync(abs, aside); armed = existsSync(aside) ? 1 : 0; }
  else {
    const [next, n] = patch(readFileSync(abs, "utf8"));
    armed = n;
    writeFileSync(abs, next);
  }
  console.log(`    ARMED: patch matched ${armed} time(s)${armed === 0 ? "  <-- AN ARM THAT DID NOT ARM IS A FINDING" : ""}`);

  const r = strict();
  const f = figures(r.out);
  console.log(`    --strict EXIT ${r.code} · register ${f.register} · plane arms ${f.arms} · fleet ${f.fleet}`);
  const named = (re) => re.test(r.out);

  if (move) { renameSync(aside, abs); }
  else { copyFileSync(pristine, abs); }
  const after = sha(abs);
  const same = spawnSync("cmp", [pristine, abs]).status === 0;
  console.log(`    RESTORE: sha256 ${before === after ? "EQUAL" : "MISMATCH"} · cmp ${same ? "IDENTICAL" : "DIFFERS"} · ${readFileSync(abs).length} bytes`);
  if (before !== after || !same) { console.log("    ABORT: restore not verified"); process.exit(2); }
  rows.push({ id, code: r.code, ...f, named });
  return { code: r.code, out: r.out, f, named };
}

/* ---- BASELINE. Arms nothing. Six arms broken and six arms working must not
   read the same, and only this row can tell them apart. ---------------------- */
{
  const r = strict();
  const f = figures(r.out);
  console.log(`=== BASELINE (nothing armed) — EXIT ${r.code} · register ${f.register} · plane arms ${f.arms} · fleet ${f.fleet}`);
  console.log(`    owed: ${(r.out.match(/OWED CONTROLS \(VF-1\).*/) || ["(not printed)"])[0]}`);
  if (r.code !== 0) { console.log("    ABORT: the tree is not green before arming anything"); process.exit(2); }
  rows.push({ id: "BASE", code: r.code, ...f });
}

const hide = (src) => {
  const n = (src.match(/NEGATIVE CONTROL/g) || []).length;
  return [src.replaceAll("NEGATIVE CONTROL", "NEGATIVE CONTROL(hidden)"), n];
};

/* (1) THE ARM THIS ITEM EXISTS FOR. */
{
  const a = arm({ id: "1", file: "agent-worker/test/harness.test.mjs",
    what: "FL-3/IS-9's own suite stops declaring a negative control",
    mustFail: "--strict EXIT 1, NAMING agent-worker/test/harness.test.mjs",
    mustNot: "the plane register must not move — the hole is in the fleet walk and nowhere else",
    patch: hide });
  console.log(`    RESULT: exit ${a.code === 1 ? "1 as declared" : `${a.code} — SURPRISING, and it is a finding about this arm`}`
    + ` · named ${a.named(/FLEET CONTROL:.*harness\.test\.mjs/) ? "YES" : "NO"}`);
}

/* (2) THE FLEET ARMS FLOOR. One arm removed from a declaration, nothing else. */
{
  const a = arm({ id: "2", file: "agent-worker/test/harness.test.mjs",
    what: "one stated arm is deleted from a fleet declaration (its transition becomes prose)",
    mustFail: "--strict EXIT 1 at the FLEET FLOOR, 34 arms against a floor of 35",
    mustNot: "the suite still DECLARES, so the FLEET CONTROL message must NOT fire",
    patch: (src) => {
      const i = src.indexOf("(H1)");
      const j = src.indexOf(" -> ", i);
      return j === -1 ? [src, 0] : [src.slice(0, j) + " and then " + src.slice(j + 4), 1];
    } });
  console.log(`    RESULT: exit ${a.code} · floor named ${a.named(/FLEET FLOOR:.*fleet control arm/) ? "YES" : "NO"}`
    + ` · control message ${a.named(/FLEET CONTROL:/) ? "FIRED (unexpected)" : "silent as declared"}`);
}

/* (3) THE FLEET SUITE FLOOR. A suite disappears; 4/4 would become 3/3. */
{
  const a = arm({ id: "3", move: "pdf-worker/test/pagepixels.test.mjs",
    what: "a fleet suite is moved out of its test directory",
    mustFail: "--strict EXIT 1 at the FLEET FLOOR on suites read AND on arms",
    mustNot: "no suite may be named as UNDECLARED — the ones that remain all declare, which is the whole point",
    patch: null });
  console.log(`    RESULT: exit ${a.code} · suites floor named ${a.named(/FLEET FLOOR:.*fleet suite\(s\) read/) ? "YES" : "NO"}`
    + ` · control message ${a.named(/FLEET CONTROL:/) ? "FIRED (unexpected)" : "silent as declared"}`);
}

/* (4) AN OWED CONTROL LOSES ITS SUITE. */
{
  const a = arm({ id: "4", move: "bio-plane/test/suggest.test.mjs",
    what: "the suite owed control 6 is recorded in is moved aside",
    mustFail: "--strict EXIT 1 NAMING owed control 6 and PL-3; the plane REGISTER FLOOR fires too, and that is declared",
    mustNot: "the register's own `No declared control` walk must stay silent — a suite that is GONE declares nothing to nobody",
    patch: null });
  console.log(`    RESULT: exit ${a.code} · owed named ${a.named(/owed control 6 \(PL-3\).*SUITE MISSING/) ? "YES" : "NO"}`
    + ` · register floor ${a.named(/REGISTER FLOOR:/) ? "fired as declared" : "SILENT (unexpected)"}`
    + ` · no-declared-control ${a.named(/No declared control/) ? "FIRED (unexpected)" : "silent as declared"}`);
}

/* (5) AN OWED CONTROL'S SUITE STOPS DECLARING. Two instruments, independently. */
{
  const a = arm({ id: "5", file: "bio-plane/test/strengthpair.test.mjs",
    what: "the suite owed control 3 is recorded in stops declaring",
    mustFail: "--strict EXIT 1 TWICE OVER: the register names strengthpair, and the ledger names owed control 3 / PL-14",
    mustNot: "no other owed control may change state",
    patch: hide });
  console.log(`    RESULT: exit ${a.code} · ledger ${a.named(/owed control 3 \(PL-14\).*SUITE DECLARES NO CONTROL/) ? "YES" : "NO"}`
    + ` · register ${a.named(/No declared control/) ? "YES" : "NO"}`);
}

/* (6) THE LEDGER CANNOT BE TIDIED. */
{
  const a = arm({ id: "6", file: "bio-plane/scripts/coverage.mjs",
    what: "an OUTSTANDING row is deleted from OWED_CONTROLS — a debt discharged by arithmetic",
    mustFail: "--strict EXIT 1 on the pinned total of seven",
    mustNot: "the outstanding CEILING must not be what catches it — deleting a row LOWERS that count",
    patch: (src) => {
      const i = src.indexOf(`  { n: 5, item: "PL-16"`);
      const j = src.indexOf(`  { n: 6, item: "PL-3"`);
      return (i === -1 || j === -1) ? [src, 0] : [src.slice(0, i) + src.slice(j), 1];
    } });
  console.log(`    RESULT: exit ${a.code} · total pin ${a.named(/6 owed control\(s\) in the ledger, the design states 7/) ? "YES" : "NO"}`
    + ` · ceiling ${a.named(/outstanding, the pin is/) ? "FIRED (unexpected)" : "silent as declared"}`);
}

/* (7) OVER-STRICTNESS. Correct work, in spellings nothing here anticipated. */
{
  const a = arm({ id: "7a", file: "pdf-worker/test/pdf-worker.test.mjs",
    what: "a fleet declaration's marker separator is rewritten from a colon to an EM DASH",
    mustFail: "NOTHING. --strict must stay EXIT 0",
    mustNot: "the suite must not be reported as undeclared, and the fleet arms tally must not fall",
    patch: (src) => [src.replace("NEGATIVE CONTROL:", "NEGATIVE CONTROL —"), 1] });
  console.log(`    RESULT: exit ${a.code === 0 ? "0 as declared" : `${a.code} — the gate refused CORRECT WORK, which is a defect in the gate`}`);
}
{
  const a = arm({ id: "7b", file: "agent-worker/test/agent-worker.test.mjs",
    what: "two further arms are ADDED to a fleet declaration",
    mustFail: "NOTHING. --strict must stay EXIT 0 and the fleet tally must RISE",
    mustNot: "a floor must never fire on a declaration that GREW",
    patch: (src) => {
      const i = src.indexOf("NEGATIVE CONTROL:");
      const j = src.indexOf("\n", i);
      return i === -1 ? [src, 0]
        : [src.slice(0, j) + "\n   (z1) break one more thing -> one more assertion fails\n   (z2) break another -> another fails" + src.slice(j), 1];
    } });
  console.log(`    RESULT: exit ${a.code} · fleet ${a.f.fleet} (baseline 4/4/35 — the tally must have RISEN)`);
}

/* ---------------------------------------------------------------- the table */
console.log(`\n${"=".repeat(78)}\nARM     EXIT   register     plane arms   fleet`);
for (const r of rows)
  console.log(`${r.id.padEnd(7)} ${String(r.code).padEnd(6)} ${String(r.register).padEnd(12)} ${String(r.arms).padEnd(12)} ${r.fleet}`);
console.log(`\ncorpus: ${rows.length - 1} arms armed, 1 baseline row, over ${new Set(rows.map((r) => r.id)).size} distinct ids.`);
rmSync(SAFE, { recursive: true, force: true });
