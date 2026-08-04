/* UI-17a — S8 THE PUBLICATION ENTRY POINT, the placeholder DEC-33 ships in
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
 *   (7) where the record does NOT publish the act, the section is ABSENT rather
 *       than shown-and-disabled. Absent, not greyed, is the whole rule.
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
  /* Open: the record does NOT publish the act, so the section must be absent. */
  "INQ-2026-9003": { state:"open", title:"Who approved the transfer?",
    acts:[CONCLUDE_ACT],
    q:"Which officer approved the transfer out of the sewer fund?",
    f:"A signed approval carrying a different officer's name." },
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

/* ============ (6) ABSENT, NOT GREYED, WHERE THE RECORD DOES NOT PUBLISH IT ============ */
const openQ = await open("INQ-2026-9003");
PAGES.push(["an open question", openQ]);
ok("the entry point does not render on a question the record does not offer the act for",
   section(openQ) === "");
ok("and nothing is left in its place — no heading, no stub, no greyed control",
   !openQ.includes("Publishing this case") && !/disabled/.test(openQ));
ok("the act strip on that page is unchanged and offers its own acts",
   openQ.includes("What can be done here") && openQ.includes("Conclude"));
ok("nothing on that page says publication runs through anyone",
   !/operator/i.test(openQ));

/* the function itself refuses the same way, for a caller that is not this page */
ok("the entry point renders NOTHING for a refusal from the plane",
   ctx.__publicationEntryHtml({ ok:false, refusal:{reason:"NO_SUCH_BUNDLE"}, acts:[] })==="");
ok("the entry point renders NOTHING where no act was published",
   ctx.__publicationEntryHtml({ ok:true, acts:[] })==="");
ok("the entry point renders NOTHING for a null answer",
   ctx.__publicationEntryHtml(null)==="");
ok("the entry point does not render for some OTHER act",
   ctx.__publicationEntryHtml({ ok:true, acts:[CONCLUDE_ACT] })==="");

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
console.log(`publication-entry: ${n} assertions, all green — the act stated as irreversible with correction moving forward, editions standing, a withdrawal as another attested act, publication run through the operator, the plane's own label and prompt rendered unmodified, NO ceremony control anywhere and op=publish unreached on the wire, and the act strip routing the record's own act at the explanation rather than at a ceremony that does not exist`);
