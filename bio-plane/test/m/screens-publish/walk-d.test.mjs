/* screens-publish, fix round 10, walk D (K5257, K5258; causes-D.md): D-M5 (1) a refused "Confirm your ties and prepare the edition for signing"
 * is drawn with the stop list and the stops are read again; D-M5 (2) the exclusion statement's acknowledgement is offered whenever there is a
 * statement; D-M1 (2) the published page names a document by its title beside its id; D-M6 the case's bar sentence is the plane's for a case
 * with no bar. Each sentence is asserted by its key (R24). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { gateRefusal } from "../case-disclosures/fixtures.mjs";
import { open, main, text, drew, ops, press, tick, last, ok, refused, refusedIn, word, COPY, PREFLIGHT, PUBLISHED_CASE, leg, P, DR, C, F1 } from "./fixtures.mjs";

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

const UNRATED = (legs) => `UNRATED on capture: no leg on this axis carries an established grade. Not load-bearing: ${legs}.`;
const withLegs = (basis, detail) => ({ ...PUBLISHED_CASE, findings: [{ ...PUBLISHED_CASE.findings[0], basis,
  strength: [{ axis: "capture", state: "unrated", grade: null, detail }, { axis: "connection", state: "graded", grade: "B" }] }] });
const show = (e) => open(`/app/published/${C}`, { boot: PUBLIC, plane: { publishedcase: ok(e) } });

test("R6 D-M1 the published page names a document its unrated sentence lists by its title beside the id, the signed text unchanged; a document with no title is named by its id alone (control)", async () => {
  const basis = [leg("INFO-2026-0001-a", "supports", "B", "capture", { document: { name: "Council minutes, 12 January 2024", place: null } }),
    leg("INFO-2026-0001-b", "supports", "B", "capture", { document: null })];
  const sentence = UNRATED("INFO-2026-0001-a, INFO-2026-0001-b");
  const p = await show(withLegs(basis, sentence));
  const line = main(p).querySelector('[data-ungraded="capture"]');
  assert.ok(line.textContent.includes("INFO-2026-0001-a") && line.textContent.includes("Council minutes, 12 January 2024"), "the id and the title");
  assert.ok(line.textContent.indexOf("Council minutes, 12 January 2024") > line.textContent.indexOf("INFO-2026-0001-a"), "the title beside the id");
  assert.equal(line.textContent.replace("Council minutes, 12 January 2024", "").replace(/[()\s]+/g, " ").trim().replace(/ +/g, " ").includes("INFO-2026-0001-b"), true, "the other document keeps its id");
  assert.ok(!/Council minutes, 12 January 2024.*Council minutes, 12 January 2024/.test(line.textContent), "the title is named once");
  const plain = await show(withLegs([leg("INFO-2026-0001-b", "supports", "B", "capture")], UNRATED("INFO-2026-0001-b")));
  assert.equal(main(plain).querySelector('[data-ungraded="capture"]').textContent, UNRATED("INFO-2026-0001-b"), "control: no title held, the sentence as signed");
});

test("R6 D-M6 a case that declared no bar draws the sentence of its bar, never the sentence of a standard it was held to", async () => {
  const NOBAR = "This case declares no required evidentiary strength.", HELD = "the standard of evidence this case was held to";
  const e = { ...PUBLISHED_CASE, bar: { declared: false, source: "none", capture: null, connection: null, detail: NOBAR }, bar_detail: HELD };
  const p = await show(e);
  assert.ok(text(p, main(p).querySelector("[data-bar-none]")).includes(NOBAR) && !text(p).includes(HELD), "the bar's own sentence");
  const q = await show({ ...PUBLISHED_CASE, bar: null, bar_detail: "No standard of evidence was recorded for this case." });
  assert.ok(text(q, main(q).querySelector("[data-bar-none]")).includes("No standard of evidence was recorded"), "control: a case with no bar object keeps bar_detail");
});
