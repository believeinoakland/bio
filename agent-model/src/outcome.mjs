/* The shapes both providers answer in (R3, R5, R8), held once so the two paths cannot drift apart.
 *
 * An OUTCOME is exactly one of `{result}`, `{silent: {detail}}`, `{refused: {status, type, message}}`; one that
 * reached the provider also carries `usage`. A USAGE is the five figures R5 names, each the provider's own number
 * or `null` where it stated none: a missing figure is never read as 0, because 0 is a claim and `null` is not. */

export const USAGE_FIGURES = Object.freeze([
  "input_tokens", "output_tokens", "cache_read_input_tokens", "cache_creation_input_tokens", "total_cost_usd",
]);
export const DETAIL_MAX = 200;
export const MESSAGE_MAX = 300;

/** R5 — the provider's usage as stated: a finite number stays, anything else is `null`. */
export function usageOf(stated) {
  const u = stated && typeof stated === "object" ? stated : {};
  return Object.fromEntries(USAGE_FIGURES.map((k) => [k, typeof u[k] === "number" && Number.isFinite(u[k]) ? u[k] : null]));
}

/** R6 — the sum over turns; a figure any turn left `null` stays `null` in the sum. */
export function sumUsage(a, b) {
  if (!a) return b ? usageOf(b) : null;
  if (!b) return usageOf(a);
  return Object.fromEntries(USAGE_FIGURES.map((k) => [k, a[k] == null || b[k] == null ? null : a[k] + b[k]]));
}

/** R8 — a provider's or runtime's words never carry the secret back out, even if they echo it. */
export function scrub(text, secret, max) {
  let s = String(text ?? "");
  if (typeof secret === "string" && secret) s = s.split(secret).join("[secret]");
  return s.slice(0, max);
}

export const silent = (detail, secret) => ({ silent: { detail: scrub(detail, secret, DETAIL_MAX) } });
export const refused = (status, type, message, secret) =>
  ({ refused: { status, type: type == null ? null : scrub(type, secret, MESSAGE_MAX), message: scrub(message, secret, MESSAGE_MAX) } });
