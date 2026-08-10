/* UI-45 — NOTIFICATIONS RENDERED: THE FINDING CLASS IN THE PLANE'S OWN WORDS,
 * THE ABSENCE THAT SAYS WHICH LEVEL WAS EMPTY, AND WHAT A PROJECT STANDS ON.
 *
 * Drives `renderQueue` over a mock `op=queue` carrying every shape this item is
 * judged on, and `stanceOpen` / `stanceSend` over a mock `op=basisversions` +
 * `op=affordances` + `op=versioncurrent`. Every answer is WRAPPED,
 * `{ok:true, result:…}`, which is what the plane's generic passthrough does and
 * what `check-mock-envelope.mjs` re-checks at runtime.
 *
 * WHAT THE ITEM IS JUDGED ON, clause by clause:
 *
 *   (1) EACH SLUG RENDERED FROM THE PLANE'S PUBLISHED WORDING. §1 below asserts
 *       the producer's own `summary`, `detail`, `basis.detail`,
 *       `basis_entry.detail` and `options_grain.detail` reach the page VERBATIM.
 *       That is the accepts-when, and the item's first negative control is its
 *       inverse (author a sentence about a slug on the surface → the verbatim
 *       arms fail).
 *   (2) THE OUT-OF-INQUIRY LEAD WITH ITS `options[]` — and with the two things
 *       PL-15's delegation says a surface must not paper over: `options_grain`
 *       (the acts a member wants are at inquiry grain and do not exist, D-222)
 *       and `basis_entry`, THREE-VALUED, where collapsing `undetermined` into
 *       `absent` is the overclaim the plane refused to make.
 *   (3) SUGGESTION KINDS LOOK DERIVED (D-82), AGGREGATE (the plane's `basis.n`,
 *       never a count this browser did) AND AGE RATHER THAN VANISH (§6.4): a
 *       disposed proposal leaves the OPEN list and the record's own account of
 *       where it went stays on the screen.
 *   (4) WHICH LEVEL WAS EMPTY. `op=queue` publishes `classes`,
 *       `classes_deferred` and `counts`; §4 drives all three states — a class
 *       nothing produces yet (we did not look), a class that looked and raised
 *       none (nothing happened), and a class the record published no count for
 *       (a third fact, said as one rather than shown as zero).
 *   (5) `current` — UI-42's DELEGATED HALF. `op=basisversions` publishes it only
 *       when a project is named; §5 drives the field PRESENT, the field NULL
 *       (which collapses three situations on purpose, and the surface says which
 *       three) and the field ABSENT, and hosts `op=versioncurrent`.
 *   (6) DEC-32 CLAUSE 1 / D-226 — NOT ONE ANALYST WORD ON ANY SURFACE THIS ITEM
 *       RENDERS. A SWEEP over every phase, with the fixture deliberately
 *       carrying the banned words in a place a careless renderer would print.
 *
 * ---- THE TWO SLUGS THIS ITEM'S ROW NAMES AND THIS SURFACE DOES NOT RENDER
 *
 * `IS-BUILD-PLAN.md`'s UI-45 row names `stance-changed-here-not-elsewhere` and
 * `new-version-arrived-from-another-team`. **They are PL-13's to mint, PL-13 has
 * not landed, and `queuestate.mjs` names neither.** §0 asserts their ABSENCE
 * from the imported catalogue, so nobody reads a quiet screen as evidence they
 * exist — and so that the day PL-13 lands, THIS ARM FAILS and the next session
 * surfaces them rather than discovering the gap later. An absence asserted is a
 * gap with an alarm on it; an absence noted in a comment is a gap.
 *
 * ---- WHAT THIS SUITE CAN AND CANNOT SEE, stated plainly
 *
 *   IT CAN see every string these surfaces render in every phase it drives, and
 *     it drives eleven (the sweep asserts its own corpus size and floors it).
 *   IT CAN see the kind catalogue, because it IMPORTS `queuestate.mjs` rather
 *     than copying it — a hand copy agrees with its source for free.
 *   IT CANNOT see a phase it never drives, or a producer that does not exist:
 *     every FINDING kind here is one the plane has a live producer for, and the
 *     unbuilt ones are asserted absent rather than fixtured into existence.
 *   IT CANNOT judge whether the plane's answer is right. That `op=queue` files a
 *     lead under inquiry B's ancestors is PL-15's acceptance; this suite asserts
 *     only that the SURFACE renders what arrived and invents nothing.
 *   IT CANNOT see a browser event. The DOM stub fires none, so the router is
 *     driven directly at the current address — the honest substitute, and it is
 *     labelled as one here the way UI-42's is in its own file.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/notifications.control.mjs` — eight
 * arms, each armed ALONE on the real `civicos-ui/app.html` with every other
 * defence held open, including two OVER-STRICTNESS arms and a BASELINE row.
 * Declared expectations and measured results are in that file's header.
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";
/* UI-53: the DEC-32 clause 1 ban family is DERIVED IN ONE PLACE and this suite
   CONSUMES it, rather than hand-writing a rival copy. See
   `analyst-vocabulary.mjs` for what it is derived from and what it cannot see. */
import { analystHits, reachLine } from "./analyst-vocabulary.mjs";
import { QUEUE_FINDING_KINDS, QUEUE_CONDITION_KINDS, QUEUE_OBLIGATION_KINDS,
         classOfKind } from "../../bio-plane/src/queuestate.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

console.log("\n--- notifications (UI-45 / PL-15 / D-213 / §6.4 / §7) ---");

/* ============================ THE FIXTURE ============================
   EVERY VALUE IS FIXED. Nothing is drawn at runtime — not a date, not an id,
   not a count. Two fixtures in this directory have been refused by a plane
   check that did not exist when they were written, both because they generated
   a value instead of stating one. */
const INQ_A = "INQ-2026-0001";      // the question a run was working
const INQ_B = "INQ-2026-0002";      // the question the lead bears on
const PROJ  = "PROJ-2026-0009";

/* THE PLANE'S OWN SENTENCES. Each of these is the shape `store.mjs` publishes,
   and each is asserted VERBATIM on the page below. They are DISTINCTIVE on
   purpose: a surface that summarised instead of rendering would not reproduce
   them by accident. */
const LEAD_SUMMARY = "evidence bearing on the harbour dredging contract was met while another question was being worked, and captured";
const LEAD_DETAIL  = "https://example.gov/dredge.pdf was captured at an investigative session's request while it was working "
  + INQ_A + ", because it bears on " + INQ_B + ". The act is the daemon's, performed at the session's request. "
  + "The document is IN THE STORE and is part of NO claim.";
const LEAD_BASIS_DETAIL = "BOTH PRINCIPALS ARE NAMED and BOTH QUESTIONS ARE NAMED: the act is the daemon's, performed at the session's request.";
const GRAIN_DETAIL = "the acts offered are the ones this record can actually perform on the question this lead is filed under. "
  + "The acts a member would most naturally want here are at INQUIRY grain and they do not exist yet.";
const ABSENT_DETAIL = "LOOKED FOR AND NOT THERE, which is the point of this item rather than an omission.";
const UNDET_DETAIL  = "no register entry answers to this capture, so the bytes are not attached to a document this store can name.";
const PRESENT_DETAIL = "this document IS carried by a reading of some question, so the lead has already been acted on.";
const DERIVED_BASIS_DETAIL = "a finding is DERIVED: the record's own question, aggregated one per (progression, stage), graded the weakest instance and never averaged.";

/* THE ANCESTOR ROW every item is filed under. The lead's home is inquiry B's,
   which is PL-15's whole point and is reproduced here so the surface is judged
   against the answer it will really get. */
const CASE_B = { state:"determined", ungrouped:false, reasons:[],
                 ancestors:[{ id:INQ_B, title:"The harbour dredging contract", type:"inquiry", state:"open", terminal:false }] };
const CASE_A = { state:"determined", ungrouped:false, reasons:[],
                 ancestors:[{ id:INQ_A, title:"The marina fund", type:"inquiry", state:"open", terminal:false }] };

/* THE OUT-OF-INQUIRY LEAD. `basis_entry.state` is a parameter so §2 can drive
   all three values through ONE producer shape rather than three fixtures that
   could drift apart. */
function LEAD(entryState){
  const entry = entryState === "undetermined"
    ? { state:"undetermined", reason:"unregistered_capture", bundle_id:null, bundle_state:null,
        basis_legs:null, version_legs:null, detail:UNDET_DETAIL }
    : entryState === "present"
    ? { state:"present", reason:"carried_by_a_reading", bundle_id:"INFO-2026-0777", bundle_state:"collected",
        basis_legs:1, version_legs:0, detail:PRESENT_DETAIL }
    : { state:"absent", reason:"not_made_part_of_the_case", bundle_id:"INFO-2026-0777",
        bundle_state:"collected", basis_legs:0, version_legs:0, detail:ABSENT_DETAIL };
  return {
    id: "FINDING::out-of-inquiry-lead::CR-2026-0031",
    class: "FINDING",
    kind: "out-of-inquiry-lead",
    case: CASE_B,
    subject: { kind:"capture_request", id:"CR-2026-0031", inquiry:INQ_B,
               address:"https://example.gov/dredge.pdf", capture_sha:"aa11", bundle_id:entry.bundle_id },
    summary: LEAD_SUMMARY,
    detail: LEAD_DETAIL,
    basis: { source:"capture_requests", request:"CR-2026-0031", run:"AIS-1",
             found_while_working:INQ_A, bears_on:INQ_B,
             address:"https://example.gov/dredge.pdf", basis_entry: entry,
             detail: LEAD_BASIS_DETAIL },
    age: { state:"determined", since:"2026-08-08T09:00:00Z", ms: 90000000 },
    assignee: null, assignee_role: null,
    options: [{ id:"cite", label:"Cite this document as a reason", rung:"reversible" }],
    options_grain: { offered:"document", missing:"inquiry", detail: GRAIN_DETAIL },
  };
}

/* THE DERIVED PROPOSAL — the finding op=proposedispose CAN be keyed on, and the
   only kind of finding for which the three controls are drawn. Its basis
   carries the aggregation (`n`) the plane did, which §3 asserts is the RECORD'S
   count and not one this browser made. */
const PROPOSAL = {
  id: "FINDING::procurement::solicitation",
  class: "FINDING",
  kind: "missing_predecessor",
  case: CASE_A,
  subject: { kind:"progression_stage", id:null, progression_key:"procurement",
             stage_key:"solicitation", bundles:["INFO-2026-0100"] },
  summary: "Procurement: the 'solicitation' stage is always required and absent",
  detail: "4 instances of this progression reach 'solicitation' without it",
  basis: { source:"proposalsFeed", progression_key:"procurement", stage_key:"solicitation",
           n:4, grade:"C", grade_determined:true, overdue_count:1, surfaced_by:"machine",
           detail: DERIVED_BASIS_DETAIL },
  age: { state:"undetermined", reason:"derived_on_read",
         detail:"a derived finding is recomputed at read time and has no creation instant" },
  assignee: null, assignee_role: null,
  options: [],
};

/* THE CONDITION — PL-4's capture completion, the one the item's row calls
   "capture-complete". It is here so §3's mute arm has a real CONDITION kind to
   find and so the class walk is not judged over findings alone. */
const CONDITION = {
  id: "CONDITION::capture-completed-unattended::CR-2026-0031",
  class: "CONDITION",
  kind: "capture-completed-unattended",
  case: CASE_A,
  subject: { kind:"capture_request", id:"CR-2026-0031" },
  summary: "https://example.gov/dredge.pdf was captured by the daemon at the investigative session's request",
  detail: "The capture is an entry of a document to the store and NOT an entry of that document into the leg of a claim.",
  basis: { source:"capture_requests", request:"CR-2026-0031",
           detail:"BOTH PRINCIPALS ARE NAMED: the act is the daemon's, performed at the session's request." },
  age: { state:"determined", since:"2026-08-08T09:00:00Z", ms: 90000000 },
  assignee: null, assignee_role: null,
  options: [],
};

/* THE VERSIONS. `LEAKY_LABEL` is UI-42's technique and its reason is the same:
   the record's own filing name for a set of reasons is member-authored, and this
   one is written to carry three of the words DEC-32 clause 1 forbids. If any
   surface this item renders ever printed a label, §6's sweep fails on it. */
const LEAKY_LABEL = "OR-branch: the ground partition";
const V_ACCEPTED = {
  name:"second-reading", description:"The fund paid for the marina through the harbour authority.",
  relationship:"or", grounds:[LEAKY_LABEL,"set-a"], state:"accepted", derived_from:null,
  hidden:false, claim:null, run:"AIS-1", author:"m_alice", at:"2026-08-08T09:00:00Z",
  moved:{ by:"m_alice", at:"2026-08-08T10:00:00Z", reason:null }, regroup:null, composition:null,
  leg_count:2, legs_complete:true,
  legs:[{ ord:0, target_id:"INFO-2026-0100", target_type:"information", role:"supports", grade:"A",
          grade_axis:"capture", grade_source:"resolution", note:null, at:"2026-08-08T09:00:00Z", ground:"set-a" },
        { ord:1, target_id:"INFO-2026-0300", target_type:"information", role:"supports", grade:"B",
          grade_axis:"connection", grade_source:"inherited", note:null, at:"2026-08-08T09:00:00Z", ground:LEAKY_LABEL }],
};
const V_SUGGESTED = {
  name:"first-reading", description:"The fund paid for the marina directly.",
  relationship:"and", grounds:["set-a"], state:"suggested", derived_from:null,
  hidden:false, claim:null, run:null, author:"m_alice", at:"2026-08-07T09:00:00Z",
  moved:null, regroup:null, composition:null, leg_count:1, legs_complete:true,
  legs:[{ ord:0, target_id:"INFO-2026-0100", target_type:"information", role:"supports", grade:"A",
          grade_axis:"capture", grade_source:"resolution", note:null, at:"2026-08-07T09:00:00Z", ground:"set-a" }],
};

/* =================== 0. THE CATALOGUE, IMPORTED NOT COPIED =================== */
{
  ok("the kind catalogue was IMPORTED and is non-empty — an empty import would make every arm below vacuous",
     Object.keys(QUEUE_FINDING_KINDS).length >= 10
     && Object.keys(QUEUE_CONDITION_KINDS).length >= 5
     && Object.keys(QUEUE_OBLIGATION_KINDS).length >= 3);
  ok("every kind this suite fixtures is one the plane's own catalogue names — a fixture inventing a kind would be testing a producer that does not exist",
     classOfKind(LEAD(null).kind) === "FINDING"
     && classOfKind(PROPOSAL.kind) === "FINDING"
     && classOfKind(CONDITION.kind) === "CONDITION");
  /* CORRECTED 2026-08-09 (PL-13), NEVER EXEMPTED — and the alarm did exactly
     what UI-45 built it to do.

     THIS ARM READ: *PL-13's two slugs are NOT in the plane's catalogue.* That
     was TRUE when UI-45 landed and it is now FALSE. PL-13 minted
     `stance-changed-here-not-elsewhere` and `new-version-arrived-from-another-
     team` in `queuestate.mjs`, each with a real producer in `store.mjs`
     (`#findingsStanceDiverged`, `#findingsVersionFromAnotherTeam`), driven by
     `bio-plane/test/current.test.mjs`. UI-45's delegation predicted this exact
     failure and asked for the assertion to be corrected rather than deleted:
     *when PL-13 lands, that arm FAILS, and the next session surfaces them
     instead of discovering the gap a wave later.*

     WHY THE OLD ASSERTION WAS RIGHT AND IS NOW WRONG. It was never a claim that
     the slugs should not exist — it was UI-45's own negative control, performed
     deliberately: authoring member-facing words for a slug the plane does not
     publish is the DEC-8 drift class, so the honest surface for an unbuilt
     producer is silence WITH AN ALARM ON IT. The producer exists now, so the
     defect the arm guarded against is no longer possible and the arm has to say
     something else.

     WHAT IT SAYS INSTEAD, and it is the same property one turn on: both slugs
     are in the IMPORTED catalogue, both are FINDING, and — the part that
     matters for THIS surface — **neither carries member-facing wording written
     here.** The queue renders a FINDING from the producer's own `summary`,
     `detail` and `basis.detail`, so a new kind under an existing class arrives
     rendered with no renderer of its own; that is what UI-45's delegation
     promised the next session would find. This file authors no string for
     either slug and that absence is what is now asserted. */
  const PL13 = ["stance-changed-here-not-elsewhere", "new-version-arrived-from-another-team"];
  ok("PL-13's two slugs are now IN the plane's catalogue and are FINDING — the arm that asserted "
     + "their ABSENCE fired the day PL-13 landed, exactly as UI-45 built it to, and is CORRECTED "
     + "here rather than exempted: found ["
     + PL13.filter(k => classOfKind(k) !== null).join(", ") + "]",
     PL13.every(k => classOfKind(k) === "FINDING"));
  const APP_SRC = fs.readFileSync(new URL("../app.html", import.meta.url).pathname, "utf8");
  ok("and this SURFACE still authors no words for either — the queue renders a FINDING from the "
     + "producer's own summary and detail, so a new kind under an existing class arrives rendered, "
     + "and a string written here would be the DEC-8 drift UI-45's control was pointed at. Read "
     + "over the WHOLE of app.html rather than over one region, because a wording table added "
     + "anywhere in the file is the same defect",
     PL13.every(k => !APP_SRC.includes(`"${k}"`) && !APP_SRC.includes(`'${k}'`)));
}

/* ============================ THE MOCK PLANE ============================ */
function makePlane(cfg){
  const CALLS = [];
  const R = o => ({ ok:true, json:async()=>({ ok:true, result:o }) });
  const DISPOSED = new Set();
  /* THE BODY IS READ, NOT ONLY THE QUERY. `op=proposedispose` is a POST and its
     key, disposition and reason travel in the JSON body — a mock reading only
     `searchParams` would receive three undefineds and answer happily, which is
     an arm asserting nothing. PL-15's control found exactly that shape one
     repository over (an arm filtering on a field the op did not publish, which
     counted zero for every input), so the fields are merged and the recorded
     call carries both halves. */
  async function fetchLike(u, opts){
    const url = new URL(u, "https://plane.test");
    const op = url.searchParams.get("op");
    let body = {};
    if(opts && typeof opts.body === "string"){
      try{ body = JSON.parse(opts.body) || {}; }catch(_){ body = {}; }
    }
    const p = { ...Object.fromEntries(url.searchParams.entries()), ...body };
    CALLS.push({ op, params:p });
    if(op === "queue"){
      if(cfg.queueFails) return { ok:false, json:async()=>({ ok:false, error:"boom" }) };
      const items = (cfg.items || []).filter(i => !DISPOSED.has(String(i.id).replace(/^FINDING::/, "")));
      const answer = {
        ok:true, member:"m_alice", items,
        limit:500, item_count:items.length, truncated:false,
        classes: cfg.classes || ["OBLIGATION","FINDING","CONDITION"],
        classes_deferred: cfg.classesDeferred || [],
        ancestor_depth_bound: 6,
        mute:{ personal:true, cases:[], suppressed:[], suppressed_count:0,
               detail:"muting is PERSONAL and dismissing is a RECORD ACT." },
      };
      if(!cfg.noCounts)
        answer.counts = {
          obligation: items.filter(i=>i.class==="OBLIGATION").length,
          finding:    items.filter(i=>i.class==="FINDING").length,
          condition:  items.filter(i=>i.class==="CONDITION").length,
          ungrouped:0, case_undetermined:0, suppressed:0,
        };
      return R(answer);
    }
    if(op === "tasks") return R({ ok:true, tasks:[], counts:{ resolved:0 }, limit:500, truncated:false });
    if(op === "proposedispose"){
      DISPOSED.add(String(p.key || ""));
      return R({ ok:true, key:p.key, progression_key:"procurement", stage_key:"solicitation",
                 to:p.to, state:p.to, reason:p.reason, decided_by:"m_alice",
                 at:"2026-08-09T09:30:00Z", bundle:null });
    }
    if(op === "basisversions"){
      const answer = { ok:true, inquiry:p.id, inquiry_present:true,
                       versions:[V_SUGGESTED, V_ACCEPTED], count:2, total:2,
                       limit:200, offset:0, truncated:false };
      /* §7's rule reproduced exactly: `current` is published ONLY when a project
         was named, and it is NULL where the project names no reading. The mock
         must not publish it unasked or the surface's three-state handling would
         be judged against an answer the plane never gives. */
      if(p.project) answer.current = cfg.current === undefined
        ? { project:p.project, version:"second-reading", at:"2026-08-08T12:00:00Z", by:"m_alice" }
        : cfg.current;
      return R(answer);
    }
    if(op === "affordances"){
      if(!p.target) return R({ target:null, catalog:[], vocabularies:{} });
      return R({ target:p.target, object_type:"inquiry", current_state:"open",
        acts: cfg.noStanceAct ? [] : [{ id:"versioncurrent", label:"Stand this project on a reading",
               weight:"single", needs:"contribute", mode:"session", rung:"undetermined", prompt:null }],
        vocabularies:{} });
    }
    if(op === "versioncurrent")
      return R({ ok:true, act:"current", target:p.target, version:p.version, project:p.project,
                 moves_state:false, author:"m_alice", at:"2026-08-09T10:00:00Z", weight:"single" });
    if(op === "whoami") return R({ member:"m_alice", session:true, capabilities:["contribute"] });
    return { ok:false, json:async()=>({ ok:false, error:"unexpected op " + op }) };
  }
  return { CALLS, fetch: fetchLike };
}

/* ---------------- a DOM stub good enough for innerHTML inspection ---------- */
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
  ctx.globalThis = ctx; vm.createContext(ctx);
  ctx.__els = els;
  return ctx;
}

const EXPORTS = ";globalThis.__PLANE=PLANE;globalThis.__renderQueue=renderQueue;"
  + "globalThis.__props=()=>PROPOSALS_LAST;globalThis.__openAct=openProposalAct;"
  + "globalThis.__author=proposalActAuthor;globalThis.__dispose=doProposalDispose;"
  + "globalThis.__keyed=notifDispositionKeyed;globalThis.__grain=notifOptionsGrainHtml;"
  + "globalThis.__entry=notifBasisEntryHtml;globalThis.__absence=notifAbsenceHtml;"
  + "globalThis.__mutable=queueMutableKinds;"
  + "globalThis.__stanceOpen=stanceOpen;globalThis.__stanceSend=stanceSend;"
  + "globalThis.__stanceRoute=stanceRouteFromHash;globalThis.__STANCE=()=>STANCE;"
  + "globalThis.__STANCE_ASK=STANCE_ASK;globalThis.__STATE_WORD=VREV_STATE_WORD;"
  + "globalThis.__FAILS_ALL=VREV_FAILS_ALL;globalThis.__FAILS_ANY=VREV_FAILS_ANY;";

const SRC = appScript();
function boot(plane, caps){
  const ctx = makeCtx(plane);
  vm.runInContext(SRC + EXPORTS, ctx);
  ctx.__PLANE.session = true;
  ctx.__PLANE.me = { member:"m_alice", session:true, administer:false,
                     capabilities: caps === undefined ? ["contribute"] : caps };
  return ctx;
}
const q = ctx => ctx.__els.get("#q")._html;
const content = ctx => ctx.__els.get("#content")._html;

/* EVERY PHASE THIS ITEM RENDERS, kept for §6's sweep. The sweep is an acceptance
   clause and not a spot check, so it runs over all of them and floors its own
   corpus. */
const PHASES = [];
const keep = (where, html) => { PHASES.push([where, html]); return html; };

/* ============ 1. THE PLANE'S PUBLISHED WORDING, VERBATIM ============ */
{
  const plane = makePlane({ items:[LEAD("absent"), PROPOSAL, CONDITION] });
  const ctx = boot(plane);
  await ctx.__renderQueue();
  const html = keep("the queue with a lead, a derived proposal and a condition", q(ctx));

  ok("op=queue is the feed these notifications come from", plane.CALLS.some(c=>c.op==="queue"));
  ok("§1 the lead's SUMMARY reaches the page verbatim, in the producer's own words",
     html.includes(LEAD_SUMMARY));
  ok("§1 the lead's DETAIL reaches the page verbatim", html.includes(LEAD_DETAIL));
  ok("§1 the lead's BASIS sentence reaches the page verbatim", html.includes(LEAD_BASIS_DETAIL));
  ok("§1 the derived proposal's own summary and basis sentence reach the page verbatim",
     html.includes(PROPOSAL.summary) && html.includes(DERIVED_BASIS_DETAIL));
  ok("§1 the condition's own summary and detail reach the page verbatim",
     html.includes(CONDITION.summary) && html.includes(CONDITION.detail));

  /* THE INVERSE, and it is what makes the arms above evidence rather than
     coincidence: the surface must hold NO sentence of its own about what a
     particular kind means. A per-kind wording table on the surface is DEC-8's
     drift class — the plane's `queuestate.mjs` holds those sentences and does
     not publish them, and inventing them here would put two answers to one
     question in two repositories. */
  const SRC_TEXT = fs.readFileSync(new URL("../app.html", import.meta.url).pathname, "utf8");
  const NOTIF = /\/\*__NOTIFICATIONS_START__\*\/([\s\S]*?)\/\*__NOTIFICATIONS_END__\*\//.exec(SRC_TEXT);
  ok("§1 REACH: the notifications block was found in app.html and is the real one",
     !!NOTIF && NOTIF[1].length > 3000);
  const block = NOTIF ? NOTIF[1] : "";
  const kindWords = Object.keys(QUEUE_FINDING_KINDS)
    .concat(Object.keys(QUEUE_CONDITION_KINDS), Object.keys(QUEUE_OBLIGATION_KINDS))
    .filter(k => block.includes('"' + k + '"') || block.includes("'" + k + "'"));
  ok("§1 THE SURFACE HOLDS NO PER-KIND WORDING TABLE — it names no kind slug at all, so no sentence "
     + "about what a kind means can drift from the plane's. Found [" + kindWords.join(", ") + "]",
     kindWords.length === 0);
  ok("§1 and it names no kind slug in the queue's own item renderer either — the kind reaches the page "
     + "as the record's own token and nothing on the surface decides what it means",
     !/const NOTIF_KIND_WORD|const QUEUE_KIND_WORD/.test(SRC_TEXT));
}

/* ============ 2. THE LEAD: options[], options_grain, basis_entry ============ */
{
  const plane = makePlane({ items:[LEAD("absent")] });
  const ctx = boot(plane);
  await ctx.__renderQueue();
  const html = keep("the lead with basis_entry=absent", q(ctx));

  ok("§2 the lead's options[] are rendered — the acts the record DOES publish on it",
     html.includes("Cite this document as a reason"));
  ok("§2 `options_grain` IS RENDERED, not papered over: the grain words the producer chose reach the page",
     /at document level/.test(html) && /at inquiry level/.test(html));
  ok("§2 and the producer's own grain sentence reaches the page verbatim (D-222's declared gap)",
     html.includes(GRAIN_DETAIL));
  ok("§2 `basis_entry` state ABSENT says the record LOOKED, which is what makes it different from undetermined",
     /The record LOOKED, and this document is part of no case/.test(html));
  ok("§2 and the producer's own sentence for that state reaches the page verbatim",
     html.includes(ABSENT_DETAIL));

  const p2 = makePlane({ items:[LEAD("undetermined")] });
  const c2 = boot(p2);
  await c2.__renderQueue();
  const h2 = keep("the lead with basis_entry=undetermined", q(c2));
  ok("§2 UNDETERMINED IS NOT COLLAPSED INTO ABSENT — it says the record could not look, and says so in "
     + "as many words rather than reading as 'part of nothing'",
     /is UNDETERMINED/.test(h2) && /not a statement that it is part of nothing/.test(h2)
     && !/The record LOOKED, and this document is part of no case/.test(h2));
  ok("§2 and the producer's own undetermined sentence reaches the page verbatim", h2.includes(UNDET_DETAIL));

  const p3 = makePlane({ items:[LEAD("present")] });
  const c3 = boot(p3);
  await c3.__renderQueue();
  const h3 = keep("the lead with basis_entry=present", q(c3));
  ok("§2 PRESENT is its own answer and is neither of the other two",
     /IS carried by a reading/.test(h3)
     && !/is UNDETERMINED/.test(h3) && !/part of no case/.test(h3));

  /* THE FOURTH STATE. A state outside the three is NAMED rather than folded into
     the nearest one — the same collapse the plane refused to make one layer
     down, refused again here. */
  const odd = LEAD("absent");
  odd.basis.basis_entry = { state:"partially_looked", detail:"a word this surface has no rule for" };
  const p4 = makePlane({ items:[odd] });
  const c4 = boot(p4);
  await c4.__renderQueue();
  const h4 = keep("the lead with a basis_entry state this surface has no rule for", q(c4));
  ok("§2 a FOURTH state is NAMED as one this page has no words for, never scored as one of the three",
     /no words for/.test(h4) && /partially_looked/.test(h4)
     && !/The record LOOKED, and this document is part of no case/.test(h4));

  /* THE DELIBERATE CLOSURE, PINNED. PL-15: *"DO NOT OFFER A MUTE ON IT."*
     op=queuemute refuses the kind by name, so a mute control here would be one
     the record cannot honour. The queue already honours this; the pin is what
     keeps it true. */
  ok("§2 NO MUTE IS OFFERED ON A FINDING — the mute control reaches CONDITION kinds only, which is the "
     + "class op=queuemute will accept, and a lead-only feed therefore draws no mute at all",
     !/data-mute=/.test(html) && ctx.__mutable([LEAD("absent")]).length === 0);
  ok("§2 INSTRUMENT: and the same helper DOES find a condition kind, so the arm above is not passing "
     + "because the helper answers empty for everything",
     ctx.__mutable([CONDITION]).length === 1);
}

/* ====== 3. DERIVED, AGGREGATED, AND AGED RATHER THAN VANISHED (§6.4) ====== */
{
  const plane = makePlane({ items:[LEAD("absent"), PROPOSAL] });
  const ctx = boot(plane);
  await ctx.__renderQueue();
  const html = keep("both findings, before any disposition", q(ctx));

  ok("§3 EVERY finding LOOKS DERIVED (D-82): the badge is on the lead as well as on the derived proposal",
     (html.match(/Surfaced by the record — not yet judged/g) || []).length === 2);
  ok("§3 THE AGGREGATION IS THE RECORD'S: the instance count comes off `basis.n` and says it is grouped "
     + "as one item rather than four",
     /<b>4<\/b> instance/.test(html) && /grouped as ONE item rather than 4/.test(html));
  ok("§3 and the overdue count the plane published travels with it",
     /1<\/b> of them past a declared deadline/.test(html));

  /* THE CONTROL THE RECORD CANNOT HONOUR. op=proposedispose is keyed on
     (progression_key, stage_key); the lead's basis carries neither. */
  ok("§3 the DERIVED proposal is judged dispositionable and the LEAD is not — the test is a property of "
     + "the item, not a list of kinds",
     ctx.__keyed(PROPOSAL) === true && ctx.__keyed(LEAD("absent")) === false);
  ok("§3 so the three controls are drawn on the derived proposal",
     /data-prop-dismiss="procurement::solicitation"/.test(html));
  ok("§3 AND NOT ON THE LEAD, which would be three controls that could only ever be refused",
     !/data-prop-dismiss="out-of-inquiry-lead/.test(html)
     && !/data-prop-adopt="out-of-inquiry-lead/.test(html)
     && !/data-prop-defer="out-of-inquiry-lead/.test(html));
  ok("§3 and the absence is EXPLAINED rather than left as a blank strip — a member reading nothing "
     + "there concludes the notification is broken",
     /There is no adopt, defer or dismiss on this one/.test(html));
  ok("§3 the act context the dialog reads carries only the findings the act can be keyed on",
     ctx.__props().length === 1 && ctx.__props()[0].key === "procurement::solicitation");
  ok("§3 the STRENGTH line is on the derived proposal and NOT on the lead — a finding with no "
     + "progression identity has no population for a grade to be over",
     /Strength: <b>Grade C<\/b>/.test(html)
     && (html.match(/prop-grade/g) || []).length === 1);

  /* AGE RATHER THAN VANISH. Dismiss the derived proposal through the real act,
     re-read, and require BOTH halves: it has left the open list, and where it
     went is on the screen in the record's own words. */
  ctx.__openAct("procurement::solicitation", "dismissed");
  ctx.__author("The solicitation was published on a portal we do not capture.");
  await ctx.__dispose();
  await ctx.__renderQueue();
  const after = keep("after the derived proposal was dismissed", q(ctx));

  ok("§3 op=proposedispose was DRIVEN, with the member's own reason",
     plane.CALLS.some(c => c.op === "proposedispose"
       && c.params.to === "dismissed"
       && String(c.params.reason||"").includes("portal we do not capture")));
  ok("§3 AGED OUT OF THE OPEN LIST: the proposal is no longer among the open findings",
     !/data-id="FINDING::procurement::solicitation"/.test(after));
  ok("§3 AND IT DID NOT VANISH: the record's own account of where it went is on the screen",
     /Set aside as dismissed by m_alice on 2026-08-09T09:30:00Z/.test(after));
  ok("§3 with the member's reason as THE RECORD recorded it, not as this page sent it",
     /Their reason, as the record recorded it: The solicitation was published on a portal we do not capture\./.test(after));
  ok("§3 and the sentence says it is kept and re-triageable, so leaving the list is not leaving the record",
     /it has not left the record/.test(after) && /can be re-triaged/.test(after));
  ok("§3 the LEAD is untouched by the disposition — one finding's act does not age another",
     after.includes(LEAD_SUMMARY));

  /* A FIELD THE ANSWER DID NOT CARRY IS SAID TO BE MISSING, never filled in from
     what this page sent. */
  const inner = makePlane({ items:[PROPOSAL] });
  const p2 = { CALLS: inner.CALLS, fetch: (u, o) => {
    const url = new URL(u, "https://plane.test");
    if(url.searchParams.get("op") === "proposedispose")
      return Promise.resolve({ ok:true, json:async()=>({ ok:true,
        result:{ ok:true, key:"procurement::solicitation", to:"deferred", reason:"", decided_by:"", at:"" } }) });
    return inner.fetch(u, o);
  } };
  const c2 = boot(p2);
  await c2.__renderQueue();
  c2.__openAct("procurement::solicitation", "deferred");
  c2.__author("Parked until the audit lands.");
  await c2.__dispose();
  await c2.__renderQueue();
  const thin = keep("a disposition whose answer omitted three fields", q(c2));
  ok("§3 a disposition answer missing who, when and the reason SAYS SO and invents none of the three — "
     + "including the reason this page itself sent a moment earlier",
     /The record did not say who decided, when, their reason/.test(thin)
     && !/Parked until the audit lands/.test(thin));
}

/* ============ 4. WHICH LEVEL WAS EMPTY — nothing happened vs we did not look ============ */
{
  /* (a) a class NOTHING PRODUCES YET. This is `we did not look`, and it must not
     read as an all-clear about the world. */
  const p1 = makePlane({ items:[PROPOSAL],
                         classes:["OBLIGATION","FINDING","CONDITION"],
                         classesDeferred:["CONDITION"] });
  const c1 = boot(p1);
  await c1.__renderQueue();
  const h1 = keep("a class the plane declares it does not produce yet", q(c1));
  ok("§4 A DEFERRED CLASS SAYS NOBODY HAS BUILT THE THING THAT WOULD LOOK — silence there is not "
     + "evidence about the world",
     /nothing on this plane raises one of these yet/.test(h1)
     && /it says nobody has built the thing that would look/.test(h1));
  ok("§4 and the class it says that about is the one the RECORD named as deferred",
     /<b>CONDITION<\/b> — nothing on this plane raises one of these yet/.test(h1));
  ok("§4 a class that answered with none says the record LOOKED and raised none — a different sentence "
     + "from the one above, for a different fact",
     /<b>OBLIGATION<\/b> — the record looked and raised none/.test(h1));
  ok("§4 and a class that raised some reports the record's own count",
     /<b>FINDING<\/b> — 1 raised/.test(h1));
  ok("§4 THE SURFACE NAMES NO KIND HERE — a per-kind roster on the surface would let this page claim a "
     + "producer exists before one does",
     !Object.keys(QUEUE_FINDING_KINDS).some(k => h1.includes(k)));

  /* (b) NO COUNTS AT ALL — a third fact, and it is said rather than shown as
     zero. `counts` absent is not `counts` of zero. */
  const p2 = makePlane({ items:[], noCounts:true });
  const c2 = boot(p2);
  await c2.__renderQueue();
  const h2 = keep("an answer that published no counts at all", q(c2));
  ok("§4 A MISSING COUNT IS NOT A COUNT OF ZERO: the surface says it cannot tell whether the record "
     + "looked, rather than showing none",
     /the record published no count for these, so this screen cannot tell you whether it looked/.test(h2)
     && !/the record looked and raised none/.test(h2));

  /* (c) THE ALL-CLEAR AND THE LEVEL STATEMENT ARE DIFFERENT CLAIMS and both are
     made: an empty feed still owes the reader which level was empty. */
  const p3 = makePlane({ items:[] });
  const c3 = boot(p3);
  await c3.__renderQueue();
  const h3 = keep("an empty but fully-answered feed", q(c3));
  ok("§4 an empty feed that ANSWERED still states which level was empty, per class",
     /<b>FINDING<\/b> — the record looked and raised none/.test(h3)
     && /<b>CONDITION<\/b> — the record looked and raised none/.test(h3));
  ok("§4 and the all-clear is still made beside it, because they are different claims",
     /Nothing needs anybody right now/.test(h3));

  /* (d) A FEED THAT DID NOT ANSWER CLAIMS NOTHING. The level statement is read
     off op=queue's answer, so with no answer there is nothing to say and
     nothing is said — an invented level line would be the worst of the three. */
  const p4 = makePlane({ queueFails:true });
  const c4 = boot(p4);
  await c4.__renderQueue();
  const h4 = keep("a feed that failed", q(c4));
  ok("§4 A FEED THAT FAILED PRODUCES NO LEVEL STATEMENT AT ALL — with no answer there is no published "
     + "class list, and a line composed here would claim the record said something it did not",
     !/What this list can and cannot be empty about/.test(h4) && /This feed failed/.test(h4));
}

/* ============ 5. WHAT THIS PROJECT STANDS ON (§7, UI-42's delegated half) ============ */
{
  const plane = makePlane({});
  const ctx = boot(plane);
  await ctx.__stanceOpen(PROJ, INQ_A);
  const h = keep("the stance surface with a current reading", content(ctx));

  ok("§5 op=basisversions was read WITH THE PROJECT NAMED — without it the plane publishes no `current` at all",
     plane.CALLS.some(c => c.op === "basisversions" && c.params.id === INQ_A && c.params.project === PROJ));
  ok("§5 and it was read WITH AN EXPLICIT BOUND — no surface inherits a cap it never stated",
     plane.CALLS.some(c => c.op === "basisversions" && c.params.limit === String(ctx.__STANCE_ASK)));
  ok("§5 THE BOUND THE RECORD APPLIED IS STATED, separately from anything this display holds back",
     /The record answered for this question with at most 200 reading\(s\) — the bound it applied, not the one this page asked for/.test(h));
  ok("§5 THE ASK IS NEVER RENDERED as the bound: the figure a member reads is the plane's published one",
     ctx.__STANCE_ASK === 200);
  ok("§5 the reading this project stands on is named, with the date and the member on it (§7's pointer is dated and authored)",
     /This project stands on/.test(h) && /second-reading/.test(h)
     && /Declared by m_alice on 2026-08-08T12:00:00Z/.test(h));
  ok("§5 THE STATE SENTENCE IS UI-42's CONSTANT, REUSED — a third spelling of the four state words "
     + "would be the defect UI-42's delegation names",
     h.includes(ctx.__STATE_WORD.accepted));
  ok("§5 the composition is read back through the elicitation's own stem, not a third one",
     h.includes(ctx.__FAILS_ALL) || h.includes(ctx.__FAILS_ANY));
  ok("§5 op=affordances is the source of the act, and its label is rendered unmodified (DEC-8)",
     plane.CALLS.some(c => c.op === "affordances" && c.params.target === INQ_A)
     && h.includes("Stand this project on a reading"));

  /* THE ACT, DRIVEN. */
  await ctx.__stanceSend("second-reading");
  const after = keep("after standing the project on a reading", content(ctx));
  ok("§5 op=versioncurrent was DRIVEN through the surface, carrying both halves of the pair",
     plane.CALLS.some(c => c.op === "versioncurrent" && c.params.project === PROJ
       && c.params.target === INQ_A && c.params.version === "second-reading"));
  ok("§5 and the receipt is the record's own answer — who and when, never this page's clock",
     /declared by m_alice on 2026-08-09T10:00:00Z/.test(after));

  /* THE NULL ANSWER, AND THE COLLAPSE SAID OUT LOUD. */
  const p2 = makePlane({ current:null });
  const c2 = boot(p2);
  await c2.__stanceOpen(PROJ, INQ_A);
  const h2 = keep("the stance surface where the record names no reading", content(c2));
  ok("§5 A NULL `current` IS NOT 'this project has not chosen' — the plane collapses three situations "
     + "into that one answer on purpose, and the surface says which three rather than picking one",
     /names no reading for this project on this question/.test(h2)
     && /covers three different situations on purpose/.test(h2)
     && /this credential may not see the project at all/.test(h2));
  ok("§5 and it says WHY they answer identically, so the collapse reads as a defence rather than a gap",
     /so that asking cannot be used to find out which projects exist/.test(h2));

  /* THE ACT ABSENT. A capability a member has not got is absent, never greyed. */
  const p3 = makePlane({ noStanceAct:true });
  const c3 = boot(p3);
  await c3.__stanceOpen(PROJ, INQ_A);
  const h3 = keep("the stance surface where the plane publishes no act", content(c3));
  ok("§5 where the plane publishes no versioncurrent there is NO CONTROL and no greyed one",
     !/Stand this project on a reading/.test(h3)
     && /publishes no way for this credential to change what this project stands on/.test(h3));

  /* THE ROUTE. Driven directly at the address, because the DOM stub fires no
     events — the honest substitute, labelled as one. */
  const p4 = makePlane({});
  const c4 = boot(p4);
  c4.location.hash = "#stands/" + PROJ + "/" + INQ_A;
  ok("§5 `#stands/<PROJ-…>/<INQ-…>` is a real address and BOTH halves are in it, because a stance is the pair",
     c4.__stanceRoute() === true);
  await new Promise(r => setTimeout(r, 0));
  ok("§5 and a hash that is not this shape is not claimed by this router",
     (() => { c4.location.hash = "#versions/" + INQ_A; return c4.__stanceRoute() === false; })());
}

/* ============ 6. DEC-32 CLAUSE 1 / D-226 — THE VOCABULARY BAN, SWEPT ============ */
{
  /* The connective is CASE-SENSITIVE for the reason UI-42's suite states: an
     authored English "and" cannot be told from the analyst's connective by
     spelling, and both surfaces render ALL/ANY instead. `ground` and
     `partition` are not case-sensitive — neither has an innocent reading on a
     member-facing screen here. */
  /* CORRECTED 2026-08-09 (UI-53), never exempted. The case-sensitivity reasoning
     above is RIGHT and is preserved — it is now stated once, in
     `analyst-vocabulary.mjs`, and carries `sufficiency-state.test.mjs`'s measured
     receipt for it. WHAT WAS WRONG IS THE COVERAGE: this list was the ODD ONE OUT
     of four in this directory. It carried no bare `ground`, no `branch`, no
     standalone `AND`/`OR` and no `(and|or)-related`, all of which the other three
     carried — and like all four it had no `independently sufficient`, the phrase
     that was actually reaching members (D-269). Consuming the derived family
     STRICTLY WIDENS what this sweep sees; nothing it caught before is lost. */
  console.log("  " + reachLine());
  ok("§6 REACH: the sweep has a corpus — " + PHASES.length + " phases were kept, floor 11 "
     + "(a sweep over nothing reports clean)", PHASES.length >= 11);
  ok("§6 INSTRUMENT: the fixture really does carry the banned words, so a surface that printed the "
     + "record's own labels would be caught here rather than passing for free",
     analystHits(LEAKY_LABEL).length > 0);
  const hits = [];
  for(const [where, html] of PHASES){
    const text = String(html || "").replace(/<[^>]*>/g, " ");
    for(const h of analystHits(text)) hits.push(where + " → " + h.token);
  }
  ok("§6 NOT ONE ANALYST WORD ON ANY SURFACE THIS ITEM RENDERS, across all " + PHASES.length
     + " phases — found [" + hits.join(" | ") + "]", hits.length === 0);
  ok("§6 INSTRUMENT: and the sweep is not simply answering clean — planting the label into a phase is caught",
     (() => { const t = "some text " + LEAKY_LABEL + " more";
              return analystHits(t).length > 0; })());
}

/* ============================== FOOT ============================== */
console.log(`notifications.test.mjs: ${n - fails.length} pass, ${fails.length} fail`);
if(fails.length){
  console.error("\nnotifications: " + fails.length + " of " + n + " assertions FAILED:");
  for(const f of fails) console.error("  - " + f);
  process.exit(1);
}
