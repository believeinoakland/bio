/* sheet-worker's own limits (R17), in a module of their own: the plane imports `contract.mjs` (workbooks reads the
 * engine's name and version), so these live apart and the plane's bundle never changes with them.
 *
 * The `limits` of the member's configuration (`wrangler.jsonc`), stated in its code so the bundle a release signs
 * carries them and the installer sends exactly those, holding no value of its own (installer R20's model; N621,
 * K1686). The CPU limit is the paid plan's 5-minute ceiling the bounds in `contract.mjs` are measured against
 * (K1536). A test pins both forms equal to the configuration, and the committed bundle holding the statement once.
 */

/** The configuration's `limits`, parsed. */
export const MEMBER_LIMITS = Object.freeze({ cpu_ms: 300000 });

/** The statement a release's verified bundle is read for: the tag, then `key=<positive integer>` for each key of the
 *  limits, keys sorted, single spaces, no quotes or backslashes, so a reader of the bundle's text finds it whole.
 *  `index.mjs` carries it on the worker's handler, so bundling keeps it as written. */
export const MEMBER_LIMITS_STATEMENT = "bio-member-limits/1 cpu_ms=300000";
