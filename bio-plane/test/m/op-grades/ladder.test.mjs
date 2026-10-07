/* op-grades: the ladder and the grades (R1–R4), machine refusals and non-acts (R5), the phone set (R18) and the two
   invariants (R19, R20), each at the module's exports. Backing (`affordances` R19), the machine drive (`affordances` R20)
   and the totality (`affordances` R12) stay in `affordances`' tests, which read these tables; this module uses nothing
   (P4), so no owner is imported here. */
import test from "node:test";
import assert from "node:assert/strict";
import * as G from "../../../src/op-grades/index.mjs";

const { RUNG_LADDER, RUNGS, RUNG_ABSENT, RUNG_ABSENCE_GROUNDS, JUSTIFICATION_REFUSALS, IRREVERSIBLE_CORRECTION_PATH,
        CONSEQUENCE_STATEMENTS, LARGER_SCREEN_ACTS, MACHINE_REFUSALS, NON_ACTS, OP_ALIASES, phoneOf } = G;
const words = (s) => s.trim().split(/[\s,]+/).filter(Boolean);
const gradeOf = (op) => Object.hasOwn(RUNGS, op) ? RUNGS[op] : Object.hasOwn(RUNG_ABSENT, op) ? RUNG_ABSENT[op].ground : null;

/* ---- R1: the ladder and every rung it names, as R1 lists them ---------------------------------------------------- */
const R1 = {
  irreversible: words("publish"),
  attested: words("attest ratify caseratify reattest captureaccount"),
  terminal: words("retire"),
  reversible: words(`actionlaws cite sourceconsentwithdraw escalationresume projectvisibilityset versionaccept versioncurrent
    versionhide versionrevert scenarioset`),
  reasoned: words(`actionhold actionmove actionrisktier addressedrecord adminremove aliaswithdraw aspirationdepart
    aspirationretire biasdebtresolve conclude connectionassert consequencerevise determine discharge dispose
    escalationadvance escalationdecline escalationevaluate escalationsuspend declinetoescalate filemembershipjudge goalclose
    inquirydivide inquiryground narrow projectownerremove projectownerrescue proposedispose reevaluationrecord reinstate
    relationdeclare relationwithdraw release reopen sever themewithdraw triage versionconsider versionreject
    withdrawconclusion contradictiondismiss contradictionclarify contradictiontakeup contradictionresolve resolutiondefect
    sourcedisclose sourcelink sourceconsent plansubjectadd plansubjectremove optionrevise optiondispose planclose
    heldsetaside addressfrequencyset heldrestore`),
};
/* DEC-88's three bands (K1038, J1): its 57, moved from RUNG_ABSENT into RUNGS */
const DEC88 = {
  reversible: words(`suggest extractpropose contradictionpropose themepropose standardpropose comparisonpropose
    theorypropose actionriskpropose actionlawspropose filingprepare contentmint casedraft reviewcomment taskforward
    taskresolve thread connectionchoose themedeclare themeplace entityalias goallink versionkeep airunopen airunclose
    projectfork`),
  reasoned: words(`testify lead leadlook leadshare transcribe transcriptionattest attesttext resolve resolvetestify
    entitycreate versionadopt progressiondefine goaldeclare aspirationdeclare aspirationdeadend objectivecondition biasadopt
    strengthbar standarddeclare standardadopt consequencerecord actioncorrespond filingsent escalationopen escalationattach
    counselpacket attribute statementack workobjective inboxresolve`),
  terminal: words("escalationend filingapprove"),
};

test("R1: RUNG_LADDER is reversible, reasoned, terminal, attested, irreversible, low to high, and RUNGS assigns every op "
   + "R1 names, DEC-88's 57 among them, the rung R1 gives it", () => {
  assert.deepEqual(RUNG_LADDER, ["reversible", "reasoned", "terminal", "attested", "irreversible"]);
  for (const [rung, ops] of Object.entries(R1)) for (const op of ops) assert.equal(RUNGS[op], rung, op);
  assert.equal(Object.values(DEC88).flat().length, 57);
  for (const [rung, ops] of Object.entries(DEC88)) for (const op of ops) {
    assert.equal(RUNGS[op], rung, op);
    assert.ok(!Object.hasOwn(RUNG_ABSENT, op), `${op} left RUNG_ABSENT`);
  }
  /* every rung any op carries is a rung of the ladder */
  for (const [op, rung] of Object.entries(RUNGS)) assert.ok(RUNG_LADDER.includes(rung), op);
  /* negative control: a misgraded op is seen */
  const wrong = (rungs) => Object.entries(R1).flatMap(([rung, ops]) => ops.filter((op) => rungs[op] !== rung));
  assert.deepEqual(wrong(RUNGS), []);
  assert.deepEqual(wrong({ ...RUNGS, retire: "reasoned" }), ["retire"]);
});

test("R1: IRREVERSIBLE_CORRECTION_PATH states that correction moves forward and nothing is erased (DEC-19), and "
   + "JUSTIFICATION_REFUSALS is the family of codes by which an owner asks the member's own account", () => {
  assert.match(IRREVERSIBLE_CORRECTION_PATH, /FORWARD/);
  assert.match(IRREVERSIBLE_CORRECTION_PATH, /Nothing is\s+erased/);
  assert.equal(new Set(JUSTIFICATION_REFUSALS).size, JUSTIFICATION_REFUSALS.length, "no code twice");
  for (const c of ["NO_REASON", "NO_ACKNOWLEDGMENT", "NO_MITIGATION", "NO_CONCLUSION", "NO_FALSIFIER", "NO_JUSTIFICATION",
    "NO_EVIDENCE", "PLAN_NO_REASON", "HOLD_REFUSED", "SET_ASIDE_NO_REASON", "FREQUENCY_NO_REASON", "ESCALATION_NO_REASON"])
    assert.ok(JUSTIFICATION_REFUSALS.includes(c), c);
  /* the codes that demand an object, an identifier or evidence of a document stay out */
  for (const c of ["NO_TARGET", "NO_ID", "NO_KIND", "NO_CITATION", "NO_BODY", "NO_TITLE"])
    assert.ok(!JUSTIFICATION_REFUSALS.includes(c), c);
});

/* ---- R2, R3 -------------------------------------------------------------------------------------------------------- */
test("R2: RUNG_ABSENT names each op with one ground of RUNG_ABSENCE_GROUNDS (substrate, credential, caller-owned, "
   + "observational, undetermined), each ground carrying its sentence; no op is in both tables; the ops R2 names hold the "
   + "ground it gives them", () => {
  assert.deepEqual(Object.keys(RUNG_ABSENCE_GROUNDS),
    ["substrate", "credential", "caller-owned", "observational", "undetermined"]);
  for (const [g, s] of Object.entries(RUNG_ABSENCE_GROUNDS)) assert.ok(typeof s === "string" && s.length > 80, g);
  for (const [op, e] of Object.entries(RUNG_ABSENT)) {
    assert.ok(Object.hasOwn(RUNG_ABSENCE_GROUNDS, e.ground), `${op}: ${e.ground}`);
    assert.ok(typeof e.is === "string" && e.is.length > 0, op);
  }
  assert.deepEqual(Object.keys(RUNGS).filter((op) => Object.hasOwn(RUNG_ABSENT, op)), []);
  const R2 = { contradictionrecommend: "undetermined", contradictionoptin: "undetermined",
    contradictionrespond: "undetermined", signerregister: "credential", signerrevoke: "credential",
    knockerconsent: "credential", inboxpull: "undetermined", communicationprepare: "undetermined",
    templatesave: "undetermined", actioncreate: "undetermined", actionpressure: "undetermined", planopen: "undetermined",
    optionadd: "undetermined", optionpropose: "undetermined", optionadopt: "undetermined", checkpointrecord: "undetermined",
    optionstart: "undetermined", reminderset: "caller-owned", reminderanswer: "caller-owned" };
  for (const [op, ground] of Object.entries(R2)) assert.equal(RUNG_ABSENT[op]?.ground, ground, op);
  assert.equal(RUNG_ABSENT.signerregister.ground, RUNG_ABSENT.signeradd.ground);
  assert.equal(RUNG_ABSENT.knockerconsent.ground, RUNG_ABSENT.knock.ground);
  assert.equal(RUNG_ABSENT.reminderset.ground, RUNG_ABSENT.queuesnooze.ground);
});

test("R3: no rung is added for an act corrected forward: DEC-88 leaves 21 `undetermined`, and with R7's, R9's and R10's "
   + "the count reads 25 — each named here `undetermined`, and the ladder has no other rung", () => {
  const R3 = words(`inboxpull contradictionrecommend contradictionoptin contradictionrespond communicationprepare
    templatesave actioncreate actionpressure planopen optionadd optionpropose optionadopt checkpointrecord optionstart
    templatedraft templaterevise templatepropose templatesubmit templatereview templatecomment templateapprove`);
  assert.equal(R3.length, 21);
  const R25 = [...R3, "whatchangedpropose", "docketpressure", "caseimport", "caseimportdocument"];
  for (const op of R25) assert.equal(RUNG_ABSENT[op]?.ground, "undetermined", op);
  assert.equal(RUNG_LADDER.length, 5);
  /* `undetermined` holds only where neither rule holds: no op graded undetermined also asks a reason in R1's lists */
  for (const op of [...R1.reasoned, ...DEC88.reasoned]) assert.notEqual(gradeOf(op), "undetermined", op);
});

/* ---- R4 ------------------------------------------------------------------------------------------------------------ */
test("R4: CONSEQUENCE_STATEMENTS maps DEC-88's six judgement calls to {friction, statement}: dialog for attribute, "
   + "leadshare, entitycreate, strengthbar and filingapprove, in-place for workobjective; frozen, their rungs unchanged", () => {
  const SIX = { attribute: "dialog", leadshare: "dialog", entitycreate: "dialog", strengthbar: "dialog",
    filingapprove: "dialog", workobjective: "in-place" };
  assert.ok(Object.isFrozen(CONSEQUENCE_STATEMENTS));
  for (const [op, friction] of Object.entries(SIX)) {
    const e = CONSEQUENCE_STATEMENTS[op];
    assert.ok(Object.isFrozen(e), op);
    assert.deepEqual(Object.keys(e), ["friction", "statement"], op);
    assert.equal(e.friction, friction, op);
    assert.ok(e.statement.length > 60, op);
  }
  assert.deepEqual([RUNGS.attribute, RUNGS.leadshare, RUNGS.entitycreate, RUNGS.strengthbar, RUNGS.filingapprove,
    RUNGS.workobjective], ["reasoned", "reasoned", "reasoned", "reasoned", "terminal", "reasoned"]);
  /* each statement says its act's effect */
  assert.match(CONSEQUENCE_STATEMENTS.attribute.statement, /permanently/);
  assert.match(CONSEQUENCE_STATEMENTS.leadshare.statement, /cannot be un-read/);
  assert.match(CONSEQUENCE_STATEMENTS.workobjective.statement, /budget and scope/);
  /* only the six, R8's actionholdrelease and R21's personexpunge carry one */
  assert.deepEqual(Object.keys(CONSEQUENCE_STATEMENTS).sort(),
    [...Object.keys(SIX), "actionholdrelease", "personexpunge"].sort());
});

/* ---- R5 ------------------------------------------------------------------------------------------------------------ */
test("R5: MACHINE_REFUSALS maps each act refused a machine by name to its code; NON_ACTS gives the reasons R5 names, "
   + "`capture-directed:` exactly for attest, monitor and attesttext", () => {
  const V = "MACHINE_CANNOT_MOVE_VERSION";
  assert.deepEqual(MACHINE_REFUSALS, {
    release: "MACHINE_CANNOT_RELEASE", conclude: "MACHINE_CANNOT_CONCLUDE", withdrawconclusion: "MACHINE_CANNOT_CONCLUDE",
    reopen: "MACHINE_CANNOT_REOPEN", publish: "MACHINE_CANNOT_PUBLISH", inquirydivide: "MACHINE_CANNOT_DIVIDE",
    inquiryground: "MACHINE_CANNOT_GROUND", actionmove: "MACHINE_CANNOT_MOVE_ACTION",
    actioncorrespond: "MACHINE_CANNOT_CORRESPOND", actionlaws: "MACHINE_CANNOT_SET_LAWS",
    actionrisktier: "MACHINE_CANNOT_SET_RISK_TIER", versionaccept: V, versionreject: V, versionconsider: V,
    versionrevert: V, versioncurrent: V, versionhide: V, contradictionresolve: "MACHINE_CANNOT_ACT_ON_CANDIDATE" });
  assert.deepEqual(Object.keys(NON_ACTS).filter((op) => NON_ACTS[op].startsWith("capture-directed:")).sort(),
    ["attest", "attesttext", "monitor"]);
  for (const op of ["contradictiondismiss", "contradictionclarify", "contradictiontakeup"])
    assert.ok(NON_ACTS[op].startsWith("candidate-directed: keyed by a candidate, reached where its sides are shown"), op);
  assert.ok(NON_ACTS.contradictionrecommend.startsWith("run-directed:"));
  assert.ok(NON_ACTS.resolutiondefect.startsWith("registry correction, keyed by a resolution"));
  for (const op of ["contradictionoptin", "contradictionrespond"]) assert.ok(NON_ACTS[op].startsWith(
    "conflict-directed: keyed by a candidate and the member's project, reached from the conflict's notice"), op);
  for (const op of ["contradictioncandidates", "contradictiontensions", "contradictionfacts", "contradictionnotices",
    "contradictionresponses", "publishtensions"]) assert.ok(NON_ACTS[op].startsWith("read: "), op);
  assert.match(NON_ACTS.ratify, /op=publishpreflight \(case-authoring R34\)/);
  for (const [op, why] of Object.entries(NON_ACTS)) assert.ok(typeof why === "string" && why.length > 0, op);
});

/* ---- R18 ----------------------------------------------------------------------------------------------------------- */
test("R18: phoneOf is false at terminal, attested and irreversible, for a credential absence and for LARGER_SCREEN_ACTS "
   + "(frozen, filingsent alone), and true otherwise — reads, captures and everyday acts", () => {
  assert.ok(Object.isFrozen(LARGER_SCREEN_ACTS));
  assert.deepEqual([...LARGER_SCREEN_ACTS], ["filingsent"]);
  /* an alias answers as its op (R17) */
  const expect = (id) => { const op = OP_ALIASES[id] ?? id;
    return !(["terminal", "attested", "irreversible"].includes(RUNGS[op])
      || RUNG_ABSENT[op]?.ground === "credential" || LARGER_SCREEN_ACTS.includes(op)); };
  for (const op of new Set([...Object.keys(RUNGS), ...Object.keys(RUNG_ABSENT), ...Object.keys(NON_ACTS)]))
    assert.equal(phoneOf(op), expect(op), op);
  assert.deepEqual(["publish", "retire", "attest", "memberadd", "filingsent", "dispose", "notes", "attesttext",
    "an-op-no-table-names"].map(phoneOf), [false, false, false, false, false, true, true, true, true]);
  assert.equal(RUNGS.filingsent, "reasoned", "its rung alone would leave it on the phone");
  assert.deepEqual([phoneOf("filingrecordsent"), phoneOf("filingsent")], [false, false], "the alias as its op");
});

/* ---- R19, R20 ------------------------------------------------------------------------------------------------------ */
test("R19: nothing here writes — every export is data or a pure function, and calling each leaves every table as it was",
() => {
  const snap = () => JSON.stringify(Object.fromEntries(Object.entries(G).filter(([, v]) => typeof v !== "function")));
  const before = snap();
  for (const op of [...Object.keys(RUNGS), ...Object.keys(NON_ACTS), "nothing"]) phoneOf(op);
  const out = G.aliased(RUNGS);
  out.extra = "x";
  assert.equal(snap(), before);
  assert.deepEqual(Object.entries(G).filter(([, v]) => typeof v === "function").map(([k]) => k).sort(),
    ["aliased", "phoneOf"]);
  assert.ok(Object.isFrozen(OP_ALIASES) && Object.isFrozen(CONSEQUENCE_STATEMENTS) && Object.isFrozen(G.IRREVERSIBLE_WEIGHT));
});

test("R20: no place is named in this module's outward text — no sentence it serves (grounds, correction path, consequence "
   + "statements, absences, NON_ACTS reasons) names a jurisdiction, and NON_ACTS.idmatch names no local identifier system "
   + "or publisher", () => {
  const served = JSON.stringify([RUNG_ABSENCE_GROUNDS, IRREVERSIBLE_CORRECTION_PATH, CONSEQUENCE_STATEMENTS, RUNG_ABSENT,
    NON_ACTS, LARGER_SCREEN_ACTS, G.IRREVERSIBLE_WEIGHT]);
  const PLACES = /\b(Oakland|Alameda|California|Berkeley|San Francisco|Sacramento|Legistar|Granicus|Municode|OPD)\b/i;
  assert.equal(PLACES.exec(served), null);
  assert.match(NON_ACTS.idmatch, /identifier spaces the active profiles declare/);
  assert.equal(PLACES.exec(NON_ACTS.idmatch), null);
  assert.ok(PLACES.test(served.replace("the active profiles", "Oakland's profiles")), "negative control");
});
