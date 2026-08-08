/* M0-17 — AN ID THAT CANNOT BE TAKEN TWICE, DRIVEN UNDER CONCURRENCY.
 *
 * The subject is `tools/mintid.mjs`. The reason it exists is a measurement, not
 * a worry: seven items collided on an id in ONE day (a C-number family, two IC
 * numbers, four D-numbers), and in every case both workers measured the number
 * free over the real file and BOTH WERE RIGHT WHEN THEY LOOKED. It was one
 * collision at a concurrency budget of two and seven at a budget of eight.
 *
 * THE ARM THIS SUITE EXISTS FOR IS THE RACE, AND IT IS DRIVEN RATHER THAN
 * REASONED ABOUT — eight real processes, started together, minting from one
 * ledger. The whole class arose from a race nobody simulated, so a suite that
 * argued about atomicity instead of running it would be repeating the mistake.
 *
 * AND THE RACE PROVES ITSELF. A driver that accidentally SERIALISES its children
 * would report eight distinct ids and prove nothing — an outcome that costs
 * nothing to produce is not evidence (CLAUDE.md). So this suite measures the
 * OVERLAP of the children's lifetimes and asserts it, and the negative control
 * below closes the loop from the other side: with the exclusive create neutered,
 * the SAME driver must produce a collision.
 *
 * NEGATIVE CONTROL: (1) in `tools/mintid.mjs` change the claim write's
 * `{ flag: "wx" }` to `{ flag: "w" }` -> the race arm FAILS with duplicate ids,
 * which is both the diagnosis and the proof that this driver really races;
 * (2) delete the `const f = corpusFloor(...)` line and start `n` at 1 instead
 * -> the "an emptied ledger never re-issues an id the corpus already holds" arm
 * FAILS, because the ledger stops being a ratchet over the corpus;
 * (3) drop the `ceiling` guard in `corpusFloor` -> the "year-shaped noise is
 * discarded and SAID" arm FAILS and the C floor jumps to a year;
 * (4) make `ledgerRoot` return `git rev-parse --git-dir` instead of
 * `--git-common-dir` -> the "the ledger is in the SHARED gitdir" arm FAILS,
 * which is the arm that catches a mechanism scoped to one worktree and
 * therefore armed over nothing;
 * (5) remove the `mintid` mention from `docs/development/kickoffs/CONDUCT.md`
 * -> the "the mechanism is in the loop CONDUCT actually runs" arm FAILS;
 * (6) the OVER-STRICTNESS arm, armed from the strict side — make `mint` refuse
 * any `count` above 1 -> the "nine at once is not refused" arms FAIL, which is
 * what proves an item legitimately taking several ids at once is protected and
 * not merely unmentioned;
 * (7) drop `allocPattern` from the `D` namespace -> the "a number in a SENTENCE
 * still raises the floor" section loses its strict floor and the "the gap it
 * will cost is NAMED rather than silent" arm FAILS, which is the arm that came
 * out of this tool catching its own documentation poisoning its own corpus.
 * RUN 2026-08-08 m0-17-mintid, each arm ALONE, restores verified by sha256 AND
 * by `cmp` against uniquely-named per-arm pristine copies (22,547 B tool /
 * 15,865 B brief, both digests printed and guarded against the empty-string
 * sha256): baseline 33 pass 0 fail; (1) 5 fail — ALL EIGHT RACERS GOT THE SAME
 * NUMBER, the collision reappearing on demand; (2) 1 fail; (3) 2 fail;
 * (4) 1 fail; (5) 1 fail; (6) 4 fail; (7) 3 fail. SEVEN declared MUST-FAIL,
 * seven failed, and the suite returned to 33/0 after every restore. The
 * MUST-NOT-FAIL arm is the bulk section itself, green on the mechanism at every
 * run.
 *
 * TWO INSTRUMENT FINDINGS, recorded rather than quietly fixed — and in this
 * project the controls find the instrument wrong more often than the subject.
 * (a) Arm (6)'s FIRST run reached its declared verdict by THROWING out of the
 * module — `null pass, null fail`, no assertion involved, D-93's unreadable
 * failure inside a control — and only the FOOT sentinel showed it. The bulk take
 * is caught now and a refusal is a NAMED failure.
 * (b) Arm (7) does not exist because it was designed; it exists because THE TOOL
 * CAUGHT ITS OWN DOCUMENTATION POISONING ITS OWN CORPUS, minutes after landing.
 * A debt row written for M0-17 explained the gap cost with a worked example
 * naming the next free number, in `DEBT.md`, which is D's own corpus, and
 * `--list` read `floor 244` off the prose. Over-counting only costs a gap, so the
 * behaviour stands and the strict floor was added beside it — but the example is
 * gone, exactly as the C-29 catalogue comment removed its own.
 */
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, execFileSync } from "node:child_process";
import { NAMESPACES, corpusFloor, ledgerRoot, mint, held, REPO_ROOT } from "../../tools/mintid.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const TOOL = join(REPO_ROOT, "tools/mintid.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* The FOOT sentinel. This project has met a TypeError inside an assertion that
   went through no assertion at all, ending the module while the tally read
   clean. Every section bumps this; the last assertion in the file requires all
   of them, so a section that dies silently cannot leave a green count. */
const SECTIONS = 7;
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "mintid-"));
const ledgerFor = (name) => { const p = join(SANDBOX, name); mkdirSync(p, { recursive: true }); return p; };

/* ========================================================================== */
section("the primitive: an exclusive create cannot be won twice");
/* Everything below rests on one guarantee, so it is pinned here rather than
   assumed. O_CREAT|O_EXCL is what makes the take atomic; if the platform ever
   stopped honouring it, every arm after this would still pass while the
   mechanism was gone. */
{
  const p = join(SANDBOX, "primitive");
  writeFileSync(p, "first", { flag: "wx" });
  let second = null;
  try { writeFileSync(p, "second", { flag: "wx" }); } catch (e) { second = e.code; }
  t("a second exclusive create of the same path is refused EEXIST", second, "EEXIST");
  t("...and the first writer's bytes are untouched", readFileSync(p, "utf8"), "first");
}

/* ========================================================================== */
section("THE RACE, DRIVEN — eight processes, one ledger, one namespace");
/* Eight because that is the standing concurrency budget (ORCHESTRATION.md), and
   the collision count is a measured function of that budget: one at two, seven
   at eight. The children are the REAL CLI, not the exported function, because
   what a worker runs is the CLI and an arm that reads only a return value can
   leave a printed branch dark in silence. */
{
  const ledger = ledgerFor("race");
  const N = 8;
  const started = [], ended = [], out = [];
  const kids = [];
  for (let i = 0; i < N; i++) {
    const t0 = Date.now();
    const kid = spawn(process.execPath, [TOOL, "D", "--who", `racer-${i}`],
      { env: { ...process.env, BIO_IDALLOC_DIR: ledger }, stdio: ["ignore", "pipe", "pipe"] });
    started.push(t0);
    let buf = "";
    kid.stdout.on("data", (d) => { buf += d; });
    kids.push(new Promise((res) => kid.on("close", (code) => {
      ended.push(Date.now()); out.push({ code, buf }); res();
    })));
  }
  await Promise.all(kids);

  /* The PRINTED word, not a return value. */
  const ids = out.flatMap((o) => [...o.buf.matchAll(/^MINTED (D-\d+)$/gm)].map((m) => m[1]));
  const unique = [...new Set(ids)];
  t(`all ${N} processes exited 0`, out.map((o) => o.code).filter((c) => c !== 0), []);
  t(`all ${N} printed a MINTED id (${ids.length} printed)`, ids.length, N);
  t(`and every id is DIFFERENT — ${JSON.stringify(unique.sort())}`, unique.length, N);

  /* THE DRIVER PROVES IT RACED. Without this, eight distinct ids from eight
     children that ran one after another would look identical to success. */
  const lastStart = Math.max(...started), firstEnd = Math.min(...ended);
  const overlapMs = firstEnd - lastStart;
  console.log(`  race window: last child started at +${lastStart - started[0]}ms, first finished at +${firstEnd - started[0]}ms, overlap ${overlapMs}ms`);
  t(`the children genuinely OVERLAPPED (${overlapMs}ms of every-child-alive time), so the distinctness above is a measurement rather than a side effect of serialisation`,
    overlapMs > 0, true);

  /* Somebody had to lose a take and step on, or nothing was contended. */
  const stepped = out.filter((o) => /ALREADY HELD and stepped over/.test(o.buf)).length;
  console.log(`  ${stepped} of ${N} children reported stepping over an id another child already held`);
  t(`at least one child LOST a take and stepped over it (${stepped}), which is the mechanism firing rather than the ids merely differing`,
    stepped > 0, true);
  t(`the ledger holds exactly ${N} claims afterwards`, held("D", { env: { BIO_IDALLOC_DIR: ledger } }).length, N);
}

/* ========================================================================== */
section("over-strictness: an item that legitimately takes SEVERAL ids");
/* A C-number family owner takes one family and nine dotted members inside it; a
   worker closing three debts takes three D-numbers. A mechanism that refused
   that, or handed out duplicates for it, would be traded one defect for
   another. */
{
  const ledger = ledgerFor("bulk");
  /* CAUGHT, not called bare — and this shape is a CONTROL FINDING rather than
     caution. The over-strictness arm (mint refuses any count above 1) first ran
     against a bare call: the tool THREW, the module ended before its tally, and
     the harness read `null pass, null fail`. The arm reached its declared
     verdict by killing the suite instead of by failing an assertion, which is
     D-93's unreadable-failure class arriving inside a control. It was found
     because the FOOT sentinel read false. A refusal is now a NAMED failure. */
  const take = (who) => {
    try { return mint("D", { count: 9, who, env: { BIO_IDALLOC_DIR: ledger } }); }
    catch (e) { return { ok: false, ids: [], collided: [], threw: String(e.message) }; }
  };
  const a = take("bulk-a"), b = take("bulk-b");
  t(`nine at once is not refused${a.threw ? ` (threw: ${a.threw})` : ""}`, [a.ok, a.ids.length], [true, 9]);
  t(`a second nine is not refused either${b.threw ? ` (threw: ${b.threw})` : ""}`, [b.ok, b.ids.length], [true, 9]);
  t("and the eighteen do not overlap", new Set([...a.ids, ...b.ids]).size, 18);
  t("the second caller stepped over all nine the first holds",
    b.collided.length >= 9, true);
}

/* ========================================================================== */
section("the ledger is a RATCHET over the corpus, never an authority");
/* This is what makes losing the ledger a degradation instead of a catastrophe.
   The ledger is deliberately NOT committed (a committed ledger races exactly as
   the file does), so a fresh clone starts empty — and must still never re-issue
   an id the corpus already holds. */
{
  const repo = join(SANDBOX, "fakerepo");
  mkdirSync(join(repo, "docs/development"), { recursive: true });
  writeFileSync(join(repo, "docs/development/DEBT.md"),
    "| D-1 | ... |\n| D-999 | the highest row |\n| D-17 | ... |\n");
  const f = corpusFloor("D", { repo });
  console.log(`  scratch corpus: ${f.seen} reference(s) read, floor D-${f.floor} from ${f.from}`);
  t("the corpus floor is the MAXIMUM allocated, not the last one read", f.floor, 999);
  t("...and the scan actually read the corpus rather than an empty one (a digest over nothing agrees with everything)",
    f.seen >= 3, true);

  const ledger = ledgerFor("ratchet");
  const r = mint("D", { count: 1, who: "fresh-clone", repo, env: { BIO_IDALLOC_DIR: ledger } });
  t("an EMPTIED ledger never re-issues an id the corpus already holds", r.ids, ["D-1000"]);
}

/* ========================================================================== */
section("the floor refuses year-shaped noise, and SAYS it did");
/* MEASURED, and it is why the corpus is per-namespace rather than the whole
   repository: a repo-wide scan for a C-number returns 2026, because fixtures
   carry ids shaped like `…C-2024-…`. A floor poisoned by a year hands out
   `C-2027` and orphans the catalog forever. Discarding it silently would be the
   generous direction, so it is discarded and NAMED. */
{
  const repo = join(SANDBOX, "noisyrepo");
  mkdirSync(join(repo, "bio-plane/checks"), { recursive: true });
  writeFileSync(join(repo, "bio-plane/checks/bio-checks.mjs"),
    "check: 'C-34.1'\n// a fixture id: INFO-2026-0001 and PROJ-C-2024-77\n");
  const f = corpusFloor("C", { repo });
  t("the year-shaped match does not become the floor", f.floor, 34);
  t("...and it is NAMED rather than swallowed", f.discarded, ["C-2024 in bio-plane/checks/bio-checks.mjs"]);
  t("a corpus file that has been renamed away is reported, not read as zero",
    corpusFloor("D", { repo }).missing.length > 0, true);

  /* AND THE FLOOR COUNTS A MENTION, NOT ONLY AN ALLOCATION — the safe direction,
     and it was MEASURED WITHIN MINUTES OF THIS TOOL LANDING, BY THIS TOOL. A debt
     row written for M0-17 explained the gap cost with a worked example naming the
     next free number, in `DEBT.md`, which is D's own corpus; `--list` read that
     number off the PROSE. Over-counting only costs a gap so the behaviour stands,
     but it is now SAID. Same lesson as the C-29 catalogue comment, whose own first
     draft spelled its warning with real C-numbers. */
  const prose = join(SANDBOX, "proserepo");
  mkdirSync(join(prose, "docs/development"), { recursive: true });
  writeFileSync(join(prose, "docs/development/DEBT.md"),
    "| D-100 | defect | ... a worked example: a worker writes D-150 by hand |\n");
  const pf = corpusFloor("D", { repo: prose });
  t("a number in a SENTENCE still raises the floor (over-counting is the safe direction)", pf.floor, 150);
  t("...but the highest REAL allocation is read separately", pf.allocFloor, 100);
  t("...and the gap it will cost is NAMED rather than silent", pf.proseDriven, true);

  /* Over-strictness: a corpus with no prose-shaped number must NOT be flagged. */
  writeFileSync(join(prose, "docs/development/DEBT.md"), "| D-100 | defect | nothing id-shaped here |\n");
  const cf = corpusFloor("D", { repo: prose });
  t("a clean corpus is not flagged", [cf.floor, cf.allocFloor, cf.proseDriven], [100, 100, false]);

  /* On the REAL corpus, and this is the arm that matters: this repository's own
     prose must not be driving any floor it declares an allocation pattern for. */
  const live = ["D", "C"].map((ns) => ({ ns, ...corpusFloor(ns) }));
  for (const l of live) console.log(`  live ${l.ns}: floor ${l.floor} · highest real allocation ${l.allocFloor} · prose-driven ${l.proseDriven}`);
  t(`no live floor is driven by prose (${JSON.stringify(live.filter((l) => l.proseDriven).map((l) => l.ns))})`,
    live.filter((l) => l.proseDriven), []);

  /* UNDETERMINED IS FIRST-CLASS. A namespace that has not declared what an
     allocation looks like answers `null`, never 0 — a strict floor guessed wrong
     would be wrong in the DANGEROUS direction. */
  t("a namespace with no declared allocation site answers null, not zero",
    [corpusFloor("IC").allocFloor, corpusFloor("IC").proseDriven], [null, false]);
}

/* ========================================================================== */
section("the ledger lives in the SHARED gitdir, and refuses when there is none");
/* The scope of the collisions is the scope the ledger needs: every colliding
   pair on 2026-08-08 was two WORKTREES OF ONE CLONE. `refs/stash` taught this
   project the same fact from the other side — the common gitdir is shared by all
   sixty checkouts. An arm in this project once NEVER ARMED because it wrote to a
   path a worktree's gitdir does not have, so this asserts the distinction rather
   than trusting it. */
{
  const common = execFileSync("git", ["rev-parse", "--git-common-dir"],
    { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  const mine = execFileSync("git", ["rev-parse", "--git-dir"],
    { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  const root = ledgerRoot({ env: {} });
  console.log(`  common-dir ${common}\n  this checkout's gitdir ${mine}\n  ledger ${root}`);
  t("the ledger root is derived from the COMMON gitdir", root.endsWith("bio-idalloc"), true);
  /* In a worktree the two paths differ and this is a real discrimination; in the
     main checkout they are the same and the arm is vacuous, which is stated so a
     green here is not read as more than it is. */
  if (mine !== common)
    t("...and NOT from this worktree's private gitdir, which no other checkout can see",
      root.startsWith(mine), false);
  else
    t("(main checkout: the two gitdirs coincide, so this arm cannot discriminate here — stated rather than counted as a pass)",
      true, true);

  /* FAIL CLOSED. An id handed out with no ledger behind it carries the
     confidence of a mechanism and none of the safety, which is worse than the
     convention it replaces. */
  const notARepo = join(SANDBOX, "notarepo");
  mkdirSync(notARepo, { recursive: true });
  const r = mint("D", { repo: notARepo, env: {} });
  t("with no shared git directory the tool REFUSES rather than minting unsafely",
    [r.ok, r.reason], [false, "NO_LEDGER"]);
}

/* ========================================================================== */
section("the sweep, and the mechanism being in the loop the reader runs");
/* THE CLASS, not the four namespaces the item named. A namespace whose corpus
   file is renamed goes dark silently — the floor drops to 0 and the tool starts
   handing out ids that are already taken — so every registered corpus is
   required to EXIST and to yield a floor above zero. */
{
  const names = Object.keys(NAMESPACES);
  console.log(`  ${names.length} shared namespace(s) registered: ${names.join(" ")}`);
  t(`the sweep found more than the four the item named (${names.length})`, names.length >= 12, true);
  const dark = names.filter((ns) => { const f = corpusFloor(ns); return f.missing.length > 0 || f.floor === 0; });
  t(`every registered namespace still reads a live corpus and a non-zero floor (${JSON.stringify(dark)})`, dark, []);
  const kinds = [...new Set(names.map((ns) => NAMESPACES[ns].kind))].sort();
  t("and the register states WHICH KIND each is, because a code-referenced id and a prose-referenced one do not cost the same to renumber",
    kinds, ["code", "prose", "structural"]);

  /* A MECHANISM THAT IS NOT IN THE LOOP THE READER ACTUALLY RUNS IS NOT A
     MECHANISM. CONDUCT writes the brief at spawn time; if this tool is not named
     there, it reaches nobody and every arm above is a demonstration of something
     nobody will run. */
  const conduct = readFileSync(join(DIR, "../../docs/development/kickoffs/CONDUCT.md"), "utf8");
  console.log(`  kickoffs/CONDUCT.md: ${conduct.length} bytes read`);
  t("the brief CONDUCT writes at spawn time names the allocator", conduct.includes("tools/mintid.mjs"), true);
  t("...and the read above was of a real file rather than an empty one", conduct.length > 4000, true);
}

/* ========================================================================== */
rmSync(SANDBOX, { recursive: true, force: true });
t(`this suite reached its own FOOT — all ${SECTIONS} sections ran (${reached})`, reached, SECTIONS);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
