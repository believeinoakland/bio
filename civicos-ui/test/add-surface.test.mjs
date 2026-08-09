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
 *   5. THIS SURFACE STATES NO CAPTURE GRADE, and no file under `civicos-ui/`
 *      states the doctrine behind one (UI-32, 2026-08-04). The form used to
 *      open "Grade B." and close "co-attestation is what raises B toward
 *      evidentiary weight" — the FOURTH hand-written statement of a rule the
 *      plane owns, at a site whose act is not co-attestation, and a PREDICTION
 *      besides, since it painted before the address was typed. The reasoning
 *      for what replaced it is on `ADD_CAPTURE_TEACH` in app.html; the absence
 *      is enforced tree-wide by THE SWEEP at the foot of this file, whose
 *      detectors are composed from the enforced rule and the published
 *      sentences so that this suite spells no grade letter of its own either.
 *
 * NEGATIVE CONTROL: eleven, six RUN 2026-08-04 (UI-15) and five more RUN 2026-08-04 (UI-32), each arm mutating ONE file, restored byte-identical afterwards with sha256 compared, and re-run against the FINAL files (144 assertions).
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
 *
 *  --- UI-32's five, over the capture-grade doctrine and the sweep -------------
 *
 *  (g) MOVE THE RULE ITSELF, and it is the arm the whole item exists to make
 *      true: `EARNED_CAPTURE_CEILING` B -> C in bio-plane/checks/bio-checks.mjs,
 *      the PLANE ALONE, no UI edit -> the WHOLE HARNESS STAYS GREEN, 33/33
 *      exit 0, with act-attest 83/83 and this suite 144/144. The member is
 *      reading the new letters while it does: the publication recomposes to
 *      "it strengthens a Grade C capture … It never reaches Grade B" and
 *      act-attest asserts the dialog carries that whole. The sweep moves WITH
 *      the rule rather than against it — its raw-hit count goes 11 files to 13,
 *      because `Grade C` in the surface's §8.1 comments becomes a capture
 *      letter the moment the rule says so, which is the difference between a
 *      detector that is a FUNCTION of the doctrine and one that is a copy of it.
 *  (h) RESTORE THE SPELLED LETTER to the teach block ("<b>Grade B.</b> The
 *      plane fetches …") -> FAIL "THE FOURTH STATEMENT IS GONE: the form spells
 *      no capture-grade letter at all". This suite is FAIL-FAST, so it stops
 *      there and the sweep's own verdict on app.html is unreachable in that run
 *      rather than green — which is why (h2) exists.
 *  (h2) THE SAME DEFECT AT A RENDERED SITE NO FORM ASSERTION READS: the glossary's
 *      RFC 3161 entry gains "which yields Grade A" -> FAIL "NO CAPTURE-GRADE
 *      LETTER IS SPELLED ANYWHERE OUTSIDE test/ — app.html spells Grade A (1x)",
 *      naming the file and the string. A fifth statement does not have to be
 *      written where the fourth one was.
 *  (i) THE ARM THAT EARNS DETECTOR (B) ITS EXISTENCE, and it is REC-48's arm (e)
 *      one tree over. Put the doctrine back with NO `Grade` word at all — the
 *      teach block gains "and co-attestation raises B toward evidentiary
 *      weight" -> FAIL "NOR DOES ANY FILE UNDER civicos-ui/ RESTATE THE
 *      DOCTRINE'S OWN PROSE — app.html restates the doctrine: 'co attestation
 *      raises b' / 'attestation raises b toward' / 'raises b toward
 *      evidentiary'". Detector (A) is SILENT throughout, and so is every
 *      rendered-letter assertion above: only (B) can see it.
 *  (j) NEUTER THE WALK — `walk(ROOT).filter(() => false)` -> FAIL "REACH: the
 *      walk reads the whole package — 0 files, 0 of them outside test/". A walk
 *      that covers nothing passes everything, and this project has been bitten
 *      by that five times; the arm is here so nobody has to take the sweep's
 *      reach on trust.
 *  (l) A FIFTH STATEMENT IN A FILE NO HARNESS RUNS: "Captures are written at
 *      Grade B here." appended to civicos-ui/README.md -> FAIL "NO CAPTURE-GRADE
 *      LETTER IS SPELLED ANYWHERE OUTSIDE test/ — README.md spells Grade B
 *      (1x)". Both of UI-30's stale copies were sitting in files no harness ran,
 *      which is the whole reason the walk covers the package rather than the
 *      surface.
 */
import { appScript } from "./extract.mjs";
import fs from "fs";
import path from "path";
import vm from "vm";
import { createHash, webcrypto } from "crypto";
import { SETUP_HTML } from "../../bio-plane/src/setup.mjs";
import { STATES, HEADINGS, OBJECT_TYPES, normalizeType } from "../../bio-plane/checks/bio-checks.mjs";
import { checkBundle } from "../../bio-plane/checks/bio-checks.mjs";
/* THE CAPTURE DOCTRINE, IMPORTED FROM WHERE IT IS ENFORCED AND WHERE IT IS
   PUBLISHED (UI-32, 2026-08-04). Neither module reaches `cloudflare:workers`,
   which is UI-28's finding and is why this suite can hold the rule itself
   rather than a copy of it: `EARNED_CAPTURE_CEILING` is the letter
   `checkEarnedLeg` refuses a leg above, `UNREACHABLE_CAPTURE_GRADE` is the rank
   immediately over it, and the two published sentences are what the record
   actually says. Everything below is a FUNCTION of these four values, so this
   file spells no grade letter of its own anywhere. */
import { EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE } from "../../bio-plane/checks/bio-checks.mjs";
import { ATTEST_FENCE, ACQUIRE_GRADE_NOTE } from "../../bio-plane/src/affordances.mjs";
import { fileURLToPath } from "url";
/* D-257 — the doctrine sweep at the foot of this file walks the working tree and
   FLOORS on what it found. The one provenance mechanism is imported rather than
   restated; the argument for why this walk needed it is at the walk. */
import { readGitProvenance, repoPath, reportProvenance } from "../../bio-plane/scripts/provenance.mjs";

/* The render companion's bytes, so the rendition can be read back and verified. */
const COMPANION = new TextEncoder().encode("<!doctype html><html><body>companion</body></html>");
const SERVE = new Map();

let n = 0;
const ok = (label, cond) => { if (!cond) { console.error("FAIL " + label); process.exit(1); } n++; };

/* ============================================================
   THE INSTRUMENTS, DERIVED FROM THE RULE AND GUARDED BEFORE THEY ARE USED
   (UI-32, 2026-08-04 — UI-28's subtraction, one surface on).

   `CAPTURE_LETTERS` is the pair the capture axis owns, taken from the exports.
   `PUBLICATIONS` are the two sentences the record actually says about them.

   THE SUBTRACTION IS NOT OPTIONAL AND UI-28 MEASURED WHY: the publication NAMES
   the unreachable grade IN ORDER TO DENY IT, so a plain "does this say Grade
   <unreachable>" test fires on the correct page. Every reader below therefore
   subtracts the publications first and judges only the REMAINDER — what is left
   after the record has been given credit for its own words.
   ============================================================ */
const CAPTURE_LETTERS = [EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE].map(String);
const PUBLICATIONS = [ATTEST_FENCE, ACQUIRE_GRADE_NOTE].map(s => String(s).replace(/\s+/g, " ").trim());
const LETTER_RE = () => new RegExp("\\bGrade\\s+[" + CAPTURE_LETTERS.join("") + "]\\b", "g");
const stripTags = h => String(h == null ? "" : h).replace(/<[^>]*>/g, " ")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
  .replace(/&mdash;/g, "—").replace(/&hellip;/g, "…")
  .replace(/\s+/g, " ").trim();
const minusPublications = t => { let s = String(t); for (const p of PUBLICATIONS) s = s.split(p).join(" ");
  return s.replace(/\s+/g, " ").trim(); };
/* Every capture-grade letter a member could READ in a piece of rendered HTML,
   after the record's own sentences are subtracted. */
const gradeLettersIn = html => minusPublications(stripTags(html)).match(LETTER_RE()) || [];

ok("INSTRUMENT: the enforced ceiling and the rank above it are single distinct letters",
   /^[A-Z]$/.test(CAPTURE_LETTERS[0]) && /^[A-Z]$/.test(CAPTURE_LETTERS[1])
   && CAPTURE_LETTERS[0] !== CAPTURE_LETTERS[1]);
ok("INSTRUMENT: both publications are non-empty plain prose carrying no markup",
   PUBLICATIONS.length === 2 && PUBLICATIONS.every(p => p.length > 80 && !/[<>]/.test(p)));
ok("INSTRUMENT: and each of them names BOTH letters, which is why the subtraction exists",
   PUBLICATIONS.every(p => CAPTURE_LETTERS.every(L => p.includes("Grade " + L))));
/* THE DETECTOR IS ALIVE, proved on text this file builds rather than on the
   subject — an assertion of absence made with a dead reader passes forever. */
ok("INSTRUMENT: the reader FINDS a spelled letter when one is there",
   gradeLettersIn("<p>this capture is <b>Grade " + EARNED_CAPTURE_CEILING + "</b> today</p>").length === 1);
ok("INSTRUMENT: and the subtraction leaves the record's OWN sentence unremarked",
   gradeLettersIn("<p>" + PUBLICATIONS[0] + "</p>").length === 0
   && gradeLettersIn("<p>" + PUBLICATIONS[1] + "</p>").length === 0);
ok("INSTRUMENT: while a claim standing BESIDE the publication is still found",
   gradeLettersIn("<p>" + PUBLICATIONS[0] + " and this one is Grade "
                  + UNREACHABLE_CAPTURE_GRADE + ".</p>").length === 1);

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
/* CORRECTED 2026-08-04 BY UI-32, NEVER EXEMPTED, and the reason is the whole
   item. These two asserted that the Add form STATES the capture doctrine in its
   own letters — "stated as B", and "Grade A needs a chain-of-custody" matched
   against a string this file typed out. Both passed for the reason REC-43
   measured and REC-48 reproduced: two copies of the same sentence agree at zero
   cost, forever, including on the day the enforced rule moves out from under
   both of them. And neither could have noticed what was actually wrong with the
   subject — that a form which paints BEFORE the address is typed was promising
   a member what grade a capture that has not happened would carry.

   The property being guarded is not weakened, it is turned around: this surface
   never states what a capture is worth. What it must do instead — say what the
   plane will DO with the address, and which parts of it are recorded as
   separate claims — is asserted positively, so the block cannot be emptied to
   satisfy the absence. The reasoning is on `ADD_CAPTURE_TEACH` in app.html; the
   absence is enforced tree-wide by THE SWEEP at the foot of this file. */
ok("the form says what the plane will DO with the address, before anything is written",
   /fetches what the address serves/.test(form) && /hashes the bytes/.test(form));
ok("and names the address, the instant and the issuer as SEPARATE claims rather than one",
   /separate claims/.test(form) && /who you say issued it/.test(form));
ok("it settles nothing it cannot settle: neither the document's truth nor its issuer's standing",
   /whether the document is true/.test(form) && /right one to have asked/.test(form));
ok("and what the capture is WORTH is deferred to the record, stated as the record's own determination",
   /the record's own determination/.test(form) && /once there is a capture to judge/.test(form));
ok("THE FOURTH STATEMENT IS GONE: the form spells no capture-grade letter at all",
   gradeLettersIn(form).length === 0);
/* DRIVEN, not read off the painted default: `#a-n` only reaches the sentence
   that used to carry the letter once a document address and an issuer are both
   present, so a check made against the freshly rendered form would have been
   green against a line that never said it. */
{
  els.get("#a-type").value = "information";
  els.get("#a-title").value = "The sewer contract, as published";
  els.get("#a-body").value  = "What the published document says about the fund.";
  els.get("#a-loc").value   = "https://city.example/agenda.pdf";
  els.get("#a-auth").value  = "City of Oakland, Public Works Department";
  G.addValidate();
  const said = String(els.get("#a-n").textContent || "");
  ok("REACH: the live validity line reached the sentence that used to carry the letter",
     /It will be captured at/.test(said) && /appear in the record/.test(said));
  ok("nor does it predict one on the way to the button — that line states the STATE and no grade",
     gradeLettersIn(said).length === 0);
}

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

/* ============================================================
   THE SWEEP — SO A FIFTH STATEMENT CANNOT BE ADDED SILENTLY (UI-32, 2026-08-04).

   REC-48 built this over `bio-plane/src/`. Four hand-written statements of the
   capture doctrine had already been found one at a time, and the fourth was
   found only because somebody swept for the CLASS instead of trusting a count
   of three. This is the same sweep over the OTHER tree, which is where the
   fourth lived, and it walks EVERY file under `civicos-ui/` — including the
   ones no harness runs, because that is where UI-30 found both of its stale
   copies sitting.

   TWO DETECTORS, and each catches what the other cannot.

   (A) THE SPELLED LETTER, over every file that is NOT a suite. `Grade <L>` for
       the two letters the capture rule owns, taken from the exports so the
       sweep's subject is a function of the rule rather than a second copy of
       it. In the surface this is a total rule and can afford to be: EVERY
       legitimate grade in this application is INTERPOLATED from a value the
       plane sent (`Grade ${esc(...)}`, at eleven sites), so a letter spelled
       out in the surface is by construction this surface stating doctrine.

   (B) THE DOCTRINE'S PROSE, over the whole tree including the suites. Because a
       statement can be made without the word: "co-attestation raises B toward
       evidentiary weight" carries no `Grade` at all and (A) is silent on it —
       which is REC-48's arm (e), one tree over. The phrases come from the
       PUBLICATIONS THEMSELVES, narrowed to their GRADE-BEARING CLAUSES, so this
       file holds no doctrine of its own and the detector moves when the record
       does.

   A STATED LIMIT RATHER THAN AN EXEMPTION LIST, and it is REC-48's, re-measured
   here. Detector (A) is deliberately NOT run over `test/`: eight suites pin
   `Grade <L>` on plane-supplied values from the §8.1 RESOLUTION axis and the
   CONNECTION axis, which are different doctrines that happen to share the
   capture axis's letters, and a sweep that fired on them would have to be
   weakened until it found nothing. Those pins are OUT OF THIS SWEEP'S SUBJECT
   and are not exempted from it. What guards a suite instead is (B) plus the
   fact that a zero-cost pin — the defect this whole line of items keeps
   correcting, and the one that stood at :451 of this file until today —
   restates its subject's own words BY DEFINITION, which is exactly what (B)
   reads.
   ============================================================ */
{
  const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
  const walk = d => fs.readdirSync(d, { withFileTypes:true }).flatMap(e => {
    if(e.name === "node_modules" || e.name.startsWith(".")) return [];
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
  const FILES = walk(ROOT);
  const rel = f => path.relative(ROOT, f);
  const isSuite = f => rel(f).startsWith("test" + path.sep);

  /* ---- PROVENANCE, AND WHY THIS WALK CARRIES IT (D-257 / M0-16) ------------
     `refs/stash` is REPOSITORY-WIDE across all sixty worktrees and `git stash
     push -u` carries UNTRACKED files, so a `pop` deposits another worker's file
     into a tree that never wrote it (D-238, measured). This walk read the
     WORKING TREE and floored on the counts, so a phantom raised `FILES.length`,
     `SURFACE.length` and `SUITES.length` at once — the reach guard's three
     floors — and pushed them the wrong way.

     THE SPLIT IS THE SAME ONE `version-predecessor.test.mjs` states in full: the
     DETECTORS still run over the whole working tree, because a grade letter in a
     file nobody has committed yet is still a finding and must still red this
     suite; the FLOORS are computed over `git ls-tree HEAD` alone, because those
     are the figures another checkout reproduces and the only ones a ratchet may
     be compared against. When git cannot answer, `inCommit` says true for
     everything, the two collapse, and `reportProvenance` prints UNVERIFIED
     rather than clean (D-233). */
  const REPO = fileURLToPath(new URL("../../", import.meta.url));
  const PROV = readGitProvenance(REPO);
  const inCommit = f => PROV.inHead === null ? true : PROV.inHead.has(repoPath(REPO, f));
  const FILES_REPRO = FILES.filter(inCommit);
  /* SAY UNVERIFIED, NEVER CLEAN (provenance.mjs rule 4), and it binds this
     caller's own prose too — a label reading "in the commit at HEAD (unverified)"
     claims the commit while admitting it could not look. Found by D-257's control
     ARM 3 in the sibling suite and corrected in all of them. */
  const HEAD_SAYS = PROV.inHead === null
    ? "UNVERIFIED — git could not answer `ls-tree HEAD`, so this is the whole working-tree walk"
    : `in the commit at HEAD (${PROV.headSha})`;

  /* The comment forms this tree actually writes. The line-comment strip is
     ANCHORED TO LINE START on purpose and REC-48 paid for the lesson: an
     unanchored `//` strip eats everything after `https:` inside a string
     literal, and the sweep would then reach far less than it claims while
     reporting the same green. */
  const stripComments = s => s
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^[ \t]*\/\/.*$/gm, " ");

  /* (B)'s subject: the publications' GRADE-BEARING CLAUSES ONLY. The fence's
     first two parts are about timestamps and secondhand reports, and phrases
     from them stand legitimately all over the attest region and the glossary —
     taking the whole publication would have fired 26 times on correct prose and
     forced the detector to be weakened. A clause is grade-bearing if it names
     `Grade <L>`, or carries one of the rule's letters BARE (which is how the
     "raises <ceiling> toward evidentiary weight" clause qualifies, and it is the
     clause (A) cannot see). Single-letter English words are excluded from the
     bare test — otherwise the article "a" makes every sentence grade-bearing —
     and nothing is lost by it, asserted below. */
  const ENGLISH_SINGLE_LETTER_WORDS = ["A", "I"];
  const clauses = PUBLICATIONS
    .flatMap(p => p.split(/(?<=[.;:])\s+|\s+—\s+/))
    .filter(c => LETTER_RE().test(c)
              || CAPTURE_LETTERS.filter(L => !ENGLISH_SINGLE_LETTER_WORDS.includes(L))
                   .some(L => new RegExp("\\b" + L + "\\b").test(c)));
  const NGRAM = 4;
  const words = s => String(s).replace(/&[a-z]+;/g, " ").replace(/[^A-Za-z]+/g, " ")
    .toLowerCase().trim().split(/\s+/).filter(Boolean);
  const gramsOf = s => { const w = words(s), out = [];
    for(let i = 0; i + NGRAM <= w.length; i++) out.push(w.slice(i, i + NGRAM).join(" ")); return out; };
  const DOCTRINE = new Set(clauses.flatMap(gramsOf));
  const doctrineIn = t => [...new Set(gramsOf(t).filter(g => DOCTRINE.has(g)))];

  const readable = f => { try { return fs.readFileSync(f, "utf8"); } catch(_) { return null; } };
  const subject = f => minusPublications(stripComments(readable(f) || ""));

  /* ---- REACH, BEFORE ANY ABSENCE IS BELIEVED --------------------------------
     A walk that covers nothing passes everything, and this project has now been
     bitten by that five times: UI-30 in an instrument, REC-49 with an arm that
     first fired zero, UI-28's guarded region read, REC-48's reach assertion
     which was WRONG when first written, and UI-31's surface that was covered on
     paper. Every claim this sweep makes is measured before it is made. */
  const SURFACE = FILES.filter(f => !isSuite(f));
  const SUITES  = FILES.filter(isSuite);
  /* THE FLOORED FIGURES ARE THE REPRODUCIBLE ONES (D-257). The detectors below
     still read `FILES`; only the ratchet reads `*_REPRO`. */
  const SURFACE_REPRO = FILES_REPRO.filter(f => !isSuite(f));
  const SUITES_REPRO  = FILES_REPRO.filter(isSuite);
  reportProvenance({
    prov: PROV,
    items: FILES.map(f => ({ path: repoPath(REPO, f), what: rel(f),
      counted: isSuite(f) ? "swept by detector (B), and counted into the SUITES floor"
                          : "swept by detectors (A) and (B), and counted into the SURFACE floor" })),
    instrument: "this suite's package walk",
    corpus: `civicos-ui/: ${FILES.length} file(s) walked, ${FILES_REPRO.length} of them in the commit`,
    totals: PROV.inHead === null ? [] : [
      { label: "package files walked", contaminated: FILES.length, reproducible: FILES_REPRO.length, source: "files" },
    ],
  });
  ok(`REACH: the walk reads the whole package — ${FILES.length} files, `
     + `${SURFACE.length} of them outside test/ — and it is FLOORED on the `
     + `${FILES_REPRO.length} ${HEAD_SAYS}: `
     + `${SURFACE_REPRO.length} surface, ${SUITES_REPRO.length} suite(s), floors 30/5/25`,
     FILES_REPRO.length > 30 && SURFACE_REPRO.length >= 5 && SUITES_REPRO.length >= 25);
  ok("REACH: and it names the surface itself, this suite, and the two guards, rather than a subset it happened to find",
     [ "app.html", "worker.template.mjs", "check-semantics.mjs", "check-mock-envelope.mjs",
       path.join("test", "add-surface.test.mjs"), path.join("test", "act-attest.test.mjs") ]
       .every(want => FILES.some(f => rel(f) === want)));
  const BYTES = FILES.reduce((a, f) => a + (readable(f) || "").length, 0);
  const APP = FILES.find(f => rel(f) === "app.html");
  ok(`REACH: it reads BYTES and not just names — ${BYTES} characters, `
     + `${(readable(APP) || "").length} of them the surface's own`,
     BYTES > 1e6 && (readable(APP) || "").length > 5e5);
  /* THE STRIPPER CANNOT HAVE SWALLOWED THE REGION A STATEMENT WOULD LIVE IN.
     If `stripComments` returned "" — or ate the template literals, which an
     unanchored line-comment strip does — every absence below would be trivially
     true. So the subject text is asserted to still hold the surface's own live
     prose at the exact site this item corrected. */
  const appSubject = subject(APP);
  ok(`REACH: the stripper leaves the surface's live prose intact — `
     + `${appSubject.length} characters survive of ${(readable(APP) || "").length}`,
     appSubject.length > 3e5
     && appSubject.includes("fetches what the address serves")
     && appSubject.includes("the record's own determination"));
  /* AND IT REACHES THE LINES WHERE THE DOCTRINE IS ACTUALLY DISCUSSED. The RAW
     sources DO carry the letters — in comments, in corrected-pin history, in
     other axes' pins — so a walk finding nothing raw would be a walk that never
     opened the files. Measured as a fact, not assumed. */
  const rawHits = FILES.filter(f => LETTER_RE().test(readable(f) || ""));
  ok(`REACH: the same detector over the RAW sources DOES match — ${rawHits.length} files`,
     rawHits.length >= 5 && rawHits.some(f => rel(f) === "app.html"));
  /* (B)'s subject is real and derived. */
  ok(`INSTRUMENT: ${clauses.length} grade-bearing clauses yield ${DOCTRINE.size} doctrine phrases`,
     clauses.length >= 4 && DOCTRINE.size >= 15);
  ok("INSTRUMENT: and the clause set names BOTH letters, so neither half of the doctrine is unwatched",
     CAPTURE_LETTERS.every(L => clauses.some(c => c.includes("Grade " + L))));
  ok("INSTRUMENT: dropping the English article loses no clause that names a grade in the doctrine's own term",
     PUBLICATIONS.flatMap(p => p.split(/(?<=[.;:])\s+|\s+—\s+/)).filter(c => LETTER_RE().test(c))
       .every(c => clauses.includes(c)));
  /* THE PLANTED CONTROL, IN EVERY FILE, AS A DELTA. Absolute counts are wrong
     here and REC-48 shipped that mistake before catching it: a file that
     already has hits reads as deaf when the control is compared to 1. */
  {
    /* THE CONTROL IS THE RECORD'S OWN CLAUSE, LIFTED, not a sentence typed
       here — and that is not tidiness. A control typed out would BE a fifth
       statement, sitting in the file whose job is to forbid them, and detector
       (B) would find it: a sweep that fails on itself gets weakened until it
       finds nothing. Lifting the clause also keeps the control a function of
       the rule, so it still fires the day the doctrine moves. */
    const planted = clauses.find(c => c.includes("Grade " + UNREACHABLE_CAPTURE_GRADE)
                                   && words(c).length > NGRAM);
    ok("INSTRUMENT: the planted control is the publication's own grade-bearing clause, held by nobody here",
       typeof planted === "string" && PUBLICATIONS.some(p => p.includes(planted)));
    const deafLetter = [], deafProse = [];
    for(const f of FILES){
      const base = subject(f);
      const salted = minusPublications(base + " " + planted);
      if((salted.match(LETTER_RE()) || []).length <= (base.match(LETTER_RE()) || []).length) deafLetter.push(rel(f));
      if(doctrineIn(salted).length <= doctrineIn(base).length) deafProse.push(rel(f));
    }
    ok("REACH: a planted statement fires BOTH detectors in EVERY file's own text — "
       + (deafLetter.length || deafProse.length
            ? `DEAF: letters[${deafLetter.join(" ")}] prose[${deafProse.join(" ")}]`
            : `all ${FILES.length} files live`),
       deafLetter.length === 0 && deafProse.length === 0);
  }

  /* ---- (A) THE SURFACE SPELLS NO CAPTURE-GRADE LETTER ----------------------- */
  {
    const found = [];
    for(const f of SURFACE){
      const hits = subject(f).match(LETTER_RE()) || [];
      if(hits.length) found.push(`${rel(f)} spells ${[...new Set(hits)].join(" and ")} (${hits.length}x)`);
    }
    ok("NO CAPTURE-GRADE LETTER IS SPELLED ANYWHERE OUTSIDE test/ — "
       + (found.length ? found.join(" · ") : `none, over ${SURFACE.length} files`),
       found.length === 0);
  }

  /* ---- (B) NOBODY HOLDS THE DOCTRINE'S PROSE, SUITES INCLUDED --------------- */
  {
    const found = [];
    for(const f of FILES){
      const hits = doctrineIn(subject(f));
      if(hits.length) found.push(`${rel(f)} restates the doctrine: "${hits.slice(0, 3).join('" / "')}"`);
    }
    ok("NOR DOES ANY FILE UNDER civicos-ui/ RESTATE THE DOCTRINE'S OWN PROSE — "
       + (found.length ? found.join(" · ") : `none, over ${FILES.length} files and ${DOCTRINE.size} phrases`),
       found.length === 0);
  }
  console.log(`  sweep: ${FILES.length} files (${SURFACE.length} outside test/), ${BYTES} characters read, `
            + `${clauses.length} grade-bearing clauses -> ${DOCTRINE.size} phrases; `
            + `raw letter hits in ${rawHits.length} files, none surviving the strip outside test/`);
}

console.log(`add-surface: ${n} assertions, all green`);
