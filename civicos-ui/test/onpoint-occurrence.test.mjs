/* UI-112 — A CONNECTION'S ON-POINT CHOICE IS OF AN OCCURRENCE: ONE STRING READ ON THREE PAGES OFFERS THREE
 * CHOICES, EACH SENT WITH `occurrence=` AND EACH ACCEPTED.
 *
 * THE ROW: D-454 made `op=connectionchoose` take `occurrence=` and refuse C-74.4
 * CONNECTION_CHOICE_OCCURRENCE_UNNAMED where a string read at several places is named alone, and UI-91's
 * `docChooseOnPoint` sent no occurrence — so the chooser offered, in the common case, an act the plane refuses.
 * DESIGN: `BIO_Content_Framework_v0_10.md` §14.5 (the connection pair), with D-454's occurrence key and
 * REC-122's choice (C-74).
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * `bio-plane/src/index.mjs` under miniflare, UI-91's harness. Document A's reading carries ONE reference
 * string read on p.3, p.7 and p.11 (`source` plus `occurrences`, the reader's D-454 shape); B reads it once.
 * The page reads the places through the plane's own `op=readingref` (`docMentionPlaces`), renders the offer
 * from them, and sends the act through a fetch bridged to that plane under a signed-in member's session.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (1) AN OFFER OF STRINGS — the pre-UI-112 page: one button for the string (and none at all here, since
 *      it drew only for two strings or more). §1 asserts THREE offers, one per place, read from the plane.
 *  (2) AN OFFER THE PLANE REFUSES — the row's NEGATIVE CONTROL: the act sent without `occurrence=`. §2
 *      asserts each offer is ACCEPTED and recorded at its own place; unarmed, the plane answers C-74.4.
 *  (3) A PRESELECTED CHOICE — §1 asserts no offer is marked current while the plane publishes no on_point.
 *  (4) A PAGE-AUTHORED REFUSAL OR LIST — §3 asserts C-74.4 renders in its canned translation and the
 *      follow-up offers are the plane's OWN keyed `occurrences`, in its order.
 *  (5) AN AMBIGUOUS CHOICE RENDERED AS STANDING — §4 hands the renderer the plane's own ambiguity sentence.
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - AMBIGUITY IS FIXTURE-VERIFIED. The plane states it only on the `content=` arm; the id/sha arm this
 *    page reads publishes a pre-D-454 choice as `{ ref, occurrence: null, ... }` and says nothing more
 *    (D-575's ground), and no op writes a choice with no occurrence since D-454.
 *  - The id/sha arm's `on_point` carries the chosen occurrence's KEY and no `position`, so after a choice
 *    of one place of a string read at several the page marks NO place current (it cannot say which) —
 *    the member's line names the string and who chose it.
 *  - The DOM is a stub: handlers are called with datasets PARSED OUT OF THE RENDERED MARKUP.
 *
 * NEGATIVE CONTROL: `onpoint-occurrence.control.mjs`, each arm alone on the EXTRACTED script (app.html never
 * edited), each splice asserted to match exactly once, failures declared BY NAME before the run.
 * RESULT 2026-09-25 (UI-112 worker), EVERY ARM AS DECLARED; app.html sha256 e4bb0c0d… (1,637,046 bytes)
 * identical before and after the run (the arms splice the extracted script, never the file):
 *   baseline      exit 0 · 27/0.
 *   nooccurrence  exit 1 · 18/9 — THE ROW'S CONTROL: `occurrence=` omitted, the plane answers C-74.4 and
 *                 "THREE-PAGE ARM: no offer reads C-74.4 CONNECTION_CHOICE_OCCURRENCE_UNNAMED (or any refusal)"
 *                 FAILED BY NAME, with the three "THREE-PAGE ARM: the offer at p.N is ACCEPTED…" and their
 *                 consequences (the keys, the `says`, the read-back, §3's keyed follow-up, the corpus floor).
 *   strings       exit 1 · 16/8 — the pre-UI-112 offer: "…OFFERS THREE CHOICES, one per place" and every arm
 *                 resting on §1's offers; §3 (the act and C-74.4 rendered) stayed green, as declared.
 *   preselect     exit 1 · 25/2 — "NOTHING PRESELECTED…" and §4's "not marked current" alone.
 *   spelling      exit 0 · 27/0 — THE OVER-STRICTNESS ARM: the place wording re-spelled; every arm reads the
 *                 markup's data attributes and the plane's strings. It first FAILED one arm (the machine mark
 *                 was matched by the page's sentence): corrected to read the button's `data-onpoint-occurrence`.
 * FOUND, minted D-625: the act reads an empty `occurrence=` as none named, so an UNPLACED occurrence of a
 * string read at several places (the '' key, which C-74.4 itself lists) cannot be chosen. §3 shows such an
 * occurrence and does not offer it.
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
  console.error("onpoint-occurrence: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const STORE_SRC = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "latin1");
const APP = process.env.UI112_APP_SRC || null;   /* the control harness hands a mutated app script through this */
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui112", MEMBER_TOKEN: "mem-ui112", PROBE_TOKEN: "prb-ui112", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-ui112") => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-ui112") => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

try {
/* ============================================================ 0. THE GROUND: ONE STRING READ ON THREE PAGES */
console.log("--- 0. the ground: A reads the ordinance on p.3, p.7 AND p.11 (one string), B once; a signed-in member ---");
const add = await post("memberadd", { memberId: "ruth", cover: "cover for ruth", role: "admin",
                                      capabilities: ["contribute", "publish"] }, "adm-ui112");
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

const SA = sha("ui112-A"), SB = sha("ui112-B");
const REF = "ordinance:24680", PAGES = ["p.3", "p.7", "p.11"];
await promoteReading(SA, [{ ref: REF, kind: "ordinance", key: "24680", label: "Ordinance No. 24680",
                            source: pg(3), occurrences: [pg(7), pg(11)] }]);
await promoteReading(SB, [{ ref: REF, kind: "ordinance", key: "24680", label: "Ord. No. 24,680", source: pg(5) }]);
const ent = await post("entitycreate", { kind: "ordinance", label: "Tenant Protection Ordinance", aliases: [REF] });
const E = ent.entity_id;
for (const s of [SA, SB]) await post("resolve", { captureSha: s });
const d = await post("connect", { entityId: E });
ok("GROUND: op=connect writes the one connection A-B", d.ok === true && d.count === 1, JSON.stringify(d).slice(0, 200));
const read = async (s) => ({ conns: await get("connections", `sha256=${s}&limit=50`), res: await get("resolutions", `sha256=${s}&limit=50`) });
const pre = await read(SA);
const AB0 = (pre.conns.connections || [])[0];
const sideA = AB0 && AB0.a_capture_sha === SA ? "a" : "b";
ok("GROUND: op=resolutions lists ONE mention string of the subject on A — the old offer (strings, two or more) drew nothing here",
   (pre.res.resolutions || []).filter((x) => x.entity_id === E).length === 1, JSON.stringify(pre.res).slice(0, 300));
const rr = await get("readingref", `ref=${encodeURIComponent(REF)}`);
const rrA = (rr.documents || []).find((x) => x.capture_sha === SA);
ok("GROUND: op=readingref lists A's THREE places for the string, in reading order (D-454's `occurrences`)",
   JSON.stringify((rrA?.occurrences || []).map((p) => p && p.ref)) === JSON.stringify(PAGES), JSON.stringify(rrA).slice(0, 400));

/* ============================================================ SURFACE */
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
  "PLANE", "docConnectionsHtml", "docConnPairHtml", "docChooseOnPoint", "docMentionPlaces",
].join(",") + "};", ctx);
const U = ctx.__U;
const asMember = () => { U.PLANE.base = "http://x"; U.PLANE.token = RUTH; U.PLANE.session = true; U.PLANE.preview = false;
  U.PLANE.me = { member: "ruth", handle: "ruth", session: true, administer: true, capabilities: ["contribute", "publish"] }; };
const asToken = () => { U.PLANE.base = "http://x"; U.PLANE.token = "mem-ui112"; U.PLANE.session = false; U.PLANE.preview = false;
  U.PLANE.me = { member: null, session: false, capabilities: ["contribute"] }; };
/* The rendered markup's own lines and buttons, parsed — never typed. */
const lineOf = (html, who) => (new RegExp(`<div class="subj-ref conn-(?:machine|onpoint)" data-pair="${who}"[^>]*>([\\s\\S]*?)</div>`).exec(html) || [])[0] || "";
const buttons = (html) => [...html.matchAll(/<button class="tbtn" ([^>]*)onclick="docChooseOnPoint\(this\)">/g)].map((m) => {
  const ds = {}; for (const a of m[1].matchAll(/data-onpoint-(\w+)="([^"]*)"/g)) ds[`onpoint${a[1][0].toUpperCase()}${a[1].slice(1)}`] = a[2];
  return ds; });
const unesc = (s) => String(s).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");


/* ============================================================ 1. THE OFFER IS OF PLACES */
console.log("\n--- 1. the chooser offers each OCCURRENCE, read from the plane, nothing preselected ---");
asMember();
const occ = await U.docMentionPlaces(SA, pre.conns, pre.res);
ok("the page READ the places through op=readingref (on the wire), under the member's session",
   WIRE.some((w) => w.op === "readingref" && w.token === RUTH), JSON.stringify(WIRE.map((w) => w.op)));
const h1 = U.docConnectionsHtml(pre.conns, SA, pre.res, occ);
const b1 = buttons(h1);
ok("THREE-PAGE ARM: a string read on three pages OFFERS THREE CHOICES, one per place",
   b1.length === 3 && PAGES.every((p) => b1.some((b) => unesc(b.onpointOccurrence) === p)) && b1.every((b) => unesc(b.onpointRef) === REF),
   JSON.stringify(b1));
ok("...each naming this end, the other end and the subject",
   b1.every((b) => b.onpointCapture === SA && b.onpointOther === SB && b.onpointEntity === E), JSON.stringify(b1[0]));
ok("NOTHING PRESELECTED: no offer is marked the current choice while the plane publishes no on_point",
   !/the current choice/.test(h1) && !("on_point" in (AB0 || {})), h1.slice(0, 200));
ok("the machine's pair is marked at ITS place only, not at every place of the string",
   [...h1.matchAll(/<button class="tbtn" [^>]*data-onpoint-occurrence="([^"]*)"[^>]*>[^<]*<\/button>/g)]
     .filter((m) => /the machine&rsquo;s pair/.test(m[0])).map((m) => unesc(m[1]))
     .join() === AB0.determining_pair[`${sideA}_position`].ref,
   JSON.stringify(AB0.determining_pair).slice(0, 300));
asToken();
ok("A BEARER TOKEN reads no places and is offered no choice (C-74.1)",
   (await U.docMentionPlaces(SA, pre.conns, pre.res)).size === 0
   && buttons(U.docConnectionsHtml(pre.conns, SA, pre.res, occ)).length === 0);
asMember();

/* ============================================================ 2. EACH IS ACCEPTED */
console.log("\n--- 2. each of the three is sent with occurrence= and ACCEPTED by the plane ---");
const outHost = el(); outHost.dataset.onpointOut = `${SB}|${E}`; OUT = [outHost];
const accepted = [];
const refusedBy = [];
for (const b of b1) {
  const wireBefore = WIRE.length;
  const r = await U.docChooseOnPoint({ dataset: { ...b, onpointRef: unesc(b.onpointRef), onpointOccurrence: unesc(b.onpointOccurrence) } });
  const sent = WIRE.slice(wireBefore).find((w) => w.op === "connectionchoose");
  const want = unesc(b.onpointOccurrence);
  ok(`THREE-PAGE ARM: the offer at ${want} is ACCEPTED — the act carried occurrence=${want} and the plane recorded that place`,
     r?.accepted === true && sent?.body?.occurrence === want && r.result?.wrote === true
     && r.result?.chosen?.position?.ref === want && r.result?.chosen?.chosen_by === "ruth",
     JSON.stringify({ sent: sent?.body, r }).slice(0, 500));
  if (r?.accepted) accepted.push(r.result); else refusedBy.push(r?.refusal?.code || "(no code)");
}
ok("THREE-PAGE ARM: no offer reads C-74.4 CONNECTION_CHOICE_OCCURRENCE_UNNAMED (or any refusal)",
   b1.length === 3 && refusedBy.length === 0, JSON.stringify(refusedBy));
ok("...three distinct occurrence keys were recorded, one per place",
   new Set(accepted.map((a) => a.chosen.occurrence)).size === 3 && accepted.every((a) => a.chosen.occurrence));
ok("the page rendered the PLANE's own `says` for the last act, verbatim",
   accepted.length === 3 && outHost._html.includes(accepted[2].says.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")),
   outHost._html.slice(0, 300));
const post1 = await read(SA);
const AB1 = (post1.conns.connections || [])[0];
ok("the plane's read carries the member's on_point with the LAST place's key, and the machine's pair unchanged",
   AB1?.on_point?.[sideA]?.ref === REF && AB1?.on_point?.[sideA]?.occurrence === accepted[2]?.chosen?.occurrence
   && AB1?.determining_pair?.[`${sideA}_ref`] === AB0.determining_pair[`${sideA}_ref`], JSON.stringify(AB1?.on_point));

/* ============================================================ 3. C-74.4, IN ITS DEC-49 WORDS, AND THE PLANE'S OWN LIST */
console.log("\n--- 3. a string offered with no place: the plane refuses C-74.4; the page renders it and offers the plane's occurrences ---");
const out3 = el(); out3.dataset.onpointOut = `${SB}|${E}`; OUT = [out3];
/* The offer a mention whose places could not be read makes: the string, with no occurrence — what
   `docOnPointOffers` emits then. Built from the ground's own values rather than §1's markup, so this arm
   answers for the act and the refusal whatever §1's offer did. */
const bare = { onpointCapture: SA, onpointOther: SB, onpointEntity: E, onpointRef: REF, onpointOccurrence: "" };
const r3 = await U.docChooseOnPoint({ dataset: { ...bare, onpointRef: unesc(bare.onpointRef), onpointOccurrence: "" } });
const T4 = CONNECTION_CHOICE_CHECKS.CONNECTION_CHOICE_OCCURRENCE_UNNAMED.translation;
const escT = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
ok("the plane refuses the string named alone, C-74.4 BY NAME", r3?.accepted === false
   && r3.refusal?.code === "CONNECTION_CHOICE_OCCURRENCE_UNNAMED", JSON.stringify(r3).slice(0, 300));
ok("...and the page renders C-74.4 in its DEC-49 words (the canned translation, verbatim) with the code",
   (out3._html.includes(T4) || out3._html.includes(escT(T4))) && out3._html.includes("CONNECTION_CHOICE_OCCURRENCE_UNNAMED"),
   out3._html.slice(0, 400));
const again = buttons(out3._html);
const listed = (r3.refusal?.occurrences || []).map((x) => x.occurrence);
ok("...followed by one offer per occurrence THE PLANE LISTED, each sending the plane's key",
   again.length === 3 && listed.length === 3 && again.every((b, i) => unesc(b.onpointOccurrence) === listed[i]),
   JSON.stringify({ again, listed }).slice(0, 500));
const r3b = again.length ? await U.docChooseOnPoint({ dataset: { ...again[0], onpointRef: unesc(again[0].onpointRef), onpointOccurrence: unesc(again[0].onpointOccurrence) } }) : null;
ok("...and an offer taken from the plane's list is ACCEPTED", r3b?.accepted === true && r3b.result?.chosen?.occurrence === listed[0],
   JSON.stringify(r3b).slice(0, 300));

/* ============================================================ 4. A PRE-D-454 CHOICE THE PLANE STATES AMBIGUOUS */
console.log("\n--- 4. a pre-D-454 choice the plane states AMBIGUOUS (FIXTURE-VERIFIED: the sentence is the plane's) ---");
/* No op can write a choice with no occurrence since D-454 (the act keys every choice it records), and the
   plane states ambiguity only on the `content=` arm, which this page does not read. So the renderer is handed
   the plane's OWN ambiguity sentence, read out of store.mjs (its template literals, the two substitutions
   filled with this ground's values), on the shape that arm publishes. */
const ambM = /lapsed: true, ambiguous: true,[\s\S]*?why: ([\s\S]*?)\};/.exec(STORE_SRC);
const AMB_WHY = ambM ? [...ambM[1].matchAll(/`([^`]*)`/g)].map((m) => m[1]).join("")
  .replace("${mine.ref}", REF).replace("${reads.length}", "3") : null;
ok("the plane's ambiguity sentence was READ out of store.mjs (not typed here), both substitutions filled",
   typeof AMB_WHY === "string" && AMB_WHY.length > 60 && !AMB_WHY.includes("${"), String(AMB_WHY));
const ambConn = { ...AB0, on_point: { [sideA]: { ref: REF, chosen_by: "ruth", at: "2026-09-20T00:00:00Z", lapsed: true, ambiguous: true,
  occurrences: (r3.refusal?.occurrences || []), why: AMB_WHY }, [sideA === "a" ? "b" : "a"]: null } };
const h4 = U.docConnPairHtml(ambConn, SA, pre.res, occ);
ok("an AMBIGUOUS choice renders the PLANE's why, verbatim, marked ambiguous and lapsed",
   /data-lapsed="1" data-ambiguous="1"/.test(h4) && (h4.includes(AMB_WHY) || h4.includes(escT(AMB_WHY)) || h4.includes(AMB_WHY.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"))), h4.slice(0, 500));
ok("...and is NOT rendered as a standing choice, nor marked current at any place",
   (h4.match(/data-pair="member"[^>]*>/g) || []).every((t) => /data-lapsed="1"/.test(t)) && !/the current choice/.test(h4));
ok("...and the three places are still offered, so choosing again can settle it", buttons(h4).length === 3);

/* ============================================================ 5. WHERE THE WORDS COME FROM */
console.log("\n--- 5. the surface holds no copy of the plane's sentences ---");
const SENT = [T4, accepted[2]?.says, AMB_WHY].filter(Boolean);
ok("STRUCTURAL: app.html holds NO COPY of any plane sentence it renders",
   SENT.every((s) => !APP_SRC.includes(s.slice(0, 50))), SENT.filter((s) => APP_SRC.includes(s.slice(0, 50))).join(" | "));
ok("the corpus these arms read is non-empty (a totality over nothing is not evidence)",
   SENT.length === 3 && b1.length === 3 && again.length === 3);
} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`); fail++;
} finally {
  await mf.dispose();
}
console.log(`\nonpoint-occurrence: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
