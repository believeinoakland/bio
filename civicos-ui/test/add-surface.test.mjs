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
 *      form, rather than a form that fails on submit — and a type it cannot
 *      write, or that nothing here can write honestly, is not in the list.
 *
 * NEGATIVE CONTROL: six, all RUN 2026-08-04 (UI-15), each restored
 * byte-identical afterwards and the harness re-run green (113 assertions).
 *
 *  (a) THE ITEM'S OWN CONTROL. Delete the `const ADD_TICKS = 8;` declaration in
 *      civicos-ui/app.html (beside `ADD_BUSY`, ~:9411) -> `ReferenceError:
 *      ADD_TICKS is not defined at Object.addCapture (:8985)`, thrown out of the
 *      driven loop and killing the process. That is D-132 verbatim: the raw
 *      error every member got through addGo's catch on every ceilinged capture
 *      from 2026-07-30 until this item, and it proves this file reaches the
 *      ceiling path rather than calling `addIncomplete` directly the way the
 *      superseded version did. The runtime arm is ordered BEFORE the static
 *      ADD_TICKS line-count assertions for exactly this reason — with the order
 *      reversed the control trips a string check and never reaches the code.
 *  (b) VACUITY control on the same arm: make op=acquire answer `complete: true`
 *      on the first pass -> `TypeError: Cannot read properties of undefined` at
 *      the frame read, i.e. the A4 assertions fail for ABSENCE of the frame
 *      rather than having passed on a frame that was always there.
 *  (c) F-7: make the rail's Add entry unconditional again -> FAIL "a read-only
 *      credential is offered no Add entry in the rail at all".
 *  (d) F-6: have `addTypesFor` return ADD_TYPES unfiltered -> FAIL "a member
 *      without create_projects is not offered the project kind".
 *  (e) SUPERSEDED 2026-08-05 by UI-19 and REPLACED, not deleted: arm (e) used
 *      to break the absence of `action` from ADD_TYPES. The option is back,
 *      because the counterparty pair exists, so the arm that carries the same
 *      weight now is THE MACHINE INVENTING ONE — in app.html's `mdFor`, give the
 *      action arm a default counterparty
 *        if(!cp) fm.push("counterparty:","  state: named","  name: the department");
 *      -> RUN 2026-08-05: FAILS at "BUT an action with nothing authored still
 *      draws exactly one error, and it is C-2.10 naming the counterparty".
 *      THIS SUITE IS FAIL-FAST — `ok` at line 75 calls process.exit(1) on the
 *      first failure — so it reports ONE and stops, and "the machine writes no
 *      counterparty of its own on that path" is unreachable in that run rather
 *      than green. Both are kept: they answer different questions about the
 *      same text. WORTH KNOWING, and it is why both DIRECTIONS are asserted:
 *      the two zero-findings assertions above are reached BEFORE the break's
 *      site and stayed green under it — a suite that only checked that an
 *      authored action passes would have gone green on a surface that had
 *      started inventing addressees.
 *  (f) the amendment, plane half: REMOVE the Action option from setup.mjs's
 *      `#n-type` -> FAIL "the plane's own setup page offers it too — both
 *      intake surfaces or neither".
 */
import { appScript } from "./extract.mjs";
import fs from "fs";
import vm from "vm";
import { createHash, webcrypto } from "crypto";
import { SETUP_HTML } from "../../bio-plane/src/setup.mjs";
import { STATES, HEADINGS, OBJECT_TYPES, normalizeType } from "../../bio-plane/checks/bio-checks.mjs";
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
  FIRST_STATE,HEADINGS,SCHEMA_OF,PREFIX,ADD_TYPES,typeLabel,renderAdd,addValidate,addIncomplete,
  canContribute,canDo,addTypesFor,addCapture,buildRail,heldMatch,PLANE};`, ctx);
const G = ctx.__X;
const SRC = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
const lines = (re) => SRC.split("\n").filter(l => re.test(l)).length;

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
   && G.schemaFor("inquiry", true) === "inquiry@1");
/* and the legacy spellings still resolve, because a legacy bundle is revised
   under the contract it was written under (append-only) */
ok("a legacy focus/problem type still resolves its own schema",
   G.schemaFor("focus", false) === "focus@1" && G.schemaFor("problem", false) === "problem@1");

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

/* THE THIRD NAME, end to end (UI-10). A member choosing "A question worth
   pursuing" on this surface writes an INQUIRY: minted under INQ-, typed
   `inquiry`, opened at the state the catalog calls first for it, carrying the
   inquiry heading set — and it clears the catalog with zero findings. The
   legacy spelling is gated immediately after and must ALSO still pass, because
   the record is append-only and a FOCUS- bundle stays legal forever. */
ok("the Add surface offers the question as `inquiry`, and offers no second spelling of it",
   G.ADD_TYPES.filter(([v]) => normalizeType(v) === "inquiry").map(([v]) => v).join(",") === "inquiry");
ok("a question is minted under the prefix the catalog maps back to inquiry",
   G.PREFIX.inquiry === "INQ" && OBJECT_TYPES[G.PREFIX.inquiry] === "inquiry");
ok("and it opens at the state the catalog calls first for an inquiry",
   G.FIRST_STATE.inquiry === STATES.inquiry.legal[0]);
const inquiry = await gate("INQ-2026-0705-why-the-transfers", "inquiry", false);
for (const e of inquiry.errs) console.log(`         ${e.check}: ${String(e.message).slice(0, 140)}`);
ok("an inquiry written by this surface passes the catalog with zero findings", inquiry.errs.length === 0);
ok("its body is the question, under the inquiry heading set",
   inquiry.files[0].text.includes("## Question") && inquiry.files[0].text.includes("## What Would Falsify This"));
ok("and it is labelled by its PHASE, not by a stored word: an open one is an inquiry",
   G.typeLabel("inquiry", "open") === "Inquiry" && G.typeLabel("inquiry", "concluded") === "Finding"
   && G.typeLabel("inquiry", "published") === "Case");

const focus = await gate("FOCUS-2026-0702-why-the-transfers", "focus", false);
for (const e of focus.errs) console.log(`         ${e.check}: ${String(e.message).slice(0, 140)}`);
ok("a legacy FOCUS- bundle still passes the catalog, unchanged (append-only)", focus.errs.length === 0);
ok("and renders identically to a canonical one — one construct, one word",
   G.typeLabel("focus", "surfaced") === G.typeLabel("inquiry", "open")
   && G.typeLabel("problem", "surfaced") === G.typeLabel("inquiry", "open"));

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

/* ---- 3. the ceiling: driven, then the ONE choice (D-132 · SB-EVIDENCE A4) ----

   CORRECTED 2026-08-04 (UI-15), never exempted. This section asserted the
   OPPOSITE until today — "an unfinished capture proceeds without asking", "no
   dialog was raised at all" — on the 2026-07-30 ruling that deleted the frame.
   Why the old assertions were wrong is not that the ruling was: the frame that
   ruling saw explained the platform limit to the member and asked them to
   arbitrate it, and it deserved to go. What replaced it decided, on the
   member's behalf, that a capture missing part of itself may enter the record —
   and that is not a logistics question, it is the record claiming to hold
   something nobody chose to create. The restored frame classifies the
   complication and never names it (the vocabulary guard below is asserted over
   the frame's own HTML, not just the form's) and puts only the record question.

   And the reason the old assertions could stand unchallenged is D-132 itself:
   they called `addIncomplete` directly. NOTHING in this file had ever reached
   it the way a member does, through `addCapture`'s continuation loop — which is
   exactly where `ADD_TICKS` was undeclared and where every real ceilinged
   capture died. This arm drives the loop. */
/* The RUNTIME arm runs FIRST, deliberately, and the static counts follow it.
   Under the negative control the point is to see the raw `ReferenceError` come
   out of `addCapture` — the member's own failure — rather than a tidy static
   assertion tripping first and hiding whether this file reaches the path at all.
   That ordering IS the control's evidence.

   op=acquire answers incomplete WITH a continuation every time, so the loop
   stops on the surface's own bound rather than on the source running out of
   work: what is under test is the ceiling path, not a short page. */
let acquires = 0;
ctx.recPost = async (op) => {
  if (op !== "acquire") return { ok: true, result: {} };
  acquires++;
  return { document: document_,
           snapshot: { complete: false, outstanding: 9, continuation: { session: "s-" + acquires } } };
};
const settle = () => new Promise(r => setTimeout(r, 5));
const pending = G.addCapture(document_.locator, document_.authority, true);
await settle();
const frame = els.get("#dlg").innerHTML;
ok("the capture is DRIVEN before anything is asked", acquires === 8);
ok("and the member is asked only once it cannot be finished", /cannot finish collecting/i.test(frame));
ok("the document that WAS captured whole is named as complete", /document itself is complete/i.test(frame));
ok("the count of what is outstanding is stated", /9 of the files/.test(frame));
ok("the problem is claimed as ours, not handed over as theirs", /ours to solve, not yours/i.test(frame));
ok("and what is asked is what the RECORD should say", /what the record\s+should say/i.test(frame));
ok("option one records it as the unfinished capture it is",
   /Record it as the unfinished capture it is/.test(frame));
ok("option two writes nothing, and says nothing is lost either way",
   /Write nothing/.test(frame) && /nothing is lost/i.test(frame));
ok("and the third option is refused IN WORDS, not merely omitted",
   frame.includes("Recording it as complete is not on offer."));
ok("exactly two controls are offered",
   (frame.match(/<button/g) || []).length === 2);
/* The vocabulary guard over the FRAME. Constraint 3: the complication is
   classified and never named, so no explanation of the platform can leak back
   in here as a courtesy. */
for (const word of ["subrequest", "runtime", "manifest", "register", "corroboration", "sha256",
                    "content_hash", "content-addressed", "op=", "C-18", "Durable", "ceiling"])
  ok(`the ceiling frame does not say "${word}"`, !frame.includes(word));

const chose = await (async () => { els.get("#ai-yes").click(); return pending; })();
ok("choosing to record it yields the capture, marked unfinished", chose.ok === true);
ok("carrying the document that WAS captured whole", chose.doc === document_);
ok("and what is still missing, so the page can say so", chose.partial.outstanding === 9);
ok("the frame is dismissed once answered", els.get("#dlg").innerHTML === "");

acquires = 0;
const pending2 = G.addCapture(document_.locator, document_.authority, true);
await settle();
const nothing = await (async () => { els.get("#ai-no").click(); return pending2; })();
ok("choosing to write nothing does NOT return a capture", nothing.ok === false);
ok("and nothing is carried forward to be written", nothing.doc === undefined);
ok("and the member is told nothing was written and nothing lost",
   /Nothing was written/.test(nothing.why) && /nothing was lost/i.test(nothing.why));

/* The static half of D-132/D-133, over this file's own source, so a future edit
   that reintroduces either defect fails HERE rather than on a member's screen. */
ok("ADD_TICKS is declared, and exactly once", lines(/^\s*const ADD_TICKS\s*=/) === 1);
ok("and every line that mentions it is that declaration or its one use (D-132/D-133)",
   lines(/ADD_TICKS/) === 2);
ok("the two functions D-133 found duplicated are each declared exactly once now",
   lines(/^async function heldMatch\(/) === 1 && lines(/^async function addCapture\(/) === 1);

/* ---- 4. writing is capability-shaped ---- */
G.PLANE.session = null; G.PLANE.me = { session: false, capabilities: [] };
ok("a credential with no session cannot contribute", G.canContribute() === false);
await G.renderAdd();
const noForm = els.get("#content").innerHTML;
ok("and gets no form at all rather than one that fails on submit",
   !/id="a-title"/.test(noForm) && /cannot write to it/i.test(noForm));
ok("it is told what it would need", /contribute/.test(noForm));
/* F-7 (UI-15): the rail's Add entry is ABSENT for a credential that cannot
   write, rather than a prominent button whose page is an apology for it. */
G.buildRail({ capabilities: [] });
ok("a read-only credential is offered no Add entry in the rail at all",
   !/Add something new/.test(els.get("#rail").innerHTML));
ok("and still gets the rest of the rail", /data-go="record"/.test(els.get("#rail").innerHTML));
G.buildRail({ capabilities: ["contribute"] });
ok("a member holding contribute gets it", /Add something new/.test(els.get("#rail").innerHTML));

G.PLANE.session = "s"; G.PLANE.me = { session: true, capabilities: ["contribute"] };
ok("a member holding contribute can", G.canContribute() === true);
await G.renderAdd();
const form = els.get("#content").innerHTML;
ok("and gets the form", /id="a-title"/.test(form) && /id="a-loc"/.test(form));

/* F-6 (UI-15): `project` was offered to every contribute holder and refused at
   submit by the plane's capability gate. Membership Architecture v2 section 5:
   absent, not present-and-refused — the shape setup.mjs has had since :463. */
ok("a member without create_projects is not offered the project kind",
   !/value="project"/.test(form));
ok("and is still offered the kinds they can write",
   /value="information"/.test(form) && /value="inquiry"/.test(form));
G.PLANE.me = { session: true, capabilities: ["contribute", "create_projects"] };
await G.renderAdd();
const formP = els.get("#content").innerHTML;
ok("a member WITH create_projects is offered it", /value="project"/.test(formP));
ok("the surface reads the capability from whoami rather than keeping its own copy",
   G.canDo("create_projects") === true && G.addTypesFor().some(([v]) => v === "project"));
G.PLANE.me = { session: true, capabilities: ["contribute"] };

/* CORRECTED 2026-08-05 (UI-19), NEVER EXEMPTED, and the correction is the whole
   round trip.

   WHAT STOOD HERE, and why it was right when it was written: UI-15 asserted
   that `action` was ABSENT from both intake surfaces. REC-23 had made the
   counterparty three-valued and stopped both surfaces writing a placeholder, so
   a fresh action left the catalog with exactly one error — C-2.10 naming a
   counterparty nobody authored — and offering a kind whose every instance the
   gate refuses is present-and-refused, the same class as F-6 four lines up. The
   note UI-15 left named its own condition: restore it when a member has a
   control to author the counterparty with.

   WHAT REPLACES IT: that control exists (UI-19's radio pair), so the option is
   back and the assertion is now the one that MATTERS — not that the option
   exists, but that BOTH DIRECTIONS hold. An action written with the member's
   answers draws ZERO findings from the real catalog; an action written with
   NOTHING authored still draws exactly C-2.10, because the machine that will not
   invent an addressee to get past its own gate is the property this file is
   actually here to protect. Asserting only the first would let a future edit
   satisfy the gate by inventing a name and stay green. */
ok("the Add surface offers the action kind again, now that a member can author its counterparty",
   G.ADD_TYPES.some(([v]) => v === "action"));
await G.renderAdd();
ok("and it reaches the rendered form", /value="action"/.test(els.get("#content").innerHTML));
ok("the plane's own setup page offers it too — both intake surfaces or neither",
   /<option value="action"/.test(SETUP_HTML));

/* THE CONFORMANCE FLIP-BACK, on this side of the seam. The same writer, the
   same catalog, the difference being only what the member answered. */
const AUTHORED = { kind: "cpra_request", counterparty: { state: "named", name: "City Clerk" },
                   basis: [], clock: [] };
const UNDET = { kind: "cpra_request",
                counterparty: { state: "undetermined",
                                basis: "The request was addressed to the department; which office holds "
                                     + "the records has not been established. The records index would settle it." },
                basis: [], clock: [] };
const actionErrs = async (act) => {
  const id = "ACTN-2026-0800-records-request";
  const text = G.mdFor(id, "action", G.FIRST_STATE.action, "Records request",
                       "Ask for the transfer ledger.", NOW, false, null, act);
  const { findings } = await checkBundle({ folderName: id, files: new Map([["bundle.md", text]]),
    sha256, sha512, resolveTarget: () => true });
  return { text, errs: findings.filter((x) => x.severity === "error") };
};
const named = await actionErrs(AUTHORED);
for (const e of named.errs) console.log(`         action(named): ${e.check}: ${String(e.message).slice(0, 140)}`);
ok("an action carrying a NAMED counterparty the member wrote passes the catalog with zero findings",
   named.errs.length === 0);
ok("and the name in the document is the member's, not a placeholder",
   /state: named/.test(named.text) && /name: "City Clerk"/.test(named.text));
const undet = await actionErrs(UNDET);
for (const e of undet.errs) console.log(`         action(undetermined): ${e.check}: ${String(e.message).slice(0, 140)}`);
ok("an action stating that the counterparty is UNDETERMINED, with the basis the member wrote, also passes",
   undet.errs.length === 0);
ok("and it states the undetermined rather than inventing a name",
   /state: undetermined/.test(undet.text) && !/name:/.test(undet.text.split("counterparty:")[1].split("---")[0]));
const bare = await actionErrs(null);
ok("BUT an action with nothing authored still draws exactly one error, and it is C-2.10 naming the counterparty",
   bare.errs.length === 1 && bare.errs[0].check === "C-2.10"
   && /counterparty block is missing/.test(bare.errs[0].message));
ok("the machine writes no counterparty of its own on that path — no name, no basis, no placeholder",
   !/counterparty/.test(bare.text));
ok("and the writer still keeps its action arm, because actions already in the record are still revised",
   /action_kind: /.test(bare.text) && /risk_tier: 1/.test(bare.text));

/* THE OVERDUE ACT'S CARRY, and the measured gap it works around. C-2.8 refuses
   a question's basis leg pointing at an ACTION ("a leg rests on information or
   on another inquiry, nothing else"), so the carry is a REFERENCE. Asserted in
   the direction that fails: the reference is written, the basis is NOT, and the
   result clears the real catalog. */
{
  const id = "INQ-2026-0810-why-no-reply";
  const text = G.mdFor(id, "inquiry", G.FIRST_STATE.inquiry, "Why no reply", "What the silence means.",
                       NOW, false, null, { refs: [{ target: "ACTN-2026-0800-records-request", rel: "cites" }] });
  const { findings } = await checkBundle({ folderName: id, files: new Map([["bundle.md", text]]),
    sha256, sha512, resolveTarget: () => true });
  const errs = findings.filter((x) => x.severity === "error");
  for (const e of errs) console.log(`         carry: ${e.check}: ${String(e.message).slice(0, 140)}`);
  ok("a question carrying an action as a REFERENCE clears the catalog", errs.length === 0);
  ok("the action is in references[] and the question rests on nothing",
     /target: ACTN-2026-0800-records-request/.test(text) && !/^basis:/m.test(text));
}
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
