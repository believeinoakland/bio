/* The guide in the real page (R2, R3, R6, R7): `interfacePage(screens, {guide: GUIDE})` booted by interface-shell's harness
   with this module's screen and a Home that starts a wizard by `cs.wizard` (as `screens-daily` R9's doors do). Checks
   the shell's half of the contract meets this module's (K3143): the dock holds the guide, the marks sit under the path,
   a step's act is rung inside its row panel, and the recording hears acts by op and screen only. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok } from "../interface-shell/harness.mjs";
import { SCREENS, GUIDE } from "../../../src/screens-wizards/index.mjs";
import { ADMIN, libraryTable } from "./fixtures.mjs";

const SCRIPT = { id: "WIZ-00000000000000e9", version: "WIZ-00000000000000e9@1", name: "Submit a draft", steps: [
  { screen: "wizards", act: "wizardsubmit", what: "Submit your draft", why: "An owner approves it" },
  { screen: "wizards", act: "wizardretire", what: "Or withdraw it", why: "If it is not needed" }] };
const HOME = { id: "home", reads: () => ({}), render: (cs) => cs.act("startfrom", { data: { s: "1" } }),
  acts: [{ op: "startfrom", send(view, el, cs) { cs.wizard("WIZ-00000000000000e9", "WIZ-00000000000000e9@1", {}); return null; } }] };

function plane(over = {}) {
  const t = libraryTable();
  const out = {};
  for (const [op, a] of Object.entries(t)) out[op] = (req) => ok(typeof a === "function" ? a(req.query || {}, req.body).result : a.result);
  out.whoami = ok({ ...ADMIN, session: true });
  out.wizardread = (req) => ok({ ok: true, script: { id: SCRIPT.id, name: SCRIPT.name, origin: "group" }, version: { id: SCRIPT.version, state: "approved", steps: SCRIPT.steps } });
  out.wizardsat = (req) => ok({ ok: true, screen: req.query.screen, scripts: req.query.screen === "wizards" ? [{ ...SCRIPT, approver: { id: "rosa" }, finished: 2 }] : [] });
  out.wizardprogress = ok({ ok: true });
  return { ...out, ...over };
}
const reasonIfAsked = async (p) => {
  const send = p.root().querySelector('[data-shell="reason-send"]');
  if (send) { p.root().querySelector("[data-slot] textarea").value = "r"; await p.click(send); await p.settle(60); }
};

test("R2 R6 in the page: cs.wizard starts the guide in the dock, which opens the step's screen and rings its act inside its row panel; only reads and the tally are sent", async () => {
  const p = await boot({ screens: [HOME, ...SCREENS], guide: GUIDE, plane: plane(), path: "/app" });
  await p.settle(60);
  await p.click(p.root().querySelector('button[data-act="startfrom"]'));
  await reasonIfAsked(p);
  await p.settle(120);
  const dock = p.root().querySelector(".cs-dock");
  assert.equal(dock && dock.getAttribute("data-panel"), "guide");
  assert.ok(dock.textContent.includes("Submit your draft") && dock.textContent.includes("An owner approves it"));
  assert.equal(p.location.pathname, "/app/wizards");
  const rung = p.root().querySelector("#cs-main .cs-ring");
  assert.ok(rung, "the step's act is rung");
  assert.equal(rung.getAttribute("data-act"), "wizardsubmit");
  assert.equal(rung.closest("tr.cs-panel").hidden, false, "its row panel opened");
  // Alt+Shift+W rings again (the guide's `ring`)
  p.fire(p.doc, "keydown", { key: "W", altKey: true, shiftKey: true });
  await p.settle(40);
  assert.ok(p.root().querySelector("#cs-main .cs-ring"));
  const sent = new Set(p.requests.map((r) => r.op));
  for (const op of ["wizardsubmit", "wizardretire", "wizarddraft", "wizardrevise", "wizardapprove"]) assert.ok(!sent.has(op), `${op} not sent`);
  assert.deepEqual(p.byOp("wizardprogress").map((r) => [r.body.event, r.body.step ?? null]), [["start", null], ["step", 1]]);
  // the marks of the screen sit directly under its path
  const main = p.root().querySelector("#cs-main");
  assert.ok(main.querySelector("[data-guide-marks]"));
  assert.ok(main.querySelector("[data-guide-marks]").textContent.includes(SCRIPT.name));
});

test("R3 in the page: \"Record a new wizard\" puts the dock's guide in recording, which hears each act pressed by its op and screen only", async () => {
  const p = await boot({ screens: [HOME, ...SCREENS], guide: GUIDE, plane: plane(), path: "/app/wizards" });
  await p.settle(80);
  await p.click(p.root().querySelector('button[data-act="wizarddraft"][data-mode="record"]'));
  await reasonIfAsked(p);
  await p.settle(60);
  const dock = () => p.root().querySelector(".cs-dock");
  assert.equal(dock() && dock().getAttribute("data-panel"), "guide");
  assert.ok(dock().querySelector('[data-guide-state="recording"]'));
  // an act pressed on the screen (here, "See the whole library") is heard as {screen, act}
  p.root().querySelector("#wz-state").value = "draft";
  await p.click(p.root().querySelector('button[data-act="wizards"][data-see="1"]'));
  await p.settle(60);
  const pairs = dock().querySelectorAll("ol li");
  assert.equal(pairs.length, 1);
  assert.ok(/^1\. Wizards: See the library/.test(pairs[0].textContent.trim()), pairs[0].textContent);
  assert.equal(p.byOp("wizarddraft").length, 0, "nothing is saved until the member saves");
});

test("R7 in the page: Home's marks offer the welcome first, then the first question", async () => {
  const p = await boot({ screens: [HOME, ...SCREENS], guide: GUIDE, plane: plane(), path: "/app" });
  await p.settle(80);
  const marks = p.root().querySelector("#cs-main [data-guide-marks]");
  assert.ok(marks);
  const starts = [...marks.querySelectorAll('[data-guide="start"]')].map((b) => b.getAttribute("data-script"));
  assert.deepEqual(starts, ["WIZ-7db08189cc0e58c3", "WIZ-86b7f4007e3b0e3c"]);
});
