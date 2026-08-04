/* NEGATIVE CONTROL: (a) ROUTE THE MUTE THROUGH THE RECORD — in src/store.mjs's DO dispatch map, make the `queuemute:` lambda ALSO write a disposition: `queuemute: () => { this.proposeDispose({ progressionKey: "procurement", stageKey: "solicitation", to: "deferred", reason: "muted by a member", decidedBy: url.searchParams.get("member") }); return this.queueMute({ ...(body || {}), member: url.searchParams.get("member"), viewer: url.searchParams.get("viewer") }); },` (a personal preference entering the record as an authored act, which is the collapse D-125 forbids) -> 3 assertions FAIL: op=proposals reports 1 disposition where 0 is required, and the group's FINDING is aged out of carol's feed AND out of dave's — one member's inbox hygiene erased the record's own question for everybody. Restored, 66 pass. (b) LET muted_kinds ACCEPT AN OBLIGATION KIND — in src/store.mjs queueMute, delete the `if (cls !== "CONDITION")` refusal block -> 9 assertions FAIL: the mute of `authority-undetermined` on INQ-1 SUCCEEDS, and the real obligation it names DISAPPEARS from carol's queue while `tasks` still routes it to her (the record believing a question reached a person it cannot reach), taking the every-ancestor and shared-resolution assertions down with it. Restored, 66 pass. Both RUN 2026-08-04, rec21-agent. */
/* REC-21 / DEC-16: queue_state — the PERSONAL half, and the boundary that keeps
 * it out of the record.
 *
 * WHAT THIS CLOSES. D-125's first-named hazard: muting is PERSONAL and
 * dismissing is a RECORD ACT, and they must never be one control. REC-20 landed
 * the record half — item state on the EVENT, so one member's resolution clears
 * every member's queue. This is the other half, and DEC-16 makes it MORE
 * important rather than less: once one member's act can clear another member's
 * queue, the mute/resolve boundary is the only thing standing between SHARED
 * RESOLUTION and SILENT DISAPPEARANCE.
 *
 * THE DOCTRINE UNDER TEST. `muted_kinds` may contain CONDITION kinds ONLY. An
 * OBLIGATION is something a named person must do for the record to proceed;
 * `tasks` carries no per-member mute; so a mute that could reach an obligation
 * would remove it from the only surface that routes it while the record went on
 * believing the question had reached a person. That failure is not asserted
 * here, it is DEMONSTRATED: negative control (b) removes the fence and the
 * obligation genuinely vanishes from a real feed.
 *
 * WHAT THIS SUITE HOLDS THE PLANE TO (the accepts-when, clause by clause):
 *   - muting hides a case's PRESENT CONDITION kinds and nothing else, and a
 *     kind that was NOT named — a new kind arriving on a muted case — still
 *     surfaces (the ONE admission decision queueFeed calls, held directly);
 *   - it hides them from THAT MEMBER ONLY: a second member's feed is unchanged,
 *     item for item, and reports no mute;
 *   - an OBLIGATION on a muted case still appears in that member's queue;
 *   - neither op writes a `tasks` row, a `proposal_dispositions` row or a
 *     bundle — the op=proposedispose precedent carried one step on (declining is
 *     not authoring; a preference is not even a disposition);
 *   - P-87: a snooze has no global default to fall back on, so one with no
 *     instant is REFUSED, and the re-notify clock rides the REC-1 alarm's own
 *     consumer registry at the MEMBER's instant, firing at that moment and at no
 *     other;
 *   - DEC-16's safeguard, end to end and with NO new machinery: resolving by
 *     LOOKING clears the event for everyone, and resolving by CHANGING the
 *     record raises its OWN event which reaches EVERY ancestor entry — including
 *     the entry of the member who muted conditions on that very case.
 *
 * CONDITION HAS NO PRODUCER IN THIS PLANE (HOLE-1, declared in
 * QUEUE_CLASSES_DEFERRED and pinned by queue.test.mjs), and REC-21 does not
 * build one — emitting a stub would be the second half of a bridge. So the
 * CONDITION-side clauses are held against `suppressedBy`, which is the function
 * queueFeed itself calls and not a restatement of it (the deriveActs precedent),
 * while every clause that CAN be exercised on live items is driven through
 * op=queue with real member sessions. The two halves meet in negative control
 * (b), where the same admission point provably hides a real item.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { QUEUE_CONDITION_KINDS, classOfKind, suppressedBy,
         serializeMutedKinds, parseMutedKinds } from "../src/queuestate.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec21", MEMBER_TOKEN: "mem-rec21", PROBE_TOKEN: "prb-rec21",
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
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const RAW = async (q, body) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: r.status, body: await r.json() };
};

/* The THREE ops under test, each reached by a member session THROUGH the control
   plane and each with its literal op= written out (not interpolated) so
   scripts/coverage.mjs credits it as reached — D-43: a store-level test is not
   evidence that a caller can get there. */
const queueOf = async (tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=queue&token=${tok}`)).json());
const mute = async (tok, caseId, kinds, unmute = false) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=queuemute&token=${tok}`,
  { method: "POST", body: JSON.stringify({ case: caseId, kinds, unmute }) })).json());
const snooze = async (tok, caseId, body) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=queuesnooze&token=${tok}`,
  { method: "POST", body: JSON.stringify({ case: caseId, ...body }) })).json());

const NOW = "2026-07-31T12:00:00Z";
const MACHINE = "mem-rec21";

/* ------------------------------------------------------------- documents
   Shapes carried from queue.test.mjs, which pins REC-20's contract: this suite
   builds the SAME corpus so the two are testing one plane and not two. */
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

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (targets) => targets.length
  ? ["basis:", ...targets.flatMap((x) => [`  - target: ${x}`, "    role: supports",
      "    grade: B", "    grade_axis: connection", "    grade_source: resolution"])]
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

const promote = async (id, text, type, state, tok = MACHINE, register = [], base = null) => {
  const r = await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `${id}-${sha(text).slice(0, 8)}`, author: "rec21-suite",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: state, created: NOW, last_updated: NOW } });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  return r;
};

try {

/* ============================ phase 0 · the corpus, BEFORE any member exists */
const stub = await mf.getDurableObjectNamespace("STORE");
const obj = stub.get(stub.idFromName("bio"));
const doPost = async (op, body) => (await obj.fetch(`http://x/${op}`,
  { method: "POST", body: JSON.stringify(body) })).json();

const INFO88 = "INFO-2026-0088-controller-memo";
const INFO88B = "INFO-2026-0089-authorising-memo";

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

console.log("\n--- fixture: DEC-16's own worked example, with an obligation at the leg ---");
const t88 = await makeTask(INFO88);
t("the obligation on the controller memo is routed honestly UNASSIGNED, so it is claimable (D-98/DEC-7)",
  t88.assignee, "unassigned");

const INQ2 = "INQ-2026-0002-transfer-authorised";
const INQ1 = "INQ-2026-0001-sewer-fund-misused";
await promote(INQ2, inquiryMd(INQ2, "Was the $2.1m transfer authorised?", [INFO88]), "inquiry", "open");
await promote(INQ1, inquiryMd(INQ1, "Was the sewer fund misused?", [INQ2]), "inquiry", "open");

/* The FINDING half, so the suite can prove the mute wrote NOTHING to
   proposal_dispositions by watching the finding stay open (REC-7's own subject). */
const prog = await POST(`op=progressiondefine&token=${MACHINE}`, {
  progressionKey: "procurement", label: "Procurement",
  stages: [
    { key: "solicitation", label: "RFP / RFQ / IFB", cardinality: "0..1", required: "usually" },
    { key: "award", label: "council resolution", after: "solicitation", cardinality: "1", required: "always" },
  ] });
if (!prog.ok) throw new Error(`progressiondefine: ${JSON.stringify(prog)}`);
const ent = await POST(`op=entitycreate&token=${MACHINE}`,
  { kind: "contract", label: "Gap Contract A", aliases: ["contract:C-A"] });
const AWARD_DOC = "INFO-2026-0400-award-resolution";
const awardSha = sha("rec21-award");
{
  const md = infoMd(AWARD_DOC);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: awardSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
               entities: [{ ref: "contract:C-A", kind: "contract", key: "C-A", label: "Gap Contract A" }] } }] });
  const r = await POST(`op=promote&token=${MACHINE}`, {
    bundleId: AWARD_DOC, base: null, snapKey: `${AWARD_DOC}-new`, author: "rec21-suite",
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
if ((thr.findings || []).length !== 1) throw new Error(`thread: ${JSON.stringify(thr)}`);
const INQ_F = "INQ-2026-0400-award-question";
await promote(INQ_F, inquiryMd(INQ_F, "Was the award competitively bid?", [AWARD_DOC]), "inquiry", "open");

/* ============================ phase 1 · the roster */
const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=adm-rec21`,
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const ruth = await member("ruth", ["contribute"], "admin");
const gus = await member("gus", ["contribute"], "admin");
const carol = await member("carol", ["contribute", "create_projects"]);
const dave = await member("dave", ["contribute"]);
/* A member with NO working capability at all — the surface's own test of the
   NEEDS classification: attention is not a corpus act, so `view` alone reaches it. */
const vera = await member("vera", []);

const PROJ = "PROJ-2026-0001-sewer-fund";
await promote(PROJ, projectMd(PROJ, [INFO88]), "project", "forming", carol);

/* ============ the vocabulary, before anything is asked of the plane ======== */
console.log("\n--- the CONDITION vocabulary is a VOCABULARY, and the classes are disjoint ---");
const condKinds = Object.keys(QUEUE_CONDITION_KINDS);
t("the catalogue's CONDITION kinds are transcribed and non-trivial", condKinds.length >= 10, true);
t("every one of them classifies as CONDITION and nothing else",
  condKinds.filter((k) => classOfKind(k) !== "CONDITION"), []);
t("the three LIVE producer spellings are classified, so a refusal can say MISCLASSED rather than UNKNOWN",
  ["authority-undetermined", "missing_predecessor", "overdue_successor"].map(classOfKind),
  ["OBLIGATION", "FINDING", "FINDING"]);
t("a kind the catalogue does not name is null — unknown is not the same as forbidden",
  classOfKind("something-nobody-declared"), null);
t("the stored set has ONE representation: sorted, de-duplicated, round-tripping",
  [serializeMutedKinds(["text-undetermined", "governor-holding-host", "text-undetermined"]),
   parseMutedKinds("text-undetermined,governor-holding-host")],
  ["governor-holding-host,text-undetermined", ["governor-holding-host", "text-undetermined"]]);

console.log("\n--- every kind the LIVE producers emit is classified (the drift guard) ---");
const q0 = await queueOf(carol);
t("op=queue answers for a member session and carries live items of both classes",
  [q0.ok, q0.counts.obligation >= 1, q0.counts.finding], [true, true, 1]);
t("and every kind in that live feed is one the catalogue names — a new producer kind cannot ship unclassified",
  q0.items.map((i) => i.kind).filter((k) => classOfKind(k) === null), []);

/* ===================== the ADMISSION DECISION, held directly ===============
   suppressedBy is the function queueFeed calls; holding it here is the
   deriveActs precedent, and it is the only way to exercise the CONDITION-side
   clauses while CONDITION correctly has no producer (HOLE-1). */
console.log("\n--- muting hides a case's PRESENT CONDITION kinds, and only those, and only for that member ---");
const condItem = (kind, homes) => ({ id: `X::${kind}`, class: "CONDITION", kind,
  case: { state: "determined", ungrouped: homes.length === 0, reasons: [],
          ancestors: homes.map((h) => ({ id: h, depth: 1 })) } });
const carolMutes = new Map([[INQ1, new Set(["text-undetermined", "partial-capture-outstanding"])]]);
const daveMutes = new Map();
t("a muted kind on the muted case is suppressed, and the answer NAMES the case that did it",
  suppressedBy(condItem("text-undetermined", [INQ1]), carolMutes), INQ1);
t("the SECOND muted kind too — the mute is a SET of the kinds present when it was made",
  suppressedBy(condItem("partial-capture-outstanding", [INQ1]), carolMutes), INQ1);
t("a NEW kind on the muted case still surfaces: it was not present when the mute was made, so it is not in the set",
  suppressedBy(condItem("governor-holding-host", [INQ1]), carolMutes), null);
t("the same item is NOT suppressed for a second member — the mute is personal, and it is one member's row",
  suppressedBy(condItem("text-undetermined", [INQ1]), daveMutes), null);
t("a muted kind on a DIFFERENT case still surfaces — the mute is keyed (member, case), never (member)",
  suppressedBy(condItem("text-undetermined", [INQ2]), carolMutes), null);
t("an item with one muted home and one un-muted home IS suppressed: the member said not on that case",
  suppressedBy(condItem("text-undetermined", [INQ2, INQ1]), carolMutes), INQ1);
t("an UNGROUPED item cannot be muted — there is no case to mute it against, and no home is invented for it",
  suppressedBy(condItem("text-undetermined", []), carolMutes), null);
t("and an OBLIGATION kind is never in the set to match, because the WRITE refused it",
  suppressedBy({ id: "T::1", class: "OBLIGATION", kind: "authority-undetermined",
                 case: { ancestors: [{ id: INQ1, depth: 1 }] } }, carolMutes), null);

/* ============================ the FENCE, at the ONE write ================== */
console.log("\n--- the fence: muted_kinds may hold CONDITION kinds ONLY ---");
const okMute = await mute(carol, INQ1, ["text-undetermined", "partial-capture-outstanding"]);
t("op=queuemute records the two condition kinds against (carol, INQ-1), sorted",
  [okMute.ok, okMute.case, okMute.muted_kinds],
  [true, INQ1, ["partial-capture-outstanding", "text-undetermined"]]);
t("and it reports the record surfaces it did NOT touch: one queue_state row and nothing else",
  okMute.wrote, { queue_state: 1, tasks: 0, proposal_dispositions: 0, bundles: 0 });

const badOb = await mute(carol, INQ1, ["authority-undetermined"]);
t("muting an OBLIGATION kind is REFUSED, and the refusal names the kind's actual class",
  [badOb.ok ?? false, badOb.reason, badOb.kind, badOb.kind_class],
  [false, "KIND_NOT_PERSONAL", "authority-undetermined", "OBLIGATION"]);
t("and it names the act that DOES clear it, rather than only saying no",
  [badOb.detail.includes("RESOLVED"), badOb.detail.includes("taskresolve"),
   badOb.detail.includes("no per-member mute")], [true, true, true]);
/* THE HARM THE FENCE PREVENTS, demonstrated rather than asserted. With the
   refusal removed (negative control b) the mute above SUCCEEDS and this
   obligation disappears from carol's queue while `tasks` still routes it to
   her — the record believing a question reached a person it cannot reach. */
const qAfterBad = await queueOf(carol);
t("the obligation the refused mute named is STILL in carol's queue — the fence is load-bearing, not cosmetic",
  qAfterBad.items.some((i) => i.id === t88.id), true);
t("and nothing was written: carol's mute set is unchanged by the refusal",
  qAfterBad.mute.cases, [INQ1]);

const badFind = await mute(carol, INQ1, ["missing_predecessor"]);
t("muting a FINDING kind is refused too, and points at the AUTHORED record act that clears one",
  [badFind.ok ?? false, badFind.reason, badFind.kind_class, badFind.detail.includes("proposedispose")],
  [false, "KIND_NOT_PERSONAL", "FINDING", true]);
const badUnknown = await mute(carol, INQ1, ["a-kind-nobody-declared"]);
t("an unclassified kind is refused SEPARATELY — unknown is not the same as forbidden",
  [badUnknown.ok ?? false, badUnknown.reason, Array.isArray(badUnknown.available)],
  [false, "UNKNOWN_KIND", true]);
const badEmpty = await mute(carol, INQ1, []);
t("a mute with NO kinds is refused: 'mute this case' is the delete button the doctrine forbids",
  [badEmpty.ok ?? false, badEmpty.reason], [false, "NO_KINDS"]);
const badSubject = await mute(carol, INFO88, ["text-undetermined"]);
t("a DOCUMENT is a subject and not a home, so it cannot be muted (MAP RULE: the type is read through the catalog)",
  [badSubject.ok ?? false, badSubject.reason, badSubject.object_type],
  [false, "NOT_A_CASE", "information"]);

console.log("\n--- muting cannot be used to probe for a case you may not see (D-15) ---");
const daveOnProject = await mute(dave, PROJ, ["text-undetermined"]);
const daveOnNothing = await mute(dave, "PROJ-2026-9999-does-not-exist", ["text-undetermined"]);
t("a project dave was never invited to answers BYTE-IDENTICALLY to one that does not exist",
  [daveOnProject.reason, daveOnProject.detail], [daveOnNothing.reason, daveOnNothing.detail]);
t("and carol, who owns it, can mute it — so the difference is the VIEWER and not the case",
  (await mute(carol, PROJ, ["governor-holding-host"])).ok, true);

console.log("\n--- a mute has a member behind it, or it does not exist ---");
const machine = await RAW(`op=queuemute&token=${MACHINE}`, { case: INQ1, kinds: ["text-undetermined"] });
t("a machine credential is refused NO_MEMBER: there is no attention for a token to have a preference about",
  [machine.status, machine.body.result.reason], [200, "NO_MEMBER"]);
const probe = await RAW(`op=queuemute&token=prb-rec21`, { case: INQ1, kinds: ["text-undetermined"] });
t("and the probe class cannot reach the op at all — it is not in its class list",
  [probe.status, probe.body.ok ?? false], [403, false]);
t("a view-only member CAN manage their own attention: no capability gates it (NEEDS null, deliberately)",
  (await mute(vera, INQ1, ["text-undetermined"])).ok, true);

/* ==================== the live feed, and what the mute did NOT do ========== */
console.log("\n--- the mute reaches THAT member's feed only, and hides no live item ---");
const qc = await queueOf(carol);
const qd = await queueOf(dave);
t("carol's feed REPORTS her mute rather than silently applying it — nothing is hidden from the hider",
  [qc.mute.personal, qc.mute.cases, qc.mute.suppressed_count], [true, [INQ1, PROJ], 0]);
t("dave's feed reports NO mute of his own, and names none of carol's",
  [qd.mute.cases, qd.mute.suppressed_count, JSON.stringify(qd.mute).includes("carol")],
  [[], 0, false]);
t("dave's items are unchanged, item for item, by another member's mute",
  qd.items.map((i) => i.id), q0.items.filter((i) => qd.items.some((j) => j.id === i.id)).map((i) => i.id));
t("carol's OWN items are unchanged too: no LIVE kind was in the set, so a kind she did not mute still surfaces",
  qc.items.map((i) => i.id), q0.items.map((i) => i.id));
t("the OBLIGATION on the muted case INQ-1 is still there, filed under it",
  [qc.items.find((i) => i.id === t88.id)?.class,
   qc.items.find((i) => i.id === t88.id)?.case.ancestors.some((a) => a.id === INQ1)],
  ["OBLIGATION", true]);

console.log("\n--- muting wrote to ONE table: not tasks, not proposal_dispositions, no bundle ---");
const tasksNow = await GET(`op=tasks&token=${MACHINE}`);
t("every task the drain created is still open — a mute created none and resolved none",
  [(tasksNow.tasks || []).length, (tasksNow.tasks || []).filter((x) => x.status === "resolved").length],
  [1, 0]);
const props = await GET(`op=proposals&token=${MACHINE}`);
t("proposal_dispositions is EMPTY: a personal preference did not enter the record as an authored act",
  [props.dispositions.length, props.disposition_count], [0, 0]);
t("and the FINDING the mute could have aged is still OPEN, in carol's feed and in dave's",
  [props.proposal_count, qc.counts.finding, qd.counts.finding], [1, 1, 1]);
const st = await GET(`op=stats&token=adm-rec21`);
t("the only thing that grew is queue_state itself",
  st.queueState >= 3, true);

/* ============================ P-87 · the snooze and its clock ============== */
console.log("\n--- P-87: there is no global interval to fall back on, so a snooze names its own ---");
const noUntil = await snooze(carol, INQ1, {});
t("a snooze with no instant is REFUSED rather than filled in with a plane-wide default",
  [noUntil.ok ?? false, noUntil.reason], [false, "NO_UNTIL"]);
t("and the refusal says WHY there is no default: P-87, the stage's own interval and never a global one",
  [noUntil.detail.includes("P-87"), noUntil.detail.includes("global")], [true, true]);
t("a past instant is refused too — a snooze that has already expired defers nothing while reporting that it does",
  (await snooze(carol, INQ1, { until: "2020-01-01T00:00:00Z" })).reason, "UNTIL_IN_PAST");
t("and an unreadable one is refused by name rather than silently becoming epoch",
  (await snooze(carol, INQ1, { until: "next tuesday-ish" })).reason, "BAD_UNTIL");

const wakeAt = Date.now() + 3_600_000;
const sn = await snooze(carol, INQ1, { until: new Date(wakeAt).toISOString() });
t("a snooze at the member's OWN instant is recorded, and writes the same one table and no other",
  [sn.ok, sn.snoozed_until, sn.wrote], [true, new Date(wakeAt).toISOString(),
  { queue_state: 1, tasks: 0, proposal_dispositions: 0, bundles: 0 }]);
const qcSnoozed = await queueOf(carol);
t("A SNOOZE HIDES NOTHING: deferring a re-notification is not removing an item, and the feed is unchanged",
  qcSnoozed.items.map((i) => i.id), qc.items.map((i) => i.id));
t("and the mute it sits beside is untouched — two columns, two meanings, one row",
  qcSnoozed.mute.cases, [INQ1, PROJ]);

console.log("\n--- the re-notify clock rides the REC-1 alarm registry, at the member's instant and no other ---");
const early = await obj.onAlarm(wakeAt - 60_000);
t("BEFORE the member's instant the consumer is not due at all — it fires at its OWN cadence, not on every wake",
  "queuerenotify" in early, false);
const late = await obj.onAlarm(wakeAt + 60_000);
t("AT the member's instant it fires, counts exactly the snooze that came due, and reports it as a real clock",
  [late.queuerenotify.expired, late.queuerenotify.next], [1, null]);
t("and it SELF-TERMINATES: with no future snooze it wants no wake, so an idle instance holds no alarm for it",
  late.queuerenotify.next, null);
t("it was never reported as a test probe — a real clock that shows up as a probe is a clock nobody counts",
  (late.probes || []).includes("queue-renotify"), false);
await snooze(carol, INQ1, { clear: true });

/* ========== DEC-16 · an act that CHANGES the record is itself an event ===== */
console.log("\n--- DEC-16: resolving by CHANGING the record raises its OWN event, by the ordinary loop ---");
const before = { carol: await queueOf(carol), dave: await queueOf(dave), ruth: await queueOf(ruth) };
t("all three members hold the same event today — an unassigned obligation stays claimable by any of them",
  [before.carol.items.some((i) => i.id === t88.id),
   before.dave.items.some((i) => i.id === t88.id),
   before.ruth.items.some((i) => i.id === t88.id)], [true, true, true]);

/* Dave answers the question at the leg by CAPTURING the authorising memo and
   ATTACHING it as a basis leg of INQ-2 — a change to the record, made at INQ-2
   by a member who is not the one standing at INQ-1. The capture raises its own
   obligation the way every capture does (D-98), and REC-20's every-ancestor walk
   carries it upward. No mechanism in REC-21 participates in any of this: that is
   the point of the clause. */
const tB = await makeTask(INFO88B);
const inq2Sha = (await GET(`op=projection&token=${dave}&id=${INQ2}`)).bundle_sha;
await promote(INQ2, inquiryMd(INQ2, "Was the $2.1m transfer authorised?", [INFO88, INFO88B]),
  "inquiry", "open", dave, [], inq2Sha);
const resolved = await POST(`op=taskresolve&token=${dave}`,
  { id: t88.id, note: "answered: the authorising memo is captured and attached to INQ-2" });
t("dave resolves the original obligation ONCE, attributed", [resolved.ok, resolved.status], [true, "resolved"]);

const after = { carol: await queueOf(carol), dave: await queueOf(dave), ruth: await queueOf(ruth) };
t("RESOLVING BY LOOKING clears the event from EVERY member's queue, under every home — the EVENT is the unit of state",
  [after.carol.items.some((i) => i.id === t88.id),
   after.dave.items.some((i) => i.id === t88.id),
   after.ruth.items.some((i) => i.id === t88.id)], [false, false, false]);

/* WHO THE NEW EVENT WENT TO IS D-98'S ROUTING LADDER AND NOT THIS ITEM'S
   BUSINESS: by now an active administrator exists, so the drain routes to one
   instead of leaving it unassigned. The suite follows the record rather than
   arranging it — the point under test is that the event PROPAGATES to every
   ancestor and that a mute cannot stop it, not who happens to hold it. */
const TOK = { ruth, gus, carol, dave };
const holder = TOK[tB.assignee];
t("the CHANGE raised its OWN event, routed honestly to an administrator now that one exists (D-98)",
  [tB.assignee !== "unassigned", !!holder], [true, true]);
const qHold = await queueOf(holder);
const newFor = (q) => q.items.find((i) => i.id === tB.id);
t("it is in the holder's queue, and it came up the ORDINARY consequence loop — a task like any other, no new machinery",
  [!!newFor(qHold), newFor(qHold).class, newFor(qHold).basis.source, newFor(qHold).kind],
  [true, "OBLIGATION", "tasks", "authority-undetermined"]);
t("and it reaches EVERY ancestor of the leg dave changed, at its true depth — not the nearest one",
  [newFor(qHold).case.state,
   newFor(qHold).case.ancestors.map((a) => a.id),
   newFor(qHold).case.ancestors.find((a) => a.id === INQ2).depth,
   newFor(qHold).case.ancestors.find((a) => a.id === INQ1).depth],
  ["determined", [INQ1, INQ2], 1, 2]);
t("one event, N homes: two ancestors and ONE entry, so DEC-10's one-standing-entry survives the change too",
  qHold.items.filter((i) => i.id === tB.id).length, 1);

/* THE CLAUSE THE WHOLE ITEM IS ABOUT. Carol muted CONDITION kinds on INQ-1
   before any of this happened, and INQ-1 is one of the new event's homes. Once
   the obligation is routed to her it reaches her ANYWAY, because a mute cannot
   reach an obligation — which is exactly what stops the record believing a
   question reached a person it cannot reach. */
const fwd = await POST(`op=taskforward&token=${holder === ruth ? ruth : gus}`,
  { id: tB.id, to: "carol" });
t("the holder forwards it to carol, who is standing at the top question (D-98's routing ladder)",
  [fwd.ok, fwd.assignee], [true, "carol"]);
const qCarolNew = await queueOf(carol);
t("carol MUTED conditions on INQ-1, and the new OBLIGATION filed under INQ-1 reaches her regardless",
  [qCarolNew.mute.cases.includes(INQ1),
   !!newFor(qCarolNew),
   newFor(qCarolNew).case.ancestors.some((a) => a.id === INQ1),
   qCarolNew.mute.suppressed_count], [true, true, true, 0]);

console.log("\n--- and a no-op resolution raises nothing at all ---");
const looked = await POST(`op=taskresolve&token=${carol}`,
  { id: tB.id, note: "looked; the memo's authority is stated on its face and nothing changed" });
t("carol resolves the new event by looking, from a home dave never acted under", looked.ok, true);
const done = { carol: await queueOf(carol), dave: await queueOf(dave), ruth: await queueOf(ruth) };
t("it is gone for all three, and NOTHING took its place — a no-op resolution raises no event",
  [done.carol.items.some((i) => i.id === tB.id),
   done.dave.items.some((i) => i.id === tB.id),
   done.ruth.items.some((i) => i.id === tB.id),
   done.carol.counts.obligation], [false, false, false, qCarolNew.counts.obligation - 1]);
t("the record half moved and the personal half did not: carol's mutes are exactly where she left them",
  done.carol.mute.cases, [INQ1, PROJ]);

console.log("\n--- unmuting is a difference, not a reset ---");
const un = await mute(carol, INQ1, ["text-undetermined"], true);
t("unmuting removes the named kind and leaves the rest of the set standing",
  [un.ok, un.muted_kinds, un.removed], [true, ["partial-capture-outstanding"], ["text-undetermined"]]);

console.log("\n--- a purge takes the personal state with the case (D-113) ---");
const purged = await POST(`op=purge&token=adm-rec21&confirm=bio&bundleId=${INQ1}`, {});
t("purging the case clears the mutes keyed to it, so nobody's silence outlives the thing it was about",
  [purged.ok, purged.removed.queueState >= 1], [true, true]);
t("and a mute on a DIFFERENT case survives — a per-bundle purge is per-bundle",
  (await queueOf(carol)).mute.cases, [PROJ]);

} catch (e) {
  console.log(`  FAIL  suite threw: ${e && e.stack ? e.stack : e}`);
  fail++;
}

await mf.dispose();

console.log(`\nqueue-state: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
