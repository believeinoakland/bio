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
 *     longer dense, so `D-244` existing does not imply `D-243` does.  This is
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

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
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
 */
const QUEUE_CORPUS = [
  "docs/development/QUEUE.md",
  "docs/development/MILESTONES.md",
  "docs/development/IS-BUILD-PLAN.md",
  "docs/development/UI-PLAN.md",
  "docs/development/PLAN.md",
];

const item = (what) => ({ kind: "prose", what, corpus: QUEUE_CORPUS, ceiling: 9999 });

export const NAMESPACES = {
  /* (i) code-referenced */
  C: { kind: "code", what: "check families in the catalog (the dotted members of a family are the family owner's)",
       corpus: ["bio-plane/checks/bio-checks.mjs"], ceiling: 999 },

  /* (ii) prose-referenced */
  D: { kind: "prose", what: "debt rows",
       corpus: ["docs/development/DEBT.md", "docs/development/QUEUE.md", "docs/development/CLAIMS.md"], ceiling: 9999 },
  DEC: { kind: "prose", what: "decisions",
         corpus: ["docs/development/DECISIONS.md", "docs/development/QUEUE.md"], ceiling: 9999 },
  IC: { kind: "prose", what: "interface-change entries",
        corpus: ["docs/development/INTERFACE-CHANGES.md", "docs/development/QUEUE.md"], ceiling: 9999 },
  M: { kind: "prose", what: "measurement entries",
       corpus: ["docs/development/MEASUREMENTS.md", "docs/development/QUEUE.md"], ceiling: 999 },

  /* (ii) prose-referenced — the queue item families, one corpus between them */
  REC: item("RECORD queue items"),
  UI: item("UI queue items"),
  CPDF: item("CONTENT-PDF queue items"),
  FL: item("fleet queue items"),
  PL: item("investigative-session build-plan items"),
  SK: item("skillpack queue items"),
  IS: item("investigative-session items"),
  VF: item("verification queue items"),
  M0: item("test-estate queue items"),
  DIST: item("DIST queue items"),

  /* (iii) structural */
  I: { kind: "structural", what: "interface identities", corpus: ["docs/development/INTERFACES.md"],
       ceiling: 99, pattern: (ns) => new RegExp(`^##\\s+${ns}(\\d+)\\b`, "gm") },
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
  }
  return { floor, from, seen, discarded, missing, corpus: spec.corpus };
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
  mkdirSync(join(root, ns), { recursive: true });

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
           collided, discarded: f.discarded, missing: f.missing };
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
  console.log("\nNAMESPACES (the shared id spaces this project allocates into):");
  for (const [ns, s] of Object.entries(NAMESPACES))
    console.log(`  ${ns.padEnd(5)} ${s.kind.padEnd(10)} ${s.what}`);
}

function main(argv) {
  const flag = (name) => argv.includes(name);
  const val = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt; };
  const positional = argv.filter((a, i) => !a.startsWith("--")
    && !(i > 0 && ["--count", "--who", "--why"].includes(argv[i - 1])));

  if (flag("--help") || (!positional.length && !flag("--list"))) { usage(); return flag("--help") ? 0 : 2; }

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
        + (f.missing.length ? ` · corpus file(s) absent: ${f.missing.join(", ")}` : ""));
    }
    return 0;
  }

  const ns = positional[0];
  if (!NAMESPACES[ns]) { console.error(`REFUSED: unknown namespace ${JSON.stringify(ns)}`); usage(); return 2; }

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
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url)))
  process.exit(main(process.argv.slice(2)));
