/* Honesty about the capture itself: unfinished, reused, and continued.
 *
 * Both manifests here are produced by running the shipped plane's own
 * captureSubresources, one with a cap low enough that the run cannot finish and
 * one with a site-asset lookup that makes reuse happen, so the fields the
 * surfaces read are the fields the plane actually writes. A hand-built manifest
 * would let a rename in the plane pass silently, which is the v11 lesson.
 *
 * The load-bearing assertions:
 *   1. complete:false is SAID, with the outstanding count, and said as
 *      outstanding rather than failed: the source refused nothing and was never
 *      asked, and the difference matters because one is a coverage gap and the
 *      other is a runtime bound.
 *   2. A part with fetched_this_capture:false is distinguishable from one
 *      fetched during this capture, and names when the source was last seen
 *      serving those bytes. A reader must never believe a byte was checked
 *      against the source during this capture when it was not.
 *   3. RULED by Bob: continuing a capture refills the cache and does not rewrite
 *      what is already recorded. So the merge preserves prior entries with their
 *      original fetch facts, takes from the fresh run only what was outstanding,
 *      and REFUSES rather than reconciling when the host now serves different
 *      bytes for something already recorded.
 */
import { appScript } from "./extract.mjs";
import vm from "vm";
import { webcrypto } from "crypto";
import { captureSubresources } from "../../bio-plane/src/subresources.mjs";
import { isPublicHttpsLocator } from "../../bio-plane/checks/bio-checks.mjs";

const sha = async (b) => [...new Uint8Array(await webcrypto.subtle.digest("SHA-256", b))]
  .map(x => x.toString(16).padStart(2, "0")).join("");
const enc = (s) => new TextEncoder().encode(s);
let n = 0;
const ok = (label, cond) => { if (!cond) { console.error("FAIL " + label); process.exit(1); } n++; };

const BASE = "https://www.oaklandca.gov/sewer/index.html";
const PAGE = `<!doctype html><html><head>
<link rel="stylesheet" href="/css/site.css">
<link rel="stylesheet" href="/css/print.css">
</head><body><img src="/img/a.png"><img src="/img/b.png"><img src="/img/c.png"></body></html>`;
const PNG = (k) => new Uint8Array([0x89, 0x50, 0x4e, 0x47, k, k, k, k]);
const BODIES = new Map([
  ["/css/site.css", [enc(".a{color:#111}"), "text/css"]],
  ["/css/print.css", [enc(".p{color:#222}"), "text/css"]],
  ["/img/a.png", [PNG(1), "image/png"]],
  ["/img/b.png", [PNG(2), "image/png"]],
  ["/img/c.png", [PNG(3), "image/png"]],
]);
const run = (opts) => captureSubresources({
  html: PAGE, base: BASE, primarySha: "f".repeat(64), primaryFile: "snapshots/index.html",
  fetchOne: async (u) => {
    const b = BODIES.get(new URL(u).pathname);
    return b ? { ok: true, status: 200, bytes: b[0], contentType: b[1] }
             : { ok: false, status: 404, reason: "SOURCE_REFUSED" };
  },
  put: async () => ({ existed: false }), sha256: async (b) => sha(b), isPublic: isPublicHttpsLocator,
  ...opts,
});

/* ---- an UNFINISHED capture, made unfinished by the platform ceiling ---- */
const short = await run({ platformCeiling: 3, platformMargin: 0, subrequestsAlreadySpent: 1 });
ok("the plane produced an unfinished capture", short.manifest.complete === false);
ok("with an outstanding count", Number(short.manifest.outstanding) > 0);
const deferred = short.manifest.subresources.filter(s => s.reason === "DEFERRED");
ok("and the unfetched parts are marked DEFERRED, not failed", deferred.length > 0);

/* ---- a capture with REUSED parts, reused by the real decision ---- */
const cssSha = await sha(enc(".a{color:#111}"));
const KNOWN = { [`${BASE.replace(/\/sewer\/index\.html$/, "")}/css/site.css`]: {
  sha256: cssSha, bytes: 14, content_type: "text/css",
  last_fetched: new Date(Date.now() - 3600 * 1000).toISOString().split(".")[0] + "Z",
  stable_since: "2026-07-01T00:00:00Z", documents: 7 } };
const reused = await run({ siteLookup: async (norm) => KNOWN[norm] || null,
                           readBack: async () => ".a{color:#111}" });
const reusedParts = reused.manifest.subresources.filter(s => s.ok && s.fetched_this_capture === false);
ok("the plane reused a part it had seen this host serve", reusedParts.length === 1);
ok("recording that it was not fetched during this capture", reusedParts[0].fetched_this_capture === false);
ok("and when the source was last seen serving those bytes", !!reusedParts[0].reused_from_fetched_at);
ok("a freshly fetched part is not marked reused",
   reused.manifest.subresources.some(s => s.ok && s.fetched_this_capture === true));

/* ---- load the UI runtime ---- */
const els = new Map();
const el = () => ({ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", innerHTML:"", textContent:"", disabled:false, addEventListener(){},
  querySelectorAll(){return[]}, querySelector(){return el()}, insertAdjacentHTML(){}, focus(){} });
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp,
  Promise, Uint8Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto,
  btoa: (s) => Buffer.from(s, "binary").toString("base64"), Blob: class {},
  setInterval:()=>1, clearInterval(){}, setTimeout:(fn)=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
  document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}},
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{appendChild(){},removeChild(){}} },
  location:{protocol:"https:"}, history:{pushState(){},back(){}},
  localStorage:{getItem:()=>null,setItem(){}}, window:{addEventListener(){},open:()=>null},
  fetch: async () => ({ ok:true, json: async () => ({ ok:true, result:{} }) }) };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(appScript() + `;globalThis.__X={unfinishedBanner,reuseSummary,reuseTag,mergeManifest,outstandingList,PART_REASON};`, ctx);
const G = ctx.__X;

/* ---- 1. the unfinished capture is SAID, in a member's language ----
   RULED by Bob: the audience is non-technical and the point of the workflow is to
   keep them out of logistics. Which platform bound stopped a capture is a
   mechanical detail; it belongs in the manifest and the debt log, not on a page
   somebody is reading about a sewer fund. */
const B = G.unfinishedBanner(short.manifest, "INFO-X", true);
const b1 = B.replace(/\s+/g, " ");
ok("an unfinished capture says so", /still to be collected/i.test(b1));
ok("and says the document itself is sound, which is the part that matters",
   /document itself is complete/i.test(b1) && /checked against the record/i.test(b1));
ok("naming how many files are missing", b1.includes(String(short.manifest.outstanding)));
ok("it explains the consequence a member will actually meet",
   /opening the page may show nothing rather than show it wrong/i.test(b1));
ok("a complete capture says nothing at all", G.unfinishedBanner(reused.manifest, "INFO-X", true) === "");
ok("and a bundle with no manifest says nothing", G.unfinishedBanner(null, "INFO-X", true) === "");

/* Finishing it is capability-shaped: absent, not offered and then refused. */
ok("a member who can add to the record is offered the finish", /Finish collecting it/.test(B));
const B2 = G.unfinishedBanner(short.manifest, "INFO-X", false);
ok("one who cannot is not offered it", !/Finish collecting it/.test(B2));

/* ---- 2. reused files are distinguishable, without the vocabulary ---- */
const R = G.reuseSummary(reused.manifest).replace(/\s+/g, " ");
ok("files kept from an earlier visit get their own disclosure",
   /Files kept from an earlier visit to this site \(1\)/.test(R));
ok("naming the file", R.includes("/css/site.css"));
ok("and when this site had already served it", /already saved on/i.test(R));
ok("it says the request was skipped, not the checking",
   /checked against the record's own fingerprints/i.test(R));
ok("and that they are collected fresh before the document is relied on",
   /collected fresh before this document is relied on as evidence/i.test(R));
ok("a capture that reused nothing shows no disclosure", G.reuseSummary(short.manifest) === "");
const tag = G.reuseTag(reusedParts[0]);
ok("an individual file carries the marker", /class="reused"/.test(tag));
ok("saying where it came from in three words", /from an earlier visit/i.test(tag));
ok("a file fetched today carries none",
   G.reuseTag(reused.manifest.subresources.find(s => s.fetched_this_capture === true)) === "");

/* THE VOCABULARY GUARD. Every string above is read by somebody who does not know
   what a subrequest is and should never need to. This is the assertion that keeps
   the plain-language ruling from eroding one helpful clarification at a time. */
const JARGON = ["subrequest", "runtime", "manifest", "register entry", "corroboration",
  "DEFERRED", "sha256", "viewstate", "VIEWSTATE", "Durable", "op=", "C-18", "content_hash",
  "content-addressed", "outstanding, not failed", "byte budget", "ceiling"];
for(const surface of [["the unfinished banner", B], ["the reuse disclosure", G.reuseSummary(reused.manifest)],
                      ["the reuse marker", tag], ["the still-to-collect list", G.outstandingList(short.manifest)]])
  for(const word of JARGON)
    ok(`${surface[0]} does not say "${word}"`, !surface[1].includes(word));

/* ---- 3. the merge: refill, never rewrite ---- */
const prior = JSON.parse(JSON.stringify(short.manifest));
const fresh = JSON.parse(JSON.stringify(reused.manifest));
const m = G.mergeManifest(prior, fresh);
ok("a completed run merges into the recorded manifest", m.ok === true);
ok("and the result is complete", m.manifest.complete === true && m.manifest.outstanding === 0);

/* The preservation that Bob's ruling is about. */
const priorOk = prior.subresources.filter(s => s.ok);
for (const p of priorOk) {
  const after = m.manifest.subresources.find(s => s.url === p.url);
  ok(`a part already recorded keeps its own record (${p.url.split("/").pop()})`,
     after && after.sha256 === p.sha256 && after.fetched_this_capture === p.fetched_this_capture);
}
const wasDeferred = prior.subresources.filter(s => s.reason === "DEFERRED").map(s => s.url);
for (const u of wasDeferred)
  ok(`what was outstanding is now recorded (${u.split("/").pop()})`,
     m.manifest.subresources.find(s => s.url === u && s.ok));
ok("the merge records what it did, in the manifest itself", Array.isArray(m.manifest.continued));
ok("naming how much was already recorded and how much this run added",
   m.manifest.continued[0].recorded_before === priorOk.length && m.manifest.continued[0].fetched_now > 0);
ok("and stating that the primary was verified and not re-recorded",
   /not re-recorded/i.test(m.manifest.continued[0].note));
ok("a second continuation appends rather than replacing the first",
   G.mergeManifest(m.manifest, fresh).manifest.continued.length === 2);

/* Divergence in an already-recorded part is a refusal. */
const moved = JSON.parse(JSON.stringify(fresh));
const target = moved.subresources.find(s => s.ok && prior.subresources.some(p => p.url === s.url && p.ok));
target.sha256 = "9".repeat(64);
const bad = G.mergeManifest(prior, moved);
ok("the host serving different bytes for a recorded part refuses the merge", bad.ok === false);
ok("naming the file and both hashes", bad.why.includes(target.url.split("/").pop()) && bad.why.includes("999999999999"));
ok("and saying why reconciling silently would be wrong", /rewrite a recorded fact/i.test(bad.why));

/* A part the record holds that the fresh run never saw is not un-captured. */
const narrower = JSON.parse(JSON.stringify(fresh));
const dropped = narrower.subresources.pop();
const keep = G.mergeManifest(prior, narrower);
ok("a run that stopped naming a part does not remove it from the record",
   keep.ok === false || keep.manifest.subresources.some(s => s.url === dropped.url) || !prior.subresources.some(s => s.url === dropped.url && s.ok));

ok("nothing merges from a run with no manifest", G.mergeManifest(prior, null).ok === false);

/* ---- the refusal path names WHICH references are missing ---- */
const L = G.outstandingList(short.manifest);
ok("the refusal names which files are missing", /Still to be collected \(3\)/.test(L));
ok("naming each address", /a\.png/.test(L) && /b\.png/.test(L) && /c\.png/.test(L));
ok("with the reason in plain words", /the source refused nothing/.test(L));
ok("the count agrees with the banner's, because both read one manifest",
   L.includes("(" + short.manifest.outstanding + ")"));
ok("a complete capture lists nothing", G.outstandingList(reused.manifest) === "");
/* Deliberate non-fetches are not failures and are not listed as absences. */
const policy = { subresources: [
  { url:"https://ads.example/x.js", ok:false, reason:"THIRD_PARTY", kind:"script" },
  { url:"https://a.example/big.png", ok:false, reason:"TOO_LARGE", kind:"image" }] };
const PL = G.outstandingList(policy);
ok("a third party's script is not reported as something the capture missed", !/ads\.example/.test(PL));
ok("but a source failure is", /big\.png/.test(PL) && /too large to keep/.test(PL));
ok("not-yet-collected and refused are told apart, not merged",
   /not collected yet/.test(G.PART_REASON.DEFERRED) && /would not serve it/.test(G.PART_REASON.SOURCE_REFUSED));

console.log(`capture-honesty: ${n} assertions, all green`);
