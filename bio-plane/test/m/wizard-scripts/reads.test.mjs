/* wizard-scripts: the reads: the library lists and one version (R10), the scripts that start on a screen (R11), and the
   approvals owed (R17), at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, draft, approved, V, MACHINE, STEPS, step, LIBRARY } from "./fixture.mjs";
import * as wz from "../../../src/wizard-scripts/index.mjs";

const A = V("alice"), B = V("bob"), F = V("frank"), E = V("erin"), D = V("dave");
const row = (c) => wz.WIZARD_SCRIPTS_CHECKS[c];
const refused = (r, c, why = "") => {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, c, c, row(c).check, row(c).translation], `${why} ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};
const ids = (r) => r.scripts.map((s) => s.id);

test("R10 wizards lists, to the owners of a script's project and to administrators, the scripts the viewer may see, newest first, each offered version with state, author, contributors, approver, dates, broken and use; others see none; writes nothing", () => {
  const w = seeded();
  const a1 = approved(w, { name: "First" });
  w.clock.now = "2026-10-04T00:00:00Z";
  const a2 = approved(w, { name: "Second" });
  const dq = draft(w, { who: "dave", name: "Q's", project: w.Q });
  const before = w.snapshot();
  const al = w.wz.wizards({ viewer: A });
  assert.deepEqual(ids(al), [a2.script, a1.script], "an owner of P: P's offered scripts, newest first");
  const v = al.scripts[0].versions[0];
  assert.deepEqual([v.id, v.state, v.author.id, v.approved.by.id, v.broken, v.use, v.start], [a2.version, "approved", "frank", "alice", false, { start: 0, finish: 0 }, "case-home"]);
  assert.ok(Array.isArray(v.contributors) && v.created_at);
  assert.equal(al.truncated, false);
  assert.deepEqual(ids(w.wz.wizards({ viewer: E })), [a2.script, a1.script, LIBRARY[1].id, LIBRARY[0].id], "an administrator: every one, the library's too");
  assert.deepEqual(ids(w.wz.wizards({ viewer: F })), [], "frank is joined, not an owner");
  assert.deepEqual(ids(w.wz.wizards({ viewer: D })), [], "dave owns Q, which has only a draft");
  assert.deepEqual(ids(w.wz.wizards({ state: "draft", viewer: D })), [dq.script]);
  assert.deepEqual(ids(w.wz.wizards({ state: "draft", viewer: A })), [], "alice cannot see Q");
  /* the states */
  const d = draft(w, { name: "Draft" });
  const s = draft(w, { name: "Sub" }); w.wz.wizardSubmit({ version: s.version, author: F, viewer: F });
  const x = draft(w, { name: "Gone" }); w.wz.wizardRetire({ version: x.version, reason: "r", by: F, viewer: F });
  w.wz.wizardRetire({ script: a1.script, reason: "old", by: A, viewer: A });
  const p = w.wz.wizardPropose({ project: w.P, steps: STEPS, why: "w", proposer: MACHINE, viewer: MACHINE });
  assert.deepEqual(ids(w.wz.wizards({ state: "draft", viewer: A })), [d.script]);
  assert.deepEqual(ids(w.wz.wizards({ state: "submitted", viewer: A })), [s.script]);
  assert.deepEqual(ids(w.wz.wizards({ state: "withdrawn", viewer: A })), [x.script]);
  assert.deepEqual(ids(w.wz.wizards({ state: "retired", viewer: A })), [a1.script]);
  assert.deepEqual(ids(w.wz.wizards({ viewer: A })), [a2.script], "a retired script is not offered");
  assert.deepEqual(w.wz.wizards({ state: "proposed", viewer: A }).proposals.map((q) => q.id), [p.proposal.id]);
  assert.deepEqual(w.wz.wizards({ state: "broken", viewer: A }).scripts, []);
  refused(w.wz.wizards({ state: "everything", viewer: A }), "WIZARDS_STATE_REFUSED");
  assert.deepEqual(wz.WIZARDS_STATES_LISTED, ["draft", "submitted", "withdrawn", "retired", "broken", "proposed"]);
  /* reads write nothing */
  const mid = w.snapshot();
  w.wz.wizards({ viewer: A }); w.wz.wizardRead({ script: a2.script, viewer: A }); w.wz.wizardsAt({ screen: "case-home", viewer: F });
  w.wz.wizardCheck({ steps: STEPS, viewer: F }); w.wz.submittedFor({ viewer: MACHINE }); w.wz.brokenScripts({ viewer: MACHINE });
  assert.deepEqual(w.snapshot(), mid);
  assert.notDeepEqual(before, mid);
});

test("R10 wizards answers at most 200 scripts, with truncated", () => {
  const w = seeded();
  for (let i = 0; i < 201; i++)
    w.st.sql.exec(`INSERT INTO wiz_scripts (script_id, bundle_id, project, name, created_by, created_name, created_at) VALUES (?,?,?,?,?,?,?)`,
                  `WIZ-2026-${String(i).padStart(4, "0")}`, w.P, w.P, `S${i}`, "frank", "h_frank", NOW(i));
  for (let i = 0; i < 201; i++) {
    const sid = `WIZ-2026-${String(i).padStart(4, "0")}`;
    w.st.sql.exec(`INSERT INTO wiz_versions (script_id, version, bundle_id, author, author_name, recorded, derived_from, created_at) VALUES (?,1,?,?,?,NULL,NULL,?)`, sid, w.P, "frank", "h_frank", NOW(i));
    w.st.sql.exec(`INSERT INTO wiz_revisions (script_id, version, bundle_id, steps, sha, author, author_name, adopted, at) VALUES (?,1,?,?,?,?,?,NULL,?)`, sid, w.P, "[]", "x", "frank", "h_frank", NOW(i));
  }
  const r = w.wz.wizards({ state: "draft", viewer: A });
  assert.deepEqual([r.scripts.length, r.truncated, r.scripts[0].id], [200, true, "WIZ-2026-0200"]);
});
function NOW(i) { return `2026-10-03T12:${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}Z`; }

test("R10 wizardRead answers one version, the latest approved by default, with its steps and whole attribution; a version the viewer may not see is absent", () => {
  const w = seeded();
  const a = approved(w);
  const n2 = w.wz.wizardDraft({ from: a.version, author: F, viewer: F });
  const r = w.wz.wizardRead({ script: a.script, viewer: A });
  assert.deepEqual([r.ok, r.version.id, r.offered, r.version.steps], [true, a.version, true, STEPS]);
  for (const k of ["author", "contributors", "approved", "revisions", "submitted", "derived_from", "ended", "proposals_adopted"]) assert.ok(k in r.version, k);
  assert.equal(r.version.submitted.by.id, "frank");
  assert.deepEqual(w.wz.wizardRead({ version: n2.version, viewer: A }).version.derived_from, { version: a.version });
  refused(w.wz.wizardRead({ script: a.script, viewer: D }), "NO_SUCH_WIZARD");
  refused(w.wz.wizardRead({ version: `${a.script}@7`, viewer: A }), "NO_SUCH_WIZARD");
  /* a script with only a draft: the latest */
  const d = draft(w, { name: "Only draft" });
  assert.equal(w.wz.wizardRead({ script: d.script, viewer: F }).version.state, "draft");
  /* a Civicsmith script, to every member */
  const c = w.wz.wizardRead({ script: LIBRARY[0].id, viewer: D });
  assert.deepEqual([c.version.id, c.version.approved.by.name, c.offered], [`${LIBRARY[0].id}@2`, "Bob", true]);
});

test("R11 wizardsAt answers the offered scripts whose start is the screen, each {id, version, name, steps, approver, finished}, plus the caller's own drafts marked draft: true; an unknown screen answers []; no AI credential and no key; writes nothing", () => {
  const w = seeded();
  const a = approved(w, { name: "On case home" });
  const other = approved(w, { name: "On filing", steps: [step("filing-draft", "filingsave"), step("case-home", "casenote")] });
  const mine = draft(w, { name: "Frank's draft" });
  const alices = draft(w, { who: "alice", name: "Alice's draft" });
  w.wz.wizardProgress({ script: a.script, version: a.version, event: "finish" });
  w.wz.wizardProgress({ script: a.script, version: a.version, event: "finish" });
  const at = w.wz.wizardsAt({ screen: "case-home", viewer: F });
  assert.equal(at.ok, true);
  const byId = Object.fromEntries(at.scripts.map((s) => [s.version, s]));
  assert.deepEqual(Object.keys(byId).sort(), [`${LIBRARY[0].id}@2`, a.version, mine.version].sort());
  assert.deepEqual(byId[a.version], { id: a.script, version: a.version, name: "On case home", steps: STEPS,
                                      approver: { id: "alice", name: "h_alice" }, finished: 2 });
  assert.deepEqual([byId[mine.version].draft, byId[mine.version].approver], [true, null]);
  assert.ok(!at.scripts.some((s) => s.version === alices.version), "another's draft is not offered");
  assert.ok(!at.scripts.some((s) => s.version === other.version), "a script starting elsewhere");
  assert.deepEqual(w.wz.wizardsAt({ screen: "filing-draft", viewer: F }).scripts.map((s) => s.version), [other.version]);
  assert.deepEqual(w.wz.wizardsAt({ screen: "nowhere", viewer: F }).scripts, []);
  assert.deepEqual(w.wz.wizardsAt({ screen: null, viewer: F }).scripts, []);
  /* a member who cannot see P sees the library's and none of P's */
  assert.deepEqual(w.wz.wizardsAt({ screen: "case-home", viewer: D }).scripts.map((s) => s.id), [LIBRARY[0].id]);
  /* no AI and no key: the op answers through the ops table from a member's session alone */
  const url = new URL("https://x/?op=wizardsat&screen=case-home&viewer=member%3Afrank");
  assert.deepEqual(wz.wizardScriptsOps(w.wz, url, null).wizardsat(), at);
  /* before registration every screen is unknown */
  const w2 = seeded({ register: false });
  assert.deepEqual(w2.wz.wizardsAt({ screen: "case-home", viewer: F }).scripts, []);
});

test("R17 submittedFor lists every (version, owner) pair for a submitted version and an owner who may approve it (a group-wide script's administrators), the sole author left out, {script, version, owner, name, author, submitted_at, project}, at most 500 per page with cursor and truncated", () => {
  const w = seeded();
  const s1 = draft(w, { name: "One" }); w.wz.wizardSubmit({ version: s1.version, author: F, viewer: F });
  w.clock.now = "2026-10-04T00:00:00Z";
  const s2 = draft(w, { who: "alice", name: "Two" }); w.wz.wizardSubmit({ version: s2.version, author: A, viewer: A });
  const r = w.wz.submittedFor({ viewer: MACHINE });
  const want = [
    { script: s1.script, version: 1, owner: "alice", name: "One", author: "frank", submitted_at: "2026-10-03T12:00:00Z", project: w.P },
    { script: s1.script, version: 1, owner: "bob", name: "One", author: "frank", submitted_at: "2026-10-03T12:00:00Z", project: w.P },
    { script: s2.script, version: 1, owner: "bob", name: "Two", author: "alice", submitted_at: "2026-10-04T00:00:00Z", project: w.P },
  ].sort((x, y) => (`${x.script}@1#${x.owner}` < `${y.script}@1#${y.owner}` ? -1 : 1));
  assert.deepEqual([r.ok, r.entries, r.truncated, r.cursor], [true, want, false, null]);
  /* paging */
  const p1 = w.wz.submittedFor({ limit: 2, viewer: MACHINE });
  assert.deepEqual([p1.entries, p1.truncated], [want.slice(0, 2), true]);
  const p2 = w.wz.submittedFor({ after: p1.cursor, limit: 2, viewer: MACHINE });
  assert.deepEqual([p2.entries, p2.truncated, p2.cursor], [want.slice(2), false, null]);
  assert.equal(w.wz.submittedFor({ limit: 9999, viewer: MACHINE }).limit, 500);
  /* approved, withdrawn and retired leave; a viewer who cannot see P sees none */
  assert.deepEqual(w.wz.submittedFor({ viewer: D }).entries, []);
  w.wz.wizardApprove({ version: s1.version, by: B, viewer: B });
  w.wz.wizardRetire({ version: s2.version, reason: "r", by: A, viewer: A });
  assert.deepEqual(w.wz.submittedFor({ viewer: MACHINE }).entries, []);
  /* a group-wide script's next version: the administrators */
  w.wz.wizardApprove({ version: s1.version, widen: true, by: E, viewer: E });
  const n2 = w.wz.wizardDraft({ from: s1.version, author: F, viewer: F });
  w.wz.wizardSubmit({ version: n2.version, author: F, viewer: F });
  assert.deepEqual(w.wz.submittedFor({ viewer: MACHINE }).entries.map((e) => [e.version, e.owner, e.project]), [[2, "erin", null]]);
});
