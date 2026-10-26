/* screens-inquiry R50 (K5233): the clauses of "Conclude takes a member's own reading" that t50's test does not name: who wrote the reading ("Concluded by", "Written by"),
 * the 500-character bound, and `refusal.BAD_READING` and `refusal.NO_BASIS` drawn by their words. On interface-shell's served page over the real store world (store-request),
 * the plane's answers its own: nothing here is scripted but the one retarget of NO_BASIS, which still answers from the world's door. Every expectation is read from the word table (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, counted } from "../interface-shell/harness.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { storeWorld, press, fill, says, section, word, SCREENS } from "./fixtures.mjs";

process.env.TZ = "UTC";
const OWN = { capabilities: ["contribute", "create_projects"] };
/** A project with a held passage, a question resting on it, and one resting on nothing (both drawn into the project), by real acts; `page(id, opts)` boots a question's page over the world. */
async function stateWorld() {
  const world = await storeWorld();
  const ann = await world.signIn("ann", OWN);
  const project = await world.recipes.project(ann, "Stormwater");
  const doc = (await world.recipes.hold(ann, "Passage", "The Director shall repair each reported pothole within seven days.", project)).bundle;
  const leg = { target: doc, role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture" };
  const id = (await world.recipes.question(ann, project, { title: "Seven days", text: "Do crews repair each pothole within seven days?", legs: [leg], draw: true })).id;
  const bare = (await world.recipes.question(ann, project, { title: "Resting on nothing", text: "Is anything held?", legs: [], draw: true })).id;
  const { door, session } = world.boot(ann);
  const page = async (qid, o = {}) => { const p = await boot({ screens: SCREENS, door, session, path: "/app/question/" + qid, ...o }); await p.settle(); return p; };
  return { world, ann, project, id, bare, door, page };
}
const fillAll = (p, own) => fill(p, { "question-conclude-own": own, "question-conclude-falsifier": "records showing repair took longer", "question-conclude-reason": "the passage says so" });

test("R50 a conclusion on her own reading says who concluded it and who wrote it: the member is named in both, and the reading is not marked machine work", async () => {
  const w = await stateWorld();
  const p = await w.page(w.id);
  fillAll(p, "Most reports are repaired within seven days.");
  await press(p, "conclude");
  assert.equal(p.byOp("conclude").length, 1);
  const g = await w.page(w.id);
  const sec = section(g, "question.concluded.heading");
  assert.ok(sec, "the conclusion is drawn");
  const who = w.ann.member;
  const lead = word("question.concluded.by", { who: "@@", date: "##" }).split("@@")[0].trim();
  assert.ok(sec.textContent.includes(lead) && sec.textContent.includes(who), "Concluded by the member: " + sec.textContent.slice(0, 200));
  assert.ok(says(sec, "question.reading.by.member", { member: who }), "Written by the member");
  assert.equal(sec.querySelector('[data-origin="machine"]'), null);
  assert.ok(sec.textContent.includes("Most reports are repaired within seven days."), "her own words are the claim");
  /* control: a question not concluded draws neither sentence */
  const open = await w.page(w.bare);
  assert.equal(section(open, "question.concluded.heading"), undefined);
});

test("R50 the reading is 1 to 500 characters: 500 is sent whole as `reading`; 501 is refused in place by refusal.BAD_READING and nothing is sent", async () => {
  const w = await stateWorld();
  const p = await w.page(w.id);
  fillAll(p, "a".repeat(501));
  const refused = await press(p, "conclude");
  assert.ok(says(refused, "refusal.BAD_READING"), "501 characters is refused in the words held");
  assert.equal(p.byOp("conclude").length, 0, "nothing is sent");
  fillAll(p, "b".repeat(500));
  await press(p, "conclude");
  const q = p.byOp("conclude")[0].query;
  assert.equal(q.reading, "b".repeat(500), "500 characters are sent whole");
  assert.ok(!("version" in q), "reading in place of version");
  /* one character is the lower bound: the screen sends it and the plane answers for itself */
  const w2 = await stateWorld();
  const one = await w2.page(w2.id);
  fillAll(one, "c");
  await press(one, "conclude");
  assert.equal(one.byOp("conclude")[0].query.reading, "c", "one character is sent");
});

test("R50 the plane's own refusal of a reading that says too little (BAD_READING) is drawn in the word held for it, and nothing is concluded", async () => {
  const w = await stateWorld();
  const p = await w.page(w.id);
  fillAll(p, "ab");
  const out = await press(p, "conclude");
  assert.ok(hasWord("refusal.BAD_READING"));
  assert.ok(says(out, "refusal.BAD_READING"), "drawn by its key: " + String(out && out.textContent).slice(0, 200));
  const g = await w.page(w.id);
  assert.equal(section(g, "question.concluded.heading"), undefined, "the question is not concluded");
});

test("R50 a conclusion that rests on nothing is refused by the plane with NO_BASIS and drawn in the word held for it, never the plane's English", async () => {
  const w = await stateWorld();
  /* the page stands on the question with a passage; the plane answers its own conclude, asked of the question that rests on nothing (the retarget is the only scripting; the answer is the world's) */
  const p = await w.page(w.id, { plane: { conclude: counted((req) => w.door({ ...req, url: req.url.replace(encodeURIComponent(w.id), encodeURIComponent(w.bare)), query: { ...req.query, target: w.bare } })) } });
  fillAll(p, "Most reports are repaired within seven days.");
  const out = await press(p, "conclude");
  assert.ok(hasWord("refusal.NO_BASIS"));
  assert.ok(says(out, "refusal.NO_BASIS"), "drawn by its key: " + String(out && out.textContent).slice(0, 300));
  /* control: the question that rests on a passage is concluded by the same words */
  const ok = await w.page(w.id);
  fillAll(ok, "Most reports are repaired within seven days.");
  assert.ok(!says(await press(ok, "conclude"), "refusal.NO_BASIS"));
});
