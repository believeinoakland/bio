/* screens-investigate, T51 fix round 4, THE SEAM TESTS (K4429, R-SEAM): the whole path, press -> stored result, with the real merged plane (Miniflare over
   `src/plane/index.mjs`). The member's inputs are made by her own acts through the real ops (`captureupload`, `allocid`, `promote`, `createset`,
   `profilesset`, `recordfact`); every answer the screens draw is the plane's. Nothing is scripted but the one record kept as a fixture from the live copy
   (C59's `affordances`, below). R34 (C59 / N3), R4 (C8: the refusal's words and the figure's row). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { realPlane } from "./real-plane.mjs";
import { fill, press, main, word } from "./fixtures.mjs";

const w = realPlane("fix4");
const NOTE = "The stormwater fund transferred 1,200,000 dollars to the general fund on June 30.";
const wordsOf = (p, id) => main(p).querySelectorAll("[data-words]").find((e) => e.getAttribute("data-words").startsWith(id + "-"));
const unitsOf = (p, id) => wordsOf(p, id).querySelectorAll('[data-shell="word"]').map((e) => e.textContent);
/* a sentence the member reads has no escaped entity in it: `&#39;` is a sentence escaped twice */
const escaped = (text) => /&(#\d+|amp|lt|gt|quot);/.test(text);

test("R34 C59 N3 Money, the real plane: a held text file's words are listed under 'Choose the passage', and the choice that follows (the contract, none held) says what it is, never a bare 'Nothing here'; a document choice with no document held likewise", async () => {
  await w.founder();
  const project = await w.project("Stormwater fund");
  const trail = await w.trail(project);
  /* before any file is held: the document choice is empty, under its own label */
  const bare = await w.open("/app/money/" + trail);
  for (const id of ["mf-doc", "mf-contract"]) {
    const slot = main(bare).querySelector(`[data-empty="${id}"]`);
    assert.ok(slot, `${id}: its empty state is drawn in a slot of its own`);
    assert.ok(slot.textContent.includes(word(id === "mf-doc" ? "form.choose.document" : "screen.money.f.contract")), `${id}: under its label`);
    assert.ok(slot.textContent.includes(word("state.empty")), `${id}: and says it is empty`);
  }
  /* the held file, captured by her own acts */
  const held = await w.hold("budget-note.txt", NOTE, project);
  const p = await w.open("/app/money/" + trail);
  assert.deepEqual(unitsOf(p, "mf-passage"), [NOTE], "the file's words, read by the plane, are the passage to choose from");
  const alone = main(p).querySelectorAll('[data-state="empty"]').filter((e) => !e.closest("[data-empty]") && e.textContent.trim() === word("state.empty"));
  assert.equal(alone.length, 0, "no empty state stands bare, with nothing to say what is empty");
  const slot = main(p).querySelector('[data-empty="mf-contract"]');
  assert.ok(slot.textContent.includes(word("screen.money.f.contract")), "the contract choice, none held, under its label");
  assert.equal(main(p).querySelector('[data-empty="mf-doc"]'), null, "the document choice lists the file and draws no empty state");
  assert.equal(p.byOp("reading").length, 1, "the file was read once");
  assert.ok(p.byOp("reading")[0].query.sha256 === held.sha);
});

test("R34 C59 N3 Timeline, the real plane over the live copy's record: the choice of what happened, whose vocabulary the live `affordances` answers without the events owner's five lists, is drawn failed with the member's word whole (the apostrophe plain), never escaped twice; control: the build's own answer draws the kinds", async () => {
  await w.founder();
  const project = await w.project("Stormwater fund, timeline");
  await w.hold("budget-note-2.txt", NOTE + " Twice.", project);
  const EVENTS = ["event_kinds", "dated_fact_kinds", "event_statuses", "participant_roles", "event_relation_kinds"];
  /* F: the record kept from biosmoke8 (64 vocabularies; the events owner's five are not among them), made from the real answer by taking those out */
  const live = (req, a) => {
    const j = JSON.parse(JSON.stringify(a.json));
    for (const k of EVENTS) delete j.result.vocabularies[k];
    return { ...a, json: j };
  };
  const p = await w.open("/app/timeline/" + project, { affordances: live });
  const text = main(p).textContent;
  const sentence = word("state.failed", { reason: word("shell.noanswer") });
  assert.ok(text.includes(sentence), `drawn failed, in words: ${sentence}`);
  assert.ok(!escaped(text), "no sentence is drawn with an entity of its own showing");
  assert.equal(p.doc.getElementById("tl-kind"), null, "no choice of what happened is offered without its kinds");
  /* the control: the plane's own answer carries the kinds */
  const own = await w.open("/app/timeline/" + project);
  assert.ok(own.doc.getElementById("tl-kind"), "the kinds are offered");
  assert.ok(!main(own).textContent.includes(sentence), "and nothing is drawn failed");
  assert.deepEqual(unitsOf(own, "tl-passage"), [NOTE + " Twice."], "the held file's words are listed on the Timeline too");
});

test("R4 C8 (words) Money, the real plane: a fiscal year the team's profile cannot map is refused in the money module's own words with the plane's own reason, not 'A follow names the days it covers'", async () => {
  await w.founder();
  await w.profiles(["oakland-alameda"]);
  const project = await w.project("Records office budget");
  const held = await w.hold("budget-figure.txt", "The adopted budget for the records office in fiscal year 2026 is 1,250,000.00 dollars.", project);
  const trail = await w.trail(project, "Records office budget, FY2026");
  const p = await w.open("/app/money/" + trail);
  fill(p, { "mf-doc": held.sha });
  p.fire(p.doc.getElementById("mf-doc"), "change");
  await w.settled(p);
  fill(p, { "mf-amount": "1250000.00", "mf-asread": "$1,250,000", "mf-fiscal": "FY2025-26" });
  await press(p, "recordfact");
  await w.settled(p);
  const sent = p.byOp("recordfact");
  assert.equal(sent.length, 1);
  /* what the plane answers to that very request, asked again by the test (the refusal is written nothing, so it can be asked again) */
  const answer = await w.call("recordfact", { body: sent[0].body });
  assert.equal(answer.code, "MONEY_BAD_PERIOD", "money's own code");
  assert.ok(typeof answer.detail === "string" && answer.detail.length > 10, "with its reason");
  const slot = main(p).querySelector('[data-gap="refused"]');
  assert.ok(slot, "the refusal is drawn beside the act");
  assert.ok(slot.textContent.includes(word("refusal.BAD_VALIDITY")), "in the design's held sentence for dates that cannot be recorded");
  assert.ok(slot.textContent.includes(answer.detail), "and the reason the plane gives");
  assert.ok(!main(p).textContent.includes(word("refusal.BAD_PERIOD")), "never the sentence of a follow's days (following's code)");
});

test("R4 C8 (the figure) Money, the real plane: a figure read in with its period's dates is a row of the trail that draws what the plane holds: its amount, its source and its period (not 'the source states no end to its period' under the end the member typed)", async () => {
  await w.founder();
  await w.profiles(["oakland-alameda"]);
  const project = await w.project("Records office budget, dates");
  const held = await w.hold("budget-figure-2.txt", "The adopted budget for the records office in fiscal year 2026 is 1,250,000.00 dollars. Dated.", project);
  const trail = await w.trail(project, "Records office budget, FY2026, dates");
  const p = await w.open("/app/money/" + trail);
  fill(p, { "mf-doc": held.sha });
  p.fire(p.doc.getElementById("mf-doc"), "change");
  await w.settled(p);
  fill(p, { "mf-amount": "1250000.00", "mf-asread": "$1,250,000", "mf-from-date": "2025-07-01", "mf-to-date": "2026-06-30" });
  await press(p, "recordfact");
  await w.settled(p);
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "recorded: no refusal stays on the page");
  const row = main(p).querySelectorAll("tr").find((r) => r.textContent.includes(word("screen.money.proposed.member")));
  assert.ok(row, "the figure the member read in is a row of the trail, proposed by a member (the plane names her `admin`, not `member:admin`)");
  const stored = (await w.call("moneyset", { query: { id: trail } })).proposals[0];
  const fact = (await w.call("money", { query: { id: stored.fact_id } })).fact;
  assert.equal(fact.period.to, "2026-06-30", "the plane holds the period's end");
  assert.ok(!row.textContent.includes(word("screen.money.period.why")), "so the row does not say the source states no end to its period");
  assert.ok(row.textContent.includes(fact.amount) || row.textContent.includes("1,250,000"), "and draws the amount");
  assert.equal(held.sha, fact.source.capture_sha);
});
