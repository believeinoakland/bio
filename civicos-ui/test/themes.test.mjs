/* UI-76 — A MEMBER DECLARES, TESTS AND PLACES A THEME, AND EVERY THEME SHOWS WHOSE LENS IT IS.
 *
 * THE ROW: no surface let a member declare, test or place a theme, or showed whose lens a theme is —
 * D-162's surface half. D-162's four ops (`op=themedeclare`, `op=themeplace`, `op=themepropose`,
 * `op=themeread`; IC-241) are on `main`, verified at the code by name (`themeDeclare`, `themePlace`,
 * `themePropose`, `themeRead` in `bio-plane/src/store.mjs`) before this suite rested on them.
 *
 * DESIGN: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.4, fences 1–3, with DEC-69 (inform once,
 * at the act). Fence 1 as CORRECTED 2026-09-24 by BOB #32 (Membership v2 §3): every reading shows the
 * declarer's HANDLE; the member id and the cover reach administrators alone. The row's own words say
 * "the cover shown on every theme" — written before that ruling — so the arm the row calls THE COVER ARM
 * asserts what the plane projects for the reader: the handle for a member, the handle AND the cover for
 * an administrator. Hiding the declarer fails it (the row's control, below).
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * `bio-plane/src/index.mjs` runs under miniflare and the surface's `fetch` is bridged to it, so every
 * declaration and placement below is the SURFACE's own act reaching the real op, and every sentence
 * asserted rendered is read out of the plane's own answer in the same run. The one sentence the page
 * authors, `THM_HUNCH_LABEL`, is read out of the page itself: its property is that it is on every hunch.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (1) RENDERING A PROPOSAL AS MEMBERSHIP (the row's own liar) — §5 asserts every hunch card carries the
 *      hunch label, that the label count equals the plane's hunch count, and that no hunch's target is
 *      written inside the members section; §6 asserts the ONE confirmed hunch moves sections only after
 *      a member's act.
 *  (2) A THEME RENDERED WITHOUT ITS DECLARER — §2 walks EVERY theme card the list renders and the page,
 *      for a member reader and for an administrator, against the plane's projection for that reader.
 *  (3) A PREFILLED FORM — §1 reads the declare and place fields empty on open, and the wire carries
 *      exactly what the member wrote.
 *  (4) A REFUSAL IN THE PAGE'S OWN WORDS — §7 compares each rendered refusal VERBATIM with the plane's
 *      canned `translation` (DEC-49), imported from `THEME_CHECKS`, the one place it is written.
 *  (5) A PAGE THAT PROPOSES — §8: the surface never sends `op=themepropose`.
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - The DOM is a stub (every civicos-ui suite's reach): handlers are CALLED, not clicked, and the markup
 *    is read for the control that would call them. CSS is not seen.
 *  - `truncated` / `members_truncated` / `hunches_truncated` are not driven (200 of each would be needed);
 *    the cut lines render from the plane's own `limit` and are unexercised — stated, not assumed.
 *  - A hidden document's placement is omitted by the PLANE (D-162's suite drives it); this suite has one
 *    group and does not re-drive the gate.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/themes.control.mjs`, arms armed ALONE on the EXTRACTED script
 * (`app.html` never edited, nothing to restore); results on the line below.
 * NEGATIVE CONTROL RESULT 2026-09-25 (UI-76 worker), `node civicos-ui/test/themes.control.mjs`, seven arms, each
 * armed ALONE on the EXTRACTED script (`app.html` never edited, nothing to restore), each splice asserted to match
 * EXACTLY ONCE. EVERY ARM AS DECLARED:
 *   baseline    exit 0 · 56 pass / 0 fail.
 *   membership  exit 1 · 46/10 — THE ROW'S LIAR, a proposal rendered as membership: "THE HUNCH ARM: the proposal
 *               of … renders UNDER HUNCHES, carrying the hunch label" and "...its target is NOWHERE in the members
 *               section" for BOTH hunches, the label count, "the members section holds exactly the plane's members",
 *               and §6's two hunch arms — by name.
 *   nolabel     exit 1 · 52/4 — "carrying the hunch label" for both hunches, the label count, §6's left hunch.
 *   cover       exit 1 · 50/6 — THE ROW'S NEGATIVE CONTROL: every "THE COVER ARM" assertion, member reader and
 *               administrator, list and page. §7/§8 green, as declared.
 *   prefill     exit 1 · 51/5 — "NOTHING IS PREFILLED", the wire arm, and the three arms downstream of a test the
 *               member never wrote (the refusal, the record's test, the page's test).
 *   ownwords    exit 1 · 48/8 — every §7 refusal arm and §1's fence-2 refusal: the page's `detail` is not the canned
 *               translation. Its FIRST cut DID NOT ARM — the anchor occurred twice (the review copy's refusal renders
 *               through the same phrase) and the harness threw naming it; re-anchored on the theme block's own marker.
 *   spelling    exit 0 · 56/0 — THE OVER-STRICTNESS ARM passed first time: the declarer sentence reworded, reordered,
 *               single-quoted and dated in a `<time>` element still reads as the declarer shown.
 * The suite's own first runs found TWO instrument errors, corrected in the instrument and never in an arm: the
 * declare-form absence arm matched `data-thm-declare` as a PREFIX of `data-thm-declarer` (now `data-thm-declare>`),
 * and the passage fixture had no capture to mint over (now D-162's reading-with-OCR-chain shape). It also found ONE
 * surface defect, fixed in `app.html`: a declare refusal rendered only INSIDE the form, so a credential shown no form
 * that reached the act saw nothing.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";
/* THE TIE (DEC-49): the plane's OWN canned translations, imported — a copy here would agree for free. */
import { THEME_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("themes: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const APP = process.env.UI76_APP_SRC || null;   /* the control harness hands a mutated app script through this */
const NOW = "2026-09-25T00:00:00Z";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui76", MEMBER_TOKEN: "mem-ui76", PROBE_TOKEN: "prb-ui76", VERSION: "test",
              BIO_NOW_MS: String(Date.parse(NOW)) },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const count = (hay, needle) => needle ? hay.split(needle).length - 1 : 0;

try {
/* ============================================================ 0. THE GROUND: A REAL PLANE */
console.log("--- 0. the ground: four members, two documents, one passage ---");
const enrol = async (memberId, role) => {
  const add = await POST("op=memberadd&token=adm-ui76",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: ["contribute"] });
  const en = await POST("op=enroll", { invite: add.invite, handle: `${memberId}-h`, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const NADIA = await enrol("nadia", "admin");
await enrol("omar", "admin");                      /* ADMINS_FIRST: the second member is an administrator */
const PILAR = await enrol("pilar", "member");
const QUINN = await enrol("quinn", "member");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
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
/* D-162's own fixture shape (`bio-plane/test/theme.test.mjs`): a document with a CAPTURE and a reading whose
   OCR chain gives it pages, so a passage can be minted over it. */
const readingOf = (captureSha) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW, entities: [],
             text_source: [{ step: "pixels", extent: { kind: "pages", pages: [0, 1] } },
                           { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" },
                             extent: { kind: "pages", pages: [0, 1] } }] } });
const promote = async (id, readings = []) => {
  const text = infoMd(id);
  const files = [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }];
  if (readings.length) {
    const prov = JSON.stringify({ documents: readings });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return POST(`op=promote&token=${NADIA}`, {
    bundleId: id, base: null,
    snapKey: `20260925T${String(600000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: `Info ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    register: readings.map((d) => ({ sha256: d.capture.sha256, path: "captures/doc.pdf", encoding: "binary", bytes: 10 })),
    files });
};
const DOC_A = "INFO-2026-0925-parksaudit", DOC_B = "INFO-2026-0925-sewermemo";
ok("the two documents land through op=promote (the corpus is non-empty before anything is asked of it)",
   [(await promote(DOC_A))?.ok, (await promote(DOC_B, [readingOf(sha("ui76-sewer-memo"))]))?.ok].every((x) => x === true));
const mint = await POST(`op=contentmint&token=${NADIA}`, { bundleId: DOC_B, extent: { kind: "pdf-page", page: 1 }, at: NOW });
const PASSAGE = mint && mint.content_id;
ok("a PASSAGE of the second document is minted as a content row", /^[0-9a-f]{64}$/.test(PASSAGE || ""),
   JSON.stringify(mint).slice(0, 300));

/* ============================================================ THE SURFACE, ITS FETCH BRIDGED TO THAT PLANE */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, hidden:false, checked:false, options:[],
    addEventListener(){}, querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){},
    click(){}, remove(){}, onclick:null, onchange:null, setAttribute(){}, getAttribute(){ return null; } };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  Object.defineProperty(e, "outerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if (!els.has(s)) els.set(s, el()); return els.get(s); };
const WIRE = [];
const loc = { protocol:"https:", hash:"", pathname:"/", search:"" };
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location: loc, history:{ pushState(){}, back(){}, replaceState(){ loc.hash = ""; } },
  localStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  sessionStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  window:{ addEventListener(){}, open:()=>null },
  fetch: async (u, opts) => {
    const url = new URL(u, "http://x");
    let body = null; try { body = opts && opts.body ? JSON.parse(opts.body) : null; } catch (_) {}
    WIRE.push({ op: url.searchParams.get("op"), body });
    return mf.dispatchFetch(url.toString(), opts);
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext((APP ? fs.readFileSync(APP, "utf8") : appScript()) + ";globalThis.__U = {" + [
  "PLANE", "thmRenderList", "thmOpen", "thmDeclare", "thmPlace", "thmFormField", "thmPlaceField", "thmField",
  "thmSearch", "themeRouteFromHash", "THM_HUNCH_LABEL", "SURFACES",
].join(",") + ", STATE: () => THM };", ctx);
const U = ctx.__U;
const asMember = (token, member, administer) => {
  U.PLANE.base = "http://x"; U.PLANE.token = token; U.PLANE.session = true; U.PLANE.preview = false;
  U.PLANE.me = { member, handle: `${member}-h`, session: true, administer, capabilities: ["contribute"] };
};
asMember(PILAR, "pilar", false);
const page = () => $$("#content")._html || "";
const section = (html, attr) => {
  const i = html.indexOf(`<div ${attr}>`);
  if (i < 0) return "";
  const next = html.indexOf('<h2 class="sec">', i);
  return html.slice(i, next < 0 ? html.length : next);
};

/* ============================================================ 1. DECLARE, THROUGH THE SURFACE */
console.log("\n--- 1. a member declares a theme from the surface; nothing is prefilled ---");
await U.thmRenderList();
const p0 = page();
ok("the themes screen opened against the real plane and offers the declare form to a signed-in contributor",
   p0.includes("data-thm-declare") && p0.includes("Declare the theme"), p0.slice(0, 300));
ok("NOTHING IS PREFILLED: the idea and the test open EMPTY (DEC-69)",
   /id="thm-name" value=""/.test(p0) && /id="thm-test"[^>]*><\/textarea>/.test(p0),
   (/id="thm-name"[^>]*>/.exec(p0) || [""])[0] + " | " + (/id="thm-test"[^>]*>[^<]*/.exec(p0) || [""])[0]);
ok("the act is informed ONCE, at the act: one fence sentence, on the declare form",
   count(p0, "data-thm-fence") === 1);

/* A THEME WITHOUT ITS TEST — fence 2, refused by the PLANE and said in its canned words. */
U.thmFormField("name", "deferred maintenance");
await U.thmDeclare();
const p1 = page();
ok("the wire carried exactly what the member wrote — the idea, and an EMPTY test the page did not fill",
   WIRE.filter((w) => w.op === "themedeclare").slice(-1)[0]?.body?.test === ""
   && WIRE.filter((w) => w.op === "themedeclare").slice(-1)[0]?.body?.name === "deferred maintenance",
   JSON.stringify(WIRE.filter((w) => w.op === "themedeclare").slice(-1)[0]));
ok("FENCE 2: a theme without its test is REFUSED by the plane, rendered in its canned translation verbatim (DEC-49)",
   p1.includes("data-thm-refusal") && p1.includes(ctx.__U && THEME_CHECKS.THEME_NO_TEST.translation.replace(/"/g, "&quot;")),
   (/data-thm-refusal[\s\S]{0,400}/.exec(p1) || [""])[0]);

const TEST_1 = "The document describes upkeep a public body deferred and says what the deferral cost or risks.";
U.thmFormField("test", TEST_1);
await U.thmDeclare();
const S1 = U.STATE();
const TID = S1 && S1.id;
ok("the declaration LANDS and the surface opens the new theme's page", S1?.mode === "theme" && /^THEME-/.test(TID || ""),
   JSON.stringify({ mode: S1?.mode, id: TID }));
const asAdmin = await GET(`op=themeread&token=adm-ui76&id=${encodeURIComponent(TID || "")}`);
ok("the RECORD holds it in pilar's name — stamped by the plane from the session, never from the page",
   asAdmin?.declared_by === "pilar" && asAdmin?.test === TEST_1, JSON.stringify(asAdmin).slice(0, 300));
const p2 = page();
ok("the plane's own sentence about the declaration is rendered verbatim",
   typeof S1?.declared?.says === "string" && p2.includes(S1.declared.says.replace(/"/g, "&quot;")),
   S1?.declared?.says);

/* A second theme, by a different member, so the list has two declarers to keep apart. */
asMember(QUINN, "quinn", false);
await U.thmRenderList();
U.thmFormField("name", "overtime"); U.thmFormField("test", "The document records overtime hours or pay beyond a budgeted amount.");
await U.thmDeclare();
const TID2 = U.STATE()?.id;
ok("a second member declares a second theme through the surface", /^THEME-/.test(TID2 || "") && TID2 !== TID);

/* ============================================================ 2. FENCE 1 — WHOSE LENS, ON EVERY THEME */
console.log("\n--- 2. THE COVER ARM: every theme rendered shows its declarer, as the plane projected it ---");
asMember(PILAR, "pilar", false);
await U.thmRenderList();
const pl = page();
const listM = await GET(`op=themeread&token=${PILAR}`);
ok("the plane lists both themes to a member (the corpus the arm walks is non-empty)",
   Array.isArray(listM?.themes) && listM.themes.length === 2, JSON.stringify(listM).slice(0, 300));
for (const t of listM?.themes || []) {
  const card = (new RegExp(`<div class="card" data-thm-theme="${t.theme_id}">[\\s\\S]*?</div>\\s*(?=<div class="card"|<h2|$)`).exec(pl) || [""])[0];
  ok(`THE COVER ARM (list, member reader): the theme "${t.name}" is rendered WITH its declarer's handle, ${t.declared_by_handle}`,
     !!card && card.includes("data-thm-declarer") && card.includes(`<b>${t.declared_by_handle}</b>`), card.slice(0, 400));
  ok(`...and its TEST, verbatim (fence 2) — "${t.name}"`, card.includes(t.test));
}
ok("a member reader is shown NO cover and NO member id — the plane sent none, and the page invents none (Membership v2 §3)",
   !pl.includes("cover for pilar") && !pl.includes("cover for quinn") && !/<span class="mono">(pilar|quinn)<\/span>/.test(pl));

await U.thmOpen(TID);
const pt = page();
const oneM = await GET(`op=themeread&token=${PILAR}&id=${encodeURIComponent(TID)}`);
ok("THE COVER ARM (the theme's page, member reader): the declarer's handle is on the page",
   pt.includes("data-thm-declarer") && pt.includes(`<b>${oneM?.declared_by_handle}</b>`) && oneM?.declared_by_handle === "pilar-h",
   (/data-thm-declarer[\s\S]{0,200}/.exec(pt) || [""])[0]);
ok("...and the test, and the plane's own sentence about the theme, verbatim",
   pt.includes(TEST_1) && pt.includes(String(oneM?.says || "\u0000")), oneM?.says);

/* THE ADMINISTRATOR is projected the pairing — the cover beside the handle — and the page renders what it got. */
asMember(NADIA, "nadia", true);
await U.thmRenderList();
const pa = page();
const listA = await GET(`op=themeread&token=${NADIA}`);
for (const t of listA?.themes || [])
  ok(`THE COVER ARM (list, administrator): "${t.name}" shows ${t.declared_by_handle} WITH the cover the plane projected, "${t.declared_by_cover}"`,
     typeof t.declared_by_cover === "string" && pa.includes(`<b>${t.declared_by_handle}</b> (${t.declared_by_cover}`),
     (new RegExp(`data-thm-theme="${t.theme_id}"[\\s\\S]{0,500}`).exec(pa) || [""])[0]);
await U.thmOpen(TID);
ok("THE COVER ARM (the theme's page, administrator): the handle, the cover and the member id, as projected",
   page().includes("<b>pilar-h</b> (cover for pilar, <span class=\"mono\">pilar</span>)"),
   (/data-thm-declarer[\s\S]{0,300}/.exec(page()) || [""])[0]);

/* ============================================================ 4. PLACE, THROUGH THE SURFACE */
console.log("\n--- 4. a member places a document from the theme's page ---");
asMember(PILAR, "pilar", false);
await U.thmOpen(TID);
const pp = page();
ok("the place form opens EMPTY (nothing prefilled)",
   /id="thm-target" value=""/.test(pp) && /id="thm-note"[^>]*><\/textarea>/.test(pp));
U.thmPlaceField("target", DOC_A);
U.thmPlaceField("note", "Page 4 lists the deferred roof work.");
await U.thmPlace();
const afterPlace = await GET(`op=themeread&token=adm-ui76&id=${encodeURIComponent(TID)}`);
ok("the RECORD holds DOC_A as MEMBERSHIP, placed by pilar (grade D) — the surface's act reached the op",
   afterPlace?.members?.length === 1 && afterPlace.members[0].target === DOC_A
   && afterPlace.members[0].placed_by === "pilar" && afterPlace.members[0].membership === true && afterPlace.members[0].grade === "D",
   JSON.stringify(afterPlace?.members));
const pm = page();
ok("the page renders it under Members, placed by the placer's handle, with the note",
   section(pm, "data-thm-members").includes(`data-thm-member="${DOC_A}"`)
   && section(pm, "data-thm-members").includes("<b>pilar-h</b>")
   && section(pm, "data-thm-members").includes("Page 4 lists the deferred roof work."), section(pm, "data-thm-members").slice(0, 500));
ok("the plane's own sentence about the placement is rendered verbatim",
   typeof U.STATE()?.placed?.says === "string" && pm.includes(U.STATE().placed.says.replace(/"/g, "&quot;")), U.STATE()?.placed?.says);

/* ============================================================ 5. FENCE 3 — A HUNCH IS NEVER MEMBERSHIP */
console.log("\n--- 5. THE HUNCH ARM: a machine's proposal renders as a hunch, apart, never as membership ---");
const h1 = await POST(`op=themepropose&token=mem-ui76`, { theme: TID, target: PASSAGE, note: "the memo mentions a backlog" });
const h2 = await POST(`op=themepropose&token=mem-ui76`, { theme: TID, target: DOC_B });
ok("two proposals stand, made by a MACHINE credential through op=themepropose (hunches, grade C)",
   h1?.state === "hunch" && h2?.state === "hunch" && h1?.membership === false && h1?.grade === "C",
   JSON.stringify([h1, h2]).slice(0, 400));
await U.thmOpen(TID);
const ph = page();
const read5 = await GET(`op=themeread&token=${PILAR}&id=${encodeURIComponent(TID)}`);
const HUN = section(ph, "data-thm-hunches"), MEM = section(ph, "data-thm-members");
ok("the plane answers members and hunches APART (1 and 2) — what this arm walks", read5?.members?.length === 1 && read5?.hunches?.length === 2);
for (const h of read5?.hunches || []) {
  const card = (new RegExp(`<div class="card" data-thm-hunch="${h.target}">[\\s\\S]*?(?=<div class="card"|$)`).exec(HUN) || [""])[0];
  ok(`THE HUNCH ARM: the proposal of ${h.target.slice(0, 24)} renders UNDER HUNCHES, carrying the hunch label`,
     !!card && card.includes(U.THM_HUNCH_LABEL), card.slice(0, 400));
  ok(`...attributed to the machine the plane stamped (${h.proposed_by})`, card.includes(h.proposed_by || "\u0000"));
  ok(`...and its target is NOWHERE in the members section (${h.target.slice(0, 24)})`, !MEM.includes(h.target));
}
ok("THE HUNCH ARM: the label appears exactly once per hunch, and never in the members section",
   count(ph, U.THM_HUNCH_LABEL) === read5?.hunches?.length && !MEM.includes(U.THM_HUNCH_LABEL),
   `labels ${count(ph, U.THM_HUNCH_LABEL)} · hunches ${read5?.hunches?.length}`);
ok("the members section holds exactly the plane's members", count(MEM, "data-thm-member=") === read5?.members?.length);

/* ============================================================ 6. CONFIRM A HUNCH; LEAVE ANOTHER */
console.log("\n--- 6. a member confirms one hunch and leaves the other ---");
ok("the hunch carries the member's act, and it names the hunch's own target",
   HUN.includes(`onclick="thmPlace('${PASSAGE}')"`) && HUN.includes(`onclick="thmPlace('${DOC_B}')"`));
await U.thmPlace(PASSAGE);
const read6 = await GET(`op=themeread&token=adm-ui76&id=${encodeURIComponent(TID)}`);
const conf = (read6?.members || []).find((m) => m.target === PASSAGE);
ok("the RECORD: the passage is now membership, placed by pilar, the machine KEPT as its first proposer",
   !!conf && conf.placed_by === "pilar" && conf.proposed_by === "class:member" && conf.state === "member",
   JSON.stringify(conf));
ok("...and the hunch the member LEFT is still a hunch — leaving one is doing nothing",
   (read6?.hunches || []).length === 1 && read6.hunches[0].target === DOC_B);
const pc = page();
const MEM6 = section(pc, "data-thm-members"), HUN6 = section(pc, "data-thm-hunches");
ok("the page: the confirmed passage moved to Members, saying who proposed it first",
   MEM6.includes(`data-thm-member="${PASSAGE}"`) && MEM6.includes("First proposed by") && MEM6.includes("class:member"),
   MEM6.slice(0, 600));
ok("...the left hunch is still under Hunches, labelled, and nowhere among the members",
   HUN6.includes(`data-thm-hunch="${DOC_B}"`) && count(pc, U.THM_HUNCH_LABEL) === 1 && !MEM6.includes(`data-thm-member="${DOC_B}"`));
ok("the confirmation went over the wire as op=themeplace on that target, and the page never proposes",
   WIRE.some((w) => w.op === "themeplace" && w.body?.target === PASSAGE) && !WIRE.some((w) => w.op === "themepropose"));

/* ============================================================ 7. EVERY REFUSAL THE SURFACE CAN SHOW, IN ITS CANNED WORDS */
console.log("\n--- 7. refusals: the plane's canned translation, verbatim (DEC-49) ---");
const html = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
U.thmPlaceField("target", "INFO-2026-0925-nosuchthing");
await U.thmPlace();
ok("a target nobody can see: THEME_TARGET_NOT_FOUND's translation, verbatim",
   page().includes(html(THEME_CHECKS.THEME_TARGET_NOT_FOUND.translation)), (/data-thm-refusal[\s\S]{0,300}/.exec(page()) || [""])[0]);
U.thmPlaceField("target", DOC_B); U.thmPlaceField("note", "x".repeat(140 * 1024));
await U.thmPlace();
ok("a note too long to store: THEME_REASON_TOO_LONG's translation, verbatim",
   page().includes(html(THEME_CHECKS.THEME_REASON_TOO_LONG.translation)), (/data-thm-refusal[\s\S]{0,300}/.exec(page()) || [""])[0]);
await U.thmOpen("THEME-2026-0925-absent");
ok("a theme that does not exist: THEME_NOT_FOUND's translation, verbatim",
   page().includes(html(THEME_CHECKS.THEME_NOT_FOUND.translation)), page().slice(0, 300));
await U.thmRenderList();
U.thmFormField("name", ""); U.thmFormField("test", "A test with no name.");
await U.thmDeclare();
ok("a theme without its idea: THEME_NO_NAME's translation, verbatim",
   page().includes(html(THEME_CHECKS.THEME_NO_NAME.translation)));
U.thmFormField("name", "n".repeat(140 * 1024));
await U.thmDeclare();
ok("a name too long to store: THEME_TOO_LONG's translation, verbatim",
   page().includes(html(THEME_CHECKS.THEME_TOO_LONG.translation)));
/* THE MACHINE: a credential with no session is offered no declare and no place — and if one reached the act
   anyway, the plane's canned words are what it is shown. */
U.PLANE.token = "mem-ui76"; U.PLANE.session = false; U.PLANE.me = { session: false, capabilities: ["contribute"] };
await U.thmRenderList();
ok("a machine credential is offered NO declare form (the capability is absent, not refused)",
   !page().includes("data-thm-declare>"), (/data-thm-declare>[\s\S]{0,200}/.exec(page()) || [""])[0]);
U.thmFormField("name", "anything"); U.thmFormField("test", "anything at all");
const reached = await (async () => { const S = U.STATE(); S.busy = false; await U.thmDeclare(); return page(); })();
ok("...and a machine that reached the act is shown THEME_NOT_A_MEMBER's translation, verbatim",
   reached.includes(html(THEME_CHECKS.THEME_NOT_A_MEMBER.translation)), reached.slice(-900) + " WIRE " + JSON.stringify(WIRE.slice(-2)));
await U.thmOpen(TID);
ok("...and no place form and no confirm control on the theme's page",
   !page().includes("data-thm-place") && !page().includes("thmPlace("));
const machinePlace = await (async () => { U.thmPlaceField("target", DOC_B); U.STATE().busy = false; await U.thmPlace(); return page(); })();
ok("...and a machine that reached the place act is shown THEME_PLACEMENT_NOT_A_MEMBER's translation, verbatim",
   machinePlace.includes(html(THEME_CHECKS.THEME_PLACEMENT_NOT_A_MEMBER.translation)));
ok("EVERY code the theme ops can return carries a canned translation (the plane's table, total)",
   Object.values(THEME_CHECKS).length === 10
   && Object.values(THEME_CHECKS).every((r) => typeof r.translation === "string" && r.translation.length > 40));

/* ============================================================ 8. THE SURFACE HOLDS NO SENTENCE OF THE PLANE'S */
console.log("\n--- 8. where the words come from, and the address ---");
const APP_SRC = APP ? fs.readFileSync(APP, "utf8") : appScript();
const PLANE_SENTENCES = [...Object.values(THEME_CHECKS).map((r) => r.translation), String(oneM?.says || "")];
ok("STRUCTURAL: the surface holds NO COPY of any plane sentence it renders — it could not agree for free",
   PLANE_SENTENCES.every((s) => s && !APP_SRC.includes(s.slice(0, 60))),
   PLANE_SENTENCES.filter((s) => APP_SRC.includes(s.slice(0, 60))).join(" | "));
ok("no `op=themepropose` was ever sent by the surface", !WIRE.some((w) => w.op === "themepropose"));
asMember(PILAR, "pilar", false);
loc.hash = `#theme/${TID}`;
ok("`#theme/<id>` is a real address: the router opens that theme",
   U.themeRouteFromHash() === true && U.STATE()?.id === TID);
ok("the registry declares the surface and every theme op it reaches",
   JSON.stringify(U.SURFACES.themes?.routes) === JSON.stringify(["screen:themes", "hash:theme"])
   && ["themeread", "themedeclare", "themeplace"].every((o) => U.SURFACES.themes.reads.includes(o)));
} finally {
  await mf.dispose();
}
console.log(`\nthemes: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
