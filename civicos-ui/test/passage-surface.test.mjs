/* UI-62 / CONTENT-SEARCH-DESIGN.md §7 ROW 6 — THE SEARCH SURFACE AT CONTENT
 * GRAIN: a member reaches a passage, and the surface says WHICH LEVEL WAS EMPTY.
 *
 * NEGATIVE CONTROL: the arms live in `test/passage-surface.control.mjs` and are
 * re-run in one step with `node civicos-ui/test/passage-surface.control.mjs [arm]`
 * from the repo root. Each arm EDITS A REAL SOURCE, is armed ALONE, and is
 * restored from a uniquely-named per-arm pristine copy verified by sha256 AND by
 * `cmp` with a byte count printed — never `git checkout --`, which restores to
 * HEAD and has twice discarded a session's own uncommitted work.
 *
 * ELEVEN ARMS, ALL DECLARED BEFORE ARMING AND ALL RUN, 2026-09-17. Every arm armed
 * and restored byte-identically (sha256 EQUAL, `cmp` identical, 1,348,297 bytes).
 * The first ten were run at a 94-assertion baseline and `prefilledquery` at 96,
 * because the two assertions it exists for were added after that sweep — the
 * figures are recorded as they were PRINTED rather than normalised, since a
 * baseline is a fact about a run and not about a file:
 *     baseline        94 pass / 0 fail   — the arms are real, not all broken
 *     levelhidden     89 / 5   one of the four levels dropped: both "every one of
 *                              the four is RENDERED" arms, both "the plane's OWN
 *                              sentence" arms, and the UNDETERMINED arm
 *     tallyfour       93 / 1   the fifth bucket dropped: "every one of the five is
 *                              RENDERED"
 *     reworded        93 / 1   DEC-8: the plane's `says` replaced by friendlier prose
 *     prefilled       93 / 1   DEC-69: a page box prefilled with a 1
 *     proportions     93 / 1   a percentage beside each bucket
 *     sampleunmarked  92 / 2   the SAMPLE card removed when the bound bites
 *     extentdropped   91 / 3   the extent silently not sent while the composer
 *                              still says it will be — the act still SUCCEEDS
 *     offbyone        93 / 1   the record's 0-based page handed to the reader
 *     prefilledquery  95 / 1   DEC-69, and this row's own named control: the search
 *                              box opened with a term already in it (baseline 96)
 *     reordered       94 / 0   OVER-STRICTNESS: the levels in the opposite order
 *                              take NOTHING down, as they must not
 *
 * ONE ARM CAME BACK DIFFERENT FROM ITS DECLARATION AND IT IS RECORDED RATHER THAN
 * SMOOTHED. `tallyfour` was declared to take down TWO assertions and took down
 * one: it leaves "the tally is driven off the PUBLISHED vocabulary" green. The
 * declaration was wrong, not the arm and not the suite — that assertion hands the
 * renderer a synthetic sixth state INSIDE `content_axis.vocabulary`, and the arm
 * narrows the bucket list to `Object.keys(vocab)`, which still contains it. The
 * two assertions turn out to test genuinely independent properties: one that a
 * new member of the published vocabulary is rendered, and one that the FIFTH
 * bucket — which arrives by the separate `undetermined_value` route and is not a
 * member of `vocabulary` at all — is rendered beside them. No single arm can take
 * both down, which is a reason to keep both rather than a redundancy.
 *
 * ---------------------------------------------------------------------------
 * HOW A LIAR WOULD PASS A WEAKER VERSION OF THIS SUITE, stated first because it
 * is what the assertions below are shaped against.
 *
 * The cheapest green for "the absence statement is rendered" is a surface that
 * emits SOME empty-state text for every empty answer — one sympathetic sentence,
 * one graphic, one "nothing found here". That passes a presence check, passes a
 * non-empty check, passes a "the word absence appears" check, and says NOTHING
 * ABOUT WHICH LEVEL WAS EMPTY. It is precisely the surface `CLAUDE.md` forbids,
 * and a suite that asserted presence would certify it.
 *
 * So presence is never asserted alone here. Section 4 drives FOUR REAL ANSWERS
 * over FOUR REAL SCOPES of one live plane — a hit, a miss over a searched scope,
 * a miss over a scope nothing in which was searchable, and a miss with no
 * document in scope at all — and requires the four RENDERED STATEMENTS to be
 * PAIRWISE DIFFERENT and each to carry its own plane sentence and its own
 * numbers. A single empty-state graphic collapses all four into one string and
 * fails six assertions by name. That is a criterion about the DISTINCTION, which
 * is the obligation, rather than about this suite's own bookkeeping.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS SUITE DRIVES THE REAL PLANE AND MOCKS NOTHING. Every sentence under
 * assertion is MINTED BY `bio-plane/src/store.mjs`'s `#meaningLevels` and
 * `#contentAxisTally` and by `bio-plane/src/airun.mjs`'s `CONTENT_AXIS_STATES`,
 * reached through miniflare; the surface is `app.html`'s own code reached through
 * its own bridged `fetch`. A mock that composed those strings would be asserting
 * this file's prose against itself, which is the costs-nothing rule: two copies
 * of one sentence agree for free.
 *
 * WHAT IT ASSERTS, in one sentence each:
 *   1. the route exists only where the PLANE publishes the arm, and is driven
 *      off the published vocabulary rather than a literal this file trusts
 *   2. a passage renders AS CONTENT with its `ref` VERBATIM (DEC-49), and the
 *      jump lands at the READER's 1-based page
 *   3. the member's own field selectors reach this route, so the two routes
 *      answer over ONE scope and the tally's denominator is the one asked for
 *   4. THE ABSENCE STATEMENT: four levels, four distinguishable answers, every
 *      sentence the plane's own, never hidden and rendered on a HIT too
 *   5. the five-bucket tally is driven off `content_axis.vocabulary`, and the
 *      bound is presented as a SAMPLE with no proportions anywhere
 *   6. "cite this" reaches the composer carrying the passage, states the address
 *      in the record's own words, prefills NOTHING, and sends the extent on the
 *      QUESTION arm only
 *   7. OVER-STRICTNESS: the two pre-existing panels' walks are unchanged, and a
 *      composer opened WITHOUT a passage renders byte-identically.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one. The import is for its SIDE EFFECT and is idempotent. */
import fs from "fs";
import vm from "vm";
import { createHash } from "crypto";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";
/* THE VOCABULARY UNDER ASSERTION IS IMPORTED FROM THE PLANE, NEVER SPELLED HERE.
   PL-17's rule applied to a suite: a test that typed "indexed_full" would keep
   passing on the day the writer renamed it, which is the drift this guards. */
import { CONTENT_AXIS_STATES, CONTENT_AXIS_UNDETERMINED } from "../../bio-plane/src/airun.mjs";
import { MEANING_AXIS_CAP } from "../../bio-plane/src/query.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
const eq = (label, got, want) => ok(label, JSON.stringify(got) === JSON.stringify(want),
  `want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`);

/* ---- the real plane, under miniflare. Resolved from bio-plane's own
   node_modules. If it is not installed the harness FAILS rather than skipping:
   a suite that quietly stops testing its subject is the defect the
   negative-control rule exists to catch. ---- */
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("passage-surface: the real plane could not be started — miniflare is not installed.");
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
  bindings: { ADMIN_TOKEN: "adm-ui62", MEMBER_TOKEN: "mem-ui62", PROBE_TOKEN: "prb-ui62", VERSION: "test" },
});

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-ui62") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-ui62") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ============================================================
   0. THE GROUND — seeded through the REAL promote path, in the shape
      `bio-plane/test/passage-arm.test.mjs` establishes for this arm.
   ============================================================ */
console.log("\n--- 0. the ground: one document READ at passage grain, one never read ---");

const NOW = "2026-09-17T00:00:00Z";
const LATER = "2026-09-17T01:00:00Z";

/* THE TERM THAT EXISTS ONLY INSIDE A CAPTURED PAGE. It is in NO title, NO
   frontmatter and NO note — which is what makes this surface's passages panel a
   real measurement rather than a coincidence with the text route. */
const ONLY_IN_PAGE = "hydrostatic";

const infoMd = (id, authority) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", `  authority: ${authority}`, `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const inquiryMd = (id) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does the packet say?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "---", "",
  "## Question", "", "What does the packet say?", "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, text, type, { document = null, registerOnly = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (document) {
    const prov = JSON.stringify({ documents: [document] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260917T${String(300000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files,
    /* `registerOnly` REGISTERS A CAPTURE AND PROMOTES NO READING FOR IT. It is
       not a contrived state — it is the ordinary one for every capture between
       acquisition and extraction, and it is the whole difference between
       "these documents do not say that" and "nobody has opened these
       documents", which is this item's subject. */
    register: registerOnly
      ? [{ sha256: registerOnly, path: "data/unread.bin", encoding: "binary", bytes: 10 }]
      : document && document.capture && document.capture.sha256
      ? [{ sha256: document.capture.sha256, path: document.file || "data/doc.bin",
           encoding: "binary", bytes: document.capture.bytes || 10 }]
      : [] });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

const pdfDocOf = (captureSha, pages) => ({
  file: "snapshots/packet.pdf", locator: "https://www.oaklandca.gov/packet.pdf", retrieved: NOW,
  capture: { sha256: captureSha, encoding: "binary", bytes: 4096 },
  reading: { content_type: "meeting_packet", reader_version: 1, read_from_text: true,
             found: false, entities: [], facts: {}, at: NOW,
             text_source: [{ step: "layer", tier: 1, container: "pdf" }],
             text_tier: 1, text_container: "pdf",
             page_count: pages.length, container_extent: null,
             basis: "a synthetic reading for the passage surface" },
  text_units: pages.map((text, i) => ({ extent: { kind: "pdf-page", page: i, rect: null },
                                        seq: i, text })),
});

/* THE READ DOCUMENT — three pages, the search term on page two (0-based 1), so
   the 0-based/1-based conversion has something to get wrong. */
const READ_DOC = "INFO-2026-6200-read";
const SHA_READ = sha("ui62-a-document-somebody-read");
await promote(READ_DOC, infoMd(READ_DOC, "searchedauthority"), "information", {
  document: pdfDocOf(SHA_READ, [
    "Agenda and roll call for the regular meeting.",
    `The ${ONLY_IN_PAGE} test of the main was completed in March.`,
    "Adjournment and the schedule of the next session."]) });

/* THE NEVER-READ DOCUMENT — registered, held, and nobody has looked at it.
   Its own `authority` is what lets section 4 scope a query to it ALONE. */
const UNREAD_DOC = "INFO-2026-6201-unread";
const SHA_UNREAD = sha("ui62-a-document-nobody-read");
await promote(UNREAD_DOC, infoMd(UNREAD_DOC, "neverlookedauthority"), "information",
  { registerOnly: SHA_UNREAD });

const INQ = "INQ-2026-6202";
await promote(INQ, inquiryMd(INQ), "inquiry");

{
  const a = await get("meaningrows", `rows=passage&q=${encodeURIComponent(`passage:${ONLY_IN_PAGE}`)}`);
  ok("the plane itself answers the passage arm over this corpus", a && a.ok === true,
    `got ${JSON.stringify(a).slice(0, 300)}`);
  ok("...and the term really is reachable only inside a captured page",
    (a.rows || []).length === 1 && a.rows[0].bundle_id === READ_DOC);
  const t = await get("search", `q=${encodeURIComponent(ONLY_IN_PAGE)}&mode=ids`);
  eq("...and the DOCUMENT-grain route finds nothing for it, which is what makes the two routes two questions",
    t.ids || [], []);
}

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
  CALLED.push({ op: url.searchParams.get("op"), url });
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
/* `FIND` and `CITE` are module-level `let`s, so a snapshot captured at load
   would never see a later assignment. They are reached through ACCESSORS, which
   is what lets this suite read the state the surface's own code just wrote
   rather than a copy of its initial value. */
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE", "ACT_SOURCE", "loadActSource", "loadSearchFields", "SEARCH_FIELDS",
  "PASSAGE_ARM", "finderPassageArm", "finderPlan", "finderPassageRoute",
  "finderPassagePanelHtml", "finderLevelsHtml", "finderTallyHtml",
  "finderTextPanelHtml", "finderSubjectsPanelHtml", "finderCrossSeamHtml",
  "passageRowHtml", "passageExtent", "passageJumpHtml", "passageCiteParams", "passageCiteAct",
  "citePassage", "citeOpen", "citePaint", "doCite",
  "EXTENT_KIND_WORD", "FOUR_LEVEL_WORD", "FOUR_LEVEL_ORDER",
  "get FIND(){return FIND}", "get CITE(){return CITE}",
].join(",") + "};", ctx);
const U = ctx.__U;
U.PLANE.token = "mem-ui62";
U.PLANE.session = true;
U.PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };
await U.loadSearchFields(true);
await U.loadActSource();

/* A HELPER THAT GOES THROUGH THE SURFACE'S OWN PARSE AND ITS OWN ROUTE — never
   a hand-built plan, which would be this suite deciding what the member typed. */
const askPassages = async (typed) => U.finderPassageRoute(U.finderPlan(typed));

/* ============================================================
   1. THE ROUTE EXISTS ONLY WHERE THE PLANE PUBLISHES THE ARM
   ============================================================ */
console.log("\n--- 1. the arm is the plane's, read back from what it publishes ---");

const armPub = U.finderPassageArm();
ok("the surface finds the passage arm in `op=searchfields`' own `meaning` half", !!armPub);
eq("...and reads its LEVEL from the plane rather than deciding it here", armPub.level, "content");
ok("...and the plane publishes the columns this panel renders, so the row shape is not this file's belief",
  ["ref", "extent", "extent_kind", "seq", "truncated", "chain_kind", "content_id", "snippet"]
    .every((c) => (armPub.rows.columns || []).includes(c)),
  `columns = ${JSON.stringify(armPub.rows.columns)}`);
ok("the arm is NOT published as an ordinary field, so it is never offered as a scope chip",
  !Object.prototype.hasOwnProperty.call(U.SEARCH_FIELDS.fields || {}, U.PASSAGE_ARM));

{
  const plan = U.finderPlan(`${U.PASSAGE_ARM}:${ONLY_IN_PAGE}`);
  eq("a `passage:` term is parsed into the passages seam and NOT reported as unpublished",
    [plan.passages.length, plan.unpublished.length], [1, 0]);
  const crossed = U.finderPlan(`concerns:ENT-1 ${U.PASSAGE_ARM}:${ONLY_IN_PAGE}`);
  ok("a passages term crossing the subjects seam is REFUSED, not quietly intersected",
    crossed.crossSeam === true);
  ok("...and the refusal names the passages terms and offers to run them alone, rather than dropping them",
    /f-alt-passages/.test(U.finderCrossSeamHtml(crossed))
    && U.finderCrossSeamHtml(crossed).includes(`${U.PASSAGE_ARM}:${ONLY_IN_PAGE}`));
}

/* ============================================================
   2. A PASSAGE RENDERS AS CONTENT, WITH ITS `ref` VERBATIM
   ============================================================ */
console.log("\n--- 2. the passage renders with the record's own `ref`, and the jump lands at the reader's page ---");

const HIT = await askPassages(ONLY_IN_PAGE);
ok("a bare word reaches the passages route — the member types a word, not a query language",
  HIT.asked === true && (HIT.rows || []).length === 1, `q=${HIT.q}`);
ok("...and the surface sent it as a `passage:` selector over the plane's own arm",
  (HIT.q || "").includes(`${U.PASSAGE_ARM}:`));
ok("the plane says the member's words REACHED the index, and the surface reads that rather than guessing",
  HIT.matched === true);

const row = HIT.rows[0];
const rowHtml = U.passageRowHtml(row, 0);
ok("the row renders the record's `ref` VERBATIM (DEC-49) — the record's sentence about what this address points at",
  !!row.ref && rowHtml.includes(row.ref), `ref=${JSON.stringify(row.ref)}`);
ok("...with a NOUN beside it from the guarded table, never in place of it",
  rowHtml.includes(U.EXTENT_KIND_WORD["pdf-page"]));
ok("the record's own snippet is rendered, and the matched word is in it",
  typeof row.snippet === "string" && row.snippet.includes(ONLY_IN_PAGE)
  && rowHtml.includes(row.snippet.replace(/&/g, "&amp;")) || rowHtml.includes(ONLY_IN_PAGE),
  `snippet=${JSON.stringify(row.snippet)}`);
ok("the snippet's own bracket markers are left EXACTLY as the record wrote them, never re-marked into tags",
  /\[/.test(row.snippet) && !/<mark>/i.test(rowHtml));

/* THE JUMP. `extent` arrives from `capture_text` as canonical JSON TEXT, not as
   an object, and reading `.page` off the string would silently offer no jump on
   every PDF page in the record. */
eq("the extent arrives as canonical JSON TEXT on this arm", typeof row.extent, "string");
const parsed = U.passageExtent(row);
eq("...and the surface parses it once rather than assuming UI-61's already-parsed shape",
  [parsed.kind, parsed.page], ["pdf-page", 1]);
ok("the jump is offered at the READER's 1-based page, from the record's 0-based one",
  /openBundleAtPage\([^)]*,2\)/.test(U.passageJumpHtml(row)),
  U.passageJumpHtml(row));
ok("...and it names the document the passage is in", U.passageJumpHtml(row).includes(READ_DOC) || rowHtml.includes(READ_DOC));

/* OFFERED ONLY WHERE IT CAN BE COMPLETED (UI-15). */
eq("a kind with no place to jump to offers NO control rather than one that scrolls nowhere",
  U.passageJumpHtml({ ...row, extent_kind: "doc-para", extent: JSON.stringify({ kind:"doc-para", para:3, run:null }) }), "");
ok("an extent this surface cannot parse yields no jump and no claim about a page",
  U.passageJumpHtml({ ...row, extent: "{not json" }) === "");
ok("an extent kind the surface has no noun for still renders the record's `ref`, rather than nothing at all",
  U.passageRowHtml({ ...row, extent_kind: "sheet-range" }, 0).includes(row.ref));

/* ============================================================
   3. ONE SCOPE ACROSS BOTH ROUTES
   ============================================================ */
console.log("\n--- 3. the member's field selectors reach this route, so the denominator is the one they asked for ---");
{
  const scoped = await askPassages(`authority:searchedauthority ${ONLY_IN_PAGE}`);
  ok("a field selector the member typed is sent to the passages route too",
    (scoped.q || "").includes("authority:searchedauthority"), `q=${scoped.q}`);
  /* MEASURED ON `captures_counted` AND NOT ON `documents`, and the reason is
     the plane defect this suite reports below: `documents` is computed with the
     passage arm still applied, so it does not answer "what was in scope" at all.
     `captures_counted` is taken over the query's OTHER arms, as §4.4 requires,
     and is therefore the field that actually measures the denominator. */
  const wide = await askPassages(`authority:neverlookedauthority zzzznotawordanywhere`);
  const whole = await askPassages(`zzzznotawordanywhere`);
  ok("...and it really narrows the tally's denominator, which is the whole reason it must be sent",
    wide.env.scope.captures_counted < whole.env.scope.captures_counted,
    `scoped=${wide.env.scope.captures_counted} whole=${whole.env.scope.captures_counted}`);
  ok("...and the scoped ask really did reach the plane with the member's field on it",
    (scoped.q || "").includes("authority:") && scoped.env && scoped.env.ok === true);
  const unpub = await askPassages(`grade:B ${ONLY_IN_PAGE}`);
  ok("a selector over a name the record publishes as neither is NOT forwarded here, so the record words it once",
    !(unpub.q || "").includes("grade:"), `q=${unpub.q}`);
}

/* ============================================================
   4. THE ABSENCE STATEMENT — FOUR LEVELS, FOUR DISTINGUISHABLE ANSWERS
   ============================================================ */
console.log("\n--- 4. THE ABSENCE STATEMENT: which level was empty, in the record's own words ---");

/* FOUR REAL ANSWERS OVER FOUR REAL SCOPES OF ONE LIVE PLANE. */
const A_HIT      = HIT;                                                       /* matched */
const A_MISS     = await askPassages("zzzznotawordanywhere");                  /* searched, nothing matched */
const A_NOTHING  = await askPassages("authority:neverlookedauthority zzzznotawordanywhere"); /* nothing searchable */
const A_NODOCS   = await askPassages("type:action zzzznotawordanywhere");      /* no document in scope */

for (const [name, a] of [["hit", A_HIT], ["miss", A_MISS], ["nothing-searchable", A_NOTHING], ["no-documents", A_NODOCS]])
  ok(`the ${name} scope really answered (a failed ask would make every comparison below vacuous)`,
    a.asked === true && !a.err && !!a.env, `${name}: ${JSON.stringify(a.err || {}).slice(0, 200)}`);

const P_HIT     = U.finderPassagePanelHtml(A_HIT);
const P_MISS    = U.finderPassagePanelHtml(A_MISS);
const P_NOTHING = U.finderPassagePanelHtml(A_NOTHING);
const P_NODOCS  = U.finderPassagePanelHtml(A_NODOCS);

/* THE CRITERION. Not "each renders something" — each renders something
   DIFFERENT, and the differences are the three causes `CLAUDE.md` names. */
{
  const panels = { P_HIT, P_MISS, P_NOTHING, P_NODOCS };
  const names = Object.keys(panels);
  let distinct = 0, collisions = [];
  for (let i = 0; i < names.length; i++)
    for (let j = i + 1; j < names.length; j++) {
      if (panels[names[i]] !== panels[names[j]]) distinct++;
      else collisions.push(`${names[i]} === ${names[j]}`);
    }
  eq("ALL SIX PAIRS of the four answers render DIFFERENTLY — one empty-state graphic for every empty answer fails here",
    [distinct, collisions], [6, []]);
}

/* AND THE DIFFERENCE IS THE RIGHT DIFFERENCE: each panel carries the plane's own
   sentence for ITS case, and those four sentences are themselves different. */
{
  const says = [A_HIT, A_MISS, A_NOTHING, A_NODOCS].map((a) => a.env.says);
  ok("each panel renders ITS OWN `says` sentence, verbatim and whole — which is ALL a surface may do with it (DEC-8)",
    [[P_HIT, says[0]], [P_MISS, says[1]], [P_NOTHING, says[2]], [P_NODOCS, says[3]]]
      .every(([html, s]) => html.includes(s.replace(/&/g, "&amp;").replace(/"/g, "&quot;")) || html.includes(s)),
    says.map((s) => s.slice(0, 80)).join("\n         "));

  /* ====================================================================
     A MEASURED FINDING ABOUT THE PLANE, REPORTED AND NOT FAILED — the
     `preauth-vocabulary.test.mjs` precedent for a tension this surface
     cannot resolve and must not paper over.

     `says` COLLAPSES TO ONE SENTENCE FOR ALL THREE EMPTIES, and it is the
     WRONG one. Measured here against the live plane: an empty passage answer
     over a scope holding two indexed documents publishes *"nothing matched,
     and no document was in scope to match in — this is an empty DOCUMENT
     level, not an empty record"*. Two documents WERE in scope; the same
     envelope's own `captures_counted` says 2.

     THE CAUSE, read in `query.mjs` rather than inferred. `meaning({mode:
     "axis"})` builds its scope from `cte(false, armSet(rowArm))` — §4.4's
     *other arms*, with the passage arm STRIPPED. `meaning({mode:"levels"})`,
     four hundred lines up, uses the ORDINARY cte with the arm still applied,
     while its own comment says it counts "how many documents the query's
     other arms put in scope at all". So the two halves of one envelope mean
     different things by *in scope*, and the half that feeds the member-facing
     sentence is the wrong one.

     THE CONSEQUENCE IS THE FALSE ABSENCE THIS WHOLE CONSTRUCT EXISTS TO
     REFUSE. `#meaningLevels` tests `documents === 0` BEFORE `searchable ===
     0`, so for ANY passage miss the first branch wins and the two honest
     branches below it are UNREACHABLE. A member who searched two fully
     indexed documents is told the record is empty and to go capture
     something.

     WHY THIS SUITE REPORTS RATHER THAN FAILS: `bio-plane/**` is not this
     item's ground, DEC-8 forbids this surface rewording the sentence, and a
     red here would be this item failing for a defect it may not fix. It is a
     DELEGATION to RECORD, and the assertions below pin what the SURFACE owes
     — that the distinction survives in the tally, which is rendered beside
     the sentence, so a member is not left with the sentence alone.
     ==================================================================== */
  const distinctSays = new Set(says).size;
  console.log(`  REPORT · the plane minted ${distinctSays} distinct \`says\` sentence(s) for 4 genuinely different cases.`);
  if (distinctSays < 4) {
    console.log(`  REPORT · THE THREE EMPTIES COLLAPSE. miss / nothing-searchable / no-documents all publish:`);
    console.log(`           "${A_MISS.env.says}"`);
    console.log(`           …while their own tallies differ: captures_counted = `
      + `${A_MISS.env.scope.captures_counted} / ${A_NOTHING.env.scope.captures_counted} / ${A_NODOCS.env.scope.captures_counted}.`);
    console.log(`  REPORT · CAUSE: query.mjs \`mode==="levels"\` does not strip the row arm from its scope CTE, though`);
    console.log(`           \`mode==="axis"\` does and the levels comment says it does. DELEGATED to RECORD in CLAIMS.md.`);
  }
}

/* THE THREE CAUSES, DISTINGUISHED — BY THE TALLY, WHICH IS WHAT ACTUALLY
   CARRIES THE DISTINCTION TODAY AND IS RENDERED BESIDE THE SENTENCE. This is
   the item's obligation stated in the field that can currently keep it: a scope
   where nothing was searchable must not be indistinguishable from a scope that
   was searched and came back empty, nor from an empty record. */
eq("a scope NOTHING IN WHICH WAS SEARCHABLE is distinguishable: captures counted, and NONE of them indexed",
  [A_NOTHING.env.scope.captures_counted > 0,
   A_NOTHING.env.scope[Object.keys(CONTENT_AXIS_STATES)[0]] + A_NOTHING.env.scope[Object.keys(CONTENT_AXIS_STATES)[1]],
   A_NOTHING.env.scope[Object.keys(CONTENT_AXIS_STATES)[3]] > 0],
  [true, 0, true]);
eq("a scope with NO DOCUMENT AT ALL is distinguishable: not one capture was counted",
  A_NODOCS.env.scope.captures_counted, 0);
ok("a SEARCHED scope that matched nothing is distinguishable: captures counted AND some of them indexed",
  A_MISS.env.scope.captures_counted > 0
  && A_MISS.env.scope[Object.keys(CONTENT_AXIS_STATES)[0]] > 0,
  JSON.stringify(A_MISS.env.scope));
ok("and the surface RENDERS that distinction on each panel, so a member is never left with the sentence alone",
  P_NOTHING.includes(`data-axis="${Object.keys(CONTENT_AXIS_STATES)[3]}"`)
  && /f-pass-denominator/.test(P_MISS) && /f-pass-axis/.test(P_MISS));

/* RENDERED ON A HIT TOO, AND THIS IS THE HALF A PRESENCE CHECK WOULD MISS. */
ok("the absence statement renders on a HIT as well — the line that says how much of the scope was never read",
  /f-pass-levels/.test(P_HIT) && /f-pass-axis/.test(P_HIT));
ok("...and on a hit the record's own sentence carries the unread count rather than only the matches",
  /NOT been read at passage grain|every capture of which has been read at passage grain/.test(A_HIT.env.says),
  A_HIT.env.says);

/* ALL FOUR LEVELS, ALWAYS, EACH WITH THE PLANE'S OWN SENTENCE. */
for (const [name, panel, a] of [["hit", P_HIT, A_HIT], ["nothing-searchable", P_NOTHING, A_NOTHING]]) {
  const lv = a.env.levels;
  eq(`the plane names four levels on the ${name} answer`,
    Object.keys(lv).sort(), ["content", "document", "internet", "meaning"]);
  ok(`every one of the four is RENDERED on the ${name} panel, none hidden`,
    Object.keys(lv).every((k) => new RegExp(`data-level="${k}"`).test(panel)));
  ok(`...and every one carries the plane's OWN sentence, not a surface paraphrase (${name})`,
    Object.values(lv).every((l) => panel.includes(String(l.why).replace(/'/g, "&#39;"))
                                || panel.includes(String(l.why))),
    Object.entries(lv).map(([k, l]) => `${k}: ${String(l.why).slice(0, 60)}`).join("\n         "));
  ok(`...and every one carries the plane's own STATE token (${name})`,
    Object.values(lv).every((l) => panel.includes(`data-state="${l.state}"`)));
}
ok("the two levels this read cannot see are stated as UNDETERMINED rather than omitted — an omitted level reads as an empty one",
  A_HIT.env.levels.internet.state === "UNDETERMINED" && A_HIT.env.levels.meaning.state === "UNDETERMINED"
  && /data-level="internet"/.test(P_HIT) && /data-level="meaning"/.test(P_HIT));
ok("a level this file has no word for would still be rendered, with its own key — the order is a preference, never a filter",
  U.finderLevelsHtml({ levels: { ...A_HIT.env.levels, quantum: { state:"UNDETERMINED", why:"a level from a later plane" } } })
    .includes("a level from a later plane"));

/* ============================================================
   5. THE FIVE-BUCKET TALLY, AND THE BOUND AS A SAMPLE
   ============================================================ */
console.log("\n--- 5. the tally: five buckets, the plane's own vocabulary, and no proportions ---");

const BUCKETS = [...Object.keys(CONTENT_AXIS_STATES), CONTENT_AXIS_UNDETERMINED];
eq("the content axis really has FIVE answers, and the fifth is not a member of the four",
  [BUCKETS.length, BUCKETS.includes(CONTENT_AXIS_UNDETERMINED), Object.keys(CONTENT_AXIS_STATES).length],
  [5, true, 4]);
ok("the plane publishes all five on the envelope, so a four-bucket surface would be reporting an unindexed corpus as indexed",
  BUCKETS.every((b) => typeof A_HIT.env.scope[b] === "number"),
  JSON.stringify(A_HIT.env.scope));
ok("every one of the five is RENDERED, keyed by the plane's own name",
  BUCKETS.every((b) => new RegExp(`data-axis="${b}"`).test(P_HIT)));
ok("the four the plane words are rendered in ITS words, never a copy learned here",
  Object.values(CONTENT_AXIS_STATES).every((s) => P_HIT.includes(s.replace(/'/g, "&#39;")) || P_HIT.includes(s)));
ok("the tally is driven off the PUBLISHED vocabulary, so a sixth state would appear without an edit here",
  U.finderTallyHtml({ scope: { ...A_HIT.env.scope, quixotic: 7 },
                      content_axis: { vocabulary: { ...CONTENT_AXIS_STATES, quixotic: "a state from a later plane" },
                                      undetermined_value: CONTENT_AXIS_UNDETERMINED } })
    .includes("a state from a later plane"));
ok("the never-read document really does land in the not-extracted bucket, so this tally is measuring something",
  A_HIT.env.scope[Object.keys(CONTENT_AXIS_STATES)[3]] >= 1,
  JSON.stringify(A_HIT.env.scope));
ok("and where that bucket is non-zero the surface says WHICH cause it cannot tell you, rather than implying one",
  /f-pass-cause/.test(P_HIT) && /not on this answer/.test(P_HIT));

/* THE PRESENTATION QUESTION §4.4 LEFT OPEN, DECIDED AND PINNED. */
eq("the bound this scope is counted against is the plane's own constant",
  A_HIT.env.scope.captures_bound, MEANING_AXIS_CAP);
ok("UNBOUNDED: the denominator is named as ALL of the captures in scope, and no sample card appears",
  /f-pass-denominator/.test(P_HIT) && /<b>all \d+<\/b> of the captures in scope/.test(P_HIT)
  && !/f-pass-sample/.test(P_HIT),
  P_HIT.slice(P_HIT.indexOf("f-pass-denominator"), P_HIT.indexOf("f-pass-denominator") + 240));
{
  /* BOUND: driven by handing the renderer a truncated envelope, because this
     corpus cannot hold 500 captures and a suite that could not exercise the
     bound would be pinning only the branch that never bites. */
  const bounded = U.finderTallyHtml({
    scope: { ...A_HIT.env.scope, captures_truncated: true, captures_counted: MEANING_AXIS_CAP },
    content_axis: A_HIT.env.content_axis });
  ok("BOUND: the word SAMPLE appears beside the figures, and the census reading is explicitly withdrawn",
    /f-pass-sample/.test(bounded) && /a sample, not a census/.test(bounded));
  ok("...the denominator in the HEADING changes to name the bound, rather than the change living in a footnote",
    /<b>the first \d+<\/b> of the captures in scope/.test(bounded)
    && !/<b>all \d+<\/b>/.test(bounded),
    bounded.slice(bounded.indexOf("f-pass-denominator"), bounded.indexOf("f-pass-denominator") + 200));
  ok("...and the captures past the bound are said to be in NO bucket, rather than left to be assumed like the counted ones",
    /in none of the figures below/.test(bounded));
  ok("NO PROPORTIONS ANYWHERE, bounded or not — a percentage over a sample cannot be checked by eye",
    !/%/.test(bounded) && !/%/.test(P_HIT) && !/per ?cent/i.test(bounded));
}

/* ============================================================
   6. CITE THIS — through the composer, carrying the passage
   ============================================================ */
console.log("\n--- 6. citing a passage: the composer carries the address, and prefills nothing ---");

ok("the row offers the act the record publishes, and it is reachable for this credential", !!U.passageCiteAct());
ok("...and the row renders a control for it", /data-cite-passage="0"/.test(rowHtml));

await U.citePassage(row);
const CITE = U.CITE;
ok("the composer opened over the passage's OWN document, and over exactly one",
  !!CITE && CITE.passage === row, `ids=${JSON.stringify(CITE && CITE.ids)}`);
eq("...and over exactly one document, because a part of a document is a part of ONE",
  CITE.ids, [READ_DOC]);

/* THE QUESTION ARM — the address is stated in the record's own words. */
CITE.target = INQ; CITE.targetType = "inquiry"; CITE.role = "supports";
U.citePaint();
const dlgQ = $$("#dlg")._html;
ok("the composer STATES the address it will write, in the record's own `ref` (DEC-49)",
  /cx-passage/.test(dlgQ) && dlgQ.includes(row.ref), `ref=${JSON.stringify(row.ref)}`);
ok("...and it says whether the record already holds a passage at this address, rather than leaving it to be discovered",
  /Nothing has been cited at this address yet|the record already holds|record has a citable passage/i.test(dlgQ)
  || /Nothing is cited here yet/.test(dlgQ));
ok("NOTHING IS PREFILLED (DEC-69): no page box, no kind chooser, no rectangle drawn on the member's behalf",
  !/<input[^>]*cx-extent/i.test(dlgQ) && !/type="number"/i.test(dlgQ) && !/<select[^>]*extent/i.test(dlgQ));
ok("the whole-document default region is ABSENT here, because there is nothing to default — the member chose",
  !/does not yet offer a way to pick one/.test(dlgQ));

/* THE CASE ARM — the passage will NOT be recorded, and that is said BEFORE the act. */
CITE.target = INQ; CITE.targetType = "project"; CITE.role = null;
U.citePaint();
const dlgC = $$("#dlg")._html;
ok("on a CASE the composer says the passage will NOT be recorded, before the member commits",
  /cx-passage-dropped/.test(dlgC) && /will not be recorded/i.test(dlgC));
ok("...and it names the address anyway, so the member can see exactly what is being dropped",
  dlgC.includes(row.ref));

/* THE WIRE. */
{
  const p = U.passageCiteParams(row);
  ok("the act's parameters are DERIVED from the canonical extent — `extent_<key>`, not a hand list",
    p && p.extent_kind === "pdf-page" && p.extent_page === "1", JSON.stringify(p));
  ok("a null field is OMITTED rather than sent empty — the act reads an empty string as `not stated`",
    p && !("extent_rect" in p), JSON.stringify(p));
  ok("`extent_ref` is NOT sent: the record derives the human form from the address, and one fact has one source",
    p && !("extent_ref" in p), JSON.stringify(p));
  const withId = U.passageCiteParams({ ...row, content_id: "CON-123" });
  eq("where the record already holds a row at this address, its id is sent ALONE — a leg naming both is refused",
    withId, { content_id: "CON-123" });
}

/* AND IT REALLY REACHES THE ACT. Driven through the surface's own commit. */
{
  CITE.target = INQ; CITE.targetType = "inquiry"; CITE.role = "supports"; CITE.busy = false;
  const before = CALLED.length;
  await U.doCite();
  const citeCall = CALLED.slice(before).find((c) => c.op === "cite");
  ok("the commit reached `op=cite`", !!citeCall);
  eq("...carrying the passage's own page, flat on the wire where the act's dispatcher gathers it",
    [citeCall.url.searchParams.get("extent_kind"), citeCall.url.searchParams.get("extent_page")],
    ["pdf-page", "1"]);
  const res = U.CITE.result;
  ok("and the RECORD ACCEPTED it — the leg rests on the passage, not on the whole document",
    !!res && !U.CITE.refusal, JSON.stringify(U.CITE.refusal || {}).slice(0, 400));
  const eb = await get("earnedbasis", `id=${INQ}`);
  const legs = (eb.legs || []);
  ok("the question now carries a leg, and the record resolved it to a content row at the passage's address",
    legs.length === 1 && !!legs[0].content_id, JSON.stringify(legs).slice(0, 300));
  const std = (eb.earned && eb.earned.content) ? eb.earned.content[legs[0].content_id] : null;
  eq("...and that row is the PAGE, which is the whole point of the item",
    std && std.extent_kind, "pdf-page");
  ok("...and its `ref` is the record's own words for that page, which is what the leg display will show",
    !!std.ref && /page 2/.test(std.ref), `ref=${JSON.stringify(std && std.ref)}`);
}

/* THE CASE ARM DOES NOT SEND IT, which is the other half of the sentence above. */
{
  await U.citePassage(row);
  const C2 = U.CITE;
  C2.target = INQ; C2.targetType = "project"; C2.role = null; C2.busy = false;
  const before = CALLED.length;
  await U.doCite();
  const citeCall = CALLED.slice(before).find((c) => c.op === "cite");
  ok("on the CASE arm the extent is not sent at all, so the composer's sentence and the wire cannot disagree",
    !!citeCall && !citeCall.url.searchParams.get("extent_kind") && !citeCall.url.searchParams.get("content_id"),
    citeCall ? citeCall.url.search : "no cite call");
}

/* ============================================================
   7. OVER-STRICTNESS — the walks that were here before did not move
   ============================================================ */
console.log("\n--- 7. over-strictness: correct work in the spellings that were already here still passes ---");

{
  /* A COMPOSER OPENED WITHOUT A PASSAGE IS BYTE-IDENTICAL TO WHAT IT WAS. Every
     other entry point into this dialog passes no passage, and this pins that the
     new branch is genuinely a branch rather than a rewrite. */
  await U.citeOpen({ ids: [READ_DOC], handle: null, act: U.passageCiteAct(), title: READ_DOC });
  const C = U.CITE;
  C.target = INQ; C.targetType = "inquiry"; C.role = "supports";
  U.citePaint();
  const plain = $$("#dlg")._html;
  ok("a cite opened with NO passage still states the whole-document default and offers no picker",
    /whole document/i.test(plain) && /does not yet offer a way to pick one/.test(plain));
  ok("...and carries none of this item's passage markup",
    !/cx-passage/.test(plain));
  ok("...and still prefills nothing", !/<input[^>]*cx-extent/i.test(plain) && !/type="number"/i.test(plain));
}
{
  /* THE TWO PRE-EXISTING PANELS RENDER EXACTLY AS THEY DID — this item added a
     third panel beside them and changed neither. A `not asked` text panel and a
     `not asked` subjects panel are the shapes every query that reaches only one
     seam produces, so they are the ones worth pinning. */
  eq("the text panel's not-asked walk is unchanged",
    U.finderTextPanelHtml({ asked: false }, new Set()),
    `<h2 class="sec">Text and fields</h2><p class="subj-note">Not asked: nothing you typed is a term this route can answer.</p>`);
  ok("the subjects panel's not-asked walk is unchanged",
    U.finderSubjectsPanelHtml({ asked: false }, new Set())
      .includes("this route answers about a SUBJECT"));
  ok("a query naming neither seam still reaches the text route exactly as before",
    U.finderPlan("sewer fund").text.length === 2 && U.finderPlan("sewer fund").passages.length === 0);
}
{
  /* NOTHING PREFILLED, AND THE ROW'S OWN NEGATIVE CONTROL NAMES THIS ONE: *a
     prefilled query -> the reach arm fails*. The composer's half is asserted in
     section 6; this is the QUERY's half. A finder that opened with a term
     already in the box would be asking the record a question the member did not
     ask and presenting the answer as theirs — and on this surface it would also
     pre-narrow the absence statement's denominator, so a member would read a
     coverage sentence about a scope nobody chose. */
  const shell = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const box = /<input id="s-q"[^>]*>/.exec(shell)?.[0] || "";
  ok("the finder's own search box carries a PLACEHOLDER and no value — nothing is asked on the member's behalf",
    box.length > 0 && /placeholder=/.test(box) && !/\bvalue=/.test(box), box);
  const empty = await U.finderPassageRoute(U.finderPlan(""));
  eq("with nothing typed and no scope, the passages route is NOT ASKED rather than asked something invented",
    [empty.asked, !!empty.env], [false, false]);
}
{
  /* AND AN ARM THE PLANE DOES NOT PUBLISH IS ABSENT RATHER THAN EMPTY. */
  const saved = U.SEARCH_FIELDS.meaning;
  U.SEARCH_FIELDS.meaning = null;
  const none = await askPassages(ONLY_IN_PAGE);
  ok("against a plane that does not publish the arm, the route is NOT ASKED rather than answered empty",
    none.asked === false && none.armUnpublished === true);
  ok("...and the panel says it was never a question this plane could answer, rather than showing a zero",
    /never a question this plane could answer/.test(U.finderPassagePanelHtml(none)));
  ok("...and a `passage:` term is then reported as a name the record publishes as neither",
    U.finderPlan(`${U.PASSAGE_ARM}:x`).unpublished.length === 1);
  U.SEARCH_FIELDS.meaning = saved;
  ok("...and restoring the vocabulary restores the route (the arm did not latch)",
    !!U.finderPassageArm());
}

/* ==================================================================== */
console.log(`\npassage-surface: ${pass} pass, ${fail} fail`);
/* THE PLANE IS DISPOSED BEFORE THE EXIT, and the first draft of this file did
   not do it. A green run then never called `process.exit`, miniflare held the
   event loop open, and the suite HUNG AFTER PRINTING ITS OWN PASSING TALLY —
   which under the runner's `execFileSync` is an indefinite stall, not a
   failure. It is `content-extent.test.mjs`'s own last two lines, and the order
   matters: dispose, then exit on the count. */
await mf.dispose();
if (fail) process.exit(1);
