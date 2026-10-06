/* money-checks over record-core, membership and progressions (the real ones) on a real SQLite database (node:sqlite)
   standing in for a Durable Object's storage, answering a cursor as workerd does. `money` precedes this module and is
   built by its own job in the same layer (P10), so what this module reads from it is a stand-in the test controls, in
   the shapes of money's Provides as this job reads them (money R7–R10, R14, R19 as K1563 (4) names it; job record J1 (3)): its read-contract
   tables `money_facts`, `money_withdrawals` and `money_concerns`, and `readFact`, `moneyOf`, `summable`,
   `committedAgainstPaid` over them. `entities` is a stand-in in its Provides' shapes (R5's `readEntity`, R7's `has`).
   Every test drives money-checks at its interface. */
import { DatabaseSync } from "node:sqlite";
import { recordOf } from "../../../src/record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../../../src/membership/index.mjs";
import { progressionsOf } from "../../../src/progressions/index.mjs";
import { moneyChecksOf } from "../../../src/money-checks/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
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
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
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

export const ALICE = "member:alice", ADMIN_BOB = "member:bob", MACHINE = "class:daemon";
export const NOW = "2026-10-06T00:00:00.000Z";

/* money's read contract (money R19), as this job reads its columns (J1 (3)). */
const MONEY_TABLES = `
CREATE TABLE money_facts (fact_id TEXT PRIMARY KEY, amount TEXT, sign TEXT, precision TEXT, currency TEXT, kind TEXT,
  phase TEXT, stage TEXT, basis TEXT, period_from TEXT, period_to TEXT, from_entity TEXT, from_fund TEXT,
  to_entity TEXT, to_fund TEXT, source_capture_sha TEXT);
CREATE TABLE money_withdrawals (fact_id TEXT PRIMARY KEY, reason TEXT, by TEXT, at TEXT);
CREATE TABLE money_concerns (fact_id TEXT NOT NULL, concerns TEXT NOT NULL)`;

export function world({ budgetClock = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  for (const t of MONEY_TABLES.split(";")) if (t.trim()) st.db.exec(t);
  const run = (q, ...a) => st.sql.exec(q, ...a).toArray();

  /* entities: kinds by id */
  const ents = new Map();
  const entities = {
    has: (id) => ents.has(id),
    readEntity: ({ entityId }) => (ents.has(entityId) ? { ok: true, found: true, entity: { entity_id: entityId, ...ents.get(entityId), aliases: [], relations: [] } }
                                                       : { ok: true, found: false, entity_id: entityId, entity: null }),
    strongestByCapture: (id) => new Map(resolutions.get(id) || []),
  };
  const resolutions = new Map();

  /* money: the stand-in. `meta` holds what money knows from events (award, change order) and the source capture. */
  const meta = new Map();
  const seen = (viewer) => { const g = viewerPredicate(viewer); return (b) => !b || !!run(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${g.sql})`, b, ...g.args).length; };
  const factOf = (id) => {
    const r = run(`SELECT * FROM money_facts WHERE fact_id=?`, id)[0];
    if (!r) return null;
    const m = meta.get(id);
    return { ...r, concerns: run(`SELECT concerns FROM money_concerns WHERE fact_id=?`, id).map((x) => x.concerns),
             source: { capture_sha: m.capture, bundle_id: m.bundle }, withdrawn: !!run(`SELECT 1 AS x FROM money_withdrawals WHERE fact_id=?`, id).length };
  };
  const calls = { readFact: 0 };
  const money = {
    readFact({ factId, viewer }) {
      calls.readFact++;
      const f = factOf(factId);
      if (!f || !seen(viewer)(meta.get(factId).bundle)) return { ok: true, found: false, fact: null };
      return { ok: true, found: true, fact: f };
    },
    moneyOf({ entity, viewer, phases, limit = 100 }) {
      const ids = run(`SELECT fact_id FROM money_facts WHERE from_entity=? OR to_entity=? OR fact_id IN (SELECT fact_id FROM money_concerns WHERE concerns=?) ORDER BY fact_id`, entity, entity, entity)
        .map((r) => r.fact_id);
      const facts = ids.map(factOf).filter((f) => !f.withdrawn && seen(viewer)(meta.get(f.fact_id).bundle) && (!phases || phases.includes(f.phase)));
      return { ok: true, facts: facts.slice(0, limit), truncated: facts.length > limit };
    },
    summable({ factIds }) {
      const fs = factIds.map(factOf);
      const dims = [["kind", "SUM_MIXED_KIND"], ["phase", "SUM_MIXED_STAGE"], ["stage", "SUM_MIXED_STAGE"], ["basis", "SUM_MIXED_BASIS"],
                    ["currency", "SUM_MIXED_CURRENCY"], ["period_from", "SUM_MIXED_PERIOD"], ["period_to", "SUM_MIXED_PERIOD"]];
      for (const [d, code] of dims) {
        const other = fs.find((f) => f[d] !== fs[0][d]);
        if (other) return { ok: false, reason: code, code, facts: [fs[0].fact_id, other.fact_id] };
      }
      return { ok: true, interfund: [] };
    },
    committedAgainstPaid({ contract, viewer }) {
      if (!ents.has(contract) || ents.get(contract).kind !== "contract") return { ok: false, reason: "NOT_A_CONTRACT", code: "NOT_A_CONTRACT" };
      const all = money.moneyOf({ entity: contract, viewer, limit: 500 }).facts;
      const role = (r) => all.filter((f) => meta.get(f.fact_id).role === r);
      return { ok: true, contract, committed: { award: role("award"), change_orders: role("change_order") },
               paid: { facts: all.filter((f) => f.phase === "actual" && f.stage === "paid") } };
    },
  };

  const clock = { ms: 0 };
  const progressions = progressionsOf(host, { record, entities, extraction: { readingOf: () => null },
                                              provenance: { homeOf: () => null }, now: () => NOW });
  progressions.migrate();
  const c = moneyChecksOf(host, { record, membership, entities, progressions, money, now: () => NOW,
                                  nowMs: budgetClock || (() => clock.ms) });
  const w = {
    st, host, record, membership, c, money, calls, clock, progressions, ents, run,
    count: (t) => run(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    snapshot() {
      const out = {};
      for (const { name } of run(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)) out[name] = JSON.stringify(run(`SELECT * FROM ${name}`));
      return out;
    },
    entity(id, kind = "contract") { ents.set(id, { kind, label: id }); },
    bundle(id, type = "information", project = null) {
      st.sql.exec(`INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,created,last_updated,bundle_sha,project)
                   VALUES (?,?,?,?,?,?,?,?,?)`, id, type, "g", id, "collected", NOW, NOW, "x", project);
    },
    member(id, role = "member") {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, created, updated) VALUES (?,?,?,?,?,?,?)`,
                  id, id, id, role, "active", NOW, NOW);
    },
    project(id, participants = []) {
      w.bundle(id, "project");
      for (const m of participants)
        st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES (?,?,?,?,?)`, id, m, "active", NOW, NOW);
    },
    /** A money fact in money's read contract; `role` is what money knows from its events (award, change order). */
    fact(id, { amount = "100", sign = "+", precision = "exact", currency = "USD", kind = "expenditure", phase = "actual",
               stage = "encumbered", basis = "budgetary", period = ["2025-07-01", "2026-06-30"], from = "ENT-2026-0001",
               to = "ENT-2026-0002", concerns = [], role = null, capture = `sha-${id}`, bundle = null } = {}) {
      st.sql.exec(`INSERT INTO money_facts VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, id, amount, sign, precision, currency, kind,
                  phase, stage, basis, period[0], period[1], from, null, to, null, capture);
      for (const x of concerns) st.sql.exec(`INSERT INTO money_concerns VALUES (?,?)`, id, x);
      meta.set(id, { role, capture, bundle });
    },
    withdraw(id) { st.sql.exec(`INSERT INTO money_withdrawals VALUES (?,?,?,?)`, id, "test", ALICE, NOW); },
    resolve(entityId, captureSha, bundleId, grade = "A") {
      if (!resolutions.has(entityId)) resolutions.set(entityId, new Map());
      resolutions.get(entityId).set(captureSha, { capture_sha: captureSha, bundle_id: bundleId, grade });
    },
  };
  w.member("alice"); w.member("bob", "admin");
  return w;
}

/** A contract `ENT-2026-0100` with an award commitment, change orders and payments (amounts as strings). */
export function contract(w, { award = "1000", orders = [], paid = [], adopted = null, id = "ENT-2026-0100" } = {}) {
  w.entity(id, "contract");
  w.fact(`MNY-2026-award${id.slice(-4)}000000`, { amount: award, concerns: [id], role: "award" });
  orders.forEach((a, i) => w.fact(`MNY-2026-order${id.slice(-4)}00000${i}`, { amount: a, concerns: [id], role: "change_order" }));
  paid.forEach((a, i) => w.fact(`MNY-2026-paid${id.slice(-4)}000000${i}`, { amount: a, stage: "paid", concerns: [id] }));
  if (adopted !== null) w.fact(`MNY-2026-adopt${id.slice(-4)}000000`, { amount: adopted, phase: "adopted", stage: null, concerns: [id] });
  return id;
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
