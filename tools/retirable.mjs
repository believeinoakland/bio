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
 * ------------------------------------------ M0-83 (BOB #23, 2026-09-21): FOUR DEFECTS, ONE JUDGEMENT
 *
 * Each was found by a lane acting on this tool's verdict, and each moved a count in the direction
 * a reader takes as SAFE — which is why they are one row, one suite, one gate.
 *
 *   (1) `laneOf` stripped only a TRAILING `#<n>`, so `CONDUCT #8 (BIO) — integrator lane` was in no
 *       lane, its predecessor was elected newest, and the live holder was judged RETIRABLE (BOB #19).
 *       It now takes the word before `#<n>` wherever the number sits.
 *   (2) `list_sessions` EXCLUDES ITS CALLER, so a `--self` FOUND among the rows is proof the id is
 *       somebody else's. It was accepted, that stranger was PROTECTED as "this session", and the
 *       estate read `1 retirable … 7 judged` where it was `8 … 14` (CONDUCT #8, 2026-09-20). It is now
 *       REFUSED, `UNKNOWN-SELF`, before anything is judged, and no verdict is printed.
 *   (3) THE CALLER IS NEVER IN ITS OWN LISTING, so it could never be its lane's newest: its
 *       predecessor was PROTECTED as the lane's "live holder", a reason nobody could check. A caller
 *       may now DECLARE its title (`--self-title`) and then stands in its lane's election. The
 *       election ranks by INSTANCE NUMBER first and activity second, so a declared caller never
 *       displaces a listed SUCCESSOR (a higher `#<n>`), and the CLI says so when one outranks it —
 *       the stale-predecessor case `kickoffs/BOB.md` rule 4 exists for.
 *   (4) Fed the account's whole listing it judged OTHER REPOSITORIES against this one's remotes: 24
 *       Supervisor sessions RETIRABLE, 15 Alpha-Pipeline sessions HOLD (BOB #21). Only a session
 *       whose `cwd` is inside this repository — the primary checkout or any worktree git lists for it
 *       — is judged now; the rest are OUT OF SCOPE, counted, and never RETIRABLE, HOLD or PROTECTED.
 *       **Containment is by PATH SEGMENTS on the canonical path, never a string prefix**: a sibling
 *       `…/ClaudeCodeBIO-other` shares the prefix and is another directory. A cwd that no longer
 *       exists is placed by its deepest existing ancestor: inside this checkout it is this
 *       repository's own debris (a removed worktree) and is judged — it holds nothing, so it is
 *       RETIRABLE — and outside it is out of scope. (BOB #23's refinement of item (4)'s "a vanished cwd
 *       out of scope", which named the Supervisor sessions' vanished directories; leaving this
 *       repository's own vanished rows unjudged would re-grow D-401's population.)
 *
 * NEGATIVE CONTROL: `node bio-plane/test/retirable.control.mjs` from the repo root.
 */

import { git, carriedBy, remoteHeads, worktrees, ROOT } from "./strandedwork.mjs";
import { existsSync, realpathSync } from "node:fs";
import { resolve, dirname, basename, join, relative, isAbsolute, sep } from "node:path";

/* The lanes whose NEWEST session is kept alive however long it idles. Retiring one stops work
   rather than releasing a resource, so the sweep never does it — a successor retires it, and for
   DIST and FLEET only when the session's context is too full (Bob, 2026-09-18). */
export const STANDING_LANES = ["CONDUCT", "BOB", "DIST", "FLEET", "SCHEDULER"];

/* A run-session of a scheduled task. It holds no worktree and carries nothing forward, so it is
   retirable the moment it is not running. This is the highest-VOLUME producer by far and the one
   D-401 missed entirely. */
export const isTaskRun = (s) => /heartbeat/i.test(s.title || "");

/* "CONDUCT #2" -> "CONDUCT"; "CONDUCT #8 (BIO) — integrator lane" -> "CONDUCT"; "BOB" -> "BOB". The lane,
   not the instance. M0-83 (1): the word before `#<n>` WHEREVER the number sits; a title with no `#<n>` is
   its own name, trimmed. */
const LANE_TITLE = /^\s*([A-Za-z][A-Za-z-]*)\s*#(\d+)/;
export const laneOf = (s) => { const m = LANE_TITLE.exec(s.title || ""); return m ? m[1] : (s.title || "").trim(); };
/* The instance number, or null. M0-83 (3): it ORDERS a lane — `#11` succeeds `#10` whatever either did last. */
export const instanceOf = (s) => { const m = LANE_TITLE.exec(s.title || ""); return m ? Number(m[2]) : null; };

/* M0-83 (2): the refusal, a type so a library caller cannot mistake it for a verdict. */
export class UnknownSelf extends Error {
  constructor(selfId, title) {
    super(`UNKNOWN-SELF — the --self id ${selfId} is IN the listing (as '${title}')`);
    this.code = "UNKNOWN_SELF"; this.selfId = selfId; this.title = title;
  }
}

/* M0-83 (4): WHERE A PATH IS. The canonical form of a path that may no longer exist: its deepest existing
   ancestor's realpath, with the missing tail re-joined — so `/tmp` and `/private/tmp` compare as one
   directory, and a removed worktree is still placed where it was. */
export function canonicalPath(p) {
  let head = resolve(String(p)); const tail = [];
  while (!existsSync(head)) { const up = dirname(head); if (up === head) break; tail.unshift(basename(head)); head = up; }
  let real = head;
  try { real = realpathSync.native(head); } catch { /* unreadable ancestor: keep the resolved form */ }
  return tail.length ? join(real, ...tail) : real;
}
/* By PATH SEGMENTS, never a string prefix: `relative` walks segments, so a sibling sharing the prefix is
   `../<sibling>`, outside. */
export function isInside(root, p) {
  const rel = relative(root, p);
  return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(".." + sep));
}
/* This repository's roots: every worktree git lists for it, the primary checkout first. Null when git
   cannot list them — and then nothing can be placed, which the verdict says rather than guesses. */
export function scopeOf({ repo = ROOT } = {}) {
  const w = worktrees({ repo });
  if (w.failed || !w.units.length) return null;
  const roots = w.units.map((u) => canonicalPath(u.path));
  const primary = w.units.find((u) => u.primary);
  return { primary: primary ? canonicalPath(primary.path) : roots[0], roots };
}
export function placeOf(cwd, scope) {
  if (!cwd) return "out";
  if (!scope) return "unknown";
  const p = canonicalPath(cwd);
  return scope.roots.some((r) => isInside(r, p)) ? "in" : "out";
}

/* The holder of each standing lane: the highest instance number, then the latest activity. Computed over
   the IN-SCOPE rows alone (another repository's `CONDUCT #99` holds nothing here), plus the caller when it
   DECLARES its title (M0-83 (3)) — ranked as active NOW, so it wins a tie on its own number and loses to a
   listed successor. Exported so the CLI can say when a declared caller is NOT its lane's holder. */
export const SELF_KEY = "<self>";
export function electHolders(rows, { selfId = null, selfTitle = null, now = Date.now() } = {}) {
  const outranks = (a, b) => (a[0] !== b[0] ? a[0] > b[0] : a[1] > b[1]);
  const holders = new Map();
  const consider = (lane, id, rank, title) => {
    const cur = holders.get(lane);
    if (!cur || outranks(rank, cur.rank)) holders.set(lane, { id, rank, title });
  };
  for (const s of rows) {
    const lane = laneOf(s);
    if (!STANDING_LANES.includes(lane) || isTaskRun(s)) continue;
    const n = instanceOf(s);
    consider(lane, s.sessionId, [n === null ? -Infinity : n, Date.parse(s.lastActivityAt || 0) || 0], s.title);
  }
  if (selfTitle) {
    const lane = laneOf({ title: selfTitle });
    const n = instanceOf({ title: selfTitle });
    if (STANDING_LANES.includes(lane))
      consider(lane, selfId || SELF_KEY, [n === null ? -Infinity : n, Math.max(now, Date.now()) + 1], selfTitle);
  }
  return holders;
}

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
  selfId = null, selfTitle = null, now = Date.now(), idleHours = DEFAULT_IDLE_HOURS,
  repo = ROOT, remoteMap = null, treeReader = treeState, scope = undefined,
} = {}) {
  /* M0-83 (2): REFUSED BEFORE ANYTHING IS READ. `list_sessions` excludes its caller, so this row is
     somebody else's, and every verdict below would stand on a false identity. */
  const found = selfId ? sessions.find((s) => s.sessionId === selfId) : null;
  if (found) throw new UnknownSelf(selfId, found.title || "");

  const where = scope === undefined ? scopeOf({ repo }) : scope;
  const placeOfRow = new Map(sessions.map((s) => [s, placeOf(s.cwd, where)]));
  const map = remoteMap || remoteHeads({ repo }).map;

  /* The holder of each standing lane — a property of the SET, so computed before any verdict, over
     this repository's rows only (M0-83 (3), (4)). */
  const newestOfLane = electHolders(sessions.filter((s) => placeOfRow.get(s) === "in"),
                                    { selfId, selfTitle, now });

  return sessions.map((s) => {
    const lane = laneOf(s);
    const idleMs = now - (Date.parse(s.lastActivityAt || 0) || 0);
    const idleH = idleMs / 3_600_000;
    const verdict = (v, reason, extra = {}) =>
      ({ sessionId: s.sessionId, title: s.title, cwd: s.cwd || null, lane,
         idleHours: +idleH.toFixed(2), verdict: v, reason, ...extra });

    const place = placeOfRow.get(s);
    if (place === "out")
      return verdict("OUT_OF_SCOPE", `its cwd is not in this repository${where ? ` (${where.primary})` : ""} — `
        + "another repository's session, or none; not judged, never retirable from here (M0-83)");
    if (place === "unknown")
      return verdict("HOLD", "this repository's worktrees could NOT BE LISTED, so whether this session is "
        + "its own is UNDETERMINED — not judged");
    if (s.isRunning) return verdict("PROTECTED", "running");
    if (s.isArchived) return verdict("PROTECTED", "already archived");

    /* Standing lanes: only a PREDECESSOR is ever a candidate. */
    const newest = newestOfLane.get(lane);
    if (STANDING_LANES.includes(lane) && !isTaskRun(s) && newest && newest.id === s.sessionId)
      return verdict("PROTECTED",
        `live holder of the ${lane} lane — an idle standing lane is normal, and retiring it stops `
        + `work rather than releasing a resource; its successor chip retires it (D-401)`
        + (selfTitle ? "" : " — the newest LISTED: a caller is never in its own listing, so a lane's "
          + "holder sweeping must pass --self-title (M0-83)"));

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
           outOfScope: by("OUT_OF_SCOPE"),
           counts: { retirable: by("RETIRABLE").length, hold: by("HOLD").length,
                     protected: by("PROTECTED").length, outOfScope: by("OUT_OF_SCOPE").length,
                     judged: rows.length - by("OUT_OF_SCOPE").length, total: rows.length } };
}

/* A VERDICT IS BOUNDED BY ITS INPUT, AND UNTIL 2026-09-20 THIS TOOL DID NOT SAY SO.
 *
 * `total` counts the rows it was HANDED, and the summary read `N judged` as though N were the
 * estate. It is not: this tool reads a listing on stdin and cannot see what the caller's listing
 * left out. **MEASURED BY THE conduct-heartbeat ACROSS FOUR CONSECUTIVE RUNS, 2026-09-20**: the
 * watchdog called this predicate with `list_sessions` fixed at limit 50 while the estate held 53
 * sessions and grew ~3/hour from the heartbeat's own finished run-sessions. Each new row arrived
 * at the TOP of the listing and pushed the oldest off the BOTTOM — and the bottom is exactly where
 * D-288's stranded work lives. The true HOLD count was 15 and did not move; the REPORTED count
 * fell 15 -> 14 -> 13 -> 12. **The number fell in the direction a reader reads as progress**, and
 * three Ticker sessions holding commits on no remote went invisible on schedule.
 *
 * This is `CLAUDE.md` §5's rule from the inside — *when the answer is a count, ask what the count
 * cannot see* — and the answer here is: everything the caller did not pass. So the tool now says
 * that on every run, and says it LOUDLY when it can prove a gap:
 *   - `--total N` lets a caller that knows the estate size declare it. N > judged is a REFUSAL to
 *     read the verdict as estate-wide, naming the shortfall.
 *   - With no `--total`, an input length equal to a common listing limit is a HINT and is labelled
 *     one — it is evidence of truncation, never proof, and a tool that cannot tell them apart must
 *     not pretend otherwise (the same discipline `plancheck`'s delegation-cohort arm states).
 * The bound line prints even when nothing is wrong, because a caveat that appears only on bad runs
 * trains a reader to skip it. */
const LISTING_LIMITS = new Set([10, 20, 25, 40, 50, 100]);

if (process.argv[1] && process.argv[1].endsWith("retirable.mjs")) {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const raw = chunks.join("").trim();
  if (!raw) { console.error("retirable: no session JSON on stdin"); process.exit(2); }
  const selfArg = process.argv.indexOf("--self");
  const selfTitleArg = process.argv.indexOf("--self-title");
  const totalArg = process.argv.indexOf("--total");
  const declaredTotal = totalArg > -1 ? Number(process.argv[totalArg + 1]) : null;
  const selfId = selfArg > -1 ? process.argv[selfArg + 1] : null;
  const selfTitle = selfTitleArg > -1 ? process.argv[selfTitleArg + 1] : null;
  const sessions = JSON.parse(raw);
  let rows;
  try {
    rows = classify(sessions, { selfId, selfTitle });
  } catch (e) {
    if (!(e instanceof UnknownSelf)) throw e;
    console.log(`${e.message}. \`list_sessions\` EXCLUDES its caller, so this id is SOMEBODY ELSE'S.`);
    console.log("  No verdict is given: every row would be judged on a false identity, and CONDUCT #8 read");
    console.log("  '1 retirable … 7 judged' this way where the estate held 8 … 14 (2026-09-20). Re-run with your");
    console.log("  OWN session id (get_session \"self\") over list_sessions' output, verbatim.");
    process.exit(3);
  }
  const s = summarise(rows);
  for (const v of ["HOLD", "RETIRABLE", "PROTECTED"]) {
    const list = rows.filter((r) => r.verdict === v);
    if (!list.length) continue;
    console.log(`\n${v} — ${list.length}`);
    for (const r of list) console.log(`  ${r.title} [${r.sessionId.slice(0, 12)}] — ${r.reason}`);
  }
  if (s.counts.outOfScope)
    console.log(`\nOUT OF SCOPE — ${s.counts.outOfScope} session(s) whose cwd is not in this repository: not `
      + "judged, and never retirable from here (M0-83).");
  if (selfTitle) {
    const lane = laneOf({ title: selfTitle });
    const holder = STANDING_LANES.includes(lane)
      ? electHolders(sessions.filter((x) => rows.find((r) => r.sessionId === x.sessionId)?.verdict !== "OUT_OF_SCOPE"),
                     { selfId, selfTitle }).get(lane) : null;
    if (holder && holder.id !== (selfId || SELF_KEY))
      console.log(`\nNOT THIS LANE'S HOLDER — you declared '${selfTitle}', and '${holder.title}' outranks it: a `
        + "successor exists, so stand down rather than sweep (kickoffs/BOB.md rule 4).");
  }
  const judged = s.counts.judged;
  const passed = s.counts.total;
  console.log(`\nretirable: ${s.counts.retirable} retirable, ${s.counts.hold} HOLDING UNSAVED WORK, `
    + `${s.counts.protected} protected, ${judged} judged, ${s.counts.outOfScope} out of scope`);

  if (Number.isFinite(declaredTotal) && declaredTotal > passed) {
    const missed = declaredTotal - passed;
    console.log(`\nNOT JUDGED — ${missed} of ${declaredTotal} session(s) were NOT PASSED TO THIS TOOL.`);
    console.log(`  This verdict covers ${passed} and says NOTHING about the other ${missed}. A row`);
    console.log(`  holding unsaved work is invisible here if the caller's listing left it out, and a`);
    console.log(`  truncated listing drops its OLDEST rows first — which is where stranded work lives.`);
    console.log(`  Re-run with an exhaustive listing before treating any count above as estate-wide.`);
  } else if (declaredTotal === null && LISTING_LIMITS.has(passed)) {
    console.log(`\nHINT, NOT A FINDING — the input was exactly ${passed} rows, a common listing limit.`);
    console.log(`  That is consistent with a TRUNCATED listing and equally consistent with an estate`);
    console.log(`  of exactly ${passed}; this tool cannot tell them apart and does not guess. Pass`);
    console.log(`  --total <estate size> to make the difference checkable.`);
  } else {
    console.log(`  BOUND: this verdict covers the ${passed} session(s) passed in and no others.`);
  }
}
