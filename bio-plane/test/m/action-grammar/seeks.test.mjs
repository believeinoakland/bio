/* action-grammar R13 (T41-46a; H30 (1), intent R33, K2505) at the module's interface: the outcome `none_exists`, a records
   request's `seeks`, `seeksOf` and `seeksFindings` with its row C-117.29 `SEEKS_REFUSED`. Each part is driven explicitly
   with a negative control beside it (K874). Pure functions, driven with documents; `facts` is handed in as `actions` R70
   reads it from `progressions`. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as AG from "../../../src/action-grammar/index.mjs";
import { pushed, GROWN_COUNTS, ZONE } from "./fixture.mjs";
import { NOW, TODAY } from "./corpus.mjs";

const SHA = "a".repeat(64);
const OFFICE = { state: "named", role: "Clerk", body: "the Board" };
const CLOCK = { text: "reply due", description: "the reply is due", date: "2026-08-01", basis: "the group's stated window", status: "pending" };
const base = (o = {}) => ({
  object_type: "action", action_kind: "records_request", risk_tier: 2, counterparty: { ...OFFICE },
  action_basis: [{ target: "INFO-2026-0001-source", kind: "rests_on" }], clock: [{ ...CLOCK }], current_state: "active", ...o,
});
const sent = (o = {}) => ({ direction: "sent", at: "2026-06-01", artifact_sha: SHA, ...o });
const recv = (o = {}) => ({ direction: "received", at: "2026-06-10", account: "they wrote back", author: "member:a", ...o });
const codes = (list) => list.map((x) => x.code);
const audit = (fm) => pushed((f) => AG.checkActionExtension({ fm, nowMs: NOW, zone: ZONE }, f)).findings;

const ITEM = { progression: "permit-review", entity: "ENT-2026-0001", stage: "inspection" };
const ITEM2 = { progression: "permit-review", entity: "ENT-2026-0001", stage: "decision" };
const ITEM3 = { progression: "budget-cycle", entity: "ENT-2026-0002", stage: "adoption" };
const FACTS = { stages: { "permit-review": ["application", "inspection", "decision"], "budget-cycle": ["proposal", "adoption"] } };
const ROW = AG.ACTION_CATALOGUE_CHECKS.SEEKS_REFUSED;
const seeks = (list, facts = FACTS, o = {}) => pushed((f) => AG.seeksFindings(base({ seeks: list, ...o }), facts, f));
const finding = (message, repairs) => ({ check: "C-117.29", severity: "error", message, repairable: true,
  repairs: repairs ?? ["name each stage sought as {progression, entity, stage}, once each, at most twelve, each stage one its progression declares"],
  code: "SEEKS_REFUSED" });

/* ------------------------------------------------------------------------------------------------ the outcome */

test("R13: CORRESPONDENCE_OUTCOMES gains none_exists, appended, every earlier outcome in its place (R2's one binding)", () => {
  assert.deepEqual(AG.CORRESPONDENCE_OUTCOMES, ["granted", "denied", "partial", "reversed", "affirmed", "none_stated", "none_exists"]);
  assert.ok(GROWN_COUNTS.every((n) => n > 0), "each grown sentence was in the recorded answer");
});

test("R13: none_exists is an outcome of a received decision as the others are (R5): on each decision stage it answers no lifecycle finding, the ledger arm and the audit are clean, and the read carries it; negative controls: on a sent entry it is OUTCOME_NOT_ON_RECEIVED, a near-miss is OUTCOME_NOT_IN_VOCABULARY naming none_exists, and a decision with no outcome is still DECISION_WITHOUT_OUTCOME", () => {
  for (const stage of AG.DECISION_STAGES) {
    const entries = [sent({ stage: "request" }), recv({ stage, follows: "0", outcome: "none_exists" })];
    assert.deepEqual(AG.lifecycleFindings(entries, 1), [], stage);
    assert.deepEqual(pushed((f) => AG.correspondenceFindings({ correspondence: entries }, f)).findings, [], stage);
    assert.deepEqual(audit(base({ correspondence: entries })), [], stage);
    assert.equal(AG.requestLifecycleOf(base({ correspondence: entries }), TODAY).entries[1].outcome, "none_exists", stage);
    /* the same position for every outcome: none_exists is judged exactly as granted is */
    const granted = [entries[0], { ...entries[1], outcome: "granted" }];
    assert.deepEqual(AG.lifecycleFindings(granted, 1), AG.lifecycleFindings(entries, 1), stage);
  }
  /* an appeal may name a none_exists decision, as it may any decision */
  const appeal = [sent({ stage: "request" }), recv({ stage: "denial", follows: "0", outcome: "none_exists" }), sent({ stage: "appeal", follows: "1" })];
  assert.deepEqual(AG.lifecycleFindings(appeal, 2), []);
  /* negative controls */
  assert.deepEqual(codes(AG.lifecycleFindings([sent({ stage: "request", outcome: "none_exists" })], 0)), ["OUTCOME_NOT_ON_RECEIVED"]);
  const near = AG.lifecycleFindings([sent({ stage: "request" }), recv({ stage: "denial", follows: "0", outcome: "none_exist" })], 1);
  assert.deepEqual(near, [{ code: "OUTCOME_NOT_IN_VOCABULARY",
    message: "correspondence[1].outcome 'none_exist' is not one of: granted, denied, partial, reversed, affirmed, none_stated, none_exists" }]);
  assert.deepEqual(codes(AG.lifecycleFindings([sent({ stage: "request" }), recv({ stage: "denial", follows: "0" })], 1)), ["DECISION_WITHOUT_OUTCOME"]);
  assert.deepEqual(codes(audit(base({ correspondence: [sent({ stage: "request" }), recv({ stage: "denial", follows: "0", outcome: "none_exist" })] }))),
    ["OUTCOME_NOT_IN_VOCABULARY"]);
});

test("R13: C-94.5's translation names none_exists beside the other outcomes, so the row a member reads holds the whole vocabulary", () => {
  const t = AG.LIFECYCLE_CHECKS.OUTCOME_NOT_IN_VOCABULARY.translation;
  assert.equal(AG.LIFECYCLE_CHECKS.OUTCOME_NOT_IN_VOCABULARY.check, "C-94.5");
  for (const o of AG.CORRESPONDENCE_OUTCOMES) assert.ok(t.includes(o), o);
});

/* ------------------------------------------------------------------------------------------------ seeksOf */

test("R13: seeksOf answers a records request's well-formed items, each once, in order, as {progression, entity, stage}; [] when absent; negative controls: malformed and repeated items are left out, another kind and a seeks that is not a list answer []", () => {
  assert.deepEqual(AG.seeksOf(base()), []);
  assert.deepEqual(AG.seeksOf(base({ seeks: null })), []);
  assert.deepEqual(AG.seeksOf(base({ seeks: [ITEM, ITEM2, ITEM3] })), [ITEM, ITEM2, ITEM3]);
  assert.deepEqual(AG.seeksOf(base({ seeks: [ITEM, { ...ITEM }, ITEM2, ITEM] })), [ITEM, ITEM2]);
  assert.deepEqual(AG.seeksOf(base({ seeks: [null, "x", { ...ITEM, note: "y" }, { ...ITEM, stage: "" }, ITEM3, { ...ITEM, entity: "e".repeat(201) }] })), [ITEM3]);
  const answered = AG.seeksOf(base({ seeks: [ITEM] }));
  assert.notEqual(answered[0], ITEM, "a copy, never the document's own object");
  assert.deepEqual(AG.seeksOf(base({ action_kind: "other", seeks: [ITEM] })), []);
  assert.deepEqual(AG.seeksOf(base({ seeks: "ITEM" })), []);
  assert.deepEqual(AG.seeksOf(base({ seeks: [] })), []);
  for (const junk of [undefined, null, 0, "x", [], {}]) assert.deepEqual(AG.seeksOf(junk), [], String(junk));
  /* more than twelve: the well-formed ones are still what the document names */
  const many = Array.from({ length: 13 }, (_, i) => ({ ...ITEM, entity: `ENT-2026-${String(i + 1).padStart(4, "0")}` }));
  assert.equal(AG.seeksOf(base({ seeks: many })).length, 13);
});

/* ------------------------------------------------------------------------------------------------ seeksFindings */

test("R13: seeksFindings pushes nothing for well-formed seeks whose every stage its progression declares, nor for an absent seeks on any kind; it answers nothing; negative control beside each: one fault, one finding", () => {
  assert.deepEqual(seeks([ITEM, ITEM2, ITEM3]), { findings: [], answered: false });
  assert.deepEqual(pushed((f) => AG.seeksFindings(base(), FACTS, f)), { findings: [], answered: false });
  assert.deepEqual(pushed((f) => AG.seeksFindings(base({ action_kind: "other" }), FACTS, f)).findings, []);
  assert.deepEqual(pushed((f) => AG.seeksFindings(base({ seeks: null }), FACTS, f)).findings, []);
  assert.equal(seeks([ITEM, { ...ITEM2, stage: "appeal" }]).findings.length, 1);
});

test("R13: seeks on another kind than records_request is one finding, and nothing more is asked of it; negative control: the same seeks on a records request is clean", () => {
  for (const kind of ["other", "request_for_comment", "cpra_request", "bylaw_complaint", undefined]) {
    const got = seeks([ITEM, null, ITEM], FACTS, { action_kind: kind }).findings;
    assert.deepEqual(got, [finding(`seeks is stated on a '${String(kind)}' action: only a records_request names the stages it asks the records for (R13)`,
      ["remove seeks, or make the kind records_request"])], String(kind));
  }
  assert.deepEqual(seeks([ITEM]).findings, []);
});

test("R13: seeks that is not a list of 1 to 12 entries is one finding; more than 12 is one finding beside each item's own; negative controls: exactly 1 and exactly 12 are clean", () => {
  const notList = finding("seeks is not a list of 1 to 12 {progression, entity, stage} entries (R13)");
  for (const v of [[], "permit-review", 5, {}, ITEM, true]) assert.deepEqual(seeks(v).findings, [notList], JSON.stringify(v));
  const n = (k) => Array.from({ length: k }, (_, i) => ({ ...ITEM, entity: `ENT-2026-${String(i + 1).padStart(4, "0")}` }));
  assert.deepEqual(seeks(n(1)).findings, []);
  assert.deepEqual(seeks(n(12)).findings, []);
  assert.equal(AG.SEEKS_MAX, 12);
  assert.deepEqual(seeks(n(13)).findings, [finding("seeks holds 13 entries; at most 12 (R13)")]);
  const over = seeks([...n(12), null]).findings;
  assert.deepEqual(over, [finding("seeks holds 13 entries; at most 12 (R13)"), finding("seeks[12] is not a {progression, entity, stage} entry (R13)")]);
});

test("R13: a malformed item is one finding each: not an entry, a key beyond the three, a part that is not a non-empty string of at most 200 characters; negative controls: 200 characters, and a part with inner spaces, are well formed", () => {
  assert.equal(AG.SEEKS_PART_MAX, 200);
  const cases = [
    [null, "is not a {progression, entity, stage} entry"],
    ["permit-review", "is not a {progression, entity, stage} entry"],
    [[ITEM], "is not a {progression, entity, stage} entry"],
    [{ ...ITEM, note: "x" }, "carries note: an entry names only its progression, entity and stage"],
    [{ ...ITEM, progression: undefined }, "progression is not a non-empty string of at most 200 characters"],
    [{ entity: ITEM.entity, stage: ITEM.stage }, "progression is not a non-empty string of at most 200 characters"],
    [{ ...ITEM, entity: "" }, "entity is not a non-empty string of at most 200 characters"],
    [{ ...ITEM, entity: "   " }, "entity is not a non-empty string of at most 200 characters"],
    [{ ...ITEM, stage: 3 }, "stage is not a non-empty string of at most 200 characters"],
    [{ ...ITEM, stage: "s".repeat(201) }, "stage is not a non-empty string of at most 200 characters"],
    [{ ...ITEM, progression: "p".repeat(201) }, "progression is not a non-empty string of at most 200 characters"],
  ];
  for (const [item, says] of cases)
    assert.deepEqual(seeks([ITEM, item]).findings, [finding(`seeks[1] ${says} (R13)`)], JSON.stringify(item));
  /* each malformed item is its own finding */
  assert.equal(seeks([null, { ...ITEM, stage: "" }, ITEM]).findings.length, 2);
  const long = { progression: "p".repeat(200), entity: "e".repeat(200), stage: "s".repeat(200) };
  assert.deepEqual(seeks([long], { stages: { [long.progression]: [long.stage] } }).findings, []);
  assert.deepEqual(seeks([{ ...ITEM3, stage: "final adoption" }], { stages: { "budget-cycle": ["final adoption"] } }).findings, []);
});

test("R13: an item repeating an earlier one is one finding each; negative controls: items differing in any one part are distinct", () => {
  assert.deepEqual(seeks([ITEM, ITEM2, { ...ITEM }]).findings, [finding("seeks[2] repeats an earlier entry: each stage sought is named once (R13)")]);
  assert.equal(seeks([ITEM, ITEM, ITEM]).findings.length, 2);
  for (const k of ["progression", "entity", "stage"]) {
    const other = { ...ITEM, [k]: `${ITEM[k]}-2` };
    const stages = { [ITEM.progression]: [ITEM.stage] };
    stages[other.progression] = [...(stages[other.progression] ?? []), other.stage];
    assert.deepEqual(seeks([ITEM, other], { stages }).findings, [], k);
  }
});

test("R13: an item whose stage facts says its progression does not declare is one finding, and one whose progression facts says is not held; negative controls: a declared stage is clean, and a progression facts names no entry for is not judged", () => {
  assert.deepEqual(seeks([ITEM, { ...ITEM2, stage: "appeal" }]).findings,
    [finding("seeks[1].stage 'appeal' is not a stage progression 'permit-review' declares (R13)")]);
  assert.deepEqual(seeks([{ ...ITEM, progression: "gone" }], { stages: { ...FACTS.stages, gone: null } }).findings,
    [finding("seeks[0].progression 'gone' is not a progression this record holds (R13)")]);
  /* a progression facts holds with no stage list declares no stage */
  assert.equal(seeks([ITEM], { stages: { "permit-review": "inspection" } }).findings.length, 1);
  assert.equal(seeks([ITEM], { stages: { "permit-review": [] } }).findings.length, 1);
  /* not judged: no entry, no facts, facts of no shape */
  assert.deepEqual(seeks([{ ...ITEM, progression: "unasked" }]).findings, []);
  for (const facts of [undefined, null, {}, { stages: null }, { stages: "x" }, 5])
    assert.deepEqual(pushed((f) => AG.seeksFindings(base({ seeks: [{ ...ITEM, stage: "appeal" }] }), facts, f)).findings, [], JSON.stringify(facts));
  /* a key the object inherits is no entry */
  assert.deepEqual(seeks([{ ...ITEM, progression: "constructor" }], { stages: {} }).findings, []);
  assert.deepEqual(seeks([{ ...ITEM, progression: "toString" }], FACTS).findings, []);
  /* malformed and repeated items are not asked of facts */
  assert.equal(seeks([ITEM, { ...ITEM, note: "x", stage: "appeal" }, { ...ITEM }]).findings.length, 2);
  /* every fault at once, in the document's order */
  const all = seeks([ITEM, { ...ITEM2, stage: "appeal" }, null, { ...ITEM }, { ...ITEM3, progression: "gone" }], { stages: { ...FACTS.stages, gone: null } }).findings;
  assert.deepEqual(all.map((x) => x.message.slice(0, 8)), ["seeks[1]", "seeks[2]", "seeks[3]", "seeks[4]"]);
});

test("R13: every finding is C-117.29 SEEKS_REFUSED's: the row is held in ACTION_CATALOGUE_CHECKS, its where names seeksFindings' own region in this module, and its translation names no op, ruling, check number or place", () => {
  assert.deepEqual(ROW, {
    check: "C-117.29", where: "src/action-grammar/checks.mjs seeksFindings > is-seeks",
    translation: "A records request may name the stages it asks the records for: one to twelve different entries, each naming a "
      + "progression, an entity and a stage in at most 200 characters each, and each stage one its progression declares. Only a "
      + "records request names them. This write named them otherwise, so nothing was written.",
  });
  const src = readFileSync(new URL("../../../src/action-grammar/checks.mjs", import.meta.url), "utf8");
  assert.ok(src.includes("DEC-49 REGION is-seeks") && src.includes("END DEC-49 REGION is-seeks"));
  assert.match(src, /export function seeksFindings\(/);
  assert.doesNotMatch(ROW.translation, /\b(bundle|op=|DEC-|C-\d|ENT-|Oakland|Alameda|California)/);
  const every = [seeks([ITEM], FACTS, { action_kind: "other" }), seeks([]), seeks([null]), seeks([ITEM, ITEM]),
    seeks([{ ...ITEM, stage: "appeal" }])].flatMap((x) => x.findings);
  assert.equal(every.length, 5);
  for (const x of every) { assert.equal(x.check, ROW.check); assert.equal(x.code, "SEEKS_REFUSED"); assert.equal(x.severity, "error"); }
});

test("R13, R10: seeksFindings and seeksOf read no record and change nothing: deeply frozen inputs, the same answers each time, never a throw on junk; the audit is not asked (actions R70 asks seeksFindings at its write)", () => {
  const freeze = (o) => { if (o && typeof o === "object") { Object.values(o).forEach(freeze); Object.freeze(o); } return o; };
  const fm = freeze(base({ seeks: [ITEM, { ...ITEM2, stage: "appeal" }, null, { ...ITEM }] }));
  const facts = freeze(structuredClone(FACTS));
  const first = pushed((f) => AG.seeksFindings(fm, facts, f));
  assert.deepEqual(pushed((f) => AG.seeksFindings(fm, facts, f)), first);
  assert.deepEqual(AG.seeksOf(fm), AG.seeksOf(fm));
  const junk = [undefined, null, 0, "x", [], {}, { seeks: 5 }, { action_kind: "records_request", seeks: [5, [], { progression: {} }] },
    { action_kind: "records_request", seeks: [{ progression: "a", entity: "b", stage: "c" }] }];
  for (const j of junk) for (const fx of [undefined, null, 5, { stages: 5 }, { stages: { a: 5 } }, { stages: { a: null } }])
    assert.doesNotThrow(() => { AG.seeksFindings(j, fx, []); AG.seeksOf(j); }, JSON.stringify([j, fx]));
  assert.deepEqual(audit(base({ seeks: [{ ...ITEM, stage: "appeal" }, null] })), [], "seeks is the write's to judge, not the audit's");
});

/* ------------------------------------------------------------------------------------------------ R14: the fence's row */

test("R14: the row C-32.21 MACHINE_CANNOT_STATE_SEEKS is held in RECORDS_LAW_FENCE_CHECKS directly after C-32.20, {check, where, translation} exactly, its where naming actions' fence (#seeksFence > is-machine-state-seeks, actions R72), its words saying a machine or unstamped author may propose and may not state or change what a records request seeks; no other table holds it; negative controls: C-32.20 is unchanged and C-32.21 is held by no other code", () => {
  const F = AG.RECORDS_LAW_FENCE_CHECKS;
  assert.deepEqual(Object.keys(F), ["MACHINE_CANNOT_STATE_RECORDS_LAW", "MACHINE_CANNOT_STATE_SEEKS"]);
  const row = F.MACHINE_CANNOT_STATE_SEEKS;
  assert.deepEqual(Object.keys(row), ["check", "where", "translation"]);
  assert.equal(row.check, "C-32.21");
  assert.equal(row.where, "src/actions/index.mjs #seeksFence > is-machine-state-seeks");
  assert.equal(row.translation, "Which stages a records request asks the records for is a statement a member makes and answers for. "
    + "The credential that asked here is an automated one, or no member is named behind it: it can propose the stages for a member to "
    + "consider, but it cannot state or change what the request seeks. Nothing was written. Sign in to state it yourself.");
  assert.match(row.translation, /automated/);
  assert.match(row.translation, /no member is named/);
  assert.match(row.translation, /propose/);
  assert.match(row.translation, /cannot state or change/);
  assert.doesNotMatch(row.translation, /\b(bundle|op=|DEC-|C-\d|ENT-|Oakland|Alameda|California)/);
  /* negative controls */
  assert.equal(F.MACHINE_CANNOT_STATE_RECORDS_LAW.check, "C-32.20");
  assert.equal(F.MACHINE_CANNOT_STATE_RECORDS_LAW.where, "src/actions/index.mjs #machineRecordsLawRefusal > is-machine-state-records-law");
  const tables = ["ACTION_FENCE_CHECKS", "ACTION_ACT_CHECKS", "GOVERNING_LAW_CHECKS", "QUOTE_CHECKS", "LIFECYCLE_CHECKS",
    "RISK_TIER_REVISION_CHECKS", "ACTION_CATALOGUE_CHECKS"];
  for (const t of tables) assert.ok(!("MACHINE_CANNOT_STATE_SEEKS" in AG[t]), t);
  const holders = [...tables, "RECORDS_LAW_FENCE_CHECKS"].flatMap((t) => Object.entries(AG[t])).filter(([, r]) => r.check === "C-32.21");
  assert.deepEqual(holders.map(([c]) => c), ["MACHINE_CANNOT_STATE_SEEKS"]);
});
