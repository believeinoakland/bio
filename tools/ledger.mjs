#!/usr/bin/env node
/* ledger — the archiver for the two live ledgers, and the gate that keeps them small (LED-2).
 *
 * Bob, 2026-09-18, through BOB #14's inbox entry: the ledgers become SMALL, ORDERED AND ALWAYS
 * CURRENT. `QUEUE.md` had reached 1.17 MB and `DEBT.md` 791 KB, most of both closed rows, and a
 * fresh session could not read the file it was told to work from. **THIS WAS DONE ONCE AND GREW
 * BACK** — the August roll (`docs/archive/ledgers/QUEUE-2026-08.md`, `DEBT-closed-2026-08.md`) was
 * a one-off cleanup with no standing step behind it. This file is the standing step, and
 * `plancheck` carries the arms that make forgetting it a failure rather than a slow regrowth.
 *
 *   node tools/ledger.mjs archive <ID> [<ID> ...] [--dry-run]   move closed row(s), verbatim
 *   node tools/ledger.mjs refill [--dry-run]                    backlog -> cache, the next runnable rows
 *   node tools/ledger.mjs find <ID>                             where an id is: cache, backlog, archive
 *   node tools/ledger.mjs invariants                            the five pipeline invariants; exit 1 on an armed FAIL
 *   node tools/ledger.mjs audit                                 every arm, as JSON
 *
 * ------------------------------------------------------ THE WORK PIPELINE (LED-6, tool half)
 *
 * `docs/development/WORK-PIPELINE.md` §1–§2: `QUEUE.md` is the CACHE (at most 8 rows, read whole),
 * `BACKLOG.md` is everything still to do IN ORDER (top = next), and the archive is what was done.
 * BACKLOG is a SECOND LIVE FILE OF THE QUEUE GRAMMAR, not a ledger of its own: its rows are
 * `### <ID> · <state>` rows, a closed one is archived to the SAME `QUEUE-closed.md`, and every
 * conservation check runs over cache ∪ backlog ∪ the QUEUE archive family.
 *
 * `refill` moves the next RUNNABLE rows from the top of the backlog into the cache until the cache
 * holds `CACHE_ROWS` (8) rows or the backlog has nothing runnable, and DELETES them from the
 * backlog in the same act (§2 step 2). RUNNABLE, as §1 states it: state `queued`, and every
 * `depends-on` MET. MET is stricter than the gate's (c) RESOLVES: (c) accepts an OPEN row as a
 * dependency that exists; a row waiting on an open row is not runnable. A dependency is met by a
 * `done` row (or a closed DEBT row) with NO open row carrying the same id, by a `tools/status.mjs`
 * claim reading BUILT, or by a row of the closed IS build plan. A `depends-on` naming NO id is
 * UNDETERMINED — it cannot be shown met, so the row is not moved and the reason says so. A
 * `blocked` row is skipped, never moved, and stays where the order put it. Moved rows are inserted
 * after the cache's LAST ROW (or at the end of the file when it holds none), so the cache keeps the
 * backlog's order across refills. Conservation is checked TWICE, as the archiver's is — on the plan
 * and on what is READ BACK from disk — over (i) the id multiset of cache ∪ backlog ∪ archive, (ii)
 * the backlog's LINES less exactly the moved blocks, (iii) the cache's NON-BLANK lines plus exactly
 * the moved blocks (a blank line may be added to separate a row, never anything else), and (iv)
 * each moved id one fewer in the backlog and one more in the cache. The CACHE is written FIRST, so
 * an interruption leaves a row in both files (which P1 names) and never in neither; a failure
 * restores both files from memory and verifies the restore by sha256.
 *
 * THE FIVE INVARIANTS (§2, each a `plancheck` arm):
 *   P1 every open id is in EXACTLY ONE of the cache and the backlog (per id, per count) — FAIL now;
 *   P2 no closed row is in either — armed by LED-3, as the closed-live arm (a) always was;
 *   P3 the cache holds ≤ 8 rows and no `blocked` row                     — armed by LED-6 done;
 *   P4 every open cache row's `depends-on` is MET (above)                 — armed by LED-6 done;
 *   P5 both files within budget: cache ≤ 40 KiB and a row ≤ 3 KiB, backlog ≤ 150 KiB and a row
 *      ≤ 2 KiB (§1's table; §4 moves the old 150 KiB QUEUE budget to the backlog) — armed by LED-6.
 * P3–P5 CANNOT hold before the migration (§5 steps 2–4) and so WARN until LED-6 is done, the
 * arming LED-2 built; P1 and P2 hold on the real ledgers today, so they FAIL from the start. A row
 * whose state token is neither open nor closed is invisible to P1 and P2; it is listed UNJUDGED
 * rather than scored.
 *
 * ------------------------------------------------------------------ WHAT "CLOSED" MEANS, ONCE
 *
 * QUEUE: a row whose heading state is `done` or `superseded`. `owed.mjs` reads only `blocked`
 * headings from QUEUE, so no QUEUE row the archiver may move is one it reads.
 * DEBT: `isClosedDebtRow(debtDisposition(line))`, IMPORTED FROM `owed.mjs` AND DEFINED NOWHERE
 * ELSE. M-57 measured why: the August roll's definition (*the last cell lacks `open`*) would have
 * taken D-330, D-401, D-405 and D-407 off the owed list with nothing going red, and `owed.mjs`'s own
 * earlier test (*`CLOSED` anywhere in the cell*) called 13 rows closed whose disposition does not lead with a closure word, several plainly open (M-58). The definition,
 * its receipts and why it errs toward OPEN are in `owed.mjs` beside the function.
 *
 * ----------------------------------------------------------------------- WHAT A MOVE IS
 *
 * One row, VERBATIM, appended to `docs/archive/ledgers/<LEDGER>-closed.md` — never to the August
 * files, whose `op=` counts `op-claims.mjs` pins exactly (M-57). A QUEUE row is its `### <ID> ·
 * <state>` heading through the line before the NEXT heading of level 1-3 — stricter than
 * `rowdesign.mjs`, which ends a row only at an ITEM heading or an `##`, and so folds a heading its
 * grammar cannot read (`### CASE-5b · done`, `### D-329+D-331+D-333 · done`, a wrapped prose line
 * beginning `### SK-n ·`) into the row above it. A mover must never carry a second heading under
 * the first one's id, because the id check cannot see a heading it cannot parse. A DEBT row is its
 * one `| D-n |` line.
 *
 * THE CONSERVATION CHECK COMPARES ID MULTISETS, NOT ROW COUNTS. **The liar this refuses**: a check
 * that counts rows, under which a mover that drops one row and duplicates another reports the
 * same total and passes. Comparing SETS would still pass a pure duplication, so the comparison is
 * per id, per count: every id must occur exactly as often in live ∪ archive after the move as
 * before. The check runs on what is READ BACK FROM DISK after the write, not on the strings the
 * mover meant to write — an act is not done until it is verified to have taken — and a failure
 * restores both files from memory, verifies the restore by sha256, and names every id that moved
 * wrongly. The archive is written BEFORE the live file, so an interruption between the two leaves
 * a row in both places (a duplicate, which the check names) and never in neither.
 *
 * AN ID CARRIED BY MORE THAN ONE ROW (a registered collision — D-124, CPDF-9, FW-15, M0-16 …):
 * every CLOSED row carrying it moves; an OPEN one stays. `mintid.mjs`'s duplicate check reads the
 * files this archiver writes, so a pair split between live and archive is STILL one collision to
 * it and `KNOWN_COLLISIONS` stays exact (M-57 breakage 2, fixed at the check rather than by keeping
 * pairs together).
 *
 * The ruling index needs nothing after a move: `decided.mjs` scans `docs/archive/` (M-57 measured
 * 0 of 1,080 rulings lost, re-attributed or re-dated by a whole-row move), and since M0-99
 * (2026-09-22) its `docs/DECIDED.md` is produced on demand and never committed, so the regeneration
 * this CLI ran after `archive` and `refill`, and the "commit it in the SAME commit" it printed, are
 * retired — a move no longer owes a generated file anything. `DEBT.md` may not fall
 * below 10,000 bytes (`nc-m039.mjs` plants into it). Neither live file is renamed (`mergecarry`
 * keys a declared drop on `docs/development/DEBT.md`).
 *
 * NEGATIVE CONTROL: `node bio-plane/test/ledger.control.mjs` from the repo root — one arm per
 * property, CONSERVATION FIRST: (C1) the check counts rows instead of comparing id multisets ->
 * `ledger.test` fails on the drop-one-duplicate-one liar; (C2) the mover takes one line too many
 * -> the move is refused naming what was lost (a heading by the LINE check, an id by the multiset)
 * and the suite fails — on its FIRST run this arm found the id check blind to a swallowed `##`
 * heading, which is why `linesConserved` exists; (C2b) the same with the pre-write check removed
 * -> the READ-BACK check alone refuses and restores; (C3) the DEBT closed
 * test reverts to *the cell lacks `open`* -> the residue rows stay-live assertion fails; (C4)
 * `blocked` counted as a closed QUEUE state -> fails; (C5) the size budget never exceeded -> the
 * over-budget fixture is not named and fails; (C6) any `depends-on` token accepted -> the dangling
 * fixture passes and the suite fails; (C7) `mintid`'s duplicate check stops reading the archive ->
 * the split-pair fixture fails; (C8) the archive-aware id lookup ignores the archive -> fails;
 * (C9, over-strictness) the closure word matched case-sensitively -> the lowercase `closed` row is
 * kept live and the suite fails.
 * LED-6 adds eighteen arms to the same driver, each declared in its header by the assertion it must
 * redden: P1–P5 (each invariant's liar), P3o/P4o/P5o (over-strictness: exactly 8 rows, an ARCHIVED
 * done dependency, a 2.5 KiB cache row — all must PASS), R1/R1b (the refill drops a row; with the
 * pre-write check removed the READ-BACK check alone refuses and restores), R2–R5 (the refill ignores
 * state, depends-on, the cache's room, its line checks), F1/F2 (find blind to the backlog; the shared
 * archive read twice), M1 (mintid blind to the backlog), O1 (owed blind to the backlog).
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { debtDisposition, isClosedDebtRow } from "./owed.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const ARCHIVE_DIR = "docs/archive/ledgers";
export const LEDGERS = {
  QUEUE:   { name: "QUEUE",   grammar: "QUEUE", where: "cache",   live: "docs/development/QUEUE.md",
             archive: "docs/archive/ledgers/QUEUE-closed.md", family: /^QUEUE-.*\.md$/ },
  /* LED-6: the backlog shares the QUEUE grammar AND the QUEUE archive — see the header. */
  BACKLOG: { name: "BACKLOG", grammar: "QUEUE", where: "backlog", live: "docs/development/BACKLOG.md",
             archive: "docs/archive/ledgers/QUEUE-closed.md", family: /^QUEUE-.*\.md$/ },
  DEBT:    { name: "DEBT",    grammar: "DEBT",  where: "live",    live: "docs/development/DEBT.md",
             archive: "docs/archive/ledgers/DEBT-closed.md",  family: /^DEBT-.*\.md$/ },
};
/* The files this archiver writes, EACH ONCE. `mintid.mjs` imports this list for its duplicate
   check, and QUEUE and BACKLOG share an archive — listed twice, every row in it would read as a
   duplicate of itself. Deduplicated here, at the source, for that reason. */
export const ARCHIVE_TARGETS = [...new Set(Object.values(LEDGERS).map((l) => l.archive))];
/* The live files of the QUEUE grammar: the cache, then the backlog. */
export const PIPELINE = [LEDGERS.QUEUE, LEDGERS.BACKLOG];
export const CACHE_ROWS = 8;

export const CLOSED_QUEUE_STATES = new Set(["done", "superseded"]);
export const OPEN_QUEUE_STATES = new Set(["queued", "running", "blocked"]);
export const DEBT_FLOOR_BYTES = 10000;

/* THE BUDGET, AS THE ROW NAMES IT (start: QUEUE ≤ 150 KB, a row ≤ 3 KB), in KiB. DEBT's whole-
   file figure is NOT named by the row and is not invented here: it is printed, and LED-4 — which
   cuts DEBT's open rows to a paragraph of cost and one of disposition — is where it gets measured
   and set. The per-row figure applies to an OPEN row of either ledger. */
/* CORRECTED 2026-09-18 by LED-6 (WORK-PIPELINE §1 and §4): the cache gets 40 KiB, the old 150 KiB
   QUEUE figure MOVES to the backlog, and a backlog row gets 2 KiB. KB is read as KiB, the unit this
   file already used. */
export const BUDGET = {
  QUEUE:   { ledger: 40 * 1024,  row: 3 * 1024 },
  BACKLOG: { ledger: 150 * 1024, row: 2 * 1024 },
  DEBT:    { ledger: null,       row: 3 * 1024 },
};
/* An arm WARNs until the row that makes it satisfiable is `done`, then FAILs — read from the
   ledger (live or archived) on every run, so nobody has to remember to flip it. (a) is keyed on
   the migration.
   CORRECTED 2026-09-18 by LED-6: the budget arm was keyed on LED-4, and LED-4 is SUPERSEDED (§4:
   subsumed by LED-6) — a row that can never be `done`, so the arm could never arm and nothing said
   so. The pipeline arms P3–P5 (the cache and backlog budget among them) now arm on LED-6, whose
   migration is what makes them satisfiable; DEBT's per-row budget arms on LED-7, the fold that
   empties DEBT (§3). `plancheck` now FAILs on an arming row that is `superseded`. */
export const ARMING = { closedLive: "LED-3", pipeline: "LED-6", debtBudget: "LED-7" };

const QHEAD = /^###\s+([A-Z][A-Z0-9]*-\d+)\s+·\s+([A-Za-z-]+)/;
const ANY_HEADING = /^#{1,3}\s/;
const DROW = /^\|\s*(D-\d+)\s*\|/;

/* WHICH LEDGERS AN ID CAN BE A ROW OF. A `D-n` is a DEBT row AND may also be a QUEUE item: 17
   QUEUE items are headed `### D-n · done` (the item that closed debt row D-n), measured 2026-09-18.
   The first draft routed every `D-` id to DEBT alone, and a full simulated migration left those 17
   closed QUEUE rows live — found by running the migration, not by reading the grammar. */
export const ledgersFor = (id) => (/^D-\d+$/.test(id) ? [...PIPELINE, LEDGERS.DEBT] : [...PIPELINE]);
const bytes = (s) => Buffer.byteLength(s, "utf8");
const sha = (s) => createHash("sha256").update(s).digest("hex");

/* ------------------------------------------------------------------------------ the grammar */

const linesOf = (text) => {
  const lines = text.split("\n");
  /* The terminal "" after a final newline is not a line of anybody's row. */
  const limit = text.endsWith("\n") ? lines.length - 1 : lines.length;
  return { lines, limit };
};

export function queueRows(text) {
  const { lines, limit } = linesOf(text);
  const rows = [];
  for (let i = 0; i < limit; i++) {
    const m = QHEAD.exec(lines[i]);
    if (!m) continue;
    let end = i + 1;
    while (end < limit && !ANY_HEADING.test(lines[end])) end++;
    const body = lines.slice(i, end).join("\n");
    rows.push({ id: m[1], state: m[2], start: i, end, line: i + 1, body, bytes: bytes(body),
                closed: CLOSED_QUEUE_STATES.has(m[2]), open: OPEN_QUEUE_STATES.has(m[2]) });
  }
  return rows;
}

export function debtRows(text) {
  const { lines, limit } = linesOf(text);
  const rows = [];
  for (let i = 0; i < limit; i++) {
    const m = DROW.exec(lines[i]);
    if (!m) continue;
    const disposition = debtDisposition(lines[i]);
    const closed = isClosedDebtRow(disposition);
    rows.push({ id: m[1], state: closed ? "closed" : "open", start: i, end: i + 1, line: i + 1,
                body: lines[i], bytes: bytes(lines[i]), disposition, closed, open: !closed });
  }
  return rows;
}

export const rowsOf = (ledger, text) => (ledger.grammar === "DEBT" ? debtRows(text) : queueRows(text));

/* ----------------------------------------------------------------------- conservation */

/** Per-id occurrence counts over several texts of one ledger. */
export function idCounts(ledger, texts) {
  const counts = new Map();
  for (const t of texts) for (const r of rowsOf(ledger, t)) counts.set(r.id, (counts.get(r.id) || 0) + 1);
  return counts;
}

/** Compare two id MULTISETS. A dropped row and a duplicated row do NOT cancel here. */
export function conservation(before, after) {
  const dropped = [], gained = [];
  for (const id of new Set([...before.keys(), ...after.keys()])) {
    const b = before.get(id) || 0, a = after.get(id) || 0;
    if (a < b) dropped.push(`${id} (${b} -> ${a})`);
    if (a > b) gained.push(`${id} (${b} -> ${a})`);
  }
  return { ok: dropped.length === 0 && gained.length === 0, dropped, gained };
}

/** THE SECOND HALF OF CONSERVATION, AND THE NEGATIVE CONTROL FOUND IT MISSING. The id multiset
    sees only lines the id grammar can parse, so a mover that also swallowed the NEXT line — an
    `## AREA` heading, a paragraph of prose — conserved every id and passed (arm C2, 2026-09-18:
    the suite caught it; this function did not). So the live file's LINES are conserved too: every
    line of the live file before the move is, exactly as often, in the live file after it or in a
    moved block. Blank lines count. */
export function linesConserved(liveBefore, liveAfter, blocks) {
  /* A FILE's lines are its text split, less the "" after a final newline; a BLOCK is lines joined
     with no terminal newline, so every element of its split is a line — a row's trailing blank
     included. Reading a block as a file dropped that blank and refused every correct move. */
  const add = (m, lines, sign) => { for (const l of lines) m.set(l, (m.get(l) || 0) + sign); return m; };
  const fileLines = (t) => { const { lines, limit } = linesOf(t); return lines.slice(0, limit); };
  const m = new Map();
  add(m, fileLines(liveBefore), 1);
  add(m, fileLines(liveAfter), -1);
  for (const b of blocks) add(m, b.split("\n"), -1);
  const off = [...m].filter(([, n]) => n !== 0).map(([l, n]) => `${n > 0 ? "lost" : "gained"} ×${Math.abs(n)}: "${l.slice(0, 60)}"`);
  return { ok: off.length === 0, off };
}

/* -------------------------------------------------------------------------- the reads */

const readRel = (repo, rel) => { try { return readFileSync(join(repo, rel), "utf8"); } catch { return null; } };

/** Every archive file of a ledger's family (the August roll included), relative paths, sorted. */
export function archiveFiles(ledger, { repo = ROOT } = {}) {
  let names = [];
  try { names = readdirSync(join(repo, ARCHIVE_DIR)); } catch { return []; }
  return names.filter((n) => ledger.family.test(n)).sort().map((n) => `${ARCHIVE_DIR}/${n}`);
}

/** Where an id is: every row carrying it — in the cache, the backlog, the live DEBT ledger or an
    archive file — with its state. [] if nowhere. An archive file two ledgers share is read ONCE. */
export function findId(id, { repo = ROOT } = {}) {
  const out = [];
  const seen = new Set();
  for (const ledger of ledgersFor(id))
    for (const [rel, where] of [[ledger.live, ledger.where], ...archiveFiles(ledger, { repo }).map((f) => [f, "archive"])]) {
      if (seen.has(rel)) continue;
      seen.add(rel);
      const t = readRel(repo, rel);
      if (t === null) continue;
      for (const r of rowsOf(ledger, t)) if (r.id === id)
        out.push({ id, ledger: ledger.name, file: rel, where, line: r.line, state: r.state, closed: r.closed, open: r.open });
    }
  return out;
}

/** The queue ids that exist in the ARCHIVE, for readers that must resolve a closed id. */
export function archivedQueueIds({ repo = ROOT } = {}) {
  const ids = new Set();
  for (const f of archiveFiles(LEDGERS.QUEUE, { repo })) {
    const t = readRel(repo, f);
    if (t !== null) for (const r of queueRows(t)) ids.add(r.id);
  }
  return ids;
}

/* ------------------------------------------------ the plan's ONE row lister (D-430) */

/* A heading SHAPED like a row — `### <token> · <state>` — that `QHEAD` cannot read: `### CASE-5b · done`,
   `### D-329+D-331+D-333 · done`, `### UI-17a · done` (three, all `done`, in the cache at `3dee1fdb`; LED-6's step (2), `12983f6f`, moved
   those blocks to the archive, and the merged tree holds none — measured 2026-09-18 both times). The
   grammar folds nothing under them (`queueRows` ends the row above at ANY heading), so their fields are
   read by NO arm: not the row-design check, not the milestone or interface check, not P1/P2. They are
   NAMED here rather than silently scored zero — a thing the matcher does not understand must be named. */
const ROWLIKE = /^###\s+\S+\s+·\s/;
export function strayHeadings(text) {
  const { lines, limit } = linesOf(text);
  const out = [];
  for (let i = 0; i < limit; i++)
    if (ROWLIKE.test(lines[i]) && !QHEAD.test(lines[i]))
      out.push({ heading: lines[i].slice(0, 120), line: i + 1,
                 closed: /·\s+(done|superseded)\b/.test(lines[i]) });
  return out;
}

/** THE ONE READER OF THE PLAN'S LIVE ROWS: cache ∪ backlog (`PIPELINE`), each row as `queueRows` reads
    it, tagged with the file it is in. D-430: `tools/rowdesign.mjs`, `tools/rowsubstrate.mjs` and
    `plancheck` §2's milestone and interface checks read `QUEUE.md` only, so a row LED-6's migration
    moved into `BACKLOG.md` would have gone unchecked by all of them. They now read THIS, and nothing
    else — never a second walk, because a copy of the QUEUE reader pointed at the backlog agrees with
    this one today and drifts the day either file's grammar moves (`pipeline-readers.test.mjs` pins
    that the readers carry no grammar of their own). `texts` is injectable ({ QUEUE, BACKLOG }; a
    missing key reads as an EMPTY file) so a suite can drive a planted backlog row without writing one
    into the live `BACKLOG.md`. An unreadable file is NAMED in `unreadable`, never read as empty. */
export function pipelineRows({ repo = ROOT, texts = null } = {}) {
  const rows = [], strays = [], unreadable = [], read = [];
  for (const l of PIPELINE) {
    const t = texts ? (texts[l.name] ?? "") : readRel(repo, l.live);
    if (t === null) { unreadable.push(l.live); continue; }
    read.push(l.live);
    for (const r of queueRows(t)) rows.push({ ...r, file: l.live, where: l.where, ledger: l.name });
    for (const s of strayHeadings(t)) strays.push({ ...s, file: l.live, where: l.where });
  }
  const count = (w) => rows.filter((r) => r.where === w).length;
  return { rows, strays, unreadable, read, cacheRows: count("cache"), backlogRows: count("backlog") };
}

/* ------------------------------------------------------------------------------ the move */

export const ARCHIVE_HEADER = {
  QUEUE: "# QUEUE — closed rows, moved by the archiver\n\n"
    + "**Written only by `node tools/ledger.mjs archive <ID>`**, which moves a closed row (`done` or\n"
    + "`superseded`) out of `docs/development/QUEUE.md` VERBATIM and appends it here, and refuses the\n"
    + "move unless every id occurs exactly as often in the live ledger plus its archive after the move\n"
    + "as before. Rows arrive in the order they were archived. Find any id, live or archived, with\n"
    + "`node tools/ledger.mjs find <ID>`; rulings in these rows stay indexed by `tools/decided.mjs`.\n"
    + "The August roll (`QUEUE-2026-08.md`) is a separate closed file and is never appended to.\n\n",
  DEBT: "# DEBT — closed rows, moved by the archiver\n\n"
    + "**Written only by `node tools/ledger.mjs archive <ID>`**, which moves a closed row with no\n"
    + "declared residue (the one definition is `isClosedDebtRow` in `tools/owed.mjs`) out of\n"
    + "`docs/development/DEBT.md` VERBATIM and appends it here, and refuses the move unless every id\n"
    + "occurs exactly as often in the live ledger plus its archive after the move as before. Rows\n"
    + "arrive in the order they were archived. Find any id with `node tools/ledger.mjs find <ID>`.\n"
    + "The August roll (`DEBT-closed-2026-08.md`) is a separate closed file and is never appended to.\n\n"
    + "| ID | Sev | Found | Item | Status |\n|---|---|---|---|---|\n",
};

export class Refusal extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
const refusal = (code, message) => new Refusal(code, message);

/** PURE: the texts after moving every CLOSED row carrying `id` from `live` to `archive`. */
export function planMove(ledger, id, live, archive) {
  const rows = rowsOf(ledger, live).filter((r) => r.id === id);
  if (!rows.length) throw refusal("NOT_LIVE", `${id} is not a row of ${ledger.live}.`);
  const closed = rows.filter((r) => r.closed);
  const kept = rows.filter((r) => !r.closed);
  if (!closed.length)
    throw refusal("NOT_CLOSED", `${id} is not closed — ${rows.map((r) => ledger.grammar === "DEBT"
      ? `its disposition begins "${r.disposition.slice(0, 80)}"` : `its state is \`${r.state}\``).join("; ")}. `
      + (ledger.grammar === "DEBT"
        ? "A DEBT row is closed when its disposition LEADS with CLOSED/FIXED/RESOLVED/SUPERSEDED and declares no residue (owed.mjs isClosedDebtRow)."
        : "A QUEUE row is closed when its state is `done` or `superseded`."));
  const { lines } = linesOf(live);
  const blocks = closed.map((r) => lines.slice(r.start, r.end).join("\n"));
  const out = lines.slice();
  for (const r of [...closed].sort((a, b) => b.start - a.start)) out.splice(r.start, r.end - r.start);
  const newLive = out.join("\n");
  let base = archive === null || archive === "" ? ARCHIVE_HEADER[ledger.grammar] : archive;
  if (!base.endsWith("\n")) base += "\n";
  let appended = "";
  for (const b of blocks) {
    if (ledger.grammar === "QUEUE" && !(base + appended).endsWith("\n\n")) appended += "\n";
    appended += b.endsWith("\n") ? b : b + "\n";
  }
  const newArchive = base + appended;
  if (ledger.name === "DEBT" && bytes(newLive) < DEBT_FLOOR_BYTES)
    throw refusal("DEBT_BELOW_FLOOR", `moving ${id} would leave ${ledger.live} at ${bytes(newLive)} bytes, `
      + `below ${DEBT_FLOOR_BYTES} — nc-m039.mjs plants into it and needs the room.`);
  return { newLive, newArchive, base, appended, blocks,
           moved: closed.map((r) => ({ id, line: r.line, bytes: r.bytes, state: r.state })),
           kept: kept.map((r) => ({ id, line: r.line, state: r.state })) };
}

/** Move every closed row carrying `id` — in every ledger it is a row of — to that ledger's
    archive, each ledger's move verified from disk on its own. Refused, with nothing written, when
    the id is live nowhere or closed nowhere. */
export function archiveId(id, { repo = ROOT, dryRun = false } = {}) {
  const live = {};
  for (const ledger of ledgersFor(id)) {
    const t = readRel(repo, ledger.live);
    if (t === null) throw refusal("LEDGER_UNREADABLE", `${ledger.live} could not be read — nothing moved.`);
    if (rowsOf(ledger, t).some((r) => r.id === id)) live[ledger.name] = t;
  }
  const names = Object.keys(live);
  if (!names.length) {
    const elsewhere = findId(id, { repo }).filter((f) => f.where === "archive");
    throw elsewhere.length
      ? refusal("ALREADY_ARCHIVED", `${id} is not live; it is archived at ${elsewhere.map((f) => `${f.file}:${f.line}`).join(", ")}.`)
      : refusal("NOT_LIVE", `${id} is not a row of ${ledgersFor(id).map((l) => l.live).join(" or ")} or of any archive file.`);
  }
  const withClosed = names.filter((n) => rowsOf(LEDGERS[n], live[n]).some((r) => r.id === id && r.closed));
  if (!withClosed.length) planMove(LEDGERS[names[0]], id, live[names[0]], null); /* throws NOT_CLOSED, worded */
  const results = withClosed.map((n) => archiveIn(LEDGERS[n], id, { repo, dryRun }));
  const keptElsewhere = names.filter((n) => !withClosed.includes(n)).flatMap((n) =>
    rowsOf(LEDGERS[n], live[n]).filter((r) => r.id === id).map((r) => ({ id, ledger: n, line: r.line, state: r.state })));
  return { id, dryRun, results,
           moved: results.flatMap((r) => r.moved.map((m) => ({ ...m, ledger: r.ledger }))),
           kept: [...results.flatMap((r) => r.kept.map((k) => ({ ...k, ledger: r.ledger }))), ...keptElsewhere] };
}

const L_HEADER = (ledger) => ARCHIVE_HEADER[ledger.grammar];

function archiveIn(ledger, id, { repo, dryRun }) {
  const livePath = join(repo, ledger.live), archPath = join(repo, ledger.archive);
  const live = readRel(repo, ledger.live);
  const archive = existsSync(archPath) ? readFileSync(archPath, "utf8") : null;
  const plan = planMove(ledger, id, live, archive);
  /* The rest of the ledger's archive family, read so the check is over live ∪ ALL archive. */
  const others = archiveFiles(ledger, { repo }).filter((f) => f !== ledger.archive)
    .map((f) => readRel(repo, f)).filter((t) => t !== null);
  const before = idCounts(ledger, [live, archive || "", ...others]);
  /* THREE PROPERTIES, each checked on the plan and again on what is READ BACK from disk: the id
     multiset of live ∪ archive; every LINE of the live file (`linesConserved`); and the archive
     keeping everything it held, each moved block appended to it verbatim. */
  const base = archive === null ? L_HEADER(ledger) : archive;
  const judge = (liveT, archT) => {
    const ids = conservation(before, idCounts(ledger, [liveT, archT, ...others]));
    const lines = linesConserved(live, liveT, plan.blocks);
    const kept = archT.startsWith(base) && plan.blocks.every((b) => archT.slice(base.length).includes(b));
    return { ok: ids.ok && lines.ok && kept, ids, lines, kept };
  };
  const say = (j) => `dropped: ${j.ids.dropped.join(", ") || "none"}; gained: ${j.ids.gained.join(", ") || "none"}; `
    + `lines: ${j.lines.ok ? "conserved" : j.lines.off.slice(0, 3).join("; ")}; archive kept and appended verbatim: ${j.kept}`;
  const planned = judge(plan.newLive, plan.newArchive);
  if (!planned.ok)
    throw refusal("CONSERVATION_BROKEN", `the planned move of ${id} does not conserve the ledger — ${say(planned)}. Nothing written.`);
  if (dryRun) return { ...plan, ledger: ledger.name, dryRun: true, conservation: planned.ids };

  /* ARCHIVE FIRST: an interruption between the writes leaves a duplicate, never a loss. */
  writeFileSync(archPath, plan.newArchive);
  writeFileSync(livePath, plan.newLive);
  const liveBack = readFileSync(livePath, "utf8"), archBack = readFileSync(archPath, "utf8");
  const disk = judge(liveBack, archBack);
  if (!disk.ok) {
    writeFileSync(livePath, live);
    if (archive === null) unlinkSync(archPath); else writeFileSync(archPath, archive);
    const restored = sha(readFileSync(livePath, "utf8")) === sha(live)
      && (archive === null ? !existsSync(archPath) : sha(readFileSync(archPath, "utf8")) === sha(archive));
    throw refusal("CONSERVATION_BROKEN", `the move of ${id} did not conserve what was READ BACK — ${say(disk)}. `
      + `Both files restored from memory — restored byte-identically: ${restored ? "YES" : "NO"}.`);
  }
  return { ...plan, ledger: ledger.name, dryRun: false, conservation: disk.ids };
}

/* ------------------------------------------------------------------ the gate's three arms */

/** A row's dependency ids, read from its `depends-on:` line. `none…` is no dependency; a value
    naming no id at all is PROSE, which this cannot judge and says so rather than scoring it. */
export function dependsOf(rowBody) {
  const line = rowBody.split("\n").find((l) => /^depends-on:/.test(l));
  if (!line) return { value: null, ids: [], claims: [], prose: false };
  const value = line.replace(/^depends-on:\s*/, "").replace(/\*\*|`/g, "").trim();
  if (/^none\b/i.test(value) || value === "") return { value, ids: [], claims: [], prose: false };
  /* The dependency is the HEAD of the value; a parenthesis, a dash clause or a sentence after it
     is commentary (`VF-4 (landed — …)`, `CPDF-17 (running — same file)`). */
  const head = value.split(/\s\(|\s—\s|\.\s|;/)[0];
  const ids = head.match(/\b[A-Z][A-Z0-9]*-\d+[a-z]?\b/g) || [];
  const claims = head.match(/\b\d+\.[a-z][a-z0-9-]*\b/g) || [];
  return { value, ids, claims, prose: !ids.length && !claims.length };
}

/** A named track row in the archived IS build plan (`| VF-4 | … |`) — a closed plan, 43/43. */
function isPlanRow(id, repo) {
  const t = readRel(repo, "docs/archive/IS-BUILD-PLAN.md");
  return t !== null && new RegExp(`^\\|\\s*${id.replace(/[-]/g, "\\-")}\\s*\\|`, "m").test(t);
}

export function resolveDependency(token, { repo = ROOT, claims = null } = {}) {
  if (/^\d+\./.test(token)) {
    const c = (claims || []).find((x) => x.id === token);
    if (!c) return { ok: false, why: `no \`tools/status.mjs\` claim is named ${token}` };
    return c.state === "BUILT" ? { ok: true, how: `status claim ${token} reads BUILT` }
      : { ok: false, why: `status claim ${token} reads ${c.state}, not BUILT` };
  }
  const found = findId(token, { repo });
  if (found.some((f) => f.open)) return { ok: true, how: `open row` };
  if (found.some((f) => f.state === "done" || (f.state === "closed")))
    return { ok: true, how: `done row (${found.find((f) => f.state === "done" || f.state === "closed").where})` };
  if (found.length) return { ok: false, why: `${token} is \`${found[0].state}\` — a dependency on a row that `
    + `was not done resolves to nothing; name what replaced it` };
  if (isPlanRow(token, repo)) return { ok: true, how: `archived IS build-plan track row (plan closed 43/43)` };
  return { ok: false, why: `${token} is not a row of the live ledger or of any archive file` };
}

function loadClaims(repo) {
  const t = readRel(repo, "docs/architecture/construct-status.json");
  if (t === null) return null;
  try {
    const d = JSON.parse(t);
    return (d.constructs || []).flatMap((c) => (c.claims || []).map((cl) => ({ id: cl.id, state: cl.state })));
  } catch { return null; }
}

/** Every arm, as data: (a)–(c) and the five pipeline invariants. `plancheck` prints them; the
    suite judges them on fixtures. */
export function ledgerAudit({ repo = ROOT } = {}) {
  const unreadable = [];
  const texts = {};
  for (const l of Object.values(LEDGERS)) {
    texts[l.name] = readRel(repo, l.live);
    if (texts[l.name] === null) unreadable.push(l.live);
  }
  const armed = {}, arming = {};
  for (const [arm, rowId] of Object.entries(ARMING)) {
    const f = findId(rowId, { repo });
    arming[arm] = { row: rowId, found: f.length > 0, state: f.map((x) => x.state).join("/") || "ABSENT" };
    armed[arm] = f.some((x) => x.state === "done");
  }
  /* (a) no closed row in a live ledger */
  const closedLive = {};
  /* (b) the size budget */
  const budget = { ledgers: [], rowsOver: [] };
  /* (c) every depends-on resolves */
  const depends = { checked: 0, unresolved: [], prose: [] };
  const claims = loadClaims(repo);
  for (const l of Object.values(LEDGERS)) {
    const t = texts[l.name];
    if (t === null) continue;
    const rows = rowsOf(l, t);
    closedLive[l.name] = rows.filter((r) => r.closed).map((r) => r.id);
    budget.ledgers.push({ ledger: l.name, file: l.live, bytes: bytes(t), budget: BUDGET[l.name].ledger,
                          over: BUDGET[l.name].ledger !== null && bytes(t) > BUDGET[l.name].ledger });
    for (const r of rows) if (r.open && r.bytes > BUDGET[l.name].row)
      budget.rowsOver.push({ ledger: l.name, id: r.id, bytes: r.bytes, budget: BUDGET[l.name].row, line: r.line });
    if (l.grammar !== "QUEUE") continue;
    for (const r of rows) {
      if (!r.open) continue;
      const d = dependsOf(r.body);
      if (d.prose) { depends.prose.push({ id: r.id, value: d.value.slice(0, 120) }); continue; }
      for (const tok of [...d.ids, ...d.claims]) {
        depends.checked++;
        const res = resolveDependency(tok, { repo, claims });
        if (!res.ok) depends.unresolved.push({ id: r.id, file: l.live, line: r.line, dep: tok, why: res.why });
      }
    }
  }
  /* THE FIVE PIPELINE INVARIANTS (LED-6). Null when either file cannot be read — `unreadable`
     names it, and an unread file is never scored as a clean one. */
  const pipeline = texts.QUEUE === null || texts.BACKLOG === null ? null
    : pipelineInvariants(texts.QUEUE, texts.BACKLOG, { repo, claims, armed });
  return { unreadable, armed, arming, closedLive, budget, depends, pipeline, claimsReadable: claims !== null };
}

/* ------------------------------------------------------ the work pipeline (LED-6, tool half) */

/** Is a dependency MET — satisfied, so a row resting on it is runnable? Stricter than
    `resolveDependency` (which accepts an OPEN row: it exists). Met: a `done` QUEUE row or a closed
    DEBT row, with NO open row carrying the same id (a colliding open row makes it ambiguous, and
    ambiguity is not met); a status claim reading BUILT; a row of the closed IS build plan. */
export function dependencyMet(token, { repo = ROOT, claims = null } = {}) {
  if (/^\d+\./.test(token)) {
    const r = resolveDependency(token, { repo, claims });
    return r.ok ? { met: true, how: r.how } : { met: false, why: r.why };
  }
  const found = findId(token, { repo });
  const open = found.filter((f) => f.open);
  if (open.length) return { met: false, why: `${token} is still open (\`${open[0].state}\`, ${open[0].file}:${open[0].line})` };
  const done = found.find((f) => f.state === "done" || f.state === "closed");
  if (done) return { met: true, how: `${token} is done (${done.where})` };
  if (found.length) return { met: false, why: `${token} is \`${found[0].state}\`, not done — name what replaced it` };
  if (isPlanRow(token, repo)) return { met: true, how: `archived IS build-plan track row (plan closed 43/43)` };
  return { met: false, why: `${token} is not a row of the cache, the backlog or any archive file` };
}

/** A row's depends-on, judged MET or not. `undetermined` when the value names no id. */
export function rowDepsMet(rowBody, { repo = ROOT, claims = null } = {}) {
  const d = dependsOf(rowBody);
  if (d.prose) return { met: false, undetermined: true, value: d.value, unmet: [] };
  const unmet = [];
  for (const tok of [...d.ids, ...d.claims]) {
    const m = dependencyMet(tok, { repo, claims });
    if (!m.met) unmet.push({ dep: tok, why: m.why });
  }
  return { met: unmet.length === 0, undetermined: false, value: d.value, unmet };
}

/** THE FIVE INVARIANTS (WORK-PIPELINE §2), as data, over a cache text and a backlog text. PURE
    but for the dependency lookups, which read `repo`. Each arm returns its violations; an empty
    list is a pass. `armed` says whether `plancheck` FAILs or WARNs on a violation. */
export function pipelineInvariants(cache, backlog, { repo = ROOT, claims = null, armed = {} } = {}) {
  const c = queueRows(cache), b = queueRows(backlog);
  const unjudged = [...c.map((r) => ({ ...r, where: "cache" })), ...b.map((r) => ({ ...r, where: "backlog" }))]
    .filter((r) => !r.open && !r.closed).map((r) => ({ id: r.id, state: r.state, where: r.where, line: r.line }));
  /* P1 — per id, per count: an open id twice in one file is as wrong as once in each. */
  const counts = new Map();
  for (const [rows, where] of [[c, "cache"], [b, "backlog"]])
    for (const r of rows) if (r.open) {
      const e = counts.get(r.id) || { id: r.id, cache: 0, backlog: 0 };
      e[where]++; counts.set(r.id, e);
    }
  const P1 = [...counts.values()].filter((e) => e.cache + e.backlog !== 1);
  /* P2 — no closed row in either file. */
  const P2 = [...c.filter((r) => r.closed).map((r) => ({ id: r.id, state: r.state, where: "cache", line: r.line })),
              ...b.filter((r) => r.closed).map((r) => ({ id: r.id, state: r.state, where: "backlog", line: r.line }))];
  /* P3 — ≤ 8 rows in the cache (every row the grammar reads, whatever its state), none blocked. */
  const P3 = [];
  if (c.length > CACHE_ROWS) P3.push({ what: "rows", rows: c.length, max: CACHE_ROWS });
  for (const r of c) if (r.state === "blocked") P3.push({ what: "blocked", id: r.id, line: r.line });
  /* P4 — every OPEN cache row's depends-on is met (a blocked one is P3's; a closed one P2's). */
  const P4 = [];
  for (const r of c) {
    if (!r.open || r.state === "blocked") continue;
    const m = rowDepsMet(r.body, { repo, claims });
    if (m.undetermined) P4.push({ id: r.id, line: r.line, undetermined: true,
      why: `depends-on names no id ("${String(m.value).slice(0, 80)}") — UNDETERMINED, so it cannot be shown met` });
    for (const u of m.unmet) P4.push({ id: r.id, line: r.line, dep: u.dep, why: u.why });
  }
  /* P5 — both files, and every OPEN row in each, within budget. */
  const P5 = [];
  for (const [ledger, text, rows] of [[LEDGERS.QUEUE, cache, c], [LEDGERS.BACKLOG, backlog, b]]) {
    const B = BUDGET[ledger.name];
    if (bytes(text) > B.ledger) P5.push({ file: ledger.live, bytes: bytes(text), budget: B.ledger });
    for (const r of rows) if (r.open && r.bytes > B.row)
      P5.push({ file: ledger.live, id: r.id, line: r.line, bytes: r.bytes, budget: B.row });
  }
  const arms = {
    P1: { title: "every open id is in EXACTLY ONE of the cache and the backlog", armed: true, violations: P1 },
    P2: { title: "no closed row is in the cache or the backlog", armed: armed.closedLive ?? true, violations: P2 },
    P3: { title: `the cache holds ≤ ${CACHE_ROWS} rows and no \`blocked\` row`, armed: armed.pipeline ?? true, violations: P3 },
    P4: { title: "every open cache row's depends-on is MET", armed: armed.pipeline ?? true, violations: P4 },
    P5: { title: `both files within budget (cache ≤ ${BUDGET.QUEUE.ledger} B, row ≤ ${BUDGET.QUEUE.row} B; `
          + `backlog ≤ ${BUDGET.BACKLOG.ledger} B, row ≤ ${BUDGET.BACKLOG.row} B)`, armed: armed.pipeline ?? true, violations: P5 },
  };
  return { arms, unjudged, cacheRows: c.length, backlogRows: b.length };
}

/** A violation, one line, for the CLI and for `plancheck`. */
export function describeViolation(arm, v) {
  switch (arm) {
    case "P1": return `${v.id} is open ${v.cache}× in the cache and ${v.backlog}× in the backlog`;
    case "P2": return `${v.id} · ${v.state} in the ${v.where} (line ${v.line}) — archive it: node tools/ledger.mjs archive ${v.id}`;
    case "P3": return v.what === "rows" ? `the cache holds ${v.rows} rows, over ${v.max}` : `${v.id} is \`blocked\` in the cache (line ${v.line})`;
    case "P4": return `${v.id} (cache line ${v.line})${v.dep ? ` depends on ${v.dep}` : ""}: ${v.why}`;
    case "P5": return v.id ? `${v.file} row ${v.id} is ${v.bytes} B against ${v.budget}` : `${v.file} is ${v.bytes} B against ${v.budget}`;
    default: return JSON.stringify(v);
  }
}

/* ---------------------------------------------------------------------------- the refill */

/* The lines are compared RAW — `text.split("\n")`, the terminal "" included — because the refill builds
   the new backlog as exactly that split less the moved blocks, joined. The archiver's reading (less the
   "" after a final newline) was tried first and refused two CORRECT refills on the suite's first run: a
   backlog emptied to "" (whose split is [""]) and a backlog whose last row had no final newline, where
   the blank line before the moved rows BECOMES the final newline. Same lines, differently read. */
const rawLines = (t) => t.split("\n");
const multiset = (lines, keep = () => true) => { const m = new Map(); for (const l of lines) if (keep(l)) m.set(l, (m.get(l) || 0) + 1); return m; };
const nonBlank = (l) => l.trim() !== "";
function sameMultiset(a, b) {
  const off = [];
  for (const k of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(k) || 0, y = b.get(k) || 0;
    if (x !== y) off.push(`${x > y ? "lost" : "gained"} ×${Math.abs(x - y)}: "${k.slice(0, 60)}"`);
  }
  return off;
}

/** PURE: which backlog rows a refill moves, and why each examined row that is not moved is not.
    Walks the backlog from the TOP and stops when the cache is full. */
export function selectRefill(cache, backlog, { repo = ROOT, claims = null, cacheRows = CACHE_ROWS } = {}) {
  const c = queueRows(cache), b = queueRows(backlog);
  const room = Math.max(0, cacheRows - c.length);
  const inCache = new Set(c.filter((r) => r.open).map((r) => r.id));
  const take = [], skipped = [];
  for (const r of b) {
    if (take.length >= room) break;
    const skip = (why) => skipped.push({ id: r.id, state: r.state, line: r.line, why });
    if (r.closed) { skip(`\`${r.state}\` — a closed row is never moved; archive it (node tools/ledger.mjs archive ${r.id})`); continue; }
    if (r.state === "blocked") { skip("`blocked` — skipped, never moved; it stays where the order put it"); continue; }
    if (r.state !== "queued") { skip(`\`${r.state}\` — only a \`queued\` row is moved`); continue; }
    if (inCache.has(r.id)) { skip("already open in the cache — moving it would put one open id in both files (P1)"); continue; }
    const m = rowDepsMet(r.body, { repo, claims });
    if (m.undetermined) { skip(`depends-on names no id ("${String(m.value).slice(0, 80)}") — UNDETERMINED, cannot be shown met`); continue; }
    if (!m.met) { skip(`depends-on not met — ${m.unmet.map((u) => `${u.dep}: ${u.why}`).join("; ")}`); continue; }
    take.push(r);
  }
  return { room, cacheRowsBefore: c.length, take, skipped };
}

/** PURE: the texts after moving `take` (rows of `backlog`) to the end of the cache's rows. */
export function planRefill(cache, backlog, take) {
  const bl = linesOf(backlog).lines;
  const blocks = take.map((r) => bl.slice(r.start, r.end));
  const out = bl.slice();
  for (const r of [...take].sort((x, y) => y.start - x.start)) {
    const span = r.end - r.start;
    out.splice(r.start, span);
  }
  const newBacklog = out.join("\n");
  const { lines: cl, limit } = linesOf(cache);
  const c = queueRows(cache);
  const at = c.length ? c[c.length - 1].end : limit;
  const ins = [];
  const prev = () => (ins.length ? ins[ins.length - 1] : at > 0 ? cl[at - 1] : "");
  for (const blk of blocks) {
    if (nonBlank(prev())) ins.push("");
    ins.push(...blk);
    if (nonBlank(blk[blk.length - 1] ?? "") && at < limit) ins.push("");
  }
  const newCache = [...cl.slice(0, at), ...ins, ...cl.slice(at)].join("\n");
  return { newCache, newBacklog, blocks: blocks.map((x) => x.join("\n")) };
}

/** The four conservation properties of a refill (see the header), over texts. */
export function refillConserved({ cache, backlog, archives, newCache, newBacklog, take }) {
  const ids = conservation(idCounts(LEDGERS.QUEUE, [cache, backlog, ...archives]),
                           idCounts(LEDGERS.QUEUE, [newCache, newBacklog, ...archives]));
  const blockLines = take.flatMap((r) => linesOf(backlog).lines.slice(r.start, r.end));
  /* (ii) the backlog lost exactly the moved blocks, blank lines included */
  const bExpect = multiset(rawLines(backlog)); for (const l of blockLines) bExpect.set(l, (bExpect.get(l) || 0) - 1);
  const backlogOff = sameMultiset(new Map([...bExpect].filter(([, n]) => n !== 0)), multiset(rawLines(newBacklog)));
  /* (iii) the cache gained exactly the moved blocks' non-blank lines */
  const cExpect = multiset(rawLines(cache), nonBlank); for (const l of blockLines) if (nonBlank(l)) cExpect.set(l, (cExpect.get(l) || 0) + 1);
  const cacheOff = sameMultiset(cExpect, multiset(rawLines(newCache), nonBlank));
  /* (iv) each moved id: one fewer in the backlog, one more in the cache */
  const cb = idCounts(LEDGERS.QUEUE, [cache]), ca = idCounts(LEDGERS.QUEUE, [newCache]);
  const bb = idCounts(LEDGERS.QUEUE, [backlog]), ba = idCounts(LEDGERS.QUEUE, [newBacklog]);
  const want = new Map(); for (const r of take) want.set(r.id, (want.get(r.id) || 0) + 1);
  const notMoved = [...want].filter(([id, n]) => (ca.get(id) || 0) - (cb.get(id) || 0) !== n || (bb.get(id) || 0) - (ba.get(id) || 0) !== n).map(([id]) => id);
  return { ok: ids.ok && !backlogOff.length && !cacheOff.length && !notMoved.length, ids, backlogOff, cacheOff, notMoved };
}

/** Move the next runnable rows backlog -> cache (WORK-PIPELINE §2 step 2). Refused, nothing
    written, when either file cannot be read or the move would not conserve. */
export function refill({ repo = ROOT, dryRun = false, cacheRows = CACHE_ROWS } = {}) {
  const cachePath = join(repo, LEDGERS.QUEUE.live), backlogPath = join(repo, LEDGERS.BACKLOG.live);
  const cache = readRel(repo, LEDGERS.QUEUE.live), backlog = readRel(repo, LEDGERS.BACKLOG.live);
  for (const [t, l] of [[cache, LEDGERS.QUEUE], [backlog, LEDGERS.BACKLOG]])
    if (t === null) throw refusal("LEDGER_UNREADABLE", `${l.live} could not be read — nothing moved. An unreadable ledger is not an empty one.`);
  const claims = loadClaims(repo);
  const sel = selectRefill(cache, backlog, { repo, claims, cacheRows });
  const archives = archiveFiles(LEDGERS.QUEUE, { repo }).map((f) => readRel(repo, f)).filter((t) => t !== null);
  const base = { ...sel, moved: sel.take.map((r) => ({ id: r.id, line: r.line, bytes: r.bytes })), dryRun };
  if (!sel.take.length) return { ...base, written: false };
  const plan = planRefill(cache, backlog, sel.take);
  const say = (j) => `ids dropped: ${j.ids.dropped.join(", ") || "none"}; ids gained: ${j.ids.gained.join(", ") || "none"}; `
    + `backlog lines: ${j.backlogOff.slice(0, 3).join("; ") || "conserved"}; cache lines: ${j.cacheOff.slice(0, 3).join("; ") || "conserved"}; `
    + `not moved as planned: ${j.notMoved.join(", ") || "none"}`;
  const judge = (nc, nb) => refillConserved({ cache, backlog, archives, newCache: nc, newBacklog: nb, take: sel.take });
  const planned = judge(plan.newCache, plan.newBacklog);
  if (!planned.ok) throw refusal("CONSERVATION_BROKEN", `the planned refill does not conserve the pipeline — ${say(planned)}. Nothing written.`);
  if (dryRun) return { ...base, written: false, conservation: planned.ids };
  /* CACHE FIRST: an interruption between the writes leaves a row in both files (P1 names it), never in neither. */
  writeFileSync(cachePath, plan.newCache);
  writeFileSync(backlogPath, plan.newBacklog);
  const disk = judge(readFileSync(cachePath, "utf8"), readFileSync(backlogPath, "utf8"));
  if (!disk.ok) {
    writeFileSync(cachePath, cache);
    writeFileSync(backlogPath, backlog);
    const restored = sha(readFileSync(cachePath, "utf8")) === sha(cache) && sha(readFileSync(backlogPath, "utf8")) === sha(backlog);
    throw refusal("CONSERVATION_BROKEN", `the refill did not conserve what was READ BACK — ${say(disk)}. `
      + `Both files restored from memory — restored byte-identically: ${restored ? "YES" : "NO"}.`);
  }
  return { ...base, written: true, conservation: disk.ids };
}

/* ---------------------------------------------------------------------------------- CLI */

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [cmd, ...rest] = process.argv.slice(2);
  const dryRun = rest.includes("--dry-run");
  const ids = rest.filter((a) => !a.startsWith("--"));
  const usage = () => { console.error("usage: ledger.mjs archive <ID> [<ID> ...] [--dry-run] | refill [--dry-run] | find <ID> | invariants | audit"); process.exit(2); };
  if (cmd === "archive") {
    if (!ids.length) usage();
    let moved = 0, refused = 0;
    for (const id of ids) {
      try {
        const r = archiveId(id, { dryRun });
        moved += r.moved.length;
        for (const x of r.results)
          console.log(`${dryRun ? "would move" : "moved"} ${id}: ${x.moved.length} row(s), `
            + `${x.moved.reduce((s, m) => s + m.bytes, 0)} bytes, ${LEDGERS[x.ledger].live} -> ${LEDGERS[x.ledger].archive}`
            + ` · id multiset of live ∪ archive conserved`);
        if (r.kept.length)
          console.log(`  kept live, not closed: ${r.kept.map((k) => `${k.ledger} ${k.id} · ${k.state} (line ${k.line})`).join("; ")}`);
      } catch (e) {
        if (!(e instanceof Refusal)) throw e;
        refused++;
        console.error(`REFUSED ${id} [${e.code}]: ${e.message}`);
      }
    }
    process.exit(refused ? 1 : 0);
  } else if (cmd === "find") {
    if (ids.length !== 1) usage();
    const f = findId(ids[0]);
    if (!f.length) { console.log(`${ids[0]}: not found in the cache, the backlog, the live DEBT ledger or any archive file`); process.exit(1); }
    for (const x of f) console.log(`${x.id} · ${x.state} · ${x.ledger} ${x.where} · ${x.file}:${x.line}`);
  } else if (cmd === "refill") {
    if (ids.length) usage();
    let r;
    try { r = refill({ dryRun }); }
    catch (e) {
      if (!(e instanceof Refusal)) throw e;
      console.error(`REFUSED refill [${e.code}]: ${e.message}`);
      process.exit(1);
    }
    console.log(`the cache held ${r.cacheRowsBefore} row(s); room for ${r.room} of ${CACHE_ROWS}`);
    for (const m of r.moved) console.log(`${dryRun ? "would move" : "moved"} ${m.id} (backlog line ${m.line}, ${m.bytes} B) -> ${LEDGERS.QUEUE.live}`);
    for (const s of r.skipped) console.log(`  skipped ${s.id} · ${s.state} (backlog line ${s.line}): ${s.why}`);
    if (!r.moved.length) console.log(`nothing moved — ${r.room ? "the backlog has nothing runnable" : "the cache is full"}`);
    else console.log(`${r.moved.length} row(s) ${dryRun ? "would move" : "moved"} · id multiset of cache ∪ backlog ∪ archive conserved`
      + (dryRun ? " (planned)" : " (read back from disk)"));
  } else if (cmd === "invariants") {
    const a = ledgerAudit();
    if (!a.pipeline) { console.log(`UNKNOWN — could not read ${a.unreadable.join(", ")}. An unreadable ledger is not an empty one.`); process.exit(1); }
    let failN = 0;
    for (const [k, arm] of Object.entries(a.pipeline.arms)) {
      const verdict = !arm.violations.length ? "PASS" : arm.armed ? "FAIL" : "WARN";
      if (verdict === "FAIL") failN++;
      console.log(`${verdict}  ${k} ${arm.title}${arm.violations.length ? ` — ${arm.violations.length}` : ""}`);
      for (const v of arm.violations.slice(0, 12)) console.log(`        ${describeViolation(k, v)}`);
      if (arm.violations.length > 12) console.log(`        … ${arm.violations.length - 12} more`);
      if (verdict === "WARN") console.log(`        (WARN until ${ARMING.pipeline} is done — the migration makes this satisfiable)`);
    }
    for (const u of a.pipeline.unjudged) console.log(`UNJUDGED  ${u.id} · ${u.state} in the ${u.where} (line ${u.line}) — neither open nor closed`);
    console.log(`cache ${a.pipeline.cacheRows} row(s), backlog ${a.pipeline.backlogRows} row(s); ${failN} armed FAIL`);
    process.exit(failN ? 1 : 0);
  } else if (cmd === "audit") {
    const a = ledgerAudit();
    console.log(JSON.stringify(a, null, 2));
  } else usage();
}
