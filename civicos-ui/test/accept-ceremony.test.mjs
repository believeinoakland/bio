/* UI-43 — THE ACCEPT CEREMONY: THE FOUR BEATS, THE AFFIRMATION, AND THE THREE
 * THINGS THE PAGE MUST SAY BEFORE A MEMBER'S NAME LANDS.
 *
 * Drives `acceptCeremonyOpen`, `acerChoose`, `acerAffirm`, `acerPreview`,
 * `acerReason`, `acerSend`, `acerStrengthShow` and `acceptCeremonyRouteFromHash`
 * over a mock plane answering the four reads the surface consumes —
 * `op=basisversions` (through UI-42's ONE door), `op=affordances`, `op=airun`
 * (through UI-38's ONE door) and `op=versionstrength` — and the four acts it
 * hosts, each asked twice: once with `preview=1` and once for real. Every answer
 * is WRAPPED, `{ok:true, result:…}`, which is what the plane's generic
 * passthrough sends and what `check-mock-envelope.mjs` re-checks at runtime.
 *
 * WHAT THE ITEM IS JUDGED ON, and each has its own section below:
 *
 *   (1) THE FOUR BEATS, EACH DRIVEN RATHER THAN DESCRIBED. §6 rule 4: *"choose ·
 *       see what will be refused BEFORE it runs · author the reason · receipt."*
 *       Beat 2 is asserted AT THE WIRE — the preview call carries `preview=1`,
 *       the plane answers `wrote:false`, and the SAME argument builder produces
 *       the act's parameters, so the pre-flight cannot come to ask a different
 *       question from the act it fronts.
 *   (2) THE PER-SET AFFIRMATION GATES THE ACCEPT (DEC-32 clause 4, the
 *       anti-gaming keystone). A reading filed as more than one set of reasons
 *       cannot be accepted until each set has been affirmed: the control is
 *       ABSENT, `acerSend` is a second independent defence at the send, and the
 *       wire proves nothing was written.
 *   (3) THE ORDERING RULE IS STRUCTURAL (DEC-32 clause 5). `op=versionstrength`
 *       is NOT ASKED before the affirmation is complete — asserted over the
 *       CALLS the mock recorded, not over the markup, because a number fetched
 *       and not drawn is a number an extra code path can draw.
 *   (4) DEC-46's LENS DIFF RENDERS IN THE CEREMONY. It is on the page, in the
 *       flow, above the control; `moved` stays three-valued and the unknown is
 *       rendered as an unknown rather than as "it held".
 *   (5) REC-36's STRICTER WITHHOLDING. A reading composed by a run this
 *       credential cannot open loses the ACCEPT control and keeps the other
 *       three, and the page says which and why.
 *   (6) D-195 IS STATED AS UNTOLD. No read op publishes `shared_origins` for a
 *       stored reading, so the page says it has not been told and never says
 *       nothing shared an origin.
 *   (7) REFUSALS ARE THE PLANE'S OWN WORDS — the DEC-49 canned TRANSLATION and
 *       the detail, both verbatim, neither authored here.
 *   (8) DEC-32 CLAUSE 1 / D-226 — NOT ONE ANALYST WORD ON ANY SURFACE THIS FLOW
 *       RENDERS, swept over every phase rather than spot-checked. The fixture is
 *       loaded three ways: a set label carrying three banned words, an axis
 *       `detail` in the plane's own spelling carrying three more, and a run
 *       label. A renderer that ever printed any of them fails here.
 *
 * WHAT THIS SUITE CAN AND CANNOT SEE, stated plainly because a matcher trusted
 * past its reach is this estate's most-repeated instrument failure:
 *   IT CAN see every string the surface renders in every phase it drives, and
 *     every call the surface made, with that call's parameters.
 *   IT CANNOT reproduce `hashchange`. A real browser fires it asynchronously
 *     after an address write and this harness's DOM stub fires no events at all,
 *     so section 9 drives the router DIRECTLY at the current address. That is a
 *     SUBSTITUTE and is labelled as one; it establishes that the router
 *     re-entering on an address it is already showing does not rebuild state,
 *     and it establishes nothing about the event.
 *   IT CANNOT judge whether the plane's answers are right. That `op=suggest`
 *     refuses a machine over shared origins is PL-3's acceptance; that
 *     `op=versionstrength` composes no third figure is PL-14's. This suite
 *     asserts only what the SURFACE does with what it received.
 *   IT CANNOT tell an authored English "and"/"or" from the analyst's connective
 *     by spelling alone, which is why the banned pattern for the connective is
 *     CASE-SENSITIVE — the elicitation suite's own bound, inherited here
 *     deliberately so one rule judges the act, its elicitation, its review and
 *     its ceremony.
 *   IT CANNOT see a refusal shape the mock never returns.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/accept-ceremony.control.mjs` — nine
 * arms plus a BASELINE row, each armed ALONE on the real `civicos-ui/app.html`
 * with every other defence held open, every restore verified by sha256 AND by
 * content against a per-arm, uniquely named pristine copy kept inside this
 * worktree, byte count printed and a floor guarded. Declared expectations and
 * measured results are printed on every run of that file.
 *
 * (1) `acerAffirmedAll` returns true unconditionally -> the control-is-absent,
 *     send-refuses-too and ordering arms fail; the one-set arm stays green.
 * (2) `acerLensHtml` renders nothing -> the DEC-46 arms fail.
 * (3) the plane's own axis `detail` is rendered verbatim -> the vocabulary sweep
 *     fails naming the phase and the word.
 * (4) `op=versionstrength` is asked during the load -> the two ordering arms
 *     fail at the WIRE while every affirmation arm stays green.
 * (5) `acerBeyondGate` returns "" -> the REC-36 withholding arms fail.
 * (6) the DEC-49 canned translation is dropped and only the detail rendered ->
 *     the canned-translation arm fails and the detail and code arms do not.
 * (7) `acerPreview` composes an answer instead of asking -> the beat-2 wire arm
 *     fails.
 * (8) `acerAffirmedAll` rewritten as an indexed loop -> MUST PASS 90/90.
 * (9) the sets' names composed by reduce instead of join -> MUST PASS 90/90.
 *
 * TWO ARMS CAME BACK NOT AS DECLARED ON THE FIRST RUN AND BOTH ARE RECORDED IN
 * THAT FILE RATHER THAN SMOOTHED: arm (4) was ARMED WRONG — its patch went
 * between an `if` and its `else`, `app.html` stopped parsing, and the suite died
 * before any assertion ran, reported as `-1` and never as `0`; and arm (1)'s
 * DECLARATION was wrong rather than its patch, having conflated the affirmation
 * GATE with the never-prefilled rule, which are two independent defences.
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";
import { VERSION_MACHINE } from "../../bio-plane/checks/bio-checks.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ============================ THE FIXTURE ============================
   EVERY VALUE IS FIXED. Nothing here is drawn at runtime — not a date, not an
   id, not a count. Two fixtures in this directory have been refused by a plane
   check that did not exist when they were written, both because they generated
   a value instead of stating one. */
const INQ = "INQ-2026-0043";

/* THE THREE STRINGS THAT MUST NEVER REACH A MEMBER, and each is a different
   SOURCE of the same hazard rather than three spellings of one.
     · the record's own filing name for a set of reasons, member-authored;
     · the PLANE'S OWN success sentence for an axis — `#axisResult` composes
       exactly this shape, and it is why this surface renders the axis's state
       and letter and never its detail. Measured at this item against
       `store.mjs`, not invented for a fixture;
     · a run's operator-authored label. */
const LEAKY_LABEL = "OR-branch: the ground partition";
const LEAKY_AXIS_DETAIL =
  "capture B — the STRONGEST of the 2 independently sufficient grounds this conclusion rests on, "
+ "which is \"set-b\", and no stronger than the weakest capture WITHIN that ground, which is INFO-2026-0700.";
const LEAKY_RUN_LABEL = "ground-partition sweep (AND/OR)";

/* THE MULTI-SET READING. Machine-composed, filed as TWO sets each offered as
   carrying the answer on its own — so accepting it is the act DEC-32 clause 4
   guards, and this is the fixture the keystone is driven over. */
const V_MULTI = {
  name: "two-set-reading",
  description: "The authority paid the contractor before the council had voted.",
  relationship: "or",
  grounds: [LEAKY_LABEL, "set-b"],
  state: "suggested",
  derived_from: null,
  hidden: false,
  claim: null,
  run: "AIS-7",
  author: "m_alice",
  at: "2026-08-08T09:00:00Z",
  moved: null,
  regroup: null,
  composition: null,
  leg_count: 3,
  legs_complete: true,
  legs: [
    { ord:0, target_id:"INFO-2026-0600", target_type:"information", role:"supports",
      grade:"A", grade_axis:"capture", grade_source:"resolution", note:null,
      at:"2026-08-08T09:00:00Z", ground:LEAKY_LABEL },
    { ord:1, target_id:"INFO-2026-0700", target_type:"information", role:"supports",
      grade:"B", grade_axis:"capture", grade_source:"resolution", note:null,
      at:"2026-08-08T09:00:00Z", ground:"set-b" },
    { ord:2, target_id:"INFO-2026-0800", target_type:"information", role:"supports",
      grade:"C", grade_axis:"connection", grade_source:"inherited", note:null,
      at:"2026-08-08T09:00:00Z", ground:"set-b" },
  ],
};

/* THE ONE-SET READING. Member-composed, nothing to affirm — the degenerate case
   the keystone must NOT fire on, because with one set the arithmetic takes no
   maximum and filing claims nothing. */
const V_SINGLE = {
  name: "one-set-reading",
  description: "The authority paid the contractor after the vote.",
  relationship: "and",
  grounds: ["set-a"],
  state: "suggested",
  derived_from: null, hidden: false, claim: null, run: null,
  author: "m_cara", at: "2026-08-08T10:00:00Z",
  moved: null, regroup: null, composition: null,
  leg_count: 1, legs_complete: true,
  legs: [
    { ord:0, target_id:"INFO-2026-0900", target_type:"information", role:"supports",
      grade:"B", grade_axis:"capture", grade_source:"resolution", note:null,
      at:"2026-08-08T10:00:00Z", ground:"set-a" },
  ],
};

/* THE READING COMPOSED BEYOND THE GATE (REC-36). It names a run, and the run is
   in a context this credential was never invited to — so `op=airun` answers for
   it exactly as it answers for a run that does not exist. */
const V_BEYOND = {
  name: "beyond-the-gate-reading",
  description: "The contractor and the authority share a director.",
  relationship: "and",
  grounds: ["set-c"],
  state: "suggested",
  derived_from: null, hidden: false, claim: null, run: "AIS-DARK",
  author: "m_dana", at: "2026-08-08T11:00:00Z",
  moved: null, regroup: null, composition: null,
  leg_count: 1, legs_complete: true,
  legs: [
    { ord:0, target_id:"INFO-2026-1000", target_type:"information", role:"supports",
      grade:null, grade_axis:null, grade_source:null, note:null,
      at:"2026-08-08T11:00:00Z", ground:"set-c" },
  ],
};

/* THE ALREADY-ADOPTED READING, so the reject path and the DEFAULT state set are
   both driven: `op=versionstrength` counts adopted readings unless told
   otherwise, and this is the one where the surface must NOT name a state. */
const V_ADOPTED = {
  name: "adopted-reading",
  description: "The payment and the vote are the same week.",
  relationship: "and",
  grounds: ["set-d"],
  state: "accepted",
  derived_from: null, hidden: false, claim: null, run: null,
  author: "m_alice", at: "2026-08-07T09:00:00Z",
  moved: { by:"m_alice", at:"2026-08-07T10:00:00Z", reason:null },
  regroup: null, composition: null,
  leg_count: 1, legs_complete: true,
  legs: [
    { ord:0, target_id:"INFO-2026-1100", target_type:"information", role:"supports",
      grade:"A", grade_axis:"capture", grade_source:"resolution", note:null,
      at:"2026-08-07T09:00:00Z", ground:"set-d" },
  ],
};

const VERSIONS = [V_MULTI, V_SINGLE, V_BEYOND, V_ADOPTED];

/* THE PLANE'S OWN ACT ROWS, in `affordances.mjs`'s shape. The labels are the
   producer's words and the surface renders them unmodified (DEC-8). */
const ACTS = [
  { id:"versionaccept",   label:"Adopt this reading of the evidence",              weight:"single", needs:"contribute", mode:"session", rung:"reversible", prompt:null },
  { id:"versionreject",   label:"Turn this reading down, and say why",             weight:"single", needs:"contribute", mode:"session", rung:"reversible", prompt:null },
  { id:"versionconsider", label:"Set this reading aside to decide on, and say why", weight:"single", needs:"contribute", mode:"session", rung:"reversible", prompt:null },
  { id:"versionrevert",   label:"Put this reading back where nobody had acted on it", weight:"single", needs:"contribute", mode:"session", rung:"reversible", prompt:null },
];

/* THE PLANE'S OWN REFUSAL, code + CANNED TRANSLATION + detail, in the shape
   `VERSION_ACT_CHECKS` produces. The translation and the detail are DIFFERENT
   strings on purpose: the surface must render both and author neither, and a
   surface rendering only one of them would pass a test that typed one. */
const NO_REASON_TRANSLATION = "The record keeps the reason with the decision, so it will not take one without the other.";
const NO_REASON_DETAIL =
  "op=versionreject records WHY. The record of what was turned down is the anti-omission instrument "
+ "and it is worthless without the reason.";

const WROTE = [];          /* every act the mock actually WROTE, in order */
const CALLS = [];          /* every op asked, with its parameters */

function versionsAnswer(){
  return { ok:true, inquiry:INQ, inquiry_present:true,
           versions: VERSIONS.map(v => ({ ...v })),
           count: VERSIONS.length, total: VERSIONS.length,
           limit: 200, offset: 0, truncated: false };
}

function mockFetch(u){
  const url = new URL(u, "https://plane.test");
  const op = url.searchParams.get("op");
  const p = Object.fromEntries(url.searchParams.entries());
  CALLS.push({ op, params:p });
  const R = o => ({ ok:true, json:async()=>({ ok:true, result:o }) });

  if(op === "basisversions"){
    if(p.id !== INQ)
      return R({ ok:false, reason:"BASIS_VERSIONS_NOT_AN_INQUIRY", code:"BASIS_VERSIONS_NOT_AN_INQUIRY",
                 check:"C-25.19", translation:"The record answers this only for a question.",
                 detail:"that is not a question, so it holds no readings of its evidence." });
    return R(versionsAnswer());
  }
  if(op === "affordances"){
    if(!p.target) return R({ target:null, catalog:[], vocabularies:{} });
    if(p.target !== INQ) return R({ ok:false, reason:"NO_SUCH_BUNDLE", target:p.target });
    return R({ target:p.target, object_type:"inquiry", current_state:"open",
               acts: ACTS.map(a => ({ ...a })), vocabularies:{} });
  }
  if(op === "airun"){
    /* THE GATED RUN. `found:false` with `session:null` is exactly what the plane
       answers for a run that does not exist AND for one in a context the caller
       was never invited to — one answer, deliberately (store.mjs). */
    if(p.run === "AIS-DARK") return R({ run:p.run, found:false, session:null });
    if(p.run === "AIS-7") return R({ run:p.run, found:true, session:{
      id:"AIS-7", label:LEAKY_RUN_LABEL, mode:"investigative", status:"finished", ticks:12,
      created:"2026-08-08T08:00:00Z", updated:"2026-08-08T09:00:00Z", expires:"2026-08-15T08:00:00Z",
      context:{ type:"inquiry", id:INQ },
      principal:{ plane:"class:ai", claude:"account", ref:"acct-fixed", skill:"pack-fixed@1" },
      budget:[], condition:null,
      /* DEC-46's THREE PARTS, and `moved:true` is the case the item is judged on. */
      bias:{ in_force:true, stated:null,
             manifest:{ scope:"instance", scope_id:null, statements_sha:"sha-as-recorded", bundles:[] },
             now:{ in_force:true, statements_sha:"sha-as-it-stands", bundles:[] },
             moved:true },
      standard:{ in_force:false, basis:"context-has-no-project",
                 stated:"an inquiry outside any project has no bar", pair:null } } });
    return R({ run:p.run, found:false, session:null });
  }
  if(op === "versionstrength"){
    const v = VERSIONS.find(x => x.name === p.version);
    if(!v) return R({ ok:false, reason:"VERSION_STRENGTH_NO_SUCH_VERSION", code:"VERSION_STRENGTH_NO_SUCH_VERSION",
                      check:"C-30.5", translation:"No reading by that name belongs to this question.",
                      detail:"no reading named '" + String(p.version) + "' belongs to " + INQ + "." });
    const whatIf = !!p.states && p.states !== "accepted";
    return R({ ok:true, inquiry:INQ, version:v.name, version_state:v.state,
      state_set: p.states ? String(p.states).split(",") : ["accepted"],
      what_if: whatIf,
      filter: whatIf
        ? "WHAT-IF — a view you constructed, not what this record stands on. Computed over the reading '"
          + v.name + "', counting readings that are: " + p.states + "."
        : "Computed over the reading '" + v.name + "', counting only readings a member has adopted "
          + "(accepted). This is the record's own answer for this question and is not filtered.",
      depth_bound: 6,
      /* TWO AXES AND NO THIRD FIGURE. Each carries the plane's own `detail`,
         which is the string this surface must never render. */
      pair: {
        capture:    { axis:"capture", state:"graded", grade:"B", determined:true,
                      weakest:{ target_id:"INFO-2026-0700", grade:"B" },
                      load_bearing:2, population:3, not_load_bearing:[],
                      grounds:[{ ground:LEAKY_LABEL, state:"graded", grade:"A",
                                 weakest:{ target_id:"INFO-2026-0600", grade:"A" } },
                               { ground:"set-b", state:"graded", grade:"B",
                                 weakest:{ target_id:"INFO-2026-0700", grade:"B" } }],
                      detail: LEAKY_AXIS_DETAIL },
        connection: { axis:"connection", state:"unrated", grade:null, determined:false,
                      weakest:null, load_bearing:0, population:3, not_load_bearing:[],
                      grounds:[], detail:"UNRATED on connection: no leg on this axis carries an "
                                       + "established grade on any of the 2 grounds." },
      },
      ungraded:[], hunches:[], graded:[], grades_from:"earnedBasisRegistry",
      subject_entity:null, subject_known:false,
      legs_read: v.legs.length, legs_complete: v.legs_complete,
      hidden:false, derived_from:v.derived_from });
  }
  if(["versionaccept","versionreject","versionconsider","versionrevert"].includes(op)){
    const act = op.replace("version", "");
    const to = { accept:"accepted", reject:"rejected", consider:"considering", revert:"suggested" }[act];
    const v = VERSIONS.find(x => x.name === p.version);
    const preview = p.preview === "1" || p.preview === "true";
    const why = String(p.reason || "").trim();
    /* THE PLANE'S OWN ORDER: the reason is checked BEFORE the edge, and the
       preview runs every guard. So a reject with no reason refuses on BOTH
       paths, identically — which is the property that makes the pre-flight
       worth asking. */
    if((to === "rejected" || to === "considering") && !why)
      return R({ ok:false, reason:"VERSION_NO_REASON", code:"VERSION_NO_REASON", check:"C-25.26",
                 translation: NO_REASON_TRANSLATION, detail: NO_REASON_DETAIL,
                 act, target:p.target, version:p.version, from: v ? v.state : "", to });
    const receipt = { ok:true, act, target:p.target, version:p.version,
                      from: v ? v.state : "", to, moves_state:true, hidden:false,
                      reason: why || null, author:"m_alice", at:"2026-08-09T09:00:00Z", weight:"single" };
    if(preview) return R({ ...receipt, preview:true, would:act, wrote:false });
    WROTE.push({ act, version:p.version, reason: why || null });
    if(v) v.state = to;
    return R(receipt);
  }
  return { ok:false, json:async()=>({ ok:false, error:"unexpected op " + op }) };
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
  ";globalThis.__PLANE=PLANE;globalThis.__open=acceptCeremonyOpen;globalThis.__choose=acerChoose;" +
  "globalThis.__affirm=acerAffirm;globalThis.__preview=acerPreview;globalThis.__reason=acerReason;" +
  "globalThis.__send=acerSend;globalThis.__strength=acerStrengthShow;" +
  "globalThis.__route=acceptCeremonyRouteFromHash;globalThis.__ACER=()=>ACER;" +
  "globalThis.__ACTS=ACER_ACTS;globalThis.__KEYSTONE=ACER_KEYSTONE_ACT;" +
  "globalThis.__UNTOLD=ACER_ORIGINS_UNTOLD;globalThis.__AFFIRM_OFFER=ACER_AFFIRM_OFFER;" +
  "globalThis.__AFFIRM_LIMIT=ACER_AFFIRM_LIMIT;" +
  "globalThis.__FAILS_ALL=VREV_FAILS_ALL;globalThis.__FAILS_ANY=VREV_FAILS_ANY;" +
  "globalThis.__STATE_WORD=VREV_STATE_WORD;globalThis.__params=acerActParams;" +
  "globalThis.__needs=acerNeedsAffirmation;globalThis.__setKeys=acerSetKeys;", ctx);

ctx.__PLANE.session = true;
ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };

const content = () => els.get("#content")._html;
const strip = h => String(h||"").replace(/<[^>]*>/g, " ").replace(/&middot;/g, " ").replace(/&rsaquo;/g, " ")
  .replace(/&mdash;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">").replace(/&rsquo;/g, "'").replace(/\s+/g, " ");

const PHASES = [];
const keep = (where) => { const h = content(); PHASES.push([where, h]); return h; };
const callsOf = op => CALLS.filter(c => c.op === op);

console.log("\n--- accept ceremony (UI-43 / DEC-32 / D-195 / DEC-46 / REC-36) ---");

/* ============ 0. THE VOCABULARY THIS SURFACE DID NOT AUTHOR ============
   UI-42's delegation names this item and is binding: the two falsifier stems and
   the four state sentences are constants in the version-review block, pinned
   there against UI-27's elicitation and against the catalog's own
   `VERSION_MACHINE.legal`. This item REUSES them, and these arms are what make
   "reuses" a measured fact rather than an intention — a third spelling would
   show up here as a stem this ceremony renders that the review block does not
   hold. */
{
  const app = fs.readFileSync(new URL("../app.html", import.meta.url).pathname, "utf8");
  const acer = /\/\*__ACCEPT_CEREMONY_START__\*\/([\s\S]*?)\/\*__ACCEPT_CEREMONY_END__\*\//.exec(app);
  ok("the ceremony's own block was found in app.html — if this fails every source pin below is measuring nothing",
     !!acer && acer[1].length > 4000);
  const block = acer ? acer[1] : "";
  ok("REACH: the block is real code and not a comment — " + block.length + " chars, floor 4000",
     block.length > 4000 && block.includes("function acceptCeremonyHtml"));
  /* THE THIRD-SPELLING PIN. The ceremony's block must not declare a stem of its
     own: it may only reach UI-42's constants by name. */
  ok("the ceremony authors NO falsifier stem of its own — neither tail is written as a literal in its block",
     !block.includes("fails only if ALL of these fail") && !block.includes("fails if ANY of these fails"));
  ok("and it reaches UI-42's two constants by name instead",
     block.includes("vrevComposition"));
  ok("the two stems the ceremony will render ARE the review block's own, carrying the elicitation's tails",
     ctx.__FAILS_ALL.includes("fails only if ALL of these fail")
     && ctx.__FAILS_ANY.includes("fails if ANY of these fails"));
  /* AND THE CATALOG'S FOUR STATES, imported rather than copied, exactly as
     UI-42 pinned them — asserted here too because THIS surface renders them. */
  const legal = [...VERSION_MACHINE.legal].sort();
  ok("the catalog's version states were imported and are non-empty — an empty set would make the pin below vacuous",
     legal.length >= 4);
  ok("every state the catalog calls legal has a sentence this ceremony can render: " + legal.join(", "),
     legal.every(s => typeof ctx.__STATE_WORD[s] === "string" && ctx.__STATE_WORD[s].length > 10));
  /* THE FOUR ACTS, AND THE TWO IT DELIBERATELY DOES NOT HOST. */
  ok("the ceremony hosts exactly the four transition acts — found [" + ctx.__ACTS.join(", ") + "]",
     ctx.__ACTS.length === 4
     && ["versionaccept","versionreject","versionconsider","versionrevert"].every(a => ctx.__ACTS.includes(a)));
  ok("and neither versionhide (UI-42's) nor versioncurrent (UI-45's) is named in its act set",
     !ctx.__ACTS.includes("versionhide") && !ctx.__ACTS.includes("versioncurrent"));
  ok("the keystone guards the ADOPT act and is held in one constant rather than spelled at each site",
     ctx.__KEYSTONE === "versionaccept");
}

/* ============ 1. BEAT 1 — CHOOSE, AND NOTHING IS CHOSEN FOR YOU ============ */
await ctx.__open(INQ, V_MULTI.name);
{
  const h = keep("opened, nothing chosen");
  const t = strip(h);
  ok("BEAT 1: the reading named in the address is the one in front of the member",
     t.includes(V_MULTI.name) && t.includes(V_MULTI.description));
  ok("BEAT 1: no act is chosen on arrival — the ceremony offers the four the plane published and picks none",
     ctx.__ACER().act === null);
  ok("BEAT 1: and the four acts are offered in the PLANE's own labels, rendered unmodified",
     ACTS.every(a => t.includes(a.label)));
  ok("BEAT 1: with nothing chosen there is no reason box and no control that would write anything",
     !h.includes("acer-why") && !h.includes("acerSend()"));
  /* THE BOUND, STATED, AND IT IS THE RECORD'S OWN. UI-42's `versionReviewRead`
     states the ask and says the bound the record APPLIED; this ceremony calls
     that function rather than opening a second door, and the sentence travels. */
  ok("the record's own bound on the reading set is stated on the page — the bound it APPLIED, not the one asked for",
     t.includes("the bound it applied, not the one this page asked for"));
  const bv = callsOf("basisversions");
  ok("REACH: op=basisversions was asked exactly once and with an explicit ask — " + bv.length + " call(s)",
     bv.length === 1 && bv[0].params.limit === "200");
  /* D-195, SAID AS UNTOLD RATHER THAN AS CLEAN. */
  ok("D-195: nothing on this page says the sets rest on separate material — the page says it has not been told",
     t.includes("nobody has looked on your behalf here"));
}

/* ============ 2. DEC-46 — THE LENS DIFF, IN THE CEREMONY ============ */
{
  const h = PHASES[PHASES.length - 1][1];
  const t = strip(h);
  ok("DEC-46: the lens comparison is ON THE PAGE, in the flow — not a notice, not a toast",
     t.includes("IT HAS MOVED"));
  ok("DEC-46: and it names both sides, the run's own recorded lens and what stands now",
     t.includes("sha-as-recorded") && t.includes("sha-as-it-stands"));
  ok("DEC-46: the honest bound on the comparison is stated — it is not a comparison against a lens of the member's own",
     t.includes("the record holds none for a member"));
  ok("DEC-46: the lens block is rendered ABOVE the control that would write, so it cannot be missed by scrolling past a decision already made",
     h.indexOf("IT HAS MOVED") < h.indexOf("What you mean to do"));
  const ar = callsOf("airun");
  ok("REACH: op=airun was asked for the run this reading names, and only for that — " + ar.length + " call(s)",
     ar.length === 1 && ar[0].params.run === "AIS-7");
  ok("and the run's principal is named: this one was acting for the group rather than for one member",
     t.includes("acting for the group as a whole"));
}

/* ============ 3. THE KEYSTONE — DEC-32 CLAUSE 4 ============ */
ctx.__choose("versionaccept");
{
  const h = keep("accept chosen, nothing affirmed");
  const t = strip(h);
  ok("the keystone fires on a reading filed as more than one set of reasons",
     ctx.__needs(VERSIONS.find(v=>v.name===V_MULTI.name), "versionaccept") === true);
  ok("the affirmation is asked for once per set, and each set is named by the REASONS in it",
     t.includes("INFO-2026-0600") && t.includes("INFO-2026-0700, INFO-2026-0800"));
  ok("the offer says what the affirmation is a claim ABOUT",
     t.includes(strip(ctx.__AFFIRM_OFFER).trim()));
  ok("and it says what the record will and will not hold about it — undetermined stated, never implied",
     t.includes("There is no field for the saying-so itself"));
  ok("NOTHING IS PREFILLED: with nothing affirmed, no set reads as affirmed",
     !t.includes("You have said these carry it on their own"));
  ok("THE CONTROL IS ABSENT, NOT DISABLED — Q12's rule, and the shape a member cannot click by accident",
     !h.includes("acerSend()"));
  /* THE AFFIRMATION CONTROL CARRIES A POSITION AND NOT THE RECORD'S LABEL, and
     this arm reads the RAW markup rather than the stripped text because that is
     where the first version of this surface put the label — inside an `onclick`,
     invisible to a member and still on the page. Caught by this suite, corrected
     in the surface, and the arm is what stops it coming back. */
  ok("the affirmation control is keyed by POSITION, so the record's own filing label is not even in the served markup",
     /acerAffirm\(\d+\)/.test(h) && !h.includes(LEAKY_LABEL));
  /* THE SECOND, INDEPENDENT DEFENCE. A control merely not drawn is one another
     code path can reach, so the send itself refuses — and the WIRE is what
     proves it, not the markup. */
  const before = WROTE.length;
  await ctx.__send();
  ok("AND THE SEND REFUSES TOO: driving acerSend() with the affirmation outstanding writes NOTHING at the wire",
     WROTE.length === before);
  ok("and no act reached the plane at all on that attempt",
     callsOf("versionaccept").length === 0);
}

/* ============ 4. DEC-32 CLAUSE 5 — THE ORDERING RULE, AT THE WIRE ============ */
{
  await ctx.__strength();
  ok("ORDERING: op=versionstrength is NOT ASKED while the affirmation is outstanding — asserted over the calls, "
     + "because a number fetched and not drawn is a number an extra code path can draw",
     callsOf("versionstrength").length === 0);
  const t = strip(PHASES[PHASES.length - 1][1]);
  ok("and no letter, state or pair is on the page before it",
     !t.includes("What this reading comes to"));
}

/* ============ 5. BEAT 2 — SEE WHAT WOULD BE REFUSED BEFORE IT RUNS ============ */
ctx.__affirm(0);
{
  const h = keep("one set affirmed");
  ok("affirming one set is not affirming both — the control stays absent",
     !h.includes("acerSend()"));
  ok("and the set that WAS affirmed says so, while the other still offers the control",
     strip(h).includes("You have said these carry it on their own"));
}
ctx.__affirm(1);
{
  const h = keep("both sets affirmed");
  ok("with every set affirmed the control appears",
     h.includes("acerSend()"));
  /* THE ARGUMENT BUILDER IS ONE FUNCTION AND THAT IS WHY THE PRE-FLIGHT CANNOT
     DISAGREE WITH THE ACT. Asserted by comparing what it produces for the two. */
  const pv = ctx.__params(true), realp = ctx.__params(false);
  ok("BEAT 2: the preview's arguments are the act's arguments plus preview and nothing else",
     pv.target === realp.target && pv.version === realp.version
     && pv.preview === "1" && realp.preview === undefined
     && Object.keys(pv).length === Object.keys(realp).length + 1);
}
await ctx.__preview();
{
  const h = keep("preview taken");
  const t = strip(h);
  const pv = callsOf("versionaccept").filter(c => c.params.preview === "1");
  ok("BEAT 2: the plane was asked with preview=1 — the act's own parameter, running every guard",
     pv.length === 1 && pv[0].params.version === V_MULTI.name);
  ok("BEAT 2: and the page renders what came back rather than a prediction it composed",
     t.includes("ran every check and wrote nothing")
     && t.includes("it says so having tried, not having predicted"));
  ok("BEAT 2: it names the move the record would make, in the record's own from and to",
     t.includes("from suggested to accepted"));
  ok("BEAT 2: and the preview WROTE NOTHING, proved at the wire",
     WROTE.length === 0);
}

/* ============ 6. BEATS 3 AND 4 — THE REASON AND THE RECEIPT ============ */
{
  const h = PHASES[PHASES.length - 1][1];
  ok("BEAT 3: the reason box is offered and is EMPTY — nothing prefilled, nothing suggested",
     h.includes('id="acer-why"') && /<textarea class="txt" id="acer-why" rows="3"[^>]*><\/textarea>/.test(h));
  ok("BEAT 3: and the page does not hold a second copy of WHICH acts need one — it says the record refuses and says so",
     strip(h).includes("Where the record requires a reason it refuses without one"));
}
ctx.__reason("It matches the invoice dates in the record.");
await ctx.__send();
{
  const h = keep("accepted, receipt");
  const t = strip(h);
  ok("BEAT 4: the act reached the plane exactly once and wrote once",
     WROTE.length === 1 && WROTE[0].act === "accept" && WROTE[0].version === V_MULTI.name);
  ok("BEAT 4: the member's reason travelled with it, verbatim",
     WROTE[0].reason === "It matches the invoice dates in the record.");
  ok("BEAT 4: the receipt names what moved, from what to what, by whom and when",
     t.includes("moved from suggested to accepted") && t.includes("m_alice") && t.includes("2026-08-09T09:00:00Z"));
  ok("BEAT 4: and it says the act landed in the record and not only in the answer",
     t.includes("wrote this into the question"));
  ok("BEAT 4: the record was re-read after the act, so the page shows what the record holds rather than what the send assumed",
     callsOf("basisversions").length === 2);
}

/* ============ 7. THE ORDERING RULE, THE OTHER HALF ============ */
await ctx.__strength();
{
  const h = keep("strength, after the affirmation");
  const t = strip(h);
  const vs = callsOf("versionstrength");
  ok("ORDERING: op=versionstrength is asked only AFTER the affirmation, and only once, and only on asking",
     vs.length === 1 && vs[0].params.version === V_MULTI.name);
  /* THE READING IS ADOPTED BY NOW, so the surface must NOT name a state — the
     op's default is what the record stands on, and naming every state is what
     turns the record's own answer into an unlabelled what-if. */
  ok("and the state set is NOT widened: the reading is adopted, so the op's own default is what is asked for",
     vs[0].params.states === undefined);
  ok("the plane's own filter line is rendered VERBATIM — DEC-40: a filtered rendering states its filter IN the artifact",
     t.includes("This is the record's own answer for this question and is not filtered"));
  ok("two axes are rendered and no third figure is composed anywhere on the page",
     t.includes("How well the material behind it was captured")
     && t.includes("How well it is connected to the question"));
  ok("and the page says so, rather than merely avoiding it",
     t.includes("The record refuses to reduce them to one figure"));
  ok("the axis is rendered as its state, its letter and the reason that sets it",
     t.includes("graded B") && t.includes("INFO-2026-0700") && t.includes("unrated"));
  /* THE STRING THE PLANE SENDS AND THIS SURFACE REFUSES. */
  ok("THE PLANE'S OWN AXIS SENTENCE IS NOT RENDERED — it carries the vocabulary DEC-32 clause 1 forbids, "
     + "and the fixture sends it on every answer so a renderer that ever printed it fails here",
     !h.includes(LEAKY_AXIS_DETAIL) && !t.includes("independently sufficient"));
  ok("the strength block is rendered BELOW everything the member reads and affirms — clause 5's ordering, "
     + "held as a property of the page rather than of the stylesheet",
     h.indexOf("What this reading comes to") > h.indexOf("What you are being asked to say"));
}

/* ============ 8. THE ONE-SET READING — THE KEYSTONE MUST NOT FIRE ============ */
const AIRUN_BEFORE_SINGLE = callsOf("airun").length;
await ctx.__open(INQ, V_SINGLE.name);
ctx.__choose("versionaccept");
{
  const h = keep("one-set reading, accept chosen");
  const t = strip(h);
  ok("OVER-STRICTNESS: with one set of reasons there is no maximum to take, so nothing is affirmed and the control is there",
     ctx.__needs(VERSIONS.find(v=>v.name===V_SINGLE.name), "versionaccept") === false && h.includes("acerSend()"));
  ok("and the page asks the member to say nothing it has no reason to ask",
     !t.includes("carry the answer on their own"));
  ok("a member-composed reading says so, and no run sentence is composed about a reading that names none",
     t.includes("Composed by m_cara") && !t.includes("acting for"));
  ok("and no run was asked for — a reading naming none costs no read, so opening it added zero op=airun calls",
     callsOf("airun").length === AIRUN_BEFORE_SINGLE);
  /* THE FALSIFIER, IN UI-42's WORDS AND NOT A THIRD SPELLING. */
  ok("the derived falsifier is read back in plain words, and it is the elicitation's own stem",
     t.includes("fails if ANY of these fails"));
}

/* ============ 9. REC-36 — THE STRICTER WITHHOLDING ============ */
await ctx.__open(INQ, V_BEYOND.name);
{
  const h = keep("composed beyond the gate");
  const t = strip(h);
  ok("REC-36: the ADOPT act is WITHHELD when the reading was composed by a run this credential cannot open",
     !t.includes("Adopt this reading of the evidence"));
  ok("REC-36: and the other three stay — turning a reading down or setting it aside says what the record SHOWS, "
     + "and neither stands over evidence the member has not seen",
     t.includes("Turn this reading down") && t.includes("Set this reading aside")
     && t.includes("Put this reading back"));
  ok("REC-36: the page SAYS what it held back and why, rather than the control simply not being there",
     t.includes("composed by a run the record will not open for you"));
  ok("REC-36: the run WAS asked for — the withholding is a measured answer and not an assumption about a run nobody looked up",
     callsOf("airun").some(c => c.params.run === "AIS-DARK"));
  ok("and choosing the withheld act by any other route still cannot be reached from this page's own controls",
     !h.includes('acerChoose("versionaccept")'));
}

/* ============ 10. DEC-49 — REFUSALS IN THE PLANE'S OWN WORDS ============ */
ctx.__choose("versionreject");
await ctx.__preview();
{
  const h = keep("refused for want of a reason");
  const t = strip(h);
  ok("DEC-49: the plane's CANNED TRANSLATION is rendered verbatim",
     t.includes(NO_REASON_TRANSLATION));
  ok("DEC-49: and its detail is rendered verbatim beside it — two different strings, both the plane's, neither authored here",
     t.includes("the anti-omission instrument"));
  ok("DEC-49: the code is shown, so a member can quote it and a reader can find the check",
     t.includes("VERSION_NO_REASON"));
  ok("and this surface composed no sentence of its own about the refusal",
     !t.includes("You must") && !t.includes("Please "));
  /* AND THE PRE-FLIGHT AGREES WITH THE ACT, DRIVEN RATHER THAN ASSERTED. */
  const before = WROTE.length;
  await ctx.__send();
  ok("the act refuses identically and writes nothing — the same guard, the same words, because it is the same code path",
     WROTE.length === before && strip(content()).includes(NO_REASON_TRANSLATION));
}
ctx.__reason("The invoice it rests on was withdrawn by the issuer.");
await ctx.__send();
{
  keep("turned down, with a reason");
  ok("with the reason authored, the act goes through and the reason is what the member wrote",
     WROTE.length === 2 && WROTE[1].act === "reject"
     && WROTE[1].reason === "The invoice it rests on was withdrawn by the issuer.");
}

/* ============ 11. THE ADDRESS ============ */
{
  /* THE SUBSTITUTE, LABELLED. A real browser fires `hashchange` after an address
     write; this harness's DOM stub fires no events at all, so the router is
     driven DIRECTLY at the current address. That establishes re-entry behaviour
     and nothing about the event. */
  ctx.location.hash = "#accept/" + INQ + "/" + V_ADOPTED.name;
  ok("SUBSTITUTE FOR AN EVENT THIS HARNESS CANNOT FIRE: the router resolves an accept address",
     ctx.__route() === true);
  await new Promise(r => setTimeout(r, 0));
  ok("and it opened the reading the address names",
     ctx.__ACER().version === V_ADOPTED.name);
  const beforeCalls = CALLS.length;
  ok("re-entering on the address it is already showing resolves without rebuilding",
     ctx.__route() === true && CALLS.length === beforeCalls);
  ctx.location.hash = "#accept/" + INQ;
  ok("an address naming a question and no reading does NOT resolve — beat 1 says there is no default reading",
     ctx.__route() === false);
  ctx.location.hash = "#versions/" + INQ;
  ok("and the review surface's address is not this router's",
     ctx.__route() === false);
}
await ctx.__open(INQ, V_ADOPTED.name);
ctx.__choose("versionrevert");
{
  const h = keep("an adopted reading, revert chosen");
  ok("the record's own sentence for the state a reading is in is rendered — the catalog's vocabulary, not this page's",
     strip(h).includes(ctx.__STATE_WORD.accepted));
}
await ctx.__preview();
keep("revert previewed");

/* ============ 12. THE SWEEP — DEC-32 CLAUSE 1 / D-226 ============ */
{
  const BANNED = [
    [/\bground/i,             "the analyst's noun for a set of reasons"],
    [/\bpartition/i,          "the analyst's noun for how they are divided"],
    [/\bdisjunct/i,           "the analyst's word for the relationship"],
    [/\bbranch/i,             "the analyst's word for one of them"],
    [/\b(AND|OR)\b/,          "the connective, as vocabulary"],
    [/\b(and|or)-related\b/i, "the relationship, named"],
    [/\bindependently sufficient\b/i, "the analyst's phrase for what a set claims"],
  ];
  const hits = [];
  for(const [where, html] of PHASES){
    const t = strip(html);
    for(const [re, what] of BANNED)
      if(re.test(t)) hits.push(where + ": " + what + " — " + ((re.exec(t)||[])[0]));
  }
  ok("not one analyst word reaches the member on any surface this ceremony renders: " + (hits.join(" | ") || "clean"),
     hits.length === 0);
  ok("and the sweep saw the WHOLE flow rather than one phase of it — " + PHASES.length + " phases",
     PHASES.length >= 12 && PHASES.every(([, h]) => String(h).length > 200));
  ok("the sweep's corpus is real: " + PHASES.reduce((s,[,h])=>s+String(h).length,0) + " characters of rendered markup",
     PHASES.reduce((s,[,h])=>s+String(h).length,0) > 20000);
  /* THE INSTRUMENT'S OWN POLARITY, over all THREE loaded strings. A sweep that
     cannot fail passes everything, and this estate has measured three walks that
     were green over nothing. */
  ok("INSTRUMENT: the sweep DOES fire on the record's own set label",
     BANNED.some(([re]) => re.test(strip("<p>" + LEAKY_LABEL + "</p>"))));
  ok("INSTRUMENT: it DOES fire on the PLANE's own axis sentence, which is the string this item measured",
     BANNED.some(([re]) => re.test(strip("<p>" + LEAKY_AXIS_DETAIL + "</p>"))));
  ok("INSTRUMENT: and on a run's operator-authored label",
     BANNED.some(([re]) => re.test(strip("<p>" + LEAKY_RUN_LABEL + "</p>"))));
  /* THE WIRE NAMES ARE NOT A SURFACE. */
  ok("the ops this ceremony reaches are never rendered to the member",
     PHASES.every(([, h]) => { const t = strip(h);
       return !t.includes("basisversions") && !t.includes("versionstrength") && !t.includes("airun"); }));
  ok("and neither are the record's own filing labels, asserted directly as well as through the sweep",
     PHASES.every(([, h]) => !String(h).includes(LEAKY_LABEL) && !strip(h).includes("set-b")));
  ok("nor the run's own label, which is the operator's words about a job and not a sentence for a member",
     PHASES.every(([, h]) => !String(h).includes(LEAKY_RUN_LABEL)));
}

/* ============ 13. WHAT THIS PAGE NEVER CLAIMS ============ */
{
  /* ARM F's class, one surface over: a page reading a bounded op must not tell a
     member it holds everything. Asserted here as well as in `bound-sweep`
     because this page's own sentences are new. */
  const t = PHASES.map(([, h]) => strip(h)).join(" ");
  ok("no sentence on this page claims to be all of anything the record bounds",
     !/\bnot capped\b/i.test(t) && !/\buncapped\b/i.test(t)
     && !/\bunlimited\b/i.test(t) && !/\bunbounded\b/i.test(t));
  ok("and the page never says nothing shared an origin — the one sentence D-195 would make false",
     !/\bno shared\b/i.test(t) && !/\bnothing.{0,20}same material\b/i.test(t));
}

console.log("  CEREMONY CORPUS: " + PHASES.length + " phases · "
  + PHASES.reduce((s,[,h])=>s+String(h).length,0) + " chars of rendered markup · "
  + CALLS.length + " op calls across " + new Set(CALLS.map(c=>c.op)).size + " ops · "
  + WROTE.length + " writes");
console.log("accept-ceremony: " + (n - fails.length) + "/" + n + " assertions");
if(fails.length){ console.error("accept-ceremony: " + fails.length + " FAILED"); process.exit(1); }
