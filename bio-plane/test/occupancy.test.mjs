/* occupancy — M0-81 driven: before a chip is filed, is the lane already held? `tools/occupancy.mjs`, enacting BOB
 * #18's ruling in `kickoffs/BOB.md` "Spawning and retiring lanes" (rule 1, and a stood-down, duplicate or retired
 * session RELEASES the lane name). Its lane reading is `tools/retirable.mjs`'s `laneOf`, imported, so a change there
 * is a change here and this suite names that file for the gate's TARGETED class to find.
 *
 * WHAT THIS SUITE DEFENDS AGAINST, stated before the arms, because both cheap ways to make an occupancy check green
 * are catastrophic and each looks like a passing suite:
 *   - ADMIT TOO MUCH — match on TITLE ALONE (M0-81's named liar: a session a scheduled task stood up under another
 *     title), ignore the chip's own instance, or believe a truncated listing. The 2026-09-19 duplicate was made this
 *     way. **So the incident is a fixture, and every route a holder can be evidenced by has its own REFUSE arm.**
 *   - REFUSE TOO MUCH — treat an archived session as live, a live PREDECESSOR as a holder, or a heartbeat
 *     run-session as the lane. Refusing every successor chip is a gate that fires on the normal case and gets
 *     switched off. **So every REFUSE section sits beside an ADMIT over the same shapes.**
 *
 * THE FIXTURES ARE THE HARNESS'S OWN SHAPES, MEASURED 2026-09-21 (M-93) and never called from here: a `list_sessions`
 * row carries no `scheduledTaskId` and no `createdAt`; a `get_session` record carries `createdAt`, and
 * `scheduledTaskId` ONLY when a task started the session; a `list_scheduled_tasks` entry carries its own `title`; a
 * `list_task_runs` entry carries `session_id` and `archived`. The task ids are the estate's real two, `conduct-8`
 * (the operator's; its definition lives outside this repository) and `conduct-heartbeat`.
 *
 * NEGATIVE CONTROL: RUN 2026-09-22 by the M0-81 worker, `node bio-plane/test/occupancy.control.mjs` from the repo root
 * — eighteen arms plus a baseline, each armed ALONE against `tools/occupancy.mjs` held in memory, every restore
 * verified by sha256 AND `cmp` against the arm's own copy with the byte count floored; driver exit 0, 113 pass / 0 fail;
 * baseline and closing suite 65 pass / 0 fail; subject sha256 ebdb4fcf… before and after. Every arm failed at its
 * declared assertion and spared its declared isolation assertion; suite tallies under each arm in brackets.
 *   (a) the occupancy test dropped, the row's own control -> the duplicate-CONDUCT fixture is admitted and "the incident's duplicate CONDUCT #8 is REFUSED" fails by name [43 / 22]
 *   (b) the scheduledTaskId route dropped -> "a session a task stood up under ANOTHER title is REFUSED by its scheduledTaskId" fails, the runs route holding [63 / 2]
 *   (c) the runs route dropped -> "REFUSED as a run of its task" fails, the scheduledTaskId route holding [60 / 5]
 *   (d) the lane's tasks no longer read from the task listing -> the liar is admitted while the incident's title still refuses [49 / 16]
 *   (e) the title half dropped -> "a chip-filed duplicate, bound by title alone, is REFUSED" fails, the runs route holding [46 / 19]
 *   (f) OVER-STRICTNESS, an archive not honoured -> "the same listing with that session stood down ADMITS" fails [57 / 8]
 *   (g) OVER-STRICTNESS, the predecessor exemption dropped -> "a live PREDECESSOR does not hold the lane" fails [51 / 14]
 *   (h) the chip's own instance admitted, `>=` read as `>` -> the incident is admitted while a stale chip still refuses [47 / 18]
 *   (i) a truncated listing believed -> "a listing at its limit is UNDETERMINED" fails alone [64 / 1]
 *   (j) the task listing not required -> "without the task listing the verdict is UNDETERMINED" fails [62 / 3]
 *   (k) a BARE runs list cut at a limit believed -> "a runs list cut at list_task_runs' default is UNDETERMINED" fails, the totalRuns check holding [63 / 2]
 *   (l) the lane compared by case -> "a lane title in another CASE still holds the lane" fails [63 / 2]
 *   (m) the MENTIONS dropped -> the prose mention and the prefixed blind spot go unnamed [61 / 4]
 *   (n) a gap outranks an occupant -> "an occupant REFUSES even when every gap is open" fails alone [64 / 1]
 *   (o) OVER-STRICTNESS, a get_session record not read as unlinked -> "get_session records for every live row cover the task half" fails [63 / 2]
 *   (p) OVER-STRICTNESS, the title read loosely -> "a heartbeat run-session does not hold the CONDUCT lane" fails [51 / 14]
 *   (q) OVER-STRICTNESS, a lane's tasks read by task-id prefix -> the same heartbeat assertion fails [52 / 13]
 *   (r) list_task_runs' totalRuns ignored -> "a runs list short of its totalRuns is UNDETERMINED" fails alone [64 / 1]
 * TWO FINDINGS, recorded rather than smoothed. On the first run (2026-09-21, fifteen arms) the heartbeat assertion fell
 * only as collateral (under (g) through a predecessor sharing its fixture, under (o) through the get_session route), so
 * no arm had shown it catches a heartbeat read AS the lane: its fixture was isolated, and (p) and (q) added. And the
 * judgement's first draft read `list_task_runs` as a bare array, which the tool does not print (M-93): it now reads the
 * printed object and its `totalRuns`, (r) was added, (k)'s anchor moved, and every arm was re-run on the changed subject.
 */

import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";
import "./sandbox.mjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { judge, render, laneKey, linkageRead, ADMIT, REFUSE, UNDETERMINED, EXIT } from "../../tools/occupancy.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");
const CLI = join(REPO, "tools/occupancy.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 9;
let reached = 0;
const section = (s) => { reached++; console.log(`\n--- ${s} ---`); };

/* ---------------------------------------------------------------- FIXTURES, in the harness's measured shapes */
const T0 = Date.parse("2026-09-19T04:00:00Z");
const at = (min) => new Date(T0 + min * 60_000).toISOString();
const ID = Object.fromEntries(["c6", "c7", "c8task", "dupChip", "c10", "c11", "c12", "c13", "hb1", "hb2", "hb3",
  "s3", "s10", "d4", "b25", "f3", "x", "y"].map((k) => [k, `local_fixture-${k}`]));
/* `list_sessions`' row, as printed (M-93): no scheduledTaskId, no createdAt. */
const listed = ({ id, title, archived = false, running = false, last = at(0), cwd = REPO }) => ({
  sessionId: id, title, cwd, isArchived: archived, isRunning: running, lastActivityAt: last,
  group: null, link: `claude://claude.ai/epitaxy/${id}`, remoteControlActive: false });
/* `get_session`'s record: the row's fields plus its own, and scheduledTaskId ONLY when a task started it (M-93). */
const detailed = ({ task, ...o }) => {
  const rec = { ...listed(o), createdAt: at(-90), model: "claude-opus-5", originCwd: o.cwd ?? REPO,
                isRemote: false, remoteControlState: "off" };
  if (task) rec.scheduledTaskId = task;
  return rec;
};
const task = (taskId, title, description, schedule = "Manual only") =>
  ({ taskId, title, description, path: `(fixture)/scheduled-tasks/${taskId}/SKILL.md`, schedule, enabled: true });
const run = (id, title, { archived = false, status = "running", start = at(0) } = {}) =>
  ({ session_id: id, title, status, started_at: start, last_activity_at: start, archived });
/* `list_task_runs`' output as it PRINTS it (M-93): an object around the runs, whose `totalRuns` proves them complete. */
const taskRuns = (taskId, runs, { total = runs.length, deleted = false } = {}) =>
  ({ taskId, taskDeleted: deleted, totalRuns: total, runs });

const HEARTBEAT_TASK = task("conduct-heartbeat", "CONDUCT heartbeat (BIO)",
  "Watchdog for the integrator lane: judges whether a CONDUCT session exists, and reports.",
  "At 7, 27, and 47 minutes past the hour");
const CONDUCT8_TASK = task("conduct-8", "CONDUCT #8 (BIO) — integrator lane",
  "Starts CONDUCT #8, the integrator lane, from its handoff. Run manually.");
const TASKS = [HEARTBEAT_TASK, CONDUCT8_TASK];

/* THE 2026-09-19 LISTING, as BOB #17 would have read it before filing `CONDUCT #8` (M-74, BOB.md rule 1): the
   session the `conduct-8` task stood up six minutes earlier, the predecessor that wrote the handoff, three heartbeat
   run-sessions, another lane, and an archived ancestor. The filer is absent — `list_sessions` excludes its caller. */
const incident = ({ taskSession = {}, form = listed } = {}) => [
  form({ id: ID.c8task, title: "CONDUCT #8", running: true, last: at(6), task: "conduct-8", ...taskSession }),
  form({ id: ID.hb1, title: "CONDUCT heartbeat (BIO)", last: at(5), task: "conduct-heartbeat" }),
  form({ id: ID.hb2, title: "CONDUCT heartbeat (BIO)", last: at(-15), task: "conduct-heartbeat" }),
  form({ id: ID.hb3, title: "CONDUCT heartbeat (BIO)", last: at(-35), task: "conduct-heartbeat" }),
  form({ id: ID.s3, title: "SCHEDULER #3", last: at(-20) }),
  form({ id: ID.c7, title: "CONDUCT #7", last: at(-40) }),
  form({ id: ID.c6, title: "CONDUCT #6", archived: true, last: at(-600) }),
];
const RUNS_LIVE = { "conduct-8": taskRuns("conduct-8", [run(ID.c8task, "CONDUCT #8")]) };
const RUNS_DOWN = { "conduct-8": taskRuns("conduct-8", [run(ID.c8task, "CONDUCT #8", { archived: true, status: "succeeded" })]) };
const ids = (list) => list.map((o) => o.sessionId).sort();

/* ========================================================================== */
section("1 — THE INCIDENT, REFUSED: `CONDUCT #8` filed after the conduct-8 task had stood CONDUCT #8 up");
{
  t("the fixture corpus is non-empty: seven incident rows, two tasks", [incident().length, TASKS.length], [7, 2]);
  console.log(`  fixture corpus: incident ${incident().length} rows · tasks ${TASKS.length} · runs ${RUNS_LIVE["conduct-8"].runs.length}`);
  const r = judge({ chip: "CONDUCT #8", sessions: incident(), limit: 200, tasks: TASKS, runs: RUNS_LIVE });
  t("the incident's duplicate CONDUCT #8 is REFUSED", r.verdict, REFUSE);
  t("...and the occupant is NAMED: the session the conduct-8 task stood up", ids(r.occupants), [ID.c8task]);
  t("...bound by its title AND as a run of task conduct-8", r.occupants[0]?.bindings,
    ["title 'CONDUCT #8'", "a run of task conduct-8"]);
  t("...at the chip's own instance, which is what makes it a duplicate", r.occupants[0]?.instance, 8);
  t("CONDUCT #7, live, is the PREDECESSOR the chip replaces, not an occupant", ids(r.predecessors), [ID.c7]);
  t("CONDUCT #6, archived, is RELEASED", ids(r.released), [ID.c6]);
  t("the heartbeat run-sessions hold nothing and are NAMED under MENTIONS, with their task", r.mentions,
    [{ title: "CONDUCT heartbeat (BIO)", count: 3, taskId: "conduct-heartbeat", shadows: false }]);
  t("conduct-8 is the lane's task, read from its own title", r.laneTasks.map((x) => [x.taskId, x.instance]),
    [["conduct-8", 8]]);
  t("nothing was missing from this input, so the refusal rests on evidence, not on a gap", r.missing, []);
}

/* ========================================================================== */
section("2 — THE SAME LISTING WITH THAT SESSION STOOD DOWN ADMITS (BOB #18: a stood-down session RELEASES the name)");
{
  const r = judge({ chip: "CONDUCT #8", limit: 200, tasks: TASKS, runs: RUNS_DOWN,
                    sessions: incident({ taskSession: { archived: true, running: false } }) });
  t("the same listing with that session stood down ADMITS", r.verdict, ADMIT);
  t("...and the stood-down session is RELEASED, not silently dropped", ids(r.released), [ID.c6, ID.c8task].sort());
  t("...and CONDUCT #7 is still reported as the predecessor", ids(r.predecessors), [ID.c7]);
  /* BOB #18's three words, each archived: the chip-filed DUPLICATE, the task's session STOOD DOWN, a RETIRED
     predecessor. Archiving is the release mechanism rule 3 rules; none of them holds the lane. */
  const three = judge({ chip: "CONDUCT #8", limit: 200, tasks: TASKS, runs: { "conduct-8": [] }, sessions: [
    listed({ id: ID.dupChip, title: "CONDUCT #8", archived: true }),
    listed({ id: ID.c8task, title: "CONDUCT #8 (BIO) — integrator lane", archived: true }),
    listed({ id: ID.c7, title: "CONDUCT #7", archived: true }),
    listed({ id: ID.s3, title: "SCHEDULER #3" }),
  ] });
  t("a stood-down, a duplicate and a retired session, all archived, hold nothing: ADMIT", three.verdict, ADMIT);
  t("...each of the three listed as RELEASED", ids(three.released), [ID.c7, ID.c8task, ID.dupChip].sort());
}

/* ========================================================================== */
section("3 — THE LIAR: a title that differs and a scheduledTaskId that matches must still REFUSE");
{
  const retitled = { title: "BIO integrator lane" };
  /* The proof the title half alone would ADMIT this listing — so what refuses below IS the task half. */
  const titled = incident({ taskSession: retitled }).filter((s) => !s.isArchived && laneKey(s.title) === "CONDUCT");
  t("no live title in the liar's listing names CONDUCT at #8 or above, so a title-only matcher admits it",
    titled.map((s) => s.title), ["CONDUCT #7"]);
  const viaRecord = judge({ chip: "CONDUCT #8", limit: 200, tasks: TASKS,
                            sessions: incident({ form: detailed, taskSession: retitled }) });
  t("a session a task stood up under ANOTHER title is REFUSED by its scheduledTaskId", viaRecord.verdict, REFUSE);
  t("...naming it, bound by scheduledTaskId conduct-8 at the task's own instance",
    viaRecord.occupants.map((o) => [o.sessionId, o.bindings, o.instance]), [[ID.c8task, ["scheduledTaskId conduct-8"], 8]]);
  const viaRuns = judge({ chip: "CONDUCT #8", limit: 200, tasks: TASKS, sessions: incident({ taskSession: retitled }),
                          runs: { "conduct-8": taskRuns("conduct-8", [run(ID.c8task, "BIO integrator lane")]) } });
  t("...and REFUSED as a run of its task where the listing cannot print scheduledTaskId", viaRuns.verdict, REFUSE);
  t("...naming it, bound as a run of task conduct-8", viaRuns.occupants.map((o) => [o.sessionId, o.bindings]),
    [[ID.c8task, ["a run of task conduct-8"]]]);
  const blind = judge({ chip: "CONDUCT #8", limit: 200, tasks: TASKS, sessions: incident({ taskSession: retitled }) });
  t("with neither runs nor get_session records the liar's listing is UNDETERMINED, never a title-only ADMIT",
    blind.verdict, UNDETERMINED);
  t("...naming the one call that closes it", blind.missing.some((g) => g.remedy.includes('list_task_runs("conduct-8")')), true);
}

/* ========================================================================== */
section("4 — THE TITLE HALF: a chip-filed duplicate carries no task, and its title alone holds the lane");
{
  const r = judge({ chip: "CONDUCT #8", limit: 200, tasks: TASKS, runs: { "conduct-8": [] }, sessions: [
    listed({ id: ID.dupChip, title: "CONDUCT #8", last: at(1) }), listed({ id: ID.c7, title: "CONDUCT #7" }) ] });
  t("a chip-filed duplicate, bound by title alone, is REFUSED", r.verdict, REFUSE);
  t("...naming it", r.occupants.map((o) => [o.sessionId, o.bindings]), [[ID.dupChip, ["title 'CONDUCT #8'"]]]);
  const verdictFor = (title) => judge({ chip: "CONDUCT #12", limit: 200, tasks: [],
                                        sessions: [listed({ id: ID.x, title })] }).verdict;
  t("M0-83's SUFFIXED lane title holds the lane", verdictFor("CONDUCT #12 (BIO) — integrator lane"), REFUSE);
  t("a lane title in another CASE still holds the lane", [verdictFor("Conduct #12"), verdictFor("conduct #12")],
    [REFUSE, REFUSE]);
}

/* ========================================================================== */
section("5 — OVER-STRICTNESS: a predecessor, a heartbeat, another lane and a prose mention hold nothing");
{
  const r = judge({ chip: "CONDUCT #12", limit: 200, tasks: TASKS, runs: { "conduct-8": [] }, sessions: [
    listed({ id: ID.c11, title: "CONDUCT #11", running: true }), listed({ id: ID.c10, title: "CONDUCT #10", last: at(-300) }),
    listed({ id: ID.d4, title: "DIST #4" }), listed({ id: ID.b25, title: "BOB #25" }),
    listed({ id: ID.s10, title: "SCHEDULER #10" }), listed({ id: ID.f3, title: "FLEET #3" }) ] });
  t("a live PREDECESSOR does not hold the lane against its successor's chip", r.verdict, ADMIT);
  t("...and every live predecessor is NAMED for the successor to retire", ids(r.predecessors), [ID.c10, ID.c11].sort());
  const others = [ID.d4, ID.b25, ID.s10, ID.f3];
  t("...and other lanes' live sessions are neither occupants nor mentions",
    [...r.occupants, ...r.predecessors].filter((o) => others.includes(o.sessionId)).length + r.mentions.length, 0);
  /* Heartbeats and ANOTHER lane only, with the lane task's runs passed: nothing here leans on the predecessor rule or
     on the get_session route, so the only thing that can make this REFUSE is a heartbeat read as the lane. */
  const beats = Array.from({ length: 30 }, (_, i) => detailed({ id: `local_fixture-heartbeat-${i}`,
    title: "CONDUCT heartbeat (BIO)", task: "conduct-heartbeat", last: at(-20 * i) }));
  const hb = judge({ chip: "CONDUCT #12", limit: 200, tasks: TASKS, runs: { "conduct-8": [] },
                     sessions: [...beats, detailed({ id: ID.d4, title: "DIST #4" })] });
  t("a heartbeat run-session does not hold the CONDUCT lane, by title or by its task", hb.verdict, ADMIT);
  t("...and all thirty are NAMED on one MENTIONS line, with the task whose title they carry", hb.mentions,
    [{ title: "CONDUCT heartbeat (BIO)", count: 30, taskId: "conduct-heartbeat", shadows: false }]);
  t("...and conduct-heartbeat is read as a task MENTIONING the lane, never as its task",
    [hb.taskMentions, hb.laneTasks.map((x) => x.taskId)], [["conduct-heartbeat"], ["conduct-8"]]);
  const prose = judge({ chip: "CONDUCT #12", limit: 200, tasks: [],
                        sessions: [listed({ id: ID.x, title: "Review the CONDUCT kickoff" })] });
  t("a live row naming the lane's word in prose holds nothing and is NAMED under MENTIONS",
    [prose.verdict, prose.mentions.map((m) => m.title)], [ADMIT, ["Review the CONDUCT kickoff"]]);
  /* The stated blind spot, never silently scored: a word BEFORE the lane is a form `laneOf` does not place. */
  const prefixed = judge({ chip: "CONDUCT #12", limit: 200, tasks: [],
                           sessions: [listed({ id: ID.y, title: "[BIO] CONDUCT #12" })] });
  t("a title carrying CONDUCT #12 in a form the lane reading does not place is UNDETERMINED, never ADMIT",
    [prefixed.verdict, prefixed.mentions.map((m) => m.shadows)], [UNDETERMINED, [true]]);
}

/* ========================================================================== */
section("6 — REFUSE: a successor already up, an instance nobody can read, and evidence that disagrees");
{
  const stale = judge({ chip: "CONDUCT #12", limit: 200, tasks: [], sessions: [
    listed({ id: ID.c13, title: "CONDUCT #13" }), listed({ id: ID.c11, title: "CONDUCT #11" }) ] });
  t("a SUCCESSOR already up refuses the stale chip", [stale.verdict, ids(stale.occupants)], [REFUSE, [ID.c13]]);
  t("...and the refusal says the chip is stale", /a SUCCESSOR is already up, so this chip is stale/.test(render(stale)), true);
  const bare = judge({ chip: "CONDUCT #12", limit: 200, tasks: [], sessions: [listed({ id: ID.x, title: "CONDUCT" })] });
  t("a bare lane title, whose instance cannot be read, is an occupant: it cannot be shown to be a predecessor",
    [bare.verdict, bare.occupants[0]?.instance], [REFUSE, null]);
  const disagree = judge({ chip: "CONDUCT #9", limit: 200, tasks: TASKS,
                           sessions: [detailed({ id: ID.x, title: "CONDUCT #9", task: "conduct-8" })] });
  t("evidence that disagrees on the instance errs toward REFUSE, the highest number read",
    [disagree.verdict, disagree.occupants[0]?.instance], [REFUSE, 9]);
}

/* ========================================================================== */
section("7 — UNDETERMINED: the verdict never claims more than its input could show");
{
  /* Another lane's row only: every verdict below turns on what the input could SHOW, never on a binding. */
  const base = { chip: "CONDUCT #12", tasks: TASKS, runs: { "conduct-8": [] },
                 sessions: [listed({ id: ID.d4, title: "DIST #4" })] };
  const noLimit = judge({ ...base });
  t("without --limit the verdict is UNDETERMINED",
    [noLimit.verdict, noLimit.missing.some((g) => /limit was not declared/.test(g.gap))], [UNDETERMINED, true]);
  const twenty = Array.from({ length: 20 }, (_, i) => listed({ id: `local_fixture-row-${i}`, title: `RECORD #${i + 1}` }));
  const cut = judge({ ...base, sessions: twenty, limit: 20 });
  t("a listing at its limit is UNDETERMINED: an idle holder is the first row list_sessions drops",
    [cut.verdict, cut.missing.some((g) => /may be TRUNCATED/.test(g.gap))], [UNDETERMINED, true]);
  t("...and the same listing one row under its limit is complete", judge({ ...base, sessions: twenty.slice(1), limit: 20 }).verdict,
    ADMIT);
  const noTasks = judge({ ...base, limit: 200, tasks: null, runs: null });
  t("without the task listing the verdict is UNDETERMINED",
    [noTasks.verdict, noTasks.missing.some((g) => /list_scheduled_tasks/.test(g.remedy))], [UNDETERMINED, true]);
  t("an EMPTY task listing is a finding: no task can bind the lane, and the title half decides",
    judge({ ...base, limit: 200, tasks: [], runs: null }).verdict, ADMIT);
  const noRuns = judge({ ...base, limit: 200, runs: null });
  t("a lane task with no runs passed, over list_sessions rows, is UNDETERMINED naming list_task_runs",
    [noRuns.verdict, noRuns.missing.some((g) => g.remedy.includes('list_task_runs("conduct-8")'))], [UNDETERMINED, true]);
  const oldRuns = (k) => Array.from({ length: k }, (_, i) =>
    run(`local_fixture-old-run-${i}`, "CONDUCT #8", { archived: true, status: "succeeded" }));
  const cut10 = judge({ ...base, limit: 200, runs: { "conduct-8": oldRuns(10) } });
  t("a runs list cut at list_task_runs' default is UNDETERMINED",
    [cut10.verdict, cut10.missing.some((g) => /with limit 50/.test(g.remedy))], [UNDETERMINED, true]);
  t("...and one cut at its maximum names get_session instead",
    judge({ ...base, limit: 200, runs: { "conduct-8": oldRuns(50) } }).missing.some((g) => /get_session record/.test(g.remedy)),
    true);
  /* The tool's own output carries `totalRuns` (M-93), which PROVES a list complete — so the same ten runs admit when
     the total says ten, and a list short of its total is a gap whatever its length. */
  t("a runs list whose totalRuns says it is whole is complete, even at ten",
    judge({ ...base, limit: 200, runs: { "conduct-8": taskRuns("conduct-8", oldRuns(10)) } }).verdict, ADMIT);
  const short = judge({ ...base, limit: 200, runs: { "conduct-8": taskRuns("conduct-8", oldRuns(3), { total: 7 }) } });
  t("a runs list short of its totalRuns is UNDETERMINED",
    [short.verdict, short.missing.some((g) => /came back 3 of 7/.test(g.gap))], [UNDETERMINED, true]);
  let wrongTask = null;
  try { judge({ ...base, limit: 200, runs: { "conduct-8": taskRuns("conduct-heartbeat", []) } }); } catch (e) { wrongTask = e.code; }
  t("list_task_runs' output filed under ANOTHER task's id is a usage error, never read", wrongTask, "OCCUPANCY_USAGE");
  t("a DELETED lane task is noted: it starts nothing new, and its live runs still hold",
    judge({ ...base, limit: 200, runs: { "conduct-8": taskRuns("conduct-8", [], { deleted: true }) } }).notes
      .some((x) => /task conduct-8 is DELETED/.test(x)), true);
  const records = judge({ ...base, limit: 200, runs: null, sessions: [detailed({ id: ID.d4, title: "DIST #4" }),
    detailed({ id: ID.hb1, title: "CONDUCT heartbeat (BIO)", task: "conduct-heartbeat" })] });
  t("get_session records for every live row cover the task half without runs", records.verdict, ADMIT);
  t("...because a get_session record is READ even where it prints no scheduledTaskId, and a list_sessions row is not",
    [linkageRead(detailed({ id: ID.x, title: "x" })), linkageRead(listed({ id: ID.x, title: "x" }))], [true, false]);
  const junk = judge({ ...base, limit: 200, sessions: [...base.sessions, "not a session"] });
  t("a row that is not a session object is UNDETERMINED, because it could be the holder",
    [junk.verdict, junk.missing.some((g) => /not session objects/.test(g.gap))], [UNDETERMINED, true]);
  const everyGap = judge({ chip: "CONDUCT #12", sessions: [listed({ id: ID.c12, title: "CONDUCT #12" })] });
  t("the every-gap fixture really leaves the limit AND the task listing open",
    [/limit was not declared/, /list_scheduled_tasks/].map((re) => everyGap.missing.some((g) => re.test(`${g.gap} ${g.remedy}`))),
    [true, true]);
  t("an occupant REFUSES even when every gap is open: one holder is enough", everyGap.verdict, REFUSE);
}

/* ========================================================================== */
section("8 — THE CLI, driven as a SUBPROCESS over fixture JSON on stdin: exit codes, the named occupant, usage");
{
  const cli = (input, ...args) => spawnSync(process.execPath, [CLI, ...args],
    { input: typeof input === "string" ? input : JSON.stringify(input), encoding: "utf8" });
  const c1 = cli({ sessions: incident(), tasks: TASKS, runs: RUNS_LIVE }, "--chip", "CONDUCT #8", "--limit", "200");
  t("the CLI REFUSES the incident with exit 1", c1.status, EXIT.REFUSE);
  t("...naming the occupant by title and FULL session id, which is what retiring it takes",
    c1.stdout.includes(`OCCUPANT  CONDUCT #8 [${ID.c8task}] — bound by title 'CONDUCT #8' and a run of task conduct-8`), true);
  t("...and ends on the verdict line", /\noccupancy: REFUSE — CONDUCT #8: 1 live session\(s\) already hold it\n$/.test(c1.stdout),
    true);
  const c2 = cli({ sessions: incident({ taskSession: { archived: true } }), tasks: TASKS, runs: RUNS_DOWN },
    "--chip", "CONDUCT #8", "--limit", "200");
  t("the CLI ADMITS the stood-down listing with exit 0",
    [c2.status, /\noccupancy: ADMIT — CONDUCT #8: no live session holds it\n$/.test(c2.stdout)], [EXIT.ADMIT, true]);
  const c3 = cli(incident(), "--chip", "CONDUCT #9", "--limit", "200");
  t("list_sessions' bare array is read, and without the task listing it is UNDETERMINED, exit 3",
    [c3.status, c3.stdout.includes("NOT SHOWN — the scheduled-task listing was not passed")], [EXIT.UNDETERMINED, true]);
  const usage = [
    cli(incident()),
    cli(incident(), "--chip", "CONDUCT"),
    cli("", "--chip", "CONDUCT #9"),
    cli("{not json", "--chip", "CONDUCT #9"),
    cli(incident(), "--chip", "CONDUCT #9", "--limit", "many"),
    cli(incident(), "--chip", "CONDUCT #9", "--bogus"),
    cli({ sessions: incident(), tasks: "none" }, "--chip", "CONDUCT #9"),
  ];
  t("every usage error exits 2 with a USAGE line and no verdict",
    usage.map((r) => [r.status, /^occupancy: USAGE — /m.test(r.stdout), /occupancy: (ADMIT|REFUSE|UNDETERMINED)/.test(r.stdout)]),
    usage.map(() => [EXIT.USAGE, true, false]));
  const INTEGRATOR = task("integrator", "BIO integrator lane", "Starts the integrator from its handoff.");
  const hidden = { sessions: [listed({ id: ID.x, title: "BIO integrator lane", running: true })], tasks: [INTEGRATOR],
                   runs: { integrator: [run(ID.x, "BIO integrator lane")] } };
  const c4 = cli(hidden, "--chip", "CONDUCT #12", "--limit", "200");
  t("a task whose title does not name the lane is not its task unless DECLARED, and its runs are named as ignored",
    [c4.status, c4.stdout.includes("NOTE — runs were passed for task integrator, which is not this lane's — ignored")],
    [EXIT.ADMIT, true]);
  const c5 = cli(hidden, "--chip", "CONDUCT #12", "--limit", "200", "--task", "integrator");
  t("...and DECLARED with --task, its live run REFUSES at an instance nobody can read",
    [c5.status, c5.stdout.includes(`OCCUPANT  BIO integrator lane [${ID.x}] — bound by a run of task integrator; instance UNREADABLE`)],
    [EXIT.REFUSE, true]);
}

/* ========================================================================== */
section("9 — ONE READING OF A LANE TITLE: retirable's laneOf, imported, on the estate's own title shapes");
{
  const src = readFileSync(CLI, "utf8");
  t("the lane reading is IMPORTED from tools/retirable.mjs, never re-implemented",
    [/import \{ laneOf, instanceOf \} from "\.\/retirable\.mjs";/.test(src), /LANE_TITLE/.test(src)], [true, false]);
  const shapes = { "CONDUCT #8 (BIO) — integrator lane": "CONDUCT", "CONDUCT heartbeat (BIO)": "CONDUCT HEARTBEAT (BIO)",
                   "BOB's notes #3": "BOB'S NOTES #3", "SCHEDULER #10": "SCHEDULER", "Conduct #12": "CONDUCT",
                   "[BIO] CONDUCT #12": "[BIO] CONDUCT #12" };
  t("laneKey reads the estate's title shapes as retirable does, upper-cased — the prefixed one is the stated blind spot",
    Object.keys(shapes).map((k) => laneKey(k)), Object.values(shapes));
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`occupancy: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
