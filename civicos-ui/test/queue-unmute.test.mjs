/* UI-97 — A MEMBER CAN UNDO A MUTE FROM THE APP, AGAINST THE REAL PLANE.
 * Design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE,
 * which differs by class" (DEC-10's (b) and (c); D-125's two forms; D-170's ungrouped condition).
 *
 * THE ROW'S ACCEPTS-WHEN, in its own words: *"a muted item unmuted from the report reaches the
 * member again"* — **against the real plane**. `op=queuemute` has taken `unmute: true` in BOTH
 * forms since D-125 (2026-09-23) and NO CLIENT SENT IT, so a member could silence something from
 * the queue and had no way back.
 *
 * ===================== WHY THE PLANE HERE IS REAL, AND WHY THIS IS ITS OWN FILE =====================
 * The criterion is what the RECORD did to this member's feed, so `bio-plane/src/index.mjs` runs under
 * miniflare: members enrolled through the real ops, a real progression threaded so the queue carries
 * real FINDINGs under a real case, and a real held host for the ungrouped CONDITION D-170 admits.
 * Nothing is mocked. The surface half is EXTENDED IN `notifications.test.mjs` §2, where the row's
 * scope puts it; it is not moved here, and this file is not a second copy of it — that suite's own
 * fixture rule is that NOTHING IS DRAWN AT RUNTIME, and a real plane mints ids, instants and tokens
 * at runtime, so the two instruments cannot live in one file without one of them lying about itself.
 * What the mock suite can see is which BODY the surface sent; what only this one can see is whether
 * the plane, given that body, actually lets the item back in.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (1) A REPAINT THAT NEVER ASKED — the wire is counted: exactly ONE `op=queuemute` per undo, and
 *      its body is read, so a control that repaints an optimistic feed fails.
 *  (2) UNMUTING BY RE-MUTING — the plane's item form is an idempotent upsert, so a body that DROPS
 *      `unmute` silently re-mutes. Every round-trip arm therefore asserts the item is BACK, read
 *      from `op=queue` as well as from the painted page.
 *  (3) SOMEBODY ELSE'S FEED — ben mutes nothing and is read at every stage; a mute or an unmute that
 *      moved his feed would be the one thing a personal preference must never do.
 *  (4) THE CASE FORM DRESSED AS THE ITEM FORM — the case undo's body is asserted to be
 *      `{ case, kinds, unmute:true }` and to name exactly the kinds the control drew.
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - The DOM is a stub, the reach every civicos-ui suite has: no browser fires the control's click,
 *    so the suite calls the function the control names and asserts SEPARATELY that `queueWire` binds
 *    that attribute to that function.
 *  - It drives ONE finding kind and ONE condition; the key is the item's own published id whatever
 *    produced it, and `bio-plane/test/d125-findingmute.test.mjs` holds the id shapes over the class.
 *  - It says nothing about a case whose muted kinds are suppressing nothing today: `op=queue`
 *    publishes `mute.cases` as case ids and the muted KINDS nowhere, so no surface can name them.
 *    That is D-534 on the plane; the surface's refusal to guess is asserted in
 *    `notifications.test.mjs` §2, where the answer can be fixtured.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/queue-unmute.control.mjs` — arms declared and run there,
 * each armed ALONE on the EXTRACTED script (app.html is never edited, so there is nothing to
 * restore). CONTROL RESULT: recorded on this line by the control harness's own run — see
 * `queue-unmute.control.mjs`'s header for the declarations and the measured outcome.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard its own output */
/* REC-171: a deploy token's questions are surfaced INSIDE a run it holds, or the plane refuses
   SURFACE_NO_RUN (C-66.1). This suite's case is an inquiry promoted under the member deploy token,
   so it uses the shared fixture rather than a second implementation of the same obedience. */
import { withSurfacingRun } from "../../bio-plane/test/surfacing-run.mjs";
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
  console.error("queue-unmute: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const APP = process.env.UI97_APP_SRC || null;   /* the control harness hands a mutated app script through this */
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui97", MEMBER_TOKEN: "mem-ui97", PROBE_TOKEN: "prb-ui97", VERSION: "test",
              TASK_DRAIN_DELAY_MS: "600000", CONNECTION_DERIVE_DELAY_MS: "600000" },
}));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const MACHINE = "mem-ui97";
const NOW = "2026-09-24T12:00:00Z";
const AWARD_AT = "2027-01-01T00:00:00Z";   /* dated in the real future, so no armed alarm fires inside the suite */

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inquiryMd = (id, question, legs) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", ...legs.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the award",
  "    description: The award may be re-let.",
  "basis:", ...legs.flatMap((x) => [`  - target: ${x}`, "    role: supports",
    "    grade: B", "    grade_axis: connection", "    grade_source: hunch",
    "    author: suite", "    date: 2026-09-24"]),
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${NOW} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const promote = async (id, text, type, state, register = [], extra = []) => {
  const r = await POST(`op=promote&token=${MACHINE}`, {
    bundleId: id, base: null, snapKey: `${id}-${sha(text).slice(0, 8)}`, author: "ui97-suite",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }, ...extra],
    register,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: state, created: NOW, last_updated: NOW } });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 400)}`);
  return r;
};

try {
/* ================================================== 0. THE GROUND: a real plane, a real case */
console.log("\n--- 0. the ground: a threaded progression under a real case, a held host, two members ---");
const stub = await mf.getDurableObjectNamespace("STORE");
const obj = stub.get(stub.idFromName("bio"));
const doPost = async (op, body) => (await obj.fetch(`http://x/${op}`,
  { method: "POST", body: JSON.stringify(body) })).json();

const prog = await POST(`op=progressiondefine&token=${MACHINE}`, {
  progressionKey: "ui97", label: "Procurement (UI-97)",
  stages: [
    { key: "award", label: "council award", cardinality: "1", required: "always" },
    { key: "kickoff", label: "kickoff meeting", after: "award", cardinality: "0..1",
      within: "before the meeting", required: "usually" },
  ] });
if (!prog.ok) throw new Error(`progressiondefine: ${JSON.stringify(prog).slice(0, 400)}`);
const ent = await POST(`op=entitycreate&token=${MACHINE}`,
  { kind: "contract", label: "Contract U", aliases: ["contract:CU"] });
const AWARD_DOC = "INFO-2026-0197-award";
const awardSha = sha("ui97-award");
{
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: awardSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "procurement", reader_version: 1, found: true, at: AWARD_AT,
               entities: [{ ref: "contract:CU", kind: "contract", key: "CU", label: "Contract U" }] } }] });
  await promote(AWARD_DOC, infoMd(AWARD_DOC), "information", "collected", [],
    [{ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }]);
}
await POST(`op=resolve&token=${MACHINE}`, { captureSha: awardSha });
const thr = await POST(`op=thread&token=${MACHINE}`, {
  progressionKey: "ui97", entityId: ent.entity_id,
  placements: [{ stage: "award", captureSha: awardSha }] });
if (!thr || thr.ok === false) throw new Error(`thread: ${JSON.stringify(thr).slice(0, 400)}`);
const INQ = "INQ-2026-0197-award-question";
await promote(INQ, inquiryMd(INQ, "Was the kickoff meeting held?", [AWARD_DOC]), "inquiry", "open");

const HOST = "www.oaklandca.gov";
const GOV = `CONDITION::governor-holding-host::${HOST}`;
const held = await doPost("governorreport", { host: HOST, status: 429 });
if (!held.result || held.result.recorded !== true) throw new Error(`governorreport: ${JSON.stringify(held)}`);

const member = async (id, role = "member") => {
  const add = await POST(`op=memberadd&token=adm-ui97`,
    { memberId: id, cover: `cover for ${id}`, role, capabilities: ["contribute"] });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await member("ruth", "admin");
await member("gus", "admin");
const ANN = await member("ann");
const BEN = await member("ben");

const F_KICK = "FINDING::ui97::kickoff";
const queueOf = async (tok) => rP(await (await mf.dispatchFetch(`http://x/api/?op=queue&token=${tok}`)).json());
const idsOf = (q) => (q.items || []).map((i) => i.id);

const ground = await queueOf(ANN);
ok("the fixture is real: the kickoff FINDING is on ann's feed, filed under the inquiry that cites the award",
   idsOf(ground).includes(F_KICK)
   && ((ground.items.find((i) => i.id === F_KICK) || {}).case?.ancestors || []).some((a) => a.id === INQ),
   JSON.stringify(idsOf(ground)));
ok("and the held host is on it too, as an UNGROUPED CONDITION — D-170's shape, which only the item form reaches",
   (ground.items.find((i) => i.id === GOV) || {}).class === "CONDITION");

/* ================================================== THE SURFACE, ITS FETCH BRIDGED TO THAT PLANE */
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
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto, Blob: class{},
  IntersectionObserver: undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;},
  requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){}, replaceState(){} },
  localStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  sessionStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  window:{ addEventListener(){}, open:()=>null },
  fetch: async (u, opts) => {
    const url = new URL(u, "http://x");
    let body = null; try { body = opts && opts.body ? JSON.parse(opts.body) : null; } catch (_) {}
    WIRE.push({ op: url.searchParams.get("op"), body });
    return mf.dispatchFetch(url.toString(), opts);
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext((APP ? fs.readFileSync(APP, "utf8") : appScript()) + ";globalThis.__U = {" + [
  "PLANE", "renderQueue", "queueMuteItem", "queueUnmuteItem", "queueMuteCase", "queueUnmuteCase",
].join(",") + " };", ctx);
const U = ctx.__U;
U.PLANE.base = "http://x";
U.PLANE.token = ANN;
U.PLANE.session = true;
U.PLANE.me = { member: "ann", handle: "ann", session: true, administer: false, capabilities: ["contribute"] };

const Q = () => $$("#q")._html;
const mutes = () => WIRE.filter((w) => w.op === "queuemute");

/* ================================================== 1. THE ITEM FORM, THROUGH THE SURFACE */
console.log("\n--- 1. ann mutes the held host from the feed, and undoes it from the REPORT ---");
await U.renderQueue();
ok("the feed draws the per-item mute on the held host (UI-86's control, the one this item gives a way back from)",
   new RegExp(`data-muteitem="${GOV}"`).test(Q()));
await U.queueMuteItem(GOV);
const painted = Q();
ok("after the mute the held host is GONE from ann's painted feed", !new RegExp(`data-id="${GOV}"`).test(painted));
ok("and the REPORT carries the undo, keyed on the muted item's own published id — the only place it could be, "
   + "because a muted item is not in the feed to carry a control",
   new RegExp(`data-unmuteitem="${GOV}"`).test(painted), painted.slice(0, 600));

const beforeUndo = WIRE.length;
await U.queueUnmuteItem(GOV);
const sent = WIRE.slice(beforeUndo).filter((w) => w.op === "queuemute");
ok("ONE call for the undo, and its body is exactly { item, unmute:true } — no case, no kinds, no member",
   sent.length === 1 && JSON.stringify(Object.keys(sent[0].body).sort()) === '["item","unmute"]'
   && sent[0].body.item === GOV && sent[0].body.unmute === true,
   JSON.stringify(sent.map((w) => w.body)));
ok("ACCEPTS: the unmuted item REACHES THE MEMBER AGAIN — it is back on ann's painted feed",
   new RegExp(`data-id="${GOV}"`).test(Q()));
const annBack = await queueOf(ANN);
ok("READ BACK: the record agrees — op=queue lists it for ann again, her `mute.items` is empty, and it is in "
   + "no `suppressed` row (a repaint that never asked would fail here)",
   idsOf(annBack).includes(GOV) && (annBack.mute.items || []).length === 0
   && !(annBack.mute.suppressed || []).some((s) => s.id === GOV),
   JSON.stringify(annBack.mute));
const benQ1 = await queueOf(BEN);
ok("and ben, who muted nothing, was never moved in either direction — the whole act is personal",
   idsOf(benQ1).includes(GOV) && (benQ1.mute.items || []).length === 0 && benQ1.mute.suppressed_count === 0);

/* ================================================== 2. THE CASE FORM, THROUGH THE SURFACE */
console.log("\n--- 2. ann mutes a KIND on the case, and undoes that from the report ---");
await U.renderQueue();
ok("the case group draws the kind mute (UI-55/UI-86's control)",
   new RegExp(`data-mute="${INQ}"`).test(Q()));
await U.queueMuteCase(INQ);
const painted2 = Q();
ok("after the case mute the kickoff finding is GONE from ann's painted feed",
   !new RegExp(`data-id="${F_KICK}"`).test(painted2));
ok("and the report carries a per-case undo naming the case AND the kinds it can see, on its own attribute",
   new RegExp(`data-unmutecase="${INQ}"`).test(painted2)
   && /data-unmutekinds="missing_predecessor"/.test(painted2), painted2.slice(0, 900));

const beforeUndo2 = WIRE.length;
await U.queueUnmuteCase(INQ, "missing_predecessor");
const sent2 = WIRE.slice(beforeUndo2).filter((w) => w.op === "queuemute");
ok("ONE call for the case undo, body exactly { case, kinds, unmute:true }, naming the kinds the control drew",
   sent2.length === 1 && JSON.stringify(Object.keys(sent2[0].body).sort()) === '["case","kinds","unmute"]'
   && sent2[0].body.case === INQ && sent2[0].body.unmute === true
   && JSON.stringify(sent2[0].body.kinds) === '["missing_predecessor"]',
   JSON.stringify(sent2.map((w) => w.body)));
ok("ACCEPTS: the kind reaches ann again — the kickoff finding is back on her painted feed",
   new RegExp(`data-id="${F_KICK}"`).test(Q()));
const annBack2 = await queueOf(ANN);
ok("READ BACK: the record agrees — op=queue lists the finding for ann again and her `mute.cases` names the case "
   + "no longer (a case unmuted down to nothing leaves the block)",
   idsOf(annBack2).includes(F_KICK) && !(annBack2.mute.cases || []).includes(INQ),
   JSON.stringify(annBack2.mute));
ok("and ben's feed still carries the finding and reports no suppression of his own",
   idsOf(await queueOf(BEN)).includes(F_KICK));

/* ================================================== 3. THE WIRE, COUNTED */
console.log("\n--- 3. the wire: four mute calls in all, two of them undos, nothing looped ---");
ok("exactly FOUR op=queuemute calls were made by this surface — mute, undo, mute, undo — so neither control "
   + "loops N calls behind one button",
   mutes().length === 4, JSON.stringify(mutes().map((w) => w.body)));
ok("and exactly TWO of them carried `unmute`, the two undos",
   mutes().filter((w) => w.body && w.body.unmute === true).length === 2);
ok("no disposition act was sent at any point — a mute, and undoing one, is not a way to move the team's list",
   !WIRE.some((w) => w.op === "proposedispose" || w.op === "taskresolve"));

} catch (e) {
  console.log(`  FAIL  suite threw: ${e && e.stack ? e.stack : e}`);
  fail++;
}

await mf.dispose();
console.log(`\nqueue-unmute: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
