/* retrieval-browse: the table and the scopes (R12, R13; T51-29; DEC-330 A14, A15; N1212), at the module's interface: browse's
 * items carry their state, its answer the whole set's count and how many await review, `awaiting_review` is a fourth
 * filter, and `scopeMembers` answers the ids each of the closed list of scopes holds. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { BROWSE_KINDS, BROWSE_ONLY, BROWSE_SCOPES, BROWSE_MARKS_MAX } from "../../../src/retrieval-browse/index.mjs";
import { STATES } from "../../../src/record-grammar/index.mjs";
import { entitiesOf } from "../../../src/entities/index.mjs";

const T = (d) => `2026-10-${String(d).padStart(2, "0")}T00:00:00Z`;
const browse = (w, args, viewer = V("vera")) => w.rb.browse({ viewer, ...args });
const tableCounts = (w) => w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '%fts%' ORDER BY name`)
  .map((t) => [t.name, w.count(t.name)]);

/* Three collected documents (Oct 1-3), one verified (Oct 4), a question (Oct 5) and a person (Oct 6), all visible to vera, and
   one more collected document in a project only ann sees (Oct 9). */
function corpus() {
  let ents = null;
  const w = world({ before: (x) => { ents = entitiesOf(x.host, { record: x.record, membership: x.membership }); } });
  w.entities = ents;
  if (typeof ents.migrate === "function") ents.migrate();
  for (const [i, id] of ["INFO-1", "INFO-2", "INFO-3"].entries()) w.doc(id, { title: `Collected ${id}`, last_updated: T(i + 1) });
  w.doc("INFO-V", { title: "Verified", current_state: "verified", prior_state: "collected", last_updated: T(4) });
  w.doc("INQ-Q", { object_type: "inquiry", title: "Who pays?", current_state: "open", last_updated: T(5) });
  const p = w.entities.createEntity({ kind: "person", label: "Jane Roe", note: "n", declaredBy: "member:ann" });
  w.st.sql.exec(`UPDATE entities SET at = ? WHERE entity_id = ?`, T(6), p.entity_id);
  w.person = p.entity_id;
  const proj = w.project("Ann's secret", "ann");
  w.doc("INFO-HIDE", { project: proj, title: "Filed in the secret project", last_updated: T(9) }, { author: V("ann") });
  return w;
}
function marks({ watches = {}, flags = [] } = {}) {
  return (a) => {
    if (a.ids) return { watched: a.ids.filter((id) => (watches[a.viewer] || []).includes(id)), flagged: flags.filter((f) => a.ids.includes(f.id)) };
    return a.only === "watched" ? { items: [...(watches[a.viewer] || [])], truncated: false } : { items: [...flags], truncated: false };
  };
}

test("R12 (DEC-330 A14): each item carries its state, the bundle's current_state as stored, null for a person; the answer carries total, the whole set matching kinds, only and since, and awaiting_review, the documents in state collected among them — three collected documents, one verified, a question and a person, one more collected document hidden: total 6 and awaiting_review 3", () => {
  const w = corpus();
  assert.ok(STATES.information.legal.includes("collected") && STATES.information.legal.includes("verified"), "collected and verified are information's states");
  const ans = browse(w, {});
  assert.deepEqual([ans.ok, ans.count, ans.total, ans.awaiting_review], [true, 6, 6, 3]);
  assert.deepEqual(ans.items.map((i) => [i.id, i.state]), [[w.person, null], ["INQ-Q", "open"], ["INFO-V", "verified"],
    ["INFO-3", "collected"], ["INFO-2", "collected"], ["INFO-1", "collected"]]);
  /* The count is the whole set's: limit and the page do not move it. */
  const p1 = browse(w, { limit: 2 });
  assert.deepEqual([p1.items.length, p1.truncated, p1.total, p1.awaiting_review], [2, true, 6, 3]);
  const p2 = browse(w, { limit: 2, after: p1.next });
  assert.deepEqual([p2.items.length, p2.total, p2.awaiting_review], [2, 6, 3], "a later page counts the same set");
  assert.deepEqual(p2.items.map((i) => [i.id, i.state]), [["INFO-V", "verified"], ["INFO-3", "collected"]]);
  /* kinds narrows the set it counts. */
  const q = browse(w, { kinds: ["question"] });
  assert.deepEqual([q.total, q.awaiting_review], [1, 0]);
  assert.deepEqual([browse(w, { kinds: ["document"] }).total, browse(w, { kinds: ["document"] }).awaiting_review], [4, 3]);
  assert.deepEqual([browse(w, { kinds: ["entity"] }).total, browse(w, { kinds: ["entity"] }).awaiting_review], [1, 0]);
  /* only and since narrow it too: what changed after Oct 3 is the verified document, the question and the person. */
  const fresh = browse(w, { only: "new_since", since: T(3) });
  assert.deepEqual([fresh.total, fresh.awaiting_review, fresh.items.map((i) => i.id)], [3, 0, [w.person, "INQ-Q", "INFO-V"]]);
  /* Control: the hidden collected document moves neither number, for the participant it is counted, and browsing twice moves nothing. */
  const mine = browse(w, {}, V("ann"));
  assert.deepEqual([mine.total, mine.awaiting_review], [7, 4], "ann sees the document filed in her project");
  const before = tableCounts(w);
  assert.deepEqual(browse(w, {}), browse(w, {}));
  assert.deepEqual(tableCounts(w), before);
  const none = w.rb.browse({ viewer: "garbage" });
  assert.deepEqual([none.total, none.awaiting_review, none.items], [0, 0, []], "an unrecognised viewer sees, and counts, nothing");
});

test("R13 (DEC-330 A15): only has a fourth value, awaiting_review — the items R12 counts, ONLY_UNKNOWN names the four — and its total is its count; it holds documents only, whatever kinds are asked", () => {
  const w = corpus();
  assert.deepEqual(BROWSE_ONLY, ["new_since", "watched", "flagged", "awaiting_review"]);
  const ans = browse(w, { only: "awaiting_review" });
  assert.deepEqual([ans.ok, ans.only, ans.items.map((i) => i.id), ans.total, ans.awaiting_review], [true, "awaiting_review", ["INFO-3", "INFO-2", "INFO-1"], 3, 3]);
  assert.ok(ans.items.every((i) => i.kind === "document" && i.state === "collected"));
  assert.equal(browse(w, { only: "awaiting_review", kinds: ["question"] }).total, 0, "a question is never awaiting review");
  assert.equal(browse(w, { only: "awaiting_review", kinds: ["entity", "document"] }).total, 3);
  assert.equal(browse(w, { only: "nope" }).reason, "ONLY_UNKNOWN");
  assert.deepEqual(browse(w, { only: "nope" }).only, BROWSE_ONLY);
  const page = browse(w, { only: "awaiting_review", limit: 1 });
  assert.deepEqual([page.count, page.total, page.truncated], [1, 3, true]);
  /* Control: the hidden collected document is not awaiting review to a viewer who may not see it. */
  assert.deepEqual(browse(w, { only: "awaiting_review" }, V("ann")).items.map((i) => i.id), ["INFO-HIDE", "INFO-3", "INFO-2", "INFO-1"]);
  assert.ok(!browse(w, { only: "awaiting_review" }).items.some((i) => i.id === "INFO-HIDE"));
});

test("R13 (DEC-330 A15): BROWSE_SCOPES is the closed list of scopes — everything, question, document, action, awaiting_review, watched and flagged, each {key, kinds, only}, none named in English — and scopeMembers answers, for each key, the ids R10 lists for the same kinds and only, entities counted apart", () => {
  const w = corpus();
  assert.deepEqual(BROWSE_SCOPES.map((s) => s.key), ["everything", "question", "document", "action", "awaiting_review", "watched", "flagged"]);
  assert.deepEqual(BROWSE_SCOPES.map((s) => Object.keys(s)), BROWSE_SCOPES.map(() => ["key", "kinds", "only"]));
  assert.deepEqual(BROWSE_SCOPES.find((s) => s.key === "everything").kinds, BROWSE_KINDS);
  assert.ok(BROWSE_SCOPES.every((s) => /^[a-z_]+$/.test(s.key)), "a key, never a sentence");
  assert.ok(Object.isFrozen(BROWSE_SCOPES) && BROWSE_SCOPES.every((s) => Object.isFrozen(s)));
  assert.equal(w.rb.registerBrowseMarks("following", marks({
    watches: { [V("vera")]: ["INFO-2", w.person], [V("ann")]: ["INFO-1"] }, flags: [{ id: "INQ-Q", by: V("ann"), at: T(8), note: "n" }] })).ok, true);
  for (const s of BROWSE_SCOPES) {
    const got = w.rb.scopeMembers({ scope: s.key, viewer: V("vera") });
    const listed = browse(w, { kinds: s.kinds, only: s.only, limit: 200 });
    const bundles = listed.items.filter((i) => i.kind !== "person" && i.kind !== "organization");
    assert.deepEqual([got.ok, got.scope, got.ids, got.count, got.truncated, got.entities_in_scope],
      [true, s.key, bundles.map((i) => i.id), bundles.length, false, listed.items.length - bundles.length], s.key);
  }
  assert.deepEqual(w.rb.scopeMembers({ scope: "everything", viewer: V("vera") }).ids, ["INQ-Q", "INFO-V", "INFO-3", "INFO-2", "INFO-1"]);
  assert.equal(w.rb.scopeMembers({ scope: "everything", viewer: V("vera") }).entities_in_scope, 1, "the person is counted, not listed");
  assert.deepEqual(w.rb.scopeMembers({ scope: "awaiting_review", viewer: V("vera") }).ids, ["INFO-3", "INFO-2", "INFO-1"]);
  assert.deepEqual(w.rb.scopeMembers({ scope: "watched", viewer: V("vera") }).ids, ["INFO-2"], "the viewer's own watches, never another member's INFO-1");
  assert.deepEqual(w.rb.scopeMembers({ scope: "flagged", viewer: V("vera") }).ids, ["INQ-Q"]);
  /* A limit bounds the ids with truncated; the bound is 5,000. */
  const cut = w.rb.scopeMembers({ scope: "everything", viewer: V("vera"), limit: 2 });
  assert.deepEqual([cut.ids.length, cut.count, cut.truncated], [2, 2, true]);
  assert.equal(BROWSE_MARKS_MAX, 5000);
  assert.equal(w.rb.scopeMembers({ scope: "document", viewer: V("vera"), limit: 10 ** 9 }).truncated, false);
  /* The refusals: no viewer, an unknown key (naming the list), and a scope for cases, which are not bundles here. */
  assert.equal(w.rb.scopeMembers({ scope: "everything" }).reason, "VIEWER_MISSING");
  const bad = w.rb.scopeMembers({ scope: "cases", viewer: V("vera") });
  assert.deepEqual([bad.ok, bad.reason, bad.scopes], [false, "SCOPE_KEY_UNKNOWN", BROWSE_SCOPES.map((s) => s.key)]);
  assert.equal(w.rb.scopeMembers({ viewer: V("vera") }).reason, "SCOPE_KEY_UNKNOWN");
});

test("R13, R15, R16 (DEC-330 A15): a scope over a hidden bundle lists no such id for a viewer who may not see it, an unrecognised viewer holds nothing, a marks read that cannot be read says undetermined and lists nothing unfiltered, and reading a scope writes nothing", () => {
  const w = corpus();
  const before = JSON.stringify(tableCounts(w));
  assert.ok(!w.rb.scopeMembers({ scope: "document", viewer: V("vera") }).ids.includes("INFO-HIDE"));
  assert.ok(!w.rb.scopeMembers({ scope: "awaiting_review", viewer: V("vera") }).ids.includes("INFO-HIDE"));
  assert.deepEqual(w.rb.scopeMembers({ scope: "awaiting_review", viewer: V("ann") }).ids, ["INFO-HIDE", "INFO-3", "INFO-2", "INFO-1"]);
  const stranger = w.rb.scopeMembers({ scope: "everything", viewer: "garbage" });
  assert.deepEqual([stranger.ok, stranger.ids, stranger.count, stranger.entities_in_scope], [true, [], 0, 0]);
  /* No module registered the marks: watched and flagged hold nothing, and say why. */
  for (const key of ["watched", "flagged"]) {
    const none = w.rb.scopeMembers({ scope: key, viewer: V("vera") });
    assert.deepEqual([none.ok, none.ids, none.count, typeof none.undetermined.why], [true, [], 0, "string"], key);
  }
  /* A flag on a hidden bundle lists nothing to a viewer who may not see it. */
  w.rb.registerBrowseMarks("following", marks({ flags: [{ id: "INFO-HIDE", by: V("ann"), at: T(8), note: "n" }] }));
  assert.deepEqual(w.rb.scopeMembers({ scope: "flagged", viewer: V("vera") }).ids, []);
  assert.deepEqual(w.rb.scopeMembers({ scope: "flagged", viewer: V("ann") }).ids, ["INFO-HIDE"]);
  assert.equal(JSON.stringify(tableCounts(w)), before, "a scope read writes nothing");
});
