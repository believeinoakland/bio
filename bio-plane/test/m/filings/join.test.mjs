/* filings at the T51 fix round 5 (E9; K4557, K4558): a project's weighty filing acts need a member who has joined the project.
   A member invited and not yet joined is refused, at the start of the act, with membership's PROJECT_ACT_NOT_A_PARTICIPANT
   (it says to join), and nothing is written; the same member after `projectjoin` does the whole walk. The walker's case
   (PROJ-2026-4538: `walker` invited, `joined_at` null, prepared, approved and recorded the sending of a request) is driven
   through the door's ops (`filingsOps`) over the real membership, actions and filing-templates. The earlier tests act as the
   administrator or a joined member; none acted as an invited one. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, WHY } from "./fixture.mjs";

const WALKER = { author: V("walker"), viewer: V("walker") };
const BO = { author: V("bo"), viewer: V("bo") };
const TEXT = "To the {{counterparty_role}}: a request for the minutes.";
const CODE = "PROJECT_ACT_NOT_A_PARTICIPANT";
const WRITTEN = ["filing_drafts", "communication_drafts", "filing_approvals", "filing_second_approvals", "filing_sendings",
                 "joint_signatories", "counsel_packets", "filing_hold_notices"];

/* the world: `walker` is invited to the project and has not joined, the state step 0 read on biosmoke8 */
function invited() {
  const x = world();
  x.member("walker");
  const inv = x.membership.projectInvite({ projectId: x.proj, handle: "h_walker", by: "olive", viewer: V("olive") });
  assert.notEqual(inv && inv.ok, false, JSON.stringify(inv));
  assert.equal(x.membership.isJoinedParticipant(x.proj, "walker"), false);
  return x;
}
const join = (x) => {
  const j = x.membership.projectJoin({ projectId: x.proj, by: "walker", viewer: V("walker") });
  assert.notEqual(j && j.ok, false, JSON.stringify(j));
};
const prepare = (x, who, action, over = {}) => x.op("filingprepare", who, { action, text: TEXT, language: "en", ...over });
const refused = (r, label) => {
  assert.equal(r.ok, false, `${label}: refused: ${JSON.stringify(r).slice(0, 200)}`);
  assert.equal(r.reason, CODE, `${label}: ${JSON.stringify(r).slice(0, 200)}`);
  assert.equal(r.code, CODE);
  assert.match(String(r.detail), /has not joined it/, `${label}: the sentence tells the member to join`);
};

test("R1 R5 (K4557) filingPrepare for an action of the project is refused PROJECT_ACT_NOT_A_PARTICIPANT to a member invited and not joined, whether the action names the project itself or rests on a determination in it, and writes nothing; the walker's records request", async () => {
  const x = invited();
  const own = x.action({ project: x.proj, legs: [], kind: "records_request" });
  const viaDet = x.action();
  const before = x.snapshot(WRITTEN);
  refused(prepare(x, WALKER, own), "the action's own project");
  refused(prepare(x, WALKER, viaDet), "the project of the determination it rests on");
  assert.deepEqual(x.snapshot(WRITTEN), before, "nothing was written");
  /* the refusal is at the start: before the tier, the closed state and the template are asked */
  refused(prepare(x, WALKER, own, { text: undefined, template: { id: "TPL-NONE" } }), "before the template is asked");
  /* controls: a joined member and the project's owner are unchanged */
  assert.equal(prepare(x, BO, own).ok, true);
  assert.equal(prepare(x, { author: V("olive"), viewer: V("olive") }, viaDet).ok, true);
});

test("R23 R37 (K4557) communicationPrepare is refused PROJECT_ACT_NOT_A_PARTICIPANT to a member invited and not joined, writing nothing; a machine's draft and a joined member's are unchanged", async () => {
  const x = invited();
  const A = x.action({ project: x.proj, legs: [] });
  const before = x.snapshot(WRITTEN);
  refused(x.op("communicationprepare", WALKER, { action: A, text: "A note to the board.", purpose: "a note" }), "communicationprepare");
  assert.deepEqual(x.snapshot(WRITTEN), before);
  assert.equal(x.op("communicationprepare", BO, { action: A, text: "A note to the board.", purpose: "a note" }).ok, true);
  assert.equal(x.op("communicationprepare", { author: MACHINE, viewer: MACHINE }, { action: A, text: "A note to the board.", purpose: "a note" }).ok, true,
               "a machine credential holds no roster position and is not asked");
});

test("R6 R7 R42 R36 (K4557) approving, second approving, recording the sending and a partner's signature are refused to a member invited and not joined, writing nothing; the draft is the project's by its action or by its basis", async () => {
  for (const [label, over] of [["the action's project", { project: "PROJ", legs: [] }], ["the draft's basis project", {}]]) {
    const x = invited();
    const A = x.action({ partners: [{ role: "chair", organisation: "Harbour Watch" }], ...over, ...(over.project ? { project: x.proj } : {}) });
    const d = await prepare(x, BO, A);
    assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
    /* a draft nobody approved: the invited member may not approve it */
    const before = x.snapshot(WRITTEN);
    refused(await x.op("filingapprove", WALKER, { filing: d.id }), `${label}: filingapprove`);
    assert.deepEqual(x.snapshot(WRITTEN), before, `${label}: nothing written`);
    const ap = await x.op("filingapprove", BO, { filing: d.id });
    assert.equal(ap.ok, true, JSON.stringify(ap).slice(0, 300));
    const approved = x.snapshot(WRITTEN);
    refused(await x.op("filingsecondapprove", WALKER, { filing: d.id }), `${label}: filingsecondapprove`);
    refused(await x.op("filingsent", WALKER, { filing: d.id, at: "2026-10-01", account: "emailed" }), `${label}: filingsent`);
    refused(await x.op("jointsignatory", WALKER, { filing: d.id, organisation: "Harbour Watch", body_sha: ap.body_sha, account: "by their own email" }),
            `${label}: jointsignatory`);
    assert.deepEqual(x.snapshot(WRITTEN), approved, `${label}: nothing written by the four`);
    /* after joining, the same member does each of them */
    join(x);
    const second = await x.op("filingsecondapprove", WALKER, { filing: d.id });
    assert.equal(second.ok, true, `${label}: ${JSON.stringify(second).slice(0, 300)}`);
    const signed = await x.op("jointsignatory", WALKER, { filing: d.id, organisation: "Harbour Watch", body_sha: ap.body_sha, account: "by their own email" });
    assert.equal(signed.ok, true, `${label}: ${JSON.stringify(signed).slice(0, 300)}`);
    const sent = await x.op("filingsent", WALKER, { filing: d.id, at: "2026-10-01", account: "emailed" });
    assert.equal(sent.ok, true, `${label}: ${JSON.stringify(sent).slice(0, 300)}`);
  }
});

test("R8 R47 (K4557) a counsel packet and a hold notice are refused to a member invited and not joined, writing nothing, and made by the same member once joined", async () => {
  const x = invited();
  const A = x.action({ project: x.proj, legs: [] });
  assert.equal(x.f.actionHolds.actionHold({ target: A, hold: "in_place", reason: "a solicitor's letter", author: V("olive"), viewer: V("olive") }).ok, true);
  const before = x.snapshot(WRITTEN);
  refused(x.op("counselpacket", WALKER, { action: A, reason: WHY }), "counselpacket");
  refused(x.op("holdnoticeprepare", WALKER, { place: { target: A } }), "holdnoticeprepare");
  assert.deepEqual(x.snapshot(WRITTEN), before, "nothing written");
  join(x);
  const packet = x.op("counselpacket", WALKER, { action: A, reason: WHY });
  assert.equal(packet.ok, true, JSON.stringify(packet).slice(0, 300));
  const notice = x.op("holdnoticeprepare", WALKER, { place: { target: A } });
  assert.equal(notice.ok, true, JSON.stringify(notice).slice(0, 300));
});

test("R1 R6 R7 R32 (K4557) the walker's walk: invited and refused, then after projectjoin the member prepares, approves, records the sending and keeps the request as the team's template", async () => {
  const x = invited();
  const A = x.action({ project: x.proj, legs: [], kind: "records_request" });
  refused(prepare(x, WALKER, A), "invited");
  join(x);
  const d = prepare(x, WALKER, A);
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const ap = await x.op("filingapprove", WALKER, { filing: d.id });
  assert.equal(ap.ok, true, JSON.stringify(ap).slice(0, 300));
  const sent = await x.op("filingsent", WALKER, { filing: d.id, at: "2026-10-01", account: "emailed" });
  assert.equal(sent.ok, true, JSON.stringify(sent).slice(0, 300));
  const kept = await x.op("templatesave", WALKER, { filing: d.id, name: "the records request" });
  assert.equal(kept.ok, true, JSON.stringify(kept).slice(0, 300));
});

test("R1 R5 R6 R7 (K4557) controls: an administrator who has not joined is refused like anyone; a filing of an action with no project is untouched for the invited member; the owner and a joined member are unchanged", async () => {
  const x = invited();
  const A = x.action({ project: x.proj, legs: [] });
  x.member("root", { role: "admin" });
  /* an administrator sees a project's contents only where it is discoverable (membership D54); sight is not position */
  assert.notEqual(x.membership.projectVisibilitySet({ projectId: x.proj, setting: "discoverable", by: "olive", viewer: V("olive") }).ok, false);
  const ADMIN = { author: V("root"), viewer: V("root") };
  refused(prepare(x, ADMIN, A), "the administrator, not joined");
  /* an action in no project and resting on no determination: nothing to join */
  const free = x.action({ legs: [] });
  assert.equal(prepare(x, WALKER, free).ok, true, "a filing with no project is untouched");
  const own = prepare(x, { author: V("olive"), viewer: V("olive") }, A);
  assert.equal(own.ok, true, "the owner");
  const ap = await x.op("filingapprove", { author: V("olive"), viewer: V("olive") }, { filing: own.id });
  assert.equal(ap.ok, true, "the owner approves");
  const sent = await x.op("filingsent", BO, { filing: own.id, at: "2026-10-01", account: "emailed" });
  assert.equal(sent.ok, true, "a joined member records the sending");
});
