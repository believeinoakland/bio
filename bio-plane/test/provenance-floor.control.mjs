#!/usr/bin/env node
/* provenance-floor.control.mjs — M0-18's NEGATIVE CONTROLS, RUN AGAINST THE
 * REAL TREE.
 *
 *     node test/provenance-floor.control.mjs
 *
 * IT IS DESTRUCTIVE WHILE IT RUNS, so it is deliberately NOT a `.test.mjs` and
 * the battery does not run it. It is COMMITTED so the next session re-runs these
 * arms in ONE STEP instead of re-deriving how to break the subject.
 *
 * WHAT M0-18 CHANGED, in one sentence: seven walks in `bio-plane/` read their
 * corpus off the WORKING TREE and then FLOORED on what they found, so an
 * untracked arrival could only push a floor the wrong way; the SWEEP still reads
 * the whole tree, and the FLOOR is now computed over `git ls-tree HEAD` alone
 * through `scripts/provenance.mjs`. An eighth walk
 * (`test/machine-fences.test.mjs`) floors on nothing and instead lets a walked
 * file SATISFY a requirement, which needed the opposite narrowing and is armed
 * separately below.
 *
 * THE PHANTOM IS WRITTEN, NEVER DELIVERED BY `git stash`. `refs/stash` is
 * REPOSITORY-WIDE across all sixty worktrees of this repository and `push -u`
 * carries untracked files, so arming the real mechanism would arm it FOR
 * EVERYBODY — which is the defect, not a way to reproduce it. What these arms
 * need is the STATE a stash pop produces (present in the tree, absent from
 * HEAD), and writing a file produces it exactly.
 *
 * EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT (`cmp`-equivalent: a full
 * byte comparison against a UNIQUELY-NAMED PER-ARM pristine copy), with the byte
 * count PRINTED and floored — because two harnesses in this repository have
 * reported a restore byte-identical OVER AN EMPTY MANIFEST, caught only because
 * a digest read `e3b0c442…`, the sha256 of the empty string.
 *
 * ---- THE ARMS, DECLARED BEFORE ANY OF THEM IS ARMED ------------------------
 *
 *  (0) BASELINE — no patch at all. Every subject green. Without this row, eight
 *      arms failing for a reason unrelated to their subject reads exactly like
 *      eight arms working: a harness in this repository once reported `null` for
 *      every arm INCLUDING the baseline and only the baseline made it visible.
 *  (1) A PHANTOM in `bio-plane/src/` -> the provenance report NAMES it
 *      UNTRACKED, the CONTAMINATED corpus rises, the REPRODUCIBLE figures HOLD,
 *      and the suites stay GREEN. MUST NOT fail: a phantom is not by itself an
 *      error.
 *  (2) **THE DECISIVE PAIR, and without it this item is decoration.** With the
 *      phantom present, a floor set to the CONTAMINATED count must FAIL in the
 *      M0-18 spelling and PASS in the pre-M0-18 spelling. The git backing is
 *      what makes the difference, measured rather than argued.
 *  (3) GIT SHIMMED TO EXIT 1 -> the report says UNVERIFIED, the suites stay
 *      GREEN, and NO printed line claims "in the commit at HEAD" in the same
 *      breath as admitting it could not look (D-233; D-257's ARM 3 found exactly
 *      that sentence in the first draft of this pattern).
 *  (4) OVER-STRICTNESS — an UNCOMMITTED EDIT TO A TRACKED FILE must still COUNT.
 *      Provenance answers about a PATH, never about content, so a fence minted
 *      in a tracked file a worker is editing right now must still reach the
 *      reproducible figure. MUST NOT fail.
 *  (5) THE SWEEP MUST NOT HAVE NARROWED — a phantom carrying a REAL FINDING must
 *      still red its suite. This is the half the floor change must not cost, and
 *      an arm that only proved the floor moved would have missed it.
 *  (6) **THE SIXTH WALK'S OWN DECISIVE PAIR**, and it is a different exposure
 *      from (2) rather than a repeat of it. In three stages, because the first
 *      draft of it NEVER ARMED and the reason is recorded at the site: stage 1
 *      moves BOTH committed pinning suites aside and LEARNS the affected codes
 *      from the instrument's own failure output (they are never typed here —
 *      this file would otherwise have pinned them itself); then with a PHANTOM
 *      supplying those pins, the M0-18 spelling FAILS (the pin is in no commit)
 *      and the pre-M0-18 spelling PASSES (the requirement met by a file no other
 *      checkout has).
 *  (7) THE IMPORT REMOVED from a guarded suite, with its allowlist entry already
 *      gone -> `hygiene.test.mjs`'s class census goes RED naming that file.
 *      Removing the entry is ENFORCED rather than decorative.
 *  (8) **op-claims' DOT-SEGMENT RULE, THE PAIR.** A dot-directory holding a copy
 *      of real prose -> GREEN under M0-18's rule, RED under the pre-M0-18 named
 *      list. This reproduces D-257's measured battery-red (its control harness's
 *      pristine copies produced ten findings) and shows it closed.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLANE = path.join(HERE, "..");
const REPO = path.join(PLANE, "..");
const PRISTINE = path.join(HERE, ".m0-18-pristine");   // inside this worktree, never a shared scratchpad

const F = {
  identity:   path.join(HERE, "identity-claims.test.mjs"),
  dec49:      path.join(HERE, "machinefences-dec49.test.mjs"),
  planning:   path.join(HERE, "planning-hygiene.test.mjs"),
  fences:     path.join(HERE, "machine-fences.test.mjs"),
  shadowed:   path.join(HERE, "shadowed-refusals.test.mjs"),
  bounds:     path.join(HERE, "bounds.test.mjs"),
  hygiene:    path.join(HERE, "hygiene.test.mjs"),
  opclaimsT:  path.join(HERE, "op-claims.test.mjs"),
  opclaimsS:  path.join(PLANE, "scripts", "op-claims.mjs"),
};
/* The phantoms. Written, never stashed. Each is removed by the arm that made it. */
const PHANTOM_SRC     = path.join(PLANE, "src", "zz-m0-18-phantom.mjs");
const PHANTOM_DOC     = path.join(REPO, "docs", "development", "ZZ-M0-18-PHANTOM.md");
const PHANTOM_PIN     = path.join(HERE, "zz-m0-18-pin-phantom.mjs");
const PHANTOM_DOTDIR  = path.join(REPO, ".m0-18-arm8");
const PHANTOM_DOTFILE = path.join(PHANTOM_DOTDIR, "copied-prose.md");
const GITSHIM         = path.join(HERE, ".m0-18-gitshim");

const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

let failures = 0, checks = 0;
/* THE ARM ROSTER, asserted at the foot (D-355, 2026-09-21). Every arm id that actually RAN is pushed
   here; the foot fails naming any declared arm that did not run and any that ran undeclared. The
   cheapest way past a red arm is to delete it, and a deleted arm leaves no failing check behind — this
   is the check it leaves. `6 stage 1` is announced twice (a heading, then the arm) and counted once. */
const DECLARED_ARMS = ["0", "1", "2a", "2b", "3", "4", "5", "6-stage-1", "6a", "6b", "7", "8a", "8b"];
const RAN = [];
const report = (name, ok, detail) => {
  checks++;
  if (ok) console.log(`  ok   ${name}`);
  else { failures++; console.log(`  FAIL ${name}\n       ${detail}`); }
};

/* Run a suite and return its exit status and output. Never piped: the status is
   the process's own, read directly. */
function runSuite(file, env = {}) {
  try {
    const out = execFileSync("node", [file], { cwd: PLANE, stdio: "pipe", env: { ...process.env, ...env },
      maxBuffer: 1 << 28 });
    return { exit: 0, out: String(out) };
  } catch (e) {
    return { exit: e.status ?? -1, out: String(e.stdout || "") + String(e.stderr || "") };
  }
}
const tally = (out) => {
  const m = out.match(/(\d+)\s+pass,\s+(\d+)\s+fail/);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is reported as
     -1 and never as 0. */
  return m ? { pass: +m[1], fail: +m[2] } : { pass: -1, fail: -1 };
};

/* ---- the arming primitive -------------------------------------------------
   `edits` is [{file, from, to}], applied cumulatively per file. `writes` is
   [{file, text}] — the phantoms. `aside` is [file] — moved out of the tree
   entirely, which is what "the pin was never committed here" actually means.
   Every touched file gets a UNIQUELY-NAMED pristine copy under `.m0-18-pristine`
   and is verified back by hash AND by full byte comparison, with the byte count
   printed and floored. */
function arm(name, { edits = [], writes = [], aside = [], run }) {
  console.log(`\n--- ARM ${name}`);
  RAN.push(name.split(" ")[0]);
  fs.mkdirSync(PRISTINE, { recursive: true });
  const touched = [...new Set([...edits.map((e) => e.file), ...aside])];
  const copies = new Map();
  const slug = name.replace(/[^A-Za-z0-9]+/g, "-").slice(0, 40);
  for (const f of touched) {
    const c = path.join(PRISTINE, `${slug}--${path.basename(f)}`);   // uniquely named PER ARM
    fs.copyFileSync(f, c);
    copies.set(f, { copy: c, hash: sha(f), bytes: fs.statSync(f).size });
  }

  let armed = true;
  const buffers = new Map();
  for (const f of touched) if (!aside.includes(f)) buffers.set(f, fs.readFileSync(f, "utf8"));
  for (const e of edits) {
    const before = buffers.get(e.file);
    if (!before.includes(e.from)) {
      report(`${name} · ARMED`, false, `patch anchor NOT FOUND in ${path.relative(REPO, e.file)}: ${JSON.stringify(e.from.slice(0, 90))}`);
      armed = false; break;
    }
    const occurrences = before.split(e.from).length - 1;
    if (occurrences !== 1) {
      report(`${name} · ARMED`, false, `patch anchor occurs ${occurrences} times in ${path.relative(REPO, e.file)} — an ambiguous arm is not an arm`);
      armed = false; break;
    }
    buffers.set(e.file, before.replace(e.from, e.to));
  }

  let result = null;
  if (armed) {
    for (const [f, text] of buffers) fs.writeFileSync(f, text);
    for (const f of aside) fs.renameSync(f, f + ".m0-18-aside");
    for (const w of writes) { fs.mkdirSync(path.dirname(w.file), { recursive: true }); fs.writeFileSync(w.file, w.text); }
    try { result = run(); }
    finally {
      for (const w of writes) { try { fs.rmSync(w.file, { force: true }); } catch {} }
      try { fs.rmSync(PHANTOM_DOTDIR, { recursive: true, force: true }); } catch {}
      for (const f of aside) { try { fs.renameSync(f + ".m0-18-aside", f); } catch {} }
      for (const [f, { copy }] of copies) fs.copyFileSync(copy, f);
    }
  }

  /* THE RESTORE, PROVED THREE WAYS AND NEVER OVER AN EMPTY FILE. */
  for (const [f, { copy, hash, bytes }] of copies) {
    const rel = path.relative(REPO, f);
    const now = fs.readFileSync(f);
    const pristineBytes = fs.readFileSync(copy);
    const sameBytes = Buffer.compare(now, pristineBytes) === 0;
    report(`${name} · RESTORED ${rel} (sha256 + full byte compare, ${now.length} bytes)`,
      sha(f) === hash && sameBytes && now.length === bytes && now.length > 1000,
      `hash ${sha(f) === hash}, bytes-equal ${sameBytes}, length ${now.length} (was ${bytes}, floor 1000)`);
  }
  for (const w of writes)
    report(`${name} · phantom removed ${path.relative(REPO, w.file)}`, !fs.existsSync(w.file), "still present");
  for (const f of aside)
    report(`${name} · returned ${path.relative(REPO, f)}`, fs.existsSync(f) && !fs.existsSync(f + ".m0-18-aside"), "not returned");
  return result;
}

/* =========================================================================== */
console.log("M0-18 · provenance floors — negative controls\n"
  + `repo ${REPO}\nHEAD ${execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim()}`);

/* ---- (0) BASELINE --------------------------------------------------------- */
console.log("\n--- ARM 0 · BASELINE (no patch)");
RAN.push("0");
const BASE = {};
for (const [k, f] of [["identity", F.identity], ["dec49", F.dec49], ["planning", F.planning],
                      ["fences", F.fences], ["bounds", F.bounds], ["opclaims", F.opclaimsT],
                      ["hygiene", F.hygiene]]) {
  const r = runSuite(f);
  BASE[k] = { ...tally(r.out), exit: r.exit, out: r.out };
  report(`0 · ${k} green (${BASE[k].pass} pass, ${BASE[k].fail} fail, exit ${r.exit})`,
    r.exit === 0 && BASE[k].fail === 0 && BASE[k].pass > 0,
    `exit ${r.exit}, tally ${BASE[k].pass}/${BASE[k].fail} — a -1 tally means the suite never reached its own FOOT`);
}
for (const line of Object.values(BASE).flatMap((b) => b.out.split("\n").filter((l) => /REPRODUCIBLE|pin roster/.test(l))))
  console.log(`       ${line.trim()}`);

/* ---- (1) A PHANTOM, NAMED, AND THE REPRODUCIBLE FIGURES HOLD --------------- */
const PHANTOM_BODY = `/* M0-18 control phantom. Written by test/provenance-floor.control.mjs and
   removed by it. Deliberately inert: it mints no refusal code, names no op, and
   emits no page-shaped rendering, so the only thing it can do to a walk is be
   COUNTED. That is the whole point of the arm. */
export const zzM0d18Phantom = () => "the member decided";
`;
const ARM1 = arm("1 · a phantom in src/ is NAMED, and the reproducible figures HOLD", {
  writes: [{ file: PHANTOM_SRC, text: PHANTOM_BODY }],
  run() {
    const id = runSuite(F.identity), d49 = runSuite(F.dec49);
    const idT = tally(id.out), d49T = tally(d49.out);
    const named = /zz-m0-18-phantom\.mjs\s+\(UNTRACKED\)/.test(id.out);
    const repro = id.out.match(/wide ledger, REPRODUCIBLE: (\d+) of (\d+) file\(s\)/);
    report("1 · the report NAMES the phantom as UNTRACKED rather than only classifying it", named,
      "no `zz-m0-18-phantom.mjs (UNTRACKED)` line in identity-claims' output");
    report("1 · the CONTAMINATED corpus rose and the REPRODUCIBLE one did NOT",
      !!repro && +repro[2] > +repro[1], repro ? `repro ${repro[1]} of contaminated ${repro[2]}` : "no REPRODUCIBLE line");
    report(`1 · and both suites stay GREEN — a phantom is not by itself an error `
      + `(identity ${idT.pass}/${idT.fail}, dec49 ${d49T.pass}/${d49T.fail})`,
      id.exit === 0 && d49.exit === 0 && idT.fail === 0 && d49T.fail === 0,
      `identity exit ${id.exit}, dec49 exit ${d49.exit}`);
    return { repro: repro && +repro[1], contaminated: repro && +repro[2] };
  },
});

/* ---- (2) THE DECISIVE PAIR ------------------------------------------------ */
/* RE-AIMED 2026-09-21 BY D-355, NEVER EXEMPTED — THE FLOOR IS NOW READ FROM ARM 1, NEVER TYPED.
 *
 * As written (M0-18, `57dd36c8`, merged `f2d70204` on 2026-08-09) both arms set the floor to the
 * literal 28, and 28 WAS the contaminated count that day: 27 `.mjs` files of `src/` + `checks/` in the
 * commit, plus this file's one phantom. At `bb0e10bd` (2026-08-10 10:34 -0700, the SK-2 merge, which
 * added `src/skilldoctrine.mjs`) the COMMITTED corpus itself reached 28, so from that merge on the
 * M0-18 spelling met the floor with NO help from the phantom and 2a PASSED where it declared FAIL.
 * A CORPUS GROWTH, not a behaviour move: the reproducible-floor mechanism was right the whole time,
 * and the committed corpus is 33 of 33 on 2026-09-21 (M0-29 met the same red at `e9ba393` on
 * 2026-09-14, "55 of 58"). The number 28 was right when it was written, and it is kept here for that.
 *
 * WHAT THE PAIR MEANS HAS NOT MOVED: a floor ONE ABOVE THE REPRODUCIBLE CORPUS — exactly the count a
 * single phantom produces — must fail in the M0-18 spelling and pass in the pre-M0-18 one. Arm 1
 * MEASURES that count with the same phantom present, so the floor is taken from it; it cannot decay as
 * `src/` grows, and if arm 1 measured nothing both arms say NOT ARMED rather than guessing a figure. */
const NEW_SPELLING = "FILES_REPRO.length >= 24, true);";
const OLD_SPELLING_HINT = "files.length >= 24";
const CONTAMINATED = ARM1 && Number.isFinite(ARM1.contaminated) && Number.isFinite(ARM1.repro)
  && ARM1.contaminated === ARM1.repro + 1 ? ARM1.contaminated : null;
console.log(`\n    the pair's floor, READ from arm 1: ${CONTAMINATED === null
  ? `NONE — arm 1 measured ${JSON.stringify(ARM1)}, which is not one phantom over the reproducible corpus`
  : `${CONTAMINATED} (the reproducible corpus ${ARM1.repro}, plus the one phantom)`}`);
if (CONTAMINATED === null) {
  report("2a · ARMED — a contaminated count one above the reproducible corpus was measured by arm 1", false,
    `arm 1 returned ${JSON.stringify(ARM1)}; a pair with no measured floor is an arm that did not arm`);
  report("2b · ARMED — a contaminated count one above the reproducible corpus was measured by arm 1", false,
    `arm 1 returned ${JSON.stringify(ARM1)}; a pair with no measured floor is an arm that did not arm`);
}
if (CONTAMINATED !== null) arm("2a · a floor at the CONTAMINATED count FAILS in the M0-18 spelling", {
  writes: [{ file: PHANTOM_SRC, text: PHANTOM_BODY }],
  edits: [{ file: F.identity, from: NEW_SPELLING, to: `FILES_REPRO.length >= ${CONTAMINATED}, true);` }],
  run() {
    const r = runSuite(F.identity), tl = tally(r.out);
    report(`2a · FAILS, because ${CONTAMINATED - 1} files are in the commit and ${CONTAMINATED} were walked — the floor is the `
      + `reproducible figure and cannot be met by an arrival (${tl.pass} pass, ${tl.fail} fail)`,
      r.exit !== 0 && tl.fail > 0, `exit ${r.exit}, tally ${tl.pass}/${tl.fail} — expected a FAILURE`);
    return tl;
  },
});
if (CONTAMINATED !== null) arm("2b · the SAME floor PASSES in the pre-M0-18 spelling — the git backing is the difference", {
  writes: [{ file: PHANTOM_SRC, text: PHANTOM_BODY }],
  edits: [{ file: F.identity, from: NEW_SPELLING, to: `files.length >= ${CONTAMINATED}, true);` }],
  run() {
    const r = runSuite(F.identity), tl = tally(r.out);
    report("2b · PASSES over the contaminated walk — this is the state M0-18 removed, and a floor moved "
      + `here would have been permanently too high for every other checkout (${tl.pass} pass, ${tl.fail} fail)`,
      r.exit === 0 && tl.fail === 0, `exit ${r.exit}, tally ${tl.pass}/${tl.fail} — expected a PASS`);
    return tl;
  },
});

/* ---- (3) GIT SHIMMED TO FAIL ---------------------------------------------- */
console.log("\n--- ARM 3 · git shimmed to exit 1");
RAN.push("3");
fs.mkdirSync(GITSHIM, { recursive: true });
fs.writeFileSync(path.join(GITSHIM, "git"), "#!/bin/sh\nexit 1\n");
fs.chmodSync(path.join(GITSHIM, "git"), 0o755);
try {
  const env = { PATH: `${GITSHIM}:${process.env.PATH}` };
  for (const [k, f] of [["identity", F.identity], ["planning", F.planning], ["bounds", F.bounds], ["fences", F.fences]]) {
    const r = runSuite(f, env), tl = tally(r.out);
    /* RE-AIMED 2026-09-21 BY D-355 FOR `planning` ONLY, NEVER EXEMPTED — A SUITE GROWTH, DATED.
       "stays GREEN" was the right proxy on 2026-08-09: nothing in planning-hygiene needed git except
       M0-18's own walk, and that walk degrades to UNVERIFIED. The suite then GREW four assertions that
       RUN `tools/plancheck.mjs --local` and read its report — two at `ff26024f` (2026-09-14 17:52 -0700,
       M0-30's row-design check) and two at `e88dcaeb` (2026-09-16 20:57 -0400, M0-37's delegation
       register) — and plancheck reads git BY DESIGN. With git shimmed those four fail and nothing else
       does: measured 2026-09-21 with this very shim, 276 pass, 4 fail, all four labels opening
       `plancheck`. M0-29 met the first two at `e9ba393` (2026-09-14). The arm's SUBJECT is M0-18's walk,
       so the check is now what that walk owes: every assertion planning FAILS without git reads
       plancheck's own output, and there are no other failures — a failure in the walk itself would
       carry any other label and fail this. Over-strictness: if plancheck ever answers without git and
       those four pass, this still passes. Identity, bounds and fences carry no such dependency and still
       owe a fully GREEN run. */
    if (k === "planning") {
      const failedLabels = [...r.out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1].trim());
      const foreign = failedLabels.filter((l) => !/^plancheck\b/.test(l));
      report(`3 · planning's M0-18 walk stays GREEN with git unavailable — its only failures are assertions that `
        + `READ tools/plancheck.mjs, which needs git by design (${tl.pass} pass, ${tl.fail} fail · `
        + `${failedLabels.length - foreign.length} plancheck-reading, ${foreign.length} other)`,
        tl.pass > 0 && tl.fail === failedLabels.length && foreign.length === 0,
        `tally ${tl.pass}/${tl.fail}, named failures ${failedLabels.length}, OTHER failures: `
        + `${JSON.stringify(foreign).slice(0, 300)}`);
    } else {
      report(`3 · ${k} stays GREEN with git unavailable (${tl.pass} pass, ${tl.fail} fail)`,
        r.exit === 0 && tl.fail === 0, `exit ${r.exit}, tally ${tl.pass}/${tl.fail}`);
    }
    report(`3 · ${k} says UNVERIFIED`, /UNVERIFIED/.test(r.out), "no UNVERIFIED in the output");
    /* D-257's ARM 3 CAME BACK WRONG AND FOUND A DEFECT IN THE FIX RATHER THAN IN
       THE ARM: the label still read "in the commit at HEAD (unverified)", a
       sentence claiming the commit while admitting it could not look. This arm
       exists so that cannot recur silently here. */
    report(`3 · ...and NO line claims "in the commit at HEAD" while git could not answer (D-233)`,
      !/in the commit at HEAD/.test(r.out),
      `found: ${(r.out.match(/.*in the commit at HEAD.*/) || [""])[0].trim().slice(0, 160)}`);
  }
} finally { fs.rmSync(GITSHIM, { recursive: true, force: true }); }

/* ---- (4) OVER-STRICTNESS: an uncommitted EDIT to a TRACKED file still counts */
arm("4 · OVER-STRICTNESS — an uncommitted edit to a TRACKED file must still COUNT", {
  edits: [{ file: path.join(PLANE, "src", "skillpack.mjs"),
            from: "export function machineFences",
            to: '/* M0-18 arm 4 probe */\nexport function machineFences' }],
  run() {
    const r = runSuite(F.dec49), tl = tally(r.out);
    const line = (r.out.match(/corpus, REPRODUCIBLE: (\d+) of (\d+) fence code\(s\)/) || []);
    report("4 · the tracked file is still in the reproducible corpus — provenance answers about a PATH, "
      + `never about content, so editing a committed file does not evict it (${line[1]} of ${line[2]})`,
      r.exit === 0 && tl.fail === 0 && line[1] === line[2] && +line[1] >= 12,
      `exit ${r.exit}, tally ${tl.pass}/${tl.fail}, repro line ${JSON.stringify(line[0] || null)}`);
    return tl;
  },
});

/* ---- (5) THE SWEEP MUST NOT HAVE NARROWED --------------------------------- */
arm("5 · a phantom carrying a REAL FINDING still REDS its suite — the sweep did not narrow", {
  writes: [{ file: PHANTOM_DOC, text: "# M0-18 control phantom\n\n## Order of work\n\n1. a step nobody governed\n" }],
  run() {
    const r = runSuite(F.planning), tl = tally(r.out);
    report("5 · planning-hygiene goes RED on an unregistered 'Order of work' heading in an UNCOMMITTED doc — "
      + `a finding in work nobody has committed is still a finding (${tl.pass} pass, ${tl.fail} fail)`,
      r.exit !== 0 && tl.fail > 0 && /ZZ-M0-18-PHANTOM/.test(r.out),
      `exit ${r.exit}, tally ${tl.pass}/${tl.fail}, names the phantom ${/ZZ-M0-18-PHANTOM/.test(r.out)}`);
    return tl;
  },
});

/* ---- (6) THE SIXTH WALK'S OWN DECISIVE PAIR -------------------------------
 *
 * THIS ARM CAME BACK NOT AS DECLARED THE FIRST TIME AND IT IS RECORDED RATHER
 * THAN SMOOTHED, because BOTH reasons were defects in the ARM and one of them
 * was a defect this file was about to commit:
 *
 *   - IT NEVER ARMED. The first draft moved only `shadowed-refusals.test.mjs`
 *     aside. `shadowed-refusals.control.mjs` is a COMMITTED sibling that quotes
 *     the same eight codes, so `pinned()` still answered true for every one of
 *     them and machine-fences stayed green at 47/0. *An arm that did not arm is
 *     a finding* — and a green arm proves nothing on its own, which is why this
 *     one now begins by proving the pins are actually gone.
 *   - **AND THIS FILE WAS ITSELF A PINNER.** The first draft carried the eight
 *     codes as a hand-written array of QUOTED LITERALS, in `test/`, about to be
 *     committed — so `pinned()` would have read THEM and the `unpinned` ratchet
 *     would have been permanently satisfied by its own control harness. That is
 *     *a sweep arm that failed by citing itself*, one of this repository's named
 *     receipts, arriving inside the control written to prove the opposite. The
 *     codes are no longer typed here at all: stage 1 below LEARNS them from the
 *     instrument's own failure output, which is also the stronger arm, because a
 *     hand list agrees with its author at zero cost.
 */
console.log("\n--- ARM 6 stage 1 · remove BOTH committed pinners and learn the codes from the instrument");
const PINNERS = [F.shadowed, path.join(HERE, "shadowed-refusals.control.mjs")];
/* The pinners' text, read BEFORE they are moved, so stage 1 can ask whether each learned code is one
   THEY pinned. Read, never typed: this file must still contain no quoted refusal code (see above). */
const PINNER_TEXT = PINNERS.map((p) => fs.readFileSync(p, "utf8"));
/* RE-AIMED 2026-09-21 BY D-355, NEVER EXEMPTED — A MOVE IN THE SUBJECT'S CORPUS, DATED.
 *
 * The literal `>= 8` was REC-78's count of pins on M0-18's day, and it was right then. At `ae0ae418`
 * (2026-09-10 13:16 -0700, the CASE-5 merge) `publish` in `store.mjs` was rewritten so that no identity
 * word stands in the 300-character window machine-fences reads in front of `EDITION_NOT_INCREMENTED`;
 * that code left the identity-shadowing class (it had been `publish`, shadows 6), and only SEVEN of
 * REC-78's eight pins stayed load-bearing. The arm armed PERFECTLY — machine-fences RED 48/1 naming
 * seven codes, measured 2026-09-21 (M0-29 met the same at `e9ba393` on 2026-09-14) — and failed ONLY
 * its literal. Not a lost pin: the code is still pinned by REC-78's suite; the instrument no longer
 * asks for it, and it is not an identity guard in any case.
 *
 * THE COUNT IS NOT RE-TYPED AS SEVEN, which would decay the same way. Stage 1 now asserts what its own
 * title says — the set is NOT EMPTY — and the CAUSAL half: every code it learned is one a pinner this
 * arm moved aside actually quotes. COMPLETENESS is 6b's to prove, and 6b does: with a phantom supplying
 * EXACTLY the learned codes, the unpinned set must read EMPTY, which it cannot if stage 1 learned too
 * few. So the three stages together still pin the whole set, and none of them carries a number. */
const LEARNED = arm("6-stage-1 · with every committed pin removed, the set is NOT empty", {
  aside: PINNERS,
  run() {
    const r = runSuite(F.fences), tl = tally(r.out);
    const m = r.out.match(/NO suite pins at all[\s\S]*?got\s+(\[[^\]]*\])/);
    let codes = [];
    try { codes = m ? JSON.parse(m[1]) : []; } catch { codes = []; }
    const unowned = codes.filter((c) => !PINNER_TEXT.some((s) => s.includes(`"${c}"`)));
    report(`6-stage-1 · machine-fences goes RED and NAMES the codes that lost their pin `
      + `(${codes.length} code(s): ${codes.join(", ") || "NONE — the arm did not arm"}), `
      + `every one of them quoted by a pinner this arm moved aside`,
      r.exit !== 0 && tl.fail > 0 && codes.length >= 1 && unowned.length === 0,
      `exit ${r.exit}, tally ${tl.pass}/${tl.fail}, parsed ${codes.length} code(s), `
      + `not quoted by either moved pinner: ${JSON.stringify(unowned)}`);
    return codes;
  },
}) || [];
/* Built at runtime from what the instrument reported, so this FILE contains no
   quoted refusal code and can never pin anything itself. */
const PIN_PHANTOM_BODY = "/* M0-18 control phantom — a suite that PINS, deposited rather than written.\n"
  + "   Removed by test/provenance-floor.control.mjs. */\n"
  + LEARNED.map((c, i) => `const zz${i} = ${JSON.stringify(c)};`).join("\n") + "\n";

arm("6a · a pin that is in NO COMMIT no longer satisfies the set (M0-18 spelling)", {
  aside: PINNERS,
  writes: [{ file: PHANTOM_PIN, text: PIN_PHANTOM_BODY }],
  run() {
    const r = runSuite(F.fences), tl = tally(r.out);
    report("6a · machine-fences STAYS RED with the phantom present, and names the case as a pin owed to an "
      + `uncommitted file rather than as codes that lost their pin (${tl.pass} pass, ${tl.fail} fail)`,
      r.exit !== 0 && tl.fail > 0 && /owes its pin to a file that is in no commit/.test(r.out),
      `exit ${r.exit}, tally ${tl.pass}/${tl.fail}`);
    return tl;
  },
});
arm("6b · the SAME state PASSES in the pre-M0-18 spelling — an arrival met the requirement for free", {
  aside: PINNERS,
  writes: [{ file: PHANTOM_PIN, text: PIN_PHANTOM_BODY }],
  edits: [{ file: F.fences, from: "const pinned = (code) => TESTS_HEAD.some((s) => s.includes(`\"${code}\"`));",
            to: "const pinned = (code) => TESTS.some((s) => s.includes(`\"${code}\"`));" }],
  run() {
    const r = runSuite(F.fences), tl = tally(r.out);
    report("6b · the `unpinned` set reads EMPTY because a file no other checkout has supplied every pin — "
      + `this is the generous failure M0-18 closed, and 6a/6b differ ONLY in which roster \`pinned()\` reads `
      + `(${tl.pass} pass, ${tl.fail} fail)`,
      /PASS {2}the identity refusals that shadow something and that NO suite pins at all/.test(r.out),
      `exit ${r.exit}, tally ${tl.pass}/${tl.fail}; the unpinned arm did not pass`);
    return tl;
  },
});

/* ---- (7) THE IMPORT REMOVED ----------------------------------------------- */
arm("7 · removing the guard's import fails the class census by name", {
  edits: [{ file: F.bounds,
            from: 'import { readGitProvenance, repoPath, reportProvenance } from "../scripts/provenance.mjs";',
            to: "/* import removed by M0-18 arm 7 */" }],
  run() {
    const r = runSuite(F.hygiene), tl = tally(r.out);
    report("7 · hygiene's census goes RED naming bio-plane/test/bounds.test.mjs — the allowlist removal is "
      + `ENFORCED rather than decorative (${tl.pass} pass, ${tl.fail} fail)`,
      r.exit !== 0 && tl.fail > 0 && /bio-plane\/test\/bounds\.test\.mjs/.test(r.out),
      `exit ${r.exit}, tally ${tl.pass}/${tl.fail}`);
    return tl;
  },
});

/* ---- (8) op-claims' DOT-SEGMENT RULE, THE PAIR ---------------------------- */
/* THE `op=` TOKEN IS BUILT, NEVER TYPED, and this is the second half of the same
   receipt as ARM 6. The first draft spelled it whole — and this file lives in
   `bio-plane/test/`, which `scripts/op-claims.mjs` walks, so at BASELINE, before
   any arm ran, op-claims read this harness's own prose as an unaccounted claim
   about the dispatch table and reported 34 pass / 1 fail. *A sweep arm that
   failed by citing itself*, caught by the baseline row and by nothing else. The
   same construction `machinefences-dec49.test.mjs` uses on its own prefix, and
   for the same reason: a suite whose subject is a token must not be the place the
   token is written. */
const CLAIM_TOKEN = "op" + "=" + "notarealopatall";
const DOT_PROSE = "# a copy of real prose, of the kind a control harness makes\n\n"
  + `The operator then runs ${CLAIM_TOKEN} and reads the findings.\n`;
const OLD_SKIP = 'const SKIP_DIR = new Set(["node_modules", "dist", "coverage"]);';
const OLD_SEG = "const skipSegment = (name) => SKIP_DIR.has(name) || name.startsWith(\".\");";
arm("8a · a dot-directory of copied prose leaves op-claims GREEN (M0-18 rule)", {
  writes: [{ file: PHANTOM_DOTFILE, text: DOT_PROSE }],
  run() {
    const r = runSuite(F.opclaimsT), tl = tally(r.out);
    report("8a · GREEN — a mandatory negative control's pristine copies no longer red the battery, which "
      + `is the state D-257 measured as TEN findings (${tl.pass} pass, ${tl.fail} fail)`,
      r.exit === 0 && tl.fail === 0, `exit ${r.exit}, tally ${tl.pass}/${tl.fail}`);
    return tl;
  },
});
arm("8b · the SAME directory REDS op-claims under the pre-M0-18 named list", {
  writes: [{ file: PHANTOM_DOTFILE, text: DOT_PROSE }],
  edits: [
    { file: F.opclaimsS, from: OLD_SKIP,
      to: 'const SKIP_DIR = new Set(["node_modules", ".git", ".claude", "dist", "coverage", ".worktrees"]);' },
    { file: F.opclaimsS, from: OLD_SEG, to: "const skipSegment = (name) => SKIP_DIR.has(name);" },
  ],
  run() {
    const r = runSuite(F.opclaimsT), tl = tally(r.out);
    report("8b · RED, naming `notarealopatall` — the walk descended into the dot-directory and read a COPY "
      + `as a third party's claim about the dispatch table (${tl.pass} pass, ${tl.fail} fail)`,
      r.exit !== 0 && tl.fail > 0 && /notarealopatall/.test(r.out),
      `exit ${r.exit}, tally ${tl.pass}/${tl.fail}`);
    return tl;
  },
});

/* ---- the arm roster (D-355) ---------------------------------------------- */
{
  const missing = DECLARED_ARMS.filter((a) => RAN.filter((x) => x === a).length !== 1);
  const extra = RAN.filter((a) => !DECLARED_ARMS.includes(a));
  report(`the arm roster ran as declared — ${RAN.length} arm(s) run of ${DECLARED_ARMS.length} declared `
    + `(${DECLARED_ARMS.join(", ")})`,
    missing.length === 0 && extra.length === 0,
    `declared but not run exactly once: [${missing.join(", ")}] · run but undeclared: [${extra.join(", ")}]`);
}

/* ---- the foot ------------------------------------------------------------- */
try { fs.rmSync(PRISTINE, { recursive: true, force: true }); } catch {}
console.log(`\n${failures === 0 ? "OK" : "FAILED"}  ${checks - failures} of ${checks} control checks as declared`);
process.exit(failures ? 1 : 0);
