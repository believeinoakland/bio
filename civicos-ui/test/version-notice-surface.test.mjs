/* NEGATIVE CONTROL: RAN 2026-09-25 by the UI-96 worker, driver `test/version-notice-surface.control.mjs`, SIX ARMS INCLUDING A BASELINE, each ONE splice of the extracted script (anchor matched exactly once), handed to this suite through UI96_APP_SRC so app.html is never edited and nothing needs restoring. EVERY ARM AS DECLARED GREEN/RED. baseline 29/0. collapse (THE ROW'S NAMED CONTROL: chain_unread drawn as the earned silence) 28/1, failing at "NOT READ (the chain): drawn as UNDETERMINED, never as 'no newer version'". unreadcapture (a newer capture nobody has read drawn as "no newer version") 27/2, failing at "NOT READ (the newer capture): the reason says NOBODY HAS READ it" and "...it is UNDETERMINED and never the earned silence". onload (the leg row asks as it is drawn) 28/1, failing at "NOTHING IS ASKED ON LOAD". reworded (DEC-8: the chain_unread sentence replaced by this surface's prose) 28/1, failing at "the chain_unread sentence is rendered verbatim, with its reason". overstrict (a label spelled differently) 29/0, as it must. TWO ARMS TOOK DOWN FEWER ASSERTIONS THAN DECLARED, recorded rather than smoothed: collapse was declared to fail the "verbatim" arm too and did not, because the collapsed branch renders `states[n.state]`, which for chain_unread IS the plane's chain_unread sentence — so the collapse is caught by HOW it is drawn, not by what it says; and unreadcapture was declared to fail "does not say the passage moved" and did not, correctly, since the silence it substitutes says nothing about moving. The declarations were wrong, not the arms.
 *
 * UI-96 / D-394 — THE CROSS-VERSION NOTICE WHERE A MEMBER MEETS A CITATION
 * (`BIO_Content_Framework_v0_10.md` §18.1; the plane half is `op=versionnotice`, C-80).
 *
 * A member whose question rests on a passage was never told the document has a newer
 * version. The plane now answers when asked; this is the place a member ASKS — one
 * control per leg whose referent is a passage (Bob, 2026-09-24, option D: anyone may ask;
 * the proactive telling of a published case's owners is REC-209's delivery).
 *
 * HOW A LIAR PASSES A WEAKER VERSION OF THIS SUITE, and the arm that catches each:
 *   (a) it renders a chain it never READ as "no newer version" — the collapse the row's
 *       own control names — section 3's NOT READ arms: the no-address leg must render
 *       the plane's chain_unread sentence as UNDETERMINED and must NOT carry the earned
 *       silence's sentence; the never-read newer capture must name that nobody has read it.
 *   (b) it composes its own friendlier sentences — every sentence asserted below is read
 *       from the PLANE's own answer to the same question, asked by this suite directly,
 *       and must appear in the rendering verbatim (DEC-8).
 *   (c) it renders one generic notice for every answer — the five renderings must be
 *       PAIRWISE DIFFERENT.
 *   (d) it asks on page load, telling everyone — section 1: drawing the legs makes ZERO
 *       versionnotice calls; the read happens only when the control is used.
 *
 * WHY THE REAL PLANE: the states, sentences and reasons under assertion are minted by
 * `Store#versionNotice`; a mock composing them would assert this file against itself.
 *
 * WHAT THIS SUITE CANNOT SEE, stated: it drives the leg row and the ask through their own
 * functions, not the whole `openInquiry` page (whose ~ten other reads are other suites');
 * it drives pdf-page and whole-document legs only, as the plane suite does; and it does not
 * reach REC-209's owner delivery, which is not built.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a suite's own exit must not discard its own output */
import fs from "fs";
import vm from "vm";
import { createHash, webcrypto } from "crypto";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { appScript } from "./extract.mjs";
import { withSurfacingRun } from "../../bio-plane/test/surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import { VERSION_NOTICE_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
const eq = (label, got, want) => ok(label, JSON.stringify(got) === JSON.stringify(want),
  `want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`);

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare, normalizeAddress;
try {
  ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href));
  ({ normalizeAddress } = await import("../../bio-plane/src/subresources.mjs"));
} catch (e) {
  console.error("version-notice-surface: the real plane could not be started — run `npm ci` in bio-plane/.");
  console.error("  " + String(e && e.message || e));
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui96", MEMBER_TOKEN: "mem-ui96", PROBE_TOKEN: "prb-ui96", VERSION: "test",
              INSTANCE_NAME: "fixture-group" },
}));

try {
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-ui96") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-ui96") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ============================================================
   0. THE GROUND — `bio-plane/test/versionnotice.test.mjs`'s shapes, five of them:
      a newer capture with the passage's extent in it, one without it, one nobody
      has read, a chain of one, and a capture with no recorded address.
   ============================================================ */
console.log("\n--- 0. the ground: five version histories and one question citing a passage of each ---");
const NOW = "2026-09-25T00:00:00Z", LATER = "2026-09-25T01:00:00Z";
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: mechanical", "  capability_tier: daemon",
  "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: City Clerk", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inquiryMd = (id, legs) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  ...(legs.length ? ["references:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    rel: cites",
                                                            "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
    ...(l.kind ? [`    extent_kind: ${l.kind}`] : []), ...(l.page !== undefined ? [`    extent_page: ${l.page}`] : [])])] : []),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const chainOf = (pages) => [
  { step: "pixels", extent: { kind: "pages", pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" },
    extent: { kind: "pages", pages } }];
const readingOf = (captureSha, pages) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 4096 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW,
             entities: [], facts: {}, text_source: chainOf(pages) } });
let snapSeq = 0;
const HEAD = new Map();
const mustPromote = async (id, text, type, { captures = [] } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  const read = captures.filter((c) => c.pages);
  if (read.length) {
    const prov = JSON.stringify({ documents: read.map((c) => readingOf(c.sha, c.pages)) });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260925T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type,
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files,
    register: captures.map((c) => ({ sha256: c.sha, path: `documents/${c.sha.slice(0, 8)}.pdf`,
                                     encoding: "binary", bytes: 4096 })) });
  if (r?.ok === false) throw new Error(`promote ${id} REFUSED: ${JSON.stringify(r).slice(0, 900)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};
const locate = async (address, captureSha, retrieved) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const r = rP(await (await ns.get(ns.idFromName("bio")).fetch("http://x/recordcapturedlocator",
    { method: "POST", body: JSON.stringify({ address, addressNorm: address, captureSha, retrieved }) })).json());
  if (r?.ok === false) throw new Error(`recordcapturedlocator ${address}: ${JSON.stringify(r)}`);
};
const A = (p) => normalizeAddress(`https://www.oaklandca.gov/ui96/${p}.pdf`);
const S = (k) => sha(`ui96 capture ${k}`);
const V = {
  M1: { sha: S("M1"), doc: "INFO-2026-0960-m1", at: "2026-01-01T09:00:00Z", pages: [0, 1, 2], addr: A("minutes") },
  M2: { sha: S("M2"), doc: "INFO-2026-0960-m2", at: "2026-03-01T09:00:00Z", pages: [0, 1, 2, 3], addr: A("minutes") },
  U1: { sha: S("U1"), doc: "INFO-2026-0960-u1", at: "2026-01-02T09:00:00Z", pages: [0, 1, 2, 3, 4], addr: A("budget") },
  U2: { sha: S("U2"), doc: "INFO-2026-0960-u2", at: "2026-03-02T09:00:00Z", pages: [0, 1], addr: A("budget") },
  N1: { sha: S("N1"), doc: "INFO-2026-0960-n1", at: "2026-01-03T09:00:00Z", pages: [0, 1, 2], addr: A("staff-report") },
  N2: { sha: S("N2"), doc: "INFO-2026-0960-n2", at: "2026-03-03T09:00:00Z", pages: null, addr: A("staff-report") },
  S1: { sha: S("S1"), doc: "INFO-2026-0960-s1", at: "2026-01-04T09:00:00Z", pages: [0, 1], addr: A("charter") },
  X1: { sha: S("X1"), doc: "INFO-2026-0960-x1", at: null, pages: [0, 1], addr: null },
};
for (const v of Object.values(V)) await mustPromote(v.doc, infoMd(v.doc), "information", { captures: [v] });
for (const v of Object.values(V)) if (v.addr) await locate(v.addr, v.sha, v.at);
const SUB = "INQ-2026-0960-sub", INQ = "INQ-2026-0960-main";
await mustPromote(SUB, inquiryMd(SUB, []), "inquiry");
const LEGS = [
  { target: V.M1.doc, kind: "pdf-page", page: 1 },   // 0 newer, the extent IN it: a candidate
  { target: V.U1.doc, kind: "pdf-page", page: 3 },   // 1 newer, the extent OUTSIDE it
  { target: V.N1.doc, kind: "pdf-page", page: 1 },   // 2 newer, never READ
  { target: V.S1.doc, kind: "pdf-page", page: 0 },   // 3 a chain of one: silence, earned
  { target: V.X1.doc, kind: "pdf-page", page: 0 },   // 4 no address: the chain CANNOT be read
  { target: SUB },                                    // 5 another question: no passage
];
const pInq = await mustPromote(INQ, inquiryMd(INQ, LEGS), "inquiry");
const cidAt = (ord) => (pInq.content || []).find((c) => c.ord === ord)?.content_id ?? null;
eq("the ground: every leg citing a document resolves to a content row, and the sub-question's does not",
  LEGS.map((_, o) => !!cidAt(o)), [true, true, true, true, true, false]);
/* THE PLANE'S OWN ANSWER, asked directly — the ground truth every rendering is held to. */
const TRUTH = [];
for (let o = 0; o < 5; o++) TRUTH[o] = (await get("versionnotice", `content=${cidAt(o)}`)).notices?.[0] || {};
const STATES = (await get("versionnotice", `content=${cidAt(0)}`)).states || {};
eq("GROUND TRUTH GUARD: the plane answers the five legs in the five shapes this suite depends on",
  TRUTH.map((n) => [n.state, (n.candidates || [])[0]?.reason ?? null]),
  [["newer_capture_matched", "extent_in_newer_capture"], ["newer_capture_undetermined", "outside_newer_capture"],
   ["newer_capture_undetermined", "newer_capture_unread"], ["no_newer_capture", null], ["chain_unread", null]]);
ok("GROUND TRUTH GUARD: the plane publishes a sentence for each of its four states",
  ["no_newer_capture", "newer_capture_matched", "newer_capture_undetermined", "chain_unread"]
    .every((k) => typeof STATES[k] === "string" && STATES[k].length > 20), JSON.stringify(Object.keys(STATES)));

/* ============================================================
   1. THE SURFACE, LOADED, WITH ITS OWN FETCH BRIDGED TO THE PLANE
   ============================================================ */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", addEventListener(){}, querySelector:()=>el(), querySelectorAll:()=>[],
    insertAdjacentHTML(){}, focus(){}, click(){}, remove(){} };
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
/* The control driver hands a spliced script through UI96_APP_SRC; nothing in the tree is edited. */
const SRC = process.env.UI96_APP_SRC ? fs.readFileSync(process.env.UI96_APP_SRC, "utf8") : appScript();
vm.runInContext(SRC + ";globalThis.__U = {" + [
  "PLANE", "esc", "recR", "legReferent", "basisLegRow", "versionNoticeAskHtml", "askVersionNotice", "versionNoticeHtml",
].join(",") + "};", ctx);
const U = ctx.__U;
U.PLANE.token = "mem-ui96";
U.PLANE.session = true;
U.PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };
const plain = (h) => String(h || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
const has = (html, sentence) => String(html).includes(U.esc(String(sentence)));

/* ============================================================
   2. THE CONTROL, AT THE CITATION, AND NO READ UNTIL IT IS USED
   ============================================================ */
console.log("\n--- 1. the ask control sits on every leg that rests on a passage, and nothing is asked on load ---");
const REF = await U.recR("earnedbasis", { id: INQ });
const rows = LEGS.map((l, o) => U.basisLegRow(l, o, U.legReferent(REF, o)));
eq("EVERY PASSAGE LEG carries the ask control, and the leg citing another question does not",
  rows.map((h) => /askVersionNotice\(/.test(h)), [true, true, true, true, true, false]);
ok("...and each control asks about ITS OWN leg's passage, named by the record's content id",
  rows.slice(0, 5).every((h, o) => h.includes(U.esc(JSON.stringify(cidAt(o)))) && h.includes(`id="vn-${o}"`)));
eq("NOTHING IS ASKED ON LOAD: drawing every leg made zero versionnotice reads",
  CALLED.filter((c) => c.op === "versionnotice").length, 0);
eq("OVER-STRICTNESS: a leg with no referent read renders no control rather than a broken one",
  /vn-/.test(U.basisLegRow(LEGS[0], 0, null)), false);

/* ============================================================
   3. THE ANSWER, RENDERED IN THE PLANE'S OWN WORDS
   ============================================================ */
console.log("\n--- 2. each state rendered as the plane states it ---");
const OUT = [];
for (let o = 0; o < 5; o++) {
  const before = CALLED.length;
  await U.askVersionNotice(cidAt(o), o);
  const asked = CALLED.slice(before).filter((c) => c.op === "versionnotice");
  ok(`leg ${o}: using the control made ONE versionnotice read, for this leg's passage and no other`,
    asked.length === 1 && asked[0].url.searchParams.get("content") === cidAt(o) && !asked[0].url.searchParams.get("target"));
  OUT[o] = $$(`#vn-${o}`).innerHTML;
}
const [M, OUTSIDE, UNREAD, SILENT, NOCHAIN] = OUT;

ok("MATCHED: the plane's state sentence is rendered verbatim", has(M, TRUTH[0].says));
ok("MATCHED: the candidate is rendered with the plane's own CANDIDATE sentence, never as the same passage",
  has(M, TRUTH[0].candidates[0].says) && /CANDIDATE/.test(M));
ok("MATCHED: a candidate is not drawn as undetermined", !/g-unconf/.test(M));

ok("OUTSIDE: the plane's undetermined sentence is rendered verbatim, drawn as UNDETERMINED",
  has(OUTSIDE, TRUTH[1].says) && /undetermined/.test(plain(OUTSIDE)) && /card undet/.test(OUTSIDE));
ok("OUTSIDE: its reason is the plane's own — the passage may have moved",
  has(OUTSIDE, TRUTH[1].candidates[0].says) && /may have moved/.test(plain(OUTSIDE)));

ok("NOT READ (the newer capture): the reason says NOBODY HAS READ it, in the plane's own sentence",
  has(UNREAD, TRUTH[2].candidates[0].says) && /nobody has read the newer capture/.test(plain(UNREAD)));
ok("NOT READ (the newer capture): it is UNDETERMINED and never the earned silence",
  /card undet/.test(UNREAD) && !has(UNREAD, STATES.no_newer_capture) && !/holds nothing after it/.test(UNREAD));
ok("NOT READ (the newer capture): it does not say the passage moved — that would be the record inventing a revision",
  !/may have moved/.test(plain(UNREAD)));

ok("NOT READ (the chain): the chain_unread sentence is rendered verbatim, with its reason",
  has(NOCHAIN, TRUTH[4].says) && has(NOCHAIN, TRUTH[4].why));
ok("NOT READ (the chain): drawn as UNDETERMINED, never as 'no newer version'",
  /card undet/.test(NOCHAIN) && /undetermined/.test(plain(NOCHAIN))
  && !has(NOCHAIN, STATES.no_newer_capture) && !/holds nothing after it/.test(NOCHAIN));
eq("NOT READ (the chain): the plane itself answered newer:null there, which is what the rendering must not round off",
  TRUTH[4].newer, null);

ok("SILENCE, EARNED: the chain of one renders the plane's own no-newer sentence and why",
  has(SILENT, STATES.no_newer_capture) && has(SILENT, TRUTH[3].why));
ok("SILENCE, EARNED: and is not drawn as undetermined", !/g-unconf/.test(SILENT) && !/card undet/.test(SILENT));

ok("EVERY RENDERING states whose chains were read (a version inside an uninvited project is not in them)",
  OUT.every((h) => /visible to you/.test(plain(h))));
eq("FIVE ANSWERS, FIVE RENDERINGS: pairwise different, so no one generic notice passes",
  new Set(OUT).size, 5);

/* ============================================================
   4. A REFUSAL, AND A STATE THIS SURFACE HAS NEVER SEEN
   ============================================================ */
console.log("\n--- 3. a refusal and an unknown state ---");
{
  const r = await U.askVersionNotice("content-that-does-not-exist", 9);
  const h = $$("#vn-9").innerHTML;
  ok("A REFUSAL is rendered in the plane's own translation, with its code",
    has(h, VERSION_NOTICE_CHECKS.VERSION_NOTICE_NO_CONTENT.translation) && h.includes("VERSION_NOTICE_NO_CONTENT"),
    JSON.stringify(r).slice(0, 300));
}
{
  const h = U.versionNoticeHtml({ ok: true, notices: [{ state: "x_future_state", says: "A sentence from a later plane.",
    candidates: [] }], visible_to: "the version chains here are the ones visible to you" });
  ok("OVER-STRICTNESS: a state this surface does not know is rendered by its code and the plane's sentence, never dropped",
    h.includes("x_future_state") && h.includes("A sentence from a later plane."));
}

} catch (e) {
  /* A throw goes through no assertion; it is counted, so the tally never reads clean over a crash. */
  console.log(`  FAIL  the suite did not reach its foot: ${String(e && e.stack || e).slice(0, 600)}`); fail++;
} finally {
  console.log(`\nversion-notice-surface: ${pass} pass, ${fail} fail`);
  await mf.dispose();
}
if (fail) process.exit(1);
