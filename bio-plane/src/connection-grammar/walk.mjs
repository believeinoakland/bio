// @ts-check
/* connection-grammar: what a path means, as pure reads over a list of connections from start to end (R12–R15, R22–R24).
   The weakest hop governs; nothing averages, scores or ranks how connected anything is (K1442, K1471; R17). No walker
   lives here: `explore` walks and builds on these (R16). */
import { compare } from '../civil-time/index.mjs';
import { BASIS_GRADES } from '../record-grammar/index.mjs';
import { DECLARED_LABEL, HUNCH_LABEL, LOWEST_GRADE } from './shape.mjs';
import { word, localize } from '../setup-words/index.mjs';

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
  if (!pathOk(path)) return { refused: 'PATH_EMPTY', why: word('connection-grammar.why.path_non_empty') };
  let assertion = BASIS_GRADES[0], end = BASIS_GRADES[0];
  for (const hop of /** @type {any[]} */ (path)) {
    if (hop.label === HUNCH_LABEL) {
      return { assertion: null, end: null, why: word('connection-grammar.why.hop_hunch_carries', { id: String(hop.id) }) };
    }
    if (hop.label === DECLARED_LABEL) { assertion = end = LOWEST_GRADE; continue; }
    const g = hop.grade;
    if (!isObj(g) || rank(g.assertion) < 0 || !Array.isArray(g.ends) || g.ends.length !== 2 || g.ends.some((x) => rank(x) < 0)) {
      return { refused: 'GRADE_INVALID', why: word('connection-grammar.why.hop_carries_grade', { id: String(hop.id), basis_grades: String(BASIS_GRADES.join(' ')) }) };
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
  if (!pathOk(path)) return { refused: 'PATH_EMPTY', why: word('connection-grammar.why.path_non_empty') };
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
 * The strength of a chain, the one meaning of "strongest weakest hop" (R22; N1260, DEC-409): `chainGrade`'s weakest
 * `assertion` and `end`, `lead` (R13) and `hunch` (a hunch hop, and then both letters are null). A path of grouped
 * connections (R24) is read as of its strongest members. A path R12 refuses is answered with that refusal.
 * @param {unknown} path
 */
export function chainStrength(path) {
  const hops = hopsOf(path);
  const g = /** @type {any} */ (chainGrade(hops));
  if (g.refused) return g;
  const hunch = g.assertion === null;
  const lead = hops.some((/** @type {any} */ h) => h.label === DECLARED_LABEL || h.label === HUNCH_LABEL);
  return { assertion: g.assertion, end: g.end, lead, hunch };
}

/** @param {any} a @param {any} b one letter each; null (a hunch) after every letter. */
const letterCmp = (a, b) => (a === b ? 0 : a === null ? 1 : b === null ? -1 : Math.sign(rank(a) - rank(b)));

/** The comparison of two strengths already answered (R22): -1 when `a` is stronger. */
function strengthCmp(/** @type {any} */ a, /** @type {any} */ b) {
  if (a.hunch !== b.hunch) return a.hunch ? 1 : -1;
  if (a.lead !== b.lead) return a.lead ? 1 : -1;
  return letterCmp(a.assertion, b.assertion) || letterCmp(a.end, b.end);
}

/**
 * -1 when path `a` is stronger, 1 when `b` is, 0 when equal: no hunch hop, then no declared hop, then the better
 * assertion letter, then the better end letter (R22; N1260, DEC-409). A path R12 refuses is answered with that refusal.
 * @param {unknown} a
 * @param {unknown} b
 */
export function strongerChain(a, b) {
  const x = /** @type {any} */ (chainStrength(a)), y = /** @type {any} */ (chainStrength(b));
  if (x.refused) return x;
  if (y.refused) return y;
  return strengthCmp(x, y);
}

/**
 * Orders paths by `by` first when given, then hop count (a grouped connection is one hop), then strength (R22), then the
 * earliest `valid.from` (undetermined last), then the hops' ids. No other order or score is offered (R14, R23, K1471).
 * @param {unknown} paths
 * @param {{by?: string}} [opts]
 */
export function orderPaths(paths, opts = {}) {
  if (!Array.isArray(paths) || paths.some((p) => !pathOk(hopsOf(p)))) {
    return { refused: 'PATHS_INVALID', why: localize('connection-grammar.why.paths_list', 'paths is a list, each a non-empty list of connections, or an object holding hops and quantities') };
  }
  const by = opts?.by;
  if (by !== undefined && (typeof by !== 'string' || by === '')) return { refused: 'BY_INVALID', why: word('connection-grammar.why.names_quantity_carried') };
  const rows = paths.map((p) => {
    const hops = /** @type {any[]} */ (hopsOf(p));
    const q = by !== undefined && !Array.isArray(p) && isObj(p.quantities) ? p.quantities[by] : undefined;
    const s = /** @type {any} */ (chainStrength(hops));
    return { p, hops, ids: idKey(hops), q: typeof q === 'number' && Number.isFinite(q) ? q : null, start: earliestFrom(hops), s: s.refused ? null : s };
  });
  rows.sort((a, b) => cmpStr(a.ids, b.ids));
  rows.sort((a, b) => {
    if (by !== undefined) {
      if (a.q !== null && b.q !== null && a.q !== b.q) return b.q - a.q;
      if ((a.q === null) !== (b.q === null)) return a.q === null ? 1 : -1;
    }
    if (a.hops.length !== b.hops.length) return a.hops.length - b.hops.length;
    if ((a.s === null) !== (b.s === null)) return a.s === null ? 1 : -1;
    if (a.s && b.s) { const c = strengthCmp(a.s, b.s); if (c) return c; }
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

/** @param {any} hop @param {'from'|'to'} end the stated bound of a hop's validity, or null when it states none. */
function boundOf(hop, end) {
  const v = hop?.valid;
  if (!isObj(v)) return null;
  let b = v[end];
  if (isObj(b)) b = b.at === undefined ? null : b.at;
  if (b === null || b === undefined) return null;
  return typeof b === 'string' ? { value: b, precision: v.precision, zone: v.zone } : b;
}

const HOPS_MAX = 50000;
const isHop = (h) => isObj(h) && ['id', 'kind', 'from', 'to'].every((k) => typeof h[k] === 'string' && h[k] !== '');

/** The member whose stated bound is first (`first`) or last in time, or null when none states one. */
function extremeBound(members, end, first) {
  let best = null;
  for (const m of members) {
    const b = boundOf(m, end);
    if (b === null) continue;
    if (best === null) { best = { m, b }; continue; }
    const c = same(b, best.b) ? null : compare(b, best.b);
    if (c === (first ? 'before' : 'after')) best = { m, b };
  }
  return best;
}

/**
 * Many parallel hops as one step: hops of one `kind`, `from` and `to` are one grouped connection carrying `count` and
 * every member as received, graded as its strongest member (R24; N1260, DEC-409, DEC-410). The weakest-hop rule (R12)
 * applies between groups, never within one. Groups come in the order their first member appears.
 * @param {unknown} hops
 */
export function foldParallel(hops) {
  if (!Array.isArray(hops) || hops.length > HOPS_MAX || !hops.every(isHop)) {
    return { refused: 'HOPS_INVALID', why: localize('connection-grammar.why.hops_list', 'hops is a list of at most {max} connections', { max: HOPS_MAX }) };
  }
  const groups = new Map();
  for (const h of hops) {
    const key = JSON.stringify([h.kind, h.from, h.to]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(h);
  }
  return [...groups.values()].map((raw) => {
    const members = raw.map((m) => ({ m, f: boundOf(m, 'from') })).sort((a, b) => {
      if ((a.f === null) !== (b.f === null)) return a.f === null ? 1 : -1;
      if (a.f && b.f && !same(a.f, b.f)) {
        const c = compare(a.f, b.f);
        if (c === 'before') return -1;
        if (c === 'after') return 1;
      }
      return cmpStr(String(a.m.id), String(b.m.id));
    }).map((x) => x.m);
    const first = members[0];
    const from = extremeBound(members, 'from', true), to = extremeBound(members, 'to', false);
    const graded = members.filter((m) => isObj(m.grade) && rank(m.grade.assertion) >= 0 && Array.isArray(m.grade.ends) && m.grade.ends.length === 2 && m.grade.ends.every((x) => rank(x) >= 0));
    const best = (/** @type {string[]} */ xs) => xs.reduce((a, b) => (rank(a) <= rank(b) ? a : b));
    const grade = graded.length
      ? { assertion: best(graded.map((m) => m.grade.assertion)), ends: [best(graded.map((m) => m.grade.ends[0])), best(graded.map((m) => m.grade.ends[1]))] }
      : null;
    const src = from?.m ?? first;
    const g = {
      id: members.map((m) => String(m.id)).reduce((a, b) => (a <= b ? a : b)),
      from: first.from, to: first.to, kind: first.kind, owner: first.owner,
      ...(typeof first.word === 'string' ? { word: first.word } : {}),
      count: members.length, members,
      valid: { from: from ? from.m.valid.from : null, to: to ? to.m.valid.to : null, precision: src?.valid?.precision, zone: src?.valid?.zone },
      grade,
      ...(first.label !== undefined ? { label: first.label } : {}),
      ...(members.every((m) => m.undetermined) ? { undetermined: first.undetermined } : {}),
    };
    return g;
  });
}
