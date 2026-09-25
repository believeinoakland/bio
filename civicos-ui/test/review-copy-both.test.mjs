/* UI-117 — A DRAFT HOLDING BOTH `caseId` AND `newCase` IS SURFACED ON THE REVIEW-COPY FORM: never refused, never
 * narrowed, and never written back without one of the two unless an owner kept the other.
 *
 * DESIGN: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #35's ruling of 2026-09-25 06:45Z (UI-106's
 * gap): the form loads such a draft and shows BOTH values exactly as stored, with one plain line — this draft names
 * an existing case AND a new one, and cannot be published until an owner keeps one (publication refuses the pair,
 * CASE_IDENTITY_AMBIGUOUS). Keeping one is the owner's own act, a save that clears the other field, offered with
 * neither preselected (DEC-69). The PLANE half (D-618, the edition a both-valued draft states) is not this item's:
 * this suite asserts nothing about `edition`, and renders what the plane answers.
 *
 * THE MEASURED FAILURE THIS MOVES: `rvcFormFromCopy` read `case.case_id` first and never looked at `newCase` once a
 * case was named, so a both-valued draft came back to its editor as "the next edition of <case>", and one edit of
 * the scope wrote it back WITHOUT `newCase` — the form rewriting the record, silently.
 *
 * THE DRAFTS — case C1 is PUBLISHED over finding LEAD, then, each round-tripped by one arm alone:
 *    DB  — LEAD2, `caseId: C1` AND `newCase: true`  -> saved with no choice made: BOTH survive;
 *    DE  — the same shape                            -> "keep the existing case": caseId stays, newCase is cleared;
 *    DK  — the same shape                            -> "keep the new case": newCase stays, caseId is cleared;
 *    DS  — LEAD2, `caseId: C1` alone                 -> the ordinary form, with no both-line (over-strictness).
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (a) THE ROW'S OWN: read the named case first and drop `newCase` (the code before this item). "ROUND TRIP KEEPS
 *      BOTH" then reads `newCase` gone — NEGATIVE CONTROL arm (A).
 *  (b) PRESELECT a choice (the named case, the old precedence): "NEITHER CHOICE IS PRESELECTED" fails — arm (B).
 *  (c) A KEEP that does not clear the other field: "KEEP THE EXISTING CASE" fails, reading `newCase` still held —
 *      arm (C).
 *  (d) OVER-STRICTNESS: the plain line is the page's to word; the suite asserts what it must SAY (the case, that a
 *      new one is also asked for, that it cannot be published until one is kept) — arm (D) re-spells it, GREEN.
 *
 * WHY IT IS REAL: the plane is `bio-plane/src/index.mjs` under miniflare; every act goes through the page's own
 * markup (the Edit and Save buttons' `onclick`, a field's or a radio's `onchange`, read out of what the page drew
 * and run in its context), and every expected value is read back from the plane.
 * WHAT IT CANNOT SEE: a real browser's radio control (the `checked` attribute is read; the choice is made by running
 * the radio's own `onchange`), and nothing is live — no deploy is this item's.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/review-copy-both.control.mjs` from the repo root — every arm ALONE, each
 * anchor matched EXACTLY ONCE, restored by cp from a per-arm pristine copy and verified by sha256 AND cmp.
 * RUN 2026-09-25 by the UI-117 worker: 5/5 AS DECLARED against app.html ac95feaa67ff1b49… (1,724,650 B), IDENTICAL
 * after every arm by sha256 AND cmp. Baseline 13/0 GREEN.
 *   (A) THE ROW'S OWN — the silent drop restored -> 9/4, at "ROUND TRIP KEEPS BOTH" (its detail reads `newCase GONE`),
 *       with the three arms that read the both-block (it is not drawn); "A SINGLE-CASE DRAFT" green.
 *   (B) the existing case preselected -> 12/1, at "NEITHER CHOICE IS PRESELECTED"; "ROUND TRIP KEEPS BOTH" green.
 *   (C) a keep that does not clear -> 12/1, at "KEEP THE EXISTING CASE"; both round-trip arms green.
 *   (D) OVER-STRICTNESS — the line re-spelled -> 13/0 GREEN.
 * UI-106's control (`review-copy-newcase.control.mjs`) re-run over the same file: 6/6 AS DECLARED.
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
  console.log("review-copy-both.test.mjs: SKIPPED — ssh-keygen not on PATH");
  process.exit(0);
}
let mf = null;
const finish = async (code) => {
  console.log(`\nreview-copy-both.test.mjs: ${pass} pass, ${fail} fail`);
  if (mf) await mf.dispose();
  process.exit(code ?? (fail ? 1 : 0));
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("review-copy-both: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
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
  bindings: { INSTANCE_NAME: "ui117-instance", ADMIN_TOKEN: "adm-ui117", MEMBER_TOKEN: "mem-ui117",
              PROBE_TOKEN: "prb-ui117", DAEMON_TOKEN: "dmn-ui117", VERSION: "test",
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
  const add = await must(`memberadd ${memberId}`, await POST("op=memberadd&token=adm-ui117",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  await must(`enroll ${memberId}`, await POST("op=enroll",
    { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-117` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-117` });
  if (!lg?.token) { ok(`FIXTURE: login ${memberId}`, false, JSON.stringify(lg)); await finish(1); }
  return lg.token;
};
/* Two administrators first: the plane refuses an ordinary member until two exist (ADMINS_FIRST). */
await enrol("nadia", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "admin", ["contribute"]);
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
const dir = mkdtempSync(join(tmpdir(), "ui117-"));
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
await must("signeradd iris", await POST("op=signeradd&token=adm-ui117",
  { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" }));
const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-ui117", owner: "iris",
  name: "PROJ-2026-1170-both", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
/* CORRECTED 2026-09-25 at c22-batch29 (D-563, C-86.3), never exempted: the envelope carried `title: t <id>`
   while the bytes state their own `title:`, and since D-563 the plane derives the title from the document and
   refuses an envelope that contradicts it (ENVELOPE_TITLE_DISAGREES). The envelope now carries the title the bytes
   state, falling back to the old label only where they state none. No assertion reads a title. */
const statedTitle = (text, fallback) => { const m = /^title: "(.*)"$/m.exec(text); return m ? m[1] : fallback; };
let snapSeq = 0;
const promote = async (id, text, objectType, state) => await POST("op=promote&token=adm-ui117", {
  bundleId: id, base: null,
  snapKey: `20260925T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: objectType, group: "believe-in-oakland", title: statedTitle(text, `t ${id}`),
          current_state: state, created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: [],
});
const INFO = "INFO-2026-1170-memo";
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
const LEAD = "INQ-2026-1170-lead", LEAD2 = "INQ-2026-1170-second";
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


/* THE FOUR DRAFTS, one per arm, so a broken round trip damages only the draft it round-trips (UI-106's first
   control run's finding, where one break failed two arms over one shared draft). `op=casedraft` STORES the pair:
   it is refused at publication, not at drafting, which is the ground this item stands on. */
const BOTH = { caseId: null, newCase: true };
const mk = async (tag, over) => (await must(`casedraft ${tag}`, await POST(`op=casedraft&token=${IRIS}`, caseArgs(LEAD2, tag, over)))).draftId;
const DB = await mk("DB", { ...BOTH, caseId: C1 });
const DE = await mk("DE", { ...BOTH, caseId: C1 });
const DK = await mk("DK", { ...BOTH, caseId: C1 });
const DS = await mk("DS", { caseId: C1 });
const copyOf = (d) => GET(`op=reviewcopy&draft=${encodeURIComponent(d)}&token=${IRIS}`);
const [pB, pE, pK, pS] = [await copyOf(DB), await copyOf(DE), await copyOf(DK), await copyOf(DS)];
/* THE GROUND IS THE PLANE'S: three drafts that say BOTH back, one that says only C1. Without it, every arm below
   could pass for a reason that is not the page. */
ok("THE PLANE: DB, DE and DK each say BOTH back — `case_id` C1 AND `newCase` true — and DS says C1 alone",
   [pB, pE, pK].every((p) => p?.case?.case_id === C1 && p.case.newCase === true)
   && pS?.case?.case_id === C1 && pS.case.newCase === false,
   JSON.stringify([pB?.case, pE?.case, pK?.case, pS?.case]).slice(0, 900));
ok("THE PLANE REFUSES THE PAIR AT PUBLICATION (the reason the form must never pick one silently)",
   (await POST(`op=publish&token=${IRIS}`, caseArgs(LEAD2, "PAIR", { ...BOTH, caseId: C1 })))?.reason === "CASE_IDENTITY_AMBIGUOUS");

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

/* The member's whole act: open the draft, press Edit, change the scope, make the choice `mode` names by running
   that radio's OWN onchange (or none), press Save. Returns the form as drawn, the one `op=casedraft` body the page
   sent, and the plane's copy afterwards, read directly. */
const radio = (form, mode) => handler(form, "onchange", new RegExp(`name="rv-case"[^>]*caseMode', '${mode}'`));
const act = async (draftId, tag, mode) => {
  const P = page(IRIS, irisMe);
  await P.U.rvcOpen(draftId);
  await drawn(`the copy of ${tag} is drawn`, () => /data-rvc-copy/.test(P.html("#content")));
  const edit = handler(P.html("#content"), "onclick", /rvcEdit\(\)/);
  if (!edit) { ok(`REACH: the copy of ${tag} draws exactly one Edit control`, false); return {}; }
  await P.run(edit);
  const form = P.html("#content");
  const scopeCtl = handler(form, "onchange", /id="rv-scope"/);
  if (scopeCtl) await P.run(scopeCtl, `Whether notice was given (${tag}, edited through the form).`);
  let chose = null;
  if (mode) { chose = radio(form, mode); if (chose) await P.run(chose); }
  P.WIRE.length = 0;
  const save = handler(P.html("#content"), "onclick", /rvcSave\(\)/);
  if (save) await P.run(save);
  const sent = P.WIRE.filter((w) => w.op === "casedraft");
  return { form, sent, chose, after: await copyOf(draftId) };
};
const isChecked = (form, mode) => new RegExp(`<input type="radio" name="rv-case" checked onchange="rvcFormField\\(&#39;caseMode&#39;, &#39;${mode}&#39;\\)"`)
  .test(form) || new RegExp(`<input type="radio" name="rv-case" checked onchange="rvcFormField\\('caseMode', '${mode}'\\)"`).test(form);
const both = (form) => (/<div class="intent-box" data-rvc-both>([\s\S]*?)<\/div>\s*<h2/.exec(form) || [])[1] || "";
const showsBoth = (form) => {
  const b = both(form);
  const line = strip((/<p[^>]*data-rvc-both-line>([\s\S]*?)<\/p>/.exec(b) || [])[1] || "");
  return { b, line, text: strip(b) };
};

/* ============================================================
   1. LOAD, SHOW BOTH, AND SAVE WITHOUT A CHOICE: both survive
   ============================================================ */
console.log("\n--- 1. a both-valued draft loads, shows both, and a save without a choice keeps both ---");
const rB = await act(DB, "DB", null);
const sB = showsBoth(rB.form || "");
ok("THE FORM LOADS IT AND SHOWS BOTH VALUES: the case it names, C1, exactly as stored, and that a new case is asked for",
   !!sB.b && sB.b.includes(`data-rvc-both-case>${C1}<`) && /data-rvc-both-new>/.test(sB.b) && /new case/i.test(sB.text),
   sB.text.slice(0, 600) || String(rB.form || "").slice(0, 400));
ok("ONE PLAIN LINE: it names an existing case AND a new one, and says it cannot be published until one is kept — "
   + "and no refusal CODE reaches the member",
   /exist/i.test(sB.line) && /new/i.test(sB.line) && /(cannot|can't|can not) be published/i.test(sB.line)
   && /\bkeep/i.test(sB.line) && !/[A-Z]{3,}_[A-Z_]{3,}/.test(rB.form || ""),
   sB.line || "(no line)");
ok("NEITHER CHOICE IS PRESELECTED: both keep-choices are drawn and neither is checked (DEC-69)",
   !!radio(rB.form || "", "next") && !!radio(rB.form || "", "new")
   && !isChecked(rB.form || "", "next") && !isChecked(rB.form || "", "new"),
   JSON.stringify({ next: isChecked(rB.form || "", "next"), new: isChecked(rB.form || "", "new") }));
ok("ROUND TRIP KEEPS BOTH, newCase INCLUDED: DB edited and saved with no choice made — the one op=casedraft the page sent "
   + "carries `caseId` C1 AND `newCase: true`, and the plane still holds both, the scope changed",
   rB.sent?.length === 1 && rB.sent[0].body?.draft === DB && rB.sent[0].body?.caseId === C1 && rB.sent[0].body?.newCase === true
   && rB.after?.case?.case_id === C1 && rB.after.case.newCase === true
   && rB.after.authored?.scope === "Whether notice was given (DB, edited through the form).",
   `newCase ${rB.after?.case?.newCase === true ? "held" : "GONE"} · ` + JSON.stringify({ sent: rB.sent?.map((w) => w.body && { caseId: w.body.caseId, newCase: w.body.newCase }), after: rB.after?.case }).slice(0, 700));

/* ============================================================
   2. KEEPING ONE IS A SAVE THAT CLEARS THE OTHER
   ============================================================ */
console.log("\n--- 2. keeping one is the owner's act, a save that clears the other ---");
const rE = await act(DE, "DE", "next");
ok("KEEP THE EXISTING CASE: DE, the existing case kept — the page sends `caseId` C1 and no `newCase`, and the plane "
   + "holds C1 alone",
   !!rE.chose && rE.sent?.length === 1 && rE.sent[0].body?.caseId === C1 && !("newCase" in (rE.sent[0].body || {}))
   && rE.after?.case?.case_id === C1 && rE.after.case.newCase === false,
   JSON.stringify({ chose: !!rE.chose, sent: rE.sent?.map((w) => w.body && { caseId: w.body.caseId, newCase: w.body.newCase }), after: rE.after?.case }).slice(0, 700));
const rK = await act(DK, "DK", "new");
ok("KEEP THE NEW CASE: DK, the new case kept — the page sends `newCase: true` and no `caseId`, and the plane holds "
   + "the new case alone",
   !!rK.chose && rK.sent?.length === 1 && rK.sent[0].body?.newCase === true && !("caseId" in (rK.sent[0].body || {}))
   && rK.after?.case?.case_id === null && rK.after.case.newCase === true,
   JSON.stringify({ chose: !!rK.chose, sent: rK.sent?.map((w) => w.body && { caseId: w.body.caseId, newCase: w.body.newCase }), after: rK.after?.case }).slice(0, 700));

/* ============================================================
   3. OVER-STRICTNESS: a draft naming ONE case gets the ordinary form, and round-trips as it did
   ============================================================ */
console.log("\n--- 3. a single-case draft is untouched ---");
const rS = await act(DS, "DS", null);
ok("A SINGLE-CASE DRAFT IS UNTOUCHED: DS, naming C1 alone, draws no both-line, its next-edition choice made, and "
   + "round-trips as C1 with no `newCase`",
   !/data-rvc-both/.test(rS.form || "") && isChecked(rS.form || "", "next")
   && rS.sent?.length === 1 && rS.sent[0].body?.caseId === C1 && !("newCase" in (rS.sent[0].body || {}))
   && rS.after?.case?.case_id === C1 && rS.after.case.newCase === false,
   JSON.stringify({ sent: rS.sent?.map((w) => w.body), after: rS.after?.case }).slice(0, 600));

await finish();
