/* D-126 — APPLYING A HANDLER TO A SELECTION, ON THE SURFACE (NOTIFICATIONS.md §Applying a handler to a selection).
 *
 * THE ROW'S ACCEPTS-WHEN, the surface half: *"a selection of three where one item drifted leaves exactly that one
 * listed with its reason and clears the other two, through the ops and on the surface."* Bob's words: *"If that
 * action didn't work for one or more, they'd stay in the list so that the user can take a different action."*
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * The criterion is what the RECORD did to each item, so `bio-plane/src/index.mjs` runs under miniflare: members
 * enrolled through the real ops, tasks made by the producer's own route (enqueue, promote, drain), a progression
 * defined and threaded so the queue carries real FINDINGs. The drift is a real act by another member between the
 * paint and the click. Nothing is mocked.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (1) N CALLS DRESSED AS ONE CONTROL — the wire is counted: ONE set call per applied selection, carrying `items`.
 *  (2) ALL-OR-NOTHING — the drifted item must be the ONLY one kept; the other two must LEAVE the list.
 *  (3) SILENT DROP — the drifted item leaves this member's FEED (it is nate's now, and op=queue is right not to list
 *      it for mona), so a surface that only repaints the feed loses it without a word. It must stay on screen with
 *      the record's reason.
 *  (4) A REASON OF THE SURFACE'S OWN — the reason shown must be the plane's (`NOT_YOURS` and its detail naming nate;
 *      `NO_REASON` and its detail), never a sentence composed here.
 *  (5) A BULK CONTROL THE PLANE DID NOT PUBLISH — section 3 hands the surface a plane answer with no `set_acts`, and
 *      no tick and no selection bar may be drawn.
 *  (6) UI-94 — A BULK FORWARD THAT IS N FORWARDS. Section 4 counts the wire again for `op=taskforward`: ONE call
 *      carrying three `items` and the chosen member ONCE as the shared key. A per-item loop dressed as a bulk
 *      button fails "ONE op=taskforward call for the whole selection" by name.
 *  (7) UI-94 — A MEMBER OFFERED WHO CANNOT BE FORWARDED TO. The picker must not name a member the WHOLE selection
 *      already belongs to (the record would refuse every item, ALREADY_THEIRS), and must still name one who holds
 *      only SOME of it — the record refuses those and applies the rest, which is the per-item weight's own point.
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - The DOM is a stub, the reach every civicos-ui suite has: the tick's `onchange` is not fired by a browser, so the
 *    suite calls the function the tick names (`queueSelectionToggle`), and asserts separately that the tick is drawn
 *    naming it.
 *  - CORRECTED 2026-09-24 by UI-94, not exempted: this read *"`op=taskforward`'s set form has NO bulk control on
 *    this surface (the forward picker is per item), so it is not driven here; the plane suite
 *    `bio-plane/test/peritem.test.mjs` drives it through the op."* That was TRUE on D-126's landing and is the gap
 *    UI-94 closed. Section 4 below drives the bulk forward on THIS surface, through the same real plane. What
 *    stays outside this suite's reach is unchanged: the DOM is a stub, so the picker's `onchange` and the button's
 *    `onclick` are not fired by a browser — the suite calls the functions those attributes name and asserts
 *    separately that `queueWire` binds them.
 *  - A PROJECT-SCOPED FINDING: no fixture here carries one, so this suite says nothing about that case. CORRECTED
 *    2026-09-25 by UI-110, not exempted: this read *"is still not selectable (its act names a project per item)"*,
 *    which REC-205 measured to be false of the plane and UI-110 made false of the surface. The case is driven against
 *    the real plane in `queue-projectscope.test.mjs`, with its own control.
 *
 * NEGATIVE CONTROL: arms declared and run in `queue-peritem.control.mjs`; results recorded on the lines below.
 * CONTROL RESULT 2026-09-24 (UI-94 worker), `node civicos-ui/test/queue-peritem.control.mjs`, all SEVEN arms, each
 * armed alone on the EXTRACTED script (app.html never edited, nothing to restore), each splice asserted to match
 * exactly once. EVERY ARM AS DECLARED:
 *   baseline    exit 0 · 36 pass / 0 fail   (16 before UI-94)
 *   fwdloop     exit 1 · 31/5 — the ROW's control. FAILS "ONE op=taskforward call for the whole selection, carrying
 *               THREE items" and "still ONE call for the two" BY NAME, and, as declared, "the chosen member is the
 *               act's SHARED key", "G7 is KEPT …" and "it is NOT still selected …" — a loop of single acts returns
 *               no `items[]`, so there is nothing to retain from. Sections 1, 2, 3 green.
 *   fwdofferall exit 1 · 33/3 — "it does NOT offer mona …", 4b's "all-hers, through the op …" and 4b's "UNIT, the
 *               same state read directly …", as declared. 4b's SPANNING unit arm stays green (mona belongs there),
 *               which is what tells this arm from one that simply emptied the picker. Every one-call arm green.
 *   fwdspelling exit 0 · 36/0 — OVER-STRICTNESS, as declared: the shared key assembled before the call instead of
 *               written as a literal at it is correct work, and nothing here reads its spelling.
 *   allornone   exit 1 · 32/4 · silentdrop exit 1 · 33/3 · ncalls exit 1 · 31/5 — D-126's three, RE-RUN against the
 *               widened suite and each now reaching section 4 as well. TWO OF THEM MOVED and the declarations were
 *               AMENDED from these printed figures rather than the figures smoothed: `allornone` also fails 4c's
 *               "G6 was forwarded and has left the list", and `silentdrop` also fails 4c's "G7 is KEPT …", because
 *               the bulk forward goes through the same `queueApplySet` and the same retained-note path. `ncalls`
 *               does NOT disturb retention (it synthesises an `items[]` of its own) and fails only the call counts.
 * CONTROL RESULT 2026-09-23 (D-126 worker), `node civicos-ui/test/queue-peritem.control.mjs`, every arm armed alone on
 * the EXTRACTED script (app.html never edited, nothing to restore), each splice asserted to match exactly once:
 *   baseline   exit 0 · 16 pass / 0 fail.
 *   allornone  exit 1 · 13/3 — FAILS "KEPT: exactly the drifted one" as declared, AND "CLEARED: the two applied
 *              obligations have left the list" (the declaration said that arm might hold; it did not — the two items
 *              the plane APPLIED came back as kept notes, which is exactly the lie) and section 2's "given a reason"
 *              (the stale notes outlive the act). Section 3 green.
 *   silentdrop exit 1 · 14/2 — "KEPT" and "with the RECORD's reason", as declared. Sections 2 and 3 green.
 *   ncalls     exit 1 · 14/2 — "ONE call for the whole selection" as declared, and "it sends no actor" (it reads the
 *              one set call, and there is none). Section 3 green.
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
  console.error("queue-peritem: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const APP = process.env.D126_APP_SRC || null;   /* the control harness hands a mutated app script through this */
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d126", MEMBER_TOKEN: "mem-d126", PROBE_TOKEN: "prb-d126", VERSION: "test",
              TASK_DRAIN_DELAY_MS: "600000" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

try {
/* ============================================================ 0. THE GROUND */
console.log("\n--- 0. the ground: a real plane, three obligations and two findings for mona ---");
const enrol = async (memberId, role) => {
  const add = rP(await POST("op=memberadd&token=adm-d126", { memberId, cover: `cover for ${memberId}`, role }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const IRIS = await enrol("iris", "admin");
await enrol("adam", "admin");
const MONA = await enrol("mona", "member");
await enrol("nate", "member");

const AT = "2026-09-23T12:00:00Z";
const stub = await mf.getDurableObjectNamespace("STORE");
const obj = stub.get(stub.idFromName("bio"));
const doPost = async (op, body) => (await obj.fetch(`http://x/${op}`, { method: "POST", body: JSON.stringify(body) })).json();
let n = 0;
const makeTaskFor = async (who) => {
  n++;
  const cap = (0xd1260 + n).toString(16).padStart(64, "0");
  const bundle = `INFO-2026-09${String(40 + n).padStart(2, "0")}-d126-${n}`;
  await doPost("taskenqueue", { kind: "authority-undetermined", captureSha: cap,
    subject: `https://www.oaklandca.gov/documents/agenda-${n}.pdf`, at: AT });
  const md = "---\nid: " + bundle + "\n---\n";
  await doPost("promote", { bundleId: bundle, base: null, snapKey: `d126-task-${n}`, author: "consumer",
    meta: { object_type: "information", group: "believe-in-oakland", title: `D-126 fixture ${n}`,
            current_state: "collected", created: AT, last_updated: AT },
    files: [{ path: "bundle.md", text: md, bytes: md.length }],
    register: [{ sha256: cap, path: "snapshots/agenda.pdf", encoding: "binary", bytes: 10 }] });
  const d = (await doPost("taskdrain", { actor: "consumer", now: AT })).result;
  const made = d.created.find((c) => c.refers_to === bundle);
  if (!made) throw new Error(`drain made no task for ${bundle}`);
  const f = rP(await POST(`op=taskforward&token=${IRIS}`, { id: made.id, to: who, now: AT }));
  if (!f.ok) throw new Error(`seed forward: ${JSON.stringify(f)}`);
  return made.id;
};
const [T1, T2, T3] = [await makeTaskFor("mona"), await makeTaskFor("mona"), await makeTaskFor("mona")];

/* Two FINDINGs: a progression whose LAST stage is placed, so the two earlier required stages are missing. */
const RCAP = "d".repeat(63) + "6";
const RDOC = "INFO-2026-0126-voted";
{
  const md = ["---", `id: ${RDOC}`, "object_type: information", "schema: information@1", `title: "Vote record"`,
    "current_state: collected", "prior_state: null", `created: "${AT}"`, `last_updated: "${AT}"`,
    "produced_by:", "  mode: agent", "  capability_tier: high", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "---", "", "## Summary", "", "A vote.", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [{ capture: { sha256: RCAP, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: AT,
               entities: [{ ref: "contract:D126", kind: "contract", key: "D126", label: "D-126 contract" }] } }] });
  const r = rP(await POST(`op=promote&token=${MONA}`, { bundleId: RDOC, base: null, snapKey: "d126-rdoc",
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }], register: [],
    meta: { object_type: "information", group: "believe-in-oakland", title: "Vote record",
            current_state: "collected", created: AT, last_updated: AT } }));
  if (r.ok === false) throw new Error(`promote ${RDOC}: ${JSON.stringify(r).slice(0, 500)}`);
  const def = rP(await POST(`op=progressiondefine&token=${MONA}`, { progressionKey: "d126-ui", label: "D-126 UI flow",
    stages: [{ key: "filed", label: "Filed", cardinality: "1", required: "always" },
             { key: "heard", label: "Heard", after: "filed", cardinality: "1", required: "always" },
             { key: "voted", label: "Voted", after: "heard", cardinality: "1", required: "always" }] }));
  if (!def.ok) throw new Error(`progressiondefine: ${JSON.stringify(def).slice(0, 400)}`);
  const ent = rP(await POST(`op=entitycreate&token=${MONA}`, { kind: "contract", label: "D-126 contract", aliases: ["contract:D126"] }));
  await POST(`op=resolve&token=${MONA}`, { captureSha: RCAP });
  const th = rP(await POST(`op=thread&token=${MONA}`, { progressionKey: "d126-ui", entityId: ent?.entity_id,
    placements: [{ stage: "voted", captureSha: RCAP }] }));
  if (th?.ok === false) throw new Error(`thread: ${JSON.stringify(th).slice(0, 400)}`);
}
const F1 = "FINDING::d126-ui::filed", F2 = "FINDING::d126-ui::heard";

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
let HIDE_SET_ACTS = false;
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
    let body = null; try { body = opts && opts.body ? JSON.parse(opts.body) : null; } catch (_) {}
    WIRE.push({ op: url.searchParams.get("op"), body });
    const res = await mf.dispatchFetch(url.toString(), opts);
    if (HIDE_SET_ACTS && url.searchParams.get("op") === "affordances") {
      const j = await res.json();
      if (j && j.result) delete j.result.set_acts;
      return new Response(JSON.stringify(j), { status: 200 });
    }
    return res;
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext((APP ? fs.readFileSync(APP, "utf8") : appScript()) + ";globalThis.__U = {" + [
  "PLANE", "renderQueue", "queueSelectionToggle", "queueApplySet", "loadActSource", "ACT_SOURCE",
  /* UI-94: the bulk forward's four functions, called here because the stub DOM fires no events, plus
     `queueSelClear` (a section must not inherit the section before it's selection) and
     `queueForwardCandidates`, which section 4b drives directly for the reason stated there. */
  "queueForwardOpen", "queueForwardTo", "queueForwardSet", "queueForwardCancel", "queueSelClear",
  "queueForwardCandidates",
].join(",") + ", SEL: () => [...QUEUE_SEL], RET: () => [...QUEUE_RETAINED.keys()]"
  /* UI-94: the WIRING is read as source, because a control the surface draws and never binds is worse
     than none and this stub DOM cannot fire a click to find out. */
  + ", WIRESRC: () => String(queueWire)"
  /* UI-94, section 4b: forces ONE field of ONE live painted item. Named FORCE rather than `set` so no
     reader mistakes it for something the record did. */
  + ", FORCE: (id, assignee) => { const it = QUEUE_ITEMS.get(String(id)); if(it) it.assignee = assignee; }"
  + " };", ctx);
const U = ctx.__U;
U.PLANE.token = MONA;
U.PLANE.session = true;
U.PLANE.me = { member: "mona", handle: "mona", session: true, administer: false, capabilities: ["contribute"] };

const Q = () => $$("#q")._html;
const itemBlock = (id) => (new RegExp(`<article class="q-item[^"]*" data-id="${id}"[\\s\\S]*?</article>`).exec(Q()) || [null])[0];
const keptBlock = (id) => (new RegExp(`<div class="q-item" data-id="${id}">[\\s\\S]*?</div></div>`).exec(Q()) || [null])[0];
const unent = (s) => String(s || "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

/* ============================================================ 1. THE ROW'S ACCEPTS-WHEN */
console.log("\n--- 1. a selection of three obligations; one drifts before the act ---");
await U.loadActSource(true);
await U.renderQueue();
ok("the fixture is real: all three obligations are listed for mona", [T1, T2, T3].every((id) => !!itemBlock(id)),
   JSON.stringify([T1, T2, T3].map((id) => !!itemBlock(id))));
ok("each obligation carries a tick that FEEDS THE SET (it names queueSelectionToggle)",
   [T1, T2, T3].every((id) => new RegExp(`data-qsel="${id}"[^>]*queueSelectionToggle\\('${id}'`).test(itemBlock(id) || "")));
for (const id of [T1, T2, T3]) U.queueSelectionToggle(id, true);
ok("three are selected, and the bar says each is handled on its own",
   U.SEL().length === 3 && /3 selected\.<\/b> Each one is handled on its own/.test(Q()));
ok("the bulk control carries the PLANE's published label, not one of this surface's",
   /data-qset="taskresolve">Resolve the selected obligations \(3\)/.test(Q()));

/* THE DRIFT: iris moves T2 to nate after mona's screen was painted. */
const drift = rP(await POST(`op=taskforward&token=${IRIS}`, { id: T2, to: "nate", now: AT }));
ok("fixture: T2 drifted to nate between the paint and the act", drift.ok === true && drift.assignee === "nate");

const before = WIRE.length;
await U.queueApplySet("taskresolve");
const sent = WIRE.slice(before).filter((w) => w.op === "taskresolve");
ok("ONE call for the whole selection, carrying three items — not three calls",
   sent.length === 1 && Array.isArray(sent[0].body?.items) && sent[0].body.items.length === 3,
   JSON.stringify(sent.map((w) => w.body)));
ok("and it sends no actor: the stamp is the plane's", sent.length === 1 && !("actor" in (sent[0].body || {})));
ok("CLEARED: the two applied obligations have left the list", !itemBlock(T1) && !itemBlock(T3) && !keptBlock(T1) && !keptBlock(T3));
const kept = keptBlock(T2);
ok("KEPT: exactly the drifted one is still listed — under 'Kept from your last action', since mona's feed no longer carries it",
   !!kept && /Kept from your last action/.test(Q()) && U.RET().length === 1 && U.RET()[0] === T2);
ok("with the RECORD's reason, in its own words: NOT_YOURS, and who it is with now",
   /NOT_YOURS/.test(unent(kept)) && /it is with nate/.test(unent(kept)), unent(kept));
ok("READ BACK: the record agrees — T1 and T3 resolved, T2 open with nate",
   await (async () => { const t = rP(await POST(`op=tasks&token=${IRIS}`, {})); const rows = (t?.tasks || []);
     const s = (id) => rows.find((r) => r.id === id) || {};
     return s(T1).status === "resolved" && s(T3).status === "resolved" && s(T2).assignee === "nate" && s(T2).status !== "resolved"; })());

/* ============================================================ 2. RETAINED IN THE FEED */
console.log("\n--- 2. two findings, dismissed with no reason, stay IN the list with the plane's reason ---");
await U.renderQueue();
ok("fixture: both findings are listed and tickable", [F1, F2].every((id) => /data-qsel=/.test(itemBlock(id) || "")),
   JSON.stringify([F1, F2].map((id) => !!itemBlock(id))));
for (const id of [F1, F2]) U.queueSelectionToggle(id, true);
await U.queueApplySet("proposedispose", { to: "dismissed", reason: "" });
const f1 = itemBlock(F1), f2 = itemBlock(F2);
ok("both are still in the list, each with the plane's NO_REASON and its words",
   [f1, f2].every((b) => b && /q-retained/.test(b) && /NO_REASON/.test(unent(b)) && /own words/.test(unent(b))), unent(f1));
ok("and they are still selected, so the member can take a different action on the same set", U.SEL().length === 2, JSON.stringify(U.SEL()));
await U.queueApplySet("proposedispose", { to: "dismissed", reason: "outside this group's remit" });
ok("given a reason, both are applied and leave the list", !itemBlock(F1) && !itemBlock(F2) && U.RET().length === 1, JSON.stringify([!!itemBlock(F1), !!itemBlock(F2), U.RET(), U.SEL()]));

/* ============================================================ 3. NO PUBLICATION, NO BULK CONTROL */
console.log("\n--- 3. a plane that publishes no set_acts gets no selection control ---");
HIDE_SET_ACTS = true;
await U.loadActSource(true);
const T4 = await makeTaskFor("mona");
await U.renderQueue();
ok("the obligation is listed with its single controls and NO tick", !!itemBlock(T4) && !/data-qsel=/.test(itemBlock(T4))
   && /data-res=/.test(itemBlock(T4)));
HIDE_SET_ACTS = false;

/* ============================================================ 4. UI-94 — THE BULK FORWARD */
console.log("\n--- 4. UI-94: THE ROW'S ACCEPTS-WHEN — a selection of THREE forwards in ONE act ---");
await U.loadActSource(true);
U.queueSelClear();
const [G1, G2, G3] = [await makeTaskFor("mona"), await makeTaskFor("mona"), await makeTaskFor("mona")];
await U.renderQueue();
ok("fixture: all three obligations are mona's and listed", [G1, G2, G3].every((id) => !!itemBlock(id)),
   JSON.stringify([G1, G2, G3].map((id) => !!itemBlock(id))));
for (const id of [G1, G2, G3]) U.queueSelectionToggle(id, true);
ok("the bar offers the FORWARD as a published set act, with the PLANE's own label and the count",
   /data-qsetfwdopen>Forward the selected obligations \(3\)/.test(Q()), Q().slice(Q().indexOf("q-selbar"), Q().indexOf("q-selbar") + 700));
ok("and the resolve control is still there beside it — UI-94 ADDED a mode, it replaced none",
   /data-qset="taskresolve">Resolve the selected obligations \(3\)/.test(Q()));
ok("the bulk forward is WIRED, on attributes of its own and not the per-item picker's `data-fwd`",
   /data-qsetfwdopen/.test(U.WIRESRC()) && /data-qsetfwdgo/.test(U.WIRESRC()) && /data-qsetfwdpick/.test(U.WIRESRC()));

await U.queueForwardOpen();
ok("opened, it offers the roster's other active members — nate among them", /data-qsetfwdpick/.test(Q()) && /value="nate"/.test(Q()), Q().slice(Q().indexOf("q-setfwd"), Q().indexOf("q-setfwd") + 600));
ok("and it does NOT offer mona, who holds the WHOLE selection: the record would refuse every item of it",
   !/value="mona"/.test(Q()), Q().slice(Q().indexOf("q-setfwd"), Q().indexOf("q-setfwd") + 600));
U.queueForwardTo("nate");
const beforeF = WIRE.length;
await U.queueForwardSet();
const sentF = WIRE.slice(beforeF).filter((w) => w.op === "taskforward");
ok("ONE op=taskforward call for the whole selection, carrying THREE items — not three calls",
   sentF.length === 1 && Array.isArray(sentF[0].body?.items) && sentF[0].body.items.length === 3,
   JSON.stringify(sentF.map((w) => w.body)));
ok("the chosen member is the act's SHARED key, said ONCE, and no item names an actor",
   sentF.length === 1 && sentF[0].body.to === "nate" && !("actor" in (sentF[0].body || {}))
   && sentF[0].body.items.every((i) => Object.keys(i).length === 1 && "id" in i),
   JSON.stringify(sentF[0] && sentF[0].body));
ok("all three left mona's list, none was kept, and the picker closed",
   [G1, G2, G3].every((id) => !itemBlock(id) && !keptBlock(id)) && !/data-qsetfwdpick/.test(Q()));
ok("READ BACK: the record agrees — all three are nate's now, none resolved",
   await (async () => { const t = rP(await POST(`op=tasks&token=${IRIS}`, {})); const rows = (t?.tasks || []);
     const g = (id) => rows.find((r) => r.id === id) || {};
     return [G1, G2, G3].every((id) => g(id).assignee === "nate" && g(id).status !== "resolved"); })());

/* WHO THE PICKER MAY NAME, AT THE BOUNDARY — and one half of it is driven as a UNIT, which is said here
   rather than implied. The rule is keyed on the SELECTED ITEMS' assignees, not on who is asking: a member
   the WHOLE selection already belongs to is withheld (naming them could move nothing, ALREADY_THEIRS on
   every item), and anyone else is offered because the record can move at least one.

   THE ALL-HERS HALF IS REACHABLE AND IS DRIVEN THROUGH THE OP, in section 4 above: `queueFeed` carries a
   member her OWN tasks plus honestly `unassigned` ones (`row.assignee !== me && row.assignee !== "unassigned"`),
   so every task a member can select here is already hers and mona is withheld.

   THE SPANNING HALF IS NOT REACHABLE IN THIS FIXTURE, and the reason is the plane's, not this suite's: the
   only selection that can span assignees is one holding an `unassigned` task, and `#routeTask` returns
   `unassigned` ONLY when there is no active administrator — while `memberSet` refuses to revoke an admin
   without a section 4.7 vote (the ADMIN_REQUIRES_VOTE refusal, NAMED UNQUOTED on purpose and not as a
   style: `check-refusal-codes.mjs`' R3-FED walk harvests any SCREAMING_SNAKE token in quotes or backticks
   anywhere in a suite's source, comments included, and counts it as a code this suite FEEDS to a surface,
   so backticking it here would raise the `r3Fed` floor by prose — UI-100's measurement, recorded at
   `case-frozen-pair.test.mjs`, and this suite hands that code to no surface). So this fixture cannot
   produce one. Rather than leave
   the branch unmeasured, it is driven as a UNIT over the live painted state: one field of one item is
   FORCED to the value the record would have given an unrouted task, and `queueForwardCandidates` is called.
   WHAT THAT ARM DOES NOT ESTABLISH: that a member can ever assemble such a selection on this plane today. */
console.log("\n--- 4b. who the picker may name, at the boundary (the spanning half driven as a unit — see the note) ---");
U.queueSelClear();
const G4 = await makeTaskFor("mona");
await U.renderQueue();
ok("fixture: G4 is mona's own", !!itemBlock(G4));
U.queueSelectionToggle(G4, true);
await U.queueForwardOpen();
ok("all-hers, through the op: mona is withheld and the other three actives are offered",
   !/value="mona"/.test(Q()) && ["adam", "iris", "nate"].every((m) => new RegExp(`value="${m}"`).test(Q())),
   Q().slice(Q().indexOf("q-setfwd"), Q().indexOf("q-setfwd") + 700));
const namesOf = () => U.queueForwardCandidates().map((m) => m.member_id || m.member || m.id || m.handle);
ok("UNIT, the same state read directly: the candidates are those three and mona is not among them",
   !namesOf().includes("mona") && namesOf().length === 3, JSON.stringify(namesOf()));
U.FORCE(G4, "unassigned");   /* what `#routeTask`'s last arm writes when it can find nobody */
ok("UNIT, spanning: with the item unrouted, mona is offered too — the rule reads the ITEMS, not the asker",
   namesOf().includes("mona") && namesOf().length === 4, JSON.stringify(namesOf()));
U.queueForwardCancel();
U.queueSelClear();

/* THE RETENTION ARM: forward a set to the member who ALREADY holds one of them. */
console.log("\n--- 4c. one item of the set is already the target's: it is KEPT with the record's own reason ---");
const G6 = await makeTaskFor("mona");
const G7 = await makeTaskFor("mona");
U.queueSelClear();
await U.renderQueue();
for (const id of [G6, G7]) U.queueSelectionToggle(id, true);
await U.queueForwardOpen();
U.queueForwardTo("nate");
/* iris moves G7 to nate between the paint and the click — the drift, in the forward's own shape. */
const driftF = rP(await POST(`op=taskforward&token=${IRIS}`, { id: G7, to: "nate", now: AT }));
ok("fixture: G7 drifted to nate between the paint and the act", driftF.ok === true && driftF.assignee === "nate");
const beforeH = WIRE.length;
await U.queueForwardSet();
const sentH = WIRE.slice(beforeH).filter((w) => w.op === "taskforward");
ok("still ONE call for the two", sentH.length === 1 && sentH[0].body.items.length === 2, JSON.stringify(sentH.map((w) => w.body)));
ok("G6 was forwarded and has left the list", !itemBlock(G6) && !keptBlock(G6));
const keptF = keptBlock(G7);
ok("G7 is KEPT, and with the RECORD's own reason rather than a sentence of this surface's",
   !!keptF && /NOT_YOURS/.test(unent(keptF)) && /it is with nate/.test(unent(keptF)), unent(keptF));
/* AND IT IS NOT STILL SELECTED — asserted as the fact it is, not as the thing that would read better.
   `queuePaint` drops from the selection every id the feed no longer carries, and a drifted obligation is
   exactly that: it is nate's now and `op=queue` is right not to list it for mona. So what survives the act
   is the KEPT NOTE with the record's reason, which is what section 1 measures too. A different action on
   it is not available from this screen, and the surface does not pretend otherwise. */
ok("it is NOT still selected — mona's feed no longer carries it — and the kept note is what remains",
   !U.SEL().includes(G7) && U.RET().includes(G7), JSON.stringify({ sel: U.SEL(), ret: U.RET() }));

/* ============================================================ 5. NO PUBLICATION, NO BULK FORWARD */
console.log("\n--- 5. a plane that publishes no set_acts gets no bulk forward either ---");
HIDE_SET_ACTS = true;
await U.loadActSource(true);
const T5 = await makeTaskFor("mona");
U.queueSelClear();
await U.renderQueue();
U.queueSelectionToggle(T5, true);
ok("no tick, no selection bar and no bulk forward — and the PER-ITEM forward is untouched",
   !/data-qsel=/.test(itemBlock(T5) || "") && !/data-qsetfwdopen/.test(Q()) && /data-fwd=/.test(itemBlock(T5) || ""));
HIDE_SET_ACTS = false;
} finally {
  await mf.dispose();
}
console.log(`\nqueue-peritem: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
