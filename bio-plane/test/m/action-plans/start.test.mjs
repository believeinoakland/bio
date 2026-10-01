/* action-plans R18, R20, R21, R29: starting a chosen option as an action, its reminders, closing a plan, and the
   project's kind of work. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, option, choose, V, MACHINE, by, OFFICE, ms, DAY } from "./fixture.mjs";

const code = (r) => r.code ?? r.reason;
const start = (w, opt, extra = {}) => w.ap.optionStart({ plan: w.PL, option: opt, kind: "other", ...by("bob"), ...extra });
const DATES = [{ date: "2026-11-01", basis: "the records statute, ten days" }, { date: "2026-12-01", basis: "the order of 2026" }];

test("R18: a chosen option starts an action carrying its addressee, dated clock entries with bases, legs, plan, option and contact", () => {
  const w = seeded();
  opened(w);
  const a = option(w, { subjects: [w.SI, w.S1], addressee: OFFICE, dates: DATES });
  assert.equal(code(start(w, a)), "OPTION_NOT_CHOSEN");
  assert.equal(code(start(w, a, { author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_START");
  assert.equal(code(start(w, a, { plan: "PLN-2026-0999-plan" })), "NO_SUCH_PLAN");
  assert.equal(code(start(w, "opt-99")), "NO_SUCH_OPTION");
  choose(w, [a]);
  const nobody = start(w, a, { contact: "nobody" });
  assert.equal(code(nobody), "CONTACT_NOT_A_MEMBER"); assert.ok(nobody.check && nobody.translation);
  assert.equal(code(start(w, a, { kind: "summon_dragons" })), "ACTION_KIND_UNKNOWN", "the action's write refusal passes through");
  assert.equal(w.count("bundles WHERE object_type='action'"), 0, "a refused start writes no action");
  const r = start(w, a, { contact: "alice" });
  assert.equal(r.ok, true, JSON.stringify(r));
  const fm = w.fm(r.action);
  assert.equal(fm.object_type, "action"); assert.equal(fm.action_kind, "other");
  assert.equal(fm.counterparty.role, OFFICE.role); assert.equal(fm.counterparty.body, OFFICE.body);
  assert.deepEqual(fm.clock.map((c) => [c.date, c.basis, c.status]), DATES.map((d) => [d.date, d.basis, "pending"]));
  assert.deepEqual(fm.action_basis.map((l) => [l.target, l.kind]), [[w.I, "rests_on"], [w.D, "rests_on"]]);
  assert.equal(fm.plan, w.PL); assert.equal(fm.option, a); assert.equal(fm.contact, "alice");
  assert.equal(fm.breach, undefined);
  const read = w.ap.planRead({ id: w.PL, viewer: V("bob") });
  assert.equal(read.options[0].action.id, r.action);
  assert.equal(code(start(w, a)), "OPTION_STARTED");
  assert.equal(start(w, a).action, r.action);
  /* the plan never opens, advances or ends an escalation */
  assert.equal(w.count("bundles WHERE object_type='escalation'"), 0);
});

test("R18: a breach action on an inquiry-only subject is refused by actions R8, unless the member states an override, which the action discloses", () => {
  const w = seeded();
  opened(w);
  const a = option(w, { subjects: [w.SI], addressee: OFFICE });
  choose(w, [a]);
  const refused = start(w, a, { breach: true });
  assert.equal(code(refused), "ACTION_NO_DETERMINATION");
  assert.equal(w.count("bundles WHERE object_type='action'"), 0);
  const r = start(w, a, { breach: true, premise_override: { reason: "The harm is ongoing and the hearing is next week" } });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(w.fm(r.action).breach, true);
  assert.equal(w.fm(r.action).premise_override.reason, "The harm is ongoing and the hearing is next week");
  /* on a live noncompliant determination, a breach action needs no override */
  const b = option(w, { subjects: [w.S1], addressee: OFFICE });
  choose(w, [b]);
  assert.equal(start(w, b, { breach: true }).ok, true);
});

test("R29: choosing a dated option holds the member's reminders, set on the action R18 creates in action-clocks' table, by the chooser", () => {
  const w = seeded();
  opened(w);
  const a = option(w, { dates: DATES });
  const none = option(w, { summary: "No reminders", dates: DATES });
  const refusedChoice = (rem, extra = {}) => w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "chosen", reminders: rem, ...by("bob"), ...extra });
  assert.equal(code(refusedChoice([{ date: "2026-11-02", on: "2026-10-30" }])), "REMINDER_REFUSED", "naming no date of the option");
  assert.equal(code(refusedChoice([{ date: "2026-11-01", on: "soon" }])), "REMINDER_REFUSED", "a day that is not a date");
  assert.equal(code(w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "declined", reason: "r",
    reminders: [{ date: "2026-11-01", on: "2026-10-30" }], ...by("bob") })), "REMINDER_REFUSED");
  assert.equal(w.ap.planRead({ id: w.PL, viewer: V("bob") }).options[0].disposition, "open", "the whole act refused with it");
  assert.equal(code(w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "chosen", reminders: [{ date: "2026-11-01", on: "2026-10-30" }],
    author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_DISPOSE", "a machine setting reminders refuses");
  const c = w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "chosen",
    reminders: [{ date: "2026-11-01", on: "2026-10-25" }, { date: "2026-12-01", on: "2026-11-20" }], ...by("alice") });
  assert.equal(c.ok, true);
  choose(w, [none], { reminders: [] });
  assert.deepEqual(w.ap.planRead({ id: w.PL, viewer: V("bob") }).options[0].reminders,
    [{ date: "2026-11-01", on: "2026-10-25" }, { date: "2026-12-01", on: "2026-11-20" }]);
  assert.equal(w.count("action_reminders"), 0, "nothing is set before the action exists");
  const s = start(w, a);
  assert.equal(s.ok, true);
  const rows = w.rows(`SELECT bundle_id, entry, day, set_by FROM action_reminders ORDER BY entry`);
  assert.deepEqual(rows.map((r) => [r.bundle_id, r.entry, r.day, r.set_by]),
    [[s.action, 0, "2026-10-25", V("alice")], [s.action, 1, "2026-11-20", V("alice")]], "the choosing member is their author");
  assert.equal("reminders" in (w.fm(s.action) || {}), false, "never a field of the action's document");
  /* fires as asked (action-clocks R5), and nothing reminds where the member set none */
  const due = w.clocks.remindersDue({ nowMs: ms("2026-10-26T00:00:00Z"), viewer: MACHINE });
  assert.deepEqual(due.items.map((i) => [i.action, i.ord]), [[s.action, 0]]);
  const s2 = start(w, none);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_reminders WHERE bundle_id=?`, s2.action)[0].n, 0);
  /* a reminder action-clocks refuses at the start leaves neither the action nor the link */
  const w2 = seeded();
  opened(w2);
  const x = option(w2, { dates: DATES });
  choose(w2, [x], { reminders: [{ date: "2026-11-01", on: "2026-10-25" }] });
  w2.st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated) VALUES ('m2','c','h','member','active','[]','t','t')`);
  const before = w2.count("bundles WHERE object_type='action'");
  const orig = w2.clocks.reminderSet.bind(w2.clocks);
  w2.clocks.reminderSet = (a) => ({ ok: false, reason: "REMINDER_REFUSED", code: "REMINDER_REFUSED" });
  assert.equal(code(start(w2, x)), "REMINDER_REFUSED");
  assert.equal(w2.count("bundles WHERE object_type='action'"), before);
  assert.equal(w2.ap.planRead({ id: w2.PL, viewer: V("bob") }).options[0].action, null);
  w2.clocks.reminderSet = orig;
  assert.equal(start(w2, x).ok, true);
});

test("R20: a member closes a plan with a reason; it stays readable; its subjects join a new plan; nothing closes it by itself", () => {
  const w = seeded();
  opened(w);
  const a = option(w);
  choose(w, [a]);
  const s = start(w, a);
  assert.equal(code(w.ap.planClose({ id: w.PL, ...by("bob") })), "PLAN_NO_REASON");
  assert.equal(code(w.ap.planClose({ id: w.PL, reason: "done", author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_CLOSE_PLAN");
  assert.equal(code(w.ap.planClose({ id: w.PL, reason: "done", ...by("carol") })), "PROJECT_ACT_NOT_A_PARTICIPANT");
  /* a year passes: still open */
  w.clock.now = "2027-10-02T00:00:00Z";
  assert.equal(w.ap.planRead({ id: w.PL, viewer: V("bob") }).state, "open");
  assert.equal(w.ap.checkpointsDue({ nowMs: ms(w.clock.now) }).ok, true);
  assert.equal(w.ap.planRead({ id: w.PL, viewer: V("bob") }).state, "open");
  const actionBefore = JSON.stringify(w.fm(s.action));
  const c = w.ap.planClose({ id: w.PL, reason: "We are done", ...by("bob") });
  assert.equal(c.ok, true); assert.equal(c.state, "closed");
  const r = w.ap.planRead({ id: w.PL, viewer: V("bob") });
  assert.equal(r.state, "closed"); assert.deepEqual(r.closed, { by: V("bob"), at: w.clock.now, reason: "We are done" });
  assert.equal(w.record.head(w.PL).currentState, "closed");
  assert.equal(JSON.stringify(w.fm(s.action)), actionBefore, "closing changes no action");
  assert.equal(code(w.ap.planClose({ id: w.PL, reason: "again", ...by("bob") })), "PLAN_CLOSED");
  assert.equal(w.ap.planOpen({ project: w.P, subjects: [w.SI, w.S1], title: "Second", ...by("bob") }).ok, true);
});

test("R21: an owner sets work_kinds; planRead shows them; an unknown kind, a machine or a non-owner is refused; they gate nothing", async () => {
  const w = seeded();
  opened(w);
  assert.deepEqual(w.ap.planRead({ id: w.PL, viewer: V("bob") }).work_kinds.state, "undetermined");
  assert.equal(code(w.reviseProject(w.P, "Budget watch", ["work_kinds: [reporting, lobbying]"], V("alice"))), "WORK_KIND_UNKNOWN");
  assert.equal(code(w.reviseProject(w.P, "Budget watch", ["work_kinds: [reporting]"], MACHINE)), "MACHINE_CANNOT_SET_WORK_KIND");
  assert.equal(code(w.reviseProject(w.P, "Budget watch", ["work_kinds: [reporting]"], V("bob"))), "PROJECT_ACT_NOT_THE_OWNER");
  const p0 = await w.ap.optionPropose({ plan: w.PL, summary: "Before", category: "other", subjects: [w.S1], why: "w", proposer: V("bob"), viewer: V("bob") });
  assert.equal(w.reviseProject(w.P, "Budget watch", ["work_kinds: [reporting]"], V("alice")).ok, true);
  assert.deepEqual(w.ap.planRead({ id: w.PL, viewer: V("bob") }).work_kinds, { state: "stated", kinds: ["reporting"] });
  /* an edit that leaves work_kinds as they were is not asked */
  assert.equal(w.reviseProject(w.P, "Budget watch", ["work_kinds: [reporting]"], V("bob")).ok, true);
  /* a proposal made with and without them lands identically through R11's checks */
  const p1 = await w.ap.optionPropose({ plan: w.PL, summary: "Before", category: "other", subjects: [w.S1], why: "w", proposer: V("bob"), viewer: V("bob") });
  assert.equal(p0.ok && p1.ok, true);
  const strip = (x) => { const { id, at, ...rest } = x.proposal; return rest; };
  assert.deepEqual(strip(p1), strip(p0));
  /* a project created stating them is its creator's */
  assert.ok(w.project("Third", "dave", ["work_kinds: [oversight]"]));
});
