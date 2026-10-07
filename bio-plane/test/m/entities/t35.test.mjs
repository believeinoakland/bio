/* entities' T35 work at its interface (T35-27): the one sector list, jurisdictions' `SECTORS` (R50), and the group's
   registered entities of one kind, `entitiesOfKind` and its op (R51). Run over the test profile (layers.md rule 3). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";
import { SECTORS, ORGANISATION_KINDS, ENTITY_KINDS, KIND_LIMIT_DEFAULT, KIND_LIMIT_MAX, entitiesOps } from "../../../src/entities/index.mjs";
import { SECTORS as JURISDICTION_SECTORS } from "../../../../jurisdictions/index.mjs";

const NOTE = "a subject the test registers";
const count = (w, t) => w.rows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n;
const dump = (w) => ["entities", "entity_aliases", "entity_sectors"].map((t) => w.rows(`SELECT * FROM ${t}`));

test("R50 the sector list is jurisdictions' SECTORS: sectors() answers it deep and in order, the export is that same list, R42 accepts exactly its members and names them in UNKNOWN_SECTOR", () => {
  const w = world({ profiles: ["test-port-ellery"] });
  assert.equal(SECTORS, JURISDICTION_SECTORS, "the same list, no copy held here");
  assert.deepEqual(w.e.sectors(), [...JURISDICTION_SECTORS]);
  assert.notEqual(w.e.sectors(), JURISDICTION_SECTORS, "a caller's array, which cannot change the list");
  for (const kind of ORGANISATION_KINDS) {
    for (const sector of JURISDICTION_SECTORS) {
      const made = w.e.createEntity({ note: NOTE, kind, label: `${kind} ${sector}`, sector });
      assert.deepEqual([made.ok, made.sector], [true, sector], `${kind} ${sector}`);
    }
  }
  const org = w.e.createEntity({ note: NOTE, kind: "institution", label: "Harbour Trust" }).entity_id;
  for (const sector of JURISDICTION_SECTORS.slice().reverse()) {
    const r = w.e.setSector({ entityId: org, sector, note: "set from the list" });
    assert.equal(r.ok, true, sector);
  }
  const before = [count(w, "entities"), count(w, "entity_sectors")];
  for (const sector of ["undetermined", "Government", "club", "public", " company", 7, ""]) {
    const c = w.e.createEntity({ note: NOTE, kind: "body", label: "Club", sector });
    assert.deepEqual([c.ok, c.reason, c.sectors], [false, "UNKNOWN_SECTOR", [...JURISDICTION_SECTORS]], JSON.stringify(sector));
    for (const s of JURISDICTION_SECTORS) assert.match(c.detail, new RegExp(`\\b${s}\\b`));
    const u = w.e.setSector({ entityId: org, sector, note: "n" });
    assert.deepEqual([u.reason, u.sectors], ["UNKNOWN_SECTOR", [...JURISDICTION_SECTORS]], JSON.stringify(sector));
  }
  assert.deepEqual([count(w, "entities"), count(w, "entity_sectors")], before, "a refusal writes nothing");
});

/* A registry with offices a member added and one a machine registered, an institution with and without a sector, and
   a person. */
function registry() {
  const w = world({ profiles: ["test-port-ellery"] });
  const ids = {
    clerk: w.e.createEntity({ note: "the office that keeps the minutes", kind: "office", label: "Harbour Clerk", declaredBy: "member:ann" }).entity_id,
    trust: w.e.createEntity({ note: NOTE, kind: "institution", label: "Harbour Trust", sector: "nonprofit" }).entity_id,
    master: w.e.createEntity({ note: "registered from the profile", kind: "office", label: "Harbourmaster", declaredBy: "class:daemon" }).entity_id,
    pat: w.e.createEntity({ note: NOTE, kind: "person", label: "Pat Quill" }).entity_id,
    board: w.e.createEntity({ note: NOTE, kind: "institution", label: "Old Board" }).entity_id,
    auditor: w.e.createEntity({ note: "the auditor's post", kind: "office", label: "Auditor", declaredBy: "member:bo" }).entity_id,
  };
  return { ...w, ...ids };
}

test("R51 entitiesOfKind refuses, in order and writing nothing, NO_KIND, UNKNOWN_KIND naming the closed list, then VIEWER_MISSING", () => {
  const w = registry();
  const before = JSON.stringify(dump(w));
  for (const kind of [undefined, null, "", "  ", 7]) {
    const r = w.e.entitiesOfKind({ kind, viewer: "member:ann" });
    assert.deepEqual([r.ok, r.reason], [false, "NO_KIND"], JSON.stringify(kind));
  }
  for (const kind of ["offices", "court", "organisation"]) {
    const r = w.e.entitiesOfKind({ kind, viewer: undefined });
    assert.deepEqual([r.ok, r.reason, r.kinds], [false, "UNKNOWN_KIND", [...ENTITY_KINDS]], kind);
    assert.match(r.detail, /one of source, institution, office/);
  }
  assert.equal(w.e.entitiesOfKind({ viewer: undefined }).reason, "NO_KIND", "the kind before the viewer");
  for (const viewer of [undefined, null, ""]) {
    const r = w.e.entitiesOfKind({ kind: "office", viewer });
    assert.deepEqual([r.ok, r.reason], [false, "VIEWER_MISSING"], JSON.stringify(viewer));
  }
  assert.equal(JSON.stringify(dump(w)), before, "nothing written");
});

test("R51 every recognised viewer sees every entity of the kind, in entity_id order, each as {entity_id, kind, label, note, sector, declared_by, at}; an office a member added beside one a machine registered; an unrecognised viewer sees none", () => {
  const w = registry();
  w.project("PROJ-2026-0001-x", "insider");
  const want = [w.clerk, w.master, w.auditor].sort();
  for (const viewer of ["member:ann", "member:outsider", "member:insider", MACHINE, "admin"]) {
    const r = w.e.entitiesOfKind({ kind: "office", viewer });
    assert.deepEqual([r.ok, r.kind, r.count, r.limit, r.truncated, r.next], [true, "office", 3, KIND_LIMIT_DEFAULT, false, null], viewer);
    assert.deepEqual(r.entities.map((e) => e.entity_id), want, viewer);
  }
  const offices = w.e.entitiesOfKind({ kind: " Office ", viewer: "member:ann" }).entities;
  for (const e of offices) assert.deepEqual(Object.keys(e), ["entity_id", "kind", "label", "note", "declared_by", "at"], "no sector for an office");
  const by = Object.fromEntries(offices.map((e) => [e.entity_id, e]));
  assert.deepEqual([by[w.clerk].label, by[w.clerk].note, by[w.clerk].declared_by, by[w.clerk].kind],
                   ["Harbour Clerk", "the office that keeps the minutes", "member:ann", "office"]);
  assert.equal(by[w.master].declared_by, "class:daemon", "a reader tells a machine's office from a member's");
  for (const e of offices) assert.equal(e.at, w.e.readEntity({ entityId: e.entity_id }).entity.at);
  const orgs = w.e.entitiesOfKind({ kind: "institution", viewer: "member:ann" }).entities;
  assert.deepEqual(orgs.map((e) => [e.entity_id, e.sector]), [[w.trust, "nonprofit"], [w.board, "undetermined"]]);
  for (const e of orgs) assert.deepEqual(Object.keys(e), ["entity_id", "kind", "label", "note", "sector", "declared_by", "at"]);
  assert.deepEqual(w.e.entitiesOfKind({ kind: "person", viewer: "member:ann" }).entities.map((e) => e.entity_id), [w.pat]);
  assert.deepEqual(w.e.entitiesOfKind({ kind: "fund", viewer: "member:ann" }), { ok: true, kind: "fund", entities: [], count: 0,
    limit: KIND_LIMIT_DEFAULT, truncated: false, next: null });
  for (const viewer of ["somebody", "member:", "class:robot", 7]) {
    const r = w.e.entitiesOfKind({ kind: "office", viewer });
    assert.deepEqual([r.ok, r.count, r.entities, r.truncated, r.next], [true, 0, [], false, null], String(viewer));
  }
});

test("R51 a page: limit clamped to 1-500 (default 100) and published; truncated and next the last id when one more follows, after continuing in entity_id order; it writes nothing and never throws", () => {
  const w = world({ profiles: ["test-port-ellery"] });
  const made = [];
  for (let i = 0; i < 7; i++) made.push(w.e.createEntity({ note: NOTE, kind: "office", label: `Office ${i}`, declaredBy: "member:ann" }).entity_id);
  w.e.createEntity({ note: NOTE, kind: "person", label: "Not an office" });
  const before = JSON.stringify(dump(w));
  const p1 = w.e.entitiesOfKind({ kind: "office", limit: 3, viewer: "member:ann" });
  assert.deepEqual([p1.entities.map((e) => e.entity_id), p1.count, p1.limit, p1.truncated, p1.next], [made.slice(0, 3), 3, 3, true, made[2]]);
  const p2 = w.e.entitiesOfKind({ kind: "office", limit: "3", after: p1.next, viewer: "member:ann" });
  assert.deepEqual([p2.entities.map((e) => e.entity_id), p2.truncated, p2.next], [made.slice(3, 6), true, made[5]]);
  const p3 = w.e.entitiesOfKind({ kind: "office", limit: 3, after: p2.next, viewer: "member:ann" });
  assert.deepEqual([p3.entities.map((e) => e.entity_id), p3.truncated, p3.next], [made.slice(6), false, null]);
  const exact = w.e.entitiesOfKind({ kind: "office", limit: 7, viewer: "member:ann" });
  assert.deepEqual([exact.count, exact.truncated, exact.next], [7, false, null], "exactly a page: not truncated");
  for (const [limit, cap] of [[0, 1], [-5, 1], [1, 1], [500, 500], [501, KIND_LIMIT_MAX], [1e9, 500], [null, 100], [undefined, 100], ["", 100], ["x", 100], [2.7, 2]])
    assert.equal(w.e.entitiesOfKind({ kind: "office", limit, viewer: "member:ann" }).limit, cap, String(limit));
  assert.equal(w.e.entitiesOfKind({ kind: "office", limit: 0, viewer: "member:ann" }).entities.length, 1);
  assert.deepEqual(w.e.entitiesOfKind({ kind: "office", after: "ENT-9999-9999", viewer: "member:ann" }).entities, []);
  assert.equal(w.e.entitiesOfKind({ kind: "office", after: 7, viewer: "member:ann" }).count, 7, "an after that is no id starts from the first");
  for (const q of [undefined, null, { kind: {} }, { kind: "office", viewer: {} }, { kind: "office", viewer: "member:ann", limit: {} }])
    assert.doesNotThrow(() => w.e.entitiesOfKind(q ?? undefined));
  assert.equal(JSON.stringify(dump(w)), before, "writes nothing");
  /* the default page and its bound */
  for (let i = 7; i < 102; i++) w.e.createEntity({ note: NOTE, kind: "office", label: `Office ${i}` });
  const d = w.e.entitiesOfKind({ kind: "office", viewer: "member:ann" });
  assert.deepEqual([d.count, d.limit, d.truncated], [100, 100, true]);
  /* one indexed read on kind */
  const plan = w.rows(`EXPLAIN QUERY PLAN SELECT entity_id FROM entities WHERE kind=? AND entity_id > ? ORDER BY entity_id`, "office", "")
    .map((r) => r.detail).join(" ");
  assert.match(plan, /entities_kind/);
});

test("R51 R40 entitieskind joins the ops map: it answers what entitiesOfKind answers, reading kind, limit, after and the viewer stamp from the query", () => {
  const w = registry();
  const url = (q) => new URL(`https://do.invalid/?${new URLSearchParams(q)}`);
  for (const q of [{ kind: "office", viewer: "member:ann" }, { kind: "office", limit: "1", after: w.clerk, viewer: MACHINE },
                   { kind: "office" }, { viewer: "member:ann" }, { kind: "nope", viewer: "member:ann" }, { kind: "office", viewer: "somebody" }]) {
    const got = entitiesOps(w.e, url(q), {}).entitieskind();
    const want = w.e.entitiesOfKind({ kind: q.kind ?? null, limit: q.limit ?? null, after: q.after ?? null, viewer: q.viewer ?? null });
    assert.deepEqual(got, want, JSON.stringify(q));
  }
  assert.equal(entitiesOps(w.e, url({ kind: "office" }), {}).entitieskind().reason, "VIEWER_MISSING");
});
