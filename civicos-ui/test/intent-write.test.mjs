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
 * UI-26 ADDED THE READ THIS FILE'S RESOLVE ARM RUNS ON, 2026-08-04. The control
 * called `op=readingref` ONCE PER REGISTERED NAME; it now makes ONE
 * `op=readingname` call with `entity=`, and the alias join is the plane's
 * (REC-36). Three properties are new here and each has its own arm below (d)-(f):
 * the N-call loop is GONE, asserted by counting; a NEAR-NAME candidate — §8.1's
 * grade-C tier — is offered from this control for the first time; and an
 * uninvited member's list OMITS an invisible document, because the plane
 * withholds the ROW and this surface filters nothing.
 *
 * AND THE ONE CORRECTION, never an exemption, because it was a real narrowing and
 * hiding it would have been the defect: `op=readingref` matched the REFERENCE
 * STRING, `op=readingname` matched THE NAME A READING RECORDED. So BID_A — whose
 * reference is spelled exactly like one of this subject's names but whose
 * recorded name carries none of them — was no longer offered, and the assertion
 * that it IS offered became an assertion that it is NOT, beside an assertion
 * that the page SAYS SO.
 *
 * REC-40 CLOSED THAT TRADE, 2026-08-05, AND THE PIN HAS NOW MOVED TWICE — which
 * is why the paragraph above is kept in the past tense rather than deleted. The
 * plane's term index carries all THREE of the strings its recogniser grades on,
 * each under its own source, so BID_A is offered again from the SAME single call
 * at the same §8.1 grade A, and the page's clause about a document known "by an
 * identifier and no name" is GONE because it stopped being true. Two things the
 * reversal did NOT undo, and both are asserted: the call count is still ONE, and
 * nothing here grades — the plane's `grade_if_resolved` is rendered as what
 * resolving WOULD record and never as a grade the document holds.
 *
 * THE IMPROVABILITY ARM MOVED WITH IT. Its point is that the bound is a bound on
 * THE LOOKUP and not on the record, so registering the name a reading actually
 * recorded brings a document within reach — DRIVEN, never claimed. BID_A stopped
 * being able to prove that the moment it was reachable from the start, so the arm
 * now drives BID_I, which nothing reaches until its recorded name is registered.
 * An arm whose subject has quietly become reachable is an arm passing for free.
 *
 * NEGATIVE CONTROL, eight arms, (a)-(c) RUN 2026-08-04 by UI-13/REC-35 and
 * (d)-(f) RUN 2026-08-04 by UI-26, each restored byte-identical (sha256
 * compared before and after each arm; UI-26's baselines are app.html
 * aa5bdc2f83e94f298cbff92838106773df1bb92e6ef877684194220d6688d0eb and this
 * file 0f6deb191645cebc89de4a2f4b4d4e09f3afc55a3b630fe77547f106c0eb36f6).
 * Arms (a) and (b)
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
 *
 *   (d) UI-26's FIRST — RESTORE THE PER-ALIAS LOOP. In app.html's
 *       `loadResolveCandidates`, put the old loop back in place of the single
 *       call: `const names = (e && e.aliases || []).map(a=>a.alias);` then
 *       `for(const n of names){ ... await recR("readingref", { ref:n }) ... }`.
 *       RESULT AT UI-26: **14 of 129 assertions FAILED**, and they NAME THE OP:
 *       "op=readingref is not called at all", "the candidate documents came
 *       from ONE call", "the whole control costs two calls" — plus the
 *       near-name candidate and BOTH correspondence renderings vanishing, the
 *       identifier bound inverting, the gate arm losing its subject in both
 *       directions, and all four COVERAGE assertions.
 *       RE-RUN 2026-08-05 (REC-40): **16 of 141**, and the arm has become the
 *       clearest statement of the trade this whole item is about, so the new
 *       reading is recorded rather than only the new number. WITH THE LOOP BACK,
 *       "THE IDENTIFIER TIER IS BACK" STILL PASSES while "A NEAR-NAME CANDIDATE
 *       IS OFFERED" FAILS — the loop reaches BID_A and loses BID_N, which is
 *       exactly the trade UI-26 measured, seen from the other side. The point of
 *       REC-40 is that the plane now answers BOTH from ONE call, so what the arm
 *       proves is no longer "the loop lost a tier" but "the loop is not how the
 *       tier came back", and the assertion that says so ("STILL ONE CALL") is
 *       among the sixteen.
 *       Restored -> 141/141, app.html sha256-verified identical
 *       (998f981eae59e8408767cf5a96216f2e74d418c75da303bd5e5608a221ea00e5).
 *
 *   (e) UI-26's SECOND — DROP THE NARROWED SENTENCE. In `loadResolveCandidates`
 *       cut everything in `note` after "plus the ones already resolved to it."
 *       so the list is offered with NO bound stated at all. RESULT AT UI-26:
 *       **6 of 129 assertions FAILED** — all four clauses of the measured bound,
 *       the never-implies-completeness clause, and the identifier bound the page
 *       had to say out loud.
 *       RE-RUN 2026-08-05 (REC-40): **7 of 141**, and the composition of the
 *       seven is the useful part. The clause naming the THREE places the lookup
 *       reaches SURVIVES the cut, because REC-40 put the widening structurally
 *       BEFORE the cut point rather than in the trailing caveat — so what the
 *       arm now removes is the BOUND and never the widening, which is the right
 *       way round: a page may lose its caveat and must not lose the sentence
 *       that says what it did. The two new failures are the remaining bound and
 *       "nothing here is settled".
 *       AND THE FINDING, kept because it is the whole reason this arm exists:
 *       the assertion that FORBIDS completeness WORDS ("every document", "all
 *       the documents", "complete") STAYED GREEN over the stripped sentence.
 *       An unstated bound uses no completeness word and reads as completeness
 *       anyway, so a suite that policed the vocabulary would have called the
 *       stripped sentence correct. Only the clause-by-clause assertions catch
 *       it, which is why the bound is asserted as four separate claims and not
 *       as one string (UI-21's lesson at a new altitude).
 *       Restored -> 129/129, app.html sha256-verified identical.
 *
 *   (f) UI-26's THIRD, over the INSTRUMENT rather than the subject — can the
 *       gate arm reach its subject at all? In this file, drive the second
 *       `asMember(...)` with `CAROL` instead of `DAVE`, so the "uninvited"
 *       list is the invited one. RESULT: **2 of 125 assertions FAILED** (run
 *       with UI26_PROBE_CHILD=1, so the coverage arm does not spawn a child) —
 *       "DAVE, NEVER INVITED, IS NOT" and "it is absent as a document, not as a
 *       nameless row". The arm reaches its subject; a sweep that cannot is not
 *       a sweep (UI-21's finding, applied before it could cost anything).
 *       Restored -> 125/125, this file sha256-verified identical.
 *
 *   (g) REC-40's, 2026-08-05, AND IT IS A PLANE ARM DRIVEN FROM THE SURFACE —
 *       DROP THE REF-TERM SOURCE. In `bio-plane/src/store.mjs`, make
 *       `Store.#refTermSources` return the label alone (`if (label) return
 *       [["label", label]];` as its first line), so the plane's index carries
 *       what REC-36 shipped and nothing more. RESULT: **6 of 141 assertions
 *       FAILED** — the identifier tier is not offered, the reference phrasing is
 *       not rendered, the conditional grade line is not rendered, and the plane's
 *       own answer stops carrying an A beside the C for the two-reference
 *       document — WHILE EVERY NAME-TIER ASSERTION STAYS GREEN, including the
 *       near-name candidate and both weaker-correspondence renderings. The
 *       plane's own suite fails with it at 11 of 71, two independent instruments
 *       on one subject, and the pair is what shows the two tiers are independent
 *       rather than one thing renamed.
 *       Restored -> 141/141, store.mjs sha256-verified identical
 *       (558d2e2d0575276153fb3b232fc71b02b55f7c9a027cc3e41285506f173b6879).
 *       RE-RUN 2026-08-05 against REC-40's final store.mjs: unchanged at 6.
 *
 *   (h) REC-40's SECOND, AND IT IS RECORDED HERE BECAUSE THIS FILE STAYS GREEN
 *       UNDER IT — DERIVE THE CANDIDATE'S GRADE FROM THE CORRESPONDENCE. In
 *       `bio-plane/src/store.mjs` replace `const gradeIf =
 *       tier.hits.includes(entityId) ? tier.grade : null;` with `const gradeIf =
 *       whole ? (r.src === "ref" ? "A" : r.src === "key" ? "B" : "C") : null;`.
 *       RESULT: **0 of 141 here**, and 2 of 76 in the plane's own suite. That is
 *       the finding, not a gap: the surface renders whatever letter the plane
 *       hands it and CANNOT TELL a true conditional from a false one, so a
 *       promise the record would never keep is invisible from here. Any
 *       assertion about whether a grade is EARNED has to live on the plane side;
 *       what this file can honestly assert is that the letter is rendered as a
 *       conditional and never as a grade held, which it does.
 */
import fs from "fs";
import os from "os";
import path from "path";
import vm from "vm";
import { execFileSync } from "child_process";
import { webcrypto, createHash } from "crypto";
import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { appScript } from "./extract.mjs";

/* UI-26. This file re-runs ITSELF under the envelope guard's own probe to
   measure arm B's coverage (section 4c). The child does the driving and skips
   the arm that would spawn another one — auth-surface.test.mjs's precedent. */
const SELF = fileURLToPath(import.meta.url);
const CHILD = process.env.UI26_PROBE_CHILD || "";

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
/* UI-26 gave this a TYPE. A project bundle is the only way to file a capture
   somewhere a member has not been invited, which is what the gate arm is
   about; every existing caller passes nothing and gets the information bundle
   it always got, byte for byte. */
const bundleMd = (id, type = "information") => [
  "---", `id: ${id}`, `object_type: ${type}`, `schema: ${type}@1`,
  `title: "Doc ${id}"`, `current_state: ${type === "project" ? "forming" : "collected"}`, "prior_state: null",
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
async function seedDoc(captureSha, entities, { type = "information", tok = "mem-ui13" } = {}){
  const id = `${type === "project" ? "PROJ" : "INFO"}-2026-${String(++bseq).padStart(4,"0")}-ui13`;
  const md = bundleMd(id, type);
  const doc = { capture:{ sha256:captureSha, encoding:"binary", bytes:10 },
                reading:{ content_type:"meeting_calendar", reader_version:1, found:entities.length>0, at:NOW, entities } };
  const prov = JSON.stringify({ documents:[doc] });
  const r = await post("promote", {
    bundleId:id, base:null, snapKey:"20260724T010000Z_aaaa1111", author:"ui13",
    meta:{ object_type:type, group:"believe-in-oakland", title:`Doc ${id}`,
           current_state: type === "project" ? "forming" : "collected", created:NOW, last_updated:NOW },
    files:[ { path:"bundle.md", text:md, bytes:md.length, sha256:sha(md) },
            { path:"data/provenance.json", text:prov, bytes:prov.length, sha256:sha(prov) } ],
    register:[],
  }, tok);
  if(r && r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  return id;
}

/* ---- UI-26: REAL ENROLLED MEMBERS, because op=readingname is GATED and a
   class token cannot show a gate. 4.2/4.3 require the first two roster members
   to be administrators; CAROL then owns a project (her session promotes it, so
   the plane stamps her the owner) and DAVE is the member never invited to it.
   This is readingname.test.mjs's own arrangement, on the surface side. ---- */
const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:caps }, "adm-ui13");
  if(!add || !add.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await post("enroll", { invite:add.invite, handle:id, password:`${id}-passphrase-1` });
  if(!en || !en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role:`member:${id}`, password:`${id}-passphrase-1` });
  if(!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await member("ruth", ["contribute"], "admin");
await member("gus",  ["contribute"], "admin");
const CAROL = await member("carol", ["contribute", "create_projects"]);
const DAVE  = await member("dave",  ["contribute"]);

const SHA_A = sha("ui13-solicitation");   // names the contract by its own identifier -> grade A
const SHA_C = sha("ui13-award");          // names it by identifier AND by name -> A and C rows
const SHA_D = sha("ui13-contract");       // names nothing the registry knows -> unresolved, then testimony
/* UI-26's two additions. SHA_N is the GRADE-C TIER this control could not offer
   before REC-36: the subject's name sits INSIDE a longer recorded name, with the
   case and the punctuation varying, which is exactly what MEASUREMENTS.md
   2026-08-04 measured as the ordinary case (a subject name was the whole
   recorded name in 0 of 41). SHA_S is the same tier filed inside CAROL's
   project, which DAVE is never invited to. */
const SHA_N = sha("ui13-amendment");      // the name INSIDE a longer one -> the grade-C tier
const SHA_S = sha("ui13-secret");         // the same tier, filed where dave cannot look
const BID_A = await seedDoc(SHA_A, [{ ref:"contract:C-2024-88", kind:"contract", key:"C-2024-88", label:"the anticipated Recology contract" }]);
const BID_C = await seedDoc(SHA_C, [{ ref:"contract:C-2024-88", kind:"contract", key:"C-2024-88", label:"Recology award" },
                                    { ref:"contract:ZZ-0000",   kind:"contract", key:"ZZ-0000",   label:"Recology Hauling Contract" }]);
const BID_D = await seedDoc(SHA_D, [{ ref:"contract:QQ-9999", kind:"contract", key:"QQ-9999", label:"an unnamed hauling arrangement" }]);
const BID_N = await seedDoc(SHA_N, [{ ref:"contract:ZZ-0001", kind:"contract", key:"ZZ-0001",
                                      label:"Amendment To The Recology Hauling Contract, Second" }]);
const BID_S = await seedDoc(SHA_S, [{ ref:"contract:ZZ-0002", kind:"contract", key:"ZZ-0002",
                                      label:"Settlement Under The Recology Hauling Contract" }],
                            { type:"project", tok:CAROL });
/* REC-40's, 2026-08-05. The improvability arm below needs a document that NO
   registered name reaches YET — and BID_A stopped being one, because REC-40 put
   the identifier tier back into the same call and BID_A is offered from the
   start again. Keeping BID_A as that arm's subject would have left it passing
   while proving nothing, which is the failure mode the arm was written against.
   This document is reachable by neither name nor reference until a member
   registers the name its reading actually recorded. */
const SHA_I = sha("ui13-zerowaste");
const BID_I = await seedDoc(SHA_I, [{ ref:"contract:ZZ-0003", kind:"contract", key:"ZZ-0003",
                                      label:"Zero Waste Collection Services Agreement" }]);

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
const beforeCands = CALLED.length;
await U.loadResolveCandidates();
const candCalls = CALLED.slice(beforeCands);
const cands = html("#res-cands");

/* UI-26. THE N-CALL LOOP IS GONE, and this is the assertion that says so rather
   than a comment claiming it: the surface used to call op=readingref ONCE PER
   REGISTERED NAME, and this subject has three. */
ok("the candidate documents came from ONE call to the plane's name index",
   candCalls.filter(o => o === "readingname").length === 1);
ok("THE N-CALL LOOP IS GONE: op=readingref is not called at all, by this or any other handler",
   !CALLED.includes("readingref"));
ok("and the only other read is the already-resolved one, so the whole control costs two calls",
   candCalls.filter(o => o !== "readingname" && o !== "concerns").length === 0);

/* THE TIER THIS CONTROL COULD NOT OFFER BEFORE: the subject's name inside a
   longer recorded one, which MEASUREMENTS.md 2026-08-04 measured as the ordinary
   case (0 of 41 recorded names WERE a subject name; 15 of them contained one). */
ok("A NEAR-NAME CANDIDATE IS OFFERED — the grade-C tier, reachable from this control for the first time",
   cands.includes(BID_N));
ok("and it is offered as the WEAKER correspondence, saying whose name it carries",
   /carries this subject&rsquo;s name/.test(cands));
/* CORRECTED 2026-08-05 (REC-40), never exempted, and the correction is a real
   weakening of what this line could see, made visible rather than hidden. It
   used to read `cands.includes(BID_C) && /which is this subject's name/` — and
   BID_C carries TWO references, one whose recorded name IS this subject's name
   (the C tier) and one whose reference string is (the A tier). The surface shows
   ONE row per document at the strongest correspondence, so BID_C now renders as
   the A tier and the C tier is no longer visible in this HTML at all. The regex
   would still have passed, on the A row's identical phrase, which is a pin
   agreeing for a reason it was not written for. Split in two: the surface's
   dedup asserted here, and the C tier asserted where it still exists — in the
   plane's own answer. Neither is a claim about which tier is right. */
ok("the document whose recorded name IS this subject's name is offered", cands.includes(BID_C));
{
  const ans = await get("readingname", "entity=" + ENT.entity_id);
  const rows = (ans.documents || []).filter(d => d.capture_sha === SHA_C);
  ok("THE C TIER DID NOT VANISH — the plane still answers it for that document's other reference",
     rows.some(d => d.correspondence === "name" && d.grade_if_resolved === "C"));
  ok("and the A tier is answered beside it for the same document, from the ONE call",
     rows.some(d => d.correspondence === "reference" && d.grade_if_resolved === "A"));
  ok("the surface shows that document once, at the strongest of them — a member is not offered it twice",
     rows.length === 2 && (cands.match(new RegExp(SHA_C, "g")) || []).length <= 1);
}
ok("a document naming nothing the registry knows is not offered", !cands.includes(BID_D));

/* CORRECTED 2026-08-05 (REC-40), never exempted, AND THE CORRECTION IS AN
   INVERSION OF A CORRECTION — the history is kept above deliberately, because a
   pin that has now moved twice is the most useful thing in this block.

   UI-13 asserted BID_A — whose REFERENCE STRING is spelled exactly like one of
   this subject's names — IS offered, and was right while the control called
   op=readingref. UI-26 inverted it to IS NOT and was right for one day: the one
   call it replaced the loop with indexed the recorded NAME alone, so the
   identifier tier went out of reach and the page said so. REC-40 put every tier
   into that one index, so BID_A is offered again — from the SAME single call, at
   the SAME §8.1 grade A, with no loop anywhere. The narrowing UI-26 measured is
   closed, and what makes this a correction rather than a revert is that the
   assertions below now name the TIER and the CONDITIONAL grade, which the
   original had no vocabulary for. */
ok("REC-40: THE IDENTIFIER TIER IS BACK — a document known by its reference alone is offered again",
   cands.includes(BID_A));
ok("and it says the SOURCE'S OWN REFERENCE is what carried the name, not a recorded title",
   /carries the reference &ldquo;contract:C-2024-88&rdquo;, which is this subject&rsquo;s name/.test(cands));
ok("STILL ONE CALL: the tier came back through the index, not by putting the per-name loop back",
   candCalls.filter(o => o === "readingname").length === 1 && !CALLED.includes("readingref"));
/* NOTHING IS GRADED BY BEING OFFERED, and this is where that is easiest to get
   wrong now that a candidate can carry a letter. The page says what resolving
   WOULD record, in those words, and never that the document has it. */
ok("the grade is rendered as a CONDITIONAL about a run that has not happened",
   /resolving it would record Grade A/.test(cands));
ok("and no candidate is shown wearing a grade badge, because none of them has been resolved",
   !/subj-grade/.test(cands));
/* AND THE WEAKER TIERS CARRY NO LETTER AT ALL. An absent grade is not a low
   grade: BID_N's name sits inside a longer recorded one, which the recogniser
   does not match, so inventing a letter for it would be the overclaim. */
ok("a name sitting inside a longer one is offered with NO grade, not with a weak one",
   !/carries this subject&rsquo;s name &ldquo;[^&]*&rdquo; &mdash; resolving/.test(cands));

/* THE NOTE RE-WIDENED WITH THE PLANE, and the clause that stopped being true is
   GONE rather than left standing. UI-26's page told a member that a document
   known by an identifier and no name was out of reach; that sentence would now
   be REACHED WHILE FALSE, which is worse than the narrow list it described. */
ok("the clause UI-26 had to write is gone — the plane stopped being bounded that way",
   !/by an identifier and no name at all, is not here/.test(cands));
ok("and the note states the THREE places the lookup now reaches, so the widening is stated not silent",
   /the reference the source itself assigned/.test(cands) && /that reference&rsquo;s key/.test(cands)
   && /the name the reading recorded/.test(cands));
ok("the remaining bound is stated in the member's own terms, and it is the one that is actually left",
   /recorded in none of those three places/.test(cands));
ok("and the page still says plainly that nothing here is settled",
   /candidates for you to confirm/.test(cands));

/* THE NARROWED SENTENCE. Asserted as its FOUR SEPARATE CLAIMS and not as one
   string, because UI-21's finding was that a wording check passes over a
   sentence that has quietly stopped being true. Each of these is a fact
   MEASUREMENTS.md 2026-08-04 settled, and if the plane's bound moves, the one
   that moved is the one that fails here. */
ok("the old sentence is GONE — it stopped being true of the plane the day REC-36 landed",
   !/only by a name in passing/.test(cands));
ok("the narrowed sentence states the normalisation: capitalisation and punctuation are ignored",
   /ignores capitalisation and punctuation/.test(cands));
ok("it states the ALIAS JOIN, and why it is the only thing that reaches an abbreviation",
   /tries every name this subject is registered under/.test(cands) && /abbreviation/.test(cands));
ok("it states that ACCENTS ARE NOT FOLDED, which is the deliberate conservative direction",
   /not<\/b> ignore accents/.test(cands) && /Prot&eacute;g&eacute;/.test(cands));
ok("AND IT NEVER IMPLIES COMPLETENESS: an absence is said to say nothing about what exists",
   /says anything about whether such a document exists/.test(cands));
ok("nothing in the note claims the list is everything the record holds",
   !/every document/i.test(cands) && !/all the documents/i.test(cands) && !/complete/i.test(cands));

/* AND THE BOUND IS A BOUND ON THE LOOKUP, NOT ON THE RECORD. That distinction is
   the whole reason the sentence above is worth writing, and it is DRIVEN here
   rather than asserted: register the name the reading actually recorded, and the
   document the lookup could not reach is offered — at the same Grade A it always
   deserved, because the grade comes from the reference the plane reads out of the
   document and never from how the member found it. This is the improvability
   doctrine `loadResolveCandidates` has always carried in a comment, made
   reachable from the control for the first time. */
/* CORRECTED 2026-08-05 (REC-40), never exempted. The subject MOVED, and that is
   the correction: this arm registered "anticipated Recology contract" and proved
   BID_A came within reach, which was real while BID_A was out of reach. REC-40
   put it back through the identifier tier, so the same arm would now have passed
   over a document that was already there — an assertion agreeing for free. BID_I
   is reachable by nothing until its recorded name is registered, so the property
   the arm exists for is intact and the arm still bites. */
ok("PRECONDITION: the document is reached by no registered name and no reference yet",
   !cands.includes(BID_I));
$$("#alias-in").value = "Zero Waste Collection";
await U.aliasPreflight();
await U.aliasGo();
const beforeWiden = CALLED.length;
await U.loadResolveCandidates();
const widenCalls = CALLED.slice(beforeWiden);
const widened = html("#res-cands");
ok("registering the name a reading recorded brings the document it names within reach",
   widened.includes(BID_I));
ok("and a FOURTH name costs no extra call: the alias join is the plane's, not a loop here",
   widenCalls.filter(o => o === "readingname").length === 1 && !widenCalls.includes("readingref"));

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

/* ------------------------------------------------------------------
   4b. UI-26 — THE GATE. The op withholds the ROW; the surface renders what it
   was answered and filters nothing.
   ------------------------------------------------------------------ */
console.log("\n--- an uninvited member's candidate list OMITS the invisible document ---");
const asMember = async (tok) => { U.PLANE.token = tok; await U.loadResolveCandidates(); return html("#res-cands"); };
const carolSees = await asMember(CAROL);
const daveSees  = await asMember(DAVE);
U.PLANE.token = "mem-ui13";
ok("carol, who owns the project the capture is filed in, is offered it", carolSees.includes(BID_S));
ok("DAVE, NEVER INVITED, IS NOT — the document is absent from his list entirely", !daveSees.includes(BID_S));
ok("and it is absent as a document, not as a nameless row: no capture of it is offered either",
   !daveSees.includes(SHA_S));
ok("dave is still offered the shared near-name document, so the empty space is the GATE and not an empty read",
   daveSees.includes(BID_N));
ok("nothing tells dave that something was withheld — the count that would leak is never rendered",
   !/withheld/i.test(daveSees) && !/not shown/i.test(daveSees));

/* ------------------------------------------------------------------
   4c. UI-26 — THE ARM-B COVERAGE LINE, MEASURED.
   ------------------------------------------------------------------
   UI-26's accepts-when is that the envelope guard's arm B now covers
   op=readingname. Arm B is only as wide as the harness, so "covers" means: when
   this suite runs under the guard's probe, the probe SEES the op and sees it
   WRAPPED. That is measured here by re-running this file under
   `test/envelope-probe.mjs` — the guard's own instrument, loaded the guard's own
   way — rather than by reading a number off a log, which is a claim about a log.
   The line MOVED in both directions and both are asserted: readingname joined it
   and readingref left it, and the second half is what would catch a restored
   loop that somebody left running beside the new call. */
if(!CHILD){
  const probe = new URL("./envelope-probe.mjs", import.meta.url).pathname;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui26-probe-"));
  const out = path.join(dir, "probe.json");
  let ran = true;
  try{
    execFileSync("node", ["--import", "file://" + probe, SELF],
      { stdio:"pipe", env:{ ...process.env, UI_ENVELOPE_PROBE_OUT: out, UI26_PROBE_CHILD:"1" } });
  }catch(_){ ran = false; }
  let data = { calls:0, ops:[] };
  try{ data = JSON.parse(fs.readFileSync(out, "utf8")); }catch(_){}
  try{ fs.rmSync(dir, { recursive:true, force:true }); }catch(_){}
  const row = id => (data.ops||[]).find(o => o.op === id) || null;
  ok("COVERAGE: this suite runs clean under the guard's own probe", ran);
  ok("COVERAGE: the probe observed op=readingname — arm B's line MOVED to include it",
     !!row("readingname") && (row("readingname").wrapped + row("readingname").flat) > 0);
  ok("COVERAGE: it is answered WRAPPED, which is what arm B judges it against",
     !!row("readingname") && row("readingname").flat === 0);
  ok("COVERAGE: op=readingref LEFT the line — the one suite that ever drove it no longer answers it at all",
     !row("readingref"));
}

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
console.log(`intent-write: ${n} assertions, all green — nine intent ops with call sites, every option and refusal plane-sourced, commit absent while refused, a declared relation with no grade, a Grade C never established, D only by testimony · and UI-26: ONE op=readingname call where a per-name loop was, the grade-C near-name tier offered for the first time, the measured bound stated in four clauses, an uninvited member's list omitting the invisible document, and arm B's coverage line measured at the guard's own probe · and REC-40: the identifier tier back in that SAME one call, the grade rendered as what resolving WOULD record and never as a grade held, the narrowed sentence re-widened to the three places the lookup reaches, and the improvability arm re-pointed at a document nothing reaches yet`);
process.exit(0);
