/* NEGATIVE CONTROL: (RUN 2026-08-07, pl1-agent, IS-BUILD-PLAN PL-1 / IS-1. SEVEN arms, each armed ALONE and restored from the commit, with every touched file's sha256 recorded BEFORE the arm and compared after it AND `git diff` required to be empty — verified BY CONTENT as well as by hash. THE HARNESS LIVES IN THIS WORKTREE (`nc.sh` beside the repo root) and never in a shared scratchpad: a worker's harness was overwritten mid-turn by a concurrent worker on 2026-08-07, and a harness silently replaced between ARM and RESTORE reports a restore it never performed. The whole suite is 77 pass, 0 fail when the tree is whole.)
   (1) THE ITEM'S FIRST NAMED CONTROL — EDIT A FROZEN VERSION IN PLACE. In src/store.mjs promote's basis-version arm, replace `if (!prior || prior.composition === v.composition) continue;` with `continue;`. MEASURED: 68 pass, 8 FAIL. Re-promoting `opening account` with ONE WORD of its description changed is ACCEPTED — `[false,"VERSION_FROZEN","opening account"]` -> `[true,null,null]` — the C-number/code/translation arm goes with it, `changed` (which names WHICH field moved) reads `undefined`, the nothing-landed arm fails because the stored version has moved under a reader who already had it, the DEC-49 FLOOR fails because VERSION_FROZEN becomes unreachable, and the C-number pin fails with it. The OVER-STRICTNESS arm fails too and that is informative rather than noise: with the freeze gone, re-stating an unchanged composition and editing one are the same code path.
   (2) THE ITEM'S SECOND NAMED CONTROL — STRIP THE RELATIONSHIP FIELD. In checks/bio-checks.mjs basisVersionFindings, replace `if (!VERSION_RELATIONSHIPS.includes(rel)) {` with `if (false && !VERSION_RELATIONSHIPS.includes(rel)) {`. MEASURED: 74 pass, 3 FAIL at BOTH gates — the DEC-49 FLOOR (`VERSION_NO_RELATIONSHIP` unreachable), the C-number pin, and the both-gates arm (`[true,true]` -> `[false,false]`: op=promote stops refusing AND the catalog finds nothing wrong with the same bytes). AND THE ARM MEASURED SOMETHING THE ITEM DID NOT PREDICT: the version STILL DOES NOT LAND. The relationship is defended TWICE — absence (C-25.3) and disagreement with the partition (C-25.4) — and a version with no relationship at all also disagrees with its own single ground, so the second arm catches what the first stopped refusing. That is REC-42's two-independent-defences shape arriving at a different rule, and it is why (2b) exists.
   (2b) BOTH RELATIONSHIP DEFENCES DOWN, which is what it takes to make the harm VISIBLE. Additionally replace `} else if (labels.size) {` with `} else if (false && labels.size) {`. MEASURED: 73 pass, 4 FAIL, and the fourth is the one that says what the defect IS: `and NOTHING LANDS` reads `[0,[]]` -> `[1,[""]]` — a version with NO STATED RELATIONSHIP is written, reads back with an empty one, and is therefore the flat implicit-AND basis REC-42 corrected, re-shipped inside the object built to end it. That arm was ADDED while running this control, because the first run failed in three places and none of them named the harm.
   (3) THE TRAP, PINNED RATHER THAN TRUSTED — A SECOND VERSION TABLE AND A SECOND WRITE SITE. Add `CREATE TABLE IF NOT EXISTS inquiry_basis_versions_shadow (bundle_id TEXT, name TEXT);` before the host_governor block in src/schema.mjs, and a method outside promote carrying an `INSERT INTO inquiry_basis_versions (...)`. MEASURED: 74 pass, 3 FAIL, each naming its own half — "ONE WRITE SITE" reports `[2,1]`, the table-set arm reports the shadow by name, and the REACH arm fails. hygiene.test.mjs ALSO fails, naming `inquiry_basis_versions_shadow` as uncovered by purge. NOTE the shape the control forces: the walk counts over COMMENT-STRIPPED source and is guarded BOTH WAYS (block 10 asserts the stripper removed something AND that a known statement survived), because a walk that stripped everything would report ONE write site over an empty corpus — the ceiling-without-a-floor failure REC-70 measured.
   (4) D-113 — A NEW DERIVED TABLE ABSENT FROM `purge`. Remove `"inquiry_basis_versions"` from purge's TABLES list in src/store.mjs. MEASURED: 76 pass, 1 FAIL here — `op=stats`' count does NOT move (`[true,true]` -> `[false,true]`) — AND hygiene.test.mjs's D-113 sweep fails naming the table. AND THE ARM MEASURED THE SILENT LEFTOVER IN ITS EXACT FORM: the OP-LEVEL arm still PASSES, because the purged bundle is gone and the gate therefore answers empty while the rows sit in the table unreachable and uncounted by anything except stats. That is precisely why the stats arm is here and why "prove it by consequence" needs two readers, not one.
   (5) THE PRUNE OFFER MADE TO DELETE RATHER THAN HIDE. Add ` AND hidden = 0` to both the `total` count and the rows SELECT in src/store.mjs basisVersions. MEASURED: 73 pass, 4 FAIL in block 8 — `[2,true,true,2]` -> `[1,false,null,0]`: the hidden version stops existing for every reader, `total` drops, its legs go with it, and the source-level arm that pins the absence of such a filter fails. D-214 rules that the rejection PATTERN is queryable only if the acts persist, and DEC-29(b)'s wording promise ("hidden versions stay in the record and stay queryable") is worth nothing if the query stops answering.
   (6) §14b.7 — MAKE THE VERSION A CHILD OF ITS RUN. The acceptance half runs on the whole tree: the proposing run is DELETED out of ai_runs, ai_run_bounds and ai_run_log through the probe door, op=airun then answers that no such run exists, and the version reads back BYTE-IDENTICALLY with its run still named. The CONTROL half breaks it — replace basisVersions' row read with `SELECT v.* FROM inquiry_basis_versions v JOIN ai_runs ar ON ar.run = v.run WHERE v.bundle_id=? ...`. MEASURED: 52 pass, 25 FAIL, the widest arm in this suite, because a version whose run is gone or was never named simply vanishes: the survival arm reads `null` where a whole version belongs, and with it go every arm that reads a version at all. That is the shape of the defect §14b.7 exists to refuse, and the reason the guarantee is enforced by the ABSENCE of a join rather than by a promise about one. */
/* IS-BUILD-PLAN PL-1 / IS-1 — VERSIONS OF THE INQUIRY'S BASIS.
 *
 * Bob, 2026-08-05: an inquiry's basis supports multiple VERSIONS, each a
 * complete alternative account of the support for the inquiry's claim rather
 * than a patch to another one. §5 is why: a set of legs is a composition that
 * tells a story, so the composition is the unit of meaning and therefore the
 * unit of change.
 *
 * WHAT IS ASSERTED, each in the direction that fails:
 *
 *  1. WRITE v1, DERIVE v2 — through op=promote and read back through
 *     op=basisversions, with the ground partition AND the stated relationship
 *     present on BOTH. A version that is a flat leg set cannot express
 *     plurality, and a version with no relationship field re-ships the flat
 *     implicit-AND basis REC-42 corrected (§3, SWEEP C5).
 *
 *  2. v1 IS BYTE-FROZEN, asserted BY CONTENT and not only by a digest: every
 *     published field of v1 is compared before and after an unrelated later
 *     promotion, and the canonical composition is compared byte for byte.
 *
 *  3. THE FREEZE REFUSES AN IN-PLACE EDIT by C-number, with a DEC-49 code, a
 *     canned translation, and the FIELD that moved named — because a refusal
 *     that says only "something changed" leaves a member to re-derive a diff
 *     the store has already computed.
 *
 *  4. NAMES ARE UNIQUE PER INQUIRY AND ONLY PER INQUIRY. The over-strictness
 *     arm is the second half: the SAME name on a DIFFERENT inquiry must LAND,
 *     because global uniqueness would make naming absurd (§6 rule 2).
 *
 *  5. `derived_from` IS THE EDGE AND THIS IS ITS FIRST REAL PRODUCER. The
 *     vocabulary has held the word since State Rules v1.5 with no producer in
 *     the store; the tree is read here, an edge to a version that is not there
 *     is refused, and a cycle is refused.
 *
 *  6. PRUNE HIDES AND NEVER DELETES (D-214, DEC-29(b), SWEEP C1). A hidden
 *     version stays in the record, stays queryable, keeps its legs and keeps
 *     counting in `total` — the DISPLAY shrinks and the acts remain.
 *
 *  7. REWORD IS USER-SELECTABLE (D-217b, §6.3b): the same rewording lands as a
 *     VERSION carrying a claim and as a SEPARATE INQUIRY, and the plane refuses
 *     neither — which is what "the schema supports both" has to mean.
 *
 *  8. AN EDIT THAT REGROUPS THE PARTITION RIDES REC-45's ATTRIBUTED ACT
 *     (DEC-50, §6.7): a derived version whose partition differs from its
 *     parent's is refused without a named member, a date and a reason; a
 *     machine identity is refused by the one predicate; and an edit that
 *     changes only the EVIDENCE is NOT a regroup and passes untouched.
 *
 *  9. §14b.7 — A VERSION SURVIVES THE DEATH OF THE RUN THAT PROPOSED IT.
 *     Identity is not the run's.
 *
 * 10. NO SECOND VERSION TABLE AND ONE WRITE SITE (D-21), asserted
 *     STRUCTURALLY over comment-stripped real source with the walk guarded both
 *     ways and re-run over a corpus that DOES carry the forbidden thing.
 *
 * 11. D-113: both tables in `purge`, proved by CONSEQUENCE through the op.
 *
 * 12. THE ENVELOPE (IC-25/26/27/28): the bound PUBLISHED is the bound APPLIED,
 *     `truncated` settles completeness in both directions, and the EMPTY answer
 *     carries them too — REC-70's lesson, where a not-found return was the one
 *     shape a bound sweep could not see.
 *
 * 13. DEC-49: every refusal carries a C-number, a wire code and a canned
 *     translation from ONE row, and the set of codes the plane can actually
 *     SEND is DRIVEN and required to EQUAL the registry — a floor as well as a
 *     ceiling, because a ceiling passes trivially over nothing.
 *
 * TWO STANDING BOUNDS ARE STATED HERE RATHER THAN SILENTLY VIOLATED, and both
 * are asserted rather than written in prose: D-164 is unlanded, so a version's
 * legs address WHOLE BUNDLES and no leg row carries an extent; and D-184 /
 * C-2.8 bound the leg vocabulary to information or inquiry and nothing else.
 *
 * NO MEMBER-FACING STRING IN THIS ITEM SAYS "ground", "partition", "AND" or
 * "OR" as a member-facing word — DEC-32's elicitation clause 1 and D-226 — and
 * block 13 asserts that of every canned translation directly.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle, parseFrontmatter, BASIS_VERSION_CHECKS,
         /* CORRECTED 2026-08-08 (PL-2 / IS-2): the catalog now holds a SECOND
            C-25 family — the six member ops' refusals — and block 13's
            "no C-25 number outside its own row" pin counts literals across the
            whole file, so it must know about both families or it fails on a
            correct addition. Imported rather than the count loosened. */
         VERSION_ACT_CHECKS,
         VERSION_STATES, VERSION_RELATIONSHIPS } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");
const CHECKS_SRC = readFileSync(fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url)), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT READS throughout. D-93's class inside a control has been sighted
   seven times here: an arm that throws on `.findings[0]` of undefined takes
   every arm behind it with it and reports one defect as none. */
const codesOf = (r) => [...new Set([
  ...(r && typeof r.code === "string" ? [r.code] : []),
  ...((r?.findings ?? []).map((x) => x?.code).filter((x) => typeof x === "string")),
])].sort();
const firstFinding = (r) => (Array.isArray(r?.findings) && r.findings[0]) ? r.findings[0] : {};

/* ------------------------------------------------------------------- probe
 *  THE REAL worker and the REAL Store, with ONE extra door: killing a run.
 *  §14b.7's acceptance is that a version outlives the run that proposed it, and
 *  `ai_runs` is SCRATCH with an expiry (§11) — the rows are meant to go. No op
 *  deletes them today, so the death is staged here rather than asserted about.
 *  The door touches NOTHING ELSE: it is three DELETEs keyed on one run id, and
 *  every version read in this suite goes through the real op. */
const PROBE_SRC = `
import worker from "./index.mjs";
import { Store } from "./store.mjs";
export class ProbeStore extends Store {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/killrun") {
      const run = url.searchParams.get("run");
      this.sql.exec("DELETE FROM ai_run_log WHERE run = ?", run);
      this.sql.exec("DELETE FROM ai_run_bounds WHERE run = ?", run);
      this.sql.exec("DELETE FROM ai_runs WHERE run = ?", run);
      const left = [...this.sql.exec("SELECT count(*) c FROM ai_runs WHERE run = ?", run)][0].c;
      return Response.json({ result: { ok: true, run, rows_left: left } });
    }
    return super.fetch(req);
  }
}
export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname.startsWith("/probe/"))
      return env.STORE.get(env.STORE.idFromName("bio"))
        .fetch(new Request("http://do/" + u.pathname.slice(7) + u.search));
    return worker.fetch(req, env, ctx);
  },
};
`;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("versions-probe.mjs"), script: PROBE_SRC,
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl1", MEMBER_TOKEN: "mem-pl1", PROBE_TOKEN: "prb-pl1", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const KILLRUN = async (run) => rP(await (await mf.dispatchFetch(
  `http://x/probe/killrun?run=${encodeURIComponent(run)}`)).json());

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-pl1",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);
/* An ADMINISTRATOR because Membership section 4 requires the second member of a
   group to be one (ADMINS_FIRST). Nothing in this suite turns on the role — what
   it is here for is that a SECOND identified session reads the same versions. */
const DAVE = await enrol("dave", "admin", ["contribute"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];

/* THE VERSION BLOCK, as THREE SIBLING ARRAYS joined by the version's NAME —
   `basis[]`/`grounds[]`'s own idiom one level up. It is also what the restricted
   frontmatter grammar can express: the parser reads arrays of objects with
   SCALAR properties, so a version carrying its legs as a nested array would not
   parse at all. That was MEASURED against parseFrontmatter before the shape was
   chosen, and block 1 measures it again here rather than inheriting it. */
const scalar = (k, v) => v === null ? [`    ${k}: null`]
  : v === undefined ? []
  : typeof v === "boolean" ? [`    ${k}: ${v}`]
  : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  if (versions === null) return [];
  const rows = versions.map((v) => ["  - name: \"" + v.name + "\"",
    ...scalar("description", v.description),
    ...scalar("relationship", v.relationship),
    ...scalar("state", v.state === undefined ? "suggested" : v.state),
    ...scalar("derived_from", v.derived_from === undefined ? null : v.derived_from),
    ...scalar("hidden", v.hidden === undefined ? false : v.hidden),
    ...scalar("claim", v.claim),
    ...scalar("run", v.run),
    ...scalar("author", v.author === undefined ? "ruth" : v.author),
    ...scalar("at", v.at === undefined ? NOW : v.at),
    ...scalar("regroup_by", v.regroup_by),
    ...scalar("regroup_at", v.regroup_at),
    ...scalar("regroup_note", v.regroup_note),
    /* ADDED 2026-08-08 (PL-2 / IS-2): who moved this reading, when and why. §6
       rule 4 requires an authored reason on the two states a member enters WITH
       one, so a fixture that names such a state and nothing else is no longer a
       well-formed document. */
    ...scalar("state_by", v.state_by),
    ...scalar("state_at", v.state_at),
    ...scalar("state_reason", v.state_reason)].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    ["  - version: \"" + v.name + "\"", ...scalar("ground", g.ground),
     ...scalar("asserted_by", g.asserted_by === undefined ? "ruth" : g.asserted_by),
     ...scalar("at", g.at === undefined ? NOW : g.at),
     ...scalar("statement", g.statement)].join("\n")));
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    ["  - version: \"" + v.name + "\"", ...scalar("target", l.target),
     ...scalar("role", l.role === undefined ? "supports" : l.role),
     ...scalar("ground", l.ground),
     ...scalar("grade", l.grade), ...scalar("grade_axis", l.grade_axis),
     ...scalar("grade_source", l.grade_source),
     ...scalar("note", l.note), ...scalar("date", l.date)].join("\n")));
  return [
    "basis_versions:", ...rows,
    ...(grounds.length ? ["basis_version_grounds:", ...grounds] : []),
    ...(legs.length ? ["basis_version_legs:", ...legs] : []),
  ];
};

const inquiryMd = (id, { question = `What does ${id} rest on?`, refs = [], versions = null } = {}) => ["---",
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
  ...versionLines(versions),
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
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const projectMd = (id) => ["---", `id: ${id}`, "object_type: project",
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "---", "", "## Summary", "", "A project.", ""].join("\n");

const promote = async (id, text, type, base = null, tok = RUTH) => POST(`op=promote&token=${tok}`, {
  bundleId: id, base,
  snapKey: `${id}-${Math.random().toString(36).slice(2, 8)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }]
    : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : type === "project" ? "forming" : "collected",
          created: NOW, last_updated: LATER } });
/* THE CAS. op=promote returns `bundleSha`, and a revision must carry the
   current one as its base. Read from the store rather than remembered, so an
   arm that promotes out of order still threads the right base. */
const shaOf = async (id) => (await GET(`op=list&token=${RUTH}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (!r.ok) throw new Error(`promote ${a[0]}: ${JSON.stringify(r).slice(0, 900)}`);
  return r;
};

const LEDGER = "INFO-2026-1000-ledger", MINUTES = "INFO-2026-1000-minutes";
const AUDIT = "INFO-2026-1000-audit", EMAIL = "INFO-2026-1000-email";
for (const d of [LEDGER, MINUTES, AUDIT, EMAIL]) await mustPromote(d, infoMd(d), "information");
const PROJ = "PROJ-2026-1000-oversight";
await mustPromote(PROJ, projectMd(PROJ), "project");

const INQ = "INQ-2026-1000-sewer-transfers";
const versionsOf = async (id, extra = "", tok = RUTH) =>
  GET(`op=basisversions&token=${tok}&id=${encodeURIComponent(id)}${extra}`);
const byName = (a, n) => (a?.versions ?? []).find((v) => v.name === n) || null;

/* THE TWO COMPOSITIONS THE ITEM IS ABOUT. v1 says every part is needed (one
   ground). v2 is DERIVED from it and says either part would carry the answer
   (two grounds), which is a REGROUP and therefore carries REC-45's act. */
const V1 = {
  name: "opening account", relationship: "and",
  description: "The first reading: the ledger and the minutes together show the transfer.",
  run: "AIRUN-2026-1000-first",
  grounds: [{ ground: "paper trail", statement: "The ledger and minutes read together." }],
  legs: [{ target: LEDGER, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" },
         { target: MINUTES, ground: "paper trail", grade: "C", grade_axis: "connection", grade_source: "testimony",
           note: "the clerk's own summary" }],
};
const V2 = {
  name: "two independent readings", relationship: "or", derived_from: "opening account",
  description: "Second reading: the audit stands alone, and so does the paper trail.",
  run: "AIRUN-2026-1000-second",
  regroup_by: "ruth", regroup_at: LATER,
  regroup_note: "the audit was not in the record when the first reading was composed",
  grounds: [{ ground: "paper trail" }, { ground: "the audit" }],
  legs: [{ target: LEDGER, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" },
         { target: MINUTES, ground: "paper trail", grade: "C", grade_axis: "connection", grade_source: "testimony" },
         { target: AUDIT, ground: "the audit", grade: "B", grade_axis: "capture", grade_source: "capture" }],
};

console.log("\n=== PL-1 / IS-1 · versions of the inquiry's basis ===");
console.log(`  corpus: store.mjs ${STORE_SRC.length} chars, schema.mjs ${SCHEMA_SRC.length}, `
  + `bio-checks.mjs ${CHECKS_SRC.length}, index.mjs ${INDEX_SRC.length} · `
  + `${Object.keys(BASIS_VERSION_CHECKS).length} refusals in the registry, `
  + `${VERSION_STATES.length} states, ${VERSION_RELATIONSHIPS.length} relationships`);

/* ====================================================================== 1
 * WRITE v1, DERIVE v2 — through the OP, with the partition and the stated
 * relationship on BOTH.
 * ==================================================================== */
console.log("\n--- 1. write v1, derive v2: the composition IS the unit ---");
{
  /* MEASURED, not assumed: the three-sibling-array shape is what the restricted
     frontmatter grammar can actually express, and a nested-array version would
     not parse. The suite re-measures it rather than inheriting the claim. */
  const nested = parseFrontmatter(["---", "id: INQ-2026-0000-x", "basis_versions:",
    "  - name: nested", "    legs:", "      - target: INFO-2026-0000-a", "---", ""].join("\n")).data || {};
  t("MEASURED: the frontmatter grammar cannot hold a version's legs as a NESTED array — which is why the "
  + "block is three sibling arrays joined by name, and not a style choice",
    Array.isArray(nested?.basis_versions?.[0]?.legs), false);

  const r1 = await mustPromote(INQ, inquiryMd(INQ, { refs: [], versions: [V1] }), "inquiry");
  const a1 = await versionsOf(INQ);
  t("v1 lands through op=promote's ONE write site and reads back through op=basisversions",
    [a1?.ok, a1?.total, (a1?.versions ?? []).map((v) => v.name)],
    [true, 1, ["opening account"]]);

  const r2 = await mustPromote(INQ, inquiryMd(INQ, { refs: [], versions: [V1, V2] }), "inquiry", r1.bundleSha);
  const a2 = await versionsOf(INQ);
  t("v2 is DERIVED from v1 and both stand: an inquiry carries MANY versions, and the new reading did not "
  + "replace the old one",
    [a2?.total, (a2?.versions ?? []).map((v) => v.name)],
    [2, ["opening account", "two independent readings"]]);

  const v1 = byName(a2, "opening account"), v2 = byName(a2, "two independent readings");
  t("THE PARTITION AND THE RELATIONSHIP ARE ON BOTH (§3, SWEEP C5): a version that is a flat leg set "
  + "cannot express plurality, and one with no relationship re-ships the flat implicit-AND basis",
    [v1?.relationship, v1?.grounds, v2?.relationship, v2?.grounds],
    ["and", ["paper trail"], "or", ["paper trail", "the audit"]]);
  t("every version carries its DESCRIPTION (§6 rule 1) — what survives a conversation that was "
  + "deliberately not kept",
    [(v1?.description ?? "").slice(0, 17), (v2?.description ?? "").slice(0, 15)],
    ["The first reading", "Second reading:"]);
  t("the DERIVATION EDGE is `derived_from` and it is read back as the tree (§6 rule 3a) — null where a "
  + "run composed it fresh",
    [v1?.derived_from, v2?.derived_from], [null, "opening account"]);
  t("each version names the RUN that proposed it (§11), and the legs travel WHOLE with their version — "
  + "a basis returned in part reads as a basis",
    [v1?.run, v1?.leg_count, (v1?.legs ?? []).length, v2?.run, v2?.leg_count, (v2?.legs ?? []).length],
    ["AIRUN-2026-1000-first", 2, 2, "AIRUN-2026-1000-second", 3, 3]);
  t("the LEG is the register's leg, whole (D-226): role, the ground it belongs to, the grade, the AXIS "
  + "the grade is on and where the grade came from",
    (v1?.legs ?? []).map((l) => [l.target_id, l.target_type, l.role, l.ground, l.grade, l.grade_axis, l.grade_source]),
    [[LEDGER, "information", "supports", "paper trail", "B", "capture", "capture"],
     [MINUTES, "information", "supports", "paper trail", "C", "connection", "testimony"]]);
  t("D-164 IS UNLANDED AND THE SHAPE SAYS SO: a version leg carries no extent, no offset and no "
  + "extraction method, so a version composes DOCUMENT-GRAIN legs and nothing pretends otherwise",
    (v1?.legs ?? []).flatMap((l) => Object.keys(l)).filter((k) => /extent|offset|extract|span|range/i.test(k)), []);
  t("REC-45's ATTRIBUTED REGROUP rides on the version that regrouped (DEC-50, §6.7) — who, when and why",
    [v2?.regroup?.by, v2?.regroup?.at, (v2?.regroup?.note ?? "").slice(0, 11), v1?.regroup],
    ["ruth", LATER, "the audit w", null]);
  t("and it is a MEMBER — the machine composes the structure and PROPOSES it; asserting it is an act "
  + "with a name on it",
    [(a2?.versions ?? []).every((v) => v.regroup === null || !/^token:|^class:/.test(v.regroup.by))], [true]);
}

/* ====================================================================== 2
 * v1 IS BYTE-FROZEN — asserted BY CONTENT, not only by a digest.
 * ==================================================================== */
console.log("\n--- 2. v1 is byte-frozen: the thing being compared does not shift underneath ---");
const FROZEN_V1 = byName(await versionsOf(INQ), "opening account");
{
  const before = JSON.stringify(FROZEN_V1);
  /* AN UNRELATED LATER PROMOTION. v1 must not move because something else in
     the same document did — which is the case a digest-only check would pass
     and a member would still be wrong about. */
  const r3 = await mustPromote(INQ, inquiryMd(INQ, {
    question: "Where did the sewer fund transfers actually go?", refs: [], versions: [V1, V2],
  }), "inquiry", await shaOf(INQ));
  const after = byName(await versionsOf(INQ), "opening account");
  t("BY CONTENT: every published field of v1 is byte-identical after an unrelated later promotion",
    JSON.stringify(after), before);
  t("AND BY THE CANONICAL COMPOSITION, which is what the freeze itself compares — the two agree, so the "
  + "content arm above is not resting on the same value the store checks",
    [after?.composition === FROZEN_V1?.composition, typeof after?.composition, (after?.composition ?? "").length > 80],
    [true, "string", true]);
  t("the composition is PUBLISHED, so a consumer can test freezing for itself rather than taking the "
  + "plane's word for it, and it names the fields it froze",
    (after?.composition ?? "").split("\n").map((l) => l.split("\t")[0]),
    ["name", "description", "claim", "relationship", "derived_from", "ground", "leg", "leg"]);
  t("and it froze the COMPOSITION, not what happened TO it: state and hidden are absent from it, because "
  + "freezing those would freeze the sixth state machine shut before IS-2 builds it",
    /\b(state|hidden|author|run)\t/.test(after?.composition ?? ""), false);
  void r3;
}

/* ====================================================================== 3
 * THE FREEZE REFUSES AN IN-PLACE EDIT — the item's first named control, run
 * here as a first-class arm so it can never be only a comment.
 * ==================================================================== */
console.log("\n--- 3. editing a frozen version in place is REFUSED by C-number ---");
{
  const cur = await shaOf(INQ);
  const edited = { ...V1, description: "The first reading: the ledger and the minutes together show a transfer." };
  const r = await promote(INQ, inquiryMd(INQ, { refs: [], versions: [edited, V2] }), "inquiry", cur);
  t("the write REFUSES, by its own reason and not folded into another one",
    [r?.ok, r?.reason, r?.version], [false, "VERSION_FROZEN", "opening account"]);
  t("and it names the C-NUMBER, the DEC-49 WIRE CODE and the CANNED TRANSLATION, from the one row",
    [firstFinding(r).check, firstFinding(r).code, firstFinding(r).translation
      === BASIS_VERSION_CHECKS.VERSION_FROZEN.translation],
    ["C-25.11", "VERSION_FROZEN", true]);
  t("AND IT NAMES WHICH FIELD MOVED — a refusal that says only that something changed leaves a member to "
  + "re-derive the diff the store has already computed",
    r?.changed, "description changed");
  t("the repair offered is the rule itself: derive a NEW version rather than moving this one",
    (firstFinding(r).repairs ?? []).some((x) => /derived_from: 'opening account'/.test(x)), true);
  const still = byName(await versionsOf(INQ), "opening account");
  t("and NOTHING LANDED: the stored version is byte-identical to the one that was there before the "
  + "refused write — the whole transaction, not just the version",
    JSON.stringify(still), JSON.stringify(FROZEN_V1));

  /* THE OVER-STRICTNESS ARM. A version whose composition is UNCHANGED must
     re-promote freely, because delete-then-insert re-projects on every
     promotion and a freeze that refused re-statement would make the record
     unable to restate itself. */
  const same = await promote(INQ, inquiryMd(INQ, { refs: [], versions: [V1, V2] }), "inquiry", cur);
  t("OVER-STRICTNESS: re-promoting the SAME composition is not an edit and is accepted — the record must "
  + "be able to restate what it already said",
    [same?.ok, same?.reason ?? null], [true, null]);
}

/* ====================================================================== 4
 * NAMES ARE UNIQUE PER INQUIRY — AND ONLY PER INQUIRY.
 * ==================================================================== */
console.log("\n--- 4. a name is unique WITHIN its inquiry, and global uniqueness would be absurd ---");
const INQ2 = "INQ-2026-1000-second-question";
{
  const dup = await promote("INQ-2026-1000-dup", inquiryMd("INQ-2026-1000-dup", { versions: [
    { ...V1, name: "one account" }, { ...V1, name: "one account", description: "A different reading entirely, same name." },
  ] }), "inquiry");
  t("two versions of ONE inquiry may not share a name: derived_from reads BY NAME, so a repeated name "
  + "makes the derivation tree ambiguous",
    [dup?.ok, dup?.reason, codesOf(dup).includes("VERSION_NAME_NOT_UNIQUE")],
    [false, "BASIS_VERSION_REFUSED", true]);

  /* THE OVER-STRICTNESS HALF, and it is the half §6 rule 2 is actually about. */
  const other = await promote(INQ2, inquiryMd(INQ2, { question: "Who authorised the transfers?", versions: [
    { ...V1, name: "opening account", description: "A different question, and its own first reading." },
  ] }), "inquiry");
  const a = await versionsOf(INQ2);
  t("OVER-STRICTNESS: the SAME name on a DIFFERENT inquiry LANDS — uniqueness is per inquiry, because a "
  + "member forced to invent a globally unique name for every small edit stops editing",
    [other?.ok, (a?.versions ?? []).map((v) => v.name)], [true, ["opening account"]]);
  t("and the two are genuinely separate compositions, not one row seen twice",
    byName(a, "opening account")?.composition === FROZEN_V1?.composition, false);
}

/* ====================================================================== 5
 * `derived_from` — ITS FIRST REAL PRODUCER, AND IT HAS TO BE A TREE.
 * ==================================================================== */
console.log("\n--- 5. derived_from: the closed vocabulary's word, and its first real producer ---");
{
  t("`derived_from` is in the CLOSED relationship vocabulary already (State Rules v1.5), so IS-1 becomes "
  + "its first real producer rather than minting a synonym — no new edge word appears anywhere",
    [/'derived_from'/.test(CHECKS_SRC),
     /\b(derives_from|version_of|forked_from|parent_version|supersedes_version)\b/.test(STORE_SRC + SCHEMA_SRC)],
    [true, false]);
  const ghost = await promote("INQ-2026-1000-ghost", inquiryMd("INQ-2026-1000-ghost", { versions: [
    { ...V1, name: "a reading", derived_from: "a version nobody wrote" },
  ] }), "inquiry");
  t("an edge to a version that is not here is REFUSED: a derivation tree pointed at nothing is a pile",
    [ghost?.ok, codesOf(ghost).includes("VERSION_DERIVED_FROM_UNKNOWN")], [false, true]);
  const cyc = await promote("INQ-2026-1000-cycle", inquiryMd("INQ-2026-1000-cycle", { versions: [
    { ...V1, name: "first", derived_from: "second" },
    { ...V1, name: "second", derived_from: "first", description: "The mirror of the first reading, exactly." },
  ] }), "inquiry");
  t("and a CYCLE is refused: versions form a TREE, and a tree has a root",
    [cyc?.ok, codesOf(cyc).includes("VERSION_DERIVATION_CYCLE")], [false, true]);
}

/* ====================================================================== 6
 * REWORD IS USER-SELECTABLE (D-217b, §6.3b) — the schema supports BOTH.
 * ==================================================================== */
console.log("\n--- 6. rewording the claim: a new version OR a new inquiry, and the plane refuses neither ---");
{
  const REW = "INQ-2026-1000-reword";
  const asVersion = await promote(REW, inquiryMd(REW, { question: "Did the transfers exceed the cap?", versions: [
    { ...V1, name: "first reading" },
    { ...V1, name: "tightened wording", derived_from: "first reading",
      claim: "The transfers exceeded the statutory cap in at least one quarter.",
      description: "Same legs, a tighter statement of what they support." },
  ] }), "inquiry");
  const a = await versionsOf(REW);
  t("A TIGHTENED WORDING THAT LEAVES THE LEGS MEANING WHAT THEY MEANT IS A VERSION, and the version "
  + "carries the claim",
    [asVersion?.ok, byName(a, "tightened wording")?.claim?.slice(0, 26), byName(a, "first reading")?.claim],
    [true, "The transfers exceeded the", null]);
  const REW2 = "INQ-2026-1000-reword-split";
  const asInquiry = await promote(REW2, inquiryMd(REW2, {
    question: "Did the transfers exceed the statutory cap in at least one quarter?",
    versions: [{ ...V1, name: "first reading" }] }), "inquiry");
  t("AND THE SAME REWORDING IS EQUALLY A NEW INQUIRY — a thing with its own falsifier is an inquiry "
  + "(DEC-32's falsifier-count test), so the runtime choice is real and the schema takes both",
    [asInquiry?.ok, (await versionsOf(REW2))?.total], [true, 1]);
  t("the claim is a FIELD and never an object: no claim table, no claim id, no claim op anywhere "
  + "(SWEEP C13 — a versioned, named, stateful claim object rebuilds the multiplicity D-127 removed)",
    [/CREATE TABLE IF NOT EXISTS claims\b/.test(SCHEMA_SRC), /\bCLAIM-\d{4}-/.test(STORE_SRC)], [false, false]);
}

/* ====================================================================== 7
 * DEC-50 / §6.7 — AN EDIT THAT REGROUPS RIDES THE ATTRIBUTED ACT.
 * ==================================================================== */
console.log("\n--- 7. regrouping the partition is an ACT with a name on it (DEC-50) ---");
{
  const base = { ...V1, name: "as composed" };
  const bare = { ...V2, name: "regrouped", derived_from: "as composed",
                 regroup_by: undefined, regroup_at: undefined, regroup_note: undefined };
  const r = await promote("INQ-2026-1000-regroup", inquiryMd("INQ-2026-1000-regroup",
    { versions: [base, bare] }), "inquiry");
  t("a derived version whose partition differs from its parent's and carries NO attributed act is "
  + "REFUSED: §6.7 licenses no unattributed structural edit",
    [r?.ok, codesOf(r).includes("VERSION_REGROUP_UNATTRIBUTED")], [false, true]);
  const machine = await promote("INQ-2026-1000-regroup-m", inquiryMd("INQ-2026-1000-regroup-m",
    { versions: [base, { ...V2, name: "regrouped", derived_from: "as composed",
                         regroup_by: "token:member", regroup_at: LATER,
                         regroup_note: "the machine regrouped it" }] }), "inquiry");
  t("and a MACHINE identity cannot make it — asked through the ONE predicate and never a word list, so "
  + "`token:member` is refused exactly as `agent` is (REC-46's measured hole)",
    [machine?.ok, codesOf(machine).includes("VERSION_REGROUP_UNATTRIBUTED")], [false, true]);

  /* THE OVER-STRICTNESS ARM, and it is the one that decides whether this rule
     is usable at all: an edit that changes only the EVIDENCE is not a regroup. */
  const evidenceOnly = { ...V1, name: "one more document", derived_from: "as composed",
    description: "The same argument with the email added to the paper trail.",
    legs: [...V1.legs, { target: EMAIL, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" }] };
  const ok = await promote("INQ-2026-1000-regroup-ok", inquiryMd("INQ-2026-1000-regroup-ok",
    { versions: [base, evidenceOnly] }), "inquiry");
  t("OVER-STRICTNESS: adding a leg INSIDE the partition it inherited is not a regroup and needs no act — "
  + "a rule that fired on every edit would make members stop deriving versions",
    [ok?.ok, ok?.reason ?? null], [true, null]);
}

/* ====================================================================== 8
 * PRUNE HIDES AND NEVER DELETES (D-214, DEC-29(b), SWEEP C1).
 * ==================================================================== */
console.log("\n--- 8. the prune flag HIDES: the display shrinks, the acts remain ---");
{
  const cur = await shaOf(INQ);
  const r = await promote(INQ, inquiryMd(INQ, { versions: [{ ...V1, hidden: true }, V2] }), "inquiry", cur);
  t("hiding a version is not an edit to its COMPOSITION, so the freeze does not refuse it — the state "
  + "machine and the prune flag move, the composition does not",
    [r?.ok, r?.reason ?? null], [true, null]);
  const a = await versionsOf(INQ);
  const v1 = byName(a, "opening account");
  t("THE HIDDEN VERSION IS STILL THERE, still counted, still carrying every leg — D-214: the rejection "
  + "PATTERN is queryable only if the acts persist",
    [a?.total, v1 !== null, v1?.hidden, (v1?.legs ?? []).length], [2, true, true, 2]);
  t("and its composition is UNMOVED by being hidden, which is what makes hiding reversible without a "
  + "second act to undo it",
    v1?.composition, FROZEN_V1?.composition);
  t("THE FLAG IS PUBLISHED so a surface can shrink its DISPLAY — that is what 'delete' means at the UI "
  + "altitude (DEC-16/DEC-19's never-vanishes-silently posture)",
    typeof v1?.hidden, "boolean");
  t("and there is NO filter on the op to remove hidden versions: an op that filtered them here would "
  + "make hiding into deleting one layer down, which is exactly the collision SWEEP C1 found",
    /hidden\s*=\s*0|hidden\s*<>\s*1|AND\s+NOT\s+hidden/.test(STORE_SRC.slice(
      STORE_SRC.indexOf("basisVersions({"), STORE_SRC.indexOf("basisVersions({") + 4200)), false);
  const notBool = await promote("INQ-2026-1000-hidden", inquiryMd("INQ-2026-1000-hidden",
    { versions: [{ ...V1, hidden: "archived" }] }), "inquiry");
  t("and the flag admits no third value: hiding is ALL it does, so 'archived' is refused rather than "
  + "quietly meaning something",
    [notBool?.ok, codesOf(notBool).includes("VERSION_HIDDEN_NOT_BOOLEAN")], [false, true]);
  /* restore, so later blocks read the ordinary state */
  const cur2 = await shaOf(INQ);
  await mustPromote(INQ, inquiryMd(INQ, { versions: [V1, V2] }), "inquiry", cur2);
}

/* ====================================================================== 9
 * §14b.7 — A VERSION SURVIVES THE DEATH OF THE RUN THAT PROPOSED IT.
 * ==================================================================== */
console.log("\n--- 9. §14b.7: identity is not the run's ---");
{
  const RUN = "AIRUN-2026-1000-doomed";
  const opened = await POST(`op=airunopen&token=${RUTH}`, {
    run: RUN, contextType: "inquiry", contextId: INQ, label: "the run that will die",
    mode: "background", principalClaude: "claude-account:oakland", skillVersion: "is-skill@1",
    state: "{}", bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }],
  });
  t("MEASURED, not assumed: the run really exists first, so the death below is a real death and not a "
  + "run that was never there",
    [opened?.started, (await GET(`op=airun&token=${RUTH}&run=${RUN}`))?.session != null],
    [true, true]);

  const SURV = "INQ-2026-1000-survival";
  await mustPromote(SURV, inquiryMd(SURV, { question: "Does a version outlive its run?", versions: [
    { ...V1, name: "composed by the doomed run", run: RUN },
  ] }), "inquiry");
  const before = byName(await versionsOf(SURV), "composed by the doomed run");

  const killed = await KILLRUN(RUN);
  const gone = await GET(`op=airun&token=${RUTH}&run=${RUN}`);
  t("THE RUN IS DEAD — its row, its budget and its observation log are gone, and the plane says so",
    [killed?.rows_left, gone?.session ?? null], [0, null]);

  const after = byName(await versionsOf(SURV), "composed by the doomed run");
  t("AND THE VERSION SURVIVES IT, byte-identically — identity is not the run's (§14b.7)",
    JSON.stringify(after), JSON.stringify(before));
  t("with the run STILL NAMED, because what composed it is a fact about the version and not a live "
  + "reference: the record says which run, and the run being gone does not unsay it",
    after?.run, RUN);
  t("and it is enforced by the ABSENCE of a join rather than by a promise about one — nothing in the "
  + "version read touches ai_runs",
    /ai_runs/.test(STORE_SRC.slice(STORE_SRC.indexOf("basisVersions({"),
                                   STORE_SRC.indexOf("basisVersions({") + 4200)), false);

  /* THE STRUCTURAL HALF: promote does not RESOLVE the run either, which is the
     stated departure from the resolve-or-refuse posture every other id-bearing
     field takes. If it did, a version could not be written after its run had
     been reaped — and a resumed run's partial results are exactly that case. */
  const NEVER = "INQ-2026-1000-never-ran";
  const r = await promote(NEVER, inquiryMd(NEVER, { question: "And a run that never existed?", versions: [
    { ...V1, name: "composed by nobody", run: "AIRUN-2026-9999-never-existed" },
  ] }), "inquiry");
  t("a version naming a run this store has NEVER held is written, deliberately: requiring the run to "
  + "resolve would make version identity a child of a scratch row's lifetime",
    [r?.ok, byName(await versionsOf(NEVER), "composed by nobody")?.run],
    [true, "AIRUN-2026-9999-never-existed"]);
}

/* ====================================================================== 10
 * NO SECOND VERSION TABLE, ONE WRITE SITE (D-21) — PINNED, NOT TRUSTED.
 * ==================================================================== */
console.log("\n--- 10. the trap: no second version table, and ONE write site ---");
{
  /* TEXT-ANCHORED PINS COUNT OVER COMMENT-STRIPPED SOURCE, GUARDED BOTH WAYS.
     A stripper that removed everything would report ONE write site over an
     empty corpus — the ceiling-without-a-floor failure REC-70 measured — so the
     guard asserts the stripper removed something AND that a known statement
     survived it. */
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  const CODE = strip(STORE_SRC);
  const SCHEMA_CODE = SCHEMA_SRC.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  t("WALK GUARD (both ways): the comment stripper removed a substantial share of store.mjs AND left the "
  + "code standing — a walk over an empty corpus reports a clean answer about nothing",
    [CODE.length < STORE_SRC.length * 0.75, CODE.includes("INSERT INTO inquiry_basis_versions"),
     SCHEMA_CODE.length < SCHEMA_SRC.length * 0.75, SCHEMA_CODE.includes("CREATE TABLE IF NOT EXISTS inquiry_basis_versions")],
    [true, true, true, true]);
  const writes = (src, table) => (src.match(new RegExp(`(INSERT|REPLACE|UPDATE)\\s+(OR\\s+\\w+\\s+)?(INTO\\s+)?${table}\\b`, "g")) || []).length;
  const w1 = writes(CODE, "inquiry_basis_versions");
  const w2 = writes(CODE, "inquiry_basis_version_legs");
  console.log(`  corpus: ${CODE.length} code chars in store.mjs, ${SCHEMA_CODE.length} in schema.mjs · `
    + `${w1} write(s) to inquiry_basis_versions, ${w2} to inquiry_basis_version_legs`);
  t("ONE WRITE SITE EACH, and it is inside op=promote's transaction: a version table an op could append "
  + "to directly is a second place to state a fact bundle.md already holds (D-21)",
    [w1, w2], [1, 1]);
  const promoteBody = CODE.slice(CODE.indexOf("promote(pkg) {"), CODE.indexOf("recordLinks("));
  t("and the write site is REACHED FROM promote and from nowhere else — asserted by locating it inside "
  + "promote's own body rather than by reading the comment above it",
    [writes(promoteBody, "inquiry_basis_versions"), writes(promoteBody, "inquiry_basis_version_legs")], [1, 1]);

  const tables = [...SCHEMA_CODE.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g)].map((m) => m[1]);
  t("EXACTLY TWO TABLES carry versions of a basis, and they are the projection pair — no third, no "
  + "shadow, no history table",
    tables.filter((n) => /version/i.test(n)).sort(),
    ["inquiry_basis_version_legs", "inquiry_basis_versions"]);
  t("and there is NO version write OP: the control plane publishes a read and nothing else, because a "
  + "write op is the second authority the item exists to refuse",
    [/basisversions:\s*\{/.test(INDEX_SRC), /basisversion(write|create|add|set)/i.test(INDEX_SRC)], [true, false]);

  /* THE WALK IS RE-RUN OVER A CORPUS THAT DOES CARRY THE FORBIDDEN THING, so a
     zero is evidence of absence rather than of a reader that cannot see. */
  const withSecondWrite = CODE + "\nthis.sql.exec(`INSERT INTO inquiry_basis_versions (bundle_id) VALUES (?)`, x);\n";
  const withThirdTable = SCHEMA_CODE + "\nCREATE TABLE IF NOT EXISTS inquiry_basis_versions_shadow (bundle_id TEXT);\n";
  t("REACH: the same walk over a source that DOES carry a second write site FINDS it, and over a schema "
  + "that DOES carry a third table FINDS that — the pin is a pin and not an exemption",
    [writes(withSecondWrite, "inquiry_basis_versions"),
     [...withThirdTable.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g)].map((m) => m[1]).filter((n) => /version/i.test(n)).length],
    [2, 3]);
}

/* ====================================================================== 11
 * D-113 — BOTH TABLES IN `purge`, PROVED BY CONSEQUENCE.
 * ==================================================================== */
console.log("\n--- 11. D-113: a derived table absent from purge is a silent leftover ---");
{
  const DOOMED = "INQ-2026-1000-purged";
  await mustPromote(DOOMED, inquiryMd(DOOMED, { question: "What happens when this is purged?", versions: [
    { ...V1, name: "the only reading" },
  ] }), "inquiry");
  const before = await GET(`op=stats&token=adm-pl1`);
  t("MEASURED FIRST: op=stats counts the versions and their legs, so a purge can PROVE it took them "
  + "rather than reporting scope ALL over rows it left",
    [(before?.basisVersions ?? 0) > 0, (before?.basisVersionLegs ?? 0) > 0], [true, true]);
  const had = (await versionsOf(DOOMED))?.total;
  const p = await GET(`op=purge&token=adm-pl1&confirm=bio&bundleId=${DOOMED}`);
  const after = await versionsOf(DOOMED);
  t("a per-bundle purge takes the inquiry's versions AND their legs with it",
    [had, p?.scope, p?.removed?.bundles, after?.total, (after?.versions ?? []).length], [1, DOOMED, 1, 0, 0]);
  const st = await GET(`op=stats&token=adm-pl1`);
  t("and the counts move with it — the leftover D-113 names is exactly a count that does not",
    [st.basisVersions < before.basisVersions, st.basisVersionLegs < before.basisVersionLegs], [true, true]);
}

/* ====================================================================== 12
 * THE ENVELOPE — IC-25/26/27/28, in a spelling the plane already uses.
 * ==================================================================== */
console.log("\n--- 12. the bound PUBLISHED is the bound APPLIED, and the empty answer says so too ---");
{
  const one = await versionsOf(INQ, "&limit=1");
  t("the bound published is the one APPLIED after clamping, never the number asked for",
    [one?.limit, one?.count, one?.total, one?.truncated], [1, 1, 2, true]);
  const over = await versionsOf(INQ, "&limit=99999");
  t("a ceiling is a ceiling: an absurd limit clamps and the clamped value is what is published",
    [over?.limit, over?.truncated], [1000, false]);
  const paged = await versionsOf(INQ, "&limit=1&offset=1");
  t("`offset` pages over a TOTAL order and the completeness signal settles at the end",
    [paged?.offset, (paged?.versions ?? []).map((v) => v.name), paged?.truncated],
    [1, ["two independent readings"], false]);
  const EMPTY = "INQ-2026-1000-no-versions";
  await mustPromote(EMPTY, inquiryMd(EMPTY, { question: "A question nobody has read yet." }), "inquiry");
  const e = await versionsOf(EMPTY);
  t("AND THE EMPTY ANSWER CARRIES THEM TOO — REC-70's lesson, where the one shape a bound sweep could "
  + "not see was a return that did not spell success the usual way",
    [e?.ok, e?.total, e?.limit, e?.truncated, e?.inquiry_present], [true, 0, 200, false, true]);
  /* D-227's OWN SHAPE, closed here rather than left to be found: an unbounded
     derivation feeding a bounded answer passes an envelope pin at zero cost, and
     a legs read with no LIMIT under a bounded versions read is exactly that. The
     SQL bound is pinned directly, and the answer settles wholeness per version
     rather than leaving a consumer to compare two numbers — because a basis
     returned in part reads as a basis (PL-9's finding, at the grain it bites). */
  /* CORRECTED 2026-08-08 BY D-235, AND THE OLD SPELLING WAS RIGHT WHEN IT WAS
     WRITTEN — corrected, never exempted, with why the old one no longer holds.
     It sliced 4,600 characters from `basisVersions({` and demanded exactly THREE
     `#rows(` and THREE `LIMIT ?`, which pinned the topology of the reader as
     much as the rule. D-235 changed that topology for a reason of its own: the
     legs read moved into `#versionCollections` so `op=suggest`'s answer and this
     op read one row through ONE reader, and the separate `SELECT DISTINCT
     ground` scan is GONE — the part labels are now derived from the legs this
     answer already carries, which is one bounded read fewer rather than an
     unbounded one more. A COUNT OF THREE would have failed for a change that
     strictly tightened the thing it guards.
     SO THE ARM ASSERTS THE RULE INSTEAD OF THE TOPOLOGY: over the whole span
     that answers this op — the shared reader and the assembly that calls it —
     every `#rows(` is matched by a `LIMIT ?`, the corpus is PRINTED, and it is
     FLOORED so a span that read nothing cannot pass. A future helper split or
     merge moves the number and the rule still holds. */
  const body = STORE_SRC.slice(STORE_SRC.indexOf("#versionCollections(bundleId, row) {"),
                               STORE_SRC.indexOf("      ok: true,\n      inquiry: inq,"));
  const nRows = (body.match(/#rows\(/g) || []).length;
  const nLimit = (body.match(/LIMIT \?/g) || []).length;
  console.log(`      D-227 corpus: ${body.length} chars spanning the shared reader and the assembly · `
            + `${nRows} #rows( · ${nLimit} LIMIT ?`);
  t("D-227: EVERY row source behind this answer carries a LIMIT in the SQL — asserted as the RULE "
  + "rather than as a count, so a reader refactored into a shared helper cannot fail it while "
  + "tightening it, and a span that read NOTHING cannot pass it either",
    [body.length > 800, nRows > 0, nRows === nLimit], [true, true, true]);
  t("WALK GUARD for that arm: the same reader over a FIXED synthetic span carrying an UNBOUNDED "
  + "`#rows(` does trip — an equality between two zeroes is an equality that costs nothing",
    [(`this.#rows(\`SELECT a FROM t WHERE b=?\`, x);`.match(/#rows\(/g) || []).length,
     (`this.#rows(\`SELECT a FROM t WHERE b=?\`, x);`.match(/LIMIT \?/g) || []).length],
    [1, 0]);
  const whole = await versionsOf(INQ);
  t("and each version settles its own wholeness: `leg_count` is the RECORD's count, `legs_complete` "
  + "answers the question outright, and both read true on a version that fits",
    (whole?.versions ?? []).map((v) => [v.leg_count, v.legs.length, v.legs_complete]),
    [[2, 2, true], [3, 3, true]]);
  const absent = await versionsOf("INQ-2026-9999-not-here");
  t("an inquiry the record does not hold answers in the same envelope and does NOT claim to be present — "
  + "which is how a reader tells 'no readings yet' from 'no such question'",
    [absent?.ok, absent?.total, absent?.limit, absent?.truncated, "inquiry_present" in (absent || {})],
    [true, 0, 200, false, false]);
}

/* ====================================================================== 13
 * DEC-49 — EVERY REFUSAL, DRIVEN. A FLOOR AS WELL AS A CEILING.
 * ==================================================================== */
console.log("\n--- 13. DEC-49: every refusal carries a code and a translation, and every code is REACHED ---");
{
  const keys = Object.keys(BASIS_VERSION_CHECKS);
  t("the C-number, the wire code and the canned translation are ONE ROW, and every C-number is distinct",
    [new Set(keys.map((k) => BASIS_VERSION_CHECKS[k].check)).size, keys.length], [keys.length, keys.length]);
  t("every translation is a SENTENCE a member could be shown, not an enum echoed back",
    keys.filter((k) => typeof BASIS_VERSION_CHECKS[k].translation !== "string"
                    || BASIS_VERSION_CHECKS[k].translation.length < 40), []);
  t("NO SECOND COPY: neither store.mjs nor the surface holds a translation string of its own — the map "
  + "is read from one place, because a hand copy agrees at zero cost",
    keys.filter((k) => STORE_SRC.includes(BASIS_VERSION_CHECKS[k].translation.slice(0, 45))), []);
  const stripped = CHECKS_SRC.replace(/\/\*[\s\S]*?\*\//g, " ");
  t("and no C-25 number is written anywhere in the catalog except in its own row — a second literal is a "
  + "second place for the number to drift",
    /* CORRECTED 2026-08-08 (PL-2 / IS-2), and CORRECTED rather than loosened:
       the C-25 range is now shared by TWO registries — this one, and the six
       member ops' VERSION_ACT_CHECKS — so the literal count is the sum of both.
       A `>=` here would have made the pin stop detecting a stray second literal,
       which is the only thing it exists to detect. */
    (stripped.match(/C-25\.\d+/g) || []).length,
    keys.length + Object.keys(VERSION_ACT_CHECKS).length);
  t("DEC-32's elicitation clause 1 / D-226: no translation uses the analyst's vocabulary — a member-facing "
  + "sentence never says ground, partition, disjunction, AND or OR",
    keys.filter((k) => /\b(ground|partition|disjunct|conjunct|AND-related|OR-related)\b/
      .test(BASIS_VERSION_CHECKS[k].translation)), []);

  /* THE FLOOR. Every code the registry declares is DRIVEN through a real
     refusal, and the set REACHED must EQUAL the set DECLARED. A ceiling alone
     passes trivially over nothing (REC-70), and a registry with an unreachable
     row is a refusal nobody can be given. */
  const bad = (name, versions) => promote(name, inquiryMd(name, { versions }), "inquiry");
  const reached = new Set();
  /* THE C-NUMBER AS THE PLANE ACTUALLY SENT IT, taken off the wire and never off
     the registry the assertion compares against — otherwise the pin would be a
     value compared with itself, which is a shape this project has measured. */
  const wire = new Map();
  const collect = (r) => {
    for (const c of codesOf(r)) reached.add(c);
    if (r && typeof r.code === "string" && typeof r.check === "string") wire.set(r.code, r.check);
    for (const fnd of (r?.findings ?? []))
      if (fnd && typeof fnd.code === "string" && typeof fnd.check === "string") wire.set(fnd.code, fnd.check);
    return r;
  };

  collect(await bad("INQ-2026-1001-nodesc", [{ ...V1, description: "short" }]));
  collect(await bad("INQ-2026-1001-dupname", [{ ...V1 }, { ...V1, description: "Another reading with one name." }]));
  collect(await bad("INQ-2026-1001-norel", [{ ...V1, relationship: undefined }]));
  collect(await bad("INQ-2026-1001-disagree", [{ ...V1, relationship: "or" }]));
  collect(await bad("INQ-2026-1001-partial", [{ ...V1,
    legs: [V1.legs[0], { target: MINUTES, ground: undefined }] }]));
  collect(await bad("INQ-2026-1001-unasserted", [{ ...V1, grounds: [] }]));
  collect(await bad("INQ-2026-1001-df", [{ ...V1, derived_from: "nowhere" }]));
  collect(await bad("INQ-2026-1001-cycle", [{ ...V1, name: "a", derived_from: "b" },
    { ...V1, name: "b", derived_from: "a", description: "The mirror reading, word for word." }]));
  collect(await bad("INQ-2026-1001-regroup", [{ ...V1, name: "as composed" },
    { ...V2, name: "regrouped", derived_from: "as composed",
      regroup_by: undefined, regroup_at: undefined, regroup_note: undefined }]));
  collect(await bad("INQ-2026-1001-notcitable", [{ ...V1,
    legs: [{ target: PROJ, ground: "paper trail" }] }]));
  collect(await bad("INQ-2026-1001-state", [{ ...V1, state: "pondering" }]));
  collect(await bad("INQ-2026-1001-hidden", [{ ...V1, hidden: "archived" }]));
  collect(await bad("INQ-2026-1001-self", [{ ...V1,
    legs: [{ target: "INQ-2026-1001-self", ground: "paper trail" }] }]));
  collect(await bad("INQ-2026-1001-orphan", [{ ...V1, name: "real",
    legs: [...V1.legs] }]).then((x) => x));
  collect(await promote("INQ-2026-1001-orphan2", inquiryMd("INQ-2026-1001-orphan2", { versions: [
    { ...V1, name: "real" }, { ...V1, name: "ghost", legs: [], grounds: [] },
  ] }).replace(/version: "ghost"/g, "version: \"not a version\"")
    .replace("basis_version_legs:", "basis_version_legs:\n  - version: \"not a version\"\n    target: \""
      + LEDGER + "\"\n    role: \"supports\"\n    ground: \"paper trail\""), "inquiry"));
  collect(await bad("INQ-2026-1001-unresolved", [{ ...V1,
    legs: [{ target: "INFO-2026-9999-never-captured", ground: "paper trail" }] }]));
  /* the FREEZE, and the two the READ owns */
  {
    const cur = await shaOf(INQ);
    collect(await promote(INQ, inquiryMd(INQ, { versions: [
      { ...V1, description: "The first reading, reworded in place, which is the thing that is refused." }, V2,
    ] }), "inquiry", cur));
  }
  /* ADDED 2026-08-08 (PL-2 / IS-2): the registry's newest row, DRIVEN like every
     other one. A version arriving already in a state §6 rule 4 requires a reason
     for, with nobody's name against it and nothing recorded, is refused at the
     write — the shape no op ever produces and therefore the shape only this
     layer can refuse. */
  collect(await bad("INQ-2026-1001-unattributed", [{ ...V1, state: "rejected" }]));
  collect(await GET(`op=basisversions&token=${RUTH}`));
  collect(await GET(`op=basisversions&token=${RUTH}&id=${PROJ}`));

  console.log(`  corpus: ${keys.length} refusals declared, ${reached.size} reached by driving`);
  t("THE FLOOR: every refusal the registry declares is REACHABLE, driven through a real write or a real "
  + "read — a row nobody can reach is a refusal nobody can be given",
    keys.filter((k) => !reached.has(k)), []);
  t("THE CEILING: and the plane sends nothing the registry does not declare",
    [...reached].filter((c) => !keys.includes(c)), []);
  /* AND EVERY C-NUMBER IS PINNED BY NAME, against the value the plane SENT.
     Both halves matter: the literals below make each check a rule an assertion
     NAMES (which is what `coverage.mjs --strict` measures, and its whole point is
     that a check no assertion names is a rule nobody is enforcing), and the
     comparison is against the wire rather than against the registry the numbers
     were read from — a literal compared with itself agrees at zero cost. */
  t("and every C-number is PINNED BY NAME against what the plane actually sent — a renumbering, a "
  + "collision or a code silently re-pointed at another check fails here",
    Object.fromEntries([...wire].sort()),
    { BASIS_VERSIONS_NOT_AN_INQUIRY: "C-25.18", BASIS_VERSIONS_NO_INQUIRY: "C-25.17",
      VERSION_DERIVATION_CYCLE: "C-25.8", VERSION_DERIVED_FROM_UNKNOWN: "C-25.7",
      /* CORRECTED 2026-08-08 (PL-2 / IS-2), and THE PIN CAUGHT THE NEW CODE ON
         ITS OWN before the worker touched this file — which is the instrument
         doing exactly what PL-1 built it for. `VERSION_DISPOSITION_UNATTRIBUTED`
         is the catalog half of §6 rule 4's reason rule: a version arriving
         already in a state a member enters WITH a recorded reason, carrying
         none, or carrying one with a machine's name against it. The number is
         added rather than the pin loosened. */
      VERSION_DISPOSITION_UNATTRIBUTED: "C-25.19",
      VERSION_FROZEN: "C-25.11", VERSION_GROUND_UNASSERTED: "C-25.6",
      VERSION_HIDDEN_NOT_BOOLEAN: "C-25.13", VERSION_LEG_NOT_CITABLE: "C-25.10",
      VERSION_LEG_SELF: "C-25.14", VERSION_LEG_UNRESOLVED: "C-25.16",
      VERSION_NAME_NOT_UNIQUE: "C-25.2", VERSION_NO_DESCRIPTION: "C-25.1",
      VERSION_NO_RELATIONSHIP: "C-25.3", VERSION_ORPHAN_ROW: "C-25.15",
      VERSION_PARTITION_INCOMPLETE: "C-25.5", VERSION_REGROUP_UNATTRIBUTED: "C-25.9",
      VERSION_RELATIONSHIP_DISAGREES: "C-25.4", VERSION_STATE_UNKNOWN: "C-25.12" });
}

/* ====================================================================== 14
 * BOTH GATES, ONE GRAMMAR — and the two standing bounds, asserted.
 * ==================================================================== */
console.log("\n--- 14. one grammar at both gates; D-184's vocabulary; the gate fails closed ---");
{
  const md = inquiryMd("INQ-2026-1002-bothgates", { versions: [{ ...V1, relationship: undefined }] });
  const w = await promote("INQ-2026-1002-bothgates", md, "inquiry");
  const cat = await checkBundle({ folderName: "INQ-2026-1002-bothgates",
    files: new Map([["bundle.md", new TextEncoder().encode(md)]]) });
  const catCodes = (cat?.findings ?? []).map((x) => x?.code).filter(Boolean);
  t("the SAME function runs at the write and in the catalog, so a version that cannot land cannot audit "
  + "clean either (REC-11's precedent for checkInquiryBasis itself)",
    [codesOf(w).includes("VERSION_NO_RELATIONSHIP"), catCodes.includes("VERSION_NO_RELATIONSHIP")], [true, true]);
  /* AND THE CONSEQUENCE, asserted rather than left to the refusal arm above.
     ADDED 2026-08-07 while RUNNING this item's second named negative control:
     with the relationship refusal disabled the suite failed in three places and
     NONE of them said what the defect actually IS — that a version with no
     stated relationship LANDS, reads back with an empty one, and is therefore
     the flat implicit-AND basis REC-42 corrected, re-shipped inside the object
     built to end it. A control whose failures do not name the harm is half a
     control. */
  const landed = await versionsOf("INQ-2026-1002-bothgates");
  t("and NOTHING LANDS: a version that states no relationship is not written at all, so no reader can "
  + "ever meet one — an empty relationship IS the flat implicit-AND basis REC-42 corrected",
    [landed?.total, (landed?.versions ?? []).map((v) => v.relationship)], [0, []]);
  t("D-184 / C-2.8: the leg vocabulary is information or inquiry and NOTHING ELSE — a project, an action "
  + "or an entity is refused by name at the version's own grain",
    [codesOf(await promote("INQ-2026-1002-proj", inquiryMd("INQ-2026-1002-proj", { versions: [
      { ...V1, legs: [{ target: PROJ, ground: "paper trail" }] }] }), "inquiry"))
      .includes("VERSION_LEG_NOT_CITABLE")], [true]);
  t("a leg to ANOTHER INQUIRY is legal, which is the half a refusal list would get wrong",
    (await promote("INQ-2026-1002-inqleg", inquiryMd("INQ-2026-1002-inqleg", { versions: [
      { ...V1, legs: [{ target: INQ2, ground: "paper trail", grade: "C", grade_axis: "connection",
                        grade_source: "testimony" }] }] }), "inquiry"))?.ok, true);
  t("THE READ FAILS CLOSED on an absent viewer stamp, through the same one compilation point every read "
  + "in the store uses (D-15) — the honest bound is stated at the site: an inquiry is not a project, so "
  + "the participation arm cannot bite here, and this is the arm that can",
    [/#bundleGate\("bx\.bundle_id", viewer\)/.test(STORE_SRC),
     /op === "basisversions"/.test(INDEX_SRC)], [true, true]);
  const dave = await versionsOf(INQ, "", DAVE);
  t("and an ordinary second member reads the same versions — compartmenting the evidence corpus is "
  + "exactly what D-15 declined to do",
    [dave?.ok, dave?.total], [true, 2]);
}

/* ====================================================================== 15
 * OVER-STRICTNESS — a correct alternative phrased unlike anything above.
 * ==================================================================== */
console.log("\n--- 15. over-strictness: a correct version written unlike any fixture here must PASS ---");
{
  const ODD = "INQ-2026-1003-unlike";
  const odd = {
    name: "v3.2 rev-B_final",
    description: "Three routes, any one of which answers it, composed after the audit landed.",
    relationship: "or", state: "considering", hidden: false,
    author: "dave", at: "2026-07-03T11:22:33Z", run: null,
    /* CORRECTED 2026-08-08 (PL-2 / IS-2), and the correction MAKES this arm
       stronger rather than accommodating a new rule: `considering` is one of the
       two states a member enters WITH a recorded reason (§6 rule 4), so a
       reading sitting in it with nobody's name against it is no longer a
       well-formed document. The over-strictness arm now carries a real,
       attributed disposition phrased unlike anything PL-2 wrote — which is
       exactly what an over-strictness arm is for. */
    state_by: "dave", state_at: "2026-07-03T11:22:33Z",
    state_reason: "holding this one until the third route's papers are captured",
    claim: "At least one quarter's transfers were made without the required authorisation.",
    grounds: [{ ground: "route-1_papers", asserted_by: "dave", at: "2026-07-03T11:22:33Z",
                statement: "The papers alone answer it." },
              { ground: "route 2 audit", asserted_by: "dave", at: "2026-07-03T11:22:33Z" },
              { ground: "ROUTE3", asserted_by: "dave", at: "2026-07-03T11:22:33Z" }],
    legs: [{ target: AUDIT, ground: "route 2 audit", role: "supports" },
           { target: EMAIL, ground: "ROUTE3", role: "cuts_against", grade: "D",
             grade_axis: "connection", grade_source: "testimony", note: "an aide's recollection", date: NOW },
           { target: LEDGER, ground: "route-1_papers", role: "supports" },
           { target: MINUTES, ground: "route-1_papers", role: "supports" }],
  };
  const r = await promote(ODD, inquiryMd(ODD, { question: "Were the transfers authorised?", versions: [odd] }), "inquiry");
  const a = await versionsOf(ODD);
  const v = byName(a, "v3.2 rev-B_final");
  t("it lands: mixed-case and punctuated ground labels, a leg ORDER that does not match the grounds, an "
  + "UNGRADED leg, a cuts_against leg, a member who is not the author of anything else here",
    [r?.ok, r?.reason ?? null, v !== null], [true, null, true]);
  t("and it reads back WHOLE, in the order it was authored, with the ungraded leg carried and NAMED "
  + "rather than dropped (DEC-18: an ungraded leg is inert AND named)",
    [(v?.legs ?? []).map((l) => [l.ground, l.role, l.grade]), v?.state, v?.relationship, v?.grounds],
    [[["route 2 audit", "supports", null], ["ROUTE3", "cuts_against", "D"],
      ["route-1_papers", "supports", null], ["route-1_papers", "supports", null]],
     "considering", "or", ["ROUTE3", "route 2 audit", "route-1_papers"]]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before it finished: ${e && e.stack ? e.stack : e}`);
  fail++;
} finally {
  await mf.dispose();
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
