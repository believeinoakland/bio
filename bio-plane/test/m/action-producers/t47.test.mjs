/* T47 (T47-50; N968, DEC-212, K1364, K3100, K3122): what this tranche adds, at actionItems' interface. R24, the two details
   R23 kept, read by key from `words.json`: the group's own date names the office or venue it is owed at (action-clocks R23's
   `venue`), and a plan's review names its title, its rhythm and the day reviews are counted since (plan-work R18's
   `recurrence` and `since`), each with its untrue arm kept; and R25, `request-unsent`, a request a member approved and
   nobody recorded sent (filings R53). Each test names its ids and carries a control (K874). Providers are fakes in their
   requirements' shapes; membership is real. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso, page, ofKind, DAY, day } from "./world.mjs";
import { WORD, FILLED } from "./words.mjs";
import { ACTION_WORDS, KEPT, OWN_WORDS } from "../../../src/action-producers/index.mjs";

function people(fakes) {
  const w = world(fakes);
  w.member("ada", { role: "admin" }); w.member("alice"); w.member("bob"); w.member("olga"); w.member("hank");
  for (const p of ["PRJ-1", "PRJ-H"]) w.bundle(p, "project");
  w.bundle("ACT-1", "action", { title: "inspection logs for pothole reports closed last year", state: "planned" });
  w.bundle("ACT-2", "action", { title: "  ", state: "active" });
  w.bundle("ACT-H", "action", { title: "hidden", state: "planned" });
  w.run(`UPDATE bundles SET project='PRJ-1' WHERE bundle_id IN ('ACT-1','ACT-2')`);
  w.run(`UPDATE bundles SET project='PRJ-H' WHERE bundle_id='ACT-H'`);
  w.join("PRJ-1", "olga", { owner: true }); w.join("PRJ-1", "alice"); w.join("PRJ-1", "bob");
  w.join("PRJ-H", "hank", { owner: true });
  /* the creator, as action-clocks R3 reads it: the author of the action's first manifest entry */
  for (const [a, by] of [["ACT-1", "bob"], ["ACT-2", "bob"], ["ACT-H", "hank"]])
    w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json) VALUES (?, 'k1', 'creation', 'b', ?, ?, '[]')`, a, by, iso(NOW - 9 * DAY));
  return w;
}
const revoke = (w, member) => w.run(`UPDATE members SET status='revoked' WHERE member_id=?`, member);
const entry = (x = {}) => ({ action: "ACT-1", ord: 0, date: "2026-08-25", basis: "the board's rule", text: "file the reply brief",
  status: "pending", past: true, project: "PRJ-1", created_by: "alice", owed_by: "group", basis_of: { kind: "rule", citation: "c" },
  steps: [], local_day: day(NOW), zone: "UTC", ...x });
const overdue = (w) => ofKind(w.read("alice"), "action-clock-overdue");

test("R24: the group's own date owed to an office answers queue.action-clock-overdue.ours.detail naming the office as its role and body, a venue by its name, {what} and {date} as the summary fills them (control: no office or venue held keeps the present detail and no detail_key)", () => {
  const office = { kind: "office", role: "the Clerk", body: "the City Council" };
  const w = people({ actionClocks: { overdueClocks: () => page([
    entry({ ord: 0, venue: office }),
    entry({ ord: 1, venue: { kind: "venue", action_kind: "appeal", name: "the Board of Appeals" } }),
    entry({ ord: 2, venue: { kind: "office", role: "the Auditor", body: null } }),
    entry({ ord: 3, venue: null, venue_why: "no office or venue is held for this action" }),
    entry({ ord: 4, owed_by: "body", venue: office }),
    entry({ ord: 5, date: "2025-12-30", venue: office })]) } });
  const m = Object.fromEntries(overdue(w).map((i) => [i.subject.entry, i]));
  const K = "queue.action-clock-overdue.ours.detail";
  assert.equal(m[0].detail_key, K);
  assert.equal(m[0].detail, FILLED(K, { what: "file the reply brief", venue: "the Clerk, the City Council", date: "25 August" }));
  assert.equal(m[0].detail, "Your group's deadline to file the reply brief with the Clerk, the City Council was 25 August, and nothing is recorded as done. See what can still be done.");
  assert.equal(m[0].summary, FILLED("queue.action-clock-overdue.ours.summary", { what: "file the reply brief" }), "the summary is unchanged (R23)");
  assert.deepEqual(m[0].basis.venue, office, "the venue as the record states it");
  assert.equal(m[1].detail, FILLED(K, { what: "file the reply brief", venue: "the Board of Appeals", date: "25 August" }), "a venue by its name");
  assert.equal(m[2].detail, FILLED(K, { what: "file the reply brief", venue: "the Auditor", date: "25 August" }), "an office with no body by its role");
  assert.equal(m[5].detail, FILLED(K, { what: "file the reply brief", venue: "the Clerk, the City Council", date: "30 December 2025" }),
    "a day of another year names its year (date.daymonthyear)");
  /* controls: no office or venue held; a date the addressee owes (not the group's own) */
  assert.equal("detail_key" in m[3], false, "venue: null keeps the present detail, returned to BOB");
  assert.match(m[3].detail, /nothing marks it met or waived/);
  assert.equal(m[3].basis.venue_why, "no office or venue is held for this action");
  assert.equal("detail_key" in m[4], false, "control: an addressee's date is canon's question, its detail unkeyed");
  assert.ok(KEPT.includes("queue.action-clock-overdue.ours.detail (no venue held)"), "the kept arm is named");
  assert.equal(ACTION_WORDS[K], WORD(K), "the key's words are words.json's, verbatim");
});

const rhythm = (rrule, by = "alice", at = iso(NOW - 30 * DAY)) => ({ rrule, dtstart: "2026-08-03", zone: "UTC", by, at });
function reviews(items, planRead = ({ id }) => ({ ok: true, id, project: "PRJ-1", title: id === "PLN-1" ? "Library hours" : null })) {
  return people({ planWork: { takeUpsFor: () => ({ ok: true, items: [], truncated: false, cursor: null }),
    planReviewsDue: () => ({ ok: true, limit: 500, truncated: false, items }) }, actionPlans: { planRead } });
}
const due = (x) => ({ plan: "PLN-1", project: "PRJ-1", member: "alice", due: "2026-08-31T09:00:00Z", day: "2026-08-31", zone: "UTC", ...x });

test("R24: a plan's review reads queue.plan-review-due.detail naming the plan's title, its rhythm in words and the last review's day (control: a plan never reviewed names the day its rhythm was set)", () => {
  const w = reviews([
    due({ recurrence: rhythm("FREQ=WEEKLY;BYDAY=MO"), since: { day: "2026-08-17", from: "review" } }),
    due({ plan: "PLN-2", recurrence: rhythm("FREQ=WEEKLY;INTERVAL=2"), since: { day: "2026-08-02", from: "rhythm_set" } }),
    due({ plan: "PLN-3", recurrence: rhythm("FREQ=MONTHLY;BYMONTHDAY=1"), since: { day: "2025-11-30", from: "review" } }),
    due({ plan: "PLN-4", recurrence: rhythm("FREQ=YEARLY;INTERVAL=3") , since: { day: "2026-01-05", from: "rhythm_set" } })]);
  const m = Object.fromEntries(ofKind(w.read("alice"), "plan-review-due").map((i) => [i.subject.id, i]));
  const K = "queue.plan-review-due.detail";
  assert.equal(m["PLN-1"].detail_key, K);
  assert.equal(m["PLN-1"].detail, FILLED(K, { plan: '"Library hours"', rhythm: "week", date: "17 August" }), "reviewed once: that review's day");
  assert.equal(m["PLN-1"].detail, 'Your group set "Library hours" to be reviewed every week, and nothing has been reviewed since 17 August. See what changed, then record the review.');
  assert.equal(m["PLN-2"].detail, FILLED(K, { plan: "PLN-2", rhythm: "2 weeks", date: "2 August" }), "never reviewed: the day its rhythm was set; a plan with no title by its id");
  assert.equal(m["PLN-3"].detail, FILLED(K, { plan: "PLN-3", rhythm: "month", date: "30 November 2025" }), "another year's day names its year");
  assert.equal(m["PLN-4"].detail, FILLED(K, { plan: "PLN-4", rhythm: "3 years", date: "5 January" }));
  assert.deepEqual(m["PLN-1"].basis.since, { day: "2026-08-17", from: "review" });
  assert.equal(m["PLN-1"].basis.title, "Library hours");
  assert.equal(m["PLN-1"].summary, FILLED("queue.plan-review-due.summary", { plan: "PLN-1" }), "the summary is unchanged (R23)");
  assert.equal(ACTION_WORDS[K], WORD(K));
});

test("R24: a rhythm not one occurrence a period, an unreadable one, or no day since keeps the plan review's present detail and no detail_key (control: a weekly rhythm on one day is keyed)", () => {
  const w = reviews([
    due({ plan: "PLN-1", recurrence: rhythm("FREQ=WEEKLY;BYDAY=MO"), since: { day: "2026-08-17", from: "review" } }),
    due({ plan: "PLN-5", recurrence: rhythm("FREQ=WEEKLY;BYDAY=MO,TH"), since: { day: "2026-08-17", from: "review" } }),
    due({ plan: "PLN-6", recurrence: rhythm("FREQ=DAILY"), since: { day: "2026-08-17", from: "review" } }),
    due({ plan: "PLN-7", recurrence: rhythm("FREQ=WEEKLY"), since: null }),
    due({ plan: "PLN-8" })]);
  const m = Object.fromEntries(ofKind(w.read("alice"), "plan-review-due").map((i) => [i.subject.id, i]));
  assert.equal(m["PLN-1"].detail_key, "queue.plan-review-due.detail", "control");
  for (const p of ["PLN-5", "PLN-6", "PLN-7", "PLN-8"]) {
    assert.equal("detail_key" in m[p], false, p);
    assert.match(m[p].detail, /You are reminded only because the group asked for it/, p);
  }
  assert.ok(KEPT.includes("queue.plan-review-due.detail (no rhythm in words, or no day since)"));
});

/* R25's world: bob created ACT-1 and ACT-2 (PRJ-1, owned by olga); alice approved their drafts. */
const unsent = (x = {}) => ({ filing: "FIL-1", action: "ACT-1", project: "PRJ-1", approved_by: "alice", approved_at: "2026-08-28T17:00:00Z", ...x });
function requests(items) {
  let list = items;
  const asked = [];
  const w = people({ filings: { approvedUnsent: (a) => { asked.push(a); return { ok: true, items: list, truncated: false }; } } });
  return { w, asked, set: (l) => { list = l; } };
}
const ids = (r) => ofKind(r, "request-unsent").map((i) => i.id).sort();
const K = "CONDITION::request-unsent::FIL-1";

test("R25: one CONDITION request-unsent per filing filings.approvedUnsent answers the viewer, keyed CONDITION::request-unsent::<filing>, to the member who approved it, else the action's creator, else its project's owners (control: while the approver is active, nobody else)", () => {
  const { w, asked } = requests([unsent(), unsent({ filing: "FIL-2", action: "ACT-2", approved_by: "token:member" })]);
  const alice = w.read("alice");
  assert.deepEqual(asked.at(-1), { viewer: "member:alice" }, "filings answers by the viewer");
  assert.deepEqual(ids(alice), [K], "the approver");
  assert.equal(byId(alice)[K].basis.recipients_rule, "approver");
  assert.deepEqual(ids(w.read("bob")), ["CONDITION::request-unsent::FIL-2"], "a machine's approval names no member: the action's creator");
  assert.equal(byId(w.read("bob"))["CONDITION::request-unsent::FIL-2"].basis.recipients_rule, "author");
  assert.deepEqual(ids(w.read("olga")), [], "control: the owner, while the approver or creator is here");
  assert.deepEqual(ids(w.read("ada")), [], "nor an administrator");
  assert.deepEqual(ids(w.read(null, "class:admin")), [], "nor a caller with no member");
  revoke(w, "alice");
  assert.deepEqual(ids(w.read("bob")), [K, "CONDITION::request-unsent::FIL-2"], "the approver left: the creator");
  revoke(w, "bob");
  assert.deepEqual(ids(w.read("olga")), [K, "CONDITION::request-unsent::FIL-2"], "both left: the project's active owners");
  assert.equal(byId(w.read("olga"))[K].basis.recipients_rule, "project_owners");
  revoke(w, "olga");
  assert.deepEqual(ids(w.read("ada")), [], "R25 names no administrators' arm: with no owner left, nobody");
});

test("R25: its subject the action, homed under its project, naming what is asked (the action's own title, K3122) and the approval's day; aged from the approval; it carries no due", () => {
  const { w } = requests([unsent(), unsent({ filing: "FIL-2", action: "ACT-2", approved_at: "not an instant" })]);
  const m = byId(w.read("alice"));
  const it = m[K];
  assert.deepEqual([it.class, it.kind], ["CONDITION", "request-unsent"]);
  assert.deepEqual(it.subject, { kind: "action", id: "ACT-1", filing: "FIL-1", what: "inspection logs for pothole reports closed last year",
    approved_by: "alice", approved_at: "2026-08-28T17:00:00Z", project: "PRJ-1" });
  assert.equal(it.summary, "You left a request unsent: inspection logs for pothole reports closed last year", "to the approver, in her own words");
  assert.equal(it.detail, "Approved on 28 August, not yet sent: nothing has gone to the office. Pick up where you left off, keep it for later, or drop it with a reason.");
  assert.equal("summary_key" in it || "detail_key" in it, false, "words.json holds no key for it: this module's own words, returned to BOB");
  assert.equal(it.summary, OWN_WORDS["request-unsent.summary.mine"].replace("{what}", it.subject.what));
  assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]], "homed under its project");
  assert.deepEqual(it.age, { state: "determined", since: "2026-08-28T17:00:00Z", ms: NOW - Date.parse("2026-08-28T17:00:00Z") });
  assert.equal("due" in it, false);
  const untitled = m["CONDITION::request-unsent::FIL-2"];
  assert.equal(untitled.subject.what, "a request", "an action with no title asks 'a request'");
  assert.equal(untitled.age.state, "undetermined");
  assert.match(untitled.detail, /^Approved, not yet sent/, "no approval day readable: none named");
  /* control: told to another member, it does not say "you left" */
  revoke(w, "alice");
  assert.equal(byId(w.read("bob"))[K].summary, "A request was left unsent: inspection logs for pothole reports closed last year");
});

test("R25: its doors are the action's screen at its step, queuesnooze and actionmove to abandoned with a reason, in that order, before queue's acts (control: R1's item offers none of them)", () => {
  const { w } = requests([unsent()]);
  w.fakes.actionClocks.overdueClocks = () => page([entry()]);
  const r = w.read("alice");
  const it = byId(r)[K];
  assert.deepEqual(it.options, [
    { id: "action", label: "Pick up where you left off", weight: "single", screen: { op: "action", id: "ACT-1", step: "send" } },
    { id: "queuesnooze", label: WORD("act.queuesnooze.label.queue"), weight: "single" },
    { id: "actionmove", label: WORD("act.actionmove.label.queue"), weight: "single", move: { action: "ACT-1", to: "abandoned", reason: "required" } },
    { id: "opt", on: ["ACT-1"] }]);
  assert.deepEqual(it.screen, { op: "action", id: "ACT-1", step: "send" });
  for (const k of ["act.queuesnooze.label.queue", "act.actionmove.label.queue"]) assert.equal(ACTION_WORDS[k], WORD(k), k);
  const other = ofKind(r, "action-clock-overdue")[0];
  assert.ok(other.options.every((o) => !["action", "queuesnooze", "actionmove"].includes(o.id)), "control");
});

test("R25: it leaves when the filing is recorded sent or the action is dropped (abandoned) or resolved (control: an active action's stands); a filing on an action the viewer may not see is no item (R14)", () => {
  const { w, set } = requests([unsent(), unsent({ filing: "FIL-2", action: "ACT-2" }), unsent({ filing: "FIL-H", action: "ACT-H", project: "PRJ-H" })]);
  assert.deepEqual(ids(w.read("alice")), [K, "CONDITION::request-unsent::FIL-2"], "control: planned and active actions stand");
  assert.ok(!/ACT-H|PRJ-H|FIL-H/.test(JSON.stringify(w.read("alice"))), "R14: the hidden action's filing is named nowhere");
  w.run(`UPDATE bundles SET current_state='abandoned' WHERE bundle_id='ACT-1'`);
  w.run(`UPDATE bundles SET current_state='resolved' WHERE bundle_id='ACT-2'`);
  assert.deepEqual(ids(w.read("alice")), [], "dropped with actionmove, or resolved: nothing waits");
  w.run(`UPDATE bundles SET current_state='active' WHERE bundle_id IN ('ACT-1','ACT-2')`);
  set([unsent({ filing: "FIL-2", action: "ACT-2" })]);
  assert.deepEqual(ids(w.read("alice")), ["CONDITION::request-unsent::FIL-2"], "FIL-1 recorded sent: filings no longer answers it");
  /* R13: the producer states its bound; one that throws is named in facts.failed and the rest stand */
  assert.equal(w.read("alice").facts["request-unsent"].truncated, false);
  w.fakes.filings.approvedUnsent = () => { throw new Error("boom"); };
  assert.deepEqual(w.read("alice").facts.failed, ["request-unsent"]);
});

test("R25 (K3000): an approver filings answers in the stamped form (member:alice) is that member (control: the bare form)", () => {
  for (const by of ["member:alice", "alice"]) {
    const { w } = requests([unsent({ approved_by: by })]);
    assert.deepEqual(ids(w.read("alice")), [K], by);
    assert.deepEqual(byId(w.read("alice"))[K].recipients, ["alice"], by);
    assert.deepEqual(ids(w.read("bob")), [], `${by}: control, the creator is not told`);
  }
});
