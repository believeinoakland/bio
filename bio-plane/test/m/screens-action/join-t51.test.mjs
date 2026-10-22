/* screens-action, fix round 5 (E9; Bob's K4557): a member invited to a project and not yet joined is told, at the start, that only members
   who have joined can draft, approve, send or keep what speaks for the team, and given the way to accept; the steps are not offered and then
   refused. The state is her own `participation` on the `projectlist` row of the action's project (project-roster R34), read with the screen's
   other reads. Every sentence is asserted by its key (R19). Three groups: the screens at their interface (scripted plane), the same member's
   whole path over the REAL membership and filings (`join-seam-t51.test.mjs`), and the door to accept in place (registry-bound, red by name
   until the registry lists `projectjoin` on these screens). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, button, last, ok, W, DATA_PLANE, ROSTER, PROJECT, ACTION_ID, ACTION, FILING, FILINGS, READ, draft, ACTIONS } from "./page.mjs";

const NOT_JOINED = "refusal.PROJECT_ACT_NOT_A_PARTICIPANT";
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

/** The sentence is drawn, the way to accept is the project's page (until the registry lists the door in place), no weighty act is drawn or sent. */
function told(p, what) {
  assert.ok(text(p).includes(W(NOT_JOINED)), `${what}: the held sentence`);
  assert.ok(main(p).querySelector(`a[href="/app/project/${PROJECT}"]`) || button(p, "projectjoin"), `${what}: the way to accept`);
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

/* ---------- the door to accept, in place: the registry-bound half (red by name until the registry lists `projectjoin` on these screens) ---------- */

test("E9 (R3): pressing 'Join' beside the sentence accepts the invitation in place, sends projectjoin for the action's project, and the steps appear", async () => {
  let state = "invited";
  const plane = { ...planeAt("invited", { filingsfor: () => ok(FILINGS([])) }), projectlist: () => ok({ ...ROSTER, projects: ROSTER.projects.map((r) => (r.id === PROJECT ? { ...r, participation: state } : r)) }),
    projectjoin: () => { state = "joined"; return ok({ ok: true }); } };
  const p = await open(STEP2, plane);
  assert.ok(button(p, "projectjoin"), "the door is drawn in place beside the held sentence (the registry lists `projectjoin` on start-send)");
  assert.ok(!button(p, "communicationprepare"));
  await press(p, "projectjoin");
  assert.deepEqual(last(p, "projectjoin").query, { projectId: PROJECT });
  assert.ok(button(p, "communicationprepare"), "joined: the steps are offered");
  assert.ok(!text(p).includes(W(NOT_JOINED)));
});
