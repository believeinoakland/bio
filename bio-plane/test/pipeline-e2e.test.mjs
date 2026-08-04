/* END-TO-END pipeline integration (M0-7): the whole M4 entity-axis chain driven THROUGH
 * THE CONTROL PLANE in ONE suite, proving the stages COMPOSE — not that each op answers
 * in isolation (every op has its own unit suite already), but that a field ONE op WRITES
 * is the field the NEXT op READS. That composition is exercised for the first time by a
 * DEPLOY; this suite is "test through the op, verify live" applied end-to-end short of one.
 *
 * A single REAL captured document's journey, every hop a dispatchFetch (a real caller's
 * only route, the D-43 class):
 *   1. op=acquire two real Legistar meeting-calendar pages -> each carries document.profile
 *      (FW-3), document.profile.digests (FW-4) and document.reading (FW-5). The capture_sha
 *      the plane computed is captured into a variable and CARRIED downstream verbatim.
 *   2. op=promote both -> the reading persists (op=reading / op=readingref retrieve it BY
 *      the capture_sha acquire produced).
 *   3. op=entitycreate an entity aliased by the reading's own reference + op=resolve both
 *      documents -> each reference resolves to THAT entity at its §8.1 grade (op=concerns
 *      the reverse index).
 *   4. the REC-5 alarm tick (onAlarm()) -> op=connections shows the auto-derived graded
 *      connection between the two documents, asserted_by system, with NO manual op=connect.
 *   5. op=progressiondefine + op=thread the two documents through a definition MINUS a
 *      required stage -> op=instance shows the instance, its weakest-grade, and a
 *      missing-predecessor finding for the omitted stage.
 *   6. op=proposals surfaces that finding (REC-6), D-79-aggregated, machine-provenanced.
 *   7. op=proposedispose ages it (REC-7) -> it drops from open and appears in dispositions[].
 *
 * THE POINT, asserted EXPLICITLY in a dedicated JOIN-KEYS section: the capture_sha, the
 * entity_id and the (progression_key, stage_key) line up across every stage, each stage
 * consuming the prior stage's ACTUAL output. That is what catches an integration gap a
 * per-op suite cannot. This suite adds NO op and NO plane code (it DECLARES a control,
 * adds 0 new unreached ops).
 *
 * NEGATIVE CONTROL: break ONE join — set NC_BREAK_CAPTURE_JOIN=true so op=resolve and
 * op=thread for document A consume a DIVERGENT capture_sha (bytes never acquired) instead
 * of the one op=acquire produced. RUN 2026-07-31 m0-agent-m07: with the join broken, A never
 * resolves to the entity, so the DOWNSTREAM assertions fail — op=resolve(A) grades nothing,
 * op=concerns 2->1, the auto-derived connection count 1->0 (no pair), op=thread refuses
 * NOT_CONCERNED so the instance never forms (op=instance found:false), op=proposals surfaces
 * nothing, and the JOIN-KEYS section's capture_sha/entity_id/(prog,stage) equalities fail:
 * 23 of 53 fail. Restored (false) -> 53 pass, 0 fail. The UPSTREAM stages (acquire/promote/
 * reading, profile+digests — everything through STAGE 2) stay GREEN, proving the break is a
 * COMPOSITION break at the resolve/thread boundary, not an endpoint that stopped answering.
 */
/* NEGATIVE CONTROL: set NC_BREAK_CAPTURE_JOIN=true (line ~50) -> op=resolve/op=thread for document A consume a divergent capture_sha instead of the one op=acquire produced -> the downstream stages fail (resolve grades nothing, connection 1->0, thread NOT_CONCERNED, instance found:false, no proposal, JOIN-KEYS equalities fail): 23 of 53 fail while STAGES 1-2 stay green. RUN 2026-07-31 m0-agent-m07; restored (false) -> 53 pass, 0 fail. */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

/* ---- the ONE knob the negative control flips. false in the committed suite. When true,
   document A's capture_sha is diverged at the resolve+thread consumption points ONLY, so a
   broken join surfaces as DOWNSTREAM failures while acquire/promote/reading stay green. ---- */
const NC_BREAK_CAPTURE_JOIN = false;

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* Two measured-shape ASP.NET WebForms meeting calendars, the one real content type
   docprofile has a reader for: __VIEWSTATE makes the stack CERTAIN; MeetingDetail.aspx?ID=
   links + the date-range control + the Agenda column make meeting_calendar CERTAIN. Both
   list meeting 2101 (the shared subject) plus one meeting of their own; different viewstate
   + rows -> different capture shas, so the join is a real one and not a byte coincidence. */
const cal = (vs, rows) => [
  '<!DOCTYPE html><html><head><title>Council Calendar</title></head><body>',
  '<form id="aspnetForm" method="post">',
  `<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="${vs}" />`,
  '<main id="mainContent" role="main">',
  '<select id="lstYears_Input" name="lstYears" value="This Month"><option>This Month</option></select>',
  '<table><tr><th>Name</th><th>Date</th><th>Agenda</th></tr>',
  rows,
  '</table></main></form></body></html>',
].join("");
const ROW = (id, name, date, agenda) =>
  `<tr><td><a href="MeetingDetail.aspx?ID=${id}&GUID=X">${name}</a></td>`
  + `<td>${date}</td><td>${agenda ? `<a href="View.ashx?M=A&ID=${agenda}">Agenda</a>` : ""}</td></tr>`;

const CAL_A = cal("STATE_A_" + "x".repeat(200),
  ROW("2101", "City Council", "7/15/2026", "5001") + ROW("2102", "Rules Committee", "7/22/2026", ""));
const CAL_B = cal("STATE_B_" + "y".repeat(300),
  ROW("2101", "City Council", "7/15/2026", "5001") + ROW("2103", "Budget Committee", "8/5/2026", "5009"));

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-e2e", MEMBER_TOKEN: "mem-e2e", PROBE_TOKEN: "prb-e2e", VERSION: "test",
              /* This suite is about composition, not pacing; a huge appetite keeps the
                 governor in the path while never gating the scripted host. And the
                 connection-derive alarm is pinned far out so the REAL alarm never races
                 the test — onAlarm() is driven by hand, as scheduler.test.mjs does. */
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0",
              CONNECTION_DERIVE_DELAY_MS: "600000" },
  outboundService(request) {
    const u = new URL(request.url);
    const html = (s) => new Response(s, { headers: {
      "content-type": "text/html; charset=utf-8", "x-powered-by": "ASP.NET", server: "Microsoft-IIS/10.0" } });
    if (u.pathname === "/one.aspx") return html(CAL_A);
    if (u.pathname === "/two.aspx") return html(CAL_B);
    return new Response("unscripted", { status: 500 });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
/* acquire answers at the TOP LEVEL ({ok, document, ...}); the store-forwarded ops answer
   under `result`, which rP unwraps — one route for every hop, dispatchFetch. */
const acquire = async (path, tok = "mem-e2e") => (await mf.dispatchFetch(
  `http://x/api/?op=acquire&token=${tok}`,
  { method: "POST", body: JSON.stringify({ locator: "https://oakland.legistar.com" + path, authority: "City Clerk" }) })).json();
const post = async (op, body, tok = "mem-e2e") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok = "mem-e2e") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`)).json());
const getObj = async () => { const ns = await mf.getDurableObjectNamespace("STORE"); return ns.get(ns.idFromName("bio")); };

const NOW = "2026-07-24T00:00:00Z";
let bseq = 0;
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Calendar ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Calendar bundle.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
/* Promote the ACTUAL acquire document — what op=promote really persists into
   data/provenance.json — so the reading #writeReadings sees is the one the plane produced
   at acquire, never a fabricated shape. register:[] is fine: the reading is derived from
   provenance.json, not from the register. Returns the bundle id. */
const promoteDoc = async (doc) => {
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-e2e`;
  const md = bundleMd(id);
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: "20260724T010000Z_aaaa1111", author: "e2e",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Calendar ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  });
  return { id, ok: r.ok !== false };
};

/* ===================================================================== *
 * STAGE 1 — op=acquire a REAL document. It carries profile + digests +   *
 * reading, and the plane-computed capture_sha becomes the chain's key.   *
 * ===================================================================== */
console.log("\n=== STAGE 1: op=acquire two real meeting-calendar pages (FW-3 profile, FW-4 digests, FW-5 reading) ===");
const acqA = await acquire("/one.aspx");
const acqB = await acquire("/two.aspx");
t("acquire A succeeds", acqA.ok, true);
t("acquire B succeeds", acqB.ok, true);

/* THE JOIN KEY the whole chain rests on: the capture_sha the plane computed. Captured into a
   variable HERE and carried downstream verbatim — never re-derived from the input bytes. */
const captureShaA = acqA.document.capture.sha256;
const captureShaB = acqB.document.capture.sha256;
t("acquire computed a 64-hex capture_sha for each", [/^[0-9a-f]{64}$/.test(captureShaA), /^[0-9a-f]{64}$/.test(captureShaB)], [true, true]);
t("the two captures are genuinely different bytes (a real join, not a coincidence)", captureShaA === captureShaB, false);

/* FW-3: the profile the record thinks it holds. */
const profA = acqA.document.profile || {};
t("FW-3: the capture carries a profile block", typeof acqA.document.profile, "object");
t("FW-3: profile names the host stack handler at CERTAIN confidence", [profA.handler, profA.confidence], ["aspnet_webforms", "certain"]);
t("FW-3: profile names the content type meeting_calendar at CERTAIN confidence", [profA.content_type, profA.content_type_confidence], ["meeting_calendar", "certain"]);

/* FW-4: the computed normalisation digests (determined, because the stack was certain + read as text). */
const digA = profA.digests || {};
t("FW-4: the profile carries a digests block", typeof profA.digests, "object");
t("FW-4: normalisation is determined (certain stack, read as text)", digA.determined, true);
t("FW-4: the evidentiary digest is a 64-hex sha, and NOT the raw capture sha (normalisation happened)",
  [/^[0-9a-f]{64}$/.test(digA.evidentiary || ""), digA.evidentiary === captureShaA], [true, false]);

/* FW-5: the reading the doctype's parse() found, carried on the acquire document. */
const readA = acqA.document.reading || {};
t("FW-5: the capture carries a reading block", typeof acqA.document.reading, "object");
t("FW-5: the reader is named and found entities", [readA.content_type, readA.found], ["meeting_calendar", true]);
t("FW-5: the reading carries the raw reference meeting:2101 (kind:key, unresolved)",
  readA.entities.map((e) => e.ref).includes("meeting:2101"), true);
t("both calendars' readings carry the SHARED reference meeting:2101 (the subject they have in common)",
  [readA.entities.some((e) => e.ref === "meeting:2101"),
   (acqB.document.reading.entities || []).some((e) => e.ref === "meeting:2101")], [true, true]);

/* The chain's reference — the reading's OWN output — is what the entity will be aliased by. */
const SHARED_REF = "meeting:2101";

/* ===================================================================== *
 * STAGE 2 — op=promote persists the reading; op=reading / op=readingref  *
 * retrieve it BY the capture_sha acquire produced.                       *
 * ===================================================================== */
console.log("\n=== STAGE 2: op=promote persists the reading; it retrieves BY the acquire capture_sha ===");
const bundleA = await promoteDoc(acqA.document);
const bundleB = await promoteDoc(acqB.document);
t("both captures promoted", [bundleA.ok, bundleB.ok], [true, true]);

/* JOIN: op=reading retrieves the reading keyed by the SAME capture_sha op=acquire produced. */
const readbackA = await get("reading", "sha256=" + encodeURIComponent(captureShaA));
t("op=reading retrieves the reading BY the acquire capture_sha (found), naming the bundle promote wrote",
  [readbackA.found, readbackA.bundle_id], [true, bundleA.id]);
t("the persisted reading carries the same reference the acquire reading did",
  readbackA.reading.entities.some((e) => e.ref === SHARED_REF), true);

/* JOIN: the reverse index over the RAW reference returns BOTH promoted captures (cross-document,
   still unresolved) — keyed on the capture shas acquire produced. */
const refHits = await get("readingref", "ref=" + encodeURIComponent(SHARED_REF));
t("op=readingref on the shared reference returns BOTH captures, keyed by the acquire capture shas",
  refHits.documents.map((d) => d.capture_sha).sort(), [captureShaA, captureShaB].sort());

/* ===================================================================== *
 * STAGE 3 — op=entitycreate (aliased by the reading's OWN reference) +   *
 * op=resolve -> each reference resolves to the entity at its §8.1 grade. *
 * ===================================================================== */
console.log("\n=== STAGE 3: op=entitycreate + op=resolve -> the reference resolves to the entity at §8.1 grade ===");
/* The entity is aliased by the composite reference the reading carries, so op=resolve grades A
   (the source's own identifier names the subject). This is the reading's output feeding the
   registry — the alias is SHARED_REF, taken from stage 1, not hand-typed. */
const ent = await post("entitycreate", { kind: "body", label: "Oakland City Council (meeting 2101)", aliases: [SHARED_REF] });
t("the threading entity is registered", ent.ok, true);
const entId = ent.entity_id;

/* The negative control diverges A's capture_sha at the resolve/thread CONSUMPTION points only. */
const joinShaA = NC_BREAK_CAPTURE_JOIN ? sha("nc-divergent-bytes-never-acquired") : captureShaA;

const resA = await post("resolve", { captureSha: joinShaA });
const resB = await post("resolve", { captureSha: captureShaB });
/* JOIN: op=resolve resolved the reading's reference to the entity op=entitycreate allocated. */
const resARef = (resA.resolved || []).find((m) => m.ref === SHARED_REF);
const resBRef = (resB.resolved || []).find((m) => m.ref === SHARED_REF);
t("op=resolve A resolved the shared reference to the entitycreate entity_id, at grade A established",
  [resARef && resARef.entity_id, resARef && resARef.grade, resARef && resARef.established], [entId, "A", true]);
t("op=resolve B resolved the SAME reference to the SAME entity_id, at grade A",
  [resBRef && resBRef.entity_id, resBRef && resBRef.grade], [entId, "A"]);

/* JOIN: op=concerns (the reverse index) returns BOTH captures under the entity resolve wrote to. */
const concerns = await get("concerns", "id=" + entId);
t("op=concerns for the entity returns BOTH documents, joined on the entity_id resolve wrote",
  concerns.documents.map((d) => d.capture_sha).sort(), [captureShaA, captureShaB].sort());
t("op=concerns names the entity it answered for (the entitycreate entity_id)", concerns.entity.entity_id, entId);

/* ===================================================================== *
 * STAGE 4 — the REC-5 alarm TICK auto-derives the connection. NO manual  *
 * op=connect: the sweep rides REC-1's DO alarm, driven by hand.          *
 * ===================================================================== */
console.log("\n=== STAGE 4: the REC-5 alarm tick auto-derives the graded connection (no manual op=connect) ===");
/* A resolve dirties the entity and ARMS the alarm, but does NOT derive synchronously. */
const beforeTick = await get("connections", "id=" + entId);
t("op=connections is EMPTY before the tick (the resolve only stamped + armed, it did not derive)", beforeTick.count, 0);
t("a resolve armed the sweep alarm", typeof (await (await getObj()).schedAlarmAt()) === "number", true);

const tick = await (await getObj()).onAlarm();
t("the connection-derive consumer ran on the tick and swept the dirtied entity",
  tick.connderive.entities >= 1, true);

/* JOIN: the auto-derived connection is between the two acquire capture shas, under the entity. */
const conns = await get("connections", "id=" + entId);
t("op=connections now shows exactly ONE auto-derived connection for the entity, WITHOUT any op=connect", conns.count, 1);
t("the derived connection is asserted_by the SYSTEM (a scheduled derivation is a machine act, not a member's)",
  conns.connections[0]?.asserted_by ?? null, "system");
t("the connection joins the TWO acquire capture shas (both ends A -> grade A, established)",
  [conns.connections[0] ? [conns.connections[0].a_capture_sha, conns.connections[0].b_capture_sha].sort() : null,
   conns.connections[0]?.grade ?? null, conns.connections[0]?.established ?? null],
  [[captureShaA, captureShaB].sort(), "A", true]);

/* ===================================================================== *
 * STAGE 5 — op=progressiondefine + op=thread MINUS a required stage ->   *
 * op=instance shows the instance, its weakest grade, and the finding.    *
 * ===================================================================== */
console.log("\n=== STAGE 5: op=progressiondefine + op=thread (minus a required stage) -> op=instance + missing-predecessor ===");
const PROG = "meeting_lifecycle";
const prog = await post("progressiondefine", {
  progressionKey: PROG, label: "Meeting lifecycle",
  stages: [
    { key: "agenda",  label: "published agenda", cardinality: "0..1", required: "usually" },
    { key: "meeting", label: "meeting record",   after: "agenda",  cardinality: "1",    required: "always" },
    { key: "minutes", label: "adopted minutes",  after: "meeting", cardinality: "0..1", required: "usually" },
  ],
});
t("the meeting-lifecycle progression is defined with three stages", [prog.ok, prog.stage_count], [true, 3]);

/* Thread the two REAL captures (A at meeting, B at minutes) — the capture shas acquire
   produced and resolve graded — and OMIT the required 'agenda' stage. */
const threaded = await post("thread", {
  progressionKey: PROG, entityId: entId,
  placements: [
    { stage: "meeting", captureSha: joinShaA },
    { stage: "minutes", captureSha: captureShaB },
  ],
});
t("op=thread threaded the two documents through the definition", [threaded.ok, threaded.threaded], [true, 2]);
t("the instance grade is the weakest connection along the chain — A here (both ends A), determined + established",
  [threaded.grade, threaded.grade_determined, threaded.established], ["A", true, true]);
t("exactly ONE missing-predecessor finding surfaces: the omitted required 'agenda' stage",
  [threaded.finding_count ?? null, threaded.findings?.[0]?.kind ?? null, threaded.findings?.[0]?.stage_key ?? null],
  [1, "missing_predecessor", "agenda"]);
t("the finding CARRIES the instance's grade (A)",
  [threaded.findings?.[0]?.grade ?? null, threaded.findings?.[0]?.grade_determined ?? null], ["A", true]);

/* JOIN: op=instance reads the instance back — the placed stage carries the acquire capture_sha,
   and the instance is keyed on the entity resolve wrote. */
const inst = await get("instance", "key=" + PROG + "&id=" + entId);
t("op=instance reads the instance back: found, grade A, one finding on 'agenda' (the M4 gap is visible)",
  [inst.found, inst.grade, inst.finding_count ?? null, inst.findings?.[0]?.stage_key ?? null], [true, "A", 1, "agenda"]);
t("the placed 'meeting' stage carries the ACQUIRE capture_sha for A (thread consumed acquire's output)",
  inst.stages?.find((s) => s.stage_key === "meeting")?.documents?.[0]?.capture_sha ?? null, captureShaA);
t("the placed 'minutes' stage carries the ACQUIRE capture_sha for B",
  inst.stages?.find((s) => s.stage_key === "minutes")?.documents?.[0]?.capture_sha ?? null, captureShaB);
t("the omitted 'agenda' stage is honestly absent (present:false), not invented",
  inst.stages?.find((s) => s.stage_key === "agenda")?.present ?? null, false);

/* ===================================================================== *
 * STAGE 6 — op=proposals surfaces the derived finding (REC-6).           *
 * ===================================================================== */
console.log("\n=== STAGE 6: op=proposals surfaces the missing-predecessor finding (REC-6, D-79-aggregated) ===");
const feed = await get("proposals", "");
const PROP_KEY = PROG + "::agenda";
const proposal = feed.proposals.find((p) => p.key === PROP_KEY);
t("op=proposals surfaces exactly one open proposal for the agenda gap", feed.proposal_count, 1);
t("the proposal is keyed by (progression_key, stage_key), names the stage, and carries the instance grade A",
  [proposal && proposal.key, proposal && proposal.progression_key, proposal && proposal.stage_key,
   proposal && proposal.grade, proposal && proposal.grade_determined],
  [PROP_KEY, PROG, "agenda", "A", true]);
t("the proposal is SURFACED BY the machine (derived-finding provenance), N=1 instance",
  [proposal?.surfaced_by ?? null, proposal?.n ?? null], ["machine", 1]);
/* JOIN: the proposal's instance names the entity resolve wrote to. */
t("the proposal's instance names the entitycreate entity_id (the finding traces to the resolved entity)",
  proposal?.instances?.[0]?.entity_id ?? null, entId);

/* ===================================================================== *
 * STAGE 7 — op=proposedispose ages the finding (REC-7): it drops from    *
 * open and appears in dispositions[].                                    *
 * ===================================================================== */
console.log("\n=== STAGE 7: op=proposedispose ages the finding out of open (REC-7) ===");
const disp = await post("proposedispose", {
  key: PROP_KEY, to: "dismissed",
  reason: "these meetings fall under the consent calendar, so no separate agenda item was published",
});
t("op=proposedispose records the dismissal keyed on the SAME (progression_key, stage_key) proposals surfaced",
  [disp.ok, disp.key, disp.to], [true, PROP_KEY, "dismissed"]);
t("the deciding member is server-stamped, and NO bundle is minted (declining is not authoring)",
  [disp.decided_by, disp.bundle], ["class:member", null]);

const feedAfter = await get("proposals", "");
t("the dismissed proposal AGES out of OPEN (dropped from proposals[])",
  feedAfter.proposals.some((p) => p.key === PROP_KEY), false);
t("no proposal remains open, and the decision AGED into dispositions[] (it did not vanish)",
  [feedAfter.proposal_count, feedAfter.disposition_count], [0, 1]);
const aged = feedAfter.dispositions.find((d) => d.key === PROP_KEY);
t("the aged disposition carries its state, reason, decider and a time — keyed on the proposal's identity",
  [aged && aged.key, aged && aged.state, aged && aged.decided_by, typeof (aged && aged.at)],
  [PROP_KEY, "dismissed", "class:member", "string"]);

/* ===================================================================== *
 * THE JOIN KEYS — asserted EXPLICITLY across the whole chain. Each key is *
 * proven to be the SAME value every stage consumed, using the variables   *
 * captured at each stage's boundary. This is the composition proof a       *
 * per-op suite cannot make.                                               *
 * ===================================================================== */
console.log("\n=== JOIN KEYS: the same key flows stage-to-stage, each consuming the prior stage's ACTUAL output ===");

/* capture_sha: acquire -> reading -> concerns -> connection -> instance stage. */
const readbackShaA = readbackA.found ? captureShaA : null;                 // op=reading answered for this sha
const concernsShaSet = concerns.documents.map((d) => d.capture_sha).sort();
const connEnds = conns.connections[0]
  ? [conns.connections[0].a_capture_sha, conns.connections[0].b_capture_sha].sort() : null;
const instMeetingSha = inst.stages?.find((s) => s.stage_key === "meeting")?.documents?.[0]?.capture_sha ?? null;
t("JOIN capture_sha: acquire's sha == the sha op=reading retrieved == op=instance's 'meeting' placement",
  [captureShaA === readbackShaA, captureShaA === instMeetingSha], [true, true]);
t("JOIN capture_sha: op=concerns and the derived connection both key on EXACTLY the two acquire shas",
  [concernsShaSet, connEnds], [[captureShaA, captureShaB].sort(), [captureShaA, captureShaB].sort()]);

/* entity_id: entitycreate -> resolve -> concerns -> connection -> instance -> proposal. */
t("JOIN entity_id: entitycreate == resolve(A) == resolve(B) == concerns.entity",
  [entId === resARef?.entity_id, entId === resBRef?.entity_id, entId === concerns.entity?.entity_id], [true, true, true]);
t("JOIN entity_id: the entity op=connections derived for == the entity op=proposals' instance names",
  [conns.count === 1 && entId === concerns.entity?.entity_id, entId === proposal?.instances?.[0]?.entity_id], [true, true]);

/* (progression_key, stage_key): finding -> proposal -> proposedispose -> disposition. */
t("JOIN (progression_key, stage_key): the thread finding, op=instance's finding, and the proposal all key on (meeting_lifecycle, agenda)",
  [threaded.findings?.[0]?.stage_key ?? null, inst.findings?.[0]?.stage_key ?? null, proposal?.stage_key ?? null, proposal?.progression_key ?? null],
  ["agenda", "agenda", "agenda", PROG]);
t("JOIN (progression_key, stage_key): op=proposedispose and the aged disposition key on the SAME identity the proposal carried",
  [disp.key === proposal?.key, aged?.key === proposal?.key], [true, true]);

await mf.dispose();
console.log(`\npipeline-e2e: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
