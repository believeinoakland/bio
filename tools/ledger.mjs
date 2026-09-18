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
 *   node tools/ledger.mjs find <ID>                             where an id is, live or archived
 *   node tools/ledger.mjs audit                                 the three plancheck arms, printed
 *
 * ------------------------------------------------------------------ WHAT "CLOSED" MEANS, ONCE
 *
 * QUEUE: a row whose heading state is `done` or `superseded`. `owed.mjs` reads only `blocked`
 * headings from QUEUE, so no QUEUE row the archiver may move is one it reads.
 * DEBT: `isClosedDebtRow(debtDisposition(line))`, IMPORTED FROM `owed.mjs` AND DEFINED NOWHERE
 * ELSE. M-57 measured why: the August roll's definition (*the last cell lacks `open`*) would have
 * taken D-330, D-401, D-405 and D-407 off the owed list with nothing going red, and `owed.mjs`'s own
 * earlier test (*`CLOSED` anywhere in the cell*) called twelve OPEN rows closed. The definition,
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
 * `DECIDED.md` is regenerated after a real move (`decided.mjs` scans `docs/archive/`; M-57 measured
 * 0 of 1,080 rulings lost, re-attributed or re-dated by a whole-row move). `DEBT.md` may not fall
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
  QUEUE: { name: "QUEUE", live: "docs/development/QUEUE.md",
           archive: "docs/archive/ledgers/QUEUE-closed.md", family: /^QUEUE-.*\.md$/ },
  DEBT:  { name: "DEBT",  live: "docs/development/DEBT.md",
           archive: "docs/archive/ledgers/DEBT-closed.md",  family: /^DEBT-.*\.md$/ },
};
/* The files this archiver writes. `mintid.mjs` imports this list for its duplicate check. */
export const ARCHIVE_TARGETS = Object.values(LEDGERS).map((l) => l.archive);

export const CLOSED_QUEUE_STATES = new Set(["done", "superseded"]);
export const OPEN_QUEUE_STATES = new Set(["queued", "running", "blocked"]);
export const DEBT_FLOOR_BYTES = 10000;

/* THE BUDGET, AS THE ROW NAMES IT (start: QUEUE ≤ 150 KB, a row ≤ 3 KB), in KiB. DEBT's whole-
   file figure is NOT named by the row and is not invented here: it is printed, and LED-4 — which
   cuts DEBT's open rows to a paragraph of cost and one of disposition — is where it gets measured
   and set. The per-row figure applies to an OPEN row of either ledger. */
export const BUDGET = {
  QUEUE: { ledger: 150 * 1024, row: 3 * 1024 },
  DEBT:  { ledger: null,       row: 3 * 1024 },
};
/* An arm WARNs until the row that makes it satisfiable is `done`, then FAILs — read from the
   ledger (live or archived) on every run, so nobody has to remember to flip it. (a) is keyed on
   the migration; (b) on the cut-to-fields, as the row says. */
export const ARMING = { closedLive: "LED-3", budget: "LED-4" };

const QHEAD = /^###\s+([A-Z][A-Z0-9]*-\d+)\s+·\s+([A-Za-z-]+)/;
const ANY_HEADING = /^#{1,3}\s/;
const DROW = /^\|\s*(D-\d+)\s*\|/;

/* WHICH LEDGERS AN ID CAN BE A ROW OF. A `D-n` is a DEBT row AND may also be a QUEUE item: 17
   QUEUE items are headed `### D-n · done` (the item that closed debt row D-n), measured 2026-09-18.
   The first draft routed every `D-` id to DEBT alone, and a full simulated migration left those 17
   closed QUEUE rows live — found by running the migration, not by reading the grammar. */
export const ledgersFor = (id) => (/^D-\d+$/.test(id) ? [LEDGERS.QUEUE, LEDGERS.DEBT] : [LEDGERS.QUEUE]);
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

export const rowsOf = (ledger, text) => (ledger.name === "DEBT" ? debtRows(text) : queueRows(text));

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

/** Where an id is: every row carrying it, live or archived, with its state. [] if nowhere. */
export function findId(id, { repo = ROOT } = {}) {
  const out = [];
  for (const ledger of ledgersFor(id))
    for (const [rel, where] of [[ledger.live, "live"], ...archiveFiles(ledger, { repo }).map((f) => [f, "archive"])]) {
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
    throw refusal("NOT_CLOSED", `${id} is not closed — ${rows.map((r) => ledger.name === "DEBT"
      ? `its disposition begins "${r.disposition.slice(0, 80)}"` : `its state is \`${r.state}\``).join("; ")}. `
      + (ledger.name === "DEBT"
        ? "A DEBT row is closed when its disposition LEADS with CLOSED/FIXED/RESOLVED/SUPERSEDED and declares no residue (owed.mjs isClosedDebtRow)."
        : "A QUEUE row is closed when its state is `done` or `superseded`."));
  const { lines } = linesOf(live);
  const blocks = closed.map((r) => lines.slice(r.start, r.end).join("\n"));
  const out = lines.slice();
  for (const r of [...closed].sort((a, b) => b.start - a.start)) out.splice(r.start, r.end - r.start);
  const newLive = out.join("\n");
  let base = archive === null || archive === "" ? ARCHIVE_HEADER[ledger.name] : archive;
  if (!base.endsWith("\n")) base += "\n";
  let appended = "";
  for (const b of blocks) {
    if (ledger.name === "QUEUE" && !(base + appended).endsWith("\n\n")) appended += "\n";
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

const L_HEADER = (ledger) => ARCHIVE_HEADER[ledger.name];

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

/** The three arms, as data. `plancheck` prints them; the suite judges them on fixtures. */
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
    if (l.name !== "QUEUE") continue;
    for (const r of rows) {
      if (!r.open) continue;
      const d = dependsOf(r.body);
      if (d.prose) { depends.prose.push({ id: r.id, value: d.value.slice(0, 120) }); continue; }
      for (const tok of [...d.ids, ...d.claims]) {
        depends.checked++;
        const res = resolveDependency(tok, { repo, claims });
        if (!res.ok) depends.unresolved.push({ id: r.id, line: r.line, dep: tok, why: res.why });
      }
    }
  }
  return { unreadable, armed, arming, closedLive, budget, depends, claimsReadable: claims !== null };
}

/* ---------------------------------------------------------------------------------- CLI */

function regenerateDecided(repo) {
  const r = spawnSync(process.execPath, [join(repo, "tools/decided.mjs")], { cwd: repo, encoding: "utf8" });
  return r.status;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [cmd, ...rest] = process.argv.slice(2);
  const dryRun = rest.includes("--dry-run");
  const ids = rest.filter((a) => !a.startsWith("--"));
  const usage = () => { console.error("usage: ledger.mjs archive <ID> [<ID> ...] [--dry-run] | find <ID> | audit"); process.exit(2); };
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
    if (moved && !dryRun) {
      const s = regenerateDecided(ROOT);
      console.log(`DECIDED.md regenerated (decided.mjs exit ${s}) — commit it in the SAME commit as the move.`);
      if (s !== 0) process.exit(1);
    }
    process.exit(refused ? 1 : 0);
  } else if (cmd === "find") {
    if (ids.length !== 1) usage();
    const f = findId(ids[0]);
    if (!f.length) { console.log(`${ids[0]}: not found in the live ledger or any archive file`); process.exit(1); }
    for (const x of f) console.log(`${x.id} · ${x.state} · ${x.ledger} ${x.where} · ${x.file}:${x.line}`);
  } else if (cmd === "audit") {
    const a = ledgerAudit();
    console.log(JSON.stringify(a, null, 2));
  } else usage();
}
