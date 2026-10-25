/* screens-action, fix round 5 (E9; Bob's K4557): a member invited to a project and not yet joined is told, at the start, that only members
   who have joined can draft, approve, send or keep what speaks for the team, and given the way to accept; the steps are not offered and then
   refused. The state is her own `participation` on the `projectlist` row of the action's project (project-roster R34), read with the screen's
   other reads. Every sentence is asserted by its key (R19). Three groups: the screens at their interface (scripted plane), the same member's
   whole path over the REAL membership and filings (`join-seam-t51.test.mjs`), and the door to accept in place (G52, K4686: the design's fold holding the
   sentence and "Join", on `start-send`, `request` and `action`). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, button, last, ok, W, DATA_PLANE, ROSTER, PROJECT, ACTION_ID, ACTION, FILING, FILINGS, READ, draft, ACTIONS } from "./page.mjs";

const NOT_JOINED = "refusal.PROJECT_ACT_NOT_A_PARTICIPANT.invited";
const FOLD_HEAD = "screen.projectact.invited.head";
const STEP2 = `/app/start-send/${ACTION_ID}`;
const REQUEST = `/app/request/${ACTION_ID}`;
const ACTION_PAGE = `/app/action/${ACTION_ID}`;
const APPROVED = { approved_by: "member:mai", at: "x", sha: "s" };
const SENT = { ord: 1, sent_on: "2026-10-10", reference: "R-12" };

/** `projectlist` with the viewer's own state in the action's project (`participation`, project-roster R34). */
const standing = (participation) => ok({ ...ROSTER, projects: ROSTER.projects.map((r) => (r.id === PROJECT ? { ...r, participation } : r)) });
const planeAt = (participation, more = {}) => ({ ...DATA_PLANE, projectlist: standing(participation), ...more });

/** The steps of the send screens by the draft the action holds: the draft, and what a joined member is offered at that step. */
const STEPS = {
  prepare: { drafts: [], offered: ["communicationprepare", "filingprepare"] },
  approve: { drafts: [draft()], offered: ["filingapprove"] },
  second: { drafts: [draft({ approval: APPROVED, second_needed: true })], offered: ["filingsecondapprove"] },
  send: { drafts: [draft({ approval: APPROVED })], offered: ["filingrecordsent", "templatesave"] },
  sent: { drafts: [draft({ approval: APPROVED, sending: SENT })], offered: ["templatesave"] },
};
const stepPlane = (participation, step, more = {}) => planeAt(participation, { filingread: ok(READ()), filingsfor: () => ok(FILINGS(STEPS[step].drafts)), ...more });
const WEIGHTY = ["communicationprepare", "filingprepare", "filingapprove", "filingsecondapprove", "filingrecordsent", "templatesave"];
const writes = (p) => p.requests.filter((r) => r.op && WEIGHTY.includes(r.op));

/** The design's fold is drawn (its summary, the sentence and Join in place, no link to the project's page), no weighty act is drawn or sent. */
function told(p, what) {
  const fold = main(p).querySelector("details[data-gap=join]");
  assert.ok(fold, `${what}: the fold`);
  assert.equal(text(p, fold.querySelector("summary")), W(FOLD_HEAD), `${what}: the fold's summary`);
  assert.ok(text(p, fold).includes(W(NOT_JOINED)), `${what}: the held sentence inside the fold`);
  assert.ok(button(p, "projectjoin"), `${what}: Join in place`);
  assert.ok(!fold.querySelector(`a[href="/app/project/${PROJECT}"]`), `${what}: no link to the project's page in the fold, where Join is in place`);
  for (const op of WEIGHTY) assert.ok(!button(p, op), `${what}: no ${op}`);
  assert.equal(writes(p).length, 0, `${what}: nothing sent`);
}

for (const step of Object.keys(STEPS)) {
  test(`E9 (R3, R48): on start-send, at the "${step}" step an invited member is told she must join first and is offered none of the steps; control: a joined member is offered them`, async () => {
    const invited = await open(STEP2, stepPlane("invited", step));
    told(invited, `start-send/${step}`);
    for (const state of ["joined", "leaving"]) {
      const member = await open(STEP2, stepPlane(state, step));
      assert.ok(!text(member).includes(W(NOT_JOINED)), `${state}: no sentence`);
      for (const op of STEPS[step].offered) assert.ok(button(member, op), `${state}: ${op} offered at ${step}`);
    }
  });
}

test("E9 (R3, R4): the same on request (an action): an invited member drafts nothing; a joined one, an administrator who is no participant, and a member whose place was not read are offered the steps as before", async () => {
  told(await open(REQUEST, stepPlane("invited", "prepare")), "request/prepare");
  told(await open(REQUEST, stepPlane("invited", "send")), "request/send");
  // fixtures-generic: BAD (a roster read that fails, whatever its code)
  for (const [label, plane] of [["joined", stepPlane("joined", "prepare")], ["no participant", stepPlane(null, "prepare")],
    ["place unread", { ...stepPlane("joined", "prepare"), projectlist: () => ({ ok: false, reason: "BAD" }) }], ["no row", { ...stepPlane("joined", "prepare"), projectlist: ok({ ...ROSTER, projects: [] }) }]]) {
    const member = await open(REQUEST, plane);
    assert.ok(button(member, "communicationprepare"), `${label}: offered`);
    assert.ok(!text(member).includes(W(NOT_JOINED)), `${label}: no sentence`);
  }
});

test("E9 (R5, R43, R48): on action, an invited member is given the sentence in place of the doors to prepare, pick up and keep; control: a joined member has the doors", async () => {
  const unsentAction = { ...ACTION, correspondence: [], entries: [] };
  // an action still to be prepared: the card to the send steps
  const unsent = await open(ACTION_PAGE, stepPlane("invited", "prepare", { action: ok(unsentAction) }));
  assert.ok(text(unsent).includes(W(NOT_JOINED)), "the sentence");
  assert.ok(!main(unsent).querySelector('[data-list="start-send"]'), "no card to prepare");
  assert.ok(main(await open(ACTION_PAGE, stepPlane("joined", "prepare", { action: ok(unsentAction) }))).querySelector('[data-list="start-send"]'), "control: the card");
  // an approved text not yet sent: the pick-up
  const approved = await open(ACTION_PAGE, stepPlane("invited", "send", { action: ok(unsentAction) }));
  assert.ok(text(approved).includes(W(NOT_JOINED)));
  assert.ok(!text(approved).includes(W("screen.action.pickup")), "no pick-up");
  assert.ok(text(await open(ACTION_PAGE, stepPlane("joined", "send", { action: ok(unsentAction) }))).includes(W("screen.action.pickup")), "control: the pick-up");
  // a sent filing: the way to keep it as the team's template
  const sent = await open(ACTION_PAGE, stepPlane("invited", "sent"));
  assert.ok(text(sent).includes(W(NOT_JOINED)));
  assert.ok(!main(sent).querySelector(`a[href="/app/start-send/${ACTION_ID}"]`), "no way to keep it as a template");
  assert.ok(main(await open(ACTION_PAGE, stepPlane("joined", "sent"))).querySelector(`a[href="/app/start-send/${ACTION_ID}"]`), "control: the way to keep it");
  // an action with nothing of the send steps to offer says nothing of joining (a reply owed, no filing)
  const quiet = await open(ACTION_PAGE, stepPlane("invited", "prepare"));
  assert.ok(!text(quiet).includes(W(NOT_JOINED)), "nothing is withheld, so nothing is said");
});

test("E9 (R30): on the Action dashboard an invited member is not offered the approval of a prepared text; she is given the action, where she is told; control: a joined member is", async () => {
  const plane = (state) => planeAt(state, { actions: ok({ ...ACTIONS, items: ACTIONS.items.slice(0, 1) }), filingsfor: () => ok(FILINGS([draft()])) });
  const invited = await open("/app/dash-action", plane("invited"));
  assert.ok(!button(invited, "filingapprove"), "no approval");
  assert.ok(main(invited).querySelector(`a[href="/app/action/${ACTION_ID}"]`), "the action opens");
  assert.ok(button(await open("/app/dash-action", plane("joined")), "filingapprove"), "control: a joined member approves here");
});

/* ---------- the door to accept, in place (G52, K4686) ---------- */

/** A plane whose `projectlist` answers `invited` until `projectjoin` is sent, then `joined`: the screen's own re-read shows the change. */
function joining(step, more = {}) {
  let place = "invited";
  const plane = stepPlane("invited", step, more);
  plane.projectlist = () => standing(place);
  plane.projectjoin = () => { place = "joined"; return ok({ ok: true }); };
  return plane;
}
const unsentAction = { ...ACTION, correspondence: [], entries: [] };
const SCREENS_AT = [
  ["start-send", STEP2, "prepare", {}, (p) => button(p, "communicationprepare")],
  ["request", REQUEST, "prepare", {}, (p) => button(p, "communicationprepare")],
  ["action", ACTION_PAGE, "prepare", { action: ok(unsentAction) }, (p) => main(p).querySelector('[data-list="start-send"]')],
];
for (const [id, path, step, more, offered] of SCREENS_AT) {
  test(`G52 (R3, R4, R5): on ${id}, an invited, not joined member presses Join in the fold; projectjoin is sent with the project, the screen reads her place again and offers the act; control: a joined member sees no fold`, async () => {
    const plane = joining(step, more);
    const p = await open(path, plane);
    told(p, id);
    assert.ok(!offered(p), `${id}: the act is not offered before the join`);
    await press(p, "projectjoin");
    const sent = last(p, "projectjoin");
    assert.equal(sent.query.projectId, PROJECT, `${id}: projectjoin is sent with the action's project`);
    assert.equal(p.requests.filter((r) => r.op === "projectjoin").length, 1, `${id}: sent once`);
    assert.ok(!main(p).querySelector("details[data-gap=join]"), `${id}: no fold once she has joined`);
    assert.ok(offered(p), `${id}: the act is offered after the join`);
    assert.equal(writes(p).length, 0, `${id}: joining sends no weighty act`);
    const member = await open(path, stepPlane("joined", step, more));
    assert.ok(!main(member).querySelector("details[data-gap=join]") && !button(member, "projectjoin"), `${id}: control: a joined member sees no fold and no Join`);
  });
}
