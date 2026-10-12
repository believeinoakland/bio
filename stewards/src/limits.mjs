/* stewards: the protective limits (R4, R8; K1881). A limit is counted in fixed sub-windows holding only the
   fingerprint, the sub-window and the count; a span ("any hour") sums every sub-window that touches it, so the count in
   any span never passes the limit, at the cost of refusing up to one sub-window early. */
export const MINUTE = 60e3, HOUR = 60 * MINUTE, DAY = 24 * HOUR;

export const LIMITS = Object.freeze({
  sourceHour: Object.freeze({ scope: "source_hour", max: 5, span: HOUR, bucket: 10 * MINUTE }),
  sourceDay: Object.freeze({ scope: "source_day", max: 20, span: DAY, bucket: HOUR }),
  serviceDay: Object.freeze({ scope: "service_day", max: 200, span: DAY, bucket: HOUR }),
  signin: Object.freeze({ scope: "signin", max: 5, span: 15 * MINUTE, bucket: MINUTE }),
});
export const UNDECIDED_MAX = 1000;
export const SESSION_MS = 12 * HOUR;
export const PAGE_SIZE = 100;
export const SERVICE_SOURCE = "*";

/* The sub-windows whose counts fall in the span ending at `now`. */
export const firstBucket = (limit, now) => Math.floor((now - limit.span) / limit.bucket);
export const bucketOf = (limit, now) => Math.floor(now / limit.bucket);

/* `rows`: [{bucket, n}] for the span. Answers null while under the limit, else the whole seconds until enough of the
   counts leave the span for one more to fit. */
export function retryAfter(limit, rows, now) {
  const sorted = [...rows].sort((a, b) => a.bucket - b.bucket);
  let total = sorted.reduce((s, r) => s + r.n, 0);
  if (total < limit.max) return null;
  for (const r of sorted) {
    total -= r.n;
    if (total < limit.max) {
      const leaves = (r.bucket + 1) * limit.bucket + limit.span;
      return Math.max(1, Math.ceil((leaves - now) / 1000));
    }
  }
  return Math.ceil(limit.span / 1000);
}

/* The oldest sub-window any limit still reads; older counts are dropped. */
export const oldestKept = (now) => Object.fromEntries(Object.values(LIMITS).map((l) => [l.scope, firstBucket(l, now)]));
