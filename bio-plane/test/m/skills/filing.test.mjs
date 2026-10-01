import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPack, SOURCING } from "../../../src/skillpack.mjs";
import { filingDraftingLayer, FILING_RULES, FILING_TEMPLATE_ACTS, FILING_TEMPLATE_ACT, ACTION_RULES, ACTION_SOURCE,
         ACTION_SECTION, controlFlowAuthority } from "../../../src/skilldoctrine.mjs";
import { SRC, read, norm, foundIn, section, canonDocuments, published, stringLiterals } from "./fixture.mjs";

/* The acts R30 names, as `op=affordances` would publish them once filing-templates' ops land (L11): the proposal open
   to a machine and the member's acts to a session, each an entry of the plane's shape. */
const PROPOSES = ["templatepropose"];
const MEMBER = ["templatedraft", "templaterevise", "templatesubmit", "templatereview", "templateapprove"];
const entry = (id, mode) => ({ id, label: `the ${id} act`, weight: null, needs: "contribute", mode, rung: null,
                               rung_absence: null, prompt: null });
const filingCatalog = (drop = []) => [...published().catalog,
  ...PROPOSES.map((id) => entry(id, "machine")), ...MEMBER.map((id) => entry(id, "session"))]
  .filter((a) => !drop.includes(a.id));
const LOAD_WHEN = "the run proposes a filing template's wording, or critiques one in a comment";

/* §4 of the Action document, and each numbered rule's own paragraph within it. */
const s4 = () => section(read(ACTION_SOURCE), "4. The rules");
const ruleText = (n) => (s4().split("\n").find((l) => l.startsWith(`${n}. `)) ?? "");
const strings = (v) => typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];

test("R30 R5 the filing_drafting layer, in disclosed after action_planning: authored, its load_when R30's sentence, its body §4's rules 1, 7, 11 and 13, each heading and sentence found in that rule by R21's normaliser", () => {
  const { disclosed, resident } = renderPack(published({ catalog: filingCatalog() }));
  const keys = Object.keys(disclosed);
  assert.equal(keys.indexOf("filing_drafting"), keys.indexOf("action_planning") + 1, "after action_planning");
  const layer = disclosed.filing_drafting;
  assert.equal(layer.sourcing, "authored");
  assert.equal(SOURCING.filing_drafting, "authored");
  assert.equal(layer.load_when, LOAD_WHEN);
  assert.ok(resident.disclosable.some((d) => d.layer === "filing_drafting" && d.load_when === LOAD_WHEN));
  assert.equal(layer.body.rules, FILING_RULES);
  assert.equal(layer.body.source, "docs/architecture/BIO_Action_v0_1.md");
  assert.equal(layer.body.section, ACTION_SECTION);
  assert.ok(canonDocuments().has(ACTION_SOURCE), "the Action document is canon");
  assert.deepEqual(FILING_RULES.map((r) => r.rule), [1, 7, 11, 13], "exactly rules 1, 7, 11 and 13, in §4's order");
  for (const r of FILING_RULES) {
    const rule = ruleText(r.rule);
    assert.ok(rule.length > 0, `rule ${r.rule} is in §4`);
    assert.ok(norm(rule).startsWith(`${r.rule}. ${norm(r.heading)}`), `rule ${r.rule}'s heading is its own: ${r.heading}`);
    assert.ok(r.sentences.length > 0);
    for (const s of r.sentences) assert.ok(foundIn(rule, s), `rule ${r.rule}: "${s}" is in its paragraph`);
  }
  /* The clauses R30 names: the machine proposes and never acts; nothing leaves by a system path, a counsel packet never
     fileable as it stands; a missing fact reads undetermined; the venue sets the standard. */
  const all = FILING_RULES.flatMap((r) => r.sentences).join(" ");
  for (const re of [/never does any of these acts/, /The instance transmits nothing/, /never fileable as it stands/,
                    /a missing fact reads undetermined, never a default/, /No action is refused for its evidence grade/])
    assert.match(all, re);
  /* Rules 1 and 13 are the planning layer's own objects, never a second copy. */
  assert.equal(FILING_RULES[0], ACTION_RULES.find((r) => r.rule === 1));
  assert.equal(FILING_RULES[3], ACTION_RULES.find((r) => r.rule === 13));
  /* The lookup can miss: a changed word is not found. */
  assert.ok(!foundIn(ruleText(7), "The instance transmits everything."));
  /* Only canon sentences (K927): the draft's two non-canon clauses are not carried. */
  assert.ok(!/names blanks only|asserts a fact the record does not hold/.test(JSON.stringify(layer)));
});

test("R30 acts: templatepropose, and the member-only templatedraft, templaterevise, templatesubmit, templatereview, templateapprove, each the published catalogue's own entry read by id with the requirement that defines it; each id named once, as a selector (R23)", () => {
  const catalog = filingCatalog();
  const { acts } = renderPack(published({ catalog })).disclosed.filing_drafting.body;
  const byId = new Map(catalog.map((a) => [a.id, a]));
  assert.deepEqual(acts.proposes.map((a) => a.id), PROPOSES);
  assert.deepEqual(acts.leaves_to_a_member.map((a) => a.id), MEMBER);
  for (const a of [...acts.proposes, ...acts.leaves_to_a_member])
    assert.equal(a.act, byId.get(a.id), `${a.id} is the catalogue's own entry, unchanged`);
  assert.deepEqual(acts.proposes.map((a) => a.defined_by), ["filing-templates R6"]);
  assert.deepEqual(acts.leaves_to_a_member.map((a) => a.defined_by),
    ["filing-templates R3", "filing-templates R4", "filing-templates R7", "filing-templates R9", "filing-templates R10"]);
  assert.equal(acts.proposes[0].act.mode, "machine");
  for (const a of acts.leaves_to_a_member) assert.notEqual(a.act.mode, "machine", `${a.id} is left to a member`);
  /* The entries move with the catalogue, never with this module. */
  const relabelled = catalog.map((a) => (a.id === "templateapprove" ? { ...a, label: "Approve, relabelled" } : a));
  const got = filingDraftingLayer(relabelled).body.acts.leaves_to_a_member.find((a) => a.id === "templateapprove");
  assert.equal(got.act.label, "Approve, relabelled");
  const lits = SRC.flatMap((f) => stringLiterals(read(f)));
  for (const id of [...PROPOSES, ...MEMBER]) assert.equal(lits.filter((l) => l === id).length, 1, `${id} is named once`);
  assert.equal(FILING_TEMPLATE_ACT, "templatepropose");
  assert.deepEqual([...FILING_TEMPLATE_ACTS.proposes, ...FILING_TEMPLATE_ACTS.leaves_to_a_member].map((a) => a.id),
    [...PROPOSES, ...MEMBER]);
});

test("R30 R1 with templatepropose published, an act R30 names that the catalogue does not publish throws naming it, and nothing renders", () => {
  for (const id of MEMBER) {
    const pub = published({ catalog: filingCatalog([id]) });
    assert.throws(() => renderPack(pub), new RegExp(`names the act ${id} \\(`), id);
    assert.throws(() => filingDraftingLayer(pub.catalog), new RegExp(`names the act ${id} `));
  }
  assert.ok(renderPack(published({ catalog: filingCatalog() })).version, "the full catalogue renders");
});

test("R30 R9 with no templatepropose published, the layer is a stated absence in R9's form and the pack still renders; the version tells the two packs apart (R11)", () => {
  for (const catalog of [published().catalog, filingCatalog(["templatepropose"]), undefined, null, "x"]) {
    const layer = filingDraftingLayer(catalog);
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.equal(SOURCING.filing_drafting_unpublished, "absent");
    assert.deepEqual(layer.body, {});
    assert.match(layer.absent_because, /templatepropose/);
  }
  /* Today's catalogue, and one holding the member's acts but not the proposal: both render, the layer absent. */
  for (const catalog of [published().catalog, filingCatalog(["templatepropose"])]) {
    const { disclosed, resident, version } = renderPack(published({ catalog }));
    assert.equal(disclosed.filing_drafting.sourcing, "absent");
    assert.ok(version);
    assert.ok(resident.disclosable.some((d) => d.layer === "filing_drafting" && d.load_when === "never, in this edition"));
  }
  assert.notEqual(renderPack(published()).version, renderPack(published({ catalog: filingCatalog() })).version);
});

test("R30 R16 R24 no string of the layer, present or absent, carries control-flow authority, and none names a place (R26)", () => {
  for (const catalog of [filingCatalog(), published().catalog]) {
    const layer = filingDraftingLayer(catalog);
    for (const s of strings({ ...layer, body: { ...layer.body, acts: undefined } }))
      assert.deepEqual(controlFlowAuthority(s), [], s);
    const text = JSON.stringify(layer);
    for (const place of ["Oakland", "Alameda", "California", "Berkeley", "San Francisco"]) assert.ok(!text.includes(place));
  }
  assert.ok(controlFlowAuthority("Keep searching until the template reads well.").length > 0, "the scan can fire");
});
