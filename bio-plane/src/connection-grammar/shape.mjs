// @ts-check
/* connection-grammar: the one shape every relationship the record holds is presented in (R1), and the derived id a
   leg cites and a checker re-derives (R11). Pure: nothing here reads a store, the network or a clock (R16). */
import { BASIS_GRADES, idPattern, canonicalJson, sha256HexSync } from '../record-grammar/index.mjs';

/** The four classes of kind, closed (R2). None is a measure of how connected a node is (R17). */
export const CLASSES = Object.freeze(['evidentiary', 'derived', 'declared', 'hunch']);
/** The label a declared connection carries (R1). */
export const DECLARED_LABEL = 'declared, not evidenced';
/** The label a hunch connection carries (R1). */
export const HUNCH_LABEL = 'hunch';
/** The lowest grade, which a declared assertion carries and a declared hop gives a chain (R1, R12). */
export const LOWEST_GRADE = BASIS_GRADES[BASIS_GRADES.length - 1];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PRECISIONS = ['day', 'minute', 'second', 'edtf'];
const FORMS = {
  day: /^\d{4}-\d{2}-\d{2}$/,
  minute: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
  second: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
  edtf: /^\S+$/,
};
const FIELDS = ['id', 'from', 'to', 'kind', 'owner', 'valid', 'evidence', 'grade', 'derived'];

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const filled = (v) => typeof v === 'string' && v.trim() !== '';

/**
 * Whether `v` is a record id of record-grammar's id grammar: an `ID_TABLE` id core (record-grammar R47), alone or
 * followed by a bundle slug.
 * @param {unknown} v
 */
export function isRecordId(v) {
  if (typeof v !== 'string') return false;
  let re;
  try { re = idPattern(v.split('-')[0]); } catch { return false; }
  if (!re) return false;
  if (re.test(v)) return true;
  for (let i = v.indexOf('-'); i !== -1; i = v.indexOf('-', i + 1)) {
    if (re.test(v.slice(0, i)) && SLUG.test(v.slice(i + 1))) return true;
  }
  return false;
}

/** @param {unknown} b @param {string} precision */
function boundError(b, precision) {
  if (b === null) return null;
  if (typeof b === 'string') return FORMS[precision]?.test(b) ? null : `is not a value of ${precision} precision`;
  if (isObj(b)) {
    if ('value' in b) return 'gives both a value and an event';
    if (!filled(b.event) || !filled(b.edge)) return 'names an event bound without its event and edge';
    return null;
  }
  return 'is neither null, a value nor an event bound';
}

/** @param {unknown} valid */
function validErrors(valid) {
  if (!isObj(valid)) return ['valid is not a validity {from, to, precision, zone}'];
  const out = [];
  if (!PRECISIONS.includes(valid.precision)) out.push(`valid.precision is not one of ${PRECISIONS.join(', ')}`);
  if (!filled(valid.zone)) out.push('valid.zone is not a zone name');
  for (const end of ['from', 'to']) {
    if (!(end in valid)) { out.push(`valid.${end} is absent (null means "not stated")`); continue; }
    if (!PRECISIONS.includes(valid.precision)) continue;
    const e = boundError(valid[end], valid.precision);
    if (e) out.push(`valid.${end} ${e}`);
  }
  return out;
}

/**
 * The id of a derived connection: the SHA-256 of the canonical JSON of its five fields (R11, K1447).
 * Throws a TypeError naming the field when one is not a non-empty string.
 * @param {{kind: string, from: string, to: string, as_of: string, method: string}} f
 */
export function derivedId(f) {
  if (!isObj(f)) throw new TypeError('derivedId takes {kind, from, to, as_of, method}');
  for (const k of ['kind', 'from', 'to', 'as_of', 'method']) {
    if (!filled(f[k])) throw new TypeError(`derivedId: ${k} is not a non-empty string`);
  }
  return sha256HexSync(canonicalJson({ kind: f.kind, from: f.from, to: f.to, as_of: f.as_of, method: f.method }));
}

/**
 * The errors of one connection against the shape (R1), each naming its field; `kindOf` is the registry's reader.
 * @param {unknown} c
 * @param {(kind: string) => ({owner: string, word: string, class: string} | null)} kindOf
 * @returns {{field: string, why: string}[]}
 */
export function connectionErrors(c, kindOf) {
  if (!isObj(c)) return [{ field: 'connection', why: 'a connection is an object' }];
  const errors = [];
  const err = (field, why) => errors.push({ field, why });
  for (const f of FIELDS) if (!(f in c)) err(f, `${f} is absent; every field of the shape is present`);
  if ('id' in c && !filled(c.id)) err('id', 'id is not a non-empty string');
  for (const end of ['from', 'to']) if (end in c && !isRecordId(c[end])) err(end, `${end} is not a record id of the id grammar`);
  if ('owner' in c && !filled(c.owner)) err('owner', 'owner is not a non-empty string');
  if ('valid' in c) for (const why of validErrors(c.valid)) err('valid', why);
  const entry = filled(c.kind) ? kindOf(c.kind) : null;
  if ('kind' in c) {
    if (!filled(c.kind)) err('kind', 'kind is not a non-empty string');
    else if (!entry) err('kind', `kind ${c.kind.slice(0, 60)} is registered to no owner`);
    else if (filled(c.owner) && entry.owner !== c.owner) err('kind', `kind ${c.kind} is registered to ${entry.owner}, not ${c.owner}`);
  }
  const cls = entry?.class;
  if ('evidence' in c) {
    if (!Array.isArray(c.evidence)) err('evidence', 'evidence is not a list');
    else {
      if (c.evidence.some((e) => !isObj(e) || !filled(e.source))) err('evidence', 'an evidence entry does not name its cited source');
      if (cls === 'evidentiary' && c.evidence.length === 0) err('evidence', 'an evidentiary connection names at least one cited source');
    }
  }
  if ('grade' in c) {
    if (cls === 'hunch') {
      if (c.grade !== null) err('grade', 'a hunch carries no grade');
    } else if (!isObj(c.grade) || !BASIS_GRADES.includes(c.grade.assertion) || !Array.isArray(c.grade.ends)
      || c.grade.ends.length !== 2 || !c.grade.ends.every((g) => BASIS_GRADES.includes(g))) {
      err('grade', `grade is not {assertion, ends: [from_grade, to_grade]} in the letters ${BASIS_GRADES.join(' ')}`);
    } else if (cls === 'declared' && c.grade.assertion !== LOWEST_GRADE) {
      err('grade', `a declared connection's assertion carries the lowest grade, ${LOWEST_GRADE}`);
    }
  }
  if (cls === 'declared' && c.label !== DECLARED_LABEL) err('label', `a declared connection carries the label "${DECLARED_LABEL}"`);
  if (cls === 'hunch') {
    if (c.label !== HUNCH_LABEL) err('label', `a hunch connection carries the label "${HUNCH_LABEL}"`);
    if (!filled(c.scope)) err('scope', 'a hunch connection names the working inquiry that holds it');
  }
  if (cls && cls !== 'declared' && cls !== 'hunch' && c.label !== undefined && c.label !== null) {
    err('label', `an ${cls} connection carries neither the declared nor the hunch label`);
  }
  if ('derived' in c) {
    if (cls === 'derived') {
      const d = c.derived;
      if (!isObj(d) || !filled(d.method) || !Array.isArray(d.inputs) || !filled(d.as_of)) {
        err('derived', 'a derived connection carries derived: {method, inputs, as_of}');
      } else if (filled(c.kind) && isRecordId(c.from) && isRecordId(c.to)
        && c.id !== derivedId({ kind: c.kind, from: c.from, to: c.to, as_of: d.as_of, method: d.method })) {
        err('id', 'a derived connection\'s id is derivedId of its kind, from, to, as_of and method');
      }
    } else if (c.derived !== null) {
      err('derived', 'only a derived connection carries derived; others carry null');
    }
  }
  return errors;
}
