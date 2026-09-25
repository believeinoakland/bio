/* UI-121 — THE PUBLISHED CASE PAGE STATES WHICH DRAFT THE CASE WAS PREPARED IN, AND HOW ITS CASE WAS BOUND.
 *
 * DESIGN: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 — REC-217's link (BOB #33, 2026-09-24 19:14Z:
 * `op=publish` names the draft it publishes, and the case document states the link in words) and D-680's
 * `draft_case` (BOB #35, 2026-09-25 07:35Z and its ruling (a) on D-680's gap: the signed document states that
 * the case was DERIVED AT PUBLICATION, NAMED AND CONFIRMED, or a new case asked at publication, named by the
 * draft, or a new case asked by the draft). The PLANE half is D-680's and is NOT changed by this item.
 *
 * THE MEASURED GAP THIS MOVES: `op=publishedcase` serves `completeness.draft` — the draft, who named it, when,
 * and `case`, how the case was bound — committed from the signed bytes, and no page rendered any of it. A signed
 * statement no surface shows (the row's own `moves:`).
 *
 * WHAT THIS ITEM DOES NOT BUILD, stated: UI-121's scope also named the publish act sending `draft=` and the
 * refusals C-44.4 / C-44.6 rendered in their DEC-49 words. No surface calls `op=publish` (the S8 publication
 * entry's header, DEC-33), so neither has a site; routed to BOB #35 on 2026-09-25, not built here. Every
 * publication below is therefore made through the control plane by the suite, as the operator's route does.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (a) THE ROW'S OWN: drop `draft_case` from the page — show the link and not how the case was bound. Every
 *      live section asserts the binding sentence by its own words. NEGATIVE CONTROL arm (A).
 *  (b) A SURFACE THAT WRITES THE SENTENCE ITSELF. Each expected phrase is written out HERE, in the plane's
 *      words as D-680's suite pins them, and the page must carry the signed document's own line VERBATIM —
 *      compared against `op=casedocument`'s `text` read here as a stranger, which is the signed bytes (the page
 *      reads it through the same op). Arm (C) paraphrases it. CORRECTED 2026-09-25 (D-712): this said
 *      `op=publishedcase` does not carry the text — true when written, because `publishedCase()` never named the
 *      `document` its state built; since D-712 it serves it, text and doc sha included. The page still quotes
 *      through `op=casedocument`, and this suite still compares against that op's read.
 *  (c) A PAGE THAT CALLS THE ABSENCE OF A RECORD A BINDING. Section 6 renders a stated link whose `case` is
 *      null (a document signed before D-680) and asserts it is stated as the absence, not as any of the five.
 *  (d) AN ACT WITH NO CALL SITE (`CIVICOS_UI_STATE.md` v50/v45/v76). Sections 1-5 render through `pubOpen`,
 *      the page's own entry point, over a REAL `op=publishedcase` answer fetched by the page itself, holding NO
 *      credential. Arm (B) removes the call.
 *
 * WHY IT IS REAL: the plane is `bio-plane/src/index.mjs` under miniflare. Every case is drafted, published with
 * `draft=`, SIGNED and ratified through the control plane, and the page reads it back as a stranger. All FIVE
 * bindings the plane can state are driven live.
 *
 * WHAT IT CANNOT SEE, STATED RATHER THAN SMOOTHED:
 *  - A LINK WITH `case` NULL CANNOT BE DRIVEN LIVE: `op=publish` writes `draft_case` on every link since D-680,
 *    so only a document signed between REC-217 and D-680 carries none. Section 6 renders it from an answer built
 *    here and says so.
 *  - THE "UNQUOTED" STATE (a stated `case` whose sentence is not in the served text) is not reachable through
 *    the plane either — `op=casedocument`'s text is the signed bytes the key was committed from; only a failed
 *    read would reach it. Section 6 renders it
 *    from a built answer, as the guard it is.
 *  - It asserts the page carries the plane's sentence, not that the plane's sentence is right: that is
 *    `bio-plane/test/rec217-draft-binding.test.mjs` block 8's.
 *  - The page does not check the text it quotes against a doc sha. CORRECTED 2026-09-25 (D-712): this said
 *    `op=publishedcase` serves none, and the same missing key made the page's signed-document line read "not
 *    signed yet" for every stranger. D-712 serves `document`; each live binding below now asserts the stranger's
 *    page names the signer and the doc sha `op=casedocument` reports. The quoted text is still not checked
 *    against that sha by the page — stated, not built here.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/draft-binding.control.mjs` from the repo root — each arm ALONE, each
 * anchor matched EXACTLY ONCE, restored from a uniquely-named per-arm pristine copy and verified by sha256 AND
 * `cmp`, the pen a `mkdtemp` outside the worktree. Five arms and a baseline: (A) the row's own — `draft_case`
 * dropped from the page; (B) the block with no call site; (C) the plane's sentence paraphrased; (D) the signed
 * text never read; (E) over-strictness, the heading and lede re-worded.
 * RUN 2026-09-25 by the UI-121 worker against `civicos-ui/app.html` 35ebc2544bff7baf… (1,638,056 B), IDENTICAL by
 * sha256 AND `cmp` after every arm; driver exit 0, 6/6 AS DECLARED: BASELINE GREEN 38/0 · (A) RED 31/7 — the five
 * "HOW THE CASE WAS BOUND" rows plus section 6's "unquoted" and "found twice" rows (a stated binding read as never
 * stated), sparing every link row · (B) RED 28/10 · (C) RED 33/5 · (D) RED 28/10 · (E) GREEN 38/0.
 * D-712's ARM, RUN 2026-09-25 by the D-712 worker, by hand, the ONE line `document: state.document,` deleted from
 * `Store.publishedCase()`'s success return in `bio-plane/src/store.mjs` (anchor matched exactly once) and the file
 * restored from a per-arm copy, IDENTICAL by sha256 (59abe06a…) AND `cmp` (3,480,319 B): 48/0 whole -> 38/10, the
 * five "THE CASE DOCUMENT IS SIGNED, AND THE STRANGER'S PAGE SAYS SO" rows and the five "THE LIVE WIRE'S SHAPE" rows,
 * and nothing else; RE-RUN at 58 rows after D-731 (a) -> 38/15, the same ten plus the five "VERIFY THE SIGNED
 * DOCUMENT" rows (no signing line, so no button; the five hash rows are not reached, 53 run). OVER-STRICTNESS: the
 * same line spelled `document: state.document ?? null,` -> 48/0 (measured before D-731 (a)).
 * D-731 (a)'s TWO ARMS, RUN 2026-09-25 against `civicos-ui/app.html` 78ef2d7f… (1,641,039 B), each alone, IDENTICAL by
 * sha256 AND `cmp` after: (G) the button restored to `pubVerify(doc_sha)` — op=verify — (anchor matched once) -> 48/5,
 * the five "VERIFY THE SIGNED DOCUMENT" rows (the five hash rows are not reached without the button, 53 run);
 * (H) `pubVerifyCaseDoc` stops comparing the sha (`&& v.doc_sha === sha` removed) -> 53/5, the five "AND IT CHECKS
 * THE HASH" rows and nothing else. The fixture
 * half of the anchor has its own arm in `publishedcase.test.mjs` (the mock's `delivered_by` dropped -> 246/1).
 * UI-121's six arms above were measured at 38 rows, before these ten were added, and are not re-run here.
 * D-734's ARMS (section 7, BOB #36 2026-09-25 11:50Z, D-731 (b)), RUN 2026-09-25 by the D-734 worker against
 * `bio-plane/src/store.mjs` bfd60e4b… (3,484,521 B), each alone, IDENTICAL by sha256 AND `cmp` after, BASELINE 72/0:
 * (A) the registration call removed from `ratifyCaseDocument` -> 60/12, the six editions' op=verify and publishedbytes
 * rows and nothing else — op=verify answered `{"published":false,"matches":[]}` for every one, the defect reproduced;
 * (C) the store's read hands back the text plus one byte -> 66/6, the six publishedbytes rows; (B) the boot backfill
 * removed and (D) the path re-spelled -> 72/0, as they must be here. `bio-plane/test/d734-casedoc-published.test.mjs`
 * carries the arms in full.
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
import { PUBLISHED_CASE_KEYS, PUBLISHED_CASE_DOCUMENT_KEYS, keysOf } from "./publishedcase-wire.mjs";
import { until, budgetAssert } from "../../bio-plane/test/budget.mjs";
import { makePublishingProject, allLoadBearing } from "../../bio-plane/test/publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "../../bio-plane/test/adoptable-reading.mjs";
import { withSurfacingRun } from "../../bio-plane/test/surfacing-run.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};

/* Every case here is signed: `completeness.draft` is committed to the published projection only by
   `op=caseratify` over a real signature. Without ssh-keygen the suite SKIPS WHOLE and says so. */
if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH, and every case here is signed and ratified");
  console.log("draft-binding.test.mjs: SKIPPED — ssh-keygen not on PATH");
  process.exit(0);
}

let mf = null;
const finish = async (code) => {
  console.log(`\ndraft-binding.test.mjs: ${pass} pass, ${fail} fail`);
  if (mf) await mf.dispose();
  process.exit(code ?? (fail ? 1 : 0));
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("draft-binding: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "ui121-instance", ADMIN_TOKEN: "adm-ui121", MEMBER_TOKEN: "mem-ui121",
              PROBE_TOKEN: "prb-ui121", DAEMON_TOKEN: "dmn-ui121", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
}));
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const must = async (what, r) => {
  if (!r || r.ok === false) { ok(`FIXTURE: ${what}`, false, JSON.stringify(r).slice(0, 600)); await finish(1); }
  return r;
};

/* ============================================================
   0. THE GROUND — an owner who publishes and signs, and findings to publish
   ============================================================ */
const dir = mkdtempSync(join(tmpdir(), "ui121-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
/* THE BYTES A MEMBER SIGNS, written out rather than imported from `src/sshsig.mjs`. */
const signCase = (who, caseId, edition, docSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify-case ${caseId} ${edition} ${docSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, role, capabilities) => {
  const add = await must(`memberadd ${memberId}`, await POST("op=memberadd&token=adm-ui121",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  await must(`enroll ${memberId}`, await POST("op=enroll",
    { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-121` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-121` });
  if (!lg?.token) { ok(`FIXTURE: login ${memberId}`, false, JSON.stringify(lg)); await finish(1); }
  return lg.token;
};
await enrol("nadia", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "admin", ["contribute"]);
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
await must("signeradd iris", await POST("op=signeradd&token=adm-ui121",
  { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" }));
const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-ui121", owner: "iris",
  name: "PROJ-2026-1210-draft-binding", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
let snapSeq = 0;
const promote = async (id, text, objectType, state) => await POST("op=promote&token=adm-ui121", {
  bundleId: id, base: null,
  snapKey: `20260925T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: objectType, group: "believe-in-oakland", title: `t ${id}`,
          current_state: state, created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: [],
});
const INFO = "INFO-2026-1210-memo";
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
let reads = 0;
const conclude = async (id) => {
  reads++;
  await must(`conclude ${id} (${reads})`, await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(id)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo (read ${reads}).`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id} (read ${reads}).`)}`
    + adoptedVersionParam()));
};
const finding = async (tag, question) => {
  const id = `INQ-2026-1210-${tag}`;
  await must(`promote ${id}`, await promote(id, withAdoptableReading(inquiryMd(id, question)), "inquiry", "open"));
  await conclude(id);
  return id;
};
/* THE ROUTE DEC-12 BUILT TO A FURTHER EDITION: reopened and concluded again, so the finding's bytes move. */
const reconclude = async (id) => {
  await must(`reopen ${id}`, await GET(`op=reopen&token=${IRIS}&target=${encodeURIComponent(id)}`
    + `&reason=${encodeURIComponent(`UI-121 re-read ${reads + 1}: the memo has to be read again`)}`));
  await conclude(id);
};
const caseArgs = (target, tag, over = {}) => ({
  project: PROJ, targets: [target], roles: allLoadBearing({ targets: [target] }),
  scope: `Whether the transfer was authorised (${tag}).`,
  statement: `This case covers the FY2024 transfer only (${tag}); the FY2023 memo is out of it.`,
  excluded: [{ target: null, description: `the FY2023 memo (${tag})`, reason: "a records request is outstanding" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: `We put the claims to the City Administrator (${tag}).`,
  biasAcknowledgement: `This group holds that transfers should be adopted in public (${tag}).`,
  ...over,
});
const draftOf = async (target, tag, over = {}) =>
  (await must(`casedraft ${tag}`, await POST(`op=casedraft&token=${IRIS}`, caseArgs(target, tag, over)))).draftId;
/* D-734: every edition this suite ratifies, recorded here, so section 7 asks op=verify about each one. */
const RATIFIED = [];
/* PUBLISH AND SIGN — iris owns the project and holds the only key. Returns [caseId, edition]. */
const publishAndRatify = async (target, tag, extra = {}) => {
  const p = await must(`publish ${tag}`, await POST(`op=publish&token=${IRIS}`, { ...caseArgs(target, tag), ...extra }));
  const d = p.caseDocument;
  if (!d || !d.doc_sha) { ok(`FIXTURE: publish ${tag} returned no case document`, false, JSON.stringify(p).slice(0, 400)); await finish(1); }
  await must(`caseratify ${tag}`, await POST(`op=caseratify&token=${IRIS}`,
    { caseId: d.case_id, edition: d.edition, expectedSha: d.doc_sha,
      sig: signCase("iris", d.case_id, d.edition, d.doc_sha) }));
  RATIFIED.push({ case_id: d.case_id, edition: d.edition, doc_sha: d.doc_sha, tag });
  return [d.case_id, d.edition, p];
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
  vm.runInContext(APP + `;globalThis.__U = { PLANE, pubOpen, pubDraftLinkHtml, pubVerifyCaseDoc };`, ctx);
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
/* A machine code that reached the page — the matcher `statement-writer.test.mjs` uses, on purpose. */
const shouty = (t) => [...String(t).matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)].map((m) => m[1]).filter((c) => c.includes("_"));
/* The five `draft_case` tokens, as they reach the page — any one rendered as TEXT is a machine word. */
const TOKENS = ["derived_at_publication", "named_and_confirmed", "new_case_asked_at_publication",
                "named_by_draft", "new_case_asked_by_draft"];
const tokensIn = (t) => TOKENS.filter((k) => t.includes(k));
/* THE DRAFT BLOCK OF THE PAGE, from the heading before its link to the end of page 2 — anchored on the block's
   data attribute and not its heading's words, so a re-worded heading is not a failure (control arm (E)): a row reading the whole page would be
   satisfied by the same words anywhere else on it. */
const block = (html) => {
  const k = html.indexOf("data-pub-draft-link=");
  if (k < 0) return "";
  const i = Math.max(0, html.lastIndexOf("<h2", k));
  const j = html.indexOf("</section>", i);
  return html.slice(i, j < 0 ? undefined : j);
};
/* OPEN A PUBLISHED CASE AS A STRANGER and return what the page drew, with the plane's own answer beside it. */
const openCase = async (caseId, edition, what) => {
  const P = page();
  await P.U.pubOpen(caseId, edition);
  await drawn(`${what}: the published case page is drawn for a caller holding nothing`,
              () => /data-pub-writer=/.test(P.html("#pub-body")));
  const html = P.html("#pub-body");
  const wire = await GET(`op=publishedcase&id=${encodeURIComponent(caseId)}&edition=${edition}`);
  const b = block(html);
  /* THE SIGNED BYTES, read here as a stranger through the same op the page reads — no token. */
  const doc = await GET(`op=casedocument&case=${encodeURIComponent(caseId)}&edition=${edition}`);
  return { P, html, t: strip(html), b, bt: strip(b), cm: (wire && wire.completeness) || null, wire, doc,
           signed: (doc && doc.ratified === true && doc.text) || "" };
};
/* THE LINE OF THE SIGNED TEXT a phrase stands in — found HERE by the phrase the plane's own suite pins, never
   by the page's function, so the page and this suite cannot agree for free. */
const signedLine = (signed, phrase) => String(signed).split("\n").find((l) => l.includes(phrase)) || null;
/* The one assertion every live binding makes, row-labelled by the binding. */
const bindingRows = async (label, caseId, edition, draftId, token, phrase) => {
  const { P, html, t, b, bt, cm, signed, wire, doc } = await openCase(caseId, edition, label);
  /* D-712: THE SIGNED-DOCUMENT LINE, READ BY A STRANGER. Every case here is signed through op=caseratify, and
     until D-712 op=publishedcase served no `document`, so this same page told every stranger each of them was
     "not been signed yet" (data-casedoc="none", measured by UI-121's worker on all five). The signer and the
     doc sha are taken from op=casedocument — the signed bytes' own read — never from the answer the page drew. */
  ok(`THE LIVE WIRE'S SHAPE (${label}): op=publishedcase answers exactly the keys publishedcase.test.mjs's mock is `
   + `held to (publishedcase-wire.mjs), and its signed document exactly its seven`,
     !!wire && JSON.stringify(keysOf(wire)) === JSON.stringify([...PUBLISHED_CASE_KEYS].sort())
     && JSON.stringify(keysOf(wire.document)) === JSON.stringify([...PUBLISHED_CASE_DOCUMENT_KEYS].sort()),
     JSON.stringify({ extra: keysOf(wire).filter((k) => !PUBLISHED_CASE_KEYS.includes(k)),
                      missing: PUBLISHED_CASE_KEYS.filter((k) => !keysOf(wire).includes(k)),
                      document: keysOf(wire && wire.document) }));
  /* D-731 (a), BOB #36 2026-09-25 11:50Z: THE SIGNING LINE'S "Verify this hash" asks op=casedocument, never op=verify
     (which answered "NOT PUBLISHED" for a ratified case document — measured on six editions; CORRECTED 2026-09-25:
     since D-734 op=verify answers for it, section 7). Driven with the
     arguments THE PAGE ITSELF wrote into the button, over the live plane, as a stranger; and once with one byte of
     the sha changed, so a constant "SIGNED" cannot pass. */
  {
    const btn = (html.match(/<button[^>]*data-casedoc-verify="casedocument"[^>]*onclick="pubVerifyCaseDoc\('([^']*)','([^']*)','([^']*)','([^']*)'\)"/) || []);
    const [ , bc, be, bs, bin ] = btn;
    if (btn.length) await P.U.pubVerifyCaseDoc(bc, be, bs, bin);
    const said = btn.length ? strip(P.html(bin)) : "";
    ok(`VERIFY THE SIGNED DOCUMENT (${label}): the button asks op=casedocument with the page's own case, edition and `
     + `sha, and a stranger reads SIGNED AND HELD naming the signer — never op=verify's "NOT PUBLISHED"`,
       btn.length > 0 && bc === caseId && Number(be) === Number(edition) && !!doc && bs === doc.doc_sha
       && /SIGNED AND HELD/.test(said) && said.includes(String(doc.attestor_member)) && !/NOT PUBLISHED/.test(said)
       && !/pubVerify\('[^']*','#v-casedoc'\)/.test(html),
       JSON.stringify({ btn: btn.slice(1), said: said.slice(0, 300) }));
    if (btn.length) {
      const wrong = (bs[0] === "0" ? "1" : "0") + bs.slice(1);
      await P.U.pubVerifyCaseDoc(bc, be, wrong, bin);
      const s2 = strip(P.html(bin));
      ok(`AND IT CHECKS THE HASH (${label}): the same button handed a sha one character off reads DIFFERENT HASH, not SIGNED`,
         /DIFFERENT HASH/.test(s2) && !/SIGNED AND HELD/.test(s2), s2.slice(0, 300));
    }
  }
  const casedoc = (html.match(/<div class="pub-file" data-casedoc="signed"[\s\S]*?<\/div><\/div>/) || [""])[0];
  ok(`THE CASE DOCUMENT IS SIGNED, AND THE STRANGER'S PAGE SAYS SO (${label}): the signing line names `
   + `${doc && doc.attestor_member} and the signed document's sha, and never "not been signed yet"`,
     !!doc && doc.ratified === true && !!doc.doc_sha && !!doc.attestor_member
     && !!wire && !!wire.document && wire.document.doc_sha === doc.doc_sha
     && !/data-casedoc="none"/.test(html) && !/has not been signed yet/.test(strip(html))
     && casedoc.includes(`signed by ${doc.attestor_member}`) && casedoc.includes(`sha256:${doc.doc_sha}`),
     JSON.stringify({ wire: wire && wire.document ? { doc_sha: wire.document.doc_sha } : wire && wire.document,
                      doc: doc && { ratified: doc.ratified, doc_sha: doc.doc_sha, by: doc.attestor_member },
                      casedoc: (html.match(/data-casedoc="[a-z]+"/) || [""])[0] }));
  ok(`LIVE, THROUGH THE OP (${label}): the plane serves the link and its binding off the signed bytes to a caller `
   + `with no credential — draft ${draftId}, named by iris, case "${token}"`,
     cm && cm.draft && cm.draft.draft_id === draftId && cm.draft.named_by === "iris" && cm.draft.case === token,
     JSON.stringify(cm && cm.draft));
  const line = signedLine(signed, phrase);
  ok(`FIXTURE (${label}): the signed text carries the plane's sentence for "${token}"`, !!line, signed.slice(-600));
  ok(`HOW THE CASE WAS BOUND, IN THE PLANE'S WORDS (${label}): the page states it, quoting the signed line verbatim`,
     !!line && /data-pub-draft-case="/.test(b) && new RegExp(`data-pub-draft-case="${token}"`).test(b)
     && bt.includes(flat(line)) && bt.includes(phrase), bt.slice(0, 700));
  const link = signedLine(signed, `Readings given on draft ${draftId}, which iris named as this case's draft at publication`);
  ok(`THE LINK, IN THE PLANE'S WORDS (${label}): which draft, named by whom at publication, quoted from the signed text`,
     !!link && /data-pub-draft-link="quoted"/.test(b) && bt.includes(flat(link)), bt.slice(0, 400));
  ok(`NO MACHINE VOCABULARY (${label}): no code and no draft_case token reaches the page as text`,
     shouty(t).length === 0 && tokensIn(t).length === 0, JSON.stringify([shouty(t), tokensIn(t)]));
  return { html, bt };
};

console.log("\n--- UI-121: the published case page states which draft it was prepared in, and how its case was bound ---");

/* ============================================================
   1. DERIVED AT PUBLICATION — a draft naming no case, published naming none
   ============================================================ */
console.log("\n--- 1. derived at publication ---");
const Q_D = await finding("derived", "Was the transfer authorised?");
const D1 = await draftOf(Q_D, "derived");
const [C_D, E1] = await publishAndRatify(Q_D, "derived", { draft: D1 });
await bindingRows("derived at publication", C_D, E1, D1, "derived_at_publication",
  `Draft ${D1} named no case and left its case to publication: this case was DERIVED AT PUBLICATION`);

/* ============================================================
   2. NAMED AND CONFIRMED — a further edition, the publisher naming the case derivation yields
   ============================================================ */
console.log("\n--- 2. named and confirmed ---");
await reconclude(Q_D);
const D2 = await draftOf(Q_D, "confirmed");
const [C_D2, E2] = await publishAndRatify(Q_D, "confirmed", { draft: D2, caseId: C_D });
ok("FIXTURE: the confirmed draft published edition 2 of the derived case", C_D2 === C_D && E2 === 2, JSON.stringify([C_D2, E2]));
await bindingRows("named and confirmed", C_D, 2, D2, "named_and_confirmed",
  `iris named this case at publication, and it IS the case publication derives for the draft's findings: NAMED AND CONFIRMED`);

/* ============================================================
   3. A NEW CASE ASKED AT PUBLICATION — a derivation draft, the publisher asking newCase
   ============================================================ */
console.log("\n--- 3. a new case asked at publication ---");
const D3 = await draftOf(Q_D, "asked");
const [C_A, E3] = await publishAndRatify(Q_D, "asked", { draft: D3, newCase: true });
ok("FIXTURE: the publisher's newCase ask minted a new case", C_A !== C_D && E3 === 1, JSON.stringify([C_A, E3]));
await bindingRows("new case asked at publication", C_A, 1, D3, "new_case_asked_at_publication",
  `Draft ${D3} named no case and left its case to publication; iris asked for a NEW case at publication`);

/* ============================================================
   4. NAMED BY THE DRAFT — and the edition before it, published with no draft, shows no draft block
   ============================================================ */
console.log("\n--- 4. named by the draft, and no draft named at all ---");
const Q_N = await finding("named", "Was notice given?");
const [C_N] = await publishAndRatify(Q_N, "named-e1");
await reconclude(Q_N);
const D4 = await draftOf(Q_N, "named", { caseId: C_N });
await publishAndRatify(Q_N, "named", { draft: D4, caseId: C_N });
await bindingRows("named by the draft", C_N, 2, D4, "named_by_draft",
  `Draft ${D4} named this case itself, and this edition is the one it was prepared for.`);
{
  const { html, cm } = await openCase(C_N, 1, "no draft named");
  ok("NO LINK, NO BLOCK: edition 1 was published without draft=, the plane serves no draft, and the page renders "
   + "no draft block and invents no binding for it",
     cm && !("draft" in cm) && !/data-pub-draft-/.test(html) && block(html) === "",
     JSON.stringify({ draft: cm && cm.draft, block: block(html).slice(0, 200) }));
}

/* ============================================================
   5. A NEW CASE ASKED BY THE DRAFT
   ============================================================ */
console.log("\n--- 5. a new case asked by the draft ---");
const Q_B = await finding("bydraft", "Was the auditor told?");
const D5 = await draftOf(Q_B, "bydraft", { newCase: true });
const [C_B] = await publishAndRatify(Q_B, "bydraft", { draft: D5 });
await bindingRows("new case asked by the draft", C_B, 1, D5, "new_case_asked_by_draft",
  `Draft ${D5} asked for a new case itself, and this case was minted for it at`);

/* ============================================================
   6. THE STATES THE PLANE CANNOT PRODUCE NOW — rendered from answers built here, and said so
   ============================================================ */
console.log("\n--- 6. a link signed before its binding was stated, and a stated binding the text does not carry ---");
{
  const P = page();
  const base = { caseId: "CASE-2026-1210-built", edition: 1,
    completeness: { statement: "s", author: "iris", at: NOW, excluded: "[]",
                    draft: { draft_id: "DRAFT-built", named_by: "iris", named_at: NOW, case: null } },
    text: ("---\n---\n\nReadings given on draft DRAFT-built, which iris named as this case's draft at publication on "
                      + NOW + ", are readings of this case.\n") };
  const unstated = P.U.pubDraftLinkHtml(base, base.text);
  const sU = strip(unstated);
  console.log(`    case null -> ${sU.slice(0, 240)}`);
  ok("A LINK SIGNED BEFORE ITS BINDING WAS STATED is the ABSENCE of a record: the link is quoted, and how the case "
   + "was settled is stated as not recorded — never as derived, confirmed or asked",
     /data-pub-draft-case="unstated"/.test(unstated) && /data-pub-draft-link="quoted"/.test(unstated)
     && /say nothing about how this draft’s case was settled/.test(sU)
     && !/DERIVED AT PUBLICATION|NAMED AND CONFIRMED|asked for a/.test(sU), sU);
  const unquoted = P.U.pubDraftLinkHtml({ ...base,
    completeness: { ...base.completeness, draft: { ...base.completeness.draft, case: "derived_at_publication" } } }, base.text);
  const sQ = strip(unquoted);
  ok("A STATED BINDING WHOSE SENTENCE IS NOT IN THE SERVED TEXT is said to be so, and no sentence is written in its "
   + "place — the token is not rendered as text either",
     /data-pub-draft-case="unquoted"/.test(unquoted) && /none is written here in its place/.test(sQ)
     && !/DERIVED AT PUBLICATION/.test(sQ) && tokensIn(sQ).length === 0, sQ);
  const twice = P.U.pubDraftLinkHtml({ ...base,
    completeness: { ...base.completeness, draft: { ...base.completeness.draft, case: "derived_at_publication" } } },
    base.text + "\nDraft DRAFT-built named no case (one).\nDraft DRAFT-built named no case (two).\n");
  ok("A SENTENCE FOUND TWICE IS NOT QUOTED: two lines opening with the draft's id are ambiguous, and neither is "
   + "picked", /data-pub-draft-case="unquoted"/.test(twice) && !/\(one\)|\(two\)/.test(strip(twice)), strip(twice));
  ok("NOT A CASE, NO BLOCK: bytes that are no case's member, a completeness with no link, and no completeness at "
   + "all render nothing",
     P.U.pubDraftLinkHtml({ ...base, caseId: null }, base.text) === ""
     && P.U.pubDraftLinkHtml({ ...base, completeness: { ...base.completeness, draft: undefined } }, base.text) === ""
     && P.U.pubDraftLinkHtml({ caseId: "CASE-x", edition: 1, completeness: null }) === "");
}

/* ============================================================
   7. D-734 (BOB #36 2026-09-25 11:50Z, D-731 (b)): EVERY RATIFIED EDITION'S DOCUMENT SHA IS PUBLISHED
   ============================================================ */
console.log("\n--- 7. D-734: op=verify and op=publishedbytes answer for each of the six ratified case documents ---");
ok("FIXTURE: this suite ratified exactly the six editions the row's accepts-when names",
   RATIFIED.length === 6, JSON.stringify(RATIFIED.map((r) => [r.case_id, r.edition])));
for (const r of RATIFIED) {
  const label = `${r.case_id} edition ${r.edition} (${r.tag})`;
  const v = await GET(`op=verify&sha256=${r.doc_sha}`);
  const m = (v && v.matches) || [];
  ok(`D-734 (${label}): op=verify answers published:true for the ratified case document's sha, naming the kind `
   + `case_document and the case — never "NOT PUBLISHED"`,
     !!v && v.published === true && m.length === 1 && m[0].kind === "case_document" && m[0].bundle_id === r.case_id,
     JSON.stringify(v));
  const res = await mf.dispatchFetch(`http://x/api/?op=publishedbytes&sha256=${r.doc_sha}`);
  const got = Buffer.from(await res.arrayBuffer());
  ok(`D-734 (${label}): op=publishedbytes serves the document's bytes, and they hash to the signed sha`,
     res.status === 200 && res.headers.get("x-published-kind") === "case_document" && sha(got) === r.doc_sha,
     JSON.stringify({ status: res.status, kind: res.headers.get("x-published-kind"), sha: sha(got) }));
}
{
  /* AN UNRATIFIED DRAFT'S DOCUMENT: published and never signed. */
  const Q_U = await finding("unsigned", "Was the council told?");
  const pu = await must("publish unsigned", await POST(`op=publish&token=${IRIS}`, caseArgs(Q_U, "unsigned")));
  const du = pu.caseDocument || {};
  const v = await GET(`op=verify&sha256=${du.doc_sha}`);
  const res = await mf.dispatchFetch(`http://x/api/?op=publishedbytes&sha256=${du.doc_sha}`);
  ok("D-734: an UNRATIFIED document's sha still answers NOT published — no match, and publishedbytes 404s",
     /^[0-9a-f]{64}$/.test(String(du.doc_sha)) && !!v && v.published === false && (v.matches || []).length === 0
     && res.status === 404, JSON.stringify({ v, status: res.status }));
}

await finish();
