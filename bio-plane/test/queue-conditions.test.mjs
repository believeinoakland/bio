/* NEGATIVE CONTROL: (run 2026-08-04, rec32-agent) LEAVE A RESOLVED CONDITION RENDERING — in src/store.mjs's `#conditionsGovernorHolding`, bind the cool-off comparison to the epoch instead of to the read's own instant: change ``SELECT * FROM host_governor WHERE cooloff_until > ? ORDER BY host`, now)) {`` to ``... ORDER BY host`, 0)) {`` (the derivation then reports every host that has EVER been held, which is precisely what a STORED condition row would do once its fact resolved and nothing came back to clear it) -> the assertion "the hold expires and the condition is gone from CAROL's, DAVE's and RUTH's feeds at once" FAILS, naming the stale item three times: got [["CONDITION::governor-holding-host::www.oaklandca.gov"],[same],[same]] against []. Every other assertion still passes, which is the finding: a condition that renders after its fact resolved looks EXACTLY like a live one to every surface, to every member at once, and only a clause that resolves the fact and looks again can tell them apart. Restored, 50 pass. (run 2026-08-04, REC-46) THE MACHINE-WRITER PREFIX IS NO LONGER A COPY PROVEN EQUAL TO AN ORIGINAL, so the pin that compared two hand-typed literals was CORRECTED at the site rather than exempted: both index.mjs and store.mjs now interpolate `MACHINE_AUTHOR_PREFIX` from checks/bio-checks.mjs. ARM: move that constant from `token:` to `bot:` in the catalog ALONE -> 49 pass, 2 FAIL, and the two are exactly the ones that SHOULD fire on a doctrine move — the D-61 basis reads `bot:member` where it pins the wire value `token:member`, and "the machine writer is NAMED and never anonymous" reports the stamp moved — while the composition pins stay GREEN, because they assert that neither file spells a prefix of its own and that is still true. Under the SAME arm the D-61 condition still FIRES and still resolves, which is the point: the store's GLOB and index.mjs's stamp moved together because they are one string now. checks/bio-checks.mjs restored byte-identically, sha256 df71cf184664e696a1ccbb6e4311dbb468443c7185093fa6cff8b972ebfc584e compared before and after; whole suite 51 pass. */
/* REC-32 / HOLE-1: the FIRST CONDITION generator, and the first read in which
 * the mute machinery does anything to a live item.
 *
 * WHAT THIS CLOSES. REC-20 landed op=queue with OBLIGATION and FINDING and
 * DECLARED the third class absent (QUEUE_CLASSES_DEFERRED, HOLE-1) because it
 * had no producer; REC-21 landed the mute and could only hold its CONDITION-side
 * clauses against `suppressedBy` directly, for the same reason. Both were right
 * to stop there — a stub would have been the second half of a bridge — and both
 * left the same gap: nothing had ever proved that a member's mute reaches a real
 * item in a real feed, or that a condition clears when its fact resolves.
 *
 * THE THREE KINDS, and why these three. NOTIFICATIONS.md's catalogue names
 * eleven CONDITION kinds. These are the three whose data the store ALREADY
 * holds, each read from the producing subsystem's OWN fact and never inferred:
 *
 *   governor-holding-host          host_governor.cooloff_until > now — the exact
 *     (D-103, D-95)                predicate governorAdmit refuses on. RESOLVES
 *                                  when the hold expires.
 *   partial-capture-outstanding    an unexpired row in capture_sessions, the
 *     (CAPTURE-SCALING)            parked-work ledger the capture path drops
 *                                  itself when nothing is left. RESOLVES when it
 *                                  is dropped or expires.
 *   capture-completed-unattended   manifest.author — the `token:<class>` stamp
 *     (D-61, closed by REC-2)      the control plane puts on a MACHINE write —
 *                                  on the latest snapshot, over an earlier one a
 *                                  PERSON authored. RESOLVES when a person
 *                                  authors the document again.
 *
 * DERIVED ON READ, NO TABLE, NO STORED STATE (the REC-20 precedent). That is
 * what makes resolution need no mechanism at all: the state is on the FACT, so
 * one fact resolving clears the condition for EVERY member at once, and there is
 * nothing per-member left behind to go stale. The negative control produces
 * exactly the failure the shape prevents.
 *
 * WHAT THIS SUITE HOLDS THE PLANE TO (the accepts-when, clause by clause):
 *   - a governor-holding-host condition appears in op=queue's feed carrying its
 *     kind and its case set, through the SAME every-ancestor walk REC-20 built;
 *   - MUTING it hides it for THAT MEMBER ONLY — a second member's feed still
 *     carries it — while a NEW condition kind arriving on the same case AFTER
 *     the mute still surfaces, and the OBLIGATION on that case is untouched;
 *   - RESOLVING THE UNDERLYING FACT clears the condition for EVERY member, and
 *     all three resolution vectors are exercised, one per kind;
 *   - REC-30's viewer posture: a condition about a bundle the viewer may not see
 *     is withheld WHOLE and with no count, and an invisible ancestor is
 *     `undetermined`/`out_of_view` rather than a silently shorter home set;
 *   - R3's bound applies to the SUBJECT gathering too, and exhausting it is
 *     REPORTED (`subject_bound`) rather than truncating the homes;
 *   - queuestate.mjs stays the single authority on what a CONDITION kind is.
 *
 * Driven through the CONTROL PLANE with real member sessions, because `member`
 * and `viewer` are both server-side stamps and a store-level test could not
 * exercise either (D-43). The FACTS are built through the producing subsystems'
 * own write paths on the Durable Object — governorreport, savecapturesession,
 * recordcapturedlocator, promote — never by hand-writing a row, so what is under
 * test is the plane's own state and not a fixture's idea of it.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { QUEUE_CONDITION_KINDS, classOfKind } from "../src/queuestate.mjs";
/* REC-46: the ONE machine-author prefix, so this suite asserts the composition
   rather than restating the literal it used to compare against itself. */
import { MACHINE_AUTHOR_PREFIX, QUEUE_MINT_CHECKS } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const INDEX_SRC = readFileSync(IDX, "utf8");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec32", MEMBER_TOKEN: "mem-rec32", PROBE_TOKEN: "prb-rec32",
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

/* The op under test, reached by a member session THROUGH the control plane. The
   literal `op=queue` is written out (not interpolated) so scripts/coverage.mjs
   credits the op as reached — D-43. `at` is the as-of instant op=queue already
   accepts (`&now=`, REC-20's injectable clock), which is how the suite advances
   past a governor hold rather than sleeping through one. */
const queueOf = async (tok, at = null) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=queue&token=${tok}${at === null ? "" : `&now=${at}`}`)).json());
const mute = async (tok, caseId, kinds, unmute = false) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=queuemute&token=${tok}`,
  { method: "POST", body: JSON.stringify({ case: caseId, kinds, unmute }) })).json());

const NOW  = "2026-07-31T12:00:00Z";   // the member's own authoring
const NOW2 = "2026-07-31T18:00:00Z";   // the unattended writer's revision, later
const NOW3 = "2026-08-01T09:00:00Z";   // the member coming back, later still
const MACHINE = "mem-rec32";
const HOST = "www.oaklandca.gov";
const AGENDA = `https://${HOST}/documents/agenda.pdf`;

/* ------------------------------------------------------------- documents
   Shapes carried from queue.test.mjs and queue-state.test.mjs, which pin
   REC-20's and REC-21's halves: all three suites build the SAME corpus so they
   are testing one plane and not three. */
const infoMd = (id, updated = NOW) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Controller memo ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${updated}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", `A captured document, as of ${updated}.`, "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
/* CORRECTED 2026-08-04 (REC-18), never exempted — see queue.test.mjs for the
   full note. `grade_source: resolution` became an EARNED value that a question
   naming no subject entity cannot claim; `hunch` is the honest name for the
   authored connection grade this fixture always was, carries the same B, and
   announces itself with an author and a date (DEC-15). */
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

const promote = async (id, text, type, state, tok = MACHINE, register = [], base = null,
                       updated = NOW) => {
  const r = await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `${id}-${sha(text).slice(0, 8)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: state, created: NOW, last_updated: updated } });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  return r;
};

try {

/* ============================ phase 0 · the roster and the corpus ========= */
const stub = await mf.getDurableObjectNamespace("STORE");
const obj = stub.get(stub.idFromName("bio"));
const doPost = async (op, body) => (await obj.fetch(`http://x/${op}`,
  { method: "POST", body: JSON.stringify(body) })).json();
const doGet = async (q) => (await obj.fetch(`http://x/${q}`)).json();

const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=adm-rec32`,
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

const INFO88 = "INFO-2026-0088-controller-memo";
const INQ2 = "INQ-2026-0002-transfer-authorised";
const INQ1 = "INQ-2026-0001-sewer-fund-misused";
const PROJ = "PROJ-2026-0001-sewer-fund";
const CAP88 = sha("rec32-agenda-capture");
const CAPPROJ = sha("rec32-project-capture");

/* CAROL authors the controller memo — a PERSON's document, which is what makes
   the D-61 shape possible at all — and its capture is registered under it. */
console.log("\n--- fixture: a member's document, its capture, and the address it came from ---");
await promote(INFO88, infoMd(INFO88), "information", "collected", carol,
  [{ sha256: CAP88, path: "snapshots/agenda.pdf", encoding: "binary", bytes: 10 }]);
/* The address the bytes came from, filed the way every real capture files it. */
await doPost("recordcapturedlocator", { address: AGENDA, addressNorm: AGENDA,
  captureSha: CAP88, retrieved: NOW });

/* DEC-16's worked example above it, so a condition has a real case set. */
await promote(INQ2, inquiryMd(INQ2, "Was the $2.1m transfer authorised?", [INFO88]), "inquiry", "open");
await promote(INQ1, inquiryMd(INQ1, "Was the sewer fund misused?", [INQ2]), "inquiry", "open");
await promote(PROJ, projectMd(PROJ, [INFO88]), "project", "forming", carol,
  [{ sha256: CAPPROJ, path: "snapshots/board-packet.pdf", encoding: "binary", bytes: 10 }]);

/* An OBLIGATION on the same case, so the "untouched" clause has a real subject. */
await doPost("taskenqueue", { kind: "authority-undetermined", captureSha: CAP88,
  subject: AGENDA, at: NOW });
const drained = await POST(`op=taskdrain&token=${MACHINE}`, { actor: "consumer", now: NOW });
const task = (drained.created || []).find((c) => c.refers_to === INFO88);
if (!task) throw new Error(`drain created no task: ${JSON.stringify(drained)}`);
const tasksNow = await GET(`op=tasks&token=${MACHINE}`);
t("the corpus carries a real OBLIGATION on the same document the conditions are about",
  [tasksNow.tasks.length, tasksNow.tasks[0].kind, task.refers_to],
  [1, "authority-undetermined", INFO88]);

const q0 = await queueOf(carol);
const qd0 = await queueOf(dave);
t("and BEFORE any machinery fact exists the feed carries no condition at all — absent, never stubbed",
  [q0.ok, q0.counts.condition, q0.items.some((i) => i.class === "CONDITION")], [true, 0, false]);
t("CONDITION is a declared class now, ranked LAST, and nothing is deferred any more",
  [q0.classes, Object.keys(q0.classes_deferred)],
  [["OBLIGATION", "FINDING", "CONDITION"], []]);

/* ===================== the FACT · the governor holds a host ================
   Built through governorReport, the governor's OWN write path, with the status
   a counterparty actually sends. Nothing here writes a queue row: the condition
   is derived from the cool-off this call sets. */
console.log("\n--- governor-holding-host: the condition is the governor's own cool-off, read ---");
const held = await doPost("governorreport", { host: HOST, status: 429 });
t("the host answers 429 and the governor puts it in cool-off — OUR pacing, not their failure",
  [held.result.recorded, held.result.refusals, held.result.cooloff_ms >= 60000],
  [true, 1, true]);
const cooloffUntil = held.result.cooloff_until;

const GOV = `CONDITION::governor-holding-host::${HOST}`;
const q1 = await queueOf(carol);
const gov = q1.items.find((i) => i.id === GOV);
t("the condition APPEARS in the member's feed, carrying its class and its catalogue kind",
  [!!gov, gov.class, gov.kind, q1.counts.condition], [true, "CONDITION", "governor-holding-host", 1]);
t("it carries the ONE item contract, key for key — a condition is not a second shape",
  ["id", "class", "kind", "case", "subject", "summary", "detail", "basis", "age", "assignee", "options"]
    .filter((k) => !(k in gov)), []);
t("its CASE SET came through REC-20's every-ancestor walk: the document's two inquiries AND the project",
  [gov.case.state, gov.case.ancestors.map((a) => a.id), gov.case.reasons],
  ["determined", [INQ1, INQ2, PROJ].sort(), []]);
t("each ancestor carries the depth it was reached at, exactly as an obligation's does",
  [gov.case.ancestors.find((a) => a.id === INQ2).depth,
   gov.case.ancestors.find((a) => a.id === INQ1).depth], [1, 2]);
t("its BASIS is the producing subsystem's own row, named and quantified — never a restated rule",
  [gov.basis.source, gov.basis.host, gov.basis.refusals, gov.basis.last_refusal_status,
   gov.basis.cooloff_until === cooloffUntil, gov.basis.retry_in_ms > 0],
  ["host_governor", HOST, 1, 429, true, true]);
t("and it says what a condition is FOR: our machinery, distinguishably from the source failing (D-104)",
  [gov.basis.detail.includes("OUR OWN machinery"), gov.summary.includes("PACED, not broken"),
   gov.detail.includes("Nothing about the source is being claimed")], [true, true, true]);
t("its SUBJECT is the HOST — it names no bundle, because the fact is not about one",
  [gov.subject.kind, gov.subject.host, gov.subject.id], ["host", HOST, null]);
t("the documents behind it are the ones captured from that host, and its options are REC-19's derivation",
  [gov.subject.bundles, gov.options.map((o) => o.id)],
  [[INFO88], (await GET(`op=affordances&token=${carol}&target=${INFO88}`)).acts.map((o) => o.id)]);
t("nobody is assigned: a condition is a fact about us, and usually nobody acts on it",
  [gov.assignee, gov.assignee_role], [null, null]);
t("CONDITION ranks LAST in the feed — an obligation outranks a finding outranks our own plumbing",
  q1.items.map((i) => i.class).lastIndexOf("CONDITION") === q1.items.length - 1, true);

/* ========================= the MUTE, on a live item ======================= */
console.log("\n--- muting a PRESENT kind hides it for THAT MEMBER only ---");
const m = await mute(carol, INQ1, ["governor-holding-host"]);
t("carol mutes the condition kind on INQ-1, and the write touches ONE table and no record surface",
  [m.ok, m.muted_kinds, m.wrote],
  [true, ["governor-holding-host"], { queue_state: 1, tasks: 0, proposal_dispositions: 0, bundles: 0 }]);

const qcM = await queueOf(carol);
const qdM = await queueOf(dave);
t("it is GONE from carol's feed, and her own feed REPORTS the suppression rather than shortening silently",
  [qcM.items.some((i) => i.id === GOV), qcM.mute.suppressed_count,
   qcM.mute.suppressed[0].kind, qcM.mute.suppressed[0].case, qcM.mute.suppressed[0].class],
  [false, 1, "governor-holding-host", INQ1, "CONDITION"]);
t("and it is STILL IN DAVE'S — the mute is personal, the condition persists, the record did not change",
  [qdM.items.some((i) => i.id === GOV), qdM.mute.suppressed_count], [true, 0]);
t("THE OBLIGATION ON THE SAME CASE IS UNTOUCHED: a mute may not reach something a named person must do",
  [qcM.items.find((i) => i.id === task.id)?.class,
   qcM.items.find((i) => i.id === task.id)?.case.ancestors.some((a) => a.id === INQ1)],
  ["OBLIGATION", true]);
t("the RECORD half is unchanged by any of it: each member's obligation count is exactly its own baseline",
  [qcM.counts.obligation, qdM.counts.obligation], [q0.counts.obligation, qd0.counts.obligation]);

/* ================= a NEW kind arrives on the SAME muted case ==============
   The mute is scoped to the kinds PRESENT WHEN IT WAS MADE. Nothing enforces
   that but membership of the stored set — so the proof has to be a kind that
   did not exist when carol muted, on the very case she muted. */
console.log("\n--- a NEW condition kind on the SAME muted case still surfaces ---");
const SESSION = "cs_rec32_partial";
await doPost("savecapturesession", { session: SESSION, locator: AGENDA, primarySha: CAP88,
  primaryFile: "snapshots/agenda.pdf", base: AGENDA,
  state: { when0: 0, discovered: 41, spent: 45, queue: ["a", "b", "c"], records: [], links: [],
           siteObservations: [], refToUrl: {} } });
const PARTIAL = `CONDITION::partial-capture-outstanding::${SESSION}`;
const qcNew = await queueOf(carol);
const partial = qcNew.items.find((i) => i.id === PARTIAL);
t("the parked capture becomes a condition of its own kind, about the DOCUMENT the bytes were registered under",
  [!!partial, partial.kind, partial.subject.kind, partial.subject.id],
  [true, "partial-capture-outstanding", "bundle", INFO88]);
t("IT SURFACES FOR CAROL DESPITE HER MUTE — it was not in the set she named, and there is no mute-the-case",
  [partial.case.ancestors.some((a) => a.id === INQ1), qcNew.mute.cases.includes(INQ1),
   qcNew.mute.suppressed.map((s) => s.kind)],
  [true, true, ["governor-holding-host"]]);
t("and its basis is the LEDGER's own row: the work list, its outstanding count and its expiry",
  [partial.basis.source, partial.basis.session, partial.basis.primary_sha, partial.basis.bundle_id,
   partial.basis.outstanding, partial.basis.discovered, partial.basis.state_readable],
  ["capture_sessions", SESSION, CAP88, INFO88, 3, 41, true]);
t("it says the primary is COMPLETE — a partial capture is not a broken one, and the record must not read it as one",
  [partial.detail.includes("primary document is captured"),
   partial.basis.detail.includes("SCRATCH and not record")], [true, true]);

/* ============ the third kind: D-61's unattended writer, in the manifest ==== */
console.log("\n--- capture-completed-unattended: the manifest's own machine-writer stamp (D-61/REC-2) ---");
const memoSha = (await GET(`op=projection&token=${carol}&id=${INFO88}`)).bundle_sha;
await promote(INFO88, infoMd(INFO88, NOW2), "information", "collected", MACHINE, [], memoSha, NOW2);
const UNATT = `CONDITION::capture-completed-unattended::${INFO88}`;
const qcU = await queueOf(carol);
const unatt = qcU.items.find((i) => i.id === UNATT);
t("a MACHINE credential revising a document a PERSON authored raises the condition D-61 describes",
  [!!unatt, unatt.kind, unatt.subject.id], [true, "capture-completed-unattended", INFO88]);
t("the basis names BOTH halves — who left it and who finished it — because the SEQUENCE is the fact",
  [unatt.basis.source, unatt.basis.started_by, unatt.basis.completed_by,
   unatt.basis.started_created, unatt.basis.completed_created],
  ["manifest", "carol", "token:member", NOW, NOW2]);
t("the machine writer is NAMED and never anonymous, which is the whole of REC-2's answer to D-61",
  [unatt.basis.completed_by.startsWith("token:"), unatt.basis.detail.includes("NAMED, never anonymous")],
  [true, true]);
t("all THREE kinds are now live on the same case, and every one of them is filed under it",
  [qcU.counts.condition,
   qcU.items.filter((i) => i.class === "CONDITION")
     .every((i) => i.case.ancestors.some((a) => a.id === INQ1))], [2, true]);

/* carol's mute still hides the governor kind, so her count is two of three. The
   whole set is what dave sees. */
const qdU = await queueOf(dave);
t("dave, who muted nothing, holds all three — and carol's two are the same items minus the one she silenced",
  [qdU.items.filter((i) => i.class === "CONDITION").map((i) => i.kind).sort(),
   qcU.items.filter((i) => i.class === "CONDITION").map((i) => i.kind).sort()],
  [["capture-completed-unattended", "governor-holding-host", "partial-capture-outstanding"],
   ["capture-completed-unattended", "partial-capture-outstanding"]]);

/* ===================== REC-30's viewer posture, on conditions ============== */
console.log("\n--- REC-30: an invisible ANCESTOR is undetermined; an invisible SUBJECT is withheld whole ---");
const govForDave = qdU.items.find((i) => i.id === GOV);
t("dave was never invited to the project, so the condition's home set names it nowhere",
  govForDave.case.ancestors.map((a) => a.id), [INQ1, INQ2]);
t("and the set says UNDETERMINED with the reason rather than being silently shorter (DEC-16's rule)",
  [govForDave.case.state, govForDave.case.reasons], ["undetermined", ["out_of_view"]]);

/* A condition ABOUT a bundle he may not see is a different question, and it gets
   the obligation's answer: withheld whole, with no count. */
const SESSION_P = "cs_rec32_project";
await doPost("savecapturesession", { session: SESSION_P, locator: `https://${HOST}/board-packet.pdf`,
  primarySha: CAPPROJ, primaryFile: "snapshots/board-packet.pdf", base: `https://${HOST}/board-packet.pdf`,
  state: { when0: 0, discovered: 9, spent: 45, queue: ["z"], records: [], links: [],
           siteObservations: [], refToUrl: {} } });
const PARTIAL_P = `CONDITION::partial-capture-outstanding::${SESSION_P}`;
const qcP = await queueOf(carol);
const qdP = await queueOf(dave);
t("carol, who owns the project, gets the condition about its capture",
  [qcP.items.some((i) => i.id === PARTIAL_P),
   qcP.items.find((i) => i.id === PARTIAL_P).subject.id], [true, PROJ]);
t("dave gets NOTHING about it — withheld whole, not redacted, because a redaction would say it exists",
  qdP.items.some((i) => i.id === PARTIAL_P), false);
t("the project's id appears NOWHERE in dave's answer: not in a case, a subject, a basis or a message",
  JSON.stringify(qdP).includes(PROJ), false);
t("and no COUNT of what was withheld is reported either — the count is the leak",
  [qdP.counts.condition, qcP.counts.condition], [3, 3]);

/* ============ R3's bound applies to the SUBJECT gathering too ============== */
console.log("\n--- a held host with more documents than the bound reports subject_bound, never truncates ---");
const BOUND_HOST = "records.example.gov";
const bound = Number(/QUEUE_CONDITION_SUBJECTS_MAX\s*=\s*(\d+)/.exec(STORE_SRC)[1]);
for (let i = 0; i < bound + 1; i++) {
  const id = `INFO-2026-05${String(i).padStart(2, "0")}-bulk-${i}`;
  const cap = sha(`rec32-bulk-${i}`);
  await promote(id, infoMd(id), "information", "collected", MACHINE,
    [{ sha256: cap, path: "snapshots/bulk.pdf", encoding: "binary", bytes: 10 }]);
  await doPost("recordcapturedlocator", { address: `https://${BOUND_HOST}/d/${i}.pdf`,
    addressNorm: `https://${BOUND_HOST}/d/${i}.pdf`, captureSha: cap, retrieved: NOW });
}
await doPost("governorreport", { host: BOUND_HOST, status: 503 });
const qcB = await queueOf(carol);
const govB = qcB.items.find((i) => i.id === `CONDITION::governor-holding-host::${BOUND_HOST}`);
t("the gathering is BOUNDED and its exhaustion is STATED — a different word from the walk's own bound",
  [!!govB, govB.case.state, govB.case.reasons, govB.case.ungrouped],
  [true, "undetermined", ["subject_bound"], false]);
t("and the bound is the ONE constant, applied to the subject list it names",
  [govB.subject.bundles.length <= bound, bound], [true, 16]);

/* ============ THE CLAUSE THE NEGATIVE CONTROL IS ABOUT ==================== *
   Each kind resolves by its OWN fact ceasing to be true, and each clears for
   EVERY member at once because the state lives on the fact and not on a
   (member, item) row. Three kinds, three real resolution vectors. */
console.log("\n--- RESOLVING THE UNDERLYING FACT clears the condition for EVERY member ---");
await mute(carol, INQ1, ["governor-holding-host"], true);   // so all three read the same set
t("carol unmutes first, so what follows is about the FACT and not about her preference",
  (await queueOf(carol)).items.some((i) => i.id === GOV), true);

/* (1) the governor's hold EXPIRES. Nothing acts; the fact simply stops. */
const afterHold = cooloffUntil + 60_000;
const [gc, gd, gr] = [await queueOf(carol, afterHold), await queueOf(dave, afterHold),
                      await queueOf(ruth, afterHold)];
/* Reported as the ITEM IDS still standing rather than as three booleans, so the
   negative control's failure NAMES the stale condition instead of printing
   `true` three times — the next session should not have to go looking. */
t("the hold expires and the condition is gone from CAROL's, DAVE's and RUTH's feeds at once",
  [gc, gd, gr].map((q) => q.items.filter((i) => i.id === GOV).map((i) => i.id)),
  [[], [], []]);
t("nothing else moved with it: the obligation and the other conditions are exactly where they were",
  [gc.items.some((i) => i.id === task.id), gc.items.some((i) => i.id === PARTIAL),
   gc.items.some((i) => i.id === UNATT)], [true, true, true]);

/* (2) the capture FINISHES — the capture path drops the session itself. */
await doGet(`dropcapturesession?session=${SESSION}`);
const [pc, pd, pr] = [await queueOf(carol), await queueOf(dave), await queueOf(ruth)];
t("the capture finishes, its ledger row is dropped, and the condition clears for every member",
  [pc.items.some((i) => i.id === PARTIAL), pd.items.some((i) => i.id === PARTIAL),
   pr.items.some((i) => i.id === PARTIAL)], [false, false, false]);

/* (3) the MEMBER COMES BACK and authors the document again. */
const memoSha2 = (await GET(`op=projection&token=${carol}&id=${INFO88}`)).bundle_sha;
await promote(INFO88, infoMd(INFO88, NOW3), "information", "collected", carol, [], memoSha2, NOW3);
const [uc, ud, ur] = [await queueOf(carol), await queueOf(dave), await queueOf(ruth)];
t("a person authors the document again and the unattended-completion condition clears for every member",
  [uc.items.some((i) => i.id === UNATT), ud.items.some((i) => i.id === UNATT),
   ur.items.some((i) => i.id === UNATT)], [false, false, false]);
t("and NOTHING was written to clear any of the three: no table, no state, no per-member row",
  (await GET(`op=proposals&token=${MACHINE}`)).dispositions.length, 0);

/* ==================== the vocabulary stays the single authority ============ */
console.log("\n--- queuestate.mjs remains the ONE authority on what a CONDITION kind is ---");
await doPost("governorreport", { host: HOST, status: 429 });
const qAll = await queueOf(dave);
const liveKinds = [...new Set(qAll.items.filter((i) => i.class === "CONDITION").map((i) => i.kind))].sort();
t("every kind this producer emits is one the catalogue names as a CONDITION",
  liveKinds.filter((k) => classOfKind(k) !== "CONDITION"), []);
t("and the three built here are a SUBSET of the eleven — the catalogue is bigger than the feed, deliberately",
  [liveKinds.every((k) => k in QUEUE_CONDITION_KINDS),
   Object.keys(QUEUE_CONDITION_KINDS).length > liveKinds.length], [true, true]);
t("a member may mute a kind whose generator does not exist yet, so the next generator cannot widen an old mute",
  (await mute(dave, INQ1, ["text-undetermined"])).ok, true);
/* PIN CORRECTED 2026-08-08 (PL-15 / D-213), never exempted, and the old
   assertion was wrong in a way worth stating rather than quietly repairing.
   It matched the literal `NO_CONDITION_KIND` and that code no longer exists —
   NOT because the rule was dropped but because PL-15 SWEPT IT FOR THE CLASS.
   The mint refused an uncatalogued kind for CONDITION items only, so an
   OBLIGATION or a FINDING minted under a kind no vocabulary names reached
   members unchecked. It now refuses for every class, and it splits the one
   refusal into the two facts `classOfKind` was always able to tell apart:
   NO_SUCH_KIND (the catalogue does not name this kind at all) and
   KIND_MISCLASSED (it names it, under a DIFFERENT class — the dangerous one,
   because class decides mute-versus-authored-act).

   AND THE PIN IS STRONGER FOR IT. Matching a code literal in source proved
   only that a string was present. This DRIVES the refusal through the real
   producer set and asserts what it ANSWERS, so a fence deleted tomorrow fails
   here instead of a comment mentioning the code keeping it green. */
t("the mint REFUSES a kind the catalogue does not name, for a CONDITION and for every other class, "
+ "and its two codes say WHICH failure happened (unknown is not the same as misfiled)",
  [/NO_SUCH_KIND/.test(STORE_SRC), /KIND_MISCLASSED/.test(STORE_SRC),
   QUEUE_MINT_CHECKS.NO_SUCH_KIND.check.startsWith("C-"),
   QUEUE_MINT_CHECKS.KIND_MISCLASSED.check.startsWith("C-"),
   /* the CONDITION half the old pin covered, now asked of the live catalogue
      rather than of a source literal */
   classOfKind("a-kind-nobody-catalogued"), classOfKind("capture-completed-unattended")],
  [true, true, true, true, null, "CONDITION"]);

console.log("\n--- the structural pins: one clock, one map rule, one machine-writer literal ---");
const REGION = STORE_SRC.slice(STORE_SRC.indexOf("REC-32 · the CONDITION half of the feed"),
                               STORE_SRC.indexOf("op=queue: the member's ONE feed"));
t("the REC-32 derivations consult NO raw object_type key — every type question goes through the catalog (MAP RULE)",
  /object_type\s*===/.test(REGION), false);
t("they store nothing and write nothing: the whole block is SELECT-only",
  /INSERT|UPDATE |DELETE/.test(REGION), false);
/* The machine-writer literal is stamped at the trust boundary in index.mjs and
   READ here; a drift between the two would make the D-61 condition silently
   stop firing, which is the failure mode nobody would notice.

   PIN CORRECTED 2026-08-04 (REC-46), never exempted, and the correction is the
   whole point of that item rather than bookkeeping. This assertion used to
   match TWO HAND-TYPED LITERALS and check that they said the same thing — a
   copy proven equal to its original, which is the best a proof-by-parsing can
   do and is still weaker than not having a copy. REC-46 made both sites
   interpolate `MACHINE_AUTHOR_PREFIX` from `checks/bio-checks.mjs`, so there is
   now ONE string and nothing left to agree. What is worth pinning changed with
   it: that NEITHER site spells a prefix of its own any more (the drift cannot
   be reintroduced quietly), and that the value the store actually reads at
   RUNTIME is the catalog's — asserted against the imported constant rather than
   against a typed "token:", so a moved prefix moves this assertion too instead
   of failing it. */
t("the prefix this store reads is the one index.mjs actually stamps on an unattended write",
  [/\$\{MACHINE_AUTHOR_PREFIX\}\$\{cls\}/.test(INDEX_SRC),
   /token:\$\{cls\}/.test(INDEX_SRC),
   /QUEUE_MACHINE_AUTHOR_PREFIX\s*=\s*MACHINE_AUTHOR_PREFIX;/.test(STORE_SRC),
   /QUEUE_MACHINE_AUTHOR_PREFIX\s*=\s*["']/.test(STORE_SRC)],
  [true, false, true, false]);
/* And the binding both sites resolve to, read from the catalog itself rather
   than described: `store.mjs` cannot be imported here (it pulls
   `cloudflare:workers`), so the two source pins above are joined by the fact
   that each file IMPORTS the symbol — a name that resolves to nothing would
   throw at module load, which is the runtime half the suite already gets by
   booting the worker for every other assertion in this file. The constant's
   SHAPE is asserted, never its value: this suite does not restate the prefix. */
t("and both files take that name from the catalog, which is what makes them one string",
  [/MACHINE_AUTHOR_PREFIX[\s,}]/.test(STORE_SRC), /MACHINE_AUTHOR_PREFIX[\s,}]/.test(INDEX_SRC),
   typeof MACHINE_AUTHOR_PREFIX === "string", MACHINE_AUTHOR_PREFIX.length > 0],
  [true, true, true, true]);
t("the feed REPORTS and never mutates: reading it twice returns the same items",
  (await queueOf(dave)).items.map((i) => i.id), qAll.items.map((i) => i.id));

} catch (e) {
  console.log(`  FAIL  suite threw: ${e && e.stack ? e.stack : e}`);
  fail++;
}

await mf.dispose();

console.log(`\nqueue-conditions: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
