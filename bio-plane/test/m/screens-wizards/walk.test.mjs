/* T51 fix round (FR-47; L27; DEC-384): the harness walks the whole library (R21). Every step of every script of
   `wizard-scripts`' library, read through its own export, is walked in the real served page (`interfacePage` booted by
   interface-shell's harness) with the guide docked, once with no subject to be found and once with subjects to be found; any
   step whose resulting screen draws the shell's "Nothing is here" fails, by script and step.
   The screens are stand-ins that ask for a subject (`subject: true`, interface-shell R61) exactly where the guide's kinds
   (R17) name one; a screen outside those kinds is its own module's to keep. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot } from "../interface-shell/harness.mjs";
import { SCREENS, GUIDE } from "../../../src/screens-wizards/index.mjs";
import { CIVICSMITH_LIBRARY, team, authored, withSubjects } from "./world.mjs";
import { said } from "./standin.mjs";

const NOTHING = said("shell.unavailable.nothing.title");
const KINDS = GUIDE.parts.kinds();

/** A screen that works on a subject reads one record with `subject: true`, so the shell says "Nothing is here" when it is opened
 *  with none; any other screen draws at once. The record is read from the store (`projectlist`, a read any member is served). A
 *  screen's functions are served to the page (interface-shell R21), so they are built from literal source, with no closure. */
const standIn = (id, needs) => ({ id, acts: [],
  reads: new Function("view", needs.has(id) ? 'return { record: { op: "projectlist", query: {}, subject: true } };' : "return {};"),
  render: new Function(`return ${JSON.stringify("<p data-walk-screen=\"" + id + "\">" + id + "</p>")};`) });

/** The dock's "step <i> of <n>": the index of the main run's step it shows, else 0. */
const STEP_AT = new RegExp(said("guide.step", { i: "@I@", n: "@N@" }).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("@I@", "(\\d+)").replace("@N@", "(\\d+)"));

/** Walks `script` through the page from step `at`; answers the steps whose resulting screen drew "Nothing is here", how many
 *  steps it stood on, and, where a step's screen is outside the working frame (the public pages draw no dock, so no guide), the
 *  step to go on from. */
async function walkScript(script, scripts, { needs, found, at = 1, t }) {
  const ids = new Set(scripts.flatMap((s) => s.steps.map((st) => st.screen)));
  for (const k of Object.keys(KINDS)) ids.add(k);
  const shown = SCREENS.map((s) => s.id);
  const stands = [...ids].filter((id) => !shown.includes(id) && id !== "home").map((id) => standIn(id, needs));
  const HOME = { id: "home", reads: () => ({}), render: new Function("cs", 'return cs.act("startfrom", { data: { s: "1" } });'),
    acts: [{ op: "startfrom", send: new Function("view", "el", "cs", `cs.wizard(${JSON.stringify(script.id)}, null, { at: ${at} }); return null;`) }] };
  const p = await boot({ screens: [HOME, ...stands, ...SCREENS], guide: GUIDE, ...t.world.boot(t.rosa), path: "/app" });
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
async function walkLibrary(scripts, needs, worldFor) {
  const out = [];
  for (const found of [false, true]) {
    const t = await worldFor(found);
    for (const s of scripts) {
      let at = 1, covered = 0;
      for (let again = 0; again < s.steps.length && at !== null; again++) {
        const r = await walkScript(s, scripts, { needs, found, at, t });
        out.push(...r.failures.map((f) => ({ ...f, found })));
        covered += r.stood + (r.left ? 1 : 0);
        at = r.resume;
      }
      if (covered < s.steps.length) out.push({ script: s.id, step: covered + 1, screen: "(the guide was gone)", stopped: true, found });
    }
  }
  return out;
}

const NEEDS = new Set(Object.keys(KINDS));
/** The world a walk is made in: `found` is a team with its projects, questions and documents; else a team with none of them. The library's scripts
 *  are the store's own, read by `wizardread` as the guide reads them. */
async function subjectsWorld(found) {
  const t = await team({ projects: found });
  if (found) await withSubjects(t, { questions: 2, documents: 2 });
  return t;
}

test("R21 every step of every script of the library, walked in the page with no subject and with subjects found, draws no \"Nothing is here\"", async () => {
  assert.ok(CIVICSMITH_LIBRARY.length > 20, "the library is read through wizard-scripts' export");
  assert.ok(CIVICSMITH_LIBRARY.some((s) => s.steps.some((st) => KINDS[st.screen] === "question")), "it holds steps on a subject screen");
  const fails = await walkLibrary(CIVICSMITH_LIBRARY, NEEDS, subjectsWorld);
  assert.deepEqual(fails.map((f) => `${f.script} step ${f.step} on ${f.screen}${f.stopped ? " (the guide was gone)" : ""}, ${f.found ? "subjects found" : "none found"}`), []);
});

test("R21 a fixture script with a step on a screen that needs a subject, which the guide does not ask for, is failed by name", async () => {
  const t = await team();
  const ledger = await authored(t, { name: "Check the hold", steps: [
    { screen: "finder", act: null, what: "Look", why: "First" }, { screen: "hold", act: null, what: "Open the hold", why: "It needs an action" }] });
  const script = { id: ledger.script, name: ledger.name, steps: ledger.steps };
  assert.ok(!NEEDS.has("hold"), "the guide's kinds do not name it");
  const fails = await walkLibrary([script], new Set([...NEEDS, "hold"]), async () => t);
  assert.deepEqual(fails.map((f) => [f.script, f.step, f.found]), [[ledger.script, 2, false], [ledger.script, 2, true]]);
  assert.ok(fails.every((f) => f.screen === "/app/hold"));
  // control: the same script is green where the screen needs no subject
  assert.deepEqual(await walkLibrary([script], NEEDS, async () => t), []);
});
