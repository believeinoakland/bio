/* The guide in the real page (R2, R3, R6, R7): `interfacePage(screens, {guide: GUIDE})` booted by interface-shell's harness
   with this module's screen and a Home that starts a wizard by `cs.wizard` (as `screens-daily` R9's doors do), over the real store
   through the world's door (K5175; `world.mjs`). Checks the shell's half of the contract meets this module's (K3143): the dock holds
   the guide, the marks sit under the path, a step's act is rung inside its row panel, and the recording hears acts by op and
   screen only. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot } from "../interface-shell/harness.mjs";
import { SCREENS, GUIDE, WELCOME, FIRST_QUESTION } from "../../../src/screens-wizards/index.mjs";
import { team, authored } from "./world.mjs";
import { said } from "./standin.mjs";

const STEPS = [
  { screen: "wizards", act: "wizardapprove", what: "Make it the team's", why: "Every member then runs it" },
  { screen: "wizards", act: "wizardretire", what: "Or retire it", why: "If it is not needed" }];
/** A Home that starts the script `id` at `version` by `cs.wizard`, as the daily screens' doors do. */
const homeFor = (id, version, o = {}) => ({ id: "home", reads: () => ({}), render: (cs) => cs.act("startfrom", { data: { s: "1" } }),
  acts: [{ op: "startfrom", send: new Function("view", "el", "cs", `cs.wizard(${JSON.stringify(id)}, ${JSON.stringify(version)}, ${JSON.stringify(o)}); return null;`) }] });
/** The team with the script of `STEPS` written, approved and offered, and the page booted as `rosa` over the world. */
async function pageWith({ path = "/app", screens = null, steps = STEPS, o = {} } = {}) {
  const t = await team();
  const script = await authored(t, { name: "Submit a draft", steps });
  const home = homeFor(script.script, script.version, o);
  const p = await boot({ screens: [...(screens || [home]), ...SCREENS], guide: GUIDE, ...t.world.boot(t.rosa), path });
  await p.settle(60);
  return { p, t, script, home };
}
const reasonIfAsked = async (p) => {
  const send = p.root().querySelector('[data-shell="reason-send"]');
  if (send) { p.root().querySelector("[data-slot] textarea").value = "r"; await p.click(send); await p.settle(60); }
};

test("R2 R6 in the page: cs.wizard starts the guide in the dock, which opens the step's screen and rings its act inside its row panel; only reads and the tally are sent", async () => {
  const { p, script } = await pageWith();
  await p.click(p.root().querySelector('button[data-act="startfrom"]'));
  await reasonIfAsked(p);
  await p.settle(120);
  const dock = p.root().querySelector(".cs-dock");
  assert.equal(dock && dock.getAttribute("data-panel"), "guide");
  assert.ok(dock.textContent.includes(STEPS[0].what) && dock.textContent.includes(STEPS[0].why));
  assert.equal(p.location.pathname, "/app/wizards");
  const rung = p.root().querySelector("#cs-main .cs-target");
  assert.ok(rung, "the step's act is rung");
  assert.equal(rung.getAttribute("data-act"), "wizardapprove");
  assert.equal(rung.closest("tr.cs-panel").hidden, false, "its row panel opened");
  // Alt+Shift+W rings again (the guide's `ring`)
  p.fire(p.doc, "keydown", { key: "W", altKey: true, shiftKey: true });
  await p.settle(40);
  assert.ok(p.root().querySelector("#cs-main .cs-target"));
  const sent = new Set(p.requests.map((r) => r.op));
  for (const op of ["wizardsubmit", "wizardretire", "wizarddraft", "wizardrevise", "wizardapprove"]) assert.ok(!sent.has(op), `${op} not sent`);
  assert.deepEqual(p.byOp("wizardprogress").map((r) => [r.body.event, r.body.step ?? null]), [["start", null], ["step", 1]]);
  // the marks of the screen sit directly under its path
  const main = p.root().querySelector("#cs-main");
  assert.ok(main.querySelector("[data-guide-marks]"));
  await p.click(main.querySelector('[data-guide="chip"]'));
  await p.settle(40);
  assert.ok(p.root().querySelector("#cs-main [data-guide-marks]").textContent.includes(script.name));
});

test("R3 in the page: \"Record a new wizard\" puts the dock's guide in recording, which hears each act pressed by its op and screen only", async () => {
  const { p } = await pageWith({ path: "/app/wizards" });
  await p.click(p.root().querySelector('button[data-act="wizarddraft"][data-mode="record"]'));
  await reasonIfAsked(p);
  await p.settle(60);
  const dock = () => p.root().querySelector(".cs-dock");
  assert.equal(dock() && dock().getAttribute("data-panel"), "guide");
  assert.ok(dock().querySelector('[data-guide-state="recording"]'));
  // an act pressed on the screen (here, the Drafts state) is heard as {screen, act}
  await p.click(p.root().querySelector('button[data-act="wizards"][data-state="draft"]'));
  await p.settle(60);
  const pairs = dock().querySelectorAll('.mk-list[role="list"] [role="listitem"]');
  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].textContent.trim().replace(/\s+/g, " ").replace(/\s*Remove step.*$/, ""),
    said("screen.guide.recording.pair", { i: "1", screen: said("screen.wizards.name"), act: said("act.wizards.label.wizards") }));
  assert.equal(p.byOp("wizarddraft").length, 0, "nothing is saved until the member saves");
});

test("R7 in the page: Home's marks offer the welcome first, then the first question", async () => {
  const { p, t } = await pageWith();
  const marks = p.root().querySelector("#cs-main [data-guide-marks]");
  assert.ok(marks);
  await p.click(marks.querySelector('[data-guide="chip"]'));
  await p.settle(40);
  const starts = [...p.root().querySelectorAll("#cs-main [data-guide-marks]")[0].querySelectorAll('[data-guide="start"]')].map((b) => b.getAttribute("data-script"));
  assert.deepEqual(starts.slice(0, 2), [WELCOME, FIRST_QUESTION]);
  // then the scripts the store offers on Home, as it lists them
  const home = (await t.rosa.read("wizardsat", { query: { screen: "home" } })).scripts.map((s) => s.id).filter((id) => ![WELCOME, FIRST_QUESTION].includes(id));
  assert.deepEqual(starts.slice(2), home);
});

test("R2 R5 R6 in the page: a screen's wizard mark starts the guide; Next, Back and Stop (data-guide, interface-shell R51) walk and end it, Stop sending nothing", async () => {
  const { p, script } = await pageWith({ path: "/app/wizards" });
  const dock = () => p.root().querySelector(".cs-dock");
  const ctl = (what) => dock().querySelector(`[data-guide="${what}"]`);
  // the mark under the path starts the script it names
  await p.click(p.root().querySelector('#cs-main [data-guide="chip"]'));
  const mark = p.root().querySelector(`#cs-main [data-guide="start"][data-script="${script.script}"]`);
  assert.ok(mark, "the screen's wizard mark");
  await p.click(mark);
  await p.settle(120);
  assert.equal(dock() && dock().getAttribute("data-panel"), "guide");
  assert.ok(dock().textContent.includes(STEPS[0].what));
  assert.equal(p.root().querySelector("#cs-main .cs-target").getAttribute("data-act"), "wizardapprove");
  // Next: step 2, its act rung
  await p.click(ctl("next"));
  await p.settle(120);
  assert.ok(dock().textContent.includes(STEPS[1].what));
  assert.equal(p.root().querySelector("#cs-main .cs-target").getAttribute("data-act"), "wizardretire");
  // Back: step 1 again, not counted again
  await p.click(ctl("back"));
  await p.settle(120);
  assert.ok(dock().textContent.includes(STEPS[0].what));
  assert.deepEqual(p.byOp("wizardprogress").map((r) => [r.body.event, r.body.step ?? null]), [["start", null], ["step", 1], ["step", 2]]);
  // Stop: the guide ends, nothing sent for it
  const before = p.requests.length;
  await p.click(ctl("stop"));
  await p.settle(60);
  assert.equal(p.root().querySelector('.cs-dock[data-panel="guide"]'), null);
  assert.deepEqual(p.requests.slice(before).filter((r) => r.op === "wizardprogress"), []);
  for (const op of ["wizardapprove", "wizardretire"]) assert.equal(p.byOp(op).length, 0, `${op} never pressed`);
});

test("R7 in the page: after join the welcome offer sits on Home; \"Not now\" folds it away and keeps the mark", async () => {
  const t = await team();
  const home = homeFor(WELCOME, null, { joined: true });
  const p = await boot({ screens: [home, ...SCREENS], guide: GUIDE, ...t.world.boot(t.mai), path: "/app" });
  await p.settle(80);
  await p.click(p.root().querySelector('button[data-act="startfrom"]'));
  await reasonIfAsked(p);
  await p.settle(80);
  const read = await t.mai.read("wizardread", { query: { script: WELCOME } });
  assert.deepEqual(p.byOp("wizardprogress").map((r) => [r.body.event, r.body.step ?? null, r.body.version]), [["start", null, read.version.id], ["step", 3, read.version.id]]);
  const offer = () => p.root().querySelector("#cs-main [data-guide-offer]");
  assert.ok(offer());
  await p.click(offer().querySelector('[data-guide="notnow"]'));
  await p.settle(40);
  assert.equal(offer(), null);
  await p.click(p.root().querySelector('#cs-main [data-guide="chip"]'));
  await p.settle(40);
  assert.ok(p.root().querySelector(`#cs-main [data-guide="start"][data-script="${WELCOME}"]`), "the mark stays");
});

test("R17 in the page: a step on a screen that works in a project asks in the dock, as a choice of the member's projects, and opens the screen on the one chosen", async () => {
  const PLAN = { id: "timeline", reads: () => ({}), render: (cs, view) => `<p data-subject="${cs.esc(view.subject)}">${cs.title()}</p>`, acts: [], words: [] };
  const steps = [{ screen: "timeline", act: null, what: "Open the plan", why: "To see its options" }, { screen: "wizards", act: null, what: "Then here", why: "Done" }];
  const t = await team();
  const script = await authored(t, { name: "Plan it", steps });
  const p = await boot({ screens: [homeFor(script.script, script.version), PLAN, ...SCREENS], guide: GUIDE, ...t.world.boot(t.rosa), path: "/app" });
  await p.settle(60);
  await p.click(p.root().querySelector('button[data-act="startfrom"]'));
  await reasonIfAsked(p);
  await p.settle(120);
  const dock = () => p.root().querySelector(".cs-dock");
  assert.equal(p.location.pathname, "/app", "the screen is not opened on nothing");
  const select = dock().querySelector("#wz-subject");
  assert.ok(select, "the choice is asked in the dock");
  const mine = (await t.rosa.read("projectlist")).projects;
  assert.deepEqual([...select.querySelectorAll("option")].map((o) => o.textContent.trim()).sort(), mine.map((x) => x.name).sort());
  assert.ok(dock().textContent.includes(said("wizard.subject.project")));
  select.value = t.P2;
  await p.click(dock().querySelector('[data-guide="subjectgo"]'));
  await p.settle(120);
  assert.equal(p.location.pathname, "/app/timeline/" + t.P2);
  assert.equal(p.root().querySelector("#cs-main [data-subject]").getAttribute("data-subject"), t.P2);
});
