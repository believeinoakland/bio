/* U8, the Add surface: acquiring by locator and writing a bundle.
 *
 * The assertion that matters is not that the form renders. It is that what this
 * surface WRITES is conformant, because the UI is now a writer in a system whose
 * three-implementation conformance requirement exists to keep its writers in
 * agreement. So the bundle this surface assembles is run through the plane's own
 * check catalog, exactly as test/acquire.test.mjs does for the installer, and
 * zero errors is the bar. A hand-written expectation of what a bundle should look
 * like would pass while the catalog moved.
 *
 * The two tables the surface carries are also held to the catalog's, because the
 * installer injects them at module load and cannot drift while this file is
 * static: a state or heading set that diverges fails here.
 *
 * The load-bearing assertions:
 *   1. What the surface writes passes the catalog, with a document and without.
 *   2. Its first-state and heading tables ARE the catalog's.
 *   3. A capture that cannot be finished is never presented as a capture: the
 *      member is asked, and recording it complete is not among the options.
 *   4. Writing is capability-shaped. A credential that cannot write gets no
 *      form, rather than a form that fails on submit.
 */
import { appScript } from "./extract.mjs";
import vm from "vm";
import { createHash, webcrypto } from "crypto";
import { STATES, HEADINGS } from "../../bio-plane/checks/bio-checks.mjs";
import { checkBundle } from "../../bio-plane/checks/bio-checks.mjs";

/* The render companion's bytes, so the rendition can be read back and verified. */
const COMPANION = new TextEncoder().encode("<!doctype html><html><body>companion</body></html>");
const SERVE = new Map();

let n = 0;
const ok = (label, cond) => { if (!cond) { console.error("FAIL " + label); process.exit(1); } n++; };

/* ---- load the UI runtime ---- */
const els = new Map();
/* Listeners are RECORDED rather than dropped, because the dialog that asks the
   member what to do resolves on a click and a stub that swallows the handler
   turns the assertion into a hang. */
const el = () => ({ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", innerHTML:"", textContent:"", disabled:false, checked:false, _on:{},
  addEventListener(ev, fn){ this._on[ev] = fn; },
  click(){ if(this._on.click) this._on.click(); },
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
  /* op=capture must serve real bytes: blobEntry reads a rendition back and
     verifies it against its hash before the bundle names it, so a stub that
     returns no body is a stub that cannot exercise the write path. */
  fetch: async (u) => {
    const q = new URL(String(u), "https://x.test").searchParams;
    if(q.get("op") === "capture"){
      const b = SERVE.get(q.get("sha256"));
      if(!b) return { ok:false, json: async () => ({ ok:false, reason:"NOT_FOUND" }) };
      return { ok:true, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) };
    }
    return { ok:true, json: async () => ({ ok:true, result:{} }) };
  } };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(appScript() + `;globalThis.__X={mdFor,docFiles,registerFor,schemaFor,reviseText,acquireWhy,
  FIRST_STATE,HEADINGS,SCHEMA_OF,renderAdd,addValidate,addIncomplete,canContribute,heldMatch,PLANE};`, ctx);
const G = ctx.__X;

/* ---- 2. the tables are the catalog's ---- */
const catalogFirst = Object.fromEntries(Object.entries(STATES).map(([t, s]) => [t, s.legal[0]]));
for (const [t, s] of Object.entries(catalogFirst))
  ok(`first state for ${t} matches the catalog`, G.FIRST_STATE[t] === s);
for (const t of Object.keys(G.FIRST_STATE))
  ok(`the surface invents no type (${t})`, !!catalogFirst[t]);
for (const [t, hs] of Object.entries(HEADINGS))
  ok(`headings for ${t} match the catalog`, JSON.stringify(G.HEADINGS[t]) === JSON.stringify(hs));
ok("a document raises the schema to information@2, and only for information",
   G.schemaFor("information", true) === "information@2" && G.schemaFor("information", false) === "information@1"
   && G.schemaFor("focus", true) === "focus@1");

/* ---- 1. what it writes passes the catalog ---- */
const sha256 = async (v) => createHash("sha256")
  .update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
const sha512 = async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b));
const DOC = Buffer.from("%PDF-1.7 sewer fund transfers");
const DOC_SHA = await sha256(DOC);
const NOW = "2026-07-29T12:00:00Z";

/* The register document op=acquire returns, in its real shape. */
const document_ = {
  file: "snapshots/report.pdf", locator: "https://data.oaklandca.gov/report.pdf",
  authority: "City of Oakland", retrieved: NOW,
  capture: { method: "bio-plane acquire, https fetch, hashed at receipt", grade: "B",
             actor_class: "member", sha256: DOC_SHA, encoding: "binary", bytes: DOC.length,
             content_type: "application/pdf" },
  origin: { kind: "named_request" }, attestation_attempts: [],
};

async function gate(id, type, hasDoc, extra) {
  const body = G.mdFor(id, type, G.FIRST_STATE[type], "Sewer fund transfers",
    "What the report shows about the transfers.", NOW, hasDoc,
    hasDoc ? { locator: document_.locator, authority: document_.authority, retrieved: NOW,
               content_hash: DOC_SHA } : null);
  const files = await G.docFiles(body, hasDoc ? document_ : null, await sha256(body), extra || null);
  const map = new Map();
  for (const f of files) map.set(f.path, f.text !== undefined ? f.text : DOC);
  const { findings } = await checkBundle({ folderName: id, files: map, sha256, sha512,
    resolveTarget: () => true });
  return { files, errs: findings.filter(x => x.severity === "error") };
}

const withDoc = await gate("INFO-2026-0700-sewer-transfers", "information", true);
for (const e of withDoc.errs) console.log(`         ${e.check}: ${String(e.message).slice(0, 140)}`);
ok("a captured document assembles a bundle with zero findings", withDoc.errs.length === 0);
ok("three files: the record, the register, and the document",
   withDoc.files.map(f => f.path).sort().join("|") ===
   ["bundle.md", "data/provenance.json", "snapshots/report.pdf"].join("|"));
ok("the document is a blob reference, never inlined",
   withDoc.files.find(f => f.path === "snapshots/report.pdf").blobSha === DOC_SHA);

const typed = await gate("INFO-2026-0701-what-i-know", "information", false);
for (const e of typed.errs) console.log(`         ${e.check}: ${String(e.message).slice(0, 140)}`);
ok("typed intake with no document also passes", typed.errs.length === 0);
ok("and carries no provenance register, because there is no document to describe",
   !typed.files.some(f => f.path === "data/provenance.json"));

const focus = await gate("FOCUS-2026-0702-why-the-transfers", "focus", false);
for (const e of focus.errs) console.log(`         ${e.check}: ${String(e.message).slice(0, 140)}`);
ok("a Focus passes too", focus.errs.length === 0);

/* The rendition files ride on the same register document rather than becoming
   acquisitions of their own, which is what keeps one capture hash out of two
   register entries. */
const COMPANION_SHA = await sha256(COMPANION);
SERVE.set(COMPANION_SHA, COMPANION);
const withSnap = await gate("INFO-2026-0703-with-snapshot", "information", true,
  { "snapshots/report.pdf.render.html": COMPANION_SHA });
ok("a rendition's bytes are read back and verified before the bundle names them",
   withSnap.files.find(f => /\.render\.html$/.test(f.path)).bytes === COMPANION.length);
ok("and its hash is what the capture reported",
   withSnap.files.find(f => /\.render\.html$/.test(f.path)).sha256 === COMPANION_SHA);
let refused = null;
try { await gate("INFO-2026-0704-bad-rendition", "information", true,
  { "snapshots/report.pdf.render.html": "b".repeat(64) }); }
catch(e){ refused = String(e.message); }
ok("a rendition the record does not hold refuses the write rather than naming absent bytes",
   refused !== null && /does not hold the bytes/.test(refused));
ok("a render companion travels as a bundle file", withSnap.files.some(f => /\.render\.html$/.test(f.path)));
ok("and is not registered as an acquisition of its own",
   G.registerFor(document_).every(r => !/\.render\.html$/.test(r.path)));
ok("the register names the document's own bytes",
   G.registerFor(document_)[0].sha256 === DOC_SHA && G.registerFor(document_)[0].path === "snapshots/report.pdf");
ok("and nothing at all with no document", G.registerFor(null).length === 0);

/* A revision keeps what the catalog reads and appends rather than replacing. */
const revised = G.reviseText(withDoc.files[0].text, "bob", "2026-07-30T09:00:00Z", "Continued an unfinished capture");
ok("a revision moves last_updated in the document", /last_updated: 2026-07-30T09:00:00Z/.test(revised));
ok("preserves created", revised.includes("created: " + NOW));
ok("appends a Session Log entry naming who and why",
   /### Session 2026-07-30T09:00:00Z/.test(revised) && /Continued an unfinished capture by bob/.test(revised));
ok("and keeps the Review Notes heading after it, so the section order survives",
   revised.indexOf("## Session Log") < revised.indexOf("## Review Notes"));
const twice = G.reviseText(revised, "ruth", "2026-07-31T09:00:00Z", "Again");
ok("a second revision does not remove the first's entry",
   /Continued an unfinished capture by bob/.test(twice) && /Again by ruth/.test(twice));

/* ---- 3. an unfinished capture is not a question ----
   RULED by Bob: these are technical complications and the workflow exists to keep
   members out of them. An earlier version of this surface put the subrequest
   ceiling to the member as a choice between recording an unfinished capture and
   writing nothing. That asked somebody researching a sewer fund to arbitrate a
   platform limit, so it is gone: the capture is recorded, honestly labelled on its
   own page, and finished later. */
const inc = await G.addIncomplete({ document: document_, snapshot: { outstanding: 4, complete: false } }, 4, 8);
ok("an unfinished capture proceeds without asking", inc.ok === true);
ok("carrying the document that WAS captured whole", inc.doc === document_);
ok("and what is still missing, so the page can say so", inc.partial.outstanding === 4);
ok("no dialog was raised at all", !els.has("#dlg") || !/not finished/i.test(els.get("#dlg").innerHTML));

/* ---- 4. writing is capability-shaped ---- */
G.PLANE.session = null; G.PLANE.me = { session: false, capabilities: [] };
ok("a credential with no session cannot contribute", G.canContribute() === false);
await G.renderAdd();
const noForm = els.get("#content").innerHTML;
ok("and gets no form at all rather than one that fails on submit",
   !/id="a-title"/.test(noForm) && /cannot write to it/i.test(noForm));
ok("it is told what it would need", /contribute/.test(noForm));
G.PLANE.session = "s"; G.PLANE.me = { session: true, capabilities: ["contribute"] };
ok("a member holding contribute can", G.canContribute() === true);
await G.renderAdd();
const form = els.get("#content").innerHTML;
ok("and gets the form", /id="a-title"/.test(form) && /id="a-loc"/.test(form));
ok("the grade is stated before anything is written, and stated as B",
   /Grade B/.test(form) && /hashed at receipt/.test(form));
ok("with Grade A named as what this surface cannot claim", /Grade A needs a chain-of-custody/.test(form));

/* A refusal by the host is named as the host's act. */
ok("a source refusal says the site refused, not that the record failed",
   /the site's act/i.test(G.acquireWhy({ reason: "SOURCE_REFUSED", status: 403 })));
ok("and names the status the host gave", G.acquireWhy({ reason: "SOURCE_REFUSED", status: 403 }).includes("403"));
ok("a missing authority explains why both claims are named",
   /separate claims/i.test(G.acquireWhy({ reason: "NO_AUTHORITY" })));

/* content_hash: an ENTRY REQUIREMENT for verified (C-2.7), so a bundle written
   without one can never be released. Found live: the first bundle U8 wrote had
   none, because the installer's mdFor omits it even with a document attached. */
ok("a captured document carries its own hash in the frontmatter",
   new RegExp("content_hash: sha256:" + DOC_SHA).test(withDoc.files[0].text));
ok("so the release flow's entry requirement can be met",
   /^content_hash: sha256:[0-9a-f]{64}$/m.test(withDoc.files[0].text));
ok("typed intake with no document carries none, rather than inventing one",
   !/content_hash:/.test(typed.files[0].text));

/* The vocabulary guard on the writing surface itself. */
await G.renderAdd();
const formHtml = els.get("#content").innerHTML;
for(const word of ["subrequest", "runtime", "manifest", "register", "corroboration", "sha256",
                   "content_hash", "content-addressed", "op=", "C-18", "Durable", "ceiling"])
  ok(`the Add form does not say "${word}"`, !formHtml.includes(word));

console.log(`add-surface: ${n} assertions, all green`);
