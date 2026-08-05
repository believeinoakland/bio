/* UI-39 · THE PLANE PUBLISHED A BOUND AND THE SURFACE DROPPED IT.
 * ============================================================================
 *
 * UI-25 fixed five sites of this class and REPORTED four more that sat outside
 * its claim. This suite drives those four, and it sweeps for the class rather
 * than trusting the four.
 *
 * WHAT MAKES ONE OF THESE DIFFERENT FROM THE OTHER THREE, and it is the whole
 * reason this item exists: (b), (c) and (d) narrow a DISPLAY. (a) narrows a
 * WRITE. `heldMatch` read `op=search` at the plane's LIMIT_DEFAULT of 50, and
 * `addGo` uses that read to decide whether to call `op=promote`. A capture whose
 * match sat past the fiftieth row at its address was therefore invisible to the
 * check, so the record grew a SECOND BUNDLE for one document — and, because
 * `CHANGED_FROM` stayed null, it grew one carrying none of the "a second capture
 * rather than a repeat of the first" sentence that makes a legitimate re-capture
 * legible. C-18.3's ring-once rule cannot catch it: it compares hashes WITHIN a
 * single bundle, so nothing at all stopped the duplicate except this read.
 *
 * SO ARM A ASSERTS THE WRITE, NOT THE DISPLAY. It plants a real match past the
 * plane's default, runs the REAL `addGo` end to end against a wire mock, and
 * asserts `op=promote` NEVER REACHES THE WIRE — naming the write it prevented.
 * It also proves the fixture actually arms the trap, by asserting that the page
 * the OLD code would have read does NOT contain the match: without that, "no
 * promote" is an outcome that costs nothing (CLAUDE.md), because a fixture whose
 * match sat at row 3 would pass with the bound still dropped.
 *
 * THE SWEEP IS TWO WALKS AND EACH ONE'S REACH IS ASSERTED AS A DELTA.
 * Asserting "0 unbounded call sites" is worthless on its own — a walk that
 * matches nothing reports zero and passes forever (UI-25 measured this class
 * eight times). So each walk is also run over a DELIBERATELY BROKEN COPY of the
 * same source, and must report MORE. The difference is the evidence; the
 * absolute is not.
 *
 *   WALK 1 — THE WIRE. `bio-plane/src/store.mjs` and `src/query.mjs` are read
 *     TEXTUALLY (store.mjs opens with `import … from "cloudflare:workers"` and
 *     cannot be imported — the same reason `preauth-vocabulary.test.mjs` reads
 *     it textually). Every store method carrying a `limit = N` default is
 *     extracted, and every op in the dispatch table that forwards `limit` to
 *     one. So the roster of BOUNDED OPS is the plane's own fact, not this
 *     file's list, and an op that grows a cap tomorrow joins the walk with
 *     nobody editing anything here.
 *
 *   WALK 2 — THE CALL SITES, found in `app.html` through that roster. Every
 *     `recR("<bounded op>"` must pass an explicit `limit:`. Anchored on the OP
 *     NAME — a wire string a reword cannot move — for the reason
 *     `identifier-vocabulary.test.mjs` gives: a site discovered through the wire
 *     cannot vanish from the walk the moment somebody rewords the screen.
 *
 * WHAT THIS SUITE DOES NOT MEASURE, stated so nobody trusts it for more. It
 * sweeps ops that carry a NUMERIC cap. It says nothing about ops that bound an
 * answer some other way (a depth walk, a gate, a time window), and it cannot
 * see a surface that renders a count it computed itself from a complete answer.
 *
 * NEGATIVE CONTROL: four arms, each RUN and recorded in the report.
 *   (1) restore each dropped bound in app.html (remove `limit:` from the four
 *       call sites) -> WALK 2 fails naming the file and the figure.
 *   (2) ARM A's own: the planted match sits past the plane's default and the
 *       first page provably does not contain it, so a surface that did not walk
 *       would have promoted; strip the walk from app.html and `op=promote`
 *       appears on the wire.
 *   (3) neuter either walk's matcher -> its REACH assertion fails AS A DELTA,
 *       because the broken-copy count stops exceeding the clean-copy count.
 *   (4) polarity checked on every pin: each is RED for the defect and GREEN for
 *       the fix, never the reverse.
 */
import fs from "fs";
import vm from "vm";
import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0, bad = 0;
const ok = (what, cond) => { n++; if(!cond){ bad++; console.error("  NOT OK:", what); } };

const SRC = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
const STORE = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "utf8");
const QUERY = fs.readFileSync(new URL("../../bio-plane/src/query.mjs", import.meta.url), "utf8");

/* ==========================================================================
 * WALK 1 — THE WIRE. The roster of bounded ops is the PLANE'S fact.
 * ========================================================================== */

/* Store methods that carry a numeric cap. */
const cappedMethods = (text) => {
  const out = new Set();
  const re = /^\s{2}([a-zA-Z][a-zA-Z0-9]*)\(\{[^}]*\blimit\s*=\s*\d+/gm;
  let m; while((m = re.exec(text))) out.add(m[1]);
  return out;
};
/* Dispatch entries that forward `limit` from the wire into one of them. */
const boundedOps = (text, methods) => {
  const out = new Map();
  const re = /^\s+([a-z][a-z0-9]*):\s*\(\)\s*=>\s*this\.([a-zA-Z][a-zA-Z0-9]*)\(\{([\s\S]{0,400}?)\}\),/gm;
  let m; while((m = re.exec(text))){
    const [, op, method, args] = m;
    if(methods.has(method) && /\blimit:/.test(args)) out.set(op, method);
  }
  return out;
};

const METHODS = cappedMethods(STORE);
const OPS = boundedOps(STORE, METHODS);

/* THE EXTRACTION IS GUARDED. A regex that silently yielded nothing would make
   every assertion below vacuous — the failure mode `identifier-vocabulary`
   names, and the one that makes a sweep worthless without anyone noticing. */
ok("WALK 1 GUARD: the store yields a non-trivial roster of capped methods",
   METHODS.size >= 5);
ok("WALK 1 GUARD: and the dispatch maps ops onto them",
   OPS.size >= 3);
ok("WALK 1: the three ops this item names are on the plane's own roster, found through the wire and not listed here",
   OPS.has("readingname") && OPS.has("queue") && OPS.has("tasks"));
/* op=search's cap lives in query.mjs, not as a `limit = N` parameter default,
   so it is confirmed separately and by its own name. */
const LIMIT_DEFAULT = Number((/LIMIT_DEFAULT\s*=\s*(\d+)/.exec(QUERY) || [])[1]);
const LIMIT_MAX = Number((/LIMIT_MAX\s*=\s*(\d+)/.exec(QUERY) || [])[1]);
ok("WALK 1: op=search's default page is the plane's published LIMIT_DEFAULT, read from query.mjs",
   LIMIT_DEFAULT === 50);
ok("WALK 1: and its ceiling is the plane's LIMIT_MAX",
   LIMIT_MAX === 500 && LIMIT_MAX > LIMIT_DEFAULT);

/* REACH, AS A DELTA. Run the same extractor over a copy with the caps removed:
   it must find FEWER. An extractor that matched nothing would report the same
   number both times and this fails. */
const strippedStore = STORE.replace(/\blimit\s*=\s*\d+/g, "limit = null");
ok("WALK 1 REACH IS A DELTA: stripping the caps from a copy of store.mjs shrinks the roster this walk finds",
   cappedMethods(strippedStore).size < METHODS.size && cappedMethods(strippedStore).size >= 0);

/* ==========================================================================
 * WALK 2 — THE CALL SITES in app.html, anchored on the op name.
 * ========================================================================== */

/* Every `recR("op", …)` call for a bounded op, with its argument text.
   BRACE-BALANCED rather than `[^}]*`: the first draft of this walk used the lazy
   character class and stopped at the `}` inside `...(extra||{})`, so it read a
   call's arguments as ending halfway through and reported a bound that was
   there as missing. A matcher that mis-reads nesting is a matcher that will
   eventually mis-read it in the safe direction instead. */
const callSites = (text, ops) => {
  const found = [];
  for(const op of ops){
    const head = new RegExp(`recR\\("${op}"\\s*(,?)`, "g");
    let m; while((m = head.exec(text))){
      if(!m[1]){ found.push({ op, args: "" }); continue; }   // `recR("op")` — no arguments at all
      let i = head.lastIndex, depth = 0, start = -1;
      for(; i < text.length && i < head.lastIndex + 4000; i++){
        const c = text[i];
        if(c === "{"){ if(depth === 0) start = i + 1; depth++; }
        else if(c === "}"){ depth--; if(depth === 0){ found.push({ op, args: text.slice(start, i) }); break; } }
        else if(depth === 0 && c === ")"){ found.push({ op, args: "" }); break; }
      }
    }
  }
  return found;
};
const unbounded = (sites) => sites.filter(s => !/\blimit\s*:/.test(s.args));

/* op=search is walked alongside the dispatch-derived roster, because its cap is
   real and is the one that governs the write. */
const WALKED = [...OPS.keys(), "search"];
const SITES = callSites(SRC, WALKED);
const UNBOUNDED = unbounded(SITES);

ok("WALK 2 GUARD: the walk actually reaches call sites in app.html",
   SITES.length >= 5);
ok("WALK 2: EVERY call to a bounded op passes an explicit limit — no surface inherits a cap it never stated",
   UNBOUNDED.length === 0);
if(UNBOUNDED.length)
  for(const u of UNBOUNDED) console.error(`         civicos-ui/app.html: recR("${u.op}") drops the plane's published bound`);

/* REACH, AS A DELTA — the control this suite would be worthless without.
   Remove the limits from a COPY of app.html and the same matcher must find
   them. If it reports zero both times, it is matching nothing. */
const strippedSrc = SRC.replace(/\blimit\s*:\s*String\([A-Za-z_]+\)\s*,?/g, "")
                       .replace(/\blimit\s*:\s*"[0-9]+"\s*,?/g, "");
const strippedUnbounded = unbounded(callSites(strippedSrc, WALKED));
ok("WALK 2 REACH IS A DELTA: the same matcher over a copy with the limits removed finds STRICTLY MORE unbounded sites",
   strippedUnbounded.length > UNBOUNDED.length);
ok("WALK 2 REACH: and what it then finds includes this item's own four sites, so the walk covers the ground the item claims",
   ["search","readingname","queue","tasks"].every(op => strippedUnbounded.some(s => s.op === op)));

/* ==========================================================================
 * THE RUNTIME. One VM, one wire mock, every op answered in its REAL envelope
 * shape (D-173: a mock that agrees with itself agrees on nothing).
 * ========================================================================== */
const FLAT = new Set(["links","acquire","attest","monitor","archivelookup","linkproject",
                      "governorstate","governorconfig","knock","verify","publishedcase"]);
const CALLS = [];
let ROUTER = () => ({});

const els = new Map();
const el = () => ({ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", innerHTML:"", textContent:"", disabled:false, checked:false, _on:{},
  addEventListener(ev, fn){ this._on[ev] = fn; }, click(){ if(this._on.click) this._on.click(); },
  querySelectorAll(){return[]}, querySelector(){return el()}, insertAdjacentHTML(){}, focus(){} });

const SERVE = new Map();
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp,
  Promise, Uint8Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto,
  btoa: (s) => Buffer.from(s, "binary").toString("base64"), Blob: class {},
  setInterval:()=>1, clearInterval(){}, setTimeout:()=>1, requestAnimationFrame:fn=>fn(),
  document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}},
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{appendChild(){},removeChild(){}} },
  location:{protocol:"https:"}, history:{pushState(){},back(){}},
  localStorage:{getItem:()=>null,setItem(){}}, window:{addEventListener(){},open:()=>null},
  fetch: async (u, init) => {
    const url = new URL(String(u), "https://x.test");
    const q = url.searchParams;
    const op = q.get("op");
    if(op === "capture"){
      const b = SERVE.get(q.get("sha256"));
      if(!b) return { ok:false, json: async () => ({ ok:false, reason:"NOT_FOUND" }) };
      return { ok:true, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) };
    }
    const body = init && init.body ? JSON.parse(init.body) : null;
    CALLS.push({ op, params: Object.fromEntries(q.entries()), body });
    const r = await ROUTER(op, Object.fromEntries(q.entries()), body);
    /* THE ENVELOPE IS THE WIRE'S, PER OP. */
    return { ok:true, json: async () => FLAT.has(op) ? { ok:true, ...r } : { ok:true, result:r } };
  } };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(appScript() + `;globalThis.__U={heldMatch,addGo,PLANE,HELD_PAGE,HELD_PAGES_MAX,
  heldBounded:()=>HELD_BOUNDED, loadResolveCandidates,INTENT_SUBJ,RESOLVE_CAND_LIMIT,
  queueRun,queuePaint,queueBoundHtml,QUEUE_LIMIT,lookupSubject,registryNameBoundHtml,
  finderSubjectsPanelHtml,PROJ_CACHE};`, ctx);
const U = ctx.__U;
U.PLANE.base = "https://plane.test";
U.PLANE.token = "t";
U.PLANE.session = true;
U.PLANE.me = { member:"dana", handle:"dana", session:true, can:{} };

const html = (sel) => (els.get(sel) || {}).innerHTML || "";

/* ==========================================================================
 * ARM A — THE WRITE. The item's centre.
 * ========================================================================== */

const DOC = Buffer.from("%PDF-1.7 sewer fund transfers, as published");
const DOC_SHA = Array.from(new Uint8Array(await webcrypto.subtle.digest("SHA-256", DOC)))
  .map(x=>x.toString(16).padStart(2,"0")).join("");
SERVE.set(DOC_SHA, DOC);
const ADDRESS = "https://data.oaklandca.gov/report.pdf";

/* THE TRAP, ARMED DELIBERATELY. The record holds 700 captures at this address
   and the one that matches sits at index 600 — past the plane's default of 50,
   and past its LIMIT_MAX of 500 as well, so this fixture drives BOTH halves of
   the fix: asking for more than the default, and PAGING past the ceiling. */
const HELD_AT = 600, ROWS_N = 700;
const ROWS = Array.from({length:ROWS_N}, (_,i) => ({
  bundle_id: `INFO-2026-${String(1000+i)}-report`, title: `Report capture ${i}`,
  object_type:"information", current_state:"collected" }));
const HELD_ID = ROWS[HELD_AT].bundle_id;

const planeRouter = async (op, p) => {
  if(op === "search"){
    const q = p.q || "";
    /* The hash arm is answered EMPTY on purpose, to isolate the ADDRESS arm —
       which is the arm the bound governs. That the hash arm still short-circuits
       when it does hit is asserted on its own below, so the isolation is not
       hiding a regression. */
    if(/^hash:sha256:/.test(q)) return { hits:[], total:0, limit:LIMIT_DEFAULT, offset:0 };
    if(/^locator:/.test(q)){
      /* CLAMPED EXACTLY AS THE PLANE CLAMPS, and it publishes the clamp. A mock
         that served whatever it was asked for would let a surface that asked for
         a million look correct. */
      const asked = Number(p.limit) || LIMIT_DEFAULT;
      const lim = Math.max(1, Math.min(LIMIT_MAX, asked));
      const off = Number(p.offset) || 0;
      return { hits: ROWS.slice(off, off+lim), total: ROWS.length, limit: lim, offset: off };
    }
    return { hits:[], total:0, limit:LIMIT_DEFAULT, offset:0 };
  }
  if(op === "projection")
    /* Only the planted row carries a content hash; the rest are captures whose
       projection never recorded one, which is why the walk has to keep going. */
    return p.id === HELD_ID ? { bundle_id:HELD_ID, title:"Report capture 600", content_hash:`sha256:${DOC_SHA}` }
                            : { bundle_id:p.id, title:"a capture with no recorded hash" };
  if(op === "acquire") return { document:{
      file:"snapshots/report.pdf", locator:ADDRESS, authority:"City of Oakland",
      retrieved:"2026-08-05T10:00:00Z",
      capture:{ method:"bio-plane acquire, https fetch, hashed at receipt", grade:"B",
                actor_class:"member", sha256:DOC_SHA, encoding:"binary", bytes:DOC.length,
                content_type:"application/pdf" },
      origin:{ kind:"named_request" }, attestation_attempts:[] } };
  if(op === "attest") return { attempts:[], attestation:null, archive:null };
  if(op === "allocid") return { id:"INFO-2026-9999" };
  if(op === "promote") return { ok:true, bundleId:"INFO-2026-9999-x" };
  return {};
};

const runAdd = async () => {
  CALLS.length = 0;
  U.PROJ_CACHE.clear();
  els.clear();
  ROUTER = planeRouter;
  const set = (sel, v) => { const e = ctx.document.querySelector(sel); e.value = v; return e; };
  set("#a-type","information"); set("#a-title","Sewer fund transfers");
  set("#a-body","What the report shows."); set("#a-loc", ADDRESS); set("#a-auth","City of Oakland");
  await U.addGo();
};

await runAdd();

const promotes = CALLS.filter(c => c.op === "promote");
const searches = CALLS.filter(c => c.op === "search" && /^locator:/.test(c.params.q||""));

/* THE ASSERTION THE ITEM ASKS FOR, AND IT NAMES THE WRITE. */
ok("ARM A · THE WRITE IS PREVENTED: a match past the plane's default produces NO op=promote — the record does not grow a second bundle for one document",
   promotes.length === 0);

/* AND THE PROOF THE TRAP WAS ARMED. Without this the assertion above costs
   nothing: a fixture whose match sat at row 3 would pass it with the bound
   still dropped. This asserts the match is NOT in the page the old code read. */
const oldPage = ROWS.slice(0, LIMIT_DEFAULT);
ok("ARM A · THE DUPLICATE WOULD HAVE BEEN WRITTEN: the match is absent from the page op=search answers at its default, so the unpaged read reported 'not held' and addGo would have promoted",
   oldPage.findIndex(r => r.bundle_id === HELD_ID) === -1 && HELD_AT >= LIMIT_DEFAULT);
ok("ARM A · and absent from the FIRST PAGE the fixed code reads too, so this is a paging fix and not merely a bigger ask",
   HELD_AT >= LIMIT_MAX);
/* An ABSENT offset is offset 0 on the wire, and leaving it off the first call is
   correct rather than a gap — the plane's own default is 0. */
const offsets = searches.map(c => Number(c.params.offset || 0));
ok("ARM A · THE WALK PAGED: op=search was asked more than once for this address, with a moving offset",
   searches.length >= 2 && offsets.some(o => o > 0));
ok("ARM A · it asked for the plane's ceiling rather than accepting the default",
   searches.every(c => Number(c.params.limit) === U.HELD_PAGE) && U.HELD_PAGE === LIMIT_MAX);
ok("ARM A · the offsets advance by what the plane SERVED, so a clamp cannot make the walk skip rows",
   offsets.join(",") === `0,${LIMIT_MAX}`);
ok("ARM A · the member is told it is already held, and sent to the document that holds it",
   /already in the record/i.test(html("#a-err")));
ok("ARM A · no attestation was requested either — nothing on the write path ran for a document the record already has",
   !CALLS.some(c => c.op === "attest"));

/* THE HASH ARM STILL SHORT-CIRCUITS. The isolation above must not have cost the
   cheap key. */
CALLS.length = 0; U.PROJ_CACHE.clear();
ROUTER = async (op, p) => {
  if(op === "search" && /^hash:sha256:/.test(p.q||""))
    return { hits:[{ bundle_id:"INFO-2026-0001-report", title:"the one already held" }],
             total:1, limit:LIMIT_DEFAULT, offset:0 };
  return planeRouter(op, p);
};
const exact = await U.heldMatch(DOC_SHA, ADDRESS, "application/pdf", "report.pdf");
ok("ARM A · the cheap key is unchanged: an exact hash hit answers without walking the address at all",
   exact && exact.identical === true
   && !CALLS.some(c => c.op==="search" && /^locator:/.test(c.params.q||"")));

/* A WALK THAT CANNOT REACH THE END SAYS SO, AND `null` IS NOT THAT ANSWER.
   The plane publishes no total here, so the check is not entitled to call one
   page the whole answer. */
CALLS.length = 0; U.PROJ_CACHE.clear();
ROUTER = async (op, p) => {
  if(op === "search"){
    if(/^hash:sha256:/.test(p.q||"")) return { hits:[], total:0, limit:LIMIT_DEFAULT, offset:0 };
    const lim = Math.max(1, Math.min(LIMIT_MAX, Number(p.limit) || LIMIT_DEFAULT));
    return { hits: ROWS.slice(0, lim) };            // a full page and NO total published
  }
  return planeRouter(op, p);
};
const short = await U.heldMatch("f".repeat(64), ADDRESS, "application/pdf", "report.pdf");
ok("ARM A · NOT FOUND AND NOT HELD ARE DIFFERENT ANSWERS: a walk the plane published no count for reports its bound instead of answering null",
   short && short.bounded === true && short.total === null && short.examined === LIMIT_MAX);

/* AND THE BOUND REACHES THE RECORD, not a progress line the next repaint wipes. */
CALLS.length = 0; U.PROJ_CACHE.clear(); els.clear();
const boundedRouter = ROUTER;
ROUTER = async (op, p, b) => op === "promote" ? { ok:true, bundleId:"INFO-2026-9999-x" } : boundedRouter(op, p, b);
{
  const set = (sel, v) => { const e = ctx.document.querySelector(sel); e.value = v; return e; };
  set("#a-type","information"); set("#a-title","Sewer fund transfers");
  set("#a-body","What the report shows."); set("#a-loc", ADDRESS); set("#a-auth","City of Oakland");
  await U.addGo();
}
const promoted = CALLS.find(c => c.op === "promote");
const bodyMd = promoted && (promoted.body.files||[]).find(f => f.path === "bundle.md");
ok("ARM A · a bounded check that DOES write says so IN THE BUNDLE, through the same mechanism the changed-from note uses",
   !!bodyMd && /NOT established before this was written/.test(bodyMd.text));
ok("ARM A · and it states which bound stopped it rather than implying completeness",
   !!bodyMd && /could not reach the end of that list/.test(bodyMd.text)
   && /nothing here says it is not/.test(bodyMd.text));

/* ==========================================================================
 * ARM A2 — THE CARRY. Found by this item, not brought by it.
 *
 * `CHANGED_FROM` is assigned ONLY inside addGo's `if(loc)` branch, so a typed
 * intake with no address inherited whatever the previous add left there and
 * wrote "The record already holds an earlier capture of this same address
 * (INFO-…)" into a document that has no address at all. A false sentence about
 * the record, in a document's own body, naming an unrelated bundle.
 *
 * TWO ADDS IN SEQUENCE, which is the only way to see it: the first is a CHANGED
 * re-capture that legitimately sets the carry, the second is a typed inquiry.
 * ========================================================================== */
{
  /* (1) A GENUINELY CHANGED RE-CAPTURE, run through the REAL classifier rather
     than short-circuited: the record holds the OLD bytes at this address, the
     source now serves the NEW ones, and `identify`+`compare` return an
     evidentiary change, which is what sets `proceed` and therefore the carry.
     THE FIRST DRAFT OF THIS ARM DID NOT DO THIS — it answered the address search
     with no hits, so `heldMatch` returned null, the carry was never set, and the
     arm passed with the defect PRESENT. It is here because its own negative
     control caught it (CLAUDE.md: an outcome that costs nothing is not
     evidence). */
  const OLD_B = Buffer.from("<html><body><h1>Sewer fund report</h1><p>The sewer fund transferred 1,000,000 dollars in March.</p></body></html>");
  const NEW_B = Buffer.from("<html><body><h1>Sewer fund report</h1><p>The sewer fund transferred 4,500,000 dollars in March and April, plus a further 2,000,000 in May.</p></body></html>");
  const dg = async (b) => Array.from(new Uint8Array(await webcrypto.subtle.digest("SHA-256", b)))
    .map(x=>x.toString(16).padStart(2,"0")).join("");
  const OLD_SHA = await dg(OLD_B), NEW_SHA = await dg(NEW_B);
  SERVE.set(OLD_SHA, OLD_B); SERVE.set(NEW_SHA, NEW_B);
  const HELD2 = "INFO-2026-0500-sewer-report";

  const carryRouter = async (op, p) => {
    if(op === "search"){
      if(/^locator:/.test(p.q||""))
        return { hits:[{ bundle_id:HELD2, title:"Sewer fund report" }], total:1,
                 limit:Number(p.limit)||LIMIT_MAX, offset:Number(p.offset)||0 };
      return { hits:[], total:0, limit:1, offset:0 };
    }
    if(op === "projection")
      return { bundle_id:HELD2, title:"Sewer fund report", content_hash:`sha256:${OLD_SHA}` };
    if(op === "acquire") return { document:{
        file:"snapshots/report.html", locator:ADDRESS, authority:"City of Oakland",
        retrieved:"2026-08-05T10:00:00Z",
        capture:{ method:"bio-plane acquire, https fetch, hashed at receipt", grade:"B",
                  actor_class:"member", sha256:NEW_SHA, encoding:"utf-8", bytes:NEW_B.length,
                  content_type:"text/html" },
        origin:{ kind:"named_request" }, attestation_attempts:[] } };
    if(op === "attest") return { attempts:[], attestation:null, archive:null };
    if(op === "allocid") return { id:"INFO-2026-8888" };
    if(op === "promote") return { ok:true, bundleId:"INFO-2026-8888-x" };
    return {};
  };

  CALLS.length = 0; U.PROJ_CACHE.clear(); els.clear();
  ROUTER = carryRouter;
  const set = (sel, v) => { const e = ctx.document.querySelector(sel); e.value = v; return e; };
  set("#a-type","information"); set("#a-title","Sewer fund transfers");
  set("#a-body","What the report shows."); set("#a-loc", ADDRESS); set("#a-auth","City of Oakland");
  await U.addGo();
  const firstMd = (CALLS.find(c => c.op === "promote")?.body.files||[]).find(f => f.path === "bundle.md");
  /* THE ARM IS ARMED ONLY IF THE CARRY WAS ACTUALLY SET. Asserted, not assumed. */
  ok("ARM A2 · INSTRUMENT: the changed re-capture DID set the carry — the first document says it follows an earlier capture, naming it",
     !!firstMd && /earlier capture of this same address/.test(firstMd.text)
     && firstMd.text.includes(HELD2));

  /* (2) THE TYPED INTAKE — no address at all, written straight after. */
  CALLS.length = 0; U.PROJ_CACHE.clear(); els.clear();
  set("#a-type","inquiry"); set("#a-title","Why were the transfers made");
  set("#a-body","The question."); set("#a-loc",""); set("#a-auth","");
  await U.addGo();
  const typedMd = (CALLS.find(c => c.op === "promote")?.body.files||[]).find(f => f.path === "bundle.md");
  ok("ARM A2 · INSTRUMENT: the typed intake really was written, so this arm reads a document and not an absence",
     !!typedMd && /Why were the transfers made/.test(typedMd.text));
  ok("ARM A2 · THE CARRY IS CLEARED: a typed intake with no address does not inherit the previous add's changed-from sentence",
     !!typedMd && !/earlier capture of this same address/.test(typedMd.text));
  ok("ARM A2 · and it names no bundle it has nothing to do with",
     !!typedMd && !typedMd.text.includes(HELD2));
  ok("ARM A2 · and it carries no bounded-check sentence either, because no address was checked",
     !!typedMd && !/NOT established before this was written/.test(typedMd.text));
}

/* ==========================================================================
 * ARM B — op=readingname's numeric bound, STATED.
 * ========================================================================== */
const CAND_LIMIT = U.RESOLVE_CAND_LIMIT;
const candRouter = (count) => async (op, p) => {
  if(op === "readingname")
    return { ok:true, entity_id:"ENT-1", count,
             documents: Array.from({length:count}, (_,i)=>({
               capture_sha:`${i}`.padStart(64,"0"), bundle_id:`INFO-${i}`, ref:`R${i}`,
               label:"Oakland Police Department", correspondence:"name", grade_if_resolved:"C" })),
             names_unusable:[], detail:"" };
  if(op === "concerns") return { documents:[] };
  return {};
};
const loadCands = async (count) => {
  els.clear(); ROUTER = candRouter(count);
  U.INTENT_SUBJ.entity = { entity_id:"ENT-1", label:"Oakland Police Department" };
  await U.loadResolveCandidates();
  return html("#res-cands");
};

const few = await loadCands(3);
ok("ARM B · THE NUMERIC BOUND IS STATED ON EVERY ANSWER, not only when it bites — a bound a member is told about sometimes is one they cannot rely on",
   new RegExp(`at most ${CAND_LIMIT} documents`).test(few));
ok("ARM B · and it says WHICH HALF it bounds, because op=concerns is uncapped and reporting the bound over the wrong set would be its own overclaim",
   /already resolved to this subject are added separately and are not capped/.test(few));
ok("ARM B · a list under the bound does not claim to be at it",
   !/AT that limit/.test(few));
/* UI-26's four SEMANTIC claims are untouched — this item added a fifth, it did
   not replace the four. Corrected pins, never exempted ones. */
ok("ARM B · UI-26's four semantic claims all survive: normalisation, the alias join, accents unfolded, absence-says-nothing",
   /ignores capitalisation and punctuation/.test(few)
   && /every name this subject is registered under/.test(few)
   && /does <b>not<\/b> ignore accents/.test(few)
   && /neither absence says anything about whether such a document exists/.test(few));

const atCap = await loadCands(CAND_LIMIT);
ok("ARM B · AT the bound, the list says it is at the bound and that there are likely more",
   /AT that limit/.test(atCap) && /there are very likely more it did not ask for/.test(atCap));
ok("ARM B · and the call actually carried the limit onto the wire, so the sentence describes the request that was made",
   CALLS.some(c => c.op === "readingname" && Number(c.params.limit) === CAND_LIMIT));

/* ==========================================================================
 * ARM C — op=queue / op=tasks: `truncated` and `counts`, published and now read.
 * ========================================================================== */
const queueRouter = (truncated, resolvedTotal, resolvedRows) => async (op) => {
  if(op === "queue") return { ok:true, member:"dana", items:[], item_count:2, truncated,
                              classes:["OBLIGATION","FINDING","CONDITION"], classes_deferred:[],
                              ancestor_depth_bound:3,
                              mute:{ personal:true, cases:[], suppressed:[], suppressed_count:0, detail:"" },
                              counts:{ obligation:1, finding:1, condition:0, ungrouped:0,
                                       case_undetermined:0, suppressed:0 } };
  if(op === "tasks") return { ok:true, tasks: Array.from({length:resolvedRows},(_,i)=>({
                                id:`T${i}`, status:"resolved", kind:"authority_undetermined",
                                assignee:"dana", created:"2026-08-01T00:00:00Z", history:[] })),
                              counts:{ open:0, forwarded:0, resolved:resolvedTotal, queued:0 } };
  return {};
};
const paintQueue = async (truncated, resolvedTotal, resolvedRows) => {
  els.clear(); ROUTER = queueRouter(truncated, resolvedTotal, resolvedRows);
  await U.queueRun(["queue","resolutions"]);
  return html("#q");
};

const clean = await paintQueue(false, 2, 2);
ok("ARM C · a complete answer states no bound, so the line means something when it appears",
   !/This is not the whole queue/.test(clean) && !/Not everything that was answered is listed/.test(clean));
ok("ARM C · and both feeds carried their limit onto the wire",
   CALLS.some(c => c.op==="queue" && Number(c.params.limit) === U.QUEUE_LIMIT)
   && CALLS.some(c => c.op==="tasks" && Number(c.params.limit) > 0));

const cut = await paintQueue(true, 731, 200);
ok("ARM C · the plane's own `truncated` is READ and SAID: this screen no longer shows a page as the queue",
   /This is not the whole queue/.test(cut) && /held items back/.test(cut));
ok("ARM C · THE RESOLUTIONS BOUND IS INFERRED FROM THE ARITHMETIC THE PLANE PUBLISHES, and worded as the inference it is — the feed sends no truncation flag",
   /Not everything that was answered is listed/.test(cut) && /counts <b>731<\/b> resolved, and sent 200/.test(cut));
ok("ARM C · the two facts are never collapsed: one quotes the record's flag, the other quotes its count",
   /held items back/.test(cut) && /counts <b>731<\/b>/.test(cut));

/* ==========================================================================
 * ARM D — the FALSEHOOD, and DEC-49 held OPEN.
 * ========================================================================== */
const lookupHtml = async (entities) => {
  els.clear();
  ROUTER = async (op) => op === "entitybyalias" ? { ok:true, entities, count:entities.length } : {};
  ctx.document.querySelector("#subj-q").value = "Sheng Thao";
  await U.lookupSubject();
  return html("#subj-res");
};
const none = await lookupHtml([]);

/* THE FALSEHOOD IS GONE. This is the pin that is RED for the defect. */
ok("ARM D · THE AFFIRMATIVE FALSE STATEMENT IS DELETED: the screen no longer tells a member that a name it did not find has not been entered",
   !/has not been entered yet/.test(none));
/* SWEPT OVER THE CODE, NOT OVER THE COMMENTS — and the distinction is D-160's,
   which UI-27 met in exactly this shape. The two block comments that record WHY
   this sentence was deleted necessarily quote it; a guard that forbade that would
   force the next reader to dig the correction out of git. Comments are stripped
   and the CODE — every string a member can reach — is what is swept. */
const SRC_CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, "");
ok("ARM D · INSTRUMENT: stripping comments leaves the file's actual code, not an empty string",
   SRC_CODE.length > SRC.length * 0.4 && /function lookupSubject/.test(SRC_CODE));
ok("ARM D · and no member-facing string anywhere else in the file says it either",
   !/has not been entered yet/.test(SRC_CODE));
ok("ARM D · INSTRUMENT: the sweep still SEES the sentence when it is in code — it is not passing because it strips everything",
   /has not been entered yet/.test(SRC));
ok("ARM D · what replaces it says what the lookup CANNOT tell you, which is the true fact",
   /cannot tell you it exists/.test(none));
ok("ARM D · the clause that was TRUE is kept rather than thrown out with the false one",
   /registry holds only subjects a member has declared/.test(none));

/* HELD OPEN AS A RELATION. This asserts NO WORDING — only that the two screens
   say the SAME thing. DEC-49 can rule any wording it likes and this pin stays
   green; what it cannot do is let the two drift apart again. */
const finderPanel = U.finderSubjectsPanelHtml({ asked:true, byId:false, entities:[], documents:[] }, []);
const SHARED = U.registryNameBoundHtml();
ok("ARM D · RELATION, NOT A RULING: the subject screen and the finder render the SAME sentence about what a name lookup cannot establish — no particular wording is asserted here",
   none.includes(SHARED) && finderPanel.includes(SHARED) && SHARED.length > 80);
ok("ARM D · and it travels through ONE function, so a DEC-49 ruling moves both screens by editing one place",
   (SRC.match(/registryNameBoundHtml\(\)/g)||[]).length >= 3
   && (SRC.match(/^function registryNameBoundHtml\(/gm)||[]).length === 1);
ok("ARM D · the sentence is not composed twice: the literal appears once in the file",
   (SRC.match(/A subject spelled differently in the record/g)||[]).length === 1);

/* THE FOUR-LEVEL RULE. Absence in the registry is not absence in the record.
   CORRECTED FROM THIS SUITE'S OWN FIRST DRAFT, which asserted `!/does not exist/`
   and went RED against a sentence that is TRUE — "the reverse read that would
   widen it does not exist yet" is a statement about a MISSING CAPABILITY, not
   about the subject. The pin was measuring a substring where the claim is what
   matters, so it is written as the claim: the screen must never say the SUBJECT
   is absent from the record, in any of the three shapes it could take. */
const CLAIMS_SUBJECT_ABSENT =
  /(subject|name)[^.]{0,60}(does not exist|is not in the record|has never been)/i.test(none)
  || /has not been entered/i.test(none)
  || /no such subject exists/i.test(none);
ok("ARM D · absence at one level is not offered as evidence about the next: the screen states what it CANNOT establish and never that the subject is absent",
   /cannot tell you it exists/.test(none) && !CLAIMS_SUBJECT_ABSENT);
ok("ARM D · INSTRUMENT: and that pin bites — the sentence it replaced trips it",
   /has not been entered/i.test("a name that is not here has not been entered yet"));

console.log(`bound-sweep: ${n} assertions${bad?`, ${bad} FAILED`:", all green"} — TWO WALKS whose reach is asserted AS A DELTA (the plane's own capped-op roster read off store.mjs/query.mjs, then every app.html call site anchored on the wire name) · ARM A drives the REAL addGo over a match planted at row ${HELD_AT} of ${ROWS_N} and asserts op=promote NEVER REACHES THE WIRE, with the trap proved armed (the match is absent from the page the unpaged read saw) · a bounded walk reports its bound instead of answering null, and that bound lands IN THE BUNDLE · ARM B states the numeric bound UI-26's four semantic claims never carried · ARM C reads the queue's published truncated flag and the tasks feed's published counts block · ARM D deletes an affirmative falsehood and holds DEC-49 OPEN as a RELATION, asserting no wording`);
if(bad) process.exit(1);
