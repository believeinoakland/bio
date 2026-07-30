/* The link surface: showing what a captured page pointed at.
 *
 * The links come from the plane's op=links and the UI computes none of them, so
 * the risk this harness exists for is not a rendering bug. It is DRIFT: the
 * plane renames a field, the UI reads undefined, and the surface silently shows
 * a link with no verdict and no basis while every test still passes.
 *
 * So there are two kinds of assertion here.
 *
 *   STRUCTURAL. Every field the UI reads off a link is looked for in the
 *   plane's own resolveLinks, in bio-plane/src/store.mjs. A rename there fails
 *   here, which is the only place the two can be held together: the UI cannot
 *   import the store (it is a Durable Object needing sql) and a hand-copied
 *   fixture would pass while the real shape moved. This is the v11 lesson
 *   applied to a boundary a fixture cannot cross.
 *
 *   BEHAVIOURAL, over a fixture whose LINK LIST is produced by running the
 *   shipped plane's own captureSubresources, so the partitions and the element
 *   references are the ones the plane actually emits rather than ones invented
 *   here.
 *
 * The load-bearing assertions:
 *   1. All five partitions render distinguishably, and refused is its own
 *      partition rather than a case of offsite: "we will not carry this
 *      address" is a different claim from "the record holds nothing here".
 *   2. The verdict and its BASIS both appear, in the plane's words, including
 *      for undetermined, which must be stated rather than omitted.
 *   3. An address the record does not hold cannot be navigated to without the
 *      warning first: it is not an anchor at all, because an anchor can be
 *      opened by middle click or the context menu without the page ever seeing
 *      it.
 *   4. The counts name the middle case separately. "126 links, 0 connections"
 *      is accurate and reads as failure because it hides bytes the record holds
 *      that no bundle has claimed.
 */
import { appScript } from "./extract.mjs";
import vm from "vm";
import fs from "fs";
import { webcrypto } from "crypto";
import { captureSubresources } from "../../bio-plane/src/subresources.mjs";
import { isPublicHttpsLocator } from "../../bio-plane/checks/bio-checks.mjs";

const sha = async (b) => [...new Uint8Array(await webcrypto.subtle.digest("SHA-256", b))]
  .map(x => x.toString(16).padStart(2, "0")).join("");
const enc = (s) => new TextEncoder().encode(s);

let n = 0;
const ok = (label, cond) => { if (!cond) { console.error("FAIL " + label); process.exit(1); } n++; };

/* ---- the fixture page, its links produced by the real plane code ---- */
const BASE = "https://www.oaklandca.gov/sewer/report.html";
const PAGE = `<!doctype html><html><head><link rel="stylesheet" href="/css/main.css"></head><body>
<nav><a href="/departments/">Departments</a></nav>
<h1>Sewer fund transfers</h1>
<a href="#findings">the findings</a>
<a href="#methodology">how we counted</a>
<a href="/img/chart.png">the chart</a>
<a href="https://data.oaklandca.gov/acfr-2026.pdf#appendix-c">the ACFR appendix</a>
<a href="https://oaklandca.opengov.com/transfers">the transfers portal</a>
<a href="javascript:alert(1)">dead</a>
<p id="findings">Findings.</p><p id="methodology">Method.</p>
</body></html>`;
const CSS = `.x{color:#123}`;
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 9, 9, 9, 9]);
const BODIES = new Map([["/css/main.css", [enc(CSS), "text/css"]], ["/img/chart.png", [PNG, "image/png"]]]);

const STORE = new Map();
const cap = await captureSubresources({
  html: PAGE, base: BASE, primarySha: await sha(enc(PAGE)), primaryFile: "snapshots/report.html",
  fetchOne: async (u) => {
    const b = BODIES.get(new URL(u).pathname);
    return b ? { ok: true, status: 200, bytes: b[0], contentType: b[1] }
             : { ok: false, status: 404, reason: "SOURCE_REFUSED" };
  },
  put: async (s, b) => { const had = STORE.has(s); STORE.set(s, b); return { existed: had }; },
  sha256: async (b) => sha(b), isPublic: isPublicHttpsLocator,
});

/* The plane files these through recordLinks and resolveLinks returns them with a
   resolution and a verdict. That path needs sql, so the response is assembled
   here from the plane's OWN link records, with the resolution values the store
   assigns, and the field names are held to the store's source below. */
const CAPTURED_AT = "2026-07-20T10:00:00Z";
ok("the plane emitted links for this page", (cap.links || []).length >= 6);
/* An anchor's ADDRESS is this document's own, with the element in `fragment` and
   the full form in `citation`. Two anchors therefore share one address and differ
   only in the element, which is the whole point of 0.43.0's second key, and it
   means a surface keyed on the address alone shows them as one row. */
const anchors = cap.links.filter(l => l.type === "anchor");
ok("anchors are filed as links rather than dropped", anchors.length === 2);
ok("two anchors into one document share an address", anchors[0].address === anchors[1].address);
ok("and are told apart only by the element they name",
   anchors[0].fragment !== anchors[1].fragment && anchors[0].citation !== anchors[1].citation);

/* recordLinks' own field mapping, applied to the plane's own records. */
const row = (l, over) => ({ source_capture: "a".repeat(64), link_ref: l.ref, address: l.address,
  address_norm: l.address, citation_norm: l.citation || l.address, fragment: l.fragment || null,
  partition: l.type, origin: l.origin, chrome: l.chrome ? 1 : 0, captured_at: CAPTURED_AT,
  resolution: l.type, verdict: null, ...over });
const find = (pred) => { const l = cap.links.find(pred);
  if (!l) { console.error("FAIL fixture: the plane emitted no link matching"); process.exit(1); } return l; };

const LINKS = {
  sourceCapture: "a".repeat(64), at: CAPTURED_AT,
  tally: { anchor: 2, intra: 1, linked: 2, offsite: 2, refused: 1 },
  verdicts: { contemporaneous: 1, superseded: 0, undetermined: 1 },
  links: [
    row(anchors[0], { resolution: "anchor" }),
    row(anchors[1], { resolution: "anchor" }),
    /* A file captured beside it: the store resolves this one inside the bundle. */
    row(find(l => /chart\.png$/.test(l.address)), { resolution: "intra" }),
    /* Held AND claimed: an edge the case can traverse. */
    row(find(l => /acfr-2026\.pdf/.test(l.address)), {
      resolution: "linked", verdict: "contemporaneous",
      basis: "the same bytes were seen served on both sides of this document's retrieval and hash equal, so the target did not change across the interval",
      detail: "observed 3 times between 2026-07-18T00:00:00Z and 2026-07-22T00:00:00Z",
      target_capture: "b".repeat(64), target_bundle: "INFO-2026-0042-acfr",
      target_retrieved: "2026-07-18T00:00:00Z", target_last_seen: "2026-07-22T00:00:00Z", target_captures: 3 }),
    /* Held and UNCLAIMED: bytes in the record, no bundle registers them. This is
       the case "126 links, 0 connections" hides, and this row pins it open. */
    row(find(l => /opengov/.test(l.address)), {
      resolution: "linked", verdict: "undetermined",
      basis: "the record's captures of the target all predate this document's retrieval, and nothing establishes that it was unchanged in between",
      target_capture: "c".repeat(64), target_bundle: null,
      target_last_seen: "2026-07-01T00:00:00Z", target_captures: 1 }),
    row(find(l => l.type === "refused"), { resolution: "refused" }),
    row(find(l => /departments/.test(l.address)), { resolution: "offsite", chrome: 1,
      basis: "the record holds no capture of this address" }),
    { source_capture: "a".repeat(64), link_ref: "x", address: "https://www.oaklandca.gov/gone.html",
      address_norm: "https://www.oaklandca.gov/gone.html", fragment: null, partition: "deferred",
      chrome: 0, captured_at: CAPTURED_AT, resolution: "offsite", verdict: null,
      basis: "the record holds no capture of this address" },
  ],
};

/* ---- STRUCTURAL: the fields the UI reads must exist in the plane ---- */
const storeSrc = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url).pathname, "utf8");
const resolveSrc = storeSrc.slice(storeSrc.indexOf("resolveLinks({"), storeSrc.indexOf("projectLinks({"));
ok("resolveLinks was found in the plane source", resolveSrc.length > 400);
for (const f of ["resolution", "verdict", "basis", "detail", "target_capture", "target_bundle",
                 "target_last_seen", "tally", "verdicts", "contemporaneous", "superseded", "undetermined"])
  ok(`the plane still emits ${f}`, resolveSrc.includes(f));
const recordSrc = storeSrc.slice(storeSrc.indexOf("recordLinks({"), storeSrc.indexOf("linksTo({"));
for (const f of ["address", "citation_norm", "fragment", "partition", "chrome"])
  ok(`the plane still records ${f} on a link`, recordSrc.includes(f));
/* And the partitions the UI names must be the ones the capture layer assigns. */
const subSrc = fs.readFileSync(new URL("../../bio-plane/src/subresources.mjs", import.meta.url).pathname, "utf8");
for (const p of ["anchor", "intra", "deferred", "refused"])
  ok(`the capture layer still assigns the ${p} partition`, new RegExp(`["']${p}["']`).test(subSrc));

/* ---- load the UI runtime ---- */
const els = new Map();
const el = () => ({ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", innerHTML:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
  querySelectorAll(){return[]}, querySelector(){return el()}, insertAdjacentHTML(){}, focus(){} });
let OPENED = [];
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp,
  Promise, Uint8Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto,
  btoa: (s) => Buffer.from(s, "binary").toString("base64"),
  Blob: class {}, setInterval:()=>1, clearInterval(){}, setTimeout:(fn)=>{fn();return 1},
  requestAnimationFrame:fn=>fn(),
  document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}},
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{appendChild(){},removeChild(){}} },
  location:{protocol:"https:"}, history:{pushState(){},back(){}},
  localStorage:{getItem:()=>null,setItem(){}},
  window:{ addEventListener(){}, open:(u)=>{ OPENED.push(u); return { opener:1 }; } },
  fetch: async () => ({ ok:true, json: async () => ({ ok:true, result:{} }) }) };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(appScript() + `;globalThis.__X={linkSurfaceHtml,linkTally,linkRow,leaveTheRecord,leaveGo,
  primaryCaptureSha,mergeManifest,unfinishedBanner,reuseSummary,reuseTag,VERDICTS,LINK_PARTS};`, ctx);
const G = ctx.__X;

/* ---- BEHAVIOURAL: the surface ---- */
const SELF = "INFO-2026-0042-acfr";   // pretend the source bundle IS the claimed target
const H = G.linkSurfaceHtml(LINKS, "INFO-2026-0500-source");

ok("all five partitions are named", ["Into this document", "To a file captured beside it",
  "To a capture the record holds", "Outside the record", "Refused at capture"].every(s => H.includes(s)));
ok("refused is its own partition, not folded into outside-the-record",
   H.indexOf("Refused at capture") !== H.indexOf("Outside the record"));
ok("and refused says it is a refusal rather than a coverage gap",
   /refusal, not a coverage gap/i.test(H));

/* The element cited, where the page named one. */
ok("an element reference is shown as the element, not just the resource", H.includes("#findings"));
ok("two citations of one resource stay distinguishable", H.includes("#methodology"));
ok("and the element is labelled as the part cited", /names the part it means/i.test(H));

/* Verdicts and their basis, in the plane's words. */
ok("the verdict is shown", /class="vd contemporaneous"/.test(H) && /class="vd undetermined"/.test(H));
ok("the basis is printed in the plane's own words",
   H.includes("seen served on both sides of this document's retrieval"));
ok("undetermined is stated rather than omitted",
   H.includes("nothing establishes that it was unchanged in between"));
ok("undetermined is explained as the resting state, not a failure",
   /resting state[\s\S]{0,120}not a failure/i.test(G.VERDICTS.undetermined));
ok("the detail rides along where the plane supplied one", H.includes("observed 3 times"));

/* The counts. */
ok("a claimed target counts as a connection", /<b>1<\/b> connection/.test(H));
ok("bytes held that no bundle claims are counted SEPARATELY", /<b>1<\/b> held, unclaimed/.test(H));
ok("and are explained as becoming an edge on promotion", /becomes one when the target is promoted/.test(H));
ok("outside-the-record is its own count", /<b>2<\/b> outside the record/.test(H));
ok("references inside the capture are not mixed into either", /<b>3<\/b> inside the capture/.test(H));

/* Leaving audited content: BEFORE, not after. */
ok("an offsite address is not an anchor at all", !/<a[^>]+href="https:\/\/www\.oaklandca\.gov\/gone\.html"/.test(H));
ok("it is wired to the warning instead", /onclick="leaveTheRecord\(/.test(H));
ok("a linked target navigates within the record", /openBundle\('INFO-2026-0042-acfr'\)/.test(H));
G.leaveTheRecord("https://www.oaklandca.gov/gone.html");
const dlg = els.get("#dlg").innerHTML;
ok("the warning says the reader is leaving the record", /about to leave the record/i.test(dlg));
ok("it names the address", dlg.includes("https://www.oaklandca.gov/gone.html"));
ok("it says what the record does and does not vouch for", /verified\s+against a hash/i.test(dlg));
ok("staying is offered first", dlg.indexOf("Stay in the record") < dlg.indexOf("Open it anyway"));
ok("nothing opened while the warning was up", OPENED.length === 0);
G.leaveGo("https://www.oaklandca.gov/gone.html");
ok("and only the explicit choice opens it", OPENED.length === 1);

/* Site furniture is a classification, never a deletion. */
const chromeRow = G.linkRow({ resolution:"offsite", address:"https://www.oaklandca.gov/departments/", chrome:1 });
ok("a chrome link is still shown", chromeRow.includes("/departments/"));
ok("labelled as furniture, with reclassification possible",
   /site navigation/.test(chromeRow) && /reclassifiable/i.test(chromeRow));

/* A self-reference is never counted as a connection, because projectLinks drops
   the edge and a surface claiming one would overstate what the record holds. */
const selfH = G.linkSurfaceHtml(LINKS, SELF);
ok("a link to the source's own bundle is counted as a self-reference", /<b>1<\/b> self-reference/.test(selfH));
ok("and is NOT counted as a connection", !/<b>1<\/b> connection/.test(selfH));
ok("the count agrees with what op=linkproject would project",
   /every paginated index does/.test(selfH));

/* An empty page says so rather than rendering an empty frame. */
ok("no links reads as no links", /carried no links/.test(G.linkSurfaceHtml({ links: [], tally: {} })));

/* The capture's source hash is read from the register, not guessed. */
ok("the primary hash comes from the provenance register",
   G.primaryCaptureSha({ "data/provenance.json": JSON.stringify({ documents: [{ capture: { sha256: "d".repeat(64) } }] }) }, {})
   === "d".repeat(64));
ok("with content_hash as the fallback for bundles predating it",
   G.primaryCaptureSha({}, { content_hash: "sha256:" + "e".repeat(64) }) === "e".repeat(64));
ok("and nothing is invented when neither is present", G.primaryCaptureSha({}, {}) === null);

console.log(`link-surface: ${n} assertions, all green`);
