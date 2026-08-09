/* UI-50 · THE "CHANGED FROM" SENTENCE NAMED THE WRONG VERSION, AND IT IS
 *          WRITTEN INTO THE BUNDLE, WHERE IT IS PERMANENT.
 * ============================================================================
 *
 * WHAT WAS WRONG. `heldMatch` found prior versions of a document with
 * `locator:"<url>"` — a FULL-TEXT query on a text-indexed field. It compiles to
 * a text atom, which creates a rank arm, which orders by RELEVANCE. Every
 * capture at ONE address carries identical url text, so every bm25 score ties
 * and the tiebreak decided which row came back first. `addGo` then took that row
 * and composed *"The record already holds an earlier capture of this same
 * address (INFO-…). The source has since published a changed document, so this
 * is a second capture rather than a repeat of the first."* — INTO THE BUNDLE
 * BODY, where it is permanent, and where a member reading it is entitled to
 * believe the record establishes it.
 *
 * PL-10 MEASURED it over a sixty-version fixture with ground truth computed in
 * JavaScript: the FTS route returned `INFO-2026-0900-agenda`, the OLDEST version
 * at the address, while the correct join returned the fifty-ninth — and ALL 59
 * links were walked, so one lucky answer could not carry it.
 *
 * AND PL-10 ESTABLISHED WHICH OF TWO FAILURE MODES THIS IS RATHER THAN ASSUMING:
 * D-228's quoted-value defect does NOT bite these FTS columns — both spellings
 * matched 63 hits and both returned the oldest. **So this was never a lookup
 * silently matching NOTHING. It was a lookup CONFIDENTLY MATCHING THE WRONG
 * ROW**, which is the worse of the two: a lookup that finds nothing degrades
 * honestly, while one that finds the wrong thing composes a false sentence with
 * full confidence and writes it down.
 *
 * WHAT FIXED IT, AND IT WAS NOT BUILT HERE. PL-10 landed `op=versionchain`
 * (I3 10.2.0): one CTE over `captured_locators` joined to `register`, keyed on
 * `address_norm`, ordered on `first_retrieved` with `capture_sha` as a total
 * tiebreak, no new schema and no new edge. **The join already existed and this
 * item's whole job was to make the writer use it.** The address arm now asks the
 * chain for its `total` and seeks the LAST version at `offset = total - 1`; that
 * version is the predecessor of a capture about to be written, and it is what
 * the sentence names.
 *
 * WHY THE SEEK RATHER THAN `at=<sha>`, since the queue row named `at`. The chain
 * joins `register`, whose row is written by `op=promote`. At the moment this
 * check runs the fresh capture has bytes and a `captured_locators` row and NO
 * register row, so it is not IN the chain and cannot be an anchor — `at` would
 * refuse `VERSION_CHAIN_NO_SUCH_VERSION`. The predecessor of a version that has
 * not been written yet is the last version in the chain. `predecessor: null` at
 * index 0 has its exact analogue and it is pinned below: `total: 0`, an address
 * the record holds no earlier version of, rendering as an honest absence — no
 * sentence at all, not a failure and not a lookup that fell through.
 *
 * ---------------------------------------------------------------- THE SHAPE
 *
 * GROUND TRUTH IS COMPUTED IN THIS FILE, IN JAVASCRIPT, AND NEVER READ BACK OFF
 * THE THING UNDER TEST. The fixture's versions are held in a SHUFFLED array —
 * neither chronological nor reversed — and the expected predecessor is a REDUCE
 * over that array for the maximum `(first_retrieved, capture_sha)`. The chain
 * mock sorts independently, the way the plane's `ORDER BY` does. Neither reads
 * the other. An equality that costs nothing to produce is not evidence.
 *
 * AND ALL 59 LINKS ARE WALKED, which is PL-10's own standard: the whole add is
 * driven sixty times, over the first 1..60 versions chronologically, with the
 * ground truth recomputed for each subset. One lucky answer cannot carry it
 * here either.
 *
 * THE TRAP IS PROVED ARMED BEFORE ANY GREEN IS BELIEVED. For every one of those
 * sixty subsets the suite asserts that the row the OLD route would have taken —
 * the oldest, which is what PL-10 measured coming back — is NOT the correct
 * predecessor. Without that, "names the right one" is an outcome a fixture whose
 * first row happened to be the last version would hand over for free.
 *
 * ------------------------------------------------------- AND THE CLASS SWEEP
 *
 * `heldMatch` was one caller of one lookup. The sweep at the foot of this file
 * asks the general question: **which sites pick ONE ROW out of a RELEVANCE-
 * ORDERED answer and compose a sentence, a field or a link from it?** The roster
 * of relevance-ordered ops is the PLANE'S OWN FACT, read off `store.mjs`'s
 * dispatch and method bodies (an op is relevance-ordered when its method reaches
 * `query.mjs`'s `compile()`, directly or one private hop away), so an op that
 * starts ranking tomorrow joins the walk with nobody editing this file. Every
 * pick is then classified BY HOW THE ROW IS CHOSEN — by an equality the caller
 * already holds, or by POSITION — and the positional ones are the class.
 *
 * A SECOND, SMALLER WALK COVERS THE DESTINATION the first one cannot see: every
 * `recPostR("promote"` site in the surface, enumerated with a floor AND a
 * ceiling, because a bundle sentence is permanent and a fourth writer must not
 * be able to land silently.
 *
 * WHAT THE SWEEP CANNOT SEE, stated plainly because REC-67 exists for a matcher
 * trusted past its reach:
 *   - It cannot follow a row through MODULE STATE. A function that stores an
 *     answer and another that subscripts it later are two functions to this walk.
 *   - It cannot follow a row more than ZERO hops: the pick must be in the same
 *     named function as the read.
 *   - It only sees `recR(`. A relevance-ordered answer reached through another
 *     transport is invisible to it (`check-refusal-codes` arm A is what closes
 *     that hole, by asserting the transports are reached from nine named
 *     declarations and nowhere else).
 *   - Its roster is methods reaching `compile()` in their own body or one
 *     private hop. A method that ranks two hops down, or ranks with hand-written
 *     SQL, is outside it — and the UNJUDGED bucket is PRINTED rather than
 *     suppressed so that limit is visible rather than implied.
 *   - It flags the PICK, not the destination. Whether the picked row reaches a
 *     bundle, a screen or nothing is the second walk's question, and the second
 *     walk is an enumeration rather than a dataflow.
 *
 * NEGATIVE CONTROL: seven arms, RUN 2026-08-08 by the UI-50 worker through
 * `test/version-predecessor.control.mjs`, each arm ARMED ALONE with every other
 * defence held open, declared before arming, every restore verified by sha256
 * AND by `cmp` against a pristine pre-arm copy kept in `.ui50-harness/` inside
 * the worktree. Results are recorded in that driver's header, including the one
 * that came back other than declared.
 *   (1) RESTORE THE FTS ROUTE — the chain's answer discarded and the pre-UI-50
 *       compare-and-return loop put back on the search rows -> FAILS naming the
 *       predecessor it should have picked AND the one it took.
 *   (2) THE WRONG END — seek `offset 0` instead of `offset total-1`, which is
 *       PL-10's measured defect in one token -> FAILS naming both ids.
 *   (3) A CHAIN OF ONE, and a chain of none, must render an honest absence
 *       rather than a failure — asserted in-suite and armed by making the
 *       zero-version case compose a sentence anyway.
 *   (4) OVER-STRICTNESS: an equivalent spelling of the pick must stay GREEN, so
 *       this suite pins the PROPERTY and not the tokens.
 *   (5) NEUTER THE SWEEP's walk -> its REACH fails AS A DELTA with the corpus
 *       printed, because a walk over nothing reports its verdict triumphantly.
 *   (6) VACUITY: make the fixture's search order agree with the chain order, so
 *       the old route would have been right by luck -> the trap-armed assertion
 *       FAILS.
 *   (7) BASELINE: no patch at all, and the whole suite green — the row without
 *       which six arms failing for the wrong reason is indistinguishable from
 *       six arms working.
 */
import { appScript } from "./extract.mjs";
import fs from "fs";
import path from "path";
import vm from "vm";
import { webcrypto } from "crypto";

let n = 0;
const ok = (label, cond) => { if (!cond) { console.error("FAIL " + label); process.exit(1); } n++; };

const dg = async (b) => Array.from(new Uint8Array(await webcrypto.subtle.digest("SHA-256", b)))
  .map(x => x.toString(16).padStart(2, "0")).join("");

/* ==========================================================================
 * THE RUNTIME. One VM, one wire mock, every op answered in its REAL envelope
 * shape (D-173: a mock that agrees with itself agrees on nothing).
 * ========================================================================== */
const FLAT = new Set(["links","acquire","attest","monitor","archivelookup","linkproject",
                      "governorstate","governorconfig","knock","verify","publishedcase"]);
const CALLS = [];
let ROUTER = () => ({});
const SERVE = new Map();
const els = new Map();
const el = () => ({ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", innerHTML:"", textContent:"", disabled:false, checked:false, _on:{},
  addEventListener(ev, fn){ this._on[ev] = fn; }, click(){ if(this._on.click) this._on.click(); },
  querySelectorAll(){return[]}, querySelector(){return el()}, insertAdjacentHTML(){}, focus(){} });

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
    const url = new URL(String(u), "https://plane.test");
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
    return { ok:true, json: async () => FLAT.has(op) ? { ok:true, ...r } : { ok:true, result:r } };
  } };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(appScript() + `;globalThis.__V={heldMatch,addGo,PLANE,PROJ_CACHE,HELD_CHAIN_ASK};`, ctx);
const V = ctx.__V;
V.PLANE.base = "https://plane.test";
V.PLANE.token = "t";
V.PLANE.session = true;
V.PLANE.me = { member:"dana", handle:"dana", session:true, can:{} };
const html = (sel) => (els.get(sel) || {}).innerHTML || "";

/* ==========================================================================
 * THE FIXTURE — sixty versions at one address, held SHUFFLED.
 * ========================================================================== */
const ADDRESS = "https://city.example/council/agenda";
const N = 60;
/* Distinct bytes per version, and evidentially distinct: the figures move, which
   is what makes `compare` report a change rather than page state. */
const bodyFor = (k) =>
  `<html><body><h1>Council agenda</h1><p>The sewer fund transferred ${1000 + k * 137} dollars `
  + `across ${k + 1} line items, in revision ${k}.</p></body></html>`;
const isoFor = (k) => new Date(Date.UTC(2026, 0, 1 + k, 9, 0, 0)).toISOString().replace(/\.\d+Z$/, "Z");

const BUILT = [];
for(let k = 0; k < N; k++){
  const bytes = Buffer.from(bodyFor(k));
  const sha = await dg(bytes);
  SERVE.set(sha, bytes);
  BUILT.push({ seq:k, capture_sha:sha, bundle_id:`INFO-2026-0${900 + k}-agenda`,
               first_retrieved: isoFor(k), last_retrieved: isoFor(k),
               observations:1, sightings:1, via:["direct"], address:ADDRESS });
}
/* THE STORAGE ORDER IS SHUFFLED — deterministically, by capture hash, which is
   uncorrelated with the chronology. A fixture stored in the answer's own order
   would let a walk that never sorted anything look correct. */
const VERSIONS = [...BUILT].sort((a, b) => (a.capture_sha < b.capture_sha ? -1 : 1));

const FRESH_B = Buffer.from(
  `<html><body><h1>Council agenda</h1><p>The sewer fund transferred 4,500,000 dollars across 31 `
  + `line items, plus a further 2,000,000 in May, in the published revision.</p></body></html>`);
const FRESH_SHA = await dg(FRESH_B);
SERVE.set(FRESH_SHA, FRESH_B);

/* GROUND TRUTH, COMPUTED HERE AND NOWHERE ELSE. A reduce for the maximum
   `(first_retrieved, capture_sha)` over the shuffled subset — the same total
   order the plane's `ORDER BY first_retrieved, capture_sha` defines, expressed
   independently rather than read back from the answer. */
const predecessorOf = (subset) => subset.reduce((best, v) =>
  !best ? v
  : (v.first_retrieved > best.first_retrieved
     || (v.first_retrieved === best.first_retrieved && v.capture_sha > best.capture_sha)) ? v : best,
  null);
/* THE ROW THE OLD ROUTE TOOK, computed the same independent way: PL-10 measured
   the FTS answer coming back OLDEST FIRST, so this is the minimum. */
const oldestOf = (subset) => subset.reduce((worst, v) =>
  !worst ? v
  : (v.first_retrieved < worst.first_retrieved
     || (v.first_retrieved === worst.first_retrieved && v.capture_sha < worst.capture_sha)) ? v : worst,
  null);

ok(`INSTRUMENT: the fixture holds ${N} versions, all distinct, and its storage order is neither chronological nor reversed`,
   VERSIONS.length === N
   && new Set(VERSIONS.map(v => v.capture_sha)).size === N
   && VERSIONS.some((v, i) => i > 0 && v.seq < VERSIONS[i - 1].seq)
   && VERSIONS.some((v, i) => i > 0 && v.seq > VERSIONS[i - 1].seq));
ok("INSTRUMENT: the fresh capture's bytes are held by no version, so this is a new version and not a re-capture",
   !VERSIONS.some(v => v.capture_sha === FRESH_SHA));
ok("INSTRUMENT: ground truth and the row the old route took DISAGREE over the whole fixture — the trap is armed before anything is driven",
   predecessorOf(VERSIONS).bundle_id !== oldestOf(VERSIONS).bundle_id
   && predecessorOf(VERSIONS).seq === N - 1 && oldestOf(VERSIONS).seq === 0);

/* ==========================================================================
 * THE WIRE. `ACTIVE` is the subset of versions the record holds for this run.
 * ========================================================================== */
let ACTIVE = [];
let CHAIN_MODE = "ok";              /* "ok" | "refuse" | "silent" */
let SEARCH_ORDER = "oldest-first";  /* the measured FTS behaviour; "chain-order" is arm 6 */
let FRESH = FRESH_SHA;

const chainAnswerFor = (p) => {
  /* THE PLANE'S OWN ORDER, expressed here as the plane expresses it and NOT by
     calling `predecessorOf` — the two readers must not share a sort. */
  const ordered = [...ACTIVE].sort((a, b) =>
    a.first_retrieved < b.first_retrieved ? -1
    : a.first_retrieved > b.first_retrieved ? 1
    : a.capture_sha < b.capture_sha ? -1 : 1);
  const lim = Math.max(1, Math.min(1000, Math.floor(Number(p.limit) || 200)));
  const off = Math.max(0, Math.floor(Number(p.offset) || 0));
  const page = ordered.slice(off, off + lim);
  return { ok:true, address_norm:ADDRESS, documents: ordered.length ? 1 : 0,
           versions: page, count: page.length, total: ordered.length,
           limit: lim, offset: off, truncated: off + page.length < ordered.length,
           at:null, at_index:null, predecessor:null };
};

const ROUTES = async (op, p) => {
  if(op === "versionchain"){
    if(CHAIN_MODE === "refuse")
      return { ok:false, reason:"VERSION_CHAIN_NO_ADDRESS", check:"C-30.1",
               translation:"the chain was asked for no address", detail:"no address" };
    if(CHAIN_MODE === "silent") return { ok:true, address_norm:ADDRESS, versions:[] };  // no total, no limit
    return chainAnswerFor(p);
  }
  if(op === "search"){
    const q = p.q || "";
    if(/^hash:sha256:/.test(q)){
      const want = q.replace(/^hash:sha256:/, "");
      const hit = ACTIVE.find(v => v.capture_sha === want);
      return { hits: hit ? [{ bundle_id:hit.bundle_id, title:"Council agenda" }] : [],
               total: hit ? 1 : 0, limit:1, offset:0 };
    }
    if(/^locator:/.test(q)){
      /* THE MEASURED FTS BEHAVIOUR: identical url text, tied bm25, and the
         OLDEST came back first (PL-10). Serving it any other way would hide the
         defect this suite exists to keep out. */
      const rows = SEARCH_ORDER === "chain-order"
        ? [...ACTIVE].sort((a, b) => a.first_retrieved < b.first_retrieved ? -1 : 1)
        : [...ACTIVE].sort((a, b) => a.first_retrieved < b.first_retrieved ? -1 : 1).reverse().reverse();
      const lim = Math.max(1, Math.min(500, Number(p.limit) || 50));
      const off = Number(p.offset) || 0;
      const page = rows.slice(off, off + lim);
      return { hits: page.map(v => ({ bundle_id:v.bundle_id, title:"Council agenda" })),
               total: rows.length, limit: lim, offset: off };
    }
    return { hits:[], total:0, limit:50, offset:0 };
  }
  if(op === "projection"){
    const v = ACTIVE.find(x => x.bundle_id === p.id);
    return v ? { bundle_id:v.bundle_id, title:"Council agenda", content_hash:`sha256:${v.capture_sha}` }
             : { bundle_id:p.id, title:"Council agenda" };
  }
  if(op === "acquire") return { document:{
      file:"snapshots/agenda.html", locator:ADDRESS, authority:"City of Oakland",
      retrieved:"2026-08-08T10:00:00Z",
      capture:{ method:"bio-plane acquire, https fetch, hashed at receipt", grade:"B",
                actor_class:"member", sha256:FRESH, encoding:"utf-8", bytes:FRESH_B.length,
                content_type:"text/html" },
      origin:{ kind:"named_request" }, attestation_attempts:[] } };
  if(op === "attest") return { attempts:[], attestation:null, archive:null };
  if(op === "allocid") return { id:"INFO-2026-9999" };
  if(op === "promote") return { ok:true, bundleId:"INFO-2026-9999-x" };
  return {};
};
ROUTER = ROUTES;

const set = (sel, v) => { const e = ctx.document.querySelector(sel); e.value = v; return e; };
const runAdd = async (subset, opts = {}) => {
  ACTIVE = subset;
  CHAIN_MODE = opts.chain || "ok";
  SEARCH_ORDER = opts.search || "oldest-first";
  FRESH = opts.fresh || FRESH_SHA;
  CALLS.length = 0; V.PROJ_CACHE.clear(); els.clear();
  set("#a-type","information"); set("#a-title","Council agenda");
  set("#a-body","What the agenda says about the fund."); set("#a-loc", ADDRESS);
  set("#a-auth","City of Oakland");
  await V.addGo();
  const promote = CALLS.find(c => c.op === "promote");
  const md = promote && (promote.body.files || []).find(f => f.path === "bundle.md");
  return { promote, text: md ? md.text : null, err: html("#a-err"),
           chainCalls: CALLS.filter(c => c.op === "versionchain") };
};

/* ==========================================================================
 * THE WALK — ALL SIXTY, so one lucky answer cannot carry it.
 * ========================================================================== */
const CHANGED_FROM_RE = /earlier capture of this same address \(([^)]+)\)/;
let walked = 0, firstWrong = null, trapUnarmed = null;
for(let k = 1; k <= N; k++){
  const subset = VERSIONS.filter(v => v.seq < k);
  const truth = predecessorOf(subset);
  const oldest = oldestOf(subset);
  /* THE TRAP, PER SUBSET. For k === 1 the two coincide — a chain of one has one
     answer and both routes must give it — so the arming claim is made only where
     it is meaningful, and the count of armed subsets is asserted below. */
  if(k > 1 && truth.bundle_id === oldest.bundle_id) trapUnarmed = k;
  const r = await runAdd(subset);
  const named = (CHANGED_FROM_RE.exec(r.text || "") || [])[1] || null;
  walked++;
  if(named !== truth.bundle_id && !firstWrong)
    firstWrong = { k, want: truth.bundle_id, got: named, oldest: oldest.bundle_id };
}
ok(`THE TRAP IS ARMED: over ${N - 1} of the ${N} subsets the OLDEST version at the address is NOT the predecessor, so naming the right one cannot be luck`,
   trapUnarmed === null);
ok(`ALL ${N} LINKS WALKED: the add ran once per subset and each produced a bundle`, walked === N);
ok(firstWrong
     ? `THE SENTENCE NAMES THE IMMEDIATELY PREVIOUS VERSION — at ${firstWrong.k} version(s) it should have named ${firstWrong.want} and it named ${firstWrong.got} (the oldest at this address is ${firstWrong.oldest})`
     : `THE SENTENCE NAMES THE IMMEDIATELY PREVIOUS VERSION, over all ${N} subsets, against ground truth computed in this file and never read back from the op`,
   firstWrong === null);

/* THE SENTENCE IS IN THE BUNDLE, WHICH IS WHY THIS IS NOT A DISPLAY BUG. */
{
  const r = await runAdd(VERSIONS);
  const truth = predecessorOf(VERSIONS);
  ok("IT IS WRITTEN INTO THE BUNDLE: the changed-from sentence travels in bundle.md, in the promote body, where it is permanent",
     !!r.promote && /earlier capture of this same address/.test(r.text || "")
     && (r.text || "").includes(truth.bundle_id));
  ok("and it names NO other version — one predecessor, not a list the reader has to choose from",
     VERSIONS.filter(v => v.bundle_id !== truth.bundle_id)
             .every(v => !(r.text || "").includes(v.bundle_id)));
  ok(`and it does NOT name the oldest, which is the row PL-10 measured the FTS route returning (${oldestOf(VERSIONS).bundle_id})`,
     !(r.text || "").includes(oldestOf(VERSIONS).bundle_id));
  /* THE SEEK ITSELF, off the wire: the chain was asked for its total and then
     for the LAST row, with the ask STATED rather than inherited. */
  const offsets = r.chainCalls.map(c => Number(c.params.offset));
  ok(`THE PREDECESSOR IS SOUGHT AT THE END OF THE CHAIN: op=versionchain was asked at offset 0 and then at offset ${N - 1}, which is total-1`,
     offsets.length === 2 && offsets[0] === 0 && offsets[1] === N - 1);
  ok("and every ask states its bound rather than inheriting the plane's default",
     r.chainCalls.every(c => String(Number(c.params.limit)) === String(V.HELD_CHAIN_ASK)));
  ok("the address goes to the plane RAW, so the plane's own normaliser decides what matches — the surface holds no second copy of it",
     r.chainCalls.every(c => c.params.address === ADDRESS));
  ok("NO `locator:` FULL-TEXT QUERY RAN AT ALL on the path that composed the sentence: the relevance route is not consulted where the chain answers",
     !CALLS.some(c => c.op === "search" && /^locator:/.test(c.params.q || "")));
}

/* ==========================================================================
 * HONEST ABSENCE — `predecessor: null`'s analogue, and a chain of one.
 * ========================================================================== */
{
  const r = await runAdd([]);
  ok("AN ADDRESS WITH NO EARLIER VERSION IS AN HONEST ABSENCE: the bundle is written and carries NO changed-from sentence",
     !!r.promote && !/earlier capture of this same address/.test(r.text || ""));
  ok("and it is not a failure either — nothing says the check could not be completed",
     !/NOT established before this was written/.test(r.text || ""));
  ok("and the member is not told the document is already held",
     !/already in the record/i.test(r.err));
}
{
  const one = VERSIONS.filter(v => v.seq === 0);
  const r = await runAdd(one);
  ok("A CHAIN OF ONE IS A CHAIN: the single version at the address is named as the predecessor rather than treated as a degenerate case",
     !!r.promote && (r.text || "").includes(one[0].bundle_id));
}

/* ==========================================================================
 * THE OTHER TWO ANSWERS heldMatch OWES, and neither may be a wrong row.
 * ========================================================================== */
{
  /* The record already holds these exact bytes as the newest version. */
  const truth = predecessorOf(VERSIONS);
  const r = await runAdd(VERSIONS, { fresh: truth.capture_sha });
  ok("IDENTICAL BYTES AT THE ADDRESS: nothing is written and the member is sent to the document that holds them",
     !r.promote && /already in the record/i.test(r.err));
}
{
  /* The chain cannot be established. The record plainly holds captures here, so
     "not found" is not "not held", and the surface says so rather than naming a
     predecessor it did not establish. */
  const r = await runAdd(VERSIONS, { chain:"refuse" });
  ok("AN UNESTABLISHED CHAIN DEGRADES HONESTLY: the bundle says the check was not completed",
     !!r.promote && /NOT established before this was written/.test(r.text || ""));
  ok("and it names NO predecessor at all — an absence, never a guess",
     !/earlier capture of this same address/.test(r.text || "")
     && VERSIONS.every(v => !(r.text || "").includes(v.bundle_id)));
  ok("and it states what it read against what the record counts, rather than implying completeness",
     /captures the record counts there/.test(r.text || ""));
}
{
  /* An answer that publishes no bound and no total is not an answer this may act
     on: REC-57's discipline, at a site that decides a write. */
  const r = await runAdd(VERSIONS, { chain:"silent" });
  ok("A CHAIN ANSWER PUBLISHING NEITHER A TOTAL NOR THE BOUND IT APPLIED IS NOT ACTED ON",
     !/earlier capture of this same address/.test(r.text || ""));
}
{
  /* The identity backstop still catches a bundle the chain cannot see — a
     register row with no `captured_locators` row, which is every capture from
     before D-58 filed the address unconditionally. */
  const truth = predecessorOf(VERSIONS);
  const r = await runAdd(VERSIONS, { chain:"refuse", fresh: truth.capture_sha });
  ok("THE IDENTITY BACKSTOP SURVIVES: with no chain at all, bytes the record already holds are still found, by hash equality and not by order",
     !r.promote && /already in the record/i.test(r.err));
}

/* ==========================================================================
 * THE CLASS SWEEP — WHICH SITES PICK ONE ROW OUT OF A RELEVANCE-ORDERED ANSWER
 * ========================================================================== */
const PLANE_SRC = new URL("../../bio-plane/src/", import.meta.url);
const STORE = fs.readFileSync(new URL("store.mjs", PLANE_SRC), "utf8");
const QUERY = fs.readFileSync(new URL("query.mjs", PLANE_SRC), "utf8");

const methodBodies = (text) => {
  const heads = []; const re = /^ {2}(?:static\s+)?([a-zA-Z#][a-zA-Z0-9]*)\s*\(/gm;
  let m; while((m = re.exec(text))) heads.push({ name:m[1], at:m.index });
  const out = new Map();
  heads.forEach((h, i) => { if(!out.has(h.name))
    out.set(h.name, text.slice(h.at, i + 1 < heads.length ? heads[i + 1].at : text.length)); });
  return out;
};
/* EVERY dispatch entry, not only the ones forwarding a limit. */
const dispatchOps = (text) => {
  const out = new Map();
  const re = /^\s+([a-z][a-z0-9]*):\s*\(\)\s*=>\s*this\.([a-zA-Z][a-zA-Z0-9]*)\(/gm;
  let m; while((m = re.exec(text))) if(!out.has(m[1])) out.set(m[1], m[2]);
  return out;
};
const BODIES = methodBodies(STORE);
const DISPATCH = dispatchOps(STORE);
/* RELEVANCE-ORDERED = the method reaches `compile()`, in its own body or one
   private hop away. `compile()` is `query.mjs`'s, and query.mjs says in its own
   words that the default order is bm25 — asserted below rather than assumed. */
const reachesCompile = (name, depth = 0) => {
  const b = BODIES.get(name) || "";
  if(/\bcompile\s*\(/.test(b)) return true;
  if(depth >= 1) return false;
  for(const m of b.matchAll(/this\.(#?[a-zA-Z][a-zA-Z0-9]*)\s*\(/g))
    if(m[1] !== name && BODIES.has(m[1]) && reachesCompile(m[1], depth + 1)) return true;
  return false;
};
const RANKED = new Map();
const UNJUDGED_OPS = [];
for(const [op, meth] of DISPATCH){
  if(!BODIES.has(meth)){ UNJUDGED_OPS.push(op); continue; }
  if(reachesCompile(meth)) RANKED.set(op, meth);
}
ok("SWEEP INSTRUMENT: the relevance order is the PLANE'S OWN statement, read out of query.mjs rather than assumed here",
   /Default order is relevance, which is bm25/.test(QUERY) && /bm25\(bundles_fts\)/.test(QUERY));
ok(`SWEEP INSTRUMENT: the dispatch yields a real roster — ${DISPATCH.size} ops mapped onto ${BODIES.size} method segments, ${RANKED.size} of them relevance-ordered`,
   DISPATCH.size > 100 && BODIES.size > 200 && RANKED.size >= 1);
ok("SWEEP INSTRUMENT: and op=search is in it, found through the plane's source and not named into it here",
   RANKED.has("search"));

/* ---- the surface corpus ---- */
const UI_DIR = new URL("../", import.meta.url);
const UI_FILES = fs.readdirSync(UI_DIR)
  .filter(f => /\.(html|mjs|js)$/.test(f))
  .map(f => ({ file:f, text: fs.readFileSync(new URL(f, UI_DIR), "utf8") }));
const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const functionsOf = (code) => {
  const out = [];
  const re = /^(?:async\s+)?function\s+([A-Za-z0-9_$]+)/gm;
  let m; while((m = re.exec(code))) out.push({ name:m[1], at:m.index });
  return out.map((f, i) => ({ name:f.name,
    body: code.slice(f.at, i + 1 < out.length ? out[i + 1].at : code.length) }));
};
const callEnd = (body, from) => {
  let i = from, depth = 0;
  for(; i < body.length; i++){
    const c = body[i];
    if(c === "(") depth++; else if(c === ")"){ if(depth === 0) return i; depth--; }
  }
  return body.length;
};
const assignedNames = (body, at) => {
  const names = new Set();
  const re = /\b([A-Za-z_$][\w$]*)\s*=(?!=|>)\s*/g;
  let m; while((m = re.exec(body))){
    const from = re.lastIndex;
    if(from > at) break;
    let i = from, depth = 0;
    for(; i < body.length; i++){
      const c = body[i];
      if(c === "(" || c === "[" || c === "{") depth++;
      else if(c === ")" || c === "]" || c === "}"){ if(depth === 0) break; depth--; }
      else if(c === ";" && depth === 0) break;
    }
    if(at >= from && at < i) names.add(m[1]);
  }
  return names;
};
/* THE NAME CLOSURE, AND IT IS WHY THIS WALK CAN SEE THE REAL SITE AT ALL.
   The first draft stopped at the names the call is ASSIGNED to, and it read
   `heldMatch` — the function this whole item is about — as SET-RENDERED,
   because the answer is bound to `r` inside a helper, `hits` is read off it, and
   the rows are `push`ed into a third array which is what the loop walks. A walk
   that cannot see the site it was built after is a walk reporting a green it did
   not earn. So names are closed over three moves, INSIDE THE ONE FUNCTION and no
   further: a declaration whose right-hand side mentions a known name, a `for
   (const x of <known>)` row variable, and `<array>.push(<known>)`. It is
   deliberately not dataflow — it is three shapes this surface actually writes,
   and the delta control below re-plants the pre-UI-50 loop at its REAL site and
   requires this walk to find it. */
const nameClosure = (body, seed) => {
  const names = new Set(seed);
  for(let pass = 0; pass < 6; pass++){
    const before = names.size;
    for(const m of body.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=([^;\n]*)/g))
      if([...names].some(nm => new RegExp(`\\b${nm}\\b`).test(m[2]))) names.add(m[1]);
    for(const m of body.matchAll(/for\s*\(\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s+of\s+([^)]*)\)/g))
      if([...names].some(nm => new RegExp(`\\b${nm}\\b`).test(m[2]))) names.add(m[1]);
    for(const m of body.matchAll(/\b([A-Za-z_$][\w$]*)\.push\s*\(\s*([A-Za-z_$][\w$]*)/g))
      if(names.has(m[2])) names.add(m[1]);
    if(names.size === before) break;
  }
  return [...names];
};

/* AN UNGUARDED RETURN INSIDE A LOOP OVER THE ANSWER IS A POSITIONAL PICK, and
   this is the distinction the whole sweep turns on. A `return` that runs
   whatever the row is takes the row the answer happened to put first. A `return`
   reached only under an `if` whose condition COMPARES something is a pick by
   IDENTITY, and identity has no order to get wrong. Measured both ways below
   against the pre-UI-50 source.

   THE GUARD IS FOUND BY STATEMENT, NOT BY BRACE DEPTH, and the first draft was
   wrong in the ALARMING direction because of it: it counted a `return` at the
   loop body's own depth as unguarded, so `if(heldSha === sha256) return {…};` —
   a braceless guarded return, which is the shape the FIXED code uses — read as
   the defect. It would have failed the tree it was written to pass. Each
   `return` now carries the condition that reaches it: the inline `if(…)` on its
   own statement, or the nearest enclosing block opened by one. */
const scanReturns = (inner) => {
  const out = [], stack = [];
  const IFRE = /^\s*(?:\}\s*)?(?:else\s+)?if\s*\(([\s\S]*)\)\s*$/;
  const prefixAt = (at) => { let j = at - 1;
    for(; j >= 0; j--){ const c = inner[j]; if(c === ";" || c === "{" || c === "}") break; }
    return inner.slice(j + 1, at); };
  for(let j = 0; j < inner.length; j++){
    if(inner[j] === "{") stack.push(prefixAt(j));
    else if(inner[j] === "}") stack.pop();
    else if(inner.startsWith("return", j) && /[^\w$]/.test(inner[j - 1] || " ")
            && /[^\w$]/.test(inner[j + 6] || " ")){
      let g = IFRE.exec(prefixAt(j));
      if(!g) for(let s = stack.length - 1; s >= 0 && !g; s--) g = IFRE.exec(stack[s]);
      out.push({ guard: g ? g[1] : null });
      j += 5;
    }
  }
  return out;
};
const loopPicks = (body, names) => {
  const out = [];
  const re = /\bfor\s*\(\s*(?:const|let|var)\s+[A-Za-z_$][\w$]*\s+of\s+([^)]*)\)\s*\{/g;
  let m; while((m = re.exec(body))){
    const over = m[1];
    if(![...names].some(nm => new RegExp(`\\b${nm}\\b`).test(over))) continue;
    let i = re.lastIndex - 1, depth = 0, end = body.length;
    for(let j = i; j < body.length; j++){
      if(body[j] === "{") depth++;
      else if(body[j] === "}"){ depth--; if(depth === 0){ end = j; break; } }
    }
    const inner = body.slice(i + 1, end);
    const rets = scanReturns(inner);
    if(!rets.length) continue;
    const unguarded = rets.some(r => r.guard === null);
    const guarded = rets.some(r => r.guard !== null);
    const byEquality = rets.every(r => r.guard !== null && /[!=]==?/.test(r.guard));
    out.push({ kind:"loop", unguarded, guarded, byEquality });
  }
  return out;
};
/* THE NAME ANCHOR IS `(?<![\w$])` AND NOT `\b`, WHICH IS REC-67's TOKEN EXACTLY
   — but the choice it makes here is the OPPOSITE of REC-67's and it is deliberate
   rather than inherited. REC-67 dropped `\b` because it matches between a DOT and
   a letter, so `x.get("op")` read as a call to the plane and the walk INVENTED a
   consumer. Here the names being anchored are the ANSWER'S OWN FIELD NAMES —
   `hits`, `rows` — and `(await search(…)).hits[0]` is the answer being
   subscripted whatever object the dot hangs off. So a dotted property of the same
   name is admitted ON PURPOSE. It can over-report: an unrelated `.hits[0]` inside
   the same function would be counted. That direction ALARMS rather than HIDES,
   which is the safe one and the one REC-67 says to prefer; the licensed table
   below is what keeps an over-report from becoming noise, and every member of it
   is named with the reason it is licensed. */
const POSITIONAL_RE = (nm) => new RegExp(
  `(?<![\\w$])${nm}(?:\\.[A-Za-z_$][\\w$]*|\\s*\\|\\|\\s*\\[\\])*\\s*\\[\\s*0\\s*\\]`
  + `|(?<![\\w$])${nm}[\\w$.]*\\.shift\\s*\\(`
  /* AND THE UNNAMED FORM: `((r && r.hits) || [])[0]`, where the answer is
     subscripted inside a parenthesised expression and never bound at all. The
     first draft missed it, which is a miss in the HIDING direction, so it is
     closed rather than written into the limits list. */
  + `|\\([^;{}]*(?<![\\w$])${nm}(?![\\w$])[^;{}]*\\)\\s*\\[\\s*0\\s*\\]`);
const FIND_RE = (nm) => new RegExp(`(?<![\\w$])${nm}[\\w$.]*\\.find\\s*\\(`);

/* THE KINDS ARE COLLECTED, NEVER SHORT-CIRCUITED. A site that picks a row two
   different ways must report both — the first draft returned on the first kind
   it found, and `heldMatch` (which does a positional subscript on its hash arm
   AND walks a loop on its address arm) reported only the first, so re-planting
   the pre-UI-50 unguarded return changed NOTHING it printed and the delta
   collapsed to zero. A control that cannot move is not a control. */
const RISKY = new Set(["positional", "loop-unguarded"]);
const sweep = (files, rankedOps) => {
  const rows = [];
  let functions = 0, sites = 0;
  for(const { file, text } of files){
    const code = stripComments(text);
    for(const f of functionsOf(code)){
      functions++;
      for(const op of rankedOps){
        const re = new RegExp(`recR\\("${op}"`, "g");
        let m; while((m = re.exec(f.body))){
          sites++;
          const end = callEnd(f.body, m.index + m[0].length);
          const rest = f.body.slice(end + 1).replace(/^[)\s]*/, "");
          const names = nameClosure(f.body, assignedNames(f.body, m.index));
          const head = text.search(new RegExp(`^(?:async\\s+)?function\\s+${f.name}\\b`, "m"));
          const at = text.indexOf(`recR("${op}"`, head < 0 ? 0 : head);
          const line = at < 0 ? null : text.slice(0, at).split("\n").length;
          const kinds = new Set();
          if(/^\.(?!then\b|catch\b)/.test(rest) && /^\.[\w$.]*\[\s*0\s*\]/.test(rest)) kinds.add("positional");
          if(!names.length && !kinds.size) kinds.add("no-name");
          if(names.some(nm => POSITIONAL_RE(nm).test(f.body))) kinds.add("positional");
          if(names.some(nm => FIND_RE(nm).test(f.body))) kinds.add("find-predicate");
          for(const l of names.flatMap(nm => loopPicks(f.body, [nm]))){
            if(l.unguarded) kinds.add("loop-unguarded");
            else if(l.guarded && l.byEquality) kinds.add("loop-by-equality");
            else if(l.guarded) kinds.add("loop-guarded-otherwise");
          }
          if(!kinds.size) kinds.add("set-rendered");
          const list = [...kinds].sort();
          rows.push({ file, fn:f.name, op, line, kinds:list,
                      risky: list.filter(k => RISKY.has(k)) });
        }
      }
    }
  }
  return { rows, functions, sites };
};

const RANKED_OPS = [...RANKED.keys()];
const S = sweep(UI_FILES, RANKED_OPS);
/* THE LICENCE TABLE. A risky pick is NOT exempted — it is NAMED, with the fact
   that licenses it, and anything not in this table is a finding. Keyed on the
   SITE and the KIND, never on the op, because the reason is about the site: the
   same op picked positionally somewhere else would be a finding there. */
const LICENSED = new Map([
  ["heldMatch/search/positional",
   "the hash arm subscripts `hash:sha256:<sha>` — an EXACT byte-identity selector. "
   + "Every row it can return holds the same bytes, so every row is a correct answer to the "
   + "question asked and there is no wrong one to pick. The arm asks for ONE row and reads ONE row."],
]);
const tally = {};
for(const r of S.rows) for(const k of r.kinds) tally[k] = (tally[k] || 0) + 1;
console.log(`  SWEEP CORPUS: ${UI_FILES.length} files in civicos-ui/ · ${S.functions} named functions · `
  + `${DISPATCH.size} dispatched ops, ${RANKED.size} of them relevance-ordered (${RANKED_OPS.join(" ")}) · `
  + `${S.sites} call sites reaching one`);
console.log(`     SWEEP KINDS: ` + (Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(" · ") || "(none)"));
for(const r of S.rows)
  console.log(`       ${r.risky.length ? "PICKS-A-ROW" : "no row taken"}   ${r.file}:${r.line ?? "?"} `
    + `${r.fn}() op=${r.op} -> ${r.kinds.join(",")}`);
if(UNJUDGED_OPS.length)
  console.log(`     SWEEP UNJUDGED (${UNJUDGED_OPS.length}): dispatched to a method this walk cannot segment — ${UNJUDGED_OPS.join(" ")}`);

ok(`SWEEP GUARD: the walk reaches a real corpus rather than reporting a verdict over nothing — ${S.functions} functions, ${S.sites} sites`,
   UI_FILES.length >= 3 && S.functions >= 200 && S.sites >= 1);
const findingsOf = (rows) => rows.flatMap(r => r.risky
  .filter(k => !LICENSED.has(`${r.fn}/${r.op}/${k}`))
  .map(k => ({ ...r, kind:k })));
const bad = findingsOf(S.rows);
if(bad.length) for(const r of bad)
  console.error(`         civicos-ui/${r.file}:${r.line ?? "?"} — ${r.fn}() takes ONE row out of relevance-ordered op=${r.op} by POSITION (${r.kind}), and no fact licenses it`);
ok("THE CLASS IS CLEAR: every site that takes a single row out of a relevance-ordered answer by POSITION is named, with the fact that licenses it",
   bad.length === 0);
/* THE LICENSED SET IS A FLOOR AS WELL AS A CEILING. A ceiling alone passes
   trivially over nothing (REC-70): if the walk went blind, zero findings and
   zero licensed sites would read exactly like a clean tree. So every licence
   must still be EARNED by a site the walk actually found. */
const RISKY_SITES = S.rows.flatMap(r => r.risky.map(k => `${r.fn}/${r.op}/${k}`)).sort();
ok(`THE LICENCE TABLE IS EXACTLY EARNED — ${RISKY_SITES.length} positional pick(s) found, ${LICENSED.size} licensed, and each licence is claimed by a site the walk saw: ${JSON.stringify(RISKY_SITES)}`,
   RISKY_SITES.join(" ") === [...LICENSED.keys()].sort().join(" "));
/* AND THE LICENSING FACT IS ASSERTED, not merely written down. The arm licensed
   above is licensed BECAUSE its selector is a byte identity; if that stops being
   true the licence goes red rather than standing on its own prose. */
{
  const hm = (functionsOf(stripComments(UI_FILES.find(x => x.file === "app.html").text))
              .find(f => f.name === "heldMatch") || { body:"" }).body;
  ok("THE LICENSING FACT, ASSERTED: the arm licensed above selects on `hash:sha256:` — a byte identity — and asks for exactly one row",
     /search\(`hash:sha256:\$\{sha256\}`,\s*1\)/.test(hm));
}

/* ---- REACH, AS A DELTA, AGAINST THE DEFECT ITSELF -------------------------
   The sweep is run again over a copy of app.html carrying the PRE-UI-50 loop —
   the compare-and-return that made this item exist. It must find it. A walk
   asserting an absence with a dead matcher passes forever. */
{
  const APP = UI_FILES.find(x => x.file === "app.html");
  /* THE REGRESSION IS PUT BACK AT ITS REAL SITE, not at a synthetic one. The
     pre-UI-50 loop's decisive property is a `return` reached without any
     equality — the row bm25 happened to put first, taken because it was first.
     The anchor is asserted to appear EXACTLY ONCE before it is used, because an
     injection that has silently become a no-op is this project's own named trap
     and it must say so rather than pass. */
  const ANCHOR = "if(heldSha === sha256) return { bundle: o, identical: true, changed: false, artifacts: [] };";
  const hits = APP.text.split(ANCHOR).length - 1;
  ok(`SWEEP INSTRUMENT: the regression anchor appears EXACTLY ONCE in app.html (${hits}), so the injection below cannot silently become a no-op`,
     hits === 1);
  const copy = UI_FILES.map(x => x.file !== "app.html" ? x : ({ file:x.file,
    text: x.text.replace(ANCHOR, ANCHOR
      + "\n    return { bundle: o, identical: false, changed: true, proceed: true };") }));
  ok("SWEEP INSTRUMENT: the regression copy really was modified, so the delta below compares two different things",
     copy.find(x => x.file === "app.html").text !== APP.text);
  const S2 = sweep(copy, RANKED_OPS);
  const bad2 = findingsOf(S2.rows);
  console.log(`     SWEEP REACH DELTA: the pre-UI-50 unguarded return put back at its real site -> unlicensed positional picks ${bad.length} -> ${bad2.length}`
    + (bad2.length ? ` · ${bad2.map(r => `${r.fn}/${r.op}/${r.kind}`).join(" ")}` : ""));
  ok("SWEEP REACH IS A DELTA: the same matcher over a copy carrying the PRE-UI-50 loop finds the defect this item removed, AT `heldMatch` ITSELF and not at a synthetic stand-in",
     bad2.length === bad.length + 1
     && bad2.some(r => r.fn === "heldMatch" && r.op === "search" && r.kind === "loop-unguarded"));
  /* OVER-STRICTNESS, both directions. A loop that returns ONLY under an equality
     must NOT be flagged, and a positional subscript MUST be — otherwise the
     classifier is simply answering yes. */
  const EQ_ONLY = `
async function ui50EqualityOnly(sha256, locator){
  const r = await recR("search", { q: \`locator:"\${locator}"\`, limit:"500" });
  const rows = (r && r.hits) || [];
  for(const o of rows){ if(o.sha === sha256) return { bundle: o }; }
  return null;
}
`;
  const SUB = `
async function ui50Positional(locator){
  const r = await recR("search", { q: \`locator:"\${locator}"\`, limit:"500" });
  return ((r && r.hits) || [])[0];
}
`;
  const eqCopy = UI_FILES.map(x => x.file !== "app.html" ? x : ({ file:x.file, text: x.text + EQ_ONLY }));
  const subCopy = UI_FILES.map(x => x.file !== "app.html" ? x : ({ file:x.file, text: x.text + SUB }));
  const eqRows = sweep(eqCopy, RANKED_OPS).rows.filter(r => r.fn === "ui50EqualityOnly");
  const subRows = sweep(subCopy, RANKED_OPS).rows.filter(r => r.fn === "ui50Positional");
  ok("SWEEP OVER-STRICTNESS: a loop that returns ONLY under an equality is NOT a finding — identity has no order to get wrong",
     eqRows.length === 1 && eqRows[0].risky.length === 0 && eqRows[0].kinds.includes("loop-by-equality"));
  ok("SWEEP INSTRUMENT: while a bare positional subscript on the same answer IS one, so the arm above is not passing because the walk is blind",
     subRows.length === 1 && subRows[0].risky.includes("positional"));
  /* A NEUTERED ROSTER FINDS NOTHING — permanent, so a green sweep over an empty
     roster can never read as evidence. */
  ok("SWEEP: a neutered roster finds nothing, which is why the delta and not the absolute is the evidence",
     sweep(copy, []).rows.length === 0);
}

/* ==========================================================================
 * THE SECOND WALK — THE DESTINATION. Every site that writes a bundle.
 *
 * A bundle sentence is permanent, so the set of functions that can compose one
 * carries a FLOOR and a CEILING: a fourth writer must not land silently, and a
 * walk that lost sight of the three must not read as three.
 * ========================================================================== */
{
  const APP = UI_FILES.find(x => x.file === "app.html");
  const code = stripComments(APP.text);
  const writers = [];
  for(const f of functionsOf(code))
    if(/recPostR\("promote"/.test(f.body)) writers.push(f.name);
  console.log(`     BUNDLE WRITERS: ${writers.length} function(s) in app.html reach op=promote — ${writers.join(" ")}`);
  ok(`EVERY BUNDLE WRITER IS NAMED, with a floor and a ceiling so a fourth cannot land silently — found ${JSON.stringify(writers.sort())}`,
     writers.sort().join(" ") === "addGo doProposalAdopt reviseWithCapture");
  /* EACH ONE'S COMPOSED SENTENCE, AND HOW THE ROW IT NAMES WAS CHOSEN. This is
     an ENUMERATION and it says so: three writers is small enough to read, and
     the ceiling above is what stops it silently becoming four. */
  const fn = (name) => (functionsOf(code).find(f => f.name === name) || { body:"" }).body;
  ok("addGo composes from CHANGED_FROM, and CHANGED_FROM is now the chain's last version — this item's subject",
     /CHANGED_FROM\.bundle_id/.test(fn("addGo")) && /earlier capture of this same address/.test(fn("addGo")));
  ok("doProposalAdopt composes from a proposal the MEMBER clicked, matched by KEY EQUALITY out of the feed it was rendered from — an identity, and not this class",
     /PROP_ADOPT_CTX\.proposal/.test(fn("doProposalAdopt"))
     && /PROPOSALS_LAST\.find\(x => x\.key === key\)/.test(code));
  ok("and the values it writes are that proposal's OWN published fields, so no second lookup stands between the row and the sentence",
     /p\.progression_label/.test(fn("doProposalAdopt")) && /p\.stage_label/.test(fn("doProposalAdopt")));
  ok("reviseWithCapture restates nothing about the record: it re-promotes a bundle it already holds BY ID and composes no sentence at all",
     !/earlier capture|already holds/.test(fn("reviseWithCapture")));
}

console.log(`version-predecessor: ${n} assertions, all green — the changed-from sentence names the IMMEDIATELY PREVIOUS version at the address, `
  + `driven through the REAL addGo over ${N} chain lengths with ground truth computed in this file and never read back from op=versionchain, `
  + `with the trap proved armed on every subset (the oldest is not the predecessor) · the sentence asserted IN bundle.md, where it is permanent · `
  + `an address with no earlier version rendering as an honest absence and a chain of one as a chain · an unestablished chain degrading to "not established" `
  + `rather than to a guess · and a CLASS SWEEP over the plane's own roster of relevance-ordered ops, its reach proved as a DELTA against the pre-UI-50 loop itself`);
