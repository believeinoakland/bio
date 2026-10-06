/* retrieval: T34's relations read and the saved query's check (R70 amended, R72; T34-26, N584, K1609), at the
 * interface. `answers` checks a standing question's form when it is set (its R15) with `query-language.savedForm`, the
 * relations this module answers (R72) and the zone that governs (R69); a run must accept every form that check
 * accepted, and refuse every form it refused. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, storage, V } from "./fixture.mjs";
import { Retrieval, FIELD_VIEWS, PROJECTION_RELATION } from "../../../src/retrieval/index.mjs";
import * as QL from "../../../src/query.mjs";
import { EVENTS_SCHEMA } from "../../../src/events/index.mjs";

const T33 = new Set(FIELD_VIEWS.map((v) => v.field));
const form = (q) => ({ v: 1, q, implicitOp: "and", sort: null, dir: null });
const ids = (w, q, viewer) => w.retrieval.search({ q, viewer, mode: "ids", facets: false }).ids;

/* INFO-1 with a capture that resolves to a person, INFO-2 with none, and a project only ann sees. */
function corpus({ deps = {} } = {}) {
  const w = world({ deps });
  const c1 = w.cap("c1", "council minutes"), c3 = w.cap("c3", "a secret memo");
  w.doc("INFO-1", { title: "Minutes" }, { captures: [c1] });
  w.doc("INFO-2", { title: "Budget" });
  const proj = w.project("Hidden", "ann", { captures: [c3] });
  w.st.sql.exec(`INSERT INTO entities (entity_id, kind, label, at) VALUES ('ENT-P', 'person', 'ENT-P', '2026-01-01T00:00:00Z')`);
  for (const [c, b] of [[c1, "INFO-1"], [c3, proj]])
    w.st.sql.exec(`INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, method, established)
                   VALUES (?,?, 'ref', 'ENT-P', 'B', 'alias', 1)`, c.sha, b);
  return { w, proj, c1, c3 };
}

/* The local day `iso` falls on in `zone`. */
const dayIn = (iso, zone) => new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" })
  .format(new Date(iso));

test("R72: relations() answers the relations every compile names, at this moment: the projection's relation and each live T33 field's {table, key, col}, exactly the fields searchFields says are available here, frozen and synchronous", () => {
  const { w, c1 } = corpus();
  const r = w.retrieval.relations();
  assert.equal(typeof r.then, "undefined", "synchronous: never a promise");
  assert.deepEqual(r.projection, PROJECTION_RELATION);
  const sf = w.retrieval.searchFields().fields;
  const available = [...T33].filter((f) => sf[f].available).sort();
  assert.deepEqual(Object.keys(r.fields).sort(), available, "the fields named are those available here, no other");
  assert.ok(available.includes("person"));
  for (const [f, rel] of Object.entries(r.fields)) {
    assert.deepEqual(Object.keys(rel).sort(), ["col", "key", "table"], f);
    assert.ok([rel.table, rel.key, rel.col].every((n) => typeof n === "string" && /^[A-Za-z_][A-Za-z0-9_]*$/.test(n)), f);
    assert.ok(Object.isFrozen(rel), `${f}'s relation is frozen`);
  }
  assert.ok(Object.isFrozen(r) && Object.isFrozen(r.fields) && Object.isFrozen(r.projection), "frozen at every level");
  /* The compile it describes is the one a search runs: the same field, the same answer. */
  assert.deepEqual(QL.compile({ q: "person:ENT-P", viewer: V("vera") }, r).drops, []);
  assert.deepEqual(QL.compile({ q: "person:ENT-P", viewer: V("vera") }, null).drops.length, 1, "without them, the field drops");
  /* At this moment: a field whose owner's tables arrive is named from then on, and an earlier answer is unchanged. */
  assert.equal(r.fields.event, undefined);
  w.st.db.exec(EVENTS_SCHEMA);
  w.st.sql.exec(`INSERT INTO event_attestations (event_id, form, capture_sha, extent, at) VALUES ('EVT-1', 'extent', ?, '{}', 'x')`, c1.sha);
  const later = w.retrieval.relations();
  assert.ok(later.fields.event && later.fields.occurred, "events' fields, now that its tables are held");
  assert.equal(r.fields.event, undefined, "the earlier answer is frozen");
  assert.deepEqual(ids(w, "event:EVT-1", V("vera")), ["INFO-1"]);
  /* It writes nothing. */
  const n = w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '%fts%'`)
    .map((t) => [t.name, w.count(t.name)]);
  w.retrieval.relations();
  assert.deepEqual(w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '%fts%'`)
    .map((t) => [t.name, w.count(t.name)]), n);
});

test("R72: a registered field (R62) is named with its owner's relation over the view, and money's words ride beside the relations while money is injected", () => {
  const money = { kinds: () => ["revenue", "expenditure"], phases: () => [], stages: () => [], bases: () => [] };
  const { w } = corpus({ deps: { money } });
  w.st.sql.exec(`CREATE TABLE person_cache (bundle_id TEXT PRIMARY KEY, who TEXT)`);
  assert.equal(w.retrieval.registerField("people", "person", { table: "person_cache", key: "bundle_id", col: "who" }).ok, true);
  const r = w.retrieval.relations();
  assert.deepEqual({ ...r.fields.person }, { table: "person_cache", key: "bundle_id", col: "who" }, "the registration wins");
  assert.equal(r.money, money, "money's words, as every compile is handed them");
  assert.ok(Object.isFrozen(r));
});

test("R72: with nothing registered and no owner's table held it answers the relations R61-R62 name, the projection alone; a storage that cannot be read answers the same and never throws", () => {
  const bare = new Retrieval({ storage: storage(), record: {}, membership: {}, promotion: null, extraction: null });
  assert.deepEqual(bare.relations(), { projection: PROJECTION_RELATION });
  const broken = new Retrieval({ storage: { sql: { exec() { throw new Error("no storage"); } } }, record: {},
                                 membership: {}, promotion: null, extraction: null });
  assert.doesNotThrow(() => broken.relations());
  assert.deepEqual(broken.relations(), { projection: PROJECTION_RELATION });
  assert.ok(Object.isFrozen(broken.relations()));
});

test("R70: runSaved checks the form with R72's relations and R69's zone, the ones answers checks it with when the question is set: a date term and a T33 field that compiled then run now, under the owner's sight, and are not refused SAVED_QUERY_DROPS", () => {
  const { w, proj } = corpus();
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:ann");
  const zone = w.retrieval.zone();
  assert.equal(zone, "America/Halifax");
  const created = w.row(`SELECT created FROM bundles WHERE bundle_id='INFO-1'`).created;
  const day = dayIn(created, zone);
  for (const q of [`created:${day}`, `created:${day} person:ENT-P`, "person:ENT-P"]) {
    /* answers' check, as its R15 makes it. */
    const check = QL.savedForm({ q, zone: w.retrieval.zone() }, w.retrieval.relations());
    assert.equal(check.ok, true, `${q}: the check at setting accepts it`);
    const run = w.retrieval.runSaved({ form: check.form, owner: V("ann"), viewer: V("ann") });
    assert.equal(run.ok, true, `${q}: the run accepts what the check accepted`);
    assert.deepEqual(run.ids, ids(w, q, V("ann")), `${q}: the run answers as a search under the owner's sight`);
    assert.deepEqual(run.warnings, [], `${q}: nothing dropped`);
  }
  assert.ok(w.retrieval.runSaved({ form: form("person:ENT-P"), owner: V("ann"), viewer: V("ann") }).ids.includes(proj));
  assert.ok(w.retrieval.runSaved({ form: form(`created:${day}`), owner: V("ann"), viewer: V("ann") }).ids.includes("INFO-1"));
});

test("R70: a form the check at setting would refuse is refused by the run with query-language's own refusal, the zone and relations included: a date term with no governing zone, a field no relation here supplies", () => {
  const { w } = corpus();
  assert.equal(w.retrieval.zone(), null, "no profile: no zone governs");
  const forms = ["created:2026-09-27", "event:EVT-1", "nosuchfield:x", "person:ENT-P"];
  for (const q of forms) {
    const check = QL.savedForm({ q, implicitOp: "and", sort: null, dir: null, zone: w.retrieval.zone() }, w.retrieval.relations());
    const run = w.retrieval.runSaved({ form: form(q), owner: V("ann"), viewer: V("ann") });
    assert.equal(run.ok, check.ok, `${q}: the run agrees with the check`);
    if (!check.ok) assert.deepEqual(run, check, `${q}: query-language's refusal, as it gives it`);
  }
  const run = w.retrieval.runSaved({ form: form("created:2026-09-27"), owner: V("ann"), viewer: V("ann") });
  assert.equal(run.reason, "SAVED_QUERY_DROPS");
});
