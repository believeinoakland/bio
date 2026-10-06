/* money-checks over the real modules it reads (K1563 (1), re-pointed after MONEY #1 merged, K1580): record-core,
   membership, provenance, content, entities, events, lines, money and progressions, on a real SQLite database
   (node:sqlite) standing in for a Durable Object's storage, answering a cursor as workerd does, with the fictional test
   profile through jurisdictions. Money facts are recorded by money's own act (`recordFact`, its R1) from held captures;
   awards and change orders are real events joined by a real `amends` relation (money R14). Every test drives
   money-checks at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { Entities } from "../../../src/entities/index.mjs";
import { eventsOf } from "../../../src/events/index.mjs";
import { Lines } from "../../../src/lines/index.mjs";
import { createRegistry } from "../../../src/connection-grammar/index.mjs";
import { Money } from "../../../src/money/index.mjs";
import { progressionsOf } from "../../../src/progressions/index.mjs";
import { moneyChecksOf } from "../../../src/money-checks/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
export const ALICE = "member:alice", ADMIN_BOB = "member:bob", MACHINE = "class:daemon";
export const NOW = "2026-10-06T00:00:00.000Z";

function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() { const rest = c.toArray(); if (rest.length !== 1) throw new Error(`Expected exactly one result, got ${rest.length}`); return rest[0]; },
  };
  return c;
}
export function storage() {
  const db = new DatabaseSync(":memory:");
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) db.exec(t);
  let n = 0;
  return {
    db,
    sql: { exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    } },
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

export function world({ budgetClock = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const record = recordOf(host);
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = { registerStep: () => ({ ok: true }), registerFact: () => ({ ok: true }), onCommitted: () => ({ ok: true }) };
  const prov = provenanceOf(host, { record, membership, promotion, now: () => "2026-09-27T00:00:00Z" });
  prov.migrate();
  record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "test");
  const content = contentOf(host, { record, membership, provenance: prov });
  content.extraction.migrate();
  content.migrate();
  const e = new Entities(st, { record, membership, provenance: prov });
  e.migrate();
  let tick = 0;
  const evClock = () => new Date(Date.UTC(2026, 9, 1, 0, 0, tick++)).toISOString();
  const ev = eventsOf(host, { record, membership, provenance: prov, content, extraction: content.extraction, entities: e, now: evClock });
  ev.migrate();
  const ln = new Lines(st, { record, provenance: prov, content, entities: e, events: ev, registry: createRegistry(), now: evClock });
  ln.migrate();
  let mclock = 0;
  const m = new Money(st, { record, membership, entities: e, provenance: prov, events: ev, lines: ln, calculations: null,
    now: () => new Date(Date.UTC(2026, 9, 6, 0, 0, mclock++)).toISOString().replace(/\.\d{3}Z$/, "Z") });
  m.migrate();
  const progressions = progressionsOf(host, { record, entities: e, extraction: content.extraction, provenance: prov, now: () => NOW });
  progressions.migrate();
  const clock = { ms: 0 };
  const c = moneyChecksOf(host, { record, membership, entities: e, progressions, money: m, now: () => NOW,
                                  nowMs: budgetClock || (() => clock.ms) });
  const run = (q, ...a) => st.sql.exec(q, ...a).toArray();
  let caps = 0;
  const w = {
    st, host, record, membership, prov, e, ev, m, c, progressions, run,
    count: (t) => run(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    snapshot() {
      const out = {};
      for (const { name } of run(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)) out[name] = JSON.stringify(run(`SELECT * FROM ${name}`));
      return out;
    },
    entity(kind, label = `${kind} ${tick++}`) {
      const r = e.createEntity({ kind, label, note: "registered by the money-checks tests", declaredBy: ALICE });
      if (!r.ok) throw new Error(`fixture entity refused: ${r.reason}`);
      return r.entity_id;
    },
    bundle(id, type = "information", project = null) {
      st.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id,object_type,group_id,title,current_state,created,last_updated,bundle_sha,project)
                   VALUES (?,?,?,?,?,?,?,?,?)`, id, type, "g", id, "collected", NOW, NOW, "x", project);
      return id;
    },
    /** A capture held in a bundle (provenance's register), fetched directly. */
    held(bundleId = `INFO-2026-${String(++caps).padStart(4, "0")}-cap`, captureSha = sha(`capture ${caps}`), project = null) {
      w.bundle(bundleId, "information", project);
      st.sql.exec(`INSERT OR REPLACE INTO register (capture_sha, bundle_id, path, encoding, bytes, registered)
                   VALUES (?, ?, 'snapshots/x', 'utf8', 1, '2026-09-27T00:00:00Z')`, captureSha, bundleId);
      prov.recordReceipt({ address: `https://ledger.port-ellery.example/${captureSha.slice(0, 8)}`,
        addressNorm: `https://ledger.port-ellery.example/${captureSha.slice(0, 8)}`, captureSha, retrieved: "2026-09-27T00:00:00Z" });
      return captureSha;
    },
    member(id, role = "member") {
      st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, handle, role, status, created, updated) VALUES (?,?,?,?,?,?,?)`,
                  id, id, id, role, "active", NOW, NOW);
    },
    project(id, participants = []) {
      w.bundle(id, "project");
      for (const p of participants)
        st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES (?,?,?,?,?)`, id, p, "joined", NOW, NOW);
      return id;
    },
    event(kind, concerns = []) {
      const r = ev.createEvent({ kind, concerns, attestations: [{ testimony: `I saw the ${kind}` }], by: ALICE });
      if (!r.ok) throw new Error(`fixture event refused: ${r.reason}: ${r.detail}`);
      return r.event_id ?? r.event?.event_id;
    },
    relate(from, to, kind) {
      const r = ev.relate({ from, to, kind, attestation: { testimony: `the minutes say the ${kind}` }, by: ALICE });
      if (!r.ok) throw new Error(`fixture relation refused: ${r.reason}: ${r.detail}`);
    },
    resolution(captureSha, bundleId, entityId, grade = "A") {
      st.sql.exec(`INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, method, basis, established, resolved_by, at)
                   VALUES (?, ?, ?, ?, ?, 'test', 'test', 1, 'test', '2026-09-27T00:00:00Z')`, captureSha, bundleId, `r-${entityId}-${captureSha.slice(0, 6)}`, entityId, grade);
    },
  };
  w.member("alice"); w.member("bob", "admin");
  w.city = w.entity("institution", "City of Port Ellery");
  w.cap = w.held();
  /** A money fact recorded by money's own act; `amount` a plain decimal string. */
  w.rec = (over = {}) => {
    const { capture = w.cap, ...rest } = over;
    const amount = rest.amount ?? "100";
    const r = m.recordFact({ amount, as_read: `$${amount}`, currency: "USD", sign: "+", precision: "exact", kind: "expenditure",
      phase: "actual", stage: "encumbered", basis: "modified accrual", period: { fiscal: "FY2025-26" },
      from: { entity: w.city, as_written: "City of Port Ellery" }, to: { entity: w.vendor ?? w.city, as_written: "a payee" },
      source: { capture_sha: capture, extent: { kind: "pdf-page", page: 1 } }, by: ALICE, ...rest, amount });
    if (!r.ok) throw new Error(`fixture fact refused: ${r.reason}: ${r.detail}`);
    return r.fact_id;
  };
  w.vendor = w.entity("institution", "Harbour Dredging Co");
  /* Tests name entities and facts by a label of their own; the real ids are kept here. */
  const named = new Map();
  w.id = (name) => named.get(name) ?? name;
  w.entityAs = (name, kind) => { named.set(name, w.entity(kind, name)); return named.get(name); };
  /** A fact paid to a named entity; `bundle` files its capture in that bundle (a project's, so hidden). */
  w.factAs = (name, { to, bundle = null, by = ALICE, ...rest } = {}) => {
    let capture = w.cap;
    if (bundle) {
      const project = run(`SELECT project FROM bundles WHERE bundle_id=?`, bundle)[0]?.project ?? null;
      st.sql.exec(`DELETE FROM bundles WHERE bundle_id=?`, bundle);
      capture = w.held(bundle, sha(name), project);
    }
    named.set(name, w.rec({ to: { entity: w.id(to), as_written: to }, capture, by, ...rest }));
    return named.get(name);
  };
  w.withdraw = (name) => { const r = m.withdrawFact({ factId: w.id(name), reason: "a test withdraws it", by: ALICE }); if (!r.ok) throw new Error(r.reason); };
  return w;
}

/** A contract with an award event, change orders amending it, commitments at each, payments and an adopted award. */
export function contract(w, { award = "1000", orders = [], paid = [], adopted = null } = {}) {
  const id = w.entity("contract", `Contract ${w.count("entities")}`);
  const ev = w.event("award", [id]);
  const facts = { award: w.rec({ amount: award, concerns: [ev] }), orders: [], paid: [] };
  for (const a of orders) {
    const co = w.event("other", []);
    w.relate(co, ev, "amends");
    facts.orders.push(w.rec({ amount: a, concerns: [co] }));
  }
  for (const a of paid) facts.paid.push(w.rec({ amount: a, stage: "paid", concerns: [id] }));
  if (adopted !== null) facts.adopted = w.rec({ amount: adopted, phase: "adopted", stage: undefined, concerns: [id] });
  return { id, award: ev, facts };
}

/** A detector condition: the subject's sum over the population's sum, compared with the parameter `share`. */
export const SHARE_RECIPE = Object.freeze({
  method: "bio-calc/1",
  inputs: [{ name: "facts", kind: "table" }, { name: "population", kind: "table" }, { name: "share", kind: "figure" }],
  steps: [{ op: "sum", as: "part", from: "facts", field: "amount" }, { op: "sum", as: "whole", from: "population", field: "amount" },
          { op: "ratio", as: "portion", numerator: "part", denominator: "whole" }, { op: "compare", as: "past", a: "portion", b: "share" }],
  output: "past",
});
export const shareDetector = (over = {}) => ({
  label: "payee share", population: { per: "payee", kinds: ["expenditure"] }, condition: SHARE_RECIPE,
  parameters: [{ name: "share", value: "0.5", citation: "member's own word: half of the paid amounts" }],
  denominator: "every fact of the population", derivation: "payee sum over population sum against the share", by: ALICE, ...over,
});

/** R14: the words no text this module answers may say. */
export const FORBIDDEN = /\b(violation|breach|conflict|suspicious|overpaid|unauthori[sz]ed)\b/i;
export function texts(v, out = []) {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => texts(x, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { out.push(k); texts(x, out); }
  return out;
}
