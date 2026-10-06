/* wizard-scripts: "Copy a wizard to change it" (T34-92; DEC-158; K1818): a copy and its `based_on` (R1, R3), bringing a
   newer base across (R4's `adopt: {base}`), the reads that show the base (R10, R21) and the copies whose base moved on
   (R26), at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, draft, approved, V, MACHINE, STEPS, step, LIBRARY } from "./fixture.mjs";
import * as wz from "../../../src/wizard-scripts/index.mjs";

const A = V("alice"), B = V("bob"), F = V("frank"), E = V("erin"), D = V("dave"), C = V("carol");
const row = (c) => wz.WIZARD_SCRIPTS_CHECKS[c];
const refused = (r, c, why = "") => {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, c, c, row(c).check, row(c).translation], `${why} ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};
const read = (w, version, viewer = A) => w.wz.wizardRead({ version, viewer });
const REQ = `${LIBRARY[0].id}@2`;   /* the test library's required script */

test("R3 copy: a new script of the author's project, origin group, required false, based_on the version copied, its first draft the base's steps; never a version of its base, which stays unchanged and offered; a copy of a required Civicsmith script leaves it the required one", () => {
  const w = seeded();
  const before = read(w, REQ, F);
  const c = w.wz.wizardDraft({ project: w.P, copy: REQ, author: F, viewer: F });
  assert.deepEqual([c.ok, c.state, c.based_on, c.version.endsWith("@1")], [true, "draft", REQ, true]);
  assert.notEqual(c.script, LIBRARY[0].id);
  const r = read(w, c.version, F);
  assert.deepEqual([r.script.origin, r.script.required, r.script.scope, r.script.name, r.script.based_on],
                   ["group", false, { project: w.P }, "Start a case", { version: REQ, name: "Start a case" }]);
  assert.deepEqual(r.version.steps, LIBRARY[0].steps);
  assert.deepEqual(r.version.recorded, LIBRARY[0].steps.map((s) => ({ screen: s.screen, act: s.act })), "the base's pairs are the draft's recorded pairs");
  assert.equal(r.version.derived_from, null, "not a derivative of the base's script");
  /* the base: unchanged, still offered, still the required one, still checked by R14 */
  assert.deepEqual(read(w, REQ, F), before);
  assert.ok(w.wz.wizardsAt({ screen: "case-home", viewer: F }).scripts.some((s) => s.version === REQ));
  assert.equal(read(w, REQ, F).script.required, true);
  assert.deepEqual(wz.requiredFailures({ screens: [{ id: "case-home", acts: ["casenote", "casejoin"] }], library: LIBRARY.slice(0, 1) }), []);
  /* approved like any wizard the group writes: the copy is offered beside the base */
  w.wz.wizardRevise({ version: c.version, steps: [LIBRARY[0].steps[1], LIBRARY[0].steps[0]], author: F, viewer: F });
  w.wz.wizardSubmit({ version: c.version, author: F, viewer: F });
  assert.equal(w.wz.wizardApprove({ version: c.version, by: A, viewer: A }).ok, true);
  const home = w.wz.wizardsAt({ screen: "case-home", viewer: F }).scripts.map((s) => s.version);
  assert.ok(home.includes(REQ) && home.includes(c.version));
  assert.equal(read(w, c.version).script.based_on.version, REQ, "set once, never changed");
  /* a named copy; a copy of the group's own approved script */
  const g = approved(w, { name: "Ours" });
  const c2 = w.wz.wizardDraft({ project: w.P, name: "Ours, changed", copy: g.version, author: B, viewer: B });
  assert.deepEqual([read(w, c2.version, B).script.name, read(w, c2.version, B).script.based_on], ["Ours, changed", { version: g.version, name: "Ours" }]);
  assert.equal(read(w, g.version).version.state, "approved", "the base stays approved, not updated");
  /* the rules for from are unchanged */
  assert.equal(read(w, w.wz.wizardDraft({ from: g.version, author: F, viewer: F }).version).script.based_on, null);
});

test("R3 copy's refusals, in from's place in the order: MACHINE_CANNOT_DRAFT_WIZARD; NO_SUCH_WIZARD (absent, not approved or not visible, one answer); WIZARD_SCOPE_REFUSED; WIZARD_NAME_REFUSED; a copy with a recording or a from is one source too many", () => {
  const w = seeded();
  const call = (x) => w.wz.wizardDraft({ project: w.P, copy: REQ, author: F, viewer: F, ...x });
  for (const author of [MACHINE, null]) refused(call({ author, copy: "WIZ-2026-0000@1" }), "MACHINE_CANNOT_DRAFT_WIZARD");
  refused(call({ copy: "WIZ-2026-0000@1" }), "NO_SUCH_WIZARD", "absent");
  refused(call({ copy: `${LIBRARY[0].id}@1` }), "NO_SUCH_WIZARD", "no such version");
  refused(call({ copy: LIBRARY[0].id }), "NO_SUCH_WIZARD", "a script, not a version");
  const d = draft(w, { name: "Draft" });
  refused(call({ copy: d.version }), "NO_SUCH_WIZARD", "a draft is not approved");
  const s = draft(w, { name: "Sub" }); w.wz.wizardSubmit({ version: s.version, author: F, viewer: F });
  refused(call({ copy: s.version }), "NO_SUCH_WIZARD", "submitted");
  const old = approved(w, { name: "Old" });
  const n2 = w.wz.wizardDraft({ from: old.version, author: F, viewer: F });
  w.wz.wizardSubmit({ version: n2.version, author: F, viewer: F }); w.wz.wizardApprove({ version: n2.version, by: A, viewer: A });
  refused(call({ copy: old.version }), "NO_SUCH_WIZARD", "updated: not the approved version");
  assert.equal(call({ copy: n2.version }).ok, true, "its approved successor");
  const q = draft(w, { who: "dave", name: "Q's", project: w.Q });
  refused(call({ copy: q.version }), "NO_SUCH_WIZARD", "not visible");
  refused(call({ project: w.Q }), "WIZARD_SCOPE_REFUSED", "frank is not in Q");
  refused(call({ author: C, viewer: C }), "WIZARD_SCOPE_REFUSED", "carol is invited, not joined");
  refused(call({ project: null }), "WIZARD_SCOPE_REFUSED");
  for (const name of ["a\nb", "x".repeat(201)]) refused(call({ name }), "WIZARD_NAME_REFUSED", JSON.stringify(name));
  assert.equal(refused(call({ recorded: [{ screen: "case-home", act: "casenote" }] }), "WIZARD_STEP_REFUSED").step, null);
  refused(call({ from: old.version }), "WIZARD_STEP_REFUSED");
  assert.equal(call({}).ok, true, "negative control, with no grant: a copy needs none");
  /* dave, outside P, copies the library's script into Q */
  assert.equal(w.wz.wizardDraft({ project: w.Q, copy: REQ, author: D, viewer: D }).ok, true);
});

test("R4 adopt: {base}: a copy's author brings a newer approved version of its base across without the advanced editor, its pairs joining the version's; an older, the same, an unrelated or an unseen version is NO_SUCH_WIZARD", () => {
  const w = seeded();
  const base = approved(w, { name: "Base" });
  const c = w.wz.wizardDraft({ project: w.P, copy: base.version, author: B, viewer: B });
  const rev = (x) => w.wz.wizardRevise({ version: c.version, author: B, viewer: B, ...x });
  refused(rev({ steps: [...STEPS, step("publish", "publish")] }), "WIZARD_EDITOR_NOT_GRANTED", "no grant: a pair the base never had");
  refused(rev({ adopt: { base: base.version } }), "NO_SUCH_WIZARD", "the same version is not newer");
  /* the base moves on: version 2 adds a publish step */
  const n2 = w.wz.wizardDraft({ from: base.version, author: F, viewer: F });
  w.wz.wizardEditorGrant({ member: "frank", by: E });
  const newer = [...STEPS, step("publish", "publish")];
  w.wz.wizardRevise({ version: n2.version, steps: newer, author: F, viewer: F });
  refused(rev({ adopt: { base: n2.version } }), "NO_SUCH_WIZARD", "a draft of the base is not approved");
  w.wz.wizardSubmit({ version: n2.version, author: F, viewer: F }); w.wz.wizardApprove({ version: n2.version, by: A, viewer: A });
  const other = approved(w, { name: "Unrelated" });
  refused(rev({ adopt: { base: other.version } }), "NO_SUCH_WIZARD", "another script's version");
  refused(rev({ adopt: { base: "WIZ-2026-0000@2" } }), "NO_SUCH_WIZARD");
  refused(rev({ adopt: { base: null } }), "NO_SUCH_WIZARD");
  const ad = rev({ adopt: { base: n2.version } });
  assert.deepEqual([ad.ok, ad.adopted_base], [true, n2.version]);
  assert.deepEqual(read(w, c.version, B).version.steps, newer);
  assert.deepEqual(read(w, c.version, B).version.revisions.at(-1).adopted_base, n2.version);
  assert.equal(rev({ steps: [step("publish", "publish"), STEPS[0]] }).ok, true, "an adopted pair may be used thereafter");
  /* an older base version, after a newer: the older is not newer than based_on */
  const c2 = w.wz.wizardDraft({ project: w.P, copy: n2.version, author: B, viewer: B });
  refused(w.wz.wizardRevise({ version: c2.version, adopt: { base: base.version }, author: B, viewer: B }), "NO_SUCH_WIZARD", "older");
  /* a script that is not a copy has no base to adopt from */
  const d = draft(w, { name: "Not a copy" });
  refused(w.wz.wizardRevise({ version: d.version, adopt: { base: n2.version }, author: F, viewer: F }), "NO_SUCH_WIZARD");
  /* a base dave cannot see answers absent to him */
  const dq = w.wz.wizardDraft({ project: w.Q, copy: REQ, author: D, viewer: D });
  refused(w.wz.wizardRevise({ version: dq.version, adopt: { base: n2.version }, author: D, viewer: D }), "NO_SUCH_WIZARD");
});

test("R10 wizards and wizardRead answer each script's based_on with its base's name, or null; R21 answers it in the registry form", () => {
  const w = seeded();
  const c = approved(w, { name: "Copied" });   /* not a copy: based_on null */
  const cp = w.wz.wizardDraft({ project: w.P, copy: REQ, name: "My start", author: F, viewer: F });
  w.wz.wizardSubmit({ version: cp.version, author: F, viewer: F }); w.wz.wizardApprove({ version: cp.version, by: A, viewer: A });
  const listed = Object.fromEntries(w.wz.wizards({ viewer: A }).scripts.map((s) => [s.id, s.based_on]));
  assert.deepEqual([listed[c.script], listed[cp.script]], [null, { version: REQ, name: "Start a case" }]);
  assert.deepEqual(Object.fromEntries(w.wz.wizards({ viewer: E }).scripts.map((s) => [s.id, s.based_on]))[LIBRARY[0].id], null);
  assert.deepEqual(read(w, cp.version).script.based_on, { version: REQ, name: "Start a case" });
  const e = w.wz.wizardRegistry({ viewer: F }).screens.find((s) => s.id === "case-home").scripts.find((s) => s.id === cp.script);
  assert.deepEqual(e.based_on, { version: REQ, name: "Start a case" });
  assert.equal(w.wz.wizardRegistry({ viewer: F }).screens.find((s) => s.id === "case-home").scripts.find((s) => s.id === c.script).based_on, null);
});

test("R26 baseUpdates lists each (copy, newer base version) once, with both version ids and both step lists, for an offered or draft copy whose base has a later approved version, in (instant, copy) order, at most 500 a page with cursor and truncated; recipients the editors who may see the copy, else its approvers; it writes only the instant first found; nothing is applied", () => {
  const w = seeded();
  const base = approved(w, { name: "Base" });
  const cp = w.wz.wizardDraft({ project: w.P, copy: base.version, name: "Copy", author: B, viewer: B });
  const cp2 = w.wz.wizardDraft({ project: w.P, copy: base.version, name: "Second", author: F, viewer: F });
  const gone = w.wz.wizardDraft({ project: w.P, copy: base.version, name: "Withdrawn copy", author: B, viewer: B });
  w.wz.wizardRetire({ version: gone.version, reason: "no", by: B, viewer: B });
  assert.deepEqual(w.wz.baseUpdates({ viewer: MACHINE }).entries, [], "the base has not moved");
  w.clock.now = "2026-10-05T00:00:00Z";
  const n2 = w.wz.wizardDraft({ from: base.version, author: F, viewer: F });
  w.wz.wizardRevise({ version: n2.version, steps: [STEPS[1], STEPS[0]], author: F, viewer: F });
  w.wz.wizardSubmit({ version: n2.version, author: F, viewer: F });
  assert.deepEqual(w.wz.baseUpdates({ viewer: MACHINE }).entries, [], "submitted is not approved");
  w.wz.wizardApprove({ version: n2.version, by: A, viewer: A });
  w.clock.now = "2026-10-06T00:00:00Z";
  const copyBefore = read(w, cp.version, B).version;
  const r = w.wz.baseUpdates({ viewer: MACHINE });
  const mine = (x) => ({ ...x, entries: x.entries.filter((e) => e.copy === cp.script) });
  assert.deepEqual(mine(r), { ok: true, limit: 500, truncated: false, cursor: null, entries: [{
    copy: cp.script, name: "Copy", copy_version: cp.version, copy_steps: STEPS, base: base.script, base_name: "Base", based_on: base.version,
    newer: n2.version, newer_steps: [STEPS[1], STEPS[0]], project: w.P, recipients: ["alice", "bob"], recipients_are: "approvers",
    at: "2026-10-06T00:00:00Z" }] }, "the withdrawn copy is neither offered nor a draft");
  assert.deepEqual(read(w, cp.version, B).version, copyBefore, "nothing applied to the copy");
  /* once: the instant first found stays; nothing else is written */
  w.clock.now = "2026-10-07T00:00:00Z";
  const snap = w.snapshot();
  assert.deepEqual(w.wz.baseUpdates({ viewer: MACHINE }).entries.map((e) => e.at), ["2026-10-06T00:00:00Z", "2026-10-06T00:00:00Z"]);
  assert.deepEqual(w.snapshot(), snap, "a pair already found writes nothing");
  assert.equal(w.count("wiz_base_seen"), 2, "one per pair: the two live copies");
  /* the editors: a live grant held by a member who may see the copy; dave holds one and cannot see P */
  w.wz.wizardEditorGrant({ member: "dave", by: E });
  assert.deepEqual(w.wz.baseUpdates({ viewer: MACHINE }).entries.find((e) => e.copy === cp.script).recipients, ["alice", "bob"], "dave cannot see P");
  const g = w.wz.wizardEditorGrant({ member: "frank", by: E });
  assert.deepEqual([w.wz.baseUpdates({ viewer: MACHINE }).entries.find((e) => e.copy === cp.script).recipients, w.wz.baseUpdates({ viewer: MACHINE }).entries.find((e) => e.copy === cp.script).recipients_are], [["frank"], "editors"]);
  w.wz.wizardEditorRevoke({ grant: g.grant, by: E });
  assert.deepEqual(w.wz.baseUpdates({ viewer: MACHINE }).entries.find((e) => e.copy === cp.script).recipients_are, "approvers", "revoked");
  /* a copy of the newer version, later; paging in (instant, copy) order */
  const ordered = [cp.script, cp2.script].sort();
  w.clock.now = "2026-10-08T00:00:00Z";
  const n3 = w.wz.wizardDraft({ from: n2.version, author: F, viewer: F });
  const cp3 = w.wz.wizardDraft({ project: w.P, copy: n2.version, name: "Third", author: F, viewer: F });
  w.wz.wizardSubmit({ version: n3.version, author: F, viewer: F }); w.wz.wizardApprove({ version: n3.version, by: A, viewer: A });
  const all = w.wz.baseUpdates({ viewer: MACHINE }).entries;
  assert.deepEqual(all.map((e) => [e.copy, e.newer, e.at]), [
    ...ordered.map((c) => [c, n2.version, "2026-10-06T00:00:00Z"]),
    ...[...ordered.map((c) => [c, n3.version]), [cp3.script, n3.version]].sort((x, y) => (x[0] < y[0] ? -1 : 1)).map((x) => [...x, "2026-10-08T00:00:00Z"])],
    "each newer version is a pair of its own; the copy of version 2 is behind only version 3");
  const p1 = w.wz.baseUpdates({ limit: 1, viewer: MACHINE });
  assert.deepEqual([p1.entries.map((e) => e.copy), p1.truncated], [[ordered[0]], true]);
  assert.deepEqual(w.wz.baseUpdates({ after: p1.cursor, viewer: MACHINE }).entries.map((e) => e.copy), all.slice(1).map((e) => e.copy));
  assert.deepEqual(w.wz.baseUpdates({ viewer: D }).entries, [], "a viewer who cannot see P");
  assert.equal(w.wz.baseUpdates({ limit: 9999, viewer: MACHINE }).limit, 500);
  /* an approved copy is listed with its offered version; through the op table */
  w.wz.wizardSubmit({ version: cp2.version, author: F, viewer: F }); w.wz.wizardApprove({ version: cp2.version, by: A, viewer: A });
  const url = new URL(`https://x/?op=baseupdates&viewer=${encodeURIComponent(MACHINE)}`);
  assert.deepEqual(wz.wizardScriptsOps(w.wz, url, null).baseupdates().entries.filter((e) => e.copy === cp2.script).map((e) => e.copy_version),
                   [cp2.version, cp2.version]);
  /* a retired copy leaves */
  w.wz.wizardRetire({ script: cp2.script, reason: "done", by: A, viewer: A });
  assert.ok(!w.wz.baseUpdates({ viewer: MACHINE }).entries.some((e) => e.copy === cp2.script));
});

test("R20 R10 R26 a copy whose base the viewer may not see shows it is a copy and names neither the base's version nor its name; its recipients are only members who may see both", () => {
  const w = seeded();
  w.join(w.Q, "frank");                                   /* frank is in P and Q; alice and bob only in P */
  const qbase = approved(w, { who: "frank", by: "dave", name: "Q's secret", project: w.Q });
  const cp = w.wz.wizardDraft({ project: w.P, copy: qbase.version, name: "Into P", author: F, viewer: F });
  assert.equal(cp.ok, true);
  assert.deepEqual(read(w, cp.version, F).script.based_on, { version: qbase.version, name: "Q's secret" }, "frank sees Q");
  assert.deepEqual(read(w, cp.version, A).script.based_on, { version: null, name: null }, "alice does not");
  assert.ok(!JSON.stringify(read(w, cp.version, A)).includes("Q's secret"));
  assert.ok(!JSON.stringify(read(w, cp.version, A)).includes(qbase.script));
  w.wz.wizardSubmit({ version: cp.version, author: F, viewer: F }); w.wz.wizardApprove({ version: cp.version, by: A, viewer: A });
  assert.ok(!JSON.stringify(w.wz.wizardRegistry({ viewer: A })).includes("Q's secret"));
  assert.ok(!JSON.stringify(w.wz.wizards({ viewer: A })).includes("Q's secret"));
  /* the base moves on: P's owners cannot see it, so nobody is told but those who can */
  const n2 = w.wz.wizardDraft({ from: qbase.version, author: F, viewer: F });
  w.wz.wizardSubmit({ version: n2.version, author: F, viewer: F }); w.wz.wizardApprove({ version: n2.version, by: D, viewer: D });
  assert.deepEqual(w.wz.baseUpdates({ viewer: MACHINE }).entries.map((e) => [e.copy, e.recipients]), [[cp.script, []]]);
  w.wz.wizardEditorGrant({ member: "frank", by: E });
  assert.deepEqual(w.wz.baseUpdates({ viewer: MACHINE }).entries.map((e) => [e.recipients, e.recipients_are]), [[["frank"], "editors"]]);
  assert.deepEqual(w.wz.baseUpdates({ viewer: A }).entries, [], "alice sees the copy, not its base: no pair names it to her");
  assert.equal(w.wz.baseUpdates({ viewer: F }).entries.length, 1);
});
