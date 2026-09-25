/* UI-118 — THE EXPORTED REVIEW COPY CARRIES THE DATE'S TIE BESIDE ITS DATE LINE, IN THE PLANE'S WORDS.
 *
 * DESIGN: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 point 1 (the in-band quartet; BOB #32's date is the
 * copy's LAST CHANGE; D-573 / BOB #34 2026-09-25 01:05Z: a tie the record cannot order is STATED beside the pick,
 * in `last_change.undetermined_within` and `last_change.stated`) and point 3(a) (BOB #35: the file does not carry
 * a recipient's name or words). UI-69 built the export and stamped every page with `inband` alone, so a file drawn
 * from a copy whose date is tied stated one last change the record cannot settle. This suite drives the export the
 * member's own button makes, against the REAL plane under miniflare, over a record holding such a tie.
 *
 * The tie can only be made by a stamp cut to the second, which no act writes since D-543; a record written before
 * it holds one. So the plane here is the REAL worker and the REAL Store with ONE extra door no caller has —
 * re-stamping a row's instant, as `bio-plane/test/d573-lastchange-tie.test.mjs` does — and everything else goes
 * through ops.
 *
 * HOW A LIAR WOULD MAKE THIS GREEN, and what answers it:
 *   (a) WORD THE TIE HERE — a sentence of the surface's own ("this date may be tied"). So the rendered statement is
 *       compared, after un-escaping, BYTE FOR BYTE to `last_change.stated` read directly from the plane.
 *   (b) SAY IT ONCE AND CALL THE FILE STAMPED. Every page carries the Date line, so every page must carry the
 *       statement, exactly once, inside its in-band block between the Date and the Author; pages are counted from
 *       the file's own sections and floored.
 *   (c) SAY IT ALWAYS — a statement on every file reads as diligence. So the same draft re-stamped out of the tie
 *       must export with NO statement anywhere.
 *   (d) LEAK A RECIPIENT'S NAME TO SAY THE TIE — the plane's sentence names who made each act. So a draft whose
 *       tie involves a recipient's COMMENT must make no file, say why in the page, and hand the browser nothing.
 *
 * GATE: reads bio-plane/src/ bio-plane/checks/bio-checks.mjs docprofile/
 *   (the plane is loaded by a probe module that imports `./index.mjs`, so the derivation cannot see the path.)
 *
 * NEGATIVE CONTROL: DECLARED BEFORE ARMING, each arm ALONE on `civicos-ui/app.html`, anchor matched EXACTLY ONCE,
 * restored by cp from a per-arm pristine copy in the session scratchpad and verified by sha256 AND cmp.
 *   (0) BASELINE -> all green.
 *   (A) THE ROW'S OWN — drop `last_change` from the export (`rvcTieOf` reads an empty tied list instead of the
 *       answer's). MUST FAIL "THE TIE ARM" and "A RECIPIENT'S COMMENT"; MUST NOT fail "NO TIE, NO STATEMENT".
 *   (B) the statement on the FIRST page only. MUST FAIL "EVERY PAGE"; MUST NOT fail "THE TIE ARM"'s wording arm.
 *   (C) the recipient guard removed. MUST FAIL "A RECIPIENT'S COMMENT" alone.
 *   (D) the statement drawn whenever `stated` is a string, tie or none. MUST FAIL "NO TIE, NO STATEMENT" alone.
 *   (E) OVER-STRICTNESS — the statement's element a <p> under another class name. MUST stay GREEN.
 *   Driver: `node civicos-ui/test/review-copy-tie.control.mjs` from the repo root.
 *   RUN 2026-09-25 by the UI-118 worker: 6/6 AS DECLARED against app.html 7d59351c5933f035… (1,725,432 B), IDENTICAL
 *   after every arm by sha256 AND cmp.
 *     (0) BASELINE -> 11/0 GREEN.
 *     (A) -> 7/4: "THE TIE ARM", "EVERY PAGE", "BOTH TO THE SECOND" and "A RECIPIENT'S COMMENT"; "NO TIE, NO STATEMENT"
 *         green. As declared (the both-whole-second arm reads the same `last_change` and goes with it).
 *     (B) -> 9/2: "EVERY PAGE" and "BOTH TO THE SECOND" (which also reads every page); "THE TIE ARM" green.
 *     (C) -> 10/1: "A RECIPIENT'S COMMENT" alone.
 *     (D) -> 10/1: "NO TIE, NO STATEMENT" alone.
 *     (E) -> 11/0 GREEN.
 *   UI-69's own control (`review-copy.control.mjs`) re-run on this tree: its arm (M) DID NOT ARM at first — its anchor
 *   named `rvcExportPage`'s old signature — and was corrected there; then 19/19 AS DECLARED, baseline 69/0.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: shared, for its side effect. */
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL, fileURLToPath } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";
import { makePublishingProject } from "../../bio-plane/test/publishingproject.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
let mf = null;
const finish = async (code) => {
  console.log(`\nreview-copy-tie.test.mjs: ${pass} pass, ${fail} fail`);
  if (mf) await mf.dispose();
  process.exit(code ?? (fail ? 1 : 0));
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("review-copy-tie: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const SRC = (f) => fileURLToPath(new URL(`../../bio-plane/src/${f}`, import.meta.url));
const PROBE_SRC = `
import worker from "./index.mjs";
import { Store } from "./store.mjs";
export class ProbeStore extends Store {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/restamp") {
      const b = await req.json();
      const table = { comment: "review_comments", ack: "statement_acknowledgements", draft: "case_drafts", grant: "review_grants" }[b.kind];
      const col = { comment: "at", ack: "at", draft: "updated_at", grant: "issued_at" }[b.kind];
      this.sql.exec("UPDATE " + table + " SET " + col + "=? WHERE draft_id=?", b.at, b.draft);
      const n = [...this.sql.exec("SELECT count(*) c FROM " + table + " WHERE draft_id=? AND " + col + "=?", b.draft, b.at)][0].c;
      return Response.json({ result: { ok: true, rows: n } });
    }
    return super.fetch(req);
  }
}
export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname.startsWith("/probe/"))
      return env.STORE.get(env.STORE.idFromName("bio")).fetch(new Request("http://do/" + u.pathname.slice(7) + u.search, req));
    return worker.fetch(req, env, ctx);
  },
};
`;
mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("ui118-probe.mjs"), script: PROBE_SRC,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "ui118-instance", ADMIN_TOKEN: "adm-ui118", MEMBER_TOKEN: "mem-ui118",
              PROBE_TOKEN: "prb-ui118", VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const PROBE = async (p, body) => rP(await (await mf.dispatchFetch(`http://x/probe/${p}`,
  { method: "POST", body: JSON.stringify(body) })).json());
const must = async (what, r) => {
  if (!r || r.ok !== true) { ok(`FIXTURE: ${what}`, false, JSON.stringify(r).slice(0, 400)); await finish(1); }
  return r;
};

/* ============================================================ the ground */
const enrol = async (memberId, role, capabilities) => {
  const add = await must(`memberadd ${memberId}`, await POST("op=memberadd&token=adm-ui118",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  await must(`enroll ${memberId}`, await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-118` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-118` });
  if (!lg?.token) { ok(`FIXTURE: login ${memberId}`, false, JSON.stringify(lg)); await finish(1); }
  return lg.token;
};
await enrol("nadia", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "admin", ["contribute", "publish"]);   /* ADMINS_FIRST: two before a member */
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const PROJ = await makePublishingProject({
  post: async (q, b) => await mf.dispatchFetch(`http://x/api/?${q}`, { method: "POST", body: JSON.stringify(b ?? {}) }).then((r) => r.json()),
  mf, sha, machineToken: "adm-ui118", owner: "iris", name: "PROJ-2026-1180-tie", created: NOW, updated: LATER });
const RECIPIENT = "Dana Ruiz, City Auditor's office";
/* A draft with a grant, the recipient's acknowledgement, and one comment — by the member or by the recipient. */
const draftWith = async (commentBy) => {
  const dr = await must("casedraft", await POST(`op=casedraft&token=${IRIS}`, {
    project: PROJ, targets: [], scope: "Whether the record orders its acts by instant.",
    statement: "This case covers the ordering of one copy's acts only.", excluded: [],
    subjectPosition: "sought_and_answered", subjectJustification: "We asked.",
    biasAcknowledgement: "This group holds that order is a fact." }));
  const g = await must("reviewgrant", await POST(`op=reviewgrant&token=${IRIS}`, { draft: dr.draftId, recipient: RECIPIENT }));
  const sec = encodeURIComponent(g.secret);
  await must("statementack", await POST(`op=statementack&draft=${dr.draftId}&secret=${sec}`, {}));
  await must("reviewcomment", commentBy === "member"
    ? await POST(`op=reviewcomment&draft=${dr.draftId}&token=${IRIS}`, { text: "a member's note on the order" })
    : await POST(`op=reviewcomment&draft=${dr.draftId}&secret=${sec}`, { text: "a recipient's words on the order" }));
  /* The edit and the grant an hour earlier throughout, so neither can be the pick or a tied act. */
  const early = [await put(dr.draftId, "draft", "2026-08-01T11:00:00.000Z"), await put(dr.draftId, "grant", "2026-08-01T11:00:00.500Z")];
  if (early.join() !== "1,1") { ok("FIXTURE: the early re-stamps each matched one row", false, JSON.stringify(early)); await finish(1); }
  return dr.draftId;
};
const put = async (draft, kind, at) => (await PROBE("restamp", { kind, draft, at }))?.rows;
const direct = (draft) => GET(`op=reviewcopy&draft=${encodeURIComponent(draft)}&token=${IRIS}`);

/* ============================================================ the page */
const APP = appScript();
const unesc = (s) => String(s).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const strip = (h) => unesc(String(h).replace(/<[^>]*>/g, " ")).replace(/&middot;/g, "·").replace(/&mdash;/g, "—")
  .replace(/&rsquo;/g, "’").replace(/\s+/g, " ").trim();
function page(token, me) {
  const WIRE = [], DELIVERED = [];
  const els = new Map();
  function el() {
    const e = { classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, style: {}, dataset: {},
      value: "", _html: "", textContent: "", addEventListener() {}, querySelector: () => el(), querySelectorAll: () => [],
      insertAdjacentHTML() {}, focus() {}, click() {}, remove() {}, setAttribute() {} };
    Object.defineProperty(e, "innerHTML", { get() { return e._html; }, set(v) { e._html = v; } });
    return e;
  }
  const $$ = (s) => { if (!els.has(s)) els.set(s, el()); return els.get(s); };
  let HASH = "";
  /* THE SEAM: `rvcDeliverFile` hands the file to a Blob, an object URL and an anchor's click; all three are read here. */
  class CapURL extends URL {
    static createObjectURL(b) { DELIVERED.push({ blob: b }); return "blob:ui118-" + DELIVERED.length; }
    static revokeObjectURL() {}
  }
  const ctx = { console, URL: CapURL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto, IntersectionObserver: undefined,
    Blob: class { constructor(parts, opts) { this.parts = parts; this.type = opts && opts.type; } },
    setInterval: () => 1, clearInterval() {}, setTimeout: (fn) => { fn(); return 1; }, clearTimeout() {},
    requestAnimationFrame: (fn) => fn(), matchMedia: () => ({ matches: false }),
    document: { querySelector: $$, querySelectorAll: () => [], addEventListener() {}, documentElement: { setAttribute() {} },
      getElementById: () => el(), hidden: false, body: { appendChild() {} },
      createElement: (tag) => ({ tag, href: "", download: "", rel: "",
        click() { const d = DELIVERED[DELIVERED.length - 1]; if (d) { d.name = this.download; d.clicked = true; } } }) },
    location: { protocol: "https:", href: "https://civicos.example/", get hash() { return HASH; }, set hash(v) { HASH = v; } },
    history: { pushState() {}, back() {}, replaceState() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    window: { addEventListener() {}, open: () => null },
    fetch: async (u, opts) => {
      const url = new URL(u, "http://x");
      WIRE.push({ op: url.searchParams.get("op"), params: Object.fromEntries(url.searchParams.entries()) });
      return mf.dispatchFetch(url.toString(), opts);
    } };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(APP + `;globalThis.__U = { PLANE, get RVC(){ return RVC; }, rvcOpen };`, ctx);
  const U = ctx.__U;
  U.PLANE.base = "http://x"; U.PLANE.token = token; U.PLANE.session = true; U.PLANE.me = me;
  const run = async (code) => { await vm.runInContext(`(function(){ return (${code}); })`, ctx).call({}); };
  return { U, WIRE, DELIVERED, html: () => $$("#content")._html, run };
}
const irisMe = await GET(`op=whoami&token=${IRIS}`);
/* Open the draft on the member's page and press the ONE export control the page drew, by its own handler. */
const exportOf = async (draft) => {
  const P = page(IRIS, irisMe);
  await P.U.rvcOpen(draft);
  const btns = [...P.html().matchAll(/<button[^>]*onclick="(rvcExport\(\))"[^>]*>/g)];
  if (btns.length !== 1) { ok("FIXTURE: the member's copy draws exactly one export control", false, String(btns.length)); await finish(1); }
  P.WIRE.length = 0;
  await P.run(unesc(btns[0][1]));
  const file = P.DELIVERED.length === 1 && P.DELIVERED[0].clicked ? P.DELIVERED[0].blob.parts.join("") : null;
  const pages = file ? [...file.matchAll(/<section class="rvx-page" data-rvx-page="(\d+)">([\s\S]*?)<\/section>/g)].map((m) => m[2]) : [];
  return { P, file, pages, after: P.html(), asked: P.WIRE.filter((w) => w.op === "reviewcopy").length };
};
/* The statement is found by its marker, whatever element carries it (arm E). */
const TIE_RE = /<(\w+)[^>]*\bdata-rvx-tie\b[^>]*>([\s\S]*?)<\/\1>/g;
const tiesOn = (h) => [...String(h).matchAll(TIE_RE)].map((m) => ({ text: unesc(m[2]), at: m.index }));

/* ============================================================ 1. THE TIE ARM */
console.log("\n--- 1. a legacy whole-second acknowledgement and a member's millisecond comment in ONE second ---");
const D1 = await draftWith("member");
const s1 = [await put(D1, "ack", "2026-08-01T12:00:00Z"), await put(D1, "comment", "2026-08-01T12:00:00.123Z")];
ok("FIXTURE: each re-stamp matched exactly one row (a re-stamp matching none would make every arm vacuous)", s1.join() === "1,1", JSON.stringify(s1));
const d1 = await direct(D1);
const lc1 = d1?.last_change || {};
ok("THE PLANE HOLDS A TIE: the comment is the pick and the in-band date, the acknowledgement is tied, and `stated` says so",
   lc1.kind === "comment" && d1?.inband?.date === "2026-08-01T12:00:00.123Z" && Array.isArray(lc1.undetermined_within)
   && lc1.undetermined_within.length === 1 && lc1.undetermined_within[0].kind === "statement acknowledgement"
   && /came later is undetermined/.test(lc1.stated || ""), JSON.stringify(lc1).slice(0, 400));
const x1 = await exportOf(D1);
console.log(`  (the file: ${x1.file ? x1.file.length : 0} chars, ${x1.pages.length} pages)`);
ok("REACH: the act read the copy afresh once and made one file of >= 3 pages, and the page says it did",
   x1.asked === 1 && !!x1.file && x1.pages.length >= 3 && /data-rvc-exported/.test(x1.after),
   JSON.stringify({ asked: x1.asked, file: !!x1.file, pages: x1.pages.length }));
const t1 = x1.pages.map(tiesOn);
ok("THE TIE ARM: the file carries the plane's own sentence, `last_change.stated` byte for byte",
   t1.length > 0 && t1[0].length === 1 && t1[0][0].text === lc1.stated, JSON.stringify(t1[0]).slice(0, 400));
ok("EVERY PAGE: each page carries the statement exactly once, the plane's bytes, between its Date line and its Author line",
   x1.pages.length >= 3 && x1.pages.every((p, i) => t1[i].length === 1 && t1[i][0].text === lc1.stated
     && p.indexOf("<b>Date</b>") < t1[i][0].at && t1[i][0].at < p.indexOf("<b>Author</b>")),
   JSON.stringify(t1.map((t) => t.length)));
ok("THE STAMP IS UNMOVED: every page's quartet is still byte-equal to the plane's `inband`",
   x1.pages.every((p) => [...p.matchAll(/data-rvx-quartet>([\s\S]*?)<\/pre>/g)].map((m) => unesc(m[1])).join("|")
     === JSON.stringify(d1.inband, null, 1)));

/* ============================================================ 2. NO TIE */
console.log("\n--- 2. the same draft re-stamped out of the tie: the comment a second later ---");
const s2 = [await put(D1, "comment", "2026-08-01T12:00:01.123Z")];
const d2 = await direct(D1);
ok("FIXTURE: the re-stamp matched one row and the plane now holds NO tie",
   s2.join() === "1" && Array.isArray(d2?.last_change?.undetermined_within) && d2.last_change.undetermined_within.length === 0,
   JSON.stringify(d2?.last_change).slice(0, 300));
const x2 = await exportOf(D1);
ok("NO TIE, NO STATEMENT: a file is made and no page carries a tie statement, nor the plane's sentence that an order is undetermined",
   !!x2.file && x2.pages.length >= 3 && tiesOn(x2.file).length === 0 && !/came later is undetermined/i.test(strip(x2.file)),
   JSON.stringify({ file: !!x2.file, ties: x2.file && tiesOn(x2.file).length }));

/* ============================================================ 3. over-strictness: both whole-second */
console.log("\n--- 3. two whole-second acts in one second: the plane's other sentence, carried the same way ---");
const s3 = [await put(D1, "comment", "2026-08-01T12:00:00Z"), await put(D1, "ack", "2026-08-01T12:00:00Z")];
const d3 = await direct(D1);
const x3 = await exportOf(D1);
ok("BOTH TO THE SECOND: the file carries the plane's sentence saying both were recorded to the second, on every page",
   s3.join() === "1,1" && /both were recorded to the second/.test(d3?.last_change?.stated || "")
   && !!x3.file && x3.pages.every((p) => { const t = tiesOn(p); return t.length === 1 && t[0].text === d3.last_change.stated; }),
   JSON.stringify({ stated: (d3?.last_change?.stated || "").slice(0, 200), file: !!x3.file }));

/* ============================================================ 4. a recipient's comment in the tie */
console.log("\n--- 4. the tie involves a RECIPIENT's comment: the sentence would carry their name out ---");
const D4 = await draftWith("recipient");
const s4 = [await put(D4, "ack", "2026-08-01T12:00:00Z"), await put(D4, "comment", "2026-08-01T12:00:00.123Z")];
const d4 = await direct(D4);
ok("FIXTURE: the plane holds the tie, its pick a recipient's comment, and its sentence names the recipient",
   s4.join() === "1,1" && d4?.last_change?.kind === "comment" && d4.last_change.by_kind === "recipient"
   && d4.last_change.undetermined_within?.length === 1 && (d4.last_change.stated || "").includes(RECIPIENT),
   JSON.stringify(d4?.last_change).slice(0, 400));
const x4 = await exportOf(D4);
ok("A RECIPIENT'S COMMENT: no file is handed to the browser, and the page says why in its own sentence",
   x4.file === null && x4.P.DELIVERED.length === 0 && /data-rvc-export-box/.test(x4.after)
   && strip(x4.after).includes("No file was made.") && strip(x4.after).includes("names a person this copy was addressed to")
   && !/data-rvc-exported/.test(x4.after), JSON.stringify({ delivered: x4.P.DELIVERED.length }));

/* WHAT THIS SUITE CANNOT SEE, NAMED RATHER THAN SCORED ZERO:
   - a real browser's download and printer; the file's bytes are read at the seam `rvcDeliverFile` hands them to.
   - a tie through a grant, a revocation or an edit: the plane's candidate path is one (`add` in `#reviewLastChange`)
     and the surface reads `last_change` without regard to kind; only a recipient's COMMENT is refused, by kind.
   - an answer with no `last_change` (a plane older than REC-200) is refused by `rvcTieOf` and is not driven here:
     this tree's plane always answers it.
   - the member's on-screen copy: it shows no tie statement beside its own marks; that is not an export and not
     this row's (the Date line lives only in the file). */
await finish();
