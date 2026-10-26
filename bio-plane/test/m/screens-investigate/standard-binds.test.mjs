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
/** The refusal drawn beside an act for `code`: the shell draws the owner's words for it (`refusal.<CODE>`), so it is found by those words. */
const refusedIn = (p, code) => p.root().querySelectorAll('[data-gap="refused"]').find((e) => e.textContent.includes(word("refusal." + code))) || null;
/** The first passage of the document chosen in `picker` (`st-thr-passage`), selected by its words as a member selects it. */
async function selectFirst(p, picker) {
  const words = main(p).querySelectorAll("[data-words]").find((e) => e.getAttribute("data-words").startsWith(picker + "-"));
  assert.ok(words, "the document's words are drawn to select from");
  await p.click(words.querySelectorAll('[data-shell="word"]')[0]);
  await p.settle();
}

test("R64 the Standard page draws 'Whom it binds, and until when' with its one help line and the four acts, each in its own fold; with no day recorded it says so and offers no withdrawal", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  const text = main(p).textContent;
  assert.ok(text.includes(word("screen.standard.binds.head")), "the section");
  const head = main(p).querySelectorAll("h2").find((h) => h.textContent === word("screen.standard.binds.head"));
  /* the kit draws a help as the head's tip, its HTML escapes included */
  const tip = head ? String(head.getAttribute("data-tip")).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: "\"", "#39": "'" }[e])) : "";
  assert.ok(head && tip.includes(word("screen.standard.binds.help")), "its one help line, under the head");
  assert.ok(!text.includes(word("screen.standard.binds.help")), "once: not again in the body");
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
  await selectFirst(p, "st-thr-passage");
  await press(p, "standardinforcethrough", { reason: REASON });
  await settled(p);
  const sent = p.byOp("standardinforcethrough");
  assert.equal(sent.length, 1);
  assert.equal(sent[0].body.standard, L.pol, "the standard's own id");
  assert.equal(sent[0].body.through, THROUGH);
  assert.equal(sent[0].body.source.captureSha, L.memo.sha, "the document chosen");
  assert.deepEqual(sent[0].body.source.extent, L.mu[0].extent, "the passage selected, not the whole document");
  const held = await me.read("inforcethroughof", { query: { id: L.pol } });
  assert.equal(held.records.length, 1, "the day is recorded");
  assert.equal(held.records[0].through, THROUGH);
  const text = main(p).textContent;
  assert.ok(text.includes(word("standard.inforce.known", { through: dayOf(THROUGH), source: "Policy.txt", author: me.handle })), "the recorded day, the document by its title, the member by name");
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
  assert.ok(main(p).textContent.includes(word("standard.inforce.known", { through: dayOf(THROUGH), source: "Policy.txt", author: me.handle })));
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
  /* the law makes it binding only while the law is itself known in force: its own period states no end */
  await me.act("standardinforcethrough", { body: { standard: L.ord, through: THROUGH, source: { captureSha: L.doc.sha, extent: L.du[0].extent }, reason: REASON } });
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

/** The walker's case (re-walk 11 E): the adopting act is declared with no period, so only a day the member types can say when the adoption began. */
async function noPeriodAct(world, me) {
  const L = await laws(world, me);
  const act = await declareStandard(me, { cite: "Resolution 2021-14", kind: "ordinance", sha: L.doc.sha, extent: L.du[1].extent });
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  fill(p, { "st-ad-act": act });
  p.fire(p.doc.getElementById("st-ad-act"), "change");
  await settled(p);
  const text = (await me.read("standard", { query: { id: act } })).texts[0].content_id;
  return { L, act, p, text };
}

test("R64 R66 standardadoption: an act declared with no period, the day the member types is sent as `from`, the adoption is recorded and drawn as a binding row", async () => {
  const { world, me } = await inWorld();
  const { L, act, p, text } = await noPeriodAct(world, me);
  const day = p.doc.getElementById("st-ad-from");
  assert.ok(day && main(p).textContent.includes(word("screen.standard.inforce.day.label")), "a day field, by the existing row");
  fill(p, { "st-ad-edition": "2021", "st-ad-mode": "by_reference", "st-ad-passage": text, "st-ad-from": "2026-03-01" });
  await press(p, "standardadoption", { reason: REASON });
  await settled(p);
  const sent = p.byOp("standardadoption");
  assert.equal(sent.length, 1);
  assert.deepEqual({ ...sent[0].body, reason: undefined }, { standard: L.pol, act, edition: "2021", mode: "by_reference", citation: text, from: "2026-03-01", reason: undefined });
  assert.equal((await me.read("editioninforce", { query: { id: L.pol, body: "City Council", date: "2026-06-01" } })).edition, "2021", "recorded");
  const row = main(p).querySelectorAll('[data-binding="adoption"]')[0];
  assert.ok(row && row.textContent.includes(dayOf("2026-03-01")), "drawn as a binding row, from the typed day");
  assert.equal(refusedIn(p, "STANDARD_FIELD_INVALID"), null, "the owner refuses nothing");
});

test("R64 standardadoption: with no day typed and an act that states none, the screen says so and sends nothing", async () => {
  const { world, me } = await inWorld();
  const { p, text } = await noPeriodAct(world, me);
  fill(p, { "st-ad-edition": "2021", "st-ad-mode": "by_reference", "st-ad-passage": text });
  await press(p, "standardadoption", { reason: REASON });
  await settled(p);
  assert.equal(p.byOp("standardadoption").length, 0, "nothing sent");
  assert.ok(main(p).textContent.includes(word("screen.standard.inforce.refused.body2")), "said on the screen, by a held row");
  assert.equal(refusedIn(p, "STANDARD_FIELD_INVALID"), null, "never the owner's refusal");
});
