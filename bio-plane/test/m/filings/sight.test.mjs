/* filings — sight of what a packet and a draft draw on (R11, R13, K316): the action alone never decides it. A member
   who may see the action but not the project of a determination or consequence a packet or draft draws on reads
   nothing of it: the packet answers as absent, and the action's list leaves it out, naming nothing of it (its id, its
   determination, its words, its consequences, `basis_changed` included). Driven at the module's interface and through
   its ops, over the real modules on storage shaped as workerd's (a cursor-answering `sql.exec`, the fixture's). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";

const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };
/* quinn is a member outside the project (the fixture's); bo and cy are joined in it. */
const OUTSIDER = V("quinn");

/* A world where the project's determination D bears a recorded consequence, a Tier 1 action A and a Tier 3 action T3
   rest on D, bo has prepared a draft on A and olive has assembled a counsel packet on T3. */
function hidden() {
  const x = world();
  const cons = x.consequences.consequenceRecord({ determination: x.D, standard: x.S1,
    affected: { kind: "fund", description: "the hauling reserve fund" }, period: { from: "2026-01-01", to: "2026-12-31" },
    measure: { unit: "money", value: 10 }, basis: { rationale: "the ledger shows the transfer" }, author: V("olive"),
    viewer: V("olive") });
  assert.equal(cons.ok, true, JSON.stringify(cons).slice(0, 300));
  const A = x.action();
  const T3 = x.action({ kind: "commitment_claim" });
  const d = x.f.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const p = x.f.counselPacket({ action: T3, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  return { x, A, T3, d, p, cons: cons.id };
}

/* Nothing of the hidden project in `answer`: its id, its determinations, the act's words, its consequences. */
function namesNothing(x, answer, extra = []) {
  const bytes = JSON.stringify(answer);
  for (const s of [x.proj, x.D, "the works order", "CONS-", "the hauling reserve fund", ...extra])
    assert.equal(bytes.includes(s), false, `names ${s}: ${bytes.slice(0, 300)}`);
}

test("R11 a counsel packet is read only by a member who may see the action and the project of every determination and consequence it draws on: NO_SUCH_PACKET otherwise, the same answer as an absent packet, by every read and export", async () => {
  const { x, T3, p, cons } = hidden();
  /* the outsider may see the action itself */
  assert.equal(x.actions.actionRead({ id: T3, viewer: OUTSIDER }).ok, true, "the action is not hidden");
  /* a member of the project reads the packet, its determination and its consequence */
  const seen = x.f.counselPacketRead({ id: p.id, viewer: V("bo") });
  assert.equal(seen.ok, true);
  const bytes = JSON.stringify(seen);
  for (const s of [x.D, cons, "the hauling reserve fund"]) assert.ok(bytes.includes(s), `a member reads ${s}`);
  assert.equal(x.op("counselpacketread", { id: p.id, viewer: V("cy") }).ok, true);
  assert.equal(x.f.counselPacketRead({ id: p.id, viewer: MACHINE }).ok, true, "a machine sees every project");
  /* the outsider reads nothing of it, answered exactly as a packet that does not exist */
  const absent = x.f.counselPacketRead({ id: "CPK-2026-9999", viewer: OUTSIDER });
  for (const r of [x.f.counselPacketRead({ id: p.id, viewer: OUTSIDER }),
                   x.f.counselPacketRead({ id: p.id, version: 1, viewer: OUTSIDER }),
                   x.op("counselpacketread", { id: p.id, viewer: OUTSIDER }),
                   (await x.f.counselPacketExport({ id: p.id, version: 1, author: OUTSIDER, viewer: OUTSIDER })),
                   await x.op("counselpacketexport", { id: p.id, author: OUTSIDER, viewer: OUTSIDER })]) {
    assert.equal(r.reason, "NO_SUCH_PACKET");
    assert.deepEqual({ ...r, id: null }, { ...absent, id: null }, "one answer for hidden and absent");
    namesNothing(x, r);
  }
  /* nothing was exported for the outsider; a member's export is recorded */
  assert.equal(x.count("counsel_packet_exports"), 0);
  assert.equal((await x.f.counselPacketExport({ id: p.id, author: V("bo"), viewer: V("bo") })).ok, true);
  /* a theory proposed against the packet is refused as for an absent packet */
  const t = x.f.theoryPropose({ packet: p.id, theory: "A breach.", standards: [x.S1], why: "w", proposer: OUTSIDER,
                                viewer: OUTSIDER });
  assert.equal(t.reason, "NO_SUCH_PACKET");
  namesNothing(x, t);
  /* joining the project admits the reader: sight is read at each read, never stored */
  const inv = x.membership.projectInvite({ projectId: x.proj, handle: "h_quinn", by: "olive", viewer: V("olive") });
  assert.notEqual(inv.ok, false, JSON.stringify(inv));
  assert.equal(x.f.counselPacketRead({ id: p.id, viewer: OUTSIDER }).ok, true, "an invited participant sees the project");
});

test("R13 filingsFor leaves out every draft and packet drawing on a determination or consequence in a project the viewer may not see, naming nothing of it (its id, its determination, its words), basis_changed included; a member of the project reads them all", async () => {
  const { x, A, T3, d, p } = hidden();
  /* the outsider's own draft, prepared where the determination is hidden, draws on nothing it may not see */
  const own = x.f.filingPrepare({ action: A, preparer: OUTSIDER, viewer: OUTSIDER });
  assert.equal(own.ok, true);
  namesNothing(x, own);
  /* the determination superseded: the packet's and the draft's basis changed */
  const D2 = x.determine({ supersedes: x.D, reason: "corrected",
                           act: { ...x.act, id: x.conformance.determinationRead({ id: x.D, viewer: MACHINE }).act.id } });
  const member = { drafts: x.f.filingsFor({ action: A, viewer: V("bo") }), packets: x.f.filingsFor({ action: T3, viewer: V("bo") }) };
  assert.deepEqual(member.drafts.drafts.map((r) => r.filing), [d.id, own.id]);
  assert.deepEqual(member.packets.packets.map((r) => [r.packet, r.version]), [[p.id, 1]]);
  const causes = member.packets.packets[0].basis_changed.causes;
  assert.deepEqual(causes.map((c) => [c.cause, c.determination, c.by]), [["determination_superseded", x.D, D2]],
                   "a member reads the supersession by name");
  for (const out of [x.f.filingsFor({ action: A, viewer: OUTSIDER }), x.op("filingsfor", { action: A, viewer: OUTSIDER })]) {
    assert.equal(out.ok, true);
    assert.deepEqual(out.drafts.map((r) => r.filing), [own.id], "the draft drawing on the hidden determination is left out");
    namesNothing(x, out, [d.id, D2]);
  }
  for (const out of [x.f.filingsFor({ action: T3, viewer: OUTSIDER }), x.op("filingsfor", { action: T3, viewer: OUTSIDER })]) {
    assert.equal(out.ok, true);
    assert.deepEqual([out.drafts, out.packets, out.packets_truncated], [[], [], false]);
    namesNothing(x, out, [p.id, D2, "CONF-"]);
  }
});

test("R6 R7 R19 a draft drawing on a determination in a project the viewer may not see answers as absent to approval and to recording it sent", async () => {
  const { x, d } = hidden();
  const absent = (await x.f.filingApprove({ filing: "FIL-2026-9999", text: "t", author: OUTSIDER, viewer: OUTSIDER }));
  x.determine({ supersedes: x.D, reason: "corrected",
                act: { ...x.act, id: x.conformance.determinationRead({ id: x.D, viewer: MACHINE }).act.id } });
  const r = (await x.f.filingApprove({ filing: d.id, text: "t", author: OUTSIDER, viewer: OUTSIDER }));
  assert.equal(r.reason, "NO_SUCH_FILING", "not FILING_STALE naming the hidden determination");
  assert.deepEqual({ ...r, filing: null }, { ...absent, filing: null });
  namesNothing(x, r);
  const s = x.f.filingRecordSent({ filing: d.id, at: "2026-09-29", account: "handed in", author: OUTSIDER, viewer: OUTSIDER });
  assert.equal(s.reason, "NO_SUCH_FILING");
  assert.equal((await x.f.filingApprove({ filing: d.id, text: "t", author: V("bo"), viewer: V("bo") })).reason, "FILING_STALE",
               "a member of the project reaches the draft");
});
