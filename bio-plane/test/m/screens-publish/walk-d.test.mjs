/* screens-publish, fix round 10, walk D (K5257, K5258; causes-D.md): D-M5 (1) a refused "Confirm your ties and prepare the edition for signing"
 * is drawn with the stop list and the stops are read again; D-M5 (2) the exclusion statement's acknowledgement is offered whenever there is a
 * statement; D-M6 the case's bar sentence is the plane's for a case with no bar. (D-M1 (2), a document named by its title beside its id in the
 * plane's unrated sentence, is retired by R81: the page draws the design's words for an unrated axis, with no id in them; r81.test.mjs.) Each sentence is asserted by its key (R24). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { gateRefusal } from "../case-disclosures/fixtures.mjs";
import { open, main, text, drew, ops, press, tick, last, ok, refused, refusedIn, word, COPY, PREFLIGHT, PUBLISHED_CASE, P, DR, C, F1 } from "./fixtures.mjs";

const CER = `/app/ceremony/${P}/${DR}`;
const EDITOR = `/app/case-editor/${P}/${DR}`;
const PUBLIC = { session: null };
const sectionOf = (p, key) => main(p).querySelectorAll("h2").find((h) => h.textContent === word(key))?.closest("section") ?? null;

test("R3 R5 R10 D-M5 a publish refused by case-disclosures is drawn with the stop list, and the stops are read again; a prepared edition draws no refusal (control)", async () => {
  const gate = gateRefusal().CO_ATTESTATION_UNACKNOWLEDGED;
  for (const [shape, publish] of [["refusal inside a success", ok(gate)], ["refusal in form", refused(gate.code, gate.translation, 409, gate)]]) {
    const p = await open(CER, { plane: { publish } });
    const before = p.byOp("publishpreflight").length;
    tick(p, "ce-tie", "yes");
    await press(p, "publish", { reason: "because" });
    await p.settle();
    assert.ok(p.byOp("publishpreflight").length > before, `${shape}: the stops are read again`);
    const stops = sectionOf(p, "screen.ceremony.checks");
    assert.ok(stops.querySelector(`[data-said="stops"]`), `${shape}: the refusal sits with the stop list`);
    assert.ok(stops.textContent.includes(word(`refusal.${gate.code}`, gate)), "its words");
  }
  const fine = await open(CER);
  tick(fine, "ce-tie", "yes");
  await press(fine, "publish", { reason: "because" });
  assert.equal(sectionOf(fine, "screen.ceremony.checks").querySelector('[data-said="stops"]'), null, "control: nothing refused, nothing said at the stop list");
});

test("R1 D-M5 the acknowledgement of what the case leaves out is offered whenever the case has a statement, even with nothing left out; with no statement it is not (control)", async () => {
  const none = await open(EDITOR, { plane: { reviewcopy: ok(COPY({ authored: { scope: "S", statement: "The case leaves nothing material out.", excluded: [] }, statement_acknowledgements: null })) } });
  assert.ok(ops(none).includes("statementack") && none.doc.getElementById("ce-ackreason"), "a statement with nothing left out is acknowledged");
  await press(none, "statementack", { values: { "ce-ackreason": "I read it." }, reason: "x" });
  assert.equal(last(none, "statementack").body.reason, "I read it.");
  const bare = await open(EDITOR, { plane: { reviewcopy: ok(COPY({ authored: { scope: "S", statement: "", excluded: null }, statement_acknowledgements: null })) } });
  assert.ok(!ops(bare).includes("statementack"), "control: no statement, nothing to acknowledge");
});

const show = (e) => open(`/app/published/${C}`, { boot: PUBLIC, plane: { publishedcase: ok(e) } });

test("R6 D-M6 a case that declared no bar draws public-read's no-bar words (its bar_detail when bar.declared is false), never a standard it was held to", async () => {
  const NOBAR = word("public-read.bar_recorded_case"); // what public-read's publishedcase answers for an undeclared bar (K5267)
  const e = { ...PUBLISHED_CASE, bar: { declared: false, source: "none", capture: null, connection: null, detail: "x" }, bar_detail: NOBAR };
  const p = await show(e);
  assert.equal(main(p).querySelectorAll("[data-bar-none]").length, 1);
  assert.ok(text(p, main(p).querySelector("[data-bar-none]")).includes(NOBAR.slice(0, 40)), "the no-bar words");
  assert.ok(!/held to|DEC-72/.test(text(p)), "no standard is said to have been applied");
});
