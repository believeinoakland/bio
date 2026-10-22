/* screens-action, fix round 5 (E9; Bob's K4557; R-SEAM): the walker's case over the REAL providers, never a scripted double of one. The member
   `quinn` is invited to the project of an action and has not joined (membership's own `projectInvite`); her place is the `participation` that
   project-roster's `projectlist` answers; the plane is the real filings, actions, entities, filing-templates, membership and project-roster,
   each op answered by its owner as the door calls it (`real.mjs`). She opens the action's send screen and is told; nothing is drafted; she
   follows the reference to the project's page and joins (the op the page's "Join" sends, `projectjoin`, answered by the real membership);
   she returns, and drafts, approves, records the sending and keeps the template, all of which the real filings and filing-templates store. */
import test from "node:test";
import assert from "node:assert/strict";
import { main, text, press, button, last, ok, W, PROJECTS } from "./page.mjs";
import { realWorld, realPlane, profilesOf, open, until, V } from "./real.mjs";

const NOT_JOINED = "refusal.PROJECT_ACT_NOT_A_PARTICIPANT";

/** The world: `quinn` invited to the project and not joined, an action of the project, the plane as `quinn` sees it. */
function inviteWorld() {
  const x = realWorld();
  const inv = x.w.membership.projectInvite({ projectId: x.proj, handle: "h_quinn", by: "olive", viewer: V("olive") });
  if (inv && inv.ok === false) throw new Error(`invite refused: ${JSON.stringify(inv).slice(0, 300)}`);
  const id = x.action({ kind: "records_request", risk_tier: 1, project: x.proj, legs: [], clock: [],
    counterparty: { state: "named", role: "Records Office", body: "Port Ellery", level: "city" }, laws: [{ level: "city", citation: "P.E.B.L. § 4" }] });
  const plane = realPlane(x, V("quinn"), { profiles: profilesOf("oakland-alameda"), peopledirectory: ok({ rows: [], truncated: false }),
    list: ok({ bundles: [{ bundle_id: x.proj, object_type: "project", title: "Parks" }], limit: 500, cursor: null, total: 1 }) }, { roster: true });
  return { x, id, plane };
}
const drafts = (x, id) => x.rows("SELECT COUNT(*) AS n FROM communication_drafts WHERE action_id = ?", id)[0].n;

test("E9 (R3, R4, R48): the walker's case over the real providers: the invited member opens the action's send screen and is told, nothing is drafted; she follows the reference, joins, returns, and the steps work to the template", async () => {
  const { x, id, plane } = inviteWorld();
  // the state the screens read is the real roster's: invited, then joined
  assert.equal(x.roster.projectList({ viewer: V("quinn") }).projects.find((r) => r.id === x.proj).participation, "invited");
  const p = await open(`/app/start-send/${id}`, plane);
  assert.ok(text(p).includes(W(NOT_JOINED)), "the held sentence");
  for (const op of ["communicationprepare", "filingprepare", "filingapprove", "filingrecordsent", "templatesave"]) assert.ok(!button(p, op), `no ${op}`);
  const ref = main(p).querySelector(`a[href="/app/project/${x.proj}"]`);
  assert.ok(ref && ref.textContent.includes("Parks"), "the way to accept: the project's page");
  assert.equal(drafts(x, id), 0, "nothing was drafted");
  // the same on the request screen
  const req = await open(`/app/request/${id}`, plane);
  assert.ok(text(req).includes(W(NOT_JOINED)) && !button(req, "communicationprepare"), "request: told, no draft step");
  // she presses "Join" on the project's page: the op it sends, answered by the real membership
  const joined = await plane.projectjoin({ url: `/api/?op=projectjoin&projectId=${x.proj}`, query: { projectId: x.proj }, body: null });
  assert.equal(joined.json.result.ok !== false, true, JSON.stringify(joined.json.result).slice(0, 200));
  assert.equal(x.roster.projectList({ viewer: V("quinn") }).projects.find((r) => r.id === x.proj).participation, "joined");
  // she returns: the steps are offered and work, end to end, over the real filings and filing-templates
  const back = await open(`/app/start-send/${id}`, plane);
  assert.ok(!text(back).includes(W(NOT_JOINED)), "no sentence once joined");
  await press(back, "communicationprepare", { values: { "send-text-0": "Please send me the Records Office's logs for 2025." }, reason: "ready" });
  await until(back, () => button(back, "filingapprove"), "the prepared text to be drawn for approval");
  assert.equal(drafts(x, id), 1, "stored by the real filings");
  await press(back, "filingapprove", { reason: "ready", confirm: true });
  await until(back, () => button(back, "filingrecordsent"), "the send step");
  await press(back, "filingrecordsent", { values: { "send-at": "2026-10-20", "send-account": "through the portal", "send-reference": "26-0001" }, reason: "sent" });
  await until(back, () => button(back, "templatesave"), "the form to keep the template");
  await press(back, "templatesave", { values: { "template-name": "A records request", "template-use": "file" }, reason: "keep" });
  await until(back, () => x.rows("SELECT name FROM tpl_templates").length === 1, "the template to be kept");
  assert.deepEqual(x.rows("SELECT name, project FROM tpl_templates"), [{ name: "A records request", project: x.proj }], "kept by the real filing-templates, in the project");
  assert.equal(last(back, "templatesave").body.project, x.proj);
});

test("E9 (K4557; FILINGS #27, filings R-join): the real filings refuses the invited member's draft with membership's code, so the screen's start is the same rule as the plane's (red by name until FILINGS #27 merges)", async () => {
  const { x, id, plane } = inviteWorld();
  const r = await plane.communicationprepare({ url: `/api/?op=communicationprepare`, query: {}, body: { action: id, purpose: "request", text: "Please send me the logs." } });
  const out = r.json.result;
  assert.equal(out.ok, false, "refused");
  assert.equal(out.code || out.reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(drafts(x, id), 0, "nothing stored");
});
