#!/usr/bin/env node
/* plancheck — does the plan hang together, and has it actually been PUBLISHED?
 *
 * WHY THIS EXISTS. On 2026-07-31 a BOB session wrote a rule ("an area may not be
 * ACTIVE without a kickoff"), created the missing kickoff, and left it UNTRACKED.
 * Three worker worktrees were already live, pinned at an earlier commit. A git
 * worktree is a checkout of a COMMIT, so an untracked file in the main checkout is
 * invisible to every worker permanently — not merely until they refresh. The rule
 * and its fix reached nobody. In the same session a mechanism (the BOB INBOX) was
 * documented in two places and not added to the loop CONDUCT actually runs, so even
 * once published it would not have been read.
 *
 * Both failures are the class this repository keeps meeting and keeps closing the
 * same way: a list maintained by hand falls behind silently (D-113's purge table, the
 * `npm test` chain of 38 files against a directory of 41). Convention did not hold
 * there and will not hold here. So the discipline gets an instrument.
 *
 * THE PRINCIPLE IT ENFORCES: the repository is the channel between sessions. A change
 * is not made when it is written, it is made when it is committed and pushed. An
 * uncommitted file communicates nothing; an untracked one cannot even be reached.
 *
 *   node tools/plancheck.mjs            # full check; exit 1 on any FAIL
 *   node tools/plancheck.mjs --local    # skip the publication checks (mid-turn use)
 *
 * FAIL is a structural break. WARN is worth a look and never blocks.
 */

/* `readdirSync` was imported and never used — M0-16 measured it and delegated it, and
   it is removed here rather than left for a third reader to re-derive. */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
/* M0-110: the state files live on the branch `coord` after the cutover. Every read below goes through the coord
   layer — a file that is its one-line pointer answers with coord's copy — so each arm judges the same rows it
   judged when they sat on `main` (TREE-SHARING.md §1: "plancheck keeps its cross-checks by reading both branches"). */
import { readState, isSwitched } from "./coord.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEV = join(ROOT, "docs/development");
const LOCAL_ONLY = process.argv.includes("--local");

const fails = [], warns = [], notes = [];
const fail = (m) => fails.push(m);
const warn = (m) => warns.push(m);
/* A finding read from the `coord` ledgers, not from this tree: a FAIL, except under `--local` on a switched tree,
   where it is a WARN naming why (see the ledger block, TREE-SHARING §3 (c)). */
const stateOnCoord = () => { try { return isSwitched(ROOT); } catch { return false; } };
const stateFail = (m) => (LOCAL_ONLY && stateOnCoord()
  ? warns.push(`[coord state — reported, never this tree's verdict under --local; \`coord.mjs write\` enforces it] ${m}`)
  : fails.push(m));
const read = (p) => readState(ROOT, p);
const sh = (c) => { try { return execSync(c, { cwd: ROOT, encoding: "utf8" }).trim(); } catch { return null; } };

/* ------------------------------------------ 0. UNRESOLVED MERGE MARKERS

   ADDED 2026-08-08, AND THE RECEIPT IS CONDUCT'S OWN: integrating seven items in
   one batch, CONDUCT ran `git add -A` and `git commit` without re-reading the tree,
   and pushed a conflict marker in `scripts/coverage.mjs` to `origin/main`.

   THE BATTERY WAS GREEN AND PROVED NOTHING, because the battery does not run that
   file. `coverage.mjs --strict` does — and it was skipped to save time in a batch.
   A shortcut for throughput that skipped the one instrument able to see the thing
   it broke.

   This check is FIRST because it is the cheapest total one in the file, and it
   costs nothing on a clean tree. It is not a substitute for running the battery,
   `--strict` and the UI harness; it is the backstop for the case where a session
   is moving fast enough to skip one of them. **A marker is never intentional**, so
   unlike every other check here there is no legitimate exception and none is
   offered. Scanned at line starts only, which is what git writes and what a code
   fence or a prose mention of the sequence will not produce. */

{
  const tracked = sh("git ls-files -- ':!*.png' ':!*.jpg' ':!*.pdf' ':!*.gz' ':!*.zip'");
  const marked = [];
  for (const f of (tracked || "").split("\n").filter(Boolean)) {
    const body = read(f);
    if (body === null) continue;
    /* Built rather than written: the literal sequences would make THIS FILE fail
       its own check, which is the sweep-arm-citing-itself shape this project has
       met three times in two days. */
    const open = "<".repeat(7), mid = "=".repeat(7), close = ">".repeat(7);
    for (const [i, line] of body.split("\n").entries()) {
      if (line.startsWith(open + " ") || line === mid || line.startsWith(close + " "))
        marked.push(`${f}:${i + 1}`);
    }
  }
  if (marked.length)
    fail(`UNRESOLVED MERGE MARKERS in ${marked.length} place(s) — a conflict was committed\n`
       + `        rather than resolved, and nothing else in this repository will\n`
       + `        necessarily notice: the battery does not read every file. CONDUCT\n`
       + `        pushed exactly this to origin/main on 2026-08-08 behind a green\n`
       + `        battery. First five: ${marked.slice(0, 5).join(", ")}`);
}

/* ------------------------------------------------------- 1. PUBLICATION */

if (!LOCAL_ONLY) {
  /* Only the planning surface is checked. A session legitimately holds uncommitted
     CODE mid-turn; what must never sit unpublished at a handoff is the plan, because
     the plan is how the next session learns what changed. */
  const dirty = sh("git status --porcelain -- docs/ CLAUDE.md tools/");
  if (dirty) {
    fail(`UNPUBLISHED — the planning surface has uncommitted changes. A worktree is a\n`
       + `        checkout of a COMMIT, so these reach no worker at all:\n`
       + dirty.split("\n").map((l) => `          ${l}`).join("\n")
       + `\n        If these are NOT yours, another session is writing this tree, which is\n`
       + `        itself the violation: ONE SESSION PER WORKING TREE (PARALLELISM.md).\n`
       + `        Do not commit them for it and do not report them — the fix is the\n`
       + `        other session moving to its own worktree, not a message to Bob.`);
  }

  sh("git fetch -q origin");
  const head = sh("git rev-parse HEAD");
  const remote = sh("git rev-parse origin/main");
  if (head && remote && head !== remote) {
    const ahead = sh("git rev-list --count origin/main..HEAD");
    if (ahead && +ahead > 0) {
      /* "on local main" was a LIE to every worktree worker, and VF-6 reported it rather
         than working around it: the comparison is `origin/main..HEAD`, so it fires on
         whatever branch HEAD is on — which for a spawned worker is never main. A gate
         that misnames the reader's own branch teaches them to distrust the gate. The
         branch is now READ rather than assumed. */
      const branch = sh("git rev-parse --abbrev-ref HEAD") || "HEAD";
      /* SCOPE IS STATED, and the reason is a measurement rather than tidiness. This arm is
         LOCAL-HEAD scoped and the stranded-work arm below is ESTATE-WIDE, so the two give
         different answers about the same tree depending on where plancheck was run — and on
         2026-09-17 that cost two sessions a contradiction they could not resolve by going to
         the artifact, because both artifacts were telling the truth about different places.
         A reader who greps from one tree and acts on behalf of another is exactly this gate's
         reader (CONDUCT #2; the receipt is in strandedwork.mjs's header). */
      fail(`UNPUSHED — ${ahead} commit(s) on ${branch} are not on origin/main. Verify from\n`
         + `        the REMOTE, never from your own tree: a local commit is not a published one.\n`
         + `        (On a worker's own branch this is EXPECTED — workers commit and CONDUCT\n`
         + `        integrates. It is a failure on main and a note anywhere else.)\n`
         + `        SCOPE: THIS CHECKOUT ONLY (origin/main..HEAD in ${branch}). It says nothing\n`
         + `        about any other worktree — the STRANDED WORK arm is the estate-wide one.`);
    } else {
      warn(`local main is behind origin/main — fetch and rebase before writing.`);
    }
  }
}

/* -------------------------------------------------- 2. THE PLAN COHERES */

const queue = read("docs/development/QUEUE.md");
const milestones = read("docs/development/MILESTONES.md");
const interfaces = read("docs/development/INTERFACES.md");
const register = read("docs/development/kickoffs/README.md");
/* `DEBT.md` WAS READ HERE and required to EXIST. Retired with the construct (M0-140, 2026-09-24): requiring a file
   the estate has deliberately deleted is how a gate keeps a retired construct alive. */

for (const [name, body] of [["QUEUE.md", queue], ["MILESTONES.md", milestones],
                            ["INTERFACES.md", interfaces]])
  if (!body) fail(`MISSING — docs/development/${name} does not exist.`);

if (queue && register) {
  /* An area may not be ACTIVE without a kickoff naming its paths. This is the exact
     hole that produced this script: RECORD was activated and a worker spawned for it
     would have had nothing to read. */
  for (const m of queue.matchAll(/^##\s+([A-Z][A-Z-]+)\s+—\s+ACTIVE/gm)) {
    const area = m[1];
    if (!existsSync(join(DEV, `kickoffs/${area}.md`)))
      fail(`NO KICKOFF — area ${area} is ACTIVE in QUEUE.md and `
         + `docs/development/kickoffs/${area}.md does not exist. A worker spawned for it\n`
         + `        has nothing to read. Activating an area and writing its kickoff are ONE act.`);
    if (!new RegExp(`\`${area}\``).test(register))
      fail(`NOT IN THE REGISTER — area ${area} is ACTIVE and absent from `
         + `kickoffs/README.md's thread table, so its owned paths are undefined.`);
  }
}

/* THE MILESTONE AND INTERFACE FIELDS OF EVERY PLAN ROW — cache ∪ backlog (D-430, 2026-09-18). These
   two checks matched `^milestone:` and `^behind-interface:` over QUEUE.md's text alone, so once LED-6's
   migration moved the open rows into BACKLOG.md, a backlog row naming an unknown milestone or an
   unregistered interface would have passed. The rows now come from `rowdesign.mjs`' `planRows`, which
   is `ledger.mjs`' one lister, and the fields are judged by `planFieldAudit` there — never a second
   walk here (`pipeline-readers.test.mjs` §6 pins that this file scans no ledger text for them).
   What the switch traded at its base is measured in `planFieldAudit`'s comment (none since LED-6's
   step (2) archived them): three field lines under row-shaped
   headings the grammar cannot read, now NAMED below instead of read. */
{
  const { planRows, planFieldAudit, whereOf } = await import("./rowdesign.mjs").catch(() => ({}));
  if (!planRows) {
    warn(`rowdesign.mjs could not be loaded — the plan's milestone and interface fields are UNVERIFIED this run.`);
  } else {
    const plan = planRows({ repo: ROOT });
    for (const u of plan.unreadable)
      fail(`UNREADABLE PLAN FILE — ${u} could not be read, so its rows' milestone, interface and design\n`
         + `        fields are UNVERIFIED. An unreadable ledger is not an empty one.`);
    if (plan.strays.length)
      warn(`ROW-SHAPED HEADING THE GRAMMAR CANNOT READ — ${plan.strays.length} heading(s) in the plan look like\n`
         + `        rows and are not read as rows, so NO arm judges their fields (design, milestone, interface,\n`
         + `        state; P1/P2 cannot see them either):\n`
         + plan.strays.map((s) => `          ${s.heading.slice(0, 60)} (${whereOf(s)})`).join("\n"));
    const fa = planFieldAudit(plan.rows, { milestones, interfaces });
    for (const u of fa.unregisteredInterface)
      fail(`UNREGISTERED INTERFACE — ${u.id} (${whereOf(u)}) is an item behind ${u.interface}, which is not in\n`
         + `        INTERFACES.md. An interface not in the registry does not exist and nothing\n`
         + `        may be built against it (PARALLELISM.md).`);
    if (fa.knownInterfaces)
      notes.push(`interfaces registered: ${[...fa.knownInterfaces].sort().join(", ") || "none"}`);
    for (const u of fa.unknownMilestone)
      fail(`UNKNOWN MILESTONE — ${u.id} (${whereOf(u)}) names ${u.milestone}, which MILESTONES.md does not define.`);
    if (fa.knownMilestones) {
      const idle = [...fa.knownMilestones].filter((k) => !fa.used.has(k)).sort();
      if (idle.length)
        notes.push(`milestones with no queued item (normal for later rungs): ${idle.join(", ")}`);
    }
    notes.push(`plan fields: ${fa.rowsRead} row(s) read (cache ${plan.cacheRows}, backlog ${plan.backlogRows}, tail ${plan.tailRows}) — `
      + `every milestone and behind-interface line judged`);
  }
}

/* THE DISPOSITION ARM WAS HERE (§2's debt half): every OPEN `| D-n |` row carries a leading disposition token, or
   it is invisible work. RETIRED with the construct (M0-140, 2026-09-24). Its predicate, `ledger.mjs`'
   `debtTokenAudit`, is retired there and says why: a plan row's PLACEMENT is its disposition, so re-pointing this at
   `BACKLOG.md` would be a second, weaker producer of a quantity P1-P5, `rowdesign` and `rowsubstrate` already
   produce. There is no side list for work to be invisible in any more (CLAUDE.md §4). */

/* A kickoff is what a worker reads INSTEAD of this document, so a thin one
   reintroduces the collisions the claims system exists to prevent. Every registered
   area's kickoff must at minimum tell its session to claim before editing and where
   the coordination skill lives. Checked for every kickoff, not only ACTIVE ones,
   because an area is promoted at a moment when nobody is re-reading it. */
if (register) {
  for (const m of register.matchAll(/^\|\s*`([A-Z][A-Z-]+)`\s*\|/gm)) {
    const area = m[1], f = `docs/development/kickoffs/${area}.md`;
    const k = read(f);
    if (!k) { fail(`NO KICKOFF — ${area} is in the thread register and ${f} does not exist.`); continue; }
    if (!/CLAIMS\.md/.test(k))
      fail(`THIN KICKOFF — ${f} never mentions CLAIMS.md, so its session is not told to\n`
         + `        claim before editing. Unclaimed paths are a collision risk, not a licence.`);
    if (!/ORCHESTRATION\.md/.test(k))
      warn(`${f} does not point at ORCHESTRATION.md, where the coordination skill lives.`);
  }
}

/* ------------------------------- 2b. TWO THINGS WEARING ONE ID (D-243)

   THE INTEGRATION-SIDE HALF, AND IT IS HERE BECAUSE THIS IS WHERE CONDUCT ALREADY
   STANDS. `kickoffs/CONDUCT.md` step 6 runs this file before every push, and a merge
   is the exact moment two branches' ids become one corpus — so a collision that
   existed in neither branch appears here and nowhere earlier. D-243 reasoned that the
   check could not be an instrument because the LEDGER is in no commit. That is true of
   the question "was this minted?", which needs `mintid.mjs --audit` on CONDUCT's
   machine. It is not true of the HARM: a duplicate allocation is fully visible in the
   text, needs no ledger, and answers yes or no rather than unknown.

   SIX WERE ALREADY SITTING IN `origin/main` when this was written, none of them known.
   They are registered in `KNOWN_COLLISIONS` with a reason each, and the registration
   has no slack in either direction — a seventh fails, and a registered one that has
   been renumbered ALSO fails, so the list cannot outlive its reason.

   The predicate lives in `tools/mintid.mjs` and is shared with the battery suite, for
   the reason planning-hygiene already states: two checks in two places for one
   invariant is the cheap-and-early copy plus the cannot-be-bypassed copy.

   **AND THIS CHECK IS A BACKSTOP FOR A BYPASS, NOT THE PRIMARY DEFENCE. SAID HERE
   BECAUSE THE NEXT READER WILL OTHERWISE TAKE IT FOR ONE** (M0-39, 2026-09-15). The
   primary defence is `tools/mintid.mjs` REFUSING to hand out a taken id, and an allocator
   that refuses beats a checker that reports for the reason `mintid` exists at all:
   check-then-act has no atomicity between the check and the act, so every worker in a
   wave can measure a number free and be right when it looks. What reaches this line is
   therefore always a BYPASS — somebody read a corpus floor and added one instead of
   calling the tool. MEASURED the day this sentence was written: **four workers of one
   wave filed `M-21`, and FW-18's reached `origin/main` at `a59ac7b` with nothing
   failing**, because `M` had declared no ALLOCATION SITE and `allocations()` therefore
   returned `covered:false` for it — a namespace this gate could not grade at all. `M`
   declares one now, so it enters this check rather than a second grep being written
   beside it, and `--audit` can see a bypass for the first time. **A duplicate arriving
   here is evidence the allocator was skipped, and the fix is to call it — not to make
   this check stricter.** */

{
  const { collisions, unregisteredNamespaces } = await import("./mintid.mjs");
  const c = collisions({ repo: ROOT });
  notes.push(`id allocations: ${c.sites} site(s) across ${c.graded.length} graded namespace(s); `
    + `${c.notCovered.map((n) => n.ns).join(", ") || "none"} not gradable; `
    + `${c.known.length} pre-existing collision(s) registered`);
  if (c.fresh.length)
    fail(`DUPLICATE ID — ${c.fresh.length} id(s) are allocated TWICE, which is the defect\n`
       + `        tools/mintid.mjs exists to prevent and the one a merge creates out of two\n`
       + `        clean branches:\n`
       + c.fresh.map((d) => `          ${d.id}  at ${d.at.join("  and  ")}`).join("\n")
       + `\n        Renumber one of each pair. If it predates the detector, add it to\n`
       + `        KNOWN_COLLISIONS in tools/mintid.mjs WITH A REASON — that list is dated\n`
       + `        evidence, not an exemption.`);
  if (c.stale.length)
    fail(`STALE COLLISION REGISTER — ${c.stale.length} id(s) in KNOWN_COLLISIONS are no longer\n`
       + `        duplicated (${c.stale.map((s) => s.id).join(", ")}). Somebody renumbered them, which is\n`
       + `        good; delete the entries, or the register outlives its reason and starts\n`
       + `        excusing a collision nobody measured.`);

  /* An unregistered prefix is REFUSED by name, which is fail-closed and right — but
     nothing prompted anyone to add one, so `FW`, `COFF` and `CAP` allocated by the old
     convention for weeks and `FW-15` collided. This is the prompt. */
  const u = unregisteredNamespaces({ repo: ROOT });
  if (u.unregistered.length)
    fail(`UNREGISTERED ID NAMESPACE — ${u.unregistered.length} prefix(es) allocate queue ids and have\n`
       + `        no row in NAMESPACES, so mintid REFUSES them by name and that family is still\n`
       + `        on the read-the-file convention that collided seven times in one day:\n`
       + u.unregistered.map((x) => `          ${x.prefix}  ${x.items} allocation(s), first in ${x.first}`).join("\n")
       + `\n        Add a row to NAMESPACES in tools/mintid.mjs naming the corpus its floor is\n`
       + `        read from. Fail-closed with nothing prompting is a gate nobody can pass.`);
  else notes.push(`id namespaces: ${u.prefixes.length} allocating prefix(es), all registered (${u.prefixes.join(" ")})`);
}

/* ------------------- 2e. THE MEASUREMENT AND INTERFACE-CHANGE LEDGERS ARE FROZEN FILES PLUS ONE FILE PER ENTRY (M0-100)

   Two `land/*` branches appending to the same tail collide in the train's merge (ORCHESTRATION.md rule 3). The layout
   and its check live in `tools/entries.mjs`, the one reader of both ledgers; this runs its `audit()` so a builder
   who appends to a frozen file, or files an entry that is not whole in its own file, is refused here before a push
   rather than at the integrator's merge. */
{
  const E = await import("./entries.mjs").catch((e) => ({ loadError: e }));
  if (E.loadError) fail(`entries.mjs could not be loaded — the measurement and interface-change ledgers are UNCHECKED: ${E.loadError.message}`);
  else {
    const a = E.audit({ repo: ROOT });
    for (const f of a.fails) fail(`LEDGER ENTRY — ${f}`);
    notes.push(`entries (M0-100): ${a.notes.join("; ")}`);
  }
}

/* ------------------- 2c. A MERGE THAT SILENTLY DROPPED A FILE (M0-20)

   WHY IT IS HERE AND NOT IN THE BATTERY OR IN A DOCUMENT, AND THE ARGUMENT MATTERS
   MORE THAN THE CODE.

   The defect is CONDUCT's and nobody else's: on 2026-08-08 the REC-69 merge carried 11
   of its branch's 12 files, and the missing one held 70 lines of floor moves. Nothing
   went red — a dropped floor goes SLACK, not broken — so the battery was green,
   `--strict` exit 0 and the UI harness exit 0 while eleven floors sat stale for days.

   Three places could hold the check, and only one of them is the loop the reader runs:

   - THE BATTERY. It runs in every worker's worktree, where there is no merge to judge,
     so the check would be a no-op for ~85 of ~86 runners. A check that finds nothing for
     almost everybody is one nobody notices breaking. The battery DOES carry a copy —
     `test/mergecarry.test.mjs`, which drives the predicate over real git merges and
     grades the historical register — for the reason 2b already states: the cheap-and-early
     copy plus the cannot-be-bypassed copy. That is the right role for it, and it is not
     the gate.
   - CONDUCT'S LOOP AS PROSE. `kickoffs/CONDUCT.md` already tells CONDUCT to check for the
     CONTENT rather than the ancestry after a merge — and it names a file and a symbol the
     reader has to think of THEMSELVES. That paragraph existed on 2026-08-08 and the drop
     happened anyway, because the file you must think of is precisely the one you did not.
     A mechanism believed on the strength of its existence rather than its behaviour is the
     defect this project meets most.
   - HERE. `kickoffs/CONDUCT.md` step 6 runs this file BEFORE EVERY PUSH; a merge is
     exactly the moment this defect is created and this is exactly where CONDUCT already
     stands. Section 0 (merge markers) and section 2b (duplicate ids) are both here for the
     identical reason, and both were earned by the same integration.

   CAN IT RUN IN A WORKTREE THAT IS A CHECKOUT OF ONE COMMIT? MEASURED, YES. A linked
   worktree's `.git` is a FILE pointing into the main repository, and `git rev-parse
   --git-common-dir` resolves to the shared `.git` — so the OBJECT STORE is shared and every
   commit in the repository is reachable from every worktree, even though the working tree
   holds one. Verified from a worker worktree by reading `e241672` and `2d9c57b` there. The
   check is therefore real everywhere, and in a worker's tree it simply finds no merges to
   judge and says so.

   THE FALSE POSITIVE IS WHAT DECIDES WHETHER THIS SURVIVES. A check that cries wolf gets
   switched off — VERIFICATION.md's own stated reason for not making `--strict` the gate.
   Measured over the whole of main's history, 182 merges: THREE findings, and none of them a
   false positive. The benign classes (main made the same change, the file was deleted or
   renamed on main, an octopus, a rebase, a branch deletion main declined) are enumerated in
   `tools/mergecarry.mjs` and DRIVEN one by one through real `git merge` in
   `test/mergecarry.test.mjs`. */

{
  const { carryAudit, unregisteredDrops, dropMessage } = await import("./mergecarry.mjs");
  const a = carryAudit({ repo: ROOT });
  const drops = unregisteredDrops(a.findings);
  notes.push(`merge carry: ${a.merges.length} merge(s) in ${a.scope} — `
    + `${a.counts.sameEnd} same-end, ${a.counts.moved} moved, ${a.counts.goneOnMain} gone-on-main, `
    + `${a.counts.declared} declared, ${drops.length} DROPPED`);
  for (const n of a.notes) notes.push(`merge carry: ${n}`);
  for (const f of a.findings.filter((f) => f.klass === "goneOnMain"))
    warn(`GONE ON MAIN — ${f.merge} merged a branch that changed ${f.path} (${f.lines} line(s))\n`
       + `        and main had removed the path, so the merge took the removal. That is a decision\n`
       + `        somebody made at a modify/delete conflict rather than one that happened to them,\n`
       + `        which is why it warns rather than fails — but the branch's work on it is gone.`);
  if (drops.length) fail(dropMessage(drops));
}

/* ------------------- 2d. AN ATTRIBUTION WHOSE CITATION NAMES SOMEBODY ELSE (M0-39)

   THE SECOND HALF OF THE SAME DEFECT SECTION 2b GATES, AND THAT IS WHY IT SITS HERE:
   THE CORPUS STATES A RULE AND NOTHING READS IT. `RULED by Bob` means DOCTRINE no session
   may revisit; a session's own name means MECHANISM a later session MAY revisit on
   evidence. On 2026-09-15 FIVE landed plane comments called a BOB-session commit a ruling
   of Bob's, and nothing in this repository could see it — the convention held until a busy
   day, exactly as the id convention did.

   THE HARM IS ONE-DIRECTIONAL AND THAT IS WHY IT IS A GATE. A mechanism decision wearing
   doctrine's attribution becomes UNREVISABLE IN PRACTICE: the next reader works AROUND the
   rule instead of correcting it, and working around leaves no trace that correcting does.
   The reverse error is cheap and self-correcting.

   IT IS NOT A BANNED PHRASE, AND A BANNED PHRASE HERE WOULD BE WORSE THAN NOTHING —
   `RULED by Bob` is CORRECT wherever he actually ruled, and this corpus is full of places
   he did (17 bindings read on the day this landed; 13 of them correct, in BOTH forms). The
   predicate RESOLVES each citation against the repository's own records — a sha against the
   commit's own trailers, a `DEC-n` against the decision register's own `for:` field — and
   fails only where the actor named and the actor resolved DISAGREE, in both directions.
   That is what makes it unsatisfiable by a corpus-wide rewrite of one phrase: rewriting
   every attribution to say `session` fails every one of Bob's real rulings, and the
   reverse fails every session's commit.

   THE PREDICATE LIVES IN `tools/attribution.mjs`, imported rather than written here, for
   the reason section 2c already states: `plancheck.mjs` self-executes and cannot be
   imported by the driver that drives its arms. `tools/nc-m039.mjs` drives it. */

{
  const { attributionAudit, attributionMessage } = await import("./attribution.mjs").catch(() => ({}));
  if (!attributionAudit) {
    warn(`attribution.mjs could not be loaded — attribution pairings are UNGRADED this run.`);
  } else {
    const at = attributionAudit({ repo: ROOT });
    notes.push(`attribution: ${at.graded.length} actor-to-citation binding(s) over ${at.corpus} file(s); `
      + `${at.undetermined.length} undetermined; ${at.excluded.length} path(s) outside the corpus`);
    for (const u of at.undetermined)
      warn(`ATTRIBUTION UNDETERMINED — ${u.file}:${u.line} cites ${u.cited} and ${u.why}.\n`
         + `        Undetermined is first-class and is printed as itself; it is a QUESTION, never a pass.`);
    if (at.findings.length) fail(attributionMessage(at.findings));
  }
}

/* ------------------------------------------- 2b. THE DECIDED INDEX IS OUT OF THE COMMITTED TREE (M0-99)

   `docs/DECIDED.md` is GENERATED from every ruling in the corpus (tools/decided.mjs), and it
   exists because a session cannot read the 565k tokens its kickoff demands and so re-asks
   questions the record already answered.  UNTIL 2026-09-22 THIS ARM FAILED ON A STALE COPY,
   and that was right while the index was COMMITTED: a stale committed copy answers a session's
   question with last week's ruling.  M0-99 took the index out of the committed tree
   (`ORCHESTRATION.md` §"THE RECORD IS PARTITIONED BY WRITER", rule 2) — it is produced on demand
   through `decided.mjs`'s one freshness call — so no commit can carry a stale copy, and the
   staleness arm retired with the thing it guarded.

   WHAT REPLACES IT IS THE LIAR'S ARM, NOT NOTHING.  Keeping the file committed under `merge=ours`
   would stop the conflicts and hide the staleness, and `.gitignore` does not apply to a tracked
   file, so a merge that keeps a pre-M0-99 branch's copy re-tracks it with no word from git.  This
   arm FAILS on a TRACKED copy, and on an index the repository's own `.gitignore` does not ignore.
   The predicate is `decided.mjs`'s `indexTracking()`, so the gate, the suite and the tool read one
   answer. */

{
  const { indexTracking } = await import("./decided.mjs").catch(() => ({ indexTracking: null }));
  if (!indexTracking) {
    warn(`decided.mjs could not be loaded — whether docs/DECIDED.md is out of the committed tree is UNVERIFIED this run.`);
  } else {
    const it = indexTracking({ repo: ROOT });
    if (it.undetermined) {
      warn(`docs/DECIDED.md's tracking is UNDETERMINED — git did not answer (${it.why}).`);
    } else {
      if (it.tracked)
        fail(`TRACKED — docs/DECIDED.md is in the index; it is generated on demand and never committed (M0-99).\n`
           + `        A merge that kept a pre-M0-99 branch's copy, or \`git add -A\` over that modify/delete\n`
           + `        conflict, re-tracks it silently. Run \`git rm --cached docs/DECIDED.md\` and commit.`);
      if (!it.ignored)
        fail(`NOT IGNORED — the repository's .gitignore does not ignore docs/DECIDED.md`
           + `${it.rule ? ` (the rule that matched: ${it.rule})` : ""}.\n`
           + `        Without that line the next \`git add -A\` commits the generated index again.`);
      if (!it.tracked && it.ignored) notes.push(`decided index: out of the committed tree (${it.rule})`);
    }
  }
}

/* ------------------------------------------- 2b'. WHAT IS BUILT AGREES WITH THE CODE (2026-09-18)

   `docs/architecture/construct-status.json` is the single source of truth for what is BUILT,
   ruled necessary by Bob 2026-09-18, and `BIO_System_Design.md` §3's state column is rendered
   from it. `tools/status.mjs --check` re-runs every probe; any disagreement, in either
   direction, or a §3 column that differs from its rendering, fails here as it fails at the push. */
{
  let out = "", code = 0;
  try {
    out = execSync(`${JSON.stringify(process.execPath)} ${JSON.stringify(join(ROOT, "tools/status.mjs"))} --check`,
      { cwd: ROOT, stdio: "pipe", encoding: "utf8" });
  } catch (e) { code = e.status || 1; out = `${e.stdout || ""}${e.stderr || ""}`; }
  const line = (out.match(/status: \d+ claims, \d+ probes[^\n]*/) || [])[0];
  if (code === 0 && line) notes.push(`construct status: ${line.replace(/^status: /, "")}`);
  else fail(`CONSTRUCT STATUS DISAGREES WITH THE CODE (or did not run) — \`node tools/status.mjs --check\`:\n`
          + out.split("\n").filter((l) => /^(DRIFT|STALE|MISSING|  )/.test(l)).slice(0, 12).map((l) => `        ${l}`).join("\n")
          + `\n        Update docs/architecture/construct-status.json to what the code says, then --write.`);
}

/* ------------------------------------------- 2c. THE PUSH GUARD, ARMED BY THIS GATE (M0-56, D-406, D-293)

   `tools/pushguard.mjs` runs at the push, the one moment that is after the last rebase: it
   refuses a push whose tip tree `gates.mjs` recorded RED (D-293), one carrying merge markers,
   one whose design corpus fails `corpuscheck`, and one whose construct status disagrees with
   the code.  M0-56 built it for a fifth refusal — a stale COMMITTED `docs/DECIDED.md`, which a
   rebase could stale under a correct index with nobody touching anything — and that refusal
   retired on 2026-09-22 with the committed index (M0-99, arm 2b above).  The file carries the
   argument, the alternatives it beat, and its limits.

   THIS WRITES `.git/hooks/pre-push` AND SAYS SO BELOW.  It is NOT the gate mutating the tree
   it is measuring — that objection is what killed the regenerating-gate candidate, and it is
   answered rather than dodged: `.git/` is not tracked, not in the working tree, not in
   `git status`, and not an input to any arm of this gate.  `pushguard.test.mjs` asserts
   `git status --porcelain` is byte-identical across an install. */

{
  const pg = await import("./pushguard.mjs").catch(() => null);
  if (!pg) {
    warn(`pushguard.mjs could not be loaded — the push guard is NOT armed this run.`);
  } else {
    const r = pg.install({ repo: ROOT });
    if (r.action === "installed" || r.action === "replaced") {
      notes.push(`push guard: ${r.action.toUpperCase()} — WROTE ${r.path} (in .git/, not in the working tree)`);
    } else if (r.action === "current") {
      notes.push(`push guard: armed at ${r.path}`);
    } else if (r.action === "newer") {
      /* A NEWER hook of OURS is armed — `install()` left it alone rather than downgrade it — so it is
         a note, never "NOT armed". Until M0-99 this fell to the warning below and told a checkout
         older than the hook that its pushes were unguarded, which was false. */
      notes.push(`push guard: armed at ${r.path} by a NEWER hook (v${r.installedVersion}), left alone — this checkout is older than the hook`);
    } else {
      warn(`push guard NOT armed — ${r.reason}.\n`
         + `        A push of a tree the gate recorded RED, or one carrying merge markers or design-corpus\n`
         + `        or construct-status drift, will not be refused in this clone.`);
    }

    /* D-406. THE HOOK ALONE IS NOT THE GUARD.  It is installed once for the whole clone
       but RESOLVES ITS SCRIPT PER-WORKTREE, so in a checkout whose commit predates M0-56
       it fired, found nothing to run, printed one stderr line and allowed the push —
       measured at 6 of 9 worktrees INCLUDING THE MAIN CHECKOUT, and again at 5 of 15 here.
       The clone-wide copy is what closes that, so it is installed on the SAME schedule and
       for the same reason: a mechanism that is not in the loop the reader runs is not a
       mechanism.  Reported SEPARATELY from the hook — an arming that half happened must
       not read as one that did. */
    if (typeof pg.installCopy !== "function") {
      warn(`pushguard.mjs has no installCopy — the clone-wide fallback is NOT armed.\n`
         + `        Every worktree whose commit predates the guard pushes UNGUARDED (D-406).`);
    } else {
      const c = pg.installCopy({ repo: ROOT });
      if (c.action === "installed" || c.action === "replaced") {
        notes.push(`push guard copy: ${c.action.toUpperCase()} — WROTE ${c.path} (in .git/, not in the working tree)`);
      } else if (c.action === "current") {
        notes.push(`push guard copy: armed at ${c.path} — worktrees predating the guard are covered`);
      } else {
        warn(`push guard copy NOT armed — ${c.reason}.\n`
           + `        The hook is shared by every worktree but resolves its script per-worktree,\n`
           + `        so any checkout predating the guard pushes UNGUARDED (D-406).`);
      }
    }
  }
}

/* ------------------------------------------- 3. THE DECISION CHANNEL */

const decisions = read("docs/development/DECISIONS.md");
if (!decisions) {
  fail(`MISSING — docs/development/DECISIONS.md does not exist, so a decision raised by`
     + ` a worker\n        or by CONDUCT has nowhere to go but a session window.`);
} else {
  /* Split into chunks rather than one lazy regex: with the `m` flag a trailing `$`
     alternative matches at the FIRST line end, so the body came back empty and every
     entry looked as though it had no fields. Caught by the check reporting a missing
     `provisional:` on two entries that plainly had one — which is the negative control
     doing its job on the instrument itself. */
  const entries = decisions.split(/^###\s+(?=DEC-)/m).slice(1).map((chunk) => {
    const head = chunk.match(/^(DEC-\d+)\s+·\s+(open|answered|deferred|enacted)\b/);
    return head ? [null, head[1], head[2], chunk] : null;
  }).filter(Boolean);
  const field = (body, name) => {
    const m = body.match(new RegExp(`^${name}:[^\\S\\n]*(.*)$`, "m"));
    if (!m) return null;
    /* a field's value may continue on indented following lines */
    const rest = body.slice(body.indexOf(m[0]) + m[0].length)
      .split("\n").slice(1);
    let v = m[1].trim();
    for (const l of rest) { if (!/^\s{2,}\S/.test(l)) break; v += " " + l.trim(); }
    return v;
  };
  let open = 0, pending = 0;
  for (const [, id, status, body] of entries) {
    if (status === "open" || status === "deferred") {
      if (status === "open") open++;
      /* The productivity rule, made structural: an unsettled decision must never be a
         stopped session. Bob, 2026-07-31: never block on getting my answer. */
      if (!field(body, "provisional"))
        fail(`${id} is ${status} with no \`provisional:\` line — so either work is BLOCKED\n`
           + `        on Bob, or nobody said what is running meanwhile. Neither is acceptable:\n`
           + `        state what runs, or state that nothing is blocked.`);
    }
    if (status === "deferred" && !field(body, "trigger"))
      /* A deferral with no trigger is how the same question gets re-raised and
         re-answered forever. Bob's "I AGAIN suggest" on DEC-2 is what earned this. */
      fail(`${id} is deferred with no \`trigger:\` — name the condition that reopens it,\n`
         + `        or the question will be re-asked and re-answered indefinitely.`);
    if (status === "answered" && !field(body, "response"))
      fail(`${id} is marked answered and carries no \`response:\`.`);
    if (field(body, "decided") && !field(body, "enacted")) pending++;
    if (status === "enacted") {
      const e = field(body, "enacted");
      /* The whole point of the file over a chat window: the REASONING lands
         somewhere durable, not just the verdict. */
      if (!e || !/\.md\b/.test(e))
        fail(`${id} is enacted and its \`enacted:\` line names no DOCUMENT carrying the\n`
           + `        reasoning. A verdict with no reasoning in the record is a transcript.`);
    }
  }
  if (pending) warn(`${pending} decision(s) decided and not yet enacted — CONDUCT owes`
                  + ` an enactment (DECISIONS.md).`);
  notes.push(`decisions: ${open} open, ${pending} awaiting enactment, ${entries.length} total`);

  const bobKick = read("docs/development/kickoffs/BOB.md");
  const conductKick = read("docs/development/kickoffs/CONDUCT.md");
  if (bobKick && !/DECISIONS\.md/.test(bobKick))
    fail(`MECHANISM NOT IN THE LOOP — DECISIONS.md exists and kickoffs/BOB.md never`
       + ` mentions it,\n        so nothing surfaces an open decision to Bob.`);
  if (conductKick && !/DECISIONS\.md/.test(conductKick))
    fail(`MECHANISM NOT IN THE LOOP — DECISIONS.md exists and kickoffs/CONDUCT.md never`
       + ` mentions\n        it, so nothing lifts items in or drains answers out.`);
}

/* --------------------------------------- 4. ORPHANED ARCHITECTURE (warn) */

if (interfaces && queue) {
  for (const m of interfaces.matchAll(/^##\s+(I\d+)\s+—([^\n]*)\n([\s\S]*?)(?=\n##\s+I\d+\s+—|$)/gm)) {
    const [, id, , body] = m;
    if (/\*\*Status:\*\*\s*PROVISIONAL/.test(body) && !new RegExp(`\\b${id}\\b`).test(queue))
      warn(`${id} is PROVISIONAL and no queue item references it — architecture with no\n`
         + `        path to work. Either queue what confirms it, or say in the registry why not.`);
  }
}

const inbox = queue && /##\s+BOB INBOX/.test(queue);
if (queue && !inbox)
  fail(`NO BOB INBOX — QUEUE.md has no inbox section, so a BOB session has no way to hand\n`
     + `        a change over without editing CONDUCT's file (ORCHESTRATION.md).`);

const conduct = read("docs/development/kickoffs/CONDUCT.md");
if (conduct && inbox && !/INBOX/.test(conduct))
  fail(`MECHANISM NOT IN THE LOOP — the BOB INBOX exists and kickoffs/CONDUCT.md never\n`
     + `        mentions it, so nothing drains it. A mechanism that is not in the loop the\n`
     + `        reader actually runs is not a mechanism.`);

/* ------------------------------------------- 6. THE DESIGN CORPUS SAYS WHAT IT LACKS

   Bob, 2026-09-14: every design document carries front matter — a completeness
   self-description, a table of contents, and an EXPLICIT list of incomplete sections —
   and that front matter is always current. The receipt is the Content Framework: approved
   2026-07-30, then 46 days unreferenced by the orientation set and never saying what it
   lacked, while the construct it owned went undesigned. `tools/corpuscheck.mjs` is the
   enforcement (docs/architecture/CORPUS-STANDARD.md is the standard); a governed document
   that drifts FAILS here, the way a stale COMMITTED ruling index did until M0-99, because a front matter that
   is allowed to rot answers a reader with last month's completeness. */

{
  const { governed, checkFile, coverage, statusAuthority } = await import("./corpuscheck.mjs").catch(() => ({}));
  if (!governed) {
    warn(`corpuscheck.mjs could not be loaded — the design corpus front matter is UNVERIFIED this run.`);
  } else {
    let n = 0, bad = 0;
    for (const p of governed()) {
      const r = checkFile(p, { git: !LOCAL_ONLY });
      n++;
      for (const f of r.fails) { bad++; fail(`CORPUS — ${f}`); }
    }
    notes.push(`design corpus: ${n} governed document(s), ${bad} front-matter failure(s)`);
    /* M0-43: the front-matter arm above is only as wide as §5's HAND-KEPT table, so a design
       document added under `docs/development/` and never rowed is checked by nothing — the
       blind part M0-41's census named. The coverage audit walks that directory and fails on
       any file the standard does not classify. It is git-free, so it runs identically under
       `--local`, unlike the date arm. The NOTE states the classification rather than an
       absence of complaint: `0 fail` cannot distinguish a clean corpus from an unread one. */
    const cov = coverage();
    for (const f of cov.fails) fail(`CORPUS — ${f}`);
    notes.push(`design corpus coverage: ${cov.population.length} document(s) under docs/development/ `
      + `— ${cov.governed.length} governed, ${cov.excluded.length} excluded, `
      + `${cov.undecided.length} undecided (D-388), ${cov.unclassified.length} unclassified`);
    /* M0-57: Bob ruled `BIO_System_Design.md` §3 the SINGLE AUTHORITY on design status on
       2026-09-17. A second document that RESTATES that status is a copy, and a copy rots — the
       receipt is a session telling Bob the claim class was undesigned on the strength of a to-do
       table, six weeks after the design existed. Git-free, so it runs identically under
       `--local`. The note states what was EVALUATED and what could not be RESOLVED, because
       `0 fail` cannot tell one authority from an arm that asked nothing. */
    if (statusAuthority) {
      const auth = statusAuthority();
      for (const f of auth.fails) fail(`CORPUS — ${f}`);
      for (const u of auth.unresolved) warn(`CORPUS — design-status citation UNRESOLVED: ${u}`);
      notes.push(`design status: one authority (BIO_System_Design.md §3) — ${auth.rows} construct row(s), `
        + `${auth.pairs.length} cited pair(s) evaluated, ${auth.unresolved.length} unresolved`);
    } else {
      warn(`corpuscheck.mjs loaded without statusAuthority — design status is UNVERIFIED this run.`);
    }
  }
}

/* ------------------------------------------- 7. A ROW NAMES THE DESIGN IT BUILDS FROM

   Bob, 2026-09-14, and the rule is `docs/architecture/CORPUS-STANDARD.md` §4.7: a queue row
   names the governed design document and SECTION that is its scope's authority, and the
   worker reads that section before the code. The receipt is the standard's own §1 — the
   content construct sat undesigned for 46 days while items were built from ledger entries and
   briefs, so the construct's document never learned what was built.

   IT IS HERE FOR THE REASON SECTIONS 0, 2b AND 2c ARE: `kickoffs/CONDUCT.md` runs this file
   before every push, and CONDUCT is who writes a row. A rule that lives only in
   `kickoffs/CONDUCT.md` is a mechanism believed on the strength of its existence — this
   repository's most-met defect, and the same paragraph-that-did-not-hold that produced section
   2c. `done`/`blocked`/`superseded` rows are not judged: history is not re-briefed.

   The predicate is `tools/rowdesign.mjs`, imported rather than written here, because
   `plancheck.mjs` self-executes and cannot be imported by the suite that drives its arms —
   the shape `mintid.mjs` and `mergecarry.mjs` already use. The governed set comes from
   `corpuscheck.mjs`'s own `governed()`, so §5's table is READ and no hand list can fall
   behind it. */

{
  /* The rows are the PLAN's — cache ∪ backlog through `ledger.mjs`' one lister (D-430); the note
     prints both files' counts so a reader can see the backlog was read. */
  const { rowDesignAudit, rowMessage, whereOf } = await import("./rowdesign.mjs").catch(() => ({}));
  if (!rowDesignAudit) {
    warn(`rowdesign.mjs could not be loaded — the plan's design pointers are UNVERIFIED this run.`);
  } else {
    const a = rowDesignAudit({ repo: ROOT });
    const routed = a.open.filter((r) => r.routed).length;
    notes.push(`queue design pointers: ${a.open.length} open row(s) judged of ${a.rows.length} `
      + `(cache ${a.cacheRows}, backlog ${a.backlogRows}, tail ${a.tailRows}), `
      + `${a.skipped.length} closed row(s) not judged, ${a.findings.length} naming no design`
      + (routed ? `, ${routed} explicitly ROUTED as a missing design` : "")
      + ` (governed set: ${a.governedCount} document(s), read from CORPUS-STANDARD.md §5)`);
    /* A state this file does not understand is NAMED, never scored zero — a row typo'd into
       an unjudged state is exactly how a rule stops applying without anyone deciding it. */
    if (a.unknownState.length)
      warn(`UNKNOWN ROW STATE — ${a.unknownState.length} plan row(s) carry a state token that is\n`
         + `        neither judged nor explicitly closed, so the §4.7 check does not reach them:\n`
         + a.unknownState.map((r) => `          ${r.id} · ${r.state} (${whereOf(r)})`).join("\n"));
    if (a.findings.length) fail(rowMessage(a.findings));
  }
}

/* ------------------------------------- 2e. DOES THE NAMED DESIGN COVER THE CONSTRUCT?

   D-404, ruled by Bob 2026-09-17: *"BOB must be responsible for the design being complete
   and the underlying substrate built before those elements that rely on substrate being
   built."* Section 2d asks whether a row NAMES a design. This asks whether the design it
   names SAYS ANYTHING ABOUT what the row builds — and REC-116 is the receipt: it named a
   real document and a real section that mentions its construct ZERO times, and passed 2d.

   IT IS A NOTE, NOT A WARN, AND THE REASON IS ITS OWN MEASURED PRECISION. On its first run
   it produced four findings: one verified a GENUINE open question (REC-117), one verified
   FALSE (REC-115's section is topically exactly right and simply does not write the op's
   name), two unverified. A section may describe a construct in prose without ever writing
   its identifier — that is legitimate design writing. So this surfaces a QUESTION and must
   never read as a verdict; `rowsubstrate.mjs`'s header carries the full account, including
   a second signal that was WITHDRAWN after firing four times and being wrong four times. */

/* ------------------------------------------- 2g. WHAT EACH LANE STILL OWES

   D-409. `kickoffs/BOB.md` rule 10 says a lane keeps going while its list is non-empty, and
   when that rule was written THERE WAS NO LIST — the commitments lived in prose, in messages,
   reachable by nobody. Bob, 2026-09-17: *"This isn't just a bug in idleness, but a failure to
   document (in the repo) and follow the commitments you've made."*

   The obligations were already written down; what was missing was any way to SEE them together.
   Its first honest run surfaced D-394 — a design act this lane had been told it owed, had not
   done, and had not mentioned in hours of reporting. A promise nobody can enumerate is a
   promise nobody keeps. */

{
  const { owedFor } = await import("./owed.mjs").catch(() => ({}));
  if (!owedFor) {
    notes.push(`owed.mjs could not be loaded — no lane's outstanding list was read this run.`);
  } else {
    for (const lane of ["BOB", "CONDUCT"]) {
      const o = owedFor(lane, { repo: ROOT });
      if (o.unreadable.length) { warn(`OWED BY ${lane} is UNKNOWN — could not read `
        + `${o.unreadable.join(", ")}. An unreadable ledger is not an empty one.`); continue; }
      /* THE TWO POPULATIONS ARE PRINTED APART, because summing them is a figure that costs
         nothing to produce: a lane that DOES NOT EXIST comes back with the whole residue list.
         Found 2026-09-17 by CONDUCT #3's discrimination control, after this arm's first version
         printed the summed count and its author repeated the wrong figure to another lane. */
      notes.push(`owed by ${lane}: ${o.counts.attributed} ATTRIBUTED`
        + (o.counts.attributed ? ` — ${o.attributed.map((i) => i.id).join(", ")}` : "")
        + `; ${o.counts.residue} open residue attributed to NOBODY`
        + (o.counts.residue ? ` — ${o.residue.map((i) => i.id).join(", ")}` : ""));
    }
  }
}

/* ------------------------------------------- 2h. THE LEDGERS STAY SMALL, ORDERED AND CURRENT (LED-2)

   Bob, 2026-09-18, through BOB #14's inbox entry. The August roll moved 195 closed QUEUE rows and
   110 closed DEBT rows to the archive and THE FILES GREW BACK, because it was a one-off cleanup with
   no standing step — by 2026-09-18 QUEUE.md was 1.17 MB again and 338 of its rows were closed.
   `tools/ledger.mjs archive <ID>` is the standing step; these arms make forgetting it visible.

     (a) and (b) WERE the DEBT halves — no CLOSED row in the live DEBT ledger, and a size budget per open DEBT
         row. Both are RETIRED with the construct (M0-140, 2026-09-24): the ledger has no live file. Their QUEUE
         halves, which is what remains of this arm, are P2 and P5 below.
     (c) every open row's `depends-on` resolves — to an open row, a done row (live or archived), or
         a `tools/status.mjs` claim reading BUILT — across the cache AND the backlog.

   (a) and (b) WARN until the row that makes them satisfiable is `done` — LED-3 (the migration) for
   (a), LED-7 (the fold) for (b) — and then FAIL. The switch is READ from the ledger on every run,
   so nobody has to remember to flip it; a missing arming row is itself a FAIL, because an arm that
   can never arm is the arm-that-did-not-arm class — and so, since LED-6, is an arming row that is
   `superseded`: (b) was keyed on LED-4, LED-4 was superseded, so it could never arm and nothing
   said so. (c) FAILs now. A dependency that names NO id is prose the gate cannot judge, and is
   printed as such rather than scored. And the module failing to load is a FAIL, not a note: a gate
   that degrades to green when its predicate is missing is the defect CONDUCT #11 measured in this
   file's own arms.

   THE WORK PIPELINE'S FIVE INVARIANTS (LED-6, `WORK-PIPELINE.md` §2), each its own arm, computed
   by `ledger.mjs`'s `pipelineInvariants` over the cache (`QUEUE.md`) and the backlog (`BACKLOG.md`) with its tail
   (`BACKLOG-LATER.md`, M0-119 — the same order continued; absent is an empty tail):
     P1 every open id in EXACTLY ONE of the three — FAILs now (it holds on the real ledgers);
     P2 no closed row in either — armed with (a)'s LED-3, as the QUEUE half of (a) always was;
     P3 the cache ≤ 16 rows (`CACHE_ROWS`), none `blocked`; P4 every open cache row's depends-on MET; P5 both files
     within budget (cache 48 KiB / row 3 KiB, backlog 150 KiB / row 2 KiB) — WARN until LED-6 is
     done, because none can hold before the migration (§5 steps 2–4), then FAIL. */

{
  const L = await import("./ledger.mjs").catch((e) => ({ loadError: e }));
  if (!L.ledgerAudit) {
    fail(`LEDGER GATE UNLOADABLE — tools/ledger.mjs could not be imported (${L.loadError?.message || "no ledgerAudit"}),\n`
       + `        so no closed-row, budget, depends-on or pipeline arm ran. An unrun gate is not a passing one.`);
  } else {
    const a = L.ledgerAudit({ repo: ROOT });
    for (const u of a.unreadable) fail(`LEDGER UNREADABLE — ${u}. An unreadable ledger is not an empty one.`);
    for (const [arm, s] of Object.entries(a.arming)) {
      if (!s.found) fail(`LEDGER ARM CANNOT ARM — arm "${arm}" is switched by ${s.row}, which is in neither the live\n`
        + `        ledger nor its archive, so the arm would WARN forever. Repoint ARMING in tools/ledger.mjs.`);
      else if (s.state.split("/").every((x) => x === "superseded"))
        fail(`LEDGER ARM CANNOT ARM — arm "${arm}" is switched by ${s.row}, which is SUPERSEDED and so can never be\n`
          + `        done; the arm would WARN forever. Repoint ARMING in tools/ledger.mjs to the row that replaced it.`);
    }
    /* STATE READ FROM `coord` NEVER DECIDES THE GATE'S VERDICT (Bob, 2026-09-23: a red GitHub run emails him as an
       alarm, TREE-SHARING §3 (c)). Under `--local` — the form `gates.mjs` runs — on a SWITCHED tree these ledgers are
       `coord`'s, not this tree's, and a gate record is keyed by the tree (D-293): a verdict that moves with live state
       is not a verdict about the tree. MEASURED: `land/conduct/batch6` read RED twice on GitHub because coord's
       BACKLOG.md was 381 B over a budget the batch itself tightened (M0-119). `coord.mjs write` runs the same arms
       (LC-ledger) before every push, so the state is still enforced where it is WRITTEN; here it is reported, loudly. */
    const say = (armed) => (armed ? stateFail : warn);
    /* The CLOSED-ROWS-IN-THE-LIVE-DEBT-LEDGER report and the DEBT-ROWS-OVER-BUDGET report WERE HERE, keyed on
       `a.closedLive.DEBT` and `a.arming.debtBudget`. Retired with the construct (M0-140): `ledgerAudit` no longer
       walks a DEBT ledger, so both would read an empty list for ever — a check that cannot fail. */
    notes.push(`ledger sizes: ${a.budget.ledgers.map((x) => `${x.ledger} ${x.bytes} B`
      + (x.budget === null ? " (no whole-file budget named)" : ` of ${x.budget}`)).join(", ")}`);
    if (!a.claimsReadable)
      warn(`DEPENDS-ON: docs/architecture/construct-status.json unreadable — a dependency on a status claim cannot resolve this run.`);
    notes.push(`depends-on: ${a.depends.checked} dependency id(s) checked across the open rows, `
      + `${a.depends.unresolved.length} unresolved; ${a.depends.prose.length} row(s) name a dependency in PROSE the gate cannot judge`
      + (a.depends.prose.length ? ` (${a.depends.prose.map((p) => p.id).join(", ")})` : ""));
    if (a.depends.unresolved.length)
      stateFail(`DEPENDS-ON DOES NOT RESOLVE — ${a.depends.unresolved.length}:\n`
        + a.depends.unresolved.map((u) => `          ${u.id} (${u.file}:${u.line}) depends on ${u.dep}: ${u.why}`).join("\n")
        + `\n        A dependency resolves to an open row, a done row (live or archived: \`node tools/ledger.mjs find <ID>\`),\n`
        + `        or a \`tools/status.mjs\` claim reading BUILT.`);
    if (a.pipeline) {
      const P = a.pipeline;
      notes.push(`pipeline: cache ${P.cacheRows} row(s), backlog ${P.backlogRows} row(s), tail ${P.tailRows} row(s)`
        + `${a.absent.includes(L.LEDGERS.LATER.live) ? " (tail file absent: an empty tail)" : ""}; `
        + Object.entries(P.arms).map(([k, x]) => `${k} ${x.violations.length ? (x.armed ? "FAIL" : "WARN") : "pass"}`).join(", "));
      for (const [k, x] of Object.entries(P.arms)) {
        if (!x.violations.length) continue;
        say(x.armed)(`PIPELINE INVARIANT ${k} — ${x.title}: ${x.violations.length} violation(s) (`
          + (x.armed ? "FAIL" : `WARN until ${L.ARMING.pipeline} is done — the migration makes it satisfiable`) + `):\n`
          + x.violations.slice(0, 8).map((v) => `          ${L.describeViolation(k, v)}`).join("\n")
          + (x.violations.length > 8 ? `\n          … ${x.violations.length - 8} more (node tools/ledger.mjs invariants)` : ""));
      }
      if (P.unjudged.length)
        warn(`PIPELINE: ${P.unjudged.length} row(s) carry a state that is neither open nor closed, so P1 and P2 cannot judge them: `
          + P.unjudged.map((u) => `${u.id} · ${u.state} (${u.where}:${u.line})`).join(", "));
    }
  }
}
function ARMING_NOTE(a, arm) { return `${a.arming[arm].row} is done, so this arm is armed`; }

/* ---------------------------------- 2e'. THE READING BUDGET (`CLAUDE.md` §1; Bob, 2026-09-18)

   The files every session must READ WHOLE — CLAUDE.md, a lane's kickoff, its -NEXT handoff — each
   have a size budget in `tools/readbudget.mjs`, so a session can hold its whole required reading
   rather than scan it. Over budget WARNs until that file's cut has landed (it is listed in CUT), then
   FAILs, the arming `ledger.mjs` uses. QUEUE.md's budget is the ledger gate's, above, not this one's.
   The module failing to load is a FAIL, for the reason the ledger gate gives. */
{
  const R = await import("./readbudget.mjs").catch((e) => ({ loadError: e }));
  if (!R.check) {
    fail(`READING BUDGET UNLOADABLE — tools/readbudget.mjs could not be imported (${R.loadError?.message || "no check"}).`);
  } else {
    const over = R.check(ROOT);
    notes.push(`reading budget: ${R.readSet(ROOT).length} read-whole file(s), ${over.length} over budget`);
    for (const o of over)
      (o.verdict === "FAIL" ? fail : warn)(`READING BUDGET — ${o.file} is ${o.bytes} B against ${o.budget} B`
        + (o.verdict === "FAIL" ? ` and its cut has LANDED, so it has grown back. Cut it again.`
           : `; WARN until its cut lands (then add it to CUT in tools/readbudget.mjs). The owner of the file cuts it.`));
  }
}

/* ---------------------------------- 2f. UNDESIGNED CLAIMS NOBODY HAS RE-READ

   D-408, and it is the OTHER DIRECTION from 2e. Every arm in this file is pointed at the
   record claiming MORE than it can support. A sentence saying *X is undesigned* claims LESS
   and passes all of them — `CLAUDE.md`'s *a blocker is a claim, and nothing here audits one*.
   The sweep found 21 such claims across 9 governed documents and EIGHT WERE STALE, including
   a contradiction between the construct map (case-making: built) and D-127 (undesigned),
   copied into three more documents.

   A stale one is worse than a stale debt row: a row invites you to close it, an *undesigned*
   invites everyone to stay away, so it is self-preserving. This arm exists because the sweep
   that cleared them was a one-off, and a one-off does not survive the next six weeks. */

{
  const { sweep } = await import("./undesignedclaims.mjs").catch(() => ({}));
  if (!sweep) {
    notes.push(`undesignedclaims.mjs could not be loaded — undesigned-claims are UNAUDITED this run.`);
  } else {
    const u = sweep({ repo: ROOT });
    notes.push(`undesigned claims: ${u.counts.unaudited} UNAUDITED of ${u.counts.claims} across `
      + `${u.counts.governed} governed document(s) (${u.counts.audited} carry a dated verdict)`);
    /* A NOTE, never a warn: an undesigned-claim is a QUESTION for a reader, and a fresh one is
       the NORMAL state the day someone writes it honestly. What it must never be is invisible. */
    if (u.counts.unaudited)
      notes.push(`  undated: ${u.byDoc.filter((d) => !d.unreadable)
        .map((d) => `${d.path.split("/").pop()}:${d.claims.filter((c) => !c.audited)
        .map((c) => c.line).join(",")}`).join("; ")} — read the construct map before believing one (D-408)`);
  }
}

{
  const { substrateAudit } = await import("./rowsubstrate.mjs").catch(() => ({}));
  if (!substrateAudit) {
    notes.push(`rowsubstrate.mjs could not be loaded — design COVERAGE is unexamined this run.`);
  } else {
    const a = substrateAudit({ repo: ROOT });
    notes.push(`design coverage: ${a.counts.judged} open row(s) judged, ${a.counts.uncovered} whose `
      + `cited section names none of the row's own symbols (a QUESTION, not a verdict), `
      + `${a.counts.unjudged} unjudged because the question is not askable of them`);
    if (a.findings.length)
      notes.push(`  substrate not evident: ${a.findings.map((f) => f.id).join(", ")} — read the cited `
        + `section, then correct the pointer, write the design, or route the gap (D-404)`);
  }
}

/* ------------------------------------------- 8. A DELEGATION STATES ITS OWN STATE, DATED

   M0-37, from BOB #11's sentence of 2026-09-15: EVERY REGISTER IN THIS PROJECT CAN STATE THE
   PAST AS THE PRESENT, AND NONE OF THEM FAILS LOUDLY WHEN IT DOES. A `DELEGATION` block in
   `CLAIMS.md` carries exactly one date — the one it was RAISED on — so a block that was true
   when it was written is indistinguishable from one that is true now, forever and silently.

   IT IS HERE RATHER THAN ONLY IN A KICKOFF FOR THE REASON SECTIONS 6 AND 7 ARE: this file is
   in the loop CONDUCT actually runs, and the receipt is section 6's own — D-288 sat `open`
   for five weeks WITH a disposition, so the one arm that reads DEBT.md was satisfied for the
   entire period the exposure was total. A rule that lives only in a kickoff is a mechanism
   believed on the strength of its existence.

   THE PREDICATE IS `tools/delegations.mjs`, imported rather than written here — the shape
   `rowdesign.mjs` and `mergecarry.mjs` already use, because `plancheck.mjs` self-executes and
   cannot be imported by the suite that drives its arms.

   THE GIT ARM IS SKIPPED UNDER `--local`, and it is the same limit `corpuscheck`'s date arm
   has: a line edited in this turn blames to `Not Committed Yet`, so a claim about when it was
   written CANNOT FIRE BEFORE THE COMMIT. `gates: GREEN` therefore does not imply a bare
   `plancheck` green for a turn that re-affirms a block; run bare after committing. */

{
  const { delegationAudit, delegationMessage, CORPUS_FLOOR } =
    await import("./delegations.mjs").catch(() => ({}));
  if (!delegationAudit) {
    /* THIS ARM FAILS WHERE SECTIONS 6 AND 7 WARN, AND THE DIVERGENCE IS DELIBERATE.
       M0-41 measured the class: with `corpuscheck.mjs` made unloadable, `plancheck` reads
       `0 fail, 2 warn` and EXITS 0 — the design corpus and the row-design rule both
       UNVERIFIED while the run reports success. That is the arm-that-did-not-arm wearing a
       green exit, and M0-39 owns unifying it. This is a NEW arm with no established
       behaviour to change, so it is written closed rather than added to the pile: a
       predicate module that is committed and cannot load is a structural break, not a note.
       Sections 6 and 7 are NOT changed here — that is M0-39's call over three arms at once,
       and a worker quietly re-deciding it inside its own item is how a convention drifts. */
    fail(`delegations.mjs COULD NOT BE LOADED — CLAIMS.md's DELEGATION register is UNVERIFIED,\n`
       + `        and an unverified register is not a clean one (D-233). The predicate is committed;\n`
       + `        if it cannot be imported, that is a break and not a degraded mode.`);
  } else {
    const a = delegationAudit({ repo: ROOT, git: !LOCAL_ONLY });
    /* THE CORPUS IS PRINTED AND FLOORED. A sweep that reports zero because its matcher found
       nothing is one of this row's three named cheap defeats, and it is indistinguishable
       from a clean register unless the reach is stated. Three headline totality assertions in
       this project have passed over an EMPTY corpus. */
    notes.push(`delegation register: ${a.corpus} DELEGATION block(s) in CLAIMS.md — `
      + `${a.discharged.length} discharged, ${a.affirmed.length} affirmed open, `
      + `${a.stale.length} stale, ${a.silent.length} silent, ${a.undated.length} undated `
      + `(threshold ${a.threshold}d, today ${a.today}`
      + (a.gitArm ? "" : "; git arm SKIPPED under --local") + ")");
    if (a.corpus < CORPUS_FLOOR)
      fail(`DELEGATION CORPUS BELOW ITS FLOOR — the walk found ${a.corpus} block(s), floor ${CORPUS_FLOOR}\n`
         + `        (measured 49 on 2026-09-16). A matcher that stops matching reports a clean register,\n`
         + `        which is exactly the answer a broken walk gives. Establish which before moving the floor.`);
    /* THE COHORT IS REPORTED AND NEVER GATED, because a blanket date stamp and an honest
       sweep make the SAME shape and this instrument cannot tell them apart. Surfacing it is
       what lets a reader do what the instrument cannot (M0-42's limit, stated at the site). */
    if (a.largestCohort && a.largestCohort[1] > 1)
      notes.push(`delegation cohort: ${a.largestCohort[1]} of ${a.affirmed.length} open block(s) were `
        + `affirmed on ${a.largestCohort[0]} — a blanket stamp and an honest sweep look identical here, `
        + `and this check does not claim to tell them apart`);
    if (a.unjudgeable.length)
      notes.push(`delegation git arm: ${a.unjudgeable.length} affirming line(s) NOT COMMITTED on this tree, `
        + `so their dates are UNVERIFIED this run — not clean, unverified (D-233)`);
    if (a.perennial.length)
      notes.push(`delegation perennials: ${a.perennial.length} block(s) re-affirmed 3+ times without closing — `
        + `a candidate for a QUEUE row rather than a register line, which is CONDUCT's call and not this check's`);
    if (a.contradictory.length)
      warn(`CONTRADICTORY DELEGATION — ${a.contradictory.length} block(s) carry BOTH a DISCHARGED line\n`
         + `        and an \`open as of\` line. They are judged on the OPEN half, which is the conservative\n`
         + `        reading; if the block is closed, the \`open as of\` line comes out:\n`
         + a.contradictory.map((b) => `          CLAIMS.md:${b.line}`).join("\n"));
    if (a.findings.length) fail(delegationMessage(a));
  }
}

/* ------------------------------ 9. WORK THAT REACHES NOBODY (warn) — D-288's DETECTION half

   RENUMBERED 8 -> 9 by CONDUCT #1 at integration, 2026-09-16. M0-37 and M0-48 ran in the
   same wave, neither could see the other, and BOTH added a section 8 — the id-collision
   shape arriving in a section NUMBER rather than in a ledger id, and appearing at the
   merge exactly as `mintid --audit` predicts for ids. Both arms are KEPT: they are two
   different checks, not two versions of one. M0-37's delegation arm landed on `main`
   first and keeps 8.

   Section 1 above enforces `CLAUDE.md`'s oldest rule — a change is made when it is COMMITTED
   AND PUSHED — for `main` and for the planning surface. NOTHING enforced it for a WORKER's own
   tree, which is where every item's work sits between the worker starting and CONDUCT merging.

   THE RECEIPT IS TWO MEASUREMENTS AND A LOSS. 2026-08-10: 137 local `worktree-agent-*`
   branches, ZERO on the remote; the row then sat `open` for FIVE WEEKS, because section 2's
   debt check fails an open row with NO disposition and this one HAD one — the estate's own
   watchdog was satisfied for the whole period the exposure was total. 2026-09-15: REC-91
   finished, committed and released on its branch, its integrator was stood down before
   merging, and the work reached nobody for a day. 2026-09-16 (M-38): a sweep of all nine
   worktrees found FOUR live exposures in THREE shapes, and the first was M0-48's own worktree
   — the alarm for stranded work was itself stranded work while it was being built.

   IT WARNS AND NEVER FAILS (BOB #12's ruling). A historical local branch is not a defect and
   the inherited ones are deliberately not retroactively pushed; a gate that goes red on
   inherited state gets switched off, which is this estate's own recorded failure mode for
   ratchets. `WORKER.md`'s push step PREVENTS and NOTHING AUDITS PREVENTION — exactly the shape
   that failed. This DETECTS, inside the loop `WORKER.md` step 4 and `kickoffs/CONDUCT.md` step
   1 already run, which is why this item adds no step to either file.

   THREE WINDOWS IN THREE DIFFERENT SETS OF WORDS, because the reader's next act differs:
   never-pushed and behind both want a PUSH, and uncommitted wants a COMMIT that no push can
   substitute for. The unit is the WORKTREE rather than the branch precisely because a branch
   cannot see the third one.

   The predicate is `tools/strandedwork.mjs`, imported rather than written here — the shape
   sections 6 and 7 already use, because `plancheck.mjs` self-executes and cannot be imported
   by the suite that drives its arms. Its header carries why the population comes from git's
   own worktree enumeration rather than from a name glob, why the exemption is read from the
   STATE and never inferred from the tip, and the silent-empty-walk defect its first draft
   shipped. */

{
  const { strandedAudit, strandedMessage } = await import("./strandedwork.mjs").catch(() => ({}));
  if (!strandedAudit) {
    warn(`strandedwork.mjs could not be loaded — stranded work is UNAUDITED this run.`);
  } else {
    /* Under `--local` plancheck is promising not to touch the network, so the remote's list
       comes from the tracking refs and the finding says so. It still RUNS in both modes: a
       worker running `--local` mid-turn is the reader whose tree this most often is. */
    const a = strandedAudit({ repo: ROOT, network: !LOCAL_ONLY });
    notes.push(`stranded work [SCOPE: ESTATE-WIDE, every worktree on this clone]: `
      + `${a.counts.worktrees} worktree(s) + ${a.counts.orphanBranches} `
      + `branch(es) with no worktree judged, ${a.counts.exposed} EXPOSED `
      + `(${a.counts.unpushed} never pushed, ${a.counts.behind} behind, `
      + `${a.counts.uncommitted} uncommitted) — evidence: ${a.source}`
      /* PRINTED rather than left silent: these are units the walk judged NOT stranded because
         some remote ref carries their HEAD under ANOTHER NAME. Reported so the quiet over them
         is visibly a judgement — a reader who knows a tree holds unmerged work and sees it in
         no window can tell *considered and carried* from *never looked at*. */
      + (a.counts.carriedElsewhere
          ? `; ${a.counts.carriedElsewhere} carried by a differently-named remote ref` : ""));
    /* A walk that FAILED is never reported as a clean estate. This predicate's own first draft
       did exactly that — the receipt is in its header — and the rule is CLAUDE.md's: do not
       conclude a value from an absence that has two causes. */
    if (a.walkFailed)
      warn(`stranded work could not be ENUMERATED — this run says NOTHING about stranded\n`
         + `        work, which is not the same as saying there is none.`);
    if (a.remoteFailed)
      warn(`the remote's branch list could not be READ — the finding below, or its absence,\n`
         + `        rests on cached remote-tracking refs and not on the remote.`);
    if (a.treeFailed.length)
      warn(`${a.treeFailed.length} worktree(s) could not be read for uncommitted changes, so\n`
         + `        the third window is UNKNOWN for them: ${a.treeFailed.join(", ")}`);
    if (a.exposed.length) warn(strandedMessage(a));
  }
}

/* ------------------------------------------- 10. THE STATE LIVES ON `coord` (M0-110)

   TREE-SHARING.md §1: the state files moved to the branch `coord`, and each old path on `main` holds a ONE-LINE
   pointer (`tools/coord.mjs`' `pointerText`). Three arms:
     (a) ONCE ANY POINTER IS ON THIS TREE, EVERY STATE PATH IN IT IS EXACTLY ITS POINTER. A merge of a branch cut before
         the cutover can restore a state file's CONTENT over its pointer (a modify/delete-shaped conflict resolved the
         wrong way, or `git add -A` over it); every reader would then read that stale copy as the truth, because the
         pointer is the switch. So a restored file fails here BY NAME, as a hand-edited pointer does.
     (b) NO `origin/main:<state path>` IS LEFT IN THE TRACKED TREE (BOB #27's owed act on the row): a gate or an
         opening that reads a handoff's line 1 there reads the pointer after the cutover, and every such gate fails
         open. History under `docs/archive/` is exempt — it is kept verbatim — and so are the state files
         themselves (a lane's own handoff is its own to rewrite, on `coord`).
     (c) THE LEDGER CHECKS THAT LEFT THE BATTERY (BOB #28's ruling 2) run here against the coord view: the arms no
         section above already runs. `coord.mjs write` runs every one of them before it pushes. */
{
  const C = await import("./coord.mjs").catch((e) => ({ loadError: e }));
  if (!C.ledgerChecks) {
    fail(`COORD LAYER UNLOADABLE — tools/coord.mjs could not be imported (${C.loadError?.message || "no ledgerChecks"}),\n`
       + `        so no reader can follow a state file to coord. An unrun gate is not a passing one.`);
  } else {
    const tracked = (sh("git ls-files") || "").split("\n").filter(Boolean);
    const statePaths = tracked.filter(C.isMovedPath);
    const pointers = statePaths.filter((p) => { const t = (() => { try { return readFileSync(join(ROOT, p), "utf8"); } catch { return null; } })(); return C.isPointer(t); });
    const w = C.whereReads(ROOT);
    if (pointers.length) {
      const wrong = statePaths.filter((p) => { try { return readFileSync(join(ROOT, p), "utf8") !== C.pointerText(p); } catch { return true; } });
      if (wrong.length)
        fail(`STATE FILE ON MAIN IS NOT ITS POINTER — ${wrong.length} of ${statePaths.length} state path(s) on this tree carry\n`
           + `        something other than the exact one-line pointer, so every reader takes that copy as the truth\n`
           + `        (the pointer is the switch). A merge restored content, or a pointer was edited by hand. Restore each\n`
           + `        with the text \`tools/coord.mjs\` pointerText() gives, and put any real change through \`coord.mjs write\`:\n`
           + wrong.slice(0, 12).map((p) => `          ${p}`).join("\n"));
      if (!w.sha)
        fail(`COORD NOT READABLE — this tree is switched to \`${w.ref}\` and that ref does not resolve here, so every\n`
           + `        state file reads as ABSENT. \`git fetch origin coord\` (an unreadable ledger is not an empty one).`);
      notes.push(`coord: this tree is SWITCHED — ${pointers.length} pointer(s); state read from ${w.from}`);
    } else {
      const remoteCoord = sh(`git rev-parse --verify --quiet ${C.DEFAULT_REF}`);
      if (remoteCoord)
        warn(`COORD EXISTS AND THIS TREE STILL CARRIES THE STATE FILES — \`${C.DEFAULT_REF}\` resolves (${remoteCoord.slice(0, 8)})\n`
           + `        but ${C.SWITCH_FILE} here is not its pointer: this checkout predates the cutover. Rebase onto\n`
           + `        origin/main before writing state; a state edit made here lands on the wrong branch.`);
      notes.push(`coord: this tree is NOT switched — state read from the working tree`);
    }
    /* (b) — the pattern is BUILT so this file does not match itself. */
    const ORIGIN_MAIN = "origin" + "/main:";
    const stateRef = new RegExp(ORIGIN_MAIN.replace("/", "\\/") + String.raw`[^\s\x60'")]*(?:CLAIMS\.md|QUEUE\.md|BACKLOG\.md|BACKLOG-LATER\.md|PLACEMENT\.md|-NEXT\.md|archive\/ledgers\/)`);
    const left = [];
    const EK = (await import("./entries.mjs")).kindOf;
    for (const f of tracked) {
      /* `MEASUREMENTS.md` is exempt as the archive is: a figure's record quotes the instrument AS IT WAS RUN, and
         rewriting a dated instrument line would falsify the record (a figure lands with what it measured). */
      /* M0-100: and so is a measurement ENTRY in its own file, which is the same record (`entries.mjs` kindOf). */
      if (f.startsWith("docs/archive/") || EK(f)?.kind === "M" || C.isMovedPath(f)
          || !/\.(md|mjs|js|sh|json|html)$/.test(f)) continue;
      const body = (() => { try { return readFileSync(join(ROOT, f), "utf8"); } catch { return null; } })();
      if (body === null || !body.includes(ORIGIN_MAIN)) continue;
      body.split("\n").forEach((l, i) => { if (stateRef.test(l)) left.push(`${f}:${i + 1}`); });
    }
    if (left.length)
      fail(`A STATE FILE READ FROM origin/main — ${left.length} place(s) read a state file at \`${ORIGIN_MAIN}…\`, which after\n`
         + `        the cutover is the one-line pointer, so the gate or opening that reads it fails open (BOB #27; M0-110).\n`
         + `        Read it with \`node tools/coord.mjs read <path>\` (coord once it exists, main before):\n`
         + left.slice(0, 12).map((x) => `          ${x}`).join("\n"));
    /* (c) */
    const r = await C.ledgerChecks({ repo: ROOT, only: ["LC-markers", "LC-queued-refs", "LC-undecided-route", "LC-op-claims", "LC-strays", "LC-owed-agreement"] });
    for (const a of r.arms) for (const f of a.fails) stateFail(`LEDGER CHECK ${a.id} (${a.title}; moved from ${a.from}) — ${f}`);
    notes.push(`coord ledger checks: ${r.arms.map((a) => `${a.id} ${a.fails.length ? "FAIL" : "pass"}${a.note ? ` (${a.note})` : ""}`).join(", ")}`);
  }
}

/* ------------------------------------------------------------- report */

for (const n of notes) console.log(`  note  ${n}`);
for (const w of warns) console.log(`  WARN  ${w}`);
for (const f of fails) console.log(`  FAIL  ${f}`);

console.log(`\nplancheck: ${fails.length} fail, ${warns.length} warn`
  + (LOCAL_ONLY ? "  (--local: publication checks skipped)" : ""));
if (fails.length) {
  console.log(`\nA change is not made when it is written. It is made when it is committed and\n`
            + `pushed, because the repository is the channel between sessions.\n`);
}
process.exit(fails.length ? 1 : 0);
