/* UI-103 — THE PUBLISHED CASE PAGE NAMES THE WRITER OF THE EXCLUSION STATEMENT APART FROM THE
 * CASE'S PUBLISHER.
 *
 * DESIGN: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 (BOB #32 ruled (b), 2026-09-24:
 * *two acts, two names, never conflated*; BOB #33 ruled REC-212's three determinations the same day),
 * with UI-89's three-state render (`statement-ack.test.mjs` §3) as the precedent this suite follows.
 * The PLANE half is REC-212's (IC-272) and is NOT changed by this item. The delegation is `CLAIMS.md`'s
 * "DELEGATION 2026-09-24 RECORD (REC-212) -> UI", which names both sites and what UI owes.
 *
 * THE MEASURED FAILURE THIS MOVES. `civicos-ui/app.html` page 2 of the published case read
 * `Written by ${c.completeness.author}` under a note promising *"the member who wrote it"*. That names
 * the member who PREPARED AND PUBLISHED the case. Where an editor wrote the sentence and an owner
 * published it — the ordinary shape of a project that reviews its own work — a credential-free page
 * told a stranger the publisher wrote a sentence they did not write.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (a) THE ROW'S OWN: render `author` as the writer again. Section 1 drives a case KAI wrote and IRIS
 *      published and asserts each is named FOR ITS ACT and that the page never says iris wrote it.
 *      NEGATIVE CONTROL arm (A) is exactly that restoration, and the two-acts rows fail BY NAME.
 *  (b) A PAGE THAT NAMES A WRITER IT DOES NOT HAVE. Section 3 drives two drafts DISAGREEING about who
 *      wrote one sentence — the plane's stated UNDETERMINED — and asserts no name is rendered as the
 *      writer, least of all the publisher's.
 *  (c) A SURFACE THAT WRITES THE SENTENCE ITSELF. The plane commits ONE sentence,
 *      `completeness.statement_by_stated`, from the signed bytes; DEC-8 forbids paraphrasing it. Every
 *      section reads that sentence DIRECTLY FROM `op=publishedcase` and asserts the page carries THAT,
 *      never a wording this surface chose.
 *  (d) TWO STATES RENDERED AS ONE. Section 4 renders all three states and asserts three different
 *      pages: a NAME; `null` with the plane's sentence (which is how the plane's own two nulls are told
 *      apart); and NO KEY, which this surface can meet and the plane cannot produce any more.
 *  (e) AN ACT WITH NO CALL SITE (this area has shipped one three times — `CIVICOS_UI_STATE.md`
 *      v50/v45/v76). Sections 1-3 render through `pubOpen`, the page's own entry point, over a REAL
 *      `op=publishedcase` answer fetched by the page itself, holding NO credential.
 *
 * WHY IT IS REAL: the plane is `bio-plane/src/index.mjs` under miniflare. Every case here is drafted,
 * published, SIGNED and ratified through the control plane, and the page reads it back through
 * `op=publishedcase` as a stranger — no token, no session. The three live answers are the plane's own
 * three of four (`Store#statementWriter`): a draft's stamp, the publisher's own act, and two drafts
 * disagreeing.
 *
 * WHAT IT CANNOT SEE, STATED RATHER THAN SMOOTHED:
 *  - THE FOURTH STATE CANNOT BE DRIVEN LIVE. A published record with NO `statement_by_stated` key is one
 *    committed before REC-212; `ratifyCaseDocument` now writes the key unconditionally, so no act on a
 *    store this code wrote can produce one. Section 4 renders it from an answer built here and says so.
 *    It is not a fixture standing in for a live arm: `publishedcase.test.mjs` renders the SAME state over
 *    its own pre-rule-13 fixtures and asserts the page says nothing about the writer.
 *  - `#statementWriter`'s two OTHER undetermined answers are not reached: `drafts_unbounded` needs more
 *    than 500 drafts of one project, and `draft_unreadable` needs a `case_drafts.params` no parser can
 *    read, which no op writes. Both are the PLANE's own gap and `rec212-statement-writer.test.mjs` says
 *    the same of them; this suite adds nothing there and claims nothing about them.
 *  - THE RESIDUE RULE 13 ITSELF STATES is not tested and cannot be: a publisher who RETYPES a sentence an
 *    editor wrote in a draft SINCE EDITED is credited with it, because no record keeps a draft's
 *    statement history. The page prints the plane's provenance sentence beside the name precisely so a
 *    reader weighs it; this suite asserts the sentence is carried, not that the name is right.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/statement-writer.control.mjs` from the repo root — seven arms,
 * each ALONE, each anchor matched EXACTLY ONCE, restored by `cp` from a UNIQUELY-NAMED per-arm pristine copy
 * in a pen OUTSIDE the worktree and verified by sha256 AND `cmp`, with a byte count printed and floored.
 * RUN 2026-09-24 by the UI-103 worker against `civicos-ui/app.html` a18b03cd335e5e6c… (1,584,484 B),
 * IDENTICAL by sha256 and `cmp` after every arm; driver exit 0, 7/7 AS DECLARED, baseline 25/0 GREEN with
 * `publishedcase.test.mjs` 245/245:
 *   (A) THE ROW'S OWN — the writer read off `completeness.author` again -> RED 19/6, naming all six declared
 *       rows and sparing section 2's one-member rows and "NOT A CASE, NO SENTENCE".
 *   (B) the plane's STATED undetermined rendered as the silent record   -> RED 21/4.
 *   (C) the header's writer entry back-filled from the publisher        -> RED 22/3, and `publishedcase`
 *       244/245 — the second suite catching the same rule over its pre-rule-13 fixture.
 *   (D) the block with no call site                                     -> RED 0/1 at the budgeted wait,
 *       the suite ending there by design (M0-107), and `publishedcase` 243/245.
 *   (E) the plane's sentence paraphrased (DEC-8)                        -> RED 22/3.
 *   (F) OVER-STRICTNESS, the heading and lede re-worded                 -> 25/0 GREEN, `publishedcase` 245/245.
 * FIRST RUN: 6/7 AS DECLARED. Arm (A) came back RED at the right count with ONE DECLARED ROW GREEN and one
 * undeclared row in its place — a finding about this SUITE, corrected at the row with its measurement and
 * re-run (see the note on section 3's "AND IT IS NOT READ OFF THE PUBLISHER" and on arm (A) itself).
 */
import "../../bio-plane/test/stdio.mjs";
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
import { makePublishingProject, allLoadBearing } from "../../bio-plane/test/publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "../../bio-plane/test/adoptable-reading.mjs";
import { withSurfacingRun } from "../../bio-plane/test/surfacing-run.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};

/* ssh-keygen SIGNS EVERY CASE HERE: a case document is committed to the published projection only by
   `op=caseratify` over a real signature, and `completeness.statement_by` is committed THERE. Without the
   binary there is no published case to render, so the suite SKIPS WHOLE and says so — never a partial
   run whose tally reads like a pass. */
if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH, and every case here is signed and ratified");
  console.log("statement-writer.test.mjs: SKIPPED — ssh-keygen not on PATH");
  process.exit(0);
}

let mf = null;
const finish = async (code) => {
  console.log(`\nstatement-writer.test.mjs: ${pass} pass, ${fail} fail`);
  if (mf) await mf.dispose();
  process.exit(code ?? (fail ? 1 : 0));
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("statement-writer: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
/* REC-171 / INVESTIGATIVE-SESSION.md §11 item 5: a question created under a DEPLOY token is surfaced
   inside a run that token holds, or is refused C-66.1. This suite's fixtures promote inquiries with the
   admin token, so it uses the shared fixture rather than a copy of the dance (`surfacing-run.mjs`). */
mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "ui103-instance", ADMIN_TOKEN: "adm-ui103", MEMBER_TOKEN: "mem-ui103",
              PROBE_TOKEN: "prb-ui103", DAEMON_TOKEN: "dmn-ui103", VERSION: "test",
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
   0. THE GROUND — a project of two, its keys, and a concluded finding per case
   ============================================================ */
const dir = mkdtempSync(join(tmpdir(), "ui103-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
/* THE BYTES A MEMBER SIGNS, WRITTEN OUT rather than imported from `src/sshsig.mjs` — `caseceremony.mjs`'s
   own D4 discipline: an expectation taken from the thing under test agrees with it for free. */
const signCase = (who, caseId, edition, docSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify-case ${caseId} ${edition} ${docSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, role, capabilities) => {
  const add = await must(`memberadd ${memberId}`, await POST("op=memberadd&token=adm-ui103",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  await must(`enroll ${memberId}`, await POST("op=enroll",
    { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-103` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-103` });
  if (!lg?.token) { ok(`FIXTURE: login ${memberId}`, false, JSON.stringify(lg)); await finish(1); }
  return lg.token;
};
/* TWO ADMINISTRATORS FIRST: the plane refuses an ordinary member until two exist (ADMINS_FIRST —
   administrative access is shared so that losing one person does not lose the group). */
await enrol("nadia", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "admin", ["contribute"]);
/* IRIS owns the project, publishes and signs. KAI is a JOINED participant who EDITS: kai writes the
   exclusion statement in a draft and never publishes anything. That asymmetry IS the subject. */
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
const KAI = await enrol("kai", "member", ["contribute"]);
await must("signeradd iris", await POST("op=signeradd&token=adm-ui103",
  { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" }));

const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-ui103", owner: "iris",
  name: "PROJ-2026-1030-two-acts", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
{
  const inv = await GET(`op=projectinvite&token=${IRIS}&projectId=${encodeURIComponent(PROJ)}&handle=kai`);
  if (!inv?.ok) { ok("FIXTURE: projectinvite kai", false, JSON.stringify(inv)); await finish(1); }
  const jn = await GET(`op=projectjoin&token=${KAI}&projectId=${encodeURIComponent(PROJ)}`);
  if (jn?.state !== "joined") { ok("FIXTURE: projectjoin kai", false, JSON.stringify(jn)); await finish(1); }
}

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
let snapSeq = 0;
const promote = async (id, text, objectType, state) => await POST("op=promote&token=adm-ui103", {
  bundleId: id, base: null,
  snapKey: `20260924T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: objectType, group: "believe-in-oakland", title: `t ${id}`,
          current_state: state, created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: [],
});
const INFO = "INFO-2026-1030-memo";
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
const Q_TWO = "INQ-2026-1030-two", Q_ONE = "INQ-2026-1030-one", Q_UNDET = "INQ-2026-1030-undet";
for (const [id, question] of [[Q_TWO, "Was the transfer authorised?"],
                              [Q_ONE, "Was notice given?"],
                              [Q_UNDET, "Was the auditor told?"]]) {
  await must(`promote ${id}`, await promote(id, withAdoptableReading(inquiryMd(id, question)), "inquiry", "open"));
  await must(`conclude ${id}`, await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(id)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id}.`)}`
    + adoptedVersionParam()));
}

const caseArgs = (target, tag, statement) => ({
  project: PROJ, targets: [target], roles: { [target]: "load_bearing" },
  scope: `Whether the transfer was authorised (${tag}).`,
  statement,
  excluded: [{ target: null, description: `the FY2023 memo (${tag})`, reason: "a records request is outstanding" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: `We put the claims to the City Administrator (${tag}).`,
  biasAcknowledgement: `This group holds that transfers should be adopted in public (${tag}).`,
});
/* PUBLISH AND SIGN. The publisher is always IRIS (she owns the project and holds the only signing key);
   who WROTE the statement is decided by the drafts, which is the whole point. */
const publishAndRatify = async (target, tag, statement) => {
  const p = await must(`publish ${tag}`, await POST(`op=publish&token=${IRIS}`, caseArgs(target, tag, statement)));
  const d = p.caseDocument;
  if (!d || !d.doc_sha) { ok(`FIXTURE: publish ${tag} returned no case document`, false, JSON.stringify(p).slice(0, 400)); await finish(1); }
  await must(`caseratify ${tag}`, await POST(`op=caseratify&token=${IRIS}`,
    { caseId: d.case_id, edition: d.edition, expectedSha: d.doc_sha,
      sig: signCase("iris", d.case_id, d.edition, d.doc_sha) }));
  return d.case_id;
};

/* ============================================================
   THE PAGE — the member application, driven as a STRANGER holding nothing
   ============================================================ */
const APP = appScript();
function page() {
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
    fetch: async (u, opts) => mf.dispatchFetch(new URL(u, "http://x").toString(), opts) };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(APP + `;globalThis.__U = { PLANE, pubOpen, pubStatementWriterHtml, pubCaseAuthors };`, ctx);
  const U = ctx.__U;
  U.PLANE.base = "http://x";
  return { U, html: (sel) => $$(sel)._html };
}
const WAIT_MS = 8000;
const tb = (label, got, want) => ok(label, JSON.stringify(got) === JSON.stringify(want), JSON.stringify(got));
const drawn = async (name, pred) => {
  const w = await until(() => { try { return !!pred(); } catch (_) { return false; } }, WAIT_MS);
  if (!budgetAssert(tb, name, w, WAIT_MS, "every later assertion of this suite, each reading a page this wait did not see drawn"))
    await finish();
};
const unesc = (s) => String(s).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const strip = (h) => unesc(String(h).replace(/<[^>]*>/g, " ")).replace(/&middot;/g, "·").replace(/&mdash;/g, "—")
  .replace(/&rsquo;/g, "’").replace(/\s+/g, " ").trim();
const flat = (s) => String(s).replace(/\s+/g, " ").trim();
/* A machine code that reached the page — the same matcher `statement-ack.test.mjs` and
   `review-copy.test.mjs` use, on purpose: one spelling of "machine vocabulary" across the area. */
const shouty = (t) => [...String(t).matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)].map((m) => m[1]).filter((c) => c.includes("_"));
/* OPEN A PUBLISHED CASE AS A STRANGER and return what the page drew, with the plane's own answer to the
   SAME question beside it — so every assertion below compares the page against the record and never
   against a sentence typed here. */
const openCase = async (caseId, what) => {
  const P = page();
  await P.U.pubOpen(caseId);
  await drawn(`${what}: the published case page is drawn for a caller holding nothing`,
              () => /data-pub-writer=/.test(P.html("#pub-body")));
  const html = P.html("#pub-body");
  const wire = await GET(`op=publishedcase&id=${encodeURIComponent(caseId)}`);
  return { P, html, t: strip(html), cm: (wire && wire.completeness) || null, wire };
};

console.log("\n--- UI-103: two acts, two names, on the published case page ---");

/* ============================================================
   1. TWO NAMES — kai wrote the statement in a draft; iris published the case
   ============================================================ */
console.log("\n--- 1. an editor wrote it and an owner published it: each named for its own act ---");
const STMT_TWO = "This case covers the FY2024 transfer only; the FY2023 memo is out of it.";
await must("kai drafts the statement", await POST(`op=casedraft&token=${KAI}`,
  { ...caseArgs(Q_TWO, "two", STMT_TWO), roles: allLoadBearing({ targets: [Q_TWO] }) }));
const CASE_TWO = await publishAndRatify(Q_TWO, "two", STMT_TWO);
{
  const { html, t, cm } = await openCase(CASE_TWO, "two names");
  ok("LIVE, THROUGH THE OP: the plane serves BOTH names off the signed bytes — kai wrote the statement, "
   + "iris prepared and published the case — to a caller with no credential",
     cm && cm.statement_by === "kai" && cm.author === "iris" && typeof cm.statement_by_stated === "string",
     JSON.stringify(cm && { by: cm.statement_by, author: cm.author }));
  ok("TWO ACTS, TWO NAMES: the page names kai as the writer and iris as the publisher, each for its own act",
     /data-pub-writer="named"/.test(html) && /kai<\/b> wrote it/.test(html)
     && /iris prepared and published this case/.test(t), t.slice(t.indexOf("Who wrote this"), t.indexOf("Who wrote this") + 300));
  ok("THE MEASURED FAILURE IS GONE: the page never says iris wrote the statement, and the sentence that "
   + "said so — \"Written by <the publisher>\" — is not on it",
     !/Written by/.test(t) && !/iris<\/b> wrote it/.test(html) && !/iris wrote this case's exclusion statement/.test(t),
     t.slice(0, 200));
  ok("THE PLANE'S OWN SENTENCE, VERBATIM (DEC-8): the page carries `statement_by_stated` exactly as the "
   + "plane committed it from the signed bytes, and composes no wording of its own for it",
     t.includes(flat(cm.statement_by_stated)) && flat(cm.statement_by_stated).includes("two acts, two names"),
     flat(cm && cm.statement_by_stated).slice(0, 240));
  ok("THE DATE IS THE PUBLISHING ACT'S, and is printed against the act it measures — `completeness.at` is "
   + "stamped at op=publish beside `author`, and dated the WRITING on the sentence this item replaced",
     new RegExp(`iris prepared and published this case, on ${cm.at.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(t),
     JSON.stringify({ at: cm.at, saw: t.slice(t.indexOf("prepared and published this case"), t.indexOf("prepared and published this case") + 120) }));
  ok("THE HEADER LISTS BOTH ACTS TOO, and never merges them: the bound block a reader takes with a paste "
   + "names the publishing and the writing separately (DEC-31's in-band rule)",
     /iris \(prepared and published the case\)/.test(t)
     && /kai \(wrote the statement of what this case leaves out\)/.test(t),
     t.slice(t.indexOf("Author "), t.indexOf("Author ") + 200));
  ok("NO MACHINE VOCABULARY reaches the page these two names are drawn on",
     shouty(t).length === 0, JSON.stringify(shouty(t)));
}

/* ============================================================
   2. ONE MEMBER, TWO ACTS — a sentence no draft holds arrived in the publish call
   ============================================================ */
console.log("\n--- 2. one member did both, and that is a fact about this case rather than the way it works ---");
const STMT_ONE = "This case covers the notice period only; the award itself is out of it.";
const CASE_ONE = await publishAndRatify(Q_ONE, "one", STMT_ONE);
{
  const { html, t, cm } = await openCase(CASE_ONE, "one member");
  ok("LIVE: no draft of this project holds this sentence, so the plane names the PUBLISHER as its writer "
   + "— a measurement of this act, not a guess (BOB #33 determination 1)",
     cm && cm.statement_by === "iris" && cm.author === "iris", JSON.stringify(cm && { by: cm.statement_by, author: cm.author }));
  ok("ONE MEMBER, AND THE PAGE SAYS SO IN THOSE TERMS: iris is named for BOTH acts and the record's own "
   + "sentence says two acts, one member — never one act with one name",
     /data-pub-writer="named"/.test(html) && /iris<\/b> wrote it/.test(html)
     && /iris prepared and published this case/.test(t) && /two acts, one member/.test(t), t.slice(t.indexOf("Who wrote this"), t.indexOf("Who wrote this") + 320));
  ok("THE LIST DOES NOT NAME ONE MEMBER TWICE: where the writer and the publisher are the same member the "
   + "header carries ONE entry for the case's own acts, which is this list's own rule (never a merge, and "
   + "never a duplicate either)",
     (t.match(/iris \(prepared and published the case\)/g) || []).length >= 1
     && !/iris \(wrote the statement of what this case leaves out\)/.test(t),
     t.slice(t.indexOf("Author "), t.indexOf("Author ") + 200));
  ok("NO MACHINE VOCABULARY, one-member page", shouty(t).length === 0, JSON.stringify(shouty(t)));
}

/* ============================================================
   3. UNDETERMINED — two drafts hold the sentence and name different writers
   ============================================================ */
console.log("\n--- 3. the plane could not establish who wrote it, and the page says that rather than a name ---");
const STMT_UNDET = "This case covers the auditor's referral only; the contract file is out of it.";
await must("kai drafts the disputed statement", await POST(`op=casedraft&token=${KAI}`,
  { ...caseArgs(Q_UNDET, "undet", STMT_UNDET), roles: allLoadBearing({ targets: [Q_UNDET] }) }));
await must("iris drafts the same sentence", await POST(`op=casedraft&token=${IRIS}`,
  { ...caseArgs(Q_UNDET, "undet", STMT_UNDET), roles: allLoadBearing({ targets: [Q_UNDET] }) }));
const CASE_UNDET = await publishAndRatify(Q_UNDET, "undet", STMT_UNDET);
{
  const { html, t, cm } = await openCase(CASE_UNDET, "undetermined");
  ok("LIVE: two drafts at this case identity hold the sentence and name different members, so the plane "
   + "states UNDETERMINED as null and never back-fills it from the publisher",
     cm && cm.statement_by === null && cm.author === "iris" && typeof cm.statement_by_stated === "string",
     JSON.stringify(cm && { by: cm.statement_by, author: cm.author }));
  ok("UNDETERMINED IS STATED, NOT A NAME: the page renders the plane's own sentence verbatim and renders "
   + "NO writer — CLAUDE.md §4, undetermined is first-class and must be STATED",
     /data-pub-writer="undetermined"/.test(html) && t.includes(flat(cm.statement_by_stated))
     && !/wrote it\./.test(t), t.slice(t.indexOf("Who wrote this"), t.indexOf("Who wrote this") + 360));
  /* CORRECTED AT ITS OWN CONTROL'S FIRST RUN, and recorded rather than smoothed: arm (A) — the writer read
     off `completeness.author` again, this item's own defect — left this row GREEN. It read the PLANE's
     sentence (still rendered verbatim, and still saying the name is not read off her) and the HEADER's list
     (a different function the arm does not touch), and never asked what THIS page rendered as the writer. So
     the one row whose words are "it is not read off the publisher" could not see the publisher rendered as
     the writer. The page's own render is now asserted too, and the arm was re-run against the corrected
     instrument: it fires. */
  ok("AND IT IS NOT READ OFF THE PUBLISHER: iris is still named for the act she DID perform, the page renders "
   + "no writer at all, and the record's sentence says in its own words that the writer is not read off her",
     /iris prepared and published this case/.test(t) && /NOT read off iris/.test(t)
     && !/iris<\/b> wrote it/.test(html)
     && !/iris \(wrote the statement of what this case leaves out\)/.test(t), t.slice(t.indexOf("Who wrote this"), t.indexOf("Who wrote this") + 360));
  ok("NO MACHINE VOCABULARY, undetermined page", shouty(t).length === 0, JSON.stringify(shouty(t)));
}

/* ============================================================
   4. THE THREE STATES ARE THREE — and the fourth is this surface's, not the plane's
   ============================================================ */
console.log("\n--- 4. a name, a stated undetermined, and a record that never held the key: three pages ---");
{
  const P = page();
  const base = { caseId: "CASE-2026-1030-oversight", edition: 1,
    completeness: { statement: STMT_TWO, author: "iris", at: NOW, subject_position: "sought_and_answered",
                    subject_justification: "", excluded: "[]" } };
  const named = P.U.pubStatementWriterHtml({ ...base,
    completeness: { ...base.completeness, statement_by: "kai",
                    statement_by_stated: "kai wrote this case's exclusion statement; iris prepared and published the case — two acts, two names (BIO_Publication §3 rule 13)." } });
  const stated = P.U.pubStatementWriterHtml({ ...base,
    completeness: { ...base.completeness, statement_by: null,
                    statement_by_stated: "UNDETERMINED: this case document states that who wrote its exclusion statement could not be established, and it is NOT read off iris, who prepared and published the case (BIO_Publication §3 rule 13)." } });
  /* NO KEY AT ALL. `hasOwnProperty` decides this branch, so the fixture must OMIT the key rather than set
     it to null or undefined — a distinction that is the whole point and one a spread would erase. */
  const silent = P.U.pubStatementWriterHtml(base);
  const sN = strip(named), sU = strip(stated), sS = strip(silent);
  /* PRINTED FROM THE WRITER BLOCK, not from the head of the page: the lede above it is the same in all
     three by design, so printing the first N characters would show three identical lines over three
     different facts — an instrument that cannot see its own subject. */
  const writerBlock = (h) => strip(String(h).slice(String(h).indexOf('data-pub-writer=')));
  console.log(`    a name -> ${writerBlock(named).slice(0, 200)}`);
  console.log(`    null   -> ${writerBlock(stated).slice(0, 200)}`);
  console.log(`    no key -> ${writerBlock(silent).slice(0, 200)}`);
  ok("THREE STATES, THREE PAGES: a name, a stated undetermined and a record that never held the key do "
   + "not render the same words, and no two of them collapse",
     sN !== sU && sU !== sS && sN !== sS && !!sN && !!sU && !!sS,
     JSON.stringify({ n: sN.slice(0, 80), u: sU.slice(0, 80), s: sS.slice(0, 80) }));
  ok("A NAME IS A NAME: the writer is rendered as the writer, with the record's own sentence beside it",
     /data-pub-writer="named"/.test(named) && /kai<\/b> wrote it/.test(named)
     && sN.includes("two acts, two names"), sN.slice(0, 200));
  ok("NULL IS NOT A NAME AND IS NOT NOBODY: the stated undetermined carries the plane's sentence and no "
   + "writer at all, and says the name is not read off the publisher",
     /data-pub-writer="undetermined"/.test(stated) && /NOT read off iris/.test(sU)
     && !/wrote it\./.test(sU), sU.slice(0, 220));
  ok("NO KEY IS NOT A STATED UNDETERMINED: a published record written before the two acts were told apart "
   + "says the question was never put to it — the absence of a record — and takes no name off the publisher",
     /data-pub-writer="unstated"/.test(silent) && /say nothing about who wrote it/.test(sS)
     && /not a record of iris having written the sentence/.test(sS)
     && /No name is read off the publisher here/.test(sS)
     && !/UNDETERMINED/.test(sS), sS.slice(0, 260));
  ok("THE PUBLISHING ACT IS NAMED IN ALL THREE — it is never the missing half, and its date travels with it",
     [named, stated, silent].every((h) => /data-pub-published-by="named"/.test(h)
       && strip(h).includes(`iris prepared and published this case, on ${NOW}`)));
  ok("NOT A CASE, NO SENTENCE: bytes that are not a member of any published case get NO authorship "
   + "sentence — none is invented for them, exactly as the page invents no scope for them",
     P.U.pubStatementWriterHtml({ completeness: null }) === ""
     && P.U.pubStatementWriterHtml({}) === ""
     && P.U.pubStatementWriterHtml({ caseId: null, edition: 1, completeness: base.completeness }) === "");
  ok("AND THE HEADER'S LIST FOLLOWS THE SAME RULE: a writer is listed only when the record NAMES one, so a "
   + "stated undetermined and a silent record add no name-shaped entry to a list of names",
     /kai \(wrote the statement of what this case leaves out\)/.test(P.U.pubCaseAuthors({ ...base,
        completeness: { ...base.completeness, statement_by: "kai" } }))
     && !/wrote the statement of what this case leaves out/.test(P.U.pubCaseAuthors({ ...base,
        completeness: { ...base.completeness, statement_by: null } }))
     && !/wrote the statement of what this case leaves out/.test(P.U.pubCaseAuthors(base)));
}

await finish();
