/* UI-99 — A DECLARED FLOW'S REVISION SHOWS ITS BASIS, AND A SET-ASIDE FINDING SAYS WHICH VERSION
 * OF THAT FLOW IT JUDGED. AGAINST THE REAL PLANE, THROUGH THE SURFACE'S OWN HANDLERS.
 *
 * THE DESIGN (`BIO_Content_Framework_v0_10.md` §8.2, "The declared flow, and its revisions"; BOB #27,
 * 2026-09-22; built on the plane by D-128 and REC-184). A progression definition is the group's
 * declared flow and is APPEND-ONLY: a revision writes a new version carrying its author, date and
 * BASIS — the member's statement of why the flow changes and a citation for where that is published
 * or held — every earlier version stands and reads back, and a decision about a proposal the flow
 * produced judges THE VERSION IT WAS TAKEN AGAINST and no later one. A decision written before the
 * record kept that column reads `not recorded`, never back-filled.
 *
 * WHAT WAS ON NO PAGE, measured before building (UI-99's row, found by REC-184's worker):
 *   - `progLoad` read `op=progression` for its stages and threw `versions[]` away, so the basis a
 *     member wrote through UI-83's form, the author and date the plane stamped, and the earlier
 *     version the receipt promises "stays on the record beside it" reached nobody;
 *   - `op=queue`'s `disposed` block was read by NO surface at all (`grep -n "\.disposed" app.html`
 *     found one hit, `res.disposed` inside an act's own receipt), so the only set-aside decisions a
 *     member ever saw were the ones the page remembered from its own acts — which survive neither a
 *     reload nor a second member, and which can never carry `not recorded` because a fresh act is
 *     always stamped with a version.
 *
 * THE INSTRUMENT. The real plane in miniflare, with `bio-plane/test/proposedispose.test.mjs`'s
 * ProbeStore subclass adding ONE raw-SQL route (and nothing else) so the pre-REC-184 shape can be
 * made the way that suite makes it — the column DROPPED from a live store and the store re-booted on
 * the same storage, `#migrate` putting it back NULL. Every act and every read goes through the
 * control plane. `app.html`'s own `fetch` is bridged to it, and the surface is driven through its own
 * handlers (`renderProgressions`, `progKeyChanged`, `progDefineGo`, `progLoad`, `renderQueue`).
 *
 * A REAL SIGNED-IN MEMBER, NEVER THE DEPLOY MEMBER_TOKEN (REC-189: that token is a MACHINE identity,
 * `class:member`, so an act driven with it is not a member's act). IRIS is enrolled through
 * op=memberadd / op=enroll / op=login and the surface carries her session token.
 *
 * THE ARMS, in the row's accepts-when order:
 *   1. the declared flow's history renders beside the stages: version 2 named as what stands, its
 *      basis and citation in the member's own words, version 1 standing beside it, and version 1's
 *      absent basis stated as `not recorded` IN WORDS rather than left blank;
 *   2. it renders even when the SUBJECT is not known — the flow's history is the definition's, and
 *      that path used to leave a member a refusal sentence and no sight of what they had revised;
 *   3. a set-aside finding on the queue names the version it judged and says it still governs;
 *   4. after a revision the same decision says it no longer answers the question — the reopening
 *      §8.2 rules, on the page;
 *   5. a decision written before the record kept the version reads `not recorded` IN WORDS, with no
 *      number invented in its place.
 *
 * WHAT THIS SUITE CANNOT SEE, stated so a green run is not read as more than it is: it drives
 * `civicos-ui/app.html` only, so the same two facts rendered wrongly by any other member-facing
 * surface are invisible here; it asserts what the painted HTML SAYS, not how it looks; and it says
 * nothing about `op=proposals`' own `prior_disposition`, which no surface reads at all (named in
 * UI-99's report, not fixed here).
 *
 * GATE: reads bio-plane/src/ bio-plane/checks/bio-checks.mjs docprofile/
 *   (M0-126 condition 2, declared because `mention` CANNOT see these reads and the first gate said so — RED with
 *   `underinclusion:ui:declared-flow-surface.test.mjs`, naming 50 files. The sibling `progression-revision.test.mjs`
 *   needs no such line because it hands miniflare `new URL("../../bio-plane/src/index.mjs")` and reads that file, so
 *   the closure walks the whole plane from a path written literally in its source. THIS suite hands miniflare a probe
 *   SCRIPT whose `import "./index.mjs"` and `import "./store.mjs"` live inside a template literal, and its `scriptPath`
 *   names a file that does not exist on disk — it is only the directory the probe's relative imports resolve against,
 *   which is `bio-plane/test/proposedispose.test.mjs`'s own arrangement. So the plane it actually runs is invisible to
 *   the derivation, and the honest fix is to declare it rather than to decorate the source with a read it does not do.
 *   The directory, not a list of 50 names: a plane file added tomorrow is one this suite runs and one no list would
 *   name — and over-inclusion costs only a re-run. `docprofile/` is the third token and it was NOT free: the first
 *   declaration was built from the twelve names the gate PRINTED, and the message ends `(+38 more)` — so the second
 *   gate came back RED again, at 17, every one of them under `docprofile/`, which the plane imports. Recorded because
 *   the lesson is the instrument's, not this suite's: a truncated list is a POINTER to the trace, never the trace, and
 *   a declaration derived from what fits on one line is a declaration derived from a sample. Each token is a
 *   DIRECTORY and `under` maps every ancestor prefix, so each covers its whole subtree.)
 *
 * NEGATIVE CONTROL: RUN 2026-09-24 by UI-99 against `civicos-ui/app.html`
 * `2f62b15f48064f84875ec0c4434781d5e41787daee62ad8a31151de68fc85c72` (1,590,490 bytes), four arms, each
 * armed ALONE by ONE anchored replacement asserted to match exactly once, each restored by `cp` from a
 * PER-ARM pristine copy with sha256 AND `cmp` verified and the byte count guarded, the file IDENTICAL to
 * pristine at the end — **4/4 AS DECLARED**. BASELINE GREEN 38 asserted / 0 failed.
 *   (A) HIDE `not recorded` ON THE DISPOSITION — `disposedFlowVersionHtml`'s not-recorded sentence
 *       replaced by the empty string. DECLARED: arm 5 fails by name; arms 1, 3 and 4 stay green.
 *       -> RED, 2 of 38 — "THE ROW'S SECOND HALF: which version it judged reads `not recorded`, IN WORDS"
 *       and "and the words are the sentence a member reads, not a bare token". Arms 1-4 green.
 *   (B) HIDE `not recorded` ON A VERSION'S BASIS — `progVersionBasisHtml`'s both-absent sentence replaced
 *       by the empty string. DECLARED: arm 1's version-1 assertion fails by name; arms 3, 4 and 5 stay
 *       green. -> RED, 1 of 38 — "version 1's absent basis is stated as `not recorded` IN WORDS, never
 *       left blank", and nothing else. THAT ONE-LINE RESULT IS THE POINT OF ARMING THE TWO PLACES APART:
 *       the two surfaces write the same words and neither inherits the other's coverage.
 *   RUN THREE TIMES, 4/4 EACH TIME, and all three are kept because a control's value is the arms it ran:
 *       against app.html `cc76798ea5c9…` (1,582,075 B, base `e9b21be6`, 37 assertions), against
 *       `415fd2b0e785…` (1,590,012 B, after the rebase onto `origin/main` @ `1a7f0bcc`, the c20-batch24c
 *       train carrying REC-211, 37 assertions), and against the sha above (38 assertions, after two
 *       corrections found by re-reading the diff adversarially: the row's `whose` sentence said what the
 *       decision DID to the list, which contradicts a row whose `applies` is false, and the empty-block
 *       case was a paragraph where one line says the fact). The figures above are the third run's.
 *   (C) OVER-STRICTNESS — both sentences rewritten in a spelling this suite was not written against: the
 *       words upper-cased and marked up with `<em>` instead of `<b>`. DECLARED GREEN -> GREEN 38 / 0,
 *       because every sentence assertion here runs over what a member READS (tags stripped, entities
 *       opened, case-insensitive) and never over the markup.
 * RE-RUN 2026-09-25 by UI-109 against app.html `4496bd0cc504…` (1,621,458 B), after UI-109 put a second
 * `not recorded` on the queue (the reopened FINDING item's `prior_disposition`): FIRST 3/4 — arm (A) RED 1 of
 * 38 and NOT naming THE ROW'S SECOND HALF, because arm 5 read the whole queue and the item's words kept it
 * green. Arm 5 was CORRECTED to read the set-aside row itself (comment at the site); then 4/4 AS DECLARED,
 * BASELINE 38 / 0, (A) RED 2 of 38 by the same two names as above, (B) RED 1 of 38, (C) GREEN 38 / 0.
 * The driver is re-runnable in one step and prints these figures again: `node
 * civicos-ui/test/declared-flow-surface.control.mjs`.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard its output. */
import fs from "fs";
import vm from "vm";
import { webcrypto, createHash } from "crypto";
import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* WHAT A MEMBER READS, not how it is marked up. Every sentence assertion below runs over the
   painted HTML with its tags stripped, its entities opened and its whitespace collapsed, and
   matches case-insensitively — so the over-strictness arm of this suite's control (the same words
   in a spelling nobody anticipated: upper case, inside an `<em>` rather than a `<b>`) stays GREEN,
   and a change that keeps the words while moving the markup is not reported as a defect. */
const text = (h) => String(h||"")
  .replace(/<[^>]*>/g, " ")
  .replace(/&mdash;/g, "\u2014").replace(/&rsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"')
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/\s+/g, " ").trim();
const says = (h, re) => re.test(text(h));
const saysNotRecorded = (h) => says(h, /not recorded/i);

/* ---- the REAL plane, in miniflare, resolved from bio-plane's dev dependency (intent-write's
   instrument). Not installed -> FAIL, never skip: a suite that quietly stops testing its subject is
   the defect this project meets most. ---- */
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("declared-flow-surface: the real plane could not be started — run `npm ci` in bio-plane/.");
  console.error("  " + String(e && e.message || e));
  process.exit(1);
}
/* The ONE added route is raw SQL, and it exists for exactly one reason: the pre-REC-184 shape of
   `proposal_dispositions` cannot be authored through any op (op=proposedispose always stamps the
   version from the store), so the row is made the way `bio-plane/test/proposedispose.test.mjs` makes
   it — DROP the column on a live store, re-boot on the same storage, and let `#migrate` put it back
   NULL. Nothing else in the plane is subclassed, and every act and read below goes through the
   control plane. */
const PROBE = `
import worker from "./index.mjs";
import { Store } from "./store.mjs";
export class ProbeStore extends Store {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/rawsql") {
      const { sql, args = [] } = await req.json();
      try { return Response.json({ ok: true, rows: [...this.sql.exec(sql, ...args)] }); }
      catch (e) { return Response.json({ ok: false, error: String(e && e.message || e) }); }
    }
    return super.fetch(req);
  }
}
export default worker;
`;
const opts = (version) => ({
  modules: true, script: PROBE, modulesRoot: "/",
  scriptPath: fileURLToPath(new URL("../../bio-plane/src/ui99-declared-flow-probe.mjs", import.meta.url)),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui99", MEMBER_TOKEN: "mem-ui99", PROBE_TOKEN: "prb-ui99", VERSION: version,
              INSTANCE_NAME: "fixture-group" },
});
const mf = new Miniflare(opts("test"));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}${tok ? "&token=" + tok : ""}`, { method:"POST", body: JSON.stringify(body) })).json());
const get  = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const raw = async (sql) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return (await ns.get(ns.idFromName("bio")).fetch("http://x/rawsql",
    { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ sql }) })).json();
};
const cols = async () => ((await raw("PRAGMA table_info(proposal_dispositions)")).rows || []).map(r=>r.name);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ---- a REAL enrolled member with a session. The first two roster members are administrators (the
   roster's own rule, intent-write's arrangement); IRIS declares, revises and reads. ---- */
const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:caps }, "adm-ui99");
  if(!add || !add.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await post("enroll", { invite:add.invite, handle:id, password:`${id}-passphrase-1` });
  if(!en || !en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role:`member:${id}`, password:`${id}-passphrase-1` });
  if(!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await member("ruth", ["contribute"], "admin");
await member("gus",  ["contribute"], "admin");
const IRIS = await member("iris", ["contribute"]);
const ME = await get("whoami", "", IRIS);
ok("the surface's credential is a SESSION, signed in as a member — not the deploy member token",
   ME && ME.session === true && typeof ME.member === "string" && ME.member.length > 0);

/* ---- the DOM stub and the bridge (progression-revision's shape) ---- */
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
const CALLED = [];
async function bridgeFetch(u, opts2){
  const url = new URL(u, "http://x");
  CALLED.push({ op:url.searchParams.get("op"), token:url.searchParams.get("token"), body:opts2 && opts2.body });
  return mf.dispatchFetch(url.toString(), opts2);
}
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
  IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1},
  requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:bridgeFetch };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE","PROG","renderProgressions","progAddStage","progKeyChanged","progDefinePreflight","progDefineGo",
  "progLoad","renderQueue","esc",
].join(",") + "};", ctx);
const U = ctx.__U;
U.PLANE.token = IRIS;
U.PLANE.session = true;
U.PLANE.me = ME;

const fill = (stages) => stages.forEach((s, i) => {
  $$(`#pg-st-${i}-key`).value = s.key; $$(`#pg-st-${i}-label`).value = s.label;
  $$(`#pg-st-${i}-card`).value = s.card || "1"; $$(`#pg-st-${i}-after`).value = s.after || "";
  $$(`#pg-st-${i}-req`).value = s.req || "always";
});

/* ============================================================
   FIXTURE: a declared flow, revised once, with its basis
   ============================================================ */
console.log("\n--- fixture: council-meeting declared, then revised through the member's own form ---");
await U.renderProgressions();
$$("#pg-key").value = "council-meeting";
$$("#pg-label").value = "How a council meeting is supposed to go";
fill([{ key:"agenda", label:"The agenda" }, { key:"minutes", label:"The minutes", after:"agenda" }]);
await U.progKeyChanged();
await U.progDefineGo();
const v1 = await get("progression", "key=council-meeting", IRIS);
ok("the plane holds version 1 of the declared flow, authored by the signed-in member",
   v1.found === true && v1.version === 1 && v1.version_count === 1 && v1.declared_by === ME.member);
ok("and version 1 carries NO basis — the first declaration is not required to state one",
   v1.basis && v1.basis.stated === false);

const BASIS = "The Sunshine Ordinance requires a public notice ten days before a regular meeting.";
const CITE  = "Oakland Municipal Code 2.20.070";
await U.renderProgressions();
$$("#pg-key").value = "council-meeting";
$$("#pg-label").value = "How a council meeting is supposed to go";
await U.progKeyChanged();
await U.progAddStage();
$$("#pg-key").value = "council-meeting";
await U.progKeyChanged();
fill([{ key:"notice", label:"The public notice" },
      { key:"agenda", label:"The agenda", after:"notice" },
      { key:"minutes", label:"The minutes", after:"agenda" }]);
$$("#pg-basis").value = BASIS; $$("#pg-cite").value = CITE;
await U.progDefinePreflight();
await U.progDefineGo();
const v2 = await get("progression", "key=council-meeting", IRIS);
ok("the plane holds version 2 as current, carrying the member's statement and citation verbatim",
   v2.version === 2 && v2.current === true && v2.version_count === 2
   && v2.basis && v2.basis.statement === BASIS && v2.basis.citation === CITE);

/* ============================================================
   1. the declared flow's history, beside the stages
   ============================================================ */
console.log("\n--- 1. a revision's BASIS renders beside its version ---");
const eM = await post("entitycreate", { kind:"body", label:"City Council", aliases:["body:council"] }, IRIS);
ok("a subject the record knows is registered for the flow to be threaded by", eM && !!eM.entity_id);
$$("#pg-look-key").value = "council-meeting";
$$("#pg-look-subj").value = "body:council";
await U.progLoad();
const inst = html("#pg-inst");
/* THE CORPUS, PRINTED AND FLOORED (WORKER.md): a headline assertion over an EMPTY page passes for
   free, and this project has measured that three times. The page must be non-trivial and the
   record must hold exactly the two versions this fixture wrote. */
console.log(`  CORPUS: the painted instance pane is ${inst.length} bytes; the record holds `
  + `${(v2.versions||[]).length} version(s) of council-meeting`);
ok("the instance pane is not empty — a headline assertion over an empty page is evidence of nothing",
   inst.length > 500 && (v2.versions||[]).length === 2);
ok("the flow's history is on the page, under a heading a member can read",
   says(inst, /how this declared flow has changed/i));
ok("version 2 is named, and named as WHAT STANDS NOW — the plane's number, not one this screen counted",
   says(inst, /Version 2 \u2014 what stands now/i));
ok("with the member's own statement of why it changed, verbatim", inst.includes(U.esc(BASIS)));
ok("and the citation for where that is published or held, verbatim", inst.includes(U.esc(CITE)));
ok("version 1 stands beside it on the same page, and is NOT shown as what stands now",
   says(inst, /Version 1 \u2014 kept on the record, and not what stands now/i));
ok("each version names who declared it — the member the plane stamped", says(inst, /declared by iris/i));
/* THE ROW'S OWN CONTROL SUBJECT on this half: version 1 has no basis, and the page SAYS SO IN WORDS. */
ok("version 1's absent basis is stated as `not recorded` IN WORDS, never left blank",
   saysNotRecorded(inst) && says(inst, /why this version says what it says is not recorded/i));
ok("and the read that produced all of it is the plane's own op=progression, carrying the member's session",
   CALLED.some(c => c.op === "progression" && c.token === IRIS));

/* ============================================================
   2. the history is the DEFINITION's, so an unknown subject does not hide it
   ============================================================ */
console.log("\n--- 2. an unknown subject no longer hides the flow a member just revised ---");
$$("#pg-look-key").value = "council-meeting";
$$("#pg-look-subj").value = "nobody the record knows by this name";
await U.progLoad();
const noSubj = html("#pg-inst");
ok("the record's refusal to invent a subject is still said plainly", says(noSubj, /no subject in the registry is known by/i));
ok("and the declared flow's own history is shown beside it rather than withheld",
   says(noSubj, /how this declared flow has changed/i) && says(noSubj, /Version 2/) && says(noSubj, /Sunshine Ordinance/));

/* ============================================================
   FIXTURE: a proposal the declared flow produced, and a decision about it
   ============================================================ */
console.log("\n--- fixture: a grant flow with a missing required stage, set aside by the member ---");
const NOW = "2026-09-24T00:00:00Z";
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
  "## Summary", "", "A grant document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
await post("progressiondefine", { progressionKey:"grant", label:"How a grant is supposed to go",
  stages:[{ key:"application", label:"the application", cardinality:"1", required:"usually" },
          { key:"award", label:"the award", after:"application", cardinality:"1", required:"always" }] }, IRIS);
const eG = await post("entitycreate", { kind:"fund", label:"Grant G", aliases:["fund:G"] }, IRIS);
const gAward = sha("ui99-G-award");
{
  const id = "INFO-2026-0001-ui99", md = bundleMd(id);
  const prov = JSON.stringify({ documents: [{ capture:{ sha256:gAward, encoding:"binary", bytes:10 },
    reading:{ content_type:"meeting_calendar", reader_version:1, found:true, at:NOW,
              entities:[{ ref:"fund:G", kind:"fund", key:"G", label:"Grant G" }] } }] });
  const pr = await post("promote", { bundleId:id, base:null, snapKey:"20260924T010000Z_cccc3333", author:"ui99",
    meta:{ object_type:"information", group:"believe-in-oakland", title:`Doc ${id}`,
           current_state:"collected", created:NOW, last_updated:NOW },
    files:[{ path:"bundle.md", text:md, bytes:md.length, sha256:sha(md) },
           { path:"data/provenance.json", text:prov, bytes:prov.length, sha256:sha(prov) }], register:[] }, IRIS);
  ok("a real captured document is on the record for the flow to be threaded with", pr && pr.ok !== false);
}
await post("resolve", { captureSha:gAward }, IRIS);
await post("thread", { progressionKey:"grant", entityId:eG.entity_id,
  placements:[{ stage:"award", captureSha:gAward }] }, IRIS);
await sleep(5);   /* the decision's instant is strictly after the declaration's (REC-184's order rule) */
/* REC-211 (IC-273, 2026-09-24): the ACT now binds the version the MEMBER SAW — an act naming none is
   refused NO_DEFINITION_VERSION and one naming a version that is not standing is refused
   DEFINITION_MOVED, both before any write. So the version is sent, exactly as `app.html`'s own send
   paths send it off the plane's published `disposition` block. */
const disp = await post("proposedispose", { key:"grant::application", to:"dismissed", definitionVersion:1,
  reason:"This fund took applications by telephone that year, so there is no document to find." }, IRIS);
ok("the member's decision is recorded against version 1 of the flow — the version the act named and the store held",
   disp && disp.ok !== false && disp.definition_version === 1);

/* ============================================================
   3. the queue says which version the decision judged
   ============================================================ */
console.log("\n--- 3. a set-aside finding names the version of the declared flow it judged ---");
await U.renderQueue();
const q1 = html("#q");
const qFeed = await get("queue", "limit=500", IRIS);
console.log(`  CORPUS: the painted queue is ${q1.length} bytes; the record's disposed block holds `
  + `${((qFeed.disposed||{}).findings||[]).length} of ${(qFeed.disposed||{}).recorded} decision(s), bound `
  + `${(qFeed.disposed||{}).bound}`);
ok("the queue is painted and the record holds exactly the one decision this fixture took",
   q1.length > 500 && ((qFeed.disposed||{}).findings||[]).length === 1 && (qFeed.disposed||{}).recorded === 1);
ok("the record's own set-aside block is on the queue at all — `op=queue`'s `disposed`, which no surface read",
   says(q1, /what the record itself holds as set aside/i));
ok("and says whose decision it is rather than what it did to the list — a row that no longer answers the "
 + "question did not take anything off anybody's list, so the two sentences cannot contradict",
   says(q1, /it is a decision about the shared record, not one team's/i));
ok("naming the finding it took off the list, in the flow's and the stage's own words",
   /data-flowdisposed="grant::application"/.test(q1)
   && says(q1, /Grant, the Application stage \u2014 set aside/i));
ok("with the decision's state, its author and its instant, all the record's",
   says(q1, /set aside as dismissed by iris on 2026-/i));
ok("and the member's reason as the record recorded it", says(q1, /took applications by telephone/i));
ok("THE ROW'S FIRST HALF: it names the version of the declared flow it judged",
   says(q1, /it judged version 1 of the declared flow/i));
ok("and says that version is still the one standing, so the decision still answers the question",
   says(q1, /still the one standing/i));
ok("nothing on this queue claims the version is not recorded, because it is", !saysNotRecorded(q1));

/* ============================================================
   4. after a revision the same decision says it no longer answers
   ============================================================ */
console.log("\n--- 4. the flow is revised: the decision is kept, and stops answering ---");
await sleep(5);
const grantV2 = await post("progressiondefine", { progressionKey:"grant", label:"How a grant is supposed to go",
  stages:[{ key:"application", label:"the written application", cardinality:"1", required:"usually" },
          { key:"award", label:"the award", after:"application", cardinality:"1", required:"always" }],
  basis:"The fund now takes written applications only.", citation:"Fund guidelines 2026" }, IRIS);
ok("the flow is at version 2", grantV2 && grantV2.version === 2);
await U.renderQueue();
const q2 = html("#q");
ok("the decision is still on the page — kept, never deleted", /data-flowdisposed="grant::application"/.test(q2));
ok("still naming the version it judged", says(q2, /it judged version 1 of the declared flow/i));
ok("and now saying it no longer answers the question, which is §8.2's reopening on the page",
   says(q2, /no longer answers the question/i) && !says(q2, /still the one standing/i));

/* ============================================================
   5. a decision written before the record kept the version reads `not recorded`
   ============================================================ */
console.log("\n--- 5. the pre-REC-184 row: `not recorded`, in words, with no number invented ---");
const drop = await raw("ALTER TABLE proposal_dispositions DROP COLUMN definition_version");
ok("ARMED — the pre-build shape is made: the column is dropped and the decision's row is kept",
   drop && drop.ok === true && !(await cols()).includes("definition_version")
   && ((await raw("SELECT count(*) AS c FROM proposal_dispositions")).rows || [])[0]?.c === 1);
await mf.setOptions(opts("test-reboot"));   /* same storage, a fresh boot through #migrate */
ok("after the boot the column is back and the old row holds NULL — never back-filled",
   (await cols()).includes("definition_version")
   && ((await raw("SELECT definition_version AS v FROM proposal_dispositions")).rows || [])[0]?.v == null);
await U.renderQueue();
const q3 = html("#q");
ok("the decision is still on the page", /data-flowdisposed="grant::application"/.test(q3));
/* CORRECTED by UI-109 (2026-09-25), not exempted: these assertions read the WHOLE queue, and were sound
   only while the set-aside row was the one place on it that could say `not recorded`. Since UI-109 the
   reopened FINDING item says it too (its `prior_disposition`), so hiding this row's sentence left the
   words on the page and the row's own assertion GREEN — measured: this suite's control arm (A) came back
   1 failed, not naming THE ROW'S SECOND HALF. They now read the set-aside row itself, cut out by its own
   `data-flowdisposed` key; `q3r` is that row. */
const q3at = q3.indexOf('data-flowdisposed="grant::application"');
const q3r = q3at < 0 ? "" : q3.slice(q3.lastIndexOf("<div", q3at), q3.indexOf("</div>", q3at) + 6);
ok("THE ROW'S SECOND HALF: which version it judged reads `not recorded`, IN WORDS",
   q3r.length > 100 && saysNotRecorded(q3r));
ok("and the words are the sentence a member reads, not a bare token",
   says(q3r, /which version of the declared flow it judged is not recorded/i));
ok("no version number is invented in its place", !says(q3, /it judged version \d/i));
ok("and the decision's own state, author and reason are still the record's",
   says(q3r, /set aside as dismissed/i) && says(q3r, /took applications by telephone/i));

await mf.dispose();
if(fails.length){ console.error(`declared-flow-surface: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`declared-flow-surface: ${n} assertions, all green — a declared flow's revisions render with their basis beside each version (and an absent basis as \`not recorded\` in words), and the record's own set-aside findings name the version of the flow each judged, say whether it still answers the question, and read \`not recorded\` rather than a guessed number for a decision taken before the record kept one`);
process.exit(0);
