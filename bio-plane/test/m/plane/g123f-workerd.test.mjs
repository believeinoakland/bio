/* plane G123f on workerd (fix round 9; S-36; K4426 "Still MISSING" row 1, platform check L; corpus R set): A RANGE OF CELLS CITED AND READ BACK, run under Miniflare, with the real Durable Object SQLite and the real R2 binding,
   the plane's REAL `Store` class (every module real) in the isolate. The probe's object extends `Store`; its one added route, `/__g123f`, feeds a CSV held in R2 as the shape harness's held feed does (registered, promoted, the
   ledger's reading owed), drives the ledger's alarm tick by tick to the end, then reads, equal to the generator's cells cell for cell (never a sample):
     last   `extraction.cellsOf` of the last row;
     edge   a range crossing a block edge of the reading's own text rows, CITED by its content id (`content.contentMint`, then `content.cellsAt`): whole, no `cells_truncated`;
     bound  a range over the call's bound (`CELLS_RANGE_MAX`), CITED: `cellsAt` answers `cells_truncated` with a `next_row` that is the first row not delivered, and the asking again from that row (`{fromRow}`, content R52) reads on to the
            range's end, the rows joined equal to the truth; then `tabledeclare` of the over-bound cited range (calculations R1: it reads on by `next_row`, where it once turned `cells_truncated` into a fault) declares every row of it.
   Counts only (R-CLOCK); workerd enforces no 128 MB of its own under Miniflare, so the isolate's memory is not judged here (the shape harness's cap is). The run boots workerd and takes under a minute. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { Miniflare } from "miniflare";
import { mkdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";

const src = (p) => JSON.stringify(fileURLToPath(new URL(`../../../src/${p}`, import.meta.url)));
const BYTES = Number(process.env.G123F_BYTES || 3 * 1048576);

const ENTRY = `
import { DurableObject } from "cloudflare:workers";
import plane, { Store } from ${src("plane/index.mjs")};
import { captureOf } from ${src("capture/index.mjs")};
import { promotionOf } from ${src("promotion/index.mjs")};
import { extractionOf, cellAddress, CELLS_RANGE_MAX } from ${src("extraction/index.mjs")};
import { contentOf } from ${src("content/index.mjs")};
import { recordOf } from ${src("record-core/index.mjs")};
import { CSV_SHEET_NAME } from ${src("csv-reader/index.mjs")};
import { createHash } from "node:crypto";

const hex = (b) => createHash("sha256").update(b).digest("hex");
const ME = "member:ann", NOW = "2026-10-22T00:00:00Z";
/* the generator: a CSV of about \`total\` bytes, its truth a pure function of the row */
const cellsOf = (r, last) => r === 1 ? ["id", "name", "amount", "note"] : r === last ? ["LASTROWMARK", "last name", "1.00", "the final row of the sheet"]
  : [String(r - 2), "name " + (r - 2), ((r - 2) * 37) % 9973 + "." + ((r - 2) % 100), "council note " + (r - 2) + " budget line"];
function csv(total) {
  const rows = ["id,name,amount,note\\n"]; let n = rows[0].length, i = 0;
  for (; n < total; i++) { const c = cellsOf(i + 2, -1); const r = c[0] + ',"' + c[1] + '",' + c[2] + ',"' + c[3] + '"\\n'; rows.push(r); n += r.length; }
  rows.push('LASTROWMARK,"last name",1.00,"the final row of the sheet"\\n');
  return { text: rows.join(""), last: i + 2 };
}
const rowsOfRange = (r) => { const m = /(\\d+)\\D+(\\d+)$/.exec(String(r || "")); return m ? [+m[1], +m[2]] : null; };

export class Probe extends Store {
  async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname !== "/__g123f") return super.fetch(req);
    try { return Response.json(await this.run(Number(u.searchParams.get("bytes")))); }
    catch (e) { return Response.json({ error: String(e && e.stack || e).slice(0, 1500) }, { status: 500 }); }
  }
  async run(total) {
    const ctx = this.ctx, env = this.env, sql = (q, ...a) => [...ctx.storage.sql.exec(q, ...a)];
    const { text, last } = csv(total), bytes = new TextEncoder().encode(text), sha = hex(bytes);
    await env.CAPTURES.put("bio/captures/" + sha, bytes);
    const file = "table.csv";
    const document = { file, locator: "https://example.org/" + file, retrieved: NOW, profile: { format: { format: "csv", confidence: "certain", signals: [] } }, authority_state: "undetermined", authority_basis: "held",
      origin: { kind: "named_request" }, capture: { sha256: sha, bytes: bytes.length, content_type: "text/csv", method: "upload", grade: "C", actor_class: "member", encoding: "binary" } };
    const id = recordOf(ctx).allocId("INFO", "2026").id, title = file;
    const md = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null", "created: " + NOW, "last_updated: " + NOW,
      "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
      "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(title), "source:", "  locator: " + JSON.stringify(document.locator), "  authority: member-entered", "  retrieved: " + NOW,
      "monitoring:", "  enabled: false", "  frequency: none", "---", "", "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\\n");
    const len = (t) => new TextEncoder().encode(t).length;
    const prov = JSON.stringify({ documents: [document] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: bytes.length, locator: document.locator, sha256: sha }] });
    const files = [{ path: "bundle.md", text: md, bytes: len(md), sha256: hex(md) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
      { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: file, blobSha: sha, sha256: sha, bytes: bytes.length }];
    const pr = promotionOf(ctx).promote({ bundleId: id, base: null, snapKey: "20261022T000000_" + hex(id).slice(0, 8), meta: { object_type: "information", title, current_state: "collected", created: NOW, last_updated: NOW },
      files, register: [{ sha256: sha, path: file, encoding: "binary", bytes: bytes.length }], author: "ann", actorMemberId: "ann", actorIdentity: ME, actorViewer: ME });
    if (!pr || pr.ok === false) return { error: "promote refused " + JSON.stringify(pr).slice(0, 300) };
    const add = await this.fetch(new Request("http://do/pendingadd?kind=reading&sha=" + sha + "&store=bio", { method: "POST" }));
    if (add.status !== 200) return { error: "pendingadd " + add.status };
    /* the ledger, tick by tick */
    const open = () => sql("SELECT kind, final_why FROM keeps_pending WHERE state <> 'finished'").filter((r) => r.final_why == null);
    let at = Date.now() + 1000, ticks = 0;
    while (open().length && ticks < 200) {
      await this.onAlarm(at); at += 3_600_000; ticks++;
      const until = Date.now() + 120000;
      while (sql("SELECT count(*) AS n FROM keeps_pending WHERE started_at IS NOT NULL")[0].n && Date.now() < until) await new Promise((r) => setTimeout(r, 25));
    }
    const state = sql("SELECT state, offered, written FROM capture_text_state WHERE capture_sha=?", sha)[0] || null;
    const blocks = sql("SELECT extent FROM capture_text WHERE capture_sha=? AND extent_kind='sheet-range' ORDER BY seq", sha).map((r) => { try { return rowsOfRange(JSON.parse(r.extent).range); } catch { return null; } }).filter(Boolean);
    const edge = blocks.length >= 2 ? blocks[Math.floor((blocks.length - 1) / 2)][1] : null;
    const ex = extractionOf(ctx), content = contentOf(ctx), width = 4;
    const boundRows = Math.min(last, Math.ceil(CELLS_RANGE_MAX / width) * 2 + 10);
    const truth = (r) => cellsOf(r, last);
    const check = (got, from, to) => { const by = new Map(); let seen = 0, lastRow = 0;
      for (const c of got) { const a = cellAddress(c); if (!a) continue; seen++; lastRow = Math.max(lastRow, a.row); (by.get(a.row) || by.set(a.row, []).get(a.row))[a.col - 1] = String(c.value); }
      let wrong = null; for (let r = from; r <= to && !wrong; r++) if (JSON.stringify(by.get(r) || []) !== JSON.stringify(truth(r))) wrong = { row: r, have: by.get(r) || [], want: truth(r) };
      return { cells: seen, lastRow, wrong }; };
    const out = { ticks, state, blocks: blocks.length, edge, last, boundRows, cellsRangeMax: CELLS_RANGE_MAX };
    { const g = await ex.cellsOf(sha, CSV_SHEET_NAME, { fromRow: last, toRow: last }); out.last_row = { ...check(g.cells || [], last, last), next_row: g.next_row ?? null }; }
    const last4 = "D", cite = (from, to) => content.contentMint({ bundleId: id, extent: { kind: "sheet-range", sheet: CSV_SHEET_NAME, range: "A" + from + ":" + last4 + to }, mintedBy: "member:ann", viewer: ME, at: NOW });
    if (edge) {
      const m = cite(edge - 2, edge + 3), g = await content.cellsAt(m.content_id);
      out.edge_range = { from: edge - 2, to: edge + 3, ...check(g.cells || [], edge - 2, edge + 3), truncated: g.cells_truncated === true, next_row: g.next_row ?? null };
    }
    const mb = cite(1, boundRows), calls = []; let from = null, wrong = null, rows = new Map();
    for (let i = 0; i < 12; i++) {
      const g = from === null ? await content.cellsAt(mb.content_id) : await content.cellsAt(mb.content_id, { fromRow: from });
      const cs = g.cells || []; const c = check(cs, from === null ? 1 : from, g.cells_truncated ? (g.next_row - 1) : boundRows);
      calls.push({ from, cells: cs.length, lastRow: c.lastRow, truncated: g.cells_truncated === true, next_row: g.next_row ?? null, wrong: c.wrong });
      wrong ||= c.wrong; if (!g.cells_truncated) break;
      if (!(g.next_row > (from ?? 0))) { wrong ||= { advance: "next_row " + g.next_row + " did not advance past " + from }; break; }
      from = g.next_row;
    }
    out.bound_range = { from: 1, to: boundRows, calls, wrong };
    const hdr = ["id", "name", "amount", "note"].map((name) => ({ name, type: "string" }));
    const doc = content.contentMint({ bundleId: id, extent: { kind: "document" }, mintedBy: "member:ann", viewer: ME, at: NOW });
    for (const [label, source] of [["document", doc.content_id], ["bound_range", mb.content_id]]) {
      const r = await this.fetch(new Request("http://do/tabledeclare?viewer=" + ME, { method: "POST", body: JSON.stringify({ source, schema: { fields: hdr }, header: hdr.map((f) => f.name), by: ME }) }));
      const j = await r.json().catch(() => null), res = j && j.result !== undefined ? j.result : j;
      out["declare_" + label] = { status: r.status, ok: res && res.ok, reason: res && res.reason, rows: res && (res.rows ?? (res.declared && res.declared.rows) ?? null), head: JSON.stringify(res).slice(0, 300) };
    }
    return out;
  }
}
export default { async fetch(req, env) { return env.PROBE.get(env.PROBE.idFromName("p")).fetch(req); } };
`;

test("G123f on workerd: a CSV's last row, a cited block-edge range and a cited over-bound range read on by next_row equal the generator's, and the table is declared from the over-bound range", { timeout: 900_000 }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "g123f-"));
  const entry = join(dir, "probe.mjs");
  writeFileSync(entry, ENTRY);
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: entry, script: ENTRY,
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { PROBE: { className: "Probe", useSQLite: true }, STORE: { className: "Probe", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { VERSION: "test", INSTANCE_NAME: "town", ADMIN_TOKEN: "adm-g123f", MEMBER_TOKEN: "mem-g123f", PROBE_TOKEN: "prb-g123f" },
  });
  try {
    const res = await mf.dispatchFetch(`http://x/__g123f?bytes=${BYTES}`, { signal: AbortSignal.timeout(840_000) });
    const out = await res.json();
    console.log("G123f workerd: " + JSON.stringify(out, null, 1));
    assert.equal(out.error, undefined, out.error);
    assert.equal(out.state && out.state.state, "whole", `the reading is whole: ${JSON.stringify(out.state)}`);
    assert.equal(out.last_row.wrong, null, `last row: ${JSON.stringify(out.last_row)}`);
    assert.ok(out.blocks >= 2 && out.edge, "the reading has block edges to cross");
    assert.equal(out.edge_range.wrong, null, `edge range: ${JSON.stringify(out.edge_range)}`);
    assert.equal(out.edge_range.truncated, false, "the edge range is cited whole");
    assert.equal(out.edge_range.lastRow, out.edge_range.to);
    const b = out.bound_range;
    assert.equal(b.wrong, null, `over-bound range: ${JSON.stringify(b)}`);
    assert.ok(b.calls.length >= 2 && b.calls[0].truncated === true, "an over-bound cited range is cut with cells_truncated, then read on");
    assert.equal(b.calls[0].next_row, b.calls[0].lastRow + 1, "next_row is the first row not delivered");
    assert.equal(b.calls[b.calls.length - 1].truncated, false, "read on to the range's end");
    assert.equal(out.declare_document.ok, true, JSON.stringify(out.declare_document));
    assert.equal(out.declare_bound_range.ok, true, `the over-bound cited range is declared as a table, read on by next_row: ${JSON.stringify(out.declare_bound_range)}`);
  } finally { await mf.dispose(); }
});
