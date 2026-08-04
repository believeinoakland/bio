/* envelope-probe.mjs — the runtime half of `check-mock-envelope.mjs`.
 *
 * It is NOT a test and nothing imports it. It is preloaded with `--import` in
 * front of a harness, and its whole job is to see what shape that harness's
 * mock answered each op in.
 *
 * HOW IT REACHES THE MOCK WITHOUT EDITING ANY SUITE. Every UI harness runs
 * `app.html`'s script inside a `vm` context and hands the context its own
 * `fetch` (`const ctx = { …, fetch: async (u,opts) => mockFetch(u,opts) };
 * vm.createContext(ctx)`). So the ONE choke point every mock passes through is
 * `vm.createContext`, and this module patches it: the ctx's `fetch` is wrapped
 * before the context is created, and the wrapper reads the `op` off the URL and
 * the shape off the answer. Suites import the builtin as `import vm from "vm"`,
 * which is the module's own exports object, so patching a property on it is
 * visible to every suite loaded afterwards.
 *
 * WHY NOT PARSE THE SUITES. A mock answer is built by helpers (`R`, `W`,
 * `reply`, spreads, per-op branches) that differ from suite to suite, and a
 * static reader of them would be guessing. This observes the ANSWER, which is
 * the thing the rule is actually about.
 *
 * It records and never judges. `check-mock-envelope.mjs` owns the verdict.
 */
import vm from "vm";
import fs from "fs";

const OUT = process.env.UI_ENVELOPE_PROBE_OUT;
/* op -> { wrapped:Set-ish, flat:Set-ish } collapsed to counts, plus one sample
   of the answer's top-level keys so a failure can say what it saw. */
const SEEN = new Map();
/* Every fetch the context made, op-bearing or not. It separates "this suite
   drives no op" (a rendering harness — fine) from "the probe never saw the
   mock" (the guard measuring nothing and reporting green). */
let CALLS = 0;

function note(op, wrapped, keys){
  if(!SEEN.has(op)) SEEN.set(op, { op, wrapped:0, flat:0, sampleKeys:null });
  const e = SEEN.get(op);
  if(wrapped) e.wrapped++; else { e.flat++; if(!e.sampleKeys) e.sampleKeys = keys; }
}

async function observe(u, res){
  let op = null;
  try{ op = new URL(String(u), "https://plane.test").searchParams.get("op"); }catch(_){ return; }
  if(!op) return;                                   // not an op call (bytes, /build, …)
  if(!res || res.ok === false) return;              // an HTTP-level failure carries no body rule
  if(typeof res.json !== "function") return;        // a bytes answer (arrayBuffer) — not ours
  /* NEVER CONSUME THE ANSWER. `intent-write.test.mjs` is not a mock at all — it
     drives the REAL plane through miniflare and hands back a real `Response`,
     whose body is a one-shot stream. Reading it here left the surface with
     nothing and failed the suite while the probe reported success, which is the
     probe committing D-173's own sin. A real Response is cloned; a plain object
     mock (`{ok:true, json:async()=>o}`) has no `clone` and is read directly,
     which is safe because its `json` returns the same object every time. */
  let body;
  try{
    const src = typeof res.clone === "function" ? res.clone() : res;
    body = await src.json();
  }catch(_){ return; }
  if(!body || typeof body !== "object" || Array.isArray(body)) return;
  /* A CONTROL-PLANE REFUSAL IS LEGITIMATELY FLAT and is not evidence about the
     success shape: index.mjs answers a bad token, an unknown op or a malformed
     request with `json({ok:false, …})` directly, no envelope. Only SUCCESS
     answers carry the wrapped/flat distinction this guard is about. */
  if(body.ok === false) return;
  note(op, Object.prototype.hasOwnProperty.call(body, "result"), Object.keys(body).slice(0, 12));
}

const origCreate = vm.createContext.bind(vm);
vm.createContext = function(ctx, ...rest){
  if(ctx && typeof ctx === "object"){
    let cur = ctx.fetch, wrapped = null, wrappedFor = null;
    const wrap = f => {
      if(wrappedFor === f) return wrapped;
      wrappedFor = f;
      wrapped = typeof f === "function"
        ? async function(u, opts){
            CALLS++;
            const res = await f.call(this, u, opts);
            try{ await observe(u, res); }catch(_){}
            return res;
          }
        : f;
      return wrapped;
    };
    try{
      /* An accessor rather than a one-time overwrite, so a suite that replaces
         its fetch AFTER the context exists is still observed. */
      Object.defineProperty(ctx, "fetch", {
        configurable:true, enumerable:true,
        get(){ return wrap(cur); },
        set(v){ cur = v; },
      });
    }catch(_){ /* a frozen ctx is left alone rather than made to throw */ }
  }
  return origCreate(ctx, ...rest);
};

process.on("exit", () => {
  if(!OUT) return;
  try{ fs.writeFileSync(OUT, JSON.stringify({ calls: CALLS, ops: [...SEEN.values()] })); }catch(_){}
});
