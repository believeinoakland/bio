/* affordances: `op=affordancefacts` as this module's op map (`affordancesOps`, N13's share of `legacy-store`'s map §4.1),
   the route the composition root spreads into the durable object's one map. Driven in-process over `contradiction`'s
   fixture (its real record, membership, promotion, inquiry and contradiction modules), with the stand-ins
   `contradiction.test.mjs` uses for the providers that fixture does not build. Measured: the route answers exactly
   `affordanceFacts` for the query's target and stamps (R13–R15), an absent stamp reads null (R15), and asking writes
   nothing (R22). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, IQ, INFO, M1, M2 } from "../contradiction/seed.mjs";
import { affordancesOf, affordancesOps } from "../../../src/affordances.mjs";

const NONE = { confirmed: [], severed: [] };
const world = () => {
  const w = seeded();
  const a = affordancesOf(w.host, {
    record: w.record, membership: w.membership, sql: w.st.sql, inquiry: w.k, basisVersions: w.bv, contradiction: w.c,
    connections: { citesInto: () => NONE },
    citation: { retiredNotCitable: () => false },
    publication: { caseRelation: () => ({ member: false }) },
    ratification: { caseConclusionFor: () => ({ state: "none" }), editionsRecordingConclusion: () => ({ same: [] }) },
  });
  return { w, a };
};
const route = (a, query) => affordancesOps(a, new URL(`http://do/affordancefacts?${new URLSearchParams(query)}`));

test("R13 R14 R15 R37: the op map holds exactly `affordancefacts` and `affordancescreens`, and `affordancefacts` it answers affordanceFacts for the query's target, "
   + "viewer, identity, author and by", () => {
  const { a } = world();
  assert.deepEqual(Object.keys(route(a, {})), ["affordancefacts", "affordancescreens"]);
  const asks = [
    { target: IQ.a, viewer: M1, identity: M1, author: M1, by: "m1" },
    { target: IQ.a, viewer: M2, identity: M1, author: "class:ai", by: "class:ai" },
    { target: INFO.a, viewer: M1, identity: M2, author: M2, by: "m2" },
    { target: "INQ-2026-9999-nowhere", viewer: M1, identity: M1, author: M1, by: "m1" },
  ];
  for (const q of asks) assert.deepEqual(route(a, q).affordancefacts(), a.affordanceFacts(q), JSON.stringify(q));
  const known = route(a, asks[1]).affordancefacts();
  assert.equal(known.ok, true, JSON.stringify(known).slice(0, 300));
  assert.equal(known.actor_is_machine, true, "author reaches the facts");
});

test("R13 R15: an absent stamp reads null — no target is NO_TARGET, and with no author actor_is_machine is null and "
   + "with no `by` the roster is null", () => {
  const { a } = world();
  const none = route(a, { viewer: M1 }).affordancefacts();
  assert.equal(none.reason, "NO_TARGET");
  /* K899 (1): the detail a member reads names a record id, never a bundle */
  assert.equal(none.detail, "affordances are asked of an object: pass target=<record id>");
  const f = route(a, { target: IQ.a, viewer: M1 }).affordancefacts();
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  assert.deepEqual(f, a.affordanceFacts({ target: IQ.a, viewer: M1, identity: null, author: null, by: null }));
  assert.equal(f.actor_is_machine, null);
  assert.equal(route(a, { target: INFO.a }).affordancefacts().reason, "NO_SUCH_BUNDLE", "an absent viewer sees nothing");
});

test("R22: answering the route writes nothing — every table's rows are unchanged by repeated asks", () => {
  const { w, a } = world();
  const tables = () => [...w.st.sql.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")].map((r) => r.name);
  const snapshot = () => JSON.stringify(tables().map((t) => [t, [...w.st.sql.exec(`SELECT * FROM "${t}"`)]]));
  const before = snapshot();
  for (let i = 0; i < 5; i++)
    for (const target of [IQ.a, INFO.a, "INQ-2026-9999-nowhere", ""])
      route(a, { target, viewer: M1, identity: M1, author: M1, by: "m1" }).affordancefacts();
  assert.equal(snapshot(), before);
});
