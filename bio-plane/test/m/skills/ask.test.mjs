import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPack, SOURCING } from "../../../src/skillpack.mjs";
import { askLayer, suggestionsLayer, ASK_CLAUSES, SUGGESTION_CLAUSES, ANSWER_CHECKS_KEY, LADDERS_SOURCE, ROLES_SOURCE,
         controlFlowAuthority } from "../../../src/skilldoctrine.mjs";
import { SRC, read, foundIn, section, canonDocuments, published, stringLiterals } from "./fixture.mjs";

/* `answers`' checks as the plane would publish them (`answers` R4, R24): its family keyed by code, each row with its
   check and translation. Made for the case; the real rows are `answers`' own and are carried, never copied. */
const CHECKS = {
  ANSWER_CITES_UNREAD: { check: "C-200.1", translation: "a quote the read did not answer" },
  ANSWER_FIGURE_UNSOURCED: { check: "C-200.2", translation: "a figure from no result" },
  ANSWER_RULE_NOT_PLANE: { check: "C-200.3", translation: "a rule the plane did not answer" },
  ANSWER_ABSENCE_WITHOUT_LEVEL: { check: "C-200.4", translation: "an absence with no level" },
};
const ASK_LOAD_WHEN = "the member asks a question of the record";
const SUGGESTIONS_LOAD_WHEN = "the asking member's own suggestions switch is on";

/* The canon sections the clauses are quoted from. */
const sections = () => {
  const ladders = read(LADDERS_SOURCE);
  return { [LADDERS_SOURCE]: { "§2": section(ladders, "2. Design for the ladder"), "§9.4": section(ladders, "9.4 "),
                               "§10": section(ladders, "10. Doctrine") },
           [ROLES_SOURCE]: { "§3": section(read(ROLES_SOURCE), "3. The rules") } };
};
const strings = (v) => typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];
const DEC27 = "The assistant may only structure what the member SAID";

test("R34 R5 the ask layer, in disclosed after legal_lookup: authored, its load_when R34's sentence, its body the clauses of ladders §9.4 and §10 and DEC-27's limit, each found by R21's normaliser", () => {
  const { disclosed, resident } = renderPack(published({ [ANSWER_CHECKS_KEY]: CHECKS }));
  const keys = Object.keys(disclosed);
  assert.equal(keys.indexOf("ask"), keys.indexOf("legal_lookup") + 1, "after legal_lookup");
  const layer = disclosed.ask;
  assert.equal(layer.sourcing, "authored");
  assert.equal(SOURCING.ask, "authored");
  assert.equal(layer.load_when, ASK_LOAD_WHEN);
  assert.ok(resident.disclosable.some((d) => d.layer === "ask" && d.load_when === ASK_LOAD_WHEN));
  assert.equal(layer.body.clauses, ASK_CLAUSES);
  for (const src of [LADDERS_SOURCE, ROLES_SOURCE]) assert.ok(canonDocuments().has(src), `${src} is canon`);
  const bySource = sections();
  for (const c of ASK_CLAUSES) {
    assert.deepEqual(Object.keys(c).sort(), ["section", "source", "text"]);
    const where = bySource[c.source]?.[c.section];
    assert.ok(where && where.length > 0, `${c.section} of ${c.source} is where it was`);
    assert.ok(foundIn(where, c.text), `"${c.text}" is in ${c.section} of ${c.source}`);
  }
  /* What R34 names: the closed book and every rule from the plane; quotes, figures and absences bound to what was
     read, at the level searched; at most one clarifying question; the legal-information labels; DEC-27's limit. */
  const all = ASK_CLAUSES.map((c) => c.text).join(" ");
  for (const re of [/^No fact and no rule from the model's knowledge; every rule from the plane/, /quotes beside every summary/,
                    /holdings with verbatim quotes/, /at most one clarifying question/, /names which of the record's four search levels/,
                    /The legal-information line/, /never a member's rights, an outcome or what to file/, /prompt injection/])
    assert.match(all, re);
  assert.ok(ASK_CLAUSES.some((c) => c.text === DEC27 && c.source === ROLES_SOURCE), "DEC-27's limit, carried unconditionally");
  /* The lookup can miss: a changed word is not found, and a §9.4 sentence is not §10's. */
  assert.ok(!foundIn(bySource[LADDERS_SOURCE]["§9.4"], "at most two clarifying questions"));
  assert.ok(!foundIn(bySource[LADDERS_SOURCE]["§10"], ASK_CLAUSES[2].text));
});

test("R34 answers' checks are carried as the plane publishes them, by key, never copied: the very object, every row with its code, check and translation; no code is typed in the source (R23); the version moves with a translation (R11)", () => {
  const pub = published({ [ANSWER_CHECKS_KEY]: CHECKS });
  const layer = renderPack(pub).disclosed.ask;
  assert.equal(ANSWER_CHECKS_KEY, "answer_checks");
  assert.equal(layer.body.checks, pub.answer_checks, "the published family, unchanged");
  assert.equal(layer.body.checks_sourcing, "driven");
  assert.equal(SOURCING.answer_checks, "driven");
  /* A fifth row the plane publishes (answers' ANSWER_MALFORMED, say) is carried as published. */
  const more = { ...CHECKS, ANSWER_MALFORMED: { check: "C-200.5", translation: "not an answer's shape" } };
  assert.equal(askLayer(published({ answer_checks: more })).body.checks, more);
  const lits = SRC.flatMap((f) => stringLiterals(read(f)));
  assert.deepEqual(lits.filter((l) => /^ANSWER_[A-Z_]+$/.test(l)), [], "no answers code is typed");
  const moved = { ...CHECKS, ANSWER_RULE_NOT_PLANE: { ...CHECKS.ANSWER_RULE_NOT_PLANE, translation: "re-worded" } };
  assert.notEqual(renderPack(pub).version, renderPack(published({ answer_checks: moved })).version);
  assert.equal(renderPack(published({ answer_checks: { ...CHECKS } })).version, renderPack(pub).version,
    "the same words give the same version");
});

test("R34 the next acts a member may take are named by their catalogue ids, read from the acts layer; the layer types none", () => {
  const layer = askLayer(published({ answer_checks: CHECKS }));
  assert.equal(typeof layer.body.next_acts, "string");
  assert.match(layer.body.next_acts, /named by its id as the published catalogue gives it \(the acts layer\)/);
  assert.match(layer.body.next_acts, /the answer takes none/);
  const pub = published({ answer_checks: CHECKS });
  assert.equal(renderPack(pub).disclosed.acts.body.catalog, pub.catalog, "the acts layer carries the catalogue the ids name");
  for (const a of published().catalog) assert.ok(!JSON.stringify(layer).includes(`"${a.id}"`), `${a.id} is not typed in the layer`);
});

test("R34 R9 with no answers checks published, the ask layer is a stated absence in R9's form and the pack still renders; the version tells the two packs apart (R11)", () => {
  for (const answer_checks of [undefined, null, "x", 3, [], [CHECKS], {}]) {
    const layer = askLayer(published({ answer_checks }));
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"], JSON.stringify(answer_checks));
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.equal(SOURCING.ask_unpublished, "absent");
    assert.deepEqual(layer.body, {});
    assert.match(layer.absent_because, /answer_checks/);
  }
  for (const odd of [undefined, null, "x"]) assert.equal(askLayer(odd).sourcing, "absent");
  const { disclosed, resident, version } = renderPack(published());
  assert.equal(disclosed.ask.sourcing, "absent");
  assert.ok(resident.disclosable.some((d) => d.layer === "ask" && d.load_when === "never, in this edition"));
  assert.notEqual(version, renderPack(published({ answer_checks: CHECKS })).version);
});

test("R35 R5 the suggestions layer, in disclosed after ask and before wizard_scripts: authored, its load_when R35's sentence, its body the ladders' suggestion switch (§2) and DEC-27's limit, each found by R21's normaliser", () => {
  for (const pub of [published(), published({ answer_checks: CHECKS })]) {
    const { disclosed, resident } = renderPack(pub);
    const keys = Object.keys(disclosed);
    assert.equal(keys.indexOf("suggestions"), keys.indexOf("ask") + 1, "after ask");
    assert.equal(keys.indexOf("wizard_scripts"), keys.indexOf("suggestions") + 1, "and before wizard_scripts");
    const layer = disclosed.suggestions;
    assert.deepEqual(layer, suggestionsLayer());
    assert.equal(layer.sourcing, "authored");
    assert.equal(SOURCING.suggestions, "authored");
    assert.equal(layer.load_when, SUGGESTIONS_LOAD_WHEN);
    assert.ok(resident.disclosable.some((d) => d.layer === "suggestions" && d.load_when === SUGGESTIONS_LOAD_WHEN));
  }
  const bySource = sections();
  for (const c of SUGGESTION_CLAUSES) {
    const where = bySource[c.source]?.[c.section];
    assert.ok(where && where.length > 0, `${c.section} of ${c.source} is where it was`);
    assert.ok(foundIn(where, c.text), `"${c.text}" is in ${c.section} of ${c.source}`);
  }
  const all = SUGGESTION_CLAUSES.map((c) => c.text).join(" ");
  for (const re of [/off by default/, /switched by each member for their own account/, /labelled/,
                    /only from material the member brought or chose/, /each adopted by the member's act/,
                    /loosening DEC-27 only there/])
    assert.match(all, re);
  /* DEC-27's limit is carried unconditionally: by the suggestions layer and by the ask layer, the same clause. */
  const dec27 = SUGGESTION_CLAUSES.find((c) => c.text === DEC27);
  assert.ok(dec27, "the suggestions layer carries DEC-27's limit");
  assert.ok(ASK_CLAUSES.includes(dec27), "and the ask layer the same clause");
  assert.ok(foundIn(bySource[ROLES_SOURCE]["§3"], DEC27));
  assert.ok(!foundIn(bySource[ROLES_SOURCE]["§3"], "The assistant may structure what the member SAID and more"));
});

test("R35 R22 this module reads no switch: the pack and its version are the same for every member, whatever a member's switch or the published answer says of one", () => {
  const base = renderPack(published());
  for (const over of [{ suggestions: true }, { viewer: "member:1", suggestions_switch: true }, { switches: { suggestions: false } }])
    assert.equal(JSON.stringify(renderPack(published(over))), JSON.stringify(base), JSON.stringify(over));
  assert.equal(suggestionsLayer.length, 0, "the layer takes no argument");
  assert.deepEqual(suggestionsLayer(), suggestionsLayer());
  assert.match(base.disclosed.suggestions.body.note, /this pack reads no switch/);
});

test("R34 R35 R16 R24 no string of the ask or suggestions layer, present or absent, carries control-flow authority, and none names a place (R26)", () => {
  for (const layer of [askLayer(published({ answer_checks: CHECKS })), askLayer(published()), suggestionsLayer()]) {
    for (const s of strings({ ...layer, body: { ...layer.body, checks: undefined } }))
      assert.deepEqual(controlFlowAuthority(s), [], s);
    const text = JSON.stringify(layer);
    for (const place of ["Oakland", "Alameda", "California", "Berkeley", "San Francisco"]) assert.ok(!text.includes(place));
  }
  assert.ok(controlFlowAuthority("Ask until you are satisfied.").length > 0, "the scan can fire");
});
