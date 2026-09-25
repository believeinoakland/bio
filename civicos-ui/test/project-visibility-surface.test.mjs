/* UI-70 — DISCOVERABLE OR HIDDEN, 3 of 4: THE CREATE AND FORK FORMS ASK, WITH NEITHER PRESELECTED, AND CANNOT
 * SUBMIT WITHOUT THE CHOICE; THE PROJECT'S OWNER CHANGES THE SETTING AND EVERYONE ELSE READS IT. Driven against
 * the REAL PLANE.
 *
 * Design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14, "The setting" — *"The create and
 * fork surfaces ask the creator, with NEITHER option preselected — each project chooses is taken literally, and
 * a preselection would be the surface choosing"* — with DEC-69 (forced, at the act). The plane half is REC-149
 * (`op=projectvisibilityset`, `op=projectvisibility`) and REC-197 (BOB #32 (b): a creation and a fork carry one
 * optional `visibility`; ABSENT IS HIDDEN; an ownerless creation's `discoverable` is refused C-97.1; a
 * `visibility` on anything but a project's creation is refused C-97.2).
 *
 * NO MOCK OF THE WRITE PATH: the plane runs in miniflare from `bio-plane/src/index.mjs` and `app.html`'s own
 * `fetch` is bridged to it (project-id-surface.test.mjs's instrument). What is SENT is read off the bridge, as
 * the plane received it; what is RECORDED is read back independently through `op=projectvisibility`.
 *
 * WHAT IT PROVES, in the row's accepts-when order:
 *   1. NOTHING IS PRESELECTED — on the Add form's project arm, on the fork form, and on the owner's control:
 *      each renders exactly the two options, and neither carries `checked`.
 *   2. THE HARNESS CANNOT SUBMIT A CREATE OR A FORK WITHOUT THE CHOICE. The row's liar is *"a form that submits
 *      without the choice and gets HIDDEN from the plane silently"*, so this is asserted at the WIRE: with no
 *      choice made, `addGo` and `doRosterAct` send NOTHING (no `op=promote`, no `op=projectfork`), the record's
 *      project count does not move, and the member is told what is missing. The Add form's button is shut too.
 *   3. THE CHOICE REACHES THE RECORD: a creation sent `discoverable` reads back discoverable, recorded, set by the
 *      creator; a fork of a HIDDEN project sent `discoverable` reads back discoverable (a fork does not inherit).
 *   4. THE OWNER CHANGES THE SETTING from the workspace, and the record reads the change back.
 *   5. A NON-OWNER (a joined participant) SEES IT READ-ONLY: the setting is on their page and no control is.
 *   6. EVERY REFUSAL IS THE PLANE'S CANNED DEC-49 TRANSLATION: C-97.1 through the Add form itself (the plane sees
 *      an ownerless credential), C-70.2 through the owner's commit path driven by a non-owner, and C-97.2 — which
 *      no surface here can provoke, because the surface sends `visibility` on a project's creation ALONE (asserted
 *      at the wire) — through the one renderer every act surface uses, over the plane's REAL C-97.2 answer.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/project-visibility-surface.control.mjs` — a BASELINE and five arms, each
 * mutating `civicos-ui/app.html` ALONE, restored and verified by sha256 AND `cmp` against a per-arm pristine copy.
 * Declared before arming: (A) THE ROW'S OWN — preselect HIDDEN -> RED, the NOTHING PRESELECTED lines fail by name;
 * (B) THE ROW'S LIAR — the Add form's forced-choice guard removed, so an unchosen project is sent and the plane
 * creates it HIDDEN silently -> RED, naming CANNOT SUBMIT; (C) the same liar on the fork -> RED, naming CANNOT
 * SUBMIT; (D) the owner's control offered to a non-owner -> RED, naming READ-ONLY; (E) OVER-STRICTNESS — the two
 * options listed in the other order -> GREEN. RUN 2026-09-25 by UI-70 against app.html ef1d85cc… (1,625,805 bytes),
 * every arm restored and verified by sha256 and `cmp`, the file IDENTICAL to pristine at the end — 6/6 AS DECLARED:
 * BASELINE GREEN 41/41 · (A) RED 38/41, the three NOTHING PRESELECTED lines (Add, fork, owner) · (B) RED 37/41,
 * naming CANNOT SUBMIT: an unchosen project (sent: promote — the plane created it HIDDEN, the liar exactly) ·
 * (C) RED 39/41, naming CANNOT SUBMIT: an unchosen fork · (D) RED 39/41, the two READ-ONLY lines · (E) GREEN 41/41.
 * A FINDING ABOUT ARM (C), recorded rather than smoothed (W29): with the fork's guard removed the surface sent
 * `visibility` as the STRING "null" and the plane refused it C-70.3 (not a setting) — so on the fork the liar's
 * shape fails LOUDLY at the plane rather than landing HIDDEN in silence; the Add form's (B) is the silent one,
 * because its spread drops an absent value. Both are RED here at the wire, before the plane is asked.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard its own output. */
import fs from "fs";
import vm from "vm";
import { webcrypto } from "crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { appScript } from "./extract.mjs";
import { PROJECT_VISIBILITY_CHECKS, PROJECT_CREATION_VISIBILITY_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("project-visibility-surface: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/. " + String(e && e.message || e));
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* The slug is deliberately no real group's; the store records it at first boot (UI-79's reason). */
  bindings: { ADMIN_TOKEN: "adm-ui70", MEMBER_TOKEN: "mem-ui70", PROBE_TOKEN: "prb-ui70", VERSION: "test",
              INSTANCE_NAME: "estuary-permits-watch" },
});
let exitCode = 1;
try {
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok, qs = "") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`, { method:"POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:caps }, "adm-ui70");
  if(!add || !add.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await post("enroll", { invite:add.invite, handle:id, password:`${id}-passphrase-1` });
  if(!en || !en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role:`member:${id}`, password:`${id}-passphrase-1` });
  if(!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await member("ruth", ["contribute"], "admin");
await member("gus",  ["contribute"], "admin");
const OLIVE = await member("olive", ["contribute", "create_projects"]);
const PAT   = await member("pat",   ["contribute"]);

/* ---- the DOM stub: innerHTML inspection, field values and ticks read back ---- */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, checked:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
    remove(){}, onclick:null, onchange:null };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if(!els.has(s)) els.set(s, el()); return els.get(s); };
const html = (s) => $$(s)._html;
const text = (h) => String(h||"").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
/* A real DOM builds fresh, unticked inputs on every paint; the stub keeps its elements, so every tick is
   cleared before each arm — a tick left from the previous arm would be a choice nobody made on this form. */
const untick = () => { for(const [k, e] of els) if(/-vis-/.test(k)) e.checked = false; };
const radiosIn = (h) => [...String(h).matchAll(/<input\b[^>]*type="radio"[^>]*>/g)].map(m => m[0])
  .filter(t => /-vis-/.test(t));

const SENT = [];
async function bridgeFetch(u, opts){
  const url = new URL(u, "http://x");
  const params = Object.fromEntries(url.searchParams.entries());
  let body = null;
  if(opts && typeof opts.body === "string"){ try{ body = JSON.parse(opts.body); }catch(_){ body = opts.body; } }
  SENT.push({ op: params.op, params, body });
  return mf.dispatchFetch(url.toString(), opts);
}
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
  IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1},
  requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){}, replaceState(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:bridgeFetch };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE","renderAdd","addTypeSync","addValidate","addGo","openRosterAct","doRosterAct","openProjectWorkspace",
  "doProjectVisibility","actRefusalHtml","VISIBILITY_UNCHOSEN",
].join(",") + "};", ctx);
const U = ctx.__U;
const OPENED = [];
const realOpenBundle = vm.runInContext("openBundle", ctx);
vm.runInContext("openBundle = globalThis.__openBundleSpy;", Object.assign(ctx, {
  __openBundleSpy: async (id, ...rest) => { OPENED.push(id); try{ return await realOpenBundle(id, ...rest); }catch(_){} } }));

const as = (tok, handle, caps) => {
  U.PLANE.token = tok; U.PLANE.session = true;
  U.PLANE.me = { member:handle, handle, session:true, administer:false, capabilities:caps };
};
as(OLIVE, "olive", ["contribute", "create_projects"]);

const visOf = async (id) => get("projectvisibility", "projectId=" + encodeURIComponent(id), OLIVE);
const projectCount = async () => {
  const l = await get("list", "", "adm-ui70");
  const rows = Array.isArray(l) ? l : (l && Array.isArray(l.bundles) ? l.bundles : []);
  return rows.filter(b => b && b.object_type === "project").length;
};
const fillAdd = (title) => {
  $$("#a-type").value = "project";
  $$("#a-title").value = title;
  $$("#a-body").value = "What the estuary permits allowed, and who signed them.";
};

/* ============================================================
   1. THE ADD FORM: two options, NOTHING PRESELECTED, and it cannot submit without the choice
   ============================================================ */
console.log("\n--- the Add form's project arm asks, preselects nothing, and will not submit unchosen ---");
await U.renderAdd();
const addPage = String(html("#content"));
const addRadios = radiosIn(addPage);
console.log(`  the Add form renders ${addRadios.length} setting option(s)`);
ok(`the Add form renders the two setting options (found ${addRadios.length})`,
   addRadios.length === 2 && addRadios.some(t => /id="a-vis-discoverable"/.test(t)) && addRadios.some(t => /id="a-vis-hidden"/.test(t)));
ok("NOTHING PRESELECTED on the Add form: neither option carries `checked`",
   addRadios.length === 2 && addRadios.every(t => !/\bchecked\b/.test(t)));
untick();
fillAdd("The estuary permits");
U.addTypeSync();
ok(`CANNOT SUBMIT: with a title and a body and no choice, the Add button is shut and says why (it says: "${$$("#a-n").textContent}")`,
   $$("#a-go").disabled === true && $$("#a-n").textContent === U.VISIBILITY_UNCHOSEN);
const before1 = await projectCount();
SENT.length = 0;
await U.addGo();
const unchosenErr = text(html("#a-err"));
ok(`CANNOT SUBMIT: an unchosen project sends NOTHING to the plane (sent: ${JSON.stringify(SENT.map(s => s.op))})`,
   !SENT.some(s => s.op === "promote" || s.op === "allocid"));
ok("CANNOT SUBMIT: and the record holds no new project — nothing was created HIDDEN in the member's place",
   (await projectCount()) === before1);
ok(`and the member is told what is missing (rendered: "${unchosenErr}")`, unchosenErr.includes(U.VISIBILITY_UNCHOSEN));
/* The choice moves the button: once it is made, the form's minimum is met. */
$$("#a-vis-discoverable").checked = true;
U.addValidate();
ok("once a setting is chosen the Add button opens", $$("#a-go").disabled === false);

/* ============================================================
   2. A CREATION CARRIES THE CHOICE, and the record reads it back
   ============================================================ */
console.log("\n--- a creation sends the chosen setting, and the record holds it ---");
SENT.length = 0; OPENED.length = 0;
await U.addGo();
const pr = SENT.find(s => s.op === "promote") || null;
ok(`the creation reached op=promote carrying visibility=discoverable (rendered: "${text(html("#a-err"))}")`,
   !!pr && pr.body && pr.body.visibility === "discoverable");
const DISC = OPENED[OPENED.length - 1] || null;
const v1 = DISC ? await visOf(DISC) : null;
ok(`the record reads the new project DISCOVERABLE, recorded, chosen by its creator (read: ${JSON.stringify(v1 && { setting:v1.setting, recorded:v1.recorded, by:(v1.history||[])[0]?.set_by })})`,
   !!v1 && v1.setting === "discoverable" && v1.recorded === true && (v1.history || []).length === 1
   && v1.history[0].set_by === "olive");

untick();
fillAdd("The estuary permits, the second reach");
$$("#a-vis-hidden").checked = true;
SENT.length = 0; OPENED.length = 0;
await U.addGo();
const prH = SENT.find(s => s.op === "promote") || null;
ok("a creation sent HIDDEN carries visibility=hidden", !!prH && prH.body && prH.body.visibility === "hidden");
const HID = OPENED[OPENED.length - 1] || null;
const v2 = HID ? await visOf(HID) : null;
ok("and the record holds HIDDEN as the owner's recorded CHOICE (recorded: true), not as the unrecorded default",
   !!v2 && v2.setting === "hidden" && v2.recorded === true);

/* THE COUNT IS AN INSTRUMENT, so it is shown to MOVE: "nothing was created" above is an equality, and an
   equality over a list that always answered empty would cost nothing (CLAUDE.md §5). Two creations, +2. */
const after2 = await projectCount();
console.log(`  the record's project count: ${before1} before the two creations, ${after2} after`);
ok(`the project count the CANNOT-SUBMIT arms rest on moves when a project IS created (${before1} -> ${after2})`,
   after2 === before1 + 2);

/* The surface sends `visibility` on a project's creation ALONE — the plane's C-97.2 is for any other, and a
   stale tick left on the page must not ride along on something that is not a project. */
untick();
$$("#a-vis-discoverable").checked = true;   // left over, as if from an abandoned project arm
$$("#a-type").value = "inquiry";
$$("#a-title").value = "Who signed the estuary permits";
$$("#a-body").value = "The permits name a signatory the minutes do not.";
SENT.length = 0;
await U.addGo();
const prQ = SENT.find(s => s.op === "promote") || null;
ok(`a question's creation reaches op=promote WITHOUT visibility, whatever tick is left on the page (rendered: "${text(html("#a-err"))}")`,
   !!prQ && prQ.body && !("visibility" in prQ.body));

/* ============================================================
   3. THE FORK FORM: nothing preselected, no submit unchosen, the choice sent, no inheritance
   ============================================================ */
console.log("\n--- the fork form asks, preselects nothing, will not submit unchosen, and sends the choice ---");
untick();
await U.openProjectWorkspace(HID);
U.openRosterAct("projectfork");
const dlg = String(html("#dlg"));
const forkRadios = radiosIn(dlg);
ok(`the fork form renders the two setting options (found ${forkRadios.length})`,
   forkRadios.length === 2 && forkRadios.some(t => /id="ra-vis-discoverable"/.test(t)) && forkRadios.some(t => /id="ra-vis-hidden"/.test(t)));
ok("NOTHING PRESELECTED on the fork form: neither option carries `checked`",
   forkRadios.length === 2 && forkRadios.every(t => !/\bchecked\b/.test(t)));
ok("CANNOT SUBMIT: the fork form's button is rendered shut until a setting is chosen",
   /<button class="btn" id="ra-go" disabled/.test(dlg));
$$("#ra-title").value = "The estuary permits, forked";
const before3 = await projectCount();
SENT.length = 0;
const fr0 = await U.doRosterAct();
ok(`CANNOT SUBMIT: an unchosen fork sends NOTHING to the plane (sent: ${JSON.stringify(SENT.map(s => s.op))})`,
   !SENT.some(s => s.op === "projectfork"));
ok("CANNOT SUBMIT: and the record holds no new project", (await projectCount()) === before3);
ok(`and the forker is told what is missing (rendered: "${text(html("#ra-err"))}")`,
   !!fr0 && fr0.unchosen === true && text(html("#ra-err")).includes(U.VISIBILITY_UNCHOSEN));
$$("#ra-vis-discoverable").checked = true;
SENT.length = 0;
const fr = await U.doRosterAct();
const fk = SENT.find(s => s.op === "projectfork") || null;
ok(`the fork reached op=projectfork carrying visibility=discoverable (rendered: "${text(html("#ra-err"))}")`,
   !!fk && fk.params.visibility === "discoverable");
const forkId = fr && typeof fr.newId === "string" ? fr.newId : null;
const v3 = forkId ? await visOf(forkId) : null;
ok("a fork of a HIDDEN project, sent discoverable, reads DISCOVERABLE — the fork chose, it did not inherit",
   !!v3 && v3.setting === "discoverable" && v3.recorded === true);

/* ============================================================
   4. THE OWNER CHANGES THE SETTING
   ============================================================ */
console.log("\n--- the owner changes the setting from the workspace ---");
untick();
await U.openProjectWorkspace(HID);
const ownPage = String(html("#content"));
const ownRadios = radiosIn(ownPage);
ok("the owner's workspace shows the setting as the record holds it (hidden)", /data-project-visibility="hidden"/.test(ownPage));
ok("the owner is offered the control", /id="pv-control"/.test(ownPage) && /doProjectVisibility\(\)/.test(ownPage));
ok("NOTHING PRESELECTED on the owner's control: two options, neither `checked`",
   ownRadios.length === 2 && ownRadios.every(t => !/\bchecked\b/.test(t)));
SENT.length = 0;
const pv0 = await U.doProjectVisibility();
ok("the owner's submit with no choice sends nothing", !!pv0 && pv0.unchosen === true && !SENT.some(s => s.op === "projectvisibilityset"));
$$("#pv-vis-discoverable").checked = true;
$$("#pv-reason").value = "the permits are public business";
SENT.length = 0;
await U.doProjectVisibility();
const set = SENT.find(s => s.op === "projectvisibilityset") || null;
ok(`the owner's act reached op=projectvisibilityset with the chosen setting (rendered: "${text(html("#pv-err"))}")`,
   !!set && set.params.setting === "discoverable" && set.params.projectId === HID);
const v4 = await visOf(HID);
ok("THE OWNER CHANGED IT: the record reads DISCOVERABLE, the latest of two acts, by the owner, with the reason",
   !!v4 && v4.setting === "discoverable" && (v4.history || []).length === 2
   && v4.history[1].set_by === "olive" && v4.history[1].reason === "the permits are public business");
ok("and the redrawn workspace shows it", /data-project-visibility="discoverable"/.test(String(html("#content"))));

/* ============================================================
   5. A NON-OWNER SEES IT READ-ONLY
   ============================================================ */
console.log("\n--- a joined participant who does not own the project reads the setting and is offered nothing ---");
const inv = await post("projectinvite", {}, OLIVE, `projectId=${encodeURIComponent(HID)}&handle=pat`);
const jn = await post("projectjoin", {}, PAT, `projectId=${encodeURIComponent(HID)}`);
ok(`pat is invited and joins (invite ${JSON.stringify(inv && inv.ok)}, join ${JSON.stringify(jn && jn.ok)})`, !!(inv && inv.ok) && !!(jn && jn.ok));
as(PAT, "pat", ["contribute"]);
untick();
await U.openProjectWorkspace(HID);
const patPage = String(html("#content"));
ok("READ-ONLY: the non-owner's workspace shows the setting as the record holds it",
   /data-project-visibility="discoverable"/.test(patPage));
ok("READ-ONLY: and says only an owner changes it", /data-project-visibility-readonly="1"/.test(patPage));
ok("READ-ONLY: no control is offered — no options, no submit, no call site",
   radiosIn(patPage).length === 0 && !/pv-control|pv-go|doProjectVisibility/.test(patPage));

/* ============================================================
   6. EVERY REFUSAL IS THE PLANE'S CANNED TRANSLATION
   ============================================================ */
console.log("\n--- every refusal is rendered as the plane's canned DEC-49 translation ---");
/* C-70.2 — the owner's commit path, driven by a non-owner (the control is absent for pat; the path is the
   one an owner who lost ownership since the page was drawn would reach). */
$$("#pv-vis-hidden").checked = true;
await U.doProjectVisibility();
const c702 = PROJECT_VISIBILITY_CHECKS.PROJECT_VISIBILITY_NOT_THE_OWNER.translation;
ok(`C-70.2 is rendered as its canned translation (rendered: "${text(html("#pv-err"))}")`,
   text(html("#pv-err")).includes(text(c702)));
ok("and the record did not move", (await visOf(HID)).setting === "discoverable");

/* C-97.1 — THROUGH THE ADD FORM. The plane decides ownerlessness by the CREDENTIAL, never by what the surface
   believes about itself: the form is held as a member's, and the credential the plane sees is the operator's
   bearer, so the creation has no owner to choose and `discoverable` is refused by name. */
as("adm-ui70", "olive", ["contribute", "create_projects"]);
untick();
fillAdd("The estuary permits, by the operator");
$$("#a-vis-discoverable").checked = true;
const before6 = await projectCount();
SENT.length = 0;
await U.addGo();
const c971 = PROJECT_CREATION_VISIBILITY_CHECKS.PROJECT_VISIBILITY_NO_OWNER.translation;
ok(`C-97.1 is rendered through the Add form as its canned translation (rendered: "${text(html("#a-err"))}")`,
   SENT.some(s => s.op === "promote") && text(html("#a-err")).includes(text(c971)));
ok("and nothing was created", (await projectCount()) === before6);

/* C-97.2 — no surface here sends `visibility` on anything but a project's creation (section 2 asserts it at the
   wire), so the plane's REAL answer is drawn directly and rendered by the ONE renderer every act surface uses. */
const pmd = await get("image", "id=" + encodeURIComponent(HID), OLIVE);
const lease = await get("lease", "id=" + encodeURIComponent(HID), OLIVE);
const r972 = await post("promote", { bundleId: HID, base: lease && lease.base, snapKey: "ui70-c972", visibility: "hidden",
  meta: { object_type:"project", title:"x" }, files: [{ path:"bundle.md", text: pmd && pmd["bundle.md"] }], register: [] }, OLIVE);
const c972 = PROJECT_CREATION_VISIBILITY_CHECKS.PROJECT_VISIBILITY_NOT_A_CREATION.translation;
ok(`the plane answers a revision carrying visibility with C-97.2 (answered: ${JSON.stringify(r972 && r972.reason)})`,
   !!r972 && r972.reason === "PROJECT_VISIBILITY_NOT_A_CREATION");
const c972html = U.actRefusalHtml(r972);
ok("C-97.2 is rendered as its canned translation, and not as the caller's detail",
   text(c972html).includes(text(c972)) && !text(c972html).includes("op=projectvisibilityset"));

/* ============================================================
   7. THE CLASS: every creation door in app.html that can make a project asks
   ============================================================
   What the matcher sees: `op:"projectfork"` act-table entries and `recPostR("promote", …)` sites whose
   `object_type` is the form's `type` (the only way app.html creates a project; every other promote site names a
   literal non-project type or revises). What it cannot see: a promote whose `object_type` is assembled
   elsewhere. Its corpus is printed. */
{
  const src = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const forkActs = [...src.matchAll(/op:"projectfork"/g)].length;
  const promotes = [...src.matchAll(/recPostR\("promote"/g)].length;
  const typedCreation = [...src.matchAll(/meta: \{ object_type: type, title,/g)].length;
  console.log(`  sweep: ${promotes} promote site(s), ${typedCreation} creating from the form's type; ${forkActs} fork act(s)`);
  ok("the sweep read a non-empty corpus", promotes >= 3);
  ok("there is ONE fork act, and it carries the choice", forkActs === 1 && /projectfork: \{[^}]*\n[^]*?choice: "visibility"/.test(src));
  ok("there is ONE promote site creating from the form's type (the Add form, driven above)", typedCreation === 1);
}

exitCode = fails.length ? 1 : 0;
} finally {
  await mf.dispose();
}
console.log(`\nproject-visibility-surface: ${n - fails.length}/${n} assertions passed`);
if(fails.length){ console.error(`project-visibility-surface: ${fails.length} of ${n} assertions FAILED`); }
process.exit(exitCode);
