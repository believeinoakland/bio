/* wizard-scripts: the script and its versions, drafting, revision, proposals and submission (R1–R6), at the module's
   interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, draft, approved, V, MACHINE, STEPS, step, OFFERED_TEMPLATE, LIBRARY } from "./fixture.mjs";
import * as wz from "../../../src/wizard-scripts/index.mjs";
import { proposalLabel } from "../../../src/record-grammar/labels.mjs";
import { sha256HexSync } from "../../../src/record-grammar/sha256.mjs";

const A = V("alice"), B = V("bob"), F = V("frank"), E = V("erin");
const row = (c) => wz.WIZARD_SCRIPTS_CHECKS[c];
const refused = (r, c, why = "") => {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, c, c, row(c).check, row(c).translation], `${why} ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};
const read = (w, version, viewer = A) => w.wz.wizardRead({ version, viewer }).version;
const pairs = (steps) => steps.map((s) => ({ screen: s.screen, act: s.act }));

test("R1 a script is {id, origin, scope, name, start, required, versions}: an opaque WIZ- id (never a counter), origin group, scope its project, start its first step's screen; a version {script, version, steps, sha, state, author, contributors, derived_from, approved, ended}, counted from 1, sha the SHA-256 of the canonical steps, fixed once it leaves draft", () => {
  const w = seeded();
  const ids = new Set();
  for (let i = 0; i < 6; i++) ids.add(draft(w, { name: `Script ${i}` }).script);
  assert.equal(ids.size, 6);
  for (const id of ids) assert.match(id, /^WIZ-\d{4}-\d{4}$/);
  assert.ok(![...ids].every((id, i, l) => i === 0 || Number(id.slice(-4)) === Number(l[i - 1].slice(-4)) + 1), "not a counter");
  const d = approved(w, { name: "Note and save" });
  const r = w.wz.wizardRead({ script: d.script, viewer: A });
  assert.deepEqual([r.script.id, r.script.origin, r.script.scope, r.script.name, r.script.start, r.script.required],
                   [d.script, "group", { project: w.P }, "Note and save", "case-home", false]);
  const v = r.version;
  for (const k of ["script", "version", "steps", "sha", "state", "author", "contributors", "derived_from", "approved", "ended"]) assert.ok(k in v, k);
  assert.deepEqual([v.script, v.version, v.state, v.author.id, v.ended], [d.script, 1, "approved", "frank", null]);
  assert.equal(v.sha, sha256HexSync(JSON.stringify(STEPS.map((s) => ({ screen: s.screen, act: s.act, what: s.what, why: s.why })))));
  assert.equal(v.sha, wz.stepsSha(STEPS));
  assert.match(v.sha, /^[0-9a-f]{64}$/);
  /* a second version counts on, and the first's steps and sha never change */
  const n2 = w.wz.wizardDraft({ from: d.version, author: F, viewer: F });
  assert.equal(n2.version, `${d.script}@2`);
  w.wz.wizardRevise({ version: n2.version, steps: [STEPS[1], STEPS[0]], author: F, viewer: F });
  assert.deepEqual([read(w, d.version).steps, read(w, d.version).sha], [v.steps, v.sha]);
  refused(w.wz.wizardRevise({ version: d.version, steps: [STEPS[0]], author: F, viewer: F }), "NOT_A_DRAFT");
  /* the name: one line of 1 to 200 characters */
  for (const name of ["", " ", "a\nb", "x".repeat(201), null])
    refused(w.wz.wizardDraft({ project: w.P, name, recorded: [], author: F, viewer: F }), "WIZARD_NAME_REFUSED", JSON.stringify(name));
  assert.equal(w.wz.wizardDraft({ project: w.P, name: "x".repeat(200), recorded: [], author: F, viewer: F }).ok, true);
  /* Civicsmith scripts: origin civicsmith, required as the library says */
  const c = w.wz.wizardRead({ script: LIBRARY[0].id, viewer: F });
  assert.deepEqual([c.script.origin, c.script.required, c.script.scope, c.version.version, c.version.state], ["civicsmith", true, "group", 2, "approved"]);
  assert.equal(w.wz.wizardRead({ script: LIBRARY[1].id, viewer: F }).script.required, false);
  assert.deepEqual(wz.WIZARD_ORIGINS, ["civicsmith", "group", "imported"]);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM wiz_scripts`)[0].n, 8, "no row is written imported or civicsmith");
});

test("R2 a step is {screen, act, what, why, draft?}: act null or an op; what and why at most 300; a draft is {text} (at most 4,000), {template} or {machine}, answered labelled with its kind; anything else is WIZARD_STEP_REFUSED naming the step", () => {
  const w = seeded();
  const d = w.wz.wizardDraft({ project: w.P, name: "N", recorded: [{ screen: "case-home", act: "casenote" }, { screen: "case-home", act: "casenote" }],
                               author: F, viewer: F });
  w.wz.wizardEditorGrant({ member: "frank", by: E });   /* the shape alone is judged here (R4 asks the grant first) */
  const rev = (steps) => w.wz.wizardRevise({ version: d.version, steps, author: F, viewer: F });
  const ok = [
    [step("case-home", "casenote", { draft: { text: "x".repeat(4000) } })],
    [step("case-home", "casenote", { draft: { template: OFFERED_TEMPLATE } })],
    [step("case-home", "casenote", { draft: { machine: "whatchangedpropose" } })],
    [step("case-home", "casenote", { what: "x".repeat(300), why: "y".repeat(300) })],
    [{ screen: "case-home", act: "casenote", what: "", why: "" }],
  ];
  for (const s of ok) assert.equal(rev(s).ok, true, JSON.stringify(s).slice(0, 120));
  const bad = [
    [[step("case-home", "casenote", { what: "x".repeat(301) })], 1], [[step("case-home", "casenote"), step("case-home", "casenote", { why: "y".repeat(301) })], 2],
    [[step("case-home", "casenote", { draft: { text: "x".repeat(4001) } })], 1], [[step("case-home", "casenote", { draft: { text: "" } })], 1],
    [[step("case-home", "casenote", { draft: { file: "x" } })], 1], [[step("case-home", "casenote", { draft: { text: "a", machine: "whatchangedpropose" } })], 1],
    [[step("case-home", "casenote", { draft: "words" })], 1], [[step("case-home", "casenote", { value: "typed" })], 1],
    [[{ act: "casenote", what: "w", why: "y" }], 1], [["case-home"], 1], [[step("case-home", 7)], 1],
  ];
  for (const [s, n] of bad) assert.equal(refused(rev(s), "WIZARD_STEP_REFUSED", JSON.stringify(s).slice(0, 120)).step, n);
  refused(rev("steps"), "WIZARD_STEP_REFUSED");
  /* each draft is answered labelled with its kind */
  rev([step("case-home", "casenote", { draft: { text: "Our words" } }), step("case-home", "casenote", { draft: { machine: "whatchangedpropose" } })]);
  assert.deepEqual(read(w, d.version, F).steps.map((s) => s.draft), [{ text: "Our words" }, { machine: "whatchangedpropose" }]);
  /* a step never acts: no op of this module submits, signs or files anything but a script */
  const before = w.rows(`SELECT COUNT(*) AS n FROM files`)[0].n;
  w.wz.wizardSubmit({ version: d.version, author: F, viewer: F });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM files`)[0].n, before);
  assert.deepEqual(wz.DRAFT_SOURCES, ["text", "template", "machine"]);
});

test("R3 wizardDraft: a recording keeps only {screen, act} pairs (a typed value refused), its what and why empty until revised; from a proposal or an approved version (a derivative); a blank start needs a live editor grant", () => {
  const w = seeded();
  const rec = [{ screen: "case-home", act: "casenote" }, { screen: "filing-draft", act: null }];
  const d = w.wz.wizardDraft({ project: w.P, name: "Recorded", recorded: rec, author: F, viewer: F });
  assert.deepEqual([d.ok, d.state, d.version.endsWith("@1")], [true, "draft", true]);
  const v = read(w, d.version, F);
  assert.deepEqual(v.steps, [{ screen: "case-home", act: "casenote", what: "", why: "" }, { screen: "filing-draft", act: null, what: "", why: "" }]);
  assert.deepEqual(v.recorded, rec);
  assert.equal(v.derived_from, null);
  for (const extra of [{ value: "typed" }, { text: "x" }, { what: "w" }, { field: "name", value: "Alice" }])
    assert.equal(refused(w.wz.wizardDraft({ project: w.P, name: "N", recorded: [rec[0], { ...rec[1], ...extra }], author: F, viewer: F }),
                         "WIZARD_RECORDING_CARRIES_VALUES").step, 2);
  /* from a proposal for the project: a new script */
  const p = w.wz.wizardPropose({ project: w.P, steps: STEPS, why: "a start", proposer: MACHINE, viewer: MACHINE });
  const fp = w.wz.wizardDraft({ project: w.P, name: "From proposal", from: p.proposal.id, author: F, viewer: F });
  assert.equal(fp.ok, true);
  assert.notEqual(fp.script, d.script);
  assert.deepEqual(read(w, fp.version, F).derived_from, { proposal: p.proposal.id });
  assert.deepEqual(read(w, fp.version, F).steps, STEPS);
  /* from an approved version: a new draft version of that script */
  const a = approved(w, { name: "Approved" });
  const fv = w.wz.wizardDraft({ from: a.version, author: B, viewer: B });
  assert.deepEqual([fv.script, fv.version], [a.script, `${a.script}@2`]);
  assert.deepEqual(read(w, fv.version).derived_from, { version: a.version });
  /* a blank start: only with a live editor grant */
  refused(w.wz.wizardDraft({ project: w.P, name: "Blank", author: F, viewer: F }), "WIZARD_EDITOR_NOT_GRANTED");
  const g = w.wz.wizardEditorGrant({ member: "frank", by: E });
  const blank = w.wz.wizardDraft({ project: w.P, name: "Blank", author: F, viewer: F });
  assert.deepEqual([blank.ok, read(w, blank.version, F).steps], [true, []]);
  w.wz.wizardEditorRevoke({ grant: g.grant, by: E });
  refused(w.wz.wizardDraft({ project: w.P, name: "Blank", author: F, viewer: F }), "WIZARD_EDITOR_NOT_GRANTED", "revoked");
});

test("R3 refusals in order: MACHINE_CANNOT_DRAFT_WIZARD, NO_SUCH_WIZARD, WIZARD_SCOPE_REFUSED, WIZARD_EDITOR_NOT_GRANTED, WIZARD_RECORDING_CARRIES_VALUES, WIZARD_NAME_REFUSED", () => {
  const w = seeded();
  const call = (x) => w.wz.wizardDraft({ project: w.P, name: "N", recorded: [{ screen: "case-home", act: "casenote" }], author: F, viewer: F, ...x });
  assert.equal(call({}).ok, true, "negative control");
  for (const author of [MACHINE, "", null]) refused(call({ author, from: "WZP-2026-0000", name: "" }), "MACHINE_CANNOT_DRAFT_WIZARD");
  refused(call({ from: "WZP-2026-0000", recorded: undefined, name: "" }), "NO_SUCH_WIZARD");
  refused(call({ from: "WIZ-2026-0000@1", recorded: undefined }), "NO_SUCH_WIZARD");
  const hidden = w.wz.wizardPropose({ project: w.Q, steps: STEPS, why: "w", proposer: V("dave"), viewer: V("dave") });
  refused(call({ from: hidden.proposal.id, recorded: undefined }), "NO_SUCH_WIZARD", "a proposal in a project frank cannot see");
  const sub = draft(w);
  w.wz.wizardSubmit({ version: sub.version, author: F, viewer: F });
  refused(call({ from: sub.version, recorded: undefined }), "NO_SUCH_WIZARD", "a submitted version is not a source");
  refused(call({ author: V("carol"), viewer: V("carol"), recorded: undefined, name: "" }), "WIZARD_SCOPE_REFUSED", "invited, not joined");
  refused(call({ author: V("dave"), viewer: V("dave") }), "WIZARD_SCOPE_REFUSED");
  refused(call({ project: null }), "WIZARD_SCOPE_REFUSED");
  refused(call({ recorded: undefined, name: "" }), "WIZARD_EDITOR_NOT_GRANTED");
  refused(call({ recorded: [{ screen: "case-home", act: "casenote", value: "x" }], name: "" }), "WIZARD_RECORDING_CARRIES_VALUES");
  refused(call({ name: "" }), "WIZARD_NAME_REFUSED");
});

test("R4 wizardRevise keeps every revision with its author and time; without a grant the pairs may be reworded, deleted or reordered, never added; with a grant added; adopt takes a proposal's steps, which may then be used", () => {
  const w = seeded();
  const rec = [{ screen: "case-home", act: "casenote" }, { screen: "filing-draft", act: "filingsave" }];
  const d = w.wz.wizardDraft({ project: w.P, name: "N", recorded: rec, author: F, viewer: F });
  const rev = (steps, x = {}) => w.wz.wizardRevise({ version: d.version, steps, author: F, viewer: F, ...x });
  w.clock.now = "2026-10-04T09:00:00Z";
  assert.equal(rev([step("filing-draft", "filingsave"), step("case-home", "casenote")]).ok, true, "reorder");
  assert.equal(rev([step("case-home", "casenote", { what: "Write the note" })]).ok, true, "delete and reword");
  refused(rev([step("case-home", "casenote"), step("case-home", "casenote")]), "WIZARD_EDITOR_NOT_GRANTED", "a pair twice");
  refused(rev([step("publish", "publish")]), "WIZARD_EDITOR_NOT_GRANTED", "a new pair");
  refused(rev([step("case-home", "casejoin")]), "WIZARD_EDITOR_NOT_GRANTED", "a new act on a recorded screen");
  const g = w.wz.wizardEditorGrant({ member: "frank", by: E });
  assert.equal(rev([step("case-home", "casenote"), step("publish", null)]).ok, true, "with a grant");
  w.wz.wizardEditorRevoke({ grant: g.grant, by: E });
  refused(rev([step("case-home", "casenote"), step("case-home", "casejoin")]), "WIZARD_EDITOR_NOT_GRANTED", "revoked");
  /* adopt: a proposal's steps become the revision, and its pairs are the version's to use thereafter */
  const p = w.wz.wizardPropose({ script: d.script, steps: [step("publish", "publish"), step("case-home", "casenote")], why: "w", proposer: MACHINE, viewer: MACHINE });
  const ad = rev(undefined, { adopt: p.proposal.id });
  assert.deepEqual([ad.ok, ad.adopted], [true, p.proposal.id]);
  assert.equal(rev([step("publish", "publish")]).ok, true, "an adopted pair is allowed");
  const v = read(w, d.version, F);
  assert.deepEqual(v.revisions.map((r) => [r.by.id, r.at, r.adopted ?? null]), [
    ["frank", "2026-10-03T12:00:00Z", null], ["frank", "2026-10-04T09:00:00Z", null], ["frank", "2026-10-04T09:00:00Z", null],
    ["frank", "2026-10-04T09:00:00Z", null], ["frank", "2026-10-04T09:00:00Z", p.proposal.id], ["frank", "2026-10-04T09:00:00Z", null]]);
  assert.equal(v.revisions.length, 6);
  /* the author may run their own draft before approval (R11) */
  assert.ok(w.wz.wizardsAt({ screen: "publish", viewer: F }).scripts.some((s) => s.version === d.version && s.draft === true));
});

test("R4 refusals in order: MACHINE_CANNOT_DRAFT_WIZARD, NO_SUCH_WIZARD, WIZARD_SCOPE_REFUSED (anyone but the author), NOT_A_DRAFT, WIZARD_EDITOR_NOT_GRANTED, WIZARD_STEP_REFUSED naming the step", () => {
  const w = seeded();
  const d = draft(w);
  const rev = (x) => w.wz.wizardRevise({ version: d.version, steps: [STEPS[0]], author: F, viewer: F, ...x });
  for (const author of [MACHINE, "", null]) refused(rev({ author, version: "WIZ-2026-0000@1" }), "MACHINE_CANNOT_DRAFT_WIZARD");
  refused(rev({ version: "WIZ-2026-0000@1" }), "NO_SUCH_WIZARD");
  refused(rev({ version: `${d.script}@9` }), "NO_SUCH_WIZARD");
  refused(rev({ author: V("dave"), viewer: V("dave") }), "NO_SUCH_WIZARD", "dave cannot see P");
  refused(rev({ author: A, viewer: A }), "WIZARD_SCOPE_REFUSED", "an owner, not the author");
  refused(rev({ adopt: "WZP-2026-0000", steps: undefined }), "NO_SUCH_WIZARD");
  refused(rev({ steps: [step("publish", "publish", { what: "x".repeat(301) })] }), "WIZARD_EDITOR_NOT_GRANTED", "before the shape");
  assert.equal(refused(rev({ steps: [STEPS[0], step("filing-draft", "filingsave", { what: "x".repeat(301) })] }), "WIZARD_STEP_REFUSED").step, 2);
  assert.equal(rev({}).ok, true, "negative control");
  w.wz.wizardSubmit({ version: d.version, author: F, viewer: F });
  refused(rev({ steps: [step("publish", "publish")] }), "NOT_A_DRAFT", "before the grant");
});

test("R5 wizardPropose: any credential proposes for a project or a script, stored apart under an opaque WZP- id with why of 1 to 1,000; a draft only when named as from or adopted, and its run then joins contributors, dated", () => {
  const w = seeded();
  const d = draft(w);
  const before = read(w, d.version, F);
  const p1 = w.wz.wizardPropose({ script: d.script, steps: [STEPS[1]], why: "shorter", proposer: MACHINE, viewer: MACHINE, run: "RUN-1", model: "m" });
  const p2 = w.wz.wizardPropose({ project: w.P, steps: STEPS, why: "x".repeat(1000), proposer: A, viewer: A });
  for (const p of [p1, p2]) { assert.equal(p.ok, true); assert.match(p.proposal.id, /^WZP-\d{4}-\d{4}$/); assert.equal(p.evidence, false); }
  assert.deepEqual(read(w, d.version, F), before, "a proposal changes no version");
  assert.equal(w.count("wiz_proposals"), 2);
  w.clock.now = "2026-10-05T00:00:00Z";
  w.wz.wizardRevise({ version: d.version, adopt: p1.proposal.id, author: F, viewer: F });
  const c = read(w, d.version, F).contributors;
  assert.deepEqual(c.map((x) => [x.kind, x.member ?? x.proposal, x.at]), [["member", "frank", "2026-10-03T12:00:00Z"], ["run", p1.proposal.id, "2026-10-05T00:00:00Z"]]);
  assert.deepEqual([c[1].run, c[1].model], ["RUN-1", "m"]);
  assert.equal(w.wz.wizardDraft({ project: w.P, name: "From p2", from: p2.proposal.id, author: F, viewer: F }).ok, true);
  /* refusals in order */
  const call = (x) => w.wz.wizardPropose({ project: w.P, steps: STEPS, why: "w", proposer: MACHINE, viewer: MACHINE, ...x });
  for (const proposer of ["", null]) refused(call({ proposer, project: "nope", steps: "x", why: "" }), "WIZARD_NO_PROPOSER");
  refused(call({ project: "PROJ-0000-none", steps: "x" }), "NO_SUCH_WIZARD");
  refused(call({ project: w.Q, viewer: F, proposer: F }), "NO_SUCH_WIZARD", "a project frank cannot see");
  refused(call({ project: null, script: "WIZ-2026-0000" }), "NO_SUCH_WIZARD");
  refused(call({ steps: [{ screen: "case-home", value: "x" }], why: "" }), "WIZARD_STEP_REFUSED");
  refused(call({ steps: [] }), "WIZARD_STEP_REFUSED");
  for (const why of ["", " ", "x".repeat(1001), null]) refused(call({ why }), "WIZARD_WHY_REFUSED");
  refused(call({ project: null, script: LIBRARY[0].id }), "WIZARD_NOT_THE_GROUPS");
});

test("R5 a proposal is labelled proposalLabel(proposer, \"wizard\") (record-grammar R42), in its answer, in contributors and in the proposed list", () => {
  const w = seeded();
  const d = draft(w);
  const p = w.wz.wizardPropose({ script: d.script, steps: [STEPS[0]], why: "w", proposer: MACHINE, viewer: MACHINE });
  const want = proposalLabel(MACHINE, "wizard");
  assert.deepEqual(p.proposal.label, want);
  assert.equal(want.machine_work, true);
  w.wz.wizardRevise({ version: d.version, adopt: p.proposal.id, author: F, viewer: F });
  assert.deepEqual(read(w, d.version, F).contributors[1].label, want);
  const q = w.wz.wizardPropose({ project: w.P, steps: STEPS, why: "w", proposer: A, viewer: A });
  assert.deepEqual(w.wz.wizards({ state: "proposed", viewer: A }).proposals.find((x) => x.id === q.proposal.id).label, proposalLabel(A, "wizard"));
});

test("R6 wizardSubmit moves a draft to submitted and fixes its steps and sha; refusals in order: MACHINE_CANNOT_DRAFT_WIZARD, NO_SUCH_WIZARD, WIZARD_SCOPE_REFUSED, NOT_A_DRAFT, R12's refusals naming each step", () => {
  const w = seeded();
  const d = draft(w);
  const sub = (x) => w.wz.wizardSubmit({ version: d.version, author: F, viewer: F, ...x });
  for (const author of [MACHINE, "", null]) refused(sub({ author, version: "WIZ-2026-0000@1" }), "MACHINE_CANNOT_DRAFT_WIZARD");
  refused(sub({ version: "WIZ-2026-0000@1" }), "NO_SUCH_WIZARD");
  refused(sub({ author: A, viewer: A }), "WIZARD_SCOPE_REFUSED");
  const bad = w.wz.wizardDraft({ project: w.P, name: "Unrevised", recorded: [{ screen: "case-home", act: "casenote" }, { screen: "gone", act: null }],
                                 author: F, viewer: F });
  const r = refused(w.wz.wizardSubmit({ version: bad.version, author: F, viewer: F }), "WIZARD_STEP_NO_WHY");
  assert.equal(r.step, 1);
  assert.deepEqual(r.refusals.map((x) => [x.code, x.step]), [["WIZARD_STEP_NO_WHY", 1], ["WIZARD_SCREEN_UNKNOWN", 2], ["WIZARD_STEP_NO_WHY", 2]]);
  assert.equal(read(w, bad.version, F).state, "draft", "nothing written");
  const s = sub({});
  assert.deepEqual([s.ok, s.state, s.sha], [true, "submitted", read(w, d.version, F).sha]);
  assert.equal(read(w, d.version, F).state, "submitted");
  refused(sub({}), "NOT_A_DRAFT");
  refused(w.wz.wizardRevise({ version: d.version, steps: [STEPS[0]], author: F, viewer: F }), "NOT_A_DRAFT", "steps fixed");
  refused(w.wz.wizardSubmit({ version: `${LIBRARY[0].id}@2`, author: F, viewer: F }), "WIZARD_NOT_THE_GROUPS");
});
