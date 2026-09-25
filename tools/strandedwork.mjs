/* strandedwork — D-288's DETECTION half: work on this disk that reaches NOBODY.
 *
 * THE RULE, and it is `CLAUDE.md`'s oldest one applied at the altitude it was never applied
 * to: *a change is not made when it is written, it is made when it is COMMITTED AND PUSHED.*
 * `plancheck` section 1 enforces exactly that — for `main` and for the planning surface.
 * Nothing enforced it for a WORKER's own tree, which is where every item's work sits between
 * the worker starting and CONDUCT merging.
 *
 * WHY IT IS AN INSTRUMENT AND NOT A PRACTICE, which is this row's own history. D-288 was
 * measured 2026-08-10 — 137 local `worktree-agent-*` branches, ZERO on the remote — and then
 * sat `open` for FIVE WEEKS while nothing chased it, because `plancheck` fails an open debt
 * row with NO disposition and this one HAD one. The estate's own watchdog was satisfied for
 * the entire period the exposure was total. On 2026-09-15 it stopped being theoretical:
 * REC-91 finished, committed and released on `worktree-agent-aabecaced11e00db1`, its
 * integrator was stood down before merging, and the work reached nobody for a day — recovered
 * only because somebody went looking, on a physical machine in another location.
 * `WORKER.md`'s push step is D-288's PREVENTION half; **nothing audits prevention, which is
 * exactly the shape that failed.** This is the only thing in the estate that will ever TELL
 * anyone work is stranded.
 *
 * IT WARNS AND MUST NEVER FAIL (BOB #12, 2026-09-16, recorded on D-288). A historical local
 * branch is not a defect and the inherited ones are deliberately not retroactively pushed. A
 * gate that goes red on inherited state gets switched off, which is this estate's own
 * recorded failure mode for ratchets. Promoting this to a FAIL would delete the instrument.
 *
 * ------------------------------------------------------------ WHY THE FILE IS NOT CALLED
 * ------------------------------------------------------------ `strandedbranches`
 *
 * It was, for one commit. **The unit is the WORKTREE, not the branch, and the name was the
 * first thing the narrow reading got wrong.** A branch cannot see uncommitted work, and
 * uncommitted work is one of the three windows — the one no push can close. The rename is
 * the same lesson as the glob below: key on what a thing IS.
 *
 * ---------------------------------------------------------------- THE THREE WINDOWS
 *
 * They are reported in DIFFERENT WORDS because **the reader's next act differs in each**,
 * and a single "stranded" warning would make the reader work that out every time:
 *
 *   1. NEVER PUSHED         commits past `origin/main` that NO remote ref contains — asked by
 *                           REACHABILITY, never by the branch's name (see THE SPELLING LESSON)
 *                           -> PUSH IT. D-288's original shape.
 *   2. PUSHED, THEN BEHIND  a remote ref exists and the local HEAD is not on it
 *                           -> PUSH IT. Neither D-288 item 1 nor the spawn channel covers
 *                           this: item 1 protects a worker that pushes ONCE at the end, and
 *                           these pushed in the MIDDLE and committed after. Both of the
 *                           HEADs M-38 caught this way ended in a *release the claim* commit
 *                           — the worker's LAST act — so the loss would have been the
 *                           durable report itself.
 *   3. UNCOMMITTED          the working tree has changes
 *                           -> COMMIT FIRST; NO PUSH CAN HELP. Only a worktree has this
 *                           window, which is the whole reason the unit is the worktree.
 *
 * A worktree can be in more than one at once and is then reported in each.
 *
 * ------------------------------------------------- WHAT IS EXEMPT, AND HOW THAT WAS WRONG TWICE
 *
 * **A truly idle worktree must NOT be named.** One with nothing committed past `origin/main`
 * and nothing changed has zero exposure, and **an arm that names it is tuned out as noise
 * within a day — which makes it a check nobody reads.** That is the failure mode of every
 * alarm that cries about a healthy state, and it is the constraint that decides whether this
 * arm survives contact.
 *
 * **BUT THE EXEMPTION IS EVALUATED ON THE STATE, NEVER INFERRED FROM THE TIP, and the receipt
 * is that the first phrasing of it was wrong within the hour.** M-38 named
 * `worktree-agent-a8eea05132b9aee1d` as the canonical over-strictness row — no branch on
 * origin, no commits, no dirt, *"NOTHING — and this row is why the arm needs a third word"*.
 * Minutes later the same worktree read **0 commits past main and 9 modified TRACKED files,
 * including `bio-plane/src` regions.** It had started working. **It crossed into the third
 * window silently, with no commit, no push, and no event anything could hook** — so an
 * implementation that exempted on *0 commits*, or that cached the verdict, would have gone
 * blind on the exact row it was told to protect. So: exempt ONLY when there is no committed
 * work past `origin/main` **AND** no working-tree change, both re-read on every run.
 *
 * **AND THE COUNTS ARE REPORTED RATHER THAN JUDGED, which is the other half and points the
 * opposite way.** A worktree whose only dirt is `?? m040-merged.log` is obviously scratch; one
 * with 9 modified tracked files is obviously work. **Do not build a heuristic to tell those
 * apart** — that is where an arm goes subtly wrong and stays wrong, and untracked may equally
 * be a brand-new suite, which is work. So MODIFIED and UNTRACKED are counted SEPARATELY and
 * printed. *"nothing committed, 9 modified"* is actionable; *"nothing committed, 1 untracked"*
 * is dismissed in a second **without training the reader to dismiss the arm.** A bare warning
 * forces the ARM to be right about scratch-versus-work; a reported shape lets the READER be
 * right, and the reader has context the arm never will.
 *
 * ------------------------------------------------------ THE POPULATION, NOT THE SPELLING
 *
 * The first specification named `worktree-agent-*`. **That glob is not the population.**
 * `rec102-tier3-layer-parts`, `rec111-unit-count-bound` and every `claude/*` session worktree
 * hold real work under names it never matches, so a worker that named its branch sensibly was
 * invisible — the blind spot this item exists to close, reproduced one level in. Worse, **it
 * would have passed its own negative control**, because a planted `worktree-agent-*` branch is
 * exactly what the glob does see: a control that cannot fail for the population it misses.
 *
 * So the enumeration is `git worktree list --porcelain` — git's own answer to *what worktrees
 * exist*, which keys on what a worktree IS rather than on where it sits or what it is called,
 * and which no naming convention can fall behind. A second pass covers LOCAL BRANCHES WITH NO
 * WORKTREE, because a branch outlives the worktree that made it — a worktree reaped with the
 * branch left behind is REC-91's exact shape, and D-288's original 137 were all of this kind.
 * Measured on this clone 2026-09-16: six such branches, every one already merged into
 * `origin/main` and therefore silent, so the pass costs nothing in noise today and closes the
 * case that cost a day.
 *
 * ------------------------------------- THE SPELLING LESSON, UNLEARNED ON THE OTHER SIDE
 *
 * **The section above says to key on what a thing IS rather than what it is CALLED. The
 * remote side of the comparison did the opposite for a day, and nobody noticed because the
 * enumeration half had been fixed so carefully.** `remoteSha` was `rem.map.get(u.branch)` — a
 * lookup by the local branch's NAME — so the predicate answered *is there a remote branch
 * SPELLED like mine* while reporting the answer to *does this work exist anywhere but this
 * disk*. Work pushed under any other name read as NEVER PUSHED.
 *
 * MEASURED 2026-09-17 by BOB #13 on this estate, and confirmed at the artifact by CONDUCT #2
 * walking every origin head independently: worktree `ecstatic-napier-fef9bc`, branch
 * `claude/ecstatic-napier-fef9bc`, HEAD `a8553af0` — reported *7 commit(s) past origin/main,
 * no remote ref at all*, while `a8553af0` was **exactly the tip of
 * `origin/conduct2-wip-20260917`**. Two witnesses by different routes, so not one source
 * copied.
 *
 * **WHY IT WAS CREDIBLE: A TRUE FINDING SITS BESIDE THE FALSE ONE, AND IT IS EASY TO READ THE
 * PAIR AS ONE CORROBORATED VERDICT.** `plancheck` has TWO arms that can name one tree.
 * *7 commit(s) past origin/main* is TRUE — those commits genuinely were not integrated — and a
 * reader who checks that half confirms it and stops, which is the same shape as a stale debt
 * row reading like a fact: **the true finding is what stops the check on the false one.** Two
 * different questions are in play — *does this reach anybody* (reachability, this arm's) and
 * *is this integrated* (ahead of `main`, the other arm's) — and only the first is this arm's.
 *
 * **AND THE TWO ARMS HAVE DIFFERENT SCOPES, WHICH IS A SHARPER FINDING THAN THE DEFECT THAT
 * EXPOSED IT** (CONDUCT #2, 2026-09-17, and it is a CORRECTION OF THIS FILE'S OWN FIRST
 * ACCOUNT). This arm walks the WHOLE ESTATE, so it names every worktree from wherever it is
 * run. `plancheck`'s `UNPUSHED` check is scoped to the LOCAL HEAD — `origin/main..HEAD` in the
 * tree it runs in — so it can only ever name the branch you are standing on.
 *
 * **THE RECEIPT IS THIS FILE'S AUTHOR GETTING IT WRONG WHILE OBEYING THE RULE.** BOB #13
 * grepped `plancheck`'s full output for the tree in question, found exactly ONE line, and
 * published *there is one finding, containing a true clause* as a correction to CONDUCT #2.
 * The grep was accurate. The generalisation was false: BOB #13's own worktree was ZERO commits
 * ahead of `origin/main`, so the `UNPUSHED` arm **did not fire there at all** — from that
 * vantage the second finding cannot exist. CONDUCT #2, standing in the tree that was 7 ahead,
 * saw both lines. **Two sessions deliberately checking each other, both going to the artifact
 * as the rule demands, reached opposite answers within ten minutes — because they asked a
 * correctly-scoped question from differently-scoped places and NOTHING IN THE OUTPUT SAID SO.**
 *
 * **GOING TO THE ARTIFACT DOES NOT SETTLE A CLAIM IF THE INSTRUMENT'S ANSWER DEPENDS ON WHERE
 * YOU RAN IT AND THE INSTRUMENT DOES NOT DECLARE ITS VANTAGE.** That is `CLAUDE.md`'s
 * world-claim rule meeting its own limit, and it is this whole defect one level up: a question
 * asked about the wrong unit. The remedy is cheap and is now implemented — **every finding
 * states the scope it was taken at**, estate-wide or this-checkout-only — because the reader
 * this arm exists to serve is precisely the one who greps from one tree and acts on behalf of
 * another.
 *
 * **AND THE COST WAS NOT A NOISY WARNING, WHICH IS WHY THIS IS NOT MERELY A TUNING FIX**
 * (CONDUCT #2's finding, and it is the stronger half): the window's remedy line says
 * `PUSH IT — git push origin HEAD:<branch>`. A session acting on it in good faith would have
 * pushed a LIVE integrator's tree under a second name — publishing a merge with a row flip
 * that was deliberately held back from `main` with a doc gate and a claims release still owed.
 * **A false NEVER-PUSHED makes the detector MANUFACTURE a strand: a second head of ungated
 * work under a name nobody tracks.** That is the arm-that-fires-at-the-wrong-thing class
 * (`CLAUDE.md`), and its output looks exactly like diligence.
 *
 * **THE CONTROL ARM THAT DISCRIMINATES IS NOT THE OBVIOUS ONE** (CONDUCT #2 again). An arm
 * that pushes a branch under its OWN name and requires the warning to go quiet **cannot tell
 * the fixed predicate from the broken one** — the broken one also goes quiet, because the
 * names match. The discriminating arm pushes under a DIFFERENT name. Its twin is the
 * over-strictness guard: a tree with genuinely unpushed commits must still be NAMED, or the
 * false positive has been traded for a false negative in the direction that loses work. Both
 * are in the suite (section 11) and both are armed by the control driver.
 *
 * --------------------------------------------------------- WHERE THE REMOTE'S LIST COMES FROM
 *
 * `git ls-remote` when the network is allowed, and it is the authority. Remote-TRACKING refs
 * are the cheap offline answer and they go stale in the dangerous direction: a plain
 * `git fetch` does not prune, so a branch DELETED on the remote lingers and reads as pushed —
 * a false negative, and **D-288 item 3 (M0-49) makes CONDUCT delete the remote branch on
 * merge**, so the estate is about to start manufacturing exactly those stale refs. Under
 * `--local`, where plancheck promises not to touch the network, the tracking refs are used and
 * **the finding SAYS SO in its own text** rather than presenting a cache as a measurement.
 *
 * ------------------------------------------ AN EMPTY WALK IS NEVER REPORTED AS A CLEAN ONE
 *
 * **This module's own first draft failed exactly the way M0-48's acceptance says a liar would
 * satisfy it, and the receipt is kept because it is the whole argument.** It shelled out
 * through `execSync`, so `--format=%(refname:short)` — unquoted — was a SYNTAX ERROR in
 * `/bin/sh`; an `allowFail` path swallowed it; and the audit reported all-zero over an estate
 * holding seven worker branches, two of them genuinely diverged. **A walk that matched nothing
 * and congratulated itself**, in the first ten minutes of writing the thing designed against
 * it. Two fixes, the second being the one that generalises: `execFileSync` with an ARGV ARRAY,
 * so there is no shell and nothing to quote; and **a failed enumeration is a DISTINCT STATE,
 * never an empty one** — `walkFailed`, which the caller must report. `[]` now means *nothing
 * found*, and nothing else, which is `CLAUDE.md`'s rule about concluding a value from an
 * absence with two causes, arriving inside the instrument written to serve it.
 *
 * ------------------------------------------------------------- WHAT IT CANNOT SEE
 *
 *   - ONE CLONE ON ONE MACHINE AT ONE INSTANT. A worktree that strands and is pruned before a
 *     run leaves no trace, and nothing here says how LONG anything has been stranded.
 *   - WHETHER THE WORK MATTERS. Every unit it names may be scratch. It reports a shape and
 *     leaves the judgement with the reader, which is also why it warns rather than gates.
 *   - A REMOTE OTHER THAN `origin`.
 *   - WORK THAT IS NOT IN THE FILESYSTEM AT ALL — an editor buffer, a stash entry.
 */

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* Quoted so a finding carries the rule rather than a paraphrase of it. */
export const RULE_SENTENCE =
  "A change is not made when it is written. It is made when it is committed and PUSHED, "
  + "because the repository is the channel between sessions (CLAUDE.md) — and a worker's own "
  + "tree is where an item's work lives until CONDUCT merges it (D-288).";

/* The three windows, with the reader's next act attached to each. Written once, so the
   message, the suite and any later caller cannot drift into calling them the same thing. */
export const WINDOWS = {
  unpushed: {
    heading: "NEVER PUSHED — committed here, on no remote",
    act: "PUSH IT — `git push origin HEAD:<branch>`, then verify from the remote.",
  },
  behind: {
    heading: "PUSHED, THEN BEHIND — the remote has the branch, but not these commits",
    act: "PUSH IT — the remote ref is OLDER than this HEAD; it only looks backed up.",
  },
  uncommitted: {
    heading: "UNCOMMITTED — changes that no push can reach",
    act: "COMMIT FIRST — no push can help; there is nothing yet for it to move.",
  },
};
export const WINDOW_ORDER = ["unpushed", "behind", "uncommitted"];

export function git(args, { repo = ROOT, allowFail = false } = {}) {
  try {
    return execFileSync("git", args, {
      cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (e) {
    if (allowFail) return null;
    throw e;
  }
}

/* git's own answer to "what worktrees exist". The FIRST entry is the primary worktree. */
export function worktrees({ repo = ROOT } = {}) {
  const out = git(["worktree", "list", "--porcelain"], { repo, allowFail: true });
  if (out === null) return { units: [], failed: true };
  const units = [];
  let cur = null;
  for (const line of out.split("\n")) {
    if (line.startsWith("worktree ")) {
      cur = { path: line.slice(9), branch: null, head: null, detached: false, bare: false };
      units.push(cur);
    } else if (!cur) continue;
    else if (line.startsWith("HEAD ")) cur.head = line.slice(5);
    else if (line.startsWith("branch ")) cur.branch = line.slice(7).replace(/^refs\/heads\//, "");
    else if (line === "detached") cur.detached = true;
    else if (line === "bare") cur.bare = true;
  }
  units.forEach((u, i) => { u.primary = i === 0; u.name = basename(u.path); });
  return { units: units.filter((u) => !u.bare), failed: false };
}

/* Local branches, so the ones with no worktree can be judged too. */
export function localBranches({ repo = ROOT } = {}) {
  const out = git(["for-each-ref", "--format=%(refname:short)%09%(objectname)", "refs/heads/"],
                  { repo, allowFail: true });
  if (out === null) return { branches: [], failed: true };
  return {
    failed: false,
    branches: out.split("\n").filter(Boolean).map((l) => {
      const [name, sha] = l.split("\t");
      return { name, sha };
    }),
  };
}

export function remoteHeads({ repo = ROOT, network = true, remote = "origin" } = {}) {
  if (network) {
    const out = git(["ls-remote", "--heads", remote], { repo, allowFail: true });
    if (out !== null) {
      const map = new Map();
      for (const l of out.split("\n").filter(Boolean)) {
        const [sha, ref] = l.split("\t");
        if (ref) map.set(ref.replace(/^refs\/heads\//, ""), sha);
      }
      return { map, source: "ls-remote", degraded: false, failed: false };
    }
  }
  const out = git(["for-each-ref", "--format=%(refname:short)%09%(objectname)",
                   `refs/remotes/${remote}/`], { repo, allowFail: true });
  const map = new Map();
  for (const l of (out || "").split("\n").filter(Boolean)) {
    const [name, sha] = l.split("\t");
    if (name && name !== `${remote}/HEAD`) map.set(name.slice(remote.length + 1), sha);
  }
  /* DEGRADED means the network was ASKED FOR and could not be reached — a distinct state
     from `--local`, where the cache is what was requested. Never collapsed into one:
     one of them is a failure and the other is a choice. */
  return { map, source: "tracking-refs", degraded: network, failed: network && out === null };
}

/* MODIFIED (tracked) and UNTRACKED counted SEPARATELY and never judged — see the header.
   `--no-optional-locks` because this reads OTHER LIVE SESSIONS' worktrees, and a plain
   `git status` refreshes that worktree's index: an instrument must not write into the tree
   it is measuring. */
export function workingTree({ repo, path }) {
  const out = git(["--no-optional-locks", "status", "--porcelain"], { repo: path, allowFail: true });
  if (out === null) return { modified: 0, untracked: 0, failed: true };
  let modified = 0, untracked = 0;
  for (const l of out.split("\n").filter(Boolean)) (l.startsWith("??") ? untracked++ : modified++);
  return { modified, untracked, failed: false };
}

const ancestor = (repo, a, b) =>
  git(["merge-base", "--is-ancestor", a, b], { repo, allowFail: true }) !== null;

/* Is this HEAD carried by ANY ref on the remote, whatever that ref is CALLED? Returns the
   carrier `{ ref, sha }` or null. See the header section on SPELLING for why this exists and
   what it cost. The same-named ref is tried FIRST so the ordinary case costs one ancestry
   call and reports the ref the reader expects; the walk is the fallback, and 19 heads on this
   clone (measured 2026-09-17) makes its cost irrelevant beside the `ls-remote` it follows.

   IT FAILS TOWARD *STRANDED*, ON PURPOSE AND STATED RATHER THAN LEFT TO BE DISCOVERED. A
   remote sha whose object this clone has never fetched cannot be tested for ancestry, so
   `ancestor` returns false through `allowFail` and the unit reads as NOT carried. That is a
   FALSE POSITIVE — the direction that costs a reader a second look — where the opposite
   default would be a false negative, which is the direction that loses work. The window this
   sits in warns and never fails (BOB #12's ruling), so a second look is all it can cost. */
export function carriedBy(repo, head, remoteMap, preferName = null) {
  if (!head || !remoteMap) return null;
  const tryRef = (ref) => {
    const sha = remoteMap.get(ref);
    if (!sha) return null;
    return (sha === head || ancestor(repo, head, sha)) ? { ref, sha } : null;
  };
  if (preferName) {
    const hit = tryRef(preferName);
    if (hit) return hit;
  }
  for (const ref of remoteMap.keys()) {
    if (ref === preferName) continue;
    const hit = tryRef(ref);
    if (hit) return hit;
  }
  return null;
}

/* D-569 — THE GRADE OF PLANCHECK §1's UNPUSHED ARM, which fires when HEAD is ahead of `origin/main`.
   Its text always said "a failure on main and a note anywhere else"; its code called `fail()` on every
   branch, so no worker could meet "plancheck 0 fail" on its own PUSHED `land/` branch. The grade:
     - FAIL on `main`: main ahead of origin/main is unpublished integration, whatever else carries it;
     - FAIL where NO ref on origin carries HEAD: local-only work is D-288's loss shape on any branch;
     - NOTE where some origin ref carries HEAD, under ANY name — `carriedBy`, same-named ref first,
       because a worker pushes `HEAD:refs/heads/land/worker/<id>` from a checkout whose own branch
       may be called something else or be detached (S11 above is the same spelling defect).
   `network: false` by default: plancheck has just run `git fetch origin`, so the tracking refs are
   the remote as of this run and a second `ls-remote` would buy nothing. A remote object this clone
   has not fetched cannot be tested for ancestry and reads NOT carried — toward FAIL, the direction
   that costs a second look rather than the direction that loses work (as `carriedBy` states). */
export function unpushedGrade({ repo = ROOT, branch, head, network = false } = {}) {
  if (branch === "main")
    return { grade: "fail", carrier: null,
             why: "HEAD is main, and main ahead of origin/main is unpublished integration." };
  const { map } = remoteHeads({ repo, network });
  const carrier = carriedBy(repo, head, map, branch && branch !== "HEAD" ? branch : null);
  return carrier
    ? { grade: "note", carrier,
        why: `origin/${carrier.ref} carries HEAD — pushed, awaiting integration.` }
    : { grade: "fail", carrier: null,
        why: `no ref on origin carries HEAD — push it: git push origin HEAD:refs/heads/land/<lane>/<id>.` };
}

export function strandedAudit({
  repo = ROOT, main = "origin/main", network = true, remote = "origin",
} = {}) {
  const wt = worktrees({ repo });
  const lb = localBranches({ repo });
  const rem = remoteHeads({ repo, network, remote });
  const mainSha = git(["rev-parse", main], { repo, allowFail: true });

  const judge = (u) => {
    const windows = [];
    const remoteSha = u.branch ? (rem.map.get(u.branch) || null) : null;
    /* `ahead` is committed work that `origin/main` does not have. When main cannot be
       resolved nothing is claimed rather than everything being claimed. */
    const onMain = mainSha && u.head ? ancestor(repo, u.head, mainSha) : null;
    const ahead = onMain === false
      ? +(git(["rev-list", "--count", `${mainSha}..${u.head}`], { repo, allowFail: true }) ?? 0)
      : 0;
    const onRemote = remoteSha && u.head
      ? (remoteSha === u.head || ancestor(repo, u.head, remoteSha)) : false;
    /* THE QUESTION THE TWO PUSH WINDOWS ACTUALLY ASK IS *DOES THIS REACH ANYBODY*, AND
       REACHABILITY — NOT THE BRANCH'S NAME — IS WHAT ANSWERS IT. `carrier` is null only when
       no ref on the remote contains this HEAD. When it is non-null under a DIFFERENT name the
       work is on origin and is not stranded, so neither push window opens. */
    const carrier = ahead > 0 ? carriedBy(repo, u.head, rem.map, u.branch) : null;
    const carriedElsewhere = !!carrier && carrier.ref !== u.branch;
    /* Each condition states its OWN precondition rather than leaning on the `else` above it.
       Found by this item's own control driver: with the first branch disabled, a unit with NO
       remote ref fell through to `behind`, and `strandedMessage` then dereferenced a null
       `remoteSha` and THREW — taking the whole of `plancheck` down from inside a WARN path,
       which is worse than the missing warning it was standing in for. A classifier whose arms
       are only correct in the presence of each other is one edit from that.

       The NAME still separates the two push windows, and there it is the right key: both
       remedies are *push it*, and the distinction is a statement about this branch's own
       history — *you pushed it and then moved past it* — which only its own ref can answer.

       `onRemote` IS NO LONGER PART OF THE CONDITION, AND THE NEGATIVE CONTROL IS WHAT SAID SO.
       `!carrier` already means NO ref contains this HEAD — the same-named one is the FIRST
       thing `carriedBy` tries — so `!onRemote` was implied by it and could never change a
       verdict. A3 caught that by arming `onRemote` to sha-equality and finding S8 still
       green: **an arm that cannot fail, created by this very edit.** The over-strictness
       protection did not disappear, it MOVED into `carriedBy`'s ancestry call, and A3 moved
       with it. `onRemote` stays in the returned object because it is still true reported data
       — *does this branch's OWN ref contain this head* — but nothing classifies on it. */
    if (ahead > 0 && !carrier && !remoteSha) windows.push("unpushed");
    else if (ahead > 0 && !carrier && remoteSha) windows.push("behind");
    if (u.tree && (u.tree.modified > 0 || u.tree.untracked > 0)) windows.push("uncommitted");
    return { ...u, remoteSha, onMain, ahead, onRemote, carrier, carriedElsewhere, windows };
  };

  /* Pass A — WORKTREES. Only these can carry the third window. */
  const units = wt.units.map((u) => judge({ ...u, kind: "worktree",
    tree: workingTree({ repo, path: u.path }) }));

  /* Pass B — LOCAL BRANCHES WITH NO WORKTREE. No working tree, so no third window. */
  const checkedOut = new Set(wt.units.map((u) => u.branch).filter(Boolean));
  const orphans = lb.branches.filter((b) => !checkedOut.has(b.name)).map((b) =>
    judge({ kind: "branch", name: b.name, branch: b.name, head: b.sha, path: null,
            primary: false, detached: false, tree: null }));

  const all = [...units, ...orphans];
  const exposed = all.filter((u) => u.windows.length > 0);
  const byWindow = Object.fromEntries(
    WINDOW_ORDER.map((w) => [w, exposed.filter((u) => u.windows.includes(w))]));

  return {
    units, orphans, all, exposed, byWindow, main,
    source: rem.source, degraded: rem.degraded,
    /* Every way this walk can be WRONG rather than merely empty, named. A caller that
       ignores these is reporting a clean estate it never looked at. */
    walkFailed: wt.failed || lb.failed,
    remoteFailed: !!rem.failed,
    treeFailed: units.filter((u) => u.tree && u.tree.failed).map((u) => u.name),
    mainResolved: !!mainSha,
    counts: {
      worktrees: units.length, orphanBranches: orphans.length,
      exposed: exposed.length, idle: all.length - exposed.length,
      /* REPORTED so the quiet over these units is a JUDGEMENT rather than an empty walk —
         the same reasoning the header gives for never reporting an idle worktree as clean. */
      carriedElsewhere: all.filter((u) => u.carriedElsewhere).length,
      ...Object.fromEntries(WINDOW_ORDER.map((w) => [w, byWindow[w].length])),
    },
  };
}

/* One block per WINDOW, because the reader's next act differs in each. A cap exists so an
   estate holding a hundred of these still gets a readable line — but the COUNT is always
   exact and stated, so a capped list can never be mistaken for a short one. */
export function strandedMessage(a, { cap = 10 } = {}) {
  const wrap = (s, indent = "        ") =>
    s.replace(new RegExp(`(.{1,${78 - indent.length}})(\\s|$)`, "g"), `${indent}$1\n`).replace(/\n$/, "");
  const line = (u, w) => {
    const who = `${u.name}${u.kind === "branch" ? " (branch, no worktree)" : ""}`;
    const at = u.head ? ` ${u.head.slice(0, 8)}` : "";
    if (w === "uncommitted")
      return `          ${who}${at} — ${u.tree.modified} modified, ${u.tree.untracked} untracked`
        + (u.ahead ? `; ${u.ahead} commit(s) past ${a.main}` : `; nothing committed past ${a.main}`);
    /* `?.` and a stated fallback rather than a bare dereference. THE WARN PATH MUST NOT BE
       ABLE TO THROW: an instrument that crashes while reporting a problem removes every
       check after it, and this one sits in `plancheck`, which is the last gate before a
       push. Driven — this line threw during the control run that produced it. */
    if (w === "behind")
      return `          ${who}${at} — remote ref at ${u.remoteSha?.slice(0, 8) ?? "UNKNOWN"}, `
        + `${u.ahead} commit(s) past ${a.main} not on it`;
    return `          ${who}${at} — ${u.ahead} commit(s) past ${a.main}, no remote ref at all`;
  };
  let out = `STRANDED WORK — ${a.exposed.length} of ${a.all.length} unit(s) hold work that exists`
    + ` only on\n        this disk. Three windows, and the next act DIFFERS in each:\n`;
  for (const w of WINDOW_ORDER) {
    const list = a.byWindow[w];
    if (!list.length) continue;
    out += `\n        ${WINDOWS[w].heading} — ${list.length}\n`
      + list.slice(0, cap).map((u) => line(u, w)).join("\n")
      + (list.length > cap ? `\n          … and ${list.length - cap} more` : "")
      + `\n          -> ${WINDOWS[w].act}\n`;
  }
  out += `\n${wrap(RULE_SENTENCE)}\n`
    + `        Counts are REPORTED, not judged: 9 modified tracked files is obviously work and\n`
    + `        1 untracked path is obviously scratch, and you have context this arm never will.\n`
    + `        This NEVER fails the run — a historical local branch is not a defect and the\n`
    + `        inherited ones are deliberately not retroactively pushed (D-288).`;
  if (a.source === "tracking-refs")
    out += `\n        EVIDENCE: remote-tracking refs, ${a.degraded
      ? "because the REMOTE COULD NOT BE REACHED"
      : "because --local was asked for"} — a cached list, not the remote's own.`;
  return out;
}
