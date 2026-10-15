/* Find in this (R5, R24, R26) on the real served page (interface-shell's harness): the scope set by where it was opened, what to
   find, the results by kind with their words, passage and "Found by search", the one recording act each result offers
   with its fields in place, who recorded one already, keeping finding, and "See all in Find". Finding records nothing
   (K1468). Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import test from "node:test";
import assert from "node:assert/strict";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { open, ok, refused, text, ops, acts, button, press, beside, last, main, screen, word, hasWord, settle } from "./page.mjs";

const QUESTIONS = ok({ hits: [{ bundle_id: "INQ-1", title: "Is the city repairing reported potholes within seven days?" }] });
const SHA = "9f2c0d1e".padEnd(64, "a"); // a capture's digest: 64 hex digits, never drawn
const KINDS = [
  { kind: "people", items: [{ kind: "people", words: "The Director shall repair", capture_sha: SHA, title: "Housing code", extent: { passage: 3 }, entity: "ENT-9", recorded: [] }], count: 1, nothing: false, not_read: [] },
  { kind: "money", items: [], count: 0, nothing: true, not_read: [] },
  { kind: "dates", items: [{ kind: "dates", words: "within seven calendar days", capture_sha: SHA, title: "Housing code", extent: { passage: 3 }, date: "2023-01-01", recorded: [] },
    { kind: "dates", words: "Reported", capture_sha: "c2", title: "Work orders", extent: {}, table: true, content_id: "CNT-4", recorded: [] }], count: 2, nothing: false, not_read: [] },
  { kind: "requirements", items: [{ kind: "requirements", words: "shall repair each reported pothole", capture_sha: SHA, title: "Housing code", extent: { passage: 3 }, content_id: "CNT-1", recorded: [{ by: "Mai", at: "2026-10-03" }] }], count: 1, nothing: false, not_read: [] },
  { kind: "events", items: [], count: 0, nothing: false, not_read: [{ capture: "c7", why: "not read yet" }] },
  { kind: "term", items: [{ kind: "term", words: "closed", capture_sha: SHA, title: "Housing code", extent: { paragraph: 5 }, recorded: [] }], count: 37, truncated: true, nothing: false, not_read: [] },
];
const FOUND = ok({ ok: true, scope: { form: "project", project: "PROJ-1", captures: 14 }, kinds: KINDS });
const PROJECT_DOC = ok({ "bundle.md": '---\nobject_type: project\ntitle: "The Coliseum lease"\nobjective: "The Coliseum lease"\ncurrent_state: forming\n---\n\n## Session Log\n' });
const PLANE = { search: QUESTIONS, findin: FOUND, image: PROJECT_DOC };
const R = "looking";
const ALL_KINDS = { "findin-kind-people": true, "findin-kind-money": true, "findin-kind-dates": true, "findin-kind-requirements": true, "findin-kind-events": true, "findin-kind-term": true, "findin-term": "closed" };
const shown = async (plane = {}) => {
  const p = await open("/app/find-in/PROJ-1", { ...PLANE, ...plane });
  await press(p, "findin", { values: { ...ALL_KINDS, "findin-question": "INQ-1" }, reason: R });
  return p;
};
const sections = (p) => main(p).querySelectorAll("section.mk-sec");
const kindName = (k) => word(`screen.find-in.kind.${k}`);

test("R5, R26: the scope is set by where it was opened (a document, the held set, a project) and shown under \"Look in\", by its title and never its address", async () => {
  const held = await open("/app/find-in/sel-abc", PLANE);
  assert.ok(text(held).includes(word("screen.find-in.lookin") + " " + word("screen.find-in.scope.held")));
  const doc0 = await open("/app/find-in/" + SHA, PLANE);
  assert.ok(text(doc0).includes(word("screen.find-in.lookin") + " " + word("screen.find-in.scope.document")), "a document not yet titled: \"This document\", never its digest");
  const proj = await open("/app/find-in/PROJ-1", PLANE);
  assert.ok(main(proj).querySelectorAll(".cs-card, a.cs-ref").some((e) => e.textContent === "The Coliseum lease"), "the project by its title");
  assert.ok(!text(proj).includes("PROJ-1"), "never by its address");
  await press(proj, "findin", { reason: R });
  assert.ok(text(proj).includes(word("screen.find-in.scope.project", { project: "The Coliseum lease", count: "14" })), "once the answer says how many documents it holds");
  const crumbs = text(proj, main(proj).querySelector("nav.cs-crumbs"));
  assert.ok(crumbs.includes("The Coliseum lease") && crumbs.includes(word("screen.find-in.name")) && !crumbs.includes("PROJ-1"), "the path's project step (interface-shell R8), by its title");
  // A document is named by the title its answer carries, once it has answered; before that, "This document", never its digest.
  const doc = await open("/app/find-in/" + SHA, { ...PLANE, findin: ok({ scope: { form: "capture", title: "Housing code" }, kinds: [] }) });
  assert.doesNotMatch(text(doc), /[0-9a-f]{12}/, "no digest before the answer");
  await press(doc, "findin", { reason: R });
  assert.ok(main(doc).querySelectorAll(".cs-card, a.cs-ref").some((e) => e.textContent === "Housing code"), "the document by its title");
  assert.ok(text(doc).includes(word("screen.find-in.scope.this", { document: "Housing code" })));
  assert.doesNotMatch(text(doc), /[0-9a-f]{12}/);
  // R21 (interface-shell R61): opened with no scope, "Nothing is here", with the way back, and nothing else of the screen.
  const none = await open("/app/find-in", PLANE);
  assert.ok(text(none).includes(word("shell.unavailable.nothing.title") + word("screen.find-in.scope.none") + word("shell.unavailable.home")));
  assert.ok(main(none).querySelector('a[href="/app"]'));
  assert.deepEqual(ops(none), []);
  assert.ok(!main(none).querySelector("fieldset, select, input"));
});

test("R5: the member ticks what to find, with an optional term and question; findin is sent over the scope, and records nothing", async () => {
  const p = await open("/app/find-in/PROJ-1", PLANE);
  for (const k of ["people", "money", "dates", "requirements", "events", "term"]) assert.ok(p.doc.getElementById("findin-kind-" + k), k);
  assert.equal(p.doc.getElementById("findin-question").querySelectorAll("option")[1].textContent, "Is the city repairing reported potholes within seven days?");
  const nothing = await press(p, "findin", { values: { "findin-kind-people": false, "findin-kind-money": false, "findin-kind-dates": false, "findin-kind-requirements": false }, reason: R });
  assert.equal(beside(p, nothing), word("screen.find-in.kindsfirst"));
  const noTerm = await press(p, "findin", { values: { "findin-kind-term": true, "findin-term": " " }, reason: R });
  assert.equal(beside(p, noTerm), word("screen.find-in.termfirst"));
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

test("R5, R26: results by kind, each with its words as written, its document's title, its passage and Found by search; a kind with none says \"Nothing here\"", async () => {
  const p = await shown();
  const heads = sections(p).map((s) => s.querySelector("h2").textContent);
  assert.deepEqual(heads, [word("screen.find-in.section", { kind: kindName("people"), n: "1" }), kindName("money"), word("screen.find-in.section", { kind: kindName("dates"), n: "2" }),
    word("screen.find-in.section", { kind: kindName("requirements"), n: "1" }), kindName("events"), word("screen.find-in.termsection", { term: "closed", n: "37" })]);
  const first = text(p, sections(p)[0]);
  assert.ok(first.includes(word("screen.find-in.quote", { words: "The Director shall repair" })) && first.includes("Housing code") && first.includes(word("screen.find-in.passage", { n: "3" })), "its words, its document's title and its place in it");
  assert.ok(text(p, sections(p)[5]).includes(word("screen.find-in.passage", { n: "5" })));
  assert.equal(main(p).querySelectorAll('.cs-row > .cs-origin[data-origin="search"]').length, 5);
  assert.ok(text(p, sections(p)[1]).includes(word("screen.find-in.nothing")));
  assert.ok(!text(p, sections(p)[4]).includes(word("screen.find-in.nothing")), "not \"nothing\" while documents were not read");
  assert.ok(text(p, sections(p)[4]).includes(word("screen.find-in.notread", { n: "1" })));
  assert.doesNotMatch(text(p), /\b[0-9a-f]{12}\b|[0-9a-f]{64}/, "R26 control: no drawn text is a digest or a 12-hex label");
  // A result whose answer carries no title is not named by its digest: its passage alone.
  const bare = await shown({ findin: ok({ kinds: [{ kind: "term", items: [{ words: "closed", capture_sha: SHA, extent: { passage: 2 }, recorded: [] }], count: 1 }], term: "closed" }) });
  assert.doesNotMatch(text(bare), /[0-9a-f]{12}/);
  assert.ok(text(bare).includes(word("screen.find-in.passage", { n: "2" })));
});

test("R5: each result offers only the recording act of its kind; one already recorded shows who recorded it", async () => {
  const p = await shown();
  const recs = acts(p).filter(([, d]) => d.k !== undefined).map(([op, d]) => `${d.k}.${d.i}:${op}`);
  assert.deepEqual(recs, ["0.0:recordpersonfact", "2.0:recorddatedfact", "2.1:tabledeclare", "5.0:cite"]);
  assert.ok(text(p, sections(p)[3]).includes(word("screen.find-in.recorded", { who: "Mai" })));
  assert.ok(sections(p)[3].querySelector('.cs-origin[data-origin="accepted"]'));
  const more = await open("/app/find-in/PROJ-1", { ...PLANE, findin: ok({ kinds: [
    { kind: "money", items: [{ words: "$4.2 million", capture_sha: "c", extent: {}, recorded: [] }] },
    { kind: "requirements", items: [{ words: "shall", capture_sha: "c", extent: {}, recorded: [] }] },
    { kind: "events", items: [{ words: "met on", capture_sha: "c", extent: {}, recorded: [] }] }] }) });
  await press(more, "findin", { reason: R });
  assert.deepEqual(acts(more).filter(([, d]) => d.k !== undefined).map(([op]) => op), ["recordfact", "standarddeclare", "recorddatedfact"]);
  for (const [op] of acts(more).filter(([, d]) => d.k !== undefined))
    assert.ok(button(more, op).closest("details.mk-details"), `${op}'s fields are drawn in place with it`);
});

test("R5: each recording act sends its owner's body from the result's passage and the member's fields, the chosen question kept beside it", async () => {
  const p = await shown();
  const f = (op) => button(p, op).dataset.f;
  await press(p, "recordpersonfact", { values: { [f("recordpersonfact") + "-kind"]: "locality", [f("recordpersonfact") + "-value"]: "Oakland" } });
  assert.deepEqual(last(p, "recordpersonfact").body, { person: "ENT-9", kind: "locality", value: "Oakland", citation: { capture_sha: SHA, extent: { passage: 3 } }, question: "INQ-1" });
  await press(p, "recorddatedfact", { values: { [f("recorddatedfact") + "-kind"]: "effective", [f("recorddatedfact") + "-value"]: "2023-01-01" } });
  assert.deepEqual(last(p, "recorddatedfact").body, { captureSha: SHA, extent: { passage: 3 }, kind: "effective", value: "2023-01-01", method: "typed", question: "INQ-1" });
  await press(p, "tabledeclare", { values: { [f("tabledeclare") + "-header"]: "reported, closed ,," }, reason: R });
  assert.deepEqual(last(p, "tabledeclare").body.source, "CNT-4");
  assert.deepEqual(last(p, "tabledeclare").body.header, ["reported", "closed"]);
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

test("R24: \"Cite in the question\" asks whether the passage supports the question or cuts against it, none preselected, and sends cite with that role, the question and the found passage", async () => {
  const p = await shown();
  const cite = button(p, "cite");
  assert.equal(cite.closest("details").querySelector("summary").textContent, word("act.cite.label.find-in"));
  const radios = p.doc.getElementById(cite.dataset.f + "-role").querySelectorAll("input[type=radio]");
  assert.deepEqual(radios.map((r) => r.value), ["supports", "against"]);
  assert.deepEqual(radios.map((r) => !!r.checked), [false, false], "none preselected");
  const labels = p.doc.getElementById(cite.dataset.f + "-role").querySelectorAll("label").map((l) => l.textContent.trim());
  assert.deepEqual(labels, [word("screen.findin.cite.supports"), word("screen.findin.cite.against")]);
  // Control: with no role chosen, nothing is sent, and the member is told in place.
  const none = await press(p, "cite");
  assert.equal(p.byOp("cite").length, 0);
  assert.equal(beside(p, none), word("screen.findin.cite.norole"));
  await press(p, "cite", { values: { [cite.dataset.f + "-role-supports"]: true } });
  const ct = last(p, "cite");
  assert.deepEqual([ct.query.role, ct.query.project, ct.query.question], ["supports", "INQ-1", "INQ-1"]);
  assert.deepEqual(JSON.parse(ct.query.found), KINDS[5].items[0]);
  const against = await shown();
  await press(against, "cite", { values: { [button(against, "cite").dataset.f + "-role-against"]: true } });
  assert.equal(last(against, "cite").query.role, "against");
  // The question is still required first.
  const noQ = await open("/app/find-in/PROJ-1", PLANE);
  await press(noQ, "findin", { values: { "findin-kind-term": true, "findin-term": "closed" }, reason: R });
  const b = await press(noQ, "cite", { values: { [button(noQ, "cite").dataset.f + "-role-supports"]: true } });
  assert.equal(noQ.byOp("cite").length, 0);
  assert.equal(beside(noQ, b), word("screen.find-in.questionfirst"));
});

test("R5 (K3372): /app/find-in/<scope>/<question> opens with that question chosen, and a cite from it carries the question", async () => {
  const p = await open("/app/find-in/PROJ-1/INQ-1", PLANE);
  await settle();
  const chosen = (q) => q.doc.getElementById("findin-question").querySelectorAll("option").filter((o) => o.getAttribute("selected") !== null).map((o) => o.getAttribute("value"));
  assert.deepEqual(chosen(p), ["INQ-1"], "the question the route names is the one chosen");
  assert.ok(text(p).includes(word("screen.find-in.lookin")));
  // (The document stand-in keeps no select's value from its selected option; a browser's select holds the one the route chose.)
  await press(p, "findin", { values: { ...ALL_KINDS, "findin-question": "INQ-1" }, reason: R });
  assert.deepEqual(last(p, "findin").body.scope, { project: "PROJ-1" }, "the scope is the first step alone");
  const cite = button(p, "cite");
  await press(p, "cite", { values: { [cite.dataset.f + "-role-supports"]: true } });
  assert.deepEqual([last(p, "cite").query.project, last(p, "cite").query.question], ["INQ-1", "INQ-1"]);
  const doc = await open("/app/find-in/" + SHA + "/INQ-1", PLANE);
  await press(doc, "findin", { reason: R });
  assert.deepEqual(last(doc, "findin").body.scope, { capture: SHA });
  // Control: with no second step, no question is chosen.
  const none = await open("/app/find-in/PROJ-1", PLANE);
  await settle();
  assert.deepEqual(chosen(none), [""], "control: with no second step, none is chosen");
});

test("R5: standingquestionset keeps finding over the scope; search is \"See all in Find\"", async () => {
  const p = await shown({ standingquestionset: ok({ ok: true, id: "STQ-1" }) });
  await press(p, "standingquestionset", { values: { "findin-kind-people": false, "findin-kind-money": false, "findin-kind-dates": false, "findin-kind-requirements": false, "findin-kind-events": false, "findin-kind-term": true, "findin-term": "closed", "findin-question": "INQ-1" } });
  const b = last(p, "standingquestionset").body;
  assert.equal(b.question, "Is the city repairing reported potholes within seven days?");
  assert.deepEqual(b.find, { scope: { project: "PROJ-1" }, kinds: ["term"], term: "closed" });
  assert.equal(b.cadence, "weekly");
  assert.match(b.ends, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(text(p).includes(word("screen.find-in.keeping")));
  const all = main(p).querySelectorAll('button[data-act="search"]');
  assert.equal(all.length, 1);
  assert.equal(all[0].dataset.term, "closed");
  assert.ok(all[0].textContent.startsWith(word("act.search.label.find-in")));
  await press(p, "search", { reason: R });
  assert.equal(last(p, "search").query.q, "closed");
  assert.equal(p.location.pathname, "/app/finder/closed");
});

test("R34: every key find-in reads is a word of the list, and the cite choice's words are keys", () => {
  for (const k of screen("find-in").words) assert.ok(hasWord(k), k);
  for (const k of ["screen.findin.cite.supports", "screen.findin.cite.against", "screen.findin.cite.norole"]) assert.ok(screen("find-in").words.includes(k), k);
});
