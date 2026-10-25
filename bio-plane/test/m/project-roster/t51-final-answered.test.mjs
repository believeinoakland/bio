/* R44 (fix round 10; K5157; walk-T51-final 03 §3, §5): the requester is told the owners' answer, and the owners can read
   the requests they answered. At the interface: R9's directory row `request` is the caller's own latest request in any
   state with `closed` and `closed_comment`; `projectRequestsAnswered` lists what a member answered (`closed_by`), newest
   first, only for projects she can still see. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, snapshot } from "./fixture.mjs";

/* D discoverable, owner ann (bob joined); cal, dee, eve outside. */
async function answerWorld() {
  const w = await world().group("ann", "bob", "cal", "dee", "eve");
  w.project("PROJ-D", "Discoverable D");
  w.m.projectClaimOwner({ projectId: "PROJ-D", memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-D", handle: "bob", by: "ann", viewer: V("ann") });
  w.m.projectJoin({ projectId: "PROJ-D", by: "bob", viewer: V("bob") });
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  return w;
}
const ask = (w, by, projectId = "PROJ-D") => w.r.projectRequest({ projectId, comment: null, by, viewer: V(by) });
const answer = (w, handle, how, comment = null, projectId = "PROJ-D", by = "ann") =>
  w.r.projectRequestAnswer({ projectId, handle, answer: how, comment, by, viewer: V(by) });
const seen = (w, by) => w.r.projectDirectory({ viewer: V(by) }).projects.find((p) => p.id === "PROJ-D");

test("R44 R9's request carries closed and closed_comment: a declined request is read back by the requester with the owner's word", async () => {
  const w = await answerWorld();
  w.time.now = Date.parse("2026-10-06T09:00:00.000Z");
  ask(w, "cal");
  const open = seen(w, "cal").request;
  assert.deepEqual([open.state, open.closed, open.closed_comment], ["open", null, null], "control: open, nothing answered yet");
  answer(w, "cal", "decline", "We are full this season.");
  const declined = seen(w, "cal").request;
  assert.equal(declined.state, "declined");
  assert.equal(declined.closed_comment, "We are full this season.");
  assert.match(declined.closed, /^\d{4}-\d\d-\d\dT/);
  assert.equal(typeof declined.asked, "string");
  /* a decline with no word answers null; another member's answer is never in her row */
  ask(w, "dee");
  answer(w, "dee", "decline");
  assert.deepEqual([seen(w, "dee").request.state, seen(w, "dee").request.closed_comment], ["declined", null]);
  assert.equal(seen(w, "eve").request, null, "control: she never asked");
  assert.equal(seen(w, "cal").request.closed_comment, "We are full this season.", "not dee's");
});

test("R44 R9's request is the latest whatever its state: withdrawn, then asked again", async () => {
  const w = await answerWorld();
  ask(w, "cal");
  w.r.projectRequestWithdraw({ projectId: "PROJ-D", by: "cal", viewer: V("cal") });
  const gone = seen(w, "cal").request;
  assert.deepEqual([gone.state, gone.closed_comment], ["withdrawn", null]);
  ask(w, "cal");
  assert.equal(seen(w, "cal").request.state, "open", "the latest is the second ask");
});

test("R44 projectRequestsAnswered: the member's answers, newest first, each with its project, requester, answer, word and day", async () => {
  const w = await answerWorld();
  w.project("PROJ-E", "Second E");
  w.m.projectClaimOwner({ projectId: "PROJ-E", memberId: "ann" });
  w.m.projectVisibilitySet({ projectId: "PROJ-E", setting: "discoverable", by: "ann", viewer: V("ann") });
  ask(w, "cal"); ask(w, "dee"); ask(w, "dee", "PROJ-E");
  answer(w, "cal", "decline", "Not yet.");
  answer(w, "dee", "grant", null, "PROJ-D");
  answer(w, "dee", "decline", "No room.", "PROJ-E");
  const got = w.r.projectRequestsAnswered({ by: "ann", viewer: V("ann") });
  assert.equal(got.ok, true);
  assert.deepEqual([got.count, got.truncated], [3, false]);
  assert.deepEqual(got.answered.map((x) => [x.projectId, x.requester.handle, x.answer, x.comment]),
    [["PROJ-E", "dee", "declined", "No room."], ["PROJ-D", "dee", "granted", null], ["PROJ-D", "cal", "declined", "Not yet."]],
    "newest first");
  const first = got.answered[0];
  assert.deepEqual([first.name, first.requester.member], ["Second E", "dee"]);
  assert.match(first.closed, /^\d{4}-\d\d-\d\dT/);
  /* only what the member answered: bob answered none; the requester's own withdrawal is not an answer; a limit lowers the page */
  assert.deepEqual(w.r.projectRequestsAnswered({ by: "bob", viewer: V("bob") }).answered, []);
  ask(w, "eve");
  w.r.projectRequestWithdraw({ projectId: "PROJ-D", by: "eve", viewer: V("eve") });
  assert.equal(w.r.projectRequestsAnswered({ by: "eve", viewer: V("eve") }).answered.length, 0, "a withdrawal is not an answer");
  const one = w.r.projectRequestsAnswered({ by: "ann", viewer: V("ann"), limit: 2 });
  assert.deepEqual([one.count, one.limit, one.truncated], [2, 2, true]);
  assert.equal(one.answered[0].projectId, "PROJ-E", "the cap cuts the oldest");
});

test("R44 projectRequestsAnswered names a requester by handle and member id; a read writes nothing; no member behind the call is refused", async () => {
  const w = await answerWorld();
  ask(w, "cal");
  answer(w, "cal", "decline", "No.");
  const row = w.r.projectRequestsAnswered({ by: "ann", viewer: V("ann") }).answered[0];
  assert.deepEqual(row.requester, { member: "cal", handle: "cal" });
  const before = snapshot(w);
  w.r.projectRequestsAnswered({ by: "ann", viewer: V("ann") });
  assert.equal(snapshot(w), before, "a read writes nothing");
  assert.equal(w.r.projectRequestsAnswered({ by: "ann", viewer: V("dee") }).reason, "PROJECT_REQUEST_NEEDS_A_MEMBER", "by and viewer must name one person");
  assert.equal(w.r.projectRequestsAnswered({ by: "class:ai", viewer: "class:ai" }).reason, "PROJECT_REQUEST_NEEDS_A_MEMBER");
});

test("R44 projectRequestsAnswered: only for projects the member can still see; a project she has since been removed from names nothing", async () => {
  const w = await answerWorld();
  w.owned("PROJ-X", "ann", ["bob"]);
  w.m.projectVisibilitySet({ projectId: "PROJ-X", setting: "discoverable", by: "ann", viewer: V("ann") });
  assert.equal(w.r.projectOwnerAdd({ projectId: "PROJ-X", handle: "bob", by: "ann", viewer: V("ann") }).ok, true);
  ask(w, "cal", "PROJ-X");
  answer(w, "cal", "decline", "no", "PROJ-X", "bob");
  assert.equal(w.r.projectRequestsAnswered({ by: "bob", viewer: V("bob") }).answered.length, 1, "control: she still sees it");
  /* bob steps down as an owner (both owners agree at two) and ann removes him from the project */
  const down = (by) => w.r.projectOwnerRemove({ projectId: "PROJ-X", handle: "bob", by, reason: "stepping down", viewer: V(by) });
  down("ann");
  assert.equal(down("bob").ok, true);
  assert.equal(w.m.projectRemove({ projectId: "PROJ-X", handle: "bob", by: "ann", viewer: V("ann") }).ok, true);
  assert.deepEqual(w.r.projectRequestsAnswered({ by: "bob", viewer: V("bob") }).answered, [],
    "a project she cannot see in full names nothing");
  assert.equal(w.r.projectRequestsAnswered({ by: "ann", viewer: V("ann") }).answered.length, 0, "control: ann answered none there");
});
