import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPack } from "../../../src/skillpack.mjs";
import { actionPlanningLayer, ACTION_RULES, ACTION_SOURCE, ACTION_SECTION, PLANNING_ACTS, PLANNING_ACT,
         controlFlowAuthority } from "../../../src/skilldoctrine.mjs";
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

test("R28 the action_planning layer: authored, its load_when R28's sentence, its body the rules of §4 1–3, 6, 8–10 and 13, each heading and sentence found in that rule by R21's normaliser", () => {
  const catalog = planningCatalog();
  const layer = renderPack(published({ catalog })).disclosed.action_planning;
  assert.equal(layer.sourcing, "authored");
  assert.ok(layer.load_when.startsWith(LOAD_WHEN), layer.load_when);
  assert.equal(layer.body.rules, ACTION_RULES, "the doctrine's own rules, unchanged");
  assert.equal(layer.body.source, "docs/architecture/BIO_Action_v0_1.md");
  assert.equal(layer.body.section, ACTION_SECTION);
  assert.ok(canonDocuments().has(ACTION_SOURCE), "the Action document is canon");
  assert.ok(s4().length > 0, "§4 is where it was");
  const numbers = ACTION_RULES.map((r) => r.rule);
  for (const n of [1, 2, 3, 6, 8, 9, 10, 13]) assert.ok(numbers.includes(n), `rule ${n} is carried`);
  for (const r of ACTION_RULES) {
    const rule = ruleText(r.rule);
    assert.ok(rule.length > 0, `rule ${r.rule} is in §4`);
    assert.ok(norm(rule).startsWith(`${r.rule}. ${norm(r.heading)}`), `rule ${r.rule}'s heading is its own: ${r.heading}`);
    assert.ok(r.sentences.length > 0);
    for (const s of r.sentences) assert.ok(foundIn(rule, s), `rule ${r.rule}: "${s}" is in its paragraph`);
  }
  /* The lookup can miss: a changed word is not found. */
  assert.ok(!foundIn(ruleText(3), "No field holds significance, severity, priority or a rank."));
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

test("R29 the layer names the plan mode in its load_when; with no optionpropose published it is a stated absence in R9's form; rule 12's clause is carried, found in §4", () => {
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
