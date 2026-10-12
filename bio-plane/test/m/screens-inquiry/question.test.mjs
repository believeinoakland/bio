/* screens-inquiry R2: the question screen, through the test stand-in kit over a stub plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCREENS } from "../../../src/screens-inquiry/index.mjs";
import { harness, okd, answer } from "./kit.mjs";

const QUESTION = SCREENS.find((s) => s.id === "question");
const Q = "INQ-2026-0001-seven-days";
const P = "PROJ-2026-0007";
const md = (project = P) => ["---", `id: ${Q}`, "object_type: inquiry", "title: \"Seven days\"", "created: 2026-10-03T10:00:00Z",
  ...(project ? [`project: ${project}`] : []), "---", "", "## Question", "", "Is the city repairing reported potholes within seven days?", "", "## What It Rests On", ""].join("\n");
const BASIS = (extra = {}) => ({ ok: true, inquiry: Q, current: "main", versions: [{ name: "main", legs: [
  { ord: 1, target: "INFO-2026-0004", role: "supports", grade: "B", words: "within seven calendar days of the report", target_title: "Administrative Instruction 4.12" },
  { ord: 2, target: "INFO-2026-0005", role: "supports", grade: "B", status: "severed", target_title: "Work orders" },
  { ord: 3, target: "INFO-2026-0006", role: "cuts_against", grade: "D", scale: "testimony", words: "still open, about 60 cm across", target_title: "Mai's observation" }] }],
  ...extra });
const DATA = (o = {}) => ({
  inquiry: okd({ "bundle.md": md(o.project === undefined ? P : o.project) }),
  strength: okd({ ok: true, target: Q, capture: { state: "graded", grade: "B", weakest: { title: "Administrative Instruction 4.12" } },
                  connection: { state: "graded", grade: "C", detail: "a work-order number on both would raise it to B" },
                  testimony: { state: "unrated" } }),
  basis: okd(o.basis || BASIS()),
  hunches: okd({ ok: true, inquiry: Q, hypotheses: [{ hypothesis_id: "HYP-1", statement: "Crews close reports when they inspect.", held_by: "dev" }] }),
  waits: okd({ ok: true, waits: [{ document: "INFO-2026-0008", title: "2024 budget PDF", setter: "ben", reason: "wrong year", date: "2026-10-06T09:00:00Z" }] }),
});
const plane = {
  image: (r) => answer(r.query.id === P ? { "bundle.md": "---\nid: PROJ-2026-0007\ntitle: \"Pothole repairs\"\n---\n" } : null),
  strengthbarof: (r) => answer(r.query.project ? { ok: true, project: r.query.project, bar: { declared: true, capture: "B", connection: "B" } }
                                               : { ok: true, group: "g", bar: { capture: "C", connection: "C" } }),
};

test("R2 reads: the inquiry, its strength, basis versions, hunches and what it waits on", () => {
  const r = QUESTION.reads({ subject: Q, ui: {} });
  assert.deepEqual(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, [v.op, v.query]])), {
    inquiry: ["image", { id: Q }], strength: ["inquirystrength", { id: Q }], basis: ["basisversions", { id: Q }],
    hunches: ["hypotheses", { inquiry: Q }], waits: ["questionwaits", { question: Q }],
  });
});

test("R2 the question drawn: its words, two grades and the phrase against the project's bar, weakest part, what would raise it", async () => {
  const h = harness(QUESTION, { subject: Q, data: DATA(), plane });
  h.render();
  const html = await h.settle();
  assert.match(html, /<h1><span class="cs-rec">Is the city repairing reported potholes within seven days\?<\/span><\/h1>/);
  assert.match(html, /data-ref="project" data-id="PROJ-2026-0007"[^>]*>Pothole repairs<\/a>/);
  assert.match(html, /3 October 2026/);
  assert.deepEqual(h.requests.find((r) => r.op === "strengthbarof").query, { project: P });
  /* two grades, never one score; the phrase against the bar B/B: short on connection */
  assert.match(html, /data-grade="capture" data-letter="B".*data-grade="connection" data-letter="C"/s);
  assert.ok(!/data-grade="testimony"/.test(html.split("screen.question.waits.head")[0]), "an ungraded testimony axis is not drawn");
  assert.match(html, /Against the bar B\/B.*Short of the bar on:<\/span> <span data-key="mark.scale.connection.name">Connection/s);
  assert.match(html, /Weakest: Administrative Instruction 4\.12/);
  assert.match(html, /What would raise it: a work-order number on both would raise it to B/);
  assert.match(html, /Strength is two grades, never one score/);
  assert.match(html, /data-help="mark.strength.means"/);
});

test("R2 a question with no project is held against the group's bar; one that meets it says so", async () => {
  const d = DATA({ project: null });
  d.strength = okd({ capture: { state: "graded", grade: "A" }, connection: { state: "graded", grade: "B" } });
  const h = harness(QUESTION, { subject: Q, data: d, plane });
  h.render();
  const html = await h.settle();
  assert.deepEqual(h.requests.find((r) => r.op === "strengthbarof").query, {});
  assert.match(html, /Against the bar C\/C.*Meets the bar/s);
  assert.match(html, /Opened 3 October 2026/);
});

test("R2 sections Supports, Cuts against, Hunches, Concluding; what it waits on, with who set it aside and why", async () => {
  const h = harness(QUESTION, { subject: Q, data: DATA(), plane });
  h.render();
  const html = await h.settle();
  const at = (k) => html.indexOf(`data-sec="${k}"`);
  assert.ok(at("screen.question.supports.head") < at("screen.question.against.head")
    && at("screen.question.against.head") < at("screen.question.hunches.head")
    && at("screen.question.hunches.head") < at("screen.question.concluding.head"));
  const supports = html.slice(at("screen.question.supports.head"), at("screen.question.against.head"));
  const against = html.slice(at("screen.question.against.head"), at("screen.question.hunches.head"));
  assert.match(supports, /within seven calendar days.*data-ref="document" data-id="INFO-2026-0004"/s);
  assert.match(supports, /Removed from the question/);
  assert.ok(!/data-act="(sever|reinstate)"/.test(html), "K3003: a question's legs are not severed from this screen in T46");
  assert.match(against, /data-grade="testimony" data-letter="D".*still open/s);
  assert.ok(!/INFO-2026-0004/.test(against));
  assert.match(html, /Waiting: 2024 budget PDF was set aside by ben: “wrong year”/);
  assert.match(html, /Set aside by ben, 6 October/);
  assert.match(html, /Hunch · dev's.*Crews close reports when they inspect\./s);
  assert.match(html, /data-help="mark.hunch.means"/);
  assert.match(html, /Not concluded\./);
  /* the registry's acts but sever and reinstate (K3003), conclude (not withdraw) while unconcluded */
  assert.deepEqual([...new Set(h.drawn())].sort(), ["checkrequest", "cite", "conclude", "heldrestore", "hypothesishold", "narrow", "planopen",
                                                     "search"].sort());
});

test("R2 a concluded question shows its conclusion and offers its withdrawal, never a second conclusion", () => {
  const h = harness(QUESTION, { subject: Q, data: DATA({ basis: BASIS({ conclusion: { claim: { text: "No: 1 in 10 is not repaired in time." } }, conclusion_stance: "concluded" }) }), plane });
  const html = h.render();
  assert.match(html, /Concluded: “No: 1 in 10 is not repaired in time\.”/);
  assert.ok(h.drawn().includes("withdrawconclusion") && !h.drawn().includes("conclude"));
});

test("R2 acts send what their owners take; conclude and withdraw carry the dialog's words, never writing help", async () => {
  const h = harness(QUESTION, { subject: Q, data: DATA(), plane, fields: { "question-hunch": "Inspections close them.", "question-hunch-kind": "flow",
    "question-check": "engineering", "question-check-note": "the crew reports", "question-plan": "Ask the committee" } });
  h.render();
  assert.deepEqual((await h.press("narrow", { dialog: { name: "Reported in 2026", description: "the record covers 2026 only" } })).sent,
    { query: { target: Q, version: "main", name: "Reported in 2026", description: "the record covers 2026 only" } });
  assert.deepEqual((await h.press("conclude", { dialog: { falsifier: "inspection records showing repair", commentary: "" } })).sent,
    { query: { target: Q, project: P, version: "main", falsifier: "inspection records showing repair" } });
  assert.deepEqual((await h.press("conclude", { dialog: {} })).sent, { query: { target: Q, project: P, version: "main", no_falsifier: "1" } });
  assert.deepEqual((await h.press("withdrawconclusion", { dialog: { reason: "new evidence" } })).sent, { query: { target: Q, project: P, reason: "new evidence" } });
  assert.deepEqual((await h.press("hypothesishold")).sent, { body: { inquiry: Q, kind: "flow", statement: "Inspections close them." } });
  assert.deepEqual((await h.press("checkrequest")).sent, { body: { target: Q, label: "engineering", note: "the crew reports" } });
  assert.deepEqual((await h.press("planopen")).sent, { body: { project: P, title: "Ask the committee", subjects: [{ kind: "inquiry", inquiry: Q }] } });
  assert.deepEqual((await h.press("heldrestore", { data: { doc: "INFO-2026-0008" } })).sent, { body: { ids: ["INFO-2026-0008"] } });
  /* cite chooses its passage where passages are; "Find another source" searches */
  assert.equal((await h.press("cite", { data: { q: "Seven days?" } })).sent, null);
  assert.deepEqual(h.went.at(-1), ["find-in", P], "Find in over the question's project");
  assert.equal((await h.press("search", { data: { q: "Is the city repairing?" } })).sent, null);
  assert.deepEqual(h.went.at(-1), ["finder", "Is the city repairing?"]);
  /* no act's request carries a writing-help field or a stamp the door owns */
  for (const r of h.requests) for (const k of ["by", "author", "viewer", "at", "assist", "draft"])
    assert.ok(!(r.query && k in r.query) && !(r.body && k in r.body), `${r.op} sends ${k}`);
});

test("R2 a question with no project chooses its passage through Find, by its words", async () => {
  const h = harness(QUESTION, { subject: Q, data: DATA({ project: null }), plane });
  h.render();
  assert.equal((await h.press("cite", { data: { q: "Seven days?" } })).sent, null);
  assert.deepEqual(h.went.at(-1), ["finder", "Seven days?"]);
});

test("R2 controls: a hunch, a check and a plan with nothing written are refused by their words, nothing sent", async () => {
  const h = harness(QUESTION, { subject: Q, data: DATA(), plane, fields: {} });
  h.render();
  assert.deepEqual((await h.press("hypothesishold")).sent, { refuse: "screen.question.hunch.empty" });
  assert.deepEqual((await h.press("checkrequest")).sent, { refuse: "screen.question.check.empty" });
  assert.deepEqual((await h.press("planopen")).sent, { refuse: "screen.question.plan.empty" });
  assert.equal(h.requests.filter((r) => ["hypothesishold", "checkrequest", "planopen"].includes(r.op)).length, 0);
});
