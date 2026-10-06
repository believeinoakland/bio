// @ts-check
/* connection-grammar: what a path means, as pure reads over a list of connections from start to end (R12–R14).
   The weakest hop governs; nothing averages, scores or ranks how connected anything is (K1442, K1471; R17). No walker
   lives here: `explore` walks and builds on these (R16). */
import { compare } from '../civil-time/index.mjs';
import { BASIS_GRADES } from '../record-grammar/index.mjs';
import { DECLARED_LABEL, HUNCH_LABEL, LOWEST_GRADE } from './shape.mjs';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const rank = (g) => BASIS_GRADES.indexOf(g);
const weaker = (a, b) => (rank(a) >= rank(b) ? a : b);
const hopsOf = (p) => (Array.isArray(p) ? p : isObj(p) && Array.isArray(p.hops) ? p.hops : null);
const pathOk = (hops) => Array.isArray(hops) && hops.length > 0 && hops.every(isObj);

/**
 * The grade of a chain: the weakest assertion grade and the weakest end grade over its hops (R12).
 * @param {unknown} path
 */
export function chainGrade(path) {
  if (!pathOk(path)) return { refused: 'PATH_EMPTY', why: 'a path is a non-empty list of connections' };
  let assertion = BASIS_GRADES[0], end = BASIS_GRADES[0];
  for (const hop of /** @type {any[]} */ (path)) {
    if (hop.label === HUNCH_LABEL) {
      return { assertion: null, end: null, why: `hop ${hop.id} is a hunch, which carries no grade, so the chain has none` };
    }
    if (hop.label === DECLARED_LABEL) { assertion = end = LOWEST_GRADE; continue; }
    const g = hop.grade;
    if (!isObj(g) || rank(g.assertion) < 0 || !Array.isArray(g.ends) || g.ends.length !== 2 || g.ends.some((x) => rank(x) < 0)) {
      return { refused: 'GRADE_INVALID', why: `hop ${hop.id} carries no grade in the letters ${BASIS_GRADES.join(' ')}` };
    }
    assertion = weaker(assertion, g.assertion);
    end = weaker(end, weaker(g.ends[0], g.ends[1]));
  }
  return { assertion, end };
}

/**
 * `lead` when any hop is declared or a hunch, naming those hops; otherwise `evidenced` (R13). A lead is never a basis
 * for a finding (K1467, K1487).
 * @param {unknown} path
 */
export function chainLabel(path) {
  if (!pathOk(path)) return { refused: 'PATH_EMPTY', why: 'a path is a non-empty list of connections' };
  const hops = /** @type {any[]} */ (path).filter((h) => h.label === DECLARED_LABEL || h.label === HUNCH_LABEL).map((h) => h.id);
  return hops.length ? { label: 'lead', hops, basis_for_finding: false } : { label: 'evidenced' };
}

/** @param {any} hop */
function fromOf(hop) {
  const v = hop?.valid;
  if (!isObj(v)) return null;
  let b = v.from;
  if (isObj(b)) b = b.at === undefined ? null : b.at;
  if (b === null || b === undefined) return null;
  return typeof b === 'string' ? { value: b, precision: v.precision, zone: v.zone } : b;
}

const same = (a, b) => a.value === b.value && a.precision === b.precision && a.zone === b.zone;

/** The earliest `valid.from` over a path, or null when its hops do not settle one (R14). @param {any[]} hops */
function earliestFrom(hops) {
  const froms = hops.map(fromOf);
  if (froms.some((f) => f === null)) return null;
  return froms.find((f) => froms.every((o) => o === f || same(f, o) || compare(f, o) === 'before')) ?? null;
}

const idKey = (hops) => hops.map((h) => String(h.id)).join('\u0000');
const cmpStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Orders paths by hop count, then the earliest `valid.from` (undetermined last), then the hops' ids; with `by`, by
 * that stated quantity first, descending. No other order or score is offered (R14, K1471).
 * @param {unknown} paths
 * @param {{by?: string}} [opts]
 */
export function orderPaths(paths, opts = {}) {
  if (!Array.isArray(paths) || paths.some((p) => !pathOk(hopsOf(p)))) {
    return { refused: 'PATHS_INVALID', why: 'paths is a list, each a non-empty list of connections or {hops, quantities}' };
  }
  const by = opts?.by;
  if (by !== undefined && (typeof by !== 'string' || by === '')) return { refused: 'BY_INVALID', why: 'by names a quantity carried on the paths' };
  const rows = paths.map((p) => {
    const hops = /** @type {any[]} */ (hopsOf(p));
    const q = by !== undefined && !Array.isArray(p) && isObj(p.quantities) ? p.quantities[by] : undefined;
    return { p, hops, ids: idKey(hops), q: typeof q === 'number' && Number.isFinite(q) ? q : null, start: earliestFrom(hops) };
  });
  rows.sort((a, b) => cmpStr(a.ids, b.ids));
  rows.sort((a, b) => {
    if (by !== undefined) {
      if (a.q !== null && b.q !== null && a.q !== b.q) return b.q - a.q;
      if ((a.q === null) !== (b.q === null)) return a.q === null ? 1 : -1;
    }
    if (a.hops.length !== b.hops.length) return a.hops.length - b.hops.length;
    if ((a.start === null) !== (b.start === null)) return a.start === null ? 1 : -1;
    if (a.start && b.start && !same(a.start, b.start)) {
      const c = compare(a.start, b.start);
      if (c === 'before') return -1;
      if (c === 'after') return 1;
    }
    return cmpStr(a.ids, b.ids);
  });
  return rows.map((r) => r.p);
}
