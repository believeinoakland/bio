/* UI-11 — S3 THE INQUIRY PAGE, read-only.
 *
 * Drives `openInquiry` over a mock plane answering the four reads the surface
 * consumes — op=image (the document as authored), op=projection (the plane's
 * OWN frontmatter parse, `fm_json`), op=backlinks (REC-25's gated reverse read)
 * and op=whoami (through PLANE.me). Proves what the item's acceptance names:
 *
 *   (1) a MIXED basis reads TWO strengths, each naming its own weakest leg,
 *       with no composed letter, no score, no percentage, no average, no bar;
 *   (2) a `cuts_against` leg is present and counted ON ITS OWN AXIS exactly as
 *       a supporting one is (it IS the connection axis's weakest leg here);
 *   (3) an UNGRADED leg is named as *not yet load-bearing* (DEC-18) while its
 *       axis still reads from its graded legs — inert, never unrating;
 *   (4) an all-ungraded basis reads UNRATED, and UNRATED is the word (D-160);
 *   (5) a HUNCH leg is visibly a hunch from the moment it is made, with its
 *       author and date, and the strength panel states the case cannot publish
 *       while one stands (DEC-15);
 *   (6) the UNDETERMINED primitive is ONE three-line component whose third line
 *       comes from a CLOSED SET OF THREE (Q9), selected by plane-published
 *       facts — a free-text third line renders NOTHING;
 *   (7) a read-only credential sees the WHOLE page with exactly ONE
 *       whoami-sourced sentence, and no control is narrated or greyed (Q12) —
 *       there is no act bar at all this turn;
 *   (8) the CRUMB renders first and survives every state INCLUDING the error
 *       (the errPane correction), and `#inquiry/<id>` is a real route.
 *
 * NEGATIVE CONTROL, four arms, RUN 2026-08-04 and restored byte-identical after
 * each (app.html's sha256 compared before and after every arm — all four
 * returned to d69bdbd9c80f500f…). Each edit is one line in civicos-ui/app.html:
 *
 *   (a) ONE COMPOSED LETTER. In `strengthPanels`'s `pair` branch, add a
 *       composed badge above the two axis panels:
 *         <span class="subj-grade g-est">Grade ${pair.capture.grade > pair.connection.grade ? pair.capture.grade : pair.connection.grade}</span>
 *       -> RUN: 4 of 162 failed — "the strength section renders EXACTLY two
 *       grade badges, one per axis", "the two axis grades are the plane's own
 *       two values, unmodified", "no composed single strength is rendered",
 *       "no grade letter is rendered for an unrated axis" (the composed letter
 *       appeared on the UNRATED page too, which is the harm in one line).
 *
 *   (b) AVERAGE THE LEGS. In `axisPanel`'s graded branch, replace the plane's
 *       `esc(a.grade)` with a mean over the legs' letters:
 *         esc((function(){const g=legs.filter(l=>l&&l.grade);return "ABCD"[Math.round(g.reduce((s,l)=>s+"ABCD".indexOf(l.grade),0)/g.length)];})())
 *       -> RUN: 4 of 162 failed — "the capture axis reads the grade the plane
 *       published (C)" (the average reads B while the weakest leg is C: the
 *       average OVERCLAIMS, which is exactly why R1 forbids it), "the two axis
 *       grades are the plane's own two values, unmodified", "the capture axis
 *       STILL READS from its graded legs", "a read-only credential sees the
 *       WHOLE page — both strengths".
 *
 *   (c) AN UNGRADED LEG UNRATES AN AXIS THAT HAS GRADED LEGS. In `axisPanel`,
 *       make the graded branch conditional on no leg being ungraded:
 *         if(state === "graded" && !legs.some(l=>l&&l.grade==null)){
 *       so a basis with one inert leg falls through to the unrated branch
 *       -> RUN: 13 of 162 failed, including "the capture axis STILL READS from
 *       its graded legs", "the capture axis names the leg the plane named as
 *       weakest", "the cuts_against leg is the connection axis's weakest and is
 *       counted, not dropped", "the load-bearing count is stated, from the
 *       plane". DEC-18's whole point, measured: inert is not unrating.
 *
 *   (d) A FREE-TEXT THIRD LINE. In `undeterminedPane`, let the caller's own
 *       words through when the form is not one of the three:
 *         const retry = UNDET_RETRY[form] || form;
 *       -> RUN: 2 of 162 failed — "a form the plane never published renders
 *       NOTHING, not the caller's words" and "a plausible-looking key outside
 *       the closed set renders NOTHING". WORTH KNOWING: the page-level scan
 *       ("every retry line is one of the three closed forms") does NOT catch
 *       this arm and cannot, because every form the page itself passes is
 *       chosen from the closed set by construction — the scan guards against a
 *       FUTURE call site, and the component's own refusal is what guards
 *       against this one. Both are kept, and the distinction is stated rather
 *       than left for the next session to re-derive.
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ---------------- the mock plane ---------------- */
const CALLS = [];

function md(state, title, question, falsifier){
  return `---\nobject_type: inquiry\ncurrent_state: ${state}\ntitle: ${title}\n---\n`
    + `## Question\n\n${question}\n\n## What It Rests On\n\nSee the legs recorded on this question.\n\n`
    + `## Conclusion\n\nThe fund paid for the marina in the 2024 cycle.\n\n`
    + `## What Would Falsify This\n\n${falsifier}\n\n## Session Log\n\n- promoted\n`;
}

/* (1) A MIXED basis: two graded axes, a cuts_against leg carrying the
   connection axis's weakest grade, and one ungraded leg that is inert. The
   `published_strength` block is the shape REC-14 freezes — BOTH AXIS OBJECTS,
   which is why one renderer serves the frozen and the derived pair alike. */
const MIXED_LEGS = [
  { target:"INFO-2026-0100", role:"supports",     grade:"A", grade_axis:"capture",    grade_source:"resolution" },
  { target:"INFO-2026-0200", role:"supports",     grade:"C", grade_axis:"capture",    grade_source:"resolution",
    note:"The name on the invoice corresponds; no shared identifier." },
  { target:"INQ-2026-0009",  role:"cuts_against", grade:"B", grade_axis:"connection", grade_source:"inherited", target_edition:1 },
  { target:"INFO-2026-0300", role:"supports",     grade:null, grade_axis:null,        grade_source:null },
];
const MIXED_PAIR = [
  { axis:"capture", state:"graded", grade:"C", weakest:"INFO-2026-0200", load_bearing:2, population:3,
    detail:"capture C — no stronger than the weakest capture it rests on, which is INFO-2026-0200. Present and not yet load-bearing: INFO-2026-0300." },
  { axis:"connection", state:"graded", grade:"B", weakest:"INQ-2026-0009", load_bearing:1, population:4,
    detail:"connection B — no stronger than the weakest connection it rests on, which is INQ-2026-0009. Present and not yet load-bearing: INFO-2026-0100, INFO-2026-0200, INFO-2026-0300." },
];
/* (2) An ALL-UNGRADED basis: UNRATED on both axes. Capture has ungraded legs in
   its population (only grading one settles it); connection has no population at
   all (there is positively nothing there to find). */
const UNRATED_LEGS = [
  { target:"INFO-2026-0400", role:"supports", grade:null, grade_axis:null, grade_source:null },
  { target:"INFO-2026-0500", role:"supports", grade:null, grade_axis:null, grade_source:null },
];
const UNRATED_PAIR = [
  { axis:"capture", state:"unrated", grade:null, weakest:null, load_bearing:0, population:2,
    not_load_bearing:[{target_id:"INFO-2026-0400"},{target_id:"INFO-2026-0500"}],
    detail:"UNRATED on capture: no leg on this axis carries an established grade, so this conclusion rests on nothing established here. Not load-bearing: INFO-2026-0400, INFO-2026-0500." },
  { axis:"connection", state:"unrated", grade:null, weakest:null, load_bearing:0, population:0,
    not_load_bearing:[],
    detail:"UNRATED on connection: this inquiry rests on nothing on this axis." },
];
/* (3) A HUNCH on a WORKING question — no frozen pair exists for one, which is
   exactly the state DEC-15 is about: a hunch is visible from the moment it is
   made, not disclosed at publication. */
const HUNCH_LEGS = [
  { target:"INFO-2026-0600", role:"supports", grade:"B", grade_axis:"capture", grade_source:"resolution" },
  { target:"INFO-2026-0700", role:"supports", grade:"B", grade_axis:"connection", grade_source:"hunch",
    author:"m_alice", date:"2026-08-02" },
];
/* (4) An axis the walk could not finish (R3). */
const DEPTH_PAIR = [
  { axis:"capture", state:"graded", grade:"B", weakest:"INFO-2026-0800", load_bearing:1, population:1,
    detail:"capture B — no stronger than the weakest capture it rests on, which is INFO-2026-0800." },
  { axis:"connection", state:"undetermined", grade:null, weakest:null, load_bearing:1, population:2,
    depth_bound:6,
    detail:"this connection axis has NO computed strength: the basis walk reached its depth bound of 6 at INQ-2026-0050, so what lies below is unknown rather than absent. This is what we do not know, not a low score." },
];

const DOCS = {
  "INQ-2026-0001": { state:"published", title:"Did the sewer fund pay for the marina?",
    legs:MIXED_LEGS, pair:MIXED_PAIR,
    q:"Did money from the sewer enterprise fund pay for marina construction between 2022 and 2024?",
    f:"A general-ledger export showing no transfer from fund 601 to the marina capital project." },
  "INQ-2026-0002": { state:"published", title:"Was the contract awarded without a bid?",
    legs:UNRATED_LEGS, pair:UNRATED_PAIR,
    q:"Was the harbour dredging contract awarded without a competitive bid?",
    f:"A published bid tabulation naming two or more bidders." },
  "INQ-2026-0003": { state:"open", title:"Who approved the transfer?",
    legs:HUNCH_LEGS, pair:null,
    q:"Which officer approved the transfer out of the sewer fund?",
    f:"A signed approval carrying a different officer's name." },
  "INQ-2026-0004": { state:"published", title:"Does the audit finding still stand?",
    legs:[{ target:"INFO-2026-0800", role:"supports", grade:"B", grade_axis:"capture", grade_source:"resolution" },
          { target:"INQ-2026-0050", role:"supports", grade:null, grade_axis:null, grade_source:null }],
    pair:DEPTH_PAIR,
    q:"Does the 2023 audit finding on the sewer fund still stand today?",
    f:"A later audit withdrawing the finding." },
  /* A question with no legs at all is legal (DEC-22) and says so. */
  "INQ-2026-0005": { state:"open", title:"Where did the 2025 surplus go?", legs:[], pair:null,
    q:"Where did the 2025 general-fund surplus go?", f:"" },
  /* Not a question at all. */
  "INFO-2026-0100": { state:"verified", title:"Sewer fund ledger", legs:[], pair:null, q:"", f:"", type:"information" },
};

const BACKLINKS = {
  "INQ-2026-0001": [{ from:"PROJ-2026-0001", from_type:"project", from_state:"investigating",
                      from_title:"The marina money", rel:"cites", status:"confirmed", note:"the whole thesis" }],
};

function mockFetch(u){
  const url = new URL(u, "https://plane.test");
  const op = url.searchParams.get("op");
  const id = url.searchParams.get("id"), target = url.searchParams.get("target");
  CALLS.push({ op, id, target });
  const R = o => ({ ok:true, json:async()=>o });
  if(op==="image"){
    const d = DOCS[id];
    if(!d) return R({ ok:true, result:null });
    if(id==="INQ-BOOM") return R({ ok:false, error:"the plane is unreachable" });
    return R({ ok:true, result:{ "bundle.md": d.type==="information"
      ? `---\nobject_type: information\ncurrent_state: verified\ntitle: ${d.title}\n---\n## Summary\n\nA ledger.\n`
      : md(d.state, d.title, d.q, d.f) } });
  }
  if(op==="projection"){
    const d = DOCS[id];
    if(!d) return R({ ok:true, result:null });
    const fm = { basis:d.legs, ...(d.pair ? { published_strength:d.pair } : {}) };
    return R({ ok:true, result:{ bundle_id:id, object_type:d.type||"inquiry", title:d.title,
                                 current_state:d.state, fm_json:JSON.stringify(fm) } });
  }
  if(op==="backlinks")
    return R({ ok:true, result:{ ok:true, target, backlinks:BACKLINKS[target]||[] } });
  if(op==="image"||op==="list") return R({ ok:true, result:[] });
  return R({ ok:false, error:"unexpected op "+op });
}

/* ---- a DOM stub good enough for innerHTML inspection ---- */
const els = new Map();
function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
  querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){}, remove(){}, onclick:null };
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }

const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(),
    hidden:false, createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:async(u,opts)=>mockFetch(u,opts) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() +
  ";globalThis.__PLANE=PLANE;globalThis.__openInquiry=openInquiry;globalThis.__routeFromHash=routeFromHash;" +
  "globalThis.__undeterminedPane=undeterminedPane;globalThis.__UNDET_RETRY=UNDET_RETRY;" +
  "globalThis.__errPane=errPane;globalThis.__recordCrumb=recordCrumb;", ctx);

ctx.__PLANE.session = true;
ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };

const content = () => els.get("#content")._html;
async function open(id){ await ctx.__openInquiry(id); return content(); }

const RETRIES = Object.values(ctx.__UNDET_RETRY);
const PAGES = [];
function scanRetryLines(html, where){
  /* Every third line on the page must be one of the three closed forms. The
     scan is over the rendered HTML, so a free-text line cannot hide behind the
     component's own API. */
  const lines = [...html.matchAll(/<b>retry<\/b> &middot; ([^<]*)/g)].map(m=>m[1]);
  const bad = lines.filter(l=>!RETRIES.some(r=>l.startsWith(r)));
  ok(`every retry line on ${where} is one of the three closed forms`, bad.length===0);
  return lines;
}

/* ============ (1) THE MIXED BASIS: TWO STRENGTHS, TWO NAMED LEGS ============ */
const mixed = await open("INQ-2026-0001");
PAGES.push(["the mixed basis", mixed]);
ok("op=image was read for the question", CALLS.some(c=>c.op==="image" && c.id==="INQ-2026-0001"));
ok("op=projection was read for the plane's own frontmatter parse", CALLS.some(c=>c.op==="projection" && c.id==="INQ-2026-0001"));
ok("op=backlinks was read for what relies on this", CALLS.some(c=>c.op==="backlinks" && c.target==="INQ-2026-0001"));

/* the crumb, first and always */
ok("the crumb renders", /class="crumb"/.test(mixed) && mixed.indexOf('class="crumb"') < mixed.indexOf("<h1"));
ok("the crumb names the question's id", mixed.includes("INQ-2026-0001"));

/* the question as authored, and the phase word */
ok("the question renders as authored", mixed.includes("Did money from the sewer enterprise fund pay for marina construction"));
ok("the phase word is the member-facing one for a published question", /Case/.test(mixed));
ok("the phase word is not the raw type", !/>inquiry</.test(mixed.split("What it rests on")[0]));

/* WHAT IT RESTS ON — every leg, its role, its target, its grade */
for(const l of MIXED_LEGS) ok(`the basis names the leg ${l.target}`, mixed.includes(l.target));
ok("a supporting leg says what it does to the conclusion", mixed.includes("supports this"));
ok("the cuts_against leg is present and says it cuts against", mixed.includes("cuts against this"));
ok("a leg's grade renders as HOW it was established", mixed.includes("established by the record resolving this document to its subject"));
ok("an inherited grade says where it came from", mixed.includes("inherited from the edition of the case this leg cites"));
/* no leg claims settledness the record never asserted */
ok("no leg is rendered as 'established' in the subject-view sense", !/Grade [ABCD] · established/.test(mixed));
ok("no leg is rendered as 'unconfirmed'", !/Grade [ABCD] · unconfirmed/.test(mixed));

/* THE STRENGTH PANEL — two, never one */
const strength = mixed.slice(mixed.indexOf("Strength"));
ok("both axes are named", /Documents/.test(strength) && /Links/.test(strength));
ok("the capture axis reads the grade the plane published (C)", /Documents[\s\S]*?Grade C/.test(strength));
ok("the connection axis reads the grade the plane published (B)", /Links[\s\S]*?Grade B/.test(strength));
const badges = [...strength.matchAll(/class="subj-grade g-est">Grade ([ABCD])</g)].map(m=>m[1]);
ok("the strength section renders EXACTLY two grade badges, one per axis", badges.length===2);
ok("the two axis grades are the plane's own two values, unmodified", badges.join("")==="CB");
/* STRUCTURAL, not a word list: the strength section carries exactly two
   strength marks and both are per-axis grades. A third mark of any kind — a
   composed letter, an overall badge — fails here even if it is worded in a way
   nobody anticipated. */
const allMarks = [...strength.matchAll(/class="subj-grade[^"]*">([^<]*)</g)].map(m=>m[1]);
ok("no composed single strength is rendered",
   allMarks.length===2 && allMarks.every(b=>/^Grade [ABCD]$/.test(b)));
ok("no prose claims a single overall strength", !/\boverall\b|\bcomposite\b|\bthe strength is\b/i.test(strength));
/* each names its OWN weakest leg with its OWN sentence */
ok("the capture axis names the leg the plane named as weakest", /Documents[\s\S]*?INFO-2026-0200[\s\S]*?Links/.test(strength));
ok("the connection axis names the leg the plane named as weakest", /Links[\s\S]*?INQ-2026-0009/.test(strength));
ok("each axis carries its own weakest-leg sentence", (strength.match(/No stronger than the weakest leg it rests on/g)||[]).length===2);
/* the cuts_against leg is COUNTED, on its own axis, exactly as a supporting one */
ok("the cuts_against leg is the connection axis's weakest and is counted, not dropped",
   /Links[\s\S]*?which is <a[^>]*>INQ-2026-0009/.test(strength));
ok("the cuts_against leg is never marked not-load-bearing",
   !new RegExp("INQ-2026-0009[\\s\\S]{0,400}?Not yet load-bearing").test(mixed));
/* DEC-18: the ungraded leg is INERT — named, excluded, and it unrates nothing */
ok("the ungraded leg is named as not yet load-bearing", /INFO-2026-0300[\s\S]{0,600}?Not yet load-bearing/.test(mixed));
ok("the capture axis STILL READS from its graded legs", /Documents[\s\S]*?Grade C/.test(strength));
ok("a basis with graded legs never reads UNRATED", !/UNRATED/.test(strength));
ok("the load-bearing count is stated, from the plane", /2 of 3 legs on this axis are load-bearing/.test(strength));
/* no score, no percentage, no average, no bar */
ok("no percentage anywhere on the page", !/\d\s*%/.test(mixed));
ok("no score or average anywhere on the page", !/\bscore\b|\baverage\b|\bmean\b|\bweighted\b/i.test(mixed));
ok("no bar or meter anywhere on the page", !/<progress|<meter|width:\s*\d+%/.test(mixed));
/* WHAT WOULD FALSIFY IT */
ok("what would falsify it renders as authored", mixed.includes("A general-ledger export showing no transfer"));
/* WHAT RELIES ON THIS, through the gated read */
ok("what relies on this names the citing project", mixed.includes("The marina money"));
ok("the reverse read is stated as the record's own index, not a walk", /reverse index/.test(mixed));
scanRetryLines(mixed, "the mixed basis");

/* ============ (2) ALL UNGRADED: UNRATED, AND UNRATED IS THE WORD ============ */
const unrated = await open("INQ-2026-0002");
PAGES.push(["the unrated basis", unrated]);
const uStrength = unrated.slice(unrated.indexOf("Strength"));
ok("an all-ungraded basis reads UNRATED", /UNRATED/.test(uStrength));
ok("UNRATED is stated as not a low score", /UNRATED is not a low score/.test(uStrength));
ok("no grade letter is rendered for an unrated axis", !/class="subj-grade g-est">Grade/.test(uStrength));
ok("both axes are still drawn when both are unrated",
   (uStrength.match(/UNRATED/g)||[]).length >= 2);
/* Q9: the third line is chosen by the PLANE'S facts — ungraded legs present
   means only grading one settles it; no population at all means there is
   positively nothing to find. */
const uLines = scanRetryLines(unrated, "the unrated basis");
ok("the axis with ungraded legs takes the grade-the-leg form",
   uLines.some(l=>l.startsWith(ctx.__UNDET_RETRY.grade_the_leg)));
ok("the grade-the-leg line NAMES the legs to grade",
   /Only grading the leg will settle this; looking again will not\. INFO-2026-0400, INFO-2026-0500/.test(unrated));
ok("the axis with no population at all takes the positively-none form",
   uLines.some(l=>l.startsWith(ctx.__UNDET_RETRY.positively_none)));
ok("both ungraded legs are named as not yet load-bearing",
   /INFO-2026-0400[\s\S]{0,600}?Not yet load-bearing/.test(unrated) && /INFO-2026-0500[\s\S]{0,600}?Not yet load-bearing/.test(unrated));

/* ============ (3) A HUNCH IS VISIBLE, AND SAYS WHAT IT COSTS ============ */
const hunch = await open("INQ-2026-0003");
PAGES.push(["the hunch", hunch]);
ok("the hunch leg is marked a HUNCH on the leg itself", /HUNCH/.test(hunch));
ok("the hunch names its author", hunch.includes("m_alice"));
ok("the hunch names its date", hunch.includes("2026-08-02"));
ok("the hunch is described as declared bias", /declared bias/.test(hunch));
ok("the strength panel states the case cannot publish while a hunch stands",
   /this case cannot be published/.test(hunch.slice(hunch.indexOf("Strength"))));
ok("the hunch note names the leg it is about", /INFO-2026-0700[\s\S]{0,400}?cannot be published/.test(hunch)
   || /cannot be published/.test(hunch) && hunch.includes("INFO-2026-0700"));
ok("a working question still shows the PAIR shape, two axes and never one",
   /Documents/.test(hunch) && /Links/.test(hunch));
ok("a working question renders NO strength letter, because the plane published none",
   !/class="subj-grade g-est">Grade [ABCD]</.test(hunch.slice(hunch.indexOf("Strength"))));
ok("the gap is NAMED rather than filled", /not published to this page yet/.test(hunch));
ok("the gap is not dressed up as the record's own undetermined",
   !/<b>basis<\/b>/.test(hunch.slice(hunch.indexOf("Strength"))));
scanRetryLines(hunch, "the hunch page");

/* ============ (4) AN UNFINISHED WALK IS UNKNOWN, NOT WEAK (R3) ============ */
const depth = await open("INQ-2026-0004");
PAGES.push(["the depth-bound page", depth]);
const dStrength = depth.slice(depth.indexOf("Strength"));
ok("an axis the walk could not finish renders the undetermined primitive", /undetermined/.test(dStrength));
ok("the undetermined axis names the depth it stopped at", /depth bound of 6/.test(dStrength));
ok("the OTHER axis still reads its own grade", /Documents[\s\S]*?Grade B/.test(dStrength));
const dLines = scanRetryLines(depth, "the depth-bound page");
ok("the unfinished walk takes the could-not-determine form",
   dLines.some(l=>l.startsWith(ctx.__UNDET_RETRY.could_not_determine)));
ok("an undetermined axis is never rendered as a grade", !/undetermined[\s\S]{0,200}?Grade [ABCD]/.test(dStrength));

/* ============ (5) A QUESTION WITH NO LEGS IS LEGAL AND SAYS SO ============ */
const bare = await open("INQ-2026-0005");
PAGES.push(["the zero-leg question", bare]);
ok("a question with no legs states it rests on nothing yet", /rests on nothing yet/.test(bare));
ok("a question with no legs is not called an error", !/error|refused/i.test(bare));
ok("a question with no falsifier says nothing is written on the author's behalf",
   /does not yet say what would falsify it/.test(bare));

/* ============ (6) THE UNDETERMINED PRIMITIVE IS ONE COMPONENT ============ */
ok("the primitive carries exactly three closed forms", Object.keys(ctx.__UNDET_RETRY).length===3);
const three = ctx.__undeterminedPane("a basis", "could_not_determine", []);
ok("the primitive renders three lines: the word, the basis, the retry",
   /undetermined/.test(three) && /<b>basis<\/b>/.test(three) && /<b>retry<\/b>/.test(three));
ok("a form the plane never published renders NOTHING, not the caller's words",
   ctx.__undeterminedPane("a basis", "the reviewer thought it looked weak", [])==="");
ok("an absent form renders NOTHING", ctx.__undeterminedPane("a basis", undefined, [])==="");
ok("an empty form renders NOTHING", ctx.__undeterminedPane("a basis", "", [])==="");
/* A key that LOOKS like plane vocabulary but is not one of the three is still
   not a sentence: the closed set is the set, not a suggestion. */
ok("a plausible-looking key outside the closed set renders NOTHING",
   ctx.__undeterminedPane("a basis", "unrated", [])==="" && ctx.__undeterminedPane("a basis", "undetermined", [])==="");

/* ============ (7) Q12: ONE PLANE-SOURCED SENTENCE, NO NARRATED CONTROLS ============ */
ctx.__PLANE.me = { member:"m_vera", session:true, administer:false, capabilities:["view"] };
const ro = await open("INQ-2026-0001");
PAGES.push(["the read-only view", ro]);
const SENT = "This credential can read this question and cannot act on it.";
ok("a read-only credential is told once, at the surface, what its credential is", ro.includes(SENT));
ok("the credential sentence appears exactly once", (ro.split(SENT).length-1)===1);
ok("a read-only credential sees the WHOLE page — the basis", ro.includes("INFO-2026-0200"));
ok("a read-only credential sees the WHOLE page — both strengths",
   /Documents[\s\S]*?Grade C/.test(ro) && /Links[\s\S]*?Grade B/.test(ro));
ok("a read-only credential sees the WHOLE page — what relies on it", ro.includes("The marina money"));
ok("no control is greyed", !/disabled/.test(ro));
ok("no control is narrated per-control", !/you (can|may) not|not permitted|insufficient/i.test(ro));
/* NO ACT BAR THIS TURN, and therefore no surface-side option map. */
ok("the page renders no act control at all", !/<button/.test(ro));
ok("the page names no act", !/Conclude|Defer|Dismiss|Publish this|Divide/.test(ro));
ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };
const acting = await open("INQ-2026-0001");
ok("a credential that can act is told nothing about it", !acting.includes(SENT));
ok("the page still renders no act control for a contribute holder (UI-12 adds it)", !/<button/.test(acting));

/* ============ (8) THE CRUMB SURVIVES EVERY STATE, AND THE ROUTE IS REAL ============ */
const missing = await open("INQ-NOPE");
ok("a question that does not exist says so", /was not found/.test(missing));
ok("THE CRUMB SURVIVES a not-found", /class="crumb"/.test(missing) && missing.includes("INQ-NOPE"));
ok("the crumb still offers the way back", /onclick="go\('record'\)"/.test(missing));
const wrong = await open("INFO-2026-0100");
ok("a document that is not a question is refused politely", /is not a question/.test(wrong));
ok("THE CRUMB SURVIVES the wrong type", /class="crumb"/.test(wrong));
/* errPane's correction is additive: an existing caller with no crumb is unchanged. */
ok("errPane without a crumb is byte-identical to what it always was",
   ctx.__errPane({error:"x"})===`<div class="teach" style="margin:8px 0">x</div>`);
ok("errPane with a crumb renders the crumb ABOVE the message",
   ctx.__errPane({error:"x"}, ctx.__recordCrumb("INQ-1")).indexOf("crumb") < ctx.__errPane({error:"x"}, ctx.__recordCrumb("INQ-1")).indexOf("teach"));
/* the route */
ctx.location.hash = "#inquiry/INQ-2026-0001";
ok("#inquiry/<id> is a route the app answers", ctx.__routeFromHash()===true);
ctx.location.hash = "#record";
ok("a hash that is not an inquiry route is left alone", ctx.__routeFromHash()===false);

/* ============ the vocabulary guard, over every page rendered ============ */
for(const [where, html] of PAGES){
  for(const word of ["op=", "bundle_id", "fm_json", "grade_axis", "grade_source", "capture_sha",
                     "current_state=", "published_strength", "inquiry_basis", "not_load_bearing"])
    ok(`${where} never says "${word}"`, !html.includes(word));
  /* D-160: the retired word means the OPPOSITE in SB-OUTPUT §5.1. */
  ok(`${where} never uses the retired word for the boundary case`,
     !new RegExp("susp"+"end", "i").test(html));
}

if(fails.length){ console.error(`inquiry-page: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`inquiry-page: ${n} assertions, all green — two strengths never one, a cuts_against leg counted on its own axis, an ungraded leg inert and named, UNRATED as the boundary word, a visible hunch with its cannot-publish note, one three-line primitive over a closed set of three, one plane-sourced credential sentence, and a crumb that survives every state`);
