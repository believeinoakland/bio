/* plane R73 (T51; K4231, K4234; control-plane R115, acquisition R95): THE STAGE TIMES OF AN `acquire` THE DOOR STOPPED WAITING FOR.
   `acquire` runs in the object, and an object does not cross the fetch boundary, so the door's own timings object stays empty.
   The route map hands the arm a fresh `timings` object, held here under the door's `trace` (a string the door mints per request
   and capture sends with `/acquire`); the store-internal read `acquiretimings?trace=` answers `stageTimes` of the held object, the
   stages that ran and the one running. The holder is bounded (`HOLD_MAX`) and each entry lives `HOLD_TTL_MS` past its start, so
   it cannot grow; an entry whose acquire has ended stays until then, so a door that asks just after the end still reads it. */
import { stageTimes } from "../acquisition/index.mjs";

export const HOLD_MAX = 64;
export const HOLD_TTL_MS = 60_000;

const HOLDERS = new WeakMap();

/** The holder of a host: `{open(trace), read(trace), size}`; `now` is the clock for the time to live (a test passes its own). */
export function acquireTimingsOf(host, { now = () => Date.now() } = {}) {
  let h = HOLDERS.get(host);
  if (h) return h;
  const held = new Map();
  const sweep = () => {
    const t = now();
    for (const [k, v] of held) if (t - v.at > HOLD_TTL_MS) held.delete(k);
    while (held.size > HOLD_MAX) held.delete(held.keys().next().value);
  };
  h = {
    /** A fresh timings object for an `acquire`; kept under `trace` when it is a non-empty string, else only returned. */
    open(trace) {
      const t = {};
      if (typeof trace === "string" && trace !== "") { sweep(); held.set(trace, { t, at: now() }); sweep(); }
      return t;
    },
    /** `stageTimes` of the object held under `trace`, or null when none is held (never opened, expired or pushed out). */
    read(trace) {
      sweep();
      const e = typeof trace === "string" ? held.get(trace) : undefined;
      return e ? stageTimes(e.t) : null;
    },
    get size() { return held.size; },
  };
  HOLDERS.set(host, h);
  return h;
}

export const TRACE_HEADER = "x-civicsmith-trace";
const TRACE_VALUE = /^[\x21-\x7e]{1,200}$/;

/** The request as the route map sees it: for `acquire`, the door's trace from the header `x-civicsmith-trace` (capture R99) is set as the
 *  in-process `trace` parameter (store-door hands on only the headers it names), and a `trace` a caller put in the address is removed, so
 *  the key is the door's alone. Any other request is returned as it came. */
export async function traceStamped(req) {
  let url;
  try { url = new URL(req.url); } catch { return req; }
  if (url.pathname.replace(/^\/+/, "") !== "acquire" || req.method !== "POST") return req;
  const h = req.headers.get(TRACE_HEADER);
  url.searchParams.delete("trace");
  if (typeof h === "string" && TRACE_VALUE.test(h)) url.searchParams.set("trace", h);
  return new Request(url, { method: req.method, headers: req.headers, body: await req.text() });
}

/** The handler parts `captureOps` takes as `h`: `timings` is made when the `acquire` arm reads it, keyed by this request's `trace`. */
export function acquireHandlerParts(host, url) {
  const trace = url.searchParams.get("trace");
  return { get timings() { return acquireTimingsOf(host).open(trace); } };
}

/** The store-internal read, an entry of the route map: no caller's own, reached by the door with the stamps it sets. */
export function acquireTimingsOps(host, url) {
  return { acquiretimings: () => ({ ok: true, stageTimes: acquireTimingsOf(host).read(url.searchParams.get("trace")) }) };
}
