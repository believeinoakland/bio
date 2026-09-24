/* D-291 — THE RESOLVE LIST TAKES A SELECTION, AS ONE MOTION (BIO_Interaction_Constructs_v0_1.md §S "SELECTION-SCOPED
 * ACTION — how any act goes bulk, safely", named by BOB #32's ruling of 2026-09-23 23:30Z; DEC-69 as amended).
 *
 * THE ROW'S ACCEPTS-WHEN, the surface half: *"bulk and single both reach the op in one motion"*. Single: pick one
 * candidate and resolve it — ONE `op=resolve` naming ONE document. Bulk: tick several — ONE `op=resolve` carrying
 * `items[]`. The plane half (`op=resolve`'s set form over D-126's `per-item` weight) is
 * `bio-plane/test/resolveset.test.mjs`.
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * `bio-plane/src/index.mjs` runs under miniflare: a subject registered and documents promoted with real readings
 * through the ops, the candidate list the plane's own `op=readingname`, and what each act did READ BACK from
 * `op=resolutions`. The one exception is stated below.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (1) N CALLS DRESSED AS ONE CONTROL — the wire is counted: ONE `op=resolve` for the whole selection, carrying
 *      `items`, and zero single-document calls beside it (the row's NEGATIVE CONTROL: `resolve-set.control.mjs`).
 *  (2) A BULK MODE THAT REPLACED THE SINGLE ONE — the single path is driven too, and must send ONE call naming ONE
 *      document and no `items`.
 *  (3) A RECEIPT OF THE SURFACE'S OWN — every document the surface says it resolved must be resolved in the record.
 *  (4) A DOCUMENT DROPPED IN SILENCE — a document the record did not resolve stays ticked and listed with the
 *      record's own reason.
 *  (5) A BULK CONTROL THE PLANE DID NOT PUBLISH — section 3 hands the surface a plane answer with no `set_acts`, and
 *      no tick and no selection bar may be drawn.
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - THE RETAINED PATH IS DRIVEN BY A DOCTORED CANDIDATE, and that is a finding rather than a shortcut. A capture is
 *    content-addressed and `op=resolve` over a whole document refuses only an ABSENT sha, so the plane hands this
 *    list no real candidate it would refuse. Section 2 adds ONE candidate with an empty sha to `op=readingname`'s
 *    answer at the wire, so the per-item refusal (`NO_SHA`, the record's own) is exercised end to end; every other
 *    candidate and every answer is the plane's.
 *  - The DOM is a stub, the reach every civicos-ui suite has: the tick's `onchange` is not fired by a browser, so the
 *    suite calls the function the tick names (`resolveSelectionToggle`) and asserts separately that the tick names it.
 *
 * NEGATIVE CONTROL: arms declared and run in `resolve-set.control.mjs`; results recorded on the line below.
 * CONTROL RESULT 2026-09-24 (D-291 worker), `node civicos-ui/test/resolve-set.control.mjs`, every arm armed alone on the
 * EXTRACTED script (app.html never edited, nothing to restore), each splice asserted to match exactly once:
 *   baseline    exit 0 · 17 pass / 0 fail.
 *   loop        exit 1 · 14/3 — THE ROW'S CONTROL, as declared: "ONE call for the whole selection…", "each item names
 *               only its own document…" and "still ONE call for a mixed selection". Every READ BACK stayed green — the
 *               loop resolves every document, which is exactly why only the wire can tell one motion from N.
 *   silentdrop  exit 1 · 15/2 — "KEPT: …" and "with the RECORD's reason …", as declared. Sections 1 and 3 green.
 *   unpublished exit 1 · 16/1 — section 3's "NO tick", as declared; "there is no selection bar" green, as declared.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";

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
  console.error("resolve-set: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const APP = process.env.D291_APP_SRC || null;   /* the control harness hands a mutated app script through this */
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d291", MEMBER_TOKEN: "mem-d291", PROBE_TOKEN: "prb-d291", VERSION: "test",
              CONNECTION_DERIVE_DELAY_MS: "600000" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();

try {
/* ============================================================ 0. THE GROUND */
console.log("\n--- 0. the ground: a real plane, one subject, four documents naming it ---");
/* The enrolment the queue suite uses (a group's first members are its administrators, then a member). */
const enrol = async (memberId, role) => {
  const add = rP(await POST("op=memberadd&token=adm-d291", { memberId, cover: `cover for ${memberId}`, role }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await enrol("iris", "admin");
await enrol("adam", "admin");
const MONA = await enrol("mona", "member");

const AT = "2026-09-24T00:00:00Z";
const docs = [];
for (let i = 1; i <= 4; i++) {
  const id = `INFO-2026-09${String(60 + i)}-d291`;
  const cap = sha(`d291-doc-${i}`);
  const md = ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Contract notice ${i}"`,
    "current_state: collected", "prior_state: null", `created: "${AT}"`, `last_updated: "${AT}"`,
    "produced_by:", "  mode: agent", "  capability_tier: high", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "---", "", "## Summary", "", "A notice.", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [{ capture: { sha256: cap, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: AT,
               entities: [{ ref: "contract:D291", kind: "contract", key: "D291", label: "D-291 contract" }] } }] });
  const r = rP(await POST(`op=promote&token=${MONA}`, { bundleId: id, base: null, snapKey: `d291-${i}`,
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }], register: [],
    meta: { object_type: "information", group: "believe-in-oakland", title: `Contract notice ${i}`,
            current_state: "collected", created: AT, last_updated: AT } }));
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 400)}`);
  docs.push(cap);
}
const ent = rP(await POST(`op=entitycreate&token=${MONA}`, { kind: "contract", label: "D-291 contract", aliases: ["contract:D291"] }));
if (!ent?.entity_id) throw new Error(`entitycreate: ${JSON.stringify(ent)}`);
const resolvedCount = async (cap) => rP(await GET(`op=resolutions&sha256=${cap}&token=${MONA}`))?.count;

/* ============================================================ THE SURFACE, ITS FETCH BRIDGED TO THAT PLANE */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
    remove(){}, onclick:null, onchange:null, setAttribute(){}, getAttribute(){ return null; } };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if (!els.has(s)) els.set(s, el()); return els.get(s); };
const WIRE = [];
let HIDE_SET_ACTS = false, DOCTOR = false;
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
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
    const op = url.searchParams.get("op");
    let body = null; try { body = opts && opts.body ? JSON.parse(opts.body) : null; } catch (_) {}
    WIRE.push({ op, body });
    const res = await mf.dispatchFetch(url.toString(), opts);
    if ((HIDE_SET_ACTS && op === "affordances") || (DOCTOR && op === "readingname")) {
      const j = await res.json();
      if (HIDE_SET_ACTS && j && j.result) delete j.result.set_acts;
      /* THE ONE DOCTORED ANSWER (see the header): a candidate the record would refuse, because the plane hands
         this list no real one. */
      if (DOCTOR && j && j.result && Array.isArray(j.result.documents))
        j.result.documents.push({ capture_sha: "", bundle_id: "a candidate with no document behind it", correspondence: "reference", ref: "contract:D291" });
      return new Response(JSON.stringify(j), { status: 200 });
    }
    return res;
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext((APP ? fs.readFileSync(APP, "utf8") : appScript()) + ";globalThis.__U = {" + [
  "PLANE", "INTENT_SUBJ", "loadActSource", "loadResolveCandidates", "resolveSelectionToggle", "resolveApplySet",
  "resolvePick", "resolveGo",
].join(",") + ", SEL: () => [...RES_SEL], RET: () => [...RES_RETAINED.keys()] };", ctx);
const U = ctx.__U;
U.PLANE.token = MONA;
U.PLANE.session = true;
U.PLANE.me = { member: "mona", handle: "mona", session: true, administer: false, capabilities: ["contribute"] };
U.INTENT_SUBJ.entity = { entity_id: ent.entity_id, label: "D-291 contract", kind: "contract", aliases: [] };

const L = () => $$("#res-cands")._html;
const cand = (cap) => (new RegExp(`<div class="res-cand">(?:(?!<div class="res-cand">)[\\s\\S])*?resolvePick\\('${cap}'\\)[\\s\\S]*?</button>(?:<div class="q-retained"[\\s\\S]*?</div>)?</div>`).exec(L()) || [null])[0];
const unent = (s) => String(s || "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&rsquo;/g, "’");

/* ============================================================ 1. BULK AND SINGLE, EACH ONE MOTION */
console.log("\n--- 1. bulk: three documents ticked, ONE call; single: one document picked, ONE call ---");
await U.loadActSource(true);
await U.loadResolveCandidates();
ok("the fixture is real: all four documents are candidates from the plane's own lookup",
   docs.every((c) => !!cand(c)), JSON.stringify(docs.map((c) => !!cand(c))));
ok("each candidate carries a tick that FEEDS THE SET (it names resolveSelectionToggle)",
   docs.every((c) => new RegExp(`data-rsel="${c}"[^>]*resolveSelectionToggle\\('${c}'`).test(cand(c) || "")));
ok("and each keeps its own single-document button — neither mode replaced the other",
   docs.every((c) => /class="intent-pick"/.test(cand(c) || "")));
for (const c of docs.slice(0, 3)) U.resolveSelectionToggle(c, true);
ok("three are selected, and the bar carries the PLANE's published label",
   U.SEL().length === 3 && /3 selected\.<\/b>/.test(L()) && /Resolve the selected documents&#39;? ?references \(3\)|Resolve the selected documents(?:'|&#39;) references \(3\)/.test(L()),
   L().slice(0, 600));

let before = WIRE.length;
await U.resolveApplySet();
const bulk = WIRE.slice(before).filter((w) => w.op === "resolve");
ok("ONE call for the whole selection, carrying three items — not three calls",
   bulk.length === 1 && Array.isArray(bulk[0].body?.items) && bulk[0].body.items.length === 3,
   JSON.stringify(bulk.map((w) => w.body)));
ok("each item names only its own document; the resolver is the plane's stamp and is never sent",
   bulk.length === 1 && bulk[0].body.items.every((it, i) => it.captureSha === docs[i] && Object.keys(it).length === 1)
   && !("resolvedBy" in bulk[0].body));
ok("READ BACK: the three documents the surface sent are resolved in the record, the fourth is not",
   JSON.stringify(await Promise.all(docs.map(resolvedCount))) === JSON.stringify([1, 1, 1, 0]),
   JSON.stringify(await Promise.all(docs.map(resolvedCount))));
ok("the receipt counts what the RECORD answered, and the selection is cleared",
   /The record read 3 documents \(3 references\)\./.test(unent(L())) && U.SEL().length === 0 && U.RET().length === 0, unent(L()).slice(0, 800));

before = WIRE.length;
await U.resolvePick(docs[3]);
await U.resolveGo();
const single = WIRE.slice(before).filter((w) => w.op === "resolve");
/* The single path's pre-flight asks op=resolve with the document WITHHELD (INTENT_HOLD), which is a question and
   not an act; the ACT is the one call naming the document. */
const acts = single.filter((w) => w.body && w.body.captureSha);
ok("single: ONE act naming ONE document, with no `items`",
   acts.length === 1 && acts[0].body.captureSha === docs[3] && !("items" in acts[0].body), JSON.stringify(single.map((w) => w.body)));
ok("READ BACK: the picked document is resolved", (await resolvedCount(docs[3])) === 1);

/* ============================================================ 2. RETAINED, WITH THE RECORD'S REASON */
console.log("\n--- 2. a document the record does not resolve stays selected with the record's reason ---");
DOCTOR = true;
await U.loadResolveCandidates();
DOCTOR = false;
ok("fixture: the doctored candidate is listed beside the real ones", !!cand("") && docs.every((c) => !!cand(c)));
U.resolveSelectionToggle(docs[0], true);
U.resolveSelectionToggle("", true);
before = WIRE.length;
await U.resolveApplySet();
const mixed = WIRE.slice(before).filter((w) => w.op === "resolve");
ok("still ONE call for a mixed selection", mixed.length === 1 && mixed[0].body.items.length === 2);
const kept = cand("");
ok("KEPT: exactly the refused one is still selected, and the resolved one is not",
   JSON.stringify(U.SEL()) === JSON.stringify([""]) && JSON.stringify(U.RET()) === JSON.stringify([""]), JSON.stringify([U.SEL(), U.RET()]));
ok("with the RECORD's reason in its own words (op=resolve's NO_SHA detail), on the document itself",
   !!kept && /q-retained/.test(kept) && /named by its capture sha256/.test(unent(kept)), unent(kept));
ok("and the receipt says one was read and one was not",
   /The record read 1 document \(1 reference\), and did not resolve 1/.test(unent(L())), unent(L()).slice(0, 600));

/* ============================================================ 3. NO PUBLICATION, NO BULK CONTROL */
console.log("\n--- 3. a plane that publishes no resolve set act gets no tick and no bar ---");
HIDE_SET_ACTS = true;
await U.loadActSource(true);
await U.loadResolveCandidates();
ok("every candidate keeps its single button and has NO tick", docs.every((c) => /intent-pick/.test(cand(c) || "") && !/data-rsel=/.test(cand(c) || "")));
ok("and there is no selection bar", !/data-rselbar/.test(L()));
HIDE_SET_ACTS = false;
} finally {
  await mf.dispose();
}
console.log(`\nresolve-set: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
