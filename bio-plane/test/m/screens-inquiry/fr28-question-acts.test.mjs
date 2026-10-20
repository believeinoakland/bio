/* screens-inquiry FR-28 (B15), the acts the registry lists on `question` that were not drawn: R101 (revise or take back a hunch),
 * R102 (divide a question), R103 (reminders to look again), R104 (reopen a finding), and R10 (the screen's acts are exactly the
 * registry's, `writinghelp` among them). On interface-shell's served page over a scripted plane; every request is checked by the
 * shell's guard against the owner's declared fields. Every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { BUNDLE_ID_RE } from "../../../src/record-grammar/ids.mjs";
import { open, main, actsIn, button, fill, press, rawKeys, inquiryMd, INQUIRY_REFS, LEGS, BASIS, plane, says, section, day, word, SCREENS, P, Q, D } from "./fixtures.mjs";

const REGISTRY = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/registry.json", import.meta.url), "utf8"));
const at = "/app/question/" + Q;
const GROUNDS = [{ ground: "part 1", asserted_by: "member:dev", at: "2026-10-05T09:00:00Z" }];
const grouped = (o = {}) => inquiryMd(P, INQUIRY_REFS, { legs: LEGS.map((l) => (l.target === D ? { ...l, ground: "part 1" } : l)), grounds: GROUNDS, ...o });
const A = { images: { [Q]: { "bundle.md": grouped() } } };
const DOC_TITLE = "Pothole repair policy, Administrative Instruction 4.12";
const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }), agentpack: ok({ ok: true, pack: { version: "p@1" } }), airuns: ok({ ok: true, runs: [] }) };
const reach = (o = {}) => ({ ...o, boot: { plane: { ...plane(o), ...REACH } } });
const CONCLUDED = (r) => ok(BASIS(r.query.project ? { conclusion: { claim: { text: "Yes." }, by: "member:dev", at: "2026-10-13T09:00:00Z" }, conclusion_stance: "concluded" } : {}));

/* ------------------------------------------------------------------------------------------------------------------ R101 */

const HUNCH = (o = {}) => ({ hypothesis_id: "HYP-1", inquiry: Q, kind: "other", statement: "Crews close reports when they inspect.", held_by: "dev", held_at: "2026-10-04T09:00:00Z", status: "live",
  history: [{ act: "hold", by: "dev", at: "2026-10-04T09:00:00Z", statement: "Crews close reports when they inspect." },
    { act: "revise", by: "ana", at: "2026-10-05T09:00:00Z", statement: "Crews close reports on inspection.", reason: "the inspection log says so" }], ...o });
const hunches = (list) => ({ hypotheses: ok({ ok: true, inquiry: Q, hypotheses: list }) });

test("R101 any member who sees the question revises or takes back a hunch, each with her reason: revise sends the hunch, the new statement and the reason; withdraw sends the hunch and the reason", async () => {
  const p = await open(at, { ...A, plane: { ...hunches([HUNCH()]), hypothesisrevise: ok({ ok: true }), hypothesiswithdraw: ok({ ok: true }) } });
  const fold = main(p).querySelector('[data-hunch="HYP-1"] details');
  assert.ok(fold && says(fold.querySelector("summary"), "screen.question.hunch.change.summary", { name: "dev" }), "the fold for dev's hunch");
  assert.ok(says(fold, "screen.question.hunch.change.note") && says(fold, "screen.question.hunch.revise.label") && says(fold, "screen.question.hunch.revise.help") && says(fold, "screen.question.hunch.revise.reason"));
  assert.equal(p.doc.getElementById("question-hrev-0").value, "Crews close reports when they inspect.", "the statement to change is the current one");
  /* revise: the new statement and the reason */
  fill(p, { "question-hrev-0": "Crews close reports at inspection, not repair.", "question-hrevr-0": "the crew foreman said so" });
  await press(p, "hypothesisrevise", { within: fold });
  assert.deepEqual(p.byOp("hypothesisrevise")[0].body, { hypothesisId: "HYP-1", statement: "Crews close reports at inspection, not repair.", reason: "the crew foreman said so" });
  /* revise with the words left as they are: only the reason changes (the statement is omitted) */
  fill(p, { "question-hrev-0": "Crews close reports when they inspect.", "question-hrevr-0": "I checked it again" });
  await press(p, "hypothesisrevise", { within: fold });
  assert.deepEqual(p.byOp("hypothesisrevise")[1].body, { hypothesisId: "HYP-1", reason: "I checked it again" });
  /* withdraw: the hunch and the reason, with the sentences that say it cannot be undone */
  assert.ok(says(fold, "screen.question.hunch.withdraw.reason") && says(fold, "screen.question.hunch.withdraw.note") && says(fold, "screen.question.hunch.withdraw.note2"));
  assert.ok(says(button(p, "hypothesiswithdraw", fold), "screen.question.hunch.withdraw.button"));
  fill(p, { "question-hwr-0": "the foreman corrected me" });
  await press(p, "hypothesiswithdraw", { within: fold });
  assert.deepEqual(p.byOp("hypothesiswithdraw")[0].body, { hypothesisId: "HYP-1", reason: "the foreman corrected me" });
  assert.ok(p.byOp("hypotheses").length >= 3, "the hunches are read again after each change");
});

test("R101 each change stays on the record with who and why: the hunch's history is drawn; a hunch taken back is shown withdrawn and offers no change (control: no reason sends nothing and says so)", async () => {
  const p = await open(at, { ...A, plane: { ...hunches([HUNCH()]) } });
  const h = main(p).querySelector('[data-hunch="HYP-1"]');
  const rows = h.querySelectorAll("[data-history]");
  assert.deepEqual(rows.map((r) => r.getAttribute("data-history")), ["hold", "revise"]);
  assert.ok(rows[1].textContent.includes("ana") && rows[1].textContent.includes(day("2026-10-05")) && rows[1].textContent.includes("the inspection log says so") && says(rows[1], "shell.reason.lead"), "who, when and why");
  /* a hunch is never a leg: it is drawn as a hunch, with no grade */
  assert.equal(h.querySelectorAll(".cs-grade").length, 0);
  assert.ok(h.querySelector('[data-mark="hunch"]'));
  const gone = await open(at, { ...A, plane: { ...hunches([HUNCH({ status: "withdrawn", history: [...HUNCH().history, { act: "withdraw", by: "dev", at: "2026-10-06T09:00:00Z", reason: "mistaken" }] })]) } });
  const g = main(gone).querySelector('[data-hunch="HYP-1"]');
  assert.equal(g.getAttribute("data-status"), "withdrawn");
  assert.ok(g.textContent.includes("mistaken") && says(g, "screen.question.hunch.withdraw.note2"));
  assert.equal(g.querySelector("details"), null, "a hunch taken back is not changed again");
  /* control: no reason, nothing sent */
  const n = await open(at, { ...A, plane: { ...hunches([HUNCH()]), hypothesisrevise: ok({ ok: true }), hypothesiswithdraw: ok({ ok: true }) } });
  const f = main(n).querySelector('[data-hunch="HYP-1"] details');
  assert.ok(says(await press(n, "hypothesisrevise", { within: f }), "screen.question.hunch.refused.body"));
  assert.ok(says(await press(n, "hypothesiswithdraw", { within: f }), "screen.question.hunch.refused.body"));
  assert.equal(n.byOp("hypothesisrevise").length + n.byOp("hypothesiswithdraw").length, 0);
  assert.ok(says(f, "screen.question.hunch.refused.summary") && says(f, "screen.question.hunch.refused.body2"));
});

test("R101 the owner's refusals of a change are drawn by their words", async () => {
  const p = await open(at, { ...A, plane: { ...hunches([HUNCH()]), hypothesisrevise: refusedIn("HYPOTHESIS_WITHDRAWN") } });
  const f = main(p).querySelector('[data-hunch="HYP-1"] details');
  fill(p, { "question-hrevr-0": "why" });
  assert.ok(says(await press(p, "hypothesisrevise", { within: f }), "refusal.HYPOTHESIS_WITHDRAWN"));
  for (const k of ["screen.question.hunch.change.summary", "screen.question.hunch.change.note", "screen.question.hunch.revise.label", "screen.question.hunch.revise.help", "screen.question.hunch.revise.reason",
    "screen.question.hunch.withdraw.reason", "screen.question.hunch.withdraw.note", "screen.question.hunch.withdraw.note2", "screen.question.hunch.withdraw.button",
    "screen.question.hunch.refused.summary", "screen.question.hunch.refused.body", "screen.question.hunch.refused.body2", "act.hypothesisrevise.label.question", "act.hypothesiswithdraw.label.question",
    "refusal.HYPOTHESIS_WITHDRAWN", "shell.reason.lead"]) assert.ok(hasWord(k), k);
});

/* ------------------------------------------------------------------------------------------------------------------ R102 */

test("R102 Divide this question sends the reason, and two new questions, each numbered by the plane's allocator and carrying the passages sent to it; the new questions are drawn with their numbers", async () => {
  let n = 99;
  const divided = (r) => ok({ ok: true, target: Q, from: "open", to: "divided", terminal: true, into: r.body.children.map((c) => c.id),
    children: r.body.children.map((c) => ({ id: c.id, question: c.question, legs: c.legs })) });
  const p = await open(at, { ...A, plane: { allocid: () => ok({ ok: true, id: "INQ-2026-" + String(++n).padStart(4, "0") }), inquirydivide: divided } });
  const fold = main(p).querySelector("details[data-divide]");
  assert.ok(fold && says(fold.querySelector("summary"), "screen.question.divide.summary"));
  for (const k of ["screen.question.divide.note", "screen.question.divide.note2", "screen.question.divide.note3", "screen.question.divide.reason", "screen.question.divide.limits", "screen.question.divide.q1", "screen.question.divide.q2",
    "screen.question.divide.numbered", "screen.question.divide.every"]) assert.ok(says(fold, k), k);
  assert.ok(says(fold, "screen.question.divide.leg", { passage: DOC_TITLE }), "a choice for each passage, named by its document's title");
  fill(p, { "question-divide-reason": "It was two questions.", "question-divide-q1": "How many reported potholes were marked closed within seven days?", "question-divide-q2": "Were the potholes marked closed actually repaired?" });
  const check = (ord, side) => { p.doc.getElementById(`question-divide-leg-${ord}-${side}`).checked = true; };
  check(0, 0); check(1, 1); check(2, 0); check(2, 1);
  await press(p, "inquirydivide", { within: fold });
  const b = p.byOp("inquirydivide")[0].body;
  assert.equal(b.target, Q);
  assert.equal(b.reason, "It was two questions.");
  assert.deepEqual(b.children.map((c) => [c.question, c.legs]), [["How many reported potholes were marked closed within seven days?", [0, 2]], ["Were the potholes marked closed actually repaired?", [1, 2]]]);
  assert.deepEqual(b.children.map((c) => c.id.slice(0, 13)), ["INQ-2026-0100", "INQ-2026-0101"], "numbered for the member");
  for (const c of b.children) assert.match(c.id, BUNDLE_ID_RE, "an id the record's grammar accepts");
  const shown = main(p).querySelector("[data-divided]");
  assert.deepEqual(shown.querySelectorAll("[data-child]").map((c) => c.getAttribute("data-child")), b.children.map((c) => c.id));
  assert.ok(shown.textContent.includes(b.children[0].id) && shown.textContent.includes("Were the potholes marked closed actually repaired?"), "each new question drawn with its number");
  assert.ok(shown.querySelector(`a.cs-ref[href="/app/question/${b.children[1].id}"]`), "a reference opening it");
});

test("R102 control: a missing reason, a missing question or a passage sent nowhere sends nothing and says what to give; a refusal is drawn by its words; a long title never ends the id in a hyphen", async () => {
  const p = await open(at, { ...A, plane: { allocid: ok({ ok: true, id: "INQ-2026-0100" }), inquirydivide: ok({ ok: true }) } });
  const fold = main(p).querySelector("details[data-divide]");
  assert.ok(says(await press(p, "inquirydivide", { within: fold }), "screen.question.divide.refused.body"), "nothing written");
  fill(p, { "question-divide-reason": "r", "question-divide-q1": "One?", "question-divide-q2": "Two?" });
  p.doc.getElementById("question-divide-leg-0-0").checked = true;
  assert.ok(says(await press(p, "inquirydivide", { within: fold }), "screen.question.divide.refused.body"), "two passages have no home");
  assert.equal(p.byOp("inquirydivide").length, 0);
  assert.equal(p.byOp("allocid").length, 0, "no number is taken for a division that cannot be sent");
  /* a question whose 40th character falls on a hyphen */
  const long = "Did the city close every one of the reported potholes - on time";
  let n = 0;
  const q = await open(at, { ...A, plane: { allocid: () => ok({ ok: true, id: "INQ-2026-" + String(++n + 100).padStart(4, "0") }), inquirydivide: refusedIn("CITED") } });
  const f = main(q).querySelector("details[data-divide]");
  fill(q, { "question-divide-reason": "r", "question-divide-q1": long, "question-divide-q2": "Two?" });
  for (const o of [0, 1, 2]) { q.doc.getElementById(`question-divide-leg-${o}-0`).checked = true; q.doc.getElementById(`question-divide-leg-${o}-1`).checked = true; }
  assert.ok(says(await press(q, "inquirydivide", { within: f }), "refusal.CITED"), "the owner's refusal by its words");
  for (const c of q.byOp("inquirydivide")[0].body.children) assert.match(c.id, BUNDLE_ID_RE);
});

/* ------------------------------------------------------------------------------------------------------------------ R103 */

const OBLIGATION = (extra = {}) => ({ bundle_id: Q, title: "Seven days", object_type: "inquiry", current_state: "open", target: D, target_state: "open", legs: [],
  causes: [{ source: "edition", since: "2026-10-06T09:00:00Z", ord: 0, cited_edition: 1, latest_edition: 2, detail: "this leg rests on edition 1" }],
  closed: [{ source: "edition", since: "2026-09-01T09:00:00Z", closed_by: "mai", closed_at: "2026-10-07T09:00:00Z", note: "The new edition repeats page 12 unchanged." }], ...extra });
const reeval = (list) => ({ reevaluations: (r) => ok({ ok: true, target: r.query.target, obligations: r.query.target === D ? list : [], count: list.length, closed: [], closed_count: 0 }) });

test("R103 what needs a second look is listed from the reminders the record holds for what this question rests on, and recording that one was looked at sends the dependent, the cause and the note", async () => {
  const p = await open(at, { ...A, plane: { ...reeval([OBLIGATION()]), reevaluationrecord: ok({ ok: true, closed: true }) } });
  assert.deepEqual(p.byOp("reevaluations").map((r) => r.query.target).sort(), [D, "INFO-2026-0005", "INFO-2026-0006"].sort(), "read for each document the question cites");
  const s = main(p).querySelector("#reeval");
  assert.ok(s && says(s.querySelector("h2"), "screen.question.reeval.heading"));
  const open1 = s.querySelector('[data-reeval="open"]');
  assert.ok(says(open1, "screen.question.reeval.edition", { document: DOC_TITLE }) && says(open1, "screen.question.reeval.edition.meta"), "an edition cause, by the document's title");
  assert.ok(open1.textContent.includes(day("2026-10-06")));
  const done = s.querySelector('[data-reeval="done"]');
  assert.ok(says(done, "screen.question.reeval.done", { name: "mai", date: day("2026-10-07"), note: "The new edition repeats page 12 unchanged." }) && says(done, "screen.question.reeval.done.meta", { what: DOC_TITLE }), "a closed cause: who, when and what was decided");
  assert.ok(says(s, "screen.question.reeval.note.label"));
  fill(p, { "question-reeval-note": "The new edition repeats the clause." });
  await press(p, "reevaluationrecord", { within: s });
  assert.deepEqual(p.byOp("reevaluationrecord")[0].body, { dependent: Q, target: D, source: "edition", since: "2026-10-06T09:00:00Z", note: "The new edition repeats the clause." });
  /* "See what needs a second look" reads again */
  const before = p.byOp("reevaluations").length;
  await press(p, "reevaluations", { within: s });
  assert.ok(p.byOp("reevaluations").length > before, "read again");
});

test("R103 control: a finding with no reminder draws none (R20); an empty note sends nothing; the owner's refusal is drawn by its words; a reminder for another question is not this one's", async () => {
  const none = await open(at, { ...A, plane: { ...reeval([]) } });
  assert.equal(main(none).querySelector("#reeval"), null);
  assert.ok(!actsIn(main(none)).includes("reevaluationrecord") && !actsIn(main(none)).includes("reevaluations"));
  const other = await open(at, { ...A, plane: { ...reeval([OBLIGATION({ bundle_id: "INQ-2026-0099-other", closed: [] })]) } });
  assert.equal(main(other).querySelector("#reeval"), null, "a dependent that is not this question");
  const p = await open(at, { ...A, plane: { ...reeval([OBLIGATION({ closed: [] })]), reevaluationrecord: refusedIn("REEVALUATION_NO_SUCH_CAUSE") } });
  const s = main(p).querySelector("#reeval");
  assert.ok(says(await press(p, "reevaluationrecord", { within: s }), "screen.question.reeval.refused.body"), "no note");
  assert.equal(p.byOp("reevaluationrecord").length, 0);
  fill(p, { "question-reeval-note": "Looked." });
  const slot = await press(p, "reevaluationrecord", { within: s });
  assert.ok(says(slot, "screen.question.reeval.refused.body2"), "nothing stands now: the list is read again");
  assert.ok(says(s, "screen.question.reeval.refused.summary"), "the refusals' fold");
  for (const k of ["screen.question.reeval.heading", "screen.question.reeval.edition", "screen.question.reeval.edition.meta", "screen.question.reeval.done", "screen.question.reeval.done.meta", "screen.question.reeval.note.label",
    "screen.question.reeval.refused.summary", "screen.question.reeval.refused.body", "screen.question.reeval.refused.body2", "screen.question.reeval.help", "screen.question.reeval.help2",
    "act.reevaluationrecord.label.question", "act.reevaluations.label.question"]) assert.ok(hasWord(k), k);
});

/* ------------------------------------------------------------------------------------------------------------------ R104 */

test("R104 a concluded question offers 'Reopen this finding, with a reason', the reason required: sent as the target and the reason; an empty reason sends nothing", async () => {
  const p = await open(at, { ...A, plane: { basisversions: CONCLUDED, reopen: ok({ ok: true, target: Q, to: "open" }) } });
  const fold = main(p).querySelector("details[data-reopen]");
  assert.ok(fold && says(fold.querySelector("summary"), "screen.question.reopen.summary"));
  for (const k of ["screen.question.reopen.what", "screen.question.reopen.case", "screen.question.reopen.kept", "screen.question.reopen.why", "screen.question.reopen.why.help", "screen.question.reopen.next",
    "screen.question.reopen.refused.summary"]) assert.ok(says(fold, k), k);
  assert.ok(says(await press(p, "reopen", { within: fold }), "screen.question.reopen.refused.noreason"), "required");
  assert.equal(p.byOp("reopen").length, 0);
  fill(p, { "question-reopen-why": "the city's 2026 audit corrects the figure" });
  await press(p, "reopen", { within: fold });
  const q = p.byOp("reopen")[0].query;
  assert.deepEqual([q.target, q.reason], [Q, "the city's 2026 audit corrects the figure"]);
  /* control: an open question offers none */
  const open1 = await open(at, A);
  assert.ok(!actsIn(main(open1)).includes("reopen"));
  assert.equal(main(open1).querySelector("details[data-reopen]"), null);
});

test("R104 the owner's refusals are drawn by the design's words: no reason, a reason that cannot be kept, a finding in no published case", async () => {
  for (const [code, key] of [["NO_REASON", "screen.question.reopen.refused.noreason"], ["BAD_REASON", "screen.question.reopen.refused.badreason"], ["NOT_SET_DOWN", "screen.question.reopen.refused.notsetdown"]]) {
    const p = await open(at, { ...A, plane: { basisversions: CONCLUDED, reopen: refusedIn(code) } });
    fill(p, { "question-reopen-why": "a reason" });
    assert.ok(says(await press(p, "reopen", { within: main(p).querySelector("details[data-reopen]") }), key), code);
  }
  /* a published case that carries it offers the way to the next edition */
  const c = await open(at, { ...A, plane: { basisversions: CONCLUDED, backlinks: (r) => ok({ ok: true, target: r.query.target, backlinks: r.query.target === Q ? [{ from: "CASE-2026-0001", from_type: "published", from_title: "Street safety" }] : [] }) } });
  assert.ok(main(c).querySelector('details[data-reopen] a.cs-ref[href="/app/docket/CASE-2026-0001"]'), "the docket, where the next edition is started");
  for (const k of ["screen.question.reopen.summary", "screen.question.reopen.what", "screen.question.reopen.case", "screen.question.reopen.kept", "screen.question.reopen.why", "screen.question.reopen.why.help",
    "screen.question.reopen.next", "screen.question.reopen.next.link", "screen.question.reopen.next.link.text", "screen.question.reopen.refused.summary", "screen.question.reopen.refused.noreason",
    "screen.question.reopen.refused.badreason", "screen.question.reopen.refused.notsetdown", "act.reopen.label.question"]) assert.ok(hasWord(k), k);
});

/* ------------------------------------------------------------------------------------------------------------------ R10 */

test("R10 question draws exactly its registry acts: each act the registry lists (less those it still owes) is an act of the screen, and the screen has no other; the writing help is drawn only while the assistant is reachable", async () => {
  const reg = REGISTRY.screens.find((s) => s.id === "question").acts.map((a) => a.op).filter((op) => !op.startsWith("owed:"));
  const screen = SCREENS.find((s) => s.id === "question");
  assert.deepEqual(screen.acts.map((a) => a.op).sort(), [...reg].sort());
  for (const op of ["reopen", "hypothesisrevise", "hypothesiswithdraw", "inquirydivide", "reevaluationrecord", "reevaluations", "writinghelp"])
    assert.equal(screen.acts.find((a) => a.op === op).label, `act.${op}.label.question`, op);
  const off = await open(at, A);
  assert.ok(!actsIn(main(off)).includes("writinghelp"));
  const on = await open(at, reach(A));
  assert.ok(actsIn(main(on)).includes("writinghelp"), "reachable: the help is drawn");
  assert.deepEqual(rawKeys(on.root()), []);
});
