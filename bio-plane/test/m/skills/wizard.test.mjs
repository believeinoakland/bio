import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPack, SOURCING } from "../../../src/skillpack.mjs";
import { wizardAuthoringLayer, WIZARD_AUTHORING_CLAUSES, WIZARD_AUTHORING_ACTS, WIZARD_AUTHORING_ACT,
         INTERACTION_SOURCE, PILOT_SOURCE, WIZARD_RULING_SECTION, PILOT_WIZARD_SECTION,
         controlFlowAuthority } from "../../../src/skilldoctrine.mjs";
import { SRC, read, foundIn, section, canonDocuments, published, stringLiterals } from "./fixture.mjs";

/* The acts R32 names, as `op=affordances` would publish them once wizard-scripts' ops land (op-declarations' L11 job):
   the proposal open to a machine and the member's acts to a session, each an entry of the plane's shape. */
const PROPOSES = ["wizardpropose"];
const MEMBER = ["wizarddraft", "wizardrevise", "wizardsubmit", "wizardapprove"];
const entry = (id, mode) => ({ id, label: `the ${id} act`, weight: null, needs: "contribute", mode, rung: null,
                               rung_absence: null, prompt: null });
const wizardCatalog = (drop = []) => [...published().catalog,
  ...PROPOSES.map((id) => entry(id, "machine")), ...MEMBER.map((id) => entry(id, "session"))]
  .filter((a) => !drop.includes(a.id));
const LOAD_WHEN = "the run drafts a wizard script, or critiques one recorded by a member";

/* §P of the Interaction Constructs (DEC-121's ruling within it) and §3 of the assistant pilot, as amended. */
const sP = () => section(read(INTERACTION_SOURCE), "P · THE ASSISTANT");
const s3 = () => section(read(PILOT_SOURCE), "3 · ");
const strings = (v) => typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];

test("R32 R5 the wizard_authoring layer, in disclosed after edition_statement and before wizard_scripts: authored, its load_when R32's sentence, its body the checks' sentence of §P (DEC-121) and §3's no-say, no-submit clauses, each found by R21's normaliser", () => {
  const { disclosed, resident } = renderPack(published({ catalog: wizardCatalog() }));
  const keys = Object.keys(disclosed);
  assert.equal(keys.indexOf("wizard_authoring"), keys.indexOf("edition_statement") + 1, "after edition_statement");
  assert.equal(keys.indexOf("wizard_scripts"), keys.indexOf("wizard_authoring") + 1, "and before wizard_scripts");
  const layer = disclosed.wizard_authoring;
  assert.equal(layer.sourcing, "authored");
  assert.equal(SOURCING.wizard_authoring, "authored");
  assert.equal(layer.load_when, LOAD_WHEN);
  assert.ok(resident.disclosable.some((d) => d.layer === "wizard_authoring" && d.load_when === LOAD_WHEN));
  assert.equal(layer.body.clauses, WIZARD_AUTHORING_CLAUSES);
  assert.equal(INTERACTION_SOURCE, "docs/architecture/BIO_Interaction_Constructs_v0_1.md");
  assert.equal(PILOT_SOURCE, "docs/development/ASSISTANT-PILOT.md");
  assert.deepEqual([WIZARD_RULING_SECTION, PILOT_WIZARD_SECTION], ["§P", "§3"]);
  for (const src of [INTERACTION_SOURCE, PILOT_SOURCE]) assert.ok(canonDocuments().has(src), `${src} is canon`);
  const P = sP(), three = s3();
  assert.ok(P.length > 0 && three.length > 0, "§P and §3 are where they were");
  const bySection = { "§P": P, "§3": three };
  for (const c of WIZARD_AUTHORING_CLAUSES) {
    assert.deepEqual(Object.keys(c).sort(), ["section", "source", "text"]);
    assert.ok([INTERACTION_SOURCE, PILOT_SOURCE].includes(c.source));
    assert.equal(c.source === INTERACTION_SOURCE ? "§P" : "§3", c.section);
    assert.ok(foundIn(bySection[c.section], c.text), `"${c.text}" is in ${c.section} of ${c.source}`);
  }
  /* §P's sentence is DEC-121's ruling's own. */
  const ruling = P.slice(P.indexOf("RULED 2026-10-03 by Bob (DEC-121)"));
  assert.ok(ruling.length < P.length, "DEC-121's ruling is in §P");
  assert.ok(foundIn(ruling.slice(0, ruling.indexOf("\n\n")), WIZARD_AUTHORING_CLAUSES[0].text), "in DEC-121's ruling");
  /* The clauses R32 names: the checks (screens or acts that do not exist, a step's why, what to conclude); a script
     never says or submits anything for a member, a draft the member's only by the member's own act; no step submits,
     signs or files. */
  const all = WIZARD_AUTHORING_CLAUSES.map((c) => c.text).join(" ");
  for (const re of [/naming screens or acts that do not exist/, /lacking a step's "why"/, /telling a member what to conclude/,
                    /A script never says or submits anything for a member/,
                    /only by the member's own act of keeping or editing it/, /No step submits, signs or files/])
    assert.match(all, re);
  /* Whether the words tell a member what to conclude is judged by the critique and the approving member, not by code. */
  assert.match(layer.body.judged_not_coded, /judged by this critique and by the approving member, not by code/);
  /* The lookup can miss: a changed word is not found, and neither is §P's sentence looked for in §3. */
  assert.ok(!foundIn(P, "Checks refuse a script naming screens or acts that do exist."));
  assert.ok(!foundIn(three, WIZARD_AUTHORING_CLAUSES[0].text));
  assert.ok(!/recipe/i.test(JSON.stringify(layer)), "DEC-120 retires the word");
});

test("R32 acts: wizardpropose, and the member-only wizarddraft, wizardrevise, wizardsubmit, wizardapprove, each the published catalogue's own entry read by id with the requirement that defines it; each id named once, as a selector (R23)", () => {
  const catalog = wizardCatalog();
  const { acts } = renderPack(published({ catalog })).disclosed.wizard_authoring.body;
  const byId = new Map(catalog.map((a) => [a.id, a]));
  assert.deepEqual(acts.proposes.map((a) => a.id), PROPOSES);
  assert.deepEqual(acts.leaves_to_a_member.map((a) => a.id), MEMBER);
  for (const a of [...acts.proposes, ...acts.leaves_to_a_member])
    assert.equal(a.act, byId.get(a.id), `${a.id} is the catalogue's own entry, unchanged`);
  assert.deepEqual(acts.proposes.map((a) => a.defined_by), ["wizard-scripts R5"]);
  assert.deepEqual(acts.leaves_to_a_member.map((a) => a.defined_by),
    ["wizard-scripts R3", "wizard-scripts R4", "wizard-scripts R6", "wizard-scripts R7"]);
  assert.equal(acts.proposes[0].act.mode, "machine");
  for (const a of acts.leaves_to_a_member) assert.notEqual(a.act.mode, "machine", `${a.id} is left to a member`);
  /* The entries move with the catalogue, never with this module. */
  const relabelled = catalog.map((a) => (a.id === "wizardapprove" ? { ...a, label: "Approve, relabelled" } : a));
  const got = wizardAuthoringLayer(relabelled).body.acts.leaves_to_a_member.find((a) => a.id === "wizardapprove");
  assert.equal(got.act.label, "Approve, relabelled");
  const lits = SRC.flatMap((f) => stringLiterals(read(f)));
  for (const id of [...PROPOSES, ...MEMBER]) assert.equal(lits.filter((l) => l === id).length, 1, `${id} is named once`);
  for (const id of [...PROPOSES, ...MEMBER]) assert.ok(!lits.includes(`the ${id} act`));
  assert.equal(WIZARD_AUTHORING_ACT, "wizardpropose");
  assert.deepEqual([...WIZARD_AUTHORING_ACTS.proposes, ...WIZARD_AUTHORING_ACTS.leaves_to_a_member].map((a) => a.id),
    [...PROPOSES, ...MEMBER]);
});

test("R32 R1 with wizardpropose published, an act R32 names that the catalogue does not publish throws naming it, and nothing renders; without it, the member's acts missing is no refusal", () => {
  for (const id of MEMBER) {
    const pub = published({ catalog: wizardCatalog([id]) });
    assert.throws(() => renderPack(pub), new RegExp(`wizard authoring layer names the act ${id} \\(`), id);
    assert.throws(() => wizardAuthoringLayer(pub.catalog), new RegExp(`names the act ${id} `));
  }
  assert.ok(renderPack(published({ catalog: wizardCatalog() })).version, "the full catalogue renders");
  for (const drop of [["wizardpropose", "wizarddraft"], ["wizardpropose", "wizardapprove"], [...PROPOSES, ...MEMBER]])
    assert.equal(renderPack(published({ catalog: wizardCatalog(drop) })).disclosed.wizard_authoring.sourcing, "absent");
});

test("R32 R9 with no wizardpropose published, the layer is a stated absence in R9's form and the pack still renders; the version tells the two packs apart (R11)", () => {
  for (const catalog of [published().catalog, wizardCatalog(["wizardpropose"]), undefined, null, "x"]) {
    const layer = wizardAuthoringLayer(catalog);
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.equal(SOURCING.wizard_authoring_unpublished, "absent");
    assert.deepEqual(layer.body, {});
    assert.match(layer.absent_because, /wizardpropose/);
  }
  for (const catalog of [published().catalog, wizardCatalog(["wizardpropose"])]) {
    const { disclosed, resident, version } = renderPack(published({ catalog }));
    assert.equal(disclosed.wizard_authoring.sourcing, "absent");
    assert.ok(version);
    assert.ok(resident.disclosable.some((d) => d.layer === "wizard_authoring" && d.load_when === "never, in this edition"));
  }
  assert.notEqual(renderPack(published()).version, renderPack(published({ catalog: wizardCatalog() })).version);
});

test("R32 R16 R24 no string of the layer, present or absent, carries control-flow authority, and none names a place (R26)", () => {
  for (const catalog of [wizardCatalog(), published().catalog]) {
    const layer = wizardAuthoringLayer(catalog);
    for (const s of strings({ ...layer, body: { ...layer.body, acts: undefined } }))
      assert.deepEqual(controlFlowAuthority(s), [], s);
    const text = JSON.stringify(layer);
    for (const place of ["Oakland", "Alameda", "California", "Berkeley", "San Francisco"]) assert.ok(!text.includes(place));
  }
  assert.ok(controlFlowAuthority("Keep searching until the script reads well.").length > 0, "the scan can fire");
});
