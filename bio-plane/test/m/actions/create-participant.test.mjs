/* actions R47 (promotion R53; G74): `actionCreate` is the same write as a promotion of an action document, so a member who is
   neither in the project it names nor invited to it is refused promotion's PROMOTE_NOT_A_PARTICIPANT, and nothing is written. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CP } from "./fixture.mjs";

const projectMd = ["---", "object_type: project", "title: Contract records", "current_state: forming",
  'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "A project.", ""].join("\n");
let PROJECT = null;
const actionDoc = () => actionMd("ACTN-2026-0000-new", [...CP, "action_kind: records_request", `project: ${PROJECT}`]);

function setup() {
  const w = world();
  const made = w.promotion.promote({ base: null, snapKey: "p1", author: V("owner"), ownerMemberId: "owner",
    files: [{ path: "bundle.md", text: projectMd }], meta: { object_type: "project" } });
  assert.equal(made.ok, true, JSON.stringify(made).slice(0, 300));
  PROJECT = made.bundleId;
  assert.equal(w.membership.participationWrite("rescue", { projectId: PROJECT, memberId: "joined" }), true);
  assert.equal(w.membership.participationWrite("invite", { projectId: PROJECT, memberId: "invitee", by: "owner" }), true);
  return w;
}
const bundles = (w) => w.rows(`SELECT bundle_id FROM bundles WHERE object_type='action' ORDER BY bundle_id`).map((r) => r.bundle_id);
const create = (w, who) => w.a.actionCreate({ document: actionDoc(), viewer: who ? V(who) : null, author: who ? V(who) : null });

test("R47 actionCreate of an action into a project by a member who is neither in it nor invited is refused PROMOTE_NOT_A_PARTICIPANT and writes nothing", () => {
  const w = setup();
  const before = bundles(w);
  const r = create(w, "stranger");
  assert.equal(r.ok, false);
  assert.equal(r.reason, "PROMOTE_NOT_A_PARTICIPANT");
  assert.deepEqual(bundles(w), before);
});

test("R47 control: a participant and an invited member create the action in the project", () => {
  const w = setup();
  for (const who of ["joined", "invitee", "owner"]) {
    const r = create(w, who);
    assert.equal(r.ok, true, `${who}: ${JSON.stringify(r).slice(0, 300)}`);
  }
  assert.equal(bundles(w).length, 3);
});

test("R47 control: the machine path (no member) is not asked", () => {
  const w = setup();
  const r = w.a.actionCreate({ document: actionDoc(), viewer: "class:daemon", author: "class:daemon" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
});
