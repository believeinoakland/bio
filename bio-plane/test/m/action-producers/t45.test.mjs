/* T45 (K2781 (1); N855, N858, N881, N882, N890; Actions D6d, D10, D14, D15, D27; v0.2 rules 6, 12, 17, 18, 20): what this
   module adds to the producers it took from queue-producers, at actionItems' interface. R1's rule for recipients (take-up,
   then the author, each while an active member who may see the thing; else the project's active owners; else the
   administrators), one item per fact and the words by basis (R1), the docket and pressure arms (R5), a member who left
   (R9), a watch's once-only question (R10), the doors (R11), reviews and a look again (R12), the read itself (R13) and the
   invariants over every kind (R14–R17, R19). Providers are fakes in their requirements' shapes; membership is real. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso, page, ofKind, DAY, day, escalationsAnswer, planAnswer, noSuchPlan } from "./world.mjs";
import { ACTION_KEYS, WORDS_CANON } from "../../../src/action-producers/index.mjs";
import { localize } from "../../../src/setup-words/index.mjs";
import { WORD, FILLED } from "./words.mjs";

/* ada an administrator; alice, bob, carl members; olga owns PRJ-1 (alice, bob, carl joined); PRJ-2 owned by olga too;
   PRJ-H hidden from everyone but its owner hank. */
function people(fakes) {
  const w = world(fakes);
  w.member("ada", { role: "admin" }); w.member("alice"); w.member("bob"); w.member("carl"); w.member("olga"); w.member("hank");
  for (const p of ["PRJ-1", "PRJ-2", "PRJ-H"]) w.bundle(p, "project");
  for (const a of ["ACT-1", "ACT-2", "ACT-3"]) w.bundle(a, "action");
  for (const e of ["ESC-1"]) w.bundle(e, "escalation");
  w.join("PRJ-1", "olga", { owner: true }); w.join("PRJ-1", "alice"); w.join("PRJ-1", "bob"); w.join("PRJ-1", "carl");
  w.join("PRJ-2", "olga", { owner: true }); w.join("PRJ-2", "alice");
  w.join("PRJ-H", "hank", { owner: true });
  w.bundle("ACT-H", "action"); w.run(`UPDATE bundles SET project='PRJ-H' WHERE bundle_id='ACT-H'`);
  return w;
}
const leave = (w, member, project) => w.run(`DELETE FROM project_participants WHERE project_id=? AND member_id=?`, project, member);
const revoke = (w, member) => w.run(`UPDATE members SET status='revoked' WHERE member_id=?`, member);
const takeUps = (...rows) => ({ takeUpsFor: () => ({ ok: true, truncated: false, cursor: null, limit: 500,
  items: rows.map(([item, member], i) => ({ take_up: i + 1, item, member, at: iso(NOW - 100 + i) })) }) });
const entry = (x = {}) => ({ action: "ACT-1", ord: 0, date: day(NOW - 3 * DAY), basis: "the records act", text: "response due",
  status: "pending", past: true, project: "PRJ-1", created_by: "alice", owed_by: "body", basis_of: { kind: "rule", citation: "c" },
  steps: [], local_day: day(NOW), zone: "UTC", ...x });
const ids = (r, kind) => ofKind(r, kind).map((i) => i.id).sort();

test("R1 (T45): the item goes to the member who last took the entry up, else its creator, each while an active member who may see the action; else the project's active owners; else the administrators", () => {
  const w = people({ actionClocks: { overdueClocks: () => page([entry()]) } });
  const K = ["CONDITION::action-clock-overdue::ACT-1::0"];
  assert.deepEqual(ids(w.read("alice"), "action-clock-overdue"), K, "control: the creator, active, receives it");
  assert.equal(byId(w.read("alice"))[K[0]].basis.recipients_rule, "author");
  assert.deepEqual(ids(w.read("olga"), "action-clock-overdue"), [], "and the owners do not while she is here");
  /* a member who took it up receives it, and the creator does not */
  Object.assign(w.fakes.planWork, takeUps([{ kind: "clock", action: "ACT-1", entry: 0 }, "carl"]));
  assert.deepEqual(ids(w.read("carl"), "action-clock-overdue"), K);
  assert.equal(byId(w.read("carl"))[K[0]].basis.recipients_rule, "took_up");
  assert.deepEqual(ids(w.read("alice"), "action-clock-overdue"), [], "the creator no longer, once another took it up");
  /* the last take-up wins */
  Object.assign(w.fakes.planWork, takeUps([{ kind: "clock", action: "ACT-1", entry: 0 }, "carl"], [{ kind: "clock", action: "ACT-1", entry: 0 }, "bob"]));
  assert.deepEqual(ids(w.read("bob"), "action-clock-overdue"), K); assert.deepEqual(ids(w.read("carl"), "action-clock-overdue"), []);
  /* the taker left the group: back to the creator; the creator left too: the project's active owners */
  revoke(w, "bob");
  assert.deepEqual(ids(w.read("alice"), "action-clock-overdue"), K, "a taker who is no longer active is passed over");
  revoke(w, "alice");
  assert.deepEqual(ids(w.read("olga"), "action-clock-overdue"), K, "the creator left the group, so the item goes to the owners");
  assert.equal(byId(w.read("olga"))[K[0]].basis.recipients_rule, "project_owners");
  /* the owner gone too: the administrators */
  revoke(w, "olga");
  assert.deepEqual(ids(w.read("ada"), "action-clock-overdue"), K);
  assert.equal(byId(w.read("ada"))[K[0]].basis.recipients_rule, "administrators");
});

test("R1 (T45): a creator who may not see the action is passed over, and a hidden owner's project goes to its own owners", () => {
  const w = people({ actionClocks: { overdueClocks: () => page([entry({ action: "ACT-H", project: "PRJ-H", created_by: "alice" })]) } });
  /* alice created it but may not see ACT-H (PRJ-H is hidden and she is not in it) */
  assert.deepEqual(ids(w.read("alice", "class:admin"), "action-clock-overdue"), [], "never to a member who may not see it");
  assert.deepEqual(ids(w.read("hank"), "action-clock-overdue"), ["CONDITION::action-clock-overdue::ACT-H::0"], "to PRJ-H's active owner");
});

test("R1 (T45): one item per fact: an entry an adopted duty's Noticed item stands for raises none; the steps standing for an entry are named on its one item", () => {
  const w = people({ actionClocks: { overdueClocks: () => page([
    entry({ ord: 0, noticed_by: { duty: "DUTY-1", occurrence: "2026-08-29" } }),
    entry({ ord: 1, steps: ["STEP-7"] }),
    entry({ ord: 2 })]) } });
  const m = byId(w.read("alice"));
  assert.equal(m["CONDITION::action-clock-overdue::ACT-1::0"], undefined, "the duty's Noticed item replaces it (action-clocks R17)");
  assert.ok(m["CONDITION::action-clock-overdue::ACT-1::2"], "control: an entry no duty stands for raises its item");
  const joined = m["CONDITION::action-clock-overdue::ACT-1::1"];
  assert.deepEqual(joined.subject.steps, ["STEP-7"], "the one item names the step standing for it");
  assert.match(joined.detail, /STEP-7/);
  assert.deepEqual(m["CONDITION::action-clock-overdue::ACT-1::2"].subject.steps, []);
});

test("R1 (T45; v0.2 rule 6), R23: the words by basis, read by key: the addressee's date is canon's question; the group's own and the other side's stated dates read words.json's keys; none says overdue, violation or legal", () => {
  const w = people({ actionClocks: { overdueClocks: () => page([
    entry({ ord: 0, date: "2026-08-25", owed_by: "body" }),
    entry({ ord: 1, owed_by: "undetermined" }),
    entry({ ord: 2, owed_by: "group", text: "file the reply brief" }),
    entry({ ord: 3, owed_by: "undetermined", basis_of: { kind: "stated", stated_by: "the city attorney", held_in: "CAP-1" }, text: "their date" })]) } });
  const m = byId(w.read("alice"));
  const at = (n) => m[`CONDITION::action-clock-overdue::ACT-1::${n}`];
  assert.equal(at(0).summary_key, "queue.action-clock-overdue.noreply");
  assert.equal(at(0).summary, localize("action-producers.words.noreply_canon", "Noticed: no reply recorded by {date}", { date: "August 25" }),
    "canon's own words (v0.2 rule 6), unchanged (R23)");
  assert.deepEqual([...WORDS_CANON], ["queue.action-clock-overdue.noreply"], "the one key held apart from words.json, named");
  assert.equal(at(1).summary_key, "queue.action-clock-overdue.noreply", "an entry whose owner is not stated reads as canon's question");
  /* R23: the group's own date and the other side's stated date, each its key's words filled, never a copy */
  assert.equal(at(2).summary_key, "queue.action-clock-overdue.ours.summary");
  assert.equal(at(2).summary, FILLED("queue.action-clock-overdue.ours.summary", { what: "file the reply brief" }));
  assert.equal(at(2).summary, "Our deadline passed: file the reply brief");
  assert.equal(at(3).summary_key, "queue.action-clock-overdue.theirs.summary");
  assert.equal(at(3).summary, FILLED("queue.action-clock-overdue.theirs.summary", { what: "their date" }));
  /* control: the interim keys are gone, and canon's question is no other key's sentence */
  assert.equal(ACTION_KEYS.includes("queue.action-clock-overdue.ours"), false);
  assert.notEqual(at(0).summary, at(2).summary);
  /* the kept details answer no detail_key (R23: returned to BOB) */
  for (const n of [0, 1, 2, 3]) assert.equal("detail_key" in at(n), false, at(n).id);
  for (const n of [0, 1, 2, 3]) {
    const it = at(n);
    for (const s of [it.summary, it.detail]) assert.doesNotMatch(s, /\b(overdue|violat\w*)\b/i, `${it.id}: "${s}"`);
    assert.equal(it.class, "CONDITION");
  }
  for (const s of [at(3).summary, at(3).detail]) assert.doesNotMatch(s, /\blegal\b|\blaw\b/i, "a stated date is never called a legal one");
  /* control: the check catches the word it forbids */
  assert.match("the date is overdue", /\b(overdue|violat\w*)\b/i);
});

test("R2, R3, R7 (T45): their recipients follow R1's rule", () => {
  const w = people({
    actionPlans: { checkpointsDue: () => ({ ok: true, limit: 500, truncated: false, items: [
      { plan: "PLN-1", project: "PRJ-1", scenario: 1, version: 1, phase: "p", set_by: "alice", due: day(NOW - DAY) }] }) },
    escalation: { escalationsDue: () => escalationsAnswer(
      { id: "ESC-1", project: "PRJ-1", opened_by: "alice", from: 1, to: 2, stage: "notification", instant: iso(NOW - DAY), ids: [] }) },
    actionClocks: { calendarFactsRead: () => ({ ok: true, actions_limit: 500, truncated: false,
      paths: [{ path: "profile:p/hours/clerk", actions: [{ action: "ACT-1", project: "PRJ-1", created_by: "alice" }] }] }) },
    localFacts: { factsDue: () => ({ ok: true, unknown: [], absent: [], due: [{ path: "profile:p/hours/clerk", fact: {}, status: "unconfirmed",
      due: true, why: "w", latest: null, due_from: "2026-08-01" }] }) } });
  const kinds = ["plan-checkpoint-due", "escalation-stage-proposed", "local-fact-due"];
  const mine = (who) => kinds.flatMap((k) => ids(w.read(who), k));
  assert.equal(mine("alice").length, 3, "control: the active author of each");
  /* take-ups route the checkpoint and the escalation (plan-work R11); a local fact is no item one takes up */
  Object.assign(w.fakes.planWork, takeUps([{ kind: "checkpoint", plan: "PLN-1", scenario: 1, phase: "p" }, "bob"],
                             [{ kind: "escalation_stage", escalation: "ESC-1", stage: 2 }, "carl"]));
  assert.deepEqual(ids(w.read("bob"), "plan-checkpoint-due"), ["OBLIGATION::plan-checkpoint-due::PLN-1::1::p"]);
  assert.deepEqual(ids(w.read("carl"), "escalation-stage-proposed"), ["OBLIGATION::escalation-stage-proposed::ESC-1::2"]);
  assert.deepEqual(mine("alice"), ["OBLIGATION::local-fact-due::profile:p/hours/clerk::unconfirmed"]);
  /* the author leaves the group; nobody took up the fact: its item goes to the project's active owners */
  revoke(w, "alice");
  assert.deepEqual(ids(w.read("olga"), "local-fact-due"), ["OBLIGATION::local-fact-due::profile:p/hours/clerk::unconfirmed"]);
  assert.equal(byId(w.read("olga"))["OBLIGATION::local-fact-due::profile:p/hours/clerk::unconfirmed"].basis.recipients_rule, "project_owners");
});

test("R3 (T45): a stopped_pursuing escalation proposes no edge and raises no item; the control, an open one, does", () => {
  const w = people({ escalation: { escalationsDue: () => escalationsAnswer(
    { id: "ESC-1", project: "PRJ-1", opened_by: "alice", from: 1, to: 2, stage: "s", instant: iso(NOW), ids: [], state: "stopped_pursuing" },
    { id: "ESC-1", project: "PRJ-1", opened_by: "alice", from: 2, to: 3, stage: "s", instant: iso(NOW), ids: [], state: "open" }) } });
  assert.deepEqual(ids(w.read("alice"), "escalation-stage-proposed"), ["OBLIGATION::escalation-stage-proposed::ESC-1::3"]);
});

test("R4 (T45): a reminder raises an item only while its setter is an active member who may see the action, and then goes to nobody else", () => {
  const w = people({ actionClocks: { remindersDue: () => page([
    { action: "ACT-1", ord: 0, date: day(NOW + 5 * DAY), basis: "b", text: "t", on: day(NOW), set_by: "alice", project: "PRJ-1" },
    { action: "ACT-H", ord: 0, date: day(NOW + 5 * DAY), basis: "b", text: "t", on: day(NOW), set_by: "bob", project: "PRJ-H" }]) } });
  assert.deepEqual(ids(w.read("alice"), "action-reminder"), [`OBLIGATION::action-reminder::ACT-1::0::${day(NOW)}`], "control: active");
  assert.deepEqual(ids(w.read("bob"), "action-reminder"), [], "a setter who may not see the action is told nothing of it");
  revoke(w, "alice");
  for (const who of ["alice", "olga", "ada", "bob"])
    assert.deepEqual(ids(w.read(who), "action-reminder"), [], `${who}: a departed setter's reminder raises none, for anyone`);
});

test("R5 (T45; v0.2 rule 12): a docket legal mark and a legal pressure record raise one item each, keyed by where they arrived; placing the hold removes it; an action's mark and a docket mark on one matter are two items", () => {
  const marks = [
    { kind: "legal", action: "ACT-1", ord: 2, note: "a letter threatening suit", marked_by: "alice", marked_at: iso(NOW - DAY), project: "PRJ-1",
      arrived: { action: "ACT-1", ord: 2 } },
    { kind: "legal", arrived: { docket_entry: "CASE-1#4", case: "CASE-1" }, note: "a demand on the docket", marked_by: null,
      marked_at: iso(NOW - 2 * DAY), project: "PRJ-1" },
    { kind: "retaliation", arrived: { docket_entry: "CASE-1#5", case: "CASE-1" }, note: "a slur", marked_by: null,
      marked_at: iso(NOW - 2 * DAY), project: "PRJ-1" },
    { kind: "legal", arrived: { pressure: "PRJ-1#pressure/3" }, note: "a cease-and-desist by post", marked_by: "bob",
      marked_at: iso(NOW - 3 * DAY), project: "PRJ-1" },
    { kind: "legal", arrived: { docket_entry: "CASE-H#1", case: "CASE-H" }, note: "hidden", marked_by: null, marked_at: iso(NOW), project: "PRJ-H" }];
  const placed = new Set();
  /* action-holds R3: only `legal` marks with no hold placed, and only where the viewer sees the project at FULL */
  const w = people({ actionHolds: { holdsDue: ({ viewer }) => page(marks.filter((m) => m.kind === "legal"
    && !placed.has(JSON.stringify(m.arrived)) && (m.project !== "PRJ-H" || viewer === "member:hank" || viewer === "class:admin"))
    .map(({ kind, ...m }) => m)) } });
  /* ada is invited to PRJ-1, so she sees it whole (membership R43; D54: outside a hidden project she would see none of it) */
  w.join("PRJ-1", "ada", { state: "invited" });
  const ada = byId(w.read("ada"));
  const keys = ids(w.read("ada"), "litigation-hold");
  assert.deepEqual(keys, ["OBLIGATION::litigation-hold::ACT-1::2", "OBLIGATION::litigation-hold::docket::CASE-1#4",
    "OBLIGATION::litigation-hold::pressure::PRJ-1#pressure/3"], "an action's mark and a docket mark on one matter are two items with two keys; a retaliation mark raises none");
  const docket = ada["OBLIGATION::litigation-hold::docket::CASE-1#4"];
  assert.deepEqual(docket.subject, { kind: "case", id: "CASE-1", entry: "CASE-1#4", note: "a demand on the docket", project: "PRJ-1" },
    "its subject the case, naming the mark's note");
  assert.deepEqual(docket.options.map((o) => o.id), ["actionhold"], "its door: the hold placed from that mark");
  assert.deepEqual(docket.recipients, ["ada"], "the administrators (the docket read names no marker)");
  const rec = ada["OBLIGATION::litigation-hold::pressure::PRJ-1#pressure/3"];
  assert.deepEqual(rec.subject, { kind: "project", id: "PRJ-1", record: "PRJ-1#pressure/3", note: "a cease-and-desist by post" },
    "its subject the record's project, naming its note");
  assert.deepEqual(rec.recipients, ["ada", "bob"], "the administrators and the member who recorded it");
  assert.deepEqual(ids(w.read("bob"), "litigation-hold"), ["OBLIGATION::litigation-hold::pressure::PRJ-1#pressure/3"]);
  assert.deepEqual(ids(w.read("olga"), "litigation-hold"), [], "never to an owner who is neither");
  assert.ok(!JSON.stringify(w.read("ada")).includes("CASE-H"), "R14: a docket of a project the viewer may not see is named nowhere");
  /* the marker who left the group is no longer told */
  revoke(w, "bob");
  assert.deepEqual(byId(w.read("ada"))["OBLIGATION::litigation-hold::pressure::PRJ-1#pressure/3"].recipients, ["ada"]);
  /* placing the hold removes it */
  placed.add(JSON.stringify({ docket_entry: "CASE-1#4", case: "CASE-1" }));
  assert.equal(byId(w.read("ada"))["OBLIGATION::litigation-hold::docket::CASE-1#4"], undefined);
  assert.ok(byId(w.read("ada"))["OBLIGATION::litigation-hold::ACT-1::2"], "the action's own mark stands");
});

/* R9's world: alice created ACT-1 (PRJ-1, two pending entries) and ACT-2 (PRJ-2, one), set checkpoints and opened an
   escalation; she set a reminder; bob took up one of her entries. */
function departures(extra = {}) {
  const w = people({
    actionClocks: {
      overdueClocks: () => page([entry({ ord: 0 })]),
      pendingClocks: () => page([{ action: "ACT-1", ord: 0, date: day(NOW - 3 * DAY), basis: "the records act", text: "t", past: true },
                                 { action: "ACT-1", ord: 1, date: day(NOW + 3 * DAY), basis: "the hearing notice", text: "t", past: false },
                                 { action: "ACT-1", ord: 2, date: day(NOW + 9 * DAY), basis: "b", text: "t", past: false },
                                 { action: "ACT-2", ord: 0, date: day(NOW + 4 * DAY), basis: "b2", text: "t", past: false }]),
      remindersFor: ({ action }) => ({ ok: true, action, truncated: false, reminders: action !== "ACT-1" ? [] : [
        { entry: 1, on: day(NOW + DAY), set_by: "alice", state: "waiting" }, { entry: 1, on: day(NOW), set_by: "alice", state: "answered" }] }) },
    planWork: takeUps([{ kind: "clock", action: "ACT-1", entry: 2 }, "bob"]),
    ...extra });
  w.run(`UPDATE bundles SET project='PRJ-1' WHERE bundle_id='ACT-1'`); w.run(`UPDATE bundles SET project='PRJ-2' WHERE bundle_id='ACT-2'`);
  /* the creator, as action-clocks R3 reads it: the author of the action's first manifest entry */
  for (const a of ["ACT-1", "ACT-2"])
    w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json) VALUES (?, 'k1', 'creation', 'b', 'alice', ?, '[]')`, a, iso(NOW - 9 * DAY));
  return w;
}

test("R9: a revoked creator's entries are named to the project's owners in one item, with a take-up door on each; she is never told; an item another member took up is not named (control: while she is active, none)", () => {
  const w = departures();
  assert.deepEqual(ids(w.read("olga"), "member-left-items"), [], "control: an active creator raises none");
  revoke(w, "alice");
  const r = w.read("olga");
  assert.deepEqual(ids(r, "member-left-items"), ["FINDING::member-left-items::alice::PRJ-1", "FINDING::member-left-items::alice::PRJ-2"]);
  const it = byId(r)["FINDING::member-left-items::alice::PRJ-1"];
  assert.equal(it.class, "FINDING");
  assert.deepEqual(it.subject.items.map((x) => [x.kind, x.subject, x.entry]),
    [["clock", "ACT-1", 0], ["clock", "ACT-1", 1], ["reminder", "ACT-1", 1]],
    "her two entries and her own standing reminder; ACT-1#2, which bob took up, is not named; the answered reminder is not");
  for (const x of it.subject.items) {
    assert.equal(x.door.id, "itemtakeup", "a take-up door on each named item");
    assert.equal(x.door.item.kind, "clock");
  }
  assert.deepEqual(it.options.map((o) => o.id), ["itemtakeup"]);
  assert.deepEqual(it.recipients, ["olga"]);
  assert.deepEqual([it.age.state, it.age.reason], ["undetermined", "departure_undetermined"], "no departure instant is answered");
  assert.doesNotMatch(`${it.summary} ${it.detail}`, /revok|because|why|reason/i, "it never says why she left");
  assert.deepEqual(ids(w.read("alice"), "member-left-items"), [], "she herself is never told");
  assert.deepEqual(ids(w.read("bob"), "member-left-items"), [], "nor a member who is no owner");
  /* an item the recipient may not see is neither named nor counted: olga sees PRJ-H's nothing */
  assert.ok(!JSON.stringify(r).includes("ACT-H"));
});

test("R9: leaving one project names only that project's items; items of no project go to the administrators under none", () => {
  const w = departures();
  leave(w, "alice", "PRJ-2");
  assert.deepEqual(ids(w.read("olga"), "member-left-items"), ["FINDING::member-left-items::alice::PRJ-2"],
    "she left PRJ-2 only: PRJ-1's items still route to her");
  assert.deepEqual(byId(w.read("olga"))["FINDING::member-left-items::alice::PRJ-2"].subject.items.map((x) => x.subject), ["ACT-2"]);
  /* an action of no project whose creator left the group: the administrators, under none */
  const v = people({ actionClocks: { overdueClocks: () => page([entry({ action: "ACT-3", project: null, created_by: "carl" })]) } });
  revoke(v, "carl");
  assert.deepEqual(ids(v.read("ada"), "member-left-items"), ["FINDING::member-left-items::carl::none"]);
  assert.deepEqual(ids(v.read("olga"), "member-left-items"), []);
});

test("R9, R14: an item in a project the owner may not see is neither named nor counted", () => {
  /* the provider answers by the viewer (action-clocks R3): hank's ACT-H entry is answered to hank and to nobody else */
  const w = people({ actionClocks: { overdueClocks: ({ viewer }) => page([entry({ action: "ACT-1", created_by: "carl" }),
    ...(viewer === "member:hank" ? [entry({ action: "ACT-H", project: "PRJ-H", created_by: "carl" })] : [])]) } });
  w.join("PRJ-H", "carl"); w.join("PRJ-H", "olga", { owner: true });
  revoke(w, "carl");
  const it = byId(w.read("olga"))["FINDING::member-left-items::carl::PRJ-1"];
  assert.equal(it.subject.items.length, 1); assert.equal(it.basis.count, 1);
  assert.ok(!JSON.stringify(w.read("olga")).includes("ACT-H"), "the hidden project's entry is named nowhere to olga");
  assert.deepEqual(ids(w.read("hank"), "member-left-items"), ["FINDING::member-left-items::carl::PRJ-H"],
    "PRJ-H's owner who sees it is told of it, the other owner (olga, who reads no such entry) of PRJ-1's");
});

test("R10: one OBLIGATION watch-keep-or-stop per due link, to its recipients alone, homed under the plan's project; a relied-on watch has no door (control: no entry, no item)", () => {
  const questions = [
    { link: 7, plan: "PLN-1", matters: [], watch: { kind: "follow", id: "F-1", ends: null }, due_at: iso(NOW - DAY), cause: "closed",
      relied_on: false, offered: ["keep", "stop"], recipients: ["alice"] },
    { link: 8, plan: "PLN-1", matters: [], watch: { kind: "address", id: "https://x.example/a", ends: "2026-12-31" }, due_at: iso(NOW),
      cause: "promises_met", relied_on: true, offered: [], recipients: ["alice"] },
    { link: 9, plan: "PLN-1", matters: [], watch: { kind: "question", id: "Q-1", ends: null }, due_at: iso(NOW), cause: "closed",
      relied_on: false, offered: ["keep", "stop"], recipients: ["bob"] }];
  let due = [];
  const asked = [];
  const w = people({
    following: { watchQuestions: (a) => { asked.push(a); return { ok: true, questions: due, cursor: null }; } },
    actionPlans: { planRead: ({ id }) => (id === "PLN-1" ? planAnswer(id, "PRJ-1") : noSuchPlan()) } });
  assert.deepEqual(ids(w.read("alice"), "watch-keep-or-stop"), [], "control: no due link, no item");
  due = questions;
  const r = w.read("alice");
  assert.deepEqual(asked.at(-1).viewer, "member:alice", "following answers by the viewer");
  assert.deepEqual(ids(r, "watch-keep-or-stop"), ["OBLIGATION::watch-keep-or-stop::7", "OBLIGATION::watch-keep-or-stop::8"]);
  assert.deepEqual(ids(w.read("bob"), "watch-keep-or-stop"), ["OBLIGATION::watch-keep-or-stop::9"], "a standing question's item to its author alone");
  assert.deepEqual(ids(w.read("olga"), "watch-keep-or-stop"), []);
  const kept = byId(r)["OBLIGATION::watch-keep-or-stop::7"];
  assert.deepEqual([kept.class, kept.subject.kind, kept.subject.id], ["OBLIGATION", "plan", "PLN-1"]);
  assert.deepEqual(kept.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]], "homed under the plan's project");
  assert.deepEqual(kept.options.map((o) => o.id), ["watchanswer"]);
  assert.deepEqual(kept.subject.watch, { kind: "follow", id: "F-1", ends: null });
  assert.deepEqual(kept.age, { state: "determined", since: iso(NOW - DAY), ms: DAY }, "aged from due_at");
  const relied = byId(r)["OBLIGATION::watch-keep-or-stop::8"];
  assert.deepEqual(relied.options, [], "a relied-on watch is shown with no door");
  assert.match(relied.detail, /relied on elsewhere/);
  assert.doesNotMatch(relied.detail, /PRJ-|PLN-2|project/i, "naming nothing more");
  assert.equal(relied.subject.watch.ends, "2026-12-31", "its present end date");
  /* it leaves when the link is answered (the read no longer answers it) */
  due = questions.slice(1);
  assert.deepEqual(ids(w.read("alice"), "watch-keep-or-stop"), ["OBLIGATION::watch-keep-or-stop::8"]);
});

test("R12: plan-review-due, one per review day a member-set rhythm reaches, and plan-look-again, one per paused plan whose day has come; due and age in the instance profile's zone; a recorded review removes it (control: no rhythm, no item)", () => {
  let reviews = [];
  let looks = [];
  const w = people({
    actions: { place: () => ({ time_zone: { value: "America/Los_Angeles", status: "ruled", basis: "TEST" } }) },
    planWork: { takeUpsFor: () => ({ ok: true, items: [], truncated: false, cursor: null }),
                planReviewsDue: () => ({ ok: true, items: reviews, limit: 500, truncated: false }) },
    actionPlans: { plansToLookAgain: () => ({ ok: true, items: looks, limit: 500, truncated: false }) } });
  assert.deepEqual(ids(w.read("alice"), "plan-review-due"), [], "control: a plan with no rhythm raises none");
  assert.deepEqual(ids(w.read("alice"), "plan-look-again"), []);
  /* a weekly rhythm alice set reached Monday 2026-08-31 09:00 in Los Angeles (16:00Z) */
  reviews = [{ plan: "PLN-1", project: "PRJ-1", member: "alice", due: "2026-08-31T16:00:00Z", day: "2026-08-31", zone: "America/Los_Angeles" },
             { plan: "PLN-H", project: "PRJ-H", member: "hank", due: "2026-08-31T16:00:00Z", day: "2026-08-31", zone: "America/Los_Angeles" }];
  looks = [{ plan: "PLN-2", project: "PRJ-2", title: "Library hours", look_again: "2026-08-30", paused_by: "olga",
             paused_at: iso(NOW - 20 * DAY), reason: "waiting on the budget", pause: "PLN-2#4" }];
  const a = byId(w.read("alice"));
  const rv = a["OBLIGATION::plan-review-due::PLN-1::2026-08-31"];
  assert.ok(rv, "one item on its day"); assert.equal(rv.class, "OBLIGATION");
  assert.equal(rv.due, "2026-08-31"); assert.equal(rv.age.since, "2026-08-31T07:00:00Z", "the local day's first instant in Los Angeles");
  assert.deepEqual(rv.options.map((o) => o.id), ["planreviewrecord"]);
  assert.deepEqual(rv.case.ancestors.map((x) => x.id), ["PRJ-1"]);
  assert.ok(!JSON.stringify(w.read("alice")).includes("PLN-H"), "R14: a plan of a project she may not see is named nowhere");
  const lk = byId(w.read("olga"))["OBLIGATION::plan-look-again::PLN-2::2026-08-30"];
  assert.ok(lk, "a paused plan's look-again day raises one, to the member who paused it");
  assert.equal(lk.due, "2026-08-30");
  assert.deepEqual(lk.options.map((o) => o.id), ["planreviewrecord", "planresume"]);
  assert.deepEqual(ids(w.read("alice"), "plan-look-again"), []);
  /* by R1's rule: the setter left, so the project's active owners */
  revoke(w, "alice");
  assert.deepEqual(ids(w.read("olga"), "plan-review-due"), ["OBLIGATION::plan-review-due::PLN-1::2026-08-31"]);
  /* a recorded review removes it (plan-work R4 no longer answers it) */
  reviews = [];
  assert.deepEqual(ids(w.read("olga"), "plan-review-due"), []);
});

/* A world producing every kind this module raises, all to alice (an administrator here, so the hold kinds reach her). */
function everyKind() {
  const w = departures({
    actionPlans: { checkpointsDue: () => ({ ok: true, limit: 500, truncated: false, items: [
      { plan: "PLN-1", project: "PRJ-1", scenario: 1, version: 1, phase: "p", set_by: "alice", due: day(NOW - DAY) }] }),
      plansToLookAgain: () => ({ ok: true, limit: 500, truncated: false, items: [
        { plan: "PLN-1", project: "PRJ-1", title: "T", look_again: day(NOW), paused_by: "alice", paused_at: iso(NOW - DAY), reason: "r", pause: "PLN-1#1" }] }),
      planRead: ({ id }) => planAnswer(id, "PRJ-1") },
    planWork: { takeUpsFor: () => ({ ok: true, items: [], truncated: false, cursor: null }),
                planReviewsDue: () => ({ ok: true, limit: 500, truncated: false, items: [
                  { plan: "PLN-1", project: "PRJ-1", member: "alice", due: iso(NOW - 3600000), day: day(NOW - 3600000), zone: "UTC" }] }) },
    escalation: { escalationsDue: () => escalationsAnswer(
      { id: "ESC-1", project: "PRJ-1", opened_by: "alice", from: 1, to: 2, stage: "notification", instant: iso(NOW - DAY), ids: [] }) },
    actionHolds: {
      holdsDue: () => page([{ action: "ACT-1", ord: 3, note: "n", marked_by: "alice", marked_at: iso(NOW), project: "PRJ-1", arrived: { action: "ACT-1", ord: 3 } },
                            { arrived: { docket_entry: "CASE-1#1", case: "CASE-1" }, note: "n", marked_by: null, marked_at: iso(NOW), project: "PRJ-1" },
                            { arrived: { pressure: "PRJ-1#pressure/1" }, note: "n", marked_by: "alice", marked_at: iso(NOW), project: "PRJ-1" }]),
      holdsReleased: () => page([{ action: "ACT-1", ord: 3, seq: 2, released_by: "olga", released_at: iso(NOW), reason: "r", placers: ["alice"], restarted: [] }]) },
    filingTemplates: { reviewsRequested: () => page([{ template: "TPL-a", version: "TPL-a@1", name: "N", kind: "records_request", member: "alice",
      asked_by: { id: "olga", name: "Olga" }, asked_at: iso(NOW) }]) },
    localFacts: { factsDue: () => ({ ok: true, unknown: [], absent: [], due: [{ path: "profile:p/hours/clerk", fact: {}, status: "unconfirmed",
      due: true, why: "w", latest: null, due_from: "2026-08-01" }] }) },
    following: { watchQuestions: () => ({ ok: true, cursor: null, questions: [{ link: 1, plan: "PLN-1", matters: [], watch: { kind: "follow", id: "F", ends: null },
      due_at: iso(NOW), cause: "closed", relied_on: false, offered: ["keep", "stop"], recipients: ["alice"] }] }) },
    /* R25 (T47): a request alice approved and nobody recorded sent */
    filings: { approvedUnsent: () => ({ ok: true, truncated: false, items: [
      { filing: "FIL-1", action: "ACT-1", project: "PRJ-1", approved_by: "alice", approved_at: iso(NOW - DAY) }] }) } });
  w.fakes.actionClocks.remindersDue = () => page([{ action: "ACT-1", ord: 1, date: day(NOW + 3 * DAY), basis: "b", text: "t", on: day(NOW), set_by: "alice", project: "PRJ-1" }]);
  w.fakes.actionClocks.calendarFactsRead = () => ({ ok: true, actions_limit: 500, truncated: false,
    paths: [{ path: "profile:p/hours/clerk", actions: [{ action: "ACT-1", project: "PRJ-1", created_by: "alice" }] }] });
  w.run(`UPDATE members SET role='admin' WHERE member_id='alice'`);
  /* a departed member's item, to alice as an administrator: carl's action of no project */
  w.fakes.actionClocks.overdueClocks = () => page([entry({ ord: 0 }), entry({ action: "ACT-3", project: null, created_by: "carl", ord: 0 })]);
  revoke(w, "carl");
  return w;
}
const KINDS = ["action-clock-overdue", "plan-checkpoint-due", "escalation-stage-proposed", "action-reminder", "litigation-hold",
  "litigation-hold-released", "template-review-requested", "local-fact-due", "member-left-items", "watch-keep-or-stop",
  "plan-review-due", "plan-look-again", "request-unsent"];

test("R11: each Action-layer kind's options lead with its doors, in order, before queue's acts; a kind outside R11 (R8's finding) has none of them; nothing offers to mark it resolved", () => {
  const r = everyKind().read("alice");
  const DOORS = {
    "action-clock-overdue": ["actioncorrespond", "promote", "itemtakeup"], "plan-checkpoint-due": ["checkpointrecord", "itemtakeup"],
    "escalation-stage-proposed": ["escalationadvance", "escalationdecline", "itemtakeup"], "action-reminder": ["reminderanswer"],
    "local-fact-due": ["factconfirm"], "member-left-items": ["itemtakeup"], "watch-keep-or-stop": ["watchanswer"],
    "plan-review-due": ["planreviewrecord"], "plan-look-again": ["planreviewrecord", "planresume"] };
  for (const [kind, doors] of Object.entries(DOORS)) {
    const items = ofKind(r, kind);
    assert.ok(items.length > 0, `the world raises ${kind}`);
    for (const it of items) assert.deepEqual(it.options.slice(0, doors.length).map((o) => o.id), doors, it.id);
  }
  const holds = ofKind(r, "litigation-hold");
  assert.deepEqual(byId(r)["OBLIGATION::litigation-hold::ACT-1::3"].options.slice(0, 2).map((o) => o.id), ["actionhold", "actionholdrelease"]);
  for (const it of holds) assert.equal(it.options[0].id, "actionhold", it.id);
  assert.equal(byId(r)["CONDITION::action-clock-overdue::ACT-1::0"].options[0].id, "actioncorrespond", "R1's item offers actioncorrespond first");
  /* the doors are plain acts, decorated by queue (its R17) */
  for (const o of byId(r)["CONDITION::action-clock-overdue::ACT-1::0"].options.slice(0, 3))
    assert.deepEqual(Object.keys(o).filter((k) => k !== "revision").sort(), ["id", "label", "weight"], `${o.id}: a plain act`);
  /* control: R8's finding, outside R11's list, leads with no door */
  const released = ofKind(r, "litigation-hold-released")[0];
  const doorIds = new Set(Object.values(DOORS).flat().concat(["actionhold", "actionholdrelease"]).filter((d) => d !== "promote"));
  assert.ok(released.options.every((o) => !doorIds.has(o.id)), "a kind with no door named has none");
  for (const it of r.items) assert.ok(!it.options.some((o) => /resolve/.test(o.id)), `${it.id}: never "mark resolved"`);
});

test("R13, R25: actionItems answers every kind R1–R12 and R25 derive, with facts stating each producer's bound; no item carries disposition or catalogue_id; a provider that throws is named in facts.failed and the rest stand; it writes nothing", () => {
  const w = everyKind();
  const before = w.statements.length;
  const r = w.read("alice");
  const written = w.statements.slice(before).filter((q) => !/^\s*(SELECT|WITH)\b/i.test(q));
  assert.deepEqual(written, [], "every statement of the read is a read");
  assert.deepEqual([...new Set(r.items.map((i) => i.kind))].sort(), [...KINDS].sort(), "every kind");
  for (const it of r.items) {
    assert.ok(!("disposition" in it) && !("catalogue_id" in it), it.id);
    assert.ok(it.case && typeof it.case === "object", `${it.id} homed through queue's walk`);
    assert.ok(Array.isArray(it.options), it.id);
  }
  for (const k of KINDS) assert.equal(typeof r.facts[k].truncated, "boolean", `facts.${k}`);
  assert.deepEqual(r.facts.failed, []);
  assert.ok(w.asked.homes.length > 0 && w.asked.options.length > 0, "homesOf and optionsOf are the ones passed in");
  /* a provider that throws contributes nothing and is named; the rest stand */
  w.fakes.escalation.escalationsDue = () => { throw new Error("boom"); };
  const broken = w.read("alice");
  assert.deepEqual(broken.facts.failed.sort(), ["escalation-stage-proposed", "member-left-items"],
    "each producer that reads it is named (R9 reads the stages too)");
  assert.deepEqual(ids(broken, "escalation-stage-proposed"), []);
  assert.ok(ids(broken, "action-clock-overdue").length > 0, "the others stand");
  /* a caller with no member is told none of the members' items */
  assert.deepEqual(w.read(null, "class:member").items, []);
});

test("R14: no answer names a bundle the viewer may not see, and no count reveals one", () => {
  const w = people({
    actionClocks: { overdueClocks: ({ viewer }) => page(viewer === "member:hank" ? [entry({ action: "ACT-H", project: "PRJ-H", created_by: "hank" })] : []) },
    actionPlans: { checkpointsDue: () => ({ ok: true, limit: 500, truncated: false, items: [
      { plan: "PLN-H", project: "PRJ-H", scenario: 1, version: 1, phase: "p", set_by: "hank", due: day(NOW) }] }),
      plansToLookAgain: () => ({ ok: true, limit: 500, truncated: false, items: [
        { plan: "PLN-H", project: "PRJ-H", look_again: day(NOW), paused_by: "alice" }] }) },
    planWork: { takeUpsFor: () => ({ ok: true, items: [], truncated: false, cursor: null }),
                planReviewsDue: () => ({ ok: true, limit: 500, truncated: false, items: [{ plan: "PLN-H", project: "PRJ-H", member: "alice", due: iso(NOW), day: day(NOW) }] }) } });
  const r = w.read("alice");
  assert.ok(!/PRJ-H|PLN-H|ACT-H/.test(JSON.stringify(r)), "nothing of the hidden project, though alice set the review and paused the plan");
  assert.ok(/PLN-H/.test(JSON.stringify(w.read("hank"))), "control: its owner is told");
});

test("R15, R25: a CONDITION earns an item only where a member's act can change it: each CONDITION kind offers the acts that answer it", () => {
  const r = everyKind().read("alice");
  const conds = r.items.filter((i) => i.class === "CONDITION");
  /* recording a reply or stating the entry met changes R1's; sending it or dropping it (actionmove) changes R25's */
  const ANSWERS = { "action-clock-overdue": "actioncorrespond", "request-unsent": "actionmove" };
  assert.deepEqual([...new Set(conds.map((i) => i.kind))].sort(), Object.keys(ANSWERS).sort(), "the two CONDITION kinds");
  for (const it of conds) assert.ok(it.options.some((o) => o.id === ANSWERS[it.kind]), `${it.id}: ${ANSWERS[it.kind]} changes it`);
});

test("R16: no place is named in this module's behaviour or outward text", () => {
  const text = JSON.stringify(everyKind().read("alice"));
  for (const place of ["Oakland", "California", "Alameda", "CPRA", "Brown Act", "Sunshine", "San Francisco", "Berkeley"])
    assert.ok(!text.includes(place), place);
});

/* Every string a member reads on an item: its summary and detail, the words of its options, and every sentence under it. */
function memberWords(item) {
  const out = [];
  const walk = (v, key) => {
    if (typeof v === "string") { if (!["id", "class", "kind", "source", "reason", "summary_key", "words"].includes(key)) out.push([key, v]); return; }
    if (Array.isArray(v)) { for (const x of v) walk(x, key); return; }
    if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, k);
  };
  for (const [k, v] of Object.entries(item)) if (!["id", "class", "kind", "case"].includes(k)) walk(v, k);
  return out;
}

test("R17 (DEC-107; DEC-131): no member-facing sentence of any kind says 'obligation', 'condition' or 'signal'; the codes, kinds and ids are unchanged", () => {
  const r = everyKind().read("alice");
  for (const bad of ["an obligation", "Conditions", "a SIGNAL"]) assert.match(bad, /\b(obligation|condition|signal)s?\b/i);
  for (const it of r.items) {
    for (const [key, s] of memberWords(it)) assert.doesNotMatch(s, /\b(obligation|condition|signal)s?\b/i, `${it.id} ${key}: "${s}"`);
    assert.ok(["OBLIGATION", "FINDING", "CONDITION"].includes(it.class), it.id);
    assert.ok(it.id.startsWith(`${it.class}::`), it.id);
  }
});

test("R18: due is carried by action-clock-overdue, action-reminder, plan-checkpoint-due, plan-review-due and plan-look-again, and by no other item", () => {
  const r = everyKind().read("alice");
  const dated = new Set(["action-clock-overdue", "action-reminder", "plan-checkpoint-due", "plan-review-due", "plan-look-again"]);
  for (const it of r.items) {
    if (dated.has(it.kind)) assert.match(String(it.due), /^\d{4}-\d{2}-\d{2}$/, it.id);
    else assert.equal("due" in it, false, `${it.id} carries no due`);
  }
});

test("R19 (DEC-114): no member-facing sentence of any kind calls what an action plan addresses a 'subject'; the item key `subject` is unchanged", () => {
  const r = everyKind().read("alice");
  for (const bad of ["the plan's subject", "Subjects"]) assert.match(bad, /\bsubjects?\b/i);
  for (const it of r.items) {
    for (const [key, s] of memberWords(it)) assert.doesNotMatch(s, /\bsubjects?\b/i, `${it.id} ${key}: "${s}"`);
    assert.ok(it.subject && typeof it.subject.kind === "string", `${it.id} keeps subject`);
  }
});
