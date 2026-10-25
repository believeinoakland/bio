/* Find in this (R5, R24, R26) on the real served page (interface-shell's harness): the scope set by where it was opened, what to
   find, the results by kind with their words, passage and "Found by search", the one recording act each result offers
   with its fields in place, who recorded one already, keeping finding, and "See all in Find". Finding records nothing
   (K1468). Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import test from "node:test";
import assert from "node:assert/strict";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { open, ok, refused, text, ops, acts, button, press, beside, last, main, screen, word, hasWord, settle } from "./page.mjs";
import { Event } from "../interface-shell/harness.mjs";

const QUESTIONS = ok({ hits: [{ bundle_id: "INQ-1", title: "Is the city repairing reported potholes within seven days?" }] });
const SHA = "9f2c0d1e".padEnd(64, "a"); // a capture's digest: 64 hex digits, never drawn
const KINDS = [
  { kind: "people", items: [{ kind: "people", words: "The Director shall repair", capture_sha: SHA, title: "Housing code", extent: { passage: 3 }, entity: "ENT-9", recorded: [] }], count: 1, nothing: false, not_read: [] },
  { kind: "money", items: [], count: 0, nothing: true, not_read: [] },
  { kind: "dates", items: [{ kind: "dates", words: "within seven calendar days", capture_sha: SHA, title: "Housing code", extent: { passage: 3 }, date: "2023-01-01", recorded: [] },
    { kind: "dates", words: "Reported", capture_sha: "c2", title: "Work orders", extent: {}, table: true, content_id: "CNT-4", recorded: [] }], count: 2, nothing: false, not_read: [] },
  { kind: "requirements", items: [{ kind: "requirements", words: "shall repair each reported pothole", capture_sha: SHA, title: "Housing code", extent: { passage: 3 }, content_id: "CNT-1", recorded: [{ by: "Mai", at: "2026-10-03" }] }], count: 1, nothing: false, not_read: [] },
  { kind: "events", items: [], count: 0, nothing: false, not_read: [{ capture: "c7", why: "scan queued" }] },
  { kind: "term", items: [{ kind: "term", words: "closed", capture_sha: SHA, title: "Housing code", extent: { paragraph: 5 }, recorded: [] }], count: 37, truncated: true, nothing: false, not_read: [] },
];
const FOUND = ok({ ok: true, scope: { form: "project", project: "PROJ-1", captures: 14 }, kinds: KINDS });
const PROJECT_DOC = ok({ "bundle.md": '---\nobject_type: project\ntitle: "The Coliseum lease"\nobjective: "The Coliseum lease"\ncurrent_state: forming\n---\n\n## Session Log\n' });
const PQ = ok({ ok: true, project: "PROJ-1", items: [{ inquiry: "INQ-1", title: "Is the city repairing reported potholes within seven days?" }], cursor: null });
const ZONE = ok({ ok: true, count: 1, facts: [{ path: "profile.time_zone", fact: { profile: "p1", fact: "time_zone" }, status: "confirmed", governs: { value: "America/Los_Angeles", origin: "profile" } }] });
const PLANE = { memberlist: ok({ members: [{ member_id: "u-mai", handle: "Mai", status: "active" }] }), search: QUESTIONS, projectquestions: PQ, factstatus: ZONE, findin: FOUND, image: PROJECT_DOC };
const R = "looking";
const ALL_KINDS = { "findin-kind-people": true, "findin-kind-money": true, "findin-kind-dates": true, "findin-kind-requirements": true, "findin-kind-events": true, "findin-term": "closed" };
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

test("R5, R48: the member ticks what to find, with an optional term (no tick box: it applies when filled) and question; findin is sent over the scope, and records nothing", async () => {
  const p = await open("/app/find-in/PROJ-1", PLANE);
  for (const k of ["people", "money", "dates", "requirements", "events"]) assert.ok(p.doc.getElementById("findin-kind-" + k), k);
  assert.ok(!p.doc.getElementById("findin-kind-term"), "R48 (6): the term has no tick box");
  assert.ok(text(p).includes(word("screen.find-in.term.help")));
  // R48 (7): the project's questions, the first preselected, with no "None yet".
  const options = p.doc.getElementById("findin-question").querySelectorAll("option");
  assert.deepEqual(options.map((o) => o.textContent), [word("findin.question.choose"), "Is the city repairing reported potholes within seven days?"], "none preselected; no \"None yet\"");
  assert.ok(!text(p).includes(word("screen.document.cite.noquestion")));
  const nothing = await press(p, "findin", { values: { "findin-kind-people": false, "findin-kind-money": false, "findin-kind-dates": false, "findin-kind-requirements": false }, reason: R });
  assert.equal(beside(p, nothing), word("screen.find-in.kindsfirst"));
  await press(p, "findin", { values: { "findin-kind-people": true, "findin-term": " closed ", "findin-question": "INQ-1" }, reason: R });
  const r = last(p, "findin");
  assert.deepEqual({ scope: r.body.scope, kinds: r.body.kinds, term: r.body.term }, { scope: { project: "PROJ-1" }, kinds: ["people", "term"], term: "closed" }, "a filled term is found too");
  await press(p, "findin", { values: { "findin-term": "  " }, reason: R });
  assert.deepEqual(last(p, "findin").body.kinds, ["people"], "control: an empty term adds nothing");
  const sel = await open("/app/find-in/sel-abc", PLANE);
  await press(sel, "findin", { values: { "findin-kind-money": true, "findin-kind-people": false, "findin-kind-dates": false, "findin-kind-requirements": false }, reason: R });
  assert.deepEqual(last(sel, "findin").body.scope, { selection: "sel-abc" });
  assert.deepEqual(last(sel, "findin").body.kinds, ["money"]);
  const doc = await open("/app/find-in/9f2c", PLANE);
  await press(doc, "findin", { reason: R });
  assert.deepEqual(last(doc, "findin").body.scope, { capture: "9f2c" });
  // Finding records nothing (K1468): the op is a read, and its answer is kept in the screen's page memory only.
  assert.equal(OPS.findin.mutating, false);
  // R48 (7): a project with no question says to open one first.
  const none = await open("/app/find-in/PROJ-1", { ...PLANE, projectquestions: ok({ ok: true, project: "PROJ-1", items: [], cursor: null }) });
  assert.ok(text(none).includes(word("screen.document.cite.noquestion")));
  assert.ok(!none.doc.getElementById("findin-question"));
});

test("R48 (7), C35: with no project scope the questions are listed with their project's name, so two questions alike in title are told apart; a question listed once is listed once", async () => {
  const TWINS = ok({ hits: [{ bundle_id: "INQ-1", title: "Is the city repairing potholes?" }, { bundle_id: "INQ-2", title: "Is the city repairing potholes?" }, { bundle_id: "INQ-3", title: "Who approved the lease?" }] });
  const projects = ok({ ok: true, projects: [{ id: "PROJ-1", name: "Potholes on Fruitvale", stage: "forming" }, { id: "PROJ-2", name: "Potholes on Foothill", stage: "forming" }, { id: "PROJ-3", name: "The Coliseum lease", stage: "forming" }] });
  const byProject = { "PROJ-1": ["INQ-1"], "PROJ-2": ["INQ-2"], "PROJ-3": ["INQ-3"] };
  const plane = { ...PLANE, search: TWINS, projectlist: projects, projectquestions: (req) => ok({ ok: true, project: req.query.project, items: byProject[req.query.project].map((inquiry) => ({ inquiry, title: "x" })), cursor: null }) };
  for (const path of ["/app/find-in/sel-abc", "/app/find-in/" + SHA]) {
    const p = await open(path, plane);
    const options = p.doc.getElementById("findin-question").querySelectorAll("option").filter((o) => o.getAttribute("value"));
    assert.deepEqual(options.map((o) => o.getAttribute("value")), ["INQ-1", "INQ-2", "INQ-3"], "each question once");
    assert.deepEqual(options.map((o) => o.textContent), ["Is the city repairing potholes? · Potholes on Fruitvale", "Is the city repairing potholes? · Potholes on Foothill", "Who approved the lease? · The Coliseum lease"], "each with its project's name");
  }
  // Control: a project that is not read (the plane answers it no questions) leaves the question as its title alone, listed once; a project scope lists its own questions as before.
  const lone = await open("/app/find-in/sel-abc", { ...PLANE, search: QUESTIONS, projectlist: ok({ ok: true, projects: [] }) });
  assert.deepEqual(lone.doc.getElementById("findin-question").querySelectorAll("option").filter((o) => o.getAttribute("value")).map((o) => o.textContent), ["Is the city repairing reported potholes within seven days?"]);
  const inProject = await open("/app/find-in/PROJ-1", PLANE);
  assert.deepEqual(inProject.doc.getElementById("findin-question").querySelectorAll("option").map((o) => o.textContent), [word("findin.question.choose"), "Is the city repairing reported potholes within seven days?"]);
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
  assert.ok(text(p, sections(p)[4]).includes(word("screen.find-in.notread.one")), "R25: one document, the singular key");
  assert.doesNotMatch(text(p), /\b[0-9a-f]{12}\b|[0-9a-f]{64}/, "R26 control: no drawn text is a digest or a 12-hex label");
  // A result whose answer carries no title is not named by its digest: its passage alone.
  const bare = await shown({ findin: ok({ kinds: [{ kind: "term", items: [{ words: "closed", capture_sha: SHA, extent: { passage: 2 }, recorded: [] }], count: 1 }], term: "closed" }) });
  assert.doesNotMatch(text(bare), /[0-9a-f]{12}/);
  assert.ok(text(bare).includes(word("screen.find-in.passage", { n: "2" })));
});

test("R5: each result offers only the recording act of its kind; one already recorded shows who recorded it", async () => {
  const p = await shown();
  const recs = acts(p).filter(([, d]) => d.k !== undefined).map(([op, d]) => `${d.k}.${d.i}:${op}`);
  assert.deepEqual(recs, ["0.0:recordpersonfact", "2.0:recorddatedfact", "2.1:tabledeclare", "3.0:standarddeclare", "5.0:cite"], "R48 (5): a recorded passage keeps its act");
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
  assert.deepEqual(last(p, "recordpersonfact").body, { person: "ENT-9", kind: "locality", value: "Oakland", valid: { from: null, to: null, precision: "day", zone: "America/Los_Angeles" },
    citation: { capture_sha: SHA, extent: { passage: 3 } }, question: "INQ-1" });
  await press(p, "recorddatedfact", { values: { [f("recorddatedfact") + "-kind"]: "effective", [f("recorddatedfact") + "-value"]: "2023-01-01" } });
  assert.deepEqual(last(p, "recorddatedfact").body, { captureSha: SHA, extent: { passage: 3 }, kind: "effective", value: "2023-01-01", method: "typed", question: "INQ-1" });
  await press(p, "tabledeclare", { values: { [f("tabledeclare") + "-header"]: "reported, closed ,," }, reason: R });
  assert.deepEqual(last(p, "tabledeclare").body.source, "CNT-4");
  assert.deepEqual(last(p, "tabledeclare").body.header, ["reported", "closed"]);
  const m = await open("/app/find-in/PROJ-1", { ...PLANE, projectquestions: ok({ ok: true, project: "PROJ-1", items: [], cursor: null }), findin: ok({ kinds: [
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
  assert.equal(last(against, "cite").query.role, "cuts_against", "\"against\" is the question's role cuts_against (citation R1)");
  // The question is still required first.
  const noQ = await open("/app/find-in/PROJ-1", PLANE);
  await press(noQ, "findin", { values: { "findin-term": "closed" }, reason: R });
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
  await press(p, "standingquestionset", { values: { "findin-kind-people": false, "findin-kind-money": false, "findin-kind-dates": false, "findin-kind-requirements": false, "findin-kind-events": false, "findin-term": "closed", "findin-question": "INQ-1" } });
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
  assert.equal(last(p, "search").query.q, "closed", "Find's own read of the term sends the words to the fields route (R56)");
  assert.equal(p.location.pathname, "/app/finder/closed");
});

test("R34: every key find-in reads is a word of the list, and the cite choice's words are keys", () => {
  for (const k of screen("find-in").words) assert.ok(hasWord(k), k);
  for (const k of ["screen.findin.cite.supports", "screen.findin.cite.against", "screen.findin.cite.norole"]) assert.ok(screen("find-in").words.includes(k), k);
});

test("R38 (K3562): opened from a document by its record id, the search is scoped by its capture's fingerprint from its provenance, never the record id", async () => {
  const provenance = JSON.stringify({ documents: [{ capture: { sha256: SHA } }] });
  const p = await open("/app/find-in/INFO-7", { ...PLANE, image: ok({ "data/provenance.json": provenance }) });
  await press(p, "findin", { values: { ...ALL_KINDS, "findin-question": "INQ-1" }, reason: R });
  assert.deepEqual(last(p, "findin").body.scope, { capture: SHA }, "the fingerprint, not the record id");
  assert.ok(!JSON.stringify(last(p, "findin").body).includes("INFO-7"), "the record id is never sent");
  // Control: a fingerprint opened as the subject is sent as it is.
  const d = await open("/app/find-in/" + SHA, PLANE);
  await press(d, "findin", { reason: R });
  assert.deepEqual(last(d, "findin").body.scope, { capture: SHA });
});

test("R39 (K3562): after a search with a question chosen, a passage result draws the cite act for that question; the chosen question stays chosen", async () => {
  const recorded = ok({ ok: true, scope: { form: "project", project: "PROJ-1", captures: 14 }, kinds: [
    { kind: "term", items: [{ kind: "term", words: "closed", capture_sha: SHA, title: "Housing code", extent: { paragraph: 5 }, recorded: [{ by: "Mai" }] }], count: 1, nothing: false, not_read: [] }] });
  const p = await open("/app/find-in/PROJ-1/INQ-1", { ...PLANE, findin: recorded });
  await press(p, "findin", { values: { ...ALL_KINDS, "findin-question": "INQ-1" }, reason: R });
  const cite = button(p, "cite");
  assert.ok(cite, "a passage result draws Cite in the question, though recorded");
  assert.ok(text(p, sections(p)[0]).includes(word("screen.find-in.recorded", { who: "Mai" })), "and shows who recorded it");
  await press(p, "cite", { values: { [cite.dataset.f + "-role-supports"]: true } });
  assert.equal(last(p, "cite").query.question, "INQ-1", "for the question chosen");
  // Control: a question the list does not name is still drawn as chosen, not as "None yet".
  const off = await open("/app/find-in/PROJ-1/INQ-9", { ...PLANE, search: ok({ hits: [] }), findin: recorded });
  assert.ok(off.doc.getElementById("findin-question").querySelectorAll("option").some((o) => o.getAttribute("value") === "INQ-9"));
});

test("R5, R26 (R17a, fix round 10, G3): a term item says which part of the document it lies in: a footnote's hit names the footnote, a body hit, an item stored without a kind and an unknown kind name none", async () => {
  // fixtures-contract: retrieval-browse findin-term-part
  const PART_KIND = "content.part_kind."; // content's own rows (the nearest held words), keyed by the part kind
  const item = (words, part) => ({ kind: "term", words, capture_sha: SHA, title: "Housing code", extent: { paragraph: 5 }, part, recorded: [] });
  const term = { kind: "term", items: [item("in the footnote", "footnote"), item("in the main text", "body"), item("before the kind", null), item("in a header", "header"), item("a kind we do not know", "margin_scribble")], count: 5, nothing: false, not_read: [] };
  const p = await shown({ findin: ok({ ok: true, scope: { form: "project", project: "PROJ-1", captures: 14 }, kinds: [term] }) });
  const rows = main(p).querySelectorAll(".cs-row");
  assert.equal(rows.length, 5);
  const named = rows.map((r) => r.querySelectorAll("[data-part-kind]").map((e) => e.getAttribute("data-part-kind")));
  assert.deepEqual(named, [["footnote"], [], [], ["header"], []], "the footnote and the header say so; a body hit, an unkeyed item and an unknown kind say none");
  assert.ok(text(p, rows[0]).includes(word(PART_KIND + "footnote")) && text(p, rows[3]).includes(word(PART_KIND + "header")));
  assert.ok(!text(p, rows[1]).includes(word(PART_KIND + "body")), "control: a body hit is not told as a part");
});
