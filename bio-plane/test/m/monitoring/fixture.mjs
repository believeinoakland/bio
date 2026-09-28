/* monitoring over the modules it uses, each the real one where it writes or reads the record (record-core,
   membership, promotion, provenance, observation-log, capture), on a real SQLite database (node:sqlite) standing in
   for a Durable Object's storage. What stands in, and why: retrieval's projection of the four monitoring columns
   (`monitor_enabled`, `monitor_frequency`, `monitor_last_checked`, `source_locator`, K75 (3)) is a promotion step
   the fixture registers, projecting from the document as retrieval does; the host governor records every call and
   refuses the hosts a test names; the network is a scripted `fetch` the test controls; the evidence bucket is an
   in-memory R2 stand-in; intent, actions and escalation are stand-ins in their Provides' shapes unless a test passes
   the real one. Every test drives `monitoring` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { observationLogOf } from "../../../src/observation-log/index.mjs";
import { Capture } from "../../../src/capture/index.mjs";
import { monitoringOf } from "../../../src/monitoring/index.mjs";
import { actionsOf, actionFacts } from "../../../src/actions/index.mjs";
import { parseFrontmatter } from "../../../checks/bio-checks.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
/** A Durable Object's storage over an in-memory SQLite database. */
export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    },
  };
  return {
    db, sql,
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

export const sha = (b) => createHash("sha256").update(typeof b === "string" ? Buffer.from(b, "utf8") : Buffer.from(b)).digest("hex");
export const NOW_MS = Date.parse("2026-09-28T12:00:00Z");
export const NOW = "2026-09-20T00:00:00Z";
export const DAEMON = "class:daemon";
export const V = (id) => `member:${id}`;

/** An evidence bucket (the R2 binding's shape), recording every call. */
export function bucket() {
  const held = new Map(), calls = [];
  const obj = (k) => { const b = held.get(k); return { key: k, size: b.length,
    arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) }; };
  return {
    calls, held, failPut: false,
    async head(k) { calls.push(["head", k]); return held.has(k) ? { key: k, size: held.get(k).length } : null; },
    async get(k) { calls.push(["get", k]); return held.has(k) ? obj(k) : null; },
    async put(k, bytes) { calls.push(["put", k]); if (this.failPut) throw new Error("bucket refused"); held.set(k, new Uint8Array(bytes)); return { key: k }; },
  };
}

/** host-governor's R1–R14 as monitoring reaches them, each call recorded; `refuse` names hosts to refuse. */
export function governor({ refuse = [] } = {}) {
  const calls = [];
  return {
    calls, refuse,
    governorAdmit({ host }) { calls.push(["admit", host]); return this.refuse.includes(host)
      ? { admitted: false, reason: "cooling_off", retry_in_ms: 5000 } : { admitted: true, wait_ms: 0 }; },
    governorReport(r) { calls.push(["report", r.host, r.status]); return { recorded: true }; },
  };
}

/** A scripted network: `routes` maps a URL to a Response factory (or an Error to throw); every fetch is recorded. */
export function network(routes = {}) {
  const seen = [];
  const fetch = async (u) => {
    const url = String(u && u.url ? u.url : u);
    seen.push(url);
    const r = routes[url];
    if (r instanceof Error) throw r;
    if (!r) return new Response("not found", { status: 404 });
    return typeof r === "function" ? r(url) : r;
  };
  return { seen, routes, fetch };
}
/** A response serving `body` with `type`. */
export const serve = (body, type = "text/plain", status = 200) => () =>
  new Response(typeof body === "string" ? body : new Uint8Array(body), { status, headers: { "content-type": type } });

/** An information bundle asking to be monitored. `lines` are extra front-matter lines. */
export function infoMd(id, locator, { freq = null, enabled = true, lines = [] } = {}) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@2",
    `title: "Monitored ${id}"`, "current_state: collected", "prior_state: null",
    `created: ${NOW}`, `last_updated: ${NOW}`,
    "produced_by:", "  mode: assisted", "  capability_tier: session",
    "group: test-group", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
    "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
    "source:", `  locator: ${locator}`, "  authority: Town Clerk", `  retrieved: ${NOW}`,
    "monitoring:", `  enabled: ${enabled}`, ...(freq ? [`  frequency: ${freq}`] : []), "  last_checked: null",
    ...lines, "---", "",
    "## Summary", "", "A monitored document.", "", "## Provenance Notes", "",
    "## Session Log", "", "### Session 1", "", "Captured.", "", "## Review Notes", "",
  ].join("\n");
}

export function world({ profiles = ["test-port-ellery"], env = null, evidence = true, refuse = [], intent = undefined,
                        actions = undefined, escalation = undefined, extraColumns = [], realActions = false } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  /* retrieval's projection columns this module reads (K75 (3)). */
  for (const c of ["monitor_enabled INTEGER", "monitor_frequency TEXT", "monitor_last_checked TEXT", "source_locator TEXT",
                   ...(realActions ? ["action_clock_next TEXT"] : []), ...extraColumns]) st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c}`);
  const clock = { ms: NOW_MS };
  const bkt = evidence ? bucket() : null;
  const record = recordOf(host, { evidence: bkt, evidencePrefix: "bio/captures/" });
  record.migrate();
  if (profiles) record.setSetting("jurisdiction_profiles", profiles, V("admin"));
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => new Date(clock.ms).toISOString() });
  promotion.registerFact("producingGroup", "legacy-store", () => "test-group");
  const prov = provenanceOf(host, { record, membership, promotion, now: () => new Date(clock.ms).toISOString() });
  prov.migrate();
  const obs = observationLogOf(host, { record, membership, provenance: prov, extraction: null });
  obs.migrate();
  const gov = governor({ refuse });
  const capEnv = { ...(env || {}) };
  const capture = new Capture(st, { record, env: capEnv, governor: gov, provenance: prov });
  capture.migrate();
  /* retrieval's projection of the monitoring columns, from the promoted document. */
  promotion.registerStep("retrieval", { project: (c) => {
    const md = (c.files || []).find((f) => f.path === "bundle.md");
    let fm = null;
    try { fm = md && typeof md.text === "string" ? parseFrontmatter(md.text).data : null; } catch { fm = null; }
    const mon = fm && fm.monitoring && typeof fm.monitoring === "object" ? fm.monitoring : {};
    st.sql.exec(`UPDATE bundles SET monitor_enabled=?, monitor_frequency=?, monitor_last_checked=?, source_locator=? WHERE bundle_id=?`,
      mon.enabled === true ? 1 : 0, typeof mon.frequency === "string" ? mon.frequency : null,
      typeof mon.last_checked === "string" ? mon.last_checked : null,
      fm && fm.source && typeof fm.source.locator === "string" ? fm.source.locator : null, c.bundleId);
    /* and, with the real actions module, its clock column from its R12 facts (retrieval R53) */
    if (realActions) st.sql.exec(`UPDATE bundles SET action_clock_next=? WHERE bundle_id=?`,
      actionFacts(md && md.text, clock.ms).clock_next, c.bundleId);
    return null;
  } });
  /* the real actions module (its clock rule, `pendingClocks`, the R33 bound), with conformance in its R9 shape */
  const act = realActions ? actionsOf(host, { record, membership, promotion, retrieval: null, env: {}, now: () => clock.ms,
    conformance: { determinationRead: () => ({ ok: false, reason: "NO_SUCH_DETERMINATION" }), registerStep: () => ({ ok: true }) } }) : undefined;
  const net = network();
  const intentStub = intent === undefined ? stubIntent() : intent;
  const m = monitoringOf(host, { record, membership, promotion, provenance: prov, observationLog: obs, capture,
    governor: gov, env: env || {}, now: () => clock.ms, fetch: net.fetch, intent: intentStub,
    ...(actions !== undefined ? { actions } : act ? { actions: act } : {}), ...(escalation !== undefined ? { escalation } : {}) });
  let n = 0;
  const w = {
    st, host, record, membership, promotion, prov, obs, capture, gov, net, bkt, m, clock, intent: intentStub, act,
    rows: (q, ...x) => st.sql.exec(q, ...x),
    row: (q, ...x) => st.sql.exec(q, ...x)[0] ?? null,
    text: (id) => { const f = record.readFile(id, "bundle.md"); return f ? (typeof f === "string" ? f : f.text ?? null) : null; },
    fm: (id) => { const t = w.text(id); return t ? parseFrontmatter(t).data : null; },
    manifest: (id) => st.sql.exec(`SELECT snap_key, writer, operation, author, base FROM manifest WHERE bundle_id=? ORDER BY rowid`, id),
    looks: () => st.sql.exec(`SELECT * FROM observation_log ORDER BY seq`),
    /** Hold `bytes` in the evidence bucket under their digest. */
    hold(bytes) { const s = sha(bytes); bkt.held.set(`bio/captures/${s}`, new Uint8Array(Buffer.from(bytes))); return s; },
    /** Promote `id` with `text` as its bundle.md and `reg` as its provenance register (documents[]), by a member. */
    promote(id, text, { reg = null, files = [], register = [], author = V("alice") } = {}) {
      const all = [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }];
      if (reg) { const p = JSON.stringify({ documents: reg }); all.push({ path: "data/provenance.json", text: p, bytes: Buffer.byteLength(p), sha256: sha(p) }); }
      const head = record.head(id);
      return promotion.promote({ bundleId: id, base: head ? head.bundleSha : null, snapKey: `20260920T000000Z_fx${String(++n).padStart(4, "0")}`,
        author, meta: { object_type: "information", group: "test-group", title: `Monitored ${id}`, current_state: "collected",
                        created: NOW, last_updated: NOW },
        files: [...all, ...files], register });
    },
    /** A monitored document with a captured baseline: `baseline` bytes held, registered and named in the register. */
    monitored(id, locator, baselineBytes, { freq = null, row = {}, lines = [], enabled = true } = {}) {
      const md = infoMd(id, locator, { freq, lines, enabled });
      if (baselineBytes == null) { const r = w.promote(id, md); if (!r.ok) throw new Error(`fixture: ${id} not promoted: ${JSON.stringify(r)}`); return { md, r }; }
      const cap = w.hold(baselineBytes);
      const file = `snapshots/base-${cap.slice(0, 8)}`;
      const doc = { file, locator, retrieved: NOW, authority: "Town Clerk", origin: { kind: "named_request" }, attestation_attempts: [],
                    capture: { sha256: cap, method: "direct", grade: "B", actor_class: "daemon", encoding: "binary",
                               bytes: Buffer.byteLength(baselineBytes), content_type: "text/plain", ...(row.capture || {}) } };
      for (const [k, v] of Object.entries(row)) if (k !== "capture") doc[k] = v;
      const r = w.promote(id, md, { reg: [doc], files: [{ path: file, blobSha: cap, sha256: cap, bytes: Buffer.byteLength(baselineBytes) }],
        register: [{ sha256: cap, path: file, encoding: "binary", bytes: Buffer.byteLength(baselineBytes) }] });
      if (!r.ok) throw new Error(`fixture: ${id} not promoted: ${JSON.stringify(r).slice(0, 600)}`);
      return { md, cap, file, r };
    },
  };
  return w;
}

/** intent's R7 and R15 as monitoring reaches them. `watch` maps a project to the capture shas its condition reads. */
export function stubIntent(watch = {}) {
  const sources = [];
  return {
    sources, watch, calls: [],
    watchSet({ project, after = null, limit = null } = {}) {
      this.calls.push({ project, after });
      const all = this.watch[project] || [];
      const start = after ? all.indexOf(after) + 1 : 0;
      const page = all.slice(start, start + 2);
      const more = start + 2 < all.length;
      return { entities: [], progressions: [], captures: page, limit: 2, truncated: more,
               cursor: more ? page[page.length - 1] : null };
    },
    registerSource(kind, reader) { sources.push({ kind, reader }); return { ok: true }; },
  };
}
