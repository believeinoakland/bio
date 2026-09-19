/* UI-66 — THE ADD SURFACE AND THE FORK FORM STOP ASKING A MEMBER FOR A PROJECT ID; THE ID THE PLANE
 * RETURNS IS THE ONE SHOWN. Driven against the REAL PLANE.
 *
 * Design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7, the bullet *"HOW the plane mints a
 * project id"* (BOB #15): a caller-supplied id on a NEW project is REFUSED with one answer whether or not
 * that id exists; a fork's `newId` is minted the same way; the plane writes the minted id into the
 * document's `id:` before it hashes the bytes, refuses bytes that already carry one, and returns the id and
 * the final sha. *"The Add surface and the fork form stop asking a member for an id (a UI task)"* — this
 * item. The plane half is REC-141 (IC-158, C-59), driven in `bio-plane/test/project-mint.test.mjs`.
 *
 * NO MOCK OF THE WRITE PATH. The plane runs in miniflare from `bio-plane/src/index.mjs` — the real control
 * plane, the real Durable Object, the real SQLite schema — and `app.html`'s own `fetch` is bridged to it
 * (intent-write.test.mjs's instrument). The member is a real enrolled member holding `create_projects`,
 * signed in with a session, so the plane stamps `by` and the ownership itself.
 *
 * WHAT IT PROVES, in the row's accepts-when order:
 *   1. THE ADD SURFACE creates a project with NO id typed and NONE SENT: `addGo` reaches `op=promote` with no
 *      `bundleId` key in the body, no `id:` line in the bundle.md it sends, and `op=allocid` is never called
 *      for it. THE ROW'S LIAR — *"a hidden id field prefilled from a client-side generator"* — is caught
 *      HERE, by what is SENT, not by what is rendered: a hidden field renders nothing, so a render-side
 *      assertion would pass it. The sent body and the sent bytes are read off the bridge, as the plane
 *      received them.
 *   2. THE ID SHOWN IS THE ID IN THE REGISTERED BYTES: the id `addGo` opens is the plane's answer, and it is
 *      the `id:` line of the bundle.md the plane now holds, read back independently through `op=image`, and
 *      the page the surface opened names it.
 *   3. THE FORK FORM asks for exactly one thing — the fork's name — and no field anywhere on it lets a
 *      member type an id; the fork reaches `op=projectfork` with no `newId` key; the receipt shows the
 *      `newId` the plane answered, which is the `id:` line of the fork's registered bytes.
 *   4. A REFUSAL IS THE PLANE'S OWN SENTENCE. Every assertion that says "nothing was refused" carries in its
 *      failure message the text the surface rendered, so if the surface ever sends an id again the plane's
 *      refusal (C-59.1/.2/.3) is what the failing line NAMES — the row's negative control, verbatim.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/project-id-surface.control.mjs` — a BASELINE and four arms, each
 * mutating `civicos-ui/app.html` ALONE on disk, restored and verified by sha256 AND `cmp` against a per-arm
 * pristine copy. Declared before arming: (A) RESTORE THE FORK FORM'S ID FIELD -> RED, the form-fields
 * assertion and the fork assertions fail, the latter naming C-59.3's rendered sentence; (B) RESTORE THE ADD
 * SURFACE'S CLIENT-SIDE ID (allocid, `bundleId`, `id:` line) -> RED, naming C-59.1's rendered sentence;
 * (C) THE LIAR: a client-generated id written ONLY into the bytes (nothing visible, no `bundleId`) -> RED,
 * naming C-59.2's sentence; (D) OVER-STRICTNESS: `bundleId: minted ? undefined : id` (a spelling the
 * serializer drops) -> GREEN. RUN 2026-09-19: 5/5 AS DECLARED (baseline 29/29 · A 20/29 · B 9/29 · C 11/29 ·
 * D 29/29), each RED arm's failing line naming the plane's own C-59 sentence; hashes in the control's header.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard the writer's
   own output. SHARED from the plane's test estate; census: `stdio-census.test.mjs`. */
import fs from "fs";
import vm from "vm";
import { webcrypto } from "crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ---- the REAL plane, in miniflare, resolved from bio-plane's own dev dependency. Not installed is a
   FAILURE, never a skip: this suite's whole point is that the write path is not mocked. ---- */
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("project-id-surface: the real plane could not be started — miniflare is not installed.");
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
  bindings: { ADMIN_TOKEN: "adm-ui66", MEMBER_TOKEN: "mem-ui66", PROBE_TOKEN: "prb-ui66", VERSION: "test" },
});
let exitCode = 1;
try {
/* Direct plane calls, for SEEDING and INDEPENDENT read-back only. The surface's calls go through the bridge. */
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method:"POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* Real enrolled members: the first two on the roster are administrators (4.2/4.3); OLIVE is the member who
   creates and forks, holding `create_projects`, signed in with a SESSION so the plane stamps her. */
const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:caps }, "adm-ui66");
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

/* ---- the DOM stub (intent-write's shape): innerHTML inspection and field values read back. ---- */
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

/* ---- the bridge: every request the surface makes is recorded AS THE PLANE RECEIVED IT — the op, its
   query parameters, and a POST's parsed body. What is SENT is the subject; a hidden field sends. ---- */
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
  "PLANE","addGo","openRosterAct","doRosterAct","openProjectWorkspace","projectRosterBarHtml","ROSTER_ACTS",
].join(",") + "};", ctx);
const U = ctx.__U;
/* `openBundle` is WRAPPED, never replaced: the id the surface opens is recorded, then the real page is drawn,
   so "the id shown" is both the argument the surface chose and the page it rendered. */
const OPENED = [];
const realOpenBundle = vm.runInContext("openBundle", ctx);
vm.runInContext("openBundle = globalThis.__openBundleSpy;", Object.assign(ctx, {
  __openBundleSpy: async (id, ...rest) => { OPENED.push(id); try{ return await realOpenBundle(id, ...rest); }catch(e){ OPENED_ERR.push(e); } } }));
const OPENED_ERR = [];

U.PLANE.token = OLIVE;
U.PLANE.session = true;
U.PLANE.me = { member:"olive", handle:"olive", session:true, administer:false,
               capabilities:["contribute", "create_projects"] };

const topIdLine = (md) => {
  const s = String(md||""); if(!s.startsWith("---\n")) return null;
  const end = s.indexOf("\n---", 4); const fm = end < 0 ? "" : s.slice(4, end);
  const m = /^id:[ \t]*(.*)$/m.exec(fm); return m ? m[1].trim() : null;
};
const heldBundleMd = async (id) => {
  const img = await get("image", "id=" + encodeURIComponent(id), OLIVE);
  const md = img && img["bundle.md"];
  return typeof md === "string" ? md : null;
};

/* ============================================================
   1. THE ADD SURFACE: a project, NO id typed, NONE sent
   ============================================================ */
console.log("\n--- the Add surface creates a project with no id typed and none sent ---");
const TITLE = "The harbour dredging money";
$$("#a-type").value = "project";
$$("#a-title").value = TITLE;
$$("#a-body").value = "Where the dredging allocation went, and who decided.";
SENT.length = 0;
await U.addGo();
const addErrText = text(html("#a-err"));
const promotes = SENT.filter(s => s.op === "promote");
const pr = promotes[0] || null;
ok(`the Add surface reached op=promote exactly once (rendered: "${addErrText}")`, promotes.length === 1);
ok("op=allocid was NOT called for a project — the surface allocates no project id", !SENT.some(s => s.op === "allocid"));
ok("the promote body carries NO bundleId key at all (the row's liar: an id is caught by what is SENT)",
   !!pr && pr.body && typeof pr.body === "object" && !("bundleId" in pr.body));
const sentMd = pr && pr.body && Array.isArray(pr.body.files)
  ? (pr.body.files.find(f => f && f.path === "bundle.md") || {}).text : null;
ok("the bundle.md the surface sent is present and inline", typeof sentMd === "string" && sentMd.startsWith("---\n"));
ok("the bundle.md the surface sent carries NO id: line — the plane writes the one it mints",
   typeof sentMd === "string" && topIdLine(sentMd) === null);
ok("no query parameter smuggles an id either", !!pr && !Object.keys(pr.params).some(k => /^(bundleId|id|newId)$/.test(k)));
ok(`the plane did not refuse the creation (the surface rendered: "${addErrText}")`, addErrText === "");

/* 2. the id shown is the id in the registered bytes */
const shown = OPENED[OPENED.length - 1] || null;
ok("the surface opened the project it created", typeof shown === "string" && shown.length > 0);
ok("the id opened is in the plane's minted form (PROJ-<year>-<seq>-<slug>)", /^PROJ-\d{4}-\d{4}-/.test(String(shown)));
const heldMd = shown ? await heldBundleMd(shown) : null;
ok("the plane holds a bundle.md at the id the surface opened", typeof heldMd === "string");
ok("THE ID SHOWN IS THE ID IN THE REGISTERED BYTES — the id: line the plane wrote",
   typeof heldMd === "string" && topIdLine(heldMd) === shown);
ok("and the registered bytes are the surface's own document with that one line added (nothing else rewritten)",
   typeof heldMd === "string" && typeof sentMd === "string"
   && heldMd === sentMd.replace(/^---\n/, `---\nid: ${shown}\n`));
ok("the page the surface drew names that id", String(html("#content")).includes(String(shown)));
ok("the page was drawn without an error", OPENED_ERR.length === 0);

/* ============================================================
   3. THE FORK FORM: asks for the name only; sends no newId; shows the minted one
   ============================================================ */
console.log("\n--- the fork form asks for a name, sends no id, and shows the id the plane minted ---");
await U.openProjectWorkspace(shown);
const bar = String(html("#content"));
ok("the workspace offers the creator the fork control", bar.includes(`openRosterAct(&quot;projectfork&quot;)`));
ok("the fork act's declared fields are the name alone",
   JSON.stringify(U.ROSTER_ACTS.projectfork.fields.map(f => f[0])) === JSON.stringify(["title"]));
U.openRosterAct("projectfork");
const dlg0 = String(html("#dlg"));
const inputs = [...dlg0.matchAll(/<(?:input|textarea|select)\b[^>]*\bid="([^"]+)"/g)].map(m => m[1]);
ok(`the fork form renders exactly ONE field, the fork's name (found: ${JSON.stringify(inputs)})`,
   JSON.stringify(inputs) === JSON.stringify(["ra-title"]));
ok("no field on the fork form is hidden or prefilled", !/type="hidden"/i.test(dlg0) && !/\bvalue="/i.test(dlg0));
/* A member fills what the form asks. Any field it renders beyond the name is filled as a member would fill a
   required box — with something — so that, if an id field ever comes back, the PLANE is what answers it and
   its refusal is what this file names (the row's negative control). */
for(const f of inputs) $$("#" + f).value = f === "ra-title" ? "The harbour dredging money, second look" : "PROJ-2026-0099-typed";
SENT.length = 0;
const fr = await U.doRosterAct();
const forkErr = text(html("#ra-err"));
const fk = SENT.find(s => s.op === "projectfork") || null;
ok("the fork reached op=projectfork", !!fk);
ok("op=projectfork was sent NO newId key", !!fk && !("newId" in fk.params) && !(fk.body && "newId" in fk.body));
ok("and it was sent the origin and the name the member typed",
   !!fk && fk.params.projectId === shown && fk.params.title === "The harbour dredging money, second look");
ok(`the plane did not refuse the fork (the surface rendered: "${forkErr}")`, !!fr && !fr.refused && forkErr === "");
const forkId = fr && typeof fr.newId === "string" ? fr.newId : null;
ok("the plane answered the fork's minted id", !!forkId && /^PROJ-\d{4}-\d{4}-/.test(forkId) && forkId !== shown);
const receipt = String(html("#dlg"));
ok("the receipt shows the minted id", !!forkId && receipt.includes(forkId));
const forkMd = forkId ? await heldBundleMd(forkId) : null;
ok("THE FORK'S ID SHOWN IS THE ID IN ITS REGISTERED BYTES", typeof forkMd === "string" && topIdLine(forkMd) === forkId);
ok("and the fork's bytes carry exactly one id: line (the origin's was removed, not kept beside it)",
   typeof forkMd === "string" && (forkMd.split("\n---")[0].match(/^id:/mg) || []).length === 1);

/* ============================================================
   4. THE CLASS, SWEPT OVER THE SOURCE: no field anywhere lets a member type a project id
   ============================================================
   What the matcher sees: every `fields:[[name, label, req]]` entry in app.html's act tables, and every
   <input>/<textarea> whose id or label reads as an identifier of a PROJECT. What it cannot see: a field built
   by string concatenation from parts, or an id sent without a field (that is what arms 1 and 3 read, at the
   wire). Its corpus is printed. */
{
  const src = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const fieldDecls = [...src.matchAll(/\[\s*"([A-Za-z_]+)"\s*,\s*"([^"]*)"\s*,\s*"(?:required|optional)"\s*\]/g)];
  console.log(`  sweep: ${fieldDecls.length} act-table field declaration(s) read`);
  ok("the sweep read a non-empty corpus of field declarations", fieldDecls.length >= 5);
  const idFields = fieldDecls.filter(([, name, label]) => /^newId$/i.test(name) || (/\bid\b/i.test(label) && /project/i.test(label)));
  ok(`no act form asks for a project's id (found: ${JSON.stringify(idFields.map(m => m[1]))})`, idFields.length === 0);
  ok("the Add surface's project arm allocates nothing: allocid is reached only behind `!minted`",
     /if\(!minted\)\{\s*\n\s*const a = await recR\("allocid"/.test(src));
}

exitCode = fails.length ? 1 : 0;
} finally {
  await mf.dispose();
}
console.log(`\nproject-id-surface: ${n - fails.length}/${n} assertions passed`);
if(fails.length){ console.error(`project-id-surface: ${fails.length} of ${n} assertions FAILED`); }
process.exit(exitCode);
