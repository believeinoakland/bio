// SCHEDULER #13 (from SCHEDULER #12's place2.mjs): place drafted rows into BACKLOG.md after their anchors (--place),
// and/or cut from the foot to the 150 KiB budget (--cut). Usage: node place13.mjs <repo> [--place] [--cut] [--write]
// Drafts are read from this scratchpad as new-<ID>.md. PLACE's order is insertion order (a later one may anchor on an
// earlier new one). The cut follows kickoffs/SCHEDULER.md "CUTTING TO FIELDS, MECHANICALLY".
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const REPO = resolve(process.argv[2]);
const DO_PLACE = process.argv.includes("--place");
const DO_CUT = process.argv.includes("--cut");
const WRITE = process.argv.includes("--write");
const S = dirname(fileURLToPath(import.meta.url)) + "/";
const PLACE = JSON.parse(process.env.PLACE || "[]"); // e.g. [["M0-112","M0-110"],["D-278","D-125"]]
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

let order = rows.map((r) => r.id);
const oldIds = [...order];
const newIds = [];
if (DO_PLACE) for (const [id, anchor] of PLACE) {
  if (body.has(id)) fail(`${id} already in the backlog`);
  const b = trimBlank(readFileSync(S + `new-${id}.md`, "utf-8"));
  if (!b.startsWith(`### ${id} · queued — `) && !b.startsWith(`### ${id} · blocked — `)) fail(`${id}: draft heading`);
  const at = order.indexOf(anchor);
  if (at < 0) fail(`${id}: anchor ${anchor} not in the backlog`);
  order.splice(at + 1, 0, id);
  body.set(id, b); newIds.push(id);
}
const expectedOrderLine = new Map(order.map((id) => [id, body.get(id).split("\n").find((l) => l.startsWith("order: "))]));

const LIMIT = 150 * 1024;
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
  out.push(`cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «${id}» in \`docs/archive/ledgers/QUEUE-cut-2026-09-22.md\`. A worker READS IT before building.`);
  return out.join("\n");
}
let outText = serialize(order, body);
const adds = []; const cutIds = []; const pre = new Map();
if (DO_CUT) for (let i = order.length - 1; i >= 0 && B(outText) > LIMIT; i--) {
  const id = order[i]; const b = body.get(id);
  if (isCut(b)) continue;
  pre.set(id, b);
  adds.push(`#### cut: ${id}\n\n` + b.split("\n").map((l) => "> " + l).join("\n") + "\n");
  body.set(id, cutRow(id, b)); cutIds.push(id);
  outText = serialize(order, body);
}
if (DO_CUT && B(outText) > LIMIT) fail(`still over budget after cutting every uncut row: ${B(outText)}`);

const after = queueRows(outText);
if (JSON.stringify(after.map((r) => r.id)) !== JSON.stringify(order)) fail("order not as planned");
if (JSON.stringify([...after.map((r) => r.id)].sort()) !== JSON.stringify([...oldIds, ...newIds].sort())) fail("id set wrong");
for (const r of after) {
  if (trimBlank(r.body).split("\n").find((l) => l.startsWith("order: ")) !== expectedOrderLine.get(r.id)) fail(`${r.id}: order line moved`);
  if (r.bytes > 2048) fail(`${r.id}: ${r.bytes} B over the row budget`);
}
const newCut = adds.length ? cutText.replace(/\n*$/, "\n\n") + adds.join("\n") : cutText;
for (const [id, b] of pre) for (const l of b.split("\n")) if (l && !newCut.includes("> " + l)) fail(`${id}: line missing from the archive`);
console.log("backlog", B(text), "->", B(outText), "headroom", LIMIT - B(outText));
console.log("placed:", newIds.join(", ") || "(none)");
console.log("cut:", cutIds.join(", ") || "(none)");
if (WRITE) { writeFileSync(BL, outText); if (adds.length) writeFileSync(CUTF, newCut); console.log("WRITTEN"); }
