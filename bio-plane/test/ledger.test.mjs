/* ledger.test — LED-2: the archiver (`tools/ledger.mjs archive <ID>`), the one definition of a
 * CLOSED row it shares with `tools/owed.mjs`, and the three `plancheck` arms it feeds. LED-6: the
 * BACKLOG, `refill`, `find` across cache, backlog and archive, and the five pipeline invariants.
 *
 * Every write is into a fixture repository under this process's own temp sandbox; the estate's
 * ledgers are READ (the full-migration simulation copies them first) and never written.
 *
 * THE CONSERVATION SECTION IS FIRST, because it is the property that matters: a mover that drops a
 * row is the D-288 loss shape. **How a liar would satisfy it, stated before what it checks:** count
 * rows instead of comparing ids, and a mover that drops one row and duplicates another reports the
 * same total. So the check compares per-id OCCURRENCE COUNTS over live ∪ archive, and section 1
 * hands it exactly that liar.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/ledger.control.mjs` from the repo root, ten arms plus a
 * baseline, each armed ALONE and restored by sha256 + cmp — all RUN 2026-09-18 by the LED-2
 * worker, exit 0, 58 pass / 0 fail, every restore byte-identical. Each must turn this suite RED by
 * the named assertion: (1) conservation by row COUNT -> "a dropped row and a duplicated row do NOT
 * cancel" fails; (2) the mover takes one line too many -> "archive A-2 was not refused" and "archive
 * D-5 was not refused" fail, the refusals naming the swallowed `## AREA` line and the id D-6 (on
 * its first run this arm found the id check BLIND to the swallowed heading — `linesConserved` is
 * the fix); (3) the same with the pre-write check removed -> the READ-BACK check alone refuses and
 * restores byte-identically; (4) the DEBT closed test reverted to the August *lacks `open`* ->
 * "every OPEN spelling" fails; (5) `blocked` counted closed -> "a `blocked` row is NOT closed"
 * fails; (6) the per-row budget never exceeded -> "(b) an open row over 3 KiB is named" fails;
 * (7) every `depends-on` token accepted -> "(c) the unresolved dependencies" fails; (8) `mintid`'s
 * duplicate check stops reading the archive -> "mintid's duplicate check still sees D-7 twice"
 * fails; (9) the archive-aware lookup ignores the archive -> "find F-1 answers the new archive"
 * fails; (10) OVER-STRICTNESS, the closure word matched case-sensitively -> "every CLOSED spelling
 * reads closed" fails, because `closed 2026-…` is correct work in a spelling the rule must admit.
 * LED-6 (sections 9–12: the BACKLOG, `refill`, `find` across three, the five pipeline invariants)
 * adds EIGHTEEN arms to the same driver, declared in its header; ALL 28 RUN 2026-09-18 by the LED-6
 * worker, exit 0, 156 pass / 0 fail, 28 restores byte-identical (baseline 158/0). Armed suite per
 * arm: P1 157/1, P2 157/1, P3 157/1, P3o 156/2, P4 145/13, P4o 147/11, P5 157/1, P5o 156/2,
 * R1 136/22, R1b 137/21 (READ BACK, restored byte-identically: YES), R2 147/11, R3 145/13, R4 153/5,
 * R5 157/1, F1 148/10, F2 154/4, M1 157/1, O1 owed.test 40/2. ON ITS FIRST RUN arm P4 fired at the
 * wrong thing: section 11 judged texts against a repository holding neither, so the "open" dependency
 * was unmet because it was NOWHERE and the P4 assertion stayed green — fixed in section 11, and the
 * arm now also requires "...and R-5 is unmet because B-1 is OPEN".
 * NEGATIVE CONTROL: (M0-119, section 13 — the backlog's TAIL) the same driver's NINE T-arms, each armed ALONE and
 * restored by sha256 + cmp; RUN 2026-09-22 by the M0-119 worker: (T1) the rebalance drops the row it demotes ->
 * "THE ACCEPTANCE — every id is in EXACTLY ONE file" FAILS, 173/14; (T2) a demoted row to the tail's FOOT -> "...IN
 * ORDER" FAILS, 176/11; (T3) P1 blind to the tail -> "P1 CATCHES an open id in BOTH the backlog and its tail" FAILS,
 * 186/1; (T4) the refill walks BACKLOG.md alone -> "refill … FROM THE TAIL" FAILS, 185/2; (T5) the coord write's
 * rebalance skipped -> coord.test "§10 a placement over budget is PUSHED" FAILS, 87/7; (T6) THE ITEM'S CONTROL, the
 * lister pointed at BACKLOG.md alone -> pipeline-readers.test "the lister reads the TAIL" and "a TAIL row naming no
 * design FAILS by name" FAIL, 49/9; (T7) mintid's DEC corpus without the tail -> "DEC: an id mentioned ONLY in
 * BACKLOG-LATER.md raises the floor" FAILS, 56/2; (T8) find blind to the tail -> "find answers a demoted id in the
 * TAIL" FAILS, 185/2; (T9, over-strictness) an absent tail read as unreadable -> ON ITS FIRST RUN the suite CRASHED
 * (section 11's `.pipeline.arms` threw on an unscored pipeline, tally -1): a finding about the suite, fixed there and in
 * section 12, after which "an ABSENT tail is NAMED absent by the audit" FAILS by name, 159/28.
 */
/* NEGATIVE CONTROL: (M0-109, §3's non-vacuity floor) `node bio-plane/test/debt-floor.control.mjs` from the repo root,
   eight arms plus a baseline across this suite and `planning-hygiene.test.mjs`, each armed ALONE and restored by sha256
   AND `cmp` against its own copy. An arm replaces ONLY §3's read of the live DEBT.md with a PLANTED ledger (the file is
   never written) and asserts the row count §3 prints, so a plant that never reached the floor is a finding, while every
   other section still reads the real ledger. (LE) an EMPTY ledger -> "the real DEBT.md has rows (else the agreement is
   vacuous)" FAILS, and nothing else does. (LC) the old `> 100` restored over 100 planted rows -> the same assertion
   FAILS, and nothing else: the incident this item corrects. (LO) the same 100 rows under the corrected floor -> GREEN,
   the over-strictness arm, which also isolates LC's variable. (LO1) ONE planted row, the fold's last -> GREEN. (LL) THE
   LIAR, the floor deleted over an empty ledger -> GREEN, and that is the finding: no other assertion here sees an empty
   ledger, so LE is the arm that catches the liar. RUN 2026-09-22 by the M0-109 worker, driver exit 0, 62 pass / 0 fail,
   every restore byte-identical; this suite per arm: baseline 158/0 judging 101 live rows, LE 157/1 judging 0, LC 157/1
   judging 100, LO 158/0 judging 100, LO1 158/0 judging 1, LL 157/0 judging 0. Run on this file's code as committed;
   this block and the wording of §3's comment were written after it.
   SUPERSEDED 2026-09-22 BY M0-110, AND KEPT AS THE RECORD: §3's live read and its floor left this suite for `coord.mjs`'
   ledger check LC-debt-agreement (BOB #28's ruling 2), and `debt-floor.control.mjs` was re-pointed there — its arms now
   patch `tools/coord.mjs` and read `coord.test.mjs` §8; the run of record is on that suite's NEGATIVE CONTROL line. */

import "./stdio.mjs";
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import * as L from "../../tools/ledger.mjs";
import { owedFor, isClosedDebtRow, debtDisposition, RESIDUE_RE } from "../../tools/owed.mjs";
import { allocations, collisions } from "../../tools/mintid.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 13;
let reached = 0;
const section = (n) => { reached++; console.log(`\n--- ${n} ---`); };
const code = (f) => { try { f(); return "NO REFUSAL"; } catch (e) { return e.code || `THREW ${e.message}`; } };
/* A move whose refusal is RETURNED, so a broken mover reddens an assertion rather than ending the module. */
const mv = (id, opts) => { try { return L.archiveId(id, opts); } catch (e) { return { moved: [], kept: [], results: [{ moved: [] }], refusal: `${e.code}: ${e.message}` }; } };

/* A fixture repository: the files the archiver, owed, the gate and mintid read. DEBT is padded past
   the 10,000-byte floor with prose so a move is not refused on size unless a test means it to be. */
const PAD = "Prose above the table, as the live ledger carries. ".repeat(220) + "\n\n";
/* LED-6: every fixture carries a BACKLOG (empty unless given) — the archiver refuses to move anything
   when a live file of the QUEUE grammar cannot be read. `backlog: null` leaves it absent on purpose. */
function fixture({ queue = "", backlog = "", debt = "", archives = {}, status = null, plan = null } = {}) {
  const root = mkdtempSync(join(tmpdir(), "ledger-"));
  mkdirSync(join(root, "docs/development"), { recursive: true });
  mkdirSync(join(root, "docs/archive/ledgers"), { recursive: true });
  mkdirSync(join(root, "docs/architecture"), { recursive: true });
  writeFileSync(join(root, "docs/development/QUEUE.md"), queue);
  if (backlog !== null) writeFileSync(join(root, "docs/development/BACKLOG.md"), backlog);
  writeFileSync(join(root, "docs/development/DEBT.md"), debt);
  writeFileSync(join(root, "docs/development/DECISIONS.md"), "");
  for (const [f, body] of Object.entries(archives)) writeFileSync(join(root, "docs/archive/ledgers", f), body);
  if (status) writeFileSync(join(root, "docs/architecture/construct-status.json"), JSON.stringify(status));
  if (plan) writeFileSync(join(root, "docs/archive/IS-BUILD-PLAN.md"), plan);
  return root;
}
/* A file a refused move never wrote reads as "" — a missing archive must redden an assertion, not end the module. */
const read = (root, rel) => (existsSync(join(root, rel)) ? readFileSync(join(root, rel), "utf8") : "");
const Q = (id, state, body = "scope: something\n") => `### ${id} · ${state} — a row\n${body}\n`;
const DEBT = (rows) => `# DEBT\n\n${PAD}| ID | Sev | Found | Item | Status |\n|---|---|---|---|---|\n${rows.join("\n")}\n`;
/* The arming rows: LED-3 (a), LED-6 (the pipeline arms P3–P5), LED-7 (DEBT's row budget). LED-4 is kept
   because the fixtures predate LED-6 and it is still a row of every one of them; nothing arms on it now. */
const ARMS = Q("LED-3", "queued") + Q("LED-4", "queued") + Q("LED-6", "queued") + Q("LED-7", "queued");

/* ========================================================================================== */
section("1 — CONSERVATION: the id MULTISET of live ∪ archive is identical before and after, and a "
      + "dropped row plus a duplicated row do NOT cancel");
{
  const before = new Map([["A-1", 1], ["A-2", 1], ["A-3", 1]]);
  const liar = new Map([["A-1", 1], ["A-2", 2]]);          /* A-3 dropped, A-2 duplicated */
  const sum = (m) => [...m.values()].reduce((s, n) => s + n, 0);
  t("the liar fixture has the SAME row count, so a counting check would pass it", sum(liar), sum(before));
  const c = L.conservation(before, liar);
  t("a dropped row and a duplicated row do NOT cancel — the check refuses", c.ok, false);
  t("...and NAMES the dropped id", c.dropped, ["A-3 (1 -> 0)"]);
  t("...and NAMES the duplicated id", c.gained, ["A-2 (1 -> 2)"]);
  t("a pure duplication (the SET unchanged) is refused too", L.conservation(before, new Map([["A-1", 2], ["A-2", 1], ["A-3", 1]])).ok, false);
  t("an identical multiset passes", L.conservation(before, new Map(before)).ok, true);
  /* THE ID MULTISET CANNOT SEE A LINE IT CANNOT PARSE — found by arm C2, whose over-long splice
     swallowed an `## AREA` heading and conserved every id. So the live file's lines are conserved too. */
  const lc = L.linesConserved("row a\n## AREA\n\nrow c\n", "row c\n", ["row a"]);
  t("a mover that also swallowed a NON-ROW line (a heading, a blank) is refused by the line check", lc.ok, false);
  t("...naming what was lost", lc.off, ['lost ×1: "## AREA"', 'lost ×1: ""']);
  t("...and an exact move passes it", L.linesConserved("row a\nrow b\n", "row b\n", ["row a"]).ok, true);

  const queue = Q("A-1", "running") + Q("A-2", "done", "scope: the done one\nlanded: `abc`\n\n#### a sub-heading that belongs to the row\nmore\n")
              + "## AREA — ACTIVE\n\n" + Q("A-3", "queued") + ARMS;
  const root = fixture({ queue, debt: DEBT([]) });
  const liveBefore = read(root, "docs/development/QUEUE.md");
  /* A refusal is CAUGHT and asserted, never allowed to end the module: a mover that breaks
     conservation must turn this suite red NAMING the id, not crash it with the tally unprinted. */
  let r;
  try { r = L.archiveId("A-2", { repo: root }); } catch (e) { r = { moved: [], refusal: `${e.code}: ${e.message}` }; }
  const liveAfter = read(root, "docs/development/QUEUE.md");
  const arch = existsSync(join(root, "docs/archive/ledgers/QUEUE-closed.md")) ? read(root, "docs/archive/ledgers/QUEUE-closed.md") : "";
  const block = "### A-2 · done — a row\nscope: the done one\nlanded: `abc`\n\n#### a sub-heading that belongs to the row\nmore\n";
  t("archive A-2 was not refused (a refusal here names the id the mover dropped)", r.refusal, undefined);
  t("archive A-2 moved ONE row", r.moved.length, 1);
  t("the archived row is VERBATIM, a level-4 heading inside it carried with it", arch.includes(block), true);
  t("the archive begins with its header (written by the archiver on first use)", arch.startsWith(L.ARCHIVE_HEADER.QUEUE), true);
  t("the live file lost EXACTLY that block and nothing else", liveAfter, liveBefore.replace(block + "\n", ""));
  t("the id multiset of live ∪ archive is conserved, read back from disk",
    L.conservation(L.idCounts(L.LEDGERS.QUEUE, [liveBefore]),
                   L.idCounts(L.LEDGERS.QUEUE, [liveAfter, arch])).ok, true);
  t("the area heading after the row stayed live (a row ends at the next heading of level 1-3)",
    liveAfter.includes("## AREA — ACTIVE"), true);

  /* A heading the id grammar cannot read is a BOUNDARY, never carried under the row above it. */
  const q2 = Q("B-1", "done") + "### B-1b · done\nscope: an unparseable heading's own row\n\n" + ARMS;
  const root2 = fixture({ queue: q2, debt: DEBT([]) });
  t("archive B-1 was not refused", mv("B-1", { repo: root2 }).refusal, undefined);
  t("a heading the id grammar cannot parse (`B-1b`) stays live rather than riding under B-1",
    read(root2, "docs/development/QUEUE.md").includes("### B-1b · done"), true);
  t("...and is not in the archive", read(root2, "docs/archive/ledgers/QUEUE-closed.md").includes("B-1b"), false);

  /* DEBT: one line, verbatim, into a table. */
  const d = "| D-5 | gap | 2026-09-18 | a body | M2 · **CLOSED 2026-09-18 by X-1** |";
  const root3 = fixture({ queue: ARMS, debt: DEBT([d, "| D-6 | gap | 2026-09-18 | b | M2 · open |"]) });
  t("archive D-5 was not refused", mv("D-5", { repo: root3 }).refusal, undefined);
  const da = read(root3, "docs/archive/ledgers/DEBT-closed.md");
  t("a DEBT row lands verbatim under the archive's table header", da.endsWith("|---|---|---|---|---|\n" + d + "\n"), true);
  t("...and D-6 (open) is untouched in the live file", read(root3, "docs/development/DEBT.md").includes("| D-6 |"), true);
}

/* ========================================================================================== */
section("2 — THE FULL MIGRATION, SIMULATED ON A COPY OF THE REAL LEDGERS: every closed row moved, "
      + "nothing refused, id multisets and every non-blank LINE conserved, owed identical");
{
  const root = mkdtempSync(join(tmpdir(), "ledger-real-"));
  /* CORRECTED 2026-09-18 by CONDUCT #5, at LED-3: this section copied the WORKING TREE's ledgers, and LED-3 then
     PERFORMED the migration it simulates, so the live ledgers hold no closed row and the arm below read 0 — the
     section became vacuous by construction, not because anything broke. It now reads its input from the LAST
     PRE-MIGRATION tree, PINNED by sha and read out of git, so it goes on proving what it always proved (that the
     whole migration over the real ledgers conserves every id and line and changes no owed answer), and it stays
     non-vacuous for as long as the history exists. A file the pinned tree did not have is skipped, never faked. */
  const PRE_MIGRATION = "9ea2eb02";
  const atPin = (f) => { const r = spawnSync("git", ["-C", REPO, "show", `${PRE_MIGRATION}:${f}`], { encoding: "utf8", maxBuffer: 1 << 28 });
                         return r.status === 0 ? r.stdout : null; };
  const files = ["docs/development/QUEUE.md", "docs/development/DEBT.md", "docs/development/DECISIONS.md",
                 "docs/archive/IS-BUILD-PLAN.md", "docs/architecture/construct-status.json",
                 /* the archive family through the ARCHIVER's own family patterns, over the PINNED tree's own listing.
                    CORRECTED 2026-09-22 by M0-110: this listed the archive directory of the WORKING TREE, whose files
                    are one-line pointers to `coord` after the cutover; the pinned tree is the input, so its own
                    listing is the list — the same files, read from history, and no read of the live state. */
                 ...(() => { const r = spawnSync("git", ["-C", REPO, "ls-tree", "--name-only", `${PRE_MIGRATION}:${L.ARCHIVE_DIR}`], { encoding: "utf8" });
                             const names = r.status === 0 ? r.stdout.split("\n").filter(Boolean) : [];
                             return [...new Set(Object.values(L.LEDGERS).flatMap((l) => names.filter((n) => l.family.test(n)).sort().map((n) => `${L.ARCHIVE_DIR}/${n}`)))]; })()];
  for (const f of files) { const x = atPin(f); if (x === null) continue; mkdirSync(dirname(join(root, f)), { recursive: true }); writeFileSync(join(root, f), x); }
  /* CORRECTED 2026-09-18 by LED-6: the pinned tree predates the BACKLOG, which the archiver now requires to be
     readable, so the copy gets an EMPTY one — exactly the state LED-6 created on the real tree. And the snapshot
     is per GRAMMAR FAMILY (cache + backlog share the QUEUE archive), not per ledger: a per-ledger snapshot would
     count the shared archive under BACKLOG too, and read every QUEUE row the migration archives as GAINED there. */
  if (!existsSync(join(root, L.LEDGERS.BACKLOG.live))) writeFileSync(join(root, L.LEDGERS.BACKLOG.live), "");
  const FAMILIES = { QUEUE: [L.LEDGERS.QUEUE, L.LEDGERS.BACKLOG], DEBT: [L.LEDGERS.DEBT] };
  const ARCHIVES = [...new Set(Object.values(L.LEDGERS).map((l) => l.archive))];
  const snap = () => Object.fromEntries(Object.entries(FAMILIES).map(([name, ls]) =>
    [name, L.idCounts(ls[0], [...ls.map((l) => l.live), ...L.archiveFiles(ls[0], { repo: root })].map((f) => read(root, f)))]));
  const lanes = ["BOB", "CONDUCT", "DIST", "ZZZNOTALANE"];
  const owedSnap = () => lanes.map((lane) => owedFor(lane, { repo: root }).items.map((i) => `${i.id}${i.attributed ? "*" : ""}`).join(","));
  const lineCounts = (texts) => { const m = new Map(); for (const x of texts) for (const l of x.split("\n")) if (l.trim()) m.set(l, (m.get(l) || 0) + 1); return m; };
  const headerLines = lineCounts(Object.values(L.ARCHIVE_HEADER));
  /* CORRECTED 2026-09-18 by CONDUCT #4: this counted the LIVE ledgers only, while `linesAfter` counts live + archive —
     so it silently assumed the archive starts EMPTY. The first real use of LED-5's standing step (22 QUEUE and 5 DEBT
     rows archived at CONDUCT #4's stand-down) broke that assumption and the arm read 209 lines "lost" that had been
     conserved all along. Both sides now count live + archive, the archive header subtracted from both. */
  const linesBefore = lineCounts([...Object.values(L.LEDGERS).map((l) => read(root, l.live)),
                                  ...ARCHIVES.map((f) => read(root, f))]);
  for (const [l, n] of headerLines) linesBefore.set(l, (linesBefore.get(l) || 0) - n);

  const b = snap(), ob = owedSnap(), cb = collisions({ repo: root });
  const audit0 = L.ledgerAudit({ repo: root });
  const ids = [...new Set(Object.values(audit0.closedLive).flat())];
  t("the real ledgers carry closed rows to move (else this section is vacuous)", ids.length > 100, true);
  let moved = 0; const refused = [];
  for (const id of ids) {
    try { moved += L.archiveId(id, { repo: root }).moved.length; }
    catch (e) { refused.push(`${id} ${e.code}: ${String(e.message).slice(0, 200)}`); }
  }
  console.log(`  ${ids.length} closed id(s), ${moved} row(s) moved`);
  t("no closed id was refused", refused, []);
  const a = snap();
  for (const name of Object.keys(FAMILIES))
    t(`${name}: the id multiset of live ∪ archive is IDENTICAL after the whole migration`, L.conservation(b[name], a[name]), { ok: true, dropped: [], gained: [] });
  const linesAfter = lineCounts([...Object.values(L.LEDGERS).map((l) => read(root, l.live)),
                                 ...ARCHIVES.map((f) => read(root, f))]);
  for (const [l, n] of headerLines) linesAfter.set(l, (linesAfter.get(l) || 0) - n);
  const lost = [...linesBefore].filter(([l, n]) => n > 0 && (linesAfter.get(l) || 0) !== n).length
             + [...linesAfter].filter(([l, n]) => n > 0 && !linesBefore.has(l)).length;
  t("every non-blank LINE of the two live ledgers is in live or archive exactly as often as before", lost, 0);
  const audit1 = L.ledgerAudit({ repo: root });
  t("after the migration, no closed row is live in either ledger", Object.values(audit1.closedLive).flat(), []);
  t("THE AGREEMENT: owed.mjs answers IDENTICALLY for every lane, a nonexistent one included — "
  + "no row the archiver moved was one owed listed (M-57: D-330, D-401, D-405, D-407)", owedSnap(), ob);
  t("...and owed's list is not empty, so the agreement is not two empty lists agreeing", ob[0].length > 0, true);
  const ca = collisions({ repo: root });
  t("mintid's collision register is EXACTLY as before — a pair split into the archive is still one (M-57 breakage 2)",
    ca.found.map((x) => x.id), cb.found.map((x) => x.id));
  /* The copy carries only the ledgers, so a register entry whose sites live elsewhere (IC-30, in
     INTERFACE-CHANGES.md) is stale in BOTH arms; the property is that the move made none stale. */
  t("...and the move made no registered collision stale", ca.stale.map((x) => x.id), cb.stale.map((x) => x.id));
  t("...and the pairs M-57 named are among those still seen (else this is two empty lists agreeing)",
    ["D-124", "CPDF-9", "FW-15", "M0-16"].filter((id) => !ca.found.some((x) => x.id === id)), []);
  t("every moved id is still found, now in the archive", ids.filter((id) => !L.findId(id, { repo: root }).some((f) => f.where === "archive")), []);
  t("the three live `QUEUED <ID>` targets M-57 measured (FW-6, CAP-4) resolve in the archive",
    ["FW-6", "CAP-4"].map((id) => L.archivedQueueIds({ repo: root }).has(id)), [true, true]);
  t("the dependencies of the open rows still all resolve after the migration", audit1.depends.unresolved, []);
  t("DEBT.md stays above nc-m039's 10,000-byte floor", read(root, L.LEDGERS.DEBT.live).length >= L.DEBT_FLOOR_BYTES, true);
}

/* ========================================================================================== */
section("3 — CLOSED IS DEFINED ONCE: a QUEUE row by its `done`/`superseded` state; a DEBT row by "
      + "`owed.mjs`'s isClosedDebtRow, which the archiver imports rather than restates");
{
  const q = Q("C-1", "done") + Q("C-2", "superseded") + Q("C-3", "blocked") + Q("C-4", "queued") + Q("C-5", "running") + ARMS;
  const root = fixture({ queue: q, debt: DEBT([]) });
  t("a `blocked` row is NOT closed and is refused — owed reads blocked headings", code(() => L.archiveId("C-3", { repo: root })), "NOT_CLOSED");
  t("a `queued` row is refused", code(() => L.archiveId("C-4", { repo: root })), "NOT_CLOSED");
  t("a `running` row is refused", code(() => L.archiveId("C-5", { repo: root })), "NOT_CLOSED");
  t("a `superseded` row moves", code(() => L.archiveId("C-2", { repo: root })), "NO REFUSAL");
  t("a `done` row moves", code(() => L.archiveId("C-1", { repo: root })), "NO REFUSAL");

  const closed = [
    "M2 · **CLOSED 2026-09-18 by CPDF-19**: done",
    "closed 2026-09-15 by REC-105 (IC-102)",                      /* lowercase — over-strictness */
    "ACCEPTED · CLOSED 2026-09-11 by CPDF-16 — the fix",
    "DOCTRINE · SKILL · CLOSED 2026-09-14 by SK-8",
    "M4 · CAPTURE · **CLOSED 2026-09-14 by CAP-9**",
    "SUPERSEDED — closed by 0.28.0",
    "fixed 0.5.0",
    "resolved 2026-07-27 by S-9",
  ];
  const open = [
    "open, and its BLOCK IS LIFTED 2026-09-18: CPDF-19 closed D-319",   /* D-376's shape */
    "open — WATCH, no task, and NARROWED rather than closed.",         /* D-242 */
    "M4 - open · carry half CLOSED by FW-17",                           /* D-161 */
    "M1 · DEPLOY HALF CLOSED 2026-09-10, INSTALLER HALF IS open",       /* D-292 */
    "M0 · CLOSED IN PART — the rest is routed",
    "M0 · open — the one live instance is CLOSED by M0-22",             /* D-300 */
    "ACCEPTED — tolerable, reasoning in the row",
    /* M-57's four: each reads resolved/fixed/cleared and still declares a residue, and the August
       definition (*the cell lacks `open`*) would have moved every one off the owed list. */
    "M0 · resolved 2026-09-17 — OUTSTANDING: the second half",
    "M3 · FIXED 2026-09-17 — RESIDUE, NAMED: the undriven arm",
    "M0 · CLOSED 2026-09-17 — STILL OPEN: the plane half",
    "M1 · cleared — RESIDUE, STATED: one site remains",
  ];
  t("every CLOSED spelling reads closed", closed.filter((d) => !isClosedDebtRow(d)), []);
  t("every OPEN spelling — including CLOSED mentioned mid-sentence, and a residue on a resolved row — reads open",
    open.filter((d) => isClosedDebtRow(d)), []);
  t("THE AUGUST DEFINITION IS WRONG, shown on the same inputs: 'lacks `open`' calls residue rows closed",
    open.slice(7).filter((d) => !/\bopen\b/i.test(d)).length > 0, true);

  const pipeRow = "| D-9 | gap | 2026-09-18 | a body quoting `a|b` with a pipe | M1 · **CLOSED 2026-09-18** |";
  t("the DISPOSITION IS THE LAST CELL, even with a pipe in the body (owed read cells[5] until LED-2)",
    debtDisposition(pipeRow), "M1 · **CLOSED 2026-09-18**");
  const residuePipe = "| D-8 | gap | 2026-09-18 | body `x|y` | M0 · open — STILL OPEN: half |";
  const o = owedFor("ZZZNOTALANE", { reader: (p) => (p.endsWith("DEBT.md") ? DEBT([pipeRow, residuePipe]) : "") });
  t("...so owed now SEES a residue on a row with a pipe in its body, and skips the closed one", o.items.map((i) => i.id), ["D-8"]);

  /* MOVED 2026-09-22 by M0-110 (BOB #28's ruling 2), NOT DROPPED: the agreement over the REAL live DEBT.md — its
     non-vacuity floor, "no real DEBT row declaring a residue reads closed" and "no row owed lists for ANY lane is one
     the archiver would move" — judged the LIVE rows, which live on the branch `coord` after the cutover, where no
     `main` gate record settles them. They are `tools/coord.mjs`' ledger check LC-debt-agreement, which every coord
     write runs before it pushes and `plancheck` runs against the coord view; `coord.test.mjs` §8 drives its floor
     both ways, and `debt-floor.control.mjs` was re-pointed there. What stays here is the rule's BEHAVIOUR, above, on
     fixtures. M0-109's record below is the history of these assertions at their old site. */
  const rows = [];
  /* CORRECTED 2026-09-22 by M0-109, not exempted: this floor read `rows.length > 100`, which measured the ledger's SIZE
     where the arm needs only its NON-VACUITY. LED-7's fold drains DEBT.md ON PURPOSE (WORK-PIPELINE.md §3: every open
     row leaves by one of three doors, and the file is archived whole once empty), so the old floor turned the fold's
     own progress into a red gate: at 99 rows a DOCS gate failed on this line alone, and on `main` every lane's would
     have (recorded on M0-109's row). One row is enough for the two assertions below to judge something; ZERO rows is
     the vacuous case and still FAILS HERE BY NAME, and that failure is the signal the fold's last act is owed: when
     LED-7 archives DEBT.md whole, this arm reads the ARCHIVE instead, re-pointed in that same landing — never deleted.
     Deleting this line is how a liar passes an empty ledger: no other assertion in this suite sees one (arm LL of the
     M0-109 control, declared at the head of this file). */
  const C = await import("../../tools/coord.mjs");
  const src = readFileSync(join(REPO, "tools/coord.mjs"), "utf8");
  t("the live agreement is a ledger check now — LC-debt-agreement is an arm of coord.mjs, with its floor, reading owed for every lane",
    [/await arm\("LC-debt-agreement"/.test(src), /if \(!rows\.length\) return \{ fails:/.test(src), /\["BOB", "CONDUCT", "DIST", "ZZZNOTALANE"\]/.test(src), typeof C.ledgerChecks],
    [true, true, true, "function"]);
}

/* ========================================================================================== */
section("4 — REFUSALS: nothing written when the move is not a move");
{
  const small = "# DEBT\n| D-1 | gap | 2026-09-18 | b | CLOSED 2026-09-18 |\n| D-2 | gap | 2026-09-18 | b | M0 · open |\n";
  const root = fixture({ queue: Q("E-1", "done") + ARMS, debt: small });
  t("DEBT.md may not fall below nc-m039's 10,000-byte floor", code(() => L.archiveId("D-1", { repo: root })), "DEBT_BELOW_FLOOR");
  t("...and nothing was written", [read(root, "docs/development/DEBT.md"), existsSync(join(root, "docs/archive/ledgers/DEBT-closed.md"))], [small, false]);
  t("an id that is nowhere is refused", code(() => L.archiveId("E-99", { repo: root })), "NOT_LIVE");
  t("archive E-1 was not refused", mv("E-1", { repo: root }).refusal, undefined);
  t("an id already archived is refused, and says where", code(() => L.archiveId("E-1", { repo: root })), "ALREADY_ARCHIVED");
  const dry = fixture({ queue: Q("E-2", "done") + ARMS, debt: DEBT([]) });
  const before = read(dry, "docs/development/QUEUE.md");
  const r = mv("E-2", { repo: dry, dryRun: true });
  t("--dry-run plans the move and writes nothing", [r.results[0].moved.length, read(dry, "docs/development/QUEUE.md") === before,
    existsSync(join(dry, "docs/archive/ledgers/QUEUE-closed.md"))], [1, true, false]);
}

/* ========================================================================================== */
section("5 — AN ID IN BOTH LEDGERS, AND AN ID CARRIED TWICE: every closed row moves, every open one stays, "
      + "and mintid still sees the pair (M-57 breakage 2)");
{
  const debt = DEBT(["| D-7 | gap | 2026-09-18 | first | M1 · CLOSED 2026-09-18 |",
                     "| D-7 | gap | 2026-09-18 | second, a registered-collision shape | M1 · open |"]);
  const root = fixture({ queue: Q("D-7", "done") + ARMS, debt });
  const r = mv("D-7", { repo: root });
  t("archive D-7 was not refused", r.refusal, undefined);
  t("a `D-n` QUEUE item AND the closed D-n DEBT row both move", r.moved.map((m) => m.ledger).sort(), ["DEBT", "QUEUE"]);
  t("the OPEN D-7 DEBT row stays live, and is reported as kept", r.kept.map((k) => `${k.ledger} ${k.state}`), ["DEBT open"]);
  const a = allocations("D", { repo: root });
  t("mintid's duplicate check still sees D-7 twice — once live, once in the archive",
    (a.duplicates.find((d) => d.id === "D-7") || { at: [] }).at.map((s) => s.replace(/:\d+$/, "")).sort(),
    ["docs/archive/ledgers/DEBT-closed.md", "docs/development/DEBT.md"]);
}

/* ========================================================================================== */
section("6 — FINDABLE BY ID IN ONE STEP (M-57 breakage 3): the lookup reads the archive, the August roll included");
{
  const root = fixture({ queue: Q("F-1", "done") + Q("F-2", "queued") + ARMS, debt: DEBT([]),
                         archives: { "QUEUE-2026-08.md": "# Aug\n\n" + Q("F-0", "done") } });
  t("archive F-1 was not refused", mv("F-1", { repo: root }).refusal, undefined);
  t("find F-1 answers the new archive", L.findId("F-1", { repo: root }).map((f) => `${f.where} ${f.file} ${f.state}`),
    ["archive docs/archive/ledgers/QUEUE-closed.md done"]);
  t("find F-0 answers the August roll", L.findId("F-0", { repo: root }).map((f) => f.file), ["docs/archive/ledgers/QUEUE-2026-08.md"]);
  t("archivedQueueIds carries both, and not the live open row", [...L.archivedQueueIds({ repo: root })].sort(), ["F-0", "F-1"]);
}

/* ========================================================================================== */
section("7 — THE GATE'S THREE ARMS, on fixtures: (a) closed-live, (b) budget, (c) depends-on");
{
  const status = { constructs: [{ n: 2, claims: [{ id: "2.capture", state: "BUILT" }, { id: "2.firsthand", state: "ABSENT" }] }] };
  const plan = "| VF-4 | a track row of the closed build plan |\n";
  const dep = (id, v, state = "queued") => `### ${id} · ${state} — a row\ndepends-on: ${v}\nscope: s\n\n`;
  const queue = Q("G-1", "done") + Q("G-2", "superseded") + Q("G-3", "queued")
    + dep("H-1", "G-3") + dep("H-2", "G-1 (landed — the ground)") + dep("H-3", "none (G-1 landed)")
    + dep("H-4", "G-99") + dep("H-5", "G-2") + dep("H-6", "a published registry (unbuilt). Not schedulable")
    + dep("H-7", "2.capture") + dep("H-8", "2.firsthand") + dep("H-9", "9.nothing") + dep("H-10", "VF-4 (landed)")
    + dep("H-11", "G-3, G-1") + dep("H-12", "G-99", "done") + dep("H-13", "G-0 (archived)")
    + `### H-14 · queued — oversized\nscope: ${"x".repeat(3200)}\n\n` + ARMS;
  const root = fixture({ queue, debt: DEBT(["| D-1 | gap | 2026-09-18 | b | CLOSED 2026-09-18 |"]), status, plan,
                         archives: { "QUEUE-closed.md": L.ARCHIVE_HEADER.QUEUE + Q("G-0", "done") } });
  const a = L.ledgerAudit({ repo: root });
  t("(a) names every closed row in each live ledger", [a.closedLive.QUEUE.sort(), a.closedLive.DEBT], [["G-1", "G-2", "H-12"], ["D-1"]]);
  /* CORRECTED 2026-09-18 by LED-6: (b) was armed by LED-4, which is SUPERSEDED and so could never arm. The
     arming is now LED-3 for (a) and P2, LED-6 for the pipeline arms P3–P5, LED-7 for DEBT's row budget. */
  t("(a), the pipeline arms and DEBT's budget are NOT armed while LED-3 / LED-6 / LED-7 are queued — they WARN",
    a.armed, { closedLive: false, pipeline: false, debtBudget: false });
  t("(c) the unresolved dependencies, each named with why",
    a.depends.unresolved.map((u) => `${u.id}->${u.dep}`), ["H-4->G-99", "H-5->G-2", "H-8->2.firsthand", "H-9->9.nothing"]);
  t("(c) an open row, a done row (live or ARCHIVED), a BUILT claim, a closed plan row and a list all resolve",
    ["H-1", "H-2", "H-7", "H-10", "H-11", "H-13"].filter((id) => a.depends.unresolved.some((u) => u.id === id)), []);
  t("(c) `none (…)` names no dependency, and a CLOSED row's depends-on is not judged (H-12)",
    a.depends.unresolved.filter((u) => ["H-3", "H-12"].includes(u.id)), []);
  t("(c) a dependency naming no id is PROSE — printed, not scored", a.depends.prose.map((p) => p.id), ["H-6"]);
  t("(b) an open row over 3 KiB is named, with its size", a.budget.rowsOver.map((r) => r.id), ["H-14"]);
  /* CORRECTED 2026-09-18 by LED-6 (WORK-PIPELINE §1, §4): the cache's budget is 40 KiB and the old 150 KiB
     figure moved to the BACKLOG. The 100 KiB case is the one that tells the two budgets apart. */
  t("(b) a small QUEUE is under its 40 KiB budget", a.budget.ledgers.find((x) => x.ledger === "QUEUE").over, false);
  const big = fixture({ queue: Q("I-1", "queued") + "prose\n".repeat(26000) + ARMS, debt: DEBT([]) });
  t("(b) a QUEUE over 150 KiB is over budget", L.ledgerAudit({ repo: big }).budget.ledgers.find((x) => x.ledger === "QUEUE").over, true);
  const mid = fixture({ queue: Q("I-2", "queued") + "prose\n".repeat(17000) + ARMS, backlog: Q("I-3", "queued") + "prose\n".repeat(17000), debt: DEBT([]) });
  const midA = L.ledgerAudit({ repo: mid }).budget.ledgers;
  t("(b) a ~100 KiB QUEUE is OVER the cache's 40 KiB, and a ~100 KiB BACKLOG is UNDER its 150 KiB",
    [midA.find((x) => x.ledger === "QUEUE").over, midA.find((x) => x.ledger === "BACKLOG").over], [true, false]);

  const armedRoot = fixture({ queue: Q("J-1", "done") + Q("LED-4", "queued"), debt: DEBT([]),
                              archives: { "QUEUE-closed.md": L.ARCHIVE_HEADER.QUEUE + Q("LED-3", "done") } });
  t("(a) ARMS once LED-3 is done — read from the ARCHIVE, where a done row will live", L.ledgerAudit({ repo: armedRoot }).armed.closedLive, true);
  const noArm = fixture({ queue: Q("J-2", "done"), debt: DEBT([]) });
  t("an arming row that exists nowhere is REPORTED, not silently left unarmed", L.ledgerAudit({ repo: noArm }).arming.closedLive.found, false);
}

/* ========================================================================================== */
section("8 — THROUGH THE GATE ITSELF: `plancheck --local` runs the three arms on the real tree");
{
  const r = spawnSync(process.execPath, [join(REPO, "tools/plancheck.mjs"), "--local"], { cwd: REPO, encoding: "utf8" });
  const out = r.stdout || "";
  t("plancheck reached its report", /plancheck: \d+ fail, \d+ warn/.test(out), true);
  t("it printed the depends-on arm's own note", /note\s+depends-on: \d+ dependency id\(s\) checked/.test(out), true);
  t("it printed the ledger size note", /note\s+ledger sizes: QUEUE \d+ B/.test(out), true);
  t("no LEDGER arm failed to load or arm", /LEDGER GATE UNLOADABLE|LEDGER ARM CANNOT ARM/.test(out), false);
  /* MOVED 2026-09-22 by M0-110 (BOB #28's ruling 2): "no depends-on is unresolved on the real tree", "P1 and P2 do
     not fire on the real ledgers" and "no arming row is superseded" judged the LIVE rows, which are on `coord` after
     the cutover. They are `coord.mjs`' ledger check LC-ledger (every coord write runs it before the push; plancheck
     runs the same arms, §2h). This section keeps what it is FOR: the gate RUNS the arms and prints their notes. */
  /* LED-6 */
  /* CORRECTED 2026-09-22 by M0-119: the note now counts the backlog's TAIL too (and says when its file is absent). */
  t("it printed the pipeline note, all five invariants named",
    /note\s+pipeline: cache \d+ row\(s\), backlog \d+ row\(s\), tail \d+ row\(s\)[^;\n]*; P1 \w+, P2 \w+, P3 \w+, P4 \w+, P5 \w+/.test(out), true);

}

/* ========================================================================================== */
section("9 — LED-6: THE BACKLOG IS A SECOND LIVE FILE OF THE QUEUE GRAMMAR — `find` answers an id in the cache, "
      + "the backlog or the archive; a closed backlog row archives to the SAME archive; mintid reads the backlog");
{
  const root = fixture({
    queue: Q("F-1", "queued") + Q("REC-7", "queued") + ARMS,
    backlog: "# Backlog\n\n## Rows\n\n" + Q("F-2", "queued") + Q("F-3", "superseded") + Q("REC-7", "queued") + Q("D-9", "queued"),
    debt: DEBT(["| D-9 | gap | 2026-09-18 | a body | M1 · open |"]),
    archives: { "QUEUE-closed.md": L.ARCHIVE_HEADER.QUEUE + Q("F-0", "done") } });
  const where = (id) => L.findId(id, { repo: root }).map((f) => `${f.where} ${f.file} ${f.state}`);
  t("find F-1 answers the CACHE", where("F-1"), ["cache docs/development/QUEUE.md queued"]);
  t("find F-2 answers the BACKLOG", where("F-2"), ["backlog docs/development/BACKLOG.md queued"]);
  t("find F-0 answers the ARCHIVE — ONCE, though two ledgers share that archive file", where("F-0"),
    ["archive docs/archive/ledgers/QUEUE-closed.md done"]);
  t("find D-9 answers the backlog row AND the live DEBT row", where("D-9").sort(),
    ["backlog docs/development/BACKLOG.md queued", "live docs/development/DEBT.md open"]);
  t("find answers nothing for an id that is nowhere", L.findId("F-99", { repo: root }), []);
  t("ARCHIVE_TARGETS lists each archive file ONCE (mintid reads it; a repeat would be a false duplicate)",
    L.ARCHIVE_TARGETS.length, new Set(L.ARCHIVE_TARGETS).size);
  const r = mv("F-3", { repo: root });
  t("archive F-3 (superseded, in the BACKLOG) was not refused", r.refusal, undefined);
  t("...it moved from the backlog", r.moved.map((m) => m.ledger), ["BACKLOG"]);
  t("...into the QUEUE archive", read(root, "docs/archive/ledgers/QUEUE-closed.md").includes("### F-3 · superseded"), true);
  t("...and left the backlog", read(root, L.LEDGERS.BACKLOG.live).includes("F-3"), false);
  t("find F-3 now answers the archive", where("F-3"), ["archive docs/archive/ledgers/QUEUE-closed.md superseded"]);
  t("an OPEN backlog row is refused, as an open cache row is", code(() => L.archiveId("F-2", { repo: root })), "NOT_CLOSED");
  const dup = allocations("REC", { repo: root }).duplicates.find((d) => d.id === "REC-7") || { at: [] };
  t("mintid's duplicate check READS THE BACKLOG — REC-7 in the cache and the backlog is seen twice",
    dup.at.map((s) => s.replace(/:\d+$/, "")).sort(), ["docs/development/BACKLOG.md", "docs/development/QUEUE.md"]);
  const nob = fixture({ queue: Q("F-4", "done") + ARMS, backlog: null, debt: DEBT([]) });
  t("a MISSING backlog refuses the archiver outright — an unreadable ledger is not an empty one",
    code(() => L.archiveId("F-4", { repo: nob })), "LEDGER_UNREADABLE");
  t("...and ledgerAudit names it unreadable and scores no pipeline", [L.ledgerAudit({ repo: nob }).unreadable, L.ledgerAudit({ repo: nob }).pipeline],
    [["docs/development/BACKLOG.md"], null]);
}

/* ========================================================================================== */
section("10 — LED-6: `refill` moves the next RUNNABLE rows from the TOP of the backlog into the cache, DELETES "
      + "them from the backlog, and conserves cache ∪ backlog ∪ archive — read back from disk");
{
  const dep = (id, state, v, extra = "") => `### ${id} · ${state} — a row\ndepends-on: ${v}\nscope: s${extra}\n\n`;
  const cacheText = "# The work queue\n\n## BOB INBOX\n\ninbox prose\n\n## ROWS\n\n"
    + dep("R-1", "running", "none") + dep("R-2", "queued", "X-1")
    + "## TAIL — a non-row block after the rows\n\ntail prose\n";
  const backlogText = "# Backlog\n\n## Rows\n\n"
    + dep("B-1", "queued", "none") + dep("B-2", "blocked", "none") + dep("B-3", "queued", "B-1")
    + dep("B-4", "queued", "X-1 (landed)") + dep("B-5", "queued", "the next plane deploy") + dep("B-6", "queued", "2.capture")
    + dep("B-7", "done", "none") + dep("B-8", "queued", "X-2") + dep("R-2", "queued", "none")
    + dep("B-9", "queued", "none", "\n#### a sub-heading the row carries") + dep("B-10", "queued", "none")
    + "### B-11 · queued — the last row, no trailing newline\ndepends-on: none\nscope: s";
  const status = { constructs: [{ n: 2, claims: [{ id: "2.capture", state: "BUILT" }] }] };
  const archives = { "QUEUE-closed.md": L.ARCHIVE_HEADER.QUEUE + Q("X-1", "done") + Q("X-2", "superseded") };
  const mk = () => fixture({ queue: cacheText, backlog: backlogText, debt: DEBT([]), status, archives });
  const all = (root) => ({ c: read(root, L.LEDGERS.QUEUE.live), b: read(root, L.LEDGERS.BACKLOG.live),
                           a: read(root, "docs/archive/ledgers/QUEUE-closed.md") });
  const ids = (text) => L.queueRows(text).map((r) => r.id);
  const rf = (opts) => { try { return L.refill(opts); } catch (e) { return { moved: [], skipped: [], refusal: `${e.code}: ${e.message}` }; } };

  const root = mk();
  const before = all(root);
  const r = rf({ repo: root, cacheRows: 6 });
  const after = all(root);
  t("refill was not refused (a refusal here names what did not conserve)", r.refusal, undefined);
  t("it moved the runnable rows from the TOP, in backlog order, until the cache held 6", r.moved.map((m) => m.id), ["B-1", "B-4", "B-6", "B-9"]);
  t("...a `blocked` row is skipped, never moved", (r.skipped.find((s) => s.id === "B-2") || {}).why?.startsWith("`blocked` — skipped, never moved"), true);
  t("...a row waiting on an OPEN row (B-1, moved this very refill) is not runnable", /B-1 is still open/.test((r.skipped.find((s) => s.id === "B-3") || {}).why), true);
  t("...a depends-on naming no id is UNDETERMINED and not moved", /UNDETERMINED/.test((r.skipped.find((s) => s.id === "B-5") || {}).why), true);
  t("...a closed row is never moved", /a closed row is never moved/.test((r.skipped.find((s) => s.id === "B-7") || {}).why), true);
  t("...a dependency on a SUPERSEDED row is not met", /X-2 is `superseded`, not done/.test((r.skipped.find((s) => s.id === "B-8") || {}).why), true);
  t("...an id already open in the cache is not moved again (P1)", /already open in the cache/.test((r.skipped.find((s) => s.id === "R-2") || {}).why), true);
  t("...and nothing BELOW the fill point was examined", r.skipped.some((s) => ["B-10", "B-11"].includes(s.id)), false);
  t("the cache holds its rows, then the moved rows in order, BEFORE the non-row block that followed its last row",
    ids(after.c), ["R-1", "R-2", "B-1", "B-4", "B-6", "B-9"]);
  t("...the TAIL block still follows the rows, and the inbox still precedes them",
    [after.c.indexOf("## TAIL") > after.c.indexOf("### B-9"), after.c.indexOf("## BOB INBOX") < after.c.indexOf("### R-1")], [true, true]);
  t("...each moved row arrived VERBATIM, a level-4 heading inside it carried with it",
    after.c.includes("### B-9 · queued — a row\ndepends-on: none\nscope: s\n#### a sub-heading the row carries\n"), true);
  t("the backlog lost EXACTLY the moved rows", ids(after.b), ["B-2", "B-3", "B-5", "B-7", "B-8", "R-2", "B-10", "B-11"]);
  t("...and its non-row header is untouched", after.b.startsWith("# Backlog\n\n## Rows\n\n### B-2"), true);
  t("the archive was not touched", after.a, before.a);
  t("the id multiset of cache ∪ backlog ∪ archive is IDENTICAL, read back from disk",
    L.conservation(L.idCounts(L.LEDGERS.QUEUE, [before.c, before.b, before.a]), L.idCounts(L.LEDGERS.QUEUE, [after.c, after.b, after.a])),
    { ok: true, dropped: [], gained: [] });
  t("every non-blank line of cache ∪ backlog is where it was or moved, exactly once",
    [...new Set([...before.c.split("\n"), ...before.b.split("\n")])].filter((l) => l.trim()).filter((l) =>
      (before.c + "\n" + before.b).split("\n").filter((x) => x === l).length !== (after.c + "\n" + after.b).split("\n").filter((x) => x === l).length), []);

  const r2 = rf({ repo: root });
  const after2 = all(root);
  t("a second refill (to the default 8) moves the next two runnable rows, the last one at EOF with no newline",
    r2.moved.map((m) => m.id), ["B-10", "B-11"]);
  t("...B-3 is still not runnable while B-1 is open in the cache", r2.skipped.some((s) => s.id === "B-3"), true);
  t("...the cache now holds 8 rows, in order", ids(after2.c), ["R-1", "R-2", "B-1", "B-4", "B-6", "B-9", "B-10", "B-11"]);
  t("...and the row that had no trailing newline is separated from the TAIL block", after2.c.includes("scope: s\n\n## TAIL"), true);
  const r3 = rf({ repo: root });
  t("a full cache moves nothing and writes nothing", [r3.moved.length, r3.room, all(root).c === after2.c, all(root).b === after2.b], [0, 0, true, true]);

  const dry = mk();
  const dr = rf({ repo: dry, dryRun: true });
  t("--dry-run plans the same move and writes NOTHING", [dr.moved.map((m) => m.id).length, all(dry).c === cacheText, all(dry).b === backlogText], [6, true, true]);
  const empty = fixture({ queue: "# The work queue\n\ninbox only\n", backlog: dep("E-1", "queued", "none"), debt: DEBT([]) });
  const er = rf({ repo: empty });
  t("into a cache holding NO row, a refill appends at the end", [er.moved.map((m) => m.id), ids(read(empty, L.LEDGERS.QUEUE.live))], [["E-1"], ["E-1"]]);
  const nob = fixture({ queue: cacheText, backlog: null, debt: DEBT([]) });
  t("a missing backlog is REFUSED, nothing written", [/LEDGER_UNREADABLE/.test(rf({ repo: nob }).refusal || ""), read(nob, L.LEDGERS.QUEUE.live) === cacheText], [true, true]);

  /* THE LIARS, handed to the conservation judge directly: each must be refused. */
  const sel = L.selectRefill(cacheText, backlogText, { repo: mk(), claims: [{ id: "2.capture", state: "BUILT" }], cacheRows: 6 });
  const good = L.planRefill(cacheText, backlogText, sel.take);
  const judge = (nc, nb) => L.refillConserved({ cache: cacheText, backlog: backlogText, archives: [archives["QUEUE-closed.md"]], newCache: nc, newBacklog: nb, take: sel.take });
  t("the correct plan conserves", judge(good.newCache, good.newBacklog).ok, true);
  const b1 = "### B-1 · queued — a row\ndepends-on: none\nscope: s\n\n";
  t("a DROPPED row (gone from both files) is refused, naming it", judge(good.newCache.replace(b1, ""), good.newBacklog).ids.dropped, ["B-1 (1 -> 0)"]);
  t("a DUPLICATED row (moved AND left behind) is refused, naming it", judge(good.newCache, backlogText).ids.gained.includes("B-4 (1 -> 2)"), true);
  const extra = good.newBacklog.replace("## Rows\n", "");
  t("a mover that also carried a NON-ROW line out of the backlog is refused by the line check though every id conserves",
    [judge(good.newCache + "## Rows\n", extra).ok, judge(good.newCache + "## Rows\n", extra).ids.ok], [false, true]);
}

/* ========================================================================================== */
section("11 — LED-6: THE FIVE INVARIANTS (WORK-PIPELINE §2), each with a PLANTED violation it must catch and a "
      + "clean pipeline it must pass");
{
  const dep = (id, state, v, pad = "") => `### ${id} · ${state} — a row\ndepends-on: ${v}\nscope: s${pad}\n\n`;
  const archives = { "QUEUE-closed.md": L.ARCHIVE_HEADER.QUEUE + Q("X-1", "done") + Q("X-2", "superseded") };
  const status = { constructs: [{ n: 2, claims: [{ id: "2.capture", state: "BUILT" }] }] };
  const claims = [{ id: "2.capture", state: "BUILT" }];
  /* THE TEXTS ARE WRITTEN INTO THE REPOSITORY THE DEPENDENCY LOOKUP READS. The first version judged texts
     held in memory against a fixture holding neither of them, so a dependency on an OPEN backlog row was
     unmet because the row was NOWHERE — and arm P4 (open counted as met) left the assertion green: the
     arm fired at the wrong thing. Caught by the control's first run; this is the fix. */
  const inv = (cache, backlog) => L.pipelineInvariants(cache, backlog,
    { repo: fixture({ queue: cache, backlog, debt: DEBT([]), archives, status }), claims });
  const v = (res, k) => res.arms[k].violations;
  const cleanCache = dep("R-1", "running", "none") + dep("R-2", "queued", "X-1 (landed)") + dep("R-3", "queued", "2.capture");
  const cleanBacklog = dep("B-1", "queued", "R-2") + dep("B-2", "blocked", "none");
  const clean = inv(cleanCache, cleanBacklog);
  t("a CLEAN pipeline passes all five", Object.fromEntries(Object.entries(clean.arms).map(([k, x]) => [k, x.violations.length])),
    { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0 });
  t("...and the clean fixture is not empty (a headline over nothing has passed three times)", [clean.cacheRows, clean.backlogRows], [3, 2]);

  /* CORRECTED 2026-09-22 by M0-119: P1 counts an open id across THREE files — the cache, the backlog and its tail — so
     each violation carries the tail's count; the two-key shape could not say an id sat in the tail too. */
  t("P1 CATCHES an open id twice in the backlog", v(inv(cleanCache, cleanBacklog + dep("B-1", "queued", "none")), "P1"),
    [{ id: "B-1", cache: 0, backlog: 2, tail: 0 }]);
  t("P1 CATCHES an open id in BOTH files", v(inv(cleanCache, cleanBacklog + dep("R-3", "queued", "none")), "P1"),
    [{ id: "R-3", cache: 1, backlog: 1, tail: 0 }]);
  t("P2 CATCHES a closed row in the backlog AND one in the cache",
    v(inv(cleanCache + dep("R-9", "superseded", "none"), cleanBacklog + dep("B-9", "done", "none")), "P2").map((x) => `${x.where} ${x.id}`),
    ["cache R-9", "backlog B-9"]);
  const nine = Array.from({ length: 9 }, (_, i) => dep(`N-${i}`, "queued", "none")).join("");
  t("P3 CATCHES a cache of 9 rows", v(inv(nine, ""), "P3"), [{ what: "rows", rows: 9, max: 8 }]);
  t("...and passes a cache of exactly 8", v(inv(Array.from({ length: 8 }, (_, i) => dep(`N-${i}`, "queued", "none")).join(""), ""), "P3"), []);
  t("P3 CATCHES a `blocked` row in the cache", v(inv(cleanCache + dep("R-4", "blocked", "none"), ""), "P3").map((x) => x.id), ["R-4"]);
  const p4 = v(inv(cleanCache + dep("R-5", "queued", "B-1") + dep("R-6", "queued", "the next deploy") + dep("R-7", "queued", "X-2")
                  + dep("R-8", "queued", "X-99"), cleanBacklog), "P4");
  t("P4 CATCHES a dependency on an OPEN row, a SUPERSEDED row and a row that is NOWHERE",
    p4.filter((x) => x.dep).map((x) => `${x.id}->${x.dep}`), ["R-5->B-1", "R-7->X-2", "R-8->X-99"]);
  t("P4 names a depends-on in PROSE as UNDETERMINED rather than met", p4.filter((x) => x.undetermined).map((x) => x.id), ["R-6"]);
  t("...and R-5 is unmet because B-1 is OPEN — not because B-1 cannot be found", /B-1 is still open/.test((p4.find((x) => x.id === "R-5") || {}).why), true);
  t("P4 (over-strictness) passes a dependency on an ARCHIVED done row and a BUILT claim", p4.filter((x) => ["R-2", "R-3"].includes(x.id)), []);
  const row = (id, n) => `### ${id} · queued — a row\ndepends-on: none\nscope: ${"x".repeat(n)}\n\n`;
  t("P5 CATCHES a backlog row over 2 KiB", v(inv(cleanCache, cleanBacklog + row("B-5", 2600)), "P5").map((x) => x.id), ["B-5"]);
  t("P5 (over-strictness) passes a 2.5 KiB CACHE row — the cache's row budget is 3 KiB", v(inv(cleanCache + row("R-9", 2600), cleanBacklog), "P5"), []);
  t("P5 CATCHES a cache over 40 KiB", v(inv(cleanCache + "## prose, not a row\n" + "prose line\n".repeat(4000), cleanBacklog), "P5").map((x) => x.file), ["docs/development/QUEUE.md"]);
  t("P5 (over-strictness) passes a 100 KiB backlog — the backlog's budget is 150 KiB",
    v(inv(cleanCache, cleanBacklog + "## prose\n" + "prose line\n".repeat(9000)), "P5"), []);
  const odd = inv(cleanCache + dep("R-10", "parked", "none"), cleanBacklog);
  t("a row whose state is neither open nor closed is listed UNJUDGED, never silently scored", odd.unjudged.map((u) => u.id), ["R-10"]);

  /* Arming, read from the ledger: P1 always; P2 with LED-3; P3–P5 with LED-6.
     CORRECTED 2026-09-22 by M0-119: `.pipeline.arms` THREW when the audit scored no pipeline, ending the module before
     its tally — found by arm T9 (an absent tail read as unreadable), whose suite crashed instead of going red. An
     unscored pipeline now reddens these assertions by name. */
  const arm = (led3, led6) => (L.ledgerAudit({ repo: fixture({ queue: nine, debt: DEBT([]),
    archives: { "QUEUE-closed.md": L.ARCHIVE_HEADER.QUEUE + Q("LED-3", led3) + Q("LED-6", led6) + Q("LED-7", "queued") } }) }).pipeline || { arms: {} }).arms;
  t("before LED-6 is done, P3–P5 WARN (armed false) and P1 is armed", Object.fromEntries(Object.entries(arm("done", "running")).map(([k, x]) => [k, x.armed])),
    { P1: true, P2: true, P3: false, P4: false, P5: false });
  t("once LED-6 is done, every arm is armed", Object.values(arm("done", "done")).every((x) => x.armed), true);
}

/* ========================================================================================== */
section("12 — LED-6 OVER THE REAL LEDGERS: P1 and P2 hold on the cache and backlog as they stand; and a SIMULATED "
      + "split of the real rows (running in the cache, every other open row in the backlog, in order) refills conserving");
{
  /* CORRECTED 2026-09-22 by M0-110 (BOB #28's ruling 2). "P1 holds on the real ledgers" and "P2 holds on the real
     ledgers" judged the LIVE rows, which live on the branch `coord` after the cutover; they are LC-ledger in
     `coord.mjs`' ledger checks now (every coord write runs them before its push). And the simulated split below read
     its input from the WORKING TREE's ledgers, which after the cutover are one-line pointers — so, as §2 already does,
     it now reads the real rows from a PINNED tree: `de40aa56`, the `main` this item was built from (cache 8 rows,
     backlog 117). The subject is unchanged — refill over real rows conserves — and it no longer moves when a lane
     writes to `coord`. A file the pinned tree lacks is skipped, never faked. */
  const STATE_PIN = "de40aa56";
  const pinned = (f) => { const r = spawnSync("git", ["-C", REPO, "show", `${STATE_PIN}:${f}`], { encoding: "utf8", maxBuffer: 1 << 28 }); return r.status === 0 ? r.stdout : null; };
  const pinArchive = (() => { const r = spawnSync("git", ["-C", REPO, "ls-tree", "--name-only", `${STATE_PIN}:${L.ARCHIVE_DIR}`], { encoding: "utf8" });
                              return (r.status === 0 ? r.stdout.split("\n").filter(Boolean) : []).filter((n) => L.LEDGERS.QUEUE.family.test(n)).map((n) => `${L.ARCHIVE_DIR}/${n}`); })();
  const root = mkdtempSync(join(tmpdir(), "ledger-split-"));
  const copy = (f) => { const x = pinned(f); if (x === null) return; mkdirSync(dirname(join(root, f)), { recursive: true }); writeFileSync(join(root, f), x); };
  for (const f of [L.LEDGERS.QUEUE.live, L.LEDGERS.BACKLOG.live, L.LEDGERS.DEBT.live, "docs/archive/IS-BUILD-PLAN.md",
                   "docs/architecture/construct-status.json", ...pinArchive]) copy(f);
  const P = L.ledgerAudit({ repo: root }).pipeline || { cacheRows: 0, backlogRows: 0 };
  console.log(`  pinned pipeline (${STATE_PIN}): cache ${P.cacheRows} row(s), backlog ${P.backlogRows} row(s)`);
  const cache0 = read(root, L.LEDGERS.QUEUE.live), backlog0 = read(root, L.LEDGERS.BACKLOG.live);
  const lines = cache0.split("\n");
  const leave = L.queueRows(cache0).filter((r) => r.open && r.state !== "running");
  /* CORRECTED 2026-09-19 by SCHEDULER at LED-6's migration: this guard required MORE THAN 5 non-running
     rows in the cache, which was true while the cache held the whole plan. The split made it false by
     design — the cache now holds at most 8 rows, the running ones among them, and the rest of the plan
     is in the backlog. The simulation's subject is unchanged (rows leave the cache, refill brings the
     runnable ones back, conserving); what keeps it from being vacuous is that it moves at least ONE row
     and the pipeline it runs over is not small. */
  t("the real cache has non-running open rows to split out, over a pipeline that is not small (else the simulation is vacuous)",
    leave.length > 0 && P.cacheRows + P.backlogRows > 5, true);
  const blocks = leave.map((r) => lines.slice(r.start, r.end).join("\n"));
  const kept = lines.slice();
  for (const r of [...leave].sort((x, y) => y.start - x.start)) kept.splice(r.start, r.end - r.start);
  writeFileSync(join(root, L.LEDGERS.QUEUE.live), kept.join("\n"));
  writeFileSync(join(root, L.LEDGERS.BACKLOG.live), backlog0 + "\n" + blocks.map((b) => b.endsWith("\n") ? b : b + "\n").join(""));
  const archTexts = L.archiveFiles(L.LEDGERS.QUEUE, { repo: root }).map((f) => read(root, f));
  /* CORRECTED 2026-09-22 by M0-119: the refill now rebalances the backlog's split, so a row it demotes lives in the TAIL —
     a count of the cache and the backlog alone would read it as dropped. `read` gives "" for an absent tail. */
  const idsNow = () => L.idCounts(L.LEDGERS.QUEUE, [read(root, L.LEDGERS.QUEUE.live), read(root, L.LEDGERS.BACKLOG.live),
                                                    read(root, L.LEDGERS.LATER.live), ...archTexts]);
  const beforeSplit = L.idCounts(L.LEDGERS.QUEUE, [cache0, backlog0, ...archTexts]);
  t("the hand split itself conserved every id (a check on the simulation, not on the tool)", L.conservation(beforeSplit, idsNow()).ok, true);
  let r;
  try { r = L.refill({ repo: root }); } catch (e) { r = { moved: [], refusal: `${e.code}: ${e.message}` }; }
  console.log(`  refill over the real rows: moved ${r.moved.map((m) => m.id).join(", ") || "none"}; skipped ${(r.skipped || []).length}`);
  t("refill over the REAL rows was not refused", r.refusal, undefined);
  t("...and moved at least one row (else the conservation below is two unchanged files agreeing)", r.moved.length > 0, true);
  t("the id multiset of cache ∪ backlog ∪ archive over the real rows is IDENTICAL after the refill, read back from disk",
    L.conservation(beforeSplit, idsNow()), { ok: true, dropped: [], gained: [] });
  /* CORRECTED 2026-09-22 by M0-119: an unscored pipeline reddens the assertions below instead of throwing (arm T9). */
  const after = L.ledgerAudit({ repo: root }).pipeline
    || { arms: Object.fromEntries(["P1", "P2", "P3", "P4", "P5"].map((k) => [k, { violations: [{ id: "UNSCORED" }] }])) };
  console.log(`  after the simulated split + refill: ` + Object.entries(after.arms).map(([k, x]) => `${k} ${x.violations.length}`).join(", ")
    + ` — P4 and P5 are MEASURED, not asserted: the running rows' depends-on and the uncut rows / non-row blocks are the migration's (§5 steps 2–3)`);
  t("after the split and refill, P1, P2 and P3 hold over the real rows", ["P1", "P2", "P3"].map((k) => after.arms[k].violations.length), [0, 0, 0]);
  t("...and every row the refill moved has its depends-on MET (P4 over the moved rows)",
    after.arms.P4.violations.filter((x) => r.moved.some((m) => m.id === x.id)), []);
}


/* ========================================================================================== */
section("13 — M0-119: THE BACKLOG'S TAIL (WORK-PIPELINE §2, BOB #28) — a placement over budget moves WHOLE rows from "
      + "BACKLOG.md's foot to the head of BACKLOG-LATER.md, cuts none, and leaves every id in exactly one file, in order");
{
  /* Rows of a known size, each with a body that would be LOST by a cut (the fields-only cut kept the heading). */
  const R = (id, n = 300, state = "queued", dep = "none") =>
    `### ${id} · ${state} — a row of the order\ndepends-on: ${dep}\nscope: ${"s".repeat(n)}\naccepts-when: the whole text of ${id}\n\n`;
  const HEAD = "# Backlog\n\n## Rows\n\n";
  const bodyOf = (text, id) => { const r = L.queueRows(text).find((x) => x.id === id); return r ? r.body.replace(/\n+$/, "") : null; };
  const ids = (text) => L.queueRows(text).map((r) => r.id);
  const order = ["O-1", "O-2", "O-3", "O-4", "O-5", "O-6", "O-7", "O-8"];
  const backlog = HEAD + order.map((id) => R(id)).join("");
  const budget = 2000;   /* the fixture's budget: ~5 rows fit (the real one is BUDGET.BACKLOG.ledger, 150 KiB) */
  t("the fixture backlog is OVER the fixture budget (else nothing is exercised)", Buffer.byteLength(backlog) > budget, true);
  t("the real budget is back at 150 KiB (the interim 200 KiB retired by this item)", L.BUDGET.BACKLOG.ledger, 150 * 1024);
  t("...and the tail has no whole-file budget and a backlog row's 2 KiB row budget", [L.BUDGET.LATER.ledger, L.BUDGET.LATER.row], [null, 2048]);

  const p = L.planRebalance(backlog, "", { budget });
  t("THE ACCEPTANCE — every id is in EXACTLY ONE file", (() => {
    const all = [...ids(p.newBacklog), ...ids(p.newLater)];
    return [all.length, new Set(all).size, order.every((id) => all.includes(id))];
  })(), [8, 8, true]);
  t("...IN ORDER: the backlog then the tail read as the ORIGINAL order", [...ids(p.newBacklog), ...ids(p.newLater)], order);
  t("...the TAIL moved (the backlog's foot), never the head", [ids(p.newBacklog)[0], p.demoted[p.demoted.length - 1]], ["O-1", "O-8"]);
  t("...NO ROW IS CUT: every row's whole text is in one of the two files, verbatim",
    order.filter((id) => (bodyOf(p.newBacklog, id) ?? bodyOf(p.newLater, id)) !== bodyOf(backlog, id)), []);
  t("...BACKLOG.md is within the budget after the placement", Buffer.byteLength(p.newBacklog) <= budget, true);
  t("...and holds the LONGEST head that fits: the tail's first row would not fit beside it",
    [L.rebalanceConserved({ backlog, later: "", newBacklog: p.newBacklog, newLater: p.newLater, budget }).split,
     Buffer.byteLength(p.newBacklog) + Buffer.byteLength(R(p.demoted[0])) > budget], [true, true]);
  t("...an absent tail gains its header, and the demoted rows follow it", [p.newLater.startsWith(L.LATER_HEADER), ids(p.newLater)], [true, p.demoted]);
  t("...the plan conserves by the judge's own five properties",
    L.rebalanceConserved({ backlog, later: "", newBacklog: p.newBacklog, newLater: p.newLater, budget }).ok, true);

  /* A SECOND placement: the rows demoted now go to the HEAD of the existing tail, AHEAD of what it already holds. */
  const placed = p.newBacklog.replace("### O-1 ·", R("P-1").replace(/\n\n$/, "\n\n") + "### O-1 ·");
  const p2 = L.planRebalance(placed, p.newLater, { budget });
  t("a second placement (P-1 at the TOP) pushes the backlog's new foot to the HEAD of the tail, the order intact",
    [...ids(p2.newBacklog), ...ids(p2.newLater)], ["P-1", ...order]);
  t("...the newly demoted row precedes every row the tail already held", ids(p2.newLater)[0], ids(p.newBacklog).slice(-1)[0]);

  /* PROMOTION: room frees (a refill or an archive took rows out), and the tail's head comes back, in order. */
  const freed = p.newBacklog.replace(R("O-1"), "").replace(R("O-2"), "");
  const p3 = L.planRebalance(freed, p.newLater, { budget });
  t("as room frees, rows are PROMOTED from the tail's head to the backlog's foot, in order",
    [p3.promoted.length > 0, [...ids(p3.newBacklog), ...ids(p3.newLater)]], [true, order.slice(2)]);
  t("...and the split sits at the budget again", L.rebalanceConserved({ backlog: freed, later: p.newLater, newBacklog: p3.newBacklog, newLater: p3.newLater, budget }).ok, true);
  const idle = L.planRebalance(p.newBacklog, p.newLater, { budget });
  t("a balanced pair is left EXACTLY as it is (a rebalance is idempotent)", [idle.newBacklog === p.newBacklog, idle.newLater === p.newLater, idle.demoted, idle.promoted], [true, true, [], []]);

  /* THE LIARS, handed to the judge directly: each must be refused. */
  const J = (nb, nl) => L.rebalanceConserved({ backlog, later: "", newBacklog: nb, newLater: nl, budget });
  const lost = p.demoted[0];
  t("a rebalance that DROPS a demoted row is refused, naming it", J(p.newBacklog, p.newLater.replace(R(lost), "")).ids.dropped, [`${lost} (1 -> 0)`]);
  const [a, b] = [p.demoted[0], p.demoted[1]];
  const swapped = p.newLater.replace(R(a), "@@A").replace(R(b), R(a)).replace("@@A", R(b));
  t("a rebalance that REORDERS the tail is refused though every id and line conserves",
    [J(p.newBacklog, swapped).ok, J(p.newBacklog, swapped).ids.ok, J(p.newBacklog, swapped).orderOk], [false, true, false]);
  const cut = p.newLater.replace(`accepts-when: the whole text of ${a}\n`, "");
  t("a rebalance that CUTS a row to fit is refused", [J(p.newBacklog, cut).ok, J(p.newBacklog, cut).rowsOff.length > 0], [false, true]);
  t("a rebalance that leaves BACKLOG.md over budget is refused", J(backlog, "").ok, false);
  const early = L.planRebalance(backlog, "", { budget: budget - 400 });
  t("a rebalance that stops EARLY (a row that fits is left in the tail) is refused",
    L.rebalanceConserved({ backlog, later: "", newBacklog: early.newBacklog, newLater: early.newLater, budget }).split, false);

  /* ON DISK, through the tool: `rebalance` writes both files, judges what it READS BACK, and the readers see one order. */
  const root = fixture({ queue: "# The work queue\n\n## ROWS\n\n" + ARMS, backlog, debt: DEBT([]) });
  let r; try { r = L.rebalance({ repo: root, budget }); } catch (e) { r = { refusal: `${e.code}: ${e.message}` }; }
  t("rebalance on disk was not refused", r.refusal, undefined);
  t("...it demoted the foot and wrote the tail file", [r.demoted, existsSync(join(root, L.LEDGERS.LATER.live))], [p.demoted, true]);
  const onDisk = [...ids(read(root, L.LEDGERS.BACKLOG.live)), ...ids(read(root, L.LEDGERS.LATER.live))];
  t("...what it READ BACK is the one order", onDisk, order);
  t("find answers a demoted id in the TAIL", L.findId(p.demoted[0], { repo: root }).map((f) => `${f.where} ${f.file}`), [`tail ${L.LEDGERS.LATER.live}`]);
  const pr = L.pipelineRows({ repo: root });
  t("the lister reads the tail after the backlog, one order", pr.rows.filter((x) => x.id.startsWith("O-")).map((x) => x.id), order);
  const inv = L.pipelineInvariants(read(root, L.LEDGERS.QUEUE.live), read(root, L.LEDGERS.BACKLOG.live), { repo: root, later: read(root, L.LEDGERS.LATER.live) });
  t("P1 holds over the three files", inv.arms.P1.violations, []);
  t("P1 CATCHES an open id in BOTH the backlog and its tail",
    L.pipelineInvariants("", R("D-1") + R("D-2"), { repo: root, later: R("D-2") }).arms.P1.violations, [{ id: "D-2", cache: 0, backlog: 1, tail: 1 }]);
  t("P2 CATCHES a closed row in the tail", L.pipelineInvariants("", "", { repo: root, later: R("D-3", 10, "done") }).arms.P2.violations.map((x) => `${x.where} ${x.id}`), ["tail D-3"]);
  t("P5 CATCHES a tail row over 2 KiB", L.pipelineInvariants("", "", { repo: root, later: R("D-4", 2600) }).arms.P5.violations.map((x) => x.id), ["D-4"]);
  t("P5 (over-strictness) passes a tail over 150 KiB — the tail has no whole-file budget",
    L.pipelineInvariants("", "", { repo: root, later: Array.from({ length: 120 }, (_, i) => R(`T-${i}`, 1500)).join("") }).arms.P5.violations, []);
  t("an ABSENT tail is NAMED absent by the audit, never unreadable, and scored as empty",
    (() => { const a = L.ledgerAudit({ repo: fixture({ queue: ARMS, backlog: HEAD, debt: DEBT([]) }) }); return [a.absent, a.unreadable, (a.pipeline || {}).tailRows]; })(),
    [[L.LEDGERS.LATER.live], [], 0]);

  /* REFILL walks the ONE order: with nothing runnable in BACKLOG.md it takes from the tail, and promotes as room frees. */
  const rr = fixture({ queue: "# The work queue\n\n## ROWS\n\n", backlog: HEAD + R("W-1", 300, "blocked") + R("W-2", 300, "blocked"), debt: DEBT([]) });
  writeFileSync(join(rr, L.LEDGERS.LATER.live), L.LATER_HEADER + "\n" + R("W-3") + R("W-4"));
  let rf; try { rf = L.refill({ repo: rr, cacheRows: 1 }); } catch (e) { rf = { moved: [], refusal: `${e.code}: ${e.message}` }; }
  t("refill with no runnable row in BACKLOG.md takes the order's next runnable row FROM THE TAIL", [rf.refusal, rf.moved.map((m) => `${m.id}@${m.from}`)], [undefined, ["W-3@tail"]]);
  t("...and promoted the tail's rest into the room (the fixture's backlog is far under 150 KiB)",
    [ids(read(rr, L.LEDGERS.BACKLOG.live)), ids(read(rr, L.LEDGERS.LATER.live))], [["W-1", "W-2", "W-4"], []]);
  t("...the whole pipeline conserved: cache ∪ backlog ∪ tail hold W-1..W-4 once each",
    ["W-1", "W-2", "W-3", "W-4"].map((id) => L.findId(id, { repo: rr }).length), [1, 1, 1, 1]);
  const bare = fixture({ queue: ARMS, backlog: HEAD + R("E-1"), debt: DEBT([]) });
  const quiet = L.rebalance({ repo: bare });
  t("a rebalance with nothing to move writes NOTHING — an absent tail stays absent", [quiet.written, existsSync(join(bare, L.LEDGERS.LATER.live))], [false, false]);
  const made = L.rebalance({ repo: bare, ensure: true });
  t("...and with `ensure` (the `rebalance` intent) it writes the tail's HEADER alone", [made.created, read(bare, L.LEDGERS.LATER.live) === L.LATER_HEADER, ids(read(bare, L.LEDGERS.BACKLOG.live))], [true, true, ["E-1"]]);
  const archived = fixture({ queue: ARMS, backlog: HEAD, debt: DEBT([]) });
  writeFileSync(join(archived, L.LEDGERS.LATER.live), L.LATER_HEADER + "\n" + R("Z-1", 10, "superseded"));
  t("a closed row in the TAIL archives to the shared archive like any backlog row", mv("Z-1", { repo: archived }).moved.map((m) => m.ledger), ["LATER"]);
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`ledger: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
