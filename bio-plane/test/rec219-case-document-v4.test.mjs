/* NEGATIVE CONTROL: (declared and RUN 2026-09-25, WORKER REC-219 under SCHEDULER #21, RE-RUN WHOLE after D-579(a)
   joined the row) FIVE ARMS PLUS A BASELINE, each armed ALONE by an anchor asserted to match EXACTLY ONCE, the
   suite run directly (it loads `src/index.mjs`, so no rebuild sits between the arm and the measurement), every
   restore by `cp` from a uniquely-named per-arm pristine copy and verified by sha256 AND `cmp` (bio-checks.mjs
   4dbb1f34…, 974,715 bytes; store.mjs 4e54bae7…, 3,362,509 bytes). Lettered from (a) for `control-register.mjs`.
   (0) BASELINE, nothing armed -> **39 pass, 0 fail**, foot reached.
   (a) THE ROW'S OWN ARM — OMIT THE REFUSAL: C-41.14's first `findings.push` (the absent count or list)
   disabled. Declared: MUST fail NO-PENDING-REFUSED by name; MUST NOT fail sections 1, 3, 4 or 5 ->
   **37 pass, 2 fail**: NO-PENDING-REFUSED and its no-count twin, exactly as declared.
   (b) THE LIAR (i) — BUMP THE TOKEN AND STAMP NOTHING: `publishCase()`'s manifest carries `pins_proposed: []`.
   Declared: MUST fail PENDING-NAMED by name; MUST NOT fail sections 3 or 5 -> **31 pass, 8 fail**:
   PENDING-NAMED first, the sentence, the prose, the echo and the FROZEN arm, plus three section-2 rows whose
   fixtures derive FROM case A's list (the count lie, the no-revision row, the two-row over-strictness), which
   read nothing once it is empty — the arm's reach, named rather than smoothed.
   (c) THE LIAR (ii) — THE OVER-STRICT GATE: `caseDocumentRequiresV4Disclosures` true for EVERY format.
   Declared: MUST fail /3-STILL-RATIFIES by name, and section 5's /3 row (the same predicate gates C-41.15) ->
   **37 pass, 2 fail**: those two.
   (d) D-579(a)'S OWN ARM — DROP THE PIN: op=cite's case arm stamps no `extent_capture`. Declared: MUST fail
   PINNED-EDGE by name; MUST NOT fail sections 1-4 -> **34 pass, 5 fail**: the act's echo, the edge's bytes,
   PINNED-EDGE (the edge now reads `undetermined`, never the later capture), the prose line, and
   NO-PIN-REFUSED, whose fixture drops a capture from a row that no longer has one.
   (e) D-579(a) — OMIT THE ROW REFUSAL: C-41.15's row `findings.push` disabled. Declared: MUST fail
   NO-PIN-REFUSED by name -> **36 pass, 3 fail**: NO-PIN-REFUSED, the back-fill lie and the off-vocabulary row.
   ---

   REC-219 — `bio-case-document/4`: A PUBLISHED CASE STATES AN ADOPTION PINNING A PROPOSED REVISION.

   BOB #34, 2026-09-24 23:08Z, folded into `BIO_Publication_v0_1.md` §3 rule 18: *"The signed document
   states the scope's bias position AS IT STOOD AT SIGNING. 'No manifest was in force' is true, but silence
   about an adoption that pins a PROPOSED revision lets a later reader take 'nobody declared anything' for
   'a declaration was pending', and the record may not imply more than it holds. So the frozen
   `bias_manifest` block states both facts: none in force, and an adoption pinning a proposed revision (its
   id), not yet in force. It says nothing about when or whether that revision will take effect. /3
   documents stay valid and are read as they are, with no re-signing."*

   ACCEPTS-WHEN, clause by clause, and the section of this suite that answers it:
     - a case published under a proposed-only adoption signs a /4 block naming the pending revision
                                                                            -> section 1 (PENDING-NAMED)
     - a /3 document still ratifies unchanged                              -> section 3 (/3-STILL-RATIFIES)
     - NEGATIVE CONTROL: omit the field and the new check refuses by name  -> section 2 (NO-PENDING-REFUSED)
     - D-579(a), carried by this row (SCHEDULER #21 02:35Z, BOB #34 02:30Z): each citation edge of the case is
       pinned INSIDE the signed /4 document, and C-41.15 refuses a /4 whose edge omits the pin
                                                                           -> section 5 (PINNED-EDGE, NO-PIN-REFUSED)
   HOW A LIAR PASSES IT: (i) bump the token and stamp nothing, so the /4 rows read right and the block is
   as silent as /3's; (ii) require the list of EVERY format, so /3 documents already signed stop
   ratifying; (iii) stamp the list from a SECOND read of the adoption table rather than op=biasmanifest's
   answer, which can disagree with the manifest it sits beside. The PENDING-NAMED row asks for the revision
   op=biasadopt PINNED, read back from the act's own answer; the /3 row asks the gate to pass the same bytes
   with the token set back; and the FROZEN row moves the adoption after signing.

   WHAT THIS CANNOT SEE: (1) the /3 row runs `runCaseGate` — the function op=caseratify runs — over bytes
   op=publish authored with the token set back to /3; no op authors /3 any more and this plane has no SQL
   surface to plant one, so a /3 document is not driven through op=caseratify here (d84-case-manifest
   section 5's limitation, for the same reason). (2) C-41.14 cannot see the RECORD at signing (see its
   comment in `checks/bio-checks.mjs`): "the record held one and the block omits it" is enforced by
   op=publish authoring the list, and this suite drives THAT through the op.
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import { statedJSON } from "./stated.mjs";
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
import { parseFrontmatter, CASE_DOCUMENT_FAMILY, CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMATS_ACCEPTED,
         caseDocumentStatesMemberBlocks, caseDocumentRequiresDisclosures } from "../checks/bio-checks.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- rec219-case-document-v4 ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("rec219-case-document-v4: SKIPPED — ssh-keygen not on PATH; this item's subject is a block inside a "
    + "REAL signature over a case document, and a ceremony proved with our own verifier proves our verifier");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r219", MEMBER_TOKEN: "mem-r219", PROBE_TOKEN: "prb-r219", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const bail = (what, r) => {
  console.log(`  FAIL  (fixture) ${what}: ${JSON.stringify(r).slice(0, 600)}`);
  fail++;
  console.log(`\nrec219-case-document-v4: ${pass} pass, ${fail} fail  [FIXTURE ABORTED]`);
  mf.dispose().then(() => process.exit(1));
  throw new Error("fixture");
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

const dir = mkdtempSync(join(tmpdir(), "rec219-case-document-v4-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
/* THE STATEMENT WRITTEN OUT IN ASCII rather than imported from `src/sshsig.mjs`:
   an expectation taken from the thing under test agrees with it for free. */
const signCase = (who, caseId, edition, docSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify-case ${caseId} ${edition} ${docSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};

const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-r219",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-r219` });
  if (!en.ok) bail(`enroll ${memberId}`, en);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-r219` });
  if (!lg.token) bail(`login ${memberId}`, lg);
  return lg.token;
};
/* Two administrators before any member (4.2/4.3). NADIA authors the instance lens; IRIS owns the
   publishing project, authors its project lens, and publishes. */
const NADIA = await enrol("nadia", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "admin", ["contribute", "publish"]);
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
await POST("op=signeradd&token=adm-r219", { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" });

const PROJ = await makePublishingProject({
  post: async (q, b) => (await mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(b ?? {}) })).json(),
  mf, sha, machineToken: "adm-r219", owner: "iris",
  name: "PROJ-2026-2190-pending", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });

const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";

/* THE DOCUMENT SHAPES ARE `casesearched.test.mjs`'s, lifted rather than hand-rolled for that suite's
   own stated reason: what this suite is about is the MANIFEST, and a hand-rolled bundle the catalog
   accepts for the wrong reason would make every arm measure a document nobody would publish. */
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
/* CORRECTED at the c22-batch29 union (CONDUCT #22), never exempted: REC-219 was cut before D-563, whose C-86.4 refuses
   an envelope state the held document contradicts. `ground` promotes this finding under `concluded` while the bytes
   said `open`, so the projection read `concluded` only by taking the request's word; the document now SAYS the state
   it is filed under (D-563's own correction of the same shape in its fixtures). */
const inquiryMd = (id, cites, state = "open") => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", `  - target: ${cites}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${cites}`, "    role: supports",
  "    grade: D", "    grade_axis: connection", "    grade_source: testimony",
  "---", "",
  "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

/* THE BIAS SET's shape is `d85-surface-run.test.mjs`'s, which the manifest is already driven over. */
const biasMd = (id, state, sid, text) => ["---",
  `id: ${id}`, "object_type: bias", "schema: bias@1", `title: "Lens ${id}"`, `current_state: ${state}`,
  "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: human", "  capability_tier: member",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
  "statements:",
  `  - id: ${sid}`, '    kind: "scrutiny"', '    subject: "ENT-2026-0007"', `    text: ${JSON.stringify(text)}`,
  '    justification: "The office is a party to several matters this group is examining."',
  "    citations: []", "    locked: false",
  "---", "", "## Statements", "", "The lens this group works under.", "",
  "## Adoption", "", "Adopted at the members' meeting.", "",
  "## What This Does Not Enforce", "",
  "BIO checks that each statement names a registered subject and carries a justification.", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const BYTES = new Map();
const promote = async (tok, id, text, type, state, register = []) => {
  const r = await POST(`op=promote&token=${tok}`, {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260923T${String(210000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    /* CORRECTED at the c22-batch29 union (CONDUCT #22), never exempted: this item was cut before D-563, whose C-86.3 refuses an envelope title the held document contradicts; the envelope title `Bundle <id>` is dropped as D-563 dropped it in its own fixtures, and promote derives it from the document. */
    meta: { object_type: type, group: "believe-in-oakland",
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register });
  if (!r || r.ok === false || !r.bundleSha) bail(`promote ${id} -> ${state}`, r);
  HEAD.set(id, r.bundleSha);
  BYTES.set(r.bundleSha, text);   /* REC-187: every revision's bytes, keyed by the sha the PLANE returned */
  return r;
};
const reg = (s) => [{ sha256: s, path: `data/${s.slice(0, 4)}.pdf`, encoding: "binary", bytes: 10 }];

/* A case per clause, each resting on its own finding, so one case's edition never depends on
   another's and the frozen-bytes arm reads a document nothing else in this suite re-publishes. */
const ground = async (tag) => {
  const info = `INFO-2026-2190-${tag}`, lead = `INQ-2026-2190-${tag}`;
  await promote("adm-r219", info, infoMd(info), "information", "collected", reg(sha(`r219-${tag}`)));
  await promote("adm-r219", lead, inquiryMd(lead, info, "concluded"), "inquiry", "concluded");
  return lead;
};
const publishAndSign = async (lead, n) => {
  const pub = await POST(`op=publish&token=${IRIS}`, {
    project: PROJ, scope: `Whether transfer ${n} was authorised.`,
    targets: [lead], roles: allLoadBearing({ targets: [lead] }),
    statement: `This case does not cover transfers before ${n}.`,
    subjectPosition: "sought_no_answer", subjectJustification: "The subject was asked and declined.",
    biasAcknowledgement: `Case ${n}: the lens named in the manifest shaped which claims got a second record.`,
    excluded: [] });
  if (!pub || pub.ok === false || !pub.caseDocument?.doc_sha) bail(`publish ${n}`, pub);
  const d = pub.caseDocument;
  const rat = await POST(`op=caseratify&token=${IRIS}`, {
    caseId: d.case_id, edition: d.edition, expectedSha: d.doc_sha,
    sig: signCase("iris", d.case_id, d.edition, d.doc_sha) });
  if (!rat || rat.ok === false) bail(`caseratify ${n}`, rat);
  return pub;
};
const readDoc = async (pub) => GET(`op=casedocument&case=${pub.caseDocument.case_id}&edition=${pub.caseDocument.edition}`);
const lensOf = async () => GET(`op=biasmanifest&token=${IRIS}&scope=project&scopeId=${PROJ}`);


const pendingOf = (fm) => (fm.bias_manifest_pins_proposed || []).map((r) => [r.bundle_id, r.revision, r.scope, r.pinned_state]);
const FUTURE = /\b(will|until|once|eventually|when it is adopted|takes? effect)\b/i;

/* ===========================================================================
   1. A PROPOSED-ONLY ADOPTION — the signed /4 block states BOTH facts.
   =========================================================================== */
console.log("\n--- 1. the scope's only adoption pins a PROPOSED revision: the signed /4 block says none in force AND names it ---");
const BP = "BIAS-2026-2190-project";
const TXT_P1 = "Budget figures quoted by the office are checked against the adopted budget.";
for (const st of ["draft", "proposed"]) await promote(IRIS, BP, biasMd(BP, st, "p1", TXT_P1), "bias", st);
const PROPOSED_P = HEAD.get(BP);
const adP = await GET(`op=biasadopt&token=${IRIS}&bundleId=${BP}&scope=project&scopeId=${PROJ}`);
const L0 = await lensOf();
t("REACH: the adoption landed pinning the PROPOSED revision, and op=biasmanifest says NO MANIFEST WAS IN "
+ "FORCE with the adoption named beside it (REC-210) — so every row below measures a real pending adoption",
  [adP?.ok, adP?.pins_proposed, adP?.pinned?.bundle_sha === PROPOSED_P, L0?.in_force, L0?.stated,
   (L0?.pins_proposed || []).map((x) => [x.bundle_id, x.revision, x.scope])],
  [true, true, true, false, "no manifest was in force", [[BP, PROPOSED_P, "project"]]]);

const pubA = await publishAndSign(await ground("pending"), "A");
const docA = await readDoc(pubA);
const FA = parseFrontmatter(docA.text).data;
t("the case is SIGNED, and the document a stranger reads is `bio-case-document/4`",
  [docA.ratified, typeof docA.sig_armored === "string", FA.format], [true, true, "bio-case-document/4"]);
t("FIRST FACT, UNCHANGED: the frozen block still says no manifest was in force — true, and REC-210's "
+ "sentence verbatim — with no hash and no pair",
  [FA.bias_manifest?.in_force, FA.bias_manifest?.stated, FA.bias_manifest?.statements_sha, FA.bias_manifest_bundles],
  [false, "no manifest was in force", null, []]);
t("PENDING-NAMED ARM: the SECOND FACT — the frozen block counts one adoption pinning a proposed revision and "
+ "names it by bundle, by the REVISION op=biasadopt pinned, by scope and by the state it stood at",
  [FA.bias_manifest?.pins_proposed, pendingOf(FA)],
  [1, [[BP, adP?.pinned?.bundle_sha, "project", "proposed"]]]);
t("and says what the list is in a sentence that states the fact AT SIGNING and nothing about when or "
+ "whether the revision takes effect (BOB #34)",
  [/proposed and not accepted when this case was signed/.test(String(FA.bias_manifest?.pins_proposed_stated)),
   FUTURE.test(String(FA.bias_manifest?.pins_proposed_stated))],
  [true, false]);
const prose = (docA.text.split("## Bias Manifest")[1] || "").split("## Bias Acknowledgement")[0];
t("a PERSON reads both facts in the body, the revision named, and no word about the future",
  [prose.includes(`NO MANIFEST WAS IN FORCE for ${PROJ}`), prose.includes("AN ADOPTION PINNED A PROPOSED REVISION"),
   prose.includes(`- ${BP} (project) pinned revision ${PROPOSED_P}, standing at proposed`), FUTURE.test(prose)],
  [true, true, true, false]);
t("op=publish echoed the list it wrote, from the same answer the manifest is stamped from",
  [(pubA.bias_manifest?.pins_proposed || []).map((x) => x.revision), pubA.bias_manifest?.stated],
  [[PROPOSED_P], "no manifest was in force"]);
t("and it does NOT name who adopted it — a member's name in a signed public document is theirs to give (§3 rule 7)",
  [(FA.bias_manifest_pins_proposed || []).some((r) => "adopted_by" in r), docA.text.includes("adopted_by")],
  [false, false]);

/* ===========================================================================
   2. C-41.14 — THE GATE REFUSES A /4 DOCUMENT SILENT ABOUT THE PENDING ADOPTION.
   =========================================================================== */
console.log("\n--- 2. C-41.14 refuses a /4 document silent about the adoption pending at signing, by name ---");
const { runCaseGate } = await import("../src/gate.mjs");
const gateOf = (fm, body = null) => runCaseGate({ caseId: fm.case_id, edition: fm.case_edition, fm, priorCase: null, body });
const idsOf = (g) => g.findings.map((x) => x.check);
const clone = (fm) => JSON.parse(JSON.stringify(fm));
t("BASELINE: the ratify gate accepts the /4 document op=publish authored — no finding of any kind",
  [gateOf(FA, docA.text).ok, idsOf(gateOf(FA, docA.text))], [true, []]);
const noList = clone(FA); delete noList.bias_manifest_pins_proposed;
t("NO-PENDING-REFUSED: the same document without bias_manifest_pins_proposed is refused, by C-41.14 and by nothing else",
  [gateOf(noList).ok, idsOf(gateOf(noList))], [false, ["C-41.14"]]);
const noCount = clone(FA); delete noCount.bias_manifest.pins_proposed;
t("and without the count, by C-41.14",
  [gateOf(noCount).ok, idsOf(gateOf(noCount))], [false, ["C-41.14"]]);
const zeroed = clone(FA); zeroed.bias_manifest.pins_proposed = 0; zeroed.bias_manifest_pins_proposed = [];
const miscount = clone(FA); miscount.bias_manifest.pins_proposed = 0;
t("THE LIE THE ROW NAMES, spelled as a count: a document whose count says 0 over a list of one is refused, by C-41.14",
  [gateOf(miscount).ok, idsOf(gateOf(miscount))], [false, ["C-41.14"]]);
const noRev = clone(FA); if (noRev.bias_manifest_pins_proposed?.[0]) delete noRev.bias_manifest_pins_proposed[0].revision;
t("a row that names no revision is refused, by C-41.14 — the ruling asks for the revision's id",
  [gateOf(noRev).ok, idsOf(gateOf(noRev))], [false, ["C-41.14"]]);
const noSentence = clone(FA); delete noSentence.bias_manifest.pins_proposed_stated;
t("and a list with no sentence saying what it is, by C-41.14",
  [gateOf(noSentence).ok, idsOf(gateOf(noSentence))], [false, ["C-41.14"]]);
t("the check is ONE family member, declared where the allocator reads it",
  [CASE_DOCUMENT_FAMILY.PENDING?.check, CASE_DOCUMENT_FAMILY.DISCLOSURES?.check], ["C-41.14", "C-41.13"]);
const noManifest = clone(FA); delete noManifest.bias_manifest;
t("a /4 document with NO manifest at all is C-41.13's, and C-41.14 does not ask it twice",
  [...new Set(idsOf(gateOf(noManifest)))], ["C-41.13"]);
t("OVER-STRICTNESS: an EMPTY list with a zero count and its sentence passes — silence is refused, never the answer",
  idsOf(gateOf(zeroed)), []);
const two = clone(FA);
two.bias_manifest.pins_proposed = 2;
two.bias_manifest_pins_proposed = [...two.bias_manifest_pins_proposed,
  { bundle_id: "BIAS-2026-2190-other", revision: "a".repeat(64), scope: "instance", pinned_state: "proposed" }];
t("OVER-STRICTNESS: two pending adoptions, one per scope, pass — the check reads no value but its shape",
  idsOf(gateOf(two)), []);

/* ===========================================================================
   3. /3 STAYS VALID — read as it is, never re-signed.
   =========================================================================== */
console.log("\n--- 3. a /3 document silent about pending adoptions still ratifies; /2 and /1 unchanged ---");
const asV3 = clone(FA); asV3.format = "bio-case-document/3";
delete asV3.bias_manifest_pins_proposed; delete asV3.bias_manifest.pins_proposed; delete asV3.bias_manifest.pins_proposed_stated;
t("/3-STILL-RATIFIES: the same document as a /3, carrying NONE of the three new keys, passes the ratify gate "
+ "with no finding — what already crossed stays crossed (rule 1), and nothing about it is re-signed",
  [gateOf(asV3, docA.text).ok, idsOf(gateOf(asV3, docA.text))], [true, []]);
const v3noManifest = clone(asV3); delete v3noManifest.bias_manifest;
t("and /3 KEEPS its own obligation: a /3 without the manifest is still refused by C-41.13, not by C-41.14",
  [...new Set(idsOf(gateOf(v3noManifest)))], ["C-41.13"]);
t("the accepted set names every format, newest first, and op=publish authors only /4",
  [CASE_DOCUMENT_FORMATS_ACCEPTED, CASE_DOCUMENT_FORMAT],
  [["bio-case-document/4", "bio-case-document/3", "bio-case-document/2", "bio-case-document/1"], "bio-case-document/4"]);
t("/4 states its members' blocks as /3 and /2 do, and is obliged to carry /3's disclosures",
  [caseDocumentStatesMemberBlocks({ format: "bio-case-document/4" }), caseDocumentRequiresDisclosures({ format: "bio-case-document/4" }),
   caseDocumentRequiresDisclosures({ format: "bio-case-document/3" }), caseDocumentRequiresDisclosures({ format: "bio-case-document/2" })],
  [true, true, true, false]);

/* ===========================================================================
   4. FROZEN — the adoption moving afterwards moves op=biasmanifest and never the signed bytes.
   =========================================================================== */
console.log("\n--- 4. the proposal is adopted afterwards: the signed /4 bytes do not move, and the next case says none pending ---");
const beforeA = { sha: sha(docA.text), doc_sha: docA.doc_sha };
const ADOPTED_P = (await promote(IRIS, BP, biasMd(BP, "adopted", "p1", TXT_P1), "bias", "adopted")).bundleSha;
const L1 = await lensOf();
t("THE RECORD REALLY MOVED: the revision is adopted, the lens is in force and nothing is pending any more",
  [L1?.in_force, (L1?.bundles || []).map((b) => [b.bundle_id, b.revision]), L1?.pins_proposed ?? null],
  [true, [[BP, ADOPTED_P]], null]);
const docA2 = await readDoc(pubA);
t("FROZEN ARM: case A's signed document is BYTE-IDENTICAL, and still names the pending revision it was signed beside",
  [sha(docA2.text) === beforeA.sha, docA2.doc_sha === beforeA.doc_sha, pendingOf(parseFrontmatter(docA2.text).data).map((r) => r[1])],
  [true, true, [PROPOSED_P]]);
const pubB = await publishAndSign(await ground("adopted"), "B");
const docB = await readDoc(pubB);
const FB = parseFrontmatter(docB.text).data;
t("a case published NOW signs the lens in force, a ZERO count, an EMPTY list and the sentence saying so",
  [FB.format, FB.bias_manifest?.in_force, FB.bias_manifest?.pins_proposed, FB.bias_manifest_pins_proposed,
   FB.bias_manifest?.pins_proposed_stated, docB.text.includes("AN ADOPTION PINNED A PROPOSED REVISION")],
  ["bio-case-document/4", true, 0, [],
   "no adoption in this scope pinned a proposed revision when this case was signed", false]);
t("and the gate accepts it — no finding of any kind", [gateOf(FB, docB.text).ok, idsOf(gateOf(FB, docB.text))], [true, []]);

/* ===========================================================================
   5. D-579(a) — A CASE'S CITATION EDGES ARE PINNED INSIDE THE SIGNED /4 DOCUMENT.
   BOB #34, 2026-09-25 02:30Z: *"A published case must say which version it cited, and a pin kept outside
   the signed bytes is one a reader cannot verify."* ONE edge per state the document can carry:
     DOC_PIN   captured, then cited             -> op=cite stamps the capture; the row is `pinned`
     DOC_ONE   cited with no capture, then ONE  -> no pin at the act; `only_capture`, naming the one
     DOC_TWO   cited with no capture, then TWO  -> `undetermined`, and NOT back-filled with either
     DOC_NONE  never captured                   -> `no_capture`
     the question                               -> `no_bytes` (DEC-21)
   =========================================================================== */
console.log("\n--- 5. D-579(a): each citation edge of the case is signed with the version it rests on ---");
const selectIds = async (ids) => {
  const r = await POST(`op=select&token=${IRIS}`, { ids });
  if (!r.handle) bail("select", r);
  return r.handle;
};
const citeInto = async (ids) => GET(`op=cite&token=${IRIS}&project=${encodeURIComponent(PROJ)}&handle=${await selectIds(ids)}`);
const CAP_PIN = sha("r219-cap-pin"), CAP_ONE = sha("r219-cap-one"), CAP_TWO_A = sha("r219-cap-two-a"), CAP_TWO_B = sha("r219-cap-two-b");
const DOC_PIN = "INFO-2026-2190-citepin", DOC_ONE = "INFO-2026-2190-citeone", DOC_TWO = "INFO-2026-2190-citetwo",
      DOC_NONE = "INFO-2026-2190-citenone", QN = "INQ-2026-2190-citeq";
await promote("adm-r219", DOC_PIN, infoMd(DOC_PIN), "information", "collected", reg(CAP_PIN));
for (const d of [DOC_ONE, DOC_TWO, DOC_NONE]) await promote("adm-r219", d, infoMd(d), "information", "collected");
await promote("adm-r219", QN, inquiryMd(QN, DOC_PIN), "inquiry", "open");
const c1 = await citeInto([DOC_PIN, DOC_ONE, DOC_TWO, DOC_NONE, QN]);
t("REACH: op=cite landed all five edges on the case's project, and PINNED-AT-THE-ACT: it answers the capture "
+ "it stamped onto the one captured document and null for the rest",
  [c1?.ok, (c1?.cited || []).length, c1?.pinned_captures],
  [true, 5, { [DOC_NONE]: null, [DOC_ONE]: null, [DOC_PIN]: CAP_PIN, [DOC_TWO]: null, [QN]: null }]);
const projRefs = parseFrontmatter((await GET(`op=image&token=${IRIS}&id=${PROJ}`))["bundle.md"] || "").data?.references || [];
t("and the pin is IN THE EDGE'S BYTES, not only in the answer",
  projRefs.filter((r) => r.rel === "cites").map((r) => [r.target, r.extent_capture ?? null]).sort(),
  [[DOC_NONE, null], [DOC_ONE, null], [DOC_PIN, CAP_PIN], [DOC_TWO, null], [QN, null]]);
/* The captures the record comes to hold AFTER the act — which is what makes an unpinned edge's version a
   question: one capture of DOC_ONE, two of DOC_TWO, and a SECOND of DOC_PIN, which the pin must not follow. */
const addCaps = async (id, caps) => promote("adm-r219", id, infoMd(id), "information", "collected", caps.flatMap(reg));
await addCaps(DOC_ONE, [CAP_ONE]);
await addCaps(DOC_TWO, [CAP_TWO_A, CAP_TWO_B]);
await addCaps(DOC_PIN, [sha("r219-cap-pin-later")]);
const pubC = await publishAndSign(await ground("cited"), "C");
const docC = await readDoc(pubC);
const FC = parseFrontmatter(docC.text).data;
t("PINNED-EDGE ARM: the signed /4 document carries every edge with its version — the pin op=cite stamped "
+ "(never the later capture), the only capture, UNDETERMINED with no capture guessed, none held, and a question",
  (FC.case_citations || []).map((r) => [r.target, r.version, r.capture ?? null]).sort(),
  [[DOC_NONE, "no_capture", null], [DOC_ONE, "only_capture", CAP_ONE], [DOC_PIN, "pinned", CAP_PIN],
   [DOC_TWO, "undetermined", null], [QN, "no_bytes", null]]);
t("a PERSON reads each edge and its version under ## Citations",
  [/^## Citations$/m.test(docC.text), docC.text.includes(`- ${DOC_PIN}: cited at capture ${CAP_PIN}`),
   docC.text.includes(`- ${DOC_TWO}: version UNDETERMINED`)],
  [true, true, true]);
t("op=publish echoed the rows it signed, and op=casedocument serves them FROM THE SIGNED BYTES",
  [JSON.stringify(pubC.case_citations?.map((r) => [r.target, r.version, r.capture])),
   docC.citations?.state, JSON.stringify(docC.citations?.rows?.map((r) => [r.target, r.version, r.capture ?? null]))],
  [JSON.stringify(FC.case_citations.map((r) => [r.target, r.version, r.capture ?? null])), "signed",
   JSON.stringify(FC.case_citations.map((r) => [r.target, r.version, r.capture ?? null]))]);
t("BASELINE: the ratify gate accepts the cited document; and case A, whose project cited nothing then, signed an EMPTY list",
  [gateOf(FC, docC.text).ok, idsOf(gateOf(FC, docC.text)), FA.case_citations], [true, [], []]);
const rowOf = (fm, target) => (fm.case_citations || []).find((r) => r.target === target) || {};
const noPin = clone(FC); delete rowOf(noPin, DOC_PIN).capture;
t("NO-PIN-REFUSED: the cited document with its PINNED edge's capture dropped is refused, by C-41.15 and by nothing else",
  [gateOf(noPin).ok, idsOf(gateOf(noPin))], [false, ["C-41.15"]]);
const noCites = clone(FC); delete noCites.case_citations;
t("and without case_citations at all, by C-41.15",
  [gateOf(noCites).ok, idsOf(gateOf(noCites))], [false, ["C-41.15"]]);
const guessed = clone(FC); rowOf(guessed, DOC_TWO).capture = CAP_TWO_A;
t("THE BACK-FILL LIE: an UNDETERMINED edge that names a capture anyway is refused, by C-41.15",
  [gateOf(guessed).ok, idsOf(gateOf(guessed))], [false, ["C-41.15"]]);
const offVocab = clone(FC); rowOf(offVocab, DOC_PIN).version = "latest";
t("and a version outside the vocabulary, by C-41.15",
  [gateOf(offVocab).ok, idsOf(gateOf(offVocab))], [false, ["C-41.15"]]);
const v3cites = clone(FC); v3cites.format = "bio-case-document/3"; delete v3cites.case_citations;
delete v3cites.bias_manifest_pins_proposed; delete v3cites.bias_manifest.pins_proposed; delete v3cites.bias_manifest.pins_proposed_stated;
t("/3 is never asked: the same document as a /3 with no citation rows passes the gate — never re-signed",
  [gateOf(v3cites, docC.text).ok, idsOf(gateOf(v3cites, docC.text))], [true, []]);
t("the check is ONE family member, declared where the allocator reads it",
  [CASE_DOCUMENT_FAMILY.CITATIONS?.check], ["C-41.15"]);
const beforeC = sha(docC.text);
await addCaps(DOC_TWO, [sha("r219-cap-two-c")]);
t("FROZEN: a capture arriving after signing moves nothing in the signed document",
  [sha((await readDoc(pubC)).text) === beforeC], [true]);

console.log(`\nrec219-case-document-v4: ${pass} pass, ${fail} fail  [FOOT REACHED]`);
await mf.dispose();
process.exit(fail ? 1 : 0);
