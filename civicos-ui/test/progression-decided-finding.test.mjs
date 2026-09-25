/* UI-108 — THE PROGRESSION PAGE SAYS A MEMBER DECIDED A FINDING, BESIDE THE FINDING, AND KEEPS IT
 * LISTED. AGAINST THE REAL PLANE, THROUGH THE SURFACE'S OWN HANDLERS.
 *
 * THE DESIGN (`BIO_Content_Framework_v0_10.md` §12 "age rather than vanish", D-79; §8.2). A member's
 * decision about a finding AGES it and never makes it vanish. D-552 (IC-290) put the decision on the
 * finding it judged: every entry of `op=instance`'s `findings[]` carries `disposition` — null where
 * nobody decided, else `{ state, reason, decided_by, at, definition_version, definition_version_state,
 * applies, applies_because }` — and the instance carries `open_finding_count` beside `finding_count`.
 *
 * WHAT WAS WRONG ON THE PAGE, measured before building: `progPaintInstance()` painted `inst.findings`
 * as `f.detail` and nothing else, so a finding a member had dismissed read exactly like an open
 * question. And a REFUSED or failed `op=instance` read was swallowed into `inst = null`, after which
 * every stage said "nothing on the record" — a read that never happened, painted as an empty chain.
 *
 * THE INSTRUMENT. The real plane (`bio-plane/src/index.mjs`) in miniflare; `app.html`'s own `fetch`
 * is bridged to it and the page is driven through `progLoad`, its own handler. A REAL signed-in member
 * (IRIS, enrolled through op=memberadd / op=enroll / op=login), never the deploy MEMBER_TOKEN (REC-189).
 *
 * THE ARMS:
 *   1. before any decision the finding is listed and says no member has decided it;
 *   2. THE DECIDED-FINDING ARM (the row's accepts-when): after IRIS dismisses it, the finding is STILL
 *      LISTED and its decision renders BESIDE it — state, author, instant, reason verbatim, the version
 *      of the declared flow it judged and that it still stands — with the record's own count;
 *   3. after the flow is revised, the same finding carries the same decision, which now says it no
 *      longer answers the question (the finding is open again, the decision its history);
 *   4. a refused `op=instance` read renders the plane's canned translation (DEC-49), word for word, and
 *      no stage claims "nothing on the record".
 *
 * WHAT THIS SUITE CANNOT SEE: it drives the progression page only. The document page's
 * `docInstanceHtml` renders `op=captureprogressions`' findings, which carry the same `disposition`, and
 * is NOT covered here (reported by UI-108 as a separate defect); it asserts what the HTML SAYS, not
 * how it looks; and `deferred` is exercised only through `dismissed`, the state words being the
 * plane's and rendered verbatim either way.
 *
 * NEGATIVE CONTROL: RUN 2026-09-25 by UI-108 against `civicos-ui/app.html`
 * `a0fb158f0e27a93afd18853e4bd4910c799579ff5120f209812c9552dd1bf993` (1,636,987 bytes), each arm ALONE by anchored
 * replacement asserted to match exactly once, restored from a per-arm pristine copy with sha256 AND `cmp` verified and
 * the byte count guarded, the file IDENTICAL to pristine at the end — **4/4 AS DECLARED**. BASELINE GREEN 27 / 0.
 *   (A) THE ROW'S ARM — `inst.findings` rendered WITHOUT the view (`progFindingDecisionHtml(f)` -> ""). DECLARED RED
 *       naming THE DECIDED-FINDING ARM, with THE PLANE'S VIEW, "the finding is STILL LISTED" and THE REFUSAL ARM
 *       green. -> RED, 7 of 27: the four DECIDED-FINDING ARM lines, arm 1's "says no member has decided it", and arm
 *       3's two decision lines. Every declared-green line green.
 *   (B) HIDE THE REFUSAL — `intentRefusalHtml(instRefusal)` -> "". DECLARED RED naming THE REFUSAL ARM, the
 *       DECIDED-FINDING ARM green. -> RED, 2 of 27: THE REFUSAL ARM's translation line and its code line.
 *   (C) OVER-STRICTNESS — the decision's lead sentence upper-cased inside `<em>`. DECLARED GREEN -> GREEN 27 / 0.
 * Re-runnable in one step: `node civicos-ui/test/progression-decided-finding.control.mjs`.
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
  bindings: { ADMIN_TOKEN: "adm-ui108", MEMBER_TOKEN: "mem-ui108", PROBE_TOKEN: "prb-ui108", VERSION: "test",
              INSTANCE_NAME: "fixture-group" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}${tok ? "&token=" + tok : ""}`, { method:"POST", body: JSON.stringify(body) })).json());
const get  = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:caps }, "adm-ui108");
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
let REFUSE_INSTANCE = false;   /* arm 4: the bridge asks the plane with a credential it refuses */
async function bridgeFetch(u, opts2){
  const url = new URL(u, "http://x");
  if(REFUSE_INSTANCE && url.searchParams.get("op") === "instance") url.searchParams.set("token", "not-a-credential-ui108");
  CALLED.push({ op:url.searchParams.get("op"), token:url.searchParams.get("token") });
  return mf.dispatchFetch(url.toString(), opts2);
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
  "PLANE","PROG","progLoad","esc","refusalWords",
].join(",") + "};", ctx);
const U = ctx.__U;
U.PLANE.token = IRIS;
U.PLANE.session = true;
U.PLANE.me = ME;

/* ============================================================
   FIXTURE: a grant flow whose `application` stage is missing, threaded through the award
   ============================================================ */
console.log("\n--- fixture: grant declared, a subject threaded at the award, the application missing ---");
const NOW = "2026-09-25T00:00:00Z";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "A grant document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const def1 = await post("progressiondefine", { progressionKey:"grant", label:"How a grant is supposed to go",
  stages:[{ key:"application", label:"the application", cardinality:"1", required:"usually" },
          { key:"award", label:"the award", after:"application", cardinality:"1", required:"always" }] }, IRIS);
ok("the flow is declared at version 1", def1 && def1.ok !== false);
const eG = await post("entitycreate", { kind:"fund", label:"Grant G", aliases:["fund:G"] }, IRIS);
const gAward = sha("ui108-G-award");
{
  const id = "INFO-2026-0001-ui108", md = bundleMd(id);
  const prov = JSON.stringify({ documents: [{ capture:{ sha256:gAward, encoding:"binary", bytes:10 },
    reading:{ content_type:"meeting_calendar", reader_version:1, found:true, at:NOW,
              entities:[{ ref:"fund:G", kind:"fund", key:"G", label:"Grant G" }] } }] });
  const pr = await post("promote", { bundleId:id, base:null, snapKey:"20260925T010000Z_dddd4444", author:"ui108",
    meta:{ object_type:"information", group:"believe-in-oakland", title:`Doc ${id}`,
           current_state:"collected", created:NOW, last_updated:NOW },
    files:[{ path:"bundle.md", text:md, bytes:md.length, sha256:sha(md) },
           { path:"data/provenance.json", text:prov, bytes:prov.length, sha256:sha(prov) }], register:[] }, IRIS);
  ok("a real captured document is on the record for the flow to be threaded with", pr && pr.ok !== false);
}
await post("resolve", { captureSha:gAward }, IRIS);
const th = await post("thread", { progressionKey:"grant", entityId:eG.entity_id,
  placements:[{ stage:"award", captureSha:gAward }] }, IRIS);
ok("the award is threaded, so the application stage before it is a missing predecessor", th && th.ok !== false);

const openPage = async () => {
  $$("#pg-look-key").value = "grant";
  $$("#pg-look-subj").value = "fund:G";
  await U.progLoad();
  return html("#pg-inst");
};

/* ============================================================
   1. before any decision: listed, and said to be undecided
   ============================================================ */
console.log("\n--- 1. before any decision ---");
const i0 = await get("instance", `key=grant&id=${encodeURIComponent(eG.entity_id)}`, IRIS);
const f0 = (i0.findings || []).find(f => f.stage_key === "application");
console.log(`  CORPUS: op=instance lists ${(i0.findings||[]).length} finding(s); finding_count ${i0.finding_count}, open_finding_count ${i0.open_finding_count}`);
ok("THE PLANE'S VIEW, BY NAME (D-552): the application finding carries `disposition: null` and is counted open",
   !!f0 && Object.prototype.hasOwnProperty.call(f0, "disposition") && f0.disposition === null
   && i0.finding_count === 1 && i0.open_finding_count === 1);
const p0 = await openPage();
const b0 = findingBlock(p0, "application");
ok("the page is painted and the finding is listed with the plane's own words for it",
   p0.length > 500 && b0.length > 0 && b0.includes(U.esc(f0 ? f0.detail : "\u0000")));
ok("and says no member has decided it", says(b0, /no member has decided this finding/i));
ok("and no decision is painted for it", !/data-decided-finding=/.test(p0));
ok("the read is the plane's op=instance, carrying the member's session",
   CALLED.some(c => c.op === "instance" && c.token === IRIS));

/* ============================================================
   2. THE DECIDED-FINDING ARM
   ============================================================ */
console.log("\n--- 2. IRIS dismisses the finding: it stays listed, and its decision renders beside it ---");
await sleep(5);
const REASON = "This fund took applications by telephone that year, so there is no document to find.";
const disp = await post("proposedispose", { key:"grant::application", to:"dismissed", definitionVersion:1, reason:REASON }, IRIS);
ok("the decision is recorded against version 1", disp && disp.ok !== false && disp.definition_version === 1);
const i1 = await get("instance", `key=grant&id=${encodeURIComponent(eG.entity_id)}`, IRIS);
const d1 = ((i1.findings || []).find(f => f.stage_key === "application") || {}).disposition || null;
console.log(`  PLANE: disposition ${JSON.stringify(d1)}; finding_count ${i1.finding_count}, open_finding_count ${i1.open_finding_count}`);
ok("the plane still lists the finding and publishes the decision on it, applying",
   i1.finding_count === 1 && i1.open_finding_count === 0 && d1 && d1.state === "dismissed" && d1.applies === true);
const p1 = await openPage();
const b1 = findingBlock(p1, "application");
ok("the finding is STILL LISTED on the page, in the plane's own words for it",
   b1.length > 0 && b1.includes(U.esc(f0 ? f0.detail : "\u0000")));
ok("THE DECIDED-FINDING ARM: a dismissed finding renders its decision BESIDE it — inside the finding's own block",
   /data-decided-finding="application"/.test(b1) && says(b1, /a member decided this finding/i));
ok("THE DECIDED-FINDING ARM: the decision's state, its author and its instant, all the record's",
   says(b1, new RegExp(`set aside as dismissed by ${d1 && d1.decided_by} on ${d1 && String(d1.at).slice(0, 10)}`, "i")));
ok("THE DECIDED-FINDING ARM: the member's reason, verbatim", b1.includes(U.esc(REASON)));
ok("THE DECIDED-FINDING ARM: which version of the declared flow it judged, and that it still stands",
   says(b1, /it judged version 1 of the declared flow/i) && says(b1, /still the one standing/i));
ok("and it is no longer called undecided", !says(b1, /no member has decided this finding/i));
ok("the record's own count is said: one finding, none open, one answered by a standing decision",
   says(p1, /lists 1 finding on this chain; 0 are still open, and 1 is answered by a member's decision that still stands/i));

/* ============================================================
   3. after a revision: still listed, still decided, no longer standing
   ============================================================ */
console.log("\n--- 3. the flow is revised: the decision is kept beside the finding, and stops answering ---");
await sleep(5);
const def2 = await post("progressiondefine", { progressionKey:"grant", label:"How a grant is supposed to go",
  stages:[{ key:"application", label:"the written application", cardinality:"1", required:"usually" },
          { key:"award", label:"the award", after:"application", cardinality:"1", required:"always" }],
  basis:"The fund now takes written applications only.", citation:"Fund guidelines 2026" }, IRIS);
ok("the flow is at version 2", def2 && def2.version === 2);
const p2 = await openPage();
const b2 = findingBlock(p2, "application");
ok("the finding is still listed", b2.length > 0);
ok("and still carries the decision beside it, with the member's reason",
   /data-decided-finding="application"/.test(b2) && b2.includes(U.esc(REASON)));
ok("which now says it no longer answers the question — the finding is open again, the decision its history",
   says(b2, /it judged version 1 of the declared flow/i) && says(b2, /no longer answers the question/i)
   && !says(b2, /still the one standing/i));
ok("and the count says it is open again", says(p2, /1 is still open, and 0 are answered/i));

/* ============================================================
   4. a refused read: the plane's canned words, and no empty chain claimed
   ============================================================ */
console.log("\n--- 4. op=instance refused: the plane's canned translation, and no stage claims to be empty ---");
const refused = await (await mf.dispatchFetch(
  `http://x/api/?op=instance&token=not-a-credential-ui108&key=grant&id=${encodeURIComponent(eG.entity_id)}`)).json();
const words = U.refusalWords(refused);
console.log(`  PLANE: refused ${JSON.stringify({ ok:refused.ok, reason:refused.reason, translation:refused.translation })}`);
ok("the plane refuses the read with a code and a canned translation (DEC-49)",
   refused && refused.ok === false && typeof refused.reason === "string"
   && typeof refused.translation === "string" && refused.translation.length > 0 && words === refused.translation);
REFUSE_INSTANCE = true;
const p3 = await openPage();
REFUSE_INSTANCE = false;
ok("THE REFUSAL ARM: the page renders the plane's canned translation, word for word", p3.includes(U.esc(words)));
ok("and the plane's code beside it", p3.includes(U.esc(refused.reason)));
ok("and no stage claims `nothing on the record` for a read that never happened", !says(p3, /nothing on the record/i)
   && says(p3, /not read: the record did not answer for this chain/i));

await mf.dispose();
if(fails.length){ console.error(`progression-decided-finding: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`progression-decided-finding: ${n} assertions, all green — on the progression page a finding a member decided stays listed and carries the decision beside it (state, author, instant, reason, the version it judged and whether it still stands), an undecided one says so, and a refused read renders the plane's canned words rather than an empty chain`);
process.exit(0);
