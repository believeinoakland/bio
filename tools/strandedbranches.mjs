/* strandedbranches — D-288's DETECTION half: a local worker branch whose commits
 * exist NOWHERE ELSE.
 *
 * THE RULE, and it is `CLAUDE.md`'s oldest one applied at the altitude it was never
 * applied to: *a change is not made when it is written, it is made when it is COMMITTED
 * AND PUSHED.* `plancheck` section 1 enforces exactly that — for `main` and for the
 * planning surface. Nothing enforced it for a WORKER BRANCH, which is where every item's
 * code sits between the worker reporting and CONDUCT merging.
 *
 * WHY IT IS AN INSTRUMENT AND NOT A PRACTICE, which is this row's own history. D-288 was
 * measured 2026-08-10 — **137 local `worktree-agent-*` branches, ZERO on the remote** — and
 * it then sat `open` for FIVE WEEKS with a perfectly good disposition while nothing chased
 * it, because `plancheck` fails an open debt row with NO disposition and this one HAD one.
 * The estate's own watchdog was satisfied for the entire period the exposure was total. On
 * 2026-09-15 it stopped being theoretical: REC-91 finished, committed and released on
 * `worktree-agent-aabecaced11e00db1`, its integrator was stood down before merging, and the
 * work reached nobody for a day — recovered only because somebody went looking, on a
 * physical machine in another location. **This is the only thing in the estate that will
 * ever TELL anyone a branch was stranded.** `WORKER.md`'s push step (D-288 item 1, landed
 * 2026-09-16) PREVENTS; nothing audits prevention, which is precisely the shape that just
 * failed. This DETECTS, inside the loop everyone already runs, so it cannot go silent.
 *
 * IT WARNS AND MUST NEVER FAIL, and that is a ruling rather than a timidity (BOB #12,
 * 2026-09-16, recorded on D-288). A historical local branch is not a defect; the branches
 * this estate has inherited are NOT retroactively pushed, because pushing them would make
 * the remote's branch list useless as a signal, which is its own defect. **A gate that goes
 * red on inherited state gets switched off, and that is this estate's own recorded failure
 * mode for ratchets.** Promoting this to a FAIL would delete the instrument.
 *
 * ------------------------------------------------------------------ WHAT "STRANDED" MEANS
 *
 * D-288 and M0-48 both phrase the predicate as *neither merged into `origin/main` nor
 * present on the remote*. **Taken literally — the remote has a ref of that NAME — the test
 * produces a FALSE NEGATIVE on the exact exposure the row exists for, and this estate is
 * ALREADY IN THAT STATE.** Measured here 2026-09-16, before a line of this was written:
 * `worktree-agent-a984a71a7b324f52c` is on the remote at `fcd4cf9b` and locally at
 * `e2af2534`, and `worktree-agent-af08132ad4ca455b7` is on the remote at `541bc92d` and
 * locally at `ea263c29`. In BOTH cases the local tip is NOT an ancestor of the remote's,
 * so local commits exist nowhere but this disk — while a name-presence test calls the
 * branch published and says nothing. That is a quiet arm over live unpublished work, which
 * is the one outcome the row forbids.
 *
 * **So the test is REACHABILITY, not name presence**, and the row's phrase is read as
 * meaning what it was for rather than what it literally says. A branch is STRANDED when its
 * tip commit is reachable from neither `origin/main` nor the remote's own ref of that name.
 * The refinement is strictly more inclusive — every branch the literal test would name is
 * named here too — so it cannot weaken M0-48's acceptance, and the over-strictness
 * constraint still holds exactly: a branch whose tip IS an ancestor of `origin/main`, and a
 * branch whose tip IS on the remote, each stay unnamed.
 *
 * The classification, in the order it is decided:
 *
 *   integrated   tip is an ancestor of `origin/main`             -> silent
 *   published    the remote's ref of that name IS the tip, or    -> silent
 *                the tip is an ancestor of it (the remote is ahead)
 *   diverged     the remote has the name, the tip is not on it   -> NAMED, with the count
 *   absent       the remote has no ref of that name              -> NAMED
 *
 * `diverged` is reported separately from `absent` because the two ask for different acts —
 * `absent` wants a push, `diverged` wants a push of work the reader may believe is already
 * safe — and because a reader told "not on the remote" about a branch they can SEE on the
 * remote stops believing the instrument.
 *
 * ------------------------------------------------- WHERE THE REMOTE'S LIST COMES FROM
 *
 * `git ls-remote` when the network is allowed, and it is the authority. Remote-TRACKING
 * refs (`refs/remotes/origin/*`) are the cheap offline answer and they go stale in the
 * dangerous direction: a plain `git fetch` does not prune, so a branch DELETED on the
 * remote lingers in `refs/remotes` and reads as published. **That is a false negative, and
 * D-288 item 3 (M0-49) makes CONDUCT DELETE the remote branch on merge** — so the estate is
 * about to start manufacturing exactly the stale refs a tracking-ref test would trust.
 * Under `--local`, where plancheck is promising not to touch the network, the tracking refs
 * are used and **the finding SAYS SO in its own text** rather than presenting a cached
 * answer as a measured one.
 *
 * ------------------------------------------ AN EMPTY WALK IS NEVER REPORTED AS A CLEAN ONE
 *
 * **This module's own first draft failed exactly the way M0-48's acceptance says a liar
 * would satisfy it, and the receipt is kept because it is the whole argument.** It shelled
 * out through `execSync`, so `--format=%(refname:short)` — unquoted — was a SYNTAX ERROR in
 * `/bin/sh`; the failure was swallowed by an `allowFail` path that returns an empty list;
 * and the audit reported `{integrated: 0, published: 0, absent: 0, diverged: 0}` over an
 * estate holding seven local worker branches, two of them genuinely diverged. **A walk that
 * matched nothing and congratulated itself**, produced by a quoting bug in the first ten
 * minutes of writing the thing designed against it.
 *
 * Two fixes, and the second one is the one that matters:
 *   - `execFileSync` with an ARGV ARRAY. There is no shell, so there is no quoting to get
 *     wrong. A shell was never needed here.
 *   - **A failed enumeration is a DISTINCT STATE, never an empty one.** `walkFailed` is set
 *     and the caller must report it. `[]` now means *no branches*, and nothing else — which
 *     is `CLAUDE.md`'s rule about concluding a value from an absence with two causes,
 *     arriving inside the instrument written to serve it.
 */

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* The row's scope, written once so the arm and its suite cannot drift apart. */
export const PREFIX = "worktree-agent-";
export const GLOB = `refs/heads/${PREFIX}*`;

/* Quoted so a finding carries the rule rather than a paraphrase of it. */
export const RULE_SENTENCE =
  "A change is not made when it is written. It is made when it is committed and PUSHED, "
  + "because the repository is the channel between sessions (CLAUDE.md) — and a worker "
  + "branch is where an item's code lives until CONDUCT merges it (D-288).";

/* ARGV array, no shell. See the header: the shell form is what produced the silent empty
   walk this module exists to make impossible. */
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

/* Local `worktree-agent-*` branches, as {name, sha}. `for-each-ref` rather than
   `git branch`, because refs are shared across every worktree of a clone and the
   porcelain's decoration is not a contract.

   Returns `{branches, failed}`. A caller may not receive a bare list, because a bare list
   lets a failure read as a clean estate — which is exactly what happened here once. */
export function localBranches({ repo = ROOT } = {}) {
  const out = git(["for-each-ref", "--format=%(refname:short)%09%(objectname)", GLOB],
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

/* The remote's own list. `network: true` asks the REMOTE; otherwise the tracking refs are
   read and the source is reported, so a caller can say which it used — an answer from a
   cache presented as a measurement is the shape this repository refuses. */
export function remoteBranches({ repo = ROOT, network = true, remote = "origin" } = {}) {
  if (network) {
    const out = git(["ls-remote", "--heads", remote, GLOB], { repo, allowFail: true });
    if (out !== null) {
      const map = new Map();
      for (const l of out.split("\n").filter(Boolean)) {
        const [sha, ref] = l.split("\t");
        if (ref) map.set(ref.replace(/^refs\/heads\//, ""), sha);
      }
      return { map, source: "ls-remote", degraded: false };
    }
  }
  const out = git(["for-each-ref", "--format=%(refname:short)%09%(objectname)",
                   `refs/remotes/${remote}/${PREFIX}*`], { repo, allowFail: true });
  const map = new Map();
  for (const l of (out || "").split("\n").filter(Boolean)) {
    const [name, sha] = l.split("\t");
    if (name) map.set(name.slice(remote.length + 1), sha);
  }
  /* DEGRADED means the network was ASKED FOR and could not be reached — a distinct state
     from `--local`, where the cache is what was requested. Never collapsed into one,
     because one of them is a failure and the other is a choice. */
  return { map, source: "tracking-refs", degraded: network, failed: network && out === null };
}

const reachable = (repo, a, b) =>
  git(["merge-base", "--is-ancestor", a, b], { repo, allowFail: true }) !== null;

export function strandedAudit({
  repo = ROOT, main = "origin/main", network = true, remote = "origin",
} = {}) {
  const local = localBranches({ repo });
  const rem = remoteBranches({ repo, network, remote });
  const current = git(["rev-parse", "--abbrev-ref", "HEAD"], { repo, allowFail: true });
  const mainSha = git(["rev-parse", main], { repo, allowFail: true });

  const judged = [], stranded = [];
  for (const b of local.branches) {
    const r = { ...b, current: b.name === current, remoteSha: rem.map.get(b.name) || null };
    if (mainSha && reachable(repo, b.sha, mainSha)) r.state = "integrated";
    else if (!r.remoteSha) r.state = "absent";
    else if (r.remoteSha === b.sha || reachable(repo, b.sha, r.remoteSha)) r.state = "published";
    else {
      r.state = "diverged";
      /* How much is at risk, which is what makes the warning actionable. `allowFail`
         because the remote's object may not be present in this clone at all. */
      const n = git(["rev-list", "--count", `${r.remoteSha}..${b.sha}`], { repo, allowFail: true });
      r.unpublished = n === null ? null : +n;
    }
    judged.push(r);
    if (r.state === "absent" || r.state === "diverged") stranded.push(r);
  }

  return {
    branches: judged, stranded, source: rem.source, degraded: rem.degraded, current,
    /* Every way this walk can be WRONG rather than merely empty, named. A caller that
       ignores these is reporting a clean estate it never looked at. */
    walkFailed: local.failed, remoteFailed: !!rem.failed,
    mainResolved: !!mainSha, main,
    counts: ["integrated", "published", "absent", "diverged"].reduce(
      (a, s) => (a[s] = judged.filter((r) => r.state === s).length, a), {}),
  };
}

/* The warning's text. A cap exists because an estate holding a hundred of these must still
   get a READABLE line — but the COUNT is always exact and stated, so a capped list can
   never be mistaken for a short one. */
export function strandedMessage(a, { cap = 12 } = {}) {
  const line = (r) => `          ${r.name}  ${r.sha.slice(0, 8)}`
    + (r.state === "diverged"
        ? `  — on the remote at ${r.remoteSha.slice(0, 8)}, `
          + `${r.unpublished === null ? "some" : r.unpublished} local commit(s) NOT on it`
        : `  — not on the remote at all`)
    + (r.current ? `  [THIS IS YOUR CURRENT BRANCH]` : "");
  const shown = a.stranded.slice(0, cap);
  return `STRANDED BRANCH — ${a.stranded.length} local \`${PREFIX}*\` branch(es) hold commits`
    + ` that are\n        reachable from NEITHER ${a.main} NOR the remote, so those commits exist`
    + ` only\n        on this disk:\n`
    + shown.map(line).join("\n")
    + (a.stranded.length > cap ? `\n          … and ${a.stranded.length - cap} more` : "")
    /* Wrapped at the report's own indent: plancheck's output is read by a person, and a
       200-column line in a terminal is a line nobody finishes. */
    + `\n` + RULE_SENTENCE.replace(/(.{1,78})(\s|$)/g, "        $1\n")
    + `        This NEVER fails the run: a historical local branch is not a defect and the\n`
    + `        inherited ones are deliberately not retroactively pushed (D-288). Push the\n`
    + `        branch that is YOURS before you report; leave the rest to CONDUCT.`
    + (a.source === "tracking-refs"
        ? `\n        EVIDENCE: remote-tracking refs, ${a.degraded
            ? "because the REMOTE COULD NOT BE REACHED"
            : "because --local was asked for"} — a cached list, not the remote's own.`
        : "");
}
