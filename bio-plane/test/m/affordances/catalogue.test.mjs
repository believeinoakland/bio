/* affordances: the catalogue (R1–R7), the rung backing that can be read off the tables (R19's structural half), the
   decorated shape's rung totality (R24) and the no-place rule (R25), each at the module's exports. What the acting
   modules answer when the acts are performed (R18–R20) is driven through the plane in `plane.test.mjs`. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as A from "../../../src/affordances.mjs";
/* The grammars the catalogue reads (T19): the record's (states, grades) and the action document's (kinds and the action
   vocabularies), each the module whose refusals run on it. */
import { STATES, BASIS_GRADES, EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE } from "../../../src/record-grammar/index.mjs";
import * as actionGrammar from "../../../src/action-grammar/index.mjs";
import * as inquiry from "../../../src/inquiry/index.mjs";
import * as entities from "../../../src/entities/index.mjs";
import * as progressions from "../../../src/progressions/index.mjs";
import * as promotion from "../../../src/promotion/index.mjs";
import * as recordCore from "../../../src/record-core/index.mjs";
import * as basisVersions from "../../../src/basis-versions/index.mjs";
import * as content from "../../../src/content/index.mjs";
import * as ratification from "../../../src/ratification/index.mjs";
import * as contradiction from "../../../src/contradiction/index.mjs";
import * as filingTemplates from "../../../src/filing-templates/index.mjs";
import * as localFacts from "../../../src/local-facts/index.mjs";
import * as docket from "../../../src/docket/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";
import { list as profiles, get as profile } from "../../../../jurisdictions/index.mjs";

const { ACTS, CAPTURE_ACTS, PER_ITEM_ACTS, NON_ACTS, RUNGS, RUNG_ABSENT, RUNG_LADDER, RUNG_ABSENCE_GROUNDS,
        IRREVERSIBLE_CORRECTION_PATH, VOCABULARIES, MACHINE_REFUSALS, JUSTIFICATION_REFUSALS } = A;
const ids = (xs) => xs.map((a) => a.id).sort();

test("R1: ACTS holds exactly the object-directed acts, each at its weight", () => {
  const W = {
    refuse: ["release", "retire", "dispose", "sever", "reinstate"],
    report: ["cite"],
    single: ["conclude", "reopen", "publish", "inquirydivide", "inquiryground", "actionmove", "actioncorrespond",
      "actionlaws", "actionrisktier", "versionaccept", "versionreject", "versionconsider", "versionrevert",
      "versioncurrent", "withdrawconclusion", "versionhide", "projectinvite", "projectjoin", "projectleave",
      "projectremove", "projectowneradd", "projectownerremove", "projectownerrescue", "projectvisibilityset",
      "contradictionresolve" /* N345 */, "sourceconsent" /* N364 (K530): its prompt rides it, R5 */],
  };
  const want = Object.entries(W).flatMap(([w, xs]) => xs.map((id) => [id, w])).sort();
  assert.deepEqual(ACTS.map((a) => [a.id, a.weight]).sort(), want);
  assert.equal(new Set(ACTS.map((a) => a.id)).size, ACTS.length);
  for (const a of ACTS) {
    assert.equal(typeof a.label, "string"); assert.ok(a.label.length > 0);
    assert.ok(Array.isArray(a.types) && a.types.length > 0); assert.equal(typeof a.applies, "function");
  }
});

/* citeproject-inquiry's share (T18 convert): the types each citation act declares are what op=affordances publishes as
   `appliesTo` (R17, the once-loaded shape a surface builds its offer set from), and `deriveActs` reads none of them, so
   they are asserted against R9's own text here rather than against the catalogue that holds them. */
test("R9 R17: cite, sever and reinstate each declare exactly the types R9 offers them on — an information bundle, a "
   + "project and an inquiry", () => {
  for (const id of ["cite", "sever", "reinstate"])
    assert.deepEqual([...ACTS.find((a) => a.id === id).types].sort(), ["information", "inquiry", "project"], id);
});

test("R1: CAPTURE_ACTS holds attest, monitor and attesttext, with no weight", () => {
  assert.deepEqual(ids(CAPTURE_ACTS), ["attest", "attesttext", "monitor"]);
  for (const a of CAPTURE_ACTS) { assert.equal(a.weight, undefined); assert.ok(a.label.length > 0); }
});

test("R1: PER_ITEM_ACTS holds the four set acts, weight per-item, set key items, with their identity groups and shareable fields", () => {
  assert.deepEqual(PER_ITEM_ACTS.map((a) => [a.id, a.weight, a.set_key, a.item_keys, a.shared_keys]), [
    ["proposedispose", "per-item", "items", [["key"], ["progressionKey", "stageKey"], ["project", "finding"]],
     ["to", "reason", "kind", "definitionVersion"]],
    ["taskresolve", "per-item", "items", [["id"]], []],
    ["taskforward", "per-item", "items", [["id"]], ["to"]],
    ["resolve", "per-item", "items", [["captureSha"], ["captureSha", "ref"]], ["ref"]],
  ]);
});

/* R2 as folded (K211, K221): K221 adds `triage` and `reevaluationrecord` to the reasoned rung; K264 layer 9's seven
   (restored in T9 with N216), K309; N310 `determine` (conformance's N233). */
/* DEC-88's three bands (K1038, J1), word for word as R2 lists them, and K1019's and K1023's four T22 acts. */
const DEC88 = {
  reversible: ["suggest", "extractpropose", "contradictionpropose", "themepropose", "standardpropose", "comparisonpropose",
    "theorypropose", "actionriskpropose", "actionlawspropose", "filingprepare", "contentmint", "casedraft", "reviewcomment",
    "taskforward", "taskresolve", "thread", "connectionchoose", "themedeclare", "themeplace", "entityalias", "goallink",
    "versionkeep", "airunopen", "airunclose", "projectfork"],
  reasoned: ["testify", "lead", "leadlook", "leadshare", "transcribe", "transcriptionattest", "attesttext", "resolve",
    "resolvetestify", "entitycreate", "versionadopt", "progressiondefine", "goaldeclare", "aspirationdeclare",
    "aspirationdeadend", "objectivecondition", "biasadopt", "strengthbar", "standarddeclare", "standardadopt",
    "consequencerecord", "actioncorrespond", "filingsent", "escalationopen", "escalationattach", "counselpacket",
    "attribute", "statementack", "workobjective", "inboxresolve"],
  terminal: ["escalationend", "filingapprove"],
};
const T22_REASONED = ["declinetoescalate", "heldsetaside", "heldrestore", "addressfrequencyset"];
const bandsOf = (rungs) => {
  const got = {};
  for (const [op, r] of Object.entries(rungs)) (got[r] ??= []).push(op);
  for (const k of Object.keys(got)) got[k].sort();
  return got;
};
test("R2 R35: the rung ladder, low to high, and RUNGS' assignment — DEC-88's three bands word for word among them — with "
   + "its negative controls: an op moved to the wrong band, or one of the 57 left out of RUNGS, is seen", () => {
  assert.deepEqual(RUNG_LADDER, ["reversible", "reasoned", "terminal", "attested", "irreversible"]);
  assert.deepEqual([DEC88.reversible.length, DEC88.reasoned.length, DEC88.terminal.length], [25, 30, 2]);
  const want = {
    irreversible: ["publish"],
    attested: ["attest", "caseratify", "ratify", "reattest", "captureaccount" /* N364 */, "noticepost" /* R32 */,
      "docketpost" /* R34 */],
    terminal: ["retire", "actionholdrelease" /* R33: a named exception to R27 */],
    reversible: ["actionlaws", "cite", "escalationresume", "projectvisibilityset", "versionaccept", "versioncurrent",
      "versionhide", "versionrevert", "sourceconsentwithdraw" /* N364, K558 */, "scenarioset" /* K727 */],
    reasoned: ["actionmove", "actionrisktier", "addressedrecord", "adminremove", "aliaswithdraw", "aspirationdepart",
      "aspirationretire", "biasdebtresolve", "conclude", "connectionassert", "consequencerevise", "determine", "discharge", "dispose",
      "escalationadvance", "escalationdecline", "escalationevaluate", "escalationsuspend", "filemembershipjudge", "goalclose",
      "inquirydivide", "inquiryground", "narrow", "projectownerremove", "projectownerrescue", "proposedispose",
      "reevaluationrecord", "reinstate", "relationdeclare", "relationwithdraw", "release", "reopen", "sever",
      "themewithdraw", "triage", "versionconsider", "versionreject", "withdrawconclusion",
      /* N345 (K447): contradiction's four member acts that ask an account, and entities' defect report */
      "contradictionclarify", "contradictiondismiss", "contradictionresolve", "contradictiontakeup", "resolutiondefect",
      /* N364: the member's acts on a source's history */
      "sourcedisclose", "sourcelink", "sourceconsent",
      /* K727: action-plans' acts that ask the member's reason */
      "plansubjectadd", "plansubjectremove", "optionrevise", "optiondispose", "planclose",
      /* K918: actions R52's hold statement */
      "actionhold",
      /* R30: a template's retirement and a member's act on a local fact */
      "templateretire", "factconfirm", ...DEC88.reasoned, ...T22_REASONED,
      /* R34: the docket's filing and the manager's decline */
      "docketfile", "docketdecline",
      /* R35: DEC-96's four reasoned acts on an imported case */
      "importaccept", "importacceptwithdraw", "importflag", "importflagclear"],
  };
  want.reversible.push(...DEC88.reversible);
  want.terminal.push(...DEC88.terminal);
  for (const k of Object.keys(want)) want[k].sort();
  assert.deepEqual(bandsOf(RUNGS), want);
  /* negative controls: the same comparison sees a misbanded op and an op left unranked */
  assert.notDeepEqual(bandsOf({ ...RUNGS, testify: "reversible" }), want);
  const { suggest, ...withoutOne } = RUNGS;
  assert.equal(suggest, "reversible");
  assert.notDeepEqual(bandsOf(withoutOne), want);
  for (const op of [...DEC88.reversible, ...DEC88.reasoned, ...DEC88.terminal, ...T22_REASONED])
    assert.ok(!Object.hasOwn(RUNG_ABSENT, op), `${op} left RUNG_ABSENT`);
});

test("R2: the correction path states that correction moves forward and nothing is erased (DEC-19)", () => {
  assert.match(IRREVERSIBLE_CORRECTION_PATH, /FORWARD/);
  assert.match(IRREVERSIBLE_CORRECTION_PATH, /edition/);
  assert.match(IRREVERSIBLE_CORRECTION_PATH, /withdrawal/);
  assert.match(IRREVERSIBLE_CORRECTION_PATH, /Nothing is\s+erased/);
});

test("R3: RUNG_ABSENT names each op with one ground of RUNG_ABSENCE_GROUNDS, each ground carries its sentence, "
   + "and no op is in both RUNGS and RUNG_ABSENT", () => {
  assert.deepEqual(Object.keys(RUNG_ABSENCE_GROUNDS).sort(),
    ["caller-owned", "credential", "observational", "substrate", "undetermined"]);
  for (const s of Object.values(RUNG_ABSENCE_GROUNDS)) assert.ok(typeof s === "string" && s.length > 40);
  for (const [op, e] of Object.entries(RUNG_ABSENT)) {
    assert.ok(Object.hasOwn(RUNG_ABSENCE_GROUNDS, e.ground), `${op}: ${e.ground}`);
    assert.ok(typeof e.is === "string" && e.is.length > 0, op);
  }
  assert.deepEqual(Object.keys(RUNGS).filter((op) => Object.hasOwn(RUNG_ABSENT, op)), []);
});

test("R3 R12: against a table of every op the catalogue classifies, with each rung-classified op mutating, nothing is "
   + "unaccounted — the tables are consistent with one another", () => {
  const ops = new Set([...Object.keys(NON_ACTS), ...ACTS.map((a) => a.id), ...Object.keys(RUNGS), ...Object.keys(RUNG_ABSENT)]);
  const table = [...ops].map((op) => ({ op, mutating: Object.hasOwn(RUNGS, op) || Object.hasOwn(RUNG_ABSENT, op),
    gated: Object.hasOwn(NON_ACTS, op) || ACTS.some((a) => a.id === op) }));
  assert.deepEqual(A.unaccounted(table), { unpublished: [], unranked: [], stale: [] });
  assert.deepEqual(ACTS.map((a) => a.id).filter((id) => !Object.hasOwn(RUNGS, id) && !Object.hasOwn(RUNG_ABSENT, id)), []);
});

test("R4: VOCABULARIES carries exactly the named vocabularies", () => {
  assert.deepEqual(Object.keys(VOCABULARIES).sort(), ["action_kind", "law_levels", "dispositions", "subject_positions",
    "basis_roles", "entity_kinds", "relation_kinds", "stage_requiredness", "action_basis_kinds",
    "correspondence_directions", "correspondence_stages", "correspondence_outcomes", "resolutions", "risk_tiers",
    "version_states", "version_edges", "version_reason_required", "rung_ladder", "rung_correction_path",
    "rung_absence_grounds", "rung_consequences" /* R31 */, "sufficiency_claim_states", "content_mint_states",
    /* N345 */ "contradiction_coordinates", "plurality_differences", "resolution_kinds", "norm_canons",
    "dismissal_reasons",
    /* R30 */ "template_states", "template_uses", "template_review_outcomes", "local_fact_acts",
    "local_fact_statuses",
    /* R34 */ "docket_shelves", "docket_entry_kinds", "docket_proposals", "docket_pressure_kinds"].sort());
});

test("R4: each fixed value is the very object its enforcing module refuses against — the same reference, never a copy", () => {
  const same = [
    ["law_levels", actionGrammar.LAW_LEVELS], ["dispositions", inquiry.DISPOSITIONS],
    ["subject_positions", ratification.SUBJECT_POSITIONS], ["basis_roles", inquiry.BASIS_ROLES],
    ["entity_kinds", entities.ENTITY_KINDS], ["relation_kinds", entities.RELATION_KINDS],
    ["stage_requiredness", progressions.STAGE_REQUIREDNESS], ["action_basis_kinds", actionGrammar.ACTION_BASIS_KINDS],
    ["correspondence_directions", actionGrammar.CORRESPONDENCE_DIRECTIONS],
    ["correspondence_stages", actionGrammar.CORRESPONDENCE_STAGES], ["correspondence_outcomes", actionGrammar.CORRESPONDENCE_OUTCOMES],
    ["resolutions", actionGrammar.RESOLUTIONS], ["risk_tiers", actionGrammar.RISK_TIERS],
    ["version_states", basisVersions.VERSION_MACHINE.legal], ["version_edges", basisVersions.VERSION_MACHINE.edges],
    ["version_reason_required", basisVersions.VERSION_REASON_REQUIRED], ["rung_ladder", RUNG_LADDER],
    ["rung_correction_path", IRREVERSIBLE_CORRECTION_PATH], ["rung_absence_grounds", RUNG_ABSENCE_GROUNDS],
    ["rung_consequences", A.CONSEQUENCE_STATEMENTS] /* R31: this module's own */,
    ["sufficiency_claim_states", basisVersions.SUFFICIENCY_CLAIM_STATES], ["content_mint_states", content.CONTENT_MINT_STATES],
    /* N345: inquiry R46's frozen vocabularies and contradiction R31's dismissal reasons */
    ["contradiction_coordinates", inquiry.CONTRADICTION_COORDINATES], ["plurality_differences", inquiry.PLURALITY_DIFFERENCES],
    ["resolution_kinds", inquiry.RESOLUTION_KINDS], ["norm_canons", inquiry.NORM_CANONS],
    ["dismissal_reasons", contradiction.DISMISSAL_REASONS],
    /* R30: filing-templates R21's three and local-facts R7's two */
    ["template_states", filingTemplates.TEMPLATE_STATES], ["template_uses", filingTemplates.TEMPLATE_USES],
    ["template_review_outcomes", filingTemplates.REVIEW_OUTCOMES], ["local_fact_acts", localFacts.LOCAL_FACT_ACTS],
    ["local_fact_statuses", localFacts.LOCAL_FACT_STATUSES],
    /* R34: docket R1, R2, R6's four */
    ["docket_shelves", docket.SHELVES], ["docket_entry_kinds", docket.ENTRY_KINDS], ["docket_proposals", docket.PROPOSALS],
    ["docket_pressure_kinds", docket.PRESSURE_KINDS],
  ];
  assert.deepEqual(same.filter(([k, v]) => VOCABULARIES[k] !== v).map(([k]) => k), []);
  assert.equal(same.length + 1, Object.keys(VOCABULARIES).length, "every key but action_kind is a fixed value checked here");
});

/* R26: the kinds come from actions at the moment of the call (its R10, R40), through action-grammar's `actionKinds` (its
   R1), the reader actions answers with; the tiers are action-grammar's (K768). Every
   profile the jurisdictions module lists is taken alone and all together, so a view that adds kinds is exercised. */
const views = () => {
  const ids = profiles().map((p) => p.id);
  const out = [["no profile active", null]];
  for (const id of ids) { const c = combine([id]); if (c && c.ok) out.push([id, c.view]); }
  const all = combine(ids); if (all && all.ok) out.push([ids.join("+"), all.view]);
  return out;
};
test("R26 R4: risk_tiers is action-grammar's RISK_TIERS (the same reference), and action_kind, with no instance to ask, "
   + "is actions' answer with no profile active — the product's kinds alone, no kind held here", () => {
  assert.equal(VOCABULARIES.risk_tiers, actionGrammar.RISK_TIERS);
  assert.deepEqual(VOCABULARIES.action_kind, actionGrammar.actionKinds(null));
  assert.equal(VOCABULARIES.action_kind, actionGrammar.PRODUCT_KINDS);
});

test("R26 R4: vocabulariesFor(kinds) publishes as action_kind exactly the kinds actions answers for the instance's view, "
   + "the product's kinds then the profiles', and every other vocabulary as the same object", () => {
  const vs = views();
  assert.ok(vs.some(([, v]) => actionGrammar.actionKinds(v).length > actionGrammar.PRODUCT_KINDS.length),
    "some profile adds a kind, so the instrument sees the view");
  for (const [name, view] of vs) {
    const kinds = actionGrammar.actionKinds(view);
    const v = A.vocabulariesFor(kinds);
    assert.deepEqual(v.action_kind, kinds, name);
    assert.deepEqual(v.action_kind.slice(0, actionGrammar.PRODUCT_KINDS.length), [...actionGrammar.PRODUCT_KINDS], name);
    assert.deepEqual(Object.keys(v), Object.keys(VOCABULARIES), name);
    for (const k of Object.keys(VOCABULARIES)) if (k !== "action_kind") assert.equal(v[k], VOCABULARIES[k], `${name}: ${k}`);
  }
  for (const bad of [undefined, null, [], "records_request", [1], [""], [null]])
    assert.equal(A.vocabulariesFor(bad).action_kind, actionGrammar.PRODUCT_KINDS, JSON.stringify(bad));
});

test("R26: no action kind is held in this module — none of the action grammar's own kinds beyond the product's, and no profile's, appears in its "
   + "published text or tables", () => {
  const local = actionGrammar.ACTION_KINDS.filter((k) => !actionGrammar.PRODUCT_KINDS.includes(k));
  const fromProfiles = views().flatMap(([, v]) => actionGrammar.actionKinds(v)).filter((k) => !actionGrammar.PRODUCT_KINDS.includes(k));
  const kinds = [...new Set([...local, ...fromProfiles])];
  assert.ok(kinds.length > 0, "the instrument has kinds to look for");
  const text = JSON.stringify(outward());
  assert.deepEqual(kinds.filter((k) => text.includes(k)), []);
});

test("R5: inquirydivide carries DIVIDE_PROMPT, inquiryground GROUND_PROMPT, attest ATTEST_FENCE, publish "
   + "SELF_ATTESTED_PROMPT and sourceconsent CONSENT_PROMPT, and every other act's prompt is null", () => {
  const prompts = Object.fromEntries([...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS]
    .map((a) => [a.id, A.decorate(a, null).prompt]));
  const WANT = { inquirydivide: A.DIVIDE_PROMPT, inquiryground: A.GROUND_PROMPT, attest: A.ATTEST_FENCE,
                 publish: A.SELF_ATTESTED_PROMPT, sourceconsent: A.CONSENT_PROMPT };
  for (const [id, p] of Object.entries(WANT)) assert.equal(prompts[id], p, id);
  assert.deepEqual(Object.entries(prompts).filter(([id, p]) => !(id in WANT) && p !== null).map(([id]) => id), []);
  for (const p of Object.values(WANT)) assert.ok(typeof p === "string" && p.length > 100);
});

/* R28 (N364): DEC-81 item 3's sentence "stated for readers", read out of DECISIONS.md, and the very string
   case-authoring's case document prints beside a self-attested capture (its R36). */
import * as caseAuthoring from "../../../src/case-authoring/index.mjs";
import * as sources from "../../../src/sources/index.mjs";
const DECISIONS = () => readFileSync(fileURLToPath(new URL("../../../../docs/development/DECISIONS.md", import.meta.url)), "utf8");
test("R28: SELF_ATTESTED_PROMPT is DEC-81 item 3's reader sentence, verbatim, and case-authoring's own string (R36)", () => {
  const dec = DECISIONS();
  const at = dec.indexOf("### DEC-81");
  assert.ok(at > 0, "DEC-81 is in DECISIONS.md");
  const lead = "Why it matters, stated for readers: ";
  const from = dec.indexOf(lead, at);
  assert.ok(from > at && from < dec.indexOf("### DEC-82"), "item 3's reader sentence is in DEC-81");
  const rest = dec.slice(from + lead.length);
  const sentence = rest.slice(0, rest.indexOf("\n")).trim();
  assert.equal(A.SELF_ATTESTED_PROMPT, sentence[0].toUpperCase() + sentence.slice(1));
  assert.equal(A.SELF_ATTESTED_PROMPT, caseAuthoring.SELF_ATTESTED_SENTENCE, "the same string, not a copy that agrees");
  assert.equal(ACTS.find((a) => a.id === "publish").prompt, A.SELF_ATTESTED_PROMPT);
});

/* R29 (N364): DEC-78 item 5(d), stated in the two sentences sources' consent acts answer with (its R7). */
test("R29: CONSENT_PROMPT states that consent to publish is permanent for what is published, and that a withdrawal "
   + "binds only later publications — sources' own two statements", () => {
  const p = A.CONSENT_PROMPT;
  assert.match(p, /consent is permanent for anything published under it/);
  assert.match(p, /stays published, even if the consent is later withdrawn/);
  assert.match(p, /withdrawal binds only later publications/);
  assert.equal(p, `${sources.CONSENT_STATEMENT} ${sources.WITHDRAWAL_STATEMENT}`);
  assert.equal(ACTS.find((a) => a.id === "sourceconsent").prompt, p);
  const dec = DECISIONS();
  assert.match(dec.slice(dec.indexOf("### DEC-78"), dec.indexOf("### DEC-79")),
    /\(d\) Consent to go public is asked at the moment of publishing, stated as permanent; a source may withdraw consent for future publications, and what is published stays published\./);
});

test("R5: ATTEST_FENCE is DEC-39's wording verbatim, its two letters composed from the capture ceiling and the grade above it", () => {
  const dec = readFileSync(fileURLToPath(new URL("../../../../docs/development/DECISIONS.md", import.meta.url)), "utf8");
  const at = dec.indexOf("> **What co-attestation answers:**");
  assert.ok(at > 0, "DEC-39's wording is in DECISIONS.md");
  const lines = dec.slice(at).split("\n").map((l) => l.trimStart());
  const quote = lines.slice(0, lines.findIndex((l) => !l.startsWith(">"))).map((l) => l.replace(/^>\s?/, "")).join(" ").replace(/\*\*?/g, "").replace(/\s+/g, " ").trim();
  const above = BASIS_GRADES[BASIS_GRADES.indexOf(EARNED_CAPTURE_CEILING) - 1];
  assert.equal(UNREACHABLE_CAPTURE_GRADE, above);
  assert.equal(A.ATTEST_FENCE, A.attestFence(EARNED_CAPTURE_CEILING, above));
  assert.equal(A.attestFence("B", "A"), quote, "Bob's sentence at the ruled letters");
  assert.equal(A.attestFence("C", "B"), quote.replace("Grade B capture", "Grade C capture").replace("Grade A", "Grade B"));
});

test("R5: the fence's composer throws when either letter is absent; op=acquire's note is capture's and no copy of it "
   + "is held here (N80)", () => {
  for (const [c, u] of [[null, "A"], ["B", null], [undefined, undefined], ["", "A"], ["B", ""]])
    assert.throws(() => A.attestFence(c, u));
  assert.equal(A.acquireGradeNote, undefined);
  assert.equal(A.ACQUIRE_GRADE_NOTE, undefined);
});

test("R5: GROUND_PROMPT and every label use none of AND, OR, disjunction, branch or ground (DEC-32 clause 1)", () => {
  const texts = [["GROUND_PROMPT", A.GROUND_PROMPT], ...[...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].map((a) => [a.id, a.label])];
  const bad = texts.filter(([, t]) => /\bAND\b|\bOR\b/.test(t) || /\bdisjunctions?\b|\bbranch(es)?\b|\bground(s|ed|ing)?\b/i.test(t));
  assert.deepEqual(bad, []);
});

test("R6: DISPOSITIONS is inquiry's, STAGE_REQUIREDNESS progressions', ENTITY_KINDS and RELATION_KINDS entities', "
   + "REOPENABLE_FROM promotion's and PER_ITEM_MAX record-core's, re-exported unchanged", () => {
  assert.equal(A.DISPOSITIONS, inquiry.DISPOSITIONS);
  assert.equal(A.STAGE_REQUIREDNESS, progressions.STAGE_REQUIREDNESS);
  assert.equal(A.ENTITY_KINDS, entities.ENTITY_KINDS);
  assert.equal(A.RELATION_KINDS, entities.RELATION_KINDS);
  assert.equal(A.REOPENABLE_FROM, promotion.REOPENABLE_FROM);
  assert.equal(A.PER_ITEM_MAX, recordCore.PER_ITEM_MAX);
  assert.equal(A.PER_ITEM_MAX, 100);
});

test("R7: MACHINE_REFUSALS maps exactly the acts R7 names, withdrawconclusion to MACHINE_CANNOT_CONCLUDE and the six "
   + "version acts to MACHINE_CANNOT_MOVE_VERSION", () => {
  const VERSION = ["versionaccept", "versionreject", "versionconsider", "versionrevert", "versioncurrent", "versionhide"];
  assert.deepEqual(Object.keys(MACHINE_REFUSALS).sort(), ["release", "conclude", "withdrawconclusion", "reopen", "publish",
    "inquirydivide", "inquiryground", "actionmove", "actioncorrespond", "actionlaws", "actionrisktier", ...VERSION,
    "contradictionresolve"].sort());
  assert.equal(MACHINE_REFUSALS.contradictionresolve, "MACHINE_CANNOT_ACT_ON_CANDIDATE");
  assert.equal(MACHINE_REFUSALS.withdrawconclusion, "MACHINE_CANNOT_CONCLUDE");
  assert.equal(MACHINE_REFUSALS.conclude, "MACHINE_CANNOT_CONCLUDE");
  for (const v of VERSION) assert.equal(MACHINE_REFUSALS[v], "MACHINE_CANNOT_MOVE_VERSION");
  for (const c of Object.values(MACHINE_REFUSALS)) assert.match(c, /^MACHINE_[A-Z_]+$/);
});

test("R7: NON_ACTS gives every op it names a reason, names no act, and a reason begins `capture-directed:` exactly "
   + "for the members of CAPTURE_ACTS", () => {
  for (const [op, r] of Object.entries(NON_ACTS)) assert.ok(typeof r === "string" && r.length > 10, op);
  assert.deepEqual(ACTS.map((a) => a.id).filter((id) => Object.hasOwn(NON_ACTS, id)), []);
  assert.deepEqual(Object.keys(NON_ACTS).filter((op) => NON_ACTS[op].startsWith("capture-directed:")).sort(),
    ids(CAPTURE_ACTS));
});

test("R19 R33: `terminal` is given only while STATES.information.edges.retired is empty — to retire, DEC-88's two and "
   + "R33's named exception actionholdrelease — and `irreversible` only to publish", () => {
  const terminal = Object.keys(RUNGS).filter((op) => RUNGS[op] === "terminal");
  assert.deepEqual(STATES.information.edges.retired, []);
  assert.deepEqual(terminal.sort(), ["actionholdrelease", "escalationend", "filingapprove", "retire"]);
  assert.deepEqual(Object.keys(RUNGS).filter((op) => RUNGS[op] === "irreversible"), ["publish"]);
});

test("R19: the justification family names only codes that ask the member for an account, and holds the "
   + "codes the reasoned ops refuse with", () => {
  for (const c of JUSTIFICATION_REFUSALS) assert.match(c, /^[A-Z_]+$/);
  assert.ok(JUSTIFICATION_REFUSALS.includes("NO_EVIDENCE"), "N364 (R2): a source act's account is its evidence");
  for (const c of ["NO_REASON", "VERSION_NO_REASON", "NO_ACKNOWLEDGMENT", "NO_MITIGATION", "NO_CONCLUSION",
    "NO_FALSIFIER", "NO_JUSTIFICATION", "THEME_WITHDRAW_NO_REASON", "FILE_MEMBERSHIP_NO_REASON",
    "CONNECTION_ASSERT_NO_BASIS", "NO_LESSON", "BIAS_DEBT_NO_REASON", "RISK_TIER_REASON_REFUSED", "NARROW_NO_DESCRIPTION", "REEVALUATION_NOTE_MALFORMED",
    "ACTION_MOVE_NO_REASON" /* N310: actions R13 */,
    "INTENT_NO_REASON", "CONFORMANCE_NO_REASON", "ESCALATION_NO_REASON" /* K823, K834, K835 */,
    "TEMPLATE_REASON_REFUSED", "FACT_HOW_REFUSED" /* R30 */])
    assert.ok(JUSTIFICATION_REFUSALS.includes(c), c);
  for (const c of ["NO_TARGET", "NO_ID", "NO_KIND", "ENTITY_NO_LABEL", "PROGRESSION_NO_LABEL", "EXPERTISE_NO_LABEL",
    "NO_SUCH_KNOCK", "NO_SUCH_COMPARISON", "NOT_AN_ADMIN", "NO_CITATION", "NO_BODY", "NO_TITLE"])
    assert.ok(!JUSTIFICATION_REFUSALS.includes(c), c);
});

test("R24: no decorated act, capture act or set act reaches a caller with a null rung and a null rung_absence", () => {
  const all = [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].map((a) => A.decorate(a, null));
  assert.deepEqual(all.filter((d) => d.rung === null && d.rung_absence === null).map((d) => d.id), []);
  assert.deepEqual(all.filter((d) => d.rung !== null && d.rung_absence !== null).map((d) => d.id), []);
});

/* R25: the places come from the jurisdiction profiles' own data, never a list typed here. */
const placeTerms = () => {
  const terms = new Set();
  for (const { id } of profiles()) {
    const p = profile(id);
    for (const c of p.covers ?? []) {
      terms.add(c);
      terms.add(c.replace(/^(City|County|Town|Port) of /, "").replace(/ (County|City)$/, ""));
    }
    const walk = (o, d = 0) => {
      if (!o || typeof o !== "object" || d > 4) return;
      for (const [k, v] of Object.entries(o)) {
        if (typeof v === "string" && /^(name|label)$/.test(k)) {
          for (const m of v.matchAll(/\(([^)]+)\)/g)) terms.add(m[1]);
          const lead = /^([A-Z][A-Za-z.]+),/.exec(v); if (lead) terms.add(lead[1]);
        } else walk(v, d + 1);
      }
    };
    walk(p.spaces); walk(p.systems);
  }
  return [...terms].filter((t) => t.length > 2);
};
const outward = () => {
  const out = [];
  const add = (where, v) => { if (typeof v === "string") out.push([where, v]);
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) add(`${where}.${k}`, x); };
  for (const a of [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS]) { add(`${a.id}.label`, a.label); add(`${a.id}.prompt`, a.prompt); }
  add("NON_ACTS", NON_ACTS); add("RUNG_ABSENT", RUNG_ABSENT); add("RUNG_ABSENCE_GROUNDS", RUNG_ABSENCE_GROUNDS);
  add("IRREVERSIBLE_CORRECTION_PATH", IRREVERSIBLE_CORRECTION_PATH);
  add("VOCABULARIES", VOCABULARIES); add("MACHINE_REFUSALS", MACHINE_REFUSALS);
  return out;
};
test("R25: no place any jurisdiction profile names appears in this module's outward text, NON_ACTS.idmatch included", () => {
  const terms = placeTerms();
  assert.ok(terms.includes("Oakland") && terms.includes("Legistar") && terms.includes("APN") && terms.includes("C.M.S."),
    `the instrument reads the profiles (${terms.join(", ")})`);
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hits = [];
  for (const [where, text] of outward())
    for (const t of terms) if (new RegExp(`(^|[^A-Za-z])${esc(t)}([^A-Za-z]|$)`).test(text)) hits.push(`${where}: ${t}`);
  assert.deepEqual(hits, []);
  assert.ok(typeof NON_ACTS.idmatch === "string" && NON_ACTS.idmatch.length > 40);
});

/* R27 as ruled (K211): of the 42 ops graded `undetermined` before T7, three moved to `reasoned` and four to
   `reversible`; the other 34 stay, with intent's seven graded on the same rule (K211 Q4). Whether each `reasoned`
   op really refuses without an account is R19's drive (plane.test.mjs, backing.test.mjs). */
const R27_LEFT = ["inboxpull", "contradictionrecommend", "contradictionoptin", "contradictionrespond", "communicationprepare",
  "templatesave", "actioncreate", "actionpressure", "planopen", "optionadd", "optionpropose", "optionadopt",
  "checkpointrecord", "optionstart", "templatedraft", "templaterevise", "templatepropose", "templatesubmit",
  "templatereview", "templatecomment", "templateapprove"];
const undeterminedOf = (absent) => Object.keys(absent).filter((op) => absent[op].ground === "undetermined").sort();
test("R27 R32 R34 R35: no op is graded `undetermined` that the rulings moved (K211, DEC-88), and exactly the 21 R27 names "
   + "remain `undetermined`, with R32's whatchangedpropose, R34's docketpressure and R35's caseimport and "
   + "caseimportdocument beside them — R27's count reads 25 with them; one of DEC-88's 57 left there is seen", () => {
  const moved = { biasdebtresolve: "reasoned", actionrisktier: "reasoned", narrow: "reasoned", versionaccept: "reversible",
    versioncurrent: "reversible", actionlaws: "reversible", projectvisibilityset: "reversible" };
  for (const [op, r] of Object.entries(moved)) { assert.equal(RUNGS[op], r, op); assert.ok(!Object.hasOwn(RUNG_ABSENT, op), op); }
  /* R32 (T23) and R34 (T27) each grade one more op `undetermined` on R27's rule, after R27's count, and R35 (T28) two */
  const LATER = ["whatchangedpropose", "docketpressure", "caseimport", "caseimportdocument"];
  const undetermined = undeterminedOf(RUNG_ABSENT).filter((op) => !LATER.includes(op));
  for (const op of LATER) assert.equal(RUNG_ABSENT[op]?.ground, "undetermined", op);
  assert.deepEqual(undetermined, [...R27_LEFT].sort());
  assert.equal(undetermined.length, 21, "R27's count: DEC-88 moved 57 of the 78 into RUNGS");
  assert.equal(undeterminedOf(RUNG_ABSENT).length, 25, "R35: R27's count reads 25 with R32's, R34's and R35's");
  /* the 78 held before DEC-88: the 21 and the 57 together, each of the 57 now ranked in RUNGS */
  const before78 = ["inboxresolve", "taskforward", "taskresolve", "actioncorrespond", "actionlawspropose",
    "projectfork", "biasadopt", "strengthbar", "entitycreate", "entityalias", "resolve", "attesttext", "thread",
    "airunopen", "airunclose", "suggest", "contentmint", "extractpropose", "connectionchoose", "transcribe",
    "transcriptionattest", "testify", "lead", "leadshare", "attribute", "casedraft", "reviewcomment", "statementack",
    "leadlook", "themedeclare", "themeplace", "themepropose", "progressiondefine", "resolvetestify",
    "contradictionpropose", "objectivecondition", "goaldeclare", "goallink", "aspirationdeclare", "aspirationdeadend",
    "workobjective", "versionadopt", "versionkeep", "actionriskpropose" /* T8 layer 11: actions R28's proposal */,
    /* K264: layer 9's fifteen, restored in T9 with N216; `determine` left for `reasoned` (N310) */
    "standarddeclare", "standardpropose", "standardadopt", "comparisonpropose", "consequencerecord",
    "filingprepare", "filingapprove", "filingsent", "counselpacket", "theorypropose", "escalationopen",
    "escalationattach", "escalationend",
    /* N345 (K481): the recommendation, the opt-in and the response */
    "contradictionrecommend", "contradictionoptin", "contradictionrespond",
    /* N364: the pull */
    "inboxpull",
    /* K705, K709: filings' and actions' new writes */
    "communicationprepare", "templatesave", "actioncreate", "actionpressure",
    /* K727: action-plans' six */
    "planopen", "optionadd", "optionpropose", "optionadopt", "checkpointrecord", "optionstart",
    /* R30: K921's seven */
    "templatedraft", "templaterevise", "templatepropose", "templatesubmit", "templatereview", "templatecomment",
    "templateapprove"].sort();
  assert.equal(before78.length, 78);
  const moved57 = before78.filter((op) => !R27_LEFT.includes(op));
  assert.deepEqual(moved57.sort(), [...DEC88.reversible, ...DEC88.reasoned, ...DEC88.terminal].sort());
  for (const op of moved57) assert.ok(Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  /* negative control: one of the 57 left in RUNG_ABSENT reads a different count */
  const left = { ...RUNG_ABSENT, suggest: { ground: "undetermined", is: "x" } };
  assert.notDeepEqual(undeterminedOf(left), [...R27_LEFT].sort());
});

test("R27: no new rung is added — the ladder keeps its five", () => {
  assert.deepEqual(RUNG_LADDER, ["reversible", "reasoned", "terminal", "attested", "irreversible"]);
  assert.ok(Object.values(RUNGS).every((r) => RUNG_LADDER.includes(r)));
});

/* K208 (2), K264, T9 with N216: every op layers 7–10 add is accounted for, keyed to each module's op map, now the
   durable object dispatches layer 9's (legacy-store's N216, K307). Layer 9's 22 mutating ops each carry a NON_ACTS
   row and a rung or a stated absence exactly as AFFORDANCES #2's record states them; its reads carry none (a read has
   no NEEDS row, K153, so a row would read `stale`). actions' `actionriskpropose` keeps its row; monitoring's
   `monitoring`, a read, is named nowhere. K705, K709 (T18): filings' `communicationprepare` and `templatesave` and
   actions' `actioncreate` and `actionpressure` join the writes, `action` and `actions` the reads. K992 (T21): `templates`
   left filings' op map for filing-templates' (its R14), whose ops R30 grades in the test after this one. N490 (T24):
   action-plans' `optionstartpreview` (its R37) is a read the control plane gates as the act it previews, stamped `author`
   and `viewer`, so it is the one layer-9 read with a `NEEDS` row and takes a `NON_ACTS` reason by R7's rule. */
import { standardsOps } from "../../../src/standards/index.mjs";
import { conformanceOps } from "../../../src/conformance/index.mjs";
import { consequencesOps } from "../../../src/consequences/index.mjs";
import { filingsOps } from "../../../src/filings/index.mjs";
import { actionsOps } from "../../../src/actions/index.mjs";
import { actionPlansOps } from "../../../src/action-plans/index.mjs";
import { actionClocksOps } from "../../../src/action-clocks/index.mjs";
const LAYER9_RUNGS = {
  /* DEC-88 (K1038): layer 9's thirteen that were `undetermined` */
  standarddeclare: "reasoned", standardpropose: "reversible", standardadopt: "reasoned", comparisonpropose: "reversible",
  consequencerecord: "reasoned", filingprepare: "reversible", filingapprove: "terminal", filingsent: "reasoned",
  counselpacket: "reasoned", theorypropose: "reversible", escalationopen: "reasoned", escalationattach: "reasoned",
  escalationend: "terminal",
  consequencerevise: "reasoned", addressedrecord: "reasoned", escalationevaluate: "reasoned",
  escalationadvance: "reasoned", escalationdecline: "reasoned", escalationsuspend: "reasoned",
  escalationresume: "reversible",
  determine: "reasoned",   // N310, with conformance's N233
  /* K727: action-plans' (its R4, R9, R13, R14, R20) */
  plansubjectadd: "reasoned", plansubjectremove: "reasoned", optionrevise: "reasoned", optiondispose: "reasoned",
  planclose: "reasoned", scenarioset: "reversible",
  actionhold: "reasoned",   // K918: actions R52
};
const LAYER9_ABSENT = {
  counselpacketexport: "substrate",
  communicationprepare: "undetermined", templatesave: "undetermined",   // K705: filings R23, R26
  actioncreate: "undetermined", actionpressure: "undetermined",         // K709: actions R47, R48
  /* K727: action-plans' six, and action-clocks' two reminders (a member's own request, `queuesnooze`'s ground) */
  planopen: "undetermined", optionadd: "undetermined", optionpropose: "undetermined", optionadopt: "undetermined",
  checkpointrecord: "undetermined", optionstart: "undetermined",
  reminderset: "caller-owned", reminderanswer: "caller-owned",
};
const LAYER9_READS = ["standard", "standards", "standardinforce", "determination", "determinations", "comparison",
  "comparisonfacts" /* conformance R21 (N345), an ungated read like `comparison` */,
  "consequence", "consequencesof", "addressed", "counselpacketread", "filingsfor", "availableactions", "escalation",
  "escalationsdue", "action", "actions" /* K709: actions R47 */,
  "plan", "plans", "planproposals" /* K727: action-plans R6, R7, R34 */];
const LAYER9_GATED_READS = ["optionstartpreview" /* N490: action-plans R37 */];
/* actions' op map holds acts and reads catalogued long before layer 9; only the ops K709 adds join this set. */
const ACTIONS_NEW = ["actioncreate", "actionpressure", "actionhold" /* K902 */, "action", "actions"];
test("R3 R7 R12: layer 9's 41 mutating ops each carry a NON_ACTS reason and their ruled rung or stated absence, its "
   + "20 ungated reads none, its one gated read (optionstartpreview, N490) a `read:` reason and no rung, and the op maps "
   + "hold exactly those 62 ops (K264; conformance's comparisonfacts, N345; K705, K709, K727, K902; K992: `templates` is "
   + "filing-templates')", () => {
  const url = new URL("http://x/");
  const keys = (f) => Object.keys(f({}, url, {}));
  const ESCALATION = ["escalationopen", "escalationattach", "escalationevaluate", "escalationadvance", "escalationdecline",
    "escalationend", "escalationsuspend", "escalationresume", "escalation", "escalationsdue"];
  const actions = keys(actionsOps);
  assert.deepEqual(ACTIONS_NEW.filter((op) => !actions.includes(op)), [], "actions' op map holds K709's four and K902's actionhold");
  const ops = [...keys(standardsOps), ...keys(conformanceOps), ...keys(consequencesOps), ...keys(filingsOps), ...ESCALATION,
               ...ACTIONS_NEW, ...keys(actionPlansOps), ...keys(actionClocksOps)];
  const mutating = [...Object.keys(LAYER9_RUNGS), ...Object.keys(LAYER9_ABSENT)];
  assert.equal(mutating.length, 41);
  assert.equal(LAYER9_READS.length, 20);
  assert.deepEqual([...ops].sort(), [...mutating, ...LAYER9_READS, ...LAYER9_GATED_READS].sort());
  for (const op of mutating) {
    assert.ok(typeof NON_ACTS[op] === "string" && NON_ACTS[op].length > 10 && !NON_ACTS[op].startsWith("capture-directed:"), op);
    assert.ok(!ACTS.some((a) => a.id === op), op);
  }
  for (const [op, r] of Object.entries(LAYER9_RUNGS)) { assert.equal(RUNGS[op], r, op); assert.ok(!Object.hasOwn(RUNG_ABSENT, op), op); }
  for (const [op, g] of Object.entries(LAYER9_ABSENT)) {
    assert.equal(RUNG_ABSENT[op]?.ground, g, op); assert.ok(!Object.hasOwn(RUNGS, op), op);
    assert.ok(typeof RUNG_ABSENT[op].is === "string" && RUNG_ABSENT[op].is.length > 20, op);
  }
  const named = (op) => Object.hasOwn(NON_ACTS, op) || Object.hasOwn(RUNGS, op) || Object.hasOwn(RUNG_ABSENT, op)
    || [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].some((a) => a.id === op);
  assert.deepEqual(LAYER9_READS.filter(named), []);
  /* N490 (R7): the gated read carries a `read:` reason in the form of the others, and no rung (R3 grades the ops that
     write), and is no act */
  for (const op of LAYER9_GATED_READS) {
    assert.ok(typeof NON_ACTS[op] === "string" && NON_ACTS[op].startsWith("read: ") && NON_ACTS[op].length > 40, op);
    assert.match(NON_ACTS[op], /writes nothing$/, op);
    assert.ok(!Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
    assert.ok(![...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].some((a) => a.id === op), op);
  }
  assert.ok(Object.hasOwn(NON_ACTS, "actionriskpropose"));
  assert.equal(RUNGS.actionriskpropose, "reversible", "DEC-88");
  assert.ok(!named("monitoring"));
  /* the control plane's rows for these ops, as op-declarations declares them (K263's routing, now its): gated and
     mutating for the writes, the reads ungated but the preview; nothing is unaccounted */
  const table = [...mutating.map((op) => ({ op, mutating: true, gated: true })),
    ...LAYER9_READS.map((op) => ({ op, mutating: false, gated: false })),
    ...LAYER9_GATED_READS.map((op) => ({ op, mutating: false, gated: true })),
    { op: "actionriskpropose", mutating: true, gated: true }, { op: "monitoring", mutating: false, gated: false }];
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => mutating.includes(op) || LAYER9_READS.includes(op)
    || LAYER9_GATED_READS.includes(op)), []);
  /* negative controls (N490): carried by no row or carried ungated, the gated read reads stale; an ungated read of
     action-plans carried gated, as the preview is, reads unpublished, so a gated read left unnamed is seen */
  for (const op of LAYER9_GATED_READS) {
    assert.ok(A.unaccounted([]).stale.includes(op), op);
    assert.ok(A.unaccounted([{ op, mutating: false, gated: false }]).stale.includes(op), op);
  }
  assert.deepEqual(A.unaccounted([{ op: "planproposals", mutating: false, gated: true }]).unpublished, ["planproposals"]);
});

/* N321 (T13, K424): `op=projectstage` (publication R44) is a read stamping `viewer`, carried as every project read is:
   not mutating and with no `NEEDS` row, `op=profiles`' precedent (K416). So it takes no rung (R3 grades the ops that
   write) and no `NON_ACTS` row (a row for an ungated op reads `stale`, R12), and no registry names it. */
test("R3 R7 R12: op=projectstage, an ungated read, is named in no registry, and a table carrying it as one leaves "
   + "nothing unaccounted; carried as mutating or gated, it would be named", () => {
  const named = (op) => Object.hasOwn(NON_ACTS, op) || Object.hasOwn(RUNGS, op) || Object.hasOwn(RUNG_ABSENT, op)
    || [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].some((a) => a.id === op);
  assert.equal(named("projectstage"), false);
  const row = { op: "projectstage", mutating: false, gated: false };
  assert.deepEqual(A.unaccounted([row]), A.unaccounted([]));
  const base = A.unaccounted([]);
  const r = A.unaccounted([{ ...row, gated: true }]);
  assert.deepEqual(r.unpublished, ["projectstage"]);
  assert.deepEqual(A.unaccounted([{ ...row, mutating: true }]).unranked, ["projectstage"]);
  assert.deepEqual(r.stale, base.stale);
});

/* N345 (K481, K490): contradiction's twelve new ops (its op map, beside `contradictionpropose` and `contradictionpairs`),
   entities' `resolutiondefect` (K485) and case-authoring's `publishtensions` (K498). The seven that write each carry a
   rung or a stated absence (R2, R3) and a `NON_ACTS` reason unless an act (R7); the reads R7 names carry a `NON_ACTS`
   reason, so the control plane gates each with a `NEEDS` row, as it gates `contradictionpairs` (R12). */
import { contradictionOps } from "../../../src/contradiction/index.mjs";
const N345_WRITES = { contradictiondismiss: "reasoned", contradictionclarify: "reasoned", contradictiontakeup: "reasoned",
  contradictionresolve: "reasoned", resolutiondefect: "reasoned",
  contradictionrecommend: "undetermined", contradictionoptin: "undetermined", contradictionrespond: "undetermined" };
const N345_READS = ["contradictioncandidates", "contradictiontensions", "contradictionfacts", "contradictionnotices",
  "contradictionresponses", "publishtensions"];
test("R2 R3 R7 R12: N345's ops — contradiction's twelve, resolutiondefect and publishtensions — each carries its rung or "
   + "stated absence and its registry, and with the control plane's rows for them nothing is unaccounted", () => {
  const url = new URL("http://x/");
  const twelve = Object.keys(contradictionOps({}, url, {})).filter((op) => !["contradictionpropose", "contradictionpairs"].includes(op));
  assert.deepEqual(twelve.sort(), [...Object.keys(N345_WRITES), ...N345_READS]
    .filter((op) => op.startsWith("contradiction")).sort());
  for (const [op, r] of Object.entries(N345_WRITES)) {
    if (r === "undetermined") { assert.equal(RUNG_ABSENT[op]?.ground, "undetermined", op); assert.ok(!Object.hasOwn(RUNGS, op), op); }
    else { assert.equal(RUNGS[op], r, op); assert.ok(!Object.hasOwn(RUNG_ABSENT, op), op); }
  }
  assert.ok(ACTS.some((a) => a.id === "contradictionresolve"));
  for (const op of [...Object.keys(N345_WRITES), ...N345_READS].filter((op) => op !== "contradictionresolve"))
    assert.ok(typeof NON_ACTS[op] === "string" && !NON_ACTS[op].startsWith("capture-directed:"), op);
  for (const op of N345_READS) assert.ok(!Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  const table = [...Object.keys(N345_WRITES).map((op) => ({ op, mutating: true, gated: true })),
    ...N345_READS.map((op) => ({ op, mutating: false, gated: true }))];
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => Object.hasOwn(N345_WRITES, op) || N345_READS.includes(op)), []);
  /* carried ungated, a read R7 names would read stale: the control plane gates each */
  assert.ok(A.unaccounted(N345_READS.map((op) => ({ op, mutating: false, gated: false }))).stale.includes("publishtensions"));
});

test("R7: NON_ACTS gives N345's ops the reasons R7 states — candidate-directed, run-directed, a registry correction, "
   + "conflict-directed (DEC-85), and read", () => {
  for (const op of ["contradictiondismiss", "contradictionclarify", "contradictiontakeup"])
    assert.ok(NON_ACTS[op].startsWith("candidate-directed: keyed by a candidate, reached where its sides are shown"), op);
  assert.ok(NON_ACTS.contradictionrecommend.startsWith("run-directed:"));
  assert.ok(NON_ACTS.resolutiondefect.startsWith("registry correction, keyed by a resolution"));
  for (const op of ["contradictionoptin", "contradictionrespond"])
    assert.ok(NON_ACTS[op].startsWith("conflict-directed: keyed by a candidate and the member's project, reached from the "
      + "conflict's notice"), op);
  for (const op of N345_READS) assert.ok(NON_ACTS[op].startsWith("read: "), op);
  assert.match(NON_ACTS.contradictionpairs, /five named keys/);
  assert.ok(!Object.hasOwn(NON_ACTS, "contradictionresolve"), "an ACTS row, never a non-act too");
});

/* R7 (K516): contradiction's measures (its R39, R40) are in-process and no op, so no registry names them. */
test("R7 R12: contradiction's measures are no op and are named in no registry", () => {
  assert.ok(!Object.keys(contradictionOps({}, new URL("http://x/"), {})).includes("contradictionmeasures"));
  for (const t of [NON_ACTS, RUNGS, RUNG_ABSENT]) assert.ok(!Object.hasOwn(t, "contradictionmeasures"));
  assert.ok(![...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].some((a) => a.id === "contradictionmeasures"));
});

test("R3 R27: contradictionrecommend, contradictionoptin and contradictionrespond are graded `undetermined`, each "
   + "with its sentence; no new rung is added for them", () => {
  for (const op of ["contradictionrecommend", "contradictionoptin", "contradictionrespond"]) {
    assert.equal(RUNG_ABSENT[op].ground, "undetermined", op);
    assert.ok(RUNG_ABSENT[op].is.length > 40, op);
  }
  assert.equal(RUNG_LADDER.length, 5);
});

test("R19: the justification family holds the codes N345's reasoned acts refuse with when the member's account is "
   + "absent", () => {
  for (const c of ["DISMISSAL_REASON_UNKNOWN", "CLARIFY_NO_EXPLANATION", "WRONG_SIDE_NO_REASON", "TAKE_UP_NO_QUESTION",
    "NO_CONCLUSION", "NO_REASON"]) assert.ok(JUSTIFICATION_REFUSALS.includes(c), c);
  for (const c of ["NO_CANDIDATE", "NO_SUCH_CANDIDATE", "MACHINE_CANNOT_ACT_ON_CANDIDATE", "NOT_A_CONTRADICTION_INQUIRY",
    "CLARIFY_CHOICE_UNKNOWN", "TAKE_UP_NO_FRAME"]) assert.ok(!JUSTIFICATION_REFUSALS.includes(c), c);
});

/* N364 (K530): the ops sources, capture, membership and case-authoring add, keyed to their op maps where they have one
   (membership's signer pair is routed by the control plane alone). Each op that writes carries its rung or stated
   absence (R2, R3); each carries a `NON_ACTS` reason (R7, R12) except `sourceconsent`, an act, and `knockerconsent`,
   which holds no account and so has no `NEEDS` row, as `knock` has none. */
import { sourcesOps } from "../../../src/sources/index.mjs";
import { captureOps } from "../../../src/capture/index.mjs";
import { caseAuthoringOps } from "../../../src/case-authoring/index.mjs";
const N364_RUNGS = { sourcedisclose: "reasoned", sourcelink: "reasoned", sourceconsent: "reasoned",
  sourceconsentwithdraw: "reversible", reattest: "attested", captureaccount: "attested" };
const N364_ABSENT = { signerregister: "credential", signerrevoke: "credential", knockerconsent: "credential",
  inboxpull: "undetermined" };
const N364_READS = ["sourceof", "sourcerung", "sourcereadlog", "sourcepublishable", "knocksof", "pulledknocks",
  "lateattestations", "captureaccounts", "publishpreflight"];
test("R2 R3 R7 R12: N364's ops each carry their rung or stated absence and their registry, and with the control "
   + "plane's rows for them nothing is unaccounted", () => {
  const url = new URL("http://x/");
  const writes = [...Object.keys(N364_RUNGS), ...Object.keys(N364_ABSENT)];
  /* the op maps hold them: every source op, capture's seven new ones, case-authoring's pre-flight */
  assert.deepEqual(Object.keys(sourcesOps({}, url, {})).sort(), ["knockerconsent", "sourceconsent", "sourceconsentwithdraw",
    "sourcedisclose", "sourcelink", "sourceof", "sourcepublishable", "sourcereadlog", "sourcerung"]);
  const cap = Object.keys(captureOps({}, url, {}, {}));
  for (const op of ["inboxpull", "knocksof", "pulledknocks", "reattest", "lateattestations", "captureaccount", "captureaccounts"])
    assert.ok(cap.includes(op), op);
  assert.ok(Object.keys(caseAuthoringOps({}, url, {})).includes("publishpreflight"));
  for (const [op, r] of Object.entries(N364_RUNGS)) { assert.equal(RUNGS[op], r, op); assert.ok(!Object.hasOwn(RUNG_ABSENT, op), op); }
  for (const [op, g] of Object.entries(N364_ABSENT)) {
    assert.equal(RUNG_ABSENT[op]?.ground, g, op); assert.ok(!Object.hasOwn(RUNGS, op), op);
    assert.ok(RUNG_ABSENT[op].is.length > 40, op);
  }
  for (const op of N364_READS) assert.ok(!Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  const named = [...writes, ...N364_READS].filter((op) => op !== "sourceconsent" && op !== "knockerconsent");
  for (const op of named)
    assert.ok(typeof NON_ACTS[op] === "string" && NON_ACTS[op].length > 40 && !NON_ACTS[op].startsWith("capture-directed:"), op);
  assert.ok(ACTS.some((a) => a.id === "sourceconsent") && !Object.hasOwn(NON_ACTS, "sourceconsent"));
  assert.ok(!Object.hasOwn(NON_ACTS, "knockerconsent") && !Object.hasOwn(NON_ACTS, "knock"));
  for (const op of N364_READS) assert.ok(NON_ACTS[op].startsWith("read: "), op);
  /* the control plane's rows (J1 (5)): the ten writes mutating, every op but knockerconsent gated */
  const table = [...writes.map((op) => ({ op, mutating: true, gated: op !== "knockerconsent" })),
    ...N364_READS.map((op) => ({ op, mutating: false, gated: true }))];
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => writes.includes(op) || N364_READS.includes(op)), []);
  /* carried ungated, a read named here would read stale; carried gated, knockerconsent would read unpublished */
  assert.ok(A.unaccounted([{ op: "knocksof", mutating: false, gated: false }]).stale.includes("knocksof"));
  assert.deepEqual(A.unaccounted([{ op: "knockerconsent", mutating: true, gated: true }]).unpublished, ["knockerconsent"]);
});

test("R7: NON_ACTS.ratify says its pre-flight is op=publishpreflight (case-authoring R34), no longer deferred; "
   + "inboxresolve's names its pulled arm as the pull", () => {
  assert.match(NON_ACTS.ratify, /op=publishpreflight \(case-authoring R34\)/);
  assert.doesNotMatch(NON_ACTS.ratify, /deferred/i);
  assert.match(NON_ACTS.inboxresolve, /`pulled` arm is the pull/);
  assert.match(NON_ACTS.inboxresolve, /op=inboxpull/);
  assert.match(NON_ACTS.inboxresolve, /reason on every arm/);
  assert.equal(RUNGS.inboxresolve, "reasoned", "DEC-88; capture R32");
});

test("R3: the signer pair and knockerconsent are graded `credential`, as signeradd and knock; inboxpull `undetermined` "
   + "on R27's rule; none is in both RUNGS and RUNG_ABSENT", () => {
  for (const op of ["signerregister", "signerrevoke"]) assert.equal(RUNG_ABSENT[op].ground, RUNG_ABSENT.signeradd.ground, op);
  assert.equal(RUNG_ABSENT.knockerconsent.ground, RUNG_ABSENT.knock.ground);
  assert.equal(RUNG_ABSENT.inboxpull.ground, "undetermined");
  for (const op of ["signerregister", "signerrevoke", "knockerconsent", "inboxpull"]) assert.ok(!Object.hasOwn(RUNGS, op), op);
});

/* K899 (7), K902, K918 (T20): actions R52's `op=actionhold`, a member's hold statement on a `legal` pressure mark: graded
   `reasoned` (R2, R27; its backing is driven in backing.test.mjs) and named in NON_ACTS (R7), keyed by the entry the
   mark is on. With the control plane's row for it (mutating, gated) nothing is unaccounted (R12). */
test("R2 R7 R12 R19: actionhold, actions R52's op, is graded `reasoned`, HOLD_REFUSED is in the justification family, "
   + "it is named in NON_ACTS as entry-directed, and with the control plane's row for it nothing is unaccounted", () => {
  assert.ok(Object.keys(actionsOps({}, new URL("http://x/"), {})).includes("actionhold"), "actions' op map holds it");
  assert.equal(RUNGS.actionhold, "reasoned");
  assert.ok(!Object.hasOwn(RUNG_ABSENT, "actionhold"));
  assert.ok(JUSTIFICATION_REFUSALS.includes("HOLD_REFUSED"));
  assert.equal(NON_ACTS.actionhold, "entry-directed: keyed by (action, entry ordinal); appends a hold statement and "
    + "never rewrites the entry or its mark");
  assert.ok(![...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].some((a) => a.id === "actionhold"));
  const row = { op: "actionhold", mutating: true, gated: true };
  const base = A.unaccounted([]);
  const r = A.unaccounted([row]);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale, base.stale.filter((op) => op !== "actionhold"));
  assert.ok(base.stale.includes("actionhold"), "carried by no row, both its keys read stale");
  assert.deepEqual([A.decorate({ id: "actionhold", label: "x" }, null).rung, A.decorate({ id: "actionhold", label: "x" }, null).rung_absence],
    ["reasoned", null], "R24: a rung, never a bare null");
});

/* R30 (K921, K922 (3), T21): the ops of `filing-templates` and `local-facts`, keyed to their op maps. The two that ask an
   account are graded `reasoned` (their backing is driven in backing.test.mjs), the grant pair `credential` as
   `reviewgrant` and `reviewrevoke`, the other seven template acts `undetermined` on R27's rule; every op, the reads
   included, carries its `NON_ACTS` reason, so the control plane gates each with a `NEEDS` row (op-declarations and
   control-plane's T21 share; until they merge, these rows read `stale` against the real table, red by name: plan rule 3). */
import { filingTemplatesOps } from "../../../src/filing-templates/index.mjs";
import { localFactsOps } from "../../../src/local-facts/index.mjs";
const R30_RUNGS = { templateretire: "reasoned", factconfirm: "reasoned" };
const R30_ABSENT = { templatereviewgrant: "credential", templategrantrevoke: "credential",
  templatedraft: "undetermined", templaterevise: "undetermined", templatepropose: "undetermined",
  templatesubmit: "undetermined", templatereview: "undetermined", templatecomment: "undetermined",
  templateapprove: "undetermined" };
const R30_READS = ["templates", "templateread", "templatecomments", "factstatus", "factsdue"];
const R30_WRITES = [...Object.keys(R30_RUNGS), ...Object.keys(R30_ABSENT)];
const TEMPLATE_DIRECTED = "template-directed: keyed by a template or one of its versions, reached from the template "
  + "library; writes this module's rows and moves no bundle";
const GRANT_DOOR = "reached also through a review grant's door";

test("R30 R2 R3 R12: the op maps of filing-templates and local-facts hold exactly R30's ops; templateretire and "
   + "factconfirm are `reasoned`, the grant pair `credential` as reviewgrant and reviewrevoke, K921's seven "
   + "`undetermined`, and with the control plane's rows for them nothing is unaccounted", () => {
  const url = new URL("http://x/");
  assert.deepEqual([...Object.keys(filingTemplatesOps({}, url, {})), ...Object.keys(localFactsOps({}, url, {}))].sort(),
    [...R30_WRITES, ...R30_READS].sort());
  for (const [op, r] of Object.entries(R30_RUNGS)) { assert.equal(RUNGS[op], r, op); assert.ok(!Object.hasOwn(RUNG_ABSENT, op), op); }
  for (const [op, g] of Object.entries(R30_ABSENT)) {
    assert.equal(RUNG_ABSENT[op]?.ground, g, op); assert.ok(!Object.hasOwn(RUNGS, op), op);
    assert.ok(typeof RUNG_ABSENT[op].is === "string" && RUNG_ABSENT[op].is.length > 40, op);
  }
  assert.equal(RUNG_ABSENT.templatereviewgrant.ground, RUNG_ABSENT.reviewgrant.ground);
  assert.equal(RUNG_ABSENT.templategrantrevoke.ground, RUNG_ABSENT.reviewrevoke.ground);
  for (const op of R30_READS) assert.ok(!Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  assert.ok(![...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].some((a) => R30_WRITES.includes(a.id) || R30_READS.includes(a.id)));
  /* R24: each write decorates with a rung or a stated absence, never both and never neither */
  for (const op of R30_WRITES) {
    const d = A.decorate({ id: op, label: "x" }, null);
    assert.equal((d.rung === null) !== (d.rung_absence === null), true, op);
  }
  /* the control plane's rows: the writes mutating and gated, the reads gated (each has a NON_ACTS reason) */
  const table = [...R30_WRITES.map((op) => ({ op, mutating: true, gated: true })),
    ...R30_READS.map((op) => ({ op, mutating: false, gated: true }))];
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => R30_WRITES.includes(op) || R30_READS.includes(op)), []);
  /* carried by no row (the real table before op-declarations' and control-plane's merges), every one reads stale */
  assert.deepEqual([...R30_WRITES, ...R30_READS].filter((op) => !A.unaccounted([]).stale.includes(op)), []);
  /* and the totality holds with them: R3 R12's consistency test above covers the whole catalogue */
});

test("R30 R7: NON_ACTS gives each of R30's ops its reason — the template acts template-directed, the review, the "
   + "comment and the two reads a grant reaches naming the grant's door, factconfirm fact-directed, the reads `read:` — "
   + "and templatesave's rows stay", () => {
  const TEMPLATE_ACTS = ["templatedraft", "templaterevise", "templatepropose", "templatesubmit", "templatereviewgrant",
    "templategrantrevoke", "templatereview", "templatecomment", "templateapprove", "templateretire"];
  const DOOR = ["templatereview", "templatecomment", "templateread", "templatecomments"];
  for (const op of TEMPLATE_ACTS) assert.ok(NON_ACTS[op]?.startsWith(TEMPLATE_DIRECTED), op);
  for (const op of ["templates", "templateread", "templatecomments", "factstatus", "factsdue"])
    assert.ok(NON_ACTS[op]?.startsWith("read: "), op);
  for (const op of [...TEMPLATE_ACTS, ...R30_READS]) assert.equal(NON_ACTS[op].includes(GRANT_DOOR), DOOR.includes(op), op);
  assert.equal(NON_ACTS.factconfirm, "fact-directed: keyed by a profile fact's path, reached from the calendar and "
    + "offices; moves no bundle");
  for (const op of [...R30_WRITES, ...R30_READS]) assert.ok(!NON_ACTS[op].startsWith("capture-directed:"), op);
  /* filings R32's templatesave keeps its rows: a NON_ACTS reason and its `undetermined` ground */
  assert.ok(typeof NON_ACTS.templatesave === "string" && NON_ACTS.templatesave.startsWith("draft-directed:"));
  assert.equal(RUNG_ABSENT.templatesave.ground, "undetermined");
  assert.match(RUNG_ABSENT.templatesave.is, /filings R32/);
});

test("R30 R19: TEMPLATE_REASON_REFUSED and FACT_HOW_REFUSED are in the justification family, and each is a code its "
   + "owner answers with (its own checks table)", () => {
  for (const c of ["TEMPLATE_REASON_REFUSED", "FACT_HOW_REFUSED"]) assert.ok(JUSTIFICATION_REFUSALS.includes(c), c);
  assert.ok(Object.hasOwn(filingTemplates.FILING_TEMPLATE_CHECKS, "TEMPLATE_REASON_REFUSED"));
  assert.ok(Object.hasOwn(localFacts.LOCAL_FACTS_CHECKS, "FACT_HOW_REFUSED"));
  /* the template and fact refusals that ask for an object, a choice or a form, never an account, stay out */
  for (const c of ["NO_SUCH_TEMPLATE", "TEMPLATE_TEXT_REFUSED", "NOT_A_DRAFT", "NO_SUCH_FACT", "FACT_ACT_REFUSED",
    "FACT_VALUE_REFUSED", "MACHINE_CANNOT_CONFIRM", "REVIEW_REFUSED"]) assert.ok(!JUSTIFICATION_REFUSALS.includes(c), c);
});

/* R31 (DEC-88 (4); K1038): the six judgement calls' consequence statements, published beside the ladder as
   `VOCABULARIES.rung_consequences`, the very object `CONSEQUENCE_STATEMENTS`; the rung names unchanged (R27); no key
   added to the decorated act (R11), so op=affordances and a queue item's options keep their shape. */
test("R31 R33 R4 R11: CONSEQUENCE_STATEMENTS holds exactly the six with their friction — the full dialog for attribute, "
   + "leadshare, entitycreate, strengthbar and filingapprove, in-place for workobjective — and R33's actionholdrelease, "
   + "the full dialog, each with its statement, published as VOCABULARIES.rung_consequences by reference, the rungs "
   + "unchanged and the decorated act's keys too", () => {
  const C = A.CONSEQUENCE_STATEMENTS;
  assert.deepEqual(Object.fromEntries(Object.entries(C).map(([op, c]) => [op, c.friction])), {
    attribute: "dialog", leadshare: "dialog", entitycreate: "dialog", strengthbar: "dialog", filingapprove: "dialog",
    workobjective: "in-place", actionholdrelease: "dialog" });
  for (const [op, c] of Object.entries(C)) {
    assert.deepEqual(Object.keys(c).sort(), ["friction", "statement"], op);
    assert.ok(typeof c.statement === "string" && c.statement.length > 80, op);
  }
  assert.equal(VOCABULARIES.rung_consequences, C, "the same object, never a copy");
  assert.equal(A.vocabulariesFor(["x"]).rung_consequences, C);
  assert.equal(A.affordancesAnswer({ kinds: null, gate: null }).vocabularies.rung_consequences, C);
  /* the rungs are the ladder's own: five reasoned, filingapprove terminal (its statement is its terminal effect) */
  assert.deepEqual(Object.keys(C).map((op) => [op, RUNGS[op]]), [["attribute", "reasoned"], ["leadshare", "reasoned"],
    ["entitycreate", "reasoned"], ["strengthbar", "reasoned"], ["filingapprove", "terminal"], ["workobjective", "reasoned"],
    ["actionholdrelease", "terminal"]]);
  assert.match(C.workobjective.statement, /budget and scope/);
  assert.match(C.filingapprove.statement, /approved once/);
  assert.match(C.leadshare.statement, /cannot be un-read/);
  /* R11: the decorated shape is unchanged — no consequence key on any act */
  const KEYS = ["id", "label", "weight", "needs", "mode", "rung", "rung_absence", "prompt"];
  for (const a of [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS]) assert.deepEqual(Object.keys(A.decorate(a, null)), KEYS, a.id);
  for (const op of Object.keys(C)) assert.deepEqual(Object.keys(A.decorate({ id: op, label: "x" }, null)), KEYS, op);
  /* and no place is named in them (R25: outward text) */
  assert.ok(outward().some(([w]) => w.startsWith("VOCABULARIES.rung_consequences.")));
});

/* K1019, K1023, K1037 (T22; plan layer 11): the ops escalation, capture and monitoring added, keyed to their op maps.
   The four writes are `reasoned` (R2) with a NON_ACTS reason; capture's three reads carry a NON_ACTS reason (each has
   a present `NEEDS` row in op-declarations, as capture's other reads); escalation's status read has no `NEEDS` row
   (`escalationsdue`'s shape), so no registry names it; `doorbellrefused` is store-internal and named nowhere. T23's
   ops (escalationreasondraft, whatchangedpropose, whatchangeddrafts among them) are R32's, in the test after this one. */
import { escalationOps } from "../../../src/escalation/index.mjs";
import { monitoringOps } from "../../../src/monitoring/index.mjs";
test("R2 R3 R7 R12: T22's new ops — declinetoescalate, heldsetaside, heldrestore and addressfrequencyset `reasoned`, "
   + "capture's three reads named `read:`, escalationstatus and doorbellrefused named nowhere — and with the control "
   + "plane's rows for them nothing is unaccounted", () => {
  const url = new URL("http://x/");
  const esc = Object.keys(escalationOps({}, url, {})), cap = Object.keys(captureOps({}, url, {}, {})),
        mon = Object.keys(monitoringOps({}, url, {}));
  for (const op of ["declinetoescalate", "escalationstatus"]) assert.ok(esc.includes(op), op);
  for (const op of ["heldsetaside", "heldrestore", "heldcaptures", "gradenote", "doorbelltally", "doorbellrefused"])
    assert.ok(cap.includes(op), op);
  assert.ok(mon.includes("addressfrequencyset"));
  const named = (op) => Object.hasOwn(NON_ACTS, op) || Object.hasOwn(RUNGS, op) || Object.hasOwn(RUNG_ABSENT, op)
    || [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].some((a) => a.id === op);
  const WRITES = ["declinetoescalate", "heldsetaside", "heldrestore", "addressfrequencyset"];
  const READS = ["heldcaptures", "gradenote", "doorbelltally"];
  for (const op of WRITES) {
    assert.equal(RUNGS[op], "reasoned", op);
    assert.ok(typeof NON_ACTS[op] === "string" && NON_ACTS[op].length > 40 && !NON_ACTS[op].startsWith("capture-directed:"), op);
  }
  for (const op of READS) {
    assert.ok(NON_ACTS[op]?.startsWith("read: "), op);
    assert.ok(!Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  }
  for (const op of ["escalationstatus", "doorbellrefused"]) assert.equal(named(op), false, op);
  const table = [...WRITES.map((op) => ({ op, mutating: true, gated: true })),
    ...READS.map((op) => ({ op, mutating: false, gated: true })), { op: "escalationstatus", mutating: false, gated: false }];
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => table.some((t) => t.op === op)), []);
  /* carried gated, escalationstatus would read unpublished; carried by no row, each named op reads stale */
  assert.deepEqual(A.unaccounted([{ op: "escalationstatus", mutating: false, gated: true }]).unpublished, ["escalationstatus"]);
  assert.deepEqual([...WRITES, ...READS].filter((op) => !A.unaccounted([]).stale.includes(op)), []);
});

/* R32 (N485: K1025, K1035; K1094; DEC-111, K1100; T23): the ops T23 adds, by R7 and R27, and R12's totality with them.
   case-authoring's and escalation's are read from their op maps; `sweeps` left monitoring's for link-sweep's at T24's L10
   (N506, link-sweep R1–R12), and link-sweep is not in this module's uses, so it is named as R32 names it; network-notices is not in this module's
   uses, so its four ops (its op map: `noticeprepare`, `noticepost`, `notices`, `directorysubmission`) and its three
   public reads (registered through public-read R18) are named as its record states them (build/jobs/T23/network-notices.md;
   K1150). R32 names no grade or reason for `directorysubmission`, so it is not asserted here either way. */
const R32_GRADES = { whatchangedpropose: ["absent", "undetermined"], noticepost: ["rung", "attested"] };
const R32_WRITE_REASONS = {
  whatchangedpropose: "case-directed: keyed by a published case, reached from its next edition; a draft, never a "
    + "statement until a member adopts it",
  noticepost: "project-directed: keyed by a project, reached from the project; an owner's signed notice",
};
const R32_READS = ["escalationreasondraft", "whatchangeddrafts", "sweeps", "noticeprepare", "notices"];
const R32_PUBLIC = ["activitymethod", "noticespublic", "groupkeyspublic"];
const gradeOf = (op) => Object.hasOwn(RUNGS, op) ? ["rung", RUNGS[op]]
  : Object.hasOwn(RUNG_ABSENT, op) ? ["absent", RUNG_ABSENT[op].ground] : null;
test("R32 R2 R3 R7 R12: T23's ops — whatchangedpropose `undetermined` as templatepropose, noticepost `attested` as "
   + "caseratify, each with R32's NON_ACTS reason, the five reads `read:` and network-notices' public reads `read: public, "
   + "no credential` — and with the control plane's rows for them nothing is unaccounted; a misgraded op, an ungated "
   + "read and an op left out are each seen", () => {
  const url = new URL("http://x/");
  const ca = Object.keys(caseAuthoringOps({}, url, {})), esc = Object.keys(escalationOps({}, url, {}));
  for (const op of ["whatchangedpropose", "whatchangeddrafts"]) assert.ok(ca.includes(op), op);
  assert.ok(esc.includes("escalationreasondraft"));
  /* each write's grade, on R27's rule and beside the op R32 names as its precedent */
  const grades = Object.fromEntries(Object.keys(R32_GRADES).map((op) => [op, gradeOf(op)]));
  assert.deepEqual(grades, R32_GRADES);
  assert.equal(RUNG_ABSENT.whatchangedpropose.ground, RUNG_ABSENT.templatepropose.ground);
  assert.ok(RUNG_ABSENT.whatchangedpropose.is.length > 40);
  assert.equal(RUNGS.noticepost, RUNGS.caseratify);
  for (const op of Object.keys(R32_GRADES)) assert.ok(!(Object.hasOwn(RUNGS, op) && Object.hasOwn(RUNG_ABSENT, op)), op);
  /* negative control: the same comparison sees noticepost graded otherwise, or whatchangedpropose given a rung */
  assert.notDeepEqual({ ...grades, noticepost: ["rung", "reasoned"] }, R32_GRADES);
  assert.notDeepEqual({ ...grades, whatchangedpropose: ["rung", "reversible"] }, R32_GRADES);
  /* R24: each write decorates with a rung or a stated absence, never both and never neither */
  for (const op of Object.keys(R32_GRADES)) {
    const d = A.decorate({ id: op, label: "x" }, null);
    assert.equal((d.rung === null) !== (d.rung_absence === null), true, op);
  }
  /* each NON_ACTS reason as R32 words it; the reads write no rung; none is an act or a capture act */
  for (const [op, r] of Object.entries(R32_WRITE_REASONS)) assert.equal(NON_ACTS[op], r, op);
  for (const op of R32_READS) {
    assert.ok(NON_ACTS[op]?.startsWith("read: ") && NON_ACTS[op].length > 40, op);
    assert.ok(!Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  }
  for (const op of R32_PUBLIC) {
    assert.equal(NON_ACTS[op], "read: public, no credential", op);
    assert.ok(!Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  }
  const ALL = [...Object.keys(R32_GRADES), ...R32_READS, ...R32_PUBLIC];
  assert.ok(![...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].some((a) => ALL.includes(a.id)));
  for (const op of ALL) assert.ok(!NON_ACTS[op].startsWith("capture-directed:"), op);
  /* the control plane's rows (op-declarations R10): the two writes mutating, every op gated (each has a NON_ACTS reason) */
  const table = [...Object.keys(R32_GRADES).map((op) => ({ op, mutating: true, gated: true })),
    ...[...R32_READS, ...R32_PUBLIC].map((op) => ({ op, mutating: false, gated: true }))];
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => ALL.includes(op)), []);
  /* negative controls: carried by no row (the real table before op-declarations' merge), each reads stale; a read
     carried ungated reads stale; a new op the catalogue leaves out reads unpublished and unranked */
  assert.deepEqual(ALL.filter((op) => !A.unaccounted([]).stale.includes(op)), []);
  for (const op of [...R32_READS, ...R32_PUBLIC])
    assert.ok(A.unaccounted([{ op, mutating: false, gated: false }]).stale.includes(op), op);
  const left = A.unaccounted([...table, { op: "noticeunnamed", mutating: true, gated: true }]);
  assert.deepEqual([left.unpublished, left.unranked], [["noticeunnamed"], ["noticeunnamed"]]);
});

/* N512 (T25): the provenance split. `provenancechain`, `provenanceroute` and the read `provenanceroutes` left
   provenance's op map (its R53) for provenance-routes' (its R9), and `op=attest` is answered by attestation's door arm
   (`attestOp`, attestation R1–R3) with the code it reaches. No grade or reason moves with them (provenance-routes' and
   attestation's requirements change no meaning): the two route writes keep `substrate` and their `document-directed:`
   reasons, `attest` keeps `attested`, its capture-directed reason and its CAPTURE_ACTS row with the fence, and the
   read carries no `NEEDS` row (op-declarations, not in this module's uses, so the rows are written out here as its
   table carries them), so it is named nowhere (R12). */
import { provenanceRouteOps } from "../../../src/provenance-routes/index.mjs";
import { attestOp } from "../../../src/attestation/index.mjs";
test("R1 R2 R3 R5 R7 R12 (N512): provenance-routes' three ops, keyed to its op map, and attestation's `attest` keep "
   + "their grades and reasons — the two route writes `substrate` with `document-directed:` reasons, the read named "
   + "nowhere, `attest` `attested` and capture-directed with the fence — and with the control plane's rows nothing is "
   + "unaccounted; a misgraded or unnamed op is seen", () => {
  const routeOps = Object.keys(provenanceRouteOps({}, new URL("http://x/"), {})).sort();
  assert.deepEqual(routeOps, ["provenancechain", "provenanceroute", "provenanceroutes"]);
  assert.equal(typeof attestOp, "function");
  const WRITES = ["provenancechain", "provenanceroute"];
  for (const op of WRITES) {
    assert.equal(RUNG_ABSENT[op]?.ground, "substrate", op);
    assert.ok(!Object.hasOwn(RUNGS, op), op);
    assert.ok(NON_ACTS[op]?.startsWith("document-directed: ") && NON_ACTS[op].length > 60, op);
    assert.ok(![...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].some((a) => a.id === op), op);
  }
  for (const t of [NON_ACTS, RUNGS, RUNG_ABSENT]) assert.ok(!Object.hasOwn(t, "provenanceroutes"));
  assert.equal(RUNGS.attest, "attested");
  assert.ok(!Object.hasOwn(RUNG_ABSENT, "attest"));
  assert.ok(NON_ACTS.attest.startsWith("capture-directed:"));
  assert.deepEqual(CAPTURE_ACTS.find((a) => a.id === "attest"), { id: "attest", label: "Co-attest this capture", prompt: A.ATTEST_FENCE });
  assert.ok(!ACTS.some((a) => a.id === "attest"));
  /* the control plane's rows: the two writes and `attest` mutating and gated, the read neither */
  const table = [...WRITES, "attest"].map((op) => ({ op, mutating: true, gated: true }))
    .concat([{ op: "provenanceroutes", mutating: false, gated: false }]);
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => [...routeOps, "attest"].includes(op)), []);
  /* negative controls: carried gated, the read reads unpublished; carried by no row, each write reads stale; an op
     the catalogue leaves out reads unpublished and unranked */
  assert.deepEqual(A.unaccounted([{ op: "provenanceroutes", mutating: false, gated: true }]).unpublished, ["provenanceroutes"]);
  assert.deepEqual([...WRITES, "attest"].filter((op) => !A.unaccounted([]).stale.includes(op)), []);
  const left = A.unaccounted([...table, { op: "provenanceunnamed", mutating: true, gated: true }]);
  assert.deepEqual([left.unpublished, left.unranked], [["provenanceunnamed"], ["provenanceunnamed"]]);
});

/* R19 (DEC-88, K1025): the justification family gains each newly reasoned op's code, read from the owner's own checks
   table where it keeps one, and the four words-as-reason codes. */
import * as provenanceChecks from "../../../src/provenance/checks.mjs";
import * as contentChecks from "../../../src/content/checks.mjs";
import * as obsChecks from "../../../src/observation-log/checks.mjs";
import * as entitiesChecks from "../../../src/entities/checks.mjs";
import * as captureChecks from "../../../src/capture/checks.mjs";
import * as monitoringChecks from "../../../src/monitoring/checks.mjs";
import * as biasChecks from "../../../src/bias/checks.mjs";
import * as publicationChecks from "../../../src/publication/checks.mjs";
import * as strengthChecks from "../../../src/strength/checks.mjs";
import * as intentChecks from "../../../src/intent/checks.mjs";
import * as standardsChecks from "../../../src/standards/checks.mjs";
import * as filingsChecks from "../../../src/filings/checks.mjs";
import * as caseAuthoringChecks from "../../../src/case-authoring/checks.mjs";
import * as reevaluationChecks from "../../../src/reevaluation/checks.mjs";
import * as consequencesChecks from "../../../src/consequences/checks.mjs";
/* NO_BASIS is a shared act row, held by record-grammar (C-33.40), which progressions and entities answer with. */
import { SHARED_ACT_CHECKS } from "../../../src/record-grammar/index.mjs";
test("R19: the justification family holds DEC-88's and T22's codes, each a row its owner's checks table keeps", () => {
  const OWNERS = {
    TESTIMONY_NO_WORDS: provenanceChecks, TRANSCRIBE_NO_TEXT: contentChecks, ATTEST_NO_NOTE: contentChecks,
    LEAD_NO_WORDS: obsChecks, LEAD_LOOK_NO_DETAIL: obsChecks, LEAD_SHARE_NO_REASON: obsChecks,
    ENTITY_NO_NOTE: entitiesChecks, NO_BASIS: { SHARED_ACT_CHECKS }, RESOLVE_NO_REASON: captureChecks,
    SET_ASIDE_NO_REASON: captureChecks, FREQUENCY_NO_REASON: monitoringChecks, BIAS_ADOPTION_NO_REASON: biasChecks,
    ATTRIBUTION_NO_REASON: publicationChecks, BAR_NO_REASON: strengthChecks, PURSUIT_UNSTATED: intentChecks,
    NO_NOTE: intentChecks, INTENT_NO_REASON: intentChecks, STANDARD_NO_REASON: standardsChecks,
    PACKET_NO_REASON: filingsChecks, STATEMENT_ACK_NO_REASON: caseAuthoringChecks,
    VERSION_ADOPT_NO_REASON: reevaluationChecks, NO_RATIONALE: consequencesChecks,
  };
  const rowIn = (mod, code) => Object.values(mod).some((t) => t && typeof t === "object" && Object.hasOwn(t, code));
  for (const [code, mod] of Object.entries(OWNERS)) {
    assert.ok(JUSTIFICATION_REFUSALS.includes(code), code);
    assert.ok(rowIn(mod, code), `${code} is a row of its owner's checks`);
  }
  /* what demands an object, a choice or a position, never an account, stays out */
  for (const c of ["KNOCK_EMPTY", "NO_IDS", "BAD_FREQUENCY", "NOT_A_SOURCE_OWNER", "ALREADY_OPEN", "NEITHER_CAPTURE_NOR_TESTIMONY",
    "MACHINE_CANNOT_SET_ASIDE", "LEAD_TOO_LONG", "STANDARD_NO_TEXT", "NO_COUNSEL"]) assert.ok(!JUSTIFICATION_REFUSALS.includes(c), c);
});

/* R33 (DEC-113; K1134 (3), K1252; T27): the litigation hold's release and its two reads, keyed to actions' op map
   (op-declarations R12 carries their rows: the release mutating, every op gated and stamped `viewer`). The release is
   `terminal`, R27's named exception, with a consequence statement beside it; the preview and the held-project answer are
   reads. Their backing is driven at actions' interface in backing.test.mjs. */
const R33_READS = ["actionholdpreview", "projectholds"];
test("R33 R2 R7 R12 R20: actionholdrelease is `terminal`, a named exception to R27 (actionhold stays `reasoned`), "
   + "HOLD_REFUSED backs its reason, its consequence statement says what releasing restarts and that it cannot be undone, "
   + "NON_ACTS names it entry-directed and its two reads `read:`, it is not in MACHINE_REFUSALS, and with the control "
   + "plane's rows nothing is unaccounted; a misgraded release or an unnamed read is seen", () => {
  const ops = Object.keys(actionsOps({}, new URL("http://x/"), {}));
  for (const op of ["actionholdrelease", ...R33_READS]) assert.ok(ops.includes(op), `actions' op map holds ${op}`);
  assert.equal(RUNGS.actionholdrelease, "terminal");
  assert.equal(RUNGS.actionhold, "reasoned", "placing stays light (K918)");
  assert.ok(!Object.hasOwn(RUNG_ABSENT, "actionholdrelease"));
  assert.ok(JUSTIFICATION_REFUSALS.includes("HOLD_REFUSED"));
  /* the consequence statement: the dialog, what is restarted for the projects the surface reads beside it, and that it
     cannot be undone */
  const c = A.CONSEQUENCE_STATEMENTS.actionholdrelease;
  assert.deepEqual(Object.keys(c).sort(), ["friction", "statement"]);
  assert.equal(c.friction, "dialog");
  assert.match(c.statement, /restarts deletion for the projects shown beside this/);
  assert.match(c.statement, /material may be purged again/);
  assert.match(c.statement, /assistant transcripts for them past the time limit will be deleted on each member's device when it is next opened/);
  assert.match(c.statement, /This cannot be undone\.$/);
  assert.equal(VOCABULARIES.rung_consequences.actionholdrelease, c);
  /* NON_ACTS, word for word for the release; the reads begin `read:` and write nothing */
  assert.equal(NON_ACTS.actionholdrelease, "entry-directed: keyed by (action, entry ordinal); appends a release and never "
    + "rewrites the entry, its mark or an earlier statement");
  for (const op of R33_READS) {
    assert.ok(NON_ACTS[op]?.startsWith("read: ") && NON_ACTS[op].length > 40, op);
    assert.match(NON_ACTS[op], /writes nothing$/, op);
    assert.ok(!Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  }
  assert.ok(!Object.hasOwn(MACHINE_REFUSALS, "actionholdrelease") && !Object.hasOwn(MACHINE_REFUSALS, "actionhold"));
  assert.ok(![...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].some((a) => ["actionholdrelease", ...R33_READS].includes(a.id)));
  assert.deepEqual([A.decorate({ id: "actionholdrelease", label: "x" }, null).rung,
                    A.decorate({ id: "actionholdrelease", label: "x" }, null).rung_absence], ["terminal", null], "R24");
  const table = [{ op: "actionholdrelease", mutating: true, gated: true },
    ...R33_READS.map((op) => ({ op, mutating: false, gated: true }))];
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => table.some((t) => t.op === op)), []);
  /* negative controls: carried ungated, a read reads stale; carried by no row, each reads stale */
  for (const op of R33_READS) assert.ok(A.unaccounted([{ op, mutating: false, gated: false }]).stale.includes(op), op);
  assert.deepEqual(["actionholdrelease", ...R33_READS].filter((op) => !A.unaccounted([]).stale.includes(op)), []);
});

/* R34 (DEC-116, DEC-100; N520; T27): the docket's ops, keyed to docket's op map (its `docketOps`), and its two public
   reads (docket R14, R15, registered through public-read, not in this module's uses, so named as R34 names them).
   op-declarations R13 carries their rows. The reasoned pair's backing and the post's signature are driven at docket's
   interface in backing.test.mjs. */
const R34_GRADES = { docketfile: ["rung", "reasoned"], docketdecline: ["rung", "reasoned"], docketpost: ["rung", "attested"],
  docketpressure: ["absent", "undetermined"] };
const R34_READS = ["docket", "docketprepare", "docketinvitation"];
const R34_PUBLIC = ["docketpublic", "docketfeed"];
const CASE_DIRECTED = "case-directed: keyed by a published case, reached from its docket; never evidence, moves no bundle";
test("R34 R2 R3 R4 R7 R12 R19: the docket's ops — docketfile and docketdecline `reasoned`, DOCKET_NO_REASON in the "
   + "family, docketpost `attested` as noticepost, docketpressure `undetermined` as actionpressure, each case-directed in "
   + "NON_ACTS, its reads `read:` and its public reads `read: public, no credential`, its four vocabularies the owner's "
   + "objects — and with the control plane's rows nothing is unaccounted; a misgraded op or one left out is seen", () => {
  const ops = Object.keys(docket.docketOps({}, new URL("http://x/"), {})).sort();
  assert.deepEqual(ops, [...Object.keys(R34_GRADES), ...R34_READS].sort(), "docket's op map holds exactly these");
  const grades = Object.fromEntries(Object.keys(R34_GRADES).map((op) => [op, gradeOf(op)]));
  assert.deepEqual(grades, R34_GRADES);
  assert.equal(RUNGS.docketpost, RUNGS.noticepost);
  assert.equal(RUNG_ABSENT.docketpressure.ground, RUNG_ABSENT.actionpressure.ground);
  assert.ok(RUNG_ABSENT.docketpressure.is.length > 40);
  assert.ok(JUSTIFICATION_REFUSALS.includes("DOCKET_NO_REASON"));
  assert.ok(Object.hasOwn(docket.DOCKET_CHECKS, "DOCKET_NO_REASON"), "a row of its owner's checks");
  for (const c of ["DOCKET_KIND_UNKNOWN", "DOCKET_NO_CAPTURE", "NO_SUCH_DOCKET_ENTRY", "MACHINE_CANNOT_MARK_DOCKET_PRESSURE",
    "DOCKET_SIGNATURE_REFUSED"]) assert.ok(!JUSTIFICATION_REFUSALS.includes(c), c);
  /* negative controls: the same comparison sees a misgraded op */
  assert.notDeepEqual({ ...grades, docketpost: ["rung", "reasoned"] }, R34_GRADES);
  assert.notDeepEqual({ ...grades, docketpressure: ["rung", "reversible"] }, R34_GRADES);
  for (const op of Object.keys(R34_GRADES)) {
    const d = A.decorate({ id: op, label: "x" }, null);
    assert.equal((d.rung === null) !== (d.rung_absence === null), true, `R24: ${op}`);
    assert.equal(NON_ACTS[op], CASE_DIRECTED, op);
  }
  for (const op of R34_READS) {
    assert.ok(NON_ACTS[op]?.startsWith("read: ") && NON_ACTS[op].length > 40, op);
    assert.match(NON_ACTS[op], /writes nothing$/, op);
    assert.ok(!Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  }
  for (const op of R34_PUBLIC) {
    assert.equal(NON_ACTS[op], "read: public, no credential", op);
    assert.ok(!Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  }
  const ALL = [...Object.keys(R34_GRADES), ...R34_READS, ...R34_PUBLIC];
  assert.ok(![...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].some((a) => ALL.includes(a.id)));
  assert.deepEqual(ALL.filter((op) => Object.hasOwn(MACHINE_REFUSALS, op)), []);
  /* R4: the four vocabularies, docket's own objects (its DOCKET_VOCABULARIES), by reference */
  for (const [k, v] of Object.entries(docket.DOCKET_VOCABULARIES)) assert.equal(VOCABULARIES[k], v, k);
  /* the control plane's rows (op-declarations R13): the four writes mutating, every op gated */
  const table = [...Object.keys(R34_GRADES).map((op) => ({ op, mutating: true, gated: true })),
    ...[...R34_READS, ...R34_PUBLIC].map((op) => ({ op, mutating: false, gated: true }))];
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => ALL.includes(op)), []);
  assert.deepEqual(ALL.filter((op) => !A.unaccounted([]).stale.includes(op)), []);
  const left = A.unaccounted([...table, { op: "docketunnamed", mutating: true, gated: true }]);
  assert.deepEqual([left.unpublished, left.unranked], [["docketunnamed"], ["docketunnamed"]]);
});

/* R35 (DEC-112 (6), DEC-96 items 1, 2; N520, N522; T28): case-import's eight ops, keyed to its op map (`caseImportOps`),
   and case-checker's two public reads (its R15, registered through public-read R18; case-checker is not in this module's
   uses, so they are named as R35 names them). op-declarations R14 carries their rows. The four reasoned acts' backing is
   driven at case-import's interface in backing.test.mjs. */
import { caseImportOps, CASE_IMPORT_CHECKS } from "../../../src/case-import/index.mjs";
const R35_GRADES = { importaccept: ["rung", "reasoned"], importacceptwithdraw: ["rung", "reasoned"],
  importflag: ["rung", "reasoned"], importflagclear: ["rung", "reasoned"],
  caseimport: ["absent", "undetermined"], caseimportdocument: ["absent", "undetermined"] };
const R35_READS = ["importedcases", "importedcase"];
const R35_PUBLIC = ["casechecker", "casefilespec"];
const IMPORT_DIRECTED = "import-directed: keyed by an imported case (an import, an edition, a finding or a flag), reached "
  + "from the imported cases; writes this module's rows and moves no bundle";
test("R35 R2 R3 R7 R12 R19 R27: case-import's ops — importaccept, importacceptwithdraw, importflag and importflagclear "
   + "`reasoned`, IMPORT_ACCEPT_NO_REASON and IMPORT_FLAG_NO_ISSUE in the family, caseimport and caseimportdocument "
   + "`undetermined` as inboxpull, the six import-directed in NON_ACTS, its reads `read:` and case-checker's public reads "
   + "`read: public, no credential`, none in MACHINE_REFUSALS and no vocabulary added — and with the control plane's rows "
   + "nothing is unaccounted; a misgraded op or one left out is seen", () => {
  const ops = Object.keys(caseImportOps({}, new URL("http://x/"), {})).sort();
  assert.deepEqual(ops, [...Object.keys(R35_GRADES), ...R35_READS].sort(), "case-import's op map holds exactly these");
  const grades = Object.fromEntries(Object.keys(R35_GRADES).map((op) => [op, gradeOf(op)]));
  assert.deepEqual(grades, R35_GRADES);
  for (const op of ["caseimport", "caseimportdocument"]) {
    assert.equal(RUNG_ABSENT[op].ground, RUNG_ABSENT.inboxpull.ground, op);
    assert.ok(RUNG_ABSENT[op].is.length > 40, op);
  }
  /* R19: both codes are in the family, each a row of its owner's checks; the import's other refusals ask an object, a
     member or a state, never an account, and stay out */
  for (const c of ["IMPORT_ACCEPT_NO_REASON", "IMPORT_FLAG_NO_ISSUE"]) {
    assert.ok(JUSTIFICATION_REFUSALS.includes(c), c);
    assert.ok(Object.hasOwn(CASE_IMPORT_CHECKS, c), `${c} is a row of its owner's checks`);
  }
  for (const c of Object.keys(CASE_IMPORT_CHECKS).filter((c) => !["IMPORT_ACCEPT_NO_REASON", "IMPORT_FLAG_NO_ISSUE"].includes(c)))
    assert.ok(!JUSTIFICATION_REFUSALS.includes(c), c);
  /* negative controls: the same comparison sees a misgraded op */
  assert.notDeepEqual({ ...grades, importflag: ["rung", "reversible"] }, R35_GRADES);
  assert.notDeepEqual({ ...grades, caseimport: ["rung", "reasoned"] }, R35_GRADES);
  for (const op of Object.keys(R35_GRADES)) {
    const d = A.decorate({ id: op, label: "x" }, null);
    assert.equal((d.rung === null) !== (d.rung_absence === null), true, `R24: ${op}`);
    assert.equal(NON_ACTS[op], IMPORT_DIRECTED, op);
  }
  for (const op of R35_READS) {
    assert.ok(NON_ACTS[op]?.startsWith("read: ") && NON_ACTS[op].length > 40, op);
    assert.match(NON_ACTS[op], /writes nothing$/, op);
    assert.ok(!Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  }
  for (const op of R35_PUBLIC) {
    assert.equal(NON_ACTS[op], "read: public, no credential", op);
    assert.ok(!Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  }
  const ALL = [...Object.keys(R35_GRADES), ...R35_READS, ...R35_PUBLIC];
  assert.ok(![...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].some((a) => ALL.includes(a.id)));
  assert.deepEqual(ALL.filter((op) => Object.hasOwn(MACHINE_REFUSALS, op)), [], "MACHINE_REFUSALS holds only ACTS (R7, R20)");
  /* no vocabulary is added: R4's list is unchanged by R35 (its test above holds the exact keys), and none names an import */
  assert.deepEqual(Object.keys(VOCABULARIES).filter((k) => /import|checker|case_file/.test(k)), []);
  /* the control plane's rows (op-declarations R14): the six writes mutating, every op gated */
  const table = [...Object.keys(R35_GRADES).map((op) => ({ op, mutating: true, gated: true })),
    ...[...R35_READS, ...R35_PUBLIC].map((op) => ({ op, mutating: false, gated: true }))];
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => ALL.includes(op)), []);
  /* negative controls: carried by no row, each reads stale; a read carried ungated reads stale; an op left out reads
     unpublished and unranked */
  assert.deepEqual(ALL.filter((op) => !A.unaccounted([]).stale.includes(op)), []);
  for (const op of [...R35_READS, ...R35_PUBLIC])
    assert.ok(A.unaccounted([{ op, mutating: false, gated: false }]).stale.includes(op), op);
  const left = A.unaccounted([...table, { op: "importunnamed", mutating: true, gated: true }]);
  assert.deepEqual([left.unpublished, left.unranked], [["importunnamed"], ["importunnamed"]]);
});
