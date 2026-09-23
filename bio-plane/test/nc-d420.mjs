/* D-420's NEGATIVE CONTROL HARNESS. Declared in the suite it drives
 * (`d420-image-page.test.mjs`), run from `bio-plane/` in one step:
 *
 *     node test/nc-d420.mjs               # every arm, baseline first
 *     node test/nc-d420.mjs droppage      # one arm
 *
 * NOT a `.test.mjs`, deliberately: it EDITS A REAL SOURCE while it runs, so the
 * battery's discovery must not find it (`nc-fw19.mjs`'s machinery, verbatim in
 * its runner: `mustNotFail` is CHECKED, not described).
 *
 * THE ARMS, and what each proves:
 *   droppage — THE ROW'S DECLARED CONTROL: drop the page-form branch (the
 *     checker never asks what the page paints) and the no-image arm fails BY
 *     NAME, while equality, the admitted-and-stated arms and the wire hold.
 *   dropwire — acquire stops persisting the list (the record as it was before
 *     D-420): the wire arm and every refusal fail; nothing that mints moves.
 *   widetol — HOW A LIAR PASSES: a tolerance wide enough that any rect on the
 *     page matches. The far rect and the one-point-off rect MUST mint and fail;
 *     the blank-page arms (no placement on the page at all) MUST hold.
 *   absentrefuses — THE OVER-STRICTNESS DIRECTION: read an absent list as an
 *     empty one. The pre-D-420 PDF and the unfinished walk are then refused —
 *     a bound nobody measured — and both admitted arms MUST fail.
 *
 * Pristine copies live in `.d420-control-pristine/` at the worktree root (named,
 * not globbed, in `.gitignore`), UNIQUELY NAMED per arm; every restore is
 * verified by sha256 AND by content with a byte count printed and a minimum
 * guarded — never `git checkout --`.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SAFE = join(REPO, ".d420-control-pristine");
mkdirSync(SAFE, { recursive: true });

const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const INDEX = join(PLANE, "src/index.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 500000;   // both sources are > 700 KB; a restore over a stub must fail loudly.

const SUITES = { d420: "test/d420-image-page.test.mjs" };
function runSuite(key) {
  const r = spawnSync(process.execPath, [SUITES[key]],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  return { key, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
}
function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const WIRE = "a PDF's reading carries a container extent with ONE level";
const EQUAL = "a rect EQUAL to a persisted placement mints";
const FAR = "a rect where the page paints NO image is REFUSED BY NAME";
const NEAR = "a rect ONE POINT off a placement is refused too";
const BLANK = "on a page that paints nothing, is refused";
const PAGE_BLANK = "an image named by page alone, on a page that paints NONE";
const ACT = "THROUGH op=contentmint as well";
const BEFORE = "the far rect on a PDF acquired BEFORE D-420 is ADMITTED";
const STATED = "and the admission STATES what it was not checked against";
const UNFINISHED = "a PDF whose walk did NOT finish admits the rect";
const AGREE = "the rect the mint refuses, the crop refuses";

const ARMS = {
  baseline: {
    files: [], suites: ["d420"],
    why: "nothing armed — the row that distinguishes four-arms-broken from four-arms-working",
    mustFail: [], mustNotFail: [], patch: () => ({ armed: true, matches: 0 }),
  },
  droppage: {
    files: [CHECKS], suites: ["d420"],
    why: "drop the page-form branch: a rect where the page paints no image MINTS",
    mustFail: [FAR, NEAR, BLANK, PAGE_BLANK, ACT],
    mustNotFail: [WIRE, EQUAL, BEFORE, STATED, UNFINISHED, AGREE],
    patch: () => arm(CHECKS,
      "      const unpainted = ctx.known !== false ? coversImagePlacement(e, ctx.container) : null;",
      "      const unpainted = null;"),
  },
  dropwire: {
    files: [INDEX], suites: ["d420"],
    why: "acquire stops persisting a PDF's placements (container_extent null, as before D-420)",
    mustFail: [WIRE, FAR, NEAR, ACT],
    mustNotFail: [EQUAL, BEFORE, STATED, AGREE],
    patch: () => arm(INDEX, `              if (!containerExtent && pdfPaints && fmt === "pdf") {`,
                            `              if (false) {`),
  },
  widetol: {
    files: [CHECKS], suites: ["d420"],
    why: "the liar: a tolerance so wide any rect on a page that paints an image matches",
    mustFail: [FAR, NEAR, ACT],
    mustNotFail: [WIRE, EQUAL, BLANK, PAGE_BLANK, BEFORE, UNFINISHED],
    patch: () => arm(CHECKS, "Math.abs(v - want[i]) <= 0.001 + 1e-9", "Math.abs(v - want[i]) <= 1000"),
  },
  absentrefuses: {
    files: [CHECKS], suites: ["d420"],
    why: "over-strictness: an ABSENT placement list read as an EMPTY one — a bound nobody measured",
    mustFail: [BEFORE, UNFINISHED],
    mustNotFail: [WIRE, EQUAL, FAR, AGREE],
    patch: () => arm(CHECKS,
      "  if (!container || container.container_name !== 'pdf' || !Array.isArray(container.images)) return null;\n  const all = container.images;",
      "  if (!container) return null;\n  const all = Array.isArray(container.images) ? container.images : [];"),
  },
};

const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
if (only && !ARMS[only]) {
  console.error(`no such arm: ${only}. Arms: ${Object.keys(ARMS).join(", ")}`);
  process.exit(2);
}

let notAsDeclared = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY          ${a.why}`);
  console.log(`  MUST FAIL    ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST NOT     ${a.mustNotFail.length ? a.mustNotFail.join(" | ") : "(nothing — baseline)"}`);
  const saved = [];
  for (const f of a.files) {
    const dest = join(SAFE, `${name}-${f.split("/").pop()}`);
    copyFileSync(f, dest);
    const bytes = statSync(dest).size;
    if (bytes < MIN_BYTES) { console.log(`  ABORT        pristine copy of ${f} is ${bytes} B — below the guarded minimum`); process.exit(3); }
    saved.push({ f, dest, bytes, sha: sha(f) });
    console.log(`  PRISTINE     ${f.replace(REPO + "/", "")}  ${bytes} bytes  sha256 ${sha(f).slice(0, 12)}…`);
  }
  const armed = a.patch();
  console.log(`  ARMED        ${armed.armed ? "yes" : "NO — AN ARM THAT DID NOT ARM IS A FINDING"}  (patch matched ${armed.matches}×)`);
  const results = a.suites.map(runSuite);
  const totalFail = results.reduce((n, r) => n + (r.fail < 0 ? 1 : r.fail), 0);
  const failing = results.flatMap((r) => r.failing);
  for (const r of results) console.log(`  RESULT       ${SUITES[r.key]}  ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of failing) console.log(`               ${l}`);
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f) === s.sha;
    const same = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED     ${s.f.replace(REPO + "/", "")}  byte-identically: ${back && same ? "YES" : "NO"}`
      + `  ${statSync(s.f).size} bytes  sha256 ${sha(s.f).slice(0, 12)}…`);
    if (!(back && same)) { console.log("  ABORT        a restore that is not byte-identical poisons every later arm"); process.exit(4); }
  }
  if (!armed.armed) { console.log("  VERDICT      ARM DID NOT ARM — a finding, not a retry"); notAsDeclared++; continue; }
  if (!a.mustFail.length) {
    const ok = totalFail === 0;
    console.log(`  VERDICT      ${ok ? "AS DECLARED — green" : "NOT AS DECLARED — the baseline is not green"}`);
    if (!ok) notAsDeclared++;
    continue;
  }
  const hit = a.mustFail.filter((m) => failing.some((l) => l.includes(m)));
  const broke = a.mustNotFail.filter((m) => failing.some((l) => l.includes(m)));
  const ok = totalFail > 0 && hit.length === a.mustFail.length && broke.length === 0;
  console.log(`  VERDICT      ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, `
    + `${broke.length}/${a.mustNotFail.length} held-open assertion(s) ALSO broken, ${totalFail} total failing`);
  if (!ok) {
    for (const m of a.mustFail) if (!failing.some((l) => l.includes(m))) console.log(`               DECLARED BUT NOT SEEN: ${m}`);
    for (const m of broke) console.log(`               HELD OPEN BUT BROKEN: ${m}`);
    notAsDeclared++;
  }
}
console.log(notAsDeclared
  ? `\n${notAsDeclared} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`
  : "\nevery arm AS DECLARED");
process.exit(0);
