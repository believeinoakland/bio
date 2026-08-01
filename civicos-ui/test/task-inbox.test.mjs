/* UI-1 — THE TASK INBOX (BIO_Interaction_Constructs v0.2, the QUEUE construct).
 *
 * Drives the member surface over the plane's already-shipped attention layer
 * (D-98): op=tasks lists, op=taskforward and op=taskresolve act. Proves the four
 * things UI-1's accepts-when names — lists a member's tasks, forwards one,
 * resolves one through the plane ops, and shows an `unassigned` task honestly —
 * plus the two other accountability rules the construct makes load-bearing: the
 * refusal shape for a task that is someone else's, and that a task ages/points
 * at the act rather than vanishing.
 *
 * NEGATIVE CONTROL: break the resolve wiring in app.html — change recPost's
 * op string in resolveTask() from "taskresolve" to a nonexistent op (e.g.
 * "tasknope") — and the resolve assertions fail: the mock plane never mutates
 * T1b, so its status stays "open" and CALLS carries no taskresolve. RUN
 * 2026-07-31: with resolveTask calling op="tasknope", 4 of 33 assertions failed
 * ("plane received op=taskresolve for T1b", "T1b is resolved in the store", "a
 * resolved task drops out of the live inbox", "the browser sends only the task
 * id on resolve"); restored to "taskresolve" -> 33/33 green.
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ---- the mock plane: stateful, records every op the surface calls ---- */
const CALLS = [];
const MEMBERS = [
  { member_id:"m_alice", handle:"alice", status:"active" },
  { member_id:"m_bob",   handle:"bob",   status:"active" },
  { member_id:"m_carol", handle:"carol", status:"active" },
];
let TASKS = [
  { id:"T1",  kind:"authority-undetermined", refers_to:"INFO-2026-0002",
    subject:{text:"a capture whose authority could not be determined"},
    assignee:"m_alice", assignee_role:"member", status:"open",
    created:"2026-07-20T00:00:00Z", history:[] },
  { id:"T1b", kind:"authority-undetermined", refers_to:"INFO-2026-0007",
    subject:{text:"a capture whose authority could not be determined"},
    assignee:"m_alice", assignee_role:"member", status:"open",
    created:"2026-07-24T00:00:00Z", history:[] },
  { id:"T2",  kind:"authority-undetermined", refers_to:"INFO-2026-0003",
    subject:{text:"a capture whose authority could not be determined"},
    assignee:"unassigned", assignee_role:"group-admin", status:"open",
    created:"2026-07-22T00:00:00Z", history:[] },
  { id:"T3",  kind:"authority-undetermined", refers_to:"INFO-2026-0004",
    subject:{text:"a capture whose authority could not be determined"},
    assignee:"m_carol", assignee_role:"member", status:"forwarded",
    created:"2026-07-25T00:00:00Z",
    history:[{ at:"2026-07-26T00:00:00Z", event:"forwarded", actor:"m_admin" }] },
];
function counts(){ return {
  open: TASKS.filter(t=>t.status==="open").length,
  forwarded: TASKS.filter(t=>t.status==="forwarded").length,
  resolved: TASKS.filter(t=>t.status==="resolved").length,
  queued: 0 }; }

function mockFetch(u, opts){
  const url = new URL(u, "https://plane.test");
  const op = url.searchParams.get("op");
  const R = o => ({ ok:true, json:async()=>o });
  let body = null; try{ body = opts && opts.body ? JSON.parse(opts.body) : null; }catch(_){}
  CALLS.push({ op, method:(opts&&opts.method)||"GET", body });
  if(op==="tasks")      return R({ ok:true, result:{ tasks:TASKS, counts:counts() } });
  if(op==="memberlist") return R({ ok:true, result:{ members:MEMBERS } });
  if(op==="whoami")     return R({ ok:true, result:{ member:"m_alice", session:true, administer:false, capabilities:["contribute"] } });
  if(op==="taskresolve"){
    const t = TASKS.find(x=>x.id===(body&&body.id));
    if(!t) return R({ ok:false, reason:"NO_SUCH_TASK" });
    t.status="resolved"; t.resolved_at="2026-07-31T00:00:00Z";
    t.history=[...(t.history||[]), { at:t.resolved_at, event:"resolved", actor:"m_alice" }];
    return R({ ok:true, id:t.id, status:"resolved", resolved_at:t.resolved_at });
  }
  if(op==="taskforward"){
    const t = TASKS.find(x=>x.id===(body&&body.id));
    if(!t) return R({ ok:false, reason:"NO_SUCH_TASK" });
    const from = t.assignee;
    t.assignee=body.to; t.assignee_role="member"; t.status="forwarded";
    t.history=[...(t.history||[]), { at:"2026-07-31T00:00:00Z", event:"forwarded", actor:"m_alice" }];
    return R({ ok:true, id:t.id, assignee:t.assignee, from, at:"2026-07-31T00:00:00Z" });
  }
  return R({ ok:false, reason:"unexpected op "+op });
}

/* ---- a DOM stub good enough for innerHTML inspection (the record-list shape) ---- */
const els = new Map();
function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
  querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){}, remove(){}, onclick:null };
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }

const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
  document:{ querySelector:s=>{ if(s==="#docscroll") return null; if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(),
    hidden:false, createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:async(u,opts)=>mockFetch(u,opts) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() +
  ";globalThis.__PLANE=PLANE;globalThis.__renderTasks=renderTasks;" +
  "globalThis.__resolveTask=resolveTask;globalThis.__forwardTask=forwardTask;", ctx);

/* the member is signed in as m_alice */
ctx.__PLANE.session = true;
ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };

/* ---- (1) list a member's tasks ---- */
await ctx.__renderTasks();
const tk = els.get("#tk")._html;
ok("op=tasks was called to list the inbox", CALLS.some(c=>c.op==="tasks"));
ok("a 'Yours' section is shown", /Yours/.test(tk));
ok("the member's own task appears (kind label)", tk.includes("Authority undetermined"));
ok("the task NEEDS-YOU line is shown", tk.includes("could not tell who published"));

/* ---- points at the act it resolves in (does not reimplement it) ---- */
ok("the task points at the act via its referred record", tk.includes('data-open="INFO-2026-0002"'));
ok("the pointer is labelled as going to the act", tk.includes("Determine who published it"));
ok("the age is surfaced (never silently dropped)", /opened/.test(tk));

/* ---- (4) an unassigned task is shown HONESTLY, never as a phantom ---- */
ok("a task no one holds is shown as Unassigned", tk.includes(">Unassigned<"));
ok("the unassigned section is named, not hidden", /Unassigned — no one is holding these/.test(tk));
/* the phantom check: the unassigned card must not invent an assignee. The only
   member-id tokens present for T2's card are none — it says Unassigned. */
ok("the surface never prints the raw 'unassigned' as if it were a member id in prose",
   !/with <b>unassigned<\/b>/.test(tk));

/* ---- the refusal shape for a task that is someone else's ---- */
ok("a task held by another member shows the refusal shape",
   tk.includes("This isn't yours to resolve"));
ok("the refusal names who it is with", tk.includes("m_carol"));
/* T3 (carol's) must NOT offer this member a resolve control */
ok("another member's task offers no resolve button here", !tk.includes('data-res="T3"'));
ok("another member's task offers no forward button here", !tk.includes('data-fwd="T3"'));
/* the member's own task DOES offer both verbs */
ok("the member's own task offers forward", tk.includes('data-fwd="T1"'));
ok("the member's own task offers resolve", tk.includes('data-res="T1"'));

/* ---- (2) forward one through op=taskforward ---- */
await ctx.__forwardTask("T1", "m_bob");
ok("plane received op=taskforward for T1", CALLS.some(c=>c.op==="taskforward" && c.body && c.body.id==="T1" && c.body.to==="m_bob"));
ok("T1 is now assigned to m_bob in the store", TASKS.find(t=>t.id==="T1").assignee==="m_bob");
const tk2 = els.get("#tk")._html;
ok("after forwarding, T1 leaves the member's own list", !tk2.includes('data-res="T1"'));
ok("after forwarding, T1 shows the refusal to its old owner (now with m_bob)",
   tk2.includes("This isn't yours to resolve") && tk2.includes("m_bob"));

/* ---- (3) resolve one through op=taskresolve ---- */
await ctx.__resolveTask("T1b");
ok("plane received op=taskresolve for T1b", CALLS.some(c=>c.op==="taskresolve" && c.body && c.body.id==="T1b"));
ok("T1b is resolved in the store", TASKS.find(t=>t.id==="T1b").status==="resolved");
const tk3 = els.get("#tk")._html;
ok("a resolved task drops out of the live inbox", !tk3.includes('data-id="T1b"'));

/* ---- the actor is stamped by the plane, never sent from the browser ---- */
const resCall = CALLS.find(c=>c.op==="taskresolve");
ok("the browser sends only the task id on resolve (actor is the plane's to stamp)",
   resCall && resCall.body && !("actor" in resCall.body));
const fwdCall = CALLS.find(c=>c.op==="taskforward");
ok("the browser sends only id+to on forward (actor is the plane's to stamp)",
   fwdCall && fwdCall.body && !("actor" in fwdCall.body));

/* ---- the vocabulary guard: no plane-internal jargon reaches the member ---- */
const seen = els.get("#content")._html + tk + tk2 + tk3;
for(const word of ["op=", "refers_to", "assignee_role", "member_expertise",
                   "taskresolve", "taskforward", "BAD_KIND", "task_queue"])
  ok(`the task surface never says "${word}"`, !seen.includes(word));

if(fails.length){ console.error(`task-inbox: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`task-inbox: ${n} assertions, all green — list, forward, resolve, unassigned-honest, refusal shape`);
