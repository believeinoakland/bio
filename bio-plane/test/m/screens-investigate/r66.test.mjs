/* screens-investigate R66 (T51 fix round 10; DEC-442; K5308; amends R64): the bindings a standard's own read answers, drawn one row each by their kind in the design's words,
   `screen.standard.binds.unknown` exactly when there are none, and the team's dated events offered as the act that adopted it. Over `store-request`'s world:
   every binding is made by the member's own act (`standardadoption`, `standardimpose`, `standardbenchmark`) and every row is read back from the world's `standard` read. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inWorld, openAs, settled, readHeld, declareStandard } from "./world.mjs";
import { fill, press, main, word, dayOf } from "./fixtures.mjs";

const REASON = "The passage says so.";
const ORDINANCE = "Section 12.04 The Director shall keep the standard for every public street.\n\nSection 12.05 No street is exempt.";
const POLICY = "The Director shall repair each reported pothole within seven calendar days.\n\nCrews log each pothole they fill.";
const MINUTES = "The council adopted the standard on March 3, 2024.\n\nThe vote was five to two.";
const FROM = "2026-01-01";

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
const rowOf = (p, kind) => main(p).querySelector(`[data-binding="${kind}"]`);
const day = (iso) => dayOf(String(iso).slice(0, 10));

test("R66 each binding is drawn by its kind in the design's words, from the standard's own read: an adoption (the act by citation, the edition, how, from when, by whom), an imposition (the body by name, the law by citation) and a benchmark, each recorded by the member by name, never an id", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const text = (await me.read("standard", { query: { id: L.ord } })).texts[0].content_id;
  await me.act("standardadoption", { body: { standard: L.pol, act: L.ord, edition: "2021", from: FROM, mode: "by_reference", citation: text, reason: REASON } });
  await me.act("standardimpose", { body: { standard: L.pol, body: L.body, law: L.ord, citation: text, reason: REASON } });
  await me.act("standardbenchmark", { body: { standard: L.pol, body: L.body, reason: REASON } });
  const read = (await me.read("standard", { query: { id: L.pol } })).bindings;
  assert.deepEqual(read.map((b) => b.kind).sort(), ["adoption", "benchmark", "imposition"], "the world's own read answers the three");
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  const adopt = read.find((b) => b.kind === "adoption"), impose = read.find((b) => b.kind === "imposition"), bench = read.find((b) => b.kind === "benchmark");
  const who = { author: me.handle, date: day(adopt.at) };
  const a = rowOf(p, "adoption");
  assert.ok(a, "the adoption row");
  assert.equal(a.textContent, word("screen.standard.binding.adoption", { body: "City Council", act: "Municipal Code 12.04", edition: "2021" })
    + word("screen.standard.binding.adoption.meta", { mode: word("screen.standard.mode.by_reference"), from: dayOf(FROM), ...who }));
  assert.equal(rowOf(p, "imposition").textContent, word("screen.standard.binding.imposition", { body: "Oakland Public Works", law: "Municipal Code 12.04" }) + word("screen.standard.binding.recorded", { author: me.handle, date: day(impose.at) }));
  assert.equal(rowOf(p, "benchmark").textContent, word("screen.standard.binding.benchmark", { body: "Oakland Public Works" }) + word("screen.standard.binding.recorded", { author: me.handle, date: day(bench.at) }));
  const text2 = main(p).textContent;
  assert.ok(!/ENT-|STD-20|adopt-|impose-|bench-/.test(text2), "no id of a body, a standard or a binding");
  assert.ok(!text2.includes(word("screen.standard.binds.unknown")), "bindings are recorded: not unknown");
});

test("R66 an adoption that runs from an event, not a day, is drawn by `.adoption.meta.nofrom`; control: one that runs from a day is drawn by `.adoption.meta` (the first test)", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const minutes = await world.recipes.hold(me, "Minutes.txt", MINUTES, L.project);
  const mn = await readHeld(world, me, minutes.sha);
  const dated = (await me.act("recorddatedfact", { body: { captureSha: minutes.sha, extent: mn[0].extent, kind: "adopted", value: "2024-03-03", method: "stated in the document" } })).dated_fact.dated_fact_id;
  const event = (await me.act("createevent", { body: { kind: "meeting", attestations: [{ datedFactId: dated }], concerns: [L.body] } })).event_id;
  const text = (await me.read("standard", { query: { id: L.ord } })).texts[0].content_id;
  const made = await me.act("standardadoption", { body: { standard: L.pol, act: L.ord, edition: "2021", from: { event, edge: "start" }, mode: "voluntary", citation: text, reason: REASON } });
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  const row = rowOf(p, "adoption");
  assert.ok(row && row.textContent.includes(word("screen.standard.binding.adoption.meta.nofrom", { mode: word("screen.standard.mode.voluntary"), author: me.handle, date: day(made.adoption.at) })));
  assert.ok(!row.textContent.includes(word("screen.standard.binding.adoption.meta", { mode: word("screen.standard.mode.voluntary"), from: dayOf("2024-03-03"), author: me.handle, date: day(made.adoption.at) })));
});

test("R66 `screen.standard.binds.unknown` is drawn exactly when the standard's read answers no binding; control: it goes with the first one recorded", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  assert.deepEqual((await me.read("standard", { query: { id: L.pol } })).bindings, []);
  const none = await openAs(world, me, `/app/standard/${L.pol}`);
  assert.equal(main(none).textContent.split(word("screen.standard.binds.unknown")).length - 1, 1, "said once");
  assert.ok(!rowOf(none, "adoption") && !rowOf(none, "imposition") && !rowOf(none, "benchmark"), "no row");
  fill(none, { "st-bm-body": L.body });
  await press(none, "standardbenchmark", { reason: REASON });
  await settled(none);
  assert.ok(rowOf(none, "benchmark"), "the benchmark is drawn at once");
  assert.ok(!main(none).textContent.includes(word("screen.standard.binds.unknown")), "no longer unknown");
});

test("R66 the adoption form's act choice lists the team's dated events beside its held standards; an event chosen sends its passage's minted content id and runs from the event's own day, and the adoption is drawn by the event's name", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const minutes = await world.recipes.hold(me, "Minutes.txt", MINUTES, L.project);
  const mn = await readHeld(world, me, minutes.sha);
  const dated = (await me.act("recorddatedfact", { body: { captureSha: minutes.sha, extent: mn[0].extent, kind: "adopted", value: "2024-03-03", method: "stated in the document" } })).dated_fact.dated_fact_id;
  const event = (await me.act("createevent", { body: { kind: "meeting", attestations: [{ datedFactId: dated }], concerns: [L.body] } })).event_id;
  const p = await openAs(world, me, `/app/standard/${L.pol}`);
  const act = p.doc.getElementById("st-ad-act");
  const offered = act.querySelectorAll("option");
  assert.ok(offered.some((o) => o.getAttribute("value") === L.ord), "the held standards");
  const ev = offered.find((o) => o.getAttribute("value") === event);
  assert.ok(ev && ev.textContent.includes(dayOf("2024-03-03")), "the dated event, by its kind and day, never its id");
  assert.ok(!offered.some((o) => /^EVT-/.test(o.textContent)), "no id shown");
  const law = p.doc.getElementById("st-im-law").querySelectorAll("option");
  assert.ok(!law.some((o) => o.getAttribute("value") === event), "a law that imposes it is a standard, never an event");
  fill(p, { "st-ad-act": event });
  p.fire(act, "change");
  await settled(p);
  const passage = p.doc.getElementById("st-ad-passage");
  assert.ok(passage && passage.querySelectorAll("option").some((o) => o.textContent.includes(mn[0].text)), "the passage that dates the event, by its words");
  const att = passage.querySelectorAll("option").find((o) => o.getAttribute("value"));
  fill(p, { "st-ad-edition": "2021", "st-ad-mode": "voluntary", "st-ad-passage": att.getAttribute("value") });
  await press(p, "standardadoption", { reason: REASON });
  await settled(p);
  const sent = p.byOp("standardadoption");
  assert.equal(sent.length, 1);
  assert.equal(sent[0].body.act, event);
  assert.equal(sent[0].body.from, "2024-03-03", "the event's own day");
  assert.ok(/^CNT-/.test(sent[0].body.citation) || sent[0].body.citation.length > 0, "a minted content id of the passage");
  const bindings = (await me.read("standard", { query: { id: L.pol } })).bindings;
  assert.equal(bindings.length, 1, "the owner recorded it");
  assert.equal(bindings[0].act, event);
  const row = rowOf(p, "adoption");
  assert.ok(row && row.textContent.includes(word("screen.standard.binding.adoption", { body: "Oakland Public Works", act: ev.textContent, edition: "2021" })), "drawn by the event's name");
});
