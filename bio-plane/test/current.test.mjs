/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/current.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (PL-3's `suggest.control.mjs`, PL-4's `capturerequests.control.mjs`, PL-15's `leadslug.control.mjs` precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. Every arm is armed ALONE with every other defence held OPEN, every restore is verified BY sha256 AND BY CONTENT (`cmp`) against a per-arm pristine copy named with the ARM ID as well as the path, and every arm DECLARES before it runs what MUST fail and what MUST NOT.
   THE PLAN ROW'S OWN TWO ARMS COME FIRST, AND THE SECOND IS THE SHARP ONE.
   (1) THE PLAN ROW'S ARM A — WRITE CURRENT VIA A SETTINGS ROW. In src/store.mjs #setProjectCurrentVersion, replace the whole promote-the-project tail with a table write (`CREATE TABLE IF NOT EXISTS project_current …; INSERT OR REPLACE …`) and return `{ ok: true }` -> the pointer is no longer in the project's own bytes. MUST FAIL: §2's dated-frontmatter arms (the `current_versions` row read back through op=file), the append-only-history arm (no `Stands on` Session Log entry, no new revision), and the STRUCTURAL arm that pins the writer as making NO table write at all. MUST NOT FAIL: block 1's vocabulary arms, and — this is the point of the arm — `op=basisversions&project=` STILL ANSWERS `current`, because a settings row serves a read perfectly well. That is exactly DEC-17's objection: it would be a way to change what a project stands on WITH NOTHING TO READ AFTERWARDS, and an arm that only checked the read would have passed.
   (2) THE PLAN ROW'S ARM B, AND IT IS THE SHARP ONE — SUPPRESS THE NOTIFICATION AS A PERSONALLY-MUTABLE CONDITION. In src/queuestate.mjs MOVE `stance-changed-here-not-elsewhere` from QUEUE_FINDING_KINDS into QUEUE_CONDITION_KINDS (one key, moved, nothing else) -> a member may now MUTE it: op=queuemute ACCEPTS the kind and the divergence disappears from that member's feed with nothing recorded about who silenced it or why. MUST FAIL: block 1's FINDING-class assertions AND the driven mute refusal AND — because the producer still mints it as a FINDING — the mint's KIND_MISCLASSED refusal takes the whole feed down, which is the fence working. MUST NOT FAIL: nothing about the pointer, which is the half of the item this arm is not pointed at.
   (2b) THE HALF ARM 2 CANNOT REACH: move the kind AND flip the producer's `class:` to "CONDITION" together -> the mint is satisfied, no refusal fires, and a real divergence is now MUTEABLE. MUST FAIL: block 1's class arms and the mute-refusal arm. This is the arm that proves the FINDING-class assertion is doing the work rather than the mint's misclass check doing it for free.
   (3) THE SPINE OF SLUG ONE — DIVERGENCE IS A COMPARISON, NOT A COUNT. In #findingsStanceDiverged replace the `elsewhere` filter's `q.current.version !== p.current.version` with `true` -> the item fires even when both projects stand on the SAME reading. MUST FAIL: §4's convergence arm (two projects on one version produce ZERO items). MUST NOT FAIL: the divergence arms, which is what makes this defect invisible without an arm pointed at agreement.
   (4) THE SEVERED-STATUS CONFIRMATION. In #projectsDrawingOn delete the `x.status !== "severed"` clause -> a project that WITHDREW from the question is counted as drawing on it and contributes a stance. MUST FAIL: §4's severed arm. MUST NOT FAIL: anything else, which is why the arm exists: `refs` carries `rel` and DROPS `status`, so trusting the table alone is a defect that looks like a working walk.
   (5) THE TEAM IS READ, NEVER INFERRED. In #findingsVersionFromAnotherTeam delete the `runRow.context_type !== "project"` guard and take the source from the version's `author` instead -> a hand-composed version acquires a team it does not have. MUST FAIL: §5's run-less arm (a version with no run produces NO item). MUST NOT FAIL: the two runs-with-project-context arms, so the arm distinguishes "attributes correctly" from "attributes at all".
   (6) THE SOURCE IS NOT A HOME OF ITS OWN ITEM. In #findingsVersionFromAnotherTeam replace `homes.ancestors.filter((a) => a.id !== src)` with `homes.ancestors` -> the team that authored a reading is told it arrived from another team. MUST FAIL: §5's excluded-home arm. MUST NOT: the item still exists and still says everything else, which is the defect's whole camouflage.
   (7) THE DISPOSITION PUBLICATION IS A MEASUREMENT OF THE ACT. In #dispositionOf make the final return `available: true, op: "proposedispose"` -> the plane now advertises an act on items that carry no key. MUST FAIL: §7's undispositionable arms AND the DRIVEN arm that takes the published key to the real op. MUST NOT FAIL: the two proposal kinds, which were already true — so the arm proves the publication is not merely always-true.
   (8) OVER-STRICTNESS, and these PASS rather than fail: a project that does NOT cite the question is never named in anybody's divergence; two projects standing on the SAME reading produce silence rather than an item; a legacy `focus`/`problem`-typed shared question still diverges (the MAP RULE, so a spelling this item did not anticipate is not refused); an ordinary progression proposal keeps BOTH its disposition controls and its successful op=proposedispose; and `out-of-inquiry-lead` is unaffected in every respect. A fence that refuses correct work is a defect in the fence.
   (9) BASELINE. Every arm restored, suite re-run, full green — the row that distinguishes six-arms-broken from six-arms-working.
   D-266's ARMS ALSO REACH THIS SUITE, and they are DECLARED HERE rather than only where they are driven, because a reader breaking §5 in a year needs to find them from the assertion they broke. RUN 2026-08-09 (d266-disposition) by `test/d266.control.mjs`, which arms `src/store.mjs` alone and runs BOTH this suite and `proposedispose.test.mjs` on every arm. BASELINE this suite 62/0.
   (D-266.4) THROW AWAY THE UNATTRIBUTABLE COUNT at #findingsVersionFromAnotherTeam's return (`out.unattributed = 0`) -> **this suite 61/1**, the counted-silence arm failing, `proposedispose.test.mjs` 27/0 and untouched. MUST NOT FAIL: the run-less arm and the two-items arm — the ITEMS are unaffected, which is precisely the state this half of D-266 found: a correct silence indistinguishable from having nothing to be silent about.
   (D-266.5) COUNT ONE BRANCH OF THE SILENCE AND NOT THE OTHER — the `!from` increment removed, so a reading carried by a run working under a project that does not draw on this question stops being counted and the answer reads 1 where the truth is 2 -> **61/1**. This is why §5 asserts an EXACT figure: "at least one" would have passed over it, and the fixture for that branch (RUN_C / V4) did not exist before D-266 wrote it.
   (D-266.6) OVER-STRICTNESS — `#findingsStanceDiverged` re-wired through a LOCAL instead of being spread straight into `items` -> **62/0, GREEN**, which is the receipt that this suite's producer-wiring arm now asks its PROPERTY rather than pinning one of the two spellings the language offers. It used to pin the spelling, and D-266's own correct wiring failed it.
 * ========================================================================= */
/* IS-BUILD-PLAN PL-13 / IS-3 — **CURRENT AS A PROJECT PROPERTY**, and the two
 * shared-inquiry FINDING slugs that the per-project answer makes necessary.
 *
 * ---- THE PRECONDITION LANDED AND IT IS WHY THIS ITEM HAS THE SHAPE IT HAS
 *
 * The plan row puts D-216's model check FIRST — *sharing is the `refs` edge,
 * else this item is wrong and cloning is the honest answer.* **It landed
 * 2026-08-08 in W0's lane and THE ANSWER IS PER-PROJECT**: §7 is correct,
 * cloning is not the honest answer, and it was DRIVEN through twelve ops rather
 * than read. So this item does NOT rebuild the pointer. PL-2 shipped it, D-216
 * measured it, and D-216's own delegation says in terms *PL-2's POINTER
 * SURVIVES UNCHANGED — do not re-specify it; rewrite the row to CONFIRM rather
 * than rebuild.* Block 2 is that confirmation, driven end to end through the
 * op, and blocks 4-6 are this item's own build.
 *
 * **THE POINT THE ANSWER FORCES, AND IT IS THE ITEM'S REASON FOR EXISTING.**
 * Because the stance is per-project, NOTHING REFUSES A DIVERGENCE: two projects
 * standing on two readings of one question is a legal state, measured happening
 * with the plane refusing neither. A legal state nobody is told about is a
 * silent one, and the failure is concrete — a team builds a case on a reading
 * its partners abandoned and finds out at publication. The cost of the correct
 * model is paid in the FEED, by telling people, never by a reconciliation that
 * would re-impose the single shared stance §7 rejected.
 *
 * ---- WHAT IS ASSERTED, in the order the blocks run
 *
 *  1. THE VOCABULARY. Both slugs are FINDING in `queuestate.mjs` — IMPORTED,
 *     never copied, because a hand copy agrees with its source for free. FINDING
 *     and NOT CONDITION is DRIVEN rather than classified: `op=queuemute` REFUSES
 *     both kinds, so no member can silence a divergence the team must see.
 *  2. THE POINTER IS A PROJECT-AUTHORED, DATED FRONTMATTER FIELD AND NEVER A
 *     SETTINGS ROW — asserted FOUR ways, because three of them a settings row
 *     would pass: the field is in the project's OWN promoted bytes (read back
 *     through `op=file`), the act is in the project's APPEND-ONLY HISTORY
 *     (a new revision and a `Stands on` Session Log entry), the INQUIRY's own
 *     bytes carry no stance at all, and STRUCTURALLY the one writer performs no
 *     table write whatsoever.
 *  3. MOVING ONE MOVES NOTHING ELSE — the plan row's own accepts-when clause,
 *     driven: after A moves, B's stance, the version states and the inquiry's
 *     bytes are all byte-for-byte where they were.
 *  4. SLUG ONE FIRES, AND SO DOES ITS SILENCE. Divergence mints; convergence
 *     mints NOTHING; a SEVERED project is not in the conversation; a project
 *     that never cited the question is never named. The date on the item is the
 *     project's OWN authored date and not the read's clock.
 *  5. SLUG TWO FIRES, AND THE TEAM IS READ RATHER THAN INFERRED. A version
 *     proposed under project A's run reaches B and is NOT filed under A — with
 *     the exclusion DECLARED on the item. A version with NO run mints NOTHING,
 *     which is a declared gap (D-266) driven rather than described.
 *  6. THE MINT ACCEPTS BOTH KINDS, and the whole feed still answers. The
 *     refusals themselves are the control harness's to drive.
 *  7. THE DISPOSITION IDENTITY — UI-45's handed-over PLANE question, ANSWERED
 *     AND PUBLISHED. Every item carries `disposition`; the two proposal kinds
 *     are available and the other three are not, each with its reason; and the
 *     published key is DRIVEN INTO THE REAL ACT in both directions, so this is a
 *     measurement of `op=proposedispose` rather than a claim about it.
 *  8. NO TABLE WAS ADDED, PROVED BY CONSEQUENCE (D-113). Purge the shared
 *     question and both new items go quiet, because both are derived on read.
 *
 * ---- WHAT THIS SUITE CANNOT SEE, stated plainly
 *
 *   IT CANNOT drive `op=cite` onto an inquiry from a project, because **that
 *     door does not exist** — D-216's finding that outranks its own answer, open
 *     as REC-72: `op=cite` refuses an inquiry on the PROJECT arm with
 *     `NOT_INFORMATION`, and `op=sever` is refused identically. So the sharing
 *     edge here is HAND-AUTHORED into `references[]` and promoted, exactly as
 *     PL-2's fixture and D-216's probe had to. What that means for this suite is
 *     said rather than left to be noticed: every arm below proves what the plane
 *     DOES with a sharing edge, and NONE of them proves a member can make one.
 *   IT CANNOT see a real investigative session choosing to propose a version
 *     under one project rather than another. The runs here are real `ai_runs`
 *     rows with real project contexts driven through `op=airunopen`; the
 *     JUDGEMENT that a session works under a project is FL-3's to prove.
 *   IT CANNOT see a second isolate. One store, one Durable Object.
 *   IT CANNOT see whether a member ACTS on either notification, which is the
 *     surface's question and UI-45's successor's.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { QUEUE_FINDING_KINDS, QUEUE_CONDITION_KINDS, QUEUE_OBLIGATION_KINDS,
         classOfKind } from "../src/queuestate.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT throughout (PL-1's discipline, carried by PL-4 and PL-15): an
   arm that throws on a property of undefined takes every arm behind it with it
   and reports one defect as none. */
const S = (v) => (typeof v === "string" ? v : null);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl13", MEMBER_TOKEN: "mem-pl13", PROBE_TOKEN: "prb-pl13",
              DAEMON_TOKEN: "dmn-pl13", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-pl13",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});

const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body) })).json());

/* ---------------------------------------------------------------- MEMBERS */
const enrol = async (memberId, role, caps) => {
  const add = await POST(`op=memberadd&token=adm-pl13`,
    { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  if (!add.ok) throw new Error(`memberadd ${memberId}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* An ADMINISTRATOR, for the same reason D-216's probe used one: §7.3 says
   administrators see all projects, which is what lets ONE credential drive both
   teams' acts. That is a convenience of the INSTRUMENT and not a claim about
   the model — nothing below concludes anything from this credential's reach. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);

/* ------------------------------------------------------------- FIXTURES */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const scalar = (k, v) => v === null ? [`    ${k}: null`]
  : v === undefined ? [] : typeof v === "boolean" ? [`    ${k}: ${v}`]
  : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  const rows = versions.map((v) => ['  - name: "' + v.name + '"',
    ...scalar("description", v.description), ...scalar("relationship", "and"),
    ...scalar("state", "suggested"), ...scalar("derived_from", null), ...scalar("hidden", false),
    ...scalar("run", v.run), ...scalar("author", v.author ?? "ruth"), ...scalar("at", v.at ?? NOW),
    ...scalar("state_by", undefined), ...scalar("state_at", undefined),
    ...scalar("state_reason", undefined)].join("\n"));
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
const inquiryMd = (id, { versions = [], basis = [], type = "inquiry", schema = "inquiry@1" } = {}) => ["---",
  `id: ${id}`, `object_type: ${type}`, `schema: ${schema}`,
  `title: "Did the sewer fund transfer follow the adopted process?"`,
  "current_state: open", "prior_state: null",
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
/* THE SHARING EDGE IS HAND-AUTHORED, AND THAT IS REC-72's OPEN FINDING RATHER
   THAN THIS SUITE'S CHOICE. `op=cite` REFUSES an inquiry on the project arm
   (`NOT_INFORMATION`) and `op=sever` is refused identically — measured by
   D-216, confirmed in source at three sites — so a project draws on a question
   ONLY by authoring `references[]` and calling `op=promote`. Every arm below is
   about what the plane does with the edge; NOTHING here says a member can make
   one. `status: severed` is authored the same way, and §4 drives it. */
const projectMd = (id, { title, cites = [], severed = [], current = [] } = {}) => ["---",
  `id: ${id}`, "object_type: project", `title: "${title}"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  ...(cites.length || severed.length
    ? ["references:",
       ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"]),
       ...severed.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: severed",
                                  '    note: "no longer drawing on this question"'])]
    : ["references: []"]),
  "required_strength:", "  capture: B", "  connection: C",
  ...(current.length
    ? ["current_versions:", ...current.flatMap((c) => [`  - inquiry: "${c.inquiry}"`,
        `    version: "${c.version}"`, `    by: "${c.by}"`, `    at: "${c.at}"`])]
    : []),
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");

let snapSeq = 0;
const promote = async (id, text, type, base = null) => POST(`op=promote&token=${RUTH}`, {
  bundleId: id, base,
  snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" || type === "focus" || type === "problem" ? "open"
            : type === "project" ? "forming" : "collected",
          created: NOW, last_updated: LATER } });
const mustPromote = async (id, text, type, base = null) => {
  const r = await promote(id, text, type, base);
  if (!r.ok) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};
const shaOf = async (id) => (await GET(`op=list&token=${RUTH}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;
const textOf = async (id) => S((await GET(`op=file&token=${RUTH}&id=${id}&path=bundle.md`))?.text);

const LEDGER = "INFO-2026-4000-ledger", MINUTES = "INFO-2026-4000-minutes",
      AUDIT = "INFO-2026-4000-audit";
for (const d of [LEDGER, MINUTES, AUDIT]) await mustPromote(d, infoMd(d), "information");

/* THE PROJECTS. A and B share the question; C never cites it (the
   over-strictness arm that keeps "a project may stand on a reading" from being
   unconditional); S cites it with `status: severed` — it withdrew. */
const A = "PROJ-2026-4000-oversight", B = "PROJ-2026-4000-budget",
      C = "PROJ-2026-4000-unrelated", SEV = "PROJ-2026-4000-withdrawn";
const INQ = "INQ-2026-4000-sewer-transfers";
/* A SECOND, LEGACY-TYPED shared question. The MAP RULE arm: a `focus` document
   is an inquiry by another spelling, and a producer keying on the literal
   "inquiry" would go silent on it without anything failing. */
const FOC = "FOCUS-2026-4000-legacy";

/* THE RUNS. Real `ai_runs` rows opened through the real op, each with a real
   PROJECT context — because the source team of a version is read from
   `ai_runs.context`, never inferred from who authored it. */
/* RUN_C ADDED 2026-08-09 by D-266. Its context is a REAL project that does not
   draw on this question at all, which is the OTHER way a reading can arrive
   unattributable: not "no run" (V3) but "a run whose context is nothing this
   read has named". The producer treats the two identically and must — telling
   them apart would mean projecting a stored column of `ai_runs`, which REC-74's
   declared role for this reader forbids — so both are counted and neither is
   attributed. Before this fixture existed the second branch was implemented and
   REACHED BY NOTHING, which is the shape this project calls an arm that never
   armed. */
const RUN_A = "AIRUN-2026-4000-oversight", RUN_B = "AIRUN-2026-4000-budget",
      RUN_C = "AIRUN-2026-4000-unrelated";
const openRun = async (run, ctx) => {
  const r = await POST(`op=airunopen&token=${RUTH}`, {
    run, contextType: "project", contextId: ctx,
    label: `PL-13 fixture — a run working under ${ctx}`, mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 });
  if (r?.started !== true) throw new Error(`airunopen ${run}: ${JSON.stringify(r).slice(0, 600)}`);
};

/* V1 comes from A's run, V2 from B's run, V3 from NOBODY'S — composed by hand,
   which is the declared gap (D-266) driven rather than described. */
const V1 = { name: "opening account", run: RUN_A, at: "2026-07-03T00:00:00Z",
  description: "The first reading: the ledger and the minutes together show the transfer.",
  grounds: ["paper trail"],
  legs: [{ target: LEDGER, ground: "paper trail" }, { target: MINUTES, ground: "paper trail" }] };
const V2 = { name: "the audit alone", run: RUN_B, at: "2026-07-04T00:00:00Z",
  description: "Second reading: the audit carries the finding without the paper trail.",
  grounds: ["the audit"], legs: [{ target: AUDIT, ground: "the audit" }] };
const V3 = { name: "composed by hand", run: undefined, at: "2026-07-05T00:00:00Z",
  description: "A third reading a member wrote without any run behind it at all.",
  grounds: ["the ledger alone"], legs: [{ target: LEDGER, ground: "the ledger alone" }] };
/* D-266. A FOURTH reading, carried by a real run whose context is a real project
   that does not draw on this question. It mints no item for the same reason V3
   does not — the source team is a run's stored context or it is nothing — and it
   is the fixture the second unattributable branch never had. */
const V4 = { name: "read under an unrelated project", run: RUN_C, at: "2026-07-06T00:00:00Z",
  description: "A fourth reading proposed by a run working somewhere else entirely.",
  grounds: ["the ledger alone"], legs: [{ target: LEDGER, ground: "the ledger alone" }] };

/* PROJECTS FIRST: the run's context must exist before a run can name it. */
await mustPromote(A, projectMd(A, { title: "Oversight", cites: [INQ, FOC] }), "project");
await mustPromote(B, projectMd(B, { title: "Budget", cites: [INQ, FOC] }), "project");
await mustPromote(C, projectMd(C, { title: "Unrelated" }), "project");
await mustPromote(SEV, projectMd(SEV, { title: "Withdrawn", severed: [INQ] }), "project");
await openRun(RUN_A, A);
await openRun(RUN_B, B);
await openRun(RUN_C, C);
await mustPromote(INQ, inquiryMd(INQ, { versions: [V1, V2, V3, V4], basis: [LEDGER, MINUTES] }), "inquiry");
await mustPromote(FOC, inquiryMd(FOC, { type: "focus", schema: "focus@1",
  versions: [{ ...V1, name: "legacy reading" }] }), "focus");

const queue = async (tok = RUTH) => GET(`op=queue&token=${tok}&limit=500`);
/* EVERY READ OF THE FEED GOES THROUGH `ITEMS`, AND THE CONTROL HARNESS IS WHY.
   When the MINT refuses — which is exactly what control arm 2 arms — `op=queue`
   answers a REFUSAL with no `items` at all, and a bare `q.items.every(...)`
   throws a TypeError that ends the module while the tally reads clean. The arm
   was as declared; the suite was not. Now a refused feed FAILS the arms below
   and says so, which is the difference between a suite that measured a refusal
   and a suite that died in one. */
const ITEMS = (q) => (q && Array.isArray(q.items)) ? q.items : [];
const itemsOf = (q, kind) => ITEMS(q).filter((i) => i && i.kind === kind);
/* THE TWO OPS TAKE QUERY PARAMETERS AND THE INQUIRY IS `id` ON ONE AND `target`
   ON THE OTHER. Spelled once, here, because a first draft of this suite sent
   both in a POST body and got `project: null` back from a refusal that read
   exactly like the act being unavailable — an instrument defect wearing the
   subject's clothes. */
const makeCurrent = async (project, version, target = INQ) =>
  POST(`op=versioncurrent&token=${RUTH}&target=${encodeURIComponent(target)}`
     + `&version=${encodeURIComponent(version)}&project=${encodeURIComponent(project)}`, {});
const versionsOf = async (id, extra = "") =>
  GET(`op=basisversions&token=${RUTH}&id=${encodeURIComponent(id)}&limit=50${extra}`);
/* A NULL STANCE AND AN ABSENT FIELD ARE DIFFERENT ANSWERS AND THIS HELPER MUST
   NOT COLLAPSE THEM — §7's whole point is that an unnamed project gets no field
   rather than a default. A first draft wrote `?.current ?? "MISSING"`, which
   reports "MISSING" for a project that simply stands on nothing; it took four
   arms down while reading exactly like the op being broken. */
const stanceOf = async (project, id = INQ) => {
  const r = await versionsOf(id, `&project=${encodeURIComponent(project)}`) || {};
  return Object.prototype.hasOwnProperty.call(r, "current") ? r.current : "FIELD-ABSENT";
};
/* §6 RULE 5, ENFORCED BY THE PLANE AND FOUND BY DRIVING IT RATHER THAN BY
   READING §6: `op=versioncurrent` refuses `VERSION_NOT_ACCEPTED` (C-25.28) on a
   `suggested` reading — *a project can only stand on a reading its members have
   accepted.* So the fixture accepts before it stands, which is the product's own
   order of acts and not a convenience. Recorded because D-216's own report says
   §6 rule 5 "is not built", and it IS — a stale line caught by driving. */
const accept = async (version, target = INQ) =>
  POST(`op=versionaccept&token=${RUTH}&target=${encodeURIComponent(target)}`
     + `&version=${encodeURIComponent(version)}`
     + `&reason=${encodeURIComponent("the evidence holds")}`, {});

/* ====================================================================== 1
 * THE VOCABULARY — IMPORTED, NEVER COPIED, AND THE CLASS IS **DRIVEN**.
 * ===================================================================== */
{
  const K1 = "stance-changed-here-not-elsewhere", K2 = "new-version-arrived-from-another-team";
  t("the catalogue was IMPORTED from the plane's own queuestate.mjs and is non-empty — an empty "
  + "import would make every arm in this block vacuous, which is the failure a hand copy hides",
    [Object.keys(QUEUE_FINDING_KINDS).length >= 15,
     Object.keys(QUEUE_CONDITION_KINDS).length >= 5,
     Object.keys(QUEUE_OBLIGATION_KINDS).length >= 3], [true, true, true]);
  t("PL-13's two slugs are in the catalogue and are FINDING — the plan row names them and this is "
  + "the item that mints them (UI-45 asserted them ABSENT, on purpose, so the day they arrived "
  + "would be noticed rather than assumed)",
    [classOfKind(K1), classOfKind(K2)], ["FINDING", "FINDING"]);
  /* NULL-TOLERANT, AND THE CONTROL HARNESS IS WHY. Written as
     `QUEUE_FINDING_KINDS[K1].length`, arms 2 and 2b of `current.control.mjs` —
     which MOVE the key out of this vocabulary — made this line throw a
     TypeError, and **a TypeError inside an assertion goes through NO assertion
     at all**: the module ended, every arm behind it never ran, and only the
     driver's `-1`-for-no-tally convention distinguished that from a clean pass.
     The arms were as declared either way; the suite was not, and it is fixed
     here rather than left for the next reader to hit. */
  t("and each carries the SENTENCE A MEMBER READS rather than only the slug — a kind with no words "
  + "reaches a surface with nothing to render",
    [(QUEUE_FINDING_KINDS[K1] || "").length > 60, (QUEUE_FINDING_KINDS[K2] || "").length > 60],
    [true, true]);
  t("NEITHER is a CONDITION anywhere in the catalogue, which is the property the plan row's second "
  + "negative control arms against",
    [K1 in QUEUE_CONDITION_KINDS, K2 in QUEUE_CONDITION_KINDS,
     K1 in QUEUE_OBLIGATION_KINDS, K2 in QUEUE_OBLIGATION_KINDS], [false, false, false, false]);
  /* CLASSIFICATION IS CHEAP; THE REFUSAL IS THE EVIDENCE. */
  for (const k of [K1, K2]) {
    const m = await POST(`op=queuemute&token=${RUTH}`, { case: A, kinds: [k] });
    t(`a member CANNOT mute '${k}': op=queuemute refuses, so one member's inbox hygiene cannot `
    + "silence a divergence the whole team is standing on (D-125, DEC-16)", m.ok, false);
    t(`and the refusal for '${k}' names the class it ACTUALLY is rather than only saying no`,
      /FINDING/.test(JSON.stringify(m)), true);
  }
  /* BOTH PRODUCERS EXIST IN SOURCE AND ARE WIRED INTO THE FEED. A slug with no
     generator is a word, and this project has already shipped one of those
     (`runtime-ceiling-reached`, IS-9(d)). */
  /* CORRECTED 2026-08-09 by D-266, never exempted, and the correction is the
     point rather than the housekeeping: THE ORIGINAL PINNED A SPELLING AND NOT
     THE PROPERTY IT WAS PROTECTING. Its last two arms required the literal
     `items.push(...this.#findingsX(` — one of several correct ways to wire a
     producer into the FINDING half. D-266 needed the second producer's ANSWER
     held in a local, because it now carries a count of the readings the read
     could not attribute and that fact has NO ITEM to sit on. So the call became
     `const fromAnotherTeam = this.#findingsVersionFromAnotherTeam(viewer, now);
     items.push(...fromAnotherTeam);` — a wiring that is correct in every respect
     this assertion exists to defend — and the check went red. A fence tighter
     than its rule is not a safer fence.
     THE PROPERTY, asked instead of the spelling: the producer is CALLED with
     the feed's own `(viewer, now)`, and what it RETURNS is spread into `items`
     — directly, or through the local it was assigned to. Two structural forms
     because the language has two, not a list of spellings that goes stale the
     next time a producer needs to carry something home. */
  const wiredIntoItems = (name) => {
    const call = new RegExp(`this\\.#${name}\\s*\\(viewer, now\\)`).test(STORE_SRC);
    const direct = new RegExp(`items\\.push\\(\\s*\\.\\.\\.\\s*this\\.#${name}\\s*\\(`).test(STORE_SRC);
    const decl = new RegExp(`(?:const|let)\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*this\\.#${name}\\s*\\(`).exec(STORE_SRC);
    const viaLocal = !!(decl && new RegExp(`items\\.push\\(\\s*\\.\\.\\.\\s*${decl[1]}\\b`).test(STORE_SRC));
    return call && (direct || viaLocal);
  };
  t("both slugs have a NAMED PRODUCER wired into queueFeed's FINDING half — a kind with no "
  + "generator is a word, and this record has shipped one of those before",
    [/#findingsStanceDiverged\s*\(viewer, now\)/.test(STORE_SRC),
     /#findingsVersionFromAnotherTeam\s*\(viewer, now\)/.test(STORE_SRC),
     wiredIntoItems("findingsStanceDiverged"),
     wiredIntoItems("findingsVersionFromAnotherTeam")],
    [true, true, true, true]);
}

/* ====================================================================== 2
 * THE POINTER: PROJECT-AUTHORED, DATED FRONTMATTER, NEVER A SETTINGS ROW.
 * Four arms, and a settings row would pass three of them.
 * ===================================================================== */
/* THE ACCEPTANCES, DRIVEN BEFORE ANY STANCE, so that every arm below measures
   what `op=versioncurrent` DOES rather than what §6 rule 5 refuses. The receipts
   are asserted rather than assumed: a fixture whose setup silently failed is an
   arm that never armed, which is this project's most-repeated control finding. */
const ACCEPTS = [await accept("opening account"), await accept("the audit alone"),
                 await accept("legacy reading", FOC)];
t("the fixture's three readings are ACCEPTED — §6 rule 5 means a project can only stand on a "
+ "reading its members accepted (C-25.28, found by DRIVING the act), so this is the product's own "
+ "order of acts and the non-empty guard for every arm below",
  ACCEPTS.map((r) => [r.ok, r.to]), [[true, "accepted"], [true, "accepted"], [true, "accepted"]]);

const beforeA = await textOf(A);
const beforeShaA = await shaOf(A);
{
  t("BEFORE the act, A stands on nothing and op=basisversions says so with a null rather than an "
  + "omission — the field is present because a project WAS named",
    [await stanceOf(A)], [null]);
  /* §7's refusal to guess, and it is the shape D-216 measured: a read naming no
     project gets NO `current` field at all, not a default. */
  const anon = await versionsOf(INQ);
  t("a read naming NO project gets NO `current` FIELD AT ALL — the inquiry holds no stance and the "
  + "plane refuses to invent one (§7, measured by D-216)",
    Object.prototype.hasOwnProperty.call(anon || {}, "current"), false);

  const act = await makeCurrent(A, "opening account");
  t("op=versioncurrent succeeds and its receipt names the PROJECT whose stance moved",
    [act.ok, act.act, act.project, act.version], [true, "current", A, "opening account"]);

  /* ARM 1 — THE FIELD IS IN THE PROJECT'S OWN PROMOTED BYTES. */
  const after = await textOf(A);
  const fm = (after || "").split("\n---")[0];
  t("ARM 1 — the pointer is a DATED FRONTMATTER ROW IN THE PROJECT'S OWN bundle.md, carrying the "
  + "inquiry, the version, WHO and WHEN (§7: project-authored and dated)",
    [/^current_versions:/m.test(fm),
     new RegExp(`- inquiry: "${INQ}"`).test(fm),
     /version: "opening account"/.test(fm),
     /by: "/.test(fm), /at: "\d{4}-\d\d-\d\dT/.test(fm)], [true, true, true, true, true]);
  t("and it sits BESIDE `required_strength` in the same document — the plan row's own words for "
  + "where this field lives",
    [/required_strength:/.test(fm), fm.indexOf("required_strength") > 0], [true, true]);

  /* ARM 2 — THE ACT IS IN THE APPEND-ONLY HISTORY. This is the arm a settings
     row cannot pass and the reason DEC-17 refuses one: a settings row would be
     a way to change what a project stands on WITH NOTHING TO READ AFTERWARDS. */
  const afterShaA = await shaOf(A);
  t("ARM 2 — the act is in the project's APPEND-ONLY HISTORY: a NEW REVISION of the project (its "
  + "bundle_sha moved) and a Session Log entry naming the trigger. THIS is the arm a settings row "
  + "cannot pass — DEC-17's whole objection is that a settings row changes what a project stands "
  + "on with NOTHING TO READ AFTERWARDS",
    [typeof afterShaA === "string" && afterShaA.length > 0, afterShaA !== beforeShaA,
     /### Session .* \| Stands on \|/.test(after || ""),
     /Trigger: op=versioncurrent/.test(after || ""),
     (beforeA || "").includes("current_versions:")], [true, true, true, true, false]);

  /* ARM 3 — THE INQUIRY'S OWN BYTES CARRY NO STANCE. */
  const inqText = await textOf(INQ);
  t("ARM 3 — the SHARED QUESTION's own bytes carry NO stance: no `current_versions` block and no "
  + "`current` scalar. One team's reading must not read as everybody's (§7)",
    [/^current_versions:/m.test(inqText || ""), /^current:/m.test(inqText || "")], [false, false]);

  /* ARM 4 — STRUCTURAL. The one writer performs NO table write at all. */
  /* THE DEFINITION, NOT THE CALL SITE. A first draft searched for the bare
     name and found `this.#setProjectCurrentVersion(...)` inside `versionAct`
     FIRST, so the "writer" it examined was the tail of a different method —
     an arm reading the wrong span and reporting confidently about it. */
  const body = STORE_SRC.slice(STORE_SRC.indexOf("\n  #setProjectCurrentVersion(projectRow"));
  const writer = body.slice(0, body.indexOf("\n  }\n"));
  if (writer.length < 400) throw new Error(`ARM 4 read ${writer.length} bytes of the writer — an arm that did not arm`);
  t("ARM 4 — STRUCTURALLY, the ONE writer performs NO table write whatsoever: no INSERT, no "
  + "UPDATE, no CREATE TABLE. It reads the document, rewrites the block and PROMOTES, so there is "
  + "no settings row for a future reader to find and no second place the stance is stated (D-21)",
    [/INSERT\s+INTO/i.test(writer), /UPDATE\s+\w+\s+SET/i.test(writer),
     /CREATE\s+TABLE/i.test(writer), /this\.promote\(/.test(writer)],
    [false, false, false, true]);
  t("and NO SCHEMA TABLE holds a per-project current version — the whole schema source names no "
  + "such column, so the structural claim is about the record and not about one method",
    [/current_version/i.test(SCHEMA_SRC), /project_current/i.test(SCHEMA_SRC)], [false, false]);

  const readBack = await stanceOf(A);
  t("the published read agrees with the written bytes, through PL-2's ONE reader — the answer and "
  + "the act cannot disagree because there is one implementation (DEC-8)",
    [readBack?.version, readBack?.project, typeof readBack?.at === "string", typeof readBack?.by === "string"],
    ["opening account", A, true, true]);
}

/* ====================================================================== 3
 * MOVING ONE MOVES NOTHING ELSE — the plan row's own accepts-when clause.
 * ===================================================================== */
{
  t("B's stance did NOT move when A's did: it stands on nothing, which is the whole content of "
  + "'per-project' and is what cloning was rejected in favour of (D-216)",
    await stanceOf(B), null);
  const vs = await versionsOf(INQ);
  t("no VERSION moved when the stance did — a stance is NOT a state. The two accepted readings are "
  + "still accepted and the untouched one is still suggested: op=versioncurrent moves a pointer in "
  + "ONE project's own bytes and nothing on the shared question at all",
    /* CORRECTED 2026-08-09 by D-266: the FIXTURE grew a fourth reading (V4, carried by a run
       working under a project that does not draw on this question), so the expected list grew
       with it. Nothing this assertion is about changed — it is still "no version moved when the
       stance did", still asserted over every reading the question holds. */
    (vs?.versions || []).map((v) => [v.name, v.state]),
    [["opening account", "accepted"], ["the audit alone", "accepted"], ["composed by hand", "suggested"],
     ["read under an unrelated project", "suggested"]]);
  t("and both projects still see the IDENTICAL, NON-EMPTY version set after the divergence — the "
  + "non-empty guard is the evidence, because D-216's own control arm 3 showed 'both see the same "
  + "set' passing over an EMPTY list",
    [(vs?.versions || []).length,
     JSON.stringify((await versionsOf(INQ, `&project=${A}`))?.versions?.map(v => v.name))
       === JSON.stringify((await versionsOf(INQ, `&project=${B}`))?.versions?.map(v => v.name))],
    /* CORRECTED 2026-08-09 by D-266 with the list above and for the same reason: FOUR readings
       now, and the non-empty guard this arm exists for is unweakened by the change. */
    [4, true]);
}

/* ====================================================================== 4
 * SLUG ONE: `stance-changed-here-not-elsewhere`, AND ITS SILENCE.
 * ===================================================================== */
{
  const q = await queue();
  const it = itemsOf(q, "stance-changed-here-not-elsewhere");
  t("ONE item, for the ONE project that has taken a dated act. B has moved nothing and is not the "
  + "subject of one: announcing 'you stand nowhere' every time a partner moves would be the feed "
  + "nagging a team about an act it has not taken",
    it.map((i) => [i.class, i.subject?.id, i.subject?.version]),
    [["FINDING", A, "opening account"]]);
  /* CORRECTED 2026-08-09 (D-267 CLOSED), and the correction is the point of having pinned it.
     THE OLD ASSERTION WANTED `[A, B, SEV]` AND IT WAS RIGHT TO — it recorded what
     `#queueAncestorEdges` actually answered, not what it should, so the day the walk changed it
     went red and named itself. What was wrong was the WALK: both `refs` and `inquiry_basis` are
     projections of `references[]` that DROP `status`, so a project that authored
     `status: severed` kept its row and stayed a home. It is fixed where PL-13 said it belonged —
     at the walk, through `#refEdgeSevered`, the one predicate `#citesInto` and `#restsOnLive`
     already read — and NOT in this producer, so this arm still measures the producer's homes
     rather than a filter it applied to itself. SEV now leaves for the same reason it was never
     in `drawing_projects` two arms below: it withdrew. */
  t("and it is filed under BOTH projects drawing on the question — an item only the diverging team "
  + "could see would tell the one team that already knows. **AND THE WITHDRAWN PROJECT IS NO LONGER "
  + "A HOME (D-267, closed 2026-08-09)**: the ancestor walk confirms every candidate edge against "
  + "the citing document's own frontmatter, so a project that severed its citation stops being a "
  + "home for the questions it withdrew from — the feed and `versionAct`'s VERSION_CURRENT_UNRELATED "
  + "now agree about who is in this conversation, which is the disagreement D-267 was raised for",
    (it[0]?.case?.ancestors || []).map((a) => a.id).sort(), [A, B].sort());
  t("`elsewhere` is ENUMERATED and never summarised to a count: it names B and says B stands on "
  + "NOTHING, which is a different fact from B standing on a different reading",
    (it[0]?.basis?.elsewhere || []).map((e) => [e.project, e.version, e.state]),
    [[B, null, "stands_on_nothing"]]);
  t("the AGE is the PROJECT'S OWN AUTHORED DATE, taken from its own bytes and never from this "
  + "read's clock — a stance dated by the reader is a fact about the reader",
    [it[0]?.age?.state, S(it[0]?.age?.since) === S(it[0]?.basis?.here?.at)], ["determined", true]);
  t("the item PUBLISHES the shape of the pointer it read, so a member is not taking the sentence's "
  + "word for where the fact came from (§7 / DEC-17)",
    [it[0]?.basis?.pointer?.kind, it[0]?.basis?.pointer?.field, it[0]?.basis?.pointer?.settings_row],
    ["dated_frontmatter_field", "current_versions", false]);
  t("the SEVERED project is not in the conversation at all: it withdrew, and `refs` carries `rel` "
  + "but DROPS `status`, so a walk trusting the table alone would have counted it",
    (it[0]?.basis?.drawing_projects || []).includes(SEV), false);
  t("and neither is the project that never cited the question — the over-strictness arm that keeps "
  + "'a project may stand on a reading' from being unconditional",
    (it[0]?.basis?.drawing_projects || []).includes(C), false);
  t("the item OFFERS no act that would move somebody else's stance, and DECLARES the gap rather "
  + "than hiding it behind an empty array (D-222's grain problem)",
    [it[0]?.options_grain?.missing, /versioncurrent/.test(S(it[0]?.options_grain?.detail) || "")],
    ["stance", true]);

  /* BOTH SIDES DIVERGED. */
  const act = await makeCurrent(B, "the audit alone");
  t("B may stand on a DIFFERENT reading of the same question and the plane refuses nothing — the "
  + "legal state that makes this kind necessary rather than optional", act.ok, true);
  const it2 = itemsOf(await queue(), "stance-changed-here-not-elsewhere");
  t("now TWO items, one per dated act, each naming the OTHER team's actual reading — because a "
  + "member needs to know WHICH reading to decide whether the difference matters",
    it2.map((i) => [i.subject?.id, i.subject?.version,
                    (i.basis?.elsewhere || []).map((e) => [e.project, e.version, e.state])])
       .sort((x, y) => (x[0] < y[0] ? -1 : 1)),
    [[B, "the audit alone", [[A, "opening account", "stands_elsewhere"]]],
     [A, "opening account", [[B, "the audit alone", "stands_elsewhere"]]]]
      .sort((x, y) => (x[0] < y[0] ? -1 : 1)));

  /* CONVERGENCE IS SILENCE, and this is the arm that proves the item is a
     COMPARISON rather than a count of stances. */
  const conv = await makeCurrent(B, "opening account");
  t("when B moves ONTO A's reading the divergence is GONE and the feed says NOTHING — agreement is "
  + "not a notification, and an item that fired here would be a producer counting stances rather "
  + "than comparing them",
    [conv.ok, itemsOf(await queue(), "stance-changed-here-not-elsewhere").length], [true, 0]);

  /* THE MAP RULE: a legacy-typed shared question diverges identically. */
  await makeCurrent(A, "legacy reading", FOC);
  const leg = itemsOf(await queue(), "stance-changed-here-not-elsewhere")
    .filter((i) => i.basis?.inquiry === FOC);
  t("OVER-STRICTNESS — a LEGACY `focus`-typed shared question diverges identically (the MAP RULE): "
  + "a producer keying on the literal 'inquiry' would go silent here with nothing failing",
    leg.map((i) => [i.subject?.id, i.subject?.version]), [[A, "legacy reading"]]);
  /* Put the fixture back where §5 expects it. */
  await makeCurrent(B, "the audit alone");
}

/* ====================================================================== 5
 * SLUG TWO: `new-version-arrived-from-another-team`. THE TEAM IS **READ**.
 * ===================================================================== */
{
  const it = itemsOf(await queue(), "new-version-arrived-from-another-team")
    .filter((i) => i.basis?.inquiry === INQ)
    .sort((x, y) => (S(x.basis?.version) < S(y.basis?.version) ? -1 : 1));
  t("TWO items and not three: V1 came from A's run and V2 from B's, and V3 — composed by hand with "
  + "NO run — mints NOTHING. A member does not name a team in this record, so a producer that "
  + "guessed one would be manufacturing the connection it is claiming attention for",
    it.map((i) => [i.basis?.version, i.basis?.from_project]),
    [["opening account", A], ["the audit alone", B]]);
  t("the team is read from the RUN'S OWN CONTEXT — a stored fact set when the run was opened — and "
  + "the item says so rather than leaving a reader to assume it",
    it.map((i) => [i.basis?.team_attribution?.state, i.basis?.team_attribution?.via]),
    [["determined", "ai_runs.context"], ["determined", "ai_runs.context"]]);
  /* CORRECTED 2026-08-09 (D-267 CLOSED). Was `[B, SEV]`, pinned as the severed-blind walk
     answered. The walk now confirms each candidate edge against the citing document, so the
     withdrawn project is gone and what remains is this arm's actual subject: the AUTHORING team
     is excluded. Nothing about the exclusion rule changed — the arm below still finds A named in
     `case.excluded` with its reason, which is what distinguishes this correction from the homes
     set merely getting shorter. */
  t("A's reading is NOT filed under A: telling a team a reading 'arrived from another team' when "
  + "they authored it is a false sentence, not merely noise. (SEV is no longer a home either — "
  + "D-267 closed 2026-08-09, and a withdrawn project is not told what arrived on a question it "
  + "left)",
    (it[0]?.case?.ancestors || []).map((a) => a.id).sort(), [B]);
  t("and the removal is DECLARED on the item rather than performed quietly — a home set that is "
  + "silently shorter is indistinguishable from nobody caring (DEC-16)",
    (it[0]?.case?.excluded || []).map((e) => [e.id, e.reason]), [[A, "authored_here"]]);
  /* CORRECTED 2026-08-09 (D-267 CLOSED). Was `[A, SEV]` for the same reason as the arm above.
     The EXCLUDED half is untouched and that is deliberate: `excluded` is the producer's DECLARED
     removal (DEC-16 — a silently shorter home set is indistinguishable from nobody caring), while
     a severed edge never enters the walk at all, so it is not something this producer removed and
     must not be reported as one. The two mechanisms stay visibly separate here. */
  t("the mirror holds for B's reading, which is what makes the exclusion a RULE rather than one "
  + "project's special case",
    [(it[1]?.case?.ancestors || []).map((a) => a.id).sort(), (it[1]?.case?.excluded || []).map((e) => e.id)],
    [[A], [B]]);
  t("the AGE is the version's own authored instant, and the item states nothing about the stance "
  + "having moved — a reading ARRIVING is not a reading being adopted",
    [it[0]?.age?.state, it[0]?.age?.since, /is not a reading being adopted/.test(S(it[0]?.detail) || "")],
    ["determined", "2026-07-03T00:00:00Z", true]);
  t("the version's state and its hidden flag are RETURNED AND FLAGGED, never filtered (D-214, "
  + "DEC-29(b)): hiding is a display decision one project made, not a reason another never learns",
    [it[0]?.basis?.state, it[0]?.basis?.hidden], ["accepted", false]);
  t("the run-less version is absent for a REASON THE PRODUCER PUBLISHES — the declared gap is "
  + "D-266, and it is driven here rather than described in a comment",
    [/D-266/.test(S(it[0]?.basis?.team_attribution?.detail) || ""),
     itemsOf(await queue(), "new-version-arrived-from-another-team")
       .some((i) => i.basis?.version === "composed by hand")], [true, false]);
  /* ADDED 2026-08-09 by D-266, extending this section rather than replacing any
     of it. The arm above proves the SILENCE is correct — a reading whose team
     this record cannot read mints no item, because attributing one would be the
     record claiming more than it can support. What it could not prove, because
     the plane did not say it, is that the silence is DISTINGUISHABLE FROM AN
     ABSENCE. Until now a member reading this feed could not tell *no reading
     arrived from another team* from *readings arrived and nobody can say whose
     they are*, and those are different facts about the world. The count is on
     the feed's envelope now; the ATTRIBUTION still is not, and must not be. */
  {
    const q = await queue();
    t("D-266 — THE SILENCE IS COUNTED, AND BOTH WAYS OF BEING UNATTRIBUTABLE ARE IN THE COUNT: V3, "
    + "composed by hand with no run at all, and V4, carried by a run whose context is a project "
    + "that does not draw on this question. TWO, not one — an exact figure rather than 'at least "
    + "one', because a count that only ever had to be non-zero would have passed over a producer "
    + "that found the first and dropped the second. Neither reading is named, attributed or guessed "
    + "at; what the feed publishes is HOW MANY it could not attribute and WHICH QUESTION to go and "
    + "look at. Absence at one level is not evidence of absence at the next",
      [Number(q.unattributed_readings?.count),
       (q.unattributed_readings?.inquiries || []).includes(INQ),
       JSON.stringify(q.unattributed_readings || {}).includes("composed by hand"),
       JSON.stringify(q.unattributed_readings || {}).includes("unrelated project")],
      [2, true, false, false]);
    t("D-266 — and the count did NOT come at the price of an invented item: V4 mints nothing, "
    + "exactly as V3 does, so counting the silence has not turned into announcing a team. This is "
    + "the arm that stops the fix from becoming the defect it was avoiding",
      itemsOf(q, "new-version-arrived-from-another-team")
        .filter((i) => i.basis?.inquiry === INQ)
        .map((i) => i.basis?.version).sort(),
      ["opening account", "the audit alone"]);
    t("and the answer says WHY it cannot tell one kind of unattributable reading from another, "
    + "rather than leaving a reader to assume the distinction was made — projecting a stored "
    + "column of `ai_runs` is what telling them apart would take, and REC-74's declared role for "
    + "this reader forbids it",
      /REC-74/.test(S(q.unattributed_readings?.detail) || ""), true);
  }
}

/* ====================================================================== 6
 * THE MINT ACCEPTS BOTH KINDS AND THE FEED STILL ANSWERS.
 * ===================================================================== */
{
  const q = await queue();
  t("op=queue answers OK with both new kinds present — the mint refuses an uncatalogued kind and a "
  + "misclassed one, and this is the arm that proves the new kinds pass rather than that the mint "
  + "is asleep (the refusals themselves are the control harness's to drive)",
    [q.ok, ITEMS(q).length > 0,
     ITEMS(q).length > 0 && ITEMS(q).every((i) => classOfKind(i.kind) === i.class)], [true, true, true]);
  t("and the two new kinds coexist with the lead — PL-15's producer is untouched by this item, "
  + "asserted rather than assumed",
    Object.keys(QUEUE_FINDING_KINDS).includes("out-of-inquiry-lead"), true);
}

/* ====================================================================== 7
 * THE DISPOSITION IDENTITY — UI-45's HANDED-OVER PLANE QUESTION, ANSWERED,
 * PUBLISHED, AND **DRIVEN INTO THE REAL ACT IN BOTH DIRECTIONS.**
 * ===================================================================== */
{
  const q = await queue();
  t("EVERY item carries a `disposition` — the plane answers what identity the act is keyed on, so "
  + "no surface has to reconstruct the key from field names it learned by reading producers "
  + "(the drift class DEC-8 closed)",
    ITEMS(q).length > 0 && ITEMS(q).every((i) => i.disposition && typeof i.disposition.available === "boolean"), true);
  /* CORRECTED 2026-08-10 BY D-266's WIDENING (IC-60), AND THE OLD ASSERTION IS
     SAID TO BE WRONG RATHER THAN EXEMPTED. It required EVERY item's `keyed_on`
     to be the progression pair, which was true when exactly one key shape
     existed and became false the moment a second one did. THE RULE IT WAS
     REACHING FOR IS THE ONE THAT SURVIVES: the key is a NAMED SHAPE and never
     left implicit, and it AGREES WITH THE ITEM'S OWN `scope` — which is a
     stronger pin than the old literal, because it fails if a producer ever
     publishes one scope's name over the other's key. */
  const KEY_SHAPES = { instance: '["progression_key","stage_key"]', project: '["project","finding"]' };
  t("the key is published as a NAMED SHAPE rather than left implicit, and the shape AGREES with the "
  + "scope the same item publishes — the two-shape successor to the single-pair pin, and it fails "
  + "on a producer that names one scope while publishing the other's key",
    ITEMS(q).length > 0 && ITEMS(q).every((i) => {
      const d = i.disposition || {};
      const want = d.scope === null || d.scope === undefined
        ? KEY_SHAPES.instance : KEY_SHAPES[d.scope];
      return want !== undefined && JSON.stringify(d.keyed_on) === want;
    }), true);
  const mine = ITEMS(q).filter((i) =>
    i.kind === "stance-changed-here-not-elsewhere" || i.kind === "new-version-arrived-from-another-team");
  /* CORRECTED 2026-08-10, AND THIS IS THE ASSERTION THE RULING TURNED OVER.
     It used to read *NEITHER of this item's two kinds is dispositionable*, with
     `available: false` and `reason: "no_disposition_identity"`, and it was RIGHT
     while the act had one key shape: a finding carrying no progression stage had
     no identity to be recorded against. D-266's 2026-08-10 scoping ruling gave
     it one — a dismissal is scoped to THE KEY'S OWN SUBJECT, and the subject of
     a stance-scoped finding is one project's own property (§7/D-216, R5). So
     both kinds ARE dispositionable now, at PROJECT scope, and the thing that
     must not drift is that the act is scoped rather than merely available. */
  t("BOTH of this item's two kinds are dispositionable AT PROJECT SCOPE — the act is keyed on "
  + "(project, finding) because a stance is one project's own property, and the item names the "
  + "projects whose feed a decision would govern",
    [mine.length > 0,
     mine.every((i) => i.disposition.available === true),
     [...new Set(mine.map((i) => i.disposition.scope))],
     mine.every((i) => Array.isArray(i.disposition.projects) && i.disposition.projects.length > 0)],
    [true, true, ["project"], true]);
  t("and `key` is NULL while `available` is TRUE, which is the honest answer and not an omission: "
  + "the ACTING project is the member's to name, and `requires` says so on the item",
    [mine.every((i) => i.disposition.key === null),
     mine.every((i) => JSON.stringify(i.disposition.requires) === '["project","finding"]'),
     mine.every((i) => i.disposition.finding === i.id)],
    [true, true, true]);
  t("and the publication POINTS AT THE RULING rather than at an open question — D-266's scoping "
  + "ruling is MADE, so the sentence names the boundary instead of promising one",
    mine.every((i) => /D-266/.test(S(i.disposition.detail) || "")), true);
  /* THE OTHER TWO CLASSES ARE ASSERTED STRUCTURALLY, AND WHY IS SAID PLAINLY
     RATHER THAN LEFT TO BE NOTICED — this is the part of the block that could
     have been quietly weaker instead of quietly labelled.

     THIS FIXTURE EMITS NO OBLIGATION AND NO CONDITION. An OBLIGATION needs a
     `task_queue` row, and **`taskenqueue` IS NOT AN OP** — index.mjs says so at
     its own OPS table (*"what is NOT here: `taskenqueue`. The producer is…"*),
     so a suite reaches it only through a whole capture-with-undetermined-
     authority path or by talking to the Durable Object directly. **THE DIRECT
     ROUTE WAS TRIED HERE AND IS RECORDED AS AN INSTRUMENT FINDING RATHER THAN
     SMOOTHED AWAY: `mf.getDurableObjectNamespace("STORE")` inside this harness
     HUNG the suite past 300 seconds instead of failing** — which is worse than
     a refusal, because it reads as a slow test. The three CONDITION generators
     likewise read the governor's cool-off, a capture-session ledger and a
     machine-written manifest, none of which this fixture builds.

     SO, STATED SO NOBODY READS THIS BLOCK AS MORE THAN IT IS: the FINDING half
     of this publication is DRIVEN, both directions, into the real act, twice;
     the OBLIGATION and CONDITION halves are PINNED against the plane's own
     source. **`queue-state.test.mjs` is the suite that drives OBLIGATION and
     CONDITION items for real, and nothing here claims to.** */
  t("an OBLIGATION says the act is a RESOLVE and a CONDITION says it is a MUTE — three classes, "
  + "three answers, because 'no' alone is the gate that pressures somebody into inventing a way "
  + "past it. STRUCTURAL, and LABELLED as such: this fixture emits neither class, which is why the "
  + "count below is asserted at zero rather than left to be assumed",
    [/an_obligation_is_resolved_not_disposed/.test(STORE_SRC),
     /instead: "taskresolve"/.test(STORE_SRC),
     /a_condition_is_acknowledged_or_muted/.test(STORE_SRC),
     /instead: "queuemute"/.test(STORE_SRC),
     ITEMS(q).filter((i) => i.class !== "FINDING").length], [true, true, true, true, 0]);

  /* THE PUBLICATION IS A MEASUREMENT OF THE ACT, IN BOTH DIRECTIONS. A claim
     about `op=proposedispose` that never calls it is a claim; these two calls
     are what make it a measurement. */
  const def = await POST(`op=progressiondefine&token=${RUTH}`, {
    progressionKey: "pl13-flow", label: "PL-13 fixture flow",
    stages: [{ key: "filed", label: "Filed", cardinality: "1", required: "always" },
             { key: "heard", label: "Heard", after: "filed", cardinality: "1", required: "always" }] });
  t("the fixture progression is defined — the non-empty guard for the two DRIVEN arms below, "
  + "without which both would be measuring a refusal against a progression that never existed",
    [def.ok, def.stage_count], [true, 2]);
  /* A REAL PROPOSAL, so the feed contains an item that DOES carry the identity.
     Without one, every `available` in this suite could be `false` and every arm
     would still pass — the trivially-false publication. It costs a full
     entity -> reading -> resolve -> thread chain and it is worth it, because
     that chain is the only thing that makes the over-strictness arm real. */
  const ent = await POST(`op=entitycreate&token=${RUTH}`,
    { kind: "contract", label: "PL-13 fixture contract", aliases: ["contract:PL13"] });
  const RCAP = "b".repeat(63) + "2";
  const RDOC = "INFO-2026-4000-filed";
  const rmd = infoMd(RDOC);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: RCAP, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
               entities: [{ ref: "contract:PL13", kind: "contract", key: "PL13",
                            label: "PL-13 fixture contract" }] } }] });
  await POST(`op=promote&token=${RUTH}`, {
    bundleId: RDOC, base: null, snapKey: `${RDOC}-1-${sha("r").slice(0, 6)}`,
    files: [{ path: "bundle.md", text: rmd, bytes: rmd.length, sha256: sha(rmd) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [],
    meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${RDOC}`,
            current_state: "collected", created: NOW, last_updated: LATER } });
  await POST(`op=resolve&token=${RUTH}`, { captureSha: RCAP });
  const th = await POST(`op=thread&token=${RUTH}`, { progressionKey: "pl13-flow",
    entityId: ent?.entity_id, placements: [{ stage: "heard", captureSha: RCAP }] });
  t("a REAL progression instance places only the LATER stage, so `filed` is a missing-required "
  + "proposal — the item that carries the disposition identity, without which every `available` "
  + "below could be false and every arm would still pass",
    [th?.ok !== false,
     ((await GET(`op=proposals&token=${RUTH}`))?.proposals || []).some((p) => p.key === "pl13-flow::filed")],
    [true, true]);
  const real = await POST(`op=proposedispose&token=${RUTH}`,
    { key: "pl13-flow::heard", to: "deferred", reason: "parked for the next budget cycle" });
  t("DRIVEN — the pair the plane publishes as `keyed_on` is the pair the act ACCEPTS: a real "
  + "(progression, stage) disposes and is recorded",
    [real.ok, real.key], [true, "pl13-flow::heard"]);
  const bogus = await POST(`op=proposedispose&token=${RUTH}`,
    { key: `${INQ}::opening account`, to: "deferred", reason: "trying to dispose of a reading" });
  t("DRIVEN, THE OTHER WAY — an identity one of THIS ITEM'S items carries is REFUSED by the act, "
  + "which is why publishing `available: false` is a measurement of op=proposedispose and not a "
  + "claim about it",
    [bogus.ok, bogus.reason], [false, "NO_SUCH_PROGRESSION"]);
  /* RE-READ, because the proposal was created AFTER `q` was taken and an arm
     asserting over a stale feed is an arm asserting over the wrong corpus. */
  const q2 = await queue();
  const dispositionable = ITEMS(q2).filter((i) => i.disposition?.available === true);
  /* CORRECTED 2026-08-10 (IC-60). The final clause used to require a composed
     `<a>::<b>` key on EVERY dispositionable item, which was true when the only
     dispositionable item was an instance-wide one and became false when a
     project-scoped item — whose `key` is deliberately NULL, because the acting
     project is the member's to name — became dispositionable too. The arm's JOB
     is unchanged and is why it survives rather than being deleted: it stops the
     whole publication from being trivially false. It now asks the key-shape
     question OF THE SCOPE THAT HAS A KEY, and asks the project-scoped items for
     the thing THEY must carry instead. */
  const instanceScoped = dispositionable.filter((i) => i.disposition.scope === "instance");
  t("OVER-STRICTNESS — an item that DOES carry the pair still advertises the act, with the KEY the "
  + "act accepts. This is the arm that stops the whole publication from being trivially false: "
  + "without it every `available` in this suite could be `false` and nothing would fail",
    [dispositionable.length > 0,
     [...new Set(dispositionable.map((i) => i.class))],
     [...new Set(dispositionable.map((i) => i.disposition.op))],
     instanceScoped.length > 0,
     instanceScoped.every((i) => /^[^:]+::.+$/.test(S(i.disposition.key) || ""))],
    [true, ["FINDING"], ["proposedispose"], true, true]);
  const byKey = dispositionable.find((i) => i.disposition.key === "pl13-flow::filed");
  const drivenReal = await POST(`op=proposedispose&token=${RUTH}`,
    { key: byKey ? byKey.disposition.key : "NO-SUCH-ITEM", to: "dismissed",
      reason: "the filing predates the record and is not obtainable" });
  t("DRIVEN — the key taken STRAIGHT OFF THE ITEM the plane published is accepted by the act "
  + "without the caller composing anything, which is the whole point of publishing it",
    [drivenReal.ok, drivenReal.key], [true, "pl13-flow::filed"]);
}

/* ====================================================================== 8
 * NO TABLE WAS ADDED, PROVED BY CONSEQUENCE (D-113).
 * ===================================================================== */
{
  const before = itemsOf(await queue(), "stance-changed-here-not-elsewhere")
    .filter((i) => i.basis?.inquiry === INQ).length
    + itemsOf(await queue(), "new-version-arrived-from-another-team")
    .filter((i) => i.basis?.inquiry === INQ).length;
  t("both producers are live on the shared question before the purge — the non-empty guard, "
  + "without which the arm below would report its verdict over nothing",
    before > 0, true);
  /* `confirm` is the INSTANCE NAME, not the bundle id — the control plane's own
     fence, and getting it wrong reads exactly like the purge failing. */
  const p = await GET(`op=purge&token=adm-pl13&confirm=bio`
    + `&bundleId=${encodeURIComponent(INQ)}`);
  const after = itemsOf(await queue(), "stance-changed-here-not-elsewhere")
    .filter((i) => i.basis?.inquiry === INQ).length
    + itemsOf(await queue(), "new-version-arrived-from-another-team")
    .filter((i) => i.basis?.inquiry === INQ).length;
  t("PURGE THE SHARED QUESTION AND BOTH ITEMS GO QUIET — proved by CONSEQUENCE and not "
  + "structurally, because this item adds NO TABLE: both producers derive on read from facts the "
  + "record already holds, so there is nothing for op=purge to be taught and nothing to leave "
  + "behind (D-113's whole failure mode, avoided rather than handled)",
    [p.ok !== false, after], [true, 0]);
  t("and the LEGACY question's divergence SURVIVES the purge of the other one, which is what "
  + "proves the silence above is the purge and not the walk falling over",
    itemsOf(await queue(), "stance-changed-here-not-elsewhere")
      .some((i) => i.basis?.inquiry === FOC), true);
}

/* THE FOOT, AND IT IS NOT DECORATION — this suite was GREEN AT 59/0 AND STILL
   HUNG FOREVER, which the battery would have reported as a stalled run rather
   than as a pass. Miniflare holds open handles (an isolate, and the `ai_runs`
   lease this fixture opens), so the event loop never drains on its own.
   `dispose()` releases them and the process then ENDS ON ITS OWN RESULT, which
   is hygiene.test.mjs's rule: the exit code IS the failure count, so a suite
   whose process merely finished cannot be mistaken for one that finished GREEN.
   Recorded because a green tally printed by a process that never exits is the
   most expensive shape of all — it looks like success and blocks everything. */
await mf.dispose();
/* THE TALLY LINE IS THE BATTERY'S OWN GRAMMAR AND NOT THIS SUITE'S TASTE. The
   first draft printed `N pass, M FAIL`; `scripts/battery.mjs` reads
   `/(\d+)\s+pass(?:ed)?,\s+(\d+)\s+fail(?:ed)?/` and the capital spelling made
   the whole suite report `assertions unknown` — 59 real assertions contributing
   ZERO to the battery's total while the suite showed `ok`. A suite whose count
   the runner cannot read is a suite that silently ran short, which is D-93's
   own lesson wearing a different hat. */
console.log(`\n  current: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
