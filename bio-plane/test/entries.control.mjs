#!/usr/bin/env node
/* entries.control.mjs — the NEGATIVE-CONTROL DRIVER of M0-100, 4 ARMS PLUS A BASELINE, for `tools/entries.mjs` (the one
 * reader of the measurement and interface-change ledgers), its readers `tools/mintid.mjs` and `tools/ledger.mjs`, and
 * their suite `bio-plane/test/entries.test.mjs`.
 *
 *     node bio-plane/test/entries.control.mjs        # from the repo root: the baseline, then every arm
 *     node bio-plane/test/entries.control.mjs 1      # the baseline, then one arm
 *
 * THE RULES are the estate's (`train.control.mjs` is the model): each arm patches ONE file ALONE from a pristine tree
 * and DECLARES before arming which NAMED assertion must fail and which must NOT; the suite must reach its own foot; one
 * assertion no arm can reach — the frozen history's floor — must stay green, so a red is not collateral. D-331: every
 * anchor is counted BEFORE anything is armed, through `preflight`. Every restore is verified by sha256 AND `cmp` against
 * the arm's own uniquely-named copy in `controlPen("m0100")`, OUTSIDE the worktree (M0-182), with the byte count printed and floored; an `exit` hook
 * restores every file from memory and removes the pen on EVERY exit. The suite runs as an asynchronous child, so a
 * signal is honoured when it arrives. RUN LOCALLY ONLY: a control is never pushed to a branch (Bob, 2026-09-23).
 *
 * THE LIMIT, STATED FIRST (M0-42): nothing here proves a control RAN. The run of record is written, dated and with its
 * figures, into the suite's `NEGATIVE CONTROL:` block.
 */
import "./stdio.mjs";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preflight } from "../scripts/armdecay.mjs";
import { controlPen } from "./pen.mjs";
import { anchorTable } from "../scripts/anchortable.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const MINTID = path.join(REPO, "tools", "mintid.mjs");
const LEDGER = path.join(REPO, "tools", "ledger.mjs");
const ENTRIES = path.join(REPO, "tools", "entries.mjs");
const SUITE = path.join(REPO, "bio-plane", "test", "entries.test.mjs");
const PEN = controlPen("m0100");
const ONLY = process.argv[2] || null;
const DECLARED_ARMS = 4;
const FILES = [MINTID, LEDGER, ENTRIES];
const FLOOR = { [MINTID]: 40000, [LEDGER]: 40000, [ENTRIES]: 10000 };

const sha = (b) => createHash("sha256").update(b).digest("hex");
const PRISTINE = {}, DIGEST = {};
for (const f of FILES) {
  PRISTINE[f] = fs.readFileSync(f); DIGEST[f] = sha(PRISTINE[f]);
  if (PRISTINE[f].length < FLOOR[f]) { console.log(`** ${f} is implausibly small (${PRISTINE[f].length} B); refusing to arm over it`); process.exit(1); }
  console.log(`pristine ${path.relative(REPO, f)}: ${PRISTINE[f].length} bytes, sha256 ${DIGEST[f].slice(0, 12)}…`);
}

let pass = 0, fail = 0;
const t = (label, ok) => { console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`); ok ? pass++ : fail++; };

const WRITTEN = new Set();
process.on("exit", (code) => {
  for (const f of FILES) if (sha(fs.readFileSync(f)) !== DIGEST[f]) {
    fs.writeFileSync(f, PRISTINE[f]);
    console.log(`  exit ${code}: ${path.relative(REPO, f)} restored from memory — sha256 ${sha(fs.readFileSync(f)) === DIGEST[f] ? "match" : "**MISMATCH**"}`);
  }
  for (const p of WRITTEN) { try { fs.rmSync(p, { force: true }); } catch {} }
  try { if (fs.existsSync(PEN)) fs.rmdirSync(PEN); } catch {}
  console.log(`entries.control pen: ${fs.existsSync(PEN) ? `REMAINS at ${PEN}` : "absent"} · exit ${code}`);
});
let CURRENT = null;
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"])
  process.on(sig, () => { if (CURRENT) { try { CURRENT.kill("SIGTERM"); } catch {} } process.exit(130); });

function runSuite() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SUITE], { cwd: path.join(REPO, "bio-plane"), stdio: ["ignore", "pipe", "pipe"] });
    CURRENT = child;
    const out = [];
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => out.push(d));
    child.on("close", (code) => {
      CURRENT = null;
      const text = Buffer.concat(out).toString("utf8");
      const tally = /^(\d+) pass, (\d+) fail$/m.exec(text);
      resolve({ code, text, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, foot: /PASS {2}FOOT/.test(text),
                failed: [...text.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]) });
    });
  });
}
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
const COLLATERAL = "the floor of the frozen history is non-empty";

const ARMS = [
  { id: "1", file: MINTID, title: "ONE READER POINTED BACK AT THE OLD FILE ALONE — mintid's M corpus names MEASUREMENTS.md, not the reader's corpus",
    patches: [["corpus: [\"docs/archive/\", ...entryCorpus(\"M\"), \"docs/development/QUEUE.md\"", "corpus: [\"docs/archive/\", \"docs/development/MEASUREMENTS.md\", \"docs/development/QUEUE.md\""]],
    mustBreak: "mintid: a measurement in its own file raises the M floor",
    /* The duplicate arm reads the same corpus, so it goes with it: a reader of the old file alone sees neither. */
    alsoBreak: ["mintid: the SAME id in the frozen file and its own file is a DUPLICATE"],
    mustNotBreak: ["mintid: ...and an interface change in its own file raises the IC floor", "M: the reader yields EVERY frozen entry"] },
  { id: "2", file: MINTID, title: "the allocation corpus stops expanding the entry directory (read raw, a directory lands in `missing`)",
    patches: [[" : rel.endsWith(\"/\") && !isAbsolute(rel) ? expandCorpus([rel], repo).map((p) => relative(repo, p).split(sep).join(\"/\")) : [rel]));", " : [rel]));"]],
    mustBreak: "mintid: the SAME id in the frozen file and its own file is a DUPLICATE",
    alsoBreak: ["mintid: an entry file's heading is an ALLOCATION SITE"],
    mustNotBreak: ["mintid: a measurement in its own file raises the M floor"] },
  { id: "3", file: LEDGER, title: "`ledger.mjs find` stops asking the reader",
    patches: [["    const e = findEntry(ids[0]);\n", "    const e = [];\n"]],
    mustBreak: "ledger.mjs find answers a measurement in its own file",
    alsoBreak: ["ledger.mjs find answers a FROZEN interface change too"],
    mustNotBreak: ["mintid: a measurement in its own file raises the M floor", "the live tree passes the entries audit"] },
  { id: "4", file: ENTRIES, title: "the audit's WHOLE-IN-ITS-OWN-FILE check dropped — a file's foreign headings ignored",
    patches: [["      const foreign = heads.filter((h) => h !== id);\n", "      const foreign = [];\n"]],
    mustBreak: "a file holding another entry's heading FAILS",
    mustNotBreak: ["TWO MEASUREMENTS LAND IN ONE TRAIN WITH NO CONFLICT", "THE LIAR IS CAUGHT", "an entry APPENDED to a frozen file FAILS naming it"] },
];
/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.flatMap((a) => a.patches.map(([find, put]) => ({ arm: a.id, file: a.file, find, put }))));
if (ARMS.length !== DECLARED_ARMS) { console.log(`** ${ARMS.length} arms in the table against ${DECLARED_ARMS} declared — the head is wrong`); process.exit(1); }

const selected = ARMS.filter((a) => !ONLY || a.id === ONLY);
if (ONLY && !selected.length) { console.log(`** no arm ${ONLY}`); process.exit(1); }
const rows = preflight("entries.control", ARMS.map((a) => ({ id: a.id, anchors: a.patches.map(([needle]) => ({ file: a.file, needle })) })),
  { fatalFor: selected.map((a) => a.id) });
const dead = rows.filter((r) => r.n !== r.want && selected.some((a) => a.id === r.id));
if (dead.length) { console.log(`** ${dead.length} anchor(s) of the selected arm(s) are not live — REFUSED TO ARM BLIND`); process.exit(1); }

function restore(id, file) {
  fs.writeFileSync(file, PRISTINE[file]);
  const now = fs.readFileSync(file);
  const copy = path.join(PEN, `arm${id}--${path.basename(file)}`);
  let cmp = true;
  try { execFileSync("cmp", ["-s", file, copy]); } catch { cmp = false; }
  const ok = sha(now) === DIGEST[file] && cmp && now.length >= FLOOR[file];
  t(`arm ${id} · ${path.basename(file)} RESTORED byte-identically (${now.length} B, floor ${FLOOR[file]}, sha256 ${ok ? "match" : "**MISMATCH**"}, cmp ${cmp ? "identical" : "DIFFERS"})`, ok);
  if (ok) { fs.rmSync(copy, { force: true }); WRITTEN.delete(copy); }
  return ok;
}

console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const s = await runSuite();
  t(`baseline · the suite reached its foot and is GREEN (${s.pass} pass, ${s.fail} fail, exit ${s.code})`, s.foot && s.fail === 0 && s.code === 0 && s.pass > 40);
}
let armsRun = 0;
for (const a of selected) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  console.log(`    DECLARED: "${a.mustBreak}" FAILS; ${(a.mustNotBreak || []).map((x) => `"${x}"`).join(", ")} and "${COLLATERAL}" stay green; the suite reaches its foot`);
  fs.mkdirSync(PEN, { recursive: true });
  const copy = path.join(PEN, `arm${a.id}--${path.basename(a.file)}`);
  fs.writeFileSync(copy, PRISTINE[a.file]); WRITTEN.add(copy);
  let src = PRISTINE[a.file].toString("utf8"), armed = true;
  for (const [from, to] of a.patches) {
    const n = src.split(from).length - 1;
    if (n !== 1) { armed = false; break; }
    src = src.replace(from, () => to);
  }
  t(`arm ${a.id} · ARMED (${a.patches.length} patch${a.patches.length === 1 ? "" : "es"} in ${path.basename(a.file)}, each matched exactly once)`, armed);
  if (armed) {
    fs.writeFileSync(a.file, src);
    const s = await runSuite();
    armsRun++;
    t(`arm ${a.id} · "${a.mustBreak}" FAILS`, broke(s, a.mustBreak));
    for (const x of a.alsoBreak || []) t(`arm ${a.id} · ...and "${x}" fails with it`, broke(s, x));
    for (const x of a.mustNotBreak || []) t(`arm ${a.id} · ...while "${x}" stays green`, !broke(s, x));
    t(`arm ${a.id} · the suite reached its foot (${s.pass} pass, ${s.fail} fail)`, s.foot);
    t(`arm ${a.id} · the red is not collateral ("${COLLATERAL}" stays green)`, !broke(s, COLLATERAL));
    console.log(`    ACTUAL: ${s.failed.length} failing assertion(s): ${s.failed.map((l) => l.slice(0, 70)).join(" | ")}`);
  }
  if (!restore(a.id, a.file)) { console.log("** a restore did not verify; stopping before the next arm measures an unsound tree"); process.exit(1); }
}

console.log("\n--- CLOSING · every arm restored ---");
{
  const s = await runSuite();
  t(`closing · the suite is GREEN again, so no arm leaked (${s.pass} pass, ${s.fail} fail)`, s.foot && s.fail === 0 && s.code === 0);
  for (const f of FILES) t(`closing · ${path.relative(REPO, f)} is the pristine file (sha256 ${DIGEST[f].slice(0, 12)}…)`, sha(fs.readFileSync(f)) === DIGEST[f]);
}
t(`the arm tally held: ${armsRun} run of ${selected.length} selected${ONLY ? "" : ` · ${DECLARED_ARMS} declared`}`, armsRun === selected.length && (ONLY || armsRun === DECLARED_ARMS));
console.log(`\nentries.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
