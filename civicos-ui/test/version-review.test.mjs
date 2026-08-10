/* UI-42 — VERSION REVIEW: ROTATION AND DIFF, THE DERIVATION, AND THE PRUNE
 * OFFER.
 *
 * Drives `versionReviewOpen`, `versionRotate`, `versionReviewShowAll` and
 * `versionHideSend` over a mock plane answering the two reads the surface
 * consumes — `op=basisversions` (PL-1/PL-2's read, in the store's own published
 * shape) and `op=affordances?target=` (DEC-8's one source for what may be done).
 * Both answer WRAPPED, `{ok:true, result:…}`, which is what the plane's generic
 * passthrough does and what `check-mock-envelope.mjs` re-checks at runtime.
 *
 * WHAT THE ITEM IS JUDGED ON, and each has its own section below:
 *
 *   (1) TWO VERSIONS ROTATED AND DIFFED. Rotation IS the diff: there is no
 *       second thing to select, and the reading you were on is what the next one
 *       is compared against. §14a's table, one line: *"rotate between versions;
 *       comparison IS the diff."*
 *   (2) THE PRUNE OFFER'S WORDING, ASSERTED VERBATIM — DEC-29(b)'s clause that
 *       the prompt must state the disclosure, applied to hiding: the offer says
 *       the reading stays in the record, stays askable by name, keeps every act
 *       already on it, and that this act is recorded too.
 *   (3) A HIDDEN VERSION IS REACHABLE VIA ITS QUERY. The act is DRIVEN, not
 *       assumed: the surface sends `op=versionhide`, the answer comes back
 *       carrying the reading still, the DISPLAY shrinks, and the reading is then
 *       reached by its own address `#versions/<INQ-…>/<name>` with its rejection
 *       act — who, when and their reason — intact. D-214: the display shrinks,
 *       the acts remain.
 *   (4) DEC-32 CLAUSE 1 / D-226 — NOT ONE ANALYST WORD ON ANY SURFACE THIS FLOW
 *       RENDERS. A SWEEP over every phase, not a spot check, and the fixture
 *       deliberately files one of its sets under a label containing three of the
 *       banned words: a surface that printed the record's own labels would fail
 *       here, and that is the arm rather than a comment saying labels are not
 *       printed.
 *   (5) THE DERIVATION, drawn from `derived_from` and from nothing else, with a
 *       parent outside the answer NAMED as outside rather than silently rooted.
 *
 * WHAT THIS SUITE CAN AND CANNOT SEE, stated plainly because a matcher trusted
 * past its reach is this estate's most-repeated instrument failure:
 *   IT CAN see every string the surface renders in every phase it drives, and it
 *     drives eight phases (the sweep asserts its own corpus size and floor).
 *   IT CANNOT see a phase it never drives — a refusal shape the mock never
 *     returns, or a rendering reached only from a route not exercised here.
 *   IT CANNOT judge whether the plane's own answer is right: `op=basisversions`
 *     returning a hidden version is PL-1/PL-2's acceptance, and this suite
 *     asserts only that the SURFACE does not undo it.
 *   IT CANNOT tell an authored English "and"/"or" from the analyst's connective
 *     by spelling alone, which is why the banned pattern for the connective is
 *     CASE-SENSITIVE and the surface renders ALL/ANY instead. That bound is the
 *     elicitation suite's own and is inherited here deliberately, so one rule
 *     judges the act, its elicitation and its review.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/version-review.control.mjs` — NINE
 * arms (six RED, two over-strictness GREEN, one baseline GREEN), each armed
 * ALONE on the real `civicos-ui/app.html` or on this file with every other
 * defence held open. RUN 2026-08-09: 9 arms, 9 as declared, every restore
 * verified by sha256 AND `cmp` against two independent pristine copies.
 * Declared expectations and measured results are in that file's header. The two
 * the item names: MAKE HIDE DELETE (the surface drops hidden readings at the
 * load) -> 10 of 85 fail, five of them the ACTS-PERSIST arms; LEAK A BANNED
 * WORD onto a rendered string -> the sweep fails naming the phase and the word.
 *
 * AND THE CONTROL FOUND THIS SUITE WRONG BEFORE IT FOUND THE SURFACE WRONG,
 * WHICH IS RECORDED HERE RATHER THAN IN A COMMIT MESSAGE: arm 3's first run came
 * back RED but NOT AS DECLARED, because the verbatim arm was comparing the
 * rendered page against the RUNTIME'S OWN constant and therefore stayed green
 * while the ruling's sentence was cut in half. See section 4's note. In this
 * estate the controls find the instrument wrong more often than the subject, and
 * this is the fifth-odd receipt for it.
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";
/* UI-53: the DEC-32 clause 1 ban family is DERIVED IN ONE PLACE and this suite
   CONSUMES it, rather than hand-writing a rival copy. See
   `analyst-vocabulary.mjs` for what it is derived from and what it cannot see. */
import { analystHits, reachLine } from "./analyst-vocabulary.mjs";
import { VERSION_MACHINE } from "../../bio-plane/checks/bio-checks.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ============================ THE FIXTURE ============================
   EVERY VALUE IS FIXED. Nothing here is drawn at runtime — not a date, not an
   id, not a count. Two fixtures in this directory have been refused by a plane
   check that did not exist when they were written, both because they generated
   a value instead of stating one, and a fixture that cannot be re-read
   identically tomorrow is not a fixture. */
const INQ = "INQ-2026-0042";

/* THE LABEL THAT MUST NEVER REACH A MEMBER. It is the record's own filing name
   for a set of reasons, it is member-authored, and this one is written to
   contain three of the words DEC-32 clause 1 forbids. If the surface ever
   printed a label, section 4's sweep fails on this string. */
const LEAKY_LABEL = "OR-branch: the ground partition";

const V_FIRST = {
  name: "first-reading",
  description: "The fund paid for the marina directly.",
  relationship: "and",
  grounds: ["set-a"],
  state: "suggested",
  derived_from: null,
  hidden: false,
  claim: null,
  run: null,
  author: "m_alice",
  at: "2026-08-07T09:00:00Z",
  moved: null,
  regroup: null,
  composition: null,
  leg_count: 2,
  legs_complete: true,
  legs: [
    { ord:0, target_id:"INFO-2026-0100", target_type:"information", role:"supports",
      grade:"A", grade_axis:"capture", grade_source:"resolution", note:null,
      at:"2026-08-07T09:00:00Z", ground:"set-a" },
    { ord:1, target_id:"INFO-2026-0200", target_type:"information", role:"supports",
      grade:"C", grade_axis:"capture", grade_source:"resolution", note:null,
      at:"2026-08-07T09:00:00Z", ground:"set-a" },
  ],
};

const V_SECOND = {
  name: "second-reading",
  description: "The fund paid for the marina through the harbour authority.",
  relationship: "or",
  grounds: [LEAKY_LABEL, "set-a"],
  state: "accepted",
  derived_from: "first-reading",
  hidden: false,
  claim: null,
  run: "AIS-1",
  author: "m_alice",
  at: "2026-08-08T09:00:00Z",
  moved: { by:"m_alice", at:"2026-08-08T10:00:00Z", reason:null },
  regroup: null,
  composition: null,
  leg_count: 2,
  legs_complete: true,
  legs: [
    { ord:0, target_id:"INFO-2026-0100", target_type:"information", role:"supports",
      grade:"A", grade_axis:"capture", grade_source:"resolution", note:null,
      at:"2026-08-08T09:00:00Z", ground:"set-a" },
    { ord:1, target_id:"INFO-2026-0300", target_type:"information", role:"supports",
      grade:"B", grade_axis:"connection", grade_source:"inherited", note:null,
      at:"2026-08-08T09:00:00Z", ground:LEAKY_LABEL },
  ],
};

/* THE ONE THAT GETS HIDDEN, and it is REJECTED before it is hidden — the two are
   different facts and D-214 keeps both. Its rejection carries a member, an
   instant and an authored reason, which is what the acts-persist arms read back
   after the display has stopped showing it. */
const V_TURNED_DOWN = {
  name: "turned-down-reading",
  description: "The marina was paid for out of the general fund.",
  relationship: "and",
  grounds: ["set-c"],
  state: "rejected",
  derived_from: "second-reading",
  hidden: false,
  claim: null,
  run: null,
  author: "m_bob",
  at: "2026-08-08T10:30:00Z",
  moved: { by:"m_bob", at:"2026-08-08T11:00:00Z",
           reason:"The invoice it rests on was withdrawn by the issuer." },
  regroup: null,
  composition: null,
  leg_count: 1,
  legs_complete: true,
  legs: [
    { ord:0, target_id:"INFO-2026-0400", target_type:"information", role:"supports",
      grade:null, grade_axis:null, grade_source:null, note:null,
      at:"2026-08-08T10:30:00Z", ground:"set-c" },
  ],
};

/* THE UNSTATED COMPOSITION, and the CUT ANSWER. Two honest absences on one
   fixture: the record holds no relationship for this reading, and the answer
   carries fewer of its reasons than the record holds. Neither is guessed at. */
const V_UNSTATED = {
  name: "orphan-reading",
  description: "",
  relationship: "",
  grounds: ["set-d"],
  state: "considering",
  derived_from: "a-reading-not-in-this-answer",
  hidden: false,
  claim: null,
  run: null,
  author: "m_cara",
  at: "2026-08-08T12:00:00Z",
  moved: { by:"m_cara", at:"2026-08-08T12:30:00Z", reason:"Waiting on the audit." },
  regroup: null,
  composition: null,
  leg_count: 9,
  legs_complete: false,
  legs: [
    { ord:0, target_id:"INFO-2026-0500", target_type:"information", role:"supports",
      grade:null, grade_axis:null, grade_source:null, note:null,
      at:"2026-08-08T12:00:00Z", ground:"set-d" },
  ],
};

const HIDDEN = new Set();   /* what the plane has been told to hide, by name */

function versionsAnswer(){
  /* THE PLANE DOES NOT DROP A HIDDEN READING, AND THAT IS THE CONTRACT THIS
     MOCK HOLDS: `op=basisversions` returns it with `hidden: true` on it, because
     an op that filtered it here would make hiding into deleting one layer down
     (the store says so at `basisVersions`). PL-1/PL-2's own suites own that
     assertion; this mock reproduces it so the SURFACE can be judged against the
     answer it will really get. */
  const rows = [V_FIRST, V_SECOND, V_TURNED_DOWN, V_UNSTATED]
    .map(v => ({ ...v, hidden: HIDDEN.has(v.name) ? true : v.hidden }));
  return { ok:true, inquiry:INQ, inquiry_present:true, versions:rows,
           count:rows.length, total:rows.length, limit:200, offset:0, truncated:false };
}

const CALLS = [];
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
                 detail:"that is not a question, so it has no readings of its evidence." });
    return R(versionsAnswer());
  }
  if(op === "affordances"){
    const target = p.target;
    if(!target) return R({ target:null, catalog:[], vocabularies:{} });
    if(target !== INQ) return R({ ok:false, reason:"NO_SUCH_BUNDLE", target });
    /* The plane's own act row, in the producer's shape. The label is
       affordances.mjs's own words and is rendered unmodified by the surface. */
    return R({ target, object_type:"inquiry", current_state:"open",
      acts:[{ id:"versionhide", label:"Hide a reading from the display (it stays in the record)",
              weight:"single", needs:"contribute", mode:"session", rung:"reversible", prompt:null }],
      vocabularies:{} });
  }
  if(op === "versionhide"){
    const name = p.version;
    const on = !(p.hidden === "0" || p.hidden === "false");
    if(on) HIDDEN.add(name); else HIDDEN.delete(name);
    return R({ ok:true, act:"hide", target:p.target, version:name, from:"rejected", to:"rejected",
               moves_state:false, hidden:on, reason:null, author:"m_alice",
               at:"2026-08-09T08:00:00Z", weight:"single" });
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
  ";globalThis.__PLANE=PLANE;globalThis.__open=versionReviewOpen;globalThis.__rotate=versionRotate;" +
  "globalThis.__showAll=versionReviewShowAll;globalThis.__hide=versionHideSend;" +
  "globalThis.__route=versionReviewRouteFromHash;globalThis.__VREV=()=>VREV;" +
  "globalThis.__STATE_WORD=VREV_STATE_WORD;globalThis.__HIDE_OFFER=VREV_HIDE_OFFER;" +
  "globalThis.__FAILS_ALL=VREV_FAILS_ALL;globalThis.__FAILS_ANY=VREV_FAILS_ANY;" +
  "globalThis.__UNSTATED=VREV_COMPOSITION_UNSTATED;globalThis.__comp=vrevComposition;" +
  "globalThis.__tree=vrevTree;globalThis.__diff=vrevDiff;globalThis.__ask=VREV_ASK;", ctx);

ctx.__PLANE.session = true;
ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };

const content = () => els.get("#content")._html;
const strip = h => String(h||"").replace(/<[^>]*>/g, " ").replace(/&middot;/g, " ").replace(/&rsaquo;/g, " ")
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/\s+/g, " ");

/* EVERY PHASE THIS FLOW RENDERS, kept for the sweep in section 4. The sweep is
   the item's acceptance clause and not a spot check, so it runs over all of
   them and asserts its own corpus size. */
const PHASES = [];
const keep = (where) => { const h = content(); PHASES.push([where, h]); return h; };

console.log("\n--- version review (UI-42 / D-217 / D-214 / DEC-32) ---");

/* ====================== 0. THE VOCABULARY THE CATALOG OWNS ====================== */
{
  /* The catalog is IMPORTED, never copied: a fifth version state added there
     fails here rather than rendering a blank line beside a reading. That is
     check-semantics.mjs's rule applied to the one catalog-owned vocabulary this
     surface renders. */
  const legal = [...VERSION_MACHINE.legal].sort();
  const declared = Object.keys(ctx.__STATE_WORD).sort();
  ok("the catalog's version states were imported and are non-empty — an empty set would make the pin below vacuous",
     legal.length >= 4);
  ok("every state the catalog calls legal has a sentence a member reads: " + legal.join(", "),
     legal.every(s => typeof ctx.__STATE_WORD[s] === "string" && ctx.__STATE_WORD[s].length > 10));
  ok("and the surface invents no state the catalog does not declare — found [" + declared.join(", ") + "]",
     declared.every(s => legal.includes(s)));
}

/* ============ 0b. THE TWO STEMS ARE THE ELICITATION'S OWN WORDS ============
   Two copies of one member-facing sentence is a drift hazard; the pin is what
   makes drift VISIBLE rather than silent. It reads the ELICITATION block out of
   app.html — a different region, owned by UI-27 — and requires the distinctive
   tail of each stem to still be there. If UI-27's wording moves, this fails and
   the next session re-words both instead of shipping two answers to one
   question. */
{
  const app = fs.readFileSync(new URL("../app.html", import.meta.url).pathname, "utf8");
  const m = /\/\*__ELICITATION_START__\*\/([\s\S]*?)\/\*__ELICITATION_END__\*\//.exec(app);
  ok("the elicitation block was found in app.html — if this fails the pin needs re-anchoring, not deleting",
     !!m && m[1].length > 1000);
  const elic = m ? m[1] : "";
  ok("the ALL stem is the elicitation's own words, still present in its block",
     elic.includes("fails only if ALL of these fail"));
  ok("the ANY stem is the elicitation's own words, still present in its block",
     elic.includes("fails if ANY of these fails"));
  ok("and this surface's two stems carry those exact tails",
     ctx.__FAILS_ALL.includes("fails only if ALL of these fail")
     && ctx.__FAILS_ANY.includes("fails if ANY of these fails"));
}

/* ====================== 1. THE FIRST OPEN ====================== */
await ctx.__open(INQ);
const first = keep("the first open");

ok("op=basisversions was read for the question",
   CALLS.some(c => c.op === "basisversions" && c.params.id === INQ));
ok("and it was read WITH AN EXPLICIT BOUND — no surface inherits a cap it never stated",
   CALLS.some(c => c.op === "basisversions" && c.params.limit === String(ctx.__ask)));
ok("op=affordances was asked for what may be done on this question (DEC-8: the plane is the source)",
   CALLS.some(c => c.op === "affordances" && c.params.target === INQ));
ok("the crumb renders and names the question",
   /class="crumb"/.test(first) && first.includes(INQ));
ok("the reading the record has accepted is the one in front of the member by default",
   strip(first).includes("second-reading"));
ok("every reading the answer carried is listed",
   ["first-reading","second-reading","turned-down-reading","orphan-reading"]
     .every(nm => strip(first).includes(nm)));

/* THE BOUND THE RECORD PUBLISHED, said in the record's own figures. */
ok("the bound the plane APPLIED is stated, from the plane's own `limit`",
   /at most 200 reading\(s\)/.test(strip(first)));
ok("and its own verdict on completeness is said rather than inferred from a full page",
   /held none back/.test(strip(first)));
ok("the number this page ASKED for is never shown to a member — only the bound the record applied",
   ctx.__ask === 200 && !/asked for 200/.test(strip(first)));

/* THE COMPOSITION, AS ITS CONSEQUENCE. */
ok("a reading whose reasons are all necessary reads as failing if ANY of them fails",
   ctx.__comp(V_FIRST) === ctx.__FAILS_ANY + "INFO-2026-0100, INFO-2026-0200.");
ok("a reading carrying two independently sufficient sets reads as failing only if ALL of them fail",
   ctx.__comp(V_SECOND).startsWith(ctx.__FAILS_ALL)
   && ctx.__comp(V_SECOND).includes("INFO-2026-0100")
   && ctx.__comp(V_SECOND).includes("INFO-2026-0300"));
ok("a set is named by the REASONS IN IT and never by the label the record files it under",
   !ctx.__comp(V_SECOND).includes("set-a") && !ctx.__comp(V_SECOND).includes(LEAKY_LABEL));
ok("a reading the record states no composition for says so, and no shape is guessed for it",
   ctx.__comp(V_UNSTATED) === ctx.__UNSTATED);
ok("and that sentence is on the page",
   strip(first).includes(ctx.__UNSTATED));
ok("a reading with no reasons at all composes nothing rather than an empty sentence",
   ctx.__comp({ legs:[], relationship:"and" }) === "");

/* THE HONEST BOUND ON A CUT READING. */
ok("a reading whose reasons did not all arrive says so, beside the sentence drawn over the ones that did",
   /The record holds 9 reasons for this reading and this answer carries 1/.test(strip(first)));

/* THE ACT'S ATTRIBUTION, PUBLISHED BESIDE THE STATE. */
ok("a turned-down reading names who turned it down, when, and their reason",
   /turned this reading down/.test(strip(first))
   && strip(first).includes("m_bob")
   && strip(first).includes("The invoice it rests on was withdrawn by the issuer."));
ok("a reading nobody has moved says so rather than defaulting to silence",
   /Nobody is recorded as having moved it/.test(strip(first)));

/* ====================== 2. ROTATION IS THE DIFF ====================== */
ok("before any rotation the page says there is nothing to compare against yet, and says why",
   /Rotate to another reading/.test(strip(first))
   && /moving between readings IS the comparison/.test(strip(first)));

ctx.__rotate("first-reading");
const rotated = keep("rotated to the first reading");

ok("rotating moves the reading in front of the member",
   ctx.__VREV().focus === "first-reading");
ok("and the reading they were on becomes the one it is compared against — there is no second selection",
   ctx.__VREV().against === "second-reading");
ok("the comparison NAMES the reading rotated from",
   strip(rotated).includes("second-reading")
   && /Compared with second-reading/.test(strip(rotated)));
ok("the address moves with the rotation, so a reading can be handed to another member",
   ctx.location.hash === "#versions/" + INQ + "/first-reading");

/* THE SUBSTANCE OF THE DIFF, asserted as substance rather than as layout. */
ok("what the two readings say is shown on both sides of the comparison",
   strip(rotated).includes("The fund paid for the marina directly.")
   && strip(rotated).includes("The fund paid for the marina through the harbour authority."));
ok("the reason taken up between the two is named",
   /Reasons taken up[\s\S]{0,120}INFO-2026-0200/.test(strip(rotated)));
ok("the reason let go between the two is named",
   /Reasons let go[\s\S]{0,120}INFO-2026-0300/.test(strip(rotated)));
ok("the reason they share is named as kept",
   /Reasons kept[\s\S]{0,120}INFO-2026-0100/.test(strip(rotated)));
{
  const rows = ctx.__diff(V_SECOND, V_FIRST);
  ok("the comparison covers more than one thing a reading can differ in", rows.length >= 5);
  ok("what the reading SAYS is compared and reads as different",
     rows.some(r => r.changed && r.from.includes("harbour authority")));
  ok("how the reasons stand together is compared and reads as different",
     rows.some(r => r.changed && r.from.startsWith(ctx.__FAILS_ALL) && r.to.startsWith(ctx.__FAILS_ANY)));
  ok("what the record has decided is compared and reads as different",
     rows.some(r => r.changed && /adopted this reading/.test(r.from)));
  ok("two readings that are identical report NOTHING as different — the comparison is not a diff of object identity",
     ctx.__diff(V_FIRST, V_FIRST).every(r => !r.changed));
}

/* ROTATION BACK: the memory follows the member rather than a fixed baseline. */
ctx.__rotate("second-reading");
const back = keep("rotated back");
ok("rotating again compares against the reading just left, not against a fixed first one",
   ctx.__VREV().against === "first-reading"
   && /Compared with first-reading/.test(strip(back)));

/* ====================== 3. THE DERIVATION ====================== */
{
  const t = ctx.__tree([V_FIRST, V_SECOND, V_TURNED_DOWN, V_UNSTATED]);
  ok("a reading composed on its own is a root", t.roots.some(v => v.name === "first-reading"));
  ok("a reading derived from another hangs beneath it",
     (t.kids.get("first-reading")||[]).some(v => v.name === "second-reading")
     && (t.kids.get("second-reading")||[]).some(v => v.name === "turned-down-reading"));
  ok("a reading whose parent is NOT in this answer is drawn as a root rather than dropped",
     t.roots.some(v => v.name === "orphan-reading"));
  ok("and the page SAYS its parent is not among the readings this answer carries — a silent root would draw a different shape from the one the record holds",
     /a-reading-not-in-this-answer, which is not among the readings this answer carries/.test(strip(back)));
  ok("each reading records where it came from, in its own words, on the page",
     /Comes from the reading called first-reading/.test(strip(back))
     && /Composed on its own/.test(strip(back)));
}

/* ============ 4. THE PRUNE OFFER — DEC-29(b)'s WORDING CLAUSE ============ */
ok("the act's own label is the PLANE's and is rendered unmodified (DEC-8)",
   strip(back).includes("Hide a reading from the display (it stays in the record)"));
/* THE SENTENCE IS TYPED HERE, IN FULL, AND THAT IS THE WHOLE POINT OF THE ARM.
   CORRECTED 2026-08-09 AND THE CORRECTION WAS FOUND BY THE CONTROL, NOT BY
   READING: this arm first read `content().includes(ctx.__HIDE_OFFER)` — the
   rendered page compared against the runtime's OWN constant. Arm 3 of
   `version-review.control.mjs` cut the offer down to "Hiding removes this
   reading from the display." and THIS ARM STAYED GREEN, because a page rendering
   whatever the constant happens to say agrees with that constant at ZERO COST,
   and an equality that costs nothing to produce is not evidence (CLAUDE.md).
   The wording is DEC-29(b)'s clause and a ruling is not satisfied by a variable;
   so the ruling's sentence is written out here, where changing it takes a
   deliberate edit in two files, and the four clause arms below read the LITERAL
   rather than the runtime for the same reason. */
const HIDE_OFFER_VERBATIM =
  "Hiding takes this reading out of this display and does nothing else. It stays in the record, "
+ "it can still be opened and asked for by name, every act already recorded on it stays recorded, "
+ "and this act is recorded too. Nothing is deleted, and hiding can be undone.";

ok("THE OFFER'S WORDING, VERBATIM — the sentence typed in this suite is the sentence on the page",
   content().includes(HIDE_OFFER_VERBATIM));
ok("and the runtime carries that same sentence and no other, so the two cannot drift apart silently",
   ctx.__HIDE_OFFER === HIDE_OFFER_VERBATIM);
ok("the offer states, in its own words, that the reading stays in the record",
   /It stays in the record/.test(HIDE_OFFER_VERBATIM) && content().includes("It stays in the record"));
ok("that it stays askable by name",
   /still be opened and asked for by name/.test(HIDE_OFFER_VERBATIM)
   && content().includes("still be opened and asked for by name"));
ok("that every act already recorded on it stays recorded, and that this act is recorded too",
   content().includes("every act already recorded on it stays recorded")
   && content().includes("this act is recorded too"));
ok("and that nothing is deleted",
   content().includes("Nothing is deleted"));

/* NO CONTROL WHERE THE PLANE PUBLISHES NO ACT. A capability a member does not
   hold is ABSENT, never greyed and never narrated (Q12). */
{
  const savedActs = ctx.__VREV().acts;
  ctx.__VREV().acts = [];
  ctx.__rotate("first-reading");
  const noAct = keep("no act published");
  ok("where the plane publishes no hide act there is NO control and NO sentence about one",
     !noAct.includes(HIDE_OFFER_VERBATIM) && !/versionHideSend\(/.test(noAct));
  ctx.__VREV().acts = savedActs;
  ctx.__rotate("second-reading");
}

/* ============ 5. HIDE: THE DISPLAY SHRINKS, THE ACTS REMAIN ============ */
ctx.__rotate("turned-down-reading");
keep("the turned-down reading, before it is hidden");
await ctx.__hide("turned-down-reading", true);
const afterHide = keep("after hiding");

ok("the act was SENT to the plane, carrying the question, the reading and the flag",
   CALLS.some(c => c.op === "versionhide" && c.params.target === INQ
                && c.params.version === "turned-down-reading" && c.params.hidden === "1"));
ok("the record's receipt is rendered — who, when, and what it did",
   /is now held back from this display/.test(strip(afterHide))
   && strip(afterHide).includes("m_alice") && strip(afterHide).includes("2026-08-09T08:00:00Z"));
ok("and the receipt says the reading stays in the record either way",
   /It stays in the record either way/.test(strip(afterHide)));
ok("the answer was re-read after the act, so the page shows what the record holds rather than what this surface assumed",
   CALLS.filter(c => c.op === "basisversions").length >= 2);

/* THE PLANE STILL CARRIES IT — the surface must not undo that. */
ok("the plane's answer STILL carries the hidden reading (PL-1/PL-2's contract, reproduced by the mock)",
   versionsAnswer().versions.some(v => v.name === "turned-down-reading" && v.hidden === true));
ok("and the SURFACE still holds it — hiding shrinks the display, not what was read",
   ctx.__VREV().versions.some(v => v.name === "turned-down-reading"));

/* THE READING YOU JUST CAME FROM STAYS ON THE PAGE EVEN WHEN HIDDEN, and that
   is deliberate rather than a leak: a comparison naming a reading the page
   refuses to show is a comparison a member cannot check. So the shrunk display
   is measured on a FRESH open, where nothing is being compared against. */
ctx.__rotate("second-reading");
const stillThere = keep("hidden, but still the reading just left");
ok("the reading just rotated away from is still drawn even once hidden — the comparison names it, so the page must show it",
   /turned-down-reading/.test(strip(stillThere)));

/* THE DISPLAY SHRINKS, AND SAYS IT SHRANK. */
await ctx.__open(INQ);
const shrunk = keep("the display, shrunk");
ok("on a fresh open the hidden reading is no longer in the list",
   !/>turned-down-reading</.test(shrunk));
ok("the page STATES how many readings THIS DISPLAY is holding back — a shrunk display that does not say it shrank is a display claiming to be complete",
   /1 of them are held back from THIS DISPLAY and are still in the record/.test(strip(shrunk)));
ok("and it states that they answer to a query and can be opened by name",
   /they answer to a query and they can be opened by name/.test(strip(shrunk)));
ok("the record's OWN bound is still stated separately from the display's — the two incompletenesses are never merged",
   /at most 200 reading\(s\)/.test(strip(shrunk)));

/* REJECTION IS NOT PRUNING. */
{
  HIDDEN.delete("turned-down-reading");
  await ctx.__open(INQ);
  const unhidden = keep("a rejected reading that nobody hid");
  ok("a REJECTED reading nobody hid is in the list — only the hide flag shrinks this display (D-214)",
     strip(unhidden).includes("turned-down-reading")
     && /turned this reading down/.test(strip(unhidden)));
  HIDDEN.add("turned-down-reading");
}

/* ============ 6. A HIDDEN READING IS REACHABLE VIA ITS QUERY ============ */
{
  await ctx.__open(INQ, "turned-down-reading");
  const direct = keep("a hidden reading opened by its own address");
  ok("its own address `#versions/<INQ>/<name>` opens a HIDDEN reading",
     ctx.__VREV().focus === "turned-down-reading" && /the one you are reading/.test(strip(direct)));
  ok("and it is rendered as held back rather than as absent",
     /held back from this display/.test(strip(direct)));
  /* THE ACTS-PERSIST QUERY. This is the arm the negative control's
     hide-deletes arm turns red. */
  ok("ACTS PERSIST: the member who turned it down is still named",
     strip(direct).includes("m_bob"));
  ok("ACTS PERSIST: when they did it is still named",
     strip(direct).includes("2026-08-08T11:00:00Z"));
  ok("ACTS PERSIST: and their authored reason is still readable",
     strip(direct).includes("The invoice it rests on was withdrawn by the issuer."));
  ok("ACTS PERSIST: what it rests on is still readable",
     strip(direct).includes("INFO-2026-0400"));
  ok("ACTS PERSIST: and where it came from is still readable",
     /Comes from the reading called second-reading/.test(strip(direct)));

  /* THE ROUTER, driven through the real hash rather than through the opener. */
  ctx.location.hash = "#versions/" + INQ + "/turned-down-reading";
  ok("and the route itself resolves that address", ctx.__route() === true);
  ctx.location.hash = "#nothing-here";
  ok("an address this surface does not own is not claimed by it", ctx.__route() === false);
}

/* ============ 6b. THE ROTATION MEMORY SURVIVES THE ADDRESS BAR ============
   A REAL BROWSER FIRES `hashchange` AFTER `versionRotate` HAS WRITTEN THE NEW
   ADDRESS, and asynchronously — so the lock the other surfaces in this file use
   cannot cover it. Reopening on that event would rebuild the state with nothing
   to compare against and silently undo the member's own rotation on every move.
   THIS HARNESS'S DOM STUB FIRES NO EVENTS, so it cannot reproduce the event; it
   drives the ROUTER directly at the address rotation just wrote, which is what
   the event would do and is labelled here as the substitute it is. */
{
  await ctx.__open(INQ);
  ctx.__rotate("first-reading");
  const hadAgainst = ctx.__VREV().against;
  ok("the rotation set something to compare against", hadAgainst === "second-reading");
  ok("the router at the address rotation just wrote answers that it owns it",
     ctx.location.hash === "#versions/" + INQ + "/first-reading" && ctx.__route() === true);
  ok("and it does NOT rebuild the state — the comparison the member just asked for survives the address bar",
     ctx.__VREV().against === hadAgainst && ctx.__VREV().focus === "first-reading");
  ok("while a DIFFERENT address on this surface does reopen it",
     (ctx.location.hash = "#versions/" + INQ + "/turned-down-reading", ctx.__route() === true));
}

/* THE OTHER WAY BACK: one control puts them all on the page. */
{
  await ctx.__open(INQ);
  ctx.__showAll(true);
  const all = keep("every reading the record holds");
  ok("one control puts the held-back readings back on the page",
     strip(all).includes("turned-down-reading") && /held back from this display/.test(strip(all)));
  ok("and the count line then says none are held back",
     /None are held back from this display/.test(strip(all)));
  ctx.__showAll(false);
}

/* ====================== 7. THE REFUSAL, IN THE PLANE'S WORDS ====================== */
{
  await ctx.__open("PROJ-2026-0001");
  const refused = keep("a refusal");
  ok("a refusal is rendered in the plane's own sentence",
     strip(refused).includes("that is not a question, so it has no readings of its evidence."));
  ok("and its code is shown as the record's, not re-worded",
     refused.includes("BASIS_VERSIONS_NOT_AN_INQUIRY"));
  ok("no reading list, no comparison and no control is drawn beside a refusal",
     !refused.includes(HIDE_OFFER_VERBATIM));
}

/* ====================== 8. THE SWEEP — DEC-32 CLAUSE 1 / D-226 ======================
   *"NEVER show AND / OR / disjunction / grounds — not even as tooltips."* The
   patterns are the ones `elicitation.test.mjs` holds UI-27's flow to, plus
   `partition`, which is the second half of D-226's ban and the word the plan row
   names. ONE rule judges the act, its elicitation and its review.

   THE FIXTURE IS WHAT MAKES THIS AN ARM RATHER THAN A FORMALITY: `V_SECOND`
   files one of its sets under a label containing THREE of these words, so a
   surface that printed the record's own labels fails here naming the phase and
   the word. */
/* CORRECTED 2026-08-09 (UI-53), never exempted. The comment above said "ONE rule
   judges the act, its elicitation and its review" — and that was FALSE when it
   was written: `elicitation.test.mjs` had no `partition`, `notifications.test.mjs`
   had neither `ground` nor `branch` nor the standalone connective, and NOT ONE of
   the four lists in this directory carried `independently sufficient`, which is
   the phrase that was reaching members (D-269). It is one rule now, derived from
   DEC-32 clause 1 in `analyst-vocabulary.mjs`. The corpus, the phases, the
   character floor and the wire-name arm are BYTE-UNCHANGED. */
{
  console.log("  " + reachLine());
  const hits = [];
  for(const [where, html] of PHASES){
    const t = strip(html);
    for(const h of analystHits(t)) hits.push(`${where}: ${h.token} — ${h.why}`);
  }
  ok("not one analyst word reaches the member on any surface this flow renders: " + (hits.join(" | ") || "clean"),
     hits.length === 0);
  ok("and the sweep saw the WHOLE flow rather than one phase of it — " + PHASES.length + " phases",
     PHASES.length >= 8 && PHASES.every(([, h]) => String(h).length > 200));
  ok("the sweep's corpus is real: " + PHASES.reduce((s,[,h])=>s+String(h).length,0) + " characters of rendered markup",
     PHASES.reduce((s,[,h])=>s+String(h).length,0) > 20000);
  /* THE INSTRUMENT'S OWN POLARITY. A sweep that cannot fail passes everything,
     and this estate has measured three walks that were green over nothing. */
  ok("INSTRUMENT: the sweep DOES fire on a phase carrying a banned word",
     analystHits(strip("<p>" + LEAKY_LABEL + "</p>")).length > 0);
  /* THE WIRE NAME IS NOT A SURFACE — the ops are reached by their published ids
     and no id is ever printed. */
  ok("the ops this surface reaches are never rendered to the member",
     PHASES.every(([, h]) => !strip(h).includes("basisversions") && !strip(h).includes("versionhide")));
  /* AND THE RECORD'S OWN FILING LABELS NEVER REACH THE PAGE, asserted directly
     as well as through the sweep, because the sweep would also pass if the
     labels were merely absent from the fixture. */
  ok("the record's own set labels are never rendered",
     PHASES.every(([, h]) => !String(h).includes(LEAKY_LABEL) && !strip(h).includes("set-a")));
}

console.log(`version-review: ${n - fails.length}/${n} assertions`);
if(fails.length){ console.error(`version-review: ${fails.length} FAILED`); process.exit(1); }
