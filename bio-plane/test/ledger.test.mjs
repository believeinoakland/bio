/* ledger.test — LED-2: the archiver (`tools/ledger.mjs archive <ID>`), the one definition of a
 * CLOSED row it shares with `tools/owed.mjs`, and the three `plancheck` arms it feeds.
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
 */

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
const SECTIONS = 8;
let reached = 0;
const section = (n) => { reached++; console.log(`\n--- ${n} ---`); };
const code = (f) => { try { f(); return "NO REFUSAL"; } catch (e) { return e.code || `THREW ${e.message}`; } };
/* A move whose refusal is RETURNED, so a broken mover reddens an assertion rather than ending the module. */
const mv = (id, opts) => { try { return L.archiveId(id, opts); } catch (e) { return { moved: [], kept: [], results: [{ moved: [] }], refusal: `${e.code}: ${e.message}` }; } };

/* A fixture repository: the files the archiver, owed, the gate and mintid read. DEBT is padded past
   the 10,000-byte floor with prose so a move is not refused on size unless a test means it to be. */
const PAD = "Prose above the table, as the live ledger carries. ".repeat(220) + "\n\n";
function fixture({ queue = "", debt = "", archives = {}, status = null, plan = null } = {}) {
  const root = mkdtempSync(join(tmpdir(), "ledger-"));
  mkdirSync(join(root, "docs/development"), { recursive: true });
  mkdirSync(join(root, "docs/archive/ledgers"), { recursive: true });
  mkdirSync(join(root, "docs/architecture"), { recursive: true });
  writeFileSync(join(root, "docs/development/QUEUE.md"), queue);
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
const ARMS = Q("LED-3", "queued") + Q("LED-4", "queued");

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
                 /* the archive family through the ARCHIVER's own lister, not a second walk (hygiene's walk census) */
                 ...Object.values(L.LEDGERS).flatMap((l) => L.archiveFiles(l, { repo: REPO }))];
  for (const f of files) { const x = atPin(f); if (x === null) continue; mkdirSync(dirname(join(root, f)), { recursive: true }); writeFileSync(join(root, f), x); }
  const snap = () => Object.fromEntries(Object.values(L.LEDGERS).map((l) =>
    [l.name, L.idCounts(l, [l.live, ...L.archiveFiles(l, { repo: root })].map((f) => read(root, f)))]));
  const lanes = ["BOB", "CONDUCT", "DIST", "ZZZNOTALANE"];
  const owedSnap = () => lanes.map((lane) => owedFor(lane, { repo: root }).items.map((i) => `${i.id}${i.attributed ? "*" : ""}`).join(","));
  const lineCounts = (texts) => { const m = new Map(); for (const x of texts) for (const l of x.split("\n")) if (l.trim()) m.set(l, (m.get(l) || 0) + 1); return m; };
  const headerLines = lineCounts(Object.values(L.ARCHIVE_HEADER));
  /* CORRECTED 2026-09-18 by CONDUCT #4: this counted the LIVE ledgers only, while `linesAfter` counts live + archive —
     so it silently assumed the archive starts EMPTY. The first real use of LED-5's standing step (22 QUEUE and 5 DEBT
     rows archived at CONDUCT #4's stand-down) broke that assumption and the arm read 209 lines "lost" that had been
     conserved all along. Both sides now count live + archive, the archive header subtracted from both. */
  const linesBefore = lineCounts([...Object.values(L.LEDGERS).map((l) => read(root, l.live)),
                                  ...Object.values(L.LEDGERS).map((l) => read(root, l.archive))]);
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
  for (const l of Object.values(L.LEDGERS))
    t(`${l.name}: the id multiset of live ∪ archive is IDENTICAL after the whole migration`, L.conservation(b[l.name], a[l.name]), { ok: true, dropped: [], gained: [] });
  const linesAfter = lineCounts([...Object.values(L.LEDGERS).map((l) => read(root, l.live)),
                                 ...Object.values(L.LEDGERS).map((l) => read(root, l.archive))]);
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

  /* The agreement over the REAL live DEBT.md, read not written: a row owed lists is never archivable. */
  const debt = readFileSync(join(REPO, "docs/development/DEBT.md"), "utf8");
  const rows = L.debtRows(debt);
  t("the real DEBT.md has rows (else the agreement is vacuous)", rows.length > 100, true);
  t("no real DEBT row declaring a residue reads closed", rows.filter((r) => RESIDUE_RE.test(r.disposition) && r.closed).map((r) => r.id), []);
  const owedIds = new Set(["BOB", "CONDUCT", "DIST", "ZZZNOTALANE"].flatMap((lane) => owedFor(lane, { repo: REPO }).items.map((i) => i.id)));
  t("no row owed lists for ANY lane is one the archiver would move", rows.filter((r) => r.closed && owedIds.has(r.id)).map((r) => r.id), []);
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
  t("(a) and (b) are NOT armed while LED-3 / LED-4 are queued — they WARN", a.armed, { closedLive: false, budget: false });
  t("(c) the unresolved dependencies, each named with why",
    a.depends.unresolved.map((u) => `${u.id}->${u.dep}`), ["H-4->G-99", "H-5->G-2", "H-8->2.firsthand", "H-9->9.nothing"]);
  t("(c) an open row, a done row (live or ARCHIVED), a BUILT claim, a closed plan row and a list all resolve",
    ["H-1", "H-2", "H-7", "H-10", "H-11", "H-13"].filter((id) => a.depends.unresolved.some((u) => u.id === id)), []);
  t("(c) `none (…)` names no dependency, and a CLOSED row's depends-on is not judged (H-12)",
    a.depends.unresolved.filter((u) => ["H-3", "H-12"].includes(u.id)), []);
  t("(c) a dependency naming no id is PROSE — printed, not scored", a.depends.prose.map((p) => p.id), ["H-6"]);
  t("(b) an open row over 3 KiB is named, with its size", a.budget.rowsOver.map((r) => r.id), ["H-14"]);
  t("(b) a small QUEUE is under its 150 KiB budget", a.budget.ledgers.find((x) => x.ledger === "QUEUE").over, false);
  const big = fixture({ queue: Q("I-1", "queued") + "prose\n".repeat(26000) + ARMS, debt: DEBT([]) });
  t("(b) a QUEUE over 150 KiB is over budget", L.ledgerAudit({ repo: big }).budget.ledgers.find((x) => x.ledger === "QUEUE").over, true);

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
  t("no depends-on is unresolved on the real tree", /DEPENDS-ON DOES NOT RESOLVE/.test(out), false);
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`ledger: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
