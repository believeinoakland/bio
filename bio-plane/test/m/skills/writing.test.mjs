import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPack, SOURCING } from "../../../src/skillpack.mjs";
import { writingHelpLayer, suggestionsLayer, WRITING_HELP_CLAUSES, WRITING_HELP_ACTS, WRITING_HELP_ACT,
         INTERACTION_SOURCE, ROLES_SOURCE, PILOT_SOURCE, controlFlowAuthority } from "../../../src/skilldoctrine.mjs";
import { DRAFT_MODE } from "../../../src/run-rules/index.mjs";
import { SRC, read, foundIn, section, canonDocuments, published, stringLiterals } from "./fixture.mjs";

/* The acts R36 names, as `op=affordances` would publish them once their ops land (L11): the draft acts open to the
   assistant and the description's setting left to a member, each an entry of the plane's shape. */
const PROPOSES = ["writinghelp", "groupdescriptiondraft"];
const MEMBER = ["groupdescriptionset"];
const entry = (id, mode) => ({ id, label: `the ${id} act`, weight: null, needs: "contribute", mode, rung: null,
                               rung_absence: null, prompt: null });
const helpCatalog = (drop = []) => [...published().catalog,
  ...PROPOSES.map((id) => entry(id, "machine")), ...MEMBER.map((id) => entry(id, "admin-session"))]
  .filter((a) => !drop.includes(a.id));
const LOAD_WHEN = "the member asks for help writing in one of their own-words fields, or an administrator for help "
  + "with the group's description";

/* The canon sections the clauses are quoted from: the Interaction Constructs' §P (the "P · THE ASSISTANT" section,
   where DEC-153's paragraph sits), the Roles canon's §3 and the pilot's §3. */
const sections = () => ({
  [INTERACTION_SOURCE]: { "§P": section(read(INTERACTION_SOURCE), "P · THE ASSISTANT") },
  [ROLES_SOURCE]: { "§3": section(read(ROLES_SOURCE), "3. The rules") },
  [PILOT_SOURCE]: { "§3": section(read(PILOT_SOURCE), "3 · ") },
});
const strings = (v) => typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];

test("R36 R5 the writing_help layer, in disclosed after suggestions and before interface_translation (R39): authored, its load_when R36's sentence, its body the clauses of DEC-153 (Interaction Constructs §P), Roles §3 rules 1, 7, 9 and the pilot's §3, each found by R21's normaliser", () => {
  const { disclosed, resident } = renderPack(published({ catalog: helpCatalog() }));
  const keys = Object.keys(disclosed);
  assert.equal(keys.indexOf("writing_help"), keys.indexOf("suggestions") + 1, "after suggestions");
  assert.equal(keys.indexOf("interface_translation"), keys.indexOf("writing_help") + 1, "and before interface_translation (R39)");
  const layer = disclosed.writing_help;
  assert.equal(layer.sourcing, "authored");
  assert.equal(SOURCING.writing_help, "authored");
  assert.equal(layer.load_when, LOAD_WHEN);
  assert.ok(resident.disclosable.some((d) => d.layer === "writing_help" && d.load_when === LOAD_WHEN));
  assert.equal(layer.body.clauses, WRITING_HELP_CLAUSES);
  /* The mode is run-rules' draft mode (its R21), read from it; the source never types it (R23). */
  assert.equal(layer.body.mode, DRAFT_MODE.mode);
  assert.ok(!SRC.flatMap((f) => stringLiterals(read(f))).includes(DRAFT_MODE.mode), "the mode is not typed");
  for (const src of [INTERACTION_SOURCE, ROLES_SOURCE, PILOT_SOURCE]) assert.ok(canonDocuments().has(src), `${src} is canon`);
  const bySource = sections();
  for (const c of WRITING_HELP_CLAUSES) {
    assert.deepEqual(Object.keys(c).sort(), ["section", "source", "text"]);
    const where = bySource[c.source]?.[c.section];
    assert.ok(where && where.length > 0, `${c.section} of ${c.source} is where it was`);
    assert.ok(foundIn(where, c.text), `"${c.text}" is in ${c.section} of ${c.source}`);
  }
  /* The §P clauses are DEC-153's own paragraph, with K1841's fold. */
  const P = bySource[INTERACTION_SOURCE]["§P"];
  const para = P.slice(P.indexOf("**Help with writing"), P.indexOf("\n\n", P.indexOf("**Help with writing")));
  assert.match(para, /DEC-153/);
  for (const c of WRITING_HELP_CLAUSES.filter((x) => x.source === INTERACTION_SOURCE))
    assert.ok(foundIn(para, c.text), `in DEC-153's paragraph: ${c.text}`);
  /* What R36 names, (a)–(e). */
  const all = WRITING_HELP_CLAUSES.map((c) => c.text).join(" ");
  for (const re of [
    /it works only from what the member tells it and what the group holds/,                 // (a)
    /switch off it works only from what the member typed; with it on it may also draw on what the group holds/, // (a), K1841 (2)
    /never adds a fact/,                                                                    // (b)
    /for an observation it only helps word what the member saw/,                            // (c)
    /never in a field that states a member's reason for an act/,                            // (d), K1841 (1)
    /the machine never writes the member's reason/,                                         // (d), rule 1
    /labelled "Draft · the assistant's, asked by <handle>", saved only when the member keeps them/, // (e)
    /a draft becomes the member's words only by the member's own act of keeping or editing it/,      // (e), K1364
  ]) assert.match(all, re);
  /* The lookup can miss: a changed word is not found, and §P's paragraph is not the Roles canon's. */
  assert.ok(!foundIn(P, WRITING_HELP_CLAUSES[0].text.replace("never adds a fact", "may add a fact")));
  assert.ok(!foundIn(bySource[ROLES_SOURCE]["§3"], WRITING_HELP_CLAUSES[0].text));
});

test("R36 acts: writinghelp and groupdescriptiondraft, and the member-only groupdescriptionset, each the published catalogue's own entry read by id with the requirement that defines it; each id named once, as a selector (R23)", () => {
  const catalog = helpCatalog();
  const { acts } = renderPack(published({ catalog })).disclosed.writing_help.body;
  const byId = new Map(catalog.map((a) => [a.id, a]));
  assert.deepEqual(acts.proposes.map((a) => a.id), PROPOSES);
  assert.deepEqual(acts.leaves_to_a_member.map((a) => a.id), MEMBER);
  for (const a of [...acts.proposes, ...acts.leaves_to_a_member])
    assert.equal(a.act, byId.get(a.id), `${a.id} is the catalogue's own entry, unchanged`);
  assert.deepEqual(acts.proposes.map((a) => a.defined_by), ["wizard-scripts R27", "instance-setup R65"]);
  assert.deepEqual(acts.leaves_to_a_member.map((a) => a.defined_by), ["membership R109"]);
  const relabelled = catalog.map((a) => (a.id === "groupdescriptionset" ? { ...a, label: "Set, relabelled" } : a));
  assert.equal(writingHelpLayer(relabelled).body.acts.leaves_to_a_member[0].act.label, "Set, relabelled");
  const lits = SRC.flatMap((f) => stringLiterals(read(f)));
  for (const id of [...PROPOSES, ...MEMBER]) assert.equal(lits.filter((l) => l === id).length, 1, `${id} is named once`);
  for (const id of [...PROPOSES, ...MEMBER]) assert.ok(!lits.includes(`the ${id} act`));
  assert.equal(WRITING_HELP_ACT, "writinghelp");
  assert.deepEqual([...WRITING_HELP_ACTS.proposes, ...WRITING_HELP_ACTS.leaves_to_a_member].map((a) => a.id),
    [...PROPOSES, ...MEMBER]);
});

test("R36 R1 with writinghelp published, an act R36 names that the catalogue does not publish throws naming it, and nothing renders; without it, the others missing is no refusal", () => {
  for (const id of [...PROPOSES.slice(1), ...MEMBER]) {
    const pub = published({ catalog: helpCatalog([id]) });
    assert.throws(() => renderPack(pub), new RegExp(`writing help layer names the act ${id} \\(`), id);
    assert.throws(() => writingHelpLayer(pub.catalog), new RegExp(`names the act ${id} `));
  }
  assert.ok(renderPack(published({ catalog: helpCatalog() })).version, "the full catalogue renders");
  for (const drop of [["writinghelp", "groupdescriptionset"], [...PROPOSES, ...MEMBER]])
    assert.equal(renderPack(published({ catalog: helpCatalog(drop) })).disclosed.writing_help.sourcing, "absent");
});

test("R36 R9 with no writinghelp published, the layer is a stated absence in R9's form and the pack still renders; the version tells the two packs apart (R11)", () => {
  for (const catalog of [published().catalog, helpCatalog(["writinghelp"]), undefined, null, "x"]) {
    const layer = writingHelpLayer(catalog);
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.equal(SOURCING.writing_help_unpublished, "absent");
    assert.deepEqual(layer.body, {});
    assert.match(layer.absent_because, /writinghelp/);
  }
  const { disclosed, resident, version } = renderPack(published());
  assert.equal(disclosed.writing_help.sourcing, "absent");
  assert.ok(resident.disclosable.some((d) => d.layer === "writing_help" && d.load_when === "never, in this edition"));
  assert.notEqual(version, renderPack(published({ catalog: helpCatalog() })).version);
  /* The version moves when a clause's words move (R11): the pack digests the clauses it carries. */
  assert.ok(JSON.stringify(renderPack(published({ catalog: helpCatalog() }))).includes(WRITING_HELP_CLAUSES[1].text));
});

test("R36 R35 R22 this module reads no switch and no field: the layer and the pack are the same for every member and field; the suggestions switch governs writing help's reach in the suggestions layer's load_when", () => {
  const base = renderPack(published({ catalog: helpCatalog() }));
  for (const over of [{ suggestions: true }, { field: "reason" }, { firsthand: true }, { viewer: "member:1" }])
    assert.equal(JSON.stringify(renderPack(published({ catalog: helpCatalog(), ...over }))), JSON.stringify(base));
  assert.equal(writingHelpLayer.length, 1, "the layer takes the catalogue alone");
  assert.match(base.disclosed.writing_help.body.note, /reads no switch and no field/);
  assert.match(suggestionsLayer().load_when, /or the member asks for writing help with their own suggestions switch on$/);
});

test("R36 R16 R24 no string of the layer, present or absent, carries control-flow authority, and none names a place (R26)", () => {
  for (const catalog of [helpCatalog(), published().catalog]) {
    const layer = writingHelpLayer(catalog);
    for (const s of strings({ ...layer, body: { ...layer.body, acts: undefined } }))
      assert.deepEqual(controlFlowAuthority(s), [], s);
    const text = JSON.stringify(layer);
    for (const place of ["Oakland", "Alameda", "California", "Berkeley", "San Francisco"]) assert.ok(!text.includes(place));
  }
  assert.ok(controlFlowAuthority("Keep going until the draft reads well.").length > 0, "the scan can fire");
});
