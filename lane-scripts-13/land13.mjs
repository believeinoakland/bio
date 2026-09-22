// SCHEDULER #13's landing: phase --flips (the done words on the cache rows CONDUCT reported), phase --rest (the three
// BOB INBOX drains, the DEBT dispositions of D-148/D-149/D-278 by door 2, MILESTONES, LED-7's pointer, CLAIMS lines).
// Usage: node land13.mjs <repo> --flips|--rest [--write]. Every edit is asserted to happen exactly once.
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const REPO = resolve(process.argv[2]);
const WRITE = process.argv.includes("--write");
const PHASE = process.argv.includes("--flips") ? "flips" : process.argv.includes("--rest") ? "rest" : null;
const TIP = process.env.TIP;            // origin/main tip the landing is verified on, short sha
const BASE_TIP = process.env.BASE_TIP;  // origin/main tip the completions landed in
if (!PHASE || !TIP) { console.error("usage: TIP=<sha> node land13.mjs <repo> --flips|--rest [--write]"); process.exit(2); }
const fail = (m) => { console.error("ABORT: " + m); process.exit(1); };
const rd = (p) => readFileSync(join(REPO, p), "utf-8");
const out = new Map();
const once = (s, a, b, what) => { const n = s.split(a).length - 1; if (n !== 1) fail(`${what}: ${n} occurrences`); return s.replace(a, () => b); };

if (PHASE === "flips") {
  // ---- the done words, each verified an ancestor AND BY CONTENT before this runs (the lane's law) ----
  const DONE = JSON.parse(readFileSync(new URL("./done13.json", import.meta.url), "utf-8"));
  let q = rd("docs/development/QUEUE.md");
  for (const [id, text] of Object.entries(DONE)) {
    const head = `### ${id} · running — `;
    q = once(q, head, `### ${id} · done — **DONE: ${text}** `, `${id} running heading`);
  }
  out.set("docs/development/QUEUE.md", q);
}

if (PHASE === "rest") {
  // ---- 1. the three inbox entries, verbatim, to the drained archive ----
  let q = rd("docs/development/QUEUE.md");
  const cacheAt = () => q.indexOf("## THE CACHE");
  const take = (start) => {
    const s0 = q.indexOf(start);
    if (s0 < 0 || s0 > cacheAt()) fail(`entry not in the inbox: ${start.slice(0, 60)}`);
    let e0 = cacheAt();
    const nx = q.indexOf("\n**2026-", s0 + start.length);
    if (nx >= 0 && nx < e0) e0 = nx + 1;
    const entry = q.slice(s0, e0).replace(/\n+$/, "");
    q = q.slice(0, s0) + q.slice(e0);
    return entry;
  };
  const E1 = take("**2026-09-22 · BOB #26 · BOB RULED THE THREE TREE-SHARING CHANGES");
  const E2 = take("**2026-09-22 · BOB #26 · D-278 RULED, ONE DETERMINATION PER GROUP");
  const E3 = take("**2026-09-22 · BOB #26 · BOB RULED D-148 AND D-149");
  q = q.replace(/\n{3,}## THE CACHE/, "\n\n## THE CACHE");
  if (q.slice(q.indexOf("## BOB INBOX"), cacheAt()).includes("\n**2026-")) fail("an entry is left in the inbox");
  // LED-7's pointer to M0-109's DELEGATION (a pointer, not a copy)
  const LED7 = "\naccepts-when: as §3 states it.\n";
  q = once(q, LED7, " **OWED FROM M0-109's DELEGATION** (`CLAIMS.md`, 2026-09-22; SCHEDULER #13): the batch that moves D-388 waits on M0-115 (item 1); the CLOSING landing's retargets are §3's list, which BOB #27 widened to items 2 and 3 the same day." + LED7, "LED-7 scope end");
  out.set("docs/development/QUEUE.md", q);

  let d = rd("docs/archive/ledgers/BOB-INBOX-drained.md");
  const H1 = `## DRAINED 2026-09-22 by SCHEDULER #13 — BOB #26's TREE-SHARING entry (\`336e9f82\`), verified at \`TREE-SHARING.md\` §1–§4 on \`${TIP}\`: item 1 PLACED as M0-110 and item 3 as M0-111 by SCHEDULER #12 (\`50e91494\`); item 2 PLACED as M0-114, BLOCKED on the first cloud session's FULL gate time and pass count (\`kickoffs/NEW-MACHINE.md\` §0), BOB #27's call on §4 (\`d0e75a16\`): *"it waits for the first cloud measurement"*; beside M0-110 and ahead of M0-111, the design's order of the three changes. M0-110 split into two stages the same day (BOB #27; TREE-SHARING, their order).`;
  const H2 = `## DRAINED 2026-09-22 by SCHEDULER #13 — BOB #26's D-278 entry (\`84dd441f\`), verified at \`INTERFACES.md\` I3's Answers bullet and at the code on \`${TIP}\`: group (1) CLOSED IN FACT (\`NOT_AUTHENTICATED\`, C-38.1, the admission gate in \`index.mjs\`, REC-79 at \`4df1cd06\`); group (3) a stated design exception; item 1 PLACED as D-278 (RECORD, M9) after D-125 and before COFF-13, keeping its id; its DEBT row archived as placed, SCHEDULER #12's carry note (*all five groups stand*) corrected for (1). The entry's \`d270-reach.test.mjs\` is \`d270-refusal-truth.test.mjs\` on \`main\`; the row names the latter.`;
  const H3 = `## DRAINED 2026-09-22 by SCHEDULER #13 — BOB #26's D-148/D-149 entry (\`0ce7447b\`), verified at \`BIO_Case_Making_v0_1.md\` §2 (both rulings, with Bob's words) and at the code on \`${TIP}\` (\`node tools/status.mjs 8.action\`: BUILT; C-2.10 in the catalogue): item 1 PLACED as D-148 and item 2 as D-149, after UI-69 with the M10 case path, each keeping its id, from SCHEDULER #12's held drafts (\`origin/scheduler12/row-drafts\`), re-verified; their DEBT rows archived as placed; D-147 stays a design row in \`DEBT.md\`.`;
  d = d.replace(/\n*$/, "\n\n") + H1 + "\n\n" + E1 + "\n\n" + H2 + "\n\n" + E2 + "\n\n" + H3 + "\n\n" + E3 + "\n";
  out.set("docs/archive/ledgers/BOB-INBOX-drained.md", d);

  // ---- 2. DEBT dispositions, door 2; the prior disposition moves VERBATIM into the description cell ----
  const { isClosedDebtRow, debtDisposition } = await import(join(REPO, "tools/owed.mjs"));
  const V = `\`${TIP}\``;
  const P = (m, id, where, evidence) => `${m} · CLOSED 2026-09-22 AS A DEBT ROW by LED-7 (SCHEDULER #13) — PLACED as a BACKLOG task under its own id, ${id} (owner RECORD, ${m}), ${where}. Verified before placing, on ${V}: ${evidence}`;
  const DISP = {
    "D-148": P("M10", "D-148", "after UI-69 with the M10 case path, on Bob's ruling of 2026-09-22 folded into `BIO_Case_Making_v0_1.md` §2 (BOB #26)", "the action and its correspondence are BUILT (`node tools/status.mjs 8.action`) and carry no quote grammar; D-147, the lifecycle, stays a design row."),
    "D-149": P("M10", "D-149", "directly after D-148, on Bob's ruling of 2026-09-22 folded into `BIO_Case_Making_v0_1.md` §2 (BOB #26)", "an action carries no citation of the laws governing the agency asked; `action` is BUILT (`node tools/status.mjs 8.action`)."),
    "D-278": P("M9", "D-278", "after D-125 and before COFF-13, with the refusal class, on BOB #26's per-group ruling in `INTERFACES.md` I3's Answers bullet", "groups (4), (5) and (2) answer a bare `error` in `index.mjs` (the four storage 503s, `unknown op`, the pre-authentication argument complaints and `claim`'s three bootstrap-credential complaints). Group (1) is CLOSED IN FACT: REC-79 coded it on 2026-08-09 (`NOT_AUTHENTICATED`, C-38.1, the admission gate, `4df1cd06`), so the carry note below (*all five groups stand*) was wrong for (1), SCHEDULER #12 having grepped single-line refusals. Group (3), the 405s, is a stated design exception (the same bullet)."),
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

  // ---- 3. MILESTONES ----
  const ml = rd("docs/development/MILESTONES.md").split("\n");
  for (const id of ["D-148", "D-149"]) {
    const i = ml.findIndex((l) => l.startsWith(`| ${id} `)); if (i < 0) fail(`MILESTONES ${id}`);
    if (ml[i].includes("PLACED")) fail(`MILESTONES ${id} already placed`);
    ml[i] = ml[i].replace(/\s*\|\s*$/, "") + " · PLACED 2026-09-22 in `BACKLOG.md` on Bob's ruling (BOB #26) |";
  }
  out.set("docs/development/MILESTONES.md", ml.join("\n"));

  // ---- 4. CLAIMS.md: the dated lines at the end of the DELEGATIONs this lane acts on, then this lane's block ----
  let c = rd("docs/development/CLAIMS.md");
  const D109 = "**open as of 2026-09-22** — item 1 is owed ahead of the LED-7 batch that moves D-388; items 2 and 3 with LED-7's closing\nlanding. Nothing runnable waits on any of them today.\n";
  c = once(c, D109, D109 + `**PLACED 2026-09-22 by SCHEDULER #13:** item 1 as M0-115 (\`BACKLOG.md\`, behind the product rows with the ledger tooling after LED-9, since D-388 is a question with BOB and moves only when it rules; its order line says it lands first); items 2 and 3 are LED-7's CLOSING landing's, in \`WORK-PIPELINE.md\` §3's retarget list since BOB #27 folded them, and pointed at from LED-7's cache row.\n`, "M0-109 DELEGATION open line");
  const D12 = "**DISCHARGED 2026-09-22 by BOB #26:** item 3 answered — D-278 ruled per group in `INTERFACES.md` I3 \"Answers\"";
  const at12 = c.indexOf(D12); if (at12 < 0 || c.indexOf(D12, at12 + 1) >= 0) fail("SCHEDULER (#12) DELEGATION discharge line");
  const eol12 = c.indexOf("\n", at12);
  c = c.slice(0, eol12 + 1) + `**PLACED 2026-09-22 by SCHEDULER #13:** D-278 as one RECORD M9 row keeping its id, after D-125 and before COFF-13; its DEBT row archived as placed, group (1) recorded CLOSED IN FACT.\n` + c.slice(eol12 + 1);
  // No claim block (CLAUDE.md §4, BOB #27, 2026-09-22: a claim released in its own commit is written by no one).
  const P12 = "This claim passes to SCHEDULER #13, who supersedes it when it archives this session.\n";
  c = once(c, P12, P12 + "**released 2026-09-22 by SCHEDULER #13**, which archived SCHEDULER #12 under D-398's three conditions and writes no successor claim: the lane's own files need none (`kickoffs/SCHEDULER.md`), and a claim released in its own commit is written by no one (`CLAUDE.md` §4, BOB #27).\n", "SCHEDULER #12 claim");
  const O99 = "**open as of 2026-09-22** — open until M0-99 lands and each owner has corrected its sentence or said why not; nothing here blocks a runnable row.\n";
  if (process.env.M99 === "done") c = once(c, O99, O99 + "**Item 9 CORRECTED 2026-09-22 by SCHEDULER #13** in `kickoffs/SCHEDULER.md`: both sentences now say `docs/DECIDED.md` is not committed (M0-99) and a pre-M0-99 side's copy is dropped, so take the deletion.\n", "M0-99 DELEGATION open line");
  out.set("docs/development/CLAIMS.md", c);

  console.log("entries moved:", [E1, E2, E3].map((e) => e.length).join(", "), "chars");
}

for (const [p, t] of out) console.log(p, Buffer.byteLength(rd(p)), "->", Buffer.byteLength(t));
if (WRITE) { for (const [p, t] of out) writeFileSync(join(REPO, p), t); console.log("WRITTEN"); }
