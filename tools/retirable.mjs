/* retirable — which sessions can be cleanly retired, and which are holding work.
 *
 * RULED BY BOB 2026-09-17: *"Sessions must be cleanly retired, their work saved, resources
 * released, and the session archived every time."* Four clauses, and **the load-bearing one is
 * THEIR WORK SAVED** — it is what separates retiring a session from destroying what it did.
 *
 * WHY A PREDICATE IN THE REPOSITORY RATHER THAN A PARAGRAPH IN A KICKOFF. D-401 changed two
 * kickoffs and the population went on growing: 14 unarchived heartbeat run-sessions at 3/hour,
 * an area session idle for 21 hours still holding 635 MB. `CLAUDE.md`: *a mechanism that is not
 * in the loop the reader actually runs is not a mechanism*, and nothing executes a kickoff.
 * **Session state lives in the HARNESS, so `plancheck` cannot see it and no suite can reach it
 * — which is exactly why the JUDGEMENT is here, where a suite CAN drive it.** The ACT was first
 * given to the heartbeat and that was WRONG, measured 2026-09-18 (D-402/D-407): the heartbeat runs
 * in `auto` permission mode, `archive_session` waited there for an approval nobody was present to
 * give, and a waiting run blocks every later firing. **The heartbeat now JUDGES and carries the
 * list; CONDUCT and BOB, which run in bypass, PERFORM the act.** The caller feeds
 * this the session list and executes what it returns. Split deliberately: a predicate that
 * cannot be tested is the thing this file exists to replace.
 *
 * ------------------------------------------------------------------ THE THREE VERDICTS
 *
 *   RETIRABLE  nothing is lost by archiving it, and something is released.
 *   HOLD       it is holding WORK THAT IS NOT SAVED. Never archive; SAY WHAT IT HOLDS.
 *   PROTECTED  it is alive, or it is a lane's live holder. Not a judgement about its work.
 *
 * **HOLD AND PROTECTED ARE KEPT APART ON PURPOSE.** Collapsing them into *not retirable* would
 * hide the only case a human needs to see: a dead session holding unpushed work. That is
 * D-288's loss shape, and it must be LOUD rather than merely excluded.
 *
 * -------------------------------------------------- WHAT IS NEVER AUTO-RETIRED, AND WHY
 *
 * **THE STANDING LANES — CONDUCT, BOB, DIST, FLEET AND SCHEDULER — ARE NEVER AUTO-RETIRED AT THEIR
 * NEWEST SESSION** (SCHEDULER added the same day, when Bob created the lane), however long they have been idle. DIST and FLEET were added 2026-09-18, RULED BY BOB:
 * *"Don't archive DIST or FLEET sessions just because they've been idle for some period of time.
 * They should stay alive because they will always eventually be needed again. Only refresh them
 * if/when their context windows are too full."* The receipt: the only DIST and FLEET sessions
 * (2026-09-16) oriented, asked a question nobody was present to answer, went idle past the
 * threshold, and were archived by this sweep with the question unanswered — so no release was cut
 * for four days while four disclosure fixes sat on `main`. Idleness is their NORMAL state between
 * releases, exactly as it is CONDUCT's between waves. An idle CONDUCT is the estate's normal state between waves,
 * and a sweep that archived it would delete the integrator to reclaim a worktree — the estate's
 * throughput traded for disk, by a robot, at 3am. Their retirement runs through the successor
 * chip (D-401): a PREDECESSOR is retirable, the newest never is.
 *
 * **Everything else is judged on its state rather than its name**, which is the *population, not
 * the spelling* rule (`strandedwork.mjs`) applied one layer out: a heartbeat run-session holds no
 * worktree and can go the moment it stops running; an area session that has been idle past the
 * threshold with its work saved is holding a worktree for nothing, and restarting a lane is one
 * chip while a stranded 635 MB is permanent at 97% full.
 *
 * ------------------------------------------------------------------- WHAT MAKES THIS SAFE
 *
 * **ARCHIVING IS REVERSIBLE** (`unarchive_session`), and that asymmetry is the whole argument for
 * sweeping automatically: a wrong RETIRABLE costs one un-archive, a wrong HOLD costs a human
 * glance, and doing nothing costs the estate its disk — which is already the measured throughput
 * ceiling (D-398). **Nothing here deletes anything.**
 *
 * THE WORK-SAVED TEST IS NOT REIMPLEMENTED. It reuses `strandedwork.mjs` — the same ancestry walk
 * that answers *does this work exist anywhere but this disk*, asked by REACHABILITY across every
 * remote ref rather than by branch name (D-399). A second implementation of that question would
 * be a second thing to get wrong, and this estate has already measured what happens when two
 * producers of one quantity disagree (BOB.md rule 7).
 *
 * NEGATIVE CONTROL: `node bio-plane/test/retirable.control.mjs` from the repo root.
 */

import { git, carriedBy, remoteHeads, ROOT } from "./strandedwork.mjs";
import { existsSync } from "node:fs";

/* The lanes whose NEWEST session is kept alive however long it idles. Retiring one stops work
   rather than releasing a resource, so the sweep never does it — a successor retires it, and for
   DIST and FLEET only when the session's context is too full (Bob, 2026-09-18). */
export const STANDING_LANES = ["CONDUCT", "BOB", "DIST", "FLEET", "SCHEDULER"];

/* A run-session of a scheduled task. It holds no worktree and carries nothing forward, so it is
   retirable the moment it is not running. This is the highest-VOLUME producer by far and the one
   D-401 missed entirely. */
export const isTaskRun = (s) => /heartbeat/i.test(s.title || "");

/* "CONDUCT #2" -> "CONDUCT"; "BOB" -> "BOB". The lane, not the instance. */
export const laneOf = (s) => (s.title || "").replace(/\s*#\d+\s*$/, "").trim();

export const DEFAULT_IDLE_HOURS = 4;

/* Is this path a git worktree we can read, and what does it hold? Returns null when the session
   has no worktree at all — the ordinary case for a task run, and NOT an error. */
export function treeState(cwd, { repo = ROOT, remoteMap = null } = {}) {
  if (!cwd || !existsSync(cwd)) return null;
  const head = git(["rev-parse", "HEAD"], { repo: cwd, allowFail: true });
  if (!head) return null;
  /* A SESSION DOES NOT OWN EVERY DIRECTORY IT SITS IN, AND CONFLATING THOSE WOULD HAVE THE SWEEP
     TRY TO REMOVE THE MAIN CHECKOUT. Every scheduled-task run-session's cwd is the main checkout
     — the task tells it to read there — and it owns none of it. `git rev-parse --git-common-dir`
     equals `--git-dir` only in the PRIMARY worktree, which is git's own answer to "is this the
     main checkout" and does not depend on any path convention. Found by DRIVING this predicate
     on the real estate, not by reading it: 14 task runs came back judged on a tree none of them
     owned. */
  const gitDir = git(["rev-parse", "--absolute-git-dir"], { repo: cwd, allowFail: true });
  const commonDir = git(["rev-parse", "--path-format=absolute", "--git-common-dir"], { repo: cwd, allowFail: true });
  const isPrimary = !!gitDir && !!commonDir && gitDir === commonDir;
  const status = git(["--no-optional-locks", "status", "--porcelain"], { repo: cwd, allowFail: true });
  /* A status we could not READ is not a clean one. `null` here means the question failed, and
     concluding "clean" from it would be the unearned-absence class inside the safety check. */
  if (status === null) return { head, dirty: null, saved: null, unreadable: true,
                                isPrimary, ownsWorktree: !isPrimary };
  const dirty = status.split("\n").filter(Boolean).length;
  const mainSha = git(["rev-parse", "origin/main"], { repo, allowFail: true });
  const onMain = mainSha
    ? git(["merge-base", "--is-ancestor", head, mainSha], { repo, allowFail: true }) !== null
    : null;
  /* Saved means: merged into origin/main, OR carried by some remote ref under any name. */
  const carrier = onMain ? null : carriedBy(repo, head, remoteMap);
  const saved = onMain === null ? null : (onMain || !!carrier);
  return { head, dirty, saved, onMain, carrier, unreadable: false, isPrimary,
           ownsWorktree: !isPrimary };
}

export function classify(sessions, {
  selfId = null, now = Date.now(), idleHours = DEFAULT_IDLE_HOURS,
  repo = ROOT, remoteMap = null, treeReader = treeState,
} = {}) {
  const map = remoteMap || remoteHeads({ repo }).map;

  /* The newest session per driving lane, by last activity. Computed over ALL sessions before any
     verdict, because "newest" is a property of the set and not of a row. */
  const newestOfLane = new Map();
  for (const s of sessions) {
    const lane = laneOf(s);
    if (!STANDING_LANES.includes(lane) || isTaskRun(s)) continue;
    const t = Date.parse(s.lastActivityAt || 0) || 0;
    const cur = newestOfLane.get(lane);
    if (!cur || t > cur.t) newestOfLane.set(lane, { id: s.sessionId, t });
  }

  return sessions.map((s) => {
    const lane = laneOf(s);
    const idleMs = now - (Date.parse(s.lastActivityAt || 0) || 0);
    const idleH = idleMs / 3_600_000;
    const verdict = (v, reason, extra = {}) =>
      ({ sessionId: s.sessionId, title: s.title, cwd: s.cwd || null, lane,
         idleHours: +idleH.toFixed(2), verdict: v, reason, ...extra });

    if (selfId && s.sessionId === selfId) return verdict("PROTECTED", "this session");
    if (s.isRunning) return verdict("PROTECTED", "running");
    if (s.isArchived) return verdict("PROTECTED", "already archived");

    /* Standing lanes: only a PREDECESSOR is ever a candidate. */
    const newest = newestOfLane.get(lane);
    if (STANDING_LANES.includes(lane) && !isTaskRun(s) && newest && newest.id === s.sessionId)
      return verdict("PROTECTED",
        `live holder of the ${lane} lane — an idle standing lane is normal, and retiring it stops `
        + `work rather than releasing a resource; its successor chip retires it (D-401)`);

    /* A TASK RUN IS JUDGED BEFORE ANY TREE IS READ, because it owns no tree to judge. Its cwd
       is the main checkout it was told to read in, so reading a tree there answers a question
       about SOMEBODY ELSE'S working directory — the wrong-unit class, which this estate found
       three times on 2026-09-17 before it appeared here a fourth. It carries nothing forward and
       holds no resource, so the moment it is not running it is done. This is the highest-VOLUME
       case by far — three an hour, forever — and D-401's protocol change missed it entirely. */
    if (isTaskRun(s))
      return verdict("RETIRABLE", "scheduled-task run-session, not running — owns no worktree and "
        + "carries nothing forward", { ownsWorktree: false });

    const tree = treeReader(s.cwd, { repo, remoteMap: map });

    if (!tree) return verdict("RETIRABLE", "not running and holds no readable worktree",
                              { ownsWorktree: false });
    if (tree.unreadable)
      return verdict("HOLD", "its worktree status could NOT BE READ — unknown is not clean", { tree });
    if (tree.dirty > 0)
      return verdict("HOLD", `${tree.dirty} uncommitted change(s) — no push can reach them, and archiving would take them`, { tree });
    if (tree.saved === null)
      return verdict("HOLD", "could not resolve origin/main, so 'work saved' is UNDETERMINED", { tree });
    if (!tree.saved)
      return verdict("HOLD", `its tip ${tree.head.slice(0, 8)} is on NO remote ref — committed here and nowhere else (D-288)`, { tree });

    /* Work is saved. Now the only question is whether it is still plausibly in use. */
    if (idleH < idleHours)
      return verdict("PROTECTED", `idle only ${idleH.toFixed(1)}h (threshold ${idleHours}h) — may be mid-task between turns`, { tree });

    return verdict("RETIRABLE",
      `not running, idle ${idleH.toFixed(1)}h, tree CLEAN and tip `
      + `${tree.onMain ? "merged into origin/main" : `carried by origin/${tree.carrier?.ref}`}`
      + `${tree.isPrimary ? "; sits in the MAIN CHECKOUT — archive it, never remove that tree" : ""}`,
      { tree, ownsWorktree: tree.ownsWorktree });
  });
}

export function summarise(rows) {
  const by = (v) => rows.filter((r) => r.verdict === v);
  return { retirable: by("RETIRABLE"), hold: by("HOLD"), protected: by("PROTECTED"),
           counts: { retirable: by("RETIRABLE").length, hold: by("HOLD").length,
                     protected: by("PROTECTED").length, total: rows.length } };
}

/* CLI: sessions as JSON on stdin (the array `list_sessions` returns). Prints a verdict per row
   and a summary. The caller ARCHIVES what is RETIRABLE and reports what is on HOLD. */
if (process.argv[1] && process.argv[1].endsWith("retirable.mjs")) {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const raw = chunks.join("").trim();
  if (!raw) { console.error("retirable: no session JSON on stdin"); process.exit(2); }
  const selfArg = process.argv.indexOf("--self");
  const rows = classify(JSON.parse(raw), {
    selfId: selfArg > -1 ? process.argv[selfArg + 1] : null,
  });
  const s = summarise(rows);
  for (const v of ["HOLD", "RETIRABLE", "PROTECTED"]) {
    const list = rows.filter((r) => r.verdict === v);
    if (!list.length) continue;
    console.log(`\n${v} — ${list.length}`);
    for (const r of list) console.log(`  ${r.title} [${r.sessionId.slice(0, 12)}] — ${r.reason}`);
  }
  console.log(`\nretirable: ${s.counts.retirable} retirable, ${s.counts.hold} HOLDING UNSAVED WORK, `
    + `${s.counts.protected} protected, ${s.counts.total} judged`);
}
