/* UI-63 — THE CROSS-SEAM PANEL SAID *"ANSWERED BY NEITHER"* ABOUT THREE ARMS
 * `op=search` COMPILES.
 *
 * WHAT THIS HARNESS IS FOR. `finderPlan` in `app.html` decided which seam a
 * typed term belongs to by asking `searchHasField`, which asks the FIELD half
 * of `op=searchfields`. `leg:`, `resolves:` and `content:` are MEANING ARMS —
 * the other half of the same answer — so all three fell into the `unpublished`
 * bucket and the finder's refusal panel reported them to a member as *answered
 * by neither*. That is FALSE, and it is falsified by the surface's own next
 * act: `finderTextRoute` sends `text` AND `unpublished` to `op=search`, which
 * compiles all three. The member was told a capability was absent when it was
 * present, and sent away from a question the record can answer.
 *
 * It is REC-115's family on the same surface with the sign flipped — the record
 * claiming LESS than it can support rather than more — and this repository is
 * instrumented almost entirely against the other direction, which is why the
 * defect sat in a rendered panel on the member path without anything firing.
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * The criterion this fix turns on is *what the plane publishes as a meaning
 * arm*. A mock `op=searchfields` answering a hand-written `meaning` object
 * would be this suite agreeing with itself — an equality that costs nothing to
 * produce (CLAUDE.md). So the plane is the actual `bio-plane/src/index.mjs`
 * under miniflare, `op=searchfields` is the real `searchFields()`, and its
 * `meaning` half is the real `meaningVocabulary()`, derived from the compiler's
 * own `MEANING` registry. `query.mjs`'s selector dispatch is, verbatim:
 *
 *     if (name in MEANING) return meaningAtom(name, tok, ctx);
 *
 * placed BEFORE the field-registry lookup. So the set of names the published
 * `meaning` half carries IS the set of selectors `op=search` compiles through
 * the meaning layer, by construction rather than by agreement — and section 0
 * below drives the real `op=search` to check that both directions hold on this
 * tree rather than resting on the sentence.
 *
 * THE STORE IS EMPTY, DELIBERATELY. Every question here is about the PARSE and
 * the REFUSAL PANEL, both of which are reached before any content is asked for,
 * and `meaning` is published off a registry that does not depend on content.
 * Seeding a corpus would add a variable this suite is not about. The one place
 * a real answer is needed — that `op=search` accepts an arm and warns on a name
 * it publishes as neither — is driven against the empty store, where the
 * WARNINGS are the measurement and the hit count is not.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 * STATED FIRST, BEFORE WHAT IS CHECKED, because it is what the assertions are
 * shaped against. The cheapest green is to widen `finderPlan` so that EVERY
 * unrecognised selector-shaped prefix is treated as answered by the text route.
 * All three arms would then be reported correctly, this suite's headline would
 * go green — and the panel would lose the ability to say *answered by neither*
 * about ANYTHING. That sentence is worth having: `grade:` is published as
 * neither a field nor an arm, it filters nothing on either route (`op=search`
 * answers `unknown field "grade"; read as free text`), and a member told
 * otherwise goes on believing they narrowed a set they did not narrow. This
 * row narrows a FALSE negative and must not remove the TRUE one.
 *
 * SECTION 3 IS THAT EXCLUSION AND IT IS THE SECTION THAT MATTERS. It sweeps
 * names the plane publishes in NEITHER half and requires every one of them to
 * still be reported as answered by neither; it blanks the published `meaning`
 * half and requires all three arms to fall back; and it re-runs the walks
 * UI-62's over-strictness arm pins. A criterion that is *what the plane
 * publishes, in both halves* passes all of it. A criterion that is *anything
 * with a colon* fails section 3 while passing sections 1 and 2.
 *
 * ================= THE FENCE THIS ITEM WORKED INSIDE =================
 * UI-62 routed `passage:` and left these three exactly where they were ON
 * PURPOSE, and wrote an over-strictness arm to prove the walks it did not mean
 * to change did not change. That arm lives in `passage-surface.test.mjs` and
 * this item NEVER EDITED IT — a fence you may move is not a fence. It is RUN,
 * and the byte-identical measurement is `meaning-arms.walks.mjs`:
 *
 *     node civicos-ui/test/meaning-arms.walks.mjs
 *
 * MEASURED 2026-09-17, before and after the one-predicate change, against the
 * real plane: PINNED (22 walks — both not-asked panels by exact string, the
 * empty-query passages route, `passage:` and `leg:` against a plane publishing
 * no `meaning` at all, and fifteen ordinary queries with their rendered
 * cross-seam panels) held at sha256
 *   ce850276b5112c73cca0136320cabe5401a026859b41c72f0a40f544990df8d3
 * IDENTICAL across the change, while ARMS (13 walks) moved
 *   a42fd3c1022a94e5889e0f55ea47ac97787d6ee97fd1c32e143ef12889b4d43f
 *   -> 2f4b2f4116d36c83f98399a97cd0367660c5df81adcd4c89ea7cd8e403f195c5
 * Both halves are reported because a run where PINNED holds and ARMS ALSO
 * holds is a change that did nothing, which is the other way this could be
 * wrong. The composer walks UI-62 also pins go through `citePaint`, which this
 * item cannot reach from `finderPlan`; they are covered by running the fence
 * suite itself.
 *
 * ================= NEGATIVE CONTROL =================
 * NEGATIVE CONTROL: node civicos-ui/test/meaning-arms.control.mjs
 *   Four arms, each ONE anchored edit to `civicos-ui/app.html`, armed alone and
 *   restored from a per-arm pristine copy verified by sha256 AND `cmp`. NEVER
 *   `git checkout --`, which restores to HEAD and has twice in this repository
 *   discarded a session's own uncommitted work.
 *   RUN 2026-09-17 (ui63 worker). Results recorded at the foot of this file.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one. The import is for its SIDE EFFECT and is idempotent. */
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

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
  console.error("meaning-arms: the real plane could not be started — miniflare is not installed.");
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
  bindings: { ADMIN_TOKEN: "adm-ui63", MEMBER_TOKEN: "mem-ui63", PROBE_TOKEN: "prb-ui63", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const get = async (op, qs = "", tok = "mem-ui63") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ============================================================
   0. THE GROUND — THE ARTIFACT, NOT A DOCUMENT ABOUT IT
   ============================================================ */
console.log("\n--- 0. what the plane itself publishes, and what it itself compiles ---");

const SF = await get("searchfields");
const ARMS = ["leg", "resolves", "content"];

ok("`op=searchfields` publishes a `meaning` half at all",
  !!(SF && SF.meaning && typeof SF.meaning === "object"),
  `got ${JSON.stringify(SF && Object.keys(SF || {}))}`);
for (const a of ARMS)
  ok(`\`${a}:\` is published as a MEANING ARM`,
    Object.prototype.hasOwnProperty.call(SF.meaning || {}, a),
    `meaning half publishes ${JSON.stringify(Object.keys(SF.meaning || {}))}`);
for (const a of ARMS)
  ok(`...and \`${a}:\` is NOT published as a projected FIELD, which is exactly why asking only the field half missed it`,
    !Object.prototype.hasOwnProperty.call(SF.fields || {}, a));

/* THE OP'S OWN `syntax` LINES — the artifact the row names as settling this. */
ok("the plane's own published `syntax` says these arms reach the meaning layer",
  (SF.syntax || []).some((l) => /leg:.*resolves:.*concerns:.*MEANING layer/.test(l)),
  `syntax = ${JSON.stringify(SF.syntax)}`);
ok("...and says so for `content:` too, in its own line",
  (SF.syntax || []).some((l) => /^content: reaches the CONTENT layer/.test(l)));

/* AND THE COMPILER AGREES ON THIS TREE, BOTH DIRECTIONS. A published vocabulary
   is a claim; this drives the real `op=search` and reads its own warnings. The
   store is empty, so the HIT COUNT says nothing and is not asserted — the
   WARNINGS are the measurement. */
for (const a of ARMS) {
  const r = await get("search", `q=${encodeURIComponent(`${a}:x`)}&mode=ids`);
  ok(`\`op=search\` COMPILES \`${a}:x\` — no "unknown field" warning`,
    !!r && !(r.query && r.query.warnings || []).some((w) => /unknown field/.test(w)),
    `warnings = ${JSON.stringify(r && r.query && r.query.warnings)}`);
}
{
  const r = await get("search", `q=${encodeURIComponent("grade:>=B")}&mode=ids`);
  ok("...while `grade:>=B` is NOT compiled — the plane says `unknown field` and reads it as free text, "
   + "which is what makes *answered by neither* a true sentence and worth keeping",
    !!r && (r.query && r.query.warnings || []).some((w) => /unknown field "grade"/.test(w)),
    `warnings = ${JSON.stringify(r && r.query && r.query.warnings)}`);
}

/* ============================================================
   1. THE SURFACE, LOADED, WITH ITS OWN FETCH BRIDGED TO THAT PLANE
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
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch: async (u, opts) => { const url = new URL(u, "http://x");
    CALLED.push({ op: url.searchParams.get("op"), url });
    return mf.dispatchFetch(url.toString(), opts); } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE", "loadSearchFields", "SEARCH_FIELDS", "PASSAGE_ARM", "finderPassageArm",
  "finderPlan", "finderTextRoute", "finderCrossSeamHtml",
  "finderTextPanelHtml", "finderSubjectsPanelHtml", "finderPassageRoute",
].join(",") + "};", ctx);
const U = ctx.__U;
U.PLANE.token = "mem-ui63";
U.PLANE.session = true;
U.PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };
await U.loadSearchFields(true);
ok("the surface loaded the plane's REAL vocabulary — both halves", CALLED.some((c) => c.op === "searchfields")
  && !!U.SEARCH_FIELDS.fields && !!U.SEARCH_FIELDS.meaning);

/* THE PANEL IS READ THE WAY A MEMBER READS IT — the rendered rows, keyed by the
   heading each one carries, never the plan object behind it. A test that read
   `plan.unpublished` would be asserting against `finderPlan` in isolation and
   would go green on a parse whose answer never reaches the screen. */
const BUCKETS = {
  text:        "Answered only by the text and fields route",
  subjects:    "Answered only by the subjects route",
  passages:    "Answered only by the passages route",
  neither:     "Answered by neither",
};
function panelBuckets(typed){
  const html = U.finderCrossSeamHtml(U.finderPlan(typed));
  const out = {};
  for (const [key, heading] of Object.entries(BUCKETS)) {
    /* UP TO `</span></div>`, NOT to the first `</span>`. The value cell holds
       one `<span class="mono">` per term, so a non-greedy stop at the first
       closing tag captures a fragment with no closing tag in it and every
       bucket reads EMPTY — which looked exactly like the panel reporting
       nothing at all. Found by paying for it: the first draft of this extractor
       reported `NO BUCKET AT ALL` for all four buckets on a surface that was
       rendering them correctly, i.e. the instrument failed in the direction
       that reads as a damning finding. */
    const m = new RegExp(`<span class="k">${heading}</span><span class="v">(.*?)</span></div>`).exec(html);
    /* ENTITIES DECODED BACK TO THE MEMBER'S OWN SPELLING. `esc` renders
       `resolves:>=B` as `resolves:&gt;=B`, so a bucket list compared against
       what was typed reads EMPTY for every term carrying a comparison — and
       `resolves:` is the arm whose ordinary spelling has one. Caught by this
       suite's own run against a correct surface, which is the direction an
       instrument's own bug is cheapest to find in. */
    out[key] = m ? (m[1].match(/<span class="mono">(.*?)<\/span>/g) || [])
      .map((s) => s.replace(/<[^>]*>/g, "")
                   .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                   .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&")) : [];
  }
  out._html = html;
  return out;
}
/* The failure message must NAME THE ARM AND THE BUCKET. "the panel is wrong" is
   a failure a reader cannot act on. */
const whereIs = (b, term) => Object.keys(BUCKETS).filter((k) => b[k].includes(term)).join("+") || "NO BUCKET AT ALL";

/* ============================================================
   2. THE THREE ARMS, REPORTED BY THE ROUTE THAT ANSWERS THEM
   ============================================================ */
console.log("\n--- 2. through the surface: the panel a member reads ---");

const SUBJ = "concerns:ENT-0031";
for (const [arm, term] of [["leg", "leg:hunch"], ["resolves", "resolves:>=B"], ["content", "content:stale"]]) {
  const b = panelBuckets(`${SUBJ} ${term}`);
  ok(`\`${term}\` is reported in the "${BUCKETS.text}" bucket`,
    b.text.includes(term),
    `arm \`${arm}:\` — the panel put \`${term}\` in: ${whereIs(b, term)}`);
  ok(`...and \`${term}\` is NOT in the "${BUCKETS.neither}" bucket, which is the false sentence this row exists for`,
    !b.neither.includes(term),
    `arm \`${arm}:\` — "${BUCKETS.neither}" holds: ${JSON.stringify(b.neither)}`);
}
{
  /* ALL THREE AT ONCE, beside a term that genuinely is answered by neither. One
     query, and the panel has to get both kinds right in the same render. */
  const b = panelBuckets(`${SUBJ} leg:hunch resolves:>=B content:stale grade:>=B`);
  eq("in one query the panel separates the three ARMS from the one name published as NEITHER",
    [b.text, b.neither, b.subjects],
    [["leg:hunch", "resolves:>=B", "content:stale"], ["grade:>=B"], [SUBJ]]);
}

console.log("\n--- 2b. and the route the panel names is the route that is actually asked ---");
for (const [arm, term] of [["leg", "leg:hunch"], ["resolves", "resolves:>=B"], ["content", "content:stale"]]) {
  const before = CALLED.length;
  const r = await U.finderTextRoute(U.finderPlan(term));
  const call = CALLED.slice(before).find((c) => c.op === "search");
  ok(`the text route really is asked \`${term}\` — the panel's claim is checked against the wire`,
    !!call && (call.url.searchParams.get("q") || "").includes(term),
    `arm \`${arm}:\` — q sent = ${JSON.stringify(call && call.url.searchParams.get("q"))}`);
  ok(`...and the record does not answer \`${term}\` with "unknown field", so the panel is not merely consistent — it is right`,
    r.asked === true && !(r.warnings || []).some((w) => /unknown field/.test(w)),
    `arm \`${arm}:\` — asked=${r.asked} warnings=${JSON.stringify(r.warnings)}`);
}
{
  /* THE MEMBER-FACING CONSEQUENCE THAT IS NOT A LABEL. The refusal offers "run
     the text route instead", and that button spells out exactly what it will
     run. While the arms sat in `unpublished` the button DROPPED them — so a
     member clicking the remedy had their term silently deleted from their own
     question, which is the one thing the refusal exists to prevent, arriving
     through the remedy instead of through the answer (UI-62's own words about
     `passage:`, one seam over). */
  const b = panelBuckets(`${SUBJ} leg:hunch grade:>=B`);
  const alt = /id="f-alt-text"[^>]*>Run <span class="mono">(.*?)<\/span>/.exec(b._html);
  ok("the offered text-route alternative SPELLS the arm rather than dropping it from the member's question",
    !!alt && alt[1].includes("leg:hunch"),
    `the button offers: ${JSON.stringify(alt && alt[1])}`);
}

/* ============================================================
   3. OVER-STRICTNESS — THE TRUE NEGATIVE SURVIVES, AND THE LIAR DOES NOT
   ============================================================ */
console.log("\n--- 3. over-strictness: this row narrows a FALSE negative and must not remove the TRUE one ---");

{
  /* THE SWEEP THAT EXCLUDES THE CHEAPEST GREEN. Every name here is published by
     the plane in NEITHER half — checked against the real answer rather than
     assumed — and every one must still be reported as answered by neither. A
     parse that waved unrecognised prefixes through fails every line of this. */
  /* THE GROUND ASSERTION BELOW IS NOT CEREMONY AND IT ALREADY EARNED ITS PLACE.
     This list first read `legs`, chosen as an obvious near-miss for the `leg:`
     arm — and the plane PUBLISHES `legs:` as a projected field
     (`inquiry_basis_count`, `query.mjs`'s FIELDS). So one sweep line would have
     been asserting that a real field is answered by neither, and it would have
     gone red against a CORRECT surface. A fixture nobody checks against the
     artifact is the agreement-of-documents trap in miniature. */
  const NEITHER = ["grade", "nosuchfield", "sewer", "author", "passageX", "legrest", "resolve", "contents"];
  for (const name of NEITHER) {
    const published = Object.prototype.hasOwnProperty.call(SF.fields || {}, name)
                   || Object.prototype.hasOwnProperty.call(SF.meaning || {}, name);
    ok(`GROUND: the plane publishes \`${name}:\` in neither half, so the panel owes it that sentence`,
      !published, `if this fails the sweep below is testing nothing for \`${name}:\``);
    const term = `${name}:x`;
    const b = panelBuckets(`${SUBJ} ${term}`);
    ok(`\`${term}\` is STILL reported in the "${BUCKETS.neither}" bucket`,
      b.neither.includes(term),
      `\`${name}:\` — the panel put \`${term}\` in: ${whereIs(b, term)}. ` +
      `A parse that treats every unrecognised prefix as answered destroys this sentence for every term at once.`);
  }
  ok("...so the panel can still say *answered by neither* at all, which is the capability this row must not spend",
    NEITHER.every((n) => panelBuckets(`${SUBJ} ${n}:x`).neither.length === 1));
}

{
  /* THE CRITERION IS THE PLANE'S, NOT A LIST IN THIS FILE. Against a plane that
     publishes no `meaning` half the three arms fall back to `answered by
     neither` — which is the TRUE answer about THAT plane, and is the same rule
     `finderPassageArm` runs on one construct over. A surface carrying a literal
     list of arm names would keep reporting them as answered here, and would be
     inventing a capability the plane it is talking to does not have. */
  const saved = U.SEARCH_FIELDS.meaning;
  U.SEARCH_FIELDS.meaning = null;
  for (const term of ["leg:hunch", "resolves:>=B", "content:stale"]) {
    const b = panelBuckets(`${SUBJ} ${term}`);
    ok(`against a plane publishing NO meaning half, \`${term}\` is reported as answered by neither — the truth about THAT plane`,
      b.neither.includes(term), `the panel put \`${term}\` in: ${whereIs(b, term)}`);
  }
  U.SEARCH_FIELDS.meaning = saved;
  ok("...and restoring the vocabulary restores the reporting (the answer did not latch)",
    panelBuckets(`${SUBJ} leg:hunch`).text.includes("leg:hunch"));
}

{
  /* `passage:` IS UNCHANGED. UI-62 routed it to its own seam and this row moved
     nothing about it: it is reported by the PASSAGES route, not swept into the
     text bucket by the predicate this row added. */
  const b = panelBuckets(`${SUBJ} ${U.PASSAGE_ARM}:hydrostatic`);
  eq("`passage:` is STILL reported by the passages route and is in no other bucket",
    [b.passages, b.text, b.neither], [[`${U.PASSAGE_ARM}:hydrostatic`], [], []]);
}

{
  /* THE WALKS UI-62 PINNED. `passage-surface.test.mjs` is the fence and is never
     edited by this item; these are re-asserted here so a reader of THIS file can
     see what it was not allowed to move, and `meaning-arms.walks.mjs` is the
     byte-identical measurement (see the header). */
  eq("UI-62's walk: the text panel's not-asked render is unchanged",
    U.finderTextPanelHtml({ asked: false }, new Set()),
    `<h2 class="sec">Text and fields</h2><p class="subj-note">Not asked: nothing you typed is a term this route can answer.</p>`);
  ok("UI-62's walk: the subjects panel's not-asked render is unchanged",
    U.finderSubjectsPanelHtml({ asked: false }, new Set()).includes("this route answers about a SUBJECT"));
  ok("UI-62's walk: a query naming neither seam still reaches the text route exactly as before",
    U.finderPlan("sewer fund").text.length === 2 && U.finderPlan("sewer fund").passages.length === 0);
  const empty = await U.finderPassageRoute(U.finderPlan(""));
  eq("UI-62's walk: with nothing typed the passages route is NOT ASKED", [empty.asked, !!empty.env], [false, false]);
}

{
  /* A BARE WORD IS NOT A SELECTOR, and an arm name typed WITHOUT a colon is a
     word. The predicate this row added keys on the selector shape the parse
     already found, so `leg` alone stays free text and still feeds the passages
     route's words. */
  const p = U.finderPlan("leg content resolves");
  eq("an arm NAME typed as a bare word is still free text, and still a word the passages route may use",
    [p.text.length, p.words, p.unpublished.length], [3, ["leg", "content", "resolves"], 0]);
}

/* ==================================================================== */
console.log(`\nmeaning-arms: ${pass} pass, ${fail} fail`);
/* Dispose, then exit on the count — a green run that never called
   `process.exit` would leave miniflare holding the event loop open and the
   suite would HANG AFTER PRINTING ITS OWN TALLY, which under the runner's
   `execFileSync` is an indefinite stall and not a failure. */
await mf.dispose();
if (fail) process.exit(1);

/* ====================================================================
 * NEGATIVE CONTROL — RUN 2026-09-17 (ui63 worker). SIX ARMS, EACH ONE ANCHORED
 * EDIT TO `civicos-ui/app.html`, armed alone and restored from a per-arm
 * pristine copy verified by sha256 AND `cmp` (`1352873 bytes`, every arm EQUAL
 * and identical). Re-run in one step:
 *
 *     node civicos-ui/test/meaning-arms.control.mjs
 *
 * Both this suite AND `passage-surface.test.mjs` are run for every arm, the
 * second as UI-62's FENCE. Measured:
 *
 *   baseline      meaning-arms 55/0 · passage-surface 100/0   (nothing armed — MUST be green)
 *   reverted      meaning-arms 46/9 · passage-surface 100/0
 *   liar          meaning-arms 42/13 · passage-surface 98/2
 *   literal       meaning-arms 52/3 · passage-surface 99/1
 *   stealspassage meaning-arms 54/1 · passage-surface 98/2
 *   equivalent    meaning-arms 55/0 · passage-surface 100/0   (OVER-STRICTNESS — must take nothing down)
 *   reordered     meaning-arms 55/0 · passage-surface 100/0   (OVER-STRICTNESS — must take nothing down)
 *
 * `reverted` — THE FIX REMOVED. 9 FAIL, and every one NAMES THE ARM AND THE
 *   BUCKET, which is the property the row required and the reason the panel is
 *   read through its rendered headings rather than off the plan:
 *     "`leg:hunch` is reported in the "Answered only by the text and fields route" bucket"
 *        -> arm `leg:` — the panel put `leg:hunch` in: neither
 *     ...the same for `resolves:>=B` and `content:stale`, plus the one-query
 *     separation, plus "the offered text-route alternative SPELLS the arm
 *     rather than dropping it from the member's own question".
 *   passage-surface stays 100/0, which is the arm's other half: reverting this
 *   item restores exactly the state UI-62 shipped and disturbs nothing else.
 *
 * `liar` — THE CHEAPEST GREEN, ARMED: every selector-shaped term treated as
 *   answered by the text route. 13 FAIL. **THE THREE PER-ARM ASSERTIONS IN
 *   SECTION 2 STAYED GREEN — the liar reports all three arms correctly and
 *   satisfies this row's headline.** What caught it was section 3's eight-name
 *   sweep (each naming the term and reporting it in `text`), the capability
 *   assertion, the three no-meaning-half fallbacks — and, outside section 3,
 *   ONE assertion: the COMBINED query that requires the panel to separate the
 *   three arms from `grade:>=B` in a single render. An assertion that checks
 *   the two kinds TOGETHER catches this where three assertions checking one
 *   kind each cannot. passage-surface independently went 98/2.
 *
 * `literal` — the plane's published vocabulary replaced by a hard-coded list of
 *   arm names. 3 FAIL here, all three being "against a plane publishing NO
 *   meaning half, `<arm>` is reported as answered by neither". **AND THE FENCE
 *   CAUGHT IT TOO, WHICH THIS DRIVER PREDICTED IT WOULD NOT** — passage-surface
 *   99/1 on its own walk *a `passage:` term is then reported as a name the
 *   record publishes as neither*. The wrong prediction is recorded in the
 *   driver beside the arm rather than corrected out of it.
 *
 * `stealspassage` — the passages branch disarmed so `passage:` falls through to
 *   the selector branch, where this item's new predicate claims it. BOTH suites
 *   fail. The ORDER of the two branches is load-bearing and this is what pins it.
 * ==================================================================== */
