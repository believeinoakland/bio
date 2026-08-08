#!/usr/bin/env node
/* TAKE AN ID THAT CANNOT BE TAKEN TWICE.  M0-17, 2026-08-08.
 *
 * WHY THIS EXISTS, and it is a MEASUREMENT rather than a worry. On 2026-08-08
 * seven items collided on an id in a single day: a C-number family (PL-11 vs
 * PL-14 on C-29), two interface-change numbers (FL-3 vs CPDF-9 on IC-33;
 * REC-63 vs REC-66 on IC-35) and four debt numbers (three items on D-235, two
 * on D-237, two on D-238).  IN EVERY CASE BOTH WORKERS MEASURED THE NUMBER
 * FREE OVER THE REAL FILE AND BOTH WERE RIGHT WHEN THEY LOOKED.  Nobody was
 * careless.  The CONVENTION is the defect: read-the-file-and-add-one is a
 * check-then-act with no atomicity between the check and the act, and every
 * worker in the wave performs it against the same file at the same time.
 *
 * IT IS ALSO A MEASURED PROPERTY OF THE CONCURRENCY BUDGET, not a run of bad
 * luck: ONE collision at a budget of two, SEVEN at a budget of eight.  It gets
 * worse at sixteen, superlinearly, because what collides is PAIRS of workers.
 *
 * A VIGILANCE FIX WAS ALREADY TRIED AND DOES NOT WORK.  Every brief for two
 * days told workers to measure before allocating and EVERY ONE OF THEM DID.
 *
 * WHAT IT COSTS WHEN IT IS NOT FIXED, because that is what decided the design:
 * a renumber is a by-the-number sweep across code, suites, claims and reports,
 * paid by the serial integrator.  One such sweep missed a REGEX LITERAL, where
 * `C-29\.` is not the text `C-29.`, caught only by a suite; another mangled its
 * own worked example, which `coverage.mjs` then read as a catalog check nobody
 * names.
 *
 * ------------------------------------------------------------------ mechanism
 *
 * TWO LAYERS, AND THE ORDER MATTERS.
 *
 *   1. A CORPUS FLOOR.  The highest id already ALLOCATED in the namespace's own
 *      authoritative file(s).  This is exactly today's convention, kept — but
 *      demoted from "the allocator" to "the floor an allocation may not go
 *      below".  It is what makes losing the ledger a DEGRADATION rather than a
 *      catastrophe: with an empty ledger this tool behaves precisely as a
 *      careful human does today, and no worse.
 *
 *   2. AN EXCLUSIVE-CREATE LEDGER, which is the part that cannot be raced.
 *      Taking id N means creating the file `<ledger>/<NS>/<N>` with
 *      O_CREAT|O_EXCL.  That flag combination is atomic: of two processes
 *      attempting it at the same instant, exactly one succeeds and the other
 *      gets EEXIST and moves to N+1.  There is no window between the check and
 *      the act because there is no check — the create IS the check.
 *
 * WHERE THE LEDGER LIVES, AND WHY THAT IS THE RIGHT PLACE.  Under
 * `git rev-parse --git-common-dir`, i.e. the ONE `.git` directory every worktree
 * of this repository shares.  This project already MEASURED that property, and
 * paid for it: `refs/stash` is not a per-worktree ref, so all sixty checkouts
 * share one stash stack, which is how an untracked suite from one worker was
 * materialised into another's tree (ORCHESTRATION.md's failure table).  THE
 * SHARED COMMON GITDIR IS THE EXACT SCOPE THE COLLISIONS HAVE — every colliding
 * pair on 2026-08-08 was two worktrees of one clone — so it is the exact scope
 * the ledger needs.  The property that made stash a hazard is the property that
 * makes this work.
 *
 * WHAT WAS WEIGHED AND REJECTED, so the next reader does not re-litigate it:
 *
 *   - A COMMITTED LEDGER pushed before the worker starts.  Rejected: workers in
 *     this project are briefed NOT to push, and two workers committing an
 *     allocation on their own branches race exactly as they do today — the
 *     collision simply moves from the file to the merge.  A commit is not a
 *     compare-and-swap.
 *   - IDS DERIVED FROM THE AGENT ID OR BRANCH.  Collision-free and needs no
 *     shared state at all — and it destroys the property the ids are FOR.
 *     `D-a6a99245` is not sortable, not sayable, and not what four thousand
 *     lines of existing prose refer to.  The renumbering cost of adopting it is
 *     the entire corpus, once.
 *   - A RESERVED BLOCK HANDED OUT IN THE BRIEF AT SPAWN TIME.  The closest
 *     rival, and it fails on TWO measured facts.  (a) CONDUCT is not the only
 *     allocator: D-184 and D-185 both collided with BOB-SESSION rows, and BOB
 *     is not spawned by CONDUCT.  A block CONDUCT hands out covers neither BOB
 *     nor DIST.  (b) It puts a per-spawn manual step on the one serial session
 *     that has twice been recorded confusing REPORTING an action with DOING it
 *     (the refill rule's own receipts, 2026-08-07 and 2026-08-08).  A standing
 *     line in a brief template costs nothing per spawn; a decision per spawn
 *     costs attention at the bottleneck.
 *   - ACCEPTING COLLISIONS AND MECHANISING THE RENUMBER.  A legitimate answer,
 *     and it was priced rather than dismissed: it is strictly more expensive
 *     BECAUSE A RENUMBER CAN BE WRONG AND A MINT CANNOT.  The renumber's cost is
 *     paid every time, at integration, on the serial path, over a corpus that
 *     contains regex literals (`C-29\.`), two-digit suffixes (`C-2.10`), prose
 *     inside the very comment that warns about renumbering, and — critically —
 *     REPORTS AND CLAIMS ALREADY WRITTEN by a worker that has ended.  Two of the
 *     day's renumbers were already found defective.  Minting costs one process
 *     spawn, once, before the work starts, and has no failure mode that produces
 *     a WRONG id — only a SKIPPED one.
 *
 * WHAT IT COSTS WHEN IT FAILS.  Stated plainly because a mechanism whose
 * failure mode is unstated is a mechanism nobody can trust:
 *
 *   - GAPS.  An id minted and never used is gone forever.  The sequence is no
 *     longer dense, so a number existing does not imply the one below it does.  This is
 *     cheap and it is the price: a gap is a question a reader can answer in one
 *     grep, where a collision is a sweep across the estate.
 *   - A LOST OR ABSENT LEDGER degrades to the corpus floor — today's behaviour,
 *     no worse — and collisions can return.  It is not committed on purpose (a
 *     committed ledger races), so a fresh clone starts empty and re-derives its
 *     floor from the corpus.  RATCHET, never authority: the floor always wins
 *     when it is higher.
 *   - TWO MACHINES do not share a common gitdir, so two clones can mint the same
 *     id.  Today every worker runs in a worktree of one clone; the day that
 *     stops being true this mechanism stops covering it, and the fallback is the
 *     corpus floor again.  Named in DEBT.md rather than left to be discovered.
 *   - A NETWORK FILESYSTEM without atomic O_EXCL could double-issue.  APFS and
 *     ext4 are atomic here; NFSv2 was not.  Named for the same reason.
 *   - A WORKER THAT DOES NOT RUN THIS TOOL collides exactly as before.  That is
 *     why the mechanism is not this file: it is the line in
 *     `kickoffs/CONDUCT.md` that puts this file in every brief.  A mechanism
 *     that is not in the loop the reader actually runs is not a mechanism.
 *
 * PRECEDENT, AND IT IS THIS PROJECT'S OWN.  The plane already refuses to
 * allocate a record id by reading and incrementing: `Store.allocId` runs its
 * read-and-bump inside `ctx.storage.transactionSync`, under a comment that reads
 * "coordination: what LockService and the nextSeq race did".  The runtime
 * namespace was mechanised long ago.  The DEVELOPMENT namespaces are the ones
 * still on the convention, and this closes that gap with the same idea and a
 * different primitive.
 *
 * USAGE
 *   node tools/mintid.mjs <NAMESPACE> [--count N] [--who <id>] [--why <text>]
 *   node tools/mintid.mjs --list [<NAMESPACE>]      show floors, held ids, sources
 *   node tools/mintid.mjs <NAMESPACE> --floor-only  the corpus floor, nothing taken
 *
 * `--who` defaults to the current branch, which in a worker's worktree IS its
 * agent id.  Every claim file records who took it, when, and from which tree, so
 * a gap can always be traced to the allocation that made it.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from "node:fs";
import { hostname } from "node:os";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/* ------------------------------------------------------------- the namespaces
 *
 * THE SWEEP THIS ITEM OWED, and its finding is that the class is bigger than the
 * four the queue row named and does NOT need one answer.  Three kinds:
 *
 *   (i)  CODE-REFERENCED — a C-number is named by `checks/bio-checks.mjs`, by
 *        suites, by `coverage.mjs`'s harvester and at least once by a REGEX
 *        LITERAL.  These are the expensive ones to renumber and the ones where
 *        minting pays most.
 *   (ii) PROSE-REFERENCED — D, DEC, IC, M and the queue item families.  A
 *        renumber here is a text sweep, cheaper, but it reaches CLAIMS and
 *        REPORTS written by sessions that have ENDED and cannot correct
 *        themselves.
 *   (iii) STRUCTURAL — the interface numbers `I1..I8`.  Allocated a handful of
 *        times ever, but a collision here is the worst of the three because an
 *        interface number is a contract identity two areas build against.
 *
 * THE MECHANISM IS THE SAME FOR ALL THREE.  What differs per namespace is the
 * CORPUS the floor is read from, and that is the only per-namespace knowledge
 * this file holds.
 *
 * WHY EACH CORPUS IS THE FILE(S) BELOW AND NOT "THE WHOLE REPOSITORY", MEASURED:
 * a repo-wide scan for `\bC-(\d+)` returns 2026, because fixtures carry ids like
 * `...C-2024-...`, and a floor poisoned by a year hands out `C-2027` and orphans
 * the catalog forever.  So the corpus is where the namespace ALLOCATES, and a
 * `ceiling` discards year-shaped noise LOUDLY rather than silently.
 *
 * AND THE FLOOR IS DELIBERATELY GENEROUS — IT COUNTS A MENTION, NOT ONLY AN
 * ALLOCATION — WHICH IS THE SAFE DIRECTION AND IS STILL WORTH SAYING OUT LOUD.
 * MEASURED WITHIN MINUTES OF THIS FILE LANDING, BY THIS FILE: a debt row written
 * for M0-17 explained the gap cost with a WORKED EXAMPLE naming the next free
 * number, in `DEBT.md`, which is `D`'s own corpus.  `--list` then read that
 * number off the PROSE and the ledger would have skipped one nobody had taken.
 * Over-counting only costs a gap, so the behaviour is kept; what changes is that
 * `allocPattern` below states, per namespace, what an ACTUAL allocation site
 * looks like, and any number above the strict floor is NAMED as prose-driven.
 * (This is the C-29 catalogue comment's lesson arriving a second time on the
 * same day: an instrument cannot tell a number in a sentence from a number in a
 * row.  Never write an id-shaped example in a file that is a corpus.)
 */
const QUEUE_CORPUS = [
  "docs/development/QUEUE.md",
  "docs/development/MILESTONES.md",
  "docs/development/IS-BUILD-PLAN.md",
  "docs/development/UI-PLAN.md",
  "docs/development/PLAN.md",
];

/* A QUEUE ITEM'S ALLOCATION SITE, AND THERE ARE EXACTLY TWO SHAPES — MEASURED, not
 * assumed, and the second was found by asking the corpus instead of trusting the
 * first. `### <NS>-<n> · <state>` is a QUEUE.md item heading, which is what
 * `planning-hygiene` already reads the queue's id set from, so this is the
 * repository's own definition of "an item exists" rather than a second one invented
 * here. `| <NS>-<n> | …` is a TRACK TABLE ROW in `IS-BUILD-PLAN.md`, which is where
 * PL, FL, SK, VF, DS and four of UI's items actually live — a heading-only matcher
 * scored all five of those families zero and would have read as a clean sweep.
 *
 * MEASURED REACH, both shapes over the five queue-corpus files: QUEUE.md yields ten
 * prefixes as headings and no table rows; IS-BUILD-PLAN.md yields six as rows and no
 * headings; MILESTONES.md, UI-PLAN.md and PLAN.md yield NEITHER. Zero noise in either
 * shape — no reference table, no prose line and no fixture matches. */
const itemAlloc = (ns) =>
  new RegExp(`^(?:###\\s+${ns}-(\\d+)\\s+·|\\|\\s*${ns}-(\\d+)\\s*\\|)`, "gm");
/* The same two shapes with the PREFIX open, which is what turns the register from a
   hand-kept list into something that refuses to fall behind. */
const ANY_ITEM_SITE = () =>
  /^(?:###\s+([A-Z][A-Z0-9]*)-\d+\s+·|\|\s*([A-Z][A-Z0-9]*)-\d+\s*\|)/gm;
const item = (what) => ({ kind: "prose", what, corpus: QUEUE_CORPUS, ceiling: 9999,
                          allocPattern: itemAlloc, allocIsUnique: true });

export const NAMESPACES = {
  /* (i) code-referenced */
  C: { kind: "code", what: "check families in the catalog (the dotted members of a family are the family owner's)",
       corpus: ["bio-plane/checks/bio-checks.mjs"], ceiling: 999,
       /* an allocation is a `check: 'C-n.m'` row in the catalog; anything else in
          this file is a mention, including inside the comment that warns about
          exactly this. */
       allocPattern: () => /check:\s*['"]C-(\d+)\./g,
       /* AND THE SAME PATTERN MATCHES A FAMILY ONCE PER DOTTED MEMBER, BY DESIGN.
          C-7.1 and C-7.2 are one family owner's two members, so a REPEAT here is
          the normal shape and not a collision. That makes `C` the one registered
          namespace the duplicate detector below CANNOT grade, and it is NAMED
          rather than silently scored clean — a thing the matcher does not
          understand must be named (WORKER.md). Grading it needs the catalog's
          family *declaration*, which is a different read from this one. */
       allocIsUnique: false,
       allocNotUnique: "a family's dotted members each repeat the family number by design (C-7.1, C-7.2), so a repeated match is the normal shape rather than a second allocation" },

  /* (ii) prose-referenced */
  D: { kind: "prose", what: "debt rows",
       corpus: ["docs/development/DEBT.md", "docs/development/QUEUE.md", "docs/development/CLAIMS.md"], ceiling: 9999,
       /* an allocation is a table ROW opening the id; a number in a sentence is not */
       allocPattern: () => /^\|\s*D-(\d+)\s*\|/gm, allocIsUnique: true },
  DEC: { kind: "prose", what: "decisions",
         corpus: ["docs/development/DECISIONS.md", "docs/development/QUEUE.md"], ceiling: 9999,
         allocPattern: () => /^###\s+DEC-(\d+)\s+·/gm, allocIsUnique: true },
  IC: { kind: "prose", what: "interface-change entries",
        corpus: ["docs/development/INTERFACE-CHANGES.md", "docs/development/QUEUE.md"], ceiling: 9999,
        /* `## IC-n ·` opens the entry; the `### IC-n · RESPONSES / RESOLUTION /
           CONFIRM` blocks beneath it are that entry's own sub-sections and are not
           allocations — measured: IC-2 carries four of them. */
        allocPattern: () => /^##\s+IC-(\d+)\s+·/gm, allocIsUnique: true },
  M: { kind: "prose", what: "measurement entries",
       corpus: ["docs/development/MEASUREMENTS.md", "docs/development/QUEUE.md"], ceiling: 999 },
       /* NO ALLOCATION PATTERN, DELIBERATELY, AND THE REASON IS A FINDING RATHER THAN
          A SHRUG. `MEASUREMENTS.md` allocates nothing at a recognisable site: its
          4,000+ lines are dated prose and its single `### M-4` heading is a sentence
          ("M-4's figures HELD"). Meanwhile QUEUE.md carries one `### M-4 · done` item
          heading — so `M-4` names BOTH a measurement lane item and a measurements
          entry. That is two allocation spaces wearing one prefix, which is a latent
          version of the very defect this file exists for, and inventing a site here
          would paper over it. So `allocFloor` answers null — never 0 — and the
          duplicate detector reports M as NOT COVERED with this reason attached. */

  /* (ii) prose-referenced — the queue item families, one corpus between them.
   *
   * THIS LIST IS NOT MAINTAINED BY HAND ANY MORE, AND THAT IS THE POINT.
   * `unregisteredNamespaces()` below reads the queue for anything shaped like an
   * item heading and REFUSES a prefix that allocates without a row here, so the
   * next family cannot be added silently. M0-17 left that open on a measurement
   * ("a wide census returns FW, INFO, IS, INQ, SHA, UTF, RFC, FY2023 and thirty
   * more") — and the census it measured was over every prefix-number TOKEN in the
   * repository. Over ALLOCATION SITES the same question returns ten prefixes and
   * no noise at all, which is why the answer changed: ask what makes something
   * recognisable in principle rather than lengthening a list of spellings. */
  REC: item("RECORD queue items"),
  UI: item("UI queue items"),
  CPDF: item("CONTENT-PDF queue items"),
  COFF: item("CONTENT-OFFICE queue items"),
  CAP: item("CAPTURE queue items"),
  FW: item("FRAMEWORK queue items"),
  FL: item("fleet queue items"),
  PL: item("investigative-session build-plan items"),
  SK: item("skillpack queue items"),
  IS: item("investigative-session items"),
  VF: item("verification queue items"),
  M0: item("test-estate queue items"),
  DIST: item("DIST queue items"),
  DS: item("DIST track rows in IS-BUILD-PLAN.md — the SAME lane as DIST under a second prefix, which is worth knowing and is not this item's to reconcile"),

  /* (iii) structural */
  I: { kind: "structural", what: "interface identities", corpus: ["docs/development/INTERFACES.md"],
       ceiling: 99, pattern: (ns) => new RegExp(`^##\\s+${ns}(\\d+)\\b`, "gm"),
       allocPattern: (ns) => new RegExp(`^##\\s+${ns}(\\d+)\\s+—`, "gm"), allocIsUnique: true },
};

/* ------------------------------------------------------------------ the floor */

/** The highest id already allocated in this namespace's own corpus, plus every
 *  match DISCARDED as noise. Discards are RETURNED, never swallowed: a floor
 *  that silently ignores what it cannot explain is the generous direction. */
export function corpusFloor(ns, { repo = REPO_ROOT } = {}) {
  const spec = NAMESPACES[ns];
  if (!spec) throw new Error(`unknown namespace ${ns}`);
  const re = spec.pattern ? spec.pattern(ns) : new RegExp(`\\b${ns}-(\\d+)`, "g");
  let floor = 0, from = null, seen = 0;
  /* The STRICT floor: the highest id at a site that is unmistakably an
     ALLOCATION rather than a mention. `null` where the namespace has not
     declared what one looks like — stated rather than guessed, because a
     strict floor guessed wrong would be wrong in the DANGEROUS direction. */
  let allocFloor = spec.allocPattern ? 0 : null;
  const discarded = [];
  const missing = [];
  for (const rel of spec.corpus) {
    const p = isAbsolute(rel) ? rel : join(repo, rel);
    let src;
    try { src = readFileSync(p, "utf8"); } catch { missing.push(rel); continue; }
    let m; re.lastIndex = 0;
    while ((m = re.exec(src))) {
      seen++;
      const n = Number(m[1]);
      if (n > spec.ceiling) { discarded.push(`${m[0]} in ${rel}`); continue; }
      if (n > floor) { floor = n; from = rel; }
    }
    if (spec.allocPattern) {
      const ar = spec.allocPattern(ns);
      let a; ar.lastIndex = 0;
      /* whichever alternative group matched — see `allocations` below */
      while ((a = ar.exec(src))) {
        const n = Number(a.slice(1).find((g) => g !== undefined));
        if (Number.isInteger(n) && n <= spec.ceiling && n > allocFloor) allocFloor = n;
      }
    }
  }
  /* Minting still uses the GENEROUS floor — over-counting costs a gap and
     under-counting costs a collision, and only one of those is recoverable. */
  const proseDriven = allocFloor !== null && floor > allocFloor;
  return { floor, allocFloor, proseDriven, from, seen, discarded, missing, corpus: spec.corpus };
}

/* ------------------------------------------------- THE IN-COMMIT DETECTOR (D-243)
 *
 * D-243 SAID THE DETECTION COULD NOT BE AN INSTRUMENT, AND THE REASONING WAS HALF
 * RIGHT. Its structural argument is sound and stands: the ledger is deliberately not
 * committed (a committed ledger races exactly as the file does), so no suite running
 * from a worker's commit can ask whether a given number was MINTED, and the honest
 * answer for every id allocated before 2026-08-08 is `unknown`. That question needs
 * the ledger, so it needs CONDUCT's machine, so it is `--audit` below.
 *
 * WHAT THE ARGUMENT MISSED IS THAT THE HARM IS NOT THE QUESTION. What un-minted
 * allocation COSTS is a collision — two things wearing one id — and a collision is
 * fully visible in a commit, needs no ledger, and answers `yes` or `no` rather than
 * `unknown`. So the class splits cleanly in two and gets two instruments:
 *
 *   the CAUSE   — "was this id minted?"      needs the ledger  -> `--audit`, a QUESTION
 *   the EFFECT  — "do two things claim it?"  needs nothing     -> here, a FAILURE
 *
 * AND THE SPLIT IS NOT THEORETICAL. Run over the live corpus the day it was written,
 * this found SIX COLLISIONS SITTING IN `origin/main`, none of them known to anybody:
 * D-121 and D-124 are each two unrelated debt rows; CPDF-9, FW-15 and M0-16 are each
 * two different queue items; IC-30 is two different PROPOSED interface changes.
 * D-124's own row reads "(renumbered from a colliding D-122 by CONDUCT 2026-07-31)" —
 * it was renumbered ONTO a second collision. IC-30 is the THIRD live IC collision,
 * after the IC-33 and IC-35 pair M0-17 already recorded. That is the whole of M0-17's
 * case restated as a measurement: the convention fails silently, and an instrument had
 * to exist before anybody could see it had already failed six times.
 *
 * FIVE OF THE SIX WERE FOUND BY A HEADING-ONLY MATCHER; THE SIXTH ARRIVED WITH THE
 * SECOND ALLOCATION SHAPE, and the first draft's blind spot was not the collision but
 * the FAMILIES — PL, FL, SK, VF and DS allocate as table rows and every one of them
 * scored a clean zero. Printing the corpus is what showed it.
 *
 * WHAT THIS CANNOT SEE, stated because a matcher's reach is the load-bearing sentence:
 * an un-minted id that has not YET collided (that is `--audit`'s half, and it needs
 * the ledger); a collision inside `C`, whose dotted members repeat a family number by
 * design (named, not scored clean); a collision in `M`, which declares no allocation
 * site; an id referred to in prose but never allocated at a site; and a collision
 * between two branches that have not been merged, which by construction does not
 * exist in any one commit and is exactly what CONDUCT's integration step is for. */

/** Every ALLOCATION SITE of `ns` in its own corpus, with the file and line, and the
 *  ids allocated more than once. `covered:false` is a first-class answer — a
 *  namespace whose sites cannot be recognised is NAMED, never reported clean. */
export function allocations(ns, { repo = REPO_ROOT } = {}) {
  const spec = NAMESPACES[ns];
  if (!spec) throw new Error(`unknown namespace ${ns}`);
  if (!spec.allocPattern)
    return { ns, covered: false, why: "no allocation site is declared for this namespace, so a repeat cannot be told from a mention", sites: [], duplicates: [] };
  if (spec.allocIsUnique === false)
    return { ns, covered: false, why: spec.allocNotUnique || "this namespace's allocation pattern legitimately matches one id more than once", sites: [], duplicates: [] };

  const sites = [];
  const missing = [];
  for (const rel of spec.corpus) {
    const p = isAbsolute(rel) ? rel : join(repo, rel);
    let src;
    try { src = readFileSync(p, "utf8"); } catch { missing.push(rel); continue; }
    const re = spec.allocPattern(ns);
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) {
      /* An allocation pattern may declare SEVERAL alternative shapes, so the number
         is whichever group matched. Reading `m[1]` alone silently scored every
         table-row family zero — the shape M0-17's heading-only draft could not see. */
      const raw = m.slice(1).find((g) => g !== undefined);
      const n = Number(raw);
      if (!Number.isInteger(n)) continue;
      if (n > spec.ceiling) continue; /* year-shaped noise, discarded by corpusFloor's rule */
      /* The line number, so a break points at the row rather than at a count. */
      const line = src.slice(0, m.index).split("\n").length;
      sites.push({ n, id: `${ns}-${n}`, file: rel, line });
    }
  }
  const by = new Map();
  for (const s of sites) { if (!by.has(s.n)) by.set(s.n, []); by.get(s.n).push(s); }
  const duplicates = [...by.entries()].filter(([, v]) => v.length > 1)
    .map(([n, at]) => ({ id: `${ns}-${n}`, n, at: at.map((s) => `${s.file}:${s.line}`) }))
    .sort((a, b) => a.n - b.n);
  return { ns, covered: true, sites, duplicates, missing };
}

/* THE MEASURED PRE-EXISTING COLLISIONS, 2026-08-08, EXACT AND DATED.
 *
 * These five were in `origin/main` before this detector existed. They are REGISTERED
 * rather than renumbered, and the distinction matters: a renumber is a by-the-number
 * sweep across code, suites, claims and REPORTS WRITTEN BY SESSIONS THAT HAVE ENDED,
 * paid by the serial integrator, and two of the day's renumbers were already found
 * defective (one missed the regex literal `C-29\.`). Three of these five live in
 * `QUEUE.md`, whose sole writer is CONDUCT. So this item DETECTS the class and files
 * the renumber as D-248 rather than performing it inside a tooling item.
 *
 * IT IS A RATCHET AND IT HAS NO SLACK. The set is exact: a SIXTH collision fails, and
 * an entry here that has STOPPED being a collision also fails, so the list cannot
 * quietly outlive its reason. A registered collision is not an exempted rule — the
 * rule is enforced over every id including these; what is recorded is that these five
 * predate the instrument. */
export const KNOWN_COLLISIONS = [
  { id: "D-121", why: "two unrelated debt rows, both dated 2026-07-31: a stale `surfaced_by` defect and the office-formats capture gap" },
  { id: "D-124", why: "two unrelated design rows — and the first of them reads '(renumbered from a colliding D-122 by CONDUCT 2026-07-31)', so it was renumbered ONTO a second collision" },
  { id: "IC-30", why: "two different PROPOSED interface changes: PL-12/D-84's bias object and I3's six new act ops (PL-2/IS-2) — the THIRD live IC collision after the IC-33 and IC-35 pair M0-17 recorded" },
  { id: "CPDF-9", why: "two different queue items: the M0 pdf-worker dark-suite item and the M2 OCR-reachability measurement" },
  /* THE PATH C-7.1 GOVERNS IS DELIBERATELY NOT SPELLED HERE, and that is a receipt
     rather than fussiness. The first draft of this line named it, and
     `check-firing.test.mjs` — whose estate walk covers `tools/` — read this file as a
     PRODUCER for a retired shape and went RED. That is the documentation-poisons-a-
     corpus class for the THIRD time in two days (the C-29 catalogue comment, this
     tool's own debt row, and now this), in a third instrument, and the lesson
     generalises past id-shaped examples: a prose mention inside a file an estate walk
     covers is indistinguishable from the real thing. It failed in the SAFE direction,
     which is why that arm is built the way it is. */
  { id: "FW-15", why: "two different queue items: the C-7.1 deletion-ledger retirement (added 2026-08-08) and the L2->L3 PDF-text-becomes-a-reading wire (added 2026-08-01)" },
  { id: "M0-16", why: "a duplicated `### M0-16 · done` heading with an empty body directly above the real one — an integration merge artefact rather than two items" },
];

/** Every duplicate allocation across every registered namespace, split into the
 *  measured pre-existing set and anything NEW. `notCovered` is returned, never
 *  swallowed: a reader must be able to see which namespaces were graded. */
export function collisions({ repo = REPO_ROOT } = {}) {
  const known = new Set(KNOWN_COLLISIONS.map((k) => k.id));
  const found = [], notCovered = [], graded = [];
  for (const ns of Object.keys(NAMESPACES)) {
    const a = allocations(ns, { repo });
    if (!a.covered) { notCovered.push({ ns, why: a.why }); continue; }
    graded.push({ ns, sites: a.sites.length });
    found.push(...a.duplicates);
  }
  const fresh = found.filter((d) => !known.has(d.id));
  const stale = KNOWN_COLLISIONS.filter((k) => !found.some((d) => d.id === k.id));
  return { found, fresh, stale, known: KNOWN_COLLISIONS, notCovered, graded,
           sites: graded.reduce((s, g) => s + g.sites, 0) };
}

/* --------------------------------------------- THE REGISTRATION PROMPT (M0-17's gap)
 *
 * An unregistered prefix is refused BY NAME, which is the fail-closed direction and
 * is right — but nothing prompted anyone to add one, so a new family simply kept
 * allocating by the old convention. MEASURED: `FW`, `COFF` and `CAP` were allocating
 * in the queue and were not in the register, and one of the five live collisions above
 * is `FW-15`. The prompt gap has already cost a collision.
 *
 * The reason M0-17 left it open was a measurement — a wide census over every
 * prefix-number token returns `INFO`, `SHA`, `UTF`, `RFC`, `FY2023` and thirty more
 * data vocabularies, and a detector nobody can read is a detector nobody runs. That
 * census asked the wrong question. Over ALLOCATION SITES — a queue item heading, the
 * shape `planning-hygiene` already uses to decide an item exists — the same scan
 * returns ten prefixes and NO noise: REC UI M0 FW CPDF IS COFF CAP DIST M. */
export function unregisteredNamespaces({ repo = REPO_ROOT } = {}) {
  const seen = new Map(), where = new Map();
  let read = 0;
  for (const rel of QUEUE_CORPUS) {
    let src;
    try { src = readFileSync(join(repo, rel), "utf8"); } catch { continue; }
    read++;
    for (const m of src.matchAll(ANY_ITEM_SITE())) {
      const p = m[1] ?? m[2];
      seen.set(p, (seen.get(p) || 0) + 1);
      if (!where.has(p)) where.set(p, rel);
    }
  }
  const unregistered = [...seen.entries()].filter(([p]) => !NAMESPACES[p])
    .map(([prefix, items]) => ({ prefix, items, first: where.get(prefix) }))
    .sort((a, b) => b.items - a.items);
  return { prefixes: [...seen.keys()].sort(), unregistered, filesRead: read };
}

/* ----------------------------------------------------------------- the ledger */

/** The ONE `.git` every worktree of this clone shares. Resolved against the repo
 *  root because `--git-common-dir` answers a RELATIVE `.git` in the main
 *  checkout and an absolute path in a worktree — and a path a worktree's gitdir
 *  does not have is how a control arm in this project once NEVER ARMED. */
export function ledgerRoot({ repo = REPO_ROOT, env = process.env } = {}) {
  if (env.BIO_IDALLOC_DIR) return resolve(env.BIO_IDALLOC_DIR);
  let common;
  try {
    common = execFileSync("git", ["rev-parse", "--git-common-dir"],
      { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null; /* not a git checkout: REFUSE rather than hand out an unsafe id */
  }
  if (!common) return null;
  return join(isAbsolute(common) ? common : resolve(repo, common), "bio-idalloc");
}

const claimPath = (root, ns, n) => join(root, ns, String(n));

/* ------------------------------------------- WHAT THE GUARANTEE COVERS, AND D-242
 *
 * D-242's sharp half is not the collision, it is the CONFIDENCE: a tool believed to
 * make collisions impossible, which quietly does not in some environment, is worse
 * than the convention it replaced — because the convention at least left everybody
 * checking. M0-17 shipped with the failure modes stated in a comment nobody runs and
 * in a debt row nobody reads at mint time, while the tool's own output said only
 * `MINTED D-248`. That output is the thing a worker actually believes.
 *
 * SO THE DECISION, and it follows the same asymmetry the generous floor follows —
 * over-counting costs a gap, under-counting costs a collision, and only one of those
 * is recoverable:
 *
 *   REFUSE   when exclusivity is DEMONSTRABLY absent. Two cases now: no shared git
 *            directory (NO_LEDGER, M0-17's), and a ledger filesystem that does not
 *            honour O_CREAT|O_EXCL (EXCL_NOT_HONOURED, new). Refusing costs a worker
 *            one minute and a question; minting under a broken primitive costs a
 *            collision carrying the confidence of a mechanism.
 *   WARN     and still mint when the scope is WIDER than the one that was tested and
 *            no local test can settle it — a ledger reached from more than one host,
 *            or a `BIO_IDALLOC_DIR` override that puts the ledger somewhere the git
 *            common dir did not choose. The id is still safe against everything
 *            using this ledger; what is unproven is named instead of implied.
 *   STATE    always. Every successful mint, every `--list` and every `--audit` prints
 *            the SCOPE — what the take is exclusive against and what it is NOT. The
 *            happy path is where a false belief is formed, so the happy path is where
 *            the sentence has to be.
 *
 * AND ONE LINE OF D-242 IS NARROWED BY MEASUREMENT RATHER THAN ARGUED WITH. The row
 * says "there is no cheap local test for that, which is why it is a debt and not a
 * fix". That is true of the TWO-CLONE half and stays true: nothing on this machine
 * can see a second ledger. It is NOT true of the non-atomic-filesystem half, which is
 * exactly what the probe below tests, in one create-create-compare against the real
 * ledger directory. Half a debt closed by testing the claim is worth more than the
 * whole of it accepted on report. What the probe canNOT do is prove atomicity ACROSS
 * hosts, because it is one process; that is why a multi-host ledger warns. */

/** Does the ledger's own filesystem honour an exclusive create? Probed against the
 *  REAL directory, not a temp dir, because the property belongs to the filesystem the
 *  ledger is on and NFSv2 is the case this exists for. Three ways to fail, all
 *  reported: the directory cannot be written; the second create is not refused; the
 *  second create is refused but the first writer's bytes moved anyway. */
export function exclusivityProbe(root) {
  const p = join(root, `.probe-${process.pid}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  try { writeFileSync(p, "first", { flag: "wx" }); }
  catch (e) { return { ok: false, reason: "PROBE_UNWRITABLE", detail: `the ledger directory could not be written (${e.code})` }; }
  let second = null;
  try { writeFileSync(p, "second", { flag: "wx" }); } catch (e) { second = e.code; }
  let body = null;
  try { body = readFileSync(p, "utf8"); } catch { /* reported below */ }
  try { rmSync(p, { force: true }); } catch { /* a leftover probe file is harmless */ }
  if (second !== "EEXIST")
    return { ok: false, reason: "EXCL_NOT_HONOURED",
             detail: second === null ? "a second exclusive create of the same path SUCCEEDED — this filesystem does not honour O_CREAT|O_EXCL"
                                     : `a second exclusive create failed with ${second} rather than EEXIST` };
  if (body !== "first")
    return { ok: false, reason: "EXCL_NOT_HONOURED",
             detail: `the second create was refused and the first writer's bytes still moved (${JSON.stringify(body)})` };
  return { ok: true };
}

/** Every host that has ever minted from this ledger. One marker file per host, taken
 *  by the same exclusive create the ids use, so eight racing processes cannot lose an
 *  update the way a shared JSON file would. More than one means the ledger is on
 *  storage two machines share — which is not itself wrong, and IS the case the probe
 *  above cannot speak for. */
export function ledgerHosts(root, { record = false } = {}) {
  const dir = join(root, "_hosts");
  if (record) {
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, hostname().replace(/[^\w.-]/g, "_")), `${new Date().toISOString()}\n`, { flag: "wx" });
    } catch (e) { if (e.code !== "EEXIST") return []; }
  }
  try { return readdirSync(dir).sort(); } catch { return []; }
}

/** The watermark: the corpus floor at the moment this namespace's ledger began.
 *  Below it the ledger has nothing to say and the honest answer about an id is
 *  UNKNOWN; above it, an allocation the ledger does not hold is a QUESTION. Recorded
 *  once with an exclusive create; DERIVED from the lowest held id where a namespace
 *  predates this field, and labelled so, because a derived figure and a recorded one
 *  are not the same evidence. Null where neither is available — never 0. */
export function watermark(ns, { repo = REPO_ROOT, env = process.env, root = null } = {}) {
  const r = root || ledgerRoot({ repo, env });
  if (!r) return { floor: null, source: "no ledger" };
  try {
    const rec = JSON.parse(readFileSync(join(r, ns, ".watermark"), "utf8"));
    if (Number.isInteger(rec.floor)) return { floor: rec.floor, source: "recorded", at: rec.at };
  } catch { /* fall through to the derivation */ }
  const h = held(ns, { repo, env: root ? { BIO_IDALLOC_DIR: root } : env });
  if (!h.length) return { floor: null, source: "this namespace has no ledger history at all, so nothing above or below can be graded" };
  /* `mint` takes floor+1, so the lowest id ever taken is the watermark plus one. */
  return { floor: h[0] - 1, source: "derived from the lowest held id (this namespace predates the recorded watermark)" };
}

function recordWatermark(root, ns, floor) {
  try { writeFileSync(join(root, ns, ".watermark"), JSON.stringify({ ns, floor, at: new Date().toISOString() }) + "\n", { flag: "wx" }); }
  catch { /* EEXIST is the normal case: the first mint in a namespace records it */ }
}

/** Everything a caller needs to know about what its id is and is not safe against. */
export function scopeOf({ repo = REPO_ROOT, env = process.env, root = null } = {}) {
  const r = root || ledgerRoot({ repo, env });
  return { ledger: r, hosts: r ? ledgerHosts(r) : [],
           overridden: Boolean(env.BIO_IDALLOC_DIR),
           exclusive: r ? exclusivityProbe(r) : { ok: false, reason: "NO_LEDGER", detail: "no shared git directory" } };
}

/** The sentence that must appear wherever an id does.
 *
 *  IT NEVER THROWS, and that is a control finding rather than defensiveness. Handed
 *  the `scope` of a REFUSAL — which is undefined, because a refusal has no scope — the
 *  first version raised a TypeError from inside a caller's assertion and ended the
 *  module while the tally read clean. A missing probe verdict is UNDETERMINED, which
 *  is first-class here and is printed as itself; a formatter for a safety statement is
 *  the last place that should be able to take a process down. */
export function scopeLines(scope) {
  const s = scope || {};
  const excl = s.exclusive;
  const hosts = s.hosts || [];
  const out = [];
  out.push(`SCOPE exclusive against every process using ledger ${s.ledger || "(none)"} —`);
  out.push(`      that is every worktree of THIS clone, and nothing else. NOT exclusive against an`);
  out.push(`      allocator using a different ledger: a second clone, a CI runner, another machine.`);
  out.push(`      No local test can detect one, so this is stated rather than checked (D-242).`);
  out.push(`      O_CREAT|O_EXCL honoured on this filesystem: `
    + (!excl ? "UNDETERMINED — no probe verdict was carried with this scope"
             : excl.ok ? "YES, probed just now" : `NO — ${excl.detail}`));
  if (hosts.length > 1)
    out.push(`      WARN this ledger has been used from ${hosts.length} hosts (${hosts.join(", ")}), so it lives on`
           + `\n      shared storage. The probe above is ONE process and cannot speak for atomicity ACROSS hosts.`);
  if (s.overridden)
    out.push(`      WARN BIO_IDALLOC_DIR is set, so the ledger is where the caller said and not where the`
           + `\n      shared git directory put it. The scope is whatever that path is shared by.`);
  return out;
}

/** Take `count` ids in `ns`. Every id is taken by an EXCLUSIVE CREATE, so two
 *  processes racing here cannot both take the same one — the loser gets EEXIST
 *  and walks on. Returns the ids and the evidence behind them. */
export function mint(ns, { count = 1, who = "unknown", why = "", repo = REPO_ROOT, env = process.env } = {}) {
  if (!NAMESPACES[ns]) throw new Error(`unknown namespace ${ns}`);
  if (!Number.isInteger(count) || count < 1) throw new Error(`--count must be a positive integer`);
  const root = ledgerRoot({ repo, env });
  if (!root) {
    /* FAIL CLOSED. An id handed out with no ledger behind it is exactly the
       convention this tool exists to replace, and handing one out under this
       tool's name would be worse than the convention, because it would carry
       the confidence of a mechanism. */
    return { ok: false, reason: "NO_LEDGER",
             detail: "no shared git directory could be resolved, so no id can be taken that "
                   + "another worktree cannot also take. Refusing rather than minting unsafely." };
  }
  const f = corpusFloor(ns, { repo });

  /* THE PRIMITIVE IS TESTED BEFORE IT IS TRUSTED, and against the real ledger
     directory rather than a temp dir — the property being tested belongs to the
     filesystem the ledger is on. Everything below this line is a demonstration of
     something that does not work if this fails, and it would fail SILENTLY: the
     claim writes would all succeed and every racer would get the same number, which
     is exactly what M0-17's neutered control arm produced on purpose.

     ORDER MATTERS AND IT IS A CORRECTION. The probe ran AFTER the namespace mkdir in
     the first draft, so an unwritable ledger THREW out of `mint` instead of returning
     a refusal — an unreadable failure in the shape of D-93, in the very path whose job
     is to refuse cleanly. The mkdir is now inside the guard and both answer as
     refusals with codes. */
  try { mkdirSync(root, { recursive: true }); }
  catch (e) {
    return { ok: false, reason: "LEDGER_UNWRITABLE", ledger: root,
             detail: `the ledger directory could not be created (${e.code}). Refusing rather than minting unsafely.` };
  }
  const exclusive = exclusivityProbe(root);
  if (!exclusive.ok)
    return { ok: false, reason: exclusive.reason, ledger: root,
             detail: `${exclusive.detail}. An id taken here would carry the confidence of a mechanism `
                   + `and none of its safety, which D-242 names as worse than the convention it replaces. `
                   + `Refusing rather than minting unsafely.` };
  try { mkdirSync(join(root, ns), { recursive: true }); }
  catch (e) {
    return { ok: false, reason: "LEDGER_UNWRITABLE", ledger: root,
             detail: `the namespace directory could not be created (${e.code}). Refusing rather than minting unsafely.` };
  }
  const hosts = ledgerHosts(root, { record: true });
  recordWatermark(root, ns, f.floor);

  const ids = [], collided = [];
  let n = f.floor + 1;
  const limit = f.floor + 1 + 100000; /* a bound, so a broken ledger cannot spin forever */
  while (ids.length < count) {
    if (n >= limit) return { ok: false, reason: "LEDGER_EXHAUSTED", detail: `no free id below ${limit}` };
    const rec = JSON.stringify({ ns, n, who, why, at: new Date().toISOString(), tree: repo }) + "\n";
    try {
      writeFileSync(claimPath(root, ns, n), rec, { flag: "wx" });
      ids.push(`${ns}-${n}`);
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
      collided.push(n); /* somebody else holds it — that is the mechanism working */
    }
    n++;
  }
  return { ok: true, ns, ids, floor: f.floor, floorFrom: f.from, ledger: root,
           collided, discarded: f.discarded, missing: f.missing,
           /* carried on the RESULT, so a caller that never prints still has it */
           scope: { ledger: root, hosts, overridden: Boolean(env.BIO_IDALLOC_DIR), exclusive } };
}

/** Ids currently held in the ledger for `ns`. Reads ONE directory this tool
 *  created and owns; it reports no repository census and no baseline, which is
 *  why it is not the walk class `hygiene.test.mjs` guards. */
export function held(ns, { repo = REPO_ROOT, env = process.env } = {}) {
  const root = ledgerRoot({ repo, env });
  if (!root || !existsSync(join(root, ns))) return [];
  return readdirSync(join(root, ns)).map(Number).filter((x) => Number.isInteger(x)).sort((a, b) => a - b);
}

/* --------------------------------------------------------------------- the CLI */

function currentBranch(repo) {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"],
      { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || "unknown";
  } catch { return "unknown"; }
}

function usage() {
  console.log("usage: node tools/mintid.mjs <NAMESPACE> [--count N] [--who <id>] [--why <text>] [--json]");
  console.log("       node tools/mintid.mjs --list [<NAMESPACE>]");
  console.log("       node tools/mintid.mjs <NAMESPACE> --floor-only");
  console.log("       node tools/mintid.mjs --audit [--base <ref>]   the integration-side check (D-243)");
  console.log("\nNAMESPACES (the shared id spaces this project allocates into):");
  for (const [ns, s] of Object.entries(NAMESPACES))
    console.log(`  ${ns.padEnd(5)} ${s.kind.padEnd(10)} ${s.what}`);
}

/* ------------------------------------------------------------------- the audit
 *
 * THE STEP THAT LIVES WHERE CONDUCT ACTUALLY RUNS, AND IT IS A COMMAND RATHER THAN A
 * PARAGRAPH. M0-17 delegated "a step in CONDUCT's integration loop"; a step described
 * in prose is a mechanism believed on the strength of its existence, which is the
 * defect this project meets most. So the step is one command, `kickoffs/CONDUCT.md`
 * step 2 names it, and `mintid.test.mjs` asserts that it does — the same self-check
 * M0-17 built for the spawn-brief line.
 *
 * FOUR QUESTIONS, AND THEY DO NOT ALL HAVE THE SAME STANDING:
 *   1. DUPLICATES     definitive, needs no ledger        -> exit 1. A break.
 *   2. WATERMARK      needs the ledger, local            -> a QUESTION.
 *   3. INTRODUCED     needs the ledger and a diff        -> a QUESTION.
 *   4. REGISTER       definitive, needs no ledger        -> exit 1 if a prefix
 *                     allocates with no register row, because an unregistered
 *                     namespace cannot be minted at all and nothing else prompts.
 *
 * A QUESTION NEVER FAILS THE RUN, and that is deliberate: every id allocated before
 * 2026-08-08 is honestly `unknown`, and a gate that answers unknown for the whole
 * corpus is the shape `VERIFICATION.md` already refuses. Undetermined is first-class
 * and is printed as itself. */
function audit(argv) {
  const val = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt; };
  let breaks = 0;

  console.log(`AUDIT of ${REPO_ROOT}`);
  for (const l of scopeLines(scopeOf())) console.log(l);

  /* --- 1. duplicates: the effect, in the commit, definitive ------------------ */
  const c = collisions();
  console.log(`\n1. DUPLICATE ALLOCATIONS — ${c.sites} allocation site(s) read across ${c.graded.length} graded namespace(s)`);
  console.log(`   graded: ${c.graded.map((g) => `${g.ns}:${g.sites}`).join(" ")}`);
  for (const n of c.notCovered) console.log(`   NOT COVERED  ${n.ns} — ${n.why}`);
  if (c.fresh.length) {
    breaks++;
    console.log(`   BREAK ${c.fresh.length} NEW duplicate allocation(s) — two things wearing one id:`);
    for (const d of c.fresh) console.log(`         ${d.id} at ${d.at.join(" and ")}`);
    console.log(`         Renumber one of each pair, or — if it predates this instrument — add it to`);
    console.log(`         KNOWN_COLLISIONS in tools/mintid.mjs WITH A REASON.`);
  } else {
    console.log(`   no NEW duplicates. ${c.known.length} pre-existing collision(s) registered and still present:`);
    for (const k of c.known) console.log(`         ${k.id} — ${k.why}`);
  }
  if (c.stale.length) {
    breaks++;
    console.log(`   BREAK ${c.stale.length} registered collision(s) are NO LONGER duplicated (${c.stale.map((s) => s.id).join(", ")}).`);
    console.log(`         Somebody renumbered them: delete the entry, so the register cannot outlive its reason.`);
  }

  /* --- 2. the ledger's high-water against the corpus's ---------------------- */
  console.log(`\n2. ALLOCATED ABOVE THE LEDGER — an allocation higher than every id the ledger ever issued`);
  const root = ledgerRoot();
  if (!root) {
    console.log(`   UNKNOWN — no ledger on this machine, so this question cannot be asked here at all.`);
  } else {
    let asked = 0;
    for (const ns of Object.keys(NAMESPACES)) {
      const h = held(ns);
      if (!h.length) continue;
      asked++;
      const top = h[h.length - 1];
      const f = corpusFloor(ns);
      const w = watermark(ns);
      const strict = f.allocFloor;
      const line = `   ${ns.padEnd(5)} ledger holds ${h.length} (${h[0]}..${top}) · watermark ${w.floor ?? "unknown"} (${w.source})`
                 + ` · highest corpus allocation ${strict === null ? "not gradable" : strict}`;
      if (strict !== null && strict > top)
        console.log(`${line}\n         QUESTION ${ns}-${strict} is allocated and sits above ${ns}-${top}, the highest id this`
                  + `\n         ledger ever issued. Either it was taken without the allocator, or it came in on a`
                  + `\n         branch minted from a ledger this machine cannot see (D-242).`);
      else console.log(line);
    }
    if (!asked) console.log(`   UNKNOWN — the ledger holds no ids in any namespace yet, so it can grade nothing.`);
  }

  /* --- 3. the ids a branch introduces --------------------------------------- */
  const base = val("--base", null);
  console.log(`\n3. IDS INTRODUCED BY A DIFF${base ? ` against ${base}` : ""}`);
  if (!base) {
    console.log(`   skipped — pass --base <ref> (at integration: the ref you are merging ONTO) to classify`);
    console.log(`   every id the branch introduces as HELD / NOT HELD / PRE-LEDGER.`);
  } else if (!root) {
    console.log(`   UNKNOWN — no ledger on this machine.`);
  } else {
    let diff = null;
    try { diff = execFileSync("git", ["diff", "-U0", `${base}...HEAD`], { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 1 << 28 }); }
    catch (e) { console.log(`   UNKNOWN — git diff against ${base} failed (${e.code || e.message}).`); }
    if (diff !== null) {
      const added = diff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1)).join("\n");
      const rows = [];
      for (const ns of Object.keys(NAMESPACES)) {
        const spec = NAMESPACES[ns];
        if (!spec.allocPattern || spec.allocIsUnique === false) continue;
        const re = spec.allocPattern(ns); re.lastIndex = 0;
        let m;
        while ((m = re.exec(added))) {
          const n = Number(m.slice(1).find((g) => g !== undefined));
          if (!Number.isInteger(n) || n > spec.ceiling) continue;
          const w = watermark(ns).floor;
          const isHeld = held(ns).includes(n);
          rows.push({ id: `${ns}-${n}`, verdict: isHeld ? "HELD" : (w === null || n <= w) ? "PRE-LEDGER" : "NOT HELD" });
        }
      }
      const seen = new Map();
      for (const r of rows) seen.set(r.id, r.verdict);
      const by = (v) => [...seen].filter(([, x]) => x === v).map(([i]) => i);
      console.log(`   ${seen.size} id(s) introduced · HELD ${by("HELD").length} · NOT HELD ${by("NOT HELD").length} · PRE-LEDGER ${by("PRE-LEDGER").length}`);
      if (by("HELD").length) console.log(`   HELD        ${by("HELD").join(" ")}`);
      if (by("NOT HELD").length) {
        console.log(`   QUESTION    ${by("NOT HELD").join(" ")}`);
        console.log(`               above this namespace's watermark and not in the ledger: allocated without the`);
        console.log(`               allocator, or minted on a machine this ledger does not cover. ASK, do not fail.`);
      }
      if (by("PRE-LEDGER").length) console.log(`   UNKNOWN     ${by("PRE-LEDGER").join(" ")} — at or below the watermark; the ledger has nothing to say.`);
    }
  }

  /* --- 4. the register cannot fall behind ----------------------------------- */
  const u = unregisteredNamespaces();
  console.log(`\n4. THE REGISTER — ${u.prefixes.length} prefix(es) allocate at a queue site across ${u.filesRead} corpus file(s): ${u.prefixes.join(" ")}`);
  if (u.unregistered.length) {
    breaks++;
    console.log(`   BREAK ${u.unregistered.length} prefix(es) allocate ids and are NOT in NAMESPACES, so mintid REFUSES them`);
    console.log(`         by name and that family is still on the convention that collides:`);
    for (const x of u.unregistered) console.log(`         ${x.prefix} — ${x.items} allocation(s), first seen in ${x.first}`);
    console.log(`         Add a row to NAMESPACES in tools/mintid.mjs naming the corpus its floor is read from.`);
  } else {
    console.log(`   every allocating prefix has a register row.`);
  }

  console.log(`\naudit: ${breaks} break(s). Questions above are QUESTIONS — every id allocated before`);
  console.log(`2026-08-08 is honestly unknown, and a gate that answers unknown for the whole corpus`);
  console.log(`is the shape VERIFICATION.md refuses. What this CANNOT see: an un-minted id that has`);
  console.log(`not yet collided and sits below its namespace's watermark; a collision inside C or M`);
  console.log(`(both named above); a collision between two branches nobody has merged.`);
  return breaks ? 1 : 0;
}

function main(argv) {
  const flag = (name) => argv.includes(name);
  const val = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt; };
  const positional = argv.filter((a, i) => !a.startsWith("--")
    && !(i > 0 && ["--count", "--who", "--why"].includes(argv[i - 1])));

  if (flag("--help") || (!positional.length && !flag("--list") && !flag("--audit"))) { usage(); return flag("--help") ? 0 : 2; }

  if (flag("--audit")) return audit(argv);

  if (flag("--list")) {
    const which = positional.length ? positional : Object.keys(NAMESPACES);
    const root = ledgerRoot();
    console.log(`LEDGER ${root || "(none — this is not a git checkout; mint would REFUSE)"}`);
    for (const ns of which) {
      if (!NAMESPACES[ns]) { console.log(`  ${ns}: unknown namespace`); continue; }
      const f = corpusFloor(ns);
      const h = held(ns);
      console.log(`  ${ns.padEnd(5)} floor ${String(f.floor).padEnd(5)} from ${String(f.from ?? "(nothing found)").padEnd(46)}`
        + ` · ${f.seen} ref(s) read · ledger holds ${h.length}${h.length ? ` (${h[0]}..${h[h.length - 1]})` : ""}`
        + (f.discarded.length ? ` · ${f.discarded.length} above ceiling ${NAMESPACES[ns].ceiling} IGNORED (${f.discarded[0]})` : "")
        + (f.proseDriven ? ` · NOTE the floor is PROSE-DRIVEN: the highest real allocation is ${ns}-${f.allocFloor}, so ${f.floor - f.allocFloor} number(s) will be skipped — an id-shaped example was written into a file that is a corpus` : "")
        + (f.allocFloor === null ? " · (no allocation pattern declared: this namespace's floor counts mentions)" : "")
        + (f.missing.length ? ` · corpus file(s) absent: ${f.missing.join(", ")}` : ""));
    }
    for (const l of scopeLines(scopeOf())) console.log(l);
    return 0;
  }

  const ns = positional[0];
  if (!NAMESPACES[ns]) {
    /* FAIL CLOSED, and now SAY WHAT TO DO. Refusing by name is the right direction and
       was M0-17's; what it lacked was the next action, so an unregistered family simply
       carried on allocating by hand — measured, three of them (FW, COFF, CAP), one of
       which had already collided on FW-15. `--audit` section 4 now catches that from
       the other side, so this message and that check close the gap in both directions. */
    console.error(`REFUSED: unknown namespace ${JSON.stringify(ns)}. Nothing is minted for a prefix with no`);
    console.error(`register row, because the floor would be read from no corpus at all.`);
    console.error(`If ${JSON.stringify(ns)} really is a shared id space, add a row to NAMESPACES in tools/mintid.mjs`);
    console.error(`naming the corpus its floor is read from, then run \`node tools/mintid.mjs --audit\`.`);
    usage();
    return 2;
  }

  if (flag("--floor-only")) {
    const f = corpusFloor(ns);
    console.log(`FLOOR ${ns}-${f.floor} from ${f.from ?? "(nothing found)"} · ${f.seen} ref(s) read`);
    return 0;
  }

  const count = Number(val("--count", "1"));
  const who = val("--who", currentBranch(REPO_ROOT));
  const r = mint(ns, { count, who, why: val("--why", "") });

  if (!r.ok) {
    console.error(`REFUSED ${r.reason}: ${r.detail}`);
    return 3;
  }
  if (flag("--json")) { console.log(JSON.stringify(r)); return 0; }

  for (const id of r.ids) console.log(`MINTED ${id}`);
  console.log(`  floor ${ns}-${r.floor} (from ${r.floorFrom ?? "nothing found"})`
    + ` · ledger ${r.ledger}`
    + ` · taken by ${who}`
    + (r.collided.length ? ` · ${r.collided.length} id(s) ALREADY HELD and stepped over: ${r.collided.join(", ")}` : ""));
  if (r.discarded.length)
    console.log(`  NOTE ${r.discarded.length} match(es) above the ceiling ignored as noise (${r.discarded[0]})`);
  console.log(`  the ledger is NOT committed. If it is lost this falls back to the corpus floor —`
    + ` today's convention, no worse. Gaps are expected and cost nothing.`);
  /* D-242. The happy path is where a false belief is formed, so the happy path is
     where the sentence has to be — not only in a comment and a debt row. */
  for (const l of scopeLines(r.scope)) console.log(l);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url)))
  process.exit(main(process.argv.slice(2)));
