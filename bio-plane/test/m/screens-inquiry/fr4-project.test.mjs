/* screens-inquiry fix round 3 (T51), the `project` screen, the fourth wave: C35 (R16, R1: "Draw on a question from elsewhere" names each question's
 * project), C63 (R1, R36: "Plan what to do" opens the plan it made, over the op's real answer), C81 (R5: the page at 390 px, measured in Chromium)
 * and K4370 (R1; interface-shell R113: every act declares the reads it changes). On interface-shell's served page over a scripted plane; every
 * expectation is a word read by key (R44), never copied. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, press, fill, says, word, section, projectWith, SCREENS, P, Q, Q2 } from "./fixtures.mjs";
import { onPhone } from "./phone.mjs";

const at = "/app/project/" + P;
const PROJECT = SCREENS.find((s) => s.id === "project");
const options = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]);

/* ------------------------------------------------------------------------------------------------------------------ C35 */

const P2 = "PROJ-2026-0012", P3 = "PROJ-2026-0013";
const QA = "INQ-2026-0050-days", QB = "INQ-2026-0060-days", QC = "INQ-2026-0061-unique", QO = "INQ-2026-0200-orphan";
const SAME = "How many days passed between the report and the repair?";
/* `list`'s rows as retrieval R63 answers them: no project on a row; `projectlist`'s as project-roster R26 (`id`, `name`, `question_count`);
   `projectquestions`' as basis-versions R50 (`items: [{inquiry, title}]`) */
const row = (id, title) => ({ bundle_id: id, object_type: "inquiry", current_state: "open", title, last_updated: "2026-10-05T09:00:00Z" });
const ELSEWHERE = {
  list: ok({ bundles: [row(Q, "Is the city repairing reported potholes within seven days?"), row(Q2, "Does closed mean repaired?"), row(QA, SAME), row(QB, SAME), row(QA, SAME), row(QC, "A title only one has"), row(QO, "Nobody draws on this")] }),
  projectlist: ok({ ok: true, projects: [{ id: P, name: "Pothole repairs", question_count: 2 }, { id: P2, name: "Bridge repairs", question_count: 1 }, { id: P3, name: "Culvert repairs", question_count: 2 }, { id: "PROJ-2026-0014", name: "Empty one", question_count: 0 }] }),
  projectquestions: (r) => ok(r.query.project === P2 ? { ok: true, project: P2, items: [{ inquiry: QA, title: SAME }], cursor: null }
    : r.query.project === P3 ? { ok: true, project: P3, items: [{ inquiry: QB, title: SAME }, { inquiry: QC, title: "A title only one has" }], cursor: null }
    : r.query.project === P ? { ok: true, project: P, items: [{ inquiry: Q, title: "Is the city repairing reported potholes within seven days?" }, { inquiry: Q2, title: "Does closed mean repaired?" }], cursor: null }
    : { ok: true, project: r.query.project, items: [], cursor: null }),
};

test("R16 R1 C35 'Draw on a question from elsewhere': two questions of two projects with the same title are told apart, each option naming its project (`screen.document.cite.option`); one option per question id; control: a question whose title is its own, and one no project draws on, are the title alone", async () => {
  /* fix round 4 (C14; R16, R1): a project is named where the project is known: a list row's `project`, else, for the questions that share a title, their own `image`'s;
     no `projectquestions` is read for any project but this one's. The two same-titled questions' images state their projects. */
  const images = { [QA]: { "bundle.md": `---\nid: ${QA}\nproject: ${P2}\n---\n` }, [QB]: { "bundle.md": `---\nid: ${QB}\nproject: ${P3}\n---\n` } };
  const p = await open(at, { images, plane: ELSEWHERE });
  const opts = options(p, "project-draw-question");
  const text = (id) => (opts.find(([v]) => v === id) || [])[1];
  assert.deepEqual(opts.map(([v]) => v), [QA, QB, QC, QO], "one option per question id (QA is listed twice and drawn once), the project's own two left out");
  assert.equal(text(QA), word("screen.document.cite.option", { question: SAME, project: "Bridge repairs" }), "the first, in its project");
  assert.equal(text(QB), word("screen.document.cite.option", { question: SAME, project: "Culvert repairs" }), "the second of the same title, in its own");
  assert.notEqual(text(QA), text(QB), "told apart");
  assert.equal(text(QC), "A title only one has", "control: a title that is its own needs no project to tell it apart");
  assert.equal(text(QO), "Nobody draws on this", "control: no project of hers draws on it, its title alone");
  /* the reads: this project's questions once; no other project's; the image of each question that shares a title and no other */
  assert.deepEqual(p.byOp("projectquestions").map((r) => r.query.project), [P], "no other project's questions are read");
  assert.deepEqual(p.byOp("image").map((r) => r.query.id).filter((x) => x === QA || x === QB || x === QC || x === QO).sort(), [QA, QB], "an image only for the two that share a title");
  /* sending the choice of the second still sends its id and her note */
  const d = await open(at, { images, plane: { ...ELSEWHERE, drawquestion: (r) => ok({ ok: true, cited: [r.query.inquiry], alreadyCited: [] }) } });
  fill(d, { "project-draw-question": QB, "project-draw-note": "the same crews" });
  await press(d, "drawquestion");
  assert.deepEqual([d.byOp("drawquestion")[0].query.project, d.byOp("drawquestion")[0].query.inquiry], [P, QB]);
});

/* ------------------------------------------------------------------------------------------------------------------ C63 */

/* planopen's answer as action-plans R1 gives it: `{ok, id, project, title, state, opened_by, at, subjects}`, the id `<PLN-year-n>-plan` (doc.mjs `planId`) */
const OPENED = (title) => ({ ok: true, id: "PLN-2026-0003-plan", project: P, title, state: "open", opened_by: "mai", at: "2026-10-10T09:00:00Z",
  subjects: [{ subject: { kind: "inquiry", inquiry: Q }, support: null }] });
/* A stand-in for screens-action's `plan` screen (a later module this one may not import, P4): it only reads the plan
   its address names, which is all these tests ask of it (the plan page opened, and that plan read). */
const PLAN_SCREEN = Object.freeze({ id: "plan", reads: (view) => ({ plan: { op: "plan", query: { id: String(view.subject || "") }, subject: true } }),
  render: () => "", acts: [], words: [] });
const WITH_PLAN_SCREEN = { screens: [...SCREENS, PLAN_SCREEN] };

test("R1 R36 C63 'Plan what to do' on the project page opens the plan page it made, over the op's real answer and the real `plan` screen; control: a project that has a plan opens another with the same press, and links its plan by name; a refusal opens none", async () => {
  const p = await open(at, { boot: WITH_PLAN_SCREEN, plane: { planopen: (r) => ok(OPENED(r.body.title)), plan: ok({ ok: true, id: "PLN-2026-0003-plan", project: P, title: "Ask the committee", state: "open", subjects: [], options: [] }) } });
  fill(p, { "project-plan": "Ask the committee", "project-plan-about": Q });
  await press(p, "planopen");
  assert.deepEqual(p.byOp("planopen")[0].body, { project: P, title: "Ask the committee", subjects: [{ kind: "inquiry", inquiry: Q }] });
  assert.equal(p.location.pathname, "/app/plan/PLN-2026-0003-plan", "the plan page opens with the plan as subject");
  assert.equal(p.byOp("plan")[0].query.id, "PLN-2026-0003-plan", "and it reads that plan");
  /* control: the project has one plan already (`plansFor`'s items): it is linked by name, and the press opens the new one */
  const had = await open(at, { boot: WITH_PLAN_SCREEN, plane: { plans: ok({ ok: true, items: [{ id: "PLN-2026-0001-plan", project: P, title: "Earlier plan", state: "open" }], truncated: false, cursor: null, limit: 200 }),
    planopen: (r) => ok(OPENED(r.body.title)) } });
  assert.equal(section(had, "project.work.title").querySelector('a.cs-ref[href="/app/plan/PLN-2026-0001-plan"]').textContent, "Earlier plan", "the plan she has is a link to it");
  fill(had, { "project-plan": "Ask the committee", "project-plan-about": Q });
  await press(had, "planopen");
  assert.equal(had.location.pathname, "/app/plan/PLN-2026-0003-plan");
  /* control: a refused press stays */
  const r = await open(at, { boot: WITH_PLAN_SCREEN, plane: { planopen: refusedIn("PLAN_NO_TITLE", "no") } });
  fill(r, { "project-plan": "x", "project-plan-about": Q });
  await press(r, "planopen");
  assert.equal(r.location.pathname, at);
});

/* ------------------------------------------------------------------------------------------------------------------ C81 */

const LONG = "a-very-long-member-handle-without-any-breaks-at-all";
const PEOPLE = [{ handle: "mai", state: "joined", owner: 1, owner_since: "2026-10-01T09:00:00Z" }, { handle: "dev", state: "joined", owner: 1 }, { handle: LONG + "1", state: "joined", owner: 1 },
  { handle: LONG + "2", state: "joined", owner: 1 }, { handle: "rosa", state: "joined", owner: 0, joined_at: "2026-10-02T00:00:00Z" }, { handle: "ben", state: "joined", owner: 0 },
  { handle: LONG + "3", state: "joined", owner: 0 }, { handle: "ana", state: "invited", owner: 0 }];
const TITLE = "A project with a very long title that goes on and on about potholes, repairs and the city of Oakland";
const LONGMD = projectWith([[Q, "cites", "active"], [Q2, "cites", "confirmed"]]).replace('title: "Pothole repairs"', `title: "${TITLE}"`);
const NOTICE = { notice: "N1", status: "open", revisions: [{ published_at: "2026-10-01T09:00:00Z", json: { wording: "We are looking at pothole repairs " + LONG, since: "2026-09-01", collaborate: true } }],
  level: { level: "Active", as_of: "2026-10-10T00:00:00Z" }, next_monthly: "2026-11-01T00:00:00Z", attestations: [{ json: { cases: [1, 2] } }] };
const VOTES = [{ change: "remove", target: "dev", proposed_by: "rosa", proposed_at: "2026-10-09T09:00:00Z", agreed: ["rosa"], awaiting: ["mai"] },
  { change: "add", target: "ben", proposed_by: "dev", proposed_at: "2026-10-09T09:00:00Z", agreed: ["dev"], awaiting: ["mai"] }];
const RERUN = { case: "A case", edition: 1, group: "Team", lens_difference: { only_source: [{ kind: "k", subject: "s", text: "t " + LONG }], only_own: [], shared: 1 },
  findings: [{ finding: "F1 " + LONG, ref: "r1", source: { pair: { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "C" } } }, pairings: [] }] };
const BUSY = { images: { [P]: { "bundle.md": LONGMD } }, plane: {
  projectparticipants: ok({ ok: true, projectId: P, participants: PEOPLE }),
  projectquestions: ok({ ok: true, project: P, items: [{ inquiry: Q, title: "Is the city repairing reported potholes within seven days of the report, and recording it?" }, { inquiry: Q2, title: "Does closed mean repaired " + LONG }], cursor: null }),
  projectownervotes: ok({ ok: true, projectId: P, changes: VOTES }),
  memberlist: ok({ ok: true, members: PEOPLE.map((x) => ({ member_id: x.handle, handle: x.handle })) }),
  notices: ok({ ok: true, notices: [NOTICE] }),
  rerunread: ok({ ok: true, reruns: [RERUN] }),
  projectownerarith: ok({ ok: true, table: [1, 2, 3, 4, 5].map((n) => ({ owners: n, votesNeeded: Math.floor(n / 2) + 1, eligibleVoters: n - 1 })),
    live: { owners: 4, votesNeeded: 3, eligibleVoters: 3, possible: true, targetMayVote: false }, projectId: P }),
  ...ELSEWHERE } };
const ACTS = ["act.planopen.label.project", "act.projectowneradd.label.project", "act.projectownerremove.label.project", "act.projectremove.label.project", "act.projectinvite.label.project",
  "act.projectbarset.label.project", "act.promote.label.project", "act.findin.label.project", "act.drawquestion.label.project", "act.heldcaptures.label.project", "act.projectvisibilityset.label.project",
  "screen.project.notice.change", "act.projectleave.label.project"].map((k) => word(k));
/* the shared stylesheet's inline references (`a.cs-ref` in a row's text span) are measured by interface-shell, not here */
const notRef = (s) => !s.startsWith("a.cs-ref");

test("R5 C81 the project page at 390 px: nothing past the screen and every button and summary at least 44 px, with a long title, long member names, many owners, a pending vote, the published notice, the vote to stand down and the rerun's comparison; control: at 1280 px nothing is past the viewport and the controls of the rows not touched keep their place", async () => {
  const phone = async (before) => onPhone({ path: at, o: BUSY, width: 390, controls: ACTS, before });
  const base = await phone();
  assert.ok(base.mainScroll <= 390, "the main area does not scroll sideways: " + base.mainScroll);
  assert.deepEqual(base.over, [], "nothing runs past the screen");
  assert.deepEqual(base.small.filter(notRef), [], "every button and summary is at least 44 px");
  for (let k = 0; k < ACTS.length; k++) assert.ok(base.boxes[ACTS[k]].length > 0, ACTS[k] + " is drawn and measured");
  for (const k of [1, 2, 3, 5]) for (const b of base.boxes[ACTS[k]]) assert.ok(b.right <= 390 && b.left >= 0 && b.width >= 44 && b.height >= 44, ACTS[k] + " " + JSON.stringify(b));
  /* the vote to stand down, opened in place; the comparison with the original */
  const stand = await phone(async (page) => { await page.click('button[data-handle="mai"][data-act="projectownerremove"]'); });
  assert.ok(stand.mainScroll <= 390 && stand.over.length === 0 && stand.small.filter(notRef).length === 0, "the vote: " + JSON.stringify(stand));
  const cmp = await phone(async (page) => { await page.click('button[data-act="rerunread"]'); });
  assert.ok(cmp.mainScroll <= 390 && cmp.over.length === 0 && cmp.small.filter(notRef).length === 0, "the comparison: " + JSON.stringify(cmp));
  /* control: the desktop page keeps everything inside the viewport, and the controls whose rows were not touched are where they were (their left edge and height) */
  const wide = await onPhone({ path: at, o: BUSY, width: 1280, controls: [word("act.planopen.label.project"), word("act.projectinvite.label.project"), word("act.projectbarset.label.project")] });
  assert.deepEqual(wide.over, [], "at 1280 nothing is past the viewport");
  assert.deepEqual([wide.boxes[word("act.planopen.label.project")], wide.boxes[word("act.projectinvite.label.project")], wide.boxes[word("act.projectbarset.label.project")]].map((b) => [b[0].left, b[0].height]),
    [[208, 40], [208, 40], [208, 40]], "plan, invite and bar keep their left edge and height");
});

/* ------------------------------------------------------------------------------------------------------------------ K4370 */

test("R1 R113 every act of the project declares the reads it changes (names in the screen's reads, or 'all'); a sample act re-reads exactly those; control: a refused act re-reads nothing", async () => {
  const names = Object.keys(PROJECT.reads({ subject: P, me: { member: "mai", handle: "mai" } }));
  assert.ok(names.includes("bar") && names.includes("participants") && names.includes("directory"));
  for (const a of PROJECT.acts) {
    assert.ok(a.rereads === "all" || (Array.isArray(a.rereads) && a.rereads.every((n) => names.includes(n))), a.op + " declares rereads: " + JSON.stringify(a.rereads));
  }
  const specs = PROJECT.reads({ subject: P, me: { member: "mai", handle: "mai" } });
  const ops = [...new Set(Object.values(specs).map((s) => s.op))];
  const counts = (p) => Object.fromEntries(ops.map((o) => [o, p.byOp(o).length]));
  const p = await open(at, { plane: { projectbarset: ok({ ok: true }) } });
  const before = counts(p);
  await press(p, "projectbarset", { reason: "the bar" });
  const after = counts(p);
  const grew = ops.filter((o) => after[o] > before[o]);
  assert.deepEqual(grew, [specs.bar.op], "exactly the declared read is repeated");
  assert.equal(p.byOp("projectbarset").length, 1);
  /* control: a refused act re-reads nothing */
  const r = await open(at, { plane: { projectbarset: refusedIn("NOT_PERMITTED", "no") } });
  const b0 = counts(r);
  await press(r, "projectbarset", { reason: "the bar" });
  assert.equal(r.byOp("projectbarset").length, 1, "it was sent");
  assert.deepEqual(counts(r), b0, "and nothing was read again");
});

/* ---- C63 on the question page (re-walk B E42, E46 pressed it there) ---- */
test("R2 R36 C63 'Plan what to do' on the question page opens the plan page it made; control: a refused press stays on the question", async () => {
  const qat = "/app/question/" + Q;
  const plane = { planopen: (r) => ok(OPENED(r.body.title)), plan: ok({ ok: true, id: "PLN-2026-0003-plan", project: P, title: "Ask the committee", state: "open", subjects: [], options: [] }) };
  const p = await open(qat, { boot: WITH_PLAN_SCREEN, plane });
  fill(p, { "question-plan": "Ask the committee" });
  await press(p, "planopen");
  assert.equal(p.location.pathname, "/app/plan/PLN-2026-0003-plan", "the plan page opens");
  const r = await open(qat, { boot: WITH_PLAN_SCREEN, plane: { planopen: refusedIn("PLAN_NO_TITLE", "no") } });
  fill(r, { "question-plan": "x" });
  await press(r, "planopen");
  assert.equal(r.location.pathname, qat, "control: a refused press stays");
});
