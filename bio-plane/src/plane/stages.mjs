/* PROTO STAGES (throwaway study; behind env PROTO_STAGES=1, unset: nothing here runs). Times the stages of one `captureupload` (and `promote`) INSIDE the object and states them in the
   answer's `Server-Timing` as `up-<stage>;dur=<ms>`, which the door's clock already carries (control-plane R128 `statedEntries`). No behaviour changes: each stage is a Date.now() delta across an
   await. workerd freezes the clock in synchronous code, so a stage that is all synchronous work reads 0 and is marked `desc=sync`. The modules that are timed reach the collector only
   through `globalThis.__protoStage(name, ms)`, installed here when the flag is on (no import crosses a module boundary). */
import { AsyncLocalStorage } from "node:async_hooks";

const als = new AsyncLocalStorage();
export const stagesOn = (env) => !!env && env.PROTO_STAGES === "1";
export const SENT_HEADER = "x-up-sent";

/** installs the hook (once per isolate) */
export function installStages() {
  globalThis.__protoStage = (name, ms, desc) => {
    const s = als.getStore();
    if (!s || typeof name !== "string" || !Number.isFinite(ms)) return;
    const e = s.get(name) ?? { ms: 0, desc: null };
    e.ms += Math.max(0, ms); if (desc) e.desc = desc;
    s.set(name, e);
  };
}

/** runs `fn` with a collector; answers `[result, header]` where header is the `up-*` entries joined, "" when none */
export async function collect(fn, req) {
  const s = new Map();
  /* the time the call waited to enter the room: this instant less the door's `Date.now()` at the moment it sent the request (two clocks: the hop is in it, and skew) */
  try {
    const sent = Number(req && req.headers && req.headers.get(SENT_HEADER));
    if (Number.isFinite(sent) && sent > 0) s.set("up-room-wait", { ms: Math.max(0, Date.now() - sent), desc: null });
  } catch { /* status */ }
  const result = await als.run(s, fn);
  const parts = [];
  for (const [n, e] of s) if (/^[a-z0-9-]{1,40}$/.test(n)) parts.push(`${n};dur=${Math.round(e.ms)}${e.desc ? `;desc=${e.desc}` : ""}`);
  return [result, parts.join(", ")];
}
