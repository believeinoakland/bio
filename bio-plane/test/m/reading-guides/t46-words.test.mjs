/* reading-guides, T46 (T46-15; R14; DEC-194, N913): the rows C-144.4 GUIDE_KIND_UNKNOWN and C-144.19
   GUIDE_ITEM_UNSOURCED take their translations from `words.json`'s `refusal.<CODE>`, read by key, never a copy; R13's
   label carries `guide.procedure.legalinfo`'s words, read by that key; every other row keeps its own; codes, numbers,
   `where`s and behaviour unmoved. At the interface: the rows and the label as exported, and each refusal as the acts
   answer it, each beside its control, the same act landing without the refusing condition; over the real modules. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { READING_GUIDES_CHECKS, READING_GUIDES_WORDS, PROCEDURE_GUIDE_LABEL, checkGuide,
         readingGuidesOps } from "../../../src/reading-guides/index.mjs";
import { canonicalJson, sha256HexSync } from "../../../src/record-grammar/index.mjs";
import { world, row, item, ITEMS, ANN, BOB, MACHINE } from "./fixture.mjs";

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const word = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w;
};
const en = (key) => word(key).en;

/* The two rows R14 re-words, with their numbers and `where`s, which it does not move. */
const AT = (file, fn, region) => `src/reading-guides/${file} ${fn} > ${region}`;
const TAKEN = {
  GUIDE_KIND_UNKNOWN: ["C-144.4", AT("index.mjs", "kindRefusal", "is-guide-kind")],
  GUIDE_ITEM_UNSOURCED: ["C-144.19", AT("check.mjs", "checkGuide", "is-guide-sourced")],
};
const LABEL_KEY = "guide.procedure.legalinfo";
/* The two rows and the label as T45 worded them: none is answered any longer. */
const T45 = {
  GUIDE_KIND_UNKNOWN: "A reading guide is for one kind of document your group's Civicsmith recognises (a meeting "
    + "calendar, minutes, an agenda, a staff report, an ordinance or code section, a policy, a staff directory, "
    + "or any other document); a procedure guide is for one kind of action your group's jurisdiction profiles list. "
    + "The kind or purpose given is not one of them. Nothing was written.",
  GUIDE_ITEM_UNSOURCED: "Each route in a procedure guide carries the citation it rests on: the law, rule or published "
    + "procedure that provides it, so members can read the source. The item named has none. Add its citation. "
    + "Nothing was written.",
  label: "legal information, not legal advice",
};
/* Every other row of the family (17: C-144.1–.3, .5–.18), as T45 left them: their canonical JSON's sha256, so no
   check, where or translation of theirs moves. */
const KEPT = { count: 17, sha256: "5f32fbded9573276c596e725febe05eb66afd0b14262654e5cd39ee73014a550" };

test("R14 C-144.4 and C-144.19 read words.json's refusal.<CODE> by key from READING_GUIDES_WORDS, never a copy; codes, numbers and wheres unmoved; T45's words answered no longer", () => {
  assert.ok(Object.isFrozen(READING_GUIDES_WORDS));
  assert.deepEqual(Object.keys(READING_GUIDES_WORDS).sort(), [...Object.keys(TAKEN).map((c) => `refusal.${c}`), LABEL_KEY].sort(),
    "the table holds exactly the two rows' keys and the label's");
  for (const [key, text] of Object.entries(READING_GUIDES_WORDS)) assert.equal(text, en(key), `${key} verbatim`);
  for (const [code, [check, where]] of Object.entries(TAKEN)) {
    const r = READING_GUIDES_CHECKS[code];
    assert.deepEqual([r.check, r.where], [check, where], code);
    assert.deepEqual(Object.keys(r).sort(), ["check", "translation", "where"], code);
    assert.equal(r.translation, READING_GUIDES_WORDS[`refusal.${code}`], `${code} reads refusal.${code}`);
    assert.equal(r.translation, en(`refusal.${code}`), code);
    assert.notEqual(r.translation, T45[code], `${code}: T45's words no longer`);
    assert.match(r.translation, /Nothing was written\.$/, `${code} still says nothing was written`);
  }
});

test("R14 every other row keeps its own translation (words.json holds none of them); the family's order and count unmoved", () => {
  const kept = Object.fromEntries(Object.entries(READING_GUIDES_CHECKS).filter(([c]) => !(c in TAKEN)));
  assert.deepEqual([Object.keys(kept).length, sha256HexSync(canonicalJson(kept))], [KEPT.count, KEPT.sha256],
    "no other row's check, where or translation moved");
  for (const code of Object.keys(kept)) {
    assert.ok(!WORDS.some((w) => w.key === `refusal.${code}`), `words.json holds no refusal.${code}`);
    assert.ok(!Object.values(READING_GUIDES_WORDS).includes(kept[code].translation), code);
  }
  assert.deepEqual(Object.values(READING_GUIDES_CHECKS).map((r) => r.check),
    Array.from({ length: 19 }, (_, i) => `C-144.${i + 1}`));
});

test("R14 R13's label carries guide.procedure.legalinfo's words, read by that key (protected), never a copy; the key unchanged", () => {
  const w = word(LABEL_KEY);
  assert.equal(w.protected, true, "a protected word");
  assert.ok(Object.isFrozen(PROCEDURE_GUIDE_LABEL));
  assert.deepEqual({ ...PROCEDURE_GUIDE_LABEL }, { key: LABEL_KEY, says: w.en });
  assert.equal(PROCEDURE_GUIDE_LABEL.says, READING_GUIDES_WORDS[LABEL_KEY]);
  assert.notEqual(PROCEDURE_GUIDE_LABEL.says, T45.label, "T45's words no longer");
  /* every answer of procedureGuidesFor and op=procedureguides carries it, whatever it is asked */
  const v = world();
  for (const a of [{ kind: "bylaw_complaint", viewer: ANN }, { kind: "staff_report", viewer: ANN }, undefined, { get kind() { throw new Error("x"); } }])
    assert.deepEqual(v.g.procedureGuidesFor(a).label, { key: LABEL_KEY, says: w.en });
  assert.deepEqual(readingGuidesOps(v.g, new URL(`https://x/?kind=bylaw_complaint&viewer=${ANN}`), {}).procedureguides().label,
    { key: LABEL_KEY, says: w.en });
});

const STEPS = [{ route: "Write to the Town Clerk", citation: "P.E.B.L. § 9(1)" }];
const answers = (r, code) => {
  row(r, code);
  assert.equal(r.translation, en(`refusal.${code}`), code);
  assert.ok(!JSON.stringify(r).includes(T45[code]), `${code}: T45's words no longer`);
};

test("R14 GUIDE_KIND_UNKNOWN is answered by the acts with words.json's sentence, behaviour unmoved: refused, nothing written, beside its control", () => {
  const w = world();
  const a = world({ slug: "group-a" });
  const offer = a.g.guideOffer({ guide: a.groupGuide(), by: ANN });
  const o = JSON.parse(offer.bytes);
  const before = ["reading_guides", "reading_guide_history", "reading_guide_proposals"].map((t) => w.count(t)).join();
  /* a reading guide's kind not a document kind; a procedure guide's not an action kind of the view; a purpose neither */
  const reading = w.g.guideDraft({ kind: "court_order", items: ITEMS, by: ANN });
  answers(reading, "GUIDE_KIND_UNKNOWN");
  assert.equal(reading.kind, "court_order");
  assert.match(reading.detail, /a reading guide is for one of these kinds of document: .*staff_report/);
  const proc = w.g.guideDraft({ kind: "staff_report", purpose: "procedure", items: STEPS, by: ANN });
  answers(proc, "GUIDE_KIND_UNKNOWN");
  assert.match(proc.detail, /a procedure guide is for one of the action kinds/);
  const purpose = w.g.guideDraft({ kind: "bylaw_complaint", purpose: "rules", items: STEPS, by: ANN });
  answers(purpose, "GUIDE_KIND_UNKNOWN");
  assert.deepEqual([purpose.kind, purpose.purpose], ["bylaw_complaint", "rules"]);
  answers(w.g.guidePropose({ kind: "nope", items: ITEMS, run: "R", by: MACHINE }), "GUIDE_KIND_UNKNOWN");
  answers(w.g.guideAdopt({ bytes: canonicalJson({ ...o, kind: "court_order" }), by: BOB }), "GUIDE_KIND_UNKNOWN");
  assert.equal(["reading_guides", "reading_guide_history", "reading_guide_proposals"].map((t) => w.count(t)).join(), before,
    "nothing written");
  /* the controls: each act lands with a kind of its purpose */
  assert.equal(w.g.guideDraft({ kind: "staff_report", items: ITEMS, by: ANN }).ok, true);
  assert.equal(w.g.guideDraft({ kind: "bylaw_complaint", purpose: "procedure", items: STEPS, by: ANN }).ok, true);
  assert.equal(w.g.guidePropose({ kind: "policy", items: ITEMS, run: "R", by: MACHINE }).ok, true);
  assert.equal(w.g.guideAdopt({ bytes: offer.bytes, by: BOB }).ok, true);
});

test("R14 GUIDE_ITEM_UNSOURCED is answered by the check and the acts with words.json's sentence, behaviour unmoved: refused naming the item, nothing written, beside its control", () => {
  const unsourced = [STEPS[0], { route: "Ask the Selectboard to hear it" }];
  const c = checkGuide(unsourced, "procedure");
  answers(c, "GUIDE_ITEM_UNSOURCED");
  assert.equal(c.item, 1);
  assert.match(c.detail, /item 2 of a procedure guide names no citation/);
  const w = world();
  answers(w.g.guideDraft({ kind: "bylaw_complaint", purpose: "procedure", items: unsourced, by: ANN }), "GUIDE_ITEM_UNSOURCED");
  answers(w.g.guidePropose({ kind: "bylaw_complaint", purpose: "procedure", items: unsourced, run: "R", by: MACHINE }),
    "GUIDE_ITEM_UNSOURCED");
  assert.equal(w.count("reading_guides") + w.count("reading_guide_proposals") + w.count("reading_guide_history"), 0, "nothing written");
  /* the control: the same items, each route cited, land */
  const cited = [STEPS[0], { route: "Ask the Selectboard to hear it", citation: "P.E.B.L. § 9(2)" }];
  assert.equal(checkGuide(cited, "procedure").ok, true);
  assert.equal(w.g.guideDraft({ kind: "bylaw_complaint", purpose: "procedure", items: cited, by: ANN }).ok, true);
  /* a reading guide's item is unchanged by R14: it never answers this row */
  row(checkGuide([item("L", "Look for the date")].map((x) => ({ ...x, citation: "c" }))), "GUIDE_ITEMS_REFUSED");
});
