/* UI-74 — THE ACCEPT CEREMONY, DRIVEN AGAINST THE REAL PLANE.
 *
 * `INVESTIGATIVE-SESSION.md` §12 (a)–(b): the member AFFIRMS, per set of reasons,
 * that each carries the answer on its own before their name lands over a reading
 * filed as several such sets (DEC-32 clause 4); and D-195's shared upstream origin
 * — DERIVED by the plane (`Store#independenceOf`, published on
 * `op=partitionindependence`'s version arm as `independence`, UI-88) — is SHOWN before that affirmation and
 * never refuses anything. UI-43's stranded branch (`9706d19e`) is the scope this
 * was re-derived from; it drove a MOCK plane and read `independence` 0×. This
 * suite drives the plane itself under miniflare: every answer the surface renders
 * came over the wire from `bio-plane/src/index.mjs`, and every write is read BACK
 * from the record rather than from the act's own answer.
 *
 * WHAT IT IS JUDGED ON (the row's accepts-when), each its own section:
 *   (1) AN OR ACCEPT REQUIRES THE PER-SET AFFIRMATION — the send control is
 *       ABSENT until every set is affirmed, `acerSend` writes nothing when driven
 *       with one outstanding, the plane's own third defence is measured, and the
 *       accept that lands carries the affirmation INTO THE RECORD (`affirmed`).
 *   (2) A READING WHOSE TWO SETS SHARE A CAPTURE SHOWS THAT ORIGIN BEFORE THE
 *       AFFIRMATION — named by set and by the captured copy's fingerprint — and
 *       the affirmation and the accept still go through (never refuses).
 *   (3) A READING WITH INDEPENDENT SETS SHOWS NONE — no shared origin is drawn,
 *       and the page says the record traced and found none, within its reach.
 *   (4) THE ORDERING RULE (DEC-32 clause 5) — UI-88: before the affirmation the
 *       ceremony's network log holds NO strength-bearing answer (the origins read
 *       is the independence-only read, REC-192), and nothing strength-bearing is
 *       held or drawn. Until UI-88 the pair crossed the wire and was dropped
 *       client-side; BOB #31 (2026-09-23 22:22Z) ruled that separation structural
 *       at the wire, so the log itself is now the evidence.
 *   (5) the one-set reading asks nothing; (6) REC-36's withholding; (7) DEC-46's
 *       lens in the flow; (8) refusals in the plane's words; (9) the analyst
 *       vocabulary sweep over every phase, and the record's own set labels in NO
 *       markup (they travel only in `affirmed=` on the wire).
 *
 * CONTROLS ARE CLICKED OUT OF THE RENDERED MARKUP: the `onclick` the surface
 * wrote is pulled from the HTML and run in the page's scope, so "the control is
 * rendered" and "the act happens" are one link, not two facts.
 *
 * WHAT THIS SUITE CAN AND CANNOT SEE:
 *   IT CAN see every string rendered in every phase it drives, every request the
 *     surface made with its parameters, and the record's state read back.
 *   IT CANNOT fire `hashchange` (the DOM stub fires no events); section 10 drives
 *     the router directly at an address — a SUBSTITUTE, labelled.
 *   IT CANNOT produce a lens that MOVED: the run it opens carries no bias
 *     manifest, so the plane answers `in_force:false` and the moved/unmoved
 *     three-valued verdict is not driven here — only that the lens card renders
 *     in the flow, above the chooser, in the plane's own words.
 *   IT DRIVES a shared ADDRESS only (two captures fetched from one place). A
 *     shared document or captured copy is classified in `acerOriginWords` and not
 *     driven: `register` keys on the capture, so one capture cannot sit under two
 *     documents, and one document in two sets is a fixture this suite did not write.
 *   IT CANNOT judge whether the derivation is right — that is
 *     `bio-plane/test/independence.test.mjs`'s subject.
 *
 * NEGATIVE CONTROL: RUN 2026-09-23 by UI-74 — `node civicos-ui/test/accept-ceremony.control.mjs`,
 * exit 0, CONTROL CLEAN. BASELINE 85/85. Each arm ALONE on the real app.html, restored and verified by
 * sha256 AND cmp (final 46ac2f5f… IDENTICAL to baseline, floor 500,000 bytes):
 *   A drop the affirmation at the page (`acerAffirmedAll` -> true): 5 FAIL, incl. "THE KEYSTONE: THE SEND
 *     CONTROL IS ABSENT" and "THE KEYSTONE, SECOND DEFENCE"; the accept still lands only because the plane's
 *     own D-271 refusal is the third defence.
 *   B drop the affirmation on the wire (no `affirmed=`): 9 FAIL, incl. "THE ACCEPT LANDS" and "AND THE
 *     AFFIRMATION IS IN THE RECORD" — the real plane refuses the accept; the page's gate arms stay green.
 *   C hide the field at the render (`acerOriginsHtml` -> ""): 6 FAIL, every D-195 SHARED arm and the
 *     traced-none arm; "D-195 INDEPENDENT SHOWS NONE" stays green (drawing nothing is not drawing a share).
 *   D hide the field at the read (`independence` dropped): 6 FAIL, the same six, the page saying NOT TOLD.
 *   E keep the pair from the origins read: 2 FAIL, the two NOT HELD arms. FIRST RUN: 1 of 2 — the shared
 *     section's arm sat AFTER `acerChoose`, which clears `strength`, so it could not fail; moved to arrival.
 *   F report a share whenever there are two sets: 3 FAIL, incl. "D-195 INDEPENDENT SHOWS NONE".
 *   G OVER-STRICTNESS, `acerAffirmedAll` as an indexed loop: 85/85, MUST PASS, passed.
 * NEGATIVE CONTROL (UI-88): RE-RUN 2026-09-25 by WORKER UI-88 — same driver, exit 0, CONTROL CLEAN, 8 arms.
 * BASELINE 90/90 (app.html 1,598,499 bytes, sha256 31ee13e5cdb0…, final IDENTICAL by sha256 AND cmp).
 *   H THE ROW'S NAMED ARM, `acerOriginsRead` pointed back at `op=versionstrength` verbatim as before UI-88:
 *     85/90, FAILS both "PRE-AFFIRMATION FETCH" arms (each naming the versionstrength answer and its keys
 *     pair, state_set, what_if, … — checked by hand, so the arm fails on the STRENGTH and not only on the op),
 *     "the origins read is the independence-only read", "the arithmetic is not asked before any act" and
 *     "ORDERING, SECOND HALF", AS DECLARED; "nothing strength-bearing is HELD" STAYS GREEN, as declared —
 *     the old client-side drop kept the page's state clean, which is why only the network log can see it.
 *   A–G re-run on the corrected suite, each as declared: A 85/5, B 81/9, C 84/6, D 84/6, E 88/2 (E
 *     re-labelled: no pair is fetched to keep, so it stores the origins answer in the strength slot), F 87/3,
 *     G 90/0.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. Imported for its SIDE EFFECT; census:
   `stdio-census.test.mjs`. */
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";
import { analystHits, reachLine } from "./analyst-vocabulary.mjs";
/* REC-171: a deploy token's questions are surfaced inside a run it holds — the
   plane estate's ONE helper, imported rather than copied. */
import { withSurfacingRun } from "../../bio-plane/test/surfacing-run.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* ---- the real plane. If miniflare is absent the suite FAILS, never skips. ---- */
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("accept-ceremony: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/ (this suite drives the actual plane; nothing here is mocked).");
  console.error("  " + String(e && e.message || e));
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui74", MEMBER_TOKEN: "mem-ui74", PROBE_TOKEN: "prb-ui74", VERSION: "test",
              /* A store records its producing group at first boot from the slug the installer binds
                 (D-436, IC-172); deliberately no real group's. */
              INSTANCE_NAME: "fixture-group" },
}));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

/* ============================================================
   0. THE GROUND — real members, real documents with real captures, one question
   ============================================================ */
console.log("\n--- 0. the ground: a real plane, real members, one question with five readings ---");

const enrol = async (memberId, password, role) => {
  const add = rP(await POST("op=memberadd&token=adm-ui74",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: ["contribute"] }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* Membership Architecture 4.2: the first two invitations create administrators,
   so the ordinary member who accepts here, holding only `contribute`, is third. */
await enrol("nadia", "nadia-passphrase-1", "admin");
await enrol("omar", "omar-passphrase-1", "admin");
const PILAR = await enrol("pilar", "pilar-passphrase-1", "member");

const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";

/* THE FIVE DOCUMENTS, each with its own capture. `AUDIT` and `MIRROR` are two
   DIFFERENT documents with two DIFFERENT captures retrieved from ONE address —
   the shared origin the plane must DERIVE (independence.test.mjs's own subject
   shape). `register` keys on the capture, so one capture cannot belong to two
   documents; the address is how two copies of one upstream thing meet. */
const LEDGER = "INFO-2026-7400-ledger", MINUTES = "INFO-2026-7400-minutes";
const AUDIT = "INFO-2026-7400-audit", MIRROR = "INFO-2026-7400-mirror";
const MEMO = "INFO-2026-7400-memo";
const DOCS = [LEDGER, MINUTES, AUDIT, MIRROR, MEMO];
const captureOf = (d) => sha(`capture-of-${d}`);
const SHARED_ADDR = "https://example.gov/audit-2026.pdf";

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Document ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A document about the transfer.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const promote = async (id, md, type, state, register = []) => {
  const r = rP(await POST("op=promote&token=mem-ui74", {
    bundleId: id, base: null, snapKey: `${id}-${String(++snapSeq).padStart(6, "0")}`, author: "seed",
    meta: { object_type: type, current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register,
  }));
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};
for (const d of DOCS)
  await promote(d, infoMd(d), "information", "collected",
    [{ path: "snapshots/doc.bin", sha256: captureOf(d), encoding: "binary", bytes: 10 }]);

const INQ = "INQ-2026-7400-transfers";
/* THE THREE STRINGS THAT MUST NEVER REACH A MEMBER'S SCREEN. The first is a set
   label the record files a reading under — member-authored, carrying the
   analyst's words on purpose. It must reach the WIRE (in `affirmed=`), because
   that is how the plane is told what was affirmed, and no MARKUP. */
const LEAKY_LABEL = "OR-branch the ground partition";
const LABEL_B = "set-minutes";
const RUN_OK = "RUN-2026-0923-ui74";
const RUN_DARK = "RUN-2026-0923-nobody-may-open";

/* THE FIVE READINGS, each a different case the row names:
     V_INDEP  — two sets, separate captures: shows NONE
     V_SHARED — two sets, one capture between them: shows the origin first
     V_ONE    — one set: nothing to affirm, nothing to trace
     V_DARK   — composed by a run nobody here may open: REC-36
     V_RUN    — composed by a run this member may open: DEC-46's lens */
const V_INDEP = "two separate routes", V_SHARED = "two routes one copy", V_ONE = "one route";
const V_DARK = "from a closed run", V_RUN = "from an open run";
const q = (s) => `"${s}"`;
const version = (name, rel, extra = []) => [
  `  - name: ${q(name)}`, `    description: ${q(`The reading called ${name}.`)}`,
  `    relationship: ${q(rel)}`, `    state: "suggested"`, `    derived_from: null`, `    hidden: false`,
  `    author: "omar"`, `    at: ${q(NOW)}`, ...extra];
const ground = (v, g) => [`  - version: ${q(v)}`, `    ground: ${q(g)}`, `    asserted_by: "omar"`, `    at: ${q(NOW)}`];
const leg = (v, t, g) => [`  - version: ${q(v)}`, `    target: ${q(t)}`, `    role: "supports"`, `    ground: ${q(g)}`];

const inquiryMd = () => ["---",
  `id: ${INQ}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Did the sewer fund pay for the marina?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "references:", ...DOCS.flatMap((d) => [`  - target: ${d}`, "    rel: cites", "    status: confirmed"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", ...DOCS.flatMap((d) => [`  - target: ${d}`, "    role: supports"]),
  "basis_versions:",
  ...version(V_INDEP, "or"), ...version(V_SHARED, "or"), ...version(V_ONE, "and"),
  ...version(V_DARK, "and", [`    run: ${q(RUN_DARK)}`]), ...version(V_RUN, "and", [`    run: ${q(RUN_OK)}`]),
  "basis_version_grounds:",
  ...ground(V_INDEP, LEAKY_LABEL), ...ground(V_INDEP, LABEL_B),
  ...ground(V_SHARED, "the audit route"), ...ground(V_SHARED, "the mirror route"),
  ...ground(V_ONE, "the ledger route"), ...ground(V_DARK, "the memo route"), ...ground(V_RUN, "the memo route"),
  "basis_version_legs:",
  ...leg(V_INDEP, LEDGER, LEAKY_LABEL), ...leg(V_INDEP, MINUTES, LABEL_B),
  ...leg(V_SHARED, AUDIT, "the audit route"), ...leg(V_SHARED, MIRROR, "the mirror route"),
  ...leg(V_ONE, LEDGER, "the ledger route"), ...leg(V_DARK, MEMO, "the memo route"), ...leg(V_RUN, MEMO, "the memo route"),
  "---", "",
  "## Question", "", "Did the sewer fund pay for the marina?", "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

await promote(INQ, inquiryMd(), "inquiry", "open");
/* The locator rows, written through the store's own recorder (the capture path
   writes them; there is no member op for it). */
{
  const ns = await mf.getDurableObjectNamespace("STORE");
  const stub = ns.get(ns.idFromName("bio"));
  for (const d of [AUDIT, MIRROR]) {
    const r = rP(await (await stub.fetch("http://x/recordcapturedlocator", { method: "POST",
      body: JSON.stringify({ address: SHARED_ADDR, addressNorm: SHARED_ADDR, captureSha: captureOf(d), retrieved: NOW }) })).json());
    if (r && r.ok === false) throw new Error(`recordcapturedlocator ${d}: ${JSON.stringify(r).slice(0, 400)}`);
  }
}
/* THE OPEN RUN, in this question's own context — a run is opened over a question
   that exists, so after it. The reading names it by id with no foreign key
   (schema: `run` — see 14b.7). Carries no bias manifest — see CANNOT SEE. */
{
  const opened = rP(await POST("op=airunopen&token=mem-ui74", {
    run: RUN_OK, contextType: "inquiry", contextId: INQ,
    label: "ground-partition sweep (AND/OR)", mode: "check",
    principalClaude: "project", principalClaudeRef: "fixture-group/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 }));
  if (opened?.started !== true) throw new Error(`airunopen: ${JSON.stringify(opened).slice(0, 600)}`);
}

/* UI-88: the strength vocabulary (derived in GROUND below) and a deep key walk. */
const STRENGTH = [];
const keysDeep = (o, out = new Set()) => {
  if (o && typeof o === "object")
    for (const [k, v] of Object.entries(o)) { if (!Array.isArray(o)) out.add(k); keysDeep(v, out); }
  return out;
};
const strengthKeysIn = (o) => [...keysDeep(o)].filter((k) => STRENGTH.includes(k));
/* Every answer in the network log between positions `from` and `to` that carries a strength key. */
const strengthAnswersIn = (from, to) => WIRE.slice(from, to)
  .map((w, i) => ({ i: from + i, op: w.op, keys: strengthKeysIn(w.answer) })).filter((x) => x.keys.length);

const readings = async () => {
  const r = rP(await GET(`op=basisversions&token=${PILAR}&id=${INQ}&limit=50`));
  return Array.isArray(r?.versions) ? r.versions : [];
};
const stateOf = async (name) => (await readings()).find((v) => v.name === name) || null;
{
  const vs = await readings();
  ok("GROUND: the plane holds all five readings of the one question, each in the state it was written in",
    [V_INDEP, V_SHARED, V_ONE, V_DARK, V_RUN].every((n) => vs.some((v) => v.name === n && v.state === "suggested")),
    `got ${JSON.stringify(vs.map((v) => [v.name, v.state]))}`);
  /* THE DERIVATION ITSELF, asked directly — so the surface's answer below is
     compared against the plane's and not against this suite's belief. UI-88: asked
     of the op the page now reads, the version arm of `op=partitionindependence`. */
  const ind = async (n) => rP(await GET(`op=partitionindependence&token=${PILAR}&id=${INQ}`
    + `&version=${encodeURIComponent(n)}`))?.independence;
  const si = await ind(V_SHARED), ii = await ind(V_INDEP);
  /* UI-88 · THE STRENGTH VOCABULARY, taken from the answer that DOES carry a strength
     rather than typed from memory (REC-192's block H, the same derivation): every key
     `op=versionstrength` answers that the independence-only read does not, minus the
     facts about the reading itself — and those are DERIVED too, as every key the
     question's own record of its readings (`op=basisversions`) carries: `hidden` and
     `derived_from` are the reading's fields, not a grade, and a vocabulary holding them
     flagged the record read on the first run. A key added to versionstrength later joins it. */
  const vsAns = rP(await GET(`op=versionstrength&token=${PILAR}&id=${INQ}`
    + `&version=${encodeURIComponent(V_SHARED)}&states=suggested`));
  const piAns = rP(await GET(`op=partitionindependence&token=${PILAR}&id=${INQ}`
    + `&version=${encodeURIComponent(V_SHARED)}`));
  const FACTS = new Set(["version", "version_state", "legs_complete",
    ...keysDeep(rP(await GET(`op=basisversions&token=${PILAR}&id=${INQ}&limit=50`)))]);
  const piKeys = new Set(Object.keys(piAns ?? {}));
  for (const k of Object.keys(vsAns ?? {})) if (!piKeys.has(k) && !FACTS.has(k)) STRENGTH.push(k);
  console.log(`  strength vocabulary, derived from op=versionstrength's answer: ${STRENGTH.join(", ")}`);
  ok("GROUND (UI-88): THE DETECTOR IS NOT EMPTY — the vocabulary holds `pair` and more, and walking "
    + "versionstrength's OWN answer finds it, so an absence below is a finding",
    vsAns?.ok !== false && STRENGTH.includes("pair") && STRENGTH.length >= 5 && strengthKeysIn(vsAns).length > 0,
    `vocabulary ${JSON.stringify(STRENGTH)}`);
  ok("GROUND (UI-88): the independence-only read answers the SAME `independence` as versionstrength for the same reading",
    JSON.stringify(piAns?.independence) === JSON.stringify(vsAns?.independence) && strengthKeysIn(piAns).length === 0,
    `pi ${JSON.stringify(piAns).slice(0, 300)}`);
  ok("GROUND: the plane DERIVES a shared origin between the two sets of the shared reading, through the one address",
    si?.checked === true && si.shared?.length === 1 && si.shared[0].through.includes(`address:${SHARED_ADDR}`),
    `got ${JSON.stringify(si)}`);
  ok("GROUND: and derives NONE for the independent reading, having finished looking",
    ii?.checked === true && Array.isArray(ii.shared) && ii.shared.length === 0 && ii.complete === true,
    `got ${JSON.stringify(ii)}`);
  /* THE PLANE'S OWN THIRD DEFENCE, measured rather than assumed (D-271). */
  const bare = rP(await GET(`op=versionaccept&token=${PILAR}&target=${INQ}`
    + `&version=${encodeURIComponent(V_INDEP)}&preview=1`));
  ok("GROUND: the plane itself refuses an accept of a two-set reading that affirms nothing — VERSION_AFFIRMATION_INCOMPLETE",
    bare?.ok === false && bare.reason === "VERSION_AFFIRMATION_INCOMPLETE", `got ${JSON.stringify(bare).slice(0, 300)}`);
}

/* ============================================================
   1. THE SURFACE, LOADED, ITS FETCH BRIDGED TO THAT PLANE
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
const WIRE = [];
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}), encodeURIComponent, decodeURIComponent,
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch: async (u, opts) => {
    const url = new URL(u, "http://x");
    /* UI-88: the ANSWER is logged beside the request, so "no strength-bearing answer
       crossed the wire" is judged on what the plane SENT, not on which op was named. */
    const w = { op: url.searchParams.get("op"), params: Object.fromEntries(url.searchParams.entries()), answer: undefined };
    WIRE.push(w);
    const res = await mf.dispatchFetch(url.toString(), opts);
    try { w.answer = await res.clone().json(); } catch (_) { w.answer = null; }
    return res;
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE", "esc", "acceptCeremonyOpen", "versionReviewOpen", "acerSend", "acerActParams", "acceptCeremonyRouteFromHash",
  "VREV_FAILS_ALL", "VREV_FAILS_ANY",
].join(",") + ", ACER: () => ACER };", ctx);
const U = ctx.__U;
U.PLANE.token = PILAR;
U.PLANE.session = true;
U.PLANE.me = { member: "pilar", handle: "pilar", session: true, administer: false, capabilities: ["contribute"] };

const page = () => $$("#content")._html;
const strip = (h) => String(h || "").replace(/<[^>]*>/g, " ").replace(/&middot;/g, " ").replace(/&rsaquo;/g, " ")
  .replace(/&mdash;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&rsquo;/g, "'").replace(/\s+/g, " ");
const unent = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const PHASES = [];
const FOUR = ["versionaccept", "versionreject", "versionconsider", "versionrevert"];
/* What the plane publishes for the QUESTION (affordances are per question, not
   per reading), asked directly — the page is compared with the plane. */
const published = async () => (rP(await GET(`op=affordances&token=${PILAR}&target=${INQ}`)).acts || [])
  .map((a) => a.id).filter((id) => FOUR.includes(id));
const offered = (h) => [...h.matchAll(/acerChoose\(&quot;([a-z]+)&quot;\)|acerChoose\("([a-z]+)"\)/g)].map((m) => m[1] || m[2]);
const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const keep = (where) => { const h = page(); PHASES.push([where, h]); return h; };
const wireOf = (op) => WIRE.filter((w) => w.op === op);

/* CLICK WHAT WAS RENDERED: the first `onclick` whose text matches, pulled out of
   the markup and run in the page's scope. A missing control is a NAMED failure. */
async function click(label, html, pattern){
  const m = [...html.matchAll(/onclick="([^"]*)"/g)].map((x) => unent(x[1])).find((c) => pattern.test(c));
  ok(`CONTROL RENDERED: ${label}`, !!m, `no onclick matching ${pattern} in the page`);
  if (!m) return undefined;
  return await vm.runInContext(m, ctx);
}
/* The textarea's onchange, driven with what the member typed. */
const type = (html, text) => {
  const m = /id="acer-why"[^>]*onchange="([^"]*)"/.exec(html);
  ok("CONTROL RENDERED: the reason box, for the member to type into", !!m);
  if (m) vm.runInContext(`(function(){ const __v = ${JSON.stringify(text)}; `
    + unent(m[1]).replace(/this\.value/g, "__v") + "; })()", ctx);
};

/* ============================================================
   2. THE INDEPENDENT READING — REACHED FROM THE REVIEW SURFACE, BEAT 1, SHOWS
      NONE, THE KEYSTONE
   ============================================================ */
console.log("\n--- 2. two independent sets: nothing shared is shown, and the accept waits on the affirmation ---");
/* AN ACT WITH NO CALL SITE IS NOT A BUILT ACT: the ceremony is entered the way
   a member enters it, from UI-42's review of the question's readings. */
await U.versionReviewOpen(INQ, V_INDEP);
{
  const h = page();
  const linked = new Set([...h.matchAll(/onclick="acceptCeremonyOpen\(([^"]*)\)"/g)]
    .map((m) => JSON.parse("[" + unent(m[1]) + "]")).filter(([i]) => i === INQ).map(([, n]) => n));
  ok(`REACH: the review of the question's readings offers 'Act on this reading' on every one of the five (${linked.size})`,
    [V_INDEP, V_SHARED, V_ONE, V_DARK, V_RUN].every((n) => linked.has(n)) && linked.size === 5);
}
await click("act on the independent reading, from the review surface",
  page(), new RegExp(`^acceptCeremonyOpen\\("${INQ}","${V_INDEP}"\\)$`));
{
  const h = keep("independent, nothing chosen");
  const t = strip(h);
  ok("BEAT 1: the reading named in the address is the one in front of the member, with the reasons it rests on",
    t.includes(V_INDEP) && t.includes(LEDGER) && t.includes(MINUTES));
  ok("BEAT 1: no act is chosen on arrival", U.ACER().act === null && !/id="acer-go"/.test(h));
  const pub = await published();
  ok(`BEAT 1: exactly the transition acts the PLANE published for this question are offered (${pub.join(", ")}), each in its own label`,
    pub.length >= 3 && sameSet(offered(h), pub) && (rP(await GET(`op=affordances&token=${PILAR}&target=${INQ}`)).acts || [])
      .filter((a) => pub.includes(a.id)).every((a) => t.includes(a.label)), `offered ${offered(h).join(", ")}`);
  ok("THE FALSIFIER, READ BACK IN PLAIN WORDS: the elicitation's own stem, 'fails only if ALL of these fail'",
    t.includes(U.VREV_FAILS_ALL.trim()));
  ok("D-195 INDEPENDENT SHOWS NONE: no shared origin is drawn for a reading whose sets rest on separate material",
    !/data-acer="origins-shared"/.test(h) && !/data-acer="origin"/.test(h));
  ok("D-195 INDEPENDENT: and the page says the record TRACED and found none — not silence, which would be the untold case",
    /data-acer="origins-none"/.test(h) && t.includes("found none of it shared") && !/data-acer="origins-untold"/.test(h));
  ok("D-195 INDEPENDENT: the reach of that 'none' is stated with it", t.includes("beyond what it can see"));
  /* THE ORDERING RULE, FIRST HALF. CORRECTED 2026-09-25 by UI-88: this arm read
     "the only strength ask before any act is the origins read … in its own state",
     asserting ONE versionstrength request with states=suggested. That was the
     defect pinned as the rule: the origins read fetched the pair and dropped it
     client-side. BOB #31 (2026-09-23 22:22Z) ruled the separation structural at
     the wire, so the origins read is now the independence-only read and NO
     strength request precedes an act. */
  const pi = wireOf("partitionindependence");
  ok("ORDERING: the origins read is the independence-only read, made once, for this reading, naming no state",
    pi.length === 1 && pi[0].params.version === V_INDEP && pi[0].params.states === undefined
    && pi[0].params.partition === undefined, `got ${JSON.stringify(pi.map((w) => w.params))}`);
  ok("ORDERING: and the arithmetic is not asked before any act", wireOf("versionstrength").length === 0,
    `got ${JSON.stringify(wireOf("versionstrength").map((w) => w.params))}`);
  ok("ORDERING: nothing strength-bearing is HELD — nothing in the page's state carries a pair",
    U.ACER().strength === null && !JSON.stringify(U.ACER()).includes('"pair"'));
  ok("ORDERING: and nothing of what the reading comes to is drawn", !/data-acer="strength"/.test(h)
    && !t.includes("What this reading comes to"));
}
await click("choose the adopt act", page(), /^acerChoose\("versionaccept"\)$/);
{
  const h = keep("independent, accept chosen, nothing affirmed");
  const t = strip(h);
  ok("THE KEYSTONE: the affirmation is asked for once per set, each set named by the reasons in it",
    (h.match(/acerAffirm\(\d+\)/g) || []).length === 2 && t.includes("Set 1") && t.includes("Set 2"));
  ok("THE KEYSTONE: nothing is prefilled — no set reads as affirmed", !t.includes("You have said these carry it"));
  ok("THE KEYSTONE: THE SEND CONTROL IS ABSENT, NOT DISABLED, while any set is unaffirmed", !/id="acer-go"/.test(h));
  ok("ORDERING: with the affirmation outstanding the arithmetic is still not offered",
    !t.includes("What this reading comes to"));
  const before = (await stateOf(V_INDEP))?.state;
  const nAccept = wireOf("versionaccept").length;
  await U.acerSend();
  ok("THE KEYSTONE, SECOND DEFENCE: driving acerSend() with the affirmation outstanding sends NOTHING",
    wireOf("versionaccept").length === nAccept);
  ok("and the record, read back, still holds the reading unadopted",
    before === "suggested" && (await stateOf(V_INDEP))?.state === "suggested");
}
/* UI-88 · THE ROW'S ACCEPTS-WHEN, judged on the network log at the moment the
   member is about to affirm: every answer the plane SENT since the page loaded. */
{
  const n = WIRE.length, hits = strengthAnswersIn(0, n);
  ok(`PRE-AFFIRMATION FETCH: before the affirmation the ceremony's network log (${n} answers) holds NO strength-bearing answer — the independent reading`,
    n >= 4 && WIRE.slice(0, n).every((w) => w.answer !== undefined) && hits.length === 0
    && WIRE.slice(0, n).some((w) => w.op === "partitionindependence" && w.answer?.result?.independence),
    `strength-bearing: ${JSON.stringify(hits)}`);
}
await click("affirm set 1", page(), /^acerAffirm\(0\)$/);
{
  const h = keep("independent, one set affirmed");
  ok("affirming one set is not affirming both — the send control stays absent", !/id="acer-go"/.test(h));
}
await click("affirm set 2", page(), /^acerAffirm\(1\)$/);
{
  const h = keep("independent, both affirmed");
  ok("with every set affirmed the send control appears", /id="acer-go"/.test(h));
  const pv = U.acerActParams(true), real = U.acerActParams(false);
  ok("BEAT 2: the preview's arguments are the act's plus preview=1 and nothing else",
    JSON.stringify({ ...pv, preview: undefined }) === JSON.stringify({ ...real, preview: undefined })
    && pv.preview === "1" && real.preview === undefined);
}
await click("ask the record what the act would do", page(), /^acerPreview\(\)$/);
{
  const h = keep("independent, previewed");
  const t = strip(h);
  const pv = wireOf("versionaccept").filter((w) => w.params.preview === "1");
  ok("BEAT 2: the plane was asked with preview=1 and CARRYING the affirmation", pv.length === 1
    && pv[0].params.affirmed === `${LEAKY_LABEL},${LABEL_B}`, `got ${JSON.stringify(pv.map((w) => w.params))}`);
  ok("BEAT 2: the page renders what the plane answered, the move it would make", t.includes("ran every check and wrote nothing")
    && t.includes("from suggested to accepted"), t.slice(0, 400));
  ok("BEAT 2: and the preview wrote nothing — the record, read back", (await stateOf(V_INDEP))?.state === "suggested");
}
type(page(), "Both the ledger and the minutes show the transfer.");
await click("send the adopt act", page(), /^acerSend\(\)$/);
{
  const h = keep("independent, accepted");
  const t = strip(h);
  const got = await stateOf(V_INDEP);
  ok("THE ACCEPT LANDS: the record, read back, holds the reading ADOPTED, by the member who acted",
    got?.state === "accepted" && got?.moved?.by === "pilar", `got ${JSON.stringify(got && { state: got.state, moved: got.moved })}`);
  ok("AND THE AFFIRMATION IS IN THE RECORD: the reading carries, under the member's name, every set they affirmed",
    Array.isArray(got?.affirmed) && got.affirmed.length === 2
    && got.affirmed.includes(LEAKY_LABEL) && got.affirmed.includes(LABEL_B), `got ${JSON.stringify(got?.affirmed)}`);
  ok("BEAT 3: the member's reason travelled verbatim", got?.moved?.reason === "Both the ledger and the minutes show the transfer."
    || wireOf("versionaccept").some((w) => w.params.preview !== "1" && w.params.reason === "Both the ledger and the minutes show the transfer."));
  ok("BEAT 4: the receipt names the move and says the affirmation is kept", /data-acer="receipt"/.test(h)
    && t.includes("moved from suggested to accepted") && t.includes("each of its 2 sets carries the answer on its own"));
}
await click("ask what the reading comes to, after the affirmation", page(), /^acerStrengthShow\(\)$/);
{
  const h = keep("independent, strength after the affirmation");
  const t = strip(h);
  const vs = wireOf("versionstrength"), pi = wireOf("partitionindependence");
  /* CORRECTED 2026-09-25 by UI-88: this arm counted THREE versionstrength asks —
     two origins reads (suggested, then accepted) and the arithmetic — because the
     origins read went through the strength op. It now goes through the
     independence-only read, so the two origins reads are partitionindependence's
     (arrival, and the re-read after the act) and the arithmetic is the ONE
     versionstrength ask, with no state named, the op's default, because the
     reading is adopted now. */
  ok("ORDERING, SECOND HALF: the arithmetic is asked only now, once, with the op's own default state set, after two independence-only origins reads",
    vs.length === 1 && vs[0].params.states === undefined && pi.length === 2
    && WIRE.indexOf(vs[0]) > WIRE.indexOf(pi[1]), `got vs ${JSON.stringify(vs.map((w) => w.params.states))}, pi ${pi.length}`);
  ok("the plane's own filter line is rendered verbatim (DEC-40)", t.includes("This is the record's own answer for this question"));
  ok("and it is drawn BELOW the affirmation", h.indexOf('data-acer="strength"') > h.indexOf('data-acer="affirm"')
    && h.indexOf('data-acer="affirm"') > 0);
}

/* ============================================================
   3. THE SHARED READING — THE ORIGIN SHOWN BEFORE THE AFFIRMATION, NEVER A REFUSAL
   ============================================================ */
console.log("\n--- 3. two sets fetched from one address: the origin is shown first, and nothing is refused ---");
const wireAtShared = WIRE.length;   /* UI-88: this ceremony's own network log starts here */
await U.acceptCeremonyOpen(INQ, V_SHARED);
{
  keep("shared, on arrival");
  /* ASSERTED ON ARRIVAL AND NOT AFTER AN ACT IS CHOSEN, and the placement is a
     finding: `acerChoose` clears `strength`, so this assertion, written first
     after the choice, could not fail — control arm E came back with it GREEN
     while the pair sat in the page's state from arrival until the click. */
  ok("ORDERING: on arrival at the shared reading, nothing strength-bearing is held here either",
    U.ACER().strength === null && !JSON.stringify(U.ACER()).includes('"pair"'));
}
await click("choose the adopt act", page(), /^acerChoose\("versionaccept"\)$/);
{
  const h = keep("shared, accept chosen");
  const t = strip(h);
  ok("D-195 SHARED: the shared origin is SHOWN on the page", /data-acer="origins-shared"/.test(h)
    && (h.match(/data-acer="origin"/g) || []).length === 1);
  ok("D-195 SHARED: it names BOTH sets by their reasons and the one address they were fetched from",
    t.includes(`set 1 (${AUDIT}) shares material with set 2 (${MIRROR}): the same address`) && t.includes(`the same address, ${SHARED_ADDR}`),
    t.slice(t.indexOf("Rests on the same"), t.indexOf("Rests on the same") + 400));
  const at = h.indexOf('data-acer="origins-shared"');
  ok("D-195 SHARED: and it is shown BEFORE the affirmation — above the chooser and above what the member is asked to say",
    at > 0 && at < h.indexOf('data-acer="chooser"') && at < h.indexOf('data-acer="affirm"'));
  ok("D-195 SHARED, NEVER REFUSES: the affirmation is still offered, one control per set",
    (h.match(/acerAffirm\(\d+\)/g) || []).length === 2);
  ok("D-195 SHARED: the page says it does not stop the member", t.includes("This does not stop you"));
}
{
  /* UI-88: the same accepts-when over the shared reading, which draws an origin. */
  const n = WIRE.length, hits = strengthAnswersIn(wireAtShared, n);
  ok(`PRE-AFFIRMATION FETCH: before the affirmation the network log (${n - wireAtShared} answers since it opened) holds NO strength-bearing answer — the shared reading, whose origin IS drawn`,
    n - wireAtShared >= 3 && hits.length === 0
    && WIRE.slice(wireAtShared, n).some((w) => w.op === "partitionindependence" && w.params.version === V_SHARED
      && (w.answer?.result?.independence?.shared || []).length === 1),
    `strength-bearing: ${JSON.stringify(hits)}`);
}
await click("affirm set 1", page(), /^acerAffirm\(0\)$/);
await click("affirm set 2", page(), /^acerAffirm\(1\)$/);
await click("send the adopt act", page(), /^acerSend\(\)$/);
{
  keep("shared, accepted");
  const got = await stateOf(V_SHARED);
  ok("D-195 SHARED, NEVER REFUSES: the member's accept over a shared origin LANDS in the record, with both sets affirmed",
    got?.state === "accepted" && Array.isArray(got?.affirmed) && got.affirmed.length === 2,
    `got ${JSON.stringify(got && { state: got.state, affirmed: got.affirmed })}`);
}

/* ============================================================
   4. THE ONE-SET READING — THE KEYSTONE MUST NOT FIRE (OVER-STRICTNESS)
   ============================================================ */
console.log("\n--- 4. one set: nothing to affirm, nothing to trace between ---");
/* UI-88: both ops counted — the origins read moved from versionstrength to partitionindependence. */
const vsBeforeOne = wireOf("versionstrength").length + wireOf("partitionindependence").length;
await U.acceptCeremonyOpen(INQ, V_ONE);
await click("choose the adopt act", page(), /^acerChoose\("versionaccept"\)$/);
{
  const h = keep("one set, accept chosen");
  const t = strip(h);
  ok("OVER-STRICTNESS: a one-set reading asks the member to affirm nothing, and the send control is there",
    !/acerAffirm\(/.test(h) && /id="acer-go"/.test(h));
  ok("and draws no origin line of any kind — there is nothing between one set to trace", !/data-acer="origins/.test(h));
  ok("and asks the plane nothing about origins",
    wireOf("versionstrength").length + wireOf("partitionindependence").length === vsBeforeOne);
  ok("a member-composed reading says who composed it", t.includes("Composed by omar"));
  ok("the falsifier is read back with the ANY stem", t.includes(U.VREV_FAILS_ANY.trim()));
}
await click("send the adopt act", page(), /^acerSend\(\)$/);
{
  keep("one set, accepted");
  const got = await stateOf(V_ONE);
  ok("OVER-STRICTNESS: the one-set accept lands, with NO affirmation recorded (null, never an empty list)",
    got?.state === "accepted" && got?.affirmed === null, `got ${JSON.stringify(got && { state: got.state, affirmed: got.affirmed })}`);
}

/* ============================================================
   5. REC-36 — A RUN THIS CREDENTIAL CANNOT OPEN
   ============================================================ */
console.log("\n--- 5. REC-36: composed by a run the member cannot open ---");
await U.acceptCeremonyOpen(INQ, V_DARK);
{
  const h = keep("closed run");
  const t = strip(h);
  ok("REC-36: the run was ASKED for, so the withholding is a measured answer",
    wireOf("airun").some((w) => w.params.run === RUN_DARK));
  ok("REC-36: the ADOPT act is withheld", !offered(h).includes("versionaccept"));
  const pub = await published();
  ok(`REC-36: every other act the plane published stays (${pub.filter((a) => a !== "versionaccept").join(", ")})`,
    sameSet(offered(h), pub.filter((a) => a !== "versionaccept")), `offered ${offered(h).join(", ")}`);
  ok("REC-36: and the page says what it held back and why", t.includes("composed by a run the record will not open for you"));
}

/* ============================================================
   6. DEC-46 — THE LENS, IN THE FLOW
   ============================================================ */
console.log("\n--- 6. DEC-46: a run the member can open ---");
await U.acceptCeremonyOpen(INQ, V_RUN);
{
  const h = keep("open run");
  const t = strip(h);
  const run = rP(await GET(`op=airun&token=${PILAR}&run=${RUN_OK}`));
  ok("GROUND: the plane answers the open run for this member, with a bias part", run?.found === true
    && run.session && typeof run.session.bias === "object", `got ${JSON.stringify(run).slice(0, 300)}`);
  ok("DEC-46: the lens card is IN THE FLOW, above the chooser", /data-acer="lens"/.test(h)
    && h.indexOf('data-acer="lens"') < h.indexOf('data-acer="chooser"'));
  ok("DEC-46: in the plane's own words when nothing is in force",
    run?.session?.bias?.in_force === true || t.includes(String(run?.session?.bias?.stated || "the record says nothing about it")));
  ok("the adopt act is offered — the member can open this run, so nothing is withheld",
    offered(h).includes("versionaccept"));
  ok("and the run's own label is on no screen", !h.includes("ground-partition sweep"));
}

/* ============================================================
   7. DEC-49 — A REFUSAL IN THE PLANE'S OWN WORDS
   ============================================================ */
console.log("\n--- 7. a refusal, rendered as the plane said it ---");
await click("choose the turn-down act", page(), /^acerChoose\("versionreject"\)$/);
await click("ask what turning it down would do", page(), /^acerPreview\(\)$/);
{
  const h = keep("turn down, refused for want of a reason");
  const t = strip(h);
  const refused = wireOf("versionreject").slice(-1)[0];
  const direct = rP(await GET(`op=versionreject&token=${PILAR}&target=${INQ}`
    + `&version=${encodeURIComponent(V_RUN)}&preview=1`));
  ok("GROUND: the plane refuses a turn-down with no reason, and sends a canned translation",
    direct?.ok === false && typeof direct.translation === "string" && direct.translation.length > 10,
    `got ${JSON.stringify(direct).slice(0, 300)}`);
  ok("DEC-49: the plane's canned translation is on the page verbatim, with its code",
    !!refused && t.includes(direct.translation) && t.includes(direct.reason));
}
type(page(), "The memo it rests on was withdrawn by its author.");
await click("send the turn-down", page(), /^acerSend\(\)$/);
{
  keep("turned down, with a reason");
  const got = await stateOf(V_RUN);
  ok("with the reason authored, the turn-down lands and the record holds it",
    got?.state === "rejected", `got ${JSON.stringify(got && got.state)}`);
}

/* ============================================================
   8. THE ADDRESS
   ============================================================ */
{
  /* SUBSTITUTE FOR AN EVENT THIS HARNESS CANNOT FIRE, labelled. */
  ctx.location.hash = "#accept/" + encodeURIComponent(INQ) + "/" + encodeURIComponent(V_ONE);
  ok("the router resolves an accept address naming a reading with spaces in its name",
    U.acceptCeremonyRouteFromHash() === true);
  await new Promise((r) => setTimeout(r, 0));
  const n = WIRE.length;
  ok("and re-entering on the address already shown does not rebuild the page",
    U.acceptCeremonyRouteFromHash() === true && WIRE.length === n);
  ctx.location.hash = "#accept/" + INQ;
  ok("an address naming no reading does NOT resolve — there is no default reading", U.acceptCeremonyRouteFromHash() === false);
}

/* ============================================================
   9. THE SWEEP — DEC-32 CLAUSE 1 / D-226
   ============================================================ */
{
  /* THE ONE DERIVED FAMILY (`analyst-vocabulary.mjs`, from DEC-32 clause 1),
     imported and never re-listed — a private list here is the rival
     `analyst-vocabulary.test.mjs` ARM C exists to catch. */
  console.log("  " + reachLine());
  const hits = [];
  for (const [where, html] of PHASES)
    for (const h of analystHits(strip(html))) hits.push(`${where}: ${h.token} — ${h.why}`);
  ok(`VOCABULARY: not one analyst word on any phase this ceremony rendered: ${hits.join(" | ") || "clean"}`, hits.length === 0);
  const chars = PHASES.reduce((s, [, h]) => s + String(h).length, 0);
  ok(`REACH: the sweep saw ${PHASES.length} phases and ${chars} characters of rendered markup (floors 14 and 30000)`,
    PHASES.length >= 14 && chars > 30000 && PHASES.every(([, h]) => String(h).length > 200));
  ok("INSTRUMENT: the sweep DOES fire on the record's own set label", analystHits(LEAKY_LABEL).length > 0);
  ok("THE RECORD'S OWN SET LABELS ARE IN NO MARKUP — raw HTML, every phase — though they crossed the wire in affirmed=",
    PHASES.every(([, h]) => !String(h).includes(LEAKY_LABEL) && !String(h).includes(LABEL_B)
      && !String(h).includes("the audit route"))
    && wireOf("versionaccept").some((w) => String(w.params.affirmed || "").includes(LEAKY_LABEL)));
  ok("the ops this ceremony reaches are never named to the member",
    PHASES.every(([, h]) => { const t = strip(h); return !/\b(basisversions|versionstrength|partitionindependence|airun|versionaccept)\b/.test(t); }));
}

await mf.dispose();
console.log(`  CEREMONY CORPUS: ${PHASES.length} phases · ${WIRE.length} requests across ${new Set(WIRE.map((w) => w.op)).size} ops`);
console.log(`accept-ceremony: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
