/* affordances, T33 (T33-85): R39 (the new closed vocabularies with the members' words), R40 (every op T33's new modules
   publish, and the ops T33 adds to earlier modules, graded by R7 and R27 with R12's totality holding over them) and R41
   (a refusal explained from its translation and a dry run), each at the module's exports. Each reasoned op's backing
   (R19) is driven at its owner's interface in t33-backing.test.mjs. */
import test from "node:test";
import assert from "node:assert/strict";
import * as A from "../../../src/affordances.mjs";
import * as G from "../../../src/op-grades/index.mjs";
import { T33_RUNGS, T33_RUNG_ABSENT, T33_NON_ACTS } from "../../../src/op-grades/t33.mjs";
import { composedVocabularies, plainWord } from "../../../src/affordances/words.mjs";
import { affordancesOf } from "../../../src/affordances/facts.mjs";
import { owners, kindOf } from "../../../src/connection-grammar/index.mjs";
import * as events from "../../../src/events/index.mjs";
import * as lines from "../../../src/lines/index.mjs";
import * as money from "../../../src/money/index.mjs";
import * as people from "../../../src/people/index.mjs";
import { moneyChecksOps } from "../../../src/money-checks/index.mjs";
import { dutiesOps } from "../../../src/duties/index.mjs";
import { exploreOps } from "../../../src/explore/ops.mjs";
import { hypothesesOps } from "../../../src/hypotheses/index.mjs";
import { calculationsOps } from "../../../src/calculations/index.mjs";
import { workbooksOps } from "../../../src/workbooks/ops.mjs";
import { answersOps } from "../../../src/answers/ops.mjs";
import { followingOps } from "../../../src/following/index.mjs";
import { standardsOps } from "../../../src/standards/index.mjs";
import { credentialsOps } from "../../../src/credentials/index.mjs";
import { sourcesOps } from "../../../src/sources/index.mjs";
import { entitiesOps } from "../../../src/entities/index.mjs";
import { inquiryOps } from "../../../src/inquiry/index.mjs";
import { corpusExportOps } from "../../../src/corpus-export/index.mjs";
import { actionsOps } from "../../../src/actions/index.mjs";
import { actionClocksOps } from "../../../src/action-clocks/index.mjs";
import { aiRunsOps } from "../../../src/ai-runs/index.mjs";
import { world as eventsWorld } from "../events/fixture.mjs";

const { ACTS, CAPTURE_ACTS, PER_ITEM_ACTS } = A;
const { RUNGS, RUNG_ABSENT, NON_ACTS, MACHINE_REFUSALS, JUSTIFICATION_REFUSALS, RUNG_ABSENCE_GROUNDS } = G;
const url = new URL("http://x/");
const keysOf = (f) => Object.keys(f({}, url, {}, {}));
const gradeOf = (op) => Object.hasOwn(RUNGS, op) ? RUNGS[op] : Object.hasOwn(RUNG_ABSENT, op) ? RUNG_ABSENT[op].ground : null;

/* ---- R40: each owner's T33 ops, writes with the grade R27's rule gives them, reads apart ------------------------------
   The whole op map of each new module; of an earlier module, the ops T33 adds to it (K1549, K1550, K1571, K1572, K1601,
   K1604, K1609, K1640, K1657, K1658). A grade is the rung, or the ground of a stated absence. */
const T33 = {
  events: { map: events.eventsOps, writes: {
      datedfact: "observational", editacts: "observational", readoptin: "substrate", eventcreate: "undetermined",
      eventattest: "undetermined", eventgovern: "reversible", participantadd: "undetermined", participantcorrect: "reasoned",
      eventmerge: "reasoned", eventsplit: "reasoned", eventrelate: "reversible", eventrelationwithdraw: "reasoned",
      actalias: "undetermined", eventimport: "substrate", registerimport: "substrate" },
    reads: ["event", "eventforact", "datedfacts", "eventsfor", "timeline", "sequence", "whowassent", "statementsof",
      "proceedingstatus"] },
  lines: { map: lines.linesOps, writes: { linerecord: "reversible", linewithdraw: "reasoned", linecurrentthrough: "undetermined" },
    reads: ["line", "linesof", "structureat", "holderat", "partiesof", "proceedinglinks"] },
  money: { map: money.moneyOps, writes: { moneyrecord: "reversible", moneywithdraw: "reasoned", moneysetcreate: "undetermined",
      moneysetinclude: "reasoned", moneysetexclude: "reasoned", moneysetpropose: "undetermined", moneyfundtype: "undetermined" },
    reads: ["money", "moneyof", "moneysummable", "moneyreconcile", "moneyset", "committedagainstpaid", "authoritychain"] },
  "money-checks": { map: moneyChecksOps, writes: { moneycheckparam: "undetermined", moneydetectordefine: "undetermined",
      moneydetectorswitch: "reversible", moneydetectorsrun: "substrate", moneydetectorgate: "substrate" },
    reads: ["moneyamountchecks", "moneyjunction", "moneycheckparams", "moneydetectors", "moneynoticed"] },
  duties: { map: dutiesOps, writes: { dutypropose: "undetermined", dutyadopt: "reversible", dutydeclare: "reversible",
      dutyrevise: "reasoned", dutywithdraw: "reasoned", dutymatch: "reasoned", dutytransition: "reasoned" },
    reads: ["duty", "dutiesof", "dutyoccurrences", "dutytransitions", "powersof", "dutysetagainst"] },
  people: { map: people.peopleOps, writes: { identityclaim: "reasoned", identitywithdraw: "reasoned", personfact: "reversible",
      personfactwithdraw: "reasoned", personexpunge: "reasoned", membertie: "reasoned", membertiewithdraw: "reasoned",
      sourcepersonlink: "reasoned", interestcheckdefine: "undetermined", interestcheckswitch: "reversible",
      interestcheckgate: "substrate" },
    reads: ["identity", "samepersoncandidates", "person", "career", "personcredentials", "personinterests",
      "personstatements", "staffing", "memberties", "sourcepersonlinks", "interestchecks"] },
  explore: { map: exploreOps, writes: {}, reads: ["explore", "explorepreset", "exploreverify", "exploretimeline"] },
  hypotheses: { map: hypothesesOps, writes: { hypothesishold: "reversible", hypothesisrevise: "reasoned",
      hypothesiswithdraw: "reasoned", /* R43 (T34-75) */ notewrite: "caller-owned", noteturn: "caller-owned" },
    reads: ["hypotheses", "notes" /* R43 */] },
  calculations: { map: calculationsOps, writes: { tabledeclare: "undetermined", bindingadopt: "undetermined",
      moneyingest: "reasoned", calculationcreate: "undetermined", calculationaccept: "undetermined",
      calculationdraw: "undetermined", recordset: "observational", patterngate: "substrate", patternswitch: "reversible" },
    reads: ["table", "tablesat", "calculationevaluate", "calculation", "patterns"] },
  workbooks: { map: workbooksOps, writes: { workbookadd: "undetermined", workbookbind: "reversible", workbookunbind: "reasoned",
      workbookrecompute: "observational", workbooklintexplain: "reasoned", workbookmethodnote: "reasoned",
      workbooksecondcheck: "undetermined" }, reads: ["workbook", "workbookinputs", "workbooklint", "workbookexport"] },
  answers: { map: answersOps, writes: { answercheck: "observational", ruleservicesswitch: "substrate",
      standingset: "caller-owned", standingend: "caller-owned", standingaiswitch: "substrate" },
    reads: ["rule", "asktallies", "standing", "standinganswers"] },
  following: { map: followingOps, writes: { followbody: "reversible", unfollow: "reversible", followregister: "reversible",
      followpersonquery: "reversible", followportal: "reversible", permeetingbody: "reversible", refreshregister: "substrate" },
    reads: ["follows", "snapshots", "snapshotdiff"] },
  standards: { map: standardsOps, part: true, writes: { lawrelate: "reasoned", lawwithdraw: "reasoned",
      lawpropose: "undetermined", courtlink: "reasoned", courttreat: "reasoned" },
    reads: ["inforceat", "standardsfor", "lawrelations", "lawaddresses", "stillstanding", "citationresolve"] },
  credentials: { map: credentialsOps, part: true, writes: { accountreferenceset: "credential",
      accountreferenceremove: "credential", accountswitchset: "caller-owned", aigrantmint: "credential",
      keyedserviceset: "credential", keyedserviceswitch: "substrate" }, reads: ["accountreference", "keyedservices"] },
  sources: { map: sourcesOps, part: true, writes: { sourcekeyed: "undetermined" }, reads: [] },
  entities: { map: entitiesOps, part: true, writes: { entityidentify: "reasoned" }, reads: [] },
  inquiry: { map: inquiryOps, part: true, writes: { waitlook: "caller-owned" }, reads: [] },
  "corpus-export": { map: corpusExportOps, part: true, writes: { exportrender: "substrate" }, reads: ["exportpage"] },
  actions: { map: actionsOps, part: true, writes: {}, reads: ["addresseesuggest"] },
  "action-clocks": { map: actionClocksOps, part: true, writes: { clockadopt: "undetermined" },
    reads: ["clocksics", "clocklateness"] },
  "ai-runs": { map: aiRunsOps, part: true, writes: { aiceilingset: "caller-owned", aicopyceilingset: "substrate",
      airunverify: "reasoned" }, reads: ["aiusage"] },
};
/* The ops T33's requirements name whose owners serve them in process but whose route arm is the wiring jobs' (op-declarations
   R17, K1601; instance-setup R50, R53): graded now so the table is total when they are routed. */
const UNROUTED = { clockpropose: "reversible", capturerequestplatformmark: "reversible",
  capturerequestplatformunmark: "reversible", officesseed: "substrate", assistantset: "substrate",
  /* B3 (K1689): the ops op-declarations declares beside them */
  seatsseed: "substrate", disclosureshown: "caller-owned", ask: "caller-owned", askusage: "observational" };
const UNROUTED_READS = ["capturerequestplatformhosts", "assistantstate", "disclosureof",
  "standardinforce" /* layer 9's read, gated since T33 (K1689) */];
/* A write op-declarations gives no NEEDS row (UNATTENDED_BY_DECISION): ranked, never named in NON_ACTS (R12). */
const UNGATED_WRITES = ["askusage"];
/* R27's `reversible`: the published act of the owner that takes each result back. */
const TAKEN_BACK_BY = {
  eventgovern: "eventgovern", eventrelate: "eventrelationwithdraw", linerecord: "linewithdraw", moneyrecord: "moneywithdraw",
  moneydetectorswitch: "moneydetectorswitch", dutyadopt: "dutywithdraw", dutydeclare: "dutywithdraw",
  personfact: "personfactwithdraw", interestcheckswitch: "interestcheckswitch", hypothesishold: "hypothesiswithdraw",
  patternswitch: "patternswitch", workbookbind: "workbookunbind", followbody: "unfollow", followregister: "unfollow",
  followpersonquery: "unfollow", followportal: "unfollow", unfollow: "followbody", permeetingbody: "permeetingbody",
};
/* R19: the code each reasoned op refuses with when the member's account is absent (driven in t33-backing.test.mjs). */
const REASON_CODE = {
  participantcorrect: "NO_REASON", eventmerge: "NO_REASON", eventsplit: "NO_REASON", eventrelationwithdraw: "NO_REASON",
  linewithdraw: "NO_REASON", moneywithdraw: "NO_REASON", moneysetinclude: "NO_REASON", moneysetexclude: "NO_REASON",
  dutyrevise: "DUTY_NO_REASON", dutywithdraw: "DUTY_NO_REASON", dutymatch: "DUTY_NO_REASON", dutytransition: "NO_CAUSE",
  identityclaim: "NO_NOTE", identitywithdraw: "NO_REASON", personfactwithdraw: "NO_REASON", personexpunge: "NO_REASON",
  membertie: "NO_NOTE", membertiewithdraw: "NO_REASON", sourcepersonlink: "NO_EVIDENCE", hypothesisrevise: "HYPOTHESIS_NO_REASON",
  hypothesiswithdraw: "HYPOTHESIS_NO_REASON", moneyingest: "NO_REASON", workbookunbind: "NO_REASON", workbooklintexplain: "NO_NOTE",
  workbookmethodnote: "NO_PURPOSE", lawrelate: "STANDARD_NO_REASON", lawwithdraw: "STANDARD_NO_REASON",
  courtlink: "STANDARD_NO_REASON", courttreat: "STANDARD_NO_REASON", entityidentify: "NO_BASIS",
  airunverify: "AI_RUN_VERIFICATION_UNFIT",
};
const ALL_WRITES = { ...Object.assign({}, ...Object.values(T33).map((m) => m.writes)), ...UNROUTED };
const ALL_READS = [...Object.values(T33).flatMap((m) => m.reads), ...UNROUTED_READS];
const published = () => new Set([...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].map((a) => a.id));

test("R40 R12: each new module's op map holds exactly the ops graded for it, and each earlier module's map holds the ops "
   + "T33 adds to it", () => {
  for (const [name, m] of Object.entries(T33)) {
    const keys = keysOf(m.map);
    const mine = [...Object.keys(m.writes), ...m.reads];
    if (m.part) assert.deepEqual(mine.filter((op) => !keys.includes(op)), [], name);
    else assert.deepEqual([...keys].sort(), [...mine].sort(), name);
  }
});

test("R40 R3 R27: every write T33 adds carries the grade R27's rule gives it — a rung or one ground, never both — and "
   + "the three tables of t33.mjs are the catalogue's, op for op; a misgraded op is seen", () => {
  const got = Object.fromEntries(Object.keys(ALL_WRITES).map((op) => [op, gradeOf(op)]));
  assert.deepEqual(got, ALL_WRITES);
  for (const op of Object.keys(ALL_WRITES)) {
    assert.ok(Object.hasOwn(RUNGS, op) !== Object.hasOwn(RUNG_ABSENT, op), op);
    if (Object.hasOwn(RUNG_ABSENT, op)) {
      assert.ok(Object.hasOwn(RUNG_ABSENCE_GROUNDS, RUNG_ABSENT[op].ground), op);
      assert.ok(typeof RUNG_ABSENT[op].is === "string" && RUNG_ABSENT[op].is.length > 40, op);
    }
  }
  for (const [op, r] of Object.entries(T33_RUNGS)) assert.equal(RUNGS[op], r, op);
  for (const [op, e] of Object.entries(T33_RUNG_ABSENT)) assert.equal(RUNG_ABSENT[op], e, op);
  for (const [op, why] of Object.entries(T33_NON_ACTS)) assert.equal(NON_ACTS[op], why, op);
  assert.deepEqual([...Object.keys(T33_RUNGS), ...Object.keys(T33_RUNG_ABSENT)].sort(), Object.keys(ALL_WRITES).sort());
  assert.deepEqual(Object.keys(T33_NON_ACTS).sort(),
    [...Object.keys(ALL_WRITES).filter((op) => !UNGATED_WRITES.includes(op)), ...ALL_READS].sort());
  /* negative control */
  assert.notDeepEqual({ ...got, linewithdraw: "reversible" }, ALL_WRITES);
});

test("R40 R27 R19: a `reversible` op names the published act of its owner that takes it back, and a `reasoned` op the "
   + "justification code its owner refuses the absent account with", () => {
  const ownerOf = (op) => Object.values(T33).find((m) => Object.hasOwn(m.writes, op));
  const reversible = Object.keys(ALL_WRITES).filter((op) => ALL_WRITES[op] === "reversible" && !Object.hasOwn(UNROUTED, op));
  assert.deepEqual(reversible.sort(), Object.keys(TAKEN_BACK_BY).sort());
  for (const [op, by] of Object.entries(TAKEN_BACK_BY)) {
    assert.ok(keysOf(ownerOf(op).map).includes(by), `${op}: ${by} is its owner's op`);
    assert.ok(gradeOf(by) !== null, `${by} is graded`);
  }
  const reasoned = Object.keys(ALL_WRITES).filter((op) => ALL_WRITES[op] === "reasoned");
  assert.deepEqual(reasoned.sort(), Object.keys(REASON_CODE).sort());
  for (const [op, c] of Object.entries(REASON_CODE)) assert.ok(JUSTIFICATION_REFUSALS.includes(c), `${op}: ${c}`);
  for (const c of ["NO_CAUSE", "NO_PURPOSE", "AI_RUN_VERIFICATION_UNFIT"]) assert.ok(JUSTIFICATION_REFUSALS.includes(c), c);
});

test("R40 R7: every T33 op carries its NON_ACTS reason — each read `read: …; writes nothing`, each write a reason that is "
   + "no read and no capture act — none is an act, and MACHINE_REFUSALS gains none (it holds only ACTS)", () => {
  for (const op of ALL_READS) {
    assert.ok(typeof NON_ACTS[op] === "string" && NON_ACTS[op].startsWith("read: ") && /writes nothing$/.test(NON_ACTS[op]), op);
    assert.equal(gradeOf(op), null, op);
  }
  for (const op of UNGATED_WRITES) assert.ok(!Object.hasOwn(NON_ACTS, op), op);
  for (const op of Object.keys(ALL_WRITES).filter((op) => !UNGATED_WRITES.includes(op))) {
    assert.ok(typeof NON_ACTS[op] === "string" && NON_ACTS[op].length > 30, op);
    assert.ok(!NON_ACTS[op].startsWith("read: ") && !NON_ACTS[op].startsWith("capture-directed:"), op);
  }
  const t33 = [...Object.keys(ALL_WRITES), ...ALL_READS];
  assert.deepEqual(t33.filter((op) => published().has(op)), []);
  assert.deepEqual(t33.filter((op) => Object.hasOwn(MACHINE_REFUSALS, op)), []);
  assert.deepEqual(Object.keys(MACHINE_REFUSALS).filter((op) => !ACTS.some((a) => a.id === op)), []);
});

test("R40 R12 R24: with the control plane's rows for them (op-declarations R17–R20: every write mutating with a NEEDS "
   + "row, every read a NEEDS row of null) nothing is unaccounted; carried by no row each reads stale; one left out is seen", () => {
  const table = [...Object.keys(ALL_WRITES).map((op) => ({ op, mutating: true, gated: !UNGATED_WRITES.includes(op) })),
    ...ALL_READS.map((op) => ({ op, mutating: false, gated: true }))];
  const all = new Set(table.map((t) => t.op));
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => all.has(op)), []);
  assert.deepEqual([...all].filter((op) => !A.unaccounted([]).stale.includes(op)), []);
  for (const op of ALL_READS) assert.ok(A.unaccounted([{ op, mutating: false, gated: false }]).stale.includes(op), op);
  const left = A.unaccounted([...table, { op: "moneyunnamed", mutating: true, gated: true }]);
  assert.deepEqual([left.unpublished, left.unranked], [["moneyunnamed"], ["moneyunnamed"]]);
  for (const op of Object.keys(ALL_WRITES)) {
    const d = A.decorate({ id: op, label: "x" }, null);
    assert.equal((d.rung === null) !== (d.rung_absence === null), true, `R24: ${op}`);
  }
});

test("R40 R3 R12: the whole catalogue stays consistent with T33's ops in it", () => {
  const ops = new Set([...Object.keys(NON_ACTS), ...ACTS.map((a) => a.id), ...Object.keys(RUNGS), ...Object.keys(RUNG_ABSENT)]);
  const table = [...ops].map((op) => ({ op, mutating: Object.hasOwn(RUNGS, op) || Object.hasOwn(RUNG_ABSENT, op),
    gated: Object.hasOwn(NON_ACTS, op) || ACTS.some((a) => a.id === op) }));
  assert.deepEqual(A.unaccounted(table), { unpublished: [], unranked: [], stale: [] });
  assert.deepEqual(Object.keys(RUNGS).filter((op) => Object.hasOwn(RUNG_ABSENT, op)), []);
});

/* ---- R39 ---------------------------------------------------------------------------------------------------------- */
const R39_KEYS = ["event_kinds", "dated_fact_kinds", "event_statuses", "participant_roles", "event_relation_kinds",
  "line_kinds", "line_capacities", "line_roles", "money_kinds", "money_phases", "money_stages", "money_bases",
  "money_precisions", "connection_kinds", "identity_claim_kinds"];
const EVENTS_KEYS = R39_KEYS.filter((k) => /^(event|dated|participant)/.test(k));
const FORBIDDEN = /knows|network|conflict|suspicious|most connected|ledger|diverted|misused/i;
const K1486 = { proposed: "proposed", adopted: "adopted", adjusted: "amended", encumbered: "committed", incurred: "spent",
  paid: "paid", assessed: "billed", collected: "collected" };

test("R39: a vocabulary whose owner is not composed answers absent, never empty — events' five before events registers "
   + "with connection-grammar, present after", () => {
  const composed = new Set(owners().map((o) => o.owner));
  assert.equal(composed.has("events"), false, "the instrument starts before events is composed");
  const before = A.vocabulariesFor(null);
  for (const k of EVENTS_KEYS) assert.equal(Object.hasOwn(before, k), false, k);
  for (const k of R39_KEYS.filter((k) => !EVENTS_KEYS.includes(k))) assert.ok(Object.hasOwn(before, k), k);
  eventsWorld().ev.start();
  const after = A.vocabulariesFor(null);
  for (const k of R39_KEYS) assert.ok(Object.hasOwn(after, k), k);
  assert.deepEqual(Object.keys(after).filter((k) => !Object.hasOwn(A.VOCABULARIES, k)).sort(), [...R39_KEYS].sort());
});

test("R39 R4: each vocabulary's values are the very objects its owner answers — the same reference, never a copy — and "
   + "every value carries its word", () => {
  eventsWorld().ev.start();
  const v = A.vocabulariesFor(null);
  const same = [["event_kinds", events.EVENT_KINDS], ["dated_fact_kinds", events.DATED_KINDS], ["event_statuses", events.STATUSES],
    ["participant_roles", events.ROLES], ["event_relation_kinds", events.RELATION_KINDS], ["line_kinds", lines.kinds()],
    ["line_capacities", lines.capacities()], ["money_kinds", money.kinds()], ["money_phases", money.phases()],
    ["money_stages", money.stages()], ["money_bases", money.bases()], ["money_precisions", money.precisions()],
    ["identity_claim_kinds", people.CLAIM_KINDS]];
  assert.deepEqual(same.filter(([k, o]) => v[k].values !== o).map(([k]) => k), []);
  for (const [k, o] of same) {
    assert.deepEqual(Object.keys(v[k].words), [...o], k);
    for (const w of Object.values(v[k].words)) {
      assert.ok(typeof w.word === "string" && w.word.length > 0, k);
      assert.ok(!FORBIDDEN.test(w.word), `${k}: ${w.word}`);
    }
  }
  /* line_roles: each kind's own array from roles(kind), and only kinds that take roles */
  const withRoles = lines.kinds().filter((k) => lines.roles(k).length);
  assert.deepEqual(Object.keys(v.line_roles.values), withRoles);
  for (const k of withRoles) {
    assert.equal(v.line_roles.values[k], lines.roles(k), k);
    assert.deepEqual(Object.keys(v.line_roles.words[k]), [...lines.roles(k)], k);
  }
  /* connection_kinds (N695, K1864): every kind connection-grammar's owners() lists, carried once: `values` the kind
     names in owners()' order, `words` each kind's registered word, class and owner, and nothing else beside them */
  const listed = owners().flatMap((o) => o.kinds.map((k) => [k.kind, { word: k.word, class: k.class, owner: o.owner }]));
  assert.deepEqual(Object.keys(v.connection_kinds), ["values", "words"]);
  assert.deepEqual(v.connection_kinds.values, listed.map(([k]) => k));
  assert.ok(v.connection_kinds.values.every((k) => typeof k === "string"), "the values are kind names, not registry entries");
  assert.equal(new Set(v.connection_kinds.values).size, v.connection_kinds.values.length, "each kind once");
  assert.deepEqual(v.connection_kinds.words, Object.fromEntries(listed));
  assert.deepEqual(Object.keys(v.connection_kinds.words), v.connection_kinds.values);
});

test("R39: each word is the owner's registered word where it holds one, else K1486's, else one plain word marked "
   + "provisional", () => {
  eventsWorld().ev.start();
  const v = A.vocabulariesFor(null);
  const expect = (k, value, registeredKind) => {
    const reg = registeredKind ? kindOf(registeredKind) : null;
    const want = reg ? { word: reg.word } : Object.hasOwn(K1486, value) && /^money_(phases|stages)$/.test(k)
      ? { word: K1486[value] } : { word: plainWord(value), provisional: true };
    assert.deepEqual(v[k].words[value], want, `${k}.${value}`);
  };
  for (const r of events.ROLES) expect("participant_roles", r, `event_${r}`);
  for (const r of events.RELATION_KINDS) expect("event_relation_kinds", r, `event_${r}`);
  for (const k of events.EVENT_KINDS) expect("event_kinds", k, null);
  for (const k of events.DATED_KINDS) expect("dated_fact_kinds", k, null);
  for (const k of events.STATUSES) expect("event_statuses", k, null);
  for (const k of lines.kinds()) expect("line_kinds", k, kindOf(`line:${k}`) ? `line:${k}` : null);
  for (const k of lines.capacities()) expect("line_capacities", k, null);
  for (const k of people.CLAIM_KINDS) expect("identity_claim_kinds", k, k);
  for (const k of money.phases()) expect("money_phases", k, null);
  for (const k of money.stages()) expect("money_stages", k, null);
  for (const k of money.kinds()) expect("money_kinds", k, null);
  /* the plain word, worked: a status loses `Event`, joined words are spaced */
  assert.equal(plainWord("EventMovedOnline"), "moved online");
  assert.equal(plainWord("stated_cause"), "stated cause");
  assert.equal(plainWord("procuringEntity"), "procuring entity");
  assert.equal(v.money_stages.words.encumbered.word, "committed");
  assert.equal(v.line_kinds.words.holds.provisional, true, "holds is registered per capacity only");
  assert.equal(v.identity_claim_kinds.words.same_as.word, "same person?");
});

test("R39 R26: vocabulariesFor keeps every fixed vocabulary the same object and adds only R39's", () => {
  const v = A.vocabulariesFor(["x"]);
  for (const k of Object.keys(A.VOCABULARIES)) if (k !== "action_kind") assert.equal(v[k], A.VOCABULARIES[k], k);
  assert.deepEqual(Object.keys(composedVocabularies()).filter((k) => !R39_KEYS.includes(k)), []);
});

/* ---- R41 ---------------------------------------------------------------------------------------------------------- */
const GATE = { needs: (id) => (id === "conclude" ? "contribute" : null), mode: () => "session" };
const ROWS = { NO_CONCLUSION: { check: "C-25.3", translation: "A conclusion says what was concluded." } };
const rowOf = (c) => ROWS[c] ?? null;
const inquiryFacts = { ok: true, target: "INQ-1", object_type: "inquiry", declared_type: "inquiry", current_state: "open",
  case_member: false, project_owner: true, basis_legs: 1, rested_on: { working: 0 }, basis_version_states: [],
  basis_versions: 0, contradiction_inquiry: false, actor_is_machine: false };

test("R41: a refusal is explained from its catalogue row as its owner holds it, beside the op's rung, absence, prompt and "
   + "weight; with a target, the acts R17 would answer now (a dry run), and none performed", () => {
  const e = A.explainRefusal({ op: "conclude", code: "NO_CONCLUSION", facts: inquiryFacts, gate: GATE, rowOf });
  assert.deepEqual(Object.keys(e).sort(),
    ["acts", "check", "code", "detail", "op", "prompt", "rung", "rung_absence", "translation", "weight"]);
  assert.equal(e.translation, ROWS.NO_CONCLUSION.translation);
  assert.equal(e.check, "C-25.3");
  assert.equal(e.detail, null);
  const d = A.decorate(ACTS.find((a) => a.id === "conclude"), GATE);
  assert.deepEqual([e.rung, e.rung_absence, e.prompt, e.weight], [d.rung, d.rung_absence, d.prompt, d.weight]);
  assert.deepEqual(e.acts, A.deriveActs(inquiryFacts).map((a) => A.decorate(a, GATE)));
  assert.ok(e.acts.some((a) => a.id === "conclude") && e.acts.every((a) => typeof a.rung === "string" || a.rung_absence));
  /* a write that is no act still answers its grade (R40's) */
  const w = A.explainRefusal({ op: "linewithdraw", code: "NO_REASON", gate: GATE, rowOf });
  assert.deepEqual([w.rung, w.weight, w.acts], ["reasoned", null, null]);
});

test("R41: a code no catalogue row holds answers translation null with the one sentence that it is not catalogued; "
   + "a target the caller may not see answers no acts; malformed input never throws", () => {
  const e = A.explainRefusal({ op: "conclude", code: "SOMETHING_NEW", gate: GATE, rowOf });
  assert.deepEqual([e.translation, e.check, e.detail], [null, null, A.NOT_CATALOGUED]);
  assert.deepEqual(A.explainRefusal({ op: "conclude", code: "NO_CONCLUSION" }).translation, null, "no lookup handed in");
  assert.deepEqual(A.explainRefusal({ op: "conclude", code: "X", facts: { ok: false, reason: "NO_SUCH_BUNDLE" } }).acts, []);
  for (const bad of [undefined, null, {}, { op: 7, code: {} }, { rowOf: () => { throw new Error("x"); }, code: "NO_CONCLUSION" },
    { facts: { ok: true, object_type: null }, op: "x" }, { gate: { needs: () => { throw new Error("g"); } }, op: "conclude" }])
    assert.doesNotThrow(() => A.explainRefusal(bad));
  assert.match(A.NOT_CATALOGUED, /not in the catalogue/);
});

test("R41 R22: the instance's explainRefusal asks the target's facts as the acts would and writes nothing", () => {
  const host = {};
  const a = affordancesOf(host);
  const asked = [];
  a.affordanceFacts = (q) => { asked.push(q); return inquiryFacts; };
  const q = { target: "INQ-1", viewer: "member:ann", identity: "member:ann", author: "member:ann", by: "member:ann" };
  const e = a.explainRefusal({ op: "conclude", code: "NO_CONCLUSION", ...q, gate: GATE, rowOf });
  assert.deepEqual(asked, [q]);
  assert.deepEqual(e.acts, A.deriveActs(inquiryFacts).map((x) => A.decorate(x, GATE)));
  assert.equal(a.explainRefusal({ op: "conclude", code: "NO_CONCLUSION", gate: GATE, rowOf }).acts, null);
  a.affordanceFacts = () => { throw new Error("store"); };
  assert.deepEqual(a.explainRefusal({ op: "conclude", code: "NO_CONCLUSION", target: "INQ-1" }).acts, []);
});
