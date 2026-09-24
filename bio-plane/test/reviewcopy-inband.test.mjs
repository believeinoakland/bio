/* NEGATIVE CONTROL: DECLARED BEFORE ARMING and RUN by `test/reviewcopy-inband.control.mjs` (committed; `node
   test/reviewcopy-inband.control.mjs [arm]` from `bio-plane/`). Each arm alone; every restore verified by sha256
   AND content against a per-arm pristine copy inside this worktree.

   (0) BASELINE, nothing armed -> every arm green.

   (a) THE ROW'S CONTROL — CANONICALISE DIFFERENTLY IN ONE PLACE: the review copy's hash is taken over
   `JSON.stringify(served)` (no indent) by a second hasher at its own site, instead of `inbandQuartet`.
   Declared: MUST FAIL the review side of the AGREEMENT arm (block 3) and the ONE-FUNCTION arm (block 5);
   MUST NOT fail the container side of block 3, the floors arm (block 2) or the stability arm.

   (b) OVER-STRICTNESS — the floors read ONLY a `declared: true` boolean, so the frozen case document's bar
   (parsed from YAML) would not count as declared if its parser handed back the word. Declared: whatever it
   does, the review side must still pass; recorded as measured.

   (c) THE FLOORS SWAPPED — `floorsOf` returns connection as capture and capture as connection. Declared:
   MUST FAIL block 2's asymmetric-floors arm; block 4's field-for-field arm STAYS GREEN (both sides swap
   together, which is exactly why block 2 pins the grade to the project's declaration and not to the other
   side).

   RUN 2026-09-23 by the REC-148 worker (branch land/worker/REC-148), every restore sha256 MATCH, content
   IDENTICAL, size ok (index.mjs 733,370 bytes; inband.mjs 3,815 bytes):
     (0) baseline -> 22 pass, 0 fail.
     (a) -> 18 pass, 4 fail: the review-side agreement arm, the one-function arm naming the review copy's
         handler, AND both 6b arms (each re-hashes the served answer too) — two more than declared, same
         direction. Stability (6a), floors (2) and the whole container side stayed green, as declared.
     (b) -> 22 pass, 0 fail: GREEN. The frozen bar's `declared` reaches `floorsOf` as a boolean on this plane,
         so the string branch is defence in depth and not load-bearing — recorded, not smoothed.
     (c) -> 19 pass, 3 fail: the three floor arms of block 2, and block 4's field-for-field floors arm GREEN,
         exactly as declared: both sides swap together, which is why block 2 pins the grade to the
         project's own declaration.
   RE-RUN 2026-09-24 by c19-unionfix on the union c19-batch9, after the answer moved into `reviewAnswer` (index.mjs
   778,962 bytes, every restore sha256 MATCH, content IDENTICAL): arm (a)'s needle first matched ZERO times (m025's A4
   named it) and was re-anchored; ARMED, it gave 19/3 — block 5's one-function arm STAYED GREEN, because it sliced
   only the handler and the planted hasher now sits in `reviewAnswer`. Block 5 was CORRECTED to read the handler
   plus that function, and (a) then gave 18/4, the four named above, AS DECLARED. (0) 22/0, (b) 22/0, (c) 19/3
   unchanged. */

/* REC-148 / DEC-31's BOUND RULE — THE REVIEW COPY CARRIES ITS HASH, DATE, AUTHOR AND BOTH FLOORS IN-BAND.
 *
 * `BIO_Publication_v0_1.md` §6A.3 point 1: *"no surface offers to export, download or print a review copy to
 * a file until the plane's answer carries all four in-band — a SHA-256 over the canonical bytes of what it
 * answers, its date, its author, and the floors the case would be held to on both axes (the project's
 * `required_strength`), proved to be the same quantity the published container renders."*
 *
 * WHAT THIS SUITE PROVES, one block each:
 *   1. the quartet is on the answer, each field the named quantity (updated_at, updated_by, the bar);
 *   2. the floors are the project's DECLARED bar, pinned to the grade the fixture authored — asymmetric, so
 *      a swapped axis cannot pass;
 *   3. AGREEMENT: each side's hash is re-computed HERE, with node:crypto and sharing no code with `src/`,
 *      over the bytes that side serves — the review copy's answer minus `inband`, and the container's
 *      MANIFEST.json fetched by its own hash;
 *   4. for ONE case edition — the draft, then the same arguments published and signed — the review copy's
 *      quartet and the container's agree FIELD FOR FIELD: the same keys, the same floors, the same `format`;
 *   5. ONE FUNCTION: both sites call `inbandQuartet`, and `src/` holds no second hasher over a manifest or a
 *      review copy (the liar: a second hasher over a differently-canonicalised body agrees on this fixture
 *      and drifts);
 *   6. the hash MOVES when one byte of the answer does (a one-character edit; a comment), and STAYS when
 *      nothing moved — a random hash would pass "moves" alone.
 */

import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { withSurfacingRun } from "./surfacing-run.mjs";
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";
import { ratifyCase } from "./caseceremony.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- reviewcopy-inband ---");
  console.log("reviewcopy-inband: SKIPPED — ssh-keygen not on PATH; the container side needs a REAL case signature");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SRC = (f) => readFileSync(fileURLToPath(new URL(`../src/${f}`, import.meta.url)), "utf8");
/* CODE ONLY: block comments removed, and (for `stringsToo`) double-quoted literals — so a comment or a sentence
   that NAMES a serialisation is not counted as one. */
const codeOf = (s, stringsToo = false) => {
  const c = s.replace(/\/\*[\s\S]*?\*\//g, "");
  return stringsToo ? c.replace(/"(?:[^"\\\n]|\\.)*"/g, '""') : c;
};
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r148", MEMBER_TOKEN: "mem-r148", PROBE_TOKEN: "prb-r148", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const finish = async (aborted = false) => {
  console.log(`\nreviewcopy-inband: ${pass} pass, ${fail} fail${aborted ? "  [FIXTURE ABORTED]" : ""}`);
  await mf.dispose();
  process.exit(fail || aborted ? 1 : 0);
};
const bail = async (what, r) => {
  console.log(`  FAIL  (fixture) ${what}: ${JSON.stringify(r).slice(0, 600)}`);
  fail++;
  await finish(true);
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const rawGet = async (q) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`);
  return { status: r.status, bytes: Buffer.from(await r.arrayBuffer()) };
};
/* THE REVIEW SIDE'S INDEPENDENT RE-HASH: parse the served body, remove `inband`, serialise as the quartet
   says it hashed (JSON, one-space indent, UTF-8), and digest with node:crypto. */
const rehashServed = (bytes) => {
  const o = JSON.parse(bytes.toString("utf8"));
  const { inband: _drop, ...rest } = o;
  return sha(Buffer.from(JSON.stringify(rest, null, 1), "utf8"));
};

/* ---- roster, keys, project with an ASYMMETRIC declared bar ---- */
const dir = mkdtempSync(join(tmpdir(), "rc-inband-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "iris", "-f", join(dir, "iris"), "-q"]);
const irisKey = readFileSync(join(dir, "iris.pub"), "utf8").trim().split(/\s+/)[1];
const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-r148", { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en?.ok) await bail(`enroll ${memberId}`, en);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg?.token) await bail(`login ${memberId}`, lg);
  return lg.token;
};
await enrol("nadia", "nadia-passphrase-148", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-148", "admin", ["contribute", "publish"]);   /* ADMINS_FIRST: two before a member */
const IRIS = await enrol("iris", "iris-passphrase-148", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-r148", { keyB64: irisKey, memberId: "iris", comment: "iris laptop" }));

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
/* THE PUBLISHING PROJECT declares BOTH floors, and DIFFERENT ones — capture C, connection D — which the lead
   clears (its legs are caseflip's: an earned capture B, a hunch connection C), so a swap of the axes is
   visible on the published side too. A SECOND project declares CONNECTION ONLY, so block 2 sees two
   floors that differ and a swap of the axes is visible; it is drafted and never published, because a
   one-axis bar cannot be SIGNED today (C-41.12 refuses the frozen `capture: null` — reported by REC-148). */
const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r148", owner: "iris",
  name: "PROJ-2026-1480-inband", created: NOW, updated: LATER,
  bar: { capture: "C", connection: "D", author: "iris", at: NOW } });
const PROJ_ASYM = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r148", owner: "iris",
  name: "PROJ-2026-1481-oneaxis", created: NOW, updated: LATER,
  bar: { capture: "null", connection: "D", author: "iris", at: NOW } });

let snapSeq = 0;
const promote = async (id, text, objectType, state, register = []) => rP(await POST("op=promote&token=adm-r148", {
  bundleId: id, base: null,
  snapKey: `20260923T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: objectType, group: "believe-in-oakland", title: `t ${id}`,
          current_state: state, created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register,
}));
const INFO = "INFO-2026-1480-memo", LEAD = "INQ-2026-1480-lead";
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
const inquiryMd = ["---", `id: ${LEAD}`, "object_type: inquiry", "schema: inquiry@1",
  'title: "Was the transfer authorised?"', "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", `  - target: ${INFO}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  /* caseflip's BOTH_AXES: a declared bar on both axes needs a leg on both (`unrated` meets no bar). */
  "basis:", `  - target: ${INFO}`, "    role: supports", "    grade: B",
  "    grade_axis: capture", "    grade_source: capture",
  `  - target: ${INFO}`, "    role: supports", "    grade: C",
  "    grade_axis: connection", "    grade_source: hunch", "    author: iris", `    date: ${NOW.slice(0, 10)}`,
  "---", "", "## Question", "", "Was the transfer authorised?", "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
/* A REGISTERED CAPTURE, because the lead states an EARNED capture grade over it (C-2.8). */
if ((await promote(INFO, infoMd, "information", "collected",
  [{ path: "snapshots/source.bin", sha256: sha("rc148-INFO-bytes"), bytes: 512, encoding: "binary" }]))?.ok === false)
  await bail("promote info", {});
{
  const r = await promote(LEAD, withAdoptableReading(inquiryMd), "inquiry", "open");
  if (r?.ok === false) await bail("promote lead", r);
  const c = rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(LEAD)}`
    + `&conclusion=${encodeURIComponent("The transfer was authorised by the memo.")}`
    + `&falsifier=${encodeURIComponent("An adopted resolution would overturn it.")}` + adoptedVersionParam()));
  if (!c?.ok) await bail("conclude lead", c);
}
const ARGS = {
  project: PROJ, targets: [LEAD], roles: allLoadBearing({ targets: [LEAD] }),
  scope: "Whether the FY2024 transfer was authorised.",
  statement: "This case covers the FY2024 transfer only.",
  excluded: [{ target: null, description: "the FY2023 memo", reason: "a records request is outstanding" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: "We put the claims to the City Administrator.",
  biasAcknowledgement: "This group holds that transfers should be adopted in public.",
};

console.log("\n--- reviewcopy-inband ---");

/* ======================================================================= 1. the quartet is there */
console.log("\n--- 1. the review copy carries hash, date, author and both floors in-band ---");
const dr = rP(await POST(`op=casedraft&token=${IRIS}`, ARGS));
if (!dr?.ok) await bail("casedraft", dr);
const DRAFT = dr.draftId;
const read1 = await rawGet(`op=reviewcopy&draft=${DRAFT}&token=${IRIS}`);
const rc1 = JSON.parse(read1.bytes.toString("utf8"));
const q1 = rc1.inband || {};
t("the review copy answers, and carries an `inband` quartet in the format the container's carries",
  [read1.status, rc1.ok, rc1.kind, q1.format], [200, true, "review-copy", "bio-inband/1"]);
t("HASH: a SHA-256, named as such, over a stated subject with its byte count",
  [q1.hash?.algorithm, /^[0-9a-f]{64}$/.test(q1.hash?.sha256 ?? ""), typeof q1.hash?.over,
   Number.isInteger(q1.hash?.bytes) && q1.hash.bytes > 100],
  ["sha256", true, "string", true]);
t("DATE and AUTHOR are the draft's own `updated_at` and `updated_by` — the quantities §6A.3 names — never "
+ "the moment of the read or the reader",
  [q1.date, q1.author, q1.date === rc1.updated_at, q1.author === rc1.updated_by],
  [rc1.updated_at, "iris", true, true]);
t("the store's `required_strength` is read INTO the floors and is not served a second time beside them",
  "required_strength" in rc1, false);

/* ======================================================================= 2. the floors are the bar */
console.log("\n--- 2. the floors are the project's DECLARED bar, axis by axis ---");
t("FLOORS: capture C and connection D, exactly as the publishing project declared them — different, so a "
+ "swapped axis fails here — and `declared` true",
  [q1.floors?.capture, q1.floors?.connection, q1.floors?.declared], ["C", "D", true]);
{
  const da = rP(await POST(`op=casedraft&token=${IRIS}`, { ...ARGS, project: PROJ_ASYM }));
  if (!da?.ok) await bail("casedraft (one-axis project)", da);
  const qa = JSON.parse((await rawGet(`op=reviewcopy&draft=${da.draftId}&token=${IRIS}`)).bytes.toString("utf8")).inband || {};
  t("A PROJECT DECLARING CONNECTION ONLY: capture reads UNSET and connection D, axis by axis — asymmetric, so "
  + "a swapped axis fails here — and `declared` is still true",
    [qa.floors?.capture, qa.floors?.connection, qa.floors?.declared], [null, "D", true]);
  t("and the unset axis is an ABSENT floor (null), never a floor of the weakest grade",
    qa.floors?.capture === null, true);
}

/* ======================================================================= 6 (first half). stability */
console.log("\n--- 6a. nothing moved: the hash does not move ---");
const read1b = await rawGet(`op=reviewcopy&draft=${DRAFT}&token=${IRIS}`);
t("two reads with nothing changed between them answer the SAME hash — a hash that moves on every read would "
+ "pass the one-byte arm below and mean nothing",
  JSON.parse(read1b.bytes.toString("utf8")).inband?.hash?.sha256, q1.hash?.sha256);

/* ======================================================================= 3a. agreement, review side */
console.log("\n--- 3. AGREEMENT: each hash re-computed here, over the bytes that side serves ---");
t("REVIEW SIDE: the served hash IS the SHA-256 of the served answer minus `inband`, serialised as the "
+ "quartet states — re-computed with node:crypto, sharing no code with src/",
  rehashServed(read1.bytes), q1.hash?.sha256);
t("and the byte count it states is that serialisation's",
  Buffer.byteLength(JSON.stringify((({ inband, ...r }) => r)(rc1), null, 1), "utf8"), q1.hash?.bytes);

/* ======================================================================= 6 (second half). one byte */
console.log("\n--- 6b. one byte of the answer moves: the hash moves ---");
const edited = rP(await POST(`op=casedraft&token=${IRIS}`,
  { draft: DRAFT, ...ARGS, statement: ARGS.statement.replace("only.", "only!") }));
if (!edited?.ok) await bail("casedraft edit", edited);
const read2 = await rawGet(`op=reviewcopy&draft=${DRAFT}&token=${IRIS}`);
const rc2 = JSON.parse(read2.bytes.toString("utf8"));
t("ONE CHARACTER of the authored statement changed: the hash moves, and still re-computes here",
  [rc2.inband?.hash?.sha256 !== q1.hash?.sha256, rehashServed(read2.bytes) === rc2.inband?.hash?.sha256],
  [true, true]);
const cm = rP(await POST(`op=reviewcomment&draft=${DRAFT}&token=${IRIS}`, { text: "x" }));
if (!cm?.ok) await bail("reviewcomment", cm);
const read3 = await rawGet(`op=reviewcopy&draft=${DRAFT}&token=${IRIS}`);
const rc3 = JSON.parse(read3.bytes.toString("utf8"));
t("A ONE-CHARACTER COMMENT, which moves the answer but not the draft: the hash moves; the DATE does not, "
+ "because the date is the draft's own last edit",
  [rc3.inband?.hash?.sha256 !== rc2.inband?.hash?.sha256, rehashServed(read3.bytes) === rc3.inband?.hash?.sha256,
   rc3.inband?.date === rc2.inband?.date],
  [true, true, true]);
/* Restore the authored statement, so the published edition is the draft's arguments exactly. */
{
  const back = rP(await POST(`op=casedraft&token=${IRIS}`, { draft: DRAFT, ...ARGS }));
  if (!back?.ok) await bail("casedraft restore", back);
}
const readF = await rawGet(`op=reviewcopy&draft=${DRAFT}&token=${IRIS}`);
const qF = JSON.parse(readF.bytes.toString("utf8")).inband || {};

/* ======================================================================= 3b/4. the same case edition, published */
console.log("\n--- 4. the SAME case edition published and signed: the container's quartet ---");
const pub = rP(await POST(`op=publish&token=${IRIS}`, ARGS));
if (pub?.ok === false || !pub?.caseDocument?.doc_sha) await bail("publish", pub);
let rat;
try { rat = rP(await ratifyCase(POST, pub, { dir, key: "iris", token: IRIS })); }
catch (e) { await bail("caseratify", String(e.message || e)); }
/* THE MEMBER SIGNS ITS OWN BYTES at the version the case pinned; the container assembles when the last member
   lands (op=ratify), or at the case signature when every member was already ratified (op=caseratify). */
let asm = rat;
if (!rat?.container && Array.isArray(rat?.awaiting) && rat.awaiting.length) {
  const pin = (rat.members || []).find((m) => m.bundle_id === LEAD)?.version_sha;
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${LEAD} ${pin}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "iris"), "-n", "bio-ratify", f], { stdio: ["ignore", "ignore", "ignore"] });
  asm = rP(await POST(`op=ratify&token=${IRIS}`, { bundleId: LEAD, expectedSha: pin, sig: readFileSync(f + ".sig", "utf8") }));
  if (asm?.ok === false) await bail("ratify the member", asm);
}
const cq = asm?.container?.inband;
if (!cq) await bail("the signed case edition assembled no container carrying `inband`", asm);
t("the container is assembled when the last signature lands, for the edition the draft stood at",
  [pub.caseDocument.edition, dr.edition, typeof asm.container.manifest_sha], [dr.edition, 1, "string"]);
t("CONTAINER HASH is the manifest's hash, and the quartet names it",
  cq.hash?.sha256, asm.container.manifest_sha);
{
  const m = await rawGet(`op=publishedbytes&sha256=${asm.container.manifest_sha}`);
  t("CONTAINER SIDE OF THE AGREEMENT: MANIFEST.json fetched by its hash re-hashes HERE to that hash, and "
  + "its bytes ARE the quartet's canonical form of the parsed manifest",
    [m.status, sha(m.bytes), Buffer.from(JSON.stringify(JSON.parse(m.bytes.toString("utf8")), null, 1), "utf8").equals(m.bytes),
     m.bytes.length],
    [200, cq.hash?.sha256, true, cq.hash?.bytes]);
}
t("FIELD FOR FIELD: the review copy's quartet and the container's carry the SAME fields, the same hash "
+ "fields and the same format",
  [Object.keys(qF), Object.keys(qF.hash || {}), qF.format, qF.hash?.algorithm, qF.hash?.canonical],
  [Object.keys(cq), Object.keys(cq.hash || {}), cq.format, cq.hash?.algorithm, cq.hash?.canonical]);
t("FLOORS AGREE: the draft's floors (the project's bar read now) and the container's (the bar frozen into "
+ "the signed case document) are ONE quantity, word for word",
  qF.floors, cq.floors);
t("AUTHOR AND DATE on the container are the case document's signer and its ratification instant — the "
+ "same KINDS of fact the review copy states for the draft",
  [cq.author, typeof cq.date === "string" && !Number.isNaN(Date.parse(cq.date))], ["iris", true]);

/* ======================================================================= 5. one function */
console.log("\n--- 5. ONE FUNCTION: no second hasher over a manifest or a review copy ---");
{
  const idx = codeOf(SRC("index.mjs"));
  const calls = (idx.match(/\binbandQuartet\(/g) || []).length;
  t("index.mjs calls `inbandQuartet` at exactly the TWO sites — the container assembly and the review copy",
    calls, 2);
  const asm = idx.slice(idx.indexOf("async function assembleCaseContainer"), idx.indexOf("export default {"));
  t("the container assembly holds no SHA-256 of its own and no serialisation of the manifest of its own",
    [asm.length > 1000, /crypto\.subtle\.digest|sha256Hex\(|JSON\.stringify\(manifest/.test(asm)], [true, false]);
  /* CONDUCT #18 at c17-batch7 (2026-09-23): the anchor was the whole condition `(op === "reviewcopy" || op ===
     "reviewcomment")`; D-150 widened that handler to `|| op === "statementack"`, so the exact string vanished, indexOf
     answered -1 and the slice measured the wrong code. The old anchor was wrong because it pinned the handler's
     membership, not its start; anchor on the handler's opening prefix instead, which every widening keeps. */
  /* CORRECTED 2026-09-24 at integration by c19-unionfix: CONDUCT #19 moved the review copy's ANSWER out of this
     handler into `reviewAnswer` at c19-batch9 (REC-198: one answer shape for every read of a draft), so a slice of
     the handler alone no longer held the code this arm exists to watch — the row's control arm (a), a second
     hasher planted beside the quartet, went GREEN here while failing elsewhere (re-run 2026-09-24). The old
     assertion was right of the old tree and blind on this one; the site is now the handler PLUS the function it
     returns through, and the arm asserts the function really holds the quartet call, so it cannot pass by
     slicing the wrong code again. */
  const rcHandler = idx.slice(idx.indexOf('if (op === "reviewcopy" || op === "reviewcomment"'),
                              idx.indexOf('if (op === "publishedcase" || op === "publishedbytes")'));
  const raAt = idx.indexOf("async function reviewAnswer(");
  const rcAnswer = raAt < 0 ? "" : idx.slice(raAt, idx.indexOf("\n}\n", raAt));
  const rcSite = rcHandler + rcAnswer;
  t("the review copy's handler and its answer function hold no SHA-256 over the answer of their own — the only "
  + "digest is the secret's fingerprint, and the answer function is where the quartet is called",
    [rcHandler.length > 500, /reviewAnswer\(/.test(rcHandler), /\binbandQuartet\(/.test(rcAnswer),
     (rcSite.match(/crypto\.subtle\.digest|sha256Hex\(/g) || []).length, /JSON\.stringify\(served/.test(rcSite)],
    [true, true, true, 1, false]);
  const ib = codeOf(SRC("inband.mjs"), true);
  t("and inside `inband.mjs` there is ONE canonical serialisation and ONE digest",
    [(ib.match(/JSON\.stringify\(/g) || []).length, (ib.match(/crypto\.subtle\.digest\(/g) || []).length], [1, 1]);
}

/* The suite ends on its own explicit exit (hygiene's rule), after the tally it printed. */
console.log(`\nreviewcopy-inband: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
