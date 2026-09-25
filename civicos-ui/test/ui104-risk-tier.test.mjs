/* UI-104 — THE ACTION PAGE OFFERS THE RISK-TIER REVISION AND SHOWS THE TIER HISTORY.
 *
 * THE ROW: REC-214's `op=actionrisktier` and `action.risk_tier_history` are on `main` and reach no page
 * (`surface-registry.test.mjs` carried the act on `ACTS_AWAITING_SURFACE`, owed by UI-104).
 *
 * DESIGN: `docs/architecture/BIO_Case_Making_v0_1.md` §2, `risk_tier` — BOB #33's risk-tier revision ruling
 * (2026-09-24): a member may revise ANY tier, up or down, as an AUTHORED act recording who, when and a REQUIRED
 * reason; APPEND-ONLY, every earlier tier, its author and its reason readable; a machine is refused.
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * `bio-plane/src/index.mjs` runs under miniflare. The revision is made BY THE SURFACE'S OWN ACT — the page's
 * flow, its fetch bridged to that plane — and every sentence asserted is read from the plane's own answer in
 * the same run or imported from the catalogue that composes it, never written here.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (1) A FORM THAT SENDS WITHOUT A REASON — §2's REQUIRED-REASON arms: with a tier chosen and no reason (and
 *      with a whitespace reason) the form carries no commit control, and calling the commit sends NOTHING —
 *      counted on the wire and confirmed on the record.
 *  (2) A TIER PRESELECTED — §2 reads the opened form for any `checked`, and for the tier the action holds.
 *  (3) `undetermined` OFFERED AS A TIER TO SET — §2: the options are exactly the plane's settable tiers, in
 *      its words, and the not-assessed sentence is not among them.
 *  (4) A REFUSAL WORDED BY THE PAGE — §3 drives a real refusal and compares the canned DEC-49 translation
 *      VERBATIM; §5 does the same for a machine credential.
 *  (5) A HISTORY THE PAGE COMPOSED — §4 asserts "revised from … to …: <reason>" in the plane's own tier
 *      words, oldest first, and the intake author as the plane's UNDETERMINED sentence; §6 proves `app.html`
 *      holds no copy of any of those sentences.
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - The DOM is a stub, as in every civicos-ui suite: no browser fires a handler, so the flow's handlers are
 *    CALLED (`actionTierPick`, `actionTierWhy`, `doActionRiskTier`) and the markup is read. A control added
 *    by script after render would be invisible to the markup arms; the wire and record arms are not.
 *  - Nothing about CSS.
 *  - An UNREADABLE history entry (`readable: false`) cannot be produced through the act — the store refuses
 *    every writer but the act (C-90.1) — so that branch is driven on a hand-shaped block in §6, stated.
 *
 * NEGATIVE CONTROL: `ui104-risk-tier.control.mjs`; results on the line below.
 * NEGATIVE CONTROL RESULT 2026-09-25 (UI-104 worker), `node civicos-ui/test/ui104-risk-tier.control.mjs`, six arms,
 * each armed ALONE on the EXTRACTED script (`app.html` never edited; its sha256 checked unchanged after the run),
 * each splice asserted to match EXACTLY ONCE. EVERY ARM AS DECLARED:
 *   baseline     exit 0 · 35/0.
 *   noreason     exit 1 · 32/3 — THE ROW'S CONTROL, by name: "REQUIRED REASON: a tier chosen and NO reason …",
 *                "…a whitespace-only reason …" and "…the act CANNOT SUBMIT without a reason — calling the commit
 *                sends nothing to the plane". "…the record is unmoved" stayed GREEN as declared: the plane refused
 *                the empty reason itself, so that arm pins the record and the three above pin the page.
 *   preselect    exit 1 · 33/2 — "NOTHING IS PRESELECTED …" and "reopening the form preselects NOTHING …".
 *   undetoffered exit 1 · 33/2 — "the options are the plane's settable tiers …" and "…`undetermined` is NOT offered …".
 *   pagewords    exit 1 · 33/2 — §3's and §5's "…translation VERBATIM" arms.
 *   spelling     exit 0 · 35/0 — THE OVER-STRICTNESS ARM passed, after one matcher was loosened BEFORE the run:
 *                §6's unreadable-entry arm first counted a class name (`act-tier-rev`) and now counts the plane's
 *                reasons and one "could not read" sentence, since a correct re-spelling would have failed it.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";
/* THE TIE: the catalogue's OWN map and canned translations, imported, so what the page must show is the
   single place the plane composes it rather than a second copy that agrees for free. */
import { RISK_TIERS, RISK_TIER_REVISION_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";

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
  console.error("ui104-risk-tier: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const APP = process.env.UI104_APP_SRC || null;   /* the control harness hands a mutated app script through this */
const NOW = "2026-09-25T00:00:00Z";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui104", MEMBER_TOKEN: "mem-ui104", PROBE_TOKEN: "prb-ui104", VERSION: "test",
              BIO_NOW_MS: String(Date.parse(NOW)) },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();

try {
/* ============================================================ 0. THE GROUND: A REAL PLANE */
console.log("--- 0. the ground: two actions, one stated at intake and one never assessed ---");
const enrol = async (memberId, role) => {
  const add = rP(await POST("op=memberadd&token=adm-ui104",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: ["contribute"] }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const NADIA = await enrol("nadia", "admin");
await enrol("omar", "admin");                      /* ADMINS_FIRST: the second member is an administrator */
const PILAR = await enrol("pilar", "member");

const actionMd = (id, title, tier) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "${title}"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "action_kind: other", `risk_tier: ${tier}`,
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "", "## Plan", "", "Ask for the transfer ledger.", "",
  "## Status", "", "## Correspondence", "",
  "## Session Log", "", `### Session ${NOW} | Formation | nadia`,
  "Trigger: intake", "Changes: created.", "", "## Review Notes", ""].join("\n");

let snapKeySeq = 0;
const promote = async (id, title, tier) => { const md = actionMd(id, title, tier); return rP(await POST(`op=promote&token=${NADIA}`, {
  bundleId: id, base: null, snapKey: `${id}-new-${String(++snapKeySeq).padStart(4, "0")}`,
  files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) }],
  register: [],
  meta: { object_type: "action", group: "believe-in-oakland", title, current_state: "planned",
          created: NOW, last_updated: NOW },
})); };

const ACT   = "ACTN-2026-1104-tier-revised";         /* intake tier 1, revised by the surface */
const UNDET = "ACTN-2026-1105-never-assessed";       /* intake undetermined, never revised */
ok("the fixtures land through op=promote (the corpus is non-empty before anything is asked of it)",
   [(await promote(ACT, "Records request", "1"))?.ok, (await promote(UNDET, "Never assessed", "undetermined"))?.ok]
     .every((x) => x === true));

const actionOf = async (id) => rP(await GET(`op=projection&token=${PILAR}&id=${encodeURIComponent(id)}`))?.action ?? null;
const DER0 = { [ACT]: await actionOf(ACT), [UNDET]: await actionOf(UNDET) };
ok("the PLANE's own read carries the history this surface consumes (intake 1, never revised; and undetermined)",
   DER0[ACT]?.risk_tier_history?.current === 1 && DER0[ACT]?.risk_tier_history?.revisions?.length === 0
   && DER0[UNDET]?.risk_tier_history?.current === "undetermined",
   JSON.stringify([DER0[ACT]?.risk_tier_history, DER0[UNDET]?.risk_tier_history]).slice(0, 400));

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
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){}, replaceState(){} },
  localStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  sessionStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  window:{ addEventListener(){}, open:()=>null },
  fetch: async (u, opts) => {
    const url = new URL(u, "http://x");
    let body = null; try { body = opts && opts.body ? JSON.parse(opts.body) : null; } catch (_) {}
    WIRE.push({ op: url.searchParams.get("op"), body, tier: url.searchParams.get("tier") });
    return mf.dispatchFetch(url.toString(), opts);
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext((APP ? fs.readFileSync(APP, "utf8") : appScript()) + ";globalThis.__U = {" + [
  "PLANE", "openAction", "openActionRiskTier", "actionRiskTierHtml", "actionTierPick", "actionTierWhy",
  "doActionRiskTier", "loadActSource",
].join(",") + ", TIER: () => ACTION.tier, ACTS: () => ACTS_HERE, CACHES: () => { IMG_CACHE.clear(); PROJ_CACHE.clear(); } };", ctx);
const U = ctx.__U;
const signIn = (tok, member) => {
  U.PLANE.base = "http://x"; U.PLANE.token = tok; U.PLANE.session = true; U.PLANE.preview = false;
  U.PLANE.me = { member, handle: member, session: true, administer: false, capabilities: ["contribute"] };
};
signIn(PILAR, "pilar");
await U.loadActSource(true);

const page = () => $$("#content")._html || "";
const dialog = () => (els.get("#dlg") || { _html:"" })._html || "";
const bar = () => (els.get("#rt-bar") || { _html:"" })._html || "";
const openFresh = async (id) => { U.CACHES(); await U.openAction(id); return page(); };
const TIER_HEAD = `<h2 class="sec">Whether this is safe to file</h2>`;
const CLOCK_HEAD = `<h2 class="sec">The clock</h2>`;
const WRITES = () => WIRE.filter((w) => w.op === "actionrisktier" && ((w.body && "tier" in w.body) || w.tier)).length;
const COMMIT = /doActionRiskTier\(\)/;

/* ============================================================ 1. THE HISTORY RENDERS, BESIDE THE LAWS */
console.log("\n--- 1. the tier block, before any revision ---");
const p1 = await openFresh(ACT);
const block1 = U.actionRiskTierHtml(DER0[ACT]);
const H1 = DER0[ACT].risk_tier_history;
ok("THE ITEM: the action page RENDERS the tier block", !!block1 && p1.includes(block1), block1.slice(0, 300));
ok("...BESIDE the governing-laws list: after the laws section, in its own section, before the clock",
   p1.indexOf(`<h2 class="sec">The laws this ask is made under</h2>`) < p1.indexOf(TIER_HEAD)
   && p1.indexOf(TIER_HEAD) < p1.indexOf(block1) && p1.indexOf(block1) < p1.indexOf(CLOCK_HEAD),
   JSON.stringify([p1.indexOf(TIER_HEAD), p1.indexOf(block1), p1.indexOf(CLOCK_HEAD)]));
ok("the current tier is shown in the PLANE's words (current_words)", block1.includes(H1.current_words), H1.current_words);
ok("the intake tier's author is the PLANE's UNDETERMINED sentence, verbatim (intake.stated)",
   block1.includes(H1.intake.stated), H1.intake.stated);
ok("...and the history's own sentence is the plane's (stated)", block1.includes(H1.stated), H1.stated);
ok("the act is PUBLISHED on this action by the plane, under its own label",
   (U.ACTS() || []).some((a) => a && a.id === "actionrisktier"), JSON.stringify((U.ACTS() || []).map((a) => a && a.id)));
const ACTDEF = (U.ACTS() || []).find((a) => a && a.id === "actionrisktier")
  || { id: "actionrisktier", label: "Revise risk tier", prompt: null };

/* ============================================================ 2. THE FORM: NOTHING PRESELECTED, A REQUIRED REASON */
console.log("\n--- 2. the revise act: the plane's words, nothing preselected, a REQUIRED reason ---");
await U.openActionRiskTier(ACT, "Records request", ACTDEF);
const d0 = dialog();
const SETTABLE = ["1", "2", "3"];
ok("the options are the plane's settable tiers, each in the plane's own words",
   SETTABLE.every((k) => d0.includes(RISK_TIERS[k])) && JSON.stringify(U.TIER().legal) === JSON.stringify(SETTABLE),
   JSON.stringify(U.TIER().legal));
ok("...and `undetermined` is NOT offered as a tier to set (its not-assessed sentence is no option)",
   !/value="undetermined"/.test(d0) && !(d0.match(/type="radio"[^>]*>[^<]*/g) || []).some((s) => s.includes(RISK_TIERS.undetermined)));
ok("NOTHING IS PRESELECTED when the form opens — no option checked, not even the tier the action holds",
   !/\bchecked\b/.test(d0) && U.TIER().tier === "", (d0.match(/<input[^>]*checked[^>]*>/) || [""])[0]);
ok("the form opens with NO commit control (no tier, no reason)", !COMMIT.test(d0));
const probeWrites = WRITES();

U.actionTierPick("3");
ok("REQUIRED REASON: a tier chosen and NO reason — the form carries no commit control",
   !COMMIT.test(dialog()) && /\bchecked\b/.test(dialog()), bar());
U.actionTierWhy("    ");
ok("REQUIRED REASON: a whitespace-only reason — still no commit control", !COMMIT.test(bar()), bar());
await U.doActionRiskTier();
ok("REQUIRED REASON: the act CANNOT SUBMIT without a reason — calling the commit sends nothing to the plane",
   WRITES() === probeWrites, JSON.stringify(WIRE.filter((w) => w.op === "actionrisktier")));
ok("REQUIRED REASON: ...and the record is unmoved (the tier is still 1, no revision)",
   (await actionOf(ACT))?.risk_tier_history?.revisions?.length === 0 && (await actionOf(ACT))?.risk_tier === 1);

/* ============================================================ 3. A REAL REFUSAL, IN THE PLANE'S CANNED WORDS */
console.log("\n--- 3. a reason the plane refuses: the canned DEC-49 translation, verbatim ---");
U.actionTierWhy('counsel said "no"');
ok("with a tier and a reason the commit control appears", COMMIT.test(bar()), bar());
await U.doActionRiskTier();
const RR = RISK_TIER_REVISION_CHECKS.RISK_TIER_REASON_REFUSED;
ok("the plane REFUSED it RISK_TIER_REASON_REFUSED, and the page shows the canned translation VERBATIM",
   U.TIER().refusal?.reason === "RISK_TIER_REASON_REFUSED" && dialog().includes(RR.translation)
   && U.TIER().refusal?.translation === RR.translation,
   JSON.stringify(U.TIER().refusal).slice(0, 300));
ok("...and nothing was written", (await actionOf(ACT))?.risk_tier_history?.revisions?.length === 0);

/* ============================================================ 4. THE REVISION LANDS AND THE HISTORY SAYS SO */
console.log("\n--- 4. a member revises the tier with a reason; the history renders it ---");
const WHY1 = "Counsel flagged the personnel records in this ask";
U.actionTierWhy(WHY1);
await U.doActionRiskTier();
const done = U.TIER().done;
ok("THE ACT LANDS through the surface: tier 3, prior 1, by the signed-in member, with the reason",
   done && done.risk_tier === 3 && done.prior === 1 && done.by === "pilar" && done.reason === WHY1,
   JSON.stringify(done).slice(0, 300));
const LINE1 = `Revised from ${RISK_TIERS[1]} to ${RISK_TIERS[3]}: ${WHY1}`;
ok("the confirmation says it the same way, in the plane's words", dialog().toLowerCase().includes(LINE1.toLowerCase()), dialog().slice(0, 300));

const p4 = await openFresh(ACT);
ok("ACCEPTS-WHEN: the page's history renders \"revised from … to …: <reason>\" in the plane's tier words",
   p4.toLowerCase().includes(LINE1.toLowerCase()), LINE1);
ok("...attributed to the member who made it", /pilar/.test(U.actionRiskTierHtml((await actionOf(ACT)))));
ok("...and the current tier is now the plane's words for 3", p4.includes(`Now: ${RISK_TIERS[3]}`));

/* A second revision, down: the history is oldest first and nothing earlier is dropped. */
await U.openActionRiskTier(ACT, "Records request", ACTDEF);
ok("reopening the form preselects NOTHING, even with a revision on record", !/\bchecked\b/.test(dialog()));
const WHY2 = "The clerk confirmed the ledger holds no personnel data";
U.actionTierPick("2"); U.actionTierWhy(WHY2); await U.doActionRiskTier();
const p5 = await openFresh(ACT);
const LINE2 = `Revised from ${RISK_TIERS[3]} to ${RISK_TIERS[2]}: ${WHY2}`;
const H5 = (await actionOf(ACT)).risk_tier_history;
ok("BOTH revisions render, OLDEST FIRST, and the first is unchanged",
   p5.toLowerCase().indexOf(LINE1.toLowerCase()) > -1
   && p5.toLowerCase().indexOf(LINE1.toLowerCase()) < p5.toLowerCase().indexOf(LINE2.toLowerCase()),
   JSON.stringify([p5.toLowerCase().indexOf(LINE1.toLowerCase()), p5.toLowerCase().indexOf(LINE2.toLowerCase())]));
ok("the intake line still reads the INTAKE tier (1) and the plane's undetermined-author sentence",
   p5.includes(`When this action was created: ${RISK_TIERS[1]}`) && p5.includes(H5.intake.stated), H5.intake.stated);
ok("...and the history's own sentence is the plane's, for two revisions", p5.includes(H5.stated), H5.stated);

/* ============================================================ 5. A MACHINE IS REFUSED, IN THE PLANE'S WORDS */
console.log("\n--- 5. a machine credential: the plane's refusal, and no option offered ---");
signIn("mem-ui104", "class:member");
const before = WRITES();
await U.openActionRiskTier(ACT, "Records request", ACTDEF);
const mr = rP(await GET(`op=actionrisktier&token=mem-ui104&target=${encodeURIComponent(ACT)}`));
ok("the probe is refused MACHINE_CANNOT_SET_RISK_TIER and the page shows the plane's translation verbatim",
   mr?.reason === "MACHINE_CANNOT_SET_RISK_TIER" && typeof mr?.translation === "string"
   && dialog().includes(mr.translation), JSON.stringify(mr).slice(0, 200));
ok("...and offers no tier to choose and no commit control", !/type="radio"/.test(dialog()) && !COMMIT.test(dialog()));
ok("...and nothing was written", WRITES() === before && (await actionOf(ACT)).risk_tier_history.revisions.length === 2);
signIn(PILAR, "pilar");

/* ============================================================ 6. THE PAGE HOLDS NO SENTENCE OF ITS OWN */
console.log("\n--- 6. the never-assessed action, an absent block, and where the words come from ---");
const p6 = await openFresh(UNDET);
const H6 = DER0[UNDET].risk_tier_history;
ok("a never-assessed action reads the plane's not-assessed words and its no-intake sentence, verbatim",
   p6.includes(`Now: ${RISK_TIERS.undetermined}`) && p6.includes(H6.intake.stated) && p6.includes(H6.stated),
   JSON.stringify(H6).slice(0, 300));
const absent = U.actionRiskTierHtml({ ...DER0[UNDET], risk_tier_history: undefined });
ok("a plane answering with NO history key is said as an absence, not as a history",
   /did not answer/.test(absent) && !absent.includes(RISK_TIERS.undetermined), absent);
const odd = U.actionRiskTierHtml({ risk_tier_history: { ...H5, revisions: [...H5.revisions, { ord: 2, readable: false }] } });
ok("an entry the plane could not read is KEPT and said, never dropped (hand-shaped block: the act cannot write one)",
   (odd.match(/could not read/g) || []).length === 1 && H5.revisions.every((r) => odd.includes(r.reason)),
   odd.slice(-300));
const APP_SRC = APP ? fs.readFileSync(APP, "utf8") : appScript();
const SENTENCES = [RISK_TIERS[3], RISK_TIERS.undetermined, H1.intake.stated, H5.intake.stated, H1.stated, H5.stated,
                   H6.intake.stated, RR.translation, mr?.translation ?? ""].filter(Boolean);
ok("STRUCTURAL: the surface holds NO COPY of any of these plane sentences — it could not have agreed for free",
   SENTENCES.every((s) => !APP_SRC.includes(s.slice(0, 40))),
   SENTENCES.filter((s) => APP_SRC.includes(s.slice(0, 40))).join(" | "));

} finally {
  await mf.dispose();
}
console.log(`\nui104-risk-tier: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
