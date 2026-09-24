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
     THAT DAY CAME, AND THIS LINE IS WHERE IT WAS PREDICTED (D-242, 2026-09-23): every worker became its own cloud
     clone, and the corpus floor alone re-issued ids held on `land/*` branches. The TAKE therefore moved to ONE
     writer — a compare-and-swap push to `origin/coord` (`take`, below the ledger section) — and this ledger is now
     each clone's RECORD of its takes.
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

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync, statSync } from "node:fs";
import { hostname, tmpdir } from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join, resolve, isAbsolute, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { ARCHIVE_TARGETS, LEDGERS } from "./ledger.mjs";
/* M0-110: the queue, backlog, claims and archive corpora live on `coord` after the cutover. Every read and walk
   of a corpus goes through the coord layer — the pointer is the switch — or each floor would read the one-line
   pointer and fall to zero, which is the DANGEROUS direction for an allocator (it re-issues ids). */
import { readState, walkState, isSwitched, freshen } from "./coord.mjs";
/* M0-100: the measurement and interface-change ledgers are a FROZEN file plus one file per new entry; their corpus is
   named by the one reader (`tools/entries.mjs` corpus(): the frozen file and the entry directory), never spelled here. */
import { corpus as entryCorpus } from "./entries.mjs";

/* A corpus file's text as a reader sees it (absolute paths inside the repo are read by their relative path). Throws
   when absent, as `readFileSync` did, so every caller's `missing` bookkeeping is unchanged. */
const OPTIONAL_CORPUS = new Set(Object.values(LEDGERS).filter((l) => l.optional).map((l) => l.live));
function readCorpus(repo, p) {
  const abs = isAbsolute(p) ? p : join(repo, p);
  const rel = relative(repo, abs).split(sep).join("/");
  const t = rel.startsWith("..") ? null : readState(repo, rel);
  if (t !== null) return t;
  /* M0-119: the backlog's TAIL is absent until a row is first demoted into it, and an absent tail is an EMPTY one
     (`ledger.mjs` LEDGERS.LATER, optional) — never `missing`, which would read as a corpus gone dark. */
  if (OPTIONAL_CORPUS.has(rel)) return "";
  return readFileSync(abs, "utf8");
}

/* THE DUPLICATE CHECK READS THE ARCHIVER'S FILES (LED-2, M-57 breakage 2). `allocations()` and
   `unregisteredNamespaces()` iterate a corpus RAW, so the `docs/archive/` DIRECTORY entry was a
   `readFileSync` that threw and landed in `missing`: 109 D, 195 queue and 55 DEC allocations sat
   outside duplicate detection, and the moment `tools/ledger.mjs` moved ONE half of a registered
   collision (D-124, CPDF-9, FW-15, M0-16) the pair would have stopped being one, the register gone
   stale, and `plancheck` failed on a collision that still existed. So the directory entry now
   yields exactly the files `ledger.mjs archive` writes, and a pair split between live and archive
   is still one collision here.
   WHY NOT THE WHOLE DIRECTORY, which `corpusFloor` expands: the August roll left every archived
   QUEUE row's heading BOTH in `QUEUE-2026-08.md` and as a stub in the live register — ~190 pairs
   that are one allocation written twice, not two. Reading them would report ~190 false duplicates
   (M-57). They stay outside this check, and that is NAMED here rather than scored clean: a
   collision between a live id and one that exists ONLY in the August files is not seen. The
   floors are unaffected (they have always expanded the directory). */
/* M0-100: any OTHER directory entry (the per-entry ledgers' directories, `entries.mjs`) is expanded to its files, by
   repo-relative path, so a new entry's `## <NS>-<n> ·` heading is an allocation site like any in the frozen file. Read
   raw, a directory threw and landed in `missing`: every new entry would have sat outside duplicate detection. */
const allocationCorpus = (corpus, repo = REPO_ROOT) => corpus.flatMap((rel) => (rel === "docs/archive/" ? ARCHIVE_TARGETS
  : rel.endsWith("/") && !isAbsolute(rel) ? expandCorpus([rel], repo).map((p) => relative(repo, p).split(sep).join("/")) : [rel]));

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
  "docs/archive/",                 /* see expandCorpus: a floor may never fall because a doc moved */
  "docs/development/QUEUE.md",
  /* LED-6: the BACKLOG holds every open item not in the cache, in the queue grammar. An id
     that lives only there must still be seen, or the migration would let a second allocation
     of it pass. */
  "docs/development/BACKLOG.md",
  /* M0-119: the backlog's TAIL is the same order continued — an id placed there must still be seen. */
  "docs/development/BACKLOG-LATER.md",
  "docs/development/MILESTONES.md",
  "docs/development/UI-PLAN.md",
  /* MOVED, NOT REMOVED, 2026-09-14 (M0-26): the plan closed at 43/43 and went to
     `docs/archive/IS-BUILD-PLAN.md`. */
  "docs/archive/IS-BUILD-PLAN.md",
  /* `PLAN.md` was here and is now `docs/archive/PLAN.md`, reached by the directory
     entry above. Removed rather than repointed: a second path to a file the
     directory already yields is a place for the two to disagree later.
     **THAT PRECEDENT DOES NOT TRANSFER TO `IS-BUILD-PLAN.md`, AND THE SUITE PROVED
     IT RATHER THAN THE READER SPOTTING IT.** M0-26 removed the entry on the
     reasoning above and `mintid.test.mjs` went red on three arms: **only
     `corpusFloor` expands a directory entry (`expandCorpus`, line ~368); the two
     other readers of this list — `allocations()` and `unregisteredNamespaces()` —
     iterate `spec.corpus`/`QUEUE_CORPUS` RAW**, so `readFileSync` on
     `"docs/archive/"` throws and the whole directory is silently skipped. Removing
     `PLAN.md` cost those two readers nothing because `PLAN.md` ALLOCATES NOTHING
     (measured, and stated in the reach comment below); `IS-BUILD-PLAN.md` carries
     the ONLY `| <NS>-<n> |` TRACK TABLE ROWS in the corpus — PL, FL, SK, VF, DS and
     four of UI — so dropping its named path scored all five families zero while the
     id FLOORS stayed identical, because the floors are the one figure the directory
     entry does reach. A named path beside the directory entry is therefore REQUIRED
     here, not redundant, until every reader expands alike. */
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
  /* Registered 2026-09-23 by D-52, the first generator to take one (NOTIFICATIONS.md §The catalogue:
     "Ids are allocated when a generator is built … the way C-numbers are"). The allocation site is
     `QUEUE_KIND_IDS` in `queuestate.mjs`, a `"<slug>": "N-<n>"` row, and that file is the WHOLE corpus
     on purpose: NOTIFICATIONS.md's item contract carries a worked example id, and a prose corpus would
     read it as an allocation and skip every number beneath it (the prose-driven floor IC and CASE
     already carry). */
  N: { kind: "code", what: "notification kinds in the queue catalogue (NOTIFICATIONS.md; the kind's slug stays its `kind`)",
       corpus: ["bio-plane/src/queuestate.mjs"], ceiling: 999,
       allocPattern: () => /^\s*"[a-z0-9_-]+":\s*"N-(\d+)"/gm, allocIsUnique: true },

  /* (ii) prose-referenced */
  /* M0-140, 2026-09-24: `docs/development/DEBT.md` LEFT this corpus with the construct — it is archived whole into
     `docs/archive/ledgers/DEBT-closed.md`, which `docs/archive/` (first in the list, and unchanged) already walks.
     A `D-` is now a PLAN row's id, minted for a defect diagnosed until its fix can be named (CLAUDE.md §4); the
     archive is what keeps every retired `D-` unmintable. MEASURED both sides of the change, because a floor that
     FALLS re-issues ids: floor 508 from `BACKLOG.md`, 8282 refs, before and after. */
  D: { kind: "prose", what: "defect rows in the build plan, and the retired DEBT ledger's archived rows",
       corpus: ["docs/archive/", "docs/development/QUEUE.md", "docs/development/BACKLOG.md", "docs/development/BACKLOG-LATER.md", "docs/development/CLAIMS.md"], ceiling: 9999,
       /* an allocation is a table ROW opening the id; a number in a sentence is not */
       allocPattern: () => /^\|\s*D-(\d+)\s*\|/gm, allocIsUnique: true,
       /* THE FLOOR READS A WIDER SITE THAN THE DUPLICATE CHECK, AND ONLY `D` NEEDS THIS (M0-140, 2026-09-24).
          MEASURED, and it is the retirement's own consequence: with DEBT retired a `D-` is minted for a defect and
          placed as a PLAN ROW (`### D-497 · running`; CLAUDE.md §4), which `allocPattern` above — a DEBT table row
          and nothing else — does not see. On coord `f3ca0ad8` that left D-496..D-508 counted only as MENTIONS while
          the highest recognised ALLOCATION read D-443, so `corpusFloor` called a CORRECT floor of 508 *prose-driven*
          and reported 65 ids about to be skipped that are in fact real, allocated plan rows. The generous floor was
          never wrong; the classification was, and a wrong *proseDriven* is a report that the estate's own prose is
          leaking ids when it is not.
          WHY NOT JUST WIDEN `allocPattern`: measured, and it is the reason this is two fields and not one. A CLOSED
          `D-n` is written in BOTH grammars on purpose — `### D-n · done` in the QUEUE archive is the ITEM that
          closed the debt row, `| D-n |` in the DEBT archive is the row it closed (`ledgersFor` names the same pair;
          M-57 measured 17 of them). Widening `allocPattern` made `allocIsUnique` read every one of those as a
          duplicate: 120 false collisions on this tree, against a register of six. The floor may count both shapes
          because it takes a MAXIMUM; the duplicate check may not, because it counts OCCURRENCES.
          NOT CLOSED BY THIS: whether `D` should have one allocation site again, and which, is a question about the
          namespace's model rather than about the DEBT construct, so M0-140 diagnoses it and leaves it. Reported to
          SCHEDULER with this landing. Until it is ruled, the floor is right, the duplicate check is unchanged from
          what it has always graded, and NEITHER is guessed. */
       floorPattern: itemAlloc },
  /* M0-73: DEC, IC and M read `BACKLOG.md` beside `QUEUE.md`, as D and the queue families already did
     (LED-6). The floor counts a MENTION, and after LED-6's split a row citing an id may live only in the
     backlog — an id mentioned nowhere else would set no floor and could be handed out a second time.
     `pipeline-readers.test.mjs` §7 asserts the class: no corpus names the cache without the backlog. */
  DEC: { kind: "prose", what: "decisions",
         corpus: ["docs/archive/", "docs/development/DECISIONS.md", "docs/development/QUEUE.md", "docs/development/BACKLOG.md", "docs/development/BACKLOG-LATER.md"], ceiling: 9999,
         allocPattern: () => /^###\s+DEC-(\d+)\s+·/gm, allocIsUnique: true },
  IC: { kind: "prose", what: "interface-change entries",
        corpus: ["docs/archive/", ...entryCorpus("IC"), "docs/development/QUEUE.md", "docs/development/BACKLOG.md", "docs/development/BACKLOG-LATER.md"], ceiling: 9999,
        /* `## IC-n ·` opens the entry; the `### IC-n · RESPONSES / RESOLUTION /
           CONFIRM` blocks beneath it are that entry's own sub-sections and are not
           allocations — measured: IC-2 carries four of them. */
        allocPattern: () => /^##\s+IC-(\d+)\s+·/gm, allocIsUnique: true },
  /* `M`'s ALLOCATION SITE, DECLARED 2026-09-15 (M0-39), AND THE REASON IT COULD NOT BE
     DECLARED BEFORE HAS EXPIRED RATHER THAN BEEN OVERRULED.

     WHAT THIS ROW SAID UNTIL TODAY, and it was true when written: *"`MEASUREMENTS.md`
     allocates nothing at a recognisable site: its 4,000+ lines are dated prose and its
     single `### M-4` heading is a sentence."* So `allocPattern` was omitted on purpose,
     `allocFloor` answered null, and `--audit` reported `NOT COVERED  M`.

     WHAT THAT COST, MEASURED: on 2026-09-15 **four workers of one wave filed `M-21`** —
     M0-34 (kept), COFF-11 (→ M-22), REC-90 (→ M-23) and FW-18 (→ M-24) — **and FW-18's
     reached `origin/main` at `a59ac7b` beside M0-34's with nothing failing**, because a
     namespace with no declared site is a namespace `allocations()` returns
     `covered:false` for and `plancheck`'s duplicate gate therefore never grades.

     AND THE DIAGNOSIS THAT MATTERS IS NOT THE ONE THE INCIDENT FIRST GOT. `mintid`
     ALLOCATES `M` and always has — it is a row in this register and `mintid.mjs M
     --floor-only` answers. The four collisions were a **BYPASS of a working allocator**,
     not a gap in it: each worker read the corpus floor out of `MEASUREMENTS.md` and added
     one, which is correct on every branch and wrong in the union, and **the bypass left
     nothing for the audit to see.** (The renumbering that followed bypassed it the same
     way.) So what is added here is the thing a bypass becomes VISIBLE in — a site — and
     not a second allocator.

     THE SITE IS READ OFF THE FILE AS IT STANDS, NOT LEGISLATED ONTO IT. `## M-<n> · …` is
     the shape every measurement entry from `M-8` onward carries, twelve of them, and it is
     the file's own convention rather than one invented here.

     WHAT THE SITE CANNOT SEE, and both are NAMED rather than scored clean:

       - `## 2026-08-08 · M-4 —` — the LEGACY DATE-FIRST heading, the one entry written
         before the convention settled. It is not normalised, because `MEASUREMENTS.md` is
         held by another item and because a matcher whose reach is stated is worth more
         than a corpus edited to fit it. The generous floor still counts it (the floor
         counts a MENTION), so nothing can be minted over it; what it is invisible to is
         the DUPLICATE detector, which would not see a second `## 2026-…· M-4 —`.
       - **THE TWO ALLOCATION SPACES ARE STILL TWO, AND THE SITE PICKS ONE ON PURPOSE.**
         `QUEUE.md` carries `### M-4 · done`, an item heading in the (now dormant)
         measurement LANE; `MEASUREMENTS.md` carries the measurement ENTRY. For `M-4` those
         are two records of ONE allocation — the lane item that produced the entry — so
         admitting both shapes would make every future lane item read as a duplicate of its
         own measurement and force `allocIsUnique:false`, i.e. back to NOT COVERED. The
         site is therefore the ENTRY heading alone (`^## M-n ·`, two hashes), and the
         queue's three-hash item heading is deliberately outside it. `M-8`..`M-24` have no
         queue rows at all, which is why this costs nothing today and is stated anyway. */
  M: { kind: "prose", what: "measurement entries",
       corpus: ["docs/archive/", ...entryCorpus("M"), "docs/development/QUEUE.md", "docs/development/BACKLOG.md", "docs/development/BACKLOG-LATER.md"], ceiling: 999,
       allocPattern: () => /^##\s+M-(\d+)\s+·/gm, allocIsUnique: true },

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
  /* Registered 2026-09-18 by CONDUCT #4 when BOB #14 decomposed Bob's ledger restructure into LED-1..LED-5,
     the headings written in the same commit, so the prefix never allocated unregistered (CASE's precedent). */
  /* Registered 2026-09-18 by CONDUCT #4 with the MK-1..MK-5 headings (MEMBER-KNOWLEDGE-DESIGN.md §8), same commit. */
  MK: item("member-knowledge queue items (D-184/D-194, MEMBER-KNOWLEDGE-DESIGN.md)"),
  LED: item("ledger-restructure queue items (Bob's 2026-09-18 direction: small, ordered, always-current ledgers)"),
  /* Registered 2026-08-10 when DEC-72's decomposition arrived. The design doc
     `CASE-AS-PRODUCTION.md` names CASE-1..CASE-6 as a BULLET LIST, which matches
     NEITHER allocation shape — so unlike PL/FL/SK/VF/DS, the queue's `### CASE-n ·`
     headings are the FIRST allocation site rather than a second one, and there is no
     duplicate to renumber. Registered before the headings were written, so the prefix
     was never allocating unregistered. */
  /* CASE CARRIES ITS OWN CEILING AND ITS OWN PATTERN, AND BOTH ARE PAID FOR.
     The FIRST registration used the generic `\bCASE-(\d+)` and minted CASE-2027..2032
     — because the record's PUBLISHED CASE IDENTIFIER is `CASE-<year>-<seq>`, and
     `CASE-2026-0001` in an archived ledger read as queue item 2026. That is `M`'s
     hazard exactly, named in this file already: TWO ALLOCATION SPACES WEARING ONE
     PREFIX. The six ids are BURNED and the design doc's own CASE-1..CASE-6 stand.
     The pattern now requires the number to END there — a word boundary NOT followed
     by a hyphen — so the record's identifier can never move this floor again. Kept as
     a pattern rather than a ceiling because a ceiling of 999 would still admit
     `CASE-0001-...` if the identifier's shape ever flips. */
  CASE: { ...item("case-as-a-production queue items (DEC-72, CASE-AS-PRODUCTION.md)"),
          ceiling: 999,
          pattern: (ns) => new RegExp(`\\b${ns}-(\\d+)\\b(?!-)`, "g") },

  /* (iii) structural */
  I: { kind: "structural", what: "interface identities", corpus: ["docs/development/INTERFACES.md"],
       ceiling: 99, pattern: (ns) => new RegExp(`^##\\s+${ns}(\\d+)\\b`, "gm"),
       allocPattern: (ns) => new RegExp(`^##\\s+${ns}(\\d+)\\s+—`, "gm"), allocIsUnique: true },
};

/* ------------------------------------------------------------------ the corpus

   A CORPUS ENTRY ENDING IN `/` IS A DIRECTORY AND EXPANDS TO EVERY `.md` BENEATH
   IT, and the only such entry today is `docs/archive/`.

   ADDED 2026-08-10 because the corpus consolidation would otherwise have handed
   out an id already in use, silently, on the next fresh clone.  The mechanism is
   exactly the one this file's own header describes and is worth restating at the
   site: the floor counts a MENTION, and the ledger above it is deliberately NOT
   COMMITTED (a committed ledger races), so a fresh clone re-derives its floor
   from the corpus alone.  MOVE PROSE THAT NAMES A HIGH ID OUT OF THE CORPUS AND
   THE FLOOR FALLS WITH IT.  `CLAIMS.md` carries 2,150 of `D`'s 2,150 references
   between it and `DEBT.md`; `PLAN.md` is in the queue corpus and is closed
   history.  Both are archive candidates, and archiving either without this would
   lower a floor that only a collision would reveal.

   A DIRECTORY RATHER THAN A LIST OF MOVED PATHS, deliberately: a list is a thing
   a future session must remember to update, and this repository's most-repeated
   finding is that a hand-kept list falls behind silently — the purge table three
   releases behind, the `npm test` chain of 38 against 41.  A directory cannot
   fall behind, because the act of archiving IS the act of registering. */

function expandCorpus(corpus, repo) {
  const out = [];
  for (const rel of corpus) {
    if (!rel.endsWith("/")) { out.push(rel); continue; }
    const base = isAbsolute(rel) ? rel : join(repo, rel);
    /* M0-110: inside the repository the walk is `walkState` — the same sorted, depth-first order over what a reader
       sees, so an archive roll created on `coord` is in the floor's corpus. Absolute paths are kept, as before. */
    const inRepo = relative(repo, base).split(sep).join("/");
    if (!isAbsolute(rel) && !inRepo.startsWith("..")) {
      for (const f of walkState(repo, inRepo.replace(/\/$/, ""))) if (f.endsWith(".md")) out.push(join(repo, f));
      continue;
    }
    const walk = (d) => {
      let names; try { names = readdirSync(d); } catch { return; }
      for (const n of names.sort()) {
        const p = join(d, n);
        let st; try { st = statSync(p); } catch { continue; }
        if (st.isDirectory()) walk(p);
        else if (n.endsWith(".md")) out.push(p);
      }
    };
    walk(base);
  }
  return out;
}

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
  /* M0-140: `floorPattern` overrides `allocPattern` FOR THE FLOOR ONLY, where a namespace's allocation is written
     in more shapes than its duplicate check may count as separate sites. See `D` in NAMESPACES for the measurement. */
  const allocRe = spec.floorPattern || spec.allocPattern;
  let allocFloor = allocRe ? 0 : null;
  const discarded = [];
  const missing = [];
  for (const rel of expandCorpus(spec.corpus, repo)) {
    const p = isAbsolute(rel) ? rel : join(repo, rel);
    let src;
    try { src = readCorpus(repo, p); } catch { missing.push(rel); continue; }
    let m; re.lastIndex = 0;
    while ((m = re.exec(src))) {
      seen++;
      const n = Number(m[1]);
      if (n > spec.ceiling) { discarded.push(`${m[0]} in ${rel}`); continue; }
      if (n > floor) { floor = n; from = rel; }
    }
    if (allocRe) {
      const ar = allocRe(ns);
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
 * design (named, not scored clean); a SECOND `M-4` written in the LEGACY date-first
 * heading shape, which `M`'s site (declared 2026-09-15, M0-39) deliberately does not
 * match — `M` itself is graded now and this is the one heading in it that is not;
 * an id referred to in prose but never allocated at a site; and a collision
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
  for (const rel of allocationCorpus(spec.corpus, repo)) {
    const p = isAbsolute(rel) ? rel : join(repo, rel);
    let src;
    try { src = readCorpus(repo, p); } catch { missing.push(rel); continue; }
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
  for (const rel of allocationCorpus(QUEUE_CORPUS, repo)) {
    let src;
    try { src = readCorpus(repo, rel); } catch { continue; }
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
  /* M0-117, 2026-09-22: THE LEDGER IS CREATED BEFORE IT IS PROBED, exactly as `mint`
     creates it. This handed the ledger path straight to `exclusivityProbe`, which writes
     INTO it and does not create it (deliberately: its missing-directory refusal is an
     asserted arm). A clone that had never minted therefore read PROBE_UNWRITABLE (ENOENT)
     — a claim about a directory nobody had made yet, reported as a claim about the
     filesystem — and every fresh clone's first full gate was RED at `mintid.test.mjs`
     (M-99). The create is idempotent on an existing ledger; a path that cannot be created
     answers LEDGER_UNWRITABLE, the mint's own code for the same failure. */
  let exclusive = null;
  if (!r) exclusive = { ok: false, reason: "NO_LEDGER", detail: "no shared git directory" };
  else {
    try { mkdirSync(r, { recursive: true }); }
    catch (e) {
      exclusive = { ok: false, reason: "LEDGER_UNWRITABLE", detail: `the ledger directory could not be created (${e.code})` };
    }
    if (!exclusive) exclusive = exclusivityProbe(r);
  }
  return { ledger: r, hosts: r ? ledgerHosts(r) : [], overridden: Boolean(env.BIO_IDALLOC_DIR), exclusive };
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

/* ------------------------------------------------- THE TAKE: ONE WRITER (D-242, 2026-09-23)
 *
 * WHY THE LEDGER ABOVE STOPPED BEING THE ALLOCATOR, AND IT IS A MEASUREMENT. Everything above
 * makes a take exclusive against every process sharing ONE `.git` — and on 2026-09-23 no two
 * workers shared one: every worker is its own cloud clone, so every clone had its own empty
 * ledger and the exclusive create was exclusive against nothing. That day alone clones minted
 * IC-222 three times, IC-224, IC-228, IC-231 three times, C-68..C-72 and M-117 twice, each
 * already held on an in-flight `land/*` branch. And the floor could not save them: the C floor
 * read `bio-checks.mjs` in the minting tree only, and an id a sibling had written on its landing
 * ref is on no tree but that ref.
 *
 * THE MECHANISM: A COMPARE-AND-SWAP PUSH TO `<remote>/coord`. A take reads coord's tip, writes
 * the ids it takes into `ids/<NS>.tsv` in a commit whose ONLY parent is that tip, and pushes it
 * WITHOUT force. A remote ref refuses a non-fast-forward, so of two takes built on one tip exactly
 * one lands; the loser's push is REJECTED, and it re-reads the new tip — which now holds the
 * winner's id — and takes above it. The remote's ref update is the one atomic act, and every
 * clone on every machine that can push to the remote passes through it.
 *
 * WHY THIS AND NOT THE PLANE'S `Store.allocId`, which the row offered as the alternative. Both
 * are one writer. The CAS push needs nothing that does not already exist: every worker already
 * pushes `coord` (`tools/coord.mjs write` is how a claim is made, and it is itself a CAS loop
 * over the same ref), so a worker that can claim can take, and a worker that cannot reach coord
 * cannot claim either. `allocId` would need a new plane op, an IC, a deploy (DIST's), a
 * credential in every worker, and it would make id allocation — a development act — depend on
 * the production plane being up and on the development namespace living in the record. Measured
 * from this cloud container, 2026-09-23: `git push --dry-run origin <ff-child>:refs/heads/coord`
 * was accepted by the receive-pack (and, one fetch earlier, REFUSED `[rejected] (fetch first)`
 * because coord had moved — the CAS refusal itself, on the real remote); and coord's own log
 * carries cloud sessions' pushes minutes apart.
 *
 * THE FLOOR THE TAKE READS COVERS EVERY ID VISIBLE ANYWHERE, IN EVERY NAMESPACE: the highest of
 *   - this tree's corpus floor (`corpusFloor`, unchanged — it reads the working tree and coord);
 *   - the same namespace corpus read at the REMOTE's `main`, `coord` and EVERY `land/*` tip, as
 *     `git ls-remote` listed them at the take (the C floor reading only main is the measured harm);
 *   - every id `ids/<NS>.tsv` on coord already holds (the take's own ledger);
 *   - every id this clone's pre-D-242 local ledger holds (an id minted there and not yet written
 *     anywhere is still not handed out again).
 *
 * WHEN THE PUSH FAILS FOR ANY REASON BUT A RACE — the network, a 403, a hook declining, coord
 * absent, a fetch refused — THE TAKE REFUSES AND HANDS OUT NOTHING. There is no fallback to the
 * local ledger or the corpus floor: a local guess is exactly the convention that collided, and
 * handing one out under this tool's name would carry the confidence of a mechanism (the D-242
 * sentence above). Only a push rejected as a non-fast-forward (`[rejected] (non-fast-forward)`,
 * `(fetch first)`, `(stale info)`, or the remote's `cannot lock ref`) is a lost race, and it is
 * retried, bounded.
 *
 * WHAT IT DOES NOT COVER, stated: an id written by hand without this tool (the audit's 2b
 * question still asks); an id a worker minted and has not yet pushed ANYWHERE by an allocator
 * other than this one (the pre-D-242 local ledger of another clone); a namespace corpus read at a
 * `land/*` tip covers the corpus files only, not a mention elsewhere on that branch.
 *
 * THE TEST NEVER TOUCHES THE REAL COORD: `BIO_IDTAKE_REMOTE` names the remote (default `origin`),
 * and a caller that planted a scratch ledger (`BIO_IDALLOC_DIR`) without naming the remote is
 * REFUSED (TAKE_REMOTE_UNNAMED), because that is a suite aimed at the real record. */
export const TAKE_BRANCH = "coord";
export const TAKE_DIR = "ids";
export const takeFile = (ns) => `${TAKE_DIR}/${ns}.tsv`;
export const takeRemote = (env = process.env) => env.BIO_IDTAKE_REMOTE || "origin";

function tgit(repo, args, { input = null, env = null } = {}) {
  const r = spawnSync("git", ["-c", "gc.auto=0", "-c", "maintenance.auto=false", ...args], {
    cwd: repo, input: input ?? undefined, encoding: "utf8", maxBuffer: 1 << 30,
    env: env ? { ...process.env, ...env } : process.env,
  });
  return { status: r.status, stdout: r.stdout || "", stderr: r.stderr || "" };
}

/** The ids `ids/<NS>.tsv` holds: one line per id taken, `<NS>-<n>\t<iso>\t<who>\t<why>`. */
export function takenIn(text, ns) {
  const out = [];
  for (const m of String(text || "").matchAll(new RegExp(`^${ns}-(\\d+)\\t`, "gm"))) out.push(Number(m[1]));
  return out;
}

/** The namespace's corpus read at each named REF (the remote's main, coord and every land/* tip),
 *  by the same generous pattern and ceiling as `corpusFloor`. Throws when git cannot read them:
 *  a floor that could not be read is not a floor of zero. */
export function refsFloor(ns, { repo = REPO_ROOT, refs = [] } = {}) {
  const spec = NAMESPACES[ns];
  if (!spec) throw new Error(`unknown namespace ${ns}`);
  const specs = spec.corpus.filter((rel) => !isAbsolute(rel))
    .map((rel) => (rel.endsWith("/") ? `:(glob)${rel}**/*.md` : rel));
  if (!refs.length || !specs.length) return { floor: 0, from: null, seen: 0, refs: refs.length };
  const re = spec.pattern ? spec.pattern(ns) : new RegExp(`\\b${ns}-(\\d+)`, "g");
  const r = tgit(repo, ["grep", "-I", "-E", "-e", `${ns}-?[0-9]`, ...refs, "--", ...specs]);
  if (r.status !== 0 && r.status !== 1)
    throw new Error(`git grep over ${refs.length} ref(s) failed (exit ${r.status}): ${r.stderr.trim().slice(0, 200)}`);
  let floor = 0, from = null, seen = 0;
  for (const line of r.stdout.split("\n")) {
    const a = line.indexOf(":"), b = line.indexOf(":", a + 1);
    if (a < 0 || b < 0) continue;
    const text = line.slice(b + 1);
    const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    for (const m of text.matchAll(g)) {
      seen++;
      const n = Number(m[1]);
      if (!Number.isInteger(n) || n > spec.ceiling) continue;
      if (n > floor) { floor = n; from = line.slice(0, b); }
    }
  }
  return { floor, from, seen, refs: refs.length };
}

const RACE_RE = /\[rejected\][^\n]*\((?:non-fast-forward|fetch first|stale info)\)|cannot lock ref|failed to update ref/i;
const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/** TAKE `count` ids in `ns` through the ONE writer. Returns `{ok:false, reason, detail}` and NO
 *  ids on every failure that is not a lost race — never a local guess. */
export function take(ns, { count = 1, who = "unknown", why = "", repo = REPO_ROOT, env = process.env,
                           maxAttempts = 24, beforePush = null } = {}) {
  if (!NAMESPACES[ns]) throw new Error(`unknown namespace ${ns}`);
  if (!Number.isInteger(count) || count < 1) throw new Error(`--count must be a positive integer`);
  const no = (reason, detail) => ({ ok: false, reason, detail: `${detail} NOTHING WAS TAKEN — no id is handed out without the one writer (D-242).` });
  if (env.BIO_IDALLOC_DIR && !env.BIO_IDTAKE_REMOTE)
    return no("TAKE_REMOTE_UNNAMED", "BIO_IDALLOC_DIR plants a scratch ledger but BIO_IDTAKE_REMOTE names no remote, so this take "
      + "would push to the REAL coord. Name the remote (BIO_IDTAKE_REMOTE=origin for the real one).");
  const remote = takeRemote(env);
  /* THE FENCE IS ON WHERE THE REMOTE RESOLVES, NOT ON WHETHER ONE IS NAMED — and that is a receipt, this item's own.
     Its first suite named `BIO_IDTAKE_REMOTE=origin` meaning the scratch CLONE's origin, while a child process whose
     argv[1] was this file ran the CLI, whose repo is THIS checkout: `origin` resolved to the real remote and eight
     takes (D-459..D-466) landed on the REAL coord. A remote NAME means whatever the repo it is resolved in says. So a
     take with a planted ledger must resolve to a LOCAL path (a scratch remote); a network remote is refused. */
  if (env.BIO_IDALLOC_DIR) {
    const isPath = /^(?:\/|\.{1,2}\/|file:\/\/)/.test(remote);
    const url = isPath ? remote : tgit(repo, ["remote", "get-url", remote]).stdout.trim();
    if (!/^(?:\/|\.{1,2}\/|file:\/\/)/.test(url))
      return no("TAKE_REMOTE_NOT_SCRATCH", `BIO_IDALLOC_DIR plants a scratch ledger but the take remote \`${remote}\` resolves in ${repo} to `
        + `${url ? `\`${url}\`` : "nothing"}, which is not a local scratch repository. A planted ledger never takes from a network remote.`);
  }
  /* EVERY GIT ACT BELOW NAMES THE URL, NEVER THE REMOTE NAME, and that is measured: a fetch naming the remote also
     updates `refs/remotes/<remote>/coord` opportunistically, so concurrent takes in ONE clone failed on that ref's
     lock ("cannot lock ref … but expected …") and refused — safe, and a refusal nobody needed. By URL, a take writes
     only its own private read refs. */
  const isPathSpec = /^(?:\/|\.{1,2}\/|file:\/\/)/.test(remote) || /^[a-z]+:\/\//i.test(remote) || remote.includes("@");
  const where = isPathSpec ? remote : tgit(repo, ["remote", "get-url", remote]).stdout.trim();
  if (!where) return no("REMOTE_UNREACHABLE", `the take remote \`${remote}\` names no remote in ${repo}.`);
  const base = `refs/bio-idtake/${process.pid}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const drop = () => {
    const l = tgit(repo, ["for-each-ref", "--format=%(refname)", `${base}/`]);
    const refs = l.stdout.split("\n").filter(Boolean);
    if (refs.length) tgit(repo, ["update-ref", "--stdin"], { input: refs.map((r) => `delete ${r}\n`).join("") });
  };
  try {
    /* 1. WHAT THE REMOTE HOLDS, AT ONE MOMENT: coord (the writer), main, and every landing ref. */
    const ls = tgit(repo, ["ls-remote", where, `refs/heads/${TAKE_BRANCH}`, "refs/heads/main", "refs/heads/land/*"]);
    if (ls.status !== 0)
      return no("REMOTE_UNREACHABLE", `\`git ls-remote ${remote}\` failed (exit ${ls.status}): ${ls.stderr.trim().split("\n").slice(-2).join(" ").slice(0, 300)}.`);
    const heads = ls.stdout.split("\n").filter(Boolean).map((l) => l.split("\t")[1]).filter(Boolean);
    if (!heads.includes(`refs/heads/${TAKE_BRANCH}`))
      return no("NO_WRITER", `${remote} has no \`${TAKE_BRANCH}\` branch, so there is no one writer to take through.`);
    const f = tgit(repo, ["fetch", "-q", "--no-tags", "--no-write-fetch-head", "--refmap=", where,
      ...heads.map((h) => `+${h}:${base}/${h.slice("refs/heads/".length)}`)]);
    if (f.status !== 0)
      return no("REMOTE_UNREACHABLE", `the fetch of ${heads.length} ref(s) from ${remote} failed (exit ${f.status}): ${f.stderr.trim().slice(0, 300)}.`);

    /* 2. THE FLOOR: every id visible anywhere. */
    const tree = corpusFloor(ns, { repo });
    let refs;
    try { refs = refsFloor(ns, { repo, refs: heads.map((h) => `${base}/${h.slice("refs/heads/".length)}`) }); }
    catch (e) { return no("FLOOR_UNREADABLE", `the namespace's corpus could not be read at the remote's refs: ${e.message}.`); }
    const localHeld = held(ns, { repo, env });
    const localTop = localHeld.length ? localHeld[localHeld.length - 1] : 0;
    const land = heads.filter((h) => h.startsWith("refs/heads/land/")).length;

    let lost = 0;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        const rf = tgit(repo, ["fetch", "-q", "--no-tags", "--no-write-fetch-head", "--refmap=", where, `+refs/heads/${TAKE_BRANCH}:${base}/${TAKE_BRANCH}`]);
        if (rf.status !== 0) return no("REMOTE_UNREACHABLE", `re-reading ${remote}/${TAKE_BRANCH} after a lost race failed: ${rf.stderr.trim().slice(0, 300)}.`);
      }
      const tipR = tgit(repo, ["rev-parse", "--verify", "--quiet", `${base}/${TAKE_BRANCH}^{commit}`]);
      if (tipR.status !== 0) return no("NO_WRITER", `${remote}/${TAKE_BRANCH} was listed but could not be read.`);
      const tip = tipR.stdout.trim();
      const cur = tgit(repo, ["cat-file", "blob", `${tip}:${takeFile(ns)}`]);
      const text = cur.status === 0 ? cur.stdout : "";
      const onCoord = takenIn(text, ns);
      const coordTop = onCoord.length ? Math.max(...onCoord) : 0;
      const floor = Math.max(tree.floor, refs.floor, coordTop, localTop);
      const at = new Date().toISOString();
      const ids = [], lines = [];
      for (let n = floor + 1; ids.length < count; n++) {
        ids.push(`${ns}-${n}`);
        lines.push(`${ns}-${n}\t${at}\t${String(who).replace(/[\t\n]/g, " ")}\t${String(why).replace(/[\t\n]/g, " ")}\n`);
      }
      const body = (text && !text.endsWith("\n") ? text + "\n" : text) + lines.join("");
      const blob = tgit(repo, ["hash-object", "-w", "--stdin"], { input: body });
      const idx = join(tmpdir(), `bio-idtake-${process.pid}-${Math.random().toString(36).slice(2, 8)}.index`);
      const ienv = { GIT_INDEX_FILE: idx };
      const ident = tgit(repo, ["config", "user.email"]).stdout.trim() ? {}
        : { GIT_AUTHOR_NAME: "mintid", GIT_AUTHOR_EMAIL: "mintid@bio.invalid", GIT_COMMITTER_NAME: "mintid", GIT_COMMITTER_EMAIL: "mintid@bio.invalid" };
      let commit = null;
      try {
        const steps = [
          tgit(repo, ["read-tree", tip], { env: ienv }),
          tgit(repo, ["update-index", "--add", "--cacheinfo", `100644,${blob.stdout.trim()},${takeFile(ns)}`], { env: ienv }),
        ];
        const wt = tgit(repo, ["write-tree"], { env: ienv });
        const bad = [blob, ...steps, wt].find((s) => s.status !== 0);
        if (bad) return no("COMMIT_FAILED", `the take's commit could not be built: ${bad.stderr.trim().slice(0, 300)}.`);
        const ct = tgit(repo, ["commit-tree", wt.stdout.trim(), "-p", tip, "-F", "-"], { env: ident,
          input: `mintid: ${ids.join(" ")} taken by ${who}${why ? ` — ${why}` : ""}\n\nD-242: one writer, a compare-and-swap push to ${TAKE_BRANCH}.\n` });
        if (ct.status !== 0) return no("COMMIT_FAILED", `the take's commit could not be built: ${ct.stderr.trim().slice(0, 300)}.`);
        commit = ct.stdout.trim();
      } finally { rmSync(idx, { force: true }); }

      if (beforePush) beforePush({ attempt, tip, commit, ids });
      const p = tgit(repo, ["push", "--porcelain", where, `${commit}:refs/heads/${TAKE_BRANCH}`]);
      if (p.status === 0) {
        /* THE REMOTE SAID YES; read it back rather than believe it. A later take may already sit on top. */
        const back = tgit(repo, ["ls-remote", where, `refs/heads/${TAKE_BRANCH}`]);
        const onRemote = (back.stdout.split(/\s/)[0] || "").trim();
        let verified = onRemote === commit ? "the remote's tip is this commit" : null;
        if (!verified && back.status === 0) {
          const vf = tgit(repo, ["fetch", "-q", "--no-tags", "--no-write-fetch-head", "--refmap=", where, `+refs/heads/${TAKE_BRANCH}:${base}/${TAKE_BRANCH}`]);
          if (vf.status === 0 && tgit(repo, ["merge-base", "--is-ancestor", commit, `${base}/${TAKE_BRANCH}`]).status === 0)
            verified = `the remote's tip ${onRemote.slice(0, 8)} descends from this commit`;
          else if (vf.status === 0)
            return no("TAKE_NOT_ON_REMOTE", `the push of ${commit.slice(0, 8)} was acknowledged but ${remote}/${TAKE_BRANCH} (${onRemote.slice(0, 8)}) does not contain it.`);
        }
        /* The local ledger becomes a RECORD of this clone's takes (the audit reads it), never the allocator. */
        const root = ledgerRoot({ repo, env });
        let recorded = 0;
        if (root) {
          try {
            mkdirSync(join(root, ns), { recursive: true });
            for (const id of ids) {
              const n = Number(id.slice(ns.length + 1));
              try { writeFileSync(claimPath(root, ns, n), JSON.stringify({ ns, n, who, why, at, tree: repo, writer: `${remote}/${TAKE_BRANCH}@${commit}` }) + "\n", { flag: "wx" }); recorded++; }
              catch { /* a record, not the allocator: the take above is what made it exclusive */ }
            }
          } catch { /* same */ }
        }
        return { ok: true, ns, ids, floor, floorFrom: floor === coordTop && coordTop ? `${remote}/${TAKE_BRANCH}:${takeFile(ns)}`
                   : floor === refs.floor && refs.floor ? refs.from : floor === localTop && localTop ? "this clone's local ledger" : tree.from,
                 floors: { tree: tree.floor, refs: refs.floor, coordLedger: coordTop, localLedger: localTop },
                 reach: { remote, coord: tip, main: heads.includes("refs/heads/main"), land, refsRead: refs.refs },
                 lost, attempts: attempt, collided: [], ledger: root, recorded,
                 writer: { remote, branch: TAKE_BRANCH, commit, verified: verified || `push acknowledged; read-back failed (${back.stderr.trim().slice(0, 120)})` },
                 discarded: tree.discarded, missing: tree.missing };
      }
      const out = `${p.stdout}${p.stderr}`;
      if (!RACE_RE.test(out))
        return no("PUSH_FAILED", `the push to ${remote}/${TAKE_BRANCH} was refused, and not as a lost race: ${out.trim().split("\n").slice(-3).join(" ").slice(0, 400)}.`);
      lost++;
      pause(Math.floor(Math.random() * 60 * Math.min(attempt, 8)) + 10);
    }
    return no("RETRIES_EXHAUSTED", `${remote}/${TAKE_BRANCH} moved under ${maxAttempts} consecutive attempts.`);
  } finally { drop(); }
}

/** The sentence a take prints: what the id is exclusive against, and what it is not. */
export function takeScopeLines(r) {
  const s = r || {};
  const w = s.writer || {}, reach = s.reach || {};
  return [
    `SCOPE exclusive against EVERY allocator that takes through ${w.remote || "(no remote)"}/${w.branch || TAKE_BRANCH} — every clone, every machine:`,
    `      the take is a compare-and-swap push (${String(w.commit || "").slice(0, 8) || "no commit"}; ${w.verified || "unverified"}), so two takes on one tip cannot both land.`,
    `      The floor read ${reach.main ? "main" : "NO main"}, coord and ${reach.land ?? "?"} land/* tip(s) on ${reach.remote || "?"}, this tree, and this clone's local ledger.`,
    `      NOT exclusive against an id written by HAND, or one another tool allocated and put on no branch yet (D-242).`,
  ];
}

/* --------------------------------------------------------------------- the CLI */

function currentBranch(repo) {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"],
      { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || "unknown";
  } catch { return "unknown"; }
}

/* -------------------------------------------------- THE ARGUMENT SURFACE, M0-52
 *
 * AN ALLOCATION MUST BE UNAMBIGUOUS TO ITS CALLER, AND IT WAS AMBIGUOUS IN BOTH
 * DIRECTIONS.  Measured 2026-09-17, two doors onto one defect:
 *
 *   DOOR ONE  the caller asked to LOOK and the tool WROTE.  `main` built its
 *             positional list by DISCARDING every `--`-prefixed token it did not
 *             recognise, so `mintid.mjs M0 --show` dropped `--show`, saw a valid
 *             namespace, and fell through to the IRREVERSIBLE allocating default.
 *             The guard existed — `mintid.mjs --definitely-not-a-flag` printed
 *             usage and minted nothing — and a VALID NAMESPACE bypassed it.
 *             `IC-111`, `IC-113` and `M0-53` were burned this way.
 *   DOOR TWO  the caller WROTE and could not tell WHAT, so wrote again.  See the
 *             restatement at the foot of `main`.
 *
 * WHY A WHITELIST RATHER THAN A CLEARER WARNING, and it is this tool's own thesis
 * turned on itself.  `D-289` recorded door two's mechanism on 2026-08-10, called
 * itself *the second time in two days*, and prescribed the practice "run `mintid`
 * bare and read all of it".  That was written down, it was correct, and the third
 * occurrence happened anyway (`D-395`).  This file's own header records that a
 * VIGILANCE FIX WAS ALREADY TRIED AND DOES NOT WORK — every brief for two days told
 * workers to measure first and EVERY ONE OF THEM DID — and that the remedy was to
 * write the COMMAND, not a better warning.  A command that punishes a typo with a
 * silent irreversible write reintroduces the vigilance it was built to retire, in
 * the one place this project has already decided vigilance does not work.  So the
 * fix is a mechanism: an option this tool does not read REFUSES, and nothing moves.
 *
 * THE SET IS DERIVED FROM THE TOOL AND NOT RECALLED — it is every `flag(...)` and
 * `val(...)` read in `main` and in `audit`, grepped rather than remembered, and the
 * hygiene arm in `mintid.test.mjs` re-derives it from the source so this list
 * cannot go stale the way every hand-carried list in this repository has.
 *
 * AND THE OVER-STRICTNESS HALF IS THE ONE THAT DECIDES IT.  The cheapest green here
 * is a parser that refuses everything unfamiliar, which makes the arm pass and the
 * tool unusable — a tool that starts REFUSING where it answered is a worse failure
 * than a burned id, because it strands a worker mid-item.  Two consequences: the
 * VALUE of a value-taking option is skipped, so `--why --anything` is still a why
 * and not an option; and single-dash tokens are left exactly as they were, falling
 * through to the unknown-namespace refusal that already fails closed. */
const VALUE_FLAGS = new Set(["--count", "--who", "--why", "--base"]);
export const KNOWN_FLAGS = new Set(["--help", "--list", "--audit", "--floor-only", "--json",
                             ...VALUE_FLAGS]);

/** Every `--`-prefixed token this tool does not read, in order, skipping the VALUE
 *  of a value-taking option so a value that looks like an option is still a value. */
export function unknownFlags(argv) {
  const bad = [];
  for (let i = 0; i < argv.length; i++) {
    if (i > 0 && VALUE_FLAGS.has(argv[i - 1])) continue;  /* this token is a VALUE */
    if (argv[i].startsWith("--") && !KNOWN_FLAGS.has(argv[i])) bad.push(argv[i]);
  }
  return bad;
}

function usage() {
  console.log("usage: node tools/mintid.mjs <NAMESPACE> [--count N] [--who <id>] [--why <text>] [--json]");
  console.log("       (the take is a compare-and-swap push to <remote>/coord, remote BIO_IDTAKE_REMOTE or origin — D-242;");
  console.log("        if the push fails for any reason but a lost race, NOTHING is taken: retry, never number by hand)");
  console.log("       node tools/mintid.mjs --list [<NAMESPACE>]");
  console.log("       node tools/mintid.mjs <NAMESPACE> --floor-only");
  console.log("       node tools/mintid.mjs --audit [--base <ref>]   the integration-side check (D-243)");
  console.log("\nAn option this tool does not read is REFUSED and nothing is minted (M0-52). To LOOK");
  console.log("without allocating use --floor-only; the minted id is repeated on stderr and on the");
  console.log("LAST line, so a filter over stdout cannot hide what you were given.");
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

  /* --- 2b. THE BYPASS, PER ID (M0-39) ---------------------------------------
   *
   * WHAT SECTION 2 ABOVE CANNOT SEE, AND WHY THAT MATTERED THE DAY THIS WAS WRITTEN. It
   * compares ONE number — the highest corpus allocation — against the top of the ledger.
   * So an id taken by hand BELOW the ledger's top is invisible to it, and that is exactly
   * the shape a renumber produces: `M-22`, `M-23` and `M-24` were written by hand while the
   * ledger's top stood at 28, and section 2's line for `M` read clean.
   *
   * THE QUESTION THIS ASKS INSTEAD, per id: is this allocation, which sits ABOVE its
   * namespace's watermark and is therefore inside the ledger's reach, one the ledger ever
   * issued? A `no` is a BYPASS — somebody read a corpus floor and added one instead of
   * calling the allocator — and a bypass is the thing that leaves no trace anywhere else.
   *
   * IT IS A QUESTION AND NOT A BREAK, on this file's own standing reasoning: the ledger is
   * deliberately not committed, so a fresh clone or a second machine answers `no` for work
   * that was minted perfectly well elsewhere (D-242). A gate that answers unknown for a
   * whole corpus is the shape `VERIFICATION.md` refuses. What it costs to leave it a
   * question is that somebody must read it; what it would cost to make it a gate is that
   * everybody would switch it off.
   *
   * MEASURED THE DAY IT LANDED, AND THE FIGURE IS THE WHOLE ARGUMENT FOR DECLARING A SITE:
   * across the 15 graded namespaces whose ledger has history, **4 bypasses, every one of
   * them in `M`** — M-9, M-22, M-23, M-24 — and ZERO in the other fourteen. `M` is the one
   * namespace that had no allocation site until 2026-09-15, and it is the only one that
   * was bypassed. Three of the four are CONDUCT's own renumbering of the `M-21` collision,
   * which the queue row predicted and which nothing could see until now. */
  if (root) {
    console.log(`\n2b. ALLOCATED WITHOUT THE ALLOCATOR — an allocation INSIDE the ledger's reach that it never issued`);
    let asked = 0, found = 0;
    for (const ns of Object.keys(NAMESPACES)) {
      const a = allocations(ns);
      if (!a.covered) continue;
      const w = watermark(ns).floor;
      if (w === null) { console.log(`   ${ns.padEnd(5)} UNKNOWN — this namespace has no ledger history, so nothing here is gradable`); continue; }
      asked++;
      const h = new Set(held(ns));
      const inReach = [...new Set(a.sites.map((s) => s.n))].filter((n) => n > w).sort((x, y) => x - y);
      const bypassed = inReach.filter((n) => !h.has(n));
      found += bypassed.length;
      if (!bypassed.length) continue;
      const where = (n) => a.sites.filter((s) => s.n === n).map((s) => `${s.file}:${s.line}`).join(", ");
      console.log(`   ${ns.padEnd(5)} QUESTION ${bypassed.length} of ${inReach.length} allocation(s) above watermark ${w} are NOT in this ledger:`);
      for (const n of bypassed) console.log(`         ${ns}-${n}  at ${where(n)}`);
    }
    console.log(`   ${found} bypass question(s) across ${asked} namespace(s) with ledger history.`
      + (found ? `\n         Each is either an id taken WITHOUT \`mintid\` — which is what the allocator exists to`
               + `\n         make impossible and what leaves no other trace — or an id minted from a ledger this`
               + `\n         machine cannot see (D-242). ASK the author; do not renumber on this alone.` : ""));
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
  console.log(`not yet collided and sits below its namespace's watermark; a collision inside C`);
  console.log(`(named above); a second M-4 in the LEGACY date-first heading shape, which M's site`);
  console.log(`does not match; a collision between two branches nobody has merged.`);
  return breaks ? 1 : 0;
}

function main(argv) {
  const flag = (name) => argv.includes(name);
  const val = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt; };
  const positional = argv.filter((a, i) => !a.startsWith("--")
    && !(i > 0 && ["--count", "--who", "--why"].includes(argv[i - 1])));

  /* M0-52. BEFORE ANYTHING ELSE, because everything below this line can allocate.
     The refusal names the token and names the READ-ONLY form, which is the whole
     failure mode: a caller who wanted to LOOK and mistyped the name of looking. */
  const bad = unknownFlags(argv);
  if (bad.length) {
    console.error(`REFUSED: unrecognised option ${bad.map((b) => JSON.stringify(b)).join(", ")}. NOTHING WAS MINTED and the ledger did not move.`);
    console.error(`An unrecognised option used to be DISCARDED, and with a valid namespace present this tool then fell`);
    console.error(`through to its ALLOCATING default — so a caller who meant to LOOK got an irreversible WRITE (M0-52).`);
    console.error(`  to LOOK without allocating:      node tools/mintid.mjs <NAMESPACE> --floor-only`);
    console.error(`  to read it programmatically:     node tools/mintid.mjs <NAMESPACE> --json`);
    console.error(`  to see floors and held ids:      node tools/mintid.mjs --list [<NAMESPACE>]`);
    usage();
    return 2;
  }

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
  /* D-242: THE CLI TAKES THROUGH THE ONE WRITER. `mint` above is this clone's local ledger and is kept as that
     layer (its suite drives it); it is exclusive against nothing once every worker is its own clone. */
  const r = take(ns, { count, who, why: val("--why", "") });

  if (!r.ok) {
    console.error(`REFUSED ${r.reason}: ${r.detail}`);
    return 3;
  }
  if (flag("--json")) { console.log(JSON.stringify(r)); return 0; }

  for (const id of r.ids) console.log(`MINTED ${id}`);
  console.log(`  floor ${ns}-${r.floor} (from ${r.floorFrom ?? "nothing found"})`
    + ` · this tree ${r.floors.tree} · remote refs ${r.floors.refs} · coord ledger ${r.floors.coordLedger} · local ledger ${r.floors.localLedger}`
    + ` · taken by ${who}`
    + (r.lost ? ` · LOST ${r.lost} race(s) to another take and re-took above it` : ""));
  if (r.discarded.length)
    console.log(`  NOTE ${r.discarded.length} match(es) above the ceiling ignored as noise (${r.discarded[0]})`);
  console.log(`  held on ${r.writer.remote}/${r.writer.branch}:${takeFile(ns)} at ${r.writer.commit.slice(0, 8)};`
    + ` recorded in this clone's ledger ${r.ledger || "(none)"} (${r.recorded}). Gaps are expected and cost nothing.`);
  /* D-242. The happy path is where a false belief is formed, so the happy path is
     where the sentence has to be — not only in a comment and a debt row. */
  for (const l of takeScopeLines(r)) console.log(l);

  /* ------------------------------------------------------------- M0-52, DOOR TWO
   *
   * THE ID SURVIVES A FILTER, BECAUSE THE OUTPUT BEING UNREADABLE IS WHAT CAUSED
   * THE SECOND ALLOCATION.  `MINTED <id>` is the FIRST line and the ledger, scope
   * and D-242 detail follow it, so `mintid <NS> | tail -1` shows a scope line and
   * NEVER the id.  M0-51's worker hit exactly that, could not see what it had been
   * given, and RE-RAN AN ALLOCATING COMMAND to find out — burning `D-395`.  That is
   * this project's own pipe trap (a pipeline reports the LAST stage, so every filter
   * you add to make long output readable also throws away the answer you were
   * filtering for) fused to an irreversible write, and the causation runs the wrong
   * way round: the unreadable output is the CAUSE of the extra allocation, not a
   * cosmetic consequence of it.  `D-289` recorded the same mechanism on 2026-08-10
   * and prescribed "run it bare and read all of it"; that is a practice, and the
   * practice did not hold.  So the id is restated by MECHANISM, twice, and the two
   * are INDEPENDENT rather than belt-and-braces decoration — each covers the filter
   * the other loses:
   *
   *   on STDERR      survives `| tail`, `| head`, `| grep`, `| jq`, `> file` — any
   *                  filter or redirect of STDOUT, because it is not on stdout.
   *                  Lost only under `2>/dev/null`, which is where the next one is.
   *   on the LAST    survives `2>/dev/null` and `2>&1 | tail -1`.  `| head -1`
   *   STDOUT LINE    already saw the first line, so the two ends are both covered.
   *
   * WHAT IS DELIBERATELY NOT TOUCHED.  The first `MINTED` line and every line
   * between it and here are BYTE-IDENTICAL, so nothing that reads this output today
   * stops working — this is purely ADDITIVE.  `--json` returns above and is left
   * exactly as it was: a single-line object on stdout is already unambiguous under
   * `tail -1`, it is the documented programmatic form, and changing it would break
   * the one caller shape that never had this defect.  And the `ALREADY HELD and
   * stepped over` note was checked rather than added — the tool already computes and
   * prints those ids, which is the only reason `M0-53` was ever recoverable. */
  console.error(`MINTED ${r.ids.join(" ")}   (repeated on STDERR: a STDOUT filter cannot eat this line — M0-52)`);
  console.log(`MINTED ${r.ids.join(" ")}   (repeated on the LAST line, so \`| tail -1\` shows the id — M0-52)`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  /* M0-110: the floors read the corpora on `coord` — fetch it first, or a stale ref could re-issue an id. */
  if (isSwitched(REPO_ROOT)) freshen(REPO_ROOT);
  process.exit(main(process.argv.slice(2)));
}
