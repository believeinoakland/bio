/* rowdesign — a queue row names the DESIGN it builds from.
 *
 * THE RULE, and it is Bob's of 2026-09-14: `docs/architecture/CORPUS-STANDARD.md` §4.7 —
 * *"A queue row names the design it builds from — the governed document and section that is
 * its scope's authority"* — with `kickoffs/CONDUCT.md`'s "A ROW NAMES THE DESIGN IT BUILDS
 * FROM" as the half CONDUCT performs and `kickoffs/WORKER.md`'s "Read the design before the
 * code" as the half the worker performs.
 *
 * WHY IT IS AN INSTRUMENT RATHER THAN A PRACTICE. The receipt is in the standard's own §1:
 * the content construct sat undesigned for 46 days inside a document that never said what it
 * lacked, while items were built from ledger entries and briefs. A row whose design lives
 * only in a ledger entry, an inbox note or a spawn brief is that failure one level down — the
 * code gets built and the construct's document never learns it. A rule with no gate is the
 * class this repository refuses: `plancheck` runs this, so a row spawned against the ledger
 * FAILS before it reaches a worker.
 *
 * WHAT COUNTS AS NAMING A DESIGN, in the row's heading or on its `milestone:`,
 * `interface:` / `behind-interface:`, `design:` or `scope:` line:
 *
 *   1. A GOVERNED DESIGN DOCUMENT — any `docs/architecture/*.md`, or any path in
 *      `CORPUS-STANDARD.md` §5's governed table. THE SET IS READ, never listed: `governed()`
 *      is imported from `corpuscheck.mjs`, the same function the front-matter checker judges
 *      with, so a document joining §5's table is reachable by a row on the same commit and a
 *      hand list cannot fall behind the table (the D-113 class, closed the way this project
 *      closes it).
 *   2. An `IC-<n>` token. An interface change carries the contract the row builds to, and
 *      CONDUCT's own rule names one (`IC-83`) as a legitimate authority beside a document.
 *   3. `docs/development/VERIFICATION.md`, for an M0 row ONLY — see PROCESS_AUTHORITIES.
 *   4. An EXPLICIT ROUTED GAP: `design: MISSING — routed to BOB (CLAIMS.md DELEGATION …)`.
 *      An admitted gap is honest and schedulable; SILENCE is the defect. The pointer must
 *      name `CLAIMS.md`, because a gap routed nowhere is a gap wearing a label.
 *
 * WHAT THIS CANNOT SEE, stated rather than left to be discovered:
 *   - Whether a pointer is TRUE. It can prove a row names a governed document; it cannot
 *     prove the named section is the row's real authority, or that the section exists. That
 *     is the reviewer's job and the worker's first act (WORKER.md). A pointer invented to
 *     pass this check is worse than the gap it hides.
 *   - Whether an `IC-<n>` exists. `INTERFACE-CHANGES.md` is a ledger (§6) and the token is
 *     taken at face value; `plancheck`'s section 2 already grades `behind-interface:` I-ids
 *     against the registry, which is the adjacent question.
 *   - Rows that are not `queued` or `running`. History is not re-briefed (the row's own
 *     rule): a `done`, `blocked` or `superseded` row is NOT judged. Any other state token is
 *     reported in the corpus figure rather than silently scored — a thing the matcher does
 *     not understand must be NAMED.
 *   - A row under a heading the row grammar cannot read (`### CASE-5b · done`). It is NAMED
 *     by the lister (`strays`) and `plancheck` warns with it; its fields reach no arm here.
 *
 * WHICH ROWS: THE PLAN'S, CACHE ∪ BACKLOG, THROUGH `ledger.mjs`' ONE LISTER (D-430). This file
 * read `QUEUE.md` alone until 2026-09-18. WORK-PIPELINE §1 makes `QUEUE.md` a cache of at most
 * 8 rows and puts every other open item in `BACKLOG.md`, so once LED-6's migration moved the
 * rows, a backlog row naming no design would have passed this check and every gate that runs
 * it. The rows now come from `pipelineRows` — the same reader the archiver, the refill and the
 * five pipeline invariants use — and this file carries NO row grammar and reads NO ledger file
 * of its own. **Why not simply read `BACKLOG.md` here too:** that copy of the QUEUE reader
 * agrees with the lister today and drifts the day either file's grammar moves, with nothing
 * saying so; `bio-plane/test/pipeline-readers.test.mjs` §6 pins the structure for that reason.
 * plancheck §2's milestone and interface checks read the same rows, through `planFieldAudit`
 * below, for the same reason.
 */

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { governed } from "./corpuscheck.mjs";
import { pipelineRows, queueRows } from "./ledger.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* §4.7's sentence, quoted so the failure carries the rule and not a paraphrase of it. */
export const RULE_SENTENCE =
  "A queue row names the design it builds from — the governed document and section that is "
  + "its scope's authority (CORPUS-STANDARD.md §4.7).";

/* The states this rule judges, and the states it deliberately does not. */
export const JUDGED = new Set(["queued", "running"]);
export const NOT_JUDGED = new Set(["done", "blocked", "superseded"]);

/* THE ONE PROCESS DOCUMENT ACCEPTED AS AN AUTHORITY, AND THE REASON IS AT THE SITE.
 *
 * `docs/development/VERIFICATION.md` is UNGOVERNED by the standard — §6 puts the process
 * documents outside it on purpose ("they describe how the project works rather than what the
 * system is"), so it carries no front matter and `governed()` will never return it. AND IT IS
 * THE LAW THE M0 LANE BUILDS FROM: what "tested" means here, the negative-control register
 * and its grammar, the coverage floor, the battery's discovery rule, the declared-arm-count
 * rule (D-333). An M0 test-estate row pointing anywhere else would be pointing at a document
 * that does not govern it, and forcing one to invent an architecture citation is exactly the
 * "gate that pressures someone into inventing an attribution" CLAUDE.md calls a bug in the
 * gate.
 *
 * SCOPED TO M0 DELIBERATELY. This is an exception for the lane whose subject IS verification,
 * not a general licence to point a build row at a process document; a non-M0 row naming only
 * this file still fails, and that is the intended edge. If a second lane ever earns an entry
 * here, it gets its own line with its own reason — never a widened rule. */
export const PROCESS_AUTHORITIES = [
  { path: "docs/development/VERIFICATION.md", milestone: /\bM0\b/,
    why: "the TEST ESTATE's authority: ungoverned by CORPUS-STANDARD §6 (a process document, "
       + "so it carries no front matter) and the law the M0 lane builds from" },
];

/* An EXPLICIT routed gap. Written as three requirements rather than one long pattern so a
   near-miss spelling is still recognisably a routing attempt and not silently a pass. */
export const ROUTED_RE = /^design:\s*MISSING\b/m;
const ROUTED_TO = /\brouted to BOB\b/i;
const ROUTED_WHERE = /\bCLAIMS\.md\b/;

/* A row as this file judges it: the lister's row with its body as LINES. `at` is the heading's
   0-based index in its own file (the control driver removes a field by it). */
const asRow = (r) => ({ id: r.id, state: r.state, line: r.line, at: r.start, body: r.body.split("\n"),
                        file: r.file ?? null, where: r.where ?? null });

/* Rows of ONE text, in `ledger.mjs`' grammar — kept for callers that hold a text (the control
   drivers, `planning-hygiene`'s id-set arm). A row ENDS at the next heading of level 1-3.
   CHANGED 2026-09-18 (D-430) FROM THIS FILE'S OWN GRAMMAR, which ended a row at the next
   ITEM heading or `##`: the two bounds differ only at a `#` heading or a row-shaped `###`
   heading the grammar cannot read (`### CASE-5b · done`), where the old bound folded that row's
   fields into the row above — grading a row on somebody else's words, which the `##` bound
   (measured: `SK-5` once absorbed the whole DIST section) exists to refuse. Over the live
   QUEUE.md the two gave identical rows (27 of 27, measured 2026-09-18). */
export function openRows(text) {
  return queueRows(text).map(asRow);
}

/* THE PLAN'S ROWS — cache ∪ backlog, from `pipelineRows` and nothing else. `queue`/`backlog`
   inject fixture TEXTS (either given: fixture mode, and the other reads as EMPTY — a fixture
   never mixes with the live file); neither given: the live files under `repo`. */
export function planRows({ repo = ROOT, queue = null, backlog = null } = {}) {
  const texts = queue === null && backlog === null ? null : { QUEUE: queue ?? "", BACKLOG: backlog ?? "" };
  const p = pipelineRows({ repo, texts });
  const rows = p.rows.map(asRow);
  return { rows, strays: p.strays, unreadable: p.unreadable, cacheRows: p.cacheRows, backlogRows: p.backlogRows };
}

/* PLANCHECK §2's MILESTONE AND INTERFACE CHECKS, over the plan's rows (D-430). Until 2026-09-18
   plancheck matched `^milestone:` and `^behind-interface:` over QUEUE.md's whole text; they now
   read every line of every row the lister reads, in both files. **What that trades, measured:**
   the whole-text scan also reached three field lines under the row-shaped headings the grammar
   cannot read (`CASE-5b`, `D-329+D-331+D-333`, `UI-17a` — all `done`, all naming known
   milestones and I3); those are now NAMED as strays rather than read. No other field line in
   QUEUE.md lay outside a row. The registries are READ (`### M<n> ·` in MILESTONES.md, `## I<n> —`
   in INTERFACES.md), never listed. Either registry null: its half is not run, and says so. */
export const MILESTONE_FIELD = /^milestone:\s*(M\d+)/;
export const BEHIND_FIELD = /^behind-interface:\s*(.+)$/;
export function planFieldAudit(rows, { milestones = null, interfaces = null } = {}) {
  const knownMilestones = milestones === null ? null
    : new Set([...milestones.matchAll(/^###\s+(M\d+)\s+·/gm)].map((m) => m[1]));
  const knownInterfaces = interfaces === null ? null
    : new Set([...interfaces.matchAll(/^##\s+(I\d+)\s+—/gm)].map((m) => m[1]));
  const used = new Set(), unknownMilestone = [], unregisteredInterface = [];
  for (const r of rows) r.body.forEach((l, k) => {
    const at = { id: r.id, state: r.state, file: r.file, line: r.line + k };
    const m = MILESTONE_FIELD.exec(l);
    if (m && knownMilestones) {
      used.add(m[1]);
      if (!knownMilestones.has(m[1])) unknownMilestone.push({ ...at, milestone: m[1] });
    }
    const b = BEHIND_FIELD.exec(l);
    if (b && knownInterfaces)
      for (const id of (b[1].match(/\bI\d+\b/g) || []))
        if (!knownInterfaces.has(id)) unregisteredInterface.push({ ...at, interface: id });
  });
  return { rowsRead: rows.length, knownMilestones, knownInterfaces, used, unknownMilestone, unregisteredInterface };
}

/* The lines the rule reads: the heading itself plus the four fields §4.7 names.
   `behind-interface:` is accepted beside `interface:` — both spellings are live in this file
   and a row that names its IC on the one the rule's author did not think of is correct work
   in an unanticipated spelling, which is the over-strictness this estate keeps refusing. */
export const FIELD_RE = /^(?:milestone|(?:behind-)?interface|design|scope):/;
export function judgedText(row) {
  return [row.body[0], ...row.body.slice(1).filter((l) => FIELD_RE.test(l))].join("\n");
}

/* The governed set as an index: full paths, plus the basenames that resolve to exactly ONE
   governed path. A basename is accepted because that is how the corpus cites itself and how
   the rule's own examples are written (`BIO_Content_Framework_v0_10.md` Part II §18 piece 1,
   CONDUCT.md); an AMBIGUOUS basename is not, and `README.md` is the live instance — it names
   both `docs/architecture/README.md` and `docs/development/research/README.md`, and neither
   is what a row saying "README.md" means. Ambiguity resolves by writing the path. */
export function governedIndex(set = governed()) {
  const paths = new Set(set);
  const byBase = new Map();
  for (const p of set) {
    const b = p.slice(p.lastIndexOf("/") + 1);
    byBase.set(b, byBase.has(b) ? null : p);        // null marks "ambiguous"
  }
  return { paths, byBase };
}

/* What a row's judged text NAMES. Returns everything found, so the reporter can say WHY a row
   passed rather than only that it did. */
export function citations(text, index = governedIndex(), { milestone = "" } = {}) {
  const paths = new Set(), process = [];
  for (const m of text.matchAll(/docs\/[A-Za-z0-9._/-]+\.md/g))
    if (index.paths.has(m[0])) paths.add(m[0]);
  for (const m of text.matchAll(/[A-Za-z0-9._-]+\.md/g)) {
    const hit = index.byBase.get(m[0]);
    if (hit) paths.add(hit);
  }
  for (const a of PROCESS_AUTHORITIES) {
    const base = a.path.slice(a.path.lastIndexOf("/") + 1);
    const named = text.includes(a.path) || new RegExp(`(?<![\\w/])${base}\\b`).test(text);
    if (named && a.milestone.test(milestone)) process.push(a.path);
  }
  const ics = [...new Set((text.match(/\bIC-\d+\b/g) || []))];
  const routed = ROUTED_RE.test(text) && ROUTED_TO.test(text) && ROUTED_WHERE.test(text);
  return { paths: [...paths], ics, process, routed };
}

/* The audit. `queue`, `backlog` and `governedSet` are injectable so the suite can drive the
   judgement over fixtures — including a planted governed path, and a planted BACKLOG row —
   without writing to the tree. */
export function rowDesignAudit({ repo = ROOT, queue = null, backlog = null, governedSet = null } = {}) {
  const index = governedIndex(governedSet ?? governed());
  const plan = planRows({ repo, queue, backlog });
  const rows = plan.rows;
  const open = [], skipped = [], unknownState = [], findings = [];
  for (const row of rows) {
    if (!JUDGED.has(row.state)) {
      (NOT_JUDGED.has(row.state) ? skipped : unknownState).push(row);
      continue;
    }
    const judged = judgedText(row);
    const milestone = (row.body.find((l) => /^milestone:/.test(l)) || "");
    const c = citations(judged, index, { milestone });
    const ok = c.paths.length > 0 || c.ics.length > 0 || c.process.length > 0 || c.routed;
    const r = { id: row.id, state: row.state, line: row.line, file: row.file, ...c, ok };
    open.push(r);
    if (!ok) findings.push(r);
  }
  return { rows, open, skipped, unknownState, findings, governedCount: index.paths.size,
           strays: plan.strays, unreadable: plan.unreadable, cacheRows: plan.cacheRows, backlogRows: plan.backlogRows };
}

/* `QUEUE.md:12` / `BACKLOG.md:3` — the file a row is in, by basename, as the gate prints it. */
export const whereOf = (r) => `${String(r.file || "").split("/").pop() || "?"}:${r.line}`;

export function rowMessage(findings) {
  return `ROW NAMES NO DESIGN — ${findings.length} open plan row(s) (QUEUE.md ∪ BACKLOG.md) name no governed design\n`
    + `        document, no IC, and no routed gap:\n`
    + findings.map((f) => `          ${f.id} (${f.state}, ${whereOf(f)})`).join("\n")
    + `\n        ${RULE_SENTENCE}\n`
    + `        Add a \`design:\` line after \`interface:\` naming the governed document AND the\n`
    + `        SECTION (a section, never a line number — §4.6), or, where no governing design\n`
    + `        exists, route the gap: \`design: MISSING — routed to BOB (CLAIMS.md DELEGATION …)\`.\n`
    + `        An admitted gap is schedulable; silence is the defect. A pointer INVENTED to pass\n`
    + `        this check is worse than the gap it hides — the worker reads that section first.`;
}
