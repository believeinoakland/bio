/* NEGATIVE CONTROL (UI-57, 2026-09-10): `node civicos-ui/test/case6.control.mjs f`
 * — and `g` and `h` beside it, each armed ALONE. `f` is the arm this item exists
 * for: it re-gates the section on the ACT, which is the code as it stood before
 * UI-57, and the non-owner's rule statement must FAIL as ABSENT and be named.
 * `g` is the over-strictness arm (a non-owner legitimately offered acts this item
 * did not anticipate must still read the statement); `h` re-arms DEC-69 against
 * the non-owner's own page. RESULTS are recorded in the driver and in this
 * file's UI-57 block below.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/case6.control.mjs c` — ONE ARM, armed
 * ALONE, run 2026-09-10, `civicos-ui/app.html` restored from a uniquely-named
 * pristine copy and verified by sha256 AND by `cmp` with the byte count printed
 * (1203867 B, MATCH / IDENTICAL) and a minimum floored.
 *   (c) DEC-69 · THE STATEMENT INFORMS TWICE. A second telling of the owner rule
 *       is inserted further down the section — the nag's exact shape, and what a
 *       well-meaning edit produces when it wants to be sure the reader saw
 *       something. DECLARED: the informed-ONCE arm must FAIL; the three property
 *       arms must NOT, because the facts are all still present and correct and
 *       this arm has to prove the suite can tell CORRECT-AND-REPEATED from WRONG
 *       rather than merely noticing that the text changed. RESULT: as declared —
 *       exactly the informed-ONCE arm red, every property arm green.
 *   THIS SUITE HAD NO DECLARED CONTROL UNTIL CASE-6, and `coverage.mjs` had been
 *   printing it in the civicos-ui NO CONTROL list all along (reported, not gated).
 *   It is declared here rather than only in the driver so the register can read it.
 *
 * UI-17a — S8 THE PUBLICATION ENTRY POINT, the placeholder DEC-33 ships in
 * UI-17's place.
 *
 * Drives `openInquiry` over a mock plane that publishes the `publish` act the
 * way REC-14's landed line says the real one does, and proves what the item's
 * acceptance names:
 *
 *   (1) the entry point STATES what publication is — the act is irreversible;
 *       correction is a further EDITION and a further edition is a separate
 *       document; every published edition still stands; a withdrawal is ANOTHER
 *       ATTESTED ACT with both standing; nothing is unpublished (DEC-19 as
 *       amended, whose mechanism is that correction always moves FORWARD);
 *   (2) it states that publishing runs THROUGH THE GROUP'S OPERATOR today —
 *       the honest narration of an absent capability DEC-33 asked for by name;
 *   (3) it offers NO CEREMONY CONTROL OF ANY KIND. No sign step, no pre-flight,
 *       no submit — asserted on the WIRE (`op=publish` is never reached, and is
 *       not reached even when `actGo("publish", …)` is called directly) and not
 *       only in the markup, because a control that renders as prose and posts
 *       anyway is the failure this arm exists to catch;
 *   (4) it renders the PLANE'S OWN published label for the act, unmodified, and
 *       the plane's PROMPT where the plane offers one — and renders nothing in
 *       the prompt's place where it does not;
 *   (5) the ACT STRIP AND THE ENTRY POINT RECONCILE. `op=affordances` publishes
 *       `publish` as a real act, so the strip does not suppress it: it NAMES it
 *       under the producer's label and ROUTES it at this section (the existing
 *       `elsewhere` mechanism) instead of at a ceremony that does not exist.
 *       There is no control for it on either side, and no `ACT_FLOW` entry;
 *   (6) a READ-ONLY credential sees the SAME SURFACE — the section compared
 *       string-for-string against the acting credential's — with exactly ONE
 *       whoami-sourced sentence, no greyed control and no per-control narration
 *       (Q12);
 *   (7) where the record's publication rule does not reach the OBJECT, the
 *       section is ABSENT rather than shown-and-disabled. Absent, not greyed, is
 *       the whole rule. (CORRECTED BY UI-57: this read "where the record does NOT
 *       publish the act", which was the same sentence only while the published
 *       act set was a fact about the object — see (8).)
 *   (8) UI-57 / IC-75, 2026-09-10 — THE GATE IS THE OBJECT AND NOT THE ACT.
 *       D-310 stopped `op=affordances` offering `publish` to a caller who holds
 *       the owner position on no project, which is correct: `publishCase()`
 *       refuses that caller BY NAME. But this section was gated on the act's
 *       presence, so the narrowing deleted the whole statement — the
 *       `data-pubwho` paragraph included — for exactly the class the owner rule
 *       is about, and the fence went back to being learned by silence. IC-75
 *       measured it before the plane change landed and delegated it here. The
 *       section now renders on the OBJECT (a concluded inquiry: the act's own
 *       object-side condition, read verbatim and minus the per-credential one)
 *       and the ONLY thing the act's presence still gates is the record's own
 *       published LABEL for it, which this surface may not invent. So a
 *       non-owner reads every word of the rule and is offered nothing, and their
 *       statement is byte-identical to an owner's.
 *
 * NEGATIVE CONTROL, three arms, RUN 2026-08-05 and restored byte-identical
 * after each — civicos-ui/app.html's sha256 compared before and after every
 * arm, all three returning to
 * 3524c3ec19459de88cfdc1ad8c75cdb2a33fdfcddc5ca2826f7ae4f474873917. Each edit
 * is ONE line: (a) and (b) inside `publicationEntryHtml`, immediately after the
 * `${prompt}` line; (c) inside the `ACT_FLOW` map:
 *
 *   (a) A SUBMIT WIRED TO THE ACT — the ceremony's last step arriving four
 *       steps early:
 *         <button class="btn" onclick="actAsk('publish',{target:'x'})">Publish this case</button>
 *       -> RUN: 6 of 112 failed — "the entry point offers no control of any
 *       kind", "no control anywhere on the page mentions the publication act",
 *       "no control on the page names a ceremony step", "a read-only credential
 *       is offered NO control at all", "a credential that CAN act is offered no
 *       publication control either", and — unplanned, and the most useful of
 *       the six — "the label is not re-worded by this surface", because the
 *       invented button had to invent a verb for itself. WHAT DID NOT FIRE, and
 *       it is stated rather than left to be re-derived: "the section a read-only
 *       credential reads is the SAME section, word for word" stayed GREEN, since
 *       an unconditional control is equally wrong for both credentials. That
 *       assertion guards arm (b)'s shape, not this one; the two arms need each
 *       other.
 *
 *   (b) A GREYED CONTROL INSTEAD OF AN ABSENT ONE — the Q12 failure in its most
 *       tempting form, because it LOOKS like honesty:
 *         ${actReachable(act)?"":`<button class="btn" disabled>${esc(act.label)}&hellip;</button>`}
 *       -> RUN: 3 of 112 failed — "the section a read-only credential reads is
 *       the SAME section, word for word", "a read-only credential is offered NO
 *       control at all", "no control is greyed instead of omitted". THREE, not
 *       more, and the reason is the finding: the acting credential's page is
 *       untouched by this edit, so every assertion taken over the ACTING view
 *       (including "the entry point offers no control of any kind", which reads
 *       that view's section) stays green. A greyed control is only visible from
 *       the credential it is greyed for — which is exactly why the read-only
 *       arm cannot be dropped as redundant. WORTH KNOWING TOO: this arm leaves
 *       every WORDING assertion green. The statement is still true and still
 *       there, so a suite that only read the copy would have called a greyed
 *       publish button correct. That is why the control assertions are
 *       structural (`<button`, `disabled`) and not a word list.
 *
 *   (c) A FLOW FOR THE ACT — the shape a future session reaches for when it
 *       wants the strip's button back. In `ACT_FLOW` add
 *         publish:   (id, title, act) => openConclude(id, title, act),
 *       -> RUN: 7 of 112 failed — "no control anywhere on the page mentions the
 *       publication act", "no control on the page names a ceremony step",
 *       "driving the act directly reaches no op at all", "there is no flow
 *       registered for the publication act", "the act strip ROUTES the act at
 *       this section rather than calling it uncarried" (the act moved out of
 *       the `elsewhere` bucket into a button, so the routing sentence vanished),
 *       "the act strip offers no control for the publication act", "a credential
 *       that CAN act is offered no publication control either". This is the arm
 *       that proves the reconciliation in (5) is ENFORCED and not merely
 *       arranged: the act cannot grow a control without this suite saying so.
 *       AND THIS ARM CORRECTED THE SUITE. On its first run the wire assertion
 *       "driving the act directly reaches no op at all" stayed GREEN while six
 *       others failed — `actGo` returns synchronously and the flow it starts is
 *       async, so counting calls on the next line measured nothing. The
 *       microtask drain at that assertion is the fix, and the arm was re-run
 *       against it: 6 failures became 7. A control that does not fail its own
 *       arm is not a control.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one — ONE implementation, so `bio-plane/test/tally-through-pipe.test.mjs` guards it for
   both estates and a node release closing the private door goes red once instead of half. The
   import is for its SIDE EFFECT and is idempotent. Census: `stdio-census.test.mjs`. */
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

const LEGS = [
  { target:"INFO-2026-9100", role:"supports", grade:"B", grade_axis:"capture",    grade_source:"resolution" },
  { target:"INFO-2026-9200", role:"supports", grade:"B", grade_axis:"connection", grade_source:"resolution" },
];
const PAIR = [
  { axis:"capture", state:"graded", grade:"B", weakest:"INFO-2026-9100", load_bearing:1, population:1,
    detail:"capture B — no stronger than the weakest capture it rests on, which is INFO-2026-9100." },
  { axis:"connection", state:"graded", grade:"B", weakest:"INFO-2026-9200", load_bearing:1, population:1,
    detail:"connection B — no stronger than the weakest connection it rests on, which is INFO-2026-9200." },
];

/* THE ACT, in the producer's own shape. Taken from `bio-plane/src/affordances.mjs`
   — `{ id:"publish", label:"Publish (author the case)", weight:"single",
   types:["inquiry"], applies: … edgesFrom(f).includes("published") }` — decorated
   by index.mjs's `decorateAct` the way every other act on the wire is. `rung` is
   null and `prompt` is null there TODAY, and both absences are deliberate at the
   producer (no document assigns publishing a rung; FW-14 owns it), so the mock
   sends them null rather than inventing either. */
const PUBLISH_ACT = { id:"publish", label:"Publish (author the case)", weight:"single",
                      needs:"contribute", mode:"session", rung:null, prompt:null };
const CONCLUDE_ACT = { id:"conclude", label:"Conclude", weight:"single",
                       needs:"contribute", mode:"session", rung:null, prompt:null };
/* A SECOND FIXTURE whose plane DOES send a prompt. Nothing publishes one for
   `publish` today; DEC-29(b)'s rule is that a prompt RIDES THE ACT, so the day
   one is added the surface must already carry it verbatim rather than needing a
   turn of its own. This proves the seam, not a shipped string. */
const PUBLISH_PROMPTED = { ...PUBLISH_ACT,
  prompt:"Every edition you publish keeps answering. Say what this edition corrects." };

const DOCS = {
  /* Concluded: the plane's `publish` edge exists, so the act is published. */
  "INQ-2026-9001": { state:"concluded", title:"Did the sewer fund pay for the marina?",
    acts:[CONCLUDE_ACT, PUBLISH_ACT],
    q:"Did money from the sewer enterprise fund pay for marina construction between 2022 and 2024?",
    f:"A general-ledger export showing no transfer from fund 601 to the marina capital project." },
  /* The same, with a prompt riding the act. */
  "INQ-2026-9002": { state:"concluded", title:"Was the contract awarded without a bid?",
    acts:[PUBLISH_PROMPTED],
    q:"Was the harbour dredging contract awarded without a competitive bid?",
    f:"A published bid tabulation naming two or more bidders." },
  /* Open: the record's publication rule does not apply to this OBJECT at all,
     so the section must be absent. Corrected wording, UI-57 2026-09-10: this
     fixture used to be described as "the record does not publish the act", which
     was the same thing only while the act set was a fact about the object. */
  "INQ-2026-9003": { state:"open", title:"Who approved the transfer?",
    acts:[CONCLUDE_ACT],
    q:"Which officer approved the transfer out of the sewer fund?",
    f:"A signed approval carrying a different officer's name." },
  /* UI-57 / D-310 · THE NON-OWNER'S CONCLUDED INQUIRY, and it is the fixture
     this item exists for. `op=affordances` now withholds `publish` from a caller
     who holds the owner position on no project (`f.project_owner !== false`), so
     the answer for that reader on a CONCLUDED question carries every other act
     and not this one. The object is identical to INQ-2026-9001's in every
     respect the record states about it — same type, same state — and the only
     difference is the per-caller act set, which is exactly the distinction the
     section's gate now has to get right. */
  "INQ-2026-9004": { state:"concluded", title:"Did the authority waive the tipping fee?",
    acts:[CONCLUDE_ACT],
    q:"Did the solid-waste authority waive the tipping fee for the marina contractor?",
    f:"A fee schedule showing the contractor billed at the posted rate." },
};

function mockFetch(u, opts){
  const url = new URL(u, "https://plane.test");
  const op = url.searchParams.get("op");
  const id = url.searchParams.get("id"), target = url.searchParams.get("target");
  CALLS.push({ op, id, target, method:(opts&&opts.method)||"GET" });
  const R = o => ({ ok:true, json:async()=>o });
  if(op==="image"){
    const d = DOCS[id];
    if(!d) return R({ ok:true, result:null });
    return R({ ok:true, result:{ "bundle.md": md(d.state, d.title, d.q, d.f) } });
  }
  if(op==="projection"){
    const d = DOCS[id];
    if(!d) return R({ ok:true, result:null });
    const fm = { basis:LEGS, published_strength:PAIR };
    return R({ ok:true, result:{ bundle_id:id, object_type:"inquiry", title:d.title,
                                 current_state:d.state, fm_json:JSON.stringify(fm) } });
  }
  if(op==="backlinks") return R({ ok:true, result:{ ok:true, target, backlinks:[] } });
  if(op==="affordances"){
    if(!target) return R({ ok:true, result:{ target:null, catalog:[],
      vocabularies:{ dispositions:["deferred","dismissed"] } } });
    const d = DOCS[target];
    if(!d) return R({ ok:true, result:{ ok:false, reason:"NO_SUCH_BUNDLE", target } });
    return R({ ok:true, result:{ target, object_type:"inquiry", current_state:d.state,
      acts:d.acts, vocabularies:{ dispositions:["deferred","dismissed"] } } });
  }
  /* op=publish MUST NEVER BE REACHED FROM THIS SURFACE. The mock answers it so
     that a call which does happen is RECORDED and visible in CALLS rather than
     dying as an unexpected-op error that a suite might read as a refusal. */
  if(op==="publish") return R({ ok:true, result:{ ok:true, edition:1 } });
  if(op==="list") return R({ ok:true, result:[] });
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
  ";globalThis.__PLANE=PLANE;globalThis.__openInquiry=openInquiry;" +
  "globalThis.__publicationEntryHtml=publicationEntryHtml;" +
  "globalThis.__ACT_FLOW=ACT_FLOW;globalThis.__actGo=actGo;", ctx);

ctx.__PLANE.session = true;
ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };

const content = () => els.get("#content")._html;
async function open(id){ await ctx.__openInquiry(id); return content(); }

const PAGES = [];
/* The section, sliced out by its own heading and ending at the next one. Used
   to compare two credentials' views string-for-string. */
function section(html){
  const start = html.indexOf('<h2 class="sec">Publishing this case</h2>');
  if(start < 0) return "";
  const rest = html.slice(start + 10);
  const end = rest.indexOf('<h2 class="sec">');
  return end < 0 ? html.slice(start) : html.slice(start, start + 10 + end);
}

/* ============ (1) THE STATEMENT ============ */
const page = await open("INQ-2026-9001");
PAGES.push(["the concluded question", page]);
ok("the entry point renders where the record publishes the act", section(page) !== "");
const sec = section(page);

ok("it states that the act is irreversible, in words and not by implication",
   /cannot be taken back/.test(sec));
ok("it states that the published bytes keep answering",
   /keep answering/.test(sec));
ok("it states that correction is a further EDITION",
   /further edition/i.test(sec));
ok("it states that a further edition is a SEPARATE DOCUMENT",
   /separate document/i.test(sec));
ok("it states that every published edition STILL STANDS",
   /every edition that was ever published still stands/i.test(sec));
ok("it states that a withdrawal is ITSELF AN ACT on the record, with both standing",
   /withdrawal is itself an act on the record/i.test(sec) && /both stand/i.test(sec));
ok("it says correction moves FORWARD, which is DEC-19's mechanism",
   /moves forward/i.test(sec));
ok("it states that nothing is unpublished",
   /Nothing is unpublished/i.test(sec));
ok("it states that nothing is undone quietly — the stronger half of the ruling",
   /undone quietly/i.test(sec));
ok("it states that publishing runs through the group's OPERATOR today",
   /runs through the group&rsquo;s operator today/i.test(sec));
ok("it says the member-facing process has NOT been built, rather than implying it is elsewhere",
   /has not been built/i.test(sec));
ok("it names who to ask, so the absent capability has a route",
   /Ask the person who runs this record for the group/i.test(sec));

/* THE PROMISE IS NOT WEAKENED ANYWHERE. `reversible` is the word DEC-19's
   2026-08-02 text used and its 2026-08-03 amendment retired: *"that word
   overclaims — the ACT is irreversible."* A surface that says a published case
   can be reversed, unpublished, undone, deleted or retracted-away is saying the
   opposite of the top rung, so the sweep is over the retired vocabulary and not
   over the one this page happens to use. */
for(const word of ["reversible", "undo the publication", "delete the case", "take it down"])
  ok(`the statement never says "${word}"`, !new RegExp(word.replace(/ /g,"\\s+"), "i").test(sec));
/* `unpublish` is swept, but not naively, and the correction is worth keeping:
   the statement's OWN sentence is *"Nothing is unpublished"*, so a bare word
   sweep fails on the very sentence that carries the ruling. The instrument is
   therefore the ruling sentence removed FIRST — and then the word must not
   appear anywhere at all, which is stricter than a phrase list and cannot be
   worked around by a spelling nobody anticipated. */
const secMinusRuling = sec.replace(/Nothing is unpublished/gi, "");
ok("outside the sentence that states the rule, the statement never says unpublish",
   !/unpublish/i.test(secMinusRuling));

/* ============ (2) THE PLANE'S OWN LABEL, AND ITS PROMPT WHERE IT SENDS ONE ============ */
ok("the plane's published label for the act renders, verbatim",
   sec.includes("Publish (author the case)"));
ok("the label is not re-worded by this surface",
   !/Publish this case|Publish the case|Start publishing/i.test(sec));
ok("the section says plainly that it explains the act and does not carry it",
   /This section explains what that act is\. It does not carry it\./.test(sec));

const prompted = await open("INQ-2026-9002");
PAGES.push(["the question whose act carries a prompt", prompted]);
const psec = section(prompted);
ok("a prompt the plane sends rides through to the surface, verbatim",
   psec.includes("Every edition you publish keeps answering. Say what this edition corrects."));
ok("the prompt is rendered ABOVE the statement, where a prompt belongs",
   psec.indexOf("Say what this edition corrects") < psec.indexOf("cannot be taken back"));
ok("a plane that sends NO prompt has none written on its behalf",
   !/Say what this edition corrects/.test(sec)
   && (sec.match(/class="subj-note"/g)||[]).length === 1);

/* ============ (3) NO CEREMONY CONTROL OF ANY KIND ============ */
ok("the entry point offers no control of any kind",
   !/<button/.test(sec) && !/<input/.test(sec) && !/<select/.test(sec) && !/<textarea/.test(sec));
ok("no control anywhere on the page mentions the publication act",
   !/<button[^>]*publish/i.test(page));
ok("no control is greyed rather than omitted", !/disabled/.test(page));
ok("no submit, sign or pre-flight control is offered",
   !/<(button|input)[^>]*>[^<]*(sign|submit|pre-?flight|preflight)/i.test(page));
/* STRUCTURAL, over every control the page renders: not one of them names a
   ceremony step. A word list over the PROSE would be the wrong instrument —
   the prose is allowed to say "signed", because DEC-19's mechanism is that a
   withdrawal is signed. What may not exist is a CONTROL that says it. */
const controls = [...page.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map(m=>m[1]);
ok("no control on the page names a ceremony step",
   controls.every(c=>!/sign|submit|pre-?flight|publish/i.test(c)));

/* THE WIRE, which is the assertion that actually holds. A control rendered as
   prose that posts anyway would pass every check above. */
ok("op=publish was never reached while rendering the page",
   !CALLS.some(c=>c.op==="publish"));
ok("the acts were read the way every other surface reads them",
   CALLS.some(c=>c.op==="affordances" && c.target==="INQ-2026-9001"));

/* AND IT IS NOT REACHABLE BY DRIVING THE STRIP EITHER. `actGo` is the one
   entry into an act's flow; there is no `ACT_FLOW` entry for `publish`, so
   calling it is a no-op rather than a ceremony. This is asserted by CALLING IT,
   not by reading the map, because the map is the implementation and the silence
   is the promise. */
const before = CALLS.length;
ctx.__actGo("publish", "INQ-2026-9001", "Did the sewer fund pay for the marina?");
/* THE DRAIN IS LOAD-BEARING and is here because the negative control found it
   missing: `actGo` returns synchronously while the flow it would start is
   async, so counting calls on the next line measures nothing at all — arm (c)
   registered a real flow for the act and this assertion stayed green while six
   others failed. Draining the microtask queue is what makes it an assertion. */
for(let i=0;i<8;i++) await Promise.resolve();
ok("driving the act directly reaches no op at all", CALLS.length === before);
ok("op=publish is still unreached after driving the act", !CALLS.some(c=>c.op==="publish"));
ok("there is no flow registered for the publication act", !ctx.__ACT_FLOW.publish);

/* ============ (4) THE STRIP AND THE ENTRY POINT RECONCILE ============ */
ok("the act strip still exists on the page", page.includes("What can be done here"));
ok("the act strip NAMES the act the record publishes, under the producer's label",
   /What can be done here[\s\S]*Publish \(author the case\)/.test(page));
ok("the act strip ROUTES the act at this section rather than calling it uncarried",
   /also publishes <b>Publish \(author the case\)<\/b>[\s\S]*?section of <b>its<\/b> own further up this page|also publishes <b>Publish \(author the case\)<\/b>[\s\S]*?section of its own further up this page/.test(page));
ok("the act strip does NOT say the act is uncarried on this page",
   !/Publish \(author the case\)<\/b>[^<]*\.[^<]*not carried on this page/.test(page));
ok("the entry point is ABOVE the strip, which is what the routing sentence promises",
   page.indexOf("Publishing this case") < page.indexOf("What can be done here"));
ok("the act strip offers no control for the publication act",
   !/actGo\("publish"|actGo\(&quot;publish&quot;/.test(page));
/* The acts that DO have a flow are untouched by this item. */
ok("an act with a flow still gets its control",
   /<button[^>]*onclick="actGo\([^)]*Conclude|Conclude/.test(page));

/* ============ (5) Q12: THE SAME SURFACE, ONE SENTENCE ============ */
ctx.__PLANE.me = { member:"m_vera", session:true, administer:false, capabilities:["view"] };
const ro = await open("INQ-2026-9001");
PAGES.push(["the read-only view", ro]);
const SENT = "This credential can read this question and cannot act on it.";
ok("a read-only credential is told once, at the surface, what its credential is", ro.includes(SENT));
ok("the credential sentence appears exactly once", (ro.split(SENT).length-1)===1);
ok("the section a read-only credential reads is the SAME section, word for word",
   section(ro) === sec && sec !== "");
ok("a read-only credential is offered NO control at all", !/<button/.test(ro));
ok("no control is greyed instead of omitted", !/disabled/.test(ro));
ok("no control is narrated per-control", !/you (can|may) not|not permitted|insufficient/i.test(ro));
ok("a read-only credential still reads the whole statement",
   /cannot be taken back/.test(ro) && /runs through the group&rsquo;s operator today/.test(ro));
ok("a read-only credential is still told the act exists, under the record's label",
   ro.includes("Publish (author the case)"));

ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };
const acting = await open("INQ-2026-9001");
ok("a credential that CAN act is told nothing about its credential", !acting.includes(SENT));
ok("a credential that CAN act is offered no publication control either",
   !/actGo\("publish"/.test(acting) && !/<button[^>]*publish/i.test(acting));
ok("and the section it reads is the same one again", section(acting) === sec);

/* ============ CASE-6 / DEC-72 · THE THREE PROPERTIES THE STATEMENT MUST CARRY,
   AND THE DEC-69 ARM THAT KEEPS IT A STATEMENT ============================

   DEC-33 still defers the five-step ceremony and nothing here wires a control —
   every assertion above that pins that is untouched and still green. What CASE-6
   owed this surface is the three facts DEC-72 changed about publication, because
   a member about to ask their operator to publish has to bring all three, and
   learning any of them afterwards is learning it at the worst moment. */
ok("CASE-6 (1) WHO: the statement says a case is published BY A PROJECT and only by an OWNER of it",
   /data-pubwho="1"/.test(sec)
   && /published BY A PROJECT, and only by an owner of it/.test(sec)
   && /wielded at the top of that project&rsquo;s roster/.test(sec)
   /* AND THE ADMINISTRATOR HALF, which is the one a reader would otherwise get
      backwards: seeing every project is not directing one, and it is the plane's
      own refusal wording at `publishCase()`. */
   && /an administrator, who can see every project, directs none of them/.test(sec));
ok("CASE-6 (2) AUTHORED: the statement says the load-bearing split is written by the publisher",
   /data-pubauthored="1"/.test(sec)
   && /That split is authored by whoever publishes/.test(sec)
   /* THE TWO INFERENCES NAMED AND REFUSED BY NAME. It is not enough to say the
      split is authored; the two things a reader (or a later implementer) would
      reach for instead have to be ruled out in words, because both look like
      reasonable defaults and neither is what the publisher asserted. */
   && /not read off the order the findings are listed in/.test(sec)
   && /not worked out from how strong each one turned out to be/.test(sec)
   && /something to bring to the act, not something the act will decide for you/.test(sec));
ok("CASE-6 (3) THE BAR: the statement says the standard is the publishing PROJECT's, for the whole case",
   /data-pubbar="1"/.test(sec)
   && /standard of evidence is the publishing project&rsquo;s, and it applies to the case as a whole/.test(sec)
   && /every load-bearing finding has to meet it, and the supporting ones do not/.test(sec)
   /* DEC-72's two-honest-answers clause, which is the part that stops a reader
      taking a cleared bar as an absolute fact about the findings. */
   && /published by a different project are held to that project&rsquo;s standard instead, and both results are honest at the same time/.test(sec)
   && /an absent bar is not a bar of zero/.test(sec));
/* ==== THE DEC-69 ARM, AND IT IS THE ONE THIS SECTION IS MOST AT RISK FROM ====
   "Inform at the act once; never nag, re-confirm or force a mode." Three new
   paragraphs is three new chances to break all three, so each is measured:

   ONCE — each property is stated in exactly ONE marked paragraph. A second
   telling further down the page is the nag, and it is the shape a well-meaning
   edit produces when it wants to be sure the reader saw something.

   NO RE-CONFIRMATION — nothing here asks the reader to acknowledge, confirm,
   accept or agree to anything. There is no act to confirm; there is not even a
   control. A ceremony that asks twice fails, and a statement that asks once is
   already one too many.

   NO MODE FORCED — and this is the arm with teeth. The section renders
   IDENTICALLY for every credential, so it cannot have quietly grown a
   per-position variant that shortens itself for a non-owner. That would force a
   mode (owners get the real thing, everyone else gets a summary) AND it would be
   the surface composing a position rule out of facts, which is what
   `affordances.mjs` exists to stop. Asserted by byte equality against the
   read-only credential's copy, which is the strongest form available here. */
ok("DEC-69: each property is informed ONCE — no paragraph is repeated further down the page",
   (sec.match(/data-pubwho="1"/g) || []).length === 1
   && (sec.match(/data-pubauthored="1"/g) || []).length === 1
   && (sec.match(/data-pubbar="1"/g) || []).length === 1
   && (sec.match(/published BY A PROJECT, and only by an owner of it/g) || []).length === 1);
ok("DEC-69: nothing here re-confirms, acknowledges or asks the reader to agree to an already-decided act",
   !/\bconfirm\b/i.test(sec) && !/\backnowledg/i.test(sec)
   && !/\bare you sure\b/i.test(sec) && !/\bagree\b/i.test(sec)
   && !/\bproceed\b/i.test(sec) && !/\bcontinue\?/i.test(sec));
ok("DEC-69: no mode is forced — the three properties read IDENTICALLY for a credential that cannot act",
   section(acting) === section(ro) && /data-pubwho="1"/.test(section(ro))
   && /data-pubauthored="1"/.test(section(ro)) && /data-pubbar="1"/.test(section(ro)));
ok("and it is still a STATEMENT: no control was wired for any of the three",
   !/actGo\("publish"/.test(sec) && !/<button/i.test(sec) && !/<input/i.test(sec)
   && !/<select/i.test(sec) && !/onclick=/i.test(sec));

/* ============ (6) ABSENT, NOT GREYED, WHERE THE RULE DOES NOT APPLY ============ */
const openQ = await open("INQ-2026-9003");
PAGES.push(["an open question", openQ]);
/* CORRECTED, UI-57 2026-09-10. The old assertion read "a question the record
   does not offer the ACT for" and was measuring the right thing by the wrong
   name: on an OPEN question the record does not offer publication to ANYBODY,
   which is a fact about the object, and that is what must keep it absent. The
   act's presence stopped being a statement about the object when D-310 made the
   published set per-caller, so the name is corrected here rather than left to
   read as though the act were still the authority. */
ok("the entry point does not render on a question the record's publication rule does not apply to",
   section(openQ) === "");
ok("and nothing is left in its place — no heading, no stub, no greyed control",
   !openQ.includes("Publishing this case") && !/disabled/.test(openQ));
ok("the act strip on that page is unchanged and offers its own acts",
   openQ.includes("What can be done here") && openQ.includes("Conclude"));
ok("nothing on that page says publication runs through anyone",
   !/operator/i.test(openQ));

/* THE FUNCTION DRIVEN DIRECTLY, for the shapes a page cannot easily produce.
   CORRECTED AT THE SITE, UI-57 2026-09-10: two of these four used to assert ""
   for an answer carrying NO object fields at all and called the reason "no act
   was published". That was never what the ABSENCE proved — an answer with no
   `object_type`/`current_state` is absent from the rule's reach for a second,
   independent reason — so the old pair is kept (it is still correct, and a
   malformed answer must still render nothing) and the pair that actually
   separates the two gates is ADDED below. */
ok("the entry point renders NOTHING for a refusal from the plane",
   ctx.__publicationEntryHtml({ ok:false, refusal:{reason:"NO_SUCH_BUNDLE"}, acts:[] })==="");
ok("the entry point renders NOTHING for an answer that states nothing about the object",
   ctx.__publicationEntryHtml({ ok:true, acts:[] })==="");
ok("the entry point renders NOTHING for a null answer",
   ctx.__publicationEntryHtml(null)==="");
ok("the entry point renders NOTHING for an object the rule does not reach, whatever the acts say",
   ctx.__publicationEntryHtml({ ok:true, object_type:"inquiry", current_state:"open",
                                acts:[PUBLISH_ACT] })===""
   && ctx.__publicationEntryHtml({ ok:true, object_type:"finding", current_state:"concluded",
                                   acts:[PUBLISH_ACT] })==="");
/* AND THE ONE THAT IS THE ITEM: the OBJECT decides, so a concluded inquiry
   renders the section with NO act published on it at all. */
ok("the entry point RENDERS on a concluded inquiry the record publishes no act on",
   ctx.__publicationEntryHtml({ ok:true, object_type:"inquiry", current_state:"concluded",
                                acts:[] }).includes('data-pubwho="1"'));
ok("and it renders it for some OTHER act just the same — the act list is not the gate",
   ctx.__publicationEntryHtml({ ok:true, object_type:"inquiry", current_state:"concluded",
                                acts:[CONCLUDE_ACT] }).includes('data-pubwho="1"'));

/* ============ UI-57 / IC-75 · THE NON-OWNER, WHICH IS THE WHOLE ITEM =========
   D-310 narrowed `op=affordances` so a caller who owns no project is no longer
   offered `publish` — correctly, because `publishCase()` refuses them BY NAME.
   The section's gate was the act's presence, so the narrowing took the whole
   statement away from exactly the readers the owner rule was written for:
   *"finding that out from an operator after assembling a case is the worst
   possible moment to learn it."* IC-75 measured that before the plane change
   landed and delegated it here. What must now be true, and it is the queue row's
   acceptance verbatim: the non-owner READS THE RULE and is OFFERED NO CONTROL. */
const nonOwner = await open("INQ-2026-9004");
PAGES.push(["a non-owner's concluded question", nonOwner]);
const nsec = section(nonOwner);
ok("UI-57: a non-owner viewing a concluded inquiry still sees the publishing section",
   nsec !== "" && nonOwner.includes("Publishing this case"));
ok("UI-57: and the OWNER RULE is stated to them, in the record's own words, not learned by silence",
   /data-pubwho="1"/.test(nsec)
   && /published BY A PROJECT, and only by an owner of it/.test(nsec)
   && /an administrator, who can see every project, directs none of them/.test(nsec));
ok("UI-57: the other two CASE-6 properties reach them too — the statement is not a summary",
   /data-pubauthored="1"/.test(nsec) && /data-pubbar="1"/.test(nsec)
   && /cannot be taken back/.test(nsec)
   && /runs through the group&rsquo;s operator today/.test(nsec));
/* THE RULE ITSELF IS ONE RENDERING. The section's header forbids a per-credential
   variant by name, so the statement is compared BYTE FOR BYTE against the owner's.
   The comparison is over the CARD — the leading sentence is the act-shaped half
   and is legitimately absent here, which is the only thing the act still gates. */
const card = (s) => { const i = s.indexOf('<div class="card">'); return i < 0 ? "" : s.slice(i); };
ok("UI-57: the statement a non-owner reads is the SAME statement, byte for byte",
   card(nsec) !== "" && card(nsec) === card(sec));
ok("UI-57: no publication control is offered to them — absent, not greyed",
   !/<button[^>]*publish/i.test(nonOwner) && !/actGo\("publish"/.test(nonOwner)
   && !/disabled/.test(nonOwner) && !/<button/.test(nsec));
ok("UI-57: op=publish is not reached while rendering their page",
   !CALLS.some(c=>c.op==="publish"));
/* AND THE SURFACE INVENTS NO LABEL. The record published no `publish` act to
   this reader, so there is no producer label to render and none may be written
   on the plane's behalf — the same rule the absent prompt takes. */
ok("UI-57: no label for the act is invented where the record published none",
   !nsec.includes("Publish (author the case)")
   && !/Publish this case|Publish the case|Start publishing/i.test(nsec));
ok("UI-57: the act strip routes nothing it was not given — no section-of-its-own line for publish",
   !/also publishes <b>Publish \(author the case\)<\/b>/.test(nonOwner));
ok("UI-57: and the strip still offers this reader the acts the record DID publish",
   nonOwner.includes("What can be done here") && nonOwner.includes("Conclude"));
/* DEC-69 OVER THE NON-OWNER'S OWN PAGE: the rule is stated ONCE there too. A
   statement that is restored for a reader and then told to them twice has traded
   one defect for the one DEC-69 names. */
ok("UI-57 / DEC-69: the owner rule is stated to the non-owner exactly ONCE",
   (nsec.match(/data-pubwho="1"/g) || []).length === 1
   && (nsec.match(/published BY A PROJECT, and only by an owner of it/g) || []).length === 1
   && (nsec.match(/data-pubauthored="1"/g) || []).length === 1
   && (nsec.match(/data-pubbar="1"/g) || []).length === 1);
ok("UI-57 / DEC-69: nothing re-confirms or asks them to agree to anything either",
   !/\bconfirm\b/i.test(nsec) && !/\backnowledg/i.test(nsec) && !/\bagree\b/i.test(nsec));
/* AND NOTHING NARRATES THE ABSENCE AT THEM. The rule is stated about the RECORD;
   the surface does not tell this reader what they personally may not do, which
   is Q12's rule and the thing a per-credential variant would have produced. */
ok("UI-57: the absence is not narrated per-credential — the rule is about the record, not the reader",
   !/you (can|may) not|not permitted|insufficient|this credential cannot publish/i.test(nsec));

/* ============ the vocabulary guard, over every page rendered ============ */
for(const [where, html] of PAGES){
  for(const word of ["op=", "bundle_id", "fm_json", "grade_axis", "grade_source", "capture_sha",
                     "current_state=", "published_strength", "affordances", "ACT_FLOW",
                     "publishpreflight", "ADMIN_TOKEN"])
    ok(`${where} never says "${word}"`, !html.includes(word));
  /* D-160: the retired word means the OPPOSITE in SB-OUTPUT §5.1. */
  ok(`${where} never uses the retired word for the boundary case`,
     !new RegExp("susp"+"end", "i").test(html));
}

if(fails.length){ console.error(`publication-entry: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`publication-entry: ${n} assertions, all green — the act stated as irreversible with correction moving forward, editions standing, a withdrawal as another attested act, publication run through the operator, the plane's own label and prompt rendered unmodified, NO ceremony control anywhere and op=publish unreached on the wire, the act strip routing the record's own act at the explanation rather than at a ceremony that does not exist, and (UI-57) the statement gated on the OBJECT so a non-owner D-310 withholds the act from still reads the owner rule byte-for-byte as an owner does, with no control and no invented label`);
