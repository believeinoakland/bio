// @ts-check
/* explore: the small shared parts of every answer: refusals, the argument checks every read starts with (R1), and the
   words a path carries (R6, R16). Every outward sentence of the module is here or in the file that answers it, and
   none says "knows", "network", "conflict", "suspicious" or "most connected" (R16), or names a place (R18). */
import { bounds } from '../civil-time/index.mjs';
import { isRecordId, depthOf, DECLARED_LABEL, HUNCH_LABEL } from '../connection-grammar/index.mjs';

export const refuse = (refused, why) => ({ refused, why });
export const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
export const filled = (v) => typeof v === 'string' && v.trim() !== '';
export const isRefusal = (a) => isObj(a) && filled(a.refused);

/** The sentence every lead carries (R6, K1467, K1487). */
export const LEAD_SENTENCE = 'This path is a lead: no finding rests on it until each declared or hunch step is replaced by evidence.';
/** What a declared hop and a hunch hop are marked (R6). */
export const DECLARED_MARK = DECLARED_LABEL;
export const HUNCH_MARK = HUNCH_LABEL;
/** What every answer says it is not (R16, K1486). */
export const NOT_ASSERTED = 'Each step is a cited connection the record holds; the answer asserts nothing beyond them.';

/** A viewer is the control plane's stamp; absent, every read fails closed (Terms). @param {unknown} viewer */
export function viewerRefusal(viewer) {
  if (viewer === undefined || viewer === null || viewer === '') {
    return refuse('VIEWER_MISSING', 'a read names the member reading; an absent viewer is neither an administrator nor the public');
  }
  return null;
}

/** NO_NODE, BAD_NODE for one end (R1). @param {unknown} node @param {string} name @param {boolean} required */
export function nodeRefusal(node, name, required) {
  if (node === undefined || node === null || node === '') {
    return required ? refuse('NO_NODE', `no ${name} is named: a walk starts from a record id`) : null;
  }
  if (!isRecordId(node)) return refuse('BAD_NODE', `${name} ${String(node).slice(0, 60)} is not a record id the id grammar knows`);
  return null;
}

/**
 * NO_DATE, BAD_DATE (R1): an exploration is always as of a stated date, never of "now". A date is civil-time's
 * date-time `{value, precision, zone}` or an instant string.
 * @param {unknown} at @param {string} [name]
 */
export function dateRefusal(at, name = 'at') {
  if (at === undefined || at === null || at === '') return refuse('NO_DATE', `no ${name} is stated: an exploration is always as of a stated date, never of "now"`);
  let b;
  try { b = bounds(/** @type {any} */ (at)); } catch (e) {
    return refuse('BAD_DATE', `${name} is not a date-time {value, precision, zone} or an instant: ${String(/** @type {any} */ (e)?.message ?? e)}`);
  }
  if (b && (b.refused || b.undetermined)) return refuse('BAD_DATE', `${name}: ${b.why}`);
  return null;
}

/** DEPTH_OVER_MAX and DEPTH_INVALID, through connection-grammar (R1). @param {unknown} depth */
export function depthOrRefusal(depth) {
  const d = depthOf(depth);
  return typeof d === 'number' ? { depth: d } : { refusal: refuse(d.refused, d.why) };
}

/** A short text of a date-time for sentences. @param {any} at */
export const dateText = (at) => (typeof at === 'string' ? at : isObj(at) ? `${at.value} (${at.precision}, ${at.zone})` : String(at));
