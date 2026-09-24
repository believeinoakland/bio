/* coord.test — M0-110: the message board leaves `main` (TREE-SHARING.md §1; `tools/coord.mjs`).
 *
 * Driven against a THROWAWAY BARE REMOTE in the sandboxed `os.tmpdir()`, with two lane clones, so every write is a
 * real fetch, a real temporary-index commit and a real push that a real remote can refuse. Nothing here reads or
 * writes this repository's own state files: the rows are a fixture, planted in the seed's `main` and moved to its
 * `coord` by the same `migrate` CONDUCT runs at the cutover.
 *
 * WHAT IT PINS, as the row's accepts-when names it:
 *   §1 the migration: a root commit on coord, a pointer commit on main, idempotent, refused on a switched tree, and
 *      MILESTONES.md's placement table split out as PLACEMENT.md (BOB #28's ruling 3);
 *   §2 every reader answers as it did from main — the same answers read pre-cutover from the seed's files and
 *      post-cutover through the pointers from coord;
 *   §3 a claim, a queue flip and a handoff each land on coord WITHOUT moving main, and a handoff created on coord is
 *      seen by the readers of the kickoffs directory;
 *   §4 a main gate record survives a coord write (the record is keyed by main's tree, D-293);
 *   §5 a new block and a line into an existing block, written CONCURRENTLY, both land with the line in its own block
 *      (the loser re-applies its intent to the fresh tip — BOB #27);
 *   §6 BOB #28's ruling 2 negative control: a write that plants a closed row in the cache is REFUSED by name, and
 *      neither branch moves;
 *   §7 refusals, the archive run inside a write, the read command, the churn figure, the push guard's coord-only arm.
 *   §10 (M0-119) a placement over the backlog's budget, through a real write, moves WHOLE rows from BACKLOG.md's foot to
 *      the head of BACKLOG-LATER.md: every id in exactly one file, in order, none cut; room freed brings them back; the
 *      `swap` and `rebalance` intents. Its control is `ledger.control.mjs` arm T5 (the write's rebalance skipped).
 *
 * NEGATIVE CONTROL: `node bio-plane/test/coord.control.mjs` from the repo root, each arm ALONE, restored by sha256
 * AND `cmp`. DECLARED: (R) `ledger.mjs`' `readRel` pointed back at the working tree's old path -> FAILS at "§2 findId
 * answers the same row from coord"; (W) `addLine` made a TAIL APPEND — what a textual merge of two tail appends
 * yields — instead of the anchored insertion -> FAILS at "§5 the line is in ITS OWN block"; (C) the write's ledger
 * checks skipped -> FAILS at "§6 the planted closed row is REFUSED". RESULT: recorded on the line below at the run.
 * NEGATIVE CONTROL RESULT: RUN 2026-09-22 by the M0-110 worker on `tools/coord.mjs` sha256 b533bac0… and `ledger.mjs`
 * 1e4f5f4a…, driver exit 0, 25 pass / 0 fail, 3 of 3 arms as declared, every restore sha256- and cmp-identical: baseline
 * 80/0; R 72/8 (§2's four answers through `readRel`, the flip read-back and the archive write among them); W 78/2 (exactly
 * the two in-block assertions); C 74/6 (§6's three, the dry run, the P2 refusal, the hook-vs-check refusal); closing 80/0.
 * AND M0-109's floors, moved here (§8): `node bio-plane/test/debt-floor.control.mjs`, RUN the same day on the same sha,
 * exit 0, 33 pass / 0 fail, 4 of 4 arms as declared: TL 79/1 and AL 79/1 (each liar fails ONLY its own empty-ledger
 * assertion); TC 59/20 and AC 58/21 (the size floors fail the one-row assertion — and AC the hundred-row one — and every
 * small fixture write with them, the collateral the driver's head declares: a size floor fails small honest ledgers).
 *
 * §8 AND ITS DRIVER ARE RETIRED 2026-09-24 BY M0-140 with the DEBT construct — the run above is kept as the record of
 * what was measured. `debt-floor.control.mjs` is deleted; its two anchors in `tools/coord.mjs` no longer exist.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const C = await import(join(REPO, "tools/coord.mjs"));
const L = await import(join(REPO, "tools/ledger.mjs"));
const { owedFor } = await import(join(REPO, "tools/owed.mjs"));
const { delegationAudit, todayISO } = await import(join(REPO, "tools/delegations.mjs"));
const RB = await import(join(REPO, "tools/readbudget.mjs"));
const PG = await import(join(REPO, "tools/pushguard.mjs"));

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
};
const section = (s) => console.log(`\n--- ${s} ---`);
const git = (cwd, ...args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} (in ${cwd}) exited ${r.status}: ${r.stderr}`);
  return r.stdout.trim();
};
const gitTry = (cwd, ...args) => spawnSync("git", args, { cwd, encoding: "utf8" });
const ident = (dir) => { git(dir, "config", "user.name", "coord fixture"); git(dir, "config", "user.email", "coord@fixture.invalid"); git(dir, "config", "commit.gpgsign", "false"); };
const code = async (fn) => { try { await fn(); return "NO REFUSAL"; } catch (e) { return e.code || String(e.message).slice(0, 80); } };
/* A write the suite EXPECTS to land, refused, is a FAILED assertion downstream — never an uncaught throw that ends the
   suite before its foot and hides every arm after it (the size-floor arms of debt-floor.control found exactly that). */
const tryWrite = async (opts) => { try { return await C.write(opts); }
  catch (e) { return { status: `REFUSED ${e.code || "?"}`, error: String(e.message).slice(0, 200), changed: [], attempts: [], commit: null, pushOutput: "" }; } };

/* ------------------------------------------------------------------------------------ the fixture */

const TODAY = todayISO();
const DELEGATIONS = Array.from({ length: 41 }, (_, i) =>
  `## DELEGATION 2026-09-20 ZZ -> BOB (fixture ${i + 1})\n\n**open as of ${TODAY}** — a fixture register line.\n`).join("\n");
const ROW = (id, state, extra = "") => `### ${id} · ${state} — a fixture row\nmilestone: M0\n`
  + `design: \`docs/development/VERIFICATION.md\` §"The negative-control register"\ninterface: none\ndepends-on: none\n${extra}`;
const FILES = {
  "docs/development/QUEUE.md": `# QUEUE — the fixture cache\n\n${ROW("ZZ-1", "queued")}\n${ROW("ZZ-2", "running")}\n## BOB INBOX\n\nnothing.\n`,
  "docs/development/BACKLOG.md": `# BACKLOG — the fixture backlog\n\n${ROW("ZZ-3", "queued")}`,
  /* `docs/development/DEBT.md` WAS a fixture file here. Retired with the construct (M0-140, 2026-09-24): it is
     not a state path any more, so a write naming it is refused NOT_A_STATE_FILE and no reader consults it. */
  "docs/development/CLAIMS.md": `# CLAIMS — fixture\n\n${DELEGATIONS}\n## CLAIM 2026-09-22 ZZ (the tail block)\n\npaths: a fixture path\n`,
  "docs/development/kickoffs/LANE-NEXT.md": "LANE #2 — the fixture handoff, line 1\n",
  "docs/development/kickoffs/LANE.md": "# LANE — a kickoff that stays on main (CLAIMS.md, ORCHESTRATION.md)\n",
  "docs/archive/ledgers/QUEUE-closed.md": L.ARCHIVE_HEADER.QUEUE
    + "### LED-3 · done — fixture arming row\n\n### LED-6 · done — fixture arming row\n\n### ZZ-0 · done — an archived row\n",
  "docs/archive/ledgers/QUEUE-cut-2026-09-22.md": "# a frozen roll\n\n### ZZ-00 · done — rolled\n",
  "docs/development/MILESTONES.md": "# Milestones — fixture\n\n## The ladder\n\n### M0 · The plan is trustworthy\n\nThe rung.\n\n"
    + "## Placement: everything open, and where it now sits\n\n| item | area | milestone |\n| --- | --- | --- |\n| D-1 a fixture gap | M0 | M0 |\n\n"
    + "### Deliberately not scheduled, and why\n\n- nothing.\n\n## How this file stays true\n\n1. a rule.\n",
  "docs/development/INTERFACES.md": "# Interfaces — fixture\n",
  "docs/development/VERIFICATION.md": "# Verification — fixture\n\nQUEUED ZZ-1 is the fixture's reference.\n",
  "docs/architecture/CORPUS-STANDARD.md": "# Standard — fixture\n\nUndecided — routed to D-388, which the audit drains.\n",
  "README.md": "a product file that is not state\n",
};

const base = mkdtempSync(join(tmpdir(), "coord-test-"));
const BARE = join(base, "remote.git");
const SEED = join(base, "seed");
git(base, "init", "-q", "--bare", "-b", "main", BARE);
mkdirSync(SEED); git(SEED, "init", "-q", "-b", "main"); ident(SEED);
for (const [rel, text] of Object.entries(FILES)) { mkdirSync(dirname(join(SEED, rel)), { recursive: true }); writeFileSync(join(SEED, rel), text); }
git(SEED, "add", "-A"); git(SEED, "commit", "-q", "-m", "fixture: main before the cutover");
git(SEED, "remote", "add", "origin", BARE);
git(SEED, "push", "-q", "origin", "main");

/* The readers' answers BEFORE the cutover, from the files themselves. */
const answers = (repo) => {
  C.resetCoordCache();
  return {
    find: L.findId("ZZ-1", { repo }).map((f) => `${f.where} ${f.file}:${f.line} ${f.state}`),
    findArchived: L.findId("ZZ-0", { repo }).map((f) => `${f.where} ${f.file} ${f.state}`),
    rows: L.pipelineRows({ repo }).rows.map((r) => `${r.id}·${r.state}·${r.where}`),
    archived: [...L.archivedQueueIds({ repo })].sort(),
    /* A reader that reads the pointer finds no pipeline at all: that is a DIFFERENT ANSWER, never a crash — a
       TypeError here would end the suite before its foot and hide every other arm (WORKER.md's receipt). */
    audit: (() => { const a = L.ledgerAudit({ repo }); return { unreadable: a.unreadable, closed: a.closedLive, p: a.pipeline ? Object.fromEntries(Object.entries(a.pipeline.arms).map(([k, v]) => [k, v.violations.length])) : "UNREAD" }; })(),
    owed: (() => { const o = owedFor("BOB", { repo }); return { unreadable: o.unreadable.filter((u) => !/DECISIONS/.test(u)), items: o.items.map((i) => i.id) }; })(),
    delegations: (() => { const a = delegationAudit({ repo, git: false, today: TODAY }); return [a.corpus, a.findings.length]; })(),
    handoffs: RB.readSet(repo).filter((r) => r.key === "next").map((r) => r.file),
  };
};
const BEFORE = answers(SEED);

/* ============================================================================================ */
section("§1 THE MIGRATION — a root commit on coord, a pointer commit on main, idempotent");
const m1 = C.migrate({ repo: SEED, from: "HEAD", coordBranch: "coord", mainBranch: "cut" });
const m2 = C.migrate({ repo: SEED, from: m1.base });
t("a re-run from the same commit gives the SAME two commits (idempotent: fixed dates, a message naming its base)",
  [m2.coord, m2.main], [m1.coord, m1.main]);
t("coord is a ROOT commit — no parent, so a merge of it into main is refused as unrelated history",
  gitTry(SEED, "rev-parse", "--verify", "--quiet", `${m1.coord}^`).status !== 0, true);
t("coord holds exactly the state files, plus PLACEMENT.md",
  git(SEED, "ls-tree", "-r", "--name-only", m1.coord).split("\n").sort(),
  [...Object.keys(FILES).filter(C.isMovedPath), C.PLACEMENT].sort());
t("each state file on coord is byte-identical to main's before the cutover",
  Object.keys(FILES).filter(C.isMovedPath).filter((p) => git(SEED, "show", `${m1.coord}:${p}`) !== FILES[p].trim()), []);
t("on main each state path is EXACTLY its pointer, and nothing else changed but MILESTONES.md",
  [git(SEED, "diff", "--name-only", m1.base, m1.main).split("\n").sort(),
   Object.keys(FILES).filter(C.isMovedPath).filter((p) => git(SEED, "show", `${m1.main}:${p}`) + "\n" !== C.pointerText(p))],
  [[...Object.keys(FILES).filter(C.isMovedPath), C.MILESTONES].sort(), []]);
const msMain = git(SEED, "show", `${m1.main}:${C.MILESTONES}`), placement = git(SEED, "show", `${m1.coord}:${C.PLACEMENT}`);
t("MILESTONES.md keeps its ladder and loses the placement table to a pointer where it stood (BOB #28's ruling 3)",
  [/### M0 · The plan is trustworthy/.test(msMain), /\| D-1 a fixture gap/.test(msMain), msMain.includes(C.POINTER_TAG),
   /## How this file stays true/.test(msMain)], [true, false, true, true]);
t("PLACEMENT.md on coord carries the whole section, its sub-section included",
  [/\| D-1 a fixture gap \| M0 \| M0 \|/.test(placement), /Deliberately not scheduled/.test(placement), /How this file stays true/.test(placement)],
  [true, true, false]);
git(SEED, "checkout", "-q", "cut");
t("a migration of a tree that is already SWITCHED is refused by name", await code(() => C.migrate({ repo: SEED })), "ALREADY_SWITCHED");

/* CONDUCT's cutover, in order: coord (create), then main. */
t("the coord push is a CREATE: plain push, no force", gitTry(SEED, "push", "-q", "origin", `${m1.coord}:refs/heads/coord`).status, 0);
t("...and re-pushing the same commit is a no-op, never a rewrite", gitTry(SEED, "push", "-q", "origin", `${m1.coord}:refs/heads/coord`).status, 0);
t("main's pointer commit fast-forwards main", gitTry(SEED, "push", "-q", "origin", "cut:main").status, 0);

const clone = (name) => { const d = join(base, name); git(base, "clone", "-q", BARE, d); ident(d); git(d, "fetch", "-q", "origin", "coord:refs/remotes/origin/coord"); return d; };
const A = clone("laneA"), B = clone("laneB");

/* ============================================================================================ */
section("§2 EVERY READER ANSWERS AS IT DID FROM MAIN — the pointer is the switch");
t("the lane's tree is SWITCHED and reads from origin/coord", [C.isSwitched(A), C.whereReads(A).sha === m1.coord], [true, true]);
t("its QUEUE.md on disk is the one-line pointer", readFileSync(join(A, "docs/development/QUEUE.md"), "utf8"), C.pointerText("docs/development/QUEUE.md"));
const AFTER = answers(A);
t("§2 findId answers the same row from coord", AFTER.find, BEFORE.find);
t("findId answers an ARCHIVED row from coord's archive", AFTER.findArchived, BEFORE.findArchived);
t("the plan's one lister (cache ∪ backlog) reads the same rows", AFTER.rows, BEFORE.rows);
t("the archive family is listed from coord", AFTER.archived, BEFORE.archived);
t("the ledger audit reads the same arms", AFTER.audit, BEFORE.audit);
t("owed reads its sources from coord (DEBT.md was one until M0-140)", AFTER.owed, BEFORE.owed);
t("the delegation register reads CLAIMS.md from coord (corpus, findings)", AFTER.delegations, BEFORE.delegations);
t("the reading budget lists the handoffs from coord", AFTER.handoffs, BEFORE.handoffs);
t("the answers are not empty (a comparison of two empty readings proves nothing)",
  [BEFORE.find.length, BEFORE.rows.length, BEFORE.delegations[0], BEFORE.handoffs.length], [1, 3, 41, 1]);
t("a planted directory with no pointer is read as itself — every fixture-driven suite is unchanged",
  L.findId("ZZ-3", { repo: join(base, "seed-files") }), []);
t("the writers REFUSE a switched tree — an archive here would put content back over a pointer",
  await code(() => L.archiveId("ZZ-0", { repo: A })), "STATE_ON_COORD");

/* ============================================================================================ */
section("§3 A CLAIM, A QUEUE FLIP AND A HANDOFF EACH LAND ON coord WITHOUT MOVING main");
const mainAt = () => gitTry(A, "ls-remote", "--heads", "origin", "main").stdout.split(/\s/)[0];
const coordAt = () => gitTry(A, "ls-remote", "--heads", "origin", "coord").stdout.split(/\s/)[0];
const main0 = mainAt();
const claim = await tryWrite({ repo: A, message: "claim: ZZ-A takes a path", intents: [
  { op: "append", file: "docs/development/CLAIMS.md", text: "## CLAIM 2026-09-22 ZZ-A (a lane's claim)\n\npaths: `a/path`\n" }] });
t("the claim is PUSHED and read back from the remote", [claim.status, claim.changed, coordAt() === claim.commit], ["pushed", ["docs/development/CLAIMS.md"], true]);
t("...and main did not move", mainAt(), main0);
const flip = await tryWrite({ repo: A, message: "ZZ-1 running", intents: [{ op: "status", id: "ZZ-1", state: "running", note: "flipped by the fixture" }] });
t("the queue flip lands", [flip.status, flip.changed], ["pushed", ["docs/development/QUEUE.md"]]);
t("...main did not move", mainAt(), main0);
C.resetCoordCache(); git(A, "fetch", "-q", "origin");
t("the row reads `running`, with its note, through the reader", [(L.findId("ZZ-1", { repo: A })[0] || { state: "ABSENT" }).state, /flipped by the fixture/.test(C.readState(A, "docs/development/QUEUE.md"))], ["running", true]);
const hand = await tryWrite({ repo: A, message: "LANE #3's handoff", intents: [
  { op: "replace", file: "docs/development/kickoffs/LANE-NEXT.md", text: "LANE #3 — the next handoff, line 1\n" },
  { op: "replace", file: "docs/development/kickoffs/NEWLANE-NEXT.md", text: "NEWLANE #1 — a lane's first handoff\n" }] });
t("the handoff lands, a new lane's included", [hand.status, hand.changed.sort()],
  ["pushed", ["docs/development/kickoffs/LANE-NEXT.md", "docs/development/kickoffs/NEWLANE-NEXT.md"]]);
t("...main did not move", mainAt(), main0);
C.resetCoordCache(); git(B, "fetch", "-q", "origin");
t("another lane reads line 1 of the handoff through the read command", C.readRemote("docs/development/kickoffs/LANE-NEXT.md", { repo: B }).text, "LANE #3 — the next handoff, line 1\n");
t("a handoff CREATED on coord (no pointer on main) is seen by the kickoffs' readers",
  RB.readSet(B).filter((r) => r.key === "next").map((r) => r.file).sort(),
  ["docs/development/kickoffs/LANE-NEXT.md", "docs/development/kickoffs/NEWLANE-NEXT.md"]);
t("an unchanged intent is not a commit", (await tryWrite({ repo: A, message: "again", intents: [{ op: "status", id: "ZZ-1", state: "running", note: "flipped by the fixture" }] })).status, "unchanged");

/* ============================================================================================ */
section("§4 A MAIN GATE RECORD SURVIVES A coord WRITE (D-293: the record is keyed by main's tree)");
const mainTree = git(A, "rev-parse", "origin/main^{tree}");
PG.appendRun({ repo: A, run: { tree: mainTree, verdict: "GREEN", class: "FULL", head: git(A, "rev-parse", "origin/main"), steps: [{ label: "battery", units: ["plane:*"], ok: true }] } });
await tryWrite({ repo: A, message: "one more note", intents: [{ op: "append", file: "docs/development/CLAIMS.md", text: "## CLAIM 2026-09-22 ZZ-C (a later note)\n\npaths: `c`\n" }] });
git(A, "fetch", "-q", "origin");
t("after the coord write, origin/main's tree is the tree the record was written for",
  git(A, "rev-parse", "origin/main^{tree}"), mainTree);
t("...and the push guard's lookup still reads that record GREEN",
  PG.effectiveVerdict(PG.readRuns({ repo: A, tree: git(A, "rev-parse", "origin/main^{tree}") }).runs).verdict, "GREEN");

/* ============================================================================================ */
section("§5 CONCURRENT: a new block and a line into an existing block both land, the line in ITS OWN block");
const ANCHOR = "## CLAIM 2026-09-22 ZZ-C (a later note)";
git(B, "fetch", "-q", "origin");
let raced = false;
const wA = await tryWrite({ repo: A, message: "a line into ZZ-C's block", intents: [{ op: "line", file: "docs/development/CLAIMS.md", under: ANCHOR, text: "**released: 2026-09-22 ZZ-C** — LINE-FROM-A" }],
  beforePush: async ({ attempt }) => {
    if (attempt !== 1) return;
    raced = true;
    const wB = await tryWrite({ repo: B, message: "a new block from B", intents: [{ op: "append", file: "docs/development/CLAIMS.md", text: "## CLAIM 2026-09-22 ZZ-B (a new block, landed first)\n\nBODY-FROM-B\n" }] });
    t("B's new block landed while A was between its commit and its push", wB.status, "pushed");
  } });
t("A's first push was REFUSED as a non-fast-forward, and its second landed", [raced, wA.status, wA.attempts.length, (wA.attempts[0] || { status: 0 }).status !== 0], [true, "pushed", 2, true]);
git(A, "fetch", "-q", "origin"); C.resetCoordCache();
const claims = C.readState(A, "docs/development/CLAIMS.md");
const blockOf = (heading) => { const ls = claims.split("\n"); const i = ls.indexOf(heading); let e = i + 1; while (e < ls.length && !/^#{1,2} /.test(ls[e])) e++; return i < 0 ? null : ls.slice(i, e).join("\n"); };
t("§5 the line is in ITS OWN block", /LINE-FROM-A/.test(blockOf(ANCHOR) || ""), true);
t("...and NOT inside the block that landed meanwhile", /LINE-FROM-A/.test(blockOf("## CLAIM 2026-09-22 ZZ-B (a new block, landed first)") || "LINE-FROM-A"), false);
t("...and B's block is whole, after A's", [/BODY-FROM-B/.test(claims), claims.indexOf("ZZ-B (a new block") > claims.indexOf(ANCHOR)], [true, true]);
t("the line was re-applied to the fresh tip exactly once", (claims.match(/LINE-FROM-A/g) || []).length, 1);

/* ============================================================================================ */
section("§6 BOB #28's RULING 2 — a write that plants a closed row in the cache is REFUSED by name; neither branch moves");
const c0 = coordAt(), m0 = mainAt();
let refusedMsg = "";
const planted = await (async () => { try { await C.write({ repo: A, message: "plant", intents: [{ op: "append", file: "docs/development/QUEUE.md", text: "### ZZ-9 · done — a closed row planted in the cache\nmilestone: M0\n" }] }); return "NO REFUSAL"; }
  catch (e) { refusedMsg = e.message; return e.code; } })();
t("§6 the planted closed row is REFUSED", planted, "LEDGER_CHECK_FAILED");
t("...by name: the arm and the invariant", [/LC-ledger/.test(refusedMsg), /P2 ZZ-9 · done/.test(refusedMsg)], [true, true]);
t("...coord did not move and main did not move", [coordAt(), mainAt()], [c0, m0]);
const dry = await tryWrite({ repo: A, message: "dry", dryRun: true, intents: [{ op: "append", file: "docs/development/CLAIMS.md", text: "## CLAIM 2026-09-22 ZZ-D (dry)\n\nx\n" }] });
t("a dry run applies and checks, and pushes nothing", [dry.status, coordAt()], ["dry-run", c0]);

/* ============================================================================================ */
section("§7 refusals, the archive inside a write, the read command, the churn figure, the push guard");
t("a write to a file that is not state is refused", await code(() => C.write({ repo: A, message: "x", intents: [{ op: "append", file: "README.md", text: "x" }] })), "NOT_A_STATE_FILE");
t("a line under a heading that is not there is refused", await code(() => C.write({ repo: A, message: "x", intents: [{ op: "line", file: "docs/development/CLAIMS.md", under: "## CLAIM nowhere", text: "x" }] })), "ANCHOR_NOT_FOUND");
t("an ambiguous anchor is refused", await code(() => C.write({ repo: A, message: "x", intents: [{ op: "line", file: "docs/development/CLAIMS.md", under: "## DELEGATION 2026-09-20 ZZ -> BOB (fixture 1", text: "x" }] })), "ANCHOR_AMBIGUOUS");
t("a status on a row that is not there is refused", await code(() => C.write({ repo: A, message: "x", intents: [{ op: "status", id: "ZZ-77", state: "done" }] })), "ROW_NOT_FOUND");
t("a state word that is not a state is refused", await code(() => C.write({ repo: A, message: "x", intents: [{ op: "status", id: "ZZ-1", state: "finished" }] })), "UNKNOWN_STATE");
t("a write with no message is refused", await code(() => C.write({ repo: A, message: "", intents: [{ op: "status", id: "ZZ-1", state: "done" }] })), "NO_MESSAGE");
const arch = await tryWrite({ repo: A, message: "ZZ-1 done, archived in the same commit", intents: [{ op: "status", id: "ZZ-1", state: "done" }, { op: "archive", id: "ZZ-1" }] });
git(A, "fetch", "-q", "origin"); C.resetCoordCache();
t("a done flip and its archive land as ONE coord commit (P2 would refuse the flip alone)",
  [arch.status, arch.changed.sort(), L.findId("ZZ-1", { repo: A }).map((f) => `${f.where} ${f.state}`)],
  ["pushed", ["docs/archive/ledgers/QUEUE-closed.md", "docs/development/QUEUE.md"], ["archive done"]]);
const backlogIds = () => { git(A, "fetch", "-q", "origin"); C.resetCoordCache(); return L.pipelineRows({ repo: A }).rows.filter((r) => r.where === "backlog").map((r) => r.id); };
const ins = await tryWrite({ repo: A, message: "place ZZ-4 ahead of ZZ-3", intents: [{ op: "insert", file: "docs/development/BACKLOG.md", where: "before", id: "ZZ-3", text: ROW("ZZ-4", "queued") }] });
t("a new row is PLACED by the row it precedes — the plan's order is file position (SCHEDULER's act)", [ins.status, backlogIds()], ["pushed", ["ZZ-4", "ZZ-3"]]);
const edited = await tryWrite({ repo: A, message: "ZZ-4 re-worded", intents: [{ op: "row", file: "docs/development/BACKLOG.md", id: "ZZ-4", text: ROW("ZZ-4", "queued", "order: re-placed by the fixture\n") }] });
t("...a row is REPLACED whole by its id", [edited.status, /order: re-placed by the fixture/.test(C.readState(A, "docs/development/BACKLOG.md"))], ["pushed", true]);
const del = await tryWrite({ repo: A, message: "ZZ-4 withdrawn", intents: [{ op: "row", file: "docs/development/BACKLOG.md", id: "ZZ-4", text: "" }] });
t("...and DELETED by its id", [del.status, backlogIds()], ["pushed", ["ZZ-3"]]);
t("the flip ALONE is refused by P2", await code(() => C.write({ repo: A, message: "x", intents: [{ op: "status", id: "ZZ-2", state: "done" }] })), "LEDGER_CHECK_FAILED");
/* A remote that has never had a coord: the estate before the cutover. */
const NOCOORD = join(base, "nocoord.git"); git(base, "init", "-q", "--bare", "-b", "main", NOCOORD); git(SEED, "push", "-q", NOCOORD, "main:main");
const unswitched = join(base, "old"); git(base, "clone", "-q", NOCOORD, unswitched); ident(unswitched);
t("before the cutover the read command answers from origin/main", (() => { const r = C.readRemote("docs/development/kickoffs/LANE-NEXT.md", { repo: unswitched, fetch: false }); return [r.ref, r.text]; })(),
  ["origin/main", FILES["docs/development/kickoffs/LANE-NEXT.md"]]);
t("with no coord, a write is refused by name and nothing is created", await code(() => C.write({ repo: unswitched, message: "x", intents: [{ op: "status", id: "ZZ-1", state: "done" }] })), "NO_COORD");
const ch = C.churn({ repo: SEED, ref: "refs/heads/cut", since: "2000-01-01T00:00:00Z" });
t("churn classifies the pointer commit (state + MILESTONES.md) and the seed (state + product) apart",
  [ch.landings, ch.klass.stateOnlyWithMilestones, ch.klass.touchedState], [2, 1, 1]);
t("the push guard reads a push of coord ALONE as coord-only, and a push naming main beside it as not",
  [PG.coordOnly(`refs/heads/x ${"a".repeat(40)} refs/heads/coord ${"b".repeat(40)}`),
   PG.coordOnly(`refs/heads/x ${"a".repeat(40)} refs/heads/coord ${"b".repeat(40)}\nrefs/heads/main ${"c".repeat(40)} refs/heads/main ${"d".repeat(40)}`),
   PG.coordOnly("")], [true, false, false]);
PG.install({ repo: A }); PG.installCopy({ repo: A });
writeFileSync(join(A, "README.md"), "UNCOMMITTED DRIFT in the lane's own tree\n");
const hooked = await tryWrite({ repo: A, message: "a note through the hook", intents: [{ op: "append", file: "docs/development/CLAIMS.md", text: "## CLAIM 2026-09-22 ZZ-E (through the hook)\n\nx\n" }] });
t("through the REAL hook a coord note lands from a DIRTY lane tree, and the guard says it judged it coord-only",
  [hooked.status, /a coord-only push/.test(hooked.pushOutput)], ["pushed", true]);
const mk = "<".repeat(7);
const markerRefused = await code(() => C.write({ repo: A, message: "a marker", checks: false, intents: [{ op: "append", file: "docs/development/CLAIMS.md", text: `${mk} HEAD\nx\n` }] }));
t("a coord commit carrying a merge marker is refused by the hook even with the write's checks off", markerRefused, "PUSH_FAILED");
t("...and with the checks on, the write refuses it before the push (LC-markers)", await code(() => C.write({ repo: A, message: "a marker", intents: [{ op: "append", file: "docs/development/CLAIMS.md", text: `${mk} HEAD\nx\n` }] })), "LEDGER_CHECK_FAILED");

/* ============================================================================================ */
/* §8 — THE MOVED FLOORS — WAS HERE, and is RETIRED by M0-140 (2026-09-24) with the DEBT construct.

   It drove M0-109's two NON-VACUITY floors, on planted DEBT ledgers, in BOTH directions: an EMPTY ledger FAILS
   LC-debt-token and LC-debt-agreement by name; ONE row passes (the over-strictness arm — the fold's last row must
   not redden a gate); a HUNDRED rows pass, which is the arm that tells a non-vacuity floor from the SIZE floor
   M0-109 removed. `debt-floor.control.mjs` armed against these four assertions by name.

   Both ledger checks are retired in this landing — there is no live DEBT.md for either to read — so there is
   nothing left to drive, and `debt-floor.control.mjs` is retired with them. This is not a floor quietly dropped:
   each of those arms FAILED BY NAME at zero rows on purpose, precisely so that the moment the file emptied could
   not pass in silence. It did not pass in silence; it arrived here, as the landing they were written to wait for.
   §9 below still shows every OTHER moved arm firing on a planted breach. */

/* ============================================================================================ */
section("§9 THE OTHER MOVED ARMS, each shown to FIRE on a planted breach (a check that cannot fail is worse than none)");
const plantTree = (edit) => {
  const d = mkdtempSync(join(tmpdir(), "coord-arms-"));
  for (const [rel, text] of Object.entries({ ...FILES, "docs/development/VERIFICATION.md": "# Verification — fixture\n\nQUEUED ZZ-1 is the fixture's reference.\n", ...edit })) {
    if (text === null) continue;
    mkdirSync(dirname(join(d, rel)), { recursive: true }); writeFileSync(join(d, rel), text);
  }
  return d;
};
const fires = async (id, edit) => (await C.ledgerChecks({ repo: plantTree(edit), only: [id], today: TODAY })).arms[0].fails;
t("the planted fixture passes every arm (the baseline the breaches below are measured from)",
  (await C.ledgerChecks({ repo: plantTree({}), today: TODAY })).arms.filter((a) => a.fails.length).map((a) => `${a.id}: ${a.fails[0]}`), []);
/* M0-140: the two retired arms are asserted GONE by name, not merely unused. A `only: ["LC-debt-token"]` run
   returns NO arm, and every caller that still named one would be selecting nothing while reporting a clean run —
   which is how a retired check goes on looking checked. `plancheck` §2's `only` list drops both in the same act. */
t("the retired DEBT arms answer to NOTHING — no arm is registered under either name (M0-140)",
  (await C.ledgerChecks({ repo: plantTree({}), only: ["LC-debt-token", "LC-debt-agreement"], today: TODAY })).arms.map((a) => a.id), []);
t("LC-queued-refs FIRES on a reference to an id that is nowhere", (await fires("LC-queued-refs", { "docs/development/INTERFACES.md": "# Interfaces\n\nQUEUED ZZ-404 is dangling.\n" })).some((x) => /ZZ-404/.test(x)), true);
t("LC-row-design FIRES on an open row naming no design", (await fires("LC-row-design", { "docs/development/BACKLOG.md": "# BACKLOG\n\n### ZZ-3 · queued — names nothing\nmilestone: M0\ninterface: none\n" })).some((x) => /ZZ-3/.test(x)), true);
t("LC-plan-fields FIRES on a milestone MILESTONES.md does not define", (await fires("LC-plan-fields", { "docs/development/BACKLOG.md": FILES["docs/development/BACKLOG.md"].replace("milestone: M0", "milestone: M99") })).some((x) => /M99/.test(x)), true);
t("LC-strays FIRES on an open row under a heading the grammar cannot read", (await fires("LC-strays", { "docs/development/BACKLOG.md": FILES["docs/development/BACKLOG.md"] + "\n### ZZ-5b · queued — unreadable id\n" })).length > 0, true);
t("LC-delegations FIRES on a silent DELEGATION block", (await fires("LC-delegations", { "docs/development/CLAIMS.md": FILES["docs/development/CLAIMS.md"] + "\n## DELEGATION 2026-09-22 ZZ -> BOB (silent)\n\nno state line.\n" })).some((x) => /SILENT/.test(x)), true);
/* The LC-debt-token breach WAS HERE (a row with no disposition token). The arm is retired with the construct
   (M0-140, 2026-09-24), so there is no arm to fire. `fires()` reads `arms[0]`, which is `undefined` for a name no
   arm answers to — the shape that would have let a retired arm go on looking checked. */
/* CORRECTED 2026-09-24 by c19-unionfix: this fired when D-388, the UNDECIDED set's route, left DEBT.md. BOB #32 drained
   the table (CORPUS-STANDARD §6, folds-0924b) and the D-388 clause is RETIRED (see the arm), so the old breach is no
   breach. The arm now fires on the thing it still guards: a file listed UNDECIDED instead of classified. */
t("LC-undecided-route FIRES when a file is listed UNDECIDED rather than classified", (await fires("LC-undecided-route", { "docs/architecture/CORPUS-STANDARD.md": "# Standard — fixture\n\n### Undecided — files the walk found\n\n| document | what is undecided |\n| --- | --- |\n| `docs/development/ZZ-UNSORTED.md` | whether it is a design |\n" })).some((x) => /ZZ-UNSORTED/.test(x)), true);
/* CORRECTED 2026-09-24 by M0-140: the over-strictness arm beside it removed D-388's row from a fixture DEBT.md to
   show the retired route was no longer a condition of a coord write. There is no fixture DEBT.md and no D-388 row —
   D-388 is CLOSED and archived by this landing — so the arm is re-pointed at what it actually guards: an UNDECIDED
   table that is EMPTY passes, which is the state BOB #32 left CORPUS-STANDARD §6 in. Without this half the arm
   above could be a check that fires on everything. */
t("...and does NOT fire on an UNDECIDED table that is empty — every design file classified (the real state)",
  (await fires("LC-undecided-route", { "docs/architecture/CORPUS-STANDARD.md": "# Standard — fixture\n\n### Undecided — files the walk found\n\n| document | what is undecided |\n| --- | --- |\n" })).length, 0);
t("LC-op-claims FIRES on an op= claim naming no op", (await fires("LC-op-claims", { "docs/development/CLAIMS.md": FILES["docs/development/CLAIMS.md"] + "\nThe lane calls " + "op" + "=zznotanoprealy here.\n" /* built, so op-claims' own walk does not read THIS file as the claim */ })).some((x) => /zznotanoprealy/.test(x)), true);
t("LC-markers FIRES on a merge marker in a state file", (await fires("LC-markers", { "docs/development/QUEUE.md": FILES["docs/development/QUEUE.md"] + `${"<".repeat(7)} HEAD\n` })).length, 1);
t("LC-handoff-budget FIRES on a handoff over its budget once its cut has landed (a WARN otherwise, as readbudget rules)",
  (await C.ledgerChecks({ repo: plantTree({ "docs/development/kickoffs/LANE-NEXT.md": "x".repeat(13 * 1024) }), only: ["LC-handoff-budget"] })).arms[0].warns.length, 1);

/* ============================================================================================ */
section("§10 M0-119 — A PLACEMENT OVER BUDGET MOVES THE TAIL, NEVER CUTS A ROW (WORK-PIPELINE §2, BOB #28), through a real write");
{
  git(A, "fetch", "-q", "origin"); C.resetCoordCache();
  const LATER = L.LEDGERS.LATER.live, BL = "docs/development/BACKLOG.md";
  const big = (id) => ROW(id, "queued", `scope: ${"w".repeat(1400)}\naccepts-when: the WHOLE text of ${id}, which a cut would lose\n`);
  const ids = (text) => L.queueRows(text || "").map((r) => r.id);
  /* A backlog just UNDER the real 150 KiB budget: the placement below is what tips it over. */
  let text = "# BACKLOG — the fixture backlog\n\n- **Budget:** the fixture's preamble line.\n\n" + ROW("ZZ-3", "queued") + "\n";
  const order = ["ZZ-3"];
  for (let i = 100; ; i++) { const next = text + big(`ZZ-${i}`) + "\n"; if (Buffer.byteLength(next) > L.BUDGET.BACKLOG.ledger) break; text = next; order.push(`ZZ-${i}`); }
  const seeded = await tryWrite({ repo: A, message: "seed a backlog just under budget", intents: [{ op: "replace", file: BL, text }] });
  C.resetCoordCache(); git(A, "fetch", "-q", "origin");
  t("the seeded backlog landed, under budget, with no tail file (nothing to demote)",
    [seeded.status, Buffer.byteLength(C.readState(A, BL)) <= L.BUDGET.BACKLOG.ledger, C.readState(A, LATER)], ["pushed", true, null]);
  t("...over a backlog that is not small (else the placement moves nothing)", order.length > 80, true);
  const placed = await tryWrite({ repo: A, message: "place ZZ-99 at the top", intents: [{ op: "insert", file: BL, where: "before", id: "ZZ-3", text: big("ZZ-99") }] });
  C.resetCoordCache(); git(A, "fetch", "-q", "origin");
  const nb = C.readState(A, BL), nl = C.readState(A, LATER);
  const want = ["ZZ-99", ...order];
  t("§10 a placement over budget is PUSHED — the ledger checks pass, the tail moved rather than the budget failing",
    [placed.status, (placed.changed || []).sort()], ["pushed", [BL, LATER].sort()]);
  t("§10 every id is in EXACTLY ONE file", (() => { const all = [...ids(nb), ...ids(nl)]; return [all.length, new Set(all).size]; })(), [want.length, want.length]);
  t("§10 IN ORDER: the backlog then its tail read as the placed order", [...ids(nb), ...ids(nl)], want);
  t("§10 the FOOT moved — the head, and the placed row, stayed", [ids(nb)[0], ids(nl).slice(-1)[0]], ["ZZ-99", order[order.length - 1]]);
  t("§10 NO ROW IS CUT: every moved row carries its whole text", ids(nl).filter((id) => !new RegExp(`the WHOLE text of ${id},`).test(nl)), []);
  t("§10 BACKLOG.md is back within its budget", Buffer.byteLength(nb) <= L.BUDGET.BACKLOG.ledger, true);
  t("§10 find answers a demoted id in the tail, from coord", L.findId(ids(nl)[0], { repo: A }).map((f) => `${f.where} ${f.file}`), [`tail ${LATER}`]);
  /* Room frees: the placed row is withdrawn, and the next write brings the tail's head back. */
  const back = await tryWrite({ repo: A, message: "withdraw ZZ-99", intents: [{ op: "row", file: BL, id: "ZZ-99", text: "" }] });
  C.resetCoordCache(); git(A, "fetch", "-q", "origin");
  t("§10 as room frees the tail's head is PROMOTED back by the same write, the order intact",
    [back.status, [...ids(C.readState(A, BL)), ...ids(C.readState(A, LATER))], ids(C.readState(A, LATER)).length], ["pushed", order, 0]);
  /* The two intents M0-119 adds: `swap` (a preamble line no row intent reaches) and `rebalance` (creates the tail). */
  const sw = await tryWrite({ repo: A, message: "the budget line", intents: [{ op: "swap", file: BL, old: "- **Budget:** the fixture's preamble line.\n", text: "- **Budget:** 150 KiB; the tail moves.\n" }] });
  C.resetCoordCache(); git(A, "fetch", "-q", "origin");
  t("a `swap` replaces an exact text found once", [sw.status, /150 KiB; the tail moves/.test(C.readState(A, BL))], ["pushed", true]);
  t("...and refuses a text that is not there", await code(() => C.write({ repo: A, message: "x", intents: [{ op: "swap", file: BL, old: "no such text", text: "y" }] })), "SWAP_NOT_FOUND");
  t("...or one found twice", await code(() => C.write({ repo: A, message: "x", intents: [{ op: "swap", file: BL, old: "milestone: M0\n", text: "y" }] })), "SWAP_AMBIGUOUS");
  t("the `rebalance` intent on a balanced pair changes nothing — the emptied tail keeps its header (the file stays)",
    await (async () => { const r = await tryWrite({ repo: A, message: "rebalance again", intents: [{ op: "rebalance" }] }); C.resetCoordCache(); git(A, "fetch", "-q", "origin");
      return [r.status, C.readState(A, LATER) === L.LATER_HEADER]; })(), ["unchanged", true]);
}

console.log(`\ncoord: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
