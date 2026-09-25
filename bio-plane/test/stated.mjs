/* stated.mjs — D-620's ONE comparator for the battery's `t` helpers.
 *
 * WHY THIS EXISTS. The suites compare `got` with `want` by `JSON.stringify` equality, and
 * `JSON.stringify` writes an ABSENT value as `null` wherever it cannot omit it: an `undefined`
 * element of an array (a dropped key read into `[a.x, b.y]`, a hole) and a non-finite number
 * (`NaN`, `±Infinity`) anywhere. So an arm whose `want` STATES a null passed when the answer DROPPED
 * the key or computed a NaN — the record claiming undetermined where it said nothing. D-568's worker
 * measured it in reviewcopy.control arm v, green until hardened with a per-key `stated` reader.
 *
 * WHAT IT CHANGES, and what it deliberately does not:
 *   - `undefined` in an array, or as the whole value, serialises as ABSENT — never as `null`.
 *   - `NaN`, `Infinity` and `-Infinity` serialise as themselves — never as `null`.
 *   - An object property holding `undefined` is still OMITTED, as `JSON.stringify` omits it: a key
 *     whose value is undefined and a key that is not there are the same absence, and a wire answer
 *     (parsed JSON) can hold neither. Only a stated `null` is `null`.
 *   Everything else serialises exactly as `JSON.stringify` does, so an assertion that was honest
 *   before reads the same after; one that turns red was passing on an absent value read as `null`.
 *
 * Its suite is test/stated-null.test.mjs, which pins each sentinel and sweeps the battery for a
 * null-asserting suite still comparing raw.
 */
export const ABSENT = "\u0000ABSENT";

const replacer = function (key, v) {
  if (v === undefined) return Array.isArray(this) ? ABSENT : undefined;
  if (typeof v === "number" && !Number.isFinite(v)) return `\u0000${v}`;
  return v;
};

/* JSON with every absence stated — the serialiser both sides of a comparison go through. */
export const statedJSON = (v) => (v === undefined ? JSON.stringify(ABSENT) : JSON.stringify(v, replacer));
