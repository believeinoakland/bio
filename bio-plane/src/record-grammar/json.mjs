// @ts-check
/* record-grammar: canonical JSON (R12). Moved from the check catalogue at T18. */

/* What `JSON.stringify` leaves out of an object and writes as `null` in an array. */
const unstorable = (x) => x === undefined || typeof x === 'function' || typeof x === 'symbol';

/** Canonicalize a parsed JSON value: recursively sorted keys, compact output. A member JSON cannot hold (`undefined`,
 *  a function, a symbol) is omitted from an object and is `null` in an array, as `JSON.stringify` has it, so the
 *  answer is always JSON (R12). No stored digest was taken over the old `"k":undefined` spelling (T18's job record). */
export function canonicalJson(v) {
  if (Array.isArray(v)) return '[' + v.map((x) => (unstorable(x) ? 'null' : canonicalJson(x))).join(',') + ']';
  if (v !== null && typeof v === 'object') {
    return '{' + Object.keys(v).filter((k) => !unstorable(v[k])).sort()
      .map(k => JSON.stringify(k) + ':' + canonicalJson(v[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}
