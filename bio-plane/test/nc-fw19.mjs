/* FW-19's NEGATIVE CONTROL HARNESS. Declared in the suite it drives
 * (`fw19-extent-arms.test.mjs`), run from `bio-plane/` in one step:
 *
 *     node test/nc-fw19.mjs               # every arm, baseline first
 *     node test/nc-fw19.mjs tableoob      # one arm
 *
 * NOT a `.test.mjs`, deliberately: it EDITS A REAL SOURCE while it runs, so the
 * battery's discovery must not find it (the `nc-coff12.mjs` precedent, whose
 * machinery this is, including its one improvement over older harnesses:
 * `mustNotFail` is CHECKED, not described — an arm that takes the whole suite
 * down proves nothing about its own subject).
 *
 * THE ARMS, and what each proves (EXTRACTION-BREADTH §8):
 *   rangeoob / tableoob / imageoob — "a new arm's out-of-range refusal neutered
 *     -> an impossible extent mints and the arm fails by name", ONE PREDICATE AT
 *     A TIME so each shows the three are independent.
 *   bytesnull — §8's "an image row with cited_as = bytes carries no chain and no
 *     cap and is NOT refused": take the exemption away and the row that must
 *     mint is refused. The direction that refuses correct work.
 *   textnochain — the overclaim direction: drop the refusal of TEXT read off an
 *     embedded image, and a transcription nobody made is minted.
 *   rec85canon — the row's over-strictness clause ("REC-85's three arms …
 *     byte-identical"): perturb REC-85's `sheet-cell` canonical form and the
 *     digest pin MUST fail while every FW-19 arm holds — proving the pin can
 *     see a change to the arms this item promised not to move.
 *
 * Pristine copies live in a pen OUTSIDE the worktree — `controlPen("fw19")` from
 * `test/pen.mjs` (M0-182, BOB #32) — are UNIQUELY NAMED per arm, and every restore
 * is verified by sha256 AND by content with a byte count printed and a minimum
 * guarded — never `git checkout --`.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SAFE = controlPen("fw19");
mkdirSync(SAFE, { recursive: true });

const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 500000;   // bio-checks.mjs is ~713 KB; a restore over a stub must fail loudly.

const SUITES = { fw19: "test/fw19-extent-arms.test.mjs" };
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

const RANGE_REFUSED = "a sheet-range on a sheet the workbook does NOT have is REFUSED C-45.1 BY NAME";
const RANGE_GRID = "a sheet-range reaching one row PAST the XLSX grid";
const TABLE_REFUSED = "a table past the document's table count is REFUSED C-45.1 BY NAME";
const TABLE_CELL = "a cell past that table's grid is REFUSED C-45.1";
const IMAGE_REFUSED = "an image part the container does NOT hold is REFUSED C-45.1 BY NAME";
const IMAGE_ZERO = "on a workbook whose media directory was LOOKED IN";
const IMAGE_ACT = "and an image part the container lacks is refused at the WRITE";
const BYTES_MINT = "an image the container HOLDS, cited with no cited_as, mints";
const PURE_NULLS = "PURE: an image as bytes over a capture with NO chain is not refused";
const TEXT_REFUSED = "the SAME image cited as TEXT is REFUSED";
const PIN = "OVER-STRICTNESS: REC-85's";
const PARITY = "PARITY:";

const ARMS = {
  baseline: {
    files: [], suites: ["fw19"],
    why: "nothing armed — the row that distinguishes six-arms-broken from six-arms-working",
    mustFail: [], mustNotFail: [], patch: () => ({ armed: true, matches: 0 }),
  },
  rangeoob: {
    files: [CHECKS], suites: ["fw19"],
    why: "neuter coversSheetRange: an unknown sheet and a range past the grid MINT",
    mustFail: [RANGE_REFUSED, RANGE_GRID],
    mustNotFail: [TABLE_REFUSED, IMAGE_REFUSED, PIN, PARITY],
    patch: () => arm(CHECKS, "    const outside = coversSheetRange(e, ctx.container);",
                             "    const outside = null;"),
  },
  tableoob: {
    files: [CHECKS], suites: ["fw19"],
    why: "neuter coversDocTable: table 3 of a three-table document, and a cell past a table's grid, MINT",
    mustFail: [TABLE_REFUSED, TABLE_CELL],
    mustNotFail: [RANGE_REFUSED, IMAGE_REFUSED, PIN, PARITY],
    patch: () => arm(CHECKS, "    const outside = coversDocTable(e, ctx.container);",
                             "    const outside = null;"),
  },
  imageoob: {
    files: [CHECKS], suites: ["fw19"],
    why: "neuter coversImage: an image part no container holds MINTS, at the promote and through the act",
    mustFail: [IMAGE_REFUSED, IMAGE_ZERO, IMAGE_ACT],
    mustNotFail: [RANGE_REFUSED, TABLE_REFUSED, BYTES_MINT, PIN],
    patch: () => arm(CHECKS, "    const outside = hasPart ? coversImage(e, ctx.container) : null;",
                             "    const outside = null;"),
  },
  bytesnull: {
    files: [CHECKS], suites: ["fw19"],
    why: "remove the bytes exemption from the chain arm: a bytes row over a chainless capture is REFUSED — "
       + "§8's two nulls read as one, in the direction that refuses correct work",
    mustFail: [PURE_NULLS],
    mustNotFail: [BYTES_MINT, IMAGE_REFUSED, TEXT_REFUSED, PIN],
    patch: () => arm(CHECKS, "  if (ctx.known !== false && citedAs !== 'bytes'",
                             "  if (ctx.known !== false"),
  },
  textnochain: {
    files: [CHECKS], suites: ["fw19"],
    why: "drop the refusal of TEXT read off an embedded image: a transcription nobody made MINTS",
    mustFail: [TEXT_REFUSED],
    mustNotFail: [IMAGE_REFUSED, BYTES_MINT, PURE_NULLS, PIN],
    patch: () => arm(CHECKS, "    if (hasPart && citedAs === 'text')", "    if (false)"),
  },
  rec85canon: {
    files: [CHECKS], suites: ["fw19"],
    why: "stop upper-casing REC-85's sheet-cell canonical cell: the byte-identity pin on the arms this "
       + "item must NOT move MUST see it, while every FW-19 arm holds",
    mustFail: [PIN],
    mustNotFail: [RANGE_REFUSED, TABLE_REFUSED, IMAGE_REFUSED, PARITY, "one address, one string"],
    patch: () => arm(CHECKS,
      "        ? e.cell.trim().replace(/\\$/g, '').toUpperCase() : null });\n  if (e.kind === 'slide-shape')",
      "        ? e.cell.trim().replace(/\\$/g, '') : null });\n  if (e.kind === 'slide-shape')"),
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
