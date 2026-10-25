/* screens-investigate, T51 fix round 10 (K5148), THE SEAM TESTS over `store-request`'s world: the whole path, press -> stored result, with the real
   store behind the page's door and a real sign-in. A member's inputs are made by her own acts (`recipes.hold|project|trail`, `recorddatedfact`, ...);
   every answer the screens draw is the world's. WALK-FINAL-07 R60 (cause 1, 3), R61 (8), R158 (9). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inWorld, openAs, settled, rewrite } from "./world.mjs";
import { fill, press, main, word, dayOf } from "./fixtures.mjs";

const REASON = "The minutes say so.";
const MINUTES = "The council met on March 3, 2026 and adopted the budget.";

test("R33 R3 (cause 1) Timeline: 'Record an event' with a date on the form records that dated fact and sends it as the event's attestation, so the event lies on its lane with its date, not placed nowhere", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Stormwater fund");
  const held = await world.recipes.hold(me, "minutes.txt", MINUTES, project);
  const p = await openAs(world, me, "/app/timeline/" + project);
  fill(p, { "tl-doc": held.sha });
  p.fire(p.doc.getElementById("tl-doc"), "change");
  await settled(p);
  fill(p, { "tl-kind": "meeting", "tl-date": "2026-03-03" });
  await press(p, "createevent", { reason: REASON });
  await settled(p);
  const dated = p.byOp("recorddatedfact");
  assert.equal(dated.length, 1, "the date on the form is recorded as a dated fact");
  const sent = p.byOp("createevent");
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].body.attestations.map((a) => Object.keys(a)), [["datedFactId"]], "and sent as the event's attestation");
  const read = await me.read("timeline", { query: { captures: held.sha } });
  assert.equal(read.world.items.length, 1, "the event lies on its lane");
  assert.equal(read.world.items[0].when.value, "2026-03-03");
  assert.equal(read.world.placed_nowhere.length, 0, "and is placed nowhere in no list");
  const lane = main(p).querySelector('[data-lane="world"]');
  assert.ok(lane && lane.querySelector(`[data-event="${read.world.items[0].event_id}"]`), "the page draws it in the lane");
  assert.ok(lane.textContent.includes(dayOf("2026-03-03")) || lane.textContent.includes(word("date.monthday", { day: "3", month: word("date.month.march") })) || /3/.test(lane.textContent), "with its date");
  /* control: no date typed sends the passage alone and nothing is recorded as a dated fact */
  fill(p, { "tl-date": "" });
  await press(p, "createevent", { reason: REASON });
  assert.equal(p.byOp("recorddatedfact").length, 1, "no date, no dated fact");
  assert.deepEqual(p.byOp("createevent")[1].body.attestations.map((a) => Object.keys(a).sort()), [["captureSha", "extent"]]);
});

test("R33 (cause 1) Timeline: a malformed date on the form sends nothing, records no dated fact and says so in place", async () => {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Stormwater fund, dates");
  const held = await world.recipes.hold(me, "minutes-2.txt", MINUTES + " Again.", project);
  const p = await openAs(world, me, "/app/timeline/" + project);
  fill(p, { "tl-doc": held.sha });
  p.fire(p.doc.getElementById("tl-doc"), "change");
  await settled(p);
  fill(p, { "tl-kind": "meeting", "tl-date": "March 3" });
  await press(p, "createevent", { reason: REASON });
  assert.equal(p.byOp("createevent").length, 0, "nothing sent");
  assert.equal(p.byOp("recorddatedfact").length, 0);
  assert.ok(main(p).textContent.includes(word("screen.timeline.date.empty")));
});

test("R33 (cause 3) Timeline: a dated fact whose capture is ungraded draws the unrated mark in place of its grade, never a line that ends 'grade' with nothing after it", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Stormwater fund, grades");
  const held = await world.recipes.hold(me, "minutes-3.txt", MINUTES + " Ungraded.", project);
  const p = await openAs(world, me, "/app/timeline/" + project);
  fill(p, { "tl-doc": held.sha });
  p.fire(p.doc.getElementById("tl-doc"), "change");
  await settled(p);
  fill(p, { "tl-date": "2026-03-03", "tl-datekind": "adopted" });
  await press(p, "recorddatedfact", { reason: REASON });
  await settled(p);
  const fact = (await me.read("datedfacts", { query: { sha256: held.sha } })).dated_facts[0];
  assert.equal(fact.grade, null, "the world's capture is ungraded: the case the walker met");
  const list = main(p).querySelectorAll("section").find((s) => s.textContent.includes(word("timeline.dated.title")));
  assert.ok(list, "the dated list is drawn");
  assert.ok(list.querySelector('.cs-gap[data-gap="unrated"]'), "its grade is the unrated mark");
  assert.ok(!/grade\s*$/i.test(list.textContent.replace(/\s+/g, " ").trim()), "no empty grade after the word");
});

test("R33 R4 (cause 8) Money, the real world: a figure's source cell names the document by title, never the capture fingerprint or an id the plane wrote into its citation", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Records office budget");
  const held = await world.recipes.hold(me, "Adopted budget.txt", "The adopted budget for the records office in fiscal year 2026 is 1,250,000.00 dollars.", project);
  const trail = await world.recipes.trail(me, project, "Records office budget, FY2026");
  const p = await openAs(world, me, "/app/money/" + trail);
  fill(p, { "mf-doc": held.sha });
  p.fire(p.doc.getElementById("mf-doc"), "change");
  await settled(p);
  fill(p, { "mf-amount": "1250000.00", "mf-asread": "$1,250,000", "mf-from-date": "2025-07-01", "mf-to-date": "2026-06-30" });
  await press(p, "recordfact", { reason: REASON });
  await settled(p);
  const row = main(p).querySelectorAll("tr").find((r) => r.textContent.includes(word("screen.money.proposed.member")));
  assert.ok(row, "the figure is a row of the trail");
  const fact = (await me.read("money", { query: { id: (await me.read("moneyset", { query: { id: trail } })).proposals[0].fact_id } })).fact;
  assert.ok(fact.citation.includes(held.sha), "the plane's own citation carries the fingerprint (the case the walker met)");
  assert.ok(row.textContent.includes("Adopted budget.txt"), "the row names the document by its title");
  assert.ok(!/[0-9a-f]{16,}/.test(row.textContent), "and draws no fingerprint");
});

test("R33 R4 (cause 8) Money: a figure read from a table's row names the document by title and the row, never the table's or the binding's fingerprint (the shape money answers for an ingested row, made from the world's own answer)", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Records office budget, rows");
  const held = await world.recipes.hold(me, "Payments register.txt", "The register lists every payment of the records office in fiscal year 2026.", project);
  const trail = await world.recipes.trail(me, project, "Records office payments");
  const p0 = await openAs(world, me, "/app/money/" + trail);
  fill(p0, { "mf-doc": held.sha });
  p0.fire(p0.doc.getElementById("mf-doc"), "change");
  await settled(p0);
  fill(p0, { "mf-amount": "42.00", "mf-asread": "$42", "mf-from-date": "2025-07-01", "mf-to-date": "2026-06-30" });
  await press(p0, "recordfact", { reason: REASON });
  const table = "ab".repeat(32), binding = "cd".repeat(32);
  const asRow = rewrite(world, me, (req, a) => {
    if (!a.json || !a.json.result || !a.json.result.fact) return a;
    const fact = { ...a.json.result.fact, source: { table, row: 12, binding, capture_sha: held.sha },
      citation: `row 12 of the table ${table}, read from capture ${held.sha} through the binding ${binding}` };
    return { ...a, json: { ...a.json, result: { ...a.json.result, fact } } };
  });
  const p = await openAs(world, me, "/app/money/" + trail, { plane: { money: asRow } });
  const row = main(p).querySelectorAll("tr").find((r) => r.textContent.includes(word("screen.money.proposed.member")));
  assert.ok(row, "the figure is a row of the trail");
  assert.ok(row.textContent.includes(word("contradiction.text.row_table", { source_row: "12", source_table: "Payments register.txt" })), "the document's title and its row");
  assert.ok(!/[0-9a-f]{16,}/.test(row.textContent), "no fingerprint");
});

/** Two people the record follows and a tie one declared to the other (a `proxy_for`, a declared step with no source), by the members' own acts. */
async function declaredTie(me) {
  const a = (await me.act("entitycreate", { body: { kind: "person", label: "Ana Rivera", note: "Deputy clerk, named in the minutes." } })).entity_id;
  const b = (await me.act("entitycreate", { body: { kind: "person", label: "Ben Okafor", note: "Contractor, named in the minutes." } })).entity_id;
  await me.act("relationdeclare", { body: { fromEntity: a, toEntity: b, relation: "proxy_for", justification: "He signs for her on the minutes.", citation: "minutes, page 2" } });
  return { a, b };
}

test("R34 R17 (cause 9) Explore, the real world: the form that attaches a source to a declared step chooses the document by title (the viewer's visible documents, newest first), asks no fingerprint or page number, and a plain-text memo is cited as the whole document", async () => {
  const { world, me } = await inWorld();
  const { a } = await declaredTie(me);
  const memo = await world.recipes.hold(me, "Memo.txt", "Ben Okafor signs for Ana Rivera when she is away.");
  await world.tick(120000);
  const later = await world.recipes.hold(me, "Minutes.txt", "The council met and Ben Okafor signed for Ana Rivera.");
  const p = await openAs(world, me, "/app/explore/" + a);
  fill(p, { "explore-groups-4": true });
  await press(p, "explore");
  await settled(p);
  assert.ok(main(p).querySelector('button[data-act="stepsource"]'), "the declared hop offers 'Attach a source'");
  const doc = p.doc.getElementById("explore-assert-doc");
  assert.ok(doc, "the document is chosen from a list");
  const titles = doc.querySelectorAll("option").map((o) => o.textContent);
  assert.ok(titles.some((t) => t.includes("Memo.txt")) && titles.some((t) => t.includes("Minutes.txt")), "by title");
  assert.ok(titles.findIndex((t) => t.includes("Minutes.txt")) < titles.findIndex((t) => t.includes("Memo.txt")), "newest first");
  assert.equal(p.doc.getElementById("explore-assert-sha"), null, "no field asks a fingerprint");
  assert.equal(p.doc.getElementById("explore-assert-page"), null, "or a page number");
  fill(p, { "explore-assert-doc": memo.sha, "explore-assert-basis": "The memo says he signs for her." });
  p.fire(p.doc.getElementById("explore-assert-doc"), "change");
  await settled(p);
  await press(p, "stepsource", { reason: "The memo says he signs for her." });
  await settled(p);
  const sent = p.byOp("stepsource");
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].body.extent, { kind: "document" }, "a memo that is not a PDF is cited whole, never as a page");
  assert.equal(sent[0].body.captureSha, memo.sha);
});
