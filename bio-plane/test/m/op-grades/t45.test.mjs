/* op-grades: T45's grades (R32), at the module's exports. Every op T45's owners serve (the ops `op-declarations` R49
   declares), graded by R5 and R3, each op named here with the grade read from its owner's requirements. `op-declarations`
   merges after this module in layer 11, so the totality is held here over a stand-in of the table it declares, by
   `affordances` R12's rule; the real totality runs again at its merge. */
import test from "node:test";
import assert from "node:assert/strict";
import { RUNGS, RUNG_ABSENT, NON_ACTS, MACHINE_REFUSALS, JUSTIFICATION_REFUSALS, CONSEQUENCE_STATEMENTS, IRREVERSIBLE_WEIGHT,
         LARGER_SCREEN_ACTS, OP_ALIASES, phoneOf } from "../../../src/op-grades/index.mjs";
import * as T45 from "../../../src/op-grades/t45.mjs";

const gradeOf = (op) => Object.hasOwn(RUNGS, op) ? RUNGS[op] : Object.hasOwn(RUNG_ABSENT, op) ? RUNG_ABSENT[op].ground : null;
const isRead = (op) => typeof NON_ACTS[op] === "string" && NON_ACTS[op].startsWith("read: ") && /writes nothing$/.test(NON_ACTS[op]);
const grades = (ops) => Object.fromEntries(Object.keys(ops).map((op) => [op, gradeOf(op)]));

/* R32's grades, op by op, each read from its owner */
const R32_WRITES = {
  /* action-plans R39, R40 */
  scenariosetaside: "reasoned", scenariorestore: "reasoned", planpause: "reasoned", planresume: "reasoned",
  /* answers R34 (R32: a member's own standing question) */
  standingendset: "caller-owned",
  /* duties R30 (as dutypropose) */
  dutyfromresponse: "undetermined",
  /* actions R80, R87, R88 */
  actionreceipt: "undetermined", actionscope: "reasoned", actionpromise: "reversible",
  /* action-holds R11, R12 */
  holdnoticesent: "undetermined", pressurerecord: "undetermined",
  /* following R22, R23, R25 (R32 names them) */
  followend: "reversible", watchlink: "undetermined", watchanswer: "undetermined",
  /* filings R36, R42, R47 */
  filingsecondapprove: "terminal", jointsignatory: "undetermined", holdnoticeprepare: "undetermined",
  /* case-check R1 (graded as publish, K2839) */
  publishcheck: "irreversible",
  /* project-roster R21, R24 */
  projectscopeset: "reasoned", projectapprovalset: "reasoned",
  /* action-replies R1, R2 */
  actionreplybearing: "reversible", actionbearingpropose: "reversible", arosefrom: "undetermined",
  /* consequences R17, R21, R22 */
  successrecord: "undetermined", successrevise: "reasoned", outcomecarry: "undetermined",
  /* plan-work R1, R4, R5, R6, R8, R11 */
  matteroutcomeset: "reversible", planreviewrhythm: "caller-owned", planreviewrecord: "undetermined",
  prepitemadd: "undetermined", prepitemtakeup: "caller-owned", prepitemdone: "undetermined", plancomment: "reversible",
  statusreportsave: "undetermined", itemtakeup: "caller-owned",
  /* action-clocks R18 (as clockadopt) */
  clockstate: "undetermined",
  /* conformance R36 */
  curelink: "reversible", cureunlink: "reasoned",
  /* local-facts R10, R11, R13 */
  ruledraft: "reasoned", ruleconfirm: "undetermined", rulewithdraw: "reasoned",
};
/* the code each `reasoned` op's owner refuses an absent reason with */
const R32_CODES = {
  scenariosetaside: "PLAN_NO_REASON", scenariorestore: "PLAN_NO_REASON", planpause: "PLAN_NO_REASON",
  planresume: "PLAN_NO_REASON", actionscope: "SCOPE_NO_REASON", projectscopeset: "NO_REASON",
  projectapprovalset: "NO_REASON", successrevise: "SUCCESS_NO_REASON", cureunlink: "CONFORMANCE_NO_REASON",
  ruledraft: "RULE_NO_REASON", rulewithdraw: "RULE_NO_REASON",
};
/* each `reversible` op and the owner's published act that takes it back (R3) */
const TAKEN_BACK_BY = {
  followend: "followend", actionpromise: "actionpromise", actionreplybearing: "actionreplybearing",
  actionbearingpropose: "actionbearingpropose", curelink: "cureunlink", matteroutcomeset: "matteroutcomeset",
  plancomment: "plancomment",
};
/* every other op T45's owners serve: a read, or (statusreportdraft) a labelled draft that writes nothing */
const R32_READS = ["dutiesarising", "openitemswith", "watchquestions", "templatesforaction", "casecheck", "procedureguides",
  "successread", "successrecords", "matters", "plantimeline", "planreviewopen", "planreviews", "prepitems", "plancomments",
  "whereitstands", "statusreports", "matterpromiseduties", "cures", "ruleoffer"];
const R32_DRAFTS = ["statusreportdraft"];
const ALL = [...Object.keys(R32_WRITES), ...R32_READS, ...R32_DRAFTS];

test("R32: every write T45's owners serve carries R32's grade — the reasoned ones backed by their owner's code in "
   + "JUSTIFICATION_REFUSALS, each reversible one taken back by a graded act of its owner, following's and answers' as R32 "
   + "names them — each with a NON_ACTS reason that is no read and no capture act", () => {
  const got = grades(R32_WRITES);
  assert.deepEqual(got, R32_WRITES);
  assert.deepEqual(Object.keys(R32_WRITES).filter((op) => R32_WRITES[op] === "reasoned").sort(), Object.keys(R32_CODES).sort());
  for (const [op, code] of Object.entries(R32_CODES)) assert.ok(JUSTIFICATION_REFUSALS.includes(code), `${op}: ${code}`);
  assert.deepEqual(Object.keys(R32_WRITES).filter((op) => R32_WRITES[op] === "reversible").sort(),
    Object.keys(TAKEN_BACK_BY).sort());
  for (const [op, by] of Object.entries(TAKEN_BACK_BY)) assert.notEqual(gradeOf(by), null, `${op} taken back by ${by}`);
  for (const op of Object.keys(R32_WRITES)) {
    assert.ok(typeof NON_ACTS[op] === "string" && NON_ACTS[op].length > 40 && !NON_ACTS[op].startsWith("read: "), op);
    assert.ok(!NON_ACTS[op].startsWith("capture-directed:"), `${op} is no capture act`);
    assert.ok(!NON_ACTS[op].startsWith("draft: "), `${op} writes`);
  }
  for (const [op, e] of Object.entries(T45.T45_RUNG_ABSENT)) assert.ok(e.is.length > 60, op);
  /* each beside the precedent R32 reads it by */
  for (const [op, like] of [["dutyfromresponse", "dutypropose"], ["pressurerecord", "actionpressure"],
    ["filingsecondapprove", "filingapprove"], ["holdnoticeprepare", "communicationprepare"], ["clockstate", "clockadopt"],
    ["statusreportsave", "reportkeep"], ["prepitemdone", "checkpointrecord"], ["ruleconfirm", "templateapprove"],
    ["plancomment", "reviewcomment"], ["actionbearingpropose", "actionseekspropose"], ["publishcheck", "publish"],
    ["itemtakeup", "reminderset"], ["standingendset", "standingend"]])
    assert.equal(gradeOf(op), gradeOf(like), `${op} as ${like}`);
  /* negative controls: a misgrade is seen, and the grounds class (K1025) is not extended */
  assert.notDeepEqual({ ...got, actionscope: "undetermined" }, R32_WRITES);
  assert.notEqual(gradeOf("actionreceipt"), gradeOf("actioncorrespond"));
  assert.notEqual(gradeOf("successrecord"), gradeOf("consequencerecord"));
});

test("R32: every other op T45's owners serve is a read, a NON_ACTS row beginning `read: …` that writes nothing and takes "
   + "no grade; statusreportdraft is a draft, `draft: …`, writing nothing", () => {
  for (const op of R32_READS) {
    assert.ok(isRead(op) && NON_ACTS[op].length > 30, op);
    assert.equal(gradeOf(op), null, op);
  }
  for (const op of R32_DRAFTS) {
    assert.ok(NON_ACTS[op].startsWith("draft: ") && /writes nothing of the record/.test(NON_ACTS[op]), op);
    assert.equal(gradeOf(op), null, op);
  }
  /* negative control */
  assert.ok(!isRead("successrecord"));
});

test("R32 R1 (K2857): JUSTIFICATION_REFUSALS gains the codes T45's owners refuse an absent reason with — "
   + "SCOPE_NO_REASON, ADDRESSED_NO_REASON (addressedrecord's, in place of NO_REASON), SUCCESS_NO_REASON, RULE_NO_REASON — "
   + "and the reasons R32 names inside existing acts, CONTRADICTED_HELD, DOCUMENT_FIRST_NO_REASON and OVERRIDE_NO_GROUND, "
   + "each once; the objects they ask for stay out; no existing rung changes", () => {
  for (const c of ["SCOPE_NO_REASON", "ADDRESSED_NO_REASON", "SUCCESS_NO_REASON", "RULE_NO_REASON", "CONTRADICTED_HELD",
    "DOCUMENT_FIRST_NO_REASON", "OVERRIDE_NO_GROUND"])
    assert.equal(JUSTIFICATION_REFUSALS.filter((x) => x === c).length, 1, c);
  assert.equal(new Set(JUSTIFICATION_REFUSALS).size, JUSTIFICATION_REFUSALS.length, "no code twice");
  /* the codes that ask an object, a choice or a form, never an account, stay out */
  for (const c of ["SCOPE_UNCHANGED", "NO_SUCH_SCENARIO", "SCENARIO_ALREADY_SET_ASIDE", "PLAN_NOT_OPEN", "PLAN_NOT_PAUSED",
    "RECEIPT_NOT_ON_SENT", "NEITHER_CAPTURE_NOR_TESTIMONY", "PROMISE_REFUSED", "HOLD_NOT_IN_PLACE", "NOT_A_PARTNER",
    "JOINT_FINGERPRINT_MISMATCH", "SAME_APPROVER", "SECOND_APPROVAL_NEEDED", "PROJECT_SCOPE_UNKNOWN",
    "APPROVAL_RULE_INVALID", "BEARING_REFUSED", "AROSE_FROM_LINKED", "SUCCESS_NO_STATEMENT", "SUCCESS_NO_EVIDENCE",
    "CURE_LINKED", "RULE_ENTRY_INVALID", "RULE_NEEDS_QUALIFICATION", "WATCH_END_REFUSED", "NO_SUCH_WATCH",
    "OVERRIDE_GROUND_REFUSED", "ASSERTION_UNRESOLVED", "MACHINE_CANNOT_SET_SCOPE"])
    assert.ok(!JUSTIFICATION_REFUSALS.includes(c), c);
  /* the rungs of the existing acts those reasons sit inside are unchanged (R3's 21 hold optionstart) */
  assert.deepEqual([RUNGS.filingapprove, RUNG_ABSENT.optionstart.ground, RUNGS.addressedrecord],
    ["terminal", "undetermined", "reasoned"]);
});

test("R32 R5 R18 R21: none of T45's ops is in MACHINE_REFUSALS; phone follows the rung (publishcheck and "
   + "filingsecondapprove off the phone); publishcheck carries the Irreversible weight by R21's rule; no consequence "
   + "statement, larger-screen entry or alias is added", () => {
  assert.deepEqual(ALL.filter((op) => Object.hasOwn(MACHINE_REFUSALS, op)), []);
  assert.deepEqual(ALL.filter((op) => !phoneOf(op)).sort(), ["filingsecondapprove", "publishcheck"]);
  assert.ok(IRREVERSIBLE_WEIGHT.includes("publishcheck"));
  assert.deepEqual(ALL.filter((op) => IRREVERSIBLE_WEIGHT.includes(op)), ["publishcheck"]);
  for (const op of ALL) {
    assert.ok(!Object.hasOwn(CONSEQUENCE_STATEMENTS, op), op);
    assert.ok(!LARGER_SCREEN_ACTS.includes(op), op);
    assert.ok(!Object.hasOwn(OP_ALIASES, op) && !Object.values(OP_ALIASES).includes(op), op);
  }
  /* negative control: a reasoned T45 op is a phone act */
  assert.equal(phoneOf("actionscope"), true);
});

test("R32: T45's tables hold exactly these ops, none both graded and stated absent; the assertion resolution is filings' "
   + "approval (reconciliation R1), no op of its own", () => {
  assert.deepEqual(Object.keys(T45).sort(), ["T45_NON_ACTS", "T45_RUNGS", "T45_RUNG_ABSENT"]);
  assert.deepEqual([...Object.keys(T45.T45_RUNGS), ...Object.keys(T45.T45_RUNG_ABSENT)].sort(), Object.keys(R32_WRITES).sort());
  assert.deepEqual(Object.keys(T45.T45_NON_ACTS).sort(), [...ALL].sort());
  for (const [op, v] of Object.entries(T45.T45_RUNGS)) assert.equal(RUNGS[op], v, op);
  for (const [op, e] of Object.entries(T45.T45_RUNG_ABSENT)) assert.equal(RUNG_ABSENT[op], e, op);
  for (const [op, w] of Object.entries(T45.T45_NON_ACTS)) assert.equal(NON_ACTS[op], w, op);
  assert.deepEqual(Object.keys(RUNGS).filter((op) => Object.hasOwn(RUNG_ABSENT, op)), []);
  for (const t of [RUNGS, RUNG_ABSENT, NON_ACTS]) assert.ok(!Object.keys(t).some((op) => /assertionresol/.test(op)));
  /* not served in T45 (escalation R31, T46): no grade yet */
  for (const op of ["escalationstoppursuing", "escalationreopen"]) assert.equal(Object.hasOwn(NON_ACTS, op), false, op);
});

/* `unaccounted`'s two totalities over a stand-in of op-declarations R49's rows (t41.test.mjs' shape): each write
   mutating, each read and the draft not, every op gated by a NEEDS row */
const STAND_IN = [...Object.keys(R32_WRITES).map((op) => ({ op, mutating: true, gated: true })),
  ...[...R32_READS, ...R32_DRAFTS].map((op) => ({ op, mutating: false, gated: true }))];
const unaccountedOver = (rows) => {
  const mutating = new Set(rows.filter((r) => r.mutating).map((r) => r.op));
  const gated = new Set(rows.filter((r) => r.gated).map((r) => r.op));
  return {
    unpublished: [...gated].filter((op) => !Object.hasOwn(NON_ACTS, op)).sort(),
    unranked: [...mutating].filter((op) => !Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op)).sort(),
    stale: rows.map((r) => r.op).filter((op) => !mutating.has(op) && (Object.hasOwn(RUNGS, op)
      || Object.hasOwn(RUNG_ABSENT, op)) || !gated.has(op) && Object.hasOwn(NON_ACTS, op)).sort(),
  };
};
test("R32: affordances R12's totality holds over a stand-in of op-declarations R49's rows — none unpublished, unranked or "
   + "stale", () => {
  assert.deepEqual(unaccountedOver(STAND_IN), { unpublished: [], unranked: [], stale: [] });
  /* negative controls: an ungraded new op is unranked and unpublished; a write carried as a read is stale */
  const left = unaccountedOver([...STAND_IN, { op: "plannew", mutating: true, gated: true }]);
  assert.deepEqual([left.unranked, left.unpublished], [["plannew"], ["plannew"]]);
  assert.deepEqual(unaccountedOver(STAND_IN.map((r) => r.op === "curelink" ? { ...r, mutating: false } : r)).stale, ["curelink"]);
});
