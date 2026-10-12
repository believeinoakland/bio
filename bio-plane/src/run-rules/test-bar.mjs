/* R19 as amended (T41-21; D11, D14; K2405, K2418) — THE TEST BAR. An AI part (each mode, the explorer's use, each draft
 * kind, transcription and reading) is deployable only when a well-formed `ai-runs` R75 record is held that it passed its
 * bar on Civicsmith's test investigations (`./test-set.mjs`), besides R19's verification chain (`./deployment.mjs`
 * `deployable`). This module holds no record: `ai-runs` writes them (its R75 `testBarRecord`) and hands the ones it
 * holds to `testBarHeld` and `partDeployable`, so the bar, like the chain, is the record's and never a parameter a caller
 * sets. R29 (T46) adds the test-instance exception below: `partAdmittedOn` is the one gate every door asks, and
 * `partRefusal` (R30) its refusal. Pure; never throws. */
import { AI_RUN_OWN_CHECKS } from "./checks.mjs";
import { DEPLOYMENT_SEQUENCE, ASK_MODE, ENQUIRE_MODE, DRAFT_KINDS, deployable } from "./deployment.mjs";
import { CIVICSMITH_TEST_SET } from "./test-set.mjs";

/** The AI parts the bar is held for, each by the name an R75 record carries: the run modes of the order; the
 *  interactive modes `ask` and `enquire`; `explore`, the explorer's use (`question-explorer`); each draft kind as
 *  `draft:<kind>` (a draft is measured per kind, since each reads and writes differently); `transcribe` and `read`
 *  (`credentials` R55's use kinds for transcription and reading inside documents). Frozen. */
export const TEST_BAR_PARTS = Object.freeze([
  ...DEPLOYMENT_SEQUENCE.order, ASK_MODE.mode, ENQUIRE_MODE.mode, "explore",
  ...DRAFT_KINDS.map((k) => `draft:${k}`), "transcribe", "read",
]);

/** `ai-runs` R75's record, the shape this module judges. */
export const TEST_BAR_RECORD = Object.freeze({
  fields: Object.freeze(["part", "set", "set_version", "false_alarm_rate", "passed", "graded_by", "at"]),
  means: Object.freeze({
    part: "the AI part tested, one of TEST_BAR_PARTS",
    set: "the set of test investigations it was graded on",
    set_version: "the version of that set, a whole number of one or more",
    false_alarm_rate: "how often it raised a false alarm on that set, from 0 to 1",
    passed: "whether it passed its bar there, true or false",
    graded_by: "who or what graded it",
    at: "when it was graded",
  }),
});

const blank = (v) => typeof v !== "string" || v.trim() === "";

function unfit(field, detail) {
  const row = AI_RUN_OWN_CHECKS.AI_TEST_BAR_UNFIT;
  return { ok: false, code: "AI_TEST_BAR_UNFIT", check: row.check, translation: row.translation,
           detail: `${detail}. Nothing was recorded`, field };
}

/** R19 — IS THIS A WELL-FORMED R75 RECORD? Null when it is; else `AI_TEST_BAR_UNFIT` (C-22.22) naming the first unfit
 *  field, in TEST_BAR_RECORD's order: a value that is not an object; a part not in TEST_BAR_PARTS; a blank set; a version
 *  that is not a whole number of one or more; a false-alarm rate that is not a number from 0 to 1; a `passed` that is not
 *  exactly true or false; a blank grader; a blank time. A record of any set is judged well-formed here: which set counts
 *  for the gate is `testBarHeld`'s. Never throws. */
export function checkTestBarRecord(r) {
  if (!r || typeof r !== "object" || Array.isArray(r))
    return unfit(null, `a test-bar result is a record of { ${TEST_BAR_RECORD.fields.join(", ")} }`);
  if (typeof r.part !== "string" || !TEST_BAR_PARTS.includes(r.part))
    return unfit("part", `${JSON.stringify(String(r.part ?? "").slice(0, 40))} is not an AI part the bar is held for`);
  if (blank(r.set)) return unfit("set", "it names no set of test investigations");
  if (!(Number.isSafeInteger(r.set_version) && r.set_version >= 1))
    return unfit("set_version", "its set's version is not a whole number of one or more");
  if (!(typeof r.false_alarm_rate === "number" && r.false_alarm_rate >= 0 && r.false_alarm_rate <= 1))
    return unfit("false_alarm_rate", "its false-alarm rate is not a number from 0 to 1");
  if (r.passed !== true && r.passed !== false) return unfit("passed", "it does not say whether the part passed");
  if (blank(r.graded_by)) return unfit("graded_by", "it names nobody who graded it");
  if (blank(r.at)) return unfit("at", "it does not say when it was graded");
  return null;
}

/** R19 — IS THE BAR HELD FOR `part` ON `set`? The one computation `testBarHeld` makes over Civicsmith's set, exported so
 *  a set with matters can be judged before Civicsmith's has any. True when `records` holds a well-formed record
 *  (`checkTestBarRecord`) for that part with `passed: true` on `set`'s id at its CURRENT version, and `set` holds at least
 *  one matter. Another set's records, an earlier version's, a failed or unfit record, and every record on an empty or
 *  malformed set count for nothing. A part not in TEST_BAR_PARTS is false. Never throws. */
export function testBarHeldOn(set, part, records) {
  if (typeof part !== "string" || !TEST_BAR_PARTS.includes(part)) return false;
  if (!set || typeof set !== "object" || blank(set.id) || !Array.isArray(set.matters) || set.matters.length === 0)
    return false;
  return (Array.isArray(records) ? records : []).some((r) => checkTestBarRecord(r) === null && r.part === part
    && r.passed === true && r.set === set.id && r.set_version === set.version);
}

/** R19 — IS THE BAR HELD FOR `part`, ON CIVICSMITH'S SET (`./test-set.mjs`)? A group's own set never opens or closes the
 *  gate (`ai-runs` R75), so this reads Civicsmith's alone. While that set holds no matter, false for every part. */
export function testBarHeld(part, records) {
  return testBarHeldOn(CIVICSMITH_TEST_SET, part, records);
}

/** R19 as amended — MAY THIS AI PART BE DEPLOYED, ON THE RECORDS HELD, against `set`? `partDeployable`'s one computation:
 *  its test bar held on `set` (`testBarHeldOn`) AND, for a mode of the order, the chain (`deployable(part,
 *  verifications)`); a part outside the order (a mode that deploys apart, the explorer's use, a draft kind,
 *  transcription, reading) needs the bar alone here, its own reviewed flag deploying it besides. Never throws. */
export function partDeployableOn(set, part, held) {
  const { verifications = [], testBars = [] } = held && typeof held === "object" ? held : {};
  if (!testBarHeldOn(set, part, testBars)) return false;
  return DEPLOYMENT_SEQUENCE.order.includes(part) ? deployable(part, verifications) : true;
}

/** R19 as amended — THE DEPLOY GATE, on Civicsmith's set: `partDeployableOn(CIVICSMITH_TEST_SET, part, held)`, `held`
 *  being `{verifications, testBars}` as the record holds them. */
export function partDeployable(part, held) {
  return partDeployableOn(CIVICSMITH_TEST_SET, part, held);
}

/* A machine grader is not refused: R75's results are "written by the harness", grading against answers people wrote. */

/* R29 (T46; K2816 (2); amends R19; `draft-T46-trial.md` §1.1, §1.2) — THE TEST-INSTANCE EXCEPTION. Bob's ruling: the
 * deployer may mark one instance a test instance, on which an AI part whose test bar is not yet held runs anyway, every
 * output it gives labelled as not yet tested. The exception lifts the test bar and nothing else: it never sets or reads a
 * deploy flag (R14, R16, R21, R24, R27: the flags mark served code, and the doors still ask them), never lifts R19's
 * verification chain, and never counts as a bar held (no R75 record is written or read differently). `testInstance` is a
 * fact of the deployment that `ai-runs` reads from the Worker's environment and hands here (its R78), never a field a
 * caller sends; only the literal `true` is one. */

/** R29 — the key of the label's words (`words.json`, DEC-179), the design stream's to word. */
export const UNTESTED_WORDS = "ai.label.untested";

/** R29 — THE LABEL every output of a part admitted on the exception carries: `{kind: "untested", part, set, set_version,
 *  words}`, frozen, naming Civicsmith's set and its current version (the bar the part has not yet passed), for a part in
 *  TEST_BAR_PARTS; null for anything else. Pure; never throws. */
export function untestedLabel(part) {
  if (typeof part !== "string" || !TEST_BAR_PARTS.includes(part)) return null;
  return Object.freeze({ kind: "untested", part, set: CIVICSMITH_TEST_SET.id, set_version: CIVICSMITH_TEST_SET.version,
                         words: UNTESTED_WORDS });
}

const ADMITTED = Object.freeze({ admitted: true, untested: null });
const NOT_ADMITTED = Object.freeze({ admitted: false, untested: null });

/** R29 — THE ONE COMPUTATION EVERY DEPLOY GATE ASKS, against `set`. `{admitted: true, untested: null}` when
 *  `partDeployableOn(set, part, held)` (R19: the bar, and for a mode of the order the chain) is true. When the bar is not
 *  held but everything else R19 asks is (a part of TEST_BAR_PARTS; for a mode of the order, the chain, `deployable(part,
 *  verifications)`) and `opts.testInstance` is exactly `true`, `{admitted: true, untested: untestedLabel(part)}`.
 *  Otherwise `{admitted: false, untested: null}`, whose refusal is `partRefusal(part)` (R30). Answers frozen. Own keys of
 *  `opts` only. Pure; never throws. */
export function partAdmittedOn(set, part, held, opts) {
  if (partDeployableOn(set, part, held)) return ADMITTED;
  const testInstance = opts != null && typeof opts === "object" && Object.prototype.hasOwnProperty.call(opts, "testInstance")
    ? opts.testInstance : false;
  if (testInstance !== true || typeof part !== "string" || !TEST_BAR_PARTS.includes(part)) return NOT_ADMITTED;
  if (DEPLOYMENT_SEQUENCE.order.includes(part)) {
    const { verifications = [] } = held && typeof held === "object" ? held : {};
    if (!deployable(part, verifications)) return NOT_ADMITTED;
  }
  return Object.freeze({ admitted: true, untested: untestedLabel(part) });
}

/** R29 — THE GATE ON CIVICSMITH'S SET: `partAdmittedOn(CIVICSMITH_TEST_SET, part, held, opts)`. */
export function partAdmitted(part, held, opts) {
  return partAdmittedOn(CIVICSMITH_TEST_SET, part, held, opts);
}

/** R30 — THE GATE'S REFUSAL FORM: `AI_PART_NOT_DEPLOYED` (C-22.29), the one site that mints it, built from its row in this
 *  module's table and naming the part (its first 40 characters) in `part` and the detail. A door that `partAdmittedOn`
 *  does not admit, and that has no refusal of its own, relays it unchanged (`plane` R40). Pure; never throws. */
export function partRefusal(part) {
  const row = AI_RUN_OWN_CHECKS.AI_PART_NOT_DEPLOYED;
  const p = String(part ?? "").slice(0, 40);
  return { ok: false, code: "AI_PART_NOT_DEPLOYED", check: row.check, translation: row.translation,
           detail: `${JSON.stringify(p)} has not passed its bar on Civicsmith's test investigations, or what must come `
             + "before it is not yet verified, and this is not a test instance (R29). Nothing was sent to the assistant",
           part: p };
}
