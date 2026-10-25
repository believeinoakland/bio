/* screens-inquiry fix round 10 (T51), causes 30a and 17b (K5056, K5055; DEC-32 clauses 2 and 4; K4426). R30a (R23, R50): what each passage carries is a partition in which "No, my answer
 * falls" makes a passage NECESSARY (it belongs to no ground) and "Yes, because of these others" makes it independently sufficient with them; an all-"No" answer sends no ground
 * (`grounds: []`); an all-"Yes, because of the other" pair sends one ground holding both; the default (nothing answered "Yes") is AND. R17b (R2, R34): a leg citing a part of a document
 * other than its body (`doc-part`: a footnote, an endnote, a header) is placed by that part's own reference, as a page or a paragraph is, never by nothing. Sentences are asserted by
 * their keys' words (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, press, says, word, inquiryMd, section, P, Q, D } from "./fixtures.mjs";

process.env.TZ = "UTC";
const at = "/app/question/" + Q;
const T3 = [{ target: D, role: "supports", grade: "B" }, { target: "INFO-2026-0007", role: "supports", grade: "B" }, { target: "INFO-2026-0009", role: "supports", grade: "C" }];
const stateB = (legs = T3) => open(at, { images: { [Q]: { "bundle.md": inquiryMd(P, legs.map((l) => [l.target, "cites", "confirmed", null]), { legs }) } }, plane: { inquiryground: ok({ ok: true, act: "authored" }) } });
const tick = (p, id) => { p.doc.getElementById(id).checked = true; };
const save = async (p) => { await press(p, "inquiryground", { reason: "my reading" }); return p.byOp("inquiryground").at(-1).body; };

test("R30a R23 two passages both answered 'No, my answer falls' send no ground: both are necessary, in no part", async () => {
  const p = await stateB(T3.slice(0, 2));
  tick(p, "ask-0-0"); tick(p, "ask-1-0");
  const body = await save(p);
  assert.deepEqual(body.grounds, [], "no ground");
  assert.equal(body.target, Q);
});

test("R30a R23 control: a pair answered 'Yes, because of the other' send one ground holding both; a passage answered 'Yes' with no other named is a ground of its own", async () => {
  const pair = await stateB(T3.slice(0, 2));
  tick(pair, "ask-0-1"); tick(pair, "ask-which-0-0");
  tick(pair, "ask-1-1"); tick(pair, "ask-which-1-0");
  assert.deepEqual((await save(pair)).grounds, [{ ground: "part 1", legs: [0, 1] }], "one ground of both");
  const alone = await stateB(T3.slice(0, 2));
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
  const p = await stateB(T3.slice(0, 2));
  assert.deepEqual((await save(p)).grounds, []);
});

/* R17b: a question's leg whose extent names a part of the document (`doc-part`) is placed by its reference */
const partLeg = { target: D, role: "supports", grade: "B", extent_kind: "doc-part", extent_part: "word/footnotes.xml", extent_ref: "footnote 1" };
const where = (p) => section(p, "screen.question.supports.head");
test("R17b R2 a leg citing a footnote is placed by the footnote's own reference; legs placed by a page or a paragraph are unchanged", async () => {
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
