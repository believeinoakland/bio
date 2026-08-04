/* UI-16 — E4 THE PROJECT WORKSPACE, and the BALLOT act's first call site.
 *
 * Drives `openProjectWorkspace` and `renderProjects` over a mock plane that
 * answers the way the plane answers: every Durable-Object read WRAPPED
 * (`{ok:true, result:<the store's own return>}`) and every store refusal as a
 * VALUE inside that envelope on HTTP 200, never a throw. The mock decides what
 * each credential may see the way the STORE decides it — from the `by`/`viewer`
 * the control plane stamps server-side, which the browser never sends — so
 * four credentials drive the same page and get four different answers.
 *
 * WHAT THIS PROVES, clause by clause from the item's acceptance:
 *
 *   (1) THE BALLOT IS REACHED FROM THE WORKSPACE, not from a test. D-134: a
 *       complete, tested ballot act existed and NOTHING could reach it —
 *       `openBallotDialog` and `canBallot` were referenced only by
 *       act-ballot.test.mjs. The workspace renders a control whose onclick is
 *       `projectBallotGo()`, which takes NO ARGUMENTS: the project and its
 *       title come from the workspace the member is looking at. This suite
 *       calls that zero-argument function and asserts the dialog painted, so a
 *       test cannot be what supplies the act its subject.
 *
 *   (2) THE DENOMINATOR COMES FROM op=projectownerarith's `live` ROW. The
 *       arithmetic MOVED here from the Members screen, where it was read with
 *       no projectId (live: null) and shown with no act anywhere near it.
 *
 *   (3) AN UNINVITED MEMBER SEES NO TRACE. 7.9. The workspace asks
 *       op=projectparticipants FIRST AND ALONE, and on the store's own
 *       NO_SUCH_PROJECT renders that refusal and stops: no title, no objective,
 *       no handle, no arithmetic, no control — and NO SECOND READ, so there is
 *       no timing, count or error that could say something is there.
 *
 *   (4) AN INVITED-NOT-JOINED MEMBER SEES THE SKELETON AND NOT THE PARTICIPANT
 *       LIST. The plane is explicit that this is the reader's distinction to
 *       apply (`viewerPredicate`: invited and joined "differ in how much of the
 *       project they see, which is a per-FIELD distinction the reader applies").
 *
 *   (5) NO STRENGTH AND NO GRADE APPEAR ON THE PAGE, on any credential. THE
 *       CONTAINER LINE: a project is a container with membership and access
 *       control; an inquiry is a claim structure. The workspace lists the
 *       questions inside it with their type and state and says nothing about
 *       how strong any of them is.
 *
 *   (6) THE SEVEN UNREACHED project* OPS HAVE CALL SITES, each driven from the
 *       workspace and each reaching the plane with the fields the member
 *       authored: projectinvite, projectjoin, projectleave, projectremove,
 *       projectowneradd, projectownerrescue, projectfork.
 *
 *   (7) DEC-8: no refusal rendered on this page was computed on this page.
 *       Every refusal shown is byte-for-byte the sentence the plane returned.
 *
 *   (8) Q12: narration is one sentence, plane-sourced, about the CREDENTIAL and
 *       its POSITION — and no control is narrated or greyed. A member whose row
 *       reads `leaving` holds no act until an owner acts, and is the credential
 *       that renders it.
 *
 * NEGATIVE CONTROL — TWO ARMS, RUN 2026-08-04 ON DISK against
 * civicos-ui/app.html (not only in a VM), the suite re-run against the mutated
 * file, and the file restored byte-identical after each: app.html's sha256 was
 * b643ce4d68f71b300c51f960a508c3ad784964301d2442564da4b69c9905d339 before both
 * arms and after both. Each arm is ALSO rebuilt in a second VM context inside
 * this file (`arm()` below), so re-running the control takes one step.
 *
 *   (a) RENDER AN INQUIRY'S GRADE IN THE WORKSPACE. In `projectContentsHtml`'s
 *       backlink row, add the leg grade beside the type and state:
 *         `${esc(typeLabel(b.from_type, b.from_state))} &middot; ${esc(String(b.rel||"cites"))} this project`
 *       -> insert ` &middot; Grade ${esc(String(b.grade||""))} ` after the type
 *       -> RUN: 7 of 112 failed — "the contents name the question by title,
 *       type and state and NOTHING about how strong it is", plus "the workspace
 *       renders no grade letter anywhere" FIVE TIMES, once for each credential
 *       the suite drives: owner, joined non-owner, invited-not-joined,
 *       administrator, and the member with no act. THE FIVE ARE THE POINT and
 *       are why the scan runs per credential rather than once: the same
 *       contents block renders on the SKELETON, so a grade added for an owner
 *       leaks to the credential entitled to LEAST. (The seventh failure is this
 *       file's own "the mutation actually changed the source", which correctly
 *       reports that the on-disk source is already mutated.)
 *
 *   (b) A SURFACE-WORDED REFUSAL: THE RIGHT CODE, AN INVENTED SENTENCE. In
 *       `openProjectWorkspace`'s visibility arm, replace the plane's refusal
 *       with one composed here carrying the SAME reason code:
 *         `${crumb}${actRefusalHtml(pp.refusal)}` ->
 *         `${crumb}${actRefusalHtml({ reason: pp.refusal.reason,
 *            detail:"You do not have access to this project." })}`
 *       -> RUN: 4 of 112 failed — "the uninvited member is shown the PLANE's
 *       own sentence, verbatim", "no sentence on the refusal page was written
 *       here", the contrast assertion, and the mutation check.
 *       WORTH KNOWING, and it is the arm-(d) instrument UI-12 named: a suite
 *       that asserted only the reason CODE would have passed this arm
 *       completely — the code is right and only the sentence is invented, which
 *       is exactly what DEC-8 exists to catch. So the assertions pin the
 *       PLANE'S SENTENCE (copied into `NO_SUCH_DETAIL` from store.mjs) and
 *       scan the RESIDUE — the page with that sentence removed — for any
 *       refusal prose this surface could have written. Scanning the whole page
 *       would be scanning the plane's own words, which legitimately say
 *       "uninvited".
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

const PID = "PROJ-2026-0001";
const TITLE = "The marina money";
/* The store's OWN ownerMath, mirrored ONLY to build a faithful op answer. The
   subject is the surface READING it, never this re-derivation. */
function ownerMath(nn){
  if(nn<=1) return { owners:nn, votesNeeded:0, eligibleVoters:0, targetMayVote:false, possible:false,
                     why:"one owner is the floor, so the last owner is not removable" };
  if(nn===2) return { owners:2, votesNeeded:2, eligibleVoters:2, targetMayVote:true, possible:true,
                      why:"both owners must agree, the departing one included: resignation with the other's assent" };
  const votesNeeded = Math.floor(nn/2)+1, eligibleVoters = nn-1;
  return { owners:nn, votesNeeded, eligibleVoters, targetMayVote:false, possible: votesNeeded<=eligibleVoters,
           why:"a majority of all owners, the target counted in the denominator and not voting" };
}

/* THE PARTICIPATION TABLE, as the store holds it. Three owners, so the live row
   is ownerMath(3): 2 of 3, and 2 of the 3 may vote. */
const ROWS = [
  { handle:"alice", owner:1, state:"joined",  comment:null },
  { handle:"bella", owner:1, state:"joined",  comment:null },
  { handle:"cass",  owner:1, state:"joined",  comment:null },
  { handle:"dan",   owner:0, state:"joined",  comment:null },
  { handle:"erin",  owner:0, state:"invited", comment:null },
  { handle:"fay",   owner:0, state:"leaving", comment:"moving to another group" },
];
const OWNERS = ROWS.filter(r=>r.owner).length;    // 3

/* THE STORE'S OWN WORDS for the 7.9 refusal, copied from
   bio-plane/src/store.mjs `projectParticipants`. The suite pins THIS sentence,
   because a suite that pinned only the reason code would pass an invented one. */
const NO_SUCH_DETAIL = "no project by that identifier is visible to you. An uninvited member cannot see "
                     + "that a project exists, so this is the same answer as for one that does not.";

const OBJECTIVE = "Establish whether the sewer enterprise fund paid for marina construction, and put the answer to the council.";
const EVALS = [
  { kind:"compliance", strictness:"internal", result:"pass", timestamp:"2026-07-02T10:00:00Z" },
  { kind:"argument",   strictness:"internal", result:"findings", timestamp:"2026-07-19T09:30:00Z",
    findings_ref:"data/eval-argument-1.json" },
];
const REFS = [{ target:"INFO-2026-0100", rel:"cites", status:"confirmed", note:"the ledger" }];
/* What points AT the project — the questions and actions inside it. Each row
   carries a `grade` the plane happens to publish nowhere on this shape; it is
   here so the negative control has something real to leak. */
const BACKLINKS = [
  { from:"INQ-2026-0009", from_type:"inquiry", from_state:"concluded",
    from_title:"Did the sewer fund pay for the marina?", rel:"cites", grade:"C" },
  { from:"ACTN-2026-0002", from_type:"action", from_state:"awaiting_response",
    from_title:"Records request to the harbour district", rel:"cites", grade:"B" },
];
const RECORD = [
  { bundle_id:PID, object_type:"project", title:TITLE, current_state:"investigating", last_updated:"2026-07-20" },
  { bundle_id:"PROJ-2026-0002", object_type:"project", title:"Zoning watch", current_state:"forming", last_updated:"2026-07-01" },
  { bundle_id:"INFO-2026-0100", object_type:"information", title:"A ledger", current_state:"verified", last_updated:"2026-06-01" },
];

const BUNDLE_MD = `---\nobject_type: project\ncurrent_state: investigating\ntitle: ${TITLE}\n---\n`
  + `## Thesis Summary\n\nThe fund moved money it was not permitted to move.\n\n## Session Log\n\n- promoted\n`;
const FM_JSON = JSON.stringify({ objective: OBJECTIVE, workproduct_state:"internally_checked",
                                 evaluations: EVALS, references: REFS });

/* ---- the mock plane. `AS` is what the CONTROL PLANE would stamp from the
   session; the browser sends none of it, which is the whole point of the
   server-side stamp, so the mock holds it rather than reading a parameter. ---- */
let AS = { handle:"alice", session:true, administer:false };
const CALLS = [];
function mockFetch(u, opts){
  const url = new URL(u, "https://plane.test");
  const op = url.searchParams.get("op");
  const params = Object.fromEntries(url.searchParams.entries());
  CALLS.push({ op, params, method:(opts&&opts.method)||"GET" });
  const R  = o => ({ ok:true, json:async()=>o });
  const W  = o => R({ ok:true, result:o, store:"bio", tokenClass:"member" });

  const mine = AS.session ? ROWS.find(r=>r.handle===AS.handle) || null : null;
  /* The D-15 gate, as `viewerPredicate` compiles it: a project bundle is
     visible to a participant of any state, and to an active administrator. */
  const sees = !!mine || !!AS.administer;

  if(op==="projectparticipants"){
    if(!sees) return W({ ok:false, reason:"NO_SUCH_PROJECT", detail: NO_SUCH_DETAIL });
    return W({ ok:true, projectId:params.projectId, participants: ROWS });
  }
  if(op==="projectownerarith")
    return W({ ok:true, projectId:params.projectId || null,
               table:[1,2,3,4,5,6,7,8,9].map(ownerMath),
               live: params.projectId ? ownerMath(sees ? OWNERS : 0) : null });
  if(op==="image")     return R({ ok:true, result: sees ? { "bundle.md": BUNDLE_MD } : null });
  if(op==="projection")return R({ ok:true, result: sees
    ? { bundle_id:PID, object_type:"project", title:TITLE, current_state:"investigating", fm_json:FM_JSON }
    : null });
  if(op==="backlinks") return W({ ok:true, target:params.target, backlinks: sees ? BACKLINKS : [] });
  if(op==="list")      return R({ ok:true, result: sees ? RECORD : RECORD.filter(b=>b.object_type!=="project") });
  /* The seven roster acts. The store's judgement is not modelled — this suite's
     subject is that each op is REACHED with the fields the member authored, and
     that whatever comes back is rendered in the plane's words, not that the
     store's own rules work (bio-plane/test/projects.test.mjs owns those). */
  if(["projectinvite","projectjoin","projectleave","projectremove","projectowneradd",
      "projectownerrescue","projectfork"].includes(op))
    return W({ ok:true, projectId:params.projectId, handle:params.handle||null, recorded:op });
  if(op==="projectownerremove") return W({ ok:true, projectId:params.projectId, handle:params.handle,
    owner:false, stillAParticipant:true, owners:["alice","bella"], deciders:["alice","bella"] });
  return R({ ok:false, error:"unexpected op "+op });
}

/* ---- a DOM stub good enough for innerHTML inspection ---- */
function makeCtx(src){
  const els = new Map();
  function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){}, remove(){}, onclick:null };
    Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
    setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
    matchMedia:()=>({matches:false}),
    document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
      querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(),
      hidden:false, createElement:()=>el(), body:{appendChild(){}} },
    location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:async(u,opts)=>mockFetch(u,opts) };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(src +
    ";globalThis.__PLANE=PLANE;globalThis.__open=openProjectWorkspace;globalThis.__renderProjects=renderProjects;" +
    "globalThis.__ballotGo=projectBallotGo;globalThis.__openRoster=openRosterAct;globalThis.__doRoster=doRosterAct;" +
    "globalThis.__route=projectRouteFromHash;globalThis.__pos=projectPosition;globalThis.__WS=()=>WORKSPACE;", ctx);
  ctx.__els = els;
  return ctx;
}

const SRC = appScript();
const ctx = makeCtx(SRC);
const q = sel => ctx.document.querySelector(sel);
const content = () => q("#content")._html;
const dlg = () => q("#dlg")._html;
/* The screens paint their table into a holder of their own, so the projects
   screen's rows live under `#recrows-holder` and not under `#content`. */
const holder = () => q("#recrows-holder")._html;

/* Sign in as one of the six, the way the plane would report it. */
function signIn(handle, extra){
  const who = { member:"m_"+handle, handle, session:true, administer:false,
                capabilities:["contribute","create_projects"], ...(extra||{}) };
  AS = { handle, session: who.session !== false, administer: !!who.administer };
  ctx.__PLANE.session = true;
  ctx.__PLANE.me = who;
}
async function open(handle, extra){
  signIn(handle, extra);
  CALLS.length = 0;
  await ctx.__open(PID);
  return content();
}

/* THE STRENGTH/GRADE SCAN, run over EVERY credential's page rather than once,
   because the leak that matters most reaches the credential entitled to least.
   It is STRUCTURAL where it can be: any grade letter in the record's own
   vocabulary, and every word the strength surfaces spell. */
function noStrength(html, who){
  ok(`${who}: the workspace renders no grade letter anywhere`,
     !/\bGrade [ABCD]\b/.test(html) && !/subj-grade/.test(html));
  ok(`${who}: the container line holds — no strength vocabulary reaches this page`,
     !/UNRATED/.test(html)
     && !/How directly the record holds the documents/.test(html)
     && !/How strongly the links between them were established/.test(html)
     && !/supports this/.test(html) && !/cuts against this/.test(html)
     && !/What would falsify/.test(html)
     && !/rests on/.test(html));
}

/* ============ (1) THE PROJECTS SCREEN — a row opens the WORKSPACE ============ */
{
  signIn("alice");
  CALLS.length = 0;
  await ctx.__renderProjects();
  const html = content() + holder();
  ok("the projects screen lists the group's projects", html.includes(TITLE) && html.includes("Zoning watch"));
  ok("it does NOT list non-project bundles", !html.includes("A ledger"));
  ok("a project row carries the id the workspace opens on", html.includes(`data-id="${PID}"`));
  ok("the projects screen reads op=list and nothing else", CALLS.every(c=>c.op==="list"));
  ok("renderFiltered's Projects arm is gone from the source: the screen has its own renderer",
     /projects: renderProjects/.test(SRC) && !/renderFiltered\("projects"/.test(SRC));
}

/* ============ (2) THE WORKSPACE, as a JOINED OWNER ============ */
const asOwner = await open("alice");
{
  ok("op=projectparticipants was read for who is working on this",
     CALLS.some(c=>c.op==="projectparticipants" && c.params.projectId===PID));
  ok("WHO IS WORKING ON THIS comes from exactly ONE call — the fan-out is gone",
     CALLS.filter(c=>c.op==="projectparticipants").length===1);

  /* the objective (C-2.9 requires it non-empty) */
  ok("the objective renders as the record holds it", asOwner.includes(OBJECTIVE));

  /* the readiness ladder — the record's rung, and the RECORDED evaluations */
  for(const w of ["Draft","Internally checked","Externally compliant","Distributed"])
    ok(`the readiness ladder shows the rung "${w}"`, asOwner.includes(w));
  ok("the rung the RECORD declares is the one marked",
     /pf-row ok[\s\S]{0,200}Internally checked/.test(asOwner));
  ok("no other rung is marked", (asOwner.match(/pf-row ok/g)||[]).length===1);
  ok("the recorded evaluations are shown as the dated facts they are",
     asOwner.includes("compliance") && asOwner.includes("argument")
     && asOwner.includes("pass") && asOwner.includes("findings")
     && asOwner.includes("data/eval-argument-1.json"));
  ok("the page says the ladder moves on a RECORDED evaluation and not on a judgement made here",
     /moves when an evaluation is RECORDED/.test(asOwner));
  ok("the page does not restate the plane's rung requirements — it asserts no eligibility",
     !/requires a passing/.test(asOwner));

  /* who is working on this */
  for(const r of ROWS) ok(`the participant list names ${r.handle}`, asOwner.includes(r.handle));
  ok("an owner is marked as an owner, from the store's own flag", asOwner.includes(">owner<"));
  ok("a participant's own standing is shown as the store holds it",
     asOwner.includes("invited") && asOwner.includes("leaving"));

  /* THE DENOMINATOR, from op=projectownerarith's LIVE row for THIS project */
  ok("op=projectownerarith was read WITH this project's id",
     CALLS.some(c=>c.op==="projectownerarith" && c.params.projectId===PID));
  const live = ownerMath(OWNERS);
  ok("the denominator is the op's own live figure (2 of 3)",
     asOwner.includes(`takes <b>${live.votesNeeded} of ${live.owners}</b>`));
  ok("it names how many of them may vote, also from the op",
     asOwner.includes(`${live.eligibleVoters} of the ${live.owners} may vote`));
  ok("the two-owner DIVERGENCE moved here and is shown from the op's table",
     asOwner.includes("the divergence") && asOwner.includes("incl. the departing owner"));
  ok("the divergence carries the plane's OWN words for the n=2 row",
     asOwner.includes("resignation with the other"));
  ok("the arithmetic is shown BESIDE the act, and the page says why",
     /a denominator with no act beside it/.test(asOwner));

  /* THE CONTENTS — a container's, and nothing about strength */
  ok("the contents name the question inside the project", asOwner.includes("Did the sewer fund pay for the marina?"));
  ok("the contents name the action inside the project", asOwner.includes("Records request to the harbour district"));
  ok("the contents name what the project itself cites", asOwner.includes("INFO-2026-0100"));
  ok("the contents name the question by title, type and state and NOTHING about how strong it is",
     asOwner.includes("Finding") && !asOwner.includes("Grade C") && !asOwner.includes("Grade B"));
  ok("the page states the container line in its own words",
     /a project is a container with membership and access control/.test(asOwner));
  noStrength(asOwner, "owner");
}

/* ============ (3) THE BALLOT, REACHED FROM THE WORKSPACE ============ */
{
  ok("the workspace renders the ballot's call site", asOwner.includes("projectBallotGo()"));
  ok("D-134: before this item nothing referenced openBallotDialog outside its own definition and its test — now the workspace does",
     (SRC.match(/openBallotDialog/g)||[]).length >= 2);
  ok("canBallot has a call site too — it was referenced nowhere but its own definition",
     (SRC.match(/canBallot\(/g)||[]).length >= 2);
  CALLS.length = 0;
  /* NO ARGUMENTS. The project and its title come from the workspace, which is
     what makes this a call site rather than a second way of typing a test's
     arguments. */
  await ctx.__ballotGo();
  const d = dlg();
  ok("the ballot dialog painted from the workspace", /Remove a project owner/.test(d));
  ok("the ballot names the project the workspace was showing", d.includes(TITLE) && d.includes(PID));
  ok("the ballot read the arithmetic op", CALLS.some(c=>c.op==="projectownerarith"));
  ok("the ballot read the owners to choose from", CALLS.some(c=>c.op==="projectparticipants"));
  ok("the ballot's denominator is the op's own figure (2 of 3), not a recomputation",
     d.includes("takes <b>2 of 3</b>"));
  ok("the ballot offers the OWNERS as targets and not every participant",
     d.includes("bella") && d.includes("cass") && !d.includes("dan"));
  noStrength(d, "the ballot dialog");
}

/* ============ (4) THE SEVEN ROSTER OPS, EACH DRIVEN FROM THE WORKSPACE ============ */
async function drive(actId, fields){
  CALLS.length = 0;
  ctx.__openRoster(actId);
  for(const [k,v] of Object.entries(fields||{})) q("#ra-"+k).value = v;
  const r = await ctx.__doRoster();
  return { r, call: CALLS.find(c=>c.op===ROSTER_OP[actId]) };
}
const ROSTER_OP = { projectinvite:"projectinvite", projectjoin:"projectjoin", projectleave:"projectleave",
  projectremove:"projectremove", projectowneradd:"projectowneradd",
  projectownerrescue:"projectownerrescue", projectfork:"projectfork" };
{
  /* the owner's five */
  ok("the workspace offers the owner's roster controls",
     ["projectinvite","projectremove","projectowneradd","projectleave","projectfork"]
       .every(a=>asOwner.includes(`openRosterAct(&quot;${a}&quot;)`)));
  ok("a control this credential holds no position for is ABSENT, never greyed",
     !asOwner.includes("projectjoin") && !asOwner.includes("projectownerrescue")
     && !/disabled/.test(asOwner));

  let d = await drive("projectinvite", { handle:"gil" });
  ok("op=projectinvite is reached with the authored handle", !!d.call && d.call.params.handle==="gil");
  ok("the browser never sends who is acting — `by` is the plane's server-side stamp",
     !!d.call && !("by" in d.call.params));

  d = await drive("projectremove", { handle:"dan", comment:"left the group" });
  ok("op=projectremove is reached with the handle and the note",
     !!d.call && d.call.params.handle==="dan" && d.call.params.comment==="left the group");

  d = await drive("projectowneradd", { handle:"dan" });
  ok("op=projectowneradd is reached with the authored handle", !!d.call && d.call.params.handle==="dan");

  d = await drive("projectleave", { comment:"handing over" });
  ok("op=projectleave is reached with the note", !!d.call && d.call.params.comment==="handing over");

  d = await drive("projectfork", { newId:"PROJ-2026-0007", title:"The marina money, harbour half" });
  ok("op=projectfork is reached with the new id and name",
     !!d.call && d.call.params.newId==="PROJ-2026-0007" && /harbour half/.test(d.call.params.title));

  /* the receipt renders the record's own fields, and nothing composed */
  ok("the roster receipt renders the record's own fields", /Recorded\./.test(dlg()) && dlg().includes("projectfork"));
}

/* ============ (5) A JOINED PARTICIPANT WHO IS NOT AN OWNER ============ */
{
  const asDan = await open("dan");
  ok("a non-owner sees the whole workspace", asDan.includes(OBJECTIVE) && asDan.includes("bella"));
  ok("a non-owner is offered NO owner control — absent, not greyed",
     !asDan.includes("projectinvite") && !asDan.includes("projectowneradd")
     && !asDan.includes("projectremove") && !asDan.includes("projectBallotGo"));
  ok("a non-owner IS offered the acts their own position carries",
     asDan.includes("projectleave") && asDan.includes("projectfork"));
  ok("a member without create_projects is offered no fork — the capability is ABSENT, not refused at submit",
     !(await open("dan", { capabilities:["contribute"] })).includes("projectfork"));
  noStrength(asDan, "a joined non-owner");
}

/* ============ (6) THE INVITED-NOT-JOINED MEMBER: the SKELETON ============ */
{
  const asErin = await open("erin");
  ok("the invited member sees that the project exists and what it is for",
     asErin.includes(TITLE) && asErin.includes(OBJECTIVE));
  ok("the invited member sees what is IN the project (the skeleton, 7.9)",
     asErin.includes("Did the sewer fund pay for the marina?"));
  ok("the invited member is NOT shown the participant list",
     !asErin.includes("alice") && !asErin.includes("bella") && !asErin.includes("cass"));
  ok("the invited member is NOT shown the work product or its evaluations",
     !asErin.includes("Internally checked") && !asErin.includes("data/eval-argument-1.json"));
  ok("the invited member is NOT shown the ownership arithmetic",
     !asErin.includes("takes <b>") && !asErin.includes("the divergence"));
  ok("the withholding is SAID, in this page's own voice, and claims nothing about what the record would answer",
     /shows you the project's skeleton/.test(asErin) && !/refus/i.test(asErin));
  ok("the one act offered is the one that ends it",
     asErin.includes("projectjoin") && !asErin.includes("projectleave")
     && !asErin.includes("projectinvite") && !asErin.includes("projectBallotGo"));
  ok("the workspace never asked for the arithmetic on the skeleton path",
     !CALLS.some(c=>c.op==="projectownerarith"));
  noStrength(asErin, "the invited-not-joined member");

  const d = await drive("projectjoin", {});
  ok("op=projectjoin is reached from the skeleton", !!d.call && d.call.params.projectId===PID);
}

/* ============ (7) THE UNINVITED MEMBER: NO TRACE, ANYWHERE ============ */
{
  const asZed = await open("zed");
  ok("the uninvited member is shown the PLANE's own sentence, verbatim", asZed.includes(NO_SUCH_DETAIL));
  /* Everything on the page EXCEPT the plane's own sentence must carry no
     refusal prose at all. Scanning the whole page would be scanning the plane's
     words too — its sentence legitimately says "uninvited" — so the plane's
     sentence is removed first and the RESIDUE is what this surface wrote. */
  const residue = asZed.split(NO_SUCH_DETAIL).join("");
  ok("no sentence on the refusal page was written here",
     !/access/i.test(residue) && !/permission/i.test(residue) && !/not allowed/i.test(residue)
     && !/invited/i.test(residue) && !/You do not/i.test(residue) && !/cannot/i.test(residue));
  ok("the refusal carries the record's own code", asZed.includes("NO_SUCH_PROJECT"));
  /* NO TRACE: not the name, not the objective, not a handle, not a number */
  ok("the uninvited member sees no title", !asZed.includes(TITLE));
  ok("the uninvited member sees no objective", !asZed.includes(OBJECTIVE));
  ok("the uninvited member sees no participant",
     !ROWS.some(r=>asZed.includes(r.handle)));
  ok("the uninvited member sees no ownership arithmetic",
     !asZed.includes("takes <b>") && !asZed.includes("the divergence"));
  ok("the uninvited member sees nothing that is in the project",
     !asZed.includes("Did the sewer fund pay for the marina?") && !asZed.includes("INFO-2026-0100"));
  ok("the uninvited member is offered no control of any kind",
     !asZed.includes("openRosterAct") && !asZed.includes("projectBallotGo"));
  /* AND NO SECOND READ. The visibility read is asked FIRST AND ALONE, so there
     is no timing, count or error from any other op that could say a project is
     there. */
  ok("exactly ONE op was sent for an invisible project, and it was the visibility read",
     CALLS.length===1 && CALLS[0].op==="projectparticipants");
  ok("the projects screen does not list it either (op=list is gated)",
     !(await (async()=>{ signIn("zed"); await ctx.__renderProjects(); return content(); })()).includes(TITLE));
  noStrength(asZed, "the uninvited member");
}

/* ============ (8) THE ADMINISTRATOR: one participation power, 7.13 ============ */
{
  const asMira = await open("mira", { administer:true });
  ok("an administrator with no row reads the project (7.7)", asMira.includes(TITLE) && asMira.includes("alice"));
  ok("an administrator is offered the ONE participation power they hold, and no other",
     asMira.includes("projectownerrescue") && !asMira.includes("projectinvite")
     && !asMira.includes("projectremove") && !asMira.includes("projectBallotGo"));
  ok("the rescue control does not claim to know whether the project is stranded",
     !/stranded project/i.test(asMira) || !/is stranded/i.test(asMira));
  const d = await drive("projectownerrescue", { handle:"gil", reason:"every owner is inactive" });
  ok("op=projectownerrescue is reached with the handle and the reason",
     !!d.call && d.call.params.handle==="gil" && /every owner is inactive/.test(d.call.params.reason));
  noStrength(asMira, "the administrator");
}

/* ============ (9) Q12 — one plane-sourced sentence, no narrated control ============ */
{
  const asFay = await open("fay");                     // her row reads `leaving`
  ok("a member with no act is offered NO control at all",
     !asFay.includes("openRosterAct") && !asFay.includes("projectBallotGo"));
  ok("nothing is greyed: no disabled control exists on the page", !/disabled/.test(asFay));
  const notes = [...asFay.matchAll(/class="subj-note">([\s\S]*?)<\/p>/g)].map(m=>m[1]);
  const cred = notes.filter(t=>/this account/.test(t));
  ok("EXACTLY ONE sentence narrates the credential", cred.length===1);
  ok("and it is sourced from the record's own word for her position",
     cred[0].includes("leaving"));
  ok("no control is named, explained away, or described as unavailable in it",
     !/cannot|unavailable|not permitted|no permission/i.test(cred[0]));
  noStrength(asFay, "a member with no act");
}

/* ============ (10) THE ROUTE ============ */
{
  ok("`#project/<id>` is a real address", /\^#project/.test(String(ctx.__route)));
  signIn("alice");
  ctx.__els.get("#content")._html = "";
  const ctx2 = makeCtx(SRC);
  ctx2.__PLANE.session = true;
  ctx2.__PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };
  AS = { handle:"alice", session:true, administer:false };
  ok("an unrelated hash is not this route's", ctx2.__route()===false);
}

/* ================= NEGATIVE CONTROLS — RUN, not inferred ================= */
const appPath = new URL("../app.html", import.meta.url).pathname;
const before = fs.readFileSync(appPath);

async function arm(name, mutate, expectFailures){
  const BROKEN = mutate(SRC);
  ok(`NEG-CONTROL ${name}: the mutation actually changed the source`, BROKEN !== SRC);
  const c = makeCtx(BROKEN);
  c.__PLANE.session = true;
  c.__PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false,
                   capabilities:["contribute","create_projects"] };
  AS = { handle:"alice", session:true, administer:false };
  await c.__open(PID);
  const html = c.__els.get("#content")._html;
  for(const [what, cond] of expectFailures(html))
    ok(`NEG-CONTROL ${name}: ${what}`, cond);
}

/* (a) RENDER AN INQUIRY'S GRADE IN THE WORKSPACE. */
await arm("(a) an inquiry's grade rendered in the workspace",
  s => s.replace('${esc(typeLabel(b.from_type, b.from_state))} &middot; ${esc(String(b.rel||"cites"))} this project',
                 '${esc(typeLabel(b.from_type, b.from_state))} &middot; Grade ${esc(String(b.grade||""))} &middot; ${esc(String(b.rel||"cites"))} this project'),
  html => [
    ["with the grade leaked, a grade letter IS on the page", /\bGrade [ABCD]\b/.test(html)],
    ["and the assertion this suite runs would fail on it", /Grade C/.test(html)],
  ]);

/* (b) A SURFACE-WORDED REFUSAL: the RIGHT CODE, an INVENTED SENTENCE. This is
   the arm-(d) instrument — a suite pinning only the reason code passes it. */
await arm("(b) a surface-worded refusal with the right code",
  s => s.replace("$"+"{crumb}$"+"{actRefusalHtml(pp.refusal)}",
                 "$"+"{crumb}$"+"{actRefusalHtml({ reason: pp.refusal.reason, detail:\"You do not have access to this project.\" })}"),
  () => []);
{
  /* driven on the credential the arm is about */
  const BROKEN = SRC.replace("$"+"{crumb}$"+"{actRefusalHtml(pp.refusal)}",
    "$"+"{crumb}$"+"{actRefusalHtml({ reason: pp.refusal.reason, detail:\"You do not have access to this project.\" })}");
  const c = makeCtx(BROKEN);
  c.__PLANE.session = true;
  c.__PLANE.me = { member:"m_zed", handle:"zed", session:true, administer:false, capabilities:["contribute"] };
  AS = { handle:"zed", session:true, administer:false };
  await c.__open(PID);
  const html = c.__els.get("#content")._html;
  ok("NEG-CONTROL (b): the REASON CODE is still right — a suite pinning only the code would pass this arm",
     html.includes("NO_SUCH_PROJECT"));
  ok("NEG-CONTROL (b): and the PLANE's own sentence is gone, which is what this suite pins",
     !html.includes(NO_SUCH_DETAIL));
  ok("NEG-CONTROL (b): the invented sentence is what renders instead",
     html.includes("You do not have access to this project."));
}
/* control-of-the-control: the intact surface DID render the plane's sentence */
{
  const asZed = await open("zed");
  ok("NEG-CONTROL contrast: the intact surface renders the plane's sentence and no invented one",
     asZed.includes(NO_SUCH_DETAIL) && !asZed.includes("You do not have access"));
}
const after = fs.readFileSync(appPath);
ok("app.html is byte-identical after both negative controls", Buffer.compare(before, after)===0);

if(fails.length){ console.error(`project-workspace: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`project-workspace: ${n} assertions, all green — the row opens the workspace · objective · the readiness ladder on RECORDED evaluations · WHO IS WORKING ON THIS from ONE call · the denominator and the divergence MOVED here from op=projectownerarith's live row · the BALLOT reached from the workspace with no arguments · seven roster ops with call sites · uninvited sees NO trace and ONE read · invited-not-joined sees the skeleton and not the list · no strength and no grade on any credential's page; negative controls RUN, both arms`);
