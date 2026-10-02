/* The factory (K61) with no providers given: `strengthOf(host)` reaches `inquiry` and `basis-versions` on the same host
   itself (N218), registers its pair with inquiry's grouping act (R17, N152), its cache projection with promotion (R13)
   and the cache's columns with retrieval (R23, N137). Driven over the real record-core, membership, promotion, retrieval
   and inquiry on a real SQLite database, at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { storage } from "./fixture.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { PROVENANCE_SCHEMA } from "../../../src/provenance/index.mjs";
import { inquiryOf } from "../../../src/inquiry/index.mjs";
import { basisVersionsOf } from "../../../src/basis-versions/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { retrievalOf } from "../../../src/retrieval/index.mjs";
import { strengthOf, STRENGTH_AXES, STRENGTH_CACHE_FIELDS } from "../../../src/strength/index.mjs";

const NOW = "2026-09-28T00:00:00.000Z";
const statements = (ddl) => ddl.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n")
  .split(";").map((t) => t.trim()).filter(Boolean);

/* A host holding the record, membership and inquiry's own tables, and nothing handed to strength. */
function bareHost() {
  const st = storage();
  const host = { storage: st };
  for (const t of statements(RECORD_SCHEMA)) st.db.exec(t);
  for (const t of statements(PROVENANCE_SCHEMA)) st.db.exec(t);
  /* the columns `bundles` held for inquiry before T18–T19 moved them to its `inquiry_bundle_facts` (its R36, R40): an
     older store's, which nothing here reads. */
  for (const c of ["inquiry_basis_count INTEGER", "inquiry_subject_entity TEXT", "inquiry_superseded_by TEXT"])
    st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c}`);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  membershipOf(host, { record }).migrate();
  inquiryOf(host).migrate();
  const bundle = (id, type) => st.sql.exec(
    `INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,created,last_updated,bundle_sha)
     VALUES (?,?,?,?,?,?,?,?)`, id, type, "g", id, "open", NOW, NOW, "x");
  const leg = (id, ord, target, type, extra = {}) => st.sql.exec(
    `INSERT INTO inquiry_basis (bundle_id,ord,target_id,target_type,role,grade,grade_axis,grade_source,ground)
     VALUES (?,?,?,?,?,?,?,?,?)`, id, ord, target, type, "supports", extra.grade ?? null, extra.axis ?? null,
    extra.source ?? null, extra.ground ?? null);
  return { host, st, bundle, leg };
}

test("R6, R1, R2 (N218): strengthOf(host) with no inquiry given reads inquiry's own basis and answers, never throws", () => {
  const h = bareHost();
  h.bundle("INQ-2026-0001-a", "inquiry");
  h.bundle("INQ-2026-0002-a", "inquiry");
  h.leg("INQ-2026-0001-a", 0, "INQ-2026-0002-a", "inquiry");
  h.leg("INQ-2026-0002-a", 0, "INQ-2026-0001-a", "inquiry");
  const s = strengthOf(h.host);
  const r = s.inquiryStrength({ id: "INQ-2026-0001-a", viewer: "class:member" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  for (const axis of STRENGTH_AXES) {
    assert.equal(r[axis].state, "undetermined", "the cycle in inquiry's own table is walked to the depth bound");
    assert.match(r[axis].detail, /depth bound of 6/);
  }
  h.bundle("INQ-2026-0003-a", "inquiry");
  const empty = s.strengthOf("INQ-2026-0003-a");
  assert.equal(empty.ok, true);
  for (const axis of STRENGTH_AXES) assert.match(empty[axis].detail, /rests on nothing/);
});

test("R8 (N218): with no versions given, a project's CURRENT is basis-versions' own, read on the same host", () => {
  const h = bareHost();
  h.bundle("INQ-2026-0001-a", "inquiry");
  h.bundle("PROJ-2026-0001-abc", "project");
  basisVersionsOf(h.host).migrate();
  h.st.sql.exec(`INSERT INTO files (bundle_id,path,content,sha256,bytes) VALUES (?,?,?,?,?)`, "PROJ-2026-0001-abc",
    "bundle.md", "---\ncurrent_versions:\n  - inquiry: INQ-2026-0001-a\n    version: main\n---\n", "x", 1);
  const s = strengthOf(h.host);
  const r = s.versionStrength({ id: "INQ-2026-0001-a", project: "PROJ-2026-0001-abc", viewer: "class:member" });
  assert.equal(r.reason, "VERSION_STRENGTH_NO_SUCH_VERSION", JSON.stringify(r).slice(0, 300));
  assert.equal(r.version, "main", "the reading the project stands on, from basis-versions' currentOf");
  assert.match(r.detail, /pointer has outlived the reading/);
});

test("R17 (N152): strength registers its pair with inquiry's grouping act itself, once, when its factory first builds", () => {
  const h = bareHost();
  h.bundle("INQ-2026-0001-a", "inquiry");
  h.leg("INQ-2026-0001-a", 0, "INQ-2026-0002-a", "inquiry");
  h.bundle("INQ-2026-0002-a", "inquiry");
  const s = strengthOf(h.host);
  assert.equal(strengthOf(h.host), s, "one instance per host");
  const again = inquiryOf(h.host).onGrounded("someone-else", () => null);
  assert.equal(again.reason, "LISTENER_DECLARED");
  assert.equal(again.module, "strength", "the slot is held by strength, registered at its build");
  assert.equal(s.registerGrounded().reason, "LISTENER_DECLARED", "a second registration is refused, never doubled");
});

test("R17, R5: the registered answer is strengthOf's three axes and its hunches left out, so the grouping act's before and after are R1–R5's", () => {
  const seen = [];
  const inquiry = {
    basisFor: () => ({ legs: [{ ord: 0, target_id: "INFO-2026-0001-a", target_type: "information", role: "supports",
                                grade: "B", grade_axis: "connection", grade_source: "resolution", ground: null }] }),
    earned: () => ({ earned: { capture: {}, connection: {}, testimony: {} } }),
    legCapped: () => null,
    subjectEntityOf: () => null,
    onGrounded: (module, fn) => { seen.push({ module, fn }); return { ok: true, module }; },
  };
  const h = bareHost();
  const s = strengthOf(h.host, { inquiry });
  assert.equal(seen.length, 1);
  assert.equal(seen[0].module, "strength");
  const pair = seen[0].fn("INQ-2026-0001-a");
  const direct = s.strengthOf("INQ-2026-0001-a");
  assert.deepEqual(Object.keys(pair).sort(), [...STRENGTH_AXES, "hunches_left_out"].sort());
  for (const axis of STRENGTH_AXES) assert.deepEqual(pair[axis], direct[axis]);
  assert.equal(pair.hunches_left_out, direct.hunches_left_out);
  assert.equal(pair.hunches_left_out, 0);
  assert.equal(pair.connection.grade, "B");
});

test("R13, R23 (N137): promotion holds strength's projection from its build; retrieval holds the cache's fields from the first call that hands it in, once", () => {
  const h = bareHost();
  const s = strengthOf(h.host);
  const again = promotionOf(h.host).registerStep("strength", { project: () => null });
  assert.equal(again.reason, "STEP_DECLARED", "strength's projection is registered, and a second is refused");
  /* The store hands its retrieval in at boot, after whatever built strength first (K61). */
  const retrieval = retrievalOf(h.host);
  assert.equal(strengthOf(h.host, { retrieval }), s, "one instance per host");
  for (const field of Object.keys(STRENGTH_CACHE_FIELDS)) {
    const other = retrieval.registerField("inquiry", field, { table: "t", key: "bundle_id", col: "c" });
    assert.deepEqual([other.reason, other.declaredBy], ["FIELD_DECLARED", "strength"], field);
  }
  assert.equal(strengthOf(h.host, { retrieval }), s);
  assert.equal(s.joinRetrieval(retrieval), null, "registered once, never twice");
  /* The table the relation names exists and is the cache's. */
  assert.deepEqual(h.st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='strength_cache'`), [{ name: "strength_cache" }]);
  /* A host whose strength is never handed a retrieval registers nothing there. */
  const b = bareHost();
  strengthOf(b.host);
  assert.equal(retrievalOf(b.host).registerField("inquiry", "capture", { table: "t", key: "bundle_id", col: "c" }).ok, true);
});
