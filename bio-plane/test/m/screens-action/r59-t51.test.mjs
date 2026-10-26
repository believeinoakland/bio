/* screens-action R59 (T51 fix round 10; DEC-439, DEC-440, DEC-441; K5303): the design's sentences drawn at their cases, by key. The cases this file
   holds are the law a team names itself (E H1b) and a resolved action's outcome (K12); the others are tested in the files named by their titles
   (R57 and R59 on Request's office, R56 and R59 on Plan's addressee, R41 and R59 on the risk door, R43/R48 and R59 on the sent step, R54 and R59 on the law list). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, last, ok, W, DATA_PLANE, ROUTES, ACTION, PROFILES, ACTION_ID } from "./page.mjs";

const NO_LAWS = ok({ ...PROFILES, view: { deadlines: [] } });

test("R59 (DEC-439 E H1b): a team whose places list no law for this kind says so and has the member name the law, its level and its citation; the named law is sent as the proposal", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, profiles: NO_LAWS, actionlawspropose: ok({}) });
  assert.ok(text(p).includes(W("screen.action.law.none")), "the sentence");
  assert.ok(text(p).includes(W("screen.action.law.level")) && text(p).includes(W("screen.action.law.citation")), "its two labels");
  await press(p, "actionlawspropose", { values: { "law-level": "county", "law-cite": " Admin. Code § 4.1 " } });
  assert.deepEqual(last(p, "actionlawspropose").body, { target: ACTION_ID, laws: [{ level: "county", citation: "Admin. Code § 4.1" }] });
  // control: a citation left empty is refused by sending nothing
  const q = await open(ROUTES.action, { ...DATA_PLANE, profiles: NO_LAWS, actionlawspropose: ok({}) });
  await press(q, "actionlawspropose", { values: { "law-level": "county", "law-cite": "  " } });
  assert.equal(q.byOp("actionlawspropose").length, 0, "nothing sent with no citation");
  // control: with laws the places list, the sentence is not drawn
  const r = await open(ROUTES.action, DATA_PLANE);
  assert.ok(!text(r).includes(W("screen.action.law.none")));
});

test("R59 (DEC-439 K12): a resolved action says how it was resolved, in the outcome's own sentence; control: an action not yet resolved says nothing of it", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, action: ok({ ...ACTION, current_state: "resolved", resolution: "complied" }) });
  assert.ok(text(p).includes(W("screen.action.resolution.said.complied")), "resolved: the office complied");
  const q = await open(ROUTES.action, { ...DATA_PLANE, action: ok({ ...ACTION, current_state: "active", resolution: null }) });
  for (const r of ["complied", "denied", "escalated", "withdrawn", "completed"]) assert.ok(!text(q).includes(W("screen.action.resolution.said." + r)), r);
});
