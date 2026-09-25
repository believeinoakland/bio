/* M0-28's negative-control driver — `corpuscheck` refuses a Status carrying more than one
 * `as of YYYY-MM-DD`. Re-run in one step from `bio-plane/`:
 *
 *     node test/nc-m028.mjs            all arms, in order
 *     node test/nc-m028.mjs A1         one arm (BASE A1 A2 A3 A4 A5)
 *
 * D-331: the driver VALIDATES EVERY ANCHOR BEFORE IT ARMS ANYTHING — a patch that matched
 * zero times reads exactly like a green, and an arm that did not arm is a finding.
 * CLAUDE.md's `git checkout --` trap: every restore is a cp-back from a UNIQUELY-NAMED
 * per-arm pristine copy, verified by sha256 AND by `cmp` AND by a floored byte count.
 *
 * DECLARED BEFORE ARMING — what MUST fail and what MUST NOT:
 *   BASE  nothing armed                      -> corpuscheck 0 fail AND the suite 0 fail.
 *                                               The row that distinguishes five-arms-working
 *                                               from five-arms-broken.
 *   A1    UI-PLAN's Status re-doubled with an EARLIER `as of`
 *                                            -> corpuscheck FAILS, naming that file and BOTH
 *                                               dates. MUST NOT move any other document.
 *   A2    the same on NOTIFICATIONS          -> FAILS naming that file and both dates.
 *   A3    OVER-STRICTNESS: three bare prose dates added to a Status, no second `as of`
 *                                            -> 0 fail. A Status must still be able to say
 *                                               when a measurement was taken.
 *   A4    OVER-STRICTNESS over the REAL CORPUS: every governed Status as committed
 *                                            -> exactly one `as of` each, corpuscheck 0 fail.
 *   A5    THE ARM'S OWN ARM: the `asOfAll.length > 1` push disabled in `checkFile`
 *                                            -> the SUITE fails, naming the arm, and
 *                                               corpuscheck itself still reads 0 fail —
 *                                               which is precisely why the suite arm exists.
 *
 * RESULT, 2026-09-14, all five plus BASE AS DECLARED ON THE FIRST RUN, every restore
 * byte-identical. THE FINDING THE BRIEF DID NOT PREDICT: A1 and A2 each produce TWO
 * failures, not one — the second is the EXISTING staleness arm firing on the EARLIER date
 * ("Status says `as of 2026-08-01` but the file last changed 2026-09-14"). That is SK-6's
 * trap rendered live: the moment two dates differ, the document is judged on the one
 * nobody maintains.
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ANCHOR_DRY, anchorRows, anchorTable } from "../scripts/anchortable.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");            /* the repo root: test/ -> bio-plane/ -> . */
const PEN = mkdtempSync(join(tmpdir(), "nc-m028-"));
const ONLY = process.argv[2] || null;
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const FLOOR = 2000;   /* every file armed here is far larger; a restore over a truncated
                         file must not be allowed to read clean (the `e3b0c442…` lesson) */

function run(cmd, args, cwd) {
  try { return { code: 0, out: execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) }; }
  catch (e) { return { code: e.status ?? -1, out: (e.stdout || "") + (e.stderr || "") }; }
}
const corpuscheck = () => run("node", ["tools/corpuscheck.mjs"], ROOT);
const suite = () => run("node", ["test/corpuscheck.test.mjs"], join(ROOT, "bio-plane"));
const headline = (o) => (o.match(/^corpuscheck: .*$/m) || ["(no headline)"])[0];
const tally = (o) => (o.match(/^\d+ pass, \d+ fail$/m) || ["(no tally — a suite that did not reach its FOOT reports -1, never 0)"])[0];
const failLines = (o) => o.split("\n").filter((l) => /^\s+FAIL/.test(l)).map((l) => l.trim());

function arm(name, file, from, to, act) {
  if (ANCHOR_DRY) return void anchorRows([{ arm: name, file: join(ROOT, file), find: from, put: to }]);   /* M0-197: read, never armed */
  if (ONLY && ONLY !== name) return;
  const abs = join(ROOT, file);
  const src = readFileSync(abs, "utf8");
  const hits = src.split(from).length - 1;
  console.log(`\n=== ${name}  anchor matches ${hits}x in ${file}`);
  if (hits !== 1) { console.log(`  ANCHOR NOT UNIQUE (${hits}) — THE ARM DID NOT ARM, and that is the finding.`); process.exitCode = 1; return; }
  const pristine = join(PEN, `pristine-${name}-${file.replace(/[\/.]/g, "_")}`);
  copyFileSync(abs, pristine);
  const before = { sha: sha(abs), bytes: statSync(abs).size };
  writeFileSync(abs, src.replace(from, to));
  console.log(`  armed: ${before.bytes} -> ${statSync(abs).size} bytes`);
  try { act(); } finally {
    copyFileSync(pristine, abs);
    const after = { sha: sha(abs), bytes: statSync(abs).size };
    const cmpOk = run("cmp", ["-s", pristine, abs], ROOT).code === 0;
    const ok = after.sha === before.sha && cmpOk && after.bytes >= FLOOR;
    console.log(`  restored byte-identically: ${ok ? "YES" : "NO"}  sha ${after.sha === before.sha} · cmp ${cmpOk} · ${after.bytes} bytes (floor ${FLOOR})`);
    if (!ok) process.exitCode = 1;
  }
}

if (!ANCHOR_DRY && (!ONLY || ONLY === "BASE")) {   /* M0-197: no run under the dry read */
  console.log("=== BASE  nothing armed");
  const c = corpuscheck(); console.log(`  corpuscheck exit ${c.code} · ${headline(c.out)}`);
  const s = suite(); console.log(`  suite exit ${s.code} · ${tally(s.out)}`);
}

const named = (label, file, c) => {
  console.log(`  corpuscheck exit ${c.code} · ${headline(c.out)}`);
  for (const l of failLines(c.out)) console.log(`  ${l}`);
  const line = failLines(c.out).find((l) => l.includes(file) && /Status carries/.test(l)) || "(the arm's own line is ABSENT)";
  console.log(`  ${label}: names the file ${line.includes(file)} · names both dates ${/\d{4}-\d{2}-\d{2} then \d{4}-\d{2}-\d{2}/.test(line)}`);
};

arm("A1", "docs/development/UI-PLAN.md",
  "**The ladder, rung by rung, measured 2026-09-14.**",
  "**The ladder, rung by rung, as of 2026-08-01.**",
  () => named("A1", "UI-PLAN.md", corpuscheck()));

arm("A2", "docs/development/NOTIFICATIONS.md",
  "**What of the queue content is built, measured 2026-09-14.**",
  "**What of the queue content is built, as of 2026-07-30.**",
  () => named("A2", "NOTIFICATIONS.md", corpuscheck()));

arm("A3", "docs/development/UI-KICKOFF.md",
  "**Devices:** the first-release phone position",
  "**Devices, the position taken 2026-07-28 and re-read 2026-08-01 against a build dated 2026-09-01:** the first-release phone position",
  () => {
    const c = corpuscheck();
    console.log(`  corpuscheck exit ${c.code} · ${headline(c.out)}`);
    console.log(`  OVER-STRICTNESS: three bare prose dates in a Status, no second \`as of\` — MUST be 0 fail`);
    for (const l of failLines(c.out)) console.log(`  UNEXPECTED ${l}`);
  });

if (!ANCHOR_DRY && (!ONLY || ONLY === "A4")) {   /* M0-197: no run under the dry read */
  console.log("\n=== A4  over-strictness over the REAL CORPUS (one `as of` per governed Status)");
  const { governed, parseFront, ROOT: CROOT } = await import(join(ROOT, "tools/corpuscheck.mjs"));
  const g = governed();
  const bad = [];
  for (const p of g) {
    const fm = parseFront(readFileSync(join(CROOT, p), "utf8").split("\n"));
    const n = fm.error ? -1 : [...fm.status.matchAll(/as of \d{4}-\d{2}-\d{2}/g)].length;
    if (n !== 1) bad.push(`${p}:${n}`);
  }
  console.log(`  corpus ${g.length} governed document(s) — a floored, printed corpus, never an empty one`);
  console.log(`  Status \`as of\` counts != 1: ${JSON.stringify(bad)}`);
  const c = corpuscheck();
  console.log(`  corpuscheck exit ${c.code} · ${headline(c.out)}`);
}

arm("A5", "tools/corpuscheck.mjs",
  "  if (asOfAll.length > 1) fails.push(",
  "  if (false && asOfAll.length > 1) fails.push(",
  () => {
    const s = suite();
    console.log(`  suite exit ${s.code} · ${tally(s.out)}`);
    const failing = s.out.split("\n").filter((l) => /^\s+FAIL/.test(l)).map((l) => l.trim());
    for (const f of failing) console.log(`  ${f}`);
    console.log(`  the arm fails BY NAME: ${failing.some((f) => /a Status carrying two `as of` dates is refused/.test(f))}`);
    const c = corpuscheck();
    console.log(`  and corpuscheck itself still reads clean with the arm gone: exit ${c.code} · ${headline(c.out)}`);
  });

anchorTable();   /* M0-197: prints the arms read above and exits, under the dry read only */
console.log("\n=== driver done");
