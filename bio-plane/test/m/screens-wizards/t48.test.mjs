/* T48: the guide's line on door-offered scripts (R10), the one chip (R11) and the common line (R12). */
import test from "node:test";
import assert from "node:assert/strict";
import { checkClasses } from "../../../src/interface-shell/index.mjs";
import { standIn, said, unhtml } from "./standin.mjs";
import { GUIDE, WELCOME } from "../../../src/screens-wizards/index.mjs";
import { open, lacks, has, SCREENS } from "./kit.mjs";
import { ADMIN, MEMBER, env, libraryTable, LIST } from "./fixtures.mjs";

const ok = (result) => ({ ok: true, result });
const GR = { id: "WIZ-00000000000000g1", version: "WIZ-00000000000000g1@1", name: "Get a record", steps: [
  { screen: "finder", act: "search", what: "Search", why: "Maybe it exists" }, { screen: "document", act: null, what: "Read", why: "See" }] };
const DOORS = ok({ ok: true, scripts: [], doors: [{ door: "money", scripts: [GR.id] }, { door: "elsewhere", scripts: [] }] });
const read = (q) => {
  const s = q.script === GR.id ? GR : { id: WELCOME, name: "Welcome a new member", steps: [{ screen: "home", act: null, what: "a", why: "b" }, { screen: "home", act: null, what: "c", why: "d" }] };
  return ok({ ok: true, script: { id: s.id, name: s.name, origin: "group" }, version: { id: s.id + "@1", state: "approved", steps: s.steps } });
};
const plane = (over = {}) => ({ wizardread: read, startfrom: DOORS, wizardprogress: ok({ ok: true }), wizardsat: ok({ ok: true, scripts: [] }), ...over });
const elsewhere = () => said("wizard.guide.elsewhere", { link: said("wizard.guide.elsewhere_link") });

test("R10 every step of a script a door names carries the guide's `elsewhere` line; a script no door names carries none", async () => {
  const g = standIn({ plane: plane(), drawn: { finder: ["search"], document: [] } });
  await g.start({ script: GR.id });
  assert.equal(g.requests.filter((r) => r.op === "startfrom").length, 1, "read once when the run starts");
  for (let i = 0; i < GR.steps.length; i++) {
    assert.ok(g.text().includes(said("guide.step", { i: String(i + 1), n: "2" })));
    assert.ok(g.text().replace(/\s+([.,])/g, "$1").includes(elsewhere()), `step ${i + 1}`);
    if (i + 1 < GR.steps.length) await g.control("next");
  }
  assert.equal(g.requests.filter((r) => r.op === "startfrom").length, 1);
  // opening the screen sends nothing and keeps the run where it was
  const before = g.requests.length, at = g.view.ui.run.i;
  await g.control("elsewhere");
  assert.deepEqual(g.nav.at(-1), ["elsewhere", null]);
  assert.deepEqual(g.requests.slice(before).map((r) => r.op).filter((op) => op !== "wizardsat"), [], "only the new screen's own marks are read");
  assert.equal(g.view.ui.run.i, at);
  // control: the welcome, which no door names
  const w = standIn({ plane: plane(), drawn: {} });
  await w.start({ script: WELCOME });
  assert.ok(!w.text().includes(said("wizard.guide.elsewhere_link")));
});

test("R10 a failed `startfrom` read draws no line and stops nothing", async () => {
  const g = standIn({ plane: plane({ startfrom: { ok: false, code: "X" } }), drawn: { finder: ["search"] } });
  await g.start({ script: GR.id });
  assert.ok(!g.text().includes(said("wizard.guide.elsewhere_link")));
  await g.control("next");
  assert.ok(g.text().includes(said("guide.step", { i: "2", n: "2" })));
});

const S = (id, acts, extra = {}) => ({ id, version: id + "@1", name: id, finished: 0, approver: null,
  steps: acts.map((a) => ({ screen: "members", act: a, what: "w", why: "y" })), ...extra });
const sat = (scripts) => ok({ ok: true, screen: "members", scripts });
const ONLY_ADMIN = new Set(["adminact"]);
const canFor = (admin) => (op) => admin || !ONLY_ADMIN.has(op);

test("R11 a screen's wizard marks are one chip counting the scripts this viewer can walk; none walkable, no chip", async () => {
  const two = [S("WIZ-a1", ["adminact"]), S("WIZ-a2", ["adminact", "invite"])];
  const m = standIn({ plane: plane({ wizardsat: sat(two) }), kit: { can: canFor(false) } });
  await m.enter("members");
  assert.equal(m.marks(), "", "a member with two administrator-only scripts sees no chip");
  const a = standIn({ plane: plane({ wizardsat: sat(two) }), kit: { can: canFor(true) } });
  await a.enter("members");
  assert.ok(unhtml(a.marks()).includes(said("wizard.marks.chip", { n: "2" })));
  assert.equal((a.marks().match(/cs-wizmark/g) || []).length, 1, "one chip");
  assert.ok(!a.marks().includes('data-guide="start"'), "the list is beneath the chip until it is pressed");
  // a script one of whose acts is gated is left out; the rest are counted, one reads in the singular
  const mixed = standIn({ plane: plane({ wizardsat: sat([...two, S("WIZ-a3", ["invite"])]) }), kit: { can: canFor(false) } });
  await mixed.enter("members");
  assert.ok(unhtml(mixed.marks()).includes(said("wizard.marks.chip.one")));
});

test("R11 pressing the chip opens each script's name with Start; Recommended replaces Required; the finished count appears only above zero; own drafts count", async () => {
  const list = [S("WIZ-b1", ["invite"], { finished: 0 }), S("WIZ-b2", ["invite"], { finished: 3, required: true }), S("WIZ-b3", ["invite"], { draft: true })];
  const g = standIn({ plane: plane({ wizardsat: sat(list) }), kit: { can: canFor(true) } });
  await g.enter("members");
  assert.ok(unhtml(g.marks()).includes(said("wizard.marks.chip", { n: "3" })), "the draft is counted");
  await g.control("chip");
  const t = unhtml(g.marks());
  for (const s of list) assert.ok(t.includes(said("screen.guide.mark.start", { name: s.id })));
  assert.equal((g.marks().match(/data-guide="start"/g) || []).length, 3);
  assert.ok(t.includes(said("wizard.mark.recommended")) && !t.includes("Required"));
  assert.ok(t.includes(said("screen.guide.mark.finished", { n: "3" })));
  assert.ok(!t.includes(said("screen.guide.mark.finished", { n: "0" })), "a script finished by nobody shows no count");
  await g.control("chip");
  assert.ok(!g.marks().includes('data-guide="start"'), "pressed again, the list closes");
});

test("R11 Home's welcome offer keeps its own band, which is not a chip", async () => {
  const g = standIn({ plane: plane() });
  await g.start({ script: WELCOME, joined: true });
  await g.enter("home");
  g.view.ui.marks = { screen: "home", scripts: [] };
  const h = g.marks();
  assert.ok(h.includes("data-guide-offer") && h.includes('data-guide="notnow"'));
});

test("R12 the module\'s real SCREENS and GUIDE compose under interface-shell R56 (every class defined by a served stylesheet); no cs-form, no cs-note, no bare label with help", async () => {
  const empty = { wizards: env({ ok: true, state: "offered", scripts: [], truncated: false }), baseupdates: env({ ok: true, entries: [] }), projectlist: env({ ok: true, projects: [] }) };
  for (const table of [libraryTable(), empty]) {
    const a = await open("wizards", { me: ADMIN, table });
    assert.ok(!/cs-form|cs-note/.test(a.html));
  }
  // interface-shell R56's own check over the module's real screens and guide
  assert.equal(checkClasses(SCREENS, GUIDE, ""), true);
  const g = standIn({ plane: plane({ wizardsat: sat([S("WIZ-c1", ["invite"])]) }), drawn: { members: ["invite"] }, kit: { can: canFor(true) } });
  await g.enter("members");
  await g.control("chip");
  await g.start({ record: { project: "P1" } });
  const html = [g.marks(), g.render()].join("");
  assert.ok(!/cs-form|cs-note|cs-list|cs-actrow/.test(html));
  await g.start({ script: GR.id });
  assert.ok(!/cs-form|cs-note|cs-list|cs-actrow/.test(g.render()));
});

test("R12 over an empty fixture the library draws no empty section and no zero; a failed read is drawn failed, never as empty", async () => {
  const none = { wizards: env({ ok: true, state: "offered", scripts: [], truncated: false }), baseupdates: env({ ok: true, entries: [] }), projectlist: env({ ok: true, projects: [] }) };
  const a = await open("wizards", { me: ADMIN, table: none });
  has(a, "screen.wizards.empty");
  assert.ok(!/\b0\b/.test(a.text.replace(/[^\n]*Alt\+Shift\+W/, "")), "no zero drawn");
  assert.equal((a.html.match(/<section/g) || []).length, (a.html.match(/<h2/g) || []).length);
  assert.ok(!a.html.includes('id="wz-project"'), "no project chooser with no project");
  // a script finished by nobody shows no count
  const z = await open("wizards", { me: ADMIN, table: libraryTable() });
  lacks(z, "screen.wizards.finished", { n: "0" });
  // a failed read is drawn failed
  const f = await open("wizards", { me: ADMIN, table: { ...libraryTable(), wizards: () => ({ ok: false, code: "BOOM", translation: "boom" }) } });
  assert.ok(f.html.includes('data-state="failed"'));
  lacks(f, "screen.wizards.empty");
});
