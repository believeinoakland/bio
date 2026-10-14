/* The runner, the dock's wizard guide, at its interface (R2–R7, R9), over the shell's side as the contract states it
   (`standin.mjs`; J2, J3, K3143): a two-screen script with a side trip walked step by step, every request checked. */
import test from "node:test";
import assert from "node:assert/strict";
import { standIn, said, unhtml } from "./standin.mjs";
import { GUIDE, WELCOME, FIRST_QUESTION, WELCOME_AT, GUIDE_OPS } from "../../../src/screens-wizards/index.mjs";
import { WELCOME_SCRIPT, FIRSTQ_SCRIPT } from "./fixtures.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";

const ok = (result) => ({ ok: true, result });
const TRIP = { id: "WIZ-00000000000000f1", name: "Note a tie", steps: [
  { screen: "ties", act: "declaretie", what: "Name the tie", why: "So readers know" },
  { screen: "ties", act: null, what: "That is all", why: "Done" }] };
const WALK = { id: "WIZ-00000000000000e1", version: "WIZ-00000000000000e1@1", name: "Check a pothole report", steps: [
  { screen: "finder", act: "search", what: "Search the city's reports", why: "It may already be recorded" },
  { screen: "document", act: "cite", what: "Point at the passage", why: "So the claim has its source", draft: { text: "The city says it repairs within 48 hours." } },
  { screen: "document", act: null, what: "If you hold a tie, say so", why: "Readers must know", via: TRIP.id },
  { screen: "question", act: "testify", what: "Say what you saw", why: "Your own account counts", draft: { machine: "writinghelp" } }] };
const read = (q) => {
  const s = [WALK, TRIP, { ...WELCOME_SCRIPT, version: `${WELCOME}@1` }, { ...FIRSTQ_SCRIPT, version: `${FIRST_QUESTION}@1` }].find((x) => x.id === q.script);
  return s ? ok({ ok: true, script: { id: s.id, name: s.name, origin: s.id.startsWith("WIZ-0") ? "group" : "civicsmith" },
    version: { id: q.version || s.version || `${s.id}@1`, state: "approved", steps: s.steps } }) : { ok: false, code: "NO_SUCH_WIZARD", translation: "no such wizard" };
};
const AT = (q) => ok({ ok: true, screen: q.screen, scripts: q.screen === "finder"
  ? [{ id: WALK.id, version: WALK.version, name: WALK.name, steps: WALK.steps, approver: { id: "rosa" }, finished: 7 },
     { id: "WIZ-00000000000000d1", version: "WIZ-00000000000000d1@1", name: "My search draft", steps: [{ screen: "finder", act: "search", what: "a", why: "b" }], approver: null, finished: 0, draft: true }]
  : [] });
const DRAWN = { finder: ["search"], document: ["cite"], ties: ["declaretie"], question: ["testify"], home: [] };
const plane = (over = {}) => ({ wizardread: read, wizardsat: AT, wizardprogress: ok({ ok: true }), ...over });
const ACT_OPS = new Set(Object.keys(OPS).filter((op) => OPS[op].mutating !== false && op !== "wizardprogress"));
const sentActs = (g) => g.requests.filter((r) => ACT_OPS.has(r.op) || r.op === "wizarddraft");

test("R2 a wizard starts from a screen's wizard mark (wizardsat): each offered script with its finished count, the member's own drafts", async () => {
  const g = standIn({ plane: plane(), drawn: DRAWN });
  await g.enter("finder");
  assert.deepEqual(g.requests.map((r) => [r.op, r.query.screen]), [["wizardsat", "finder"]]);
  assert.ok(unhtml(g.marks()).includes(said("wizard.marks.chip", { n: "2" })));
  await g.control("chip");
  const m = unhtml(g.marks());
  assert.ok(m.includes(said("screen.guide.mark.start", { name: WALK.name })) && m.includes(said("screen.guide.mark.finished", { n: "7" })));
  assert.ok(m.includes(said("screen.guide.mark.draft")));
  // control: a screen with no script draws no mark
  await g.enter("document");
  assert.equal(g.marks(), "");
});

test("R2 the guide walks a two-screen script: name, step i of n, what and why, Back and Next, Stop; opens each screen and rings each act once; presses nothing", async () => {
  const g = standIn({ plane: plane(), drawn: DRAWN, fields: { cite: "cite-text" } });
  await g.enter("finder");
  await g.control("start", { script: WALK.id, version: WALK.version, at: "1" });
  let text = g.text();
  assert.ok(text.includes(`${WALK.name} · ${said("guide.step", { i: "1", n: "4" })}`));
  assert.ok(text.includes(WALK.steps[0].what) && text.includes(WALK.steps[0].why));
  assert.ok(text.includes(said("screen.guide.next")) && !text.includes(said("screen.guide.back")), "no Back on the first step");
  assert.ok(text.includes(said("guide.stopping")) && text.includes(said("screen.guide.stop")));
  assert.ok(text.includes(said("guide.showwhere")) && text.includes("Alt+Shift+W"));
  assert.deepEqual(g.rings, ["search"]);
  // "Show me where" (and Alt+Shift+W) rings it again, as often as asked
  await g.control("where");
  await g.ring();
  assert.deepEqual(g.rings, ["search", "search", "search"]);
  // Next opens the step's screen (`cs.go`) and rings its act there, once
  await g.control("next");
  assert.deepEqual(g.nav, [["document", null]]);
  assert.deepEqual(g.rings.slice(3), ["cite"]);
  text = g.text();
  assert.ok(text.includes(said("guide.step", { i: "2", n: "4" })) && text.includes(said("screen.guide.back")));
  await g.control("back");
  assert.deepEqual(g.nav.at(-1), ["finder", null]);
  // nothing the runner sent is an act: only reads and the tally
  assert.deepEqual(sentActs(g), []);
  assert.deepEqual([...new Set(g.requests.map((r) => r.op))].sort(), ["startfrom", "wizardprogress", "wizardread", "wizardsat"]);
});

test("R2 a step whose act the screen does not draw for this member says so and offers Next", async () => {
  const g = standIn({ plane: plane(), drawn: { finder: [] } });
  await g.enter("finder");
  await g.control("start", { script: WALK.id, version: WALK.version, at: "1" });
  assert.deepEqual(g.rings, ["search"]);
  assert.ok(g.text().includes(said("screen.guide.absent")));
  assert.ok(g.text().includes(said("screen.guide.next")));
  // control: drawn, it says nothing of the kind
  const h = standIn({ plane: plane(), drawn: DRAWN });
  await h.enter("finder");
  await h.control("start", { script: WALK.id, version: WALK.version, at: "1" });
  assert.ok(!h.text().includes(said("screen.guide.absent")));
});

test("R2 a Civicsmith script's name and step words are read by their keys wizard.<id>.*; cs.wizard from Home's doors starts it", async () => {
  const g = standIn({ plane: plane(), drawn: DRAWN });
  await g.enter("home");
  await g.start({ script: { id: FIRST_QUESTION, version: `${FIRST_QUESTION}@1`, name: "x", start: "project" }, version: null });
  const text = g.text();
  assert.ok(text.includes(said(`wizard.${FIRST_QUESTION}.name`)));
  assert.ok(text.includes(said(`wizard.${FIRST_QUESTION}.step1.what`)) && text.includes(said(`wizard.${FIRST_QUESTION}.step1.why`)));
  assert.deepEqual(g.nav, [["project", null]]);
  // a script it cannot read says so in the dock and runs nothing
  const h = standIn({ plane: plane() });
  await h.start({ script: "WIZ-0000000000000404" });
  assert.ok(h.text().includes(said("screen.guide.failed", { reason: "no such wizard" })));
  assert.deepEqual(h.progress(), []);
});

test("R3 recording: each act pressed is added as {screen, act}, never a value; a pair may be removed; saving sends wizarddraft with recorded and the name", async () => {
  const g = standIn({ plane: plane(), values: { "wz-rec-name": "  Check a claim, our way " } });
  await g.start({ script: null, version: null, record: { project: "P1" } });
  assert.ok(g.text().includes(said("screen.guide.recording")) && g.text().includes(said("screen.guide.recording.empty")));
  await g.pressed("search", "finder", { value: "secret words", field: "q" });
  await g.pressed("cite", "document");
  await g.pressed("testify", "question");
  assert.deepEqual(g.view.ui.rec.pairs, [{ screen: "finder", act: "search" }, { screen: "document", act: "cite" }, { screen: "question", act: "testify" }]);
  await g.control("unrecord", { i: "1" });
  const req = await g.act("wizarddraft");
  assert.deepEqual(req.body, { project: "P1", name: "Check a claim, our way", recorded: [{ screen: "finder", act: "search" }, { screen: "question", act: "testify" }] });
  assert.ok(!JSON.stringify(g.requests).includes("secret words"));
  assert.ok(g.text().includes(said("screen.guide.recording.saved")));
  // controls: not recording, a press records nothing; nothing recorded or no name sends nothing
  await g.pressed("search", "finder");
  assert.equal(g.view.ui.rec, null);
  const h = standIn({ values: { "wz-rec-name": "x" } });
  await h.start({ record: { project: "P1" } });
  assert.deepEqual(await h.act("wizarddraft"), { refuse: "screen.guide.recording.none" });
  await h.pressed("search", "finder");
  h.values["wz-rec-name"] = " ";
  assert.deepEqual(await h.act("wizarddraft"), { refuse: "screen.guide.recording.noname" });
  await h.control("recstop");
  assert.equal(h.text(), "");
  assert.deepEqual(h.requests, []);
});

test("R4 a text draft is placed in the act's field by cs.fill, labelled \"Draft · from the wizard\", and never submitted", async () => {
  const g = standIn({ plane: plane(), drawn: DRAWN, fields: { cite: "cite-text" } });
  await g.enter("finder");
  await g.control("start", { script: WALK.id, version: WALK.version, at: "2" });
  assert.deepEqual(g.fills.map((f) => ({ ...f, label: unhtml(f.label) })), [{ id: "cite-text", value: WALK.steps[1].draft.text, label: said("screen.guide.draft.text") }]);
  assert.ok(g.text().includes(said("guide.draft")) && g.text().includes(said("screen.guide.draft.placed")));
  assert.deepEqual(sentActs(g), []);
  // ringing again places nothing twice
  await g.control("where");
  assert.equal(g.fills.length, 1);
  // control: with no field for the act on the screen, nothing is filled and the draft is shown in the dock
  const h = standIn({ plane: plane(), drawn: DRAWN });
  await h.enter("document");
  await h.control("start", { script: WALK.id, version: WALK.version, at: "2" });
  assert.deepEqual(h.fills, []);
  assert.ok(h.text().includes(said("screen.guide.draft.nofield")) && h.text().includes(WALK.steps[1].draft.text));
});

test("R4 a {machine} draft is asked only while the assistant is reachable and at the press of \"Draft it\", labelled with who asked, untested when the answer says so", async () => {
  const at4 = { script: WALK.id, version: WALK.version, at: "4" };
  // not reachable: no machine draft offered, nothing asked
  const off = standIn({ plane: plane(), drawn: DRAWN, fields: { testify: "t-words" } });
  await off.enter("question");
  await off.control("start", at4);
  assert.ok(!off.text().includes(said("screen.guide.draftit")));
  await off.control("draftit");
  assert.ok(!off.requests.some((r) => r.op === "writinghelp"));
  // reachable: offered; nothing asked until the press
  const answer = ok({ ok: true, text: "I saw the hole on 4 October.", label: { kind: "machine", asked_by: "member:mai" }, untested: "Not yet tested" });
  const g = standIn({ plane: plane({ writinghelp: answer }), reachable: true, drawn: DRAWN, fields: { testify: "t-words" }, values: { "t-words": "hole on fourth" } });
  await g.enter("question");
  await g.control("start", at4);
  assert.ok(g.text().includes(said("screen.guide.draftit")));
  assert.ok(!g.requests.some((r) => r.op === "writinghelp"));
  await g.control("draftit");
  const asked = g.requests.filter((r) => r.op === "writinghelp");
  assert.equal(asked.length, 1);
  assert.deepEqual({ op: asked[0].body.op, field: asked[0].body.field, told: asked[0].body.told }, { op: "testify", field: "t-words", told: "hole on fourth" });
  assert.deepEqual(g.fills.map((f) => ({ ...f, label: unhtml(f.label) })), [{ id: "t-words", value: "I saw the hole on 4 October.", label: said("screen.guide.draft.machine", { handle: "mai" }) }]);
  assert.ok(g.text().includes(said("ai.label.untested")));
  assert.deepEqual(sentActs(g), [], "the draft is never submitted");
  // control: an answer without `untested` carries no such label; a refusal places nothing
  const h = standIn({ plane: plane({ writinghelp: ok({ ok: true, text: "x", label: { asked_by: "member:mai" } }) }), reachable: true, drawn: DRAWN, fields: { testify: "t" } });
  await h.enter("question");
  await h.control("start", at4);
  await h.control("draftit");
  assert.ok(!h.text().includes(said("ai.label.untested")));
  const r = standIn({ plane: plane({ writinghelp: { ok: false, code: "WRITING_HELP_REFUSED", translation: "not this act" } }), reachable: true, drawn: DRAWN, fields: { testify: "t" } });
  await r.enter("question");
  await r.control("start", at4);
  await r.control("draftit");
  assert.deepEqual(r.fills, []);
  assert.ok(r.text().includes(said("screen.guide.draft.refused", { reason: "not this act" })));
});

test("R5 a step with via starts a side trip, says so, and returns to the step left when it finishes or is stopped", async () => {
  const g = standIn({ plane: plane(), drawn: DRAWN });
  await g.enter("finder");
  await g.control("start", { script: WALK.id, version: WALK.version, at: "2" });
  await g.control("next");
  // the trip: read, counted as its own script's use, its first screen opened and its act rung
  assert.ok(g.requests.some((r) => r.op === "wizardread" && r.query.script === TRIP.id));
  let text = g.text();
  assert.ok(text.includes(said("guide.sidetrip", { wizard: TRIP.name })));
  assert.ok(text.includes(TRIP.steps[0].what) && text.includes(said("guide.step", { i: "1", n: "2" })));
  assert.deepEqual(g.nav.at(-1), ["ties", null]);
  assert.equal(g.rings.at(-1), "declaretie");
  await g.control("next");
  await g.control("next");
  // back at the step left (step 3 of the walk), not started again
  text = g.text();
  assert.ok(text.includes(WALK.steps[2].what) && text.includes(said("guide.step", { i: "3", n: "4" })));
  assert.ok(!text.includes(said("guide.sidetrip", { wizard: TRIP.name })));
  assert.deepEqual(g.progress().filter((p) => p.script === TRIP.id).map((p) => p.event), ["start", "step", "step", "finish"]);
  // stopped part-way, the trip returns too, and sends nothing for the stop
  const h = standIn({ plane: plane(), drawn: DRAWN });
  await h.control("start", { script: WALK.id, version: WALK.version, at: "3" });
  const before = h.requests.length;
  await h.control("stop");
  assert.ok(h.text().includes(WALK.steps[2].what) && h.text().includes(said("guide.step", { i: "3", n: "4" })));
  assert.deepEqual(h.requests.slice(before).filter((r) => r.op === "wizardprogress"), []);
});

test("R6 progress goes only through wizardprogress (start, each step reached, finish), naming nothing of the member; stopping sends nothing", async () => {
  const g = standIn({ plane: plane(), drawn: DRAWN, me: { member: "mai", handle: "mai" } });
  await g.enter("finder");
  await g.control("start", { script: WALK.id, version: WALK.version, at: "1" });
  await g.control("next");
  await g.control("back");
  await g.control("next");
  assert.deepEqual(g.progress(), [
    { script: WALK.id, version: WALK.version, event: "start" },
    { script: WALK.id, version: WALK.version, event: "step", step: 1 },
    { script: WALK.id, version: WALK.version, event: "step", step: 2 }]);
  const before = g.requests.length;
  await g.control("stop");
  assert.equal(g.requests.length, before, "stopping sends nothing");
  assert.equal(g.text(), "");
  // a finished walk counts its finish
  const h = standIn({ plane: plane(), drawn: DRAWN });
  await h.control("start", { script: TRIP.id, at: "1" });
  await h.control("next");
  await h.control("next");
  assert.deepEqual(h.progress().map((p) => p.event), ["start", "step", "step", "finish"]);
  assert.ok(h.text().includes(said("screen.guide.finished", { name: TRIP.name })));
  // the member's own draft runs privately: nothing counted
  const d = standIn({ plane: plane(), drawn: DRAWN });
  await d.enter("finder");
  await d.start({ script: { id: "WIZ-00000000000000d1", version: "WIZ-00000000000000d1@1", name: "My search draft", draft: true,
    steps: [{ screen: "finder", act: "search", what: "a", why: "b" }, { screen: "finder", act: null, what: "c", why: "d" }] } });
  assert.ok(d.view.ui.run && d.view.ui.run.private);
  await d.control("next");
  await d.control("next");
  assert.deepEqual(d.progress(), []);
  // the run's place is in the page's memory only: no device note, no address
  assert.deepEqual([...g.store.keys()], []);
  assert.ok(g.nav.every(([, subject]) => subject === null));
});

test("R6 nothing names the member: no request beyond wizardprogress's unattributed tally carries the member, and a wizard's draft run counts nothing", async () => {
  const g = standIn({ plane: plane(), drawn: DRAWN, me: { member: "member-sentinel-7", handle: "handle-sentinel-7" } });
  await g.enter("finder");
  await g.control("start", { script: WALK.id, version: WALK.version, at: "1" });
  for (let i = 0; i < 5; i++) await g.control("next");
  assert.ok(!JSON.stringify(g.requests).includes("sentinel-7"));
  for (const p of g.progress()) assert.deepEqual(Object.keys(p).filter((k) => !["script", "version", "event", "step"].includes(k)), []);
});

test("R7 Home offers \"Welcome a new member\" first and \"Your first question\" after it, until each is finished on this device; offered, never forced", async () => {
  const g = standIn({ plane: plane(), drawn: DRAWN, me: { member: "mai", handle: "mai" } });
  await g.enter("home");
  await g.control("chip");
  const m = unhtml(g.marks());
  const welcome = said("screen.guide.welcome.continue", { name: said(`wizard.${WELCOME}.name`) });
  const first = said("screen.guide.mark.start", { name: said(`wizard.${FIRST_QUESTION}.name`) });
  assert.ok(m.indexOf(welcome) >= 0 && m.indexOf(first) > m.indexOf(welcome));
  assert.equal(g.text(), "", "nothing runs until the member starts it");
  // the welcome offered on Home continues at step 3, on a working screen
  await g.control("start", { script: WELCOME, at: String(WELCOME_AT) });
  assert.ok(g.text().includes(said(`wizard.${WELCOME}.step3.what`)));
  assert.ok(g.text().includes(said("guide.step", { i: "3", n: String(WELCOME_SCRIPT.steps.length) })));
  for (let i = WELCOME_AT; i <= WELCOME_SCRIPT.steps.length; i++) await g.control(g.view.ui.run && g.view.ui.run.parent ? "stop" : "next");
  while (g.view.ui.run) await g.control(g.view.ui.run.parent ? "stop" : "next");
  // the finish is kept on the device under K3143's key, and never sent
  assert.equal(g.store.get(`bio-wizard-finished:mai:${WELCOME}`), "1");
  assert.ok(!JSON.stringify(g.requests).includes("bio-wizard-finished"));
  await g.enter("home");
  if (!g.view.ui.marksOpen) await g.control("chip");
  const after = unhtml(g.marks());
  assert.ok(!after.includes(welcome) && after.includes(first));
  // the ceremony's required wizard is its own screen's mark (wizardsat on `ceremony`)
  const c = standIn({ plane: plane({ wizardsat: ok({ ok: true, screen: "ceremony", scripts: [{ id: "WIZ-426b9c2e8b128b6b", version: "WIZ-426b9c2e8b128b6b@2", name: "Publication ceremony", steps: [], finished: 0 }] }) }) });
  await c.enter("ceremony");
  await c.control("chip");
  assert.ok(unhtml(c.marks()).includes(said("screen.guide.mark.start", { name: said("wizard.WIZ-426b9c2e8b128b6b.name") })));
});

test("R7 after join the welcome continues at step 3: its join steps counted once by the enrolment (start, step 3); \"Not now\" keeps the offer", async () => {
  const g = standIn({ plane: plane(), drawn: DRAWN });
  await g.start({ script: WELCOME, version: null, joined: true });
  await g.start({ script: WELCOME, version: null, joined: true });
  assert.deepEqual(g.progress(), [{ script: WELCOME, version: `${WELCOME}@1`, event: "start" }, { script: WELCOME, version: `${WELCOME}@1`, event: "step", step: WELCOME_AT }]);
  assert.equal(g.text(), "", "joined, nothing runs by itself");
  await g.enter("home");
  let m = unhtml(g.marks());
  assert.ok(m.includes(said("screen.guide.welcome")) && m.includes(said("screen.guide.notnow")));
  await g.control("notnow");
  await g.control("chip");
  m = unhtml(g.marks());
  assert.ok(!m.includes(said("screen.guide.welcome")), "the offer folds away");
  assert.ok(m.includes(said("screen.guide.welcome.continue", { name: said(`wizard.${WELCOME}.name`) })), "and is kept as Home's mark");
  // starting it at step 3 counts neither its start nor step 3 again
  await g.control("start", { script: WELCOME, at: String(WELCOME_AT) });
  assert.equal(g.progress().length, 2);
  await g.control("next");
  assert.deepEqual(g.progress().at(-1), { script: WELCOME, version: `${WELCOME}@1`, event: "step", step: WELCOME_AT + 1 });
});

test("R9 nothing records which member walked, stopped or finished which wizard: no request but the tally, no device note but the finish", async () => {
  const g = standIn({ plane: plane(), drawn: DRAWN, me: { member: "mai", handle: "mai" } });
  await g.enter("finder");
  await g.control("start", { script: WALK.id, version: WALK.version, at: "1" });
  await g.control("next");
  await g.control("stop");
  await g.control("start", { script: TRIP.id, at: "1" });
  await g.control("next");
  await g.control("next");
  const ops = new Set(g.requests.map((r) => r.op));
  for (const op of ops) assert.ok(["wizardsat", "wizardread", "wizardprogress", "startfrom"].includes(op), `${op} sent`);
  assert.deepEqual([...g.store.keys()], [], "a script other than the welcome or the first question leaves no device note");
  assert.ok(!JSON.stringify(g.requests).includes("mai"));
});

test("R2 R4 the guide's ops are the plane's: every op it calls is in OPS, and none of its controls is an act", () => {
  for (const op of GUIDE_OPS) assert.ok(Object.hasOwn(OPS, op), op);
  assert.deepEqual(GUIDE.acts.map((a) => a.op), ["wizarddraft"]);
  for (const k of ["render", "marks", "start", "entered", "pressed", "ring", "control"]) assert.equal(typeof GUIDE[k], "function", k);
});
