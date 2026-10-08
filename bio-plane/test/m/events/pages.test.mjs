/* events as a connection owner (R35), T37-11: a hub's vote events read in pages, not node by node. A walk reads a
   member's pages and then asks each vote on them in turn; the votes a page names are answered together, and every answer
   kept between reads is the one the node asked alone gets, and only while the store is unchanged. A read inside a
   transaction keeps nothing, so it is the reference: each node computed alone. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, MEMBER, OUTSIDER, ZONE } from "./fixture.mjs";
import { BOUNDS, hubBoundOf } from "../../../src/connection-grammar/index.mjs";

const doc = { kind: "document" };
const AT = { value: "2026", precision: "edtf", zone: ZONE };

/** A member with `n` votes, each with a second voter, every tenth within a meeting and every hundredth answered by an award. */
function voters(n) {
  const w = world();
  const voter = w.entity("Vic Voter"), other = w.entity("Olive Other");
  const s = w.capture("term");
  const facts = [];
  for (let d = 0; d < 28; d++)
    facts.push(w.ev.recordDatedFact({ captureSha: s, extent: doc, kind: "meeting", value: `2026-02-${String(d + 1).padStart(2, "0")}`, method: "m", by: MEMBER }).dated_fact.dated_fact_id);
  const value = w.ev.view().vocabulary.vote_values[0].value;
  const meeting = w.ev.createEvent({ kind: "meeting", attestations: [{ datedFactId: facts[0] }], by: MEMBER }).event_id;
  const votes = [];
  for (let i = 0; i < n; i++) {
    const r = w.ev.createEvent({ kind: "vote", attestations: [{ datedFactId: facts[i % 28] }], by: MEMBER,
      participants: [{ entityId: voter, role: "voted", voteValue: value, attestation: 0 }, { entityId: other, role: "voted", voteValue: value, attestation: 0 }] });
    votes.push(r.event_id);
    if (i % 10 === 0) w.ev.relate({ from: r.event_id, to: meeting, kind: "within", attestation: { captureSha: s, extent: doc }, by: MEMBER });
  }
  return { w, voter, votes, meeting, s };
}
const ask = (w, node, extra = {}) => w.ev.neighbours({ node, at: AT, viewer: MEMBER, scope: null, ...extra });
const alone = (w, fn) => { let out; w.record.transact(() => { out = fn(); return { ok: true }; }); return out; };

test("R35 a hub's vote events read in pages (T37-11): at the 4,000-vote shape a member's four pages and then each of its 4,000 votes, asked one node at a time, are answered well within the walk's time budget, each answer equal to the one the node asked alone gets", (t) => {
  const { w, voter, votes } = voters(hubBoundOf("event_voted"));
  const t0 = performance.now();
  const pages = [];
  let page = 0;
  do { const r = ask(w, voter, { page }); assert.equal(r.hub, undefined); pages.push(r); page = r.next; } while (page !== undefined);
  const tPages = performance.now() - t0;
  const answers = votes.map((v) => ask(w, v));
  const spent = performance.now() - t0;
  t.diagnostic(`4,000 votes: four pages ${tPages.toFixed(0)} ms; pages and 4,000 vote nodes ${spent.toFixed(0)} ms of the ${BOUNDS.time_budget_ms} ms budget`);
  assert.equal(pages.length, 4);
  assert.deepEqual(pages.flatMap((p) => p.items).map((i) => i.to), votes, "the pages joined are every vote, in order");
  assert.ok(spent < BOUNDS.time_budget_ms / 4, `pages and votes took ${spent.toFixed(0)} ms; a quarter of the budget is ${BOUNDS.time_budget_ms / 4} ms`);
  /* the reference: inside a transaction nothing is kept, so every node is computed alone */
  const ref = alone(w, () => ({ pages: [0, 1000, 2000, 3000].map((p) => ask(w, voter, { page: p })), votes: votes.map((v) => ask(w, v)) }));
  assert.deepEqual(pages, ref.pages);
  assert.deepEqual(answers, ref.votes);
  assert.ok(answers.every((a) => a.items.filter((i) => i.kind === "event_voted").length === 2));
  assert.equal(answers.filter((a) => a.items.some((i) => i.kind === "event_within")).length, votes.length / 10);
});

test("R35 R40 R10 an answer kept between reads lasts only while the store is unchanged: a new relation, a sight withdrawn by membership's table, a stale when_cache; a read inside a transaction rolled back keeps nothing; identical calls give identical answers a caller cannot change", () => {
  const { w, voter, votes, meeting, s } = voters(30);
  const v = votes[1];
  ask(w, voter);
  const first = ask(w, v);
  assert.deepEqual(ask(w, v), first, "identical calls, identical answers");
  first.items.length = 0;
  first.items.push({ forged: true });
  assert.notDeepEqual(ask(w, v), first, "a caller's change to its answer is not kept");
  assert.ok(!ask(w, v).items.some((i) => i.kind === "event_within"));

  /* a write by this module: a new relation shows at once */
  w.ev.relate({ from: v, to: meeting, kind: "within", attestation: { captureSha: s, extent: doc }, by: MEMBER });
  assert.ok(ask(w, v).items.some((i) => i.kind === "event_within"));

  /* a read inside a transaction rolled back keeps nothing */
  const v2 = votes[2];
  ask(w, v2);
  const inside = alone(w, () => {
    let seen;
    w.record.transact(() => {
      w.ev.relate({ from: v2, to: meeting, kind: "authorises", attestation: { captureSha: s, extent: doc }, by: MEMBER });
      seen = ask(w, v2);
      return { ok: false, reason: "UNDONE" };
    });
    return seen;
  });
  assert.ok(inside.items.some((i) => i.kind === "event_authorises"), "seen inside the transaction");
  assert.ok(!ask(w, v2).items.some((i) => i.kind === "event_authorises"), "gone once rolled back");

  /* sight changed by another module's table: a vote attested by a fenced capture */
  w.project("PROJ-2026-0001-f", "alice");
  const fenced = w.capture("fenced", { bundleId: "INFO-2026-0003-f", project: "PROJ-2026-0001-f" });
  const f = w.ev.recordDatedFact({ captureSha: fenced, extent: doc, kind: "meeting", value: "2026-02-10", method: "m", by: MEMBER }).dated_fact.dated_fact_id;
  const hidden = w.ev.createEvent({ kind: "vote", attestations: [{ datedFactId: f }], by: MEMBER,
    participants: [{ entityId: voter, role: "present", attestation: 0 }] }).event_id;
  assert.equal(ask(w, hidden).items.length, 1);
  assert.equal(w.ev.neighbours({ node: hidden, at: AT, viewer: OUTSIDER, scope: null }).items.length, 0, "the viewer is part of what is asked");
  w.st.sql.exec(`DELETE FROM project_participants WHERE project_id=?`, "PROJ-2026-0001-f");
  assert.equal(ask(w, hidden).items.length, 0, "a sight withdrawn shows at once");

  /* R10: a when_cache made stale answers undetermined at once */
  const v3 = votes[3], day = { at: { value: "2026-02-04", precision: "day", zone: ZONE } };
  assert.ok(ask(w, v3, day).items.length && ask(w, v3, day).items.every((i) => !i.undetermined), "its own day: in");
  w.st.sql.exec(`UPDATE event_when_cache SET value='2020-01-01' WHERE event_id=?`, v3);
  assert.ok(ask(w, v3, day).items.length && ask(w, v3, day).items.every((i) => i.undetermined), "a stale cache fails closed");

  /* the reference agrees with every answer kept */
  for (const n of [voter, ...votes, hidden, meeting]) assert.deepEqual(ask(w, n), alone(w, () => ask(w, n)), n);
  assert.deepEqual(ask(w, v3, day), alone(w, () => ask(w, v3, day)));
});
