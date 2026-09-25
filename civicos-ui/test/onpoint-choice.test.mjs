/* UI-91 — A MEMBER CHOOSES A CONNECTION'S ON-POINT MENTION, AND THE CHOICE IS SHOWN BESIDE THE
 * MACHINE'S PAIR, NEVER IN ITS PLACE.
 *
 * THE ROW: REC-122's `op=connectionchoose` (IC-232, C-74) is on `main` and reached no page;
 * construct 6.on-point-ui read ABSENT. DESIGN: `BIO_Content_Framework_v0_10.md` §14.5 (the
 * connection-pair row): *"The machine's strongest-graded pair is kept beside the choice and never
 * rewritten (`on_point` is the member's, `determining_pair` the machine's). Still NOT built: the member
 * SURFACE (UI's, owed)"* — and D-161's act 3.
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * `bio-plane/src/index.mjs` runs under miniflare. The ground is REC-122's own (its suite's section 0):
 * document A mentions the ordinance twice (p.2 and p.9, both grade A), B once. The page's connection
 * display is fed the plane's OWN `op=connections&sha256=` and `op=resolutions&sha256=` answers, and the
 * act is sent BY THE PAGE (`docChooseOnPoint`) over a fetch bridged to that plane, under a signed-in
 * member's session — the act refuses every token BY NAME (C-74.1), so a suite driving it under a token
 * would drive only the refusal.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (1) THE CHOICE IN THE PAIR'S PLACE — the row's own NEGATIVE CONTROL. §2 asserts, after the act, that
 *      the machine's line still names the machine's mention (not the member's), that the member's line
 *      names the member's, and that the machine's line comes FIRST. A page that rendered one in place of
 *      the other fails "NEVER REPLACING" by name.
 *  (2) A CHOICE THE PAGE BELIEVES RATHER THAN READS — §2 reads the plane's `on_point` after the act and
 *      renders from THAT answer; the page's own act re-reads the panel rather than painting what it sent.
 *  (3) A CONTROL A TOKEN CAN SEE — §1 renders the same answer for a signed-in member and for a bearer
 *      token: only the member is offered the choice.
 *  (4) A PAGE-AUTHORED REFUSAL — §3 sends the act under a token through the page and asserts the
 *      plane's C-74.1 translation is rendered VERBATIM.
 *  (5) A CONTRADICTION RENDERED — the plane's `selection.says` ends "which nobody has chosen" even beside
 *      a current choice (D-575). §2 asserts the page withholds that sentence where a choice exists and
 *      keeps it where none does.
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - A LAPSED CHOICE IS FIXTURE-VERIFIED, NOT LIVE. The plane states a lapse only on the `content=` arm
 *    (`on_point.lapsed`), which this page does not read, and NO op today can produce one: nothing deletes
 *    a `resolutions` row except a purge, which clears the choice with it. §4 therefore hands the renderer
 *    the plane's OWN lapse sentence, read out of `store.mjs` (never typed here), on the id/sha arm's
 *    shape. When D-575 lands a live lapse on the arm this page reads, §4 should be re-taken live.
 *  - The DOM is a stub: no browser fires the click, so §2 calls the page's handler with the button's
 *    dataset as the markup carries it (the dataset is parsed OUT OF THE RENDERED MARKUP, not typed).
 *  - CSS: a line rendered and then hidden by a stylesheet would read as rendered here.
 *
 * NEGATIVE CONTROL: `onpoint-choice.control.mjs` — the row's arm (*render the choice in place of the pair, and the
 * "never replacing" arm fails by name*) with three more, each armed ALONE on the EXTRACTED script (`app.html` never
 * edited, nothing to restore), each splice asserted to match EXACTLY ONCE, each declaring its failing assertions BY
 * NAME before it ran. RESULT 2026-09-25 (UI-91 worker), EVERY ARM AS DECLARED:
 *   baseline  exit 0 · 31/0.
 *   inplace   exit 1 · 28/3 — THE ROW'S CONTROL: "NEVER REPLACING: after the choice the MACHINE's line still names
 *             the machine's mention, and only it", "NEVER REPLACING: BESIDE — …the machine's first" and §4's "...and
 *             the machine's pair still renders before it" FAILED BY NAME; §1 (no choice yet, so nothing to replace)
 *             and the member's-line arm stayed green, as declared.
 *   says      exit 1 · 30/1 — the D-575 withholding arm alone.
 *   tokenctl  exit 1 · 30/1 — "A BEARER TOKEN is offered NO choice…" alone; §3 stayed green because the PLANE
 *             refuses the token whatever the page offers, which is the point of rendering its refusal.
 *   spelling  exit 0 · 31/0 — THE OVER-STRICTNESS ARM: both line labels re-worded; every arm reads the plane's
 *             strings and the markup's data attributes, not the page's sentences, so it passed first time.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";
import { CONNECTION_CHOICE_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";

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
  console.error("onpoint-choice: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const STORE_SRC = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "latin1");
const APP = process.env.UI91_APP_SRC || null;   /* the control harness hands a mutated app script through this */
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui91", MEMBER_TOKEN: "mem-ui91", PROBE_TOKEN: "prb-ui91", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-ui91") => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-ui91") => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

try {
/* ============================================================ 0. THE GROUND: REC-122's, ON A REAL PLANE */
console.log("--- 0. the ground: A mentions the ordinance on p.2 AND p.9, B once; a signed-in member ---");
const add = await post("memberadd", { memberId: "ruth", cover: "cover for ruth", role: "admin",
                                      capabilities: ["contribute", "publish"] }, "adm-ui91");
const en = await post("enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" });
const lg = await post("login", { role: "member:ruth", password: "ruth-passphrase-1" });
const RUTH = lg.token;
ok("FIXTURE: a member is enrolled and signed in", !!en.ok && typeof RUTH === "string", JSON.stringify(lg).slice(0, 200));

const NOW = "2026-09-14T00:00:00Z", LATER = "2026-09-14T01:00:00Z";
let bseq = 0;
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged", "source:", "  locator: in hand",
  "  authority: synthetic", `  retrieved: ${NOW}`, "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "A captured document.", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const promoteReading = async (captureSha, entities) => {
  const id = `INFO-2026-${String(9100 + (++bseq))}-u`; const md = infoMd(id);
  const prov = JSON.stringify({ documents: [{ capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW, entities, facts: {}, text_source: [{ step: "layer" }] } }] });
  const r = await post("promote", { bundleId: id, base: null,
    snapKey: `20260914T${String(410000 + bseq).slice(-6)}Z_${sha(String(bseq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: `Doc ${id}`, current_state: "collected", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }], register: [] });
  if (r.ok === false) throw new Error(JSON.stringify(r).slice(0, 400)); return id;
};
const pg = (n) => ({ kind: "pdf-page", ref: `p.${n}`, page: n - 1, rect: null });
const SA = sha("ui91-A"), SB = sha("ui91-B");
await promoteReading(SA, [
  { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579", source: pg(2) },
  { ref: "ordinance:13579-amended", kind: "ordinance", key: "13579-amended", label: "Ord. 13579 as amended", source: pg(9) }]);
await promoteReading(SB, [{ ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ord. No. 13,579", source: pg(5) }]);
const ent = await post("entitycreate", { kind: "ordinance", label: "Rent Adjustment Ordinance",
  aliases: ["ordinance:13579", "ordinance:13579-amended"] });
const E = ent.entity_id;
for (const s of [SA, SB]) await post("resolve", { captureSha: s });
const d = await post("connect", { entityId: E });
ok("GROUND: op=connect writes the one connection A-B", d.ok === true && d.count === 1, JSON.stringify(d).slice(0, 200));
const read = async (s) => ({ conns: await get("connections", `sha256=${s}&limit=50`), res: await get("resolutions", `sha256=${s}&limit=50`) });
const pre = await read(SA);
const AB0 = (pre.conns.connections || [])[0];
const sideA = AB0 && AB0.a_capture_sha === SA ? "a" : "b";
ok("GROUND: the machine's pair keeps ordinance:13579 on A's end, chosen: false, and no on_point",
   AB0?.determining_pair?.[`${sideA}_ref`] === "ordinance:13579" && AB0?.determining_pair?.selection?.chosen === false
   && !("on_point" in (AB0 || {})), JSON.stringify(AB0?.determining_pair).slice(0, 300));
ok("GROUND: op=resolutions lists BOTH of A's mentions of the subject (the set the act accepts, C-74.3)",
   ["ordinance:13579", "ordinance:13579-amended"].every((r) => (pre.res.resolutions || []).some((x) => x.entity_id === E && x.ref === r)),
   JSON.stringify(pre.res).slice(0, 300));

/* ============================================================ THE SURFACE, ITS FETCH BRIDGED TO THAT PLANE */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", _outer:"", textContent:"", scrollTop:0, disabled:false, hidden:false, checked:false, options:[],
    addEventListener(){}, querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){},
    click(){}, remove(){}, onclick:null, onchange:null, setAttribute(){}, getAttribute(){ return null; } };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  Object.defineProperty(e, "outerHTML", { get(){ return e._outer; }, set(v){ e._outer = v; } });
  return e;
}
const $$ = (s) => { if (!els.has(s)) els.set(s, el()); return els.get(s); };
let OUT = [];   /* the `[data-onpoint-out]` hosts the page would find, built from the RENDERED markup */
const WIRE = [];
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:(s)=> s === "[data-onpoint-out]" ? OUT : [], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){}, replaceState(){} },
  localStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  sessionStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  window:{ addEventListener(){}, open:()=>null },
  fetch: async (u, opts) => {
    const url = new URL(u, "http://x");
    let body = null; try { body = opts && opts.body ? JSON.parse(opts.body) : null; } catch (_) {}
    WIRE.push({ op: url.searchParams.get("op"), token: url.searchParams.get("token"), body });
    return mf.dispatchFetch(url.toString(), opts);
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
const APP_SRC = APP ? fs.readFileSync(APP, "utf8") : appScript();
vm.runInContext(APP_SRC + ";globalThis.__U = {" + [
  "PLANE", "docConnectionsHtml", "docConnPairHtml", "docChooseOnPoint",
].join(",") + "};", ctx);
const U = ctx.__U;
const asMember = () => { U.PLANE.base = "http://x"; U.PLANE.token = RUTH; U.PLANE.session = true; U.PLANE.preview = false;
  U.PLANE.me = { member: "ruth", handle: "ruth", session: true, administer: true, capabilities: ["contribute", "publish"] }; };
const asToken = () => { U.PLANE.base = "http://x"; U.PLANE.token = "mem-ui91"; U.PLANE.session = false; U.PLANE.preview = false;
  U.PLANE.me = { member: null, session: false, capabilities: ["contribute"] }; };
/* The rendered markup's own lines and buttons, parsed — never typed. */
const lineOf = (html, who) => (new RegExp(`<div class="subj-ref conn-(?:machine|onpoint)" data-pair="${who}"[^>]*>([\\s\\S]*?)</div>`).exec(html) || [])[0] || "";
const buttons = (html) => [...html.matchAll(/<button class="tbtn" ([^>]*)onclick="docChooseOnPoint\(this\)">/g)].map((m) => {
  const ds = {}; for (const a of m[1].matchAll(/data-onpoint-(\w+)="([^"]*)"/g)) ds[`onpoint${a[1][0].toUpperCase()}${a[1].slice(1)}`] = a[2];
  return ds; });
const unesc = (s) => String(s).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/* ============================================================ 1. BEFORE ANY CHOICE */
console.log("\n--- 1. before any choice: the machine's pair, stated as the plane states it; the offer, to a member only ---");
asMember();
const h1 = U.docConnectionsHtml(pre.conns, SA, pre.res);
const m1 = lineOf(h1, "machine");
ok("THE MACHINE'S PAIR IS RENDERED on the connection display, naming this document's mention",
   m1.includes("ordinance:13579") && !m1.includes("ordinance:13579-amended"), m1);
ok("...under the PLANE's own sentence about what the pair is (selection.says, verbatim) while nobody has chosen",
   h1.includes(AB0.determining_pair.selection.says), AB0.determining_pair.selection.says);
ok("no member's line is rendered while the plane publishes no on_point", lineOf(h1, "member") === "", lineOf(h1, "member"));
const b1 = buttons(h1);
ok("A SIGNED-IN MEMBER is offered the choice among BOTH of this document's mentions of the subject",
   b1.length === 2 && ["ordinance:13579", "ordinance:13579-amended"].every((r) => b1.some((b) => unesc(b.onpointRef) === r)),
   JSON.stringify(b1));
ok("...each button naming this end, the other end and the subject the connection runs through",
   b1.every((b) => b.onpointCapture === SA && b.onpointOther === SB && b.onpointEntity === E), JSON.stringify(b1[0]));
asToken();
ok("A BEARER TOKEN is offered NO choice over the same answer (the act is a signed-in member's, C-74.1)",
   buttons(U.docConnectionsHtml(pre.conns, SA, pre.res)).length === 0);
asMember();
const preB = await read(SB);
ok("a document with ONE mention of the subject is offered no choice — there is nothing to choose among",
   buttons(U.docConnectionsHtml(preB.conns, SB, preB.res)).length === 0);

/* ============================================================ 2. THE ACT, SENT BY THE PAGE, THEN THE READ */
console.log("\n--- 2. the page sends the act; the record's answer renders BESIDE the machine's pair ---");
const pick = b1.find((b) => unesc(b.onpointRef) === "ordinance:13579-amended");
const pickBtn = { dataset: { ...pick, onpointRef: unesc(pick.onpointRef) } };
const outHost = el(); outHost.dataset.onpointOut = `${SB}|${E}`; OUT = [outHost];
const wireBefore = WIRE.length;
const acted = await U.docChooseOnPoint(pickBtn);
const sent = WIRE.slice(wireBefore).find((w) => w.op === "connectionchoose");
ok("the page SENT op=connectionchoose with the capture, other end, subject and the chosen ref, under the member's session",
   !!sent && sent.token === RUTH && sent.body.capture === SA && sent.body.other === SB && sent.body.entity === E
   && sent.body.ref === "ordinance:13579-amended", JSON.stringify(sent));
ok("the plane RECORDED it in the member's name", acted?.accepted === true && acted.result?.wrote === true
   && acted.result?.chosen?.chosen_by === "ruth", JSON.stringify(acted).slice(0, 300));
ok("the page rendered the PLANE's own `says` for the act, verbatim", outHost._html.includes(
   acted.result.says.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")), outHost._html.slice(0, 300));
ok("...and re-read the panel from the record rather than painting what it sent",
   (els.get("#docknows")?._outer || "").includes('data-pair="member"'), (els.get("#docknows")?._outer || "").slice(0, 200));
const post1 = await read(SA);
const AB1 = (post1.conns.connections || [])[0];
ok("the plane's read now carries the member's on_point on A's end, and the machine's pair UNCHANGED",
   AB1?.on_point?.[sideA]?.ref === "ordinance:13579-amended"
   && AB1?.determining_pair?.[`${sideA}_ref`] === "ordinance:13579", JSON.stringify([AB1?.on_point, AB1?.determining_pair?.[`${sideA}_ref`]]));
const h2 = U.docConnectionsHtml(post1.conns, SA, post1.res);
const m2 = lineOf(h2, "machine"), c2 = lineOf(h2, "member");
ok("NEVER REPLACING: after the choice the MACHINE's line still names the machine's mention, and only it",
   m2.includes("ordinance:13579") && !m2.includes("ordinance:13579-amended"), m2);
ok("NEVER REPLACING: the MEMBER's line names the member's mention, and who chose it",
   c2.includes("ordinance:13579-amended") && c2.includes("ruth"), c2);
ok("NEVER REPLACING: BESIDE — both lines render in the same connection, the machine's first",
   !!m2 && !!c2 && h2.indexOf(m2) < h2.indexOf(c2), JSON.stringify([h2.indexOf(m2), h2.indexOf(c2)]));
/* CORRECTED by D-575's worker (2026-09-25), never exempted: this arm asserted the plane's sentence was
   STATIC — the same "which nobody has chosen" before and after the choice — which was the defect D-575
   fixes. The plane's sentence now names the choice; what this page owns is unchanged and still asserted:
   it withholds the plane's pair sentence beside a current choice rather than re-wording it. */
ok("D-575: the plane's pair sentence now names the choice (no longer 'which nobody has chosen'), and the page still WITHHOLDS it beside a current choice, never re-worded",
   !h2.includes(AB1.determining_pair.selection.says)
   && AB1.determining_pair.selection.says !== AB0.determining_pair.selection.says
   && !/which nobody has chosen$/.test(AB1.determining_pair.selection.says)
   && /which nobody has chosen$/.test(AB0.determining_pair.selection.says),
   JSON.stringify([AB0.determining_pair.selection.says, AB1.determining_pair.selection.says]));
ok("the offer marks the current choice and the machine's pair by name",
   /ordinance:13579-amended — the current choice/.test(h2) && /ordinance:13579 — the machine/.test(h2), h2.slice(0, 200));
const postB = await read(SB);
const hB = U.docConnectionsHtml(postB.conns, SB, postB.res);
ok("the OTHER document's page shows the choice as made on the other document, beside its own machine line",
   lineOf(hB, "machine").includes("ordinance:13579") && /on the other document/.test(lineOf(hB, "member"))
   && lineOf(hB, "member").includes("ordinance:13579-amended"), lineOf(hB, "member"));

/* ============================================================ 3. A REFUSAL, IN THE PLANE'S WORDS */
console.log("\n--- 3. the act under a bearer token: refused by the plane, rendered verbatim ---");
asToken();
const out3 = el(); out3.dataset.onpointOut = `${SB}|${E}`; OUT = [out3];
const refused = await U.docChooseOnPoint({ dataset: { ...pick, onpointRef: "ordinance:13579" } });
const T = CONNECTION_CHOICE_CHECKS.CONNECTION_CHOICE_NOT_A_MEMBER.translation;
ok("the plane refuses a token C-74.1 BY NAME", refused?.accepted === false
   && refused.refusal?.code === "CONNECTION_CHOICE_NOT_A_MEMBER", JSON.stringify(refused).slice(0, 300));
ok("...and the page renders the canned translation verbatim, with the code",
   (out3._html.includes(T) || out3._html.includes(T.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")))
   && out3._html.includes("CONNECTION_CHOICE_NOT_A_MEMBER"), out3._html.slice(0, 300));
ok("...and the record did not move: the member's choice stands",
   ((await get("connections", `sha256=${SA}&limit=50`)).connections || [])[0]?.on_point?.[sideA]?.ref === "ordinance:13579-amended");
asMember();

/* ============================================================ 4. A LAPSED CHOICE, AS THE PLANE STATES IT */
console.log("\n--- 4. a lapsed choice (FIXTURE-VERIFIED: no op can produce one today; the sentence is the plane's) ---");
/* CORRECTED at c21-batch28 (CONDUCT #21), where UI-91 first met D-454, never exempted: D-454 made the
   no-longer-carried lapse a TEMPLATE — `...occ` spread into the object and a conditional "at that place "
   when the choice named an occurrence — so the old anchor (the literal object head, then plain string
   concatenation) matched nothing and the sentence read null. This page's fixture choice names NO occurrence,
   so the sentence the plane states for it is the template with that clause EMPTY: read the template's string
   literals and drop the ternary's. Still read from store.mjs, never typed here. The page's handling of a
   NAMED occurrence is UI-112's (placed by SCHEDULER #21 for this meet). */
/* CORRECTED AGAIN by D-575's worker (2026-09-25): the lapse moved, unchanged in its words, into
   `Store#resolvePairChoice`, which RETURNS it (`return { lapsed: { ... } };`) rather than assigning it, so
   both heads are read and the object's close is `}` either way. */
const whyM = /(?:lapsed = |return \{ lapsed: )\{ ref: mine\.ref, (?:\.\.\.occ, )?chosen_by: mine\.chosen_by, at: mine\.at, lapsed: true,\s*why: ([\s\S]*?)\s*\}/.exec(STORE_SRC);
const LAPSE_WHY = whyM
  ? [...whyM[1].replace(/\(mine\.occurrence != null \? "[^"]*" : ""\)/g, "").matchAll(/"([^"]*)"/g)].map((m) => m[1]).join("")
  : null;
ok("the plane's lapse sentence was READ out of store.mjs (not typed here)", typeof LAPSE_WHY === "string" && LAPSE_WHY.length > 60,
   String(LAPSE_WHY));
const lapsedConn = { ...AB1, on_point: { [sideA]: { ref: "ordinance:13579-amended", chosen_by: "ruth", at: AB1.on_point[sideA].at,
                                                     lapsed: true, why: LAPSE_WHY }, [sideA === "a" ? "b" : "a"]: null } };
const h4 = U.docConnPairHtml(lapsedConn, SA, post1.res);
ok("a lapsed choice renders the PLANE's why, verbatim, marked lapsed",
   /data-lapsed="1"/.test(h4) && h4.includes(LAPSE_WHY), h4.slice(0, 400));
/* Structural, not a sentence of the page's: EVERY member line in the block carries the lapse mark. */
const memberLines4 = (h4.match(/data-pair="member"[^>]*>/g) || []);
ok("...and is NOT rendered as a standing choice: every member line in the block is marked lapsed",
   memberLines4.length === 1 && memberLines4.every((t) => /data-lapsed="1"/.test(t)), JSON.stringify(memberLines4));
ok("...and the machine's pair still renders before it", lineOf(h4, "machine").includes("ordinance:13579")
   && h4.indexOf(lineOf(h4, "machine")) < h4.indexOf("data-lapsed"));

/* ============================================================ 5. WHERE THE WORDS COME FROM */
console.log("\n--- 5. the surface holds no copy of the plane's sentences ---");
const SENT = [AB0.determining_pair.selection.says, T, acted.result.says, LAPSE_WHY].filter(Boolean);
ok("STRUCTURAL: app.html holds NO COPY of any plane sentence it renders — it could not have agreed for free",
   SENT.every((s) => !APP_SRC.includes(s.slice(0, 50))), SENT.filter((s) => APP_SRC.includes(s.slice(0, 50))).join(" | "));
ok("the corpus these arms read is non-empty (a totality over nothing is not evidence)",
   SENT.length === 4 && b1.length === 2 && (pre.res.resolutions || []).length >= 2);
} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`); fail++;
} finally {
  await mf.dispose();
}
console.log(`\nonpoint-choice: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
