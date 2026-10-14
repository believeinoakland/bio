/* screens-inquiry R1, R8–R11, R14, R16: the project screen, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn, MEMBER } from "../interface-shell/harness.mjs";
import { NEEDS } from "../../../src/op-declarations/index.mjs";
import { open, main, actsIn, button, fill, press, rawKeys, plane, SCREENS, P, Q, Q2 } from "./fixtures.mjs";

const PROJECT = SCREENS.find((s) => s.id === "project");
const at = () => "/app/project/" + P;
const section = (p, head) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === head);
const options = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]);
/* a member who has joined and is no owner: mai (the harness's member) */
const OWNERLESS = { projectparticipants: ok({ ok: true, projectId: P, participants: [{ handle: "dev", state: "joined", owner: true }, { handle: "mai", state: "joined", owner: false }] }) };

test("R1 R9 reads: the project, its stage, participants, bar, its questions by projectquestions, the questions she may see, account state and the directory", async () => {
  const p = await open(at());
  const q = (op) => p.byOp(op)[0] && p.byOp(op)[0].query;
  assert.equal(q("image").id, P);
  assert.equal(q("projectstage").project, P);
  assert.equal(q("projectparticipants").projectId, P);
  assert.equal(q("strengthbarof").project, P);
  assert.deepEqual([q("projectquestions").project, q("projectquestions").limit, q("projectquestions").after], [P, "100", undefined]);
  assert.deepEqual([q("list").type, q("list").limit], ["inquiry", "500"]);
  assert.equal(q("projectaccountstate").project, P);
  assert.ok(p.byOp("projectdirectory").length === 1);
  /* the path's project step: the title as read */
  assert.match(p.root().querySelector(".cs-crumbs").textContent, /Projects.*Pothole repairs/);
});

test("R1 the project drawn: title, objective, stage, its questions with their strength, account, members, and the acts a joined member is offered", async () => {
  const p = await open(at());
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Pothole repairs");
  assert.match(m.textContent, /as its own policy requires/);
  assert.equal(m.querySelector('[data-ladder="stage"] [aria-current="step"]').textContent, "Investigating");
  const rows = section(p, "Questions").querySelectorAll(".cs-row");
  assert.deepEqual(rows[0].querySelectorAll(".cs-grade").map((g) => g.textContent.slice(-1)), ["B", "C"]);
  assert.equal(rows[1].querySelectorAll('.cs-gap[data-gap="unrated"]').length, 2);
  assert.match(m.textContent, /No project account: each member's own account/);
  assert.match(m.textContent, /dev \(owner\).*ana \(invited\)/s);
  assert.deepEqual(actsIn(m).sort(), ["drawquestion", "findin", "planopen", "projectbarset", "projectinvite", "promote"]);
  assert.ok(!actsIn(m).includes("strengthbarset"), "the group's bar is never set from a project (R10)");
  await p.settle();
  assert.equal(p.byOp("inquirystrength").length, 2, "each strength read once, not at every redraw");
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R9 the project's questions are projectquestions' items, each a reference opening question with its strength, paged to the end by the cursor", async () => {
  const pages = { "": { ok: true, project: P, items: [{ inquiry: Q, title: "Seven days?" }], cursor: Q },
                  [Q]: { ok: true, project: P, items: [], cursor: "INQ-2026-0005-x" },
                  "INQ-2026-0005-x": { ok: true, project: P, items: [{ inquiry: Q2, title: "Closed?" }], cursor: null } };
  const p = await open(at(), { plane: { projectquestions: (r) => ok(pages[r.query.after || ""]) } });
  const refs = section(p, "Questions").querySelectorAll('a.cs-ref[href^="/app/question/"]');
  assert.deepEqual(refs.map((a) => [a.getAttribute("href"), a.textContent]), [["/app/question/" + Q, "Seven days?"], ["/app/question/" + Q2, "Closed?"]],
    "a page fewer than the limit, even empty, is paged on while a cursor follows");
  assert.deepEqual(p.byOp("projectquestions").map((r) => r.query.after), [undefined, Q, "INQ-2026-0005-x"]);
  assert.deepEqual(p.byOp("inquirystrength").map((r) => r.query.id).sort(), [Q, Q2].sort());
  /* the project's own document's references are not read for questions any more: a cited inquiry projectquestions does
     not answer is not drawn */
  assert.ok(!section(p, "Questions").querySelector('a[href$="INQ-2026-0003-gone"]'));
  /* controls: none answered says so; a later page refused is drawn failed beside what was read, never as the end */
  const none = await open(at(), { plane: { projectquestions: ok({ ok: true, project: P, items: [], cursor: null }) } });
  assert.match(section(none, "Questions").textContent, /No questions yet/);
  const broke = await open(at(), { plane: { projectquestions: (r) => (r.query.after ? refusedIn("SOME_REFUSAL", "Could not read.") : ok(pages[""])) } });
  const s = section(broke, "Questions");
  assert.equal(s.querySelectorAll('a.cs-ref[href^="/app/question/"]').length, 1);
  assert.ok(s.querySelector('[data-state="failed"]'));
});

test("R10 the project's own bar as strengthbarof answers it: a declared axis by its letter, an undeclared one in words, no bar as absent", async () => {
  const bar = (b) => ok({ ok: true, project: P, bar: b });
  const both = await open(at(), { plane: { strengthbarof: bar({ declared: true, source: "project", capture: "B", connection: "B" }) } });
  const s = section(both, "The project's bar");
  assert.deepEqual(s.querySelectorAll("p .cs-grade").map((g) => [g.getAttribute("data-scale"), g.textContent.slice(-1)]), [["capture", "B"], ["connection", "B"]]);
  const one = await open(at(), { plane: { strengthbarof: bar({ declared: true, source: "project", capture: "B", connection: null }) } });
  const s1 = section(one, "The project's bar");
  assert.deepEqual(s1.querySelectorAll("p .cs-grade").map((g) => g.getAttribute("data-scale")), ["capture"]);
  assert.match(s1.querySelector('[data-axis-none="connection"]').textContent, /No bar is set on the Connection axis/);
  const none = await open(at(), { plane: { strengthbarof: bar({ declared: false, source: "none", capture: null, connection: null }) } });
  const s0 = section(none, "The project's bar");
  assert.equal(s0.querySelectorAll("p .cs-grade").length, 0, "no bar is never drawn as a grade");
  assert.ok(s0.querySelector('.cs-gap[data-gap="unrated"]'));
  assert.match(s0.textContent, /This project has set no bar of its own/);
  assert.ok(!/\b0\b|zero/i.test(s0.textContent), "never as zero");
});

test("R10 R16 Set this project's bar sends projectbarset with both axes, either or neither, and her reason; never strengthbarset", async () => {
  const p = await open(at(), { plane: { ...OWNERLESS, projectbarset: ok({ ok: true }) } });
  assert.equal(p.root().querySelector('button[data-act="projectbarset"]').textContent.includes("Set this project's bar"), true, "by its registry label");
  fill(p, { "project-bar-capture": "A", "project-bar-connection": "C" });
  await press(p, "projectbarset", { reason: "the council meets on it" });
  fill(p, { "project-bar-capture": "B", "project-bar-connection": "" });
  await press(p, "projectbarset", { reason: "connection is not ours to say" });
  fill(p, { "project-bar-capture": "", "project-bar-connection": "" });
  await press(p, "projectbarset", { reason: "we withdraw it" });
  assert.deepEqual(p.byOp("projectbarset").map((r) => r.body), [
    { project: P, capture: "A", connection: "C", reason: "the council meets on it" },
    { project: P, capture: "B", reason: "connection is not ours to say" },
    { project: P, reason: "we withdraw it" }]);
  assert.equal(p.byOp("strengthbarset").length + p.byOp("strengthbar").length, 0);
  assert.ok(p.byOp("strengthbarof").length >= 4, "the bar is read again after each");
  /* controls: no reason, nothing sent; a member not joined (invited) is offered no bar act */
  const q = await open(at(), { plane: OWNERLESS });
  await press(q, "projectbarset", { reason: "" });
  assert.equal(q.byOp("projectbarset").length, 0);
  const ana = await open(at(), { boot: { plane: { ...plane(), whoami: ok({ ...MEMBER, member: "ana", handle: "ana" }) } } });
  assert.ok(!actsIn(main(ana)).includes("projectbarset"));
});

/* promotion's own reading of a file (its PROMOTED_FILE_CONTENT_UNSTATED rule): each file's words in `text`, never `content` */
const PROMOTION = (r) => ((r.body.files || []).every((f) => typeof f.text === "string")
  ? ok({ ok: true, bundleId: r.body.bundleId }) : refusedIn("PROMOTED_FILE_CONTENT_UNSTATED", "A file in this change states no content."));

test("R11 Open a question writes the inquiry, then draws it into the project (drawquestion), then opens it", async () => {
  const p = await open(at(), { plane: { allocid: ok({ ok: true, id: "INQ-2026-0010" }), promote: PROMOTION,
    drawquestion: (r) => ok({ ok: true, cited: [r.query.inquiry], alreadyCited: [] }) } });
  fill(p, { "project-question": "Did the 2026 report count working days?" });
  await press(p, "promote");
  const alloc = p.byOp("allocid")[0], prom = p.byOp("promote")[0], draw = p.byOp("drawquestion")[0];
  assert.equal(alloc.query.prefix, "INQ");
  assert.match(alloc.query.year, /^\d{4}$/);
  const id = "INQ-2026-0010-did-the-2026-report-count-working-days";
  assert.equal(prom.body.bundleId, id);
  assert.equal(prom.body.base, null);
  assert.equal(prom.body.meta.object_type, "inquiry");
  assert.equal(prom.body.files[0].path, "bundle.md");
  /* K3145: the file's words in `text`, as promotion reads them, so the promotion lands */
  assert.deepEqual(Object.keys(prom.body.files[0]).sort(), ["path", "text"]);
  const text = prom.body.files[0].text;
  assert.match(text, new RegExp(`^id: ${id}$`, "m"));
  assert.match(text, new RegExp(`^project: ${P}$`, "m"));
  assert.match(text, /^current_state: open$/m);
  assert.match(text, /## Question\n\nDid the 2026 report count working days\?\n/);
  for (const head of ["## What It Rests On", "## Conclusion", "## What Would Falsify This", "## Session Log", "## Review Notes"]) assert.ok(text.includes(head));
  assert.ok(!("author" in prom.body) && !("by" in prom.body), "the door stamps the author");
  assert.deepEqual([draw.query.project, draw.query.inquiry, draw.query.note], [P, id, ""], "the new question drawn into this project");
  assert.ok(p.requests.indexOf(draw) > p.requests.indexOf(prom), "after the write");
  assert.equal(p.location.pathname, "/app/question/" + id);
});

test("R11 controls: an empty question sends nothing; a refused write draws nothing more; a refused draw is said beside the act, the question open on its own screen", async () => {
  const p = await open(at(), { plane: { allocid: ok({ ok: true, id: "INQ-2026-0011" }),
    promote: refusedIn("NOT_THE_OWNER", "Only a member who joined this project can open a question in it.") } });
  const slot = await press(p, "promote");
  assert.match(slot.textContent, /Ask the question first/);
  assert.equal(p.byOp("allocid").length + p.byOp("promote").length, 0);
  fill(p, { "project-question": "A question" });
  await press(p, "promote");
  assert.match(main(p).querySelector('[data-refusal="promote"]').textContent, /Only a member who joined/);
  assert.equal(p.byOp("drawquestion").length, 0, "nothing drawn after a refused write");
  assert.equal(p.location.pathname, at());
  assert.equal(p.doc.getElementById("project-question").value, "A question", "the form keeps what was typed");

  const d = await open(at(), { plane: { allocid: ok({ ok: true, id: "INQ-2026-0012" }), promote: ok({ ok: true }),
    drawquestion: refusedIn("SEVERED_EDGE", "The project once removed this question; reinstate it instead.") } });
  fill(d, { "project-question": "Who inspects?" });
  await press(d, "promote");
  assert.equal(d.location.pathname, at(), "the project screen stays");
  const said = main(d).querySelector('[data-refusal="drawquestion"]');
  assert.match(said.textContent, /stays open on its own screen.*reinstate it instead/s);
  assert.equal(said.querySelector("a.cs-ref").getAttribute("href"), "/app/question/INQ-2026-0012-who-inspects");
  assert.ok(main(d).querySelector('button[data-act="promote"]'), "the act stays");
});

test("R16 R8 Draw on a question from elsewhere: a choice among the questions she may see, as record data, sending drawquestion with her note", async () => {
  const p = await open(at(), { plane: { drawquestion: (r) => ok({ ok: true, cited: [r.query.inquiry], alreadyCited: [] }) } });
  const b = button(p, "drawquestion");
  assert.match(b.textContent, /Draw on a question from elsewhere/);
  /* the project's own questions are not offered again; the titles drawn as data */
  assert.deepEqual(options(p, "project-draw-question"), [["INQ-2026-0003-gone", "Severed"], ["INQ-2026-0099-other", "Another project's"]]);
  fill(p, { "project-draw-question": "INQ-2026-0099-other", "project-draw-note": "the same crews" });
  await press(p, "drawquestion");
  const q = p.byOp("drawquestion")[0].query;
  assert.deepEqual([q.project, q.inquiry, q.note], [P, "INQ-2026-0099-other", "the same crews"]);
  assert.match(main(p).querySelector('[data-said="drawquestion"]').textContent, /now draws on that question/);
  assert.ok(p.byOp("projectquestions").length >= 2, "the project's questions read again");
  /* the project already draws on it: said so */
  const a = await open(at(), { plane: { drawquestion: (r) => ok({ ok: true, cited: [], alreadyCited: [r.query.inquiry] }) } });
  fill(a, { "project-draw-note": "why not" });
  await press(a, "drawquestion");
  assert.match(main(a).querySelector('[data-said="drawquestion"]').textContent, /already draws on that question/);
  /* controls: no note, nothing sent; a title shaped like a word key is drawn as itself, never as a word */
  const n = await open(at());
  fill(n, { "project-draw-note": "" });
  assert.match((await press(n, "drawquestion")).textContent, /Choose a question and say why/);
  assert.equal(n.byOp("drawquestion").length, 0);
  const k = await open(at(), { plane: { list: ok({ bundles: [{ bundle_id: "INQ-2026-0100-k", title: "act.promote.does" }] }) } });
  assert.deepEqual(options(k, "project-draw-question"), [["INQ-2026-0100-k", "act.promote.does"]]);
});

test("R8 the plan's question is a choice among the project's questions as record data", async () => {
  const p = await open(at(), { plane: { projectquestions: ok({ ok: true, project: P, items: [{ inquiry: Q, title: "screen.project.name" }], cursor: null }) } });
  assert.deepEqual(options(p, "project-plan-about"), [[Q, "screen.project.name"]], "a title is drawn as data, not read as a key");
});

test("R14 the project links AI for this project to its projectai screen", async () => {
  const p = await open(at());
  const a = section(p, "What pays for the assistant here").querySelector(`a[href="/app/projectai/${P}"]`);
  assert.equal(a.textContent, "AI for this project");
  await p.click(a);
  await p.settle();
  assert.equal(p.location.pathname, "/app/projectai/" + P);
  assert.ok(!/comes later/.test(section(await open(at()), "What pays for the assistant here").textContent));
});

test("R1 a member who has not joined sees that the project exists, and the Join act alone", async () => {
  const seen = refusedIn("PROJECT_SEEN_NOT_A_PARTICIPANT");
  for (const o of [{ plane: { projectdirectory: ok({ ok: true, projects: [{ id: P, name: "Pothole repairs" }] }) } },
                   { plane: { image: seen, projectstage: seen, projectparticipants: seen, strengthbarof: seen, projectaccountstate: refusedIn("NO_SUCH_PROJECT") } }]) {
    const p = await open(at(), o);
    assert.deepEqual(actsIn(main(p)), ["projectjoin"]);
    assert.match(main(p).textContent, /You can see that this project exists/);
    await press(p, "projectjoin");
    assert.equal(p.byOp("projectjoin")[0].query.projectId, P);
  }
});

test("R1 an invited member is offered Join beside the project", async () => {
  const p = await open(at(), { boot: { plane: { ...plane(), whoami: ok({ ...MEMBER, member: "ana", handle: "ana" }) } } });
  assert.ok(actsIn(main(p)).includes("projectjoin"));
});

test("R1 the other acts send what their owners take", async () => {
  const p = await open(at(), { plane: { projectinvite: ok({ ok: true }), planopen: ok({ ok: true, id: "PLN-2026-0001", title: "Ask the committee" }) } });
  fill(p, { "project-invite": "@ben" });
  await press(p, "projectinvite");
  assert.deepEqual([p.byOp("projectinvite")[0].query.projectId, p.byOp("projectinvite")[0].query.handle], [P, "ben"]);
  fill(p, { "project-plan": "Ask the committee", "project-plan-about": Q });
  await press(p, "planopen");
  assert.deepEqual(p.byOp("planopen")[0].body, { project: P, title: "Ask the committee", subjects: [{ kind: "inquiry", inquiry: Q }] });
  assert.match(main(p).textContent, /Ask the committee.*PLN-2026-0001/s);
  await press(p, "findin", { reason: "to see what it holds" });
  assert.equal(p.location.pathname, "/app/find-in/" + P);
});

test("R1 controls: no handle and no plan title or question are refused by their words, nothing sent", async () => {
  const p = await open(at());
  fill(p, { "project-invite": "", "project-plan": "" });
  assert.match((await press(p, "projectinvite")).textContent, /Name the member to invite/);
  assert.match((await press(p, "planopen")).textContent, /Say why first|Give the plan a title/);
  assert.equal(p.byOp("projectinvite").length + p.byOp("planopen").length, 0);
});

test("R1 an act the session may not do is absent, never greyed (interface-shell R12)", async () => {
  const p = await open(at(), { boot: { plane: { ...plane(), whoami: ok({ ...MEMBER, capabilities: [] }) } } });
  const drawn = actsIn(main(p));
  const needing = PROJECT.acts.map((a) => a.op).filter((op) => NEEDS[op]);
  assert.ok(needing.length > 0);
  for (const op of needing) assert.ok(!drawn.includes(op), `${op} needs ${NEEDS[op]}: absent`);
  for (const op of drawn) assert.ok(!NEEDS[op]);
  assert.ok(!main(p).querySelector("button[disabled]"), "never greyed");
});
