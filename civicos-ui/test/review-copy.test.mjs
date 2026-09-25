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
 *      page would still read and comment perfectly. So section 7 ("NO EXPORT"; "ONE WAY OUT" since UI-69) reads the surface's own source
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
 * RE-RUN 2026-09-24 by c19-unionfix after the waits became `budget.mjs`'s checked `until` (six budget assertions):
 * 8/8 AS DECLARED, baseline 46/0, each red arm failing only what it named; app.html IDENTICAL after every arm.
 *   (H) THE WAIT'S OWN, run by hand: `const WAIT_MS = 8000;` -> `0` (anchor once; restored by cp, sha256 AND cmp,
 *       32,935 B) -> 21/1, the ONE failing line the first budget assertion, its `TIMEOUT (M0-107)` marker printed,
 *       and the suite ENDED there — nothing read off the page the expired wait never saw drawn.
 *
 * ============== UI-92 (2026-09-24): SECTION 6b, THE PROJECT'S DRAFTS LISTED ON THE WORKSPACE ==============
 * §6A.4 and §3 rule 15 (a) (BOB #32), over REC-198's `op=casedrafts` (IC-243). The acceptance in its own words:
 * every draft the plane lists appears, and each opens. The section drives the WORKSPACE (`openProjectWorkspace`),
 * not the review copy, because that is where the list belongs — a member goes looking for a project's working
 * material on the project — and it drives it against the same real plane the rest of this file does.
 * HOW A LIAR WOULD MAKE IT GREEN, and what answers it: (a) render ONE row and call it the list — so the fixture
 * authors two more drafts through the plane's own act and the comparison is SET EQUALITY in both directions with
 * the corpus printed; (b) build the list here — so the page's own wire is read (`op=casedrafts` asked ONCE, naming
 * the project) and the case-identity sentence rendered is asserted to be the plane's bytes; (c) draw rows that open
 * nothing, or all open one draft — so every row's handler is RUN and each is asserted to reach the plane as the
 * `read` the plane PUBLISHED on that row, drawing three DIFFERENT authored scopes.
 * WHAT IT CANNOT SEE: a browser's own address bar (a member who kept a draft's address could always open it, and
 * that is what this list exists to make unnecessary); anything about a project with more drafts than the plane's
 * own ceiling, which is `REVIEW_LIST_MAX` at 500 and is not driven here — the `truncated` sentence is rendered
 * from the plane's own figures and its arm is the plane's, in `bio-plane/test/reviewcopy.test.mjs` block 9.
 *
 * NEGATIVE CONTROL: RUN 2026-09-24 by the UI-92 worker, the whole file re-run per arm — 12/12 AS DECLARED against
 * app.html cf4960019506b6e35d… (1,574,906 B), IDENTICAL after every arm by sha256 AND cmp. Baseline 58/0 GREEN
 * (46/0 before this item, measured on `origin/main` @ 68fecb8d in a separate checkout; the twelve are 6b's).
 *   (I) THE ROW'S OWN — the list stubbed EMPTY -> 49/6, at "EVERY DRAFT THE PLANE LISTS APPEARS"; "NO EXPORT" and
 *       "MARKING" green.
 *   (J) every row opens the FIRST draft -> 53/2, at "EACH OPENS" and "AND THEY ARE DIFFERENT DRAFTS"; the
 *       appearance arm green. **THIS ARM IS WHY THE INSTRUMENT MOVED, and the first run is recorded rather than
 *       smoothed: with "appears" and "opens" BOTH read off the row's `onclick`, breaking the open also broke the
 *       appearance arm (4 fails, the spare violated), because one string was standing for two facts.** The page
 *       now carries the draft's id as VISIBLE TEXT and a `data-project-drafts` count, the appearance arm reads
 *       those, and the open arm reads the handler — two facts, two places.
 *   (K) the list dropped from the invited member's SKELETON -> 57/1, at "THE SKELETON CARRIES THE LIST".
 *   (L) OVER-STRICTNESS — the list's heading re-worded and its local renamed -> 58/0 GREEN. **Its first run was
 *       RED (57/1) and that is a finding about the ARM THAT WAS WATCHING, not about this one: the reach arm keyed
 *       on the heading's literal words, so correct work in a spelling nobody anticipated failed. The marker
 *       attribute is what replaced it.**
 *
 * ============== UI-69 (2026-09-25): SECTION 6c, THE EXPORT; SECTION 7 CORRECTED TO "ONE WAY OUT" ==============
 * §6A.3 points 1 and 2 over REC-148's `inband` (IC-229). Section 6c's own header says how a liar passes it.
 * NEGATIVE CONTROL: RUN 2026-09-25 by the UI-69 worker, `node civicos-ui/test/review-copy.control.mjs` — 19/19 AS
 * DECLARED against app.html ceff5613a95844df… (1,626,056 B), IDENTICAL after every arm by sha256 AND cmp. Baseline
 * 69/0 GREEN (58/0 before this item on origin/main 964da679 — the eleven are ALL section 6c's; section 7 still
 * makes three assertions, its new seam terms folded into them). Arms (A)-(L) re-run unchanged but for the renamed
 * assertion.
 *   (M) THE ROW'S OWN — the quartet dropped from page 2 -> 67/2, at "EVERY PAGE CARRIES THE QUARTET" (and "IN WORDS
 *       TOO", the same page's words going with it); "THE STATEMENT AT THE ACT" and the page-count REACH green.
 *   (N) the stamp re-serialised here with no indent -> 68/1, at "EVERY PAGE CARRIES THE QUARTET"; "IN WORDS TOO"
 *       green — the words agree and the bytes do not, which is exactly the drift byte-equality exists to catch.
 *   (O) the statement said on the recipient door too -> 68/1, at "NOWHERE ELSE".
 *   (P) the statement dropped from the act -> 67/2, at "THE STATEMENT AT THE ACT" and "NOWHERE ELSE".
 *   (Q) an export button on the recipient door calling the seam -> 68/1, at "ONE WAY OUT".
 *   (R) no fresh read at the act -> 68/1, at "THE ACT READS AFRESH" ONLY: every stamp stayed byte-equal, because
 *       nothing moved between the two reads in this fixture. Recorded, not smoothed: byte-equality cannot see a
 *       stale-content export here, and the wire arm is what does.
 *   (S) OVER-STRICTNESS — the export's heading and button re-worded -> 69/0 GREEN.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: shared, for its side effect. */
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";
import { until, budgetAssert } from "../../bio-plane/test/budget.mjs";   /* M0-107: a wait whose expiry is NOT MEASURED */

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
    reviewCopyEntryHtml, rvcDraftNew, draftRouteFromHash, openProjectWorkspace };`, ctx);
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
   CORRECTED at integration by c19-unionfix, 2026-09-24 (M0-107, BOB #28): this was a hand-rolled deadline loop
   whose expiry was read by the NEXT assertion as a finding about the page — a false RED on a loaded machine,
   which `budget-sweep.test.mjs` names UNCHECKED. It is now `budget.mjs`'s `until`, checked on its own binding:
   on expiry `budgetAssert` prints the NOT MEASURED marker and records ONE failing assertion, and the suite ENDS
   there, because every later assertion reads a page this wait never saw drawn. */
const WAIT_MS = 8000;
const tb = (label, got, want) => ok(label, JSON.stringify(got) === JSON.stringify(want), JSON.stringify(got));
const drawn = async (name, pred) => {
  const w = await until(() => { try { return !!pred(); } catch (_) { return false; } }, WAIT_MS);
  if (!budgetAssert(tb, name, w, WAIT_MS, "every later assertion of this suite, each reading a page this wait did not see drawn"))
    await finish();
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
await drawn("the recipient's page drawing the copy", () => R.U.RVS && !R.U.RVS.busy);
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
const deadPage = async (s) => { const P = page("#reviewcopy/" + s, null, null); await drawn(`the page at #reviewcopy/${s.slice(0, 8)}… settling`, () => P.U.RVS && !P.U.RVS.busy); return P.html("#pub-body"); };
const dRevoked = await deadPage(SECRET);
const dNever = await deadPage("rv1_" + "A".repeat(43));
const dMalformed = await deadPage("x");
PAGES.push(["the withdrawn link", dRevoked]);
ok("A REVOKED SECRET READS NOTHING: the page draws no copy — no marking, no scope, no comment", !/data-rvc-copy/.test(dRevoked)
   && !dRevoked.includes(direct2.authored.scope) && !dRevoked.includes("ledger you cite"));
ok("ONE ANSWER: the withdrawn, the never-issued and the malformed link draw BYTE-IDENTICAL pages",
   dRevoked === dNever && dNever === dMalformed && dRevoked.length > 40, JSON.stringify([dRevoked.length, dNever.length, dMalformed.length]));
/* CORRECTED 2026-09-24 by D-448, never exempted, and the old assertion was WRONG rather than merely
   stale. It required the dead page to carry the plane's raw `detail`, which was the only sentence the
   plane sent for NO_REVIEW_COPY when this was written. C-87.1 now gives that code a CANNED TRANSLATION,
   and under DEC-49 a surface renders the translation in preference to the plane's own words — so the
   page carries the sentence a member is meant to READ, and demanding the `detail` would have pinned the
   surface to the machine-facing half of the answer and made D-448 impossible to land. What the arm is
   ABOUT is unchanged and is what matters: the dead page must disclose NOTHING about which of the four
   dead states obtains. So the three neutrality clauses stand exactly as they were, and the floor on the
   sentence's length is added for the reason this repository keeps meeting — an `includes("")` is true of
   every page, so a blanked translation would have satisfied a bare comparison for free. */
ok("NEUTRAL: the dead page says neither 'revoked' nor 'expired', prints no code, and carries the CANNED "
 + "TRANSLATION a member reads (C-87.1) rather than the plane's raw detail",
   !/revoked|expired/i.test(dRevoked) && shouty(strip(dRevoked)).length === 0
   && flat(plane5.translation || "").length > 60 && strip(dRevoked).includes(flat(plane5.translation)),
   strip(dRevoked));
const R2 = page("#reviewcopy/" + SECRET, null, null);
await drawn("the withdrawn link's page settling", () => R2.U.RVS && !R2.U.RVS.busy);
const lateComment = await POST(`op=reviewcomment&secret=${encodeURIComponent(SECRET)}`, { text: "still here?" });
ok("AND A WITHDRAWN SECRET CANNOT COMMENT", lateComment?.ok === false && !/data-rvc-comment-box/.test(R2.html("#pub-body")),
   JSON.stringify(lateComment).slice(0, 200));

/* A member with no standing in the project reads the dead answer too, in the plane's words. */
const J = page("", JON, jonMe);
J.ctx.location.hash = "#draft/" + draftId;
J.U.draftRouteFromHash();
await drawn("the outsider's draft page settling", () => J.U.RVC && !J.U.RVC.busy);
const jp = J.html("#content");
/* CORRECTED 2026-09-24 by D-448 for the reason given at the neutrality arm above: the member-side dead
   answer is the SAME `#noReviewCopy` bytes, so it too now carries C-87.1's canned translation instead of
   the plane's raw detail. The arm's subject — an outsider reads NO copy and meets no machine vocabulary
   — is unchanged, and both of its clauses are kept. */
ok("NO STANDING: a member outside the project opening the draft's address reads no copy, only the canned "
 + "sentence (C-87.1)",
   !/data-rvc-copy/.test(jp) && flat(plane5.translation || "").length > 60
   && strip(jp).includes(flat(plane5.translation)) && shouty(strip(jp)).length === 0, strip(jp).slice(0, 200));

/* ============================================================
   6b. UI-92 — THE WORKSPACE LISTS THIS PROJECT'S DRAFTS, AND EACH ONE OPENS.

   §6A.4 and §3 rule 15 (a) (BOB #32, 2026-09-23 23:08Z), over REC-198's `op=casedrafts` (IC-243). Until that
   op there was no read that could NAME a project's drafts, so a draft whose address was lost was a lost draft
   — UI-68 measured it and recorded it as this surface's own gap. What is asserted here is the row's
   acceptance, in its words: EVERY DRAFT THE PLANE LISTS APPEARS, AND EACH OPENS.

   HOW A LIAR WOULD MAKE THIS GREEN, and what answers it:
     - RENDER ONE ROW AND CALL IT THE LIST. So the fixture authors two more drafts through the plane's own act
       and the comparison is SET EQUALITY against the plane's answer, both directions, with the corpus printed.
     - BUILD THE LIST HERE. So the page's own wire is read: `op=casedrafts` asked ONCE, naming the project, and
       the case-identity sentence rendered is the plane's bytes — a sentence this page could not have composed
       ("a new case, whose identity is not yet allocated…" is the store's).
     - DRAW A ROW THAT OPENS NOTHING. So every row's own handler is RUN, as the browser would, and each is
       asserted to reach the plane as `op=reviewcopy&draft=<that id>` — which is the `read` the plane PUBLISHED
       on that row — and to draw that draft's own copy at its own address.
   ============================================================ */
console.log("\n--- 6b. the workspace lists this project's drafts, and each one opens (UI-92) ---");
const moreDrafts = [];
for (const scope of ["The second draft's scope, authored for the list.", "The third draft's scope, authored for the list."]) {
  const d = await must(`a further draft (${scope.slice(0, 16)}…)`, await POST(`op=casedraft&token=${IRIS}`, { project: PROJ, scope }));
  moreDrafts.push(d.draftId);
}
const planeList = await GET(`op=casedrafts&project=${encodeURIComponent(PROJ)}&token=${IRIS}`);
ok("THE PLANE: op=casedrafts lists this project's drafts, the one this suite drafted through the form among them",
   planeList?.ok === true && planeList.kind === "review-drafts" && Array.isArray(planeList.drafts)
   && planeList.drafts.length >= 3 && planeList.drafts.some((d) => d.draft_id === draftId),
   JSON.stringify(planeList).slice(0, 300));
const planeIds = (planeList.drafts || []).map((d) => d.draft_id);

const W = page("", IRIS, irisMe);
await W.U.openProjectWorkspace(PROJ);
const ws = W.html("#content");
PAGES.push(["the project workspace's list of drafts", ws]);
/* WHAT THE MEMBER IS SHOWN and WHAT THE ROW DOES are read from two DIFFERENT places on purpose — the visible
   id for the first, the row's own handler for the second — so that "every draft appears" and "each opens" are
   two facts and not one restated. Arm (J) of the control (every row opening the FIRST draft) is what proved
   the point: while both were read off the handler, breaking the open ALSO broke the appearance arm. */
const shownIds = [...ws.matchAll(/<span class="lt mono">([A-Za-z0-9_.-]+)<\/span>/g)].map((m) => m[1]);
const drewCount = Number((/data-project-drafts="(\d+)"/.exec(ws) || [])[1]);
ok(`REACH: the workspace drew its drafts section, saying it drew ${drewCount} rows, and ${shownIds.length} draft ids are on the page (the plane lists ${planeIds.length}) — a section that drew nothing would pass every arm below vacuously`,
   drewCount >= 3 && shownIds.length === drewCount, JSON.stringify({ drewCount, shownIds }));
ok("EVERY DRAFT THE PLANE LISTS APPEARS, and no row appears that the plane did not list — set equality, both directions",
   planeIds.every((id) => shownIds.includes(id)) && shownIds.every((id) => planeIds.includes(id))
   && new Set(shownIds).size === shownIds.length,
   JSON.stringify({ plane: planeIds, page: shownIds }));
const askedList = W.WIRE.filter((w) => w.op === "casedrafts");
ok("THE LIST IS THE PLANE'S: the page asked op=casedrafts ONCE, naming this project, and walked nothing itself",
   askedList.length === 1 && askedList[0].params.project === PROJ && askedList[0].method === "GET",
   JSON.stringify(askedList.map((w) => w.params)));
ok("THE CASE IDENTITY IS THE PLANE'S OWN SENTENCE, rendered and not composed here",
   (planeList.drafts || []).every((d) => strip(ws).includes(flat(d.case.identity))),
   JSON.stringify((planeList.drafts || []).map((d) => d.case.identity)));
ok("NO CODE AND NO MACHINE VOCABULARY reaches the member on the list",
   shouty(strip(ws)).length === 0 && !/pre-publish/i.test(ws), JSON.stringify(shouty(strip(ws))));

/* EACH OPENS — every row's own handler run, as the browser would. */
const opened = [];
for (const d of planeList.drafts) {
  const h = handler(ws, "onclick", new RegExp(`rvcOpen\\(&quot;${d.draft_id}&quot;\\)`));
  if (!h) { opened.push({ id: d.draft_id, why: "no single row carries this draft's handler" }); continue; }
  const P = page("", IRIS, irisMe);
  await P.run(h);
  await drawn(`the draft ${d.draft_id.slice(0, 12)}… settling after its row was clicked`, () => P.U.RVC && !P.U.RVC.busy);
  const asked = P.WIRE.filter((w) => w.op === "reviewcopy");
  opened.push({ id: d.draft_id, hash: P.hash, read: asked.map((w) => `op=reviewcopy&draft=${w.params.draft}`),
                drew: !!(P.U.RVC && P.U.RVC.copy && P.U.RVC.copy.kind === "review-copy"),
                scope: (P.U.RVC && P.U.RVC.copy && P.U.RVC.copy.authored && P.U.RVC.copy.authored.scope) || null });
}
ok("EACH OPENS: every listed row opens ITS OWN draft — at that draft's own address, by the read the plane published on the row, and the copy is drawn",
   opened.length === planeList.drafts.length
   && opened.every((o, i) => o.hash === `#draft/${o.id}` && o.drew
                             && o.read.length === 1 && o.read[0] === planeList.drafts[i].read),
   JSON.stringify(opened).slice(0, 600));
ok("AND THEY ARE DIFFERENT DRAFTS: the copies drawn carry the three different authored scopes, so one row opening one draft three times could not pass",
   new Set(opened.map((o) => String(o.scope))).size === opened.length, JSON.stringify(opened.map((o) => o.scope)));

/* THE LIST IS SHOWN ON THE SKELETON TOO, and that is the record's rule rather than this page's: the plane
   admits every PARTICIPANT, invited or joined, to both draft reads (`viewerPredicate` draws no line between
   them). jon is invited and does NOT join, and the invite is the plane's own act through the control plane,
   with the fence it always had — iris owns the project her `op=acquire` promoted. */
await must("invite jon to the project",
  await GET(`op=projectinvite&token=${IRIS}&projectId=${encodeURIComponent(PROJ)}&handle=jon`));
const planeListJon = await GET(`op=casedrafts&project=${encodeURIComponent(PROJ)}&token=${JON}`);
const WJ = page("", JON, jonMe);
await WJ.U.openProjectWorkspace(PROJ);
const wsJ = WJ.html("#content");
const rowIdsJ = [...wsJ.matchAll(/<span class="lt mono">([A-Za-z0-9_.-]+)<\/span>/g)].map((m) => m[1]);
ok("THE SKELETON CARRIES THE LIST: an invited-not-joined member, withheld the participants and the arithmetic, is shown exactly the drafts the plane lists for THEIR credential — the page invents no fence the record does not have",
   planeListJon?.ok === true && !/Who is working on this<\/h2>\s*<table/.test(wsJ)
   && (planeListJon.drafts || []).every((d) => rowIdsJ.includes(d.draft_id))
   && rowIdsJ.length === (planeListJon.drafts || []).length,
   JSON.stringify({ plane: (planeListJon.drafts || []).map((d) => d.draft_id), page: rowIdsJ }));

/* ============================================================
   6c. UI-69 — THE EXPORT: EVERY PAGE CARRIES THE PLANE'S QUARTET, AND §6A.3 POINT 2 IS SAID AT THE ACT.

   The acceptance in its own words: an exported copy carries the quartet on every page byte-equal to the plane's;
   the statement renders at the act and nowhere else.

   HOW A LIAR WOULD MAKE THIS GREEN, and what answers it:
     - STAMP THE FIRST PAGE AND CALL IT THE FILE. So pages are counted from the file's own sections, the corpus is
       printed and floored (>= 3: the copy, the authored sentences, one per finding), and stamps are counted
       against pages in BOTH directions — a page without one, or a page with two, fails.
     - COMPUTE A HASH HERE. The page could draw a plausible sha256 of its own. So every page's quartet is compared
       BYTE FOR BYTE to `JSON.stringify(inband, null, 1)` of the plane's own answer read directly, and that
       answer's hash is itself re-computed over the answer minus `inband` — the stamp is the plane's and the
       plane's is honest.
     - EXPORT WHAT IS ON SCREEN, STAMP WITH A LATER READ. So the page's wire must show ONE op=reviewcopy at the
       act, and the delivered file is compared to the answer's content.
     - SAY IT EVERYWHERE, SO IT IS "SAID". The statement is counted on every page this suite walked, the file
       included: exactly once where the export button is, inside that button's own box, and nowhere else.
   WHAT IT CANNOT SEE: what a real browser does with the download (the anchor's `download` name and the Blob's
   bytes are read at the seam `rvcDeliverFile` hands them to), and how a printer paginates — a "page" here is the
   file's own `<section class="rvx-page">`, which is the unit it asks to break on.
   ============================================================ */
console.log("\n--- 6c. exporting the copy to a file (UI-69) ---");
const DELIVERED = [];
M.ctx.Blob = class { constructor(parts, opts) { this.parts = parts; this.type = opts && opts.type; } };
M.ctx.URL = class extends URL {
  static createObjectURL(b) { DELIVERED.push({ blob: b }); return "blob:ui69-" + DELIVERED.length; }
  static revokeObjectURL() {}
};
const realCreate = M.ctx.document.createElement;
M.ctx.document.createElement = (tag) => {
  const a = { tag, href: "", download: "", rel: "", click() { const d = DELIVERED[DELIVERED.length - 1]; if (d) { d.name = this.download; d.href = this.href; d.clicked = true; } } };
  return a;
};
const before6c = M.html("#content");
PAGES.push(["the member's copy offering the export", before6c]);
const EXPORT_ACT = flat("Exporting makes a file of this copy on this device");
M.WIRE.length = 0;
await M.run(handler(before6c, "onclick", /rvcExport\(\)/));
const after6c = M.html("#content");
const direct6 = await GET(`op=reviewcopy&draft=${encodeURIComponent(draftId)}&token=${IRIS}`);
const asked6 = M.WIRE.filter((w) => w.op === "reviewcopy");
ok("THE ACT READS AFRESH: exporting asked op=reviewcopy ONCE, for this draft, and the page reports the file it made",
   asked6.length === 1 && asked6[0].params.draft === draftId && /data-rvc-exported/.test(after6c),
   JSON.stringify(asked6.map((w) => w.params)));
const file = DELIVERED.length === 1 && DELIVERED[0].clicked ? DELIVERED[0] : null;
const fileHtml = file ? file.blob.parts.join("") : "";
ok("DELIVERED ONCE: one file was handed to the browser, as text/html, under a name that carries the draft and the hash",
   !!file && file.blob.type.startsWith("text/html") && file.name.includes(draftId)
   && direct6?.inband && file.name.includes(direct6.inband.hash.sha256.slice(0, 12)),
   JSON.stringify(file && { name: file.name, type: file.blob.type, n: DELIVERED.length }));
const planeQ = JSON.stringify(direct6.inband, null, 1);
const { inband: _drop, ...rest6 } = direct6;
ok("THE PLANE'S QUARTET IS HONEST: its sha256 re-computes over the answer minus `inband`, as JSON.stringify(rest, null, 1) UTF-8",
   direct6.inband.hash.sha256 === sha(Buffer.from(JSON.stringify(rest6, null, 1), "utf8"))
   && typeof direct6.inband.date === "string" && typeof direct6.inband.author === "string" && direct6.inband.floors,
   JSON.stringify(direct6.inband).slice(0, 300));
const filePages = [...fileHtml.matchAll(/<section class="rvx-page" data-rvx-page="(\d+)">([\s\S]*?)<\/section>/g)]
  .map((m) => ({ n: Number(m[1]), inner: m[2] }));
const nFindings = (direct6.findings || []).length;
console.log(`  (the file: ${fileHtml.length} chars, ${filePages.length} pages; the draft names ${nFindings} finding(s))`);
ok(`REACH: the file has ${filePages.length} pages, the copy's, the authored sentences' and one per finding (>= 3), numbered 1..n, and every section is a page`,
   filePages.length >= 3 && filePages.length === 2 + Math.max(1, nFindings)
   && filePages.every((p, i) => p.n === i + 1)
   && (fileHtml.match(/<section\b/g) || []).length === filePages.length, JSON.stringify(filePages.map((p) => p.n)));
const stamps = filePages.map((p) => [...p.inner.matchAll(/<pre class="rvx-quartet" data-rvx-quartet>([\s\S]*?)<\/pre>/g)].map((m) => unesc(m[1])));
ok("EVERY PAGE CARRIES THE QUARTET: each page carries exactly ONE, and it is BYTE-EQUAL to the plane's `inband`",
   stamps.length === filePages.length && stamps.every((s) => s.length === 1 && s[0] === planeQ)
   && (fileHtml.match(/data-rvx-quartet/g) || []).length === filePages.length,
   JSON.stringify(stamps.map((s, i) => ({ page: i + 1, stamps: s.length, equal: s[0] === planeQ }))));
const fileText = strip(fileHtml);
ok("IN WORDS TOO: every page names the hash, the date and the author as the plane answered them",
   filePages.every((p) => strip(p.inner).includes(direct6.inband.hash.sha256) && strip(p.inner).includes(direct6.inband.date)
                          && strip(p.inner).includes(direct6.inband.author)));
ok("THE FILE IS THE ANSWER'S CONTENT: the marking, the statement, the scope and the finding's write-up are the plane's",
   fileText.includes(flat(direct6.marking)) && fileText.includes(direct6.authored.statement)
   && fileText.includes(direct6.authored.scope) && fileText.includes("Did the transfer follow the process the council adopted?"));
ok("WHAT IT DOES NOT REPRODUCE IS SAID, and it is not reproduced: no recipient's name, no comment, no secret, no script",
   /data-rvx-not-reproduced/.test(fileHtml) && !fileText.includes("Dana Ortiz") && !fileText.includes("ledger you cite")
   && !fileText.includes(SECRET) && !/<script\b|\bon[a-z]+="/i.test(fileHtml));
ok("NO RAW CODE on the file's words", shouty(fileText.replace(/\{[\s\S]*?\n\}/g, " ")).length === 0,
   JSON.stringify(shouty(fileText.replace(/\{[\s\S]*?\n\}/g, " "))));
PAGES.push(["the exported file", fileHtml]);

/* §6A.3 point 2 — AT THE ACT AND NOWHERE ELSE. */
const actCount = (h) => strip(h).split(EXPORT_ACT).length - 1;
const btnCount = (h) => (String(h).match(/onclick="rvcExport\(\)"/g) || []).length;
const box = (/<div class="intent-box" data-rvc-export-box>([\s\S]*?)<\/div>/.exec(before6c) || [])[1] || "";
ok("THE STATEMENT AT THE ACT: said once, in the export button's own box, and it says what leaves cannot be revoked and the grant can",
   actCount(before6c) === 1 && btnCount(before6c) === 1 && strip(box).includes(EXPORT_ACT) && /rvcExport\(\)/.test(box)
   && /cannot be revoked/.test(strip(box)) && /The grant is what can be revoked/.test(strip(box)), strip(box).slice(0, 300));
const where = PAGES.map(([n, h]) => ({ n, act: actCount(h), btn: btnCount(h) }));
ok("NOWHERE ELSE: on every page walked, the statement appears exactly where the export act is — never on the recipient door, the dead link, the form, the list or the file",
   where.every((w) => w.act === w.btn && w.act <= 1)
   && where.filter((w) => /recipient|withdrawn|form|list|file/.test(w.n)).every((w) => w.act === 0),
   JSON.stringify(where));
M.ctx.document.createElement = realCreate;

/* ============================================================
   7. ONE WAY OUT — and it is the export act's
   CORRECTED 2026-09-25 by UI-69, and why: this section was "NO EXPORT" and asserted that nothing on the surface
   could leave the instance at all. That was right for UI-68, whose premise was §6A.3 point 1's measurement
   (BOB #16): `op=reviewcopy` did not carry the in-band quartet, so no surface could offer a file. REC-148 built
   the quartet and UI-69 is the export the gate was waiting for, so "no export" is no longer the rule — "ONE
   export, the member's, stamped" is. What the old arm guarded is KEPT: no print call, hook or rule; no download,
   blob or data link anywhere but the one seam (`rvcDeliverFile`), called from ONE site (`rvcExport`); and on
   the recipient door, the dead link and the form, no export affordance at all.
   ============================================================ */
console.log("\n--- 7. one way out of the instance, and it is the export act ---");
const EXPORT = [
  ["a download attribute", /\bdownload\s*=/i], ["a blob URL", /\bblob:|createObjectURL/], ["a data URL", /["'(]data:/i],
  ["a print call", /\bprint\s*\(/], ["a print hook", /beforeprint|afterprint/], ["a file saver", /showSaveFilePicker|saveAs\s*\(/],
  ["an export or download control", />[^<]*\b(export|download|print|save as pdf|pdf)\b[^<]*<\/(button|a)>/i],
];
ok("REACH: the review copy's own source block was found and is the real one",
   BLOCK_CODE.length > 5000 && BLOCK_CODE.includes("function rvcCopyHtml") && BLOCK_CODE.includes("function rvsHtml"),
   String(BLOCK_CODE.length));
ok("REACH: the rendered pages walked are non-empty", PAGES.length >= 8 && PAGES.every(([, h]) => h.length > 40),
   JSON.stringify(PAGES.map(([n, h]) => [n, h.length])));
const SEAM = /function rvcDeliverFile\([^)]*\)\{[\s\S]*?\n\}\n/;
const seamSrc = (SEAM.exec(BLOCK_CODE) || [""])[0];
const outside = BLOCK_CODE.replace(SEAM, "");
const found = [];
for (const [what, re] of EXPORT.slice(0, 6)) if (re.test(outside)) found.push(`${what} in the surface's source outside rvcDeliverFile`);
for (const [n, h] of PAGES) {
  if (/the exported file/.test(n)) continue;
  for (const [what, re] of EXPORT) {
    const hits = (String(h).match(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g")) || []).length;
    /* The member's copy may carry EXACTLY ONE export control, and it is the export act's own button. */
    const allowed = (what === "an export or download control" && /^the member's copy/.test(n) && btnCount(h) === 1) ? 1 : 0;
    if (hits > allowed) found.push(`${what} on ${n}`);
  }
}
const callers = (outside.match(/\brvcDeliverFile\(/g) || []).length;
if (!seamSrc || !/createObjectURL/.test(seamSrc)) found.push("the seam rvcDeliverFile was not found, or is not where the file leaves");
const actSrc = (/async function rvcExport\(\)\{[\s\S]*?\n\}\n/.exec(outside) || [""])[0];
const fileSrc = (/function rvcExportFile\([^)]*\)\{[\s\S]*?\n\}\n/.exec(outside) || [""])[0];
if (callers !== 1 || !/rvcExportFile\(c\)[\s\S]*rvcDeliverFile\(/.test(actSrc) || !/const q = rvcQuartetOf\(c\);\s*if\(!q\) return null;/.test(fileSrc))
  found.push(`rvcDeliverFile is called from ${callers} site(s), not from rvcExport alone on a file drawn only after the quartet is checked`);
const printCss = [...fs.readFileSync(new URL("../app.html", import.meta.url), "utf8").matchAll(/@media\s+print\s*\{([\s\S]*?)\n\}/g)].map((m) => m[1]).join("\n");
if (/\.rvc-|\.rvx-|data-rvc/.test(printCss)) found.push("a print rule for the review copy");
ok("ONE WAY OUT: no print call, hook or rule; no download, blob or data link but the one seam, called from the export act alone; no export control on any page but the member's one button — FOUND: "
   + (found.length ? found.join("; ") : "none"), found.length === 0 && printCss.length > 100);

await finish();
