import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPack, SOURCING } from "../../../src/skillpack.mjs";
import { interfaceTranslationLayer, writingHelpLayer, INTERFACE_TRANSLATION_CLAUSES, INTERFACE_TRANSLATION_ACTS,
         INTERFACE_TRANSLATION_ACT, INTERFACE_TRANSLATION_LABELS, INTERACTION_SOURCE, DECISIONS_SOURCE, LANGUAGE_SECTION,
         controlFlowAuthority } from "../../../src/skilldoctrine.mjs";
import { DRAFT_MODE } from "../../../src/run-rules/index.mjs";
import { PROPOSAL_STATES, proposalLabel } from "../../../src/record-grammar/index.mjs";
import { SRC, read, foundIn, section, canonDocuments, published, stringLiterals } from "./fixture.mjs";

/* The acts R39 names, as `op=affordances` would publish them once their ops are declared (L11, T37-31): the draft act
   open to a member's request and served by the assistant, and the member's acts on a word, each an entry of the
   plane's shape. */
const PROPOSES = ["translationdraft"];
const MEMBER = ["translationadopt", "translationconfirm", "translationrevert"];
const DIRECTIONS = ["to_language", "to_english"];
const entry = (id, mode) => ({ id, label: `the ${id} act`, weight: null, needs: "contribute", mode, rung: null,
                               rung_absence: null, prompt: null });
const translationCatalog = (drop = []) => [...published().catalog,
  ...PROPOSES.map((id) => entry(id, "session")), ...MEMBER.map((id) => entry(id, "session"))]
  .filter((a) => !drop.includes(a.id));
const LOAD_WHEN = "a member granted a language asks for drafts of the interface words the group's translation of it "
  + "lacks, or an administrator asks for a kept word read back into English";
const PLACES = ["Oakland", "Alameda", "California", "Berkeley", "San Francisco"];

/* Where each clause is quoted from: §L of the Interaction Constructs ("L · ACCESS AND LANGUAGE"), and each DEC's ruling,
   its `response:` line (the ruling is canon; its `owed:` line is BOB's work list, not the ruling). */
const decRuling = (dec) => section(read(DECISIONS_SOURCE), `${dec} `).split("\n").find((l) => l.startsWith("response:")) ?? "";
const where = (c) => (c.source === INTERACTION_SOURCE && c.section === LANGUAGE_SECTION
  ? section(read(INTERACTION_SOURCE), "L · ") : c.source === DECISIONS_SOURCE ? decRuling(c.section) : "");
const strings = (v) => typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];
const text = (re) => INTERFACE_TRANSLATION_CLAUSES.filter((c) => re.test(c.text));

test("R39 R5 the interface_translation layer, in disclosed after writing_help and before wizard_scripts: authored, its load_when R39's sentence, its body the clauses of §L and the rulings of DEC-127, DEC-157 and DEC-179, each found by R21's normaliser in canon", () => {
  const { disclosed, resident } = renderPack(published({ catalog: translationCatalog() }));
  const keys = Object.keys(disclosed);
  assert.equal(keys.indexOf("interface_translation"), keys.indexOf("writing_help") + 1, "after writing_help");
  assert.equal(keys.indexOf("wizard_scripts"), keys.indexOf("interface_translation") + 1, "and before wizard_scripts");
  const layer = disclosed.interface_translation;
  assert.equal(layer.sourcing, "authored");
  assert.equal(SOURCING.interface_translation, "authored");
  assert.equal(layer.load_when, LOAD_WHEN);
  assert.ok(resident.disclosable.some((d) => d.layer === "interface_translation" && d.load_when === LOAD_WHEN));
  assert.equal(layer.body.clauses, INTERFACE_TRANSLATION_CLAUSES);
  /* The mode is run-rules' draft mode (its R21, R22), read from it, as writing help's is. */
  assert.equal(layer.body.mode, DRAFT_MODE.mode);
  /* Canon: the Interaction Constructs whole, and the DEC rulings, each ruling (requirements/README.md's Canon). */
  assert.ok(canonDocuments().has(INTERACTION_SOURCE), `${INTERACTION_SOURCE} is canon`);
  const readme = read("requirements/README.md");
  const canon = readme.slice(readme.indexOf("## Canon"), readme.indexOf("## Reference, not canon"));
  assert.match(canon.split("\n").find((l) => l.includes(DECISIONS_SOURCE)) ?? "", /DEC-n.*\| each ruling \|/);
  assert.equal(DECISIONS_SOURCE, "docs/development/DECISIONS.md");
  assert.ok(INTERFACE_TRANSLATION_CLAUSES.length > 0);
  const seen = new Set();
  for (const c of INTERFACE_TRANSLATION_CLAUSES) {
    assert.deepEqual(Object.keys(c).sort(), ["section", "source", "text"]);
    assert.ok([`${INTERACTION_SOURCE} §L`, `${DECISIONS_SOURCE} DEC-127`, `${DECISIONS_SOURCE} DEC-157`,
               `${DECISIONS_SOURCE} DEC-179`].includes(`${c.source} ${c.section}`), `${c.source} ${c.section}`);
    const w = where(c);
    assert.ok(w.length > 0, `${c.section} of ${c.source} is where it was`);
    assert.ok(foundIn(w, c.text), `"${c.text}" is in ${c.section} of ${c.source}`);
    seen.add(c.section);
  }
  assert.deepEqual([...seen].sort(), ["DEC-127", "DEC-157", "DEC-179", "§L"], "each source R39 names is quoted");
  /* §L's clauses are the three paragraphs R39 names: "Translation by groups", "Translation", "The word list". */
  const L = section(read(INTERACTION_SOURCE), "L · ");
  const para = (head) => L.slice(L.indexOf(head), L.indexOf("\n\n", L.indexOf(head)) < 0 ? L.length : L.indexOf("\n\n", L.indexOf(head)));
  const byGroups = para("**Translation by groups"), translation = L.slice(L.indexOf("**Translation (Bob"), L.indexOf("**The word list")),
        wordList = L.slice(L.indexOf("**The word list"), L.indexOf("**Ruled 2026-10-06 by Bob (DEC-149"));
  assert.match(byGroups, /DEC-127/); assert.match(translation, /DEC-157/); assert.match(wordList, /DEC-179/);
  for (const c of INTERFACE_TRANSLATION_CLAUSES.filter((x) => x.section === LANGUAGE_SECTION))
    assert.ok([byGroups, translation, wordList].some((p) => foundIn(p, c.text)), `in one of §L's three paragraphs: ${c.text}`);
  /* The lookup can miss: a changed word is not found, a ruling is not another's, and the `owed:` line is not a ruling. */
  const draft = text(/granted speaker reads each/)[0];
  assert.ok(!foundIn(decRuling("DEC-157"), draft.text.replace("keeps or corrects it", "keeps it")));
  assert.ok(!foundIn(decRuling("DEC-127"), draft.text));
  assert.ok(!foundIn(decRuling("DEC-157"), "never translated as ordinary words"), "the owed line's words are not the ruling's");
});

test("R39 (a) the assistant drafts only the words missing from the group's language, each a labelled draft that is not the group's wording until a member granted that language checks and keeps or corrects it", () => {
  const all = INTERFACE_TRANSLATION_CLAUSES.map((c) => c.text).join(" ");
  for (const re of [/the assistant drafts the missing ones as labelled drafts/, /it drafts every missing word \("Draft · the assistant's"\)/,
                    /a granted speaker reads each against the English and keeps or corrects it/,
                    /a member who knows the language checks and adopts each/, /without the assistant, the granted member types them/,
                    /ordinary words show once kept/])
    assert.match(all, re);
  /* The label the draft carries is record-grammar's, shown as "Draft", not the group's wording until a granted member
     adopts it (its R50). */
  for (const s of Object.values(INTERFACE_TRANSLATION_LABELS)) {
    assert.match(s, /shown to members as "Draft"/);
    assert.match(s, /not the group's wording until a member granted that language adopts it/);
  }
});

test("R39 (b) a draft translates the word list's English under its stable key, the placeholder marked, every language saying what the fixed term's note says, and no word renamed within a language", () => {
  const all = INTERFACE_TRANSLATION_CLAUSES.map((c) => c.text).join(" ");
  for (const re of [/held with a stable key and its protected mark in `docs\/development\/ux-substrate\/screens\/words\.json`/,
                    /a word keeps its key when its English changes/, /`\{name\}` marks a placeholder/,
                    /each carry a note on what they mean, so every language says the same thing/,
                    /renaming words within a language stays out/])
    assert.match(all, re);
  assert.equal(text(/marks a placeholder/)[0].section, "DEC-179");
  assert.equal(text(/renaming words within a language stays out/)[0].section, "DEC-127");
});

test("R39 (c) official local names are never translated as ordinary words: they stay as they are, and an official translation the place publishes is used with its source", () => {
  const [names] = text(/official names of offices, laws, programs and places stay as they are/);
  assert.ok(names, "DEC-157 (6)'s clause is carried");
  assert.equal(names.section, "DEC-157");
  assert.match(names.text, /where the place publishes an official translation of a name, it is used with its source/);
  const [own] = text(/the group's own local words are its to translate as ordinary words/);
  assert.ok(own && own.section === "DEC-157", "only the group's own local words are ordinary words");
  for (const c of INTERFACE_TRANSLATION_CLAUSES) for (const place of PLACES) assert.ok(!c.text.includes(place), "R26");
});

test("R39 (d) as Bob ruled DEC-157 (4): a protected word kept as the assistant drafted it shows once one granted speaker keeps it; changed from the draft, or typed without one, it shows only after a second granted speaker or an administrator's check of the assistant's reading back into English, members seeing the English meanwhile", () => {
  const [rule] = text(/^protected words \(/);
  assert.ok(rule, "DEC-157 (4)'s ruling is carried");
  assert.equal(rule.section, "DEC-157");
  assert.match(rule.text, /kept as the assistant drafted them, they show once one speaker keeps them/);
  assert.match(rule.text, /changed from the draft, or typed without one, they show only after a second granted speaker confirms them, or an administrator confirms them after reading the assistant's translation of them back into English/);
  assert.match(rule.text, /until then members see the English$/);
  /* Only a changed or typed protected word waits: the unchanged one is not held to the second check. */
  assert.ok(rule.text.indexOf("they show once one speaker keeps them") < rule.text.indexOf("changed from the draft"));
  const [set] = text(/^Protected, as DEC-157 \(4\) sets/);
  assert.ok(set && set.section === "DEC-179", "DEC-179 (4)'s protected set is carried");
  const [l] = text(/changed from the assistant's draft waits for a second speaker/);
  assert.ok(l && l.section === LANGUAGE_SECTION, "§L's statement of the same rule");
  /* A machine keeps and confirms nothing: the label it carries says it can never adopt or confirm one (record-grammar R50). */
  assert.match(INTERFACE_TRANSLATION_LABELS.machine_proposed, /it can draft a translation and it can never adopt or confirm one/);
});

test("R39 (e) the reading back into English is the assistant's translation an administrator reads before confirming; what no canon sentence states (the word alone, its label, adopting nothing) is not authored as a clause, and the layer names the code that holds it (K921's pattern)", () => {
  const all = INTERFACE_TRANSLATION_CLAUSES.map((c) => c.text).join(" ");
  assert.match(all, /an administrator confirms them after reading the assistant's translation of them back into English/);
  assert.match(all, /an administrator reading the assistant's back-translation/);
  /* Not authored: no clause states what canon does not. */
  for (const unstated of ["placeholder as it stands", "kept word alone", "adopts nothing", "keeps or confirms nothing itself"])
    assert.ok(!INTERFACE_TRANSLATION_CLAUSES.some((c) => c.text.includes(unstated)), unstated);
  const layer = interfaceTranslationLayer(translationCatalog());
  assert.match(layer.body.held_by_code, /a draft whose placeholders changed is dropped when it is recorded/);
  assert.match(layer.body.held_by_code, /a reading back into English is of exactly one kept word and records nothing/);
  assert.match(layer.body.held_by_code, /every draft is recorded under the label above/);
  assert.ok(!INTERFACE_TRANSLATION_CLAUSES.includes(layer.body.held_by_code));
});

test("R39 labels: record-grammar's PROPOSAL_STATES table for translation (its R50), the very object, carried unchanged; the same sentences proposalLabel answers; none typed in the source (R23)", () => {
  const layer = renderPack(published({ catalog: translationCatalog() })).disclosed.interface_translation;
  assert.equal(layer.body.labels, PROPOSAL_STATES.translation, "the same object, not a copy");
  assert.equal(INTERFACE_TRANSLATION_LABELS, PROPOSAL_STATES.translation);
  assert.ok(Object.isFrozen(layer.body.labels));
  assert.deepEqual(Object.keys(layer.body.labels), ["machine_proposed", "member_proposed", "unstated"]);
  for (const [by, state] of [["", "unstated"], ["member:alice", "member_proposed"]])
    assert.equal(proposalLabel(by, "translation").says, layer.body.labels[state]);
  const lits = SRC.flatMap((f) => stringLiterals(read(f)));
  for (const s of Object.values(PROPOSAL_STATES.translation)) assert.ok(!lits.some((l) => l.includes(s.slice(0, 40))), s);
});

test("R39 acts: translationdraft (both its directions, to_language and to_english), and the member-only translationadopt, translationconfirm and translationrevert, each the published catalogue's own entry read by id with the requirement that defines it; each id and direction named once, as a selector (R23)", () => {
  const catalog = translationCatalog();
  const { acts } = renderPack(published({ catalog })).disclosed.interface_translation.body;
  const byId = new Map(catalog.map((a) => [a.id, a]));
  assert.deepEqual(acts.proposes.map((a) => a.id), PROPOSES);
  assert.deepEqual(acts.leaves_to_a_member.map((a) => a.id), MEMBER);
  for (const a of [...acts.proposes, ...acts.leaves_to_a_member])
    assert.equal(a.act, byId.get(a.id), `${a.id} is the catalogue's own entry, unchanged`);
  assert.deepEqual(acts.proposes[0].directions, DIRECTIONS);
  assert.deepEqual(acts.proposes.map((a) => a.defined_by), ["instance-setup R67"]);
  for (const a of acts.leaves_to_a_member) assert.match(a.defined_by, /^instance-setup /);
  const relabelled = catalog.map((a) => (a.id === "translationconfirm" ? { ...a, label: "Confirm, relabelled" } : a));
  const got = interfaceTranslationLayer(relabelled).body.acts.leaves_to_a_member.find((a) => a.id === "translationconfirm");
  assert.equal(got.act.label, "Confirm, relabelled");
  const lits = SRC.flatMap((f) => stringLiterals(read(f)));
  for (const id of [...PROPOSES, ...MEMBER, ...DIRECTIONS]) assert.equal(lits.filter((l) => l === id).length, 1, `${id} is named once`);
  for (const id of [...PROPOSES, ...MEMBER]) assert.ok(!lits.includes(`the ${id} act`));
  assert.equal(INTERFACE_TRANSLATION_ACT, "translationdraft");
  assert.deepEqual([...INTERFACE_TRANSLATION_ACTS.proposes, ...INTERFACE_TRANSLATION_ACTS.leaves_to_a_member].map((a) => a.id),
    [...PROPOSES, ...MEMBER]);
});

test("R39 R1 with translationdraft published, an act R39 names that the catalogue does not publish throws naming it, and nothing renders; without it, the others missing is no refusal", () => {
  for (const id of MEMBER) {
    const pub = published({ catalog: translationCatalog([id]) });
    assert.throws(() => renderPack(pub), new RegExp(`interface translation layer names the act ${id} \\(`), id);
    assert.throws(() => interfaceTranslationLayer(pub.catalog), new RegExp(`names the act ${id} `));
  }
  assert.ok(renderPack(published({ catalog: translationCatalog() })).version, "the full catalogue renders");
  for (const drop of [["translationdraft", "translationadopt"], ["translationdraft", "translationconfirm"], [...PROPOSES, ...MEMBER]])
    assert.equal(renderPack(published({ catalog: translationCatalog(drop) })).disclosed.interface_translation.sourcing, "absent");
});

test("R39 R9 with no translationdraft published (T37: its ops are declared only in L11), the layer is a stated absence in R9's form and the pack still renders; the version tells the two packs apart, and moves with a clause or a label (R11)", () => {
  for (const catalog of [published().catalog, translationCatalog(["translationdraft"]), undefined, null, "x"]) {
    const layer = interfaceTranslationLayer(catalog);
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.equal(SOURCING.interface_translation_unpublished, "absent");
    assert.deepEqual(layer.body, {});
    assert.match(layer.absent_because, /translationdraft/);
  }
  const { disclosed, resident, version } = renderPack(published());
  assert.equal(disclosed.interface_translation.sourcing, "absent");
  assert.ok(resident.disclosable.some((d) => d.layer === "interface_translation" && d.load_when === "never, in this edition"));
  const full = renderPack(published({ catalog: translationCatalog() }));
  assert.notEqual(version, full.version);
  /* The digest is over what is rendered: the clauses and the labels are carried, so either moving moves the version. */
  const json = JSON.stringify(full);
  const carried = (s) => json.includes(JSON.stringify(s).slice(1, -1));
  for (const c of INTERFACE_TRANSLATION_CLAUSES) assert.ok(carried(c.text), c.text);
  for (const s of Object.values(PROPOSAL_STATES.translation)) assert.ok(carried(s), s);
});

test("R39 R22 this module reads no account, grant, keep-away setting, language or word list: the layer and the pack are the same for every member and every language", () => {
  const base = renderPack(published({ catalog: translationCatalog() }));
  for (const over of [{ account: "group-key" }, { language: "es" }, { grants: { es: ["member:1"] } }, { keep_away: true },
                      { words: [{ key: "act.publish.does", english: "x", protected: true }] }, { viewer: "admin:1" }])
    assert.equal(JSON.stringify(renderPack(published({ catalog: translationCatalog(), ...over }))), JSON.stringify(base),
      JSON.stringify(over));
  assert.equal(interfaceTranslationLayer.length, 1, "the layer takes the catalogue alone");
  assert.match(base.disclosed.interface_translation.body.note, /reads no account, grant, keep-away setting or word list/);
  /* Writing help's layer is unchanged by this one (R36). */
  assert.deepEqual(base.disclosed.writing_help, writingHelpLayer(translationCatalog()));
});

test("R39 R16 R24 R26 no string of the layer, present or absent, carries control-flow authority, and none names a place", () => {
  for (const catalog of [translationCatalog(), published().catalog]) {
    const layer = interfaceTranslationLayer(catalog);
    for (const s of strings({ ...layer, body: { ...layer.body, acts: undefined } }))
      assert.deepEqual(controlFlowAuthority(s), [], s);
    const json = JSON.stringify(layer);
    for (const place of PLACES) assert.ok(!json.includes(place));
  }
  assert.ok(controlFlowAuthority("Keep going until every word is drafted.").length > 0, "the scan can fire");
});
