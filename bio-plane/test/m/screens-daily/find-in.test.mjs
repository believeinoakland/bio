/* Find in this (R5) at the module's interface, over the stand-in kit: the scope set by where it was opened, what to find,
   the results by kind with their words, passage and "Found by search", the one recording act each result offers, who
   recorded one already, keeping finding, and "See all in Find". Finding itself records nothing (K1468). */
import test from "node:test";
import assert from "node:assert/strict";
import { SCREENS } from "../../../src/screens-daily/index.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { kit, viewOf, ops, drawn, keys, text } from "./kit.mjs";

const findIn = SCREENS.find((s) => s.id === "find-in");
const QUESTIONS = { hits: [{ bundle_id: "INQ-1", title: "Is the city repairing reported potholes within seven days?" }] };
const FOUND = {
  ok: true, scope: { form: "project", project: "PROJ-1", captures: 14 },
  kinds: [
    { kind: "people", items: [{ kind: "people", words: "The Director shall repair", capture_sha: "c1", extent: { passage: 3 }, entity: "ENT-9", recorded: [] }], count: 1, nothing: false, not_read: [] },
    { kind: "money", items: [], count: 0, nothing: true, not_read: [] },
    { kind: "dates", items: [{ kind: "dates", words: "within seven calendar days", capture_sha: "c1", extent: { passage: 3 }, date: "2023-01-01", recorded: [] },
      { kind: "dates", words: "Reported", capture_sha: "c2", extent: {}, table: true, content_id: "CNT-4", recorded: [] }], count: 2, nothing: false, not_read: [] },
    { kind: "requirements", items: [{ kind: "requirements", words: "shall repair each reported pothole", capture_sha: "c1", extent: { passage: 3 }, content_id: "CNT-1", recorded: [{ by: "Mai", at: "2026-10-03" }] }], count: 1, nothing: false, not_read: [] },
    { kind: "events", items: [], count: 0, nothing: false, not_read: [{ capture: "c7", why: "not read yet" }] },
    { kind: "term", items: [{ kind: "term", words: "closed", capture_sha: "c1", extent: { paragraph: 5 }, recorded: [] }], count: 37, truncated: true, nothing: false, not_read: [] },
  ],
};

test("R5: the scope is set by where it was opened (a document, the held set, a project) and shown under \"Look in\"", () => {
  const forms = { "PROJ-1": "project", "sel-abc": "held", "9f2c0d": "document" };
  for (const [subject, form] of Object.entries(forms)) {
    const html = kit().render(findIn, viewOf({ subject, data: { questions: QUESTIONS } }));
    assert.ok(keys(html).includes("screen.find-in.lookin"));
    assert.ok(keys(html).includes(`screen.find-in.scope.${form}`), form);
  }
  assert.match(kit().render(findIn, viewOf({ subject: "PROJ-1", data: { questions: QUESTIONS } })), /href="\/app\/project\/PROJ-1"/);
  assert.deepEqual(findIn.place(viewOf({ subject: "PROJ-1" })), { project: { id: "PROJ-1", title: "PROJ-1" } });
  assert.equal(findIn.place(viewOf({ subject: "sel-abc" })), null);
  // Opened from nowhere: "Nothing here" with where to open it from, and nothing to act on.
  const none = kit().render(findIn, viewOf({ data: { questions: QUESTIONS } }));
  assert.ok(keys(none).includes("state.empty") && keys(none).includes("screen.find-in.scope.none"));
  assert.deepEqual(ops(none), []);
  assert.deepEqual(kit().send(findIn, "findin", viewOf()), { refuse: "screen.find-in.scope.none" });
});

test("R5: the member ticks what to find, with an optional term and question; findin is sent over the scope", () => {
  const html = kit().render(findIn, viewOf({ subject: "PROJ-1", data: { questions: QUESTIONS } }));
  for (const k of ["people", "money", "dates", "requirements", "events", "term"]) assert.match(html, new RegExp(`id="findin-kind-${k}"`));
  assert.match(html, /<option value="INQ-1">Is the city repairing/);
  const values = { "findin-kind-people": true, "findin-kind-term": "on", "findin-term": " closed ", "findin-question": "INQ-1" };
  const k = kit({ values });
  const v = viewOf({ subject: "PROJ-1", data: { questions: QUESTIONS } });
  assert.deepEqual(k.send(findIn, "findin", v), { body: { scope: { project: "PROJ-1" }, kinds: ["people", "term"], term: "closed" } });
  assert.equal(v.ui.question, "INQ-1");
  assert.deepEqual(kit({ values: { "findin-kind-people": true } }).send(findIn, "findin", viewOf({ subject: "sel-abc" })).body.scope, { selection: "sel-abc" });
  assert.deepEqual(kit({ values: { "findin-kind-money": true } }).send(findIn, "findin", viewOf({ subject: "9f2c" })).body, { scope: { capture: "9f2c" }, kinds: ["money"] });
  assert.deepEqual(kit().send(findIn, "findin", viewOf({ subject: "PROJ-1" })), { refuse: "screen.find-in.kindsfirst" });
  assert.deepEqual(kit({ values: { "findin-kind-term": true } }).send(findIn, "findin", viewOf({ subject: "PROJ-1" })), { refuse: "screen.find-in.termfirst" });
  // Finding records nothing (K1468): the op is a read, and its answer is kept in the screen's page memory only.
  assert.equal(OPS.findin.mutating, false);
  k.done(findIn, "findin", v, FOUND);
  assert.equal(v.ui.found.kinds.length, 6);
  assert.deepEqual(findIn.acts.find((a) => a.op === "findin").rereads, []);
});

const shown = () => {
  const v = viewOf({ subject: "PROJ-1", data: { questions: QUESTIONS }, ui: { found: { kinds: FOUND.kinds, term: "closed" }, question: "INQ-1" } });
  return { v, html: kit().render(findIn, v) };
};

test("R5: results by kind, each with its words as written, its passage and Found by search; a kind with none says \"Nothing here\"", () => {
  const { html } = shown();
  const heads = [...html.matchAll(/<h2>(.*?)<\/h2>/g)].map((m) => text(m[1]));
  assert.deepEqual(heads, ["People and offices your group follows · 1", "Money figures · 0", "Dates and deadlines · 2", "Requirements: what someone shall or must do · 1", "Events in minutes and agendas · 0", "“closed” · 37"]);
  assert.match(text(html), /“The Director shall repair” passage 3/);
  assert.match(text(html), /“closed” passage 5/);
  assert.equal((html.match(/data-mark="origin.search"/g) || []).length, 5);
  const money = html.split("<h2>")[2];
  assert.ok(keys(money).includes("screen.find-in.nothing"));
  const events = html.split("<h2>")[5];
  assert.ok(!keys(events).includes("screen.find-in.nothing"), "not \"nothing\" while documents were not read");
  assert.ok(keys(events).includes("screen.find-in.notread"));
});

test("R5: each result offers only the recording act of its kind; one already recorded shows who recorded it", () => {
  const { html } = shown();
  const acts = drawn(html).filter(([, d]) => d.k !== undefined).map(([op, d]) => `${d.k}.${d.i}:${op}`);
  assert.deepEqual(acts, ["0.0:recordpersonfact", "2.0:recorddatedfact", "2.1:tabledeclare", "5.0:cite"]);
  for (const [op, d] of drawn(html)) if (d.k !== undefined) assert.equal(d.label, `act.${op}.label.find-in`);
  const req = html.split("<h2>")[4];
  assert.match(text(req), /Recorded by Mai/);
  assert.match(req, /data-mark="origin.accepted"/);
  // Money and requirements results offer theirs.
  const more = { kinds: [{ kind: "money", items: [{ words: "$4.2 million", capture_sha: "c", extent: {}, recorded: [] }] }, { kind: "requirements", items: [{ words: "shall", capture_sha: "c", extent: {}, recorded: [] }] }, { kind: "events", items: [{ words: "met on", capture_sha: "c", extent: {}, recorded: [] }] }] };
  assert.deepEqual(ops(kit().render(findIn, viewOf({ subject: "PROJ-1", ui: { found: more } }))).filter((o) => !["findin", "standingquestionset"].includes(o)), ["recordfact", "standarddeclare", "recorddatedfact"]);
});

test("R5: each recording act sends its owner's body from the result's passage, the chosen question kept beside it", () => {
  const { v } = shown();
  const k = kit();
  const pf = k.send(findIn, "recordpersonfact", v, { k: "0", i: "0" }, { fields: { kind: "locality", value: "Oakland" } });
  assert.deepEqual(pf, { body: { person: "ENT-9", kind: "locality", value: "Oakland", citation: { capture_sha: "c1", extent: { passage: 3 } }, question: "INQ-1" } });
  const df = k.send(findIn, "recorddatedfact", v, { k: "2", i: "0" }, { fields: { kind: "effective", value: "2023-01-01" } });
  assert.deepEqual(df, { body: { captureSha: "c1", extent: { passage: 3 }, kind: "effective", value: "2023-01-01", method: "typed", question: "INQ-1" } });
  const sd = k.send(findIn, "standarddeclare", v, { k: "3", i: "0" }, { fields: { cite: "AI 4.12", kind: "policy", issuer: "Public Works", reason: "the city's own rule" } });
  assert.deepEqual(sd, { body: { cite: "AI 4.12", kind: "policy", issuer: "Public Works", reason: "the city's own rule", text: ["CNT-1"] } });
  assert.equal(findIn.acts.find((a) => a.op === "standarddeclare").reasonField, "reason");
  const td = k.send(findIn, "tabledeclare", v, { k: "2", i: "1" }, { fields: { header: "reported, closed ,," } });
  assert.deepEqual(td, { body: { source: "CNT-4", header: ["reported", "closed"] } });
  const ct = k.send(findIn, "cite", v, { k: "5", i: "0" });
  assert.deepEqual(ct.query.project, "INQ-1");
  assert.deepEqual(JSON.parse(ct.query.found), FOUND.kinds[5].items[0]);
  const noQ = viewOf({ subject: "PROJ-1", ui: { found: { kinds: FOUND.kinds } } });
  assert.deepEqual(k.send(findIn, "cite", noQ, { k: "5", i: "0" }), { refuse: "screen.find-in.questionfirst" });
  const mf = kit().send(findIn, "recordfact", viewOf({ subject: "PROJ-1", ui: { found: { kinds: [{ kind: "money", items: [{ as_read: "$4.2 million", capture_sha: "c", extent: { passage: 7 } }] }] } } }),
    { k: "0", i: "0" }, { fields: { amount: "4200000.00", currency: "USD", kind: "expenditure", phase: "adopted", from: "2024-07-01", to: "2025-06-30" } });
  assert.equal(mf.body.as_read, "$4.2 million");
  assert.deepEqual(mf.body.source, { capture_sha: "c", extent: { passage: 7 } });
  assert.deepEqual(mf.body.period, { from: "2024-07-01", to: "2025-06-30", precision: "day" });
  assert.equal("question" in mf.body, false, "no question chosen, none sent");
  assert.equal(k.send(findIn, "recordpersonfact", v, { k: "9", i: "0" }, { fields: {} }), null, "control: a result no longer shown sends nothing");
});

test("R5: standingquestionset keeps finding over the scope; search is \"See all in Find\"", () => {
  const values = { "findin-kind-term": true, "findin-term": "closed", "findin-question": "INQ-1" };
  const v = viewOf({ subject: "PROJ-1", data: { questions: QUESTIONS } });
  const k = kit({ values });
  const sent = k.send(findIn, "standingquestionset", v);
  assert.equal(sent.body.question, QUESTIONS.hits[0].title);
  assert.deepEqual(sent.body.find, { scope: { project: "PROJ-1" }, kinds: ["term"], term: "closed" });
  assert.equal(sent.body.cadence, "weekly");
  assert.match(sent.body.ends, /^\d{4}-\d{2}-\d{2}$/);
  k.done(findIn, "standingquestionset", v, { ok: true, id: "STQ-1" });
  assert.ok(keys(kit().render(findIn, v)).includes("screen.find-in.keeping"));
  assert.deepEqual(kit().send(findIn, "standingquestionset", viewOf({ subject: "PROJ-1" })), { refuse: "screen.find-in.kindsfirst" });
  const { html } = shown();
  const all = drawn(html).filter(([op]) => op === "search");
  assert.deepEqual(all.map(([, d]) => [d.label, d.term]), [["act.search.label.find-in", "closed"]]);
  const k2 = kit();
  const v2 = viewOf({ subject: "PROJ-1", ui: { term: "closed" } });
  assert.deepEqual(k2.send(findIn, "search", v2, { term: "closed" }), { query: { q: "closed" } });
  k2.done(findIn, "search", v2, { hits: [] });
  assert.deepEqual(k2.log.go, [["finder", "closed"]]);
});
