/* screens-investigate R8, R34, R51 (T51 fix round 10; K5148; WALK-FINAL-08 D2, D4, D6, D7, D8, D9, D10, R70.12): the Standard page over `store-request`'s world.
   The standards, bodies and relations are made by the members' own acts (`standarddeclare`, `entitycreate`, `lawrelate`); every answer is the store's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inWorld, openAs, settled, readHeld, refused, declareStandard, rewrite } from "./world.mjs";
import { fill, press, main, word, hasWord } from "./fixtures.mjs";

const REASON = "The passage says so.";
const ORDINANCE = "Section 8.22.050 No landlord shall increase the rent above the limit the board sets.\n\nSection 8.22.020 No landlord shall retaliate against a tenant who complains.";
const POLICY = "The Director shall repair each reported pothole within seven calendar days.\n\nCrews log each pothole they fill.";

/** A project holding an ordinance and a policy, each declared a standard over its first passage, the policy implementing the ordinance. */
async function laws(world, me) {
  const project = await world.recipes.project(me, "Pothole repairs");
  const doc = await world.recipes.hold(me, "Ordinance.txt", ORDINANCE, project);
  const memo = await world.recipes.hold(me, "Policy.txt", POLICY, project);
  const du = await readHeld(world, me, doc.sha), mu = await readHeld(world, me, memo.sha);
  const ord = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: doc.sha, extent: du[0].extent });
  const pol = await declareStandard(me, { cite: "Public Works Instruction 9.1", kind: "policy", issuer: "Public Works Department", sha: memo.sha, extent: mu[0].extent, period: { from: "2026-01-01", to: null } });
  return { project, doc, memo, du, mu, ord, pol };
}

test("R8 D2 Standard: 'Relate to a law' from a standard opened under its project sends the standard's own id as `from`, and the relation is held", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const p = await openAs(world, me, `/app/standard/${L.pol}/${L.project}`);
  const text = (await me.read("standard", { query: { id: L.pol } })).texts[0].content_id;
  fill(p, { "st-type": "implements", "st-to": L.ord, "st-citation": text });
  await press(p, "lawrelate", { reason: REASON });
  await settled(p);
  const sent = p.byOp("lawrelate");
  assert.equal(sent.length, 1);
  assert.equal(sent[0].body.from, L.pol, "the standard's id, not its path");
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "nothing refused");
  const held = await me.read("lawrelations", { query: { id: L.pol } });
  assert.equal(held.referential.filter((r) => !r.withdrawn).length, 1, "the relation is held");
});

test("R8 R34 D3, D10 Standard: the passage that says a relation is chosen among the standard's own passages, by their words, never typed as a content id; a press with nothing chosen refuses in place", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  const cite = p.doc.getElementById("st-citation");
  assert.ok(cite && /select/i.test(cite.tagName), "a choice, not a text field");
  const options = cite.querySelectorAll("option");
  assert.equal(options[0].getAttribute("value"), "", "it opens with nothing chosen");
  assert.ok(options.some((o) => o.textContent.includes(L.mu[0].text)), "each passage by its words");
  assert.ok(!options.some((o) => /[0-9a-f]{16,}/.test(o.textContent)), "no content id is shown");
  assert.ok(!main(p).textContent.toLowerCase().includes("content id"), "no label or help says 'content id'");
  fill(p, { "st-to": L.ord });
  await press(p, "lawrelate", { reason: REASON });
  assert.equal(p.byOp("lawrelate").length, 0, "nothing chosen sends nothing");
  assert.ok(main(p).textContent.includes(word("screen.standard.relate.empty")), "and says so in place");
});

test("R8 D10 Standard: the kind and the way it relates open with nothing chosen, and a press with either missing refuses in place", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  for (const id of ["st-kind", "st-type"]) {
    const sel = p.doc.getElementById(id);
    assert.equal(sel.querySelectorAll("option")[0].getAttribute("value"), "", `${id} opens blank`);
    assert.ok(!sel.querySelectorAll("option").some((o) => o.getAttribute("selected") !== null && o.getAttribute("selected") !== false && o.getAttribute("value") !== ""), `${id}: no option is drawn chosen`);
  }
  fill(p, { "st-cite": "Instruction 12", "st-issuer": "Public Works" });
  await press(p, "standarddeclare", { reason: REASON });
  assert.equal(p.byOp("standarddeclare").length, 0, "no kind chosen, nothing sent");
  assert.ok(main(p).textContent.includes(word("screen.standard.declare.empty")));
  const text = (await me.read("standard", { query: { id: L.pol } })).texts[0].content_id;
  fill(p, { "st-to": L.ord, "st-citation": text });
  await press(p, "lawrelate", { reason: REASON });
  assert.equal(p.byOp("lawrelate").length, 0, "no way of relating chosen, nothing sent");
});

test("R8 D4 Standard: the page draws the words the plane composes for the standard (`says`): a policy's owner, the kind of copy it is, each beside the passages", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const says = (await me.read("standard", { query: { id: L.pol } })).says;
  assert.ok(says.owner && says.copy, "the plane composes an owner and a copy for a policy");
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  for (const k of ["owner", "copy"]) assert.ok(main(p).textContent.includes(says[k]), `the page draws says.${k}`);
  const ord = await openAs(world, me, `/app/standard/${L.ord}`);
  assert.ok(!main(ord).textContent.includes(says.owner), "control: an ordinance has no policy owner");
});

test("R8 R34 D6 Standard: 'Hold this as a standard' chooses the passage on the document by its words; the standard rests on the words selected, not the whole document", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  fill(p, { "st-doc": L.doc.sha });
  p.fire(p.doc.getElementById("st-doc"), "change");
  await settled(p);
  const words = main(p).querySelectorAll("[data-words]").find((e) => e.getAttribute("data-words").startsWith("st-passage-"));
  assert.ok(words, "the document's words are drawn to select from");
  await p.click(words.querySelectorAll('[data-shell="word"]')[1]);
  await p.settle();
  fill(p, { "st-cite": "Ordinance 8.22.020", "st-kind": "ordinance", "st-issuer": "City Council" });
  await press(p, "standarddeclare", { reason: REASON });
  await settled(p);
  const sent = p.byOp("standarddeclare");
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].body.text[0].extent, L.du[1].extent, "the second paragraph selected, not the whole document");
});

test("R8 D7 Standard: the kind choice offers every kind the store accepts, 'Court decision' included, and the kind chosen is sent", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const kinds = (await refused(world, me, "standarddeclare", { cite: "x", kind: "zzz", issuer: "x", reason: "x", text: [] })).kinds;
  assert.ok(kinds.includes("court") && kinds.length >= 7, "the store's own list");
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  const offered = p.doc.getElementById("st-kind").querySelectorAll("option").map((o) => o.getAttribute("value")).filter(Boolean);
  assert.deepEqual([...offered].sort(), [...kinds].sort());
  fill(p, { "st-doc": L.doc.sha, "st-cite": "State v. City", "st-kind": "court", "st-issuer": "Superior Court" });
  p.fire(p.doc.getElementById("st-doc"), "change");
  await settled(p);
  await press(p, "standarddeclare", { reason: REASON });
  await settled(p);
  assert.equal(p.byOp("standarddeclare")[0].body.kind, "court");
});

test("R8 R23 D8 Standard: a related law is named by its citation, never its id, and an incoming relation is not worded as this standard doing it", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const cite = (await me.read("standard", { query: { id: L.pol } })).texts[0].content_id;
  await me.act("lawrelate", { body: { type: "implements", from: L.pol, to: L.ord, citation: cite, reason: REASON } });
  const out = await openAs(world, me, `/app/standard/${L.pol}`);
  const into = await openAs(world, me, `/app/standard/${L.ord}`);
  const rowOf = (p) => main(p).querySelectorAll("[data-relation]")[0];
  assert.ok(rowOf(out) && rowOf(into), "each page draws the relation");
  assert.ok(rowOf(out).textContent.includes("Ordinance 8.22") && rowOf(into).textContent.includes("Public Works Instruction 9.1"), "the other end by its citation");
  assert.ok(!/STD-2026-/.test(main(out).textContent + main(into).textContent), "no id");
  assert.equal(rowOf(out).getAttribute("data-direction"), "out");
  assert.equal(rowOf(into).getAttribute("data-direction"), "in");
  /* where the word table holds the incoming verb it is drawn; else the other end comes first and the arrow runs from it to the verb */
  const inKey = "screen.standard.rel.in.implements";
  const text = rowOf(into).textContent;
  if (hasWord(inKey)) assert.ok(text.includes(word(inKey)), "the incoming verb's own word");
  else assert.ok(text.indexOf("Public Works Instruction 9.1") < text.indexOf(word("screen.standard.rel.implements")), "the other end first, then the verb: it is the policy that implements");
});

test("R8 D9 Standard: 'Who set it' chooses among the registered bodies and sends the body's id, or takes a typed name; the standard then binds that body", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const body = (await me.act("entitycreate", { body: { kind: "body", label: "Public Works Department", note: "A city department." } })).entity_id;
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  const issuer = p.doc.getElementById("st-issuer-body");
  assert.ok(issuer && issuer.querySelectorAll("option").some((o) => o.textContent.includes("Public Works Department")), "the registered bodies are offered by name");
  fill(p, { "st-doc": L.memo.sha, "st-cite": "Instruction 12", "st-kind": "policy", "st-issuer-body": body });
  p.fire(p.doc.getElementById("st-doc"), "change");
  await settled(p);
  await press(p, "standarddeclare", { reason: REASON });
  await settled(p);
  assert.equal(p.byOp("standarddeclare")[0].body.issuer, body, "the body's id");
  const typed = await openAs(world, me, `/app/standard/${L.pol}`);
  fill(typed, { "st-doc": L.memo.sha, "st-cite": "Instruction 13", "st-kind": "policy", "st-issuer": "The Parks Office" });
  typed.fire(typed.doc.getElementById("st-doc"), "change");
  await settled(typed);
  await press(typed, "standarddeclare", { reason: REASON });
  assert.equal(typed.byOp("standarddeclare")[0].body.issuer, "The Parks Office", "a name that is not listed, as typed");
});

test("R51 R70.12 Standard: a version known in force through a day is drawn with no stamp, and the member who recorded it by name when the answer states who", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const L = await laws(world, me);
  await me.act("standardinforcethrough", { body: { standard: L.pol, through: "2026-09-30", source: { captureSha: L.memo.sha, extent: L.mu[0].extent }, reason: REASON } });
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  fill(p, { "st-inforce-day": "2026-09-01" });
  await press(p, "standardinforce");
  await settled(p);
  const r = await me.read("standardinforce", { query: { id: L.pol, date: "2026-09-01" } });
  assert.equal(r.state, "in_force");
  assert.ok(main(p).textContent.includes(word("screen.standard.inforce.state.in_force")));
  assert.ok(!/member:/.test(main(p).textContent), "no stamp");
  /* the answer that states who recorded it (`known_through`, `standards` R51; the op does not answer it yet: reported) */
  const states = rewrite(world, me, (req, a) => (req.query && req.query.date && a.json && a.json.result && a.json.result.state === "in_force"
    ? { ...a, json: { ...a.json, result: { ...a.json.result, known_through: { through: "2026-09-30", source: { captureSha: L.memo.sha, extent: L.mu[0].extent }, by: "member:" + me.member } } } } : a));
  const q = await openAs(world, me, `/app/standard/${L.pol}`, { plane: { standardinforce: states } });
  fill(q, { "st-inforce-day": "2026-09-01" });
  await press(q, "standardinforce");
  await settled(q);
  const drawn = main(q).querySelector("[data-inforce]").textContent;
  assert.ok(drawn.includes(word("standard.inforce.known", { through: "September 30, 2026", source: "Policy.txt", author: me.handle })), "the member by name, her handle");
  assert.ok(!drawn.includes("recorded by admin"), "never her id");
  assert.ok(!drawn.includes(L.memo.sha.slice(0, 12)), "the source is the document's title, never its fingerprint");
});

/* K5178: `standardinforce` does not yet answer `known_through` (STANDARDS' merge); the test over the world's own answer follows it */
test.todo("K5178 R51 the world's own standardinforce answer carries known_through {through, source: {captureSha, extent}, by}, and the screen draws the member by name and the source by title");
