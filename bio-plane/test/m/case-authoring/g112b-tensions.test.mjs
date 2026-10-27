/* case-authoring R34, R75, R76 (T51 fix round 9, G112b; diagnosis-R9-rewalk8-B.md item 1, last paragraph): the words a signer gave
   for the tensions she disclosed travel in `publish`'s own body and the draft holds none, so a reload's pre-flight
   ({draft, project} only) met TENSION_NOT_DISCLOSED and no signing check. The prepared edition's own disclosure is read
   back, for the pre-flight alone. The candidate is laid down through `contradiction`'s own doors, as tensions.test.mjs does. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED, sha } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", F = "INQ-2026-0001-q", RUN = "RUN-2026-0001", ADMIN = "class:admin";
const CA = sha("passage a"), CB = sha("passage b");
const sign = (pre) => pre.steps.find((s) => s.name === "sign");

function setup() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  const content = (id, capture, bundle) => w.st.sql.exec(
    `INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at, stale)
     VALUES (?, ?, ?, 'pdf-page', '{}', ?, 'plane', '2026-01-01', 0)`, id, capture, bundle, `the page of ${bundle}`);
  content(CA, w.doc(DOC), DOC); content(CB, w.doc(DOC2), DOC2);
  w.finding(F, [{ target: DOC, content_id: CA }, { target: DOC2, role: "cuts_against", content_id: CB }]);
  const P = w.project("Team", "alice", [F]);
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], V("alice"));
  w.runs.set(RUN, { status: "running", principal: "member:alice" });
  const pair = w.contradiction.pairs({ key: "K1", viewer: ADMIN }).pairs.find((p) => p.inquiry === F);
  const r = w.contradiction.propose({ run: RUN, proposedBy: "class:ai/t", viewer: ADMIN, caller: "member:alice",
    proposals: [{ key: "K1", a: pair.a, b: pair.b, label: "record", reason: "the machine's reason" }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return { w, P, id: r.candidates[0].candidate };
}
const WORDS = "we read the later page as the award";

test("R34, R75, R76 (G112b): a reload's pre-flight ({draft, project} only) reads the tension disclosure from the prepared edition: first is null, publish_at is offered, the answer is the confirmed call's", () => {
  const x = setup();
  const { tieAttested, viewer, author, project, biasAcknowledgement, ...kept } = { ...AUTHORED, whatChanged: WHAT_CHANGED,
    targets: [F], roles: { [F]: "load_bearing" } };
  x.w.draft("DRAFT-2026-0001", x.P, kept, { statementBy: "alice" });
  const call = (over = {}) => ({ draft: "DRAFT-2026-0001", project: x.P, viewer: V("alice"), author: "alice", ...over });
  const typed = { tieAttested: true, biasAcknowledgement: AUTHORED.biasAcknowledgement, tensionsDisclosed: [{ candidate: x.id, words: WORDS }] };
  const un = x.w.ca.publishPreflight(call({ tieAttested: true, biasAcknowledgement: AUTHORED.biasAcknowledgement }));
  assert.equal(un.first.reason, "TENSION_NOT_DISCLOSED", "control: nothing disclosed, nothing prepared");
  const done = x.w.ca.publishCase(call(typed));
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  const tied = x.w.ca.publishPreflight(call(typed));
  const before = x.w.snapshot();
  const pre = x.w.ca.publishPreflight(call());
  assert.deepEqual(x.w.snapshot(), before, "nothing written");
  assert.equal(pre.first, null, JSON.stringify(pre.first).slice(0, 300));
  assert.equal(sign(pre).publish_at.offered, true);
  assert.deepEqual([pre.first, pre.blockers, pre.ready, sign(pre).publish_at], [tied.first, tied.blockers, tied.ready, sign(tied).publish_at]);
  /* controls: a list the call sends wins; the act itself still asks for the disclosure */
  const sent = x.w.ca.publishPreflight(call({ tensionsDisclosed: [] }));
  assert.equal(sent.first.reason, "TENSION_NOT_DISCLOSED");
  const act = x.w.ca.publishCase(call({ tieAttested: true, biasAcknowledgement: AUTHORED.biasAcknowledgement }));
  assert.equal(act.reason, "TENSION_NOT_DISCLOSED");
});
