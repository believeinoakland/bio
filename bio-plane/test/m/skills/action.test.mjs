/* T45-13 (N858, N861, N887; Actions D1, D8, D11b, D25; K2780, K2787): the action drafts' layer (R45) and the procedure
 * guides' layer (R46). Each refusal and each throw with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPack, packVersion, SOURCING } from "../../../src/skillpack.mjs";
import { actionDraftingLayer, procedureGuideLayer, ACTION_DRAFTING_RULES, ACTION_DRAFTING_ACTS, ACTION_RULE_TABLE,
         STATUS_REPORT_ACT, STATUS_REPORT_TASK,
         ACTION_RULES, FILING_RULES, ACTION_SOURCE, ACTION_SECTION, controlFlowAuthority } from "../../../src/skilldoctrine.mjs";
import { DRAFT_MODE, DRAFT_REACH } from "../../../src/run-rules/index.mjs";
import { PROCEDURE_GUIDE_LABEL } from "../../../src/reading-guides/index.mjs";
import { SRC, read, norm, foundIn, section, canonDocuments, published, stringLiterals } from "./fixture.mjs";

/* The acts R45 names, as `op=affordances` would publish them once agent-worker's draft tasks are declared (its R76):
   each an entry of the plane's shape, asked for by a member. */
const DRAFTS = ["textcheck", "infractiondraft", "bearingdraft"];
const entry = (id) => ({ id, label: `the ${id} act`, weight: null, needs: "contribute", mode: "session", rung: null,
                         rung_absence: null, prompt: null });
const draftCatalog = (drop = []) => [...published().catalog, ...DRAFTS.map(entry)].filter((a) => !drop.includes(a.id));
const LOAD_WHEN = "the member asks the assistant to read a prepared text, draft an infraction's documentation for an "
  + "audience, or propose bearings on a reply";
const PLACES = ["Oakland", "Alameda", "California", "Berkeley", "San Francisco", "Hayward"];

const s4 = () => section(read(ACTION_SOURCE), "4. The rules");
const ruleText = (n) => (s4().split("\n").find((l) => l.startsWith(`${n}. `)) ?? "");
const strings = (v) => typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];

test("R45 R5 the action_drafting layer, in disclosed after interface_translation: authored, its load_when R45's sentence, its body BIO_Action_v0_2.md §4 rules 1, 2, 3, 9, 12, 16, 19 and 21, each heading and sentence found in that rule by R21's normaliser", () => {
  const { disclosed, resident } = renderPack(published({ catalog: draftCatalog() }));
  const keys = Object.keys(disclosed);
  assert.equal(keys.indexOf("action_drafting"), keys.indexOf("interface_translation") + 1, "after interface_translation");
  const layer = disclosed.action_drafting;
  assert.equal(layer.sourcing, "authored");
  assert.equal(SOURCING.action_drafting, "authored");
  assert.equal(layer.load_when, LOAD_WHEN);
  assert.ok(resident.disclosable.some((d) => d.layer === "action_drafting" && d.load_when === LOAD_WHEN));
  assert.equal(layer.body.rules, ACTION_DRAFTING_RULES);
  assert.equal(layer.body.source, "docs/architecture/BIO_Action_v0_2.md");
  assert.equal(layer.body.section, ACTION_SECTION);
  assert.ok(canonDocuments().has(ACTION_SOURCE), "the Action document is canon");
  assert.deepEqual(ACTION_DRAFTING_RULES.map((r) => r.rule), [1, 2, 3, 9, 12, 16, 19, 21], "exactly R45's rules, in §4's order");
  for (const r of ACTION_DRAFTING_RULES) {
    const rule = ruleText(r.rule);
    assert.ok(rule.length > 0, `rule ${r.rule} is in §4`);
    assert.ok(norm(rule).startsWith(`${r.rule}. ${norm(r.heading)}`), `rule ${r.rule}'s heading is its own`);
    for (const s of r.sentences) assert.ok(foundIn(rule, s), `rule ${r.rule}: "${s}" is in its paragraph`);
    /* One object per rule: the planning, filing and drafting layers carry the same words. */
    assert.equal(r, ACTION_RULE_TABLE.find((x) => x.rule === r.rule));
    const shared = [...ACTION_RULES, ...FILING_RULES].find((x) => x.rule === r.rule);
    if (shared) assert.equal(r, shared, `rule ${r.rule} is the planning or filing layer's own object`);
  }
  /* What the three drafts turn on: assertions pointed out, the record check, no policy position, no "you have a claim",
     changes only by a member's act, documentation first and the chance to fix, nothing for the group's own benefit,
     the official responsible named. */
  const all = ACTION_DRAFTING_RULES.flatMap((r) => [r.heading, ...r.sentences]).join(" ");
  for (const re of [/never does any of these acts/, /Sentences that read as assertions are pointed out before approval/,
                    /sentence-by-sentence account check/, /never take or propose a policy or vote position/,
                    /A packet never says "you have a claim"/, /What the group chose changes only by a member's act/,
                    /describe and document it/, /A version may be written for a particular audience/,
                    /the plan never withdraws it/, /nothing is prepared that asks anything for the benefit of the group/,
                    /staff below that level are named only where the evidence turns on their own act/])
    assert.match(all, re);
  /* The mode is run-rules' draft mode (its R21, R27), read from it and never typed (R23). */
  assert.equal(layer.body.mode, DRAFT_MODE.mode);
  assert.ok(!SRC.flatMap((f) => stringLiterals(read(f))).includes(DRAFT_MODE.mode), "the mode is not typed");
  /* The lookup can miss: a changed word is not found. */
  assert.ok(!foundIn(ruleText(21), "nothing is prepared that asks anything for the benefit of the group or its officials."));
});

test("R45 acts: textcheck, infractiondraft and bearingdraft, each the published catalogue's own entry read by id with the requirement that defines it; each id named once, as a selector (R23)", () => {
  const catalog = draftCatalog();
  const { acts } = renderPack(published({ catalog })).disclosed.action_drafting.body;
  const byId = new Map(catalog.map((a) => [a.id, a]));
  /* R48: the status report's act is read on its own; with it unpublished, its list is empty. */
  assert.deepEqual(Object.keys(acts), ["drafts", "status_report"]);
  assert.deepEqual(acts.status_report, []);
  assert.deepEqual(acts.drafts.map((a) => a.id), DRAFTS);
  for (const a of acts.drafts) {
    assert.equal(a.act, byId.get(a.id), `${a.id} is the catalogue's own entry, unchanged`);
    assert.equal(a.defined_by, "agent-worker R76");
  }
  const relabelled = catalog.map((a) => (a.id === "bearingdraft" ? { ...a, label: "Bearings, relabelled" } : a));
  assert.equal(actionDraftingLayer(relabelled).body.acts.drafts[2].act.label, "Bearings, relabelled");
  const lits = SRC.flatMap((f) => stringLiterals(read(f)));
  for (const id of DRAFTS) assert.equal(lits.filter((l) => l === id).length, 1, `${id} is named once`);
  for (const id of DRAFTS) assert.ok(!lits.includes(`the ${id} act`));
  assert.deepEqual(ACTION_DRAFTING_ACTS.drafts.map((a) => a.id), DRAFTS);
});

test("R45 R1 with some of its acts published, one R45 names that the catalogue does not publish throws naming it, and nothing renders; with all of them it renders", () => {
  for (const drop of [["textcheck"], ["infractiondraft"], ["bearingdraft"], ["textcheck", "bearingdraft"],
                      ["infractiondraft", "bearingdraft"]]) {
    const pub = published({ catalog: draftCatalog(drop) });
    assert.throws(() => renderPack(pub), new RegExp(`action drafting layer names the act ${drop[0]} \\(agent-worker R76\\)`),
      drop.join(","));
    assert.throws(() => actionDraftingLayer(pub.catalog), new RegExp(`names the act ${drop[0]} `));
  }
  assert.ok(renderPack(published({ catalog: draftCatalog() })).version, "the control: the full catalogue renders");
});

test("R45 R9 with none of its acts published, the layer is a stated absence in R9's form and the pack still renders; the version tells the two packs apart (R11)", () => {
  for (const catalog of [published().catalog, draftCatalog(DRAFTS), undefined, null, "x"]) {
    const layer = actionDraftingLayer(catalog);
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.equal(SOURCING.action_drafting_unpublished, "absent");
    assert.deepEqual(layer.body, {});
    for (const id of DRAFTS) assert.match(layer.absent_because, new RegExp(id));
  }
  const { disclosed, resident, version } = renderPack(published());
  assert.equal(disclosed.action_drafting.sourcing, "absent");
  assert.ok(resident.disclosable.some((d) => d.layer === "action_drafting" && d.load_when === "never, in this edition"));
  const full = renderPack(published({ catalog: draftCatalog() }));
  assert.notEqual(version, full.version);
  /* The digest is over what is rendered: every sentence of the layer is carried, so a moved word moves the version. */
  for (const r of ACTION_DRAFTING_RULES) for (const s of r.sentences)
    assert.ok(JSON.stringify(full).includes(JSON.stringify(s).slice(1, -1)), s);
});

test("R45 R16 R24 R26 no string of the layer, present or absent, carries control-flow authority, and none names a place", () => {
  for (const catalog of [draftCatalog(), published().catalog]) {
    const layer = actionDraftingLayer(catalog);
    for (const s of strings({ ...layer, body: { ...layer.body, acts: undefined } }))
      assert.deepEqual(controlFlowAuthority(s), [], s);
    const json = JSON.stringify(layer);
    for (const place of PLACES) assert.ok(!json.includes(place), place);
  }
  /* Every rule the module carries, whichever layer names it. */
  for (const r of ACTION_RULE_TABLE) for (const s of [r.heading, ...r.sentences]) {
    assert.deepEqual(controlFlowAuthority(s), [], s);
    for (const place of PLACES) assert.ok(!s.includes(place), `${place} in rule ${r.rule}`);
  }
  assert.ok(controlFlowAuthority("Keep going until the draft reads well.").length > 0, "the scan can fire");
});

/* R48 (T46; N920): the status report task, its act `statusreportassist` (plan-work R8's assistant arm) read on its own. */
const STATUS = "statusreportassist";
const STATUS_LOAD_WHEN = "asks the assistant to draft a plan's status report from the items handed to it";
const withStatus = (catalog) => [...catalog, entry(STATUS)];

test("R48 with all four published, the action_drafting layer names statusreportassist (plan-work R8), the catalogue's own entry read by id, and the task's description: each sentence from an item handed to it, nothing read; its load_when adds the status report; named once as a selector (R23)", () => {
  const catalog = withStatus(draftCatalog());
  const pack = renderPack(published({ catalog }));
  const layer = pack.disclosed.action_drafting;
  assert.equal(layer.sourcing, "authored");
  assert.equal(layer.load_when, `${LOAD_WHEN}, or ${STATUS_LOAD_WHEN}`);
  assert.ok(pack.resident.disclosable.some((d) => d.layer === "action_drafting" && d.load_when === layer.load_when));
  const { acts, status_report } = layer.body;
  assert.deepEqual(acts.drafts.map((a) => a.id), DRAFTS, "R45's three render as R45 says");
  assert.deepEqual(acts.status_report.map((a) => a.id), [STATUS]);
  const [sr] = acts.status_report;
  assert.equal(sr.act, catalog.find((a) => a.id === STATUS), "the catalogue's own entry, unchanged");
  assert.equal(sr.defined_by, "plan-work R8");
  assert.equal(STATUS_REPORT_ACT.id, STATUS);
  assert.ok(!("drafts_absent_because" in layer.body));
  assert.deepEqual(Object.keys(status_report), ["task", "reach"]);
  assert.equal(status_report.task, STATUS_REPORT_TASK);
  /* run-rules R27's reach, its own object read by key: none, only the items handed in. */
  assert.equal(status_report.reach, DRAFT_REACH.statusreport);
  assert.equal(status_report.reach.scope, "none");
  assert.match(STATUS_REPORT_TASK, /each sentence of the report comes from one of those items/);
  assert.match(STATUS_REPORT_TASK, /nothing is read/);
  assert.match(STATUS_REPORT_TASK, /plan-work R8/);
  assert.match(STATUS_REPORT_TASK, /run-rules R27's reach none/);
  assert.match(STATUS_REPORT_TASK, /labelled machine draft/);
  /* This module's own words, not a clause: no rule of §4 carries it, and the rules are R45's, unchanged. */
  assert.equal(layer.body.rules, ACTION_DRAFTING_RULES);
  assert.ok(!foundIn(s4(), STATUS_REPORT_TASK));
  /* R23: the id is named once in the module's source, as a selector. */
  const lits = SRC.flatMap((f) => stringLiterals(read(f)));
  assert.equal(lits.filter((l) => l === STATUS).length, 1, `${STATUS} is named once`);
  /* R16, R24: no text of the layer carries control-flow authority; R26: none names a place. */
  for (const s of strings({ ...layer, body: { ...layer.body, acts: undefined } })) assert.deepEqual(controlFlowAuthority(s), [], s);
  for (const place of PLACES) assert.ok(!JSON.stringify(layer).includes(place), place);
  /* R11: the version moves with the task, and tells this pack from the one without it. */
  assert.notEqual(pack.version, renderPack(published({ catalog: draftCatalog() })).version);
  const moved = { ...pack, disclosed: { ...pack.disclosed, action_drafting: { ...layer,
    body: { ...layer.body, status_report: { task: STATUS_REPORT_TASK + " " } } } } };
  assert.notEqual(packVersion(moved), pack.version, "a moved word of the task moves the version");
  assert.equal(renderPack(published({ catalog })).version, pack.version, "the control: the same render, the same version");
});

test("R48 with statusreportassist alone absent, the body states it absent in R9's form and the three render as R45 says; with the three absent and it published, the three are stated absent and the task renders; R45's all-or-none rule stays over the three", () => {
  /* statusreportassist absent: the three, and its stated absence. */
  const three = actionDraftingLayer(draftCatalog());
  assert.equal(three.sourcing, "authored");
  assert.equal(three.load_when, LOAD_WHEN, "the load_when names no status report");
  assert.deepEqual(three.body.acts.drafts.map((a) => a.id), DRAFTS);
  assert.deepEqual(three.body.acts.status_report, []);
  assert.deepEqual(Object.keys(three.body.status_report), ["absent_because"]);
  assert.match(three.body.status_report.absent_because, new RegExp(STATUS));
  assert.ok(!("drafts_absent_because" in three.body));
  /* The three absent, statusreportassist published: the task renders, and the three are stated absent. */
  for (const catalog of [withStatus(published().catalog), withStatus(draftCatalog(DRAFTS))]) {
    const alone = actionDraftingLayer(catalog);
    assert.equal(alone.sourcing, "authored");
    assert.equal(alone.load_when, `the member ${STATUS_LOAD_WHEN}`);
    assert.deepEqual(alone.body.acts.drafts, []);
    assert.deepEqual(alone.body.acts.status_report.map((a) => a.id), [STATUS]);
    assert.equal(alone.body.status_report.task, STATUS_REPORT_TASK);
    for (const id of DRAFTS) assert.match(alone.body.drafts_absent_because, new RegExp(id));
    assert.equal(alone.body.rules, ACTION_DRAFTING_RULES);
    for (const s of strings({ ...alone, body: { ...alone.body, acts: undefined } })) assert.deepEqual(controlFlowAuthority(s), [], s);
    assert.equal(renderPack(published({ catalog })).disclosed.action_drafting.sourcing, "authored", "the pack renders");
  }
  /* R45's rule over the three is unchanged by the fourth: some of them published, a missing one throws naming it. */
  for (const drop of [["textcheck"], ["bearingdraft"], ["infractiondraft", "bearingdraft"]]) {
    const catalog = withStatus(draftCatalog(drop));
    assert.throws(() => actionDraftingLayer(catalog), new RegExp(`names the act ${drop[0]} \\(agent-worker R76\\)`), drop.join(","));
    assert.throws(() => renderPack(published({ catalog })), new RegExp(`names the act ${drop[0]} `));
  }
  /* The three packs differ (R11). */
  const versions = [draftCatalog(), withStatus(draftCatalog()), withStatus(published().catalog)]
    .map((catalog) => renderPack(published({ catalog })).version);
  assert.equal(new Set(versions).size, 3);
});

test("R48 control: with none of the four published, the layer is R45's stated absence, unchanged", () => {
  for (const catalog of [published().catalog, draftCatalog(DRAFTS), undefined, null, "x"]) {
    const layer = actionDraftingLayer(catalog);
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.deepEqual(layer.body, {});
    assert.equal(layer.absent_because, "the plane's published catalogue holds none of the acts textcheck, infractiondraft, "
      + "bearingdraft, the drafts through which a member asks the assistant to read a prepared text, document an "
      + "infraction or propose bearings on a reply, so this layer carries no doctrine for work no draft can do.",
      "R45's words, unchanged");
    assert.ok(!JSON.stringify(layer).includes(STATUS));
  }
  /* And the one act alone is enough to lift it: the control's control. */
  assert.equal(actionDraftingLayer(withStatus(published().catalog)).sourcing, "authored");
});

/* `reading-guides.procedureGuidesFor`'s answer (its R13; K2820), `{kind, guides: [{guide, origin, items}], label}`, as
   the run's caller passes it: the profile's guide first, then the group's approved ones, each its id with its origin
   and items, and the legal-information label. */
const LABEL = PROCEDURE_GUIDE_LABEL;
const ITEMS = [
  { route: "Ask for reconsideration by the records officer", expect: "A reply or a denial", citation: "Code § 1.2",
    after: ["denied", "partial"] },
  { route: "Complain to the oversight office", citation: "Code § 3.4" },
];
const GROUP_ITEMS = [{ route: "Send the request again by mail", expect: "The office must respond within 10 days",
                       citation: "Code § 1.5" }];
const answer = (over = {}) => ({ ok: true, kind: "records_request", label: LABEL, withheld: [], guides: [
  { guide: null, origin: "profile", items: ITEMS },
  { guide: "GUD-2026-abcdefghijklmnop", origin: "group", items: GROUP_ITEMS, state: "group", author: "m1" },
], ...over });

test("R46 the procedure_guide layer: with no guide passed, a stated absence in R9's form and the pack still renders; with procedureGuidesFor's answer, sourcing guide, each guide named with its kind and origin in the answer's order, its items only, the legal-information label carried", () => {
  for (const none of [undefined, null, [], {}, "x", [{ kind: "k", guides: [] }], { guides: [{ guide: "GUD-1", origin: "group" }] },
                      { guides: [null, "GUD-1"] }]) {
    const layer = procedureGuideLayer(none);
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"], JSON.stringify(none));
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.equal(SOURCING.procedure_guide_none, "absent");
    assert.deepEqual(layer.body, {});
  }
  const bare = renderPack(published());
  assert.deepEqual(bare.disclosed.procedure_guide, procedureGuideLayer(null));
  const keys = Object.keys(bare.disclosed);
  assert.equal(keys.indexOf("procedure_guide"), keys.indexOf("action_drafting") + 1, "after action_drafting");
  const pack = renderPack(published(), { procedure_guides: answer() });
  const layer = pack.disclosed.procedure_guide;
  assert.equal(layer.sourcing, "guide");
  assert.equal(SOURCING.procedure_guide, "guide");
  assert.match(layer.load_when, /concerns an action of a kind/);
  assert.equal(layer.body.procedures.length, 1);
  const [proc] = layer.body.procedures;
  assert.equal(proc.kind, "records_request");
  assert.equal(proc.label, LABEL, "the answer's legal-information label, unchanged");
  assert.deepEqual(proc.guides.map((g) => [g.guide, g.origin]),
    [[null, "profile"], ["GUD-2026-abcdefghijklmnop", "group"]], "the answer's order: the profile's first, with no id");
  assert.equal(proc.guides[0].items, ITEMS, "the items, unchanged, the profile's `after` included");
  assert.deepEqual(proc.guides[0].items[0].after, ["denied", "partial"]);
  assert.ok(!("withheld" in proc) && !("ok" in proc), "a withheld guide is not passed, and nothing of it renders");
  for (const g of proc.guides) {
    assert.deepEqual(Object.keys(g).sort(), ["guide", "items", "kind", "origin"], "the items only: no state or author");
    assert.equal(g.kind, "records_request");
  }
  assert.ok(pack.resident.disclosable.some((d) => d.layer === "procedure_guide" && d.load_when === layer.load_when));
  /* A list of answers, one per kind, renders each in turn; the same answer passed alone or in a list renders alike. */
  const two = procedureGuideLayer([answer(), answer({ kind: "public_comment", guides: [answer().guides[1]] })]);
  assert.deepEqual(two.body.procedures.map((p) => p.kind), ["records_request", "public_comment"]);
  assert.deepEqual(procedureGuideLayer([answer()]), procedureGuideLayer(answer()));
  /* R11: a run under a procedure guide ran under other instructions. */
  assert.notEqual(pack.version, bare.version);
  assert.notEqual(renderPack(published(), { procedure_guides: answer({ label: { ...LABEL, says: "x" } }) }).version, pack.version);
  assert.equal(renderPack(published(), { procedure_guides: answer() }).version, pack.version, "the control");
});

test("R46 R16 a procedure guide carries no clause of conduct: an item R16 finds, in its route, expect or citation, throws naming the guide and the item, and renderPack renders nothing", () => {
  for (const [field, text] of [["route", "Keep searching until a reply is found"], ["expect", "Repeat until the office replies"],
                               ["citation", "at most three passes over the code"]]) {
    assert.ok(controlFlowAuthority(text).length > 0, `the scan fires on ${text}`);
    const bad = { route: "File the complaint", citation: "Code § 9", [field]: text };
    const a = answer({ guides: [answer().guides[0], { guide: "GUD-9", origin: "group", items: [...GROUP_ITEMS, bad] }] });
    assert.throws(() => procedureGuideLayer(a), /procedure guide GUD-9 item 2 .*carries a clause of conduct/);
    assert.throws(() => renderPack(published(), { procedure_guides: a }), /GUD-9 item 2/);
  }
  /* The profile's guide, which has no id, is named by its kind. */
  const prof = answer({ guides: [{ guide: null, origin: "profile", items: [{ route: "Repeat until the office replies", citation: "Code § 1" }] }] });
  assert.throws(() => procedureGuideLayer(prof), /procedure guide \(the profile's guide for records_request\) item 1 .*carries a clause of conduct/);
  /* The control: a procedure's own words ("must respond within 10 days", "send") are not conduct, and render. */
  assert.deepEqual(controlFlowAuthority(GROUP_ITEMS[0].expect), []);
  assert.doesNotThrow(() => renderPack(published(), { procedure_guides: answer() }));
});

test("R46 R22 R26 the layer reads no viewer and names no place: the same answer renders the same pack whatever else is passed; no string the layer authors carries control-flow authority", () => {
  const base = renderPack(published(), { procedure_guides: answer() });
  for (const extra of [{ viewer: "m1" }, { project: "PRJ-1" }])
    assert.equal(renderPack(published(extra), { procedure_guides: answer() }).version, base.version);
  assert.equal(packVersion(base), base.version);
  for (const layer of [procedureGuideLayer(null), procedureGuideLayer(answer())]) {
    const authored = { ...layer, body: { ...layer.body, procedures: undefined } };
    for (const s of strings(authored)) assert.deepEqual(controlFlowAuthority(s), [], s);
    for (const place of PLACES) assert.ok(!JSON.stringify(authored).includes(place));
  }
});
