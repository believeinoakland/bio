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
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - The DOM is a stub, the reach every civicos-ui suite has: the tick's `onchange` is not fired by a browser, so the
 *    suite calls the function the tick names (`queueSelectionToggle`), and asserts separately that the tick is drawn
 *    naming it.
 *  - `op=taskforward`'s set form has NO bulk control on this surface (the forward picker is per item), so it is not
 *    driven here; the plane suite `bio-plane/test/peritem.test.mjs` drives it through the op.
 *
 * NEGATIVE CONTROL: arms declared and run in `queue-peritem.control.mjs`; results recorded on the line below.
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
].join(",") + ", SEL: () => [...QUEUE_SEL], RET: () => [...QUEUE_RETAINED.keys()] };", ctx);
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
} finally {
  await mf.dispose();
}
console.log(`\nqueue-peritem: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
