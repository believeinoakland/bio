/* NEGATIVE CONTROL: `node civicos-ui/test/group-identity-surface.control.mjs` (from the repo root) — a BASELINE and five
 * arms, each mutating `civicos-ui/app.html` ALONE, restored and verified by sha256 AND `cmp` against a per-arm pristine
 * copy; what each arm MUST and MUST NOT fail is declared in the driver before it arms. RUN 2026-09-25 by UI-78 against
 * app.html 73a4f7de… (1,618,811 bytes), the file IDENTICAL to pristine at the end — 6/6 AS DECLARED: BASELINE GREEN
 * 32/32 · (A) THE ROW'S CONTROL, the domain rendered without its verdict -> RED 28/32, the three "U3 UNVERIFIED DOMAIN,
 * SURFACE GATE" arms and R1 failing BY NAME while U1 (the header over the real plane) and V1 stayed GREEN — the
 * plane's own gate still holds the header there, which is why U3 exists · (B) THE LIAR, the display name alone -> RED
 * 25/32, N1, N2 NEVER INSTEAD, N4, V2 and the three U2 (whose fence line also lost the slug), F1 GREEN · (C) members
 * denied the verdict -> RED 28/32, the three U2 and V3, U1 GREEN · (D) OVER-STRICTNESS, "Name (slug)" and "verified on
 * <date>" -> GREEN 32/32 · (E) OVER-TIGHT, no domain ever -> RED 30/32, V1 and R3, U1 GREEN.
 * =========================================================================
 * UI-78 — THE PUBLIC HEADER SHOWS A GROUP'S DISPLAY NAME WITH ITS SLUG AND A DOMAIN ONLY WHILE VERIFIED, AND MEMBERS
 * SEE A DOMAIN CLAIM'S DATED VERDICT. Design: `docs/architecture/BIO_Publication_v0_1.md` §7 points 2 and 3 (a display
 * name shown WITH the slug, never instead of it; a domain shown publicly only while its latest verdict is `verified`;
 * members see the claim and its state), with DEC-69: a surface invents nothing. Consumes REC-164's `op=groupidentity`
 * (IC-223), with `op=groupnameset` and `op=groupdomainset` driving the record.
 *
 * NO MOCK OF THE READ. The plane runs in miniflare from `bio-plane/src/index.mjs` — the real control plane, the real
 * Durable Object — and `app.html`'s own `fetch` is bridged to it (group-surface's instrument). The ONLY scripted part is
 * the web the plane's verifier fetches: Miniflare's `outboundService` answers each claimed domain's
 * `/.well-known/civicos-group.json` exactly as this suite scripts it (REC-164's own suite's method). Every set act is an
 * administrator's real signed-in session; the fence is a real MEMBER's session through the real `boot()`; the header
 * reads holding nothing, as a stranger does.
 *
 * HOW A LIAR PASSES IT, stated before what checks it:
 *   - SHOWING THE DISPLAY NAME ALONE: every "the name is shown" arm is green over a surface that dropped the slug. So
 *     each name arm demands the SLUG in the same element, and the name alone is asserted to be NOT what is shown.
 *   - SHOWING A CLAIMED DOMAIN WITHOUT ITS VERDICT: over the real plane the stranger's answer never carries an
 *     unverified domain, so a header that would show any domain it is handed stays green there. So arm U3 hands the
 *     surface's own reader the CREDENTIALED answer — the one that carries the claim — for every non-verified verdict,
 *     and demands that no public domain line results: the surface's own gate, not only the plane's.
 *   - A SURFACE THAT SAYS NOTHING passes every "not shown" arm, so V1 demands the verified domain IS shown, with its date.
 *
 * WHAT THIS CANNOT SEE, stated: a page as a browser lays it out (no layout engine runs — the fence line is CSS-cut with
 * an ellipsis on a narrow screen, and its `title` carries the whole line; neither is observed here); a real DNS name
 * and TLS fetch (the outbound web is scripted); the reconciling alarm moving a verdict on its own clock (REC-164's
 * suite drives that; here a new claim moves the verdict); and a live instance — see the landing's report.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard the writer's own output */
import fs from "fs";
import vm from "vm";
import { webcrypto } from "crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("group-identity-surface: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/. " + String(e && e.message || e));
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const ADM = "adm-ui78", MEM = "mem-ui78", PRB = "prb-ui78";
const ORIGIN = "http://x";                      /* the address every request reaches, so the address a claim binds */
const SLUG = "harbour-watch-coalition";
const NAME = "Harbour Watch";
/* THE SCRIPTED WEB: host -> { status, body } for the well-known file. */
const fileNaming = (instance, group) => JSON.stringify({ instance, group });
const WEB = new Map([
  ["harbour.example",  { status: 200, body: fileNaming(ORIGIN, SLUG) }],                          /* verified */
  ["nofile.example",   { status: 404, body: "not found" }],                                        /* absent */
  ["impostor.example", { status: 200, body: fileNaming("https://another.workers.dev", SLUG) }],    /* mismatched */
  ["broken.example",   { status: 503, body: "unavailable" }],                                      /* undetermined */
]);
const planes = [];
function plane(){
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
    script: fs.readFileSync(IDX, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test", INSTANCE_NAME: SLUG,
                GOVERNOR_APPETITE_PER_MIN: "60000" },
    outboundService(request){
      const u = new URL(request.url);
      const page = u.pathname === "/.well-known/civicos-group.json" ? WEB.get(u.host) : null;
      return page ? new Response(page.body, { status: page.status, headers: { "content-type": "application/json" } })
                  : new Response("no such page", { status: 404 });
    },
  });
  planes.push(mf);
  return mf;
}
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (mf, op, body, tok) => rP(await (await mf.dispatchFetch(
  `${ORIGIN}/api/?op=${op}${tok ? "&token=" + tok : ""}`, { method:"POST", body: JSON.stringify(body) })).json());
async function session(mf, id, role){
  const add = await post(mf, "memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:["contribute"] }, ADM);
  if(!add || !add.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await post(mf, "enroll", { invite:add.invite, handle:id, password:`${id}-passphrase-78` });
  if(!en || !en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await post(mf, "login", { role:`member:${id}`, password:`${id}-passphrase-78` });
  if(!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
}

/* ---- ONE LOADED APP per read: a fresh DOM stub, a fresh script context, a bridge that records what was SENT. */
const text = (h) => String(h||"").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
function loadApp(fetchImpl){
  const els = new Map();
  function el(){
    const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
      value:"", _html:"", textContent:"", title:"", scrollTop:0, disabled:false, checked:false, addEventListener(){},
      querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
      remove(){}, onclick:null, onchange:null, setAttribute(){}, getAttribute(){ return null; } };
    Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
    return e;
  }
  const $$ = (s) => { if(!els.has(s)) els.set(s, el()); return els.get(s); };
  const SENT = [];
  async function bridge(u, opts){
    const url = new URL(u, ORIGIN);
    SENT.push({ op: url.searchParams.get("op"), params: Object.fromEntries(url.searchParams.entries()) });
    return fetchImpl(url, opts);
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
  vm.runInContext(appScript() + ";globalThis.__U = {PLANE, boot, enterPublished, groupFromAnswer, groupDomainPublic,"
    + " get PUB_GROUP(){ return PUB_GROUP; } };", ctx);
  const at = (s) => { const e = els.get(s); return e ? (String(e.textContent || "") + " " + text(e._html)).trim() : ""; };
  const headerText = () => ["#p-gname", "#p-gid", "#p-mono"].map(at).join(" | ");
  return { U: ctx.__U, SENT, at, headerText, els };
}
const mfFetch = (mf) => (url, opts) => mf.dispatchFetch(url.toString(), opts);
const DATE = /\b\d{4}-\d{2}-\d{2}\b/;
/* The header, read as a stranger: a fresh app, the published space entered holding nothing. */
async function header(mf){
  const A = loadApp(mfFetch(mf));
  A.U.enterPublished(true);
  await A.U.PUB_GROUP;
  const sent = A.SENT.filter(s => s.op === "groupidentity");
  return { name: A.at("#p-gname"), gid: A.at("#p-gid"), all: A.headerText(),
           strangers: sent.length === 1 && !("token" in sent[0].params) };
}
/* The fence, read as a signed-in member through the real boot. */
async function fence(mf, tok){
  const B = loadApp(mfFetch(mf));
  B.U.PLANE.token = tok; B.U.PLANE.session = true;
  let err = null;
  try{ await B.U.boot(); }catch(e){ err = e; }
  const sent = B.SENT.filter(s => s.op === "groupidentity");
  return { grp: B.at("#m-grp"), idstr: B.at("#m-idstr"), title: (B.els.get("#m-idstr") || {}).title || "",
           err, member: sent.length >= 1 && sent[0].params.token === tok };
}

let exitCode = 1;
try {
const mf = plane();
const RUTH = await session(mf, "ruth", "admin");
await session(mf, "gus", "admin");
const OLIVE = await session(mf, "olive", "member");
const setName = (name) => post(mf, "groupnameset", { name }, RUTH);
const setDomain = (domain) => post(mf, "groupdomainset", { domain }, RUTH);
const credentialed = async () => rP(await (await mf.dispatchFetch(`${ORIGIN}/api/?op=groupidentity&token=${ADM}`)).json());

/* ============================================================
   0. THE FIXTURE, FLOORED: the plane records the slug and nothing beside it
   ============================================================ */
console.log("\n--- 0. the fixture: a slug, no name, no domain ---");
{
  const pub = rP(await (await mf.dispatchFetch(`${ORIGIN}/api/?op=groupidentity`)).json());
  ok(`F0: a stranger's op=groupidentity reads the slug, no display name, no domain (${JSON.stringify(pub).slice(0, 160)})`,
     pub && pub.group === SLUG && pub.display_name === null && pub.domain === null);
  const h = await header(mf);
  ok(`F1: the header shows the slug alone, and no domain line (read "${h.name}" / "${h.gid}")`, h.name === SLUG && h.gid === "");
  ok("F2: the header's read was op=groupidentity, once, holding NO credential", h.strangers);
  const f = await fence(mf, OLIVE);
  ok(`F3: the fence shows the slug and no claim, through the member's own credential (read "${f.grp}" / "${f.idstr}")`,
     !f.err && f.member && f.grp === SLUG && f.idstr === SLUG);
}

/* ============================================================
   1. A DISPLAY NAME — shown WITH the slug, never instead of it
   ============================================================ */
console.log("\n--- 1. a display name, beside the slug ---");
{
  const s = await setName(NAME);
  ok(`N0: an administrator's session set the display name (${JSON.stringify(s).slice(0, 120)})`, s && s.ok === true);
  const h = await header(mf);
  ok(`N1 DISPLAY NAME WITH SLUG, HEADER: #p-gname shows the display name AND the slug (read "${h.name}")`,
     h.name.includes(NAME) && h.name.includes(SLUG));
  ok(`N2 NEVER INSTEAD, HEADER: #p-gname is not the display name alone (read "${h.name}")`, h.name.trim() !== NAME);
  ok(`N3: the monogram is still the slug's own first character (read "${h.all}")`, h.all.split(" | ")[2] === "H");
  const f = await fence(mf, OLIVE);
  ok(`N4 DISPLAY NAME WITH SLUG, FENCE: #m-grp and #m-idstr each show the name AND the slug (read "${f.grp}" / "${f.idstr}")`,
     !f.err && [f.grp, f.idstr].every(t => t.includes(NAME) && t.includes(SLUG)));
}

/* ============================================================
   2. AN UNVERIFIED DOMAIN — never on the header; members see its dated verdict
   ============================================================ */
console.log("\n--- 2. an unverified or mismatched domain never reaches the header; members see its verdict ---");
const UNVERIFIED = [["impostor.example", "mismatched"], ["nofile.example", "absent"], ["broken.example", "undetermined"]];
for(const [domain, verdict] of UNVERIFIED){
  const d = await setDomain(domain);
  ok(`U0 (${domain}): the plane recorded the claim and read it \`${verdict}\` (${JSON.stringify(d && d.check).slice(0, 140)})`,
     d && d.ok === true && d.check && d.check.verdict === verdict);
  const h = await header(mf);
  ok(`U1 UNVERIFIED DOMAIN, HEADER (${verdict}): the domain appears nowhere in the header (read "${h.all}")`,
     !h.all.includes(domain) && h.gid === "");
  const f = await fence(mf, OLIVE);
  ok(`U2 MEMBERS SEE VERDICT (${verdict}): the fence names the claimed domain, its verdict and its date, and that `
     + `a stranger is not shown it (read "${f.idstr}")`,
     !f.err && f.idstr.includes(domain) && f.idstr.includes(verdict) && DATE.test(f.idstr)
     && /not shown publicly/.test(f.idstr) && f.idstr.includes(SLUG));
  ok(`U2b (${verdict}): the fence's title carries the whole line, so a cut line still says it`, f.title === f.idstr);
  /* U3 — THE SURFACE'S OWN GATE: the credentialed answer carries the claim. Handed to the reader the header uses, it
     must yield no public domain line: the surface shows a domain only where the answer dates it as verified. */
  const full = await credentialed();
  const g = (() => { const A = loadApp(() => { throw new Error("no fetch"); }); return A.U; })();
  const line = g.groupDomainPublic(g.groupFromAnswer(full));
  ok(`U3 UNVERIFIED DOMAIN, SURFACE GATE (${verdict}): the credentialed answer (claim ${JSON.stringify(full && full.domain_claim && [full.domain_claim.domain, full.domain_claim.latest && full.domain_claim.latest.verdict])}) yields no public domain line (read "${line}")`,
     full && full.domain_claim && full.domain_claim.domain === domain && line === "");
}

/* ============================================================
   3. A VERIFIED DOMAIN — shown on the header with its date; and taken off again by a later unverified claim
   ============================================================ */
console.log("\n--- 3. a verified domain is shown, dated; a later unverified claim takes it off ---");
{
  const d = await setDomain("harbour.example");
  ok(`V0: the plane read the claim \`verified\` (${JSON.stringify(d && d.check).slice(0, 140)})`, d && d.check && d.check.verdict === "verified");
  const h = await header(mf);
  ok(`V1 VERIFIED DOMAIN, HEADER: #p-gid shows the domain, the word verified and its date (read "${h.gid}")`,
     h.gid.includes("harbour.example") && /verified/.test(h.gid) && DATE.test(h.gid));
  ok(`V2: the display name is still shown with the slug beside it (read "${h.name}")`, h.name.includes(NAME) && h.name.includes(SLUG));
  const f = await fence(mf, OLIVE);
  ok(`V3 MEMBERS SEE VERDICT (verified): the fence says the claim is verified, dated, and shown publicly (read "${f.idstr}")`,
     !f.err && f.idstr.includes("harbour.example") && /verified/.test(f.idstr) && DATE.test(f.idstr) && /shown publicly/.test(f.idstr)
     && !/not shown publicly/.test(f.idstr));
  const again = await setDomain("impostor.example");
  const h2 = await header(mf);
  ok(`V4: a later mismatched claim takes the domain off the header — neither domain is shown (verdict ${again && again.check && again.check.verdict}; read "${h2.all}")`,
     again && again.check && again.check.verdict === "mismatched" && h2.gid === ""
     && !h2.all.includes("harbour.example") && !h2.all.includes("impostor.example"));
}

/* ============================================================
   4. DEC-69, AT THE READER: a domain the answer does not date as verified is not shown, whatever else it says
   ============================================================ */
console.log("\n--- 4. the reader invents nothing ---");
{
  const U = loadApp(() => { throw new Error("no fetch"); }).U;
  const cases = {
    "a domain with no verified date": { ok:true, group:SLUG, display_name:null, domain:"harbour.example", domain_verified_at:null },
    "a display name with no slug":    { ok:true, group:null, display_name:NAME, domain:null, domain_verified_at:null },
  };
  const g1 = U.groupFromAnswer(cases["a domain with no verified date"]);
  ok(`R1: an answer carrying a domain with no verified date yields no public domain line (read "${U.groupDomainPublic(g1)}")`,
     U.groupDomainPublic(g1) === "");
  const g2 = U.groupFromAnswer(cases["a display name with no slug"]);
  ok(`R2: an answer with a display name and no slug reads as no group recorded, and the name is carried nowhere (${JSON.stringify(g2)})`,
     g2.state === "none" && !JSON.stringify(g2).includes(NAME));
  const g3 = U.groupFromAnswer({ ok:true, group:SLUG, display_name:NAME, domain:"harbour.example", domain_verified_at:"2026-09-25T00:00:00.000Z" });
  ok(`R3 (over-strictness): a well-formed verified answer yields its dated line (read "${U.groupDomainPublic(g3)}")`,
     U.groupDomainPublic(g3).includes("harbour.example") && U.groupDomainPublic(g3).includes("2026-09-25"));
}

exitCode = fails.length ? 1 : 0;
} finally {
  for(const mf of planes) await mf.dispose();
}
console.log(`\ngroup-identity-surface: ${n - fails.length}/${n} assertions passed`);
if(fails.length){ console.error(`group-identity-surface: ${fails.length} of ${n} assertions FAILED`); }
process.exit(exitCode);
