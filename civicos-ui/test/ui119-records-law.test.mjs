/* UI-119 — A MEMBER STATES THE LAW A RECORDS REQUEST IS MADE UNDER, ON BOTH INTAKE SURFACES.
 *
 * THE ROW: REC-201 added the `records_request` kind and its `law` field (`recordsLawOf`, read verbatim onto
 * `op=projection`'s action block), and neither `civicos-ui/app.html`'s action intake nor the plane's setup
 * page (`bio-plane/src/setup.mjs`) offered it — the setup page could not even write the kind, because it wrote
 * every action as `other`. So every records request filed there read its law UNDETERMINED: honest, and thin.
 *
 * DESIGN: `docs/architecture/BIO_Case_Making_v0_1.md` §2, *A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*
 * (BOB #32's ruling of 2026-09-23 23:08Z, built in the plane by REC-201). Nothing prefilled (DEC-69).
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * `bio-plane/src/index.mjs` runs under miniflare and every write goes through `op=promote` from a SIGNED-IN
 * MEMBER SESSION (never MEMBER_TOKEN, which REC-189 found is a machine identity). The app's own `addGo`
 * composes and sends the action; the setup page's own `mdFor` composes it from what its own controls
 * report. What is asserted is read back through `op=projection` (`action.law`, the plane's own reader) and
 * `op=image` (the stored bytes) — never a string this file composed and then compared with itself.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (1) A CONTROL THAT COLLECTS A LAW THE WRITE PATH DROPS — §1 and §4 read the law back through the op, so a
 *      control whose value never reaches the bytes fails "STATED" by name. This is the row's NEGATIVE CONTROL.
 *  (2) A PREFILLED LAW (DEC-69) — §2 reads the rendered control for a value and a placeholder naming any law,
 *      and drives an UNTOUCHED control through the op: it must read the plane's undetermined.
 *  (3) A LAW WRITTEN ON ANOTHER KIND — §3 types a law, switches to `cpra_request`, and reads the bytes: no
 *      `law:` line, and the plane answers `kind` for it, read as written.
 *  (4) THE PAGE JUDGING THE LAW ITSELF — §5 asserts neither surface fences the length (no `maxlength`, no
 *      client-side refusal): the bound is C-2.10's, the plane's to apply in its own words (W46: a fence
 *      tighter than its rule, or merely BESIDE it, is an undeclared interface change).
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - The DOM is a stub, the reach every civicos-ui suite has: no browser fires a handler. The app's
 *    `onchange`/`oninput` handlers are invoked by this file in the order a member's clicks would fire them;
 *    the setup page's save handler is NOT dispatched, so its wiring to `mdFor` (the kind and the law read off
 *    `#n-kind`/`#n-law`) is pinned STRUCTURALLY in §4, as D-483's section of risk-tier.test.mjs pins its tier.
 *  - C-2.10's `law` arm DOES NOT REFUSE AT THE ACT on this base: `op=promote` lands a 250-character law, and
 *    the catalogue judges it only when the audit sweep reads the bytes. MEASURED in §5, not assumed; minted as
 *    D-695 (RECORD's: the promote path runs no `recordsLawFindings`). So no C-2.10 law refusal can reach either
 *    surface today, and what §5 holds is (a) neither surface pre-refuses in words of its own, and (b) the
 *    refusal path renders the plane's words, driven by a REAL refusal of the same findings shape
 *    (ACTION_BASIS_REFUSED, C-2.10). When D-695 lands, §5's "LANDS" arm fails and is corrected — never exempted
 *    — into a driven refusal read in the plane's own words.
 *    [c23-batch30 union, 2026-09-25 (CONDUCT #23): D-695 IS MERGED BESIDE THIS SUITE. The act now refuses
 *    RECORDS_LAW_REFUSED (C-73.6) and §5's arm is CORRECTED so (its comment there says why); the paragraph above
 *    is the base UI-119 measured, kept as the record of it. Control re-declared and re-run: 7/7 AS DECLARED.]
 *  - A MACHINE-PROPOSED law (D-689, BOB #35 2026-09-25 08:25Z: a machine may only PROPOSE a law; a member
 *    adopts) is NOT shown: nothing on this base stores or serves one, so there is nothing to render. The
 *    control is the member's statement; its display of a proposal waits on D-689's read.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/ui119-records-law.control.mjs [arm]` — splices COPIES of the app's
 * extracted script and the setup page's script, handed in through UI119_APP_SRC / UI119_SETUP_SRC; neither
 * file in the tree is edited. Results on the line below.
 * NEGATIVE CONTROL RESULT 2026-09-25 (UI-119 worker, over land/worker/REC-201 @ 45ce0bc5 + this item; app.html
 * 1,634,901 B sha256 82d52ae3b1e1…, setup.mjs 87,769 B sha256 b8ca512b2707…, neither edited by the driver):
 * 7 arms run, 7 AS DECLARED. baseline 37/0 · dropvalue (THE ROW'S CONTROL) 35/2, failing BY NAME at both
 * "UI-119 STATED" arms · setupdrop 36/1 "UI-119 SETUP STATED" · prefill 34/3 · otherkind 36/1 "UI-119 OTHER
 * KIND" (its neighbour, the plane reading `kind`, is blind to it as declared) · setupwords 35/2 · spelling
 * (over-strictness) 37/0. A SURPRISING GREEN ON THE FIRST RUN, RECORDED AS A FINDING ABOUT THE ARMS: prefill
 * came back 36/1 — "names no law of its own" read tag-stripped text, so a law drawn into `value=` was invisible
 * to it, and the stub never parsed a drawn `value=` into the element the page reads back, so "UI-119
 * UNTOUCHED" passed over a prefilled control. Both instruments were corrected (raw markup; the stub's
 * outerHTML setter loads the drawn value) and the second run is the one above.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";
import { ACTION_KINDS, CITATION_MAX, GOVERNING_LAW_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const plain = (h) => String(h).replace(/<[^>]*>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ");

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("ui119-records-law: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const APP_SRC = process.env.UI119_APP_SRC ? fs.readFileSync(process.env.UI119_APP_SRC, "utf8") : appScript();
const { SETUP_HTML } = await import("../../bio-plane/src/setup.mjs");
const SETUP_SRC = process.env.UI119_SETUP_SRC
  ? fs.readFileSync(process.env.UI119_SETUP_SRC, "utf8")
  : SETUP_HTML.slice(SETUP_HTML.lastIndexOf("<script>") + 8, SETUP_HTML.lastIndexOf("</script>"));

/* THE CITATIONS, deliberately NOT California's: the kind exists because a sovereign group may sit outside it,
   and a surface that quietly assumed the CPRA would agree with a CPRA fixture for free. The section sign and
   the parenthesis are the bytes a writer that did not quote its value would mangle. */
const FEDERAL = "5 U.S.C. § 552 (Freedom of Information Act)";
const LOCAL = "Oakland Municipal Code ch. 2.20 (Sunshine Ordinance)";
const NOW = "2026-09-25T00:00:00Z";

const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui119", MEMBER_TOKEN: "mem-ui119", PROBE_TOKEN: "prb-ui119", VERSION: "test",
              INSTANCE_NAME: "believe-in-oakland" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

try {
/* ============================================================ 0. THE GROUND */
console.log("--- 0. the ground: a real plane, a signed-in member ---");
const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}${tok ? "&token=" + tok : ""}`, { method: "POST", body: JSON.stringify(body) })).json());
const signIn = async (id, role) => {
  const add = await post("memberadd", { memberId: id, cover: `cover for ${id}`, role, capabilities: ["contribute"] }, "adm-ui119");
  const en = add && add.invite ? await post("enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` }) : null;
  const lg = en && en.ok ? await post("login", { role: `member:${id}`, password: `${id}-passphrase-1` }) : null;
  if (!lg || !lg.token) throw new Error(`sign-in ${id}: ${JSON.stringify(lg || en || add).slice(0, 200)}`);
  return lg.token;
};
await signIn("ruth", "admin"); await signIn("gus", "admin");   /* ADMINS_FIRST */
const SESSION = await signIn("olive", "member");
const read = async (op, qs) => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${SESSION}&${qs || ""}`)).json());
const readBack = async (id) => {
  const pj = await read("projection", `id=${encodeURIComponent(id)}`);
  const img = await read("image", `id=${encodeURIComponent(id)}`);
  return { action: pj && pj.action, md: String((img && img["bundle.md"]) || "") };
};
const lawLine = (md) => (/^law: (.*)$/m.exec(md) || [])[1] ?? null;

/* ---- the app, loaded against that plane (add-surface.test.mjs's UI-85 harness, one field on) ---- */
const pels = new Map();
const pel = () => { const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", disabled:false, checked:false, addEventListener(){}, click(){},
  querySelector:()=>pel(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, remove(){},
  setAttribute(){}, getAttribute(){ return null; } };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  /* The pane's repaint replaces `#a-act` by outerHTML; the stub keeps what was written so it can be read, AND
     does the one thing a browser's parse does that this suite depends on: the law input it draws holds the
     `value` its markup carries. Without it a value DRAWN into the field (a prefill) never reached the element
     the page reads back, and the untouched arm passed over a prefilled control — measured by the control's
     `prefill` arm, 2026-09-25, and recorded in the header. */
  Object.defineProperty(e, "outerHTML", { get(){ return e._outer || ""; }, set(v){ e._outer = v;
    const m = /<input[^>]*id="ac-law"[^>]*>/.exec(String(v || ""));
    if (m) { const vv = /value="([^"]*)"/.exec(m[0]); $$("#ac-law").value = vv ? vv[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : ""; } } });
  return e; };
const $$ = (s) => { if (!pels.has(s)) pels.set(s, pel()); return pels.get(s); };
const pctx = { console:{ log(){}, warn(){}, error(){}, info(){} }, URL, URLSearchParams, JSON, Array, Object, String,
  Number, Math, Date, RegExp, Promise, Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder,
  crypto: webcrypto, Blob: class {}, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1},
  requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}},
    getElementById:()=>pel(), hidden:false, createElement:()=>pel(), body:{appendChild(){},removeChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){}, replaceState(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch: (u, o) => mf.dispatchFetch(new URL(u, "http://x").toString(), o) };
pctx.globalThis = pctx; vm.createContext(pctx);
vm.runInContext(APP_SRC + ";globalThis.__P = {PLANE, recR, loadActSource, renderAdd, addTypeSync, addActPick, addActSync, addGo, addActKinds, addActionPaneHtml};", pctx);
const U = pctx.__P;
const OPENED = []; pctx.__open = async (id) => { OPENED.push(id); };
vm.runInContext("openBundle = globalThis.__open;", pctx);
U.PLANE.token = SESSION; U.PLANE.session = true;
U.PLANE.me = await U.recR("whoami");
await U.loadActSource(true);
ok(`the credential driving the intake is a SIGNED-IN MEMBER SESSION (whoami ${JSON.stringify(U.PLANE.me).slice(0, 120)})`,
   U.PLANE.me && U.PLANE.me.session === true && U.PLANE.me.member === "olive");
const kinds = U.addActKinds();
console.log(`  published kinds the intake can complete: ${JSON.stringify(kinds)}`);
ok("the intake offers records_request — the kind is published by the plane and not filtered out here",
   kinds.includes("records_request") && kinds.includes("cpra_request"));

/* The form as a member fills it: type, title, addressee, kind (the select's own onchange), then — if the pane
   drew one — the law field (its own oninput). `law` null means the member never touched the field. */
/* The pane as last drawn: a repaint writes `#a-act`'s outerHTML, a fresh form writes `#content`. */
const pane = () => $$("#a-act").outerHTML || $$("#content").innerHTML;
const openForm = async (title) => {
  /* A fresh form is fresh ELEMENTS in a browser; the stub keeps its nodes, so their values are cleared here
     the way renderAdd's redraw clears them — otherwise one form's answers would leak into the next's. */
  $$("#a-act").outerHTML = ""; $$("#ac-kind").value = ""; $$("#ac-law").value = "";
  await U.renderAdd();
  $$("#a-type").value = "action"; $$("#a-title").value = title; $$("#a-body").value = "Ask for the transfer ledger.";
  U.addTypeSync();
  U.addActPick("named"); $$("#ac-name").value = "City Clerk"; U.addActSync();
};
const chooseKind = (k) => { $$("#ac-kind").value = k; U.addActSync(); };
const typeLaw = (text) => { $$("#ac-law").value = text; U.addActSync(); };
const send = async () => {
  OPENED.length = 0;
  await U.addGo();
  return { id: OPENED[0] || null, err: plain($$("#a-err").innerHTML) };
};

/* ============================================================ 1. THE ROW'S ACCEPTS-WHEN (app) */
console.log("--- 1. a member files a records_request naming a law, and op=projection reads it verbatim ---");
await openForm("Records request under FOIA");
chooseKind("records_request");
const drawn = pane();
ok("choosing records_request DRAWS the law control on the pane", /id="ac-law"/.test(drawn), drawn.slice(0, 300));
typeLaw(FEDERAL);
const s1 = await send();
ok(`addGo wrote the records request through the plane (${s1.id || s1.err.slice(0, 300)})`, !!s1.id);
const r1 = s1.id ? await readBack(s1.id) : {};
console.log(`  stated: law line ${JSON.stringify(lawLine(r1.md || ""))}; projection ${JSON.stringify(r1.action && r1.action.law).slice(0, 200)}`);
ok("UI-119 STATED: op=projection reads the member's law VERBATIM, state stated",
   !!(r1.action && r1.action.kind === "records_request" && r1.action.law
      && r1.action.law.state === "stated" && r1.action.law.law === FEDERAL),
   JSON.stringify(r1.action && r1.action.law));
ok("UI-119 STATED: …and the stored bytes carry it as one quoted line, the section sign intact",
   lawLine(r1.md || "") === JSON.stringify(FEDERAL));

/* ============================================================ 2. NOTHING PREFILLED (DEC-69) */
console.log("--- 2. nothing prefilled: the control opens empty, and untouched it writes nothing ---");
await openForm("Records request, law not settled");
chooseKind("records_request");
const untouchedPane = pane();
const lawInput = (/<input[^>]*id="ac-law"[^>]*>/.exec(untouchedPane) || [""])[0];
console.log(`  the control as drawn: ${lawInput}`);
ok("the law control is EMPTY when drawn — no value", lawInput && /value=""/.test(lawInput) && !/value="[^"]/.test(lawInput));
ok("…and carries no placeholder naming a law (a suggestion is a prefill in a nicer coat)",
   lawInput && !/placeholder=/.test(lawInput));
/* Read over the RAW markup, attributes included: a law drawn into a value or a placeholder is not text a
   tag-stripper would show, and the first form of this arm (over plain text) was blind to exactly that. */
ok("…and the pane names no law of its own anywhere (no CPRA, no FOIA, no ordinance)",
   !/Public Records Act|Freedom of Information|U\.S\.C\.|Gov\. Code|Sunshine/i.test(untouchedPane));
/* The member never types in the field: it is sent AS DRAWN. */
const s2 = await send();
ok(`an untouched records request is written (${s2.id || s2.err.slice(0, 200)})`, !!s2.id);
const r2 = s2.id ? await readBack(s2.id) : {};
ok("UI-119 UNTOUCHED: no law line in the bytes, and op=projection reads the plane's own UNDETERMINED",
   lawLine(r2.md || "") === null && r2.action && r2.action.law && r2.action.law.state === "undetermined"
   && /^UNDETERMINED/.test(r2.action.law.stated || ""), JSON.stringify(r2.action && r2.action.law));

/* ============================================================ 3. ONLY ON records_request */
console.log("--- 3. the law belongs to records_request: absent on other kinds, never written on them ---");
await openForm("A CPRA request, typed law then changed kind");
chooseKind("records_request");
typeLaw(LOCAL);
chooseKind("cpra_request");
const cpraPane = pane();
ok("switching to cpra_request REMOVES the law control from the pane", !/id="ac-law"/.test(cpraPane));
const s3 = await send();
ok(`the cpra_request is written (${s3.id || s3.err.slice(0, 200)})`, !!s3.id);
const r3 = s3.id ? await readBack(s3.id) : {};
ok("UI-119 OTHER KIND: the law typed before the switch is NOT written — no law line on a cpra_request",
   lawLine(r3.md || "") === null && !String(r3.md || "").includes(LOCAL));
ok("…and the plane reads the cpra_request AS WRITTEN: law answers `kind`, no citation",
   r3.action && r3.action.law && r3.action.law.state === "kind" && r3.action.law.law === null,
   JSON.stringify(r3.action && r3.action.law));
await openForm("Back to a records request");
chooseKind("cpra_request");
ok("a kind that is not records_request never draws the control", !/id="ac-law"/.test(pane()));
chooseKind("records_request");
ok("…and choosing records_request after it draws it", /id="ac-law"/.test(pane()));

/* ============================================================ 4. THE SETUP PAGE */
console.log("--- 4. the setup page: a kind chooser over the catalogue's list, and the law for records_request ---");
/* A DOM stub that REMEMBERS its elements (D-483's shape). `form` is what the member did to the controls. */
const setupPage = (form = {}) => {
  const nodes = new Map();
  const node = () => ({ addEventListener() {}, classList: { add() {}, remove() {} }, checked: false,
    textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {} });
  const querySelector = (sel) => {
    if (sel === "input[name=n-risk]:checked") return null;
    if (!nodes.has(sel)) { const n = node(); if (sel === "#n-kind") n.value = form.kind || ""; if (sel === "#n-law") n.value = form.law || ""; nodes.set(sel, n); }
    return nodes.get(sel);
  };
  const sandbox = {
    document: { querySelector, querySelectorAll: () => [], getElementById: () => node(),
                addEventListener() {}, createElement: () => node(), body: { appendChild() {}, removeChild() {} } },
    location: { hash: "", pathname: "/", origin: "https://x" }, history: { replaceState() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    fetch: async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }),
    URLSearchParams, console: { log() {}, warn() {}, error() {} }, JSON, Date, RegExp, String, Number, Object, Array,
    crypto: webcrypto, setTimeout, TextEncoder, navigator: { clipboard: { writeText: async () => {} } },
  };
  sandbox.window = sandbox;
  const ui = new Function(...Object.keys(sandbox),
    SETUP_SRC + "\n;return { mdFor, FIRST_STATE, syncKind, refusedWhy, OFFERED_KINDS };")(...Object.values(sandbox));
  return { ui, nodes };
};
const fresh = setupPage();
const opts = [...String(fresh.nodes.get("#n-kind").innerHTML).matchAll(/<option value="([^"]*)"([^>]*)>/g)]
  .map((m) => ({ v: m[1], sel: /\bselected\b/.test(m[2]) }));
const EXPECT = ACTION_KINDS.filter((k) => k !== "request_for_comment");
console.log(`  setup kinds offered: ${JSON.stringify(opts.map((o) => o.v))}`);
ok("the setup page offers the catalogue's kinds it can complete, in order, after an EMPTY first choice",
   JSON.stringify(opts.map((o) => o.v)) === JSON.stringify(["", ...EXPECT]) && EXPECT.includes("records_request"));
ok("…with NOTHING preselected (DEC-69)", opts.every((o) => !o.sel));
fresh.ui.syncKind();                              /* what syncNewForm runs when the page opens the form */
ok("the law field is HIDDEN until records_request is chosen", fresh.nodes.get("#n-law-box").hidden === true);
const shown = setupPage({ kind: "records_request" }); shown.ui.syncKind();
ok("…and SHOWN when it is", shown.nodes.get("#n-law-box").hidden === false);
const other = setupPage({ kind: "cpra_request" }); other.ui.syncKind();
ok("…and hidden again on any other kind", other.nodes.get("#n-law-box").hidden === true);
const lawBox = (/<div id="n-law-box"[\s\S]*?<\/div>/.exec(SETUP_HTML) || [""])[0];
ok("the setup page's law input opens EMPTY, with no value and no placeholder naming a law",
   /<input id="n-law"/.test(lawBox) && !/<input id="n-law"[^>]*(value|placeholder)=/.test(lawBox));

let seq = 0;
const promoteSetup = async (id, act) => {
  const { ui } = setupPage({ kind: act.kind, law: act.law });
  const text = ui.mdFor(id, "action", ui.FIRST_STATE.action, "Setup intake", "What the member wrote.", NOW,
    false, null, { counterparty: { state: "named", name: "City Clerk" }, risk_tier: null, ...act });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: `20260925T010000Z_ui119${String(++seq).padStart(4, "0")}`, author: "member-olive",
    meta: { object_type: "action", title: "Setup intake", current_state: ui.FIRST_STATE.action, created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }], register: [],
  }, SESSION);
  return { r, text };
};
const w4 = await promoteSetup("ACTN-2026-0119-setup-local-law", { kind: "records_request", law: LOCAL });
ok(`the setup page's writer lands a records_request through op=promote (${JSON.stringify(w4.r).slice(0, 160)})`, w4.r && w4.r.ok === true);
const r4 = await readBack("ACTN-2026-0119-setup-local-law");
ok("UI-119 SETUP STATED: op=projection reads the setup page's law VERBATIM, kind records_request",
   r4.action && r4.action.kind === "records_request" && r4.action.law && r4.action.law.state === "stated"
   && r4.action.law.law === LOCAL, JSON.stringify(r4.action && r4.action.law));
const w4b = await promoteSetup("ACTN-2026-0120-setup-cpra", { kind: "cpra_request", law: LOCAL });
const r4b = await readBack("ACTN-2026-0120-setup-cpra");
ok("UI-119 SETUP OTHER KIND: a law reaching the writer on a cpra_request is not written; the plane reads `kind`",
   w4b.r && w4b.r.ok === true && lawLine(r4b.md) === null && r4b.action && r4b.action.law && r4b.action.law.state === "kind");
const w4c = await promoteSetup("ACTN-2026-0121-setup-unsettled", { kind: "records_request", law: "" });
const r4c = await readBack("ACTN-2026-0121-setup-unsettled");
ok("UI-119 SETUP UNTOUCHED: an empty law writes no line and reads the plane's UNDETERMINED",
   w4c.r && w4c.r.ok === true && lawLine(r4c.md) === null && r4c.action && r4c.action.law.state === "undetermined");
const none = setupPage().ui.mdFor("ACTN-2026-0122-x", "action", "planned", "t", "b", NOW, false, null,
  { counterparty: { state: "named", name: "City Clerk" }, risk_tier: null });
ok("the setup writer called with no kind still writes the catalogue's `other` and no law (the conformance suites' call)",
   /^action_kind: other$/m.test(none) && lawLine(none) === null);
/* The save handler is not dispatched (stated in the header): its wiring is pinned where it lives. */
ok("STRUCTURAL: the setup save path sends the chosen kind and, for records_request only, #n-law's value",
   /law: kind === "records_request" && \$\("#n-law"\) \? \$\("#n-law"\)\.value : ""/.test(SETUP_SRC)
   && /risk_tier: chosenRiskTier\(\), kind,/.test(SETUP_SRC));
ok("STRUCTURAL: the setup save path asks for a kind rather than defaulting one",
   /if \(!kind\) \{ e\.textContent = "Say what kind of ask this is\."; return; \}/.test(SETUP_SRC));

/* ============================================================ 5. C-2.10 AND THE PLANE'S WORDS */
console.log("--- 5. the length bound is the plane's: neither surface fences it, and a refusal is read in the plane's words ---");
const LONG = "Cal. Gov. Code " + "§ 7920.000 ".repeat(Math.ceil((CITATION_MAX + 20) / 11));
ok(`the over-long fixture is over C-2.10's bound (${LONG.trim().length} > ${CITATION_MAX})`, LONG.trim().length > CITATION_MAX);
ok("NO SURFACE FENCE: neither intake carries a maxlength on its law control",
   !/id="ac-law"[^>]*maxlength/i.test(drawn) && !/id="n-law"[^>]*maxlength/i.test(SETUP_HTML));
await openForm("An over-long citation");
chooseKind("records_request");
typeLaw(LONG);
const s5 = await send();
console.log(`  over-long law through the app: ${s5.id ? "LANDED " + s5.id : "refused: " + s5.err.slice(0, 200)}`);
/* CORRECTED 2026-09-25 at the c23-batch30 union (CONDUCT #23), never exempted. This arm read "D-695 PINNED:
   op=promote LANDS an over-long law today" and asserted `!!s5.id` — true on UI-119's base, where C-2.10's `law` arm
   ran only in the audit sweep, and written to go red the day D-695 landed. D-695 is merged beside this suite:
   `promote` now runs recordsLawFindings at the act and REFUSES the over-long law as RECORDS_LAW_REFUSED (C-73.6),
   carrying C-2.10's own sentence. So the old assertion (the write lands) is WRONG on this tree, and the arm now
   asserts the REFUSAL — nothing landed, the code and its catalogue row, and the page showing the plane's own words
   (the finding's sentence), never words of its own. The page still sends the law unjudged (NO SURFACE FENCE above). */
const LAW_ROW = GOVERNING_LAW_CHECKS.RECORDS_LAW_REFUSED;
ok("D-695 REFUSES AT THE ACT: the catalogue row is C-73.6 RECORDS_LAW_REFUSED, with a canned translation",
   !!LAW_ROW && LAW_ROW.check === "C-73.6" && typeof LAW_ROW.translation === "string" && LAW_ROW.translation.length > 40);
const w5 = await promoteSetup("ACTN-2026-0124-setup-long-law", { kind: "records_request", law: LONG.trim() });
const lawDetail = w5.r && Array.isArray(w5.r.findings) && w5.r.findings[0] && w5.r.findings[0].detail;
console.log(`  the over-long law at the act: ${JSON.stringify(w5.r).slice(0, 320)}`);
ok("D-695 REFUSES AT THE ACT: op=promote refuses the over-long law RECORDS_LAW_REFUSED with C-2.10's own sentence, and nothing landed",
   w5.r && w5.r.ok === false && w5.r.reason === "RECORDS_LAW_REFUSED" && w5.r.check === "C-73.6"
   && w5.r.findings[0].check === "C-2.10"
   && typeof lawDetail === "string" && lawDetail.includes(`longer than ${CITATION_MAX} characters`)
   && (await readBack("ACTN-2026-0124-setup-long-law")).md === "", JSON.stringify(w5.r).slice(0, 300));
ok("D-695 IN THE PLANE'S WORDS (app): the app's send was REFUSED, nothing opened, and the page shows the plane's own sentence",
   !s5.id && s5.err.includes(lawDetail), s5.err.slice(0, 300));
const why5 = setupPage().ui.refusedWhy(w5.r);
ok("D-695 IN THE PLANE'S WORDS (setup): the setup page renders the plane's own canned translation for C-73.6, verbatim, not its code",
   w5.r.translation === LAW_ROW.translation && why5 === LAW_ROW.translation && !why5.includes("RECORDS_LAW_REFUSED"),
   why5.slice(0, 300));

/* The refusal path, driven by a REAL refusal of the shape a C-2.10 act refusal would take: a basis leg
   pointing at nothing, refused ACTION_BASIS_REFUSED with a C-2.10 finding and its detail. */
const leg = ["---", "id: ACTN-2026-0123-bad-leg", "object_type: action", "schema: action@1", "title: bad leg",
  "current_state: planned", `created: ${NOW}`, `last_updated: ${NOW}`, "action_kind: records_request",
  "risk_tier: undetermined", "counterparty:", "  state: named", '  name: "City Clerk"',
  "action_basis:", "  - target: INQ-2026-9999-nothing-here", "    kind: rests_on", "---", "", "## Plan", "", "x", ""].join("\n");
const refused = await post("promote", { bundleId: "ACTN-2026-0123-bad-leg", base: null, snapKey: "20260925T020000Z_ui119r",
  author: "member-olive", meta: { object_type: "action", title: "bad leg", current_state: "planned", created: NOW, last_updated: NOW },
  files: [{ path: "bundle.md", text: leg, bytes: Buffer.byteLength(leg), sha256: sha(leg) }], register: [] }, SESSION);
const detail = refused && Array.isArray(refused.findings) && refused.findings[0] && refused.findings[0].detail;
console.log(`  a real C-2.10 act refusal: ${JSON.stringify(refused).slice(0, 240)}`);
ok("the plane refuses a dangling leg with a C-2.10 finding carrying its own detail (the fixture is real)",
   refused && refused.ok === false && refused.findings[0].check === "C-2.10" && typeof detail === "string" && detail.length > 40);
const why = setupPage().ui.refusedWhy(refused);
ok("UI-119 SETUP WORDS: the setup page renders that refusal in the PLANE's words, verbatim, and not its code",
   why.includes(detail) && !why.includes(refused.reason), why.slice(0, 200));
/* A SYNTHETIC code, deliberately: this arm tests the page's PRECEDENCE (translation before code), and a real code
   carrying a sentence typed here would feed check-refusal-codes a translation the plane never sends. */
const coded = setupPage().ui.refusedWhy({ ok: false, reason: "UI119_SYNTHETIC", translation: "The plane's own sentence." });
ok("…and a refusal carrying a canned translation renders the translation, not the code",
   coded === "The plane's own sentence.");
ok("…and one carrying nothing else still says it was refused and nothing was written (the code is all it has)",
   /^Refused: X_ONLY\. Nothing was written\.$/.test(setupPage().ui.refusedWhy({ ok: false, reason: "X_ONLY" })));
} finally {
  await mf.dispose();
}
console.log(`\nui119-records-law: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
