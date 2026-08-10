/* NEGATIVE CONTROL: (run 2026-08-03, rec20-agent) key the item's state on the (member, case) ENTRY instead of on the EVENT — in src/store.mjs queueFeed's OBLIGATION loop, replace `if (!this.#queueEventLive(row)) continue;` with `if (!this.#queueEventLive(row)) { if (homes.ancestors.length <= 1) continue; homes.ancestors.shift(); }` (a resolution clears only the home it was made under, which is exactly what a queue_state row keyed by (member, case) would do) -> the once-resolved obligation comes back as a STALE UNRESOLVED COPY under its remaining ancestors and 4 assertions fail: it is still in dave's feed (the home he acted under), still in carol's under the project only she can see, still in the administrator's, and the obligation count never drops. Restored, 35 pass. */
/* REC-20 / DEC-16: op=queue — ONE feed, ONE contract, and the EVENT as the
 * unit of state.
 *
 * WHAT THIS CLOSES. D-140 and SB-CORE GAP-Q1/GAP-Q3: a member had two surfaces
 * (op=tasks and op=proposals), no single contract over them, and no answer to
 * "which case does this belong to". This op returns OBLIGATION items (from
 * `tasks`) and FINDING items (from the proposals derivation) in one shape —
 * {id, class, kind, case, summary, detail, basis, age, assignee, options[]} —
 * with options[] read from REC-19's derivation and never from a surface.
 *
 * THE RULING UNDER TEST (DEC-16, Bob 2026-08-02, answering his own DEC-10):
 * `case` is populated with EVERY ANCESTOR over a bounded walk of the basis and
 * citation edges, and **the unit of state is the EVENT, not the (member, case)
 * entry — one state, N homes.** So one resolution clears the item under every
 * ancestor, and an event appearing under several cases does NOT create several
 * entries: DEC-10's one-standing-entry-per-(member, case) survives intact.
 *
 * WHAT THIS SUITE HOLDS THE PLANE TO (the accepts-when, clause by clause):
 *   - ONE feed carrying an OBLIGATION from `tasks` AND an aggregated FINDING
 *     from `proposalsFeed`, each with its `class` (never null on the producer)
 *     and its `options[]`;
 *   - options[] is REC-19's derivation and not a copy: asserted BYTE-EQUAL to
 *     op=affordances' own answer for the same subject and the same viewer;
 *   - `case` holds EVERY ancestor for a nested item — the DEC-16 worked
 *     example, INFO-88 <- INQ-2 <- INQ-1, all three under a project;
 *   - an over-depth walk reports the ancestor set `undetermined` naming the
 *     bound, rather than notifying a silently truncated set;
 *   - resolving the event ONCE clears it from every entry and from every
 *     member's feed (the negative control above is this clause's inverse);
 *   - an uninvited member's queue names NO invisible project ancestor — not by
 *     id, not anywhere in the answer's bytes — and says `undetermined` rather
 *     than being silently shorter (D-15 §7.9 through REC-25's one predicate);
 *   - an item nothing rests on sits UNGROUPED and is never given an invented
 *     home;
 *   - CONDITION is DECLARED deferred (HOLE-1) and never stubbed into the feed.
 *
 * Driven entirely through the CONTROL PLANE with real member sessions, because
 * that is the only route a caller has and because `member` and `viewer` are
 * both server-side stamps: a store-level test could not exercise either.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* The automatic drain is pushed far out so the manual drains below are never
     raced by the alarm — task-fence.test.mjs's precedent. */
  bindings: { ADMIN_TOKEN: "adm-rec20", MEMBER_TOKEN: "mem-rec20", PROBE_TOKEN: "prb-rec20",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GETRAW = async (q) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`);
  return { status: r.status, body: await r.json() };
};

/* THE op under test, reached by a member session THROUGH the control plane. The
   literal `op=queue` is written out (not interpolated) so scripts/coverage.mjs
   credits the op as reached — D-43: a store-level test is not evidence that a
   caller can get there. */
const queueOf = async (tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=queue&token=${tok}`)).json());
const affordancesOf = async (tok, target) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=affordances&token=${tok}&target=${encodeURIComponent(target)}`)).json());

const NOW = "2026-07-31T12:00:00Z";
const MACHINE = "mem-rec20";

/* ------------------------------------------------------------- documents */

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

/* An inquiry, with its basis legs AND the references[] they must also appear in
   (C-6.3: refs and inquiry_basis may not disagree). basis.test.mjs's shape. */
const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
/* CORRECTED 2026-08-04 (REC-18), never exempted. These legs were written when
   `grade_source: resolution` was a LABEL a fixture could pick; REC-18 makes it
   an EARNED value — the strongest resolution of the target's captures to the
   inquiry's SUBJECT ENTITY — so a leg claiming it on a question that names no
   subject is now refused at the write, and correctly: the old fixture asserted
   a provenance for its grade that nothing in the store supported. The GRADE is
   unchanged at B because what this suite tests is the queue, not the ladder.
   `hunch` is the honest name for an authored connection grade and is the only
   authored source permitted above D (DEC-15), so it carries the same B with the
   author and date a hunch must announce itself by. */
const legLines = (targets) => targets.length
  ? ["basis:", ...targets.flatMap((x) => [`  - target: ${x}`, "    role: supports",
      "    grade: B", "    grade_axis: connection", "    grade_source: hunch",
      "    author: suite", "    date: 2026-08-04"])]
  : [];
const inquiryMd = (id, question, legs) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(legs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${NOW} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const projectMd = (id, cites) => ["---",
  `id: ${id}`, "object_type: project", "schema: project@1",
  `title: "Sewer Fund"`, "current_state: forming", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(cites), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "The sewer fund investigation.", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

const promote = async (id, text, type, state, tok = MACHINE, register = []) => {
  const r = await POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "rec20-suite",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: state, created: NOW, last_updated: NOW } });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  return r;
};

try {

/* ============================ phase 0 · the corpus, BEFORE any member exists
   Task routing falls back to `unassigned` only when there is no project
   manager AND no active administrator (#routeTask's last arm). Building the
   tasks first is what makes them CLAIMABLE — D-98 keeps an unassigned task
   routable by hand, DEC-7 keeps it claimable rather than stranded — which is
   what lets three different members read the SAME event below and compare
   what each is allowed to see of its homes. */

const stub = await mf.getDurableObjectNamespace("STORE");
const obj = stub.get(stub.idFromName("bio"));
const doPost = async (op, body) => (await obj.fetch(`http://x/${op}`,
  { method: "POST", body: JSON.stringify(body) })).json();

const INFO88 = "INFO-2026-0088-controller-memo";
const INFO_DEEP = "INFO-2026-0200-deep-subject";
const INFO_LONE = "INFO-2026-0300-lonely-subject";

let capSeq = 0;
const makeTask = async (bundleId) => {
  const cap = (++capSeq).toString(16).padStart(64, "0");
  await doPost("taskenqueue", { kind: "authority-undetermined", captureSha: cap,
    subject: "https://www.oaklandca.gov/documents/agenda.pdf", at: NOW });
  const text = infoMd(bundleId);
  await promote(bundleId, text, "information", "collected", MACHINE,
    [{ sha256: cap, path: "snapshots/agenda.pdf", encoding: "binary", bytes: 10 }]);
  const d = await POST(`op=taskdrain&token=${MACHINE}`, { actor: "consumer", now: NOW });
  const made = (d.created || []).find((c) => c.refers_to === bundleId);
  if (!made) throw new Error(`drain created no task for ${bundleId}: ${JSON.stringify(d)}`);
  return made;
};

console.log("\n--- fixture: three unassigned obligations, on three subjects ---");
const t88 = await makeTask(INFO88);
const tDeep = await makeTask(INFO_DEEP);
const tLone = await makeTask(INFO_LONE);
t("all three tasks routed honestly UNASSIGNED (no PM, no admin at routing time), so all are claimable",
  [t88.assignee, tDeep.assignee, tLone.assignee], ["unassigned", "unassigned", "unassigned"]);

/* DEC-16's own worked example: INQ-1 "Was the sewer fund misused?" rests on
   INQ-2 "Was the $2.1m transfer authorised?", which rests on INFO-88, the
   controller memo. All three end up under the Sewer Fund project. */
const INQ2 = "INQ-2026-0002-transfer-authorised";
const INQ1 = "INQ-2026-0001-sewer-fund-misused";
await promote(INQ2, inquiryMd(INQ2, "Was the $2.1m transfer authorised?", [INFO88]), "inquiry", "open");
await promote(INQ1, inquiryMd(INQ1, "Was the sewer fund misused?", [INQ2]), "inquiry", "open");

/* The over-depth chain: seven inquiries stacked on INFO_DEEP, one more than
   the bound, so the walk stops with a genuinely unvisited ancestor above it. */
const DEEP = [];
for (let i = 1; i <= 7; i++) {
  const id = `INQ-2026-02${String(i).padStart(2, "0")}-deep-${i}`;
  await promote(id, inquiryMd(id, `Deep question ${i}?`, [i === 1 ? INFO_DEEP : DEEP[i - 2]]),
    "inquiry", "open");
  DEEP.push(id);
}

/* ---- the FINDING half: one progression with a real gap (REC-6's fixture
   shape, minimised to the two stages the gap needs), plus an inquiry resting
   on the document that IS placed, so the finding has a home too. ---- */
console.log("\n--- fixture: one aggregated FINDING with a real gap ---");
const prog = await POST(`op=progressiondefine&token=${MACHINE}`, {
  progressionKey: "procurement", label: "Procurement",
  stages: [
    { key: "solicitation", label: "RFP / RFQ / IFB", cardinality: "0..1", required: "usually" },
    { key: "award", label: "council resolution", after: "solicitation", cardinality: "1", required: "always" },
  ] });
t("the procurement progression is defined with two stages", [prog.ok, prog.stage_count], [true, 2]);

const ent = await POST(`op=entitycreate&token=${MACHINE}`,
  { kind: "contract", label: "Gap Contract A", aliases: ["contract:C-A"] });
const AWARD_DOC = "INFO-2026-0400-award-resolution";
const awardSha = sha("rec20-award");
{
  const md = infoMd(AWARD_DOC);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: awardSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
               entities: [{ ref: "contract:C-A", kind: "contract", key: "C-A", label: "Gap Contract A" }] } }] });
  const r = await POST(`op=promote&token=${MACHINE}`, {
    bundleId: AWARD_DOC, base: null, snapKey: `${AWARD_DOC}-new`, author: "rec20-suite",
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [],
    meta: { object_type: "information", group: "believe-in-oakland", title: "Award resolution",
            current_state: "collected", created: NOW, last_updated: NOW } });
  if (!r || r.ok === false) throw new Error(`promote ${AWARD_DOC}: ${JSON.stringify(r)}`);
}
await POST(`op=resolve&token=${MACHINE}`, { captureSha: awardSha });
const thr = await POST(`op=thread&token=${MACHINE}`, {
  progressionKey: "procurement", entityId: ent.entity_id,
  placements: [{ stage: "award", captureSha: awardSha }] });
t("threading only the award fires ONE missing_predecessor finding on solicitation",
  [(thr.findings || []).length, (thr.findings || [])[0]?.stage_key], [1, "solicitation"]);

const INQ_F = "INQ-2026-0400-award-question";
await promote(INQ_F, inquiryMd(INQ_F, "Was the award competitively bid?", [AWARD_DOC]), "inquiry", "open");

/* ============================ phase 1 · the roster
   4.2/4.3: the first two members must be administrators. carol OWNS the
   project (her session creates it, so the control plane stamps her as owner);
   dave is the uninvited member the visibility clause is about. */
const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=adm-rec20`,
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const ruth = await member("ruth", ["contribute"], "admin");
await member("gus", ["contribute"], "admin");
const carol = await member("carol", ["contribute", "create_projects"]);
const dave = await member("dave", ["contribute"]);

/* ============================ phase 2 · the project, owned by carol */
const PROJ = "PROJ-2026-0001-sewer-fund";
await promote(PROJ, projectMd(PROJ, [INFO88]), "project", "forming", carol);

/* ================================================== the assertions ======= */

console.log("\n--- ONE feed, ONE contract: an OBLIGATION and an aggregated FINDING together ---");
const qc = await queueOf(carol);
t("op=queue answers ok for a member session, through the control plane", qc.ok, true);
const byId = new Map(qc.items.map((i) => [i.id, i]));
const ob = byId.get(t88.id);
const find = qc.items.find((i) => i.class === "FINDING");
t("the feed carries BOTH classes at once — an OBLIGATION from tasks and a FINDING from proposalsFeed",
  [qc.counts.obligation >= 3, qc.counts.finding, !!ob, !!find], [true, 1, true, true]);
t("every item carries a class, and it is one the producer declares (class NOT NULL on the producer)",
  qc.items.filter((i) => !qc.classes.includes(i.class)).map((i) => i.id), []);
t("the ONE contract shape is on BOTH classes, key for key",
  [["id", "class", "kind", "case", "summary", "detail", "basis", "age", "assignee", "options"]
     .filter((k) => !(k in ob)),
   ["id", "class", "kind", "case", "summary", "detail", "basis", "age", "assignee", "options"]
     .filter((k) => !(k in find))], [[], []]);
/* CORRECTED 2026-08-04 (REC-32). The old assertion was
     `[Object.keys(qc.classes_deferred), items.some(CONDITION)] === [["CONDITION"], false]`
   and it was RIGHT when REC-20 landed: the class had no producer (HOLE-1), so
   it was declared absent rather than stubbed. REC-32 built three generators —
   governor-holding-host, partial-capture-outstanding, capture-completed-unattended
   — so `classes_deferred` is now EMPTY and asserting it still names CONDITION
   would be pinning a deferral that no longer exists. What survives unchanged is
   the rule the old pin was really defending: this producer emits no CONDITION
   item it has no fact for. THIS corpus holds none of the three facts — no host
   is in cool-off, no capture session is parked, and no document was authored by
   a person and then revised by a machine — so the honest count here is zero,
   and it is zero because there is nothing to say rather than because the class
   does not exist. queue-conditions.test.mjs builds the facts and holds the
   other side. */
t("CONDITION is a DECLARED class now (REC-32) and nothing is deferred any more",
  [qc.classes, Object.keys(qc.classes_deferred)],
  [["OBLIGATION", "FINDING", "CONDITION"], []]);
t("and this corpus holds none of the three facts, so the feed emits none — absent, never stubbed",
  [qc.items.some((i) => i.class === "CONDITION"), qc.counts.condition], [false, 0]);
t("refers_to points at the SUBJECT and `case` is a different column — the two are never collapsed",
  [ob.subject.id, ob.basis.refers_to, ob.case.ancestors.some((a) => a.id === INFO88)],
  [INFO88, INFO88, false]);

console.log("\n--- options[] come from REC-19's derivation, never from a copy ---");
const aff88 = await affordancesOf(carol, INFO88);
t("the OBLIGATION's options[] are BYTE-EQUAL to op=affordances' own answer for the same subject and viewer",
  ob.options, aff88.acts);
/* `sever` is present because the project holds a LIVE cites edge into this
   memo — the derivation reading the record's real edges, not a fixed list. */
t("and they are not empty — the derived acts carry their capability, mode and declared rung",
  [ob.options.map((o) => o.id), ob.options.find((o) => o.id === "release")?.needs,
   ob.options.find((o) => o.id === "release")?.rung],
  [["release", "cite", "sever"], "contribute", "reasoned"]);
const affAward = await affordancesOf(carol, AWARD_DOC);
t("the FINDING's options[] are the SAME derivation over its subject document",
  find.options, affAward.acts);

console.log("\n--- DEC-16: `case` holds EVERY ancestor, not the nearest one ---");
t("the nested obligation names INQ-2, INQ-1 AND the project — every ancestor, one item, one state",
  ob.case.ancestors.map((a) => a.id), [INQ1, INQ2, PROJ].sort());
t("the set is DETERMINED, not ungrouped, and reports no reason to doubt it",
  [ob.case.state, ob.case.ungrouped, ob.case.reasons], ["determined", false, []]);
t("each ancestor carries the depth it was reached at, so nearest-vs-every is visible rather than lost",
  [ob.case.ancestors.find((a) => a.id === INQ2).depth,
   ob.case.ancestors.find((a) => a.id === INQ1).depth,
   ob.case.ancestors.find((a) => a.id === PROJ).depth], [1, 2, 1]);
t("an ancestor's type and state are read through the catalog (MAP RULE), and `terminal` is three-valued",
  [ob.case.ancestors.find((a) => a.id === INQ2).type,
   ob.case.ancestors.find((a) => a.id === INQ2).state,
   ob.case.ancestors.find((a) => a.id === INQ2).terminal,
   ob.case.ancestors.find((a) => a.id === PROJ).type], ["inquiry", "open", false, "project"]);
t("ONE event, N homes: three ancestors produce ONE entry, not three (DEC-10's one standing entry survives)",
  qc.items.filter((i) => i.id === t88.id).length, 1);
t("the FINDING is grouped too — it names the inquiry that rests on the placed document",
  [find.case.state, find.case.ancestors.map((a) => a.id)], ["determined", [INQ_F]]);

console.log("\n--- an item nothing rests on sits UNGROUPED, never given an invented home ---");
const lone = byId.get(tLone.id);
t("the lonely obligation is UNGROUPED: an empty set, determined, with no invented case",
  [lone.case.ancestors, lone.case.state, lone.case.ungrouped, lone.case.reasons],
  [[], "determined", true, []]);

console.log("\n--- R3's depth bound: an exhausted walk says UNDETERMINED, it does not truncate ---");
const deep = byId.get(tDeep.id);
t("the over-depth walk reports the ancestor set UNDETERMINED, naming the bound it exhausted",
  [deep.case.state, deep.case.reasons, deep.case.depth_bound, qc.ancestor_depth_bound],
  ["undetermined", ["depth_bound"], 6, 6]);
t("it reports the six it DID reach and does not silently include the seventh",
  [deep.case.ancestors.map((a) => a.id), deep.case.ancestors.some((a) => a.id === DEEP[6])],
  [DEEP.slice(0, 6).sort(), false]);
t("and the bound is EXACT, not eager: a two-deep chain that ends is DETERMINED, not undetermined",
  ob.case.state, "determined");

console.log("\n--- the D-15 viewer gate: an uninvited member's queue names no invisible ancestor ---");
const qd = await queueOf(dave);
const obD = qd.items.find((i) => i.id === t88.id);
t("dave gets the same event — an unassigned obligation stays claimable (D-98/DEC-7)", !!obD, true);
t("dave's homes name the two inquiries and NOT the project he was never invited to",
  obD.case.ancestors.map((a) => a.id), [INQ1, INQ2]);
t("and the set is UNDETERMINED with the reason, rather than silently shorter (DEC-16's truncation rule)",
  [obD.case.state, obD.case.reasons], ["undetermined", ["out_of_view"]]);
t("the project's id appears NOWHERE in dave's answer — not in a case, a title, a count or a message",
  JSON.stringify(qd).includes(PROJ), false);
t("no COUNT of what was withheld is reported either — the count is the leak",
  [obD.case.ancestors.length, "withheld" in obD.case, "hidden" in obD.case], [2, false, false]);
const qr = await queueOf(ruth);
const obR = qr.items.find((i) => i.id === t88.id);
t("an administrator sees the project ancestor (7.3), so the difference is the VIEWER and not the item",
  [obR.case.state, obR.case.ancestors.map((a) => a.id)], ["determined", [INQ1, INQ2, PROJ].sort()]);

console.log("\n--- DEC-16: the EVENT is the unit of state — one resolution clears every home ---");
const res = await POST(`op=taskresolve&token=${dave}`, { id: t88.id, note: "checked; the memo is unchanged" });
t("dave resolves the claimable obligation ONCE, attributed", [res.ok, res.status], [true, "resolved"]);
const qc2 = await queueOf(carol), qd2 = await queueOf(dave), qr2 = await queueOf(ruth);
t("it is gone from dave's queue — the home he acted under",
  qd2.items.some((i) => i.id === t88.id), false);
t("it is gone from CAROL's queue too, under the project ancestor she alone could see",
  qc2.items.some((i) => i.id === t88.id), false);
t("and from the administrator's, under every ancestor at once — no stale unresolved copy anywhere",
  qr2.items.some((i) => i.id === t88.id), false);
t("nothing else moved: the other two obligations and the finding are untouched",
  [qc2.counts.obligation, qc2.counts.finding], [qc.counts.obligation - 1, 1]);

console.log("\n--- the op is a READ, and it is fenced like one ---");
const anon = await GETRAW("op=queue");
t("an unauthenticated caller gets nothing and is told so, rather than reading the group's work",
  [anon.status, anon.body.ok ?? false], [401, false]);
t("the feed REPORTS and never mutates: reading it twice returns the same items",
  (await queueOf(carol)).items.map((i) => i.id), qc2.items.map((i) => i.id));

} catch (e) {
  console.log(`  FAIL  suite threw: ${e && e.stack ? e.stack : e}`);
  fail++;
}

await mf.dispose();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
