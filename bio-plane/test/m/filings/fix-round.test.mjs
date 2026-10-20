/* filings at the T51 fix round (K4165, K4168; FR-20): R66 the approval a screen sends, with its resolutions and its release,
   is accepted for a text holding a flagged or a contradicted sentence (C71), and R67 a filing that needs counsel first is
   kept as a template only as a brief (C75, DEC-377). Each is driven at the module's interface as the door calls it
   (`filingsOps`, with `url` and `body`) over the real modules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { DECLARED_OPS } from "../../../src/filings/index.mjs";

const BO = { author: V("bo"), viewer: V("bo") };
const FLAGGED = "The board acted in breach of the bylaw.";
const CLAIM = "The works order was let without the vote the bylaw requires.";
const NEGATED = "The works order was not let without the vote the bylaw requires.";
const prepare = (x, action, text, over = {}) => x.op("filingprepare", BO, { action, text, language: "en", ...over });
const accepts = (op) => DECLARED_OPS[op].fields.accepts;

test("R66 approving with the declared resolutions is accepted for a text with a flagged phrase, and without them it is refused ASSERTION_UNRESOLVED (control)", async () => {
  const x = world();
  const A = x.action();
  const d = await prepare(x, A, `${FLAGGED} We ask for the minutes.`);
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  assert.deepEqual(d.outward.pointed.assertion.pointed.map((p) => p.index), [0], "the phrase is flagged");
  /* control: the same approval without the field the declaration names */
  const without = await x.op("filingapprove", BO, { filing: d.id });
  assert.equal(without.reason, "ASSERTION_UNRESOLVED");
  /* the real approval, with exactly the fields the declaration names for it */
  const body = { filing: d.id, resolutions: [{ sentence: FLAGGED, resolution: "only_asks", words: "we ask the board to examine it" }] };
  for (const k of Object.keys(body)) assert.ok(accepts("filingapprove").includes(k), `filingapprove declares ${k}`);
  const approved = await x.op("filingapprove", BO, body);
  assert.equal(approved.ok, true, JSON.stringify(approved).slice(0, 300));
  assert.deepEqual(approved.resolutions.map((r) => r.resolution), ["only_asks"]);
});

test("R66 a contradicted sentence is approved with release and its reason, and without it is refused CONTRADICTED_HELD (control)", async () => {
  const x = world();
  const A = x.action();
  const d = await prepare(x, A, `${CLAIM} ${NEGATED}`);
  assert.deepEqual(d.outward.record_check.items.map((i) => i.verdict), ["supported", "contradicted"]);
  assert.equal((await x.op("filingapprove", BO, { filing: d.id })).reason, "CONTRADICTED_HELD");
  const body = { filing: d.id, release: [{ ord: 1, reason: "the group states it in its own words" }] };
  for (const k of Object.keys(body)) assert.ok(accepts("filingapprove").includes(k), `filingapprove declares ${k}`);
  const approved = await x.op("filingapprove", BO, body);
  assert.equal(approved.ok, true, JSON.stringify(approved).slice(0, 300));
  assert.deepEqual(approved.released, [{ ord: 1, reason: "the group states it in its own words" }]);
});

const approvedAt = async (x, tier) => {
  /* a Tier 2 filing is a records request, whose profile carries the advisory note a Tier 2 filing opens with */
  const A = x.action(tier === 2 ? { kind: "records_request", risk_tier: 2, law: "Test Stat. § 1.100" } : { risk_tier: tier });
  const d = await prepare(x, A, "To the {{counterparty_role}}: a letter.");
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const ap = await x.op("filingapprove", BO, { filing: d.id });
  assert.equal(ap.ok, true, JSON.stringify(ap).slice(0, 300));
  return { A, d };
};
/* a template version through submission, a review and approval, as filing-templates' own acts */
function pass(x, version) {
  const t = x.f.filingTemplates;
  assert.equal(t.templateSubmit({ version, reviewers: ["member:cy"], author: V("bo"), viewer: V("bo") }).ok, true);
  assert.equal(t.templateReview({ version, outcome: "no_concerns", scope: "the whole text", author: V("cy"), viewer: V("cy") }).ok, true);
  assert.equal(t.templateApprove({ version, by: V("olive"), viewer: V("olive") }).ok, true);
}
const raise = (x, A, tier) => {
  const r = x.actions.actionRiskTier({ target: A, tier, reason: "this needs counsel first", author: V("olive"), viewer: V("olive") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
};

test("R67 a filing that needs counsel first is kept as a template only as a brief: use file is refused, use brief is accepted", async () => {
  const x = world();
  const { A, d } = await approvedAt(x, 1);
  raise(x, A, 3);
  const file = await x.op("templatesave", BO, { filing: d.id, name: "kept as a file" });
  assert.equal(file.ok, false, "the default use is file");
  assert.equal(file.reason, "TEMPLATE_TIER3_FILE");
  assert.equal((await x.op("templatesave", BO, { filing: d.id, name: "kept as a file", use: "file" })).reason, "TEMPLATE_TIER3_FILE");
  const brief = await x.op("templatesave", BO, { filing: d.id, name: "kept as a brief", use: "brief" });
  assert.equal(brief.ok, true, JSON.stringify(brief).slice(0, 300));
  assert.equal(x.f.filingTemplates.templateRead({ template: brief.template, viewer: V("bo") }).template.use, "brief");
});

test("R67 a new version of a file template is refused for a filing that needs counsel first; a brief template takes one", async () => {
  const x = world();
  const first = await approvedAt(x, 1);
  const kept = await x.op("templatesave", BO, { filing: first.d.id, name: "the notice" });
  assert.equal(kept.ok, true, "kept as a file while the filing needs no counsel");
  const brief = await x.op("templatesave", BO, { filing: first.d.id, name: "the briefing", use: "brief" });
  assert.equal(brief.ok, true);
  pass(x, brief.version);
  const second = await approvedAt(x, 1);
  raise(x, second.A, 3);
  assert.equal((await x.op("templatesave", BO, { filing: second.d.id, template: kept.template })).reason, "TEMPLATE_TIER3_FILE");
  const version = await x.op("templatesave", BO, { filing: second.d.id, template: brief.template });
  assert.equal(version.ok, true, JSON.stringify(version).slice(0, 300));
});

test("R67 control: a Tier 1 or Tier 2 filing keeps as a file, a brief too", async () => {
  for (const tier of [1, 2]) {
    const x = world();
    const { d } = await approvedAt(x, tier);
    const file = await x.op("templatesave", BO, { filing: d.id, name: `kept at ${tier}` });
    assert.equal(file.ok, true, `tier ${tier}: ${JSON.stringify(file).slice(0, 300)}`);
    assert.equal(x.f.filingTemplates.templateRead({ template: file.template, viewer: V("bo") }).template.use, "file");
    assert.equal((await x.op("templatesave", BO, { filing: d.id, name: `briefed at ${tier}`, use: "brief" })).ok, true);
  }
});
