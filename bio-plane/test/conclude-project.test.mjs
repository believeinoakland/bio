/* NEGATIVE CONTROL: RUN BY `test/conclude-project.control.mjs` (a `.control.mjs`, not discovered by the battery, because it EDITS src/store.mjs while it runs). Each arm is armed ALONE, restored by cp from a per-arm pristine copy and verified by sha256 AND cmp. DECLARED before arming:
   (a) COLLAPSE THE PER-PROJECT RECORD TO ONE SHARED STATE — `#conclusionOf` ignores the project it was asked about and answers from the FIRST project row it finds that concluded the inquiry (the liar's shape: one conclusion, echoed to every project). MUST FAIL: §1's two-project arms (one project reads the other's claim) and every read of a project that concluded nothing. MUST NOT FAIL: §2's refusal and nothing-written arms, §3's legacy arms.
   (b) REMOVE THE NO_CLAIM REFUSAL — the `!claimText` clause dropped from the adoption check, so a reading with no claim is adopted with an empty claim. MUST FAIL: §2's no-claim-on-the-reading arm and its nothing-was-written arm. MUST NOT FAIL: §1, §3.
   (c) BACK-FILL THE LEGACY CLAIM — `#undeterminedClaim` answers the conclusion text as the claim. MUST FAIL: §3. MUST NOT FAIL: §1, §2.
   (d) OVER-STRICTNESS: the suite's over-strictness arm, which PASSES on the real code — a project concluding an inquiry whose OWN state is already `concluded` (a legacy/no-project conclusion) is accepted and the inquiry's own conclusion is untouched — is armed by making the fence tighter than its rule (the `pid && current_state === concluded` allowance removed). MUST FAIL: that arm alone. MUST NOT FAIL: everything else.
   RUN 2026-09-18 by the REC-124 worker (`node test/conclude-project.control.mjs` from `bio-plane/`), every restore sha256 MATCH and content IDENTICAL: baseline 43/0 · (a) 35/8 — A's own read, the two-reads-differ arm, the concluded-nothing-reads-null arm, the item-3 notice arms, the commentary arm, the re-conclude arm and E/D-read-nothing all FAILED; B's own read PASSED under the arm, because the collapsed shared state happened to BE B's (ORDER BY bundle_id picks `budget`), which is exactly why the suite asserts BOTH projects and the difference between them rather than either alone · (b) 40/3 — the no-claim-on-the-reading refusal, nothing-was-written and E-reads-nothing FAILED, as declared · (c) 41/2 — both §3 claim arms FAILED, as declared · (d) 42/1 — the over-strictness arm FAILED, which is the proof the arm can see a fence tighter than its rule. Every arm AS DECLARED; the MUST-NOT halves held.
   REC-136 (§7.1 items 6-7) EXTENDED THIS CONTROL, arms re-anchored (a, c) and added (e, f, g); DECLARED before arming, each ALONE:
   (a)-(d) as above, over the REC-136 suite. (a) MUST FAIL the two-project arms and the history arms that read a project's own record; (b) MUST FAIL §2's claimless-reading arm; (c) MUST FAIL §3's two claim arms; (d) MUST FAIL the over-strictness arm alone.
   (e) RESTORE REPLACE-THE-ROW — `#appendConclusionEntry` replaces the project's earlier entry for the question instead of appending (REC-124's writer). MUST FAIL: §1's both-conclusions-readable arms and §5's THREE-ENTRIES arm (the history arm). MUST NOT FAIL: §2's refusals, §3, §3b.
   (f) DROP THE VERSION REQUIREMENT — the no-project `!vname` refusal removed and the adoption check skipped when no reading is named, so a no-project conclude with no reading concludes (REC-124's behaviour). MUST FAIL: §2's "NO PROJECT AND NO VERSION NAMED" arm and its nothing-was-written arm (INQ's own state then moves, which may cascade into later §1-style reads of INQ). MUST NOT FAIL: §3b, §5's project-history arms.
   (g) C-5.1 BLIND TO `conclusions` — the append-only check reads `state_history` only. MUST FAIL: §5's op=audit arm alone.
   RUN 2026-09-18 by the REC-136 worker (`node test/conclude-project.control.mjs` from `bio-plane/`), every restore sha256 MATCH and content IDENTICAL: baseline 75/0 · (a) 64/11 — the two-project reads, the notices, the re-conclude and NOTHING-WAS-ERASED arms, never-concluded-has-NOTHING_TO_WITHDRAW and the withdrawn-notice arm FAILED (the echoed shared state is one project's record read as everyone's) · (b) 69/6 — every claimless/suggested-reading door and both nothing-written arms FAILED · (c) 73/2 — both §3 claim arms · (d) 74/1 — the over-strictness arm alone · (e) 66/9 — NOTHING-WAS-ERASED, A's-bytes-carry-both, THREE-ENTRIES-IN-ORDER, dated-and-authored, stance-is-last, B's-bytes-carry-three, conclude-again, and the tamper's own fixture and audit arms FAILED: the history arms see the liar the stance arms cannot · (f) 72/3 — the no-version arm, NOTHING-WAS-WRITTEN, and (cascade, as declared) the next door on the now-concluded INQ · (g) 74/1 — the op=audit arm alone. Every arm AS DECLARED. ARM (f) CAME BACK WRONG FIRST: its first draft referenced `legs` before conclude() declares it, the armed call threw, and NOTHING-WAS-WRITTEN stayed green — found by that surprising green, corrected in the driver (the finding is recorded at the arm).
 * ========================================================================= */
/* REC-124 — A CONCLUSION BELONGS TO THE PROJECT'S RELATIONSHIP WITH THE
 * INQUIRY (INVESTIGATIVE-SESSION.md §7.1, BOB #15, 2026-09-18).
 *
 * HOW A LIAR PASSES THIS, stated before what it checks: store ONE shared claim
 * on the inquiry and echo it to every project that asks. If both projects adopt
 * the SAME words, every per-project read agrees and the lie is invisible. So the
 * two projects here stand on two DIFFERENT readings carrying two DIFFERENT
 * claims, and each must read back its OWN — and the inquiry's bytes must not
 * move at all.
 *
 * WHAT IS DRIVEN, all through the ops as a member:
 *  1. Two projects sharing one inquiry each conclude with their own adopted
 *     claim; each project's read shows its own; the inquiry's bytes and state
 *     are byte-identical before and after; each conclusion is a dated row in
 *     the PROJECT's own frontmatter; the other project is TOLD (a FINDING) and
 *     not moved.
 *  2. Concluding with no claim is refused NO_CLAIM, and nothing is written —
 *     for every door: a project that does not draw on the question, one that
 *     stands on no reading, one whose reading states no claim, and commentary
 *     with no project. A free conclusion text beside a project is refused
 *     CONCLUSION_IS_THE_CLAIM.
 *  3. A legacy (no-project) conclusion reads claim-UNDETERMINED, stated, and is
 *     never back-filled from its conclusion text; no project inherits it.
 *  4. Commentary is attributed, labelled not-evidence, and never enters the
 *     strength pair or the legs.
 *
 * REC-136 (§7.1 items 6-8, BOB #15, 2026-09-18) added, driven the same way:
 *  2. (more doors) A NO-PROJECT conclude naming no reading, an uncarried one, an
 *     accepted one with no claim, or one only suggested is refused NO_CLAIM and
 *     writes nothing; a project naming a reading other than the one it stands
 *     on is refused too.
 *  3b. A no-project conclusion NAMING its reading adopts that reading's claim
 *     word for word (answer, read and bytes); no project inherits it; a
 *     HAND-AUTHORED adoption its reading does not bear out reads UNDETERMINED.
 *  5. Conclude, WITHDRAW, conclude again leaves THREE entries readable in
 *     order, each dated and authored, the stance the last. HOW A LIAR PASSES:
 *     keep only the latest entry — every "the stance is right" assertion still
 *     passes. So the arm reads the WHOLE history, and §1's re-conclude reads
 *     both of A's conclusions. The withdrawal's refusals (no reason, a machine,
 *     no project, nothing to withdraw, withdrawing twice) write nothing; the
 *     other projects stop being told; and a promote that rewrites the history
 *     is named by op=audit (C-5.1).
 *
 * WHAT IT CANNOT SEE: op=publish / op=caseratify still read the INQUIRY's own
 * state (§7.1 item 4 is NOT built by REC-124 — said in the report), so nothing
 * here drives a project's conclusion into a case. The sharing edge is
 * hand-authored into `references[]`, REC-72's open finding (current.test.mjs).
 * ========================================================================= */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { classOfKind, QUEUE_CONDITION_KINDS } from "../src/queuestate.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const S = (v) => (typeof v === "string" ? v : null);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r124", MEMBER_TOKEN: "mem-r124", PROBE_TOKEN: "prb-r124",
              DAEMON_TOKEN: "dmn-r124", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-r124",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body) })).json());

const enrol = async (memberId, role, caps) => {
  const add = await POST(`op=memberadd&token=adm-r124`,
    { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  if (!add.ok) throw new Error(`memberadd ${memberId}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* An ADMINISTRATOR, current.test.mjs's reason: one credential drives both teams'
   acts. Nothing below concludes anything from this credential's reach. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);

/* ------------------------------------------------------------- FIXTURES */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const scalar = (k, v) => v === null ? [`    ${k}: null`]
  : v === undefined ? [] : typeof v === "boolean" ? [`    ${k}: ${v}`]
  : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  const rows = versions.map((v) => ['  - name: "' + v.name + '"',
    ...scalar("description", v.description), ...scalar("relationship", "and"),
    ...scalar("state", v.state ?? "suggested"),
    ...(v.state === "accepted" ? [...scalar("state_by", "ruth"), ...scalar("state_at", NOW)] : []),
    ...scalar("derived_from", null), ...scalar("hidden", false),
    ...scalar("claim", v.claim), ...scalar("author", "ruth"), ...scalar("at", NOW)].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    ['  - version: "' + v.name + '"', ...scalar("ground", g),
     ...scalar("asserted_by", "ruth"), ...scalar("at", NOW)].join("\n")));
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    ['  - version: "' + v.name + '"', ...scalar("target", l.target),
     ...scalar("role", "supports"), ...scalar("ground", l.ground),
     ...scalar("grade", "B"), ...scalar("grade_axis", "capture"),
     ...scalar("grade_source", "capture")].join("\n")));
  return ["basis_versions:", ...rows,
          ...(grounds.length ? ["basis_version_grounds:", ...grounds] : []),
          ...(legs.length ? ["basis_version_legs:", ...legs] : [])];
};
/* REC-136: `concluded` authors a conclusion INTO THE BYTES, the way an inquiry
   concluded before §7.1 item 6 carries one — the legacy shape, which the act
   can no longer produce (it now refuses a no-project conclusion that names no
   reading). `extra` is raw frontmatter lines, for a hand-authored adoption. */
const inquiryMd = (id, { versions = [], basis = [], concluded = null, extra = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Did the sewer fund transfer follow the adopted process?"`,
  ...(concluded
    ? ["current_state: concluded", "prior_state: open", `conclusion: "${concluded.conclusion}"`,
       `falsifier: "${concluded.falsifier}"`]
    : ["current_state: open", "prior_state: null"]),
  ...extra,
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(basis.length ? ["references:", ...basis.flatMap((b) => [`  - target: ${b}`,
      "    rel: cites", "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(basis.length ? ["basis:", ...basis.flatMap((b) => [`  - target: ${b}`, "    role: supports"])] : []),
  ...versionLines(versions),
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
/* CORRECTED 2026-09-18 (REC-141, IC-158): creation bytes of a project carry no `id:` line
   (PROJECT_ID_IN_BYTES), so `id` null writes none; the plane mints the id and writes it. */
const projectMd = (id, { title, cites = [] } = {}) => ["---",
  ...(id ? [`id: ${id}`] : []), "object_type: project", `title: "${title}"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  ...(cites.length
    ? ["references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
    : ["references: []"]),
  "required_strength:", "  capture: B", "  connection: C",
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");

let snapSeq = 0;
const promote = async (id, text, type, state = null, base = null) => POST(`op=promote&token=${RUTH}`, {
  bundleId: id, base,
  snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "believe-in-oakland",
          current_state: state ?? (type === "inquiry" ? "open" : type === "project" ? "forming" : "collected"),
          created: NOW, last_updated: LATER } });
const mustPromote = async (id, text, type, state = null) => {
  const r = await promote(id, text, type, state);
  if (!r.ok) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};
/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7)
   and a creation naming one is refused PROJECT_ID_SUPPLIED. The creation names no bundleId; the id
   is read from the answer. `name` (the id the suite used to choose) keeps the meta title and the
   snapshot key's `PROJ-…` prefix, which the tamper arm's key-ordering comment relies on. */
const createProject = async (name, text) => {
  const r = await POST(`op=promote&token=${RUTH}`, {
    base: null, snapKey: `${name}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland",
            current_state: "forming", created: NOW, last_updated: LATER } });
  if (!r.ok || typeof r.bundleId !== "string") throw new Error(`create ${name}: ${JSON.stringify(r).slice(0, 800)}`);
  return r.bundleId;
};
const shaOf = async (id) => (await GET(`op=list&token=${RUTH}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;
const stateOf = async (id) => (await GET(`op=list&token=${RUTH}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.current_state ?? null;
const textOf = async (id) => S((await GET(`op=file&token=${RUTH}&id=${id}&path=bundle.md`))?.text);

const LEDGER = "INFO-2026-4124-ledger", MINUTES = "INFO-2026-4124-minutes", AUDIT = "INFO-2026-4124-audit";
for (const d of [LEDGER, MINUTES, AUDIT]) await mustPromote(d, infoMd(d), "information");

const INQ = "INQ-2026-4124-sewer-transfers";      /* the SHARED question */
const LEG = "INQ-2026-4124-legacy-question";      /* concluded the old way, no project */
/* A and B share INQ and stand on DIFFERENT readings with DIFFERENT claims — the
   liar's defence. C never cites INQ. D cites INQ and stands on nothing. E stands
   on a reading that states no claim. */
let A, B, C, D, E; /* minted below (REC-141) */
const CLAIM_A = "The transfer followed the process the council adopted in 2024.";
const CLAIM_B = "The transfer bypassed the council vote the adopted process requires.";
const VA = { name: "paper trail", claim: CLAIM_A,
  description: "The ledger and the minutes together show the transfer was authorised.",
  grounds: ["paper trail"],
  legs: [{ target: LEDGER, ground: "paper trail" }, { target: MINUTES, ground: "paper trail" }] };
const VB = { name: "the audit", claim: CLAIM_B,
  description: "The audit shows the transfer happened without the required vote.",
  grounds: ["the audit"], legs: [{ target: AUDIT, ground: "the audit" }] };
const VN = { name: "no claim stated", claim: undefined,
  description: "A reading composed before anybody stated what it claims.",
  grounds: ["the ledger alone"], legs: [{ target: LEDGER, ground: "the ledger alone" }] };
const VL = { name: "legacy reading", claim: "The legacy question has a claimed answer.",
  description: "A reading of the legacy question, stated after it was concluded the old way.",
  grounds: ["the ledger alone"], legs: [{ target: LEDGER, ground: "the ledger alone" }] };

A = await createProject("PROJ-2026-4124-oversight", projectMd(null, { title: "Oversight", cites: [INQ, LEG] }));
B = await createProject("PROJ-2026-4124-budget", projectMd(null, { title: "Budget", cites: [INQ] }));
C = await createProject("PROJ-2026-4124-unrelated", projectMd(null, { title: "Unrelated" }));
D = await createProject("PROJ-2026-4124-undecided", projectMd(null, { title: "Undecided", cites: [INQ] }));
E = await createProject("PROJ-2026-4124-claimless", projectMd(null, { title: "Claimless", cites: [INQ] }));
await mustPromote(INQ, inquiryMd(INQ, { versions: [VA, VB, VN], basis: [LEDGER, MINUTES] }), "inquiry");
/* REC-136: LEG is concluded IN ITS OWN BYTES, the way every conclusion written
   before §7.1 item 6 is — the act can no longer write one that names no
   reading. Its reading VL is authored accepted so project A can stand on it. */
const LEGACY_TEXT = "The legacy transfer was authorised.";
await mustPromote(LEG, inquiryMd(LEG, { versions: [{ ...VL, state: "accepted" }], basis: [LEDGER],
  concluded: { conclusion: LEGACY_TEXT, falsifier: "a rescinding minute" } }), "inquiry", "concluded");
/* NP is concluded by the act with NO project, naming reading VNP (§7.1 item 6);
   NP2 carries the readings the refusal arms name — one accepted with no claim,
   one only suggested. FORGED is concluded in its bytes with an adoption its
   named reading does not bear out. */
const NP = "INQ-2026-4136-no-project", NP2 = "INQ-2026-4136-no-project-refusals",
      FORGED = "INQ-2026-4136-forged-adoption";
const CLAIM_NP = "The ledger shows the transfer was booked before the council met.";
const VNP = { name: "booked early", claim: CLAIM_NP, state: "accepted",
  description: "The ledger alone, read for the booking date.",
  grounds: ["the ledger alone"], legs: [{ target: LEDGER, ground: "the ledger alone" }] };
const VNP_NOCLAIM = { name: "unclaimed", claim: undefined, state: "accepted",
  description: "A reading nobody has stated a claim for.",
  grounds: ["the ledger alone"], legs: [{ target: LEDGER, ground: "the ledger alone" }] };
const VNP_SUGGESTED = { name: "only suggested", claim: "A claim nobody has accepted yet.",
  description: "A reading still only suggested.",
  grounds: ["the ledger alone"], legs: [{ target: LEDGER, ground: "the ledger alone" }] };
await mustPromote(NP, inquiryMd(NP, { versions: [VNP], basis: [LEDGER] }), "inquiry");
await mustPromote(NP2, inquiryMd(NP2, { versions: [VNP_NOCLAIM, VNP_SUGGESTED], basis: [LEDGER] }), "inquiry");
await mustPromote(FORGED, inquiryMd(FORGED, { versions: [VNP], basis: [LEDGER],
  concluded: { conclusion: "It was booked early.", falsifier: "a later booking entry" },
  extra: [`conclusion_version: "booked early"`, `conclusion_claim: "A claim the reading never stated."`] }),
  "inquiry", "concluded");

const enc = encodeURIComponent;
const accept = async (version, target = INQ) =>
  POST(`op=versionaccept&token=${RUTH}&target=${enc(target)}&version=${enc(version)}`
     + `&reason=${enc("the evidence holds")}`, {});
const makeCurrent = async (project, version, target = INQ) =>
  POST(`op=versioncurrent&token=${RUTH}&target=${enc(target)}&version=${enc(version)}&project=${enc(project)}`, {});
const conclude = async (params, tok = RUTH) =>
  POST(`op=conclude&token=${tok}&` + Object.entries(params).map(([k, v]) => `${k}=${enc(v)}`).join("&"), {});
const versionsOf = async (id, project) =>
  GET(`op=basisversions&token=${RUTH}&id=${enc(id)}&limit=50${project ? `&project=${enc(project)}` : ""}`);
const conclusionOf = async (project, id = INQ) => {
  const r = await versionsOf(id, project) || {};
  return Object.prototype.hasOwnProperty.call(r, "conclusion") ? r.conclusion : "FIELD-ABSENT";
};
/* REC-136: the number of conclusion-record ENTRIES for the shared question in a
   project's bytes. An entry is an `- inquiry:` row whose next line is its `act`
   — the project's CURRENT pointer block carries `- inquiry:` rows too, which is
   why REC-124's count of the bare row read ">= 2" rather than an exact figure. */
const entriesIn = (text) => (String(text).match(/  - inquiry: "INQ-2026-4124-sewer-transfers"\n    act: "/g) || []).length;
const mustOk = (label, r) => { if (!r || r.ok !== true) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 600)}`); return r; };

for (const v of [VA.name, VB.name, VN.name]) mustOk(`accept ${v}`, await accept(v));
mustOk("A stands on VA", await makeCurrent(A, VA.name));
mustOk("B stands on VB", await makeCurrent(B, VB.name));
mustOk("E stands on VN", await makeCurrent(E, VN.name));
mustOk("A stands on VL of the legacy question", await makeCurrent(A, VL.name, LEG));

/* ====================================================================== 1 */
console.log("\n--- 1. two projects, one shared question, each concludes with ITS OWN claim ---");
{
  const inqShaBefore = await shaOf(INQ);
  const inqTextBefore = await textOf(INQ);
  const strengthBefore = await GET(`op=versionstrength&token=${RUTH}&id=${INQ}&version=${enc(VA.name)}`);
  t("the fixture is real: the shared question exists, is open, and both claims are distinct and non-empty",
    [!!inqShaBefore, await stateOf(INQ), CLAIM_A !== CLAIM_B && CLAIM_A.length > 20], [true, "open", true]);

  const COMMENT = "Worth asking the clerk whether the 2024 resolution was ever re-adopted.";
  const ra = await conclude({ target: INQ, project: A, falsifier: "a council minute rescinding the 2024 process",
                              commentary: COMMENT });
  t("A concludes: accepted, the relationship is A's, and the claim ADOPTED is VA's, verbatim",
    [ra.ok, ra.project, ra.relationship, ra.claim?.state, ra.claim?.text, ra.version],
    [true, A, "project", "adopted", CLAIM_A, VA.name]);
  t("and the answer says the shared inquiry was NOT moved",
    [ra.inquiry_moved, ra.inquiry_state], [false, "open"]);
  const rb = await conclude({ target: INQ, project: B, falsifier: "a recorded council vote on the transfer" });
  t("B concludes: accepted, and ITS claim is VB's — a different claim from A's",
    [rb.ok, rb.project, rb.claim?.text, rb.version], [true, B, CLAIM_B, VB.name]);

  const ca = await conclusionOf(A), cb = await conclusionOf(B);
  t("A's read shows A's OWN conclusion (VA's claim), through op=basisversions&project=",
    [ca?.project, ca?.state, ca?.version, ca?.claim, ca?.claim_state], [A, "concluded", VA.name, CLAIM_A, "adopted"]);
  t("B's read shows B's OWN conclusion (VB's claim) — NOT A's, which is the arm a shared-state liar fails",
    [cb?.project, cb?.version, cb?.claim], [B, VB.name, CLAIM_B]);
  t("the two reads differ in the claim concluded",
    ca?.claim !== cb?.claim, true);
  t("a project drawing on the question that concluded NOTHING reads null, never another team's (§7.1 item 4)",
    await conclusionOf(D), null);
  t("an unnamed project gets no `conclusion` field at all, CURRENT's rule — there is no default project",
    await conclusionOf(null), "FIELD-ABSENT");

  t("THE SHARED INQUIRY'S BYTES ARE BYTE-IDENTICAL after both conclusions, and its state is still open",
    [await shaOf(INQ) === inqShaBefore, (await textOf(INQ)) === inqTextBefore, await stateOf(INQ)],
    [true, true, "open"]);
  t("and the inquiry's own conclusion (the no-project relationship's) is still null — nobody concluded there",
    (await versionsOf(INQ))?.no_project_conclusion, null);

  const aText = await textOf(A) || "";
  t("the conclusion is a DATED, AUTHORED row in the PROJECT's own frontmatter — never a settings row",
    /* REC-136: every entry now carries its `act` (item 7's append-only history). */
    [/\nconclusions:\n  - inquiry: "INQ-2026-4124-sewer-transfers"\n    act: "concluded"\n    version: "paper trail"\n    claim: "The transfer followed the process the council adopted in 2024\."/.test(aText),
     /\n    by: "ruth"\n/.test(aText), /\n    at: "20\d\d-/.test(aText)], [true, true, true]);
  t("and the act is in A's Session Log, naming the claim adopted",
    /* CORRECTED 2026-09-18 (REC-141): re-pointed from the literal id at A's minted id. */
    new RegExp(`### Session [^\\n]+ \\| Concluded \\| ruth\\nTrigger: op=conclude on INQ-2026-4124-sewer-transfers for ${A}\\n[^\\n]*\\nClaim: The transfer followed`).test(aText), true);
  t("B's own bytes carry B's claim and NOT A's",
    [(await textOf(B) || "").includes(CLAIM_B), (await textOf(B) || "").includes(CLAIM_A)], [true, false]);

  /* ---- item 3: TOLD, NEVER MOVED */
  const q = await GET(`op=queue&token=${RUTH}&limit=500`);
  const items = (q && Array.isArray(q.items) ? q.items : [])
    .filter((i) => i && i.kind === "shared-inquiry-concluded-by-another-project");
  const aboutA = items.find((i) => i.subject?.id === A), aboutB = items.find((i) => i.subject?.id === B);
  t("the kind is a FINDING in the plane's own catalogue and never a mutable CONDITION (§7's reason)",
    [classOfKind("shared-inquiry-concluded-by-another-project"),
     "shared-inquiry-concluded-by-another-project" in QUEUE_CONDITION_KINDS], ["FINDING", false]);
  t("each conclusion is TOLD to the other projects: one item per concluding project, naming its reading",
    [!!aboutA, aboutA?.basis?.version, !!aboutB, aboutB?.basis?.version], [true, VA.name, true, VB.name]);
  t("A's item is NOT filed under A (declared exclusion) and IS filed under B",
    [(aboutA?.case?.ancestors || []).some((x) => x.id === A),
     (aboutA?.case?.ancestors || []).some((x) => x.id === B),
     aboutA?.case?.excluded?.[0]?.id], [false, true, A]);
  t("and it enumerates where the others stand — B concluded on a different reading, D has not concluded",
    (aboutA?.basis?.elsewhere || []).filter((e) => e.project === B || e.project === D)
      .map((e) => [e.project, e.state, e.version]).sort(),
    /* CORRECTED 2026-09-19 (REC-141, BOB #16): minted ids are OPAQUE, so B and D no longer sort in creation order —
       both sides are sorted; the claim is WHICH projects stand where, not their order. */
    [[B, "concluded", VB.name], [D, "not_concluded", null]].sort());
  /* CORRECTED 2026-09-23 by D-125, never exempted. This pinned "a member CANNOT
     mute it", and BOB #26 ruled on 2026-09-22 (NOTIFICATIONS.md "MARKED AS
     HANDLED", DEC-10) that a member MAY mute a FINDING for themselves: the mute
     is keyed on the member and writes no disposition, so the team is still told.
     Driven now: accepted, nothing of the record written, then undone so RUTH's
     feed stays what the rest of this suite reads. */
  const mute = await POST(`op=queuemute&token=${RUTH}`, { case: B, kinds: ["shared-inquiry-concluded-by-another-project"] });
  t("a member MAY mute it for themselves, and the mute writes nothing of the record (D-125)",
    [mute?.ok, mute?.wrote], [true, { queue_state: 1, tasks: 0, proposal_dispositions: 0, bundles: 0 }]);
  await POST(`op=queuemute&token=${RUTH}`, { case: B, kinds: ["shared-inquiry-concluded-by-another-project"], unmute: true });
  t("and being told moved nothing: B's stance and conclusion are exactly as B left them",
    [(await versionsOf(INQ, B))?.current?.version, (await conclusionOf(B))?.claim], [VB.name, CLAIM_B]);

  /* ---- 4: COMMENTARY IS ATTRIBUTED AND NEVER EVIDENCE */
  console.log("\n--- 4. commentary is attributed, labelled, and never evidence or strength ---");
  t("commentary reads back ATTRIBUTED to its author and labelled not-evidence",
    [ca?.commentary?.text, ca?.commentary?.by, ca?.commentary?.evidence], [COMMENT, "ruth", false]);
  const strengthAfter = await GET(`op=versionstrength&token=${RUTH}&id=${INQ}&version=${enc(VA.name)}`);
  t("the strength pair over the adopted reading is IDENTICAL before and after the commented conclusion",
    JSON.stringify(strengthAfter) === JSON.stringify(strengthBefore) && strengthBefore?.ok !== false, true);
  t("and the commentary text appears nowhere in the strength answer or the reading's legs",
    [JSON.stringify(strengthAfter).includes("clerk"),
     JSON.stringify((await versionsOf(INQ))?.versions || []).includes("clerk")], [false, false]);
  t("B concluded with no commentary, and reads null rather than an empty string",
    cb?.commentary, null);

  /* ---- a RE-conclude APPENDS and names the entry it follows.
     CORRECTED 2026-09-18 by REC-136 (INVESTIGATIVE-SESSION.md §7.1 item 7, BOB
     #15). This arm read "a RE-conclude replaces the row" and asserted ONE row
     per question — it pinned the defect: replacing the row ERASED the
     conclusion it replaced, and DEC-19 as Bob ruled it keeps "a record of the
     attestation and reversal". It now asserts that BOTH conclusions stay
     readable, in order, and that the stance is the later one. */
  mustOk("A moves to VB", await makeCurrent(A, VB.name));
  const ra2 = await conclude({ target: INQ, project: A, falsifier: "a recorded council vote on the transfer" });
  t("A re-concluding on a different reading adopts THAT claim and names the entry it FOLLOWS",
    [ra2.ok, ra2.claim?.text, ra2.prior?.act, ra2.prior?.claim, ra2.prior?.version, ra2.history_length],
    [true, CLAIM_B, "concluded", CLAIM_A, VA.name, 2]);
  const ha = (await versionsOf(INQ, A)) || {};
  t("NOTHING WAS ERASED: A's history carries BOTH conclusions, in the order made, and the stance is the later",
    [(ha.conclusion_history || []).map((e) => [e.act, e.version, e.claim]), ha.conclusion_stance,
     ha.conclusion?.version],
    [[["concluded", VA.name, CLAIM_A], ["concluded", VB.name, CLAIM_B]], "concluded", VB.name]);
  t("and A's own bytes carry both entries for INQ, the first one byte-for-byte where it was",
    [entriesIn((await textOf(A)) || ""), ((await textOf(A)) || "").includes('    claim: "' + CLAIM_A + '"')],
    [2, true]);
  t("and B was not moved by A's second act either", (await conclusionOf(B))?.claim, CLAIM_B);
}

/* ====================================================================== 2 */
console.log("\n--- 2. concluding with no claim is refused NO_CLAIM, and nothing is written ---");
{
  const shas = async () => [await shaOf(INQ), await shaOf(C), await shaOf(D), await shaOf(E), await shaOf(A)];
  const before = await shas();
  const cases = [
    ["a project that does not draw on the question", { target: INQ, project: C, falsifier: "x" }],
    ["a project that stands on NO reading", { target: INQ, project: D, falsifier: "x" }],
    ["a project whose reading states NO CLAIM", { target: INQ, project: E, falsifier: "x" }],
    ["commentary with no project (nothing adopted to comment beyond)",
      { target: INQ, conclusion: "It did.", falsifier: "x", commentary: "a note", version: VA.name }],
    /* REC-136 / §7.1 item 6: A NO-PROJECT CONCLUSION NAMES ITS READING. */
    ["NO PROJECT AND NO VERSION NAMED (§7.1 item 6 — the arm the version requirement's control breaks)",
      { target: INQ, conclusion: "It did.", falsifier: "x" }],
    ["no project, naming a reading the inquiry does not carry",
      { target: INQ, conclusion: "It did.", falsifier: "x", version: "no such reading" }],
    ["a project naming a reading OTHER than the one it stands on",
      { target: INQ, project: B, falsifier: "x", version: VA.name }],
  ];
  for (const [label, p] of cases) {
    const r = await conclude(p);
    t(`${label}: refused NO_CLAIM BY NAME, with a detail naming the door (the canned translation is C-33.34's row in bio-checks.mjs, which the DEC-49 guard holds)`,
      [r?.ok, r?.reason, typeof r?.detail === "string" && r.detail.length > 40], [false, "NO_CLAIM", true]);
  }
  const free = await conclude({ target: INQ, project: B, conclusion: "The transfer was improper.", falsifier: "x" });
  t("a FREE conclusion text beside a project is refused CONCLUSION_IS_THE_CLAIM, never relabelled",
    [free?.ok, free?.reason], [false, "CONCLUSION_IS_THE_CLAIM"]);
  t("NOTHING WAS WRITTEN: the question and every project named above are byte-identical",
    JSON.stringify(await shas()) === JSON.stringify(before), true);
  /* REC-136: the no-project doors on a question whose readings are the problem. */
  const np2Before = await shaOf(NP2);
  for (const [label, name] of [["an ACCEPTED reading that states NO claim", VNP_NOCLAIM.name],
                               ["a reading only SUGGESTED, never accepted", VNP_SUGGESTED.name]]) {
    const r = await conclude({ target: NP2, conclusion: "It was.", falsifier: "x", version: name });
    t(`no project, naming ${label}: refused NO_CLAIM`, [r?.ok, r?.reason, r?.version], [false, "NO_CLAIM", name]);
  }
  t("and NP2 was not written, nor moved from open", [await shaOf(NP2) === np2Before, await stateOf(NP2)],
    [true, "open"]);
  t("E reads no conclusion, and neither does D", [await conclusionOf(E), await conclusionOf(D)], [null, null]);
  t("B's conclusion survived the refused free-text attempt unchanged", (await conclusionOf(B))?.claim, CLAIM_B);
  const mach = await conclude({ target: INQ, project: B, falsifier: "x" }, "mem-r124");
  t("a machine credential is refused by the fence it always was, with a project too",
    [mach?.ok, mach?.reason], [false, "MACHINE_CANNOT_CONCLUDE"]);
}

/* ====================================================================== 3 */
console.log("\n--- 3. a legacy (no-project) conclusion reads claim-UNDETERMINED, never back-filled ---");
{
  /* CORRECTED 2026-09-18 by REC-136: this arm CONCLUDED LEG with no project
     and no reading and expected it accepted with its claim undetermined. §7.1
     item 6 (BOB #15) refuses exactly that now — an undetermined claim asserts
     nothing a reader can check — so the legacy conclusion is AUTHORED into the
     bytes at promote, which is where every such conclusion in a real record
     came from, and this block reads it. The act's new path is §3b. */
  t("the legacy question is concluded in its own bytes (the pre-§7.1-item-6 shape)",
    await stateOf(LEG), "concluded");
  const own = (await versionsOf(LEG))?.no_project_conclusion;
  t("the read gives it as the no-project relationship's, relationship NOT established, claim UNDETERMINED",
    [own?.relationship, own?.relationship_established, own?.conclusion, own?.claim?.state, own?.claim?.text],
    ["no_project", false, LEGACY_TEXT, "undetermined", null]);
  t("NEVER BACK-FILLED: the claim is not the conclusion text, and the inquiry's bytes carry no claim key",
    [own?.claim?.text === LEGACY_TEXT, /\nclaim:/.test((await textOf(LEG)) || "")], [false, false]);
  t("a project drawing on the legacy question does NOT inherit its conclusion (stated, not inferred)",
    await conclusionOf(A, LEG), null);
  /* OVER-STRICTNESS: a project may conclude a question whose own state is
     `concluded`, because that state is another relationship's. */
  const legSha = await shaOf(LEG);
  const pa = await conclude({ target: LEG, project: A, falsifier: "a rescinding minute" });
  t("OVER-STRICTNESS: A may conclude the legacy question for itself — the other relationship does not bar it",
    [pa?.ok, pa?.claim?.text], [true, VL.claim]);
  t("and the legacy conclusion in the inquiry's own bytes is untouched",
    [await shaOf(LEG) === legSha, (await versionsOf(LEG))?.no_project_conclusion?.conclusion],
    [true, LEGACY_TEXT]);
}

/* ===================================================================== 3b */
console.log("\n--- 3b. §7.1 item 6: a NO-PROJECT conclusion names its reading and ADOPTS its claim verbatim ---");
{
  const r = await conclude({ target: NP, conclusion: "It was booked before the meeting.",
                             falsifier: "a booking entry dated after the meeting", version: VNP.name });
  t("the no-project act, NAMING its reading, concludes and the inquiry's own state moves",
    [r?.ok, r?.relationship, r?.project, await stateOf(NP)], [true, "no_project", null, "concluded"]);
  t("its answer ADOPTS the named reading's claim WORD FOR WORD — not the conclusion text",
    [r?.claim?.state, r?.claim?.text, r?.claim?.version, r?.version], ["adopted", CLAIM_NP, VNP.name, VNP.name]);
  const own = (await versionsOf(NP))?.no_project_conclusion;
  t("the read gives the adoption: no-project relationship, claim ADOPTED, verbatim, naming its reading",
    [own?.relationship, own?.claim?.state, own?.claim?.text, own?.claim?.version, own?.conclusion],
    ["no_project", "adopted", CLAIM_NP, VNP.name, "It was booked before the meeting."]);
  const npText = (await textOf(NP)) || "";
  t("the adoption is in the inquiry's own bytes, beside the conclusion, and its Session Log names it",
    [npText.includes(`conclusion_version: "${VNP.name}"`), npText.includes(`conclusion_claim: "${CLAIM_NP}"`),
     npText.includes(`Adopted: reading '${VNP.name}', claim: ${CLAIM_NP}`)], [true, true, true]);
  t("and no project inherits it (§7.1 item 8: it counts only for the relationship that made it)",
    await conclusionOf(A, NP), null);
  const fg = (await versionsOf(FORGED))?.no_project_conclusion;
  t("a HAND-AUTHORED adoption its named reading does not bear out reads UNDETERMINED, with the reason",
    [fg?.claim?.state, fg?.claim?.text, /does not state the claim recorded/.test(fg?.claim?.detail || "")],
    ["undetermined", null, true]);
}

/* ====================================================================== 5 */
console.log("\n--- 5. §7.1 item 7: WITHDRAWAL APPENDS — conclude, withdraw, conclude again, THREE entries ---");
{
  const withdraw = async (params, tok = RUTH) =>
    POST(`op=withdrawconclusion&token=${tok}&` + Object.entries(params).map(([k, v]) => `${k}=${enc(v)}`).join("&"), {});
  const WHY = "The audit was superseded by a corrected edition.";
  const bBefore = (await versionsOf(INQ, B)) || {};
  t("B starts with ONE entry, its conclusion on VB, and stands on it",
    [(bBefore.conclusion_history || []).length, bBefore.conclusion_stance], [1, "concluded"]);
  /* refusals first, each writing nothing */
  const bSha = await shaOf(B);
  const noWhy = await withdraw({ target: INQ, project: B });
  t("a withdrawal with NO reason is refused NO_REASON", [noWhy?.ok, noWhy?.reason], [false, "NO_REASON"]);
  const mach = await withdraw({ target: INQ, project: B, reason: WHY }, "mem-r124");
  t("a MACHINE may not withdraw: the conclude fence's condition, by name",
    [mach?.ok, mach?.reason], [false, "MACHINE_CANNOT_CONCLUDE"]);
  const noProj = await withdraw({ target: INQ, reason: WHY });
  t("a withdrawal names its project; with none it is refused NOT_A_PROJECT, naming op=reopen's door",
    [noProj?.ok, noProj?.reason, /op=reopen/.test(noProj?.detail || "")], [false, "NOT_A_PROJECT", true]);
  const never = await withdraw({ target: INQ, project: D, reason: WHY });
  t("a project that never concluded has NOTHING_TO_WITHDRAW", [never?.ok, never?.reason, never?.stance],
    [false, "NOTHING_TO_WITHDRAW", "none"]);
  t("and none of those wrote anything to B", await shaOf(B) === bSha, true);

  const w = await withdraw({ target: INQ, project: B, reason: WHY });
  t("B WITHDRAWS: accepted, the shared inquiry unmoved, and it names what it withdrew",
    [w?.ok, w?.act, w?.inquiry_moved, w?.withdraws?.version, w?.withdraws?.claim, w?.reason, w?.history_length],
    [true, "withdrawn", false, VB.name, CLAIM_B, WHY, 2]);
  const again = await withdraw({ target: INQ, project: B, reason: WHY });
  t("withdrawing AGAIN is refused NOTHING_TO_WITHDRAW — it would add an entry recording nothing",
    [again?.ok, again?.reason, again?.stance], [false, "NOTHING_TO_WITHDRAW", "withdrawn"]);
  const mid = (await versionsOf(INQ, B)) || {};
  t("after the withdrawal B stands on NO conclusion — and says WITHDRAWN, not never-concluded",
    [mid.conclusion, mid.conclusion_stance], [null, "withdrawn"]);
  const q1 = await GET(`op=queue&token=${RUTH}&limit=500`);
  const items1 = (q1 && Array.isArray(q1.items) ? q1.items : [])
    .filter((i) => i && i.kind === "shared-inquiry-concluded-by-another-project");
  t("the other projects are no longer told B concluded, and A's notice shows B as WITHDRAWN",
    [items1.some((i) => i.subject?.id === B),
     (items1.find((i) => i.subject?.id === A)?.basis?.elsewhere || []).find((e) => e.project === B)?.state],
    [false, "withdrawn"]);

  const rc = await conclude({ target: INQ, project: B, falsifier: "a recorded council vote on the transfer",
                              commentary: "Concluded again on the corrected audit." });
  t("B CONCLUDES AGAIN: accepted, following the withdrawal", [rc?.ok, rc?.prior?.act, rc?.history_length],
    [true, "withdrawn", 3]);

  /* THE ARM A LIAR FAILS. Keeping only the latest entry passes every
     "stance is right" assertion; this reads the WHOLE history. */
  const hb = (await versionsOf(INQ, B)) || {};
  const hist = hb.conclusion_history || [];
  t("THREE ENTRIES, READABLE IN ORDER: concluded, withdrawn, concluded",
    hist.map((e) => [e.act, e.version]),
    [["concluded", VB.name], ["withdrawn", VB.name], ["concluded", VB.name]]);
  t("each entry is DATED and AUTHORED, and the withdrawal carries its reason and what it withdrew",
    [hist.every((e) => e.by === "ruth" && /^20\d\d-/.test(e.at || "")), hist[1]?.reason,
     hist[1]?.withdraws_at === hist[0]?.at, hist[0]?.claim, hist[2]?.commentary?.text],
    [true, WHY, true, CLAIM_B, "Concluded again on the corrected audit."]);
  t("the STANCE is the LAST entry", [hb.conclusion_stance, hb.conclusion?.at === hist[2]?.at,
    hb.conclusion?.commentary?.text], ["concluded", true, "Concluded again on the corrected audit."]);
  const bText = (await textOf(B)) || "";
  t("B's own bytes carry all three entries for INQ, and its Session Log records the withdrawal",
    [entriesIn(bText),
     /* CORRECTED 2026-09-18 (REC-141): re-pointed from the literal id at B's minted id. */
     new RegExp(`\\| Conclusion withdrawn \\| ruth\\nTrigger: op=withdrawconclusion on INQ-2026-4124-sewer-transfers for ${B}\\n`).test(bText)],
    [3, true]);
  t("and A was not moved by any of B's acts", (await conclusionOf(A))?.version, VB.name);

  /* STRUCTURAL, not conventional: a promote that REWRITES the history is
     NAMED by the catalog (C-5.1 now holds `conclusions` append-only, beside
     `state_history`). C-5.1 is an AUDIT check — `promote` does not run the
     catalogue, it writes and snapshots — so the rewrite LANDS and op=audit
     names it, exactly as it names a rewritten state_history. Measured, not
     assumed: the first draft of this arm expected promote to refuse, and it
     did not. */
  /* op=audit over B ALONE (the page after the id just below B's), read as its
     tally — an offender's error list is capped, and B's fixture draws unrelated
     core-field findings that would fill it. BEFORE and AFTER, so the C-5.1
     finding is attributed to the rewrite rather than to the fixture. */
  /* CORRECTED 2026-09-18 (REC-141): the cursor was a literal just below the chosen id; B is now
     minted, so the cursor is B with its last character stepped down one — still just below B. */
  const belowB = B.slice(0, -1) + String.fromCharCode(B.charCodeAt(B.length - 1) - 1);
  const auditB = async () => (await GET(`op=audit&token=${RUTH}&after=${enc(belowB)}&limit=1`)) || {};
  const beforeAudit = await auditB();
  const cut = bText.replace(/\nconclusions:\n  - inquiry: "INQ-2026-4124-sewer-transfers"\n(    [^\n]*\n)+?(?=  - inquiry)/, "\nconclusions:\n");
  /* The snapshot key SORTS LAST on purpose: C-5.1 compares against the
     lexicographically latest `_history/` snapshot, and this suite's fixture keys
     (`PROJ-…`) sort after the acts' date keys — a tamper filed under a key that
     sorted early would be compared with the project's FIRST edition, which had
     no entries, and pass for a reason that has nothing to do with the rule. */
  const tamper = await POST(`op=promote&token=${RUTH}`, {
    bundleId: B, base: await shaOf(B), snapKey: "99991231T235959Z_tamper",
    files: [{ path: "bundle.md", text: cut, bytes: cut.length, sha256: sha(cut) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland",
            current_state: "forming", created: NOW, last_updated: LATER } });
  t("the fixture's cut really removed an entry (else the next arm proves nothing)", entriesIn(cut), 2);
  t("the rewrite lands (promote gates on shape, not on the catalogue's history rules)", tamper?.ok, true);
  const afterAudit = await auditB();
  t("the audit page is B's alone, before and after",
    [beforeAudit.checked, (beforeAudit.offenders || []).map((o) => o.bundleId),
     afterAudit.checked, (afterAudit.offenders || []).map((o) => o.bundleId)],
    [1, [B], 1, [B]]);
  t("op=audit NAMES THE REWRITE: B carried NO C-5.1 finding before it and carries one after (C-5.1)",
    [beforeAudit.tally?.["C-5.1"] ?? 0, afterAudit.tally?.["C-5.1"] ?? 0], [0, 1]);
}

/* hygiene.test.mjs's rule: every Miniflare instance is disposed, so the process ends on its own result. */
await mf.dispose();
console.log(`\n  conclude-project: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
