/* UI-68 — THE REVIEW COPY'S FOUR SURFACES, DRIVEN AGAINST THE REAL PLANE: a member drafts a case, edits it,
 * gives one named person access, that person reads it holding NOTHING and comments, the owner withdraws the
 * grant, and the withdrawn link then reads nothing — and NOTHING on any of it offers a way out of the instance.
 *
 * DESIGN: `docs/architecture/BIO_Publication_v0_1.md` §6A (Bob, 2026-09-17; §6A.2 BOB #14/#15; §6A.3 point 1
 * measured by BOB #16), the REC-126 → UI DELEGATION in `CLAIMS.md` and its REC-133 addendum. The plane half is
 * REC-126's (IC-145/IC-146) and REC-133's (IC-151), and is not changed by this item.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (a) A HIDDEN EXPORT PATH — a download link, a blob or data URL, a print hook, a print rule for the copy. The
 *      page would still read and comment perfectly. So section 7 ("NO EXPORT") reads the surface's own source
 *      block AND every page it rendered here, and fails naming what it found. NEGATIVE CONTROL: add a download
 *      link and that arm fails by name.
 *  (b) A DEAD LINK THAT SAYS WHY — "this access was revoked" reads kindly and tells a withdrawn recipient their
 *      access existed. So section 6 renders the withdrawn secret, a never-issued one and a malformed one, and
 *      asserts the three pages are BYTE-IDENTICAL and say neither "revoked" nor "expired".
 *  (c) A RECIPIENT DOOR THAT QUIETLY CARRIES A CREDENTIAL — it would read fine. So every request the recipient's
 *      page made is read off the WIRE and none may carry `token`.
 *  (d) A COPY WRITTEN BY THE PAGE — the marking, the missing-list and its `evaluated` sentence are compared to
 *      the plane's own answer read directly, verbatim; a comment's author label is read against the plane's
 *      `author_kind`.
 *  (e) A FORM THAT GUESSES — "nothing prefilled": the new-draft form is asserted empty field by field.
 *
 * WHY IT IS REAL: the plane is `bio-plane/src/index.mjs` under miniflare; every act goes through the page's own
 * markup (`onchange` and `onclick` strings read out of what it rendered, run in the page's context) and every
 * expected value is read back from the plane. WHAT IT CANNOT SEE: a real browser's own print and save commands,
 * which no page can remove — the assertion is that THIS surface offers none and prepares none; nothing is live
 * (no deploy is this item's).
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/review-copy.control.mjs` from the repo root — every arm ALONE, each
 * anchor matched EXACTLY ONCE, restored by cp from a per-arm pristine copy and verified by sha256 AND cmp.
 * RUN 2026-09-23 by the UI-68 worker: 8/8 AS DECLARED against app.html 85c4aa503c31e310… (1,471,639 B), IDENTICAL
 * after every arm (sha256 and cmp). Baseline 40/0 GREEN.
 *   (A) THE ROW'S OWN — a download link on the copy -> 39/1, at "NO EXPORT" (a download attribute in the surface's
 *       source and on every page walked); "MARKING" and "A REVOKED SECRET READS NOTHING" green.
 *   (B) a `beforeprint` hook -> 39/1, at "NO EXPORT"; "MARKING" green.
 *   (C) the dead page headed "This access was revoked" -> 39/1, at "NEUTRAL"; "ONE ANSWER" GREEN — every cause
 *       still draws the same bytes, which is exactly why the byte-identity arm alone could not catch it.
 *   (D) the marking dropped -> 38/2, at "MARKING" and "RECIPIENT READS THE SAME COPY"; "NO EXPORT" green.
 *   (E) the new-draft form prefilled with a scope -> 39/1, at "NOTHING PREFILLED"; the save arm green.
 *   (F) a recipient's comment labelled a member's -> 38/2, at "LABELLED" and "BOTH DOORS' COMMENTS"; the plane's
 *       own record of the comment green.
 *   (G) OVER-STRICTNESS — two headings and the grant button re-worded -> 40/0 GREEN.

 * ADDED 2026-09-24 by c18-batch7fix (M0-107 wait): (w1) the settle predicate never true (`return !!pred()` -> `return false && !!pred()`), restored by cp and verified by sha256 (e0e24212…) AND cmp (33,117 B). DECLARED: the first wait expires, the M0-107 marker prints, ONE assertion fails and the suite ends. -> 21 pass, 1 fail, "the recipient's copy settles — its 8000 ms budget did not expire (M0-107)", marker printed. AS DECLARED. (w0) a 1 ms budget came back GREEN, 46/0: `until` reads the predicate before the clock and the page had already settled, so that arm never armed — a finding about the arm, recorded. */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: shared, for its side effect. */
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";
import { until, budgetAssert } from "../../bio-plane/test/budget.mjs";   /* M0-107: a checkable wait */

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
let mf = null;
const finish = async (code) => {
  console.log(`\nreview-copy.test.mjs: ${pass} pass, ${fail} fail`);
  if (mf) await mf.dispose();
  process.exit(code ?? (fail ? 1 : 0));
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("review-copy: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
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
  bindings: { INSTANCE_NAME: "ui68-instance", ADMIN_TOKEN: "adm-ui68", MEMBER_TOKEN: "mem-ui68",
              PROBE_TOKEN: "prb-ui68", DAEMON_TOKEN: "dmn-ui68", VERSION: "test",
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
   0. THE GROUND — two members, one project iris owns, one question in it
   ============================================================ */
const member = async (id, caps) => {
  const add = await must(`memberadd ${id}`, await POST("op=memberadd&token=adm-ui68",
    { memberId: id, cover: `cover for ${id}`, role: id === "jon" ? "member" : "admin", capabilities: caps }));
  await must(`enroll ${id}`, await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` }));
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) { ok(`FIXTURE: login ${id}`, false, JSON.stringify(lg)); await finish(1); }
  return lg.token;
};
const IRIS = await member("iris", ["contribute", "publish"]);
/* A second administrator first: a group's second member must be one (ADMINS_FIRST). */
await member("kai", ["contribute"]);
const JON = await member("jon", ["contribute"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
let snapSeq = 0;
const Q = "INQ-2026-6801-transfer";
const inquiryMd = ["---", `id: ${Q}`, "object_type: inquiry", "schema: inquiry@1", 'title: "Did the transfer follow the process?"',
  "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: ui68-instance", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""', "recheck_triggers: []",
  "---", "", "## Question", "", "Did the transfer follow the process the council adopted?", "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
await must(`promote ${Q}`, await POST(`op=promote&token=${IRIS}`, {
  bundleId: Q, base: null, snapKey: `${Q}-${++snapSeq}`,
  files: [{ path: "bundle.md", text: inquiryMd, bytes: inquiryMd.length, sha256: sha(inquiryMd) }], register: [],
  meta: { object_type: "inquiry", group: "ui68-instance", title: "Did the transfer follow the process?",
          current_state: "open", created: NOW, last_updated: LATER } }));
const projectMd = ["---", "object_type: project", "schema: project@1", 'title: "Oversight"',
  "current_state: investigating", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: ui68-instance",
  "references:", `  - target: ${Q}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'objective: "Decide whether to refer this to the auditor."', "---", "", "## Thesis Summary", "",
  "A project.", "", "## Open Questions", "", "## Ruled Out", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const pj = await POST(`op=promote&token=${IRIS}`, { base: null, snapKey: `proj-${++snapSeq}`,
  files: [{ path: "bundle.md", text: projectMd, bytes: projectMd.length, sha256: sha(projectMd) }], register: [],
  meta: { object_type: "project", group: "ui68-instance", title: "Oversight", current_state: "investigating",
          created: NOW, last_updated: LATER } });
if (!pj?.ok || typeof pj.bundleId !== "string") { ok("FIXTURE: create the project", false, JSON.stringify(pj)); await finish(1); }
const PROJ = pj.bundleId;

/* ============================================================
   THE PAGE — app.html in a vm, its fetch routed to the real plane; every request recorded
   ============================================================ */
const APP = appScript();
const BLOCK = (() => {
  const a = APP.indexOf("/*__REVIEW_COPY_START__*/"), b = APP.indexOf("/*__REVIEW_COPY_END__*/");
  return a >= 0 && b > a ? APP.slice(a, b) : "";
})();
/* The block's CODE: its comments name what it must never do, and a scan for those words must read what runs. */
const BLOCK_CODE = BLOCK.replace(/\/\*[\s\S]*?\*\//g, "");
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
    reviewCopyEntryHtml, rvcDraftNew, draftRouteFromHash };`, ctx);
  const U = ctx.__U;
  U.PLANE.base = "http://x";
  if (token) { U.PLANE.token = token; U.PLANE.session = true; U.PLANE.me = me; }
  const html = (sel) => $$(sel)._html;
  /* Run a control's own handler string, as the browser would, with `this` standing for the control. */
  const run = async (code, value) => {
    const fn = vm.runInContext(`(function(){ return (${code}); })`, ctx);
    await fn.call({ value, checked: value });
  };
  return { ctx, U, WIRE, html, run, get hash() { return HASH; } };
}
/* A navigation the page starts on its own (an address resolved at load, a hash router) is not awaited by
   anybody, and the plane under miniflare answers over real I/O — so it is waited for BY ITS RESULT, bounded.
   CORRECTED 2026-09-24 by c18-batch7fix at the c17-batch7 union, not exempted: this read "a wait that runs out
   is reported by the assertion that reads the page", which is M0-107's defect exactly — an EXPIRED wait read as
   a FINDING about the page (BOB #28: an expiry measured nothing). `budget-sweep.test.mjs` found the hand-rolled
   deadline and its four discarded results as UNCHECKED sites. The wait is now `test/budget.mjs`'s `until`, its
   result handed to `budgetAssert`; on expiry the suite prints the M0-107 marker, records that ONE assertion, and
   ENDS, so nothing after the wait is read as a finding about a page it never saw. The predicate's own throw
   (a page not yet drawn) still reads as "not yet", as the old loop's did. */
const WAIT_MS = 8000;
const settle = async (name, pred) => {
  const w = await until(() => { try { return !!pred(); } catch (_) { return false; } }, WAIT_MS, { stepMs: 20 });
  if (!budgetAssert((n, got, want) => ok(n, got === want, got), name, w, WAIT_MS,
                    "every assertion after this wait — the suite ends here")) await finish();
};
const unesc = (s) => String(s).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
/* The handler string on the one control whose markup matches `re` — a control drawn twice, or not at all, fails. */
const handler = (h, attr, re) => {
  const all = [...String(h).matchAll(new RegExp(`<[^>]*${attr}="([^"]*)"[^>]*>`, "g"))]
    .filter((m) => re.test(m[0])).map((m) => unesc(m[1]));
  return all.length === 1 ? all[0] : null;
};
const strip = (h) => unesc(String(h).replace(/<[^>]*>/g, " ")).replace(/&middot;/g, "·").replace(/&mdash;/g, "—")
  .replace(/&rsquo;/g, "’").replace(/\s+/g, " ").trim();
const shouty = (t) => [...String(t).matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)].map((m) => m[1]).filter((c) => c.includes("_"));
const flat = (s) => String(s).replace(/\s+/g, " ").trim();
const PAGES = [];

const irisMe = await GET(`op=whoami&token=${IRIS}`);
const jonMe = await GET(`op=whoami&token=${JON}`);

/* ============================================================
   1. THE ENTRY, AND THE NEW-DRAFT FORM — nothing prefilled
   ============================================================ */
console.log("\n--- 1. the entry beside the publication statement, and the empty form ---");
const M = page("", IRIS, irisMe);
const entry = M.U.reviewCopyEntryHtml();
ok("ENTRY: a signed-in member holding contribute is offered the draft act beside the publication statement",
   /Draft a review copy/.test(entry) && /onclick="rvcDraftNew\(\)"/.test(entry), entry.slice(0, 200));
const RO = page("", "mem-ui68", { tokenClass: "member", session: false, capabilities: [] });
ok("ENTRY: a credential that is not a member session holding contribute is offered NO control (absent, not greyed)",
   RO.U.reviewCopyEntryHtml() === "");
await M.run(handler(entry, "onclick", /rvcDraftNew/));
const form0 = M.html("#content");
PAGES.push(["the new-draft form", form0]);
ok("FORM: the entry opens the draft form at its own address", M.hash === "#draft/new" && /A new review copy/.test(form0), M.hash);
const inputs = [...form0.matchAll(/<input[^>]*class="txt"[^>]*>/g)].map((m) => m[0]);
const areas = [...form0.matchAll(/<textarea[^>]*>([\s\S]*?)<\/textarea>/g)].map((m) => m[1]);
ok("NOTHING PREFILLED: every field of the new-draft form is empty and no choice is pre-selected",
   inputs.length >= 3 && inputs.every((i) => /value=""/.test(i)) && areas.length >= 6 && areas.every((a) => a === "")
   && !/<input[^>]*\schecked\s/.test(form0), JSON.stringify({ inputs: inputs.length, areas: areas.length }));
ok("NOTHING REQUIRED: the form refuses nothing locally — no `required` attribute and no disabled save",
   !/\brequired\b/.test(form0) && !/disabled/.test(form0));

/* ============================================================
   2. DRAFT, through the form's own controls
   ============================================================ */
console.log("\n--- 2. a draft saved through the form ---");
const field = async (id, value) => {
  const h = M.html("#content");
  const code = handler(h, "onchange", new RegExp(`id="${id}"`));
  if (!code) { ok(`FORM CONTROL: #${id} is drawn exactly once with a handler`, false); return; }
  await M.run(code, value);
};
await field("rv-project", PROJ);
await field("rv-loadBearing", Q);
await field("rv-scope", "Whether the 2024 transfer followed the adopted process.");
await field("rv-statement", "This case does not cover the 2025 transfers.");
M.WIRE.length = 0;
await M.run(handler(M.html("#content"), "onclick", /rvcSave/));
const drafted = M.WIRE.find((w) => w.op === "casedraft");
const draftId = M.U.RVC && M.U.RVC.draft;
ok("DRAFT: saving sent op=casedraft ONCE, with the project, the finding, its role and the two authored fields — and nothing the member left empty",
   M.WIRE.filter((w) => w.op === "casedraft").length === 1 && drafted.method === "POST" && drafted.body.project === PROJ
   && JSON.stringify(drafted.body.targets) === JSON.stringify([Q]) && drafted.body.roles?.[Q] === "load_bearing"
   && !("subjectPosition" in drafted.body) && !("excluded" in drafted.body) && !("biasAcknowledgement" in drafted.body)
   && !("draft" in drafted.body), JSON.stringify(drafted && drafted.body));
const direct1 = await GET(`op=reviewcopy&draft=${encodeURIComponent(draftId || "")}&token=${IRIS}`);
ok("DRAFT: the page now reads the draft the plane minted, at its own address", typeof draftId === "string" && /^DRAFT-/.test(draftId)
   && M.hash === "#draft/" + draftId && direct1?.ok === true && direct1.draft === draftId, JSON.stringify({ draftId, hash: M.hash }));
const read1 = M.html("#content");
PAGES.push(["the member's copy", read1]);
const t1 = strip(read1);
ok("MARKING: the plane's marking leads the copy, verbatim — before the content", typeof direct1.marking === "string"
   && t1.includes(flat(direct1.marking)) && read1.indexOf("data-rvc-marking") < read1.indexOf("What this case leaves out"),
   t1.slice(0, 300));
ok("SIGNATURE: the plane's own sentence that a review copy is never signed is shown", t1.includes(flat(direct1.signature.detail)));
ok("EXCLUSIONS LEAD: what the case leaves out comes before the missing-list, the scope and the findings (§6A.4)",
   read1.indexOf("What this case leaves out") < read1.indexOf("What a publication would still need")
   && read1.indexOf("What a publication would still need") < read1.indexOf("The findings it rests on")
   && t1.includes("This case does not cover the 2025 transfers."));
const miss0 = Array.isArray(direct1.missing) ? direct1.missing[0] : null;
const words0 = miss0 && ((typeof miss0.translation === "string" && miss0.translation) || miss0.detail);
ok("MISSING: the gates' own first refusal is listed in the gates' own words, and `evaluated` stands beneath it saying it is the first only",
   direct1.gates === "refused" && typeof words0 === "string" && words0.length > 20 && t1.includes(flat(words0))
   && t1.includes(flat(direct1.evaluated)) && read1.indexOf(esc1(direct1.evaluated).slice(0, 30)) > read1.indexOf("data-rvc-missing"),
   JSON.stringify({ gates: direct1.gates, words0 }).slice(0, 300));
function esc1(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
ok("FINDINGS: the finding the draft rests on is shown with its own write-up and its designation",
   /data-rvc-finding="INQ-2026-6801-transfer"/.test(read1) && t1.includes("Did the transfer follow the process the council adopted?")
   && t1.includes("The case rests on this finding."));
ok("NEVER 'PRE-PUBLISH': the copy is not called what Bob ruled it is not", !/pre-?publish/i.test(t1));
ok("NO RAW CODE: no machine code is printed on the copy", shouty(t1).length === 0, JSON.stringify(shouty(t1)));

/* ============================================================
   3. EDIT IN PLACE — the form starts from what the draft holds
   ============================================================ */
console.log("\n--- 3. editing the draft in place ---");
await M.run(handler(read1, "onclick", /rvcEdit\(\)/));
const form1 = M.html("#content");
ok("EDIT: the form opens holding the draft's own content, read back from the plane (not a default)",
   /Editing a review copy/.test(form1) && form1.includes(esc1(direct1.authored.scope)) && form1.includes(Q), form1.slice(0, 200));
await field("rv-scope", "Whether the 2024 and 2023 transfers followed the adopted process.");
M.WIRE.length = 0;
await M.run(handler(M.html("#content"), "onclick", /rvcSave/));
const edited = M.WIRE.find((w) => w.op === "casedraft");
const direct2 = await GET(`op=reviewcopy&draft=${encodeURIComponent(draftId)}&token=${IRIS}`);
ok("EDIT: saving sent op=casedraft with `draft` naming THIS draft, and the plane now holds the new scope under the SAME id",
   edited && edited.body.draft === draftId && direct2.authored.scope === "Whether the 2024 and 2023 transfers followed the adopted process."
   && M.U.RVC.draft === draftId && M.U.RVC.saved?.edited === true && direct2.authored.statement === "This case does not cover the 2025 transfers.",
   JSON.stringify({ body: edited && edited.body, scope: direct2.authored.scope }));

/* ============================================================
   4. GRANT — the secret shown once, with the plane's own sentence, and §6A.3 point 2 at the act
   ============================================================ */
console.log("\n--- 4. giving one person access ---");
const read2 = M.html("#content");
ok("AT THE ACT (§6A.3 point 2): the grant box says what leaves cannot be revoked and the grant can",
   /data-rvc-at-the-act/.test(read2) && /cannot be revoked/.test(strip(read2)) && /Withdrawing the grant ends their access/.test(strip(read2)));
await field("rv-recipient", "Dana Ortiz, the city auditor");
M.WIRE.length = 0;
await M.run(handler(M.html("#content"), "onclick", /rvcGrant\(\)/));
const granted = M.WIRE.find((w) => w.op === "reviewgrant");
const issued = M.U.RVC.issued;
const read3 = M.html("#content");
PAGES.push(["the member's copy with a grant just given", read3]);
const SECRET = issued && issued.secret;
ok("GRANT: op=reviewgrant was sent for THIS draft and the named recipient, and the plane answered a secret",
   granted && granted.body.draft === draftId && granted.body.recipient === "Dana Ortiz, the city auditor"
   && typeof SECRET === "string" && SECRET.length > 20, JSON.stringify(granted && granted.body));
ok("SHOWN ONCE: the link carries the secret in the address FRAGMENT, and the plane's own shown-once sentence stands beside it",
   read3.includes("#reviewcopy/" + SECRET) && typeof issued.secretIsShownOnce === "string"
   && strip(read3).includes(flat(issued.secretIsShownOnce)), strip(read3).slice(0, 200));
ok("ROSTER: the grant is listed with its recipient, its issuer and its date, as live, with a way to withdraw it",
   /data-rvc-grant="[^"]+" data-live="1"/.test(read3) && read3.includes("Dana Ortiz, the city auditor") && /rvcRevoke\(/.test(read3));
await M.run(handler(read3, "onclick", /rvcEdit\(\)/)); await M.run(handler(M.html("#content"), "onclick", /rvcOpen\(/));
ok("ONCE: leaving the copy and coming back shows the secret NOWHERE", !M.html("#content").includes(SECRET));

/* ============================================================
   5. THE RECIPIENT — holding nothing, at the address the owner handed over
   ============================================================ */
console.log("\n--- 5. the recipient's door, holding no credential ---");
const R = page("#reviewcopy/" + SECRET, null, null);
await settle("the recipient's copy settles", () => R.U.RVS && !R.U.RVS.busy);
const rv1 = R.html("#pub-body");
PAGES.push(["the recipient's copy", rv1]);
const rt1 = strip(rv1);
ok("REACH: the address resolved AT LOAD, with no session, and drew the copy", /data-rvc-copy/.test(rv1)
   && R.U.PLANE.token == null, rt1.slice(0, 200));
ok("NO CREDENTIAL ON THE WIRE: every request the recipient's page made carried no token, and it read the copy by its secret",
   R.WIRE.length > 0 && R.WIRE.every((w) => !("token" in w.params))
   && R.WIRE.some((w) => w.op === "reviewcopy" && w.params.secret === SECRET), JSON.stringify(R.WIRE.map((w) => w.params)));
ok("RECIPIENT READS THE SAME COPY: the marking, the scope and the missing-list are the plane's, verbatim",
   rt1.includes(flat(direct2.marking)) && rt1.includes(direct2.authored.scope) && rt1.includes(flat(direct2.evaluated)));
ok("ADDRESSED: the page says who it was addressed to and by whom", /data-rvc-addressed/.test(rv1)
   && rt1.includes("Dana Ortiz, the city auditor") && rt1.includes("iris"));
ok("THE RECIPIENT DOOR OFFERS NO MEMBER ACT: no edit, no grant, no withdrawal", !/rvcEdit|rvcGrant|rvcRevoke|rvcSave/.test(rv1));
await R.run(handler(rv1, "onchange", /id="rv-comment"/), "The 2023 transfer is not in the ledger you cite.");
R.WIRE.length = 0;
await R.run(handler(R.html("#pub-body"), "onclick", /rvsComment/));
const rcom = R.WIRE.find((w) => w.op === "reviewcomment");
ok("RECIPIENT COMMENT: sent by the secret, holding nothing, with the text as the body",
   rcom && rcom.params.secret === SECRET && !("token" in rcom.params) && rcom.body?.text === "The 2023 transfer is not in the ledger you cite.",
   JSON.stringify(rcom));
const direct3 = await GET(`op=reviewcopy&draft=${encodeURIComponent(draftId)}&token=${IRIS}`);
const rc = (direct3.comments || []).find((c) => c.text === "The 2023 transfer is not in the ledger you cite.");
ok("THE RECORD: the plane holds the comment as a RECIPIENT's, under the name the issuer gave", rc && rc.author_kind === "recipient"
   && rc.recipient === "Dana Ortiz, the city auditor", JSON.stringify(rc));
const rv2 = R.html("#pub-body");
ok("LABELLED: the recipient's page shows the comment as the recipient's, never a member's",
   /data-rvc-comment data-author-kind="recipient"/.test(rv2) && /not a member of this group/.test(strip(rv2)));

/* The member door shows the same comment, labelled by the plane's `author_kind` — and a member's own comment. */
await M.run(handler(M.html("#content"), "onchange", /id="rv-comment"/), "Noted; adding the 2023 ledger.");
await M.run(handler(M.html("#content"), "onclick", /rvcComment\(\)/));
const read4 = M.html("#content");
PAGES.push(["the member's copy with comments", read4]);
const kinds = [...read4.matchAll(/data-rvc-comment data-author-kind="([a-z]+)"/g)].map((m) => m[1]);
ok("BOTH DOORS' COMMENTS: the member door lists the recipient's comment as a recipient's and the member's as a member's",
   JSON.stringify(kinds) === JSON.stringify(["recipient", "member"]) && /Dana Ortiz, the city auditor/.test(read4)
   && /a member of this group/.test(strip(read4)), JSON.stringify(kinds));

/* ============================================================
   6. REVOKE — and a withdrawn secret reads NOTHING, in the one neutral answer
   ============================================================ */
console.log("\n--- 6. withdrawing the grant ---");
M.WIRE.length = 0;
await M.run(handler(read4, "onclick", /rvcRevoke\(/));
const revoked = M.WIRE.find((w) => w.op === "reviewrevoke");
const read5 = M.html("#content");
ok("REVOKE: op=reviewrevoke was sent naming the grant, and the roster now shows it withdrawn and not live",
   revoked && typeof revoked.body.grant === "string" && /data-live="0"/.test(read5) && /Withdrawn by/.test(strip(read5)),
   JSON.stringify(revoked && revoked.body));
const plane5 = await GET(`op=reviewcopy&secret=${encodeURIComponent(SECRET)}`);
ok("THE PLANE: the withdrawn secret reads nothing", plane5?.ok === false && plane5.reason === "NO_REVIEW_COPY", JSON.stringify(plane5).slice(0, 200));
let deadSeen = 0;   /* a label by position, never by any part of the secret */
const deadPage = async (s) => { const P = page("#reviewcopy/" + s, null, null); await settle(`dead link ${++deadSeen} settles`, () => P.U.RVS && !P.U.RVS.busy); return P.html("#pub-body"); };
const dRevoked = await deadPage(SECRET);
const dNever = await deadPage("rv1_" + "A".repeat(43));
const dMalformed = await deadPage("x");
PAGES.push(["the withdrawn link", dRevoked]);
ok("A REVOKED SECRET READS NOTHING: the page draws no copy — no marking, no scope, no comment", !/data-rvc-copy/.test(dRevoked)
   && !dRevoked.includes(direct2.authored.scope) && !dRevoked.includes("ledger you cite"));
ok("ONE ANSWER: the withdrawn, the never-issued and the malformed link draw BYTE-IDENTICAL pages",
   dRevoked === dNever && dNever === dMalformed && dRevoked.length > 40, JSON.stringify([dRevoked.length, dNever.length, dMalformed.length]));
ok("NEUTRAL: the dead page says neither 'revoked' nor 'expired', and prints no code",
   !/revoked|expired/i.test(dRevoked) && shouty(strip(dRevoked)).length === 0 && strip(dRevoked).includes(flat(plane5.detail)),
   strip(dRevoked));
const R2 = page("#reviewcopy/" + SECRET, null, null);
await settle("the withdrawn link settles", () => R2.U.RVS && !R2.U.RVS.busy);
const lateComment = await POST(`op=reviewcomment&secret=${encodeURIComponent(SECRET)}`, { text: "still here?" });
ok("AND A WITHDRAWN SECRET CANNOT COMMENT", lateComment?.ok === false && !/data-rvc-comment-box/.test(R2.html("#pub-body")),
   JSON.stringify(lateComment).slice(0, 200));

/* A member with no standing in the project reads the dead answer too, in the plane's words. */
const J = page("", JON, jonMe);
J.ctx.location.hash = "#draft/" + draftId;
J.U.draftRouteFromHash();
await settle("the outsider's draft address settles", () => J.U.RVC && !J.U.RVC.busy);
const jp = J.html("#content");
ok("NO STANDING: a member outside the project opening the draft's address reads no copy, only the plane's sentence",
   !/data-rvc-copy/.test(jp) && strip(jp).includes(flat(plane5.detail)) && shouty(strip(jp)).length === 0, strip(jp).slice(0, 200));

/* ============================================================
   7. NO EXPORT — nothing on this surface leaves the instance
   ============================================================ */
console.log("\n--- 7. no way out of the instance ---");
const EXPORT = [
  ["a download attribute", /\bdownload\s*=/i], ["a blob URL", /\bblob:|createObjectURL/], ["a data URL", /["'(]data:/i],
  ["a print call", /\bprint\s*\(/], ["a print hook", /beforeprint|afterprint/], ["a file saver", /showSaveFilePicker|saveAs\s*\(/],
  ["an export or download control", />[^<]*\b(export|download|print|save as pdf|pdf)\b[^<]*<\/(button|a)>/i],
];
ok("REACH: the review copy's own source block was found and is the real one",
   BLOCK_CODE.length > 5000 && BLOCK_CODE.includes("function rvcCopyHtml") && BLOCK_CODE.includes("function rvsHtml"),
   String(BLOCK_CODE.length));
ok("REACH: the rendered pages walked are non-empty", PAGES.length >= 6 && PAGES.every(([, h]) => h.length > 40),
   JSON.stringify(PAGES.map(([n, h]) => [n, h.length])));
const found = [];
for (const [what, re] of EXPORT) {
  if (re.test(BLOCK_CODE)) found.push(`${what} in the surface's source`);
  for (const [n, h] of PAGES) if (re.test(h)) found.push(`${what} on ${n}`);
}
const printCss = [...fs.readFileSync(new URL("../app.html", import.meta.url), "utf8").matchAll(/@media\s+print\s*\{([\s\S]*?)\n\}/g)].map((m) => m[1]).join("\n");
if (/\.rvc-|data-rvc/.test(printCss)) found.push("a print rule for the review copy");
ok("NO EXPORT: the review copy offers no download, no file, no blob or data link, no print call or hook and no print rule — FOUND: "
   + (found.length ? found.join("; ") : "none"), found.length === 0 && printCss.length > 100);

await finish();
