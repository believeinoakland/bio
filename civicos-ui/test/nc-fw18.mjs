#!/usr/bin/env node
/* FW-18's NEGATIVE CONTROLS, in one step: `node civicos-ui/test/nc-fw18.mjs [arm]`
 * from the REPO ROOT.
 *
 * THE DISCIPLINE, and every clause of it is a receipt from this repository:
 *
 *   - each arm EDITS A REAL SOURCE and is armed ALONE, with the others held open;
 *   - each arm DECLARES, before it is armed, what MUST FAIL and what MUST STAY —
 *     because this item's subject is a SEPARATION between document classes, and an
 *     arm that only looked for new failures would score "every detector stopped
 *     detecting" as a success;
 *   - the restore is by `cp` from a UNIQUELY-NAMED per-arm pristine copy, never by
 *     `git checkout --`, which restores to HEAD and has twice in this repository
 *     silently discarded a session's own uncommitted work;
 *   - the restore is VERIFIED by sha256 AND by byte-for-byte comparison, with the
 *     byte count printed and a minimum guarded, because two harnesses once reported a
 *     restore byte-identical over an EMPTY manifest;
 *   - the patch must match EXACTLY ONCE. An arm that did not arm is a finding, and
 *     arms that matched zero times or twice have shipped here before;
 *   - the BASELINE is an arm. It is the row that distinguishes six-arms-working from
 *     six-arms-broken, and a harness without one has reported `null` for every arm
 *     including the baseline and been believed.
 *
 * The pen is `.fw18-pen/nc/`, inside this worktree and gitignored, never a shared
 * scratchpad — two workers have reported independently that the shared scratchpad is
 * not isolated between sessions.
 */
import { execFileSync } from "child_process";
import fs from "fs";
import crypto from "crypto";
import path from "path";

const ROOT = path.resolve(new URL("../../", import.meta.url).pathname);
const PEN = path.join(ROOT, ".fw18-pen", "nc");
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const D = (f) => path.join(ROOT, "docprofile", "doctypes", f);

/* Each arm: the file it edits, the exact patch, and what it declares. `expect` maps a
   fixture key to the primary type it MUST read as after the arm is armed. A key whose
   declared value differs from the baseline is a MUST-FAIL; a key whose value equals
   the baseline is a MUST-STAY, and the harness checks both. */
const DEAD = "detect() { return { match: false, confidence: \"none\" }; },";
const ARMS = {
  baseline: {
    why: "nothing armed. MUST be green — this is the row that tells six-arms-working from six-arms-broken.",
    file: null, expect: {},
  },
  minutes: {
    why: "meeting_minutes.detect neutered. MUST-FAIL: both minutes fixtures stop reading as meeting_minutes. "
       + "MUST-STAY: agenda, regulation and staff_report keep their own types.",
    file: D("meeting-minutes.mjs"),
    find: "  detect(ctx) {\n    const t = String(ctx.text || \"\");\n    const flat = flatten(t);\n    const signals = [];\n\n    const named = selfNaming(t, MINUTES_MASTHEAD);",
    repl: "  " + DEAD + "\n  _dead(ctx) {\n    const t = String(ctx.text || \"\");\n    const flat = flatten(t);\n    const signals = [];\n\n    const named = selfNaming(t, MINUTES_MASTHEAD);",
    expect: { minutes: "meeting_agenda", minutes_council: "generic" },
  },
  report: {
    why: "staff_report.detect neutered. MUST-FAIL: the staff-report fixture falls to generic — nothing else claims it. "
       + "MUST-STAY: all four others keep their own types.",
    file: D("staff-report.mjs"),
    find: "  detect(ctx) {\n    const t = String(ctx.text || \"\");\n    const flat = flatten(t);\n    const signals = [];\n\n    const memo = memoHeader(flat);",
    repl: "  " + DEAD + "\n  _dead(ctx) {\n    const t = String(ctx.text || \"\");\n    const flat = flatten(t);\n    const signals = [];\n\n    const memo = memoHeader(flat);",
    /* The report ALSO satisfies regulation, so with its own detector dead the document
       is claimed by regulation rather than falling to generic. That is the multi-class
       finding showing up inside the control, and it is DECLARED rather than discovered. */
    expect: { staff_report: "regulation" },
  },
  regulation: {
    why: "regulation.detect neutered. MUST-FAIL: the ordinance fixture falls to generic, and the staff report's "
       + "`also` loses regulation. MUST-STAY: every other primary verdict, the staff report's included.",
    file: D("regulation.mjs"),
    find: "  detect(ctx) {\n    const t = String(ctx.text || \"\");\n    const flat = flatten(t);\n    const signals = [];\n\n    const enacting = ENACTING.test(flat);",
    repl: "  " + DEAD + "\n  _dead(ctx) {\n    const t = String(ctx.text || \"\");\n    const flat = flatten(t);\n    const signals = [];\n\n    const enacting = ENACTING.test(flat);",
    expect: { regulation: "generic" },
    alsoGone: { staff_report: "regulation" },
  },
  /* RE-DECLARED AFTER ITS FIRST RUN, AND THE FIRST DECLARATION WAS THE THING THAT WAS
     WRONG. It said: arm the agenda's pre-FW-18 rule and the minutes MUST go back to
     reading as `meeting_agenda`. They did not — they stayed `meeting_minutes`, and the
     suite stayed green. The arm found a real property of the fix that neither the
     design nor this harness's author had separated: THE CORRECTION HAS TWO INDEPENDENT
     HALVES. `recognise` walks in registration order and breaks on the first CERTAIN
     detection, and `meeting_minutes` is registered BEFORE `meeting_agenda`, so once the
     minutes type exists the agenda is never even asked about a minutes document. The
     rate fence therefore does NOT bite on the primary verdict at all — it bites on the
     `also` list and on the confidence there.

     That is exactly the shape WORKER.md warns about: a real property that makes an arm
     which cannot bite look like a subject that cannot break. Both halves are now armed,
     each at the level it actually governs: `ratefence` below measures the fence, and
     `defect` after it arms BOTH halves and is the only arm that reproduces what was
     actually landed on `main` before this item. Recorded rather than smoothed. */
  ratefence: {
    why: "meeting_agenda's masthead-RATE test replaced by the bare /\\bAgenda\\b/i rule it carried before FW-18. "
       + "MUST-FAIL where the fence actually governs: the minutes' `also` entry for meeting_agenda rises from "
       + "LIKELY to CERTAIN, and the Council minutes — which have NO agenda masthead line at all — gain a "
       + "meeting_agenda `also` they did not have. MUST-STAY: every primary verdict, because registration order "
       + "already decides those (see the note above).",
    file: D("meeting-agenda.mjs"),
    find: "    const named = selfNaming(t, AGENDA_MASTHEAD);\n    const furniture = named >= FURNITURE_RECURS;",
    repl: "    const named = /\\bAgenda\\b/i.test(t) ? 99 : 0;\n    const furniture = named >= FURNITURE_RECURS;",
    expect: {},
    alsoGained: { minutes: "meeting_agenda:certain", minutes_council: "meeting_agenda:certain" },
    wantRed: true,
  },
  defect: {
    why: "THE DEFECT ARM, and it takes TWO patches because the correction has two halves (see above): the agenda's "
       + "pre-FW-18 bare-word rule AND the removal of meeting_minutes from the registry, which together are the "
       + "world as `main` held it before this item. MUST-FAIL: BOTH real sets of Oakland minutes read as "
       + "meeting_agenda at CERTAIN — the landed defect, reproduced on demand. MUST-STAY: the agenda, the ordinance "
       + "and the staff report keep their own types, because an arm that broke everything would prove nothing.",
    file: D("meeting-agenda.mjs"),
    find: "    const named = selfNaming(t, AGENDA_MASTHEAD);\n    const furniture = named >= FURNITURE_RECURS;",
    repl: "    const named = /\\bAgenda\\b/i.test(t) ? 99 : 0;\n    const furniture = named >= FURNITURE_RECURS;",
    file2: path.join(ROOT, "docprofile", "doctypes", "registry.mjs"),
    find2: "types.register(meetingMinutes);",
    repl2: "/* armed by nc-fw18 defect arm */",
    expect: { minutes: "meeting_agenda", minutes_council: "meeting_agenda" },
    wantRed: true,
  },
  overstrict: {
    why: "THE OVER-STRICTNESS DIRECTION, and it arms NO source. Every fixture is re-read with its text as a BARE "
       + "STRING instead of I2's itemised shape. MUST-STAY: every primary verdict identical — a type must not need "
       + "position to recognise its own class. MUST-CHANGE: position_parts falls to 0 and every entity's source "
       + "becomes absent, because a reader that still named a page over a string with no container structure would "
       + "be inventing an address.",
    file: null, string: true, expect: {},
  },
};

function probe(asString) {
  const out = execFileSync("node", [path.join(ROOT, "civicos-ui/test/nc-fw18.probe.mjs")]
    .concat(asString ? ["--string"] : []), { cwd: ROOT, encoding: "utf8" });
  const rows = {};
  for (const line of out.trim().split("\n")) {
    const [key, ...rest] = line.split(" ");
    rows[key] = Object.fromEntries(rest.map((kv) => kv.split("=")));
  }
  return rows;
}
function suiteGreen() {
  try { execFileSync("node", [path.join(ROOT, "civicos-ui/test/doctype-breadth.test.mjs")], { cwd: ROOT, stdio: "pipe" }); return true; }
  catch { return false; }
}

fs.mkdirSync(PEN, { recursive: true });
const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
if (only && !ARMS[only]) { console.error(`no such arm: ${only}`); process.exit(2); }

/* THE BASELINE ROW FIRST, ALWAYS — every other arm is read against it, so an arm
   comparing against nothing cannot happen. */
const base = probe(false);
const baseGreen = suiteGreen();
console.log("=== baseline (nothing armed) ===");
for (const k of Object.keys(base)) console.log(`  ${k}: ${JSON.stringify(base[k])}`);
console.log(`  suite green: ${baseGreen}`);
if (!baseGreen) { console.error("BASELINE IS RED. Every arm below would be measuring a broken tree."); process.exit(1); }

let bad = 0;
for (const name of names) {
  const arm = ARMS[name];
  console.log(`\n=== arm ${name} ===\n  DECLARED: ${arm.why}`);
  if (name === "baseline") { console.log("  RESULT: green as declared."); continue; }

  /* An arm may carry TWO patches (the `defect` arm does, because the correction it
     inverts is enforced in two places). Each patch gets its OWN uniquely-named pristine
     copy and its own restore verification; a shared copy would make the second restore
     unverifiable. */
  const patches = [];
  if (arm.file) patches.push({ file: arm.file, find: arm.find, repl: arm.repl, tag: "a" });
  if (arm.file2) patches.push({ file: arm.file2, find: arm.find2, repl: arm.repl2, tag: "b" });

  let armFailedToArm = false;
  for (const p of patches) {
    p.pristine = path.join(PEN, `pristine.${name}.${p.tag}.${path.basename(p.file)}`);
    fs.copyFileSync(p.file, p.pristine);
    p.before = sha(p.file);
    p.size = fs.statSync(p.file).size;
    if (p.size < 2000) { console.error(`  ARM DID NOT ARM: ${p.file} is only ${p.size} bytes`); armFailedToArm = true; break; }
    const src = fs.readFileSync(p.file, "utf8");
    const hits = src.split(p.find).length - 1;
    if (hits !== 1) {
      console.error(`  ARM DID NOT ARM: the patch on ${path.basename(p.file)} matched ${hits} time(s), not exactly once. THIS IS A FINDING.`);
      armFailedToArm = true; break;
    }
    fs.writeFileSync(p.file, src.replace(p.find, p.repl));
    if (sha(p.file) === p.before) { console.error("  ARM DID NOT ARM: the file is byte-identical after patching."); armFailedToArm = true; break; }
  }
  if (armFailedToArm) {
    for (const p of patches) if (p.pristine && fs.existsSync(p.pristine)) fs.copyFileSync(p.pristine, p.file);
    bad++; continue;
  }

  let rows, green;
  try {
    rows = probe(!!arm.string);
    green = arm.string ? true : suiteGreen();
  } finally {
    for (const p of patches) {
      fs.copyFileSync(p.pristine, p.file);
      const after = sha(p.file);
      let identical = after === p.before;
      try { execFileSync("cmp", ["-s", p.pristine, p.file]); } catch { identical = false; }
      const bytes = fs.statSync(p.file).size;
      console.log(`  restored byte-identically: ${identical ? "YES" : "NO"} — ${path.basename(p.file)} (${bytes} bytes, sha ${after.slice(0, 12)})`);
      if (!identical || bytes !== p.size) { console.error("  RESTORE FAILED — the tree is not what it was."); bad++; }
    }
  }

  /* MUST-FAIL and MUST-STAY, checked separately. */
  let armBad = 0;
  for (const [k, want] of Object.entries(arm.expect || {})) {
    const got = rows[k] && rows[k].type;
    const moved = base[k].type !== want;
    const okRow = got === want;
    console.log(`  ${moved ? "MUST-FAIL" : "MUST-STAY"} ${k}: was ${base[k].type} -> want ${want}, got ${got} ${okRow ? "OK" : "*** WRONG ***"}`);
    if (!okRow) armBad++;
  }
  for (const [k, gone] of Object.entries(arm.alsoGone || {})) {
    const had = (base[k].also || "").split("+").some((x) => x.split(":")[0] === gone);
    const has = (rows[k].also || "").split("+").some((x) => x.split(":")[0] === gone);
    console.log(`  MUST-FAIL ${k}.also loses ${gone}: had=${had} has=${has} ${had && !has ? "OK" : "*** WRONG ***"}`);
    if (!(had && !has)) armBad++;
  }
  /* The `also` list is where the rate fence governs, so an arm may declare a GAIN there
     while every primary verdict stays — which is the whole point of separating the two
     halves of this item's correction. */
  for (const [k, gained] of Object.entries(arm.alsoGained || {})) {
    const had = (base[k].also || "").split("+").includes(gained);
    const has = (rows[k].also || "").split("+").includes(gained);
    console.log(`  MUST-FAIL ${k}.also gains ${gained}: was "${base[k].also}" now "${rows[k].also}" ${!had && has ? "OK" : "*** WRONG ***"}`);
    if (!(!had && has)) armBad++;
  }
  /* Every fixture NOT named in `expect` is a MUST-STAY by default — this is what stops
     an arm that broke everything from reading as a success. */
  for (const k of Object.keys(base)) {
    if (arm.expect && k in arm.expect) continue;
    const okRow = rows[k] && rows[k].type === base[k].type;
    if (!okRow) { console.error(`  MUST-STAY ${k}: was ${base[k].type}, is now ${rows[k] && rows[k].type} *** WRONG ***`); armBad++; }
  }
  if (arm.string) {
    for (const k of Object.keys(base)) {
      const partsGone = rows[k].parts === "0";
      const posGone = rows[k].pos === "0";
      console.log(`  MUST-CHANGE ${k}: parts ${base[k].parts} -> ${rows[k].parts}, positioned ${base[k].pos} -> ${rows[k].pos} ${partsGone && posGone ? "OK" : "*** WRONG ***"}`);
      if (!(partsGone && posGone)) armBad++;
    }
  } else {
    const wantRed = arm.wantRed != null ? arm.wantRed
      : Object.keys(arm.expect || {}).length > 0 || Object.keys(arm.alsoGone || {}).length > 0;
    console.log(`  suite: ${green ? "green" : "RED"} (declared ${wantRed ? "RED" : "green"}) ${green !== wantRed ? "OK" : "*** WRONG ***"}`);
    if (green === wantRed) armBad++;
  }
  console.log(`  RESULT: ${armBad ? `${armBad} declaration(s) NOT met` : "as declared"}`);
  bad += armBad;
}

console.log(`\n${bad ? `${bad} declaration(s) not met` : "every arm as declared"}`);
process.exit(bad ? 1 : 0);
