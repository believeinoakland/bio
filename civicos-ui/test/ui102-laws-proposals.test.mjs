/* UI-102 — A GOVERNING-LAWS PROPOSAL GETS A SURFACE, BESIDE THE LIST AND NEVER A WAY TO SET IT.
 *
 * THE ROW: REC-195's `op=actionlawspropose` and `action.governing_laws_proposals` are on `main` and
 * reach no page. `construct-status.json` 8.governing-laws named the gap as UI's, and IC-267's
 * consumer-impact section named the same act: *"`civicos-ui/app.html`'s action page should render
 * `action.governing_laws_proposals` beside the list, each proposal under the plane's own `says` and
 * never a sentence of the page's own, and must not offer a proposal as a way of setting the list."*
 *
 * DESIGN: `docs/architecture/BIO_Case_Making_v0_1.md` §2, *A RECORDS REQUEST NAMES EVERY LAW THAT
 * GOVERNS IT* (D-149, Bob 2026-09-22): *"the machine may propose the list from the counterparty,
 * labelled as machine work, and never sets it."*
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * `bio-plane/src/index.mjs` runs under miniflare. Every sentence this suite asserts the page renders
 * is read out of `op=projection`'s OWN answer in the same run, never written here: a literal in this
 * file would agree with the plane for free, and the whole property is that the member reads the
 * record's words. The proposals are written through `op=actionlawspropose` — one by a machine
 * credential, one by a signed-in member — and the member's list through `op=actionlaws`, so the two
 * keys the page sets side by side were produced by the two acts that really produce them.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (1) A PAGE THAT WROTE THE SENTENCES ITSELF — every sentence rendered is compared VERBATIM against
 *      the plane's answer, and §2 additionally proves `app.html` holds no copy of any of them to
 *      have agreed with.
 *  (2) A BLOCK THAT RENDERED SOMEWHERE ELSE — §1 pins it POSITIONALLY: after the list it stands
 *      beside and before the next section's heading.
 *  (3) THE TWO KEYS COMPOSED — the member's list and the proposals name DIFFERENT citations here on
 *      purpose, and §1 asserts the list renders exactly the member's and the proposals exactly
 *      theirs. A page that merged them, or that let a proposal fill an undetermined list, moves.
 *  (4) AN EMPTY SET PRINTED BARE — §2 drives an action with no proposal at all and an action with a
 *      proposal but NO list, which are the two shapes where a surface is tempted to answer for the
 *      record.
 *  (5) A CONTROL THAT SETS THE LIST FROM A PROPOSAL — §3 is the row's own accepts-when, driven
 *      structurally over the rendered block AND behaviourally through the act it would have to use:
 *      the governing-laws form opens EMPTY with two proposals standing.
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - The DOM is a stub, the reach every civicos-ui suite has: no browser fires a handler, so §3's
 *    no-control arms read the rendered MARKUP for a control rather than clicking one. That is the
 *    right instrument for this property — a control that cannot be seen in the markup cannot be
 *    clicked either — but it means a control introduced by script AFTER render would be invisible
 *    to it. §3's last arm is the behavioural half that a markup sweep cannot give: the act's form is
 *    driven with proposals standing and its rows are read.
 *  - It says nothing about CSS. A block rendered and then hidden by a stylesheet would read as
 *    rendered here.
 *  - `truncated` is NOT driven: `LAW_PROPOSALS_READ_MAX` proposals need that many distinct
 *    credentials, and this suite has three. The cut line is rendered from the plane's own `limit`
 *    and `truncated` and is unexercised — stated rather than left to be assumed.
 *
 * NEGATIVE CONTROL: the row's arm — *add a "use this" control and the no-setter arm fails by name* —
 * is armed in `ui102-laws-proposals.control.mjs` with two more; results on the line below.
 * NEGATIVE CONTROL RESULT 2026-09-24 (UI-102 worker), `node civicos-ui/test/ui102-laws-proposals.control.mjs`,
 * five arms, each armed ALONE on the EXTRACTED script (`app.html` never edited, nothing to restore), each
 * splice asserted to match EXACTLY ONCE. EVERY ARM AS DECLARED:
 *   baseline     exit 0 · 38 pass / 0 fail.
 *   usethis      exit 1 · 34/4 — THE ROW'S CONTROL, by name: "the proposals block carries NO CONTROL of any
 *                kind" and "...names no function a control could call", each for BOTH shapes that have a
 *                proposal. The pair for "(no proposals)" stayed GREEN and COULD NOT have failed — the empty
 *                block returns before the card loop — and is kept beside the pair that catches this rather
 *                than reworded to overlap it. §1, §2, the two wire arms and "THE ACT OPENS EMPTY" stayed
 *                green, all as declared: no browser clicks a button here, which is why the markup sweep and
 *                not the behavioural arm is this property's instrument.
 *   pageauthored exit 1 · 36/2 — "renders the PLANE's statement about the empty set, verbatim" and "...never
 *                a bare empty list or a sentence of the page's own about it", as declared.
 *   compose      exit 1 · 35/3 — "THE SHARP CASE …", "...does not stand in for the list" and "...the
 *                undetermined sentence is UNCHANGED", as declared; §1 and §3 green.
 *   spelling     exit 0 · 38/0 — THE OVER-STRICTNESS ARM passed FIRST TIME: single-quoted attributes, new
 *                class names, the block's sentence first, citation before level and the date in a `<time>`
 *                element are all read correctly. Worth stating because UI-90's equivalent arm did NOT — it
 *                found seven matchers in `action-page.test.mjs` that could only see double quotes. This
 *                file's arms read the plane's own strings rather than the page's markup shapes, which is
 *                why: the three that DO read markup are §3's, and they search for what must be ABSENT.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";
/* THE TIE (UI-24): the catalogue's OWN label, imported. §1 asks whether the sentence a member reads
   is the one `lawProposalLabel` composes — the single place the plane composes it — rather than a
   second sentence that agrees with it for free. */
import { LAW_PROPOSAL_STATES, lawProposalLabel } from "../../bio-plane/checks/bio-checks.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("ui102-laws-proposals: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const APP = process.env.UI102_APP_SRC || null;   /* the control harness hands a mutated app script through this */
const NOW = "2026-09-24T00:00:00Z";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui102", MEMBER_TOKEN: "mem-ui102", PROBE_TOKEN: "prb-ui102", VERSION: "test",
              BIO_NOW_MS: String(Date.parse(NOW)) },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();

try {
/* ============================================================ 0. THE GROUND: A REAL PLANE */
console.log("--- 0. the ground: three actions, one member's list, two proposals ---");
const enrol = async (memberId, role) => {
  const add = rP(await POST("op=memberadd&token=adm-ui102",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: ["contribute"] }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const NADIA = await enrol("nadia", "admin");
await enrol("omar", "admin");                      /* ADMINS_FIRST: the second member is an administrator */
const PILAR = await enrol("pilar", "member");

const actionMd = (id, title) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "${title}"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "action_kind: other", "risk_tier: 1",
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "", "## Plan", "", "Ask for the transfer ledger.", "",
  "## Status", "", "## Correspondence", "",
  "## Session Log", "", `### Session ${NOW} | Formation | nadia`,
  "Trigger: intake", "Changes: created.", "", "## Review Notes", ""].join("\n");

let snapKeySeq = 0;
const promote = async (id, title) => rP(await POST(`op=promote&token=${NADIA}`, {
  bundleId: id, base: null, snapKey: `${id}-new-${String(++snapKeySeq).padStart(4, "0")}`,
  files: [{ path: "bundle.md", text: actionMd(id, title), bytes: Buffer.byteLength(actionMd(id, title)),
            sha256: sha(actionMd(id, title)) }],
  register: [],
  meta: { object_type: "action", group: "believe-in-oakland", title, current_state: "planned",
          created: NOW, last_updated: NOW },
}));

const ACT   = "ACTN-2026-1102-oakland-request";      /* a stated list AND two proposals */
const BARE  = "ACTN-2026-1103-nothing-proposed";     /* no list, no proposal */
const UNDET = "ACTN-2026-1104-proposed-not-stated";  /* a proposal standing, the list UNDETERMINED */

/* THE CITATIONS ARE DELIBERATELY DISJOINT ACROSS THE THREE SETS, so a page that composed the two keys
   — or that let a proposal stand in for the list — cannot read as correct by coincidence. */
const STATED   = [{ level: "state", citation: "Cal. Gov. Code § 7920.000 et seq. (California Public Records Act)" }];
const MACHINES = [{ level: "local", citation: "Oakland Municipal Code ch. 2.20 (Sunshine Ordinance)" }];
const MEMBERS  = [{ level: "federal", citation: "5 U.S.C. § 552 (FOIA)" }];

ok("the fixtures land through op=promote (the corpus is non-empty before anything is asked of it)",
   [(await promote(ACT, "Records request"))?.ok, (await promote(BARE, "Nothing proposed"))?.ok,
    (await promote(UNDET, "Proposed, not stated"))?.ok].every((x) => x === true));

const stated = rP(await POST(`op=actionlaws&token=${NADIA}&target=${encodeURIComponent(ACT)}`, { laws: STATED }));
ok("a MEMBER states the list on the first action, through the act that states it", stated?.ok === true,
   JSON.stringify(stated).slice(0, 300));
/* A RAW TOKEN IS A MACHINE CREDENTIAL: the control plane stamps `class:member` for it, which
   `isMachineIdentity` reads as machine work. A session token stamps the signed-in member's own id. */
const byMachine = rP(await POST(`op=actionlawspropose&token=mem-ui102&target=${encodeURIComponent(ACT)}`, { laws: MACHINES }));
const byMember  = rP(await POST(`op=actionlawspropose&token=${PILAR}&target=${encodeURIComponent(ACT)}`, { laws: MEMBERS }));
const onUndet   = rP(await POST(`op=actionlawspropose&token=mem-ui102&target=${encodeURIComponent(UNDET)}`, { laws: MACHINES }));
ok("two proposals land on the first action — one machine work, one a member's — and one on the third",
   [byMachine?.ok, byMachine?.proposal?.machine_work, byMember?.ok, byMember?.proposal?.machine_work, onUndet?.ok]
     .join(",") === "true,true,true,false,true",
   JSON.stringify([byMachine?.proposal, byMember?.proposal]).slice(0, 400));

const actionOf = async (id) => rP(await GET(`op=projection&token=${PILAR}&id=${encodeURIComponent(id)}`))?.action ?? null;
const DER = { [ACT]: await actionOf(ACT), [BARE]: await actionOf(BARE), [UNDET]: await actionOf(UNDET) };
ok("and the PLANE's own read carries them beside the list, which is what this surface consumes",
   DER[ACT]?.governing_laws?.state === "stated"
   && DER[ACT]?.governing_laws_proposals?.proposals?.length === 2
   && DER[BARE]?.governing_laws_proposals?.proposals?.length === 0
   && DER[UNDET]?.governing_laws?.state === "undetermined"
   && DER[UNDET]?.governing_laws_proposals?.proposals?.length === 1,
   JSON.stringify(Object.fromEntries(Object.entries(DER).map(([k, v]) =>
     [k, [v?.governing_laws?.state, v?.governing_laws_proposals?.proposals?.length]]))));

/* ============================================================ THE SURFACE, ITS FETCH BRIDGED TO THAT PLANE */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, hidden:false, checked:false, options:[],
    addEventListener(){}, querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){},
    click(){}, remove(){}, onclick:null, onchange:null, setAttribute(){}, getAttribute(){ return null; } };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  Object.defineProperty(e, "outerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if (!els.has(s)) els.set(s, el()); return els.get(s); };
const WIRE = [];
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){}, replaceState(){} },
  localStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  sessionStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  window:{ addEventListener(){}, open:()=>null },
  fetch: async (u, opts) => {
    const url = new URL(u, "http://x");
    let body = null; try { body = opts && opts.body ? JSON.parse(opts.body) : null; } catch (_) {}
    WIRE.push({ op: url.searchParams.get("op"), body });
    return mf.dispatchFetch(url.toString(), opts);
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext((APP ? fs.readFileSync(APP, "utf8") : appScript()) + ";globalThis.__U = {" + [
  "PLANE", "openAction", "openActionLaws", "actionLawsHtml", "actionLawsProposalsHtml", "loadActSource",
].join(",") + ", LAWS: () => ACTION.laws, CACHES: () => { IMG_CACHE.clear(); PROJ_CACHE.clear(); } };", ctx);
const U = ctx.__U;
U.PLANE.base = "http://x"; U.PLANE.token = PILAR; U.PLANE.session = true; U.PLANE.preview = false;
U.PLANE.me = { member: "pilar", handle: "pilar", session: true, administer: false, capabilities: ["contribute"] };
await U.loadActSource(true);

const page = () => $$("#content")._html || "";
const dialog = () => { const d = els.get("#dlg"); return (d && d._html) || (els.get("#dlgbody") || { _html:"" })._html || ""; };
const openFresh = async (id) => { U.CACHES(); await U.openAction(id); return page(); };
const LAWS_HEAD = `<h2 class="sec">The laws this ask is made under</h2>`;
const CLOCK_HEAD = `<h2 class="sec">The clock</h2>`;

/* ============================================================ 1. THE PROPOSALS RENDER, BESIDE THE LIST */
console.log("\n--- 1. an action with a stated list and two proposals ---");
const p1 = await openFresh(ACT);
const block1 = U.actionLawsProposalsHtml(DER[ACT]);
const list1 = U.actionLawsHtml(DER[ACT]);
ok("the page opened against the real plane and reached the governing-laws section",
   p1.includes(LAWS_HEAD) && p1.includes(CLOCK_HEAD), p1.slice(0, 200));
ok("THE ITEM: the action page RENDERS the proposals block", !!block1 && p1.includes(block1), block1.slice(0, 300));
ok("...BESIDE the list: inside the same section, after the list it stands beside and before the next heading",
   p1.indexOf(LAWS_HEAD) < p1.indexOf(list1) && p1.indexOf(list1) < p1.indexOf(block1)
   && p1.indexOf(block1) < p1.indexOf(CLOCK_HEAD),
   JSON.stringify([p1.indexOf(LAWS_HEAD), p1.indexOf(list1), p1.indexOf(block1), p1.indexOf(CLOCK_HEAD)]));

for (const pr of DER[ACT].governing_laws_proposals.proposals) {
  ok(`each proposal is rendered under THE PLANE'S OWN SENTENCE, verbatim (${pr.state})`,
     block1.includes(pr.says), pr.says);
  ok(`...attributed to the credential the plane stamped, and dated (${pr.by})`,
     block1.includes(pr.by) && block1.includes(String(pr.at).slice(0, 10)));
  for (const l of pr.laws)
    ok(`...with its citation at its level, as proposed (${l.level})`,
       block1.includes(l.citation) && block1.includes(l.level));
}
ok("the block's OWN sentence — what it holds and how much of it is machine work — is rendered verbatim too",
   block1.includes(DER[ACT].governing_laws_proposals.says), DER[ACT].governing_laws_proposals.says);
ok("the machine's proposal is READ AS MACHINE WORK, in the catalogue's one composition of that sentence",
   block1.includes(LAW_PROPOSAL_STATES.machine_proposed)
   && block1.includes(lawProposalLabel("class:member").says));
ok("and the member's is NOT — a second, different published sentence, so the two are distinguishable on the page",
   block1.includes(LAW_PROPOSAL_STATES.member_proposed)
   && LAW_PROPOSAL_STATES.member_proposed !== LAW_PROPOSAL_STATES.machine_proposed);

/* (3) THE TWO KEYS ARE NEVER COMPOSED. */
ok("THE LIST IS STILL THE MEMBER'S: the list renders exactly the citation a member stated",
   list1.includes(STATED[0].citation) && !list1.includes(MACHINES[0].citation) && !list1.includes(MEMBERS[0].citation),
   list1);
ok("...and the proposed citations appear ONLY inside the proposals block, never in the list",
   block1.includes(MACHINES[0].citation) && block1.includes(MEMBERS[0].citation)
   && !block1.includes(STATED[0].citation));
ok("nothing on the page relates a proposal to the list — no adopted, accepted, used or applied, and no arrow between them",
   !/\b(adopted|accepted this proposal|used this proposal|applied this proposal|became the list|from this proposal)\b/i.test(p1),
   (/\b(adopted|accepted this proposal|used this proposal|applied this proposal|became the list|from this proposal)\b/i.exec(p1) || [""])[0]);

/* ============================================================ 2. THE SURFACE HOLDS NO SENTENCE OF ITS OWN */
console.log("\n--- 2. the empty set, the undetermined list, and where the words come from ---");
const APP_SRC = APP ? fs.readFileSync(APP, "utf8") : appScript();
const SENTENCES = [...Object.values(LAW_PROPOSAL_STATES), DER[ACT].governing_laws_proposals.says,
                   DER[BARE].governing_laws_proposals.says];
ok("STRUCTURAL: the surface holds NO COPY of any of these sentences — it could not have agreed with the plane for free",
   SENTENCES.every((s) => !APP_SRC.includes(s.slice(0, 60))),
   SENTENCES.filter((s) => APP_SRC.includes(s.slice(0, 60))).join(" | "));

const p2 = await openFresh(BARE);
const block2 = U.actionLawsProposalsHtml(DER[BARE]);
ok("an action nobody has proposed anything for renders the PLANE's statement about the empty set, verbatim",
   p2.includes(block2) && block2.includes(DER[BARE].governing_laws_proposals.says),
   DER[BARE].governing_laws_proposals.says);
ok("...and never a bare empty list or a sentence of the page's own about it",
   !/no (?:governing )?laws (?:have been )?(?:been )?proposed/i.test(block2)
   && !/nothing (?:has been|was) proposed/i.test(block2)
   && !/none (?:have been )?proposed/i.test(block2), block2);

const p3 = await openFresh(UNDET);
const block3 = U.actionLawsProposalsHtml(DER[UNDET]);
const list3 = U.actionLawsHtml(DER[UNDET]);
ok("THE SHARP CASE: a proposal stands and the list is UNDETERMINED — the plane's undetermined sentence still renders",
   p3.includes(list3) && list3.includes(DER[UNDET].governing_laws.stated), list3);
ok("...the proposal renders beside it, under its own label, and does not stand in for the list",
   p3.includes(block3) && block3.includes(MACHINES[0].citation)
   && p3.indexOf(list3) < p3.indexOf(block3) && !list3.includes(MACHINES[0].citation));
ok("...and the undetermined sentence is UNCHANGED by the proposal's existence — byte-for-byte the plane's",
   list3.includes(DER[UNDET].governing_laws.stated) && DER[UNDET].governing_laws.state === "undetermined");

/* AN ABSENT BLOCK IS A THIRD ANSWER. A plane predating REC-195 answers with no key at all. */
const absent = U.actionLawsProposalsHtml({ ...DER[BARE], governing_laws_proposals: undefined });
ok("a plane that answers with NO proposals key at all is said as an absence, not as an empty set",
   /did not answer/.test(absent) && absent !== block2, absent);

/* ============================================================ 3. NO CONTROL SETS THE LIST FROM A PROPOSAL */
console.log("\n--- 3. THE ROW'S ACCEPTS-WHEN: nothing here offers a proposal as a way of setting the list ---");
for (const [name, b] of [["a stated list and two proposals", block1], ["no proposals", block2],
                         ["an undetermined list and one proposal", block3]]) {
  ok(`THE ITEM: the proposals block carries NO CONTROL of any kind (${name})`,
     !/<button|<a\s|<select|<input|<textarea|onclick=|onchange=|oninput=|href=/i.test(b),
     (/<button[^>]*>|<a\s[^>]*>|onclick="[^"]*"/i.exec(b) || [""])[0]);
  ok(`...and it names no function a control could call (${name})`,
     !/actionLaws|openAction|doAction|actAsk|intentAsk|rec\(|recPost/.test(b),
     (/actionLaws\w*|openAction\w*|doAction\w*/.exec(b) || [""])[0]);
}
ok("no `op=actionlawspropose` was sent by the surface at any point: the page reads proposals and makes none",
   !WIRE.some((w) => w.op === "actionlawspropose"), JSON.stringify(WIRE.map((w) => w.op)));
ok("and rendering the page states no laws either — no `op=actionlaws` went over the wire",
   !WIRE.some((w) => w.op === "actionlaws"));

/* THE BEHAVIOURAL HALF a markup sweep cannot give: the act that CAN set the list, opened with two
   proposals standing against this very action. */
await openFresh(ACT);
await U.openActionLaws(ACT, "Records request", { id:"actionlaws", label:"State governing laws", prompt:null });
const L = U.LAWS();
const dlg = dialog();
ok("THE ACT OPENS EMPTY with two proposals standing: every row is unchosen and unwritten",
   Array.isArray(L?.rows) && L.rows.length === 1 && L.rows[0].level === "" && L.rows[0].citation === "",
   JSON.stringify(L?.rows));
ok("...and the form carries NEITHER proposed citation, in any field",
   !dlg.includes(MACHINES[0].citation) && !dlg.includes(MEMBERS[0].citation), dlg.slice(0, 400));
ok("...and not the member's own standing list either — the act states a list, it does not edit one",
   !dlg.includes(STATED[0].citation));
ok("the record is UNMOVED by any of this: the list is still the one citation the member stated",
   JSON.stringify((await actionOf(ACT))?.governing_laws?.laws) === JSON.stringify(STATED),
   JSON.stringify((await actionOf(ACT))?.governing_laws?.laws));

} finally {
  await mf.dispose();
}
console.log(`\nui102-laws-proposals: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
