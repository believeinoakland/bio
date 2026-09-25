/* NEGATIVE CONTROL: RUN BY `test/projection-noproject.control.mjs` (a `.control.mjs`, not discovered by the battery, because it EDITS src/store.mjs while it runs). Each arm is armed ALONE, restored by cp from a per-arm pristine copy and verified by sha256 AND cmp. DECLARED before arming:
   (a) A SECOND READER, COPIED — `projection()` calls `#noProjectConclusionOfCopy`, a verbatim copy of `#noProjectConclusionOf` differing in ONE branch the fixtures never reach (the named-reading-is-absent sentence). This is the row's liar: it passes byte-equality today and drifts tomorrow. MUST FAIL, by name: §4's "ONE READER: the single-bundle arm calls" (it calls the copy), "exactly TWO call sites" (one remains) and "the reader's own tokens occur ONCE" (the copy carries them). MUST NOT FAIL: §1-§3's behavioural arms, the byte-identity arms included — that is the point of the arm — nor "exactly ONE definition" (the copy has another name).
   (b) THE FIELD ON THE LIST FORM — the list arm's rows each carry `no_project_conclusion` through the same reader. MUST FAIL: §3's two list-form arms, and §4's NEVER-ON-THE-LIST-FORM source arm and its exactly-TWO-call-sites arm (the list arm is a third caller). MUST NOT FAIL: §1, §2, and §4's other arms.
   (c) OVER-STRICTNESS: the projection reaches the ONE reader through a differently-spelled call (a local `npc`, the argument spelled `bundleId`), which is correct work in a spelling the one-reader pin did not anticipate. MUST NOT FAIL: anything.
   RUN 2026-09-19 by the REC-144 worker (`node test/projection-noproject.control.mjs` from `bio-plane/`), preflight 5 anchors each occurring once, every restore sha256 MATCH and content IDENTICAL: baseline 26/0 · (a) 23/3 — exactly the three declared ONE-READER arms FAILED by name; every byte-identity arm PASSED under the copy, which is the liar the row names, seen only by the source pin · (b) 22/4 — both list-form arms, the exactly-TWO-call-sites arm and the NEVER-ON-THE-LIST-FORM source arm, as declared · (c) 26/0 — the over-strictness arm holds. Every arm AS DECLARED. BEFORE THE CHANGE (the suite over the pristine `store.mjs` of `5871a991`): 12/14 — every field arm and the two call-site arms FAILED, so the suite sees the subject's absence.
 * ========================================================================= */
/* REC-144 — THE QUESTION'S PAGE READS THE NO-PROJECT CONCLUSION FROM
 * `op=projection` (INVESTIGATIVE-SESSION.md §7.1, the paragraph "The question's
 * page reads the no-project conclusion from `op=projection`", BOB #16,
 * 2026-09-19, `7c150df0`).
 *
 * HOW A LIAR PASSES THIS, stated before what it checks: write a SECOND reader
 * that copies `#noProjectConclusionOf`'s logic. Every byte-equality arm passes
 * today, because the copy agrees; tomorrow one of the two is edited and the
 * question's page and the stance surface say different things about one
 * conclusion. No behavioural arm can see a faithful copy — so §4 asserts ONE
 * reader off the source, the way `severedhomes.test.mjs` pins D-267's predicate.
 *
 * WHAT IS DRIVEN, through the ops, as two different viewers:
 *  1. A concluded no-project inquiry — one concluded BY THE ACT, naming its
 *     reading (claim ADOPTED), and one concluded in its own bytes the legacy way
 *     (claim UNDETERMINED): `op=projection&id=` carries `no_project_conclusion`
 *     BYTE-IDENTICAL to `op=basisversions`' for the SAME viewer, and non-null,
 *     so the equality is not two nulls agreeing for free.
 *  2. Null (key present) for an unconcluded inquiry, and for two non-inquiries.
 *  3. ABSENT from the list form, paged and filtered — and the list is proven to
 *     hold the concluded inquiries, so absence is not an empty page.
 *  4. ONE READER: the single-bundle arm calls `#noProjectConclusionOf`; the
 *     store has exactly one definition and exactly two call sites of it; the
 *     reader's own tokens occur once.
 *
 * WHAT IT CANNOT SEE: §4's token arm reads store.mjs and index.mjs by name and
 * no other module (a named list, not a walk — hygiene's census). A second reader written in a spelling that shares none of
 * §4's tokens AND is not what projection() calls is invisible to §4 — but then
 * projection() calls the one reader and the copy serves nobody. Nothing here
 * drives a viewer who may not see the inquiry: inquiries are not compartmented
 * (op=basisversions' own comment on its gate), so the gate both reads share is
 * the one REC-25 already tests.
 * ========================================================================= */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const has = (o, k) => !!o && typeof o === "object" && Object.prototype.hasOwnProperty.call(o, k);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r144", MEMBER_TOKEN: "mem-r144", PROBE_TOKEN: "prb-r144",
              DAEMON_TOKEN: "dmn-r144", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-r144",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body) })).json());

const enrol = async (memberId, role, caps) => {
  const add = await POST(`op=memberadd&token=adm-r144`,
    { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  if (!add.ok) throw new Error(`memberadd ${memberId}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* Two viewers, because the byte-identity is FOR THE SAME VIEWER: each viewer's
   two reads are compared with each other, never across viewers. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);
await enrol("sam", "admin", ["contribute", "publish"]);     /* ADMINS_FIRST: two administrators before a member */
const MIA = await enrol("mia", "member", ["contribute"]);

/* ------------------------------------------------------------- FIXTURES */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const q = (v) => `"${String(v)}"`;
const inquiryMd = (id, { reading = null, concluded = null } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Was the sewer transfer booked before the council met?"`,
  ...(concluded
    ? ["current_state: concluded", "prior_state: open", `conclusion: ${q(concluded.conclusion)}`,
       `falsifier: ${q(concluded.falsifier)}`]
    : ["current_state: open", "prior_state: null"]),
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", `  - target: ${LEDGER}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${LEDGER}`, "    role: supports",
  ...(reading ? ["basis_versions:",
    `  - name: ${q(reading.name)}`, `    description: ${q(reading.description)}`, `    relationship: "and"`,
    `    state: "accepted"`, `    state_by: "ruth"`, `    state_at: ${q(NOW)}`,
    "    derived_from: null", "    hidden: false", `    claim: ${q(reading.claim)}`,
    `    author: "ruth"`, `    at: ${q(NOW)}`,
    "basis_version_grounds:", `  - version: ${q(reading.name)}`, `    ground: "the ledger alone"`,
    `    asserted_by: "ruth"`, `    at: ${q(NOW)}`,
    "basis_version_legs:", `  - version: ${q(reading.name)}`, `    target: ${q(LEDGER)}`,
    `    role: "supports"`, `    ground: "the ledger alone"`, `    grade: "B"`, `    grade_axis: "capture"`,
    `    grade_source: "capture"`] : []),
  "---", "", "## Question", "", "Was it?", "", "## What It Rests On", "",
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
const projectMd = (id) => ["---",
  ...(id === null ? [] : [`id: ${id}`]), "object_type: project", `title: "Oversight"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "references:", `  - target: ${ACTED}`, "    rel: cites", "    status: confirmed",
  "required_strength:", "  capture: B", "  connection: C",
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");

let snapSeq = 0;
const mustPromote = async (id, text, type, state, label = id) => {
  const r = await POST(`op=promote&token=${RUTH}`, {
    ...(id === null ? {} : { bundleId: id }), base: null,
    snapKey: `${label}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: type === "information"
      ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${label}`), encoding: "binary", bytes: 10 }] : [],
    meta: { object_type: type, group: "believe-in-oakland", current_state: state,
            created: NOW, last_updated: LATER } });
  if (!r.ok) throw new Error(`promote ${label}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};
const enc = encodeURIComponent;

const LEDGER = "INFO-2026-4144-ledger";
const ACTED = "INQ-2026-4144-concluded-by-the-act";   /* no-project, names its reading: ADOPTED */
const LEGACY = "INQ-2026-4144-concluded-in-bytes";    /* the pre-§7.1-item-6 shape: UNDETERMINED */
const OPEN = "INQ-2026-4144-still-open";
/* CORRECTED 2026-09-19 at REC-144's integration (CONDUCT #6), where it met REC-141 (IC-158): a project's id
   is minted by the plane, and a creation that names one is refused C-59.1, so the project is promoted with NO
   id (and no `id:` line) and PROJ is the id the plane answers. The suite's subject is unchanged. */
let PROJ;
const CLAIM = "The ledger shows the transfer was booked before the council met.";
const READING = { name: "booked early", claim: CLAIM, description: "The ledger alone, read for the booking date." };
const LEGACY_TEXT = "The legacy transfer was authorised.";

await mustPromote(LEDGER, infoMd(LEDGER), "information", "collected");
await mustPromote(ACTED, inquiryMd(ACTED, { reading: READING }), "inquiry", "open");
await mustPromote(LEGACY, inquiryMd(LEGACY, { concluded: { conclusion: LEGACY_TEXT, falsifier: "a rescinding minute" } }),
  "inquiry", "concluded");
await mustPromote(OPEN, inquiryMd(OPEN, { reading: READING }), "inquiry", "open");
PROJ = (await mustPromote(null, projectMd(null), "project", "forming", "PROJ-2026-4144-oversight")).bundleId;

const concluded = await POST(`op=conclude&token=${RUTH}&target=${enc(ACTED)}`
  + `&conclusion=${enc("It was booked before the meeting.")}`
  + `&falsifier=${enc("a booking entry dated after the meeting")}&version=${enc(READING.name)}`, {});
if (!concluded || concluded.ok !== true) throw new Error(`conclude ${ACTED}: ${JSON.stringify(concluded).slice(0, 600)}`);

const projectionOf = (id, tok) => GET(`op=projection&token=${tok}&id=${enc(id)}`);
const versionsOf = (id, tok) => GET(`op=basisversions&token=${tok}&id=${enc(id)}&limit=50`);

/* ====================================================================== 1 */
console.log("\n--- 1. a concluded no-project inquiry: op=projection's field is BYTE-IDENTICAL to op=basisversions', per viewer ---");
{
  t("the fixture is real: the act concluded ACTED with no project, adopting its reading's claim",
    [concluded.relationship, concluded.claim?.state, concluded.claim?.text], ["no_project", "adopted", CLAIM]);
  for (const [who, tok] of [["ruth (admin)", RUTH], ["mia (member)", MIA]]) {
    for (const [id, state] of [[ACTED, "adopted"], [LEGACY, "undetermined"]]) {
      const p = await projectionOf(id, tok);
      const v = await versionsOf(id, tok);
      t(`${who} · ${id}: op=projection answers the row, and it is the inquiry, concluded`,
        [p?.bundle_id, p?.current_state], [id, "concluded"]);
      /* NON-NULL FIRST: two nulls agree for free (the costs-nothing rule). */
      t(`${who} · ${id}: the field is present and non-null on BOTH reads, claim ${state}`,
        [has(p, "no_project_conclusion"), p?.no_project_conclusion?.claim?.state,
         v?.no_project_conclusion?.claim?.state],
        [true, state, state]);
      t(`${who} · ${id}: BYTE-IDENTICAL to op=basisversions' for the same viewer`,
        JSON.stringify(p?.no_project_conclusion) === JSON.stringify(v?.no_project_conclusion)
          && JSON.stringify(p?.no_project_conclusion).length > 200, true);
    }
  }
  const p = (await projectionOf(ACTED, RUTH))?.no_project_conclusion;
  t("the adopted answer says what §7.1 items 5 and 6 say: no-project, relationship not established, the reading's claim verbatim",
    [p?.relationship, p?.project, p?.relationship_established, p?.claim?.text, p?.claim?.version, p?.conclusion],
    ["no_project", null, false, CLAIM, READING.name, "It was booked before the meeting."]);
}

/* ====================================================================== 2 */
console.log("\n--- 2. null, key present, for an unconcluded inquiry and for a non-inquiry ---");
{
  const o = await projectionOf(OPEN, RUTH);
  t("an OPEN inquiry: the row is served, the key is present, and it is null — as op=basisversions says",
    [o?.bundle_id, o?.current_state, has(o, "no_project_conclusion"), o?.no_project_conclusion,
     (await versionsOf(OPEN, RUTH))?.no_project_conclusion],
    [OPEN, "open", true, null, null]);
  for (const id of [LEDGER, PROJ]) {
    const r = await projectionOf(id, RUTH);
    t(`a NON-INQUIRY (${id}): the row is served, the key is present, and it is null`,
      [r?.bundle_id, has(r, "no_project_conclusion"), r?.no_project_conclusion], [id, true, null]);
  }
}

/* ====================================================================== 3 */
console.log("\n--- 3. NEVER on the list form ---");
{
  const page = await GET(`op=projection&token=${RUTH}&limit=100`);
  const ids = (page?.bundles || []).map((b) => b.bundle_id);
  t("the list form is non-empty and holds BOTH concluded inquiries (absence is not an empty page)",
    [ids.includes(ACTED), ids.includes(LEGACY), ids.length >= 5], [true, true, true]);
  t("NO row on the list form carries `no_project_conclusion`",
    (page?.bundles || []).filter((b) => has(b, "no_project_conclusion")).map((b) => b.bundle_id), []);
  const filtered = await GET(`op=projection&token=${RUTH}&jsonPath=${enc("$.current_state")}&jsonEquals=concluded`);
  const fids = (filtered?.bundles || []).map((b) => b.bundle_id).sort();
  t("the FILTERED list form holds the concluded inquiries and carries the field on none of them",
    [fids, (filtered?.bundles || []).some((b) => has(b, "no_project_conclusion"))],
    [[LEGACY, ACTED].sort(), false]);
}

/* ====================================================================== 4 */
console.log("\n--- 4. ONE READER: the single-bundle arm calls #noProjectConclusionOf, and there is no second ---");
{
  const store = readFileSync(SRC("store.mjs"), "latin1");     /* the stray byte: read as bytes */
  const count = (s, needle) => s.split(needle).length - 1;
  const from = store.indexOf("\n  projection({ bundleId");
  const to = store.indexOf("\n  #actionDerived(", from);
  const body = from > 0 && to > from ? store.slice(from, to) : "";
  const single = body.slice(0, body.indexOf("IC-24 / REC-59"));
  const list = body.slice(body.indexOf("IC-24 / REC-59"));
  t("the projection() source was found and split (else the next arms prove nothing)",
    [body.length > 2000, single.length > 500, list.length > 500, single.includes("if (bundleId)")],
    [true, true, true, true]);
  t("ONE READER: the single-bundle arm calls `this.#noProjectConclusionOf(`",
    single.includes("this.#noProjectConclusionOf("), true);
  t("ONE READER: exactly ONE definition of the reader in store.mjs",
    count(store, "\n  #noProjectConclusionOf("), 1);
  /* EXACT, not a floor — severedhomes.test.mjs's reason: it is the only
     instrument that sees a reader of the rule appear or disappear. A third
     call site is not wrong; it is somebody who must come here and say which.
     CORRECTED 2026-09-19 by REC-135, which is that somebody, and the OLD
     ASSERTION WAS RIGHT WHEN IT WAS WRITTEN AND IS WRONG NOW rather than having
     been too strict: at REC-144 there were exactly two reads of this quantity
     and the pin said so. §7.1 item 4 adds a THIRD — `#caseConclusionFor`, the
     one reader `op=publish`'s NOT_CONCLUDED gate and the case document both ask
     "is this question concluded, and for whose relationship?" through. It is a
     CALL and not a copy, which is the property this whole section exists to
     hold: the token arm below still reads ONCE across both files, and it is the
     arm that would catch a fourth reader written out by hand. The count moves;
     the rule does not. */
  t("ONE READER: exactly THREE call sites — op=basisversions, op=projection's single-bundle arm, "
  + "and REC-135's #caseConclusionFor (the case path's no-project arm)",
    count(store, "this.#noProjectConclusionOf("), 3);
  /* NAMED FILES, NOT A DIRECTORY WALK (hygiene.test.mjs's walk census): the store
     that holds the reader and the dispatch that could host a copy beside the op. */
  const srcs = ["store.mjs", "index.mjs"].map((f) => readFileSync(SRC(f), "latin1")).join("\n");
  t("ONE READER: the reader's own tokens occur ONCE across store.mjs and index.mjs (a copy carries them twice)",
    [count(srcs, "relationship_established: false"), count(srcs, "fm.conclusion_claim"),
     count(srcs, "fm.conclusion_version")], [1, 1, 1]);
  t("NEVER ON THE LIST FORM: the list arm neither calls the reader nor names the field",
    [list.includes("#noProjectConclusionOf"), list.includes("no_project_conclusion")], [false, false]);
}

/* hygiene.test.mjs's rule: every Miniflare instance is disposed, so the process ends on its own result. */
await mf.dispose();
console.log(`\n  projection-noproject: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
