/* basis-versions: its share of a promotion — the check (R6) and the projection (R7) — the freeze (R29), its tables'
   purge declaration (R34) and their read contract (R38). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, inqMd, V } from "./fixture.mjs";
import { BASIS_VERSIONS_TABLES } from "../../../src/basis-versions/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r";

function setup() {
  const w = world();
  w.doc(DOC); w.doc(DOC2);
  return w;
}

test("R6: for an inquiry that is not a replay, the grammar refuses BASIS_VERSION_REFUSED with each finding's code and translation; an unheld leg target is VERSION_LEG_UNRESOLVED; content's citation refusals run over the version legs", () => {
  const w = setup();
  const bad = w.inquiry(Q, block(version("first", [DOC], { relationship: "xor" })));
  assert.equal(bad.reason, "BASIS_VERSION_REFUSED");
  assert.deepEqual(bad.findings.map((f) => [f.check, f.code, typeof f.translation]), [["C-25.3", "VERSION_NO_RELATIONSHIP", "string"]]);
  const kind = w.inquiry(Q, block(version("first", [DOC], { kind: "hunch" })));
  assert.deepEqual(kind.findings.map((f) => [f.check, f.code]), [["C-27.15", "VERSION_KIND_UNKNOWN"]]);
  assert.ok(kind.findings[0].translation, "C-27's registry translates it");
  const unheld = w.inquiry(Q, block(version("first", ["INFO-2026-0099-z"])));
  assert.deepEqual([unheld.reason, unheld.version, unheld.target, unheld.findings[0].check, unheld.findings[0].code],
                   ["VERSION_LEG_UNRESOLVED", "first", "INFO-2026-0099-z", "C-25.16", "VERSION_LEG_UNRESOLVED"]);
  assert.ok(unheld.findings[0].translation && unheld.findings[0].repairs.length === 2);
  const named = block(version("first", [DOC]));
  named.push(...[]);
  const cid = w.inquiry(Q, block(merge(version("first", []), { legs: [{ version: "first", target: DOC, role: "supports", ground: "main",
    content_id: "f".repeat(64) }], grounds: [{ version: "first", ground: "main", asserted_by: "member:alice", at: "2026-09-27T00:00:00Z" }] })));
  assert.equal(cid.reason, "BASIS_VERSION_REFUSED");
  assert.equal(cid.findings[0].code, "CONTENT_ROW_UNKNOWN", "content R27 over the version legs (C-45.5)");
  assert.equal(w.record.head(Q), null, "a refused promotion wrote nothing");
  /* a replay is not judged by the grammar */
  const r = w.promotion.promote({ bundleId: Q, base: null, snapKey: "replay-1", author: V("alice"), replay: true,
    files: [{ path: "bundle.md", text: inqMd(Q, block(version("first", [DOC], { relationship: "xor" }))) }], meta: { object_type: "inquiry" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 200));
});

test("R6, R29: a held version whose composition a promotion changes is VERSION_FROZEN naming what changed and the repair; a new version derived from it lands", () => {
  const w = setup();
  assert.equal(w.inquiry(Q, block(version("first", [DOC]))).ok, true);
  const edited = w.revise(Q, inqMd(Q, block(version("first", [DOC], { description: "the reading, reworded in place" }))));
  assert.deepEqual([edited.ok, edited.reason, edited.version, edited.changed], [false, "VERSION_FROZEN", "first", "description changed"]);
  assert.equal(edited.findings[0].check, "C-25.11");
  assert.match(edited.findings[0].repairs[0], /derived_from: 'first'/);
  const legAdded = w.revise(Q, inqMd(Q, block(version("first", [DOC, DOC2]))));
  assert.equal(legAdded.reason, "VERSION_FROZEN");
  assert.equal(legAdded.changed, "a leg was added");
  /* a move of state, hidden or attribution is not an edit */
  const moved = w.revise(Q, inqMd(Q, block(version("first", [DOC], { state: "accepted", hidden: true, state_by: "member:bo",
    state_at: "2026-09-28T00:00:00Z", state_reason: "" }))));
  assert.equal(moved.ok, true, JSON.stringify(moved).slice(0, 300));
  const derived = w.revise(Q, inqMd(Q, block(merge(version("first", [DOC], { state: "accepted", hidden: true, state_by: "member:bo",
    state_at: "2026-09-28T00:00:00Z", state_reason: "" }), version("second", [DOC, DOC2], { derived_from: "first" })))));
  assert.equal(derived.ok, true, JSON.stringify(derived).slice(0, 300));
  const held = w.row(`SELECT composition FROM inquiry_basis_versions WHERE bundle_id=? AND name='first'`, Q).composition;
  assert.ok(!held.includes(DOC2), "the old version is exactly as it was");
});

test("R7: both tables are re-derived whole from the document on every promotion; each leg's content row is the one it names or content's resolution; the answer lists version_content", () => {
  const w = setup();
  assert.equal(w.inquiry(Q2, block({})).ok, true);
  const r = w.inquiry(Q, block(merge(version("first", [DOC, Q2]), version("second", [DOC2]))));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const rows = w.rows(`SELECT name, ord, target_id, target_type, role, ground, content_id FROM inquiry_basis_version_legs WHERE bundle_id=? ORDER BY name, ord`, Q);
  assert.deepEqual(rows.map((x) => [x.name, x.ord, x.target_id, x.target_type, x.ground]),
    [["first", 0, DOC, "information", "main"], ["first", 1, Q2, "inquiry", "main"], ["second", 0, DOC2, "information", "main"]]);
  assert.equal(rows[1].content_id, null, "a leg on an inquiry has no part");
  const minted = w.content.contentRow(rows[0].content_id);
  assert.deepEqual([minted.bundle_id, minted.extent_kind], [DOC, "document"], "the document extent's row, content's resolution");
  assert.deepEqual(r.version_content, rows.map((x) => ({ version: x.name, ord: x.ord, target: x.target_id, content_id: x.content_id })),
    "read back out of the table");
  /* a leg naming its row outright is taken at its word */
  const again = w.revise(Q, inqMd(Q, block(merge(version("first", [DOC, Q2]), version("second", [DOC2]),
    { versions: [{ name: "third", description: "names its part outright", relationship: "and", state: "suggested", hidden: false }],
      grounds: [{ version: "third", ground: "main", asserted_by: "member:alice", at: "2026-09-27T00:00:00Z" }],
      legs: [{ version: "third", target: DOC, role: "supports", ground: "main", content_id: rows[0].content_id }] }))));
  assert.equal(again.ok, true, JSON.stringify(again).slice(0, 300));
  assert.equal(w.row(`SELECT content_id FROM inquiry_basis_version_legs WHERE bundle_id=? AND name='third'`, Q).content_id, rows[0].content_id);
  assert.equal(w.count("inquiry_basis_versions"), 3);
  /* whole: a revision dropping a version drops its rows */
  const dropped = w.revise(Q, inqMd(Q, block(version("first", [DOC, Q2]))));
  assert.equal(dropped.ok, true);
  assert.deepEqual(w.rows(`SELECT DISTINCT name FROM inquiry_basis_version_legs WHERE bundle_id=?`, Q).map((x) => x.name), ["first"]);
  /* a promotion with no version legs adds no key */
  const plain = w.revise(Q2, inqMd(Q2, block({})));
  assert.equal(plain.ok, true);
  assert.equal("version_content" in plain, false);
});

test("R34: both tables carry bundle_id and are declared to record-core's purge, which clears them whole and per bundle", () => {
  const w = setup();
  w.inquiry(Q, block(version("first", [DOC])));
  w.inquiry(Q2, block(version("first", [DOC2])));
  assert.deepEqual([...BASIS_VERSIONS_TABLES].sort(), ["inquiry_basis_version_legs", "inquiry_basis_versions"]);
  const one = w.record.purge({ bundleId: Q });
  assert.deepEqual([one.removed.inquiry_basis_versions, one.removed.inquiry_basis_version_legs], [1, 1]);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM inquiry_basis_versions WHERE bundle_id=?`, Q2).n, 1);
  w.record.purge({});
  assert.deepEqual([w.count("inquiry_basis_versions"), w.count("inquiry_basis_version_legs")], [0, 0]);
});

test("R38: the two tables' contracted columns exist with their stated meaning", () => {
  const w = setup();
  w.inquiry(Q, block(version("first", [DOC], { claim: "it happened", run: "RUN-1", kind: "basis-version" })));
  const v = w.row(`SELECT bundle_id, name, ord, state, hidden, claim, relationship, derived_from, run, kind, composition, leg_count
                     FROM inquiry_basis_versions`);
  assert.deepEqual({ ...v, composition: typeof v.composition }, { bundle_id: Q, name: "first", ord: 0, state: "suggested", hidden: 0,
    claim: "it happened", relationship: "and", derived_from: null, run: "RUN-1", kind: "basis-version", composition: "string", leg_count: 1 });
  const l = w.row(`SELECT bundle_id, name, ord, target_id, target_type, role, grade, grade_axis, grade_source, ground, content_id
                     FROM inquiry_basis_version_legs`);
  assert.deepEqual({ ...l, content_id: typeof l.content_id }, { bundle_id: Q, name: "first", ord: 0, target_id: DOC,
    target_type: "information", role: "supports", grade: null, grade_axis: null, grade_source: null, ground: "main", content_id: "string" });
});
