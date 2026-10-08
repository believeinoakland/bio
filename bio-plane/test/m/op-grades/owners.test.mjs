/* op-grades: the owners' ops, graded (R6–R17), at the module's exports. Each grade is the one its requirement reads from
   the owner; the owners are not imported (this module uses nothing, P4): their maps, their refusals and the totality over
   the control plane's table are `affordances`' tests (its R12, R19, R20). The T33 and T34 cases moved here from
   `affordances`' `t33.test.mjs` and `t34.test.mjs` (the table cases and the alias table). */
import test from "node:test";
import assert from "node:assert/strict";
import { RUNGS, RUNG_ABSENT, NON_ACTS, MACHINE_REFUSALS, JUSTIFICATION_REFUSALS, CONSEQUENCE_STATEMENTS, OP_ALIASES,
         aliased, phoneOf } from "../../../src/op-grades/index.mjs";
import { T33_RUNGS, T33_RUNG_ABSENT, T33_NON_ACTS } from "../../../src/op-grades/t33.mjs";
import { T34_RUNGS, T34_RUNG_ABSENT, T34_NON_ACTS } from "../../../src/op-grades/t34.mjs";

const gradeOf = (op) => Object.hasOwn(RUNGS, op) ? RUNGS[op] : Object.hasOwn(RUNG_ABSENT, op) ? RUNG_ABSENT[op].ground : null;
const isRead = (op) => typeof NON_ACTS[op] === "string" && NON_ACTS[op].startsWith("read: ");
const notMachine = (ops) => assert.deepEqual(ops.filter((op) => Object.hasOwn(MACHINE_REFUSALS, op)), []);
const grades = (ops) => Object.fromEntries(Object.keys(ops).map((op) => [op, gradeOf(op)]));

/* ---- R6 ------------------------------------------------------------------------------------------------------------ */
test("R6: filing-templates' and local-facts' ops — templateretire and factconfirm `reasoned` with their codes in the "
   + "family; the two grants `credential`; the seven template acts `undetermined`; each with its NON_ACTS reason", () => {
  const W = { templateretire: "reasoned", factconfirm: "reasoned", templatereviewgrant: "credential",
    templategrantrevoke: "credential", templatedraft: "undetermined", templaterevise: "undetermined",
    templatepropose: "undetermined", templatesubmit: "undetermined", templatereview: "undetermined",
    templatecomment: "undetermined", templateapprove: "undetermined" };
  assert.deepEqual(grades(W), W);
  for (const c of ["TEMPLATE_REASON_REFUSED", "FACT_HOW_REFUSED"]) assert.ok(JUSTIFICATION_REFUSALS.includes(c), c);
  assert.equal(RUNG_ABSENT.templatereviewgrant.ground, RUNG_ABSENT.reviewgrant.ground);
  const T = "template-directed: keyed by a template or one of its versions, reached from the template library; writes "
    + "this module's rows and moves no bundle";
  for (const op of Object.keys(W).filter((op) => op.startsWith("template"))) assert.ok(NON_ACTS[op].startsWith(T), op);
  for (const op of ["templatereview", "templatecomment", "templateread", "templatecomments"])
    assert.match(NON_ACTS[op], /reached also through a review grant's door$/, op);
  assert.equal(NON_ACTS.factconfirm,
    "fact-directed: keyed by a profile fact's path, reached from the calendar and offices; moves no bundle");
  for (const op of ["templates", "factstatus", "factsdue"]) assert.ok(isRead(op), op);
});

/* ---- R7 ------------------------------------------------------------------------------------------------------------ */
test("R7: T23's ops — whatchangedpropose `undetermined`, noticepost `attested` as caseratify, each with its NON_ACTS "
   + "reason, the reads `read:` and network-notices' public reads `read: public, no credential`", () => {
  assert.equal(RUNG_ABSENT.whatchangedpropose.ground, "undetermined");
  assert.equal(RUNGS.noticepost, "attested");
  assert.equal(RUNGS.noticepost, RUNGS.caseratify);
  assert.equal(NON_ACTS.whatchangedpropose, "case-directed: keyed by a published case, reached from its next edition; a "
    + "draft, never a statement until a member adopts it");
  assert.equal(NON_ACTS.noticepost, "project-directed: keyed by a project, reached from the project; an owner's signed notice");
  for (const op of ["escalationreasondraft", "whatchangeddrafts", "sweeps", "noticeprepare", "notices"])
    assert.ok(isRead(op), op);
  for (const op of ["activitymethod", "noticespublic", "groupkeyspublic"])
    assert.equal(NON_ACTS[op], "read: public, no credential", op);
});

/* ---- R8 ------------------------------------------------------------------------------------------------------------ */
test("R8: actionholdrelease is `terminal`, a named exception (actionhold stays `reasoned`), HOLD_REFUSED backs both, its "
   + "consequence statement is the dialog DEC-113 words, its NON_ACTS reason entry-directed, and it is no machine refusal",
() => {
  assert.deepEqual([RUNGS.actionholdrelease, RUNGS.actionhold], ["terminal", "reasoned"]);
  assert.ok(JUSTIFICATION_REFUSALS.includes("HOLD_REFUSED"));
  const s = CONSEQUENCE_STATEMENTS.actionholdrelease;
  assert.equal(s.friction, "dialog");
  assert.match(s.statement, /restarts deletion for the projects shown beside this/);
  assert.match(s.statement, /purged/);
  assert.match(s.statement, /assistant transcripts/);
  assert.match(s.statement, /This cannot be undone\.$/);
  assert.equal(NON_ACTS.actionholdrelease, "entry-directed: keyed by (action, entry ordinal); appends a release and never "
    + "rewrites the entry, its mark or an earlier statement");
  for (const op of ["actionholdpreview", "projectholds"]) assert.ok(isRead(op), op);
  notMachine(["actionholdrelease", "actionhold"]);
});

/* ---- R9 ------------------------------------------------------------------------------------------------------------ */
test("R9: the docket's ops — docketfile and docketdecline `reasoned` (DOCKET_NO_REASON in the family), docketpost "
   + "`attested`, docketpressure `undetermined`, each case-directed, the reads and public reads apart", () => {
  const W = { docketfile: "reasoned", docketdecline: "reasoned", docketpost: "attested", docketpressure: "undetermined" };
  assert.deepEqual(grades(W), W);
  assert.ok(JUSTIFICATION_REFUSALS.includes("DOCKET_NO_REASON"));
  for (const op of Object.keys(W)) assert.equal(NON_ACTS[op],
    "case-directed: keyed by a published case, reached from its docket; never evidence, moves no bundle", op);
  for (const op of ["docket", "docketprepare", "docketinvitation"]) assert.ok(isRead(op), op);
  for (const op of ["docketpublic", "docketfeed"]) assert.equal(NON_ACTS[op], "read: public, no credential", op);
  notMachine(Object.keys(W));
});

/* ---- R10, R12 ------------------------------------------------------------------------------------------------------ */
const IMPORT = "import-directed: keyed by an imported case (an import, an edition, a finding or a flag), reached from the "
  + "imported cases; writes this module's rows and moves no bundle";
test("R10: case-import's and case-checker's ops — the four DEC-96 acts `reasoned` with both codes in the family, "
   + "caseimport and caseimportdocument `undetermined`, each import-directed; the reads and public reads apart; none a "
   + "machine refusal", () => {
  const W = { importaccept: "reasoned", importacceptwithdraw: "reasoned", importflag: "reasoned",
    importflagclear: "reasoned", caseimport: "undetermined", caseimportdocument: "undetermined" };
  assert.deepEqual(grades(W), W);
  for (const c of ["IMPORT_ACCEPT_NO_REASON", "IMPORT_FLAG_NO_ISSUE"]) assert.ok(JUSTIFICATION_REFUSALS.includes(c), c);
  for (const op of Object.keys(W)) assert.equal(NON_ACTS[op], IMPORT, op);
  for (const op of ["importedcases", "importedcase"]) assert.ok(isRead(op), op);
  for (const op of ["casechecker", "casefilespec"]) assert.equal(NON_ACTS[op], "read: public, no credential", op);
  notMachine(Object.keys(W));
});

test("R12: importwatch and importunwatch are `reversible`, each taking the other back, with R10's sentence, and neither "
   + "is a machine refusal", () => {
  assert.deepEqual([RUNGS.importwatch, RUNGS.importunwatch], ["reversible", "reversible"]);
  assert.deepEqual([NON_ACTS.importwatch, NON_ACTS.importunwatch], [IMPORT, IMPORT]);
  notMachine(["importwatch", "importunwatch"]);
});

/* ---- R11 ----------------------------------------------------------------------------------------------------------- */
test("R11: wizard-scripts' ops — wizardretire `reasoned` (WIZARD_REASON_REFUSED in the family), the five drafting acts "
   + "`undetermined`, the editor grant and revoke `credential`, wizardprogress `observational`; each with its reason, "
   + "baseupdates and the other reads `read:`, none a machine refusal", () => {
  const W = { wizardretire: "reasoned", wizarddraft: "undetermined", wizardrevise: "undetermined",
    wizardpropose: "undetermined", wizardsubmit: "undetermined", wizardapprove: "undetermined",
    wizardeditorgrant: "credential", wizardeditorrevoke: "credential", wizardprogress: "observational" };
  assert.deepEqual(grades(W), W);
  assert.ok(JUSTIFICATION_REFUSALS.includes("WIZARD_REASON_REFUSED"));
  for (const op of Object.keys(W).filter((op) => op !== "wizardprogress")) assert.equal(NON_ACTS[op],
    "wizard-directed: keyed by a script or one of its versions, reached from the library or a screen's mark; writes "
    + "this module's rows and moves no bundle", op);
  assert.equal(NON_ACTS.wizardprogress, "tally: unattributed, keyed by a script's version; names no member");
  for (const op of ["wizards", "wizardread", "wizardsat", "wizarduse", "wizardcandidates", "wizardcheck", "baseupdates"])
    assert.ok(isRead(op), op);
  notMachine(Object.keys(W));
});

/* ---- R13 (moved from affordances' t33.test.mjs) -------------------------------------------------------------------- */
const T33_WRITES = {
  datedfact: "observational", editacts: "observational", readoptin: "substrate", eventcreate: "undetermined",
  eventattest: "undetermined", eventgovern: "reversible", participantadd: "undetermined", participantcorrect: "reasoned",
  eventmerge: "reasoned", eventsplit: "reasoned", eventrelate: "reversible", eventrelationwithdraw: "reasoned",
  actalias: "undetermined", eventimport: "substrate", registerimport: "substrate",
  linerecord: "reversible", linewithdraw: "reasoned", linecurrentthrough: "undetermined",
  moneyrecord: "reversible", moneywithdraw: "reasoned", moneysetcreate: "undetermined", moneysetinclude: "reasoned",
  moneysetexclude: "reasoned", moneysetpropose: "undetermined", moneyfundtype: "undetermined",
  moneycheckparam: "undetermined", moneydetectordefine: "undetermined", moneydetectorswitch: "reversible",
  moneydetectorsrun: "substrate", moneydetectorgate: "substrate",
  dutypropose: "undetermined", dutyadopt: "reversible", dutydeclare: "reversible", dutyrevise: "reasoned",
  dutywithdraw: "reasoned", dutymatch: "reasoned", dutytransition: "reasoned",
  identityclaim: "reasoned", identitywithdraw: "reasoned", personfact: "reversible", personfactwithdraw: "reasoned",
  personexpunge: "reasoned", membertie: "reasoned", membertiewithdraw: "reasoned", sourcepersonlink: "reasoned",
  interestcheckdefine: "undetermined", interestcheckswitch: "reversible", interestcheckgate: "substrate",
  hypothesishold: "reversible", hypothesisrevise: "reasoned", hypothesiswithdraw: "reasoned",
  notewrite: "caller-owned", noteturn: "caller-owned",
  tabledeclare: "undetermined", bindingadopt: "undetermined", moneyingest: "reasoned", calculationcreate: "undetermined",
  calculationaccept: "undetermined", calculationdraw: "undetermined", recordset: "observational", patterngate: "substrate",
  patternswitch: "reversible",
  workbookadd: "undetermined", workbookbind: "reversible", workbookunbind: "reasoned", workbookrecompute: "observational",
  workbooklintexplain: "reasoned", workbookmethodnote: "reasoned", workbooksecondcheck: "undetermined",
  answercheck: "observational", ruleservicesswitch: "substrate", standingset: "caller-owned", standingend: "caller-owned",
  standingaiswitch: "substrate",
  followbody: "reversible", unfollow: "reversible", followregister: "reversible", followpersonquery: "reversible",
  followportal: "reversible", permeetingbody: "reversible", refreshregister: "substrate",
  lawrelate: "reasoned", lawwithdraw: "reasoned", lawpropose: "undetermined", courtlink: "reasoned", courttreat: "reasoned",
  accountreferenceset: "credential", accountreferenceremove: "credential", accountswitchset: "caller-owned",
  aigrantmint: "credential", keyedserviceset: "credential", keyedserviceswitch: "substrate",
  sourcekeyed: "undetermined", entityidentify: "reasoned", waitlook: "caller-owned", exportrender: "substrate",
  clockadopt: "undetermined", aiceilingset: "caller-owned", aicopyceilingset: "substrate", airunverify: "reasoned",
  clockpropose: "reversible", capturerequestplatformmark: "reversible", capturerequestplatformunmark: "reversible",
  officesseed: "substrate", seatsseed: "substrate", disclosureshown: "caller-owned",
  ask: "caller-owned", askusage: "observational",
};
const T33_READS = ["event", "eventforact", "datedfacts", "eventsfor", "timeline", "sequence", "whowassent", "statementsof",
  "proceedingstatus", "line", "linesof", "structureat", "holderat", "partiesof", "proceedinglinks", "money", "moneyof",
  "moneysummable", "moneyreconcile", "moneyset", "committedagainstpaid", "authoritychain", "moneyamountchecks",
  "moneyjunction", "moneycheckparams", "moneydetectors", "moneynoticed", "duty", "dutiesof", "dutyoccurrences",
  "dutytransitions", "powersof", "dutysetagainst", "identity", "samepersoncandidates", "person", "career",
  "personcredentials", "personinterests", "personstatements", "staffing", "memberties", "sourcepersonlinks",
  "interestchecks", "explore", "explorepreset", "exploreverify", "exploretimeline", "hypotheses", "notes", "table",
  "tablesat", "calculationevaluate", "calculation", "patterns", "workbook", "workbookinputs", "workbooklint",
  "workbookexport", "rule", "asktallies", "standing", "standinganswers", "follows", "snapshots", "snapshotdiff",
  "inforceat", "standardsfor", "lawrelations", "lawaddresses", "stillstanding", "citationresolve", "accountreference",
  "keyedservices", "exportpage", "addresseesuggest", "clocksics", "clocklateness", "aiusage", "capturerequestplatformhosts",
  "assistantstate", "disclosureof", "standardinforce"];
/* `reversible`: the published act of the owner that takes each result back */
const TAKEN_BACK_BY = {
  eventgovern: "eventgovern", eventrelate: "eventrelationwithdraw", linerecord: "linewithdraw", moneyrecord: "moneywithdraw",
  moneydetectorswitch: "moneydetectorswitch", dutyadopt: "dutywithdraw", dutydeclare: "dutywithdraw",
  personfact: "personfactwithdraw", interestcheckswitch: "interestcheckswitch", hypothesishold: "hypothesiswithdraw",
  patternswitch: "patternswitch", workbookbind: "workbookunbind", followbody: "unfollow", followregister: "unfollow",
  followpersonquery: "unfollow", followportal: "unfollow", unfollow: "followbody", permeetingbody: "permeetingbody",
};
/* the code each reasoned op is refused with when the member's account is absent (driven in affordances' R19 tests) */
const REASON_CODE = {
  participantcorrect: "NO_REASON", eventmerge: "NO_REASON", eventsplit: "NO_REASON", eventrelationwithdraw: "NO_REASON",
  linewithdraw: "NO_REASON", moneywithdraw: "NO_REASON", moneysetinclude: "NO_REASON", moneysetexclude: "NO_REASON",
  dutyrevise: "DUTY_NO_REASON", dutywithdraw: "DUTY_NO_REASON", dutymatch: "DUTY_NO_REASON", dutytransition: "NO_CAUSE",
  identityclaim: "NO_NOTE", identitywithdraw: "NO_REASON", personfactwithdraw: "NO_REASON", personexpunge: "NO_REASON",
  membertie: "NO_NOTE", membertiewithdraw: "NO_REASON", sourcepersonlink: "NO_EVIDENCE",
  hypothesisrevise: "HYPOTHESIS_NO_REASON", hypothesiswithdraw: "HYPOTHESIS_NO_REASON", moneyingest: "NO_REASON",
  workbookunbind: "NO_REASON", workbooklintexplain: "NO_NOTE", workbookmethodnote: "NO_PURPOSE",
  lawrelate: "STANDARD_NO_REASON", lawwithdraw: "STANDARD_NO_REASON", courtlink: "STANDARD_NO_REASON",
  courttreat: "STANDARD_NO_REASON", entityidentify: "NO_BASIS", airunverify: "AI_RUN_VERIFICATION_UNFIT",
};
/* a write op-declarations gives no NEEDS row (UNATTENDED_BY_DECISION): graded, never named in NON_ACTS */
const UNGATED_WRITES = ["askusage"];

test("R13 R3: every op T33 publishes is graded — each write its rung or one ground, each read a `read:` NON_ACT, every "
   + "gated op its reason; each `reversible` taken back by a graded act and each `reasoned` backed by a code of the family; "
   + "none a machine refusal", () => {
  assert.deepEqual(grades(T33_WRITES), T33_WRITES);
  assert.deepEqual([...Object.keys(T33_RUNGS), ...Object.keys(T33_RUNG_ABSENT)].sort(), Object.keys(T33_WRITES).sort());
  assert.deepEqual(Object.keys(T33_NON_ACTS).sort(),
    [...Object.keys(T33_WRITES).filter((op) => !UNGATED_WRITES.includes(op)), ...T33_READS].sort());
  for (const op of T33_READS) { assert.ok(isRead(op), op); assert.equal(gradeOf(op), null, op); }
  for (const op of Object.keys(T33_WRITES).filter((op) => !UNGATED_WRITES.includes(op)))
    assert.ok(!isRead(op) && NON_ACTS[op].length > 20, op);
  for (const op of UNGATED_WRITES) assert.ok(!Object.hasOwn(NON_ACTS, op), op);
  for (const [op, by] of Object.entries(TAKEN_BACK_BY)) {
    assert.equal(RUNGS[op], "reversible", op);
    assert.notEqual(gradeOf(by), null, by);
  }
  const reasoned = Object.keys(T33_WRITES).filter((op) => T33_WRITES[op] === "reasoned");
  assert.deepEqual(reasoned.sort(), Object.keys(REASON_CODE).sort());
  for (const [op, code] of Object.entries(REASON_CODE)) assert.ok(JUSTIFICATION_REFUSALS.includes(code), `${op}: ${code}`);
  notMachine([...Object.keys(T33_WRITES), ...T33_READS]);
  /* negative control */
  assert.notDeepEqual(grades({ ...T33_WRITES, notewrite: "x" }), { ...T33_WRITES, notewrite: "undetermined" });
});

/* ---- R14 ----------------------------------------------------------------------------------------------------------- */
test("R14: publishat and publishatmove `irreversible` as publish, publishatcancel `reversible`, each with its NON_ACTS "
   + "reason, publishschedule a read; phone false, false, true; none a machine refusal", () => {
  assert.deepEqual([RUNGS.publishat, RUNGS.publishatmove, RUNGS.publishatcancel],
    [RUNGS.publish, "irreversible", "reversible"]);
  assert.equal(NON_ACTS.publishat, "case-directed: keyed by a case edition (case, edition), reached from the publication "
    + "ceremony's last step; signs now and publishes at the set time only if every check passes again then");
  for (const op of ["publishatmove", "publishatcancel"]) assert.equal(NON_ACTS[op], "case-directed: keyed by a case "
    + "edition waiting to be published, reached from the case and the owner's queue; an owner's act until the set time", op);
  assert.ok(isRead("publishschedule"));
  assert.deepEqual(["publishat", "publishatmove", "publishatcancel"].map(phoneOf), [false, false, true]);
  assert.deepEqual([RUNGS.caseratify], ["attested"], "the signing that takes a cancel back is graded");
  notMachine(["publishat", "publishatmove", "publishatcancel", "publishschedule"]);
});

/* ---- R15 ----------------------------------------------------------------------------------------------------------- */
test("R15: notewrite and noteturn `caller-owned` as reminderset, note-directed, notes a read, phone true, no machine "
   + "refusal; HYPOTHESIS_NO_REASON joins the family and NO_REASON stays", () => {
  const ND = "note-directed: a member's own note, keyed by the note and answered to its author alone; never a record id, "
    + "never cited, published or counted; moves no bundle";
  for (const op of ["notewrite", "noteturn"]) {
    assert.equal(RUNG_ABSENT[op].ground, "caller-owned", op);
    assert.equal(RUNG_ABSENT[op].ground, RUNG_ABSENT.reminderset.ground, op);
    assert.equal(NON_ACTS[op], ND, op);
    assert.equal(phoneOf(op), true, op);
  }
  assert.ok(isRead("notes"));
  notMachine(["notewrite", "noteturn", "notes"]);
  for (const c of ["HYPOTHESIS_NO_REASON", "NO_REASON"]) assert.ok(JUSTIFICATION_REFUSALS.includes(c), c);
  assert.deepEqual([RUNGS.hypothesisrevise, RUNGS.hypothesiswithdraw], ["reasoned", "reasoned"]);
});

/* ---- R16 ----------------------------------------------------------------------------------------------------------- */
test("R16: groupdescriptiondraft and writinghelp take no rung, carry the draft sentence, and are no machine refusal", () => {
  const D = "draft: answers a labelled machine draft into a member's own field; writes nothing of the record; the "
    + "member's words only by the member's own act of keeping it";
  for (const op of ["groupdescriptiondraft", "writinghelp"]) {
    assert.equal(gradeOf(op), null, op);
    assert.equal(NON_ACTS[op], D, op);
  }
  notMachine(["groupdescriptiondraft", "writinghelp"]);
});

/* ---- R17 (moved from affordances' t34.test.mjs) -------------------------------------------------------------------- */
const T34_WRITES = {
  invitewithdraw: "credential", websitekeycreate: "credential", websitekeyset: "credential", websitekeyrevoke: "credential",
  joinlinkenable: "credential", joinlinkset: "credential", joinlinkreplace: "credential", joinlinkoff: "credential",
  websiteinvite: "credential", joinlinkinvite: "credential", courtnoticeset: "substrate", groupdescriptionset: "substrate",
  checkrequest: "undetermined", checktake: "undetermined", checkrecord: "reasoned",
  groupkeyset: "credential", groupkeyremove: "credential", groupkeyswitch: "substrate", groupswitchset: "substrate",
  groupkeynoticeseen: "caller-owned", placewanted: "substrate", memberlanguageset: "caller-owned",
};
const T34_READS = ["checkrequests", "checksof", "groupkeystate", "groupkeynotice", "placewantedstate", "memberlanguage",
  "startfrom"];
const T34_PUBLIC = ["websiteinvite", "joinlinkinvite", "groupdescription", "courtnotice"];
test("R17: every op T34 declares carries the grade read from its owner, each gated op its NON_ACTS reason, the public "
   + "ones none; checkrecord's CHECK_NO_REASON is in the family", () => {
  assert.deepEqual(grades(T34_WRITES), T34_WRITES);
  assert.deepEqual([...Object.keys(T34_RUNGS), ...Object.keys(T34_RUNG_ABSENT)].sort(), Object.keys(T34_WRITES).sort());
  for (const [op, e] of Object.entries(T34_RUNG_ABSENT)) assert.ok(e.is.length > 40, op);
  for (const [op, like] of [["groupkeyset", "keyedserviceset"], ["groupkeyswitch", "keyedserviceswitch"],
    ["courtnoticeset", "groupnameset"], ["placewanted", "officesseed"], ["websiteinvite", "knock"],
    ["groupkeynoticeseen", "disclosureshown"], ["memberlanguageset", "accountswitchset"]])
    assert.equal(gradeOf(op), gradeOf(like), op);
  for (const op of T34_READS) { assert.ok(isRead(op), op); assert.equal(gradeOf(op), null, op); }
  for (const op of T34_PUBLIC) assert.ok(!Object.hasOwn(NON_ACTS, op), op);
  const gated = Object.keys(T34_WRITES).filter((op) => !T34_PUBLIC.includes(op));
  assert.deepEqual(Object.keys(T34_NON_ACTS).sort(), [...gated, ...T34_READS].sort());
  for (const op of gated) assert.ok(NON_ACTS[op].length > 30 && !isRead(op), op);
  assert.ok(JUSTIFICATION_REFUSALS.includes("CHECK_NO_REASON"));
  notMachine([...Object.keys(T34_WRITES), ...T34_READS]);
});

test("R17: each of op-declarations R21's 27 aliases takes its op's very grade and reason through one frozen table — an "
   + "alias never differs from its op", () => {
  assert.ok(Object.isFrozen(OP_ALIASES));
  assert.equal(Object.keys(OP_ALIASES).length, 27);
  /* K2054: `expunge` is no alias since K1901 (`personexpunge` is a declared op), so nothing grades it */
  assert.ok(!Object.hasOwn(OP_ALIASES, "expunge"));
  assert.deepEqual([RUNGS.expunge, RUNG_ABSENT.expunge, NON_ACTS.expunge], [undefined, undefined, undefined]);
  /* K2239 (DEC-182 (2)): `claimidentity` is withdrawn; the same-person claim is `identityclaim` alone */
  assert.ok(!Object.hasOwn(OP_ALIASES, "claimidentity"));
  assert.deepEqual([RUNGS.claimidentity, RUNG_ABSENT.claimidentity, NON_ACTS.claimidentity], [undefined, undefined, undefined]);
  assert.ok(Object.hasOwn(RUNGS, "identityclaim"));
  for (const [a, op] of Object.entries(OP_ALIASES)) {
    assert.ok(Object.hasOwn(NON_ACTS, op), `${op}, ${a}'s op, is named`);
    assert.equal(NON_ACTS[a], NON_ACTS[op], a);
    assert.equal(RUNGS[a], RUNGS[op], a);
    assert.equal(RUNG_ABSENT[a], RUNG_ABSENT[op], `${a}: the same entry object`);
    assert.equal(gradeOf(a), gradeOf(op), a);
    assert.equal(phoneOf(a), phoneOf(op), a);
  }
  for (const a of ["ruleanswer", "reconcile"]) assert.equal(gradeOf(a), null, a);
  assert.deepEqual(aliased({ rule: "x" }), { ruleanswer: "x" });
  assert.deepEqual(aliased({}), {});
});
