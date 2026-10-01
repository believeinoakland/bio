/* intent — the project grammar, C-2.9's other arms and C-9.1 (R29; K653 BOB-4; rule 2, T19 layer 7). The type arm
 * record-grammar's `checkBundle` runs over a `project` bundle in its `checkProjectExtension` slot (record-grammar R28):
 * `workproduct_state`'s four rungs, each `evaluations[]` entry's shape, a `closed_reason` at `closed`, and the readiness
 * ladder (C-9.1), which advances only on recorded evaluations. It leaves the catalogue by REGISTERING with record-core's
 * grammar seam (`registerGrammar`, its R67) once per record, in `intentOf`: record-core's audit and promotion's gate
 * pass the registrations to `checkBundle` as `opts.grammars`, and a grammar claiming the slot's whole id list runs IN
 * THAT SLOT'S PLACE over the same context, so the findings, their ids, severities, messages and order are the
 * catalogue's own. Moved whole from the catalogue's `checkProjectExtension` (`checks/bio-checks.mjs`, legacy-checks),
 * which is deleted with its `LEGACY_GRAMMARS` entry. C-2.9's objective arm is not here: it is R1, this module's
 * promotion check and audit check (`./index.mjs`). Whether these arms retire (N317) is Bob's and untouched. Its shared
 * grammar (`ISO_TS_RE`) is record-grammar's. Pure: no store, no network, no clock. */
import { ISO_TS_RE } from "../record-grammar/index.mjs";

/* The catalogue's finding shape (`f`), so a finding from this arm is the one the catalogue's arm made. */
const f = (check, severity, message, repairs) => {
  const out = { check, severity, message };
  if (repairs) { out.repairable = true; out.repairs = repairs; }
  return out;
};

/** C-2.9: a project's work-product rungs, in the ladder's order (the UI draws them in it). */
export const WORKPRODUCT_STATES = Object.freeze(['draft', 'internally_checked', 'externally_compliant', 'distributed']);
/** C-2.9: the reasons a project closes for. */
export const CLOSED_REASONS = Object.freeze(['resolved', 'superseded', 'abandoned']);

/** R29: C-2.9's other arms and C-9.1, `arm(ctx, findings)` over `checkBundle`'s context; a document of any other type
 *  gets nothing. */
export function checkProjectExtension(ctx, findings) {
  if (ctx.fm?.object_type !== 'project') return;
  const fm = ctx.fm;
  const WS = WORKPRODUCT_STATES;
  if (fm.workproduct_state !== undefined && fm.workproduct_state !== null && !WS.includes(fm.workproduct_state)) {
    findings.push(f('C-2.9', 'error', `workproduct_state '${fm.workproduct_state}' is not one of: ${WS.join(', ')}`));
  }
  const evals = Array.isArray(fm.evaluations) ? fm.evaluations : [];
  for (let i = 0; i < evals.length; i++) {
    const e = evals[i];
    if (!e || !['compliance', 'argument'].includes(e.kind) || !['internal', 'external'].includes(e.strictness)
        || !['pass', 'findings'].includes(e.result) || !ISO_TS_RE.test(e.timestamp || '')) {
      findings.push(f('C-2.9', 'error', `evaluations[${i}] lacks the required kind/strictness/result/timestamp shape`));
    } else if (e.result === 'findings' && !e.findings_ref) {
      findings.push(f('C-2.9', 'error', `evaluations[${i}] result is findings but findings_ref is empty`));
    }
  }
  if (fm.current_state === 'closed' && !CLOSED_REASONS.includes(fm.closed_reason)) {
    findings.push(f('C-2.9', 'error', `closed state requires closed_reason in: ${CLOSED_REASONS.join(', ')}`));
  }
  // C-9: the readiness ladder advances only on recorded evaluations
  const ws = fm.workproduct_state;
  const passed = (kind, stricts) => evals.some(e => e && e.kind === kind && e.result === 'pass' && stricts.includes(e.strictness));
  if (['internally_checked', 'externally_compliant', 'distributed'].includes(ws)) {
    for (const kind of ['compliance', 'argument']) {
      if (!passed(kind, ['internal', 'external'])) {
        findings.push(f('C-9.1', 'error', `workproduct_state '${ws}' requires a passing ${kind} evaluation (internal strictness or better)`,
          ['run the missing evaluation', 'demote workproduct_state to the highest earned rung']));
      }
    }
  }
  if (['externally_compliant', 'distributed'].includes(ws)) {
    for (const kind of ['compliance', 'argument']) {
      if (!passed(kind, ['external'])) {
        findings.push(f('C-9.1', 'error', `workproduct_state '${ws}' requires a passing external-strictness ${kind} evaluation`,
          ['run the missing evaluation', 'demote workproduct_state to the highest earned rung']));
      }
    }
  }
}

/** R29: this module's grammar as record-core's grammar seam takes it (`registerGrammar`, its R67) and as
 *  record-grammar's `checkBundle` takes it from a caller passing grammars itself (its R39): it claims the
 *  `checkProjectExtension` slot (record-grammar R28) whole. */
export const PROJECT_GRAMMAR = Object.freeze({ module: "intent", ids: Object.freeze(["C-2.9", "C-9.1"]),
                                               arm: checkProjectExtension });

const registered = new WeakSet();

/** R29: registers `PROJECT_GRAMMAR` with `record` through record-core's grammar seam, as `intent`, once per record, at
 *  start (`intentOf`). A record with no seam (a test's stand-in) is left alone; a refusal is a defect of the wiring
 *  (another module holding one of these ids outside the slot, or a malformed entry) and throws, as capture's,
 *  promotion's and inquiry-grammar's do, rather than leave the grammar silently unrun. Answers record-core's answer, or
 *  `null` when nothing was registered. */
export function registerProjectGrammar(record) {
  if (!record || typeof record.registerGrammar !== "function" || registered.has(record)) return null;
  const answer = record.registerGrammar("intent", { ids: [...PROJECT_GRAMMAR.ids], arm: PROJECT_GRAMMAR.arm });
  if (answer && answer.ok === false)
    throw new Error(`intent: record-core refused the project grammar: ${answer.reason}`
                    + `${answer.heldBy ? ` (held by ${answer.heldBy})` : ""}`);
  registered.add(record);
  return answer;
}
