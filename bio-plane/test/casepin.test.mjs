/* NEGATIVE CONTROL: see the block at the FOOT of this file. Every arm is armed
   ALONE with every other defence held open, RUN, and recorded there with the
   count it MEASURED. The driver is `test/casepin.control.mjs` — COMMITTED, so
   the arms re-run in one step with `node test/casepin.control.mjs [arm]` — and
   every restore is verified by CONTENT and by sha256 against a uniquely-named
   per-arm pristine copy taken INSIDE THIS WORKTREE (never a shared scratchpad:
   PL-10's harness was overwritten mid-turn by a concurrent worker, and UI-38 met
   an NC harness that reported a byte-identical restore over a file it had not
   restored). */

/* CASE-3 / DEC-72 CLAUSE 3 — VERSION PINNING: A PUBLISHED CASE SAYS WHAT IT SAID
 * WHEN IT WAS PUBLISHED.
 *
 * Bob ruled it on 2026-08-10 and `docs/archive/CASE-AS-PRODUCTION.md` is the
 * design. The clause, in his words: *"Once published, the act of changing the
 * findings (or any claims of any of the findings) results in the changed version
 * becoming a new version."* The design bullet this suite is judged against:
 * members frozen by version hash on the finding's EXISTING version chain; an
 * edit touching a published version MINTS A NEW VERSION; the pinned version is
 * NEVER MUTATED.
 *
 * WHY THE PROPERTY IS WORTH A SUITE OF ITS OWN. A pinned version that can be
 * edited underneath makes every published case a claim about the PRESENT rather
 * than a record of an ACT — which is the overclaim class this project ranks
 * worst, and it arrives through convenience rather than through malice. A group
 * that publishes a case and then improves one of its findings has done nothing
 * wrong; what would be wrong is the record letting the improvement land silently
 * under a hash a reader already relied on.
 *
 * WHAT THIS ITEM FOUND, because it is the reason two of the blocks exist. The
 * pin column landed with CASE-1 and NOTHING EVER WROTE IT — the case froze
 * nothing, and `op=publishedmanifest` said so in words. And the door that moves which
 * reading a finding stands on, `#moveVersionState`, had NO published-state guard
 * at all, while BOTH of its neighbours already refused exactly this:
 * `op=inquirydivide` answers PUBLISHED_CANNOT_DIVIDE and `op=inquiryground`
 * answers PUBLISHED_CANNOT_RESTRUCTURE, the latter in words that describe the
 * version door exactly. So the fence added here is not a new policy; it is the
 * third door on a corridor where two were already shut.
 *
 * EVERY ARM IS DRIVEN THROUGH AN OP, NEVER ASSERTED AT THE STORE. `op=invitelook`
 * shipped with a ReferenceError while 1276 assertions passed, and a store-level
 * test is not evidence a caller can reach the feature. The pin is read back
 * through `op=publishedcase` (the ANONYMOUS public read — the caller the freeze
 * exists for) and through `op=publishedmanifest`; the fence is driven through the six real
 * version-act ops.
 *
 * AND THE EXPECTATIONS ARE NOT DERIVED FROM THE THING UNDER TEST. Four items
 * shipped a BLIND assertion on 2026-08-10, and the last worker to hit the class
 * had read all three prior reports first — so this suite takes its expected pin
 * from the SIGNATURE rather than from the pin column (the sha fed to `ssh-keygen
 * -Y sign` before ratification, captured independently of anything this item
 * wrote), and block 6's expectation is PARSED OUT OF `CASE-AS-PRODUCTION.md` at
 * run time — a document written before this code, owned by nobody in this
 * worktree, and one this item may not edit. Delete the pin and the document
 * still demands it.
 *
 * WHAT NO ARM HERE REACHES, STATED RATHER THAN LEFT TO BE DISCOVERED:
 *   - The `version_sha IS NULL` predicate on the pin write is a SECOND fence in
 *     front of a door `EDITION_EXISTS` already holds shut — different bytes at an
 *     already-published edition are refused thirty lines earlier, so no caller
 *     can drive a pin overwrite. It is pinned STRUCTURALLY in block 1 and the
 *     control arm proves the suite notices if it is removed; it is NOT claimed to
 *     be a reachable refusal, and saying otherwise would be this suite
 *     overclaiming about its own reach.
 *   - Resolving a member BY THE PIN instead of by the CASE'S edition number.
 *     That is the conflation CASE-1's schema comment hands to the artifact flip,
 *     which is CASE-5. This item serves the pin and does not move the predicate.
 */

import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { ADOPTED_READING, ADOPTED_CLAIM, adoptedVersionParam } from "./adoptable-reading.mjs";
import { ratifyCase } from "./caseceremony.mjs"; /* CASE-5b: the case-level signing ceremony */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { VERSION_ACT_CHECKS } from "../checks/bio-checks.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- casepin ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("casepin: SKIPPED — ssh-keygen not on PATH; a pin is the hash a member SIGNED, so every "
    + "assertion here rests on a real bio-ratify signature");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-case3", MEMBER_TOKEN: "mem-case3", PROBE_TOKEN: "prb-case3", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

/* THE ANONYMOUS CALLER — no token, no cookie, no header. The freeze exists for a
   reader who holds nothing, so the pin is asserted by one. */
const anonCase = async (args) => rP(await (await mf.dispatchFetch(`http://x/api/?op=publishedcase&${args}`)).json());

const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");

/* ---- keys and roster ---- */
const dir = mkdtempSync(join(tmpdir(), "casepin-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "vera", "-f", join(dir, "vera"), "-q"]);
const keyB64 = readFileSync(join(dir, "vera.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "vera"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-case3",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* TWO administrators before any ordinary member (ADMINS_FIRST). vera publishes. */
await enrol("nadia", "nadia-passphrase-33", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-33", "admin", ["contribute", "publish"]);
const VERA = await enrol("vera", "vera-passphrase-33", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-case3", { keyB64, memberId: "vera", comment: "vera laptop" }));

const listRow = async (id) => ((await GET(`op=list&token=${VERA}&limit=1000`)).result?.bundles
  || (await GET(`op=list&token=${VERA}&limit=1000`)).result || [])
  .find((b) => b.bundle_id === id);
const shaOf = async (id) => (await listRow(id))?.bundle_sha ?? null;
const stateOf = async (id) => (await listRow(id))?.current_state ?? null;

/* THE RATIFY HELPER RETURNS THE SHA IT SIGNED, and that is deliberate rather
   than convenient: every expected pin below is THIS value — the hash that went
   into the signed statement — and never a value read back out of the pin column
   or off the published row. The two sides of each pin assertion therefore cannot
   move together, which is the blind-by-construction class this suite is written
   to stay out of. */
const ratify = async (id) => {
  const bundleSha = await shaOf(id);
  const r = rP(await POST(`op=ratify&token=${VERA}`,
    { bundleId: id, expectedSha: bundleSha, sig: signRatify(id, bundleSha) }));
  return { ...r, signedSha: bundleSha };
};

/* ---- documents ---- */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const scalar = (k, v) => (v === undefined || v === null ? [] : [`    ${k}: ${typeof v === "string" ? `"${v}"` : v}`]);
const versionLines = (versions) => {
  const rows = versions.map((v) => ["  - name: \"" + v.name + "\"",
    ...scalar("description", v.description),
    ...scalar("relationship", v.relationship),
    ...scalar("state", v.state ?? "suggested"),
    /* REC-136: an ACCEPTED reading states who accepted it and when, and the one
       a no-project conclusion adopts carries a claim. Absent on V1, so V1's
       lines are exactly what they were. */
    ...scalar("state_by", v.state_by), ...scalar("state_at", v.state_at),
    ...scalar("claim", v.claim),
    ...scalar("hidden", false),
    ...scalar("author", "vera"), ...scalar("at", NOW)].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    ["  - version: \"" + v.name + "\"", ...scalar("ground", g),
     ...scalar("asserted_by", "vera"), ...scalar("at", NOW)].join("\n")));
  /* C-25.15: a ground is a PARTITION OF THE LEGS, so a declared ground with no
     leg belonging to it asserts that nothing is sufficient on its own and is
     refused at the write. Every version here therefore carries its legs. */
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    ["  - version: \"" + v.name + "\"", ...scalar("target", l.target),
     ...scalar("role", "supports"), ...scalar("ground", l.ground),
     ...scalar("grade", l.grade), ...scalar("grade_axis", l.axis),
     ...scalar("grade_source", l.source)].join("\n")));
  return ["basis_versions:", ...rows,
          ...(grounds.length ? ["basis_version_grounds:", ...grounds] : []),
          ...(legs.length ? ["basis_version_legs:", ...legs] : [])];
};
const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
      `    grade: ${l.grade}`, `    grade_axis: ${l.axis}`, `    grade_source: ${l.source}`])]
  : [];
const inquiryMd = (id, { question = `What does ${id} rest on?`, refs = [], legs = [], versions = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs), ...versionLines(versions),
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

let snapSeq = 0;
const promote = async (id, md, type, state = "open", extra = {}) => rP(await POST(`op=promote&token=${VERA}`, {
  bundleId: id, base: extra.base ?? null,
  snapKey: `20260810T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: type, group: "believe-in-oakland",
          current_state: state, created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
  register: extra.register || [],
}));
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (r.ok === false) throw new Error(`promote ${a[0]}: ${JSON.stringify(r)}`);
  return r;
};
/* CORRECTED 2026-09-18 (REC-136, INVESTIGATIVE-SESSION.md §7.1 item 6): a
   conclusion drawn with no project NAMES the accepted reading whose claim it
   adopts, and an unnamed one is refused NO_CLAIM. This helper concluded with no
   reading because the act took none. PUB already carries a reading ("opening
   account") but it is SUGGESTED, claimless, and the reading every version act in
   this suite moves — so it cannot be the adopted one without changing what blocks
   2-5 are about. PUB therefore carries a SECOND reading, V_ADOPT, accepted with a
   claim, written by hand (the shared helper refuses a document that already
   carries basis_versions), and the call names it. FREE is never concluded and is
   unchanged. */
const conclude = async (target, conclusion, falsifier) =>
  rP(await GET(`op=conclude&token=${VERA}&target=${encodeURIComponent(target)}`
    + `&conclusion=${encodeURIComponent(conclusion)}&falsifier=${encodeURIComponent(falsifier)}`
    + adoptedVersionParam()));
const reopen = async (target, reason) =>
  rP(await GET(`op=reopen&token=${VERA}&target=${encodeURIComponent(target)}&reason=${encodeURIComponent(reason)}`));
/* THE CEREMONY IS `op=publish` AT THE CONTROL PLANE — `publishCase()` is the
   store method behind it and `publishcase` is a DO-internal name index.mjs does
   not whitelist. Spelled as the literal a real caller uses, which is also what
   `coverage.mjs` credits. */
/* CORRECTED 2026-08-10 AT THE CASE-2/CASE-3 INTEGRATION, NEVER EXEMPTED, AND THE OLD
   CALL WAS RIGHT WHEN IT WAS WRITTEN. This suite published with no `project` and no
   `roles`, which was the entire shape of `op=publish` until CASE-2 landed DEC-72 in
   parallel with CASE-3. CASE-2 built `publishingproject.mjs` and corrected every suite
   it could SEE — this one did not exist on its branch, which is why the pair went red
   at the merge and not before. Routed through CASE-2's own helper rather than through a
   second hand-rolled project fixture: a second way to make a publishing project is a
   second thing to keep true. **The project is owned by VERA and not by nadia, because CASE-2's
   fence is OWNER-ONLY and vera is the member this suite publishes and ratifies as** — a project
   owned by someone else answers `NO_SUCH_PROJECT`, since a project you cannot see is answered
   exactly as one that does not exist. `allLoadBearing` designates every target load-bearing,
   which is what this suite means — it is about the PIN, and a supporting member would
   be an unrelated variable in a freeze test. */
/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7); the
   old id is the fixture's name and PUBLISHING_PROJECT is the returned, minted id. */
const PUBLISHING_PROJECT = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-case3", owner: "vera",
  name: "PROJ-2026-0300-casepin", created: NOW, updated: LATER });
/* CASE-5b: THE CASE CEREMONY RIDES THIS HELPER. `op=publish` now AUTHORS a case
   document and commits nothing case-side — the case's identity, roster, PINS,
   partition, scope, bar and acknowledgement are committed when a member SIGNS
   that document (op=caseratify). This suite's whole subject is the PIN, and the
   pin is now written by that signature, so the ceremony runs here where a reader
   can see it. `sign: false` leaves it unperformed where a block needs the
   authored-and-unsigned state. `casesign.test.mjs` owns the ceremony itself and
   shares no code path with this helper. */
const publishCase = async (body, { sign = true } = {}) => {
  const r = rP(await POST(`op=publish&token=${VERA}`,
    { project: PUBLISHING_PROJECT, roles: allLoadBearing(body), ...body }));
  if (sign && r && r.ok !== false && r.caseDocument)
    await ratifyCase(async (q, b) => rP(await POST(q, b)), r, { dir, key: "vera", token: VERA });
  return r;
};

/* THE SIX ACT OPS, SPELLED OUT AS LITERALS rather than composed. `coverage.mjs`
   reads `op=<name>` out of suite sources to decide whether a real caller has a
   route, so an op reached only through a template hole reads as UNREACHED —
   the D-43 class arriving through the test rather than through the plane. */
const ACT_OP = {
  accept: "op=versionaccept", reject: "op=versionreject", consider: "op=versionconsider",
  revert: "op=versionrevert", current: "op=versioncurrent", hide: "op=versionhide",
};
/* THE FOUR THAT MOVE A STATE and the two that do not — the split is
   `VERSION_ACT_TO`'s, which is the catalog's own table and not this suite's
   opinion, and it is the exact line the fence is drawn on. */
const MOVERS = ["accept", "reject", "consider", "revert"];
const NON_MOVERS = ["current", "hide"];
const act = async (verb, { target, version = "opening account", q = "" } = {}) =>
  rP(await POST(`${ACT_OP[verb]}&token=${VERA}&target=${encodeURIComponent(target)}`
     + `&version=${encodeURIComponent(version)}${q}`, {}));

const INFO_A = "INFO-2026-3300-memo";
const INFO_B = "INFO-2026-3300-left-out";
const PUB = "INQ-2026-3300-published";
const FREE = "INQ-2026-3300-working";

const V1 = { name: "opening account", relationship: "and",
  description: "The first reading: the memo carries the finding on the paper trail.",
  grounds: ["paper trail"],
  legs: [{ target: INFO_A, ground: "paper trail", grade: "B", axis: "capture", source: "capture" }] };

/* REC-136: the accepted reading PUB's conclusions adopt — see `conclude` above.
   No grade on its leg: absent is undetermined, and a grade here would be a
   strength claim this suite never made. */
const V_ADOPT = { name: ADOPTED_READING, relationship: "and",
  description: "The reading the inquiry's own basis states, adopted when it was concluded.",
  state: "accepted", state_by: "vera", state_at: NOW, claim: ADOPTED_CLAIM,
  grounds: ["the cited record"], legs: [{ target: INFO_A, ground: "the cited record" }] };

const DOC_CAP_SHA = sha("casepin-INFO_A-bytes");
await mustPromote(INFO_A, infoMd(INFO_A), "information", "collected",
  { register: [{ path: "snapshots/source.bin", sha256: DOC_CAP_SHA, bytes: 512, encoding: "binary" }] });
await mustPromote(INFO_B, infoMd(INFO_B), "information", "collected");

const inqBody = (id, versions = [V1]) => inquiryMd(id, { question: "Was the sewer transfer authorised?",
  refs: [INFO_A], legs: [{ target: INFO_A, grade: "B", axis: "capture", source: "capture" }],
  versions });
await mustPromote(PUB, inqBody(PUB, [V1, V_ADOPT]), "inquiry");   /* REC-136: PUB is the one concluded */
await mustPromote(FREE, inqBody(FREE), "inquiry");

const c1 = await conclude(PUB, "The transfer rests on a memo nobody adopted.",
  "An adopted resolution naming the transfer would overturn this.");
if (!c1.ok) throw new Error(`conclude ${PUB}: ${JSON.stringify(c1)}`);

const STMT1 = "This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition 1.";
const e1 = await publishCase({ target: PUB, statement: STMT1,
  scope: "Whether the FY2024 sewer transfer was authorised, on the documents in hand.",
  excluded: [{ target: INFO_B, description: "the FY2023 comparison memo",
               reason: "a records request for it is still outstanding with the City Clerk" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
  biasAcknowledgement: "This group holds a declared position that fund transfers should be adopted in "
                     + "public session; edition 1 reads the FY2024 record through it." });
if (!e1.ok) throw new Error(`publishcase edition 1: ${JSON.stringify(e1)}`);
const rat1 = await ratify(PUB);
/* CORRECTED 2026-09-19 by the D-431 worker: a NAMED FAILURE and the suite's own foot, never a bare throw. Since
   D-431 a finding is ratified only at a sha a RATIFIED case PINS, so control arm (a) — the pin never written —
   is now refused HERE, C-58.2, and the throw this line was ended the module with no tally (the arm read "died
   before its own summary", which names nothing — D-93's class). Now it fails by name and reaches the foot. */
if (!rat1.ok) {
  t("THE FREEZE: edition 1's finding ratifies — at the sha its RATIFIED case pinned (a finding at an unpinned sha is refused C-58.2)",
    [rat1.ok, rat1.reason ?? null], [true, null]);
  console.log(`\ncasepin: ${pass} passed, ${fail} failed`);
  process.exit(1);
}
/* THE EXPECTATION, TAKEN FROM THE SIGNATURE. This is the sha that went into the
   `bio-ratify` statement ssh-keygen signed — captured before anything read a pin
   and independent of every line this item wrote. */
const SIGNED_1 = rat1.signedSha;
const CASE_ID = e1.caseId;

console.log("\n=== CASE-3 / DEC-72 clause 3 · a published case says what it said when it was published ===");
console.log(`  case ${CASE_ID} · finding ${PUB} pinned at ${String(SIGNED_1).slice(0, 12)}… · `
  + `${Object.keys(VERSION_ACT_CHECKS).length} refusals in the version-act registry`);

/* ====================================================================== 1
 * THE MEMBER IS FROZEN BY VERSION HASH, AND AN ANONYMOUS CALLER CAN READ IT.
 * ==================================================================== */
console.log("\n--- 1. the case FREEZES its member at the hash the member signed ---");
{
  const c = await anonCase(`id=${CASE_ID}`);
  const m = (c.findings || [])[0] || {};
  t("the published case answers, at edition 1, with its one member",
    [c.ok !== false, c.edition, (c.findings || []).length], [true, 1, 1]);
  /* THE ITEM'S CENTRAL ASSERTION. `version_sha` is the PIN and `SIGNED_1` is the
     hash ssh-keygen signed — two values with no code path in common. Before this
     item the pin was null on every row in the store and `op=publishedmanifest` said so. */
  t("THE PIN NAMES THE VERSION THE MEMBER SIGNED — (finding id, VERSION HASH, role, ordinal), "
  + "and the expected hash is the one that went into the signed bio-ratify statement",
    [m.bundle_id, m.version_sha, m.version_sha === SIGNED_1], [PUB, SIGNED_1, true]);
  t("and the pin is a REAL sha rather than an empty string a null would also satisfy",
    [typeof m.version_sha, /^[0-9a-f]{64}$/.test(String(m.version_sha))], ["string", true]);
}

/* THE SAME FACT AT THE OTHER DOOR. `op=publishedmanifest` is the reader CASE-1
   built these columns into, and its `production` sentence promised a reader that
   `version_sha` is null "until CASE-3 pins a version". This is that promise being
   kept, asserted through the op that carries the sentence — and it is the PUBLIC
   index, so no credential is involved in either reader. */
{
  const ex = rP(await GET("op=publishedmanifest"));
  const row = (ex.caseMembers || []).find((r) => r.bundle_id === PUB && Number(r.edition) === 1);
  t("op=publishedmanifest's caseMembers row carries the same pin, so the two readers cannot disagree "
  + "about which version the case froze",
    [!!row, row?.version_sha], [true, SIGNED_1]);
  /* CASE-1's OWN WORDS ARE THE EXPECTATION HERE. The shipped `production`
     sentence — written by a different item, before this one — tells a reader
     that a null pin means "the member was rostered without a version being
     pinned, and the finding it names may have moved since". That sentence stays
     TRUE and stays NEEDED, because pre-DEC-72 rows still carry null; what this
     item changes is that a newly published member no longer takes that branch.
     Asserting both halves together is what shows the two items agree rather than
     one having quietly replaced the other's meaning.
     CORRECTED after its first run, and the correction is worth keeping: this arm
     first grepped `production` for "CASE-3 pins a version", which is the wording
     of CASE-1's CODE COMMENT and not of the served string. It went red honestly
     — the arm was asserting against a sentence the op does not publish. */
  t("and the `production` sentence — CASE-1's, not this item's — still explains what a NULL pin "
  + "means, while THIS member's pin is no longer null: the two items agree rather than one having "
  + "replaced the other's meaning",
    [/version_sha` is null the member was rostered without a version being pinned/
       .test(String(ex.production || "")),
     row?.version_sha !== null], [true, true]);
}

/* THE STRUCTURAL HALF, STATED AS STRUCTURAL. The write-once property cannot be
   driven (no caller route reaches a second sha at a published edition), so it is
   pinned against the source and NOT claimed as a reachable refusal.

   ===== CORRECTED 2026-09-10 BY CASE-5b, NEVER EXEMPTED, AND THE PROPERTY MOVED
   RATHER THAN WEAKENED. ====================================================

   IT PINNED: `UPDATE published_case_members SET version_sha=? … WHERE …
   version_sha IS NULL` — CASE-3's predicate, which made a pin unmovable once
   written, and which existed in that shape because the pin had to be written by
   whichever member ratified FIRST, out of its own sha, while the other members'
   shas did not yet exist. CASE-3 said so at the site: *"writing all N pins there
   would mean inventing N-1."*

   WHY IT IS WRONG NOW: there is no such UPDATE any more. The pins are AUTHORED —
   all N of them, in the case document, before anybody signs — and they are
   committed in one statement at `op=caseratify`. Nothing is invented, so the
   defensive predicate has nothing left to defend.

   WHERE THE PROPERTY WENT, AND IT IS STRONGER: the pin is now INSIDE THE BYTES A
   MEMBER SIGNED, and the case document can only be rewritten while it is
   UNSIGNED (`WHERE case_documents.sig_armored IS NULL`). So "the pinned version
   is never mutated" stopped being a predicate on an UPDATE of a projection and
   became a property of a signature over a document — which is the difference
   between a rule a later caller is trusted to respect and one a later caller
   cannot express. Both halves are pinned, because it is the pair that closes it:
   the pin is in the signed document, and the signed document is immutable. */
{
  t("the pins are AUTHORED IN THE CASE DOCUMENT, all of them, in one statement — so the pin is inside the bytes a member signed rather than assembled over N ratifications",
    /version_sha: \$\{pins\.get\(m\) \?\? "null"\}/.test(STORE_SRC), true);
  t("and the case document is WRITE-ONCE ONCE SIGNED — the re-author carries `sig_armored IS NULL`, so no statement in this file can move a pin a signature already covers (NOT driven: there is no caller route to it)",
    /ON CONFLICT\(case_id,edition\) DO UPDATE[\s\S]{0,400}?WHERE case_documents\.sig_armored IS NULL/.test(STORE_SRC),
    true);
}

/* ====================================================================== 2
 * AN EDIT TOUCHING A PUBLISHED VERSION IS REFUSED, AND TOLD TO MINT.
 * ==================================================================== */
console.log("\n--- 2. the four acts that MOVE a reading are refused on a published finding, BY NAME ---");
{
  /* CORRECTED 2026-09-10 (CASE-4 / DEC-72), never exempted. This arm exists to
     prove the arms beneath it are about a PUBLISHED version rather than about a
     document that happened to refuse for some other reason — that purpose has
     not changed, and neither has its value. What changed is what "published"
     looks like on a document: DEC-72 ends `published` as an inquiry lifecycle
     state, so a case member sits at `concluded` and the fact that it IS a member
     is the CASE RELATION. Asserting the state word here would now pin a word the
     machine no longer produces, so the arm asks the relation directly — through
     `op=publishedcase`, the anonymous public read this whole suite is written
     around, which answers only for a case that exists and whose member is
     resolved BY ITS PIN. That is a STRONGER anchor than the state word ever was:
     the old assertion could have passed on a document merely wearing a label. */
  t("the finding really is published, so the arms below are about a published version and not about "
  + "a document that happened to refuse",
    [await stateOf(PUB), (await anonCase(`id=${PUB}`))?.findings?.some((f) => f.bundle_id === PUB)],
    ["concluded", true]);
  const got = {};
  for (const verb of MOVERS)
    got[verb] = await act(verb, { target: PUB, q: "&reason=the%20memo%20was%20superseded" });
  t("op=versionaccept, op=versionreject, op=versionconsider and op=versionrevert are ALL refused, "
  + "each by the SAME name — a fence that only covers the act somebody thought of is not a fence",
    MOVERS.map((v) => got[v].reason),
    ["PUBLISHED_CANNOT_MOVE_VERSION", "PUBLISHED_CANNOT_MOVE_VERSION",
     "PUBLISHED_CANNOT_MOVE_VERSION", "PUBLISHED_CANNOT_MOVE_VERSION"]);
  t("every refusal is ok:false and none of them moved the state it was refused for",
    [...new Set(MOVERS.map((v) => got[v].ok))], [false]);
  /* DEC-49: a refusal inside a governed region owes a code with a canned
     translation, and `civicos-ui/check-refusal-codes.mjs` arm C fails the
     harness on one that does not. The CATALOG is the expectation, not the
     answer — the row is imported at the top of this file. */
  t("the refusal carries the catalog's check number and the catalog's canned translation, read from "
  + "VERSION_ACT_CHECKS rather than from the answer under test",
    [got.accept.check, got.accept.check === VERSION_ACT_CHECKS.PUBLISHED_CANNOT_MOVE_VERSION.check,
     got.accept.translation === VERSION_ACT_CHECKS.PUBLISHED_CANNOT_MOVE_VERSION.translation],
    ["C-25.34", true, true]);
  /* THE REFUSAL MUST NAME THE ROUTE OUT. A member told only "no" has been told
     the case is stuck; DEC-12 built reopening for exactly this, and both
     neighbouring refusals name it. */
  t("and it names the MINT as the route out — reopen, change, publish a new edition — rather than "
  + "leaving the member to conclude the finding is frozen forever",
    [/op=reopen/.test(got.accept.detail), /new edition/.test(got.accept.detail),
     /pick it back up/i.test(VERSION_ACT_CHECKS.PUBLISHED_CANNOT_MOVE_VERSION.translation)],
    [true, true, true]);
  /* THE TWO NEIGHBOURS, asserted as the precedent this fence joins rather than
     described in a comment. If either is ever removed, this arm says so. */
  t("the two neighbouring doors already refused this and are still shut — the fence added here is the "
  + "THIRD on a corridor where two were shut, not a new policy",
    [/PUBLISHED_CANNOT_DIVIDE/.test(STORE_SRC), /PUBLISHED_CANNOT_RESTRUCTURE/.test(STORE_SRC)],
    [true, true]);
}

/* ====================================================================== 3
 * THE OVER-STRICTNESS ARM. A fence tighter than its rule is an undeclared
 * interface change wearing the costume of caution.
 * ==================================================================== */
console.log("\n--- 3. an UNpublished finding's readings still move — an ordinary edit, not a mint ---");
{
  t("the control finding is NOT published, which is what makes the next arm an over-strictness test "
  + "rather than a second copy of block 2", await stateOf(FREE), "open");
  const considered = await act("consider", { target: FREE, q: "&reason=worth%20a%20second%20look" });
  /* THE COMPARISON IS AGAINST THE REFUSAL NAME AND NOT AGAINST `reason` BEING
     ABSENT, and the distinction cost this suite a red run worth keeping: on a
     SUCCESSFUL version act `reason` carries the MEMBER'S OWN PROSE — the reason
     they authored for the move — so `reason == null` is not the shape of success
     here. Asserting the absence of a field that is legitimately present on
     success would have been an arm that passed for the wrong reason. */
  t("op=versionconsider on an UNPUBLISHED finding still SUCCEEDS — the rule is about published "
  + "versions, and a fence wider than its rule is the defect this arm exists to catch",
    [considered.ok, considered.reason === "PUBLISHED_CANNOT_MOVE_VERSION"], [true, false]);
  const state = ((rP(await GET(`op=basisversions&token=${VERA}&id=${encodeURIComponent(FREE)}`)).versions) || [])
    .find((v) => v.name === "opening account")?.state;
  t("and the move LANDED in the record rather than merely being permitted", state, "considering");
  const rejected = await act("reject", { target: FREE, q: "&reason=the%20memo%20turned%20out%20to%20be%20a%20draft" });
  t("op=versionreject on an unpublished finding is likewise untouched", rejected.ok, true);
  t("NEITHER unpublished act was refused with the published fence's name",
    [considered.reason === "PUBLISHED_CANNOT_MOVE_VERSION",
     rejected.reason === "PUBLISHED_CANNOT_MOVE_VERSION"], [false, false]);
}

/* ====================================================================== 4
 * THE MINT: A NEW VERSION JOINS THE CHAIN AND THE PINNED ONE IS UNTOUCHED.
 * ==================================================================== */
console.log("\n--- 4. the edit MINTS a new version on the finding's own chain, and edition 1 is unmoved ---");
{
  const before = await anonCase(`id=${CASE_ID}&edition=1`);
  const beforeM = (before.findings || [])[0] || {};
  await reopen(PUB, "the FY2023 comparison memo arrived and the reading has to be re-worked");
  /* THE ACT THAT WAS REFUSED WHILE PUBLISHED NOW SUCCEEDS — which is what makes
     the fence a DIRECTION rather than a wall, and is the half of "mints a new
     version" that a refusal alone cannot show. */
  const moved = await act("consider", { target: PUB, q: "&reason=the%20comparison%20memo%20changes%20the%20reading" });
  t("once REOPENED, the same act that was refused goes through — the fence routes the member to the "
  + "mint and does not strand the finding",
    [moved.ok, moved.reason === "PUBLISHED_CANNOT_MOVE_VERSION"], [true, false]);
  await conclude(PUB, "The transfer rests on a memo nobody adopted, and the comparison memo confirms it.",
    "An adopted resolution naming the transfer would overturn this.");
  const e2 = await publishCase({ target: PUB,
    statement: "This case covers the FY2024 transfer and, as of edition 2, the FY2023 comparison memo.",
    scope: "Whether the FY2024 sewer transfer was authorised, on the documents in hand.",
    excluded: [{ description: "any 2019 council minutes", reason: "outside the period at issue" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: "We put the revised claims to the City Administrator on 2026-07-05 and print the reply.",
    biasAcknowledgement: "The same declared position on public adoption is unchanged; edition 2 applies it "
                       + "to the FY2023 comparison memo." });
  if (!e2.ok) throw new Error(`publishcase edition 2: ${JSON.stringify(e2)}`);
  const rat2 = await ratify(PUB);
  if (!rat2.ok) throw new Error(`ratify edition 2: ${JSON.stringify(rat2)}`);
  const SIGNED_2 = rat2.signedSha;

  t("edition 2 publishes and ratifies, on the SAME case identity", [e2.edition, rat2.edition, e2.caseId],
    [2, 2, CASE_ID]);
  /* THE MINT. A new version joined the finding's EXISTING chain — the one
     `published_bundles` has always held, keyed (bundle_id, edition) — rather
     than a second chain built for cases. */
  t("THE EDIT MINTED A NEW VERSION rather than overwriting: the hash edition 2 signed is a DIFFERENT "
  + "hash from the one edition 1 signed",
    [SIGNED_2 !== SIGNED_1, /^[0-9a-f]{64}$/.test(SIGNED_2)], [true, true]);
  const after = await anonCase(`id=${CASE_ID}&edition=1`);
  const afterM = (after.findings || [])[0] || {};
  /* THE PROPERTY THE ITEM EXISTS FOR, asserted as an EQUALITY ACROSS TIME: the
     same read, before and after a revision landed, answering identically. */
  t("THE PINNED VERSION WAS NOT MUTATED — edition 1 still names the hash it always named, and still "
  + "carries the same signature, attestation and bytes it was ratified with",
    [afterM.version_sha === SIGNED_1, afterM.version_sha === beforeM.version_sha,
     afterM.bundle_sha === beforeM.bundle_sha, afterM.sig_armored === beforeM.sig_armored,
     after.ratified_at === before.ratified_at],
    [true, true, true, true, true]);
  t("and edition 1's pin did NOT follow the finding forward — it names edition 1's hash and not "
  + "edition 2's, which is the difference between a record of an act and a claim about the present",
    [afterM.version_sha === SIGNED_1, afterM.version_sha === SIGNED_2], [true, false]);
  const latest = await anonCase(`id=${CASE_ID}`);
  const latestM = (latest.findings || [])[0] || {};
  t("edition 2 pins its OWN version, so each edition names the version its members signed",
    [latest.edition, latestM.version_sha === SIGNED_2], [2, true]);
  t("and BOTH editions answer — the chain grew, nothing was replaced", latest.editions, [1, 2]);
}

/* ====================================================================== 5
 * THE SECOND OVER-STRICTNESS ARM: THE TWO ACTS THAT MOVE NO STATE.
 * ==================================================================== */
console.log("\n--- 5. `hide` and `current` are OUTSIDE the fence, and the line is the catalog's own ---");
{
  /* CORRECTED 2026-09-10 (CASE-4 / DEC-72), never exempted — block 2's
     correction, for block 2's reason, and the same stronger anchor. */
  t("the finding is published again, so these arms are about a published version",
    [await stateOf(PUB), (await anonCase(`id=${PUB}`))?.findings?.some((f) => f.bundle_id === PUB)],
    ["concluded", true]);
  /* `hide` IS THE PRUNE FLAG and D-214 / DEC-29(b) rule that pruning HIDES AND
     NEVER DELETES — the version stays in the record and stays queryable, so
     nothing the published bytes assert has moved. Fencing a display setting
     would be a rule wider than the ruling it enforces. */
  const hidden = await act("hide", { target: PUB, q: "&hidden=1" });
  t("op=versionhide is NOT refused on a published finding — pruning hides and never deletes, so no "
  + "claim of the finding has moved",
    [hidden.reason ?? null, hidden.ok], [null, true]);
  /* `current` IS §7's PROJECT stance and its second write lands on the PROJECT.
     It is refused here for its OWN reason (the reading is not accepted), which
     is exactly the point: the published fence did not fire. */
  const cur = await act("current", { target: PUB, q: "&project=PRJ-2026-3300-none" });
  t("op=versioncurrent is refused for its OWN reason and NOT by the published fence — what a project "
  + "says it stands on is not what the finding says",
    [cur.reason !== "PUBLISHED_CANNOT_MOVE_VERSION", cur.reason], [true, cur.reason]);
  t("and the split is the CATALOG's own table rather than this suite's opinion: the fenced acts are "
  + "exactly those VERSION_ACT_TO maps to a state, and the unfenced two are the ones it maps to null",
    /* CORRECTED 2026-09-10 (CASE-4 / DEC-72), never exempted, and the SOURCE
       LITERAL is the only thing that moved. The property this pins — the fence is
       drawn exactly on `VERSION_ACT_TO`'s own split, `to !== null`, and not on
       this suite's opinion — is untouched and is still read off `store.mjs`'s own
       text. What changed is the RIGHT-HAND side of the conjunction: the fence
       asked `b.current_state === "published"` and now asks the CASE RELATION,
       because DEC-72 removed that state. `to !== null` is the half this arm is
       actually about and it is unchanged. */
    [MOVERS.length, NON_MOVERS.length,
     /to !== null && this\.#caseRelationOf\(target\)\.member/.test(STORE_SRC)],
    [4, 2, true]);
}

/* ====================================================================== 6
 * THE DESIGN DOCUMENT IS THE EXPECTATION.
 * ==================================================================== */
console.log("\n--- 6. the expectation is parsed from CASE-AS-PRODUCTION.md, not from this suite ---");
{
  /* IT LOOKS IN BOTH PLACES, because CASE-6's definition of done ARCHIVES this
     document to `docs/archive/` — where `decided.mjs` still scans it — and a
     suite that only knew one path would go red on a correct landing. CASE-1's
     block 3 took the same precaution and it is copied deliberately. */
  const here = fileURLToPath(new URL("../../docs/development/CASE-AS-PRODUCTION.md", import.meta.url));
  const archived = fileURLToPath(new URL("../../docs/archive/CASE-AS-PRODUCTION.md", import.meta.url));
  const path = existsSync(here) ? here : archived;
  const doc = readFileSync(path, "utf8");
  const bullet = (doc.match(/\*\*CASE-3 · version pinning\.\*\*([\s\S]*?)Depends on:/) || [])[1] || "";
  t("the design document is readable and its CASE-3 bullet was found — if this arm goes red the "
  + "expectations below are unanchored and every other arm in this block means nothing",
    bullet.length > 60, true);
  /* THE THREE CLAUSES, READ OUT OF BOB'S DOCUMENT, each bound to an arm above.
     The document was written before this code and this item may not edit it, so
     the two sides cannot move together. */
  t("clause A — the bullet demands members frozen BY VERSION HASH on the finding's EXISTING chain, "
  + "which block 1 drove through op=publishedcase and op=publishedmanifest",
    [/version hash/i.test(bullet), /existing version chain/i.test(bullet)], [true, true]);
  t("clause B — the bullet demands that an edit touching a published version MINTS A NEW VERSION, "
  + "which block 4 drove end to end",
    /mints a new version/i.test(bullet), true);
  t("clause C — the bullet demands that the pinned version is NEVER MUTATED, which block 4 asserted "
  + "as an equality across time over the anonymous read",
    /never mutated/i.test(bullet), true);
  /* AND THE REUSE RULE, which is the constraint the item was given rather than a
     property of the answer: D-21 forbids a second version table, so the pin had
     to name a row on the chain `published_bundles` already holds. */
  /* CORRECTED 2026-09-10 BY CASE-5b, NEVER EXEMPTED. The RULE is untouched —
     D-21 forbids a second version table and the pin must name a row on the chain
     `published_bundles` already holds — and the first half still measures it
     exactly. The second half grepped for the UPDATE that no longer exists,
     because CASE-5b writes all N pins in the roster INSERT out of the signed case
     document rather than one at a time; the column and the chain it names are
     unchanged, which is what this arm is actually about. */
  t("and the chain the pin names is the EXISTING one — no second version table was built, which is "
  + "D-21's rule and the reason the pin is a bundle_sha rather than an id of its own",
    [/CREATE TABLE IF NOT EXISTS case_versions/.test(
       readFileSync(fileURLToPath(new URL("../src/schema.mjs", import.meta.url)), "utf8")),
     /INSERT INTO published_case_members \(case_id,edition,ord,bundle_id,version_sha,role\)/.test(STORE_SRC)],
    [false, true]);
}

/* ============================================================================
 * NEGATIVE CONTROL — RUN 2026-08-10, six arms plus a baseline, each armed ALONE
 * and recorded with what it MEASURED rather than with what it was expected to:
 *   (a) THE FREEZE NEVER HAPPENS — delete the pin write from `publish()`. This is
 *       exactly the state the tree was in BEFORE this item, so the arm measures
 *       the hole it closed.                          MEASURED 24/9.
 *   (b) THE WRITE-ONCE PREDICATE — drop `AND version_sha IS NULL`, intending to
 *       let a later ratification overwrite an existing pin.
 *                                                    MEASURED 32/1 — and the ONE
 *       failure is the STRUCTURAL arm, not a behavioural one. **THAT IS A FINDING
 *       ABOUT THE PLANE AND IT IS KEPT RATHER THAN SMOOTHED.** The pin UPDATE is
 *       keyed (case_id, EDITION, bundle_id), so a later edition writes a later
 *       edition's ROW and can never reach edition 1's; and a second sha at an
 *       edition already published is refused by EDITION_EXISTS long before the
 *       pin write runs. The predicate is therefore genuinely UNREACHABLE — which
 *       is what the site claims in words, now measured instead of argued. It is
 *       kept because two authorities for one version must be incapable of
 *       disagreeing, and it is NOT claimed to be a reachable refusal.
 *   (c) THE MINT IS NOT ENFORCED — remove the `PUBLISHED_CANNOT_MOVE_VERSION`
 *       arm, so an edit touching a published version LANDS instead of being
 *       routed to a new edition.                     MEASURED 29/4.
 *   (d) OVER-STRICTNESS, the direction a control usually forgets — widen the
 *       fence from the four acts that MOVE a state to all six, catching `hide`
 *       (a display prune D-214 rules never deletes) and `current` (a PROJECT's
 *       stance). A fence tighter than its rule is an undeclared interface change
 *       wearing the costume of caution.              MEASURED 30/3.
 *   (e) THE FREEZE IS WRITTEN AND UNREADABLE — drop `version_sha` from
 *       `#caseEditionState`'s roster SELECT. Distinct from (a): the pin is still
 *       committed, and a freeze no reader can see is a separate failure from not
 *       freezing at all.                             MEASURED 28/5.
 *   (f) THE PINNED VERSION IS MUTATED IN PLACE, BY THE ROUTE THAT IS ACTUALLY
 *       REACHABLE — the READ. Serve each member's pin from the finding's LATEST
 *       published edition instead of from the frozen membership row, so edition 1
 *       starts answering with edition 2's hash. **THIS IS THE ARM THIS ITEM
 *       EXISTS FOR, and it was WRITTEN AFTER (b) MEASURED 32/1** — (b) was the
 *       arm the item was told to run, it turned out to be structural, and the
 *       honest response was a second arm that reaches the property behaviourally
 *       rather than a louder claim about the first.  MEASURED 31/2, failing
 *       exactly the two assertions that say the pinned version did not move.
 *
 * RE-RUN 2026-09-19 by the D-431 worker, every restore sha256 MATCH: on the PRISTINE base 7042404e the arms
 * read baseline 34/0 · a 23/11 · b 34/0 · c 30/4 · d 31/3 · e 29/5 · f 32/2 (the b and figure drifts
 * predate D-431). On D-431's tree arm (a) first DIED with no tally — the unpinned finding is refused
 * C-58.2 at edition 1's ratification and a bare throw ended the module — so that throw became a named
 * assertion that reaches the foot: a 0/1, naming "THE FREEZE"; every other arm identical to the base.
 *
 * THE BASELINE ARM ran first and measured 33 passed, 0 failed. It carries no
 * ordinal because it arms nothing, and it is not decoration: it is what
 * distinguishes six-arms-working from six-arms-broken.
 *
 * Driver: `node test/casepin.control.mjs [arm]` — COMMITTED, so the arms re-run
 * in one step. Every arm is armed ALONE with every other defence held open,
 * against a uniquely-named per-arm pristine copy taken inside this worktree;
 * every restore above reported MATCH / IDENTICAL / ok on content AND sha256.
 *
 * THE PROSE GOES AFTER THE LIST AND THAT IS NOT A STYLE CHOICE: `coverage.mjs`
 * reads the arms out of the paragraph the `NEGATIVE CONTROL` marker OPENS, so a
 * paragraph between the marker and the list makes the declaration read NULL, the
 * suite leaves `classified` entirely and `--strict` exits 1. Marker, then the
 * list, then prose. This block was written the other way round first and the
 * register caught it — which is the instrument doing its job, and the reason the
 * order is recorded here rather than silently obeyed.
 * ========================================================================== */

/* THE TALLY AND THE EXIT GO LAST, AFTER THE NEGATIVE-CONTROL BLOCK, AND THAT
   ORDER IS LOAD-BEARING RATHER THAN TIDY. `hygiene.test.mjs` reads the LAST 400
   BYTES of every suite to check it ends on its own result, so a NEGATIVE CONTROL
   block sitting after the exit call pushes the exit out of the window and the
   battery goes red on a suite that is entirely correct. CASE-1 paid for exactly
   this one item earlier and recorded it; this suite hit it anyway on its first
   full battery run (162/166, exit 4) and is placed this way because of it.
   `mf.dispose()` for the same reason one arm up: every workerd instance is shut
   down, and hygiene counts `.dispose()` against `new Miniflare(`. */
await mf.dispose();
console.log(`\ncasepin: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
