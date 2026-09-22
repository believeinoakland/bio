// SCHEDULER #12: place drafted rows into BACKLOG.md after their anchors, then cut from the foot to budget.
// Usage: node place.mjs <repo> [--write]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const REPO = process.argv[2];
const WRITE = process.argv.includes("--write");
const S = "/private/tmp/claude-501/-Users-sparky-Downloads-ClaudeCodeBIO--claude-worktrees-festive-agnesi-eb5410/e15ffee8-9cf9-4dcc-9683-ff5e8a62bafd/scratchpad/";
const { queueRows } = await import(join(REPO, "tools/ledger.mjs"));
const BL = join(REPO, "docs/development/BACKLOG.md");
const CUTF = join(REPO, "docs/archive/ledgers/QUEUE-cut-2026-09-22.md");
const text = readFileSync(BL, "utf-8");
const cutText = readFileSync(CUTF, "utf-8");
const fail = (m) => { console.error("ABORT: " + m); process.exit(1); };
const B = (s) => Buffer.byteLength(s);
const rows = queueRows(text);
const lines = text.split("\n");
const preamble = lines.slice(0, rows[0].start).join("\n");
const trimBlank = (s) => s.replace(/\n+$/, "");
const body = new Map(rows.map((r) => [r.id, trimBlank(r.body)]));
const serialize = (ids, bodies) => preamble + "\n" + ids.map((id) => bodies.get(id)).join("\n\n") + "\n";
if (serialize(rows.map((r) => r.id), body) !== text) fail("round-trip not byte-identical");

// [new id, anchor it follows] — in insertion order (a later one may anchor on an earlier new one)
const PLACE = [

  ["D-148", "UI-69"], ["D-149", "D-148"],
];
let order = rows.map((r) => r.id);
const oldIds = [...order];
for (const [id, anchor] of PLACE) {
  if (body.has(id)) fail(`${id} already in the backlog`);
  const b = trimBlank(readFileSync(S + `new-${id}.md`, "utf-8"));
  if (!b.startsWith(`### ${id} · queued — `)) fail(`${id}: draft heading`);
  const at = anchor === "^" ? -1 : order.indexOf(anchor);
  if (anchor !== "^" && at < 0) fail(`${id}: anchor ${anchor} not in the backlog`);
  order.splice(at + 1, 0, id);
  body.set(id, b);
}
const expectedOrderLine = new Map(order.map((id) => [id, body.get(id).split("\n").find((l) => l.startsWith("order: "))]));

// ---- cut from the foot (SCHEDULER.md "CUTTING TO FIELDS, MECHANICALLY") ----
const LIMIT = 150 * 1024;
const MARGIN = Number(process.env.MARGIN || 0);
const TAIL = " … (whole text: the cut archive)";
const isCut = (b) => /\ncut: /.test(b);
const sectionQuoteOpen = (s) => { const i = s.lastIndexOf('§"'); return i >= 0 && s.indexOf('"', i + 2) < 0; };
const balanced = (s) => ((s.match(/`/g) || []).length % 2 === 0)
  && ((s.match(/\*"/g) || []).length === (s.match(/"\*/g) || []).length) && !sectionQuoteOpen(s)
  && ((s.match(/"/g) || []).length % 2 === 0);
function trunc(line, max) {
  if (line.length <= max + TAIL.length) return line;
  let cut = line.lastIndexOf(" ", max);
  while (cut > 20) {
    let head = line.slice(0, cut).replace(/[\s,;:—–-]+$/, "");
    if (balanced(head)) { if ((head.match(/\*\*/g) || []).length % 2 === 1) head += "**"; return head + TAIL; }
    cut = line.lastIndexOf(" ", cut - 1);
  }
  fail("cannot truncate in balance: " + line.slice(0, 80));
}
const KEEP_WHOLE = /^(order|added|cut): /;
const FIELD_MAX = { milestone: 110, interface: 110, design: 110, "depends-on": 110, "behind-interface": 110, "accepts-when": 190 };
function cutRow(id, b) {
  const ls = b.split("\n");
  const out = [trunc(ls[0], 150)];
  for (const l of ls.slice(1)) {
    const m = /^([a-z-]+): /.exec(l);
    if (m && KEEP_WHOLE.test(l)) { out.push(l); continue; }
    if (m && FIELD_MAX[m[1]]) { out.push(trunc(l, FIELD_MAX[m[1]])); continue; }
  }
  out.push(`cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «${id}» in \`docs/archive/ledgers/QUEUE-cut-2026-09-22.md\`. A worker READS IT before building.`);
  return out.join("\n");
}
let outText = serialize(order, body);
const adds = []; const cutIds = []; const pre = new Map();
for (let i = order.length - 1; i >= 0 && B(outText) > LIMIT - MARGIN; i--) {
  const id = order[i]; const b = body.get(id);
  if (isCut(b)) continue;
  pre.set(id, b);
  adds.push(`#### cut: ${id}\n\n` + b.split("\n").map((l) => "> " + l).join("\n") + "\n");
  body.set(id, cutRow(id, b)); cutIds.push(id);
  outText = serialize(order, body);
}
if (B(outText) > LIMIT) fail(`still over budget after cutting every uncut row: ${B(outText)}`);

// ---- assertions ----
const after = queueRows(outText);
const newIds = PLACE.map((p) => p[0]);
if (JSON.stringify(after.map((r) => r.id)) !== JSON.stringify(order)) fail("order not as planned");
if (JSON.stringify([...after.map((r) => r.id)].sort()) !== JSON.stringify([...oldIds, ...newIds].sort())) fail("id set wrong");
for (const r of after) {
  if (trimBlank(r.body).split("\n").find((l) => l.startsWith("order: ")) !== expectedOrderLine.get(r.id)) fail(`${r.id}: order line moved`);
  if (r.bytes > 2048) fail(`${r.id}: ${r.bytes} B over the row budget`);
}
const newCut = adds.length ? cutText.replace(/\n*$/, "\n\n") + adds.join("\n") : cutText;
for (const [id, b] of pre) for (const l of b.split("\n")) if (!newCut.includes("> " + l)) fail(`${id}: line missing from the archive`);
console.log("backlog", B(text), "->", B(outText), "headroom", LIMIT - B(outText));
console.log("placed:", newIds.join(", "));
console.log("cut:", cutIds.join(", ") || "(none)");
if (WRITE) { writeFileSync(BL, outText); if (adds.length) writeFileSync(CUTF, newCut); console.log("WRITTEN"); }
