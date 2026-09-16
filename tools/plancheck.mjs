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
import { estateVerdict } from "./estatehold.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEV = join(ROOT, "docs/development");
const LOCAL_ONLY = process.argv.includes("--local");

const fails = [], warns = [], notes = [];
const fail = (m) => fails.push(m);
const warn = (m) => warns.push(m);
const read = (p) => { try { return readFileSync(join(ROOT, p), "utf8"); } catch { return null; } };
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
      fail(`UNPUSHED — ${ahead} commit(s) on ${branch} are not on origin/main. Verify from\n`
         + `        the REMOTE, never from your own tree: a local commit is not a published one.\n`
         + `        (On a worker's own branch this is EXPECTED — workers commit and CONDUCT\n`
         + `        integrates. It is a failure on main and a note anywhere else.)`);
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
const debt = read("docs/development/DEBT.md");

for (const [name, body] of [["QUEUE.md", queue], ["MILESTONES.md", milestones],
                            ["INTERFACES.md", interfaces], ["DEBT.md", debt]])
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

if (queue && interfaces) {
  const known = new Set([...interfaces.matchAll(/^##\s+(I\d+)\s+—/gm)].map((m) => m[1]));
  for (const m of queue.matchAll(/^behind-interface:\s*(.+)$/gm)) {
    for (const id of (m[1].match(/\bI\d+\b/g) || []))
      if (!known.has(id))
        fail(`UNREGISTERED INTERFACE — QUEUE.md has an item behind ${id}, which is not in\n`
           + `        INTERFACES.md. An interface not in the registry does not exist and nothing\n`
           + `        may be built against it (PARALLELISM.md).`);
  }
  notes.push(`interfaces registered: ${[...known].sort().join(", ") || "none"}`);
}

if (queue && milestones) {
  const known = new Set([...milestones.matchAll(/^###\s+(M\d+)\s+·/gm)].map((m) => m[1]));
  const used = new Set();
  for (const m of queue.matchAll(/^milestone:\s*(M\d+)/gm)) {
    used.add(m[1]);
    if (!known.has(m[1]))
      fail(`UNKNOWN MILESTONE — QUEUE.md names ${m[1]}, which MILESTONES.md does not define.`);
  }
  const idle = [...known].filter((k) => !used.has(k)).sort();
  if (idle.length)
    notes.push(`milestones with no queued item (normal for later rungs): ${idle.join(", ")}`);
}

if (debt) {
  /* Every OPEN row carries a disposition token, or it is invisible work — which is
     how a standing ruling went two design revisions with nothing scheduling it. */
  const TOKEN = /\|\s*(M\d+|DOCTRINE|ACCEPTED|WATCH|SUPERSEDED|NOT OURS|BOB's)/;
  const RESOLVED = /\|\s*(fixed|resolved|closed|guarded|amended|measured)/i;
  const bad = [];
  for (const line of debt.split("\n")) {
    if (!/^\|\s*D-\d+\s*\|/.test(line)) continue;
    const tail = line.replace(/\s+$/, "");
    const i = tail.lastIndexOf("|", tail.length - 2);
    const status = i >= 0 ? tail.slice(i).replace(/^\|\s*|\s*\|$/g, "").trim() : "";
    if (TOKEN.test(`| ${status}`) || RESOLVED.test(`| ${status}`)) continue;
    bad.push({ id: (line.match(/^\|\s*(D-\d+)/) || [])[1], status });
  }
  if (bad.length) {
    /* Show what was FOUND and the exact shape expected. The first row to trip this
       was written by a session that had placed the item correctly and described the
       placement in prose — the token is what makes the ledger sortable, and a check
       that only says "wrong" makes the reader guess which part. */
    fail(`NO DISPOSITION — ${bad.length} open debt row(s) carry no leading disposition\n`
       + `        TOKEN, so they cannot be sorted out of the ledger into work:\n`
       + bad.map((b) => `          ${b.id}  found: "${b.status.slice(0, 60)}"`).join("\n")
       + `\n        Expected the status cell to BEGIN with one of: M0..M7 | DOCTRINE |\n`
       + `        ACCEPTED | WATCH | SUPERSEDED | NOT OURS, e.g. "M2 · open (DEC-1)".\n`
       + `        Prose naming the milestone is not enough — the token is the sortable part.`);
  }
}

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

/* ------------------------------------------- 2b. THE DECIDED INDEX IS CURRENT

   `docs/DECIDED.md` is GENERATED from every ruling in the corpus (tools/decided.mjs),
   and it exists because a session cannot read the 565k tokens its kickoff demands and so
   re-asks questions the record already answered — 88% of which are ruled somewhere other
   than `DECISIONS.md`. An index that silently falls behind the corpus is worse than none:
   it answers, and it answers with what was true last week. So the drift is a GATE, on the
   same reasoning `check-versions` gates version stamps — a prose claim about the corpus
   is exactly what the Mechanical Verification Law says will not stay true on its own. */

{
  const { scan } = await import("./decided.mjs").catch(() => ({ scan: null }));
  if (!scan) {
    warn(`decided.mjs could not be loaded — the DECIDED index is UNVERIFIED this run.`);
  } else {
    try {
      execSync(`${JSON.stringify(process.execPath)} ${JSON.stringify(join(ROOT, "tools/decided.mjs"))} --check`,
        { cwd: ROOT, stdio: "pipe" });
      notes.push(`decided index: current`);
    } catch {
      fail(`STALE — docs/DECIDED.md does not match the corpus it indexes.\n`
         + `        Run \`node tools/decided.mjs\` and commit the result. A stale index does not\n`
         + `        fail quietly; it answers a session's question with last week's ruling.`);
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
   that drifts FAILS here, the way a stale DECIDED index does, because a front matter that
   is allowed to rot answers a reader with last month's completeness. */

{
  const { governed, checkFile } = await import("./corpuscheck.mjs").catch(() => ({}));
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
  const { rowDesignAudit, rowMessage } = await import("./rowdesign.mjs").catch(() => ({}));
  if (!rowDesignAudit) {
    warn(`rowdesign.mjs could not be loaded — QUEUE.md's design pointers are UNVERIFIED this run.`);
  } else {
    const a = rowDesignAudit({ repo: ROOT });
    const routed = a.open.filter((r) => r.routed).length;
    notes.push(`queue design pointers: ${a.open.length} open row(s) judged of ${a.rows.length}, `
      + `${a.skipped.length} closed row(s) not judged, ${a.findings.length} naming no design`
      + (routed ? `, ${routed} explicitly ROUTED as a missing design` : "")
      + ` (governed set: ${a.governedCount} document(s), read from CORPUS-STANDARD.md §5)`);
    /* A state this file does not understand is NAMED, never scored zero — a row typo'd into
       an unjudged state is exactly how a rule stops applying without anyone deciding it. */
    if (a.unknownState.length)
      warn(`UNKNOWN ROW STATE — ${a.unknownState.length} QUEUE.md row(s) carry a state token that is\n`
         + `        neither judged nor explicitly closed, so the §4.7 check does not reach them:\n`
         + a.unknownState.map((r) => `          ${r.id} · ${r.state} (QUEUE.md:${r.line})`).join("\n"));
    if (a.findings.length) fail(rowMessage(a.findings));
  }
}

/* ------------------------------------------------------------- report */

/* =========================================================================
   THE ESTATE HOLD — one MACHINE develops this repository at a time.
   `docs/development/ESTATE-HOLD.md`, added 2026-09-16 when development moved
   to a second machine under a second Claude account.

   WHY AN ARM AND NOT A CONVENTION. Claims keep two SESSIONS out of one tree
   and worktrees keep two out of one checkout; neither knows a second MACHINE
   exists. The file's first version relied on a session RELEASING the hold at
   stand-down — a voluntary act by a session that may be suspended before it
   gets there, which is exactly what happened within hours: the integrator was
   suspended mid-flight and the hold outlived the machine's work by 16 hours.
   An instrument that EXISTS and is OPTIONAL is the common failure this estate
   measured in M0-41; this one is not optional, because nothing else can see
   the collision it prevents.

   THE ASYMMETRY, stated rather than left to be inferred. A hold belonging to
   ANOTHER machine is a REFUSAL: developing against it is the collision. A hold
   that is FREE is a WARNING, not a refusal, because a machine must be able to
   COMMIT the claim that makes it compliant — refusing there would make the
   mechanism unbootstrappable. Revisit that if a second reason ever appears.

   READ FROM origin/main, never from the working tree, which may be a checkout
   of a commit taken before another machine claimed it. */
if (!LOCAL_ONLY) {
  const thisMachine = sh("scutil --get ComputerName") || sh("hostname -s") || "unknown";
  const text = sh("git show origin/main:docs/development/ESTATE-HOLD.md");
  const v = estateVerdict(text, thisMachine, new Date().toISOString());
  const where = "docs/development/ESTATE-HOLD.md (its HOLD line, read from origin/main)";
  if (v.kind === "theirs")
    fail(`ESTATE HELD BY ANOTHER MACHINE — "${v.machine}" (${v.account}) holds it through\n`
       + `        ${v.through}, and this machine is "${thisMachine}". ONE MACHINE DEVELOPS AT A TIME:\n`
       + `        do not commit, push, spawn or deploy. Claims and worktrees cannot see this\n`
       + `        collision — they keep two SESSIONS apart and know nothing of a second machine.\n`
       + `        If that hold is wrong, it EXPIRES on its own; breaking it early is Bob's call.`);
  else if (v.kind === "ours-expired")
    fail(`ESTATE HOLD EXPIRED UNDER YOU — "${v.machine}" held it through ${v.through}, which has\n`
       + `        passed, so another machine may legitimately have taken it. Fetch and re-read the\n`
       + `        HOLD line before writing anything: refresh it (through = now + 48 h, UTC) if it is\n`
       + `        still yours, and STOP if it is not. Refresh happens when you push a planning\n`
       + `        surface and at every integration — never as a separate chore.`);
  else if (v.kind === "unreadable" || v.kind === "unparseable" || v.kind === "badtime")
    fail(`ESTATE HOLD UNVERIFIED — ${where}: ${
           v.kind === "badtime"   ? `its through= value "${v.through}" is not ISO 8601 UTC with a Z,\n        and a time without a zone is read as LOCAL, which is the disagreement the Z removes`
         : v.kind === "unreadable" ? "the file is absent from origin/main"
         : "no HOLD line was found in it"}.\n`
       + `        This REFUSES rather than warns: the whole value of the lock is that it says who\n`
       + `        may develop, and a check reporting on its own availability instead of on the\n`
       + `        world is the defect M0-41 found inside this very gate.`);
  else if (v.kind === "free")
    warn(`no machine holds the estate — claim it before your first commit by rewriting the HOLD\n`
       + `        line in ${where.split(" (")[0]} (machine="${thisMachine}", status=HELD,\n`
       + `        through = now + 48 h UTC) and pushing. The push is the allocator.`);
  else
    notes.push(`estate hold: "${v.machine}" (${v.account}) through ${v.through} — this machine`);
}

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
