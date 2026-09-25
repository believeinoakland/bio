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
   unchanged.

   REC-200's THREE ARMS, DECLARED 2026-09-24 BEFORE ARMING, on the DATE (BOB #32, 2026-09-23 23:08Z: the copy
   carries the date of its LAST CHANGE):

   (d) THE ROW'S CONTROL — KEEP THE OLD DATE: the quartet's date read from the draft's `updated_at` again.
   Declared: MUST FAIL every arm that asserts an act MOVES the date — 6b's comment arm and block 7's member
   comment, grant, recipient comment and acknowledgement. MUST NOT fail block 1 (on a fresh draft the last
   change IS the last edit, which is why that arm alone cannot catch this), any hash or re-hash arm, 6a's
   stability, the floors, the one-function arm or the whole container side.

   (e) OVER-STRICTNESS — the newest act picked by SORTING the candidates instead of by the reducer loop, a
   correct spelling the suite did not anticipate. Declared: everything GREEN.

   (f) THE LIAR — the date is the MOMENT OF THE READ. It moves whenever anything happens, so it would satisfy
   a naive "the date moved" arm while meaning nothing. Declared: MUST FAIL 6a's stability arm, block 7's
   "AND NOTHING HAPPENED" arm, and every arm pinning the date to a NAMED instant (block 1, 6b's comment, and
   block 7's four acts).

   RUN 2026-09-24 by the REC-200 worker (branch land/worker/REC-200), all six anchors LIVE at preflight, every
   restore sha256 MATCH and content IDENTICAL (index.mjs 809,945 bytes; inband.mjs 3,815; store.mjs 3,291,748),
   the pen OUTSIDE the worktree (BOB #32, 2026-09-24):
     (0) baseline -> 31 pass, 0 fail.
     (a) -> 22/9, where the 2026-09-24 re-run gave 18/4: the four declared then, plus block 7's five arms,
         each of which re-hashes the served answer as well as reading the date. MORE than declared, in the
         same direction, and it is a fact about the ADDED arms rather than about the subject.
     (b) -> 31/0 GREEN, as in the REC-148 run: the frozen bar's `declared` still reaches `floorsOf` as a
         boolean on this plane, so the string branch stays defence in depth. Recorded, not smoothed.
     (c) -> 28/3: the three floor arms of block 2, block 4's field-for-field floors arm GREEN. As declared.
     (d) -> 26/5: the five date arms failing BY NAME and NOTHING else — block 1, the hashes, 6a, the floors,
         the one-function arm and the container side all green, exactly as declared. THIS IS THE ROW'S OWN
         CONTROL: keep the old date and only the arms about the rule fail.
     (e) -> 31/0 GREEN, as declared.
     (f) -> 22/9: 6a, "AND NOTHING HAPPENED", block 1's date arm, 6b's comment arm and block 7's five arms.
         As declared, and it is what makes (d)'s greens meaningful — a date that merely MOVES does not pass.

   RE-RUN 2026-09-24, WHOLE, after the gate found block 7's wait UNCHECKED (`budget-sweep.test.mjs`: a
   hand-rolled wall-clock deadline is UNCHECKABLE by construction, M0-107) and it was rebuilt on `until` +
   `budgetAssert`, with the stability arm moved ahead of the acknowledgement so an expired budget skips only
   what it did not measure: EVERY ARM UNCHANGED — baseline 31/0, (a) 22/9, (b) 31/0, (c) 28/3, (d) 26/5 with
   the same five arms named, (e) 31/0, (f) 22/9. The subject's control is re-run because the subject moved,
   not because anything was expected to differ.

   (g) D-564 (declared and RUN 2026-09-25, WORKER D-564 (SCHEDULER #22)), THE RECORDER — every section now runs in
   `block()`, and the subject is the SUITE, so the arms break a section's FIXTURE rather than the plane. Re-run in one
   step: `node test/d564-block.control.mjs reviewcopy-inband` from bio-plane/. BASELINE -> **31 pass, 0 fail**, per
   section 0 (setup) 0/0, 1 4/0, 2 3/0, 6a 1/0, 3 2/0, 6b 2/0, 4 7/0, 5 4/0, 7 8/0, foot reached.
   (g) SECTION 7's FIXTURE BROKEN (the member's comment posted to `draft=${D7}-BROKEN`, a draft that does not
   exist; no later section reads block 7) — declared: section 7 DIES by name with tally -1, every other section
   reports its baseline tally -> **25 pass, 1 fail**, exit 1, `BLOCK 7 DIED: (fixture) reviewcomment (block 7,
   member): {"ok":false,"reason":"NO_REVIEW_COPY"…`, foot `[FOOT REACHED; DIED: 7]`, sections 0-5 at baseline, as
   declared. The restore was verified by sha256 against a pristine copy (MATCH).
   (h) THE RECORDER DISARMED (`block()` rethrows) over (g)'s fixture — declared: NO foot and no section tally, exit 1:
   the driver cannot read an early end as a finished run -> **no foot, exit 1, no section tally**, as declared (run 2026-09-25 by `d564-block.control.mjs`; the real suite hashed unchanged before and after).
 */

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
/* REC-200: M0-107's budget helper — a hand-rolled wall-clock deadline is UNCHECKABLE by construction
   (`scripts/budgetsweep.mjs`), and an expired budget must read NOT MEASURED rather than as a finding. */
import { until, budgetAssert } from "./budget.mjs";

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
/* D-564: EVERY SECTION RUNS INSIDE `block()` — D-548's recorder (d84-case-manifest.test.mjs), adopted. Before it,
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

let dir, IRIS, PROJ, PROJ_ASYM, LEAD, ARGS;
await block("0 (setup)", async () => {
/* ---- roster, keys, project with an ASYMMETRIC declared bar ---- */
dir = mkdtempSync(join(tmpdir(), "rc-inband-"));
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
IRIS = await enrol("iris", "iris-passphrase-148", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-r148", { keyB64: irisKey, memberId: "iris", comment: "iris laptop" }));

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
/* THE PUBLISHING PROJECT declares BOTH floors, and DIFFERENT ones — capture C, connection D — which the lead
   clears (its legs are caseflip's: an earned capture B, a hunch connection C), so a swap of the axes is
   visible on the published side too. A SECOND project declares CONNECTION ONLY, so block 2 sees two
   floors that differ and a swap of the axes is visible; it is drafted and never published.
   CORRECTED by D-450 (2026-09-25): this said a one-axis bar "cannot be SIGNED today (C-41.12 refuses the
   frozen `capture: null` — reported by REC-148)". That was true when written and is no longer: C-41.12
   admits null for an axis nobody set (Publication §3 rule 14), and caseproduction §10 publishes and
   ratifies one. The fixture still only drafts it because this suite's subject is the review copy. */
PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r148", owner: "iris",
  name: "PROJ-2026-1480-inband", created: NOW, updated: LATER,
  bar: { capture: "C", connection: "D", author: "iris", at: NOW } });
PROJ_ASYM = await makePublishingProject({
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
const INFO = "INFO-2026-1480-memo"; LEAD = "INQ-2026-1480-lead";
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
ARGS = {
  project: PROJ, targets: [LEAD], roles: allLoadBearing({ targets: [LEAD] }),
  scope: "Whether the FY2024 transfer was authorised.",
  statement: "This case covers the FY2024 transfer only.",
  excluded: [{ target: null, description: "the FY2023 memo", reason: "a records request is outstanding" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: "We put the claims to the City Administrator.",
  biasAcknowledgement: "This group holds that transfers should be adopted in public.",
};
});

console.log("\n--- reviewcopy-inband ---");

/* ======================================================================= 1. the quartet is there */
let dr, DRAFT, read1, rc1, q1;
console.log("\n--- 1. the review copy carries hash, date, author and both floors in-band ---");
await block("1", async () => {
needs("0 (setup)", { IRIS, ARGS });
dr = rP(await POST(`op=casedraft&token=${IRIS}`, ARGS));
if (!dr?.ok) await bail("casedraft", dr);
DRAFT = dr.draftId;
read1 = await rawGet(`op=reviewcopy&draft=${DRAFT}&token=${IRIS}`);
rc1 = JSON.parse(read1.bytes.toString("utf8"));
q1 = rc1.inband || {};
t("the review copy answers, and carries an `inband` quartet in the format the container's carries",
  [read1.status, rc1.ok, rc1.kind, q1.format], [200, true, "review-copy", "bio-inband/1"]);
t("HASH: a SHA-256, named as such, over a stated subject with its byte count",
  [q1.hash?.algorithm, /^[0-9a-f]{64}$/.test(q1.hash?.sha256 ?? ""), typeof q1.hash?.over,
   Number.isInteger(q1.hash?.bytes) && q1.hash.bytes > 100],
  ["sha256", true, "string", true]);
/* CORRECTED 2026-09-24 (REC-200), NOT EXEMPTED: the old assertion read the in-band date as the draft's
   `updated_at` — the last EDIT — and BOB #32 ruled at 23:08Z on 2026-09-23 that the copy carries the date
   of its LAST CHANGE (§6A.3 point 1). On a draft nobody has commented on, granted or acknowledged the two
   are the SAME instant, which is exactly why the old assertion passed and why it could not tell them
   apart; block 7 drives them apart. Pinned here to the quantity (`last_change.at`) as well as to the
   value. */
t("DATE is the copy's LAST CHANGE and AUTHOR is the draft's own editor — never the moment of the read or "
+ "the reader; on a draft nothing has happened to, its last change IS its last edit and the two agree",
  [q1.date, q1.author, q1.date === rc1.last_change?.at, q1.date === rc1.updated_at,
   q1.author === rc1.updated_by],
  [rc1.updated_at, "iris", true, true, true]);
t("the store's `required_strength` is read INTO the floors and is not served a second time beside them",
  "required_strength" in rc1, false);
});

/* ======================================================================= 2. the floors are the bar */
console.log("\n--- 2. the floors are the project's DECLARED bar, axis by axis ---");
await block("2", async () => {
needs("0 (setup), 1", { IRIS, ARGS, PROJ_ASYM, q1 });
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
});

/* ======================================================================= 6 (first half). stability */
console.log("\n--- 6a. nothing moved: the hash does not move ---");
await block("6a", async () => {
needs("0 (setup), 1", { IRIS, DRAFT, q1 });
const read1b = await rawGet(`op=reviewcopy&draft=${DRAFT}&token=${IRIS}`);
t("two reads with nothing changed between them answer the SAME hash — a hash that moves on every read would "
+ "pass the one-byte arm below and mean nothing",
  JSON.parse(read1b.bytes.toString("utf8")).inband?.hash?.sha256, q1.hash?.sha256);
});

/* ======================================================================= 3a. agreement, review side */
console.log("\n--- 3. AGREEMENT: each hash re-computed here, over the bytes that side serves ---");
await block("3", async () => {
needs("1", { read1, rc1, q1 });
t("REVIEW SIDE: the served hash IS the SHA-256 of the served answer minus `inband`, serialised as the "
+ "quartet states — re-computed with node:crypto, sharing no code with src/",
  rehashServed(read1.bytes), q1.hash?.sha256);
t("and the byte count it states is that serialisation's",
  Buffer.byteLength(JSON.stringify((({ inband, ...r }) => r)(rc1), null, 1), "utf8"), q1.hash?.bytes);
});

/* ======================================================================= 6 (second half). one byte */
let qF;
console.log("\n--- 6b. one byte of the answer moves: the hash moves ---");
await block("6b", async () => {
needs("0 (setup), 1", { IRIS, ARGS, DRAFT, q1 });
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
/* CORRECTED 2026-09-24 (REC-200): this assertion described THE PLANE correctly and THE RULE wrongly. It
   pinned the date to the draft's last edit and therefore asserted that a comment moves the hash and NOT
   the date — which is the defect BOB #32 ruled on at 23:08Z on 2026-09-23: a rendering that leaves the
   instance would carry THIS moment's hash under an OLDER date, the record claiming more than it holds.
   Both move now, and the date is the comment's own `at`. */
t("A ONE-CHARACTER COMMENT, which moves the answer but not the draft's own edit stamp: the hash moves AND "
+ "the date moves with it, to the comment's own instant, while `updated_at` stays where it was and the "
+ "copy names the change",
  [rc3.inband?.hash?.sha256 !== rc2.inband?.hash?.sha256, rehashServed(read3.bytes) === rc3.inband?.hash?.sha256,
   rc3.inband?.date !== rc2.inband?.date, rc3.inband?.date === cm.comment?.at,
   rc3.updated_at === rc2.updated_at, rc3.last_change?.kind, rc3.last_change?.by, rc3.last_change?.by_kind],
  [true, true, true, true, true, "comment", "iris", "member"]);
/* Restore the authored statement, so the published edition is the draft's arguments exactly. */
{
  const back = rP(await POST(`op=casedraft&token=${IRIS}`, { draft: DRAFT, ...ARGS }));
  if (!back?.ok) await bail("casedraft restore", back);
}
const readF = await rawGet(`op=reviewcopy&draft=${DRAFT}&token=${IRIS}`);
qF = JSON.parse(readF.bytes.toString("utf8")).inband || {};
});

/* ======================================================================= 3b/4. the same case edition, published */
console.log("\n--- 4. the SAME case edition published and signed: the container's quartet ---");
await block("4", async () => {
needs("0 (setup), 1, 6b", { IRIS, ARGS, LEAD, dir, dr, qF });
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
/* REC-200 pins the CONTAINER SIDE to the RECORD, not to a literal and not to the variable the quartet was
   built from: BOB #32 ruled at 23:08Z on 2026-09-23 that the container side is stamped by the ATTESTOR and
   the RATIFICATION DATE, and both are read back here from `op=casedocument` for this published edition.
   It was ALREADY so on the plane (REC-148) — this arm is what would catch it drifting to the draft's
   stamps, to the publisher, or to the moment of assembly. */
{
  /* THE PUBLISHED READ IS ASKED BY A FINDING OF THE CASE (`id=`), with the case named to resolve a finding
     several cases could pin, and the edition — the op takes no bare case id. */
  const pc = rP(await GET(`op=publishedcase&id=${encodeURIComponent(LEAD)}`
    + `&caseId=${encodeURIComponent(pub.caseDocument.case_id)}&edition=${pub.caseDocument.edition}`));
  const doc = rP(await GET(`op=casedocument&token=${IRIS}`
    + `&case=${encodeURIComponent(pub.caseDocument.case_id)}&edition=${pub.caseDocument.edition}`));
  t("AUTHOR AND DATE on the container are the ATTESTOR and the EDITION'S RATIFICATION INSTANT, read back "
  + "from the record itself — the signer from op=casedocument, the instant from op=publishedcase — which is "
  + "the stamp BOB #32 ruled the container side carries, and the same KINDS of fact the review copy states "
  + "for the draft",
    [cq.author, typeof cq.date === "string" && !Number.isNaN(Date.parse(cq.date)),
     pc?.ok !== false, doc?.ok === true, cq.author === doc?.attestor_member, cq.date === pc?.ratified_at],
    ["iris", true, true, true, true, true]);
  /* MEASURED HERE, 2026-09-24 (REC-200), because the plane holds TWO ratification instants and a reader
     who assumes one would be wrong about the artifact that travels: `published_cases.ratified_at` is the
     instant the LAST MEMBER's signature landed — the edition's completion, which is what the container
     carries — and `case_documents.ratified_at` is the instant the CASE SIGNATURE was delivered. This arm
     asserts they are told apart rather than assumed equal; it is not a defect, and if the two ever
     coincide the arm says so rather than failing. */
  t("and the case DOCUMENT's own ratification instant is a SECOND fact, told apart from the edition's: the "
  + "container carries the edition's",
    [doc?.ratified, typeof doc?.ratified_at === "string",
     doc?.ratified_at === cq.date ? "the same instant in this run" : "a different instant, as the record holds them"],
    [true, true, "a different instant, as the record holds them"]);
}
});

/* ======================================================================= 5. one function */
console.log("\n--- 5. ONE FUNCTION: no second hasher over a manifest or a review copy ---");
await block("5", async () => {
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
});

/* ======================================================================= 7. the date is the LAST CHANGE */
/* REC-200 / BOB #32, 2026-09-23 23:08Z (`BIO_Publication_v0_1.md` §6A.3 point 1): *the copy carries the date
   of its LAST CHANGE, so a comment that moves the hash moves the date*. Block 6b drives the ruling's own
   example on the member door; this block sweeps the CLASS — every DATED ACT these bytes carry — and drives
   each one THROUGH ITS OP: an edit, a comment (member), a grant, a comment (recipient) and an
   acknowledgement, on both doors. What the date CANNOT see is stated by the copy itself and asserted here,
   because a scope nobody can read is not a scope. */
console.log("\n--- 7. REC-200: the date is the copy's LAST CHANGE, act by act, on both doors ---");
await block("7", async () => {
needs("0 (setup)", { IRIS, ARGS });
{
  /* A FRESH DRAFT, so nothing here disturbs the edition published above. */
  const d7 = rP(await POST(`op=casedraft&token=${IRIS}`, ARGS));
  if (!d7?.ok) await bail("casedraft (block 7)", d7);
  const D7 = d7.draftId;
  const readAs = async (q) => {
    const r = await rawGet(q);
    const o = JSON.parse(r.bytes.toString("utf8"));
    return { o, status: r.status, sha: o.inband?.hash?.sha256, date: o.inband?.date,
             lc: o.last_change, rehash: rehashServed(r.bytes) };
  };
  const member = () => readAs(`op=reviewcopy&draft=${D7}&token=${IRIS}`);

  const r0 = await member();
  t("A FRESH DRAFT: the date is its own edit, the copy NAMES the change, and it STATES what the date cannot "
  + "see — the finding's text, the gates' verdict and the project's floors, each able to move the hash alone",
    [r0.status, r0.date === r0.o.updated_at, r0.lc?.kind, r0.lc?.by, r0.lc?.by_kind, r0.rehash === r0.sha,
     /LAST CHANGE/.test(r0.lc?.stated || ""), /DOES NOT SEE/.test(r0.lc?.stated || ""),
     /gates' verdict/.test(r0.lc?.stated || "")],
    [200, true, "edit", "iris", "member", true, true, true, true]);

  /* THE DATE IS INSIDE THE HASHED BYTES, which is what binds the two: `last_change` is part of the answer
     the hash is taken over, so nobody can be handed these bytes under a different date. Proved by moving
     the date HERE and re-hashing, not by reading the code. */
  {
    const { inband: _drop, ...rest } = JSON.parse(JSON.stringify(r0.o));
    rest.last_change.at = "2026-01-01T00:00:00.000Z";
    t("THE DATE IS COVERED BY THE HASH: move `last_change` in the served bytes and the hash no longer "
    + "matches — so the date cannot be restated under the same hash",
      sha(Buffer.from(JSON.stringify(rest, null, 1), "utf8")) !== r0.sha, true);
  }

  const c7 = rP(await POST(`op=reviewcomment&draft=${D7}&token=${IRIS}`, { text: "a member's note" }));
  if (!c7?.ok) await bail("reviewcomment (block 7, member)", c7);
  const r1 = await member();
  t("A MEMBER'S COMMENT: the hash moves and the date moves WITH it, to the comment's own instant, while the "
  + "draft's `updated_at` stays where it was",
    [r1.sha !== r0.sha, r1.rehash === r1.sha, r1.date === c7.comment?.at, r1.date !== r0.date,
     r1.o.updated_at === r0.o.updated_at, r1.lc?.kind],
    [true, true, true, true, true, "comment"]);

  const g7 = rP(await POST(`op=reviewgrant&token=${IRIS}`,
    { draft: D7, recipient: "Dana Ruiz, City Auditor's office" }));
  if (!g7?.ok || !g7.secret) await bail("reviewgrant (block 7)", g7);
  const r2 = await member();
  t("A GRANT ISSUED — a dated act on the copy that is neither an edit nor a comment: the date moves to the "
  + "issue instant and names the act and its issuer",
    [r2.sha !== r1.sha, r2.rehash === r2.sha, r2.date === g7.issuedAt, r2.lc?.kind, r2.lc?.by],
    [true, true, true, "grant", "iris"]);

  const SEC = encodeURIComponent(g7.secret);
  const c8 = rP(await POST(`op=reviewcomment&secret=${SEC}`, { text: "the addressee's note" }));
  if (!c8?.ok) await bail("reviewcomment (block 7, recipient)", c8);
  const r3 = await member();
  const rr3 = await readAs(`op=reviewcopy&secret=${SEC}`);
  t("A RECIPIENT'S COMMENT, through the grant and holding no credential: BOTH DOORS move to that instant, "
  + "and the copy names the ADDRESSEE the grant was issued to rather than the grant id",
    [r3.date === c8.comment?.at, rr3.date === c8.comment?.at, rr3.status, rr3.rehash === rr3.sha,
     r3.lc?.by, r3.lc?.by_kind, rr3.lc?.by],
    [true, true, 200, true, "Dana Ruiz, City Auditor's office", "recipient",
     "Dana Ruiz, City Auditor's office"]);

  const r3b = await member();
  t("AND NOTHING HAPPENED: two reads with no act between them answer the SAME hash and the SAME date — the "
  + "date is the copy's last change, never the moment of the read",
    [r3b.sha === r3.sha, r3b.date === r3.date], [true, true]);

  /* CORRECTED 2026-09-25 (D-543), NOT EXEMPTED: this comment said an acknowledgement's stamp is CUT TO THE
     SECOND while every other act here carries milliseconds, so one made in the same second as the act before
     it was dated EARLIER than that act. That was the record's two spellings, and D-543 removed it at the
     source: `acknowledgeStatement` now stamps `stampInstant("millisecond")` like the other three acts
     (`d543-instant-precision.test.mjs` block 3), and `#reviewLastChange` ranks by `instantOrder` for the
     whole-second rows recorded before it (block 2 there). The wait is KEPT: it still guarantees the
     acknowledgement is strictly later than the comment, and without it two acts inside one millisecond
     would tie and the tie keeps the comment, as it should. The wait for the clock to cross into the next second
     is M0-107's `until` with its result read by `budgetAssert`, never a hand-rolled deadline: an expiry
     measured nothing, so it reads NOT MEASURED and the acknowledgement arms below are SKIPPED rather than
     failing as though the plane were wrong. */
  const secFloor = Math.floor(Date.parse(c8.comment?.at ?? new Date().toISOString()) / 1000);
  const crossed = await until(() => Math.floor(Date.now() / 1000) > secFloor, 5000, { stepMs: 25 });
  const clockOk = budgetAssert(t, "reviewcopy-inband block 7: the clock crossing into the second after the "
    + "recipient's comment", crossed, 5000,
    "the acknowledgement arms — a second-precision stamp cannot be ranked inside the second it was cut from");
  if (clockOk) {
    const a7 = rP(await POST(`op=statementack&draft=${D7}&secret=${SEC}`, {}));
    if (!a7?.ok) await bail("statementack (block 7, recipient)", a7);
    const r4 = await member();
    const rr4 = await readAs(`op=reviewcopy&secret=${SEC}`);
    t("AN ACKNOWLEDGEMENT OF THE STATEMENT — the fourth dated act the copy carries: the date moves to it on "
    + "both doors, named as an acknowledgement and attributed to the addressee",
      [r4.date === a7.acknowledgement?.at, rr4.date === a7.acknowledgement?.at, r4.sha !== r3.sha,
       r4.rehash === r4.sha, r4.lc?.kind, r4.lc?.by],
      [true, true, true, true, "statement acknowledgement", "Dana Ruiz, City Auditor's office"]);
  }

  /* WHAT THIS BLOCK CANNOT SEE, SAID PLAINLY: it drives the four dated acts the answer carries. It does NOT
     drive a grant's REVOCATION (a revoked grant is not served on the recipient door at all, and the member
     door's roster row is), and the three undated sources the copy names in `stated` — a finding's text, the
     gates' verdict, the project's floors — are outside the date by construction, which is why the copy says
     so rather than this suite asserting they move it. */
}
});

/* The suite ends on its own explicit exit (hygiene's rule), after the tally it printed. */
/* D-564: every section's own tally, -1 for one that DIED; a section that never recorded at all is named missing
   rather than read as clean — the foot counts the sections it expected against the ones that reported. */
const EXPECTED = ["0 (setup)", "1", "2", "6a", "3", "6b", "4", "5", "7"];
console.log("\n--- per-section tallies (D-564: -1 = the section DIED, its tally is missing) ---");
for (const n of EXPECTED) {
  const r = TALLY.find((x) => x.name === n);
  if (!r) { fail++; console.log(`  FAIL  section ${n}: NEVER REPORTED — tally -1`); continue; }
  console.log(`  section ${n}: ${r.pass} pass, ${r.fail} fail${r.died ? "  [DIED]" : ""}`);
}
const DIED = TALLY.filter((x) => x.died).map((x) => x.name);
console.log(`\nreviewcopy-inband: ${pass} pass, ${fail} fail  [FOOT REACHED${DIED.length ? `; DIED: ${DIED.join(", ")}` : ""}]`);
await mf.dispose();
process.exit(fail ? 1 : 0);
