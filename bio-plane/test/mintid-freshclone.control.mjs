#!/usr/bin/env node
/* mintid-freshclone.control.mjs — M0-117's NEGATIVE-CONTROL DRIVER, FOUR ARMS PLUS A BASELINE, for
 * `bio-plane/test/mintid.test.mjs` run IN A CLONE THAT HAS NEVER MINTED.
 *
 *     node bio-plane/test/mintid-freshclone.control.mjs            # from the repo root: the baseline, then every arm
 *     node bio-plane/test/mintid-freshclone.control.mjs 17 11      # the baseline, then the named arms
 *
 * WHY A CLONE, AND WHY NOT THIS TREE. The defect (M-99) exists only where `<git-common-dir>/bio-idalloc` does not:
 * `scopeOf` probed the live ledger without creating it, so the suite's live-ledger arm was GREEN on every machine that
 * had ever minted and RED on the first gate of every fresh clone. This checkout's common git directory has minted, so no
 * arm run HERE can see the defect. The driver therefore `git clone`s this repository into the OS temp directory — a clone
 * carries no `bio-idalloc`, which is asserted rather than assumed — overlays this tree's WORKING copies of the two
 * subject files (`tools/mintid.mjs`, `bio-plane/test/mintid.test.mjs`, their sha256 printed), and runs the CLONE's suite.
 * The clone's ledger is removed before every arm and its absence asserted, so each arm starts from the fresh state.
 *
 * DECLARED BEFORE ARMING (M0-117's accepts-when, one arm per clause):
 *   BASE   nothing armed, NO ledger            -> GREEN; the live-ledger arm, the fresh-clone arms and the
 *                                                  missing-directory arm PASS by name; the run CREATED the ledger
 *   17     `scopeOf`'s create DROPPED, NO ledger -> "the REAL ledger's filesystem honours the exclusive create" FAILS,
 *                                                  with the three fresh-clone arms, and NOTHING ELSE: the
 *                                                  missing-directory arm stays green. This is the defect M-99 measured.
 *   11     the probe's second create `wx` -> `w` -> "the probe passes on a filesystem that honours O_CREAT|O_EXCL" and the
 *                                                  live-ledger arm FAIL (the suite's own arm (11), re-run after the
 *                                                  subject changed), with the fresh-clone arm. WIDE: every MINT in the
 *                                                  suite then refuses EXCL_NOT_HONOURED (the mint probes before it takes),
 *                                                  so 27 more arms fail — measured by this driver's first run, 2026-09-22,
 *                                                  wider than the suite's 2026-08-08 declaration of (11) said
 *   EXIST  OVER-STRICTNESS: nothing armed, the ledger ALREADY present (a clone that has minted) -> GREEN: the create is
 *                                                  idempotent, so a fix spelled as a non-recursive mkdir (EEXIST) is caught
 *   LIAR   `scopeOf`'s create DROPPED AND the ledger pre-created by the harness -> the live-ledger arm PASSES and only the
 *                                                  fresh-clone arms fail — which is the finding: a fixture that makes the
 *                                                  directory hides the defect from the live arm, so the no-ledger arm
 *                                                  must run the TOOL in a fresh repository, never a pre-created one
 * What MUST NOT fail: the baseline, EXIST, every restore, and the worktree's own subject files (never written).
 *
 * THE RULES, which are this estate's: every anchor is counted before anything arms (`preflight`, D-331); each arm
 * patches the CLONE's copy from the pristine bytes and is restored before the next arms, verified by sha256 AND `cmp`
 * against that arm's own uniquely-named copy, byte count printed and floored; the whole clone lives under one
 * `mkdtemp` directory removed on EVERY exit, so this tree is never touched and no pen is written in it; every child is
 * asynchronous, so a signal is honoured when it arrives.
 *
 * THE LIMIT, STATED FIRST (M0-42): nothing here proves a control RAN. The run of record is written, dated and with its
 * figures, into `mintid.test.mjs`'s `NEGATIVE CONTROL:` block, arms (11) and (17).
 */
import "./stdio.mjs";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preflight } from "../scripts/armdecay.mjs";
import { ANCHOR_DRY, anchorTable } from "../scripts/anchortable.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const REL_TOOL = path.join("tools", "mintid.mjs");
const REL_SUITE = path.join("bio-plane", "test", "mintid.test.mjs");
const ONLY = process.argv.slice(2);
const DECLARED_ARMS = 4;

const sha = (b) => createHash("sha256").update(b).digest("hex");
const EMPTY_SHA = sha(Buffer.alloc(0));
const SUBJECTS = new Map([
  [REL_TOOL, { name: "mintid.mjs", floorBytes: 40000 }],
  [REL_SUITE, { name: "mintid.test.mjs", floorBytes: 40000 }],
]);
for (const [rel, s] of SUBJECTS) {
  s.pristine = fs.readFileSync(path.join(REPO, rel));
  s.digest = sha(s.pristine);
  if (s.pristine.length < s.floorBytes || s.digest === EMPTY_SHA) {
    console.log(`** ${s.name} is implausibly small (${s.pristine.length} B, floor ${s.floorBytes}); refusing to arm over it`);
    process.exit(1);
  }
  console.log(`pristine ${s.name} (this tree's WORKING copy): ${s.pristine.length} bytes, sha256 ${s.digest.slice(0, 12)}…`);
}

let pass = 0, fail = 0;
const t = (label, ok) => { console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`); ok ? pass++ : fail++; };

/* ---------------------------------------------------------------- the ground: one temp directory, gone on every exit */
const GROUND = fs.mkdtempSync(path.join(os.tmpdir(), "m0117-freshclone-"));
const CLONE = path.join(GROUND, "clone");
const PEN = path.join(GROUND, "pen");
let CURRENT = null;
process.on("exit", (code) => {
  const untouched = [...SUBJECTS].every(([rel, s]) => sha(fs.readFileSync(path.join(REPO, rel))) === s.digest);
  try { fs.rmSync(GROUND, { recursive: true, force: true }); } catch {}
  console.log(`mintid-freshclone.control ground ${fs.existsSync(GROUND) ? `REMAINS at ${GROUND}` : "removed"} · this tree's subjects `
    + `${untouched ? "untouched" : "**CHANGED**"} · exit ${code}`);
});
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"])
  process.on(sig, () => { if (CURRENT) { try { CURRENT.kill("SIGTERM"); } catch {} } process.exit(130); });

/* The child's environment carries no ledger override and no git redirection, so the clone's git directory is the only
   place its ledger can be. */
const CHILD_ENV = Object.fromEntries(Object.entries(process.env)
  .filter(([k]) => k !== "BIO_IDALLOC_DIR" && !k.startsWith("GIT_")));

/* M0-197: under tools/anchordrift.mjs's dry read no clone is made (the arms' table below is all it reads). */
if (!ANCHOR_DRY) execFileSync("git", ["clone", "-q", "--no-local", REPO, CLONE], { stdio: ["ignore", "ignore", "pipe"], env: CHILD_ENV });
const COMMON = ANCHOR_DRY ? path.join(CLONE, ".git") : path.resolve(CLONE, execFileSync("git", ["rev-parse", "--git-common-dir"],
  { cwd: CLONE, encoding: "utf8", env: CHILD_ENV }).trim());
const LEDGER = path.join(COMMON, "bio-idalloc");
fs.mkdirSync(PEN);
if (!ANCHOR_DRY) for (const [rel, s] of SUBJECTS) fs.writeFileSync(path.join(CLONE, rel), s.pristine);
console.log(`clone ${CLONE} · its git dir ${COMMON} · its ledger ${LEDGER}`);
if (!ANCHOR_DRY) t(`the clone was made and holds the subjects (${[...SUBJECTS].map(([rel]) => rel).join(", ")})`,
  [...SUBJECTS].every(([rel, s]) => sha(fs.readFileSync(path.join(CLONE, rel))) === s.digest));
t("a fresh clone carries NO id ledger — the state M-99 measured, asserted rather than assumed", !fs.existsSync(LEDGER));

/* ---------------------------------------------------------------- a run of the CLONE's suite, read by its own names */
const LIVE = "the REAL ledger's filesystem honours the exclusive create";
const PROBE = "the probe passes on a filesystem that honours O_CREAT|O_EXCL";
const GONE = "a ledger directory that cannot be written is a REFUSAL with a code, not a throw";
const FRESH = "a clone with NO ledger directory still reads its filesystem honouring the exclusive create";
const FRESH_MADE = "...because `scopeOf` created the ledger, as the mint does";
const FRESH_BLOCK = "a ledger that cannot be CREATED is a refusal with the mint's code";
const FRESH_FIX = "the fixture is a clone that has NEVER minted: its git dir holds no bio-idalloc";
function runSuite() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(CLONE, REL_SUITE)],
      { cwd: path.join(CLONE, "bio-plane"), env: CHILD_ENV, stdio: ["ignore", "pipe", "pipe"] });
    CURRENT = child;
    const out = [];
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => out.push(d));
    child.on("close", (code) => {
      CURRENT = null;
      const text = Buffer.concat(out).toString("utf8");
      const tally = /^(\d+) pass, (\d+) fail$/m.exec(text);
      const live = /live ledger (\S+) · hosts .* · exclusive (.*)$/m.exec(text);
      resolve({ code, text, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, foot: !!tally,
                liveLedger: live ? live[1] : null, liveVerdict: live ? live[2] : null,
                failed: [...text.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]),
                passed: [...text.matchAll(/^ {2}PASS {2}(.+)$/gm)].map((m) => m[1]) });
    });
  });
}
const named = (list, label) => list.some((l) => l.startsWith(label));

/* ---------------------------------------------------------------- the arms */
const DROP_FROM = "    try { mkdirSync(r, { recursive: true }); }";
const DROP_TO = "    try { /* M0-117 control arm: scopeOf's create DROPPED */ }";
const ARMS = [
  { id: "17", ledger: "absent", want: "RED",
    title: "`scopeOf`'s create DROPPED, in a clone with NO ledger — the defect M-99 measured",
    fails: [LIVE, FRESH, FRESH_MADE, FRESH_BLOCK],
    patches: [[REL_TOOL, DROP_FROM, DROP_TO]] },
  { id: "11", ledger: "absent", want: "RED",
    title: "the probe's second create `{ flag: \"wx\" }` -> `{ flag: \"w\" }` — a filesystem that does not honour O_EXCL",
    fails: [PROBE, LIVE, FRESH], wide: true,
    patches: [[REL_TOOL, "  try { writeFileSync(p, \"second\", { flag: \"wx\" }); } catch (e) { second = e.code; }",
                         "  try { writeFileSync(p, \"second\", { flag: \"w\" }); } catch (e) { second = e.code; }"]] },
  { id: "EXIST", ledger: "present", want: "GREEN",
    title: "OVER-STRICTNESS: nothing armed, the ledger ALREADY present — a clone that has minted",
    fails: [], patches: [] },
  { id: "LIAR", ledger: "present", want: "RED",
    title: "THE LIAR: `scopeOf`'s create DROPPED and the ledger PRE-CREATED by the harness",
    fails: [FRESH, FRESH_MADE, FRESH_BLOCK], livePasses: true,
    patches: [[REL_TOOL, DROP_FROM, DROP_TO]] },
];
/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.flatMap((a) => a.patches.map(([rel, find, put]) => ({ arm: a.id, file: path.join(REPO, rel), find, put }))));
if (ARMS.length !== DECLARED_ARMS) { console.log(`** ${ARMS.length} arms in the table against ${DECLARED_ARMS} declared — the head is wrong`); process.exit(1); }
const selected = ARMS.filter((a) => !ONLY.length || ONLY.includes(a.id));
const unknown = ONLY.filter((id) => !ARMS.some((a) => a.id === id));
if (unknown.length || !selected.length) { console.log(`** no arm ${unknown.join(", ") || ONLY.join(", ")}`); process.exit(1); }
const rows = preflight("mintid-freshclone.control",
  ARMS.filter((a) => a.patches.length).map((a) => ({ id: a.id, anchors: a.patches.map(([rel, needle]) => ({ file: path.join(REPO, rel), needle })) })),
  { fatalFor: selected.map((a) => a.id) });
const dead = rows.filter((r) => r.n !== r.want && selected.some((a) => a.id === r.id));
if (dead.length) { console.log(`** ${dead.length} anchor(s) of the selected arm(s) are not live — REFUSED TO ARM BLIND`); process.exit(1); }

function setLedger(state, id) {
  fs.rmSync(LEDGER, { recursive: true, force: true });
  if (state === "present") fs.mkdirSync(LEDGER);
  t(`arm ${id} · the clone's ledger is ${state.toUpperCase()} before the run`, fs.existsSync(LEDGER) === (state === "present"));
}
function restore(id, rel) {
  const s = SUBJECTS.get(rel), file = path.join(CLONE, rel);
  fs.writeFileSync(file, s.pristine);
  const now = fs.readFileSync(file);
  const copy = path.join(PEN, `arm${id}--${s.name}`);
  let cmp = true;
  try { execFileSync("cmp", ["-s", file, copy]); } catch { cmp = false; }
  const ok = sha(now) === s.digest && cmp && now.length >= s.floorBytes;
  t(`arm ${id} · RESTORED the clone's ${s.name} byte-identically (${now.length} B, floor ${s.floorBytes}, sha256 ${ok ? "match" : "**MISMATCH**"}, cmp ${cmp ? "identical" : "DIFFERS"})`, ok);
  return ok;
}

/* ---------------------------------------------------------------- the run */
console.log("\n--- ARM BASELINE · nothing armed, the clone's ledger ABSENT ---");
{
  setLedger("absent", "BASE");
  const s = await runSuite();
  console.log(`    ACTUAL: ${s.pass} pass, ${s.fail} fail, exit ${s.code}; live ledger ${s.liveLedger} · ${s.liveVerdict}`);
  t(`baseline · the clone's suite reached its foot and is GREEN (${s.pass} pass, ${s.fail} fail, exit ${s.code})`, s.foot && s.fail === 0 && s.code === 0 && s.pass > 100);
  t(`baseline · the suite's live ledger IS the clone's (${s.liveLedger})`, s.liveLedger === LEDGER);
  for (const l of [LIVE, FRESH, FRESH_MADE, FRESH_BLOCK, FRESH_FIX, GONE]) t(`baseline · PASSES BY NAME: "${l}"`, named(s.passed, l));
  t("baseline · the run CREATED the clone's ledger (the tool made it; nothing in this driver did)", fs.existsSync(LEDGER));
}
let armsRun = 0;
for (const a of selected) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  console.log(`    DECLARED: ${a.want === "GREEN" ? "GREEN, the live-ledger arm PASSES" : `FAILS exactly: ${a.fails.map((l) => `"${l.slice(0, 60)}"`).join(", ")}`}`
    + `${a.livePasses ? `; the live-ledger arm PASSES` : ""}; "${GONE.slice(0, 50)}…" PASSES; the suite reaches its foot`);
  const touched = [...new Set(a.patches.map(([rel]) => rel))];
  for (const rel of touched) fs.writeFileSync(path.join(PEN, `arm${a.id}--${SUBJECTS.get(rel).name}`), SUBJECTS.get(rel).pristine);
  const src = new Map(touched.map((rel) => [rel, SUBJECTS.get(rel).pristine.toString("utf8")]));
  let armed = true;
  for (const [rel, from, to] of a.patches) {
    const n = src.get(rel).split(from).length - 1;
    if (n !== 1) { armed = false; console.log(`    anchor matched ${n} time(s) in ${SUBJECTS.get(rel).name} — THE ARM DID NOT ARM`); break; }
    src.set(rel, src.get(rel).replace(from, () => to));
  }
  t(`arm ${a.id} · ARMED (${a.patches.length} patch${a.patches.length === 1 ? "" : "es"}, each matched exactly once)`, armed);
  if (armed) {
    for (const [rel, text] of src) fs.writeFileSync(path.join(CLONE, rel), text);
    setLedger(a.ledger, a.id);
    const s = await runSuite();
    armsRun++;
    t(`arm ${a.id} · the suite reached its foot (${s.pass} pass, ${s.fail} fail, exit ${s.code}) — a crash is not a result`, s.foot);
    t(`arm ${a.id} · the missing-directory arm STAYS GREEN: "${GONE}"`, named(s.passed, GONE));
    if (a.want === "GREEN") {
      t(`arm ${a.id} · the suite stayed GREEN`, s.fail === 0 && s.code === 0);
      t(`arm ${a.id} · PASSES BY NAME: "${LIVE}"`, named(s.passed, LIVE));
    } else {
      t(`arm ${a.id} · the suite went RED`, s.fail > 0 && s.code !== 0);
      for (const l of a.fails) t(`arm ${a.id} · FAILS BY NAME: "${l}"`, named(s.failed, l));
      if (a.livePasses) t(`arm ${a.id} · ...and the live-ledger arm PASSES over the pre-created fixture — the liar is invisible to it`, named(s.passed, LIVE));
      const extra = s.failed.filter((f) => !a.fails.some((l) => f.startsWith(l)));
      if (a.wide)
        /* WIDE BY DESIGN, and measured before it was declared: `mint` probes before it takes, so a filesystem that does
           not honour O_EXCL makes EVERY mint in the suite refuse (EXCL_NOT_HONOURED) — the race, the bulk take, the CLI
           arms. The width is the mint's fail-closed refusal, not collateral; what this arm pins is the named three. */
        t(`arm ${a.id} · ...the rest of the red is the MINT REFUSING, the fail-closed path (${extra.length} more arm(s); the suite printed EXCL_NOT_HONOURED)`,
          extra.length > 0 && /EXCL_NOT_HONOURED/.test(s.text));
      else t(`arm ${a.id} · ...and NOTHING ELSE fails (${JSON.stringify(extra.map((x) => x.slice(0, 70)))})`, extra.length === 0);
    }
    console.log(`    ACTUAL: ${s.pass} pass, ${s.fail} fail, exit ${s.code}; live ledger · ${s.liveVerdict}; failing: ${s.failed.map((l) => l.slice(0, 70)).join(" | ") || "none"}`);
  }
  for (const rel of touched) if (!restore(a.id, rel)) { console.log("** a restore did not verify; stopping before the next arm measures an unsound tree"); process.exit(1); }
}

console.log("\n--- CLOSING · every arm restored, the clone's ledger ABSENT again ---");
{
  setLedger("absent", "CLOSE");
  const s = await runSuite();
  t(`closing · the clone's suite is GREEN again, so no arm leaked (${s.pass} pass, ${s.fail} fail, exit ${s.code})`, s.foot && s.fail === 0 && s.code === 0);
}
for (const [rel, s] of SUBJECTS) t(`closing · this tree's ${s.name} was never written (sha256 ${s.digest.slice(0, 12)}…)`, sha(fs.readFileSync(path.join(REPO, rel))) === s.digest);
t(`the arm tally held: ${armsRun} run of ${selected.length} selected${ONLY.length ? "" : ` · ${DECLARED_ARMS} declared`}`,
  armsRun === selected.length && (ONLY.length > 0 || armsRun === DECLARED_ARMS));
console.log(`\nmintid-freshclone.control: ${pass} pass, ${fail} fail  (${armsRun} arm(s) run of ${DECLARED_ARMS} declared, plus a baseline)`);
process.exit(fail ? 1 : 0);
