/* The FINDING producer over progressions' proposalsFeed (R9's proposal share, R16; N107's cardinality finding),
   driven with a real `proposalsFeed` answer: progressions over record-core and membership on node:sqlite, the entity
   registry a provider the test controls in entities' shapes. The viewer's gate, homes and options are the caller's
   (the functions passed in); the test hands in recorders for them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { progressionsOf } from "../../../src/progressions/index.mjs";
import { proposalFindingItems, CARDINALITY_EXCEEDED } from "../../../src/queue/proposals.mjs";
import { classOfKind } from "../../../src/queuestate.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
const NOW = "2026-09-01T00:00:00.000Z";

function world() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = { exec(q, ...a) { const st = db.prepare(q); return st.columns().length ? st.all(...a.map(bind)).map((r) => ({ ...r })) : (st.run(...a.map(bind)), []); } };
  const host = { storage: { sql, transactionSync(fn) { const sp = `sp${n++}`; db.exec(`SAVEPOINT ${sp}`); try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; } catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; } } } };
  for (const t of RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) db.exec(t);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  membershipOf(host, { record }).migrate();
  const ents = new Map(), res = new Map();
  const entities = {
    has: (id) => ents.has(id),
    readEntity: ({ entityId }) => (ents.has(entityId) ? { ok: true, found: true, entity: { ...ents.get(entityId), aliases: [], relations: [] } } : { ok: true, found: false, entity: null }),
    strongestByCapture: (id) => new Map(res.get(id) || []),
  };
  const p = progressionsOf(host, { record, extraction: { readingOf: () => null }, provenance: { homeOf: () => null },
                                   entities, now: () => NOW, nowMs: null });
  p.migrate();
  const w = {
    p, sql,
    bundle: (id) => sql.exec(`INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,created,last_updated,bundle_sha) VALUES (?,?,?,?,?,?,?,?)`, id, "information", "g", id, "collected", NOW, NOW, "x"),
    entity: (id, label) => ents.set(id, { entity_id: id, kind: "contract", label }),
    resolve: (e, sha, b, grade) => { if (!res.has(e)) res.set(e, new Map()); res.get(e).set(sha, { capture_sha: sha, bundle_id: b, grade }); },
    define: (overrides = {}, extra = {}) => p.defineProgression({ progressionKey: "proc", label: "Procurement", declaredBy: "member:alice", ...extra,
      stages: [{ key: "need", cardinality: "1", required: "always" },
               { key: "award", after: "need", cardinality: "0..1", required: "always" },
               { key: "contract", after: "award", cardinality: "0..n", required: "usually" }].map((s) => ({ ...s, ...(overrides[s.key] || {}) })) }),
    thread: (entityId, placements) => p.threadInstance({ progressionKey: "proc", entityId, placements, threadedBy: "member:alice", viewer: "class:member" }),
  };
  return w;
}

/* ENT-1: two documents at `need` (declared 1), `contract` missing. ENT-2: two at `award` (0..1), all present.
   ENT-3: `award` missing, `contract` missing. So proc::need is a cardinality finding alone, proc::award is a missing
   stage (ENT-3) with a cardinality finding (ENT-2) on the same key, and proc::contract a missing stage alone. */
async function seeded() {
  const w = world();
  for (const b of ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"]) w.bundle(b);
  w.entity("ENT-1", "One"); w.entity("ENT-2", "Two"); w.entity("ENT-3", "Three");
  w.resolve("ENT-1", "s1a", "B1", "A"); w.resolve("ENT-1", "s1b", "B2", "C"); w.resolve("ENT-1", "s1c", "B3", "A");
  w.resolve("ENT-2", "s2a", "B4", "B"); w.resolve("ENT-2", "s2b", "B5", "B"); w.resolve("ENT-2", "s2c", "B6", "A"); w.resolve("ENT-2", "s2d", "B7", "A");
  w.resolve("ENT-3", "s3a", "B8", "A"); w.resolve("ENT-3", "s3b", "B9", "A");
  assert.equal(w.define().ok, true);
  await w.thread("ENT-1", [{ stage: "need", captureSha: "s1a" }, { stage: "need", captureSha: "s1b" }, { stage: "award", captureSha: "s1c" }]);
  await w.thread("ENT-2", [{ stage: "need", captureSha: "s2a" }, { stage: "award", captureSha: "s2b" }, { stage: "award", captureSha: "s2c" },
                           { stage: "contract", captureSha: "s2d" }]);
  await w.thread("ENT-3", [{ stage: "need", captureSha: "s3a" }, { stage: "need", captureSha: "s3b" }]);
  return w;
}

/* The caller's side: the viewer sees every bundle but `hidden`; homes and options record what they were asked. */
function caller(w, { hidden = [], max = 8 } = {}) {
  const asked = { homes: [], options: [] };
  return { asked, deps: {
    subjectsOf: (pk, eid) => w.sql.exec(`SELECT DISTINCT bundle_id FROM progression_instances WHERE progression_key=? AND entity_id=? ORDER BY bundle_id`, pk, eid)
      .map((r) => r.bundle_id).filter((b) => !hidden.includes(b)),
    homesOf: (s) => { asked.homes.push([...s]); return { state: "determined", ungrouped: false, reasons: [], depth_bound: 6, ancestors: [], of: [...s] }; },
    optionsOf: (s) => { asked.options.push([...s]); return [{ act: "cite", on: [...s] }]; },
    subjectsMax: max } };
}
const byId = (items) => Object.fromEntries(items.map((i) => [i.id, i]));

test("R9 (N107): one FINDING per (progression, stage), the cardinality finding aggregated in its own words, never as absent", async () => {
  const w = await seeded();
  const feed = w.p.proposalsFeed(Date.parse(NOW));
  const { deps, asked } = caller(w);
  const items = proposalFindingItems(feed, deps);
  const ids = items.map((i) => i.id);
  assert.deepEqual([...ids].sort(), ["FINDING::proc::award", "FINDING::proc::contract", "FINDING::proc::need"]);
  assert.equal(new Set(ids).size, ids.length, "R32: no item twice");
  const m = byId(items);
  for (const it of items) {
    assert.equal(it.class, "FINDING");
    assert.equal(classOfKind(it.kind), "FINDING", `the mint accepts ${it.kind}`);
    assert.deepEqual(it.age, { state: "undetermined", reason: "derived_on_read", detail: it.age.detail });
    assert.equal(it.assignee, null); assert.equal(it.assignee_role, null);
    assert.equal(it.subject.kind, "progression_stage"); assert.equal(it.subject.id, null);
    assert.equal(it.subject.definition_version, 1);
    assert.equal(it.id, `FINDING::${it.subject.progression_key}::${it.subject.stage_key}`);
  }
  // the cardinality finding alone: its own kind and words, and not "required and absent"
  const need = m["FINDING::proc::need"];
  assert.equal(need.kind, CARDINALITY_EXCEEDED);
  assert.doesNotMatch(need.summary + need.detail, /absent|without it/);
  assert.match(need.summary, /Procurement: the 'need' stage holds more documents than it is declared to hold/);
  assert.match(need.detail, /^2 instances of this progression thread more than one document at 'need' \(4 in all\), which is declared to hold exactly one/);
  assert.deepEqual(need.basis.kinds, [CARDINALITY_EXCEEDED]);
  assert.equal(need.basis.n, 2);
  assert.equal(need.basis.cardinality, "1");
  assert.equal(need.prior_disposition, null);
  assert.deepEqual(need.subject.bundles, ["B1", "B2", "B3", "B8", "B9"]);
  // the missing stage with a cardinality finding at the same key: one item, the proposal's kind leading, both named
  const award = m["FINDING::proc::award"];
  assert.equal(award.kind, "missing_predecessor");
  assert.deepEqual(award.basis.kinds, ["missing_predecessor", CARDINALITY_EXCEEDED]);
  assert.match(award.summary, /the 'award' stage is always required and absent/);
  assert.match(award.detail, /^1 instance of this progression reaches 'award' without it; and 1 instance of this progression thread more than one document at 'award' \(2 in all\), which is declared to hold at most one/);
  assert.deepEqual(award.basis.cardinality_exceeded, { n: 1, cardinality: "0..1", document_count: 2, grade: "B", grade_determined: true });
  assert.deepEqual(award.subject.bundles, ["B8", "B9", "B4", "B5", "B6", "B7"]);
  // a missing stage alone is as it was
  const contract = m["FINDING::proc::contract"];
  assert.equal(contract.kind, "missing_predecessor");
  assert.deepEqual(contract.basis.kinds, ["missing_predecessor"]);
  assert.equal(contract.basis.cardinality_exceeded, undefined);
  assert.equal(contract.basis.n, 2);
  // homes and options are asked of exactly the item's subjects (R7, R12)
  for (const it of items) {
    assert.deepEqual(it.case.of, it.subject.bundles.length < 8 ? it.subject.bundles : it.case.of);
    assert.deepEqual(it.options, [{ act: "cite", on: it.case.of }]);
  }
  assert.equal(asked.homes.length, 3); assert.equal(asked.options.length, 3);
});

test("R9: the grade is the weakest instance's; subjects the viewer may not see are not named; at most subjectsMax", async () => {
  const w = await seeded();
  const feed = w.p.proposalsFeed(Date.parse(NOW));
  const m = byId(proposalFindingItems(feed, caller(w, { hidden: ["B2", "B9"], max: 2 }).deps));
  const need = m["FINDING::proc::need"];
  // ENT-1's weakest link is C (need s1b C → award A), ENT-3 has one placed stage, so its grade is undetermined
  assert.equal(need.basis.grade, null);
  assert.equal(need.basis.grade_determined, false);
  assert.deepEqual(need.subject.bundles, ["B1", "B3"]);
  assert.ok(!JSON.stringify(m).includes('"B2"') && !JSON.stringify(m).includes('"B9"'), "R33: a hidden bundle is named nowhere");
  assert.deepEqual(need.case.of, ["B1", "B3", "B8"]);
  assert.ok(Object.values(m).every((i) => i.subject.bundles.length <= 2));
});

test("R9, R16: a decision that applies removes the item; one about an earlier version travels as prior_disposition", async () => {
  const w = await seeded();
  const d = w.p.disposeProposal({ key: "proc::need", to: "deferred", reason: "being checked", definitionVersion: 1, decidedBy: "member:bob" });
  assert.equal(d.ok, true);
  const c = w.p.disposeProposal({ key: "proc::contract", to: "dismissed", reason: "not needed here", definitionVersion: 1, decidedBy: "member:bob" });
  assert.equal(c.ok, true);
  let m = byId(proposalFindingItems(w.p.proposalsFeed(Date.parse(NOW)), caller(w).deps));
  assert.deepEqual(Object.keys(m), ["FINDING::proc::award"], "D-79: a decided finding leaves the list only by the decision");
  // a new version of the flow: the earlier decisions no longer apply, and each reopened item carries its decision
  assert.equal(w.define({ contract: { within: "2 weeks" } }, { basis: "the statute gives two weeks", citation: "Code 1.2" }).ok, true);
  m = byId(proposalFindingItems(w.p.proposalsFeed(Date.parse(NOW)), caller(w).deps));
  assert.deepEqual(Object.keys(m).sort(), ["FINDING::proc::award", "FINDING::proc::contract", "FINDING::proc::need"]);
  for (const [key, state, reason] of [["FINDING::proc::need", "deferred", "being checked"], ["FINDING::proc::contract", "dismissed", "not needed here"]]) {
    const pd = m[key].prior_disposition;
    assert.equal(pd.state, state); assert.equal(pd.reason, reason); assert.equal(pd.decided_by, "member:bob");
    assert.equal(pd.definition_version, 1); assert.equal(pd.applies, false);
    assert.equal(m[key].subject.definition_version, 2);
  }
  assert.equal(m["FINDING::proc::award"].prior_disposition, null);
  // R16: the basis names the source and the derivation, for every item
  for (const it of Object.values(m)) {
    assert.equal(it.basis.source, "proposalsFeed");
    assert.match(it.basis.detail, /DERIVED \(D-79\)/);
    assert.equal(it.basis.progression_key, "proc");
  }
});

test("R9: an overdue proposal leads with overdue_successor and says how many are past a deadline", () => {
  const inst = (e) => ({ entity_id: e, progression_key: "p", definition_version: 3 });
  const feed = { instances: [], dispositions: [], proposals: [
    { key: "p::s", progression_key: "p", progression_label: "Flow", stage_key: "s", stage_label: "Stage", required: "always",
      definition_version: 3, surfaced_by: "machine", overdue: true, overdue_count: 2, n: 3, kinds: ["missing_predecessor", "overdue_successor"],
      grade: "B", grade_determined: true, prior_disposition: null, instances: [inst("E1"), inst("E2"), inst("E3")] }] };
  const [it] = proposalFindingItems(feed, { subjectsOf: (pk, e) => [`${e}-a`, `${e}-b`, `${e}-c`], homesOf: () => ({}), optionsOf: () => [], subjectsMax: 8 });
  assert.equal(it.kind, "overdue_successor");
  assert.equal(it.detail, "3 instances of this progression reach 'Stage' without it, 2 past a declared deadline");
  assert.deepEqual(it.basis.kinds, ["missing_predecessor", "overdue_successor"]);
  assert.equal(it.basis.overdue_count, 2);
  assert.equal(it.subject.bundles.length, 8, "at most eight subject bundles are named");
  assert.equal(proposalFindingItems({ proposals: [], instances: [] }, { subjectsOf: () => [], homesOf: () => ({}), optionsOf: () => [] }).length, 0);
});
