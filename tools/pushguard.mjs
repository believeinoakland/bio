#!/usr/bin/env node
/**
 * pushguard.mjs — M0-56. The `docs/DECIDED.md` index is checked AT THE PUSH,
 * which is the only moment that is after the last prose edit AND after the last
 * rebase.
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
 *   - A `plancheck` ARM THAT REGENERATES INTO A TEMP FILE AND DIFFS.  **THIS IS
 *     NOT A CANDIDATE, BECAUSE IT ALREADY EXISTS** — `plancheck.mjs` arm 2b shells
 *     `decided.mjs --check` and fails with *Run `node tools/decided.mjs`*.  It is
 *     what caught all five occurrences.  It is CORRECT, it is UNTOUCHED by this
 *     file, and M0-56 forbids weakening it.  The defect M0-56 rows is not that
 *     the detector is missing; it is that the detector fires at a moment the
 *     session can still invalidate, and five times it did.
 *
 *   - A `pre-push` HOOK.  The only shape whose moment is after the last rebase.
 *     TAKEN.
 *
 * ------------------------------------------------------------------ IT REFUSES. IT DOES NOT REGENERATE.
 *
 * The hook runs `decided.mjs --check` and REFUSES a stale push, naming the
 * command.  It never writes `docs/DECIDED.md` and never writes anything else in
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
 * ------------------------------------------------------------------ HOW A LIAR PASSES THIS, STATED BEFORE WHAT IT CHECKS
 *
 * The cheapest green is a mechanism that REGENERATES UNCONDITIONALLY AND NEVER
 * REPORTS.  It would pass every arm about staleness, always, and would hide a
 * genuinely broken generator behind its own success.  This file cannot lie that
 * way — it never regenerates — but the property that keeps it honest has to be
 * checked directly rather than inferred from the shape:
 *
 *   **A BROKEN GENERATOR MUST BE DISTINGUISHABLE FROM A STALE INDEX.**  Both exit
 *   non-zero.  A guard that reported them identically would tell a session to run
 *   `decided.mjs` when running `decided.mjs` is the thing that is broken, and the
 *   session would loop.  So `check()` returns `stale` ONLY on `decided.mjs
 *   --check`'s own STALE line, and returns `generator-failed` — carrying the
 *   tool's real output — for every other non-zero exit.  Both REFUSE; they refuse
 *   naming different things.  `--control` drives both.
 *
 * ------------------------------------------------------------------ WHAT IT CHECKS, AND WHAT IT CANNOT
 *
 * `decided.mjs --check` reads the WORKING TREE.  A push sends COMMITS.  Those are
 * the same thing only when the corpus is clean against HEAD, which is the normal
 * state at push time and is CHECKED rather than assumed:
 *
 *   - Corpus clean against HEAD (`git diff HEAD --quiet -- docs CLAUDE.md`): the
 *     tree check IS a HEAD check, and the verdict is exact.
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
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { realpathSync } from "node:fs";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..");

/* The marker is how `install()` tells OUR hook from somebody else's.  It carries a
   version so a later change to the shim can replace an older one of ours without
   ever touching a hook this project did not write. */
export const HOOK_MARKER = "bio-pushguard";
export const HOOK_VERSION = 1;

/* THE SHIM CARRIES NO ABSOLUTE PATH, AND THAT IS THE POINT — see "the arm that
   would not have armed" above.  One hook file serves every worktree of the clone,
   so it must resolve the PUSHING worktree at push time.

   It degrades OPEN when the tool is absent (an old commit checked out, a branch
   from before this landed) — but it SAYS SO on stderr.  A guard that silently
   waved a push through would be the unearned-absence class, which is the defect
   this whole estate is pointed at. */
export function shim() {
  return [
    "#!/bin/sh",
    `# ${HOOK_MARKER} v${HOOK_VERSION} — installed by tools/pushguard.mjs (M0-56).`,
    "# GENERATED, NEVER HAND-EDITED. Re-installed by `node tools/plancheck.mjs`.",
    "# It refuses a push whose `docs/DECIDED.md` is stale. It writes nothing tracked.",
    "top=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0",
    'if [ ! -f "$top/tools/pushguard.mjs" ]; then',
    `  echo "${HOOK_MARKER}: tools/pushguard.mjs absent in $top — this push is NOT guarded" >&2`,
    "  exit 0",
    "fi",
    'exec node "$top/tools/pushguard.mjs" --run',
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
    if (dryRun) return { ok: true, action: "would-replace", path, source: h.source };
    writeFileSync(path, want);
    chmodSync(path, 0o755);
    return { ok: true, action: "replaced", path, source: h.source };
  }
  if (dryRun) return { ok: true, action: "would-install", path, source: h.source };
  writeFileSync(path, want);
  chmodSync(path, 0o755);
  return { ok: true, action: "installed", path, source: h.source };
}

/* ------------------------------------------------------------------ check
 *
 * The verdict, and the reason it has FOUR values rather than two is the liar
 * paragraph above: `stale` and `generator-failed` both exit non-zero from
 * `decided.mjs --check`, and a guard that conflated them would send a session to run
 * the very tool that is broken.
 */
export const STALE_SIGNATURE = "is STALE";

export function check({ repo = REPO, run = null } = {}) {
  const gen = join(repo, "tools/decided.mjs");
  if (!existsSync(gen)) {
    return { ok: true, kind: "absent",
             message: `tools/decided.mjs is not present in ${repo} — the index is UNVERIFIED for this push.` };
  }
  const r = run ? run(gen) : spawnSync(process.execPath, [gen, "--check"],
    { cwd: repo, encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  if (r.status === 0) return { ok: true, kind: "current", message: "docs/DECIDED.md matches the corpus." };
  if (out.includes(STALE_SIGNATURE)) {
    return { ok: false, kind: "stale", output: out,
             message: "docs/DECIDED.md is STALE — the corpus carries rulings the index does not." };
  }
  /* NOT stale — the GENERATOR ITSELF FAILED.  Named separately and carrying its own
     output, because "run decided.mjs" is useless advice when decided.mjs is what broke. */
  return { ok: false, kind: "generator-failed", output: out,
           message: `tools/decided.mjs --check did not run (exit ${r.status}). The GENERATOR failed, `
                  + `not the index — regenerating will not help until it is fixed.` };
}

/* ------------------------------------------------------------------ scope of the verdict
 *
 * Whether the working tree the check read is the same thing as the commits being
 * pushed.  See "WHAT IT CHECKS, AND WHAT IT CANNOT".  `docs` and `CLAUDE.md` are
 * `decided.mjs`'s own ROOTS — the corpus it scans — so a change anywhere else cannot
 * stale the index and is deliberately not consulted. */
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

/* ------------------------------------------------------------------ the hook body */
function run(stdin) {
  const repo = git(["rev-parse", "--show-toplevel"], process.cwd()) || REPO;
  const v = check({ repo });
  const dirty = corpusDirty({ repo });
  const head = git(["rev-parse", "HEAD"], repo);
  const strays = refsNotHead(stdin, head);

  if (!v.ok) {
    const L = [];
    L.push("");
    L.push(`  PUSH REFUSED — ${HOOK_MARKER}`);
    L.push("");
    L.push(`  ${v.message}`);
    L.push("");
    if (v.kind === "stale") {
      L.push("  Run this, commit the result, and push again:");
      L.push("");
      L.push("      node tools/decided.mjs");
      L.push("");
      /* THIS GUARD CANNOT TELL THE TWO CAUSES APART AND MUST NOT PRETEND TO.  It compares
         an index to a corpus; it has no idea whether you edited prose after regenerating
         or a rebase landed a peer's rulings underneath you.  An earlier draft of this
         message asserted the rebase, and driving cause (1) caught it telling a true story
         about the wrong event — the record claiming more than it can support, in the
         message of the mechanism built to stop exactly that. */
      L.push("  IT CAN FIRE WITH GREEN GATES, AND THIS MESSAGE CANNOT TELL YOU WHICH CASE");
      L.push("  YOU ARE IN — it compares an index to a corpus and sees only that they differ:");
      L.push("");
      L.push("    - you regenerated, then edited more prose; or");
      L.push("    - you regenerated, then REBASED, and a peer's commit landed new rulings");
      L.push("      underneath a correct index. NOTHING YOU DID MADE IT STALE.");
      L.push("");
      L.push("  The second is why this check is at the push: it is the only moment that is");
      L.push("  after the last rebase, and no gate before the commit can see it.");
    } else {
      L.push("  This is NOT a stale index and regenerating will not clear it.");
      L.push("  The generator's own output:");
      L.push("");
      for (const ln of (v.output || "").split("\n")) if (ln.trim()) L.push(`      ${ln}`);
    }
    L.push("");
    L.push(`  \`plancheck\` would fail on this too. Pushing it turns \`main\` RED.`);
    L.push("");
    process.stderr.write(L.join("\n") + "\n");
    return 1;
  }

  const notes = [];
  if (dirty) {
    notes.push("the corpus is DIRTY in the working tree, so this verdict describes the TREE"
             + " and is UNDETERMINED for the commits being pushed");
  }
  if (strays.length) {
    notes.push(`did NOT speak for ${strays.map((s) => `${s.ref}@${s.sha}`).join(", ")}`
             + " — not HEAD, and the index was read from the working tree");
  }
  if (v.kind === "absent") notes.push("the generator is absent, so nothing was verified");
  const tail = notes.length ? ` (${notes.join("; ")})` : "";
  process.stderr.write(`${HOOK_MARKER}: docs/DECIDED.md current${tail}\n`);
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

  const fake = (status, stdout = "", stderr = "") => () => ({ status, stdout, stderr });

  arm(check({ run: fake(0, "DECIDED.md is current\n") }).kind === "current",
      "exit 0 is `current`");

  const stale = check({ run: fake(1, "", "FAIL  docs/DECIDED.md is STALE — run `node tools/decided.mjs`\n") });
  arm(stale.kind === "stale" && stale.ok === false, "the generator's own STALE line is `stale`, and refuses");

  /* THE ARM THIS CONTROL EXISTS FOR.  A broken generator also exits 1.  If this
     returned `stale` the guard would tell a session to run the tool that is broken. */
  const broke = check({ run: fake(1, "", "SyntaxError: Unexpected token '}'\n") });
  arm(broke.kind === "generator-failed" && broke.ok === false,
      "a generator that exits 1 WITHOUT the STALE line is `generator-failed`, not `stale`");
  arm((broke.output || "").includes("SyntaxError"),
      "a broken generator's OWN output is carried, so the failure is visible rather than translated");

  arm(check({ run: fake(127, "", "node: command not found\n") }).kind === "generator-failed",
      "a non-1 non-zero exit is `generator-failed`");

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
  process.exit(r.ok ? 0 : 1);
} else {
  const h = hooksDir();
  const r = install({ dryRun: true });
  const v = check();
  console.log(`hooks dir : ${h.dir || "(none)"}  [${h.source}]`);
  console.log(`pre-push  : ${r.action}${r.reason ? ` — ${r.reason}` : ""}`);
  console.log(`index     : ${v.kind} — ${v.message}`);
  console.log(`corpus    : ${corpusDirty() ? "DIRTY in the working tree (a push verdict would be UNDETERMINED)" : "clean against the tree"}`);
  console.log("");
  console.log("  --install   write the pre-push hook (idempotent; writes to .git/, never to the tree)");
  console.log("  --run       the hook body; refuses a push whose docs/DECIDED.md is stale");
  console.log("  --control   the negative-control arms");
}
