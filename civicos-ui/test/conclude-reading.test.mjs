/* UI-65 — THE CONCLUDE SURFACE AFTER REC-136: A CONCLUSION ADOPTS THE CLAIM OF
 * A READING THE MEMBER PICKED, A PROJECT CONCLUDES FOR ITSELF, AND A PROJECT'S
 * WITHDRAWAL APPENDS.
 *
 * INVESTIGATIVE-SESSION.md §7.1 items 1-8 (BOB #15, 2026-09-18), built in the
 * plane by REC-124 (IC-150) and REC-136 (IC-153). Until this item the surface
 * sent no `version=` on a no-project conclude, so on any plane carrying IC-153
 * every conclude a member committed was refused NO_CLAIM; it sent no
 * `project=` at all; nothing reached `op=withdrawconclusion`; and nothing
 * rendered a project's conclusion history or a legacy conclusion's
 * undetermined claim.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 * STATED FIRST, because the assertions are cut against it, and it is the one
 * the row names: A SURFACE THAT PRE-PICKS A READING. It commits, the plane
 * accepts, the document carries a claim adopted word for word — and the member
 * never chose it. That is the plane-chooses-the-answer shape REC-136 refused
 * ("a default reading is the plane choosing the answer"), arriving one layer up
 * through the convenience of a form. So section 1 asserts, over the RENDERED
 * markup and over the WIRE, that nothing is picked until the member picks:
 * no radio `checked`, no claim in the adoption slot, no `version` on any
 * request — and the fixture offers exactly the case a liar would reach for,
 * where a single reading could be "obviously" meant.
 *
 * The second cheap green is a history that shows only the STANCE. It passes
 * "the project stands on no conclusion after withdrawing" while erasing the
 * record DEC-19 keeps; so section 5 reads the WHOLE rendered history and the
 * WHOLE plane history, entry by entry, in order.
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * The criterion is what the plane ADOPTS and what the RECORD then carries. A
 * mock answering hand-written envelopes would be this suite agreeing with
 * itself. So the plane is `bio-plane/src/index.mjs` under miniflare, members
 * are enrolled through the real ops, and every adoption is read BACK from the
 * record (`op=image`'s frontmatter, `op=basisversions`' history) — never from
 * the op's own answer alone.
 *
 * DEC-8: every refusal the member reads is the plane's sentence. Section 6
 * sweeps every `intent-ref-why` this suite rendered against the set of
 * `detail` strings the plane actually returned over the wire.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/conclude-reading.control.mjs` — FIVE
 * arms, each ALONE, each restored from its own pristine copy and verified by
 * sha256 AND cmp; app.html returned to
 * 2eac184ced857bf7066d6872b67a0db494f63a741d02122a2c8e8e6435f44bf1 (1391078
 * bytes) after every one. RUN 2026-09-18 (UI-65). WHOLE: 65 pass, 0 fail.
 *   (A) SEND NO VERSION -> 56/9: the commit is refused and "NO NO_CLAIM WAS
 *       RENDERED" fails by name, while the DEC-8 sweep HOLDS — so what the
 *       member read in place of the receipt was the plane's own sentence.
 *   (B) PREFILL THE PICKER -> 61/4: the three NOTHING-IS-PREFILLED arms and
 *       the "picks nothing either" arm, with the adoption itself still right.
 *   (C) HISTORY IS ONLY THE STANCE -> 63/2, the plane's history arms green.
 *   (D) PROJECT CLAIM NOT SHOWN -> 63/2.
 *   (E) LEGACY CLAIM FILLED IN -> 63/2.
 * The first run of (A) was scored on an assertion that failed on the receipt
 * heading alone, so "the member saw NO_CLAIM" was inferred rather than
 * measured; the NO_CLAIM check was split out and the arm re-run.
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
  console.error("conclude-reading: the real plane could not be started — miniflare is not installed.");
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
  bindings: { ADMIN_TOKEN: "adm-ui65", MEMBER_TOKEN: "mem-ui65", PROBE_TOKEN: "prb-ui65", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const enc = encodeURIComponent;

/* ============================================================
   0. THE GROUND
   ============================================================ */
console.log("\n--- 0. the ground: a real plane, real members, questions with real readings ---");

const enrol = async (memberId, password, role, capabilities = ["contribute"]) => {
  const add = rP(await POST("op=memberadd&token=adm-ui65",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* The first two invitations create administrators (Membership 4.2), so the
   ordinary member who concludes here is the third, carrying `contribute`. */
await enrol("nadia", "nadia-passphrase-1", "admin");
await enrol("omar", "omar-passphrase-1", "admin");
/* `create_projects` so she can CREATE the project she concludes in (below);
   concluding itself needs `contribute` alone. */
const PILAR = await enrol("pilar", "pilar-passphrase-1", "member", ["contribute", "create_projects"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const DOC = "INFO-2026-6500-ledger", DOC2 = "INFO-2026-6500-minutes";
const INQ_PICK = "INQ-2026-6500-pick";        /* two adoptable readings, two that are not */
const INQ_NONE = "INQ-2026-6500-none";        /* no reading at all */
const INQ_LEGACY = "INQ-2026-6500-legacy";    /* concluded in its bytes before item 6 */
const INQ_PROJ = "INQ-2026-6500-shared";      /* the project's question */
/* PROJ, the project, is MINTED by the plane at its creation below (REC-141). */

/* THE CLAIMS ARE DISTINCT, NON-EMPTY AND LONG ENOUGH that "word for word" is a
   comparison that could fail. */
const CLAIM_R1 = "The ledger shows the transfer was booked before the council met.";
const CLAIM_R2 = "The minutes show the council approved the transfer after it was booked.";
const CLAIM_SUG = "A claim nobody has accepted, which must never be offered.";
const CLAIM_A = "The transfer followed the process the council adopted in 2024.";
const CLAIM_B = "The transfer bypassed the council vote the adopted process requires.";
const R1 = "booked early", R2 = "approved after", RSUG = "only suggested", RNOCLAIM = "unclaimed";
const RA = "paper trail", RB = "the audit";

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
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
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
/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7); its
   creation bytes carry no `id:` line (C-59.2) and the promote names no bundleId (C-59.1). `id` null = creation. */
const projectMd = (id) => ["---",
  ...(id === null ? [] : [`id: ${id}`]), "object_type: project", `title: "Oversight"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "references:", `  - target: ${INQ_PROJ}`, "    rel: cites", "    status: confirmed",
  "required_strength:", "  capture: B", "  connection: C",
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");

let seq = 0;
const promote = async (id, md, type, state, token = "mem-ui65") => {
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
await promote(INQ_PICK, inquiryMd(INQ_PICK, "When was the transfer booked, and was it approved?", { versions: [
  V(R1, CLAIM_R1, "accepted", [DOC]), V(R2, CLAIM_R2, "accepted", [DOC2]),
  V(RSUG, CLAIM_SUG, "suggested", [DOC]), V(RNOCLAIM, null, "accepted", [DOC]) ] }), "inquiry", "open");
await promote(INQ_NONE, inquiryMd(INQ_NONE, "Did anybody object to the transfer in writing?"), "inquiry", "open");
const LEGACY_TEXT = "The transfer was authorised, as the old act recorded it.";
await promote(INQ_LEGACY, inquiryMd(INQ_LEGACY, "Was the old transfer authorised?", {
  versions: [V("old reading", "An old claim stated after the fact.", "accepted")],
  legacy: { conclusion: LEGACY_TEXT, falsifier: "a rescinding minute" } }), "inquiry", "concluded");
await promote(INQ_PROJ, inquiryMd(INQ_PROJ, "Did the sewer fund transfer follow the adopted process?", { versions: [
  V(RA, CLAIM_A, "accepted", [DOC, DOC2]), V(RB, CLAIM_B, "accepted", [DOC2]) ] }), "inquiry", "open");
/* THE PROJECT IS CREATED BY THE CONCLUDING MEMBER, so she is its owner and a
   JOINED participant (Membership 7.1) — REC-134's positional check is met by
   the record, not bypassed by the fixture. */
const PROJ = (await promote(null, projectMd(null), "project", "forming", PILAR)).bundleId;
if (typeof PROJ !== "string") throw new Error("promote project: the plane returned no minted id");

const bvOf = async (id, project) => rP(await GET(`op=basisversions&token=${PILAR}&id=${enc(id)}&limit=50`
  + (project ? `&project=${enc(project)}` : "")));
const BV0 = await bvOf(INQ_PICK);
ok("the fixture is real: the plane holds all four readings of the question, in the states authored",
  Array.isArray(BV0.versions) && BV0.versions.length === 4
  && BV0.versions.filter((v) => v.state === "accepted").length === 3,
  JSON.stringify((BV0.versions || []).map((v) => [v.name, v.state, v.claim, v.leg_count])));
const imageOf = async (id) => rP(await GET(`op=image&token=${PILAR}&id=${id}`))["bundle.md"];
const fmScalar = (text, key) => {
  const m = new RegExp(`^${key}:[ \\t]*(.*)$`, "m").exec(String(text).split("\n---")[0] || text);
  return m ? m[1].trim().replace(/^"|"$/g, "") : null;
};

/* ============================================================
   THE SURFACE, LOADED, ITS FETCH BRIDGED TO THAT PLANE — AND NOTHING ADDED
   ON THE WAY: every request reaches the plane exactly as the surface wrote it.
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
  /* CORRECTED 2026-09-19 (UI-72), never exempted. The sweep below asks whether a
     sentence the member read CAME OVER THE WIRE; a canned `translation` (DEC-49)
     arrives on the same answer, from the plane's own check row, and belongs in the
     corpus for the same reason `detail` does. The omission was invisible while no
     surface rendered one — the moment `actRefusalHtml` preferred the translation,
     this sweep called the PLANE'S own sentence foreign. A sentence app.html
     composes is still in neither field, so the arm still bites. */
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
  "PLANE", "esc", "openConclude", "concludeAuthor", "doConclude",
  "stanceOpen", "stanceCxField", "stanceWdField",
].join(",") + ", CONCL: () => CONCL, STANCE: () => STANCE };", ctx);
const U = ctx.__U;
U.PLANE.token = PILAR;
U.PLANE.session = true;
U.PLANE.me = { member: "pilar", handle: "pilar", session: true, administer: false, capabilities: ["contribute"] };

const ACT = { id: "conclude", label: "Conclude", weight: "single", needs: "contribute",
              mode: "session", rung: null, prompt: null };
const dlg = () => $$("#dlg")._html;
const page = () => $$("#content")._html;
const RENDERED = [];
const capture = (h) => { for (const m of h.matchAll(/<div class="intent-ref-why">([^<]*)<\/div>/g)) RENDERED.push(m[1]); return h; };
const unent = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const wireFor = (op) => WIRE.filter((w) => w.op === op);
const lastOf = (op) => wireFor(op).slice(-1)[0];

/* DRIVEN THROUGH THE SURFACE: every act below is taken by pulling the handler
   OUT OF THE RENDERED MARKUP and running it in the page's scope, entity-decoded
   the way a browser decodes an attribute. A control that is not rendered cannot
   be used, and the suite fails by name rather than calling the handler. */
function runAttr(src){ return vm.runInContext(unent(src), ctx); }
function pickRendered(html, name){
  const at = html.indexOf(`data-cx-reading="${U.esc(name)}"`);
  const m = at === -1 ? null : /<input type="radio"[^>]*onchange="([^"]*)"/.exec(html.slice(at));
  ok(`the surface RENDERED the reading '${name}' as a choice for the member`, !!m);
  return m ? runAttr(m[1]) : undefined;
}
function clickId(html, id){
  const m = new RegExp(`<button[^>]*id="${id}"[^>]*onclick="([^"]*)"`).exec(html);
  ok(`the surface RENDERED a control with id="${id}" for the member to use`, !!m);
  return m ? runAttr(m[1]) : undefined;
}
function clickText(html, text){
  const m = new RegExp(`<button[^>]*onclick="([^"]*)"[^>]*>${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</button>`).exec(html);
  ok(`the surface RENDERED a control reading "${text}"`, !!m);
  return m ? runAttr(m[1]) : undefined;
}
const radiosIn = (h) => [...h.matchAll(/<input type="radio" name="cx-reading"([^>]*)>/g)].map((m) => m[1]);
const offered = (h) => [...h.matchAll(/data-cx-reading="([^"]*)"/g)].map((m) => unent(m[1]));

/* ============================================================
   1. THE PICKER: WHAT IS OFFERED, AND NOTHING PICKED FOR THE MEMBER
   ============================================================ */
console.log("\n--- 1. the reading picker: the plane's adoptable readings, none picked ---");

const wire1 = WIRE.length;
await U.openConclude(INQ_PICK, "When was the transfer booked, and was it approved?", ACT);
const p0 = capture(dlg());
ok("the dialog opened and asked the plane for the question's readings (op=basisversions, no project)",
  /<h2>Conclude<\/h2>/.test(p0) && WIRE.slice(wire1).some((w) => w.op === "basisversions" && !w.params.project));
ok("EXACTLY the adoptable readings are offered — accepted, stating a claim, resting on something — and in the plane's order",
  JSON.stringify(offered(p0)) === JSON.stringify([R1, R2]), JSON.stringify(offered(p0)));
ok("a SUGGESTED reading is never offered, and neither is its claim",
  !offered(p0).includes(RSUG) && !p0.includes(U.esc(CLAIM_SUG)));
ok("an accepted reading that states NO claim is never offered — the plane would refuse it NO_CLAIM",
  !offered(p0).includes(RNOCLAIM));
ok("each offered reading shows its own claim, verbatim, so the member picks knowing what each says",
  p0.includes(U.esc(CLAIM_R1)) && p0.includes(U.esc(CLAIM_R2)));
/* THE LIAR'S ARM, over the markup, the state and the wire. */
ok("NOTHING IS PREFILLED: no reading radio is checked when the dialog opens",
  radiosIn(p0).length === 2 && radiosIn(p0).every((a) => !/checked/.test(a)),
  JSON.stringify(radiosIn(p0)));
ok("NOTHING IS PREFILLED: the adoption slot says no reading is picked, and shows no claim as adopted",
  /data-cx-claim="none"/.test(p0) && !/data-cx-claim-text/.test(p0));
ok("NOTHING IS PREFILLED: no request the surface sent before the member picked carried a version",
  WIRE.slice(wire1).filter((w) => w.op === "conclude").every((w) => !("version" in w.params))
  && U.CONCL().version === "");

await U.concludeAuthor("conclusion", "The transfer was booked first and approved afterwards.");
await U.concludeAuthor("falsifier", "A council minute approving the transfer before the booking date.");
const p1 = capture(dlg());
ok("authoring the conclusion and falsifier picks nothing either", radiosIn(p1).every((a) => !/checked/.test(a))
  && WIRE.slice(wire1).filter((w) => w.op === "conclude").every((w) => !("version" in w.params)));

pickRendered(p1, R2);
const p2 = capture(dlg());
ok("THE MEMBER PICKED: the reading they chose is the one checked, and only that one",
  radiosIn(p2).filter((a) => /checked/.test(a)).length === 1
  && /data-cx-reading="approved after"[^>]*>\s*<input type="radio" name="cx-reading" checked/.test(p2));
const SHOWN = /<div class="pub-excl" data-cx-claim-text>([^<]*)<\/div>/.exec(p2);
ok("THE CLAIM IS SHOWN BEFORE THE COMMIT, word for word — the picked reading's, not another's",
  /data-cx-claim="shown"/.test(p2) && !!SHOWN && unent(SHOWN[1]) === CLAIM_R2,
  SHOWN ? SHOWN[1] : "<no adoption slot>");
ok("and the commit is present, because the plane has nothing left to refuse before the target", /id="cx-go"/.test(p2));

await U.doConclude();
const r1 = capture(dlg());
const C1 = lastOf("conclude");
/* THE ARM THE BRIEF NAMES FIRST lands here: were the picked reading not sent,
   this is where the plane's NO_CLAIM would be rendered, in its own words (the
   DEC-8 sweep in section 6 is what proves the words are the plane's). */
ok("THE COMMIT WAS ACCEPTED — the record's receipt stands where a refusal would",
  /<h2>Concluded<\/h2>/.test(r1), (/<div class="intent-ref-why">([^<]*)<\/div>/.exec(r1) || ["", "<no refusal>"])[1]);
ok("NO NO_CLAIM WAS RENDERED — had the picked reading not been sent, the plane's NO_CLAIM sentence would stand here",
  !/intent-ref-code mono">NO_CLAIM</.test(r1));
ok("the commit named the PICKED reading on the wire, and the target with it",
  C1.params.target === INQ_PICK && C1.params.version === R2, JSON.stringify(C1.params));
ok("the surface shows the record's receipt, and the claim in it is read off the plane's answer",
  /<h2>Concluded<\/h2>/.test(r1) && /data-cx-receipt-claim/.test(r1) && r1.includes(U.esc(CLAIM_R2)),
  r1.slice(0, 800));
const PICKDOC = await imageOf(INQ_PICK);
ok("THE RECORD ADOPTED THE PICKED READING — its own bytes name it (read back, never the op's answer)",
  fmScalar(PICKDOC, "current_state") === "concluded" && fmScalar(PICKDOC, "conclusion_version") === R2,
  `state ${fmScalar(PICKDOC, "current_state")}, version ${fmScalar(PICKDOC, "conclusion_version")}`);
ok("THE CONCLUSION ADOPTS THE PICKED READING'S CLAIM WORD FOR WORD — in the record's own bytes",
  fmScalar(PICKDOC, "conclusion_claim") === CLAIM_R2, `got ${JSON.stringify(fmScalar(PICKDOC, "conclusion_claim"))}`);
const NPC1 = (await bvOf(INQ_PICK)).no_project_conclusion;
ok("and the plane's own read agrees: the no-project conclusion's claim is ADOPTED and is that claim",
  NPC1 && NPC1.claim && NPC1.claim.state === "adopted" && NPC1.claim.text === CLAIM_R2 && NPC1.claim.version === R2,
  JSON.stringify(NPC1 && NPC1.claim));

/* ============================================================
   2. NOTHING TO PICK — THE PLANE'S NO_CLAIM, IN ITS OWN WORDS
   ============================================================ */
console.log("\n--- 2. a question with no adoptable reading: the plane's own sentence ---");

/* THE PLANE'S SENTENCE, FETCHED FROM THE PLANE and never written here. The ask
   names a target and no reading, which the plane refuses before writing. */
const PLANE_NO_CLAIM = rP(await GET(`op=conclude&token=${PILAR}&target=${INQ_NONE}`
  + `&conclusion=${enc("anything")}&falsifier=${enc("anything")}`));
ok("the plane refuses a no-project conclusion that names no reading, by name",
  PLANE_NO_CLAIM.ok === false && PLANE_NO_CLAIM.reason === "NO_CLAIM", JSON.stringify(PLANE_NO_CLAIM));
await U.openConclude(INQ_NONE, "Did anybody object to the transfer in writing?", ACT);
const n0 = capture(dlg());
ok("the surface says there is nothing to pick, and offers no reading", /data-cx-reading="none"/.test(n0)
  && radiosIn(n0).length === 0);
await U.concludeAuthor("conclusion", "Nobody objected in writing.");
await U.concludeAuthor("falsifier", "A written objection dated before the transfer.");
await U.doConclude();
const n1 = capture(dlg());
/* CORRECTED 2026-09-19 (UI-72), never exempted: pinned on the plane's canned
   `translation` rather than on its `detail`. Both are the plane's — the surface
   composes neither — but `detail` is written for a caller of the op and
   `translation` is the sentence DEC-49 authored for a member, which is what
   `actRefusalHtml` now renders on every act surface. The old assertion named the
   right rule and the wrong field. */
ok("THE MEMBER SEES NO_CLAIM RENDERED AS THE PLANE'S OWN SENTENCE — the door (name a reading) is the plane's, not this page's",
  /NO_CLAIM/.test(n1) && n1.includes(`<div class="intent-ref-why">${U.esc(PLANE_NO_CLAIM.translation)}</div>`),
  n1.slice(0, 900));
ok("the commit sent no version, because nothing was picked", !("version" in lastOf("conclude").params));
ok("and nothing was written: the question is still open", fmScalar(await imageOf(INQ_NONE), "current_state") === "open");

/* ============================================================
   3. A NO-PROJECT CONCLUSION, ADOPTED OR UNDETERMINED — read on the project's
   view of the question, the surface whose read of `op=basisversions` states the
   bound. (It is NOT on the question's page: bound-sweep ARM G refused that
   site, and app.html's `noProjectConclusionHtml` comment says why.)
   ============================================================ */
console.log("\n--- 3. a no-project conclusion: the claim adopted, or UNDETERMINED and stated ---");

await U.stanceOpen(PROJ, INQ_PICK);
const q1 = page();
const NPCBLOCK = /data-npc-claim="adopted">([^<]*)</.exec(q1);
ok("the page renders what the question concluded with no project, with its claim ADOPTED, verbatim",
  /Concluded with no project/.test(q1) && !!NPCBLOCK && unent(NPCBLOCK[1]) === CLAIM_R2, NPCBLOCK ? NPCBLOCK[1] : q1.slice(0, 400));
ok("and it says, in the plane's words, that no project drew it — it is never this project's conclusion",
  !!NPC1 && q1.includes(U.esc(NPC1.relationship_detail)) && /data-conc-stance="none"/.test(q1));
ok("and the bound the plane applied to that read is stated on the same page",
  /The record answered for this question with at most \d+ reading\(s\)/.test(q1));

const NPCL = (await bvOf(INQ_LEGACY)).no_project_conclusion;
ok("the plane reads the legacy conclusion's claim as UNDETERMINED, with its own sentence",
  NPCL && NPCL.claim && NPCL.claim.state === "undetermined" && typeof NPCL.claim.detail === "string",
  JSON.stringify(NPCL && NPCL.claim));
await U.stanceOpen(PROJ, INQ_LEGACY);
const q2 = page();
ok("THE LEGACY CLAIM IS RENDERED UNDETERMINED — the primitive, with the plane's basis sentence",
  /data-npc-claim="undetermined"/.test(q2) && /class="card undet"/.test(q2)
  && !!NPCL && q2.includes(U.esc(NPCL.claim.detail)));
ok("AND NEVER FILLED IN: the conclusion text is not rendered as the claim, and no adopted claim appears",
  !/data-npc-claim="adopted"/.test(q2) && q2.includes(U.esc(LEGACY_TEXT))
  && !new RegExp(`data-npc-claim="[^"]*">\\s*${U.esc(LEGACY_TEXT).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(q2));
await U.stanceOpen(PROJ, INQ_NONE);
ok("a question that concluded nothing says nothing about a no-project conclusion", !/Concluded with no project/.test(page()));

/* ============================================================
   4. THE PROJECT'S ACT — ON THE READING IT STANDS ON
   ============================================================ */
console.log("\n--- 4. a project concludes for itself, adopting the claim of the reading it stands on ---");

await U.stanceOpen(PROJ, INQ_PROJ);
const s0 = page();
ok("the project's view of the question renders its conclusion section, and the project has concluded nothing",
  /What this project concluded/.test(s0) && /data-conc-stance="none"/.test(s0));
ok("the project stands on no reading yet, so no claim is shown to adopt", /data-cx-claim="none"/.test(s0));
await clickText(s0, `Stand this project on ${RA}`);
const s1 = page();
ok("the member stood the project on a reading through the surface", /This project stands on/.test(s1)
  && lastOf("versioncurrent") && lastOf("versioncurrent").params.version === RA);
const SX = /<div class="pub-excl" data-cx-claim-text>([^<]*)<\/div>/.exec(s1);
ok("THE CLAIM IS SHOWN BEFORE THE COMMIT, word for word — the claim of the reading the project stands on",
  /data-cx-claim="shown"/.test(s1) && !!SX && unent(SX[1]) === CLAIM_A && !s1.includes(`data-cx-claim-text>${U.esc(CLAIM_B)}`),
  SX ? SX[1] : "<no claim slot>");
ok("the commentary field is labelled the member's own words and never evidence",
  /data-cx-commentary-label>[^<]*never evidence/.test(s1));
ok("NOTHING IS PREFILLED: the drafts are empty when the section first renders",
  U.STANCE().cx.falsifier === "" && U.STANCE().cx.commentary === "");

const COMMENT = "The auditors were not asked, which we note for the record.";
U.stanceCxField("falsifier", "A council minute showing no vote was taken.");
U.stanceCxField("commentary", COMMENT);
await clickId(page(), "sx-conclude");
const s2 = page();
const PC = lastOf("conclude");
ok("the project's act went out naming the project, and with NO conclusion text and NO version (the plane refuses both beside a project)",
  PC.params.project === PROJ && PC.params.target === INQ_PROJ && !("conclusion" in PC.params) && !("version" in PC.params),
  JSON.stringify(PC.params));
ok("the receipt is the record's, and carries the claim it adopted", /data-cx-receipt/.test(s2) && s2.includes(U.esc(CLAIM_A)));
const H1 = (await bvOf(INQ_PROJ, PROJ));
ok("THE RECORD HOLDS ONE ENTRY: this project concluded, adopting the stood-on reading's claim word for word",
  Array.isArray(H1.conclusion_history) && H1.conclusion_history.length === 1
  && H1.conclusion_history[0].act === "concluded" && H1.conclusion_history[0].claim === CLAIM_A
  && H1.conclusion_history[0].version === RA && H1.conclusion_stance === "concluded",
  JSON.stringify(H1.conclusion_history));
ok("the commentary is recorded in the member's name and marked never evidence, by the plane",
  H1.conclusion_history[0].commentary && H1.conclusion_history[0].commentary.text === COMMENT
  && H1.conclusion_history[0].commentary.evidence === false && H1.conclusion_history[0].commentary.by === "pilar");
ok("THE STANCE RENDERS: the project stands on its conclusion", /data-conc-stance="concluded"/.test(s2));
ok("the history renders its one entry, with the claim, and the commentary labelled never evidence",
  (s2.match(/data-conc-entry="/g) || []).length === 1 && /data-conc-entry="concluded"/.test(s2)
  && s2.includes(`data-conc-claim>${U.esc(CLAIM_A)}`) && /data-conc-commentary>[^<]*never evidence/.test(s2));
ok("the shared question itself did not move — the project's conclusion is its own",
  fmScalar(await imageOf(INQ_PROJ), "current_state") === "open");

/* ============================================================
   5. WITHDRAWAL APPENDS — THE WHOLE HISTORY, NOT ONLY THE STANCE
   ============================================================ */
console.log("\n--- 5. withdrawing appends, and the history shows both ---");

ok("the withdrawal is offered, under the plane's own label, while the project stands on a conclusion",
  /data-stance-withdraw>/.test(s2) && /id="sx-withdraw"/.test(s2) && /it stays in the record/.test(s2));
ok("NOTHING IS PREFILLED: the reason is empty", U.STANCE().wd.reason === "");
await clickId(s2, "sx-withdraw");
const w0 = capture(page());
ok("WITHDRAWING WITH NO REASON IS REFUSED BY THE PLANE, in its own words",
  /NO_REASON/.test(w0) && [...SAID].some((d) => w0.includes(`<div class="intent-ref-why">${U.esc(d)}</div>`)
  && /NO_REASON/.test(w0)));
ok("and nothing was appended", ((await bvOf(INQ_PROJ, PROJ)).conclusion_history || []).length === 1);
const WHY = "The audit reading changed what the paper trail shows.";
U.stanceWdField(WHY);
await clickId(page(), "sx-withdraw");
const w1 = page();
const WD = lastOf("withdrawconclusion");
ok("the withdrawal went out naming the project, the question and the member's reason",
  WD.params.project === PROJ && WD.params.target === INQ_PROJ && WD.params.reason === WHY);
const H2 = await bvOf(INQ_PROJ, PROJ);
ok("WITHDRAWING APPENDS: the record holds BOTH entries, the conclusion first and the withdrawal after it",
  H2.conclusion_history.length === 2 && H2.conclusion_history[0].act === "concluded"
  && H2.conclusion_history[0].claim === CLAIM_A && H2.conclusion_history[1].act === "withdrawn"
  && H2.conclusion_history[1].reason === WHY && H2.conclusion_stance === "withdrawn",
  JSON.stringify(H2.conclusion_history));
const ENTRIES = [...w1.matchAll(/data-conc-entry="([a-z]+)"/g)].map((m) => m[1]);
ok("THE HISTORY SHOWS BOTH, in order — the concluded entry is still rendered with its claim",
  JSON.stringify(ENTRIES) === JSON.stringify(["concluded", "withdrawn"]) && w1.includes(`data-conc-claim>${U.esc(CLAIM_A)}`)
  && w1.includes(U.esc(WHY)), JSON.stringify(ENTRIES));
ok("THE STANCE RENDERS the withdrawal, from the plane's stance and not from the list",
  /data-conc-stance="withdrawn"/.test(w1));
ok("the receipt says the withdrawn conclusion stays in the record", /data-wd-receipt/.test(w1));
ok("and with no conclusion standing, the withdrawal is no longer offered", !/id="sx-withdraw"/.test(w1)
  && /data-stance-withdraw="nothing"/.test(w1));

/* CONCLUDE AGAIN — REC-136's own accept shape: three entries readable in order,
   the stance the last. */
U.stanceCxField("falsifier", "A council minute showing no vote was taken.");
await clickId(w1, "sx-conclude");
const w2 = page();
const H3 = await bvOf(INQ_PROJ, PROJ);
ok("concluding again appends a THIRD entry, and the stance is the last",
  H3.conclusion_history.length === 3 && H3.conclusion_history.map((e) => e.act).join(",") === "concluded,withdrawn,concluded"
  && H3.conclusion_stance === "concluded");
ok("and all three render, in the record's order",
  JSON.stringify([...w2.matchAll(/data-conc-entry="([a-z]+)"/g)].map((m) => m[1])) === JSON.stringify(["concluded", "withdrawn", "concluded"]));

/* ============================================================
   6. DEC-8 — EVERY REFUSAL THE MEMBER READ CAME BACK OVER THE WIRE
   ============================================================ */
console.log("\n--- 6. DEC-8: every refusal sentence rendered was the plane's ---");
const FOREIGN = RENDERED.filter((r) => !SAID.has(unent(r)) && r !== "The record refused this and said nothing further.");
ok("the suite rendered refusals at all (a sweep over nothing proves nothing)", RENDERED.length >= 3, `${RENDERED.length}`);
ok("NOT ONE refusal sentence rendered originated in the surface", FOREIGN.length === 0, JSON.stringify(FOREIGN.slice(0, 3)));

console.log(`\nconclude-reading: ${pass} pass, ${fail} fail`);
await mf.dispose();
if (fail) process.exitCode = 1;
