/* screens-inquiry R1: the project screen, through the test stand-in kit over a stub plane (every function rebuilt from
 * its source, so each is shown self-contained). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCREENS } from "../../../src/screens-inquiry/index.mjs";
import { harness, okd, failed, answer, refusal } from "./kit.mjs";

const PROJECT = SCREENS.find((s) => s.id === "project");
const P = "PROJ-2026-0007";
const md = (refs) => ["---", `id: ${P}`, "object_type: project", "title: \"Pothole repairs\"",
  "objective: \"Is the city repairing reported potholes as its own policy requires?\"", "references:",
  ...refs.flatMap(([t, rel, st]) => [`  - target: ${t}`, `    rel: ${rel}`, `    status: ${st}`]), "---", "", "## Summary", ""].join("\n");
const DATA = () => ({
  project: okd({ "bundle.md": md([["INQ-2026-0001-seven-days", "cites", "active"], ["INQ-2026-0002-closed", "cites", "confirmed"],
                                  ["INQ-2026-0003-gone", "cites", "severed"], ["INFO-2026-0009", "cites", "active"]]) }),
  stage: okd({ ok: true, project: P, stage: "investigating", questions: { read: 2, with_legs: 1, concluded: 0 } }),
  participants: okd({ ok: true, projectId: P, participants: [{ handle: "dev", state: "joined", owner: true }, { handle: "rosa", state: "joined", owner: false },
                                                             { handle: "ana", state: "invited", owner: false }] }),
  bar: okd({ ok: true, project: P, bar: { declared: true, source: "project", capture: "B", connection: "B" } }),
  questions: okd({ bundles: [{ bundle_id: "INQ-2026-0001-seven-days", title: "Is the city repairing reported potholes within seven days?" },
                             { bundle_id: "INQ-2026-0002-closed", title: "Does closed mean repaired?" },
                             { bundle_id: "INQ-2026-0003-gone", title: "Severed" }, { bundle_id: "INQ-2026-0099-other", title: "Another project's" }] }),
  account: okd({ ok: true, on: true, serving: "member" }),
  directory: okd({ ok: true, projects: [{ id: "PROJ-2026-0042", name: "Elsewhere" }] }),
});
const STRENGTH = { "INQ-2026-0001-seven-days": { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "C" } },
                   "INQ-2026-0002-closed": { capture: { state: "unrated" }, connection: { state: "unrated" } } };
const plane = { inquirystrength: (r) => answer({ ok: true, target: r.query.id, ...STRENGTH[r.query.id] }) };

test("R1 reads: the project, its stage, participants, bar, inquiries, account state and the directory, as their owners take them", () => {
  const r = PROJECT.reads({ subject: P, ui: {} });
  assert.deepEqual(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, [v.op, v.query]])), {
    project: ["image", { id: P }], stage: ["projectstage", { project: P }], participants: ["projectparticipants", { projectId: P }],
    bar: ["strengthbarof", { project: P }], questions: ["list", { type: "inquiry", limit: "500" }],
    account: ["projectaccountstate", { project: P }], directory: ["projectdirectory", {}],
  });
  assert.deepEqual(PROJECT.place({ subject: P, data: DATA(), ui: {} }), { project: { id: P, title: "Pothole repairs" } });
});

test("R1 the project drawn: title, objective, stage, the bar as two grades, the cited questions with strength, account, members", async () => {
  const h = harness(PROJECT, { subject: P, data: DATA(), plane, me: { member: "m2", handle: "rosa" } });
  h.render();
  const html = await h.settle();
  assert.match(html, /<h1>Pothole repairs<\/h1>/);
  assert.match(html, /as its own policy requires/);
  assert.match(html, /aria-current="step"><span data-key="screen.project.stage.investigating">/);
  assert.match(html, /data-grade="capture" data-letter="B".*data-grade="connection" data-letter="B"/s);
  /* exactly the project's cited, unsevered inquiries, each read for its strength once */
  const refs = [...html.matchAll(/data-ref="question" data-id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(refs, ["INQ-2026-0001-seven-days", "INQ-2026-0002-closed"]);
  assert.deepEqual(h.requests.filter((q) => q.op === "inquirystrength").map((q) => q.query.id).sort(), ["INQ-2026-0001-seven-days", "INQ-2026-0002-closed"]);
  assert.match(html, /seven days\?<\/a>.*data-grade="capture" data-letter="B".*data-grade="connection" data-letter="C"/s);
  assert.match(html, /data-mark="gap.unrated"/);
  assert.match(html, /screen.project.account.member/);
  assert.match(html, /dev \(owner\)/);
  assert.match(html, /ana \(invited\)/);
  /* the acts a joined member is offered; Join only to an invited or unjoined member */
  assert.deepEqual(h.drawn().sort(), ["findin", "planopen", "projectinvite", "promote"].sort());
  assert.ok(!/data-act="strengthbarset"/.test(html), "K3003: the group's bar is not set from a project");
  await h.settle();
  assert.equal(h.requests.filter((q) => q.op === "inquirystrength").length, 2, "each strength read once, not at every redraw");
});

test("R1 a member who has not joined sees that the project exists and the Join act alone", () => {
  for (const data of [{ ...DATA(), directory: okd({ ok: true, projects: [{ id: P, name: "Pothole repairs" }] }) },
                      { project: failed("PROJECT_SEEN_NOT_A_PARTICIPANT"), stage: failed("PROJECT_SEEN_NOT_A_PARTICIPANT"),
                        participants: { state: "failed", refusal: { code: "PROJECT_SEEN_NOT_A_PARTICIPANT", owners: ["dev"] } },
                        bar: failed("PROJECT_SEEN_NOT_A_PARTICIPANT"), questions: okd({ bundles: [] }), account: failed("NO_SUCH_PROJECT"), directory: okd({ projects: [] }) }]) {
    const h = harness(PROJECT, { subject: P, data });
    const html = h.render();
    assert.deepEqual(h.drawn(), ["projectjoin"]);
    assert.match(html, /screen.project.notjoined/);
  }
});

test("R1 an invited member is offered Join beside the project", () => {
  const h = harness(PROJECT, { subject: P, data: DATA(), plane, me: { member: "m3", handle: "ana" } });
  h.render();
  assert.ok(h.drawn().includes("projectjoin"));
});

test("R1 promote opens a question in this project: an id from allocid, an inquiry document stating the project, then its screen", async () => {
  const h = harness(PROJECT, { subject: P, data: DATA(), plane: { ...plane,
    allocid: () => answer({ ok: true, id: "INQ-2026-0010" }), promote: () => answer({ ok: true, bundleId: "x" }) },
    fields: { "project-question": "Did the 2026 report count working days?" } });
  h.render();
  const { sent } = await h.press("promote");
  assert.equal(sent, null);
  const [alloc, prom] = h.requests.filter((r) => ["allocid", "promote"].includes(r.op));
  assert.deepEqual(alloc.query, { prefix: "INQ", year: "2026" });
  assert.match(prom.body.meta.created, /^2026-10-12T09:30:00Z$/);
  const id = "INQ-2026-0010-did-the-2026-report-count-working-days";
  assert.equal(prom.body.bundleId, id);
  assert.equal(prom.body.base, null);
  assert.deepEqual(prom.body.meta.object_type, "inquiry");
  const text = prom.body.files[0].content;
  assert.equal(prom.body.files[0].path, "bundle.md");
  assert.match(text, new RegExp(`^id: ${id}$`, "m"));
  assert.match(text, new RegExp(`^project: ${P}$`, "m"));
  assert.match(text, /^current_state: open$/m);
  assert.match(text, /## Question\n\nDid the 2026 report count working days\?\n/);
  for (const head of ["## What It Rests On", "## Conclusion", "## What Would Falsify This", "## Session Log", "## Review Notes"]) assert.ok(text.includes(head));
  assert.ok(!("author" in prom.body) && !("by" in prom.body), "the door stamps the author");
  assert.deepEqual(h.went, [["question", id]]);
});

test("R1 promote: an empty question is refused by its word; a refused write is drawn beside the act (control)", async () => {
  const h = harness(PROJECT, { subject: P, data: DATA(), plane: { ...plane, allocid: () => answer({ ok: true, id: "INQ-2026-0011" }),
    promote: () => refusal("NOT_THE_OWNER", { translation: "Only a member who joined this project can open a question in it." }) },
    fields: { "project-question": " " } });
  h.render();
  assert.deepEqual((await h.press("promote")).sent, { refuse: "screen.project.question.empty" });
  assert.equal(h.requests.length, 2, "nothing sent but the strength reads");
  h.fields["project-question"] = "A question";
  await h.press("promote");
  assert.match(h.html, /data-refusal="promote">Only a member who joined/);
  assert.deepEqual(h.went, []);
});

test("R1 the other acts send what their owners take", async () => {
  const h = harness(PROJECT, { subject: P, data: DATA(), plane: { ...plane, projectinvite: () => answer({ ok: true }), projectjoin: () => answer({ ok: true }),
    planopen: () => answer({ ok: true, id: "PLN-2026-0001", title: "Ask the committee" }) },
    fields: { "project-invite": "@ben", "project-plan": "Ask the committee", "project-plan-about": "INQ-2026-0001-seven-days" } });
  h.render();
  assert.deepEqual((await h.press("projectinvite")).sent, { query: { projectId: P, handle: "ben" } });
  assert.deepEqual((await h.press("projectjoin")).sent, { query: { projectId: P } });
  assert.deepEqual((await h.press("planopen")).sent,
    { body: { project: P, title: "Ask the committee", subjects: [{ kind: "inquiry", inquiry: "INQ-2026-0001-seven-days" }] } });
  /* the plan screen is T47's: the screen says the plan was opened and lists it */
  assert.match(h.html, /Ask the committee.*PLN-2026-0001/s);
  assert.deepEqual((await h.press("findin")).sent, null);
  assert.deepEqual(h.went.at(-1), ["find-in", "project:" + P]);
  /* controls: no handle, no title, no question: refused by their words, nothing sent */
  h.fields["project-invite"] = ""; h.fields["project-plan-about"] = "";
  assert.deepEqual((await h.press("projectinvite")).sent, { refuse: "screen.project.invite.empty" });
  assert.deepEqual((await h.press("planopen")).sent, { refuse: "screen.project.plan.empty" });
});

test("R1 an act the session may not do is absent, never greyed (interface-shell R12)", () => {
  const h = harness(PROJECT, { subject: P, data: DATA(), plane, denied: ["promote", "projectinvite"] });
  h.render();
  assert.deepEqual(h.drawn().sort(), ["findin", "planopen"]);
});
