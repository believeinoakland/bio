/* screens-inquiry FR-28 (B15), the question screen's acts sent as their owners declare them and its strength read in plain words:
 * R87 (Narrow a cited passage to a part), R88 (a hunch is about something; K4203), R89 (the strength reading names what it leaves
 * out), R91 (acts for the question's home project, or the project part of its address), R114 and R121 (Conclude's own reason),
 * R116 and R120 (the ungraded legs by their documents' titles, once; Remove a citation stacks), R117 (a refusal names its
 * finding). On interface-shell's served page over a scripted plane; every request is checked by the shell's guard against the
 * owner's declared fields. Every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { registerDeclaredOps as registerOps } from "../../../src/op-declarations/index.mjs";
import { ok, refusedIn, fieldMismatches, collectOwnerRows } from "../interface-shell/harness.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { open, main, actsIn, button, fill, press, rawKeys, inquiryMd, INQUIRY_REFS, LEGS, BASIS, says, section, word, POLICY, P, Q, D } from "./fixtures.mjs";

/* K4245 (test-support R17): every owner's declarations registered once, before the first read, by the one registrar */

const at = "/app/question/" + Q;
const GROUNDS = [{ ground: "part 1", asserted_by: "member:dev", at: "2026-10-05T09:00:00Z" }];
const grouped = (o = {}) => inquiryMd(P, INQUIRY_REFS, { legs: LEGS.map((l) => (l.target === D ? { ...l, ground: "part 1" } : l)), grounds: GROUNDS, ...o });
const A = { images: { [Q]: { "bundle.md": grouped() } } };
const legRow = (p, target) => section(p, "screen.question.supports.head").querySelectorAll(".cs-row").find((r) => r.querySelector(`a.cs-ref[href="/app/document/${target}"]`));
const count = (text, part) => String(text).split(part).length - 1;
const PB = "PROJ-2026-0099";

/* ------------------------------------------------------------------------------------------------------------------ R87 */

const CANDS = ok({ ok: true, target: Q, version: "main", ord: 1, leg: { target: D }, candidates: [
  { source: "reading", ref: "page 2", extent: { kind: "pdf-page", page: 2 }, reference: "u1", label: "seven calendar days", mentions_subject: null, content_id: null, fields: { page: 2 }, machine_work: true },
  { source: "marked", ref: "para 4", extent: { kind: "pdf-page", page: 3 }, reference: null, label: null, mentions_subject: null, content_id: "CNT-2026-0001", fields: { content_id: "CNT-2026-0001" }, machine_work: true }],
  counts: { reading: 1, extract: 0, marked: 1 }, truncated: false, absence: null, proposal_only: true });

test("R87 Narrow on a reading's piece of evidence reads narrowcandidates for its target, version and ord, lists the proposed parts as machine work; choosing one sends narrow with the declared fields (the guard accepts it)", async () => {
  const p = await open(at, { ...A, plane: { narrowcandidates: CANDS, narrow: ok({ ok: true }) } });
  assert.equal(main(p).querySelector("[data-narrow=panel]"), null, "no panel before the press");
  await press(p, "narrow", { within: legRow(p, D) });
  assert.deepEqual(p.byOp("narrowcandidates").map((r) => [r.query.target, r.query.version, r.query.ord]), [[Q, "main", "1"]], "the leg's target, version and ord");
  assert.equal(p.byOp("narrow").length, 0, "listing the parts sends no narrow and writes nothing");
  const panel = main(p).querySelector("[data-narrow=panel]");
  assert.ok(panel.querySelector('[data-origin="machine"]'), "the proposals are marked machine work");
  assert.equal(panel.querySelectorAll('input[type="radio"]').length, 2, "one choice for each proposed part");
  assert.ok(panel.querySelectorAll("input").every((i) => !i.checked), "none is preselected");
  fill(p, { "question-narrow-name": "Seven days only", "question-narrow-description": "the clause the record reads on page 3" });
  p.doc.getElementById("question-narrow-part-1").checked = true;
  await press(p, "narrow", { within: panel });
  assert.deepEqual(p.byOp("narrow")[0].body, { target: Q, version: "main", ord: 1, name: "Seven days only", description: "the clause the record reads on page 3", extent: { content_id: "CNT-2026-0001" } });
  assert.equal(main(p).querySelector("[data-narrow=panel]"), null, "the panel gives way once the narrowing is made");
});

test("R87 control: no part chosen, or no name or reason, sends no narrow and says so beside it; a leg of no reading is offered no Narrow", async () => {
  const p = await open(at, { ...A, plane: { narrowcandidates: CANDS, narrow: ok({ ok: true }) } });
  await press(p, "narrow", { within: legRow(p, D) });
  const panel = main(p).querySelector("[data-narrow=panel]");
  fill(p, { "question-narrow-name": "Seven days only", "question-narrow-description": "why" });
  assert.ok(says(await press(p, "narrow", { within: panel }), "screen.question.narrow.empty"), "no part chosen");
  p.doc.getElementById("question-narrow-part-0").checked = true;
  fill(p, { "question-narrow-name": "", "question-narrow-description": "" });
  assert.ok(says(await press(p, "narrow", { within: panel }), "screen.question.narrow.empty"), "no name, no reason");
  assert.equal(p.byOp("narrow").length, 0);
  /* a question with no reading names no version to narrow */
  const none = await open(at, { ...A, plane: { basisversions: ok({ ok: true, inquiry: Q, versions: [] }) } });
  assert.ok(!actsIn(main(none)).includes("narrow"));
  assert.equal(none.byOp("narrowcandidates").length, 0);
});

test("R87 a BASIS_REFUSED narrowing draws the first finding's detail; one with none draws the generic sentence (R117)", async () => {
  const refused = (findings) => ({ status: 200, json: { ok: true, result: { ok: false, reason: "BASIS_REFUSED", code: "BASIS_REFUSED", ...(findings ? { findings } : {}) } } });
  const go = async (answer) => {
    const p = await open(at, { ...A, plane: { narrowcandidates: CANDS, narrow: answer } });
    await press(p, "narrow", { within: legRow(p, D) });
    const panel = main(p).querySelector("[data-narrow=panel]");
    fill(p, { "question-narrow-name": "Seven days only", "question-narrow-description": "why" });
    p.doc.getElementById("question-narrow-part-0").checked = true;
    return press(p, "narrow", { within: panel });
  };
  const named = await go(refused([{ check: "C-25.10", detail: "the page named is outside the document", ord: 1 }, { check: "C-25.11", detail: "a second finding" }]));
  assert.ok(named.textContent.includes("the page named is outside the document") && !named.textContent.includes("a second finding"), "the first finding's detail");
  assert.ok(!says(named, "refusal.BASIS_REFUSED"), "not the generic sentence");
  assert.ok(says(await go(refused(null)), "refusal.BASIS_REFUSED"), "control: no findings, the generic sentence");
});

/* ------------------------------------------------------------------------------------------------------------------ R88 */

test("R88 / K4203 Keep a hunch sends about: the list holding the question's id for a suspicion, {from, to} for where something went; the guard accepts both", async () => {
  const p = await open(at, { ...A, plane: { hypothesishold: ok({ ok: true, hypothesis_id: "HYP-2" }) } });
  fill(p, { "question-hunch": "Inspections close them." });
  await press(p, "hypothesishold");
  assert.deepEqual(p.byOp("hypothesishold")[0].body, { inquiry: Q, kind: "other", statement: "Inspections close them.", about: [Q] });
  /* where something went: from and to are chosen among the question and the documents it cites */
  const kind = p.doc.getElementById("question-hunch-kind");
  kind.value = "flow";
  p.fire(kind, "change");
  await p.settle();
  const from = p.doc.getElementById("question-hunch-from"), to = p.doc.getElementById("question-hunch-to");
  assert.ok(from && to, "the two ends are chosen once the kind is where something went");
  assert.ok(from.querySelectorAll("option").some((o) => o.getAttribute("value") === D) && to.querySelectorAll("option").some((o) => o.getAttribute("value") === Q));
  fill(p, { "question-hunch": "Crews close reports when they inspect.", "question-hunch-from": D, "question-hunch-to": Q });
  await press(p, "hypothesishold");
  assert.deepEqual(p.byOp("hypothesishold")[1].body, { inquiry: Q, kind: "flow", statement: "Crews close reports when they inspect.", about: { from: D, to: Q } });
  /* the hunch list is read again once a hunch is kept */
  assert.ok(p.byOp("hypotheses").length >= 2, "the hunches are read again");
});

test("R88 control: a send without about is a mismatch of the owner's declaration; the owner's BAD_ABOUT is drawn by its words and keeps the form", async () => {
  const row = collectOwnerRows().hypothesishold;
  assert.deepEqual(fieldMismatches({ query: {}, body: { inquiry: Q, kind: "other", statement: "x" } }, row).map((m) => m.field), ["about"]);
  assert.deepEqual(fieldMismatches({ query: {}, body: { inquiry: Q, kind: "other", statement: "x", about: [Q] } }, row), []);
  const p = await open(at, { ...A, plane: { hypothesishold: refusedIn("BAD_ABOUT") } });
  fill(p, { "question-hunch": "x" });
  const slot = await press(p, "hypothesishold");
  assert.ok(says(slot, "refusal.BAD_ABOUT"));
  assert.equal(p.doc.getElementById("question-hunch").value, "x");
});

/* ------------------------------------------------------------------------------------------------------------------ R89 */

const strength = (extra, cap = {}, con = {}) => ({ inquirystrength: (r) => ok({ ok: true, target: r.query.id,
  capture: { state: "graded", grade: "B", weakest: { title: POLICY }, ...cap }, connection: { state: "graded", grade: "C", ...con }, ...extra }) });

test("R89 the strength reading names what it leaves out: ungraded (legs not load-bearing) and hunches_left_out, each only above zero", async () => {
  const p = await open(at, { ...A, plane: strength({ ungraded: 2, hunches_left_out: 1 }) });
  const box = main(p).querySelector(".mk-strengthbox");
  const u = box.querySelector('[data-strength="ungraded"]'), h = box.querySelector('[data-strength="hunches"]');
  assert.ok(u && u.getAttribute("data-count") === "2" && says(u, "strength.arithmetic.present_and_not_yet_load_bearing", { legs: "2" }), "two legs not counted");
  assert.ok(h && h.getAttribute("data-count") === "1" && says(h, "strength.hunch_why"), "one hunch left out");
  /* control: zero draws nothing (R20); a hunch is never a leg, so no grade is drawn for it */
  const z = await open(at, { ...A, plane: strength({ ungraded: 0, hunches_left_out: 0 }) });
  assert.equal(main(z).querySelector('[data-strength="ungraded"]'), null);
  assert.equal(main(z).querySelector('[data-strength="hunches"]'), null);
  const none = await open(at, { ...A, plane: strength({}) });
  assert.equal(main(none).querySelector('[data-strength="ungraded"]'), null);
});

/* ------------------------------------------------------------------------------------------------------------------ R116 */

const UNRATED = (n, extra = {}) => ({ state: "unrated", grade: null, weakest: null, load_bearing: 0, population: n, detail: "UNRATED on capture: no leg carries a grade. Not load-bearing: " + D + ", INFO-2026-0006.", ...extra });

test("R116 the ungraded legs are named by their documents' titles, never their ids, each once; a leg whose document has no title draws a plain 'a document' word by key", async () => {
  const nlb = [{ target_id: D }, { target_id: "INFO-2026-0077" }, { target_id: D }];
  const p = await open(at, { ...A, plane: { inquirystrength: (r) => ok({ ok: true, target: r.query.id, capture: { state: "graded", grade: "B" }, connection: UNRATED(3, { not_load_bearing: nlb }) }) } });
  const box = main(p).querySelector(".mk-strengthbox");
  const legs = POLICY + ", " + word("shell.card.document");
  assert.ok(says(box, "strength.arithmetic.unrated_no_leg_on_this_axis", { axis: word("mark.scale.connection.name"), legs }), "the titles once, joined; the untitled leg by the plain word");
  assert.equal(count(box.textContent, POLICY), 1, "each leg once");
  assert.doesNotMatch(main(p).textContent, /INFO-2026-0004|INFO-2026-0077/, "never an id");
  assert.ok(!box.textContent.includes("Not load-bearing"), "not the plane's sentence with its ids");
  /* control: a leg whose document has a title but a second leg of the same document is not drawn twice; the concluded block adds no second copy */
  const concluded = await open(at, { ...A, plane: { inquirystrength: (r) => ok({ ok: true, target: r.query.id, capture: { state: "graded", grade: "B" }, connection: UNRATED(1, { not_load_bearing: [{ target_id: D }] }) }),
    basisversions: (r) => ok(BASIS(r.query.project ? { conclusion: { claim: { text: "Yes." }, by: "member:dev", at: "2026-10-13T09:00:00Z" }, conclusion_stance: "concluded" } : {})) } });
  assert.equal(count(main(concluded).querySelector(".mk-strengthbox").textContent, POLICY), 1, "named once, in the strength box");
  assert.equal(count(section(concluded, "question.concluded.heading").textContent, POLICY), 0, "the concluded block adds no second copy");
  assert.doesNotMatch(main(concluded).textContent, /INFO-2026-0004/);
});

/* ------------------------------------------------------------------------------------------------------------------ R120 */

test("R120 the strength sentences that take {legs} are drawn by key with the titles once: rests on nothing, no leg on any set, no leg on this axis, and listed but not counted", async () => {
  const two = [{ target_id: D }, { target_id: "INFO-2026-0005" }];
  /* changed in fix round 3 (C38, R2: a removed citation is counted nowhere, so the screen names none among the legs the strength leaves
     out): the work orders are cited live here, as the answer lists them */
  const LIVE = { images: { [Q]: { "bundle.md": grouped({}).replace(/(INFO-2026-0005\n    rel: cites\n    status: )severed/, "$1confirmed") } } };
  const sentence = async (conn, key, vars, cap) => {
    const p = await open(at, { ...LIVE, plane: { inquirystrength: (r) => ok({ ok: true, target: r.query.id, capture: cap || { state: "graded", grade: "B" }, connection: conn }) } });
    const box = main(p).querySelector(".mk-strengthbox");
    assert.ok(says(box, key, vars), key);
    assert.doesNotMatch(main(p).textContent, /INFO-2026-000[45]/, key + ": no id");
    return box;
  };
  const axis = word("mark.scale.connection.name");
  await sentence(UNRATED(0), "strength.arithmetic.unrated_this_inquiry_rests_on_nothing", { axis });
  await sentence(UNRATED(2, { not_load_bearing: two, grounds: [{ ground: "part 1" }, { ground: "part 2" }] }), "strength.arithmetic.unrated_no_leg_on_any_set", { axis, count: "2", legs: POLICY + ", Work orders" });
  await sentence(UNRATED(2, { not_load_bearing: two }), "strength.arithmetic.unrated_no_leg_on_this_axis", { axis, legs: POLICY + ", Work orders" });
  const listed = await sentence({ state: "graded", grade: "C", not_load_bearing: two, detail: "plane sentence" }, "strength.arithmetic.present_and_not_yet_load_bearing", { legs: POLICY + ", Work orders" });
  assert.equal(count(listed.textContent, POLICY), 1);
  /* control: nothing left out, no such sentence */
  const clean = await open(at, { ...A, plane: strength({}) });
  assert.ok(!says(main(clean), "strength.arithmetic.present_and_not_yet_load_bearing", { legs: "0" }));
  assert.equal(main(clean).querySelector('[data-strength="ungraded"]'), null);
});

test("R120 'Remove a citation' carries the stacking markup the shell's B411 block styles: its acts sit in an mk-acts group", async () => {
  const p = await open(at, A);
  const sup = section(p, "screen.question.supports.head");
  const rm = sup.querySelectorAll('button[data-act="sever"], button[data-act="reinstate"]');
  assert.ok(rm.length >= 2);
  for (const b of rm) assert.ok(b.closest(".mk-acts"), "stacks at 390 px");
  /* control: the cite act of the section is not wrapped by the row's group */
  assert.equal(button(p, "cite").closest(".cs-row"), null);
});

test("R120 R116 R89 R88 R87 the keys this file uses are held (K874)", () => {
  for (const k of ["strength.arithmetic.unrated_no_leg_on_any_set", "strength.arithmetic.unrated_no_leg_on_this_axis", "strength.arithmetic.unrated_this_inquiry_rests_on_nothing",
    "strength.arithmetic.present_and_not_yet_load_bearing", "strength.hunch_why", "shell.card.document", "refusal.BAD_ABOUT", "refusal.BASIS_REFUSED", "screen.question.narrow.empty",
    "screen.question.hunch.kind.flow", "act.narrow.label.question"]) assert.ok(hasWord(k), k);
});

/* ------------------------------------------------------------------------------------------------------------------ R91 */

test("R91 acts act for the question's home project: the address <question>/<project> carries the project part in conclude, versioncurrent and proposedispose; the bare address carries the home project", async () => {
  const basis = (r) => ok({ ...BASIS(), versions: [...BASIS().versions, { name: "alt", state: "accepted", author: "member:ana", moved: { by: "ana", at: "2026-10-07T09:00:00Z", reason: null }, grounds: [], legs: BASIS().versions[0].legs }],
    ...(r.query.project ? { current: { project: r.query.project, version: "main", at: "2026-10-06T09:00:00Z", by: "dev" } } : {}) });
  const queue = (r) => ok(r.query.aside ? { ok: true, aside: [], count: 0, next: null, truncated: false } : { items: [] });
  const run = async (path, want) => {
    const p = await open(path, { ...A, plane: { basisversions: basis, queue, conclude: ok({ ok: true }), versioncurrent: ok({ ok: true }), proposedispose: ok({ ok: true }) } });
    fill(p, { "question-conclude-falsifier": "logs dated later", "question-conclude-reason": "it answers the question" });
    await press(p, "conclude");
    assert.equal(p.byOp("conclude")[0].query.project, want, path + ": conclude");
    await press(p, "versioncurrent", { within: main(p).querySelector('[data-reading="alt"]') });
    assert.equal(p.byOp("versioncurrent")[0].body.project, want, path + ": versioncurrent");
    const fold = main(p).querySelector('details[data-aside="set"]');
    p.doc.getElementById("question-aside-0").checked = true;
    fill(p, { "question-aside-why": "waiting for the log" });
    await press(p, "proposedispose", { within: fold });
    assert.equal(p.byOp("proposedispose")[0].body.project, want, path + ": proposedispose");
    return p;
  };
  const other = await run(at + "/" + PB, PB);
  assert.ok(other.byOp("basisversions").some((r) => r.query.project === PB), "the reading the project part stands on is read with it");
  await run(at, P);
});

/* ------------------------------------------------------------------------------------------------------------------ R114, R121 */

test("R121 Conclude's reason is its own required box (question.conclude.reason): empty, nothing is sent and the needed key is drawn; with a reason it is sent as the reason, and the optional Commentary is kept apart", async () => {
  const p = await open(at, { ...A, plane: { conclude: ok({ ok: true }) } });
  const box = p.doc.getElementById("question-conclude-reason");
  assert.ok(box, "the reason box is drawn");
  assert.ok(says(p.doc.querySelectorAll("label").find((l) => l.getAttribute("for") === "question-conclude-reason"), "question.conclude.reason"));
  assert.ok(says(box.closest(".cs-field"), "question.conclude.reason.help"));
  fill(p, { "question-conclude-falsifier": "logs dated later", "question-conclude-commentary": "a note, not evidence" });
  assert.ok(says(await press(p, "conclude"), "question.conclude.reason.needed"), "the needed key beside the act");
  assert.equal(p.byOp("conclude").length, 0, "nothing sent");
  fill(p, { "question-conclude-reason": "Both counts agree." });
  await press(p, "conclude");
  const q = p.byOp("conclude")[0].query;
  assert.deepEqual([q.target, q.project, q.version, q.falsifier, q.reason, q.commentary], [Q, P, "main", "logs dated later", "Both counts agree.", "a note, not evidence"]);
  /* control: Commentary is optional, never labelled required, and may be left empty */
  const c = await open(at, { ...A, plane: { conclude: ok({ ok: true }) } });
  const cl = c.doc.querySelectorAll("label").find((l) => l.getAttribute("for") === "question-conclude-commentary");
  assert.ok(says(cl, "question.conclude.commentary") && !/required/i.test(cl.textContent));
  assert.ok(says(cl.closest(".cs-field"), "question.conclude.commentary.help"));
  fill(c, { "question-conclude-falsifier": "logs dated later", "question-conclude-reason": "r" });
  await press(c, "conclude");
  assert.equal(c.byOp("conclude")[0].query.commentary, undefined);
});

test("R121 R114 every key of the reason box is held (K874); the reason box is not Commentary's help or the shell's generic refusal", () => {
  for (const k of ["question.conclude.reason", "question.conclude.reason.help", "question.conclude.reason.needed", "question.conclude.commentary.help", "refusal.BAD_READING"]) assert.ok(hasWord(k), k);
  assert.notEqual(word("question.conclude.reason.needed"), word("shell.reason.needed"));
});

test("R114 pressing Conclude in any state the screen draws either succeeds or names the field that is missing, and no required field is labelled Optional", async () => {
  const p = await open(at, { ...A, plane: { conclude: ok({ ok: true }) } });
  /* nothing written: the falsifier is named first, then the reason; nothing is ever sent for a missing field */
  assert.ok(says(await press(p, "conclude"), "question.conclude.falsifier.help"), "the falsifier is the field missing");
  fill(p, { "question-conclude-falsifier": "logs dated later" });
  assert.ok(says(await press(p, "conclude"), "question.conclude.reason.needed"), "then the reason");
  assert.equal(p.byOp("conclude").length, 0);
  /* her own reading chosen and left empty: the reading is named */
  const own = p.doc.getElementById("question-conclude-reading");
  own.value = "";
  p.fire(own, "change");
  await p.settle();
  fill(p, { "question-conclude-falsifier": "logs dated later", "question-conclude-reason": "r", "question-conclude-own": "" });
  assert.ok(says(await press(p, "conclude"), "refusal.BAD_READING"), "her own reading is the field missing");
  assert.equal(p.byOp("conclude").length, 0);
  /* the labels of the fields the act requires never say Optional: their helps are the 'Required.' rows */
  for (const k of ["question.conclude.falsifier.help", "question.conclude.reason.help"]) assert.doesNotMatch(word(k), /optional/i, k);
  assert.match(word("question.conclude.commentary.help"), /optional/i, "control: the one optional field says so");
  assert.deepEqual(rawKeys(p.root()), []);
});

/* ------------------------------------------------------------------------------------------------------------------ R117 */

test("R117 a BASIS_REFUSED partition draws the first finding's detail by the refusal's findings, and not the generic sentence; one with no findings draws the generic sentence", async () => {
  const refused = (findings) => ({ status: 200, json: { ok: true, result: { ok: false, reason: "BASIS_REFUSED", code: "BASIS_REFUSED", ...(findings ? { findings } : {}) } } });
  const go = async (answer) => {
    const p = await open(at, { plane: { inquiryground: answer } });
    assert.ok(main(p).querySelector("[data-state=ask], #state-b"), "state b: the question asks what each passage carries");
    return press(p, "inquiryground", { reason: "my answers" });
  };
  const named = await go(refused([{ check: "C-25.1", detail: "Say what the first passage carries.", ord: 0 }, { check: "C-25.2", detail: "an unrelated second finding" }]));
  assert.ok(named.textContent.includes("Say what the first passage carries."), "the first finding's detail");
  assert.ok(!named.textContent.includes("an unrelated second finding"), "only the first");
  assert.ok(!says(named, "refusal.BASIS_REFUSED"), "not the generic sentence");
  assert.ok(says(await go(refused(null)), "refusal.BASIS_REFUSED"), "control: no findings, the generic sentence");
  assert.ok(says(await go(refused([])), "refusal.BASIS_REFUSED"), "control: an empty list, the generic sentence");
});
