/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/severedhomes.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (PL-13's `current.control.mjs`, PL-15's `leadslug.control.mjs` precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. Every arm is armed ALONE with every other defence held OPEN, every restore is verified BY sha256 AND BY CONTENT (`cmp`) against a per-arm pristine copy named with the ARM ID as well as the path, and every arm DECLARES before it runs what MUST fail and what MUST NOT.
   (A) THE CITES HALF. In src/store.mjs #queueAncestorEdges, return the `cites` candidates WITHOUT confirming them — `consider(r.bundle_id, "cites")` becomes `up.set(r.bundle_id, true)` -> the walk is D-267's original defect again on the citation edge alone. MUST FAIL: §2's severed-project arm, §2's ungrouped arm, and current.test.mjs's three corrected pins. MUST NOT FAIL: §3's basis arms, and every over-strictness arm in §4 — which is the point of arming the halves apart, because one confirmation covering for the other is exactly how a half-fix reads as a whole one. **THIS ARM CAME BACK WRONG ON ITS FIRST RUN AND THE FIXTURE WAS CORRECTED, NOT THE DECLARATION:** §3's inquiries referenced their subject as `cites`, so they were candidates on BOTH edges and this arm re-admitted them through the citation half. They now reference it as `relates_to` (legal — C-6.3 reads the target, not the relation) and reach their subject through `inquiry_basis` ALONE, which is what makes (A) and (B) separable at all.
   (B) THE BASIS HALF, and it is the one nothing had named before this item. Same method, `consider(r.bundle_id, null)` becomes `up.set(r.bundle_id, true)` -> an inquiry that WITHDREW the reference under its basis leg is a home again. MUST FAIL: §3's severed-inquiry arm and §3's ungrouped arm. MUST NOT FAIL: §2, and none of PL-13's pins, because `refs kind='cites'` is still confirmed — the arm that proves the basis half is doing its own work rather than inheriting the citation half's answer.
   (C) THE PREDICATE'S CONSERVATIVE ARM — AN UNRECOGNISED VALUE IS NOT A WITHDRAWAL. In #refEdgeSevered, compare `String(entry.status ?? "").trim().toLowerCase()` instead of the raw value -> `Severed` and `severed ` become withdrawals. This is the plausible, well-meant version of the predicate and the one that widens a refusal into shapes the catalog never wrote. MUST FAIL: §4's over-strictness arm. MUST NOT FAIL: §2 and §3, so the arm measures the fixtures rather than the walk.
   (C2) SEVERANCE NARROWING ON ABSENCE. `return !entry || entry.status === "severed"` -> a target with no matching reference entry reads as a WITHDRAWAL. DECLARED RED, MEASURED GREEN, REDECLARED AND KEPT: both projections are written from `references[]` in ONE transaction, so a candidate edge always has a matching entry and this branch is unreachable through the ops. It is defensive rather than load-bearing today — and it earns its place because the `links_to` link projector is a SECOND writer of `refs` that inserts rows with no frontmatter entry behind them.
   (D) THE PREDICATE'S OTHER CONSERVATIVE ARM — UNREADABLE MUST MEAN LIVE. In #refEdgeSevered, make the unreadable branch `return true` -> a citing document whose bundle.md cannot be read is treated as having withdrawn. MUST FAIL: nothing in THIS suite, because every fixture here has a readable bundle.md — AND THAT IS THE ARM'S RESULT, recorded rather than smoothed: this suite cannot reach the unreadable branch through the op, and says so rather than claiming coverage it does not have. The branch is reached by `retire`'s own suite, which is where the behaviour was a rule before it was this predicate's.
   (E) THE SHARED PREDICATE IS SHARED. In #citesInto, restore the old inline read (`const md = …; const entry = refs.find(…)`) so the method no longer calls #refEdgeSevered -> the rule has two implementations again. MUST FAIL: §5's structural arm, which counts the call sites off the source. MUST NOT FAIL: any behavioural arm, because a faithful copy behaves identically — WHICH IS THE WHOLE POINT. D-267 exists because a rule with four inline implementations grew a fifth reader that did not know the rule existed, and no behavioural arm anywhere could have caught that.
   (F) OVER-STRICTNESS, and these PASS rather than fail: a live citation is a home; a live basis leg is a home; a reference with NO `status:` key at all is a home; a `status:` value the predicate does not recognise is a home and NOT a withdrawal; a target spelled with surrounding whitespace is a home; and a project that severed its citation is STILL REACHABLE by every other op — op=backlinks still names it and still reports the edge as `severed`, because the historical edge is a fact the record keeps. A fence that refuses correct work is a defect in the fence, and a walk that forgot an edge existed is worse than one that kept it.
   (G) BASELINE. Every arm restored, suite re-run, full green — the row that distinguishes six-arms-broken from six-arms-working.
 * ========================================================================= */
/* D-267 — **A WITHDRAWN EDGE IS NOT A STEP**, and the rule is CONSUMED rather
 * than restated.
 *
 * ---- WHAT WAS WRONG, in one sentence the fix has to answer
 *
 * `refs` and `inquiry_basis` are both PROJECTIONS of a document's
 * `references[]`, both written inside `promote`'s transaction, and both carry
 * the RELATION while DROPPING the STATUS. So a project that authored
 * `status: severed` — the recorded decision to stop drawing on a question —
 * keeps its row in each table, and `#queueAncestorEdges`, which read the tables
 * and nothing else, kept it as a HOME for every item filed under that question.
 * PL-13 found it by DRIVING it, pinned it AS THE WALK ANSWERED rather than as it
 * should, and deliberately did not fix it in its own producer.
 *
 * **THE PLANE ALREADY HELD THE OPPOSITE RULE ONE OP OVER**, which is what made
 * this a defect rather than an undecided question: `versionAct` refuses
 * `VERSION_CURRENT_UNRELATED` for exactly that project, reading the project's
 * own frontmatter. The act said a severed project has no stance to move while
 * the feed still routed it that question's notifications.
 *
 * ---- WHERE THE FIX WENT, AND WHY NOT IN THE CONSUMER
 *
 * ONE predicate, `#refEdgeSevered`, consumed by every reader that needs the
 * answer — `#citesInto`, `#restsOnLive`, and now the walk. A producer filtering
 * its own homes would have been a SECOND implementation of the homes rule, which
 * is this repository's most-repeated defect and the shape that has already
 * absorbed a control here. The projection was NOT taught a `status` column: that
 * would change a shape twelve readers and the export manifest build against, for
 * a fact only the document can be authoritative about anyway (D-21).
 *
 * ---- WHAT IS ASSERTED, in the order the blocks run
 *
 *  1. THE FIXTURE IS REAL AND NON-EMPTY — every subject has a live task, every
 *     home set is read through `op=queue` with a real member session, and the
 *     corpus is printed. A headline assertion over an empty corpus is how three
 *     walks in this estate congratulated themselves.
 *  2. THE CITES HALF: a project that severed its citation is NOT a home; the
 *     project that did not is. A document whose ONLY citing project withdrew is
 *     UNGROUPED — a real answer, not a shorter list.
 *  3. THE BASIS HALF, WHICH NOTHING HAD NAMED. `inquiry_basis` drops `status`
 *     identically, so the same blindness sat on the other edge kind. An inquiry
 *     whose reference under its basis leg is severed is not a home either.
 *  4. OVER-STRICTNESS, FOUR WAYS. Severance narrows only on a POSITIVE recorded
 *     withdrawal: no `status:` key is live, an unrecognised `status:` value is
 *     live and NOT a withdrawal, a target spelled with surrounding whitespace is
 *     live, and the whole thing is driven through `op=queue` rather than at the
 *     store.
 *  5. THE EDGE IS NOT FORGOTTEN, ONLY NOT WALKED — `op=backlinks` still names the
 *     withdrawn project and still reports `status: severed`. Dropping a home is
 *     not deleting history, and this is the arm that keeps the two apart. Plus
 *     the STRUCTURAL arm: the predicate has ONE implementation and three callers,
 *     counted off the source, because no behavioural arm can see a faithful copy.
 *
 * ---- WHAT THIS SUITE CANNOT SEE, stated plainly
 *
 *   IT CANNOT reach `#refEdgeSevered`'s UNREADABLE branch through the op: every
 *     bundle it promotes has a readable `bundle.md`, and there is no op that
 *     leaves a bundle row with its document gone. Control arm (D) is declared
 *     against that and is EXPECTED to come back green — recorded as a gap in this
 *     instrument, not as a property of the subject.
 *   IT CANNOT drive `op=sever` onto a project→inquiry edge, because that door
 *     does not exist (REC-72, measured by D-216 and confirmed by PL-13): the
 *     sharing edge and its severance are HAND-AUTHORED into `references[]` and
 *     promoted. Every arm here is about what the plane DOES with a severed edge;
 *     none of them says a member can make one through an act.
 *   IT CANNOT see the OR across edge kinds — a bundle reached by BOTH a basis leg
 *     and a citation where exactly one is withdrawn. The walk keeps such a home
 *     (the confirmations are OR-ed, the conservative direction), but a document
 *     asserting a live basis leg under a severed reference is a C-6.3
 *     disagreement the catalog has its own view about, so this suite does not
 *     manufacture one to assert a behaviour. The OR is stated at the method.
 *   IT CANNOT see a second isolate. One store, one Durable Object.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* The automatic drain is pushed far out so the manual drains below are never
     raced by the alarm — queue.test.mjs's precedent, and task-fence's before it. */
  bindings: { ADMIN_TOKEN: "adm-d267", MEMBER_TOKEN: "mem-d267", PROBE_TOKEN: "prb-d267",
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
/* The literals `op=queue` and `op=backlinks` are written out rather than
   interpolated so scripts/coverage.mjs credits the ops as REACHED — D-43: a
   store-level test is not evidence that a caller can get there, and this whole
   item is about a walk no caller could see going wrong. */
const queueOf = async (tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=queue&token=${tok}&limit=500`)).json());
const backlinksOf = async (tok, target) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=backlinks&token=${tok}&target=${encodeURIComponent(target)}`)).json());

const NOW = "2026-08-09T12:00:00Z";
const MACHINE = "mem-d267";

/* ---------------------------------------------------------------- documents
   `status` is a PARAMETER of the reference line here and never a fixed literal,
   because half of what this suite measures is what the predicate does with a
   status it was not written for. `undefined` emits NO `status:` key at all. */
const refLine = (x) => [`  - target: ${x.target}`, `    rel: ${x.rel ?? "cites"}`,
  ...(x.status === undefined ? [] : [`    status: ${x.status}`])];
const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap(refLine)] : ["references: []"];
const legLines = (targets) => targets.length
  ? ["basis:", ...targets.flatMap((x) => [`  - target: ${x}`, "    role: supports",
      "    grade: B", "    grade_axis: connection", "    grade_source: hunch",
      "    author: suite", "    date: 2026-08-09"])]
  : [];

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

const inquiryMd = (id, question, { refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "", "## Question", "", question, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${NOW} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const projectMd = (id, refs) => ["---",
  `id: ${id}`, "object_type: project", "schema: project@1",
  `title: "Project ${id}"`, "current_state: forming", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A project.", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

const promote = async (id, text, type, state, register = []) => {
  const r = await POST(`op=promote&token=${MACHINE}`, {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "d267-suite",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: state, created: NOW, last_updated: NOW } });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 900)}`);
  return r;
};

try {

/* ====================================================================== 1
 * THE FIXTURE. Tasks FIRST, before any member and before any project, so every
 * obligation routes honestly `unassigned` (#routeTask's last arm) and therefore
 * appears in every feed — which is what lets one credential read the homes of
 * five different subjects. Homes are read at QUEUE time, so the ancestors
 * promoted afterwards are all in view.
 * ===================================================================== */
const stub = await mf.getDurableObjectNamespace("STORE");
const obj = stub.get(stub.idFromName("bio"));
const doPost = async (op, body) => (await obj.fetch(`http://x/${op}`,
  { method: "POST", body: JSON.stringify(body) })).json();

/* The five SUBJECTS, one per question this suite asks. */
const SUBJ_CITES = "INFO-2026-9101-cites-half";
const SUBJ_ONLY_SEVERED = "INFO-2026-9102-only-severed";
const SUBJ_BASIS = "INFO-2026-9103-basis-half";
const SUBJ_BASIS_ONLY_SEVERED = "INFO-2026-9104-basis-only-severed";
const SUBJ_SPELLINGS = "INFO-2026-9105-unanticipated-spellings";
const SUBJECTS = [SUBJ_CITES, SUBJ_ONLY_SEVERED, SUBJ_BASIS, SUBJ_BASIS_ONLY_SEVERED,
                  SUBJ_SPELLINGS];

let capSeq = 0;
const makeTask = async (bundleId) => {
  const cap = `d267${(++capSeq).toString(16)}`.padStart(64, "0");
  await doPost("taskenqueue", { kind: "authority-undetermined", captureSha: cap,
    subject: "https://www.oaklandca.gov/documents/agenda.pdf", at: NOW });
  await promote(bundleId, infoMd(bundleId), "information", "collected",
    [{ sha256: cap, path: "snapshots/agenda.pdf", encoding: "binary", bytes: 10 }]);
  const d = await POST(`op=taskdrain&token=${MACHINE}`, { actor: "consumer", now: NOW });
  const made = (d.created || []).find((c) => c.refers_to === bundleId);
  if (!made) throw new Error(`drain created no task for ${bundleId}: ${JSON.stringify(d).slice(0, 600)}`);
  return made;
};

const TASKS = [];
for (const s of SUBJECTS) TASKS.push(await makeTask(s));
t("FIXTURE GUARD: every subject carries a real, live, UNASSIGNED obligation — five of them, "
+ "and the count is asserted because an assertion over a feed that minted nothing passes for free",
  [TASKS.length, TASKS.every((x) => x.assignee === "unassigned")], [5, true]);

/* ---- the ancestors, one shape per question ------------------------------- */

/* §2 — THE CITES HALF. One project drawing, one withdrawn. */
const P_LIVE = "PROJ-2026-9101-still-drawing";
const P_SEV = "PROJ-2026-9102-withdrawn";
await promote(P_LIVE, projectMd(P_LIVE, [{ target: SUBJ_CITES, status: "confirmed" }]),
  "project", "forming");
await promote(P_SEV, projectMd(P_SEV, [{ target: SUBJ_CITES, status: "severed" },
                                       { target: SUBJ_ONLY_SEVERED, status: "severed" }]),
  "project", "forming");

/* §3 — THE BASIS HALF. Both inquiries carry a basis LEG on their subject; one
   still references it, the other has withdrawn the reference under the leg.
   THE REFERENCE ENTRY IS `relates_to` AND NOT `cites`, AND THE CONTROL HARNESS
   IS WHY. A basis leg must have a `references[]` entry (C-6.3 — the projections
   of one document may not disagree) but the check reads the TARGET and not the
   relation, so the entry can be any legal rel. Written as `cites`, each of these
   inquiries would ALSO be a `refs kind='cites'` candidate, and arming the two
   halves of `#queueAncestorEdges` apart would prove nothing: the citation half
   would re-admit the same inquiry and the basis arm would fail for the other
   half's reason. MEASURED, not reasoned — control arm (A) came back WRONG on its
   first run for exactly this, and the fixture was corrected rather than the
   declaration. With `relates_to` these inquiries reach their subject through
   `inquiry_basis` ALONE. */
const Q_LIVE = "INQ-2026-9101-still-resting";
const Q_SEV = "INQ-2026-9102-withdrawn-leg";
const Q_SEV_ONLY = "INQ-2026-9103-withdrawn-sole";
await promote(Q_LIVE, inquiryMd(Q_LIVE, "Does the memo still carry it?",
  { refs: [{ target: SUBJ_BASIS, rel: "relates_to", status: "confirmed" }], legs: [SUBJ_BASIS] }),
  "inquiry", "open");
await promote(Q_SEV, inquiryMd(Q_SEV, "Did we stop relying on the memo?",
  { refs: [{ target: SUBJ_BASIS, rel: "relates_to", status: "severed" }], legs: [SUBJ_BASIS] }),
  "inquiry", "open");
await promote(Q_SEV_ONLY, inquiryMd(Q_SEV_ONLY, "And the one nobody else rests on?",
  { refs: [{ target: SUBJ_BASIS_ONLY_SEVERED, rel: "relates_to", status: "severed" }],
    legs: [SUBJ_BASIS_ONLY_SEVERED] }), "inquiry", "open");

/* §4 — THE SPELLINGS THIS ITEM DID NOT ANTICIPATE, every one of them LIVE.
     · NO `status:` key at all — the shape most of this corpus's own fixtures use
       before anybody severs anything.
     · `status: Severed` — capitalised. NOT a withdrawal: the predicate compares
       against the one spelling the catalog writes, and a value it does not
       recognise is not evidence of anything.
     · `status: "severed "` — the RIGHT word with trailing whitespace. Still not a
       withdrawal, and deliberately so: the alternative is trimming and
       lower-casing our way into inferring one, which is the direction that costs
       somebody a home they never gave up.
     · A SECOND RELATION on the same target, severed, while the `cites` edge is
       confirmed. Withdrawing a `relates_to` is not withdrawing a citation, and
       this is the arm that proves the predicate's `rel` narrowing is load-bearing
       rather than decorative.
   The fourth shape — a target with SURROUNDING WHITESPACE — is here too, and it
   turned out to measure something else entirely. See its own arm below. */
const P_NOSTATUS = "PROJ-2026-9103-no-status-key";
const P_ODDSTATUS = "PROJ-2026-9104-unrecognised-status";
const P_PADSTATUS = "PROJ-2026-9105-padded-status";
const P_OTHERREL = "PROJ-2026-9106-other-relation-severed";
const P_PADTARGET = "PROJ-2026-9107-padded-target";
await promote(P_NOSTATUS, projectMd(P_NOSTATUS, [{ target: SUBJ_SPELLINGS, status: undefined }]),
  "project", "forming");
await promote(P_ODDSTATUS, projectMd(P_ODDSTATUS, [{ target: SUBJ_SPELLINGS, status: "Severed" }]),
  "project", "forming");
await promote(P_PADSTATUS, projectMd(P_PADSTATUS, [{ target: SUBJ_SPELLINGS, status: '"severed "' }]),
  "project", "forming");
await promote(P_OTHERREL, projectMd(P_OTHERREL,
  [{ target: SUBJ_SPELLINGS, rel: "relates_to", status: "severed" },
   { target: SUBJ_SPELLINGS, rel: "cites", status: "confirmed" }]), "project", "forming");
await promote(P_PADTARGET, projectMd(P_PADTARGET, [{ target: `"${SUBJ_SPELLINGS} "`, status: "confirmed" }]),
  "project", "forming");

/* ------------------------------------------------------------- the reader */
const RUTH = await (async () => {
  const add = await POST(`op=memberadd&token=adm-d267`,
    { memberId: "ruth", cover: "cover for ruth", role: "admin",
      capabilities: ["contribute", "publish"] });
  if (!add.ok) throw new Error(`memberadd: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" });
  if (!en.ok) throw new Error(`enroll: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" });
  if (!lg.token) throw new Error(`login: ${JSON.stringify(lg)}`);
  return lg.token;
})();
/* An ADMINISTRATOR, and the reason is D-15 §7.3 rather than convenience:
   administrators see all projects, so nothing below can mistake a VIEWER gate
   for a severance. That is a property of the INSTRUMENT and no arm concludes
   anything from this credential's reach. */

const q = await queueOf(RUTH);
const ITEMS = (x) => (x && Array.isArray(x.items)) ? x.items : [];
const homesOf = (subject) => {
  const it = ITEMS(q).find((i) => i && i.subject && i.subject.id === subject);
  return it ? it.case : null;
};
const ancestorsOf = (subject) => ((homesOf(subject) || {}).ancestors || []).map((a) => a.id).sort();

console.log(`\n--- CORPUS: ${SUBJECTS.length} subjects · ${ITEMS(q).length} feed item(s) · `
          + `10 ancestors promoted (1 live cites, 1 project severing two, 1 live basis leg, `
          + `2 severed basis legs, 5 unanticipated spellings) ---`);
t("FIXTURE GUARD: `op=queue` ANSWERED and every subject is actually in the feed — a home-set "
+ "assertion over an item that was never minted passes over nothing, which is the failure this "
+ "estate has met three times",
  [q && q.ok !== false, SUBJECTS.filter((s) => homesOf(s) === null)], [true, []]);

/* ====================================================================== 2
 * THE CITES HALF: `refs` carries `rel` and DROPS `status`.
 * ===================================================================== */
t("THE DEFECT, CLOSED: the project that SEVERED its citation is NOT a home, and the project that "
+ "did not still is. `refs` keeps a row for both — the withdrawal lives only in the document — so a "
+ "walk reading the table alone counted the withdrawn project, which is exactly what D-267 was",
  ancestorsOf(SUBJ_CITES), [P_LIVE]);
t("and the home set is DETERMINED, not undetermined: dropping a withdrawn edge is not an admission "
+ "that the walk does not know something. `out_of_view` and `depth_bound` remain the only two ways "
+ "this walk comes back incomplete, and a severance is neither",
  [homesOf(SUBJ_CITES).state, homesOf(SUBJ_CITES).reasons], ["determined", []]);
t("a document whose ONLY citing project withdrew is UNGROUPED — the honest answer DEC-16 already "
+ "defined, reached rather than invented. An item nothing rests on sits ungrouped; it is never "
+ "given a home somebody left",
  [ancestorsOf(SUBJ_ONLY_SEVERED), homesOf(SUBJ_ONLY_SEVERED).ungrouped,
   homesOf(SUBJ_ONLY_SEVERED).state], [[], true, "determined"]);

/* ====================================================================== 3
 * THE BASIS HALF — the same blindness on the other edge kind, and NOTHING HAD
 * NAMED IT. D-267's row names `refs`; `inquiry_basis` is the identical shape.
 * ===================================================================== */
t("THE HALF THE ROW DID NOT PREDICT: `inquiry_basis` is the SAME kind of projection and drops "
+ "`status` identically, so the walk's OTHER edge kind was blind in the same way. An inquiry that "
+ "withdrew the reference under its basis leg is not a home; the one that did not still is",
  ancestorsOf(SUBJ_BASIS), [Q_LIVE]);
t("and it agrees with `#restsOnLive`, the plane's OWN live-basis-leg predicate, because it now IS "
+ "that predicate's severance read — the point of the item is one rule, not one more filter",
  [homesOf(SUBJ_BASIS).state, homesOf(SUBJ_BASIS).reasons], ["determined", []]);
t("the sole-dependent case: an inquiry whose only leg's reference is severed leaves its subject "
+ "UNGROUPED too, which is the basis half's own version of §2's arm and is what proves the two "
+ "halves are confirmed independently rather than one covering for the other",
  [ancestorsOf(SUBJ_BASIS_ONLY_SEVERED), homesOf(SUBJ_BASIS_ONLY_SEVERED).ungrouped],
  [[], true]);

/* ====================================================================== 4
 * OVER-STRICTNESS. Severance narrows on a POSITIVE recorded withdrawal and on
 * nothing else. A fence tighter than its rule is not a safer fence.
 * ===================================================================== */
t("OVER-STRICTNESS — every unanticipated spelling that REACHES the predicate is LIVE and every one "
+ "of them is a home: no `status:` key at all, a value it does not recognise (`Severed`), the right "
+ "word with trailing whitespace (`severed `), and a SECOND relation severed while the citation "
+ "stands. Severance is a decision somebody RECORDED; inferring one from a shape we failed to parse "
+ "would drop homes nobody withdrew from",
  ancestorsOf(SUBJ_SPELLINGS), [P_NOSTATUS, P_ODDSTATUS, P_PADSTATUS, P_OTHERREL].sort());
t("and the `rel` narrowing is LOAD-BEARING rather than decorative: the project that severed its "
+ "`relates_to` edge and kept its `cites` edge is a home, so a withdrawal is read against the "
+ "relation it was recorded on and not against the target alone",
  ancestorsOf(SUBJ_SPELLINGS).includes(P_OTHERREL), true);
/* A SURPRISING RESULT, RECORDED RATHER THAN SMOOTHED, and it is a finding about
   this ARM rather than about the subject. The fourth spelling — a target with
   surrounding whitespace — was written as a fifth over-strictness case and is
   NOT one: `promote` stores `t.target` VERBATIM into `refs.target_id`, and the
   walk's candidate lookup is an exact `WHERE target_id=?`, so a padded target
   never becomes a candidate edge at all. It is excluded ONE STEP EARLIER than
   the severance predicate, it was excluded identically before this item, and it
   is therefore NOT a regression and NOT evidence about `#refEdgeSevered` in
   either direction. It is asserted here so the next reader does not have to
   rediscover why the obvious fifth case is missing — and because a padded target
   silently never grouping is a real property of the projection that nothing else
   in this battery states. */
t("INSTRUMENT FINDING (not an over-strictness pass): a padded TARGET is not a home, and NOT because "
+ "of any severance — `refs.target_id` is stored verbatim and the candidate lookup is exact, so the "
+ "edge is excluded a step before the predicate ever runs. Unchanged by this item, in both "
+ "directions",
  ancestorsOf(SUBJ_SPELLINGS).includes(P_PADTARGET), false);

/* ====================================================================== 5
 * THE EDGE IS NOT FORGOTTEN, AND THE RULE HAS ONE IMPLEMENTATION.
 * ===================================================================== */
const bl = await backlinksOf(RUTH, SUBJ_CITES);
t("NOT WALKED IS NOT DELETED: `op=backlinks` still names the withdrawn project and still reports "
+ "the edge as `severed`. The record keeps the historical edge — what changed is that the QUEUE "
+ "stops filing work under a question a project left, and those are different claims",
  [(bl.backlinks || []).map((b) => [b.from, b.status]).sort()],
  [[[P_LIVE, "confirmed"], [P_SEV, "severed"]].sort()]);

/* THE STRUCTURAL ARM, and it is the one no behavioural arm can stand in for: a
   faithful inline COPY of the predicate behaves identically and is exactly the
   defect D-267 IS. So the call sites are counted off the source. */
const defs = (STORE_SRC.match(/#refEdgeSevered\s*\(citingId/g) || []).length;
const calls = (STORE_SRC.match(/this\.#refEdgeSevered\(/g) || []).length;
t("STRUCTURAL: the severance rule has ONE definition and THREE callers — `#citesInto`, "
+ "`#restsOnLive` and `#queueAncestorEdges`. D-267 exists because the rule had four inline "
+ "implementations and a fifth reader that did not know it existed, and NO behavioural arm can see "
+ "a faithful copy",
  [defs, calls], [1, 3]);
t("STRUCTURAL: and the walk no longer performs a raw unconfirmed read of either projection — both "
+ "edge kinds go through `consider`, so a future edge kind added to this method inherits the "
+ "confirmation instead of quietly reopening the defect",
  [/consider\(r\.bundle_id, null\)/.test(STORE_SRC),
   /consider\(r\.bundle_id, "cites"\)/.test(STORE_SRC)], [true, true]);

} finally {
  await mf.dispose();
  /* The tally is the LAST line and the exit is EXPLICIT — `hygiene.test.mjs`
     enforces both, and it caught this suite on the second: `process.exitCode`
     is not an exit, and a suite that ends on an implicit one is a suite whose
     result the runner has to infer. */
  console.log(`\nseveredhomes: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
