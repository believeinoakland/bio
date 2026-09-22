#!/usr/bin/env node
/* M0-81's NEGATIVE CONTROL DRIVER — eighteen arms plus a baseline — over `tools/occupancy.mjs` and the suite that
 * drives it, `bio-plane/test/occupancy.test.mjs`.
 *
 *   node bio-plane/test/occupancy.control.mjs          (from the repo root: the baseline, then every arm)
 *   node bio-plane/test/occupancy.control.mjs A6       (the baseline, then one arm)
 *
 * COMMITTED so the next session re-runs it in ONE step instead of re-deriving how to break the subject. The rules are
 * this estate's, not this file's: every arm is armed ALONE from the pristine subject, held in memory before anything
 * is armed; each DECLARES before arming what must fail and what must not; every restore is verified by sha256 against
 * that pristine digest AND by `cmp` against the arm's own uniquely-named copy in `.m081-harness/`, with the byte count
 * printed and floored. D-331 is honoured through `preflight`: every anchor is counted before anything arms. The pen is
 * removed by name as each restore verifies, and an exit hook restores the subject from memory and removes the rest on
 * EVERY exit (D-355); the suite runs as an asynchronous child, so a signal is honoured when it arrives.
 *
 * **NO ARM TOUCHES A SESSION, A TASK OR THE HARNESS.** The suite drives the judgement from fixture listings in the
 * harness's measured shapes (M-93); the one thing an arm perturbs is `tools/occupancy.mjs`.
 *
 * THE ARMS, each with what MUST fail and what MUST NOT, declared before arming:
 *   A1   the occupancy test dropped (the row's own control) -> the incident's duplicate CONDUCT #8 is ADMITTED
 *   A2   the scheduledTaskId route dropped -> the liar's get_session record is admitted; its runs route still refuses
 *   A3   the runs route dropped -> the liar's run is admitted; its scheduledTaskId route still refuses
 *   A4   the lane's tasks no longer read from the task listing -> the liar is admitted; the incident's title still refuses
 *   A5   the title half dropped -> the chip-filed duplicate is admitted; the liar's run still refuses
 *   A6   OVER-STRICTNESS, an archive not honoured -> the stood-down listing is refused; the incident still refuses
 *   A7   OVER-STRICTNESS, the predecessor exemption dropped -> the successor's chip is refused
 *   A8   the chip's own instance admitted (`>=` read as `>`) -> the incident is admitted; a stale chip still refuses
 *   A9   a truncated listing believed -> the listing at its limit ADMITS; the undeclared limit still does not
 *   A10  the task listing not required -> the array-only listing ADMITS; the truncated one still does not
 *   A11  a BARE runs list cut at a limit believed -> the ten-run array ADMITS; a list short of its totalRuns still does not
 *   A12  the lane compared by case -> `Conduct #12` is admitted; the incident still refuses
 *   A13  what cannot be classified, not named -> the prose mention vanishes; the heartbeat verdict holds
 *   A14  a gap outranks an occupant -> the every-gap occupant reads UNDETERMINED; the incident still refuses
 *   A15  OVER-STRICTNESS, a get_session record not read as unlinked -> the records fixture reads UNDETERMINED
 *   A16  OVER-STRICTNESS, the title read LOOSELY (contains the lane's word) -> the heartbeats hold CONDUCT
 *   A17  OVER-STRICTNESS, a lane's tasks read by task-id PREFIX -> conduct-heartbeat's sessions hold CONDUCT
 *   A18  list_task_runs' totalRuns ignored -> a list short of its total ADMITS; the bare-array limit still does not
 *
 * A18 AND A11's NEW ANCHOR ARRIVED WITH A MEASUREMENT (M-93): `list_task_runs` prints an OBJECT whose `totalRuns`
 * proves its runs complete, where the judgement's first draft read a bare array and guessed from its length.
 *
 * A16 AND A17 WERE ADDED AFTER THE FIRST RUN, AND THE REASON IS A FINDING ABOUT THE SUITE, NOT THE SUBJECT: on the
 * fifteen-arm run of 2026-09-21 the heartbeat assertion fell ONLY as collateral — under A7 through a CONDUCT #11
 * predecessor sharing its fixture, and under A15 through the get_session route — so no arm had ever shown that it
 * catches a heartbeat read AS the lane. Its fixture now holds heartbeats and another lane alone, and these two arms
 * are the two design shortcuts that would make it fail: both were considered and rejected when the judgement was
 * written.
 *
 * MUST NOT fail in any arm: the fixture-corpus assertion, which is downstream of nothing in the subject; an arm that
 * takes it down has perturbed a second variable.
 *
 * **THE LIMIT, STATED FIRST (M0-42): nothing here proves a control RAN.** The run of record is written into the
 * suite's `NEGATIVE CONTROL:` declaration with its date and figures.
 */
import "./stdio.mjs";                 /* D-282: a writer's own exit must not discard the writer's own output */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preflight } from "../scripts/armdecay.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const PRED = path.join(REPO, "tools", "occupancy.mjs");
const SUITE = path.join(REPO, "bio-plane", "test", "occupancy.test.mjs");
const PEN = path.join(REPO, ".m081-harness");
const ONLY = process.argv[2] || null;
const MIN_BYTES = 10000;

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (b) => createHash("sha256").update(b).digest("hex");
const EMPTY = sha(Buffer.alloc(0));

/* ---------------------------------------------------------------- THE PRISTINE SUBJECT, taken ONCE */
const PRISTINE = fs.readFileSync(PRED);
const DIGEST = sha(PRISTINE);
if (PRISTINE.length < MIN_BYTES || DIGEST === EMPTY) {
  console.log(`** ${PRED} is implausibly small (${PRISTINE.length} B); refusing to arm over it`);
  process.exit(1);
}
console.log(`  pristine subject: tools/occupancy.mjs ${PRISTINE.length} bytes, sha256 ${DIGEST.slice(0, 12)}…`);

const WRITTEN = new Set();
function restoreFromMemory(why) {
  if (sha(fs.readFileSync(PRED)) === DIGEST) return;
  fs.writeFileSync(PRED, PRISTINE);
  console.log(`    ${why}: tools/occupancy.mjs restored from memory — sha256 ${sha(fs.readFileSync(PRED)) === DIGEST ? "match" : "**MISMATCH**"}`);
}
process.on("exit", (code) => {
  restoreFromMemory(`exit ${code}`);
  for (const p of WRITTEN) { try { fs.rmSync(p, { force: true }); } catch { /* reported below */ } }
  try { if (fs.existsSync(PEN) && fs.readdirSync(PEN).length === 0) fs.rmdirSync(PEN); } catch { /* reported below */ }
  const left = [...WRITTEN].filter((p) => fs.existsSync(p));
  console.log(`occupancy.control pen: ${left.length ? `${left.length} copy(ies) REMAIN in ${PEN}` : "this driver's copies removed"} · exit ${code}`);
});
let CURRENT = null;
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"])
  process.on(sig, () => { if (CURRENT) { try { CURRENT.kill("SIGTERM"); } catch { /* already gone */ } } process.exit(130); });

function suiteRun() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SUITE], { cwd: REPO, stdio: ["ignore", "pipe", "pipe"] });
    CURRENT = child;
    const out = [];
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => out.push(d));
    child.on("close", (status) => {
      CURRENT = null;
      const text = Buffer.concat(out).toString("utf8");
      const tally = text.match(/^occupancy: (\d+) pass, (\d+) fail$/m);
      resolve({ status, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, reachedFoot: !!tally,
                failed: [...text.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]) });
    });
  });
}
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
const CANARY = "the fixture corpus is non-empty";

const ARMS = [
  { id: "A1", title: "the occupancy test DROPPED, so no live bound session is ever an occupant (the row's own control)",
    from: `    else if (row.instance === null || row.instance >= n) occupants.push(row);
    else predecessors.push(row);`,
    to: `    else predecessors.push(row);`,
    mustBreak: "the incident's duplicate CONDUCT #8 is REFUSED",
    mustNotBreak: ["a heartbeat run-session does not hold the CONDUCT lane, by title or by its task"] },

  { id: "A2", title: "the scheduledTaskId route DROPPED — a title-only reading of get_session records",
    from: `    if (typeof s.scheduledTaskId === "string" && laneTasks.has(s.scheduledTaskId)) {`,
    to: `    if (false) {`,
    mustBreak: "a session a task stood up under ANOTHER title is REFUSED by its scheduledTaskId",
    mustNotBreak: ["REFUSED as a run of its task where the listing cannot print scheduledTaskId"] },

  { id: "A3", title: "the runs route DROPPED — a lane task's runs read and never bound",
    from: `    for (const r of list.filter(isObject)) {`,
    to: `    for (const r of [].filter(isObject)) {`,
    mustBreak: "REFUSED as a run of its task where the listing cannot print scheduledTaskId",
    mustNotBreak: ["a session a task stood up under ANOTHER title is REFUSED by its scheduledTaskId"] },

  { id: "A4", title: "the lane's tasks no longer read from the task listing — only a declared --task binds",
    from: `  for (const t of listedTasks)
    if (laneKey(t.title) === lane)`,
    to: `  for (const t of listedTasks)
    if (false)`,
    mustBreak: "a session a task stood up under ANOTHER title is REFUSED by its scheduledTaskId",
    mustNotBreak: ["the incident's duplicate CONDUCT #8 is REFUSED"] },

  { id: "A5", title: "the TITLE half dropped — only a task binds",
    from: `    if (laneKey(s.title) === lane) { e.bindings.push(`,
    to: `    if (false) { e.bindings.push(`,
    mustBreak: "a chip-filed duplicate, bound by title alone, is REFUSED",
    mustNotBreak: ["REFUSED as a run of its task where the listing cannot print scheduledTaskId"] },

  { id: "A6", title: "OVER-STRICTNESS: an ARCHIVE not honoured — every session is live",
    from: `const isLive = (archived) => archived !== true;`,
    to: `const isLive = (archived) => true;`,
    mustBreak: "the same listing with that session stood down ADMITS",
    mustNotBreak: ["the incident's duplicate CONDUCT #8 is REFUSED"] },

  { id: "A7", title: "OVER-STRICTNESS: the PREDECESSOR exemption dropped — every live bound session refuses",
    from: `    else if (row.instance === null || row.instance >= n) occupants.push(row);`,
    to: `    else if (true) occupants.push(row);`,
    mustBreak: "a live PREDECESSOR does not hold the lane against its successor's chip",
    mustNotBreak: ["the incident's duplicate CONDUCT #8 is REFUSED"] },

  { id: "A8", title: "the chip's OWN instance admitted (>= read as >) — the incident's exact shape",
    from: `row.instance >= n) occupants.push(row);`,
    to: `row.instance > n) occupants.push(row);`,
    mustBreak: "the incident's duplicate CONDUCT #8 is REFUSED",
    mustNotBreak: ["a SUCCESSOR already up refuses the stale chip"] },

  { id: "A9", title: "a TRUNCATED listing believed — the limit check dropped",
    from: `  else if (sessions.length >= limit)`,
    to: `  else if (false)`,
    mustBreak: "a listing at its limit is UNDETERMINED",
    mustNotBreak: ["without --limit the verdict is UNDETERMINED"] },

  { id: "A10", title: "the TASK LISTING not required — a raw list_sessions array judged complete",
    from: `  if (tasks === null)`,
    to: `  if (false)`,
    mustBreak: "without the task listing the verdict is UNDETERMINED",
    mustNotBreak: ["a listing at its limit is UNDETERMINED"] },

  { id: "A11", title: "a BARE runs list CUT AT A LIMIT believed",
    from: `r.total !== null ? r.read >= r.total : !RUN_LIMITS.has(r.read)`,
    to: `r.total !== null ? r.read >= r.total : true`,
    mustBreak: "a runs list cut at list_task_runs' default is UNDETERMINED",
    mustNotBreak: ["a runs list short of its totalRuns is UNDETERMINED"] },

  { id: "A12", title: "the lane compared BY CASE",
    from: `export const laneKey = (title) => laneOf({ title: str(title) }).toUpperCase();`,
    to: `export const laneKey = (title) => laneOf({ title: str(title) });`,
    mustBreak: "a lane title in another CASE still holds the lane",
    mustNotBreak: ["the incident's duplicate CONDUCT #8 is REFUSED"] },

  { id: "A13", title: "what cannot be classified NOT NAMED — the MENTIONS dropped",
    from: `    if (e.live && !e.bindings.length && word.test(str(e.title)))`,
    to: `    if (false)`,
    mustBreak: "a live row naming the lane's word in prose holds nothing and is NAMED under MENTIONS",
    mustNotBreak: ["a heartbeat run-session does not hold the CONDUCT lane, by title or by its task"] },

  { id: "A14", title: "a GAP outranks an OCCUPANT — the verdict's order reversed",
    from: `  const verdict = occupants.length ? REFUSE : missing.length ? UNDETERMINED : ADMIT;`,
    to: `  const verdict = missing.length ? UNDETERMINED : occupants.length ? REFUSE : ADMIT;`,
    mustBreak: "an occupant REFUSES even when every gap is open",
    mustNotBreak: ["the incident's duplicate CONDUCT #8 is REFUSED"] },

  { id: "A15", title: "OVER-STRICTNESS: a get_session record NOT READ as unlinked where it prints no scheduledTaskId",
    from: `  || Object.hasOwn(s, "createdAt");`,
    to: `  ;`,
    mustBreak: "get_session records for every live row cover the task half without runs",
    mustNotBreak: ["a session a task stood up under ANOTHER title is REFUSED by its scheduledTaskId"] },

  { id: "A16", title: "OVER-STRICTNESS: the title read LOOSELY — any title containing the lane's word binds",
    from: `    if (laneKey(s.title) === lane) { e.bindings.push(`,
    to: `    if (str(s.title).toUpperCase().includes(lane)) { e.bindings.push(`,
    mustBreak: "a heartbeat run-session does not hold the CONDUCT lane, by title or by its task",
    mustNotBreak: ["the incident's duplicate CONDUCT #8 is REFUSED"] },

  { id: "A17", title: "OVER-STRICTNESS: a lane's tasks read by task-id PREFIX — conduct-heartbeat taken for the lane's",
    from: `    if (laneKey(t.title) === lane)
      laneTasks.set(t.taskId,`,
    to: `    if (laneKey(t.title) === lane || t.taskId.toUpperCase().startsWith(lane + "-"))
      laneTasks.set(t.taskId,`,
    mustBreak: "a heartbeat run-session does not hold the CONDUCT lane, by title or by its task",
    mustNotBreak: ["the incident's duplicate CONDUCT #8 is REFUSED"] },

  { id: "A18", title: "list_task_runs' totalRuns IGNORED — a runs list short of its total believed",
    from: `r.total !== null ? r.read >= r.total : !RUN_LIMITS.has(r.read)`,
    to: `r.total !== null ? true : !RUN_LIMITS.has(r.read)`,
    mustBreak: "a runs list short of its totalRuns is UNDETERMINED",
    mustNotBreak: ["a runs list cut at list_task_runs' default is UNDETERMINED"] },
];
const DECLARED_ARMS = 18;

const RUNNING = ONLY ? ARMS.filter((a) => a.id === ONLY) : ARMS;
if (ONLY && !RUNNING.length) { console.log(`** no arm '${ONLY}' — the arms are ${ARMS.map((a) => a.id).join(", ")}`); process.exit(2); }
preflight("occupancy.control", ARMS.map((a) => ({ id: a.id, anchors: [{ file: PRED, needle: a.from }] })),
          { fatalFor: RUNNING.map((a) => a.id) });

function armPatch(a) {
  fs.mkdirSync(PEN, { recursive: true });
  const copy = path.join(PEN, `arm${a.id}--occupancy.mjs`);
  fs.writeFileSync(copy, PRISTINE);
  WRITTEN.add(copy);
  const before = PRISTINE.toString("utf8");
  const hits = before.split(a.from).length - 1;
  if (hits === 1) fs.writeFileSync(PRED, before.replace(a.from, a.to));
  return { hits, copy };
}
function restore(a, copy) {
  fs.writeFileSync(PRED, PRISTINE);
  const now = fs.readFileSync(PRED);
  const cmp = spawnSync("cmp", ["-s", PRED, copy]).status === 0;
  const ok = sha(now) === DIGEST && cmp && now.length === PRISTINE.length && now.length >= MIN_BYTES;
  console.log(`    restored tools/occupancy.mjs: ${now.length} bytes, sha256 ${sha(now).slice(0, 12)}…, cmp against `
    + `arm${a.id}'s copy ${cmp ? "identical" : "DIFFERS"} — byte-identical: ${ok ? "YES" : "NO"}`);
  if (ok) { fs.rmSync(copy, { force: true }); WRITTEN.delete(copy); }
  return ok;
}

/* --------------------------------------------------------------- BASELINE — an arm, not decoration */
console.log("\n--- ARM BASELINE · nothing armed ---");
const base = await suiteRun();
t("baseline · the suite reached its own FOOT", base.reachedFoot, true);
t("baseline · the suite is GREEN", [base.pass > 50, base.fail, base.status], [true, 0, 0]);
console.log(`  baseline suite: ${base.pass} pass, ${base.fail} fail`);

let armed = 0;
const table = [];
for (const a of RUNNING) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  const { hits, copy } = armPatch(a);
  t(`${a.id} · the arm ARMED (patch matched exactly once)`, hits, 1);
  if (hits === 1) armed++;
  const s = await suiteRun();
  const broken = broke(s, a.mustBreak);
  const spared = (a.mustNotBreak || []).map((nb) => !broke(s, nb));
  t(`${a.id} · the suite FAILS at "${a.mustBreak.slice(0, 60)}…"`, broken, true);
  t(`${a.id} · ...and the suite survived to report it`, s.reachedFoot, true);
  t(`${a.id} · ...and the canary is untouched, so nothing collateral moved`, broke(s, CANARY), false);
  (a.mustNotBreak || []).forEach((nb, i) =>
    t(`${a.id} · ...and "${nb.slice(0, 48)}…" does NOT fail, so this arm is isolated`, spared[i], true));
  console.log(`    suite under ${a.id}: ${s.pass} pass, ${s.fail} fail — failing: ${s.failed.map((l) => `"${l.slice(0, 70)}"`).join("; ")}`);
  t(`${a.id} · RESTORED byte-identically`, restore(a, copy), true);
  table.push({ id: a.id, asDeclared: hits === 1 && broken && s.reachedFoot && spared.every(Boolean), pass: s.pass, fail: s.fail });
}

/* --------------------------------------------------------------- CLOSING — every arm restored */
console.log("\n--- CLOSING · every arm restored, the suite green again ---");
const closing = await suiteRun();
t("closing · the suite is GREEN again, so no arm leaked", [closing.fail, closing.status], [0, 0]);
t("closing · the subject is byte-identical to the pristine digest", sha(fs.readFileSync(PRED)), DIGEST);
console.log(`  closing suite: ${closing.pass} pass, ${closing.fail} fail`);

console.log("\n--- THE ARMS, as run ---");
for (const r of table) console.log(`  ${r.id.padEnd(4)} ${r.asDeclared ? "as declared    " : "NOT AS DECLARED"}  suite ${r.pass} pass / ${r.fail} fail`);
if (!ONLY) t(`the declared tally holds: ${DECLARED_ARMS} arms declared at the head, ${armed} armed and run`, armed, DECLARED_ARMS);
console.log(`\noccupancy.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
