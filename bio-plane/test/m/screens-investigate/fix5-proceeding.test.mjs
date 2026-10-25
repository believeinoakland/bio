/* screens-investigate R6, R34, R36, R47 (T51 fix round 10; K5148; WALK-FINAL-08 D3, D6, D10): the Proceeding page over `store-request`'s world:
   the passage a court link rests on and a party is recorded from are chosen by their words, never typed as a content id; fixed lists open blank. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inWorld, openAs, settled, readHeld, declareStandard } from "./world.mjs";
import { fill, press, main, word } from "./fixtures.mjs";

const REASON = "The decision says so.";
const DECISION = "The tribunal holds that the ordinance applies to every unit.\n\nThe petition is denied.";
const ORDINANCE = "Section 8.22.050 No landlord shall increase the rent above the limit the board sets.";

/** A proceeding the member registers (a court she adds, the number in the court's form), a party she follows, and two standards: a court's decision and the law. */
async function matter(world, me) {
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Rent case");
  const court = (await me.act("entitycreate", { body: { kind: "body", label: "Alameda Housing Tribunal", forum_kind: "court", note: "A court." } })).entity_id;
  const proc = (await me.act("entitycreate", { body: { kind: "proceeding", label: "Lease rent case", note: "From the caption.", proceeding: { forum: court, kind: "civil", number: "24CV123456" } } })).entity_id;
  const party = (await me.act("entitycreate", { body: { kind: "person", label: "Ana Rivera", note: "A tenant named in the filing." } })).entity_id;
  const decision = await world.recipes.hold(me, "Decision.txt", DECISION, project), law = await world.recipes.hold(me, "Ordinance.txt", ORDINANCE, project);
  const du = await readHeld(world, me, decision.sha), lu = await readHeld(world, me, law.sha);
  const std = await declareStandard(me, { cite: "Tribunal decision 24CV123456", kind: "court", issuer: "Alameda Housing Tribunal", sha: decision.sha, extent: du[0].extent });
  const ord = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: law.sha, extent: lu[0].extent });
  return { project, court, proc, party, decision, du, std, ord };
}

test("R6 R34 D3 Proceeding: 'Link a decision to what it interprets' rests on a passage of the decision chosen by its words, not a typed content id; nothing chosen refuses in place; the link is held", async () => {
  const { world, me } = await inWorld();
  const M = await matter(world, me);
  const p = await openAs(world, me, "/app/proceeding/" + M.proc);
  const cite = p.doc.getElementById("pr-citation");
  assert.ok(cite && /select/i.test(cite.tagName), "a choice, not a text field");
  fill(p, { "pr-court": M.std, "pr-law": M.ord, "pr-type": "interprets" });
  p.fire(p.doc.getElementById("pr-court"), "change");
  await settled(p);
  const options = p.doc.getElementById("pr-citation").querySelectorAll("option");
  assert.equal(options[0].getAttribute("value"), "", "it opens with nothing chosen");
  assert.ok(options.some((o) => o.textContent.includes(M.du[0].text)), "the decision's passages by their words");
  assert.ok(!options.some((o) => /[0-9a-f]{16,}/.test(o.textContent)), "no content id");
  await press(p, "courtlink", { reason: REASON });
  assert.equal(p.byOp("courtlink").length, 0, "nothing chosen, nothing sent");
  assert.ok(main(p).textContent.includes(word("screen.proceeding.link.empty")));
  const passage = options.find((o) => o.textContent.includes(M.du[0].text)).getAttribute("value");
  fill(p, { "pr-citation": passage });
  await press(p, "courtlink", { reason: REASON });
  await settled(p);
  const sent = p.byOp("courtlink");
  assert.equal(sent.length, 1);
  assert.deepEqual([sent[0].body.type, sent[0].body.from, sent[0].body.to, sent[0].body.citation], ["interprets", M.std, M.ord, passage]);
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null);
});

test("R6 R34 D6 Proceeding: 'Add a party by role' cites the passage chosen on the document by its words, and the role opens with nothing chosen", async () => {
  const { world, me } = await inWorld();
  const M = await matter(world, me);
  const p = await openAs(world, me, "/app/proceeding/" + M.proc);
  assert.equal(p.doc.getElementById("pr-role").querySelectorAll("option")[0].getAttribute("value"), "", "the role opens blank");
  fill(p, { "pr-party": M.party, "pr-doc": M.decision.sha });
  p.fire(p.doc.getElementById("pr-doc"), "change");
  await settled(p);
  await press(p, "recordline", { reason: REASON });
  assert.equal(p.byOp("recordline").length, 0, "no role chosen, nothing sent");
  const words = main(p).querySelectorAll("[data-words]").find((e) => e.getAttribute("data-words").startsWith("pr-passage-"));
  assert.ok(words, "the document's words are drawn to select from");
  await p.click(words.querySelectorAll('[data-shell="word"]')[1]);
  await p.settle();
  fill(p, { "pr-role": "petitioner" });
  await press(p, "recordline", { reason: REASON });
  await settled(p);
  const sent = p.byOp("recordline");
  assert.equal(sent.length, 1);
  assert.equal(sent[0].body.role, "petitioner");
  assert.deepEqual(sent[0].body.basis.extent, M.du[1].extent, "the second paragraph selected, not the whole document");
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "the party is recorded");
});

test("R36 R47 D10 Proceeding: the kind of proceeding opens with nothing chosen and a press without it refuses in place", async () => {
  const { world, me } = await inWorld();
  const M = await matter(world, me);
  const p = await openAs(world, me, "/app/proceeding");
  const kind = p.doc.getElementById("pr-kind");
  assert.ok(kind, "the kinds the profile names are offered");
  assert.equal(kind.querySelectorAll("option")[0].getAttribute("value"), "", "blank first");
  fill(p, { "pr-forum": M.court, "pr-number": "24CV999999", "pr-note": "From the caption." });
  await press(p, "entitycreate", { reason: REASON });
  assert.equal(p.byOp("entitycreate").length, 0, "no kind chosen, nothing sent");
  assert.ok(main(p).textContent.includes(word("screen.proceeding.create.empty")));
});
