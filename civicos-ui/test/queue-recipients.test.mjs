/* D-528 — A BIAS-DEBT OBLIGATION'S NAMED RECIPIENTS ARE TOLD IT IS ADDRESSED TO THEM, AGAINST THE REAL PLANE.
 * Design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class"
 * (an OBLIGATION is a named person's to act on); `docs/architecture/BIO_Declared_Bias_v0_1.md` (bias debt); IC-234.
 *
 * THE ROW'S ACCEPTS-WHEN: *"an obligation with named recipients shows them, against a real-plane suite (the measured
 * failure it moves: 'not addressed to anybody' to a named recipient)."*
 *
 * WHAT WAS WRONG, measured on `origin/main` @ 9f8b69e6: `app.html` `queueAssigneeHtml` read `assignee` alone. D-86's
 * producer publishes `assignee: null` beside `recipients: [member ids]`, and shows the item to a member ONLY when she
 * is one of them (`store.mjs` `#obligationsBiasDebt`), so every member who saw a named bias-debt obligation was told
 * "This is not addressed to anybody" — on an item she was shown because she was named.
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * `bio-plane/src/index.mjs` runs under miniflare. Members enrol through the real ops; a project is promoted, two
 * members joined; a lens is written, adopted and REVISED through the real doors; runs are opened through
 * `op=airunopen`; the bias-debt sweep is fired through the Durable Object's `onAlarm` (as `d86-bias-debt.test.mjs`
 * does — `alarm()` is workerd's reserved entry). The recipients rendered are the ones `#biasDebtRecipients` named —
 * no fixture of the op's answer exists in this file.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (1) DROP THE "NOBODY" SENTENCE EVERYWHERE — it would pass every named arm. §3 drives a run the producer could name
 *      nobody for, where the sentence is TRUE and must stay.
 *  (2) PRINT THE VIEWER AS THE RECIPIENT — §1 renders for ruth an item naming alice AND ruth; both must appear, in
 *      the record's order, and only ruth marked "(you)".
 *  (3) ANSWER FROM AN ATTRIBUTE — the member ids are not in the item's published id or in any sentence the producer
 *      writes; §0's instrument arm MEASURES that, so a green can only come from the assignee line.
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - The DOM is a stub, the reach every civicos-ui suite has; the rendered HTML is read as text.
 *  - An item carrying BOTH an `assignee` and `recipients`: no producer publishes one (measured: `recipients` is
 *    written by `#obligationsBiasDebt` alone). The branch exists and is not driven here.
 *
 * NEGATIVE CONTROL: arms declared and run in `queue-recipients.control.mjs`; results recorded on the line below.
 * CONTROL RESULT 2026-09-24 (D-528 worker), `node civicos-ui/test/queue-recipients.control.mjs`, every arm armed alone
 * on the EXTRACTED script (app.html never edited, nothing to restore), each splice asserted to match exactly once:
 *   baseline      exit 0 · 15 pass / 0 fail.
 *   assigneealone exit 1 · 10/5 — "§1 THE NAMED RECIPIENTS ARE SHOWN" BY NAME, "§1 AND RUTH IS NOT TOLD IT IS ADDRESSED
 *                 TO NOBODY", and §2's three. Fixtures, §0 and §3 green, as declared.
 *   nobodydropped exit 1 · 14/1 — "§3 WITH BOTH `assignee` AND `recipients` EMPTY", as declared.
 *   vieweronly    exit 1 · 13/2 — "§1 THE NAMED RECIPIENTS ARE SHOWN" and "§2 THE PROJECT RUN", as declared.
 *   spelling      exit 0 · 15/0 — OVER-STRICTNESS, GREEN as declared.
 *   control: 5 arm(s) run; every arm as declared.
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
  console.error("queue-recipients: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const APP = process.env.D528_APP_SRC || null;   /* the control harness hands a mutated app script through this */
const ADM = "adm-d528";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* pinned an hour out so the only alarm that fires is the one this suite fires by hand */
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-d528", VERSION: "test", BIAS_DEBT_DELAY_MS: "3600000" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const E = encodeURIComponent;

try {
/* ============================================================ 0. THE GROUND */
console.log("\n--- 0. the ground: a project run and a question run whose lens moved, and one run nobody can be named for ---");
const enrol = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  const en = await POST("op=enroll", { invite: add?.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* RUTH owns the project and authors the lens. ALICE opens the member runs. CORA is joined and named on nothing. */
const RUTH = await enrol("ruth", ["contribute", "publish", "create_projects"], "admin");
await enrol("gus", ["contribute"], "admin");
const ALICE = await enrol("alice", ["contribute"]);
const CORA = await enrol("cora", ["contribute"]);

const NOW = "2026-09-24T00:00:00Z", LATER = "2026-09-24T01:00:00Z";
let seq = 0;
const inquiryMd = (id) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "Question ${id}"`,
  "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: human", "  capability_tier: member", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: member", 'disposition_reason: ""', "---", "", "## Question", "", `Did ${id} happen?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
const projectMd = () => ["---", "object_type: project", "current_state: forming", `created: "${NOW}"`,
  `last_updated: "${LATER}"`, "references: []", "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");
const bundle = (id, type) => {
  const md = type === "project" ? projectMd() : inquiryMd(id);
  return { ...(type === "project" ? {} : { bundleId: id }), base: null,
    snapKey: `20260924T2200${String(++seq).padStart(2, "0")}Z_dd528aa1`,
    /* CORRECTED 2026-09-25 (D-563, C-86.3), never exempted: this label contradicted the title the other documents
       state, and is now refused; a project document here states no title, so the label stays its only name. */
    meta: { object_type: type, group: "believe-in-oakland", ...(type === "project" ? { title: `title for ${id}` } : {}),
            current_state: type === "project" ? "forming" : "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] };
};
const Q = "INQ-2026-9528-question";
const p = await POST(`op=promote&token=${RUTH}`, bundle("d528 project", "project"));
const P = p?.bundleId;
const qp = await POST(`op=promote&token=${RUTH}`, bundle(Q, "inquiry"));
for (const h of ["alice", "cora"]) await POST(`op=projectinvite&token=${RUTH}&projectId=${E(P)}&handle=${h}`);
const joined = [(await POST(`op=projectjoin&token=${ALICE}&projectId=${E(P)}`))?.state,
                (await POST(`op=projectjoin&token=${CORA}&projectId=${E(P)}`))?.state];
ok("FIXTURE: the project and the question are promoted; alice and cora are JOINED",
   p?.ok === true && !!P && qp?.ok === true && joined.join() === "joined,joined", JSON.stringify([p?.ok, qp?.ok, joined]));

/* THE LENS, written and adopted through the real doors, then revised so every run opened under it owes a re-run. */
const BIAS = "BIAS-2026-0528-house-lens";
let BIAS_SHA = null;
const biasMd = (state, text) => ["---", `id: ${BIAS}`, "object_type: bias", "schema: bias@1", `title: "House lens"`,
  `current_state: ${state}`, "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: human", "  capability_tier: member", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "statements:", "  - id: s1", '    kind: "scrutiny"', '    subject: "ENT-2026-0007"',
  `    text: ${JSON.stringify(text)}`, '    justification: "The office is a party to several matters this group is examining."',
  "    citations: []", "    locked: false", "---", "", "## Statements", "", "The lens this group works under.", "",
  "## Adoption", "", "Adopted at the members' meeting.", "", "## What This Does Not Enforce", "",
  "BIO checks that each statement names a registered subject and carries a justification. It does NOT check "
  + "whether a second source was independent of the first.", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const writeBias = async (state, text) => {
  const md = biasMd(state, text);
  const r = await POST(`op=promote&token=${RUTH}`, { bundleId: BIAS, base: BIAS_SHA,
    snapKey: `20260924T23${String(++seq).padStart(4, "0")}Z_bias`,
    meta: { object_type: "bias", group: "believe-in-oakland", current_state: state,
            created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
  if (r?.bundleSha) BIAS_SHA = r.bundleSha;
  return r?.ok === true;
};
const TEXT1 = "Claims from the city attorney's office need a second record.";
const TEXT2 = "Claims from the city attorney's office need TWO independent records.";
const lensOk = [await writeBias("draft", TEXT1), await writeBias("proposed", TEXT1),
  (await GET(`op=biasadopt&token=${RUTH}&bundleId=${BIAS}`))?.ok === true, await writeBias("adopted", TEXT1)];

let runSeq = 0;
const openAs = async (tok, contextId, contextType) => {
  const run = `RUN-2026-0924-d528-${++runSeq}`;
  const r = await POST(`op=airunopen&token=${tok}`, { run, contextType, contextId, label: "D-528 run", mode: "check",
    principalClaude: "member", principalClaudeRef: "believe-in-oakland/claude", skillVersion: "investigative-session@1",
    bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }], leaseMs: 30 * 86400000 });
  return { run, started: r?.started === true, r };
};
const MOV = await openAs(ALICE, P, "project");   // recipients: alice (principal) and ruth (the project's owner)
const QMOV = await openAs(ALICE, Q, "inquiry");  // recipients: alice alone
const NOBODY = await openAs(ADM, Q, "inquiry");  // the machine credential: no person behind it, nobody named
lensOk.push(await writeBias("adopted", TEXT2));
const ns = await mf.getDurableObjectNamespace("STORE");
const obj = ns.get(ns.idFromName("bio"));
const tick = await obj.onAlarm(Date.now() + 10 * 86400000);
const raised = [...(tick?.biasdebt?.raised ?? [])].sort();
ok("FIXTURE: the lens was adopted and revised through the real doors, the three runs opened, and the sweep raised "
   + "ONE bias-debt obligation for each",
   lensOk.every(Boolean) && MOV.started && QMOV.started && NOBODY.started
   && JSON.stringify(raised) === JSON.stringify([MOV.run, QMOV.run, NOBODY.run].sort()),
   JSON.stringify({ lensOk, started: [MOV.started, QMOV.started, NOBODY.started], nobody: NOBODY.r, raised }));

/* What the PLANE published, read once so every arm below can say which answer it rendered. */
const planeItem = async (tok, run) => ((await GET(`op=queue&token=${tok}&limit=500`))?.items || [])
  .find((i) => i && i.kind === "bias-debt" && i.subject?.id === run) || null;
const pMovRuth = await planeItem(RUTH, MOV.run);
const pNobody = await planeItem(CORA, NOBODY.run);
ok("FIXTURE: the plane NAMED alice and ruth on the project run, and left `assignee` null — the shape this item is about",
   JSON.stringify(pMovRuth?.recipients) === JSON.stringify(["alice", "ruth"]) && pMovRuth?.assignee === null,
   JSON.stringify(pMovRuth && { recipients: pMovRuth.recipients, assignee: pMovRuth.assignee }));
ok("FIXTURE: the plane could name NOBODY on the machine credential's run, said so in its own sentence, and offers it "
   + "to every reader (cora, named on nothing, is shown it)",
   !!pNobody && Array.isArray(pNobody.recipients) && pNobody.recipients.length === 0 && pNobody.assignee === null
   && typeof pNobody.recipients_stated === "string" && pNobody.recipients_stated.length > 0,
   JSON.stringify(pNobody && { recipients: pNobody.recipients, stated: pNobody.recipients_stated }));
/* THE INSTRUMENT: the member ids appear nowhere else the item publishes — not its id, not a sentence — so a phrase
   naming them on the page can only have come from the assignee line. */
ok("§0 INSTRUMENT: no member id appears in the item's id, summary, basis or subject, so no other renderer answers for it",
   !!pMovRuth && ["alice", "ruth"].every((m) => !JSON.stringify({ id: pMovRuth.id, summary: pMovRuth.summary,
     basis: pMovRuth.basis, subject: pMovRuth.subject, stated: pMovRuth.recipients_stated ?? null }).includes(m)));

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
  fetch: async (u, opts) => mf.dispatchFetch(new URL(u, "http://x").toString(), opts) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext((APP ? fs.readFileSync(APP, "utf8") : appScript()) + ";globalThis.__U = { PLANE, renderQueue };", ctx);
const U = ctx.__U;
const as = async (member, token) => {
  U.PLANE.token = token; U.PLANE.session = true;
  U.PLANE.me = { member, handle: member, session: true, administer: false, capabilities: ["contribute"] };
  await U.renderQueue();
  return $$("#q")._html;
};
const block = (html, run) => (new RegExp(`<article class="q-item[^"]*" data-id="OBLIGATION::bias-debt::${run}"[\\s\\S]*?</article>`)
  .exec(html) || [null])[0];
const NOBODY_SAID = "This is not addressed to anybody";

/* ============================================================ 1. THE ROW'S ACCEPTS-WHEN */
console.log("\n--- 1. ruth, the project's owner, sees the obligation the plane addressed to alice and to her ---");
{
  const b = block(await as("ruth", RUTH), MOV.run);
  ok("§1 the obligation reaches ruth's queue at all", !!b);
  ok("§1 THE NAMED RECIPIENTS ARE SHOWN — both members the record named, in its order, the viewer marked as herself",
     (b || "").includes("Addressed to <b>alice</b> and <b>ruth</b> (you)"), b);
  ok("§1 AND RUTH IS NOT TOLD IT IS ADDRESSED TO NOBODY — the measured failure this row moves",
     !!b && !b.includes(NOBODY_SAID));
  ok("§1 and only the viewer is marked: alice is named, not claimed as ruth", !!b && !b.includes("<b>alice</b> (you)"));
}

console.log("\n--- 2. alice, the run's principal, sees both of her runs addressed to her ---");
{
  const html = await as("alice", ALICE);
  const bm = block(html, MOV.run), bq = block(html, QMOV.run);
  ok("§2 THE PROJECT RUN names alice (as the viewer) and ruth",
     (bm || "").includes("Addressed to <b>alice</b> (you) and <b>ruth</b>"), bm);
  ok("§2 THE QUESTION RUN names alice alone — one name, no list punctuation borrowed from another item",
     (bq || "").includes("Addressed to <b>alice</b> (you) &middot;"), bq);
  ok("§2 and neither says it is addressed to nobody", !!bm && !!bq && !bm.includes(NOBODY_SAID) && !bq.includes(NOBODY_SAID));
}

/* ============================================================ 3. THE ONE CASE THE OLD SENTENCE IS TRUE OF */
console.log("\n--- 3. cora sees the run nobody could be named for: THERE the item is addressed to nobody ---");
{
  const html = await as("cora", CORA);
  const bn = block(html, NOBODY.run);
  ok("§3 cora, named on nothing, is shown the run nobody could be named for, and NOT the two that named others",
     !!bn && !block(html, MOV.run) && !block(html, QMOV.run));
  ok("§3 WITH BOTH `assignee` AND `recipients` EMPTY, the line still says the item is addressed to nobody",
     !!bn && bn.includes(NOBODY_SAID) && !bn.includes("Addressed to <b>"), bn);
  ok("§3 and the plane's own sentence about its reach is on the page beside it, verbatim",
     !!bn && bn.includes(pNobody.recipients_stated), bn);
}
} finally {
  await mf.dispose();
}
console.log(`\nqueue-recipients: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
