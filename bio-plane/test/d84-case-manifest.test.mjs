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

   (d) REC-188 (declared and RUN 2026-09-24, WORKER REC-188 (CONDUCT #19)), THE ROW'S OWN ARM — DROP THE NEW
   CHECK'S PUSH: C-41.13's first `findings.push` (the bias_manifest map) disabled in `checks/bio-checks.mjs`,
   armed ALONE, restored by sha256 AND `cmp` against a per-arm pristine copy (4dac91af…, 903,635 bytes).
   BASELINE with nothing armed -> **27 pass, 0 fail**. Declared: MUST fail NO-MANIFEST-REFUSED by name; MUST
   NOT fail sections 1-3, PUBLISHED-READS-/3, the NO-ACK rows or /2-STILL-RATIFIES -> **24 pass, 3 fail**:
   NO-MANIFEST-REFUSED, the scalar/no-hash row, and the /3 twin's count of three, exactly as declared.

   (e) REC-188, THE OVER-STRICT LIAR — `caseDocumentRequiresDisclosures` made true for EVERY format, armed
   ALONE, restored and verified the same way (4dac91af…, 903,635 bytes). Declared: MUST fail
   /2-STILL-RATIFIES by name and nothing else -> **26 pass, 1 fail**: /2-STILL-RATIFIES, as declared.

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
const promote = async (tok, id, text, type, state, register = []) => {
  const r = await POST(`op=promote&token=${tok}`, {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260923T${String(210000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register });
  if (!r || r.ok === false || !r.bundleSha) bail(`promote ${id} -> ${state}`, r);
  HEAD.set(id, r.bundleSha);
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
await promote(NADIA, BI, biasMd(BI, "adopted", "i1", TXT_I1), "bias", "adopted");
for (const st of ["draft", "proposed"]) await promote(IRIS, BP, biasMd(BP, st, "p1", TXT_P1), "bias", st);
const adP = await GET(`op=biasadopt&token=${IRIS}&bundleId=${BP}&scope=project&scopeId=${PROJ}`);
await promote(IRIS, BP, biasMd(BP, "adopted", "p1", TXT_P1), "bias", "adopted");
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
/* THE REVISION IS THE ADOPTION'S PIN (DEC-54 d), which op=biasadopt echoes as `pinned.bundle_sha` —
   CORRECTED on this suite's first run, which asserted the bundle's HEAD sha and went red: the pin is
   taken at op=biasadopt, while the set stands at `proposed`, and the promotion to `adopted` mints a
   newer sha. The stamp names what op=biasmanifest names, and that is the pin. Measured and reported
   (D-84 worker), not changed here: PL-12's pin and the adopted head differ by construction. */
const PIN_I = adI?.pinned?.bundle_sha, PIN_P = adP?.pinned?.bundle_sha;
t("the revisions ARE the adoptions' own pins, as op=biasadopt echoed them — the pin, not a label",
  pairsOf(FB).map((p) => p[1]), [PIN_I, PIN_P]);
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
   4. REC-188 — `bio-case-document/3`: THE GATE REFUSES THE ABSENCE.

   `BIO_Publication_v0_1.md` §3 rules 11 and 12, `BIO_Declared_Bias_v0_1.md` §"The bias
   acknowledgement, authored at export"; the bump CONFIRMED by BOB #31 and widened by BOB #32 (*ONE format
   bump carries both requirements*). DEC-20's "bias accompanies every published case" held only while
   op=publish HAPPENED to write the manifest: under /2 the gate could not require it, nor the statement's
   acknowledgement list (D-150), without refusing a /2 document authored before them.

   ACCEPTS-WHEN, clause by clause:
     - a published case reads /3                                           -> the PUBLISHED-READS-/3 row
     - a /3 document lacking `bias_manifest` is refused by C-41.13          -> the NO-MANIFEST-REFUSED row
     - a /3 document lacking the acknowledgement list is refused by C-41.13 -> the NO-ACK-LIST rows
     - a /2 document without either still ratifies                         -> the /2-STILL-RATIFIES row
   HOW A LIAR PASSES IT: bump the token and require nothing, so every /3 row reads right and the gate
   still accepts silence; or require the keys of EVERY format, so the /3 rows go red-for-the-right-reason
   while every /2 document already crossed stops ratifying. The refusal rows ask for C-41.13 BY NAME
   against a document the plane itself authored with ONE key removed, and the /2 row asks the same gate to
   pass the same document with only the token changed back — so neither lie survives both.

   WHAT THIS CANNOT SEE: the /2 row runs `runCaseGate` — the function op=caseratify runs, and nothing else
   does — over bytes op=publish authored with the token set back to /2. It does NOT drive a /2 document
   through op=caseratify, because no op authors /2 any more and this plane has no SQL surface to plant one.
   =========================================================================== */
console.log("\n--- 4. REC-188: a published case reads /3, and the gate refuses a /3 document silent about the lens or its second readers ---");
{
  const { runCaseGate } = await import("../src/gate.mjs");
  const gateOf = (fm, body = null) => runCaseGate({ caseId: fm.case_id, edition: fm.case_edition, fm, priorCase: null,
                                                     body });
  const idsOf = (g) => g.findings.map((x) => x.check);
  const has41_13 = (g) => idsOf(g).filter((c) => c === "C-41.13");
  t("PUBLISHED-READS-/3: every case this suite published and ratified is `bio-case-document/3` — "
  + "with no lens, under one, and after it moved",
    [FA.format, FB.format, FC.format], ["bio-case-document/3", "bio-case-document/3", "bio-case-document/3"]);
  t("REACH: each carries the two disclosures the row makes required — the manifest map, its bundle list, "
  + "the acknowledged count (ZERO: nobody acknowledged) and its EMPTY list",
    [typeof FB.bias_manifest, Array.isArray(FB.bias_manifest_bundles), FB.completeness?.acknowledged,
     FB.completeness_acknowledgements],
    ["object", true, 0, []]);
  t("BASELINE: the ratify gate accepts both published documents as signed — the no-lens one and the lensed one",
    [gateOf(FA, docA.text).ok, idsOf(gateOf(FA, docA.text)), gateOf(FB, docB.text).ok, idsOf(gateOf(FB, docB.text))],
    [true, [], true, []]);

  const without = (fm, key) => { const d = JSON.parse(JSON.stringify(fm)); delete d[key]; return d; };
  t("NO-MANIFEST-REFUSED: a /3 document without the bias_manifest map is refused, by C-41.13 and by nothing else",
    [gateOf(without(FB, "bias_manifest")).ok, idsOf(gateOf(without(FB, "bias_manifest")))],
    [false, ["C-41.13"]]);
  t("and so is one whose manifest is a scalar rather than a map, or claims a lens in force with no hash",
    [has41_13(gateOf({ ...FB, bias_manifest: "none" })).length > 0,
     has41_13(gateOf({ ...FB, bias_manifest: { ...FB.bias_manifest, statements_sha: null } })).length > 0],
    [true, true]);
  t("NO-ACK-LIST-REFUSED: a /3 document without completeness_acknowledgements is refused, by C-41.13",
    [gateOf(without(FB, "completeness_acknowledgements")).ok,
     idsOf(gateOf(without(FB, "completeness_acknowledgements")))],
    [false, ["C-41.13"]]);
  const noCount = JSON.parse(JSON.stringify(FB)); delete noCount.completeness.acknowledged;
  t("NO-ACK-COUNT-REFUSED: a /3 document without completeness.acknowledged is refused, by C-41.13",
    [gateOf(noCount).ok, idsOf(gateOf(noCount))], [false, ["C-41.13"]]);

  const asV2 = (fm) => ({ ...fm, format: "bio-case-document/2" });
  const bare = without(without(without(FB, "bias_manifest"), "bias_manifest_bundles"), "completeness_acknowledgements");
  delete bare.completeness.acknowledged; delete bare.completeness.statement_sha;
  t("/2-STILL-RATIFIES: the same document as a /2, carrying NEITHER the manifest NOR the acknowledgement count "
  + "or list, passes the ratify gate with no finding — what already crossed stays crossed (rule 1)",
    [gateOf(asV2(bare), docB.text).ok, idsOf(gateOf(asV2(bare), docB.text))], [true, []]);
  t("and the /3 twin of that document is refused on BOTH halves, by C-41.13 alone",
    [gateOf(bare, docB.text).ok, [...new Set(idsOf(gateOf(bare, docB.text)))], has41_13(gateOf(bare, docB.text)).length],
    [false, ["C-41.13"], 3]);
  t("OVER-STRICTNESS: a /3 document with a REAL acknowledgement on its list (count 1) passes — the check asks "
  + "that the list be stated, never that it be empty or full",
    idsOf(gateOf({ ...FB, completeness: { ...FB.completeness, acknowledged: 1 },
                   completeness_acknowledgements: [{ kind: "recipient", by: "RG-1", recipient: "a reader",
                                                     at: "2026-07-02T00:00:00Z" }] }, docB.text)),
    []);
}

console.log(`\nd84-case-manifest: ${pass} pass, ${fail} fail  [FOOT REACHED]`);
await mf.dispose();
process.exit(fail ? 1 : 0);
