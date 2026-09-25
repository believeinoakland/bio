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
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SAFE = controlPen("fw19");
mkdirSync(SAFE, { recursive: true });

const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const XLSXSRC = join(PLANE, "src/formats-xlsx.mjs");
const ODFSRC = join(PLANE, "src/odf.mjs");
/* D-415: the commit the named units were built on, BEFORE them — the `prefix`
   arm restores that file whole, which is the row's "before the fix". */
const D415_BASE = "5e8a65a837";
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 500000;   // bio-checks.mjs is ~713 KB; a restore over a stub must fail loudly.
/* D-415 added two smaller subjects: each carries its own floor (~45 KB and ~90 KB). */
const MIN_FOR = { [XLSXSRC]: 30000, [ODFSRC]: 60000 };

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
  if (ANCHOR_DRY) return (anchorPatch(file, find, replace), { armed: true, matches: 1 });   /* M0-197: read, never armed */
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
const D415_NAME = "D-415 a workbook's DEFINED NAME emits its";
const D415_SCOPED = "D-415 a sheet-scoped name carries its sheet";
const D415_TABLE = "D-415 a workbook's TABLE PART emits";
const D415_EXACT = "D-415 exactly these units and no others";
const D415_MULTI = "D-415 a MULTI-AREA name is SKIPPED";
const D415_OVER = "D-415 OVER-STRICTNESS";
const D415_ODS = "D-415 the .ods NAMED RANGE";
const D415_OP = "D-415 THROUGH THE OP";

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

/* D-415's arms. Each edits ONE source ALONE. `prefix` is the row's declared
   control: the reader as it stood before D-415, restored whole from git. */
Object.assign(ARMS, {
  d415prefix: {
    /* BOTH readers, because `odf.mjs` imports D-415's helpers from
       `formats-xlsx.mjs`: restoring the xlsx reader alone left the .ods one
       importing names that no longer exist and the suite died at LINK time
       (-1/-1, run 2026-09-25) — a control that moved a second variable. */
    files: [XLSXSRC, ODFSRC], suites: ["fw19"],
    why: `formats-xlsx.mjs and odf.mjs as they stood at ${D415_BASE}, BEFORE D-415: the defined-name arm emits none and fails BY NAME`,
    mustFail: [D415_NAME, D415_TABLE, D415_ODS, D415_OP],
    mustNotFail: [RANGE_REFUSED, TABLE_REFUSED, IMAGE_REFUSED, PIN, PARITY],
    patch: () => {
      /* c22-batch30 (M0-197 x D-415): this arm restores WHOLE files from git and quotes no line; under the anchor
         reader it must neither spawn nor write (anchordry traps both), so it reports armed and records nothing. */
      if (ANCHOR_DRY) return { armed: true, matches: 2 };
      for (const [file, rel, mark] of [[XLSXSRC, "bio-plane/src/formats-xlsx.mjs", "xlsxRangeUnits"],
                                       [ODFSRC, "bio-plane/src/odf.mjs", "odsRangeUnits"]]) {
        const r = spawnSync("git", ["show", `${D415_BASE}:${rel}`],
          { cwd: REPO, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
        if (r.status !== 0 || !r.stdout || r.stdout.includes(mark)) return { armed: false, matches: 0 };
        writeFileSync(file, r.stdout);
      }
      return { armed: true, matches: 2 };
    },
  },
  d415names: {
    files: [XLSXSRC], suites: ["fw19"],
    why: "skip the defined-name walk: no name's unit is emitted, while the TABLE part's still is",
    mustFail: [D415_NAME, D415_SCOPED, D415_OVER, D415_EXACT, D415_OP],
    mustNotFail: [D415_TABLE, D415_ODS, PARITY, PIN],
    patch: () => arm(XLSXSRC, "  for (const dn of parts.definedNames) {", "  for (const dn of []) {"),
  },
  d415tables: {
    files: [XLSXSRC], suites: ["fw19"],
    why: "skip the table-part walk: the table's unit is not emitted, while every defined name's still is",
    mustFail: [D415_TABLE, D415_EXACT],
    mustNotFail: [D415_NAME, D415_SCOPED, D415_OVER, D415_MULTI, D415_ODS, D415_OP],
    patch: () => arm(XLSXSRC, "  for (const t of parts.tables ?? []) {", "  for (const t of []) {"),
  },
  d415multi: {
    files: [XLSXSRC], suites: ["fw19"],
    why: "drop the multi-area guard: the two-area name is no longer skipped AS multi-area — its stated reason is wrong",
    mustFail: [D415_MULTI],
    mustNotFail: [D415_NAME, D415_TABLE, D415_OVER, D415_ODS, D415_OP],
    patch: () => arm(XLSXSRC, String.raw`  if (splitTopLevel(f, ",").length > 1 || /^\(.*\)$/.test(f)) return { why: "multi_area" };` + "\n", ""),
  },
  d415exact: {
    files: [XLSXSRC], suites: ["fw19"],
    why: "OVER-STRICTNESS: match sheet names only exactly: the lower-cased spelling of a sheet the workbook HAS is skipped",
    mustFail: [D415_OVER, D415_EXACT],
    mustNotFail: [D415_NAME, D415_TABLE, D415_MULTI, D415_OP, PARITY],
    patch: () => arm(XLSXSRC, "    if (ci.length === 1) sheet = ci[0];", "    if (false) sheet = ci[0];"),
  },
  d415ods: {
    files: [ODFSRC], suites: ["fw19"],
    why: "skip the .ods named-range walk: the .ods arm fails BY NAME while every XLSX unit holds",
    mustFail: [D415_ODS],
    mustNotFail: [D415_NAME, D415_TABLE, D415_EXACT, D415_OP, PARITY],
    patch: () => arm(ODFSRC, "  for (const { el, scope } of found) {", "  for (const { el, scope } of []) {"),
  },
});

anchorEach(ARMS, (a) => a.patch());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

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
    if (bytes < (MIN_FOR[f] ?? MIN_BYTES)) { console.log(`  ABORT        pristine copy of ${f} is ${bytes} B — below the guarded minimum`); process.exit(3); }
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
