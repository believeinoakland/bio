/* T51 (T51-115): `plan` asks which project again (R18), a `{template}` draft is placed from the template's text (R19), and
   the recording's list draws its pairs with no marker of its own (audit C122, B-36). Answered by the real store through the world's
   door (K5175; `world.mjs`): the scripts are written and approved by the acts that do it, the template by the acts of filing-templates. */
import test from "node:test";
import assert from "node:assert/strict";
import { word } from "../../../src/setup-words/index.mjs";
import { standIn, unhtml, w } from "./standin.mjs";
import { GUIDE_OPS } from "../../../src/screens-wizards/index.mjs";
import { team, authored, template } from "./world.mjs";

const ON_PLAN = [{ screen: "plan", act: "optiondispose", what: "a", why: "b" }, { screen: "timeline", act: null, what: "c", why: "d" }];

test("R18 a step on plan with no project held asks which project in the dock, as record data, and opens plan on the one chosen", async () => {
  const t = await team();
  const s = await authored(t, { name: "Plan it", steps: ON_PLAN });
  const g = standIn({ team: t, as: t.rosa, values: { "wz-subject": t.P2 } });
  await g.enter("home");
  await g.start({ script: s.script });
  assert.deepEqual(g.nav, [], "plan is not opened on nothing");
  assert.ok(g.text().includes(unhtml(word("wizard.subject.project"))));
  const html = g.render();
  const mine = (await t.rosa.read("projectlist")).projects;
  assert.ok(html.includes('id="wz-subject"') && mine.every((x) => html.includes(x.name)), "the member's projects, as data");
  assert.equal(g.requests.filter((r) => r.op === "projectlist").length, 1);
  await g.control("subjectgo");
  assert.deepEqual(g.nav, [["plan", t.P2]], "the chosen project's id is plan's subject");
  // the project is kept for the run: a later step on a project's screen is not asked again
  await g.control("next");
  assert.deepEqual(g.nav.at(-1), ["timeline", t.P2]);
  assert.equal(g.requests.filter((r) => r.op === "projectlist").length, 1, "asked once");
  assert.deepEqual([...g.store.keys()], [], "kept in the page's memory only");
});

test("R18 with no project it draws wizard.subject.none.project in an open fold, offers Next, and goes on", async () => {
  const t = await team();
  const s = await authored(t, { name: "Plan it", steps: ON_PLAN, widen: true });
  const g = standIn({ team: t, as: t.ivy });
  await g.start({ script: s.script });
  const html = g.render();
  assert.ok(/<details[^>]* open[ >]/.test(html));
  assert.equal(unhtml(html.match(/<summary>(.*?)<\/summary>/)[1]), unhtml(word("wizard.subject.none.summary")));
  assert.ok(g.text().includes(unhtml(word("wizard.subject.none.project"))));
  assert.ok(html.includes('data-guide="next"') && !html.includes('id="wz-subject"'));
  assert.deepEqual(g.nav, []);
  await g.control("next");
  assert.ok(g.nav.length === 0 || g.nav[0][0] !== "plan", "Next goes past the plan step");
});

test("R18 a plan screen that draws a list, not the step's act, says so and offers Next; the step rings again once a plan is opened", async () => {
  const t = await team();
  const s = await authored(t, { name: "Plan it", steps: ON_PLAN });
  const g = standIn({ team: t, as: t.rosa, values: { "wz-subject": t.P1 }, drawn: { plan: [] } });
  await g.start({ script: s.script });
  await g.control("subjectgo");
  assert.deepEqual(g.nav, [["plan", t.P1]]);
  assert.ok(g.view.ui.absent === true && g.render().includes("data-guide-absent"), "the guide says the act is not drawn here");
  assert.ok(g.render().includes('data-guide="next"'));
  const rung = g.rings.length;
  g.cs.ring = (op) => { g.rings.push(op); return true; };
  await g.enter("plan", "ACT-PLAN-1");
  assert.ok(g.rings.length > rung, "rung again on entering a plan");
  assert.equal(g.view.ui.absent, false);
});

test("R18 the subject the member is on or last held on plan is a plan's id, never the run's project; other steps ask nothing they need not", async () => {
  const t = await team();
  // the member is on plan (a plan's id as subject) when a step on a project's screen is reached
  const a = await authored(t, { name: "Time then plan", steps: [{ screen: "timeline", act: null, what: "c", why: "d" }, { screen: "plan", act: null, what: "a", why: "b" }] });
  const g = standIn({ team: t, as: t.rosa, values: { "wz-subject": t.P1 } });
  await g.enter("plan", "ACT-PLAN-9");
  await g.start({ script: a.script });
  assert.deepEqual(g.nav, [], "a plan's id does not stand for the project: asked");
  await g.control("subjectgo");
  assert.deepEqual(g.nav, [["timeline", t.P1]]);
  await g.control("next");
  assert.deepEqual(g.nav.at(-1), ["plan", t.P1], "plan opens on the chosen project, not on the plan seen");
  assert.equal(g.requests.filter((r) => r.op === "projectlist").length, 1, "asked once");
  // the plan opened earlier is not the subject of a later step on plan either
  const b = await authored(t, { name: "Plan only", steps: [{ screen: "plan", act: null, what: "a", why: "b" }] });
  const h = standIn({ team: t, as: t.rosa, values: { "wz-subject": t.P2 } });
  await h.enter("plan", "ACT-PLAN-3");
  await h.enter("home");
  await h.start({ script: b.script });
  assert.deepEqual(h.nav, [], "asked, not opened on the plan seen before");
  // control: a step on a screen that needs no subject asks nothing
  const c = await authored(t, { name: "Look", steps: [{ screen: "finder", act: null, what: "a", why: "b" }] });
  const f = standIn({ team: t, as: t.rosa });
  await f.start({ script: c.script });
  assert.deepEqual(f.nav, [["finder", null]]);
  assert.equal(f.requests.filter((r) => r.op === "projectlist").length, 0);
});

const TEMPLATE_STEPS = [{ screen: "finder", act: "search", what: "a", why: "b", draft: { template: "@records-request" } }];

test("R19 a {template} draft reads templatebyhandle with the step's handle and its text reaches the act's field, labelled and never submitted", async () => {
  const t = await team();
  const tpl = await template(t);
  const s = await authored(t, { name: "Ask for it", steps: TEMPLATE_STEPS });
  const g = standIn({ team: t, as: t.mai, drawn: { finder: ["search"] }, fields: { search: "cite-field" } });
  await g.start({ script: s.script });
  const reads = g.requests.filter((r) => r.op === "templatebyhandle");
  assert.deepEqual(reads.map((r) => r.query), [{ name: "@records-request" }]);
  assert.deepEqual(g.fills, [{ id: "cite-field", value: tpl.text, label: w("screen.guide.draft.template") }], "the blanks are left as the template names them");
  assert.ok(g.text().includes(unhtml(word("screen.guide.draft.template"))));
  assert.ok(g.requests.every((r) => ["wizardread", "startfrom", "wizardprogress", "wizardsat", "templatebyhandle"].includes(r.op)), "no act is sent");
  // ringing again places nothing twice
  await g.ring();
  assert.equal(g.fills.length, 1);
});

test("R19 a template not offered places nothing and sends no act; the step shows its words and label", async () => {
  const t = await team();
  const tpl = await template(t);
  const s = await authored(t, { name: "Ask for it", steps: TEMPLATE_STEPS });
  // the team retires its template: the store then offers none by that handle
  await t.rosa.act("templateretire", { body: { template: tpl.template, reason: "replaced" } });
  const g = standIn({ team: t, as: t.mai, drawn: { finder: ["search"] }, fields: { search: "cite-field" } });
  await g.start({ script: s.script });
  assert.equal(g.requests.filter((r) => r.op === "templatebyhandle").length, 1);
  assert.deepEqual(g.fills, []);
  assert.ok(g.requests.every((r) => ["wizardread", "startfrom", "wizardprogress", "wizardsat", "templatebyhandle"].includes(r.op)));
  assert.ok(g.text().includes(unhtml(word("screen.guide.draft.template"))), "the label");
  // control: a step whose act is not drawn reads nothing to place
  const h = standIn({ team: t, as: t.mai, drawn: {} });
  await h.start({ script: s.script });
  assert.deepEqual(h.fills, []);
  assert.equal(h.requests.filter((r) => r.op === "templatebyhandle").length, 0);
});

test("R19 the guide reads templatebyhandle through its declared ops", () => {
  assert.ok(GUIDE_OPS.includes("templatebyhandle"));
});

test("R3 audit C122 the recording's list draws each pair once, numbered once: no list marker beside the number", async () => {
  const t = await team();
  const g = standIn({ team: t, as: t.mai });
  await g.start({ record: { project: t.P1 } });
  await g.pressed("search", "finder");
  await g.pressed("cite", "document");
  const html = g.render();
  assert.ok(!/<(ul|ol|li)[ >]/.test(html), "no list element whose marker would sit before the number");
  assert.equal((html.match(/role="listitem"/g) || []).length, 2);
  assert.ok(html.includes('role="list"'));
  const text = unhtml(html);
  assert.equal((text.match(/(^|\s)1\./g) || []).length, 1);
  assert.equal((text.match(/(^|\s)2\./g) || []).length, 1);
  assert.ok(!/1\.\s*1\./.test(text), "the number is not doubled");
});
