/* D-507 — THE SIX `STATEMENT_ACK_*` REFUSALS ARRIVE AT A MEMBER WITH THEIR CANNED TRANSLATION.
 *
 * THE DEFECT, found by UI-89's worker at the surface it had just built: `acknowledgeStatement`
 * refuses on SEVEN conditions and only ONE of them — `STATEMENT_ACK_DOCUMENTS_OVER_BOUND`, C-82.1 —
 * held a row in any `*_CHECKS` family. The other six reached a member as the plane's own authored
 * `detail`, machine words and all, with no translation. DEC-49 (Bob, 2026-08-06), as
 * `BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, is that every condition a member can meet
 * carries a code with a CANNED TRANSLATION and that an untranslated code fails the harness rather
 * than reaching a person.
 *
 * THE OBSTACLE WAS STRUCTURAL, exactly as it was for D-484's `NO_BASIS`: a DEC-49 row holds ONE
 * `where` naming the SMALLEST SPAN in which its refusal is enforced, and `acknowledgeStatement`'s
 * `refusal` helper was declared BELOW all six of them. A helper a return cannot see is a helper that
 * return does not use, so none of the six could be built through it and none could honestly hold a
 * row. D-507 hoists the helper above the first refusal, wraps each of the six in its own DEC-49
 * region, and gives each a row — C-82.2 .. C-82.7, the sentences BOB #33 approved on 2026-09-24.
 *
 * HOW A LIAR PASSES, and this suite is shaped around it: add six rows nobody ever mints. Arm A of the
 * DEC-49 guard is satisfied by the rows ALONE and arm C by the helper ALONE. So this suite does two
 * things neither the catalogue nor the guard does:
 *
 *   1. IT DRIVES THE OP. Every wire assertion below reads a refusal off the CONTROL PLANE's answer —
 *      a real caller's only route — and asserts `translation` is the catalogue's own sentence,
 *      arriving at the member. A store-level test is not evidence a caller can reach the feature.
 *   2. IT PINS THE ROUTING STRUCTURALLY. It reads `src/store.mjs` and asserts each code literal
 *      appears EXACTLY ONCE, inside the DEC-49 region its row's `where` names, and that the helper
 *      stands ABOVE the first refusal rather than below it — which is the whole of the defect and the
 *      one thing a wire assertion cannot see, because `index.mjs`'s `dec49Decorate` fills `code`,
 *      `check` and `translation` onto ANY `ok:false` answer whose `reason` matches a row (D-484
 *      measured that and recorded it as a surprising green; it is stated here rather than rediscovered).
 *
 * ADDITIVE ON THE WIRE (IC-270, PROPOSED). The old answer must still be there: `reason`, each site's
 * own `detail`, and its per-site keys (`caseId`, `edition`, `author`, `draft`) are asserted UNCHANGED
 * beside the three that JOIN them.
 *
 * WHAT THIS SUITE CANNOT SEE, stated plainly rather than left for the next reader to find:
 *   - `STATEMENT_ACK_AUTHOR_UNDETERMINED` (C-82.7) IS NOT DRIVEN THROUGH THE OP, and it is not an
 *     omission this suite could close. Its condition is a draft carrying a non-empty statement and a
 *     NULL `statement_by`, and since REC-193 the server stamps that column at every write that
 *     changes the statement — so NO sequence of ops can produce the state, and a draft with no
 *     statement at all is refused by C-82.5 one branch earlier. It is pinned STRUCTURALLY here (one
 *     site, inside its region, through the helper) and its row is asserted like the others. d150's
 *     suite says the same of it, and says it the same way.
 *   - The pin sees a site that stops calling the helper. It does not see one whose `detail` was
 *     changed, and it is not evidence about any refusal outside this one op.
 *
 * NEGATIVE CONTROL: the row's own, run in `test/d507-statement-ack-translation.control.mjs` —
 * `node test/d507-statement-ack-translation.control.mjs [arm]` from `bio-plane/`. Each arm edits a
 * REAL source, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED
 * per-arm pristine copy verified by sha256, by content AND by `cmp`, with the byte count printed and
 * a minimum guarded. Declared before the first run: (0) BASELINE — nothing armed, every arm GREEN and
 * the DEC-49 guard exit 0, which is what tells all-arms-working from all-arms-broken. (a) THE ROW'S
 * OWN NAMED CONTROL — one code returned OUTSIDE the helper (the pre-D-507 object literal at
 * `STATEMENT_ACK_BY_ITS_AUTHOR`): the DEC-49 guard MUST fail BY NAME on that region, and this suite's
 * structural pin MUST fail; the wire arm for that code MUST STAY GREEN, because `dec49Decorate` puts
 * the sentence on the wire from the row alone. (b) A TRANSLATION BLANKED — C-82.4's `translation`
 * emptied: the guard MUST name the row and this suite's catalogue and wire arms for that code MUST
 * fail; every other code's arms MUST stay green. (c) OVER-STRICTNESS — correct work in a spelling
 * this suite did not anticipate: a region's marker comment re-spelled across lines; every arm MUST
 * STAY GREEN. RESULTS ARE RECORDED ON THE LINE BELOW, from the driver's own print.
 *
 * NEGATIVE CONTROL: (run 2026-09-24, D-507, branch land/worker/D-507, base origin/main 68fecb8d) ALL FOUR
 * ARMS AS DECLARED, driver exit 0. Every restore verified by sha256 MATCH, content IDENTICAL and `cmp` SAME
 * (src/store.mjs 3,223,995 B 3ceae6cd232ea4e2…; checks/bio-checks.mjs 929,584 B 210f261a84bcf726…).
 *   (baseline) nothing armed -> 63 pass, 0 fail; the DEC-49 guard exit 0. The row that tells
 *     three-arms-working from three-arms-broken.
 *   (a) THE ROW'S OWN — `STATEMENT_ACK_BY_ITS_AUTHOR` returned as a bare literal above its region -> 61/2,
 *     failing at exactly the two structural arms BY NAME, and the DEC-49 guard exit 1 naming the region:
 *     "arm C judged NO refusal inside the region `is-statement-ack-by-its-author` of acknowledgeStatement",
 *     with `regionLines` 3797 -> 3795, `codesChecked` 435 -> 434 and `refusalsJudged` 432 -> 431 breaching
 *     beneath it. **AND THE DECLARED-GREEN HALF HELD: the WIRE arm for that same code still PASSED**, which
 *     is the fact this arm exists to fix in the record — `dec49Decorate` puts the catalogue's sentence on
 *     the wire from the ROW alone, so no wire assertion anywhere is evidence about the routing, and the
 *     structural pin is the only discriminator there is.
 *   (b) C-82.4's `translation` blanked -> 61/2: the catalogue arm and the WIRE arm for that one code, and
 *     no other code's arms; guard exit 1 naming `STATEMENT_ACK_NOT_A_PARTICIPANT` has NO CANNED
 *     TRANSLATION. The wire arm catches it only because the arriving sentence is FLOORED as well as
 *     compared; comparing it with the row it was built from would have passed over two empty strings.
 *   (c) OVER-STRICTNESS — `is-statement-ack-subject`'s two markers re-spelled with extra asterisks,
 *     whitespace and prose inside the marker comment -> 63/0, guard exit 0, `regionLines` unmoved at 3797.
 *     A marker's own prose is not part of the span it opens, and this arm is what says so by measurement.
 */
import { withSurfacingRun } from "./surfacing-run.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";
import { STATEMENT_ACK_CHECKS } from "../checks/bio-checks.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- d507-statement-ack-translation ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("d507-statement-ack-translation: SKIPPED — ssh-keygen not on PATH; C-82.3 needs a case "
    + "edition a member really signed");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d507", MEMBER_TOKEN: "mem-d507", PROBE_TOKEN: "prb-d507", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const bail = (what, r) => {
  console.log(`  FAIL  (fixture) ${what}: ${JSON.stringify(r).slice(0, 600)}`);
  fail++;
  console.log(`\nd507-statement-ack-translation: ${pass} pass, ${fail} fail  [FIXTURE ABORTED]`);
  mf.dispose().then(() => process.exit(1));
  throw new Error("fixture");
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const ack = async (q) => rP(await POST(`op=statementack&${q}`, {}));

/* ============================================================================
   THE CATALOGUE HALF — the six rows exist, each with a real sentence of its own.
   ============================================================================ */
console.log("\n--- d507-statement-ack-translation ---");
console.log("\n--- 1. the catalogue holds a row for each of the six, with a sentence of its own ---");

const SIX = [
  ["STATEMENT_ACK_NO_SUBJECT",          "C-82.2", "is-statement-ack-subject"],
  ["STATEMENT_ACK_ALREADY_SIGNED",      "C-82.3", "is-statement-ack-signed"],
  ["STATEMENT_ACK_NOT_A_PARTICIPANT",   "C-82.4", "is-statement-ack-participant"],
  ["STATEMENT_ACK_NO_STATEMENT",        "C-82.5", "is-statement-ack-statement"],
  ["STATEMENT_ACK_BY_ITS_AUTHOR",       "C-82.6", "is-statement-ack-by-its-author"],
  ["STATEMENT_ACK_AUTHOR_UNDETERMINED", "C-82.7", "is-statement-ack-author-undetermined"],
];
t("the corpus this suite judges is the six the row names, and it is FLOORED — a list that shrank to "
+ "nothing would pass every totality arm below for free", SIX.length, 6);

for (const [code, check, region] of SIX) {
  const row = STATEMENT_ACK_CHECKS[code];
  t(`${code} has a STATEMENT_ACK_CHECKS row at ${check}`, row && row.check, check);
  t(`${code}'s translation is prose a member reads, not a restatement of the machine word`,
    !!row && typeof row.translation === "string" && row.translation.length > 100
      && !row.translation.includes(code) && !row.translation.includes("_"), true);
  t(`${code}'s \`where\` names the ONE governed REGION, not a whole function`,
    !!row && row.where, `src/store.mjs acknowledgeStatement > ${region}`);
}
t("the six sentences are six DIFFERENT sentences — one sentence serving two codes is DEC-49's drift",
  new Set(SIX.map(([c]) => STATEMENT_ACK_CHECKS[c].translation)).size, 6);
t("and C-82.1, the row that was already there, is untouched beside them",
  [STATEMENT_ACK_CHECKS.STATEMENT_ACK_DOCUMENTS_OVER_BOUND.check,
   Object.keys(STATEMENT_ACK_CHECKS).length], ["C-82.1", 7]);

/* ============================================================================
   THE STRUCTURAL HALF — one site per code, inside the region its `where` claims,
   and the helper ABOVE the first refusal, which is the defect itself.
   ============================================================================ */
console.log("\n--- 2. ONE site per code, inside its region, and the helper stands ABOVE them all ---");
const store = readFileSync(SRC, "utf8");
console.log(`  CORPUS: src/store.mjs ${store.length} bytes, ${store.split("\n").length} lines`);
t("the corpus is non-empty and is the plane's store (floored, so an unreadable file cannot pass)",
  store.length > 1_000_000 && /class Store\b/.test(store) && /acknowledgeStatement\(\{/.test(store), true);

const regionOf = (name) => {
  const a = store.indexOf(`DEC-49 REGION ${name}`);
  const b = store.indexOf(`END DEC-49 REGION ${name}`);
  return (a < 0 || b < 0 || b < a) ? null : store.slice(a, b);
};
for (const [code, , region] of SIX) {
  const hits = [...store.matchAll(new RegExp(`"${code}"`, "g"))];
  t(`"${code}" is minted at EXACTLY ONE site in src/store.mjs`, hits.length, 1);
  const span = regionOf(region);
  t(`the DEC-49 region ${region} exists and is a marker PAIR`, !!span, true);
  t(`that one site is INSIDE ${region} — the span the row's \`where\` claims, and it goes through the helper`,
    !!span && span.includes(`refusal("${code}"`), true);
}
{
  /* THE DEFECT ITSELF, pinned by POSITION: the helper is declared before the first refusal that uses
     it. Read on `acknowledgeStatement`'s own body so a helper of the same name elsewhere cannot stand
     in for it — and the body is floored, because a slice that missed would make every test below
     vacuous. */
  const from = store.indexOf("  acknowledgeStatement({ draft = null");
  /* CORRECTED 2026-09-24 BY REC-194, never exempted — and this arm's own FLOOR is what caught it, which
     is the arm working. The slice was a FIXED 12,000 characters from the method's opening, and a
     fixed-width window is not a method's body: REC-194 added ~2.5 kB of comment INSIDE
     `acknowledgeStatement` (§3 rule 13's one-case-identity narrowing), the LAST of the seven refusals
     fell outside the window, and the floor went RED rather than letting every arm below it go vacuous
     while still reading true. The old assertion was not stale, it was WRONG about what it measured:
     the window has to track the method, so the slice now ends at the last governed region's own END
     marker. The floor still fails if the slice misses, and it no longer moves when somebody writes a
     comment. */
  const bodyEnd = store.indexOf("END DEC-49 REGION is-statement-ack-documents-bound", from);
  const body = from < 0 || bodyEnd < 0 ? "" : store.slice(from, bodyEnd);
  t("acknowledgeStatement's body was found, reaches its LAST governed region, and is long enough to hold "
  + "all seven refusals",
    body.length > 6000 && body.includes("STATEMENT_ACK_DOCUMENTS_OVER_BOUND"), true);
  const helperAt = body.indexOf("const refusal = (code, detail, extra)");
  t("the `refusal` helper is declared EXACTLY ONCE in that body", body.split("const refusal = (code, detail, extra)").length - 1, 1);
  const firstUse = Math.min(...SIX.map(([c]) => { const i = body.indexOf(`refusal("${c}"`); return i < 0 ? Infinity : i; }));
  t("AND IT STANDS ABOVE THE FIRST OF THE SIX — the whole of the defect, which was a helper declared "
  + "below the returns that needed it", helperAt >= 0 && firstUse < Infinity && helperAt < firstUse, true);
  t("no `reason: \"STATEMENT_ACK_` object literal is left in the file: every one goes through the helper",
    (store.match(/reason: "STATEMENT_ACK_/g) || []).length, 0);
}

/* ============================================================================
   THE WIRE HALF — five of the six driven through op=statementack.
   ============================================================================ */
console.log("\n--- 3. the fixture: a project with an author, a joined second reader and an invited non-member ---");
const dir = mkdtempSync(join(tmpdir(), "d507-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
const signCase = (who, caseId, edition, docSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify-case ${caseId} ${edition} ${docSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-d507",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  if (!add?.invite) bail(`memberadd ${memberId}`, add);
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) bail(`enroll ${memberId}`, en);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) bail(`login ${memberId}`, lg);
  return lg.token;
};
await enrol("nadia", "nadia-passphrase-507", "admin", ["contribute", "publish", "create_projects"]);
/* THE SECOND ADMINISTRATOR IS NOT DECORATION: the plane refuses ADMINS_FIRST until two exist, because
   administrative access is shared so that losing one person does not lose the group. */
await enrol("omar", "omar-passphrase-507", "admin", ["contribute", "publish"]);
/* iris OWNS the project, writes the statement and signs; ella has JOINED (the second reader); pat is
   INVITED and has not joined, which is sight of a project and no place in it. */
const IRIS = await enrol("iris", "iris-passphrase-507", "member", ["contribute", "publish"]);
const ELLA = await enrol("ella", "ella-passphrase-507", "member", ["contribute", "publish"]);
const PAT = await enrol("pat", "pat-passphrase-507", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-d507", { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" }));

const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-d507", owner: "iris",
  name: "PROJ-2026-1507-translation", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
for (const [h, tok, joins] of [["ella", ELLA, true], ["pat", PAT, false]]) {
  const inv = rP(await GET(`op=projectinvite&token=${IRIS}&projectId=${encodeURIComponent(PROJ)}&handle=${h}`));
  if (!inv?.ok) bail(`projectinvite ${h}`, inv);
  if (joins) {
    const jn = rP(await GET(`op=projectjoin&token=${tok}&projectId=${encodeURIComponent(PROJ)}`));
    if (jn?.state !== "joined") bail(`projectjoin ${h}`, jn);
  }
}

let snapSeq = 0;
const promote = async (id, text, objectType, state) => rP(await POST("op=promote&token=adm-d507", {
  bundleId: id, base: null,
  snapKey: `20260923T${String(500000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: objectType, group: "believe-in-oakland", title: `t ${id}`,
          current_state: state, created: "2026-07-01T00:00:00Z", last_updated: "2026-07-02T00:00:00Z" },
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: [],
}));
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inquiryMd = (id, question, info) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", `  - target: ${info}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${info}`, "    role: supports", "    grade: D",
  "    grade_axis: connection", "    grade_source: testimony",
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const INFO = "INFO-2026-1507-memo";
const DRFT = "INQ-2026-1507-draft";   /* the case acknowledged through a DRAFT */
const SIGN = "INQ-2026-1507-signed";  /* the case whose edition 1 is published and SIGNED */
const Q = { [DRFT]: "Was the transfer authorised?", [SIGN]: "Was notice given?" };
if ((await promote(INFO, infoMd(INFO), "information", "collected")).ok === false) bail("promote info", {});
for (const id of Object.keys(Q)) {
  const r = await promote(id, withAdoptableReading(inquiryMd(id, Q[id], INFO)), "inquiry", "open");
  if (r.ok === false) bail(`promote ${id}`, r);
}
for (const id of Object.keys(Q)) {
  const r = rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(id)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id}.`)}`
    + adoptedVersionParam()));
  if (!r.ok) bail(`conclude ${id}`, r);
}
const args = (tag, over = {}) => ({
  project: PROJ, scope: `Whether the transfer was authorised (${tag}).`,
  statement: `This case covers the FY2024 transfer only (${tag}); the FY2023 memo is out of it.`,
  excluded: [{ target: null, description: `the FY2023 memo (${tag})`, reason: "a records request is outstanding" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: `We put the claims to the City Administrator (${tag}).`,
  biasAcknowledgement: `This group holds that transfers should be adopted in public (${tag}).`,
  ...over,
});
const withRoles = (b) => ({ ...b, roles: allLoadBearing(b) });

const D1 = rP(await POST(`op=casedraft&token=${IRIS}`, withRoles({ ...args("draft"), targets: [DRFT] })));
if (!D1?.draftId) bail("casedraft", D1);
const DNOSTMT = rP(await POST(`op=casedraft&token=${IRIS}`,
  withRoles({ ...args("nostatement"), targets: [DRFT], statement: "" })));
if (!DNOSTMT?.draftId) bail("casedraft without a statement", DNOSTMT);
const pub = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args("signed"), targets: [SIGN] })));
if (pub?.ok === false || !pub?.caseDocument?.doc_sha) bail("publish", pub);
const CS = pub.caseDocument.case_id;
{
  const r = rP(await POST(`op=caseratify&token=${IRIS}`, { caseId: CS, edition: 1,
    expectedSha: pub.caseDocument.doc_sha, sig: signCase("iris", CS, 1, pub.caseDocument.doc_sha) }));
  if (r?.ok === false) bail("caseratify", r);
}
t("the fixture stands: a draft, a statement-less draft, and a SIGNED edition 1 of another case",
  [!!D1.draftId, !!DNOSTMT.draftId, !!CS], [true, true, true]);

console.log("\n--- 4. five of the six, driven through op=statementack, arrive translated ---");
const ROW = (c) => STATEMENT_ACK_CHECKS[c];
const wire = async (code, label, q, extraGot, extraWant, detailNeedle) => {
  const r = await ack(q);
  t(`${label}: THE OLD ANSWER IS STILL THERE — ok and reason unchanged, and the per-site keys with them`,
    [r?.ok, r?.reason, ...extraGot(r)], [false, code, ...extraWant]);
  t(`${label}: the site's own \`detail\` is unchanged — the plane's sentence, not the member's`,
    typeof r?.detail === "string" && r.detail.includes(detailNeedle), true);
  /* THE SENTENCE IS FLOORED AS WELL AS COMPARED. Comparing the wire's translation with the row it was
     built from is an equality that costs nothing if the row itself went empty — the failure this
     project has measured a headline assertion passing over three times — so the arriving sentence is
     also required to BE a sentence. */
  t(`${label}: AND THE TRANSLATION ARRIVED — code, check and the catalogue's own sentence, on the wire`,
    [r?.code, r?.check, typeof r?.translation === "string" && r.translation.length > 100,
     r?.translation === ROW(code).translation],
    [code, ROW(code).check, true, true]);
  return r;
};

await wire("STATEMENT_ACK_NO_SUBJECT", "C-82.2 naming neither a draft nor a case edition",
  `token=${ELLA}`, () => [], [], "name the statement to acknowledge");
await wire("STATEMENT_ACK_ALREADY_SIGNED", "C-82.3 acknowledging a SIGNED edition",
  `case=${CS}&edition=1&token=${ELLA}`, (r) => [r?.caseId, r?.edition], [CS, 1], "is signed, and its completeness block");
await wire("STATEMENT_ACK_NOT_A_PARTICIPANT", "C-82.4 an invited member who has not joined",
  `draft=${D1.draftId}&token=${PAT}`, () => [], [], "JOINED participant");
await wire("STATEMENT_ACK_NO_STATEMENT", "C-82.5 a draft that says nothing about what it leaves out",
  `draft=${DNOSTMT.draftId}&token=${ELLA}`, () => [], [], "states nothing about what its case excludes");
await wire("STATEMENT_ACK_BY_ITS_AUTHOR", "C-82.6 the statement's own author",
  `draft=${D1.draftId}&token=${IRIS}`, (r) => [r?.author], ["iris"], "you wrote this statement");

console.log("\n--- 5. OVER-STRICTNESS: the act that SHOULD work still works, carrying no refusal keys ---");
{
  const ok = await ack(`draft=${D1.draftId}&token=${ELLA}`);
  t("the joined second reader's acknowledgement is RECORDED, and carries none of the three refusal keys — "
  + "a decorator that stamped every answer would fail here by name",
    [ok?.ok, ok?.acknowledgement?.by, ok?.code, ok?.check, ok?.translation],
    [true, "ella", undefined, undefined, undefined]);
  t("and the five refusals above wrote nothing: this is the FIRST acknowledgement of that statement",
    ok?.existed, false);
}

/* THE SIXTH IS STATED, NOT SCORED. */
console.log("\n--- 6. C-82.7 is NOT driven, and that is a fact about the plane, not a gap in this suite ---");
t("STATEMENT_ACK_AUTHOR_UNDETERMINED needs a draft with a statement and a NULL `statement_by`, which no "
+ "sequence of ops can produce since REC-193 stamps that column at every statement write. It is pinned "
+ "structurally above and its row is asserted above; it is NOT driven here.",
  [typeof ROW("STATEMENT_ACK_AUTHOR_UNDETERMINED").translation, /statement_by = \?|statement_by/.test(store)],
  ["string", true]);

await mf.dispose();
/* THE TAIL LINE IS THE BATTERY'S CONTRACT (D-93, D-413): `scripts/battery.mjs` reads `N pass, M fail`
   off it, and the COMMA is load-bearing. */
console.log(`\nd507-statement-ack-translation: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
