/* K3000 (SCREENS-DAILY #1): the members providers answer are stamped as the control plane stamps an author
   (`member:<id>`; the founder `member:admin` or `admin`), while queue passes this read a bare member id. Driven through
   the real action-clocks (its own test fixture: record-core, membership, promotion, actions real), whose reminders keep
   `set_by` and whose overdue entries keep `created_by` as stamped; every other provider a fake answering the stamped form.
   Each test names its ids, with the bare form as its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world as clocksWorld, V, CLK } from "../action-clocks/fixture.mjs";
import { actionProducersOf } from "../../../src/action-producers/index.mjs";
import { defaultFakes, ofKind, escalationsAnswer } from "./world.mjs";

const A = "ACTN-2026-0001-a";
function real() {
  const w = clocksWorld();
  /* an action alice created (its first manifest entry's author `member:alice`), one entry past, one ahead */
  w.action(A, ["clock:", ...CLK("2026-09-01"), ...CLK("2026-12-01")]);
  const F = defaultFakes();
  const p = actionProducersOf(w.host, { ...F, record: w.record, membership: w.membership, actions: w.actions, actionClocks: w.c });
  const read = (member) => p.actionItems({ member, viewer: `member:${String(member).replace(/^member:/, "")}`, now: w.clock.ms });
  return { w, F, read };
}

test("R4 (K3000): a reminder set through the real action-clocks (set_by stamped member:alice) is alice's item, read with the bare member id or the stamped one; nobody else's (control: bob)", () => {
  const { w, read } = real();
  assert.equal(w.c.reminderSet({ target: A, entry: 1, on: "2026-09-27", author: V("alice"), viewer: V("alice") }).ok, true);
  assert.equal(w.c.remindersDue({ nowMs: w.clock.ms, viewer: V("alice") }).items[0].set_by, "member:alice", "the provider keeps the stamp");
  for (const me of ["alice", "member:alice"]) {
    const it = ofKind(read(me), "action-reminder");
    assert.deepEqual(it.map((i) => i.id), [`OBLIGATION::action-reminder::${A}::1::2026-09-27`], me);
    assert.deepEqual(it[0].recipients, ["alice"], "the recipient is the bare member id, as queue reads it");
  }
  assert.deepEqual(ofKind(read("bob"), "action-reminder"), [], "control: another member is not told");
});

test("R1 (K3000): the creator of an action, as the real action-clocks answers it (created_by member:alice), receives its overdue item while an active member; bare and stamped alike (control: revoked, the item leaves her)", () => {
  const { w, read } = real();
  const e = w.c.overdueClocks({ viewer: V("alice"), now: w.clock.ms }).items[0];
  assert.equal(e.created_by, "member:alice", "the provider keeps the stamp");
  for (const me of ["alice", "member:alice"]) {
    const it = ofKind(read(me), "action-clock-overdue");
    assert.deepEqual(it.map((i) => i.id), [`CONDITION::action-clock-overdue::${A}::0`], me);
    assert.equal(it[0].basis.recipients_rule, "author");
    assert.deepEqual(it[0].recipients, ["alice"]);
  }
  w.st.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='alice'`);
  assert.deepEqual(ofKind(read("alice"), "action-clock-overdue"), [], "control: a revoked creator is passed over");
});

test("R1, R2, R3, R5, R6, R7, R8, R9, R10, R12 (K3000): every member a provider names in the stamped form (a take-up, a setter, an opener, a marker, a placer, a recipient, a pauser) is read as that member", () => {
  const { w, F, read } = real();
  w.st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, created, updated) VALUES ('ada', 'c', 'ada-h', 'admin', 'active', '2026-01-01', '2026-01-01')`);
  const now = w.clock.ms;
  const iso = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
  F.planWork.takeUpsFor = () => ({ ok: true, truncated: false, cursor: null, items: [{ take_up: 1, item: { kind: "clock", action: A, entry: 0 }, member: V("bob"), at: iso(now) }] });
  F.escalation.escalationsDue = () => escalationsAnswer({ id: A, project: null, opened_by: V("alice"), from: 1, to: 2, stage: "s", instant: iso(now), ids: [] });
  F.actionHolds.holdsDue = () => ({ ok: true, truncated: false, cursor: null, items: [{ action: A, ord: 0, note: "n", marked_by: V("alice"), marked_at: iso(now), project: null, arrived: { action: A, ord: 0 } }] });
  F.actionHolds.holdsReleased = () => ({ ok: true, truncated: false, cursor: null, items: [{ action: A, ord: 0, seq: 2, released_by: V("ada"), released_at: iso(now), reason: "r", placers: [V("alice")], restarted: [] }] });
  F.following.watchQuestions = () => ({ ok: true, cursor: null, questions: [{ link: 1, plan: "PLN-1", watch: { kind: "follow", id: "F" }, due_at: iso(now), cause: "closed", relied_on: false, offered: ["keep", "stop"], recipients: [V("alice")] }] });
  /* bob took the entry up (stamped): R1's item is his, not alice's */
  assert.deepEqual(ofKind(read("bob"), "action-clock-overdue").map((i) => i.basis.recipients_rule), ["took_up"]);
  assert.deepEqual(ofKind(read("alice"), "action-clock-overdue"), [], "control: the creator no longer, once bob took it up");
  const mine = read("alice");
  assert.deepEqual(ofKind(mine, "escalation-stage-proposed").map((i) => i.recipients), [["alice"]], "R3: the opener, stamped");
  assert.deepEqual(ofKind(mine, "litigation-hold").map((i) => i.recipients[1] ?? i.recipients[0]), ["alice"], "R5: the marker, stamped");
  assert.ok(ofKind(mine, "litigation-hold")[0].recipients.includes("ada"));
  assert.equal(ofKind(mine, "litigation-hold-released").length, 1, "R8: a placer, stamped");
  assert.deepEqual(ofKind(mine, "watch-keep-or-stop").map((i) => i.recipients), [["alice"]], "R10: a recipient, stamped");
  /* a project alice owns, for the plans' items (R14: a plan's project is one she sees) */
  w.st.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha) VALUES ('PROJ-S', 'project', 'g', 'S', 'forming', '2026-01-01', '2026-01-01', 'x')`);
  w.st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES ('PROJ-S', 'alice', 'joined', 1, '2026-01-01', '2026-01-01')`);
  /* R2, R12: a setter and a pauser, stamped; R6: the asked reviewer, stamped; R7: the action's creator, stamped */
  F.actionPlans.checkpointsDue = () => ({ ok: true, truncated: false, items: [{ plan: "PLN-1", project: "PROJ-S", scenario: 1, phase: "p", set_by: V("alice"), due: "2026-09-27" }] });
  F.actionPlans.plansToLookAgain = () => ({ ok: true, truncated: false, items: [{ plan: "PLN-2", project: "PROJ-S", look_again: "2026-09-28", paused_by: V("alice") }] });
  F.planWork.planReviewsDue = () => ({ ok: true, truncated: false, items: [{ plan: "PLN-3", project: "PROJ-S", member: V("alice"), due: "2026-09-28T09:00:00Z", day: "2026-09-28", zone: "UTC" }] });
  F.filingTemplates.reviewsRequested = () => ({ ok: true, truncated: false, cursor: null, items: [{ template: "TPL-a", version: "TPL-a@1", member: V("alice"), asked_by: { id: "ada" }, asked_at: iso(now) }] });
  w.c.calendarFactsRead = () => ({ ok: true, truncated: false, paths: [{ path: "profile:p/hours/clerk", actions: [{ action: A, project: null, created_by: V("alice") }] }] });
  F.localFacts.factsDue = () => ({ ok: true, unknown: [], absent: [], due: [{ path: "profile:p/hours/clerk", status: "unconfirmed", why: "w", due_from: "2026-09-01" }] });
  const more = read("alice");
  for (const k of ["plan-checkpoint-due", "plan-look-again", "plan-review-due", "template-review-requested", "local-fact-due"]) {
    assert.equal(ofKind(more, k).length, 1, `${k}: alice, named by her stamp`);
    assert.deepEqual(ofKind(more, k)[0].recipients, ["alice"], k);
  }
  
  F.actionPlans.checkpointsDue = () => ({ ok: true, truncated: false, items: [{ plan: "PLN-1", project: "PROJ-S", scenario: 1, phase: "p", set_by: "class:daemon", due: "2026-09-27" }] });
  assert.deepEqual(ofKind(read("alice"), "plan-checkpoint-due").map((i) => i.basis.recipients_rule), ["project_owners"],
    "control: a machine's stamp names no member, so the project's owner (alice, as owner) receives it");
  /* R9: bob, who took the entry up, leaves the group: the departure names his item, keyed by the bare member id */
  w.st.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='bob'`);
  assert.deepEqual(ofKind(read("ada"), "member-left-items").map((i) => i.id), ["FINDING::member-left-items::bob::none"]);
  assert.deepEqual(ofKind(read("bob"), "member-left-items"), [], "control: he himself is never told");
});
