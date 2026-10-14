/* T48-34 (N670; DEC-127 (3), (4), DEC-157 (6); K3190): the reading translation layer (R49). Each clause found by R21's
 * normaliser in canon; the stated absence as the control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPack, packVersion, SOURCING } from "../../../src/skillpack.mjs";
import { readingTranslationLayer, READING_TRANSLATION_CLAUSES, READING_TRANSLATION_ACT, READING_TRANSLATION_TASK,
         INTERFACE_TRANSLATION_CLAUSES, OFFICIAL_LOCAL_NAMES, GROUP_LOCAL_WORDS, INTERACTION_SOURCE, DECISIONS_SOURCE,
         LANGUAGE_SECTION, controlFlowAuthority } from "../../../src/skilldoctrine.mjs";
import { DRAFT_MODE } from "../../../src/run-rules/index.mjs";
import { SRC, read, foundIn, section, canonDocuments, published, stringLiterals } from "./fixture.mjs";

/* The act R49 names, as `op=affordances` would publish it once its op is declared (op-declarations R64; plane R50): an
   entry of the plane's shape, open to a member's session only. */
const ACT = "readtranslate";
const entry = (id) => ({ id, label: `the ${id} act`, weight: null, needs: "contribute", mode: "session", rung: null,
                         rung_absence: null, prompt: null });
const readCatalog = () => [...published().catalog, entry(ACT)];
const LOAD_WHEN = "a member asks to read a note, question, finding or notice in her language";
const PLACES = ["Oakland", "Alameda", "California", "Berkeley", "San Francisco"];

/* Where each clause is quoted from: §L of the Interaction Constructs, and a DEC's ruling, its `response:` line. */
const decRuling = (dec) => section(read(DECISIONS_SOURCE), `${dec} `).split("\n").find((l) => l.startsWith("response:")) ?? "";
/* DEC-127's points (3) and (4), the part of its ruling R49 names: from "(3) " to "(5) ". */
const dec127Points34 = () => { const r = decRuling("DEC-127"); return r.slice(r.indexOf("(3) "), r.indexOf("(5) ")); };
/* DEC-157's point (6). */
const dec157Point6 = () => { const r = decRuling("DEC-157"); return r.slice(r.indexOf("(6) ")); };
const L = () => section(read(INTERACTION_SOURCE), "L · ");
const where = (c) => (c.source === INTERACTION_SOURCE && c.section === LANGUAGE_SECTION ? L()
  : c.source === DECISIONS_SOURCE && c.section === "DEC-127" ? dec127Points34()
  : c.source === DECISIONS_SOURCE && c.section === "DEC-157" ? dec157Point6() : "");
const strings = (v) => typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];
const all = () => READING_TRANSLATION_CLAUSES.map((c) => c.text).join(" ");

test("R49 R5 the reading_translation layer, in disclosed after action_drafting: authored, its load_when R49's sentence, its body the clauses of §L, DEC-127 (3), (4) and DEC-157 (6), each found by R21's normaliser in canon", () => {
  const { disclosed, resident } = renderPack(published({ catalog: readCatalog() }));
  const keys = Object.keys(disclosed);
  assert.equal(keys.indexOf("reading_translation"), keys.indexOf("action_drafting") + 1, "after action_drafting");
  const layer = disclosed.reading_translation;
  assert.equal(layer.sourcing, "authored");
  assert.equal(SOURCING.reading_translation, "authored");
  assert.equal(layer.load_when, LOAD_WHEN);
  assert.ok(resident.disclosable.some((d) => d.layer === "reading_translation" && d.load_when === LOAD_WHEN));
  assert.equal(layer.body.clauses, READING_TRANSLATION_CLAUSES);
  assert.ok(canonDocuments().has(INTERACTION_SOURCE), `${INTERACTION_SOURCE} is canon`);
  const readme = read("requirements/README.md");
  const canon = readme.slice(readme.indexOf("## Canon"), readme.indexOf("## Reference, not canon"));
  assert.match(canon.split("\n").find((l) => l.includes(DECISIONS_SOURCE)) ?? "", /DEC-n.*\| each ruling \|/);
  assert.ok(READING_TRANSLATION_CLAUSES.length > 0);
  const seen = new Set();
  for (const c of READING_TRANSLATION_CLAUSES) {
    assert.deepEqual(Object.keys(c).sort(), ["section", "source", "text"]);
    const w = where(c);
    assert.ok(w.length > 0, `${c.section} of ${c.source} is a source R49 names`);
    assert.ok(foundIn(w, c.text), `"${c.text}" is in ${c.section} of ${c.source}`);
    seen.add(c.section);
  }
  assert.deepEqual([...seen].sort(), ["DEC-127", "DEC-157", "§L"], "each source R49 names is quoted");
  /* The lookup can miss: a changed word is not found, and DEC-127's (3) is not in its (1), (2), (5) or (6). */
  const [own] = READING_TRANSLATION_CLAUSES.filter((c) => c.section === "DEC-127" && /own words stay theirs/.test(c.text));
  assert.ok(!foundIn(dec127Points34(), own.text.replace("stay theirs", "stay the group's")));
  const r = decRuling("DEC-127");
  assert.ok(!foundIn(r.slice(0, r.indexOf("(3) ")) + r.slice(r.indexOf("(5) ")), own.text));
});

test("R49 the clauses: the translation labelled machine work with the original one tap away; it never replaces the original; a member's own words stay hers; signed and published records stay in the language they were signed in; official local names stay as they are", () => {
  for (const re of [/labelled "Machine translation · original in English"/, /the original one tap away/,
                    /it never replaces the original/, /a translation never replaces the original/,
                    /a member's own words stay theirs/, /Signed and published records stay in the language they were signed in/,
                    /official local names stay as they are/, /official names of offices, laws, programs and places stay as they are/])
    assert.match(all(), re);
  /* DEC-127 (3) and (4) each carried from the ruling, and §L's statement of each. */
  for (const re of [/never replaces the original/, /stay in the language they were signed in/]) {
    assert.ok(READING_TRANSLATION_CLAUSES.some((c) => c.section === "DEC-127" && re.test(c.text)), `DEC-127: ${re}`);
    assert.ok(READING_TRANSLATION_CLAUSES.some((c) => c.section === LANGUAGE_SECTION && re.test(c.text)), `§L: ${re}`);
  }
  /* DEC-157 (6)'s clauses are R39's own objects, held once, so the two layers never differ. */
  assert.ok(READING_TRANSLATION_CLAUSES.includes(OFFICIAL_LOCAL_NAMES));
  assert.ok(READING_TRANSLATION_CLAUSES.includes(GROUP_LOCAL_WORDS));
  assert.ok(INTERFACE_TRANSLATION_CLAUSES.includes(OFFICIAL_LOCAL_NAMES));
  assert.ok(INTERFACE_TRANSLATION_CLAUSES.includes(GROUP_LOCAL_WORDS));
  for (const c of READING_TRANSLATION_CLAUSES) {
    assert.ok(Object.isFrozen(c));
    for (const place of PLACES) assert.ok(!c.text.includes(place), "R26");
  }
});

test("R49 the task's description is this module's own words, not a clause (R48's form): the passage whole, adding and summarizing nothing, quotations, figures, dates, ids and citations as they stand", () => {
  const layer = readingTranslationLayer(readCatalog());
  assert.equal(layer.body.task, READING_TRANSLATION_TASK);
  assert.match(READING_TRANSLATION_TASK, /translates the passage it is handed into the member's language whole/);
  assert.match(READING_TRANSLATION_TASK, /adding nothing and summarizing nothing/);
  assert.match(READING_TRANSLATION_TASK, /leaves quotations, figures, dates, ids and citations as they stand/);
  assert.ok(!READING_TRANSLATION_CLAUSES.some((c) => c.text === READING_TRANSLATION_TASK), "not among the clauses");
  for (const src of [L(), decRuling("DEC-127"), decRuling("DEC-157")]) assert.ok(!foundIn(src, READING_TRANSLATION_TASK));
  /* The mode is run-rules' draft mode (its R21), read from it and never typed (R23). */
  assert.equal(layer.body.mode, DRAFT_MODE.mode);
});

test("R49 acts: readtranslate, the published catalogue's own entry read by id with the requirement that defines it; named once, as a selector (R23)", () => {
  const catalog = readCatalog();
  const { acts } = renderPack(published({ catalog })).disclosed.reading_translation.body;
  assert.deepEqual(Object.keys(acts), ["drafts"]);
  assert.deepEqual(acts.drafts.map((a) => a.id), [ACT]);
  assert.equal(acts.drafts[0].act, catalog.find((a) => a.id === ACT), "the catalogue's own entry, unchanged");
  assert.equal(acts.drafts[0].defined_by, "plane R50");
  assert.equal(READING_TRANSLATION_ACT.id, ACT);
  const relabelled = catalog.map((a) => (a.id === ACT ? { ...a, label: "Read in my language" } : a));
  assert.equal(readingTranslationLayer(relabelled).body.acts.drafts[0].act.label, "Read in my language");
  const lits = SRC.flatMap((f) => stringLiterals(read(f)));
  assert.equal(lits.filter((l) => l === ACT).length, 1, `${ACT} is named once`);
  assert.ok(!lits.includes(`the ${ACT} act`));
});

test("R49 R9 control: without readtranslate published, the layer is R9's stated absence and the pack still renders; the version tells the two packs apart and moves with a clause (R11)", () => {
  for (const catalog of [published().catalog, undefined, null, "x", [{ id: 7 }]]) {
    const layer = readingTranslationLayer(catalog);
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.equal(SOURCING.reading_translation_unpublished, "absent");
    assert.deepEqual(layer.body, {});
    assert.match(layer.absent_because, new RegExp(ACT));
  }
  const bare = renderPack(published());
  assert.equal(bare.disclosed.reading_translation.sourcing, "absent");
  assert.ok(bare.resident.disclosable.some((d) => d.layer === "reading_translation" && d.load_when === "never, in this edition"));
  const full = renderPack(published({ catalog: readCatalog() }));
  assert.notEqual(bare.version, full.version);
  const json = JSON.stringify(full);
  for (const s of [...READING_TRANSLATION_CLAUSES.map((c) => c.text), READING_TRANSLATION_TASK])
    assert.ok(json.includes(JSON.stringify(s).slice(1, -1)), s);
  const layer = full.disclosed.reading_translation;
  const moved = { ...full, disclosed: { ...full.disclosed, reading_translation: { ...layer,
    body: { ...layer.body, clauses: [...layer.body.clauses.slice(1)] } } } };
  assert.notEqual(packVersion(moved), full.version, "a clause moved moves the version");
  assert.equal(renderPack(published({ catalog: readCatalog() })).version, full.version, "the control: the same render, the same version");
});

test("R49 R22 this module reads no account, language or passage: the layer and the pack are the same for every member and every language", () => {
  const base = renderPack(published({ catalog: readCatalog() }));
  for (const over of [{ account: "group-key" }, { language: "es" }, { text: "a note" }, { keep_away: true }, { viewer: "m1" }])
    assert.equal(JSON.stringify(renderPack(published({ catalog: readCatalog(), ...over }))), JSON.stringify(base), JSON.stringify(over));
  assert.match(base.disclosed.reading_translation.body.note, /reads no account, language or passage/);
});

test("R49 R16 R24 R26 no string of the layer, present or absent, carries control-flow authority, and none names a place", () => {
  for (const catalog of [readCatalog(), published().catalog]) {
    const layer = readingTranslationLayer(catalog);
    for (const s of strings({ ...layer, body: { ...layer.body, acts: undefined } }))
      assert.deepEqual(controlFlowAuthority(s), [], s);
    const json = JSON.stringify(layer);
    for (const place of PLACES) assert.ok(!json.includes(place), place);
  }
  assert.ok(controlFlowAuthority("Keep going until the whole passage is translated.").length > 0, "the scan can fire");
});
