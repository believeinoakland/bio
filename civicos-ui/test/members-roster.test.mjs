/* UI-7 — THE MEMBERS & GOVERNANCE ROSTER (read-only, the READ-ONLY half of U11).
 *
 * Drives the member surface over two read ops (I3), consumed never reshaped:
 *   op=memberlist       — the roster: each member's handle/cover, their CLASS
 *                         (admin|member) read STRAIGHT from the op's `role`,
 *                         standing, and capabilities;
 *   op=adminarith       — the Section 4.7 consensus/majority DENOMINATOR
 *                         (live + the scaling table), shown as "N of M", never
 *                         "pending".
 *
 * Proves UI-7's accepts-when: the roster lists members with their roles from
 * op=memberlist and shows the governance denominator from the arithmetic op,
 * plus the FOUNDER reconciliation (op=adminarith counts an administrator
 * op=memberlist has no row for — the ADMIN_TOKEN holder — and the surface states
 * that rather than showing inconsistent numbers). READ-ONLY: no act op is ever
 * sent.
 *
 * CORRECTED 2026-08-04 by UI-16, never exempted, and the two corrections are
 * different in kind:
 *
 *   (a) TWO ASSERTION GROUPS ARE DELETED BECAUSE THEIR SUBJECT IS DELETED —
 *       the two-owner DIVERGENCE table and the per-member OWNERSHIP column.
 *       The divergence MOVED to the project workspace, beside the ballot that
 *       consumes it: here it was rendered over `op=projectownerarith` with NO
 *       projectId, so its `live` row was null and the screen showed a
 *       denominator for no project and with no act anywhere near it. The
 *       ownership column was a client-side fan-out — one op=projectparticipants
 *       per project, capped at 80 — answering, partially, a question the
 *       workspace now answers exactly in ONE call. Both are asserted in
 *       `project-workspace.test.mjs`, so nothing that was tested has stopped
 *       being tested; and this file now asserts their ABSENCE, so the fan-out
 *       cannot come back unnoticed.
 *
 *   (b) THE `adminarith` MOCK WAS WRONG AND THE SUITE AGREED WITH IT (D-173).
 *       It answered UNWRAPPED, while every Durable-Object answer arrives as
 *       `{ok:true, result:<the store's own return>}`. The surface read
 *       `adminArith.live` off the ENVELOPE, so against every real plane this
 *       screen's whole governance panel rendered "the administrator arithmetic
 *       could not be read with this account" — and 37 assertions passed,
 *       because the mock was shaped like the bug. The mock is wrapped, like
 *       op=memberlist's beside it always was, and the surface reads through
 *       `recR`.
 *
 * NEGATIVE CONTROL: break the ROLE WIRING in app.html — make memberRole() return
 * a constant instead of the op's `role` field (e.g. change `return m && m.role;`
 * to `return "member";`) — and a member's displayed CLASS stops reflecting the
 * op: the administrator's row (and memberRoleBadge on the admin object) no longer
 * says "Administrator", so "an administrator is shown as an administrator FROM
 * the op" and "the roster reflects the op's roles" fail. RUN 2026-07-31: with
 * memberRole forced to `return "member";` in a second VM context built from the
 * source, memberRoleBadge(ADMIN) rendered "Member" and the html carried no
 * "Administrator" — 3 assertions failed ("an administrator is shown as
 * Administrator FROM op=memberlist's role", "memberRoleBadge reads the admin
 * class from the op", "the roster html contains an Administrator class");
 * restored to `return m && m.role;` -> all green.
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ---- the plane's own arithmetic, mirrored so the mock returns faithful op
   output (the SUBJECT under test is the UI reading it, not this re-derivation). */
function adminMath(n){
  const votesNeeded = Math.floor(n/2)+1, eligibleVoters = Math.max(0, n-1);
  return { administrators:n, votesNeeded, eligibleVoters, possible: votesNeeded<=eligibleVoters };
}
const NINE = [1,2,3,4,5,6,7,8,9];

/* ---- the roster. Two ACTIVE administrator rows (alice, dave), one active
   member (bob), one proposed member (carol). op=adminarith will report THREE
   administrators — the third is the founding ADMIN_TOKEN holder, who has no
   members row: the founder-reconciliation case. ---- */
const MEMBERS = [
  { member_id:"m_alice", handle:"alice", cover:"Alice Ng",  role:"admin",  status:"active",
    capabilities:["contribute","publish"], invite_pending:0 },
  { member_id:"m_dave",  handle:"dave",  cover:"Dave Ruiz", role:"admin",  status:"active",
    capabilities:["contribute"], invite_pending:0 },
  { member_id:"m_bob",   handle:"bob",   cover:"Bob R",     role:"member", status:"active",
    capabilities:["contribute"], invite_pending:0 },
  { member_id:"m_carol", handle:"carol", cover:"",          role:"member", status:"proposed",
    capabilities:[], invite_pending:1 },
];
const ADMIN_ARITH = { ok:true, table: NINE.map(adminMath), live: adminMath(3) };   // 3 counted, 2 rows -> founder=1

const CALLS = [];
function mockFetch(u){
  const url = new URL(u, "https://plane.test");
  const op = url.searchParams.get("op");
  const R = o => ({ ok:true, json:async()=>o });
  CALLS.push({ op, projectId:url.searchParams.get("projectId") });
  /* WRAPPED, both of them. The Durable Object answers `{ok:true, result:<the
     store's own return>}` and the control plane adds `store`/`tokenClass`
     around that, so a mock that answers the store's return BARE is a mock
     shaped like the D-173 bug rather than like the plane. */
  if(op==="memberlist")         return R({ ok:true, result:{ members: MEMBERS } });
  if(op==="adminarith")         return R({ ok:true, result: ADMIN_ARITH });
  if(op==="list")               return R({ ok:true, result: [] });
  return R({ ok:false, reason:"unexpected op "+op });
}

/* ---- a DOM stub good enough for innerHTML inspection (as subject-view uses) ---- */
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
  location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:async(u)=>mockFetch(u) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() +
  ";globalThis.__renderMembers=renderMembers;globalThis.__memberRole=memberRole;" +
  "globalThis.__memberRoleBadge=memberRoleBadge;globalThis.__adminDenominatorHtml=adminDenominatorHtml;" +
  "globalThis.__ballotDivergenceHtml=ballotDivergenceHtml;", ctx);

const ADMIN = MEMBERS[0], MEMBER = MEMBERS[2];

/* ---- render ---- */
await ctx.__renderMembers();
const gov  = els.get("#mm-gov")._html;
const list = els.get("#mm")._html;
const html = gov + list;

/* ---- (1) the ROSTER lists members with their CLASS read FROM op=memberlist ---- */
ok("op=memberlist was called for the roster", CALLS.some(c=>c.op==="memberlist"));
ok("every member appears in the roster", ["alice","dave","bob","carol"].every(h=>list.includes(h)));
ok("a member's cover is shown as a label", list.includes("Alice Ng") && list.includes("Bob R"));
/* the ROLE-WIRING seam: the class comes STRAIGHT from the op's `role` */
ok("memberRole reads the class straight from op=memberlist's role field",
   ctx.__memberRole(ADMIN)==="admin" && ctx.__memberRole(MEMBER)==="member");
ok("an administrator is shown as Administrator FROM op=memberlist's role",
   /Administrator/.test(ctx.__memberRoleBadge(ADMIN)));
ok("memberRoleBadge reads the admin class from the op",
   ctx.__memberRoleBadge(ADMIN).includes("Administrator") && !ctx.__memberRoleBadge(ADMIN).includes(">Member<"));
ok("an ordinary member is shown as Member, not Administrator",
   ctx.__memberRoleBadge(MEMBER).includes("Member") && !ctx.__memberRoleBadge(MEMBER).includes("Administrator"));
ok("the roster html contains an Administrator class", /Administrator/.test(list));
ok("the roster html contains a Member class", /Member/.test(list));
/* standing + capabilities are shown honestly */
ok("a proposed member's standing is shown, not hidden", list.includes("Proposed"));
ok("capabilities are shown from the op", list.includes("contribute") && list.includes("publish"));
ok("a member holding no capability reads view only, never a phantom grant", list.includes("view only"));

/* ---- (2) the GOVERNANCE DENOMINATOR from op=adminarith, as a checkable fact ---- */
ok("op=adminarith was called for the governance denominator", CALLS.some(c=>c.op==="adminarith"));
ok("the admin denominator is shown as N of M from the op",
   gov.includes("2 of 3") && /Removing an administrator takes/.test(gov));
ok("the denominator is framed as a fact to check, never pending",
   /never .*pending|never &ldquo;pending&rdquo;/.test(gov) && !/pending approval/.test(gov));
/* the denominator is READ, not recomputed: it equals the op's own live row */
ok("the shown denominator equals op=adminarith's live votesNeeded/administrators",
   gov.includes(`${ADMIN_ARITH.live.votesNeeded} of ${ADMIN_ARITH.live.administrators}`));
/* how the threshold scales, from the op's table */
ok("the admin threshold scaling table is shown from the op's table",
   /How the administrator threshold changes/.test(gov));
ok("the impossible-at-two row is shown as not removable, from the op",
   gov.includes("not removable"));

/* ---- the FOUNDER reconciliation: op=adminarith counts a row op=memberlist lacks ---- */
ok("the founder reconciliation states the counted-but-unlisted administrator",
   /the founding administrator holds the group/.test(gov) && gov.includes("<b>1</b> administrator"));

/* ---- (3) WHAT THIS SCREEN NO LONGER DOES (UI-16). Both were deleted with
   their subject, and their absence is asserted here so neither returns by
   accident: a fan-out is the kind of thing a later session re-adds to answer a
   question that already has an exact answer somewhere else. ---- */
ok("the project-ownership DIVERGENCE is not rendered here — it moved to the workspace",
   !gov.includes("the divergence") && !gov.includes("incl. the departing owner"));
ok("op=projectownerarith is NOT called from the members screen",
   !CALLS.some(c=>c.op==="projectownerarith"));
ok("the per-project fan-out is gone: op=projectparticipants is never called here",
   !CALLS.some(c=>c.op==="projectparticipants"));
ok("the roster has no Owns column", !/<th>Owns<\/th>/.test(list));
ok("the surface still SAYS where the ownership arithmetic lives, rather than dropping it silently",
   /workspace/.test(gov));

/* ---- READ-ONLY: no act op is ever sent from this surface ---- */
const ACT_OPS = ["projectownerremove","memberadd","memberset","adminremove","adminendorse","signeradd","signerset","attest","promote"];
ok("the members surface sends NO act op (read-only)", !CALLS.some(c=>ACT_OPS.includes(c.op)));

/* ---- the vocabulary guard: no plane-internal jargon reaches the member ---- */
for(const word of ["op=", "capture_sha", "member_id", "entity_id", "projectId",
                   "memberlist", "adminarith", "projectownerarith", "projectparticipants", "votesNeeded"])
  ok(`the members surface never says "${word}"`, !html.includes(word));

if(fails.length){ console.error(`members-roster: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`members-roster: ${n} assertions, all green — roster-roles-from-op, admin-denominator-N-of-M (envelope-opened), founder-reconciliation, the moved divergence and the deleted fan-out asserted ABSENT, read-only`);
