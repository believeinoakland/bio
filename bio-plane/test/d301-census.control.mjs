/* NEGATIVE CONTROL for the class census's STRING-BLINDING.  D-301.
 *
 * Run:  node test/d301-census.control.mjs [armId ...]      (default: all)
 *
 * DELIBERATELY NOT A `.test.mjs`.  `scripts/battery.mjs` discovers by that suffix
 * and this driver EDITS REAL SOURCES and DEPOSITS REAL MODULES while it runs;
 * `walkfloor.control.mjs` and `d249-port.control.mjs` are the precedent, and this
 * file follows their rules exactly:
 *  - each arm armed ALONE, every other defence held OPEN;
 *  - every arm DECLARES, before it is ever run, what MUST fail and what MUST NOT;
 *  - a BASELINE arm exists, because a first run reporting failure everywhere cannot
 *    otherwise be told apart from a harness that breaks whatever it touches;
 *  - every restore verified by sha256 AND by byte comparison against a UNIQUELY
 *    NAMED per-arm pristine copy, with the byte count printed and floored;
 *  - a patch that matched ZERO times is a FINDING, never a silent no-op;
 *  - a tally with no FOOT line is reported as -1, never as 0.
 *
 * WHAT THE SUBJECT IS.  Until D-301 the census in `hygiene.test.mjs` read its
 * corpus through a comment-stripper local to that file, so a discovery primitive
 * inside a FIXTURE STRING counted as a walk.  It now reads through `stripToCode`
 * from `scripts/walkfloor.mjs` — the estate's one lexer.  The change has TWO
 * directions and this driver drives both, because the dangerous one is not the one
 * the debt row was written about:
 *   - the row's direction: a walking FIXTURE must stop being enumerated (`fixture`);
 *   - the TWIN: a REAL walk in live code must still be enumerated (`realwalk`, and
 *     `realinterp` for the spelling nobody anticipated — a primitive called inside a
 *     `${…}` of a template literal, which two live files in this estate actually
 *     do).  A matcher blinded too far reports a clean census over a real exposure,
 *     and its figures look exactly like a correct one's.
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";

/* M0-172 (scope-add, BOB #33 2026-09-24 17:12Z): the pristine copies used to be written beside the source as `${arm.file}.pristine-<arm>` —
   an UNDECLARED in-worktree pen no `.gitignore` line covers, dirtying the tree for the whole run and
   leaving an untracked copy of a source where the next walk enrols it if an arm is interrupted. They
   now go in a per-run `mkdtempSync` pen outside the worktree, through M0-182's one spelling. */
const PEN = controlPen("d301-census");

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const LEXER = join(PLANE, "scripts", "walkfloor.mjs");
const CENSUS = join(PLANE, "test", "hygiene.test.mjs");
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* THE FOOT LINE IS THE EVIDENCE THE MODULE REACHED ITS OWN END.  Without it a count
   is not a low number, it is NO number, and it is reported as -1 — a `TypeError`
   inside an assertion goes through no assertion at all while the tally reads clean. */
const runSuite = (rel) => {
  let out = "";
  try {
    out = execFileSync(process.execPath, [join(PLANE, rel)],
      { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) { out = `${e.stdout || ""}${e.stderr || ""}`; }
  const m = out.match(/\n(?:hygiene|walkfloor):\s+(\d+) pass, (\d+) fail/);
  if (!m) return { pass: -1, fail: -1, reachedFoot: false, out };
  return { pass: Number(m[1]), fail: Number(m[2]), reachedFoot: true, out };
};

const DEFAULT_SUITES = { hygiene: "test/hygiene.test.mjs", walkfloor: "test/walkfloor.test.mjs" };

/* THE PRIMITIVE, COMPOSED AND NEVER SPELLED AS ONE TOKEN IN THIS FILE'S OWN CODE.
   This driver is a COMMITTED `.mjs` under `bio-plane/test/`, which is a census root,
   so a literal `readdirSync(` written here in CODE would put a NEW UNGUARDED WALK
   into the very corpus the arms below measure — the arm moving the figure it exists
   to judge.  `walkfloor.control.mjs` composes its `op=` fixtures for the identical
   reason and says so at length; `test/op-claims.test.mjs` records the four places
   its first draft failed by citing itself.  The pieces below are strings, which the
   census is now blind to BY CONSTRUCTION — and that is this file's own quiet
   demonstration of the subject. */
const P = "readdir" + "Sync";

const REAL_WALK_PROBE = `/* ARM FIXTURE — a REAL walk in live code, no provenance import. Deleted by the driver. */
import { ${P} } from "node:fs";
export const names = ${P}(".").filter((n) => n.endsWith(".mjs"));
console.log(names.length);
`;

const REAL_INTERP_PROBE = `/* ARM FIXTURE — a REAL walk whose ONLY spelling is inside a template interpolation.
   Live code, and the shape \`scripts/battery.mjs:639\` and \`test/ref-variance-probe.mjs:414\`
   both use. Deleted by the driver. */
import { ${P} } from "node:fs";
console.log(\`this directory holds \${${P}(".").length} entr(ies)\`);
`;

/* THE FIXTURE ARM'S FIXTURE, WRITTEN FROM SCRATCH AND DELIBERATELY NOT TAKEN FROM
   THE ALLOWLIST.  `walkfigure.test.mjs`'s two-line library is the known instance, so
   reusing it would test that ONE file rather than the class.  This is a different
   subject (a plugin loader), a different spelling (a double-quoted string BESIDE a
   template literal), and a shape nothing in the estate has written: the module EXPORTS
   the two sources for a loader to write out and run, so the walk is real WHERE IT
   LANDS and is not a walk HERE.  That is precisely the line the matcher now draws,
   and it is the line the census's own CANNOT-SEE sentence states — a walk in a source
   string that something later executes is invisible here ON PURPOSE. */
const FIXTURE_PROBE = `/* ARM FIXTURE — a WALKING FIXTURE that performs no walk. Deleted by the driver. */
const LOADER_TEMPLATE = \`
  import { ${P} } from "node:fs";
  export function loadPlugins(dir) { return ${P}(dir).filter((n) => n.endsWith(".plugin.mjs")); }
\`;
const ONE_LINER = "export const all = (d) => ${P}(d);";
export const sources = { "loader.mjs": LOADER_TEMPLATE, "all.mjs": ONE_LINER };
`;

/* ------------------------------------------------------------------ THE ARMS */
/* `patch` returns the edited source, or null if it could not find its anchor.
   `expect` is the DECLARATION, written before the arm was ever run. */
const ARMS = [
  {
    id: "baseline",
    what: "NO EDIT AT ALL — the row that distinguishes five-arms-broken from five-arms-working",
    /* 32 -> 34, 2026-09-13 BY M0-25, AND THE OLD EXPECTATION WAS RIGHT WHEN IT WAS
       WRITTEN — it is SUPERSEDED, never exempted. M0-25 lands two files that walk a
       directory with a discovery primitive in code: `test/m025-arm-census.mjs` (the
       arm-liveness census, NAMED in hygiene's unguarded list — it runs the control
       drivers and floors on nothing) and `test/m025-arm-anchor-witness.test.mjs`
       (the battery-side half, which DOES floor and therefore asks
       `scripts/provenance.mjs`, so it enters the census on the GUARDED side).
       Hygiene's reach floor moved 32 -> 34 in the same turn, from the figure that
       run PRINTED. **This pin is the class M0-25 exists for, one step over: a
       control driver quoting a FIGURE rather than a line, going stale the same way
       and for the same reason.** It is corrected here rather than loosened to a
       `>=`, because an exact pin is what makes the `neuter` arm below a delta. */
    expect: "hygiene GREEN (0 fail) and walkfloor GREEN (0 fail). The census must print "
          + "`34 file(s)` — D-301's own 32 plus M0-25's two walking instruments. "
          + "If this row is red, every other row in this table is uninterpretable.",
    file: null, patch: null,
    ok: (r) => r.hygiene.fail === 0 && r.walkfloor.fail === 0 && /class census: 34 file\(s\)/.test(r.hygiene.out),
  },
  {
    id: "realwalk",
    what: "THE TWIN THIS ITEM CAN FAIL AT — a REAL discovery primitive in live code must "
        + "STILL be enumerated after the string-blinding",
    expect: "MUST FAIL: hygiene's GUARDED-or-NAMED arm, and the failure must NAME the probe "
          + "file. A matcher blinded too far reports a clean census over a real exposure, and "
          + "its figures are indistinguishable from a correct one's — this is the only arm "
          + "that can tell them apart. Held against `fixture` below, which is the SAME "
          + "primitive one quotation mark away, it is a DELTA rather than a claim about a file.",
    newFile: join(PLANE, "test", "d301-realwalk.probe.mjs"),
    body: REAL_WALK_PROBE,
    ok: (r) => r.hygiene.fail > 0 && /d301-realwalk\.probe\.mjs/.test(r.hygiene.out),
  },
  {
    id: "realinterp",
    what: "OVER-STRICTNESS, THE SPELLING NOBODY ANTICIPATED — a real walk whose only site is "
        + "inside a template INTERPOLATION must still be enumerated",
    expect: "MUST FAIL: hygiene's GUARDED-or-NAMED arm, NAMING the probe. This arm is here "
          + "because the first honest reading of 'blind to template literals' blanks `${…}` "
          + "too, and TWO LIVE FILES in this estate walk exactly that way — "
          + "`scripts/battery.mjs:639` and `test/ref-variance-probe.mjs:414`. Neither would "
          + "have LEFT the census (both have other code sites), so the membership figures "
          + "would have read correct while the matcher had gone blind. If this arm passes, "
          + "`keepInterpolations` is not doing its job and the census is quietly narrower "
          + "than its own stated rule.",
    newFile: join(PLANE, "test", "d301-realinterp.probe.mjs"),
    body: REAL_INTERP_PROBE,
    ok: (r) => r.hygiene.fail > 0 && /d301-realinterp\.probe\.mjs/.test(r.hygiene.out),
  },
  {
    id: "fixture",
    what: "THE ARM THIS ITEM EXISTS FOR — a WALKING FIXTURE in a template literal and in a "
        + "string must NOT be enumerated",
    /* 32 -> 34, 2026-09-13 BY M0-25 — the same supersession as the baseline arm
       above, same cause (two new walking instruments), and the same reason for
       keeping it EXACT rather than loosening it to a `>=`: this arm's whole claim
       is that the fixture is ABSENT FROM THE CORPUS, and only an exact figure can
       say so. */
    expect: "MUST **PASS**, both suites GREEN, and the census must still print `34 file(s)` — "
          + "the probe is not merely graded harmless, it is ABSENT FROM THE CORPUS. The "
          + "fixture is written from scratch and is NOT the one on the allowlist: reusing "
          + "`walkfigure.test.mjs`'s library would test that one file rather than the class.",
    newFile: join(PLANE, "test", "d301-fixture.probe.mjs"),
    body: FIXTURE_PROBE,
    ok: (r) => r.hygiene.fail === 0 && r.walkfloor.fail === 0 && /class census: 34 file\(s\)/.test(r.hygiene.out),
  },
  {
    id: "before",
    what: "THE BEFORE STATE, PROVED RATHER THAN DESCRIBED — the SAME fixture, read by the "
        + "comment-only stripper D-301 deleted",
    expect: "MUST FAIL: hygiene's GUARDED-or-NAMED arm, NAMING the fixture probe — which is "
          + "the exact reading `walkfigure.test.mjs` got on D-265's first full run, and the "
          + "whole reason this item exists. DELIBERATELY TWO EDITS AT ONCE, and it is the one "
          + "arm here that is: the claim is about a PAIR (this reader, that fixture), so "
          + "arming either half alone would prove nothing about the other. Held against "
          + "`fixture` above — same bytes, different reader — the pair is a DELTA over one "
          + "identifier.",
    file: CENSUS,
    patch: (s) => s.includes("const walks = (stripToCode(src).match(DISCOVERY) || []).length;")
      ? s.replace("const walks = (stripToCode(src).match(DISCOVERY) || []).length;",
                  "const walks = (stripComments(src).match(DISCOVERY) || []).length;")
      : null,
    extraImport: true,
    newFile: join(PLANE, "test", "d301-fixture.probe.mjs"),
    body: FIXTURE_PROBE,
    ok: (r) => r.hygiene.fail > 0 && /d301-fixture\.probe\.mjs/.test(r.hygiene.out),
  },
  {
    id: "neuter",
    what: "NEUTER THE READER — make the census's lexer blank EVERYTHING, so it sees no code at all",
    expect: "MUST FAIL as a DELTA WITH THE CORPUS PRINTED: the REACH arm goes red at "
          + "`0 walking file(s), floor <N>` (N non-zero) and the stale-list arm goes red naming all nine "
          + "entries at once. D-265's arm, re-proven on the moved matcher. A detector that "
          + "finds nothing passes every clean corpus, so without this row the `fixture` arm "
          + "above is satisfied for free — a census that looked at nothing would also report "
          + "the probe harmless. DECLARATION WIDENED BEFORE THE RE-RUN, NOT AFTER IT: this "
          + "arm's first run judged only hygiene, because `walkfloor.test.mjs` §1 did not yet "
          + "drive `stripToCode` directly. It does now, so walkfloor MUST FAIL here too — "
          + "and a lexer neutered at its own module failing only the CONSUMER would be the "
          + "finding, not the pass.",
    file: LEXER,
    patch: (s) => s.includes("export const stripToCode = (src) => strip(src, { keepInterpolations: true });")
      ? s.replace("export const stripToCode = (src) => strip(src, { keepInterpolations: true });",
                  "export const stripToCode = (src) => src.replace(/[^\\n]/g, \" \");")
      : null,
    /* `floor 32` -> `floor 34`, 2026-09-13 BY M0-25: hygiene's REACH floor moved
       with the corpus, from the figure that run PRINTED, so the message this arm
       reads for now names 34. The ARM is unchanged — a lexer blinded to everything
       must still report ZERO walking files against a non-zero floor, which is the
       delta this row exists to produce. */
    /* CORRECTED 2026-09-21 BY D-432, and the correction is to STOP NAMING THE NUMBER rather than to move it again:
       hygiene's REACH floor moved 34 -> 36 with the corpus (D-432's own walker, and one that had landed without moving
       it), and this predicate was the second reader of that figure — the second floor move that has had to come here
       (M0-25's 32 -> 34 was the first).
       What the arm proves never depended on the value: a lexer blinded to everything reports ZERO walking files
       against a NON-ZERO floor. So the predicate now asks exactly that (`floor [1-9]…`), and the next floor move
       leaves this row alone. `floor 0` still fails it, so a floor zeroed out cannot pass here either. */
    ok: (r) => r.hygiene.fail > 0 && r.walkfloor.fail > 0 && /0 walking file\(s\), floor [1-9]\d*/.test(r.hygiene.out),
  },
];

/* --------------------------------------------------------------------- RUNNER */
const wanted = process.argv.slice(2);
const arms = wanted.length ? ARMS.filter((a) => wanted.includes(a.id)) : ARMS;
if (wanted.length && arms.length !== wanted.length) {
  console.error(`unknown arm(s): ${wanted.filter((w) => !ARMS.some((a) => a.id === w)).join(", ")}`);
  process.exit(2);
}

console.log(`d301-census.control — ${arms.length} arm(s), each armed ALONE\n`);
const results = [];

for (const arm of arms) {
  console.log(`=== ARM ${arm.id} ===`);
  console.log(`  what:    ${arm.what}`);
  console.log(`  declare: ${arm.expect}`);

  let pristine = null, armedSource = false, armedFile = false, note = "";

  if (arm.file) {
    pristine = `${PEN}/${arm.file.split("/").pop()}.pristine-${arm.id}`;
    copyFileSync(arm.file, pristine);
    const beforeSha = sha(arm.file), beforeBytes = statSync(arm.file).size;
    console.log(`  pristine ${pristine.split("/").pop()} · ${beforeBytes} bytes · sha ${beforeSha.slice(0, 12)}…`);
    if (beforeBytes < 4000 || beforeSha === EMPTY_SHA) {
      console.log("  ABORT: pristine copy is implausibly small or empty — refusing to arm.");
      results.push({ id: arm.id, verdict: "ABORTED", note: "pristine floor" });
      unlinkSync(pristine); continue;
    }
    let patched = arm.patch(readFileSync(arm.file, "utf8"));
    /* The `before` arm needs the deleted reader back as well as the call site moved;
       `stripComments` is already exported by the same module, so one import line is
       the whole restoration. A patch that cannot find its anchor returns null above. */
    if (patched !== null && arm.extraImport) {
      const anchor = "import { sweepWalkFloors, strip as stripSource, stripToCode } from \"../scripts/walkfloor.mjs\";";
      patched = patched.includes(anchor)
        ? patched.replace(anchor, "import { sweepWalkFloors, strip as stripSource, stripToCode, stripComments } from \"../scripts/walkfloor.mjs\";")
        : null;
    }
    if (patched === null) {
      note = "PATCH MATCHED ZERO TIMES — AN ARM THAT DID NOT ARM IS A FINDING";
      console.log(`  !! ${note}`);
    } else { writeFileSync(arm.file, patched); armedSource = true; }
  }

  if (arm.newFile) {
    if (existsSync(arm.newFile)) {
      console.log(`  ABORT: ${arm.newFile} already exists`);
      if (pristine) { copyFileSync(pristine, arm.file); unlinkSync(pristine); }
      results.push({ id: arm.id, verdict: "ABORTED" }); continue;
    }
    writeFileSync(arm.newFile, arm.body);
    armedFile = true;
    console.log(`  added ${arm.newFile.split("/").pop()} · ${statSync(arm.newFile).size} bytes`);
  }

  const armed = arm.file ? (armedSource && (!arm.newFile || armedFile)) : (arm.newFile ? armedFile : true);
  if (!arm.file && !arm.newFile) console.log("  (no edit — baseline)");

  const suites = arm.suites ?? DEFAULT_SUITES;
  const r = {};
  for (const [key, rel] of Object.entries(suites)) {
    r[key] = runSuite(rel);
    console.log(`  ${`${key}:`.padEnd(11)}${r[key].pass} pass / ${r[key].fail} fail`
      + `${r[key].reachedFoot ? "" : "   <-- NO FOOT LINE: the module did not reach its own end"}`);
  }
  const printed = (r.hygiene.out.match(/ {2}class census: [^\n]*/) || ["  class census: NOT PRINTED"])[0];
  console.log(`  corpus:  ${printed.trim().slice(0, 150)}`);

  /* restore, and PROVE it */
  let restored = "n/a";
  if (arm.file) {
    const pSha = sha(pristine), pBytes = statSync(pristine).size;
    copyFileSync(pristine, arm.file);
    const aSha = sha(arm.file), aBytes = statSync(arm.file).size;
    const identical = readFileSync(arm.file).equals(readFileSync(pristine));   // the `cmp`
    restored = (aSha === pSha && identical && aBytes === pBytes && aBytes > 4000 && aSha !== EMPTY_SHA) ? "VERIFIED" : "FAILED";
    console.log(`  restore:  ${restored} · ${aBytes} bytes · sha ${aSha.slice(0, 12)}… · byte-compare ${identical ? "identical" : "DIFFERENT"}`);
    unlinkSync(pristine);
  }
  if (arm.newFile) {
    if (existsSync(arm.newFile)) unlinkSync(arm.newFile);
    const gone = !existsSync(arm.newFile);
    restored = restored === "n/a" ? (gone ? "VERIFIED" : "FAILED") : (gone ? restored : "FAILED");
    console.log(`  restore:  probe file ${gone ? "removed" : "STILL PRESENT"}`);
  }

  const verdict = !armed ? "DID NOT ARM" : (arm.ok(r) ? "AS DECLARED" : "NOT AS DECLARED");
  console.log(`  VERDICT:  ${verdict}${note ? ` (${note})` : ""}\n`);
  results.push({ id: arm.id, verdict, restored,
                 tallies: Object.entries(r).map(([k, v]) => `${k}=${v.pass}/${v.fail}`).join("  ") });
}

console.log("--- SUMMARY ---");
for (const r of results)
  console.log(`  ${r.id.padEnd(12)} ${String(r.verdict).padEnd(16)} restore=${r.restored}  ${r.tallies}`);
const bad = results.filter((r) => r.verdict !== "AS DECLARED" || (r.restored !== "VERIFIED" && r.restored !== "n/a"));
console.log(bad.length
  ? `\n${bad.length} arm(s) NOT as declared or not restored — RECORD THEM, do not smooth them.`
  : `\nall ${results.length} arm(s) as declared, every restore verified.`);
process.exit(bad.length ? 1 : 0);
