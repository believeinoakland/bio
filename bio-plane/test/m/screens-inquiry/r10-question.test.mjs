/* screens-inquiry fix round 10 (T51), causes 30a and 17b (K5056, K5055; DEC-32 clauses 2 and 4; K4426). R30a (R23, R50): what each passage carries is a partition in which "No, my answer
 * falls" makes a passage NECESSARY (it belongs to no ground) and "Yes, because of these others" makes it independently sufficient with them; an all-"No" answer sends no ground
 * (`grounds: []`); an all-"Yes, because of the other" pair sends one ground holding both; the default (nothing answered "Yes") is AND. R17b (R2, R34): a leg citing a part of a document
 * other than its body (`doc-part`: a footnote, an endnote, a header) is placed by that part's own reference, as a page or a paragraph is, never by nothing. Sentences are asserted by
 * their keys' words (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, ok } from "../interface-shell/harness.mjs";
import { open, storeWorld, SCREENS, main, press, says, inquiryMd, section, P, Q, D } from "./fixtures.mjs";
import { inquiryMd as realInquiryMd } from "../inquiry/fixture.mjs";

process.env.TZ = "UTC";
const GRADES = ["B", "B", "C"];
/** Hold `n` documents in a project, promote a question resting on them and boot its page: all by real acts over the world. */
const stateB = async (n = 3) => {
  const world = await storeWorld();
  const ann = await world.signIn("ann", { capabilities: ["contribute", "create_projects"] });
  const project = await world.recipes.project(ann, "Stormwater");
  const docs = [];
  for (let i = 0; i < n; i++) docs.push((await world.recipes.hold(ann, "Passage " + (i + 1), "The Director shall repair each reported pothole, part " + (i + 1) + ".", project)).bundle);
  const id = (await ann.read("allocid", { query: { prefix: "INQ", year: "2026" } })).id;
  const legs = docs.map((target, i) => ({ target, role: "supports", grade: GRADES[i], grade_axis: "capture", grade_source: "capture" }));
  const text = realInquiryMd(id, { question: "Seven days", legs, extra: ["project: " + project] });
  await ann.act("promote", { body: { bundleId: id, base: null, snapKey: "20261001T000000_aaaa", meta: { object_type: "inquiry", title: "Seven days", current_state: "open",
    created: "2026-09-27T00:00:00Z", last_updated: "2026-09-27T00:00:00Z" }, files: [{ path: "bundle.md", text }], register: [] } });
  const { door, session } = world.boot(ann);
  const p = await boot({ screens: SCREENS, door, session, path: "/app/question/" + id });
  await p.settle();
  p.question = id;
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
