/* screens-inquiry R1: the project screen, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn, MEMBER } from "../interface-shell/harness.mjs";
import { NEEDS } from "../../../src/op-declarations/index.mjs";
import { open, main, actsIn, button, fill, press, rawKeys, plane, SCREENS, P, Q, Q2 } from "./fixtures.mjs";

const PROJECT = SCREENS.find((s) => s.id === "project");
const at = (p) => "/app/project/" + P;

test("R1 reads: the project, its stage, participants, bar, inquiries, account state and the directory, as their owners take them", async () => {
  const p = await open(at());
  const q = (op) => p.byOp(op)[0] && p.byOp(op)[0].query;
  assert.equal(q("image").id, P);
  assert.equal(q("projectstage").project, P);
  assert.equal(q("projectparticipants").projectId, P);
  assert.equal(q("strengthbarof").project, P);
  assert.deepEqual([q("list").type, q("list").limit], ["inquiry", "500"]);
  assert.equal(q("projectaccountstate").project, P);
  assert.ok(p.byOp("projectdirectory").length === 1);
  /* R8's project step: the title as read */
  assert.match(p.root().querySelector(".cs-crumbs").textContent, /Projects.*Pothole repairs/);
});

test("R1 the project drawn: title, objective, stage, the bar as two grades, the cited questions with their strength, account, members", async () => {
  const p = await open(at());
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Pothole repairs");
  assert.match(m.textContent, /as its own policy requires/);
  assert.equal(m.querySelector('[data-ladder="stage"] [aria-current="step"]').textContent, "Investigating");
  const bar = m.querySelectorAll("section")[1];
  assert.deepEqual(bar.querySelectorAll(".cs-grade").map((g) => [g.getAttribute("data-scale"), g.textContent.slice(-1)]), [["capture", "B"], ["connection", "B"]]);
  /* exactly the project's cited, unsevered inquiries, each a link to its question, each read for its strength once */
  const refs = m.querySelectorAll('a.cs-ref[href^="/app/question/"]').map((a) => a.getAttribute("href"));
  assert.deepEqual(refs, ["/app/question/" + Q, "/app/question/" + Q2]);
  assert.deepEqual(p.byOp("inquirystrength").map((r) => r.query.id).sort(), [Q, Q2].sort());
  const rows = m.querySelectorAll(".cs-row");
  assert.deepEqual(rows[0].querySelectorAll(".cs-grade").map((g) => g.textContent.slice(-1)), ["B", "C"]);
  assert.equal(rows[1].querySelectorAll('.cs-gap[data-gap="unrated"]').length, 2);
  assert.match(m.textContent, /No project account: each member's own account/);
  assert.match(m.textContent, /dev \(owner\).*ana \(invited\)/s);
  /* the acts a joined member is offered (K3003: no strengthbarset) */
  assert.deepEqual(actsIn(m).sort(), ["findin", "planopen", "projectinvite", "promote"]);
  await p.settle();
  assert.equal(p.byOp("inquirystrength").length, 2, "each strength read once, not at every redraw");
  assert.deepEqual(rawKeys(p.root()), []);
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

test("R1 promote opens a question in this project: an id from allocid, an inquiry document stating the project, then its screen", async () => {
  const p = await open(at(), { plane: { allocid: ok({ ok: true, id: "INQ-2026-0010" }), promote: ok({ ok: true, bundleId: "x" }) } });
  fill(p, { "project-question": "Did the 2026 report count working days?" });
  await press(p, "promote");
  const alloc = p.byOp("allocid")[0], prom = p.byOp("promote")[0];
  assert.equal(alloc.query.prefix, "INQ");
  assert.match(alloc.query.year, /^\d{4}$/);
  const id = "INQ-2026-0010-did-the-2026-report-count-working-days";
  assert.equal(prom.body.bundleId, id);
  assert.equal(prom.body.base, null);
  assert.equal(prom.body.meta.object_type, "inquiry");
  assert.equal(prom.body.files[0].path, "bundle.md");
  const text = prom.body.files[0].content;
  assert.match(text, new RegExp(`^id: ${id}$`, "m"));
  assert.match(text, new RegExp(`^project: ${P}$`, "m"));
  assert.match(text, /^current_state: open$/m);
  assert.match(text, /## Question\n\nDid the 2026 report count working days\?\n/);
  for (const head of ["## What It Rests On", "## Conclusion", "## What Would Falsify This", "## Session Log", "## Review Notes"]) assert.ok(text.includes(head));
  assert.ok(!("author" in prom.body) && !("by" in prom.body), "the door stamps the author");
  assert.equal(p.location.pathname, "/app/question/" + id);
});

test("R1 promote: an empty question is refused by its word beside the act; a refused write is drawn beside the act (controls)", async () => {
  const p = await open(at(), { plane: { allocid: ok({ ok: true, id: "INQ-2026-0011" }),
    promote: refusedIn("NOT_THE_OWNER", "Only a member who joined this project can open a question in it.") } });
  const slot = await press(p, "promote");
  assert.match(slot.textContent, /Ask the question first/);
  assert.equal(p.byOp("allocid").length + p.byOp("promote").length, 0);
  fill(p, { "project-question": "A question" });
  await press(p, "promote");
  assert.match(main(p).querySelector('[data-refusal="promote"]').textContent, /Only a member who joined/);
  assert.equal(p.location.pathname, at());
  assert.equal(p.doc.getElementById("project-question").value, "A question", "the form keeps what was typed");
});

test("R1 the other acts send what their owners take", async () => {
  const p = await open(at(), { plane: { projectinvite: ok({ ok: true }), planopen: ok({ ok: true, id: "PLN-2026-0001", title: "Ask the committee" }) } });
  fill(p, { "project-invite": "@ben" });
  await press(p, "projectinvite");
  assert.deepEqual([p.byOp("projectinvite")[0].query.projectId, p.byOp("projectinvite")[0].query.handle], [P, "ben"]);
  fill(p, { "project-plan": "Ask the committee", "project-plan-about": Q });
  await press(p, "planopen");
  assert.deepEqual(p.byOp("planopen")[0].body, { project: P, title: "Ask the committee", subjects: [{ kind: "inquiry", inquiry: Q }] });
  /* the plan screen is T47's: the screen says the plan was opened and lists it */
  assert.match(main(p).textContent, /Ask the committee.*PLN-2026-0001/s);
  /* find in this project: find-in, scoped by the project's id (screens-daily) */
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
