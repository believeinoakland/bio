#!/usr/bin/env node
/* train.control.mjs — the NEGATIVE-CONTROL DRIVER of M0-111, M0-122, M0-131 and M0-159, 12 ARMS PLUS A BASELINE, for `tools/train.mjs`,
 * the push guard's `main` arm in `tools/pushguard.mjs`, `tools/gates.mjs`'s `--never-cached` set (M0-131), and their suite
 * `bio-plane/test/train.test.mjs`.
 *
 *     node bio-plane/test/train.control.mjs        # from the repo root: the baseline, then every arm
 *     node bio-plane/test/train.control.mjs 1      # the baseline, then one arm
 *
 * THE RULES, which are this estate's and not this file's (`pushguard.control.mjs` is the model): each arm patches ONE
 * file ALONE from a pristine tree and DECLARES before arming which NAMED assertion must fail and which must NOT; the
 * suite must reach its own foot; one assertion no arm can reach — the fixture's remote `main` existing — must stay
 * green, so a red is not collateral. D-331: every anchor is counted BEFORE anything is armed, through `preflight`.
 * Every restore is verified by sha256 AND `cmp` against the arm's own uniquely-named copy in `.m0111-harness/`, with
 * the byte count printed and floored; an `exit` hook restores both files from memory and removes the pen on EVERY
 * exit. The suite runs as an asynchronous child, so a signal is honoured when it arrives.
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

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const GUARD = path.join(REPO, "tools", "pushguard.mjs");
const TRAIN = path.join(REPO, "tools", "train.mjs");
const GATES = path.join(REPO, "tools", "gates.mjs");
const SUITE = path.join(REPO, "bio-plane", "test", "train.test.mjs");
const PEN = path.join(REPO, ".m0111-harness");
const ONLY = process.argv[2] || null;
const DECLARED_ARMS = 12;
const FLOOR = { [GUARD]: 40000, [TRAIN]: 10000, [GATES]: 40000 };

const sha = (b) => createHash("sha256").update(b).digest("hex");
const PRISTINE = {}, DIGEST = {};
for (const f of [GUARD, TRAIN, GATES]) {
  PRISTINE[f] = fs.readFileSync(f); DIGEST[f] = sha(PRISTINE[f]);
  if (PRISTINE[f].length < FLOOR[f]) { console.log(`** ${f} is implausibly small (${PRISTINE[f].length} B); refusing to arm over it`); process.exit(1); }
  console.log(`pristine ${path.relative(REPO, f)}: ${PRISTINE[f].length} bytes, sha256 ${DIGEST[f].slice(0, 12)}…`);
}

let pass = 0, fail = 0;
const t = (label, ok) => { console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`); ok ? pass++ : fail++; };

const WRITTEN = new Set();
process.on("exit", (code) => {
  for (const f of [GUARD, TRAIN, GATES]) if (sha(fs.readFileSync(f)) !== DIGEST[f]) {
    fs.writeFileSync(f, PRISTINE[f]);
    console.log(`  exit ${code}: ${path.relative(REPO, f)} restored from memory — sha256 ${sha(fs.readFileSync(f)) === DIGEST[f] ? "match" : "**MISMATCH**"}`);
  }
  for (const p of WRITTEN) { try { fs.rmSync(p, { force: true }); } catch {} }
  try { if (fs.existsSync(PEN)) fs.rmdirSync(PEN); } catch {}
  console.log(`train.control pen: ${fs.existsSync(PEN) ? `REMAINS at ${PEN}` : "absent"} · exit ${code}`);
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
const COLLATERAL = "the remote's main exists";

const ARMS = [
  { id: "1", file: GUARD, title: "THE GUARD'S `main` ARM DROPPED — its call site in `run` reads every push as carrying the mark",
    patches: [["  const mc = mainArmCheck({ repo, stdin });\n", "  const mc = { ok: true, refused: [], trains: [] };\n"]],
    mustBreak: "A LANE'S DIRECT PUSH TO main IS REFUSED BY NAME",
    alsoBreak: ["a DELETION of main is refused by name"],
    mustNotBreak: ["lane alpha's land/alpha/one push is accepted", "THE CONFLICTING BRANCH IS RETURNED TO ITS LANE BY NAME"] },
  { id: "2", file: TRAIN, title: "the train reports a deletion from the push's EXIT STATUS, never from the remote",
    patches: [["  if (after.status === 0 && !after.out) return { branch, state: \"DELETED\"", "  if (del.status === 0) return { branch, state: \"DELETED\""]],
    mustBreak: "A DELETE THE REMOTE REFUSED IS REPORTED NOT DELETED",
    mustNotBreak: ["THE TRAIN LANDS BOTH LANES", "...and the NEXT train reads it LANDED by ancestry"] },
  { id: "3", file: TRAIN, title: "PRUNE BY ANCESTRY dropped — every land/* ref reads WAITING",
    patches: [["    const landed = !!main && gitR(repo, [\"merge-base\", \"--is-ancestor\", sha, main]).status === 0;\n", "    const landed = false;\n"]],
    mustBreak: "...and the NEXT train reads it LANDED by ancestry",
    mustNotBreak: ["THE TRAIN LANDS BOTH LANES", "A LANE'S DIRECT PUSH TO main IS REFUSED BY NAME"] },
  { id: "4", file: TRAIN, title: "the train's trailer dropped from its merges — the guard must then refuse the train itself",
    patches: [["    `${TRAIN_TRAILER}: ${id}`, ...trailers].join(\"\\n\");", "    ...trailers].join(\"\\n\");"]],
    mustBreak: "THE TRAIN LANDS BOTH LANES",
    /* CORRECTED 2026-09-22 after this arm's first run: it also declared "THE LONE RED BRANCH IS RETURNED BY NAME" must
       stay green, and it went red — not collateral: with every train refused, the earlier sections' branches stay
       WAITING, so the "lone" red branch shares its train with them. The cascade is the arm working; the declaration
       was wrong about the fixture's sequencing, so it names only arms that do not run a train. */
    mustNotBreak: ["A LANE'S DIRECT PUSH TO main IS REFUSED BY NAME", "a DELETION of main is refused by name"] },
  /* M0-122. Arm 5 drops the retry: every rejected push is final, as before M0-122. Arm 6 drops the reuse of a
     recorded-GREEN tree: every union is gated. Each section runs on a fixture of its own, so neither cascades. */
  { id: "5", file: TRAIN, title: "THE RETRY DROPPED — a push rejected because main moved is final",
    patches: [["    if (!moved) return failed(", "    if (true) return failed("]],
    mustBreak: "A TRAIN WHOSE PUSH IS REJECTED ONCE LANDS ON THE RETRY",
    alsoBreak: ["THE RETRY IS BOUNDED"],
    mustNotBreak: ["THE TRAIN LANDS BOTH LANES", "A RECORDED-GREEN TREE LANDS WITH ONLY ITS NEVER-CACHED UNITS RUN"] },
  { id: "6", file: TRAIN, title: "THE REUSE DROPPED — a union whose tree is already recorded GREEN is gated again",
    patches: [["  const reuse = recordedGreen(repo, { full });\n", "  const reuse = null;\n"]],
    mustBreak: "A RECORDED-GREEN TREE LANDS WITH ONLY ITS NEVER-CACHED UNITS RUN",
    mustNotBreak: ["THE TRAIN LANDS BOTH LANES", "A TRAIN WHOSE PUSH IS REJECTED ONCE LANDS ON THE RETRY", "OVER-REUSE CLOSED"] },
  /* M0-131. Arm 7 is the row's NEGATIVE CONTROL: the history checks SKIPPED on reuse (M0-122's shape, `return reuse`), so
     the union whose merge dropped a carried edit lands. Arm 8 is the liar who derives an EMPTY set (gates.mjs's
     `--never-cached` selects nothing). Arm 9 is the liar who RUNS the set and ignores its verdict. All three run on the
     M0-131 section's own fixture, so the earlier sections cannot cascade. */
  { id: "7", file: TRAIN, title: "THE HISTORY CHECKS SKIPPED ON REUSE — a recorded-GREEN tree lands with no never-cached run",
    patches: [["  const args = reuse ? [\"--never-cached\"]", "  if (reuse) return reuse;\n  const args = reuse ? [\"--never-cached\"]"]],
    mustBreak: "A UNION WHOSE TREE IS RECORDED GREEN BUT WHOSE MERGE DROPS A CARRIED EDIT IS REFUSED BY THE TRAIN NAMING THE CHECK",
    alsoBreak: ["THE DERIVED SET IS NOT EMPTY", "A RECORDED-GREEN TREE LANDS WITH ONLY ITS NEVER-CACHED UNITS RUN"],
    mustNotBreak: ["THE TRAIN LANDS BOTH LANES", "A TRAIN WHOSE PUSH IS REJECTED ONCE LANDS ON THE RETRY", "OVER-REUSE CLOSED"] },
  { id: "8", file: GATES, title: "THE DERIVED SET EMPTIED — `--never-cached` selects no unit (plancheck alone runs)",
    patches: [["const NEVER_SET = NEVER_CACHED ? UNITS.filter((u) => neverCacheOf(u)) : [];", "const NEVER_SET = [];"]],
    mustBreak: "A UNION WHOSE TREE IS RECORDED GREEN BUT WHOSE MERGE DROPS A CARRIED EDIT IS REFUSED BY THE TRAIN NAMING THE CHECK",
    alsoBreak: ["THE DERIVED SET IS NOT EMPTY"],
    mustNotBreak: ["THE TRAIN LANDS BOTH LANES", "A RECORDED-GREEN TREE LANDS WITH ONLY ITS NEVER-CACHED UNITS RUN", "OVER-REUSE CLOSED"] },
  { id: "9", file: TRAIN, title: "THE VERDICT IGNORED — the never-cached run happens, and the reused tree reads GREEN whatever it said",
    patches: [["  if (reuse) return { ...reuse, verdict, exit: r.status, open,", "  if (reuse) return { ...reuse, verdict: \"GREEN\", exit: r.status, open,"]],
    mustBreak: "A UNION WHOSE TREE IS RECORDED GREEN BUT WHOSE MERGE DROPS A CARRIED EDIT IS REFUSED BY THE TRAIN NAMING THE CHECK",
    mustNotBreak: ["THE DERIVED SET IS NOT EMPTY", "THE TRAIN LANDS BOTH LANES", "A RECORDED-GREEN TREE LANDS WITH ONLY ITS NEVER-CACHED UNITS RUN"] },
  /* M0-159. Arm 10 is the row's NEGATIVE CONTROL: THE REFUSAL DROPPED — the silent ignore restored, so an unmatched
     `--drop` entry is accepted and drops nothing. Arm 11 drops the COMMA SPLIT, so a `--drop` value is one branch name
     again (the refusal, still armed, then catches the list as an unmatched entry — which is exactly what tells the two
     halves of the fix apart: arm 10 breaks only the refusal, arm 11 only the dropping). Arm 12 drops the bare-flag
     check. The refusing arms and the dropping arms drive fixtures of their own (R and S), so neither cascades. */
  { id: "10", file: TRAIN, title: "THE REFUSAL DROPPED — the silent ignore restored: a --drop entry matching no branch is accepted and drops nothing",
    patches: [["  if (!opts.dropChecked) {\n", "  if (false) {\n"]],
    mustBreak: "A --drop ENTRY NAMING NO BRANCH REFUSES THE TRAIN BY NAME",
    alsoBreak: ["...and the REFUSAL ITSELF names what it could have dropped"],
    mustNotBreak: ["A VALID COMMA LIST DROPS EACH BRANCH IT NAMES", "A FLAG WITH NO VALUE AFTER IT IS REFUSED BY NAME",
                   "OVER-STRICTNESS — an origin/ prefix", "THE LIMIT — a drop naming a listed row"] },
  { id: "11", file: TRAIN, title: "THE COMMA SPLIT DROPPED — a --drop value is ONE branch name again, as on 2026-09-24",
    patches: [["  const drop = new Set((opts.drop || []).flatMap((d) => String(d).split(\",\")).map(dropName).filter(Boolean));\n",
               "  const drop = new Set((opts.drop || []).flatMap((d) => [String(d)]).map(dropName).filter(Boolean));\n"]],
    mustBreak: "A VALID COMMA LIST DROPS EACH BRANCH IT NAMES",
    alsoBreak: ["OVER-STRICTNESS — an origin/ prefix"],
    mustNotBreak: ["A --drop ENTRY NAMING NO BRANCH REFUSES THE TRAIN BY NAME", "A FLAG WITH NO VALUE AFTER IT IS REFUSED BY NAME",
                   "THE LIMIT — a drop naming a listed row"] },
  { id: "12", file: TRAIN, title: "THE BARE-FLAG CHECK DROPPED — `--drop` last on the line is read as if it were never typed",
    patches: [["    const bare = [\"--branch\", \"--drop\", \"--trailer\"].filter", "    const bare = [].filter"]],
    mustBreak: "A FLAG WITH NO VALUE AFTER IT IS REFUSED BY NAME",
    mustNotBreak: ["A --drop ENTRY NAMING NO BRANCH REFUSES THE TRAIN BY NAME", "A VALID COMMA LIST DROPS EACH BRANCH IT NAMES",
                   "OVER-STRICTNESS — an origin/ prefix", "THE LIMIT — a drop naming a listed row"] },
];
if (ARMS.length !== DECLARED_ARMS) { console.log(`** ${ARMS.length} arms in the table against ${DECLARED_ARMS} declared — the head is wrong`); process.exit(1); }

const selected = ARMS.filter((a) => !ONLY || a.id === ONLY);
if (ONLY && !selected.length) { console.log(`** no arm ${ONLY}`); process.exit(1); }
const rows = preflight("train.control", ARMS.map((a) => ({ id: a.id, anchors: a.patches.map(([needle]) => ({ file: a.file, needle })) })),
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
  t(`baseline · the suite reached its foot and is GREEN (${s.pass} pass, ${s.fail} fail, exit ${s.code})`, s.foot && s.fail === 0 && s.code === 0 && s.pass > 25);
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
  for (const f of [GUARD, TRAIN, GATES]) t(`closing · ${path.relative(REPO, f)} is the pristine file (sha256 ${DIGEST[f].slice(0, 12)}…)`, sha(fs.readFileSync(f)) === DIGEST[f]);
}
t(`the arm tally held: ${armsRun} run of ${selected.length} selected${ONLY ? "" : ` · ${DECLARED_ARMS} declared`}`, armsRun === selected.length && (ONLY || armsRun === DECLARED_ARMS));
console.log(`\ntrain.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
