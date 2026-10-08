/* file-scanner's fixed sets and limits (R15, R16), exported by name and stated in /version's `bounds` (R8).
 *
 * `MEMBER_LIMITS_STATEMENT` is the configuration's own `limits` (`wrangler.jsonc`), stated in the bundle so the signed
 * release carries what the installer uploads as the Worker's limits (installer R39, as sheet-worker R17). It names only
 * the Worker's Cloudflare limits: the installer sends every key it names as one, so the named bounds below stay out of
 * it (question J1 to BOB, this reading). */

/** R15: the stores a request may name, as sheet-worker R11; and no plane op of its own. */
export const NAMESPACES = Object.freeze(['bio', 'scratch']);
export const PLANE_OPS = Object.freeze([]);

/** R16: the named bounds. */
export const SCAN_MAX_BYTES = 268_435_456;
export const SCAN_BATCH_MAX = 200;
export const SIGNATURES_MAX_AGE_MS = 259_200_000;
export const SAFE_VIEW_DPI = 150;
export const SAFE_VIEW_PAGES_MAX = 500;
export const PROVIDER_TIMEOUT_MS = 120_000;
export const SANDBOX_TIMEOUT_MS = 3_600_000;
export const REPUTATION_LIST_MAX_AGE_MS = 86_400_000;

/** R16: `file-safety` R35's kinds, the only keys a forwarded counts record may hold (R27). */
export const LOG_COUNT_KINDS = Object.freeze([
  'files_scanned', 'files_found', 'holds_placed', 'holds_released', 'deeper_checks', 'sandbox_submissions',
  'safe_views', 'safe_copies', 'reputation_listed', 'signin', 'credential', 'rate', 'handover', 'through',
]);

/** R16: the time budgets, measured at the job (record T36/file-scanner): a ClamAV run over one request's targets, and
 *  one safe-view render, each in the container; past them the run is stopped (R3 `unknown`, R7 `TIME_LIMIT`). */
export const SCAN_TIME_MS = 900_000;
export const RENDER_TIME_MS = 600_000;

/** The configuration's `limits`, parsed; and its statement (installer R39). A test pins both to `wrangler.jsonc`. */
export const MEMBER_LIMITS = Object.freeze({ cpu_ms: 300000 });
export const MEMBER_LIMITS_STATEMENT = "bio-member-limits/1 cpu_ms=300000";

export const BOUNDS = Object.freeze({
  SCAN_MAX_BYTES, SCAN_BATCH_MAX, SIGNATURES_MAX_AGE_MS, SAFE_VIEW_DPI, SAFE_VIEW_PAGES_MAX, PROVIDER_TIMEOUT_MS,
  SANDBOX_TIMEOUT_MS, REPUTATION_LIST_MAX_AGE_MS, SCAN_TIME_MS, RENDER_TIME_MS, LOG_COUNT_KINDS,
});
