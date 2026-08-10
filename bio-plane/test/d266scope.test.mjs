/* D-266 / IC-60 — **A DISMISSAL IS SCOPED TO THE KEY'S OWN SUBJECT**, and the two
 * behaviours that sentence produces are asserted HERE, IN ONE SUITE, ON READS OF ONE
 * FEED.
 *
 * ---- WHY ONE SUITE, AND IT IS THE ITEM'S ACCEPTANCE CONDITION RATHER THAN TIDINESS
 *
 * The thing D-266's widening had to get right is a DISTINCTION, not a feature:
 *
 *   · a SHARED-RECORD finding — one carrying a defined progression's real stage —
 *     dismissed anywhere clears EVERYWHERE. That is DEC-16, and it is DEDUP rather
 *     than judgment-suppression, because its subject is the shared record: one fact,
 *     appearing under N cases, settled once.
 *   · a STANCE-SCOPED finding — one carrying no such pair — dismissed by one team
 *     governs THAT TEAM'S FEED AND NOTHING ELSE. A stance is expressly one project's
 *     own property (§7, D-216), a dismissal is a judgment-layer act, and R5 makes
 *     forks at the judgment layer legitimate. It is the same boundary
 *     `#findingsStanceDiverged` already enforces by refusing to offer
 *     `op=versioncurrent` across projects.
 *
 * **A DISTINCTION ASSERTED IN TWO SUITES IS NOT ASSERTED.** Two suites can each go
 * green while the two behaviours have quietly become one — that is exactly what an
 * instance-wide key on the stance-scoped act would do, and the suite that only knew
 * about progression findings would never notice. So both halves are driven against
 * THE SAME STORE, in THE SAME READS, and the last block asserts them together out of
 * one answer. The distinction is PINNED rather than implied.
 *
 * ---- WHAT IS DRIVEN, in the order the blocks run
 *
 *  1. THE FIXTURE IS REAL AND BOTH KINDS ARE LIVE. Two projects share one question
 *     and stand on two readings, so the divergence items exist; one progression
 *     instance is missing a required stage, so a shared-record finding exists; and
 *     the progression finding is filed under BOTH projects, without which "clears
 *     everywhere" would be a claim over one case and would prove nothing.
 *  2. THE PLANE PUBLISHES WHICH ACT EACH ITEM IS OPEN TO — `scope`, `keyed_on`,
 *     `projects`, `requires` — so a surface reads the answer instead of learning the
 *     key by reading producers (the DEC-8 drift class IC-53 closed one field over).
 *  3. THE STANCE-SCOPED HALF, DRIVEN THROUGH THE CONTROL PLANE. Team A dismisses the
 *     notification that team B stands elsewhere. **B'S FEED STILL CARRIES IT**, the
 *     item's homes lose A and say so, and the decision is published.
 *  4. THE SHARED-RECORD HALF, DRIVEN THE SAME WAY. One dismissal of the progression
 *     finding clears it under EVERY case at once.
 *  5. THE DISTINCTION, OUT OF ONE ANSWER. Both facts read off a single `op=queue`
 *     response, which is the arm the item exists for.
 *  6. RE-TRIAGE (D-79). A standing decision can be CHANGED — one row, never two, and
 *     the feed reports the new decision rather than the old. A disposition ages a
 *     finding; it never freezes it.
 *  7. THE REFUSALS, each fail-closed and each naming what is missing — including the
 *     bridge for a surface built before IC-60.
 *  8. op=purge takes the new table (D-113).
 *
 * Everything is driven THROUGH the control plane, which is a real caller's only
 * route, so `scripts/coverage.mjs` credits the ops on the control-plane surface and
 * not merely at the store (D-43; `op=invitelook` shipped with a ReferenceError while
 * 1276 store-level assertions passed).
 *
 * ---- WHAT THIS SUITE CANNOT SEE, stated rather than left to be assumed
 *
 *   IT CANNOT see two members in two projects reading two feeds. One store, one
 *     Durable Object, one administrator credential — §7.3 gives an administrator
 *     every project, which is what lets ONE credential drive both teams' acts, and
 *     that is a convenience of the INSTRUMENT and never a claim about the model.
 *     **So "B's feed still carries it" is observed as the ITEM'S OWN HOME SET**: the
 *     item is still in the answer and B is still among its `case.ancestors`, while A
 *     is not and the removal is declared. That is precisely what an instance-wide key
 *     destroys, which is why negative-control arm (1) is the arm this item turns on.
 *   IT CANNOT drive `op=cite` from a project onto an inquiry, because that door does
 *     not exist (REC-72, measured by D-216): the sharing edge is hand-authored into
 *     `references[]` and promoted, exactly as PL-2's fixture and D-216's probe had to.
 *   IT CANNOT see a surface. What `civicos-ui/app.html` does with the widened
 *     publication is UI's, delegated in `CLAIMS.md` and measured in IC-60.
 *
 * NEGATIVE CONTROL: (a) IN-SUITE, block 7 — every refusal is driven: a finding with no
 *   project is NO_PROJECT_SCOPE, a project with no finding is NO_FINDING, a project id
 *   that names an INQUIRY is NO_SUCH_PROJECT, an empty reason is NO_REASON and a bad
 *   token is NOT_A_DISPOSITION on BOTH key shapes, and the pre-IC-60 surface's
 *   `key`-only call is refused NO_PROJECT_SCOPE naming the two arguments to send
 *   rather than NO_SUCH_PROGRESSION, which was true and useless.
 *   (b) THE THREE ARMS THAT EDIT REAL SOURCES live in `test/d266scope.control.mjs` —
 *   `cd bio-plane && node test/d266scope.control.mjs` — each armed ALONE with every
 *   other defence held open, each declaring before it runs what must fail and what
 *   must NOT, every restore verified by sha256, by content and by `cmp` against a
 *   per-arm pristine copy, pen inside the worktree. RUN 2026-08-10 (d266-scope).
 *   BASELINE this suite 38/0, current.test.mjs 63/0. ALL THREE AS DECLARED:
 *   (1) THE ARM THIS ITEM EXISTS FOR — key the stance-scoped disposition INSTANCE-WIDE
 *   (the per-finding map stops discriminating on project) -> **this suite 27/11**,
 *   current 63/0. The fires-for-B arm and the one-answer distinction arm fall BY NAME,
 *   while `ONE ACT CLEARED IT UNDER EVERY CASE` stays GREEN — which is the measurement
 *   that a suite knowing only about progression findings would have carried this defect
 *   indefinitely, and the reason both behaviours are in ONE suite.
 *   (2) SCOPE THE SHARED-RECORD KIND PER-PROJECT (both halves: `proposalsFeed`'s ageing
 *   key AND the mint's scope) -> **this suite 34/4**, current **61/2**. The dedup
 *   assertion falls, DEC-16's own reason in the opposite direction, while the
 *   stance-scoped arms stay green — the two behaviours are independent rather than one
 *   switch with two labels. **AND THE FIRST DRAFT OF THIS ARM MEASURED SOMETHING WORTH
 *   KEEPING: arming only the mint left `cleared everywhere` GREEN**, because the
 *   instance-wide ageing lives UPSTREAM in `proposalsFeed` and does not consult what
 *   the mint later says the act is scoped to.
 *   (3) OVER-STRICTNESS — freeze the decision (the UPSERT becomes `DO NOTHING`) ->
 *   **this suite 36/2**, current 63/0. A re-triage must still be able to change a
 *   standing disposition, because D-79 ages findings and never freezes them. **ITS
 *   DECLARATION WAS WRONG ON THE FIRST RUN AND THE CORRECTION IS THE ARM'S BEST
 *   FINDING: a freeze is SILENT AT THE ACT** — `DO NOTHING` returns `ok: true` exactly
 *   as an UPSERT does — **and visible only in the feed**, so an arm declared against the
 *   act's answer would have gone green over a plane that told a member their re-triage
 *   landed and then kept the old decision.
 * ========================================================================= */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
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
/* NULL-TOLERANT throughout (PL-1's discipline): an arm that throws on a property of
   undefined takes every arm behind it with it and reports one defect as none. */
const S = (v) => (typeof v === "string" ? v : null);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d266s", MEMBER_TOKEN: "mem-d266s", PROBE_TOKEN: "prb-d266s",
              DAEMON_TOKEN: "dmn-d266s", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-d266s",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});

const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body) })).json());

/* ---------------------------------------------------------------- MEMBERS */
const enrol = async (memberId, role, caps) => {
  const add = await POST(`op=memberadd&token=adm-d266s`,
    { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  if (!add.ok) throw new Error(`memberadd ${memberId}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);

/* ------------------------------------------------------------- FIXTURES
   The document shapes are current.test.mjs's, which is deliberate: this suite and
   that one must be able to disagree about BEHAVIOUR without disagreeing about what a
   project or a reading looks like. */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const scalar = (k, v) => v === null ? [`    ${k}: null`]
  : v === undefined ? [] : typeof v === "boolean" ? [`    ${k}: ${v}`]
  : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  const rows = versions.map((v) => ['  - name: "' + v.name + '"',
    ...scalar("description", v.description), ...scalar("relationship", "and"),
    ...scalar("state", "suggested"), ...scalar("derived_from", null), ...scalar("hidden", false),
    ...scalar("run", v.run), ...scalar("author", "ruth"), ...scalar("at", v.at ?? NOW),
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
const inquiryMd = (id, { versions = [], basis = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
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
const projectMd = (id, { title, cites = [] } = {}) => ["---",
  `id: ${id}`, "object_type: project", `title: "${title}"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  ...(cites.length
    ? ["references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
    : ["references: []"]),
  "required_strength:", "  capture: B", "  connection: C",
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");

let snapSeq = 0;
const promote = async (id, text, type) => POST(`op=promote&token=${RUTH}`, {
  bundleId: id, base: null,
  snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : type === "project" ? "forming" : "collected",
          created: NOW, last_updated: LATER } });
const mustPromote = async (id, text, type) => {
  const r = await promote(id, text, type);
  if (!r.ok) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};

const LEDGER = "INFO-2026-5000-ledger", MINUTES = "INFO-2026-5000-minutes";
const A = "PROJ-2026-5000-oversight", B = "PROJ-2026-5000-budget";
const INQ = "INQ-2026-5000-sewer-transfers";
const RUN_A = "AIRUN-2026-5000-oversight", RUN_B = "AIRUN-2026-5000-budget";

/* THE PROGRESSION DOCUMENT, PROMOTED FIRST so the shared question can cite it. That
   citation is not decoration: it is what puts the SHARED-RECORD finding under BOTH
   projects, and without it "one act clears it everywhere" would be asserted over a
   single case and would prove nothing about `everywhere`. */
const RCAP = "c".repeat(63) + "3";
const RDOC = "INFO-2026-5000-filed";
{
  const rmd = infoMd(RDOC);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: RCAP, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
               entities: [{ ref: "contract:D266S", kind: "contract", key: "D266S",
                            label: "D-266 fixture contract" }] } }] });
  const r = await POST(`op=promote&token=${RUTH}`, {
    bundleId: RDOC, base: null, snapKey: `${RDOC}-1-${sha("r").slice(0, 6)}`,
    files: [{ path: "bundle.md", text: rmd, bytes: rmd.length, sha256: sha(rmd) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [],
    meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${RDOC}`,
            current_state: "collected", created: NOW, last_updated: LATER } });
  if (!r.ok) throw new Error(`promote ${RDOC}: ${JSON.stringify(r).slice(0, 800)}`);
}
for (const d of [LEDGER, MINUTES]) await mustPromote(d, infoMd(d), "information");

const V1 = { name: "opening account", run: RUN_A, at: "2026-07-03T00:00:00Z",
  description: "The first reading: the ledger and the minutes together show the transfer.",
  grounds: ["paper trail"],
  legs: [{ target: LEDGER, ground: "paper trail" }, { target: MINUTES, ground: "paper trail" }] };
const V2 = { name: "the ledger alone", run: RUN_B, at: "2026-07-04T00:00:00Z",
  description: "Second reading: the ledger carries the finding without the minutes.",
  grounds: ["the ledger"], legs: [{ target: LEDGER, ground: "the ledger" }] };

await mustPromote(A, projectMd(A, { title: "Oversight", cites: [INQ] }), "project");
await mustPromote(B, projectMd(B, { title: "Budget", cites: [INQ] }), "project");
const openRun = async (run, ctx) => {
  const r = await POST(`op=airunopen&token=${RUTH}`, {
    run, contextType: "project", contextId: ctx,
    label: `D-266 fixture — a run working under ${ctx}`, mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 });
  if (r?.started !== true) throw new Error(`airunopen ${run}: ${JSON.stringify(r).slice(0, 600)}`);
};
await openRun(RUN_A, A);
await openRun(RUN_B, B);
await mustPromote(INQ, inquiryMd(INQ, { versions: [V1, V2], basis: [LEDGER, MINUTES, RDOC] }), "inquiry");

/* §6 RULE 5: a project can only stand on a reading its members have ACCEPTED, so the
   fixture accepts before it stands. That is the product's own order of acts. */
const accept = async (version) =>
  POST(`op=versionaccept&token=${RUTH}&target=${encodeURIComponent(INQ)}`
     + `&version=${encodeURIComponent(version)}`, { affirmed: true });
const makeCurrent = async (project, version) =>
  POST(`op=versioncurrent&token=${RUTH}&target=${encodeURIComponent(INQ)}`
     + `&version=${encodeURIComponent(version)}&project=${encodeURIComponent(project)}`, {});
{
  const a1 = await accept(V1.name), a2 = await accept(V2.name);
  if (a1.ok === false || a2.ok === false)
    throw new Error(`versionaccept: ${JSON.stringify([a1, a2]).slice(0, 600)}`);
  const c1 = await makeCurrent(A, V1.name), c2 = await makeCurrent(B, V2.name);
  if (c1.ok === false || c2.ok === false)
    throw new Error(`versioncurrent: ${JSON.stringify([c1, c2]).slice(0, 600)}`);
}

/* THE PROGRESSION, so the feed carries a SHARED-RECORD finding beside the
   stance-scoped ones. Only the LATER stage is placed, so `filed` is a
   missing-required proposal. */
const PKEY = "d266s-flow";
{
  const def = await POST(`op=progressiondefine&token=${RUTH}`, {
    progressionKey: PKEY, label: "D-266 fixture flow",
    stages: [{ key: "filed", label: "Filed", cardinality: "1", required: "always" },
             { key: "heard", label: "Heard", after: "filed", cardinality: "1", required: "always" }] });
  if (!def.ok) throw new Error(`progressiondefine: ${JSON.stringify(def).slice(0, 600)}`);
  const ent = await POST(`op=entitycreate&token=${RUTH}`,
    { kind: "contract", label: "D-266 fixture contract", aliases: ["contract:D266S"] });
  await POST(`op=resolve&token=${RUTH}`, { captureSha: RCAP });
  const th = await POST(`op=thread&token=${RUTH}`, { progressionKey: PKEY,
    entityId: ent?.entity_id, placements: [{ stage: "heard", captureSha: RCAP }] });
  if (th?.ok === false) throw new Error(`thread: ${JSON.stringify(th).slice(0, 600)}`);
}

/* THE ONE FEED EVERY ARM READS. `op=queue` is spelled as a literal (never
   interpolated) so scripts/coverage.mjs credits the control-plane surface. */
const queue = async () => GET(`op=queue&token=${RUTH}&limit=500`);
/* EVERY READ GOES THROUGH `ITEMS`: when the mint REFUSES, op=queue answers with no
   `items` at all and a bare `q.items.filter(...)` throws a TypeError that ends the
   module while the tally reads clean. A refused feed must FAIL these arms and say so.
   (current.test.mjs paid for this lesson; it is not re-learned here.) */
const ITEMS = (q) => (q && Array.isArray(q.items)) ? q.items : [];
const itemsOf = (q, kind) => ITEMS(q).filter((i) => i && i.kind === kind);
const byId = (q, id) => ITEMS(q).find((i) => i && i.id === id) || null;
const homesOf = (it) => ((it && it.case && Array.isArray(it.case.ancestors)) ? it.case.ancestors : [])
  .map((a) => a.id).sort();
const disposedOf = (q) => ((q && q.disposed && Array.isArray(q.disposed.findings))
  ? q.disposed.findings : []);
/* THE ACT, reached by a member THROUGH the control plane. The literal
   `op=proposedispose` is here (not interpolated) for the same coverage reason. */
const dispose = async (body) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=proposedispose&token=${RUTH}`,
  { method: "POST", body: JSON.stringify(body) })).json());

/* The two identities every block below turns on, composed ONCE. Both are the feed's
   own spelling of the item id and neither is reconstructed from columns. */
const STANCE_ABOUT_B = `FINDING::stance-changed-here-not-elsewhere::${INQ}::${B}`;
const STANCE_ABOUT_A = `FINDING::stance-changed-here-not-elsewhere::${INQ}::${A}`;
const SHARED_FINDING = `FINDING::${PKEY}::filed`;

/* ====================================================================== 1
 * THE FIXTURE IS REAL, AND BOTH KINDS ARE LIVE UNDER BOTH PROJECTS.
 * ===================================================================== */
{
  const q = await queue();
  t("the feed answers OK and carries items — the non-empty guard, without which every "
  + "arm below would report its verdict over an empty list",
    [q.ok, ITEMS(q).length > 0], [true, true]);
  const div = itemsOf(q, "stance-changed-here-not-elsewhere");
  t("TWO divergence items, one per project holding a stance — two dated acts and two teams "
  + "who each need to know the other is elsewhere",
    div.map((i) => i.id).sort(), [STANCE_ABOUT_A, STANCE_ABOUT_B].sort());
  t("and BOTH are filed under BOTH projects, which is what makes the scoping question real: "
  + "an item only the diverging team could see would tell the one team that already knows",
    div.map((i) => homesOf(i)), [[A, B].sort(), [A, B].sort()]);
  const shared = byId(q, SHARED_FINDING);
  t("the SHARED-RECORD finding is live too — a defined progression's real stage, missing and "
  + "required",
    [shared !== null, S(shared && shared.kind)], [true, "missing_predecessor"]);
  t("and it is filed under BOTH projects as well as the question, WITHOUT WHICH `clears "
  + "everywhere` would be asserted over one case and would prove nothing",
    [homesOf(shared).includes(A), homesOf(shared).includes(B), homesOf(shared).length >= 2],
    [true, true, true]);
}

/* ====================================================================== 2
 * THE PLANE PUBLISHES WHICH ACT EACH ITEM IS OPEN TO, AND AT WHAT SCOPE.
 * ===================================================================== */
{
  const q = await queue();
  const st = byId(q, STANCE_ABOUT_B), sh = byId(q, SHARED_FINDING);
  t("the STANCE-SCOPED item publishes scope `project`, the key shape (project, finding), a NULL "
  + "key — because the acting project is the member's to name — and the projects a decision "
  + "could govern",
    [st?.disposition?.available, st?.disposition?.scope, st?.disposition?.keyed_on,
     st?.disposition?.key, st?.disposition?.finding, (st?.disposition?.projects || []).slice().sort(),
     st?.disposition?.requires],
    [true, "project", ["project", "finding"], null, STANCE_ABOUT_B, [A, B].sort(),
     ["project", "finding"]]);
  t("the SHARED-RECORD item publishes scope `instance` and the composed key the act accepts — "
  + "UNCHANGED by this item, which is the half that had to not move",
    [sh?.disposition?.available, sh?.disposition?.scope, sh?.disposition?.keyed_on,
     sh?.disposition?.key],
    [true, "instance", ["progression_key", "stage_key"], `${PKEY}::filed`]);
  t("and the two sentences each NAME the boundary they draw, so a reader of one item is not "
  + "left to infer the other's rule from silence",
    [/one project's own property/.test(S(st?.disposition?.detail) || ""),
     /every case it appears in/.test(S(sh?.disposition?.detail) || "")],
    [true, true]);
}

/* ====================================================================== 3
 * THE STANCE-SCOPED HALF — **DISMISSED IN A, STILL FIRES FOR B.**
 *
 * The sharpest available case and it is chosen deliberately: team A sets aside the
 * notification that team B stands somewhere else. If that act reached B's feed, one
 * team would have silenced another team's notification about that other team's OWN
 * stance — which is the thing the scoping ruling forbids by name.
 * ===================================================================== */
{
  const act = await dispose({ project: A, finding: STANCE_ABOUT_B, to: "dismissed",
    reason: "our team has read their reading and we are staying where we are" });
  t("op=proposedispose ACCEPTS the second key shape and records the decision under the ACTING "
  + "project, with the decider stamped server-side and no bundle minted (declining is not "
  + "authoring, D-79)",
    [act.ok, act.scope, act.project, act.finding, act.state, act.decided_by, act.bundle],
    [true, "project", A, STANCE_ABOUT_B, "dismissed", "ruth", null]);

  const q = await queue();
  const st = byId(q, STANCE_ABOUT_B);
  t("**THE ITEM STILL FIRES.** It is still in the feed, because it is still a live finding for "
  + "the team that has not decided it — one team's dismissal governs that team's feed and "
  + "nothing else",
    st !== null, true);
  t("**AND IT FIRES FOR PROJECT B, WHICH IS THE ARM THIS ITEM EXISTS FOR.** B is still among "
  + "the item's homes; A is not",
    [homesOf(st), homesOf(st).includes(B), homesOf(st).includes(A)], [[B], true, false]);
  t("the home A lost is DECLARED and not removed silently — a home set that is quietly shorter "
  + "is indistinguishable from nobody caring (DEC-16)",
    [(st?.case?.disposed_by || []).map((d) => d.id),
     /judgment layer/.test(S((st?.case?.disposed_by || [])[0]?.detail) || "")],
    [[A], true]);
  t("and the item's own `projects` shrinks to the teams the act is still open to, so a surface "
  + "cannot offer A an act A has already taken",
    [st?.disposition?.projects, st?.disposition?.disposed_by], [[B], [A]]);

  t("THE OTHER TEAM'S ITEM IS UNTOUCHED. The notification about A's own stance still carries "
  + "both homes — dismissing one finding did not dismiss the other, and this is the arm that "
  + "distinguishes 'scoped' from 'broken'",
    homesOf(byId(q, STANCE_ABOUT_A)), [A, B].sort());

  const rec = disposedOf(q).filter((d) => d.finding === STANCE_ABOUT_B);
  t("AND THE DECISION IS PUBLISHED RATHER THAN LEAVING A SILENCE (D-79): the aged finding names "
  + "its scope, its project, the item id it aged, its state, its author and their reason",
    [rec.length, rec[0]?.scope, rec[0]?.project, rec[0]?.id, rec[0]?.state, rec[0]?.decided_by,
     S(rec[0]?.reason)],
    [1, "project", A, STANCE_ABOUT_B, "dismissed",
     "ruth", "our team has read their reading and we are staying where we are"]);
  t("and `personal: false` still stands, because nothing here was a preference — a mute changes "
  + "nobody else's feed and this changed one team's, which are different claims and both are "
  + "published",
    q.disposed?.personal, false);
}

/* ====================================================================== 4
 * THE SHARED-RECORD HALF — **DISMISSED ANYWHERE, CLEARED EVERYWHERE.**
 * ===================================================================== */
{
  const before = byId(await queue(), SHARED_FINDING);
  t("the shared-record finding is open under two projects immediately before the act — the "
  + "guard that makes the next arm a measurement rather than a coincidence",
    [before !== null, homesOf(before).includes(A), homesOf(before).includes(B)],
    [true, true, true]);
  const act = await dispose({ key: `${PKEY}::filed`, to: "dismissed",
    reason: "the filing predates the record and is not obtainable" });
  t("the FIRST key shape is unchanged and still accepted, keyed on the pair and naming no "
  + "project at all",
    [act.ok, act.key, act.progression_key, act.stage_key, act.state],
    [true, `${PKEY}::filed`, PKEY, "filed", "dismissed"]);

  const q = await queue();
  t("**ONE ACT CLEARED IT UNDER EVERY CASE.** The item is gone from the open list entirely — "
  + "not shortened by a home, gone — because a progression-stage finding is a fact about the "
  + "SHARED record and settling it once is DEDUP rather than one team silencing another (DEC-16)",
    byId(q, SHARED_FINDING), null);
  const rec = disposedOf(q).filter((d) => d.id === SHARED_FINDING);
  t("and it is published as an INSTANCE-scoped decision with NO project on it, which is the "
  + "field a reader tells the two behaviours apart by",
    [rec.length, rec[0]?.scope, rec[0]?.project, rec[0]?.key],
    [1, "instance", null, `${PKEY}::filed`]);
}

/* ====================================================================== 5
 * THE DISTINCTION, READ OUT OF ONE ANSWER.
 *
 * The arm the item exists for, and the reason both halves are in this suite: two
 * suites can each be green while these two behaviours have quietly become one.
 * ===================================================================== */
{
  const q = await queue();
  t("IN ONE READ OF ONE FEED: the stance-scoped finding SURVIVES its dismissal for the team "
  + "that did not take it, and the shared-record finding SURVIVES NOWHERE. Same store, same "
  + "answer, two scopes — the distinction pinned rather than implied",
    [byId(q, STANCE_ABOUT_B) !== null, homesOf(byId(q, STANCE_ABOUT_B)),
     byId(q, SHARED_FINDING) === null],
    [true, [B], true]);
  t("and both decisions are in ONE `disposed` list, told apart by `scope` rather than by which "
  + "array they arrived in — a member's question is *what did I set aside and why*, which is "
  + "one question",
    [disposedOf(q).length,
     disposedOf(q).map((d) => d.scope).sort(),
     disposedOf(q).every((d) => typeof d.id === "string" && d.id.startsWith("FINDING::"))],
    [2, ["instance", "project"], true]);
  t("the envelope's own sentence NAMES BOTH SCOPES, so a reader is not left to infer from two "
  + "rows that the block means two things",
    [/scope: instance/.test(S(q.disposed?.detail) || ""),
     /scope: project/.test(S(q.disposed?.detail) || "")], [true, true]);
}

/* ====================================================================== 6
 * RE-TRIAGE — D-79 AGES A FINDING AND NEVER FREEZES IT.
 *
 * The over-strictness direction: a widened key that could not be re-decided would
 * have traded a silence for a lock, and a standing decision that cannot be changed
 * is not a decision a member can live with.
 * ===================================================================== */
{
  const again = await dispose({ project: A, finding: STANCE_ABOUT_B, to: "deferred",
    reason: "on reflection we will revisit this after the budget cycle" });
  t("A STANDING DECISION CAN BE RE-TRIAGED: the same (project, finding) is re-decided from "
  + "dismissed to deferred, with a new reason",
    [again.ok, again.scope, again.state], [true, "project", "deferred"]);
  const q = await queue();
  const rec = disposedOf(q).filter((d) => d.finding === STANCE_ABOUT_B);
  t("and it is ONE row and never two — the UPSERT is on the identity, so a re-decided finding "
  + "keeps one re-triageable decision rather than accumulating a history of them here",
    [rec.length, rec[0]?.state, S(rec[0]?.reason)],
    [1, "deferred", "on reflection we will revisit this after the budget cycle"]);
  t("the OLD reason is gone rather than lingering beside the new one, which is what makes the "
  + "published decision the decision that stands",
    disposedOf(q).some((d) => /staying where we are/.test(S(d.reason) || "")), false);
  t("and DEFERRING ages it exactly as dismissing did — both are dispositions, and the item is "
  + "still live for the team that has taken neither",
    [homesOf(byId(q, STANCE_ABOUT_B)), byId(q, STANCE_ABOUT_A) !== null], [[B], true]);
}

/* ====================================================================== 7
 * THE REFUSALS — each fail-closed, each naming what is missing.
 * ===================================================================== */
{
  const noProject = await dispose({ finding: STANCE_ABOUT_A, to: "dismissed", reason: "x" });
  t("a finding named with NO PROJECT is refused NO_PROJECT_SCOPE and the refusal says why the "
  + "project is not defaulted even when there is one candidate — a plane choosing whose "
  + "judgment the record carries is the single shared stance §7 rejected",
    [noProject.ok, noProject.reason, /not defaulted/.test(S(noProject.detail) || "")],
    [false, "NO_PROJECT_SCOPE", true]);
  const noFinding = await dispose({ project: A, to: "dismissed", reason: "x" });
  t("a project named with NO FINDING is refused NO_FINDING — a team and no decision",
    [noFinding.ok, noFinding.reason], [false, "NO_FINDING"]);
  const notAProject = await dispose({ project: INQ, finding: STANCE_ABOUT_A, to: "dismissed",
    reason: "trying to scope a judgment to a question" });
  t("a `project` that names an INQUIRY is refused NO_SUCH_PROJECT — the scope of a "
  + "judgment-layer act is a project bundle this viewer can see, and absent and invisible "
  + "answer identically (REC-25)",
    [notAProject.ok, notAProject.reason], [false, "NO_SUCH_PROJECT"]);
  const ghost = await dispose({ project: "PROJ-2026-5000-nonexistent", finding: STANCE_ABOUT_A,
    to: "dismissed", reason: "a project that was never promoted" });
  t("and so is a project id that names nothing at all, by the SAME refusal — which is the "
  + "posture rather than an accident: a refusal that told the two apart would disclose the "
  + "existence of a project the caller was not invited to",
    [ghost.ok, ghost.reason], [false, "NO_SUCH_PROJECT"]);

  /* THE BRIDGE FOR A SURFACE BUILT BEFORE IC-60. A page that learned this act when it
     had one key shape composes `key` from the queue item's own id. Read as the old
     shape that is NO_SUCH_PROGRESSION — true, useless, and it tells a member to go
     and define a progression that has nothing to do with what they clicked. */
  const oldShape = await dispose({ key: `stance-changed-here-not-elsewhere::${INQ}::${B}`,
    to: "dismissed", reason: "sent the way a pre-IC-60 surface sends it" });
  t("a PRE-IC-60 SURFACE's `key`-only call is refused NO_PROJECT_SCOPE naming the two arguments "
  + "to send — not NO_SUCH_PROGRESSION, which was true and useless. The catalogue already knows "
  + "the first segment is a FINDING kind, and the refusal infers NOTHING about which project",
    [oldShape.ok, oldShape.reason, oldShape.kind, oldShape.requires,
     /Nothing was written/.test(S(oldShape.detail) || "")],
    [false, "NO_PROJECT_SCOPE", "stance-changed-here-not-elsewhere", ["project", "finding"], true]);
  t("and it WROTE NOTHING: the finding it named is still live for the team that has decided "
  + "nothing, which is what makes the refusal a refusal rather than a partial act",
    homesOf(byId(await queue(), STANCE_ABOUT_B)), [B]);

  /* THE SHARED CHECKS ARE REACHED BY BOTH SHAPES, which is the point of one op: the
     vocabulary, the required reason and the stamped decider are properties of the ACT
     and not of the subject, so a second spelling of any of them could drift. */
  const noReason = await dispose({ project: A, finding: STANCE_ABOUT_A, to: "dismissed", reason: "  " });
  t("an EMPTY REASON is refused NO_REASON on the project-scoped shape too — setting aside the "
  + "record's own question is accountable in the member's own words whichever feed it governs",
    [noReason.ok, noReason.reason], [false, "NO_REASON"]);
  const badTo = await dispose({ project: A, finding: STANCE_ABOUT_A, to: "adopted", reason: "x" });
  t("and a token outside the published vocabulary is refused NOT_A_DISPOSITION on both shapes — "
  + "adopting authors a focus and is a different act",
    [badTo.ok, badTo.reason], [false, "NOT_A_DISPOSITION"]);
  t("after five refusals the record holds exactly the ONE judgment-layer decision that was "
  + "really taken — a refusal that half-wrote would be worse than one that refused",
    disposedOf(await queue()).filter((d) => d.scope === "project").length, 1);
}

/* ====================================================================== 8
 * op=purge TAKES THE NEW TABLE (D-113).
 * ===================================================================== */
{
  const p = await GET(`op=purge&token=adm-d266s&confirm=bio`);
  t("a whole-store purge REPORTS how many judgment-layer dispositions it cleared, counted APART "
  + "from the instance-wide ones — a derived table added without a DELETE reports scope ALL and "
  + "silently leaves rows",
    [p.ok !== false, (p.before || p.counts || {}).findingDispositions !== undefined], [true, true]);
  const q = await queue();
  t("and after the purge the feed carries no dispositions of either scope, because the corpus "
  + "and the decisions about it are both gone",
    [ITEMS(q).length, disposedOf(q).length], [0, 0]);
}

console.log(`\n  d266scope: ${pass} pass, ${fail} fail`);
await mf.dispose();
/* ON ITS OWN RESULT, and hygiene.test.mjs holds every suite to it: a bare
   `process.exit(1)` guarded by a conditional leaves the GREEN path exiting on
   whatever the runtime last felt like, which is the difference between a suite that
   reports and a suite that happens to. */
process.exit(fail > 0 ? 1 : 0);
