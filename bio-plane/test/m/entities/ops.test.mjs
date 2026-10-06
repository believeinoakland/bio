/* entities' ops map and its count figures at its interface: R40, R41. Each op is run against two worlds built alike,
   one through the map and one through the named service, and the two answers and the two records must be the same. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, MACHINE } from "./fixture.mjs";
import { entitiesOf, entitiesOps, Entities } from "../../../src/entities/index.mjs";
import { hiddenBundles } from "../../../src/membership/index.mjs";

const OPS = ["readingname", "readingnameplan", "entitycreate", "entityalias", "relationdeclare", "aliaswithdraw",
             "relationwithdraw", "resolutiondefect", "entity", "entitybyalias", "relation", "resolutions", "concerns",
             "idmatch", "resolve", "resolvetestify", "entityidentify"];

/* A world with a registry, a reading, resolutions, a relation and a defect report, the same every time it is built. */
function seeded() {
  const w = world({ profiles: ["test-port-ellery"] });
  const a = w.e.createEntity({ note: "a subject the test registers", kind: "office", label: "Harbour Office", aliases: ["ho:1"], declaredBy: MACHINE }).entity_id;
  const b = w.e.createEntity({ note: "a subject the test registers", kind: "body", label: "Port Board" }).entity_id;
  const rel = w.e.declareRelation({ relation: "member_of", fromEntity: a, toEntity: b, justification: "j", citation: "c" }).relation_id;
  w.e.createEntity({ note: "a subject the test registers", kind: "person", label: "Pat Marlow" });
  w.read("INFO-1", sha("ops"), [{ kind: "ho", key: "1", label: "x" }, { kind: "q", key: "2", label: "Harbour Office" },
                                 { kind: "q", key: "3", label: "Port Board" }]);
  w.e.resolve({ captureSha: sha("ops"), ref: "ho:1", resolvedBy: MACHINE });
  w.e.reportResolutionDefect({ captureSha: sha("ops"), ref: "ho:1", entityId: a, reason: "r", by: "member:ann" });
  w.held("INFO-2", sha("held"), ["https://minutes.port-ellery.example/a/1"]);
  return { ...w, a, b, rel };
}
const dump = (w) => ["entities", "entity_aliases", "entity_relations", "resolutions", "resolution_defects", "entity_identifiers",
                     "entity_sectors", "entity_proceedings"]
  .map((t) => w.rows(`SELECT * FROM ${t}`));
const url = (q) => new URL(`https://do.invalid/?${new URLSearchParams(q)}`);

test("R40 R43 entitiesOps holds exactly the fourteen ops it held, resolve and resolvetestify, and R43's entityidentify, each a function of no arguments", () => {
  const { e } = seeded();
  const map = entitiesOps(e, url({}), {});
  assert.deepEqual(Object.keys(map).sort(), [...OPS].sort());
  for (const [op, fn] of Object.entries(map)) assert.deepEqual([typeof fn, fn.length], ["function", 0], op);
});

test("R40 every arm answers what its named service answers, reading its parameters from the query (the stamps among them) and its act's arguments from the body ({} when absent); resolve and resolvetestify take the body as given, resolvedBy the stamp", () => {
  const cases = [
    ["readingname", (s) => [{ entity: s.a, limit: "5", viewer: MACHINE }, null],
                    (e, s) => e.namingDocuments({ entityId: s.a, limit: "5", viewer: MACHINE })],
    ["readingnameplan", () => [{ terms: " harbour , office ," }, null], (e) => e.namingPlan(["harbour", "office"])],
    ["readingnameplan", () => [{}, null], (e) => e.namingPlan([])],
    ["entitycreate", () => [{}, { kind: "fund", label: "Harbour Fund", note: "the harbour's capital fund", aliases: ["hf"], declaredBy: "member:ann" }],
                     (e) => e.createEntity({ kind: "fund", label: "Harbour Fund", note: "the harbour's capital fund", aliases: ["hf"], declaredBy: "member:ann" })],
    ["entitycreate", () => [{}, { kind: "fund", label: "Harbour Fund", declaredBy: "member:ann" }],
                     (e) => e.createEntity({ kind: "fund", label: "Harbour Fund", declaredBy: "member:ann" })],
    ["entitycreate", () => [{}, null], (e) => e.createEntity({})],
    ["entityalias", (s) => [{}, { entityId: s.b, alias: "the board", declaredBy: MACHINE }],
                    (e, s) => e.addAlias({ entityId: s.b, alias: "the board", declaredBy: MACHINE })],
    ["entityalias", () => [{}, null], (e) => e.addAlias({})],
    ["relationdeclare", (s) => [{}, { fromEntity: s.b, toEntity: s.a, relation: "overlaps", justification: "j", citation: "c" }],
                        (e, s) => e.declareRelation({ fromEntity: s.b, toEntity: s.a, relation: "overlaps", justification: "j", citation: "c" })],
    ["relationdeclare", () => [{}, null], (e) => e.declareRelation({})],
    ["aliaswithdraw", (s) => [{}, { entityId: s.a, alias: "ho:1", reason: "wrong", withdrawnBy: "member:ann" }],
                      (e, s) => e.withdrawAlias({ entityId: s.a, alias: "ho:1", reason: "wrong", withdrawnBy: "member:ann" })],
    ["aliaswithdraw", () => [{}, null], (e) => e.withdrawAlias({})],
    ["relationwithdraw", (s) => [{}, { relationId: s.rel, reason: "wrong", withdrawnBy: MACHINE }],
                         (e, s) => e.withdrawRelation({ relationId: s.rel, reason: "wrong", withdrawnBy: MACHINE })],
    ["relationwithdraw", () => [{}, null], (e) => e.withdrawRelation({})],
    ["resolutiondefect", (s) => [{}, { captureSha: sha("ops"), ref: "ho:1", entityId: s.a, reason: "again", by: MACHINE }],
                         (e, s) => e.reportResolutionDefect({ captureSha: sha("ops"), ref: "ho:1", entityId: s.a, reason: "again", by: MACHINE })],
    ["resolutiondefect", () => [{}, null], (e) => e.reportResolutionDefect({})],
    ["entity", (s) => [{ id: s.a, viewer: "member:outsider" }, null], (e, s) => e.readEntity({ entityId: s.a, viewer: "member:outsider" })],
    ["entitybyalias", () => [{ alias: "HO:1", viewer: MACHINE }, null], (e) => e.entitiesByAlias({ alias: "HO:1", viewer: MACHINE })],
    ["relation", (s) => [{ id: s.rel }, null], (e, s) => e.readRelation({ relationId: s.rel })],
    ["resolutions", () => [{ sha256: sha("ops"), limit: "1", viewer: MACHINE }, null],
                    (e) => e.resolutionsFor({ captureSha: sha("ops"), limit: "1", viewer: MACHINE })],
    ["concerns", (s) => [{ id: s.a, limit: "2", viewer: MACHINE }, null], (e, s) => e.concerns({ entityId: s.a, limit: "2", viewer: MACHINE })],
    ["idmatch", () => [{ space: "project", a: "WO-0001", b: "wo0001", a_capture: sha("held"), b_capture: sha("held"),
                         a_name: "x", b_name: "y", referent: "agrees", viewer: MACHINE }, null],
                (e) => e.idMatch({ space: "project", a: "WO-0001", b: "wo0001", aCapture: sha("held"), bCapture: sha("held"),
                                   aName: "x", bName: "y", referent: "agrees", viewer: MACHINE })],
    ["resolve", () => [{}, { captureSha: sha("ops"), resolvedBy: "member:ann" }],
                (e) => e.resolve({ captureSha: sha("ops"), resolvedBy: "member:ann" })],
    ["resolve", () => [{}, { captureSha: sha("ops"), ref: "q:2", resolvedBy: MACHINE }],
                (e) => e.resolve({ captureSha: sha("ops"), ref: "q:2", resolvedBy: MACHINE })],
    ["resolve", () => [{}, { items: [{ captureSha: sha("ops") }, { captureSha: "" }], resolvedBy: MACHINE }],
                (e) => e.resolve({ items: [{ captureSha: sha("ops") }, { captureSha: "" }], resolvedBy: MACHINE })],
    ["resolve", () => [{}, null], (e) => e.resolve({})],
    ["resolvetestify", (s) => [{}, { captureSha: sha("ops"), ref: "q:3", entityId: s.a, basis: "I saw it", resolvedBy: "member:ann" }],
                       (e, s) => e.testify({ captureSha: sha("ops"), ref: "q:3", entityId: s.a, basis: "I saw it", resolvedBy: "member:ann" })],
    ["resolvetestify", (s) => [{}, { captureSha: sha("ops"), ref: "q:3", entityId: s.a, basis: " " }],
                       (e, s) => e.testify({ captureSha: sha("ops"), ref: "q:3", entityId: s.a, basis: " " })],
    ["resolvetestify", () => [{}, null], (e) => e.testify({})],
    ["entityidentify", () => [{}, { entityId: "ENT-2026-0003", scheme: "marlow_bar", id: "bar12345", basis: "the bar's roll", by: "member:ann" }],
                       (e) => e.addIdentifier({ entityId: "ENT-2026-0003", scheme: "marlow_bar", id: "bar12345", basis: "the bar's roll", by: "member:ann" })],
    ["entityidentify", () => [{}, null], (e) => e.addIdentifier({})],
  ];
  assert.deepEqual([...new Set(cases.map(([op]) => op))].sort(), [...OPS].sort(), "every op is driven");
  for (const [op, input, direct] of cases) {
    const viaMap = seeded(), viaService = seeded();
    const [query, body] = input(viaMap);
    const got = entitiesOps(viaMap.e, url(query), body)[op]();
    const want = direct(viaService.e, viaService);
    assert.deepEqual(got, want, `${op} ${JSON.stringify(query)} ${JSON.stringify(body)}`);
    assert.deepEqual(dump(viaMap), dump(viaService), `${op}: the same record afterwards`);
  }
});

test("R40 resolve through the map mints what the recogniser mints and resolvetestify records D in the stamped name; neither reads a field the body does not carry", () => {
  const s = seeded();
  const r = entitiesOps(s.e, url({ resolvedBy: "member:forged" }), { captureSha: sha("ops"), resolvedBy: "class:ai" }).resolve();
  assert.deepEqual(r.resolved.map((m) => [m.ref, m.grade, m.kept ? "kept" : m.resolved_by]).sort(),
                   [["ho:1", "A", "kept"], ["q:2", "C", "class:ai"], ["q:3", "C", "class:ai"]],
                   "the body's stamp, never the query's; the A already held is kept");
  const t = entitiesOps(s.e, url({}), { captureSha: sha("ops"), ref: "ho:1", entityId: s.b, basis: "b", resolvedBy: "member:ann" }).resolvetestify();
  assert.deepEqual([t.ok, t.grade, t.resolved_by, t.established], [true, "D", "member:ann", false]);
  assert.match(t.method, /member:ann/);
});

test("R41 the four figures are registered once at start through record-core's registerCounts and answered whole without hid: the registry's rows and the resolutions' rows", () => {
  const s = seeded();
  const host = { storage: s.st };
  const e = entitiesOf(host, { record: s.record, membership: s.membership, provenance: s.prov });
  assert.equal(entitiesOf(host), e, "one instance per storage, so one registration");
  assert.deepEqual(Entities.COUNT_KEYS, ["entities", "entityAliases", "entityRelations", "resolutions"]);
  const want = { entities: 3, entityAliases: 4, entityRelations: 1, resolutions: 1 };
  const all = s.record.counts(null);
  for (const [k, v] of Object.entries(want)) assert.equal(all[k], v, k);
  assert.deepEqual(e.counts(null), want);
  assert.deepEqual(e.counts(), want);
  const again = s.record.registerCounts("entities", [...Entities.COUNT_KEYS], () => ({}));
  assert.deepEqual([again.ok, again.code], [false, "COUNTS_DECLARED"], "a second registration is refused");
});

test("R41 with hid, resolutions leaves out the rows whose bundle is hidden; the registry figures, keyed on no bundle, count every row; synchronous, writes nothing, never zero for a figure it cannot read", () => {
  const s = seeded();
  s.project("PROJ-2026-0001-x", "insider");
  s.read("PROJ-2026-0001-x", sha("hid"), [{ kind: "ho", key: "1", label: "Port Board" }, { kind: "z", key: "9", label: "Port Board" }]);
  s.e.resolve({ captureSha: sha("hid") });
  const whole = s.e.counts(null);
  assert.deepEqual(whole, { entities: 3, entityAliases: 4, entityRelations: 1, resolutions: 3 });
  const before = dump(s);
  const outsider = s.e.counts(hiddenBundles("member:outsider"));
  assert.deepEqual(outsider, { ...whole, resolutions: 1 }, "the hidden project's two resolutions are left out");
  assert.deepEqual(s.e.counts(hiddenBundles("member:insider")), whole, "a participant hides nothing");
  assert.deepEqual(s.e.counts(hiddenBundles(null)), { ...whole, resolutions: 0 }, "a refused viewer hides every bundle");
  assert.equal(hiddenBundles(MACHINE), null);
  /* registered, record-core passes hid on as given */
  const e = entitiesOf({ storage: s.st }, { record: s.record, membership: s.membership, provenance: s.prov });
  assert.equal(s.record.counts(hiddenBundles("member:outsider")).resolutions, 1);
  assert.deepEqual(e.counts(hiddenBundles("member:outsider")), outsider);
  /* a hid that is not {sql, args} subtracts nothing */
  for (const bad of [{}, { sql: 7 }, "x", 7, { sql: null, args: [] }]) assert.deepEqual(s.e.counts(bad), whole, JSON.stringify(bad));
  assert.ok(!(s.e.counts(null) instanceof Promise));
  assert.deepEqual(dump(s), before, "writes nothing");
  s.st.db.exec(`DROP TABLE entity_relations`);
  const broken = s.e.counts(null);
  assert.deepEqual(broken, { ...whole, entityRelations: null }, "a figure it cannot read is null, never zero");
  assert.doesNotThrow(() => s.e.counts({ sql: "(SELECT nope FROM nowhere)", args: [] }));
  assert.equal(s.e.counts({ sql: "(SELECT nope FROM nowhere)", args: [] }).resolutions, null);
});
