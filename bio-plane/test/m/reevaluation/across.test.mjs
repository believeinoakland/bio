/* reevaluation: R14's notice across addresses (R36; X73, K1446): a reference pinned to a held standard's portion is
   told of a newer version of the same work and portion that the real `standards` holds at another address (the same
   instrument key), or at the address a member-recorded recodification names (its `addressesOf`, R24), the standards read
   through its `standardsWithPortion` and `standardsAt` (R32; N590), never by paging `standardsIn`; graded by content's
   comparison of the two captures (`passageAcross`, its R55; N589), and UNDETERMINED by name (R21) where content gives no
   answer or a capture's text is not held; closed as R15 closes any notice, `adoptVersion` re-pinning the leg to the
   passage at the new address. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, realUpstreams, V, U } from "./fixture.mjs";
import { ACROSS_UNDETERMINED_WHY } from "../../../src/reevaluation/index.mjs";

const Q = "INQ-2026-0001-q";
const KEY100 = "/eli/xx-port-ellery/selectboard/100", KEY101 = "/eli/xx-port-ellery/selectboard/101";

function lawWorld() {
  const w = world({ upstreams: realUpstreams });
  w.member("alice"); w.member("bob");
  const s = w.up.standards;
  /** A standard declared over a fresh document whose one capture is retrieved from `address` at `retrieved`, its portion
   *  `path` the whole document's passage. */
  const law = (id, cite, path, address, retrieved, text = `the text of ${id}`) => {
    const [cap] = w.doc(id, [w.cap(id, text)]);
    w.at(cap.sha, address, retrieved);
    const m = w.content.mint({ bundleId: id, captureSha: cap.sha, extent: { kind: "document" }, mintedBy: V("bob") });
    const r = s.standardDeclare({ cite, kind: "ordinance", issuer: "Port Ellery Selectboard", reason: "The group holds the selectboard to it.",
      text: [m.content_id], period: { from: "2020-01-01", to: "2030-12-31" }, portion: { path, content_id: m.content_id },
      author: V("bob"), viewer: V("bob") });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    return { id: r.id, doc: id, cid: m.content_id, cap: cap.sha, key: r.instrument.key };
  };
  const relate = (type, from, to) => {
    const r = s.lawRelate({ type, from: from.id, to: to.id, citation: from.cid, effective: "2026-01-01",
                            reason: "The council moved the section.", author: V("bob"), viewer: V("bob") });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    return r.relation.id;
  };
  return { w, s, law, relate };
}

test("R36 R14 R21: a reference pinned to a held standard's portion raises one notice per newer version held at another address, under the same instrument key or at a recodification's address; with neither capture's text held, each graded UNDETERMINED by name with content's reason, never A or B", () => {
  const { w, law, relate } = lawWorld();
  const a = law("INFO-2026-0001-a", "PEBL § 100", "100(a)", "codes.example/a", "2026-09-27T01:00:00Z");
  const b = law("INFO-2026-0002-b", "PEBL § 100", "100(a)", "codes.example/b", "2026-09-28T01:00:00Z");
  const c = law("INFO-2026-0003-c", "PEBL § 101", "101(a)", "codes.example/c", "2026-09-29T01:00:00Z");
  assert.deepEqual([a.key, b.key, c.key], [KEY100, KEY100, KEY101]);
  const rel = relate("recodifies", c, a);
  w.inquiry(Q, { legs: [{ target: a.doc, content_id: a.cid }] });
  const told = [];
  w.r.onBasisChanged("listener", (x) => told.push(x));
  const r = w.r.raiseNotices({});
  assert.equal(r.ok, true);
  const byCap = Object.fromEntries(r.raised.map((x) => [x.newer_capture, x]));
  assert.deepEqual(Object.keys(byCap).sort(), [b.cap, c.cap].sort());
  for (const x of r.raised) {
    assert.deepEqual([x.holder, x.ord, x.content_id, x.capture_sha, x.grade, x.affects], [Q, 0, a.cid, a.cap, "UNDETERMINED", "undetermined"]);
    assert.equal(x.across.from_standard, a.id);
    /* content compared the two captures (R55) and could not grade them: its reason and why are kept, by name */
    assert.deepEqual([x.across.compared, typeof x.across.reason, typeof x.across.why], [true, "string", "string"]);
  }
  assert.deepEqual([byCap[b.cap].newer_content, byCap[b.cap].across.standard, byCap[b.cap].across.key, byCap[b.cap].across.via.type],
                   [b.cid, b.id, KEY100, "same_instrument"]);
  assert.deepEqual([byCap[c.cap].newer_content, byCap[c.cap].across.key, byCap[c.cap].across.portion, byCap[c.cap].across.via.type,
                    byCap[c.cap].across.via.relation], [c.cid, KEY101, "101(a)", "recodifies", rel]);
  /* R8: each told as a passage notice naming what links the two addresses */
  const passage = told.filter((t) => t.kind === "passage");
  assert.equal(passage.length, 2);
  assert.ok(passage.every((t) => t.across && t.affects === "undetermined" && /another address/.test(t.detail)));
  /* raised once: a second pass raises nothing */
  assert.equal(w.r.raiseNotices({}).count, 0);
  /* the notice as listed carries the passage at the new address and the link */
  const listed = w.r.notices({ viewer: V("alice") }).notices;
  assert.deepEqual(listed.map((n) => n.newer_content).sort(), [b.cid, c.cid].sort());
  assert.ok(listed.every((n) => n.across && n.across.from_standard === a.id));
});

test("R36: an address is never matched by text: a provision held under another key with no recorded relation (its words alike), a version at an address the pinned capture is also held at (R14's own, along that chain), one retrieved no later, and a relation that is withdrawn raise nothing", () => {
  const { w, s, law, relate } = lawWorld();
  const a = law("INFO-2026-0001-a", "PEBL § 100", "100(a)", "codes.example/a", "2026-09-27T01:00:00Z", "Section 100. The same words.");
  law("INFO-2026-0002-b", "PEBL § 102", "102(a)", "codes.example/b", "2026-09-28T01:00:00Z", "Section 100. The same words. ");
  const same = law("INFO-2026-0003-c", "PEBL § 100", "100(a)", "codes.example/c", "2026-09-28T01:00:00Z");
  w.at(same.cap, "codes.example/a", "2026-09-28T01:00:00Z");
  law("INFO-2026-0004-d", "PEBL § 100", "100(a)", "codes.example/d", "2026-09-26T01:00:00Z");
  const e = law("INFO-2026-0005-e", "PEBL § 103", "103(a)", "codes.example/e", "2026-09-29T01:00:00Z");
  const rel = relate("recodifies", e, a);
  assert.equal(s.lawWithdraw({ relation: rel, reason: "It was a different section.", author: V("bob") }).ok, true);
  w.inquiry(Q, { legs: [{ target: a.doc, content_id: a.cid }] });
  const r = w.r.raiseNotices({});
  assert.equal(r.ok, true);
  assert.ok(r.raised.every((x) => !x.across), "no notice across addresses");
  /* the version at the pinned capture's own address is R14's, along that address's chain, graded by content */
  assert.deepEqual(r.raised.map((x) => x.newer_capture), [same.cap]);
  assert.equal(w.count("reevaluation_notices WHERE across IS NOT NULL"), 0);
});

test("R36 R15: adoptVersion re-pins the leg to the passage at the new address (a new basis version, the old staying readable) and closes the notice; keepVersion closes another; neither raises again", () => {
  const { w, law, relate } = lawWorld();
  const a = law("INFO-2026-0001-a", "PEBL § 100", "100(a)", "codes.example/a", "2026-09-27T01:00:00Z");
  const b = law("INFO-2026-0002-b", "PEBL § 100", "100(a)", "codes.example/b", "2026-09-28T01:00:00Z");
  const c = law("INFO-2026-0003-c", "PEBL § 101", "101(a)", "codes.example/c", "2026-09-29T01:00:00Z");
  relate("recodifies", c, a);
  w.inquiry(Q, { legs: [{ target: a.doc, content_id: a.cid }] });
  const raised = w.r.raiseNotices({}).raised;
  const toC = raised.find((x) => x.newer_capture === c.cap), toB = raised.find((x) => x.newer_capture === b.cap);
  const before = w.text(Q);
  const ad = w.r.adoptVersion({ notice: toC.notice, why: "The council recodified section 100 as 101.", author: V("alice"), viewer: V("alice") });
  assert.equal(ad.ok, true, JSON.stringify(ad).slice(0, 400));
  assert.notEqual(w.text(Q), before, "a new version of the question's document is written");
  const v = w.fm(Q).basis_versions.find((x) => x.name === ad.version);
  assert.ok(v, "the new reading is held");
  const leg = w.rows(`SELECT * FROM inquiry_basis_versions WHERE bundle_id=? AND name=?`, Q, ad.version);
  assert.equal(leg.length, 1);
  assert.match(String(w.fm(Q).basis_versions.find((x) => x.name === ad.version).description), /at another address/);
  assert.deepEqual(w.rows(`SELECT target_id, content_id FROM inquiry_basis WHERE bundle_id=?`, Q).map((l) => [l.target_id, l.content_id]),
                   [[a.doc, a.cid]], "the live basis is untouched");
  const versioned = JSON.stringify(w.fm(Q));
  assert.ok(versioned.includes(c.cid) && versioned.includes(c.doc), "the adopted leg names the passage at the new address and its document");
  assert.equal(w.r.keepVersion({ notice: toB.notice, author: V("alice"), viewer: V("alice") }).ok, true);
  assert.deepEqual(w.rows(`SELECT state FROM reevaluation_notices ORDER BY notice_id`).map((x) => x.state).sort(), ["adopted", "kept"]);
  assert.equal(w.r.raiseNotices({}).count, 0);
});

test("R36 R20: a viewer who does not see the capture at the new address is given its newer capture, passage, grade and affects as absent", () => {
  const { w, law } = lawWorld();
  const a = law("INFO-2026-0001-a", "PEBL § 100", "100(a)", "codes.example/a", "2026-09-27T01:00:00Z");
  law("INFO-2026-0002-b", "PEBL § 100", "100(a)", "codes.example/b", "2026-09-28T01:00:00Z");
  w.inquiry(Q, { legs: [{ target: a.doc, content_id: a.cid }] });
  assert.equal(w.r.raiseNotices({}).count, 1);
  const seen = w.r.notices({ viewer: V("alice") }).notices[0];
  assert.ok(seen.newer_capture && seen.newer_content);
  /* the newer capture's bundle moved into a project alice is not in: she sees her notice, not that version */
  const P = w.project("Closed work", "bob");
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id='INFO-2026-0002-b'`, P);
  const hid = w.r.notices({ viewer: V("alice") }).notices[0];
  assert.deepEqual([hid.newer_capture, hid.newer_content, hid.grade, hid.affects], [null, null, null, null]);
  assert.deepEqual([hid.across.compared, hid.across.reason, hid.across.why], [null, null, null], "content's reading of that version too");
});

/** Every unit of a whole document's text, page by page. */
const read = (w, cap, ...texts) => w.read(cap, texts.map((t, i) => U(i, t)));

test("R36 R14 N589: the notice's grade is content's comparison of the two captures (passageAcross, its R55): a version at another address whose text is byte-identical grades A and raises nothing; one whose text changed is graded as content grades it, affected, its reason kept", () => {
  const { w, law, relate } = lawWorld();
  const a = law("INFO-2026-0001-a", "PEBL § 100", "100(a)", "codes.example/a", "2026-09-27T01:00:00Z");
  const b = law("INFO-2026-0002-b", "PEBL § 100", "100(a)", "codes.example/b", "2026-09-28T01:00:00Z");
  const c = law("INFO-2026-0003-c", "PEBL § 101", "101(a)", "codes.example/c", "2026-09-29T01:00:00Z");
  relate("recodifies", c, a);
  read(w, a.cap, "Section 100.", "The fee is ten dollars.");
  read(w, b.cap, "Section 100.", "The fee is ten dollars.");
  read(w, c.cap, "Section 101.", "Permits are issued by the clerk on application.");
  w.inquiry(Q, { legs: [{ target: a.doc, content_id: a.cid }] });
  const row = w.row(`SELECT content_id, capture_sha, bundle_id, extent_kind, extent, ref, cited_as FROM content WHERE content_id=?`, a.cid);
  const toB = w.content.passageAcross(row, b.cap), toC = w.content.passageAcross(row, c.cap);
  assert.deepEqual([toB.grade, toB.affects], ["A", "unaffected"], "content reads b's text as the same");
  assert.equal(toC.affects, "affected");
  const r = w.r.raiseNotices({});
  assert.deepEqual(r.raised.map((x) => x.newer_capture), [c.cap], "A raises nothing (R14); only the changed version is told");
  const [x] = r.raised;
  assert.deepEqual([x.grade, x.affects, x.across.compared, x.across.reason, x.across.why], [toC.grade, "affected", true, toC.grade_reason, toC.grade_why]);
  assert.deepEqual(w.rows(`SELECT grade, affects FROM reevaluation_notices`).map((n) => [n.grade, n.affects]), [[toC.grade, "affected"]]);
  assert.equal(w.r.notices({ viewer: V("alice") }).notices[0].across.reason, toC.grade_reason);
});

test("R36 R21 N589: where content's comparison gives no answer (passageAcross answers null), the notice is raised UNDETERMINED by name with why, never A, B or absent", () => {
  const { w, law } = lawWorld();
  const a = law("INFO-2026-0001-a", "PEBL § 100", "100(a)", "codes.example/a", "2026-09-27T01:00:00Z");
  const b = law("INFO-2026-0002-b", "PEBL § 100", "100(a)", "codes.example/b", "2026-09-28T01:00:00Z");
  read(w, a.cap, "Section 100.", "The fee is ten dollars.");
  read(w, b.cap, "Section 100.", "The fee is ten dollars.");
  w.inquiry(Q, { legs: [{ target: a.doc, content_id: a.cid }] });
  const asked = [];
  w.content.passageAcross = (row, cap) => { asked.push([row.content_id, cap]); return null; };
  const r = w.r.raiseNotices({});
  assert.deepEqual(asked, [[a.cid, b.cap]]);
  assert.deepEqual(r.raised.map((x) => [x.newer_capture, x.grade, x.affects, x.across.compared, x.across.why]),
                   [[b.cap, "UNDETERMINED", "undetermined", false, ACROSS_UNDETERMINED_WHY]]);
  assert.ok(ACROSS_UNDETERMINED_WHY.includes("undetermined"));
});

test("R36 N590: the held standards are read through standards.standardsWithPortion and standardsAt (its R32), never by paging standardsIn; an answer marked truncated leaves the sweep saying by name that a notice may be missing (R21), and still raises what it reached", () => {
  const { w, s, law } = lawWorld();
  const a = law("INFO-2026-0001-a", "PEBL § 100", "100(a)", "codes.example/a", "2026-09-27T01:00:00Z");
  const b = law("INFO-2026-0002-b", "PEBL § 100", "100(a)", "codes.example/b", "2026-09-28T01:00:00Z");
  w.inquiry(Q, { legs: [{ target: a.doc, content_id: a.cid }] });
  const calls = [];
  const realAt = s.standardsAt.bind(s), realWith = s.standardsWithPortion.bind(s);
  s.standardsIn = () => { calls.push("standardsIn"); throw new Error("never paged"); };
  s.standardsWithPortion = (x) => { calls.push(["with", x.contentId]); return realWith(x); };
  s.standardsAt = (x) => { calls.push(["at", x.key, x.portion]); return realAt(x); };
  const r = w.r.raiseNotices({});
  assert.deepEqual(r.raised.map((x) => x.newer_capture), [b.cap]);
  assert.equal("standards_read" in r, false);
  assert.ok(!calls.includes("standardsIn"));
  assert.deepEqual(calls, [["with", a.cid], ["at", KEY100, "100(a)"]]);
  /* truncated: the sweep names what it could not read */
  w.st.sql.exec(`DELETE FROM reevaluation_notices`);
  s.standardsAt = (x) => ({ ...realAt(x), truncated: true });
  const t = w.r.raiseNotices({});
  assert.deepEqual([t.standards_read, typeof t.standards_why, t.raised.map((x) => x.newer_capture)], [false, "string", [b.cap]]);
  s.standardsWithPortion = () => { throw new Error("down"); };
  w.st.sql.exec(`DELETE FROM reevaluation_notices`);
  const f = w.r.raiseNotices({});
  assert.deepEqual([f.standards_read, f.count], [false, 0]);
});
