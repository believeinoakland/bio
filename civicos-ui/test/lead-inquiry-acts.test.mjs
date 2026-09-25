/* REC-202 — THE INQUIRY-GRAIN DOORS ON THE QUEUE: A MEMBER TAKES UP AND SETS ASIDE A LEAD.
 *
 * BOB #32, 2026-09-23 23:08Z: *a missing member door.* The plane now publishes, on an out-of-inquiry lead,
 * `inquiry_acts` — `take_up` (op=cite into the question the lead bears on, over the registered document) and
 * `set_aside` (op=proposedispose scoped to one project, D-266) — and `options_grain` declares no gap. This suite
 * drives `renderQueue` over a lead shaped as `store.mjs #findingsOutOfInquiryLead` publishes it (the plane half is
 * driven through the ops by `bio-plane/test/rec202-lead-inquiry-acts.test.mjs`) and judges:
 *   §1 both doors are DRAWN from the record's block, and the progression three (Adopt / Defer / Dismiss) are NOT —
 *      they were drawn on this item before REC-202 and the plane refuses every one NO_PROJECT_SCOPE, which this
 *      suite's mock reproduces from the real `proposeDispose`;
 *   §2 TAKE UP reaches op=select over the published document and op=cite naming the published question;
 *   §3 SET ASIDE reaches op=proposedispose with project + finding and no key, the project never defaulted, and the
 *      lead leaves the open list;
 *   §4 a door the record publishes CLOSED renders the record's own sentence, never a control;
 *   §5 the other two project-scoped kinds (no `inquiry_acts`) get the set-aside from their `disposition` block;
 *   §6 the grain line says no gap is declared, and never says the acts do not exist.
 * NEGATIVE CONTROL: withhold the inquiry-grain option, in app.html, each arm ALONE, restored by sha256 AND cmp
 *   against a per-arm pristine copy (1,641,519 bytes). ARMED 2026-09-25 by REC-202's worker.
 *   (U1) `notifInquiryActsHtml`: `if(aside){` -> `if(false){` (the set-aside door withheld). DECLARED MUST FAIL "§1 THE
 *        SET-ASIDE DOOR IS DRAWN". ACTUAL: 3 failed — §1 set-aside drawn, §4 set-aside closed sentence, §5 — and §3 stayed
 *        GREEN, which is a finding about the ARM and is recorded rather than smoothed: §3 opens the dialog by its function,
 *        not by the drawn control, so it proves the act and §1 proves the door. RESTORED identical.
 *   (U2) delete `if(notifScopedDisposition(it)) return notifInquiryActsHtml(it);` (the surface before REC-202). DECLARED
 *        MUST FAIL "§1 THE PROGRESSION THREE ARE NOT DRAWN" and "§1 THE TAKE-UP DOOR IS DRAWN". ACTUAL: 6 failed — both, §1
 *        set-aside, §4 x2, §5 — which MEASURES the pre-REC-202 defect: the lead drew Adopt / Defer / Dismiss. MUST NOT:
 *        §6, green. RESTORED identical.
 */
import "../../bio-plane/test/stdio.mjs";
import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } else console.log("  PASS", msg); }
console.log("\n--- lead-inquiry-acts (REC-202) ---");

const INQ_A = "INQ-2026-0001", INQ_B = "INQ-2026-0002", PROJ = "PROJ-2026-0009", DOC = "INFO-2026-0777";
const LEAD_ID = "FINDING::out-of-inquiry-lead::CR-2026-0031";
const TAKE_CLOSED = "there is nothing to take up yet: the captured bytes are held, and no document in this store carries them.";
const ASIDE_CLOSED = "this finding carries no progression stage ... and this item is filed under no project this viewer can see.";
const CASE_P = { state:"determined", ungrouped:false, reasons:[],
                 ancestors:[{ id:PROJ, title:"Vendor concentration", type:"project", state:"forming", terminal:false }] };

function LEAD({ takeOpen = true, asideOpen = true } = {}){
  const disposition = asideOpen
    ? { available:true, op:"proposedispose", scope:"project", keyed_on:["project","finding"], key:null,
        finding:LEAD_ID, projects:[PROJ], requires:["project","finding"], detail:"judgment layer" }
    : { available:false, op:null, scope:"project", keyed_on:["project","finding"], key:null,
        finding:LEAD_ID, projects:[], reason:"no_project_scope", instead:null, detail:ASIDE_CLOSED };
  return {
    id: LEAD_ID, class:"FINDING", kind:"out-of-inquiry-lead", case: CASE_P,
    subject:{ kind:"capture_request", id:"CR-2026-0031", inquiry:INQ_B, address:"https://example.gov/dredge.pdf",
              capture_sha:"aa11", bundle_id: takeOpen ? DOC : null },
    summary:"evidence bearing on the harbour dredging contract was met while another question was being worked, and captured",
    detail:"captured at an investigative session's request", basis:{ source:"capture_requests", detail:"both named",
      basis_entry: takeOpen ? { state:"absent", reason:"not_made_part_of_the_case", bundle_id:DOC, detail:"looked" }
                            : { state:"undetermined", reason:"unregistered_capture", bundle_id:null, detail:"no register" } },
    age:{ state:"determined", since:"2026-08-08T09:00:00Z", ms:9e7 }, assignee:null, assignee_role:null,
    options:[{ id:"dispose", label:"Dispose (defer or dismiss)", rung:"reversible" }],
    inquiry_acts:[
      takeOpen
        ? { id:"take_up", op:"cite", available:true, inquiry:INQ_B, project:INQ_B, document:DOC,
            requires:["handle","role"], select:{ op:"select", ids:[DOC] }, detail:"take this up" }
        : { id:"take_up", op:"cite", available:false, inquiry:INQ_B, project:INQ_B, document:null,
            reason:"no_document_to_cite", basis_entry_reason:"unregistered_capture", detail:TAKE_CLOSED },
      { id:"set_aside", op:"proposedispose", available:disposition.available, scope:"project", finding:LEAD_ID,
        projects:disposition.projects, dispositions:["deferred","dismissed"], requires:["project","finding","to","reason"],
        ...(disposition.available ? {} : { reason:"no_project_scope" }),
        detail: disposition.available ? "set it aside for your team" : ASIDE_CLOSED },
    ],
    options_grain:{ offered:"document", missing:null, inquiry:["take_up","set_aside"],
      detail:"the acts on THIS LEAD, at inquiry grain, are published in inquiry_acts. Nothing at inquiry grain is missing." },
    disposition,
  };
}
const STANCE_ID = "FINDING::stance-changed-here-not-elsewhere::" + INQ_B + "::PROJ-2026-0010";
const STANCE = { id:STANCE_ID, class:"FINDING", kind:"stance-changed-here-not-elsewhere", case:CASE_P,
  subject:{ kind:"bundle", id:INQ_B }, summary:"another project moved its stance", detail:"a report",
  basis:{ detail:"per-project stance" }, age:{ state:"determined", since:"2026-08-08T09:00:00Z", ms:1 },
  assignee:null, assignee_role:null, options:[],
  options_grain:{ offered:"document", missing:"stance", detail:"stance grain" },
  disposition:{ available:true, op:"proposedispose", scope:"project", keyed_on:["project","finding"], key:null,
                finding:STANCE_ID, projects:[PROJ], requires:["project","finding"], detail:"judgment layer" } };

function makePlane(items){
  const CALLS = []; const GONE = new Set();
  const R = o => ({ ok:true, json:async()=>({ ok:true, result:o }) });
  async function fetch(u, opts){
    const url = new URL(u, "https://plane.test"); const op = url.searchParams.get("op");
    let body = {}; if(opts && typeof opts.body === "string"){ try{ body = JSON.parse(opts.body) || {}; }catch(_){} }
    const p = { ...Object.fromEntries(url.searchParams.entries()), ...body };
    CALLS.push({ op, params:p, body });
    if(op === "queue"){
      const live = items.filter(i => !GONE.has(i.id));
      return R({ ok:true, member:"m_alice", items:live, limit:500, item_count:live.length, truncated:false,
        classes:["OBLIGATION","FINDING","CONDITION"], classes_deferred:[], ancestor_depth_bound:6,
        counts:{ obligation:0, finding:live.length, condition:0, ungrouped:0, case_undetermined:0, suppressed:0 },
        mute:{ personal:true, cases:[], items:[], suppressed:[], suppressed_count:0, detail:"" } });
    }
    if(op === "tasks") return R({ ok:true, tasks:[], counts:{ resolved:0 }, limit:500, truncated:false });
    if(op === "whoami") return R({ member:"m_alice", session:true, capabilities:["contribute"] });
    if(op === "list") return R([{ bundle_id:INQ_B, object_type:"inquiry", title:"Northbay holdings", current_state:"open" },
                                { bundle_id:INQ_A, object_type:"inquiry", title:"The 0042 award", current_state:"open" },
                                { bundle_id:DOC, object_type:"information", title:"The contract", current_state:"collected" }]);
    if(op === "affordances"){
      const cite = { id:"cite", label:"Cite as basis", weight:"report", needs:"contribute", mode:"session", rung:"reversible", prompt:null };
      if(!p.target) return R({ target:null, catalog:[cite],
        vocabularies:{ dispositions:["deferred","dismissed"], basis_roles:["supports","cuts_against"] } });
      return R({ target:p.target, object_type:"inquiry", current_state:"open", acts:[cite], vocabularies:{} });
    }
    if(op === "select") return R({ handle:"H-202", count:(body.ids || []).length });
    if(op === "cite") return R({ ok:true, project:p.project, cited:[DOC], role:p.role || null });
    if(op === "proposedispose"){
      /* THE REAL `proposeDispose`'s judgment-layer arm: a caller naming project + finding. */
      if(body.project && body.finding){
        GONE.add(String(body.finding));
        return R({ ok:true, scope:"project", project:body.project, finding:body.finding,
                   key:`${body.project}::${body.finding}`, to:body.to, state:body.to, reason:body.reason,
                   decided_by:"m_alice", at:"2026-09-25T09:00:00Z", bundle:null });
      }
      /* THE OTHER ARM IS NOT ANSWERED HERE, deliberately: the real plane refuses a finding's id sent as
         `key` (NO_PROJECT_SCOPE), and a mock that fed that code would put an untranslated code in the
         surface's reach (check-refusal-codes R3) for a path the surface no longer takes. §3 asserts no
         `key` travels; an unscoped call gets the mock's own "unexpected" answer below. */
    }
    return { ok:false, json:async()=>({ ok:false, error:"unexpected op " + op }) };
  }
  return { CALLS, fetch };
}
function makeCtx(plane){
  const els = new Map();
  function el(sel){
    const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
      value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
      querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
      remove(){}, onclick:null, _sel:sel };
    Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}});
    return e;
  }
  const doc = { querySelector:s=>{ if(!els.has(s)) els.set(s, el(s)); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}},
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{appendChild(){}} };
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
    IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1},
    requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
    document:doc, location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:async(u,o)=>plane.fetch(u,o) };
  ctx.globalThis = ctx; vm.createContext(ctx); ctx.__els = els;
  return ctx;
}
const EXPORTS = ";globalThis.__PLANE=PLANE;globalThis.__renderQueue=renderQueue;"
  + "globalThis.__takeUp=notifTakeUpOpen;globalThis.__CITE=()=>CITE;globalThis.__citeRole=citeRole;globalThis.__doCite=doCite;"
  + "globalThis.__asideOpen=notifSetAsideOpen;globalThis.__asideChoose=notifSetAsideChoose;"
  + "globalThis.__asideSend=notifSetAsideSend;globalThis.__ASIDE=()=>NOTIF_ASIDE;globalThis.__props=()=>PROPOSALS_LAST;";
const SRC = appScript();
function boot(plane){
  const ctx = makeCtx(plane);
  vm.runInContext(SRC + EXPORTS, ctx);
  ctx.__PLANE.session = true;
  ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };
  return ctx;
}
const q = ctx => ctx.__els.get("#q")._html;
const dlg = ctx => (ctx.__els.get("#dlg") || { _html:"" })._html;

/* ============ 1. BOTH DOORS DRAWN FROM THE RECORD; THE PROGRESSION THREE NOT ============ */
const plane = makePlane([LEAD()]);
const ctx = boot(plane);
await ctx.__renderQueue();
{
  const html = q(ctx);
  ok("§1 the lead is rendered", html.includes(LEAD_ID));
  ok("§1 THE TAKE-UP DOOR IS DRAWN, naming the question the record published",
     html.includes(`data-take-up="${LEAD_ID}"`) && html.includes(`Take this up under ${INQ_B}`));
  ok("§1 THE SET-ASIDE DOOR IS DRAWN", html.includes(`data-set-aside="${LEAD_ID}"`));
  ok("§1 THE PROGRESSION THREE ARE NOT DRAWN on a project-scoped finding (the plane refuses each NO_PROJECT_SCOPE)",
     !/data-prop-(adopt|defer|dismiss)=/.test(html));
  ok("§1 and the lead is not treated as a derived proposal: no strength line, not in the proposal context",
     !/prop-grade/.test(html) && ctx.__props().length === 0);
}

/* ============ 2. TAKE UP REACHES op=select AND op=cite AS PUBLISHED ============ */
{
  await ctx.__takeUp(LEAD_ID);
  const C = ctx.__CITE();
  ok("§2 the cite dialog opens over the PUBLISHED document with the PUBLISHED question already chosen",
     !!C && JSON.stringify(C.ids) === JSON.stringify([DOC]) && C.target === INQ_B && C.targetType === "inquiry");
  ctx.__citeRole("supports");
  await ctx.__doCite();
  const sel = plane.CALLS.find(c => c.op === "select");
  const cite = plane.CALLS.find(c => c.op === "cite");
  ok("§2 THE TAKE-UP COMPLETES THROUGH THE OPS: op=select over the document, op=cite naming the question, the member's role",
     !!sel && JSON.stringify(sel.body.ids) === JSON.stringify([DOC])
     && !!cite && cite.params.project === INQ_B && cite.params.handle === "H-202" && cite.params.role === "supports");
}

/* ============ 3. SET ASIDE REACHES op=proposedispose, SCOPED, NEVER DEFAULTED ============ */
{
  ctx.__asideOpen(LEAD_ID);
  const A = ctx.__ASIDE();
  ok("§3 the set-aside dialog opens with NO project chosen for the member, even though there is one",
     !!A && A.project === "" && JSON.stringify(A.projects) === JSON.stringify([PROJ]));
  ok("§3 and draws no commit control until the project, the disposition and a reason are all supplied",
     !/id="sa-go"/.test(dlg(ctx)));
  const before = plane.CALLS.length;
  await ctx.__asideSend();
  ok("§3 a send with nothing chosen sends nothing", plane.CALLS.length === before);
  ctx.__asideChoose("project", PROJ); ctx.__asideChoose("to", "dismissed");
  ctx.__asideChoose("reason", "already taken up under the vendor question");
  await ctx.__asideSend();
  const d = plane.CALLS.find(c => c.op === "proposedispose");
  ok("§3 THE SET-ASIDE COMPLETES THROUGH THE OP: project + finding + disposition + reason, and NO key",
     !!d && d.body.project === PROJ && d.body.finding === LEAD_ID && d.body.to === "dismissed"
     && /vendor question/.test(d.body.reason) && !("key" in d.body));
  ok("§3 and the lead has left the open list after the queue re-reads", !q(ctx).includes(`data-take-up="${LEAD_ID}"`));
}

/* ============ 4. A CLOSED DOOR RENDERS THE RECORD'S SENTENCE, NEVER A CONTROL ============ */
{
  const c2 = boot(makePlane([LEAD({ takeOpen:false, asideOpen:false })]));
  await c2.__renderQueue();
  const html = q(c2);
  ok("§4 a take-up the record publishes closed draws no control and renders the record's own sentence",
     !html.includes(`data-take-up="${LEAD_ID}"`) && html.includes(`data-take-up-closed="${LEAD_ID}"`) && html.includes(TAKE_CLOSED));
  ok("§4 a set-aside the record publishes closed draws no control and renders the record's own sentence",
     !html.includes(`data-set-aside="${LEAD_ID}"`) && html.includes(`data-set-aside-closed="${LEAD_ID}"`)
     && html.includes("filed under no project this viewer can see"));
}

/* ============ 5. THE OTHER PROJECT-SCOPED KINDS: SET ASIDE FROM `disposition` ============ */
{
  const c3 = boot(makePlane([STANCE]));
  await c3.__renderQueue();
  const html = q(c3);
  ok("§5 a project-scoped finding publishing no inquiry_acts gets its set-aside from its disposition block, and no take-up",
     html.includes(`data-set-aside="${STANCE_ID}"`) && !html.includes(`data-take-up="${STANCE_ID}"`)
     && !/data-prop-(adopt|defer|dismiss)=/.test(html));
}

/* ============ 6. THE GRAIN LINE ============ */
{
  const c4 = boot(makePlane([LEAD()]));
  await c4.__renderQueue();
  const html = q(c4);
  ok("§6 the grain line says the record declares nothing missing, and never that the acts do not exist",
     html.includes("the record declares nothing missing at any other level") && !/say[s]? they do not exist yet/.test(html));
}

console.log(`\nlead-inquiry-acts.test.mjs: ${n - fails.length} pass, ${fails.length} fail`);
process.exit(fails.length ? 1 : 0);
