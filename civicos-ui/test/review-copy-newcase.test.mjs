/* UI-106 (carrying D-619) — THE REVIEW-COPY SURFACE KEEPS `newCase` THROUGH ITS OWN FORM, SHOWS A DERIVED
 * DRAFT'S IDENTITY AS THE PLANE STATES IT, AND NEVER TELLS A MEMBER A DERIVED DRAFT'S GRANT WAS "for a new case".
 *
 * DESIGN: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's `newCase` ruling (2026-09-23 23:08Z)
 * and D-538's identity sentence. The PLANE halves are REC-199's (IC-285: `op=reviewcopy`'s `case` block says
 * `newCase` back), D-538's (the identity sentence reads `newCase`) and D-568's (a DERIVED draft's `edition` is
 * null on the wire), and none of them is changed by this item. The delegation this discharges is `CLAIMS.md`'s
 * "DELEGATION 2026-09-24 RECORD (WORKER REC-199) -> UI".
 *
 * THE MEASURED FAILURES THIS MOVES.
 *  (1) `rvcFormFromCopy` set the case choice from `case.case_id` alone, so a draft that ASKED FOR A NEW CASE came
 *      back to its editor with the choice unmade, and `rvcDraftBody` wrote it back WITHOUT `newCase`: one edit of
 *      the scope and the draft had silently become one whose case publication DERIVES — the D-309 override the
 *      field exists to refuse. Section 1 drives exactly that edit, through the page's own controls.
 *  (2) `rvcGrantsHtml` said a grant bound to no case "was given for a new case". A DERIVED draft (no case named,
 *      `newCase` unset) is not a new case — over findings a published case already serves, publication makes it
 *      THAT case's next edition — and the grant row does not record which kind of no-case draft it was given for.
 *      Section 3 gives draft DD a grant, lets it die by naming the case, and reads the roster (D-619).
 *
 * THE DRAFTS, named as `bio-plane/test/reviewcopy.test.mjs` blocks 10 and 12 name them, over the same shape of
 * record: case C1 is PUBLISHED over finding LEAD, then
 *    DN — LEAD, `newCase: true`            -> the new-case sentence; its edition 1 is true of it;
 *    DD — LEAD, nothing named or asked     -> DERIVED at publication (C1's next edition, as the record stands);
 *                                            its identity UNDETERMINED here, its `edition` null (D-568);
 *    DC — LEAD2, `caseId: C1`              -> the next edition of C1; the named case keeps precedence.
 * Section 1 round-trips RN, RD and RC, the same three shapes made for it alone, so a broken round trip cannot
 * reach the drafts sections 2 and 3 read (the first control run's finding, recorded where they are made).
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (a) THE ROW'S OWN: do not read `newCase`. Section 1's DN round trip then sends no `newCase` and the plane then
 *      holds none. NEGATIVE CONTROL arm (A) is exactly that, and "ROUND TRIP KEEPS newCase" fails by name.
 *  (b) THE LIAR'S READ: call every draft naming no case a new-case draft (the answer `!case_id` gives for free,
 *      right about DN and wrong about DD). So section 1 round-trips DD too and asserts it comes back WITHOUT the
 *      field — arm (C) is that liar, and "DD KEEPS ITS DERIVATION" fails by name.
 *  (c) A SENTENCE COMPOSED HERE. So the identity on the list and on the copy is compared to the plane's own
 *      bytes, read directly, and DD's is asserted to be the DERIVATION sentence (it names no case, asks for no
 *      new one, and says publication decides) — not the new-case sentence, and never an "edition 1".
 *  (d) D-619's OWN: restore "a new case" on the grant roster. Arm (B), and "A DEAD DERIVED-DRAFT GRANT NEVER
 *      READS 'a new case'" fails by name.
 *  (e) OVER-STRICTNESS: the roster's wording is the page's to choose, so the D-619 arm asserts what the sentence
 *      must NOT claim (a new case, an edition the record does not state) and that it says the draft named no
 *      case — arm (D) re-spells it and must stay GREEN.
 *
 * WHY IT IS REAL: the plane is `bio-plane/src/index.mjs` under miniflare; the round trip goes through the page's
 * own markup (the edit button's and the save button's `onclick` strings, a field's `onchange`, read out of what
 * the page rendered and run in its context), and every expected value is read back from the plane.
 * WHAT IT CANNOT SEE: a real browser's radio control (the page's `checked` attribute is read, not a click on the
 * other radio), and nothing is live — no deploy is this item's. A draft holding BOTH a case and `newCase` is NOT
 * this suite's: CORRECTED 2026-09-25 by UI-117 — this note said the form round-trips it as its named case, which
 * was UI-106's DESIGN GAP and was the form dropping `newCase`; BOB #35 ruled it SURFACED (both shown, both kept
 * until an owner keeps one), and `review-copy-both.test.mjs` asserts that.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/review-copy-newcase.control.mjs` from the repo root — every arm ALONE,
 * each anchor matched EXACTLY ONCE, restored by cp from a per-arm pristine copy and verified by sha256 AND cmp.
 * RUN 2026-09-25 by the UI-106 worker: 6/6 AS DECLARED against app.html 3c5c1360d1176bcc… (1,633,272 B), IDENTICAL
 * after every arm by sha256 AND cmp. Baseline 17/0 GREEN.
 *   (A) UI-106's OWN — the `newCase` read dropped -> 16/1, at "ROUND TRIP KEEPS newCase"; "DD KEEPS ITS DERIVATION"
 *       and "A DEAD DERIVED-DRAFT GRANT" green.
 *   (B) D-619's OWN — "a new case" restored on the roster -> 16/1, at "A DEAD DERIVED-DRAFT GRANT NEVER READS";
 *       "ROUND TRIP KEEPS newCase" green.
 *   (C) THE LIAR'S READ — no case read back as new -> 16/1, at "DD KEEPS ITS DERIVATION"; "ROUND TRIP KEEPS
 *       newCase" GREEN — the liar is right about DN for free, which is why the DD arm exists.
 *   (D) OVER-STRICTNESS — the roster re-spelled "a draft which did not name any case" -> 17/0 GREEN.
 *   (E) OVER-STRICTNESS — the read by truthiness -> 17/0 GREEN.
 * THE FIRST RUN WAS 5/6 AND IS RECORDED, NOT SMOOTHED: (D) went RED (16/1) because the D-619 arm demanded the
 * words "no case" — a finding about that arm, now asserting what the sentence must not claim; and (A) and (C)
 * each also failed section 2's list arm (15/2, 13/4) because section 1 round-tripped the drafts section 2 reads —
 * section 1 now has its own (RN, RD, RC).
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: shared, for its side effect. */
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appScript } from "./extract.mjs";
import { until, budgetAssert } from "../../bio-plane/test/budget.mjs";
import { makePublishingProject } from "../../bio-plane/test/publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "../../bio-plane/test/adoptable-reading.mjs";
import { withSurfacingRun } from "../../bio-plane/test/surfacing-run.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
/* ssh-keygen SIGNS C1: a case is recorded as its project's (the `cases` row a draft names) only by `op=caseratify`
   over a real signature, and DC and section 3 name C1. Without the binary the suite SKIPS WHOLE and says so —
   never a partial run whose tally reads like a pass. */
if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH, and case C1 is signed and ratified");
  console.log("review-copy-newcase.test.mjs: SKIPPED — ssh-keygen not on PATH");
  process.exit(0);
}
let mf = null;
const finish = async (code) => {
  console.log(`\nreview-copy-newcase.test.mjs: ${pass} pass, ${fail} fail`);
  if (mf) await mf.dispose();
  process.exit(code ?? (fail ? 1 : 0));
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("review-copy-newcase: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
/* REC-171: questions promoted under the deploy token are surfaced inside a run it holds (the shared fixture). */
mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "ui106-instance", ADMIN_TOKEN: "adm-ui106", MEMBER_TOKEN: "mem-ui106",
              PROBE_TOKEN: "prb-ui106", DAEMON_TOKEN: "dmn-ui106", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
}));
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const must = async (what, r) => {
  if (!r || r.ok !== true) { ok(`FIXTURE: ${what}`, false, JSON.stringify(r).slice(0, 500)); await finish(1); }
  return r;
};

/* ============================================================
   0. THE GROUND — a project iris owns, case C1 published over LEAD, and the three drafts
   ============================================================ */
const enrol = async (memberId, role, capabilities) => {
  const add = await must(`memberadd ${memberId}`, await POST("op=memberadd&token=adm-ui106",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  await must(`enroll ${memberId}`, await POST("op=enroll",
    { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-106` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-106` });
  if (!lg?.token) { ok(`FIXTURE: login ${memberId}`, false, JSON.stringify(lg)); await finish(1); }
  return lg.token;
};
/* Two administrators first: the plane refuses an ordinary member until two exist (ADMINS_FIRST). */
await enrol("nadia", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "admin", ["contribute"]);
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
const dir = mkdtempSync(join(tmpdir(), "ui106-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
/* The bytes a member signs, written out rather than imported from `src/sshsig.mjs` (`caseceremony.mjs`'s D4). */
const signCase = (who, caseId, edition, docSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify-case ${caseId} ${edition} ${docSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
await must("signeradd iris", await POST("op=signeradd&token=adm-ui106",
  { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" }));
const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-ui106", owner: "iris",
  name: "PROJ-2026-1060-newcase", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
/* CORRECTED 2026-09-25 at c22-batch29 (D-563, C-86.3), never exempted: the envelope carried `title: t <id>`
   while the bytes state their own `title:`, and since D-563 the plane derives the title from the document and
   refuses an envelope that contradicts it (ENVELOPE_TITLE_DISAGREES). The envelope now carries the title the bytes
   state, falling back to the old label only where they state none. No assertion reads a title. */
const statedTitle = (text, fallback) => { const m = /^title: "(.*)"$/m.exec(text); return m ? m[1] : fallback; };
let snapSeq = 0;
const promote = async (id, text, objectType, state) => await POST("op=promote&token=adm-ui106", {
  bundleId: id, base: null,
  snapKey: `20260925T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: objectType, group: "believe-in-oakland", title: statedTitle(text, `t ${id}`),
          current_state: state, created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: [],
});
const INFO = "INFO-2026-1060-memo";
const infoMd = ["---", `id: ${INFO}`, "object_type: information", "schema: information@1",
  `title: "Info ${INFO}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inquiryMd = (id, question) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland",
  "references:", `  - target: ${INFO}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${INFO}`, "    role: supports", "    grade: D",
  "    grade_axis: connection", "    grade_source: testimony",
  "---", "", "## Question", "", question, "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
await must("promote the memo", await promote(INFO, infoMd, "information", "collected"));
const LEAD = "INQ-2026-1060-lead", LEAD2 = "INQ-2026-1060-second";
for (const [id, question] of [[LEAD, "Was the transfer authorised?"], [LEAD2, "Was notice given?"]]) {
  await must(`promote ${id}`, await promote(id, withAdoptableReading(inquiryMd(id, question)), "inquiry", "open"));
  await must(`conclude ${id}`, await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(id)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id}.`)}`
    + adoptedVersionParam()));
}
const caseArgs = (target, tag, over = {}) => ({
  project: PROJ, targets: [target], roles: { [target]: "load_bearing" },
  scope: `Whether the transfer was authorised (${tag}).`,
  statement: `This case covers the FY2024 transfer only (${tag}).`,
  excluded: [{ target: null, description: `the FY2023 memo (${tag})`, reason: "a records request is outstanding" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: `We put the claims to the City Administrator (${tag}).`,
  biasAcknowledgement: `This group holds that transfers should be adopted in public (${tag}).`,
  ...over,
});
const pub1 = await must("publish C1 over LEAD", await POST(`op=publish&token=${IRIS}`, caseArgs(LEAD, "C1")));
const C1 = pub1.caseDocument && pub1.caseDocument.case_id;
if (!C1) { ok("FIXTURE: publish C1 returned no case id", false, JSON.stringify(pub1).slice(0, 400)); await finish(1); }
await must("caseratify C1", await POST(`op=caseratify&token=${IRIS}`, { caseId: C1, edition: pub1.caseDocument.edition,
  expectedSha: pub1.caseDocument.doc_sha, sig: signCase("iris", C1, pub1.caseDocument.edition, pub1.caseDocument.doc_sha) }));

const DN = (await must("casedraft DN", await POST(`op=casedraft&token=${IRIS}`, caseArgs(LEAD, "DN", { newCase: true })))).draftId;
const DD = (await must("casedraft DD", await POST(`op=casedraft&token=${IRIS}`, caseArgs(LEAD, "DD")))).draftId;
const DC = (await must("casedraft DC", await POST(`op=casedraft&token=${IRIS}`, caseArgs(LEAD2, "DC", { caseId: C1 })))).draftId;
/* SECTION 1's OWN DRAFTS, the same three shapes, so that a broken round trip damages only the drafts it
   round-trips: the first control run shared DN and DD with sections 2 and 3, and arm (A) (the read dropped)
   then also failed section 2's list arm — DN, written back without `newCase`, had become a derived draft and
   its row carried DD's sentence. One break, two failures, one of them about a different fact. */
const RN = (await must("casedraft RN", await POST(`op=casedraft&token=${IRIS}`, caseArgs(LEAD, "RN", { newCase: true })))).draftId;
const RD = (await must("casedraft RD", await POST(`op=casedraft&token=${IRIS}`, caseArgs(LEAD, "RD")))).draftId;
const RC = (await must("casedraft RC", await POST(`op=casedraft&token=${IRIS}`, caseArgs(LEAD2, "RC", { caseId: C1 })))).draftId;
const copyOf = (d) => GET(`op=reviewcopy&draft=${encodeURIComponent(d)}&token=${IRIS}`);
const [pN, pD, pC] = [await copyOf(DN), await copyOf(DD), await copyOf(DC)];
/* THE GROUND IS THE PLANE'S, and it is asserted before anything is read off the page: a fixture that did not
   produce three different kinds of draft would let every arm below pass for a reason that is not the page. */
ok("THE PLANE: DN says `newCase` back and states edition 1; DD says no `newCase`, states NO edition (D-568) and "
   + "carries the derivation sentence; DC names C1 at its next edition",
   pN?.case?.newCase === true && pN.case.edition === 1 && pN.case.case_id === null
   && pD?.case?.newCase === false && pD.case.edition === null && pD.case.case_id === null
   && /DERIVES/.test(pD.case.identity) && !/^a new case/.test(pD.case.identity)
   && pC?.case?.case_id === C1 && pC.case.edition === 2 && pC.case.newCase === false,
   JSON.stringify([pN?.case, pD?.case, pC?.case]).slice(0, 900));

/* ============================================================
   THE PAGE — app.html in a vm, its fetch routed to the real plane; every request recorded
   ============================================================ */
const APP = appScript();
function page(token, me) {
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
  let HASH = "";
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto, Blob: class {}, IntersectionObserver: undefined,
    setInterval: () => 1, clearInterval() {}, setTimeout: (fn) => { fn(); return 1; }, clearTimeout() {},
    requestAnimationFrame: (fn) => fn(), matchMedia: () => ({ matches: false }),
    document: { querySelector: $$, querySelectorAll: () => [], addEventListener() {}, documentElement: { setAttribute() {} },
      getElementById: () => el(), hidden: false, createElement: () => el(), body: { appendChild() {} } },
    location: { protocol: "https:", href: "https://civicos.example/", get hash() { return HASH; }, set hash(v) { HASH = v; } },
    history: { pushState() {}, back() {}, replaceState() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
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
  vm.runInContext(APP + `;globalThis.__U = { PLANE, get RVC(){ return RVC; }, rvcOpen, openProjectWorkspace };`, ctx);
  const U = ctx.__U;
  U.PLANE.base = "http://x";
  if (token) { U.PLANE.token = token; U.PLANE.session = true; U.PLANE.me = me; }
  const html = (sel) => $$(sel)._html;
  /* Run a control's own handler string, as the browser would, with `this` standing for the control. */
  const run = async (code, value) => {
    const fn = vm.runInContext(`(function(){ return (${code}); })`, ctx);
    await fn.call({ value, checked: value });
  };
  return { U, WIRE, html, run };
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
const irisMe = await GET(`op=whoami&token=${IRIS}`);

/* ============================================================
   1. THE ROUND TRIP — open the copy, Edit, change one field, Save: what the draft asked for survives
   ============================================================ */
console.log("\n--- 1. a round trip through the form keeps what the draft asked for ---");
/* The member's whole act: open the draft, press Edit, change the scope, press Save. Returns the form as drawn,
   the one `op=casedraft` body the page sent, and the plane's copy afterwards, read directly. */
const roundTrip = async (draftId, newScope) => {
  const P = page(IRIS, irisMe);
  await P.U.rvcOpen(draftId);
  await drawn(`the copy of ${draftId.slice(0, 14)}… is drawn`, () => /data-rvc-copy/.test(P.html("#content")));
  const edit = handler(P.html("#content"), "onclick", /rvcEdit\(\)/);
  if (!edit) { ok(`ROUND TRIP: the copy of ${draftId} draws exactly one Edit control`, false); return {}; }
  await P.run(edit);
  const form = P.html("#content");
  const scopeCtl = handler(form, "onchange", /id="rv-scope"/);
  if (scopeCtl) await P.run(scopeCtl, newScope);
  P.WIRE.length = 0;
  const save = handler(P.html("#content"), "onclick", /rvcSave\(\)/);
  if (save) await P.run(save);
  const sent = P.WIRE.filter((w) => w.op === "casedraft");
  return { form, sent, after: await copyOf(draftId), P };
};
const checked = (form, mode) => new RegExp(`<input type="radio" name="rv-case" checked onchange="rvcFormField\\(&#39;caseMode&#39;, &#39;${mode}&#39;\\)"`)
  .test(form) || new RegExp(`<input type="radio" name="rv-case" checked onchange="rvcFormField\\('caseMode', '${mode}'\\)"`).test(form);

const rN = await roundTrip(RN, "Whether the transfer was authorised (RN, edited through the form).");
ok("ROUND TRIP KEEPS newCase: RN (DN's shape), which asked for a new case, is opened, edited and saved through the form — the form "
   + "comes back with the new-case choice MADE, the one op=casedraft the page sent carries `newCase: true`, and the "
   + "plane still holds it (still the new-case sentence, the scope changed)",
   checked(rN.form, "new") && rN.sent?.length === 1 && rN.sent[0].body?.newCase === true && rN.sent[0].body?.draft === RN
   && rN.after?.case?.newCase === true && rN.after.case.identity === pN.case.identity
   && rN.after.authored?.scope === "Whether the transfer was authorised (RN, edited through the form).",
   JSON.stringify({ newChecked: checked(rN.form, "new"), sent: rN.sent?.map((w) => w.body), after: rN.after?.case }).slice(0, 900));

const rD = await roundTrip(RD, "Whether the transfer was authorised (RD, edited through the form).");
ok("DD KEEPS ITS DERIVATION: RD (DD's shape), which named no case and asked for none, round-trips WITHOUT gaining `newCase` — "
   + "no choice is made for it, and the plane still states no edition and the derivation sentence",
   !checked(rD.form, "new") && !checked(rD.form, "next") && rD.sent?.length === 1
   && !("newCase" in (rD.sent[0].body || {})) && !("caseId" in (rD.sent[0].body || {}))
   && rD.after?.case?.newCase === false && rD.after.case.edition === null && rD.after.case.identity === pD.case.identity
   && rD.after.authored?.scope === "Whether the transfer was authorised (RD, edited through the form).",
   JSON.stringify({ sent: rD.sent?.map((w) => w.body), after: rD.after?.case }).slice(0, 900));

const rC = await roundTrip(RC, "Whether notice was given (RC, edited through the form).");
ok("THE NAMED CASE KEEPS PRECEDENCE: RC (DC's shape), naming C1, round-trips as C1's next edition and sends no `newCase`",
   checked(rC.form, "next") && rC.sent?.length === 1 && rC.sent[0].body?.caseId === C1
   && !("newCase" in (rC.sent[0].body || {})) && rC.after?.case?.case_id === C1 && rC.after.case.newCase === false,
   JSON.stringify({ sent: rC.sent?.map((w) => w.body), after: rC.after?.case }).slice(0, 600));

/* ============================================================
   2. DRAFT DD's IDENTITY — the plane's sentence, on the workspace's list and on the copy, never "edition 1"
   ============================================================ */
console.log("\n--- 2. draft DD shows the derivation sentence, as the plane states it ---");
const planeList = await GET(`op=casedrafts&project=${encodeURIComponent(PROJ)}&token=${IRIS}`);
const listed = (id) => (planeList?.drafts || []).find((d) => d.draft_id === id) || null;
ok("THE PLANE: op=casedrafts lists DN, DD and DC, DD's row with no edition and the derivation sentence",
   planeList?.ok === true && listed(DN) && listed(DD) && listed(DC)
   && listed(DD).case.edition === null && listed(DD).case.identity === pD.case.identity,
   JSON.stringify(planeList).slice(0, 600));
const W = page(IRIS, irisMe);
await W.U.openProjectWorkspace(PROJ);
const ws = W.html("#content");
/* One row per draft: the row is the `linkrow` whose visible id is this draft's. */
const rowOf = (id) => {
  const m = [...ws.matchAll(/<div class="linkrow"[^>]*>([\s\S]*?)<\/div>/g)].map((x) => x[1])
    .filter((inner) => inner.includes(`<span class="lt mono">${id}</span>`));
  return m.length === 1 ? strip(m[0]) : null;
};
const rowDD = rowOf(DD), rowDN = rowOf(DN);
ok("REACH: the workspace drew one row for DD and one for DN", rowDD !== null && rowDN !== null,
   JSON.stringify({ rowDD, rowDN, drew: (/data-project-drafts="(\d+)"/.exec(ws) || [])[1] }));
ok("DRAFT DD SHOWS THE DERIVATION SENTENCE on the workspace's list — the plane's bytes, verbatim — and not the "
   + "new-case sentence DN's row carries",
   !!rowDD && rowDD.includes(flat(pD.case.identity)) && !rowDD.includes(flat(pN.case.identity))
   && !!rowDN && rowDN.includes(flat(pN.case.identity)),
   JSON.stringify({ rowDD, want: pD.case.identity }).slice(0, 700));
ok("NEVER 'edition 1': DD's row states no edition, because the plane states none",
   !!rowDD && !/edition\s*1\b/i.test(rowDD) && !/null|undefined/.test(rowDD), rowDD);
const Pd = page(IRIS, irisMe);
await Pd.U.rvcOpen(DD);
await drawn("the copy of DD is drawn", () => /data-rvc-copy/.test(Pd.html("#content")));
const idLine = strip(((/<p class="lede" data-rvc-identity>([\s\S]*?)<\/p>/.exec(Pd.html("#content")) || [])[1]) || "");
ok("AND ON THE COPY: DD's review copy stands as the plane's derivation sentence, with no edition and no 'a new case'",
   idLine.includes(flat(pD.case.identity)) && !/edition\s*1\b/i.test(idLine) && !/^This draft stands as a new case/.test(idLine),
   idLine.slice(0, 400));

/* ============================================================
   3. D-619 — A DEAD DERIVED-DRAFT GRANT NEVER READS "a new case"
   ============================================================ */
console.log("\n--- 3. a derived draft's grant, once dead, never reads \"a new case\" ---");
const gD = await must("reviewgrant DD", await POST(`op=reviewgrant&token=${IRIS}`, { draft: DD, recipient: "D-619 reader" }));
/* The grant dies the way a real one does: DD's editor names C1, so DD now stands at C1's next edition and the
   grant, given at the (no case) key, no longer binds. */
await must("DD now names C1", await POST(`op=casedraft&token=${IRIS}`, { ...caseArgs(LEAD, "DD"), draft: DD, caseId: C1 }));
const pDead = await copyOf(DD);
const gRow = (pDead?.grants || []).find((g) => g.grant_id === gD.grant_id || g.recipient === "D-619 reader") || null;
ok("THE PLANE: DD's grant is DEAD, bound to no case, and states no edition (D-568's dead no-case row)",
   !!gRow && gRow.live === false && !gRow.revoked_at && (gRow.case_id ?? null) === null && gRow.edition === null,
   JSON.stringify(gRow));
const Pg = page(IRIS, irisMe);
await Pg.U.rvcOpen(DD);
await drawn("the copy of DD, now naming C1, is drawn with its grants", () => /data-rvc-grant=/.test(Pg.html("#content")));
const cardHtml = (/<div class="card" data-rvc-grant="[^"]*" data-live="0">([\s\S]*?)<\/div><\/div>/.exec(Pg.html("#content")) || [])[1] || "";
const card = strip(cardHtml);
/* WHAT THE SENTENCE MUST NOT CLAIM is asserted, and that it still says what the grant was given for — not ONE
   spelling of it. The first control run's over-strictness arm (D) went RED because this arm demanded the words
   "no case", and "a draft which did not name any case" is as true; that was a finding about this arm. */
ok("A DEAD DERIVED-DRAFT GRANT NEVER READS 'a new case': the roster still says what case the grant was given for, "
   + "and claims neither a new case nor an edition the record does not state",
   card.length > 20 && card.includes("D-619 reader") && /\bcase\b/i.test(card) && !/new case/i.test(card)
   && !/edition\s*(1|null|undefined)\b/i.test(card),
   card.slice(0, 500));
ok("NO CODE reaches the member on the roster", ![...card.matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)].some((m) => m[1].includes("_")), card);

await finish();
