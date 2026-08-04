/* UI-14 — S1 THE QUEUE: three screens become one.
 *
 * Drives `renderQueue` over a mock plane answering the two feeds the surface
 * names — op=queue (REC-20's one contract, with REC-21's mute report block and
 * REC-32's CONDITION items) and op=tasks&status=resolved (the receipts DEC-16
 * needs) — plus op=taskresolve, op=taskforward and op=queuemute as acts.
 *
 * WHAT THIS SUITE REPLACES, and what it carries forward. `home.test.mjs` (UI-8)
 * and `task-inbox.test.mjs` (UI-1) are DELETED with the screens they drove: a
 * suite whose subject no longer exists is not a suite, and keeping them green
 * over a screen nobody can reach is worse than deleting them, because it reads
 * as coverage. What they were really guarding is carried here and is named so a
 * reader can check the trade rather than take it on trust:
 *   - home's "every count comes from an op, never invented", its per-feed
 *     independent degradation, and its all-clear-only-when-both-answered rule
 *     -> §4 and §5 below, now over NAMED feeds with the plane's own reasons and
 *     a Retry that reaches only the feed that broke;
 *   - the inbox's honest `unassigned` state, its "points at the act rather than
 *     replacing it" pointer, and its resolve/forward through the plane's own ops
 *     with the actor stamped server-side -> §3 and §6;
 *   - the inbox's REFUSAL SHAPE ("this isn't yours to resolve, it's with X") is
 *     deliberately NOT carried, and that is a correction rather than a loss:
 *     DEC-8 forbids a surface rendering a refusal it computed itself, and
 *     op=queue returns a member only their own and unassigned obligations, so
 *     the surface has nothing to refuse and no reason to say so. §7 asserts the
 *     absence, so the deletion is a rule under test rather than a hole.
 *
 * WHAT THE ITEM'S ACCEPTS-WHEN NAMES, clause by clause:
 *   (1) an OBLIGATION and an aggregated FINDING grouped under ONE case;
 *   (2) ONE event under TWO ancestor cases, clearing everywhere on one
 *       resolution, with the RESOLVER NAMED and dated to the member who did not
 *       make it — never a gap;
 *   (3) an UNGROUPED item, never given an invented home;
 *   (4) a per-feed failure NAMED with the plane's reason and NO COUNT, distinct
 *       from "this op is not on this plane";
 *   (5) a Retry that re-runs ONLY the failed feed;
 *   (6) the all-clear WITHHELD while one feed pends;
 *   (7) the ordering rule STATED on the surface (Q13: longest-waiting first is
 *       the RULE, and the word "proxy" is gone);
 *   (8) a CONDITION group's mute control reaching CONDITIONS ONLY.
 *
 * NEGATIVE CONTROL, three arms, RUN 2026-08-04 and RESTORED byte-identical after
 * each — app.html's sha256 compared before and after every arm, and all three
 * returned to fd785e1bffb9fb05…, with the suite re-run green after each restore.
 * Each arm is ONE edit in civicos-ui/app.html:
 *
 *   (a) A COUNT FOR A FEED THAT FAILED. In `queueFeedHtml`'s `failed` branch,
 *       replace "so NO COUNT is shown for it rather than a wrong one" with a
 *       number taken from the half that DID answer:
 *         `— and the record could not answer. ${queueItems().length} items.`
 *       -> RUN: 2 of 121 failed — "a failed feed shows NO COUNT of any kind" and
 *       "the failed-feed panel carries no digit anywhere — not the other feed's
 *       count, not zero".
 *       THE HARM, and it is why this is the arm the item names: the number is
 *       the OTHER feed's. The panel under "what was answered" printed "5 items"
 *       — five being the QUEUE's item count — so the member reads a figure that
 *       is confidently wrong about the very feed it is printed under, with
 *       nothing on the screen to tell them. A wrong count is worse than none
 *       because it is indistinguishable from a right one.
 *       WORTH KNOWING: the third assertion I expected to catch this ("a failed
 *       feed names the plane's own reason and nothing more") did NOT flip, and
 *       cannot: it screens for hedging words, and an invented count is not
 *       hedged — it is stated with total confidence. The digit sweep is the
 *       assertion that does the work here, and the distinction is written down
 *       rather than left for the next session to re-derive.
 *
 *   (b) A RESOLVED EVENT LEAVING A STALE COPY UNDER A SECOND ANCESTOR. In
 *       `queueGrouped`, immediately before its `const out = ...` return, put the
 *       remembered item back under every home except the first — exactly what a
 *       surface keying item state on (member, case) instead of on the EVENT
 *       would do:
 *         for(const [id, seen] of QUEUE_SEEN){ if(items.some(i=>String(i.id)===id)) continue;
 *           for(const cid of (seen.cases||[]).slice(1)){ const g=groups.get(cid);
 *             if(g) g.items.push({ id, class:seen.class, kind:seen.kind, summary:seen.summary,
 *               case:{state:"determined",ungrouped:false,reasons:[],ancestors:[]}, subject:{},
 *               basis:{}, age:{state:"undetermined",reason:"derived_on_read"}, assignee:null, options:[] }); } }
 *       -> RUN: 4 of 121 failed — "after ONE resolution the obligation is a live
 *       item under NO case", "the resolved obligation's id appears in no item row
 *       anywhere", "the queue holds no live copy of a resolved event", "the second
 *       ancestor shows a receipt and not a live row".
 *       THE HARM: the project group shows T-88 as live work AND its receipt at
 *       the same time. DEC-16's whole point, measured from this side: a stale
 *       copy is indistinguishable from real work to the member looking at it, so
 *       they go and do it again — and the plane's own negative control (the same
 *       break, made in store.mjs) produced exactly this shape one layer down.
 *
 *   (c) MUTE HIDING AN OBLIGATION. In `queueMutableKinds`, drop the class fence
 *       so the control offers every kind present on the case:
 *         return [...new Set((items||[]).map(it => it.kind).filter(Boolean))].sort();
 *       -> RUN: 9 of 121 failed, and the two that matter are "against a plane
 *       with NO fence, the surface still names CONDITION kinds only" and "an
 *       OBLIGATION on a muted case still reaches the member, even when the plane
 *       would have hidden it".
 *       THE HARM: alice's real obligation left her queue while `tasks` went on
 *       routing it to her, so the record believed the question had reached a
 *       person it could no longer reach. Note WHICH plane produced it: the
 *       fixture with `lenientMute` — the authoritative fence is REC-21's, at the
 *       write, and against the faithful mock the break turns into the plane's own
 *       KIND_NOT_PERSONAL refusal instead (six of the nine failures are that
 *       refusal cascading). Both halves are kept: the plane's refusal is what
 *       holds in production, and the surface's own fence is what this file is
 *       responsible for, because "the plane would have stopped me" is not a
 *       property of this file.
 */
import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ============================ the corpus, in the plane's own shapes ======= */

const NOW = Date.parse("2026-08-04T12:00:00Z");
const day = 86400000;

/* DEC-16's worked example: ONE obligation on the controller memo, which sits
   under TWO cases — the question that rests on it and the project that cites it.
   One event, two homes, one state. */
const OB_TWO = {
  id:"T-88", class:"OBLIGATION", kind:"authority-undetermined",
  case:{ state:"determined", ungrouped:false, reasons:[], depth_bound:6, ancestors:[
    { id:"INQ-2026-0001", type:"inquiry", title:"Was the sewer fund misused?", state:"open", terminal:false, depth:2 },
    { id:"PROJ-2026-0001", type:"project", title:"Sewer Fund", state:"forming", terminal:false, depth:1 } ] },
  subject:{ kind:"bundle", id:"INFO-2026-0088" },
  summary:"a capture whose authority could not be determined",
  detail:"the record could not tell who published this capture",
  basis:{ source:"tasks", refers_to:"INFO-2026-0088", routed_role:"member", status:"open",
          detail:"an obligation is a routed task: a named person must act for the record to proceed (D-98)." },
  age:{ state:"determined", since:"2026-07-20T12:00:00Z", ms: 15*day },
  assignee:"m_alice", assignee_role:"member",
  options:[{ id:"release", label:"Release to verified", weight:"reasoned", needs:"contribute", mode:"session", rung:"reasoned" },
           { id:"cite", label:"Cite into a question", weight:"report", needs:"contribute", mode:"session", rung:"reversible" }],
};
/* The aggregated FINDING, under the SAME case as the obligation — clause (1). */
const FINDING = {
  id:"FINDING::procurement::solicitation", class:"FINDING", kind:"missing_predecessor",
  case:{ state:"determined", ungrouped:false, reasons:[], depth_bound:6, ancestors:[
    { id:"INQ-2026-0001", type:"inquiry", title:"Was the sewer fund misused?", state:"open", terminal:false, depth:1 } ] },
  subject:{ kind:"progression_stage", id:null, progression_key:"procurement", stage_key:"solicitation",
            bundles:["INFO-2026-0400"] },
  summary:"Procurement: the 'RFP / RFQ / IFB' stage is usually required and absent",
  detail:"3 instances of this progression reach 'RFP / RFQ / IFB' without it",
  basis:{ source:"proposalsFeed", progression_key:"procurement", stage_key:"solicitation",
          kinds:["missing_predecessor"], n:3, grade:"C", grade_determined:true, overdue_count:0,
          surfaced_by:"machine",
          detail:"a finding is DERIVED (D-79): the record's own question, aggregated one per "
               + "(progression, stage), graded the weakest instance and never averaged." },
  /* A derived finding has NO creation instant — the C-14 primitive's case. */
  age:{ state:"undetermined", reason:"derived_on_read",
        detail:"a derived finding is recomputed at read time and has no creation instant" },
  assignee:null, assignee_role:null, options:[],
};
/* An obligation nothing rests on — clause (3): UNGROUPED, determined, empty. */
const OB_LONE = {
  id:"T-300", class:"OBLIGATION", kind:"authority-undetermined",
  case:{ state:"determined", ungrouped:true, reasons:[], depth_bound:6, ancestors:[] },
  subject:{ kind:"bundle", id:"INFO-2026-0300" },
  summary:"a capture on a document nothing rests on yet",
  detail:null,
  basis:{ source:"tasks", refers_to:"INFO-2026-0300", routed_role:"group-admin", status:"open",
          detail:"an obligation is a routed task." },
  age:{ state:"determined", since:"2026-08-03T12:00:00Z", ms: 1*day },
  assignee:"unassigned", assignee_role:"group-admin", options:[],
};
/* A CONDITION on the same case as the obligation — clause (8). Two kinds, so a
   mute can be shown to reach BOTH conditions and NEITHER other class. */
const cond = (kind, summary) => ({
  id:`CONDITION::${kind}::x`, class:"CONDITION", kind,
  case:{ state:"determined", ungrouped:false, reasons:[], depth_bound:6, ancestors:[
    { id:"PROJ-2026-0001", type:"project", title:"Sewer Fund", state:"forming", terminal:false, depth:1 } ] },
  subject:{ kind:"host", id:null, host:"www.oaklandca.gov", bundles:[] },
  summary, detail:"a fact about our own machinery, not about the world",
  basis:{ source:"host_governor", host:"www.oaklandca.gov",
          detail:"a condition is a fact about OUR OWN machinery (D-103/D-95)." },
  age:{ state:"determined", since:"2026-08-04T06:00:00Z", ms: 6*3600000 },
  assignee:null, assignee_role:null, options:[],
});
const COND_A = cond("governor-holding-host", "our own pacing is holding www.oaklandca.gov");
const COND_B = cond("partial-capture-outstanding", "the capture of the agenda did not finish");
/* An item whose home walk could not be finished — DEC-36's provisional. */
const OB_OUT_OF_VIEW = {
  ...OB_LONE, id:"T-777",
  case:{ state:"undetermined", ungrouped:false, reasons:["out_of_view"], depth_bound:6, ancestors:[] },
  subject:{ kind:"bundle", id:"INFO-2026-0777" },
  summary:"a capture filed under something this credential cannot see",
  age:{ state:"determined", since:"2026-08-01T12:00:00Z", ms: 3*day },
};

const CLASSES = ["OBLIGATION", "FINDING", "CONDITION"];
const MUTE_EMPTY = { personal:true, cases:[], suppressed:[], suppressed_count:0,
  detail:"muting is PERSONAL and dismissing is a RECORD ACT (D-125)." };

/* ---------------- the mock plane ---------------- */
function makePlane(opts){
  opts = opts || {};
  const CALLS = [];
  const state = {
    items: (opts.items || [OB_TWO, FINDING, OB_LONE, COND_A, COND_B]).slice(),
    resolved: (opts.resolved || []).slice(),
    mute: opts.mute || MUTE_EMPTY,
    queueFails: opts.queueFails || null,       // {reason, detail}
    queueAbsent: !!opts.queueAbsent,
    resFails: opts.resFails || null,
    resAbsent: !!opts.resAbsent,
    resHangs: !!opts.resHangs,
    lenientMute: !!opts.lenientMute,
    muted: [],
  };
  function fetch(u, o){
    const url = new URL(u, "https://plane.test");
    const op = url.searchParams.get("op");
    let body = null; try{ body = o && o.body ? JSON.parse(o.body) : null; }catch(_){}
    CALLS.push({ op, method:(o&&o.method)||"GET", body,
                 params:Object.fromEntries(url.searchParams.entries()) });
    const R = x => ({ ok:true, json:async()=>x });
    const NO = x => ({ ok:false, json:async()=>x });
    if(op === "queue"){
      if(state.queueAbsent) return NO({ ok:false, error:"unknown op queue" });
      if(state.queueFails)  return NO({ ok:false, ...state.queueFails });
      const live = state.items.filter(i => !state.resolved.some(r => String(r.id) === String(i.id)));
      return R({ ok:true, result:{ ok:true, member:"m_alice", items:live,
        item_count:live.length, truncated:false, classes:CLASSES, classes_deferred:{},
        ancestor_depth_bound:6, mute:state.mute,
        counts:{ obligation:live.filter(i=>i.class==="OBLIGATION").length,
                 finding:live.filter(i=>i.class==="FINDING").length,
                 condition:live.filter(i=>i.class==="CONDITION").length,
                 ungrouped:live.filter(i=>i.case.ungrouped).length,
                 case_undetermined:live.filter(i=>i.case.state==="undetermined").length,
                 suppressed:state.mute.suppressed_count } } });
    }
    if(op === "tasks"){
      if(state.resAbsent) return NO({ ok:false, error:"unknown op tasks" });
      if(state.resFails)  return NO({ ok:false, ...state.resFails });
      if(state.resHangs)  return new Promise(()=>{});        // never settles
      return R({ ok:true, result:{ ok:true, tasks:state.resolved.slice(), counts:{} } });
    }
    if(op === "taskresolve"){
      const it = state.items.find(i => String(i.id) === String(body && body.id));
      if(!it) return NO({ ok:false, reason:"NO_SUCH_TASK" });
      state.resolved.push({ id:it.id, kind:it.kind, refers_to:it.subject.id,
        subject:{ text:it.summary }, assignee:it.assignee, assignee_role:it.assignee_role,
        status:"resolved", created:it.age.since, resolved_at:"2026-08-04T09:30:00Z",
        history:[{ at:"2026-08-04T09:30:00Z", event:"resolved", actor:"m_dave" }] });
      return R({ ok:true, result:{ ok:true, id:it.id, status:"resolved", resolved_at:"2026-08-04T09:30:00Z" } });
    }
    if(op === "taskforward") return R({ ok:true, result:{ ok:true, id:body&&body.id, to:body&&body.to } });
    if(op === "memberlist")
      return R({ ok:true, result:{ members:[
        { member_id:"m_alice", handle:"alice", status:"active" },
        { member_id:"m_bob",   handle:"bob",   status:"active" } ] } });
    if(op === "queuemute"){
      const kinds = (body && body.kinds) || [];
      const CONDITION_KINDS = ["governor-holding-host", "partial-capture-outstanding",
                               "capture-completed-unattended"];
      /* The real fence is queuestate.mjs's, at the WRITE, and it is the single
         authority. The mock mirrors it so a surface that named the wrong kind
         gets the plane's own refusal here, exactly as it would live. */
      if(!state.lenientMute){
        const bad = kinds.find(k => !CONDITION_KINDS.includes(k));
        if(bad) return R({ ok:true, result:{ ok:false, reason:"KIND_NOT_PERSONAL", kind:bad,
          kind_class:"OBLIGATION", case:body.case,
          detail:"an obligation is something a named person must do for the record to proceed; it "
               + "leaves every list when it is RESOLVED, which is record state, not a preference." } });
      }
      state.muted.push({ case:body.case, kinds });
      /* Muting removes those kinds from this member's feed, and the plane REPORTS
         what it removed rather than answering quietly shorter. */
      const hit = state.items.filter(i => kinds.includes(i.kind)
        && (i.case.ancestors||[]).some(a => a.id === body.case));
      state.items = state.items.filter(i => !hit.includes(i));
      state.mute = { personal:true, cases:[body.case],
        suppressed: hit.map(i=>({ id:i.id, class:i.class, kind:i.kind, case:body.case })),
        suppressed_count: hit.length,
        detail:"muting is PERSONAL and dismissing is a RECORD ACT (D-125)." };
      return R({ ok:true, result:{ ok:true, member:"m_alice", case:body.case, muted_kinds:kinds } });
    }
    return NO({ ok:false, error:"unexpected op "+op });
  }
  return { CALLS, state, fetch };
}

/* ---------------- a DOM stub good enough for innerHTML inspection ---------- */
function makeCtx(plane){
  const els = new Map();
  const wired = [];
  function el(sel){
    const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
      value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
      querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
      remove(){}, onclick:null, _sel:sel };
    Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}});
    return e;
  }
  /* querySelectorAll over the painted HTML, good enough to find the data-*
     handles the surface wires — which is what lets the harness CLICK a Retry or
     a Mute rather than calling the function behind it. */
  function findAll(sel){
    const m = /^#q \[data-([a-z]+)\]$/.exec(sel) || /^\[data-([a-z]+)="([^"]*)"\]$/.exec(sel);
    if(!m) return [];
    const attr = m[1];
    const host = els.get("#q"); if(!host) return [];
    const out = [];
    for(const mm of host._html.matchAll(new RegExp(`data-${attr}="([^"]*)"`, "g"))){
      if(m[2] !== undefined && m[2] !== mm[1]) continue;
      const e = el(sel); e.dataset[attr] = mm[1];
      out.push(e); wired.push(e);
    }
    return out;
  }
  const doc = { querySelector:s=>{ if(!els.has(s)) els.set(s, el(s)); return els.get(s); },
    querySelectorAll:findAll, addEventListener(){}, documentElement:{setAttribute(){}},
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{appendChild(){}} };
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
    IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1},
    requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
    document:doc, location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:async(u,o)=>plane.fetch(u,o) };
  ctx.globalThis = ctx; vm.createContext(ctx);
  ctx.__els = els; ctx.__wired = wired;
  return ctx;
}

const EXPORTS = ";globalThis.__PLANE=PLANE;globalThis.__renderQueue=renderQueue;"
  + "globalThis.__queueRetry=queueRetry;globalThis.__queueMuteCase=queueMuteCase;"
  + "globalThis.__resolveTask=resolveTask;globalThis.__forwardTask=forwardTask;"
  + "globalThis.__queueRun=queueRun;globalThis.__FEEDS=QUEUE_FEEDS;globalThis.__RULE=QUEUE_ORDER_RULE;"
  + "globalThis.__mutableKinds=queueMutableKinds;globalThis.__order=queueOrder;"
  + "globalThis.__seen=()=>QUEUE_SEEN;globalThis.__go=go;";

const SRC = appScript();
function boot(plane, me){
  const ctx = makeCtx(plane);
  vm.runInContext(SRC + EXPORTS, ctx);
  ctx.__PLANE.session = true;
  ctx.__PLANE.me = me || { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };
  return ctx;
}
const q = ctx => ctx.__els.get("#q")._html;
/* Click a wired control by its data-* handle, the way a member would, so the
   harness exercises the WIRING and not only the function behind it. */
async function click(ctx, attr, value){
  const host = ctx.__els.get("#q");
  const hit = [...host._html.matchAll(new RegExp(`data-${attr}="([^"]*)"`, "g"))].map(m=>m[1]);
  if(!hit.includes(value)) throw new Error(`no control data-${attr}="${value}" on the painted queue`);
  if(attr === "retry") return ctx.__queueRetry(value);
  if(attr === "mute")  return ctx.__queueMuteCase(value);
  if(attr === "res")   return ctx.__resolveTask(value);
  throw new Error("unhandled control " + attr);
}

/* ================= (1) ONE surface, one contract, grouped by CASE ========= */
{
  const plane = makePlane({});
  const ctx = boot(plane);
  await ctx.__renderQueue();
  const html = q(ctx);

  ok("op=queue is the feed this surface reads", plane.CALLS.some(c=>c.op==="queue"));
  ok("op=tasks is read for what was answered, scoped to resolved",
     plane.CALLS.some(c=>c.op==="tasks" && c.params.status==="resolved"));
  ok("the three screens are gone: neither op=proposals nor op=instance is read any more",
     !plane.CALLS.some(c=>c.op==="proposals" || c.op==="instance"));

  /* clause (1): an OBLIGATION and an aggregated FINDING under ONE case */
  const inq = html.slice(html.indexOf('data-case="INQ-2026-0001"'));
  const inqEnd = inq.indexOf('<section class="q-case"', 1);
  const inqCase = inqEnd > 0 ? inq.slice(0, inqEnd) : inq;
  ok("the case group is named by its own title, not by its id alone", /Was the sewer fund misused\?/.test(inqCase));
  ok("an OBLIGATION and an aggregated FINDING sit under the SAME case",
     inqCase.includes('data-id="T-88"') && inqCase.includes('data-id="FINDING::procurement::solicitation"'));
  ok("both classes are named on their rows", /OBLIGATION/.test(inqCase) && /FINDING/.test(inqCase));
  ok("the kind is rendered from the producer's own token, not from a surface table",
     /Authority Undetermined/.test(inqCase) && /Missing Predecessor/.test(inqCase));
  ok("the item says what it is ON — the subject, which is a different thing from the case",
     inqCase.includes("on <span class=\"mono\">INFO-2026-0088"));
  ok("the item points at the act rather than replacing it", inqCase.includes('data-open="INFO-2026-0088"'));
  ok("the assignee sentence says the record routed it, not a person",
     /Yours &middot; assigned by the record, not by a person/.test(inqCase));
  ok("the instance count is the producer's and says one check is ONE item",
     /<b>3<\/b> instances of this one check, grouped as ONE item rather than 3/.test(inqCase));
  ok("the basis is the producer's own sentence, verbatim",
     inqCase.includes("an obligation is a routed task")
     && inqCase.includes("aggregated one per (progression, stage), graded the weakest instance and never averaged"));

  /* DEC-16: ONE event, N homes — the same obligation appears under BOTH cases */
  ok("the SAME event renders under BOTH of its ancestor cases",
     (html.match(/data-id="T-88"/g)||[]).length === 2);
  ok("and both homes are real cases the producer named",
     html.includes('data-case="INQ-2026-0001"') && html.includes('data-case="PROJ-2026-0001"'));

  /* options[] verbatim, and no surface-computed refusal (DEC-8) */
  const optLabels = [...inqCase.matchAll(/class="tbtn q-opt"[^>]*>([^<]*)</g)].map(m=>m[1]);
  ok("every option label is the PRODUCER'S, verbatim",
     optLabels.join("|") === "Release to verified|Cite into a question");
  ok("each option carries the producer's own RUNG, verbatim",
     /class="q-rung">reasoned</.test(inqCase) && /class="q-rung">reversible</.test(inqCase));
  ok("an item the record publishes no act on says so rather than offering one",
     /The record publishes no act on this item for this credential/.test(html));
  ok("no control anywhere is greyed — absent, never disabled (Q12)", !/disabled/.test(html));

  /* the C-14 primitive, reused and not re-implemented */
  ok("a derived finding's age is UNDETERMINED and rendered through the shared primitive",
     /class="card undet"/.test(inqCase) && /<b>basis<\/b>/.test(inqCase) && /<b>retry<\/b>/.test(inqCase));
  ok("its third line comes from the closed set of three, chosen by the producer's own reason",
     /There is nothing here to find; looking again will not change this\./.test(inqCase));
  ok("a determined age is stated in plain words, from the producer's own elapsed time",
     /waiting 15 days/.test(inqCase));

  /* clause (7): the ordering rule, STATED */
  ok("the ordering rule is STATED on the surface", html.includes(ctx.__RULE));
  ok("Q13: it says the longest-waiting comes first, and calls it the rule",
     /Within a class, the longest-waiting comes first\. That is the rule this list is ordered by/.test(html));
  ok("Q13: the word 'proxy' appears nowhere — it is the rule, not a stand-in", !/proxy/i.test(html));
  ok("Q13: the surface says it is not a stand-in for a priority the record does not compute",
     /The record computes no priority and this order is not a stand-in for one/.test(html));
  /* and it is the order actually applied */
  const older = { ...OB_LONE, id:"T-OLD", age:{ state:"determined", since:"2026-01-01T00:00:00Z", ms: 200*day } };
  const ordered = ctx.__order([OB_LONE, older, FINDING, COND_A]);
  ok("the order applied is the rule stated: class first (the producer's own order), then longest-waiting",
     ordered.map(i=>i.id).join(",") === "T-OLD,T-300,FINDING::procurement::solicitation,CONDITION::governor-holding-host::x");
  ok("an item whose age the record cannot derive sorts LAST within its class, never first",
     ctx.__order([FINDING, { ...FINDING, id:"F2", age:{ state:"determined", since:"x", ms: 5*day } }])
       .map(i=>i.id)[0] === "F2");

  /* clause (3): UNGROUPED, and never given an invented home */
  const un = html.slice(html.indexOf('data-case="__ungrouped__"'));
  ok("an item nothing rests on sits UNGROUPED, in its own named section", un.includes('data-id="T-300"'));
  ok("the ungrouped section says why there is no case rather than inventing one",
     /Nothing in the record rests on these yet, so there is no case to file them under/.test(un));
  ok("the ungrouped item is not filed under any real case",
     !html.slice(0, html.indexOf('data-case="__ungrouped__"')).includes('data-id="T-300"'));
  ok("an unassigned obligation is stated honestly, never addressed to a phantom",
     /No one is holding this\. It is shown as unassigned/.test(un));
  ok("the surface never prints 'unassigned' as if it were a member's name",
     !/With <b>unassigned<\/b>/.test(html));
}

/* ============= (2) DEC-36: an incomplete home set, and NOTHING else ======= */
{
  const plane = makePlane({ items:[OB_OUT_OF_VIEW] });
  const ctx = boot(plane);
  await ctx.__renderQueue();
  const html = q(ctx);
  ok("an item whose homes could not all be seen is not called ungrouped",
     !html.includes('data-case="__ungrouped__"') && html.includes('data-case="__unknown__"'));
  ok("the FACT of incompleteness is rendered",
     /Part of what this is filed under is not visible to this credential/.test(html));
  ok("DEC-36: no id of what was withheld appears", !/INQ-|PROJ-/.test(html));
  ok("DEC-36: no COUNT of what was withheld appears — the count is the leak",
     !/\b\d+\s+(cases?|others?|more|hidden|withheld)/i.test(html));
  ok("the section says the record could not finish rather than that there is nothing",
     /could not finish working out which cases these belong to/.test(html));
}

/* ====== (3) DEC-16: one resolution clears every home, and NAMES who ======= */
{
  const plane = makePlane({});
  const ctx = boot(plane);
  await ctx.__renderQueue();
  ok("before the resolution the event is live under BOTH cases",
     (q(ctx).match(/data-id="T-88"/g)||[]).length === 2);

  /* Somebody else resolves it. The surface re-reads; the plane's feed no longer
     carries it, and the resolutions feed names who answered it and when. */
  await click(ctx, "res", "T-88");
  const after = q(ctx);
  ok("the resolution went through op=taskresolve",
     plane.CALLS.some(c=>c.op==="taskresolve" && c.body && c.body.id==="T-88"));
  ok("the browser sends only the task id — the actor is the plane's to stamp",
     !("actor" in plane.CALLS.find(c=>c.op==="taskresolve").body));
  ok("after ONE resolution the obligation is a live item under NO case",
     !/class="q-item[^"]*" data-id="T-88"/.test(after));
  ok("the resolved obligation's id appears in no item row anywhere",
     !after.includes('<article class="q-item obligation" data-id="T-88"'));
  ok("the queue holds no live copy of a resolved event",
     (after.match(/<article[^>]*data-id="T-88"/g)||[]).length === 0);
  /* never a gap: the receipt renders under EVERY case it was filed under */
  ok("a receipt renders under BOTH ancestor cases — never a gap under either",
     (after.match(/data-notice="T-88"/g)||[]).length === 2);
  ok("the receipt NAMES the member who resolved it", /Resolved by m_dave/.test(after));
  ok("the receipt DATES it", /Resolved by m_dave on /.test(after));
  ok("the receipt says one resolution cleared every home, so the disappearance is explained",
     /One resolution clears an item from every case it was filed under/.test(after));
  ok("the receipt is a receipt and not an item — it offers no act",
     !/data-notice="T-88"[\s\S]{0,600}?data-res="T-88"/.test(after));
  ok("the second ancestor shows a receipt and not a live row",
     after.slice(after.indexOf('data-case="PROJ-2026-0001"')).includes('data-notice="T-88"')
     && !after.slice(after.indexOf('data-case="PROJ-2026-0001"')).includes('<article class="q-item obligation" data-id="T-88"'));
  ok("nothing else moved: the finding and the ungrouped obligation are untouched",
     after.includes('data-id="FINDING::procurement::solicitation"') && after.includes('data-id="T-300"'));
}

/* ============ (4) per-feed degradation: named, count-free, distinct ======= */
{
  /* the RESOLUTIONS feed fails while the queue answers */
  const plane = makePlane({ resFails:{ reason:"STORE_UNREACHABLE", detail:"the durable object did not answer" } });
  const ctx = boot(plane);
  await ctx.__renderQueue();
  const html = q(ctx);
  const panel = html.slice(html.indexOf('data-feed="resolutions"'),
                           html.indexOf("</div>", html.indexOf('data-feed="resolutions"')) + 6);
  ok("the failed feed is NAMED", /This feed failed: what was answered\./.test(panel));
  ok("the failed feed carries the PLANE'S OWN reason, verbatim",
     panel.includes("STORE_UNREACHABLE") && panel.includes("the durable object did not answer"));
  ok("a failed feed shows NO COUNT of any kind", /NO COUNT is shown for it rather than a wrong one/.test(panel));
  ok("the failed-feed panel carries no digit anywhere — not the other feed's count, not zero",
     !/\d/.test(panel.replace(/data-feed="[^"]*"/g, "")));
  ok("a failed feed names the plane's own reason and nothing more",
     !/could not|might|probably|perhaps/i.test(panel.replace(/the record could not answer/, "")));
  ok("the OTHER feed still answered and its items are shown — the two degrade independently",
     html.includes('data-id="T-88"'));
  ok("a failed feed offers a Retry", panel.includes('data-retry="resolutions"'));

  /* AN ABSENT OP IS A DIFFERENT FACT, and is never collapsed into a failure */
  const plane2 = makePlane({ resAbsent:true });
  const ctx2 = boot(plane2);
  await ctx2.__renderQueue();
  const html2 = q(ctx2);
  ok("an op that is not on this plane says exactly that", /This op is not on this plane\./.test(html2));
  ok("and it is NOT called a failure", !/This feed failed/.test(html2));
  ok("it says retrying would ask the same plane the same question, so no Retry is offered",
     /asking again asks the same plane the same question/.test(html2) && !/data-retry="resolutions"/.test(html2));
  ok("it shows no count either", /No count is shown for it/.test(html2));
  ok("the two treatments are DISTINCT strings — the old Proposals screen collapsed them",
     /This op is not on this plane/.test(html2) && !/This op is not on this plane/.test(html));
}

/* ================ (5) Retry re-runs ONLY the failed feed ================== */
{
  const plane = makePlane({ resFails:{ reason:"STORE_UNREACHABLE", detail:"the durable object did not answer" } });
  const ctx = boot(plane);
  await ctx.__renderQueue();
  const before = plane.CALLS.length;
  plane.state.resFails = null;                       // the transient failure clears
  await click(ctx, "retry", "resolutions");
  const during = plane.CALLS.slice(before);
  ok("Retry re-ran the failed feed", during.some(c=>c.op==="tasks"));
  ok("Retry did NOT re-run the feed that answered — a retry cannot change the half that was fine",
     !during.some(c=>c.op==="queue"));
  ok("exactly one read was made", during.length === 1);
  ok("after the retry the failure panel is gone", !/data-feed="resolutions"/.test(q(ctx)));
  ok("and the queue's own items are still there, unre-read", q(ctx).includes('data-id="T-88"'));
}

/* ============= (6) the all-clear is a claim, and is withheld ============== */
{
  /* every feed answered and every feed empty */
  const clear = makePlane({ items:[], resolved:[] });
  const ctxC = boot(clear);
  await ctxC.__renderQueue();
  ok("with every feed answered and every feed empty, the all-clear renders",
     /Nothing needs anybody right now\./.test(q(ctxC)));
  ok("the all-clear says it is itself a claim, and when it is withheld",
     /An all-clear is itself a claim, so it is withheld/.test(q(ctxC)));

  /* one feed still pending — the surface must not claim an all-clear */
  const hang = makePlane({ items:[], resHangs:true });
  const ctxH = boot(hang);
  ctxH.__renderQueue();                       // deliberately not awaited: one feed never settles
  for(let i=0;i<8;i++) await new Promise(r=>setImmediate(r));
  ok("with one feed still pending the all-clear is WITHHELD",
     !/Nothing needs anybody right now\./.test(q(ctxH)));
  ok("and the pending feed is named as not having answered, rather than shown as empty",
     /has not answered yet, so nothing is claimed about it/.test(q(ctxH)));

  /* one feed failed, the other empty — still no all-clear */
  const bad = makePlane({ items:[], queueFails:{ reason:"NO_CLASS", detail:"this producer refuses to emit a classless item" } });
  const ctxB = boot(bad);
  await ctxB.__renderQueue();
  ok("with one feed FAILED the all-clear is withheld even though the other was empty",
     !/Nothing needs anybody right now\./.test(q(ctxB)));
  ok("a store refusal inside a successful envelope is a FAILED feed, with the store's own reason",
     /This feed failed: the queue\./.test(q(ctxB)) && q(ctxB).includes("NO_CLASS")
     && q(ctxB).includes("this producer refuses to emit a classless item"));
}

/* ========= (7) the mute: on the ENTRY, reaching CONDITIONS only =========== */
{
  const plane = makePlane({});
  const ctx = boot(plane);
  await ctx.__renderQueue();
  const html = q(ctx);
  const proj = html.slice(html.indexOf('data-case="PROJ-2026-0001"'));

  ok("the mute control reads exactly 'Mute conditions on this case'",
     />Mute conditions on this case</.test(proj));
  ok("the mute control is on the CASE GROUP in the queue, not on an object's control strip",
     proj.indexOf('data-mute="PROJ-2026-0001"') < proj.indexOf('<article class="q-item'));
  ok("the mute control names CONDITION kinds and nothing else",
     ctx.__mutableKinds([OB_TWO, FINDING, COND_A, COND_B]).join(",")
       === "governor-holding-host,partial-capture-outstanding");
  ok("a case with no condition on it gets no mute control at all",
     !html.slice(html.indexOf('data-case="INQ-2026-0001"')).startsWith("x")
     && !/data-mute="INQ-2026-0001"/.test(html));
  ok("the control says what muting does NOT do — the record is unchanged, and an obligation still reaches you",
     /Muting changes nothing about the record and nothing for anybody else, and an obligation on this case still reaches you/.test(proj));

  await click(ctx, "mute", "PROJ-2026-0001");
  const muteCall = plane.CALLS.find(c=>c.op==="queuemute");
  ok("muting goes through op=queuemute with the case it was drawn on", !!muteCall && muteCall.body.case==="PROJ-2026-0001");
  ok("the mute request carries CONDITION kinds only",
     muteCall.body.kinds.join(",") === "governor-holding-host,partial-capture-outstanding");
  ok("the browser names no member — a mute is keyed to the session, server-side",
     !("member" in muteCall.body));
  const after = q(ctx);
  ok("both conditions are gone from this member's feed",
     !after.includes("CONDITION::governor-holding-host") && !after.includes("CONDITION::partial-capture-outstanding"));
  ok("an OBLIGATION on the muted case still reaches the member", after.includes('data-id="T-88"'));
  ok("and so does the FINDING", after.includes('data-id="FINDING::procurement::solicitation"'));
  ok("what was suppressed is REPORTED — the feed is never quietly shorter",
     /You muted 2 condition kinds \(governor-holding-host, partial-capture-outstanding\) on 1 case, so 2 items are not shown to you below/.test(after));
  ok("the report carries the plane's own sentence about what a mute is not",
     after.includes("muting is PERSONAL and dismissing is a RECORD ACT"));

  /* THE SURFACE'S OWN FENCE, tested against a plane that has none.
     REC-21 put the authoritative fence at the WRITE, in queuestate.mjs, and that
     is right: one authority. But a surface that would send an OBLIGATION kind
     given the chance is one refusal away from hiding a member's real work, and
     "the plane would have stopped me" is not a property of this file. So the
     control is drawn against a LENIENT plane — one that mutes whatever it is
     handed — and the obligation has to survive anyway. This is the clause
     negative control (c) breaks, and the reason it breaks into a harm rather
     than into a refusal. */
  const lax = makePlane({ lenientMute:true });
  const ctxL = boot(lax);
  await ctxL.__renderQueue();
  await ctxL.__queueMuteCase("PROJ-2026-0001");
  const laxCall = lax.CALLS.find(c=>c.op==="queuemute");
  ok("against a plane with NO fence, the surface still names CONDITION kinds only",
     laxCall.body.kinds.join(",") === "governor-holding-host,partial-capture-outstanding");
  ok("an OBLIGATION on a muted case still reaches the member, even when the plane would have hidden it",
     q(ctxL).includes('data-id="T-88"'));
  ok("and the FINDING survives too — a mute is not a way to clear the record's own questions",
     q(ctxL).includes('data-id="FINDING::procurement::solicitation"'));
  ok("what the lenient plane did hide is the two conditions, and it is reported",
     !q(ctxL).includes("CONDITION::governor-holding-host") && /2 items are not shown to you below/.test(q(ctxL)));

  /* THE PLANE'S REFUSAL IS RENDERED, and this surface composes none of its own */
  const p2 = makePlane({});
  const ctx2 = boot(p2);
  await ctx2.__renderQueue();
  await ctx2.__queueMuteCase("PROJ-2026-0001");     // fine
  const p3 = makePlane({});
  const ctx3 = boot(p3);
  await ctx3.__renderQueue();
  /* ask for something the fence forbids, the way a broken caller would */
  const r = await p3.fetch("https://plane.test/api/?op=queuemute",
    { method:"POST", body: JSON.stringify({ case:"PROJ-2026-0001", kinds:["authority-undetermined"] }) });
  const j = (await r.json()).result;
  ok("the PLANE is what refuses a non-condition kind, by name and with its class",
     j.ok === false && j.reason === "KIND_NOT_PERSONAL" && j.kind_class === "OBLIGATION");
  ok("and the surface has no refusal string of its own to render instead",
     !SRC.includes("KIND_NOT_PERSONAL"));
}

/* ============ (8) Q12 narration, and no refusal computed here ============= */
{
  const plane = makePlane({});
  const ro = boot(plane, { member:"m_vera", session:true, administer:false, capabilities:["view"] });
  await ro.__renderQueue();
  const html = q(ro);
  const SENT = "This credential can read this queue and cannot act on it.";
  ok("a read-only credential is told ONCE, at the surface, what its credential is", html.includes(SENT));
  ok("the sentence appears exactly once", (html.split(SENT).length - 1) === 1);
  ok("a read-only credential still sees the WHOLE queue", html.includes('data-id="T-88"') && html.includes('data-id="T-300"'));
  ok("no act control is offered to it at all — absent, not greyed",
     !/data-res=/.test(html) && !/data-fwd=/.test(html) && !/data-prop-adopt=/.test(html));
  ok("no control is narrated per-control", !/you (can|may) not|not permitted|insufficient/i.test(html));

  const acting = boot(plane);
  await acting.__renderQueue();
  ok("a credential that can act is told nothing about it", !q(acting).includes(SENT));
  ok("and it gets the two verbs on its own obligation",
     /data-fwd="T-88"/.test(q(acting)) && /data-res="T-88"/.test(q(acting)));
  /* DEC-8: the ownership refusal UI-1 computed itself is GONE, and its absence
     is the rule under test rather than an omission. */
  ok("DEC-8: the surface renders no ownership refusal of its own",
     !/isn't yours to resolve/i.test(q(acting)) && !SRC.includes("isn't yours to resolve"));
  ok("DEC-8: no refusal string on this surface was composed here",
     !SRC.includes("NO_SUCH_TASK") && !SRC.includes("MACHINE_CANNOT_RESOLVE"));
}

/* ===== (9) the three legacy routes still land on the one surface ========== */
{
  const plane = makePlane({});
  const ctx = boot(plane);
  for(const legacy of ["home", "tasks", "proposals", "queue"]){
    plane.CALLS.length = 0;
    await ctx.__go(legacy, true);
    ok(`the legacy route '${legacy}' still resolves, onto the ONE queue surface`,
       plane.CALLS.some(c=>c.op==="queue") && q(ctx).includes('data-id="T-88"'));
  }
  ok("the deleted screens' functions are gone from the source, not merely unreachable",
     !SRC.includes("function renderHome") && !SRC.includes("function renderTasks")
     && !SRC.includes("function renderProposals") && !SRC.includes("function loadProposals")
     && !SRC.includes("function proposalsFrom") && !SRC.includes("function proposalCardHtml"));
  ok("and the rail carries ONE entry where it carried three",
     !/id:"home"/.test(SRC) && !/id:"tasks"/.test(SRC) && !/id:"proposals"/.test(SRC)
     && /id:"queue"/.test(SRC));
}

/* ============ the vocabulary guard, over every page rendered ============== */
{
  const plane = makePlane({});
  const ctx = boot(plane);
  await ctx.__renderQueue();
  const html = q(ctx);
  for(const word of ["op=", "refers_to", "assignee_role", "proposalsFeed", "progression_instances",
                     "taskresolve", "taskforward", "queuemute", "muted_kinds", "queue_state",
                     "bundle_id", "grade_axis", "current_state="])
    ok(`the queue never says "${word}"`, !html.includes(word));
  /* D-160: the retired word means the OPPOSITE in SB-OUTPUT §5.1. */
  ok("the queue never uses the retired word for the boundary case",
     !new RegExp("susp"+"end", "i").test(html));
}

if(fails.length){ console.error(`queue: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`queue: ${n} assertions, all green — one surface over three, grouped by case, one event under two homes clearing everywhere with the resolver named, an ungrouped item, per-feed failure named and count-free, Retry scoped to the failed feed, the all-clear withheld, the ordering rule stated, and a mute that reaches conditions only`);
