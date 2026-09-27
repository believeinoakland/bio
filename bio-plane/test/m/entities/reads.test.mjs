/* entities' reverse reads at its interface: R14–R16, R32. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, MACHINE } from "./fixture.mjs";

function many(n) {
  const w = world();
  const ent = w.e.createEntity({ kind: "office", label: "Alpha" }).entity_id;
  const refs = Array.from({ length: n }, (_, i) => ({ kind: "r", key: String(i).padStart(4, "0"), label: "Alpha" }));
  w.read("INFO-1", sha("many"), refs);
  w.e.resolve({ captureSha: sha("many") });
  return { ...w, ent };
}

test("R14 resolutionsFor refuses NO_SHA; the capture's resolutions by reference then entity, every field, at most limit (default 500, max 5,000), truncated measured by reading one more", () => {
  const { e, ent } = many(7);
  assert.equal(e.resolutionsFor({}).reason, "NO_SHA");
  const all = e.resolutionsFor({ captureSha: sha("many"), viewer: MACHINE });
  assert.deepEqual([all.count, all.limit, all.truncated], [7, 500, false]);
  assert.deepEqual(all.resolutions.map((r) => r.ref), [...all.resolutions.map((r) => r.ref)].sort());
  assert.deepEqual(Object.keys(all.resolutions[0]).sort(), ["at", "basis", "bundle_id", "capture_sha", "entity_id", "established",
    "grade", "method", "needs_confirmation", "raised_from", "ref", "resolved_by", "withdrawn_name"].sort());
  assert.equal(all.resolutions[0].entity_id, ent);
  const cut = e.resolutionsFor({ captureSha: sha("many"), limit: 3, viewer: MACHINE });
  assert.deepEqual([cut.count, cut.limit, cut.truncated], [3, 3, true]);
  const exact = e.resolutionsFor({ captureSha: sha("many"), limit: 7, viewer: MACHINE });
  assert.deepEqual([exact.count, exact.truncated], [7, false], "a full page that is complete is not truncated");
  assert.equal(e.resolutionsFor({ captureSha: sha("many"), limit: 99999, viewer: MACHINE }).limit, 5000);
  assert.equal(e.resolutionsFor({ captureSha: sha("many"), limit: "junk", viewer: MACHINE }).limit, 500);
  /* a second entity on one reference orders by entity within the reference */
  const w = world();
  const b = w.e.createEntity({ kind: "office", label: "Same" }).entity_id;
  const a = w.e.createEntity({ kind: "body", label: "Same" }).entity_id;
  w.read("INFO-1", sha("two"), [{ kind: "z", key: "1", label: "Same" }]);
  w.e.resolve({ captureSha: sha("two") });
  assert.deepEqual(w.e.resolutionsFor({ captureSha: sha("two"), viewer: MACHINE }).resolutions.map((r) => r.entity_id), [b, a].sort());
});

test("R15 concerns refuses NO_ENTITY; one entry per capture carrying its strongest resolution, found and the entity, count, resolution_count, limit and truncated; an unregistered id answers found:false with what names it", () => {
  const { e, read, rows } = world();
  assert.equal(e.concerns({}).reason, "NO_ENTITY");
  const ent = e.createEntity({ kind: "office", label: "Alpha", aliases: ["a:1"] }).entity_id;
  read("INFO-1", sha("c1"), [{ kind: "a", key: "1", label: "x" }, { kind: "b", key: "2", label: "Alpha" }]);
  read("INFO-2", sha("c2"), [{ kind: "c", key: "3", label: "Alpha" }]);
  e.resolve({ captureSha: sha("c1") }); e.resolve({ captureSha: sha("c2") });
  const c = e.concerns({ entityId: ent, viewer: MACHINE });
  assert.deepEqual([c.found, c.entity.label, c.count, c.resolution_count, c.limit, c.truncated], [true, "Alpha", 2, 3, 500, false]);
  const d1 = c.documents.find((d) => d.capture_sha === sha("c1"));
  assert.deepEqual([d1.grade, d1.ref, d1.established, d1.bundle_id], ["A", "a:1", true, "INFO-1"]);
  const cut = e.concerns({ entityId: ent, limit: 1, viewer: MACHINE });
  assert.deepEqual([cut.resolution_count, cut.count, cut.truncated, cut.limit], [1, 1, true, 1]);
  rows(`DELETE FROM entities WHERE entity_id=?`, ent);
  const gone = e.concerns({ entityId: ent, viewer: MACHINE });
  assert.deepEqual([gone.found, gone.entity, gone.count], [false, null, 2]);
});

test("R16 strongestByCapture answers R15's collapse unbounded: capture → {capture_sha, bundle_id, grade}", () => {
  const { e, read } = world();
  const ent = e.createEntity({ kind: "office", label: "Alpha", aliases: ["a:1"] }).entity_id;
  read("INFO-1", sha("s1"), [{ kind: "a", key: "1", label: "x" }, { kind: "b", key: "2", label: "Alpha" }]);
  const refs = Array.from({ length: 12 }, (_, i) => ({ kind: "q", key: String(i), label: "Alpha" }));
  read("INFO-2", sha("s2"), refs);
  e.resolve({ captureSha: sha("s1") }); e.resolve({ captureSha: sha("s2") });
  const m = e.strongestByCapture(ent);
  assert.ok(m instanceof Map);
  assert.deepEqual(m.get(sha("s1")), { capture_sha: sha("s1"), bundle_id: "INFO-1", grade: "A" });
  assert.deepEqual(m.get(sha("s2")), { capture_sha: sha("s2"), bundle_id: "INFO-2", grade: "C" });
  assert.equal(m.size, 2);
  const c = e.concerns({ entityId: ent, viewer: MACHINE });
  for (const d of c.documents) assert.equal(m.get(d.capture_sha).grade, d.grade, "the same collapse as R15");
  assert.equal(e.strongestByCapture("ENT-2026-0404").size, 0);
});

test("R32 sight: R14 and R15 keep a hidden document's row and digest and withhold bundle_id, resolved_by and a testimony's testifier; an absent viewer sees nothing; a participant sees it whole", () => {
  const w = world();
  const { e } = w;
  const ent = e.createEntity({ kind: "person", label: "Pat" }).entity_id;
  w.project("PROJ-2026-0001-x", "insider");
  w.read("PROJ-2026-0001-x", sha("h"), [{ kind: "p", key: "1", label: "Pat" }, { kind: "p", key: "2", label: "other" }]);
  e.resolve({ captureSha: sha("h"), resolvedBy: "member:insider" });
  e.testify({ captureSha: sha("h"), ref: "p:2", entityId: ent, basis: "I know", resolvedBy: "member:insider" });
  for (const viewer of ["member:outsider", null, "nonsense"]) {
    const r = e.resolutionsFor({ captureSha: sha("h"), viewer });
    assert.equal(r.count, 2, "the rows stay");
    for (const x of r.resolutions) {
      assert.equal(x.capture_sha, sha("h"));
      assert.equal(x.bundle_id, null);
      assert.equal(x.resolved_by, null);
      assert.ok(!x.method.includes("insider"), x.method);
    }
    const d = r.resolutions.find((x) => x.grade === "D");
    assert.match(d.method, /withheld/);
    const c = e.concerns({ entityId: ent, viewer });
    assert.equal(c.count, 1);
    assert.equal(c.documents[0].bundle_id, null);
    assert.ok(!JSON.stringify(c).includes("insider"));
  }
  const seen = e.resolutionsFor({ captureSha: sha("h"), viewer: "member:insider" });
  for (const x of seen.resolutions) { assert.equal(x.bundle_id, "PROJ-2026-0001-x"); assert.equal(x.resolved_by, "member:insider"); }
  assert.match(seen.resolutions.find((x) => x.grade === "D").method, /member:insider/);
  assert.equal(e.resolutionsFor({ captureSha: sha("h"), viewer: MACHINE }).resolutions[0].bundle_id, "PROJ-2026-0001-x");
  /* R17's candidate is withheld whole (R18's arm is in naming.test.mjs) */
  assert.equal(e.namingDocuments({ entityId: ent, viewer: "member:outsider" }).count, 0);
  assert.equal(e.namingDocuments({ entityId: ent, viewer: "member:insider" }).count, 1);
});
