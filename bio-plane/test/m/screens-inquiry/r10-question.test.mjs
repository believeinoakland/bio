/* screens-inquiry fix round 10 (T51), causes 30a and 17b (K5056, K5055; DEC-32 clauses 2 and 4; K4426). R30a (R23, R50): what each passage carries is a partition in which "No, my answer
 * falls" makes a passage NECESSARY (it belongs to no ground) and "Yes, because of these others" makes it independently sufficient with them; an all-"No" answer sends no ground
 * (`grounds: []`); an all-"Yes, because of the other" pair sends one ground holding both; the default (nothing answered "Yes") is AND. R17b (R2, R34): a leg citing a part of a document
 * other than its body (`doc-part`: a footnote, an endnote, a header) is placed by that part's own reference, as a page or a paragraph is, never by nothing. Sentences are asserted by
 * their keys' words (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, ok } from "../interface-shell/harness.mjs";
import { open, storeWorld, SCREENS, main, press, says, fill, inquiryMd, section, P, Q, D } from "./fixtures.mjs";
import { word } from "../../../src/setup-words/index.mjs";

process.env.TZ = "UTC";
const GRADES = ["B", "B", "C"];
/** Hold `n` documents in a project, promote a question resting on them and boot its page: all by real acts over the world. */
const stateB = async (n = 3) => {
  const world = await storeWorld();
  const ann = await world.signIn("ann", { capabilities: ["contribute", "create_projects"] });
  const project = await world.recipes.project(ann, "Stormwater");
  const docs = [];
  for (let i = 0; i < n; i++) docs.push((await world.recipes.hold(ann, "Passage " + (i + 1), "The Director shall repair each reported pothole, part " + (i + 1) + ".", project)).bundle);
  const legs = docs.map((target, i) => ({ target, role: "supports", grade: GRADES[i], grade_axis: "capture", grade_source: "capture" }));
  const id = (await world.recipes.question(ann, project, { title: "Seven days", text: "Do crews repair each pothole within seven days?", legs, draw: true })).id;
  const { door, session } = world.boot(ann);
  const p = await boot({ screens: SCREENS, door, session, path: "/app/question/" + id });
  await p.settle();
  p.question = id;
  p.project = project;
  p.ann = ann;
  return p;
};
const tick = (p, id) => { p.doc.getElementById(id).checked = true; };
const save = async (p) => { await press(p, "inquiryground", { reason: "my reading" }); return p.byOp("inquiryground").at(-1).body; };

test("R30a R23 two passages both answered 'No, my answer falls' send no ground: both are necessary, in no part", async () => {
  const p = await stateB(2);
  tick(p, "ask-0-0"); tick(p, "ask-1-0");
  const body = await save(p);
  assert.deepEqual(body.grounds, [], "no ground");
  assert.equal(body.target, p.question);
});

test("R30a R23 control: a pair answered 'Yes, because of the other' send one ground holding both; a passage answered 'Yes' with no other named is a ground of its own", async () => {
  const pair = await stateB(2);
  tick(pair, "ask-0-1"); tick(pair, "ask-which-0-0");
  tick(pair, "ask-1-1"); tick(pair, "ask-which-1-0");
  assert.deepEqual((await save(pair)).grounds, [{ ground: "part 1", legs: [0, 1] }], "one ground of both");
  const alone = await stateB(2);
  tick(alone, "ask-0-1"); tick(alone, "ask-1-0");
  assert.deepEqual((await save(alone)).grounds, [{ ground: "part 1", legs: [0] }], "the 'Yes' passage stands alone as a ground; the 'No' one is necessary beside it");
});

test("R30a R23 one 'No' and two holding each other up send one ground of two; the first stands unlabelled", async () => {
  const p = await stateB();
  tick(p, "ask-0-0"); tick(p, "ask-1-1"); tick(p, "ask-which-1-1");
  const body = await save(p);
  assert.deepEqual(body.grounds, [{ ground: "part 1", legs: [1, 2] }]);
  assert.ok(body.grounds.every((g) => !g.legs.includes(0)), "the 'No' passage is in no ground");
});

test("R30a R23 nothing answered 'Yes' is AND: the passages left unanswered are necessary and send no ground", async () => {
  const p = await stateB(2);
  assert.deepEqual((await save(p)).grounds, []);
});

/* R23 (cause 30b, K5059): what each passage carries is read back from what the plane holds. A question answered all "No" holds an EMPTY partition; the page reads it back
   (each passage "No, my answer falls") and is not the unanswered state again. A mixed answer reads back with the "No" passage beside the grounds, a necessary leg. */
const carries = (p) => main(p).querySelectorAll("[data-carries]").map((e) => e.getAttribute("data-carries"));
const asked = (p) => main(p).querySelectorAll('[data-state="ask"]').length;
test("R23 R30b after 'Save the answers' with every passage answered 'No', the page reads the held empty partition back: each passage 'No, my answer falls', not the unanswered state", async () => {
  const p = await stateB(2);
  assert.equal(asked(p), 1, "before the save: state b");
  tick(p, "ask-0-0"); tick(p, "ask-1-0");
  assert.deepEqual((await save(p)).grounds, []);
  assert.equal(asked(p), 0, "the questions are not asked again: the answer is held");
  assert.deepEqual(carries(p), ["falls", "falls"], "each passage is drawn 'No, my answer falls'");
  assert.ok(main(p).textContent.includes(word("question.falls")), "the sentence is the key's words");
});
test("R23 R30b a mixed answer: the 'No' passage stands beside the ground as a necessary leg, the two that hold each other up read back as holding", async () => {
  const p = await stateB(3);
  tick(p, "ask-0-0"); tick(p, "ask-1-1"); tick(p, "ask-which-1-1");
  assert.deepEqual((await save(p)).grounds, [{ ground: "part 1", legs: [1, 2] }]);
  assert.equal(asked(p), 0);
  assert.deepEqual(carries(p), ["falls", "holds", "holds"]);
});
test("R23 control: a question never answered draws the questions, none preselected, with no read-back of an answer", async () => {
  const p = await stateB(2);
  assert.equal(asked(p), 1);
  assert.deepEqual(carries(p), []);
  assert.ok(!p.doc.getElementById("ask-0-0").checked && !p.doc.getElementById("ask-0-1").checked);
});

/* R50 (cause 30b): concluding on her own reading asks the affirmation only for parts that are alternatives, one tick for each; the ticked parts go as \`affirmed\`;
   necessary passages, which form no part, ask none. Over the real plane. */
const conclude = async (p, { own = "Crews close reported potholes within a week.", ticks = [] } = {}) => {
  fill(p, { "question-conclude-own": own, "question-conclude-falsifier": "work orders showing repairs after seven days", "question-conclude-reason": "the sources agree" });
  for (const id of ticks) tick(p, id);
  await press(p, "conclude");
  return p.byOp("conclude").at(-1);
};
/** the plane's own answer: the project stands on the reading she wrote and the question is concluded */
const concluded = async (p) => {
  const r = await p.ann.read("basisversions", { query: { id: p.question, project: p.project } });
  return !!(r && r.conclusion);
};
const twoGrounds = async () => {
  const p = await stateB(3);
  tick(p, "ask-0-1"); tick(p, "ask-1-1"); tick(p, "ask-2-0"); /* two passages each enough alone, the third necessary */
  assert.deepEqual((await save(p)).grounds, [{ ground: "part 1", legs: [0] }, { ground: "part 2", legs: [1] }]);
  return p;
};
test("R50 R30b an own reading over two separately sufficient parts draws one tick for each, and sends the ticked parts as affirmed; the plane concludes", async () => {
  const p = await twoGrounds();
  const ticks = main(p).querySelectorAll('input[name="affirm-own"]');
  assert.equal(ticks.length, 2, "one tick for each alternative part");
  const sent = await conclude(p, { ticks: ["affirm-own-0", "affirm-own-1"] });
  assert.deepEqual(String(sent.query.affirmed).split(",").sort(), ["part 1", "part 2"]);
  assert.equal(sent.query.version, undefined, "her own reading, no version");
  assert.equal(main(p).querySelectorAll('[role="alert"]').length, 0, "no refusal drawn: " + main(p).querySelectorAll('[role="alert"]').map((e) => e.textContent).join(" | "));
  assert.ok(await concluded(p), "the plane concluded on her own reading");
});
test("R50 R30b control: a part left unticked is refused by its words, naming the part, and nothing is concluded", async () => {
  const p = await twoGrounds();
  await conclude(p, { ticks: ["affirm-own-0"] });
  assert.ok(says(main(p), "refusal.VERSION_AFFIRMATION_INCOMPLETE", { part: "part 2" }), "the part left out is named: " + main(p).querySelectorAll('[role="alert"]').map((e) => e.textContent).join(" | "));
  assert.ok(!(await concluded(p)), "nothing is concluded");
});
test("R50 R30b control: one ground beside a necessary passage, and every passage answered 'No', ask no affirmation and send none", async () => {
  const one = await stateB(3);
  tick(one, "ask-0-1"); tick(one, "ask-1-0"); tick(one, "ask-2-0");
  assert.deepEqual((await save(one)).grounds, [{ ground: "part 1", legs: [0] }]);
  assert.equal(main(one).querySelectorAll('input[name="affirm-own"]').length, 0, "one part: nothing asked");
  assert.equal((await conclude(one)).query.affirmed, undefined);
  const none = await stateB(2);
  tick(none, "ask-0-0"); tick(none, "ask-1-0"); await save(none);
  assert.equal(main(none).querySelectorAll('input[name="affirm-own"]').length, 0);
  assert.equal((await conclude(none)).query.affirmed, undefined);
});

/* R17b: a question's leg whose extent names a part of the document (`doc-part`) is placed by its reference */
/* a footnote's extent needs a reading of the document (content C-45.2: no chain, no passage), which no act of the world makes (the reader is an
   environment double): this one question stays on the scripted page, its `basisversions` the one answer left by hand */
const partLeg = { target: D, role: "supports", grade: "B", extent_kind: "doc-part", extent_part: "word/footnotes.xml", extent_ref: "footnote 1" };
const where = (p) => section(p, "screen.question.supports.head");
test("R17b R2 a leg citing a footnote is placed by the footnote's own reference; legs placed by a page or a paragraph are unchanged", async () => {
  const at = "/app/question/" + Q;
  const legsOf = (l) => [l];
  const doc = (l) => open(at, { images: { [Q]: { "bundle.md": inquiryMd(P, [[D, "cites", "confirmed", null]], { legs: legsOf(l) }) } }, plane: { basisversions: ok({ ok: true, inquiry: Q, versions: [] }) } });
  const footnote = await doc(partLeg);
  assert.ok(where(footnote).textContent.includes("footnote 1"), "the line carries the part's reference: " + where(footnote).textContent.slice(0, 300));
  const page = await doc({ target: D, role: "supports", grade: "B", extent_page: 2 });
  assert.ok(says(where(page), "screen.document.passage.where", { page: "3" }), "a page leg is placed by its page, one-based");
  assert.ok(!where(page).textContent.includes("footnote 1"));
  const para = await doc({ target: D, role: "supports", grade: "B", extent_para: 4 });
  assert.ok(says(where(para), "screen.question.leg.paragraph", { n: "5" }), "a paragraph leg is placed by its paragraph, one-based");
});
