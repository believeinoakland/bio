/* screens-inquiry FR-28 (B15), the question screen's acts sent as their owners declare them and its strength read in plain words:
 * R87 (Narrow a cited passage to a part), R88 (a hunch is about something; K4203), R89 (the strength reading names what it leaves
 * out), R91 (acts for the question's home project, or the project part of its address), R114 and R121 (Conclude's own reason),
 * R116 and R120 (the ungraded legs by their documents' titles, once; Remove a citation stacks), R117 (a refusal names its
 * finding). On interface-shell's served page over a scripted plane; every request is checked by the shell's guard against the
 * owner's declared fields. Every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { registerDeclaredOps as registerOps } from "../../../src/op-declarations/index.mjs";
import { boot, ok, fieldMismatches, collectOwnerRows } from "../interface-shell/harness.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { HEADINGS } from "../../../src/record-grammar/index.mjs";
import { instant, hex } from "../store-request/door.mjs";
import { holdRefusals } from "../hypotheses/fixtures.mjs";
import { groundAnswers } from "../inquiry/fixtures.mjs";
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

/** What `narrowcandidates` lists for the first leg of a question (the document `target`, the reading `version`): two parts of the page, each machine work and a proposal. Still scripted (narrowcandidates):
 *  needed: a held document whose reading proposes parts to narrow a citation to (a reference position the reading found inside what is cited, or content a machine marked citable): the world's readings find none. */
const candidatesOf = (w, target) => ({ ok: true, target: w.id, version: w.reading, ord: 0, leg: { target }, candidates: [
  { source: "reading", ref: "paragraph 1", extent: { kind: "doc-para", para: 1 }, reference: "u1", label: "seven calendar days", mentions_subject: null, content_id: null, fields: { extent_kind: "doc-para", extent_para: 1 }, machine_work: true },
  { source: "reading", ref: "paragraph 2", extent: { kind: "doc-para", para: 2 }, reference: "u2", label: null, mentions_subject: null, content_id: null, fields: { extent_kind: "doc-para", extent_para: 2 }, machine_work: true }],
  counts: { reading: 2, extract: 0, marked: 0 }, truncated: false, absence: null, proposal_only: true });
/** a question whose reading stands on a held page of two paragraphs (a citation is narrowed to a part of text the reading holds), its page over the world's door but for the parts the reading proposes */
const narrowWorld = async () => {
  const world = await storeWorld();
  const ann = await world.signIn("ann", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  const target = (await world.recipes.page(ann, POLICY, { paragraphs: ["The Director shall repair each reported pothole.", "Repairs are recorded as closed when the crew reports the work complete."], project })).bundle;
  const id = (await world.recipes.question(ann, project, { title: "Seven days", text: "Is the city repairing reported potholes within seven days?", legs: [{ target, role: "supports" }], draw: true })).id;
  await ann.act("conclude", { query: { target: id, project, reading: "Repairs are made within seven days.", falsifier: "Work orders dated later show otherwise." } });
  await ann.act("withdrawconclusion", { query: { target: id, project, reason: "new evidence" } });
  const w = { world, ann, project, targets: [target], id, reading: "reading-1" };
  const cands = ok(candidatesOf(w, target));
  const { door, session } = world.boot(ann);
  return { w, page: async () => { const p = await boot({ screens: SCREENS, door, session, path: "/app/question/" + id, plane: { narrowcandidates: cands } }); await p.settle(); return p; } };
};

test("R87 Narrow on a reading's piece of evidence reads narrowcandidates for its target, version and ord, lists the proposed parts as machine work; choosing one sends narrow with the declared fields (the guard accepts it)", async () => {
  const { w, page } = await narrowWorld();
  const p = await page();
  assert.equal(main(p).querySelector("[data-narrow=panel]"), null, "no panel before the press");
  await press(p, "narrow", { within: legRow(p, w.targets[0]) });
  assert.deepEqual(p.byOp("narrowcandidates").map((r) => [r.query.target, r.query.version, r.query.ord]), [[w.id, w.reading, "0"]], "the leg's target, version and ord");
  assert.equal(p.byOp("narrow").length, 0, "listing the parts sends no narrow and writes nothing");
  const panel = main(p).querySelector("[data-narrow=panel]");
  assert.ok(panel.querySelector('[data-origin="machine"]'), "the proposals are marked machine work");
  assert.equal(panel.querySelectorAll('input[type="radio"]').length, 2, "one choice for each proposed part");
  assert.ok(panel.querySelectorAll("input").every((i) => !i.checked), "none is preselected");
  fill(p, { "question-narrow-name": "Seven days only", "question-narrow-description": "the clause the record reads on page 3" });
  p.doc.getElementById("question-narrow-part-1").checked = true;
  await press(p, "narrow", { within: panel });
  assert.deepEqual(p.byOp("narrow")[0].body, { target: w.id, version: w.reading, ord: 0, name: "Seven days only", description: "the clause the record reads on page 3", extent: candidatesOf(w, w.targets[0]).candidates[1].fields });
  assert.equal(main(p).querySelector("[data-narrow=panel]"), null, "the panel gives way once the narrowing is made");
  const made = (await w.ann.read("basisversions", { query: { id: w.id, project: w.project } })).versions.find((v) => v.name === "Seven days only");
  assert.ok(made && made.state === "suggested" && made.derived_from === w.reading, "and the real act made the narrower reading, suggested, derived from the one read");
});

test("R87 control: no part chosen, or no name or reason, sends no narrow and says so beside it; a leg of no reading is offered no Narrow", async () => {
  const { w, page } = await narrowWorld();
  const p = await page();
  await press(p, "narrow", { within: legRow(p, w.targets[0]) });
  const panel = main(p).querySelector("[data-narrow=panel]");
  fill(p, { "question-narrow-name": "Seven days only", "question-narrow-description": "why" });
  assert.ok(says(await press(p, "narrow", { within: panel }), "screen.question.narrow.empty"), "no part chosen");
  p.doc.getElementById("question-narrow-part-0").checked = true;
  fill(p, { "question-narrow-name": "", "question-narrow-description": "" });
  assert.ok(says(await press(p, "narrow", { within: panel }), "screen.question.narrow.empty"), "no name, no reason");
  assert.equal(p.byOp("narrow").length, 0);
  /* a question with no reading names no version to narrow (the world's question, concluded by no one, holds no reading) */
  const v = await worldOf();
  const none = await v.page();
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
  const p = await open(at, { ...A, plane: { hypothesishold: ok(holdRefusals().BAD_ABOUT) } });
  fill(p, { "question-hunch": "x" });
  const slot = await press(p, "hypothesishold");
  assert.ok(says(slot, "refusal.BAD_ABOUT"));
  assert.equal(p.doc.getElementById("question-hunch").value, "x");
});

/* ------------------------------------------------------------------------------------------------------------------ R89 */

/** A question whose strength has every axis graded and some legs left out, by real acts: a project of `ann`'s, the minutes of two meetings naming one ordinance (`recipes.connection`, the connection
 *  axis earned by resolution), a held page graded on capture, a member's own observation (`testify`, the testimony axis), and, as asked, a held document with no grade on any axis (`left`: a title each) and a
 *  document the question holds only as a hunch (`hunch`, its author and date on the leg, which `recipes.question` does not take, so the question is promoted here by the real act, as the recipe does).
 *  Answers `{world, a, id, answer, titleOf, page}`: `answer` is the owner's own `inquirystrength` read, `titleOf(target)` the title a target was held under. */
const LEG_KEYS = ["grade", "grade_axis", "grade_source", "author", "date"];
const strengthWorld = async ({ left = [], hunch = false } = {}) => {
  const world = await storeWorld();
  const admin = await world.signIn("admin");
  const ann = await world.signIn("ann", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  const made = await world.recipes.connection(admin, ann, { project });
  const a = made.as;
  const titles = new Map();
  const held = async (title) => { const b = (await world.recipes.hold(a, title, title + " text.", project)).bundle; titles.set(b, title); return b; };
  const legs = [{ target: await held("Capture page"), grade: "B", grade_axis: "capture", grade_source: "capture" },
    { target: made.documents[0], grade: "C", grade_axis: "connection", grade_source: "resolution" },
    { target: (await a.act("testify", { body: { words: "I saw the pothole at 4th and Main.", observedAt: "2026-10-04T09:10:00Z" } })).bundle_id, grade: "D", grade_axis: "testimony", grade_source: "testimony" }];
  for (const t of left) legs.push({ target: await held(t) });
  if (hunch) legs.push({ target: await held("Hunch page"), grade: "D", grade_axis: "connection", grade_source: "hunch", author: "member:ann", date: "2026-10-05" });
  const now = instant(world), title = "Seven days";
  const id = (await a.read("allocid", { query: { prefix: "INQ", year: now.slice(0, 4) } })).id + "-seven-days";
  const front = ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: ${JSON.stringify(title)}`, "current_state: open", "prior_state: null", `created: "${now}"`, `last_updated: "${now}"`,
    "surfaced_by: human", `project: ${project}`, `subject_entity: ${made.entity}`, "produced_by:", "  mode: assisted", "  capability_tier: session", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "references:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    rel: cites", "    status: confirmed"]),
    "basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports", ...LEG_KEYS.filter((k) => l[k] !== undefined).map((k) => `    ${k}: ${l[k]}`)]),
    "recheck_triggers:", "  - text: the sources change", "    description: a source this question rests on changes or is withdrawn", "---", ""];
  HEADINGS.inquiry.forEach((h, i) => { front.push(h, ""); if (i === 0) front.push("Is the city repairing reported potholes within seven days?", ""); });
  await a.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "inquiry", title, current_state: "open", created: now, last_updated: now }, files: [{ path: "bundle.md", text: front.join("\n") }], register: [] } });
  await a.act("drawquestion", { query: { project, inquiry: id, note: "" } });
  /* her answer to each passage: one set of reasons that rests on all of them, so the strength is shown */
  await a.act("inquiryground", { body: { target: id, grounds: [{ ground: "part 1", legs: legs.map((_, i) => i) }], reason: "my reading" } });
  const answer = await a.read("inquirystrength", { query: { id } });
  const page = async () => { const p = await boot({ screens: SCREENS, ...world.boot(a), path: "/app/question/" + id }); await p.settle(); return p; };
  return { world, a, id, answer, titleOf: (t) => titles.get(t) || "", page };
};

test("R89 the strength reading names what it leaves out: ungraded (legs not load-bearing) and hunches_left_out, each only above zero", async () => {
  const w = await strengthWorld({ left: ["Work orders", "Budget table"], hunch: true });
  /* the owner's own reading: every axis graded, two documents graded on none, one hunch left out */
  assert.deepEqual([w.answer.capture.state, w.answer.connection.state, w.answer.testimony.state], ["graded", "graded", "graded"]);
  assert.equal(w.answer.ungraded.length, 3, "two documents with no grade and the document held only as a hunch");
  assert.equal(w.answer.hunches_left_out, 1);
  const p = await w.page();
  const box = main(p).querySelector(".mk-strengthbox");
  const u = box.querySelector('[data-strength="ungraded"]'), h = box.querySelector('[data-strength="hunches"]');
  const left = w.answer.ungraded.map((m) => w.titleOf(m.target_id));
  assert.ok(u && u.getAttribute("data-count") === String(w.answer.ungraded.length) && says(u, "strength.arithmetic.present_and_not_yet_load_bearing", { legs: left.join(", ") }), "the legs not counted, by their titles");
  assert.ok(h && h.getAttribute("data-count") === String(w.answer.hunches_left_out) && says(h, "strength.hunch_why"), "one hunch left out");
  /* control: nothing left out draws nothing (R20); a hunch is never a leg, so no grade is drawn for it */
  const z = await strengthWorld();
  assert.deepEqual([z.answer.ungraded.length, z.answer.hunches_left_out], [0, 0]);
  const zp = await z.page();
  assert.equal(main(zp).querySelector('[data-strength="ungraded"]'), null);
  assert.equal(main(zp).querySelector('[data-strength="hunches"]'), null);
});

/* ------------------------------------------------------------------------------------------------------------------ R116 */

test("R116 the ungraded legs are named by their documents' titles, never their ids, each once", async () => {
  /* two citations of one page (two of its paragraphs) and one of a document graded on capture: the page is named once in the sentence about the axis nothing is graded on */
  const world = await storeWorld();
  const ann = await world.signIn("ann", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  const policy = (await world.recipes.page(ann, POLICY, { paragraphs: ["The Director shall repair each reported pothole.", "Repairs are recorded as closed when the crew reports the work complete."], project })).bundle;
  const orders = (await world.recipes.hold(ann, "Work orders", "The work orders of 2026.", project)).bundle;
  const id = (await world.recipes.question(ann, project, { title: "Seven days", text: "Is the city repairing reported potholes within seven days?", draw: true,
    legs: [{ target: policy, role: "supports", extent_kind: "doc-para", extent_para: 1 }, { target: policy, role: "supports", extent_kind: "doc-para", extent_para: 2 }, { target: orders, role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture" }] })).id;
  await ann.act("inquiryground", { body: { target: id, grounds: [{ ground: "part 1", legs: [0, 1, 2] }], reason: "my reading" } });
  const p = await boot({ screens: SCREENS, ...world.boot(ann), path: "/app/question/" + id });
  await p.settle();
  const box = main(p).querySelector(".mk-strengthbox");
  assert.ok(says(box, "strength.arithmetic.unrated_no_leg_on_this_axis", { axis: word("mark.scale.connection.name"), legs: POLICY + ", Work orders" }), "the titles once, joined");
  assert.equal(count(box.textContent, POLICY), 1, "each leg once");
  assert.doesNotMatch(main(p).textContent, /INFO-2026-\d{4}/, "never an id");
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
  const axis = word("mark.scale.connection.name");
  /* the states of the connection axis nothing is graded on, by real acts: every citation taken out, two sets of reasons, one set */
  const sentence = async (grounds, sever, key, vars) => {
    const w = await worldOf();
    await w.ann.act("inquiryground", { body: { target: w.id, grounds, reason: "my reading" } });
    for (const t of sever) {
      const sel = await w.ann.act("select", { body: { ids: [w.targets[t]] } });
      await w.ann.act("sever", { query: { project: w.id, handle: sel.handle, reason: "the wrong year's orders" }, body: {} });
    }
    const p = await w.page();
    const box = main(p).querySelector(".mk-strengthbox");
    assert.ok(says(box, key, vars), key);
    assert.doesNotMatch(main(p).textContent, /INFO-2026-\d{4}/, key + ": no id");
    return box;
  };
  await sentence([{ ground: "part 1", legs: [0, 1] }], [0, 1], "strength.arithmetic.unrated_this_inquiry_rests_on_nothing", { axis });
  await sentence([{ ground: "part 1", legs: [0] }, { ground: "part 2", legs: [1] }], [], "strength.arithmetic.unrated_no_leg_on_any_set", { axis, count: "2", legs: POLICY + ", Work orders" });
  await sentence([{ ground: "part 1", legs: [0, 1] }], [], "strength.arithmetic.unrated_no_leg_on_this_axis", { axis, legs: POLICY + ", Work orders" });
  /* a question whose every axis is graded, and two documents graded on none: the owner's own `ungraded` names them, and the screen draws them by their titles, once, as listed but not counted */
  const w = await strengthWorld({ left: [POLICY, "Work orders"] });
  assert.deepEqual([w.answer.capture.state, w.answer.connection.state, w.answer.testimony.state], ["graded", "graded", "graded"]);
  const p = await w.page();
  const listed = main(p).querySelector(".mk-strengthbox");
  const names = w.answer.ungraded.map((m) => w.titleOf(m.target_id));
  assert.deepEqual(names, [POLICY, "Work orders"]);
  assert.ok(says(listed, "strength.arithmetic.present_and_not_yet_load_bearing", { legs: names.join(", ") }));
  assert.doesNotMatch(main(p).textContent, /INFO-2026-\d{4}/, "no id");
  assert.equal(count(listed.textContent, POLICY), 1);
  /* control: nothing left out, no such sentence (a real question whose every axis is graded and every leg counted on one) */
  const c = await (await strengthWorld()).page();
  assert.ok(!says(main(c), "strength.arithmetic.present_and_not_yet_load_bearing", { legs: "0" }));
  assert.equal(main(c).querySelector('[data-strength="ungraded"]'), null);
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
  /* inquiry's real refusal of a partition that names a leg cutting against the answer: one finding, its detail the owner's own words */
  const real = groundAnswers().cutsAgainst;
  const first = real.findings[0];
  const { findings: _held, ...bare } = real;
  const go = async (answer) => {
    const p = await open(at, { plane: { inquiryground: ok(answer) } });
    assert.ok(main(p).querySelector("[data-state=ask], #state-b"), "state b: the question asks what each passage carries");
    return press(p, "inquiryground", { reason: "my answers" });
  };
  /* fixtures-own: synthetic the second finding is an input added to inquiry's real refusal, so the screen is seen to draw only the first */
  const named = await go({ ...real, findings: [first, { check: "C-9.9", detail: "an unrelated second finding" }] });
  assert.ok(named.textContent.includes(first.detail), "the first finding's detail");
  assert.ok(!named.textContent.includes("an unrelated second finding"), "only the first");
  assert.ok(!says(named, "refusal.BASIS_REFUSED"), "not the generic sentence");
  assert.ok(says(await go(bare), "refusal.BASIS_REFUSED"), "control: no findings, the generic sentence");
  assert.ok(says(await go({ ...bare, findings: [] }), "refusal.BASIS_REFUSED"), "control: an empty list, the generic sentence");
});
