/* occupancy — is a lane already held? Asked BEFORE a chip is filed for it.
 *
 * M0-81, enacting BOB #18's ruling in `docs/development/kickoffs/BOB.md` "Spawning and retiring lanes" — rule 1,
 * OCCUPANCY, and the sentence after the rules: a stood-down, duplicate or retired session RELEASES the lane name.
 * The design is admitted for M0 by name in `docs/development/VERIFICATION.md`.
 *
 * THE INCIDENT, AND IT COST A REAL MESSAGE. On 2026-09-19 BOB #17 filed a `CONDUCT #8` chip 6m35s after the
 * scheduled task `conduct-8` had already stood CONDUCT #8 up. The chip passed both tests a chip then had — its
 * handoff NAMED the successor, and was five minutes old — and made a DUPLICATE LANE. The duplicate held the name in
 * the peer directory; SCHEDULER #3's three clustering instructions reached it instead of the live integrator, and
 * every send returned `success: true` (M-74). Addressing and currency are properties of a DOCUMENT. Occupancy is a
 * property of the ESTATE, and until this file nothing in the repository asked it.
 *
 * WHY A PURE FUNCTION IN THE REPOSITORY — `tools/retirable.mjs` is the precedent. Session state lives in the
 * HARNESS, which no suite can reach, so the JUDGEMENT lives here, where a suite drives it from a fixture, and the
 * ACT — reading the listing, filing the chip — stays with the caller. This file reads what the harness PRINTED and
 * never calls it.
 *
 * ------------------------------------------------------------------------------------------- THE THREE VERDICTS
 *
 *   REFUSE        a live session already holds the lane at this chip's instance or above, or at one nobody can
 *                 read. Every occupant is NAMED, with its full session id. Do not file. (exit 1)
 *   ADMIT         no live session holds it, and the input could have shown one if it existed. (exit 0)
 *   UNDETERMINED  nothing holds it IN WHAT WAS PASSED, but what was passed could not have shown every holder;
 *                 each gap is named with the one call that closes it. Do not file on it. (exit 3)
 *
 * UNDETERMINED IS NOT A POLITE ADMIT, and it is kept apart on purpose: an ADMIT is a claim about the estate, and a
 * verdict that claims more than its input supports is the defect this project rates worst. An occupant found always
 * REFUSES, whatever else is missing — one holder is enough to know the answer.
 *
 * ------------------------------------------------------------------ WHAT "HOLDS THE LANE" MEANS, AND ITS EVIDENCE
 *
 * BOB.md rule 1: bound means *its `scheduledTaskId` is the lane's task id, or its title names the lane*.
 *
 *   BY TITLE — `laneOf` and `instanceOf` are IMPORTED from `tools/retirable.mjs`, never re-implemented, so the
 *     estate reads a lane title ONE way (M0-83 widened it: `CONDUCT #8 (BIO) — integrator lane` is CONDUCT). The
 *     comparison ignores case. A heartbeat run-session titled `CONDUCT heartbeat (BIO)` names no instance, so it is
 *     not the CONDUCT lane — exactly as `retirable` reads it.
 *   BY SCHEDULED TASK — a lane's tasks are the tasks whose OWN TITLE names the lane by that same reading
 *     (`conduct-8` is titled `CONDUCT #8 (BIO) — integrator lane`; `conduct-heartbeat` is titled `CONDUCT heartbeat
 *     (BIO)` and is not the lane's), plus any the caller DECLARES with `--task`. A session is bound to one when its
 *     `scheduledTaskId` is that task's id, or when it is one of that task's runs.
 *
 * **`list_sessions` DOES NOT PRINT `scheduledTaskId` — MEASURED 2026-09-21, and it is the gap this file was built
 * around (M-93).** `get_session` prints it, and only for a session a task started; a record from it also carries
 * `createdAt`, which a `list_sessions` row does not. So a raw listing can prove a binding BY TITLE and never
 * DISPROVE one by task. The task half is evidenced two ways, either sufficient for a given task: the task's runs
 * (`list_task_runs`, one call per lane task — the cheap route), or a `get_session` record for every live row. With
 * neither, the verdict is UNDETERMINED rather than a title-only ADMIT — and a title-only matcher is exactly how a
 * liar passes this judgement: a session a task stood up under ANOTHER title (M0-81's row).
 *
 * --------------------------------------------- THE ONE READING THIS JUDGEMENT HAD TO MAKE (a DESIGN GAP, reported)
 *
 * Rule 1 reads *do not file if a LIVE session is already bound to the lane*. Read literally it refuses EVERY
 * successor chip: a saturating session asks for its successor while it is live, and the successor archives it
 * after starting (*"A stand-down is not a retirement … its successor archives it"*, the same section; D-398). What
 * rule 1's incident was is a chip filed for the instance that ALREADY existed. So, for a chip titled `<LANE> #<n>`:
 * the lane is held by a live session bound to it at instance n or ABOVE (a duplicate, or a successor already up —
 * the chip is stale), or at an instance nobody can read. A live session bound to it BELOW n is the PREDECESSOR the
 * chip exists to replace: NAMED as such, never refused. A binding's instance is the highest number any of its
 * evidence reads — its own title, its task's title, its run's title — so disagreeing evidence errs toward REFUSE.
 *
 * ------------------------------------------------------- RELEASE: ONLY AN ARCHIVE LEAVES THE LIVE SET (BOB #18)
 *
 * Live means not archived, running or idle alike: an idle unarchived session still holds its name in the peer
 * directory, which is the misroute condition itself. A session RELEASES the lane by being ARCHIVED — the release
 * mechanism BOB.md rule 3 rules, because a rename is not a release (the CONDUCT #8 duplicate's title was found back
 * at the lane name hours after it renamed itself, with no session having changed it). So a refusal's remedy for a
 * stood-down or duplicate occupant is RETIRE, never rename; and an archived session, however it is titled, holds
 * nothing and is listed as RELEASED.
 *
 * ---------------------------------------------------------------------------- THE VERDICT IS BOUNDED BY ITS INPUT
 *
 * An ADMIT needs all three: (1) a listing SHOWN COMPLETE — the caller declares the limit it gave `list_sessions`
 * and fewer rows came back, because `list_sessions` keeps the MOST RECENTLY ACTIVE rows (its default is 20) and an
 * idle lane holder, overtaken by three heartbeat run-sessions an hour, is the first row to fall off; (2) the
 * scheduled-task listing, so the lane's tasks are KNOWN (an empty one is a finding: no task can bind the lane);
 * (3) for each lane task, its runs (not cut at `list_task_runs`' default 10 or maximum 50) or every live row's own
 * `get_session` record.
 *
 * WHAT IT CANNOT SEE, stated rather than left to be found:
 *   - A title naming the lane in a form `laneOf` does not read (a word before the lane, or no `#<n>` after it) is
 *     not bound by title. Such a live row is PRINTED under MENTIONS whenever the lane's word appears in it, with the
 *     task whose title it carries; one that carries `<LANE> #<m>` at or above the chip's number makes the verdict
 *     UNDETERMINED, never ADMIT. BOB.md's exact chip title and the task half are what close the rest.
 *   - A task whose title does not name the lane is its task only when declared (`--task`).
 *   - One instant: a session started after the listing was read. Re-run immediately before filing — the incident's
 *     window was six minutes.
 *   - Whether an occupant can HEAR a message (rule 2, reachability). Occupancy only.
 *   - Another repository's session titled with this lane REFUSES too, with its cwd printed: whether two
 *     repositories share one peer directory is UNDETERMINED here, and refusing is the safe reading of that.
 *
 * NEVER TOUCHED FROM HERE: the `conduct-8` scheduled task's definition lives OUTSIDE this repository and is the
 * operator's. It is named, as the incident's task, and never changed.
 *
 *   node tools/occupancy.mjs --chip "CONDUCT #12" --limit 200 [--task <id>]... < listing.json
 *
 * stdin: `list_sessions`' JSON array as printed, or `{ "sessions": [...], "tasks": [...list_scheduled_tasks...],
 * "runs": { "<taskId>": [...list_task_runs...] } }`. Exit 0 ADMIT, 1 REFUSE, 3 UNDETERMINED, 2 a usage error.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/occupancy.control.mjs` from the repo root; the suite is
 * `bio-plane/test/occupancy.test.mjs`.
 */

import { laneOf, instanceOf } from "./retirable.mjs";

export const ADMIT = "ADMIT", REFUSE = "REFUSE", UNDETERMINED = "UNDETERMINED";
export const EXIT = Object.freeze({ ADMIT: 0, REFUSE: 1, UNDETERMINED: 3, USAGE: 2 });

/* `list_task_runs`' schema says default 10, maximum 50 — a vendor's claim, labelled as theirs. A runs list exactly
   that long may have been cut, so it is not evidence that no older run is live. */
export const RUN_LIMITS = new Set([10, 50]);

/* A usage error is its own type, so a library caller cannot mistake it for a verdict. */
export class UsageError extends Error {
  constructor(message) { super(message); this.code = "OCCUPANCY_USAGE"; }
}

const str = (v) => (typeof v === "string" ? v : "");
/* The lane a title names, for comparison: `retirable`'s reading, upper-cased. */
export const laneKey = (title) => laneOf({ title: str(title) }).toUpperCase();
const numberIn = (title) => instanceOf({ title: str(title) });
const isLive = (archived) => archived !== true;
const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
/* Was this row's task linkage READ? `get_session` prints `scheduledTaskId` only when a task started the session,
   and carries `createdAt`; `list_sessions` prints neither (M-93). An explicit null is a caller saying "read, none". */
export const linkageRead = (s) => typeof s.scheduledTaskId === "string" || s.scheduledTaskId === null
  || Object.hasOwn(s, "createdAt");
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function judge({ chip, sessions, limit = null, tasks = null, runs = null, taskIds = [] } = {}) {
  const lane = laneKey(chip);
  const n = numberIn(chip);
  if (!str(chip).trim() || n === null)
    throw new UsageError(`the chip '${str(chip)}' is not titled <LANE> #<n> (kickoffs/BOB.md) — its number is what `
      + "tells the predecessor it replaces from a duplicate of a session already up");
  if (!Array.isArray(sessions)) throw new UsageError("sessions must be an array: list_sessions' output, as printed");
  if (tasks !== null && !Array.isArray(tasks)) throw new UsageError("tasks must be list_scheduled_tasks' array");
  if (runs !== null && !isObject(runs)) throw new UsageError("runs must be an object: { \"<taskId>\": list_task_runs' array }");

  /* ---- the lane's scheduled tasks: those whose OWN title names the lane, plus any declared */
  const listedTasks = (tasks || []).filter((t) => isObject(t) && typeof t.taskId === "string");
  const taskById = new Map(listedTasks.map((t) => [t.taskId, t]));
  const laneTasks = new Map();
  for (const t of listedTasks)
    if (laneKey(t.title) === lane)
      laneTasks.set(t.taskId, { taskId: t.taskId, title: t.title, instance: numberIn(t.title),
                                enabled: t.enabled ?? null, source: "the task listing" });
  const notes = [];
  for (const id of taskIds) {
    if (laneTasks.has(id)) continue;
    const t = taskById.get(id);
    if (tasks !== null && !t) notes.push(`declared task ${id} is not in the task listing passed`);
    laneTasks.set(id, { taskId: id, title: t ? t.title ?? null : null, instance: null,
                        enabled: t ? t.enabled ?? null : null, source: "declared (--task)" });
  }

  /* ---- every piece of evidence about a session: is it live, and is it bound to the lane, at which instance */
  const unreadable = sessions.filter((s) => !isObject(s)).length;
  const rows = sessions.filter(isObject);
  const evidence = new Map();
  const evidenceFor = (id, seen) => {
    if (!evidence.has(id)) evidence.set(id, { sessionId: id, title: null, cwd: null, running: false,
                                              lastActivityAt: null, live: false, bindings: [], instances: [] });
    const e = evidence.get(id);
    for (const k of ["title", "cwd", "lastActivityAt"]) if (e[k] === null && seen[k] != null) e[k] = seen[k];
    return e;
  };
  rows.forEach((s, i) => {
    const e = evidenceFor(typeof s.sessionId === "string" ? s.sessionId : `(row ${i + 1}, no sessionId)`,
                          { title: s.title, cwd: s.cwd, lastActivityAt: s.lastActivityAt });
    if (isLive(s.isArchived)) e.live = true;
    if (s.isRunning === true) e.running = true;
    if (laneKey(s.title) === lane) { e.bindings.push(`title '${s.title}'`); e.instances.push(numberIn(s.title)); }
    if (typeof s.scheduledTaskId === "string" && laneTasks.has(s.scheduledTaskId)) {
      e.bindings.push(`scheduledTaskId ${s.scheduledTaskId}`);
      e.instances.push(laneTasks.get(s.scheduledTaskId).instance);
    }
  });
  const runsRead = new Map();
  for (const [taskId, list] of Object.entries(runs || {})) {
    if (!laneTasks.has(taskId)) { notes.push(`runs were passed for task ${taskId}, which is not this lane's — ignored`); continue; }
    if (!Array.isArray(list)) throw new UsageError(`runs["${taskId}"] must be list_task_runs' array`);
    runsRead.set(taskId, list.length);
    for (const r of list.filter(isObject)) {
      if (typeof r.session_id !== "string") continue;
      const e = evidenceFor(r.session_id, { title: r.title, lastActivityAt: r.last_activity_at });
      if (isLive(r.archived)) e.live = true;
      if (r.status === "running") e.running = true;
      e.bindings.push(`a run of task ${taskId}`);
      e.instances.push(laneKey(r.title) === lane ? numberIn(r.title) : laneTasks.get(taskId).instance);
    }
  }

  /* ---- occupant, predecessor, or released */
  const occupants = [], predecessors = [], released = [];
  for (const e of evidence.values()) {
    if (!e.bindings.length) continue;
    const known = e.instances.filter((x) => Number.isInteger(x));
    const row = { sessionId: e.sessionId, title: e.title, cwd: e.cwd, running: e.running,
                  lastActivityAt: e.lastActivityAt, bindings: [...new Set(e.bindings)],
                  instance: known.length ? Math.max(...known) : null };
    if (!e.live) released.push(row);
    else if (row.instance === null || row.instance >= n) occupants.push(row);
    else predecessors.push(row);
  }

  /* ---- what it could not classify: live rows naming the lane's word that no binding placed in the lane */
  const word = new RegExp(`(^|[^A-Za-z0-9-])${escapeRe(lane)}([^A-Za-z0-9-]|$)`, "i");
  const numbered = new RegExp(`(^|[^A-Za-z0-9-])${escapeRe(lane)}\\s*#(\\d+)`, "i");
  const mentionOf = new Map();
  for (const e of evidence.values())
    if (e.live && !e.bindings.length && word.test(str(e.title)))
      mentionOf.set(e.title, (mentionOf.get(e.title) || 0) + 1);
  const mentions = [...mentionOf].map(([title, count]) => {
    const t = listedTasks.find((x) => str(x.title) === title);
    const m = numbered.exec(title);
    return { title, count, taskId: t ? t.taskId : null, shadows: !!m && Number(m[2]) >= n };
  });
  const taskMentions = listedTasks.filter((t) => !laneTasks.has(t.taskId)
    && (word.test(str(t.title)) || word.test(str(t.description)))).map((t) => t.taskId);

  /* ---- what the input could not have shown */
  const missing = [];
  if (unreadable)
    missing.push({ gap: `${unreadable} row(s) of the listing are not session objects, and one of them could be the holder`,
                   remedy: "pass list_sessions' output verbatim" });
  if (!(Number.isInteger(limit) && limit > 0))
    missing.push({ gap: "the listing's limit was not declared, so a truncated listing cannot be told from a complete one",
                   remedy: "pass --limit <the limit given to list_sessions>" });
  else if (sessions.length >= limit)
    missing.push({ gap: `the listing returned ${sessions.length} row(s) at its limit ${limit}, so it may be TRUNCATED — `
                     + "list_sessions keeps the most recently active rows, and an idle lane holder is the first to fall off",
                   remedy: "re-list with a limit above the estate size, and pass that limit" });
  if (tasks === null)
    missing.push({ gap: "the scheduled-task listing was not passed, so the lane's tasks are unknown and a session a task "
                     + "stood up under ANOTHER title cannot be recognised",
                   remedy: "pass list_scheduled_tasks' output as \"tasks\"" });
  const allLinkageRead = rows.filter((s) => isLive(s.isArchived)).every(linkageRead);
  for (const t of laneTasks.values()) {
    const k = runsRead.get(t.taskId);
    if (k !== undefined && !RUN_LIMITS.has(k)) continue;      // its runs are the evidence
    if (allLinkageRead) continue;                             // every live row's own linkage was read
    if (k !== undefined)
      missing.push({ gap: `task ${t.taskId}'s runs came back ${k} long, a list_task_runs limit, so a live run older `
                       + "than these is not seen",
                     remedy: k < 50 ? `re-read list_task_runs("${t.taskId}") with limit 50`
                                    : "pass each live session's get_session record" });
    else
      missing.push({ gap: `task ${t.taskId}${t.title ? ` ('${t.title}')` : ""} binds this lane, and nothing passed says `
                       + "which sessions it stood up — list_sessions does not print scheduledTaskId",
                     remedy: `pass list_task_runs("${t.taskId}") as runs["${t.taskId}"], or each live session's get_session record` });
  }
  const shadowing = mentions.filter((m) => m.shadows);
  if (shadowing.length)
    missing.push({ gap: `${shadowing.reduce((a, m) => a + m.count, 0)} live row(s) carry '${lane} #<m>' at or above #${n} in a `
                     + `title the lane reading does not place (${shadowing.map((m) => `'${m.title}'`).join(", ")})`,
                   remedy: "read them, and retire or retitle any that is this lane's before filing" });

  const verdict = occupants.length ? REFUSE : missing.length ? UNDETERMINED : ADMIT;
  return {
    verdict, chip: { title: chip, lane, instance: n },
    occupants, predecessors, released, mentions, taskMentions, missing, notes,
    laneTasks: [...laneTasks.values()],
    counts: { rows: sessions.length, live: rows.filter((s) => isLive(s.isArchived)).length,
              tasks: tasks === null ? null : listedTasks.length, laneTasks: laneTasks.size,
              runsRead: Object.fromEntries(runsRead) },
    limit: Number.isInteger(limit) ? limit : null,
  };
}

/* stdin as the harness printed it: `list_sessions`' array, or the object form carrying the task listing and runs. */
export function parseListing(raw) {
  let data;
  try { data = JSON.parse(raw); } catch (e) { throw new UsageError(`stdin is not JSON: ${e.message}`); }
  if (Array.isArray(data)) return { sessions: data, tasks: null, runs: null };
  if (isObject(data) && Array.isArray(data.sessions))
    return { sessions: data.sessions, tasks: data.tasks === undefined ? null : data.tasks,
             runs: data.runs === undefined ? null : data.runs };
  throw new UsageError("stdin must be list_sessions' JSON array, or an object { sessions, tasks?, runs? }");
}

const who = (r) => `${r.title ?? "(untitled)"} [${r.sessionId}]`;
const how = (r) => `bound by ${r.bindings.join(" and ")}; instance ${r.instance ?? "UNREADABLE"}; `
  + `${r.running ? "running" : "idle"}${r.lastActivityAt ? `, last active ${r.lastActivityAt}` : ""}; cwd ${r.cwd ?? "(none)"}`;

export function render(res) {
  const L = [], { chip } = res;
  for (const r of res.occupants)
    L.push(`OCCUPANT  ${who(r)} — ${how(r)} — ${r.instance === null
      ? "no instance can be read, so it cannot be shown to be a predecessor"
      : r.instance > chip.instance ? "a SUCCESSOR is already up, so this chip is stale" : "the same instance: a DUPLICATE"}`);
  if (res.occupants.length)
    L.push("  Do not file. A duplicate lane takes messages that return success (kickoffs/BOB.md rule 3). If an occupant is a",
           "  stood-down or duplicate session, RETIRE it (archive it) — a rename is not a release and can silently revert —",
           "  then list again and re-run.");
  for (const r of res.predecessors)
    L.push(`PREDECESSOR  ${who(r)} — ${how(r)} — below #${chip.instance}: the session this chip replaces; its successor retires it`);
  for (const r of res.released)
    L.push(`RELEASED  ${who(r)} — archived, so it holds nothing (${r.bindings.join(" and ")})`);
  for (const m of res.mentions)
    L.push(`MENTIONS THE LANE, NOT READ AS HOLDING IT — ${m.count} × '${m.title}' — `
      + (m.shadows ? `it carries ${chip.lane} #<m> at or above #${chip.instance}: read it before filing`
        : m.taskId ? `the title of scheduled task ${m.taskId}, which does not name the lane` : "read it before filing"));
  if (res.taskMentions.length)
    L.push(`TASKS MENTIONING THE LANE, NOT ITS TASKS — ${res.taskMentions.join(", ")}`);
  for (const g of res.missing) L.push(`NOT SHOWN — ${g.gap}. ${g.remedy}.`);
  for (const x of res.notes) L.push(`NOTE — ${x}`);
  L.push(`LANE TASKS — ${res.laneTasks.length ? res.laneTasks.map((t) => `${t.taskId} (${t.title ? `'${t.title}', ` : ""}`
    + `instance ${t.instance ?? "unreadable"}, ${t.source}${res.counts.runsRead[t.taskId] !== undefined
      ? `, ${res.counts.runsRead[t.taskId]} run(s) read` : ""})`).join("; ")
    : res.counts.tasks === null ? "UNKNOWN (no task listing passed)" : "none: no scheduled task names this lane"}`);
  L.push(`BOUND — this verdict covers the ${res.counts.rows} session row(s) passed (${res.counts.live} live)`
    + `${res.limit ? ` under limit ${res.limit}` : ""}, ${res.counts.tasks === null ? "no task listing" : `${res.counts.tasks} scheduled task(s)`},`
    + " and one instant: a session started after this listing is not seen. Re-run immediately before filing.");
  const why = res.verdict === REFUSE ? `${res.occupants.length} live session(s) already hold it`
    : res.verdict === UNDETERMINED ? `nothing holds it in what was passed, and ${res.missing.length} gap(s) could hide a holder`
    : "no live session holds it";
  L.push(`occupancy: ${res.verdict} — ${chip.lane} #${chip.instance}: ${why}`);
  return L.join("\n");
}

function argsOf(argv) {
  const out = { chip: null, limit: null, taskIds: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], v = argv[i + 1];
    if (a === "--chip") { out.chip = v ?? null; i++; }
    else if (a === "--limit") {
      if (!/^\d+$/.test(String(v ?? ""))) throw new UsageError(`--limit wants a whole number, got '${v ?? ""}'`);
      out.limit = Number(v); i++;
    }
    else if (a === "--task") { if (!v) throw new UsageError("--task wants a task id"); out.taskIds.push(v); i++; }
    else throw new UsageError(`unknown argument '${a}'`);
  }
  if (!out.chip) throw new UsageError("--chip \"<LANE> #<n>\" is required: the title of the chip about to be filed");
  return out;
}

if (process.argv[1] && process.argv[1].endsWith("occupancy.mjs")) {
  try {
    const args = argsOf(process.argv.slice(2));
    const chunks = [];
    for await (const c of process.stdin) chunks.push(c);
    const raw = chunks.join("").trim();
    if (!raw) throw new UsageError("no JSON on stdin: pass list_sessions' output, or { sessions, tasks, runs }");
    const res = judge({ ...parseListing(raw), ...args });
    console.log(render(res));
    process.exitCode = EXIT[res.verdict];
  } catch (e) {
    if (!(e instanceof UsageError)) throw e;
    console.log(`occupancy: USAGE — ${e.message}`);
    process.exitCode = EXIT.USAGE;
  }
}
