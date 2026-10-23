/* The reader of `wrap-entry.mjs`'s counts, for the tests that run the counting door under Miniflare. Pure: it imports nothing of the plane. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** The path of the counting door, as Miniflare takes it: `{scriptPath, script}`. */
export const WRAP = fileURLToPath(new URL("./wrap-entry.mjs", import.meta.url));
export const wrapScript = () => ({ scriptPath: WRAP, script: readFileSync(WRAP, "utf8") });

/** The counts a counted answer carries: `{do, rpc, r2, object}`, each a map of `{n, ms, bytes?}` by key (all empty when the header is absent). */
export function readCalls(res) {
  const raw = res.headers.get("x-wrap-calls");
  const none = { do: {}, rpc: {}, r2: {}, object: {} };
  if (!raw) return none;
  try { return { ...none, ...JSON.parse(raw) }; } catch { return none; }
}

/** The number of calls to the object (by route) a counted answer made, all routes or the ones named. */
export function doCalls(calls, routes = null) {
  return Object.entries(calls.do).filter(([route]) => !routes || routes.includes(route)).reduce((n, [, e]) => n + e.n, 0);
}

/** The number of R2 calls a counted answer made, by the Worker and inside the object, optionally of one method (`get`, `put`, `head`...). */
export function r2Calls(calls, method = null) {
  const count = (group) => Object.entries(group).filter(([key]) => !method || key.endsWith(`.${method}`)).reduce((n, [, e]) => n + e.n, 0);
  return count(calls.r2) + count(calls.object);
}

/** The Worker's calls in the order they began and ended, `[{kind, name, start, end}]`, from an answer to a request that carried the header `x-wrap-events: 1`. */
export function readEvents(res) {
  try { return JSON.parse(res.headers.get("x-wrap-events") || "[]").map(([kind, name, start, end]) => ({ kind, name, start, end })); } catch { return []; }
}
/** The most calls in flight at once among the events that `pick` keeps (two overlap exactly when neither ended before the other began). */
export function peak(events, pick = () => true) {
  const keep = events.filter(pick);
  let best = 0;
  for (const e of keep) best = Math.max(best, keep.filter((x) => x.start <= e.start && x.end > e.start).length);
  return best;
}
/** The longest chain of calls awaited one after another: each began after the one before it ended. */
export function depth(events, pick = () => true) {
  const keep = events.filter(pick).sort((a, b) => a.start - b.start);
  const best = [];
  keep.forEach((e, i) => { best[i] = 1 + Math.max(0, ...keep.slice(0, i).filter((x) => x.end < e.start).map((x) => best[keep.indexOf(x)])); });
  return Math.max(0, ...best);
}
