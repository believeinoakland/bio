/* screens-investigate R3: a project's timeline, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import {open, main, actsIn, button, fill, press, TIMELINE, P, ENT, ORG, SHA, word, drew, notDrew, dayOf, MORE_PATHS, MATTER, SHA2, hasWord} from "./fixtures.mjs";

const at = "/app/timeline/" + P;

test("R3 reads timeline over the project's set (the people and events its document cites), and each event for who took part and its grade", async () => {
  const p = await open(at);
  assert.equal(p.byOp("image")[0].query.id, P);
  assert.equal(p.byOp("timeline")[0].query.set, ENT);
  assert.equal(p.byOp("event").length, 0, "R20: participants and grades come with the timeline, one read, not one per event");
  const crumbs = p.root().querySelector(".cs-crumbs").textContent;
  assert.ok(crumbs.includes("Pothole repairs") && crumbs.includes(word("screen.timeline.name")), "the path: the project as read, then the screen");
});

test("R3 two lanes, \"What they did\" and \"What we did\"; each event with its date as precise as its source states it, who decided or took part, and its grade", async () => {
  const p = await open(at);
  const world = main(p).querySelector('[data-lane="world"]'), ours = main(p).querySelector('[data-lane="ours"]');
  assert.equal(world.querySelector("h2").textContent, word("screen.timeline.lane.world"));
  assert.equal(ours.querySelector("h2").textContent, word("screen.timeline.lane.ours"));
  const evs = world.querySelectorAll("[data-event]");
  assert.equal(evs[0].querySelector(".mk-date").textContent, dayOf("2024-01-12"));
  assert.equal(evs[1].querySelector(".mk-date").textContent, word("screen.timeline.month", { month: word("date.month.march"), year: "2024" }));
  drew(evs[0], "screen.timeline.role", { role: word("screen.timeline.roles.decider") });
  assert.equal(evs[0].querySelector(".cs-grade").textContent, word("mark.scale.capture.name") + "B");
  assert.ok(ours.textContent.includes("We requested the rent schedules"));
  assert.ok(!world.textContent.includes("We requested"), "never mixed");
});

test("R3 an event whose order is undetermined is drawn so, with the evidence that would order it, never guessed into order; undated events are listed apart", async () => {
  const p = await open(at);
  const ev = main(p).querySelector('[data-event="EVT-2026-0002"]');
  assert.ok(ev.querySelector('.cs-gap[data-gap="undetermined"]'));
  drew(ev, "screen.timeline.order.why", { with: "EVT-2026-0003" });
  drew(ev, "screen.timeline.order.evidence");
  assert.deepEqual(actsIn(ev).sort(), ["findin", "recorddatedfact", "relate"]);
  assert.equal(main(p).querySelector('[data-event="EVT-2026-0001"] .cs-gap[data-gap="undetermined"]'), null, "an ordered event carries no such mark (control)");
  const undated = main(p).querySelectorAll("section").find((s) => s.querySelector("h2") && s.querySelector("h2").textContent === word("screen.timeline.undated.head"));
  drew(undated, "screen.timeline.undated.apart");
  assert.equal(main(p).querySelector('[data-lane="world"]').textContent.includes("EVT-2026-0009"), false);
});

test("R3 createevent from a passage; addparticipant; relate \"Link events\" and \"Cite which came first\"; recorddatedfact (a day or a month); each read again after", async () => {
  const p = await open(at, { plane: { createevent: ok({ ok: true, event_id: "EVT-2026-0050", attestation_ids: [9] }), addparticipant: ok({ ok: true }), relate: ok({ ok: true }), recorddatedfact: ok({ ok: true }) } });
  fill(p, { "tl-doc": SHA, "tl-kind": "vote" });
  await press(p, "createevent", { reason: "the minutes record the vote" });
  assert.deepEqual(p.byOp("createevent")[0].body, { kind: "vote", attestations: [{ captureSha: SHA, extent: { kind: "document" } }], concerns: [ENT], reason: "the minutes record the vote" });
  assert.equal(p.byOp("timeline").at(-1).query.set, ENT + ",EVT-2026-0050", "the new event joins the set and the timeline is read again");
  fill(p, { "tl-doc": SHA, "tl-event": "EVT-2026-0001", "tl-who": ORG, "tl-role": "voted", "tl-vote": "yes" });
  await press(p, "addparticipant", { reason: "the roll call" });
  assert.deepEqual(p.byOp("addparticipant")[0].body, { eventId: "EVT-2026-0001", entityId: ORG, role: "voted", attestation: { captureSha: SHA, extent: { kind: "document" } }, voteValue: "yes", reason: "the roll call" });
  fill(p, { "tl-doc": SHA, "tl-event": "EVT-2026-0001", "tl-to": "EVT-2026-0002", "tl-rel": "authorises" });
  const link = main(p).querySelectorAll('button[data-act="relate"]').find((b) => b.textContent.startsWith(word("act.relate.label.timeline")));
  await press(p, "relate", { el: link });
  assert.deepEqual(p.byOp("relate")[0].body, { from: "EVT-2026-0001", to: "EVT-2026-0002", kind: "authorises", attestation: { captureSha: SHA, extent: { kind: "document" } } });
  const first = main(p).querySelectorAll('button[data-act="relate"]').find((b) => b.textContent.startsWith(word("screen.timeline.cite.first")));
  fill(p, { "tl-doc": SHA, "tl-to": "EVT-2026-0001" });
  await press(p, "relate", { el: first });
  assert.deepEqual(p.byOp("relate")[1].body, { from: "EVT-2026-0002", to: "EVT-2026-0001", kind: "precedes", attestation: { captureSha: SHA, extent: { kind: "document" } } }, "R20: kind precedes, from the event chosen as first");
  fill(p, { "tl-doc": SHA, "tl-date": "2024-03", "tl-datekind": "signed" });
  await press(p, "recorddatedfact");
  assert.deepEqual(p.byOp("recorddatedfact")[0].body, { captureSha: SHA, extent: { kind: "document" }, kind: "signed", value: { value: "2024-03", precision: "edtf" }, method: word("screen.timeline.method.member") });
});

test("R3 each act names its passage (control: none sends nothing)", async () => {
  const p = await open(at);
  for (const op of ["createevent", "addparticipant", "recorddatedfact"]) {
    await press(p, op, { el: main(p).querySelectorAll(`button[data-act="${op}"]`).at(-1), reason: "x" });
    assert.equal(p.byOp(op).length, 0, op);
  }
});

test("R3 hypothesishold keeps a suspected cause as a hunch beside one of the project's questions, never evidence; findin opens find-in over the project", async () => {
  const p = await open(at, { plane: { hypothesishold: ok({ ok: true, hypothesis_id: "HYP-1", label: "hypothesis" }) } });
  fill(p, { "tl-question": "INQ-2026-0001-seven-days", "tl-hunch": "The adjustment answered the notice", "tl-event": "EVT-2026-0002", "tl-to": "EVT-2026-0001" });
  await press(p, "hypothesishold");
  assert.deepEqual(p.byOp("hypothesishold")[0].body, { inquiry: "INQ-2026-0001-seven-days", statement: "The adjustment answered the notice", kind: "cause", about: { from: "EVT-2026-0002", to: "EVT-2026-0001" } });
  drew(main(p), "screen.timeline.hunch.kept");
  await press(p, "findin", { el: main(p).querySelectorAll('button[data-act="findin"]').at(-1) });
  assert.equal(p.location.pathname, "/app/find-in/" + P);
});

test("R3 a project whose document cites no one has no set: said so, and timeline is not read (control)", async () => {
  const md = "---\nid: " + P + "\ntitle: \"Empty\"\nreferences: []\n---\n";
  const p = await open(at, { plane: { image: ok({ "bundle.md": md }), heldcaptures: ok({ ok: true, held: [] }) } });
  assert.equal(p.byOp("timeline").length, 0);
  drew(main(p), "screen.timeline.noset");
});

test("R20 each event of \"What they did\" draws its participants (entity, role, vote) with grades, and the event's grade; an event placed nowhere draws its grade_why; at most 50 with \"and <n> more\"", async () => {
  const p = await open(at);
  const ev = main(p).querySelector('[data-event="EVT-2026-0001"]');
  assert.equal(ev.querySelectorAll("a.cs-ref").filter((a) => /^\/app\/person\//.test(a.getAttribute("href"))).length, 3, "the mover and two voters are all drawn");
  for (const t of [word("screen.timeline.role", { role: word("screen.timeline.roles.decider") }), word("screen.timeline.role", { role: word("screen.timeline.roles.voted") }) + " ", "(for)", "(against)"]) assert.ok(ev.textContent.includes(t), t);
  assert.ok(ev.querySelectorAll(".cs-grade").some((g) => g.textContent === word("mark.scale.capture.name") + "C"), "each participant's grade");
  const none = main(p).querySelector('[data-lane="world"]');
  drew(none.querySelector('[data-event="EVT-2026-0002"]'), "screen.timeline.nobody");
  const big = TIMELINE();
  big.world.items[0].participants_total = 53;
  const q = await open(at, { plane: { timeline: ok(big) } });
  drew(main(q).querySelector('[data-event="EVT-2026-0001"]'), "screen.timeline.more.people", { n: "50" });
  for (let n = 1; n <= 60; n += 1) notDrew(main(p).querySelector('[data-event="EVT-2026-0001"]'), "screen.timeline.more.people", { n: String(n) }, "control: all shown, nothing more");
});

test("R20 two events ordered by a cited relation are marked \"order cited, not dated\", their relation a reference; control: a pair dates order is never offered \"Cite which came first\"", async () => {
  const p = await open(at, { plane: { sequence: ok({ ok: true, answer: "before", basis: "cited", relation_id: 7, grade: "D" }) } });
  const ev = main(p).querySelector('[data-event="EVT-2026-0002"]');
  drew(ev, "screen.timeline.order.cited.before", { other: "EVT-2026-0003" });
  assert.ok(ev.querySelector(".cs-card, a.cs-ref"), "the relation is a reference");
  const dated = main(p).querySelector('[data-event="EVT-2026-0001"]');
  assert.equal(button(p, "relate", dated), null, "an ordered pair is never offered it");
  notDrew(dated, "screen.timeline.cite.first");
  const q = await open(at);
  notDrew(main(q).querySelector('[data-event="EVT-2026-0002"]'), "screen.timeline.order.cited.before", { other: "EVT-2026-0003" }, "control: no cited relation, nothing said");
});

/* ---- T50: R33, R34 ---- */
const optsOf = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]);
const secOf = (p, key) => main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word(key));
const NOENT = "---\nid: " + P + "\ntitle: \"Pothole repairs\"\nreferences: []\n---\n";
const DATED = { items: [{ dated_fact_id: "DF-1", capture_sha: SHA, kind: "signed", value: "2024-03-01", precision: "day", grade: "B" },
  { dated_fact_id: "DF-2", capture_sha: SHA2, kind: "hearing", value: "2025-07", precision: "edtf", grade: "C" }], placed_nowhere: [] };

test("R33 (1) state a draws, after the two lanes, Progressions it follows: each matter a reference to its steps, with its progression, steps threaded and findings", async () => {
  const p = await open(at);
  assert.equal(p.byOp("instances")[0].query.set, ENT);
  const s = secOf(p, "progression.follows");
  assert.ok(s, "the section is drawn");
  drew(s, "progression.followed", { progression: "A public records request", n: "2" });
  assert.ok(s.textContent.includes("1 / 4"), "steps threaded");
  assert.ok(s.querySelector(".cs-card, .cs-ref"), "a reference");
  const none = await open(at, { plane: { instances: ok({ ok: true, count: 0, items: [], truncated: false }) } });
  assert.equal(secOf(none, "progression.follows"), undefined, "a project that follows nothing draws no empty section");
});

test("R33 (2) state b: one matter's steps in order with each document, its own date and who threaded it; a step with no document draws the finding's own sentence; never overdue or late; the chain undetermined below two placed steps; findings listed", async () => {
  const p = await open(MORE_PATHS.matter);
  assert.deepEqual(p.byOp("instance")[0].query, { op: "instance", key: "pra", id: ORG });
  const m = main(p);
  const steps = secOf(p, "progression.steps");
  drew(steps, "progression.req.always");
  drew(steps, "progression.req.unless");
  drew(steps, "progression.threadedby", { date: dayOf("2026-09-22"), who: "mai", when: dayOf("2026-09-22") });
  drew(steps, "progression.nodoc");
  drew(steps, "progression.expects", { interval: "10 days", n: "1", date: "2026-10-02" });
  drew(m, "progression.finding.never");
  drew(secOf(p, "progression.chain"), "progression.chain.undetermined");
  assert.ok(secOf(p, "progression.findings").textContent.includes("Determination"));
  assert.doesNotMatch(m.textContent.replace(word("progression.finding.never"), ""), /overdue|\blate\b/i, "no drawn text but the design's own never-sentence says overdue or late");
  const aside = await open(MORE_PATHS.matter, { plane: { instance: ok(MATTER({ findings: [{ ...MATTER().findings[0], disposition: { applies: true, state: "dismissed", reason: "the clerk called" } }] })) } });
  assert.ok(secOf(aside, "progression.findings").textContent.includes("the clerk called"), "a finding set aside stays listed");
  const undet = await open(MORE_PATHS.matter, { plane: { instance: ok(MATTER({ findings: [{ ...MATTER().findings[0], says: { key: "progression.expects.undetermined", vars: { interval: "10 days", n: "1" } } }] })) } });
  drew(secOf(undet, "progression.steps"), "progression.expects.undetermined", { interval: "10 days", n: "1" });
});

test("R33 (2) the matter's acts: thread keeps the placements it holds and adds the chosen document at the chosen step; a lawful skip with its reason and citation; set a finding aside with a reason", async () => {
  const p = await open(MORE_PATHS.matter, { plane: { thread: ok({ ok: true }), discharge: ok({ ok: true }), proposedispose: ok({ ok: true }) } });
  fill(p, { "pm-thread-stage": "determination", "pm-thread-doc": SHA2 });
  await press(p, "thread");
  assert.deepEqual(p.byOp("thread")[0].body, { progressionKey: "pra", entityId: ORG, placements: [{ stage: "sent", captureSha: SHA }, { stage: "determination", captureSha: SHA2 }] });
  fill(p, { "pm-dis-stage": "determination", "pm-dis-doc": SHA2, "pm-dis-reason": "the request was withdrawn", "pm-dis-cite": "Gov. Code 7922.535" });
  await press(p, "discharge");
  assert.deepEqual(p.byOp("discharge")[0].body, { progressionKey: "pra", entityId: ORG, stageKey: "determination", captureSha: SHA2, reason: "the request was withdrawn", citation: "Gov. Code 7922.535" });
  fill(p, { "pm-aside-finding": "determination|2", "pm-aside-reason": "the clerk called" });
  await press(p, "proposedispose");
  assert.deepEqual(p.byOp("proposedispose")[0].body, { progressionKey: "pra", stageKey: "determination", to: "dismissed", reason: "the clerk called", definitionVersion: 2 });
});

test("R33 (3) state c: a progression's steps (what comes before, how soon, required, how many), its basis with every version, Revise the steps and Define a progression send progressiondefine", async () => {
  const p = await open(MORE_PATHS.progression, { plane: { progressiondefine: ok({ ok: true, progression_key: "pra", version: 3 }) } });
  assert.deepEqual(p.byOp("progression")[0].query, { op: "progression", key: "pra" });
  const steps = secOf(p, "progression.steps");
  drew(steps, "screen.timeline.step.within", { days: "10", n: "1" });
  drew(secOf(p, "progression.basis"), "screen.timeline.progression.sub", { what: "A public records request", n: "1", name: "ana", date: dayOf("2026-09-24") });
  assert.ok(secOf(p, "progression.basis").textContent.includes("the agency determines within 10 days"));
  fill(p, { "pd-rv-basis": "amended basis", "pd-rv-cite": "Gov. Code 7922.535", "pd-rv-steps": "sent | Request sent | | | always | 1\ndetermination | Determination | sent | 10 days | usually | 0..1" });
  await press(p, "progressiondefine", { el: button(p, "progressiondefine") });
  const b = p.byOp("progressiondefine")[0].body;
  assert.equal(b.progressionKey, "pra");
  assert.equal(b.basis, "amended basis");
  assert.deepEqual(b.stages[1], { key: "determination", label: "Determination", after: "sent", within: "10 days", required: "usually", cardinality: "0..1" });
  fill(p, { "pd-name": "A permit", "pd-basis": "the code", "pd-cite": "Code 1", "pd-steps": "filed" });
  await press(p, "progressiondefine", { el: p.root().querySelectorAll('button[data-act="progressiondefine"]').pop() });
  const d = p.byOp("progressiondefine")[1].body;
  assert.deepEqual([d.progressionKey, d.label, d.stages[0].key, d.stages[0].required], ["a_permit", "A permit", "filed", "sometimes"]);
});

test("R33 (5) a project whose documents name no entity or event but hold dated facts draws Dated in the documents and no event, and not the no-set sentence; control: a project with no document says so", async () => {
  const p = await open(at, { plane: { image: ok({ "bundle.md": NOENT }), timeline: ok({ ok: true, set: [], dated: DATED }) } });
  assert.deepEqual(p.byOp("timeline")[0].query.set, undefined);
  assert.ok(p.byOp("timeline")[0].query.captures.includes(SHA));
  notDrew(main(p), "screen.timeline.noset");
  const d = secOf(p, "timeline.dated.title");
  assert.ok(d, "the dated list stands apart from the lanes");
  drew(d, "screen.timeline.dated.meta", { precision: word("label.timeprecisions.day"), document: "Lease amendment 1", grade: "B" });
  drew(d, "screen.timeline.dated.meta", { precision: word("label.timeprecisions.edtf"), document: "Rent schedule", grade: "C" });
  drew(d, "screen.timeline.datekind.signed");
  drew(d, "screen.timeline.datekind.hearing");
  assert.equal(main(p).querySelectorAll(".mk-ev").length, 0, "no event is made of a dated fact");
  assert.equal(main(p).querySelectorAll(".mk-lanes").length, 0);
});

test("R34 the timeline's event form chooses the project's documents by title and sends the capture's digest; no field names a fingerprint; with no document the choice's empty state is drawn and nothing is sent", async () => {
  const p = await open(at);
  assert.deepEqual(optsOf(p, "tl-doc"), [[SHA, "Lease amendment 1"], [SHA2, "Rent schedule"]]);
  assert.equal(p.byOp("heldcaptures")[0].query.project, P, "the project's documents");
  drew(main(p), "form.choose.passage");
  assert.equal(main(p).querySelectorAll("*").filter((e) => /^tl-(sha|page)$/.test(e.getAttribute("id") || "")).length, 0);
  const none = await open(at, { plane: { heldcaptures: ok({ ok: true, held: [] }) } });
  assert.equal(none.doc.getElementById("tl-doc"), null);
  await press(none, "createevent", { reason: "x" });
  assert.equal(none.byOp("createevent").length, 0);
});

/* R45 (T51-120), K3996 */
test("R45 each finding draws its state by key (a deferred one \"Deferred\", a set-aside one \"Set aside\"), explained by progression.finding.state.help; control: a finding with no decision draws Open", async () => {
  const base = MATTER().findings[0];
  const p = await open(MORE_PATHS.matter, { plane: { instance: ok(MATTER({ findings: [{ ...base, state: "deferred", disposition: { applies: true, state: "deferred", reason: "wait for the reply" } },
    { ...base, stage_key: "closing", stage_label: "Closing", state: "dismissed" }, { ...base, stage_key: "other", stage_label: "Other" }] })) } });
  const st = secOf(p, "progression.findings").querySelectorAll("[data-finding-state]").map((e) => [e.getAttribute("data-finding-state"), e.textContent]);
  assert.deepEqual(st, [["deferred", word("progression.finding.state.deferred")], ["dismissed", word("progression.finding.state.dismissed")], ["open", word("progression.finding.state.open")]]);
  assert.ok(secOf(p, "progression.findings").querySelector(`[data-tip*="${word("progression.finding.state.help").slice(0, 30)}"]`), "explained by the help");
});

test("R45 the Define and Revise step fields are labelled by the six keys in order, with the steps help under Define and the revise help under Revise", async () => {
  const keys = ["key", "label", "after", "within", "required", "cardinality"].map((c) => "progression.steps.label." + c);
  for (const k of [...keys, "progression.steps.help", "progression.revise.help"]) assert.ok(hasWord(k), k);
  const p = await open(MORE_PATHS.progression);
  const cols = main(p).querySelectorAll("[data-columns]");
  assert.equal(cols.length, 2, "Define and Revise each");
  for (const c of cols) assert.equal(c.textContent, keys.map((k) => word(k)).join(" | "));
  drew(main(p), "progression.revise.help");
  drew(main(p), "progression.steps.help");
});

test("K3996 an event placed nowhere draws its grade_why, {key, vars}, through its word; control: a bare string draws none of our English", async () => {
  const p = await open(at);
  drew(main(p), "events.why.placed_nowhere_event");
  const t = TIMELINE();
  t.world.placed_nowhere[0].grade_why = "a sentence written elsewhere";
  const q = await open(at, { plane: { timeline: ok(t) } });
  assert.ok(!main(q).textContent.includes("a sentence written elsewhere"));
});

/* R49 (T51; C26) */
test("R49 the project's timeline always offers Define a progression, even where it follows no matter yet; pressing it sends progressiondefine with the declared fields and opens the new flow", async () => {
  const p = await open(at, { plane: { instances: ok({ ok: true, count: 0, items: [], truncated: false }), progressiondefine: ok({ ok: true, progression_key: "a_permit", version: 1 }) } });
  assert.equal(main(p).querySelectorAll("section").some((s) => s.querySelector("h2").textContent === word("progression.follows")), false, "no matter followed: no list");
  const fold = main(p).querySelector("details[data-define]");
  assert.ok(fold, "the form is offered on the project's own timeline");
  drew(fold, "progression.define");
  fill(p, { "pd-name": "A permit", "pd-basis": "the code", "pd-cite": "Code 1", "pd-steps": "filed | Filed" });
  await press(p, "progressiondefine");
  assert.deepEqual(p.byOp("progressiondefine")[0].body, { progressionKey: "a_permit", label: "A permit", basis: "the code", citation: "Code 1",
    stages: [{ key: "filed", label: "Filed", after: null, within: null, required: "sometimes", cardinality: "0..n" }] });
  assert.equal(decodeURIComponent(p.location.pathname), "/app/timeline/" + P + "/progression/a_permit");
  assert.equal(p.byOp("progression").at(-1).query.key, "a_permit", "the new flow is opened (state c)");
});

test("R49 a progression address of a key the record does not hold draws the empty state with the define form beside it; control: a known flow is drawn as today, with its steps and the one define form", async () => {
  const p = await open(MORE_PATHS.progression, { plane: { progression: ok({ ok: true, found: false, progression_key: "pra" }) } });
  const m = main(p);
  assert.ok(m.querySelector('[data-state="empty"]'), "the empty state");
  assert.ok(m.querySelector("details[data-define]"), "and the form that defines it");
  assert.ok(p.doc.getElementById("pd-name"));
  const known = await open(MORE_PATHS.progression);
  assert.equal(main(known).querySelectorAll("details[data-define]").length, 1);
  assert.equal(main(known).querySelector('[data-state="empty"]'), null);
  drew(main(known), "progression.steps");
  const refused = await open(MORE_PATHS.progression, { plane: { progression: ok({ ok: true, found: false }), progressiondefine: { status: 200, json: { ok: true, result: { ok: false, code: "NO_BASIS", reason: "NO_BASIS" } } } } });
  fill(refused, { "pd-name": "X", "pd-basis": "the code", "pd-steps": "a" });
  await press(refused, "progressiondefine");
  assert.equal(refused.byOp("progressiondefine").length, 1, "sent once");
  assert.ok(main(refused).textContent.includes(word("refusal.NO_BASIS")), "the owner's refusal is drawn beside the act");
});
