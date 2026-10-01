/* intent — the project grammar: C-2.9's `closed_reason` arm (R29; K653 BOB-4; rule 2, T19 layer 7; K899 (3), N317).
 * The type arm record-grammar's `checkBundle` runs over a `project` bundle in its `checkProjectExtension` slot
 * (record-grammar R28): a `closed_reason` at `closed`. It leaves the catalogue by REGISTERING with record-core's grammar
 * seam (`registerGrammar`, its R67) once per record, in `intentOf`: record-core's audit and promotion's gate pass the
 * registrations to `checkBundle` as `opts.grammars`, and a grammar claiming the slot's whole id list runs IN THAT SLOT'S
 * PLACE over the same context. Bob retired the project fields `workproduct_state` and `evaluations`, and C-2.9's arms
 * and the C-9.1 readiness ladder over them (K899 (3)): a project's stage and its work products' readiness are computed
 * (`project-stage` R2–R4), so this arm reads neither, and a document carrying them is neither refused nor corrected
 * for them. The slot holds `C-2.9` alone (record-grammar R28; `C-9.1` left it with the project stage's computation,
 * K904, K930), and this grammar claims it so (K935). C-2.9's objective arm is not here: it is R1, this module's
 * promotion check and audit check (`./index.mjs`). Pure: no store, no network, no clock. */

/* The catalogue's finding shape, so a finding from this arm is the one the catalogue's arm made. */
const f = (check, severity, message) => ({ check, severity, message });

/** C-2.9: the reasons a project closes for. */
export const CLOSED_REASONS = Object.freeze(['resolved', 'superseded', 'abandoned']);

/** R29: C-2.9's `closed_reason` arm, `arm(ctx, findings)` over `checkBundle`'s context; a document of any other type
 *  gets nothing. */
export function checkProjectExtension(ctx, findings) {
  if (ctx.fm?.object_type !== 'project') return;
  if (ctx.fm.current_state === 'closed' && !CLOSED_REASONS.includes(ctx.fm.closed_reason)) {
    findings.push(f('C-2.9', 'error', `closed state requires closed_reason in: ${CLOSED_REASONS.join(', ')}`));
  }
}

/** R29: this module's grammar as record-core's grammar seam takes it (`registerGrammar`, its R67) and as
 *  record-grammar's `checkBundle` takes it from a caller passing grammars itself (its R39): it claims the
 *  `checkProjectExtension` slot (record-grammar R28) whole. */
export const PROJECT_GRAMMAR = Object.freeze({ module: "intent", ids: Object.freeze(["C-2.9"]),
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
