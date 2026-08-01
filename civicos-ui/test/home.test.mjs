/* UI-8 — THE MEMBER HOME (the "what needs you" orientation surface, M8's entry
 * point). BIO_Interaction_Constructs v0.2: HOME is not a construct — it is the
 * attention layer's front door, aggregating what the record holds for THIS
 * member and pointing at the surfaces where the acts happen. READ-ONLY.
 *
 * Drives renderHome() over the two feeds it summarises, consumed never reshaped:
 *   op=tasks      — the SAME feed UI-1's inbox reads; the open-task count is the
 *                   op's (mine / unassigned partition), never invented.
 *   op=proposals  — REC-6's discovery feed, read through the SAME loadProposals()
 *                   UI-5 uses; the proposal count is the aggregated feed's length.
 *                   When op=proposals is absent it degrades to an honest "feed
 *                   pending" note (as UI-5's gap banner does), NEVER a count.
 *
 * Proves UI-8's accepts-when: the home shows the member's open-task count from
 * op=tasks and the proposal count from op=proposals; the honest "feed pending"
 * state when the proposals op is absent; and an empty record shows the honest
 * empty state ("nothing needs you right now"), not a fake number.
 *
 * NEGATIVE CONTROL: break the TASK-COUNT WIRING in app.html — make
 * homeTasksSummary() read a nonexistent op (change `rec("tasks")` to
 * `rec("tasksnope")`) — and the shown open-task count no longer reflects
 * op=tasks: the mock never answers that op, homeTasksSummary throws, the card
 * shows the honest "could not be asked" note instead of the count, and op=tasks
 * is never called. RUN 2026-07-31 in a second VM context built from the patched
 * source: with `rec("tasksnope")`, CALLS carried no op=tasks, the "2 need you"
 * count was absent, and the error note appeared — 3 assertions failed ("op=tasks
 * was called", "the open-task count 2 is shown from op=tasks", "the count 2
 * reflects the op's partition"); restored to `rec("tasks")` -> all green. This
 * control runs LIVE at the end of this suite (BROKEN context) so it cannot rot.
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ---- the mock plane. MODE toggles the three scenarios renderHome must handle;
   PROP_MODE toggles whether op=proposals is live or absent. ---- */
let MODE = "busy";        // busy | empty
let PROP_MODE = "live";   // live | absent
const CALLS = [];

const TASKS_BUSY = [
  { id:"T1", kind:"authority-undetermined", refers_to:"INFO-0001", assignee:"m_alice",
    assignee_role:"member", status:"open", created:"2026-07-18T00:00:00Z", history:[] },
  { id:"T2", kind:"authority-undetermined", refers_to:"INFO-0002", assignee:"m_alice",
    assignee_role:"member", status:"open", created:"2026-07-27T00:00:00Z", history:[] },
  { id:"T3", kind:"authority-undetermined", refers_to:"INFO-0003", assignee:"unassigned",
    assignee_role:"group-admin", status:"open", created:"2026-07-22T00:00:00Z", history:[] },
  { id:"T4", kind:"authority-undetermined", refers_to:"INFO-0004", assignee:"m_carol",
    assignee_role:"member", status:"open", created:"2026-07-25T00:00:00Z", history:[] },
  { id:"T5", kind:"authority-undetermined", refers_to:"INFO-0005", assignee:"m_alice",
    assignee_role:"member", status:"resolved", created:"2026-07-10T00:00:00Z", history:[] },
];
/* three instances -> D-79 aggregation -> TWO proposals (meeting::agenda has two
   instances, contract::solicitation has one). The count the home shows is 2. */
const INSTANCES = [
  { progression_key:"meeting", progression_label:"meeting", entity_id:"E1", entity_label:"Council 2101",
    findings:[{ kind:"missing_predecessor", stage_key:"agenda", stage_label:"agenda", required:"always", grade:"B", grade_determined:true }] },
  { progression_key:"meeting", progression_label:"meeting", entity_id:"E2", entity_label:"Council 2102",
    findings:[{ kind:"missing_predecessor", stage_key:"agenda", stage_label:"agenda", required:"always", grade:"C", grade_determined:true }] },
  { progression_key:"contract", progression_label:"contract", entity_id:"E3", entity_label:"RFP-9",
    findings:[{ kind:"missing_predecessor", stage_key:"solicitation", stage_label:"solicitation", required:"usually", grade:"A", grade_determined:true }] },
];

function mockFetch(u){
  const url = new URL(u, "https://plane.test");
  const op = url.searchParams.get("op");
  const R = o => ({ ok:true, json:async()=>o });
  CALLS.push({ op });
  if(op==="tasks"){
    const tasks = MODE==="empty" ? [] : TASKS_BUSY;
    return R({ ok:true, result:{ tasks } });
  }
  if(op==="proposals"){
    if(PROP_MODE==="absent") return R({ ok:false, error:"unknown op proposals" });
    const instances = MODE==="empty" ? [] : INSTANCES;
    return R({ ok:true, instances });
  }
  return R({ ok:false, reason:"unexpected op "+op });
}

/* ---- a DOM stub good enough for innerHTML inspection (the task-inbox shape) ---- */
function makeEls(){ return new Map(); }
function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
  querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){}, remove(){}, onclick:null };
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }

function makeCtx(els){
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
    setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
    document:{ querySelector:s=>{ if(s==="#docscroll") return null; if(!els.has(s)) els.set(s, el()); return els.get(s); },
      querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(),
      hidden:false, createElement:()=>el(), body:{appendChild(){}} },
    location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:async(u)=>mockFetch(u) };
  ctx.globalThis = ctx; vm.createContext(ctx);
  return ctx;
}

/* ---- build the real surface ---- */
const els = makeEls();
const ctx = makeCtx(els);
vm.runInContext(appScript() + ";globalThis.__PLANE=PLANE;globalThis.__renderHome=renderHome;", ctx);
ctx.__PLANE.session = true;
ctx.__PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };

/* ============================================================
   (1) BUSY record: counts come FROM the ops
   ============================================================ */
MODE = "busy"; PROP_MODE = "live"; CALLS.length = 0;
await ctx.__renderHome();
let hm = els.get("#hm")._html;

ok("op=tasks was called for the open-task summary", CALLS.some(c=>c.op==="tasks"));
ok("op=proposals was called for the proposal summary", CALLS.some(c=>c.op==="proposals"));

/* the open-task count is the member's own live tasks (T1,T2), read from op=tasks */
ok("the open-task count 2 is shown from op=tasks", /2<span class="u">need you/.test(hm));
ok("the count 2 reflects the op's partition (two of alice's live tasks, not the resolved or others')",
   hm.includes("need you") && !/3<span class="u">need you/.test(hm) && !/5<span class="u">need you/.test(hm));
ok("the most urgent (longest-waiting) task is surfaced", hm.includes("waiting longest"));
ok("the most urgent task shows its human kind, not a token", hm.includes("Authority undetermined"));
ok("the unassigned task no one holds is surfaced honestly, not hidden",
   /<b>1<\/b> task no one is holding yet/.test(hm));

/* the proposal count is the AGGREGATED feed length (2), read through loadProposals */
ok("the proposal count 2 is shown from op=proposals", /2<span class="u">await you/.test(hm));
ok("the proposal count is not the raw instance count (3), but the D-79 aggregation (2)",
   !/3<span class="u">await you/.test(hm));

/* entry to the built surfaces */
ok("a clear entry to the Tasks surface is offered", hm.includes('data-go="tasks"'));
ok("a clear entry to the Subjects surface is offered", hm.includes('data-go="subjects"'));
ok("a clear entry to the Proposals surface is offered", hm.includes('data-go="proposals"'));
/* Members is admin-gated exactly as the rail is: a non-admin sees no entry to it */
ok("Members entry is ABSENT for a non-admin (matches the rail's gating)", !hm.includes('data-go="members"'));

/* a busy record shows NO all-clear banner */
ok("no all-clear banner is shown when the record holds attention", !hm.includes("Nothing needs you right now"));

/* ============================================================
   (2) op=proposals ABSENT: honest "feed pending", never a fabricated count
   ============================================================ */
MODE = "busy"; PROP_MODE = "absent"; CALLS.length = 0;
await ctx.__renderHome();
hm = els.get("#hm")._html;
ok("op=tasks still summarised when the proposals feed is absent", /2<span class="u">need you/.test(hm));
ok("the proposals card degrades to an honest 'feed pending' note",
   /proposals feed is not answering/.test(hm) && /No number is invented/.test(hm));
ok("NO proposal count is fabricated when the op is absent",
   !/\d<span class="u">await you/.test(hm));
ok("the proposals entry link still works even when the feed is pending", hm.includes('data-go="proposals"'));

/* ============================================================
   (3) EMPTY record: the honest empty state, never a fake number
   ============================================================ */
MODE = "empty"; PROP_MODE = "live"; CALLS.length = 0;
await ctx.__renderHome();
hm = els.get("#hm")._html;
ok("an empty record shows the honest empty state", hm.includes("Nothing needs you right now"));
ok("the empty state states the count is the record's own, never a placeholder",
   /never a placeholder/.test(hm));
ok("the open-task count reads 0 from the op, an honest number not a hidden one", /0<span class="u">need you/.test(hm));
ok("the proposal count reads 0 from the op", /0<span class="u">await you/.test(hm));
ok("no fabricated task appears in an empty record",
   !hm.includes("Authority undetermined") && !hm.includes("waiting longest"));

/* ============================================================
   the vocabulary guard: no plane-internal jargon reaches the member
   ============================================================ */
MODE = "busy"; PROP_MODE = "live";
await ctx.__renderHome();
hm = els.get("#hm")._html;
const seen = els.get("#content")._html + hm;
for(const word of ["op=", "assignee", "member_id", "refers_to", "progression_key",
                   "stage_key", "capture_sha", "entity_id", "grade_determined", "surfaced_by"])
  ok(`the home surface never says "${word}"`, !seen.includes(word));

/* an admin DOES get the Members entry (the gate is honest both ways) */
ctx.__PLANE.me = { member:"m_admin", handle:"admin", session:true, administer:true, capabilities:["contribute","administer"] };
await ctx.__renderHome();
ok("Members entry IS offered to an admin (the gate matches the rail both ways)",
   els.get("#hm")._html.includes('data-go="members"'));

/* ============================================================
   NEGATIVE CONTROL, RUN LIVE: break the task-count wiring in a second context
   built from PATCHED source (rec("tasks") -> rec("tasksnope")) and confirm the
   shown count no longer reflects op=tasks.
   ============================================================ */
{
  const bEls = makeEls();
  const bCtx = makeCtx(bEls);
  const broken = appScript().replace('rec("tasks")', 'rec("tasksnope")');
  if(broken === appScript()){ fails.push("NEGATIVE CONTROL could not find the task-count wiring to break"); n++; }
  vm.runInContext(broken + ";globalThis.__PLANE=PLANE;globalThis.__renderHome=renderHome;", bCtx);
  bCtx.__PLANE.session = true;
  bCtx.__PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };
  MODE = "busy"; PROP_MODE = "live"; CALLS.length = 0;
  await bCtx.__renderHome();
  const bhm = bEls.get("#hm")._html;
  ok("NEGATIVE CONTROL: with the wiring broken, op=tasks is NOT called", !CALLS.some(c=>c.op==="tasks"));
  ok("NEGATIVE CONTROL: with the wiring broken, the '2 need you' count is NOT shown",
     !/2<span class="u">need you/.test(bhm));
  ok("NEGATIVE CONTROL: with the wiring broken, the honest 'could not be asked' note appears instead",
     /could not be asked for your tasks/.test(bhm));
}

if(fails.length){ console.error(`home: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`home: ${n} assertions, all green — open-task-count-from-op=tasks, proposal-count-from-op=proposals, feed-pending-honest, empty-state-honest, entry-links, admin-gated-members, NC-run(task-count-wiring)`);
