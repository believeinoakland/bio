/* UI-109 — A REOPENED FINDING ON THE QUEUE SHOWS THE DECISION SOMEBODY ALREADY TOOK ON IT.
 * AGAINST THE REAL PLANE, THROUGH THE SURFACE'S OWN HANDLERS.
 *
 * THE DESIGN (`BIO_Content_Framework_v0_10.md` §8.2, "The declared flow, and its revisions"; REC-184 and
 * D-527 on the plane). A decision setting a finding aside judges the version of the declared flow it was
 * taken against. After a revision the finding is OPEN again, and since D-527 `op=queue`'s FINDING item
 * carries the earlier decision as `prior_disposition` — `null` where nobody has ever decided.
 *
 * THE MEASURED FAILURE THIS MOVES: before UI-109 no surface read `prior_disposition`, so the reopened
 * question was painted on the queue as one nobody had answered while the record held a decision.
 *
 * THE INSTRUMENT is `declared-flow-surface.test.mjs`'s: the real plane in miniflare, a ProbeStore adding
 * ONE raw-SQL route (only so arm 4 can make the pre-REC-184 row the way `proposedispose.test.mjs` makes
 * it), every act and read through the control plane, `app.html`'s own `renderQueue` driven with a real
 * enrolled member's session.
 *
 * THE ARMS:
 *   1. while the decision governs, the finding is off the open list — no item, so no prior line;
 *   2. after a revision the item is back and SAYS the earlier decision: who decided, as what, when, their
 *      reason, the version it judged, the version standing now, that it no longer answers the question,
 *      and the plane's own `applies_because` code verbatim — every fact equal to the item's own
 *      `prior_disposition`, read from the same feed; and it SAYS that who revised the flow is not on the
 *      item rather than naming anybody;
 *   3. a finding nobody has decided (`prior_disposition: null`) says so, and claims no earlier decision;
 *   4. a decision taken before the record kept the version reads `not recorded` IN WORDS on the item,
 *      with no number invented, and the plane's `version_not_recorded_…` code verbatim.
 *
 * WHAT THIS SUITE CANNOT SEE: it drives `civicos-ui/app.html` only; it asserts what the painted HTML
 * SAYS, not how it looks; and `prior_disposition.applies === true` cannot be produced through the plane
 * (a decision that still governs ages its finding out of the feed), so that branch of the render is
 * exercised by no arm here.
 *
 * GATE: reads bio-plane/src/ bio-plane/checks/bio-checks.mjs docprofile/
 *   (the same declaration as `declared-flow-surface.test.mjs`, for the same reason: the probe SCRIPT's
 *   imports live in a template literal and its `scriptPath` names no file on disk, so the plane it runs
 *   is invisible to `mention`'s derivation.)
 *
 * NEGATIVE CONTROL: RUN 2026-09-25 by UI-109 against `civicos-ui/app.html`
 * `4496bd0cc5042e2f0b9c7547da31441e61ae3a784c80bf66db46670969e16f65` (1,621,458 bytes), driven by
 * `node civicos-ui/test/reopened-finding.control.mjs`, each arm ALONE by one anchored replacement asserted
 * to match exactly once, restored from a per-arm pristine copy verified by sha256 AND `cmp` — **4/4 AS
 * DECLARED**. BASELINE GREEN 26 asserted / 0 failed.
 *   (A) THE ROW'S ARM — omit `prior_disposition` from the render (`queueItemHtml`'s call to
 *       `queueFindingPriorHtml` removed). DECLARED RED naming "THE ROW: the reopened item says somebody
 *       already decided", every FIXTURE assertion green -> RED, 12 of 26, named; the FIXTURE assertions
 *       (the plane's own publication) all green, so the arm is the render's and not the plane's.
 *   (B) hide `not recorded` on the ITEM only. DECLARED RED naming "THE ROW, ON THE ITEM", arm 2 green ->
 *       RED, 1 of 26, exactly that line. ITS FIRST RUN DID NOT ARM: the bare sentence matched TWICE, being
 *       then word for word `disposedFlowVersionHtml`'s (UI-99) — which also meant UI-99's own control, which
 *       takes the sentence's first occurrence, would have armed this function instead of its own. The item's
 *       sentence was reworded and this arm anchored on the whole function.
 *   (C) OVER-STRICTNESS — the function's bold literal words upper-cased inside `<em>`. DECLARED GREEN ->
 *       GREEN 26 / 0. ITS FIRST RUN printed NO tally: the rewrite had upper-cased an interpolation
 *       (`${esc(...)}` -> `${ESC(...)}`), a ReferenceError, i.e. the arm moved a second variable; it now
 *       touches literal words only.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard its output. */
import vm from "vm";
import { webcrypto, createHash } from "crypto";
import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* WHAT A MEMBER READS: tags stripped, entities opened, whitespace collapsed, matched case-insensitively. */
const text = (h) => String(h||"")
  .replace(/<[^>]*>/g, " ")
  .replace(/&mdash;/g, "—").replace(/&rsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"')
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/\s+/g, " ").trim();
const says = (h, re) => re.test(text(h));
const saysLit = (h, s) => text(h).toLowerCase().includes(String(s).toLowerCase());

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("reopened-finding: the real plane could not be started — run `npm ci` in bio-plane/.");
  console.error("  " + String(e && e.message || e));
  process.exit(1);
}
const PROBE = `
import worker from "./index.mjs";
import { Store } from "./store.mjs";
export class ProbeStore extends Store {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/rawsql") {
      const { sql, args = [] } = await req.json();
      try { return Response.json({ ok: true, rows: [...this.sql.exec(sql, ...args)] }); }
      catch (e) { return Response.json({ ok: false, error: String(e && e.message || e) }); }
    }
    return super.fetch(req);
  }
}
export default worker;
`;
const opts = (version) => ({
  modules: true, script: PROBE, modulesRoot: "/",
  scriptPath: fileURLToPath(new URL("../../bio-plane/src/ui109-reopened-probe.mjs", import.meta.url)),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui109", MEMBER_TOKEN: "mem-ui109", PROBE_TOKEN: "prb-ui109", VERSION: version,
              INSTANCE_NAME: "fixture-group" },
});
const mf = new Miniflare(opts("test"));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}${tok ? "&token=" + tok : ""}`, { method:"POST", body: JSON.stringify(body) })).json());
const get  = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const raw = async (sql) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return (await ns.get(ns.idFromName("bio")).fetch("http://x/rawsql",
    { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ sql }) })).json();
};
const cols = async () => ((await raw("PRAGMA table_info(proposal_dispositions)")).rows || []).map(r=>r.name);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:caps }, "adm-ui109");
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

/* ---- the DOM stub and the bridge ---- */
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
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
  IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1},
  requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:(u, o) => mf.dispatchFetch(new URL(u, "http://x").toString(), o) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {PLANE,renderQueue,esc};", ctx);
const U = ctx.__U;
U.PLANE.token = IRIS; U.PLANE.session = true; U.PLANE.me = ME;

/* ONE item's painted article, cut out of the queue by its own id, so an assertion about the reopened
   item can never be satisfied by the set-aside block or by a neighbouring item. */
const itemOf = (q, id) => {
  const at = q.indexOf(`data-id="${id}"`);
  if(at < 0) return null;
  const start = q.lastIndexOf("<article", at);
  const end = q.indexOf("</article>", at);
  return (start < 0 || end < 0) ? null : q.slice(start, end + "</article>".length);
};
const feedItem = (feed, id) => (Array.isArray(feed && feed.items) ? feed.items : []).find(i => i && i.id === id) || null;

/* ============================================================
   FIXTURE: two declared flows, each with a required stage missing
   ============================================================ */
console.log("\n--- fixture: grant (to be decided, revised, reopened) and permit (never decided) ---");
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
  "## Summary", "", "A document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
async function placed(progressionKey, stage, entityRef, entityKind, entityLabel, seq){
  const e = await post("entitycreate", { kind:entityKind, label:entityLabel, aliases:[entityRef] }, IRIS);
  const cap = sha(`ui109-${progressionKey}-${stage}`);
  const id = `INFO-2026-000${seq}-ui109`, md = bundleMd(id);
  const prov = JSON.stringify({ documents: [{ capture:{ sha256:cap, encoding:"binary", bytes:10 },
    reading:{ content_type:"meeting_calendar", reader_version:1, found:true, at:NOW,
              entities:[{ ref:entityRef, kind:entityKind, key:entityRef.split(":")[1], label:entityLabel }] } }] });
  const pr = await post("promote", { bundleId:id, base:null, snapKey:`20260925T01000${seq}Z_dddd444${seq}`, author:"ui109",
    meta:{ object_type:"information", group:"believe-in-oakland", title:`Doc ${id}`,
           current_state:"collected", created:NOW, last_updated:NOW },
    files:[{ path:"bundle.md", text:md, bytes:md.length, sha256:sha(md) },
           { path:"data/provenance.json", text:prov, bytes:prov.length, sha256:sha(prov) }], register:[] }, IRIS);
  await post("resolve", { captureSha:cap }, IRIS);
  const th = await post("thread", { progressionKey, entityId:e.entity_id, placements:[{ stage, captureSha:cap }] }, IRIS);
  return pr && pr.ok !== false && th && th.ok !== false;
}
await post("progressiondefine", { progressionKey:"grant", label:"How a grant is supposed to go",
  stages:[{ key:"application", label:"the application", cardinality:"1", required:"usually" },
          { key:"award", label:"the award", after:"application", cardinality:"1", required:"always" }] }, IRIS);
await post("progressiondefine", { progressionKey:"permit", label:"How a permit is supposed to go",
  stages:[{ key:"filing", label:"the filing", cardinality:"1", required:"always" },
          { key:"issue", label:"the issuance", after:"filing", cardinality:"1", required:"always" }] }, IRIS);
ok("a grant document is placed at the award, with no application before it",
   await placed("grant", "award", "fund:G", "fund", "Grant G", 1));
ok("a permit document is placed at the issuance, with no filing before it",
   await placed("permit", "issue", "contract:P", "contract", "Contract P", 2));
await sleep(5);   /* the decision's instant is strictly after the declaration's (REC-184's order rule) */
const REASON = "This fund took applications by telephone that year, so there is no document to find.";
const disp = await post("proposedispose", { key:"grant::application", to:"dismissed", definitionVersion:1, reason:REASON }, IRIS);
ok("the member's decision is recorded against version 1", disp && disp.ok !== false && disp.definition_version === 1);

const GRANT = "FINDING::grant::application", PERMIT = "FINDING::permit::filing";

/* ============================================================
   1. while the decision governs, the finding is off the open list
   ============================================================ */
console.log("\n--- 1. the decision governs: no open item for it ---");
await U.renderQueue();
const q1 = html("#q");
const f1 = await get("queue", "limit=500", IRIS);
ok("the plane publishes no open grant item while the decision governs", feedItem(f1, GRANT) === null);
ok("and the page paints none", itemOf(q1, GRANT) === null && !/data-prior="grant::application"/.test(q1));

/* ============================================================
   2. the flow is revised: the reopened item says the earlier decision
   ============================================================ */
console.log("\n--- 2. revised: the reopened item carries its earlier decision ---");
await sleep(5);
const v2 = await post("progressiondefine", { progressionKey:"grant", label:"How a grant is supposed to go",
  stages:[{ key:"application", label:"the written application", cardinality:"1", required:"usually" },
          { key:"award", label:"the award", after:"application", cardinality:"1", required:"always" }],
  basis:"The fund now takes written applications only.", citation:"Fund guidelines 2026" }, IRIS);
ok("the flow is at version 2", v2 && v2.version === 2);
await U.renderQueue();
const q2 = html("#q");
const f2 = await get("queue", "limit=500", IRIS);
const it2 = feedItem(f2, GRANT);
const p = it2 && it2.prior_disposition;
/* THE CORPUS, PRINTED AND FLOORED: the subject must be on the feed, non-null, before any render
   assertion can mean anything. */
console.log(`  CORPUS: queue ${q2.length} bytes; feed items ${(f2.items||[]).length}; grant item `
  + `${it2 ? "present" : "absent"}; its prior_disposition ${JSON.stringify(p)}`);
ok("FIXTURE: the plane reopened the grant finding and published its earlier decision on the item (D-527)",
   !!p && p.state === "dismissed" && p.applies === false && p.definition_version === 1
   && it2.subject && it2.subject.definition_version === 2);
const a2 = itemOf(q2, GRANT) || "";
ok("the reopened item is painted", a2.length > 200);
ok("THE ROW: the reopened item says somebody already decided this question — not one nobody has answered",
   /data-prior="grant::application"/.test(a2) && says(a2, /somebody already decided this question once/i));
ok("DEC-8: who decided, as what and when — the record's words, equal to the item's own prior_disposition",
   saysLit(a2, `set aside as ${p && p.state} by ${p && p.decided_by} on ${p && p.at}`));
ok("the member's reason, verbatim", a2.includes(U.esc(REASON)));
ok("the version the decision judged, and the version standing now — both the plane's numbers",
   says(a2, /it judged version 1 of the declared flow/i) && says(a2, /the flow stands at version 2 now/i));
ok("whether it still applies: it no longer answers the question, and is kept",
   says(a2, /that decision no longer answers the question/i) && says(a2, /kept, never deleted/i));
ok("the plane's own reason code, verbatim", p && typeof p.applies_because === "string"
   && a2.includes(`<code>${U.esc(p.applies_because)}</code>`) && says(a2, /revised since that decision/i));
ok("who REVISED the flow is not on the item, and the page says so rather than naming anybody",
   says(a2, /who revised the flow and so reopened the question is not on this item/i));
ok("and it names the set-aside block's row as the same decision, not a second one",
   says(a2, /same decision listed among what the record holds as set aside/i));

/* ============================================================
   3. a finding nobody has decided says so
   ============================================================ */
console.log("\n--- 3. never decided: prior_disposition null ---");
const itP = feedItem(f2, PERMIT);
ok("FIXTURE: the permit finding is open and its prior_disposition is null — present, not absent",
   !!itP && Object.prototype.hasOwnProperty.call(itP, "prior_disposition") && itP.prior_disposition === null);
const aP = itemOf(q2, PERMIT) || "";
ok("the never-decided item says nobody has decided it before", aP.length > 200
   && says(aP, /nobody has decided this question before/i));
ok("and claims no earlier decision", !says(aP, /already decided/i) && !/data-prior="permit::filing"/.test(aP));

/* ============================================================
   4. a decision taken before the record kept the version
   ============================================================ */
console.log("\n--- 4. the pre-REC-184 row: `not recorded` on the item, in words ---");
const drop = await raw("ALTER TABLE proposal_dispositions DROP COLUMN definition_version");
ok("ARMED — the column is dropped and the decision's row is kept",
   drop && drop.ok === true && !(await cols()).includes("definition_version")
   && ((await raw("SELECT count(*) AS c FROM proposal_dispositions")).rows || [])[0]?.c === 1);
await mf.setOptions(opts("test-reboot"));
await U.renderQueue();
const q4 = html("#q");
const f4 = await get("queue", "limit=500", IRIS);
const p4 = (feedItem(f4, GRANT) || {}).prior_disposition;
console.log(`  CORPUS: grant item's prior_disposition after the reboot ${JSON.stringify(p4)}`);
ok("FIXTURE: the plane publishes the old decision with its version `not recorded`",
   !!p4 && p4.definition_version == null && p4.definition_version_state === "not recorded");
const a4 = itemOf(q4, GRANT) || "";
ok("the reopened item still says the earlier decision", says(a4, /somebody already decided this question once/i));
ok("THE ROW, ON THE ITEM: which version it judged reads `not recorded`, IN WORDS",
   says(a4, /which version of the declared flow that decision judged is not recorded/i));
ok("no version number is invented for the decision", !says(a4, /it judged version \d/i));
ok("the plane's own code for why, verbatim", a4.includes(`<code>${U.esc(String(p4 && p4.applies_because))}</code>`));

await mf.dispose();
if(fails.length){ console.error(`reopened-finding: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`reopened-finding: ${n} assertions, all green — a reopened finding on the queue says the decision somebody already took on it, in the record's words, which version it judged and that it no longer answers; a never-decided finding says so; and a decision older than the version column reads \`not recorded\``);
process.exit(0);
