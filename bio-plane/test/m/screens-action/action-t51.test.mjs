/* screens-action R26, R27, R31 (T51-122; DEC-340): the silence asked about, the read-only sentence on `action`, and the procedure guide, the
   templates and the pressure on one action. Every sentence is asserted by its key (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, last, ok, refusedIn, button, W, D, DATA_PLANE, ROUTES, ACTION, ACTION_ID, PRESSURE, PROJECT, TEMPLATES, GUIDES, FACTS, READER } from "./page.mjs";

const said = (p, key, vars) => assert.ok(text(p).includes(W(key, vars)), key);
const unsaid = (p, key, vars) => assert.ok(!text(p).includes(W(key, vars)), key);
const section = (p, titleKey) => main(p).querySelectorAll("section.cs-section").find((s) => (s.querySelector("h2") || { textContent: "" }).textContent.trim() === W(titleKey));
const FUTURE = { ...ACTION, clock: ACTION.clock.map((c) => ({ ...c, date: "2099-10-26" })) };
const INQ = "INQ-2026-aaaaaaaaaaaaaaaa";

test("R26: asked for on an action whose date has not passed, 'Open a question from this' opens 'Ask about the silence' behind the act, the field labelled `action.noreply.question.label`", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, action: ok(FUTURE), actioninquiry: ok({ ok: true, inquiry: INQ, action: ACTION_ID, project: PROJECT }) });
  const fold = main(p).querySelector("details.mk-details");
  assert.ok(fold && fold.querySelector("summary").textContent.includes(W("action.noreply.question")), "the act's words open the fold");
  assert.ok(section(p, "screen.action.ask.heading"), "state c: Ask about the silence");
  assert.ok(hasLabel(p, "action-question", W("action.noreply.question.label")));
  assert.ok(text(p).includes(W("action.noreply.question.help")) && text(p).includes(W("action.noreply.question.field.help")));
  await press(p, "actioninquiry", { values: { "action-question": "Is the extension lawful?" }, reason: "x" });
  assert.equal(last(p, "actioninquiry").body.question, "Is the extension lawful?");
  assert.equal(p.location.pathname, ROUTES.action, "the page stays");
  said(p, "screen.action.ask.done", { project: "Pothole repairs" });
  assert.ok(main(p).querySelector(`a[href="/app/question/${INQ}"]`));
});
const hasLabel = (p, id, label) => p.doc.getElementById(id).parentNode.textContent.includes(label);

test("R26: control: an empty question is refused in place and sends nothing; an action in no project draws `refusal.ACTION_NO_PROJECT`", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, actioninquiry: refusedIn("ACTION_NO_PROJECT", "the owner's own sentence"), action: ok({ ...ACTION, project: null }) });
  const none = await press(p, "actioninquiry", { reason: "x" });
  assert.equal(p.byOp("actioninquiry").length, 0);
  assert.ok(text(p, p.root().querySelector(`[data-slot="${none.getAttribute("data-ai")}"]`)).includes(W("refusal.ACTION_INQUIRY_NO_QUESTION")));
  const b = await press(p, "actioninquiry", { values: { "action-question": "A question?" }, reason: "x" });
  assert.ok(text(p, p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`)).includes(W("refusal.ACTION_NO_PROJECT")));
});

test("R27: a member who may read and not act reads the kit's sentence with the screen's noun on `action` and sees no act; every read is still made; control: a member who may act reads none", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, whoami: ok(READER) });
  assert.ok(text(p).includes(W("shell.readonly", { noun: W("screen.action.name") })), "the sentence");
  assert.deepEqual(ops(p), [], "none of the module's acts is drawn");
  for (const op of ["action", "filingsfor", "pressurefor", "templatesforaction"]) assert.ok(p.byOp(op).length >= 1, `${op} is read`);
  assert.ok(main(p).querySelector("details.mk-details") === null && p.doc.getElementById("action-question") === null, "no field of an act");
  const q = await open(ROUTES.action, DATA_PLANE);
  assert.ok(!text(q).includes(W("shell.readonly", { noun: W("screen.action.name") })));
  assert.ok(ops(q).length > 5, "she sees her acts");
  for (const id of ["plan", "request", "matter", "start-send"]) {
    const s = await open(ROUTES[id], { ...DATA_PLANE, whoami: ok(READER) });
    assert.ok(text(s).includes(W("shell.readonly", { noun: W(`screen.${id}.name`) })), `${id} follows the same rule`);
  }
});

test("R31: 'How this kind of action goes' draws each route with what to expect and its source, the profile's first and unranked, a group's guide marked by who approved it and when; the act reads again", async () => {
  const p = await open(ROUTES.action, DATA_PLANE);
  assert.equal(p.byOp("procedureguides")[0].query.kind, ACTION.kind);
  const s = section(p, "screen.action.guide.heading");
  assert.ok(s, "the section");
  const t = s.textContent.replace(/\s+/g, " ");
  for (const piece of ["Ask in writing, naming the records", "the office says within 10 days whether it will release them", "Gov. Code § 7922.535", "Call the clerk's desk first", "Mun. Code § 2.20.230"])
    assert.ok(t.includes(piece), piece);
  for (const k of ["screen.action.guide.order", "screen.action.guide.sourced", "screen.action.guide.team", "guide.procedure.legalinfo", "screen.action.profilefact.from"])
    assert.ok(t.includes(W(k)), k);
  assert.ok(t.indexOf("Ask in writing") < t.indexOf("Call the clerk's desk first"), "the profile's first, the group's after");
  assert.ok(t.includes(W("screen.action.templates.approved", { member: "ana", date: D("2026-10-01") })), "a group guide is marked by who approved it and when");
  assert.ok(!t.includes(W("screen.action.guide.teamnone")), "a group guide is approved");
  const tip = s.querySelector("h2").getAttribute("data-tip").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  assert.ok(tip.includes(W("screen.action.guide.tip1")) && tip.includes(W("screen.action.guide.tip2")), "the tooltip is its two sentences");
  await press(p, "procedureguides");
  assert.equal(p.byOp("procedureguides").length, 2, "'Show the routes' reads again");
  const q = await open(ROUTES.action, { ...DATA_PLANE, procedureguides: ok({ ...GUIDES, guides: GUIDES.guides.slice(0, 1) }) });
  said(q, "screen.action.guide.teamnone");
});

test("R31: 'Templates for this action' draws each offered template with who approved it and when, each not offered by its handle with why, and 'Prepare the text' opens `request`; a court-filed kind draws no template", async () => {
  const p = await open(ROUTES.action, DATA_PLANE);
  const s = section(p, "screen.action.templates.heading");
  const t = s.textContent.replace(/\s+/g, " ");
  assert.ok(t.includes("Records request, with our follow-up questions") && t.includes(W("screen.action.templates.approved", { member: "ana", date: D("2026-09-30") })));
  assert.ok(t.includes("@records-request") && t.includes(W("screen.action.templates.notyet")));
  for (const k of ["screen.action.templates.own", "screen.action.templates.never"]) assert.ok(t.includes(W(k)), k);
  assert.ok(s.querySelector(`a[href="/app/request/${ACTION_ID}"]`).textContent.includes(W("act.communicationprepare.label.request")));
  assert.equal(p.byOp("templatesforaction")[0].query.action, ACTION_ID, "only after the action exists, called with the action");
  const court = await open(ROUTES.action, { ...DATA_PLANE, templatesforaction: ok({ ...TEMPLATES, versions: [], not_offered: [], court_petition: true }) });
  const c = section(court, "screen.action.templates.heading");
  assert.ok(c.textContent.includes(W("screen.action.templates.nocourt")));
  assert.ok(!c.textContent.includes("@records-request") && !c.textContent.includes("Records request, with our follow-up questions"), "no template for a petition filed with a court");
});

test("R31: 'Pressure on this action' draws a legal mark with its date and that no hold is placed, the profile's fact once with its source, the doors to `hold` and `grouprules`; control: no mark, no fact", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, pressurefor: ok({ ...PRESSURE, facts: FACTS }) });
  const s = section(p, "screen.action.pressuremarks");
  const t = s.textContent.replace(/\s+/g, " ");
  assert.ok(t.includes(W("screen.action.legalmark", { member: "mai" })) && t.includes(D("2026-10-04")) && t.includes(W("screen.action.holdnone")));
  assert.ok(t.includes(FACTS[0].statement) && t.includes("Code Civ. Proc. § 425.16"), "the profile's fact, with its source");
  assert.equal(t.split(FACTS[0].statement).length, 2, "once");
  assert.ok(t.includes(W("screen.action.profilefact.from")) && t.includes(W("screen.action.profilefact.shown")) && t.includes(W("guide.procedure.legalinfo")));
  assert.equal(s.querySelector(`a[href="/app/hold/${ACTION_ID}"]`).textContent, W("screen.action.hold.link"));
  assert.equal(s.querySelector(`a[href="/app/grouprules/"]`).textContent, W("screen.action.rule.link"));
  const held = await open(ROUTES.action, { ...DATA_PLANE, pressurefor: ok({ ...PRESSURE, items: [{ ...PRESSURE.items[0], hold: "in_place" }], facts: FACTS }) });
  said(held, "screen.action.held");
  unsaid(held, "screen.action.holdnone");
  const retaliation = { ...PRESSURE.items[0], kind: "retaliation", hold: null };
  const r = await open(ROUTES.action, { ...DATA_PLANE, pressurefor: ok({ ...PRESSURE, items: [retaliation], facts: [] }) });
  assert.ok(!text(r).includes(FACTS[0].statement), "control: a retaliation mark alone draws no fact");
  assert.equal(main(r).querySelector(`a[href="/app/hold/${ACTION_ID}"]`), null, "nor the door to a hold");
  const none = await open(ROUTES.action, { ...DATA_PLANE, pressurefor: ok({ ...PRESSURE, items: [], facts: [] }) });
  assert.equal(section(none, "screen.action.pressuremarks"), undefined, "an action with no mark draws no pressure fact");
  const bad = await open(ROUTES.action, { ...DATA_PLANE, pressurefor: ok({ ...PRESSURE, facts: null }) });
  assert.ok(section(bad, "screen.action.pressuremarks").querySelector('[data-state="failed"]'), "a profile that cannot be read is drawn as failed, never as no fact");
});
