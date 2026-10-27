/* T45-2 (N893; Actions D4; v0.2 rule 15): R128 `registerProjectActGuard`, the one guard R32 (`projectInvite`) and R45
   (`projectVisibilitySet`) ask inside their act, after their own refusals and before any write; its fail-closed refusal
   PROJECT_GUARD_UNCHECKED and its row. Every test drives the module at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

const P = "PROJ-2026-0001-guarded";

/* A group with `ann` owning P (hidden, as created), `bob` and `cal` active members outside it; the two notices R116 and
   R117 recorded, so a test sees whether the act went on to them. */
async function setup({ guard } = {}) {
  const w = await world().group("ann", "bob", "cal");
  w.project(P);
  assert.equal(w.m.projectClaimOwner({ projectId: P, memberId: "ann" }).ok, true);
  w.calls = [];
  w.heard = { invited: [], hidden: [] };
  assert.equal(w.m.onProjectInvited("project-roster", (n) => { w.heard.invited.push(n); return 0; }).ok, true);
  assert.equal(w.m.onProjectHidden("project-roster", (n) => { w.heard.hidden.push(n); return 0; }).ok, true);
  if (guard) assert.deepEqual(w.m.registerProjectActGuard("project-roster", (a) => { w.calls.push(a); return guard(a); }),
    { ok: true, module: "project-roster" });
  /* Everything either act could write: the participation rows, the visibility log and the sight index. */
  w.state = () => JSON.stringify([
    w.rows(`SELECT * FROM project_participants ORDER BY project_id, member_id`),
    w.rows(`SELECT * FROM project_visibility ORDER BY seq`),
    w.rows(`SELECT * FROM project_sight ORDER BY project_id`)]);
  return w;
}

const invite = (w, handle = "bob") => w.m.projectInvite({ projectId: P, handle, by: "ann", viewer: V("ann") });
const visibility = (w, setting = "discoverable") =>
  w.m.projectVisibilitySet({ projectId: P, setting, reason: "why", by: "ann", viewer: V("ann") });

test("R128 control: with no guard registered, R32's invitation and R45's setting proceed as before", async () => {
  const w = await setup();
  assert.deepEqual(invite(w), { ok: true, projectId: P, handle: "bob", state: "invited" });
  assert.deepEqual(w.m.participation(P, "bob"), { state: "invited", owner: false });
  assert.equal(w.heard.invited.length, 1);
  const d = visibility(w);
  assert.equal(d.ok, true);
  assert.equal(d.setting, "discoverable");
  assert.equal(w.m.visibilityOf(P), "discoverable");
  const h = visibility(w, "hidden");
  assert.equal(h.ok, true);
  assert.equal(h.requests_lapsed, 0);
  assert.equal(w.heard.hidden.length, 1);
});

test("R128 a guard's refusal of each act is answered unchanged and nothing is written; the guard is asked with {act, projectId, by, setting?}", async () => {
  const refusal = { ok: false, reason: "PROJECT_SCOPE_OWN", code: "PROJECT_SCOPE_OWN", check: "C-0.0", detail: "a rule",
                    nested: { kept: [1, 2] } };
  const w = await setup({ guard: () => refusal });
  const before = w.state();
  const i = invite(w);
  assert.equal(i, refusal, "the guard's own answer, the same object, unchanged");
  assert.deepEqual(i, { ok: false, reason: "PROJECT_SCOPE_OWN", code: "PROJECT_SCOPE_OWN", check: "C-0.0",
                        detail: "a rule", nested: { kept: [1, 2] } });
  assert.deepEqual(w.calls, [{ act: "invite", projectId: P, by: "ann" }], "no `setting` for an invitation");
  for (const setting of ["discoverable", "hidden"]) {
    w.calls.length = 0;
    assert.equal(visibility(w, setting), refusal);
    assert.deepEqual(w.calls, [{ act: "visibility", projectId: P, by: "ann", setting }]);
  }
  assert.equal(w.state(), before, "no participation, visibility record or sight index row written");
  assert.deepEqual(w.heard, { invited: [], hidden: [] }, "neither act reached its notice");
  assert.equal(w.m.participation(P, "bob"), null);
  assert.equal(w.m.visibilityOf(P), "hidden");
});

test("R128 a guard answering null lets each act proceed, as with none registered", async () => {
  const w = await setup({ guard: () => null });
  assert.deepEqual(invite(w), { ok: true, projectId: P, handle: "bob", state: "invited" });
  assert.equal(visibility(w).ok, true);
  assert.equal(w.m.visibilityOf(P), "discoverable");
  assert.equal(visibility(w, "hidden").requests_lapsed, 0);
  assert.deepEqual(w.calls.map((c) => c.act), ["invite", "visibility", "visibility"]);
  assert.equal(w.heard.invited.length, 1);
  assert.equal(w.heard.hidden.length, 1);
});

test("R128 the guard is asked after each act's own refusals: an act its own rule refuses never reaches it", async () => {
  const w = await setup({ guard: () => ({ ok: false, reason: "GUARD_SAID_NO" }) });
  await w.enrol("dee");
  assert.equal(w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" }).ok, true);
  w.bundle("INFO-2026-0001-not-a-project");
  w.project("PROJ-2026-0002-hidden-other");
  /* R32's own refusals, in its order: sight (absent, unseen), not a project, not the owner, the handle's */
  assert.equal(w.m.projectInvite({ projectId: "PROJ-2026-0009-absent", handle: "bob", by: "ann", viewer: V("ann") }).reason,
    "NO_SUCH_PROJECT");
  assert.equal(w.m.projectInvite({ projectId: "PROJ-2026-0002-hidden-other", handle: "bob", by: "bob", viewer: V("bob") })
    .reason, "NO_SUCH_PROJECT");
  assert.equal(w.m.projectInvite({ projectId: "INFO-2026-0001-not-a-project", handle: "bob", by: "ann" }).reason,
    "NOT_A_PROJECT");
  assert.equal(w.m.projectInvite({ projectId: P, handle: "cal", by: "bob" }).reason, "NOT_THE_OWNER");
  assert.equal(invite(w, "nobody-here").reason, "NO_SUCH_HANDLE");
  assert.equal(invite(w, "dee").reason, "NOT_ACTIVE");
  assert.equal(invite(w, "ann").reason, "ALREADY_A_PARTICIPANT");
  /* R45's own refusals: sight, not a project, not the owner, an unknown setting */
  assert.equal(w.m.projectVisibilitySet({ projectId: "PROJ-2026-0009-absent", setting: "hidden", by: "ann", viewer: V("ann") })
    .reason, "NO_SUCH_PROJECT");
  assert.equal(w.m.projectVisibilitySet({ projectId: "INFO-2026-0001-not-a-project", setting: "hidden", by: "ann" }).reason,
    "NOT_A_PROJECT");
  assert.equal(w.m.projectVisibilitySet({ projectId: P, setting: "hidden", by: "bob" }).code,
    "PROJECT_VISIBILITY_NOT_THE_OWNER");
  assert.equal(visibility(w, "public").code, "PROJECT_VISIBILITY_UNKNOWN_SETTING");
  assert.deepEqual(w.calls, [], "the guard was asked by none of them");
  /* and an act past its own refusals is asked */
  assert.equal(invite(w).reason, "GUARD_SAID_NO");
  assert.equal(visibility(w).reason, "GUARD_SAID_NO");
  assert.deepEqual(w.calls.map((c) => c.act), ["invite", "visibility"]);
});

test("R128 a guard that throws, answers a promise or anything but null or a refusal refuses PROJECT_GUARD_UNCHECKED (C-56.6), fail closed, writing nothing", async () => {
  const answers = [
    ["throws", () => { throw new Error("roster unreadable"); }],
    ["a promise", () => Promise.resolve(null)],
    ["a rejected promise", () => Promise.reject(new Error("later"))],
    ["undefined", () => undefined],
    ["false", () => false],
    ["a string", () => "no"],
    ["an acceptance", () => ({ ok: true })],
    ["a refusal without a reason", () => ({ ok: false })],
    ["a refusal with an empty reason", () => ({ ok: false, reason: "" })], // fixtures-generic: EMPTY_REASON
    ["an array", () => [{ ok: false, reason: "X" }]], // fixtures-generic: X
  ];
  const row = MEMBERSHIP_CHECKS.PROJECT_GUARD_UNCHECKED;
  for (const [what, fn] of answers) {
    const w = await setup({ guard: fn });
    const before = w.state();
    for (const [act, run] of [["invite", () => invite(w)], ["visibility", () => visibility(w)],
                              ["visibility", () => visibility(w, "hidden")]]) {
      const r = run();
      assert.equal(r.ok, false, `${what}: ${act}`);
      assert.equal(r.reason, "PROJECT_GUARD_UNCHECKED", `${what}: ${act}`);
      assert.equal(r.code, "PROJECT_GUARD_UNCHECKED");
      assert.equal(r.check, "C-56.6");
      assert.equal(r.translation, row.translation);
      assert.equal(r.project, P);
      assert.equal(r.act, act);
      assert.match(r.detail, /could not be read.*Nothing was written\.$/);
    }
    assert.equal(w.state(), before, `${what}: nothing written`);
    assert.deepEqual(w.heard, { invited: [], hidden: [] }, `${what}: no notice`);
  }
  /* a rejected promise is not left unhandled (the process would warn): give the microtasks a turn */
  await new Promise((r) => setImmediate(r));
});

test("R128 registerProjectActGuard: one registration whoever makes it, LISTENER_MALFORMED and LISTENER_DECLARED through R81; the first stands", async () => {
  const w = await setup();
  const mal = w.m.registerProjectActGuard("project-roster", "not a function");
  assert.equal(mal.code, "LISTENER_MALFORMED");
  assert.equal(mal.check, MEMBERSHIP_CHECKS.LISTENER_MALFORMED.check);
  assert.equal(mal.translation, MEMBERSHIP_CHECKS.LISTENER_MALFORMED.translation);
  assert.equal(w.m.registerProjectActGuard("", () => null).code, "LISTENER_MALFORMED");
  assert.equal(w.m.registerProjectActGuard(null, () => null).code, "LISTENER_MALFORMED");
  /* a malformed registration registers nothing: the acts still proceed unguarded */
  assert.equal(invite(w).ok, true);
  const first = [];
  assert.deepEqual(w.m.registerProjectActGuard("project-roster", (a) => { first.push(a.act); return { ok: false, reason: "FIRST" }; }),
    { ok: true, module: "project-roster" });
  for (const m of ["project-roster", "promotion", "actions"]) {
    const d = w.m.registerProjectActGuard(m, () => null);
    assert.equal(d.ok, false, m);
    assert.equal(d.code, "LISTENER_DECLARED", m);
    assert.equal(d.module, "project-roster", `${m}: names the holder`);
    assert.equal(d.check, MEMBERSHIP_CHECKS.LISTENER_DECLARED.check);
    assert.equal(d.translation, MEMBERSHIP_CHECKS.LISTENER_DECLARED.translation);
  }
  assert.equal(invite(w, "cal").reason, "FIRST", "the first registration still answers");
  assert.deepEqual(first, ["invite"]);
});

test("R128 the ops reach the guard: op=projectinvite and op=projectvisibilityset answer its refusal", async () => {
  const w = await setup({ guard: () => ({ ok: false, reason: "GUARD_SAID_NO" }) });
  const i = await w.ops(`projectId=${P}&handle=bob&by=ann&viewer=member:ann`).projectinvite();
  assert.equal(i.reason, "GUARD_SAID_NO");
  const v = await w.ops(`projectId=${P}&setting=discoverable&by=ann&viewer=member:ann`).projectvisibilityset();
  assert.equal(v.reason, "GUARD_SAID_NO");
  assert.deepEqual(w.calls, [{ act: "invite", projectId: P, by: "ann" },
                             { act: "visibility", projectId: P, by: "ann", setting: "discoverable" }]);
});

test("R128 R112 PROJECT_GUARD_UNCHECKED is this module's row C-56.6, minted at its one region, its words naming no plane, server, copy or instance", () => {
  const row = MEMBERSHIP_CHECKS.PROJECT_GUARD_UNCHECKED;
  assert.equal(row.check, "C-56.6");
  assert.equal(row.where, "src/membership/index.mjs #projectActGuarded > is-project-guard-checked");
  assert.ok(Object.isFrozen(row));
  assert.ok(row.translation.length > 20);
  for (const word of [/\bplane\b/i, /\bserver\b/i, /\bcopy\b/i, /\binstance\b/i])
    assert.doesNotMatch(row.translation, word);
  /* one code, one row: no other row of this module's tables holds C-56.6 */
  const held = Object.entries(MEMBERSHIP_CHECKS).filter(([, r]) => r.check === "C-56.6").map(([k]) => k);
  assert.deepEqual(held, ["PROJECT_GUARD_UNCHECKED"]);
});
