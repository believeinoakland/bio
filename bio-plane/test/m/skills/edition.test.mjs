import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPack, SOURCING } from "../../../src/skillpack.mjs";
import { editionStatementLayer, EDITION_STATEMENT_CLAUSES, EDITION_STATEMENT_ACTS, EDITION_STATEMENT_ACT,
         EDITION_STATEMENT_SECTION, PUBLICATION_SOURCE, controlFlowAuthority } from "../../../src/skilldoctrine.mjs";
import { SRC, read, foundIn, section, canonDocuments, published, stringLiterals } from "./fixture.mjs";

/* The acts R31 names, as `op=affordances` would publish them once case-authoring's proposal op lands (op-declarations'
   L11 job): the proposal open to a machine and the member's acts to a session, each an entry of the plane's shape. */
const PROPOSES = ["whatchangedpropose"];
const MEMBER = ["publish", "caseratify"];
const entry = (id, mode) => ({ id, label: `the ${id} act`, weight: null, needs: "contribute", mode, rung: null,
                               rung_absence: null, prompt: null });
const editionCatalog = (drop = []) => [...published().catalog,
  ...PROPOSES.map((id) => entry(id, "machine")), ...MEMBER.map((id) => entry(id, "session"))]
  .filter((a) => !drop.includes(a.id));
const LOAD_WHEN = "the run drafts a new edition's statement of what changed in it, and why";
/* R31's two clauses, as the requirement words them. */
const CLAUSES = [
  "The draft is not a diff: it is a detailed, high-level description of what changed and, as far as the system can "
  + "determine it, why (the motivation for the revision).",
  "The signed statement is the group's, adopted by a member, and the record keeps that it began as a machine draft.",
];

/* §5A of the Publication document. */
const s5A = () => section(read(PUBLICATION_SOURCE), "5A. ");
const strings = (v) => typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];

test("R31 R5 the edition_statement layer, in disclosed after filing_drafting: authored, its load_when R31's sentence, its body §5A's two clauses, each found in §5A by R21's normaliser", () => {
  const { disclosed, resident } = renderPack(published({ catalog: editionCatalog() }));
  const keys = Object.keys(disclosed);
  assert.equal(keys.indexOf("edition_statement"), keys.indexOf("filing_drafting") + 1, "after filing_drafting");
  assert.equal(keys.indexOf("wizard_authoring"), keys.indexOf("edition_statement") + 1, "and before wizard_authoring");
  const layer = disclosed.edition_statement;
  assert.equal(layer.sourcing, "authored");
  assert.equal(SOURCING.edition_statement, "authored");
  assert.equal(layer.load_when, LOAD_WHEN);
  assert.ok(resident.disclosable.some((d) => d.layer === "edition_statement" && d.load_when === LOAD_WHEN));
  assert.equal(layer.body.clauses, EDITION_STATEMENT_CLAUSES);
  assert.deepEqual(EDITION_STATEMENT_CLAUSES, CLAUSES, "exactly R31's two clauses, in §5A's order");
  assert.equal(layer.body.source, "docs/architecture/BIO_Publication_v0_1.md");
  assert.equal(layer.body.section, EDITION_STATEMENT_SECTION);
  assert.equal(EDITION_STATEMENT_SECTION, "§5A");
  assert.ok(canonDocuments().has(PUBLICATION_SOURCE), "the Publication document is canon");
  const s = s5A();
  assert.ok(s.length > 0, "§5A is where it was");
  for (const c of EDITION_STATEMENT_CLAUSES) assert.ok(foundIn(s, c), `"${c}" is in §5A`);
  assert.ok(s.indexOf("The draft is not a diff") < s.indexOf("The signed statement is the group's"), "in §5A's order");
  /* The lookup can miss: a changed word is not found, and neither is a §5A sentence looked for outside it. */
  assert.ok(!foundIn(s, "The draft is a diff: it is a detailed, high-level description of what changed."));
  assert.ok(!foundIn(section(read(PUBLICATION_SOURCE), "5B. "), CLAUSES[0]));
});

test("R31 acts: whatchangedpropose, and the member-only publish and caseratify, each the published catalogue's own entry read by id with the requirement that defines it; each id named once, as a selector (R23)", () => {
  const catalog = editionCatalog();
  const { acts } = renderPack(published({ catalog })).disclosed.edition_statement.body;
  const byId = new Map(catalog.map((a) => [a.id, a]));
  assert.deepEqual(acts.proposes.map((a) => a.id), PROPOSES);
  assert.deepEqual(acts.leaves_to_a_member.map((a) => a.id), MEMBER);
  for (const a of [...acts.proposes, ...acts.leaves_to_a_member])
    assert.equal(a.act, byId.get(a.id), `${a.id} is the catalogue's own entry, unchanged`);
  assert.deepEqual(acts.proposes.map((a) => a.defined_by), ["case-authoring R39"]);
  assert.deepEqual(acts.leaves_to_a_member.map((a) => a.defined_by), ["case-authoring R38", "ratification R2"]);
  assert.equal(acts.proposes[0].act.mode, "machine");
  for (const a of acts.leaves_to_a_member) assert.notEqual(a.act.mode, "machine", `${a.id} is left to a member`);
  /* The entries move with the catalogue, never with this module. */
  const relabelled = catalog.map((a) => (a.id === "caseratify" ? { ...a, label: "Ratify, relabelled" } : a));
  const got = editionStatementLayer(relabelled).body.acts.leaves_to_a_member.find((a) => a.id === "caseratify");
  assert.equal(got.act.label, "Ratify, relabelled");
  const lits = SRC.flatMap((f) => stringLiterals(read(f)));
  for (const id of [...PROPOSES, ...MEMBER]) assert.equal(lits.filter((l) => l === id).length, 1, `${id} is named once`);
  for (const id of [...PROPOSES, ...MEMBER]) assert.ok(!lits.includes(`the ${id} act`));
  assert.equal(EDITION_STATEMENT_ACT, "whatchangedpropose");
  assert.deepEqual([...EDITION_STATEMENT_ACTS.proposes, ...EDITION_STATEMENT_ACTS.leaves_to_a_member].map((a) => a.id),
    [...PROPOSES, ...MEMBER]);
});

test("R31 R1 with whatchangedpropose published, an act R31 names that the catalogue does not publish throws naming it, and nothing renders; without it, the member's acts missing is no refusal", () => {
  for (const id of MEMBER) {
    const pub = published({ catalog: editionCatalog([id]) });
    assert.throws(() => renderPack(pub), new RegExp(`edition statement layer names the act ${id} \\(`), id);
    assert.throws(() => editionStatementLayer(pub.catalog), new RegExp(`names the act ${id} `));
  }
  /* The controls: the full catalogue renders, and so does one holding neither the proposal nor the member's acts. */
  assert.ok(renderPack(published({ catalog: editionCatalog() })).version, "the full catalogue renders");
  for (const drop of [["whatchangedpropose", "publish"], ["whatchangedpropose", "caseratify"], [...PROPOSES, ...MEMBER]])
    assert.equal(renderPack(published({ catalog: editionCatalog(drop) })).disclosed.edition_statement.sourcing, "absent");
});

test("R31 R9 with no whatchangedpropose published, the layer is a stated absence in R9's form and the pack still renders; the version tells the two packs apart (R11)", () => {
  for (const catalog of [published().catalog, editionCatalog(["whatchangedpropose"]), undefined, null, "x"]) {
    const layer = editionStatementLayer(catalog);
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.equal(SOURCING.edition_statement_unpublished, "absent");
    assert.deepEqual(layer.body, {});
    assert.match(layer.absent_because, /whatchangedpropose/);
  }
  /* Today's catalogue (no whatchangedpropose until op-declarations' L11 job), and one holding the member's acts but not
     the proposal: both render, the layer absent. */
  for (const catalog of [published().catalog, editionCatalog(["whatchangedpropose"])]) {
    const { disclosed, resident, version } = renderPack(published({ catalog }));
    assert.equal(disclosed.edition_statement.sourcing, "absent");
    assert.ok(version);
    assert.ok(resident.disclosable.some((d) => d.layer === "edition_statement" && d.load_when === "never, in this edition"));
  }
  assert.notEqual(renderPack(published()).version, renderPack(published({ catalog: editionCatalog() })).version);
});

test("R31 R16 R24 no string of the layer, present or absent, carries control-flow authority, and none names a place (R26)", () => {
  for (const catalog of [editionCatalog(), published().catalog]) {
    const layer = editionStatementLayer(catalog);
    for (const s of strings({ ...layer, body: { ...layer.body, acts: undefined } }))
      assert.deepEqual(controlFlowAuthority(s), [], s);
    const text = JSON.stringify(layer);
    for (const place of ["Oakland", "Alameda", "California", "Berkeley", "San Francisco"]) assert.ok(!text.includes(place));
  }
  assert.ok(controlFlowAuthority("Keep searching until the statement reads well.").length > 0, "the scan can fire");
});
