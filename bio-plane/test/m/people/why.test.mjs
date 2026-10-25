/* people's undetermined answers by key at its interface: R40 (T51; N1226, K3742; screens-investigate R32 (2)), a reason is
   `{key, vars}` drawn through `word(key, vars)`, never English; a reason an owner answers is passed on as it answers it. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, ANN, doc } from "./fixture.mjs";
import { sequenceUndetermined } from "../events/fixtures.mjs";
import { BOUNDS } from "../../../src/connection-grammar/index.mjs";
import { validAt } from "../../../src/civil-time/index.mjs";
import { hasWord, word } from "../../../src/setup-words/index.mjs";

const day = (from, to) => ({ from, to, precision: "day", zone: "UTC" });
const keyed = (k, vars = {}) => ({ key: k, vars });

/* Every `why` in an answer that is a string, by its path: none of this module's own reasons is one (R40). */
function stringWhys(v, path = "", out = []) {
  if (Array.isArray(v)) v.forEach((x, i) => stringWhys(x, `${path}[${i}]`, out));
  else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) {
      if (k === "why" && typeof x === "string") out.push(`${path}.${k}`);
      else stringWhys(x, `${path}.${k}`, out);
    }
  }
  return out;
}
const draws = (why) => { assert.ok(hasWord(why.key), why.key); return word(why.key, why.vars); };

test("R40 a fact stating no validity answers {key: people.why.validity_stated, vars: {}} and word of it equals the key's words; control: a fact with a validity valid at the date is in no undetermined list", () => {
  /* a person's item whose owner states no validity: lines answers an item with none (a stand-in for the owner) */
  let w;
  w = world({ deps: { lines: () => ({
    linesOf: (a) => { const r = w.lines.linesOf(a); return { ...r, lines: r.lines.map((l) => (l.line_id === w.bare ? { ...l, valid: undefined } : l)) }; },
    readLine: (a) => w.lines.readLine(a), structureAt: (a) => w.lines.structureAt(a) }) } });
  const p = w.person("Una Vale");
  const c = w.capture("c");
  w.bare = w.line("holds", p, w.entity("office", "Quay Master"), day("2019-01-01", "2030-01-01"));
  const held = w.line("holds", p, w.entity("office", "Dock Master"), day("2019-01-01", "2030-01-01"));
  assert.equal(w.p.recordPersonFact({ person: p, kind: "locality", value: "Quay", valid: day("2019-01-01", "2030-01-01"), citation: doc(c), by: ANN }).ok, true);
  const r = w.p.personAt({ entityId: p, at: "2024-06-01", viewer: ANN });
  const bare = r.undetermined.find((x) => x.line_id === w.bare);
  assert.deepEqual(bare.undetermined.why, keyed("people.why.validity_stated"));
  assert.equal(draws(bare.undetermined.why), word("people.why.validity_stated"), "the screen draws the key's words");
  assert.deepEqual(r.posts.map((x) => x.line_id), [held], "control: a line valid at the date is held");
  assert.equal(r.facts.length, 1, "control: a fact valid at the date is a fact");
  assert.ok(!r.undetermined.some((x) => x.line_id === held || x.fact_id), "control: neither is in the undetermined list");
  assert.deepEqual(stringWhys(r), [], "no answer's why is a string");
});

test("R40 an owner that states the validity undetermined with no reason is answered people.why.owner_settle_validity; one that gives a reason is passed on exactly as it answers it", () => {
  let w;
  w = world({ deps: { lines: () => ({
    linesOf: (a) => { const r = w.lines.linesOf(a); return { ...r, lines: r.lines.map((l) => (l.line_id === w.mute ? { ...l, valid: { undetermined: true } }
      : l.line_id === w.keyed ? { ...l, valid: { undetermined: true, why: keyed("lines.why.entity_lines_kinds", { hub: 3 }) } } : l)) }; },
    readLine: (a) => w.lines.readLine(a), structureAt: (a) => w.lines.structureAt(a) }) } });
  const p = w.person("Una Vale");
  w.mute = w.line("holds", p, w.entity("office", "Quay Master"), day("2019-01-01", "2030-01-01"));
  w.keyed = w.line("holds", p, w.entity("office", "Dock Master"), day("2019-01-01", "2030-01-01"));
  const u = w.p.personAt({ entityId: p, at: "2024-06-01", viewer: ANN }).undetermined;
  assert.deepEqual(u.find((x) => x.line_id === w.mute).undetermined.why, keyed("people.why.owner_settle_validity"));
  assert.deepEqual(u.find((x) => x.line_id === w.keyed).undetermined.why, keyed("lines.why.entity_lines_kinds", { hub: 3 }), "the owner's key and fills, not re-worded");
  assert.ok(hasWord("people.why.owner_settle_validity"));
});

test("R40 a holds line stated current through a day answers {key: lines.why.stated_current_through, vars: {why, day}} after that day", () => {
  const w = world();
  const p = w.person("Ora Penn");
  const open = w.line("holds", p, w.entity("office", "Harbour Clerk"), day("2018-01-01", null));
  const c = w.capture("current through");
  assert.equal(w.lines.recordCurrentThrough({ lineId: open, day: "2022-12-31", basis: { captureSha: c.captureSha, extent: { kind: "pdf-page", page: 0 } }, by: ANN }).ok, true);
  const after = w.p.personAt({ entityId: p, at: "2024-06-01", viewer: ANN }).undetermined[0].undetermined.why;
  assert.equal(after.key, "lines.why.stated_current_through");
  assert.equal(after.vars.day, "2022-12-31");
  assert.equal(typeof after.vars.why, "string", "the owner's reason, the key's {why}");
  assert.equal(draws(after), `${after.vars.why}; ${word("lines.why.stated_current_through", { why: "", day: "2022-12-31" }).slice(2)}`);
  const on = w.p.personAt({ entityId: p, at: "2022-12-31", viewer: ANN });
  assert.deepEqual([on.posts.length, on.undetermined.length], [1, 0], "control: on the day itself it is held");
});

test("R40 a cluster with a not_same_as claim answers people.why.claim_joins_two with {apart} the claim id, in identityOf and in each read's cluster; a cache stale or differing answers its own key; no answer's why is a string", () => {
  const w = world();
  const [x, y, z] = [w.person("Kay Roe"), w.person("Kay Roe"), w.person("Kay Roe")];
  const t = (a, b, kind) => { const r = w.p.claimIdentity({ a, b, kind, basis: "testimony", note: "said so", by: ANN }); assert.equal(r.ok, true); return r; };
  t(x, y, "same_as"); t(y, z, "same_as");
  const apart = t(x, z, "not_same_as");
  const id = w.p.identityOf({ entityId: y, viewer: ANN });
  assert.equal(id.state, "undetermined");
  assert.deepEqual(id.why, keyed("people.why.claim_joins_two", { apart: apart.claim_id }));
  assert.ok(draws(id.why).includes(apart.claim_id), "word of it names the claim");
  for (const r of [w.p.personAt({ entityId: y, at: "2024-01-01", viewer: ANN }), w.p.careerOf({ entityId: y, viewer: ANN }),
                   w.p.credentialsOf({ entityId: y, viewer: ANN }), w.p.interestsOf({ entityId: y, viewer: ANN }), w.p.statementsOf({ entityId: y, viewer: ANN })])
    assert.deepEqual(r.cluster.why, keyed("people.why.claim_joins_two", { apart: apart.claim_id }));
  w.st.sql.exec(`UPDATE identity_cluster SET component=? WHERE entity_id=?`, z, z);
  assert.deepEqual(w.p.identityOf({ entityId: z, viewer: ANN }).why, keyed("people.identity_cluster_cache_differs"));
  w.record.rebuildDerived("people", "identity_cluster");
  w.record.transact(() => w.record.markStale("people", "identity_cluster", y));
  assert.deepEqual(w.p.identityOf({ entityId: y, viewer: ANN }).why, keyed("people.identity_cluster_cache"));
  for (const k of ["people.identity_cluster_cache", "people.identity_cluster_cache_differs", "people.why.claim_joins_two"]) assert.ok(hasWord(k), k);
  assert.deepEqual(stringWhys(w.p.identityOf({ entityId: y, viewer: ANN })), []);
  /* control: no not_same_as, no why */
  const q = world();
  const [a, b] = [q.person("Lou Ames"), q.person("Lou Ames")];
  assert.equal(q.p.claimIdentity({ a, b, kind: "same_as", basis: "testimony", note: "said so", by: ANN }).ok, true);
  assert.equal("why" in q.p.identityOf({ entityId: a, viewer: ANN }), false);
});

test("R40 a duty whose in-force answer is unsettled with no reason is answered people.why.whether_source_force; a pair statementsOf cannot order is answered people.why.record_settle_order, or the owner's reason exactly when it gives one", () => {
  let w;
  const seq = sequenceUndetermined();
  const owner = { why: undefined };
  w = world({ deps: {
    duties: () => ({ dutiesOf: (a) => { const r = w.duties.dutiesOf(a); return { ...r, duties: (r.duties || r.items || []).map((d) => ({ ...d, in_force: { state: "unsettled" } })) }; } }),
    events: () => ({ statementsOf: (a) => w.ev.statementsOf(a), eventsFor: (a) => w.ev.eventsFor(a),
                     sequence: () => (owner.why ? { ...seq.withoutWhy, why: owner.why } : seq.withoutWhy) }) } });
  const p = w.person("Una Vale");
  w.duty(p);
  const du = w.p.personAt({ entityId: p, at: "2024-06-01", viewer: ANN }).undetermined.find((x) => x.duty_id);
  assert.deepEqual(du.undetermined.why, keyed("people.why.whether_source_force"));
  assert.equal(draws(du.undetermined.why), word("people.why.whether_source_force"));
  w.event("statement", { start: "2020-01-05" }, [{ entity: p, role: "speaker" }]);
  w.event("order", { start: "2020-03-01" }, [{ entity: p, role: "signatory" }]);
  const s = w.p.statementsOf({ entityId: p, viewer: ANN });
  assert.equal(s.order_undetermined.length, 1);
  assert.deepEqual(s.order_undetermined[0].why, keyed("people.why.record_settle_order"));
  assert.equal(draws(s.order_undetermined[0].why), word("people.why.record_settle_order"));
  owner.why = keyed("events.why.precision_held_settle");
  assert.deepEqual(w.p.statementsOf({ entityId: p, viewer: ANN }).order_undetermined[0].why, keyed("events.why.precision_held_settle"), "the owner's key, exactly");
  assert.deepEqual(stringWhys(du), []);
});

test("R40 a hub answer of the identity kinds, at connection-grammar's string contract, is the sentence word reads for people.why.person_end_identity with {hub}, and why_key stands beside it", () => {
  const w = world();
  const node = w.person("Hub Person");
  const others = Array.from({ length: BOUNDS.hub + 1 }, (_, i) => w.person(`Other ${i}`));
  for (const o of others) assert.equal(w.p.claimIdentity({ a: node, b: o, kind: "unsure", basis: "testimony", note: "said so", by: ANN }).ok, true);
  const n = w.p.neighbours({ node, at: "2024-01-01", viewer: ANN });
  assert.deepEqual(n.items, []);
  assert.equal(n.hub.set_size, others.length);
  assert.deepEqual(n.hub.why_key, keyed("people.why.person_end_identity", { hub: BOUNDS.hub }), "the key a screen draws");
  assert.equal(n.hub.why, word("people.why.person_end_identity", { hub: BOUNDS.hub }), "the sentence connection-grammar's contract judges, read by key");
  assert.equal(draws(n.hub.why_key), n.hub.why);
  /* the registry accepts it: control, the answer conforms to the neighbours contract */
  const walked = w.registry.neighbours({ owner: "people", node, at: "2024-01-01", viewer: ANN });
  assert.equal(walked.refused, undefined, JSON.stringify(walked).slice(0, 200));
  assert.equal(walked.hub.why, n.hub.why);
});

test("R40 a claim whose validity does not settle the date is a hop marked undetermined, its why the owner's {key, vars} as civil-time answers it, which connection-grammar's contract judges (R6); the registry accepts it", () => {
  const w = world();
  const [a, b] = [w.person("Kay Roe"), w.person("Kay Roe")];
  assert.equal(w.p.claimIdentity({ a, b, kind: "same_as", basis: "testimony", note: "said so", by: ANN }).ok, true);
  const n = w.registry.neighbours({ owner: "people", node: a, at: "2024-01-01", viewer: ANN });
  assert.equal(n.refused, undefined, JSON.stringify(n).slice(0, 200));
  const u = n.items[0].undetermined;
  /* no start nor end is stated: civil-time answers its reason as a key, and it is passed on as it answers it (R40) */
  assert.deepEqual(u.why, validAt({ valid: { from: null, to: null, precision: "day", zone: "UTC" }, basis: null }, { value: "2024-01-01", precision: "day", zone: "UTC" }).why);
  assert.deepEqual(Object.keys(u), ["why"], "no sentence and no key beside it: the hop's reason is the one key");
});
