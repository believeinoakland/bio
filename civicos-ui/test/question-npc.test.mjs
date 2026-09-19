/* UI-67 — THE QUESTION'S PAGE READS THE NO-PROJECT CONCLUSION FROM
 * `op=projection`, FORGETS ITS CACHED PROJECTION WHEN A CONCLUSION OR A
 * WITHDRAWAL LANDS, AND OFFERS NO DIALOG THE PLANE THEN REFUSES.
 *
 * DESIGN AUTHORITY: `docs/development/INVESTIGATIVE-SESSION.md` §7.1, the
 * paragraph "The question's page reads the no-project conclusion from
 * `op=projection`" (BOB #16, 2026-09-19) and the REC-144 (IC-160) "Built" note
 * under it. Plus the `DELEGATION 2026-09-18 RECORD (REC-142) -> UI` block in
 * `docs/development/CLAIMS.md`, which this suite's section 4 discharges.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 * STATED FIRST, because every assertion below is cut against it, and each
 * criterion says in its own words why the cheap way does not also make the
 * world right.
 *
 *  (1) RENDER THE CONCLUSION FROM THE PAGE'S OWN MEMORY OF THE ACT IT JUST
 *      TOOK. The member concluded in this session, so the page could simply
 *      keep what it sent and draw that. It would be green on every "the page
 *      shows the conclusion" arm and WRONG for every other reader — a second
 *      member opening the same question, or the same member after a reload,
 *      sees nothing. So section 3 reads the block's claim, its relationship
 *      sentence and its falsifier back against `op=projection`'s OWN answer
 *      taken independently over the wire, and section 5 re-reads the page after
 *      acts this page did not take.
 *
 *  (2) NEVER CACHE AT ALL. Deleting `PROJ_CACHE`'s writer would make every
 *      "the page asked the record again" arm green without one line of
 *      invalidation, and it would also make `bound-sweep` ARM G's CARRIED-OUT
 *      bucket wrong. So sections 2, 3 and 5 each carry an INSTRUMENT arm first:
 *      two `openInquiry` calls with NO act between them ask `op=projection`
 *      exactly ONCE. Without that arm, "it asked again" measures nothing.
 *
 *  (3) STUB THE RENDER — draw the section from a constant, or draw the
 *      member's conclusion TEXT in the claim slot. §7.1 item 6 is explicit that
 *      a conclusion text is not a second name for the claim, and the whole of
 *      "less narrative" is that a record must not say more than it holds. So
 *      section 6 drives the LEGACY case, where the plane's own answer says the
 *      claim is UNDETERMINED, and asserts the page states that and does not
 *      fill it in from the text sitting right beside it.
 *
 *  (4) PASS REC-142'S ARM BY DROPPING `conclude` FROM THE PAGE ENTIRELY. "No
 *      dialog is offered that the plane then refuses" is trivially true of a
 *      page that offers nothing. So section 4 asserts the act is still NAMED
 *      with the plane's own label, that its routing sentence carries a working
 *      control to the project's own view of the question, and — the
 *      over-strictness direction — that on an UNCONCLUDED question the same
 *      member IS offered the working dialog.
 *
 *  (5) PASS THE CLASS SWEEP WITH A LIST. Section 7 does not carry a list of
 *      sites; it WALKS `app.html` for every `actAsk("conclude"…)` and
 *      `actAsk("withdrawconclusion"…)` call and prints what it found, so a
 *      sixth site lands red rather than unseen.
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * The criterion is what the RECORD holds and what the plane PUBLISHES, so a
 * mock answering hand-written envelopes would be this suite agreeing with
 * itself. The plane is `bio-plane/src/index.mjs` under miniflare, the members
 * are enrolled through the real ops, the project is minted by the plane, and
 * every conclusion is read back off `op=projection`, `op=basisversions` and the
 * record's own bytes (`op=image`).
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - IT CANNOT prove a browser paints what this harness's `innerHTML` holds.
 *    It drives the page's own loader and reads the markup that loader wrote;
 *    the DOM is a stub. That is the same reach every civicos-ui suite has.
 *  - IT CANNOT show a no-project conclusion being WITHDRAWN, because the plane
 *    cannot do it: `op=withdrawconclusion` is a PROJECT's act and refuses
 *    NOT_A_PROJECT with no `project=` ("a conclusion drawn with no project is
 *    the inquiry's own state, and moving it is op=reopen's"), and `op=reopen`
 *    refuses a concluded inquiry that is in no case (REC-31's rule). That is
 *    INVESTIGATIVE-SESSION.md §7.1's own DESIGN GAP (b), quoted in section 5 and
 *    re-measured there against this plane rather than believed. The row's
 *    "a withdrawal clears it" therefore names something the record cannot do
 *    today; writing an arm that asserted a disappearance would be this suite
 *    inventing a plane. What section 5 asserts instead is the property the
 *    design states — after a withdrawal lands, the question's page asks the
 *    record again instead of answering from its own memory, and renders what
 *    came back.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/question-npc.control.mjs` — five
 * arms, each ALONE, each restored from its own uniquely-named pristine copy and
 * verified by sha256 AND `cmp`. Declared results are in that file's header and
 * its run is recorded on the `NEGATIVE CONTROL:` line at the foot of this one.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: shared, for its side effect. */
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
  console.error("question-npc: the real plane could not be started — miniflare is not installed.");
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
  bindings: { ADMIN_TOKEN: "adm-ui67", MEMBER_TOKEN: "mem-ui67", PROBE_TOKEN: "prb-ui67", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const enc = encodeURIComponent;

/* ============================================================
   0. THE GROUND — a real plane, real members, a real project
   ============================================================ */
console.log("\n--- 0. the ground: a real plane, a question with readings, a project that draws on it ---");

const enrol = async (memberId, password, role, capabilities = ["contribute"]) => {
  const add = rP(await POST("op=memberadd&token=adm-ui67",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* Membership 4.2: the first two invitations create administrators, so the member
   who concludes here is the third and carries `contribute` on her own. */
await enrol("nadia", "nadia-passphrase-1", "admin");
await enrol("omar", "omar-passphrase-1", "admin");
const PILAR = await enrol("pilar", "pilar-passphrase-1", "member", ["contribute", "create_projects"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const DOC = "INFO-2026-6700-ledger", DOC2 = "INFO-2026-6700-minutes";
const INQ = "INQ-2026-6700-transfer";      /* concluded with no project, and a project draws on it */
const INQ_OPEN = "INQ-2026-6700-open";     /* never concluded: the null arm and the over-strictness arm */
const INQ_LEGACY = "INQ-2026-6700-legacy"; /* concluded in its bytes before §7.1 item 6 */

const CLAIM_R1 = "The ledger shows the transfer was booked before the council met.";
const CLAIM_R2 = "The minutes show the council approved the transfer after it was booked.";
const R1 = "booked early", R2 = "approved after";
const CONCLUSION_TEXT = "The transfer was booked first and the council approved it afterwards.";
const FALSIFIER_TEXT = "A council minute approving the transfer before the booking date.";
const LEGACY_TEXT = "The transfer was authorised, as the old act recorded it.";

const q = (s) => `"${s}"`;
const versionLines = (versions) => {
  const rows = versions.flatMap((v) => [`  - name: ${q(v.name)}`,
    `    description: ${q(v.description)}`, `    relationship: "and"`,
    `    state: ${q(v.state)}`,
    ...(v.state === "accepted" ? [`    state_by: "nadia"`, `    state_at: ${q(NOW)}`] : []),
    `    derived_from: null`, `    hidden: false`,
    ...(v.claim ? [`    claim: ${q(v.claim)}`] : []),
    `    author: "nadia"`, `    at: ${q(NOW)}`]);
  const grounds = versions.flatMap((v) => [`  - version: ${q(v.name)}`, `    ground: "the record"`,
    `    asserted_by: "nadia"`, `    at: ${q(NOW)}`]);
  const legs = versions.flatMap((v) => v.legs.flatMap((t) => [`  - version: ${q(v.name)}`,
    `    target: ${q(t)}`, `    role: "supports"`, `    ground: "the record"`]));
  return ["basis_versions:", ...rows, "basis_version_grounds:", ...grounds, "basis_version_legs:", ...legs];
};
const inquiryMd = (id, question, { versions = [], legacy = null } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`,
  ...(legacy
    ? ["current_state: concluded", "prior_state: open", `conclusion: ${q(legacy.conclusion)}`,
       `falsifier: ${q(legacy.falsifier)}`]
    : ["current_state: open", "prior_state: null"]),
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", `  - target: ${DOC}`, "    rel: cites", "    status: confirmed",
  `  - target: ${DOC2}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${DOC}`, "    role: supports", `  - target: ${DOC2}`, "    role: supports",
  ...(versions.length ? versionLines(versions) : []),
  "---", "", "## Question", "", question, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "",
  "A minute of the council that contradicts the booking order.", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Record ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured record.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
/* REC-141 / IC-158: a project's id is MINTED by the plane; creation bytes carry
   no `id:` line and the promote names no bundleId. It CITES the question, which
   is what puts it in `op=backlinks` and what REC-142 keys the act on. */
const projectMd = (id) => ["---",
  ...(id === null ? [] : [`id: ${id}`]), "object_type: project", `title: "Oversight"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "references:", `  - target: ${INQ}`, "    rel: cites", "    status: confirmed",
  "required_strength:", "  capture: B", "  connection: C",
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");

let seq = 0;
const promote = async (id, md, type, state, token = "mem-ui67") => {
  const r = rP(await POST(`op=promote&token=${token}`, {
    ...(id === null ? {} : { bundleId: id }), base: null, snapKey: `${id ?? type}-${++seq}`, author: "seed",
    meta: { object_type: type, group: "believe-in-oakland", title: `t ${id ?? "oversight"}`,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [],
  }));
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  return r;
};
const V = (name, claim, state, legs = [DOC]) => ({ name, claim, state, legs,
  description: `The reading called ${name}.` });

await promote(DOC, infoMd(DOC), "information", "collected");
await promote(DOC2, infoMd(DOC2), "information", "collected");
await promote(INQ, inquiryMd(INQ, "When was the transfer booked, and was it approved?", { versions: [
  V(R1, CLAIM_R1, "accepted", [DOC]), V(R2, CLAIM_R2, "accepted", [DOC2]) ] }), "inquiry", "open");
await promote(INQ_OPEN, inquiryMd(INQ_OPEN, "Did anybody object to the transfer in writing?", { versions: [
  V(R1, CLAIM_R1, "accepted", [DOC]) ] }), "inquiry", "open");
await promote(INQ_LEGACY, inquiryMd(INQ_LEGACY, "Was the old transfer authorised?", {
  versions: [V("old reading", "An old claim stated after the fact.", "accepted")],
  legacy: { conclusion: LEGACY_TEXT, falsifier: "a rescinding minute" } }), "inquiry", "concluded");
/* The project is created by the concluding member, so she is its owner and a
   JOINED participant (Membership 7.1) — REC-134's positional check is met by the
   record rather than bypassed by the fixture, which is what makes REC-142's
   affordance real here. */
const PROJ = (await promote(null, projectMd(null), "project", "forming", PILAR)).bundleId;
if (typeof PROJ !== "string") throw new Error("promote project: the plane returned no minted id");

const projOf = async (id) => rP(await GET(`op=projection&token=${PILAR}&id=${enc(id)}`));
const bvOf = async (id, project) => rP(await GET(`op=basisversions&token=${PILAR}&id=${enc(id)}&limit=50`
  + (project ? `&project=${enc(project)}` : "")));
const imageOf = async (id) => rP(await GET(`op=image&token=${PILAR}&id=${id}`))["bundle.md"];
const fmScalar = (text, key) => {
  const m = new RegExp(`^${key}:[ \\t]*(.*)$`, "m").exec(String(text).split("\n---")[0] || text);
  return m ? m[1].trim().replace(/^"|"$/g, "") : null;
};

ok("THE FIXTURE IS REAL: the plane holds both readings of the question, accepted and each stating a claim",
  (await bvOf(INQ)).versions.length === 2
  && (await bvOf(INQ)).versions.every((v) => v.state === "accepted" && !!v.claim),
  JSON.stringify(((await bvOf(INQ)).versions || []).map((v) => [v.name, v.state, v.claim])));
ok("THE FIXTURE IS REAL: the project the plane minted draws on the question, by the record's own reverse index",
  (rP(await GET(`op=backlinks&token=${PILAR}&target=${enc(INQ)}`)).backlinks || [])
    .some((b) => b.from === PROJ && String(b.from_type || "").includes("project")),
  JSON.stringify(rP(await GET(`op=backlinks&token=${PILAR}&target=${enc(INQ)}`)).backlinks));

/* ============================================================
   1. THE SUBSTRATE, RE-MEASURED HERE — one reader, two reads
   ============================================================ */
console.log("\n--- 1. the plane's two reads agree, and are null before anything is concluded ---");
/* CLAUDE.md: never assume the lower levels are complete. REC-144's own suite
   pins this; it is re-measured against THIS plane because a dependency believed
   on the strength of a row saying so is the failure that rule exists for. */
ok("op=projection publishes `no_project_conclusion` as a FIELD on an inquiry, and it is null while the question is open",
  Object.prototype.hasOwnProperty.call(await projOf(INQ), "no_project_conclusion")
  && (await projOf(INQ)).no_project_conclusion === null,
  JSON.stringify((await projOf(INQ)).no_project_conclusion));
ok("and null on a document, which is not a question at all",
  (await projOf(DOC)).no_project_conclusion === null);
ok("THE LEGACY QUESTION IS ALREADY CONCLUDED IN ITS BYTES, and the two reads agree BYTE FOR BYTE on what it says",
  JSON.stringify((await projOf(INQ_LEGACY)).no_project_conclusion)
  === JSON.stringify((await bvOf(INQ_LEGACY)).no_project_conclusion)
  && (await projOf(INQ_LEGACY)).no_project_conclusion !== null,
  JSON.stringify((await projOf(INQ_LEGACY)).no_project_conclusion));

/* ============================================================
   THE SURFACE, LOADED, ITS FETCH BRIDGED TO THAT PLANE
   ============================================================ */
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
const SAID = new Set();
function harvest(o){
  if (!o || typeof o !== "object") return;
  if (typeof o.detail === "string" && o.detail) SAID.add(o.detail);
  if (typeof o.error === "string" && o.error) SAID.add(o.error);
  for (const v of Object.values(o)) if (v && typeof v === "object") harvest(v);
}
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
    WIRE.push({ op: url.searchParams.get("op"), url, params: Object.fromEntries(url.searchParams.entries()) });
    const r = await mf.dispatchFetch(url.toString(), opts);
    try { harvest(await r.clone().json()); } catch (_) {}
    return r;
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE", "esc", "openInquiry", "openConclude", "concludeAuthor", "doConclude",
  "stanceOpen", "stanceCxField", "stanceWdField",
].join(",") + ", CONCL: () => CONCL, STANCE: () => STANCE };", ctx);
const U = ctx.__U;
U.PLANE.token = PILAR;
U.PLANE.session = true;
U.PLANE.me = { member: "pilar", handle: "pilar", session: true, administer: false,
               capabilities: ["contribute", "create_projects"] };

const ACT = { id: "conclude", label: "Conclude", weight: "single", needs: "contribute",
              mode: "session", rung: null, prompt: null };
const page = () => $$("#content")._html;
const dlg = () => $$("#dlg")._html;
const RENDERED = [];
const capture = (h) => { for (const m of h.matchAll(/<div class="intent-ref-why">([^<]*)<\/div>/g)) RENDERED.push(m[1]); return h; };
const unent = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&rsquo;/g, "\u2019").replace(/&mdash;/g, "\u2014");
const lastOf = (op) => WIRE.filter((w) => w.op === op).slice(-1)[0];
/* THE ONE MEASUREMENT THE CACHE ARMS REST ON: how many times the page asked the
   record for THIS row, counted on the wire rather than inferred from a render. */
const projAsks = (id) => WIRE.filter((w) => w.op === "projection" && w.params.id === id).length;
function runAttr(src){ return vm.runInContext(unent(src), ctx); }
function clickText(html, text){
  const m = new RegExp(`<button[^>]*onclick="([^"]*)"[^>]*>${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</button>`).exec(html);
  ok(`the surface RENDERED a control reading "${text}"`, !!m);
  return m ? runAttr(m[1]) : undefined;
}
function clickId(html, id){
  const m = new RegExp(`<button[^>]*id="${id}"[^>]*onclick="([^"]*)"`).exec(html);
  ok(`the surface RENDERED a control with id="${id}" for the member to use`, !!m);
  return m ? runAttr(m[1]) : undefined;
}
function pickRendered(html, name){
  const at = html.indexOf(`data-cx-reading="${U.esc(name)}"`);
  const m = at === -1 ? null : /<input type="radio"[^>]*onchange="([^"]*)"/.exec(html.slice(at));
  ok(`the conclude dialog RENDERED the reading '${name}' as a choice`, !!m);
  return m ? runAttr(m[1]) : undefined;
}
/* Every act control the page rendered, as the id the bar routes it by. This is
   what makes "no dialog is offered that the plane refuses" a statement about the
   MARKUP a member can click, not about a variable. */
const actButtons = (html) => [...html.matchAll(/onclick="actGo\(&quot;([a-z]+)&quot;/g)].map((m) => m[1]);

/* ============================================================
   2. BEFORE: an open question says nothing about a conclusion
   ============================================================ */
console.log("\n--- 2. an unconcluded question: nothing is drawn, and the cache is real ---");

await U.openInquiry(INQ);
const b0 = capture(page());
ok("the question's page rendered at all (a sweep over an error page proves nothing)",
  /What it rests on/.test(b0) && b0.includes(U.esc("When was the transfer booked, and was it approved?")),
  b0.slice(0, 400));
ok("NOTHING IS DRAWN for a question the record has not concluded — and no sentence is written in its place",
  !/data-npc\b/.test(b0) && !/What this question concluded/.test(b0));
const ASK1 = projAsks(INQ);
ok("the page asked the record for this row (op=projection), which is the read the conclusion arrives on", ASK1 >= 1);
/* THE INSTRUMENT ARM (liar (2)): without it, "the page asked again" below is
   satisfied by a page that never caches — which would be a different defect
   wearing this suite's green, and would also break bound-sweep ARM G's
   CARRIED-OUT bucket. */
await U.openInquiry(INQ);
ok("INSTRUMENT: THE CACHE IS REAL — opening the same question again with no act between asks op=projection NO second time",
  projAsks(INQ) === ASK1, `${ASK1} -> ${projAsks(INQ)}`);

/* ============================================================
   3. THE MEMBER CONCLUDES, THROUGH THE PAGE'S OWN DIALOG
   ============================================================ */
console.log("\n--- 3. the member concludes with no project, and the question's page shows it ---");

await U.openConclude(INQ, "When was the transfer booked, and was it approved?", ACT);
const d0 = capture(dlg());
ok("the conclude dialog opened on the question this page is showing", /<h2>Conclude<\/h2>/.test(d0));
await U.concludeAuthor("conclusion", CONCLUSION_TEXT);
await U.concludeAuthor("falsifier", FALSIFIER_TEXT);
pickRendered(dlg(), R2);
const ASK_BEFORE_COMMIT = projAsks(INQ);
await U.doConclude();
const d1 = capture(dlg());
ok("THE COMMIT WAS ACCEPTED — the record's receipt stands where a refusal would",
  /<h2>Concluded<\/h2>/.test(d1), (/<div class="intent-ref-why">([^<]*)<\/div>/.exec(d1) || ["", "<no refusal>"])[1]);
ok("and the RECORD's own bytes carry it: concluded, on the picked reading, adopting its claim word for word",
  fmScalar(await imageOf(INQ), "current_state") === "concluded"
  && fmScalar(await imageOf(INQ), "conclusion_version") === R2
  && fmScalar(await imageOf(INQ), "conclusion_claim") === CLAIM_R2);

const NPC = (await projOf(INQ)).no_project_conclusion;
ok("op=projection now publishes the no-project conclusion, and it AGREES BYTE FOR BYTE with op=basisversions",
  NPC !== null && JSON.stringify(NPC) === JSON.stringify((await bvOf(INQ)).no_project_conclusion),
  JSON.stringify(NPC));

await U.openInquiry(INQ);
const a1 = capture(page());
ok("THE CACHE WAS FORGOTTEN: after the conclusion landed, the page asked the record for this row AGAIN",
  projAsks(INQ) > ASK_BEFORE_COMMIT, `${ASK_BEFORE_COMMIT} -> ${projAsks(INQ)}`);
ok("THE QUESTION'S PAGE SHOWS THE NO-PROJECT CONCLUSION, through the same helper the stance surface uses",
  /data-npc\b/.test(a1) && /What this question concluded/.test(a1), a1.slice(0, 600));
/* LIAR (1): each of the three reads below is taken from `op=projection`'s OWN
   answer, fetched independently above, not from what this suite sent. A page
   drawing its own memory of the act would fail `relationship_detail` first —
   nothing in this session ever held that sentence. */
const CLAIMED = /data-npc-claim="adopted">([^<]*)</.exec(a1);
ok("THE CLAIM IS THE RECORD'S, verbatim, and marked ADOPTED — the claim of the reading the conclusion named",
  !!CLAIMED && unent(CLAIMED[1]) === NPC.claim.text && NPC.claim.text === CLAIM_R2 && NPC.claim.version === R2,
  CLAIMED ? CLAIMED[1] : "<no adopted claim>");
ok("THE RELATIONSHIP SENTENCE IS THE PLANE'S OWN — this page never held that string and could not have written it",
  a1.includes(U.esc(NPC.relationship_detail)) && NPC.relationship_detail.length > 40);
ok("the member's own conclusion text is rendered UNDER ITS OWN LABEL, beside the claim and never as it",
  a1.includes(U.esc(CONCLUSION_TEXT))
  && !new RegExp(`data-npc-claim="[^"]*">\\s*${U.esc(CONCLUSION_TEXT).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(a1));
ok("and what would falsify it, as the record holds it", a1.includes(U.esc(FALSIFIER_TEXT)));
ok("THE OTHER QUESTION IS UNTOUCHED: a page for a question nobody concluded still draws nothing",
  (await U.openInquiry(INQ_OPEN), !/data-npc\b/.test(page())));

/* ============================================================
   4. REC-142's DELEGATION — no dialog is offered that the plane refuses
   ============================================================ */
console.log("\n--- 4. the act the plane publishes on a concluded question is ROUTED, never opened into a refusal ---");

/* THE REFUSAL IS REAL, DRIVEN AT THE PLANE — this arm is about a refusal that
   exists, not one the suite imagined. */
const REFUSED = rP(await GET(`op=conclude&token=${PILAR}&target=${INQ}&version=${enc(R1)}`
  + `&conclusion=${enc("anything")}&falsifier=${enc("anything")}`));
ok("THE PLANE REALLY REFUSES a no-project conclusion on a question already concluded with no project",
  REFUSED.ok === false && REFUSED.reason === "ILLEGAL_TRANSITION", JSON.stringify(REFUSED).slice(0, 300));
/* AND THE ACT IS REALLY PUBLISHED THERE (REC-142 / IC-159) — so the page is not
   routing an act nobody was offered. */
const AFF = rP(await GET(`op=affordances&token=${PILAR}&target=${INQ}`));
ok("AND op=affordances REALLY PUBLISHES `conclude` on that question for this member (REC-142's PROJECT arm)",
  AFF.ok !== false && (AFF.acts || []).some((a) => a.id === "conclude"),
  JSON.stringify((AFF.acts || []).map((a) => a.id)));

await U.openInquiry(INQ);
const r0 = capture(page());
ok("NO CONTROL ON THE PAGE OPENS THE NO-PROJECT DIALOG for that act — the member is offered no door into that refusal",
  !actButtons(r0).includes("conclude"), JSON.stringify(actButtons(r0)));
/* LIAR (4): the two arms below are what stop "drop the act" from passing. */
ok("AND THE ACT IS NOT DROPPED: it is named to the member under the PLANE'S OWN LABEL",
  /data-act-routed="conclude"/.test(r0)
  && r0.includes(`<b>${U.esc((AFF.acts.find((a) => a.id === "conclude") || {}).label || "\u0000")}</b>`),
  r0.slice(r0.indexOf("data-act-routed"), r0.indexOf("data-act-routed") + 500));
ok("AND IT IS ROUTED SOMEWHERE THAT WORKS: the project the record's reverse index names carries a control to its own view of this question",
  new RegExp(`onclick="stanceOpen\\(&quot;${PROJ}&quot;,&quot;${INQ}&quot;\\)"`).test(r0),
  r0.slice(r0.indexOf("data-act-routed"), r0.indexOf("data-act-routed") + 900));
/* OVER-STRICTNESS, the direction WORKER.md requires: the fix must not be "never
   offer conclude". On a question the record has NOT concluded, the same member,
   the same page and the same act still gets the working dialog. */
await U.openInquiry(INQ_OPEN);
const r1 = capture(page());
ok("OVER-STRICTNESS: on a question the record has NOT concluded, the same member IS still offered the working dialog",
  actButtons(r1).includes("conclude") && !/data-act-routed="conclude"/.test(r1),
  JSON.stringify(actButtons(r1)));

/* THE ROUTED CONTROL IS DRIVEN, not merely matched: it opens the project's own
   view of this question, which is where the act is taken. */
const routedM = /<div class="linkrow" onclick="(stanceOpen\([^"]*\))"/.exec(
  r0.slice(r0.indexOf(`data-act-routed="conclude"`)));
ok("the routed control is a real address, and driving it opens the project's own view of this question", !!routedM);
/* THE ELSE BRANCH IS NOT DEFENSIVENESS — A CONTROL PUT IT THERE. Written as a
   bare `if (routedM) { … }`, arms B and D of this suite's control SKIPPED the
   assertion below instead of failing it, and the arm's tally read 48 where every
   other arm read 49. A missing finding must FAIL, not quietly shrink the count
   (WORKER.md, and `bound-sweep` ARM G records the same shape one estate over). */
if (routedM) {
  await runAttr(routedM[1]);
  const st = capture(page());
  ok("AND THE PROJECT'S ACT IS CARRIED THERE, under the plane's own label — the door the routing named is open",
    /data-stance-conclude/.test(st) && /id="sx-conclude"/.test(st), st.slice(0, 500));
} else {
  ok("AND THE PROJECT'S ACT IS CARRIED THERE, under the plane's own label — the door the routing named is open",
    false, "no routed control was rendered, so there was nothing to drive");
}

/* ============================================================
   5. THE WITHDRAWAL — the page asks again instead of remembering
   ============================================================ */
console.log("\n--- 5. a project concludes and withdraws; the question's page re-reads rather than remembers ---");

/* WHAT THE PLANE CANNOT DO, MEASURED RATHER THAN QUOTED. §7.1's DESIGN GAP (b)
   says a no-project conclusion cannot be withdrawn by any act. If that ever
   becomes false this arm turns red and this suite's section 5 needs rewriting —
   which is the point of measuring it instead of citing it. */
const WD_NOPROJ = rP(await GET(`op=withdrawconclusion&token=${PILAR}&target=${INQ}&reason=${enc("a reason")}`));
ok("MEASURED, NOT QUOTED: the plane refuses to withdraw a conclusion drawn with NO project, and names op=reopen's door",
  WD_NOPROJ.ok === false && WD_NOPROJ.reason === "NOT_A_PROJECT" && /op=reopen/.test(WD_NOPROJ.detail || ""),
  JSON.stringify(WD_NOPROJ).slice(0, 300));
/* THIS ARM PINS THE PLANE'S STRUCTURED ANSWER AND NOT ITS REFUSAL CODE, AND THE
   REASON IS A MEASURED PROPERTY OF AN INSTRUMENT RATHER THAN A SOFTENING.
   `civicos-ui/check-refusal-codes.mjs` ARM B rule R3 counts EVERY plane-minted
   SCREAMING_SNAKE literal in `civicos-ui/test/*.test.mjs` as a code a SURFACE can
   receive — its words: "a code the harness hands the surface is a code the surface
   receives". That is true of a MOCK-driven suite, which is every other suite in
   this directory. It is false of this one, which drives the real plane and QUOTES
   a refusal back. Writing `reopen`'s code here as a literal would have told that
   guard a member can meet it, which is not so — `app.html` has no `ACT_FLOW` entry
   for `reopen`, so the page renders no control for it and the act is NAMED with no
   door — and it pushed that guard's gap from 40 to 41 against a ratchet that may
   only FALL (measured: it was the one code of the 41 that was new).
   SO THE ASSERTION WAS MADE STRONGER RATHER THAN QUIETER. `reopenable` is the
   plane's OWN published list of the states it reopens from, exported from
   `affordances.mjs` and carried on this refusal; asserting `concluded` is not in it
   pins the RULE rather than the name of the sentence that states the rule. If
   reopening ever reaches a concluded question, this goes red.
   THE INSTRUMENT DEFECT IS REPORTED, NOT WORKED AROUND — see UI-67's report and the
   DELEGATION raised with it: R3 cannot tell a mock that HANDS a code to the surface
   from a suite that OBSERVES one, so every future real-plane suite that measures a
   plane refusal inflates that reach. Its fix is named there. */
const RO = rP(await GET(`op=reopen&token=${PILAR}&target=${INQ}&reason=${enc("a reason")}`));
ok("MEASURED, NOT QUOTED: and op=reopen refuses a concluded question that is in no case (REC-31's rule), so nothing can clear it today",
  RO.ok === false && RO.from === "concluded"
  && Array.isArray(RO.reopenable) && RO.reopenable.length > 0 && !RO.reopenable.includes("concluded"),
  JSON.stringify(RO).slice(0, 300));

await U.stanceOpen(PROJ, INQ);
const s0 = capture(page());
ok("the project's view of the question opened, and the project has concluded nothing",
  /What this project concluded/.test(s0) && /data-conc-stance="none"/.test(s0));
await clickText(s0, `Stand this project on ${R1}`);
U.stanceCxField("falsifier", "A council minute showing no vote was taken.");
await clickId(page(), "sx-conclude");
ok("THE PROJECT CONCLUDED FOR ITSELF, and the record holds its entry",
  ((await bvOf(INQ, PROJ)).conclusion_history || []).length === 1
  && (await bvOf(INQ, PROJ)).conclusion_stance === "concluded",
  JSON.stringify((await bvOf(INQ, PROJ)).conclusion_history));

await U.openInquiry(INQ);
const ASK_AFTER_PROJ_CONCLUDE = projAsks(INQ);
await U.openInquiry(INQ);
ok("INSTRUMENT: the cache refilled — a second open with no act between asks op=projection no second time",
  projAsks(INQ) === ASK_AFTER_PROJ_CONCLUDE, `${ASK_AFTER_PROJ_CONCLUDE} -> ${projAsks(INQ)}`);

await U.stanceOpen(PROJ, INQ);
U.stanceWdField("The audit reading changed what the paper trail shows.");
await clickId(page(), "sx-withdraw");
const WD = lastOf("withdrawconclusion");
ok("THE WITHDRAWAL LANDED, naming the project, the question and the member's reason",
  !!WD && WD.params.project === PROJ && WD.params.target === INQ
  && (await bvOf(INQ, PROJ)).conclusion_stance === "withdrawn",
  JSON.stringify(WD && WD.params));

const ASK_BEFORE_REREAD = projAsks(INQ);
await U.openInquiry(INQ);
const w1 = capture(page());
ok("THE CACHE WAS FORGOTTEN ON THE WITHDRAWAL TOO: the question's page asked the record for this row again",
  projAsks(INQ) > ASK_BEFORE_REREAD,
  `op=projection asks for ${INQ}: ${ASK_BEFORE_REREAD} -> ${projAsks(INQ)} — the page answered from its own `
  + "memory of a record that had just been written to");
/* AND IT RENDERS WHAT CAME BACK, against the plane's own answer taken now. This
   is what stops "delete the entry and draw nothing" from passing the arm above.
   NOTE, and it is the honest half: the no-project conclusion is UNCHANGED by a
   project's withdrawal (§7.1 item 1 — `inquiry_moved: false`), so this asserts
   the page is showing the record as it stands, NOT that anything disappeared.
   Asserting a disappearance would be asserting a plane that does not exist. */
const NPC_NOW = (await projOf(INQ)).no_project_conclusion;
const CLAIMED2 = /data-npc-claim="adopted">([^<]*)</.exec(w1);
ok("AND IT RENDERS WHAT CAME BACK — the claim, the relationship sentence and the falsifier are the plane's answer as it stands NOW",
  !!CLAIMED2 && unent(CLAIMED2[1]) === NPC_NOW.claim.text
  && w1.includes(U.esc(NPC_NOW.relationship_detail)) && w1.includes(U.esc(NPC_NOW.falsifier)),
  CLAIMED2 ? CLAIMED2[1] : "<no adopted claim after the withdrawal>");

/* ============================================================
   6. UNDETERMINED IS STATED AND NEVER FILLED IN
   ============================================================ */
console.log("\n--- 6. a legacy conclusion on the question's page: the claim is UNDETERMINED, and stated ---");

const NPCL = (await projOf(INQ_LEGACY)).no_project_conclusion;
ok("the plane reads the legacy conclusion's claim as UNDETERMINED, with a sentence of its own",
  NPCL && NPCL.claim && NPCL.claim.state === "undetermined" && typeof NPCL.claim.detail === "string"
  && NPCL.claim.detail.length > 20, JSON.stringify(NPCL && NPCL.claim));
await U.openInquiry(INQ_LEGACY);
const l1 = capture(page());
ok("THE QUESTION'S PAGE STATES IT UNDETERMINED — the primitive, carrying the plane's own basis sentence",
  /data-npc-claim="undetermined"/.test(l1) && /class="card undet"/.test(l1)
  && l1.includes(U.esc(NPCL.claim.detail)), l1.slice(0, 400));
/* LIAR (3): the conclusion text sits one line away in the same object. A page
   that reached for it would read as an adopted claim and would be an overclaim
   in exactly the direction §7.1 item 6 refuses. */
ok("AND NEVER FILLS IT IN: the conclusion text is rendered under its own label and NEVER in the claim slot",
  l1.includes(U.esc(LEGACY_TEXT)) && !/data-npc-claim="adopted"/.test(l1)
  && !new RegExp(`data-npc-claim="[^"]*">\\s*${U.esc(LEGACY_TEXT).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(l1));

/* ============================================================
   7. THE CLASS SWEEP — every site that lands a conclusion or a withdrawal
   ============================================================ */
console.log("\n--- 7. the class: every conclusion/withdrawal site in app.html, walked rather than listed ---");

const SRC = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
/* Comments are stripped first: this file DESCRIBES its own act sites at length,
   and a walk that counted prose would report sites that are not code. */
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const FNS = [...CODE.matchAll(/(?:^|\n)(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g)]
  .map((m) => ({ name: m[1], at: m.index + m[0].length - 1 }))
  .map((f) => {
    let depth = 0;
    for (let j = f.at; j < CODE.length; j++) {
      if (CODE[j] === "{") depth++;
      else if (CODE[j] === "}") { depth--; if (depth === 0) return { ...f, body: CODE.slice(f.at + 1, j) }; }
    }
    return { ...f, body: "" };
  });
const ACT_SITES = FNS.filter((f) => /actAsk\(\s*"(?:conclude|withdrawconclusion)"/.test(f.body))
  .map((f) => f.name).sort();
/* WHAT THIS WALK CAN AND CANNOT SEE, stated because a matcher trusted past its
   reach is this project's most-paid-for defect. IT CAN see a named top-level
   `function` whose body contains `actAsk("conclude"…)` or
   `actAsk("withdrawconclusion"…)`. IT CANNOT see an act reaching the plane by
   any other transport — `refusal-codes`' ARM A already pins that `rec`/`recPost`/
   `api` are declared in nine named places and nowhere else — and it CANNOT see a
   site inside an arrow function assigned to a const. Both holes would show up as
   a MISSING site here rather than as a silent pass, because the set is compared
   whole. */
console.log(`     CLASS CORPUS: ${FNS.length} named functions in app.html · conclusion/withdrawal sites: ${ACT_SITES.join(", ")}`);
ok("THE WALK REACHES A REAL CORPUS (a sweep over an empty one proves nothing)", FNS.length >= 400, `${FNS.length}`);
ok("THE CLASS IS EXACTLY FOUR SITES, and the walk names them rather than counting to a number this file supplied",
  ACT_SITES.join(" ") === "concludePreflight doConclude stanceConclude stanceWithdraw",
  ACT_SITES.join(" "));
const forgets = (name) => {
  const b = (FNS.find((f) => f.name === name) || {}).body || "";
  /* EITHER SPELLING COUNTS. The rule is that the cached projection is forgotten,
     not that one helper's name appears: a fence tighter than its rule is not a
     safer fence, and five older sites in this file spell the same two deletes
     inline. */
  return /projForget\s*\(/.test(b) || /PROJ_CACHE\.delete\s*\(/.test(b);
};
ok("EVERY SITE THAT WRITES forgets the cached projection — doConclude, stanceConclude and stanceWithdraw",
  forgets("doConclude") && forgets("stanceConclude") && forgets("stanceWithdraw"),
  `doConclude ${forgets("doConclude")} · stanceConclude ${forgets("stanceConclude")} · stanceWithdraw ${forgets("stanceWithdraw")}`);
ok("AND THE PRE-FLIGHT DOES NOT — it withholds its target and writes nothing, so forgetting there would make the cache a worse witness",
  !forgets("concludePreflight"));

/* ============================================================
   8. DEC-8 — every refusal sentence the member read came off the wire
   ============================================================ */
console.log("\n--- 8. DEC-8: every refusal sentence rendered was the plane's own ---");
const FOREIGN = RENDERED.filter((r) => !SAID.has(unent(r)) && r !== "The record refused this and said nothing further.");
ok("the suite rendered refusals at all (a sweep over nothing proves nothing)", RENDERED.length >= 1, `${RENDERED.length}`);
ok("NOT ONE refusal sentence rendered originated in the surface", FOREIGN.length === 0, JSON.stringify(FOREIGN.slice(0, 3)));

/* NEGATIVE CONTROL: `node civicos-ui/test/question-npc.control.mjs` — RUN
 * 2026-09-19 (UI-67), SIX ARMS, each ALONE, every one AS DECLARED, exit 0.
 * app.html returned to
 * a6c5181aca8c951eb7ab7930050f66c0c62ac0f41d84434e8374763275b773b7 (1403728
 * bytes) after every arm, verified by sha256 AND `cmp`. WHOLE: 49 pass, 0 fail.
 *   BASELINE (no mutation) -> 49/0.
 *   (A) stanceWithdraw stops forgetting the cached projection -> 47/2: the
 *       withdrawal re-read arm fails BY NAME, the class sweep fails with it, and
 *       the conclusion arm STAYS GREEN — the two invalidations are independent.
 *   (B) doConclude stops forgetting -> 37/12: the conclusion re-read arm and
 *       every arm reading the block a stale page cannot draw. The withdrawal
 *       WIRE arm survives, which is the discrimination.
 *   (C) the render is stubbed out -> 41/8: every RENDER arm fails and BOTH WIRE
 *       arms stay green. That split is the measurement saying the wire arms
 *       alone are not a criterion.
 *   (D) the no-project dialog is offered again -> 44/5: REC-142's arm and the
 *       two that prove the act was not merely dropped; the OVER-STRICTNESS arm
 *       stays green.
 *   (E) OVER-STRICTNESS — the withdrawal forgets by the INLINE spelling instead
 *       of through `projForget` -> 49/0. Correct work in a spelling this suite
 *       did not author still passes.
 * A FINDING ABOUT THE INSTRUMENT, recorded rather than smoothed: arms B and D
 * first returned a tally of 48 where every other arm read 49, because the
 * "the project's act is carried there" assertion sat inside a bare `if` and was
 * SKIPPED rather than failed. The else branch above is that fix. */
console.log(`\nquestion-npc: ${pass} pass, ${fail} fail`);
await mf.dispose();
if (fail) process.exitCode = 1;
