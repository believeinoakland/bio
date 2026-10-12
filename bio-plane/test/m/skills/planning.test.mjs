import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPack, packVersion } from "../../../src/skillpack.mjs";
import { actionPlanningLayer, ACTION_RULES, ACTION_RULE_TABLE, ACTION_SOURCE, ACTION_SECTION, PLANNING_ACTS, PLANNING_ACT,
         PLANNING_INPUTS, controlFlowAuthority } from "../../../src/skilldoctrine.mjs";
import { SRC, read, norm, foundIn, section, canonDocuments, published, stringLiterals } from "./fixture.mjs";

/* The acts R28 names, as `op=affordances` would publish them once their modules land: each a catalogue entry of
   the plane's shape, the proposals open to a machine and the member's acts to a session. */
const PROPOSES = ["optionpropose", "standardpropose", "comparisonpropose", "theorypropose", "communicationprepare"];
const MEMBER = ["optionadopt", "standardadopt", "determine", "filingapprove", "filingsent"];
const entry = (id, mode) => ({ id, label: `the ${id} act`, weight: null, needs: "contribute", mode, rung: null,
                               rung_absence: null, prompt: null });
/* `capturerequest` too: with `standardpropose` published the legal_lookup layer renders, and reads it (R33). */
const planningCatalog = (drop = []) => [...published().catalog,
  ...PROPOSES.map((id) => entry(id, "machine")), ...MEMBER.map((id) => entry(id, "session")),
  entry("capturerequest", "session")].filter((a) => !drop.includes(a.id));
const LOAD_WHEN = "the run proposes plan options, standards, comparisons, candidate theories or communication "
  + "drafts for an action or a plan";

/* §4 of the Action document, and each numbered rule's own paragraph within it. */
const s4 = () => section(read(ACTION_SOURCE), "4. The rules");
const ruleText = (n) => (s4().split("\n").find((l) => l.startsWith(`${n}. `)) ?? "");
const strings = (v) => typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];

test("R28 the action_planning layer: authored, its load_when R28's sentence with the re-examination, its body BIO_Action_v0_2.md §4 rules 1, 2, 4, 7, 9, 10, 12, 13, 16, 19 and 21 (canon; v0.1 is history), each heading and sentence found in that rule by R21's normaliser", () => {
  const catalog = planningCatalog();
  const layer = renderPack(published({ catalog })).disclosed.action_planning;
  assert.equal(layer.sourcing, "authored");
  assert.ok(layer.load_when.startsWith(LOAD_WHEN), layer.load_when);
  assert.match(layer.load_when, /, or re-examines a plan after a recorded response$/, "R28 (T45): the re-examination");
  assert.equal(layer.body.rules, ACTION_RULES, "the doctrine's own rules, unchanged");
  assert.equal(layer.body.source, "docs/architecture/BIO_Action_v0_2.md");
  assert.equal(ACTION_SOURCE, "docs/architecture/BIO_Action_v0_2.md");
  assert.equal(layer.body.section, ACTION_SECTION);
  assert.ok(canonDocuments().has(ACTION_SOURCE), "the Action document is canon");
  assert.ok(!canonDocuments().has("docs/architecture/BIO_Action_v0_1.md"), "v0.1 is history, not canon (K2780)");
  assert.ok(s4().length > 0, "§4 is where it was");
  assert.deepEqual(ACTION_RULES.map((r) => r.rule), [1, 2, 4, 7, 9, 10, 12, 13, 16, 19, 21],
    "exactly R28's rules, in §4's order");
  for (const r of ACTION_RULES) {
    const rule = ruleText(r.rule);
    assert.ok(rule.length > 0, `rule ${r.rule} is in §4`);
    assert.ok(norm(rule).startsWith(`${r.rule}. ${norm(r.heading)}`), `rule ${r.rule}'s heading is its own: ${r.heading}`);
    assert.ok(r.sentences.length > 0);
    for (const s of r.sentences) assert.ok(foundIn(rule, s), `rule ${r.rule}: "${s}" is in its paragraph`);
    assert.ok(Object.isFrozen(r) && Object.isFrozen(r.sentences), `rule ${r.rule} is frozen`);
    assert.equal(r, ACTION_RULE_TABLE.find((x) => x.rule === r.rule), `rule ${r.rule} is the table's own object`);
  }
  /* What R28 names, rule by rule (T45; v0.2 §4). */
  const of = (n) => ACTION_RULES.find((r) => r.rule === n).sentences.join(" ");
  for (const [n, re] of [
    [1, /never does any of these acts/],
    [2, /The gate is at the outward act/], [2, /Sentences that read as assertions are pointed out before approval/],
    [4, /lists every option it proposes, with no cut-off/], [4, /No field holds significance, severity, priority or a score/],
    [4, /never from a fixed catalogue/],
    [7, /never a private individual/],
    [9, /never take or propose a policy or vote position, and the planning run never suggests advocacy/],
    [9, /lobbying is an option only for that/],
    [10, /shapes what the assistant suggests and nothing else/],
    [12, /every plan is checked for a branch that answers a hostile response/],
    [12, /A packet never says "you have a claim" nor whether a protection applies/],
    [13, /No action is refused for its evidence grade/],
    [16, /What the group chose changes only by a member's act/],
    [19, /the first option the plan offers is to describe and document it/], [19, /the plan never withdraws it/],
    [21, /nothing is prepared that asks anything for the benefit of the group or its members/],
    [21, /names the office and the official responsible in that role/],
  ]) assert.match(n === 2 ? ACTION_RULES[1].heading + " " + of(2) : of(n), re, `rule ${n}: ${re}`);
  /* No place is named in what the layer carries (R26): rule 3's example sentences, which name one, are not carried. */
  for (const place of ["Hayward", "Oakland", "Alameda", "California"]) assert.ok(!JSON.stringify(layer).includes(place), place);
  /* The lookup can miss: a changed word is not found, and v0.1's wording is not v0.2's. */
  assert.ok(!foundIn(ruleText(4), "No field holds significance, severity, priority or a rank."));
  assert.ok(!foundIn(ruleText(1), "assessing a consequence, choosing an option, approving, sending, advancing a stage, resolving, closing."),
    "v0.1's rule 1 is not v0.2's");
});

test("R28 acts: each proposal act and each act left to a member is the published catalogue's own entry, read by id with the requirement that defines it; the ids are named once, as selectors", () => {
  const catalog = planningCatalog();
  const { acts } = renderPack(published({ catalog })).disclosed.action_planning.body;
  const byId = new Map(catalog.map((a) => [a.id, a]));
  assert.deepEqual(acts.proposes.map((a) => a.id), PROPOSES);
  assert.deepEqual(acts.leaves_to_a_member.map((a) => a.id), MEMBER);
  for (const a of [...acts.proposes, ...acts.leaves_to_a_member]) {
    assert.equal(a.act, byId.get(a.id), `${a.id} is the catalogue's own entry, unchanged`);
    assert.match(a.defined_by, /^[a-z-]+ R\d+$/, `${a.id} names the requirement that defines it`);
  }
  assert.deepEqual(acts.proposes.map((a) => a.defined_by),
    ["action-plans R11", "standards R9", "conformance R12", "filings R14", "filings R23"]);
  assert.deepEqual(acts.leaves_to_a_member.map((a) => a.defined_by),
    ["action-plans R11", "standards R10", "conformance R12", "filings R6", "filings R7"]);
  /* The entries move with the catalogue, never with this module: a relabelled act arrives relabelled. */
  const relabelled = catalog.map((a) => (a.id === "determine" ? { ...a, label: "Determine, relabelled" } : a));
  const got = actionPlanningLayer(relabelled).body.acts.leaves_to_a_member.find((a) => a.id === "determine");
  assert.equal(got.act.label, "Determine, relabelled");
  /* R23: each id appears in the module's source once, as a selector, and nothing else of an act is typed. */
  const lits = SRC.flatMap((f) => stringLiterals(read(f)));
  for (const id of [...PROPOSES, ...MEMBER]) assert.equal(lits.filter((l) => l === id).length, 1, `${id} is named once`);
  for (const id of [...PROPOSES, ...MEMBER]) assert.ok(!lits.includes(`the ${id} act`));
  assert.equal(PLANNING_ACT, "optionpropose");
  assert.deepEqual([...PLANNING_ACTS.proposes, ...PLANNING_ACTS.leaves_to_a_member].map((a) => a.id), [...PROPOSES, ...MEMBER]);
});

test("R28 R1 with the planning act published, an act R28 names that the catalogue does not publish throws naming it, and nothing renders", () => {
  for (const id of [...PROPOSES.slice(1), ...MEMBER]) {
    const pub = published({ catalog: planningCatalog([id]) });
    assert.throws(() => renderPack(pub), new RegExp(`names the act ${id} \\(`), id);
    assert.throws(() => actionPlanningLayer(pub.catalog), new RegExp(`names the act ${id} `));
  }
  assert.ok(renderPack(published({ catalog: planningCatalog() })).version, "the full catalogue renders");
});

test("R28 R16 R24 no string of the layer, present or absent, carries control-flow authority, and none names a place (R26)", () => {
  for (const catalog of [planningCatalog(), published().catalog]) {
    const layer = actionPlanningLayer(catalog);
    for (const s of strings({ ...layer, body: { ...layer.body, acts: undefined } }))
      assert.deepEqual(controlFlowAuthority(s), [], s);
    const text = JSON.stringify(layer);
    for (const place of ["Oakland", "Alameda", "California", "Berkeley", "San Francisco"]) assert.ok(!text.includes(place));
  }
  assert.ok(controlFlowAuthority("Keep searching until every plan has a branch.").length > 0, "the scan can fire");
});

test("R29 the layer names the plan mode in its load_when; with no optionpropose published it is a stated absence in R9's form; v0.2 rule 12's clause is carried, found in §4", () => {
  const present = renderPack(published({ catalog: planningCatalog() })).disclosed.action_planning;
  assert.match(present.load_when, /\bplan mode\b/);
  /* The absence: today's catalogue publishes no planning act, and neither does one that drops only it. */
  for (const catalog of [published().catalog, planningCatalog(["optionpropose"]), undefined, null, "x"]) {
    const layer = actionPlanningLayer(catalog);
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.deepEqual(layer.body, {});
    assert.match(layer.absent_because, /optionpropose/);
    assert.match(layer.absent_because, /plan mode/);
  }
  const { disclosed, resident } = renderPack(published());
  assert.equal(disclosed.action_planning.sourcing, "absent", "the pack still renders, the layer absent");
  assert.ok(resident.disclosable.some((d) => d.layer === "action_planning" && d.load_when === "never, in this edition"));
  /* The version tells the two packs apart. */
  assert.notEqual(renderPack(published()).version, renderPack(published({ catalog: planningCatalog() })).version);
  /* Rule 12: every plan checked for a branch answering a hostile response. */
  const r12 = ACTION_RULES.find((r) => r.rule === 12);
  assert.ok(r12, "rule 12 is carried");
  assert.ok(r12.sentences.some((s) => /every plan is checked for a branch that answers a hostile response/.test(s)));
  for (const s of r12.sentences) assert.ok(foundIn(ruleText(12), s), s);
  assert.equal(present.body.rules.find((r) => r.rule === 12), r12);
});

test("R47 the action_planning layer names, beside its acts, the closing notes of the project's closed plans as an input the planning run reads and weighs: closingNotesOf with action-plans R45, named once as a selector, carrying no control-flow authority, and the pack's version moves; control: with no optionpropose, R29's stated absence is unchanged", () => {
  const catalog = planningCatalog();
  const { body } = renderPack(published({ catalog })).disclosed.action_planning;
  assert.equal(body.inputs, PLANNING_INPUTS, "the one object, named once");
  assert.equal(body.inputs.length, 1);
  const [notes] = body.inputs;
  assert.equal(notes.id, "closingNotesOf");
  assert.equal(notes.defined_by, "action-plans R45", "keyed by the requirement that defines it");
  assert.match(notes.answered_in, /planRead's closed block/);
  assert.match(notes.answered_in, /plansFor/);
  assert.match(notes.is, /closing notes of the project's closed plans/);
  assert.match(notes.is, /reads them and weighs them .* when it proposes options/);
  assert.ok(Object.isFrozen(PLANNING_INPUTS) && Object.isFrozen(notes), "frozen");
  /* Named, never authored as a clause: it is not among the rules R21 binds, and the rules are unchanged. */
  assert.equal(body.rules, ACTION_RULES);
  assert.ok(!ACTION_RULES.some((r) => [r.heading, ...r.sentences].some((t) => /closingNotesOf/.test(t))));
  /* R23: the selector appears in the module's source once. */
  const lits = SRC.flatMap((f) => stringLiterals(read(f)));
  assert.equal(lits.filter((l) => l === "closingNotesOf").length, 1, "closingNotesOf is named once");
  /* R16, R24: no text of it carries control-flow authority. */
  for (const s of strings(PLANNING_INPUTS)) assert.deepEqual(controlFlowAuthority(s), [], s);
  /* R11: the pack's version moves with the input's words. */
  const pack = renderPack(published({ catalog }));
  const { inputs, ...without } = body;
  const prior = { ...pack, disclosed: { ...pack.disclosed, action_planning: { ...pack.disclosed.action_planning, body: without } } };
  assert.notEqual(packVersion(prior), pack.version, "the input is part of what the version is computed over");
  assert.equal(renderPack(published({ catalog })).version, pack.version, "the control: the same render, the same version");
  /* The control: with no optionpropose, R29's stated absence carries no input. */
  for (const c of [published().catalog, planningCatalog(["optionpropose"])]) {
    const layer = actionPlanningLayer(c);
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
    assert.deepEqual(layer.body, {});
    assert.equal(layer.sourcing, "absent");
    assert.ok(!JSON.stringify(layer).includes("closingNotesOf"));
  }
});
