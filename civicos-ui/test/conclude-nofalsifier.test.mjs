/* UI-64 — THE FALSIFIER OVERRIDE WAS REACHABLE ON THE WIRE AND INVISIBLE TO THE
 * MEMBER, WHICH LEFT BOB'S RULING HALF-STANDING.
 *
 * Bob, 2026-09-17: *"NO_FALSIFIER is a condition that should be surfaced. But I
 * think it should also be something a member can override either temporarily or
 * in the published record."* REC-117 landed the plane half — `op=conclude`
 * accepts `no_falsifier=1`, the document carries who and when, the published
 * page says so — and verified AT THE ARTIFACT that `no_falsifier` appeared
 * NOWHERE in `civicos-ui/app.html`. So the record accepted an act the surface
 * offered no way to perform, and a member who cannot find the override is still
 * pressured into INVENTING a falsifier. That is the original defect, and an
 * invented falsifier is the record claiming more than it can support by the
 * shortest route available. DEC-69 forbids compelling a member, and a control
 * that exists only on the wire does not discharge that.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 * STATED FIRST, BEFORE WHAT IS CHECKED, because it is the shape the assertions
 * are cut against — and it is the shape the ROW names.
 *
 * The cheapest green is A CHECKBOX BESIDE THE FALSIFIER BOX that sets
 * `no_falsifier=1`. It is reachable, it is assertable, it drives through the
 * surface, and the document comes back carrying the override with who and when.
 * It would satisfy every clause of this item except the one that IS the ruling:
 * the member could tick it having NEVER BEEN TOLD what they were accepting.
 * That is the SILENT OVERRIDE one layer up from the one REC-117's arm B caught
 * in the plane — and Bob asked for the condition to be overridable, NOT
 * invisible.
 *
 * SO *SURFACED BEFORE OVERRIDDEN* IS BUILT AS A STRUCTURAL PROPERTY RATHER THAN
 * A PROMISE, AND SECTION 3 IS WHERE THAT IS MEASURED. The override is not a
 * field: it is an act offered BY THE PLANE'S OWN REFUSAL, which exists only
 * while `op=conclude` is answering `NO_FALSIFIER` to THIS member with THIS
 * draft. `concludeNoFalsifier(true)` REFUSES TO SET THE FLAG at any other
 * moment, so the property survives a caller that never looked at the markup —
 * which is the difference between a fact about a rendering and a fact about the
 * act. A checkbox cannot have that property at all.
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * Two reasons, and the second is REC-117's own finding turned into a rule.
 *
 * (1) The criterion is *what `op=conclude` accepts and what the DOCUMENT then
 *     carries*. A mock answering a hand-written envelope would be this suite
 *     agreeing with itself, which is an equality that costs nothing to produce.
 *     So the plane is the actual `bio-plane/src/index.mjs` under miniflare, the
 *     members are enrolled through `op=memberadd`/`op=enroll`/`op=login`, and
 *     the inquiry is promoted through `op=promote` with a real basis leg.
 *
 * (2) REC-117's arm B FOUND A DEFECT IN ITS OWN INSTRUMENT AND RECORDED IT:
 *     with the two `falsifier_override_by`/`_at` writes deleted — the record
 *     storing nothing at all — its assertion on the OP'S ANSWER still passed,
 *     because that answer is COMPUTED from the parameter rather than read back.
 *     A suite built on the envelope would have passed a completely silent
 *     override. So section 5 below asks the DOCUMENT: `op=image`, the
 *     frontmatter pair, and the Session Log line. The receipt is checked too,
 *     but it is never what the finding rests on.
 *
 * ================= WHAT THE SURFACE MAY AND MAY NOT SAY =================
 * DEC-8: no refusal sentence may originate here. Section 7 sweeps EVERY
 * `intent-ref-why` this suite rendered against the exact set of `detail`
 * strings the plane returned over the wire — collected from the responses
 * themselves, not from a list written in this file, because a list written here
 * would agree with the surface for free. The sentence that teaches the override
 * is the plane's own: REC-117 put *"If no falsifier can honestly be stated, SAY
 * SO rather than inventing one"* into the refusal `detail` deliberately, and
 * the surface renders those bytes. What the surface supplies is the CONTROL.
 *
 * ================= THE ORDINARY JOURNEY IS UNTOUCHED =================
 * Section 6. A member who CAN state a falsifier must see the path this item
 * added NOWHERE AT ALL, and their request must be byte-identical to the one
 * this surface sent before the item existed — `no_falsifier` ABSENT, not `0`
 * and not the string "undefined" (`rec` builds its query with URLSearchParams,
 * which stringifies an undefined value rather than dropping the key). Their
 * document must carry no override pair at all.
 *
 * ONE LINE OF THE ORDINARY JOURNEY DID LEGITIMATELY MOVE AND IT IS REPORTED
 * RATHER THAN HIDDEN. The empty-falsifier hint read *"Nothing yet. The record
 * refuses a conclusion that says nothing would overturn it."* — a sentence THIS
 * SURFACE WROTE, true until REC-117 and false after it, stating the gate as
 * absolute when the record's own refusal now names a way through. The only
 * member who ever reads it is the member with no falsifier: the exact member
 * this item exists for, told the door was shut. It is corrected to *"Nothing
 * yet."* and the rule is left entirely to the plane's own sentence below it.
 * Section 6 asserts the correction rather than pinning the old bytes.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/conclude-nofalsifier.control.mjs`
 * — FIVE arms, RUN 2026-09-17, each broken ALONE with the others held open,
 * each restored from its own uniquely-named pristine copy and verified by
 * sha256 AND `cmp`; app.html returned to
 * a6e6e9ba52c74b8fbf457ef09b90e68d00afcea19639f9df4311bbb0676412a1 (1363306
 * bytes) after every one. WHOLE: 75 pass, 0 fail.
 *
 *   (A) THE DOOR REMOVED — the commit slot stops offering it -> 51/24, failing
 *       by name from "THE DOOR IS OFFERED" through the document read-back.
 *   (B) THE GUARD REMOVED — the liar's checkbox, the override settable whenever
 *       it is called -> 72/3, and section 3 is what catches it.
 *   (C) SHOWN ONCE AND THEN HIDDEN — the standing block keeps its button and
 *       drops the record's sentence -> 74/1, EXACTLY the one assertion, with
 *       every other clause of this item still green. That is the arm the row
 *       calls the one that matters, and its narrowness is the finding.
 *   (D) THE RECEIPT FORGETS -> 73/2, while the DOCUMENT stays right.
 *   (E) THE PARAMETER NEVER LEAVES THE BROWSER -> 61/14.
 *   (F) OVER-STRICTNESS, no edit, runs on every green pass: sections 6 and 6b.
 *       It HELD under all five arms.
 *
 * TWO OF THIS SUITE'S OWN DECLARATIONS CAME BACK WRONG AND BOTH WERE DEFECTS IN
 * THE INSTRUMENT, corrected here rather than edited out of the declarations.
 * Arm A first left sections 4 and 5 entirely GREEN with the door gone, because
 * this suite was calling `concludeNoFalsifier(true)` DIRECTLY — asserting
 * against a handler, which the row forbids in as many words; it now pulls the
 * handler out of the RENDERED markup and runs it. Arm D first left "the
 * receipt's who and when are the DOCUMENT'S" green with the override cell
 * deleted, because `falsifier_override_at` and the receipt's ordinary `at` are
 * the same value, so `rc.includes(at)` was satisfied by a line that says
 * nothing about the override — an equality that cost nothing to produce. Both
 * are recorded in the control's own header beside the arms that found them.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one. The import is for its SIDE EFFECT and is idempotent. Census: `stdio-census.test.mjs`. */
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";
/* REC-136 (INVESTIGATIVE-SESSION.md §7.1 item 6): the RECORD area's one fixture
   helper for a no-project conclusion's reading — imported rather than copied so
   the reading this harness supplies is the one the plane's own suites use. */
import { withAdoptableReading, ADOPTED_READING } from "../../bio-plane/test/adoptable-reading.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* ---- the real plane, under miniflare. Resolved from bio-plane's own
   node_modules. If it is not installed the harness FAILS rather than skipping:
   a suite that quietly stops testing its subject is the defect the
   negative-control rule exists to catch. ---- */
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("conclude-nofalsifier: the real plane could not be started — miniflare is not installed.");
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
  bindings: { ADMIN_TOKEN: "adm-ui64", MEMBER_TOKEN: "mem-ui64", PROBE_TOKEN: "prb-ui64", VERSION: "test",
                /* CORRECTED 2026-09-23 BY UI-79 (D-436, IC-172; State Rules §3.1), never exempted. This plane recorded NO
                   producing group, and its seeds stated one group's slug as a LITERAL in their bytes and their meta — the pin
                   the member UI carried, true of one instance and false of every instance `newgroup` installs. A store's
                   producing group is ONE recorded value, written at its FIRST BOOT from the slug the installer binds, and the
                   plane stamps it into every creation whatever a caller says; so the store records one here, the way every
                   installed store does, and the seeds name none. The slug is deliberately no real group's. */
                INSTANCE_NAME: "fixture-group" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

/* ============================================================
   0. THE GROUND — A REAL GROUP, REAL MEMBERS, A REAL QUESTION WITH A REAL LEG
   ============================================================ */
console.log("\n--- 0. the ground: a real plane, real members, real questions ---");

const enrol = async (memberId, password, role) => {
  const add = rP(await POST("op=memberadd&token=adm-ui64",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: ["contribute"] }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* Membership Architecture 4.2: the first two invitations a group issues create
   administrators, so the ORDINARY member — the one who concludes here, carrying
   nothing but `contribute` — has to be the third. DEC-30: any contribute holder
   may conclude, and it is deliberately not the author of the question. */
await enrol("nadia", "nadia-passphrase-1", "admin");
await enrol("omar", "omar-passphrase-1", "admin");
const PILAR_TOKEN = await enrol("pilar", "pilar-passphrase-1", "member");

const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const DOC = "INFO-2026-6400-transfer-memo";
const INQ_NOFALS = "INQ-2026-6400-nofals";
const INQ_STATED = "INQ-2026-6400-stated";
const INQ_GUARD = "INQ-2026-6400-guard";

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Transfer memo ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A memo about the transfer.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const inquiryMd = (id, question) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "references:", `  - target: ${DOC}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${DOC}`, "    role: supports",
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const promote = async (id, md, type, state) => {
  const r = rP(await POST("op=promote&token=mem-ui64", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "seed",
    meta: { object_type: type, title: `t ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [],
  }));
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  return r;
};

await promote(DOC, infoMd(DOC), "information", "collected");
/* THE SUBJECT'S QUESTION IS CHOSEN TO BE ONE FOR WHICH NO HONEST FALSIFIER
   EXISTS — REC-117's own fixture reasoning, kept because it is the situation
   Bob's ruling is about. It is not that the member could not be bothered; it is
   that demanding one would make them invent it. */
/* CORRECTED 2026-09-18 (REC-136, INVESTIGATIVE-SESSION.md §7.1 item 6): a
   conclusion drawn with no project NAMES the accepted reading whose claim it
   adopts, and one naming none is refused NO_CLAIM. So each question carries an
   accepted reading to adopt — a FIXTURE change only. UI-65 CORRECTED the
   second half: the surface now picks that reading itself (the member picks it,
   from the rendered picker), and the transport stand-in that supplied it is
   GONE — see `pickRendered` below and the foot. */
await promote(INQ_NOFALS, withAdoptableReading(inquiryMd(INQ_NOFALS,
  "Did anyone raise a concern about the transfer that was never written down?")), "inquiry", "open");
await promote(INQ_STATED, withAdoptableReading(inquiryMd(INQ_STATED,
  "Did money from the sewer enterprise fund pay for marina construction?")), "inquiry", "open");
await promote(INQ_GUARD, withAdoptableReading(inquiryMd(INQ_GUARD,
  "Who authorised the transfer, if anyone?")), "inquiry", "open");

ok("the plane really holds three open questions, each resting on a real leg",
  (await Promise.all([INQ_NOFALS, INQ_STATED, INQ_GUARD].map(async (id) => {
    const p = rP(await GET(`op=projection&token=mem-ui64&id=${id}`));
    let fm = null; try { fm = JSON.parse(p.fm_json); } catch (_) {}
    return p.current_state === "open" && Array.isArray(fm?.basis) && fm.basis.length === 1;
  }))).every(Boolean));

/* THE PLANE'S OWN SENTENCES, TAKEN FROM THE PLANE. Everything this suite says
   about provenance is measured against these bytes, and they are FETCHED rather
   than written down here: a sentence copied into this file would agree with the
   surface for free. `target` is withheld, so nothing is written by asking. */
const askDirect = async (params) => rP(await GET(`op=conclude&token=${PILAR_TOKEN}&`
  + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")));
const PLANE_NO_FALSIFIER = await askDirect({ target: "", conclusion: "anything at all", falsifier: "" });
const PLANE_BOTH = await askDirect({ target: "", conclusion: "anything at all", falsifier: "a ledger export", no_falsifier: "1" });

ok("the plane REFUSES a falsifier-less conclusion by name, for a caller that does not ask for the override",
  PLANE_NO_FALSIFIER.ok === false && PLANE_NO_FALSIFIER.reason === "NO_FALSIFIER",
  `got ${JSON.stringify(PLANE_NO_FALSIFIER)}`);
ok("and the refusal NAMES THE DOOR in its own words — the surfacing half of the ruling, which is why the surface may render it and write nothing",
  typeof PLANE_NO_FALSIFIER.detail === "string" && /no_falsifier=1/.test(PLANE_NO_FALSIFIER.detail),
  `detail was ${JSON.stringify(PLANE_NO_FALSIFIER.detail)}`);
ok("the plane refuses BOTH AT ONCE — a stated falsifier and an assertion that none was stated",
  PLANE_BOTH.ok === false && PLANE_BOTH.reason === "FALSIFIER_AND_NONE_STATED",
  `got ${JSON.stringify(PLANE_BOTH)}`);

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

/* EVERY REQUEST THE SURFACE MAKES AND EVERY SENTENCE THE PLANE ANSWERS WITH.
   The responses are cloned before the surface reads them — a Response body is
   consumed once, and a harness that drank it would starve the thing it is
   watching. */
const WIRE = [];
const SAID = new Set();
function harvest(o){
  if (!o || typeof o !== "object") return;
  if (typeof o.detail === "string" && o.detail) SAID.add(o.detail);
  if (typeof o.error === "string" && o.error) SAID.add(o.error);
  /* CORRECTED 2026-09-19 (UI-72), never exempted. This corpus held `detail` and
     `error` and NOT `translation`, and that was wrong from the day DEC-49 landed:
     the question section 7 asks is whether a sentence the member read CAME OVER
     THE WIRE, and a canned `translation` comes over the wire on the same answer,
     from the plane's own check row. Until UI-72 the omission was invisible because
     no surface rendered a translation; the moment `actRefusalHtml` preferred one,
     this sweep reported the PLANE'S OWN SENTENCE as "invented" by the surface —
     an instrument naming the wrong culprit rather than a defect. The arm still
     bites: a sentence app.html composes is in neither field. */
  if (typeof o.translation === "string" && o.translation) SAID.add(o.translation);
  for (const v of Object.values(o)) if (v && typeof v === "object") harvest(v);
}
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch: async (u, opts) => {
    const url = new URL(u, "http://x");
    WIRE.push({ op: url.searchParams.get("op"), url, params: Object.fromEntries(url.searchParams.entries()) });
    /* UI-65 REMOVED REC-136's STAND-IN HERE, as its own foot assertion
       demanded: this transport used to add `version=` to every conclude the
       surface sent without one. The surface now sends the reading the member
       picked, and the request reaches the plane exactly as the surface wrote
       it. */
    const r = await mf.dispatchFetch(url.toString(), opts);
    try { harvest(await r.clone().json()); } catch (_) {}
    return r;
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE", "esc", "openConclude", "concludeAuthor", "concludeToggle",
  "concludeNoFalsifier", "doConclude", "concludeParams", "concludeFalsifier",
  "concludePick",
].join(",") + ", CONCL: () => CONCL };", ctx);
const U = ctx.__U;
U.PLANE.token = PILAR_TOKEN;
U.PLANE.session = true;
U.PLANE.me = { member: "pilar", handle: "pilar", session: true, administer: false, capabilities: ["contribute"] };

const ACT = { id: "conclude", label: "Conclude", weight: "single", needs: "contribute",
              mode: "session", rung: null, prompt: null };
const dlg = () => $$("#dlg")._html;
/* WHAT THE MEMBER READS, keyed by the classes the surface renders rather than
   by any state object behind them. A test that read `CONCL.noFals` would be
   asserting against a handler; the row says drive the SURFACE. */
const doorOffered = (h) => /data-nofals="offer"/.test(h) && /id="cx-nofals"/.test(h);
const overrideStanding = (h) => /data-nofals="taken"/.test(h);
const commitPresent = (h) => /id="cx-go"/.test(h);
const RENDERED = [];
const capture = (h) => { for (const m of h.matchAll(/<div class="intent-ref-why">([^<]*)<\/div>/g)) RENDERED.push(m[1]); return h; };

/* CLICKING WHAT WAS RENDERED, AND THIS IS *DRIVEN THROUGH THE SURFACE* RATHER
   THAN A PHRASE. The handler is pulled OUT OF THE MARKUP the surface just
   produced and evaluated in the page's own scope — exactly what a browser does
   with that attribute — so the chain from *the control is rendered* to *the act
   happens* is a real link rather than two facts sitting next to each other.
   THE CONTROL FOUND THIS, and it is recorded rather than smoothed: this suite
   first called `concludeNoFalsifier(true)` directly, and arm A — which removes
   the door from the commit slot and leaves everything else standing — came back
   with the whole of sections 4 and 5 STILL GREEN. A member could not reach the
   override at all and the suite said the override worked, because it was
   asserting against a handler the row explicitly says not to assert against. */
/* IT ASSERTS ITS OWN PRECONDITION RATHER THAN THROWING, and that too came from
   the control. Written to throw when the control is absent, arm A ended the
   module before its foot and the driver reported `-1 pass, -1 fail` — the
   harness being honest about a run that did not finish, but a WORSE instrument
   than one that fails by name, which is what the row asks for. A missing
   control is now a named failure and the suite carries on to say what else
   broke. */
function clickRendered(html, id){
  const m = new RegExp(`<button[^>]*id="${id}"[^>]*onclick="([^"]*)"`).exec(html);
  ok(`the surface RENDERED a control with id="${id}" for the member to use — a click needs something to land on`, !!m);
  if (!m) return undefined;
  return vm.runInContext(m[1], ctx);
}
/* UI-65 — THE MEMBER PICKS THE READING FROM WHAT WAS RENDERED. The radio's
   `onchange` is pulled out of the markup and run in the page's scope, entity-
   decoded the way a browser decodes an attribute, for `clickRendered`'s reason:
   a pick asserted against a handler would pass with the picker gone. */
const unent = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">").replace(/&amp;/g, "&");
function pickRendered(html, name){
  const at = html.indexOf(`data-cx-reading="${U.esc(name)}"`);
  const m = at === -1 ? null : /<input type="radio"[^>]*onchange="([^"]*)"/.exec(html.slice(at));
  ok(`the surface RENDERED the reading '${name}' as a choice for the member`, !!m);
  if (!m) return undefined;
  return vm.runInContext(unent(m[1]), ctx);
}
const wireFor = (op) => WIRE.filter((w) => w.op === op);
const lastConclude = () => wireFor("conclude").slice(-1)[0];

/* THE DOCUMENT, READ BACK. Never the op's answer: REC-117's arm B proved the
   answer is computed and passes under a silent override. */
const imageOf = async (id) => rP(await GET(`op=image&token=${PILAR_TOKEN}&id=${id}`))["bundle.md"];
const fmScalar = (text, key) => {
  const m = new RegExp(`^${key}:[ \\t]*(.*)$`, "m").exec(text.split("\n---")[0] || text);
  return m ? m[1].trim().replace(/^"|"$/g, "") : null;
};
const fmHasKey = (text, key) => new RegExp(`^${key}:`, "m").test(text.split("\n---")[0] || text);

/* ============================================================
   2. THE CONDITION IS SURFACED, IN THE PLANE'S OWN WORDS, BEFORE ANY DOOR EXISTS
   ============================================================ */
console.log("\n--- 2. the condition is surfaced, and the door does not exist before it ---");

await U.openConclude(INQ_NOFALS, "Did anyone raise a concern that was never written down?", ACT);
const d0 = capture(dlg());
ok("the dialog opened and the surface asked the plane what it would refuse",
  /<h2>Conclude<\/h2>/.test(d0) && wireFor("conclude").length >= 1);
ok("the first refusal rendered is the plane's NO_CONCLUSION, not NO_FALSIFIER",
  /NO_CONCLUSION/.test(d0) && !/NO_FALSIFIER/.test(d0),
  `rendered codes: ${JSON.stringify([...d0.matchAll(/intent-ref-code mono">([^<]*)</g)].map(m => m[1]))}`);
ok("THE DOOR DOES NOT EXIST while the plane is refusing something else — the override is not a standing control",
  !doorOffered(d0) && !overrideStanding(d0));
ok("and the commit is ABSENT, as it was before this item", !commitPresent(d0));

/* THE MEMBER WRITES THEIR CONCLUSION. The plane's NEXT refusal, in the plane's
   own order, is the one this item is about. */
await U.concludeAuthor("conclusion", "Nothing in the record shows a concern was raised, and nothing shows one was not.");
const d1 = capture(dlg());
/* CORRECTED 2026-09-19 (UI-72), never exempted: pinned on `translation`, not on
   `detail`. THE OLD ASSERTION WAS RIGHT ABOUT THE RULE AND WRONG ABOUT THE FIELD.
   Both are the plane's own sentences — nothing here is composed — but `detail` is
   written for A CALLER OF THE OP and this one ends by naming the query parameter
   `no_falsifier=1`, which is what a member was being shown at the one place a
   person meets the record. DEC-49 licenses the canned `translation`, which is the
   plane's MEMBER-FACING sentence for the same code, and `actRefusalHtml` now
   prefers it on every act surface. The byte-for-byte clause is unchanged and is
   the load-bearing half: whichever field is rendered, it is rendered whole. */
ok("THE CONDITION IS SURFACED: the plane's NO_FALSIFIER refusal is rendered to the member",
  /NO_FALSIFIER/.test(d1) && d1.includes(U.esc(PLANE_NO_FALSIFIER.translation)),
  `the plane's member-facing sentence is ${JSON.stringify(PLANE_NO_FALSIFIER.translation)}`);
ok("and it is rendered BYTE-FOR-BYTE as the plane sent it — the surface writes no sentence of its own about the condition",
  d1.includes(`<div class="intent-ref-why">${U.esc(PLANE_NO_FALSIFIER.translation)}</div>`));
ok("and the CALLER'S sentence — the one naming the op's own `no_falsifier=1` parameter — is NOT what the member reads",
  !d1.includes(U.esc(PLANE_NO_FALSIFIER.detail)));
ok("THE DOOR IS OFFERED, and it is offered HERE — under the refusal that names it", doorOffered(d1));
ok("the commit is still ABSENT while the plane refuses", !commitPresent(d1));
ok("nothing has been written: the question is still open",
  rP(await GET(`op=projection&token=mem-ui64&id=${INQ_NOFALS}`)).current_state === "open");
ok("every pre-flight so far WITHHELD the target, so none of them could have moved anything",
  wireFor("conclude").every((w) => !w.params.target));
ok("and no pre-flight has carried the override the member has not yet taken",
  wireFor("conclude").every((w) => !("no_falsifier" in w.params)));

/* ============================================================
   3. *SURFACED BEFORE OVERRIDDEN* IS STRUCTURAL — THE SECTION THAT MATTERS
   ============================================================
   This is the section the liar fails. `concludeNoFalsifier(true)` is a global
   on the page like every other handler, so "the button is only rendered under
   the refusal" is a fact about MARKUP. The property has to be a fact about the
   ACT, and it is driven here on a FRESH question whose plane answer is a
   DIFFERENT refusal. */
console.log("\n--- 3. the override cannot be taken before the record has said what it is ---");

await U.openConclude(INQ_GUARD, "Who authorised the transfer, if anyone?", ACT);
const g0 = capture(dlg());
ok("the fresh draft is at the plane's NO_CONCLUSION refusal, not the falsifier's",
  /NO_CONCLUSION/.test(g0) && !doorOffered(g0));
await U.concludeNoFalsifier(true);
const g1 = capture(dlg());
ok("CALLING THE OVERRIDE DIRECTLY, WITH THE PLANE REFUSING SOMETHING ELSE, DOES NOTHING",
  !overrideStanding(g1) && !commitPresent(g1));
ok("and it reached the wire nowhere — no request carries an override the record never offered",
  wireFor("conclude").every((w) => !("no_falsifier" in w.params)));
ok("a fresh dialog carries no override from the draft before it — the flag dies with the question it was taken on",
  U.CONCL().noFals === false && U.CONCL().noFalsSaid === null);

/* ============================================================
   4. THE MEMBER TAKES THE DOOR, AND WHAT THEY ACCEPTED STAYS IN FRONT OF THEM
   ============================================================ */
console.log("\n--- 4. the member takes the door, and it does not go quiet ---");

await U.openConclude(INQ_NOFALS, "Did anyone raise a concern that was never written down?", ACT);
await U.concludeAuthor("conclusion", "Nothing in the record shows a concern was raised, and nothing shows one was not.");
const d2 = capture(dlg());
ok("back at the surfaced condition, with the door offered", doorOffered(d2));
await clickRendered(d2, "cx-nofals");      // the rendered control, run the way a browser runs it
const d3 = capture(dlg());
ok("THE OVERRIDE IS TAKEN and the commit becomes reachable", overrideStanding(d3) && commitPresent(d3));
ok("THE CONDITION IS STILL ON SCREEN AT THE MOMENT OF COMMIT, in the plane's own words — not shown once and hidden",
  d3.includes(`<div class="intent-ref-why">${U.esc(PLANE_NO_FALSIFIER.translation)}</div>`),   /* UI-72: the member-facing sentence, as above */
  `the standing block rendered: ${JSON.stringify((/data-nofals="taken"[\s\S]*?(?=<button class="btn" id="cx-go")/.exec(d3) || [""])[0].slice(0, 400))}`);
ok("the way back is offered beside it — an override a member cannot withdraw is a gate wearing the other costume",
  /id="cx-nofals-off"/.test(d3));
ok("and the door itself is gone, because it has been walked through", !doorOffered(d3));
ok("the pre-flight now carries the override, and STILL withholds the target",
  lastConclude().params.no_falsifier === "1" && !lastConclude().params.target);
ok("the falsifier the surface composes is genuinely EMPTY — the override is not a way to send something else",
  U.concludeFalsifier() === "" && lastConclude().params.falsifier === "");

/* THE OTHER DIRECTION, AND THE SURFACE DOES NOT CHOOSE FOR THEM. A member who
   states a falsifier while the override stands has said two different things,
   and the plane refuses rather than picking. Silently clearing either one here
   would be the SURFACE deciding which of a member's two statements it meant —
   the very thing REC-117 refused to let the plane do. */
await U.concludeAuthor("falsifier", "A ledger export showing the concern in writing.");
const d4 = capture(dlg());
ok("stating a falsifier while the override stands is refused BY THE PLANE, in the plane's words",
  /FALSIFIER_AND_NONE_STATED/.test(d4) && d4.includes(U.esc(PLANE_BOTH.translation)));   /* UI-72: as above */
ok("and the surface clears NEITHER statement on the member's behalf",
  overrideStanding(d4) && U.CONCL().falsifierText === "A ledger export showing the concern in writing.");
ok("the commit is absent while those two statements stand together", !commitPresent(d4));
await U.concludeAuthor("falsifier", "");
const d5 = capture(dlg());
ok("clearing the falsifier themselves returns the member to a committable draft",
  overrideStanding(d5) && commitPresent(d5));
/* THE WAY BACK IS DRIVEN, NOT MERELY PRESENT — a mechanism believed on the
   strength of its EXISTENCE rather than its behaviour is the defect this
   project meets most, and an override a member cannot actually withdraw is a
   gate wearing the other costume. It is taken again straight afterwards so
   the rest of the section proceeds from where it was. */
await clickRendered(d5, "cx-nofals-off");
const d6 = capture(dlg());
ok("WITHDRAWING REALLY WITHDRAWS: the standing block goes, the door is offered again, and the plane refuses once more",
  !overrideStanding(d6) && doorOffered(d6) && !commitPresent(d6));
ok("and the withdrawn override leaves the wire — the next request carries no parameter at all",
  !("no_falsifier" in lastConclude().params));
await clickRendered(d6, "cx-nofals");
const d7 = capture(dlg());
ok("taking it again from the rendered door returns the member to a committable draft",
  overrideStanding(d7) && commitPresent(d7));

/* ============================================================
   5. THE ACT, AND THE DOCUMENT READ BACK — NEVER THE ENVELOPE
   ============================================================ */
console.log("\n--- 5. the act, and what the RECORD then carries ---");

pickRendered(capture(dlg()), ADOPTED_READING);
await U.doConclude();
const rc = capture(dlg());
const before = wireFor("conclude").length;
ok("the act was committed through the surface, carrying the override and the target together",
  lastConclude().params.target === INQ_NOFALS && lastConclude().params.no_falsifier === "1");
ok("the surface shows the record's own receipt", /<h2>Concluded<\/h2>/.test(rc));
ok("THE RECEIPT NAMES WHO ACCEPTED THE ABSENCE AND WHEN — read off the plane's answer, not this page's memory of what it sent",
  /data-nofals="receipt"/.test(rc) && /pilar/.test(rc),
  rc.slice(0, 600));

const DOCTEXT = await imageOf(INQ_NOFALS);
ok("the question really moved: the record holds it as concluded",
  fmScalar(DOCTEXT, "current_state") === "concluded",
  `state was ${JSON.stringify(fmScalar(DOCTEXT, "current_state"))}`);
ok("THE DOCUMENT CARRIES WHO OVERRODE — the read-back, because REC-117's arm B proved the op's ANSWER passes under a silent override",
  fmScalar(DOCTEXT, "falsifier_override_by") === "pilar",
  `falsifier_override_by was ${JSON.stringify(fmScalar(DOCTEXT, "falsifier_override_by"))}`);
ok("THE DOCUMENT CARRIES WHEN, and it is a real stamp rather than an empty marker",
  /^\d{4}-\d{2}-\d{2}T/.test(String(fmScalar(DOCTEXT, "falsifier_override_at") || "")),
  `falsifier_override_at was ${JSON.stringify(fmScalar(DOCTEXT, "falsifier_override_at"))}`);
ok("the falsifier field is EMPTY, and the absence is asserted BESIDE it rather than inferred from it",
  (fmScalar(DOCTEXT, "falsifier") || "") === "");
ok("the Session Log STATES the absence rather than printing a blank line a reader cannot tell from an unfilled field",
  /Falsifier: NO FALSIFIER STATED — recorded by pilar at \d{4}-\d{2}-\d{2}T/.test(DOCTEXT),
  (/Falsifier:.*/.exec(DOCTEXT) || ["<no Falsifier line>"])[0]);
/* SCOPED TO THE OVERRIDE BLOCK, AND THE CONTROL IS WHY. Written as
   `rc.includes(<the document's override timestamp>)` it passed under arm D,
   which deletes the override block from the receipt entirely — because
   `falsifier_override_at` and the receipt's ordinary `at` are THE SAME VALUE,
   so the check was satisfied by a line that says nothing about the override.
   An equality that costs nothing to produce is not evidence, and this one cost
   nothing. It now reads the `data-nofals="receipt"` cell and nothing else. */
const RCELL = /<div data-nofals="receipt">([\s\S]*?)<\/div>/.exec(rc);
ok("the receipt's who and when are the DOCUMENT'S who and when — read out of the override cell itself, not out of the receipt at large",
  !!RCELL && RCELL[1].includes(fmScalar(DOCTEXT, "falsifier_override_by"))
  && RCELL[1].includes(fmScalar(DOCTEXT, "falsifier_override_at")),
  RCELL ? RCELL[1] : "<no override cell in the receipt>");
ok("committing sent exactly ONE more request to op=conclude — the commit, not a second act",
  wireFor("conclude").length === before);

/* ============================================================
   6. OVER-STRICTNESS — THE ORDINARY JOURNEY IS UNTOUCHED
   ============================================================
   This row ADDS a path. A member who can state a falsifier must not meet it,
   and their request must be the one this surface sent before the item existed. */
console.log("\n--- 6. a member who CAN state a falsifier meets none of this ---");

const wireBefore = WIRE.length;
await U.openConclude(INQ_STATED, "Did the sewer fund pay for marina construction?", ACT);
await U.concludeAuthor("conclusion", "The sewer enterprise fund paid for marina construction in the 2024 cycle.");
const s1 = capture(dlg());
ok("with the falsifier still empty the door IS offered, because that member is this item's member too",
  doorOffered(s1));
await U.concludeAuthor("falsifier", "A general-ledger export showing no transfer from fund 601.");
const s2 = capture(dlg());
ok("ONCE A FALSIFIER IS STATED THE ADDED PATH IS NOWHERE ON THE PAGE — not offered, not standing, not a disabled control",
  !/data-nofals/.test(s2) && !/cx-nofals/.test(s2) && !/disabled/.test(s2));
ok("the ordinary commit is present exactly as before", commitPresent(s2));
ok("the surface still shows what will be recorded, verbatim, unchanged by this item",
  /Recorded verbatim as: <span class="mono">A general-ledger export showing no transfer from fund 601\.<\/span>/.test(s2));
ok("THE EMPTY-FALSIFIER HINT NO LONGER STATES THE RECORD'S GATE AS ABSOLUTE — the one line of the ordinary journey this item legitimately moved, corrected because REC-117 made it FALSE",
  /Nothing yet\.<\/div>/.test(s1) && !/The record refuses a conclusion that says nothing would overturn it/.test(s1 + s2));

pickRendered(capture(dlg()), ADOPTED_READING);
await U.doConclude();
const sr = capture(dlg());
const STATEDCALLS = WIRE.slice(wireBefore).filter((w) => w.op === "conclude");
ok("this suite actually drove the ordinary journey over the wire", STATEDCALLS.length >= 2);
ok("NOT ONE of that member's requests carries the parameter — absent, never `0`, and never the string \"undefined\"",
  STATEDCALLS.every((w) => !("no_falsifier" in w.params))
  && STATEDCALLS.every((w) => !/no_falsifier/.test(w.url.search)),
  JSON.stringify(STATEDCALLS.map((w) => w.url.search)));
ok("and the receipt says nothing about an override, because the plane answered null",
  !/data-nofals="receipt"/.test(sr) && /<h2>Concluded<\/h2>/.test(sr));

const STATEDDOC = await imageOf(INQ_STATED);
ok("that member's question really concluded", fmScalar(STATEDDOC, "current_state") === "concluded");
ok("their falsifier is on the record verbatim",
  fmScalar(STATEDDOC, "falsifier") === "A general-ledger export showing no transfer from fund 601.",
  `got ${JSON.stringify(fmScalar(STATEDDOC, "falsifier"))}`);
ok("AND THEIR DOCUMENT CARRIES NO OVERRIDE PAIR AT ALL — the marker can only appear where a member put it",
  !fmHasKey(STATEDDOC, "falsifier_override_by") && !fmHasKey(STATEDDOC, "falsifier_override_at"),
  `by=${JSON.stringify(fmScalar(STATEDDOC, "falsifier_override_by"))} at=${JSON.stringify(fmScalar(STATEDDOC, "falsifier_override_at"))}`);
ok("their Session Log carries their own sentence and not the absence's",
  /Falsifier: A general-ledger export showing no transfer from fund 601\./.test(STATEDDOC)
  && !/NO FALSIFIER STATED/.test(STATEDDOC));

/* THE OVER-STRICTNESS ARM IN THE SPELLING THIS ITEM DID NOT ANTICIPATE, AND IT
   IS THE ONE HARD 2 ACTUALLY BUILT. A member states a falsifier by POINTING —
   ticking the legs that would break the finding if they went the other way —
   and types nothing at all. `concludeFalsifier` composes from the selection and
   the text, so this member's falsifier is non-empty while their textarea is
   empty, which is precisely the shape a door keyed on *the textarea is blank*
   would get wrong. The door must close for them exactly as it closes for
   someone who typed. */
console.log("\n--- 6b. a member who states it by POINTING, having typed nothing ---");
const pointBefore = WIRE.length;
await U.openConclude(INQ_GUARD, "Who authorised the transfer, if anyone?", ACT);
await U.concludeAuthor("conclusion", "The memo names no authorising officer, and no other record does either.");
const b1 = capture(dlg());
ok("with nothing ticked and nothing typed, the door is offered", doorOffered(b1));
await U.concludeToggle(DOC);
const b2 = capture(dlg());
ok("TICKING A LEG STATES A FALSIFIER, and the textarea is still empty — the derivation HARD 2 built",
  U.concludeFalsifier() === DOC && U.CONCL().falsifierText === "");
ok("THE ADDED PATH CLOSES FOR THEM TOO — a door keyed on the textarea rather than on the plane's answer would still be standing open here",
  !/data-nofals/.test(b2) && !/cx-nofals/.test(b2));
ok("and their commit is present, because the plane has nothing left to refuse", commitPresent(b2));
pickRendered(b2, ADOPTED_READING);
await U.doConclude();
const POINTDOC = await imageOf(INQ_GUARD);
ok("the record carries the leg they pointed at as the falsifier, verbatim",
  fmScalar(POINTDOC, "falsifier") === DOC, `got ${JSON.stringify(fmScalar(POINTDOC, "falsifier"))}`);
ok("and no override pair, because they stated one",
  !fmHasKey(POINTDOC, "falsifier_override_by") && !fmHasKey(POINTDOC, "falsifier_override_at"));
ok("no request of theirs carried the parameter either",
  WIRE.slice(pointBefore).filter((w) => w.op === "conclude").every((w) => !("no_falsifier" in w.params)));

/* ============================================================
   7. DEC-8 — NO SENTENCE ABOUT THE CONDITION ORIGINATES IN THE SURFACE
   ============================================================ */
console.log("\n--- 7. DEC-8: every sentence the member read came back over the wire ---");

const APP = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
ok("this suite actually rendered refusals to check", RENDERED.length >= 4);
const invented = RENDERED.filter((s) => ![...SAID].some((d) => U.esc(d) === s));
ok(`every refusal sentence rendered came back over the wire${invented.length ? ` — invented: ${JSON.stringify(invented)}` : ""}`,
  invented.length === 0);
ok("the plane's NO_FALSIFIER sentence is NOWHERE in app.html — the surface renders it, it does not know it",
  !APP.includes(PLANE_NO_FALSIFIER.detail) && !APP.includes(PLANE_NO_FALSIFIER.translation));
ok("nor is the plane's both-at-once sentence",
  !APP.includes(PLANE_BOTH.detail) && !APP.includes(PLANE_BOTH.translation));   /* UI-72: BOTH fields, since
  the surface now renders the translation — an absence assertion over the field nobody renders proves nothing. */
ok("and the surface still names only the ONE reason code it provokes by withholding a field",
  APP.includes('a.refusal.reason === "NO_TARGET"'));
/* THE ONE CODE THIS ITEM ADDS TO THE SURFACE'S VOCABULARY IS A READ, NOT A
   RENDER: the door asks WHICH refusal is standing so it can refuse to open
   under any other. It renders no sentence of its own for it. */
ok("the override door keys on the plane's reason CODE and renders none of the plane's prose itself",
  /refusal\.reason !== "NO_FALSIFIER"/.test(APP) && !/reason:\s*"NO_FALSIFIER"/.test(APP));

/* ============================================================
   8. THE PUBLISHED RENDER REC-117 LANDED IS UNTOUCHED
   ============================================================ */
console.log("\n--- 8. REC-117's published render, unmoved ---");
/* NAMED WRONG ON THE FIRST RUN AND THE ASSERTION IS WHAT SAID SO, which is the
   whole reason it is a structural check and not a comment. This file first
   pinned `elicFalsifier` — a DIFFERENT function, in the elicitation flow, which
   composes the member's own falsifier out of their leg answers and has nothing
   to do with the published page. The regex matched it, returned 317 bytes, and
   the three-cause assertion failed. The published cell is `pubFalsifierHtml`,
   and the lesson is the costs-nothing rule in miniature: a sha over the wrong
   function would have been a perfectly stable pin on something this item was
   never at risk of moving. */
const PUBF = /function pubFalsifierHtml\(f\)\{[\s\S]*?\n\}\n/.exec(APP);
ok("the published finding's falsifier cell is still in app.html, under its own name", !!PUBF);
ok("it still distinguishes the THREE causes REC-117 separated — stated, none-stated-and-attributed, and absent",
  !!PUBF && /data-falsifier="stated"/.test(PUBF[0]) && /data-falsifier="none-stated"/.test(PUBF[0])
  && /data-falsifier="absent"/.test(PUBF[0]) && /data-overrideby=/.test(PUBF[0]) && /data-overrideat=/.test(PUBF[0]));
ok("it names the member and the date in the published bytes, which is where Bob said this must be visible",
  !!PUBF && /No falsifier was stated for this finding\./.test(PUBF[0])
  && /recorded on \$\{esc\(String\(ov\.at\)\)\} that none could honestly be given/.test(PUBF[0]));
ok("and this item touched none of it — the sha256 is PRINTED rather than pinned, so a later change is visible without this line going stale",
  !!PUBF);
console.log(`  pubFalsifierHtml: ${PUBF ? sha(PUBF[0]) : "<absent>"}  (${PUBF ? PUBF[0].length : 0} bytes)`);

/* ------------------------------------------------------------------
   THE FOOT. A `TypeError` inside an assertion goes through NO assertion at all
   and ends the module while the tally still reads clean, so the run is only
   believable if it reached here and said so. */
/* CORRECTED 2026-09-18 by UI-65, and the old assertion was RIGHT UNTIL NOW:
   it read "the SURFACE sent no reading on any conclude, and the harness
   supplied it" — REC-136's stand-in, stated rather than silent, built to fail
   the day the surface gained its picker. The stand-in is gone, so what is
   asserted now is the surface's OWN wire: every COMMIT (a conclude carrying a
   target) names the reading the member picked, and nothing supplied it on the
   way. */
const COMMITS = WIRE.filter(w => w.op === "conclude" && w.params.target);
ok("UI-65: every conclude the SURFACE committed names the reading the member PICKED — the transport supplies nothing",
   COMMITS.length >= 3 && COMMITS.every(w => w.params.version === ADOPTED_READING),
   JSON.stringify(COMMITS.map(w => w.params.version)));
console.log(`\nconclude-nofalsifier: ${pass} pass, ${fail} fail`);
/* `process.exit` would leave miniflare holding the event loop open and the
   process would hang after a green run; dispose first, then set the code. */
await mf.dispose();
if (fail) process.exitCode = 1;
