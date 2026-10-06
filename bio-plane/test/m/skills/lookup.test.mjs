import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { renderPack, SOURCING } from "../../../src/skillpack.mjs";
import { legalLookupLayer, LEGAL_LOOKUP_CLAUSES, LEGAL_LOOKUP_ACTS, LEGAL_LOOKUP_ACT, LEGAL_LOOKUP_MODE,
         LADDERS_SOURCE, PLANNING_ACTS, controlFlowAuthority } from "../../../src/skilldoctrine.mjs";
import { DEPLOYMENT_SEQUENCE, DEPLOYED_MODES } from "../../../src/run-rules/index.mjs";
import { ROOT, SRC, read, foundIn, section, canonDocuments, published, stringLiterals } from "./fixture.mjs";

/* The acts R33 names, as `op=affordances` would publish them: the standard proposal open to a machine, the capture
   request, and the adoption left to a member, each an entry of the plane's shape. */
const PROPOSES = ["standardpropose"];
const REQUESTS = ["capturerequest"];
const MEMBER = ["standardadopt"];
const entry = (id, mode) => ({ id, label: `the ${id} act`, weight: null, needs: "contribute", mode, rung: null,
                               rung_absence: null, prompt: null });
const lookupCatalog = (drop = []) => [...published().catalog, ...PROPOSES.map((id) => entry(id, "machine")),
  ...REQUESTS.map((id) => entry(id, "session")), ...MEMBER.map((id) => entry(id, "session"))]
  .filter((a) => !drop.includes(a.id));
const LOAD_WHEN = "the run looks for the law that governs a question, a body or a request";

/* The ladders' sections the clauses are quoted from. */
const sections = () => {
  const text = read(LADDERS_SOURCE);
  return { "§6.4": section(text, "6.4 "), "§10": section(text, "10. Doctrine") };
};
const strings = (v) => typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];

/* The pack rendered in a child whose run-rules deploys the mode R33 names, as the reviewed change that verifies it
   would (run-rules R9): every other export is run-rules' own. */
function renderWithModeDeployed() {
  const file = join(ROOT, "bio-plane/src/run-rules/index.mjs");
  const script = `
    import { mock } from "node:test";
    const real = { ...(await import(${JSON.stringify(file + "?real")})) };
    const next = real.DEPLOYMENT_SEQUENCE.order[real.DEPLOYMENT_SEQUENCE.order.indexOf(real.DEPLOYMENT_SEQUENCE.first_deployed_mode) + 1];
    mock.module(${JSON.stringify("file://" + file)}, { namedExports: { ...real, DEPLOYED_MODES: [...real.DEPLOYED_MODES, next] } });
    const { renderPack } = await import(${JSON.stringify("file://" + join(ROOT, "bio-plane/src/skillpack.mjs"))});
    const { published } = await import(${JSON.stringify("file://" + join(ROOT, "bio-plane/test/m/skills/fixture.mjs"))});
    const catalog = [...published().catalog, ...${JSON.stringify(lookupCatalog().slice(published().catalog.length))}];
    console.log("RENDERED " + JSON.stringify(renderPack(published({ catalog })).disclosed.legal_lookup));`;
  const out = execFileSync(process.execPath, ["--experimental-test-module-mocks", "--no-warnings",
    "--input-type=module", "-e", script], { encoding: "utf8" });
  return JSON.parse(/^RENDERED (.*)$/m.exec(out)[1]);
}

test("R33 R5 the legal_lookup layer, in disclosed after wizard_authoring: authored, its load_when R33's sentence, its body §6.4's skill text quoted whole, the AI's part, and §10's closed book, each found by R21's normaliser", () => {
  const { disclosed, resident } = renderPack(published({ catalog: lookupCatalog() }));
  const keys = Object.keys(disclosed);
  assert.equal(keys.indexOf("legal_lookup"), keys.indexOf("wizard_authoring") + 1, "after wizard_authoring");
  const layer = disclosed.legal_lookup;
  assert.equal(layer.sourcing, "authored");
  assert.equal(SOURCING.legal_lookup, "authored");
  assert.ok(layer.load_when.startsWith(LOAD_WHEN), layer.load_when);
  assert.ok(resident.disclosable.some((d) => d.layer === "legal_lookup" && d.load_when === layer.load_when));
  assert.equal(layer.body.clauses, LEGAL_LOOKUP_CLAUSES);
  assert.equal(LADDERS_SOURCE, "docs/architecture/BIO_Capability_Ladders_v0_1.md");
  assert.ok(canonDocuments().has(LADDERS_SOURCE), "the ladders are canon");
  const bySection = sections();
  assert.ok(bySection["§6.4"].length > 0 && bySection["§10"].length > 0, "§6.4 and §10 are where they were");
  for (const c of LEGAL_LOOKUP_CLAUSES) {
    assert.deepEqual(Object.keys(c).sort(), ["section", "source", "text"]);
    assert.equal(c.source, LADDERS_SOURCE);
    assert.ok(foundIn(bySection[c.section], c.text), `"${c.text}" is in ${c.section}`);
  }
  /* §6.4's sentence is a list, quoted whole: the four levels, captures of what is missing, standards proposed with
     captured text (no adoption without it), and what could not be mechanised published beside what was (DEC-54). */
  const skill = LEGAL_LOOKUP_CLAUSES.find((c) => /legal_lookup` skill text/.test(c.text)).text;
  for (const re of [/^The `legal_lookup` skill text: /, /search the four levels/, /request captures of what is missing/,
                    /propose standards with captured text/, /a proposal without it cannot be adopted/,
                    /publish what it could not mechanise beside what it did \(DEC-54\)\.$/])
    assert.match(skill, re);
  /* §10's closed-book row: no rule from the model's own knowledge. */
  assert.ok(LEGAL_LOOKUP_CLAUSES.some((c) => c.section === "§10" && /^No fact and no rule from the model's knowledge/.test(c.text)));
  /* The lookup can miss: a changed word is not found, and §6.4's sentence is not §10's. */
  assert.ok(!foundIn(bySection["§6.4"], skill.replace("captured text", "any text")));
  assert.ok(!foundIn(bySection["§10"], skill));
});

test("R33 R18 deployable only in the mode after check (investigate, read from run-rules' order), with a member's account: until it is deployed the load_when says so; deployed, it is R33's sentence alone", () => {
  assert.equal(LEGAL_LOOKUP_MODE, DEPLOYMENT_SEQUENCE.order[1]);
  assert.equal(LEGAL_LOOKUP_MODE, "investigate");
  const layer = legalLookupLayer(lookupCatalog());
  assert.equal(layer.body.deployable_in, LEGAL_LOOKUP_MODE);
  assert.ok(!DEPLOYED_MODES.includes(LEGAL_LOOKUP_MODE), "investigate is not deployed today (run-rules R9)");
  assert.equal(layer.load_when, `${LOAD_WHEN}; it is deployable only in the investigate mode with a member's account, `
    + "and the investigate mode is not deployed in this edition");
  const deployed = renderWithModeDeployed();
  assert.equal(deployed.load_when, LOAD_WHEN, "once investigate is deployed, R33's sentence alone");
  assert.equal(deployed.sourcing, "authored");
  /* The mode is never typed: it is read from run-rules' order. */
  assert.ok(!SRC.flatMap((f) => stringLiterals(read(f))).includes("investigate"));
});

test("R33 acts: standardpropose, capturerequest and the member-only standardadopt, each the published catalogue's own entry read by id with the requirement that defines it; each id named once, as a selector shared with R28 (R23)", () => {
  const catalog = lookupCatalog();
  const { acts } = renderPack(published({ catalog })).disclosed.legal_lookup.body;
  const byId = new Map(catalog.map((a) => [a.id, a]));
  assert.deepEqual(acts.proposes.map((a) => a.id), PROPOSES);
  assert.deepEqual(acts.requests.map((a) => a.id), REQUESTS);
  assert.deepEqual(acts.leaves_to_a_member.map((a) => a.id), MEMBER);
  for (const a of [...acts.proposes, ...acts.requests, ...acts.leaves_to_a_member])
    assert.equal(a.act, byId.get(a.id), `${a.id} is the catalogue's own entry, unchanged`);
  assert.deepEqual([...acts.proposes, ...acts.requests, ...acts.leaves_to_a_member].map((a) => a.defined_by),
    ["standards R9", "capture-requests R30", "standards R10"]);
  /* R28's own selectors, the same objects, so each id stays one literal. */
  assert.ok(PLANNING_ACTS.proposes.includes(LEGAL_LOOKUP_ACTS.proposes[0]));
  assert.ok(PLANNING_ACTS.leaves_to_a_member.includes(LEGAL_LOOKUP_ACTS.leaves_to_a_member[0]));
  const relabelled = catalog.map((a) => (a.id === "standardadopt" ? { ...a, label: "Adopt, relabelled" } : a));
  assert.equal(legalLookupLayer(relabelled).body.acts.leaves_to_a_member[0].act.label, "Adopt, relabelled");
  const lits = SRC.flatMap((f) => stringLiterals(read(f)));
  for (const id of [...PROPOSES, ...REQUESTS, ...MEMBER]) assert.equal(lits.filter((l) => l === id).length, 1, `${id} is named once`);
  assert.equal(LEGAL_LOOKUP_ACT, "standardpropose");
});

test("R33 R1 with standardpropose published, an act R33 names that the catalogue does not publish throws naming it, and nothing renders", () => {
  for (const id of [...REQUESTS, ...MEMBER]) {
    const pub = published({ catalog: lookupCatalog([id]) });
    assert.throws(() => renderPack(pub), new RegExp(`legal lookup layer names the act ${id} \\(`), id);
    assert.throws(() => legalLookupLayer(pub.catalog), new RegExp(`names the act ${id} `));
  }
  assert.ok(renderPack(published({ catalog: lookupCatalog() })).version, "the full catalogue renders");
});

test("R33 R9 with no standardpropose published, the layer is a stated absence in R9's form and the pack still renders; the version tells the two packs apart (R11)", () => {
  for (const catalog of [published().catalog, lookupCatalog(["standardpropose"]), undefined, null, "x"]) {
    const layer = legalLookupLayer(catalog);
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.equal(SOURCING.legal_lookup_unpublished, "absent");
    assert.deepEqual(layer.body, {});
    assert.match(layer.absent_because, /standardpropose/);
  }
  const { disclosed, resident, version } = renderPack(published());
  assert.equal(disclosed.legal_lookup.sourcing, "absent");
  assert.ok(version);
  assert.ok(resident.disclosable.some((d) => d.layer === "legal_lookup" && d.load_when === "never, in this edition"));
  assert.notEqual(version, renderPack(published({ catalog: lookupCatalog() })).version);
});

test("R33 R16 R24 no string of the layer, present or absent, carries control-flow authority, and none names a place (R26)", () => {
  for (const catalog of [lookupCatalog(), published().catalog]) {
    const layer = legalLookupLayer(catalog);
    for (const s of strings({ ...layer, body: { ...layer.body, acts: undefined } }))
      assert.deepEqual(controlFlowAuthority(s), [], s);
    const text = JSON.stringify(layer);
    for (const place of ["Oakland", "Alameda", "California", "Berkeley", "San Francisco"]) assert.ok(!text.includes(place));
  }
  assert.deepEqual(controlFlowAuthority(renderWithModeDeployed().load_when), []);
  assert.ok(controlFlowAuthority("Keep searching until the law is found.").length > 0, "the scan can fire");
});
