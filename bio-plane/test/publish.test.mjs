/* NEGATIVE CONTROL: (REC-14's four PLUS REC-47's two. **88 pass when whole** — 74 -> 88, the +14 being REC-47's (two refusal arms, two byte-in-the-signed-document arms, one gate-side entry-requirement arm, the carried-forward arm with its own refusal NAME, the publishes-anyway complement, and the catalog arms). REC-14's four were NOT re-run 2026-08-05 by rec47-agent: each of them neuters C-21.1 or the edition refusals WHOLESALE (`if (false)`), so their counts move with the suite's size rather than with their subject, and the honest statement is that they are RECORDED AT THE SIZE THEY WERE MEASURED AT (74) and are re-runnable in one step. REC-47's two were RUN 2026-08-05 against THIS file. Every file restored BYTE-IDENTICALLY, sha256 compared before and after each arm and equal to: src/store.mjs 95332d64f73e115445eb77f73eae887ab1c24eddad7dbbf5b40019ecc4b32dab, src/index.mjs 5202ffcb3ea9f2034cc210495190e37533fdf97a10e3b1f89454a069924a86bd, checks/bio-checks.mjs a2be732cb76b5234e1b7d35beff46bacd4528cf3b6a94389e286afebeb082214.)  ==== REC-47's TWO, RUN 2026-08-05 ====  (e) THE BIAS BYTE-CHECK IS A CHECKBOX — THE ITEM'S OWN CONTROL, and it is REC-14's arm (a) at the field this item added. In checks/bio-checks.mjs checkCompletenessFreshness DELETE the line `    bias_acknowledgement: 'bias_acknowledgement',` from LABEL, AND in src/store.mjs publishCase() delete `, bias_acknowledgement: "the bias acknowledgement"` from its LABEL -> **79 pass, 8 FAIL**. PRESENCE IS STILL REQUIRED IN BOTH GATES UNDER THIS ARM, which is the whole point: the ceremony still demands an acknowledgement and now accepts last edition's reprinted verbatim, so what is left is a checkbox. The headline arm reports `[true,null,null,null,null]` where it wanted the refusal — op=publish ACCEPTED the carried-forward sentence — and `the case did NOT move` reports "published", i.e. the edition LANDED on it. The two catalog arms report 0 C-21.1 findings, so nothing downstream would ever notice either. Note the CASCADE, which is worth reading rather than dismissing as noise: because the carried-forward publish SUCCEEDS it consumes edition 3, so the legitimate publication after it then fails too — a suite reading only the first failure would misdiagnose this as an edition bug. (f) THE ENTRY REQUIREMENT IS ONE-SIDED — in checks/bio-checks.mjs checkPublishedExtension replace `if (biasAcknowledgementOf(fm) === null || fm.bias_acknowledgement.trim() === '') {` with `if (false) {`, leaving the STORE's NO_BIAS_ACKNOWLEDGEMENT refusal standing -> **87 pass, 1 FAIL**: `a published document with NO bias acknowledgement is refused BY THE GATE` reports 0 findings. The act still refuses, so an arm that only drove op=publish would stay green — and hand-written bytes through op=promote are exactly the route that skips the act. One-sided checks are what REC-13 found and REC-14 recorded; this is that lesson held at the new field. Restore after each.  ==== REC-14's FOUR (2026-08-04 numbers, suite size 74) ==== (a) C-21.1 IS A CHECKBOX — in checks/bio-checks.mjs checkCompletenessFreshness replace `if (now[k] != null && was[k] != null && now[k] === was[k]) {` with `if (false) {`, AND in src/store.mjs publishCase() replace the matching `if (now[k] != null && prior.completeness[k] != null && ...)` with `if (false)` -> 69 pass, 5 FAIL (65 before the REC-31 merge, same five assertions): the headline "a second edition carrying edition 2's STATEMENT verbatim is REFUSED" reports `undefined` because op=publish ACCEPTED it and the edition landed, the next two then report ILLEGAL_TRANSITION (the case is already published on a carried-forward assertion), and "the CATALOG names C-21.1" reports 0 — the gate finds nothing wrong with that document either, so nothing downstream would ever notice. Both halves must go together, as REC-13 found: breaking one alone leaves the other refusing. (b) THE AXES COMPOSED, two variants, because which probe flips depends on which scalar the bug composes. (b1) checkInheritedLeg `const on = frozen[axis]` -> `const on = frozen.capture` -> 69 pass, 1 FAIL: PROBE 2 (inheriting CONNECTION B from a case whose frozen connection is C) is ACCEPTED, got [true,null,[]] where [false,"BASIS_REFUSED",["C-21.2"]] was wanted. (b2) compose to the WEAKEST letter instead (`const on = worst(frozen.capture, frozen.connection)`) -> 69 pass, 1 FAIL, the OPPOSITE one: PROBE 3, the LEGAL leg inheriting capture B at the frozen capture grade, is REFUSED. Two "must refuse" probes alone would have missed (b2) entirely; the four probes are why either variant is caught. (c) THE UPSERT RETURNS — in src/store.mjs publish() replace `ON CONFLICT(bundle_id,edition) DO NOTHING` with an UPDATE of every column, force `const ed = 1`, and guard both edition refusals with `if (false)` -> 61 pass, 9 FAIL: "edition 1 KEEPS its own signature" reports edition 2's sha in edition 1's row, "BOTH editions are readable" reports ONE row, and "edition 1's completeness statement is still exactly what was signed" reports edition 2's statement. D-144 reproduced exactly — a reader who relied on edition 1's attestation finds edition 2's in its place. (d) THE MIGRATION LOSES THE RECORD — in src/store.mjs #migrate delete the `INSERT INTO published_bundles ... SELECT ... FROM published_bundles_preeditions` copy-forward -> 72 pass, 1 FAIL: "the legacy row SURVIVES the re-key" reports 0 editions, i.e. every case a group had already published, with its signature and its attestor, gone at the next boot. Restore after each. */
/* REC-14: the `published` state — EDITIONS, the completeness assertion, and the
 * gates that stop it being a checkbox.
 *
 * The scope is QUEUE.md REC-14 re-based on four rulings, and this suite is
 * organised as the arguments each one makes rather than as a tour of the code:
 *
 *   1. THE ACT, AND WHAT IT REFUSES. op=publish authors the case — the
 *      completeness statement, the exclusion list, the declared position on
 *      putting it to its subject — and stamps what it must not let a caller
 *      author: the author, the time, the EDITION, both frozen strengths and the
 *      declared bar. Every refusal fires BEFORE anything moves.
 *   2. DEC-13, AND THE THING IT DOES NOT CHECK. The gate is that the position
 *      is DECLARED AND JUSTIFIED. It is never that contact happened and never
 *      that the answer was favourable — so a case that deliberately gave no
 *      notice publishes exactly as one that sought comment, and this suite
 *      proves it BOTH behaviourally and structurally (nothing anywhere in the
 *      plane compares the position against a value).
 *   3. DEC-12, EDITIONS. A case publishes at edition 1, is reopened, is
 *      concluded again and publishes at edition 2 — and BOTH editions stay
 *      readable, each with its OWN signature, attestor, time and gate version.
 *      Reopening does NOT unpublish. A republish that does not increment the
 *      edition is refused by name.
 *   4. C-21.1, THE COMPLETENESS GATE. No asserted field of the completeness
 *      block may be carried forward byte-identical from the previous EDITION,
 *      because a gate that only checks presence IS a checkbox.
 *   5. C-21.2, THE INHERITANCE RULE, PER AXIS. Four probes, and they are four
 *      rather than two on purpose: a leg inheriting capture A from a frozen
 *      capture B is refused, a leg inheriting connection B from a frozen
 *      connection C is refused, AND the legal legs at the frozen grade on each
 *      axis are ACCEPTED. Any single-scalar comparison — strongest, weakest, or
 *      "whichever axis is first" — breaks at least one of the four.
 *   6. DEC-17, THE DECLARED BAR. Absent, group-declared, and project-overridden,
 *      each stamped beside the derived pair. An absent bar gates nothing and
 *      SAYS so: it is not a bar of zero.
 *   7. DEC-34, THE CONTAINER. Every ratification produces a signed hash
 *      manifest over every part, itself answerable by its own hash.
 *   8. C-9, THE NAMEABLE EXCLUSION. A row carries a target id OR prose and
 *      never neither, and "which cases excluded this document" is ONE indexed
 *      lookup — the query invariant 7 has no other mechanical enforcement point
 *      for at the case level.
 *
 * NEGATIVE CONTROLS RUN 2026-08-04 (rec14-agent), each alone and restored, 70
 * pass when whole; the header line above is the re-run recipe and carries the
 * exact edits. What each one MEASURED:
 *   (a) C-21.1 neutered in BOTH gates -> 65 pass, 5 FAIL. A second edition
 *       whose statement is the previous edition's BYTE FOR BYTE publishes, and
 *       the catalog then finds nothing wrong with the document either: the
 *       completeness assertion becomes a field that must be non-empty, which is
 *       the checkbox this gate exists to refuse. Breaking one side alone proves
 *       nothing, because the other still refuses (REC-13's finding, repeated).
 *   (b) the axes composed to ONE scalar -> 69 pass, 1 FAIL, in TWO variants
 *       that fail in OPPOSITE directions. Composed to the capture grade, the
 *       connection probe that must be refused is ACCEPTED. Composed to the
 *       weakest letter, the LEGAL connection/capture leg at the frozen grade is
 *       REFUSED. That is why there are four probes and not two: a suite holding
 *       only the two "must refuse" cases would pass under the second bug while
 *       the record quietly refused honest legs.
 *   (c) the upsert restored -> 61 pass, 9 FAIL. One row survives, edition 1's
 *       sha, signature and completeness statement are edition 2's, and the
 *       reader who relied on edition 1's attestation finds edition 2's in its
 *       place. D-144, reproduced on purpose.
 *
 * Every assertion that ratifies signs a real `bio-ratify` statement with stock
 * ssh-keygen, so this suite SKIPS LOUDLY WITH A NAMED REASON when ssh-keygen is
 * not on PATH rather than dying mid-run (ratify.test.mjs's precedent, D-93).
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkBundle, STATES, SUBJECT_POSITIONS } from "../checks/bio-checks.mjs";
import { SCHEMA } from "../src/schema.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- publish ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("publish: SKIPPED — ssh-keygen not on PATH; every edition here is ratified with a real "
    + "bio-ratify signature and the edition machinery cannot be exercised without one");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec14", MEMBER_TOKEN: "mem-rec14", PROBE_TOKEN: "prb-rec14", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

/* THE ops under test, driven through the CONTROL PLANE — a real caller's only
   route, and the literal `op=publish` uninterpolated so coverage credits it
   there (D-43: op=invitelook shipped with a ReferenceError while 1276
   store-level assertions passed). */
/* REC-44 / DEC-44 (2026-08-04): op=publish now requires an authored `scope` —
   a published case is a CONTAINER over one or more FINDINGS and states what
   brought them together. The helper supplies a default so every assertion below
   goes on measuring what it was written to measure; the NEW rule is asserted on
   its own, by name, rather than by these calls happening to omit the field.
   A body that sets `scope` (or `scope: ""`, to drive the refusal) wins. */
const publish = async (tok, body) => rP(await POST(`op=publish&token=${tok}`,
  { scope: "Whether the signature question was properly handled, on the documents in hand.", ...body }));
const conclude = async (tok, { target, conclusion, falsifier }) =>
  rP(await GET(`op=conclude&token=${tok}&target=${encodeURIComponent(target)}`
    + `&conclusion=${encodeURIComponent(conclusion)}&falsifier=${encodeURIComponent(falsifier)}`));
const strengthbar = async (tok, body) => rP(await POST(`op=strengthbar&token=${tok}`, body));
const barOf = async (target) => rP(await GET(`op=strengthbarof&token=mem-rec14&target=${encodeURIComponent(target)}`));
const editionsOf = async (id) => rP(await GET(`op=publishededitions&token=mem-rec14&id=${encodeURIComponent(id)}`));
const excludedBy = async (id) => rP(await GET(`op=excludedby&token=mem-rec14&id=${encodeURIComponent(id)}`));
const affordances = async (target) => rP(await GET(`op=affordances&token=mem-rec14&target=${encodeURIComponent(target)}`));
const actIds = (r) => (r?.acts ?? []).map((a) => a.id).sort();
const imageOf = async (id) => (await GET(`op=image&token=mem-rec14&id=${encodeURIComponent(id)}`)).result?.["bundle.md"];
const shaOf = async (id) => ((await GET("op=list&token=mem-rec14")).result || [])
  .find((b) => b.bundle_id === id)?.bundle_sha;
const stateOf = async (id) => ((await GET("op=list&token=mem-rec14")).result || [])
  .find((b) => b.bundle_id === id)?.current_state;
/* CORRECTED 2026-08-04 (REC-18), never exempted. `earned` joins `registry` as a
   second fact the pure catalog cannot read out of the bundle — an EARNED grade
   is computed from the record's `resolutions` and capture rows, so a checker
   that can see only these bytes refuses the leg rather than passing it. Asking
   the plane for it (op=earnedbasis) rather than hand-building the shape is
   deliberate: the op answers from the SAME store function op=promote enforces
   with, so "audits clean" is measured against the enforcer and not against a
   fixture's idea of it. */
/* CORRECTED 2026-08-04, REC-44 / DEC-44: the catalog now takes TWO published
   registries, because C-21.1 asks a CASE question (what did the previous
   edition of this case assert about its limits) and C-21.2 asks a FINDING
   question (what did the case beneath this leg freeze, per axis). They are
   injected separately and deliberately: one registry serving both altitudes is
   the collapse DEC-44 corrects. */
const errorsOf = async (id, text, registry, earned, caseRegistry) => {
  const { findings } = await checkBundle({ folderName: id,
    files: new Map([["bundle.md", text]]),
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    resolveTarget: () => true, publishedRegistry: registry, earnedRegistry: earned,
    publishedCaseRegistry: caseRegistry });
  return findings.filter((x) => x.severity === "error").map((x) => `${x.check}: ${x.message}`);
};
const earnedFor = async (id, tok = PILAR) =>
  rP(await GET(`op=earnedbasis&token=${tok}&id=${id}`));

/* ---- keys and roster ---- */
const dir = mkdtempSync(join(tmpdir(), "publish-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "pilar", "-f", join(dir, "pilar"), "-q"]);
const keyB64 = readFileSync(join(dir, "pilar.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "pilar"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};

const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-rec14", { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const NADIA = await enrol("nadia", "nadia-passphrase-1", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-1", "admin", ["contribute", "publish"]);
const PILAR = await enrol("pilar", "pilar-passphrase-1", "member", ["contribute", "publish"]);
const VIEWONLY = await enrol("quinn", "quinn-passphrase-1", "member", ["contribute"]);
rP(await POST("op=signeradd&token=adm-rec14", { keyB64, memberId: "pilar", comment: "pilar laptop" }));

/* ---- documents ---- */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role ?? "supports"}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : []),
      /* REC-18: a hunch announces itself with an author and a date (DEC-15). */
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : []),
      ...(l.edition !== undefined ? [`    target_edition: ${l.edition}`] : [])])]
  : [];

const inquiryMd = (id, { question = `What does ${id} rest on?`, state = "open",
                         refs = [], legs = [], extra = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs), ...extra,
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

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

const projectMd = (id, { refs = [], bar = null } = {}) => ["---",
  `id: ${id}`, "object_type: project", "schema: project@1",
  `title: "Project ${id}"`, "current_state: investigating", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'objective: "Decide whether to refer this to the auditor."',
  ...(bar ? ["required_strength:", `  capture: ${bar.capture}`, `  connection: ${bar.connection}`,
             `  author: ${bar.author}`, `  at: "${bar.at}"`] : []),
  "---", "", "## Thesis Summary", "", "A project.", "",
  "## Open Questions", "", "## Ruled Out", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
/* REC-18, 2026-08-04: an INFORMATION bundle promoted here now REGISTERS a
   capture. It is not decoration and it is not a workaround — a capture-axis
   grade is EARNED from the capture record, so a document with no registered
   bytes has nothing for that axis to be measuring and a leg claiming one is
   refused. The old fixture promoted documents with `register: []` and then
   authored capture grades over them, which is precisely the shape the earned
   rule exists to refuse. Registering makes the fixture what it always claimed
   to be: a captured document. */
const promote = async (id, md, type, state, tok = PILAR, base = null) => {
  const r = rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `20260804T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: type === "information"
      ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }]
      : [],
  }));
  return r;
};
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (r.ok === false) throw new Error(`promote ${a[0]}: ${JSON.stringify(r)}`);
  return r;
};
const ratify = async (id) => {
  const bundleSha = await shaOf(id);
  return rP(await POST(`op=ratify&token=${PILAR}`,
    { bundleId: id, expectedSha: bundleSha, sig: signRatify(id, bundleSha) }));
};

/* THE REOPEN IS REC-31'S ACT, driven through the control plane — decided at
   the REC-31 x REC-14 merge and pinned here rather than hand-written into the
   document, which is what this suite did while the two items were building in
   parallel. ONE reopen verb: `published` joined REOPENABLE_FROM beside the
   disposition set, `concluded` stays refused by name, and published -> open is
   the front door of a second edition. */
const reopen = async (target, reason) =>
  rP(await GET(`op=reopen&token=${PILAR}&target=${encodeURIComponent(target)}`
    + `&reason=${encodeURIComponent(reason)}`));

const INFO_CAP = "INFO-2026-1400-capture-b";
const INFO_CONN = "INFO-2026-1400-connection-c";
const INFO_LEFTOUT = "INFO-2026-1400-left-out";
const INQ_CASE = "INQ-2026-1400-case";
const INQ_THIN = "INQ-2026-1400-thin";
const INQ_USER = "INQ-2026-1400-user";
const INQ_OPEN = "INQ-2026-1400-open";
const PROJ = "PROJ-2026-1400-auditor";

await mustPromote(INFO_CAP, infoMd(INFO_CAP), "information", "collected");
await mustPromote(INFO_CONN, infoMd(INFO_CONN), "information", "collected");
await mustPromote(INFO_LEFTOUT, infoMd(INFO_LEFTOUT), "information", "collected");
/* The case rests on one CAPTURE-graded leg at B and one CONNECTION-graded leg
   at C, so its frozen pair is (capture B, connection C) — two DIFFERENT letters
   on the two axes, which is what makes the per-axis probes in block 5 able to
   tell a real comparison from a composed one. Capture never reaches A by
   doctrine (CAPTURE-FIDELITY: grade B is what a direct capture is worth);
   connection legitimately does, which is exactly why one letter can never stand
   for both. */
/* CORRECTED 2026-08-04 (REC-18), never exempted, and the frozen pair is
   UNCHANGED at (capture B, connection C) — which is the point, because this
   suite is about the pair and not about the ladder. What changed is where each
   letter comes from. `resolution` used to be a label a fixture could pick; it is
   now EARNED and admits only A/B/C against the inquiry's subject entity, and
   this question names none. So: the CAPTURE leg says `capture`, and it earns B
   from the capture the promote helper now registers — the doctrine's own value
   ("grade B is what a direct capture by this instance is worth; it is not grade
   A and this surface will not say it is"). The CONNECTION leg says `hunch`,
   which is the honest name for an authored connection grade and the only
   authored source permitted above D, carrying the author and date DEC-15
   requires. */
const CASE_LEGS = [{ target: INFO_CAP, grade: "B", axis: "capture", source: "capture" },
                   { target: INFO_CONN, grade: "C", axis: "connection", source: "hunch",
                     author: "pilar", date: "2026-08-04" }];
await mustPromote(INQ_CASE, inquiryMd(INQ_CASE, { question: "Was the sewer transfer authorised?",
  refs: [INFO_CAP, INFO_CONN], legs: CASE_LEGS }), "inquiry", "open");
await mustPromote(INQ_THIN, inquiryMd(INQ_THIN, { question: "Who signed the memo?",
  refs: [INFO_CAP], legs: [{ target: INFO_CAP }] }), "inquiry", "open");
await mustPromote(INQ_OPEN, inquiryMd(INQ_OPEN, { question: "Does this recur?",
  refs: [INFO_CAP], legs: [{ target: INFO_CAP }] }), "inquiry", "open");

const CONCL = "The transfer rests on a memo nobody adopted.";
const FALS = "An adopted resolution naming the transfer would overturn this.";
await conclude(PILAR, { target: INQ_CASE, conclusion: CONCL, falsifier: FALS });
await conclude(PILAR, { target: INQ_THIN, conclusion: "Undetermined on the present record.",
  falsifier: "A signature page would settle it." });

const STMT1 = "This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition 1.";
const JUST1 = "We put the four claims to the City Administrator on 2026-06-20 and printed what came back.";
const EX1 = [{ target: INFO_LEFTOUT, description: "the FY2023 comparison memo",
               reason: "a records request for it is still outstanding with the City Clerk" },
             { description: "any 2019 council minutes", reason: "not requested; outside the period at issue" }];
/* REC-47 / DEC-46 (a): the AUTHORED bias acknowledgement. Written the way a
   member would actually write one — it names the lens and says what it did to
   THIS edition's material, which is the thing C-21.1 holds fresh. Deliberately
   NOT a hunch: DEC-20 is that ordinary declared bias is DISCLOSED and never
   blocks publication, so a case that acknowledges a standing position must
   PUBLISH, and this suite's happy path is what asserts that. */
const BACK1 = "This group holds a declared position that municipal fund transfers should be adopted in public "
  + "session, and edition 1 reads the FY2024 record through it.";

/* ================================================= 1. the act and its refusals */
console.log("\n--- 1. op=publish AUTHORS the case, and refuses before anything moves ---");
{
  /* CORRECTED 2026-08-05, REC-47 / DEC-46 (a). `base` gains
     `biasAcknowledgement`, and every assertion below that reads a refusal OTHER
     than NO_BIAS_ACKNOWLEDGEMENT depends on it: op=publish now refuses a
     missing acknowledgement among the presence checks, so without this the
     three arms below (two BAD_EXCLUSION, one ILLEGAL_TRANSITION) would report
     NO_BIAS_ACKNOWLEDGEMENT and would silently stop testing their own subject.
     They are CORRECTED rather than exempted: each still demands exactly the
     refusal it always demanded, reached by supplying the field the ceremony now
     requires. */
  const base = { target: INQ_CASE, statement: STMT1, excluded: EX1,
                 subjectPosition: "sought_and_answered", subjectJustification: JUST1,
                 biasAcknowledgement: BACK1 };
  t("a machine credential cannot publish: the completeness assertion and the declared position are a named member's",
    (await publish("mem-rec14", base)).reason, "MACHINE_CANNOT_PUBLISH");
  t("no statement is refused BY NAME — a case silent about its own limits claims to cover everything",
    (await publish(PILAR, { ...base, statement: "" })).reason, "NO_STATEMENT");
  t("an ABSENT exclusion field is refused, and the refusal says why an EMPTY one is not",
    (await publish(PILAR, { ...base, excluded: undefined })).reason, "NO_EXCLUSION_FIELD");
  t("no declared subject position is refused (DEC-13)",
    (await publish(PILAR, { ...base, subjectPosition: "" })).reason, "NO_SUBJECT_POSITION");
  t("a position with no justification is refused: a declared position with no reasoning is the checkbox",
    (await publish(PILAR, { ...base, subjectJustification: "" })).reason, "NO_SUBJECT_JUSTIFICATION");
  /* REC-47 / DEC-46 (a): REFUSED BY NAME, which is the item's own acceptance
     clause. What is refused is publishing SILENTLY about the lens — not
     publishing under one. */
  t("a MISSING bias acknowledgement is refused BY NAME (REC-47 / DEC-46 (a))",
    (await publish(PILAR, { ...base, biasAcknowledgement: "" })).reason, "NO_BIAS_ACKNOWLEDGEMENT");
  t("and the refusal says the acknowledgement is a DISCLOSURE, not a bar — declaring a bias never blocks a case (DEC-20)",
    /never a bar/.test((await publish(PILAR, { ...base, biasAcknowledgement: "" })).detail ?? ""), true);
  t("an exclusion row naming NEITHER a target nor prose is refused (C-9)",
    (await publish(PILAR, { ...base, excluded: [{ reason: "because" }] })).reason, "BAD_EXCLUSION");
  t("an exclusion row with no reason is refused: what was left out and why are two statements",
    (await publish(PILAR, { ...base, excluded: [{ target: INFO_LEFTOUT, description: "x", reason: "" }] })).reason,
    "BAD_EXCLUSION");
  t("an OPEN inquiry cannot publish: a material set cannot be asserted over a question with no conclusion",
    (await publish(PILAR, { ...base, target: INQ_OPEN })).reason, "ILLEGAL_TRANSITION");
  t("and after every refusal the case is still exactly concluded", await stateOf(INQ_CASE), "concluded");
  t("a member without the publish capability is refused at the capability layer, not by the store",
    (await publish(VIEWONLY, base)).reason ?? rP(await POST(`op=publish&token=${VIEWONLY}`, base)).reason,
    "NOT_CAPABLE");

  const ok = await publish(PILAR, base);
  t("a concluded inquiry publishes at EDITION 1", [ok.ok, ok.edition, ok.to], [true, 1, "published"]);
  t("the author and the time are SERVER-stamped, never taken from the caller",
    [ok.completeness.author, /^\d{4}-\d{2}-\d{2}T/.test(ok.completeness.at)], ["pilar", true]);
  const md = await imageOf(INQ_CASE);
  t("the edition is IN the bytes that will be signed", /^edition: 1$/m.test(md), true);
  t("the completeness block is in the bytes, with the position and its justification",
    [/^ {2}statement: /m.test(md), /^ {2}subject_position: sought_and_answered$/m.test(md),
     /^ {2}subject_justification: /m.test(md)], [true, true, true]);
  t("the canonical heading carries the assertion for a person to read",
    md.includes("## What This Excludes"), true);
  /* REC-47: IN THE BYTES THE MEMBER SIGNS, beside the case scope and for the
     same reason — a stranger holding this one finding must be able to read the
     bias the case was produced under without contacting this instance. */
  t("the bias acknowledgement is IN the bytes that will be signed, verbatim as authored",
    md.includes(`bias_acknowledgement: "${BACK1}"`), true);
  t("the case PUBLISHES while carrying a declared bias — DISCLOSED, never disqualifying (DEC-20)",
    [ok.ok, ok.bias_acknowledgement], [true, BACK1]);
  /* CORRECTED 2026-08-04, REC-44 / DEC-44. This used to read `ok.strength` — a
     frozen pair at the top of the ANSWER — and that was right only while a case
     was assumed to be exactly one inquiry (D-187: nobody chose that shape). A
     case is a container over one or MORE findings, so the pair belongs to the
     FINDING and the act answers with findings[]. The old assertion is not
     loosened: the same two axis objects are demanded, and its absence from the
     case level is now asserted BESIDE it, because that absence is the rule. */
  t("BOTH frozen axis objects are stamped PER FINDING — never two letters, and never one",
    ok.findings[0].strength, [{ axis: "capture", state: "graded", grade: "B", weakest: INFO_CAP },
                              { axis: "connection", state: "graded", grade: "C", weakest: INFO_CONN }]);
  t("and the ACT reports NO case-level strength: one letter over a case is R2's forbidden composition at a new altitude",
    "strength" in ok, false);
  t("the case has an identity of its own, distinct from any bundle id, and it is in the bytes that will be signed",
    [/^CASE-\d{4}-\d{4}$/.test(ok.caseId), ok.caseId !== INQ_CASE,
     new RegExp(`^case_id: ${ok.caseId}$`, "m").test(md),
     new RegExp(`^case_findings: \\[${INQ_CASE}\\]$`, "m").test(md),
     /^case_scope: "/m.test(md)],
    [true, true, true, true, true]);
  t("a case with no authored scope is refused BY NAME: scope says what the case is ABOUT, completeness what it left OUT",
    (await publish(PILAR, { ...base, target: INQ_THIN, scope: "" })).reason, "NO_SCOPE");
  t("R4's division disclosure is RESERVED in the shape now, so it does not change under readers later",
    [/^division_parent: null$/m.test(md), /^division_siblings: \[\]$/m.test(md)], [true, true]);
  t("the published document AUDITS CLEAN against the catalog",
    await errorsOf(INQ_CASE, md, undefined, await earnedFor(INQ_CASE)), []);
  /* REC-47: THE ENTRY REQUIREMENT AT THE GATE, not only at the act. The store
     refused a missing acknowledgement above; the CATALOG must refuse it too,
     because a one-sided check is a check the other side has to catch (REC-13's
     finding, REC-14's precedent) — and hand-written bytes reaching op=promote
     are the route that skips the act entirely. */
  t("a published document with NO bias acknowledgement is refused BY THE GATE, naming C-2.8",
    (await errorsOf(INQ_CASE, md.replace(/^bias_acknowledgement: .*$/m, 'bias_acknowledgement: ""'),
                    undefined, await earnedFor(INQ_CASE)))
      .filter((e) => e.startsWith("C-2.8") && e.includes("bias_acknowledgement")).length, 1);
  t("op=affordances stops publishing `publish` once it is published, and the store agrees",
    [actIds(await affordances(INQ_CASE)).includes("publish"),
     (await publish(PILAR, base)).reason], [false, "ILLEGAL_TRANSITION"]);
}

/* ============================================ 2. DEC-13: what the gate does NOT check */
console.log("\n--- 2. DEC-13: the gate is the DECLARATION — never contact, never a favourable answer ---");
{
  const notSought = await publish(PILAR, { target: INQ_THIN,
    statement: "This case covers the signature question only, on the documents in hand.",
    excluded: [],
    subjectPosition: "not_sought",
    subjectJustification: "We did not give notice: the City has treated this group as hostile and notice "
                        + "here would let the record be revised before it is captured. We say so rather than "
                        + "leave it unsaid.",
    /* CORRECTED 2026-08-05, REC-47: this act now needs an acknowledgement to
       reach its own subject at all. It is worth writing a REAL one here rather
       than filler, because this block's whole point is that the plane carries
       what a group declares and never weighs it — and a group operating under
       an adversarial posture toward its subject has exactly the kind of
       standing position DEC-20 says a reader is entitled to be told about and
       to discount for themselves. */
    biasAcknowledgement: "This group's declared position is that this City's records practice is obstructive, "
                       + "and that position is why the signature question was pursued at all." });
  t("a case that DELIBERATELY gave no notice publishes exactly as one that sought comment",
    [notSought.ok, notSought.edition, notSought.completeness.subject_position], [true, 1, "not_sought"]);
  t("an EMPTY exclusion list is legal and is a claim in its own right",
    notSought.completeness.excluded, 0);
  const ratThin = await ratify(INQ_THIN);
  t("and it ratifies like any other case: nothing anywhere weighs the position it declared",
    [ratThin.ok, ratThin.edition], [true, 1]);
  t("the three positions are PUBLISHED as a vocabulary, so no ceremony surface keeps a copy",
    (await GET("op=affordances&token=mem-rec14")).result.vocabularies.subject_positions, SUBJECT_POSITIONS);
  /* STRUCTURAL, and it is the load-bearing half: a behavioural check can only
     show that ONE position was accepted. Nothing in the plane may branch on
     WHICH position was declared — that is what "never that contact happened"
     means as a property of the code rather than as an intention. */
  const srcs = ["../src/store.mjs", "../src/index.mjs", "../checks/bio-checks.mjs", "../src/affordances.mjs"]
    .map((f) => readFileSync(fileURLToPath(new URL(f, import.meta.url)), "utf8")).join("\n");
  t("NOTHING in the plane compares a declared position against a value: the position is carried, never consulted",
    (srcs.match(/subject_position\s*[=!]==?\s*['"]/g) || []).concat(
      srcs.match(/['"](sought_and_answered|sought_no_answer|not_sought)['"]\s*[=!]==/g) || []), []);
}

/* ================================================== 3. ratification, edition 1 */
console.log("\n--- 3. edition 1 is RATIFIED: its own signature, and DEC-34's container manifest ---");
const rat1 = await ratify(INQ_CASE);
const sha1 = await shaOf(INQ_CASE);
{
  t("the case ratifies at edition 1", [rat1.ok, rat1.edition], [true, 1]);
  t("the container carries a signed hash MANIFEST, answerable by its own hash (DEC-34)",
    [/^[0-9a-f]{64}$/.test(rat1.container.manifest_sha), rat1.container.parts >= 1], [true, true]);
  const man = rP(await GET(`op=verify&sha256=${rat1.container.manifest_sha}`));
  t("and that manifest hash verifies through the doorbell like any other part",
    [man.published, man.matches[0].kind], [true, "manifest"]);
  const eds = await editionsOf(INQ_CASE);
  t("the published projection holds edition 1 with its attestor, gate version and armored signature",
    [eds.editions.length, eds.editions[0].edition, eds.editions[0].attestor_member,
     eds.editions[0].sig_armored.startsWith("-----BEGIN SSH SIGNATURE-----")],
    [1, 1, "pilar", true]);
  t("the frozen PAIR is in the projection beside the signature, as two axis objects",
    eds.editions[0].strength.map((a) => [a.axis, a.state, a.grade]),
    [["capture", "graded", "B"], ["connection", "graded", "C"]]);
  t("the public index names the case by title, so a public listing is not N+1",
    (rP(await GET("op=publishedlist&token=mem-rec14")).bundles || [])
      .filter((b) => b.bundle_id === INQ_CASE).map((b) => [b.edition, typeof b.title]),
    [[1, "string"]]);
}

/* ======================================================== 4. DEC-17, the bar */
console.log("\n--- 4. DEC-17: the declared bar, stamped beside the derived pair — and absent SAYS absent ---");
{
  const eds = await editionsOf(INQ_CASE);
  t("with nothing declared, edition 1 states the bar ABSENT rather than blank — an absent bar is not zero",
    [eds.editions[0].required.declared, eds.editions[0].required.source,
     eds.editions[0].required.detail.includes("not a bar of zero")], [false, "none", true]);
  t("a machine credential cannot declare the group's standard",
    (await strengthbar("mem-rec14", { capture: "B", connection: "B" })).reason, "MACHINE_CANNOT_DECLARE");
  t("the bar is a PAIR: a single grade is refused as a shape, because a scalar re-collapses the two axes",
    (await strengthbar(NADIA, { capture: "Z", connection: "B" })).reason, "BAD_GRADE");
  const set = await strengthbar(NADIA, { capture: "B", connection: "C" });
  t("the GROUP declares the default, and the declaration carries its author and its date",
    [set.ok, set.capture, set.connection, set.author], [true, "B", "C", "nadia"]);
  t("an inquiry in no project takes the group default", (await barOf(INQ_CASE)).bar.source, "group");
  /* DEC-17: a PROJECT may override the group default, and it does so in its own
     bundle.md — authored, dated, promoted through the gate, in append-only
     history. You can lower your own bar; you cannot do it quietly. */
  await mustPromote(PROJ, projectMd(PROJ, { refs: [INQ_CASE],
    bar: { capture: "B", connection: "B", author: "nadia", at: "2026-07-03T00:00:00Z" } }),
    "project", "investigating", NADIA);
  const pbar = await barOf(INQ_CASE);
  t("a project citing the inquiry OVERRIDES the group default, and names the project that set it",
    [pbar.bar.source, pbar.bar.capture, pbar.bar.connection, pbar.bar.projects], ["project", "B", "B", [PROJ]]);
}

/* ======================================== 5. DEC-12: a second edition, and both answer */
console.log("\n--- 5. DEC-12: reopened, concluded again, published at edition 2 — and edition 1 still answers ---");
{
  t("the catalog makes published -> open legal and published -> dismissed illegal: reopening is not unpublishing",
    [STATES.inquiry.edges.published, STATES.inquiry.legal.includes("published")],
    [["open", "surfaced"], true]);
  /* The reopen itself rides op=promote, the one write path: REC-31 builds the
     op=reopen act on this edge concurrently, and it takes its legality from the
     catalog's own edge table — this suite holds the EDGE and the consequence,
     which is that publication survives the move. */
  t("op=affordances publishes REOPEN on a published case — the one verb, from the catalog's own edge table",
    actIds(await affordances(INQ_CASE)).includes("reopen"), true);
  const rp = await reopen(INQ_CASE, "the FY2023 comparison memo arrived and the finding has to be re-worked");
  t("the case reopens to open THROUGH op=reopen, with an authored reason",
    [rp.ok, rp.to, await stateOf(INQ_CASE)], [true, "open", "open"]);
  t("REOPENING DOES NOT UNPUBLISH: edition 1's ratified sha still verifies through the doorbell",
    rP(await GET(`op=verify&sha256=${sha1}`)).published, true);
  t("and edition 1 is still in the published projection, with its own signature",
    (await editionsOf(INQ_CASE)).editions.map((e) => e.edition), [1]);

  await conclude(PILAR, { target: INQ_CASE, conclusion: "The transfer rests on a memo nobody adopted, and the "
    + "FY2023 comparison memo has now arrived.", falsifier: FALS });
  const STMT2 = "This case covers the FY2024 transfer and, as of edition 2, the FY2023 comparison memo.";
  const JUST2 = "We put the revised claims to the City Administrator again on 2026-07-05 and print the reply.";
  const EX2 = [{ description: "any 2019 council minutes", reason: "still not requested; outside the period" }];
  /* CORRECTED 2026-08-05, REC-47: edition 2 authors its OWN acknowledgement.
     Not because the lens changed — it did not, and it says so — but because
     what the lens MEANS for this edition's material is a fresh claim. This is
     the sentence C-21.1's new arm exists to make a member write. */
  const BACK2 = "The same declared position on public adoption is in force, unchanged; edition 2 applies it to "
    + "the FY2023 comparison memo, which arrived after edition 1 closed.";
  const e2 = await publish(PILAR, { target: INQ_CASE, statement: STMT2, excluded: EX2,
    subjectPosition: "sought_and_answered", subjectJustification: JUST2,
    biasAcknowledgement: BACK2 });
  t("the second publication is EDITION 2, and the edition is server-stamped from the published record",
    [e2.ok, e2.edition], [true, 2]);
  /* CORRECTED 2026-08-04, REC-44 / DEC-44: the declared bar is a fact about the
     FINDING (DEC-17 makes it a property of the project doing the work, and the
     work is the finding), so it is read from findings[] rather than from the top
     of the answer. Values unchanged. */
  t("edition 2 carries the PROJECT's declared bar, stamped beside the derived pair",
    [e2.findings[0].required.source, e2.findings[0].required.capture, e2.findings[0].required.connection],
    ["project", "B", "B"]);
  const rat2 = await ratify(INQ_CASE);
  t("edition 2 ratifies", [rat2.ok, rat2.edition], [true, 2]);
  const eds = await editionsOf(INQ_CASE);
  /* Read defensively ON PURPOSE: the negative control for this block puts the
     UPSERT back, and the failure it produces is that edition 1's ROW IS GONE.
     A suite that threw on the missing row would report a crash where the
     finding is "the earlier attestation was destroyed", which is D-144 itself
     and has to be legible as that. */
  const [ed1, ed2] = [eds.editions[0] ?? {}, eds.editions[1] ?? {}];
  t("BOTH editions are readable, each with its OWN sha, time and armored signature",
    [eds.editions.length, ed1.edition, ed2.edition,
     ed1.bundle_sha !== ed2.bundle_sha, ed1.sig_armored !== ed2.sig_armored], [2, 1, 2, true, true]);
  t("edition 1 KEEPS its own signature, attestor and time after edition 2 lands (D-144 closed as a feature)",
    [ed1.bundle_sha, ed1.attestor_member, typeof ed1.sig_armored], [sha1, "pilar", "string"]);
  t("each edition has its own container manifest, so a copy of either can be checked",
    Boolean(ed1.manifest_sha) && ed1.manifest_sha !== ed2.manifest_sha, true);
  t("edition 1's completeness statement is still exactly what was signed, not edition 2's",
    ed1.completeness?.statement, STMT1);
}

/* ============================================ 6. C-21.1 and the edition refusals */
console.log("\n--- 6. C-21.1: a completeness claim carried forward unchanged is a checkbox ---");
{
  /* Reopen, conclude, and try to publish edition 3 with edition 2's assertion
     verbatim. Every field is tried separately so the refusal names the one that
     was copied rather than merely reporting that something was. */
  await reopen(INQ_CASE, "a correction to the exclusion list is needed for the next edition");
  await conclude(PILAR, { target: INQ_CASE, conclusion: "The transfer rests on an unadopted memo; the "
    + "comparison memo confirms the pattern.", falsifier: FALS });
  const STMT2 = "This case covers the FY2024 transfer and, as of edition 2, the FY2023 comparison memo.";
  const JUST2 = "We put the revised claims to the City Administrator again on 2026-07-05 and print the reply.";
  const EX2 = [{ description: "any 2019 council minutes", reason: "still not requested; outside the period" }];
  /* REC-47: edition 2's acknowledgement, repeated here verbatim so the
     carried-forward arm below can offer it back. It must match block 5's BACK2
     byte for byte or the arm would be testing nothing — the failure mode a
     carried-forward test has when the "carried" value is not actually the
     previous edition's. */
  const BACK2 = "The same declared position on public adoption is in force, unchanged; edition 2 applies it to "
    + "the FY2023 comparison memo, which arrived after edition 1 closed.";
  const FRESH_S = "This case covers the FY2024 transfer, the FY2023 comparison memo and the clerk's index.";
  const FRESH_J = "We put the corrected claims to the City Administrator on 2026-07-07 and print the reply.";
  const FRESH_B = "The declared position on public adoption still stands and is unchanged; for edition 3 it "
    + "bears on the clerk's index, which is the first source here the group did not itself request.";
  const FRESH_X = [{ target: INFO_LEFTOUT, description: "the FY2023 comparison memo",
                     reason: "it arrived after edition 2 and is named here rather than folded in unexamined" },
                   { description: "any 2019 council minutes", reason: "outside the period, restated for edition 3" }];
  /* CORRECTED 2026-08-05, REC-47: each of the three arms below gains
     `biasAcknowledgement: FRESH_B`. Without it every one of them would be
     refused NO_BIAS_ACKNOWLEDGEMENT and would report a PASS-shaped failure —
     the refusal name would be wrong but the test would still be asserting
     "publishing was refused", which is the checkbox failure mode one level up
     from the one this suite exists to catch. Each arm again isolates exactly
     ONE carried-forward field. */
  t("a second edition carrying edition 2's STATEMENT verbatim is REFUSED, naming the field",
    (await publish(PILAR, { target: INQ_CASE, statement: STMT2, excluded: FRESH_X,
      subjectPosition: "sought_and_answered", subjectJustification: FRESH_J,
      biasAcknowledgement: FRESH_B }))
      .reason, "COMPLETENESS_CARRIED_FORWARD");
  t("carrying the JUSTIFICATION forward verbatim is refused too — the position may repeat, its reasoning may not",
    (await publish(PILAR, { target: INQ_CASE, statement: FRESH_S, excluded: FRESH_X,
      subjectPosition: "sought_and_answered", subjectJustification: JUST2,
      biasAcknowledgement: FRESH_B }))
      .reason, "COMPLETENESS_CARRIED_FORWARD");
  t("and carrying the EXCLUSION LIST forward byte-identical is refused",
    (await publish(PILAR, { target: INQ_CASE, statement: FRESH_S, excluded: EX2,
      subjectPosition: "sought_and_answered", subjectJustification: FRESH_J,
      biasAcknowledgement: FRESH_B }))
      .reason, "COMPLETENESS_CARRIED_FORWARD");
  /* ============ REC-47 / DEC-46 (a): THE ITEM'S OWN ARM ============
     A CARRIED-FORWARD BIAS ACKNOWLEDGEMENT MUST FAIL, under its OWN refusal
     name. Every other field here is freshly authored, so the ONLY thing wrong
     with this republication is that the group reprinted last edition's sentence
     about its own lens — which is evidence nobody looked.

     It gets its own reason name rather than sharing COMPLETENESS_CARRIED_FORWARD
     because they are two different mistakes: one reprints what the case left
     out, the other reprints the group's account of the bias it was made under,
     and a caller told only "carried forward" would not know which. The CHECK is
     C-21.1 in both cases, which is what `check` asserts. */
  const carried = await publish(PILAR, { target: INQ_CASE, statement: FRESH_S, excluded: FRESH_X,
    subjectPosition: "sought_and_answered", subjectJustification: FRESH_J,
    biasAcknowledgement: BACK2 });
  t("THE ITEM: a republication reprinting edition 2's BIAS ACKNOWLEDGEMENT byte-identical is REFUSED",
    [carried.ok, carried.reason, carried.field, carried.check, carried.prior],
    [false, "BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD", "bias_acknowledgement", "C-21.1", 2]);
  t("and the refusal explains what must be fresh — the lens may be unchanged, the account of it may not",
    /never carried forward/.test(carried.detail ?? "") && /THIS edition/.test(carried.detail ?? ""), true);
  t("the case did NOT move on the refused republication: nothing is half-published",
    await stateOf(INQ_CASE), "concluded");
  /* AND THE COMPLEMENT, which is what stops this arm being satisfied by a gate
     that simply refuses everything: an acknowledgement that SAYS the lens is
     unchanged, in this edition's own words, PUBLISHES. DEC-20 — declaring a
     standing bias never blocks a case, and a gate that made it hard to publish
     under an unchanged lens would be pressuring a member into inventing a
     change, which is the bug REC-44 refused to build for the scope statement. */
  /* The STAMPS are deliberately not compared: `at` is the server's clock and
     always differs, so checking it is an equality that costs nothing to
     produce, and `author` may legitimately be the same member twice. */
  const ok3 = await publish(PILAR, { target: INQ_CASE, statement: FRESH_S, excluded: FRESH_X,
    subjectPosition: "sought_and_answered", subjectJustification: FRESH_J,
    biasAcknowledgement: FRESH_B });
  t("an acknowledgement that STATES the lens is unchanged, in this edition's own words, publishes",
    [ok3.ok, ok3.bias_acknowledgement], [true, FRESH_B]);
  t("the same POSITION and the same AUTHOR are legal on a fresh assertion — the stamps are not the claim",
    [ok3.ok, ok3.edition, ok3.completeness?.subject_position, ok3.completeness?.author],
    [true, 3, "sought_and_answered", "pilar"]);
  /* THE GATE runs C-21.1 again at ratification: the store's refusal above stops
     a member signing a document the gate would reject, and the gate is what
     catches anything that reached the bytes another way. */
  /* CORRECTED 2026-08-04, REC-44 / DEC-44: the injected registry is keyed on the
     CASE this document names, not on the document's own id. The assertion is not
     loosened — C-21.1 must still fire exactly once on the stale statement and not
     at all on the fresh one — but it is now asked at the altitude the claim lives
     at, and a registry keyed on the finding would silently stop firing. */
  /* CORRECTED 2026-08-05, REC-47: the injected registry row now carries
     `bias_acknowledgement` BESIDE `completeness` and not inside it. That
     placement is the assertion — the two are different claims (DEC-46, the lens
     versus the limits), and a registry that nested one in the other would let
     the catalog arm pass while the store and the gate disagreed about where the
     value lives. */
  const caseReg = { [ok3.caseId]: { latest: 2, editions: { 2: { edition: 2,
    bias_acknowledgement: BACK2,
    completeness: { statement: STMT2, subject_justification: JUST2,
      excluded: JSON.stringify(EX2.map((r) => [null, r.description, r.reason])) } } } } };
  const stale = (await imageOf(INQ_CASE)).replace(FRESH_S, STMT2);
  t("the CATALOG names C-21.1 on a published edition whose statement is the previous edition's",
    (await errorsOf(INQ_CASE, stale, {}, undefined, caseReg)).filter((e) => e.startsWith("C-21.1")).length, 1);
  /* REC-47: THE GATE'S HALF OF THE ITEM. The store refused this above; the
     catalog must refuse it too, because a one-sided check is a check the other
     side has to catch (REC-13's finding, REC-14's precedent). These are the
     bytes a member would be asked to sign. */
  const staleBias = (await imageOf(INQ_CASE)).replace(FRESH_B, BACK2);
  t("the CATALOG names C-21.1 on an edition whose BIAS ACKNOWLEDGEMENT is the previous edition's",
    (await errorsOf(INQ_CASE, staleBias, {}, undefined, caseReg)).filter((e) => e.startsWith("C-21.1")).length, 1);
  t("and the C-21.1 finding NAMES the field, so the member knows which sentence to rewrite",
    (await errorsOf(INQ_CASE, staleBias, {}, undefined, caseReg))
      .some((e) => e.startsWith("C-21.1") && e.includes("bias_acknowledgement")), true);
  t("and the freshly authored edition draws no C-21.1 finding at all",
    (await errorsOf(INQ_CASE, await imageOf(INQ_CASE), {}, undefined, caseReg)).filter((e) => e.startsWith("C-21.1")), []);
  await ratify(INQ_CASE);
}

console.log("\n--- 6b. a republish that does not increment the edition is refused at the commit ---");
{
  const md = await imageOf(INQ_CASE);
  /* Hand-written bytes claiming an edition that is already published: the one
     route left once op=publish stamps the number itself, and exactly the shape
     that would leave a reader who cited "edition 2" unable to say which
     document they read. */
  const backdated = md.replace(/^edition: 3$/m, "edition: 2");
  await promote(INQ_CASE, backdated, "inquiry", "published", PILAR, await shaOf(INQ_CASE));
  const r = await ratify(INQ_CASE);
  t("ratifying different bytes under an edition already published is refused BY NAME",
    [r.ok, r.reason, r.highest], [false, "EDITION_EXISTS", undefined]);
  const backwards = md.replace(/^edition: 3$/m, "edition: 1");
  await promote(INQ_CASE, backwards, "inquiry", "published", PILAR, await shaOf(INQ_CASE));
  const r2 = await ratify(INQ_CASE);
  t("and so is a republish that moves the edition BACKWARDS",
    [r2.ok, r2.reason], [false, "EDITION_EXISTS"]);
  t("after both refusals the published projection is untouched: three editions, none overwritten",
    (await editionsOf(INQ_CASE)).editions.map((e) => e.edition), [1, 2, 3]);
}

/* ================================================ 7. C-21.2, per axis, four probes */
console.log("\n--- 7. C-21.2: a case built on a case cannot be stronger than the case beneath it, PER AXIS ---");
{
  const legOn = (extra) => [{ target: INFO_CAP }, { target: INQ_CASE, ...extra }];
  /* A FRESH bundle per probe. Sharing one id would make the second probe's
     answer depend on whether the first one landed, and a refusal for the wrong
     reason reads exactly like a refusal for the right one. */
  let probeN = 0;
  const tryLegs = async (legs, target = INQ_CASE) => {
    const id = `${INQ_USER}-${++probeN}`;
    return await promote(id, inquiryMd(id, { question: "Does the pattern hold city-wide?",
      refs: [INFO_CAP, target], legs }), "inquiry", "open");
  };
  const findingsOf = (r) => (r.findings || []).map((f) => f.check).sort();

  /* The frozen pair beneath is (capture B, connection C). */
  const capA = await tryLegs(legOn({ grade: "A", axis: "capture", source: "inherited", edition: 1 }));
  t("PROBE 1 — inheriting CAPTURE A from a case whose frozen capture is B is REFUSED",
    [capA.ok, capA.reason, findingsOf(capA)], [false, "BASIS_REFUSED", ["C-21.2"]]);
  const connB = await tryLegs(legOn({ grade: "B", axis: "connection", source: "inherited", edition: 1 }));
  t("PROBE 2 — inheriting CONNECTION B from a case whose frozen connection is C is REFUSED, independently",
    [connB.ok, connB.reason, findingsOf(connB)], [false, "BASIS_REFUSED", ["C-21.2"]]);
  const capB = await tryLegs(legOn({ grade: "B", axis: "capture", source: "inherited", edition: 1 }));
  t("PROBE 3 — inheriting CAPTURE B, the frozen capture grade, is ACCEPTED", capB.ok, true);
  const connC = await tryLegs(legOn({ grade: "C", axis: "connection", source: "inherited", edition: 1 }));
  t("PROBE 4 — inheriting CONNECTION C, the frozen connection grade, is ACCEPTED", connC.ok, true);
  /* Probes 3 and 4 are why this suite has four and not two: a comparison that
     composed the pair to its WEAKEST letter (C) would refuse probe 3, and one
     that composed to the STRONGEST (B) would accept probe 2. Only a genuinely
     per-axis comparison passes all four. */

  const noEd = await tryLegs(legOn({ grade: "B", axis: "capture", source: "inherited" }));
  t("an inherited leg that does not NAME ITS EDITION is refused: an unnamed edition fixes nothing to compare",
    [noEd.ok, findingsOf(noEd)], [false, ["C-21.2"]]);
  const ghostEd = await tryLegs(legOn({ grade: "B", axis: "capture", source: "inherited", edition: 9 }));
  t("naming an edition that was never published is refused", [ghostEd.ok, findingsOf(ghostEd)], [false, ["C-21.2"]]);
  const authored = await tryLegs(legOn({ grade: "B", axis: "capture", source: "resolution", edition: 1 }));
  /* TWO findings, and that is the two items composing rather than a defect:
     C-21.2 refuses it because a leg on a published case inherits or states
     nothing, and REC-31's C-2.8 arm refuses it because an AUTHORED capture
     grade on an inquiry leg has no referent (DEC-21). Only `inherited` carries
     a capture grade to an inquiry, because only then does the grade belong to
     the documents beneath a signed edition. */
  t("a leg that AUTHORS its own grade on a published case is refused TWICE, by both items' gates",
    [authored.ok, findingsOf(authored)], [false, ["C-2.8", "C-21.2"]]);
  const ungraded = await tryLegs(legOn({}));
  t("an UNGRADED leg on a published case is legal — undetermined, stated (DEC-18's inert leg)", ungraded.ok, true);

  /* An axis with nothing established admits no grade at all, and UNRATED and
     UNDETERMINED say different things — which is why the frozen fact is an axis
     OBJECT and not a letter. */
  const thinEds = await editionsOf(INQ_THIN);
  t("the thin case froze both axes as UNRATED, not as a low grade",
    thinEds.editions.length ? thinEds.editions[0].strength.map((a) => [a.axis, a.state, a.grade])
      : "not ratified", [["capture", "unrated", null], ["connection", "unrated", null]]);
  const fromUnrated = await tryLegs(
    [{ target: INFO_CAP }, { target: INQ_THIN, grade: "C", axis: "capture", source: "inherited", edition: 1 }],
    INQ_THIN);
  t("inheriting ANY grade from an UNRATED axis is refused: nothing was established there to inherit",
    [fromUnrated.ok, findingsOf(fromUnrated)], [false, ["C-21.2"]]);
}

/* ========================================== 8. C-9: the exclusion is NAMEABLE */
console.log("\n--- 8. C-9: an exclusion names a document OR says it in prose, and the index answers ---");
{
  const hits = await excludedBy(INFO_LEFTOUT);
  t("'which cases excluded this document' is answered from the indexed projection",
    hits.cases.map((c) => [c.bundle_id, c.target_id ?? null]).length >= 0, true);
  const store = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
  /* Sliced to the method's OWN body -- from its signature to the next method --
     rather than to a landmark elsewhere in the file, which is the instrument
     defect basis.test.mjs had corrected out of it. */
  const from = store.indexOf("excludedBy(targetId");
  const method = store.slice(from, store.indexOf("\n  /* REC-14: the published projection", from));
  t("and it is ONE indexed lookup on target_id, never a scan of every completeness block",
    [/WHERE x\.target_id=\?/.test(method), (method.match(/FROM inquiry_exclusions/g) || []).length], [true, 1]);
  const rows = (await excludedBy(INFO_LEFTOUT)).cases;
  t("a row NAMING a document is found by its id, carrying the edition it was asserted at",
    rows.map((r) => [r.bundle_id, r.edition >= 1]), [[INQ_CASE, true]]);
  t("a prose-only row is NOT reachable by target and is not lost either: it lives in the case's own bytes",
    (await imageOf(INQ_CASE)).includes("2019 council minutes"), true);
}

/* ================================ 9. the RE-KEY, against a store that already has rows */
console.log("\n--- 9. an EXISTING store migrates: every ratified row survives as edition 1 ---");
{
  /* published_bundles is the ONE table in this item whose shape changed while
     it already holds rows a reader may be relying on. It is not derived and it
     may never be dropped and re-derived, which is what the two tables in
     #migrate's rebuild list are allowed to do — so this block drives the actual
     upgrade: a store is booted on the OLD schema, given a ratified row, and
     then reloaded on the new one. Nothing else in the battery exercises a
     schema migration, and an untested migration of the published projection is
     the one defect in this item that would be unrecoverable.

     NEGATIVE CONTROL for this block: remove the INSERT ... SELECT copy-forward
     in src/store.mjs #migrate (the block guarded on PRAGMA
     table_info(published_bundles_preeditions)) -> "the legacy row survives"
     reports 0 editions: every case the group had already published, with its
     signature and its attestor, silently gone at the next boot. Run 2026-08-04,
     measured exactly that; restored. */
  const OLD_PB = `CREATE TABLE IF NOT EXISTS published_bundles (
  bundle_id       TEXT PRIMARY KEY,
  bundle_sha      TEXT NOT NULL,
  ratified_at     TEXT NOT NULL,
  attestor_key    TEXT NOT NULL,
  attestor_member TEXT,
  gate_version    TEXT NOT NULL,
  sig_armored     TEXT NOT NULL
)`;
  const from = SCHEMA.indexOf("CREATE TABLE IF NOT EXISTS published_bundles");
  const OLD_SCHEMA = SCHEMA.slice(0, from) + OLD_PB + SCHEMA.slice(SCHEMA.indexOf(");", from) + 1);
  /* CORRECTED 2026-08-04, REC-44: read the STATEMENT rather than a window of
     characters after the name. The old proximity regex was a proxy that stopped
     being one when REC-44 added a published_cases comment further down the file
     that legitimately says both "published_bundles" and "edition" in one
     sentence. The claim is unchanged and is now checked directly: the fixture's
     own CREATE TABLE for published_bundles has no edition column. */
  const OLD_CREATE = OLD_SCHEMA.slice(OLD_SCHEMA.indexOf("CREATE TABLE IF NOT EXISTS published_bundles"));
  t("the fixture really is the OLD shape: no edition column in its published_bundles statement",
    /edition/.test(OLD_CREATE.slice(0, OLD_CREATE.indexOf(")"))), false);

  /* A subclass with ONE raw route, the strength-cycle-probe precedent: the row
     has to be written in the old column set, which the current committer
     cannot produce. */
  const PROBE = `
import { Store } from "./store.mjs";
export class ProbeStore extends Store {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/rawpublished") {
      this.sql.exec("INSERT INTO published_bundles (bundle_id,bundle_sha,ratified_at,attestor_key,attestor_member,gate_version,sig_armored) VALUES (?,?,?,?,?,?,?)",
        url.searchParams.get("id"), "legacysha", "2026-01-01T00:00:00Z", "LEGACYKEY", "bob",
        "plane-gate/0.9", "-----BEGIN SSH SIGNATURE-----legacy");
      return Response.json({ result: { ok: true } });
    }
    return super.fetch(req);
  }
}
export default { fetch(req, env) { return env.STORE.get(env.STORE.idFromName("bio")).fetch(req); } };
`;
  const opts = (schema) => ({
    modules: true, script: PROBE, modulesRoot: "/",
    scriptPath: fileURLToPath(new URL("../src/publish-migration-probe.mjs", import.meta.url)),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
    bindings: schema ? { SCHEMA: schema } : {},
  });
  const mfm = new Miniflare(opts(OLD_SCHEMA));
  const dial = async (path) => (await (await mfm.dispatchFetch("http://x" + path)).json()).result;
  const LEGACY = "INQ-2026-0001-legacy";
  await dial(`/rawpublished?id=${LEGACY}`);
  await mfm.setOptions(opts(null));            // same storage, the CURRENT schema
  const eds = await dial(`/publishededitions?id=${LEGACY}`);
  t("the legacy row SURVIVES the re-key, as edition 1, with its signature, attestor, time and gate version",
    [eds.editions.length, eds.editions[0]?.edition, eds.editions[0]?.bundle_sha,
     eds.editions[0]?.attestor_member, eds.editions[0]?.gate_version],
    [1, 1, "legacysha", "bob", "plane-gate/0.9"]);
  t("and the frozen columns are NULL rather than invented: nothing was ever signed for them",
    [eds.editions[0]?.completeness, eds.editions[0]?.strength, eds.editions[0]?.required],
    [null, null, null]);
  await mfm.dispose();
}

await mf.dispose();
console.log(`\npublish: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
