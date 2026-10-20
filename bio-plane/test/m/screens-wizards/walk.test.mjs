/* T51 fix round (FR-47; L27; DEC-384): the harness walks the whole library (R21). Every step of every script of
   `wizard-scripts`' library, read through its own export, is walked in the real served page (`interfacePage` booted by
   interface-shell's harness) with the guide docked, once with no subject to be found and once with subjects to be found; any
   step whose resulting screen draws the shell's "Nothing is here" fails, by script and step.
   The screens are stand-ins that ask for a subject (`subject: true`, interface-shell R61) exactly where the guide's kinds
   (R17) name one; a screen outside those kinds is its own module's to keep. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok } from "../interface-shell/harness.mjs";
import { SCREENS, GUIDE } from "../../../src/screens-wizards/index.mjs";
import { CIVICSMITH_LIBRARY } from "../../../src/wizard-scripts/index.mjs";
import { ADMIN, libraryTable } from "./fixtures.mjs";
import { said } from "./standin.mjs";

const NOTHING = said("shell.unavailable.nothing.title");
const KINDS = GUIDE.parts.kinds();

/** A screen that works on a subject reads one record with `subject: true`, so the shell says "Nothing is here" when it is opened
 *  with none; any other screen draws at once. A screen's functions are served to the page (interface-shell R21), so they are
 *  built from literal source, with no closure. */
const standIn = (id, needs) => ({ id, acts: [],
  reads: new Function("view", needs.has(id) ? 'return { record: { op: "probe", query: { id: view.subject || "" }, subject: true } };' : "return {};"),
  render: new Function(`return ${JSON.stringify("<p data-walk-screen=\"" + id + "\">" + id + "</p>")};`) });

/** The plane: every library script as `wizardread` gives it; with `found`, projects, questions and documents to be found. */
function planeOf(scripts, found) {
  const t = libraryTable();
  const out = {};
  for (const [op, a] of Object.entries(t)) out[op] = (req) => ok(typeof a === "function" ? a(req.query || {}, req.body).result : a.result);
  out.whoami = ok({ ...ADMIN, session: true });
  out.wizardread = (req) => {
    const s = scripts.find((x) => x.id === req.query.script);
    return s ? ok({ ok: true, script: { id: s.id, name: s.name || s.id, origin: "civicsmith" }, version: { id: s.id + "@1", state: "approved", steps: s.steps } })
      : { status: 409, json: { ok: false, code: "NO_SUCH_WIZARD" } };
  };
  out.wizardsat = (req) => ok({ ok: true, screen: req.query.screen, scripts: [] });
  out.wizardprogress = ok({ ok: true });
  out.probe = ok({ ok: true });
  out.projectlist = ok({ ok: true, projects: found ? [{ id: "P1", name: "Pothole repairs" }, { id: "P2", name: "The Coliseum lease" }] : [], count: found ? 2 : 0 });
  out.list = (req) => ok({ ok: true, bundles: !found ? [] : req.query.type === "inquiry"
    ? [{ bundle_id: "INQ-1", title: "Are potholes repaired?", last_updated: "2026-09-01" }, { bundle_id: "INQ-2", title: "Who pays for the lease?", last_updated: "2026-10-12" }]
    : [{ bundle_id: "DOC-1", title: "The lease", last_updated: "2026-10-14" }] });
  return out;
}

/** The dock's "step <i> of <n>": the index of the main run's step it shows, else 0. */
const STEP_AT = new RegExp(said("guide.step", { i: "@I@", n: "@N@" }).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("@I@", "(\\d+)").replace("@N@", "(\\d+)"));

/** Walks `script` through the page from step `at`; answers the steps whose resulting screen drew "Nothing is here", how many
 *  steps it stood on, and, where a step's screen is outside the working frame (the public pages draw no dock, so no guide), the
 *  step to go on from. */
async function walkScript(script, scripts, { needs, found, at = 1 }) {
  const ids = new Set(scripts.flatMap((s) => s.steps.map((st) => st.screen)));
  for (const k of Object.keys(KINDS)) ids.add(k);
  const shown = SCREENS.map((s) => s.id);
  const stands = [...ids].filter((id) => !shown.includes(id) && id !== "home").map((id) => standIn(id, needs));
  const HOME = { id: "home", reads: () => ({}), render: new Function("cs", 'return cs.act("startfrom", { data: { s: "1" } });'),
    acts: [{ op: "startfrom", send: new Function("view", "el", "cs", `cs.wizard(${JSON.stringify(script.id)}, ${JSON.stringify(script.id + "@1")}, { at: ${at} }); return null;`) }] };
  const p = await boot({ screens: [HOME, ...stands, ...SCREENS], guide: GUIDE, plane: planeOf(scripts, found), path: "/app" });
  await p.settle(40);
  await p.click(p.root().querySelector('button[data-act="startfrom"]'));
  const asked = p.root().querySelector('[data-shell="reason-send"]');
  if (asked) { p.root().querySelector("[data-slot] textarea").value = "r"; await p.click(asked); }
  await p.settle(80);
  const failures = [];
  let stood = 0, last = at - 1, resume = null;
  for (let k = 1; k <= 80; k++) {
    await p.settle(40);
    const dock = p.root().querySelector('.cs-dock [data-guide-state="running"]');
    if (!dock) {
      if (p.root().querySelector(".cs-dock .cs-wizard")) break;
      resume = last + 2;
      break;
    }
    const at2 = STEP_AT.exec(dock.textContent.replace(/\s+/g, " "));
    if (at2 && Number(at2[2]) === script.steps.length) last = Number(at2[1]);
    const pick = dock.querySelector("#wz-subject");
    if (pick) {
      pick.value = pick.querySelectorAll("option")[0].getAttribute("value");
      await p.click(dock.querySelector('[data-guide="subjectgo"]'));
      await p.settle(80);
    }
    const main = p.root().querySelector("#cs-main");
    stood++;
    if (main && main.textContent.includes(NOTHING)) failures.push({ script: script.id, step: last, screen: p.location.pathname });
    const next = p.root().querySelector('.cs-dock [data-guide="next"]');
    if (!next) break;
    await p.click(next);
  }
  return { failures, stood, left: resume !== null, resume: resume !== null && resume <= script.steps.length ? resume : null };
}

/** Every script, with no subject to be found and with subjects to be found. A script whose step lies outside the working frame is
 *  walked again from the step after it; every step is stood on or is such a step, else the walk stopped early and fails. */
async function walkLibrary(scripts, needs) {
  const out = [];
  for (const found of [false, true]) for (const s of scripts) {
    let at = 1, covered = 0;
    for (let again = 0; again < s.steps.length && at !== null; again++) {
      const r = await walkScript(s, scripts, { needs, found, at });
      out.push(...r.failures.map((f) => ({ ...f, found })));
      covered += r.stood + (r.left ? 1 : 0);
      at = r.resume;
    }
    if (covered < s.steps.length) out.push({ script: s.id, step: covered + 1, screen: "(the guide was gone)", stopped: true, found });
  }
  return out;
}

const NEEDS = new Set(Object.keys(KINDS));

test("R21 every step of every script of the library, walked in the page with no subject and with subjects found, draws no \"Nothing is here\"", async () => {
  assert.ok(CIVICSMITH_LIBRARY.length > 20, "the library is read through wizard-scripts' export");
  assert.ok(CIVICSMITH_LIBRARY.some((s) => s.steps.some((st) => KINDS[st.screen] === "question")), "it holds steps on a subject screen");
  const fails = await walkLibrary(CIVICSMITH_LIBRARY, NEEDS);
  assert.deepEqual(fails.map((f) => `${f.script} step ${f.step} on ${f.screen}${f.stopped ? " (the guide was gone)" : ""}, ${f.found ? "subjects found" : "none found"}`), []);
});

test("R21 a fixture script with a step on a screen that needs a subject, which the guide does not ask for, is failed by name", async () => {
  const ledger = { id: "WIZ-00000000000000a1", name: "Check the due date", steps: [
    { screen: "finder", act: null, what: "Look", why: "First" }, { screen: "due-date", act: null, what: "Open the due date", why: "It needs an action" }] };
  assert.ok(!NEEDS.has("due-date"), "the guide's kinds do not name it");
  const fails = await walkLibrary([ledger], new Set([...NEEDS, "due-date"]));
  assert.deepEqual(fails.map((f) => [f.script, f.step, f.found]), [[ledger.id, 2, false], [ledger.id, 2, true]]);
  assert.ok(fails.every((f) => f.screen === "/app/due-date"));
  // control: the same script is green where the screen needs no subject
  assert.deepEqual(await walkLibrary([ledger], NEEDS), []);
});
