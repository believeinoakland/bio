/* wizard-scripts: approval and widening, editor grants, retirement and withdrawal (R7, R8, R9), at the module's
   interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, draft, approved, restart, V, MACHINE, STEPS, step, LIBRARY } from "./fixture.mjs";
import * as wz from "../../../src/wizard-scripts/index.mjs";

const A = V("alice"), B = V("bob"), F = V("frank"), E = V("erin"), D = V("dave");
const row = (c) => wz.WIZARD_SCRIPTS_CHECKS[c];
const refused = (r, c, why = "") => {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, c, c, row(c).check, row(c).translation], `${why} ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};
const read = (w, version, viewer = A) => w.wz.wizardRead({ version, viewer }).version;
const offered = (w, viewer = F) => w.wz.wizardsAt({ screen: "case-home", viewer }).scripts.map((s) => s.version);
const submitted = (w, x = {}) => { const d = draft(w, x); w.wz.wizardSubmit({ version: d.version, author: V(x.who ?? "frank"), viewer: V(x.who ?? "frank") }); return d; };

test("R7 wizardApprove: an owner of the script's project approves a submitted version with no review step; the previous approved version becomes updated, naming its successor, and is not offered", () => {
  const w = seeded();
  const d = submitted(w);
  w.clock.now = "2026-10-04T10:00:00Z";
  const a = w.wz.wizardApprove({ version: d.version, by: A, viewer: A });
  assert.deepEqual([a.ok, a.state, a.approved.by.id, a.approved.at, a.updated], [true, "approved", "alice", "2026-10-04T10:00:00Z", null]);
  assert.deepEqual(read(w, d.version).approved, { by: { id: "alice", name: "h_alice" }, at: "2026-10-04T10:00:00Z" });
  assert.deepEqual(offered(w).filter((v) => v.startsWith(d.script)), [d.version]);
  /* version 2 */
  const n2 = w.wz.wizardDraft({ from: d.version, author: F, viewer: F });
  w.wz.wizardRevise({ version: n2.version, steps: [STEPS[1], STEPS[0]], author: F, viewer: F });
  w.wz.wizardSubmit({ version: n2.version, author: F, viewer: F });
  const a2 = w.wz.wizardApprove({ version: n2.version, by: B, viewer: B });
  assert.deepEqual([a2.ok, a2.updated], [true, d.version]);
  const v1 = read(w, d.version);
  assert.deepEqual([v1.state, v1.updated_by], ["updated", n2.version]);
  assert.equal(w.wz.wizardRead({ version: d.version, viewer: A }).offered, false);
  assert.equal(w.wz.wizardRead({ script: d.script, viewer: A }).version.id, n2.version, "the default read is the latest approved");
  assert.ok(!offered(w).includes(d.version), "an updated version is not offered");
  assert.ok(w.wz.wizardsAt({ screen: "filing-draft", viewer: F }).scripts.some((s) => s.version === n2.version));
  assert.deepEqual(wz.WIZARD_STATES, ["draft", "submitted", "approved", "updated", "withdrawn"]);
});

test("R7 APPROVER_IS_AUTHOR: the sole author is refused; an author with a co-contributor (a member whose proposal the author adopted) is accepted; a machine's run is no member contributor", () => {
  const w = seeded();
  const d = submitted(w, { who: "alice" });
  refused(w.wz.wizardApprove({ version: d.version, by: A, viewer: A }), "APPROVER_IS_AUTHOR");
  assert.equal(w.wz.wizardApprove({ version: d.version, by: B, viewer: B }).ok, true, "another owner");
  /* a machine's proposal adopted: a run, not a member */
  const d2 = w.wz.wizardDraft({ from: d.version, author: A, viewer: A });
  const pm = w.wz.wizardPropose({ script: d.script, steps: [STEPS[0]], why: "w", proposer: MACHINE, viewer: MACHINE });
  w.wz.wizardRevise({ version: d2.version, adopt: pm.proposal.id, author: A, viewer: A });
  w.wz.wizardSubmit({ version: d2.version, author: A, viewer: A });
  refused(w.wz.wizardApprove({ version: d2.version, by: A, viewer: A }), "APPROVER_IS_AUTHOR", "a run is not a member contributor");
  w.wz.wizardRetire({ version: d2.version, reason: "redo", by: A, viewer: A });
  /* bob's proposal adopted: bob contributed */
  const d3 = w.wz.wizardDraft({ from: d.version, author: A, viewer: A });
  const pb = w.wz.wizardPropose({ script: d.script, steps: [STEPS[1]], why: "w", proposer: B, viewer: B });
  w.wz.wizardRevise({ version: d3.version, adopt: pb.proposal.id, author: A, viewer: A });
  assert.deepEqual(read(w, d3.version).contributors.map((c) => [c.kind, c.member ?? null, c.proposal ?? null]),
                   [["member", "alice", null], ["member", "bob", pb.proposal.id]]);
  w.wz.wizardSubmit({ version: d3.version, author: A, viewer: A });
  assert.equal(w.wz.wizardApprove({ version: d3.version, by: A, viewer: A }).ok, true, "the author with a co-contributor");
});

test("R7 widen: an administrator makes an approved project script group-wide, recorded with the administrator and instant, changing no version; then administrators approve its versions", () => {
  const w = seeded();
  const d = approved(w);
  const before = read(w, d.version);
  refused(w.wz.wizardApprove({ version: d.version, widen: true, by: A, viewer: A }), "NOT_AN_APPROVER", "an owner is not an administrator");
  w.clock.now = "2026-10-06T00:00:00Z";
  const r = w.wz.wizardApprove({ version: d.version, widen: true, by: E, viewer: E });
  assert.deepEqual([r.ok, r.existed, r.scope, r.widened.by.id, r.widened.at], [true, false, "group", "erin", "2026-10-06T00:00:00Z"]);
  assert.deepEqual(read(w, d.version, E), before);
  assert.equal(w.wz.wizardApprove({ version: d.version, widen: "true", by: E, viewer: E }).existed, true);
  assert.deepEqual(w.wz.wizardRead({ script: d.script, viewer: D }).script.scope, "group", "now seen by every member");
  const n2 = w.wz.wizardDraft({ from: d.version, author: F, viewer: F });
  w.wz.wizardSubmit({ version: n2.version, author: F, viewer: F });
  refused(w.wz.wizardApprove({ version: n2.version, by: A, viewer: A }), "NOT_AN_APPROVER", "a group-wide script's versions are administrators'");
  assert.equal(w.wz.wizardApprove({ version: n2.version, by: E, viewer: E }).ok, true);
});

test("R7 refusals in order: MACHINE_CANNOT_APPROVE_WIZARD, NO_SUCH_WIZARD, NOT_SUBMITTED (with widen WIZARD_NOT_APPROVED), NOT_AN_APPROVER, APPROVER_IS_AUTHOR, R12's refusals again", () => {
  const w = seeded();
  const d = draft(w, { who: "alice" });
  const ap = (x) => w.wz.wizardApprove({ version: d.version, by: A, viewer: A, ...x });
  for (const by of [MACHINE, "", null]) refused(ap({ by, version: "WIZ-2026-0000@1" }), "MACHINE_CANNOT_APPROVE_WIZARD");
  refused(ap({ version: "WIZ-2026-0000@1" }), "NO_SUCH_WIZARD");
  refused(ap({ by: D, viewer: D }), "NO_SUCH_WIZARD");
  refused(ap({ version: `${LIBRARY[0].id}@2` }), "WIZARD_NOT_THE_GROUPS");
  refused(ap({ by: F, viewer: F }), "NOT_SUBMITTED", "before the right");
  refused(ap({ widen: true, by: F, viewer: F }), "WIZARD_NOT_APPROVED");
  w.wz.wizardSubmit({ version: d.version, author: A, viewer: A });
  refused(ap({ by: F, viewer: F }), "NOT_AN_APPROVER", "frank is joined, not an owner");
  refused(ap({}), "APPROVER_IS_AUTHOR");
  /* R12 again: the instance restarts with a registry that no longer has the second step's screen */
  const d2 = submitted(w, { name: "Two screens" });
  const later = restart(w, { screens: [{ id: "case-home", acts: ["casenote", "casejoin"] }] });
  const r = refused(later.wizardApprove({ version: d2.version, by: A, viewer: A }), "WIZARD_SCREEN_UNKNOWN");
  assert.deepEqual([r.step, r.refusals.map((x) => [x.code, x.step])], [2, [["WIZARD_SCREEN_UNKNOWN", 2]]]);
  assert.equal(read(w, d2.version).state, "submitted", "nothing written");
});

test("R8 wizardEditorGrant and wizardEditorRevoke: an administrator grants and revokes, recorded under an opaque WEG- id with the administrator and instant; a revocation is appended; a second answers existed with the first; anyone else NOT_AN_ADMIN", () => {
  const w = seeded();
  for (const by of [A, F, MACHINE, "", null]) {
    const r = w.wz.wizardEditorGrant({ member: "frank", by });
    assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, "NOT_AN_ADMIN", "NOT_AN_ADMIN", "C-96.1"], String(by));
  }
  refused(w.wz.wizardEditorGrant({ member: "nobody", by: E }), "WIZARD_EDITOR_MEMBER_UNKNOWN");
  const g = w.wz.wizardEditorGrant({ member: "frank", by: E });
  assert.deepEqual([g.ok, g.existed, g.by.id, g.at, g.member.id], [true, false, "erin", "2026-10-03T12:00:00Z", "frank"]);
  assert.match(g.grant, /^WEG-\d{4}-\d{4}$/);
  assert.deepEqual(w.wz.wizardEditorGrant({ member: "member:frank", by: E }).grant, g.grant, "a live grant answers itself");
  for (const by of [A, MACHINE]) assert.equal(w.wz.wizardEditorRevoke({ grant: g.grant, by }).reason, "NOT_AN_ADMIN");
  refused(w.wz.wizardEditorRevoke({ grant: "WEG-2026-0000", by: E }), "WIZARD_NO_SUCH_GRANT");
  w.clock.now = "2026-10-07T00:00:00Z";
  const r1 = w.wz.wizardEditorRevoke({ grant: g.grant, by: E });
  assert.deepEqual([r1.ok, r1.existed, r1.revoked.at], [true, false, "2026-10-07T00:00:00Z"]);
  w.clock.now = "2026-10-08T00:00:00Z";
  assert.deepEqual(w.wz.wizardEditorRevoke({ grant: g.grant, by: E }), { ok: true, grant: g.grant, existed: true, revoked: r1.revoked });
  assert.deepEqual([w.count("wiz_editor_grants"), w.count("wiz_editor_revocations")], [1, 1], "appended, never deleted");
  const g2 = w.wz.wizardEditorGrant({ member: "frank", by: E });
  assert.notEqual(g2.grant, g.grant, "a new grant after revocation");
  assert.equal(w.wz.wizardDraft({ project: w.P, name: "Blank", author: F, viewer: F }).ok, true, "live");
});

test("R9 wizardRetire: without version an approver retires the whole script, none offered again and each version readable with the reason; with version its author withdraws a draft or submitted version", () => {
  const w = seeded();
  const d = approved(w);
  assert.ok(offered(w).includes(d.version));
  const r = w.wz.wizardRetire({ script: d.script, reason: "superseded", by: A, viewer: A });
  assert.deepEqual([r.ok, r.retired.by.id, r.retired.reason], [true, "alice", "superseded"]);
  assert.ok(!offered(w).includes(d.version));
  assert.deepEqual(read(w, d.version).ended, { ending: "retired", by: { id: "alice", name: "h_alice" }, at: "2026-10-03T12:00:00Z", reason: "superseded" });
  assert.equal(w.wz.wizardRead({ version: d.version, viewer: A }).offered, false);
  refused(w.wz.wizardRetire({ script: d.script, reason: "again", by: A, viewer: A }), "WIZARD_ALREADY_ENDED");
  refused(w.wz.wizardDraft({ from: d.version, author: F, viewer: F }), "WIZARD_ALREADY_ENDED", "no new version of a retired script");
  /* withdrawal */
  const d2 = draft(w, { name: "Other" });
  const s2 = submitted(w, { name: "Third" });
  for (const v of [d2.version, s2.version]) {
    const x = w.wz.wizardRetire({ version: v, reason: "not needed", by: F, viewer: F });
    assert.deepEqual([x.ok, x.state, x.withdrawn.reason], [true, "withdrawn", "not needed"]);
    assert.equal(read(w, v).state, "withdrawn");
  }
  assert.equal(w.count("wiz_scripts"), 3, "nothing deleted");
});

test("R9 refusals in order: MACHINE_CANNOT_APPROVE_WIZARD, NO_SUCH_WIZARD, WIZARD_NOT_THE_GROUPS (every write on a civicsmith script, R3–R9), NOT_AN_APPROVER (or WIZARD_SCOPE_REFUSED, NOT_A_DRAFT), WIZARD_REASON_REFUSED, WIZARD_ALREADY_ENDED", () => {
  const w = seeded();
  const d = approved(w);
  const ret = (x) => w.wz.wizardRetire({ script: d.script, reason: "r", by: A, viewer: A, ...x });
  for (const by of [MACHINE, "", null]) refused(ret({ by, script: "WIZ-2026-0000" }), "MACHINE_CANNOT_APPROVE_WIZARD");
  refused(ret({ script: "WIZ-2026-0000" }), "NO_SUCH_WIZARD");
  refused(ret({ by: D, viewer: D }), "NO_SUCH_WIZARD");
  refused(ret({ by: F, viewer: F, reason: "" }), "NOT_AN_APPROVER");
  for (const reason of ["", "x".repeat(501), null]) refused(ret({ reason }), "WIZARD_REASON_REFUSED");
  /* a civicsmith script: every write */
  const C = LIBRARY[0].id, CV = `${C}@2`;
  refused(ret({ script: C, by: E, viewer: E }), "WIZARD_NOT_THE_GROUPS");
  refused(ret({ script: null, version: CV, by: E, viewer: E }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardDraft({ from: CV, author: F, viewer: F }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardRevise({ version: CV, steps: STEPS, author: F, viewer: F }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardPropose({ script: C, steps: STEPS, why: "w", proposer: F, viewer: F }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardSubmit({ version: CV, author: F, viewer: F }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardApprove({ version: CV, by: E, viewer: E }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardApprove({ version: CV, widen: true, by: E, viewer: E }), "WIZARD_NOT_THE_GROUPS");
  /* withdrawal's own */
  refused(ret({ script: null, version: d.version, by: B, viewer: B }), "WIZARD_SCOPE_REFUSED", "anyone but the author");
  refused(ret({ script: null, version: d.version, by: F, viewer: F, reason: "" }), "NOT_A_DRAFT", "an approved version");
  const d2 = draft(w, { name: "Other" });
  refused(ret({ script: null, version: `${d2.script}@4`, by: F, viewer: F }), "NO_SUCH_WIZARD");
  w.wz.wizardRetire({ version: d2.version, reason: "first", by: F, viewer: F });
  refused(ret({ script: null, version: d2.version, by: F, viewer: F, reason: "" }), "WIZARD_REASON_REFUSED", "before already ended");
  const again = refused(ret({ script: null, version: d2.version, by: F, viewer: F, reason: "second" }), "WIZARD_ALREADY_ENDED");
  assert.equal(again.ended.reason, "first");
  /* a group-wide script is retired by an administrator */
  w.wz.wizardApprove({ version: d.version, widen: true, by: E, viewer: E });
  refused(ret({}), "NOT_AN_APPROVER");
  assert.equal(ret({ by: E, viewer: E }).ok, true);
});
