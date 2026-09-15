/* UI-61 / IC-84's CONSUMER HALF — A LEG THAT RESTS ON A PART OF A DOCUMENT,
 * RENDERED IN THE PLANE'S OWN WORDS, DRIVEN AGAINST THE REAL PLANE.
 *
 * NEGATIVE CONTROL: the arms live in `test/content-extent.control.mjs` and are
 * re-run in one step with `node civicos-ui/test/content-extent.control.mjs [arm]`
 * from the repo root. Each arm EDITS A REAL SOURCE, is armed ALONE, and is
 * restored from a uniquely-named per-arm pristine copy verified by sha256 AND by
 * `cmp` with a byte count printed — never `git checkout --`, which restores to
 * HEAD and has twice discarded a session's own uncommitted work. Declared before
 * arming and every one RUN; the results are in the control file and in the item's
 * release line.
 *
 * WHY THIS SUITE DRIVES THE REAL PLANE AND MOCKS NOTHING. The whole subject is
 * what the record SAYS about a citation — `ref`, `stale`, and the `says`
 * sentence — and a mock that composed those strings would be asserting this
 * file's prose against itself. The strings under assertion here are MINTED BY
 * `bio-plane/checks/bio-checks.mjs`'s `describeExtent` and `store.mjs`'s
 * `#contentStanding`, reached through miniflare, and the surface is app.html's
 * own code reached through its own bridged `fetch`. Neither end is this file's.
 *
 * WHAT IT ASSERTS, in one sentence each:
 *   1. the leg display renders the row's `ref` VERBATIM (DEC-49: the plane's words)
 *   2. a `pdf-page` leg offers a jump, at the READER's 1-based page
 *   3. a `document` leg offers no jump and claims no page
 *   4. a STALE row is VISIBLE and UNDETERMINED-STATED, never hidden
 *   5. the composer states the `document` default and PREFILLS NOTHING (DEC-69)
 *   6. OVER-STRICTNESS: a leg with no referent renders EXACTLY as it did before
 *      this item, pinned by sha256 against a measurement taken on the pristine
 *      tree at ce6e7cf.
 *
 * THE ARMS THIS PLANE CANNOT YET DRIVE ARE NAMED RATHER THAN SKIPPED. Only
 * `document` and `pdf-page` have landed (`CONTENT_EXTENT_KINDS[k].landed`);
 * `sheet-cell`, `slide-shape` and `doc-para` are REC-85's and are refused by the
 * plane today, so section 7 asserts the surface's readiness for them the only
 * way that is honest — over the VOCABULARY, which is guarded in both directions
 * by check-semantics.mjs, and over `legReferentHtml`'s behaviour on a kind it
 * has no noun for. Nothing here pretends to have driven an unlanded arm.
 */
import fs from "fs";
import vm from "vm";
import { createHash } from "crypto";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";
import { CONTENT_EXTENT_KINDS } from "../../bio-plane/checks/bio-checks.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
const eq = (label, got, want) => ok(label, JSON.stringify(got) === JSON.stringify(want),
  `want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`);

/* ---- the real plane, under miniflare. Resolved from bio-plane's own
   node_modules (the instrument every plane suite uses). If it is not installed
   the harness FAILS rather than skipping: a suite that quietly stops testing its
   subject is the defect the negative-control rule exists to catch. ---- */
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("content-extent: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/ (this suite drives the actual plane; nothing here is mocked).");
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
  bindings: { ADMIN_TOKEN: "adm-ui61", MEMBER_TOKEN: "mem-ui61", PROBE_TOKEN: "prb-ui61", VERSION: "test" },
});

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-ui61") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-ui61") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ============================================================
   0. THE GROUND — seeded through the REAL promote path, in the
      shape `bio-plane/test/content-reads.test.mjs` establishes.
   ============================================================ */
console.log("\n--- 0. the ground: a read document with a page set, and a question resting on it twice ---");

const NOW = "2026-09-14T00:00:00Z";
const LATER = "2026-09-14T01:00:00Z";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.kind ? [`    extent_kind: ${l.kind}`] : []),
      ...(l.page !== undefined ? [`    extent_page: ${l.page}`] : []),
      ...(l.rect ? [`    extent_rect: [${l.rect.join(", ")}]`] : []),
      ...(l.eref ? [`    extent_ref: "${l.eref}"`] : [])])]
  : [];

const inquiryMd = (id, { subject = null, refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(subject ? [`subject_entity: ${subject}`] : []),
  ...legLines(legs),
  "---", "",
  "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, text, type, { base = null, register = [], reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return post("promote", {
    bundleId: id, base,
    snapKey: `20260914T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register });
};
const mustPromote = async (id, text, type, opts = {}) => {
  const r = await promote(id, text, type,
    { ...opts, base: opts.base !== undefined ? opts.base : (HEAD.get(id) ?? null) });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

/* A D-252 SCOPED chain: a three-page document whose pages each name themselves,
   which is what gives this capture a PAGE SET the record can see (D-345 — this
   plane persists no PDF page count, so a scoped chain is the only shape that
   produces one). */
const scopedChain = (pages, cap = "C") => [
  { step: "pixels", extent: { kind: "pages", pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap, confidence: { basis: "none" },
    extent: { kind: "pages", pages } },
];
const readingOf = (captureSha, chain, entities = []) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
             at: NOW, entities, facts: {},
             ...(chain === undefined ? {} : { text_source: chain }) } });

const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24680"] });
const ORD = eOrd.entity_id;
ok("a subject entity is registered", /^ENT-/.test(ORD || ""));

const SHA_DOC = sha("ui61-doc-with-a-page-set");
const DOC = "INFO-2026-6100-paged";
await mustPromote(DOC, infoMd(DOC), "information", {
  reading: readingOf(SHA_DOC, scopedChain([0, 1, 2]),
    [{ ref: "ordinance:24680", kind: "ordinance", key: "24680", label: "Ordinance No. 24680" }]),
  register: [{ path: "snapshots/d.pdf", sha256: SHA_DOC, encoding: "binary", bytes: 10 }] });
await post("resolve", { captureSha: SHA_DOC });

/* ONE QUESTION, TWO LEGS ON ONE DOCUMENT — whole, and at a page. Two grains side
   by side is the shape the whole item is about, and D4 is why the join downstream
   must be by ORD and never by target. */
const INQ = "INQ-2026-6100-two-grains";
const rInq = await mustPromote(INQ, inquiryMd(INQ, { subject: ORD, refs: [DOC],
  legs: [{ target: DOC },
         { target: DOC, kind: "pdf-page", page: 1, rect: [10, 20, 100, 200],
           eref: "page 2, the transfer table" }] }), "inquiry");
eq("both legs projected a content row — one `document`, one `pdf-page`",
  (rInq.content || []).map((c) => c.extent_kind), ["document", "pdf-page"]);

/* ============================================================
   1. THE SURFACE, LOADED, WITH ITS OWN FETCH BRIDGED TO THE PLANE
   ============================================================ */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
    remove(){}, onclick:null, onchange:null };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if (!els.has(s)) els.set(s, el()); return els.get(s); };

const CALLED = [];
async function bridgeFetch(u, opts){
  const url = new URL(u, "http://x");
  CALLED.push(url.searchParams.get("op"));
  return mf.dispatchFetch(url.toString(), opts);
}
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch: bridgeFetch };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE", "openInquiry", "basisLegRow", "legReferent", "legReferentHtml", "legJumpHtml",
  "CONTENT_EXTENT_KINDS", "EXTENT_KIND_WORD", "UNDET_RETRY", "CITE", "citeOpen", "citePaint",
].join(",") + "};", ctx);
const U = ctx.__U;
U.PLANE.token = "mem-ui61";
U.PLANE.session = true;
U.PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };

/* THE REAL READ, THROUGH THE SURFACE'S OWN SEAM. Nothing below composes an
   answer: this is the plane's own response to the op the page calls. */
const EB = await get("earnedbasis", `id=${INQ}`);
ok("op=earnedbasis answers this question's legs", EB && EB.ok === true);
const legRows = Array.isArray(EB.legs) ? EB.legs : [];
eq("the plane publishes one leg row per basis leg, carrying its content_id",
  legRows.map((l) => l.ord), [0, 1]);
ok("both legs resolved to a content row", legRows.every((l) => !!l.content_id));

const CONTENT = (EB.earned && EB.earned.content) || {};
const docStd = CONTENT[legRows[0].content_id];
const pageStd = CONTENT[legRows[1].content_id];
ok("the plane published a standing for each row", !!docStd && !!pageStd);
eq("the two rows are the two grains", [docStd.extent_kind, pageStd.extent_kind], ["document", "pdf-page"]);

/* ============================================================
   2. THE `ref` IS RENDERED VERBATIM (DEC-49)
   ============================================================ */
console.log("\n--- 1. the leg display renders the row's `ref`, in the plane's own words ---");

const r0 = U.legReferent(EB, 0), r1 = U.legReferent(EB, 1);
eq("the referent is joined to the leg BY ORD, which is what D4 requires",
  [r0.content_id, r1.content_id], [legRows[0].content_id, legRows[1].content_id]);

const leg0 = U.basisLegRow({ target: DOC, role: "supports" }, 0, r0);
const leg1 = U.basisLegRow({ target: DOC, role: "supports" }, 1, r1);

ok("the WHOLE-DOCUMENT leg renders its `ref` verbatim",
  docStd.ref && leg0.includes(docStd.ref), `ref=${JSON.stringify(docStd.ref)}`);
ok("the PAGE leg renders its `ref` verbatim — and it is the member's own authored words",
  pageStd.ref && leg1.includes(pageStd.ref), `ref=${JSON.stringify(pageStd.ref)}`);
eq("the authored `extent_ref` is what the record kept, so the surface shows the member's words",
  pageStd.ref, "page 2, the transfer table");
ok("the surface invents no sentence of its own beside it — the noun comes from the guarded table",
  leg1.includes(U.EXTENT_KIND_WORD["pdf-page"]));
ok("neither leg is hidden because it names a part", leg0.includes(DOC) && leg1.includes(DOC));

/* ============================================================
   3. THE JUMP — offered where it can be completed, and nowhere else
   ============================================================ */
console.log("\n--- 2. the viewer jumps to the page the leg cites ---");

ok("the PAGE leg offers a jump into the document", /openBundleAtPage\(/.test(leg1));
ok("the jump names the READER's page, which is 1-based over the record's 0-based page",
  leg1.includes("page 2") && /openBundleAtPage\([^)]*,2\)/.test(leg1),
  `page in the record = 1; rendered = ${/at page (\d+)/.exec(leg1)?.[1]}`);
ok("the jump names the document the row is about", leg1.includes(pageStd.bundle_id));
ok("the WHOLE-DOCUMENT leg offers NO jump — there is no page to jump to and none is claimed",
  !/openBundleAtPage\(/.test(leg0));
eq("a kind with no place to jump to renders no control rather than one that goes nowhere",
  U.legJumpHtml({ extent_kind: "sheet-cell", extent: { sheet: "S", cell: "A1" }, bundle_id: DOC }), "");
eq("a pdf-page row the record recorded no page for renders no control either",
  U.legJumpHtml({ extent_kind: "pdf-page", extent: {}, bundle_id: DOC }), "");

/* ============================================================
   4. A STALE ROW IS VISIBLE AND UNDETERMINED-STATED
   ============================================================ */
console.log("\n--- 3. a stale referent is shown, stated as undetermined, and never hidden ---");

/* RE-READ THE DOCUMENT WITH A DIFFERENT CHAIN. This is the real mechanism:
   `#markContentStale` runs in the reading's own transaction, so what follows is
   the plane's own staleness and not a flag this file set. */
await mustPromote(DOC, infoMd(DOC), "information", {
  reading: readingOf(SHA_DOC, scopedChain([0, 1, 2], "B"),
    [{ ref: "ordinance:24680", kind: "ordinance", key: "24680", label: "Ordinance No. 24680" }]),
  register: [{ path: "snapshots/d.pdf", sha256: SHA_DOC, encoding: "binary", bytes: 10 }] });

const EB2 = await get("earnedbasis", `id=${INQ}`);
const C2 = (EB2.earned && EB2.earned.content) || {};
const rows2 = Array.isArray(EB2.legs) ? EB2.legs : [];
const stale2 = C2[rows2[1].content_id];
ok("the plane marked the cited row stale after the re-read", stale2 && stale2.stale === true);
ok("and the row STILL RESOLVES — the record keeps the citation where the member put it",
  !!stale2.ref && !!stale2.says);

const legStale = U.basisLegRow({ target: DOC, role: "supports" }, 1, U.legReferent(EB2, 1));
ok("the stale leg is STILL RENDERED — it is never hidden", legStale.includes(DOC));
ok("its `ref` is still shown", legStale.includes(stale2.ref));
ok("it is marked UNDETERMINED", /class="subj-grade g-unconf">undetermined</.test(legStale));
ok("the UNDETERMINED pane carries the PLANE's own sentence, verbatim",
  legStale.includes(stale2.says), `says=${JSON.stringify(String(stale2.says).slice(0, 80))}…`);
ok("its retry line is one of C-14's three closed forms",
  legStale.includes(U.UNDET_RETRY.could_not_determine));
ok("the stale pane is findable by a structural mark, so a sweep can see it and not only a reader",
  /data-stale="1"/.test(legStale));

/* THE OTHER DIRECTION, and it is what makes the arm above mean anything: the
   WHOLE-DOCUMENT row on the same capture went stale too, and a leg whose row is
   NOT stale must not draw the pane. Measured rather than assumed. */
const fresh = U.legReferentHtml({ content_id: "x", standing: { ...docStd, stale: false } });
ok("a row that is NOT stale draws no undetermined pane", !/g-unconf">undetermined</.test(fresh));
ok("and still shows its `ref`", fresh.includes(docStd.ref));

/* ============================================================
   5. THE WHOLE PAGE, THROUGH THE SURFACE'S OWN LOADER
   ============================================================ */
console.log("\n--- 4. the question page asks the record for its legs' referents, and renders them ---");

const before = CALLED.length;
await U.openInquiry(INQ);
const page = $$("#content")._html;
const asked = CALLED.slice(before);
ok("the page asked op=earnedbasis for what its legs rest on", asked.includes("earnedbasis"));
ok("the rendered page carries the page leg's `ref`", page.includes(stale2.ref));
ok("the rendered page carries the stale row's undetermined pane", /data-stale="1"/.test(page));
ok("the rendered page offers the jump", /openBundleAtPage\(/.test(page));

/* ============================================================
   6. THE COMPOSER — the default is STATED and nothing is prefilled
   ============================================================ */
console.log("\n--- 5. the composer states the `document` default and prefills nothing (DEC-69) ---");

const app = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
const extentBlock = /const extentBlock = [\s\S]*?`;\n/.exec(app)?.[0] || "";
ok("the cite composer carries an extent region at all", extentBlock.length > 0);
ok("it states that the leg rests on the WHOLE DOCUMENT — the default is never silent",
  /whole document/i.test(extentBlock));
ok("it offers NO page input, so nothing is prefilled and no page is forced (DEC-69)",
  !/<input[^>]*cx-extent-page/i.test(extentBlock) && !/type="number"/i.test(extentBlock));
ok("it offers no kind chooser either, and says why rather than showing an inert control",
  !/<select/i.test(extentBlock) && !/name="cx-extent"/i.test(extentBlock));
ok("it is on the QUESTION arm only — a case's citation edge has no basis leg to scope",
  /citeOntoInquiry\(\)/.test(extentBlock));
/* THE MEASURED FACT THE REGION RESTS ON, re-measured HERE rather than quoted.
   CORRECTED 2026-09-14 BY REC-97, NEVER EXEMPTED. As UI-61 wrote it this
   asserted that `op=cite` carries NO extent, with the note "if this fails,
   op=cite now carries an extent: build the picker and delete the
   absent-and-says-so region". **IT DID FAIL, and the old assertion was right
   when it was written and is wrong now** — REC-97 / IC-90 widened the act, which
   is the landing UI-61's own DELEGATION asked for. The assertion is INVERTED
   rather than deleted, because the fact it pins is still the fact the region
   rests on: the region says what it says BECAUSE of what the act carries, and a
   pin that stopped measuring the act would let the sentence go stale in the
   other direction. The picker is NOT built here — that is a UI item (a page set
   and a page canvas, UI-61's second finding), delegated back — and the two
   assertions below say exactly that, so neither half can drift silently. */
const store = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "utf8");
const citeRouting = /cite: \(\) => this\.cite\(\{[\s\S]*?\n {8}\}\),/.exec(store)?.[0] || "";
ok("`op=cite` NOW CARRIES the extent — the silent drop UI-61 measured is closed (REC-97)",
  citeRouting.length > 0 && /extent/.test(citeRouting),
  "if this fails, op=cite has stopped carrying an extent and the composer's sentence is false again");
ok("and it takes it as a BAG, so a field the act does not carry is refusable rather than dropped",
  /extent_|content_id/.test(citeRouting) && /searchParams/.test(citeRouting),
  "the defect was seven named get()s; an eighth get() would close one spelling and leave the mechanism");
ok("the composer STILL offers no control, and now says the page is what is missing rather than the act",
  /does not yet offer a way to pick one/.test(extentBlock) && !/<input/i.test(extentBlock),
  "if this fails the picker was built here — delete the absent-and-says-so region with it");

/* ============================================================
   7. THE ARMS THIS PLANE CANNOT DRIVE, NAMED RATHER THAN SKIPPED
   ============================================================ */
console.log("\n--- 6. IC-1's union: what this suite drove, what REC-85 landed, and that nothing is pretended ---");

const landed = Object.entries(CONTENT_EXTENT_KINDS).filter(([, v]) => v.landed).map(([k]) => k).sort();
const unlanded = Object.entries(CONTENT_EXTENT_KINDS).filter(([, v]) => !v.landed).map(([k]) => k).sort();
/* CORRECTED 2026-09-14 by CONDUCT #11 at REC-85's integration, never exempted: as written (UI-61's
   tree at ce6e7cf) the plane had landed `document` and `pdf-page` only, and the pin said so. REC-85
   landed `sheet-cell`, `doc-para` and `slide-shape` the same day, so the pin went false on the merged
   tree - the correct shape, not a defect in either item. What this suite DROVE is still the two arms
   below; REC-85's three are driven by `bio-plane/test/content-extent-arms.test.mjs`, not pretended
   here. The unlanded set is asserted EMPTY so the day a sixth arm is named-but-unlanded the suite
   says so by name, and the noun check now covers every LANDED arm - the stronger claim. */
const DRIVEN = ["document", "pdf-page"];
ok("the arms this suite DROVE are landed arms (document, pdf-page)", DRIVEN.every((k) => landed.includes(k)));
eq("every arm of IC-1's union is landed as of REC-85 - none refused as unlanded today",
  unlanded, []);
eq("the landed set is IC-1's whole union", landed, ["doc-para", "document", "pdf-page", "sheet-cell", "slide-shape"]);
ok("the surface carries a member-facing noun for every LANDED arm, so REC-85's landing needed no edit here",
  landed.every((k) => typeof U.EXTENT_KIND_WORD[k] === "string" && U.EXTENT_KIND_WORD[k].length > 0));
eq("the surface's kind set IS the catalog's, which check-semantics.mjs guards in both directions",
  [...U.CONTENT_EXTENT_KINDS].sort(), Object.keys(CONTENT_EXTENT_KINDS).sort());
/* A kind the surface has no noun for still renders the plane's `ref`, which is
   what makes a new arm cost nothing: the sentence is the record's and the noun is
   a decoration. */
const alien = U.legReferentHtml({ content_id: "x",
  standing: { extent_kind: "some-future-arm", ref: "a passage this plane cannot name", stale: false,
              extent: {}, bundle_id: DOC } });
ok("an arm this file has no noun for STILL renders the plane's own `ref`",
  alien.includes("a passage this plane cannot name"));

/* ============================================================
   8. OVER-STRICTNESS — a leg with no referent is UNTOUCHED
   ============================================================ */
console.log("\n--- 7. over-strictness: a leg that names no part renders EXACTLY as it did before ---");

/* PINNED BY DIGEST AGAINST A MEASUREMENT TAKEN ON THE PRISTINE TREE at ce6e7cf,
   before one byte of this item was written. Three legs covering the shapes the
   renderer branches on: graded-with-a-note, ungraded, and a hunch. This is the
   direction that matters most — every leg in the record today has no extent, and
   an item that quietly changed how they all render would be a regression wearing
   a feature's clothes. */
const PRISTINE_DIGEST = "6d636a7040da089dafac8b585b9f5b108f94008fccb67a6e0676a79742dcbe9f";
const PINNED = [
  { target:"INFO-2026-0001-aaa", role:"supports", grade:"B", grade_axis:"connection", grade_source:"resolution", note:"the transfer table" },
  { target:"INFO-2026-0002-bbb", role:"cuts_against" },
  { target:"INQ-2026-0003-ccc", role:"supports", grade:"D", grade_axis:"connection", grade_source:"hunch", author:"alice", date:"2026-09-01" },
];
const rendered = PINNED.map((l, i) => U.basisLegRow(l, i)).join("\n");
eq("a leg with no referent renders BYTE-IDENTICALLY to the pristine tree",
  sha(rendered), PRISTINE_DIGEST);
eq("and passing an explicit null referent is the same rendering again",
  sha(PINNED.map((l, i) => U.basisLegRow(l, i, null)).join("\n")), PRISTINE_DIGEST);
/* The two legitimate NULLs are STATED WHEN THE PLANE SAID WHY and silent when it
   did not — never a sentence this surface invented. */
eq("a leg the plane could not resolve and gave no reason for renders nothing extra",
  U.legReferentHtml({ content_id: null, standing: null, null_case: null, why: null }), "");
ok("a leg the plane DID name a reason for renders the plane's own sentence",
  U.legReferentHtml({ content_id: null, standing: null, null_case: "INQUIRY_TARGET",
                      why: "a question has no capture to point into" })
    .includes("a question has no capture to point into"));

console.log(`\ncontent-extent: ${pass} pass, ${fail} fail`);
await mf.dispose();
if (fail) process.exit(1);
