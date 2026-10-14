/* screens-inquiry R1, R8–R11, R14, R16, R27–R30, R36, R38–R40, R43: the project screen, on interface-shell's served page
 * over a scripted plane. Every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn, MEMBER, ADMIN } from "../interface-shell/harness.mjs";
import { NEEDS } from "../../../src/op-declarations/index.mjs";
import { open, main, actsIn, button, fill, press, rawKeys, plane, says, section, lead, word, projectWith, SCREENS, P, Q, Q2 } from "./fixtures.mjs";

const PROJECT = SCREENS.find((s) => s.id === "project");
const at = () => "/app/project/" + P;
const options = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]);
/* mai (the harness's member) as an owner of the project, beside dev */
const OWNERS = { projectparticipants: ok({ ok: true, projectId: P, participants: [{ handle: "dev", state: "joined", owner: 1 }, { handle: "mai", state: "joined", owner: 1 },
  { handle: "ana", state: "joined", owner: 0 }] }) };
const SEEN = refusedIn("PROJECT_SEEN_NOT_A_PARTICIPANT");
const seenWith = { status: 200, json: { ok: true, result: { ok: false, code: "PROJECT_SEEN_NOT_A_PARTICIPANT", reason: "PROJECT_SEEN_NOT_A_PARTICIPANT",
  project: P, name: "Pothole repairs", owners: ["dev"] } } };

test("R1 R9 R28 R29 reads: its stage (the subject), the project, participants, bar, questions, the questions she may see, account, directory, visibility, votes and plans", async () => {
  const p = await open(at());
  const q = (op) => p.byOp(op)[0] && p.byOp(op)[0].query;
  assert.equal(q("image").id, P);
  assert.equal(q("projectstage").project, P);
  assert.equal(q("projectparticipants").projectId, P);
  assert.equal(q("strengthbarof").project, P);
  assert.deepEqual([q("projectquestions").project, q("projectquestions").limit, q("projectquestions").after], [P, "100", undefined]);
  assert.deepEqual([q("list").type, q("list").limit], ["inquiry", "500"]);
  assert.equal(q("projectaccountstate").project, P);
  assert.equal(q("projectvisibility").projectId, P);
  assert.equal(q("projectownervotes").projectId, P);
  assert.equal(q("plans").project, P);
  assert.ok(p.root().querySelector(".cs-crumbs").textContent.includes("Pothole repairs"));
});

test("R1 the project drawn: title, objective, stage, its questions with their strength, account, members, and the acts a joined member is offered", async () => {
  const p = await open(at());
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Pothole repairs");
  assert.ok(m.textContent.includes("as its own policy requires"));
  assert.ok(says(m.querySelector('[data-ladder="stage"] [aria-current="step"]'), "screen.project.stage.investigating"));
  const rows = section(p, "screen.project.questions.head").querySelectorAll(".cs-row");
  assert.deepEqual(rows[0].querySelectorAll(".cs-grade").map((g) => g.textContent.slice(-1)), ["B", "C"]);
  assert.equal(rows[1].querySelectorAll('.cs-gap[data-gap="unrated"]').length, 2);
  assert.ok(says(m, "screen.project.account.member"));
  assert.deepEqual(actsIn(m).sort(), ["drawquestion", "findin", "planopen", "projectbarset", "projectleave", "promote"]);
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
  const refs = section(p, "screen.project.questions.head").querySelectorAll('a.cs-ref[href^="/app/question/"]');
  assert.deepEqual(refs.map((a) => [a.getAttribute("href"), a.textContent]), [["/app/question/" + Q, "Seven days?"], ["/app/question/" + Q2, "Closed?"]]);
  assert.deepEqual(p.byOp("projectquestions").map((r) => r.query.after), [undefined, Q, "INQ-2026-0005-x"]);
  /* control: a later page refused is drawn failed beside what was read, never as the end */
  const broke = await open(at(), { plane: { projectquestions: (r) => (r.query.after ? refusedIn("SOME_REFUSAL", "Could not read.") : ok(pages[""])) } });
  const s = section(broke, "screen.project.questions.head");
  assert.equal(s.querySelectorAll('a.cs-ref[href^="/app/question/"]').length, 1);
  assert.ok(s.querySelector('[data-state="failed"]'));
});

test("R43 a new project's first question: state b asks it, opens it and lists it; control: a project with questions draws no state b", async () => {
  let drawn = [];
  const p = await open(at(), { plane: { projectquestions: () => ok({ ok: true, project: P, items: drawn, cursor: null }),
    allocid: ok({ ok: true, id: "INQ-2026-0010" }), promote: ok({ ok: true }),
    drawquestion: (r) => { drawn = [{ inquiry: r.query.inquiry, title: "How many closed late?" }]; return ok({ ok: true, cited: [r.query.inquiry] }); } } });
  const b = section(p, "project.firstquestion");
  assert.ok(says(b, "project.firstquestion.help"));
  assert.ok(button(p, "promote", b), "Open a question, after the first question's words");
  fill(p, { "project-question": "How many closed late?" });
  await press(p, "promote");
  assert.equal(p.byOp("drawquestion")[0].query.project, P);
  assert.match(p.location.pathname, /^\/app\/question\/INQ-2026-0010-how-many-closed-late$/);
  const again = await open(at(), { plane: { projectquestions: () => ok({ ok: true, project: P, items: drawn, cursor: null }) } });
  assert.equal(section(again, "project.firstquestion"), undefined);
  assert.ok(section(again, "screen.project.questions.head").querySelector(`a[href="/app/question/${drawn[0].inquiry}"]`), "listed");
});

test("R10 the project's own bar as strengthbarof answers it: a declared axis by its letter, an undeclared one in words, no bar as absent", async () => {
  const bar = (b) => ok({ ok: true, project: P, bar: b });
  const one = await open(at(), { plane: { strengthbarof: bar({ declared: true, source: "project", capture: "B", connection: null }) } });
  const s1 = section(one, "screen.project.bar.head");
  assert.deepEqual(s1.querySelectorAll("p .cs-grade").map((g) => g.getAttribute("data-scale")), ["capture"]);
  assert.ok(says(s1.querySelector('[data-axis-none="connection"]'), "screen.project.bar.axisnone", { axis: word("mark.scale.connection.name") }));
  const none = await open(at(), { plane: { strengthbarof: bar({ declared: false, source: "none", capture: null, connection: null }) } });
  const s0 = section(none, "screen.project.bar.head");
  assert.equal(s0.querySelectorAll("p .cs-grade").length, 0, "no bar is never drawn as a grade");
  assert.ok(says(s0, "screen.project.bar.none"));
});

test("R10 R16 Set this project's bar sends projectbarset with both axes, either or neither, and her reason; never strengthbarset", async () => {
  const p = await open(at(), { plane: { projectbarset: ok({ ok: true }) } });
  assert.ok(says(button(p, "projectbarset"), "act.projectbarset.label.project"), "by its registry label");
  fill(p, { "project-bar-capture": "A", "project-bar-connection": "C" });
  await press(p, "projectbarset", { reason: "the council meets on it" });
  fill(p, { "project-bar-capture": "", "project-bar-connection": "" });
  await press(p, "projectbarset", { reason: "we withdraw it" });
  assert.deepEqual(p.byOp("projectbarset").map((r) => r.body), [{ project: P, capture: "A", connection: "C", reason: "the council meets on it" }, { project: P, reason: "we withdraw it" }]);
  assert.equal(p.byOp("strengthbarset").length, 0);
  /* control: a member not joined (invited) is offered no bar act */
  const ana = await open(at(), { boot: { plane: { ...plane(), whoami: ok({ ...MEMBER, member: "ana", handle: "ana" }) } } });
  assert.ok(!actsIn(main(ana)).includes("projectbarset"));
});

test("R11 Open a question writes the inquiry, then draws it into the project (drawquestion), then opens it", async () => {
  const p = await open(at(), { plane: { allocid: ok({ ok: true, id: "INQ-2026-0010" }), promote: ok({ ok: true }),
    drawquestion: (r) => ok({ ok: true, cited: [r.query.inquiry], alreadyCited: [] }) } });
  fill(p, { "project-question": "Did the 2026 report count working days?" });
  await press(p, "promote");
  const prom = p.byOp("promote")[0], draw = p.byOp("drawquestion")[0];
  const id = "INQ-2026-0010-did-the-2026-report-count-working-days";
  assert.equal(prom.body.bundleId, id);
  assert.deepEqual(Object.keys(prom.body.files[0]).sort(), ["path", "text"]);
  const text = prom.body.files[0].text;
  assert.match(text, new RegExp(`^project: ${P}$`, "m"));
  assert.ok(text.includes(JSON.stringify(word("file.recheck.revisit"))), "its recheck trigger is the keyed word (R44)");
  assert.deepEqual([draw.query.project, draw.query.inquiry, draw.query.note], [P, id, ""]);
  assert.ok(p.requests.indexOf(draw) > p.requests.indexOf(prom), "after the write");
  assert.equal(p.location.pathname, "/app/question/" + id);
});

test("R11 controls: an empty question sends nothing; a refused draw is said beside the act, the question open on its own screen", async () => {
  const p = await open(at());
  assert.ok(says(await press(p, "promote"), "screen.project.question.empty"));
  assert.equal(p.byOp("allocid").length + p.byOp("promote").length, 0);
  const d = await open(at(), { plane: { allocid: ok({ ok: true, id: "INQ-2026-0012" }), promote: ok({ ok: true }),
    drawquestion: refusedIn("SEVERED_EDGE", "The project once removed this question; reinstate it instead.") } });
  fill(d, { "project-question": "Who inspects?" });
  await press(d, "promote");
  assert.equal(d.location.pathname, at(), "the project screen stays");
  const said = main(d).querySelector('[data-refusal="drawquestion"]');
  assert.ok(says(said, "screen.project.questions.notdrawn", { reason: "The project once removed this question; reinstate it instead." }));
  assert.equal(said.querySelector("a.cs-ref").getAttribute("href"), "/app/question/INQ-2026-0012-who-inspects");
});

test("R16 R8 Draw on a question from elsewhere: a choice among the questions she may see, as record data, sending drawquestion with her note", async () => {
  const p = await open(at(), { plane: { drawquestion: (r) => ok({ ok: true, cited: [r.query.inquiry], alreadyCited: [] }) } });
  assert.deepEqual(options(p, "project-draw-question"), [["INQ-2026-0003-gone", "Severed"], ["INQ-2026-0099-other", "Another project's"]]);
  fill(p, { "project-draw-question": "INQ-2026-0099-other", "project-draw-note": "the same crews" });
  await press(p, "drawquestion");
  const q = p.byOp("drawquestion")[0].query;
  assert.deepEqual([q.project, q.inquiry, q.note], [P, "INQ-2026-0099-other", "the same crews"]);
  assert.ok(says(main(p).querySelector('[data-said="drawquestion"]'), "screen.project.draw.done"));
  const a = await open(at(), { plane: { drawquestion: (r) => ok({ ok: true, cited: [], alreadyCited: [r.query.inquiry] }) } });
  fill(a, { "project-draw-note": "why not" });
  await press(a, "drawquestion");
  assert.ok(says(main(a).querySelector('[data-said="drawquestion"]'), "screen.project.draw.already"));
  /* controls: no note, nothing sent; a title shaped like a word key is drawn as itself */
  const n = await open(at());
  fill(n, { "project-draw-note": "" });
  assert.ok(says(await press(n, "drawquestion"), "screen.project.draw.empty"));
  assert.equal(n.byOp("drawquestion").length, 0);
  const k = await open(at(), { plane: { list: ok({ bundles: [{ bundle_id: "INQ-2026-0100-k", title: "act.promote.does" }] }) } });
  assert.deepEqual(options(k, "project-draw-question"), [["INQ-2026-0100-k", "act.promote.does"]]);
});

test("R27 R36 This project's work: its plans by name and the calculations, standards and timeline it names; control: no plan, no plan listed", async () => {
  const md = projectWith([[Q, "cites", "active"], ["CALC-2026-0002", "cites", "active"], ["STD-2026-0001", "cites", "active"], ["EVT-2026-0009", "cites", "active"]]);
  const p = await open(at(), { images: { [P]: { "bundle.md": md } }, plane: { plans: ok({ ok: true, plans: [{ id: "PLAN-2026-0003", title: "Pothole options" }] }) } });
  const s = section(p, "project.work.title");
  assert.ok(says(s.closest ? s : s, "screen.timeline.name"));
  const kinds = s.querySelectorAll("a.cs-ref, .cs-card, .rec").map((a) => a.textContent);
  assert.ok(kinds.includes("Pothole options"), "the plan by name");
  assert.ok(s.textContent.includes(word("screen.calculation.name")) && s.textContent.includes(word("screen.standard.name")));
  assert.ok(s.querySelector("h2").getAttribute("data-tip").includes(word("project.work.help")));
  const none = await open(at());
  assert.equal(section(none, "project.work.title"), undefined, "a kind it has none of is not listed, and the section not drawn");
  /* R36: a plan opened here is listed by name at once */
  const o = await open(at(), { plane: { planopen: ok({ ok: true, id: "PLAN-2026-0004", title: "Ask the committee" }) } });
  fill(o, { "project-plan": "Ask the committee", "project-plan-about": Q });
  await press(o, "planopen");
  assert.deepEqual(o.byOp("planopen")[0].body, { project: P, title: "Ask the committee", subjects: [{ kind: "inquiry", inquiry: Q }] });
  assert.ok(section(o, "project.work.title").textContent.includes("Ask the committee"));
});

test("R28 who can find it: the setting, its history newest first ending with how it started, and an owner's reasoned change", async () => {
  const vis = ok({ ok: true, projectId: P, setting: "discoverable", history: [{ setting: "hidden", set_by: "dev", at: "2026-10-01T09:00:00Z" },
    { setting: "discoverable", set_by: "dev", reason: "the group should know", at: "2026-10-04T09:00:00Z" }] });
  const p = await open(at(), { plane: { ...OWNERS, projectvisibility: vis, projectvisibilityset: ok({ ok: true }) } });
  const s = section(p, "project.visibility.title");
  assert.ok(says(s, "project.visibility.discoverable"));
  assert.ok(says(s.querySelector('[data-visibility="change"]'), "project.visibility.history",
    { change: word("project.visibility.discoverable"), who: "dev", date: "4 October 2026", reason: "the group should know" }));
  assert.ok(says(s.querySelector('[data-visibility="started"]'), "project.visibility.started", { setting: word("project.visibility.hidden"), date: "1 October 2026" }));
  fill(p, { "project-visibility-why": "a counsel matter now" });
  await press(p, "projectvisibilityset");
  assert.deepEqual([p.byOp("projectvisibilityset")[0].query.projectId, p.byOp("projectvisibilityset")[0].query.setting, p.byOp("projectvisibilityset")[0].query.reason],
    [P, "hidden", "a counsel matter now"]);
  /* refusals by their words */
  const r = await open(at(), { plane: { ...OWNERS, projectvisibility: vis, projectvisibilityset: refusedIn("PROJECT_SCOPE_KEEPS_HIDDEN", "A project kept for counsel stays hidden.") } });
  fill(r, { "project-visibility-why": "x" });
  assert.ok((await press(r, "projectvisibilityset")).textContent.length > 0);
  /* control: a member who is not an owner does not see the act */
  const m = await open(at());
  assert.ok(!actsIn(section(m, "project.visibility.title")).includes("projectvisibilityset"));
});

test("R29 R40 members: one row each with role, the founder unnamed by key, never admin; an owner's acts on each row", async () => {
  const parts = ok({ ok: true, projectId: P, participants: [{ founder: true, handle: null, state: "joined", owner: 1 }, { handle: "mai", state: "joined", owner: 1, since: "2026-10-02T09:00:00Z" },
    { handle: "ana", state: "joined", owner: 0, joined_at: "2026-10-03T09:00:00Z" }] });
  const p = await open(at(), { plane: { projectparticipants: parts, projectowneradd: ok({ ok: true }), projectremove: ok({ ok: true }), projectownerremove: ok({ ok: true }) } });
  const s = section(p, "screen.project.members.head");
  const rows = s.querySelectorAll(".cs-row");
  assert.ok(says(rows[0], "member.founder.unnamed") && says(rows[0], "project.member.owner"));
  assert.ok(!/\badmin\b/.test(s.textContent), "never admin");
  assert.ok(says(rows[1], "project.member.since", { date: "2 October 2026" }));
  assert.ok(says(rows[2], "project.member.joined", { date: "3 October 2026" }) && says(rows[2], "project.member.member"));
  assert.deepEqual(actsIn(rows[1]), ["projectownerremove"], "her own row: stand down");
  assert.deepEqual(actsIn(rows[2]).sort(), ["projectowneradd", "projectremove"], "a member's row, to an owner");
  assert.ok(says(s, "project.owners.rule"));
  await press(p, "projectowneradd", { within: rows[2] });
  assert.deepEqual([p.byOp("projectowneradd")[0].query.projectId, p.byOp("projectowneradd")[0].query.handle], [P, "ana"]);
  await press(p, "projectremove", { within: section(p, "screen.project.members.head").querySelectorAll(".cs-row")[2] });
  assert.equal(p.byOp("projectremove")[0].query.handle, "ana");
  assert.ok(!("comment" in p.byOp("projectremove")[0].query), "an empty reason is not refused, and none is sent");
  await press(p, "projectownerremove", { within: section(p, "screen.project.members.head").querySelectorAll(".cs-row")[1], reason: "I step back" });
  assert.deepEqual([p.byOp("projectownerremove")[0].query.handle, p.byOp("projectownerremove")[0].query.reason], ["mai", "I step back"]);
  /* control: with a handle, the handle */
  assert.ok(rows[1].textContent.includes("mai"));
});

test("R29 three owners with one change agreed by one draw waiting for the other two; an owner who has not agreed agrees by the same act", async () => {
  const votes = ok({ ok: true, projectId: P, changes: [{ change: "add", target: "ana", proposed_by: "dev", proposed_at: "2026-10-09T09:00:00Z", agreed: ["dev"], awaiting: ["mai", "rosa"] }] });
  const p = await open(at(), { plane: { ...OWNERS, projectownervotes: votes, projectowneradd: ok({ ok: true }) } });
  const s = section(p, "screen.project.members.head");
  assert.ok(says(s.querySelector('[data-pending="add"]'), "project.owners.pending", { who: "ana", by: "dev", date: "9 October 2026", agreed: "dev", awaiting: "mai, rosa" }));
  const agree = s.querySelectorAll('button[data-act="projectowneradd"]').find((b) => says(b, "project.owners.agree", { who: "ana" }));
  assert.ok(agree, "she agrees by the same act");
  /* control: a non-owner sees no owner act */
  const m = await open(at(), { plane: { projectownervotes: votes } });
  const acts = actsIn(section(m, "screen.project.members.head"));
  for (const op of ["projectowneradd", "projectownerremove", "projectremove", "projectinvite"]) assert.ok(!acts.includes(op), op);
});

test("R29 beneath the rows: invite (an owner), leave, and start a project from this one, hidden preselected, opening the new one", async () => {
  const p = await open(at(), { boot: { plane: { ...plane({ plane: { ...OWNERS, projectinvite: ok({ ok: true }), projectleave: ok({ ok: true }), projectfork: ok({ ok: true, newId: "PROJ-2026-0050" }) } }),
    whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }) } } });
  fill(p, { "project-invite": "@ben" });
  await press(p, "projectinvite");
  assert.deepEqual([p.byOp("projectinvite")[0].query.projectId, p.byOp("projectinvite")[0].query.handle], [P, "ben"]);
  await press(p, "projectleave");
  assert.equal(p.byOp("projectleave")[0].query.projectId, P);
  assert.equal(p.doc.getElementById("project-fork-visibility").value, "hidden");
  fill(p, { "project-fork-title": "Pothole repairs, 2027" });
  await press(p, "projectfork");
  assert.deepEqual([p.byOp("projectfork")[0].query.projectId, p.byOp("projectfork")[0].query.title, p.byOp("projectfork")[0].query.visibility], [P, "Pothole repairs, 2027", "hidden"]);
  assert.equal(p.location.pathname, "/app/project/PROJ-2026-0050");
});

test("R30 state c: an administrator at a hidden project's existence, its owners inactive: the rescue and nothing else", async () => {
  const p = await open(at(), { boot: { plane: { ...plane({ plane: { projectstage: seenWith, image: ok(null), projectparticipants: refusedIn("NO_SUCH_PROJECT"),
    affordances: ok({ ok: true, roster: { rescue_open: true, owner: false } }), projectownerrescue: ok({ ok: true }) } }), whoami: ok(ADMIN) } } });
  const s = section(p, "project.rescue.title", { date: "" });
  assert.ok(says(s, "project.rescue.says", { owners: "dev" }) && says(s, "project.rescue.own"));
  assert.deepEqual(actsIn(main(p)), ["projectownerrescue"], "nothing else of the project");
  fill(p, { "project-rescue-why": "its work must go on" });
  await press(p, "projectownerrescue");
  const q = p.byOp("projectownerrescue")[0].query;
  assert.deepEqual([q.projectId, q.handle, q.reason], [P, "rosa", "its work must go on"]);
  /* control: refused by its words (a project kept for its owner alone) */
  const r = await open(at(), { boot: { plane: { ...plane({ plane: { projectstage: seenWith, image: ok(null),
    affordances: ok({ ok: true, roster: { rescue_open: true } }), projectownerrescue: refusedIn("PROJECT_SCOPE_OWN", "A project kept for one member alone is never taken over.") } }), whoami: ok(ADMIN) } } });
  fill(r, { "project-rescue-why": "x" });
  assert.ok((await press(r, "projectownerrescue")).textContent.length > 0);
});

test("R1 a member who has not joined sees that the project exists, and the Join act alone", async () => {
  for (const o of [{ plane: { projectdirectory: ok({ ok: true, projects: [{ id: P, name: "Pothole repairs" }] }) } },
                   { plane: { image: SEEN, projectstage: seenWith, projectparticipants: SEEN, strengthbarof: SEEN, projectaccountstate: refusedIn("NO_SUCH_PROJECT") } }]) {
    const p = await open(at(), o);
    assert.deepEqual(actsIn(main(p)), ["projectjoin"]);
    assert.ok(says(main(p), "screen.project.notjoined"));
    assert.equal(main(p).querySelector("h1").textContent, "Pothole repairs", "R39: its name, never its id");
    await press(p, "projectjoin");
    assert.equal(p.byOp("projectjoin")[0].query.projectId, P);
  }
});

test("R38 Add a document opens capture with the project as its subject", async () => {
  const p = await open(at());
  const a = main(p).querySelector('[data-adddoc="project"]');
  assert.equal(a.getAttribute("href"), "/app/capture/address/" + P);
  assert.ok(says(a, "project.adddoc"));
});

test("R39 no heading is a record id; a project with no title draws undetermined", async () => {
  const p = await open(at());
  for (const h of main(p).querySelectorAll("h1, h2")) assert.doesNotMatch(h.textContent, /PROJ-|INQ-|INFO-/);
  const bare = await open(at(), { images: { [P]: { "bundle.md": `---\nid: ${P}\nobject_type: project\n---\n` } } });
  assert.ok(main(bare).querySelector("h1").textContent.startsWith(lead("state.undetermined")));
});

test("R14 the project links AI for this project to its projectai screen", async () => {
  const p = await open(at());
  const a = section(p, "screen.project.account.head").querySelector(`a[href="/app/projectai/${P}"]`);
  assert.ok(says(a, "screen.projectai.name"));
});

test("R1 controls: no handle and no plan title or question are refused by their words, nothing sent", async () => {
  const p = await open(at(), { plane: OWNERS });
  fill(p, { "project-invite": "", "project-plan": "" });
  assert.ok(says(await press(p, "projectinvite"), "screen.project.invite.empty"));
  await press(p, "planopen");
  assert.equal(p.byOp("projectinvite").length + p.byOp("planopen").length, 0);
});

test("R1 an act the session may not do is absent, never greyed (interface-shell R12)", async () => {
  const p = await open(at(), { boot: { plane: { ...plane(), whoami: ok({ ...MEMBER, capabilities: [] }) } } });
  const drawn = actsIn(main(p));
  const needing = PROJECT.acts.map((a) => a.op).filter((op) => NEEDS[op]);
  assert.ok(needing.length > 0);
  for (const op of needing) assert.ok(!drawn.includes(op), `${op} needs ${NEEDS[op]}: absent`);
  assert.ok(!main(p).querySelector("button[disabled]"), "never greyed");
});
