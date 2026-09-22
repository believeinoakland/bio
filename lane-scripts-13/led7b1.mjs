// SCHEDULER #13, LED-7 batch S13-1: D-153 and D-156 CLOSED IN FACT (door 1), D-134 PLACED (door 2, run place13 for the
// row); MILESTONES lines; a DELEGATION to BOB with four questions (D-150, D-147, D-159 with D-165, D-128).
// Usage: TIP=<sha> node led7b1.mjs <repo> [--write]; then `ledger.mjs archive` each of the three.
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const REPO = resolve(process.argv[2]);
const WRITE = process.argv.includes("--write");
const TIP = process.env.TIP;
if (!TIP) { console.error("TIP=<sha>"); process.exit(2); }
const fail = (m) => { console.error("ABORT: " + m); process.exit(1); };
const rd = (p) => readFileSync(join(REPO, p), "utf-8");
const out = new Map();
const V = `\`${TIP}\``;
const { isClosedDebtRow, debtDisposition } = await import(join(REPO, "tools/owed.mjs"));
const DISP = {
  "D-153": `M10 · CLOSED 2026-09-22 IN FACT by LED-7 batch S13-1 (SCHEDULER #13): DEC-13's ruled workflow is on the tree. C-2.10's \`request_for_comment\` arm (\`bio-checks.mjs\`) refuses a comment request naming zero inquiries (the specifics the Columbia review found missing) and requires its response window as a clock entry; the correspondence ledger records a non-response dated by when the reply was due; \`BIO_Publication_v0_1.md\` §3 rule 6 folds the right of reply as the group's declaration in its recorded bias, and §4's table reads it RULED and BUILT (verified on ${V}). REC-14 and REC-24 are done; UI-17, the ceremony, stays blocked in \`BACKLOG.md\` (DEC-33).`,
  "D-156": `M10 · CLOSED 2026-09-22 IN FACT by LED-7 batch S13-1 (SCHEDULER #13): the documentation pass is made. \`BIO_Publication_v0_1.md\` §6 states that an audience is a READER of a published case, distinct from the requirements' user types and archetypes, though one person may be both, and cites this row (verified on ${V}); no code was ever in scope.`,
  "D-134": `M8 · CLOSED 2026-09-22 AS A DEBT ROW by LED-7 (SCHEDULER #13) — PLACED as a BACKLOG task under its own id, D-134 (owner UI, M8), with the M8 features after D-126, resting on REC-159. Verified before placing, on ${V}: \`memberadd\`, \`memberset\`, \`signeradd\` and \`signerset\` occur 0 times in \`civicos-ui/app.html\`; D-136's fence is done; BOB #17 ordered the surface behind it and BOB #18 discharged BOB's half (2026-09-20).`,
};
const lines = rd("docs/development/DEBT.md").split("\n");
for (const [id, nd] of Object.entries(DISP)) {
  const i = lines.findIndex((l) => l.startsWith(`| ${id} |`)); if (i < 0) fail(`${id} not in DEBT.md`);
  if (nd.includes("|")) fail(`${id}: disposition contains a pipe`);
  if (!isClosedDebtRow(nd)) fail(`${id}: disposition does not read CLOSED`);
  const line = lines[i].replace(/\s+$/, ""); const prior = debtDisposition(line);
  const cells = line.replace(/\|$/, "").split(" | "); if (cells.length !== 5) fail(`${id}: ${cells.length} cells`);
  cells[3] = `${cells[3]} — PRIOR DISPOSITION, moved verbatim at the close: ${prior}`; cells[4] = nd;
  const o = cells.join(" | ") + " |";
  if (debtDisposition(o) !== nd) fail(`${id}: read-back differs`);
  if (!isClosedDebtRow(debtDisposition(o))) fail(`${id}: read-back not closed`);
  lines[i] = o;
}
out.set("docs/development/DEBT.md", lines.join("\n"));

const ml = rd("docs/development/MILESTONES.md").split("\n");
const drop = (prefix) => { const i = ml.findIndex((l) => l.startsWith(prefix)); if (i < 0) fail(`MILESTONES: ${prefix}`); ml.splice(i, 1); };
drop("| D-153 AUDIENCES H4/H6 are the workflow");
drop("| D-156 \"audience\" names two things");
const i134 = ml.findIndex((l) => l.startsWith("| D-134 ")); if (i134 < 0) fail("MILESTONES D-134");
ml[i134] = "| D-134 the administrator WRITE surface: §4.9's four custodial acts have no UI call site | UI | M8 · PLACED 2026-09-22 in `BACKLOG.md` (LED-7), after D-126, resting on REC-159 |";
out.set("docs/development/MILESTONES.md", ml.join("\n"));

const DELEG = `## DELEGATION 2026-09-22 SCHEDULER (#13) -> BOB — **FOUR QUESTIONS, ONE EACH, from LED-7 batch S13-1: D-150's check on the completeness statement, D-147's request lifecycle, D-159 and D-165's door, D-128's flow model**

LED-7 batch S13-1 (SCHEDULER #13, verified on ${V}) closed D-153 and D-156 in fact and placed D-134. These four rows are
design rows the fold cannot move without a ruling; each question is single, and each answer disposes of its row.

1. **D-150 — the completeness statement's CHECK (M10, \`BIO_Publication_v0_1.md\`).** The authored exclusion statement is
   BUILT (REC-14, with its computed \`searched\` section). The row, from external evidence (the catch in the SBI and Rolling
   Stone reviews was a second person with standing, overruled), says the field is necessary and NOT sufficient: *"Do not
   build the field and call the problem solved."* It names two candidates: a second member's acknowledgement of the
   statement before publication, or the statement as the thing a reviewer is specifically asked to attack (the review
   copy, DEC-31, is built on the plane). **Which, or both, and designed where (Publication §3 or §6A)?**
2. **D-147 — the records-request LIFECYCLE (M10, \`BIO_Case_Making_v0_1.md\` §2).** \`action\` runs planned, active,
   awaiting_response, resolved or abandoned; the row names four decision points with their own clocks (the fee estimate,
   the fee-waiver decision and the stages after). BOB #26 kept it a design row beside D-148 and D-149, placed today, whose
   quote revision chain lands each later stage as its own entry. **Design it now in §2, or state it deferred with a
   trigger in Case Making's Incomplete sections?**
3. **D-159 and D-165 — two DEFERRALS WITH TRIGGERS (M10, \`BIO_Case_Making_v0_1.md\`).** D-159 (an ungraded leg costs a
   conclusion nothing: WATCH until a real group has run M10) and D-165 (what each action kind requires is unmodelled:
   deferred until S11 exists and members answer the backward question by hand). Case Making's front matter states both,
   D-159 as *"open · WATCH"*. **Door 3 (archived pointing at the front matter, which BOB rewords from open to deferred
   with its trigger, so the two records agree) or door 2 (a blocked backlog row each, carrying its trigger)?** SCHEDULER
   recommends door 3: a blocked row costs about 1 KiB of a full backlog, and every placement now cuts the next rows to run.
4. **D-128 — THE FLOW MODEL (M4).** The declared-versus-observed delta is named in Case Making (*"THE FLOW MODEL"*), in
   \`BIO_Interaction_Constructs_v0_1.md\` and in \`NOTIFICATIONS.md\`, and nothing is rowed. **Is it designed enough to
   place as rows, or deferred (door 3 in its home's Incomplete sections), and which document is its home?**

**open as of 2026-09-22** — sent to BOB by message the same day; each answer disposes of its row (closed, placed or
narrowed), and nothing runnable waits on any of them.
`;
let c = rd("docs/development/CLAIMS.md");
c = c.replace(/\n*$/, "\n\n") + DELEG;
out.set("docs/development/CLAIMS.md", c);

for (const [p, t] of out) console.log(p, Buffer.byteLength(rd(p)), "->", Buffer.byteLength(t));
if (WRITE) { for (const [p, t] of out) writeFileSync(join(REPO, p), t); console.log("WRITTEN"); }
