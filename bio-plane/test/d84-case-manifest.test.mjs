/* NEGATIVE CONTROL: (declared and RUN 2026-09-23, D-84 worker, session WORKER D-84 (CONDUCT #17)) THREE
   ARMS PLUS A BASELINE, each armed ALONE in `src/store.mjs` with every other defence held open, the suite
   run directly (`node test/d84-case-manifest.test.mjs`, which loads `src/index.mjs`, so no rebuild sits
   between the arm and the measurement), and every restore verified by sha256 AND `cmp` against a
   uniquely-named per-arm pristine copy (a3ac436b…, 2,889,734 bytes each time). Declared before arming:
   (a) and (b) MUST fail the NAMED-LENS arm by name and MUST NOT fail section 1; (c) MUST fail the
   FROZEN-BYTES arm by name. The arms are lettered from (a) for `control-register.mjs`'s FIRST_ORDINAL.

   (0) BASELINE, nothing armed -> **17 pass, 0 fail**, foot reached.

   (a) DROP THE STAMP — `publishCase()`'s `const lens = this.#biasManifestNow(...)` replaced by
   `{ in_force: false }` -> **11 pass, 6 fail**: NAMED-LENS ARM first, then the hash, the pins, the body
   prose, the published-under row and the OVER-STRICTNESS arm; section 1 stays green, as declared. Its
   FIRST run ended in a TypeError at section 3 (`pairsOf(FB)[0][1]` over an empty list) before the foot —
   the instrument, not the subject; the index is now guarded and the arm re-run reached the foot.

   (b) THE WRONG SCOPE — the stamp reads the INSTANCE scope instead of the case's project -> **11 pass,
   6 fail**, the same six, NAMED-LENS ARM first: the project's own pair is missing and the hash is another set's.

   (c) THE LIAR THE ROW NAMES — `caseDocument()` (op=casedocument) RECOMPUTES `statements_sha` at read time
   from the lens in force now -> **14 pass, 3 fail**: FROZEN-BYTES ARM, the published-under row, and the
   no-lens case's row (its `null` became today's hash). **ITS FIRST ATTEMPT NEVER ARMED** — the anchor
   `doc_sha: d.doc_sha, text: d.text,` occurs TWICE in store.mjs, the patch's own count-assertion refused,
   and the suite ran 17/0 over an untouched file; re-armed on the anchor unique to `caseDocument()`.

   REC-187 (RUN 2026-09-24, session WORKER REC-187 (CONDUCT #18)) — THREE MORE ARMS, same discipline: each
   armed ALONE in `src/store.mjs` by an anchor asserted to match EXACTLY ONCE, the suite run directly, every
   restore by `cp` from a per-arm pristine copy and verified by sha256 AND `cmp` (bb7e28f5…, 2,956,805 bytes
   each time). Declared before arming: each MUST fail the EQUALITY ARM by name; section 1 MUST NOT fail.
   (0) BASELINE -> **25 pass, 0 fail**, foot reached.
   (d) PIN THE PROPOSED SHA — the re-pin at promotion to `adopted` disabled, so every adoption keeps the
   pin op=biasadopt took at `proposed` -> **14 pass, 11 fail**, EQUALITY ARM among them by name. MORE than
   the equality arm, and named rather than smoothed: with the pin on PROPOSED bytes the pinned-state rule
   withholds force, so section 2's lens is not in force either and its six rows go with it. Section 1 green.
   (e) THE LIAR THE ROW NAMES — the statements hashed from the `bias_statements` PROJECTION (the head) ->
   **22 pass, 3 fail**: the later-proposal row, EQUALITY ARM, and THE ARM COSTS SOMETHING (the stamp now IS
   the later proposal's hash). The pins are right and only the hash lies, which is exactly the two-names defect.
   (f) IN FORCE ASKED OF THE HEAD (the pre-REC-187 join) -> **20 pass, 5 fail**, EQUALITY ARM by name: a
   later PROPOSAL lifts the adopted lens, and case D signs a manifest without it.

   ---

   D-84 — THE BIAS MANIFEST IS STAMPED INTO THE SIGNED CASE DOCUMENT, FROZEN.

   `BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption": *"Every work product cites its BIAS
   MANIFEST: the list of (bias bundle id, revision) in force plus a hash of the computed effective
   statement set. The manifest is part of the evidentiary record and travels with publication."*
   §"The bias acknowledgement, authored at export": the manifest is *computed and stamped by the
   plane*, the acknowledgement AUTHORED beside it.

   ACCEPTS-WHEN, as the row states it, and the section of this suite that answers each clause:
     - a case published under an adopted set names EACH PAIR and the HASH          -> section 2
     - adopting a new revision afterwards leaves the published bytes IDENTICAL     -> section 3
     - with nothing adopted the document says NO MANIFEST WAS IN FORCE             -> section 1
     - REC-187: across propose -> adopt -> LATER propose, the stamped hash equals one recomputed from
       exactly the stamped sha's bytes, and the sha is the ADOPTED one                  -> section 4
   HOW A LIAR PASSES IT: recompute at read time. So section 3 MOVES THE LENS after publishing — a new
   revision of the instance set, re-adopted, which moves op=biasmanifest's hash — and asserts the
   signed bytes, their sha, and the pairs they name did not move.

   THE DRIVE IS THROUGH THE OPS AND THE CEREMONY IS REAL: op=publish authors the document, a stock
   `ssh-keygen` key signs it, op=caseratify commits it, and op=casedocument is what a stranger reads.
   The expectation is op=biasmanifest's own answer read BEFORE publishing — a second reader of the
   same fact, never a constant this suite made up — so a stamp of a different scope or a partial set
   disagrees with it by name.
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
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
import { parseFrontmatter, checkCaseDocument } from "../checks/bio-checks.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- d84-case-manifest ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("d84-case-manifest: SKIPPED — ssh-keygen not on PATH; this item's subject is a block inside a "
    + "REAL signature over a case document, and a ceremony proved with our own verifier proves our verifier");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d84", MEMBER_TOKEN: "mem-d84", PROBE_TOKEN: "prb-d84", VERSION: "test" },
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
  console.log(`\nd84-case-manifest: ${pass} pass, ${fail} fail  [FIXTURE ABORTED]`);
  mf.dispose().then(() => process.exit(1));
  throw new Error("fixture");
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

const dir = mkdtempSync(join(tmpdir(), "d84-case-manifest-"));
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
  const add = await POST("op=memberadd&token=adm-d84",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-d84` });
  if (!en.ok) bail(`enroll ${memberId}`, en);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-d84` });
  if (!lg.token) bail(`login ${memberId}`, lg);
  return lg.token;
};
/* Two administrators before any member (4.2/4.3). NADIA authors the instance lens; IRIS owns the
   publishing project, authors its project lens, and publishes. */
const NADIA = await enrol("nadia", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "admin", ["contribute", "publish"]);
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
await POST("op=signeradd&token=adm-d84", { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" });

const PROJ = await makePublishingProject({
  post: async (q, b) => (await mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(b ?? {}) })).json(),
  mf, sha, machineToken: "adm-d84", owner: "iris",
  name: "PROJ-2026-8400-lens", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });

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
const inquiryMd = (id, cites) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
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
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
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
  const info = `INFO-2026-8400-${tag}`, lead = `INQ-2026-8400-${tag}`;
  await promote("adm-d84", info, infoMd(info), "information", "collected", reg(sha(`d84-${tag}`)));
  await promote("adm-d84", lead, inquiryMd(lead, info), "inquiry", "concluded");
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

/* ===========================================================================
   1. NOTHING ADOPTED — the document SAYS no manifest was in force.
   =========================================================================== */
console.log("\n--- 1. with nothing adopted, the signed document says NO MANIFEST WAS IN FORCE ---");
const L0 = await lensOf();
t("REACH: the project's lens is genuinely not in force before anything is adopted",
  [L0?.in_force, L0?.stated], [false, "no manifest was in force"]);

const pubA = await publishAndSign(await ground("none"), "A");
const docA = await readDoc(pubA);
const FA = parseFrontmatter(docA.text).data;
t("the case is SIGNED and what a stranger reads is the ratified document",
  [docA.ratified, typeof docA.sig_armored === "string"], [true, true]);
t("NO-MANIFEST ARM: the signed frontmatter states the lens was NOT in force, in the sentence "
+ "op=biasmanifest uses, with no hash and an EMPTY pair list — never a blank a reader could take for an "
+ "empty lens",
  [FA.bias_manifest?.in_force, FA.bias_manifest?.stated, FA.bias_manifest?.statements_sha,
   FA.bias_manifest?.scope, FA.bias_manifest?.scope_id, FA.bias_manifest_bundles],
  [false, "no manifest was in force", null, "project", PROJ, []]);
t("and a PERSON reads it: the body carries the manifest under its own heading and says it in prose",
  [/^## Bias Manifest$/m.test(docA.text), docA.text.includes(`NO MANIFEST WAS IN FORCE for ${PROJ}`)],
  [true, true]);
t("op=publish echoed the same stamp it wrote",
  [pubA.bias_manifest?.in_force, pubA.bias_manifest?.stated], [false, "no manifest was in force"]);

/* ===========================================================================
   2. A LENS ADOPTED — the document NAMES EACH PAIR AND THE HASH.
   =========================================================================== */
console.log("\n--- 2. under an adopted set, the signed document names each (bundle, revision) pair and the hash ---");
const BI = "BIAS-2026-8400-instance", BP = "BIAS-2026-8400-project";
const TXT_I1 = "Claims from the city attorney's office need a second record.";
const TXT_P1 = "Budget figures quoted by the office are checked against the adopted budget.";
for (const st of ["draft", "proposed"]) await promote(NADIA, BI, biasMd(BI, st, "i1", TXT_I1), "bias", st);
const adI = await GET(`op=biasadopt&token=${NADIA}&bundleId=${BI}`);
const ADOPTED_I = (await promote(NADIA, BI, biasMd(BI, "adopted", "i1", TXT_I1), "bias", "adopted")).bundleSha;
for (const st of ["draft", "proposed"]) await promote(IRIS, BP, biasMd(BP, st, "p1", TXT_P1), "bias", st);
const adP = await GET(`op=biasadopt&token=${IRIS}&bundleId=${BP}&scope=project&scopeId=${PROJ}`);
const ADOPTED_P = (await promote(IRIS, BP, biasMd(BP, "adopted", "p1", TXT_P1), "bias", "adopted")).bundleSha;
const L1 = await lensOf();
t("REACH: both adoptions landed and the project's lens is IN FORCE with TWO pairs — one instance, one "
+ "project — so every arm below compares something real",
  [adI?.ok, adP?.ok, L1?.in_force, (L1?.bundles || []).map((b) => [b.bundle_id, b.scope]),
   /^[0-9a-f]{64}$/.test(L1?.statements_sha || "")],
  [true, true, true, [[BI, "instance"], [BP, "project"]], true]);

const pubB = await publishAndSign(await ground("lensed"), "B");
const docB = await readDoc(pubB);
const FB = parseFrontmatter(docB.text).data;
const pairsOf = (fm) => (fm.bias_manifest_bundles || []).map((r) => [r.bundle_id, r.revision, r.scope]);
t("NAMED-LENS ARM: the signed document names EACH (bias bundle id, revision) pair in force for the "
+ "project's scope, exactly as op=biasmanifest answered before publishing",
  pairsOf(FB), (L1.bundles || []).map((b) => [b.bundle_id, b.revision, b.scope]));
t("and the HASH of the effective statement set is op=biasmanifest's own, in force and not a page's",
  [FB.bias_manifest?.in_force, FB.bias_manifest?.statements_sha, FB.bias_manifest?.scope_id],
  [true, L1.statements_sha, PROJ]);
/* THE REVISION IS THE ADOPTED ONE. CORRECTED 2026-09-24 by REC-187, not exempted. This assertion
   read `[adI.pinned.bundle_sha, adP.pinned.bundle_sha]` — the pins op=biasadopt took while each set
   stood at `proposed` — and the D-84 worker measured and reported that those name bytes OLDER than
   the adopted head. That was the defect, pinned as the expectation: a PROPOSED revision's sha named as
   the lens a case was produced under. BOB #31 ruled it (`BIO_Declared_Bias_v0_1.md` §"The bias
   acknowledgement, authored at export": *"the ADOPTED one"*), and promotion to `adopted` now re-pins.
   So the stamp names the sha the promotion to `adopted` minted, and NOT the proposed pin — both
   halves asserted, because "differs from the proposed pin" alone would pass a stamp of anything. */
const PIN_I = ADOPTED_I, PIN_P = ADOPTED_P;
t("the revisions ARE the ADOPTED revisions — the shas the promotions to `adopted` minted — and NOT "
+ "the proposed shas op=biasadopt pinned before them (BOB #31, REC-187)",
  [pairsOf(FB).map((p) => p[1]),
   adI?.pinned?.bundle_sha !== ADOPTED_I && adP?.pinned?.bundle_sha !== ADOPTED_P],
  [[ADOPTED_I, ADOPTED_P], true]);
t("a PERSON reads each pair and the hash in the body",
  [docB.text.includes(`- ${BI} (instance) at revision ${PIN_I}`),
   docB.text.includes(`- ${BP} (project) at revision ${PIN_P}`),
   docB.text.includes(`Hash of the effective statement set: ${L1.statements_sha}.`)],
  [true, true, true]);
t("the manifest sits BESIDE the authored acknowledgement and does not replace it (DEC-46: two claims)",
  [typeof FB.bias_acknowledgement, /^## Bias Acknowledgement$/m.test(docB.text)], ["string", true]);
t("and the gate accepts the document it signed — no finding of any kind",
  checkCaseDocument(FB, { body: docB.text }).filter((f) => f.severity === "error").map((f) => f.check), []);

/* ===========================================================================
   3. THE LENS MOVES AFTER PUBLISHING — the signed bytes do NOT.
   =========================================================================== */
console.log("\n--- 3. a new revision adopted afterwards moves op=biasmanifest and never the published bytes ---");
const beforeB = { text: docB.text, sha: sha(docB.text), doc_sha: docB.doc_sha };
const beforeA = sha(docA.text);
const TXT_I2 = "Claims from the city attorney's office need TWO independent records.";
await promote(NADIA, BI, biasMd(BI, "adopted", "i1", TXT_I2), "bias", "adopted");
const reI = await GET(`op=biasadopt&token=${NADIA}&bundleId=${BI}`);
const L2 = await lensOf();
t("THE LENS REALLY MOVED: a new revision of the instance set is adopted, and op=biasmanifest now names "
+ "that revision and a different hash — so the next rows measure frozen bytes, not an unmoved lens",
  [reI?.ok, L2?.in_force, L2?.statements_sha !== L1.statements_sha,
   (L2?.bundles || []).find((b) => b.bundle_id === BI)?.revision === HEAD.get(BI),
   HEAD.get(BI) !== (pairsOf(FB)[0] || [])[1]],
  [true, true, true, true, true]);

const docB2 = await readDoc(pubB);
const FB2 = parseFrontmatter(docB2.text).data;
t("FROZEN-BYTES ARM: the published case document is BYTE-IDENTICAL after the lens moved — the same "
+ "text, the same sha over it, the same doc_sha the signature covers",
  [sha(docB2.text) === beforeB.sha, docB2.doc_sha === beforeB.doc_sha, docB2.text === beforeB.text],
  [true, true, true]);
t("and it still names the revision and hash it was PUBLISHED under, never the ones in force now",
  [(pairsOf(FB2)[0] || [])[1], FB2.bias_manifest?.statements_sha],
  [(pairsOf(FB)[0] || [])[1], L1.statements_sha]);
t("the case published with no lens still says so after one was adopted — nothing recomputed it",
  [sha((await readDoc(pubA)).text) === beforeA, parseFrontmatter((await readDoc(pubA)).text).data.bias_manifest?.in_force],
  [true, false]);

/* A case published NOW carries the NEW lens — which is what proves the frozen rows above are frozen
   rather than a stamp that never reads the lens at all. */
const pubC = await publishAndSign(await ground("moved"), "C");
const FC = parseFrontmatter((await readDoc(pubC)).text).data;
t("OVER-STRICTNESS ARM: a case published after the lens moved stamps the lens in force AT ITS OWN "
+ "publication — the new revision and hash — so freezing is per edition, not a stamp that stopped reading",
  [FC.bias_manifest?.statements_sha, pairsOf(FC).map((p) => p[1])],
  [L2.statements_sha, (L2.bundles || []).map((b) => b.revision)]);

/* ===========================================================================
   4. REC-187 — PROPOSE -> ADOPT -> A LATER PROPOSAL: the stamp names the ADOPTED revision, and its
      hash is recomputable from EXACTLY that revision's bytes.
   BOB #31, `BIO_Declared_Bias_v0_1.md` §"The bias acknowledgement, authored at export": *"Promotion
   to `adopted` re-pins the adoption to the adopted bundle_sha, the case stamps that sha, and
   op=biasmanifest hashes THAT revision's statements — one quantity under one name."*
   HOW A LIAR PASSES IT: hash the latest projection. So after adoption a NEWER revision is PROPOSED
   with a different statement, the case is published then, and the expectation is recomputed by THIS
   SUITE from the bytes of the stamped shas alone — its own reading of the frontmatter and its own
   SHA-256, never the plane's helper — so a hash of the head, of the projection, or of anything but
   the named revision disagrees with it.
   =========================================================================== */
/* WHAT SECTION 4 CANNOT SEE, stated: (1) the RESIDUE is now read from the pinned revision too, but this
   fixture writes the same `## What This Does Not Enforce` text into every revision, so no row here can tell
   a head's residue from a pin's; (2) op=biasmanifest's UNDETERMINED answer (a pin whose bytes the store
   cannot produce) is not reachable through the ops — promote() snapshots every outgoing revision into
   `history`, and purge clears a purged set's adoptions — so it is written and NOT driven; (3) the recompute
   does not model a project NULLIFICATION and refuses rather than guesses if one appears. */
console.log("\n--- 4. REC-187: propose -> adopt -> a LATER proposal; the stamp names the ADOPTED revision and hashes exactly its bytes ---");
/* The recompute. Each stamped (bundle, revision) pair is resolved to bytes BY THE REVISION, and the
   bytes are proved to BE that revision (their sha256 is the pin) before a statement is read. The
   plane's formula, restated here from its doctrine rather than imported: every statement of every
   pinned revision, ordered by (bundle id, statement id), hashed over the fields that change meaning.
   It does not model a project NULLIFICATION, and it refuses rather than guesses if one appears. */
const recompute = (pairs) => {
  const rows = [];
  for (const [bid, rev] of pairs) {
    const text = BYTES.get(rev);
    if (typeof text !== "string" || sha(text) !== rev) return `NO BYTES FOR ${bid} AT ${rev}`;
    for (const st of parseFrontmatter(text).data?.statements || []) {
      if (st.nullifies) return "a nullification this recompute does not model";
      rows.push([bid, st.id, st.kind, String(st.subject), st.text, st.justification, st.locked === true]);
    }
  }
  rows.sort((x, y) => x[0].localeCompare(y[0]) || x[1].localeCompare(y[1]));
  return sha(JSON.stringify(rows));
};
const BQ = "BIAS-2026-8400-amended";
const TXT_Q1 = "Contract figures the office cites are checked against the executed contract.";
const TXT_Q2 = "Contract figures the office cites are checked against the executed contract AND its amendments.";
await promote(IRIS, BQ, biasMd(BQ, "draft", "q1", TXT_Q1), "bias", "draft");
const PROPOSED_Q = (await promote(IRIS, BQ, biasMd(BQ, "proposed", "q1", TXT_Q1), "bias", "proposed")).bundleSha;
const adQ = await GET(`op=biasadopt&token=${IRIS}&bundleId=${BQ}&scope=project&scopeId=${PROJ}`);
const ADOPTED_Q = (await promote(IRIS, BQ, biasMd(BQ, "adopted", "q1", TXT_Q1), "bias", "adopted")).bundleSha;
const L3 = await lensOf();
const LATER_Q = (await promote(IRIS, BQ, biasMd(BQ, "proposed", "q1", TXT_Q2), "bias", "proposed")).bundleSha;
const revOf = (bundles, id) => (bundles || []).find((b) => b.bundle_id === id)?.revision;
t("REACH: three DISTINCT revisions of one set — proposed, adopted, and a later proposal that is now the "
+ "HEAD with a different statement — op=biasadopt pinned the PROPOSED one, and at adoption the lens "
+ "named the adopted one; so the rows below separate three candidate answers, not one",
  [new Set([PROPOSED_Q, ADOPTED_Q, LATER_Q]).size, adQ?.ok, adQ?.pinned?.bundle_sha, HEAD.get(BQ),
   revOf(L3?.bundles, BQ)],
  [3, true, PROPOSED_Q, LATER_Q, ADOPTED_Q]);
const L4 = await lensOf();
t("A LATER PROPOSAL DOES NOT UNSEAT THE ADOPTED LENS, and does not move it: op=biasmanifest still names "
+ "the ADOPTED revision and the SAME hash it gave at adoption — the head moved and the lens in force did not",
  [L4?.in_force, revOf(L4?.bundles, BQ), L4?.statements_sha], [true, ADOPTED_Q, L3?.statements_sha]);

const pubD = await publishAndSign(await ground("amended"), "D");
const docD = await readDoc(pubD);
const FD = parseFrontmatter(docD.text).data;
const pairsD = pairsOf(FD).map((p) => [p[0], p[1]]);
t("EQUALITY ARM: the case stamps the ADOPTED sha, and its statements hash EQUALS a hash recomputed by this "
+ "suite from EXACTLY the stamped shas' bytes — one quantity under one name",
  [revOf(FD.bias_manifest_bundles, BQ), FD.bias_manifest?.statements_sha],
  [ADOPTED_Q, recompute(pairsD)]);
t("THE ARM COSTS SOMETHING: the same recompute over the LATER proposal's bytes — the hash a liar reading "
+ "the latest projection would stamp — is a DIFFERENT hash, so the equality above could not hold by accident",
  [recompute(pairsD.map(([b, r]) => [b, b === BQ ? LATER_Q : r])) !== FD.bias_manifest?.statements_sha,
   /^[0-9a-f]{64}$/.test(recompute(pairsD.map(([b, r]) => [b, b === BQ ? LATER_Q : r])))],
  [true, true]);
t("the stamp and op=biasmanifest are ONE quantity: the same pairs and the same hash, read by two readers",
  [pairsD, FD.bias_manifest?.statements_sha],
  [(L4?.bundles || []).map((b) => [b.bundle_id, b.revision]), L4?.statements_sha]);
t("a PERSON reads the adopted revision in the body, and the proposed and later shas appear nowhere in it",
  [docD.text.includes(`- ${BQ} (project) at revision ${ADOPTED_Q}`),
   docD.text.includes(PROPOSED_Q), docD.text.includes(LATER_Q)],
  [true, false, false]);

/* OVER-STRICTNESS: the re-pin must FOLLOW a real adoption, not freeze on the first one. The later
   proposal is promoted to `adopted`; the lens and the next case now name IT, with its own hash. */
const ADOPTED_Q2 = (await promote(IRIS, BQ, biasMd(BQ, "adopted", "q1", TXT_Q2), "bias", "adopted")).bundleSha;
const L5 = await lensOf();
const pubE = await publishAndSign(await ground("readopted"), "E");
const FE = parseFrontmatter((await readDoc(pubE)).text).data;
t("OVER-STRICTNESS ARM: once the later revision is itself promoted to `adopted`, the lens and the next "
+ "case name THAT revision and hash exactly its bytes — the pin follows adoption, it does not stick",
  [revOf(L5?.bundles, BQ), revOf(FE.bias_manifest_bundles, BQ), FE.bias_manifest?.statements_sha],
  [ADOPTED_Q2, ADOPTED_Q2, recompute(pairsOf(FE).map((p) => [p[0], p[1]]))]);
t("and case D, published under the earlier adoption, still names it — frozen, never recomputed",
  [revOf(parseFrontmatter((await readDoc(pubD)).text).data.bias_manifest_bundles, BQ)], [ADOPTED_Q]);

console.log(`\nd84-case-manifest: ${pass} pass, ${fail} fail  [FOOT REACHED]`);
await mf.dispose();
process.exit(fail ? 1 : 0);
