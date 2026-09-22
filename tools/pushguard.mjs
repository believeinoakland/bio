#!/usr/bin/env node
/**
 * pushguard.mjs — M0-56's pre-push hook. It refuses, AT THE PUSH — the only moment
 * that is after the last prose edit AND after the last rebase — a push whose tip
 * tree `gates.mjs` recorded RED (D-293), one carrying merge markers, one whose
 * design corpus fails `corpuscheck`, and one whose construct status disagrees
 * with the code. M0-110: a push of the branch `coord` ALONE (the lanes' message
 * board, TREE-SHARING.md §1) is judged by its own commit — no merge marker — and
 * by none of those four, which are verdicts about `main`'s tree (`coordOnly`).
 *
 * ------------------------------------------------------------------ M0-99, 2026-09-22: THE ARM IT WAS BUILT FOR RETIRED
 *
 * M0-56 built this file to refuse a push carrying a STALE `docs/DECIDED.md`.  That
 * arm retired when the index left the committed tree (`ORCHESTRATION.md` §"THE
 * RECORD IS PARTITIONED BY WRITER", rule 2): the index is produced on demand by
 * `tools/decided.mjs`'s one freshness call, `.gitignore` names it, and no commit
 * carries a copy that could be stale — so there is nothing left at the push for a
 * staleness arm to refuse, and a guard that went on running the generator would
 * cost every push a full corpus scan to check nothing.  What guards the index now
 * is that it stays OUT of the committed tree: `plancheck` arm 2b, through
 * `decided.mjs`'s `indexTracking()`.  The sections from "why" to "WHAT IT CHECKS"
 * below are the RECORD of the arm as M0-56 built it, kept because the four arms
 * that remain rest on the same argument — why a hook, why it never regenerates,
 * why it installs itself from `plancheck` — and because a reader asking why the
 * hook exists deserves the receipt rather than a summary.
 *
 * ------------------------------------------------------------------ why
 *
 * MEASURED, and the measurement is the whole argument: CONDUCT #2 pushed `main`
 * RED on a stale `docs/DECIDED.md` FOUR TIMES in one session and turned a
 * merged-tree battery red a fifth time through `strandedwork.test.mjs`'s
 * `plancheck --local exits 0` arm.  It derived the correct rule MID-SESSION —
 * *regenerate after the LAST prose edit AND after the LAST rebase, immediately
 * before the push* — wrote it down, and then broke it TWICE MORE.
 *
 * `CLAUDE.md`: **where a rule can be mechanised, write the command, not a better
 * warning.**  A rule that is correct, cheap, written down and broken twice by the
 * session that wrote it is not a discipline problem.  It is a missing mechanism.
 *
 * ------------------------------------------------------------------ TWO CAUSES, AND ONLY ONE OF THEM IS FORGETTING
 *
 *   (1) Regenerate, then edit more prose.  Ordinary forgetting.  Every gate that
 *       runs before the commit catches this one.
 *
 *   (2) Regenerate, then REBASE.  A peer's commit lands NEW RULINGS UNDERNEATH a
 *       freshly generated index.  **NOTHING THIS SESSION DID MADE THE INDEX
 *       STALE** — the corpus changed while the session touched nothing, and the
 *       index it correctly generated ten minutes ago is now wrong.
 *
 * **CAUSE (2) CANNOT BE FIXED BY REMEMBERING**, and it is the reason this file is
 * a hook rather than another gate arm.  A gate — `plancheck`, `gates.mjs` — runs
 * when a session chooses to run it, which is before the commit.  A rebase happens
 * AFTER that, and there is no gate arm reachable from any loop that sits between
 * the last rebase and the bytes leaving.  The push does.
 *
 * ------------------------------------------------------------------ the shape, and the alternatives it beat
 *
 *   - A `gates.mjs` STEP THAT REGENERATES BEFORE IT REPORTS.  Cheap, and it lands
 *     in the loop everyone runs.  REJECTED ON TWO COUNTS, and the second is the
 *     one that actually kills it.  First, it makes the gate MUTATE THE TREE IT IS
 *     MEASURING: a gate that edits its subject can no longer be used to answer
 *     *was this tree correct*, only *is this tree correct now that I fixed it*,
 *     and this estate should not grant that to a gate without a much stronger
 *     reason than convenience.  Second and decisive: **IT DOES NOT CLOSE CAUSE
 *     (2) AT ALL.**  `gates.mjs` runs before the commit.  The rebase comes after.
 *     It would close the cause that care already reaches and miss the cause that
 *     care cannot.
 *
 *   - A `plancheck` ARM THAT REGENERATES INTO A TEMP FILE AND DIFFS.  **THIS WAS
 *     NOT A CANDIDATE, BECAUSE IT ALREADY EXISTED** — `plancheck.mjs` arm 2b shelled
 *     `decided.mjs --check` and failed with *Run `node tools/decided.mjs`* (until
 *     M0-99 retired it with the committed index).  It was what caught all five
 *     occurrences, and M0-56 forbade weakening it.  The defect M0-56 rowed was not
 *     that the detector was missing; it was that the detector fired at a moment the
 *     session could still invalidate, and five times it did.
 *
 *   - A `pre-push` HOOK.  The only shape whose moment is after the last rebase.
 *     TAKEN.
 *
 * ------------------------------------------------------------------ IT REFUSES. IT DOES NOT REGENERATE.
 *
 * As built, the hook ran `decided.mjs --check` and REFUSED a stale push, naming
 * the command.  It never wrote `docs/DECIDED.md`, and it still writes nothing in
 * the working tree.  Three reasons, in order of weight:
 *
 *   - **A HOOK THAT REGENERATED WOULD NOT FIX THE PUSH ANYWAY.**  By the time a
 *     `pre-push` hook runs, the commits are made and the ref list is computed.
 *     Regenerating would leave a DIRTY WORKING TREE and send the stale bytes
 *     regardless.  The auto-fixing hook is not a safer version of this one; it is
 *     a broken one that reports success.
 *   - It keeps the gate-mutation objection from ever arising.  Nothing this file
 *     runs at push time touches a tracked path.
 *   - A refusal naming its remedy is a mechanism a reader can act on in one step.
 *     M0-56 accepts *a non-stale index OR a failure naming the remedy*.
 *
 * ------------------------------------------------------------------ A HOOK IS A NEW ENTRY POINT HERE. IT IS NOT A NEW PLACE TO KEEP STATE.
 *
 * M0-56's brief said a hook is a NEW CLASS of mechanism for this estate.  **HALF
 * OF THAT IS TRUE AND THE HALF THAT MATTERS IS NOT**, and the distinction is
 * worth stating because it is what makes this affordable.  Verified on this tree
 * rather than inherited from M0-41's measurement:
 *
 *   - TRUE: nothing composes any entry loop today.  `.git/hooks/` holds ONLY
 *     `*.sample` files, `core.hooksPath` is unset, and there is no `.github/`.
 *     Git has never run anything of ours.  That IS new, and it is a decision.
 *   - **FALSE: that `.git/` is a novel place for this project to keep a
 *     mechanism.**  `tools/mintid.mjs` has kept the id ledger under
 *     `git rev-parse --git-common-dir` since M0-17 — `.git/bio-idalloc` is on
 *     this disk right now, beside `.git/bio-machine` — and `mintid.test.mjs`
 *     carries a NAMED negative-control arm (`--git-common-dir` swapped for
 *     `--git-dir`) defending exactly that choice.  So the storage location is
 *     established practice with a test arm behind it, and only the *git calls it*
 *     part is new.
 *
 * ------------------------------------------------------------------ THE COMMON DIR, AND A CORRECTION TO THE BRIEF
 *
 * M0-56's brief said a hook *lives in `.git/`, which is not carried by a clone or
 * a worktree*.  **THE CLONE HALF IS RIGHT AND THE WORKTREE HALF IS WRONG**, and
 * the difference decides whether this mechanism is worth building:
 *
 *   - Hooks resolve against the GIT COMMON DIR, which every worktree of a clone
 *     SHARES.  Measured here: `git rev-parse --git-common-dir` from this worktree
 *     answers the main checkout's `.git`.  **So ONE install covers every worktree
 *     of this clone, including every `agent-*` worker worktree spawned later.**
 *     That is the whole fleet this project actually runs, from one write.  Had
 *     the brief been right, a hook would have needed re-installing per worktree
 *     and would have been a much weaker proposition.
 *   - A FRESH CLONE genuinely has no hook.  **THIS IS THE LIMIT AND IT IS STATED
 *     RATHER THAN IMPLIED CLOSED:** until something runs `plancheck` once in a
 *     new clone, that clone's pushes are unguarded.  It is narrowed, not closed,
 *     by `plancheck` installing on every run — the first gate anyone runs arms
 *     the hook — but a clone that pushes before it ever gates is outside this
 *     mechanism.
 *
 * ------------------------------------------------------------------ WHY `plancheck` INSTALLS IT
 *
 * `CLAUDE.md`: **a mechanism that is not in the loop the reader actually runs is
 * not a mechanism.**  A hook that a session must remember to install is the
 * original defect wearing a different hat — a correct, cheap, written-down step
 * that will be skipped.  So `plancheck` installs it, every run, idempotently.
 *
 * **AND THAT IS NOT THE MUTATION OBJECTION ARRIVING BY THE BACK DOOR.**  The
 * objection to a regenerating gate is that it writes a TRACKED path and so
 * changes the answer it is computing.  This writes `.git/hooks/pre-push`, which
 * is not tracked, not in the working tree, not in `git status`, and not an input
 * to any gate including this one.  The property that matters is preserved and is
 * MEASURED rather than argued: `pushguard.test.mjs` asserts `git status
 * --porcelain` is byte-identical across a `--install`.
 *
 * ------------------------------------------------------------------ ARMING, AND THE ARM THAT WOULD NOT HAVE ARMED
 *
 * Two ways this mechanism could have installed itself somewhere git never looks,
 * reported success, and guarded nothing.  Both are closed and both have arms:
 *
 *   - **`core.hooksPath`.**  If it is set, git reads THAT directory and ignores
 *     `.git/hooks` entirely.  Installing into `.git/hooks` while it is set would
 *     produce a file, a success message, and no guard.  `hooksDir()` asks git
 *     where hooks actually live and installs THERE — and refuses, loudly, when
 *     the configured directory does not exist, rather than creating a directory
 *     the operator did not ask for.
 *   - **THE HOOK MUST FIND THE PUSHING WORKTREE, NOT THE INSTALLING ONE.**  One
 *     hook file is shared by every worktree, so a hook with the installer's path
 *     baked in would validate the WRONG TREE — a worker pushing its branch would
 *     be certified against the main checkout's corpus.  The shim resolves
 *     `git rev-parse --show-toplevel` at push time instead, and carries no
 *     absolute path at all.  Asserted by name.
 *
 * ------------------------------------------------------------------ HOW A LIAR PASSED THE RETIRED ARM
 *
 * The cheapest green was a mechanism that REGENERATED UNCONDITIONALLY AND NEVER
 * REPORTED: it would pass every arm about staleness and hide a broken generator
 * behind its own success.  So `check()` told a BROKEN GENERATOR (`generator-failed`,
 * carrying the tool's own output) from a STALE INDEX (`stale`, on `--check`'s own
 * STALE line) — a guard that conflated them would have sent a session to run the
 * tool that was broken.  M0-99 retired `check()` with the arm; a broken generator is
 * now the battery's to catch (`decided.test.mjs` imports it), never a push's.
 *
 * ------------------------------------------------------------------ WHAT IT CHECKS, AND WHAT IT CANNOT
 *
 * The marker scan, `corpuscheck` and `status.mjs --check` read the WORKING TREE.  A
 * push sends COMMITS.  Those are the same thing only when the tree is clean against
 * HEAD, which is the normal state at push time and is CHECKED rather than assumed:
 *
 *   - Corpus clean against HEAD (`git status --porcelain -- docs CLAUDE.md`): the
 *     tree check IS a HEAD check for the prose those arms read.
 *   - Corpus DIRTY: the verdict describes the tree, not the commits.  Reported as
 *     UNDETERMINED with respect to the push, in those words.  It does not refuse:
 *     a session with unrelated uncommitted notes under `docs/` has done nothing
 *     wrong, and a guard that blocked it would be turned off within a day.
 *   - A ref whose local sha is not HEAD: DETECTED from the hook's stdin and named,
 *     rather than left as a sentence in a comment.  The guard says which refs it
 *     did not speak for.
 *
 * Undetermined is first-class here and is STATED.  A guard that said *current*
 * over a tree it had not actually checked would be this project's own
 * costs-nothing-equality defect wearing a green tick.
 *
 * ------------------------------------------------------------------ D-293: THE GATE'S VERDICT, READ BY TREE
 *
 * This guard never RUNS `tools/gates.mjs`, and that is RULED rather than an omission (BOB #22,
 * SCHEDULER #5's Q4): a full gate takes ~25 minutes and `main` took 48 first-parent commits from
 * 13:00Z on 2026-09-21, 46 of 47 gaps under 25 minutes (M-85), so a push-time gate would rebase
 * and re-gate without converging.  What was missing was the other half: nothing refused a push
 * of a tree the gate had ALREADY measured RED.  So `gates.mjs` records its verdict, keyed by the
 * TREE it measured and only when that tree was CLEAN, under the git common dir (`bio-gates/`,
 * one file per run, beside `bio-idalloc` — untracked, shared by every worktree); and `run()`
 * refuses a push whose tip tree carries a RED record, naming it, and says nothing when none
 * exists.  The record's key, path, reader, writer and verdict rule live HERE, in this file, and
 * `gates.mjs` imports them: one rule, one module, so the writer and the reader cannot disagree
 * about what a key is.  (Here and not in a module of its own because the clone-wide copy of this
 * script in the common dir must stay SELF-CONTAINED — a copy importing a sibling it does not
 * have would refuse every push from every checkout that falls back to it.)
 *
 * HOW A LIAR PASSES IT: keying on the COMMIT sha.  An amend of the message alone makes a new
 * commit over the same tree, and a commit-keyed record would read it as never measured.  The
 * key is the tree; `gates.test.mjs` amends and asserts the refusal holds.
 *
 * WHAT IT CANNOT SEE, stated: a tree gated while the working tree was DIRTY is not recorded at
 * all (the ruled scope), so gating a dirty tree and then committing exactly what was measured
 * pushes unrefused — the shape of the 2026-08-10 incident that rowed D-293, left open by the
 * ruling and raised as its DESIGN GAP; a record lives in ONE clone; `--no-verify` skips it; and
 * the record directory is pruned oldest-first past `RECORD_CAP` files, after which a pruned RED
 * reads as unrecorded.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, chmodSync, renameSync, unlinkSync, readdirSync, mkdirSync } from "node:fs";
import { join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { realpathSync } from "node:fs";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..");

/* This file's own path.  `installCopy()` copies THE RUNNING SCRIPT rather than reading
   `<repo>/tools/pushguard.mjs`, so the clone-wide copy is always a copy of a pushguard
   that actually ran, and never depends on the installing tree's layout. */
const SELF = fileURLToPath(import.meta.url);

/* ------------------------------------------------------------------ writeAtomic
 *
 * EVERY WRITE TO THE SHARED MACHINERY IS A RENAME, NOT A TRUNCATE-AND-WRITE, AND THE
 * REASON IS A SIBLING'S SESSION RATHER THAN THIS ONE'S.  The hook file in the common dir
 * is read by git on EVERY push from EVERY worktree of this clone, and this project runs up
 * to eight worktrees at once — two were pushing through it while this was written.
 * `writeFileSync` truncates and then fills, so a push landing inside that window execs a
 * HALF-WRITTEN shell script: a `/bin/sh` syntax error, a non-zero exit, and a refused push
 * **in a session that changed nothing and has no way to attribute it**.  `rename(2)` is
 * atomic within a filesystem, so a concurrent reader gets the whole old file or the whole
 * new one and never a torn one.  The temp name carries the pid so two installers racing
 * each other cannot share a scratch path.
 *
 * It is a small cost for a failure that would surface as somebody else's defect. */
function writeAtomic(path, content, mode) {
  const tmp = `${path}.tmp-${process.pid}`;
  try {
    writeFileSync(tmp, content);
    if (mode !== undefined) chmodSync(tmp, mode);
    renameSync(tmp, path);
  } catch (e) {
    try { if (existsSync(tmp)) unlinkSync(tmp); } catch { /* best effort */ }
    throw e;
  }
}

/* The marker is how `install()` tells OUR hook from somebody else's.  It carries a
   version so a later change to the shim can replace an older one of ours without
   ever touching a hook this project did not write. */
export const HOOK_MARKER = "bio-pushguard";
export const HOOK_VERSION = 2;

/* The clone-wide copy of this script, kept beside the hook's own directory in the git
   COMMON dir.  `.git/` is not a novel place for this project to keep state — `mintid.mjs`
   has kept `.git/bio-idalloc` there since M0-17, and `.git/bio-machine` sits beside it —
   so this follows an established `bio-*` convention rather than inventing one. */
export const COPY_NAME = "bio-pushguard.mjs";

/* THE SHIM CARRIES NO ABSOLUTE PATH, AND THAT IS THE POINT — see "the arm that
   would not have armed" above.  One hook file serves every worktree of the clone,
   so it must resolve the PUSHING worktree at push time.

   ------------------------------------------------------------------ v2, AND D-406
 *
 * v1 resolved ONE source — the pushing worktree's own `tools/pushguard.mjs` — and
 * degraded OPEN when it was absent.  **That made the guard INACTIVE in every checkout
 * whose commit predates M0-56**, which D-406 measured at 6 of 9 worktrees INCLUDING THE
 * MAIN CHECKOUT, and re-measured here at 5 of 15 with the main checkout still among them.
 * The hook FIRES everywhere (it lives in the shared common dir); it simply found nothing
 * to run and said so in one stderr line in the middle of push output nobody diffs.
 *
 * **THAT IS WORSE THAN NO GUARD, WHICH IS WHY IT WAS WORTH FIXING BEFORE ANYTHING ELSE.**
 * A guard believed to protect and silently inactive CHANGES BEHAVIOUR: sessions stop
 * checking the thing themselves because the mechanism has it.  And the absence and the
 * presence of the guard produce the SAME VISIBLE OUTCOME — a successful push.
 *
 * ------------------------------------------------------------------ TWO SOURCES, AND THE ORDER IS THE FIX
 *
 *   1. the PUSHING worktree's own tracked `tools/pushguard.mjs`, when it has one;
 *   2. otherwise the clone-wide copy in the git common dir.
 *
 * **THE ORDER IS DELIBERATE AND IT IS A DEPARTURE FROM D-406's RECOMMENDED SHAPE**, which
 * said to exec the common-dir copy and fall back to the worktree.  Three reasons, and the
 * first is the one that decides it:
 *
 *   - **WORKTREE-FIRST CANNOT REGRESS A CHECKOUT THAT ALREADY WORKS.**  It is a strict
 *     superset of v1: every tree carrying its own copy behaves byte-identically to before,
 *     and only the trees that are unguarded TODAY change at all — where the downside is
 *     bounded below by "no worse than now".  Common-first would change behaviour in 10 of
 *     15 live checkouts at once, mid-wave, including for the two siblings pushing through
 *     this hook right now.  D-406's own warning is against trading a silent gap for a loud
 *     blockage; common-first maximises the blast radius of any defect in this change and
 *     worktree-first minimises it.
 *   - **THE REPOSITORY IS THE CHANNEL.**  The tracked script is the artifact that was
 *     reviewed, gated and merged.  The common-dir copy is an unversioned cache written by
 *     whichever worktree last ran `plancheck` — arbitrary, invisible to `git status`, and
 *     reviewed by nobody.  Preferring the cache over the tracked file would make the
 *     guard's behaviour depend on a file outside the channel.
 *   - **A WORKTREE DEVELOPING THE GUARD MUST RUN ITS OWN COPY**, or its arms measure a
 *     sibling's build instead of its own — the arm-that-did-not-arm class.
 *
 * The honest cost of choosing this order, stated rather than omitted: a FIX to the guard
 * propagates to the old checkouts only when some worktree next runs `plancheck`, instead of
 * instantly.  That is a real property of the cache and it is accepted, because a guard whose
 * behaviour differs from its reviewed source is the worse of the two.
 *
 * It STILL degrades open when neither source exists, and still SAYS SO — a guard that
 * silently waved a push through would be the unearned-absence class this estate is pointed at.
 *
 * ------------------------------------------------------------------ M0-99: THE SHIM IS LEFT BYTE-IDENTICAL, ON PURPOSE
 *
 * Its third comment line still says the hook refuses a stale `docs/DECIDED.md`.  That is
 * true of every checkout whose commit predates M0-99 — the shim runs the PUSHING worktree's
 * own script, and theirs still has the arm — and false of every checkout after it.  Changing
 * one byte of the text means one of two costs, measured at the code rather than guessed:
 * at the SAME `HOOK_VERSION`, every `plancheck` run in an older checkout rewrites the shared
 * hook back (`install()` replaces our own hook when its bytes differ) and every run in a newer
 * one rewrites it forward — a flapping hook in the one file every worktree shares; at a
 * HIGHER version, `install()` in an older checkout answers `newer`, which that checkout's
 * `plancheck` reports as "push guard NOT armed", a false warning in every lane until each
 * carries this landing.  The comment is corrected at the next change that bumps the shim for
 * its BEHAVIOUR, once the older checkouts have gone (and this `plancheck` now reports `newer`
 * as armed, so that bump warns nobody who carries M0-99). */
export function shim() {
  return [
    "#!/bin/sh",
    `# ${HOOK_MARKER} v${HOOK_VERSION} — installed by tools/pushguard.mjs (M0-56, extended by D-406).`,
    "# GENERATED, NEVER HAND-EDITED. Re-installed by `node tools/plancheck.mjs`.",
    "# It refuses a push whose `docs/DECIDED.md` is stale. It writes nothing tracked.",
    "#",
    "# Source 1: the PUSHING worktree's own tracked copy, which is authoritative when present.",
    "# Source 2: the clone-wide copy in the git common dir, for a checkout whose commit",
    "#           predates the guard and so does not carry the script at all (D-406).",
    "top=$(git rev-parse --show-toplevel 2>/dev/null)",
    'if [ -n "$top" ] && [ -f "$top/tools/pushguard.mjs" ]; then',
    '  exec node "$top/tools/pushguard.mjs" --run',
    "fi",
    "common=$(git rev-parse --git-common-dir 2>/dev/null)",
    `if [ -n "$common" ] && [ -f "$common/${COPY_NAME}" ]; then`,
    `  exec node "$common/${COPY_NAME}" --run`,
    "fi",
    `echo "${HOOK_MARKER}: no guard script in \${top:-this tree} or the git common dir — this push is NOT guarded" >&2`,
    "exit 0",
    "",
  ].join("\n");
}

function git(args, cwd) {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch { return null; }
}

/* ------------------------------------------------------------------ hooksDir
 *
 * WHERE GIT ACTUALLY READS HOOKS, asked of git rather than assumed.  `core.hooksPath`
 * wins when set; otherwise it is `<common dir>/hooks`.  The COMMON dir, never
 * `--git-dir`: `--git-dir` in a worktree answers `.git/worktrees/<name>`, which git
 * does NOT read hooks from, so installing there would produce a file and no guard.
 * `mintid.mjs` pays for the same distinction one directory over and has an arm on it. */
export function hooksDir({ repo = REPO } = {}) {
  const configured = git(["config", "--get", "core.hooksPath"], repo);
  if (configured) {
    const p = isAbsolute(configured) ? configured : join(repo, configured);
    return { dir: p, source: "core.hooksPath", configured };
  }
  const common = git(["rev-parse", "--git-common-dir"], repo);
  if (!common) return { dir: null, source: "none", configured: null };
  const abs = isAbsolute(common) ? common : join(repo, common);
  return { dir: join(abs, "hooks"), source: "git-common-dir", configured: null };
}

/* ------------------------------------------------------------------ install
 *
 * IDEMPOTENT BY CONSTRUCTION: it writes only when the bytes differ, so a tree whose
 * hook is current is not touched at all.  M0-56's over-strictness arm asks that a
 * clean tree stay clean; this keeps the hook file's mtime still as well, which is
 * strictly more than was asked and costs one comparison.
 *
 * IT NEVER CLOBBERS A HOOK IT DID NOT WRITE.  A `pre-push` without our marker
 * belongs to the operator or to a tool this project does not own, and overwriting it
 * would be this file taking a decision that is not its to take.  It reports `foreign`
 * and the caller SAYS so — an install that did not happen must not read as one that did.
 */
export function install({ repo = REPO, dryRun = false } = {}) {
  const h = hooksDir({ repo });
  if (!h.dir) {
    return { ok: false, action: "no-git", path: null,
             reason: "git could not name a hooks directory (not a repository?)" };
  }
  if (!existsSync(h.dir)) {
    /* A configured hooksPath that does not exist is the operator's business.  We do
       not create it: a directory conjured under someone's configured path is a change
       to their setup, and a guard is not worth that. */
    return { ok: false, action: "no-hooks-dir", path: h.dir, source: h.source,
             reason: h.source === "core.hooksPath"
               ? `core.hooksPath is set to ${h.configured} and that directory does not exist`
               : `${h.dir} does not exist` };
  }
  const path = join(h.dir, "pre-push");
  const want = shim();
  if (existsSync(path)) {
    const have = readFileSync(path, "utf8");
    if (have === want) return { ok: true, action: "current", path, source: h.source };
    if (!have.includes(HOOK_MARKER)) {
      return { ok: false, action: "foreign", path, source: h.source,
               reason: `a pre-push hook exists at ${path} and is NOT ours — refusing to overwrite it` };
    }
    /* ---------------------------------------------------------------- NEVER DOWNGRADE
     *
     * MEASURED IN THE WILD, ON THIS CLONE, WHILE D-406 WAS BEING CLOSED.  The hook is ONE
     * file shared by every worktree, and `plancheck` rewrites it on every run from whichever
     * worktree happens to be gating.  A sibling running an OLDER checkout therefore reinstalls
     * an OLDER shim over a newer one: v2 was installed at 19:32:43 and was back to v1 by
     * 19:41:18, which silently returned five checkouts to being unguarded.
     *
     * **IT IS D-406's OWN CLASS ONE LEVEL UP** — the guard's live behaviour depending on which
     * checkout last ran a gate, rather than on what was merged — and it is invisible, because
     * a reverted hook and a current one both produce a successful push.
     *
     * **WHAT THIS CAN AND CANNOT DO, STATED PRECISELY BECAUSE THE DIFFERENCE IS THE WHOLE
     * POINT: it CANNOT stop a v1 installer, because the overwriting code lives in the OTHER
     * checkout and no edit here can reach it.** The v1<->v2 flapping closes only when this
     * lands on `main` and the worktrees carry it. What this DOES is stop the NEXT one: once
     * every installer is v2 or later, an older worktree can no longer silently downgrade a
     * newer hook, and it says so rather than reporting a successful install. */
    const haveVersion = Number((have.match(/bio-pushguard v(\d+)/) || [])[1]);
    if (Number.isFinite(haveVersion) && haveVersion > HOOK_VERSION) {
      return { ok: true, action: "newer", path, source: h.source, installedVersion: haveVersion,
               reason: `the installed hook is v${haveVersion} and this installer writes v${HOOK_VERSION}`
                     + ` — LEFT ALONE rather than downgraded (this checkout is older than the hook)` };
    }
    if (dryRun) return { ok: true, action: "would-replace", path, source: h.source };
    writeAtomic(path, want, 0o755);
    return { ok: true, action: "replaced", path, source: h.source };
  }
  if (dryRun) return { ok: true, action: "would-install", path, source: h.source };
  writeAtomic(path, want, 0o755);
  return { ok: true, action: "installed", path, source: h.source };
}

/* ------------------------------------------------------------------ commonDir
 *
 * The git COMMON dir — the one directory every worktree of a clone shares, and the same
 * insight that put the hook there in the first place.  Resolved through git rather than
 * assumed, and made absolute against `repo` because git answers a RELATIVE `.git` from a
 * main checkout and an ABSOLUTE path from a linked worktree (measured both ways). */
export function commonDir({ repo = REPO } = {}) {
  const common = git(["rev-parse", "--git-common-dir"], repo);
  if (!common) return null;
  return isAbsolute(common) ? common : join(repo, common);
}

/* ------------------------------------------------------------------ THE VERDICT RECORD (D-293)
 *
 * ONE FILE PER RUN, NEVER A FILE PER TREE THAT RUNS APPEND TO.  Up to eight worktrees gate at
 * once and two of them can sit on the same tree; a read-modify-write of one shared file would
 * lose a run to the race, and the run it loses could be the RED.  A run file's name is
 * `<tree>.<epoch ms, 13 digits>.<pid>.json`, unique by construction, written by RENAME
 * (`writeAtomic`), so a reader sees a whole run or none.  Nothing here writes the working tree.
 *
 * THE KEY IS THE TREE (`<rev>^{tree}`), NEVER THE COMMIT — see "HOW A LIAR PASSES IT" above. */
export const RECORD_DIR = "bio-gates";
/* M0-107: version 2 records a third verdict, NOT MEASURED, and steps that carry `timedOut` and `unmeasured`.
   A version-1 reader (an older guard, or the clone-wide copy) files a NOT MEASURED record as UNREADABLE and
   says UNDETERMINED without refusing: the safe direction, measured by the M0-107 worker. */
export const RECORD_VERSION = 2;
export const VERDICTS = ["GREEN", "RED", "NOT MEASURED"];
export const RECORD_CAP = 2000;
const RECORD_NAME = /^([0-9a-f]{40}|[0-9a-f]{64})\.(\d{13})\.(\d+)\.json$/;

export function recordDir({ repo = REPO } = {}) {
  const c = commonDir({ repo });
  return c ? join(c, RECORD_DIR) : null;
}

export function treeOf(rev, { repo = REPO } = {}) {
  return git(["rev-parse", "--verify", "--quiet", `${rev}^{tree}`], repo) || null;
}

/* Every run recorded for ONE tree, oldest first.  A file that will not parse, or parses into
   something that is not a run for this tree, is returned in `unreadable` — NAMED, never read as
   absent: an unreadable record and no record are different findings. */
export function readRuns({ repo = REPO, tree, dir = null } = {}) {
  const d = dir || recordDir({ repo });
  const out = { runs: [], unreadable: [], dir: d };
  if (!d || !tree || !existsSync(d)) return out;
  let names = [];
  try { names = readdirSync(d); } catch (e) { out.unreadable.push(`${d} (${e.message})`); return out; }
  for (const n of names) {
    const m = RECORD_NAME.exec(n);
    if (!m || m[1] !== tree) continue;
    const file = join(d, n);
    try {
      const r = JSON.parse(readFileSync(file, "utf8"));
      if (r && r.tree === tree && VERDICTS.includes(r.verdict) && Array.isArray(r.steps))
        out.runs.push({ ...r, file, stamp: Number(m[2]) });
      else out.unreadable.push(file);
    } catch { out.unreadable.push(file); }
  }
  out.runs.sort((a, b) => a.stamp - b.stamp || a.file.localeCompare(b.file));
  return out;
}

/* Write one run.  `run` carries at least { tree, verdict, class, steps: [{ label, units, ok }] }.
   Pruned oldest-first past `cap` files, and ONLY files whose names this module writes. */
export function appendRun({ repo = REPO, run, now = Date.now(), cap = RECORD_CAP } = {}) {
  const d = recordDir({ repo });
  if (!d) return { ok: false, reason: "git could not name a common directory" };
  if (!run || !RECORD_NAME.test(`${run.tree}.${"0".repeat(13)}.0.json`))
    return { ok: false, reason: `not a tree sha: ${run && run.tree}` };
  mkdirSync(d, { recursive: true });
  const path = join(d, `${run.tree}.${String(now).padStart(13, "0")}.${process.pid}.json`);
  writeAtomic(path, `${JSON.stringify({ v: RECORD_VERSION, ...run }, null, 1)}\n`);
  let pruned = 0;
  try {
    const names = readdirSync(d).filter((n) => RECORD_NAME.test(n))
      .sort((a, b) => Number(RECORD_NAME.exec(a)[2]) - Number(RECORD_NAME.exec(b)[2]));
    for (const n of names.slice(0, Math.max(0, names.length - cap))) {
      try { unlinkSync(join(d, n)); pruned++; } catch { /* a sibling pruned it first */ }
    }
  } catch { /* pruning is housekeeping; the run is already written */ }
  return { ok: true, path, pruned };
}

/* A step's UNITS say what it re-ran: `plane:<suite>`, `fleet:<member>/<suite>`, `ui:<suite>`,
   `uicheck:<check>`, `coverage`, `plancheck`, and the wildcards `plane:*`, `fleet:*`, `ui:*`
   (the whole UI harness, its checks included). */
export function unitCovers(have, want) {
  if (have === want) return true;
  if (have === "ui:*") return want.startsWith("ui:") || want.startsWith("uicheck:");
  if (have.endsWith(":*")) return want.startsWith(have.slice(0, -1));
  return false;
}

/* THE VERDICT OF A TREE IS NOT ITS LAST RUN.  A RED stays RED until what FAILED has been re-run
   GREEN on the same tree: a failing step opens its units, a passing step closes every open unit
   it covers, and a GREEN FULL run — which re-ran everything the gate knows — closes all.  So a
   flaky suite re-run green clears, and a NARROWER class cannot clear a WIDER failure (a TARGETED
   run over two suites does not answer a battery that failed as a whole). */
/* M0-107 (BOB #28, 2026-09-22): A STEP WHOSE BUDGET EXPIRED MEASURED NOTHING. It neither opens a RED nor
   closes one; its units (the suites the battery named, else the step's own) stay UNMEASURED until a later
   passing step covers them or a GREEN FULL run closes all. RED outranks NOT MEASURED outranks GREEN, so a
   tree whose only open business is unmeasured reads NOT MEASURED: never refused, never GREEN — it licenses
   no `--since` and meets no GREEN FULL test (M0-106). */
export function effectiveVerdict(runs) {
  if (!runs || !runs.length) return { verdict: null, open: [], unmeasured: [], redRuns: [], last: null };
  const open = new Map();
  const unmeasured = new Map();
  for (const r of runs) {
    if (r.verdict === "GREEN" && r.class === "FULL") { open.clear(); unmeasured.clear(); continue; }
    let failed = 0, timedOut = 0;
    for (const s of r.steps || []) {
      const units = Array.isArray(s.units) && s.units.length ? s.units : [`step:${s.label}`];
      if (s.timedOut) {
        timedOut++;
        const um = Array.isArray(s.unmeasured) && s.unmeasured.length ? s.unmeasured : units;
        for (const u of um) unmeasured.set(u, r);
        continue;
      }
      if (s.ok) {
        for (const u of [...open.keys()]) if (units.some((h) => unitCovers(h, u))) open.delete(u);
        for (const u of [...unmeasured.keys()]) if (units.some((h) => unitCovers(h, u))) unmeasured.delete(u);
      }
      else { failed++; for (const u of units) open.set(u, r); }
    }
    /* A RED naming no failing step is a verdict with no cause attached; only a GREEN FULL run
       answers it. A NOT MEASURED naming no timed-out step is the same shape one rank down. */
    if (r.verdict === "RED" && !failed) open.set(`run:${r.stamp}`, r);
    if (r.verdict === "NOT MEASURED" && !timedOut) unmeasured.set(`run:${r.stamp}`, r);
  }
  return { verdict: open.size ? "RED" : unmeasured.size ? "NOT MEASURED" : "GREEN", open: [...open.keys()],
           unmeasured: [...unmeasured.keys()],
           redRuns: [...new Set(open.values())], last: runs[runs.length - 1] };
}

/* The refs a push offers on the hook's stdin, deletions dropped (a deletion publishes no tree). */
export function pushedRefs(stdin) {
  const out = [];
  for (const line of String(stdin || "").split("\n")) {
    const [localRef, localSha, remoteRef] = line.trim().split(/\s+/);
    if (!localRef || !localSha || /^0+$/.test(localSha)) continue;
    out.push({ localRef, localSha, remoteRef: remoteRef || null });
  }
  return out;
}

/* THE LOOKUP: every pushed tip's TREE, against the record.  It speaks only for the refs offered —
   a push offering none publishes nothing to refuse. */
export function gateVerdictCheck({ repo = REPO, stdin = "" } = {}) {
  const dir = recordDir({ repo });
  const red = [], green = [], notMeasured = [], unreadable = [];
  for (const r of pushedRefs(stdin)) {
    const tree = treeOf(r.localSha, { repo });
    if (!tree) continue;
    const got = readRuns({ repo, tree, dir });
    unreadable.push(...got.unreadable);
    const eff = effectiveVerdict(got.runs);
    if (eff.verdict === "RED") red.push({ ...r, tree, eff });
    else if (eff.verdict === "GREEN") green.push({ ...r, tree, eff });
    /* M0-107: NOT MEASURED is SAID and never refused — the gate measured nothing there to refuse on. */
    else if (eff.verdict === "NOT MEASURED") notMeasured.push({ ...r, tree, eff });
  }
  return { ok: red.length === 0, red, green, notMeasured, unreadable, dir };
}

/* ------------------------------------------------------------------ M0-114: THE CHECK ON THE COMMIT
 *
 * A local record (above) lives in ONE clone's git directory, so no other session can read it and a
 * cloud session starts with none (TREE-SHARING.md §3 as revised by §4, BOB #28). The gate therefore
 * also runs on GitHub's machines (`.github/workflows/gates.yml`) and leaves its verdict ON THE COMMIT:
 * the job's check run, named `gate`, carrying ONE annotation titled `gate verdict` in the grammar
 *
 *     VERDICT=<GREEN|RED|NOT MEASURED|UNDETERMINED> TREE=<40 hex> CLASS=<c> EXIT=<n> WALL=<s>s FAILED=<suites|none>
 *
 * which the workflow writes from the gate's OWN `RECORDED` line — never from the job's exit alone.
 *
 * WHAT REFUSES, AND WHY NOTHING ELSE DOES. A push is refused on the check only when ALL hold: the
 * latest completed `gate` check run on the pushed commit concluded `failure`, its annotation says RED,
 * and the annotation's TREE is the pushed commit's tree (D-293 keys by the tree). A failed job with no
 * verdict annotation is a job that died before the gate recorded (npm, a crash, a cancel, a timeout):
 * it measured nothing, and says UNDETERMINED. NOT MEASURED (M0-107) is said and never refused. A
 * check still running, no check, no GitHub remote, or an API that cannot be read are each SAID, in
 * those words, and never refuse: a guard that blocked every push over its own I/O would be switched
 * off within a day (the rule `run` already states for the local record).
 *
 * THE LIMITS, STATED. It reads the commit's checks, so a DIFFERENT commit with the same tree (a
 * rebase that changed nothing) finds none and says so; it reads the `origin` remote's repository (the
 * hook's shim passes no remote argument, and it is left byte-identical); a job's annotation is
 * written by the workflow, so a workflow edited to lie is a liar this arm cannot see (the check is a
 * record of what the runner printed, like the local record). Transport is `curl`, synchronous and
 * bounded (`CHECK_TIMEOUT_S`); `BIO_GITHUB_API` names another API base, and a `file://` base reads a
 * fixture tree laid out as the API's paths — the seam `bio-plane/test/pushguard-check.test.mjs`
 * drives the hook through. `BIO_PUSHGUARD_CHECKS=off` skips the arm and says so. */
export const CHECK_NAME = "gate";
export const CHECK_ANNOTATION_TITLE = "gate verdict";
export const CHECK_TIMEOUT_S = 8;
const CHECK_VERDICTS = ["GREEN", "RED", "NOT MEASURED", "UNDETERMINED"];

/* One annotation message -> { verdict, tree, cls, exit, failed }, or null when it is not the grammar. */
export function parseVerdictAnnotation(message) {
  const m = /^VERDICT=(GREEN|RED|NOT MEASURED|UNDETERMINED) TREE=([0-9a-f]{40}|[0-9a-f]{64}) CLASS=(\S+) EXIT=(-?\d+)(?: WALL=(\d+)s)?(?: FAILED=(.*))?$/
    .exec(String(message || "").trim());
  if (!m || !CHECK_VERDICTS.includes(m[1])) return null;
  const failed = (m[6] || "none").trim();
  return { verdict: m[1], tree: m[2], cls: m[3], exit: Number(m[4]), wall: m[5] ? Number(m[5]) : null,
           failed: failed === "none" ? [] : failed.split(/[\s,]+/).filter(Boolean) };
}

/* `owner/repo` of a GitHub remote URL, or null. */
export function githubSlug(url) {
  const m = /github\.com[:/]+([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/.exec(String(url || "").trim());
  return m ? `${m[1]}/${m[2]}` : null;
}

/* GET one API path through curl. { ok, json } or { ok: false, reason }. The token, when the
   environment carries one, goes in on stdin as curl config, never on the command line. */
export function githubGet(path, { base = process.env.BIO_GITHUB_API || "https://api.github.com",
                                  token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "" } = {}) {
  const url = `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  const cfg = token && !url.startsWith("file:") ? `header = "Authorization: Bearer ${token}"\n` : "";
  const r = spawnSync("curl", ["-sS", "--max-time", String(CHECK_TIMEOUT_S), "-H", "Accept: application/vnd.github+json",
    "-w", "\n%{http_code}", "--config", "-", url], { input: cfg, encoding: "utf8" });
  if (r.error) return { ok: false, reason: `curl could not run (${r.error.code || r.error.message})` };
  const out = String(r.stdout || "");
  const nl = out.lastIndexOf("\n");
  const code = out.slice(nl + 1).trim();
  const body = out.slice(0, nl);
  if (r.status !== 0) return { ok: false, reason: `curl exit ${r.status}${r.stderr ? `: ${String(r.stderr).trim().slice(0, 160)}` : ""}` };
  if (!url.startsWith("file:") && code !== "200") return { ok: false, code, reason: `HTTP ${code} for ${path}` };
  try { return { ok: true, json: JSON.parse(body) }; }
  catch { return { ok: false, reason: `unparseable JSON for ${path}` }; }
}

/* The verdict the GitHub check carries for ONE commit whose tree is `tree`.
   state: GREEN | RED | NOT MEASURED | UNDETERMINED | PENDING | NONE; `refuse` is true only for RED. */
export function githubCheckVerdict({ slug, sha, tree, get = githubGet } = {}) {
  const say = (state, why, extra = {}) => ({ state, why, refuse: false, sha, tree, ...extra });
  if (!slug) return say("NONE", "no GitHub remote named origin");
  const cr = get(`repos/${slug}/commits/${sha}/check-runs`);
  /* 422 is GitHub's "No commit found for SHA": a commit this push is about to publish for the first
     time, which no check can have run on yet — measured live on the first push of `812df0d7`. */
  if (!cr.ok && cr.code === "422") return say("NONE", `commit ${sha.slice(0, 8)} is not on GitHub yet, so no check has run on it`);
  if (!cr.ok) return say("UNDETERMINED", `the check runs could not be read (${cr.reason})`);
  const runs = (cr.json && Array.isArray(cr.json.check_runs) ? cr.json.check_runs : [])
    .filter((c) => c && c.name === CHECK_NAME && c.head_sha === sha);
  if (!runs.length) return say("NONE", `no \`${CHECK_NAME}\` check on commit ${sha.slice(0, 8)}`);
  const done = runs.filter((c) => c.status === "completed")
    .sort((a, b) => String(a.completed_at || "").localeCompare(String(b.completed_at || "")) || (a.id - b.id));
  if (!done.length) return say("PENDING", `the \`${CHECK_NAME}\` check on ${sha.slice(0, 8)} has not completed`, { url: runs[0].html_url });
  const run = done[done.length - 1];
  const extra = { url: run.html_url, conclusion: run.conclusion, checkRunId: run.id };
  const an = get(`repos/${slug}/check-runs/${run.id}/annotations`);
  if (!an.ok) return say("UNDETERMINED", `the check's annotations could not be read (${an.reason})`, extra);
  const notes = (Array.isArray(an.json) ? an.json : []).filter((a) => a && a.title === CHECK_ANNOTATION_TITLE);
  const parsed = notes.map((a) => parseVerdictAnnotation(a.message)).filter(Boolean);
  if (!parsed.length)
    return say("UNDETERMINED", `the check concluded ${run.conclusion} with no \`${CHECK_ANNOTATION_TITLE}\` annotation — it measured nothing this guard can read`, extra);
  if (parsed.length > 1) return say("UNDETERMINED", `${parsed.length} verdict annotations on one check run`, extra);
  const v = parsed[0];
  if (v.tree !== tree) return say("UNDETERMINED", `the check's verdict is for tree ${v.tree.slice(0, 8)}, not the pushed tree ${String(tree).slice(0, 8)}`, extra);
  const agrees = (v.verdict === "GREEN") === (run.conclusion === "success");
  if (!agrees) return say("UNDETERMINED", `the annotation says ${v.verdict} but the check concluded ${run.conclusion}`, extra);
  if (v.verdict === "RED") return { ...say("RED", `the check concluded failure and its gate recorded RED`, { ...extra, verdict: v }), refuse: true };
  return say(v.verdict, `the check's gate recorded ${v.verdict} (class ${v.cls})`, { ...extra, verdict: v });
}

/* Every pushed ref's commit, against its GitHub check. { ok, red, said }: `said` is one line per ref. */
export function checkVerdicts({ repo = REPO, stdin = "", env = process.env, get = githubGet } = {}) {
  if (String(env.BIO_PUSHGUARD_CHECKS || "").toLowerCase() === "off")
    return { ok: true, red: [], said: ["GitHub check NOT READ (BIO_PUSHGUARD_CHECKS=off)"] };
  const slug = githubSlug(git(["remote", "get-url", "origin"], repo));
  const red = [], said = [];
  for (const r of pushedRefs(stdin)) {
    const tree = treeOf(r.localSha, { repo });
    if (!tree) continue;
    const v = githubCheckVerdict({ slug, sha: r.localSha, tree, get });
    if (v.refuse) red.push({ ...r, check: v });
    else said.push(`GitHub check for ${r.localRef} (${r.localSha.slice(0, 8)}): ${v.state} — ${v.why}`);
  }
  return { ok: red.length === 0, red, said };
}

export function checkRefusal(cv) {
  const L = ["", `  PUSH REFUSED — ${HOOK_MARKER}`, "",
    "  THE GATE ON GITHUB'S MACHINES RECORDED THIS TREE RED (M0-114). The `gate` check on the pushed",
    "  commit concluded failure, and its verdict annotation names this tree:", ""];
  for (const r of cv.red) {
    const v = r.check.verdict;
    L.push(`      ${r.localRef} -> commit ${r.localSha.slice(0, 8)}, tree ${r.check.tree.slice(0, 8)}`);
    L.push(`      RED · class ${v.cls} · exit ${v.exit} · failed: ${v.failed.length ? v.failed.join(", ") : "no suite named"}`);
    if (r.check.url) L.push(`      check: ${r.check.url}`);
    L.push("");
  }
  L.push("  Fix what failed and commit (a new commit gets its own check), or re-run the check if it was",
         "  a flake: the LATEST completed `gate` run on the commit is the one read.", "");
  return L.join("\n");
}

/* ------------------------------------------------------------------ installCopy — D-406
 *
 * THE CLONE-WIDE COPY.  `install()` puts ONE hook where git reads hooks for every worktree;
 * this puts ONE SCRIPT where that hook can always find it.  Together they make the guard as
 * checkout-independent as the hook already was, which is the whole of D-406.
 *
 * **IT IS A CACHE, NOT THE ARTIFACT, AND THE DIFFERENCE IS LOAD-BEARING.**  The tracked
 * `tools/pushguard.mjs` remains the reviewed source and the shim prefers it everywhere it
 * exists; this copy is consulted ONLY by a checkout that does not carry the script at all.
 * So it can never silently override reviewed code — it can only stand in where the channel
 * has not reached.
 *
 * Idempotent by bytes, like `install()`, so a current copy is not touched and its mtime does
 * not move.  Written by RENAME for the reason `writeAtomic` gives: a sibling's push may be
 * reading it at any instant.  It is NOT chmod +x — nothing execs it directly; the shim runs
 * it through `node`, and a non-executable file is one fewer thing in `.git/` that can be run
 * by accident. */
export function installCopy({ repo = REPO, dryRun = false } = {}) {
  const dir = commonDir({ repo });
  if (!dir) {
    return { ok: false, action: "no-git", path: null,
             reason: "git could not name a common directory (not a repository?)" };
  }
  if (!existsSync(dir)) {
    return { ok: false, action: "no-common-dir", path: dir,
             reason: `${dir} does not exist` };
  }
  const path = join(dir, COPY_NAME);
  const want = readFileSync(SELF, "utf8");
  if (existsSync(path)) {
    if (readFileSync(path, "utf8") === want) return { ok: true, action: "current", path };
    if (dryRun) return { ok: true, action: "would-replace", path };
    writeAtomic(path, want);
    return { ok: true, action: "replaced", path };
  }
  if (dryRun) return { ok: true, action: "would-install", path };
  writeAtomic(path, want);
  return { ok: true, action: "installed", path };
}

/* ------------------------------------------------------------------ check — RETIRED BY M0-99, 2026-09-22
 *
 * `check()` ran `decided.mjs --check` and returned `current`, `stale`, `generator-failed` or
 * `absent`; `run()` refused on the middle two.  It is removed rather than left uncalled: an
 * exported checker nothing calls is a mechanism believed on its existence, and the next reader
 * would wire it back in.  The index is no longer committed, so no push carries a copy to be
 * stale (`plancheck` arm 2b guards that it stays out of the committed tree instead), and
 * `decided.mjs --check` itself now exits 2 saying it is retired. */

/* ------------------------------------------------ THE SINGLE SOURCE OF TRUTH FOR WHAT IS BUILT
 *
 * Added 2026-09-18 by BOB #14 at Bob's direction: *"there must be a single source of truth ...
 * as long as that single source of truth is always kept updated."* `tools/status.mjs --check`
 * re-runs every probe in `docs/architecture/construct-status.json` against the code. A status
 * file that must be REMEMBERED to be updated goes stale exactly as the prose it replaced did,
 * so this is checked where no session can skip it: at the push. Land a table the file calls
 * ABSENT, or delete an op it calls BUILT, and the push names the claim to update. */
export function statusCheck({ repo = REPO, run = null } = {}) {
  const tool = join(repo, "tools/status.mjs");
  if (!existsSync(tool)) {
    return { ok: true, kind: "absent",
             message: `tools/status.mjs is not present in ${repo} — what is built is UNVERIFIED for this push.` };
  }
  const r = run ? run(tool) : spawnSync(process.execPath, [tool, "--check"], { cwd: repo, encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  /* Exit 0 is NOT the verdict; the tool's own completion line is. A check that never ran exits 0
     too (measured 2026-09-18 — a symlinked path made the CLI a no-op), so the absence of
     complaint is refused as evidence here. */
  if (r.status === 0 && /status: \d+ claims, \d+ probes .* 0 drift/.test(out))
    return { ok: true, kind: "current", message: "construct-status.json agrees with the code." };
  if (r.status === 0)
    return { ok: false, kind: "silent", output: out,
             message: "tools/status.mjs --check exited 0 WITHOUT its completion line — it did not run, so nothing was verified." };
  return { ok: false, kind: "drift", output: out,
           message: "THE SOURCE OF TRUTH FOR WHAT IS BUILT DISAGREES WITH THE CODE (tools/status.mjs --check)." };
}

/* ------------------------------------------------ A COMMITTED CONFLICT IS REFUSED AT THE PUSH
 *
 * Added 2026-09-18 by BOB #14 after committing three merge markers to origin/main (0c7e4ed5): a rebase
 * script resolved one conflicted file and `git add -A` swept a second one in unresolved. plancheck's
 * arm 0 finds markers, but it ran AFTER the push. The same scan as plancheck's — line starts only,
 * the sequences BUILT rather than written so this file cannot trip itself — run where it cannot be
 * skipped. A marker is never intentional, so there is no exception. */
export function markerCheck({ repo = REPO, files = null, read = null } = {}) {
  const list = files || (git(["ls-files", "--", ":!*.png", ":!*.jpg", ":!*.pdf", ":!*.gz", ":!*.zip"], repo) || "").split("\n").filter(Boolean);
  const rd = read || ((f) => { try { return readFileSync(join(repo, f), "utf8"); } catch { return null; } });
  const open = "<".repeat(7), mid = "=".repeat(7), close = ">".repeat(7);
  const marked = [];
  for (const f of list) {
    const body = rd(f); if (body === null) continue;
    for (const [i, line] of body.split("\n").entries())
      if (line.startsWith(open + " ") || line === mid || line.startsWith(close + " ")) marked.push(`${f}:${i + 1}`);
  }
  return marked.length ? { ok: false, marked, message: `UNRESOLVED MERGE MARKERS in ${marked.length} place(s) — a conflict was committed, not resolved.` }
                       : { ok: true, marked: [], message: "no merge markers in the tracked tree." };
}

/* ------------------------------------------------ THE DESIGN CORPUS, CHECKED WHERE IT CAN SEE THE COMMIT
 *
 * Added 2026-09-18 by BOB #14 after the SAME defect left `main` red twice in one afternoon: a
 * governed document's body changed while its Status `as of` date did not. corpuscheck's date arm
 * compares against the file's LAST COMMIT, so it cannot fire before the commit exists, and
 * `plancheck --local` skips it — every pre-push run passed, and only the bare run AFTER the push
 * failed. At the push the commit exists, so the check fires in time. The repository's own
 * corpuscheck is run, and its completion line is required, not its exit status. */
export function corpusCheck({ repo = REPO, run = null } = {}) {
  const tool = join(repo, "tools/corpuscheck.mjs");
  if (!existsSync(tool)) {
    return { ok: true, kind: "absent", message: `tools/corpuscheck.mjs is not present in ${repo} — the design corpus is UNVERIFIED for this push.` };
  }
  const r = run ? run(tool) : spawnSync(process.execPath, [tool], { cwd: repo, encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const line = (out.match(/corpuscheck: \d+ governed document\(s\)[^\n]*/) || [])[0];
  if (line && / 0 fail\s*$/.test(line)) return { ok: true, kind: "current", message: "the design corpus front matter is current." };
  return { ok: false, kind: line ? "fail" : "silent", output: out,
           message: line ? "THE DESIGN CORPUS FAILS corpuscheck — most often a Status `as of` the body moved past."
                         : "tools/corpuscheck.mjs ran WITHOUT its completion line — nothing was verified." };
}

/* ------------------------------------------------------------------ scope of the verdict
 *
 * Whether the working tree the checks read is the same thing as the commits being
 * pushed.  See "WHAT IT CHECKS, AND WHAT IT CANNOT".  `docs` and `CLAUDE.md` are the
 * prose corpus.  Until M0-99 they were chosen as `decided.mjs`'s ROOTS, because the
 * index arm read them; that arm is retired, and the scope is kept because `corpuscheck`
 * — the design-corpus arm — reads its documents under `docs/` from the working tree,
 * so a dirty corpus still makes this verdict a verdict about the TREE. */
export const CORPUS_PATHS = ["docs", "CLAUDE.md"];

export function corpusDirty({ repo = REPO } = {}) {
  const r = spawnSync("git", ["status", "--porcelain", "--", ...CORPUS_PATHS],
    { cwd: repo, encoding: "utf8" });
  if (r.status !== 0) return null;
  return r.stdout.trim().length > 0;
}

/* Refs from the hook's stdin: `<local ref> <local sha> <remote ref> <remote sha>`.
   Any local sha that is neither HEAD nor a deletion is a ref this guard did not read,
   and it is NAMED rather than left as a caveat in a comment. */
export function refsNotHead(stdin, headSha) {
  const zero = /^0+$/;
  const out = [];
  for (const line of String(stdin || "").split("\n")) {
    const [localRef, localSha] = line.trim().split(/\s+/);
    if (!localRef || !localSha) continue;
    if (zero.test(localSha)) continue;            /* a deletion pushes no corpus */
    if (headSha && localSha === headSha) continue;
    out.push({ ref: localRef, sha: localSha.slice(0, 8) });
  }
  return out;
}

/* ------------------------------------------------------------------ a push of `coord` ALONE (M0-110)
 *
 * `coord` is the lanes' message board (TREE-SHARING.md §1): a note is pushed there by `tools/coord.mjs write`,
 * from ANY checkout, in the middle of any work. Every check below `gateVerdictCheck` reads the WORKING TREE — the
 * markers, the design corpus, the construct status — which is a verdict about `main`'s tree and says nothing about a
 * note. Run on a coord push, a lane with unrelated drift in its own tree would be refused a claim, which is the
 * contention this branch exists to remove. So a push whose EVERY ref goes to `refs/heads/coord` is judged by what it
 * publishes: no merge marker in the pushed commit's own tree (a marker is never intentional, on either branch). The
 * ledger checks already ran inside the write, before the push. A push naming `coord` beside any other ref is
 * judged the ordinary way, and says so. */
export const COORD_REF = "refs/heads/coord";
export function coordOnly(stdin) {
  const refs = pushedRefs(stdin);
  return refs.length > 0 && refs.every((r) => r.remoteRef === COORD_REF);
}
export function commitMarkerCheck({ repo = REPO, sha }) {
  const open = "<".repeat(7), mid = "=".repeat(7), close = ">".repeat(7);
  const r = spawnSync("git", ["grep", "-n", "-I", "-E", `^(${open} |${mid}$|${close} )`, sha], { cwd: repo, encoding: "utf8", maxBuffer: 1 << 28 });
  /* git grep exits 1 on NO match; anything else but 0 is a grep that did not run, which is not a clean tree. */
  if (r.status === 1) return { ok: true, marked: [] };
  if (r.status !== 0) return { ok: false, marked: [], message: `git grep over ${String(sha).slice(0, 8)} did not run (exit ${r.status}) — UNDETERMINED, refused.` };
  const marked = r.stdout.split("\n").filter(Boolean).map((l) => l.split(":").slice(1, 3).join(":"));
  return { ok: false, marked, message: `UNRESOLVED MERGE MARKERS in ${marked.length} place(s) of the pushed coord commit.` };
}

/* ------------------------------------------------------------------ the D-293 refusal's text
 *
 * It NAMES the record — ref, commit, tree, class, when, what still fails, the file — because a
 * refusal a reader cannot trace to its evidence is one they will learn to route around. */
export function gateRefusal(gv) {
  const s8 = (x) => String(x || "").slice(0, 8);
  const L = ["", `  PUSH REFUSED — ${HOOK_MARKER}`, "",
    "  THE GATE RECORDED THIS TREE RED (D-293). `node tools/gates.mjs` measured the tree this push",
    "  would publish, on a clean checkout, and it did not pass:", ""];
  for (const r of gv.red) {
    L.push(`      ${r.localRef} -> commit ${s8(r.localSha)}, tree ${s8(r.tree)}`);
    for (const run of r.eff.redRuns.slice(0, 3)) {
      const failed = (run.steps || []).filter((s) => !s.ok).map((s) => s.label).join("; ") || "no step named";
      L.push(`      RED · class ${run.class || "?"} · ${run.at || "?"} · measured at commit ${s8(run.head)}`
           + `${run.worktree ? ` in ${run.worktree}` : ""}`);
      L.push(`      failed: ${failed}`);
      if (run.file) L.push(`      record: ${run.file}`);
    }
    L.push(`      still open: ${r.eff.open.slice(0, 12).join(", ")}${r.eff.open.length > 12 ? ` (+${r.eff.open.length - 12} more)` : ""}`);
    L.push("");
  }
  L.push("  The record is keyed by the TREE, not the commit, so amending the message or re-committing",
         "  the same content does not clear it. To clear it:",
         "    - fix what failed and commit: a changed tree carries no verdict until it is gated; or",
         "    - re-run `node tools/gates.mjs` on a clean checkout of THIS tree: a GREEN run that re-runs",
         "      what failed clears the record (a narrower class cannot clear a wider failure).", "");
  return L.join("\n");
}

/* ------------------------------------------------------------------ the hook body */
function run(stdin) {
  const repo = git(["rev-parse", "--show-toplevel"], process.cwd()) || REPO;
  if (coordOnly(stdin)) {
    for (const r of pushedRefs(stdin)) {
      const mk = commitMarkerCheck({ repo, sha: r.localSha });
      if (!mk.ok) {
        const L = ["", `  PUSH REFUSED — ${HOOK_MARKER}`, "", `  ${mk.message}`, "", ...mk.marked.slice(0, 20).map((m) => `      ${m}`), ""];
        process.stderr.write(L.join("\n") + "\n");
        return 1;
      }
    }
    process.stderr.write(`${HOOK_MARKER}: a coord-only push (M0-110) — no merge markers in the pushed commit; `
      + `main's checks (gate record, design corpus, construct status) do not judge a note\n`);
    return 0;
  }
  /* D-293 FIRST: it reads only the pushed commits' trees and the record, never the working tree,
     so nothing a session has left uncommitted can confound it.  A failure to READ the record is
     reported as UNDETERMINED below and never refuses: a guard that blocked every push over its
     own I/O error would be switched off within a day. */
  let gv;
  try { gv = gateVerdictCheck({ repo, stdin }); }
  catch (e) { gv = { ok: true, red: [], green: [], unreadable: [`the gate record (${e.message})`] }; }
  if (!gv.ok) {
    process.stderr.write(gateRefusal(gv) + "\n");
    return 1;
  }
  /* M0-114: the same question asked of the check on the commit, which any clone can read. */
  let cv;
  try { cv = checkVerdicts({ repo, stdin }); }
  catch (e) { cv = { ok: true, red: [], said: [`GitHub check UNDETERMINED (${e.message})`] }; }
  if (!cv.ok) {
    process.stderr.write(checkRefusal(cv) + "\n");
    return 1;
  }
  /* M0-99, 2026-09-22: THE INDEX ARM THAT STOOD HERE IS RETIRED.  It ran `decided.mjs --check`
     and refused a push whose committed `docs/DECIDED.md` was stale; the index is no longer
     committed, so no push carries one (the retired `check()` note above). */
  const dirty = corpusDirty({ repo });
  const head = git(["rev-parse", "HEAD"], repo);
  const strays = refsNotHead(stdin, head);

  const mk = markerCheck({ repo });
  if (!mk.ok) {
    const L = ["", `  PUSH REFUSED — ${HOOK_MARKER}`, "", `  ${mk.message}`, "", ...mk.marked.slice(0, 20).map((m) => `      ${m}`),
      "", "  Resolve each conflict (keep what both sides meant), commit, and push again.", ""];
    process.stderr.write(L.join("\n") + "\n");
    return 1;
  }

  const cc = corpusCheck({ repo });
  if (!cc.ok) {
    const L = ["", `  PUSH REFUSED — ${HOOK_MARKER}`, "", `  ${cc.message}`, ""];
    for (const ln of (cc.output || "").split("\n")) if (/FAIL|fail/.test(ln)) L.push(`      ${ln.trim()}`);
    L.push("", "  Move the named document's Status `as of` to today (one date, at the END of the Status),", "  commit, and push again.", "");
    process.stderr.write(L.join("\n") + "\n");
    return 1;
  }

  const st = statusCheck({ repo });
  if (!st.ok) {
    const L = ["", `  PUSH REFUSED — ${HOOK_MARKER}`, "", `  ${st.message}`, ""];
    for (const ln of (st.output || "").split("\n")) if (ln.trim()) L.push(`      ${ln}`);
    L.push("", "  Update docs/architecture/construct-status.json to what the code now says (and say why in",
           "  the commit), then `node tools/status.mjs --write` and commit. Never delete a probe to pass.", "");
    process.stderr.write(L.join("\n") + "\n");
    return 1;
  }

  const notes = [];
  if (st.kind === "absent") notes.push("tools/status.mjs is absent, so what is built was not verified");
  if (dirty) {
    notes.push("the corpus is DIRTY in the working tree, so this verdict describes the TREE"
             + " and is UNDETERMINED for the commits being pushed");
  }
  if (strays.length) {
    notes.push(`did NOT speak for ${strays.map((s) => `${s.ref}@${s.sha}`).join(", ")}`
             + " — not HEAD, and the checks read the working tree");
  }
  if (cc.kind === "absent") notes.push("tools/corpuscheck.mjs is absent, so the design corpus was not verified");
  /* D-293: a GREEN record is SAID; no record says nothing (the ruled shape); an unreadable one is
     UNDETERMINED, in those words. */
  for (const g of gv.green)
    notes.push(`gate verdict GREEN recorded for ${g.localRef}'s tree ${g.tree.slice(0, 8)} (class ${g.eff.last.class || "?"})`);
  /* M0-107: never refused and never GREEN, in those words. */
  for (const g of gv.notMeasured || [])
    notes.push(`gate verdict NOT MEASURED recorded for ${g.localRef}'s tree ${g.tree.slice(0, 8)} — a budget EXPIRED`
             + ` (M0-107), so ${g.eff.unmeasured.slice(0, 4).join(", ")}${g.eff.unmeasured.length > 4 ? ` (+${g.eff.unmeasured.length - 4} more)` : ""}`
             + " measured nothing; not refused, and NOT GREEN: it licenses no --since");
  notes.push(...cv.said); /* M0-114: every non-refusing check state is SAID, in its own words */
  if (gv.unreadable.length)
    notes.push(`${gv.unreadable.length} gate record file(s) UNREADABLE, so the gate verdict is UNDETERMINED for this push: `
             + gv.unreadable.slice(0, 3).join(", "));
  const tail = notes.length ? ` (${notes.join("; ")})` : "";
  /* M0-99: the line no longer opens `docs/DECIDED.md current` — nothing here reads the index. */
  process.stderr.write(`${HOOK_MARKER}: no merge markers; design corpus current; construct status agrees with the code${tail}\n`);
  return 0;
}

/* ------------------------------------------------------------------ negative control
 *
 * Driven in-process against synthetic runners, so it costs milliseconds and moves
 * nothing on disk.  `bio-plane/test/pushguard.test.mjs` drives the SAME properties
 * through a REAL push to a REAL bare remote, because a store-level check is not
 * evidence that git ever called us — which is the one thing a hook has to prove.
 */
function control() {
  let bad = 0;
  const arm = (ok, label) => { if (!ok) bad++; console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`); };

  /* M0-99, 2026-09-22: the five arms that stood here drove `check()` — `current`, `stale`, a
     broken generator read as `generator-failed` and carrying its own output — and they went
     with it.  What replaces them pins the RETIREMENT: the hook body runs no ruling-index
     generator at all.  A structural pin, cheap by design; the behaviour — a rebase that lands a
     peer's ruling PUSHES — is driven through a real push in `pushguard.test.mjs`. */
  /* Comments stripped first: the body NAMES the retired arm in a comment, and a pin that read
     prose would fail on the note recording the retirement. */
  const body = String(run).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  arm(body.length > 500 && !/decided\.mjs|\bcheck\s*\(/.test(body),
      "M0-99: the hook body consults no ruling-index generator — the retired staleness arm is gone, not idle");

  /* The shim must carry no absolute path, or one hook file would validate the
     installing worktree on behalf of every other one. */
  const s = shim();
  arm(!/\/Users\/|\/home\/|--git-dir/.test(s) && s.includes("--show-toplevel"),
      "the shim resolves the PUSHING worktree and bakes in no absolute path");
  arm(s.includes(HOOK_MARKER), "the shim carries the marker that stops it clobbering a foreign hook");

  const head = "a".repeat(40);
  arm(refsNotHead(`refs/heads/x ${head} refs/heads/x ${"b".repeat(40)}`, head).length === 0,
      "a ref at HEAD is one this guard spoke for");
  arm(refsNotHead(`refs/heads/x ${"c".repeat(40)} refs/heads/x ${"b".repeat(40)}`, head).length === 1,
      "a ref that is NOT HEAD is named rather than silently covered");
  arm(refsNotHead(`refs/heads/x ${"0".repeat(40)} refs/heads/x ${"b".repeat(40)}`, head).length === 0,
      "a DELETION pushes no corpus and is not named");

  /* Idempotence, without writing: two dry runs over the real tree agree. */
  const a = install({ dryRun: true });
  const b = install({ dryRun: true });
  arm(a.action === b.action && a.path === b.path, "install is idempotent (two dry runs agree)");

  /* ---------------------------------------------------------------- D-406 arms
   *
   * The shim must now name BOTH sources, in the order that makes worktree-first true.
   * These are cheap structural pins; the BEHAVIOUR they stand for is driven through a
   * real push from a real pre-guard worktree in `pushguard.test.mjs`, because a shim
   * that merely MENTIONS a fallback is the mechanism-believed-on-its-existence defect. */
  arm(s.includes("--git-common-dir"), "the shim resolves the clone-wide copy through the COMMON dir");
  arm(s.includes(COPY_NAME), `the shim names the fallback copy (${COPY_NAME})`);
  arm(s.indexOf("$top/tools/pushguard.mjs") < s.indexOf(`$common/${COPY_NAME}`),
      "WORKTREE-FIRST: the tracked copy is tried BEFORE the clone-wide cache");
  arm(!/\/Users\/|\/home\/|\/private\//.test(s),
      "the fallback added NO absolute path to the shim (the arm v1 earned, still true)");

  /* The copy is a copy of THE RUNNING SCRIPT, so it can never be a stale sibling build
     of something this process did not run. */
  const c1 = installCopy({ dryRun: true });
  const c2 = installCopy({ dryRun: true });
  arm(c1.action === c2.action && c1.path === c2.path, "installCopy is idempotent (two dry runs agree)");
  arm(!!c1.path && c1.path.endsWith(COPY_NAME), "the copy lands in the common dir under its bio-* name");

  /* ---------------------------------------------------------------- D-293 arms, in-process.
   * The END-TO-END refusal — a real gate, a real record, a real push — is `gates.test.mjs`'s;
   * these pin the verdict rule itself over synthetic runs. */
  const step = (label, units, ok) => ({ label, units, ok });
  const runOf = (verdict, cls, steps, stamp) => ({ verdict, class: cls, steps, stamp });
  arm(effectiveVerdict([]).verdict === null, "no run is NO verdict, not GREEN");
  arm(effectiveVerdict([runOf("RED", "TARGETED", [step("battery", ["plane:a.test.mjs"], false)], 1),
                        runOf("GREEN", "TARGETED", [step("battery", ["plane:a.test.mjs"], true)], 2)]).verdict === "GREEN",
      "a failing suite re-run GREEN on the same tree clears its RED");
  arm(effectiveVerdict([runOf("RED", "FULL", [step("battery (all)", ["plane:*", "fleet:*"], false)], 1),
                        runOf("GREEN", "TARGETED", [step("battery", ["plane:a.test.mjs"], true)], 2)]).verdict === "RED",
      "a NARROWER GREEN cannot clear a WIDER failure");
  arm(effectiveVerdict([runOf("RED", "TARGETED", [step("battery", ["plane:a.test.mjs"], false)], 1),
                        runOf("GREEN", "FULL", [step("battery (all)", ["plane:*", "fleet:*"], true)], 2)]).verdict === "GREEN",
      "a GREEN FULL run clears everything");
  arm(effectiveVerdict([runOf("GREEN", "FULL", [step("battery (all)", ["plane:*"], true)], 1),
                        runOf("RED", "TARGETED", [step("plancheck --local", ["plancheck"], false)], 2)]).verdict === "RED",
      "a RED after a GREEN is RED — the latest failure is not forgiven by an earlier pass");
  arm(effectiveVerdict([runOf("RED", "FULL", [], 1)]).verdict === "RED", "a RED naming no failing step is still RED");
  /* M0-107 (BOB #28): an expired budget measured nothing. RED outranks NOT MEASURED outranks GREEN. */
  const expiredStep = (units, unmeasured) => ({ label: "battery (all)", units, ok: false, timedOut: true, unmeasured });
  const nm = effectiveVerdict([runOf("NOT MEASURED", "FULL",
    [expiredStep(["plane:*", "fleet:*"], ["plane:a.test.mjs"]), step("plancheck --local", ["plancheck"], true)], 1)]);
  arm(nm.verdict === "NOT MEASURED" && nm.open.length === 0 && nm.unmeasured.join() === "plane:a.test.mjs",
      "a run whose only failure is an EXPIRED budget reads NOT MEASURED, opens no RED, and names the unit");
  arm(effectiveVerdict([runOf("NOT MEASURED", "FULL", [expiredStep(["plane:*"], ["plane:a.test.mjs"])], 1),
                        runOf("RED", "TARGETED", [step("battery", ["plane:b.test.mjs"], false)], 2)]).verdict === "RED",
      "RED outranks NOT MEASURED");
  arm(effectiveVerdict([runOf("NOT MEASURED", "FULL", [expiredStep(["plane:*"], ["plane:a.test.mjs"])], 1),
                        runOf("GREEN", "TARGETED", [step("battery", ["plane:a.test.mjs"], true)], 2)]).verdict === "GREEN",
      "an unmeasured suite re-run GREEN on the same tree is measured");
  arm(effectiveVerdict([runOf("GREEN", "TARGETED", [step("battery", ["plane:b.test.mjs"], true)], 1),
                        runOf("NOT MEASURED", "TARGETED", [expiredStep(["plane:a.test.mjs"], [])], 2)]).verdict === "NOT MEASURED",
      "NOT MEASURED outranks GREEN — an unmeasured unit is never read as green");
  arm(effectiveVerdict([runOf("NOT MEASURED", "FULL", [], 1)]).verdict === "NOT MEASURED",
      "a NOT MEASURED naming no timed-out step is still NOT MEASURED");
  arm(unitCovers("ui:*", "uicheck:check-semantics.mjs") && unitCovers("plane:*", "plane:x.test.mjs")
      && !unitCovers("plane:x.test.mjs", "plane:*"), "wildcards cover their members and never the reverse");
  arm(pushedRefs(`refs/heads/x ${"0".repeat(40)} refs/heads/x ${"b".repeat(40)}\nrefs/heads/y ${"c".repeat(40)} refs/heads/y ${"0".repeat(40)}`).length === 1,
      "a deletion offers no tree to refuse; a push does");

  /* M0-114: the check on the commit. The END-TO-END refusal through curl and a real push is
     `bio-plane/test/pushguard-check.test.mjs`'s; these pin the decision over a stubbed API. */
  const T = "1".repeat(40), S = "a".repeat(40);
  const api = (conclusion, msg) => (p) => p.endsWith("/check-runs")
    ? { ok: true, json: { check_runs: [{ id: 1, name: CHECK_NAME, head_sha: S, status: "completed", conclusion, completed_at: "x" }] } }
    : { ok: true, json: msg ? [{ title: CHECK_ANNOTATION_TITLE, message: msg }] : [] };
  arm(githubCheckVerdict({ slug: "o/r", sha: S, tree: T, get: api("failure", `VERDICT=RED TREE=${T} CLASS=FULL EXIT=1`) }).refuse === true,
      "M0-114: a RED verdict for the pushed tree on a failed check refuses");
  arm(githubCheckVerdict({ slug: "o/r", sha: S, tree: T, get: api("failure", null) }).refuse === false,
      "M0-114: a failed check that recorded no verdict measured nothing and does not refuse");
  arm(githubCheckVerdict({ slug: "o/r", sha: S, tree: T, get: api("failure", `VERDICT=RED TREE=${"2".repeat(40)} CLASS=FULL EXIT=1`) }).refuse === false,
      "M0-114: a RED verdict for ANOTHER tree does not refuse (D-293 keys by the tree)");

  console.log(bad ? `\n${bad} FAILED` : "\nall control arms pass");
  return bad ? 1 : 0;
}

/* ------------------------------------------------------------------ main
 *
 * THE ENTRY GUARD IS NOT CEREMONY AND THE RECEIPT IS ONE FILE OVER.  `decided.mjs`
 * carries a comment about `plancheck` importing it and thereby running its CLI
 * against PLANCHECK'S argv — `plancheck --local` became `decided.mjs --local`, a
 * query, which printed "no ruling mentions --local" and exited 0 having checked
 * NOTHING.  `plancheck` imports THIS file too, for exactly the same reason, so it
 * carries exactly the same guard.
 */
const IS_CLI = process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1]);
const arg = IS_CLI ? process.argv[2] : "--module";

if (!IS_CLI) {
  /* imported for `install` / `check` — do nothing */
} else if (arg === "--control") {
  process.exit(control());
} else if (arg === "--run") {
  let stdin = "";
  try { stdin = readFileSync(0, "utf8"); } catch { /* no refs offered; HEAD is all we can speak for */ }
  process.exit(run(stdin));
} else if (arg === "--install") {
  const r = install();
  console.log(`${r.action}${r.path ? ` — ${r.path}` : ""}${r.reason ? ` (${r.reason})` : ""}`);
  /* The copy is part of arming, not an extra: without it the hook is inactive in every
     checkout that predates the guard, which is D-406.  Its failure is reported and is
     NOT silently folded into the hook's status — an install that half happened must not
     read as one that did. */
  const c = installCopy();
  console.log(`copy: ${c.action}${c.path ? ` — ${c.path}` : ""}${c.reason ? ` (${c.reason})` : ""}`);
  process.exit(r.ok && c.ok ? 0 : 1);
} else {
  const h = hooksDir();
  const r = install({ dryRun: true });
  const c = installCopy({ dryRun: true });
  console.log(`hooks dir : ${h.dir || "(none)"}  [${h.source}]`);
  console.log(`pre-push  : ${r.action}${r.reason ? ` — ${r.reason}` : ""}`);
  console.log(`copy      : ${c.action}${c.path ? ` — ${c.path}` : ""}${c.reason ? ` — ${c.reason}` : ""}`);
  console.log(`corpus    : ${corpusDirty() ? "DIRTY in the working tree (a push verdict would be UNDETERMINED)" : "clean against the tree"}`);
  console.log("");
  console.log("  --install   write the pre-push hook AND the clone-wide copy (idempotent; writes to .git/, never to the tree)");
  console.log("  --run       the hook body; refuses a push whose tip tree the gate recorded RED (D-293),");
  console.log("              or that carries merge markers or design-corpus/construct-status drift");
  console.log("  --control   the negative-control arms");
}
