/* Find in this (R5) on the real served page (interface-shell's harness): the scope set by where it was opened, what to
   find, the results by kind with their words, passage and "Found by search", the one recording act each result offers
   with its fields in place, who recorded one already, keeping finding, and "See all in Find". Finding records nothing
   (K1468). */
import test from "node:test";
import assert from "node:assert/strict";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { open, ok, refused, text, ops, acts, button, press, beside, last, main } from "./page.mjs";

const QUESTIONS = ok({ hits: [{ bundle_id: "INQ-1", title: "Is the city repairing reported potholes within seven days?" }] });
const KINDS = [
  { kind: "people", items: [{ kind: "people", words: "The Director shall repair", capture_sha: "c1", extent: { passage: 3 }, entity: "ENT-9", recorded: [] }], count: 1, nothing: false, not_read: [] },
  { kind: "money", items: [], count: 0, nothing: true, not_read: [] },
  { kind: "dates", items: [{ kind: "dates", words: "within seven calendar days", capture_sha: "c1", extent: { passage: 3 }, date: "2023-01-01", recorded: [] },
    { kind: "dates", words: "Reported", capture_sha: "c2", extent: {}, table: true, content_id: "CNT-4", recorded: [] }], count: 2, nothing: false, not_read: [] },
  { kind: "requirements", items: [{ kind: "requirements", words: "shall repair each reported pothole", capture_sha: "c1", extent: { passage: 3 }, content_id: "CNT-1", recorded: [{ by: "Mai", at: "2026-10-03" }] }], count: 1, nothing: false, not_read: [] },
  { kind: "events", items: [], count: 0, nothing: false, not_read: [{ capture: "c7", why: "not read yet" }] },
  { kind: "term", items: [{ kind: "term", words: "closed", capture_sha: "c1", extent: { paragraph: 5 }, recorded: [] }], count: 37, truncated: true, nothing: false, not_read: [] },
];
const FOUND = ok({ ok: true, scope: { form: "project", project: "PROJ-1", captures: 14 }, kinds: KINDS });
const PLANE = { search: QUESTIONS, findin: FOUND };
const R = "looking";
const ALL_KINDS = { "findin-kind-people": true, "findin-kind-money": true, "findin-kind-dates": true, "findin-kind-requirements": true, "findin-kind-events": true, "findin-kind-term": true, "findin-term": "closed" };
const shown = async (plane = {}) => {
  const p = await open("/app/find-in/PROJ-1", { ...PLANE, ...plane });
  await press(p, "findin", { values: { ...ALL_KINDS, "findin-question": "INQ-1" }, reason: R });
  return p;
};
const sections = (p) => main(p).querySelectorAll("section.mk-sec");

test("R5: the scope is set by where it was opened (a document, the held set, a project) and shown under \"Look in\"", async () => {
  const forms = { "PROJ-1": "Everything in this project", "sel-abc": "The documents you are holding together", "9f2c0d": "This document" };
  for (const [subject, words] of Object.entries(forms)) {
    const p = await open("/app/find-in/" + subject, PLANE);
    assert.match(text(p), new RegExp("Look in.*" + words));
  }
  const proj = await open("/app/find-in/PROJ-1", PLANE);
  assert.ok(main(proj).querySelectorAll(".cs-card, a.cs-ref").some((e) => e.textContent === "PROJ-1"));
  assert.match(text(proj, main(proj).querySelector("nav.cs-crumbs")), /Projects.*PROJ-1.*Find in this/, "the path's project step (interface-shell R8)");
  const none = await open("/app/find-in", PLANE);
  assert.match(text(none), /Nothing here Open Find in this from a document/);
  assert.deepEqual(ops(none), []);
});

test("R5: the member ticks what to find, with an optional term and question; findin is sent over the scope, and records nothing", async () => {
  const p = await open("/app/find-in/PROJ-1", PLANE);
  for (const k of ["people", "money", "dates", "requirements", "events", "term"]) assert.ok(p.doc.getElementById("findin-kind-" + k), k);
  assert.equal(p.doc.getElementById("findin-question").querySelectorAll("option")[1].textContent, "Is the city repairing reported potholes within seven days?");
  const nothing = await press(p, "findin", { values: { "findin-kind-people": false, "findin-kind-money": false, "findin-kind-dates": false, "findin-kind-requirements": false }, reason: R });
  assert.equal(beside(p, nothing), "Tick at least one thing to find.");
  const noTerm = await press(p, "findin", { values: { "findin-kind-term": true, "findin-term": " " }, reason: R });
  assert.equal(beside(p, noTerm), "Write the name or term to find.");
  await press(p, "findin", { values: { "findin-kind-people": true, "findin-kind-term": true, "findin-term": " closed ", "findin-question": "INQ-1" }, reason: R });
  const r = last(p, "findin");
  assert.deepEqual({ scope: r.body.scope, kinds: r.body.kinds, term: r.body.term }, { scope: { project: "PROJ-1" }, kinds: ["people", "term"], term: "closed" });
  const sel = await open("/app/find-in/sel-abc", PLANE);
  await press(sel, "findin", { values: { "findin-kind-money": true, "findin-kind-people": false, "findin-kind-dates": false, "findin-kind-requirements": false }, reason: R });
  assert.deepEqual(last(sel, "findin").body.scope, { selection: "sel-abc" });
  assert.deepEqual(last(sel, "findin").body.kinds, ["money"]);
  const doc = await open("/app/find-in/9f2c", PLANE);
  await press(doc, "findin", { reason: R });
  assert.deepEqual(last(doc, "findin").body.scope, { capture: "9f2c" });
  // Finding records nothing (K1468): the op is a read, and its answer is kept in the screen's page memory only.
  assert.equal(OPS.findin.mutating, false);
});

test("R5: results by kind, each with its words as written, its passage and Found by search; a kind with none says \"Nothing here\"", async () => {
  const p = await shown();
  const heads = sections(p).map((s) => s.querySelector("h2").textContent);
  assert.deepEqual(heads, ["People and offices your group follows · 1", "Money figures · 0", "Dates and deadlines · 2", "Requirements: what someone shall or must do · 1", "Events in minutes and agendas · 0", "“closed” · 37"]);
  assert.match(text(p, sections(p)[0]), /“The Director shall repair”passage 3/);
  assert.match(text(p, sections(p)[5]), /“closed”passage 5/);
  assert.equal(main(p).querySelectorAll('.cs-row > .cs-origin[data-origin="search"]').length, 5);
  assert.match(text(p, sections(p)[1]), /Nothing here\./);
  assert.doesNotMatch(text(p, sections(p)[4]), /Nothing here/, "not \"nothing\" while documents were not read");
  assert.match(text(p, sections(p)[4]), /1 documents could not be read for this/);
});

test("R5: each result offers only the recording act of its kind; one already recorded shows who recorded it", async () => {
  const p = await shown();
  const recs = acts(p).filter(([, d]) => d.k !== undefined).map(([op, d]) => `${d.k}.${d.i}:${op}`);
  assert.deepEqual(recs, ["0.0:recordpersonfact", "2.0:recorddatedfact", "2.1:tabledeclare", "5.0:cite"]);
  assert.match(text(p, sections(p)[3]), /Recorded by Mai/);
  assert.ok(sections(p)[3].querySelector('.cs-origin[data-origin="accepted"]'));
  const more = await open("/app/find-in/PROJ-1", { ...PLANE, findin: ok({ kinds: [
    { kind: "money", items: [{ words: "$4.2 million", capture_sha: "c", extent: {}, recorded: [] }] },
    { kind: "requirements", items: [{ words: "shall", capture_sha: "c", extent: {}, recorded: [] }] },
    { kind: "events", items: [{ words: "met on", capture_sha: "c", extent: {}, recorded: [] }] }] }) });
  await press(more, "findin", { reason: R });
  assert.deepEqual(acts(more).filter(([, d]) => d.k !== undefined).map(([op]) => op), ["recordfact", "standarddeclare", "recorddatedfact"]);
  for (const [op] of acts(more).filter(([, d]) => d.k !== undefined))
    assert.ok(button(more, op).closest("details.mk-actd"), `${op}'s fields are drawn in place with it`);
});

test("R5: each recording act sends its owner's body from the result's passage and the member's fields, the chosen question kept beside it", async () => {
  const p = await shown();
  const f = (op) => button(p, op).dataset.f;
  await press(p, "recordpersonfact", { values: { [f("recordpersonfact") + "-kind"]: "locality", [f("recordpersonfact") + "-value"]: "Oakland" } });
  assert.deepEqual(last(p, "recordpersonfact").body, { person: "ENT-9", kind: "locality", value: "Oakland", citation: { capture_sha: "c1", extent: { passage: 3 } }, question: "INQ-1" });
  await press(p, "recorddatedfact", { values: { [f("recorddatedfact") + "-kind"]: "effective", [f("recorddatedfact") + "-value"]: "2023-01-01" } });
  assert.deepEqual(last(p, "recorddatedfact").body, { captureSha: "c1", extent: { passage: 3 }, kind: "effective", value: "2023-01-01", method: "typed", question: "INQ-1" });
  await press(p, "tabledeclare", { values: { [f("tabledeclare") + "-header"]: "reported, closed ,," }, reason: R });
  assert.deepEqual(last(p, "tabledeclare").body.source, "CNT-4");
  assert.deepEqual(last(p, "tabledeclare").body.header, ["reported", "closed"]);
  await press(p, "cite");
  const ct = last(p, "cite");
  assert.equal(ct.query.project, "INQ-1");
  assert.deepEqual(JSON.parse(ct.query.found), KINDS[5].items[0]);
  const noQ = await open("/app/find-in/PROJ-1", PLANE);
  await press(noQ, "findin", { values: { "findin-kind-term": true, "findin-term": "closed" }, reason: R });
  const b = await press(noQ, "cite");
  assert.equal(noQ.byOp("cite").length, 0);
  assert.equal(beside(noQ, b), "Choose the question to cite this in first.");
  const m = await open("/app/find-in/PROJ-1", { ...PLANE, findin: ok({ kinds: [
    { kind: "money", items: [{ as_read: "$4.2 million", capture_sha: "c", extent: { passage: 7 }, recorded: [] }] },
    { kind: "requirements", items: [{ words: "shall", capture_sha: "c", extent: {}, content_id: "CNT-1", recorded: [] }] }] }) });
  await press(m, "findin", { reason: R });
  const fm = button(m, "recordfact").dataset.f;
  await press(m, "recordfact", { values: { [fm + "-amount"]: "4200000.00", [fm + "-currency"]: "USD", [fm + "-kind"]: "expenditure", [fm + "-phase"]: "adopted", [fm + "-from"]: "2024-07-01", [fm + "-to"]: "2025-06-30" } });
  const mb = last(m, "recordfact").body;
  assert.equal(mb.as_read, "$4.2 million");
  assert.deepEqual(mb.source, { capture_sha: "c", extent: { passage: 7 } });
  assert.deepEqual(mb.period, { from: "2024-07-01", to: "2025-06-30", precision: "day" });
  assert.equal("question" in mb, false, "no question chosen, none sent");
  const fs = button(m, "standarddeclare").dataset.f;
  const empty = await press(m, "standarddeclare");
  assert.equal(m.byOp("standarddeclare").length, 0, "the member's own reason is required (interface-shell R11)");
  assert.ok(beside(m, empty));
  await press(m, "standarddeclare", { values: { [fs + "-cite"]: "AI 4.12", [fs + "-kind"]: "policy", [fs + "-issuer"]: "Public Works", [fs + "-reason"]: "the city's own rule" } });
  assert.deepEqual(last(m, "standarddeclare").body, { cite: "AI 4.12", kind: "policy", issuer: "Public Works", reason: "the city's own rule", text: ["CNT-1"] });
});

test("R5: standingquestionset keeps finding over the scope; search is \"See all in Find\"", async () => {
  const p = await shown({ standingquestionset: ok({ ok: true, id: "STQ-1" }) });
  await press(p, "standingquestionset", { values: { "findin-kind-people": false, "findin-kind-money": false, "findin-kind-dates": false, "findin-kind-requirements": false, "findin-kind-events": false, "findin-kind-term": true, "findin-term": "closed", "findin-question": "INQ-1" } });
  const b = last(p, "standingquestionset").body;
  assert.equal(b.question, "Is the city repairing reported potholes within seven days?");
  assert.deepEqual(b.find, { scope: { project: "PROJ-1" }, kinds: ["term"], term: "closed" });
  assert.equal(b.cadence, "weekly");
  assert.match(b.ends, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(text(p), /Kept: new matches will arrive in your queue as a list\./);
  const all = main(p).querySelectorAll('button[data-act="search"]');
  assert.equal(all.length, 1);
  assert.equal(all[0].dataset.term, "closed");
  assert.match(all[0].textContent, /^See all in Find/);
  await press(p, "search", { reason: R });
  assert.equal(last(p, "search").query.q, "closed");
  assert.equal(p.location.pathname, "/app/finder/closed");
});
