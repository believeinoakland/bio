/* calc-grammar's recorded random draws (requirements: `build/requirements/calc-grammar.md`, R16, R17; K1448, DEC-22).
 * A draw ranks every key of a frozen frame by SHA-256 of the caller's seed and the key, so anyone with the frame,
 * the seed and any SHA-256 tool can reproduce it; the module reads no clock and no randomness of its own. The
 * interval is the exact hypergeometric one, computed in whole numbers, with no floating point. */

import { canonicalJson, sha256HexSync } from "../record-grammar/index.mjs";
import { dec, refusal } from "./decimal.mjs";

export const DRAW_METHOD = "bio-draw/1: rank each key by sha256(seed + \"\\n\" + key), lowest first (ties by key), take the first n";
export const INTERVAL_METHOD = "bio-interval/1: exact hypergeometric, equal tails, counts in the frame";

/** R16: `{sample, frame_hash, seed, method}`, or a refusal. */
export function draw({ frame, n, seed } = {}) {
  if (!Array.isArray(frame)) throw new TypeError("draw's frame is a list of keys");
  if (typeof seed !== "string") throw new TypeError("draw's seed is a string the caller records");
  if (!Number.isSafeInteger(n)) throw new TypeError("draw's n is a whole number");
  if (!frame.every((k) => typeof k === "string")) return refusal("FRAME_INVALID", "every key of the frame is a string");
  const seen = new Set();
  for (const k of frame) {
    if (seen.has(k)) return refusal("FRAME_INVALID", `the frame repeats the key "${k.slice(0, 64)}"`);
    seen.add(k);
  }
  if (!seed) return refusal("SEED_INVALID", "the seed is empty");
  if (n < 0 || n > frame.length) return refusal("DRAW_TOO_LARGE", `n is ${n}, and the frame holds ${frame.length} keys`);
  const ranked = frame.map((key) => ({ key, h: sha256HexSync(`${seed}\n${key}`) }))
    .sort((a, b) => (a.h < b.h ? -1 : a.h > b.h ? 1 : a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  const sorted = [...frame].sort();
  return { sample: ranked.slice(0, n).map((x) => x.key), frame_hash: sha256HexSync(canonicalJson(sorted)), seed,
    method: DRAW_METHOD };
}

// ---- the exact interval ----

/* C(m, k) as a BigInt; 0 outside 0 ≤ k ≤ m. */
function choose(m, k) {
  if (k < 0 || k > m) return 0n;
  k = Math.min(k, m - k);
  let r = 1n;
  for (let i = 1; i <= k; i++) r = (r * BigInt(m - k + i)) / BigInt(i);
  return r;
}

/* The numerator over C(N, n) of P(X ≥ x) (upper) or P(X ≤ x) (lower), X hypergeometric with M successes. */
function tail(N, n, M, x, upper) {
  let s = 0n;
  const from = upper ? x : Math.max(0, n - (N - M));
  const to = upper ? Math.min(n, M) : x;
  for (let k = from; k <= to; k++) s += choose(M, k) * choose(N - M, n - k);
  return s;
}

/* Confidence as an exact fraction p/q with 0 < p/q < 1, from a decimal string or a number written as one. */
function fraction(c) {
  const d = dec(typeof c === "number" ? String(c) : c);
  if (!d || d.n <= 0n) return null;
  const q = 10n ** BigInt(d.s);
  return d.n < q ? { p: d.n, q } : null;
}

/** R17: `{low, high, method}`: the counts in the frame bounding the proportion at `confidence`, or a refusal. */
export function interval({ frame_size: N, sample_size: n, successes: x, confidence } = {}) {
  for (const [name, v] of [["frame_size", N], ["sample_size", n], ["successes", x]])
    if (!Number.isSafeInteger(v)) return refusal("INTERVAL_INVALID", `${name} must be a whole number`);
  if (!(N >= 1 && n >= 1 && n <= N && x >= 0 && x <= n))
    return refusal("INTERVAL_INVALID", "the counts must satisfy 0 ≤ successes ≤ sample_size ≤ frame_size, with a sample of at least one");
  if (typeof confidence !== "string" && typeof confidence !== "number")
    return refusal("INTERVAL_INVALID", "confidence is a decimal between 0 and 1, such as 0.95");
  const f = fraction(confidence);
  if (!f) return refusal("INTERVAL_INVALID", "confidence is a decimal strictly between 0 and 1");
  // A tail is at least (1 − c)/2 exactly when 2·q·tail ≥ (q − p)·C(N, n).
  const total = choose(N, n);
  const atLeast = (t) => 2n * f.q * t >= (f.q - f.p) * total;
  // P(X ≥ x | M) rises with M, and P(X ≤ x | M) falls with M: search each bound.
  let lo = x; let hi = N - (n - x);
  while (lo < hi) { const m = (lo + hi) >> 1; if (atLeast(tail(N, n, m, x, true))) hi = m; else lo = m + 1; }
  const low = lo;
  lo = x; hi = N - (n - x);
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (atLeast(tail(N, n, m, x, false))) lo = m; else hi = m - 1; }
  return { low, high: lo, method: INTERVAL_METHOD };
}
