/* NEGATIVE CONTROL: see the block at the FOOT of this file. Every arm is armed
   ALONE with every other defence held open, RUN, and recorded there with the
   count it MEASURED. The driver is `test/caseobject.control.mjs` — COMMITTED, so
   the arms re-run in one step with `node test/caseobject.control.mjs [arm]` —
   and every restore is verified by CONTENT and by sha256 against a
   uniquely-named per-arm pristine copy taken INSIDE THIS WORKTREE (never a
   shared scratchpad: PL-10's harness was overwritten mid-turn by a concurrent
   worker, and UI-38 met an NC harness that reported a byte-identical restore
   over a file it had not restored). */

/* CASE-1 / DEC-72 — THE CASE OBJECT: a case is a PRODUCTION OF A PROJECT.
 *
 * Bob ruled it on 2026-08-10 and `docs/development/CASE-AS-PRODUCTION.md` is the
 * design. This item builds the OBJECT and nothing else: the case identity owned
 * by a project, the membership row as (finding id, version hash, role, ordinal),
 * and editions per case. The publishing act that fills them is CASE-2, the
 * version pin is CASE-3, and the artifact flip is CASE-5.
 *
 * SO THIS SUITE'S SUBJECT IS AN OBJECT NOTHING WRITES YET, AND THAT IS EXACTLY
 * WHY IT IS DRIVEN THROUGH AN OP RATHER THAN ASSERTED AT THE STORE. A schema is
 * the cheapest thing in this repository to believe on its existence: the text
 * says `CREATE TABLE`, the file parses, `node --check` is happy, and nothing has
 * established that a caller can reach a single byte of it. `op=invitelook`
 * shipped with a ReferenceError while 1276 assertions passed. Every structural
 * claim below therefore has a behavioural twin driven through
 * `op=publishedmanifest` — the public read that already answers the case index,
 * needs no credential, and would throw on a column SQLite could not resolve.
 *
 * THE THREE BLOCKS, and what each can and cannot see:
 *
 *   1. THE OBJECT IS LIVE ON A REAL MIGRATED STORE. The op answers, and its
 *      answer carries the three new fields. CAN see: the statements compile and
 *      execute against real Durable Object SQLite, so the table exists, the two
 *      added columns exist, and the LEFT JOIN resolves. CANNOT see: whether any
 *      value is ever written — nothing writes one until CASE-2.
 *
 *   2. A REAL PUBLICATION CARRIES THE NEW FIELDS, HONESTLY EMPTY. A finding is
 *      promoted, concluded, published and RATIFIED WITH A REAL SIGNATURE, and
 *      the case that results is read back off the public index. This is the arm
 *      that proves the shipped publication path still works over the changed
 *      tables, and that the fields arrive at a caller rather than at a row.
 *
 *   3. THE DESIGN DOCUMENT IS THE EXPECTATION, NOT THIS SUITE'S OWN ARRAY. Three
 *      items landed today carrying an assertion that was BLIND BY CONSTRUCTION —
 *      an expected set derived from the thing under test, so both sides moved
 *      together and the arm proved nothing. Block 3's expectation is PARSED OUT
 *      OF `CASE-AS-PRODUCTION.md`'s own CASE-1 bullet at run time. That file is
 *      Bob's design, written before this schema and owned by nobody in this
 *      worktree, so the two sides cannot move together: delete a column and the
 *      document still demands it.
 *
 * WHAT NO ARM HERE CAN REACH, STATED RATHER THAN LEFT TO BE DISCOVERED: the
 * `project_id NOT NULL` constraint. No op writes `cases` until CASE-2, and this
 * plane exposes no SQL surface, so the constraint is pinned STRUCTURALLY against
 * schema.mjs and is NOT driven. CASE-2 is where it becomes reachable, and the
 * first thing CASE-2 should do is drive a project-less publish and watch it be
 * refused BY NAME.
 */

import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++; else fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) console.log(`        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-case1", MEMBER_TOKEN: "mem-case1", PROBE_TOKEN: "prb-case1",
              DAEMON_TOKEN: "dmn-case1", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-case1",
              GOVERNOR_APPETITE_PER_MIN: "600000", TASK_DRAIN_DELAY_MS: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService() { return new Response(new Uint8Array(2048), { headers: { "content-type": "application/pdf" } }); },
});
MF = mf;

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
/* THE PUBLIC READ, DRIVEN WITH NO CREDENTIAL, because that is how a stranger
   meets the case index and it is the surface DEC-72's owning project has to
   reach. `rP` is deliberately NOT used here: the envelope is part of what is
   being asserted. */
const publicIndex = async () => (await mf.dispatchFetch("http://x/api/?op=publishedmanifest")).json();

try {

console.log("\n=== CASE-1 / DEC-72 · the case OBJECT: a case is a production of a project ===");

/* ====================================================================== 1
 * THE OBJECT IS LIVE ON A REAL MIGRATED STORE, NOT A STRING IN A FILE.
 *
 * A `SELECT` naming a column SQLite cannot resolve fails at PREPARE, so this
 * block is not decoration around an empty array: it is the only evidence that
 * `cases` was created, that `version_sha` and `role` reached
 * `published_case_members`, and that the LEFT JOIN binding a case to its project
 * resolves — on a store the Durable Object actually migrated rather than on the
 * text that describes one.
 */
console.log("\n--- 1. the case object answers a caller, on a store the DO migrated ---");
{
  const first = await publicIndex();
  t("op=publishedmanifest answers at all over the changed case tables — a column the migration failed "
  + "to add would fail at PREPARE and take this whole op down",
    [first.ok, Array.isArray(first.result?.cases), Array.isArray(first.result?.caseMembers)],
    [true, true, true]);
  /* THE POLARITY GUARD. An empty store answers `[]` for both, and an assertion
     satisfied by `[]` is satisfied by an op that lost the tables entirely. So
     the reach of this block is established on the ANSWER'S OWN SHAPE — the
     statement that names the three new facts — before block 2 puts a real case
     through it. */
  t("and the answer STATES what an absent owner, an absent role and an absent version mean, rather than "
  + "handing a reader three bare nulls to interpret (undetermined is first-class and must be STATED)",
    [typeof first.result?.production === "string",
     /project_id/.test(first.result?.production || ""),
     /role/.test(first.result?.production || ""),
     /version_sha/.test(first.result?.production || "")],
    [true, true, true, true]);
  t("and it says whose production a case is, in DEC-72's own terms, on the surface a stranger reads",
    /PRODUCTION OF A PROJECT/.test(first.result?.production || ""), true);
}

/* ====================================================================== 2
 * A REAL PUBLICATION, RATIFIED WITH A REAL SIGNATURE, READ BACK OFF THE PUBLIC
 * INDEX.
 *
 * This is the block that would have caught the defect class this item is most
 * exposed to: a schema change that is correct in the file and breaks the act
 * that writes the table. `published_case_members` is written inside the
 * ratification transaction, so nothing short of a real ratification touches it.
 */
console.log("\n--- 2. a real case, published and ratified, carries the new member facts ---");
const GROUP = "believe-in-oakland";
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
let CASE_ROW = null, MEMBER_ROW = null;
/* CASE-3 (2026-08-10): the sha that went into the signed `bio-ratify` statement,
   hoisted here so block 3 can compare the PIN against the SIGNATURE rather than
   against the pin column. Captured at the ratification below, and deliberately
   not read back out of the answer under test. */
let SIGNED_SHA = null;
{
  const invite = async (memberId, role, capabilities) =>
    (await POST("op=memberadd&token=adm-case1",
      { memberId, cover: `cover for ${memberId}`, role, capabilities })).invite;
  const enrol = async (memberId, role, capabilities) => {
    const inv = await invite(memberId, role, capabilities);
    const en = await POST("op=enroll", { invite: inv, handle: memberId, password: `${memberId}-passphrase-1` });
    if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
    const tok = (await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` })).token;
    if (!tok) throw new Error(`login ${memberId}`);
    return tok;
  };
  /* 4.2/4.3: the second member of a group must be an administrator, and there
     are no ordinary members until two exist. */
  const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
  await enrol("gus", "admin", ["contribute", "publish"]);

  const infoMd = (id) => ["---",
    `id: ${id}`, "object_type: information", "schema: information@1",
    `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
    `created: "${NOW}"`, `last_updated: "${LATER}"`,
    "produced_by:", "  mode: agent", "  capability_tier: high",
    `group: ${GROUP}`, "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null",
    "visuals: []", "criticality: supporting",
    "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
    '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
    "monitoring:", "  enabled: false", "  frequency: none",
    "---", "", "## Summary", "", "A captured document.", "",
    "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const refLines = (targets) => targets.length
    ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
    : ["references: []"];
  const inquiryMd = (id, { question, refs = [] }) => ["---",
    `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
    `title: "${question}"`, "current_state: open", "prior_state: null",
    `created: "${NOW}"`, `last_updated: "${LATER}"`,
    "produced_by:", "  mode: agent", "  capability_tier: high",
    `group: ${GROUP}`, ...refLines(refs), "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null",
    "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
    "recheck_triggers:", "  - text: Revisit after the next budget cycle",
    "    description: The adopted budget may restate the transfer basis.",
    "---", "", "## Question", "", question, "",
    "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
    "## Session Log", "", `### Session ${LATER} | Formation | agent`,
    "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
  const promote = async (id, text, type, extraFiles = [], register = []) =>
    POST(`op=promote&token=${RUTH}`, {
      bundleId: id, base: null,
      snapKey: `${id}-${Math.random().toString(36).slice(2, 8)}`,
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }, ...extraFiles],
      register,
      meta: { object_type: type, group: GROUP, title: `Bundle ${id}`,
              current_state: type === "inquiry" ? "open" : "collected",
              created: NOW, last_updated: LATER } });
  const mustPromote = async (...a) => {
    const r = await promote(...a);
    if (!r.ok) throw new Error(`promote ${a[0]}: ${JSON.stringify(r).slice(0, 600)}`);
    return r;
  };

  const dir = mkdtempSync(join(tmpdir(), "case1-"));
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "ruth", "-f", join(dir, "ruth"), "-q"]);
  const keyB64 = readFileSync(join(dir, "ruth.pub"), "utf8").trim().split(/\s+/)[1];
  const signRatify = (bundleId, bundleSha) => {
    const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
    writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
    execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "ruth"), "-n", "bio-ratify", f],
      { stdio: ["ignore", "ignore", "ignore"] });
    return readFileSync(`${f}.sig`, "utf8");
  };
  const reg = await POST("op=signeradd&token=adm-case1", { keyB64, memberId: "ruth", comment: "ruth laptop" });
  if (!reg.ok) throw new Error(`signeradd: ${JSON.stringify(reg).slice(0, 400)}`);

  const CAP = "INFO-2026-1100-cap", CONN = "INFO-2026-1100-conn", LEFT = "INFO-2026-1100-left";
  const INQ = "INQ-2026-1100-authorisation";
  for (const d of [CAP, CONN, LEFT])
    await mustPromote(d, infoMd(d), "information", [],
      [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${d}`), encoding: "binary", bytes: 10 }]);
  const legs = ["basis:",
    `  - target: ${CAP}`, "    role: supports", "    grade: B", "    grade_axis: capture", "    grade_source: capture",
    `  - target: ${CONN}`, "    role: supports", "    grade: C", "    grade_axis: connection",
    "    grade_source: hunch", "    author: ruth", "    date: 2026-08-04"].join("\n");
  const md = inquiryMd(INQ, { question: "Was the FY2024 sewer transfer authorised?", refs: [CAP, CONN] })
    .replace("---\n\n## Question", `${legs}\n---\n\n## Question`);
  await mustPromote(INQ, md, "inquiry");
  const cn = await GET(`op=conclude&token=${RUTH}&target=${INQ}`
    + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
    + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`);
  if (!cn.ok) throw new Error(`conclude: ${JSON.stringify(cn).slice(0, 400)}`);

  const pub = await POST(`op=publish&token=${RUTH}`, { target: INQ,
    scope: "Whether the FY2024 sewer transfer was authorised, on the documents in hand.",
    statement: "This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition 1.",
    excluded: [{ target: LEFT, description: "the FY2023 comparison memo",
                 reason: "a records request for it is still outstanding with the City Clerk" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
    biasAcknowledgement: "This group holds a declared position that fund transfers should be adopted in "
                       + "public session, and edition 1 reads the FY2024 record through it." });
  t("a real case is published through the unchanged ceremony at edition 1 — the act CASE-2 will rework "
  + "is not touched by this item and must still work over the changed tables",
    [pub.ok, pub.edition], [true, 1]);

  const liveSha = async () => ((await GET(`op=list&token=${RUTH}`)) || [])
    .find((b) => b.bundle_id === INQ)?.bundle_sha ?? null;
  const s = await liveSha();
  SIGNED_SHA = s;
  const rat = await POST(`op=ratify&token=${RUTH}`, { bundleId: INQ, expectedSha: s, sig: signRatify(INQ, s) });
  t("and it RATIFIES with a real ssh signature — `published_case_members` is written inside that "
  + "transaction and nothing short of a real ratification reaches it",
    [rat.ok, rat.case?.edition], [true, 1]);

  const idx = (await publicIndex()).result || {};
  CASE_ROW = (idx.cases || []).find((c) => c.edition === 1) || null;
  MEMBER_ROW = (idx.caseMembers || []).find((m) => m.bundle_id === INQ) || null;
  t("the published case and its one member reach a caller with no credential at all",
    [!!CASE_ROW, !!MEMBER_ROW, MEMBER_ROW?.ord], [true, true, 0]);

  /* THE THREE NEW FACTS, AND THE ASSERTION IS THAT THEY ARE PRESENT AND EMPTY.
     Present, because a key that is absent is a key a consumer cannot read and a
     CASE-2 that fills it would be changing a shape rather than a value. Empty,
     because nothing has authored a designation, pinned a version or named a
     project — and this record does not answer a question nobody asked it. */
  t("the case row carries `project_id`, PRESENT and NULL: this case was published before DEC-72's model "
  + "and no project owns it, which is a state of the record rather than a gap in the answer",
    ["project_id" in (CASE_ROW || {}), CASE_ROW?.project_id ?? null], [true, null]);
  /* CORRECTED 2026-08-10 BY CASE-3, NEVER EXEMPTED, AND THE OLD ASSERTION WAS
     RIGHT WHEN IT WAS WRITTEN. It read `version_sha` PRESENT and NULL, which was
     the true state of the record while nothing wrote the column — CASE-1 built
     the object and deliberately wrote no pin. **CASE-3 is the item that pins a
     version**, exactly as this suite's own `production` sentence said it would
     ("null until CASE-2 authors a role and CASE-3 pins a version"), so a member
     ratified into a case now carries the hash its member SIGNED. Asserting NULL
     here would now be asserting that the freeze did not happen.
     THE TWO HALVES ARE SPLIT because they are now two different facts, and that
     split is the point rather than a tidy-up: `role` is STILL null, because
     CASE-2 has not landed and a designation may not be invented by a migration
     or by a default — which is the half of the original claim that has not
     moved, and it keeps its original wording. */
  t("the member row carries `role` PRESENT and NULL — nobody has designated this member load-bearing "
  + "or supporting, and a migration may not invent one (a default would be a designation nobody "
  + "authored). CASE-2 is the item that fills it",
    ["role" in (MEMBER_ROW || {}), MEMBER_ROW?.role ?? null], [true, null]);
  t("and it carries `version_sha` PRESENT and PINNED to the hash this member SIGNED — CASE-3 landed "
  + "the freeze this suite predicted, and the expectation is the sha fed to ssh-keygen rather than the "
  + "column being read back",
    ["version_sha" in (MEMBER_ROW || {}), MEMBER_ROW?.version_sha === SIGNED_SHA,
     /^[0-9a-f]{64}$/.test(String(MEMBER_ROW?.version_sha))],
    [true, true, true]);
  /* AND THE ROW SURVIVED THE JOIN. A LEFT JOIN written as an inner one would
     drop every pre-DEC-72 case off the public index the moment this table
     landed — the record losing published material because it gained a column.
     Block 2 is the only place that can see it, because the join has nothing to
     drop until a real case exists. */
  t("a case with NO owning project is still ON the index — the join that binds a case to its project is "
  + "LEFT, so gaining this table cannot delete published cases from the public record",
    (idx.cases || []).length >= 1, true);
}

/* ====================================================================== 3
 * THE DESIGN DOCUMENT IS THE EXPECTATION.
 *
 * `CASE-AS-PRODUCTION.md` is Bob's ruled design. It was written before this
 * schema, it is owned by nobody working in this worktree, and this item is
 * forbidden to edit it — so it cannot move to agree with a mistake here. That is
 * the whole point: an expected set derived from the thing under test proves
 * nothing, and three items shipped exactly that assertion today.
 *
 * IT IS LOOKED FOR IN BOTH HOMES ON PURPOSE. CASE-6's definition of done
 * ARCHIVES this document to `docs/archive/`, where `decided.mjs` still scans it.
 * A suite that knew only the working path would go red on a correct landing, and
 * a suite that silently skipped when the file moved would stop asserting on the
 * day the arc completes.
 */
console.log("\n--- 3. the DESIGN DOCUMENT names what a case member is, and the schema answers it ---");
{
  const homes = [join(DIR, "..", "..", "docs", "development", "CASE-AS-PRODUCTION.md"),
                 join(DIR, "..", "..", "docs", "archive", "CASE-AS-PRODUCTION.md")];
  const home = homes.find((p) => existsSync(p)) || null;
  t("the ruled design is FOUND, in `docs/development/` or in `docs/archive/` where CASE-6 will move it — "
  + "an expectation that cannot be loaded is an assertion that stops asserting",
    home !== null, true);
  const design = home ? readFileSync(home, "utf8") : "";
  const bullet = (/- \*\*CASE-1 · the case object\.\*\*([\s\S]*?)(?=\n- \*\*CASE-2)/.exec(design) || [])[1] || "";
  /* WHITESPACE-FLATTENED BEFORE ANYTHING IS ASKED OF IT, and this is not tidying:
     the bullet is HARD-WRAPPED prose in a file this item may not edit, so
     `membership` and `rows` sit on two lines today and could sit on one tomorrow.
     An expectation that goes red when somebody re-flows a paragraph is an
     expectation the next session deletes. It cost this suite its first run. */
  const flat = bullet.replace(/\s+/g, " ").trim();
  t("and its CASE-1 bullet is READ, not assumed — a regex that matched nothing would let every "
  + "assertion below pass over an empty string",
    [flat.length > 60, /membership rows/.test(flat)], [true, true]);

  /* THE CORRESPONDENCE IS DECLARED HERE AND THE MEMBERSHIP IS DEMANDED THERE.
     The left of each pair is a phrase this suite looks for IN THE DOCUMENT; the
     right is the column this schema answers it with. Neither side is derived
     from the other, so deleting a column leaves the document still demanding it
     and the pair goes red. */
  const DEMANDED = [
    ["finding id",   "bundle_id"],
    ["version hash", "version_sha"],
    ["role",         "role"],
    ["ordinal",      "ord"],
  ];
  t("the DOCUMENT names all four facts of a membership row — if it did not, the table below would be "
  + "answering a demand nobody made",
    DEMANDED.filter(([phrase]) => !flat.includes(phrase)).map(([p]) => p), []);
  t("and the WIRE answers every one of them on the member row driven in block 2 — the document says "
  + "what a member is and the plane says whether a caller can read it",
    DEMANDED.filter(([, col]) => !(col in (MEMBER_ROW || {}))).map(([p]) => p), []);

  /* THE TWO ROLE VALUES ARE THE DOCUMENT'S, NOT THIS SUITE'S. The bullet writes
     them hyphenated as English; the schema stores them snake_case as every other
     closed vocabulary in this file does. The MAPPING is the thing pinned, so a
     third spelling arriving in CASE-2 has to move this line and say why. */
  t("the document's role vocabulary is exactly two values, and the schema declares the same two in this "
  + "project's own spelling — pinned so CASE-2 and CASE-6 cannot each invent a third",
    [/role load-bearing\|supporting/.test(flat),
     /'load_bearing' \| 'supporting'/.test(SCHEMA_SRC)],
    [true, true]);

  /* THE OTHER TWO CLAUSES OF THE BULLET, each asked of the schema rather than of
     this suite's memory of it. */
  t("the document requires case identity OWNED BY A PROJECT, and the schema binds it on the CASE and "
  + "never on the edition — one row per case_id, so an owner cannot change between editions and take "
  + "the standard of evidence with it",
    [/case identity owned by a project/.test(flat),
     /CREATE TABLE IF NOT EXISTS cases \(\n\s+case_id\s+TEXT PRIMARY KEY,/.test(SCHEMA_SRC)],
    [true, true]);
  t("the document requires EDITIONS PER CASE, and they are keyed (case_id, edition) on the table that "
  + "already holds the ceremony DEC-72 leaves unchanged — a second editions table would be a second "
  + "authority for which editions a case has",
    [/editions per case/.test(flat),
     /PRIMARY KEY \(case_id, edition\)/.test(SCHEMA_SRC)],
    [true, true]);

  /* STRUCTURAL, AND LABELLED AS SUCH BECAUSE NO OP CAN REACH IT. DEC-72 removes
     the project-less publication path outright, so a `cases` row that named no
     project would be the shape the ruling deletes. Nothing writes this table
     until CASE-2, so there is no act to drive it through; the constraint is
     pinned against the schema and the limit is stated rather than dressed up. */
  t("STRUCTURAL (no op reaches this until CASE-2): `project_id` is NOT NULL, so the project-less "
  + "publication path DEC-72 removes cannot be represented — and a pre-DEC-72 case is stated by having "
  + "NO ROW, never by a null project that would read as an owner the record lost",
    /project_id TEXT NOT NULL,/.test(SCHEMA_SRC), true);
}

} finally {
  await mf.dispose();
}

/* ============================ NEGATIVE CONTROL ============================
 *
 * NEGATIVE CONTROL: RUN 2026-08-10 (worktree `agent-a1af1f1e654822176`), five
 * arms plus a baseline, each armed ALONE with every other defence held open,
 * re-runnable in one step with `node test/caseobject.control.mjs [arm]`. Every
 * restore verified by CONTENT and by sha256 against a uniquely-named per-arm
 * pristine copy taken inside this worktree. THE SUITE IS 17 ASSERTIONS WHOLE and
 * every count below is what the run MEASURED, not what it expected:
 *
 *   (0) BASELINE — nothing armed -> 17 pass, 0 fail. Not decoration: it is what
 *               distinguishes five-arms-working from five-arms-broken.
 *
 *   (a) THE OBJECT ITSELF — rename `cases` out of schema.mjs, so the table this
 *       item exists to add is gone. -> 8 pass, 9 FAIL. The public index's LEFT
 *       JOIN names a table SQLite cannot resolve and op=publishedmanifest goes
 *       down whole, taking every behavioural arm with it. THAT IS THE FINDING
 *       AND NOT A BLUNT ARM: it is the evidence that this schema is reached by a
 *       caller rather than believed on its existence in a file.
 *
 *   (b) THE TWO MEMBER FACTS — drop `version_sha` and `role` from BOTH
 *       schema.mjs and store.mjs's ADD COLUMN ladder. -> 8 pass, 9 FAIL, and the
 *       list includes block 3's document-driven arm naming the two columns,
 *       because the DESIGN DOCUMENT still demands them. Both halves are armed
 *       together deliberately: a fresh store takes the CREATE TABLE and a
 *       migrated one takes the ladder, so breaking either alone leaves the other
 *       supplying the column and measures nothing.
 *
 *   (c) THE JOIN'S DIRECTION — LEFT JOIN becomes an inner JOIN in
 *       publishedManifest(). -> 14 pass, 3 FAIL, AND THE THREE ARE ALL IN BLOCK
 *       2 WHILE BLOCK 1 STAYS ENTIRELY GREEN. That asymmetry is the arm's whole
 *       value and it was declared before the run and confirmed by it: over an
 *       empty store an inner join answers `[]` exactly as a left join does, so
 *       only a REAL published case can see a change that DELETES published
 *       material from the public record. Block 1 alone would have passed this
 *       defect straight through.
 *
 *   (d) OVER-STRICTNESS, the direction a control usually forgets — give `role` a
 *       `NOT NULL DEFAULT 'supporting'`, a fence TIGHTER than its rule.
 *       -> 16 pass, 1 FAIL, and the one failure is block 2's `role` arm. THE
 *       SHIPPED RATIFY PATH STILL SUCCEEDS: the case publishes, ratifies and
 *       reaches the public index exactly as before, and the member simply comes
 *       back DESIGNATED `supporting` BY NOBODY. Nothing else in the plane
 *       notices. That is why the arm exists — a default looks like caution and
 *       is an authored designation manufactured by a migration, which is the
 *       overclaim class pointed at what a group told its readers.
 *       CORRECTED AFTER ITS FIRST RUN, and the correction is recorded rather
 *       than smoothed: the first version deleted the whole column line, which
 *       also removed the vocabulary comment block 3 greps, so it measured 16/1
 *       as 15/2 with one collateral failure. An over-strictness arm that drags
 *       an unrelated assertion down cannot say which direction it proved.
 *
 *   (e) REACH — point block 3's design-document lookup at a path that does not
 *       exist. -> 11 pass, 6 FAIL: the whole of block 3 that depends on the
 *       document, WHILE BLOCKS 1 AND 2 STAY ENTIRELY GREEN. A detector that
 *       finds nothing passes everything, so the arm proving the expectation is
 *       really loaded has to be separate from the arms that use it.
 * ======================================================================== */

console.log(`\ncaseobject: ${pass} pass, ${fail} fail`);
/* D-186/D-282 and hygiene.test.mjs's own rule: a suite ENDS on its own result, and the
   exit is the LAST thing in the file so a trailing comment cannot push it out of the
   tail hygiene reads. `fail ? 1 : 0` rather than `if (fail) process.exit(1)` because a
   suite that returns without exiting can be held open by a lingering workerd handle. */
process.exit(fail ? 1 : 0);
