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
  if(!SEEN.has(op)) SEEN.set(op, { op, wrapped:0, flat:0, sampleKeys:null, rowKeys:{} });
  const e = SEEN.get(op);
  if(wrapped) e.wrapped++; else { e.flat++; if(!e.sampleKeys) e.sampleKeys = keys; }
}

/* M0-23 — THE COLUMN HALF, and it is the same observation one altitude down.
 * Arm B asks what shape the ENVELOPE was; this asks what shape the ROWS INSIDE
 * it were. A mock can answer a perfectly wrapped envelope whose rows drop half
 * the columns the plane selects, and the suite reading it cannot assert against
 * a column its own fixture does not have — which is how `caseMembers[]` lost
 * `version_sha`, the column the published index's join is actually made on, in
 * two suites at once (UI-56 and M0-23, D-173's class at the column level).
 *
 * It records the UNION of row keys per array field rather than one sample,
 * because a fixture may carry the column on one row and not another and the
 * union is the shape the fixture can REPRESENT. It records and never judges;
 * `check-mock-envelope.mjs` owns the verdict, as with everything else here. */
const MAX_KEYS = 60;
function noteRows(op, payload){
  if(!payload || typeof payload !== "object" || Array.isArray(payload)) return;
  const e = SEEN.get(op);
  if(!e) return;
  for(const [field, val] of Object.entries(payload)){
    if(!Array.isArray(val)) continue;
    if(!e.rowKeys[field]) e.rowKeys[field] = { rows:0, keys:[] };
    const slot = e.rowKeys[field];
    slot.rows += val.length;
    const set = new Set(slot.keys);
    for(const row of val){
      if(!row || typeof row !== "object" || Array.isArray(row)) continue;
      for(const k of Object.keys(row)) if(set.size < MAX_KEYS) set.add(k);
    }
    slot.keys = [...set].sort();
  }
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
  const wrapped = Object.prototype.hasOwnProperty.call(body, "result");
  note(op, wrapped, Object.keys(body).slice(0, 12));
  /* The PAYLOAD is what the surface actually reads: `result` for a wrapped op,
     the body itself for a flat one. Taking the body for both would have scored
     every wrapped op's rows as absent — the census measuring the envelope it was
     built to look past. */
  noteRows(op, wrapped ? body.result : body);
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
