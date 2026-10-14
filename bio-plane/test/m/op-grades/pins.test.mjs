/* op-grades: the content of its tables pinned until T45 only in `affordances`' tests (N891; T45-38; AFFORDANCES #29 J1,
   K2773), pinned here at this module's exports so that `affordances` may drop its copies (T45-39). No requirement changes
   and no id is added: each test pins R1–R32 as written. This module uses nothing (P4), so no owner and no later module is
   imported: what affordances read from an owner's op map or checks table is named here as the requirements name it. */
import test from "node:test";
import assert from "node:assert/strict";
import * as G from "../../../src/op-grades/index.mjs";
import { T33_RUNGS, T33_RUNG_ABSENT, T33_NON_ACTS } from "../../../src/op-grades/t33.mjs";
import { T34_RUNGS, T34_RUNG_ABSENT, T34_NON_ACTS } from "../../../src/op-grades/t34.mjs";
import { T35_RUNGS, T35_RUNG_ABSENT } from "../../../src/op-grades/t35.mjs";
import { T36_RUNG_ABSENT } from "../../../src/op-grades/t36.mjs";
import { T41_RUNG_ABSENT } from "../../../src/op-grades/t41.mjs";
import { T45_RUNGS, T45_RUNG_ABSENT } from "../../../src/op-grades/t45.mjs";

const { RUNGS, RUNG_ABSENT, NON_ACTS, JUSTIFICATION_REFUSALS, CONSEQUENCE_STATEMENTS, IRREVERSIBLE_CORRECTION_PATH,
        OP_ALIASES } = G;
const gradeOf = (op) => Object.hasOwn(RUNGS, op) ? RUNGS[op] : Object.hasOwn(RUNG_ABSENT, op) ? RUNG_ABSENT[op].ground : null;
const ungraded = (op) => !Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op);
const readWritesNothing = (op) => typeof NON_ACTS[op] === "string" && NON_ACTS[op].startsWith("read: ")
  && NON_ACTS[op].length > 40 && /writes nothing$/.test(NON_ACTS[op]);
const bandsOf = (rungs) => {
  const got = {};
  for (const [op, r] of Object.entries(rungs)) (got[r] ??= []).push(op);
  for (const k of Object.keys(got)) got[k].sort();
  return got;
};
const undeterminedOf = (absent) => Object.keys(absent).filter((op) => absent[op].ground === "undetermined").sort();

/* ---- R1, R3: RUNGS as a closed partition ---------------------------------------------------------------------------- */
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
const T41_REASONED = ["projectaikeepaway", "milestoneremove", "milestoneitemremove", "projectclosewithgaps",
  "hypothesissetaside", "guidereview", "guideretire", "stepaccept"];
const T41_REVERSIBLE = ["stepcreate", "stepstart", "stepend", "stepwait", "stepwaitremove", "stepcostadd", "stepcostremove",
  "questionfollow", "stepsrunai", "milestoneset", "milestonerevise", "hypothesistakeup", "noteshare", "noteunshare",
  "approvalruleset", "actionseekspropose", "stepoutcome", "stepbywhen", "guidepropose"];
const T41_UNDETERMINED = ["stepdelete", "steprefer", "stepproduct", "costmessage", "findaccept", "reportkeep",
  "interviewkeep", "narrativeclaim", "claimfindstep", "claimfound", "planaccept", "projectwatch", "proposalaccept",
  "bearingnote", "guidedraft", "guideoffer", "guideadopt", "accountpropose", "caseapprove", "grouptestset",
  "captureupload", "steplearn", "guideproposetocivicsmith"];

test("R1 R3 R33 (N891): RUNGS is a closed partition — every op it ranks is one a requirement ranks, in its band, and no other; "
   + "DEC-88's three bands word for word among them; a misbanded op, or one of the 57 left out, is seen", () => {
  const want = {
    irreversible: ["publishat", "publishatmove" /* R14 */],
    attested: ["attest", "caseratify", "ratify", "reattest", "captureaccount", "noticepost" /* R7 */, "docketpost" /* R9 */],
    terminal: ["retire", "actionholdrelease" /* R8 */, "publish" /* R37 (T47; K3100 doubt 9) */],
    reversible: ["actionlaws", "cite", "escalationresume", "projectvisibilityset", "versionaccept", "versioncurrent",
      "versionhide", "versionrevert", "sourceconsentwithdraw", "scenarioset", "importwatch", "importunwatch" /* R12 */,
      "publishatcancel" /* R14 */, "inboxpull" /* R35 (T47) */, ...DEC88.reversible],
    reasoned: ["actionmove", "actionrisktier", "addressedrecord", "adminremove", "aliaswithdraw", "aspirationdepart",
      "aspirationretire", "biasdebtresolve", "conclude", "connectionassert", "consequencerevise", "determine", "discharge",
      "dispose", "escalationadvance", "escalationdecline", "escalationevaluate", "escalationsuspend", "filemembershipjudge",
      "goalclose", "inquirydivide", "inquiryground", "narrow", "projectownerremove", "projectownerrescue", "proposedispose",
      "reevaluationrecord", "reinstate", "relationdeclare", "relationwithdraw", "release", "reopen", "sever", "themewithdraw",
      "triage", "versionconsider", "versionreject", "withdrawconclusion", "contradictionclarify", "contradictiondismiss",
      "contradictionresolve", "contradictiontakeup", "resolutiondefect", "sourcedisclose", "sourcelink", "sourceconsent",
      "plansubjectadd", "plansubjectremove", "optionrevise", "optiondispose", "planclose", "actionhold", "templateretire",
      "factconfirm", "declinetoescalate", "heldsetaside", "heldrestore", "addressfrequencyset", "docketfile",
      "docketdecline", "importaccept", "importacceptwithdraw", "importflag", "importflagclear", "wizardretire",
      ...DEC88.reasoned],
  };
  want.terminal.push(...DEC88.terminal);
  /* R13, R17, R22: the per-tranche tables, each pinned op by op in owners.test.mjs and t35.test.mjs */
  for (const t of [T33_RUNGS, T34_RUNGS, T35_RUNGS]) for (const [op, r] of Object.entries(t)) want[r].push(op);
  /* R23–R31, R32, named by hand as their requirements word them */
  want.reasoned.push("standardinforcethrough", "standardinforcethroughwithdraw", "spotcheckvisit", "releasescanhold",
    "aikeepaway", "obscuremarkwithdraw", ...T41_REASONED);
  want.reversible.push("translationadopt", "translationconfirm", "translationrevert", "obscuremark", ...T41_REVERSIBLE);
  want.reasoned.push("scenariosetaside", "scenariorestore", "planpause", "planresume", "actionscope", "projectscopeset",
    "projectapprovalset", "successrevise", "cureunlink", "ruledraft", "rulewithdraw");
  want.reversible.push("followend", "actionpromise", "actionreplybearing", "actionbearingpropose", "curelink",
    "matteroutcomeset", "plancomment", "declaredstakeset" /* B6, K2896 */);
  want.terminal.push("publishcheck" /* graded as publish (K2883), so terminal with it since R37 */);
  /* R33 (T46) */
  want.reasoned.push("escalationstoppursuing", "escalationreopen");
  want.terminal.push("filingsecondapprove");
  /* R36, R37 (T47) */
  want.reversible.push("drawquestion", "monitorset", "grouplogoset", "grouplanguagesset", "signrequest");
  want.reasoned.push("projectbarset");
  /* R38, R40, R41 (T48) */
  want.reversible.push("actionreplyquoting", "updatelater", "updatestart", "planask");
  want.reasoned.push("updateskip", "stepsource", "stepsourcewithdraw");
  for (const [a, op] of Object.entries(OP_ALIASES)) if (Object.hasOwn(RUNGS, op)) want[RUNGS[op]].push(a);
  for (const k of Object.keys(want)) want[k].sort();
  assert.deepEqual(bandsOf(RUNGS), want);
  assert.equal(Object.values(DEC88).flat().length, 57);
  /* the per-tranche tables are spread whole */
  for (const [op, r] of Object.entries(T45_RUNGS)) assert.equal(RUNGS[op], r, op);
  /* negative controls */
  assert.notDeepEqual(bandsOf({ ...RUNGS, testify: "reversible" }), want);
  const { suggest, ...withoutOne } = RUNGS;
  assert.equal(suggest, "reversible");
  assert.notDeepEqual(bandsOf(withoutOne), want);
});

test("R1 R8 R14 R32 R33 R37 (N891): the closed `terminal` set is retire, DEC-88's two, actionholdrelease, (T45) "
   + "filingsecondapprove and (T47, R37) publish and publishcheck, which prepare; `irreversible` is the two that set when a "
   + "signed edition publishes", () => {
  const of = (r) => Object.keys(RUNGS).filter((op) => RUNGS[op] === r && !Object.hasOwn(OP_ALIASES, op)).sort();
  assert.deepEqual(of("terminal"), ["actionholdrelease", "escalationend", "filingapprove", "filingsecondapprove", "publish",
    "publishcheck", "retire"]);
  assert.deepEqual(of("irreversible"), ["publishat", "publishatmove"]);
  /* negative control */
  assert.notDeepEqual(of("terminal"), ["actionholdrelease", "escalationend", "filingapprove", "retire"]);
});

/* ---- R3: the `undetermined` ground, closed, with its tally ----------------------------------------------------------- */
/* R3's 21, less inboxpull, which R35 (T47) moves to `reversible` */
const R3_LEFT = ["contradictionrecommend", "contradictionoptin", "contradictionrespond", "communicationprepare",
  "templatesave", "actioncreate", "actionpressure", "planopen", "optionadd", "optionpropose", "optionadopt",
  "checkpointrecord", "optionstart", "templatedraft", "templaterevise", "templatepropose", "templatesubmit",
  "templatereview", "templatecomment", "templateapprove"];
test("R3 R33 R35 (N891): the `undetermined` ground is closed — exactly R3's 21 less inboxpull (R35) and the ops ruled onto "
   + "it later on R3's rule, deepercheck no longer among them, and no other; the 78 held before DEC-88 are the 21 and "
   + "DEC-88's 57; a later op left out, or one of the 57 left there, is seen", () => {
  const LATER = ["whatchangedpropose", "docketpressure", "caseimport", "caseimportdocument", "wizarddraft", "wizardrevise",
    "wizardpropose", "wizardsubmit", "wizardapprove", ...undeterminedOf(T33_RUNG_ABSENT), ...undeterminedOf(T34_RUNG_ABSENT),
    ...undeterminedOf(T35_RUNG_ABSENT), "safecopyrequest", "translationmark" /* R39 (T48): translationdraft left the ground */,
    ...T41_UNDETERMINED, "pagetranscribe",
    /* R32 (T45), named by hand */
    "dutyfromresponse", "actionreceipt", "holdnoticesent", "pressurerecord", "watchlink", "watchanswer", "jointsignatory",
    "holdnoticeprepare", "arosefrom", "successrecord", "outcomecarry", "clockstate", "planreviewrecord", "prepitemadd",
    "prepitemdone", "statusreportsave", "ruleconfirm", "advocacycheck" /* K2881 */,
    /* R33 (T46), named by hand */
    "airundispatch",
    ...Object.keys(OP_ALIASES).filter((a) => RUNG_ABSENT[OP_ALIASES[a]]?.ground === "undetermined")];
  assert.equal(new Set(LATER).size, LATER.length);
  assert.deepEqual(undeterminedOf(T36_RUNG_ABSENT), ["safecopyrequest"]);
  assert.deepEqual(undeterminedOf(T41_RUNG_ABSENT), [...T41_UNDETERMINED].sort());
  assert.equal(undeterminedOf(T45_RUNG_ABSENT).length, 18);
  const left = undeterminedOf(RUNG_ABSENT).filter((op) => !LATER.includes(op));
  assert.deepEqual(left, [...R3_LEFT].sort());
  assert.equal(left.length, 20, "R3's count: DEC-88 moved 57 of the 78 into RUNGS, and R35 inboxpull");
  assert.equal(undeterminedOf(RUNG_ABSENT).length, LATER.length + 20);
  assert.ok(!undeterminedOf(RUNG_ABSENT).includes("inboxpull") && !undeterminedOf(RUNG_ABSENT).includes("deepercheck"));
  /* the 78 held before DEC-88: the 21 (inboxpull among them then) and the 57 together */
  const before78 = [...R3_LEFT, "inboxpull", ...Object.values(DEC88).flat()];
  assert.equal(before78.length, 78);
  assert.equal(new Set(before78).size, 78);
  for (const op of Object.values(DEC88).flat()) assert.ok(Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  /* negative controls */
  assert.notDeepEqual(undeterminedOf({ ...RUNG_ABSENT, suggest: { ground: "undetermined", is: "x" } })
    .filter((op) => !LATER.includes(op)), [...R3_LEFT].sort());
  assert.deepEqual(undeterminedOf(RUNG_ABSENT).filter((op) => !LATER.includes(op) || op === "ruleconfirm")
    .filter((op) => !R3_LEFT.includes(op)), ["ruleconfirm"]);
});

/* ---- R2, R5: layer 9's NON_ACTS and read rows ------------------------------------------------------------------------ */
const LAYER9_RUNGS = ["standarddeclare", "standardpropose", "standardadopt", "comparisonpropose", "consequencerecord",
  "filingprepare", "filingapprove", "filingsent", "counselpacket", "theorypropose", "escalationopen", "escalationattach",
  "escalationend", "consequencerevise", "addressedrecord", "escalationevaluate", "escalationadvance", "escalationdecline",
  "escalationsuspend", "escalationresume", "determine", "plansubjectadd", "plansubjectremove", "optionrevise",
  "optiondispose", "planclose", "scenarioset", "actionhold"];
const LAYER9_ABSENT = { counselpacketexport: "substrate", communicationprepare: "undetermined",
  templatesave: "undetermined", actioncreate: "undetermined", actionpressure: "undetermined", planopen: "undetermined",
  optionadd: "undetermined", optionpropose: "undetermined", optionadopt: "undetermined", checkpointrecord: "undetermined",
  optionstart: "undetermined", reminderset: "caller-owned", reminderanswer: "caller-owned" };
/* reads with no NEEDS row: named in no registry (a row for an ungated op reads `stale`, affordances R12) */
const LAYER9_UNGATED_READS = ["standard", "standards", "determination", "determinations", "comparison", "comparisonfacts",
  "consequence", "consequencesof", "addressed", "counselpacketread", "filingsfor", "availableactions", "escalation",
  "escalationsdue", "action", "actions", "plan", "plans", "planproposals", "monitoring", "escalationstatus",
  "doorbellrefused", "provenanceroutes", "projectstage", "contradictionmeasures", "securitycount"];
const LAYER9_GATED_READS = ["optionstartpreview", "standardinforce"];
test("R2 R5 (N891): layer 9's 41 writes each carry a NON_ACTS reason of more than ten characters and no capture act, its "
   + "stated absences their sentence and ground, its two gated reads a `read:` reason writing nothing and no grade, "
   + "actionriskpropose named, and its ungated reads named in no table", () => {
  const writes = [...LAYER9_RUNGS, ...Object.keys(LAYER9_ABSENT)];
  assert.equal(writes.length, 41);
  /* (T45; R8, R32) the ones affordances R51 makes ACTS rows are named in NON_ACTS no longer */
  const ACTS_NOW = ["actionhold", "actionpressure", "escalationopen", "escalationattach", "filingprepare", "filingapprove",
    "filingsent", "counselpacket", "communicationprepare", "reminderset"];
  for (const op of writes.filter((op) => !ACTS_NOW.includes(op)))
    assert.ok(typeof NON_ACTS[op] === "string" && NON_ACTS[op].length > 10 && !NON_ACTS[op].startsWith("capture-directed:"), op);
  for (const op of ACTS_NOW) assert.ok(!Object.hasOwn(NON_ACTS, op), op);
  for (const op of LAYER9_RUNGS) assert.ok(Object.hasOwn(RUNGS, op), op);
  for (const [op, ground] of Object.entries(LAYER9_ABSENT)) {
    assert.equal(RUNG_ABSENT[op]?.ground, ground, op);
    assert.ok(RUNG_ABSENT[op].is.length > 20, op);
  }
  for (const op of LAYER9_GATED_READS) { assert.ok(readWritesNothing(op), op); assert.ok(ungraded(op), op); }
  assert.ok(Object.hasOwn(NON_ACTS, "actionriskpropose"));
  for (const op of LAYER9_UNGATED_READS)
    for (const t of [NON_ACTS, RUNGS, RUNG_ABSENT]) assert.ok(!Object.hasOwn(t, op), op);
  /* negative control */
  assert.ok(Object.hasOwn({ ...NON_ACTS, monitoring: "read: x" }, "monitoring"));
});

/* ---- R5: every reason, and the substrate and directed forms ---------------------------------------------------------- */
test("R5 (N891): every NON_ACTS reason is a sentence of more than ten characters, `capture-directed:` exactly for attest, "
   + "attesttext and monitor; acts and their own non-act rows are apart (sourceconsent, contradictionresolve, knock, "
   + "knockerconsent named nowhere in NON_ACTS)", () => {
  for (const [op, r] of Object.entries(NON_ACTS)) assert.ok(typeof r === "string" && r.length > 10, op);
  assert.deepEqual(Object.keys(NON_ACTS).filter((op) => NON_ACTS[op].startsWith("capture-directed:")).sort(),
    ["attest", "attesttext", "monitor"]);
  for (const op of ["sourceconsent", "contradictionresolve", "knock", "knockerconsent"])
    assert.ok(!Object.hasOwn(NON_ACTS, op), op);
});

test("R2 R5 R6 (N891): the substrate and directed forms — the provenance pair `substrate` and document-directed; "
   + "templatesave draft-directed citing filings R32; the grant's door named by exactly the four it reaches; the template "
   + "grant's revoke on reviewrevoke's ground", () => {
  for (const op of ["provenancechain", "provenanceroute"]) {
    assert.equal(RUNG_ABSENT[op]?.ground, "substrate", op);
    assert.ok(!Object.hasOwn(RUNGS, op), op);
    assert.ok(NON_ACTS[op]?.startsWith("document-directed: ") && NON_ACTS[op].length > 60, op);
  }
  assert.ok(NON_ACTS.templatesave.startsWith("draft-directed:"));
  assert.match(RUNG_ABSENT.templatesave.is, /filings R32/);
  const DOOR = ["templatereview", "templatecomment", "templateread", "templatecomments"];
  const TEMPLATE = Object.keys(NON_ACTS).filter((op) => op.startsWith("template") && op !== "templatesave");
  for (const op of TEMPLATE) assert.equal(NON_ACTS[op].includes("reached also through a review grant's door"), DOOR.includes(op), op);
  assert.equal(RUNG_ABSENT.templategrantrevoke.ground, RUNG_ABSENT.reviewrevoke.ground);
  assert.match(NON_ACTS.contradictionpairs, /five named keys/);
  assert.doesNotMatch(NON_ACTS.ratify, /deferred/i);
  for (const re of [/`pulled` arm is the pull/, /op=inboxpull/, /reason on every arm/]) assert.match(NON_ACTS.inboxresolve, re);
  /* negative control */
  assert.ok(!NON_ACTS.templates.includes("reached also through a review grant's door"));
});

/* ---- R4, R8: the consequence statements' keys --------------------------------------------------------------------- */
test("R4 R8 R21 R24 (N891): every CONSEQUENCE_STATEMENTS entry is {friction, statement} with a statement over 80 "
   + "characters; filingapprove's names that it is approved once; actionholdrelease's names what is purged again and the "
   + "transcripts deleted; the correction path names the further edition and the withdrawal", () => {
  for (const [op, c] of Object.entries(CONSEQUENCE_STATEMENTS)) {
    assert.deepEqual(Object.keys(c).sort(), ["friction", "statement"], op);
    assert.ok(["dialog", "in-place"].includes(c.friction), op);
    assert.ok(typeof c.statement === "string" && c.statement.length > 80, op);
  }
  assert.match(CONSEQUENCE_STATEMENTS.filingapprove.statement, /approved once/);
  assert.match(CONSEQUENCE_STATEMENTS.actionholdrelease.statement, /material may be purged again/);
  assert.match(CONSEQUENCE_STATEMENTS.actionholdrelease.statement,
    /assistant transcripts for them past the time limit will be deleted on each member's device when it is next opened/);
  assert.match(IRREVERSIBLE_CORRECTION_PATH, /edition/);
  assert.match(IRREVERSIBLE_CORRECTION_PATH, /withdrawal/);
  /* negative control */
  assert.ok(!Object.hasOwn(CONSEQUENCE_STATEMENTS, "publishcheck"));
});

/* ---- R13, R17: T33's merged-table identity ------------------------------------------------------------------------ */
test("R13 R17 (N891): the merged tables carry each entry of T33's tables op for op, each stated absence the very entry "
   + "object with its sentence; T34's table names groupswitchset no longer; personexpunge is no alias's op", () => {
  for (const [op, r] of Object.entries(T33_RUNGS)) assert.equal(RUNGS[op], r, op);
  for (const [op, e] of Object.entries(T33_RUNG_ABSENT)) {
    assert.equal(RUNG_ABSENT[op], e, op);
    assert.ok(typeof e.is === "string" && e.is.length > 40, op);
  }
  for (const [op, why] of Object.entries(T33_NON_ACTS)) assert.equal(NON_ACTS[op], why, op);
  assert.equal(Object.hasOwn(T34_NON_ACTS, "groupswitchset"), false);
  assert.equal(Object.values(OP_ALIASES).includes("personexpunge"), false);
  /* negative control: a copy, not the entry, is seen */
  const [op, e] = Object.entries(T33_RUNG_ABSENT)[0];
  assert.notEqual({ ...e }, RUNG_ABSENT[op]);
});

/* ---- R1, R19: the justification family's exclusions --------------------------------------------------------------- */
test("R1 (N891): JUSTIFICATION_REFUSALS holds only codes that ask the member's account, the codes its reasoned ops refuse "
   + "with among them, and every code that asks an object, an identifier, a choice, a form or a member stays out", () => {
  for (const c of JUSTIFICATION_REFUSALS) assert.match(c, /^[A-Z_]+$/);
  for (const c of ["NO_REASON", "VERSION_NO_REASON", "NO_ACKNOWLEDGMENT", "NO_MITIGATION", "NO_CONCLUSION",
    "NO_FALSIFIER", "NO_JUSTIFICATION", "THEME_WITHDRAW_NO_REASON", "FILE_MEMBERSHIP_NO_REASON",
    "CONNECTION_ASSERT_NO_BASIS", "NO_LESSON", "BIAS_DEBT_NO_REASON", "RISK_TIER_REASON_REFUSED", "NARROW_NO_DESCRIPTION",
    "REEVALUATION_NOTE_MALFORMED", "ACTION_MOVE_NO_REASON", "INTENT_NO_REASON", "CONFORMANCE_NO_REASON",
    "ESCALATION_NO_REASON", "TEMPLATE_REASON_REFUSED", "FACT_HOW_REFUSED", "NO_EVIDENCE", "DISMISSAL_REASON_UNKNOWN",
    "CLARIFY_NO_EXPLANATION", "WRONG_SIDE_NO_REASON", "TAKE_UP_NO_QUESTION", "TESTIMONY_NO_WORDS", "TRANSCRIBE_NO_TEXT",
    "ATTEST_NO_NOTE", "LEAD_NO_WORDS", "LEAD_LOOK_NO_DETAIL", "LEAD_SHARE_NO_REASON", "ENTITY_NO_NOTE", "NO_BASIS",
    "RESOLVE_NO_REASON", "SET_ASIDE_NO_REASON", "FREQUENCY_NO_REASON", "BIAS_ADOPTION_NO_REASON", "ATTRIBUTION_NO_REASON",
    "BAR_NO_REASON", "PURSUIT_UNSTATED", "NO_NOTE", "STANDARD_NO_REASON", "PACKET_NO_REASON", "STATEMENT_ACK_NO_REASON",
    "VERSION_ADOPT_NO_REASON", "NO_RATIONALE", "HYPOTHESIS_NO_REASON", "DUTY_NO_REASON", "DOCKET_NO_REASON",
    "IMPORT_ACCEPT_NO_REASON", "IMPORT_FLAG_NO_ISSUE", "WIZARD_REASON_REFUSED"])
    assert.ok(JUSTIFICATION_REFUSALS.includes(c), c);
  const OUT = [
    /* objects, identifiers and documents (R1's deliberate exclusions) */
    "NO_TARGET", "NO_ID", "NO_KIND", "ENTITY_NO_LABEL", "PROGRESSION_NO_LABEL", "EXPERTISE_NO_LABEL", "NO_SUCH_KNOCK",
    "NO_SUCH_COMPARISON", "NOT_AN_ADMIN", "NO_CITATION", "NO_BODY", "NO_TITLE",
    /* contradiction's (N345) */
    "NO_CANDIDATE", "NO_SUCH_CANDIDATE", "MACHINE_CANNOT_ACT_ON_CANDIDATE", "NOT_A_CONTRADICTION_INQUIRY",
    "CLARIFY_CHOICE_UNKNOWN", "TAKE_UP_NO_FRAME",
    /* the template library's and the local facts' (R6) */
    "NO_SUCH_TEMPLATE", "TEMPLATE_TEXT_REFUSED", "NOT_A_DRAFT", "NO_SUCH_FACT", "FACT_ACT_REFUSED", "FACT_VALUE_REFUSED",
    "MACHINE_CANNOT_CONFIRM", "REVIEW_REFUSED",
    /* DEC-88's and T22's owners' others */
    "KNOCK_EMPTY", "NO_IDS", "BAD_FREQUENCY", "NOT_A_SOURCE_OWNER", "ALREADY_OPEN", "NEITHER_CAPTURE_NOR_TESTIMONY",
    "MACHINE_CANNOT_SET_ASIDE", "LEAD_TOO_LONG", "STANDARD_NO_TEXT", "NO_COUNSEL",
    /* the docket's (R9) */
    "DOCKET_KIND_UNKNOWN", "DOCKET_NO_CAPTURE", "NO_SUCH_DOCKET_ENTRY", "MACHINE_CANNOT_MARK_DOCKET_PRESSURE",
    "DOCKET_SIGNATURE_REFUSED",
    /* the wizard library's (R11) */
    "WIZARD_NAME_REFUSED", "WIZARD_STEP_REFUSED", "WIZARD_WHY_REFUSED", "WIZARD_SCOPE_REFUSED",
    "MACHINE_CANNOT_APPROVE_WIZARD", "WIZARD_ALREADY_ENDED",
    /* the note ops' (R15) */
    "MACHINE_CANNOT_NOTE", "NOTE_NO_TEXT", "NOTE_TOO_LONG", "NOTE_TURN_UNKNOWN", "NOTE_TURN_NOT_MADE",
    "NOTE_TOO_LONG_FOR_HUNCH", "HYPOTHESIS_NO_STATEMENT"];
  for (const c of OUT) assert.ok(!JUSTIFICATION_REFUSALS.includes(c), c);
  /* negative control */
  assert.ok([...JUSTIFICATION_REFUSALS, "NO_TARGET"].includes("NO_TARGET"));
});

/* ---- R2, R5: the owners' reads write nothing ----------------------------------------------------------------------- */
test("R2 R5 (N891): every owner's read this module names writes nothing and takes no grade — the sources' and doorbell's, "
   + "capture's held reads, T23's, the hold reads, the docket's, the imports', the wizard library's, the template "
   + "library's, publishschedule, notes, and every T33 read; the public reads take no grade", () => {
  const READS = ["sourceof", "sourcepublishable", "knocksof", "pulledknocks",
    "lateattestations", "captureaccounts", "publishpreflight", "heldcaptures", "gradenote", "doorbelltally",
    "escalationreasondraft", "whatchangeddrafts", "sweeps", "noticeprepare", "notices", "actionholdpreview", "projectholds",
    "docket", "docketprepare", "docketinvitation", "importedcases", "importedcase", "wizards", "wizardread", "wizardsat",
    "wizarduse", "wizardcandidates", "wizardcheck", "baseupdates", "startfrom", "templates", "factstatus", "factsdue",
    "publishschedule", "notes", "optionstartpreview"];
  for (const op of READS) { assert.ok(readWritesNothing(op), op); assert.ok(ungraded(op), op); }
  /* two source reads name who may read them in place of the closing words, and the two grant-door reads end on the door */
  for (const op of ["sourcerung", "sourcereadlog"]) { assert.ok(NON_ACTS[op].startsWith("read: ") && NON_ACTS[op].length > 40, op); assert.ok(ungraded(op), op); }
  for (const op of ["templateread", "templatecomments"]) {
    assert.match(NON_ACTS[op], /^read: .*; writes nothing; reached also through a review grant's door$/, op);
    assert.ok(ungraded(op), op);
  }
  for (const op of ["contradictioncandidates", "contradictiontensions", "contradictionfacts", "contradictionnotices",
    "contradictionresponses", "publishtensions"]) { assert.ok(NON_ACTS[op].startsWith("read: "), op); assert.ok(ungraded(op), op); }
  const T33_READS = Object.keys(T33_NON_ACTS).filter((op) => T33_NON_ACTS[op].startsWith("read: "));
  assert.ok(T33_READS.length > 80);
  for (const op of T33_READS) { assert.match(NON_ACTS[op], /writes nothing$/, op); assert.ok(ungraded(op), op); }
  for (const op of ["activitymethod", "noticespublic", "groupkeyspublic", "docketpublic", "docketfeed", "casechecker",
    "casefilespec", "credit"]) {
    assert.equal(NON_ACTS[op], "read: public, no credential", op);
    assert.ok(ungraded(op), op);
  }
  /* the stated absences whose sentences the reads stand beside */
  for (const op of ["signerregister", "signerrevoke", "knockerconsent", "contradictionrecommend",
    "contradictionoptin", "contradictionrespond", "whatchangedpropose", "docketpressure", "caseimport",
    "caseimportdocument", "notewrite", "noteturn", "wizarddraft", "wizardrevise", "wizardpropose", "wizardsubmit",
    "wizardapprove", "wizardeditorgrant", "wizardeditorrevoke", "wizardprogress", "templatereviewgrant",
    "templategrantrevoke", "templatedraft", "templaterevise", "templatepropose", "templatesubmit", "templatereview",
    "templatecomment", "templateapprove"]) assert.ok(RUNG_ABSENT[op].is.length > 40, op);
  /* negative control: a read that wrote would be seen */
  assert.equal(readWritesNothing("dispose"), false);
});
