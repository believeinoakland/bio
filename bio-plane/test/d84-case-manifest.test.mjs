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

    [c19-batch10: REC-188's two arms were lettered (d) and (e) on its branch, which REC-187's arms above also hold;
    relettered (g) and (h) at the merge, and REC-188's section 4 is section 5 on the batch.]
   (d) REC-188 (declared and RUN 2026-09-24, WORKER REC-188 (CONDUCT #19)), THE ROW'S OWN ARM — DROP THE NEW
   CHECK'S PUSH: C-41.13's first `findings.push` (the bias_manifest map) disabled in `checks/bio-checks.mjs`,
   armed ALONE, restored by sha256 AND `cmp` against a per-arm pristine copy (4dac91af…, 903,635 bytes).
   BASELINE with nothing armed -> **27 pass, 0 fail**. Declared: MUST fail NO-MANIFEST-REFUSED by name; MUST
   NOT fail sections 1-3, PUBLISHED-READS-/3, the NO-ACK rows or /2-STILL-RATIFIES -> **24 pass, 3 fail**:
   NO-MANIFEST-REFUSED, the scalar/no-hash row, and the /3 twin's count of three, exactly as declared.

   (e) REC-188, THE OVER-STRICT LIAR — `caseDocumentRequiresDisclosures` made true for EVERY format, armed
   ALONE, restored and verified the same way (4dac91af…, 903,635 bytes). Declared: MUST fail
   /2-STILL-RATIFIES by name and nothing else -> **26 pass, 1 fail**: /2-STILL-RATIFIES, as declared.

   (i) D-548 (declared and RUN 2026-09-24, WORKER D-548 (SCHEDULER #21)), THE RECORDER — every section now runs in
   `block()`, and the subject is the SUITE, so the arms break a section's FIXTURE (a promote the plane refuses
   ENVELOPE_TYPE_DISAGREES). Re-run in one step: `node test/d548-block.control.mjs` from bio-plane/, which arms a
   COPY in a temporary mirror of the repository and hashes this file before and after (unchanged on every run). BASELINE -> **35 pass, 0 fail**, per section 0/0, 5/0, 7/0, 5/0, 8/0, 10/0, foot reached.
   (i) SECTION 4's FIXTURE BROKEN — declared: section 4 DIES by name with tally -1, every other section reports its
   baseline tally -> **27 pass, 1 fail**, `BLOCK 4 DIED: (fixture) promote BIAS-2026-8400-amended -> draft`, as
   declared. THE SAME ARM ON THE PRE-D-548 SUITE -> **17 pass, 1 fail [FIXTURE ABORTED]**: section 5's ten
   assertions never ran — the measured failure this row moves.
   (j) SECTION 2's FIXTURE BROKEN — declared: 2 DIES, and 3 and 5, which read its case, die NAMING the section they
   rest on (never a bare TypeError); 1 and 4 report -> **13 pass, 3 fail**, as declared. Its first run, before
   `needs()`, killed 3 and 5 on `Cannot read properties of undefined` — recorded, but naming nothing.
   (k) THE RECORDER DISARMED (`block()` rethrows) over (i)'s fixture — declared: NO foot and no section tally
   -> no foot, exit 1, no tallies, as declared: the driver cannot read an early end as a finished run.

   D-468 (declared and RUN 2026-09-24, WORKER D-468 (SCHEDULER #19)) — THREE ARMS PLUS A BASELINE, each
   armed ALONE by an anchor asserted to match EXACTLY ONCE, the suite run directly, every restore by `cp`
   from a uniquely-named per-arm pristine copy and verified by sha256 AND `cmp` with a byte floor. The
   harness lives OUTSIDE the worktree (BOB #32, 2026-09-24). Declared before arming: (i) MUST fail the
   D-468 REFUSAL row and the WITNESS row by name and MUST NOT fail section 1; (ii) MUST fail an
   amendment that moves no state; (iii) MUST fail the two rows that read the C-number and nothing else.
   (0) BASELINE, nothing armed -> **44 pass, 0 fail**, foot reached.
   (i) THE ROW'S OWN ARM — DROP THE EDGE CHECK (`&& false` on the `bias-state-edge` condition in
   `src/store.mjs`) -> **22 pass, 3 fail, AND THE RUN DID NOT REACH ITS FOOT**: the D-468 REFUSAL row and
   the WITNESS row failed by name as declared (the census read 19 promotions and 19 manifest rows where
   the baseline read 18 and 18 — the backwards move LANDED), and then the fixture aborted, because with
   the head moved to the refused revision the amendment below it was refused `CAS_STALE`. **RECORDED, NOT
   SMOOTHED: the abort is the defect's own shape** — the third declared failure (section 6's
   refusal sweep) was therefore NOT MEASURED under this arm, and its tally is -1 rather than 0. The
   instrument is why: this suite does not wrap its sections in a `block()` recorder, so one fixture
   failure ends the run — D-93's class, which `bias.test.mjs` already learned and this suite has not.
   Arm (iii) below measures the same sweep to the foot.
   (ii) OVER-STRICTNESS — the `to !== from` guard removed, so a revision that MOVES NO STATE is refused
   too -> **12 pass, 1 fail**, aborting at section 3's `adopted -> adopted` amendment with
   `BIAS_ILLEGAL_TRANSITION` — correct work in a spelling the fence must not refuse, and the doctrine's
   own way to amend an adopted set. (The harness's "arm marker gone" line read FALSE on the restore and
   that is the HARNESS citing its own correction: the armed string is a SUBSTRING of the restored one.
   The restore itself is verified by sha256 and `cmp`, both identical, and `node --check` passed.)
   (iii) THE CATALOGUE'S NUMBER MOVED — `BIAS_ILLEGAL_TRANSITION.check` set to `C-99.9` in
   `checks/bio-checks.mjs` -> **42 pass, 2 fail**, foot reached: the D-468 refusal row and section 6's
   sweep, both on the number and nothing else, which is what proves those rows read the CATALOGUE's
   C-number rather than a constant this suite typed.
   **AN ARM THAT COULD NEVER HAVE BEEN HONOURED, recorded because it is a finding about the ARM:** (iii)
   was first spelled as *drop the code from the refusal at its site in `store.mjs`* and came back **44
   pass, 0 fail**. Nothing was wrong with the subject — `dec49Decorate` in `index.mjs` stamps `check` and
   `translation` onto EVERY `ok:false` answer from the `_CHECKS` catalogue keyed by `reason`, so the
   number on the wire cannot be removed at the site at all. The arm was re-asked of the catalogue row,
   which is where the number actually lives. (A first attempt at that same arm also broke the module's
   syntax and was thrown away rather than read: a control that moves a second variable refutes nothing.)

   RE-RUN IN FULL after D-468 merged `origin/main` (9f8b69e67) into its branch and FOLDED its type derivation
   onto D-510's `promotedType`: the subject changed, so its control was re-armed rather than believed. Every
   figure is the same — BASELINE 44/0 foot reached, (i) 22/3 with the same two rows by name and the same abort,
   (ii) 12/1 at the same amendment, (iii) 42/2 foot reached — and every restore verified by sha256 AND `cmp` on
   the merged files (3,327,022 bytes for store.mjs, 961,420 for bio-checks.mjs). The rule that made this
   necessary: a suite coupled to BEHAVIOUR survives a refactor that disarms a control coupled to SHAPE.

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
     - REC-187: across propose -> adopt -> amend, the stamped hash equals one recomputed from
       exactly the stamped sha's bytes, and the sha is the ADOPTED one                  -> section 4
     - D-468: `adopted` -> `proposed` is refused by name at the write path and writes nothing,
       and every declared edge (and a revision that moves no state) still passes         -> section 4
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
import { parseFrontmatter, checkCaseDocument, STATES, vocabFor } from "../checks/bio-checks.mjs";

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
/* D-548: EVERY SECTION RUNS INSIDE `block()` — bias.test.mjs's recorder, adopted. Before it, `bail()` disposed the
   sandbox and exited on the FIRST fixture failure, so one broken fixture ended the run and every later section went
   unmeasured for a round (found by D-468's worker). Now a fixture failure is a THROW that `block()` records as ONE
   failure naming its section, and the sections after it still run and report. Each section's own tally is kept and
   printed at the foot; a section that DIED prints its tally as -1, never as the partial count it reached, because a
   partial count read as a tally is the claim-more-than-it-measured this recorder exists to stop. A section resting on
   an earlier one's values (3 and 5 read 1 and 2) dies BY NAME when that one died — recorded, never silent. */
const bail = (what, r) => { throw new Error(`(fixture) ${what}: ${JSON.stringify(r).slice(0, 600)}`); };
/* A section that reads an earlier one's values asks for them first, so it dies naming the section it rests on
   rather than on a TypeError that names nothing. */
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
let NADIA, IRIS, PROJ;
console.log("\n--- 0. setup: members, the signer, the publishing project ---");
await block("0 (setup)", async () => {
  NADIA = await enrol("nadia", "admin", ["contribute", "publish", "create_projects"]);
  await enrol("omar", "admin", ["contribute", "publish"]);
  IRIS = await enrol("iris", "member", ["contribute", "publish"]);
  await POST("op=signeradd&token=adm-d84", { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" });
  PROJ = await makePublishingProject({
    post: async (q, b) => (await mf.dispatchFetch(`http://x/api/?${q}`,
      { method: "POST", body: JSON.stringify(b ?? {}) })).json(),
    mf, sha, machineToken: "adm-d84", owner: "iris",
    name: "PROJ-2026-8400-lens", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
  if (typeof PROJ !== "string" || !PROJ) bail("makePublishingProject", PROJ);
});

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
/* The values later sections read, hoisted so each section can run inside block(). */
let pubA, docA, FA, L1, pubB, docB, FB, L2, FC;
const BI = "BIAS-2026-8400-instance", BP = "BIAS-2026-8400-project";
const pairsOf = (fm) => (fm.bias_manifest_bundles || []).map((r) => [r.bundle_id, r.revision, r.scope]);

console.log("\n--- 1. with nothing adopted, the signed document says NO MANIFEST WAS IN FORCE ---");
await block("1", async () => {
const L0 = await lensOf();
t("REACH: the project's lens is genuinely not in force before anything is adopted",
  [L0?.in_force, L0?.stated], [false, "no manifest was in force"]);

pubA = await publishAndSign(await ground("none"), "A");
docA = await readDoc(pubA);
FA = parseFrontmatter(docA.text).data;
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
});

/* ===========================================================================
   2. A LENS ADOPTED — the document NAMES EACH PAIR AND THE HASH.
   =========================================================================== */
console.log("\n--- 2. under an adopted set, the signed document names each (bundle, revision) pair and the hash ---");
await block("2", async () => {
const TXT_I1 = "Claims from the city attorney's office need a second record.";
const TXT_P1 = "Budget figures quoted by the office are checked against the adopted budget.";
for (const st of ["draft", "proposed"]) await promote(NADIA, BI, biasMd(BI, st, "i1", TXT_I1), "bias", st);
const adI = await GET(`op=biasadopt&token=${NADIA}&bundleId=${BI}`);
const ADOPTED_I = (await promote(NADIA, BI, biasMd(BI, "adopted", "i1", TXT_I1), "bias", "adopted")).bundleSha;
for (const st of ["draft", "proposed"]) await promote(IRIS, BP, biasMd(BP, st, "p1", TXT_P1), "bias", st);
const adP = await GET(`op=biasadopt&token=${IRIS}&bundleId=${BP}&scope=project&scopeId=${PROJ}`);
const ADOPTED_P = (await promote(IRIS, BP, biasMd(BP, "adopted", "p1", TXT_P1), "bias", "adopted")).bundleSha;
L1 = await lensOf();
t("REACH: both adoptions landed and the project's lens is IN FORCE with TWO pairs — one instance, one "
+ "project — so every arm below compares something real",
  [adI?.ok, adP?.ok, L1?.in_force, (L1?.bundles || []).map((b) => [b.bundle_id, b.scope]),
   /^[0-9a-f]{64}$/.test(L1?.statements_sha || "")],
  [true, true, true, [[BI, "instance"], [BP, "project"]], true]);

pubB = await publishAndSign(await ground("lensed"), "B");
docB = await readDoc(pubB);
FB = parseFrontmatter(docB.text).data;
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
});

/* ===========================================================================
   3. THE LENS MOVES AFTER PUBLISHING — the signed bytes do NOT.
   =========================================================================== */
console.log("\n--- 3. a new revision adopted afterwards moves op=biasmanifest and never the published bytes ---");
await block("3", async () => {
needs("1 and 2", { pubA, docA, pubB, docB, FB, L1 });
const beforeB = { text: docB.text, sha: sha(docB.text), doc_sha: docB.doc_sha };
const beforeA = sha(docA.text);
const TXT_I2 = "Claims from the city attorney's office need TWO independent records.";
await promote(NADIA, BI, biasMd(BI, "adopted", "i1", TXT_I2), "bias", "adopted");
const reI = await GET(`op=biasadopt&token=${NADIA}&bundleId=${BI}`);
L2 = await lensOf();
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
FC = parseFrontmatter((await readDoc(pubC)).text).data;
t("OVER-STRICTNESS ARM: a case published after the lens moved stamps the lens in force AT ITS OWN "
+ "publication — the new revision and hash — so freezing is per edition, not a stamp that stopped reading",
  [FC.bias_manifest?.statements_sha, pairsOf(FC).map((p) => p[1])],
  [L2.statements_sha, (L2.bundles || []).map((b) => b.revision)]);
});

/* ===========================================================================
   4. REC-187 — PROPOSE -> ADOPT -> AN AMENDMENT: the stamp names the ADOPTED revision, and its
      hash is recomputable from EXACTLY that revision's bytes.
      AND D-468 — the backwards move this section used to drive is REFUSED BY NAME.
   BOB #31, `BIO_Declared_Bias_v0_1.md` §"The bias acknowledgement, authored at export": *"Promotion
   to `adopted` re-pins the adoption to the adopted bundle_sha, the case stamps that sha, and
   op=biasmanifest hashes THAT revision's statements — one quantity under one name."*
   HOW A LIAR PASSES IT: hash the latest projection. So after the case is published the set is AMENDED
   with a different statement, and every expectation is recomputed by THIS SUITE from the bytes of the
   stamped shas alone — its own reading of the frontmatter and its own SHA-256, never the plane's
   helper — so a hash of the head, of the projection, or of anything but the named revision disagrees.
   D-468's rows sit between the adoption and the publication: the same `adopted -> proposed` promotion
   REC-187 drove is still sent, and what is asserted of it is the refusal and the record's stillness.
   =========================================================================== */
/* WHAT SECTION 4 CANNOT SEE, stated: (1) the RESIDUE is now read from the pinned revision too, but this
   fixture writes the same `## What This Does Not Enforce` text into every revision, so no row here can tell
   a head's residue from a pin's; (2) op=biasmanifest's UNDETERMINED answer (a pin whose bytes the store
   cannot produce) is not reachable through the ops — promote() snapshots every outgoing revision into
   `history`, and purge clears a purged set's adoptions — so it is written and NOT driven; (3) the recompute
   does not model a project NULLIFICATION and refuses rather than guesses if one appears.;
   (4) D-468: the WITNESS under the refusal is the census's STORE-WIDE promotion and manifest-row totals, so
   it sees "no row was written anywhere", not "no row was written for this bundle" — a write that added a row
   and removed another would pass it, and no such path exists at promote; (5) with the edge closed, an
   ADOPTED set's head and its pin cannot diverge at all, so the "a later proposal does not move the lens"
   reading REC-187 asserted here is no longer a reachable state and nothing below claims it. */
console.log("\n--- 4. REC-187 + D-468: propose -> adopt -> amend; the stamp names the ADOPTED revision, and the backwards move is refused ---");
await block("4", async () => {
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
const revOf = (bundles, id) => (bundles || []).find((b) => b.bundle_id === id)?.revision;
t("REACH: TWO DISTINCT revisions of one set — the PROPOSED one op=biasadopt pinned, and the ADOPTED one "
+ "the promotion re-pinned to — so the rows below separate two candidate answers, not one, and a third "
+ "arrives at the amendment at the foot of this section",
  [new Set([PROPOSED_Q, ADOPTED_Q]).size, adQ?.ok, adQ?.pinned?.bundle_sha, HEAD.get(BQ),
   revOf(L3?.bundles, BQ)],
  [2, true, PROPOSED_Q, ADOPTED_Q, ADOPTED_Q]);

/* ---------------------------------------------------------------------------
   D-468 — CORRECTION, 2026-09-24. THE MOVE THIS SECTION USED TO DRIVE IS REFUSED.

   REC-187 reached its "the head moved and the lens did not" reading by promoting the adopted set BACK to
   `proposed` and reading a new head. THE OLD ASSERTION WAS WRONG, and its own worker said so (its F4):
   `STATES.bias` has no edge out of `adopted` except `retired`, so `adopted -> proposed` is a move the
   record was never supposed to accept — `op=promote` consulted no edge table and accepted it anyway. A
   suite that drives an illegal move to reach a legal reading is asserting over a state the machine
   forbids, so the reading was resting on the defect. D-468 closes the edge; these rows replace the three
   that rested on it, and they are a CORRECTION rather than an exemption — the same promotion is still
   sent, and what is asserted about it is now the refusal and the record's stillness.

   WHAT IS LOST AND IS SAID PLAINLY: with the edge closed, an ADOPTED set's head and its pin cannot
   diverge at all — the only moves left are `retired` and a revision that stays at `adopted`, and that
   revision RE-PINS (REC-187). So "a later PROPOSAL neither moves nor lifts the adopted lens" is no longer
   a reachable state of this plane, and nothing below claims to test it. What REC-187's mechanism is still
   held to is the part that IS reachable and is what the case stamp rests on: the pin follows adoption (the
   over-strictness arm), the stamp equals a recompute from exactly the stamped revision's bytes (the
   equality arm), and a liar recomputing at read time is caught by the amendment's different hash.
   --------------------------------------------------------------------------- */
const censusOf = async () => GET("op=snapkeycensus&token=adm-d84");
const cen0 = await censusOf();
const backQ = await POST(`op=promote&token=${IRIS}`, {
  bundleId: BQ, base: HEAD.get(BQ),
  snapKey: "20260923T235959Z_d468back",
  meta: { object_type: "bias", group: "believe-in-oakland", title: `Bundle ${BQ}`,
          current_state: "proposed", created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text: biasMd(BQ, "proposed", "q1", TXT_Q2),
            bytes: biasMd(BQ, "proposed", "q1", TXT_Q2).length, sha256: sha(biasMd(BQ, "proposed", "q1", TXT_Q2)) }] });
t("D-468 / C-26.12: AN ADOPTED SET MAY NOT BE MOVED BACK TO `proposed` — refused BY NAME at the write "
+ "path, with the head it stands at, the state asked for, and the moves the catalogue's own table allows",
  [backQ?.ok, backQ?.reason, backQ?.check, backQ?.from, backQ?.to, backQ?.legal_from,
   typeof backQ?.translation === "string" && backQ.translation.length > 0],
  [false, "BIAS_ILLEGAL_TRANSITION", "C-26.12", "adopted", "proposed", ["retired"], true]);
const cen1 = await censusOf();
const L4 = await lensOf();
t("AND NOTHING WAS WRITTEN — the WITNESS, not the absence of an error: the record's own counters "
+ "(promotions, manifest rows) read the same before and after, and the lens still names the ADOPTED "
+ "revision with the hash it gave at adoption",
  [[cen1?.promotions, cen1?.manifest_rows], L4?.in_force, revOf(L4?.bundles, BQ), L4?.statements_sha],
  [[cen0?.promotions, cen0?.manifest_rows], true, ADOPTED_Q, L3?.statements_sha]);
t("THE COUNTERS COULD HAVE MOVED: the census read a corpus with promotions and manifest rows in it, so "
+ "the equality above is not two zeroes agreeing",
  [cen0?.promotions > 0, cen0?.manifest_rows > 0], [true, true]);

const pubD = await publishAndSign(await ground("amended"), "D");
const docD = await readDoc(pubD);
const FD = parseFrontmatter(docD.text).data;
const pairsD = pairsOf(FD).map((p) => [p[0], p[1]]);
t("EQUALITY ARM: the case stamps the ADOPTED sha, and its statements hash EQUALS a hash recomputed by this "
+ "suite from EXACTLY the stamped shas' bytes — one quantity under one name",
  [revOf(FD.bias_manifest_bundles, BQ), FD.bias_manifest?.statements_sha],
  [ADOPTED_Q, recompute(pairsD)]);
t("the stamp and op=biasmanifest are ONE quantity: the same pairs and the same hash, read by two readers",
  [pairsD, FD.bias_manifest?.statements_sha],
  [(L4?.bundles || []).map((b) => [b.bundle_id, b.revision]), L4?.statements_sha]);
t("a PERSON reads the adopted revision in the body, and the proposed sha appears nowhere in it",
  [docD.text.includes(`- ${BQ} (project) at revision ${ADOPTED_Q}`), docD.text.includes(PROPOSED_Q)],
  [true, false]);

/* OVER-STRICTNESS: the re-pin must FOLLOW a real adoption, not freeze on the first one. D-468 CHANGED
   HOW THIS ARM IS SPELLED AND NOT WHAT IT TESTS: the amended statement used to arrive as a later
   PROPOSAL and then be promoted, which took the illegal edge to get there. It now arrives the way the
   doctrine says an adopted set is amended — *"a NEW REVISION of the same bundle under append-only
   history — which re-pins"* (`BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption") — a revision that
   leaves the set at `adopted`, which is a revision and not a transition and so is not the machine's
   question at all. The lens and the next case must name IT, with its own hash. */
const ADOPTED_Q2 = (await promote(IRIS, BQ, biasMd(BQ, "adopted", "q1", TXT_Q2), "bias", "adopted")).bundleSha;
const L5 = await lensOf();
const pubE = await publishAndSign(await ground("readopted"), "E");
const FE = parseFrontmatter((await readDoc(pubE)).text).data;
t("A REVISION THAT LEAVES THE SET AT `adopted` IS NOT A MOVE, and D-468 does not refuse it — the "
+ "amendment landed, and it is a THIRD distinct revision",
  [typeof ADOPTED_Q2 === "string", new Set([PROPOSED_Q, ADOPTED_Q, ADOPTED_Q2]).size], [true, 3]);
t("OVER-STRICTNESS ARM: once the amended revision is itself adopted, the lens and the next "
+ "case name THAT revision and hash exactly its bytes — the pin follows adoption, it does not stick",
  [revOf(L5?.bundles, BQ), revOf(FE.bias_manifest_bundles, BQ), FE.bias_manifest?.statements_sha],
  [ADOPTED_Q2, ADOPTED_Q2, recompute(pairsOf(FE).map((p) => [p[0], p[1]]))]);
t("THE EQUALITY ARM COSTS SOMETHING: the same recompute over the AMENDED revision's bytes — the hash a "
+ "liar reading the latest projection would stamp onto case D — is a DIFFERENT hash, so case D's "
+ "equality above could not have held by accident",
  [recompute(pairsD.map(([b, r]) => [b, b === BQ ? ADOPTED_Q2 : r])) !== FD.bias_manifest?.statements_sha,
   /^[0-9a-f]{64}$/.test(recompute(pairsD.map(([b, r]) => [b, b === BQ ? ADOPTED_Q2 : r])))],
  [true, true]);
t("and case D, published under the earlier adoption, still names it — frozen, never recomputed — and the "
+ "amended sha appears nowhere in its bytes",
  [revOf(parseFrontmatter((await readDoc(pubD)).text).data.bias_manifest_bundles, BQ),
   (await readDoc(pubD)).text.includes(ADOPTED_Q2)], [ADOPTED_Q, false]);
});

/* ===========================================================================
   5. REC-188 — `bio-case-document/3`: THE GATE REFUSES THE ABSENCE.

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
console.log("\n--- 5. REC-188: a published case reads /3, and the gate refuses a /3 document silent about the lens or its second readers ---");
await block("5", async () => {
  needs("1, 2 and 3", { FA, docA, FB, docB, FC });
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
});

/* ===========================================================================
   6. D-468 — THE WHOLE DECLARED TABLE, DRIVEN THROUGH op=promote.

   The row's accepts-when is *"`adopted` -> `proposed` is refused by name; every declared edge still
   passes"*, and section 4 answers the first clause at the site that exercised the defect. This section
   answers the second, and answers it BY INVERSION rather than by a list of spellings: the corpus is
   `vocabFor(STATES, "bias")` ITSELF — every ordered pair of legal states is driven, the pair is
   expected to LAND exactly when the table declares the edge and to be REFUSED exactly when it does
   not, and the walk to each starting state is computed from the same table. A state added to the
   machine tomorrow enlarges this sweep on its own; a hand list would have gone stale that day.

   WHAT IT CAN AND CANNOT SEE, plainly. It sees every move BETWEEN legal states, driven through the op
   under a member's token, and the birth state is the table's `legal[0]` — the same derivation
   `setup.mjs` makes (FIRST_STATE). It does NOT see: a target state the vocabulary does not carry at
   all (the catalogue refuses that at the gate, and this row does not claim it is refused at the write
   path); which state a set may be BORN in, because a creation has no head to move from and is not this
   fence's question; and anything about the OTHER object types' machines, which `promote` still does not
   ask — reported as a finding rather than fixed here.
   =========================================================================== */
console.log("\n--- 6. D-468: every ordered pair of bias states, driven from the catalogue's own table ---");
await block("6", async () => {
  const MACHINE = vocabFor(STATES, "bias");
  const LEGAL = MACHINE?.legal || [], EDGES = MACHINE?.edges || {};
  const BIRTH = LEGAL[0];
  /* The walk to any state, taken from the table rather than written down. */
  const pathTo = (target) => {
    if (target === BIRTH) return [];
    const q = [[BIRTH, []]], seen = new Set([BIRTH]);
    while (q.length) {
      const [st, acc] = q.shift();
      for (const nx of (EDGES[st] || [])) {
        if (seen.has(nx)) continue;
        const next = [...acc, nx];
        if (nx === target) return next;
        seen.add(nx); q.push([nx, next]);
      }
    }
    return null;
  };
  let seq = 0;
  const TEXT = "Figures the office cites are checked against the executed contract.";
  const mv = async (id, state, base) => {
    const text = biasMd(id, state, "e1", TEXT);
    return POST(`op=promote&token=${IRIS}`, {
      bundleId: id, base,
      snapKey: `20260924T${String(100000 + (++seq)).slice(-6)}Z_${sha(`d468-${seq}`).slice(0, 8)}`,
      meta: { object_type: "bias", group: "believe-in-oakland", title: `Bundle ${id}`,
              current_state: state, created: NOW, last_updated: LATER },
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }] });
  };
  /* A fresh set walked to `from`, then the pair under test sent. Returns the plane's answer, or the
     reason the fixture could not be built — which is a FINDING and is reported, never scored zero. */
  const drive = async (from, to, tag) => {
    const id = `BIAS-2026-8468-${tag}`;
    const walk = pathTo(from);
    if (walk === null) return { unreachable: from };
    let r = await mv(id, BIRTH, null);
    if (!r || r.ok === false) return { fixture: `birth ${BIRTH}`, answer: r };
    for (const st of walk) {
      r = await mv(id, st, r.bundleSha);
      if (!r || r.ok === false) return { fixture: `walk to ${st}`, answer: r };
    }
    return { answer: await mv(id, to, r.bundleSha) };
  };

  const declared = [], undeclared = [];
  for (const from of LEGAL) for (const to of LEGAL) {
    if (from === to) continue;
    ((EDGES[from] || []).includes(to) ? declared : undeclared).push([from, to]);
  }
  t("REACH: the corpus is the CATALOGUE'S TABLE, not a list this suite typed — every ordered pair of "
  + "the bias machine's legal states, split into the declared edges and the rest, and BOTH sides have "
  + "members (a sweep with an empty half proves nothing)",
    [LEGAL.length, declared.length + undeclared.length, declared.length > 0, undeclared.length > 0,
     LEGAL.length * (LEGAL.length - 1)],
    [4, 12, true, true, 12]);
  t("and every state is REACHABLE from the birth state by the table's own edges, so no pair below is "
  + "skipped for want of a fixture",
    LEGAL.filter((st) => pathTo(st) === null), []);

  const landed = [], refused = [], broken = [];
  for (const [from, to] of declared) {
    const r = await drive(from, to, `d-${from}-${to}`);
    if (r.unreachable || r.fixture) { broken.push([from, to, r.fixture ?? `unreachable ${r.unreachable}`]); continue; }
    landed.push([from, to, r.answer?.ok === true || typeof r.answer?.bundleSha === "string"]);
  }
  for (const [from, to] of undeclared) {
    const r = await drive(from, to, `u-${from}-${to}`);
    if (r.unreachable || r.fixture) { broken.push([from, to, r.fixture ?? `unreachable ${r.unreachable}`]); continue; }
    refused.push([from, to, r.answer?.reason ?? null, r.answer?.check ?? null]);
  }
  t("NO FIXTURE FAILED TO BUILD — anything this sweep could not stand up is NAMED here rather than "
  + "scored as a pass or a refusal",
    broken, []);
  t("EVERY DECLARED EDGE STILL PASSES: each one driven on its own set, walked to its `from` state by "
  + "the table's own path, and each landed",
    [landed.length, landed.filter(([, , ok]) => !ok)], [6, []]);
  t("AND EVERY MOVE THE TABLE DOES NOT DECLARE IS REFUSED BY NAME, with C-26.12 — six of them, "
  + "`adopted` -> `proposed` among them, and the two out of the terminal state as well",
    [refused.length, refused.filter(([, , reason, check]) =>
       reason !== "BIAS_ILLEGAL_TRANSITION" || check !== "C-26.12"),
     refused.map(([from, to]) => `${from}->${to}`).sort()],
    [6, [],
     ["adopted->draft", "adopted->proposed", "draft->adopted",
      "retired->adopted", "retired->draft", "retired->proposed"]]);

  const same = [];
  for (const st of LEGAL) {
    const r = await drive(st, st, `s-${st}`);
    same.push([st, r.fixture ?? r.unreachable ?? (r.answer?.ok !== false)]);
  }
  t("OVER-STRICTNESS ARM: A REVISION THAT MOVES NO STATE IS NOT A TRANSITION and is NOT refused — in "
  + "EVERY legal state, including `adopted`, which is how the doctrine says an adopted set is amended "
  + "(*a NEW REVISION of the same bundle under append-only history — which re-pins*)",
    same, LEGAL.map((st) => [st, true]));
});

/* D-548: every section's own tally, -1 for one that DIED; and a section that never recorded at all is named
   missing rather than read as clean — the foot counts the sections it expected against the ones that reported. */
const EXPECTED = ["0 (setup)", "1", "2", "3", "4", "5", "6"];  /* "6": D-468's sweep, wrapped at c21-batch28 */
console.log("\n--- per-section tallies (D-548: -1 = the section DIED, its tally is missing) ---");
for (const n of EXPECTED) {
  const r = TALLY.find((x) => x.name === n);
  if (!r) { fail++; console.log(`  FAIL  section ${n}: NEVER REPORTED — tally -1`); continue; }
  console.log(`  section ${n}: ${r.pass} pass, ${r.fail} fail${r.died ? "  [DIED]" : ""}`);
}
const DIED = TALLY.filter((x) => x.died).map((x) => x.name);
console.log(`\nd84-case-manifest: ${pass} pass, ${fail} fail  [FOOT REACHED${DIED.length ? `; DIED: ${DIED.join(", ")}` : ""}]`);
await mf.dispose();
process.exit(fail ? 1 : 0);
