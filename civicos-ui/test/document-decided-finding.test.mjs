/* D-617 — THE DOCUMENT PAGE SAYS A MEMBER DECIDED A FINDING, BESIDE THE FINDING, AND KEEPS IT LISTED.
 * AGAINST THE REAL PLANE, THROUGH THE PAGE'S OWN RENDERER. The twin of UI-108's
 * `progression-decided-finding.test.mjs`, whose harness this reuses.
 *
 * THE DESIGN (`BIO_Content_Framework_v0_10.md` §12 "age rather than vanish", D-79; §8.2). A member's
 * decision about a finding AGES it and never makes it vanish. D-552 (IC-290) put the decision on every
 * finding `op=captureprogressions` publishes — `disposition`, null where nobody decided, else `{ state,
 * reason, decided_by, at, definition_version, definition_version_state, applies, applies_because }`.
 *
 * WHAT WAS WRONG ON THE PAGE, measured before building: `docInstanceHtml` (the UI-9 block of `app.html`)
 * painted each finding as its stage, required-ness and grade and nothing else, so a finding a member had
 * dismissed read on the document page exactly like an open question — while the progression page
 * (UI-108) said it was decided. Two pages, two accounts of one decision.
 *
 * THE INSTRUMENT. The real plane (`bio-plane/src/index.mjs`) in miniflare; `app.html`'s own `fetch` is
 * bridged to it and the page is rendered through `docKnowsPanel(captureSha)`, the function the document
 * page calls (`openBundle`'s "what the record knows" panel). A REAL signed-in member (IRIS), never the
 * deploy MEMBER_TOKEN (REC-189). The plane's clock is pinned (BIO_NOW_MS, REC-8's seam) so the contract
 * stage is OVERDUE and both of `docInstanceHtml`'s finding branches are exercised.
 *
 * THE ARMS:
 *   1. before any decision every finding is listed and says no member has decided it;
 *   2. THE DECIDED-FINDING ARM (the row's accepts-when): after IRIS dismisses the missing application, it
 *      is STILL LISTED and its decision renders BESIDE it — state, author, instant, reason verbatim, the
 *      version of the declared flow it judged and that it still stands — and the decision does not leak
 *      onto the findings nobody decided;
 *   3. THE DECIDED-OVERDUE ARM: after IRIS defers the overdue contract, the overdue finding keeps its
 *      overdue note AND carries the decision;
 *   4. THE SAME-WORDS ARM: the document page's decision sentence is the progression page's, word for word;
 *   5. THE NOT-KNOWN ARM: a plane that publishes no `disposition` key (the real answer with that key
 *      taken off) is not called undecided — the page says whether anyone decided is not known.
 *
 * WHAT THIS SUITE CANNOT SEE: it asserts what the HTML SAYS, not how it looks; it renders the panel
 * function the document page calls, not `openBundle`'s whole page; the not-known arm's plane is the real
 * one with a key removed, not a build from before D-552.
 *
 * NEGATIVE CONTROL: RUN 2026-09-25 by WORKER D-617 against `civicos-ui/app.html`
 * `efe4e169057d11447dd71eb58ec33ea01591c3a13eff5fb0c358ab2cd36255c5` (1,637,955 bytes), each arm ALONE by anchored
 * replacement asserted to match exactly once, restored from a per-arm pristine copy with sha256 AND `cmp` verified and
 * the byte count guarded, the file IDENTICAL to pristine at the end — **4/4 AS DECLARED**. BASELINE GREEN 25 / 0.
 *   (A) THE ROW'S ARM — `docInstanceHtml` renders its findings WITHOUT the disposition (both
 *       `progFindingDecisionHtml(f)` calls removed). DECLARED RED naming THE DECIDED-FINDING ARM, with THE PLANE'S
 *       VIEW and "the finding is STILL LISTED" green. -> RED, 9 of 25: arm 1's "each says no member has decided it",
 *       the four DECIDED-FINDING ARM lines, the no-leak line, THE DECIDED-OVERDUE ARM, THE SAME-WORDS ARM and the
 *       first NOT-KNOWN line. Every declared-green line green.
 *   (B) NOT KNOWN READ AS UNDECIDED — `progFindingDecisionHtml`'s no-key branch returns the undecided sentence.
 *       DECLARED RED naming THE NOT-KNOWN ARM, THE DECIDED-FINDING ARM green. -> RED, 2 of 25: both NOT-KNOWN lines.
 *   (C) OVER-STRICTNESS — the decision placed above the grade line in both branches, its lead sentence upper-cased
 *       inside `<em>`. DECLARED GREEN -> GREEN 25 / 0.
 * Re-runnable in one step: `node civicos-ui/test/document-decided-finding.control.mjs`.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard its output. */
import fs from "fs";
import vm from "vm";
import { webcrypto, createHash } from "crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* WHAT A MEMBER READS, not how it is marked up: tags stripped, entities opened, whitespace collapsed,
   matched case-insensitively — so the control's over-strictness arm (same words, other markup and
   case) stays GREEN. */
const text = (h) => String(h||"")
  .replace(/<[^>]*>/g, " ")
  .replace(/&mdash;/g, "—").replace(/&rsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"')
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/\s+/g, " ").trim();
const says = (h, re) => re.test(text(h));
/* The finding's own block, from its opening marker to the next finding's (or the end): the decision
   must be INSIDE the block of the finding it judged, not merely somewhere on the page. */
const findingBlock = (h, stage) => {
  const at = h.indexOf(`data-finding-stage="${stage}"`);
  if(at < 0) return "";
  const next = h.indexOf("data-finding-stage=", at + 1);
  return h.slice(at, next < 0 ? h.length : next);
};

/* ---- the REAL plane, in miniflare. Not installed -> FAIL, never skip. ---- */
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("progression-decided-finding: the real plane could not be started — run `npm ci` in bio-plane/.");
  console.error("  " + String(e && e.message || e));
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d617", MEMBER_TOKEN: "mem-d617", PROBE_TOKEN: "prb-d617", VERSION: "test",
              INSTANCE_NAME: "fixture-group",
              /* the plane's own clock seam (REC-8), so the contract is overdue whatever the wall says */
              BIO_NOW_MS: String(Date.parse("2026-09-01T00:00:00Z")) },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}${tok ? "&token=" + tok : ""}`, { method:"POST", body: JSON.stringify(body) })).json());
const get  = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:caps }, "adm-d617");
  if(!add || !add.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await post("enroll", { invite:add.invite, handle:id, password:`${id}-passphrase-1` });
  if(!en || !en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role:`member:${id}`, password:`${id}-passphrase-1` });
  if(!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await member("ruth", ["contribute"], "admin");
await member("gus",  ["contribute"], "admin");
const IRIS = await member("iris", ["contribute"]);
const ME = await get("whoami", "", IRIS);
ok("the surface's credential is a SESSION, signed in as a member — not the deploy member token",
   ME && ME.session === true && typeof ME.member === "string" && ME.member.length > 0);

/* ---- the DOM stub and the bridge (declared-flow-surface's shape) ---- */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
    remove(){}, onclick:null, onchange:null };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if(!els.has(s)) els.set(s, el()); return els.get(s); };
const html = (s) => $$(s)._html;
const CALLED = [];
let OLD_PLANE = false;   /* arm 4: a plane from before D-552, which publishes no `disposition` key at all */
async function bridgeFetch(u, opts2){
  const url = new URL(u, "http://x");
  CALLED.push({ op:url.searchParams.get("op"), token:url.searchParams.get("token") });
  const r = await mf.dispatchFetch(url.toString(), opts2);
  if(!OLD_PLANE || url.searchParams.get("op") !== "captureprogressions") return r;
  /* The REAL answer, with only the key D-552 added taken off every finding — everything else is the plane's. */
  const j = await r.json();
  const body = (j && typeof j === "object" && "result" in j) ? j.result : j;
  for(const i of (body && body.instances) || []) for(const f of i.findings || []) delete f.disposition;
  return { ok:true, status:200, json:async()=>j };
}
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
  IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1},
  requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:bridgeFetch };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE","PROG","progLoad","esc","docKnowsPanel",
].join(",") + "};", ctx);
const U = ctx.__U;
U.PLANE.token = IRIS;
U.PLANE.session = true;
U.PLANE.me = ME;

/* ============================================================
   FIXTURE: a grant flow; the AWARD is on the record, the application before it is missing, and the
   contract after it is missing AND overdue (90 days after an award dated 2026-05-01, read at 2026-09-01)
   ============================================================ */
console.log("\n--- fixture: grant declared, a subject threaded at the award; application missing, contract overdue ---");
const AWARD_AT = "2026-05-01T00:00:00Z";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${AWARD_AT}`, `last_updated: ${AWARD_AT}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${AWARD_AT}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "A grant document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const def1 = await post("progressiondefine", { progressionKey:"grant", label:"How a grant is supposed to go",
  stages:[{ key:"application", label:"the application", cardinality:"1", required:"usually" },
          { key:"award", label:"the award", after:"application", cardinality:"1", required:"always" },
          { key:"contract", label:"the contract", after:"award", cardinality:"1", within:"90 days", required:"always" }] }, IRIS);
ok("the flow is declared at version 1", def1 && def1.ok !== false);
const eG = await post("entitycreate", { kind:"fund", label:"Grant G", aliases:["fund:G"] }, IRIS);
const gAward = sha("d617-G-award");
{
  const id = "INFO-2026-0001-d617", md = bundleMd(id);
  const prov = JSON.stringify({ documents: [{ capture:{ sha256:gAward, encoding:"binary", bytes:10 },
    reading:{ content_type:"meeting_calendar", reader_version:1, found:true, at:AWARD_AT,
              entities:[{ ref:"fund:G", kind:"fund", key:"G", label:"Grant G" }] } }] });
  const pr = await post("promote", { bundleId:id, base:null, snapKey:"20260501T010000Z_dddd6170", author:"d617",
    meta:{ object_type:"information", group:"believe-in-oakland", title:`Doc ${id}`,
           current_state:"collected", created:AWARD_AT, last_updated:AWARD_AT },
    files:[{ path:"bundle.md", text:md, bytes:md.length, sha256:sha(md) },
           { path:"data/provenance.json", text:prov, bytes:prov.length, sha256:sha(prov) }], register:[] }, IRIS);
  ok("a real captured document is on the record for the flow to be threaded with", pr && pr.ok !== false);
}
await post("resolve", { captureSha:gAward }, IRIS);
const th = await post("thread", { progressionKey:"grant", entityId:eG.entity_id,
  placements:[{ stage:"award", captureSha:gAward }] }, IRIS);
ok("the award is threaded, so the application before it and the contract after it are missing", th && th.ok !== false);

/* The document page's panel, rendered by the page's own function, with the member signed in. */
const openDoc = async () => U.docKnowsPanel(gAward);
/* One finding's own block on the document page: from its opening tag to the next finding's (or the
   section's end). `overdue` picks the overdue branch's block over the missing one for the same stage. */
const docBlock = (h, stage, overdue = false) => {
  const re = /<div class="docprog-finding( overdue)?"[^>]*data-finding-stage="([^"]*)"/g;
  let m, at = -1;
  while((m = re.exec(h))) if(m[2] === stage && !!m[1] === overdue){ at = m.index; break; }
  if(at < 0) return "";
  const nx = h.slice(at + 1).search(/<div class="docprog-finding|<\/section>/);
  return h.slice(at, nx < 0 ? h.length : at + 1 + nx);
};
/* The decision's own element, by balanced <div> counting from the tag that carries `data-decided-finding`. */
const decisionText = (b) => {
  const at = b.indexOf("data-decided-finding="); if(at < 0) return "";
  const from = b.lastIndexOf("<div", at), re = /<div\b|<\/div>/g; re.lastIndex = from;
  let depth = 0, m;
  while((m = re.exec(b))){ depth += m[0] === "</div>" ? -1 : 1; if(depth === 0) return text(b.slice(from, re.lastIndex)); }
  return "";
};

/* ============================================================
   1. before any decision: every finding listed, each said to be undecided
   ============================================================ */
console.log("\n--- 1. before any decision ---");
const c0 = await get("captureprogressions", `sha256=${gAward}`, IRIS);
const inst0 = ((c0 && c0.instances) || [])[0] || { findings: [] };
console.log(`  CORPUS: op=captureprogressions lists ${(c0.instances||[]).length} instance(s); findings ${JSON.stringify(inst0.findings.map(f => [f.kind, f.stage_key, f.disposition]))}`);
ok("THE PLANE'S VIEW, BY NAME (D-552): three findings — the application missing, the contract missing and overdue — each carrying `disposition: null`",
   inst0.findings.length === 3
   && inst0.findings.every(f => Object.prototype.hasOwnProperty.call(f, "disposition") && f.disposition === null)
   && inst0.findings.some(f => f.kind === "overdue_successor" && f.stage_key === "contract")
   && inst0.findings.some(f => f.kind === "missing_predecessor" && f.stage_key === "application"));
const p0 = await openDoc();
const a0 = docBlock(p0, "application"), o0 = docBlock(p0, "contract", true);
ok("the document page is painted and lists the application and the overdue contract",
   p0.length > 500 && says(a0, /the application is usually expected but no document fills it yet/i) && says(o0, /overdue/i));
ok("and each says no member has decided it",
   says(a0, /no member has decided this finding/i) && says(o0, /no member has decided this finding/i));
ok("and no decision is painted", !/data-decided-finding=/.test(p0));
ok("the read is the plane's op=captureprogressions, carrying the member's session",
   CALLED.some(c => c.op === "captureprogressions" && c.token === IRIS));

/* ============================================================
   2. THE DECIDED-FINDING ARM
   ============================================================ */
console.log("\n--- 2. IRIS dismisses the missing application: it stays listed, and its decision renders beside it ---");
await sleep(5);
const REASON = "This fund took applications by telephone that year, so there is no document to find.";
const disp = await post("proposedispose", { key:"grant::application", to:"dismissed", definitionVersion:1, reason:REASON }, IRIS);
ok("the decision is recorded against version 1", disp && disp.ok !== false && disp.definition_version === 1);
const c1 = await get("captureprogressions", `sha256=${gAward}`, IRIS);
const d1 = ((((c1.instances||[])[0]||{}).findings || []).find(f => f.stage_key === "application") || {}).disposition || null;
console.log(`  PLANE: disposition ${JSON.stringify(d1)}`);
ok("the plane still lists the finding and publishes the decision on it, applying",
   d1 && d1.state === "dismissed" && d1.applies === true);
const p1 = await openDoc();
const a1 = docBlock(p1, "application");
ok("the finding is STILL LISTED on the document page",
   says(a1, /the application is usually expected but no document fills it yet/i));
ok("THE DECIDED-FINDING ARM: a dismissed finding renders its decision BESIDE it — inside the finding's own block",
   /data-decided-finding="application"/.test(a1) && says(a1, /a member decided this finding/i));
ok("THE DECIDED-FINDING ARM: the decision's state, its author and its instant, all the record's",
   says(a1, new RegExp(`set aside as dismissed by ${d1 && d1.decided_by} on ${d1 && String(d1.at).slice(0, 10)}`, "i")));
ok("THE DECIDED-FINDING ARM: the member's reason, verbatim", a1.includes(U.esc(REASON)));
ok("THE DECIDED-FINDING ARM: which version of the declared flow it judged, and that it still stands",
   says(a1, /it judged version 1 of the declared flow/i) && says(a1, /still the one standing/i));
ok("and it is no longer called undecided", !says(a1, /no member has decided this finding/i));
ok("the decision does not leak: the overdue contract nobody decided still says so, and carries none",
   says(docBlock(p1, "contract", true), /no member has decided this finding/i)
   && !/data-decided-finding=/.test(docBlock(p1, "contract", true)));

/* ============================================================
   3. THE DECIDED-OVERDUE ARM
   ============================================================ */
console.log("\n--- 3. IRIS defers the overdue contract: the overdue note stays, and the decision is beside it ---");
await sleep(5);
const REASON2 = "The contract is being renegotiated; we will look again when the council next meets.";
const disp2 = await post("proposedispose", { key:"grant::contract", to:"deferred", definitionVersion:1, reason:REASON2 }, IRIS);
ok("the deferral is recorded", disp2 && disp2.ok !== false);
const p2 = await openDoc();
const o2 = docBlock(p2, "contract", true);
ok("the overdue finding is STILL LISTED, overdue", says(o2, /the contract is always expected, and it is \d+ days? overdue/i));
ok("THE DECIDED-OVERDUE ARM: the overdue finding carries its decision beside it, with the member's reason",
   /data-decided-finding="contract"/.test(o2) && says(o2, /set aside as deferred by/i) && o2.includes(U.esc(REASON2)));

/* ============================================================
   4. THE SAME-WORDS ARM: one decision, one account, on both pages
   ============================================================ */
console.log("\n--- 4. the progression page and the document page say the same thing about the same decision ---");
$$("#pg-look-key").value = "grant";
$$("#pg-look-subj").value = "fund:G";
await U.progLoad();
const pg = html("#pg-inst");
const pgStart = pg.indexOf('data-finding-stage="application"');
const pgBlock = pgStart < 0 ? "" : pg.slice(pgStart, (i => i < 0 ? pg.length : i)(pg.indexOf("data-finding-stage=", pgStart + 1)));
const docSays = decisionText(docBlock(p2, "application")), progSays = decisionText(pgBlock);
console.log(`  DOCUMENT PAGE: ${docSays.slice(0, 160)}…`);
ok("THE SAME-WORDS ARM: the document page's decision is the progression page's, word for word",
   docSays.length > 80 && docSays === progSays);

/* ============================================================
   5. THE NOT-KNOWN ARM: a plane that publishes no disposition key
   ============================================================ */
console.log("\n--- 5. a plane that publishes no `disposition`: not known, never undecided ---");
OLD_PLANE = true;
const p3 = await openDoc();
OLD_PLANE = false;
const a3 = docBlock(p3, "application"), o3 = docBlock(p3, "contract", true);
ok("the findings are still listed", says(a3, /no document fills it yet/i) && says(o3, /overdue/i));
ok("THE NOT-KNOWN ARM: each says the record did not say whether a member decided it",
   says(a3, /the record did not say whether a member has decided this finding/i)
   && says(o3, /the record did not say whether a member has decided this finding/i));
ok("THE NOT-KNOWN ARM: and none is called undecided, none decided",
   !says(p3, /no member has decided this finding/i) && !/data-decided-finding=/.test(p3));

await mf.dispose();
if(fails.length){ console.error(`document-decided-finding: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`document-decided-finding: ${n} assertions, all green — on the document page a finding a member decided stays listed and carries the decision beside it, in the progression page's own words, an undecided one says so, and a plane that says nothing about decisions is not called undecided`);
process.exit(0);
