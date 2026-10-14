/* screens-action R5, R10, R12, R16, R17 (and R7 on `action`): one action, its replies, due dates, pressure, holds, scope, the law
   it goes under and its risk. Every sentence is asserted by its key through `setup-words` (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, crumbs, text, ops, press, last, ok, beside, button, refusedIn, W, D, hasWord, DATA_PLANE, ROUTES, ACTION, ACTION_ID, FILINGS, PRESSURE, PROJECT, PROFILES, draft } from "./page.mjs";

const said = (p, key, vars) => assert.ok(text(p).includes(W(key, vars)), key);
const unsaid = (p, key, vars) => assert.ok(!text(p).includes(W(key, vars)), key);
const OFFICE = "City Clerk, Office of the City Clerk";

test("R5: reads the action: what it is, to whom (by role, with who holds it today), when and by whom it was sent, its replies; the wait while one is owed", async () => {
  const p = await open(ROUTES.action, DATA_PLANE);
  assert.equal(p.byOp("action")[0].query.id, ACTION_ID);
  said(p, "screen.action.kind.records_request");
  said(p, "screen.action.to", { office: OFFICE });
  said(p, "screen.request.holder", { holder: "Asha Rao" });
  said(p, "screen.action.sentby", { date: D("2026-10-02"), who: "mai" });
  said(p, "screen.action.waiting", { office: OFFICE });
  assert.ok(text(p).includes(D("2026-10-03")));
  assert.ok(text(p).includes(`${W("screen.action.received")} · Office of the City Clerk · email`));
  const q = await open(ROUTES.action, { ...DATA_PLANE, action: ok({ ...ACTION, reply_owed: { owed: false } }) });
  unsaid(q, "screen.action.waiting", { office: OFFICE });
});

test("R5 (action-producers R1; v0.2 rule 6): each due date is drawn with mark.due and opens due-date; a passed one is canon's question, never 'overdue' until a member determines it", async () => {
  const p = await open(ROUTES.action, DATA_PLANE);
  const dues = main(p).querySelectorAll(".cs-due");
  assert.equal(dues.length, 2);
  assert.ok(dues.every((d) => d.getAttribute("data-tip")), "mark.due explains itself");
  assert.ok(main(p).querySelector(`a[href="/app/due-date/${encodeURIComponent(ACTION_ID + "~0")}"]`));
  said(p, "screen.action.noreplyby", { date: D("2026-10-12") });
  unsaid(p, "screen.action.clock.overdue");
  const q = await open(ROUTES.action, { ...DATA_PLANE, action: ok({ ...ACTION, clock: [{ ...ACTION.clock[0], status: "overdue" }] }) });
  said(q, "screen.action.clock.overdue");
});

test("R5: 'Record a reply' sends actioncorrespond with the day and the member's account; 'Mark a reply as pressure' marks a received one once", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, actioncorrespond: ok({}), actionpressure: ok({}) });
  const b = await press(p, "actioncorrespond", { reason: "it came" });
  assert.ok(beside(p, b).includes(W("screen.action.reply.at.needed")));
  await press(p, "actioncorrespond", { values: { "reply-at": "2026-10-11", "reply-account": "They will answer by 26 October." }, reason: "it came" });
  const r = last(p, "actioncorrespond");
  assert.deepEqual([r.query.target, r.query.direction, r.query.at, r.query.account], [ACTION_ID, "received", "2026-10-11", "They will answer by 26 October."]);
  await press(p, "actionpressure", { values: { "pressure-kind-2": "discrediting", "pressure-note-2": "called us saboteurs" }, reason: "x" });
  assert.deepEqual({ ...last(p, "actionpressure").body, reason: undefined }, { target: ACTION_ID, ord: 2, pressure: { kind: "discrediting", note: "called us saboteurs" }, reason: undefined });
  const q = await open(ROUTES.action, { ...DATA_PLANE, action: ok({ ...ACTION, entries: [{ ord: 2, pressure: { kind: "legal", note: "x" } }] }) });
  assert.ok(!ops(q).includes("actionpressure"), "control: a marked reply is marked once");
  said(q, "screen.action.pressure.legal");
});

test("R5: 'Move the action' to a state its edges allow, with the reason in the query actions reads; resolving names how", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, actionmove: ok({}) });
  const to = p.doc.getElementById("move-to").querySelectorAll("option").map((o) => o.value);
  assert.deepEqual(to, ["active", "resolved", "abandoned"]);
  await press(p, "actionmove", { values: { "move-to": "resolved", "move-resolution": "complied" }, reason: "the logs came" });
  const r = last(p, "actionmove");
  assert.deepEqual([r.query.target, r.query.to, r.query.resolution, r.query.reason], [ACTION_ID, "resolved", "complied", "the logs came"]);
});

test("R5: 'Remind me' on a dated entry; 'Record a litigation hold' with a reason, then drawn as in place; confidential or not with a reason, a published case keeping what it said", async () => {
  let hold = null;
  const p = await open(ROUTES.action, { ...DATA_PLANE, reminderset: ok({}), actionhold: () => { hold = "in_place"; return ok({}); },
    actionholdpreview: () => ok({ target: ACTION_ID, hold }), actionscope: ok({}) });
  await press(p, "reminderset", { nth: 1, values: { "remind-1": "2099-10-20" } });
  assert.deepEqual(last(p, "reminderset").body, { target: ACTION_ID, entry: 1, on: "2099-10-20" });
  said(p, "screen.action.scope.open");
  await press(p, "actionhold", { reason: "a claim is coming" });
  assert.deepEqual(last(p, "actionhold").body, { target: ACTION_ID, hold: "in_place", reason: "a claim is coming" });
  said(p, "screen.action.held");
  assert.ok(!ops(p).includes("actionhold"));
  await press(p, "actionscope", { reason: "names a witness" });
  assert.deepEqual(last(p, "actionscope").body, { target: ACTION_ID, confidential: true, reason: "names a witness" });
});

test("R10 (DEC-212): an action holding an approved, unsent text offers to pick up where it was left, opening the request at its send step; control: none without one", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, filingsfor: ok(FILINGS([draft({ approval: { approved_by: "member:mai", at: "x", sha: "s" } })])) });
  said(p, "screen.action.unsent");
  const a = main(p).querySelectorAll("a").find((x) => x.textContent.includes(W("screen.action.pickup")));
  assert.equal(a.getAttribute("href"), `/app/request/${ACTION_ID}`);
  const q = await open(ROUTES.action, DATA_PLANE);
  unsaid(q, "screen.action.pickup");
});

/* ---------- R12 (T48; N1035; K3145; actions R102; action-holds R16) ---------- */

test("R12: the action heads the screen with its title and its project as a reference, each as `action` answers them; control: a null is drawn absent, never as 'untitled'", async () => {
  const p = await open(ROUTES.action, DATA_PLANE);
  assert.equal(main(p).querySelector("h1").textContent, "Inspection logs, 2025");
  assert.deepEqual(crumbs(p).slice(1), ["Pothole repairs", W("screen.action.name")], "the project step is named by its title");
  assert.equal(p.byOp("file").length, 0, "the project comes from the action's own answer, not from its document");
  const bare = await open(ROUTES.action, { ...DATA_PLANE, action: ok({ ...ACTION, title: null, project: null }) });
  assert.equal(main(bare).querySelector("h1").textContent, W("screen.action.name"), "no title: the screen's own name");
  assert.doesNotMatch(text(bare), /untitled/i);
  assert.equal(crumbs(bare).length, 2, "no project: no project step");
});

test("R12: the pressure marks from pressurefor are drawn with where each arrived; control: a mark on another action is not drawn", async () => {
  const p = await open(ROUTES.action, DATA_PLANE);
  assert.equal(p.byOp("pressurefor")[0].query.action, ACTION_ID);
  said(p, "screen.action.pressuremarks");
  said(p, "screen.action.pressuremark.reply", { ord: "2" });
  said(p, "screen.action.pressuremark.by", { who: "mai" });
  assert.ok(text(p).includes(`${W("screen.action.pressure.legal")} · a letter from the city's counsel`));
  assert.ok(text(p).includes(D("2026-10-04")));
  const other = { arrived: { action: "ACTN-2026-ffffffffffffffff", ord: 1 }, project: PROJECT, kind: "retaliation", note: "a threat on the other action", by: "member:dev", at: "2026-10-05T09:00:00Z" };
  const q = await open(ROUTES.action, { ...DATA_PLANE, pressurefor: ok({ ...PRESSURE, items: [...PRESSURE.items, other] }) });
  assert.doesNotMatch(text(q), /a threat on the other action/);
  const none = await open(ROUTES.action, { ...DATA_PLANE, pressurefor: ok({ ...PRESSURE, items: [] }) });
  unsaid(none, "screen.action.pressuremarks");
  const failed = await open(ROUTES.action, { ...DATA_PLANE, pressurefor: { status: 502, text: "boom" } });
  assert.ok(main(failed).querySelector('[data-state="failed"]'), "a failed read is drawn as failed");
});

test("R12: the marks are paged by `after`: the next page is read from the cursor until none follows", async () => {
  const mark = (ord, note) => ({ arrived: { action: ACTION_ID, ord }, project: PROJECT, kind: "other", note, by: "member:mai", at: "2026-10-04T09:00:00Z" });
  const pages = { undefined: { ...PRESSURE, items: [mark(2, "first page")], truncated: true, cursor: `${ACTION_ID}#2` },
    [`${ACTION_ID}#2`]: { ...PRESSURE, items: [mark(3, "second page")], truncated: true, cursor: `${ACTION_ID}#3` },
    [`${ACTION_ID}#3`]: { ...PRESSURE, items: [mark(4, "third page")], truncated: false, cursor: null } };
  const p = await open(ROUTES.action, { ...DATA_PLANE, pressurefor: (r) => ok(pages[r.query.after]) });
  for (const s of ["first page", "second page", "third page"]) assert.ok(text(p).includes(s), s);
  assert.deepEqual(p.byOp("pressurefor").map((r) => r.query.after), [undefined, `${ACTION_ID}#2`, `${ACTION_ID}#3`]);
});

/* ---------- R16 (T49; N1093; DEC-239 (1); actions R18, R25; action-records R1): the law it goes under ---------- */

const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) };
const section = (p, titleKey) => main(p).querySelectorAll("section.cs-section").find((s) => (s.querySelector("h2") || { textContent: "" }).textContent.trim() === W(titleKey));

test("R16: the law chosen is drawn by level and citation with its window and who stated it, and when; a proposal is drawn apart, never as the law", async () => {
  const p = await open(ROUTES.action, DATA_PLANE);
  const law = section(p, "law.title");
  assert.ok(law, "law.title");
  assert.ok(hasWord("law.help"));
  const t = law.textContent.replace(/\s+/g, " ");
  assert.ok(t.includes(`${W("screen.request.level.state")} · Gov. Code § 7922.535(b) · ${W("screen.request.window.calendar", { n: "10" })}`), "level, citation and the profile's window");
  assert.ok(t.includes(W("law.stated", { who: "mai", date: D("2026-10-01") })));
  assert.ok(t.includes(W("law.proposed")));
  assert.ok(t.includes(W("law.proposal.not", { who: "claude", date: D("2026-10-02") }).replace("claude", "agent:claude")), "who proposed it, and when, not the law");
  // control: the proposal's citation is under the proposal, not among the laws chosen
  const sheets = law.querySelectorAll(".cs-sheet");
  assert.ok(!sheets[0].textContent.includes("Mun. Code § 2.20.230"), "a proposal is never drawn as the law");
  assert.ok(sheets[1].textContent.includes("Mun. Code § 2.20.230"));
  assert.equal(p.byOp("profiles").length, 1, "the laws the group's places name are read");
});

test("R16: an undetermined list is drawn as law.undetermined; control: nothing is drawn as stated", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, action: ok({ ...ACTION, governing_laws: { state: "undetermined", laws: [], by: null, at: null, stated: "x" }, governing_laws_proposals: { proposals: [] } }) });
  const law = section(p, "law.title");
  assert.ok(law.textContent.includes(W("law.undetermined")));
  assert.ok(!law.textContent.includes(W("law.proposed")), "no proposal, none drawn");
  assert.doesNotMatch(law.textContent, /law\.stated|Stated by/);
});

test("R16: 'Change the law…' sends actionlaws with the law chosen from those the group's places name; 'Propose another law…' sends actionlawspropose and changes nothing", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, actionlaws: ok({}), actionlawspropose: ok({}) });
  assert.ok(button(p, "actionlaws").textContent.includes(W("law.change")));
  assert.ok(button(p, "actionlawspropose").textContent.includes(W("law.propose")));
  // the choice offers the laws of this action's kind the places name; the proposal offers those not yet chosen
  assert.deepEqual(p.doc.getElementById("law-pick").querySelectorAll("option").map((o) => o.value), ["Gov. Code § 7922.535(b)", "Mun. Code § 2.20.230"]);
  assert.deepEqual(p.doc.getElementById("lawp-pick").querySelectorAll("option").map((o) => o.value), ["Mun. Code § 2.20.230"]);
  await press(p, "actionlaws", { values: { "law-pick": "Mun. Code § 2.20.230", "law-level": "city" } });
  assert.deepEqual(last(p, "actionlaws").body, { target: ACTION_ID, laws: [{ level: "city", citation: "Mun. Code § 2.20.230" }] });
  await press(p, "actionlawspropose", { values: { "lawp-pick": "Mun. Code § 2.20.230", "lawp-level": "city" } });
  assert.deepEqual(last(p, "actionlawspropose").body, { target: ACTION_ID, laws: [{ level: "city", citation: "Mun. Code § 2.20.230" }] });
  assert.equal(p.byOp("actionlaws").length, 1, "proposing sent no actionlaws");
  // a law already chosen keeps its level when it is chosen again
  await press(p, "actionlaws", { values: { "law-pick": "Gov. Code § 7922.535(b)", "law-level": "federal" } });
  assert.deepEqual(last(p, "actionlaws").body.laws, [{ level: "state", citation: "Gov. Code § 7922.535(b)" }]);
});

test("R16: refusals are drawn by their words, beside the act", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, actionlaws: refusedIn("BAD_CITATION", "That citation is not in a shape that can be kept.") });
  const b = await press(p, "actionlaws", { values: { "law-pick": "Mun. Code § 2.20.230", "law-level": "city" } });
  assert.ok(beside(p, b).includes("That citation is not in a shape that can be kept."), "the owner's sentence where the design holds no word for the code");
});

/* ---------- R17 (T49; N1093; DEC-239 (2); actions R23–R25; action-records R2): its risk ---------- */

test("R17: tier 2 is drawn by key with its words, its latest revision (who, when, the reason, the prior tier's words); control: tier undetermined has its own words", async () => {
  const p = await open(ROUTES.action, DATA_PLANE);
  const risk = section(p, "risk.title");
  assert.ok(risk, "risk.title");
  assert.ok(hasWord("risk.help"));
  const t = risk.textContent.replace(/\s+/g, " ");
  assert.ok(t.includes(`${W("risk.tier", { tier: "2" })} · ${W("risk.tier.2")}`));
  assert.ok(t.includes(W("risk.set", { who: "mai", date: D("2026-10-03"), reason: "the office has fought requests before", prior: W("risk.tier.1") })));
  const q = await open(ROUTES.action, { ...DATA_PLANE, action: ok({ ...ACTION, risk_tier: "undetermined", risk_tier_history: { revisions: [] }, risk_tier_proposals: { proposals: [] } }) });
  const u = section(q, "risk.title");
  assert.ok(u.textContent.includes(W("risk.tier.undetermined")));
  assert.ok(!u.textContent.includes(W("risk.tier", { tier: "1" })));
  assert.ok(!u.textContent.includes(W("risk.proposed")), "no proposal, none drawn");
  for (const n of ["1", "2", "3"]) assert.ok(hasWord(`risk.tier.${n}`));
});

test("R17: 'Revise, with a reason…' sends actionrisktier with the tier and the reason; its refusals are drawn by their words", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, actionrisktier: ok({}) });
  assert.ok(button(p, "actionrisktier").textContent.includes(W("risk.revise")));
  await press(p, "actionrisktier", { values: { "risk-tier": "3" }, reason: "counsel read it" });
  assert.deepEqual(last(p, "actionrisktier").body, { target: ACTION_ID, tier: 3, reason: "counsel read it" });
  assert.ok(hasWord("refusal.RISK_TIER_UNCHANGED"));
  const q = await open(ROUTES.action, { ...DATA_PLANE, actionrisktier: refusedIn("RISK_TIER_UNCHANGED", "the owner's own sentence") });
  const b = await press(q, "actionrisktier", { values: { "risk-tier": "2" }, reason: "same" });
  assert.ok(beside(q, b).includes(W("refusal.RISK_TIER_UNCHANGED")));
  assert.ok(!beside(q, b).includes("the owner's own sentence"));
});

test("R17: a machine proposal is drawn only while the assistant is reachable, apart and labelled; a member's whether or not; control: it is not the tier", async () => {
  const off = await open(ROUTES.action, DATA_PLANE);
  const offRisk = section(off, "risk.title").textContent.replace(/\s+/g, " ");
  assert.ok(offRisk.includes(W("risk.proposed")), "a member's proposal is drawn though the assistant is unreachable");
  assert.ok(offRisk.includes(W("risk.proposal", { who: "asha", tier: "1", words: W("risk.tier.1") })));
  assert.ok(!offRisk.includes(W("risk.proposal", { who: "agent:claude", tier: "3", words: W("risk.tier.3") })), "control: the machine's is not drawn while unreachable");
  const on = await open(ROUTES.action, { ...DATA_PLANE, ...REACH });
  const onRisk = section(on, "risk.title").textContent.replace(/\s+/g, " ");
  assert.ok(onRisk.includes(W("risk.proposal", { who: "agent:claude", tier: "3", words: W("risk.tier.3") })));
  assert.ok(onRisk.includes(W("risk.proposal.not")));
  assert.ok(onRisk.includes(W("mark.origin.machine.name")), "labelled machine work (mark.origin.machine)");
  assert.ok(onRisk.includes(W("risk.tier", { tier: "2" })), "the tier is still the member's 2");
});
