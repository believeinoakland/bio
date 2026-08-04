/* UI-13 — THE WRITE SURFACE FOR THE INTENT LAYER, driven against the REAL PLANE.
 *
 * `LAYERS.md:201` (THE ACCESS FACT): every write op in the intent layer was
 * unreachable from every surface — "a member cannot declare how an institution
 * is supposed to work". `:279` names the false belief this corrects: the entity
 * axis was never waiting on a MECHANISM, it was waiting on a SURFACE. This
 * harness drives that surface end to end and asserts the four things the plane
 * enforces structurally, which a surface can only get wrong.
 *
 * NO MOCK OF THE WRITE PATH. The plane runs in miniflare from
 * `bio-plane/src/index.mjs` — the real control plane, the real Durable Object,
 * the real SQLite schema — and `app.html`'s own `fetch` is bridged to it. Every
 * one of the nine ops is called by the surface's own handlers, exactly as a
 * browser would call them (D-43: a store-level test does not prove a caller can
 * reach the feature; `op=invitelook` shipped with a ReferenceError while 1276
 * assertions passed). The suite asserts by NAME that all nine were reached.
 *
 * WHAT IT PROVES, in the accepts-when's own order:
 *   1. an entity is created WITH an alias, through op=entitycreate/op=entityalias;
 *   2. a justified proxy_for relation is declared and renders with NO GRADE —
 *      constitutive, not evidentiary (D-83; `entity_relations` has no grade
 *      column, so the category error is refused by the schema, not by manners);
 *   3. a document's reference is resolved to it, and a Grade C resolution reads
 *      UNCONFIRMED and never established;
 *   4. op=resolvetestify is the ONLY path to a D and the machine never mints one
 *      — the recogniser leaves an unmatched reference honestly unresolved;
 *   5. a two-stage (here three-stage) progression is defined and a document is
 *      threaded through it, with the instance's grade the weakest link and the
 *      missing required stage surfacing as a finding until it is discharged;
 *   6. UI-4's subject view then renders NON-EMPTY for that entity.
 *
 * AND THE DEC-8 PROPERTIES, which are the reason this item exists at all:
 *   - every option on every control came from the plane. CORRECTED 2026-08-04
 *     (REC-35): it was "op=affordances first, then the op's own refusal",
 *     because when this suite was written the plane published none of these
 *     three sets and the refusal-harvest was the only arm that could run. It
 *     publishes all three now, so the assertion is that the options came from
 *     the PUBLICATION and that the harvest arm was reached by nothing. The
 *     second instrument — the same fact measured a different way, the shape
 *     check-semantics.mjs pins the catalog with — is the ENFORCING OPS' own
 *     refusals, read by this file directly off the real plane;
 *   - a PRE-FLIGHT WRITES NOTHING: after every pre-flight in this file the
 *     registry still contains nothing the pre-flights named;
 *   - the commit control is ABSENT while the plane refuses, and the refusal
 *     rendered is the plane's own words, never a sentence composed here;
 *   - Q12: a credential that cannot write sees NO control and ONE sentence.
 *
 * NEGATIVE CONTROL, three arms, ALL RUN 2026-08-04 and each restored
 * byte-identical (sha256 compared before and after each arm). Arms (a) and (b)
 * were run by UI-13 against app.html at
 * 10975a570cb9cb33d24f7759cd714a66003204639ce5e0807d2a7da946fa92a3; REC-35
 * moved that sha to
 * 337fe4915221756002e25bf5ab341a7a04a3756e6284c7fb2013a9e82e344720 by editing
 * COMMENTS ONLY — the comment-stripped file is byte-identical across the item,
 * measured, which is this item's zero-surface-change claim. Arm (c) is REC-35's
 * own and touches bio-plane, not app.html.
 *
 *   (a) THE ITEM'S OWN CONTROL — render the declared relation WITH a grade
 *       badge. In app.html's `subjRelationsHtml`, add the line
 *           ${subjGradeBadge("D", false, false)}
 *       immediately above the `subj-constit` div inside `subj-relcard`. RESULT:
 *       3 of 104 assertions FAILED and the suite exited non-zero — "a declared
 *       relation carries NO A–D grade anywhere on the subject view", "the
 *       declared relation is never given a grade badge", and the same property
 *       re-asserted on the fully populated view. UI-4's own subject-view suite
 *       fails with it (1 of 33), which is two independent instruments on the
 *       one category error. Restored -> 104/104.
 *
 *   (b) THE DEC-8 SEAM — make the surface keep its own option map. Add
 *           return ["proxy_for"];
 *       as the first line of `intentOptionsFrom`. RESULT: 5 of 104 assertions
 *       FAILED — all three "the options are exactly the store's own set"
 *       assertions, the rendered chooser, and (downstream, because the stage
 *       vocabulary is now wrong) the progression commit control never appears.
 *       Restored -> 104/104. This is the arm that proves the options are not
 *       transcribed anywhere in app.html.
 *
 *   (c) REC-35's, ADDED 2026-08-04 with the publication — MAKE THE PUBLICATION
 *       AND THE ENFORCEMENT DISAGREE. In `bio-plane/src/store.mjs` restore the
 *       literal `static #ENTITY_KINDS = new Set([...])` and add one kind the
 *       catalogue does not publish (`"widget"`). RESULT: 1 of 106 assertions
 *       FAILED — "the subject-kind options are the store's own closed
 *       vocabulary, exactly" — and the plane's own affordances suite fails with
 *       it (2 of 46). Restored -> 106/106, store.mjs sha256-verified identical.
 *       THE INSTRUMENT FINDING, which is why this arm is worth its space: run
 *       against the FIRST version of this file's corrected second instrument —
 *       which parsed the arrays out of `affordances.mjs` — the same planted
 *       divergence left this suite entirely GREEN, because the surface reads
 *       the publication and the parser read the publication, so the two
 *       "independent" instruments had become one. The second instrument now
 *       asks the ENFORCING OPS, which is the only source that can disagree
 *       with the publication at all.
 */
import fs from "fs";
import vm from "vm";
import { webcrypto, createHash } from "crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* ---- the REAL plane, in miniflare. `miniflare` is bio-plane's dev dependency
   (this is the same instrument every plane suite uses); resolve it from there
   rather than duplicating a node_modules tree under civicos-ui. If it is not
   installed the harness FAILS rather than skipping: a suite that quietly stops
   testing its subject is the defect CLAUDE.md's negative-control rule exists to
   catch, and this one's whole point is that the write path is not mocked. */
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("intent-write: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/ (this suite drives the actual plane; the write path is never mocked).");
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
  bindings: { ADMIN_TOKEN: "adm-ui13", MEMBER_TOKEN: "mem-ui13", PROBE_TOKEN: "prb-ui13", VERSION: "test" },
});

/* Direct plane calls, for SEEDING and for INDEPENDENT verification only. The
   surface's own calls all go through the bridged fetch below. */
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok="mem-ui13") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method:"POST", body: JSON.stringify(body) })).json());
const get  = async (op, qs, tok="mem-ui13") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ---- seed captured documents with real readings, through the real promote
   path (the FW-5 projection into reading_refs), exactly as the plane's own
   progression suite seeds them. ---- */
const NOW = "2026-07-24T00:00:00Z";
let bseq = 0;
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "A procurement document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
async function seedDoc(captureSha, entities){
  const id = `INFO-2026-${String(++bseq).padStart(4,"0")}-ui13`;
  const md = bundleMd(id);
  const doc = { capture:{ sha256:captureSha, encoding:"binary", bytes:10 },
                reading:{ content_type:"meeting_calendar", reader_version:1, found:entities.length>0, at:NOW, entities } };
  const prov = JSON.stringify({ documents:[doc] });
  await post("promote", {
    bundleId:id, base:null, snapKey:"20260724T010000Z_aaaa1111", author:"ui13",
    meta:{ object_type:"information", group:"believe-in-oakland", title:`Doc ${id}`,
           current_state:"collected", created:NOW, last_updated:NOW },
    files:[ { path:"bundle.md", text:md, bytes:md.length, sha256:sha(md) },
            { path:"data/provenance.json", text:prov, bytes:prov.length, sha256:sha(prov) } ],
    register:[],
  });
  return id;
}
const SHA_A = sha("ui13-solicitation");   // names the contract by its own identifier -> grade A
const SHA_C = sha("ui13-award");          // names it by identifier AND by name -> A and C rows
const SHA_D = sha("ui13-contract");       // names nothing the registry knows -> unresolved, then testimony
const BID_A = await seedDoc(SHA_A, [{ ref:"contract:C-2024-88", kind:"contract", key:"C-2024-88", label:"the anticipated Recology contract" }]);
const BID_C = await seedDoc(SHA_C, [{ ref:"contract:C-2024-88", kind:"contract", key:"C-2024-88", label:"Recology award" },
                                    { ref:"contract:ZZ-0000",   kind:"contract", key:"ZZ-0000",   label:"Recology Hauling Contract" }]);
const BID_D = await seedDoc(SHA_D, [{ ref:"contract:QQ-9999", kind:"contract", key:"QQ-9999", label:"an unnamed hauling arrangement" }]);

/* ---- the store's OWN closed vocabularies, read out of the ENFORCING OPS'
   refusals by this file directly. The SECOND instrument on the DEC-8 property:
   whatever the surface offers must be exactly what the enforcer holds, and
   neither list is written in app.html.

   CORRECTED 2026-08-04 (REC-35), never exempted, and the correction is a real
   instrument change rather than a rename. This used to parse `Store.#ENTITY_KINDS`
   and its two siblings out of `store.mjs`'s private statics, which was right
   while the sets lived there. REC-35 published all three in `op=affordances`'
   `VOCABULARIES`, so the ONE array now lives in `bio-plane/src/affordances.mjs`
   and `store.mjs` derives its private statics from it (the DISPOSITIONS
   arrangement; the direction is forced, because store.mjs already imports
   affordances.mjs and the reverse would close an import cycle). The old parser
   did not merely go stale — it THREW `could not read Store.#ENTITY_KINDS`,
   which is the right behaviour for a pin whose subject moved and the reason it
   is corrected here rather than relaxed.

   WHY NOT SIMPLY REPOINT THE PARSER AT affordances.mjs, which was the first
   attempt and is WRONG: the surface now reads its options from the publication,
   and the publication IS that file, so the two instruments would share a source
   and be one instrument wearing two hats — an equality that costs nothing.
   MEASURED, not argued: with the parser repointed, a deliberate divergence
   planted in `store.mjs` (a kind the store admits and the catalogue does not
   publish) left this whole suite GREEN. Asking the ENFORCING OPS instead — the
   real plane, in miniflare, the same probe UI-13 used as its source and this
   file now uses as its check — makes the same divergence fail here. The plane's
   own `affordances.test.mjs` holds the publication to the same ops from the
   other side. ---- */
const oneOf = (detail) => {
  const m = /\bone of ([^.(]+)/.exec(String(detail||""));
  if(!m) throw new Error("the store's refusal no longer names its set: " + detail);
  return m[1].trim().split(/\s*,\s*/);
};
const STORE_ENTITY_KINDS   = oneOf((await post("entitycreate", {})).detail);
const STORE_RELATION_KINDS = oneOf((await post("relationdeclare", { relation:"__nope__" })).detail);
const STORE_REQUIREDNESS   = oneOf((await post("progressiondefine",
  { progressionKey:"ui13-vocab-probe", label:"ui13 vocab probe",
    stages:[{ key:"s1", cardinality:"1", required:"__nope__" }] })).detail);

/* ---- the DOM stub: enough for innerHTML inspection and for reading field
   values back, the shape UI-4's harness established. ---- */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
    remove(){}, onclick:null, onchange:null };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if(!els.has(s)) els.set(s, el()); return els.get(s); };
const html = (s) => $$(s)._html;

/* ---- the bridge: app.html's own fetch, answered by the real plane. Every op
   the surface reaches is recorded, so the suite can assert BY NAME that the
   nine were called from the surface and not from the test. ---- */
const CALLED = [];
async function bridgeFetch(u, opts){
  const url = new URL(u, "http://x");
  CALLED.push(url.searchParams.get("op"));
  return mf.dispatchFetch(url.toString(), opts);
}

const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:bridgeFetch };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE","INTENT_VOCAB","INTENT_SUBJ","INTENT_NEW","PROG",
  "renderSubjectView","renderSubjectNew","entityPreflight","entityCreateGo",
  "showEntity","lookupSubject","renderSubjectActs","aliasPreflight","aliasGo",
  "relationFindOther","relationPreflight","relationGo",
  "loadResolveCandidates","resolvePick","resolveGo","renderTestify","testifyPreflight","testifyGo",
  "connectPreflight","connectGo",
  "renderProgressions","progAddStage","progDefinePreflight","progDefineGo",
  "progLoad","progThreadPreflight","progThreadGo","dischargePreflight","dischargeGo",
  "loadIntentVocab","intentNarrationHtml",
].join(",") + "};", ctx);
const U = ctx.__U;

U.PLANE.token = "mem-ui13";
U.PLANE.session = true;
U.PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };

/* ============================================================
   1. THE OPTIONS COME FROM THE PLANE (DEC-8)
   ============================================================ */
console.log("\n--- the options and the requirements come from the plane, not from this file ---");
await U.renderSubjectView();
const AFTER_FIRST_RENDER = CALLED.slice();
const V = U.INTENT_VOCAB;
ok("the subject-kind options are the store's own closed vocabulary, exactly",
   JSON.stringify((V.sets.entity_kind||[]).slice().sort()) === JSON.stringify(STORE_ENTITY_KINDS.slice().sort()));
ok("the relation kinds offered are exactly the store's own set",
   JSON.stringify((V.sets.relation_kind||[]).slice().sort()) === JSON.stringify(STORE_RELATION_KINDS.slice().sort()));
ok("the stage-requiredness options are exactly the store's own set",
   JSON.stringify((V.sets.stage_required||[]).slice().sort()) === JSON.stringify(STORE_REQUIREDNESS.slice().sort()));
/* CORRECTED 2026-08-04 (REC-35), never exempted, and the correction is the
   delegation landing. This accepted EITHER source — "published, or the op's own
   refusal" — because when UI-13 shipped, the plane enforced these three sets and
   published none of them, so the refusal-harvest was the only arm that could
   run and pinning `published` would have failed. REC-35 publishes all three in
   `op=affordances`' VOCABULARIES, so arm 1 of `loadIntentVocab` now takes them
   and the disjunction has stopped measuring anything: it would pass unchanged
   if the publication silently disappeared and the surface fell back. Pinned to
   `published`, which is the property the delegation was asked for. */
ok("every one of those sets is read from the PUBLICATION — op=affordances, arm 1 (REC-35 landed)",
   V.source.entity_kind === "published" &&
   V.source.relation_kind === "published" &&
   V.source.stage_required === "published");
ok("op=affordances was asked FIRST, before any refusal was harvested", CALLED.includes("affordances"));
/* AND THE PROBE IS DEAD, which is the other half of the delegation and the half
   a source label cannot prove on its own. `loadIntentVocab`'s fallback arm asks
   the ENFORCING OP with a body the store refuses and parses the legal set out of
   the sentence; if it ran, the ops would appear here. Neither `relationdeclare`
   nor `progressiondefine` is reached by anything else on this screen, and
   `entitycreate` is reached exactly ONCE — by the entity pre-flight, which is a
   different mechanism (INTENT_HOLD request-shaping) and CONDUCT's standing
   ruling keeps it. A second `entitycreate` here would be the retired probe.
   ZERO SURFACE CHANGE is the point: not one executable byte of app.html moved
   for this: the fallback stayed exactly where UI-13 left it and simply stopped
   being reached, which is what "the day they appear, arm 1 takes them" meant. */
ok("the options probe is DEAD for all three: the vocabulary load reached no enforcing op",
   !AFTER_FIRST_RENDER.includes("relationdeclare") && !AFTER_FIRST_RENDER.includes("progressiondefine")
   && AFTER_FIRST_RENDER.filter(x=>x==="entitycreate").length === 1);
ok("and no refusal sentence was harvested for any of the three (the parse arm never ran)",
   V.words.entity_kind === "" && V.words.relation_kind === "" && V.words.stage_required === "");
ok("the kind chooser renders the plane's options", /ordinance/.test(html("#subj-new")) && /Contract/.test(html("#subj-new")));

/* ============================================================
   2. op=entitycreate — the pre-flight refuses in the plane's words, the commit
      control is ABSENT while it refuses, and a pre-flight writes NOTHING.
   ============================================================ */
console.log("\n--- op=entitycreate: pre-flight, then the entity with its alias ---");
ok("with nothing chosen, the commit control is ABSENT, not disabled", !/ent-go/.test(html("#ent-pf")));
ok("and the plane's own refusal is what stands in its place",
   /an entity needs a kind/.test(html("#ent-pf")) && /NO_KIND/.test(html("#ent-pf")));

$$("#ent-kind").value = "contract";
await U.entityPreflight();
ok("with the kind chosen and no name, the plane has stopped refusing the kind", !/NO_KIND/.test(html("#ent-pf")));
ok("the commit control is still ABSENT while the name is missing", !/ent-go/.test(html("#ent-pf")));

$$("#ent-label").value = "Recology Hauling Contract";
$$("#ent-aliases").value = "contract:C-2024-88";
await U.entityPreflight();
ok("with everything the plane asked for, the commit control appears", /ent-go/.test(html("#ent-pf")));

/* the pre-flight probes above ran the real ops; NOTHING may have been written */
const ghost = await get("entitybyalias", "alias=" + encodeURIComponent("Recology Hauling Contract"));
ok("a PRE-FLIGHT WRITES NOTHING — the subject is not in the registry until it is committed", ghost.count === 0);

await U.entityCreateGo();
const ENT = (U.INTENT_SUBJ.entity || {});
ok("op=entitycreate was called by the surface", CALLED.includes("entitycreate"));
ok("the subject is now in the registry, with the id the plane allocated", /^ENT-\d{4}-\d{4}$/.test(ENT.entity_id||""));
const byAlias = await get("entitybyalias", "alias=" + encodeURIComponent("contract:C-2024-88"));
ok("it answers to the alias the member gave at registration", byAlias.count === 1 && byAlias.entities[0].entity_id === ENT.entity_id);

/* ---- op=entityalias ---- */
$$("#alias-in").value = "Recology contract 2024";
await U.aliasPreflight();
ok("the alias control's commit appears once the plane's requirement is met", /alias-go/.test(html("#alias-pf")));
await U.aliasGo();
ok("op=entityalias was called by the surface", CALLED.includes("entityalias"));
const byNew = await get("entitybyalias", "alias=" + encodeURIComponent("Recology contract 2024"));
ok("the subject answers to the name that was added after the fact", byNew.count === 1);

/* ============================================================
   3. op=relationdeclare — justified, cited, and carrying NO GRADE.
   ============================================================ */
console.log("\n--- op=relationdeclare: constitutive, justified, cited, and ungraded ---");
/* the other end, registered through the same surface */
$$("#ent-kind").value = "office"; $$("#ent-label").value = "Office of the City Administrator";
$$("#ent-aliases").value = "";
await U.entityPreflight();
await U.entityCreateGo();
const OTHER = (U.INTENT_SUBJ.entity || {});
ok("a second subject is registered through the same control", OTHER.entity_id && OTHER.entity_id !== ENT.entity_id);

await U.showEntity(ENT.entity_id);
$$("#rel-kind").value = "proxy_for";
$$("#rel-other").value = "Office of the City Administrator";
await U.relationFindOther();
ok("the other end was found THROUGH THE PLANE, by name", CALLED.includes("entitybyalias"));
await U.relationPreflight();
ok("the plane refuses a relation with no justification, in its own words",
   /justification/.test(html("#rel-pf")) && /NO_JUSTIFICATION/.test(html("#rel-pf")));
ok("and the commit control is ABSENT while it refuses", !/rel-go/.test(html("#rel-pf")));
$$("#rel-just").value = "The contract is administered on the city's behalf by this office, which signs for it.";
await U.relationPreflight();
ok("with a justification and no citation, the plane refuses the NEXT thing, in its order",
   /NO_CITATION/.test(html("#rel-pf")) && !/rel-go/.test(html("#rel-pf")));
$$("#rel-cite").value = "Oakland Municipal Code 2.04.020";
await U.relationPreflight();
ok("with both, the pre-flight clears and the commit control appears", /rel-go/.test(html("#rel-pf")));
ok("no grade was ever asked for: the declare control offers no grade field",
   !/rel-grade/.test(html("#subj-acts")) && !/Grade [ABCD]/.test(html("#subj-acts")));
await U.relationGo();
ok("op=relationdeclare was called by the surface", CALLED.includes("relationdeclare"));
ok("the receipt says it is constitutive and gives it no grade",
   /constitutive/.test(html("#rel-pf")) && !/Grade [ABCD]/.test(html("#rel-pf")));

/* the load-bearing property, on the READ surface UI-4 owns */
const relSec = (/Declared relations<\/h2>([\s\S]*?)<\/section>/.exec(html("#subj-res"))||[])[1] || "";
ok("the declared relation is on the subject view", /proxy for/i.test(relSec));
ok("it carries its justification", relSec.includes("signs for it"));
ok("it carries its citation", relSec.includes("2.04.020"));
ok("THE NEGATIVE CONTROL'S SUBJECT: a declared relation carries NO A–D grade anywhere on the subject view",
   !/Grade [ABCD]/.test(relSec));
ok("the declared relation is never given a grade badge", !/subj-grade/.test(relSec));
/* and the plane agrees, structurally: the row it returns has no grade key */
const relRead = await get("entity", "id=" + ENT.entity_id);
const relRow = (relRead.entity.relations||[])[0] || {};
ok("the plane's own relation row has no grade FIELD at all — the table has no column",
   !("grade" in relRow) && !!relRow.justification && !!relRow.citation);

/* ============================================================
   4. op=resolve — the recogniser's own grades, a C flagged, never established.
   ============================================================ */
console.log("\n--- op=resolve: the record's grades, and a Grade C that never reads as established ---");
await U.loadResolveCandidates();
ok("the candidate documents came from the plane's reverse index", CALLED.includes("readingref"));
ok("the document that names this subject by its own identifier is offered", html("#res-cands").includes(BID_A));
ok("the list says plainly what it cannot look up", /only by a name in passing/.test(html("#res-cands")));
await U.resolvePick(SHA_A);
ok("with a document chosen, the resolve commit appears", /res-go/.test(html("#res-pf")));
await U.resolveGo();
ok("op=resolve was called by the surface", CALLED.includes("resolve"));
ok("the reference resolved at the record's own grade A, established",
   html("#res-pf").includes("Grade A · established"));
ok("the A resolution names HOW it was established", /Established by/.test(html("#res-pf")));

await U.resolvePick(SHA_C);
await U.resolveGo();
const resC = html("#res-pf");
ok("the same document's name-only reference resolved at Grade C", resC.includes("Grade C · unconfirmed"));
ok("a Grade C is NEVER shown as established", !resC.includes("Grade C · established"));
ok("the C says plausible, not established", /Plausible, not established/.test(resC));
ok("no D was minted by the machine anywhere in a resolve receipt", !/Grade D/.test(resC));

/* ============================================================
   5. op=resolvetestify — the ONLY path to a D, and the machine never mints one.
   ============================================================ */
console.log("\n--- op=resolvetestify: the only path to a Grade D ---");
await U.resolvePick(SHA_D);
await U.resolveGo();
ok("a reference matching nothing is left honestly unresolved, never force-matched",
   /not resolved/.test(html("#res-pf")) && !/Grade D/.test(html("#res-pf")));
ok("the testify control offers no grade to choose", !/tst-grade/.test(html("#testify-box")));
$$("#tst-ref").value = "contract:QQ-9999";
await U.testifyPreflight();
ok("the plane refuses testimony with no basis, in its own words",
   /NO_BASIS/.test(html("#tst-pf")) && /testimony/.test(html("#tst-pf")));
ok("and the commit control is ABSENT while it refuses", !/tst-go/.test(html("#tst-pf")));
$$("#tst-basis").value = "I was at the meeting where this arrangement was named as the Recology contract.";
await U.testifyPreflight();
ok("with a basis, the pre-flight clears and the commit appears", /tst-go/.test(html("#tst-pf")));
await U.testifyGo();
ok("op=resolvetestify was called by the surface", CALLED.includes("resolvetestify"));
ok("the testimony is recorded at Grade D and reads as asserted, not established",
   html("#tst-pf").includes("Grade D · unconfirmed") && /Asserted, not established/.test(html("#tst-pf")));
const resD = await get("resolutions", "sha256=" + SHA_D);
ok("the plane recorded the D with the member's basis and no captured basis",
   resD.resolutions.length === 1 && resD.resolutions[0].grade === "D" && !!resD.resolutions[0].basis);

/* ============================================================
   6. op=connect
   ============================================================ */
console.log("\n--- op=connect: the connections the record works out for itself ---");
await U.showEntity(ENT.entity_id);
await U.connectPreflight();
ok("the connect control's commit is present for an open subject", /conn-go/.test(html("#conn-pf")));
await U.connectGo();
ok("op=connect was called by the surface", CALLED.includes("connect"));
ok("the receipt states how many connections the record derived", /derived \d+ connection/.test(html("#conn-pf")));
const conns = await get("connections", "id=" + ENT.entity_id);
ok("the plane holds the derived connections, graded the weaker of each pair", conns.count >= 3);

/* ============================================================
   7. THE PROGRESSION SURFACE — define, thread, discharge.
   ============================================================ */
console.log("\n--- op=progressiondefine / op=thread / op=discharge ---");
await U.renderProgressions();
$$("#pg-key").value = "procurement";
$$("#pg-label").value = "How a purchase is supposed to go";
$$("#pg-st-0-key").value = "solicitation"; $$("#pg-st-0-label").value = "The solicitation";
$$("#pg-st-0-card").value = "1"; $$("#pg-st-0-req").value = "always";
$$("#pg-st-1-key").value = "award"; $$("#pg-st-1-label").value = "The award";
$$("#pg-st-1-card").value = "1"; $$("#pg-st-1-after").value = "solicitation";
await U.progDefinePreflight();
ok("the plane refuses a stage with no answer about whether it is expected",
   /BAD_REQUIRED/.test(html("#pg-pf")) && /always/.test(html("#pg-pf")));
ok("and the commit control is ABSENT while it refuses", !/pg-go/.test(html("#pg-pf")));
$$("#pg-st-1-req").value = "always";
await U.progAddStage();
$$("#pg-st-2-key").value = "contract"; $$("#pg-st-2-label").value = "The signed contract";
$$("#pg-st-2-card").value = "1"; $$("#pg-st-2-after").value = "award"; $$("#pg-st-2-req").value = "always";
await U.progDefinePreflight();
ok("with every stage answered, the commit control appears", /pg-go/.test(html("#pg-pf")));
const beforeDef = await get("progression", "key=procurement");
ok("a PRE-FLIGHT WROTE NO DEFINITION either", beforeDef.found === false);
await U.progDefineGo();
ok("op=progressiondefine was called by the surface", CALLED.includes("progressiondefine"));
ok("the receipt reports the stage count the plane recorded", /in 3 stages/.test(html("#pg-pf")));

$$("#pg-look-key").value = "procurement";
$$("#pg-look-subj").value = "Recology Hauling Contract";
await U.progLoad();
ok("op=progression and op=instance were read by the surface",
   CALLED.includes("progression") && CALLED.includes("instance"));
ok("with nothing threaded, the surface says the chain has no grade rather than inventing one",
   /Undetermined, and said so/.test(html("#pg-inst")));

$$("#pg-th-solicitation").value = SHA_A;
$$("#pg-th-award").value = SHA_D;
await U.progThreadPreflight();
ok("with placements the thread commit appears", /pg-th-go/.test(html("#pg-th-pf")));
await U.progThreadGo();
ok("op=thread was called by the surface", CALLED.includes("thread"));
const inst = await get("instance", "key=procurement&id=" + ENT.entity_id);
ok("the plane threaded both documents", inst.placed_count === 2);
ok("the instance's grade is the WEAKEST link along the chain (A with D -> D)", inst.grade === "D");
ok("the surface renders that grade through the honest badge, never as established",
   html("#pg-inst").includes("Grade D · unconfirmed") && !/Grade D · established/.test(html("#pg-inst")));
ok("the missing required stage is a finding the plane derived", inst.finding_count === 1);
ok("and the surface shows the signed contract stage as having nothing on the record",
   /The signed contract.*nothing on the record/.test(html("#pg-inst")));

/* a document that does NOT concern the subject cannot be threaded — the plane's
   rule and the plane's refusal, rendered, not computed here */
$$("#pg-th-contract").value = sha("a document about something else entirely");
await U.progThreadPreflight();
ok("threading a document that does not concern the subject is refused BY THE PLANE",
   /NOT_CONCERNED/.test(html("#pg-th-pf")) || /does not resolve/.test(html("#pg-th-pf")));
ok("and the commit control is ABSENT while it refuses", !/pg-th-go/.test(html("#pg-th-pf")));
$$("#pg-th-contract").value = "";
await U.progThreadPreflight();

/* ---- op=discharge ---- */
$$("#pg-dis-stage").value = "contract";
await U.dischargePreflight();
ok("the plane refuses an exception with no document", !/pg-dis-go/.test(html("#pg-dis-pf")));
$$("#pg-dis-doc").value = SHA_C;
$$("#pg-dis-reason").value = "";
await U.dischargePreflight();
ok("the plane refuses an exception with no reason, in its own words", /NO_REASON/.test(html("#pg-dis-pf")));
$$("#pg-dis-reason").value = "The council waived the signed-contract filing for emergency haulage.";
await U.dischargePreflight();
ok("then it refuses the missing citation, in its own order", /NO_CITATION/.test(html("#pg-dis-pf")));
$$("#pg-dis-cite").value = "Council Resolution 89412 C.M.S.";
await U.dischargePreflight();
ok("with the reason and the citation, the discharge commit appears", /pg-dis-go/.test(html("#pg-dis-pf")));
await U.dischargeGo();
ok("op=discharge was called by the surface", CALLED.includes("discharge"));
const inst2 = await get("instance", "key=procurement&id=" + ENT.entity_id);
ok("the plane now reports the skip as discharged rather than as a gap",
   inst2.finding_count === 0 && inst2.discharge_count === 1);
ok("and the surface shows the skip as lawful, with the reason and the citation",
   /missing, and lawfully so/.test(html("#pg-inst")) && /emergency haulage/.test(html("#pg-inst"))
   && /89412/.test(html("#pg-inst")));

/* ============================================================
   8. UI-4's SUBJECT VIEW NOW RENDERS NON-EMPTY FOR THAT ENTITY
   ============================================================ */
console.log("\n--- and UI-4's subject view, which had nothing to show before this item ---");
await U.renderSubjectView();
$$("#subj-q").value = "contract:C-2024-88";
await U.lookupSubject();
const view = html("#subj-res");
ok("the subject view renders non-empty for the entity this surface created", view.length > 400);
ok("it names the subject", view.includes("Recology Hauling Contract"));
ok("it shows the aliases", view.includes("Known as") && view.includes("Recology contract 2024"));
ok("it shows the declared relation", /Declared relations/.test(view) && /proxy for/i.test(view));
ok("it lists the documents that concern the subject", view.includes(BID_A) && view.includes(BID_C));
ok("it shows the derived connections", /Connections among these documents/.test(view) && /weaker/.test(view));
ok("nothing in the whole view shows a Grade C as established", !/Grade C · established/.test(view));
ok("nothing in the whole view shows a Grade D as established", !/Grade D · established/.test(view));
const relSec2 = (/Declared relations<\/h2>([\s\S]*?)<\/section>/.exec(view)||[])[1] || "";
ok("THE NEGATIVE CONTROL'S SUBJECT, again on a fully populated view: the relation still carries no grade",
   !/Grade [ABCD]/.test(relSec2));

/* ============================================================
   9. ALL NINE OPS WERE REACHED FROM THE SURFACE
   ============================================================ */
console.log("\n--- the nine ops, each with a call site ---");
for(const op of ["entitycreate","entityalias","relationdeclare","resolve","resolvetestify",
                 "connect","progressiondefine","thread","discharge"])
  ok(`op=${op} has a call site on a member surface and was reached from it`, CALLED.includes(op));

/* ============================================================
   10. Q12 — the read-only narration, and no control anywhere
   ============================================================ */
console.log("\n--- Q12: a credential that cannot write sees one sentence and no control ---");
U.PLANE.me = { member:"m_reader", handle:"reader", session:true, administer:false, capabilities:[] };
await U.renderSubjectView();
$$("#subj-q").value = "contract:C-2024-88";
await U.lookupSubject();
ok("a read-only credential is given ONE sentence, from what whoami answered",
   /reader is signed in with a credential that reads the record and does not add to it/.test(html("#content"))
   || /reads the record and does not add to it/.test(U.intentNarrationHtml()));
ok("and no register-a-subject control is rendered at all", html("#subj-new") === "");
ok("and no acts are rendered on the subject", html("#subj-acts") === "");
ok("but the read surface is unaffected — it still renders the subject in full",
   html("#subj-res").includes("Recology Hauling Contract"));
await U.renderProgressions();
ok("and the progression surface offers no definition control either", html("#prog-new") === "");
ok("nothing is greyed: there is no disabled control anywhere on either surface",
   !/disabled/.test(html("#content")) && !/disabled/.test(html("#subj-acts")));
U.PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };

if(fails.length){ console.error(`intent-write: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`intent-write: ${n} assertions, all green — nine intent ops with call sites, every option and refusal plane-sourced, commit absent while refused, a declared relation with no grade, a Grade C never established, and D only by testimony`);
process.exit(0);
