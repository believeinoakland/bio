/* Find in records a fact as the owner takes it (R47) and its recording forms (R48) on the real served page (interface-shell's
   harness). Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, text, acts, button, press, beside, last, main, word } from "./page.mjs";
import { Event } from "../interface-shell/harness.mjs";

const SHA = "9f2c0d1e".padEnd(64, "a");
const R = "looking";
const PQ = ok({ ok: true, project: "PROJ-1", items: [{ inquiry: "INQ-1", title: "Is the city repairing potholes?" }], cursor: null });
const ZONE = (id) => ok({ ok: true, count: 1, facts: [{ path: "p.time_zone", fact: { profile: "p1", fact: "time_zone" }, status: "confirmed", governs: { value: id, origin: "profile" } }] });
const kinds = (list) => ok({ ok: true, scope: { form: "project", project: "PROJ-1", captures: 3, title: "The Coliseum lease" }, kinds: list });
const PERSON = { kind: "people", items: [{ kind: "people", words: "Dana Reyes, director", capture_sha: SHA, title: "Housing code", extent: { passage: 3 }, entity: "ENT-9", recorded: [] }], count: 1 };
const PLANE = (list, zone = "America/Los_Angeles") => ({ projectquestions: PQ, factstatus: ZONE(zone), findin: kinds(list), image: ok({ "bundle.md": '---\ntitle: "The Coliseum lease"\n---\n' }) });
const shown = async (list, extra = {}) => {
  const p = await open("/app/find-in/PROJ-1", { ...PLANE(list), ...extra });
  await press(p, "findin", { values: { "findin-kind-people": true, "findin-question": "INQ-1" }, reason: R });
  return p;
};
const optionTexts = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => o.textContent);
const fieldOf = (p, op) => button(p, op).dataset.f;

test("R47: \"Add a fact from this passage\" opens its form in place: the kind is chosen from the person kinds by key, the value is filled from the passage, and the office sentence is drawn", async () => {
  const p = await shown([PERSON]);
  const f = fieldOf(p, "recordpersonfact");
  const det = button(p, "recordpersonfact").closest("details");
  assert.equal(det.querySelector("summary").textContent, word("act.recordpersonfact.label.find-in"));
  assert.deepEqual(optionTexts(p, f + "-kind"), ["name", "birth", "death", "locality", "address", "contact"].map((k) => word("screen.person.kind." + k)), "never typed");
  assert.ok(text(p, det).includes(word("screen.find-in.fact.office")));
  assert.ok(text(p, det).includes(word("screen.find-in.field.kind")) && text(p, det).includes(word("screen.find-in.field.value")));
  assert.equal(p.doc.getElementById(f + "-value").value, "Dana Reyes, director", "filled from the passage");
  assert.ok(text(p, det).includes(word("findin.prefilled")), "check it before you record it");
  // "When it is true": the bounds, the precision and the zone.
  assert.ok(text(p, det).includes(word("screen.find-in.valid")) && text(p, det).includes(word("screen.find-in.valid.help")));
  assert.ok(p.doc.getElementById(f + "-from") && p.doc.getElementById(f + "-to"));
  assert.deepEqual(optionTexts(p, f + "-precision"), ["day", "minute", "second", "edtf"].map((k) => word("label.timeprecisions." + k)));
  assert.ok(text(p, det).includes(word("screen.find-in.valid.zone", { zone: word("label.timezones.America/Los_Angeles") })), "the zone by its name");
  assert.ok(!text(p, det).includes("America/Los_Angeles"), "never its id");
});

test("R47: a person fact sends valid with the chosen precision and the team's zone; a bound left empty is null, never read from the passage; a refusal of the validity is drawn beside the act", async () => {
  const p = await shown([PERSON]);
  const f = fieldOf(p, "recordpersonfact");
  await press(p, "recordpersonfact", { values: { [f + "-kind"]: "locality", [f + "-value"]: "Oakland", [f + "-from"]: "2020-01", [f + "-precision"]: "minute" } });
  const b = last(p, "recordpersonfact").body;
  assert.deepEqual(b.valid, { from: "2020-01", to: null, precision: "minute", zone: "America/Los_Angeles" });
  assert.deepEqual([b.person, b.kind, b.value, b.question], ["ENT-9", "locality", "Oakland", "INQ-1"]);
  // Control: an untouched form sends both bounds null, and a zone the design does not key is drawn by its generic name and city.
  const q = await shown([PERSON], { factstatus: ZONE("Europe/Paris") });
  await press(q, "recordpersonfact", {});
  assert.deepEqual([last(q, "recordpersonfact").body.valid.from, last(q, "recordpersonfact").body.valid.to], [null, null]);
  assert.ok(text(q).includes("Paris") && !text(q).includes("Europe/Paris"));
  const bad = await shown([PERSON], { recordpersonfact: refused("BAD_VALIDITY", null, 400) });
  const r = await press(bad, "recordpersonfact", { values: { [fieldOf(bad, "recordpersonfact") + "-from"]: "tomorrow-ish" } });
  assert.ok(beside(bad, r).includes(word("refusal.BAD_VALIDITY")));
});

test("R47: \"Hold this as a standard\" sends the match's capture_sha and extent as the standard's text when the passage has no content row, and the row's content_id when it has one", async () => {
  const uncited = { kind: "requirements", items: [{ kind: "requirements", words: "shall repair", capture_sha: SHA, title: "Housing code", extent: { passage: 3 }, content_id: null, recorded: [] }], count: 1 };
  const cited = { kind: "requirements", items: [{ kind: "requirements", words: "shall repair", capture_sha: SHA, title: "Housing code", extent: { passage: 3 }, content_id: "CNT-1", recorded: [] }], count: 1 };
  const vals = (f) => ({ [f + "-cite"]: "AI 4.12", [f + "-kind"]: "policy", [f + "-issuer"]: "Public Works", [f + "-reason"]: "the city's own rule" });
  const u = await shown([uncited]);
  await press(u, "standarddeclare", { values: vals(fieldOf(u, "standarddeclare")) });
  assert.deepEqual(last(u, "standarddeclare").body.text, [{ capture_sha: SHA, extent: { passage: 3 } }], "the extent, which the standard mints its row from");
  const c = await shown([cited]);
  await press(c, "standarddeclare", { values: vals(fieldOf(c, "standarddeclare")) });
  assert.deepEqual(last(c, "standarddeclare").body.text, ["CNT-1"], "control: a cited passage sends its content_id");
});

test("R48: kinds are chosen from the act's own lists by key: a dated fact's, a standard's, and a money fact's kinds, phases and stages", async () => {
  const list = [{ kind: "dates", items: [{ kind: "dates", words: "met on 3 May", capture_sha: SHA, extent: {}, date: "2023-05-03", recorded: [] }], count: 1 },
    { kind: "requirements", items: [{ kind: "requirements", words: "shall", capture_sha: SHA, extent: {}, recorded: [] }], count: 1 },
    { kind: "money", items: [{ kind: "money", as_read: "$4.2 million", amount: "4200000.00", currency: "USD", capture_sha: SHA, extent: {}, recorded: [] }], count: 1 }];
  const p = await shown(list);
  const d = fieldOf(p, "recorddatedfact");
  assert.deepEqual(optionTexts(p, d + "-kind"), ["meeting", "adopted", "effective", "signed", "entered", "issued", "published", "received", "hearing", "period_covered", "edited"].map((k) => word("screen.timeline.datekind." + k)), "including entered, hearing, period_covered and edited");
  assert.equal(p.doc.getElementById(d + "-value").value, "2023-05-03", "the date read from the passage is filled in");
  assert.ok(text(p, button(p, "recorddatedfact").closest("details")).includes(word("findin.prefilled")));
  await press(p, "recorddatedfact", { values: { [d + "-kind"]: "hearing" } });
  assert.equal(last(p, "recorddatedfact").body.kind, "hearing");
  const s = fieldOf(p, "standarddeclare");
  assert.deepEqual(optionTexts(p, s + "-kind"), ["statute", "regulation", "ordinance", "court", "policy", "commitment", "standard"].map((k) => word("screen.standard.kind." + k)));
  assert.ok(text(p, button(p, "standarddeclare").closest("details")).includes(word("screen.find-in.field.standardkind")));
  const m = fieldOf(p, "recordfact");
  assert.ok(optionTexts(p, m + "-kind").includes(word("label.moneykinds.fee_charged")) && optionTexts(p, m + "-kind").length === 14);
  assert.deepEqual(optionTexts(p, m + "-phase"), ["proposed", "adopted", "adjusted", "actual"].map((k) => word("label.moneyphases." + k)));
  assert.equal(p.doc.getElementById(m + "-amount").value, "4200000.00");
  assert.equal(p.doc.getElementById(m + "-currency").value, "USD");
});

const actualPhase = async (p, m) => {
  const sel = p.doc.getElementById(m + "-phase");
  sel.value = "actual";
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 0));
};

test("R48: the money form asks the flow step only for an actual payment: who paid, who received it, the day, sent as from and to; a phase other than actual is asked none", async () => {
  const money = { kind: "money", items: [{ kind: "money", as_read: "$4.2 million", amount: "4200000.00", currency: "USD", capture_sha: SHA, extent: { passage: 7 }, recorded: [] }], count: 1 };
  const p = await shown([money]);
  const m = fieldOf(p, "recordfact");
  assert.ok(!p.doc.getElementById(m + "-payer"), "a proposed figure is asked no flow step");
  assert.ok(!text(p).includes(word("money.flow.step")));
  await actualPhase(p, m);
  const det = button(p, "recordfact").closest("details");
  assert.ok(p.doc.getElementById(m + "-payer") && p.doc.getElementById(m + "-payee"));
  assert.ok(text(p, det).includes(word("money.flow.step")) && text(p, det).includes(word("screen.find-in.flow.help")));
  assert.ok(text(p, det).includes(word("screen.money.f.payer")) && text(p, det).includes(word("screen.money.f.payee")));
  assert.ok(text(p, det).includes(word("screen.money.f.stage")));
  assert.deepEqual(optionTexts(p, m + "-stage"), ["assessed", "collected", "encumbered", "incurred", "paid"].map((k) => word("label.moneystages." + k)));
  // Control: an empty required field is refused in place with findin.fieldneeded, nothing sent.
  const before = p.byOp("recordfact").length;
  const none = await press(p, "recordfact", { values: { [m + "-kind"]: "payment", [m + "-payer"]: "City of Oakland", [m + "-payee"]: "", [m + "-date"]: "2024-03-01" } });
  assert.equal(p.byOp("recordfact").length, before);
  assert.equal(beside(p, none), word("findin.fieldneeded", { field: word("screen.find-in.field.payee.short") }));
  await press(p, "recordfact", { values: { [m + "-payee"]: "Acme Paving" } });
  const b = last(p, "recordfact").body;
  // R81: `recordfact` accepts no `date` (the guard); the day of the payment is the period the fact holds over.
  assert.deepEqual([b.from, b.to, b.date, b.phase, b.stage], [{ as_written: "City of Oakland" }, { as_written: "Acme Paving" }, undefined, "actual", "paid"]);
  assert.deepEqual(b.period, { from: "2024-03-01", to: "2024-03-01", precision: "day" });
});

test("R48: after a record the acknowledgement is drawn with a link to the screen, and the passage keeps its acts and counts its facts; an already-cited passage says who", async () => {
  const p = await shown([PERSON], { recordpersonfact: ok({ ok: true, person: "ENT-9", name: "Dana Reyes" }) });
  const f = fieldOf(p, "recordpersonfact");
  await press(p, "recordpersonfact", { values: { [f + "-kind"]: "locality", [f + "-value"]: "Oakland" } });
  const fact = word("screen.find-in.recorded.fact", { kind: word("screen.person.kind.locality"), name: "Dana Reyes", value: "Oakland" });
  assert.ok(text(p).includes(word("findin.recorded", { fact, screen: word("screen.person.name") })), "findin.recorded with the person screen");
  assert.ok(text(p).includes(word("passage.facts.count.one")));
  assert.ok(button(p, "recordpersonfact"), "the passage keeps its acts");
  await press(p, "recordpersonfact", { values: { [f + "-kind"]: "contact", [f + "-value"]: "dana@example.org" } });
  assert.ok(text(p).includes(word("passage.facts.count", { count: "2" })));
  // Control: a passage already cited by another member says so.
  const cited = { ...PERSON, items: [{ ...PERSON.items[0], recorded: [{ by: "Mai", at: "2026-10-03" }] }] };
  const c = await shown([cited]);
  assert.ok(text(c).includes(word("screen.find-in.recorded", { who: "Mai" })));
  assert.ok(button(c, "recordpersonfact"));
  // A refusal is drawn in its own words and no acknowledgement.
  const r = await shown([PERSON], { recordpersonfact: refused("NO_VALUE", null, 400) });
  const bt = await press(r, "recordpersonfact", {});
  assert.ok(beside(r, bt).length > 0);
  assert.ok(!text(r).includes(word("passage.facts.count.one")));
});

test("R48: a match found in a sheet says its sheet and row and draws its cells apart; a formula the file never calculated says so; a person named in a passage by a held alias says so", async () => {
  const sheet = { kind: "money", count: 1, items: [{ kind: "money", words: "Total", capture_sha: SHA, title: "Budget", extent: { "sheet-range": "A10:B10" }, sheet: "Summary", row: 10, recorded: [],
    cells: [{ cell: "A10", value: "Total", type: "string" }, { cell: "B10", value: null, type: "formula", formula: "=SUM(B2:B9)", cached: null }] }] };
  const named = { ...PERSON, items: [{ ...PERSON.items[0], correspondence: "name_in_passage" }] };
  const p = await shown([sheet, named]);
  assert.ok(text(p).includes(word("findin.match.sheet", { sheet: "Summary", row: "10" })));
  assert.ok(text(p).includes(word("findin.cell.uncalculated", { cell: "B10" })));
  assert.ok(text(p).includes("Total"));
  assert.ok(text(p).includes(word("findin.match.nameinpassage")));
  // Control: a hit that is no sheet match and names no alias draws neither.
  const plain = await shown([PERSON]);
  assert.ok(!text(plain).includes(word("findin.match.nameinpassage")));
  assert.ok(!text(plain).includes(word("findin.match.sheet", { sheet: "Summary", row: "10" })));
});

test("R62: a sheet match draws the match's own row, whatever its extent says; a match answering none draws the sheet and its cells without a row number and parses nothing", async () => {
  const mk = (extra) => ({ kind: "money", count: 1, items: [{ kind: "money", words: "Total", capture_sha: SHA, title: "Budget", extent: { "sheet-range": "A10:B10" }, sheet: "Summary", recorded: [],
    cells: [{ cell: "A10", value: "Total", type: "string" }], ...extra }] });
  const withRow = await shown([mk({ row: 12 })]);
  assert.ok(text(withRow).includes(word("findin.match.sheet", { sheet: "Summary", row: "12" })), "row 12 whatever the extent");
  assert.ok(!text(withRow).includes(word("findin.match.sheet", { sheet: "Summary", row: "10" })));
  const none = await shown([mk({ row: null })]);
  assert.ok(text(none).includes(word("findin.match.sheet.norow", { sheet: "Summary" })), "no row number");
  assert.ok(text(none).includes("Total"), "its cells are still drawn");
  assert.ok(!text(none).includes(word("findin.match.sheet", { sheet: "Summary", row: "10" })), "control: the extent's A10 is not parsed into a row");
});
