/* M0-56 — THE PRE-PUSH HOOK, CHECKED AT THE PUSH. CORRECTED 2026-09-22 BY M0-99.
 *
 * The subject is `tools/pushguard.mjs`. M0-56 built it because CONDUCT #2 pushed `main` RED on
 * a stale COMMITTED `docs/DECIDED.md` four times in one session, and a rebase could stale that
 * index under a correct regeneration with nobody touching anything. D-406 made it fire in every
 * worktree, D-293 gave it a second refusal (a tip tree the gate recorded RED), and BOB #14 three
 * more (merge markers, design-corpus drift, construct-status drift).
 *
 * M0-99 RETIRED THE ARM IT WAS BUILT FOR, AND THIS SUITE IS CORRECTED WITH IT, NOT EXEMPTED.
 * `docs/DECIDED.md` is no longer committed (`ORCHESTRATION.md` §"THE RECORD IS PARTITIONED BY
 * WRITER", rule 2): `.gitignore` names it and `tools/decided.mjs` produces it on demand through
 * one freshness call. So no push carries a copy that could be stale, and the four assertions this
 * suite made about staleness were right only while a commit carried the index:
 *   - "a prose edit after a regeneration is REFUSED" and "a rebase over a peer's ruling is
 *     REFUSED" — cause (1) and cause (2) — now PUSH, and are asserted to: the index they would
 *     have staled is not in the commit;
 *   - "a broken generator is REFUSED as `generator-failed`, not `stale`" — the push no longer
 *     runs the generator at all; a broken generator is the battery's (`decided.test.mjs` imports
 *     it), and a push over one is asserted NOT refused for it;
 *   - "plancheck arm 2b still FAILS on a stale index" — 2b now FAILS on a TRACKED or un-ignored
 *     index, the liar's shape (committed under `merge=ours`), and is pinned by that name.
 * THE END-TO-END PUSH IS KEPT AND RE-BASED, because it is still the one arm that can establish a
 * hook is wired: git must actually call it. It now drives a refusal the guard still makes — a
 * COMMITTED MERGE MARKER — at a REAL bare remote, and D-406's pre-guard worktree is driven the
 * same way. What M0-56's and D-406's controls broke, and the figures they read, are in this
 * file's history at `6f75ad86` (verbatim); those arms were aimed at `check()`, which is gone.
 *
 * HOW A LIAR PASSES THIS SUITE, STATED BEFORE WHAT IT CHECKS. The cheapest green is a hook body
 * that always exits 0 — every "pushes cleanly" arm passes over it. So every REFUSAL is read from
 * the guard's OWN text and from the REMOTE (the ref did not land), and the over-strictness arms
 * are paired with refusals in the same fixture, so a guard that refuses everything fails one and
 * a guard that refuses nothing fails the other.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/pushguard.control.mjs` from the repo root breaks
 * `tools/pushguard.mjs` one arm at a time; each arm must turn a NAMED assertion here red while the
 * fixture assertion stays green —
 *   (1) the hook body exits 0 at its first line, the liar above -> "A COMMITTED MERGE MARKER IS REFUSED" FAILS
 *   (2) `install()` writes the hook where git never reads it -> "...at the path git reads hooks from" FAILS, and the refusal with it
 *   (3) THE RETIRED ARM RE-ARMED: a push refused whenever the generator's `--check` is not 0 -> "M0-99 — A RULING ADDED AFTER THE INDEX WAS WRITTEN PUSHES" FAILS, with the rebase arm
 *   (4) the marker scan reads nothing -> "A COMMITTED MERGE MARKER IS REFUSED" FAILS, and D-406's refusal with it
 *   (5) the shim's fallback removed, v1's single source -> "THE FIX — a committed merge marker is REFUSED from a worktree that predates the guard" FAILS
 *   (6) the shim's order reversed, the cache first -> "WORKTREE-FIRST, DRIVEN" FAILS
 *   (7) the downgrade guard disabled -> "NEVER DOWNGRADE" FAILS.
 *   RUN 2026-09-22 by the M0-99 worker, all seven AS DECLARED: baseline 77 pass / 0 fail, each arm alone, every declared
 *   must-stay-green assertion green and the fixture assertion never red; driver 56 pass / 0 fail, every restore of
 *   `tools/pushguard.mjs` byte-identical by sha256 and `cmp`, closing 77 / 0, pen removed. Failing counts per arm:
 *   8, 17, 7, 6, 4, 1, 3. ARM (2) FOUND A DEFECT IN THIS SUITE BEFORE THOSE FIGURES, the third time at this spot:
 *   with no hook installed, NEVER DOWNGRADE's bare `readFileSync` THREW and the suite ended with no tally; it now
 *   reads through `existsSync` and fails by name.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { install, hooksDir, shim, refsNotHead, corpusDirty,
         installCopy, commonDir, COPY_NAME,
         HOOK_MARKER, CORPUS_PATHS } from "../../tools/pushguard.mjs";
import * as guard from "../../tools/pushguard.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "../..");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* The FOOT sentinel, `mintid.test.mjs`'s. A TypeError inside an assertion ends the
   module while the tally still reads clean, so every section bumps this and the last
   assertion requires all of them. A section that dies silently cannot leave a green
   count. */
const SECTIONS = 8;
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "pushguard-"));
const git = (args, cwd) => spawnSync("git", args, { cwd, encoding: "utf8" });

/* A merge marker, BUILT rather than written: the literal sequence at a line start in this
   file would make `plancheck` and the guard itself refuse the commit that carries it. */
const MARKER_LINE = `${"<".repeat(7)} ours (a conflict committed, not resolved)`;
const withMarker = (text) => `${text}${MARKER_LINE}\nthe other side\n${"=".repeat(7)}\nthis side\n${">".repeat(7)} theirs\n`;

/* ------------------------------------------------------------------ a real repo
 *
 * A REAL repository and the REAL guard, not a mock. The guard resolves its repository from
 * the PUSHING worktree (`--show-toplevel`), so a copy under `<tmp>/tools/` guards `<tmp>`.
 * `withIndex` adds the REAL ruling-index generator and the REAL `.gitignore`, so the retired
 * arm's section runs over the exact rule that keeps the index out of every commit. */
function scratchRepo(name, { withIndex = false } = {}) {
  const root = join(SANDBOX, name);
  mkdirSync(join(root, "tools"), { recursive: true });
  mkdirSync(join(root, "docs"), { recursive: true });
  cpSync(join(REPO, "tools/pushguard.mjs"), join(root, "tools/pushguard.mjs"));
  if (withIndex) {
    cpSync(join(REPO, "tools/decided.mjs"), join(root, "tools/decided.mjs"));
    /* CORRECTED 2026-09-22 by M0-110: `decided.mjs` now imports `coord.mjs` (the corpus is read through the coord
       layer), so a copy carried alone could not load and the index was never produced — the fixture measured a
       broken import, not the rule. What it imports is carried with it. */
    cpSync(join(REPO, "tools/coord.mjs"), join(root, "tools/coord.mjs"));
    /* CORRECTED 2026-09-23 by M0-121: `coord.mjs` now imports the state-path predicate from `statepaths.mjs` (a module
       that walks nothing), so the carried copy could not load without it — the same broken-import fixture as above. */
    cpSync(join(REPO, "tools/statepaths.mjs"), join(root, "tools/statepaths.mjs"));
    cpSync(join(REPO, ".gitignore"), join(root, ".gitignore"));
  }
  writeFileSync(join(root, "docs/seed.md"), "# seed\n\nDEC-1 was RULED on 2026-09-17 to exist.\n");
  writeFileSync(join(root, "CLAUDE.md"), "# scratch\n");
  git(["init", "-q", "-b", "main"], root);
  git(["config", "user.email", "m056@example.invalid"], root);
  git(["config", "user.name", "M0-56 suite"], root);
  git(["config", "commit.gpgsign", "false"], root);
  return root;
}
const regen = (root) => spawnSync(process.execPath, [join(root, "tools/decided.mjs")], { cwd: root, encoding: "utf8" });
const commitAll = (root, msg) => { git(["add", "-A"], root); return git(["commit", "-q", "-m", msg], root); };
function bareRemote(name) {
  const p = join(SANDBOX, name);
  git(["init", "-q", "--bare", p], SANDBOX);
  return p;
}
/* A refusal is read from the GUARD'S OWN TEXT, never from the exit status alone: a push can
   fail for a reason that is not the guard (a non-fast-forward, say), and an arm reading only
   the status passes over it — `gates.test.mjs` found exactly that in its own first run. */
const refusedForMarkers = (p) => p.status !== 0 && p.stderr.includes(`PUSH REFUSED — ${HOOK_MARKER}`)
  && p.stderr.includes("UNRESOLVED MERGE MARKERS");
const tip = (repo, ref) => git(["rev-parse", "--verify", "--quiet", ref], repo).stdout.trim();
/* CORRECTED 2026-09-22 (M0-111), never exempted. Every push below went to the remote's `main`, which was right while
   any session could push `main`. M0-111's `main` arm now refuses that push without the train's mark, so a fixture
   pushing `main` would see THAT refusal before the one its arm is about. These arms judge markers and the shim, not
   who lands `main`, so they push the fixture's `main` to a lane's landing ref — the push every lane now makes. The
   `main` arm itself is driven in `train.test.mjs`. */
const LANDED = "land/suite/work";
const LAND = `main:refs/heads/${LANDED}`;

/* ========================================================================== */
section("THE END-TO-END PUSH — git actually calls it, and it refuses what it still refuses");
/* The only arm that can establish a hook is wired. Everything else in this file would pass
   over a hook git never invokes. Re-based by M0-99 from a stale index — which no commit can
   carry any more — onto a committed merge marker, a refusal the guard still makes. */
{
  const root = scratchRepo("e2e");
  const remote = bareRemote("e2e-remote.git");
  git(["remote", "add", "origin", remote], root);

  const inst = install({ repo: root });
  t("install into a fresh repo reports `installed`", inst.action, "installed");
  t("...at the path git reads hooks from", inst.path, join(hooksDir({ repo: root }).dir, "pre-push"));
  t("...and the hook file is on disk", existsSync(inst.path), true);

  commitAll(root, "seed, a clean tree");
  const green = git(["push", "origin", LAND], root);
  t("A CLEAN TREE PUSHES — exit 0", green.status, 0);
  t("...and the guard says what it checked rather than passing silently",
    green.stderr.includes(`${HOOK_MARKER}: no merge markers`), true);
  t("...and the ref actually landed on the remote", tip(remote, LANDED), tip(root, "main"));

  writeFileSync(join(root, "docs/conflicted.md"), withMarker("# a file a merge left half-resolved\n"));
  commitAll(root, "a conflict committed, not resolved");
  const red = git(["push", "origin", LAND], root);
  t("A COMMITTED MERGE MARKER IS REFUSED — git called the hook, and the hook refused, in its own words", refusedForMarkers(red), true);
  t("...naming the file and line, so the reader can act in one step", red.stderr.includes("docs/conflicted.md:2"), true);
  t("...and the marked commit did NOT reach the remote", tip(remote, LANDED) === tip(root, "main"), false);

  writeFileSync(join(root, "docs/conflicted.md"), "# a file a merge left half-resolved, now resolved\n");
  commitAll(root, "resolved");
  t("...and resolving it CLEARS it — the advice is true", git(["push", "origin", LAND], root).status, 0);
}

/* ========================================================================== */
section("M0-99 — THE RETIRED ARM: nothing a commit carries can be stale, so nothing is refused for it");
/* CORRECTED 2026-09-22 (M0-99), never exempted. Until then this section drove cause (1) and
   cause (2) to a REFUSAL, and both were right while a commit carried `docs/DECIDED.md`: the
   copy it carried was stale. The index is now ignored and produced on demand, so the SAME two
   events stale nothing that is pushed, and a guard that still refused them would block every
   lane's push over a file no commit contains. The fixture carries the REAL generator and the
   REAL `.gitignore`, and each session RUNS the tool, as sessions do. */
{
  const root = scratchRepo("retired", { withIndex: true });
  const remote = bareRemote("retired-remote.git");
  git(["remote", "add", "origin", remote], root);
  install({ repo: root });

  regen(root);
  commitAll(root, "base, the index regenerated and NOT committed");
  t("the fixture's index exists on disk and is NOT in the commit — the rule this section runs over",
    [existsSync(join(root, "docs/DECIDED.md")), git(["ls-files", "--", "docs/DECIDED.md"], root).stdout.trim()], [true, ""]);
  t("the base pushes", git(["push", "-q", "origin", LAND], root).status, 0);

  /* Cause (1), as it was: a ruling written after the regeneration, committed without one. */
  writeFileSync(join(root, "docs/later.md"), "DEC-2 was RULED on 2026-09-17, after the index was built.\n");
  commitAll(root, "a ruling added after the regeneration");
  const c1 = git(["push", "origin", LAND], root);
  t("M0-99 — A RULING ADDED AFTER THE INDEX WAS WRITTEN PUSHES (cause (1), which the retired arm refused)", c1.status, 0);
  t("...and it landed", tip(remote, LANDED), tip(root, "main"));

  /* Cause (2), as it was, with the rebase the ONLY variable: the same branch pushed before and after. */
  git(["checkout", "-q", "-b", "peer"], root);
  writeFileSync(join(root, "docs/peer.md"), "DEC-3 was RULED on 2026-09-17 by a session this one never spoke to.\n");
  regen(root); commitAll(root, "peer lands a ruling");
  git(["checkout", "-q", "-b", "mine", "main"], root);
  writeFileSync(join(root, "tools/mine.mjs"), "// no prose here\n");
  regen(root); commitAll(root, "worker work, no prose touched");
  t("the branch pushes before the rebase", git(["push", "origin", "mine:refs/heads/mine"], root).status, 0);
  t("the rebase succeeds cleanly — no conflict to confound the arm (and no index to conflict on)",
    git(["rebase", "peer"], root).status, 0);
  const c2 = git(["push", "origin", "mine:refs/heads/mine2"], root);
  t("M0-99 — A REBASE THAT LANDS A PEER'S RULING PUSHES (cause (2), which the retired arm refused)", c2.status, 0);
  t("...and it landed", tip(remote, "mine2"), tip(root, "mine"));

  /* The generator broken on disk: a push is not the place that catches it any more. */
  writeFileSync(join(root, "tools/decided.mjs"), readFileSync(join(root, "tools/decided.mjs"), "utf8") + "\nthis is not javascript }{\n");
  commitAll(root, "a broken generator");
  const c3 = git(["push", "origin", "mine:refs/heads/mine3"], root);
  t("A BROKEN GENERATOR IS NOT REFUSED AT THE PUSH — the hook runs no generator (the battery catches it: decided.test.mjs imports it)",
    c3.status, 0);
  t("...and no guard line names the ruling index — the hook says nothing about a file it does not read",
    [c1.stderr, c2.stderr, c3.stderr].some((s) => s.includes("DECIDED")), false);
  t("...and no commit in the fixture ever carried the index",
    git(["log", "--all", "--format=%h", "--", "docs/DECIDED.md"], root).stdout.trim(), "");
  t("the module no longer exports the retired checker — gone, not idle",
    [typeof guard.check, typeof guard.STALE_SIGNATURE], ["undefined", "undefined"]);
}

/* ========================================================================== */
section("OVER-STRICTNESS — a clean tree must stay clean across an install");
/* A mechanism that dirtied the tree on every gate run would be worse than the defect it
   closes. MEASURED, not argued: an install writes `.git/hooks/`, which is not tracked and not
   in the working tree. The index's own idempotence — a current copy is not rewritten — moved
   with M0-99 to `decided.test.mjs`, where the freshness call that owns it is tested. */
{
  const root = scratchRepo("idem");
  commitAll(root, "seed");
  const before = git(["status", "--porcelain"], root).stdout;
  install({ repo: root });
  install({ repo: root });
  const after = git(["status", "--porcelain"], root).stdout;
  t("`git status --porcelain` is BYTE-IDENTICAL across TWO installs", after, before);
  t("...and it was actually clean, so the arm is not passing over an empty comparison",
    before.trim(), "");
  t("a second install reports `current`, not a rewrite", install({ repo: root }).action, "current");
}

/* ========================================================================== */
section("ARMING — the two ways this could have installed somewhere git never looks");
/* Both are the arm-that-did-not-arm class: a file, a success message, and no guard. */
{
  const root = scratchRepo("arming");

  /* THE SHIM MUST RESOLVE THE PUSHING WORKTREE. One hook file is shared by every
     worktree of a clone, so a baked-in absolute path would validate the INSTALLING
     tree on behalf of all the others — a worker's branch certified against main's
     corpus. */
  const s = shim();
  t("the shim resolves the pushing worktree with --show-toplevel", s.includes("--show-toplevel"), true);
  t("...and bakes in NO absolute path", /\/Users\/|\/home\/|\/private\//.test(s), false);
  t("...and never uses --git-dir, which in a worktree is not where hooks live",
    s.includes("--git-dir"), false);
  t("...and says so on stderr rather than waving a push through silently when the tool is absent",
    s.includes("NOT guarded"), true);

  /* `core.hooksPath` WINS OVER `.git/hooks`. Installing into `.git/hooks` while it is
     set produces a file git never reads. */
  const alt = join(SANDBOX, "alt-hooks");
  mkdirSync(alt, { recursive: true });
  git(["config", "core.hooksPath", alt], root);
  const h = hooksDir({ repo: root });
  t("core.hooksPath is honoured over .git/hooks", h.dir, alt);
  t("...and named as the source, so a reader can see where it went", h.source, "core.hooksPath");
  t("...and the hook is installed THERE", install({ repo: root }).path, join(alt, "pre-push"));

  /* A configured hooksPath that does not exist is the operator's business. */
  git(["config", "core.hooksPath", join(SANDBOX, "does-not-exist")], root);
  const missing = install({ repo: root });
  t("a hooksPath that does not exist REFUSES rather than conjuring a directory",
    missing.action, "no-hooks-dir");
  t("...and reports not-ok, so a caller cannot read it as armed", missing.ok, false);
  git(["config", "--unset", "core.hooksPath"], root);

  /* NEVER CLOBBER A HOOK WE DID NOT WRITE. */
  const own = hooksDir({ repo: root }).dir;
  writeFileSync(join(own, "pre-push"), "#!/bin/sh\n# somebody else's hook\nexit 0\n");
  const foreign = install({ repo: root });
  t("a foreign pre-push is NOT overwritten", foreign.action, "foreign");
  t("...and reports not-ok, because an install that did not happen must not read as one that did",
    foreign.ok, false);
  t("...and the foreign hook's bytes are untouched",
    readFileSync(join(own, "pre-push"), "utf8").includes("somebody else's hook"), true);
  t("...while OUR own hook IS replaced when its bytes differ (an older shim must not persist)",
    (writeFileSync(join(own, "pre-push"), `#!/bin/sh\n# ${HOOK_MARKER} v0 stale\nexit 0\n`),
     install({ repo: root }).action), "replaced");
}

/* ========================================================================== */
section("THE SCOPE OF THE VERDICT — what it checked, and what it did not");
/* Undetermined is first-class and must be STATED. A guard reporting a clean verdict over a
   tree it had not actually checked would be the costs-nothing-equality defect wearing a
   green tick. */
{
  const head = "a".repeat(40);
  t("a ref at HEAD is one the guard spoke for",
    refsNotHead(`refs/heads/x ${head} refs/heads/x ${"b".repeat(40)}`, head), []);
  t("a ref that is NOT HEAD is NAMED rather than silently covered",
    refsNotHead(`refs/heads/x ${"c".repeat(40)} refs/heads/x ${"b".repeat(40)}`, head).length, 1);
  t("a DELETION carries no corpus and is not named",
    refsNotHead(`refs/heads/x ${"0".repeat(40)} refs/heads/x ${"b".repeat(40)}`, head), []);
  t("empty stdin names nothing", refsNotHead("", head), []);

  /* CORRECTED 2026-09-22 (M0-99): this asserted the scope was "the generator's own roots", the
     corpus the retired index arm read. The scope is unchanged and so is its value; its reason
     now is the design-corpus arm, which reads its documents under `docs/` from the working tree. */
  t("the dirtiness question is asked over the prose corpus the working-tree arms read", CORPUS_PATHS, ["docs", "CLAUDE.md"]);

  const root = scratchRepo("scope");
  commitAll(root, "seed");
  t("a clean corpus reads clean", corpusDirty({ repo: root }), false);
  writeFileSync(join(root, "docs/seed.md"), "# seed\n\nDEC-1 was RULED to exist, and edited.\n");
  t("an uncommitted corpus edit reads DIRTY — the verdict then describes the TREE, not the push",
    corpusDirty({ repo: root }), true);
}

/* ========================================================================== */
section("THE DETECTOR THAT REPLACES THE RETIRED ONE, AND THE LOOP THAT ARMS THE GUARD");
/* CORRECTED 2026-09-22 (M0-99), never exempted. M0-56 pinned plancheck arm 2b here BY NAME —
   still a `fail`, still shelling the generator's `--check` — because a row that mechanises a
   remedy and softens its detector trades a loud defect for a silent one. That pin was right
   while the index was committed. The index is not committed now, so a stale copy can publish
   nothing; what can still go wrong is the index coming BACK into the committed tree, and 2b
   now FAILS on exactly that. The pin moves with the detector: by name, still a `fail`. */
{
  const pc = readFileSync(join(REPO, "tools/plancheck.mjs"), "utf8");
  const code = pc.replace(/\/\*[\s\S]*?\*\//g, "");
  t("plancheck no longer shells the generator's `--check` — the staleness arm is retired, not idle",
    /decided\.mjs[^\n]*--check/.test(code), false);
  t("...and FAILS, not warns, on a TRACKED index, naming the fix",
    [/fail\(`TRACKED — docs\/DECIDED\.md is in the index/.test(pc), pc.includes("git rm --cached docs/DECIDED.md")], [true, true]);
  t("...and FAILS on an index the repository's .gitignore does not ignore",
    /fail\(`NOT IGNORED — the repository's \.gitignore does not ignore docs\/DECIDED\.md/.test(pc), true);
  t("...through the ONE predicate the suite and the tool read, `indexTracking()`",
    pc.includes("indexTracking({ repo: ROOT })"), true);

  /* A MECHANISM NOT IN THE LOOP THE READER RUNS IS NOT A MECHANISM. The hook is
     installed by the gate every worker already runs, so nobody has to remember. */
  t("plancheck imports the guard, so running the gate ARMS the hook",
    pc.includes('import("./pushguard.mjs")'), true);
  t("...and says in its own output that it wrote to .git/",
    pc.includes("not in the working tree"), true);

  /* The real repository's own hook, if a gate has run here, must be ours. */
  const live = hooksDir({ repo: REPO });
  const livePath = live.dir ? join(live.dir, "pre-push") : null;
  const liveOk = !livePath || !existsSync(livePath)
    || readFileSync(livePath, "utf8").includes(HOOK_MARKER);
  t("any pre-push installed in THIS clone is ours (or absent — a fresh clone is the stated limit)",
    liveOk, true);
}

/* ========================================================================== */
section("D-406 — A WORKTREE WHOSE COMMIT PREDATES THE GUARD");
/* THE DEFECT THIS SECTION EXISTS FOR, and it is the reason the section is an END-TO-END
   PUSH rather than an assertion about `shim()`.  The hook is installed ONCE in the shared
   common dir — so it FIRES in every worktree — but v1 resolved its SCRIPT from the pushing
   worktree alone.  A checkout whose tip predates M0-56 does not contain `tools/pushguard.mjs`,
   so the hook found nothing to run, printed one stderr line, and EXITED 0.  Measured at 6 of 9
   worktrees by BOB #13 INCLUDING THE MAIN CHECKOUT, and re-measured at 5 of 15.

   **THE ABSENCE AND THE PRESENCE OF THE GUARD PRODUCED THE SAME VISIBLE OUTCOME — a successful
   push.**  That is why no function-level arm can establish this and why a real `git push` from
   a real linked worktree at a real pre-guard commit is the only shape that can.

   Commit A carries a corpus but NOT the guard script; commit B adds it. `main` sits at B and a
   linked worktree sits at A — D-406's exact geometry. RE-BASED 2026-09-22 (M0-99) from a stale
   index onto a committed merge marker, the refusal the fallback copy still makes. */
{
  const root = join(SANDBOX, "d406");
  mkdirSync(join(root, "tools"), { recursive: true });
  mkdirSync(join(root, "docs"), { recursive: true });
  writeFileSync(join(root, "docs/seed.md"), "# seed\n\nDEC-1 was RULED on 2026-09-17 to exist.\n");
  writeFileSync(join(root, "tools/other.mjs"), "// a tool, and not the guard\n");
  writeFileSync(join(root, "CLAUDE.md"), "# scratch\n");
  git(["init", "-q", "-b", "main"], root);
  git(["config", "user.email", "d406@example.invalid"], root);
  git(["config", "user.name", "D-406 suite"], root);
  git(["config", "commit.gpgsign", "false"], root);

  commitAll(root, "A — a corpus, NO guard script (predates M0-56)");
  const shaA = git(["rev-parse", "HEAD"], root).stdout.trim();
  cpSync(join(REPO, "tools/pushguard.mjs"), join(root, "tools/pushguard.mjs"));
  commitAll(root, "B — the guard script lands");

  install({ repo: root });
  const copy = installCopy({ repo: root });
  t("the clone-wide copy installs into the git COMMON dir", copy.action, "installed");
  t("...under its bio-* name, beside the ledger mintid has kept there since M0-17",
    copy.path, join(commonDir({ repo: root }), COPY_NAME));
  /* READ THROUGH A GUARD, NOT DIRECTLY. A bare `readFileSync` here THROWS when the copy is
     absent, which ends the module with no tally and no FOOT — the suite reaches a verdict by
     DYING instead of by failing. Found by D-406's own control arm (2); `mintid.test.mjs`
     records the same defect. A control that diagnoses beats one that merely goes red. */
  const copyBody = copy.path && existsSync(copy.path) ? readFileSync(copy.path, "utf8") : "";
  t("...and the copy REALLY EXISTS on disk — an install that reported success wrote something",
    copyBody.length > 0, true);
  t("...and is a copy of a REAL pushguard, not an empty or truncated file",
    copyBody.includes("export function shim"), true);
  t("...idempotent by bytes — a second call does not rewrite it",
    installCopy({ repo: root }).action, "current");

  /* The pre-guard worktree. */
  const old = join(SANDBOX, "d406-old");
  git(["worktree", "add", "-q", "-b", "oldbranch", old, shaA], root);
  t("the old worktree genuinely lacks the guard script — the D-406 geometry, not a mock",
    existsSync(join(old, "tools/pushguard.mjs")), false);

  const remote = bareRemote("d406-remote.git");
  git(["remote", "add", "origin", remote], old);

  /* ---------------------------------------------------------------- OVER-STRICTNESS FIRST.
     A guard that hard-failed in every checkout predating it would refuse pushes from the MAIN
     CHECKOUT on a tree that has done nothing wrong — trading a silent gap for a loud blockage,
     the failure D-406's row warned against. A correct tree must push CLEANLY and SILENTLY. */
  writeFileSync(join(old, "docs/fine.md"), "# nothing wrong here\n");
  commitAll(old, "old worktree, a clean change");
  const healthy = git(["push", "origin", "oldbranch"], old);
  t("OVER-STRICTNESS — a clean tree pushes cleanly from a previously-unguarded worktree",
    healthy.status, 0);
  t("...and the ref actually landed", tip(remote, "oldbranch"), tip(old, "oldbranch"));
  t("...and the guard now gives a REAL VERDICT there instead of `NOT guarded`",
    healthy.stderr.includes(`${HOOK_MARKER}: no merge markers`), true);
  t("...and does NOT announce itself as inactive, which is what v1 said here",
    healthy.stderr.includes("NOT guarded"), false);

  /* ---------------------------------------------------------------- THE REFUSAL THAT DID NOT
     HAPPEN BEFORE.  Under v1 the hook found no script here and exited 0. */
  const before = tip(remote, "oldbranch");
  writeFileSync(join(old, "docs/conflicted.md"), withMarker("# half-resolved\n"));
  commitAll(old, "a conflict committed, not resolved");
  const marked = git(["push", "origin", "oldbranch"], old);
  t("THE FIX — a committed merge marker is REFUSED from a worktree that predates the guard", refusedForMarkers(marked), true);
  t("...and the marked commit did NOT reach the remote", tip(remote, "oldbranch"), before);

  writeFileSync(join(old, "docs/conflicted.md"), "# resolved\n");
  commitAll(old, "resolved");
  t("...and resolving it CLEARS it, from the old worktree too",
    git(["push", "origin", "oldbranch"], old).status, 0);

  /* ---------------------------------------------------------------- NO REGRESSION.
     A worktree that ALREADY had the guard must still refuse, and through its OWN tracked script
     rather than the cache — worktree-first is the whole of the chosen ordering. */
  git(["remote", "add", "origin", remote], root);
  t("a tree WITH its own script still pushes clean", git(["push", "-q", "origin", LAND], root).status, 0);
  writeFileSync(join(root, "docs/marked.md"), withMarker("# marked on main\n"));
  commitAll(root, "a marker on main");
  t("NO REGRESSION — a tree where the guard already worked STILL refuses a committed marker",
    refusedForMarkers(git(["push", "origin", LAND], root)), true);
  writeFileSync(join(root, "docs/marked.md"), "# resolved on main\n");
  commitAll(root, "resolved on main");

  /* ---------------------------------------------------------------- NEVER DOWNGRADE.
     Measured in the wild while D-406 was being closed: one hook file is shared by every
     worktree and `plancheck` rewrites it from whichever worktree is gating, so a sibling on an
     OLDER checkout reinstalled an OLDER shim over the newer one — silently returning five
     checkouts to unguarded. THIS ARM PINS WHAT THE GUARD CAN DO, WHICH IS NOT THE SAME AS WHAT
     WAS NEEDED — it cannot stop an older installer, whose code lives in another checkout. It
     stops the NEXT one. */
  {
    /* READ THROUGH A GUARD. M0-99's control arm (2) — `install()` writing where git never reads —
       left no hook here, and a bare `readFileSync` THREW, ending the module with no tally: the
       suite died instead of failing. Now an absent hook fails the first assertion BY NAME. */
    const hookPath = join(hooksDir({ repo: root }).dir, "pre-push");
    const realHook = existsSync(hookPath) ? readFileSync(hookPath, "utf8") : "";
    t("...and there is an installed hook to downgrade, so the arms below can arm", realHook.includes(HOOK_MARKER), true);
    if (realHook) writeFileSync(hookPath, realHook.replace(/bio-pushguard v\d+/, "bio-pushguard v99"));
    const older = install({ repo: root });
    t("NEVER DOWNGRADE — an installer older than the installed hook LEAVES IT ALONE",
      older.action, "newer");
    t("...and reports ok, because leaving a newer hook in place is a correct outcome",
      older.ok, true);
    t("...and says WHY, naming both versions rather than reporting a silent success",
      /v99/.test(older.reason || "") && /v2/.test(older.reason || ""), true);
    t("...and the newer hook on disk is genuinely untouched",
      existsSync(hookPath) && readFileSync(hookPath, "utf8").includes("bio-pushguard v99"), true);
    /* Restore, and prove the restore took — a downgrade guard that could not be turned off
       would be a fence tighter than its rule. */
    if (realHook) writeFileSync(hookPath, realHook);
    t("...and an installer at the SAME version still reports current, so the guard is not a ratchet",
      install({ repo: root }).action, "current");
  }

  /* THE ORDER, pinned by BEHAVIOUR rather than by reading the shim.  Corrupt the CACHE only.
     If the hook preferred the cache, this push would die on a SyntaxError; worktree-first
     means the tracked script answers and the corrupt cache is never opened. Guarded for the
     reason given above — this arm must not be able to END the module. */
  const cacheSaved = copyBody;
  t("...and there is a cache to corrupt, so the ordering arm below can actually arm",
    cacheSaved.length > 0, true);
  if (cacheSaved) writeFileSync(copy.path, "this is not valid javascript {{{\n");
  writeFileSync(join(root, "docs/after.md"), "# a clean change after the cache was corrupted\n");
  commitAll(root, "a clean change");
  const withBadCache = git(["push", "origin", LAND], root);
  t("WORKTREE-FIRST, DRIVEN — a corrupt CACHE cannot affect a tree that carries its own script",
    withBadCache.status, 0);
  if (cacheSaved) writeFileSync(copy.path, cacheSaved);
  t("...and the cache was restored byte-identically for the arms after it",
    existsSync(copy.path) && readFileSync(copy.path, "utf8") === cacheSaved, true);
}

/* ========================================================================== */
section("FOOT");
t(`FOOT — all ${SECTIONS} sections reached (a section that dies silently cannot leave a green count)`,
  reached, SECTIONS);

rmSync(SANDBOX, { recursive: true, force: true });
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
