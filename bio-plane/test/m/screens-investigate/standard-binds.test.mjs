/* screens-investigate R64 (T51 fix round 10; DEC-438; walk E C2a): "Whom it binds, and until when" on the Standard page, over `store-request`'s world.
   Every state is made by the members' own acts (`standarddeclare`, `entitycreate`, the four acts of this section) and every answer is the store's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inWorld, openAs, settled, readHeld, declareStandard } from "./world.mjs";
import { fill, press, main, actsIn, word, hasWord, dayOf } from "./fixtures.mjs";

const REASON = "The passage says so.";
const ORDINANCE = "Section 12.04 The Director shall keep the standard for every public street.\n\nSection 12.05 No street is exempt.";
const POLICY = "The Director shall repair each reported pothole within seven calendar days.\n\nCrews log each pothole they fill.";
const FROM = "2026-01-01", THROUGH = "2026-09-30";

/** A project holding an ordinance (in force from FROM) and a policy (in force from FROM, no end stated), each declared a standard over its first passage. */
async function laws(world, me) {
  const project = await world.recipes.project(me, "Pothole repairs");
  const doc = await world.recipes.hold(me, "Ordinance.txt", ORDINANCE, project);
  const memo = await world.recipes.hold(me, "Policy.txt", POLICY, project);
  const du = await readHeld(world, me, doc.sha), mu = await readHeld(world, me, memo.sha);
  const ord = await declareStandard(me, { cite: "Municipal Code 12.04", kind: "ordinance", sha: doc.sha, extent: du[0].extent, period: { from: FROM, to: null } });
  const pol = await declareStandard(me, { cite: "Public Works Instruction 9.1", kind: "policy", issuer: "Public Works Department", sha: memo.sha, extent: mu[0].extent, period: { from: FROM, to: null } });
  const body = (await me.act("entitycreate", { body: { kind: "body", label: "Oakland Public Works", note: "A city department." } })).entity_id;
  return { project, doc, memo, du, mu, ord, pol, body };
}

const through = (world, me, L, day = THROUGH) => me.act("standardinforcethrough", { body: { standard: L.pol, through: day, source: { captureSha: L.memo.sha, extent: L.mu[0].extent }, reason: REASON } });
const refusedIn = (p, code) => p.root().querySelector(`[data-gap="refused"][data-refusal="${code}"]`);

test("R64 the Standard page draws 'Whom it binds, and until when' with its one help line and the four acts, each in its own fold; with no day recorded it says so and offers no withdrawal", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  const text = main(p).textContent;
  assert.ok(text.includes(word("screen.standard.binds.head")), "the section");
  assert.equal(text.split(word("screen.standard.binds.help")).length - 1, 1, "its help, once");
  for (const op of ["standardinforcethrough", "standardadoption", "standardimpose", "standardbenchmark"]) {
    assert.ok(actsIn(main(p)).includes(op), `${op} offered`);
    assert.ok(text.includes(word(`act.${op}.label.standard`)), `${op} labelled by its key`);
  }
  assert.ok(text.includes(word("screen.standard.through.unknown", { from: dayOf(FROM) })), "no day recorded: the owner cannot tell, from the day the period began");
  assert.ok(!actsIn(main(p)).includes("standardinforcethroughwithdraw"), "nothing to withdraw");
  const own = await openAs(world, me, `/app/standard/${L.ord}`);
  assert.ok(main(own).textContent.includes(word("screen.standard.binds.head")), "an ordinance's page draws it too");
});

test("R64 standardinforcethrough: the day, the passage on a held document and a reason are sent; the page then draws the recorded day by the member's name and the document's title, and the withdrawal on it", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  fill(p, { "st-thr-day": THROUGH, "st-thr-doc": L.memo.sha });
  p.fire(p.doc.getElementById("st-thr-doc"), "change");
  await settled(p);
  await press(p, "standardinforcethrough", { reason: REASON });
  await settled(p);
  const sent = p.byOp("standardinforcethrough");
  assert.equal(sent.length, 1);
  assert.equal(sent[0].body.standard, L.pol, "the standard's own id");
  assert.equal(sent[0].body.through, THROUGH);
  assert.equal(sent[0].body.source.captureSha, L.memo.sha, "the document chosen");
  const held = await me.read("inforcethroughof", { query: { id: L.pol } });
  assert.equal(held.records.length, 1, "the day is recorded");
  assert.equal(held.records[0].through, THROUGH);
  const text = main(p).textContent;
  assert.ok(text.includes(word("screen.standard.through.recorded", { through: dayOf(THROUGH), source: "Policy.txt", name: me.handle })), "the recorded day, the document by its title, the member by name");
  assert.ok(!text.includes(word("screen.standard.through.unknown", { from: dayOf(FROM) })), "no longer undetermined");
  assert.ok(!text.includes(held.records[0].id) && !text.includes(L.memo.sha.slice(0, 12)), "no record id, no fingerprint");
  assert.ok(actsIn(main(p)).includes("standardinforcethroughwithdraw"), "withdrawable on a recorded day");
  const r = await me.read("standardinforce", { query: { id: L.pol, date: "2026-09-01" } });
  assert.equal(r.state, "in_force", "the owner now decides the day");
});

test("R64 standardinforcethroughwithdraw: the record on the page is the one sent, the record is kept withdrawn, and the page returns to the unknown state", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const made = await through(world, me, L);
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  assert.ok(main(p).textContent.includes(word("screen.standard.through.recorded", { through: dayOf(THROUGH), source: "Policy.txt", name: me.handle })));
  await press(p, "standardinforcethroughwithdraw", { reason: REASON });
  await settled(p);
  const sent = p.byOp("standardinforcethroughwithdraw");
  assert.equal(sent.length, 1);
  assert.equal(sent[0].body.record, made.record.id, "the record drawn");
  const held = await me.read("inforcethroughof", { query: { id: L.pol } });
  assert.equal(held.records.length, 0);
  assert.equal(held.withdrawn.length, 1, "kept, marked withdrawn");
  assert.ok(main(p).textContent.includes(word("screen.standard.through.unknown", { from: dayOf(FROM) })), "undetermined again");
  assert.ok(!actsIn(main(p)).includes("standardinforcethroughwithdraw"));
});

test("R64 standardadoption: the act, the edition, how and the passage of the act are sent, the act's own start as its day; the owner then answers the edition in force for the body", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  const act = p.doc.getElementById("st-ad-act");
  assert.ok(act && act.querySelectorAll("option").some((o) => o.getAttribute("value") === L.ord && o.textContent.includes("Municipal Code 12.04")), "the team's held acts, by citation");
  assert.ok(!act.querySelectorAll("option").some((o) => o.getAttribute("value") === L.pol), "not itself");
  const modes = p.doc.getElementById("st-ad-mode").querySelectorAll("option").map((o) => o.getAttribute("value")).filter(Boolean);
  assert.deepEqual([...modes].sort(), ["by_accreditation", "by_reference", "voluntary"]);
  for (const m of modes) assert.ok(p.doc.getElementById("st-ad-mode").textContent.includes(word("screen.standard.mode." + m)), `${m} worded by its key`);
  fill(p, { "st-ad-act": L.ord });
  p.fire(act, "change");
  await settled(p);
  const text = (await me.read("standard", { query: { id: L.ord } })).texts[0].content_id;
  const passage = p.doc.getElementById("st-ad-passage");
  assert.ok(passage && passage.querySelectorAll("option").some((o) => o.getAttribute("value") === text && o.textContent.includes(L.du[0].text)), "the act's own passages, by their words");
  fill(p, { "st-ad-edition": "2021", "st-ad-mode": "by_reference", "st-ad-passage": text });
  await press(p, "standardadoption", { reason: REASON });
  await settled(p);
  const sent = p.byOp("standardadoption");
  assert.equal(sent.length, 1);
  assert.deepEqual({ ...sent[0].body, reason: undefined }, { standard: L.pol, act: L.ord, edition: "2021", mode: "by_reference", citation: text, from: FROM, reason: undefined });
  const held = await me.read("editioninforce", { query: { id: L.pol, body: "City Council", date: "2026-06-01" } });
  assert.equal(held.edition, "2021", "the adoption is recorded for the act's issuer");
  assert.equal(refusedIn(p, "ADOPTION_NO_CITATION"), null, "nothing refused");
});

test("R64 standardimpose: the body is chosen among the team's offices and bodies and its id sent, with the law, its passage and a reason; the standard then binds the body", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  await through(world, me, L);
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  const body = p.doc.getElementById("st-im-body");
  assert.ok(body && body.querySelectorAll("option").some((o) => o.getAttribute("value") === L.body && o.textContent.includes("Oakland Public Works")), "the team's bodies, by name");
  assert.ok(!p.doc.getElementById("st-im-body").tagName.toLowerCase().includes("input"), "chosen, never typed");
  fill(p, { "st-im-law": L.ord });
  p.fire(p.doc.getElementById("st-im-law"), "change");
  await settled(p);
  const text = (await me.read("standard", { query: { id: L.ord } })).texts[0].content_id;
  fill(p, { "st-im-body": L.body, "st-im-passage": text });
  await press(p, "standardimpose", { reason: REASON });
  await settled(p);
  const sent = p.byOp("standardimpose");
  assert.equal(sent.length, 1);
  assert.deepEqual({ ...sent[0].body, reason: undefined }, { standard: L.pol, body: L.body, law: L.ord, citation: text, reason: undefined }, "the body's id, not its name");
  const held = await me.read("bindsat", { query: { id: L.pol, body: L.body, date: "2026-06-01" } });
  assert.equal(held.state, "binds", "the law makes it binding on the body");
});

test("R64 standardbenchmark: the body is chosen and its id sent; the standard is held as a benchmark for it and never binds it", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  await through(world, me, L);
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  fill(p, { "st-bm-body": L.body });
  await press(p, "standardbenchmark", { reason: REASON });
  await settled(p);
  const sent = p.byOp("standardbenchmark");
  assert.equal(sent.length, 1);
  assert.deepEqual({ ...sent[0].body, reason: undefined }, { standard: L.pol, body: L.body, reason: undefined });
  const held = await me.read("bindsat", { query: { id: L.pol, body: L.body, date: "2026-06-01" } });
  assert.equal(held.state, "benchmark");
  assert.equal(refusedIn(p, "NO_SUCH_ENTITY"), null, "nothing refused");
});

test("R64 each owner's refusal is drawn by its key beside the act, and nothing is written: a day before the period began, no document, no body, no edition", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  fill(p, { "st-thr-day": "2025-01-01", "st-thr-doc": L.memo.sha });
  p.fire(p.doc.getElementById("st-thr-doc"), "change");
  await settled(p);
  await press(p, "standardinforcethrough", { reason: REASON });
  await settled(p);
  const bad = refusedIn(p, "THROUGH_INVALID");
  assert.ok(bad && bad.textContent.includes(word("refusal.THROUGH_INVALID")), "the day before the period began, by its key");
  assert.equal((await me.read("inforcethroughof", { query: { id: L.pol } })).records.length, 0, "nothing written");
  fill(p, { "st-ad-mode": "by_reference" });
  await press(p, "standardadoption", { reason: REASON });
  await settled(p);
  const noEdition = refusedIn(p, "ADOPTION_NO_EDITION");
  assert.ok(noEdition && noEdition.textContent.includes(word("refusal.ADOPTION_NO_EDITION")), "no edition, by its key");
  assert.ok(hasWord("refusal.NO_SUCH_ENTITY"));
  const q = await openAs(world, me, `/app/standard/${L.pol}`);
  fill(q, { "st-bm-body": "" });
  await press(q, "standardbenchmark", { reason: REASON });
  await settled(q);
  const noBody = refusedIn(q, "NO_SUCH_ENTITY");
  assert.ok(noBody && noBody.textContent.includes(word("refusal.NO_SUCH_ENTITY")), "no body, by its key");
});
