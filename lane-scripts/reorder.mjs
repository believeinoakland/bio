// SCHEDULER #12's re-order of BACKLOG.md under Bob's ruling of 2026-09-22 (product before process).
// Usage: node reorder.mjs <repo> [--write]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REPO = process.argv[2];
const WRITE = process.argv.includes("--write");
const { queueRows } = await import(join(REPO, "tools/ledger.mjs"));
const BL = join(REPO, "docs/development/BACKLOG.md");
const CUTF = join(REPO, "docs/archive/ledgers/QUEUE-cut-2026-09-22.md");
const text = readFileSync(BL, "utf-8");
const cutText = readFileSync(CUTF, "utf-8");
const fail = (m) => { console.error("ABORT: " + m); process.exit(1); };
const B = (s) => Buffer.byteLength(s);

// ---- parse: preamble, then row blocks ----
const rows = queueRows(text);
const lines = text.split("\n");
const preamble = lines.slice(0, rows[0].start).join("\n");
const trimBlank = (s) => s.replace(/\n+$/, "");
const body = new Map(rows.map((r) => [r.id, trimBlank(r.body)]));
const oldOrder = rows.map((r) => r.id);
const serialize = (ids, bodies) => preamble + "\n" + ids.map((id) => bodies.get(id)).join("\n\n") + "\n";
if (serialize(oldOrder, body) !== text) fail("round-trip of the unchanged backlog is not byte-identical");

// ---- the new order ----
const MOVED = ["M0-101", "M0-84", "M0-85", "D-412", "REC-154", "CPDF-21", "M0-82", "LED-8", "LED-9", "D-107",
  "D-438", "M0-102", "M0-93", "M0-94", "D-380", "M0-80", "M0-92", "D-437", "M0-87", "M0-88", "M0-89", "D-439", "M0-95", "M0-96"];
const without = oldOrder.filter((id) => !MOVED.includes(id));
const at = without.indexOf("M0-105");
if (at < 0 || without[at - 1] !== "M0-104" || without[at - 2] !== "D-50") fail("anchor D-50, M0-104, M0-105 not found in sequence");
const newOrder = [...without.slice(0, at + 1), ...MOVED, ...without.slice(at + 1)];
const sortedEq = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
if (!sortedEq(oldOrder, newOrder) || newOrder.length !== oldOrder.length) fail("id multiset not conserved");

// ---- order-line edits: [id, exact old line, new line] ----
const RULING = "Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*";
const EDITS = [
  ["M0-101", "order: after M0-100, which it rests on, item 4 of the four in the ruling's order (SCHEDULER #8, 2026-09-21)",
   `order: behind the product rows, the first of the process rows Bob's ruling moved there, each in its prior relative order (${RULING} — no process row unless it cuts gate time or unblocks product): the path it takes off both sides of a rebase, \`QUEUE.md\`, is two lanes' and not every lane's as \`CLAIMS.md\` and \`DECIDED.md\` are, so the gate time it cuts is small; after M0-100, which it rests on (SCHEDULER #12, 2026-09-22; placed by SCHEDULER #8)`],
  ["M0-84", "order: directly after M0-81, which PREVENTS what this DETECTS (BOB #19, 2026-09-21): pure git, about a second, and it would have told BOB #18 at its next push (SCHEDULER #4, 2026-09-21)",
   `order: behind the product rows, first of the session-hygiene instruments (${RULING}: a detector neither cuts gate time nor unblocks product; SCHEDULER #12); after M0-81, which PREVENTS what this DETECTS (BOB #19, 2026-09-21): pure git, about a second (SCHEDULER #4, 2026-09-21)`],
  ["M0-85", "order: with M0-81 (BOB #19, 2026-09-21); `blocked` because no worker can take it — the definition is Bob's to approve and is never changed from here (SCHEDULER #4, 2026-09-21)",
   `order: behind the product rows with the session-hygiene instruments (${RULING}; SCHEDULER #12), M0-81's class (BOB #19, 2026-09-21); \`blocked\` because no worker can take it — the definition is Bob's to approve and is never changed from here (SCHEDULER #4, 2026-09-21)`],
  ["REC-154", "order: after D-339 with the corrections: it is not a defect in the product, but it breaks the READING BUDGET doctrine for the busiest build lane, and every RECORD worker pays it on every spawn. Cheap and mechanical (SCHEDULER #2, 2026-09-19)",
   `order: behind the product rows, first of the reading-budget rows (${RULING}: an over-budget kickoff costs every RECORD spawn context, not gate time, and blocks no product; SCHEDULER #12); not a defect in the product, cheap and mechanical (SCHEDULER #2, 2026-09-19)`],
  ["LED-8", "order: SIXTH. AMBIGUITY STATED, not the record over-claiming: the tools REFUSE loudly rather than corrupt (`archive D-121 --dry-run` prints both dispositions and stops), while every row above is SILENTLY wrong. Loud beats silent, and blocking LED-7 on two rows of 211 does not outrank five silent ones (SCHEDULER #2 + BOB #17, 2026-09-19)",
   `order: behind the product rows, first of the ledger tooling (Bob, 2026-09-22: *process is overhead*; SCHEDULER #12): AMBIGUITY STATED, not the record over-claiming — the tools REFUSE loudly rather than corrupt (\`archive D-121 --dry-run\` prints both dispositions and stops), and LED-7 folds around the two rows (SCHEDULER #2 + BOB #17, 2026-09-19)`],
  ["D-438", "order: FIRST of the instrument cluster, with M0-93: a control red on a green `main` measures nothing, D-355's class, and the DEC-49 guard is what a member's refusal words rest on (SCHEDULER #7, 2026-09-21; the D-254 worker via CONDUCT #10)",
   `order: behind the product rows, FIRST of the instrument cluster, which follows in its prior order (${RULING}: no battery runs a \`.control.mjs\`, so repairing one cuts no gate time and unblocks no product; SCHEDULER #12); with M0-93: a control red on a green \`main\` measures nothing, D-355's class (SCHEDULER #7, 2026-09-21)`],
  ["D-54", "order: with DIST's rows, after D-107: preventive, a configuration nothing reads wrong today (SCHEDULER #7, 2026-09-21, LED-7)",
   `order: with the product rows, after CAP-14: a preventive M7 configuration nothing reads wrong today; D-107, beside which it stood, is DIST's deploy tooling and moved behind the product rows (${RULING}) (SCHEDULER #12; placed by SCHEDULER #7, 2026-09-21, LED-7)`],
  ["REC-155", "order: where it stood, below the ledger tooling, now with its design (BOB #20's entry): the plane is honest here — a determination was owed, not a defect shipping — and this landing refuses nobody (SCHEDULER #5, 2026-09-21; placed by SCHEDULER #3, 2026-09-19)",
   "order: where it stood, now with its design (BOB #20's entry): the plane is honest here — a determination was owed, not a defect shipping — and this landing refuses nobody (SCHEDULER #5, 2026-09-21; placed by SCHEDULER #3, 2026-09-19)"],
  ["COFF-13", "order: below LED-8, above the features: it refuses something TRUE — a record defect, not a gap — but errs in the CONSERVATIVE direction and reaches only decks with unreadable trailing slides, so it ranks under the defects above it (SCHEDULER #2, 2026-09-19)",
   "order: below the M8 corrections, above the features (it sat below LED-8, which Bob's ruling of 2026-09-22 moved behind the product rows — SCHEDULER #12): it refuses something TRUE — a record defect, not a gap — but errs in the CONSERVATIVE direction and reaches only decks with unreadable trailing slides, so it ranks under the defects above it (SCHEDULER #2, 2026-09-19)"],
  ["D-162", "order: with the meaning-layer features (M4), after the instrument cluster, as BOB #23 placed it; after D-394, since a NEW construct follows the rows completing built ones (REC-122 finishes D-161; D-394 reads the built chain) (SCHEDULER #9, 2026-09-21)",
   "order: with the meaning-layer features (M4), where BOB #23 placed it (after the instrument cluster, which Bob's ruling of 2026-09-22 moved behind the product rows — SCHEDULER #12); after D-394, since a NEW construct follows the rows completing built ones (REC-122 finishes D-161; D-394 reads the built chain) (SCHEDULER #9, 2026-09-21)"],
  ["M0-71", "order: the measurement IDENTIFY's judgement must pass, BEFORE anything a member sees; after REC-146 (SCHEDULER, 2026-09-19)",
   "order: the measurement IDENTIFY's judgement must pass, BEFORE anything a member sees; after REC-146 (SCHEDULER, 2026-09-19); a process row that stays among the product rows because it unblocks REC-147 (Bob, 2026-09-22: no process row unless it cuts gate time or unblocks product — SCHEDULER #12)"],
];
const newBody = new Map(body);
const expectedOrder = new Map();
for (const [id, oldL, newL] of EDITS) {
  const b = newBody.get(id);
  if (!b) fail(`no row ${id}`);
  const ls = b.split("\n");
  const idx = ls.findIndex((l) => l.startsWith("order: "));
  if (idx < 0 || ls.filter((l) => l.startsWith("order: ")).length !== 1) fail(`${id}: not exactly one order line`);
  if (ls[idx] !== oldL) fail(`${id}: order line differs from the expected old text:\n${ls[idx]}`);
  ls[idx] = newL;
  newBody.set(id, ls.join("\n"));
}
for (const id of newOrder) expectedOrder.set(id, newBody.get(id).split("\n").find((l) => l.startsWith("order: ")));

// ---- cut from the foot until under budget (SCHEDULER.md "CUTTING TO FIELDS, MECHANICALLY") ----
const LIMIT = 150 * 1024;
const MARGIN = Number(process.env.MARGIN || 0);
const TAIL = " … (whole text: the cut archive)";
const isCut = (b) => /\ncut: /.test(b);
// A cut point is admissible when no code span, italic quote or quoted §"anchor" is left open; an open
// bold is CLOSED at the cut (`**`), as SCHEDULER #11's cuts of M0-89 and M0-95 did.
const sectionQuoteOpen = (s) => { const i = s.lastIndexOf('§"'); return i >= 0 && s.indexOf('"', i + 2) < 0; };
const balanced = (s) => ((s.match(/`/g) || []).length % 2 === 0)
  && ((s.match(/\*"/g) || []).length === (s.match(/"\*/g) || []).length) && !sectionQuoteOpen(s) && ((s.match(/"/g) || []).length % 2 === 0);
function trunc(line, max) {
  if (line.length <= max + TAIL.length) return line;
  let cut = line.lastIndexOf(" ", max);
  while (cut > 20) {
    let head = line.slice(0, cut).replace(/[\s,;:—–-]+$/, "");
    if (balanced(head)) {
      if ((head.match(/\*\*/g) || []).length % 2 === 1) head += "**";
      return head + TAIL;
    }
    cut = line.lastIndexOf(" ", cut - 1);
  }
  fail("cannot truncate in balance: " + line.slice(0, 80));
}
const KEEP_WHOLE = /^(order|added|cut): /;
const FIELD_MAX = { milestone: 110, interface: 110, design: 110, "depends-on": 110, "behind-interface": 110, "accepts-when": 190 };
function cutRow(id, b) {
  const ls = b.split("\n");
  const out = [];
  const removed = [];
  out.push(trunc(ls[0], 150));
  for (const l of ls.slice(1)) {
    const m = /^([a-z-]+): /.exec(l);
    if (m && KEEP_WHOLE.test(l)) { out.push(l); continue; }
    if (m && FIELD_MAX[m[1]]) { out.push(trunc(l, FIELD_MAX[m[1]])); continue; }
    removed.push(l); // scope, narrative, NEGATIVE CONTROL and any other line
  }
  // the cut: line goes after added: (or last)
  out.push(`cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «${id}» in \`docs/archive/ledgers/QUEUE-cut-2026-09-22.md\`. A worker READS IT before building.`);
  return { cutBody: out.join("\n"), removed };
}
let order = newOrder;
let outText = serialize(order, newBody);
const archiveAdds = [];
const cutIds = [];
for (let i = order.length - 1; i >= 0 && B(outText) > LIMIT - MARGIN; i--) {
  const id = order[i];
  const b = newBody.get(id);
  if (isCut(b)) continue;
  const { cutBody } = cutRow(id, b);
  archiveAdds.push(`#### cut: ${id}\n\n` + b.split("\n").map((l) => "> " + l).join("\n") + "\n");
  newBody.set(id, cutBody);
  cutIds.push(id);
  outText = serialize(order, newBody);
}

// ---- assertions ----
const after = queueRows(outText);
if (!sortedEq(after.map((r) => r.id), oldOrder)) fail("ids changed");
if (JSON.stringify(after.map((r) => r.id)) !== JSON.stringify(newOrder)) fail("order not as planned");
for (const r of after) {
  const ol = trimBlank(r.body).split("\n").find((l) => l.startsWith("order: "));
  if (ol !== expectedOrder.get(r.id)) fail(`${r.id}: order line moved by the cut`);
  if (r.bytes > 2048) fail(`${r.id}: row ${r.bytes} B over the 2048 B row budget`);
}
const newCutText = archiveAdds.length
  ? cutText.replace(/\n*$/, "\n\n") + "## Cut by SCHEDULER #12 (2026-09-22), at the re-order under Bob's ruling of 2026-09-22 (product before process)\n\n" + archiveAdds.join("\n")
  : cutText;
for (const id of cutIds) {
  const pre = body.get(id) === newBody.get(id) ? null : null;
}
// every line removed or truncated by a cut is present verbatim in the archive
for (const id of cutIds) {
  const pre = EDITS.find((e) => e[0] === id) ? null : body.get(id);
  const src = pre ?? archiveAdds.find((a) => a.startsWith(`#### cut: ${id}\n`));
  const preLines = (pre ?? src.split("\n").slice(2).map((l) => l.replace(/^> /, "")).join("\n")).split("\n");
  for (const l of preLines) if (!newCutText.includes("> " + l)) fail(`${id}: line not in the archive: ${l.slice(0, 60)}`);
}
console.log("backlog bytes:", B(text), "->", B(outText), " budget", LIMIT, " headroom", LIMIT - B(outText));
console.log("cut:", cutIds.join(", ") || "(none)");
for (const [id] of EDITS) console.log("edited", id.padEnd(8), "row bytes", B(newBody.get(id)));
console.log("moved block now at positions", newOrder.indexOf("M0-101") + 1, "…", newOrder.indexOf("M0-96") + 1, "of", newOrder.length);
if (WRITE) {
  writeFileSync(BL, outText);
  if (archiveAdds.length) writeFileSync(CUTF, newCutText);
  console.log("WRITTEN");
}
