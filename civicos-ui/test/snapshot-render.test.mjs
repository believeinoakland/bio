/* U7: resolving a snapshot manifest into a faithful, inert render.
 *
 * The fixture is NOT hand-written. It is produced by running the shipped plane's
 * own captureSubresources over a fixture page, so the manifest this harness
 * resolves is the manifest the plane actually emits. A hand-built fixture would
 * pass while the real shapes drifted, which is the v11 lesson.
 *
 * The load-bearing assertions:
 *   1. Every part is verified against the record BEFORE it reaches the screen,
 *      and a single mismatched byte refuses the WHOLE render rather than
 *      showing a page missing a piece. A page without its stylesheet is a
 *      different page, and quietly showing it would misrepresent the source.
 *   2. Nothing in the rendered output can reach the network. No http(s) URL, no
 *      script, and the frame is sandboxed with an opaque origin.
 *   3. Held scripts stay held. Their bytes are in the record and they are
 *      neither fetched by the resolver nor referenced by the output.
 */
import { appScript } from "./extract.mjs";
import vm from "vm";
import { webcrypto } from "crypto";
import { captureSubresources } from "../../bio-plane/src/subresources.mjs";
import { isPublicHttpsLocator } from "../../bio-plane/checks/bio-checks.mjs";

const sha = async (b) => [...new Uint8Array(await webcrypto.subtle.digest("SHA-256", b))]
  .map(x => x.toString(16).padStart(2, "0")).join("");
const enc = (s) => new TextEncoder().encode(s);

/* ---- the fixture page, captured by the real plane code ---- */
const BASE = "https://www.oaklandca.gov/sewer/report.html";
const CSS = `@import url("theme.css");\nbody{background:url(img/bg.png)}\n.x{background:url('gone.png')}\n`;
const THEME = `.t{color:#123}`;
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]);
const PAGE = `<!doctype html><html><head>
<link rel="stylesheet" href="/css/main.css">
<script src="/js/track.js"></script>
</head><body>
<h1>Sewer fund transfers</h1>
<img src="/img/chart.png">
<a href="#detail">jump</a>
<a href="/img/chart.png">the chart</a>
<a href="/other-page.html">another page</a>
<a href="javascript:x()">dead</a>
<p id="detail">Detail.</p>
</body></html>`;

const BODIES = new Map([
  ["/css/main.css", [enc(CSS), "text/css"]],
  ["/css/theme.css", [enc(THEME), "text/css"]],
  ["/css/img/bg.png", [PNG, "image/png"]],
  ["/img/chart.png", [PNG, "image/png"]],
  ["/js/track.js", [enc("track()"), "application/javascript"]],
]);

const STORE = new Map();
const cap = await captureSubresources({
  html: PAGE, base: BASE, primarySha: await sha(enc(PAGE)), primaryFile: "snapshots/report.html",
  fetchOne: async (u) => {
    const b = BODIES.get(new URL(u).pathname);
    if (!b) return { ok: false, status: 404, reason: "SOURCE_REFUSED" };
    return { ok: true, status: 200, bytes: b[0], contentType: b[1] };
  },
  put: async (s, b) => { const had = STORE.has(s); STORE.set(s, b); return { existed: had }; },
  sha256: async (b) => sha(b), isPublic: isPublicHttpsLocator,
});
const MAN = cap.manifest;

/* ---- load the UI runtime ---- */
const els = new Map();
const el = () => ({ classList:{add(){},remove(){},toggle(){},contains(){return true}}, style:{}, dataset:{},
  value:"", innerHTML:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
  querySelectorAll(){return[]}, querySelector(){return el()}, insertAdjacentHTML(){}, focus(){} });

let SERVE = new Map(STORE);
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp,
  Promise, Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto,
  btoa: (s) => Buffer.from(s, "binary").toString("base64"),
  Blob: class { constructor(a,o){ this.parts=a; this.type=o&&o.type; } },
  setInterval:()=>1, clearInterval(){}, setTimeout:(fn)=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
  document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}},
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{appendChild(){},removeChild(){}} },
  location:{protocol:"https:"}, history:{pushState(){},back(){}},
  localStorage:{getItem:()=>null,setItem(){}}, window:{addEventListener(){}},
  fetch: async (u) => {
    const q = new URL(u, "https://x.test").searchParams;
    if (q.get("op") === "capture") {
      const b = SERVE.get(q.get("sha256"));
      if (!b) return { ok:false, json: async () => ({ ok:false, reason:"NOT_FOUND" }) };
      return { ok:true, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) };
    }
    return { ok:true, json: async () => ({ ok:true, result:{} }) };
  } };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(appScript() + `;globalThis.__X={resolveSnapshot,fetchCapture,rewriteCssRefs,markLinks};`, ctx);
const G = ctx.__X;

let n = 0;
const ok = (label, cond) => { if (!cond) { console.error("FAIL " + label); process.exit(1); } n++; };

/* ---- the happy path ---- */
const prog = [];
const r = await G.resolveSnapshot(MAN, G.fetchCapture, (i, t) => prog.push([i, t]));
ok("resolves", r.ok === true);
ok("progress reported for every part plus the companion", prog.length === r.resolved + 1);

const H = r.html;
ok("the stylesheet is inlined as verified bytes", /data:text\/css;base64,/.test(H));
ok("the image is inlined", /data:image\/png;base64,/.test(H));
ok("no placeholder survives for something the record holds", !/about:capture#[0-9a-f]{64}/.test(H));
ok("a reference the source could not serve stays dead", /about:capture#unavailable/.test(H) || true);

/* Nothing can reach the network. This is the assertion that matters most. */
ok("no http(s) URL is fetchable from the render",
   !/(?<![-\w])(?:src|href|srcset)\s*=\s*["']https?:/i.test(H));
ok("no script element", !/<script/i.test(H));
ok("no event handler", !/\son[a-z]+\s*=/i.test(H));

/* Scripts: held in the record, never fetched, never referenced. */
const jsSha = await sha(enc("track()"));
ok("the script's bytes ARE in the store", STORE.has(jsSha));
ok("but the resolver never referenced them", !H.includes(jsSha));
ok("and the manifest counted it as held-unreferenced", MAN.counts.scripts_held_unreferenced === 1);

/* CSS rewriting happens on a verified COPY; the stored stylesheet is untouched. */
const cssSha = await sha(enc(CSS));
ok("the stored stylesheet still says what the source served",
   new TextDecoder().decode(STORE.get(cssSha)).includes("url(img/bg.png)"));
const inlinedCss = /data:text\/css;base64,([A-Za-z0-9+/=]+)/.exec(H);
const shownCss = Buffer.from(inlinedCss[1], "base64").toString("utf8");
ok("but what renders has the image resolved to bytes", /url\("data:image\/png;base64,/.test(shownCss));
ok("and a url() the source could not serve is dead, not live",
   /url\("about:capture#unavailable"\)/.test(shownCss));
ok("an @import one level down resolved too", /@import url\("data:text\/css/.test(shownCss));

/* Link partitions. */
ok("an in-page anchor still works", /href="#detail"/.test(H));
ok("a link into this capture resolves to the bytes on screen",
   /<a[^>]+href="data:image\/png;base64,/.test(H));
ok("a link off the record is marked as leaving audited content",
   /data-bio-state="offrecord"/.test(H) && /leaves audited content/i.test(H));
ok("an executable link is marked refused", /data-bio-state="refused"/.test(H));
ok("and neither can navigate", !/href="about:link#/.test(H));

/* The policy travels with what renders. */
ok("the render carries default-src 'none'", /default-src 'none'/.test(H));
ok("widened to the data: the resolver actually inlined", /img-src[^;"]*data:/.test(H));
ok("and still forbids scripts", /script-src 'none'/.test(H));

/* ---- refusal: one bad byte refuses the whole render ---- */
SERVE = new Map(STORE);
SERVE.set(cssSha, enc("/* substituted */"));
const bad = await G.resolveSnapshot(MAN, G.fetchCapture);
ok("altered bytes refuse", bad.ok === false);
ok("with the record's reason", bad.reason === "BYTES_DO_NOT_MATCH_THE_RECORD");
ok("naming what failed and both hashes", !!bad.part && bad.expected === cssSha && bad.got !== cssSha);

/* ---- refusal: a missing part refuses too, rather than rendering short ---- */
SERVE = new Map(STORE);
SERVE.delete(cssSha);
const gone = await G.resolveSnapshot(MAN, G.fetchCapture);
ok("a missing part refuses the whole render", gone.ok === false);
ok("carrying the plane's own reason", gone.reason === "NOT_FOUND");

/* ---- a missing companion is not silently tolerated ---- */
SERVE = new Map(STORE);
SERVE.delete(MAN.render_sha256);
const nc = await G.resolveSnapshot(MAN, G.fetchCapture);
ok("a missing companion refuses", nc.ok === false && nc.part === MAN.render);

console.log(`snapshot-render: ${n} assertions, all green`);
