/* D-134 — §4.9's CUSTODIAL ACTS, PERFORMED FROM AN ADMINISTRATOR'S OWN SESSION.
 *
 * `memberadd`, `memberset`, `signeradd` and `signerset` had ZERO call sites in app.html: an
 * administrator's governance WRITE surface was absent while its read surface was present. REC-159 gave
 * the four ops both session sets (`CUSTODIAL_ACTIONS`) and the store asks the ROSTER; this suite drives
 * the surface built over them, through the app's own functions, against the REAL plane (miniflare over
 * bio-plane/src/index.mjs — not a live instance, and a green harness is not a serving build, D-108).
 *
 * WHAT IT PROVES (the row's accepts-when):
 *   1. THE FOUNDER'S session and an ENROLLED ADMINISTRATOR'S session each perform all four through the
 *      surface's dialogs, and the record names THAT session as the actor: `status_by` on the member row
 *      (memberset) and on the key row (signeradd, signerset), and — for memberadd — `invited_by` on every
 *      path (BOB #35, 2026-09-25) plus the proposer's own endorsement on a §4.7 proposal (`have`).
 *   2. A MEMBER'S session renders NONE of the four, read from the rendered markup (the liar the row names
 *      renders every act and lets the plane refuse, so the member arm reads the DOM, not the plane), and
 *      the entry point does nothing for it.
 *   3. EVERY refusal the surface can receive arrives with its canned DEC-49 translation — compared against
 *      the IMPORTED catalogue row, never a hand copy — and is what the dialog renders.
 *
 * CORRECTED 2026-09-25, in this item: this paragraph said an ordinary invitation recorded no inviter and
 * pinned it as UNDETERMINED. BOB #35 ruled (b) — `members.invited_by`, written by memberadd on every path —
 * and it landed in this same item, so the arm now asserts the inviter and a null renders `not recorded`.
 *
 * WHAT IT CANNOT SEE: a live plane; the browser's real DOM (a stub records innerHTML); NOT_AN_ADMIN
 * reaching THE SURFACE — the controls exist only for a session `op=whoami` says administers, so the
 * surface meets it only across a race (a position lost after the page read whoami). It is driven here
 * AT THE OP from a member's session, and its rendering through `actRefusalHtml` is asserted.
 *
 * NEGATIVE CONTROL: (declared and run 2026-09-25 on branch land/worker/D-134, figures below)
 *   (a) BASELINE — nothing armed. MUST be green.
 *   (b) THE ROW'S NAMED ARM — `custodian()` made to answer true for every session (`return true;`), so the
 *       four render for a member. MUST FAIL naming the MEMBER arm's render assertions; MUST NOT move the
 *       founder's or the administrator's arms.
 *   (c) ONE ACT'S CALL DROPPED — `r = await actAskPost("signerset", body);` deleted from doCustodialAct.
 *       MUST FAIL naming the two `signerset` arms (founder, administrator) by name; MUST NOT move the
 *       other three acts' arms.
 *   (d) OVER-STRICTNESS — `custodian()` rewritten in a different correct spelling. MUST PASS.
 *   Each arm restored by cp from a per-arm pristine copy, verified by sha256 AND cmp.
 *   CONTROL RUN 2026-09-25 (the suite's own prints, at 44 assertions): (a) 44/44 · (b) 36/44, the eight MEMBER arms
 *   by name, founder and administrator arms green · (c) 41/44: FOUNDER signerset, ADMINISTRATOR signerset AND
 *   REFUSAL SIGNER_MEMBER_NOT_ACTIVE. The third was NOT declared; it reaches the plane through signerset, so it
 *   depends on the dropped call too. Recorded against the declaration, not smoothed. · (d) 44/44. app.html restored
 *   to sha256 b80829d8… (1,628,712 B) after each arm, cmp-identical. Full table: measurements/M-171.md.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a suite's own exit must not discard its own output */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { createRequire } from "module"; import { pathToFileURL } from "url";
import { appScript } from "./extract.mjs";
import { CUSTODIAL_CHECKS, MEMBER_ID_CHECKS, SIGNER_ENROLMENT_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } else console.log("  PASS", msg.split("\n")[0].slice(0, 160)); }

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("custodial-acts: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/. " + String(e && e.message || e));
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const ADM = "adm-d134", MEM = "mem-d134", PRB = "prb-d134";
function plane(){
  return new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
    script: fs.readFileSync(IDX, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test" },
  });
}
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const wire = (mf) => ({
  post: async (op, body, tok) => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}${tok ? "&token=" + tok : ""}`, { method:"POST", body: JSON.stringify(body || {}) })).json()),
  get: async (op, tok, q = "") => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}${tok ? "&token=" + tok : ""}${q}`)).json()),
});

/* ---- ONE LOADED APP per session: a fresh DOM stub, a fresh script context, a bridge recording what was SENT. */
const text = (h) => String(h||"").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
function loadApp(mf){
  const els = new Map();
  function el(){
    const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
      value:"", _html:"", textContent:"", scrollTop:0, disabled:false, checked:false, addEventListener(){},
      querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
      remove(){}, onclick:null, onchange:null, setAttribute(){}, getAttribute(){ return null; } };
    Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
    return e;
  }
  const $$ = (s) => { if(!els.has(s)) els.set(s, el()); return els.get(s); };
  const SENT = [];
  async function bridge(u, opts){
    const url = new URL(u, "http://x");
    SENT.push({ op: url.searchParams.get("op"), params: Object.fromEntries(url.searchParams.entries()),
                body: opts && opts.body ? JSON.parse(opts.body) : null });
    return mf.dispatchFetch(url.toString(), opts);
  }
  const ctx = { console:{ log(){}, warn(){}, error(){}, info(){} }, URL, URLSearchParams, JSON, Array, Object, String,
    Number, Math, Date, RegExp, Promise, Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder,
    crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){},
    setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
    document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
      documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
      createElement:()=>el(), body:{appendChild(){}} },
    location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){}, replaceState(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:bridge };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(appScript() + ";globalThis.__U = {PLANE, recR, renderMembers, openCustodialAct, doCustodialAct,"
    + " custodialChoose, custodian, actRefusalHtml, memberInviterHtml };", ctx);
  const html = (s) => { const e = els.get(s); return e ? String(e._html || "") : ""; };
  const fill = (s, props) => Object.assign($$(s), props);
  return { U: ctx.__U, SENT, html, fill, els };
}
async function signIn(mf, token){
  const A = loadApp(mf);
  A.U.PLANE.token = token; A.U.PLANE.session = true;
  A.U.PLANE.me = await A.U.recR("whoami");
  return A;
}
/* One act, THROUGH THE SURFACE: the dialog opened by the app's own entry point, its fields filled as a
   person would, the commit pressed. Answers what doCustodialAct returned and the op(s) it SENT. */
async function perform(A, act, subject, to, fields){
  /* A real dialog renders FRESH inputs every time it opens; the stub keeps an element per selector, so the
     dialog's own fields are dropped first or one act's ticked box would ride into the next. */
  for(const k of [...A.els.keys()]) if(k.startsWith("#ca-")) A.els.delete(k);
  A.U.openCustodialAct(act, subject, to);
  /* A tick or a radio is a CHOICE: it reaches the act through the handler the markup binds, as a click would. */
  for(const [sel, props] of Object.entries(fields || {})){
    if(sel === "#ca-role-admin" || sel === "#ca-role-member"){ if(props.checked) A.U.custodialChoose("role", sel.slice(9)); continue; }
    if(sel.startsWith("#ca-cap-")){ A.U.custodialChoose("cap", sel.slice(8), !!props.checked); continue; }
    A.fill(sel, props);
  }
  const before = A.SENT.length;
  const out = await A.U.doCustodialAct();
  return { out, sent: A.SENT.slice(before).map(s => s.op), err: A.html("#ca-err"), dlg: A.html("#dlg") };
}
const KEY = (tag) => "AAAAC3NzaC1lZDI1NTE5AAAAI" + Buffer.from(`d134-${tag}-`.padEnd(30, "k")).toString("base64").replace(/=+$/, "");
const FOUR = ["memberadd", "memberset", "signeradd", "signerset"];

let exitCode = 1;
const planes = [];
try {
/* ============================================================
   0. THE PLANE: a claimed founder, an enrolled second administrator, an enrolled member.
   ============================================================ */
const mf = plane(); planes.push(mf);
const W = wire(mf);
const claimed = await W.post("claim", { bootstrapToken: ADM, password: "founder-passphrase-d134" });
if(!claimed || !claimed.ok) throw new Error(`claim: ${JSON.stringify(claimed)}`);
const fl = await W.post("login", { password: "founder-passphrase-d134" });
if(!fl || !fl.token) throw new Error(`founder login: ${JSON.stringify(fl)}`);
const FOUNDER = fl.token;
const enrol = async (invite, id) => {
  const en = await W.post("enroll", { invite, handle: id, password: `${id}-passphrase-d134` });
  if(!en || !en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await W.post("login", { role: `member:${id}`, password: `${id}-passphrase-d134` });
  if(!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* A deactivation ends a member's live sessions (memberSet deletes them), so a member reactivated signs in again. */
const login = async (id) => {
  const lg = await W.post("login", { role: `member:${id}`, password: `${id}-passphrase-d134` });
  if(!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const roster = async () => ((await W.get("memberlist", FOUNDER)) || {}).members || [];
const keys = async () => ((await W.get("signerlist", FOUNDER)) || {}).signers || [];
const row = async (id) => (await roster()).find(m => m.member_id === id) || null;
const keyRow = async (k) => (await keys()).find(s => s.key_b64 === k) || null;

/* ============================================================
   1. THE FOUNDER'S SESSION performs all four
   ============================================================ */
console.log("\n--- 1. the founder's session: all four, through the surface ---");
const F = await signIn(mf, FOUNDER);
ok(`FOUNDER: op=whoami says this session administers (${JSON.stringify({ session: F.U.PLANE.me.session, administer: F.U.PLANE.me.administer })})`,
   F.U.PLANE.me.session === true && F.U.PLANE.me.administer === true && F.U.custodian() === true);
await F.U.renderMembers();
{
  const all = F.html("#content") + F.html("#mm") + F.html("#mm-keys");
  ok("FOUNDER RENDER: the roster screen carries the invite and key-registration controls",
     /data-act="memberadd"/.test(all) && /data-act="signeradd"/.test(all));
}
/* memberadd — the second administrator, which the first may add alone (4.2). */
{
  const r = await perform(F, "memberadd", null, null, {
    "#ca-id": { value: "ruth" }, "#ca-cover": { value: "the CPA from Tuesday" }, "#ca-role-admin": { checked: true } });
  ok(`FOUNDER memberadd: the surface sent op=memberadd and nothing else (${r.sent})`, r.sent.join() === "memberadd");
  ok(`FOUNDER memberadd: the plane issued an invitation (${JSON.stringify(r.out && { role: r.out.role })})`,
     r.out && typeof r.out.invite === "string" && r.out.role === "admin");
  ok("FOUNDER memberadd: the receipt carries the one-time link to the enrolment page",
     r.dlg.includes(`/#invite=${encodeURIComponent(r.out.invite)}`) && /works once/.test(r.dlg));
  ok("FOUNDER memberadd: the body the surface sent names nobody as the actor — `by` is the plane's stamp",
     !("by" in (F.SENT.find(s => s.op === "memberadd").body || {})) && !("by" in F.SENT.find(s => s.op === "memberadd").params));
  const ruthRow = await row("ruth");
  /* BOB #35 (2026-09-25): who INVITED is its own fact, `members.invited_by`, written on every memberadd path. */
  ok(`FOUNDER memberadd: the record names the founder as ruth's inviter (invited_by '${ruthRow && ruthRow.invited_by}', answer '${r.out && r.out.invited_by}')`,
     ruthRow && ruthRow.invited_by === "admin" && r.out.invited_by === "admin");
  var RUTH = await enrol(r.out.invite, "ruth");
}
/* memberadd — a proposal beyond the second: the record names its proposer's own endorsement (§4.7). */
{
  const r = await perform(F, "memberadd", null, null, {
    "#ca-id": { value: "sam" }, "#ca-cover": { value: "the treasurer" }, "#ca-role-admin": { checked: true } });
  const f = r.out && r.out.refusal;
  ok(`FOUNDER memberadd (proposal): recorded and attributed to the founder — have ${JSON.stringify(f && f.have)}, awaiting ${JSON.stringify(f && f.awaiting)}`,
     f && f.reason === "CONSENSUS_REQUIRED" && f.proposed === true
     && JSON.stringify(f.have) === JSON.stringify(["admin"]) && JSON.stringify(f.awaiting) === JSON.stringify(["ruth"]));
  ok("FOUNDER memberadd (proposal): the dialog renders the canned translation and who it waits on",
     r.err.includes(CUSTODIAL_CHECKS.CONSENSUS_REQUIRED.translation.slice(0, 60).replace(/’/g, "’")) && /Waiting on/.test(r.err) && r.err.includes("ruth"));
}
/* An ordinary member, invited by the founder now that two administrators exist, then enrolled. */
let OLIVE;
{
  const r = await perform(F, "memberadd", null, null, {
    "#ca-id": { value: "olive" }, "#ca-cover": { value: "the neighbour" }, "#ca-role-member": { checked: true },
    "#ca-cap-contribute": { checked: true } });
  ok(`FOUNDER memberadd (member): invitation issued with exactly the capability chosen (${JSON.stringify(r.out && r.out.capabilities)})`,
     r.out && r.out.invite && r.out.role === "member" && JSON.stringify(r.out.capabilities) === JSON.stringify(["contribute"]));
  OLIVE = await enrol(r.out.invite, "olive");
}
/* memberset — deactivate olive. */
{
  await F.U.renderMembers();
  ok("FOUNDER RENDER: each roster row carries its standing act", /data-act="memberset"/.test(F.html("#mm")));
  const r = await perform(F, "memberset", "olive", "revoked");
  const o = await row("olive");
  ok(`FOUNDER memberset: sent op=memberset (${r.sent}) and olive reads revoked, set by '${o && o.status_by}'`,
     r.sent.join() === "memberset" && o && o.status === "revoked" && o.status_by === "admin");
  ok("FOUNDER memberset: the receipt names who the record says set it", /recorded as set by/.test(r.dlg) && r.dlg.includes("admin"));
}
/* signeradd — a key for ruth, pasted as the whole key line. */
const K1 = KEY("ruth-1"), K2 = KEY("ruth-2");
{
  const r = await perform(F, "signeradd", null, null, {
    "#ca-who": { value: "ruth" }, "#ca-key": { value: `ssh-ed25519 ${K1} ruth@laptop` } });
  const k = await keyRow(K1);
  ok(`FOUNDER signeradd: sent op=signeradd (${r.sent}); the key is registered to ruth, set by '${k && k.status_by}', labelled '${k && k.comment}'`,
     r.sent.join() === "signeradd" && k && k.member_id === "ruth" && k.status === "active" && k.status_by === "admin"
     && k.comment === "ruth@laptop");
}
/* signerset — revoke it. */
{
  await F.U.renderMembers();
  ok("FOUNDER RENDER: each key row carries its standing act", /data-act="signerset"/.test(F.html("#mm-keys")));
  const r = await perform(F, "signerset", K1, "revoked");
  const k = await keyRow(K1);
  ok(`FOUNDER signerset: sent op=signerset (${r.sent}); the key reads revoked, set by '${k && k.status_by}'`,
     r.sent.join() === "signerset" && k && k.status === "revoked" && k.status_by === "admin");
}

/* ============================================================
   2. AN ENROLLED ADMINISTRATOR'S SESSION performs all four
   ============================================================ */
console.log("\n--- 2. an enrolled administrator's session (member:ruth): all four ---");
const R = await signIn(mf, RUTH);
ok(`ADMINISTRATOR: op=whoami says member:ruth's session administers (${JSON.stringify({ member: R.U.PLANE.me.member, administer: R.U.PLANE.me.administer })})`,
   R.U.PLANE.me.member === "ruth" && R.U.PLANE.me.administer === true && R.U.custodian() === true);
{
  const r = await perform(R, "memberadd", null, null, {
    "#ca-id": { value: "tess" }, "#ca-cover": { value: "the archivist" }, "#ca-role-admin": { checked: true } });
  const f = r.out && r.out.refusal;
  ok(`ADMINISTRATOR memberadd (proposal): recorded and attributed to ruth — have ${JSON.stringify(f && f.have)}`,
     r.sent.join() === "memberadd" && f && f.proposed === true && f.reason === "CONSENSUS_REQUIRED"
     && JSON.stringify(f.have) === JSON.stringify(["ruth"]));
  const r2 = await perform(R, "memberadd", null, null, {
    "#ca-id": { value: "uma" }, "#ca-cover": { value: "the organiser" }, "#ca-role-member": { checked: true } });
  ok(`ADMINISTRATOR memberadd (member): an invitation issued from ruth's own session (${JSON.stringify(r2.out && { role: r2.out.role })})`,
     r2.out && typeof r2.out.invite === "string" && r2.out.role === "member");
  const uma = await row("uma"), tess = await row("tess");
  ok(`ADMINISTRATOR memberadd: the record names ruth as the inviter on both paths (uma '${uma && uma.invited_by}', proposal tess '${tess && tess.invited_by}')`,
     uma && uma.invited_by === "ruth" && tess && tess.invited_by === "ruth");
  await R.U.renderMembers();
  ok("ADMINISTRATOR RENDER: the roster says who invited a member, in the record's words",
     /invited by ruth/.test(R.html("#mm")) && /invited by admin/.test(R.html("#mm")));
}
{
  const r = await perform(R, "memberset", "olive", "active");
  const o = await row("olive");
  ok(`ADMINISTRATOR memberset: sent op=memberset (${r.sent}); olive reads active again, set by '${o && o.status_by}'`,
     r.sent.join() === "memberset" && o && o.status === "active" && o.status_by === "ruth");
}
{
  const r = await perform(R, "signeradd", null, null, { "#ca-who": { value: "olive" }, "#ca-key": { value: K2 },
    "#ca-comment": { value: "olive's key" } });
  const k = await keyRow(K2);
  ok(`ADMINISTRATOR signeradd: sent op=signeradd (${r.sent}); the key is olive's, set by '${k && k.status_by}'`,
     r.sent.join() === "signeradd" && k && k.member_id === "olive" && k.status_by === "ruth");
}
{
  const r = await perform(R, "signerset", K1, "active");
  const k = await keyRow(K1);
  ok(`ADMINISTRATOR signerset: sent op=signerset (${r.sent}); ruth's first key reads active, set by '${k && k.status_by}'`,
     r.sent.join() === "signerset" && k && k.status === "active" && k.status_by === "ruth");
}

/* ============================================================
   3. A MEMBER'S SESSION renders none of the four — read from the DOM
   ============================================================ */
console.log("\n--- 3. a member's session (member:olive): none of the four, read from the markup ---");
{
  OLIVE = await login("olive");   /* her first session ended with her deactivation in section 1 */
  const M = await signIn(mf, OLIVE);
  ok(`MEMBER: op=whoami says member:olive does not administer (${JSON.stringify({ member: M.U.PLANE.me.member, administer: M.U.PLANE.me.administer })})`,
     M.U.PLANE.me.member === "olive" && M.U.PLANE.me.administer === false);
  await M.U.renderMembers();
  const markup = [...M.els.entries()].map(([, e]) => String(e._html || "")).join("\n");
  ok("MEMBER: the roster itself rendered (so the absence below is not a blank screen)",
     /olive/.test(M.html("#mm")) && /ruth/.test(M.html("#mm")));
  for(const act of FOUR)
    ok(`MEMBER RENDERS NO ${act}: no control for it anywhere in the rendered markup`,
       !markup.includes(`data-act="${act}"`) && !new RegExp(`openCustodialAct\\('${act}'`).test(markup));
  ok("MEMBER RENDERS NO custodial entry point at all (no bar, no key table, no act column)",
     !/data-custodial=|openCustodialAct|mm-keys|Invite a member|Register a signing key/.test(markup));
  ok("MEMBER: the screen still says it only shows, which is true for this session",
     /This screen only SHOWS/.test(M.html("#content")));
  const before = M.SENT.length;
  M.U.openCustodialAct("memberadd");
  await M.U.doCustodialAct();
  ok("MEMBER: the entry point opens nothing and sends nothing for a session that does not administer",
     M.html("#dlg") === "" && !M.SENT.slice(before).some(s => FOUR.includes(s.op)));
  ok("MEMBER: no custodial op was sent at any point", !M.SENT.some(s => FOUR.includes(s.op)));
}

/* ============================================================
   4. EVERY REFUSAL THE SURFACE CAN RECEIVE, IN ITS CANNED WORDS
   ============================================================ */
console.log("\n--- 4. every refusal the surface can receive carries its canned translation ---");
const renders = (r, code, row) => {
  const f = r.out && r.out.refusal;
  return !!f && f.reason === code && f.code === code && f.check === row.check && f.translation === row.translation
      && r.err.includes(row.translation.slice(0, 50).replace(/&/g, "&amp;")) && r.err.includes(code);
};
{
  const cases = [
    ["BAD_MEMBER_ID", CUSTODIAL_CHECKS.BAD_MEMBER_ID, "memberadd", null, null,
      { "#ca-id": { value: "Not An Id!" }, "#ca-cover": { value: "x" } }],
    ["MEMBER_ID_RESERVED", MEMBER_ID_CHECKS.MEMBER_ID_RESERVED, "memberadd", null, null,
      { "#ca-id": { value: "admin" }, "#ca-cover": { value: "x" } }],
    ["NO_COVER", CUSTODIAL_CHECKS.NO_COVER, "memberadd", null, null, { "#ca-id": { value: "vera" } }],
    ["EXISTS", CUSTODIAL_CHECKS.EXISTS, "memberadd", null, null,
      { "#ca-id": { value: "olive" }, "#ca-cover": { value: "again" }, "#ca-role-member": { checked: true } }],
    ["ADMIN_REQUIRES_VOTE", CUSTODIAL_CHECKS.ADMIN_REQUIRES_VOTE, "memberset", "ruth", "revoked", {}],
    ["BAD_KEY", CUSTODIAL_CHECKS.BAD_KEY, "signeradd", null, null,
      { "#ca-who": { value: "olive" }, "#ca-key": { value: "ssh-rsa AAAAB3NzaC1yc2E olive@old" } }],
    ["SIGNER_MEMBER_NOT_ENROLLED", SIGNER_ENROLMENT_CHECKS.SIGNER_MEMBER_NOT_ENROLLED, "signeradd", null, null,
      { "#ca-who": { value: "uma" }, "#ca-key": { value: KEY("uma") } }],
  ];
  for(const [code, rw, act, subj, to, fields] of cases){
    const r = await perform(F, act, subj, to, fields);
    ok(`REFUSAL ${code}: the plane answers it with C-row ${rw.check}'s translation and the dialog renders it`, renders(r, code, rw));
  }
  /* SIGNER_MEMBER_NOT_ACTIVE: reactivating a key whose member is deactivated. */
  await perform(F, "memberset", "olive", "revoked");
  const r = await perform(F, "signerset", K2, "active");
  ok("REFUSAL SIGNER_MEMBER_NOT_ACTIVE: reactivating a deactivated member's key is refused in its canned words",
     renders(r, "SIGNER_MEMBER_NOT_ACTIVE", SIGNER_ENROLMENT_CHECKS.SIGNER_MEMBER_NOT_ACTIVE));
  await perform(F, "memberset", "olive", "active");
}
/* ADMINS_FIRST, on a fresh plane whose founder is the only administrator. */
{
  const mf2 = plane(); planes.push(mf2);
  const W2 = wire(mf2);
  await W2.post("claim", { bootstrapToken: ADM, password: "founder-passphrase-d134" });
  const f2 = await W2.post("login", { password: "founder-passphrase-d134" });
  const F2 = await signIn(mf2, f2.token);
  const r = await perform(F2, "memberadd", null, null, {
    "#ca-id": { value: "wren" }, "#ca-cover": { value: "first member" }, "#ca-role-member": { checked: true } });
  ok("REFUSAL ADMINS_FIRST: an ordinary member before a second administrator is refused in its canned words",
     renders(r, "ADMINS_FIRST", CUSTODIAL_CHECKS.ADMINS_FIRST));
}
/* NOT_AN_ADMIN, AT THE OP from a member's session (the surface offers the member no control to reach it). */
{
  OLIVE = await login("olive");
  const f = await W.post("memberset", { memberId: "uma", status: "revoked" }, OLIVE);
  const rw = CUSTODIAL_CHECKS.NOT_AN_ADMIN;
  ok(`REFUSAL NOT_AN_ADMIN (at the op): a member's session is refused with C-96.1's translation (${f && f.reason})`,
     f && f.reason === "NOT_AN_ADMIN" && f.code === "NOT_AN_ADMIN" && f.check === rw.check && f.translation === rw.translation
     && f.by === "olive");
  const Fx = loadApp(mf);
  ok("REFUSAL NOT_AN_ADMIN: `actRefusalHtml` renders the translation, not the operator's detail",
     Fx.U.actRefusalHtml(f).includes(rw.translation.slice(0, 50)) && !Fx.U.actRefusalHtml(f).includes("stamps who is asking"));
}
/* THE SPLIT THIS ITEM HAD TO MAKE. The control plane decorates EVERY refusal carrying a family code
   (`dec49Decorate`), so C-96.1's caller sentence would have reached `adminRemove`'s TARGET case too, where it
   is false. That case now answers its own code; a caller who is not an administrator still answers C-96.1. */
{
  const f = await W.post("adminremove", { memberId: "olive", reason: "not an administrator" }, FOUNDER);
  const rw = CUSTODIAL_CHECKS.TARGET_NOT_AN_ADMIN;
  ok(`SPLIT: naming an ordinary member for administrator removal answers TARGET_NOT_AN_ADMIN in its own words (${f && f.reason})`,
     f && f.reason === "TARGET_NOT_AN_ADMIN" && f.check === rw.check && f.translation === rw.translation);
  OLIVE = await login("olive");
  const g = await W.post("adminremove", { memberId: "ruth", reason: "no" }, OLIVE);
  ok(`SPLIT: a member's session voting on an administrator's removal still answers NOT_AN_ADMIN, C-96.1 (${g && g.reason})`,
     g && g.reason === "NOT_AN_ADMIN" && g.check === CUSTODIAL_CHECKS.NOT_AN_ADMIN.check);
}
/* invited_by's three renderings: a name, `not recorded` for null, nothing for a plane that does not send it. */
{
  const A = loadApp(mf);
  ok("RENDER invited_by: a name, `not recorded` for null, and nothing for an older plane's row without the field",
     /invited by ruth/.test(A.U.memberInviterHtml({ invited_by: "ruth" }))
     && /invited by not recorded/.test(A.U.memberInviterHtml({ invited_by: null }))
     && A.U.memberInviterHtml({ status: "active" }) === "");
}
/* The rows are real and distinct: an arm that matched an empty or shared sentence would prove nothing. */
{
  const rows = Object.entries(CUSTODIAL_CHECKS);
  ok(`C-96 carries ${rows.length} rows, each with a check, a where and a distinct translation`,
     rows.length === 9 && rows.every(([, r]) => /^C-96\.\d+$/.test(r.check) && r.where && r.translation.length > 40)
     && new Set(rows.map(([, r]) => r.translation)).size === rows.length);
}

console.log(`\ncustodial-acts: ${n - fails.length} of ${n} assertions passed`);
exitCode = fails.length ? 1 : 0;
if(fails.length) console.error(`custodial-acts: ${fails.length} of ${n} assertions FAILED`);
} catch(e){
  console.error("custodial-acts: threw before its foot —", e && e.stack || e);
  exitCode = 1;
} finally {
  for(const p of planes) await p.dispose().catch(()=>{});
}
process.exit(exitCode);
