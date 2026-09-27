/* connections: connections asserted apart from derivation — a member's (R31), and an agenda item's derived membership in
   a file, served (R30) and stored (R49). The derivation itself is extraction's R52; the structure it runs over is a
   provider the test controls, answered through the real derivation. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, sha } from "./fixture.mjs";
import { membershipBeside } from "../../../src/extraction/filemembership.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";

test("R31: a member asserts a connection between two held documents with a basis — asserted_by member, grade D, apart from derived rows", () => {
  const w = world();
  w.member("alice"); w.member("bob");
  w.doc(A, ["a"]); w.doc(B, ["b"]);
  assert.equal(w.k.assert({ a: A, b: B, basis: "x", member: MACHINE, viewer: MACHINE }).reason, "CONNECTION_ASSERT_NOT_A_MEMBER");
  assert.equal(w.k.assert({ a: A, b: B, basis: "x", member: "", viewer: V("alice") }).reason, "CONNECTION_ASSERT_NOT_A_MEMBER");
  assert.equal(w.k.assert({ a: A, b: B, basis: "  ", member: "alice", viewer: V("alice") }).reason, "CONNECTION_ASSERT_NO_BASIS");
  assert.equal(w.k.assert({ a: A, b: B, basis: "x".repeat(4001), member: "alice", viewer: V("alice") }).reason, "CONNECTION_ASSERT_BASIS_TOO_LONG");
  assert.equal(w.k.assert({ a: A, b: "INFO-2026-0404-z", basis: "x", member: "alice", viewer: V("alice") }).reason, "NO_SUCH_BUNDLE");
  assert.equal(w.k.assert({ a: A, b: A, basis: "x", member: "alice", viewer: V("alice") }).reason, "CONNECTION_ASSERT_SELF");
  const r = w.k.assert({ a: B, b: A, basis: "the same contract, by its number", member: "alice", viewer: V("alice") });
  assert.equal(r.ok, true); assert.equal(r.wrote, true);
  assert.deepEqual([r.connection.a_bundle_id, r.connection.b_bundle_id], [A, B]);
  assert.equal(r.connection.grade, "D"); assert.equal(r.connection.asserted_by, "member"); assert.equal(r.connection.author, "alice");
  assert.equal(r.connection.established, false);
  assert.equal(w.k.assert({ a: A, b: B, basis: "again", member: "alice", viewer: V("alice") }).wrote, false);
  assert.equal(w.k.assert({ a: A, b: B, basis: "mine too", member: "bob", viewer: V("bob") }).wrote, true);
  assert.equal(w.k.asserted({ bundleId: A, viewer: V("alice") }).member.length, 2);
  /* Never rewritten by a derivation, and never read into derived rows. */
  w.entity("ENT-2026-0001");
  w.k.derive({ entityId: "ENT-2026-0001" });
  assert.equal(w.count("connections"), 0);
  assert.equal(w.row(`SELECT basis FROM asserted_connections WHERE author='alice'`).basis, "the same contract, by its number");
  /* A hidden end: refused as not held, and a row whose other end is hidden omitted. */
  w.st.sql.exec(`UPDATE bundles SET object_type='project' WHERE bundle_id=?`, B);
  assert.equal(w.k.asserted({ bundleId: A, viewer: V("bob") }).member.length, 0);
  assert.equal(w.k.assert({ a: A, b: B, basis: "x", member: "carl", viewer: V("bob") }).reason, "NO_SUCH_BUNDLE");
});

/* An agenda (one capture, fetched from its address) whose links are items and files of one stated system. */
const VIEW = { systems: [{ origin: "sys", hosts: ["agendas.example.org"],
                           links: { item: { re: "^/item/" }, file: { re: "^/file/" } } }] };
const at = (url, page, top) => ({ target: { url }, source: { page, rect: [0, top - 10, 100, top] } });
function agenda(w) {
  const [ag] = w.doc("INFO-2026-0010-agenda", ["the agenda"]);
  const structure = { ok: true, links: [
    at("https://agendas.example.org/file/0", 0, 900),          // above the first item: unplaced
    at("https://agendas.example.org/item/1", 0, 800),
    at("https://agendas.example.org/file/1", 0, 700),
    at("https://agendas.example.org/item/2", 0, 500),
    at("https://agendas.example.org/file/2", 1, 900),          // across the page break: item 2's
    { target: { url: "https://agendas.example.org/file/9" } }, // no page rect: unplaced
  ] };
  w.structures[ag] = { ...structure, ...membershipBeside(structure, VIEW) };
  return ag;
}
function hold(w, id, address) {
  const [c] = w.doc(id, [`bytes of ${id}`]);
  w.receipt(address, c);
  return c;
}

test("R30: the membership is served with its label, beside the links; a file above the first item or with no place is unplaced, never assigned", async () => {
  const w = world();
  const ag = agenda(w);
  const r = await w.k.storeFileMembership({ captureSha: ag, viewer: MACHINE });
  for (const [k, v] of Object.entries({ derived: "containment", work: "machine", asserted_by: "system", grade: "C",
                                         standing: "inferred", established: false })) assert.equal(r[k], v, k);
  assert.deepEqual(r.unplaced.map((u) => [u.url, u.why]).sort(),
    [["https://agendas.example.org/file/0", "above_the_first_item"], ["https://agendas.example.org/file/9", "no_page_rect"]]);
  const m = w.k.fileMembership({ captureSha: ag, viewer: MACHINE });
  assert.equal(m.stored.length, 0);
  assert.deepEqual(m.pending.map((p) => [p.item_address, p.file_address]),
    [["https://agendas.example.org/item/1", "https://agendas.example.org/file/1"],
     ["https://agendas.example.org/item/2", "https://agendas.example.org/file/2"]]);
  for (const p of m.pending) { assert.equal(p.derived, "containment"); assert.equal(p.established, false); assert.equal(p.stored, false); }
  assert.match(m.says, /never the publisher.s own link/);
  /* Shapes come from the profile: with none stated, nothing is derived and the reason is said. */
  const w2 = world();
  const [ag2] = w2.doc("INFO-2026-0010-agenda", ["the agenda"]);
  w2.structures[ag2] = { ok: true, links: [], ...membershipBeside({ links: [] }, { systems: [] }) };
  const none = await w2.k.storeFileMembership({ captureSha: ag2, viewer: MACHINE });
  assert.equal(none.membership, null); assert.equal(none.why, "no_active_profile_states_item_and_file_link_shapes");
  /* A capture the viewer cannot see answers as one not held. */
  assert.equal((await w.k.storeFileMembership({ captureSha: ag, viewer: null })).reason, "NO_SUCH_CAPTURE");
  assert.equal(w.k.fileMembership({ captureSha: ag, viewer: null }).reason, "NO_SUCH_CAPTURE");
});

test("R49: stored as a system connection graded C once both documents are held; re-derived when either is re-read; confirm and reject kept with who, when, why", async () => {
  const w = world();
  w.member("alice"); w.member("bob");
  const ag = agenda(w);
  hold(w, "INFO-2026-0011-item1", "https://agendas.example.org/item/1");
  hold(w, "INFO-2026-0012-file1", "https://agendas.example.org/file/1");
  const r = await w.k.storeFileMembership({ captureSha: ag, viewer: MACHINE });
  assert.equal(r.stored, 1); assert.equal(r.pending, 1);
  let m = w.k.fileMembership({ captureSha: ag, viewer: MACHINE });
  const c = m.stored[0];
  assert.equal(c.a_bundle_id, "INFO-2026-0011-item1"); assert.equal(c.b_bundle_id, "INFO-2026-0012-file1");
  assert.equal(c.kind, "containment"); assert.equal(c.grade, "C"); assert.equal(c.asserted_by, "system");
  assert.equal(c.established, false); assert.equal(c.standing, "inferred");
  assert.equal(w.count("connections"), 0, "apart from derived connections");
  /* item 2 and its file are fetched later; a reading of the file's capture re-derives the pending pair. */
  hold(w, "INFO-2026-0013-item2", "https://agendas.example.org/item/2");
  const f2 = hold(w, "INFO-2026-0014-file2", "https://agendas.example.org/file/2");
  const listener = w.readingListeners.find((l) => l.module === "connections");
  assert.deepEqual(listener.fn({ captureSha: f2 }), { membership_rederived: 1 });
  m = w.k.fileMembership({ captureSha: ag, viewer: MACHINE });
  assert.equal(m.stored.length, 2); assert.equal(m.pending.length, 0);
  /* A member confirms, another rejects: both kept, the latest standing; the grade does not move. */
  assert.equal(w.k.judgeFileMembership({ id: c.connection_id, verdict: "confirm", reason: "x", member: MACHINE, viewer: MACHINE }).reason,
               "FILE_MEMBERSHIP_NOT_A_MEMBER");
  assert.equal(w.k.judgeFileMembership({ id: c.connection_id, verdict: "maybe", reason: "x", member: "alice", viewer: V("alice") }).reason,
               "FILE_MEMBERSHIP_BAD_VERDICT");
  assert.equal(w.k.judgeFileMembership({ id: c.connection_id, verdict: "confirm", reason: "", member: "alice", viewer: V("alice") }).reason,
               "FILE_MEMBERSHIP_NO_REASON");
  assert.equal(w.k.judgeFileMembership({ id: 99999, verdict: "confirm", reason: "x", member: "alice", viewer: V("alice") }).reason,
               "FILE_MEMBERSHIP_NO_SUCH_CONNECTION");
  const ok = w.k.judgeFileMembership({ id: c.connection_id, verdict: "confirm", reason: "the item's own page lists it", member: "alice", viewer: V("alice") });
  assert.equal(ok.connection.standing, "confirmed");
  const no = w.k.judgeFileMembership({ id: c.connection_id, verdict: "reject", reason: "a different meeting's file", member: "bob", viewer: V("bob") });
  assert.equal(no.connection.standing, "rejected");
  assert.deepEqual(no.connection.judgements.map((j) => [j.verdict, j.judged_by, j.reason]),
    [["confirmed", "alice", "the item's own page lists it"], ["rejected", "bob", "a different meeting's file"]]);
  assert.ok(no.connection.judgements.every((j) => j.at));
  assert.equal(no.connection.grade, "C");
  assert.equal(w.k.asserted({ bundleId: "INFO-2026-0011-item1", viewer: V("alice") }).containment.length, 1);
  assert.ok(sha);
});
