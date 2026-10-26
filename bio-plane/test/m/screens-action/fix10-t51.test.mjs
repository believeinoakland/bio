/* screens-action T51 fix round 10 (R56; K5271; live walk C/E): Matter, Plan, Start an action, Request and the action page, each entry of B49 at the
   interface. Real worlds wherever the owner's answer is what the screen draws (`conformance`, `actions`, `filings`, `entities`); a scripted plane only
   for a read whose shape a test feeds in (the plan's checks, an action's state). Every sentence is asserted by its key (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { matterWorld, question as concluded, standard as declareStandard } from "./world-A.mjs";
import { actionWorld, openIn, filingIn, entityOf, answerOf } from "./world-C.mjs";
import { open, main, text, ops, press, last, ok, W, D, DATA_PLANE, PLAN, PLAN_ID, ACTION, ACTION_ID, ROUTES, beside } from "./page.mjs";
import { entitieskind as entitiesListing } from "../entities/fixtures.mjs";
import { dateBeforePhase } from "../action-plans/fixtures.mjs";
import { seeded, opened, V } from "../action-plans/fixture.mjs";

const slotOf = (p, b) => p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`);
const optionTexts = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => o.textContent.trim());
const until = async (p, f, what) => { for (let i = 0; i < 40; i++) { const v = f(); if (v) return v; await p.settle(); } throw new Error("waited for " + what); };

/* ---------- Matter (walk E C2a, C2b; walk C C-M11) ---------- */

/** A matter whose standard is declared as the Standard screen declares one: issued by an office the team holds, in force from a day and no end named, so
 *  whether it binds the office on the act's day is undetermined (standards R7, R50); a finding published and an event dated, as `matterWorld` makes them. */
async function undeterminedWorld() {
  const w = await matterWorld();
  const office = (await w.me.act("entitycreate", { body: { kind: "office", label: "City of Oakland", note: "The office." } })).entity_id;
  const open = (await w.me.act("standarddeclare", { body: { cite: "Ordinance 9.9", kind: "ordinance", issuer: office, reason: "the team holds the city to it",
    period: { from: "2020-01-01", to: null }, text: [w.docs[1].content] } })).id;
  return { ...w, office, open };
}

test("R56 (walk E C2a (1, 2)): a noncompliant determination against a standard whose binding is undetermined is drawn in the owner's words with the owner's why, never as 'does not bind'; the body is chosen among the team's offices and bodies and sent as the entity id", async () => {
  const w = await undeterminedWorld();
  const person = (await w.me.act("entitycreate", { body: { kind: "person", label: "Pat Quill", note: "A person." } })).entity_id;
  const p = await openIn(w.world, w.me, `/app/matter/${w.project}`);
  // the body: the team's offices (and bodies), each by its label; a person or a fund is no body of an act
  assert.deepEqual(optionTexts(p, "mt-d-body").filter(Boolean), ["City of Oakland"]);
  assert.ok(!optionTexts(p, "mt-d-body").includes("Pat Quill") && person);
  const values = { "mt-d-event": w.events.dated, "mt-d-role": "City Administrator", "mt-d-body": w.office, "mt-d-evidence-0": true, "mt-d-findings-0": true, "mt-d-std": w.open,
    "mt-d-req": "a council vote", "mt-d-did": "no vote was held", "mt-d-rd": "diverges", "mt-d-out-1": true };
  const b = await press(p, "determine", { reason: "recorded", values });
  const sent = last(p, "determine").body;
  assert.equal(sent.act.actor.body, w.office, "the entity id is what the plane is sent");
  // what the owner answers for exactly what the screen sent
  const real = await answerOf(w.world, w.me, "determine", { body: { ...sent, reason: "recorded" } });
  assert.equal(real.result.code, "STANDARD_BINDING_UNDETERMINED", "the owner's own code");
  const slot = text(p, slotOf(p, b));
  assert.ok(slot.includes(String(real.result.detail).replace(/\s+/g, " ").trim()), "and its why");
  assert.ok(!slot.includes(W("refusal.STANDARD_NOT_BINDING")), "never the sentence for a standard that does not bind");
});

test("R56 (walk E C2b): the project's determinations are drawn each with its standards' outcomes, and recording one goes to its page", async () => {
  const w = await matterWorld();
  const office = (await w.me.act("entitycreate", { body: { kind: "office", label: "City of Oakland", note: "The office." } })).entity_id;
  const p = await openIn(w.world, w.me, `/app/matter/${w.project}`);
  const values = { "mt-d-event": w.events.dated, "mt-d-role": "City Administrator", "mt-d-body": office, "mt-d-evidence-0": true, "mt-d-findings-0": true, "mt-d-std": w.std.a,
    "mt-d-req": "a council vote", "mt-d-did": "no vote was held", "mt-d-rd": "diverges", "mt-d-out-2": true, "mt-d-q": "Was there a vote?" };
  await press(p, "determine", { reason: "recorded", values });
  const id = (await w.me.read("determinations", { query: { project: w.project, live: "true", limit: "200" } })).items[0].id;
  await until(p, () => p.location.pathname === "/app/matter/" + encodeURIComponent(id), "the determination's page");
  assert.ok(text(p).includes(W("screen.matter.outcome.unclear")), "its page draws the outcome");
  // the project's page draws the outcome of each standard of a live determination, by its citation
  const q = await openIn(w.world, w.me, `/app/matter/${w.project}`);
  const row = main(q).querySelectorAll(".cs-row").map((r) => text(q, r)).find((t) => t.includes("Lease §7.2"));
  assert.ok(row && row.includes(W("screen.matter.outcome.unclear")), "the standard, with its outcome");
  // control: a project with no determination draws the absence, and no such row
  const none = await matterWorld();
  const r = await openIn(none.world, none.me, `/app/matter/${none.project}`);
  assert.ok(text(r).includes(W("screen.matter.nodet")));
  assert.equal(main(r).querySelectorAll(".cs-row").filter((x) => text(r, x).includes(W("screen.matter.outcome.unclear"))).length, 0);
});

test("R56 (walk C C-M11): a concluded question no published case holds is drawn as concluded and never tickable; a published finding is offered as before", async () => {
  const w = await matterWorld();
  const unpublished = await concluded(w.world, w.me, w.project, w.docs[1], "Was the memo signed in March?", { conclude: "It was signed on March 2." });
  const p = await openIn(w.world, w.me, `/app/matter/${w.project}`);
  const boxes = main(p).querySelectorAll("#mt-d-findings input");
  assert.equal(boxes.length, 1, "one finding is tickable");
  assert.equal(boxes[0].getAttribute("value"), w.finding, "the published one");
  assert.ok(!boxes.some((b) => b.getAttribute("value") === unpublished));
  const apart = main(p).querySelector('[data-list="concluded-unpublished"]');
  assert.ok(apart, "the unpublished one is drawn apart");
  assert.ok(text(p, apart).includes("Was the memo signed in March?") && text(p, apart).includes(W("question.concluded.heading")));
  assert.ok(!main(p).querySelector('[data-list="concluded-unpublished"] input'), "with nothing to tick");
  // control: with nothing concluded and unpublished there is no such list
  const q = await matterWorld();
  const r = await openIn(q.world, q.me, `/app/matter/${q.project}`);
  assert.ok(!main(r).querySelector('[data-list="concluded-unpublished"]'));
  assert.equal(main(r).querySelectorAll("#mt-d-findings input").length, 1);
});

/* ---------- Plan (walk E K-words, K4; walk C C-M17) ---------- */

const withPlan = (o) => ({ ...DATA_PLANE, plan: ok({ ...PLAN, ...o }) });

test("R56 (walk E K-words): a date check that cannot be told for want of a day names its option and phase by name, in the design's words, never ids; a regulated date before its phase draws names and days as dates", async () => {
  const checks = [
    { check: "date_past", option: "opt-1", date: "2026-11-30", state: "undetermined", says: "whether opt-1's regulated date 2026-11-30 has passed cannot be told" },
    { check: "date_before_phase", scenario: 1, phase: "p1", option: "opt-1", date: "2026-11-30", state: "undetermined", says: "whether opt-1's regulated date 2026-11-30 falls before phase p1 can start cannot be told" },
    { check: "date_before_phase", scenario: 1, phase: "p1", option: "opt-1", date: "2026-11-30", says: "opt-1's regulated date 2026-11-30 falls before phase p1 can start (2026-12-01)" },
  ];
  const p = await open(ROUTES.plan, withPlan({ checks }));
  const strip = text(p, main(p).querySelector(".mk-checks2"));
  const name = PLAN.options[0].summary, why = W("action-plans.time_zone_held_place");
  assert.ok(strip.includes(W("action-plans.says.whether_regulated_date", { id: name, date: D("2026-11-30"), day_undetermined: why })));
  assert.ok(strip.includes(W("action-plans.says.whether_regulated_date_falls", { oid: name, id: "Phase 1", date: D("2026-11-30"), day_undetermined: why })));
  assert.ok(strip.includes(`${name}'s regulated date ${D("2026-11-30")} falls before phase Phase 1 can start (${D("2026-12-01")})`));
  for (const raw of ["opt-1", "p1", "2026-11-30", "2026-12-01"]) assert.ok(!strip.includes(raw), `${raw} is not drawn`);
  // a determined check from action-plans' own fixture carries the day the phase starts: worded by its key, names and dates, no ids
  const f = dateBeforePhase();
  const q = await open(ROUTES.plan, { ...DATA_PLANE, plan: ok(f.read) });
  const starts = f.read.checks.filter((c) => c.check === "date_before_phase");
  assert.ok(starts.length > 0 && starts.every((c) => typeof c.start === "string"));
  const drawn = text(q, main(q).querySelector(".mk-checks2"));
  for (const c of starts) assert.ok(drawn.includes(W("action-plans.says.regulated_date_falls", { oid: f.read.options.find((o) => o.id === c.option).summary, id: "A", date: D(c.date), start: D(c.start) })));
  for (const c of starts) assert.ok(!drawn.includes(c.date) && !drawn.includes(c.start), "no ISO day");
});

test("R56 (walk E K4; walk C C-M17): an option to an office, the press or an organization with its role or its body empty draws the owner's refusal naming the empty part", async () => {
  const w = seeded();
  opened(w, [w.SI, w.S1]);
  const refusal = (addressee) => w.ap.optionAdd({ plan: w.PL, summary: "Tell the story", category: "awareness", subjects: [w.S1], addressee, author: V("bob"), viewer: V("bob") });
  const cases = [{ state: "named", kind: "press", role: "", organisation: "" }, { state: "named", kind: "press", role: "Reporter", organisation: "" },
    { state: "named", kind: "office", role: "", body: "Office of the City Clerk" }];
  for (const [i, addressee] of cases.entries()) {
    const real = refusal(addressee);
    assert.equal(real.reason, "ADDRESSEE_INCOMPLETE");
    const p = await open(ROUTES.plan, { ...DATA_PLANE, optionadd: ok(real) });
    const kind = addressee.kind;
    const b = await press(p, "optionadd", { values: { "plan-opt-summary": "Tell the story", "plan-opt-category": "awareness", "plan-opt-adk": kind, "plan-opt-arole": addressee.role,
      "plan-opt-abody": addressee.organisation ?? addressee.body }, reason: "x" });
    assert.equal(p.byOp("optionadd").length, 1, `case ${i}: the plane is asked`);
    assert.ok(beside(p, b).includes(real.detail.replace(/\s+/g, " ").trim()), `case ${i}: the owner's sentence, naming the part`);
    assert.ok(!beside(p, b).includes(W("refusal.ADDRESSEE_REFUSED")), "not the sentence about a private individual");
  }
});

/* ---------- Start an action (walk E K-new) ---------- */

test("R56 (walk E K-new): a request for comment with no advancing leg is sent and the plane's own refusal, with its findings, is drawn; the leg defaults to 'Advances'", async () => {
  const { world, me, project } = await actionWorld();
  const asked = await (await import("./world-C.mjs")).question(world, me, project);
  const p = await openIn(world, me, `/app/actionnew/${project}`);
  const kinds = optionTexts(p, "an-kind");
  assert.ok(kinds.length > 1);
  p.doc.getElementById("an-kind").value = "request_for_comment";
  p.fire(p.doc.getElementById("an-kind"), "change");
  await p.settle();
  assert.equal(p.doc.getElementById("an-legk").value, "advances", "the leg defaults to Advances for a request for comment");
  const b = await press(p, "actioncreate", { values: { "an-who": "The auditor", "an-ask": "Comment on the standard" }, reason: "x" });
  assert.equal(p.byOp("actioncreate").length, 1, "the plane is asked: no local pre-check");
  const document = last(p, "actioncreate").body.document;
  const real = await answerOf(world, me, "actioncreate", { body: { document } });
  assert.equal(real.result.reason, "ACTION_BASIS_REFUSED");
  const slot = text(p, slotOf(p, b));
  assert.ok(slot.includes(W("refusal.ACTION_BASIS_REFUSED")));
  const details = real.result.findings.map((f) => f.detail).filter(Boolean);
  assert.ok(details.length > 0);
  for (const d of details) assert.ok(slot.includes(d.replace(/\s+/g, " ").trim()), "each finding's own detail");
  assert.ok(asked);
  // control: a kind with no such rule is sent and the plane takes it
  const q = await openIn(world, me, `/app/actionnew/${project}`);
  await press(q, "actioncreate", { values: { "an-kind": "other", "an-who": "The council", "an-ask": "Comment by October 30" }, reason: "x" });
  assert.equal(q.byOp("actioncreate").length, 1);
});

/* ---------- Send steps (walk E K10, H2) ---------- */

test("R56 (walk E K10): the door to the risk beside the tier refusal is its own control after the sentence, not run on from it; control: no refusal draws none", async () => {
  const { world, me, action } = await actionWorld();
  const p = await openIn(world, me, `/app/start-send/${action}`);
  const b = await press(p, "filingprepare");
  const slot = slotOf(p, b);
  const door = slot.querySelector("a");
  assert.ok(door && door.getAttribute("href") === `/app/action/${action}`);
  assert.ok(text(p, slot).startsWith(W("refusal.FILING_TIER_UNDETERMINED")), "the sentence comes first, whole");
  assert.equal(text(p, door.parentNode), text(p, door), "the door stands alone in its own control");
  assert.notEqual(door.parentNode, slot, "and is not part of the sentence's text");
  const s = await open(`/app/start-send/${ACTION_ID}`, { ...DATA_PLANE, filingprepare: ok({ id: "FIL-1", text: "From the template.", blanks: [] }) });
  const d = await press(s, "filingprepare");
  assert.equal(slotOf(s, d).querySelector("a"), null);
});

test("R56 (walk E H2): after a filing is recorded sent, its proposed next state is said in the owner's words with the way to the action's move; before, none", async () => {
  const { world, me, action } = await actionWorld();
  await me.act("actionrisktier", { body: { target: action, tier: 1, reason: "a plain request" } });
  const filing = await filingIn(me, action, { approve: true });
  const p = await openIn(world, me, `/app/start-send/${action}`);
  assert.equal(main(p).querySelector('[data-proposed="next-state"]'), null, "nothing proposed before the sending is recorded");
  await press(p, "filingrecordsent", { values: { "send-at": "2026-10-10", "send-account": "on the portal" }, reason: "sent" });
  const note = await until(p, () => main(p).querySelector('[data-proposed="next-state"]'), "the proposed state");
  assert.equal(last(p, "filingrecordsent").body.filing, filing);
  const state = (await me.read("action", { query: { id: action } })).current_state;
  assert.equal(text(p, note), W("filings.says.member_move_action", { state, next: "active" }), "as filings words it");
  assert.ok(main(p).querySelector(`a[href="/app/action/${action}"]`), "and the action, where the move is, is one step on");
});

/* ---------- Request (walk E H1) ---------- */

test("R56 (walk E H1): a request offers the team's named offices again, picked by label and asked about, and an empty press is refused in words, never silent", async () => {
  const { world, me, project } = await actionWorld();
  const office = await entityOf(me, "office", "Records Office, Port Ellery");
  const p = await openIn(world, me, `/app/request/${project}`);
  assert.ok(optionTexts(p, "req-subject").includes("Records Office, Port Ellery"), "the named office is offered");
  // an empty press is refused in the words of a field left empty, and sends nothing
  const b = await press(p, "addresseesuggest", { values: { "req-subject": "" } });
  assert.equal(p.byOp("addresseesuggest").length, 0);
  assert.ok(beside(p, b).includes(W("findin.fieldneeded", { field: W("screen.request.subject.label") })));
  // picked, the office is asked about, and the owner answers it as the office named
  await press(p, "addresseesuggest", { values: { "req-subject": office } });
  assert.equal(last(p, "addresseesuggest").query.subject, office);
  const real = await answerOf(world, me, "addresseesuggest", { query: { subject: office } });
  assert.equal(real.result.offices.length, 1, "the owner answers the office itself");
  assert.deepEqual({ role: real.result.offices[0].addressee.role, entity_id: real.result.offices[0].addressee.entity_id }, { role: "Records Office, Port Ellery", entity_id: office });
  await until(p, () => p.doc.getElementById("req-office"), "the office to be chosen");
  assert.ok(optionTexts(p, "req-office").length === 1);
  // control: a team that names none is told no office is known
  const bare = await actionWorld();
  const q = await openIn(bare.world, bare.me, `/app/request/${bare.project}`);
  assert.ok(text(q).includes(W("screen.request.nooffice")));
  assert.ok(entitiesListing({ kind: "office" }).entities.length > 0);
});

/* ---------- The action page (walk E K12) ---------- */

test("R56 (walk E K12): 'Waiting on' is drawn only while the action is neither resolved nor abandoned, whatever the plane says is owed", async () => {
  const [before, after] = W("screen.action.waiting", { office: "@@" }).split("@@");
  const waiting = async (state, owed = true) => {
    const p = await open(ROUTES.action, { ...DATA_PLANE, action: ok({ ...ACTION, current_state: state, reply_owed: { owed, history: [] } }) });
    return text(p).includes(before) && text(p).includes(after);
  };
  assert.equal(await waiting("awaiting_response"), true, "while it waits");
  assert.equal(await waiting("active"), true);
  assert.equal(await waiting("resolved"), false, "not once resolved");
  assert.equal(await waiting("abandoned"), false, "nor once abandoned");
  // control: not owed is not drawn in any state
  assert.equal(await waiting("awaiting_response", false), false);
});
