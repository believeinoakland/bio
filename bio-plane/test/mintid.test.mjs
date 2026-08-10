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
 * ARMS (8)-(13) ARE D-243's AND D-242's, added 2026-08-08. THE SUBJECT WIDENED: the
 * tool now DETECTS an id allocated without it, which M0-17 judged impossible for an
 * instrument. Half of that judgement held and half did not, and the arms are split the
 * same way — the ledger-side question is a QUESTION, and the in-commit collision is a
 * FAILURE. (8) remove `IC-30` from `KNOWN_COLLISIONS` in `tools/mintid.mjs` -> the "no
 * NEW duplicate allocation" arm FAILS, which is the arm proving the detector grades the
 * REAL corpus rather than a fixture; (9) add a `D-9999` entry to `KNOWN_COLLISIONS` ->
 * the "no registered collision has quietly stopped being one" arm FAILS, which closes
 * the register from the OTHER side so the list cannot outlive its reason; (10) delete
 * the `FW` row from `NAMESPACES` -> the "every allocating prefix has a register row"
 * arm FAILS, which is the prompt gap M0-17 left open and `FW-15` already paid for;
 * (11) in `exclusivityProbe` change the second create's `{ flag: "wx" }` to
 * `{ flag: "w" }` — a filesystem that does not honour O_EXCL, simulated at the one line
 * that tests it -> the "probe passes" and "the REAL ledger's filesystem honours the
 * exclusive create" arms FAIL; (12) remove the `--audit` mention from
 * `docs/development/kickoffs/CONDUCT.md` -> the "CONDUCT's loop names the audit
 * COMMAND" arm FAILS, which is the mechanism-in-the-loop rule enforced against itself
 * a second time; (13) the OVER-STRICTNESS arm for the detector, armed from the loose
 * side — make `allocations` match a bare `\bNS-\d+\b` instead of the declared
 * allocation sites -> the "a corpus that MENTIONS an id repeatedly but allocates it
 * once is NOT flagged" arm FAILS and the live corpus lights up, which is what proves
 * this is a detector of ALLOCATIONS and not a counter of tokens.
 *
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
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync, readdirSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync, execFileSync } from "node:child_process";
import { NAMESPACES, corpusFloor, ledgerRoot, mint, held, REPO_ROOT,
         allocations, collisions, KNOWN_COLLISIONS, unregisteredNamespaces,
         exclusivityProbe, scopeOf, scopeLines, watermark } from "../../tools/mintid.mjs";

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
const SECTIONS = 11;
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
  /* WIDENED 2026-08-08 (D-243's item), and the widening is a CONTROL FINDING about
     this very hardening. It caught a THROW and not a REFUSAL — so when arm (11)
     neutered the exclusivity probe, `mint` returned `{ok:false}` with no `ids`,
     `a.ids.length` threw a TypeError, and the module ENDED at `-1 pass, -1 fail` with
     arm (11)'s declared arms never reaching an assertion. That is the same class this
     shape was written to close, one step further out: a guard tight enough for the
     failure mode its author knew about and open to the next one. A refusal is now a
     NAMED failure exactly as a throw is. */
  const take = (who) => {
    try {
      const r = mint("D", { count: 9, who, env: { BIO_IDALLOC_DIR: ledger } });
      return r.ok ? r : { ok: false, ids: [], collided: [], threw: `REFUSED ${r.reason}: ${r.detail}` };
    } catch (e) { return { ok: false, ids: [], collided: [], threw: String(e.message) }; }
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
     would be wrong in the DANGEROUS direction.
     CORRECTED 2026-08-08, not exempted: this arm used to read `IC`, and IC now
     DECLARES its allocation site (`## IC-n ·`, the heading that opens an entry —
     the `### IC-n · RESPONSES/RESOLUTION` blocks beneath it are that entry's own
     sub-sections, measured at four for IC-2). The old assertion was testing the
     absence of a declaration rather than the null answer, so it stopped being about
     its own subject the moment the declaration was added. `M` is the namespace that
     genuinely declares none, and its reason is recorded at its register row. */
  t("a namespace with no declared allocation site answers null, not zero",
    [corpusFloor("M").allocFloor, corpusFloor("M").proseDriven], [null, false]);
  t("...and IC, which now DOES declare one, answers a real strict floor rather than null",
    Number.isInteger(corpusFloor("IC").allocFloor), true);
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
section("D-243 · TWO THINGS WEARING ONE ID — the half that needs no ledger");
/* D-243 reasoned that nothing could DETECT an un-minted id because the ledger is in
   no commit a suite could read. The reasoning is sound about the CAUSE and it stands:
   "was this minted?" needs the ledger, so it is `--audit` on CONDUCT's machine, and
   the honest answer for every id allocated before 2026-08-08 is `unknown`.

   IT IS NOT SOUND ABOUT THE HARM. What an un-minted id COSTS is a collision, and a
   collision is entirely in the text of the commit: it needs no ledger and it answers
   yes or no. So the class splits and this is the half a suite can hold — which is
   worth more than a step a human performs, because it runs in every session's battery
   and in `plancheck` rather than only in the loop of the one reader who remembers. */
{
  /* THE SCRATCH ARM FIRST, so a green over the live corpus is known to mean
     something. An instrument that has never been shown to fire is a mechanism
     believed on the strength of its existence. */
  const dupRepo = join(SANDBOX, "duprepo");
  mkdirSync(join(dupRepo, "docs/development"), { recursive: true });
  writeFileSync(join(dupRepo, "docs/development/DEBT.md"),
    "| D-10 | one thing |\n| D-11 | another |\n| D-10 | A SECOND THING WEARING D-10 |\n");
  const injected = allocations("D", { repo: dupRepo });
  console.log(`  scratch corpus: ${injected.sites.length} allocation site(s), duplicates ${JSON.stringify(injected.duplicates.map((d) => d.id))}`);
  t("a duplicated allocation in a scratch corpus is FOUND", injected.duplicates.map((d) => d.id), ["D-10"]);
  t("...and it names BOTH sites by line, not just a count", injected.duplicates[0]?.at.length, 2);
  t("...and the corpus it read was real rather than empty (a scan over nothing agrees with everything)",
    injected.sites.length, 3);

  /* OVER-STRICTNESS, armed from the strict side: a corpus that is merely REPETITIVE
     in prose must not be flagged. Only an allocation SITE counts, which is the same
     distinction the prose-driven floor made. */
  writeFileSync(join(dupRepo, "docs/development/DEBT.md"),
    "| D-10 | one thing, and this row talks about D-10 and D-10 again in its own prose |\n| D-11 | another |\n");
  t("a corpus that MENTIONS an id repeatedly but allocates it once is NOT flagged",
    allocations("D", { repo: dupRepo }).duplicates, []);

  /* A namespace whose sites cannot be recognised must be NAMED, never scored clean.
     `C` repeats a family number once per dotted member by design. */
  const cov = allocations("C");
  t("C is reported as NOT COVERED with a reason rather than silently clean", [cov.covered, cov.why.length > 40], [false, true]);
  t("M is reported as NOT COVERED too (it declares no allocation site)", allocations("M").covered, false);

  /* THE LIVE CORPUS. The registered set is EXACT in both directions: a seventh
     collision fails here, and a registered one that somebody renumbers ALSO fails, so
     the list cannot outlive its reason. A ceiling is not a ratchet and a register
     with slack is not one either. */
  const live = collisions();
  console.log(`  live corpus: ${live.sites} allocation site(s) across ${live.graded.length} graded namespace(s)`);
  console.log(`  graded: ${live.graded.map((g) => `${g.ns}:${g.sites}`).join(" ")}`);
  console.log(`  not gradable: ${live.notCovered.map((n) => n.ns).join(", ")}`);
  t("the live sweep read a real corpus and floored it (a headline totality over an empty corpus has passed three times in this project)",
    live.sites > 400, true);
  t("...across every registered namespace that declares a unique allocation site",
    live.graded.length + live.notCovered.length, Object.keys(NAMESPACES).length);
  t(`no NEW duplicate allocation (${JSON.stringify(live.fresh.map((d) => `${d.id} at ${d.at.join(" + ")}`))})`,
    live.fresh, []);
  t(`no registered collision has quietly stopped being one (${JSON.stringify(live.stale.map((s) => s.id))})`,
    live.stale.map((s) => s.id), []);
  t("every registered collision carries a REASON, so the register is evidence rather than an exemption",
    KNOWN_COLLISIONS.filter((k) => !k.why || k.why.length < 20).map((k) => k.id), []);
  /* AND THE SIX ARE THE FINDING. They were in `origin/main`, known to nobody, and only
     an instrument could see them — which is the whole of M0-17's case, measured. */
  t("the six pre-existing collisions this detector found are all still present and registered",
    live.found.map((d) => d.id).sort(), KNOWN_COLLISIONS.map((k) => k.id).sort());
}

/* ========================================================================== */
section("the register cannot fall behind — an unregistered prefix is FOUND, not merely refused");
/* M0-17 left this open on a measurement: a wide census over every prefix-number token
   returns INFO, SHA, UTF, RFC, FY2023 and thirty more, and a detector nobody can read
   is one nobody runs. That census asked the wrong question. Over ALLOCATION SITES the
   same scan returns fifteen prefixes and NO noise — and three of them (FW, COFF, CAP)
   were unregistered, with FW-15 already collided. Fail-closed with nothing prompting
   is a gate nobody can pass. */
{
  const nsRepo = join(SANDBOX, "nsrepo");
  mkdirSync(join(nsRepo, "docs/development"), { recursive: true });
  writeFileSync(join(nsRepo, "docs/development/QUEUE.md"),
    "### REC-1 · done\n### ZZZ-4 · queued\nprose mentioning ZZZ-9 and INFO-2026-0001 and RFC-7231\n");
  writeFileSync(join(nsRepo, "docs/development/IS-BUILD-PLAN.md"), "| QQ-2 | a track row |\n");
  const u = unregisteredNamespaces({ repo: nsRepo });
  console.log(`  scratch queue: prefixes ${JSON.stringify(u.prefixes)}`);
  t("an unregistered prefix allocating at a queue site is FOUND, in both shapes",
    u.unregistered.map((x) => x.prefix).sort(), ["QQ", "ZZZ"]);
  t("...and a registered one is not reported", u.unregistered.some((x) => x.prefix === "REC"), false);
  /* OVER-STRICTNESS: the noise M0-17 measured must NOT be picked up. A prefix-number
     token in PROSE is not an allocation, and that is the distinction that makes this
     usable where the wide census was not. */
  t("prose tokens (ZZZ-9 in a sentence, INFO-2026-0001, RFC-7231) do not make a namespace",
    u.prefixes.includes("INFO") || u.prefixes.includes("RFC"), false);

  const liveU = unregisteredNamespaces();
  console.log(`  live: ${liveU.prefixes.length} allocating prefix(es) across ${liveU.filesRead} corpus file(s): ${liveU.prefixes.join(" ")}`);
  t("the live scan read the real queue corpus rather than nothing", liveU.filesRead >= 4 && liveU.prefixes.length >= 10, true);
  t(`every prefix that allocates a queue id has a register row (${JSON.stringify(liveU.unregistered.map((x) => x.prefix))})`,
    liveU.unregistered, []);
  /* The three this closed, pinned by name so a revert is visible. */
  t("FW, COFF and CAP are registered — they were allocating without a row, and FW-15 is one of the six collisions",
    ["FW", "COFF", "CAP", "DS"].filter((n) => !NAMESPACES[n]), []);
  /* And the table-row shape is what made five families visible at all. */
  t("the track families that allocate as TABLE ROWS are graded rather than scored zero",
    ["PL", "FL", "SK", "VF", "DS"].map((ns) => allocations(ns).sites.length > 0), [true, true, true, true, true]);
}

/* ========================================================================== */
section("D-242 · the guarantee is PROBED and PRINTED, never implied");
/* D-242's sharp half is the CONFIDENCE, not the collision: a tool believed to make
   collisions impossible, which quietly does not somewhere, is worse than the
   convention it replaced. M0-17 stated its failure modes in a comment and a debt row
   while its output said only `MINTED D-248`, and the output is what a worker believes.
   The row also said there is no cheap local test — true of the two-clone half, and NOT
   true of the non-atomic-filesystem half, which is what this probes. */
{
  const probeDir = ledgerFor("probe");
  const good = exclusivityProbe(probeDir);
  t("the probe passes on a filesystem that honours O_CREAT|O_EXCL", good.ok, true);
  t("...and it left nothing behind (a probe that litters the ledger would be read as an id)",
    readdirSync(probeDir).length, 0);

  /* THE LIVE LEDGER, because a probe that only ever ran against a temp dir has not
     spoken about the filesystem the real ids are taken on. */
  const liveScope = scopeOf();
  console.log(`  live ledger ${liveScope.ledger} · hosts ${JSON.stringify(liveScope.hosts)} · exclusive ${JSON.stringify(liveScope.exclusive)}`);
  t("the REAL ledger's filesystem honours the exclusive create", liveScope.exclusive.ok, true);

  const gone = exclusivityProbe(join(SANDBOX, "no-such-dir-at-all"));
  t("a ledger directory that cannot be written is a REFUSAL with a code, not a throw",
    [gone.ok, gone.reason], [false, "PROBE_UNWRITABLE"]);

  /* DRIVEN, not reasoned about: an unwritable ledger must make `mint` REFUSE rather
     than throw. It threw in the first draft, because the namespace mkdir ran before
     the probe — D-93's unreadable-failure class inside the path whose entire job is to
     refuse cleanly. */
  const ro = ledgerFor("readonly");
  chmodSync(ro, 0o500);
  const asRoot = typeof process.getuid === "function" && process.getuid() === 0;
  let refused;
  try { refused = mint("D", { env: { BIO_IDALLOC_DIR: ro } }); }
  catch (e) { refused = { ok: null, reason: `THREW ${e.code || e.message}` }; }
  chmodSync(ro, 0o700);
  if (asRoot)
    t("(running as root: a read-only directory cannot discriminate here — stated rather than counted as a pass)", true, true);
  else
    /* THE ARM'S DECLARED CODE WAS WRONG AND THE BEHAVIOUR WAS RIGHT — recorded rather
       than smoothed, because in this project the controls find the instrument wrong
       more often than the subject. It expected `LEDGER_UNWRITABLE` and got
       `PROBE_UNWRITABLE`: `mkdirSync(root, {recursive:true})` SUCCEEDS on a directory
       that already exists whatever its mode, so the read-only case is caught one line
       later by the probe, which is the more informative of the two codes.
       `LEDGER_UNWRITABLE` is the different case — a ledger path that cannot be created
       at all. Both refuse; what this arm proves is that neither THROWS. */
    t(`an unwritable ledger REFUSES with a code rather than throwing (${refused.reason})`,
      [refused.ok, refused.reason], [false, "PROBE_UNWRITABLE"]);

  /* AND THE SENTENCE IS ON THE HAPPY PATH, which is where a false belief is formed. */
  const sane = ledgerFor("scope");
  const r = mint("D", { who: "scope-arm", env: { BIO_IDALLOC_DIR: sane } });
  t("a successful mint carries its scope on the RESULT, so a caller that never prints still has it",
    [r.ok, Boolean(r.scope), r.scope?.exclusive?.ok], [true, true, true]);
  /* A REFUSAL IS A NAMED FAILURE HERE, and this shape is a CONTROL FINDING rather
     than caution — the second time this suite has learned it. Arm (11) neuters the
     exclusivity probe, which makes every `mint` refuse; on its first run `scopeLines`
     was handed the undefined `scope` of a refusal, threw a TypeError, and ENDED THE
     MODULE — `-1 pass, -1 fail`, no assertion involved, its declared arms never
     reaching an assertion at all. That is exactly M0-17's arm (6) finding arriving a
     second time in the same file, and exactly the receipt WORKER.md carries: a
     TypeError inside an assertion goes through no assertion. */
  const lines = r.scope ? scopeLines(r.scope).join("\n")
    : `MINT REFUSED ${r.reason}: ${r.detail} — every arm below therefore fails by assertion rather than by killing this module`;
  t("...and the scope names what the take is NOT exclusive against", /NOT exclusive against/.test(lines), true);
  t("...and names D-242 as the reason it is stated rather than checked", /D-242/.test(lines), true);
  t("...and reports the probe's verdict rather than asserting the guarantee", /honoured on this filesystem: YES/.test(lines), true);
  t("an overridden ledger path WARNS that the scope is whatever the caller said",
    /WARN BIO_IDALLOC_DIR is set/.test(scopeLines({ ...r.scope, overridden: true }).join("\n")), true);
  t("a ledger seen from more than one host WARNS that one process cannot speak for cross-host atomicity",
    /WARN this ledger has been used from 2 hosts/.test(scopeLines({ ...r.scope, hosts: ["a", "b"] }).join("\n")), true);

  /* The watermark: undetermined is first-class, and a DERIVED figure is not a
     RECORDED one. Both are labelled; neither answers 0. */
  const w = watermark("D", { root: sane });
  t("a namespace whose ledger recorded its watermark answers `recorded`", w.source, "recorded");
  t("...with the corpus floor it began from, not zero", Number.isInteger(w.floor) && w.floor > 0, true);
  const wNone = watermark("UI", { root: sane });
  t("a namespace with no ledger history answers null — never 0 — and says why", [wNone.floor, wNone.source.length > 20], [null, true]);
}

/* ========================================================================== */
section("the audit is in the loop CONDUCT actually runs");
/* The same self-check M0-17 built for the spawn-brief line, aimed at the integration
   step. A mechanism that is not in the loop the reader actually runs is not a
   mechanism, and prose describing a step is a mechanism believed on the strength of
   its existence — the defect this project meets most. So the step is a COMMAND, and
   this asserts CONDUCT's own file names it. */
{
  const conduct = readFileSync(join(DIR, "../../docs/development/kickoffs/CONDUCT.md"), "utf8");
  console.log(`  kickoffs/CONDUCT.md: ${conduct.length} bytes read`);
  t("...the read was of a real file rather than an empty one", conduct.length > 4000, true);
  t("CONDUCT's loop names the audit COMMAND, not merely the idea of one",
    /mintid\.mjs --audit/.test(conduct), true);
  t("...at the integration step, after the merge and before the push",
    /AFTER THE MERGE, BEFORE THE PUSH/.test(conduct), true);
  t("...and says a not-held id is a QUESTION rather than a failure, because unknown is first-class",
    /QUESTION you ASK the worker, never a failure/.test(conduct), true);

  /* THE COMMAND IS DRIVEN, not asserted about. `op=invitelook` shipped with a
     ReferenceError while 1,276 assertions passed, because nothing ran the caller. */
  const run = (args) => {
    const kid = spawnSync(process.execPath, [TOOL, ...args], { encoding: "utf8", cwd: REPO_ROOT });
    return { code: kid.status, out: `${kid.stdout}${kid.stderr}` };
  };
  const a = run(["--audit"]);
  console.log(`  --audit exited ${a.code}, ${a.out.length} bytes printed`);
  t("`--audit` runs and exits 0 on a corpus with no NEW duplicate", a.code, 0);
  t("...and prints the SCOPE, so the integrator sees what the ledger does not cover", /NOT exclusive against/.test(a.out), true);
  t("...and NAMES what it cannot see rather than reading as a complete sweep", /What this CANNOT see/.test(a.out), true);
  t("...and prints its four sections", [/1\. DUPLICATE ALLOCATIONS/, /2\. ALLOCATED ABOVE THE LEDGER/, /3\. IDS INTRODUCED BY A DIFF/, /4\. THE REGISTER/].map((re) => re.test(a.out)),
    [true, true, true, true]);
  const bad = run(["ZZZ"]);
  t("an unregistered namespace is still refused BY NAME", [bad.code, /REFUSED: unknown namespace/.test(bad.out)], [2, true]);
  t("...and the refusal now says what to DO, which is the half that was missing",
    /add a row to NAMESPACES/i.test(bad.out), true);
}

/* ========================================================================== */
rmSync(SANDBOX, { recursive: true, force: true });
t(`this suite reached its own FOOT — all ${SECTIONS} sections ran (${reached})`, reached, SECTIONS);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
