/* screens-inquiry FR-28 (B15), the question screen's acts sent as their owners declare them and its strength read in plain words:
 * R87 (Narrow a cited passage to a part), R88 (a hunch is about something; K4203), R89 (the strength reading names what it leaves
 * out), R91 (acts for the question's home project, or the project part of its address), R114 and R121 (Conclude's own reason),
 * R116 and R120 (the ungraded legs by their documents' titles, once; Remove a citation stacks), R117 (a refusal names its
 * finding). On interface-shell's served page over a scripted plane; every request is checked by the shell's guard against the
 * owner's declared fields. Every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { registerDeclaredOps as registerOps } from "../../../src/op-declarations/index.mjs";
import { boot, ok, refusedIn, fieldMismatches, collectOwnerRows } from "../interface-shell/harness.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { open, storeWorld, main, actsIn, button, fill, press, rawKeys, inquiryMd, INQUIRY_REFS, LEGS, BASIS, says, section, word, POLICY, SCREENS, P, Q, D } from "./fixtures.mjs";

/* K4245 (test-support R17): every owner's declarations registered once, before the first read, by the one registrar */

const at = "/app/question/" + Q;
const GROUNDS = [{ ground: "part 1", asserted_by: "member:dev", at: "2026-10-05T09:00:00Z" }];
const grouped = (o = {}) => inquiryMd(P, INQUIRY_REFS, { legs: LEGS.map((l) => (l.target === D ? { ...l, ground: "part 1" } : l)), grounds: GROUNDS, ...o });
const A = { images: { [Q]: { "bundle.md": grouped() } } };
const legRow = (p, target) => section(p, "screen.question.supports.head").querySelectorAll(".cs-row").find((r) => r.querySelector(`a.cs-ref[href="/app/document/${target}"]`));
const count = (text, part) => String(text).split(part).length - 1;
const PB = "PROJ-2026-0099";
const OWN = { capabilities: ["contribute", "create_projects"] };
/** A project of `ann`'s with a held document for each of `titles` and a question of hers resting on them, drawn into the project, by real acts. With `stand`, a reading stands for the project: she
 *  concluded the question (her own reading, named `reading-1`) and took the conclusion off again, so the reading is the project's CURRENT and the question is not concluded.
 *  Answers `{world, ann, project, targets, id, reading, page(opts, path)}`; `page` boots the question's page (or `path`) over the world's door. */
const worldOf = async ({ titles = [POLICY, "Work orders"], legs = [], stand = false } = {}) => {
  const world = await storeWorld();
  const ann = await world.signIn("ann", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  const targets = [];
  for (const t of titles) targets.push((await world.recipes.hold(ann, t, "The Director shall repair each reported pothole, as " + t + " says.", project)).bundle);
  const id = (await world.recipes.question(ann, project, { title: "Seven days", text: "Is the city repairing reported potholes within seven days?",
    legs: targets.map((target, i) => ({ target, role: "supports", ...(legs[i] || {}) })), draw: true })).id;
  if (stand) {
    await ann.act("conclude", { query: { target: id, project, reading: "Repairs are made within seven days.", falsifier: "Work orders dated later show otherwise." } });
    await ann.act("withdrawconclusion", { query: { target: id, project, reason: "new evidence" } });
  }
  const page = async (o = {}, path = "/app/question/" + id) => {
    const { door, session } = world.boot(ann);
    const p = await boot({ screens: SCREENS, door, session, path, ...o });
    await p.settle();
    return p;
  };
  return { world, ann, project, targets, id, reading: "reading-1", page };
};

/* ------------------------------------------------------------------------------------------------------------------ R87 */

const CANDS = ok({ ok: true, target: Q, version: "main", ord: 1, leg: { target: D }, candidates: [
  { source: "reading", ref: "page 2", extent: { kind: "pdf-page", page: 2 }, reference: "u1", label: "seven calendar days", mentions_subject: null, content_id: null, fields: { page: 2 }, machine_work: true },
  { source: "marked", ref: "para 4", extent: { kind: "pdf-page", page: 3 }, reference: null, label: null, mentions_subject: null, content_id: "CNT-2026-0001", fields: { content_id: "CNT-2026-0001" }, machine_work: true }],
  counts: { reading: 1, extract: 0, marked: 1 }, truncated: false, absence: null, proposal_only: true });

/* still scripted (narrowcandidates, narrow): needed: a held document whose reading proposes parts to narrow a citation to (reference positions the reading found, or content a machine marked citable): the world's readings find none */
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
  /* a question with no reading names no version to narrow (the world's question, concluded by no one, holds no reading) */
  const w = await worldOf();
  const none = await w.page();
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
  const w = await worldOf();
  const p = await w.page();
  fill(p, { "question-hunch": "Inspections close them." });
  await press(p, "hypothesishold");
  assert.deepEqual(p.byOp("hypothesishold")[0].body, { inquiry: w.id, kind: "other", statement: "Inspections close them.", about: [w.id] });
  /* where something went: from and to are chosen among the question and the documents it cites */
  const kind = p.doc.getElementById("question-hunch-kind");
  kind.value = "flow";
  p.fire(kind, "change");
  await p.settle();
  const from = p.doc.getElementById("question-hunch-from"), to = p.doc.getElementById("question-hunch-to");
  assert.ok(from && to, "the two ends are chosen once the kind is where something went");
  assert.ok(from.querySelectorAll("option").some((o) => o.getAttribute("value") === w.targets[0]) && to.querySelectorAll("option").some((o) => o.getAttribute("value") === w.id));
  fill(p, { "question-hunch": "Crews close reports when they inspect.", "question-hunch-from": w.targets[0], "question-hunch-to": w.id });
  await press(p, "hypothesishold");
  assert.deepEqual(p.byOp("hypothesishold")[1].body, { inquiry: w.id, kind: "flow", statement: "Crews close reports when they inspect.", about: { from: w.targets[0], to: w.id } });
  /* the hunch list is read again once a hunch is kept */
  assert.ok(p.byOp("hypotheses").length >= 2, "the hunches are read again");
  assert.equal((await w.ann.read("hypotheses", { query: { inquiry: w.id } })).hypotheses.length, 2, "and both reached the store");
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

/* still scripted (inquirystrength): needed: a question whose connection axis is graded, which takes a subject_entity on the question (the question recipe names none) and a leg earned by resolution; with the connection unrated the owner names the ungraded legs in its own sentence, so the screen has none to add */
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

/* still scripted (inquirystrength, the first part): needed: a held document with no title and two legs on one document with a strength that lists it twice (every document the world holds is titled, and the owner lists each leg once) */
test("R116 the ungraded legs are named by their documents' titles, never their ids, each once; a leg whose document has no title draws a plain 'a document' word by key", async () => {
  const nlb = [{ target_id: D }, { target_id: "INFO-2026-0077" }, { target_id: D }];
  const p = await open(at, { ...A, plane: { inquirystrength: (r) => ok({ ok: true, target: r.query.id, capture: { state: "graded", grade: "B" }, connection: UNRATED(3, { not_load_bearing: nlb }) }) } });
  const box = main(p).querySelector(".mk-strengthbox");
  const legs = POLICY + ", " + word("shell.card.document");
  assert.ok(says(box, "strength.arithmetic.unrated_no_leg_on_this_axis", { axis: word("mark.scale.connection.name"), legs }), "the titles once, joined; the untitled leg by the plain word");
  assert.equal(count(box.textContent, POLICY), 1, "each leg once");
  assert.doesNotMatch(main(p).textContent, /INFO-2026-0004|INFO-2026-0077/, "never an id");
  assert.ok(!box.textContent.includes("Not load-bearing"), "not the plane's sentence with its ids");
  /* control: a leg whose document has a title is named once in the strength box; the concluded block adds no second copy (the real question, concluded by her real act) */
  /* the work orders are graded on capture, the policy is not: it is named once, on the axis nothing is graded on */
  const w = await worldOf({ titles: [POLICY, "Work orders"], legs: [{}, { grade: "B", grade_axis: "capture", grade_source: "capture" }] });
  await w.ann.act("inquiryground", { body: { target: w.id, grounds: [{ ground: "part 1", legs: [0, 1] }], reason: "my reading" } });
  await w.ann.act("conclude", { query: { target: w.id, project: w.project, reading: "Repairs are made within seven days.", falsifier: "Work orders dated later show otherwise." } });
  const concluded = await w.page();
  assert.equal(count(main(concluded).querySelector(".mk-strengthbox").textContent, POLICY), 1, "named once, in the strength box");
  assert.equal(count(section(concluded, "question.concluded.heading").textContent, POLICY), 0, "the concluded block adds no second copy");
  assert.doesNotMatch(main(concluded).textContent, /INFO-2026-\d{4}/);
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
  /* the real state: a question of hers whose reading stands for its project (her own, `reading-1`, concluded and taken off again), a second reading (her narrowing of its citation, accepted), and a second project of hers for the address's project part */
  const run = async (part) => {
    const world = await storeWorld();
    const ann = await world.signIn("ann", OWN);
    const project = await world.recipes.project(ann, "Pothole repairs");
    const other = await world.recipes.project(ann, "Elsewhere");
    const held = await world.recipes.page(ann, "A cited page", { paragraphs: ["Repairs are made within seven days."], project });
    const id = (await world.recipes.question(ann, project, { title: "Seven days", text: "Is the city repairing reported potholes within seven days?",
      legs: [{ target: held.bundle, role: "supports", extent_kind: "doc-para", extent_para: 1 }], draw: true })).id;
    await ann.act("conclude", { query: { target: id, project, reading: "Repairs are made within seven days.", falsifier: "Work orders dated later show otherwise." } });
    const description = "Points the first citation at the first run of its paragraph alone, because the rest of the paragraph does not matter.";
    await ann.act("narrow", { query: { target: id, version: "reading-1", ord: 0, name: "alt", description }, body: { extent: { extent_kind: "doc-para", extent_para: 1, extent_run: 0 } } });
    await ann.act("versionaccept", { query: { target: id, version: "alt", project }, body: {} });
    await ann.act("withdrawconclusion", { query: { target: id, project, reason: "new evidence" } });
    const want = part ? other : project;
    const { door, session } = world.boot(ann);
    const path = "/app/question/" + id + (part ? "/" + other : "");
    const pageOf = async () => { const p = await boot({ screens: SCREENS, door, session, path }); await p.settle(); return p; };
    /* each act on a page drawn before it: the owner's answer to the one before changes what the page draws */
    const cur = await pageOf();
    const alt = main(cur).querySelector('[data-reading="alt"]');
    assert.ok(alt, "the second reading is drawn");
    await press(cur, "versioncurrent", { within: alt });
    assert.equal(cur.byOp("versioncurrent")[0].body.project, want, "versioncurrent");
    assert.ok(cur.byOp("basisversions").some((r) => r.query.project === want), "the reading the project part stands on is read with it");
    const set = await pageOf();
    const fold = main(set).querySelector('details[data-aside="set"]');
    assert.ok(fold, "the set-aside fold is drawn");
    set.doc.getElementById("question-aside-0").checked = true;
    fill(set, { "question-aside-why": "waiting for the log" });
    await press(set, "proposedispose", { within: fold });
    assert.equal(set.byOp("proposedispose")[0].body.project, want, "proposedispose");
    const p = await pageOf();
    /* no reading stands for the other project, so there her own is written */
    fill(p, { "question-conclude-falsifier": "logs dated later", "question-conclude-reason": "it answers the question", ...(part ? { "question-conclude-own": "Repairs are made within seven days." } : {}) });
    await press(p, "conclude");
    assert.equal(p.byOp("conclude")[0].query.project, want, "conclude");
  };
  await run(true);
  await run(false);
});

/* ------------------------------------------------------------------------------------------------------------------ R114, R121 */

test("R121 Conclude's reason is its own required box (question.conclude.reason): empty, nothing is sent and the needed key is drawn; with a reason it is sent as the reason, and the optional Commentary is kept apart", async () => {
  const w = await worldOf({ stand: true });
  const p = await w.page();
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
  assert.deepEqual([q.target, q.project, q.version, q.falsifier, q.reason, q.commentary], [w.id, w.project, w.reading, "logs dated later", "Both counts agree.", "a note, not evidence"]);
  assert.equal((await w.ann.read("basisversions", { query: { id: w.id, project: w.project } })).conclusion_stance, "concluded", "and the real act concluded the question");
  /* control: Commentary is optional, never labelled required, and may be left empty */
  const v = await worldOf({ stand: true });
  const c = await v.page();
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
  const w = await worldOf({ stand: true });
  const p = await w.page();
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
