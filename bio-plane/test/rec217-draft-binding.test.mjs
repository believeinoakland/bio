/* NEGATIVE CONTROL: (declared before arming; the run's figures are filled in below from what the suite printed)
   (0) BASELINE, nothing armed. MUST be green.
   (a) THE ROW'S OWN CONTROL — BIND BY STATEMENT BYTES INSTEAD OF THE NAMED DRAFT: in `#statementAcknowledgements`
       the link arm `(case_id IS NULL AND draft_id = ?)` becomes `(case_id IS NULL AND ? <> '')`, so a case
       document naming ANY draft lists every same-sentence reading recorded at no case identity. DECLARED: MUST
       FAIL block 3's "THE TWIN ... lists NOBODY" row BY NAME (the twin lists ella); MUST NOT fail block 1's
       accepts-when rows or block 2's undetermined row.
   (b) THE LINK DROPPED — `op=publish` ignores `draft=` (`boundDraft` never set). DECLARED: MUST FAIL block 1's
       accepts-when rows (the list is empty and the reading is counted undetermined); MUST NOT fail block 2.
   (c) OVER-STRICTNESS — the draft door keeps REC-194's "a draft naming no case reaches NOTHING" (`found` asks
       `case_id IS ?` alone). DECLARED: MUST FAIL block 4's post-publication rows (participant and recipient);
       MUST NOT fail blocks 1-3.
   Every restore by `cp` from a uniquely-named per-arm pristine copy in the session scratchpad, verified by
   sha256 AND `cmp`, never `git checkout --`.
   CONTROL RUN 2026-09-24 by the REC-217 worker on land/worker/REC-217, each arm ALONE on `src/store.mjs` (the suite
   runs `src/index.mjs` directly, so no bundle is in the loop); every restore `sha256sum -c` OK (1dcfc508…a4d960) and
   `cmp` identical, 3,336,642 bytes:
   (0) BASELINE 23 pass, 0 fail.
   (a) 20 pass, 3 FAIL — block 3's "THE TWIN ... lists NOBODY" BY NAME, as declared; blocks 1 and 2 GREEN, as
       declared. The two further FAILs were not in the declaration and are the same defect seen from two more rows,
       recorded rather than smoothed: block 3's next row (the byte-bound twin also stops printing "Nobody but its
       author") and block 6's (a second draft of one sentence then lists the reading of the FIRST draft too).
   (b) 8 pass, 15 FAIL — every block-1 accepts-when row, block 3's, block 4's and block 6's (each needs the link),
       and block 5's ALREADY_BOUND row (nothing was bound to refuse); block 2 GREEN, as declared.
   (c) 19 pass, 4 FAIL — exactly block 4's four post-publication rows (participant, recipient, re-authored bytes,
       the stale-then-fresh ratify); blocks 1-3, 5 and 6 GREEN, as declared.
   ALL THREE AS DECLARED, with (a)'s two extra rows stated above.
   THE SUBJECT CHANGED AFTER THE CONTROL: the gate's `bounds.test.mjs` refused a SQL literal (`LIMIT 1`) inside
   `acknowledgeStatement` — this item's own read of the draft's link — so that read moved to `#draftLinkOf`. Arm (b)
   was RE-RUN ALONE on the changed `src/store.mjs` (restored `sha256sum -c` OK e52d8160…0786c9, `cmp` identical,
   3,337,185 bytes): 8 pass, 15 FAIL, the same fifteen rows, block 2 GREEN — the control still bites.

   REC-217 / BIO_Publication_v0_1.md §3 rules 11 and 13 — BOB #33 RULED 2026-09-24 19:14Z: `op=publish` NAMES THE
   DRAFT IT PUBLISHES (`draft=`, optional, additive), and AT THAT ACT the readings taken through that draft BIND to
   the case it produced. The link is an ACT, recorded with who made it (the publisher) and when, and the case
   document states it in words — "readings given on draft <id>, which <publisher> named as this case's draft at
   publication" — so a signature covers a link whose author is named, not an inference. Without `draft=`,
   REC-194's provisional STANDS: an unbindable reading is counted and stated UNDETERMINED, never named.

   EVERY BLOCK IS DRIVEN THROUGH THE CONTROL PLANE (`op=casedraft`, `op=reviewgrant`, `op=statementack`,
   `op=publish`, `op=casedocument`, `op=caseratify`, `op=publishedcase`, `op=reviewcopy`), never the store:
     1. ACCEPTS-WHEN: a participant's and a review-copy RECIPIENT's readings of a NEW case's draft appear in the
        published case's SIGNED list, each marked with the draft, with the link stated in the frontmatter and in
        the ruling's own words in the prose — and the public read serves both, committed from the signed bytes;
     2. WITHOUT `draft=` REC-194's undetermined count STANDS (the measured failure this row moves);
     3. THE TWIN: another case whose statement is BYTE-IDENTICAL, published naming ITS OWN draft, lists NOBODY —
        the named draft binds, the sentence does not (the row's negative control fails exactly here);
     4. THE DRAFT DOOR AFTER PUBLICATION: a reading given through the named draft while its case document is
        unsigned re-authors that document — for a RECIPIENT too, which is REC-194's reported gap closed;
     5. THE THREE REFUSALS, each by its catalogue row, each leaving the finding unprepared;
     6. A READING OF ONE SENTENCE ON TWO DRAFTS IS TWO READINGS (the idempotence key this landing corrected).

   WHAT A LIAR WOULD DO: bind by the statement's bytes (block 3 fails); accept `draft=` and bind nothing (block 1
   fails); bind and never say so (block 1's prose and frontmatter rows fail); bind the draft door only before
   publication (block 4 fails). EXPECTATIONS ARE NOT DERIVED FROM THE THING UNDER TEST: every statement is a
   string this suite passed in and every fingerprint is computed here with node:crypto.

   D-667 NEGATIVE CONTROL (RUN 2026-09-25 by WORKER D-667, D-564's pattern), THE RECORDER — every section now runs in
   `block()` (D-548's recorder), so the arms break a section's FIXTURE. Re-run in one step: `node
   test/d564-block.control.mjs rec217-draft-binding` from bio-plane/. BASELINE -> **23 pass, 0 fail**, per section
   0 (setup) 0/0, 0b (corpus) 0/0, 1..6 7/0, 1/0, 3/0, 5/0, 5/0, 2/0, foot reached — the same 23 as before.
   (f) SECTION 2's FIXTURE BROKEN — ella's acknowledgement names `${D2}-BROKEN`, a draft that does not exist.
       MEASURED: **22 pass, 1 fail**, exit 1, foot reached, `BLOCK 2 DIED: (fixture) ack D2`; 1 and 3-6 at their
       baseline tallies (no later section reads 2's reading, which is of the "plain" sentence alone).
   (g) THE RECORDER DISARMED (`block()` rethrows) over (f)'s fixture — MEASURED: no foot and no section tally (-1),
       exit 1. */

import { withSurfacingRun } from "./surfacing-run.mjs";
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";
import { parseFrontmatter, CASE_DERIVATION_CHECKS } from "../checks/bio-checks.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- rec217-draft-binding ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("rec217-draft-binding: SKIPPED — ssh-keygen not on PATH; the binding is asserted in a case document "
    + "a member really signed");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r217", MEMBER_TOKEN: "mem-r217", PROBE_TOKEN: "prb-r217", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
/* D-667 (D-564's pattern): EVERY SECTION RUNS INSIDE `block()` — D-548's recorder (d84-case-manifest.test.mjs), adopted. Before it,
   `bail()` disposed the sandbox and exited on the FIRST fixture failure ("FIXTURE ABORTED"), so one broken fixture
   ended the run and every later section went unmeasured. Now a fixture failure is a THROW that `block()` records as
   ONE failure naming its section, and the sections after it still run and report. Each section's own tally is
   printed at the foot; a section that DIED prints -1, never the partial count it reached; a section expected but
   never reported fails by name. A section resting on an earlier one's values asks for them with `needs()` and dies
   naming the section it rests on. */
const bail = (what, r) => { throw new Error(`(fixture) ${what}: ${JSON.stringify(r).slice(0, 600)}`); };
const needs = (section, vals) => {
  const missing = Object.entries(vals).filter(([, v]) => v === undefined).map(([k]) => k);
  if (missing.length) throw new Error(`rests on section ${section}, which did not produce ${missing.join(", ")}`);
};
const TALLY = [];
const block = async (name, fn) => {
  const p0 = pass, f0 = fail;
  let died = false;
  try { await fn(); }
  catch (e) {
    died = true;
    fail++;
    console.log(`  FAIL  BLOCK ${name} DIED: ${String((e && e.message) || e).slice(0, 700)}`);
    console.log("         (the sections after this one still run — see below)");
  }
  TALLY.push({ name, pass: died ? -1 : pass - p0, fail: died ? -1 : fail - f0, died });
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const ack = async (q) => rP(await POST(`op=statementack&${q}`, {}));

/* ---- keys and roster ---- */
const dir = mkdtempSync(join(tmpdir(), "rec217-"));
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
  const add = rP(await POST("op=memberadd&token=adm-r217",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  if (!add?.ok || !add.invite) bail(`memberadd ${memberId}`, add);
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) bail(`enroll ${memberId}`, en);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) bail(`login ${memberId}`, lg);
  return lg.token;
};
/* D-667: the values a later section reads, declared once here and ASSIGNED inside the section that makes them. */
let IRIS, ELLA, PAT, PROJ, OTHER, S1, D1, C1;
console.log("\n--- 0. setup: two administrators, iris, ella and pat, and the two projects ---");
await block("0 (setup)", async () => {
await enrol("nadia", "nadia-passphrase-217", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-217", "admin", ["contribute", "publish"]);
/* iris OWNS both projects, writes every statement and signs; ella and pat are JOINED participants of PROJ. */
IRIS = await enrol("iris", "iris-passphrase-217", "member", ["contribute", "publish"]);
ELLA = await enrol("ella", "ella-passphrase-217", "member", ["contribute", "publish"]);
PAT = await enrol("pat", "pat-passphrase-217", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-r217", { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" }));

PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r217", owner: "iris",
  name: "PROJ-2026-2170-named-draft", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
OTHER = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r217", owner: "iris",
  name: "PROJ-2026-2171-other", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
for (const [h, tok] of [["ella", ELLA], ["pat", PAT]]) {
  const inv = rP(await GET(`op=projectinvite&token=${IRIS}&projectId=${encodeURIComponent(PROJ)}&handle=${h}`));
  if (!inv?.ok) bail(`projectinvite ${h}`, inv);
  const jn = rP(await GET(`op=projectjoin&token=${tok}&projectId=${encodeURIComponent(PROJ)}`));
  if (jn?.state !== "joined") bail(`projectjoin ${h}`, jn);
}
});

/* ---- the corpus: d150's shapes, lifted rather than invented ---- */
let snapSeq = 0;
const promote = async (id, text, objectType, state) => rP(await POST("op=promote&token=adm-r217", {
  bundleId: id, base: null,
  snapKey: `20260924T${String(400000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
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

const INFO = "INFO-2026-2170-memo";
console.log("\n--- 0b. the corpus: the memo every finding cites ---");
await block("0b (corpus)", async () => {
if ((await promote(INFO, infoMd(INFO), "information", "collected")).ok === false) bail("promote info", {});
});
const finding = async (tag) => {
  const id = `INQ-2026-2170-${tag}`;
  const r = await promote(id, withAdoptableReading(inquiryMd(id, `Was ${tag} authorised?`, INFO)), "inquiry", "open");
  if (r.ok === false) bail(`promote ${id}`, r);
  const c = rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(id)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id}.`)}` + adoptedVersionParam()));
  if (!c.ok) bail(`conclude ${id}`, c);
  return id;
};
const args = (project, tag, over = {}) => ({
  project, scope: `Whether the transfer was authorised (${tag}).`,
  statement: `This case covers the FY2024 transfer only (${tag}); the FY2023 memo is out of it.`,
  excluded: [{ target: null, description: `the FY2023 memo (${tag})`, reason: "a records request is outstanding" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: `We put the claims to the City Administrator (${tag}).`,
  biasAcknowledgement: `This group holds that transfers should be adopted in public (${tag}).`,
  ...over,
});
const withRoles = (b) => ({ ...b, roles: allLoadBearing(b) });
const fmOf = (text) => parseFrontmatter(text || "").data || {};
const docOf = async (caseId, edition) => rP(await GET(`op=casedocument&case=${caseId}&edition=${edition}&token=${IRIS}`));
const ratify = async (caseId, edition, docSha) =>
  rP(await POST(`op=caseratify&token=${IRIS}`, { caseId, edition, expectedSha: docSha,
                                                  sig: signCase("iris", caseId, edition, docSha) }));
const draftOf = async (tag, targets, over = {}) => {
  const d = rP(await POST(`op=casedraft&token=${IRIS}`, withRoles({ ...args(PROJ, tag, over), targets })));
  if (!d?.ok) bail(`casedraft ${tag}`, d);
  return d.draftId;
};
const publish = async (tag, targets, extra = {}) =>
  rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(PROJ, tag), targets, ...extra })));
const LINK = (d) => `Readings given on draft ${d}, which iris named as this case's draft at publication`;

console.log("\n--- rec217-draft-binding ---");

/* =========================================================================== 1 */
console.log("\n--- 1. ACCEPTS-WHEN: a reading of a NEW case's draft reaches the signed list, the link stated ---");
await block("1", async () => {
needs("0 (setup)", { IRIS, ELLA, PROJ });
const LEAD = await finding("lead");
S1 = args(PROJ, "lead").statement;
D1 = await draftOf("lead", [LEAD]);
const G1 = rP(await POST(`op=reviewgrant&token=${IRIS}`, { draft: D1, recipient: "Dana Ruiz, City Auditor's office" }));
if (!G1?.ok || !G1.secret) bail("reviewgrant D1", G1);
const A1 = await ack(`draft=${D1}&token=${ELLA}`);
const A2 = await ack(`draft=${D1}&secret=${encodeURIComponent(G1.secret)}`);
t("FIXTURE: ella and the recipient read the draft of a NEW case — recorded at no case identity, through D1",
  [A1?.ok, A1?.acknowledgement?.case_id, A1?.acknowledgement?.draft_id, A2?.ok, A2?.acknowledgement?.draft_id,
   A1?.bound_to_a_case],
  [true, null, D1, true, D1, false]);
const P1 = await publish("lead", [LEAD], { draft: D1 });
if (P1?.ok === false || !P1?.caseDocument?.doc_sha) bail("publish lead with draft", P1);
C1 = P1.caseDocument.case_id;
t("op=publish NAMING the draft lists BOTH readings — ella and the recipient's grant — each marked with the draft, "
+ "and counts NONE as unbindable",
  [(P1?.completeness?.acknowledgements || []).map((a) => [a.kind, a.by, a.draft ?? null]),
   P1?.completeness?.acknowledgements_unbindable_to_this_case ?? 0],
  [[["participant", "ella", D1], ["recipient", G1.grantId, D1]], 0]);
t("and the answer states the link AS AN ACT: which draft, named by whom, when — the publisher, at this act",
  [P1?.completeness?.draft?.draft_id, P1?.completeness?.draft?.named_by,
   P1?.completeness?.draft?.named_at === P1?.at, P1?.completeness?.draft?.acknowledgements_bound],
  [D1, "iris", true, 2]);
{
  const doc = await docOf(C1, 1);
  const fm = fmOf(doc?.text);
  t("THE DOCUMENT'S FRONTMATTER carries the link beside its author — draft, draft_named_by, draft_named_at — and "
  + "its list marks each row with the draft",
    [fm.completeness?.draft, fm.completeness?.draft_named_by, fm.completeness?.draft_named_at === fm.completeness?.at,
     fm.completeness?.acknowledged, (fm.completeness_acknowledgements || []).map((a) => [a.by, a.draft])],
    [D1, "iris", true, 2, [["ella", D1], [G1.grantId, D1]]]);
  t("THE PROSE a member reviews says it in the ruling's own words, names each reader on the draft, and prints "
  + "neither the undetermined tail nor 'Nobody'",
    [(doc?.text || "").includes(LINK(D1)),
     (doc?.text || "").includes(`- ella, a participant of ${PROJ}, on ${A1.acknowledgement.at} — given on draft ${D1}`),
     (doc?.text || "").includes(`review grant ${G1.grantId}`),
     /UNDETERMINED: a case id is minted only by publication/.test(doc?.text || ""),
     /whether any of them is a reading of THIS case is UNDETERMINED/.test(doc?.text || ""),
     /Nobody/.test((doc?.text || "").split("**Who else read this statement.**")[1]?.split("## What Was Searched")[0] || "")],
    [true, true, true, false, false, false]);
  const r = await ratify(C1, 1, doc?.doc_sha);
  t("THE OWNER SIGNS THE STATED LINK: op=caseratify admits the bytes (C-41.10 over a list naming a recipient and a "
  + "participant, neither the statement's writer nor its publisher)",
    [r?.ok !== false, r?.reason ?? null], [true, null]);
  const pc = rP(await GET(`op=publishedcase&id=${C1}`));
  const comp = pc?.completeness ?? pc?.case?.completeness ?? {};
  t("THROUGH THE PUBLIC READ, committed FROM THE SIGNED BYTES: both readers with their draft, and the link with "
  + "its author and time",
    [(comp.acknowledgements || []).map((a) => [a.kind, a.by, a.draft ?? null]),
     comp.draft?.draft_id, comp.draft?.named_by, comp.draft?.named_at === fm.completeness?.draft_named_at],
    [[["participant", "ella", D1], ["recipient", G1.grantId, D1]], D1, "iris", true]);
}
});

/* =========================================================================== 2 */
console.log("\n--- 2. WITHOUT draft=, REC-194's undetermined count STANDS ---");
await block("2", async () => {
needs("0 (setup)", { IRIS, ELLA, PROJ });
{
  const Q2 = await finding("plain");
  const D2 = await draftOf("plain", [Q2]);
  if (!(await ack(`draft=${D2}&token=${ELLA}`))?.ok) bail("ack D2", {});
  const P2 = await publish("plain", [Q2]);
  if (P2?.ok === false || !P2?.caseDocument?.doc_sha) bail("publish plain", P2);
  const doc = await docOf(P2.caseDocument.case_id, 1);
  t("the same act WITHOUT draft= lists nobody, COUNTS ella's reading as unbindable, states no link, and the "
  + "document says UNDETERMINED and not 'Nobody but its author' — the measured state this row moves, unmoved",
    [(P2?.completeness?.acknowledgements || []).length, P2?.completeness?.acknowledgements_unbindable_to_this_case,
     P2?.completeness?.draft ?? null, fmOf(doc?.text).completeness?.draft ?? null,
     /whether any of them is a reading of THIS case is UNDETERMINED/.test(doc?.text || ""),
     /Nobody but its author acknowledged it\./.test(doc?.text || ""),
     (doc?.text || "").includes("named as this case's draft at publication")],
    [0, 1, null, null, true, false, false]);
}
});

/* =========================================================================== 3 */
console.log("\n--- 3. THE TWIN: a BYTE-IDENTICAL statement under another named draft binds nothing ---");
await block("3", async () => {
needs("0 (setup)", { IRIS, PROJ });
needs("1", { S1 });
{
  const QT = await finding("twin");
  /* The SAME sentence as block 1's, on purpose: `args(PROJ, "lead")` — asserted byte-identical from the strings. */
  const DT = await draftOf("twin", [QT], { statement: S1 });
  const copyT = rP(await GET(`op=reviewcopy&draft=${DT}&token=${IRIS}`));
  t("FIXTURE ARMS THE TRAP: the twin's draft holds block 1's sentence byte for byte (hash computed here), and "
  + "nobody has read the twin's draft",
    [copyT?.authored?.statement === S1, copyT?.statement_acknowledgements?.statement_sha === sha(S1),
     (copyT?.statement_acknowledgements?.acknowledgements || []).length],
    [true, true, 0]);
  const PT = await publish("twin", [QT], { draft: DT, statement: S1 });
  if (PT?.ok === false || !PT?.caseDocument?.doc_sha) bail("publish twin", PT);
  const doc = await docOf(PT.caseDocument.case_id, 1);
  t("THE TWIN, published naming ITS OWN draft, lists NOBODY — ella read block 1's draft, which carries the same "
  + "sentence and is another production; the named draft binds, the sentence does not",
    [(PT?.completeness?.acknowledgements || []).map((a) => a.by), fmOf(doc?.text).completeness?.acknowledged,
     PT?.completeness?.draft?.draft_id, PT?.completeness?.draft?.acknowledgements_bound],
    [[], 0, DT, 0]);
  t("and it does not count block 1's readings as UNDETERMINED either — they are bound, to block 1's case — so the "
  + "document says nobody but its author read it, beside its own link",
    [PT?.completeness?.acknowledgements_unbindable_to_this_case ?? 0,
     /Nobody but its author acknowledged it\./.test(doc?.text || ""), (doc?.text || "").includes(LINK(DT))],
    [0, true, true]);
}
});

/* =========================================================================== 4 */
console.log("\n--- 4. THE DRAFT DOOR AFTER PUBLICATION reaches the document the draft was named for ---");
await block("4", async () => {
needs("0 (setup)", { IRIS, ELLA, PAT, PROJ });
{
  const Q4 = await finding("late");
  const D4 = await draftOf("late", [Q4]);
  const G4 = rP(await POST(`op=reviewgrant&token=${IRIS}`, { draft: D4, recipient: "Lee Park, Civil Grand Jury" }));
  if (!G4?.ok || !G4.secret) bail("reviewgrant D4", G4);
  const P4 = await publish("late", [Q4], { draft: D4 });
  if (P4?.ok === false || !P4?.caseDocument?.doc_sha) bail("publish late", P4);
  const C4 = P4.caseDocument.case_id;
  const before = P4.caseDocument.doc_sha;
  const Ap = await ack(`draft=${D4}&token=${PAT}`);
  t("pat reads the named draft AFTER publication: the act says the reading binds to that case, names the link, and "
  + "re-authors the UNSIGNED document",
    [Ap?.ok, Ap?.bound_to_a_case, Ap?.draft_link?.case_id, Ap?.draft_link?.named_by, Ap?.draft_link?.signed,
     (Ap?.case_documents || []).map((d) => [d.case_id, d.reauthored, d.acknowledged])],
    [true, true, C4, "iris", false, [[C4, true, 1]]]);
  const Ar = await ack(`draft=${D4}&secret=${encodeURIComponent(G4.secret)}`);
  t("AND A RECIPIENT, who holds no session and so has no case door, reaches the new case's signed list the same "
  + "way — REC-194's reported gap, closed by the link",
    [Ar?.ok, Ar?.bound_to_a_case, (Ar?.case_documents || []).map((d) => [d.case_id, d.reauthored, d.acknowledged])],
    [true, true, [[C4, true, 2]]]);
  const doc = await docOf(C4, 1);
  t("the re-authored bytes list both, each on the draft, with the link sentence kept — and the old hash is stale",
    [doc?.doc_sha !== before, (fmOf(doc?.text).completeness_acknowledgements || []).map((a) => [a.by, a.draft]),
     (doc?.text || "").includes(LINK(D4)), fmOf(doc?.text).completeness?.draft],
    [true, [["pat", D4], [G4.grantId, D4]], true, D4]);
  const stale = await ratify(C4, 1, before);
  const r = await ratify(C4, 1, doc?.doc_sha);
  t("the owner signs what names them: the pre-reading hash is refused as stale, the re-authored one ratifies",
    [stale?.ok === false, r?.ok !== false], [true, true]);
  const after = await ack(`draft=${D4}&token=${ELLA}`);
  t("once SIGNED, a further reading of the draft is recorded, re-authors nothing, and the act says it can appear in "
  + "no signed document of that edition",
    [after?.ok, after?.draft_link?.signed, (after?.case_documents || []).length, /already SIGNED/.test(after?.listed || "")],
    [true, true, 0, true]);
}
});

/* =========================================================================== 5 */
console.log("\n--- 5. THE THREE REFUSALS: a link that would be false is refused by its row ---");
await block("5", async () => {
needs("0 (setup)", { IRIS, PROJ, OTHER });
needs("1", { D1, C1 });
{
  const Q5 = await finding("refused");
  const row = (code) => [code, CASE_DERIVATION_CHECKS[code].check, CASE_DERIVATION_CHECKS[code].translation];
  const said = (r) => [r?.reason, r?.check, r?.translation];
  const nf = await publish("refused", [Q5], { draft: "DRAFT-2026-9999" });
  t("a draft that does not exist: PUBLISH_DRAFT_NOT_FOUND, with C-44.3's row", said(nf), row("PUBLISH_DRAFT_NOT_FOUND"));
  const otherDraft = rP(await POST(`op=casedraft&token=${IRIS}`,
    withRoles({ ...args(OTHER, "other"), targets: [Q5] })));
  if (!otherDraft?.ok) bail("casedraft other project", otherDraft);
  const op = await publish("refused", [Q5], { draft: otherDraft.draftId });
  t("ANOTHER PROJECT'S draft, though its caller can read it, is answered the same — it is not this project's",
    said(op), row("PUBLISH_DRAFT_NOT_FOUND"));
  const Dc = rP(await POST(`op=casedraft&token=${IRIS}`, withRoles({ ...args(PROJ, "named"), caseId: C1, targets: [Q5] })));
  if (!Dc?.ok) bail("casedraft naming C1", Dc);
  const nt = await publish("refused", [Q5], { draft: Dc.draftId, newCase: true });
  t("a draft of an EXISTING case named on a NEW one: PUBLISH_DRAFT_NOT_THIS_CASE, with C-44.4's row, naming both",
    [...said(nt), nt?.draft_case, nt?.case_id], [...row("PUBLISH_DRAFT_NOT_THIS_CASE"), C1, null]);
  const ab = await publish("refused", [Q5], { draft: D1 });
  t("block 1's draft, already bound to its case, named for another: PUBLISH_DRAFT_ALREADY_BOUND, with C-44.5's row",
    [...said(ab), ab?.bound_to?.case_id, ab?.bound_to?.edition], [...row("PUBLISH_DRAFT_ALREADY_BOUND"), C1, 1]);
  const ok = await publish("refused", [Q5]);
  t("and none of them left anything behind: no refused act prepared the finding, so it then publishes, without "
  + "draft=, as a new case (ALREADY_A_CASE_MEMBER would refuse a finding a refused act had prepared)",
    [ok?.ok !== false, typeof ok?.caseId === "string" && ok.caseId !== C1], [true, true]);
}
});

/* =========================================================================== 6 */
console.log("\n--- 6. ONE SENTENCE READ ON TWO DRAFTS IS TWO READINGS ---");
await block("6", async () => {
needs("0 (setup)", { IRIS, ELLA, PROJ });
{
  const Qa = await finding("pairA"), Qb = await finding("pairB");
  const SP = args(PROJ, "pair").statement;
  const Da = await draftOf("pair", [Qa]);
  const Db = await draftOf("pair", [Qb], { statement: SP });
  const first = await ack(`draft=${Da}&token=${ELLA}`);
  const second = await ack(`draft=${Db}&token=${ELLA}`);
  t("ella reads the same sentence on two drafts of new cases: the SECOND is a new act on its own draft, not "
  + "'existed' on the first — so the second draft's review copy lists her",
    [first?.existed, second?.existed, second?.acknowledgement?.draft_id,
     (rP(await GET(`op=reviewcopy&draft=${Db}&token=${IRIS}`))?.statement_acknowledgements?.acknowledgements || [])
       .map((a) => a.by)],
    [false, false, Db, ["ella"]]);
  const Pb = await publish("pair", [Qb], { draft: Db, statement: SP });
  t("and the case the second draft produced lists her reading of THAT draft, and counts her reading of the first "
  + "as undetermined (nobody named that draft)",
    [(Pb?.completeness?.acknowledgements || []).map((a) => [a.by, a.draft]),
     Pb?.completeness?.acknowledgements_unbindable_to_this_case],
    [[["ella", Db]], 1]);
}
});

/* D-667: every section's own tally, -1 for one that DIED; a section that never recorded at all is named missing
   rather than read as clean — the foot counts the sections it expected against the ones that reported. */
const EXPECTED = ["0 (setup)", "0b (corpus)", "1", "2", "3", "4", "5", "6"];
console.log("\n--- per-section tallies (D-667: -1 = the section DIED, its tally is missing) ---");
for (const n of EXPECTED) {
  const r = TALLY.find((x) => x.name === n);
  if (!r) { fail++; console.log(`  FAIL  section ${n}: NEVER REPORTED — tally -1`); continue; }
  console.log(`  section ${n}: ${r.pass} pass, ${r.fail} fail${r.died ? "  [DIED]" : ""}`);
}
const DIED = TALLY.filter((x) => x.died).map((x) => x.name);
console.log(`\nrec217-draft-binding: ${pass} pass, ${fail} fail  [FOOT REACHED${DIED.length ? `; DIED: ${DIED.join(", ")}` : ""}]`);
await mf.dispose();
process.exit(fail ? 1 : 0);
