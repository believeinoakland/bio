/* G55 platform check L (not run by the suite): the money ingest inside the real plane `Store` in Miniflare/workerd (the Durable Object the
   product runs in, real DO SQLite, R2), reached by the module's own services through private routes of a Store subclass (the door's
   authentication is not the cost measured and is not driven). workerd freezes the clock inside the object, so wall time is the PARENT's,
   around each fetch (R-CLOCK: reported, never asserted). Run from the repository root, one process at a time:
     node bio-plane/test/m/calculations/g55-L.probe.mjs MODE ROWS [ROWS...]       MODE: resolving | mixed | wide (unidentified payers 190 characters wide: about 20 MiB at 100,000 rows)
   Prints one JSON line per size: the act's wall ms, its answer (inline or started), then each tick's wall ms and work counts. */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { planeEntry } from "../capture-requests/plane-world.mjs";

const mode = process.argv[2] || "resolving";
const sizes = process.argv.slice(3).map(Number).filter(Boolean);
const PLANE = planeEntry();
const ENTRY_TAIL = `
import { recordOf } from "../record-core/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { contentOf } from "../content/index.mjs";
import { entitiesOf } from "../entities/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { calculationsOf } from "../calculations/index.mjs";
import { sha256HexSync } from "../record-grammar/index.mjs";
const BOB = "member:bob";
const FIELDS = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const ROLES = { payer: { role: "payer", scheme: "ellery_person" }, payee: { role: "payee", scheme: "ellery_person" }, amount: { role: "amount" } };
const BIND = { amount: "amount", payer: "payer", payee: "payee", kind: { value: "payment" }, phase: { value: "actual" }, stage: { value: "paid" },
  basis: { value: "cash" }, currency: { value: "USD" }, period: { value: "2025-07-01/2026-06-30" } };
const info = (id) => ["---", "id: " + id, "object_type: information", "schema: information@1", "group: test-group", 'title: "ledger"', "current_state: collected", "prior_state: null",
  'created: "2026-09-27T00:00:00Z"', 'last_updated: "2026-09-27T00:00:00Z"', "references: []", "state_history: []", "criticality: supporting", "---", "", "## Summary", "", "A ledger.", ""].join("\\n");
export class Store extends Store0 {
  async fetch(req) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/__g55/")) return super.fetch(req);
    try { return Response.json(await this.g55(url.pathname.slice(7), await req.json())); }
    catch (e) { return Response.json({ error: String((e && e.stack) || e).slice(0, 1500) }, { status: 500 }); }
  }
  async g55(op, a) {
    const ctx = this.ctx, c = calculationsOf(ctx), record = recordOf(ctx);
    if (op === "seed") {
      record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin");
      ctx.storage.sql.exec("INSERT OR IGNORE INTO members (member_id, cover, handle, role, status, capabilities, created, updated) VALUES ('bob','Cover bob','h_bob','member','active','[\\"contribute\\"]','t','t')");
      const ent = entitiesOf(ctx);
      for (const [label, id] of [["Pat Quill", "P001"], ["Lee Quill", "P002"]]) {
        const e = ent.createEntity({ kind: "person", label, note: "probe", declaredBy: BOB });
        if (!e.ok) throw new Error("entity " + JSON.stringify(e));
        const r = ent.addIdentifier({ entityId: e.entity_id, scheme: "ellery_person", id, basis: "the roll", by: BOB });
        if (!r.ok) throw new Error("identifier " + JSON.stringify(r));
      }
      const parts = ["payer,payee,amount\\n"];
      for (let i = 0; i < a.rows; i++) parts.push((a.mode === "resolving" ? "P001" : a.mode === "wide" ? "U" + String(i).padStart(190, "0") : i % 60 === 0 ? "P001" : "U" + String(i).padStart(6, "0")) + ",P002," + ((i % 97) + 1) + "\\n");
      const text = parts.join("");
      const bytes = new TextEncoder().encode(text);
      const capSha = sha256HexSync(text), id = "INFO-2026-0001-doc";
      const prom = promotionOf(ctx);
      const r = prom.promote({ bundleId: id, base: null, snapKey: "k1", author: BOB,
        files: [{ path: "bundle.md", text: info(id) }, { path: "snapshots/doc.csv", blobSha: capSha, bytes: bytes.byteLength },
          { path: "data/provenance.json", text: JSON.stringify({ documents: [{ file: "snapshots/doc.csv", locator: "https://example.org/doc.csv", retrieved: "2026-09-27T00:00:00Z",
            authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
            capture: { method: "acquire", grade: "B", actor_class: "session", sha256: capSha, encoding: "utf8", bytes: bytes.byteLength }, origin: { kind: "named_request" } }] }) }],
        meta: { object_type: "information" }, register: [{ sha256: capSha, path: "snapshots/doc.csv", encoding: "utf8", bytes: bytes.byteLength }] });
      if (!r.ok) throw new Error("promote " + JSON.stringify(r).slice(0, 400));
      await record.evidenceStore().put(capSha, bytes);
      const m = contentOf(ctx).mint({ bundleId: id, captureSha: capSha, extent: { kind: "document" }, mintedBy: BOB });
      if (!m.ok) throw new Error("mint " + JSON.stringify(m).slice(0, 400));
      const t = await c.declareTable({ source: m.content_id, schema: { fields: FIELDS }, header: FIELDS.map((f) => f.name), roles: ROLES, by: BOB });
      if (!t.ok) throw new Error("table " + JSON.stringify(t).slice(0, 400));
      const b = c.adoptBinding({ table: t.sha, roles: BIND, by: BOB });
      if (!b.ok) throw new Error("binding " + JSON.stringify(b).slice(0, 400));
      return { binding: b.binding, bytes: bytes.byteLength };
    }
    if (op === "ingest") {
      const r = await c.ingestMoney({ binding: a.binding, rows: "all", reason: "check L", by: BOB });
      return { ok: r.ok, reason: r.reason, state: r.state, ingest: r.ingest, written: r.written && r.written.length, notWritten: r.not_written && r.not_written.length, rows_total: r.rows_total,
        answerBytes: JSON.stringify(r).length };
    }
    if (op === "tick") { const t = await c.ingestTick(); return { ...t, due: c.ingestDue() }; }
    if (op === "read") { const r = c.ingestRead({ ingest: a.ingest, kind: "state", viewer: BOB }); return { state: r.state, rows_done: r.rows_done, written: r.written_count, notWritten: r.not_written_count }; }
    if (op === "dupes") { const q = [...ctx.storage.sql.exec("SELECT COUNT(*) AS n, COUNT(DISTINCT source_row) AS d FROM money_facts")][0]; return { facts: q.n, distinctRows: q.d }; }
    if (op === "largest") {
      const q = (s) => [...ctx.storage.sql.exec(s)][0];
      return { facts: q("SELECT COUNT(*) AS n FROM money_facts").n, largest: q("SELECT MAX(length(CAST(chunk AS BLOB))) AS n FROM calc_ingest_parts").n };
    }
    throw new Error("no op " + op);
  }
}
`;
const src = readFileSync(PLANE.entry, "utf8").replace("export class Store extends PlaneStore {", "class Store0 extends PlaneStore {").replace("export default door;", ENTRY_TAIL + "\nexport default door;");
writeFileSync(PLANE.entry, src);
const out = (o) => console.log(JSON.stringify(o));
const KILL = process.env.KILL ? Number(process.env.KILL) : 0;   /* KILL=n: dispose the runtime after n ticks and finish in a fresh Miniflare over the persisted store */
const PERSIST = mkdtempSync(join(tmpdir(), "g55-persist-"));
const makeMf = () => new Miniflare({
    durableObjectsPersist: join(PERSIST, "do"), r2Persist: join(PERSIST, "r2"),
    modules: true, modulesRoot: "/", scriptPath: PLANE.entry, script: readFileSync(PLANE.entry, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }], compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: "adm", MEMBER_TOKEN: "mem", PROBE_TOKEN: "prb", DAEMON_TOKEN: "dmn", VERSION: "1.0.0", INSTANCE_NAME: "g55-L",
      GOVERNOR_APPETITE_PER_MIN: "600000", CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000", ACCOUNT_SEAL_SECRET: "g55-seal" },
  });
for (const rows of sizes) {
  let mf = makeMf();
  let ns = await mf.getDurableObjectNamespace("STORE");
  let stub = ns.get(ns.idFromName("g55"));
  const call = async (op, body) => {
    const t0 = Date.now();
    const r = await stub.fetch(`http://do/__g55/${op}`, { method: "POST", body: JSON.stringify(body) });
    const j = await r.json();
    if (j.error) throw new Error(`${op}: ${j.error}`);
    return { ...j, ms: Date.now() - t0 };
  };
  try {
    const seed = await call("seed", { rows, mode });
    out({ rows, mode, step: "seed", ms: seed.ms, tableBytes: seed.bytes });
    const act = await call("ingest", { binding: seed.binding });
    out({ rows, mode, step: "act", ...act });
    if (act.state === "ingesting") {
      let n = 0, total = 0, max = 0, last = null;
      for (;;) {
        const t = await call("tick", {});
        n++; total += t.ms; max = Math.max(max, t.ms);
        out({ rows, mode, step: "tick", n, ms: t.ms, judged: t.judged, written: t.written, state: t.state, ok: t.ok });
        if (KILL && n === KILL) {
          await mf.dispose();
          mf = makeMf(); ns = await mf.getDurableObjectNamespace("STORE"); stub = ns.get(ns.idFromName("g55"));
          out({ rows, mode, step: "killed", after: n, ...(await call("dupes", {})), ...(await call("read", { ingest: act.ingest })) });
        }
        if (!t.due || !t.ok || n > 60) { last = t; break; }
      }
      const s = await call("read", { ingest: act.ingest });
      out({ rows, mode, step: "end", ticks: n, totalMs: total, maxTickMs: max, ...s, ...(await call("largest", {})), ...(await call("dupes", {})) });
    } else out({ rows, mode, step: "end", ...(await call("largest", {})) });
  } catch (e) { out({ rows, mode, error: String(e && e.message || e).slice(0, 600) }); }
  await mf.dispose();
}
PLANE.dispose();
