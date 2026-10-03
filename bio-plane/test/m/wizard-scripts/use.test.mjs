/* wizard-scripts: unattributed daily tallies of use and of refusals, and the candidates read from them (R15, R16), at the
   module's interface. */
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

test("R15 wizardProgress adds one to an unattributed tally per (version, event, step) and day: start, step (the step reached) or finish; no member, viewer, case, project or instant finer than the day is kept, nothing else of the call; wizardUse answers the tallies by version and day", () => {
  const w = seeded();
  const a = approved(w);
  const go = (event, step, x = {}) => w.wz.wizardProgress({ script: a.script, version: a.version, event, step, viewer: F, ...x });
  w.clock.now = "2026-10-03T08:15:42Z";
  assert.deepEqual(go("start"), { ok: true }, "nothing of the call is echoed");
  go("step", 1); go("step", 2); go("finish");
  go("start", null, { viewer: C }); go("step", 1, { viewer: C });
  w.clock.now = "2026-10-04T23:59:59Z";
  go("start", null, { viewer: E, case: "CASE-1" });
  const rows = w.rows(`SELECT * FROM wiz_tallies ORDER BY tid`);
  assert.deepEqual(Object.keys(rows[0]).sort(), ["day", "event", "step", "tid", "version_id"], "a tally row holds its key and its day, nothing else");
  for (const r of rows) assert.match(r.day, /^\d{4}-\d{2}-\d{2}$/);
  const all = JSON.stringify(w.snapshot().wiz_tallies);
  for (const leak of ["frank", "carol", "erin", "member:", w.P, "CASE-1", "08:15", "23:59"]) assert.ok(!all.includes(leak), leak);
  const u = w.wz.wizardUse({ script: a.script, viewer: A });
  assert.deepEqual(u.use, [
    { version: a.version, day: "2026-10-03", start: 2, finish: 1, steps: { 1: 2, 2: 1 } },
    { version: a.version, day: "2026-10-04", start: 1, finish: 0, steps: {} }]);
  /* the author reads their own version's; a member who is neither is refused; one who cannot see is told it is absent */
  assert.deepEqual(w.wz.wizardUse({ script: a.script, viewer: F }).use, u.use, "the version's author");
  refused(w.wz.wizardUse({ script: a.script, viewer: C }), "WIZARD_USE_REFUSED");
  refused(w.wz.wizardUse({ script: a.script, viewer: D }), "NO_SUCH_WIZARD");
  /* a Civicsmith script's use is read by administrators */
  w.wz.wizardProgress({ script: LIBRARY[0].id, version: `${LIBRARY[0].id}@2`, event: "start" });
  assert.equal(w.wz.wizardUse({ script: LIBRARY[0].id, viewer: E }).use[0].start, 1);
  refused(w.wz.wizardUse({ script: LIBRARY[0].id, viewer: A }), "WIZARD_USE_REFUSED");
  /* an author's own draft run counts, under its own version */
  const d = draft(w, { name: "Mine" });
  assert.equal(w.wz.wizardProgress({ script: d.script, version: d.version, event: "start", viewer: F }).ok, true);
});

test("R15 there is no abandon event: any event but start, step or finish is WIZARD_PROGRESS_REFUSED, as is a step outside the script; an unknown or unseen script is NO_SUCH_WIZARD; nothing is counted", () => {
  const w = seeded();
  const a = approved(w);
  const go = (x) => w.wz.wizardProgress({ script: a.script, version: a.version, viewer: F, ...x });
  for (const event of ["abandon", "stop", "cancel", "", null, "START"]) refused(go({ event }), "WIZARD_PROGRESS_REFUSED", String(event));
  for (const step of [0, 3, 1.5, "x", null]) refused(go({ event: "step", step }), "WIZARD_PROGRESS_REFUSED", String(step));
  refused(go({ event: "start", step: 1 }), "WIZARD_PROGRESS_REFUSED", "only a step names a step");
  refused(go({ script: "WIZ-2026-0000", version: "WIZ-2026-0000@1", event: "start" }), "NO_SUCH_WIZARD");
  refused(go({ version: `${a.script}@9`, event: "start" }), "NO_SUCH_WIZARD");
  refused(go({ viewer: D, event: "start" }), "NO_SUCH_WIZARD", "a viewer who cannot see P");
  assert.equal(w.count("wiz_tallies"), 0);
  assert.deepEqual(wz.WIZARD_EVENTS, ["start", "step", "finish"]);
  assert.equal(go({ event: "step", step: "2" }).ok, true, "a step reached, as the query carries it");
});

test("R16 tallyRefusal adds one to an unattributed tally per (op, code) and day and keeps nothing else; wizardCandidates answers, to project owners and administrators, the steps where offered scripts' counts drop most and the (op, code) pairs most refused, never a member, case, target or project", () => {
  const w = seeded();
  const a = approved(w);
  for (let i = 0; i < 3; i++) w.wz.tallyRefusal("filingapprove", "NOT_AN_APPROVER");
  w.wz.tallyRefusal("casenote", "NO_SUCH_BUNDLE");
  assert.deepEqual(w.wz.tallyRefusal("bad op!", "X"), { ok: false });
  assert.deepEqual(Object.keys(w.rows(`SELECT * FROM wiz_refusal_tallies`)[0]).sort(), ["code", "day", "op", "tid"]);
  const go = (event, step) => w.wz.wizardProgress({ script: a.script, version: a.version, event, step });
  for (let i = 0; i < 10; i++) go("start");
  for (let i = 0; i < 9; i++) go("step", 1);
  for (let i = 0; i < 3; i++) go("step", 2);
  for (let i = 0; i < 2; i++) go("finish");
  const c = w.wz.wizardCandidates({ viewer: A });
  assert.deepEqual(c.drops.map((x) => [x.version, x.step, x.screen, x.act, x.reached, x.next, x.drop]), [
    [a.version, 1, "case-home", "casenote", 9, 3, 6], [a.version, 0, "case-home", "casenote", 10, 9, 1], [a.version, 2, "filing-draft", "filingsave", 3, 2, 1]]);
  assert.deepEqual(c.refused, [{ op: "filingapprove", code: "NOT_AN_APPROVER", count: 3 }, { op: "casenote", code: "NO_SUCH_BUNDLE", count: 1 }]);
  const text = JSON.stringify(c);
  for (const leak of ["frank", "alice", w.P, "member:"]) assert.ok(!text.includes(leak), leak);
  assert.equal(w.wz.wizardCandidates({ viewer: E }).ok, true, "an administrator");
  refused(w.wz.wizardCandidates({ viewer: F }), "WIZARD_USE_REFUSED", "frank owns no project");
  refused(w.wz.wizardCandidates({ viewer: MACHINE }), "WIZARD_USE_REFUSED");
  /* at most 20 of each */
  for (let i = 0; i < 25; i++) w.wz.tallyRefusal(`op${i}`, "CODE");
  assert.equal(w.wz.wizardCandidates({ viewer: A }).refused.length, 20);
});
