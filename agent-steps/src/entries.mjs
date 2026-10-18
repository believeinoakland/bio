/* agent-steps — the log entries a segment sends, in the record's own words (R21, R39; moved from `agent-worker`). */
/* Requirement ids in the comments below are `agent-worker`'s, as they stood when this code moved (T51, K3850); `build/requirements/agent-steps.md` maps them to this module's. */
import { LEVELS } from "../../agent-harness/src/harness.mjs";
import { spawnContract } from "../../agent-harness/src/subsession.mjs";
import { checkCondition, DEFINITIVE_STATES } from "../../bio-plane/src/run-rules/index.mjs";
import { localize } from "../../bio-plane/src/setup-words/index.mjs";

/* R92 (R085-8; K3477; WALK-085 F2, cause B) — AN ENTRY THIS MEMBER SENDS IS IN THE RECORD'S OWN WORDS.
 *
 * The cause, measured on biosmoke8 and reproduced over the plane's real append path: `agent-model`'s judging and
 * `report` tools offer `condition` as a free string, so a model writes prose there ("the source was slow", "none found"),
 * and this member copied it into the log entry. The observation log takes a `condition` only from its vocabulary
 * (observation-log's `CONDITION_KINDS`, C-22.4 `AI_RUN_CONDITION_UNKNOWN`), and a look `governed` by our own pacing only
 * as LOOKED_INDETERMINATE (D-104, C-22.2 `AI_LOG_GOVERNED_ABSENCE`). Every such entry was refused, so a check run's log
 * stayed empty and every sub-session's report went out with no `observed_at` (REPORT_UNLOCATED).
 *
 * The plane is still the judge: the test is the plane's own `checkCondition` and `DEFINITIVE_STATES`, read through
 * run-rules (its re-export of observation-log's, the one function reached through a second door, never a copy). What
 * the model said is kept, as stated text in `detail`, never dropped. Pure. */

export const LOG_DETAIL_MAX = 500;

/** The entry as the record takes it: `{entry, governedDowngrade}`. A `condition` outside the vocabulary leaves the
 *  field and is stated in `detail`; a `governed` look stating a definitive state is recorded LOOKED_INDETERMINATE,
 *  with the stated state in `detail` (`governedDowngrade` is then the state it replaced). Anything else is unchanged. */
export function loggable(entry) {
  if (!entry || typeof entry !== "object") return { entry, governedDowngrade: null };
  const out = { ...entry };
  const said = [];
  if (out.condition != null && out.condition !== "" && checkCondition(out.condition) !== null) {
    said.push(localize("agent-steps.entries.condition_stated_as_stringify_which", "condition stated as {stringify}, which is not a word of the record's condition vocabulary, so none is recorded", { stringify: String(JSON.stringify(String(out.condition).slice(0, 160))) }));
    out.condition = null;
  }
  let governedDowngrade = null;
  if (out.governed === true && DEFINITIVE_STATES.has(String(out.state))) {
    governedDowngrade = String(out.state);
    said.push(localize("agent-steps.entries.stated_governeddowngrade_while_our_own", "stated {governedDowngrade} while our own pacing governed the look, which supports only LOOKED_INDETERMINATE (D-104)", { governedDowngrade: String(governedDowngrade) }));
    out.state = "LOOKED_INDETERMINATE";
  }
  if (said.length) out.detail = [...said, String(out.detail ?? "")].filter(Boolean).join("; ").slice(0, LOG_DETAIL_MAX);
  return { entry: out, governedDowngrade };
}

/* R117 (T50; N1188; K3557; `agent-model` R18, R23) — A `condition` OUTSIDE THE RECORD'S VOCABULARY IS HANDED BACK ONCE.
 *
 * The model writes `condition` on `judge_plan`, `judge_compose` and a sub-session's `report`; the observation log takes
 * one only from its vocabulary (R92 sends none that is not one, saying in `detail` what was stated). Rather than lose
 * the model's meaning to a refusal at the append, the final call is checked as it is made (`checkFinal`, agent-model
 * R18): a `condition` that `run-rules`' `checkCondition` does not admit is handed back once with the vocabulary in the
 * detail, for the model to rewrite; a second one outside it is taken, with `condition` null, the state exactly as stated
 * and `detail` saying what was stated (R92's `loggable`), never as a lower state. The vocabulary is read from the
 * contract `agent-harness` builds (R11: `returns.conditions`), never listed here. */
export const CONDITIONS = spawnContract({ level: LEVELS[0], payload: {} }).contract?.returns?.conditions ?? [];
export const JUDGED_WITH_CONDITION = new Set(["plan", "compose"]);
export function conditionFault(input) {
  const stated = input?.condition;
  if (stated == null || stated === "" || checkCondition(stated) === null) return null;
  return { code: "AI_RUN_CONDITION_UNKNOWN",
           detail: localize("agent-steps.entries.string_is_not_one_of", "'{String}' is not one of the record's conditions ({CONDITIONS}); name one of them, or leave condition out", { String: String(String(stated).slice(0, 80)), CONDITIONS: String(CONDITIONS.join(", ")) }) };
}
