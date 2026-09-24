/* UI-89 — THE EXCLUSION STATEMENT'S ACKNOWLEDGEMENTS, ON THE THREE SURFACES D-150 DELEGATED.
 *
 * DESIGN: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 11 and §6A.4; the plane half is D-150's
 * (IC-227) and IC-246's bound, and is NOT changed by this item. The delegation is `CLAIMS.md`'s
 * "DELEGATION 2026-09-23 RECORD (D-150) -> UI", which names the three surfaces and how a liar passes.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (a) THE ONE THE DELEGATION NAMES: rendering `null` and `[]` alike on the published case page. `[]` is
 *      "nobody but the author acknowledged the statement"; `null` is "the document says nothing about
 *      acknowledgements". Section 3 asserts the two sentences DIFFER, that neither is the bare word
 *      "nobody", and that the null one does not claim an absence. NEGATIVE CONTROL: render `null` as `[]`
 *      and the "null is not nobody" arm fails BY NAME.
 *  (b) A SURFACE THAT WRITES THE REFUSAL ITSELF. `op=statementack` has five refusals with no row in any
 *      `*_CHECKS` family, so they carry the plane's authored `detail` and no `translation` (this item's
 *      FINDING; see the foot of this file). A surface that invented its own wording would read better and
 *      claim what the record does not. So section 2 reads the plane's own answer and asserts the page
 *      renders THAT sentence, and that no machine vocabulary (a SHOUTY_CODE) reaches the rendered page.
 *  (c) A LIST THE PAGE COMPOSED. Section 2 compares the rendered acknowledgement against `op=reviewcopy`'s
 *      own `statement_acknowledgements`, read directly from the plane.
 *  (d) AN ACT WITH NO CALL SITE (this area has shipped one three times — `CIVICOS_UI_STATE.md` v50/v45/v76).
 *      Every act here is driven through the markup the page rendered, and the WIRE is read for the op.
 *
 * WHY IT IS REAL: the plane is `bio-plane/src/index.mjs` under miniflare; sections 1 and 2 drive
 * `op=casedraft`, `op=reviewgrant`, `op=reviewcopy` and `op=statementack` for real, through the page's own
 * controls. WHAT IT CANNOT SEE: section 3 renders the published case page over an `op=publishedcase` answer
 * built here, not over a live publication — `publishedcase.test.mjs` is the area's precedent for that surface
 * and builds its answer the same way. The `null` arm CANNOT be driven live at all: the plane writes null only
 * for a case document authored BEFORE acknowledgements existed, and no such document can be made now. That is
 * a narrowing and it is stated rather than smoothed.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/statement-ack.control.mjs` from the repo root — every arm ALONE,
 * each anchor matched EXACTLY ONCE, restored by cp from a per-arm pristine copy and verified by sha256 AND cmp.
 * RUN 2026-09-24 by the UI-89 worker against app.html d25253ad731ff711… (1,538,717 B), IDENTICAL after every arm.
 * RUN 2: 8/8 AS DECLARED, baseline 28/0 GREEN — (A) the row's own control, `null` rendered as `[]` at the
 * source, comes back RED 26/2 failing BY NAME at "NULL IS NOT NOBODY" and "THE TWO SENTENCES DIFFER" while
 * sparing both live doors and the `[]` arm, which is the delegation's own acceptance. (B) RED 26/2, (C) RED 2/4,
 * (D) RED 5/1, (E) RED 27/1, (F) RED 26/2, (G) OVER-STRICTNESS 28/0 GREEN.
 * RUN 3 (2026-09-24, D-507): RE-RUN IN FULL AFTER CORRECTING TWO OF THIS SUITE'S OWN ASSERTIONS — the author
 * and no-statement arms now read the plane's CANNED TRANSLATION where they read its `detail`, because
 * C-82.5 and C-82.6 exist and `refusalWords` prefers a translation. A control coupled to the words a suite
 * asserts can be disarmed by the very edit that changes them, so the whole driver was re-run rather than
 * reasoned about: 8/8 AS DECLARED, unchanged in shape and in tally — baseline 28/0 GREEN; (A) RED 26/2;
 * (B) RED 26/2; (C) RED 2/4; (D) RED 5/1; (E) RED 27/1, naming the CORRECTED "BY ITS AUTHOR" label;
 * (F) RED 26/2 at "NO MACHINE VOCABULARY"; (G) 28/0 GREEN. app.html restored IDENTICAL by sha256 and cmp
 * after every arm (5c7ac848bf0a5382…, 1,568,991 B), driver exit 0.
 * FIRST RUN: 6/8 AS DECLARED, baseline 28/0 GREEN. Two arms came back NOT AS DECLARED and BOTH were findings
 * about the ARM rather than about the subject; both are corrected at the arm, with the measurement, and the
 * corrected pair was re-run and is RUN 2 above:
 *   (A) THE ROW'S OWN — `null` rendered as `[]` -> RED but tally -1: the first spelling disabled the null
 *       BRANCH, so `a.length` then threw on null and the suite ended with NO tally and named nothing. That arm
 *       moved a second variable and refutes nothing. Re-armed at the SOURCE (`acknowledgements || []`), which
 *       is the liar the delegation names.
 *   (D) THE ACT WITH NO CALL SITE -> RED at 5/1, failing at the budgeted wait for the refusal rather than at
 *       "ACT REACHES THE PLANE": with the op never sent there is no refusal to draw, the wait expires, and the
 *       suite ENDS there by design (M0-107). Re-declared to name the wait.
 * AS DECLARED on the first run: (B) `[]` rendered as `null` -> RED 26/2 at "[] IS NOBODY BUT THE AUTHOR";
 *   (C) the list dropped from the review copy -> RED 2/4 at "LEADS" and "EMPTY IS NOT SILENT", sparing
 *   "NULL IS NOT NOBODY"; (E) the surface writing its own refusal -> RED 27/1 at "BY ITS AUTHOR"; (F) the
 *   machine code printed -> RED 26/2 at "NO MACHINE VOCABULARY"; (G) OVER-STRICTNESS, the button and the
 *   lede re-worded in a spelling the suite did not anticipate -> 28/0 GREEN.
 *
 * FINDING, REPORTED AND NOT FIXED HERE (it is the plane's ground, not UI's): five of the six `STATEMENT_ACK_*`
 * refusal codes have NO row in any `*_CHECKS` family, so they carry the plane's authored `detail` and no
 * `translation`. The DEC-49 guard's own arm F already lists all five under "out of reach, one site — needs a
 * sentence WHEN its surface exists". This item is that surface. Section 2 prints the corpus and the gap every
 * run, and proves the sentence a member meets IS the plane's; giving the five catalogue rows is a plane change
 * (`bio-checks.mjs` + `store.mjs`'s `refusal` helper + the census floors) and is routed, not silently taken.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";
import { until, budgetAssert } from "../../bio-plane/test/budget.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
let mf = null;
const finish = async (code) => {
  console.log(`\nstatement-ack.test.mjs: ${pass} pass, ${fail} fail`);
  if (mf) await mf.dispose();
  process.exit(code ?? (fail ? 1 : 0));
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("statement-ack: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "ui89-instance", ADMIN_TOKEN: "adm-ui89", MEMBER_TOKEN: "mem-ui89",
              PROBE_TOKEN: "prb-ui89", DAEMON_TOKEN: "dmn-ui89", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const must = async (what, r) => {
  if (!r || r.ok !== true) { ok(`FIXTURE: ${what}`, false, JSON.stringify(r).slice(0, 400)); await finish(1); }
  return r;
};

/* ============================================================
   0. THE GROUND
   ============================================================ */
const member = async (id, caps, role) => {
  const add = await must(`memberadd ${id}`, await POST("op=memberadd&token=adm-ui89",
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps }));
  await must(`enroll ${id}`, await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` }));
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) { ok(`FIXTURE: login ${id}`, false, JSON.stringify(lg)); await finish(1); }
  return lg.token;
};
const IRIS = await member("iris", ["contribute", "publish"], "admin");
await member("kai", ["contribute"], "admin");

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
let snapSeq = 0;
const Q = "INQ-2026-8901-transfer";
const inquiryMd = ["---", `id: ${Q}`, "object_type: inquiry", "schema: inquiry@1", 'title: "Did the transfer follow the process?"',
  "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: ui89-instance", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""', "recheck_triggers: []",
  "---", "", "## Question", "", "Did the transfer follow the process the council adopted?", "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
await must(`promote ${Q}`, await POST(`op=promote&token=${IRIS}`, {
  bundleId: Q, base: null, snapKey: `${Q}-${++snapSeq}`,
  files: [{ path: "bundle.md", text: inquiryMd, bytes: inquiryMd.length, sha256: sha(inquiryMd) }], register: [],
  meta: { object_type: "inquiry", group: "ui89-instance", title: "Did the transfer follow the process?",
          current_state: "open", created: NOW, last_updated: LATER } }));
const projectMd = ["---", "object_type: project", "schema: project@1", 'title: "Oversight"',
  "current_state: investigating", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: ui89-instance",
  "references:", `  - target: ${Q}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'objective: "Decide whether to refer this to the auditor."', "---", "", "## Thesis Summary", "",
  "A project.", "", "## Open Questions", "", "## Ruled Out", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const pj = await POST(`op=promote&token=${IRIS}`, { base: null, snapKey: `proj-${++snapSeq}`,
  files: [{ path: "bundle.md", text: projectMd, bytes: projectMd.length, sha256: sha(projectMd) }], register: [],
  meta: { object_type: "project", group: "ui89-instance", title: "Oversight", current_state: "investigating",
          created: NOW, last_updated: LATER } });
if (!pj?.ok || typeof pj.bundleId !== "string") { ok("FIXTURE: create the project", false, JSON.stringify(pj)); await finish(1); }
const PROJ = pj.bundleId;

/* ============================================================
   THE PAGE
   ============================================================ */
const APP = appScript();
function page(hash, token, me) {
  const WIRE = [];
  const els = new Map();
  function el() {
    const e = { classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, style: {}, dataset: {},
      value: "", _html: "", textContent: "", scrollTop: 0, disabled: false, addEventListener() {},
      querySelector: () => el(), querySelectorAll: () => [], insertAdjacentHTML() {}, focus() {}, click() {}, remove() {},
      setAttribute() {}, onclick: null };
    Object.defineProperty(e, "innerHTML", { get() { return e._html; }, set(v) { e._html = v; } });
    return e;
  }
  const $$ = (s) => { if (!els.has(s)) els.set(s, el()); return els.get(s); };
  let HASH = hash || "";
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto, Blob: class {}, IntersectionObserver: undefined,
    setInterval: () => 1, clearInterval() {}, setTimeout: (fn) => { fn(); return 1; }, clearTimeout() {},
    requestAnimationFrame: (fn) => fn(), matchMedia: () => ({ matches: false }),
    document: { querySelector: $$, querySelectorAll: () => [], addEventListener() {}, documentElement: { setAttribute() {} },
      getElementById: () => el(), hidden: false, createElement: () => el(), body: { appendChild() {} } },
    location: { protocol: "https:", href: "https://civicos.example/" + (hash || ""),
                get hash() { return HASH; }, set hash(v) { HASH = v; } },
    history: { pushState() {}, back() {}, replaceState() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    window: { addEventListener() {}, open: () => null },
    fetch: async (u, opts) => {
      const url = new URL(u, "http://x");
      const params = Object.fromEntries(url.searchParams.entries());
      let body = null;
      try { body = opts && opts.body ? JSON.parse(opts.body) : null; } catch (_) { body = null; }
      WIRE.push({ op: params.op, params, body, method: (opts && opts.method) || "GET" });
      return mf.dispatchFetch(url.toString(), opts);
    } };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(APP + `;globalThis.__U = { PLANE, get RVC(){ return RVC; }, get RVS(){ return RVS; },
    rvcOpen, rvsOpen, pubStatementAcksHtml };`, ctx);
  const U = ctx.__U;
  U.PLANE.base = "http://x";
  if (token) { U.PLANE.token = token; U.PLANE.session = true; U.PLANE.me = me; }
  const html = (sel) => $$(sel)._html;
  const run = async (code, value) => {
    const fn = vm.runInContext(`(function(){ return (${code}); })`, ctx);
    await fn.call({ value, checked: value });
  };
  return { ctx, U, WIRE, html, run, get hash() { return HASH; } };
}
const WAIT_MS = 8000;
const tb = (label, got, want) => ok(label, JSON.stringify(got) === JSON.stringify(want), JSON.stringify(got));
const drawn = async (name, pred) => {
  const w = await until(() => { try { return !!pred(); } catch (_) { return false; } }, WAIT_MS);
  if (!budgetAssert(tb, name, w, WAIT_MS, "every later assertion of this suite, each reading a page this wait did not see drawn"))
    await finish();
};
const unesc = (s) => String(s).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const handler = (h, attr, re) => {
  const all = [...String(h).matchAll(new RegExp(`<[^>]*${attr}="([^"]*)"[^>]*>`, "g"))]
    .filter((m) => re.test(m[0])).map((m) => unesc(m[1]));
  return all.length === 1 ? all[0] : null;
};
const strip = (h) => unesc(String(h).replace(/<[^>]*>/g, " ")).replace(/&middot;/g, "·").replace(/&mdash;/g, "—")
  .replace(/&rsquo;/g, "’").replace(/\s+/g, " ").trim();
const flat = (s) => String(s).replace(/\s+/g, " ").trim();
/* A machine code that reached the page. `_` is what makes a code a code here, and this is the same
   matcher `review-copy.test.mjs` uses, on purpose: one spelling of "machine vocabulary" across the area. */
const shouty = (t) => [...String(t).matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)].map((m) => m[1]).filter((c) => c.includes("_"));

const irisMe = await GET(`op=whoami&token=${IRIS}`);
const STATEMENT = "This case does not cover the 2025 transfers.";

/* ============================================================
   1. THE DRAFT, AND THE LIST BESIDE THE STATEMENT (surface 1)
   ============================================================ */
console.log("\n--- 1. the review copy leads with the statement, and the list stands beside it ---");
const mkDraft = async (statement) => {
  const r = await must("casedraft", await POST(`op=casedraft&token=${IRIS}`,
    { project: PROJ, targets: [Q], roles: { [Q]: "load_bearing" },
      scope: "Whether the 2024 transfer followed the adopted process.", statement }));
  return r.draftId;
};
const DRAFT = await mkDraft(STATEMENT);
const M = page("", IRIS, irisMe);
await M.U.rvcOpen(DRAFT);
await drawn("the member's copy is drawn", () => /data-rvc-copy/.test(M.html("#content")));
const read1 = M.html("#content");
const direct1 = await GET(`op=reviewcopy&draft=${encodeURIComponent(DRAFT)}&token=${IRIS}`);
ok("LIVE: the page read the draft through op=reviewcopy, and the plane carries the statement's acknowledgements with it",
   direct1?.ok === true && direct1.statement_acknowledgements
   && typeof direct1.statement_acknowledgements.statement_sha === "string"
   && Array.isArray(direct1.statement_acknowledgements.acknowledgements),
   JSON.stringify(direct1 && direct1.statement_acknowledgements));
ok("LEADS: the acknowledgements stand with the exclusion statement — after it, and BEFORE what a publication would still need (§6A.4)",
   read1.indexOf("What this case leaves out") < read1.indexOf("Who else has read this statement")
   && read1.indexOf("Who else has read this statement") < read1.indexOf("What a publication would still need"),
   JSON.stringify({ leaves: read1.indexOf("What this case leaves out"), who: read1.indexOf("Who else has read this statement"),
                    still: read1.indexOf("What a publication would still need") }));
ok("EMPTY IS NOT SILENT: with no acknowledgement recorded the copy says nobody BUT ITS AUTHOR has acknowledged it, and never a bare \"nobody\"",
   /data-rvc-acks-empty/.test(read1) && /Nobody but its author has acknowledged this statement yet/.test(strip(read1)),
   strip(read1).slice(0, 200));
ok("DISCLOSED, NEVER ENFORCED: the copy says in its own words that the case publishes without an acknowledgement (rule 11)",
   /disclosed and never required/.test(strip(read1)) && /publishes without one/.test(strip(read1)));

/* ============================================================
   2. THE ACT, ON BOTH DOORS (surface 2)
   ============================================================ */
console.log("\n--- 2. the act, on both doors, and the plane's own refusals ---");
/* (a) THE AUTHOR'S OWN, refused by name. IRIS wrote the statement (the draft's last editor). */
M.WIRE.length = 0;
await M.run(handler(read1, "onclick", /rvcAcknowledge\(\)/));
await drawn("the author's refusal is drawn", () => /data-rvc-refusal/.test(M.html("#content")));
const readA = M.html("#content");
const sentAck = M.WIRE.filter((w) => w.op === "statementack");
const directAuthor = await GET(`op=statementack&draft=${encodeURIComponent(DRAFT)}&token=${IRIS}`);
ok("ACT REACHES THE PLANE: the button on the copy sent op=statementack ONCE, naming THIS draft and nothing else of the member's",
   sentAck.length === 1 && sentAck[0].params.draft === DRAFT && !("case" in sentAck[0].params),
   JSON.stringify(sentAck.map((w) => w.params)));
/* CORRECTED 2026-09-24 (D-507), never exempted. This asserted the page renders the plane's `detail`,
   and that was right on the tree it was written on: STATEMENT_ACK_BY_ITS_AUTHOR held no DEC-49 row, so
   `detail` was the only sentence the plane had for it — which was UI-89's own finding and the reason
   D-507 exists. The code now carries C-82.6's canned translation, `refusalWords` prefers a translation
   over a detail (DEC-49's whole point: one authored sentence, not thirteen surfaces inventing wording),
   and asserting the OLD sentence would now be asserting the defect. What is asserted instead is
   STRONGER than what was here: the wire still carries the unchanged `reason` AND the unchanged
   `detail` (the landing is additive), and the PAGE renders the translation. */
ok("BY ITS AUTHOR: the plane refuses the statement's own author by name; the wire still carries its `detail` "
 + "unchanged and the page renders THE PLANE'S CANNED TRANSLATION (C-82.6)",
   directAuthor?.reason === "STATEMENT_ACK_BY_ITS_AUTHOR" && typeof directAuthor.detail === "string"
   && typeof directAuthor.translation === "string" && directAuthor.translation.length > 100
   && directAuthor.check === "C-82.6"
   && strip(readA).includes(flat(directAuthor.translation)),
   JSON.stringify({ reason: directAuthor && directAuthor.reason, check: directAuthor && directAuthor.check }));
ok("NO MACHINE VOCABULARY: not one SHOUTY_CODE reaches the page the refusal was drawn on (DEC-49's whole point)",
   shouty(strip(readA)).length === 0, JSON.stringify(shouty(strip(readA))));

/* (b) THE RECIPIENT DOOR — a grant's holder, carrying no credential at all. */
const gr = await must("reviewgrant", await POST(`op=reviewgrant&token=${IRIS}`,
  { draft: DRAFT, recipient: "Dana Ortiz, the city auditor" }));
const SECRET = gr.secret;
const R = page("#reviewcopy/" + SECRET, null, null);
await R.U.rvsOpen(SECRET);
await drawn("the recipient's copy is drawn", () => /data-rvc-copy/.test(R.html("#pub-body")));
const readR0 = R.html("#pub-body");
ok("BOTH DOORS: the recipient, holding nothing, is shown the same list and offered the same act",
   /Who else has read this statement/.test(readR0) && /rvsAcknowledge\(\)/.test(readR0)
   && !/rvcAcknowledge\(\)/.test(readR0));
R.WIRE.length = 0;
await R.run(handler(readR0, "onclick", /rvsAcknowledge\(\)/));
await drawn("the recipient's acknowledgement is drawn", () => /data-rvc-acked/.test(R.html("#pub-body")));
const readR1 = R.html("#pub-body");
const ackWire = R.WIRE.filter((w) => w.op === "statementack");
ok("NO CREDENTIAL: the recipient's acknowledgement carried the grant's secret and NO token",
   ackWire.length === 1 && ackWire[0].params.secret === SECRET && !("token" in ackWire[0].params),
   JSON.stringify(ackWire.map((w) => w.params)));
const direct2 = await GET(`op=reviewcopy&draft=${encodeURIComponent(DRAFT)}&token=${IRIS}`);
const listed = direct2.statement_acknowledgements.acknowledgements;
ok("RECORDED: the plane now holds exactly one acknowledgement of this statement, by the recipient, through the grant",
   Array.isArray(listed) && listed.length === 1 && listed[0].kind === "recipient"
   && listed[0].recipient === "Dana Ortiz, the city auditor", JSON.stringify(listed));
ok("RENDERED FROM THE RECORD: the recipient's own page lists that acknowledgement with the plane's name and date, and drops the empty sentence",
   /data-rvc-ack /.test(readR1) && strip(readR1).includes("Dana Ortiz, the city auditor")
   && strip(readR1).includes(flat(listed[0].at)) && !/data-rvc-acks-empty/.test(readR1),
   strip(readR1).slice(0, 300));
await M.U.rvcOpen(DRAFT);
await drawn("the member's copy is redrawn", () => /data-rvc-ack /.test(M.html("#content")));
ok("ONE RECORD, TWO DOORS: the member's copy lists the recipient's acknowledgement too, and names which door it came through",
   /data-ack-kind="recipient"/.test(M.html("#content"))
   && strip(M.html("#content")).includes("who a copy of this draft was addressed to"));

/* (c) NO STATEMENT — a draft that says nothing about what its case leaves out. */
const BLANK = await mkDraft("");
const gr2 = await must("reviewgrant blank", await POST(`op=reviewgrant&token=${IRIS}`,
  { draft: BLANK, recipient: "Ray Okonkwo" }));
const R2 = page("#reviewcopy/" + gr2.secret, null, null);
await R2.U.rvsOpen(gr2.secret);
await drawn("the blank draft's copy is drawn", () => /data-rvc-copy/.test(R2.html("#pub-body")));
await R2.run(handler(R2.html("#pub-body"), "onclick", /rvsAcknowledge\(\)/));
await drawn("the no-statement refusal is drawn", () => /data-rvc-refusal/.test(R2.html("#pub-body")));
const directBlank = await GET(`op=statementack&secret=${encodeURIComponent(gr2.secret)}`);
/* CORRECTED 2026-09-24 (D-507), never exempted, for exactly the reason given at the author arm above:
   STATEMENT_ACK_NO_STATEMENT now holds C-82.5's canned translation, and a page rendering the plane's
   `detail` over a translation the plane sent would be the DEC-49 defect this item closed. */
ok("NOTHING TO ACKNOWLEDGE: a draft with no statement is refused by name; the wire still carries its "
 + "`detail` unchanged and the page renders THE PLANE'S CANNED TRANSLATION (C-82.5)",
   directBlank?.reason === "STATEMENT_ACK_NO_STATEMENT" && typeof directBlank.detail === "string"
   && typeof directBlank.translation === "string" && directBlank.translation.length > 100
   && directBlank.check === "C-82.5"
   && strip(R2.html("#pub-body")).includes(flat(directBlank.translation)),
   JSON.stringify({ reason: directBlank && directBlank.reason, check: directBlank && directBlank.check }));
ok("NO MACHINE VOCABULARY, RECIPIENT DOOR: no SHOUTY_CODE reaches the page a recipient was refused on",
   shouty(strip(R2.html("#pub-body"))).length === 0, JSON.stringify(shouty(strip(R2.html("#pub-body")))));
/* THE FIVE CODES, DERIVED FROM THE PLANE'S SOURCE AND NEVER TYPED HERE — the delegation's own
   requirement. Every `STATEMENT_ACK_*` code `store.mjs` can return is listed; the two this suite
   drives live are named from the plane's own answers above, and the rest are reported. A code this
   walk cannot see would be a code no sentence is owed for, so the corpus is PRINTED. */
const STORE_SRC = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "utf8");
const ACK_CODES = [...new Set([...STORE_SRC.matchAll(/["']?(STATEMENT_ACK_[A-Z_]+)["']?\s*[,:}]/g)].map((m) => m[1]))]
  .filter((c) => !/_MAX$|_CHECKS$/.test(c)).sort();
console.log(`  ACK CODE CORPUS (derived from bio-plane/src/store.mjs, never typed here): ${ACK_CODES.length} — ${ACK_CODES.join(", ")}`);
ok("THE CORPUS IS NOT EMPTY, and it is the plane's own: every STATEMENT_ACK_* refusal `store.mjs` can return",
   ACK_CODES.length >= 5, JSON.stringify(ACK_CODES));
const CATALOGUE = fs.readFileSync(new URL("../../bio-plane/checks/bio-checks.mjs", import.meta.url), "utf8");
const CAT_BLOCK = CATALOGUE.slice(CATALOGUE.indexOf("export const STATEMENT_ACK_CHECKS"));
const CAT_CODES = [...new Set([...CAT_BLOCK.slice(0, CAT_BLOCK.indexOf("\n};")).matchAll(/(STATEMENT_ACK_[A-Z_]+):/g)].map((m) => m[1]))];
const NO_ROW = ACK_CODES.filter((c) => !CAT_CODES.includes(c));
console.log(`  DEC-49 ROWS: ${CAT_CODES.length} of ${ACK_CODES.length} STATEMENT_ACK_* codes have a \`*_CHECKS\` row `
  + `(${CAT_CODES.join(", ") || "none"}); ${NO_ROW.length} carry the plane's authored \`detail\` and no \`translation\`: ${NO_ROW.join(", ") || "none"}.`);
ok("EVERY REFUSAL THIS SURFACE CAN MEET CARRIES AN AUTHORED SENTENCE — from a catalogue row's `translation` where "
   + "one exists, else the plane's own `detail` at its site; `refusalWords` prefers the row, and the two arms above "
   + "prove the rendered sentence IS the plane's",
   NO_ROW.every((c) => new RegExp(`reason: "${c}"[\\s\\S]{0,600}?detail:`).test(STORE_SRC)),
   JSON.stringify(NO_ROW));

/* ============================================================
   3. THE PUBLISHED CASE PAGE — `[]` AND `null` ARE DIFFERENT FACTS (surface 3)
   ============================================================ */
console.log("\n--- 3. the published case page: `[]` is not `null` ---");
const P = page("", null, null);
/* The answer shape is `op=publishedcase`'s: `completeness` is the JSON the ratify committer wrote, and its
   `acknowledgements` key is an ARRAY or NULL — `store.mjs` says "NULL — never an empty list". */
const CASE = { caseId: "CASE-2026-0089-oversight", edition: 1 };
const withAcks = (acks) => ({ ...CASE, completeness: { statement: STATEMENT, author: "iris", at: NOW,
  subject_position: "put", subject_justification: "", excluded: "[]", acknowledgements: acks,
  acknowledgements_truncated: acks === null ? null : false } });
const hEmpty = P.U.pubStatementAcksHtml(withAcks([]));
const hNull = P.U.pubStatementAcksHtml(withAcks(null));
const hOne = P.U.pubStatementAcksHtml(withAcks([{ kind: "participant", by: "jon", recipient: null, at: LATER }]));
const sEmpty = strip(hEmpty), sNull = strip(hNull), sOne = strip(hOne);
console.log(`    []   -> ${sEmpty}`);
console.log(`    null -> ${sNull}`);
ok("THE TWO SENTENCES DIFFER: `[]` and `null` do not render the same words", sEmpty !== sNull && !!sEmpty && !!sNull,
   JSON.stringify({ sEmpty, sNull }));
ok("[] IS NOBODY BUT THE AUTHOR: the empty list says the record HOLDS the list and it is empty, and never the bare word \"nobody\"",
   /data-pub-acks="none"/.test(hEmpty) && /Nobody but the author of this statement acknowledged it/.test(sEmpty)
   && /the record carries the list and the list is empty/i.test(sEmpty), sEmpty);
ok("NULL IS NOT NOBODY: the absent list says the DOCUMENT SAYS NOTHING, states that this is not a record of nobody "
   + "having read it, and calls what happened undetermined (CLAUDE.md §2 — undetermined is first-class and must be STATED)",
   /data-pub-acks="undetermined"/.test(hNull) && /says nothing about acknowledgements/.test(sNull)
   && /not a record of nobody having read it/.test(sNull) && /undetermined/.test(sNull)
   && !/Nobody but the author of this statement acknowledged it/.test(sNull), sNull);
ok("A LIST IS A LIST: an acknowledgement renders with its acknowledger and its date, and says the author is never listed",
   /data-pub-acks="listed"/.test(hOne) && sOne.includes("jon") && sOne.includes(LATER)
   && /SECOND reader/.test(sOne) && !/data-pub-acks="none"/.test(hOne), sOne);
ok("NOT A CASE, NO SENTENCE: bytes that are not a member of any published case get NO acknowledgement sentence — "
   + "none is invented for them, exactly as the page invents no scope for them",
   P.U.pubStatementAcksHtml({ completeness: null }) === "" && P.U.pubStatementAcksHtml({}) === "");

await finish();
