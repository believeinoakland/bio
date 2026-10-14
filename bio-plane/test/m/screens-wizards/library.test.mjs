/* Settings › Wizards at the module's interface, over the real served page (R1, R8). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, ancestor, has, lacks, open, panelOf, rowOf, said, textOf, squash, SCREENS } from "./kit.mjs";
import { decode } from "../interface-shell/dom.mjs";
import { ADMIN, MEMBER, READER, CIV, COPY, SUBMITTED, GET_RECORD, COPY_STEPS, env, refuse, libraryTable } from "./fixtures.mjs";
import { SCREEN_REGISTRY } from "../../../src/wizard-scripts/index.mjs";

const opsIn = (n) => [...new Set(acts(n).map((b) => b.attrs["data-act"]))].sort();
const t = (n) => squash(decode(textOf(n)));
const V = { civ: CIV.versions[0].id, draft: COPY.versions[0].id, copy: COPY.versions[1].id, sub: SUBMITTED.versions[0].id };

test("R1 the screen's acts are the registry's six for `wizards`, every one drawn where it applies", async () => {
  const reg = SCREEN_REGISTRY.find((s) => s.id === "wizards");
  assert.deepEqual(SCREENS.map((s) => s.id), ["wizards"]);
  assert.deepEqual(SCREENS[0].acts.map((a) => a.op).sort(), [...reg.acts].sort());
  const a = await open("wizards", { me: ADMIN, table: libraryTable() });
  assert.deepEqual(opsIn(a.tree), [...reg.acts].sort());
  // control: a member without `contribute` is offered the reads only (op-declarations NEEDS; interface-shell R12)
  const r = await open("wizards", { me: READER, table: libraryTable() });
  assert.deepEqual(opsIn(r.tree), ["wizards"]);
});

test("R1 reads wizards, baseupdates and projectlist; each script a row with its name, whose, base, approver and finished count", async () => {
  const a = await open("wizards", { me: ADMIN, table: libraryTable() });
  assert.deepEqual(a.p.requests.map((r) => r.op).filter((op) => ["wizards", "baseupdates", "projectlist"].includes(op)), ["wizards", "baseupdates", "projectlist"]);
  // a Civicsmith script's name by its key `wizard.<id>.name`
  const civ = rowOf(a.tree, V.civ);
  assert.ok(t(civ).includes(said(`wizard.${GET_RECORD.id}.name`)));
  assert.ok(t(civ).includes(said("screen.wizards.whose.civicsmith")));
  assert.ok(t(civ).includes(said("screen.wizards.nobase")));
  assert.ok(t(civ).includes("Bob"));
  assert.ok(t(civ).includes(said("screen.wizards.finished", { n: "14" })));
  // a group's copy: as recorded, this group's, what it is based on, a draft not yet approved, and that its base changed
  const draft = rowOf(a.tree, V.draft);
  assert.ok(t(draft).includes(COPY.name));
  assert.ok(t(draft).includes(said("screen.wizards.whose.group")));
  assert.ok(t(draft).includes(said("screen.wizards.basedon", { name: said(`wizard.${GET_RECORD.id}.name`) })));
  assert.ok(t(draft).includes(said("screen.wizards.notapproved")));
  assert.ok(t(draft).includes(said("screen.wizards.basechanged")));
  const approved = rowOf(a.tree, V.copy);
  assert.ok(t(approved).includes("rosa"));
  assert.ok(t(approved).includes(said("screen.wizards.finished", { n: "3" })));
  // control: an approved copy whose base did not change for it does not say so
  assert.ok(!t(approved).includes(said("screen.wizards.basechanged")));
  // empty: the screen's own sentence
  const e = await open("wizards", { me: MEMBER, table: libraryTable({ wizards: env({ ok: true, state: "offered", scripts: [], truncated: false }) }) });
  has(e, "screen.wizards.empty");
});

test("R1 a Civicsmith script's row offers no write act but the copy (WIZARD_NOT_THE_GROUPS)", async () => {
  const a = await open("wizards", { me: ADMIN, table: libraryTable() });
  assert.deepEqual(opsIn(panelOf(a.tree, V.civ)), ["wizarddraft", "wizards"]);
  assert.ok(t(panelOf(a.tree, V.civ)).includes(said("screen.wizards.civicsmith.only")));
  // control: a group's approved script offers its approver's acts too
  assert.deepEqual(opsIn(panelOf(a.tree, V.copy)), ["wizardapprove", "wizarddraft", "wizardretire", "wizards"]);
  assert.deepEqual(opsIn(panelOf(a.tree, V.draft)), ["wizardretire", "wizardrevise", "wizards", "wizardsubmit"]);
  assert.deepEqual(opsIn(panelOf(a.tree, V.sub)), ["wizardapprove", "wizardretire", "wizards"]);
});

test("R1 wizards: \"See the whole library\" lists again with the state chosen", async () => {
  const a = await open("wizards", { me: ADMIN, table: libraryTable() });
  const { sent } = await a.press("wizards", { data: { see: "1" }, values: { "wz-state": "retired" } });
  assert.deepEqual(sent.map((r) => [r.op, r.query.state]), [["wizards", "retired"], ["wizards", "retired"]], "the act, then R8's read again in that state");
  has(a, "screen.wizards.retired", { reason: "replaced" });
  // open proposals: each with "Draft a wizard from these steps" and, into the member's own draft, adopt
  const b = await open("wizards", { me: MEMBER, table: libraryTable() });
  await b.press("wizards", { data: { see: "1" }, values: { "wz-state": "proposed" } });
  has(b, "screen.wizards.proposal.by", { why: "Members keep missing the search" });
  const p = panelOf(b.tree, "WZP-0000000000000001");
  assert.deepEqual(opsIn(p), ["wizarddraft", "wizardrevise"]);
  const k = "WZP-0000000000000001";
  assert.deepEqual((await b.press("wizarddraft", { data: { from: k }, values: { "wz-pn-WZP-0000000000000001": "Search first" } })).sent[0].body, { from: k, name: "Search first" });
  assert.deepEqual((await b.press("wizardrevise", { data: { adopt: k }, reason: "adopting" })).sent[0].body, { version: V.draft, adopt: k, reason: "adopting" });
});

test("R1 wizarddraft: \"Copy a wizard to change it\" sends the version, the project and the name; the new script shows its base", async () => {
  const a = await open("wizards", { me: MEMBER, table: libraryTable() });
  const k = V.civ.replace(/[^A-Za-z0-9_-]/g, "_");
  const { sent } = await a.press("wizarddraft", { data: { mode: "copy", version: V.civ }, values: { ["wz-cp-" + k]: "P2", ["wz-cn-" + k]: "Get a record, our way" } });
  assert.deepEqual(sent[0].body, { copy: V.civ, project: "P2", name: "Get a record, our way" });
  assert.equal(a.p.requests.at(-1).op === "wizards" || a.p.requests.some((r, i) => i > 0 && r.op === "wizards"), true, "R8: read again");
  // the name is the member's own words (interface-shell R11): with none, nothing is sent
  assert.deepEqual((await a.press("wizarddraft", { data: { mode: "copy", version: V.civ }, values: { ["wz-cn-" + k]: "" } })).sent, []);
  // control: with no project to choose, nothing is sent and the screen says why
  const n = await open("wizards", { me: MEMBER, table: libraryTable({ projectlist: env({ ok: true, projects: [], count: 0 }) }) });
  const r = await n.press("wizarddraft", { data: { mode: "copy", version: V.civ } });
  assert.deepEqual(r.sent, []);
  assert.equal(n.refused.key, "screen.wizards.project.none");
});

test("R1 R3 \"Record a new wizard\" hands over to the guide and sends nothing from the screen", async () => {
  const a = await open("wizards", { me: MEMBER, table: libraryTable() });
  const r = await a.press("wizarddraft", { data: { mode: "record" }, values: { "wz-project": "P1" } });
  assert.deepEqual(r.sent, []);
  // the screen calls `cs.wizard(null, null, {record: {project}})` (the guide's recording, J2 (10))
  const rec = SCREENS[0].acts.find((x) => x.op === "wizarddraft");
  const calls = [];
  const out = rec.send({ ui: {} }, { dataset: { mode: "record" } }, { value: () => "P1", wizard: (...x) => calls.push(x) }, {});
  assert.equal(out, null);
  assert.deepEqual(calls, [[null, null, { record: { project: "P1" } }]]);
  // control: with no project chosen, the guide is not started
  const none = [];
  assert.deepEqual(rec.send({ ui: {} }, { dataset: { mode: "record" } }, { value: () => "", wizard: (...x) => none.push(x) }, {}), { refuse: "screen.wizards.project.none" });
  assert.deepEqual(none, []);
});

test("R1 \"See its steps\" reads wizardread; the author's draft is reworded, reordered and pruned by wizardrevise", async () => {
  const a = await open("wizards", { me: MEMBER, table: libraryTable() });
  await a.press("wizards", { data: { open: V.civ } });
  assert.deepEqual(a.p.requests.filter((r) => r.op === "wizardread").map((r) => r.query), [{ script: GET_RECORD.id, version: V.civ }]);
  // a Civicsmith script's steps by their keys
  assert.ok(t(panelOf(a.tree, V.civ)).includes(said(`wizard.${GET_RECORD.id}.step1.what`)));
  await a.press("wizards", { data: { open: V.draft } });
  const k = V.draft.replace(/[^A-Za-z0-9_-]/g, "_");
  // a recorded step with no words yet says what was recorded
  // (the screen named by its word where the page carries it, else by its id)
  const recorded = ["request", said("screen.request.name")].map((screen) => said("screen.wizards.steps.recorded", { screen, act: said("screen.wizards.steps.noact") }));
  assert.ok(recorded.some((x) => a.text.includes(x)), "the recorded step says what was recorded");
  const { sent, asked } = await a.press("wizardrevise", { data: { mode: "edit", version: V.draft }, reason: "clearer",
    values: { [`wz-w-${k}-0`]: "Search the record", [`wz-p-${k}-0`]: "2", [`wz-p-${k}-1`]: "1", [`wz-x-${k}-2`]: true } });
  assert.equal(asked, true, "an undetermined act asks a reason (interface-shell R11)");
  assert.deepEqual(sent[0].body, { version: V.draft, reason: "clearer", steps: [
    { screen: "request", act: "actioncreate", what: COPY_STEPS[1].what, why: COPY_STEPS[1].why },
    { screen: "finder", act: "search", what: "Search the record", why: COPY_STEPS[0].why }] });
  // control: an approved version is not editable, and another author's draft offers no revise
  await a.press("wizards", { data: { open: V.copy } });
  assert.ok(!acts(panelOf(a.tree, V.copy)).some((b) => b.attrs["data-act"] === "wizardrevise"));
});

test("R1 wizardrevise adds a step with the advanced editor's fields; removing every step sends nothing", async () => {
  const a = await open("wizards", { me: MEMBER, table: libraryTable() });
  await a.press("wizards", { data: { open: V.draft } });
  const k = V.draft.replace(/[^A-Za-z0-9_-]/g, "_");
  const { sent } = await a.press("wizardrevise", { data: { mode: "edit", version: V.draft }, reason: "more",
    values: { [`wz-as-${k}`]: "document", [`wz-aa-${k}`]: "cite", [`wz-aw-${k}`]: "Cite it", [`wz-ay-${k}`]: "So it counts" } });
  assert.deepEqual(sent[0].body.steps.at(-1), { screen: "document", act: "cite", what: "Cite it", why: "So it counts" });
  assert.equal(sent[0].body.steps.length, 4);
  await a.press("wizards", { data: { open: V.draft } });
  const none = await a.press("wizardrevise", { data: { mode: "edit", version: V.draft }, reason: "none",
    values: { [`wz-x-${k}-0`]: true, [`wz-x-${k}-1`]: true, [`wz-x-${k}-2`]: true } });
  assert.deepEqual(none.sent, []);
  assert.equal(a.refused.key, "screen.wizards.edit.nosteps");
});

test("R1 a copy whose base changed shows what changed and brings it across by adopt: {base}", async () => {
  const a = await open("wizards", { me: MEMBER, table: libraryTable() });
  const p = panelOf(a.tree, V.draft);
  assert.ok(t(p).includes(said("screen.wizards.changes.copy")) && t(p).includes(said("screen.wizards.changes.base")));
  assert.ok(t(p).includes("Look for it"));
  const { sent } = await a.press("wizardrevise", { data: { mode: "base", version: V.draft }, reason: "the base changed" });
  assert.deepEqual(sent[0].body, { version: V.draft, adopt: { base: `${GET_RECORD.id}@2` }, reason: "the base changed" });
  // control: with the change on an approved copy, a new draft of it is offered instead (wizard-scripts R3's `from`)
  const up = { ok: true, entries: [{ copy: COPY.id, copy_version: V.copy, base: GET_RECORD.id, base_name: "Get a record", base_version: `${GET_RECORD.id}@2`, steps: { copy: [], base: [] } }] };
  const b = await open("wizards", { me: MEMBER, table: libraryTable({ baseupdates: env(up) }) });
  assert.ok(!acts(panelOf(b.tree, V.copy)).some((x) => x.attrs["data-act"] === "wizardrevise"));
  assert.deepEqual((await b.press("wizarddraft", { data: { mode: "from", from: V.copy } })).sent[0].body, { from: V.copy, name: COPY.name });
});

test("R1 wizardsubmit, wizardapprove (and widen), wizardretire (a script, or a version withdrawn) send their owner's arguments", async () => {
  const a = await open("wizards", { me: ADMIN, table: libraryTable() });
  assert.deepEqual((await a.press("wizardsubmit", { data: { version: V.draft }, reason: "ready" })).sent[0].body, { version: V.draft, reason: "ready" });
  assert.deepEqual((await a.press("wizardapprove", { data: { version: V.sub }, reason: "good" })).sent[0].body, { version: V.sub, reason: "good" });
  assert.deepEqual((await a.press("wizardapprove", { data: { version: V.copy, widen: "1" }, reason: "for all" })).sent[0].body, { version: V.copy, widen: true, reason: "for all" });
  const kd = V.draft.replace(/[^A-Za-z0-9_-]/g, "_"), kc = V.copy.replace(/[^A-Za-z0-9_-]/g, "_");
  assert.deepEqual((await a.press("wizardretire", { data: { version: V.draft }, values: { ["wz-r-" + kd]: "not needed" } })).sent[0].body,
    { script: COPY.id, version: V.draft, reason: "not needed" });
  assert.deepEqual((await a.press("wizardretire", { data: { field: "wz-rr-" + kc }, values: { ["wz-rr-" + kc]: "replaced" } })).sent[0].body,
    { script: COPY.id, reason: "replaced" });
  // control: a retirement with no reason sends nothing
  const none = await a.press("wizardretire", { data: { field: "wz-rr-" + kc }, values: { ["wz-rr-" + kc]: " " } });
  assert.deepEqual(none.sent, []);
});

test("R1 every refusal is drawn beside its act, a check's refusal naming its step; the form keeps what was typed", async () => {
  const table = libraryTable({ wizardsubmit: refuse("WIZARD_ACT_UNKNOWN", { step: 2 }), wizardretire: refuse("WIZARD_NOT_THE_GROUPS") });
  const a = await open("wizards", { me: ADMIN, table });
  await a.press("wizardsubmit", { data: { version: V.draft }, reason: "ready" });
  assert.equal(a.refused.text, said("screen.wizards.refusal.step", { step: "2", words: "translated WIZARD_ACT_UNKNOWN" }));
  const kc = V.copy.replace(/[^A-Za-z0-9_-]/g, "_");
  await a.press("wizardretire", { data: { field: "wz-rr-" + kc }, values: { ["wz-rr-" + kc]: "replaced" } });
  assert.equal(a.refused.text, "translated WIZARD_NOT_THE_GROUPS");
  assert.equal(a.b.doc.getElementById("wz-rr-" + kc).value, "replaced");
});

test("R8 the path Settings › Wizards, the four states of each read, and the list read again after an act", async () => {
  const a = await open("wizards", { me: ADMIN, table: libraryTable() });
  const crumbs = all(a.tree, (e) => e.tag === "nav" && /cs-crumbs/.test(e.attrs.class || ""))[0];
  assert.equal(t(crumbs), said("rail.settings.name") + said("screen.wizards.name"));
  for (const [answer, word] of [["pending", "state.loading"], [env({ ok: true, state: "offered", scripts: [], truncated: false }), "screen.wizards.empty"]]) {
    const o = await open("wizards", { me: ADMIN, table: libraryTable({ wizards: answer }) });
    has(o, word);
  }
  const f = await open("wizards", { me: ADMIN, table: libraryTable({ wizards: refuse("WIZARDS_STATE_REFUSED") }) });
  assert.ok(f.text.includes("translated WIZARDS_STATE_REFUSED"));
  const s = await open("wizards", { me: ADMIN, table: libraryTable({ wizards: "none" }) });
  lacks(s, "screen.wizards.empty");
  assert.ok(all(s.tree, (e) => e.attrs["data-state"] === "failed").length >= 1);
  // a failed read of baseupdates or projectlist leaves the library drawn
  const g = await open("wizards", { me: ADMIN, table: libraryTable({ baseupdates: "none", projectlist: "none" }) });
  assert.ok(rowOf(g.tree, V.civ));
  // after an act, what it changed is read again
  const before = a.p.requests.length;
  await a.press("wizardsubmit", { data: { version: V.draft }, reason: "ready" });
  assert.ok(a.p.requests.slice(before).map((r) => r.op).includes("wizards"));
  // a row's acts sit in its panel (interface-shell R19)
  const sub = acts(a.tree).find((b) => b.attrs["data-act"] === "wizardsubmit");
  assert.ok(ancestor(sub, (e) => /cs-panel/.test(e.attrs.class || "")));
});
