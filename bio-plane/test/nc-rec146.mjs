#!/usr/bin/env node
/* nc-rec146.mjs — REC-146's negative control, six arms, run with
 *     cd bio-plane && node test/nc-rec146.mjs [arm]
 *
 * THE DISCIPLINE, and every line of it is a rule this project paid for:
 *   - each arm EDITS A REAL SOURCE, is armed ALONE with every other held open,
 *     and is restored from a PRISTINE copy named UNIQUELY PER ARM;
 *   - the restore is verified by sha256 AND by `cmp`, with a byte count printed
 *     and a MINIMUM guarded — two harnesses once reported a restore
 *     byte-identical over an EMPTY manifest;
 *   - `git checkout -- <file>` is NEVER used: it restores HEAD and would discard
 *     the work this arm is being run against (CLAUDE.md section 7);
 *   - an arm that PATCHES ZERO TIMES is a FINDING and this harness says so
 *     rather than reporting a green run over an arm that never armed;
 *   - the BASELINE ROW IS FIRST and is not decoration: without it a run cannot
 *     tell six-arms-broken from six-arms-working.
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { anchorTable } from "../scripts/anchortable.mjs";

const SRC = { store: "src/store.mjs", index: "src/index.mjs" };
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* DECLARED BEFORE ARMING. `must_fail` names an assertion FRAGMENT that must be
   among the failures; `must_pass` one that must NOT be. Both are checked, because
   an arm that takes the whole suite down proves nothing about what it broke. */
const ARMS = {
  baseline: { file: null,
    why: "nothing armed. MUST be green — the row that tells all-arms-working from all-arms-broken" },
  viewer: { file: "index",
    find: `        || op === "contradictionpairs"`,
    to:   `        /* ARMED */`,
    why: "THE FAIL-CLOSED ARM. The op leaves the control plane's viewer-stamp list, so it arrives "
       + "with no viewer and viewerPredicate answers DENY. MUST fail: every pair-forming arm, with "
       + "EVERY answer EMPTY for every caller — a missing stamp is an outage, never a leak. MUST "
       + "NOT fail: the refusal arms, which name no material at all",
    must_fail: "ALL FOUR KEYS FORM", must_pass: "AN UNKNOWN KEY IS REFUSED BY NAME",
    /* AND THE ARM CHECKS WHAT THE DENIED ANSWER SAID, not only that it went empty.
       This is the whole reason the viewer arm exists on THIS op rather than being
       left to gate-reads.test.mjs: an empty contradiction report that does not say
       it compared nothing reads as A RECORD WITH NO CONTRADICTIONS, which is the
       record claiming more than it can support. So the arm demands the four keys
       name the `viewer` LEVEL — an outage, said as one. */
    must_see: '["viewer","viewer","viewer","viewer"]' },
  level: { file: "store",
    find: `      const empty = ladder.find((r) => !r.present);`,
    to:   `      const empty = { level: "inquiry" };  /* ARMED */`,
    why: "THE ITEM'S OWN ARM. Every key now names the same level whatever the record holds. MUST "
       + "fail: the six-state walk, at S0 (K4 must say `content` where K1 says `inquiry`), at S2, "
       + "at S3 and at the seven-levels set. MUST NOT fail: the pair-forming arms — the pairs are "
       + "still correct, and that is the point: a detector can be RIGHT about what it compared and "
       + "LYING about what it found nothing in",
    must_fail: "THE WALK, AS A SET", must_pass: "ALL FOUR KEYS FORM" },
  undetermined: { file: "store",
    find: `                          : datesKnown && da.date !== db.date ? "date" : null;`,
    to:   `                          : da.date !== db.date ? "date" : null;  /* ARMED */`,
    why: "THE GUESS. A date nobody stated now counts as a date that differs, so the pair FORMS on "
       + "an absence. MUST fail: the undetermined count (2 -> 0) and the not-formed arm. MUST NOT "
       + "fail: the over-strictness arm — the pair whose dates ARE both stated and differ",
    must_fail: "THE PAIR WITH A DATE NOBODY STATED",
    /* CORRECTED AFTER THE FIRST RUN, and the correction is the useful half. The
       declaration first named the over-strictness arm as it then stood, which
       asserted the COUNT of K4 pairs — and this arm ADDS pairs, so it took that
       assertion down too and the arm read NOT AS DECLARED. THE ARM WAS RIGHT AND
       THE DECLARATION WAS WRONG. The suite gained an over-strictness assertion
       asked BY IDENTITY (does the legitimate pair survive?) which a loosening
       cannot move, and this row names that one. */
    must_pass: "OVER-STRICTNESS, ASKED BY IDENTITY AND NOT BY COUNT" },
  dedup: { file: "store",
    find: `                        AND d2.bundle_id > d1.bundle_id`,
    to:   `                        AND d2.bundle_id <> d1.bundle_id  /* ARMED */`,
    why: "ONE PAIR COUNTED TWICE, once from each side. MUST fail: the no-double-count arm and the "
       + "1 -> 3 growth arm (three questions would give six). MUST NOT fail: the level arms, which "
       + "is the finding — a figure that is exactly double is still a figure, and only an assertion "
       + "about the SET can see it",
    must_fail: "no pair is counted twice", must_pass: "S0 EMPTY STORE" },
  overstrict: { file: "store",
    find: `         JOIN inquiry_basis_versions v2 ON v2.bundle_id = l2.bundle_id AND v2.name = l2.name
        WHERE l1.content_id IS NOT NULL`,
    to:   `         JOIN inquiry_basis_versions v2 ON v2.bundle_id = l2.bundle_id AND v2.name = l2.name
        WHERE v1.name = v2.name AND l1.content_id IS NOT NULL  /* ARMED */`,
    why: "THE OVER-STRICTNESS DIRECTION — a fence tighter than its rule, wearing the costume of "
       + "caution (`compare like with like`). K3 now pairs only readings that share a NAME, which "
       + "drops the legitimate pair. MUST fail: the four-keys arm and the 1 -> 3 growth. MUST NOT "
       + "fail: K1, K2 and K4, and the S0 walk",
    must_fail: "ALL FOUR KEYS FORM", must_pass: "S0 EMPTY STORE" },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). The driver's paths
   are relative to bio-plane/, where it is run; the rows carry them absolute. */
anchorTable(Object.entries(ARMS).filter(([, a]) => a.file)
  .map(([arm, a]) => ({ arm, file: fileURLToPath(new URL(`../${SRC[a.file]}`, import.meta.url)), find: a.find, put: a.to })));

const run = () => {
  try {
    const out = execFileSync(process.execPath, ["test/contradictionpairs.test.mjs"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
    return out;
  } catch (e) { return String(e.stdout || "") + String(e.stderr || ""); }
};
const tally = (out) => {
  const m = /contradictionpairs: (\d+) pass, (\d+) fail/.exec(out);
  /* THE SUITE'S OWN FOOT, OR -1. A missing tally is reported as -1 and NEVER as
     0: a TypeError inside an assertion goes through no assertion at all and ends
     the module while the count reads clean (kickoffs/WORKER.md). */
  return m ? { pass: +m[1], fail: +m[2] } : { pass: -1, fail: -1 };
};
const failedLabels = (out) => out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.trim());

const only = process.argv[2] || null;
const rows = [];
for (const [name, arm] of Object.entries(ARMS)) {
  if (only && only !== name) continue;
  let pristine = null, before = null, patched = 0;
  if (arm.file) {
    const path = SRC[arm.file];
    pristine = `test/.nc-rec146-pristine-${name}-${arm.file}.mjs`;
    copyFileSync(path, pristine);
    before = sha(path);
    const src = readFileSync(path, "utf8");
    patched = src.split(arm.find).length - 1;
    if (patched !== 1) {
      /* AN ARM THAT DID NOT ARM IS A FINDING. It is reported and the arm is
         SKIPPED rather than run, because a green run over an unarmed patch is
         indistinguishable from a green run over a working subject. */
      rows.push({ name, patched, note: "ARM DID NOT ARM — anchor matched " + patched + " time(s)" });
      unlinkSync(pristine);
      continue;
    }
    writeFileSync(path, src.replace(arm.find, arm.to));
  }
  const out = run();
  const tl = tally(out);
  const labels = failedLabels(out);
  if (arm.file) {
    const path = SRC[arm.file];
    writeFileSync(path, readFileSync(pristine));
    const after = sha(path);
    const bytes = readFileSync(path).length;
    let cmpOk = true;
    try { execFileSync("cmp", ["-s", path, pristine]); } catch { cmpOk = false; }
    /* THE MINIMUM GUARD: a restore that is byte-identical to an EMPTY file is
       byte-identical and worthless. */
    const restored = after === before && cmpOk && bytes > 100000;
    rows.push({ name, patched, ...tl,
                declared_see: arm.must_see ?? null,
                saw_see: arm.must_see ? out.includes(arm.must_see) : null,
                declared_fail: arm.must_fail, saw_fail: labels.some((l) => l.includes(arm.must_fail)),
                declared_pass: arm.must_pass, kept_pass: !labels.some((l) => l.includes(arm.must_pass)),
                restored, bytes, sha: after.slice(0, 12) });
    unlinkSync(pristine);
  } else {
    rows.push({ name, patched: 0, ...tl, restored: true, bytes: 0, sha: "n/a" });
  }
}

console.log("\nREC-146 NEGATIVE CONTROL — declared vs actual\n");
for (const r of rows) {
  if (r.note) { console.log(`  ${r.name.padEnd(13)} ${r.note}`); continue; }
  const verdict = r.name === "baseline"
    ? (r.fail === 0 ? "AS DECLARED" : "NOT AS DECLARED")
    : (r.saw_fail && r.kept_pass ? "AS DECLARED" : "NOT AS DECLARED");
  console.log(`  ${r.name.padEnd(13)} ${String(r.pass).padStart(3)}/${String(r.fail).padStart(2)}  `
    + `armed=${r.patched}  restored=${r.restored} (${r.bytes} B, ${r.sha})  ${verdict}`
    + (r.name === "baseline" ? "" : `\n${" ".repeat(17)}must fail: ${r.saw_fail} "${r.declared_fail}"`
      + `\n${" ".repeat(17)}must pass: ${r.kept_pass} "${r.declared_pass}"`
      + (r.declared_see ? `\n${" ".repeat(17)}must see:  ${r.saw_see} ${r.declared_see}` : "")));
}
const bad = rows.filter((r) => r.note || (r.name === "baseline" ? r.fail !== 0 : !(r.saw_fail && r.kept_pass))
                             || r.saw_see === false || r.restored !== true);
console.log(`\n${rows.length - bad.length}/${rows.length} arm(s) AS DECLARED, every file restored by sha256 and cmp.`);
if (existsSync("test/.nc-rec146-pristine-baseline-null.mjs")) unlinkSync("test/.nc-rec146-pristine-baseline-null.mjs");
process.exit(bad.length ? 1 : 0);
