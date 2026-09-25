/* NEGATIVE CONTROL: RUN 2026-09-23 by the D-125 worker, `node test/d125-findingmute.control.mjs` (deliberately NOT a `.test.mjs` — it edits real sources); BASELINE 37 pass 0 fail; each arm ALONE, every restore verified by sha256, by content and by `cmp` against a per-arm pristine. (a) THE ROW'S ARM — the row says "key the item mute by case alone"; the item form holds no case, so the faithful arm takes the MEMBER out of the key: `#queueItemMutes` reads `WHERE ?<>''` (every member's rows) -> 33 pass 4 FAIL, as declared: "B-FEED: ben's feed STILL carries F…", "while ben's feed still carries it" (D-170's held host), and two consequences of the same leak ("F keeps the act… on ben's copy", "a NEW kind… still reaches cara" — ann's item mute reached cara); ann's own ACCEPTS arm, op=proposals and the no-disposition arm stayed GREEN, which is why only a second member can see this defect. (b) ADMIT OBLIGATION into PERSONALLY_MUTABLE_CLASSES -> 31 pass 6 FAIL, as declared: the by-KIND and by-ITEM OBLIGATION refusals, the read-side fence, "the obligation is still on ann's feed", and the two tallies it moved; every FINDING arm GREEN. (c) stop asking `tasks` to name an opaque id -> 36 pass 1 FAIL, as declared: "by ITEM: the task's own id is refused the same way — named OBLIGATION, not merely unknown" (it answered UNKNOWN_KIND); by-KIND GREEN. Restored; src/store.mjs and src/queuestate.mjs sha256-verified against a pre-run manifest. D-534, RUN 2026-09-25 by its worker, by hand (store.mjs copied aside, each arm ALONE, restored and verified by sha256 2f67557e… and cmp, 3350787 bytes); BASELINE 42 pass 0 fail. (d) THE ROW'S ARM — publish the case ids alone again (delete `case_kinds` from op=queue's mute block) -> 38 pass 4 FAIL, as declared: "ACCEPTS: a kind holding nothing back today is still nameable", "a member with no case mute publishes an empty map", "UNDOABLE from what op=queue published alone", "read back: the case leaves `cases` and `case_kinds`"; every D-125/D-170 arm GREEN. Its FIRST run found the INSTRUMENT wrong: the undo indexed the missing map, a TypeError ended the module at 21 pass 3 fail and the rest never ran; the read is now guarded so each arm fails by name. (e) OVER-STRICTNESS — the same map built by a loop over `mutes` instead of Object.fromEntries -> 42 pass 0 fail, as declared. */
/* D-125 — A MEMBER MAY MUTE A FINDING FOR THEMSELVES (DEC-10's (b) and (c)), RULED
 * 2026-09-22 by BOB #26, and D-170's widening (BOB #29, 2026-09-23): the ITEM form
 * reaches an UNGROUPED CONDITION. Design: `docs/development/NOTIFICATIONS.md`
 * "MARKED AS HANDLED".
 *
 * WHAT THIS HOLDS THE PLANE TO (the row's accepts-when, clause by clause, all
 * driven through op=queuemute / op=queue / op=proposals with real member
 * sessions — a store-level test is not evidence a caller can reach it):
 *   1. A's ITEM mute of finding F puts F in A's `suppressed` (scope "item")
 *      while B's feed and op=proposals still carry it and NO disposition row
 *      exists;
 *   2. A's CASE mute of `overdue_successor` suppresses that case's
 *      overdue_successor item while a NEW kind still reaches A — both a
 *      different kind on the same case, and the escalation DEC-10 is about: a
 *      case mute of `missing_predecessor` stops holding the SAME stage the
 *      moment it turns overdue, because that kind was not named;
 *   3. an OBLIGATION mute is refused BY NAME (KIND_NOT_PERSONAL, kind_class
 *      OBLIGATION) in BOTH forms — by kind, and by the task's own id;
 *   4. D-170: A's item mute of a `governor-holding-host` item puts it in A's
 *      `suppressed` while B's feed still carries it and nothing is written; a
 *      case-less per-KIND condition mute is still refused (NO_CASE);
 *   5. D-534: op=queue's mute block publishes each muted case's KINDS
 *      (`case_kinds`, case id -> kinds, beside the unchanged `cases`), so a
 *      case mute holding nothing back today is named and undone from what
 *      the feed published alone.
 *
 * WHAT THIS CANNOT SEE. It does not drive a surface: the UI does not yet offer
 * the item form or a finding kind (civicos-ui is UI's ground). It does not
 * drive every FINDING producer — the key is the item's published id, whatever
 * produced it, so one progression-stage finding and one condition stand for the
 * class; the id shapes of the other producers are read by `itemClassOf`, held
 * directly below over every live id shape in store.mjs.
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { itemClassOf, mutedAsItem, MUTE_REFUSAL_DETAIL } from "../src/queuestate.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "latin1");
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d125", MEMBER_TOKEN: "mem-d125", PROBE_TOKEN: "prb-d125",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000", CONNECTION_DERIVE_DELAY_MS: "600000" },
}));

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
/* Literal op= strings, so scripts/coverage.mjs credits the ops as reached (D-43). */
const queueOf = async (tok, now = null) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=queue&token=${tok}${now === null ? "" : `&now=${now}`}`)).json());
const muteItem = async (tok, item, unmute = false) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=queuemute&token=${tok}`,
  { method: "POST", body: JSON.stringify({ item, unmute }) })).json());
const muteKinds = async (tok, caseId, kinds) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=queuemute&token=${tok}`,
  { method: "POST", body: JSON.stringify({ case: caseId, kinds }) })).json());

const MACHINE = "mem-d125";
const NOW = "2026-09-23T12:00:00Z";
/* The award is dated in the real FUTURE so no armed alarm fires inside the suite;
   op=queue&now moves the read past the contract's 90-day deadline. */
const AWARD_AT = "2027-01-01T00:00:00Z";
const AFTER_MS = Date.parse("2027-05-01T00:00:00Z");

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
const inquiryMd = (id, question, legs) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", ...legs.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the award",
  "    description: The award may be re-let.",
  "basis:", ...legs.flatMap((x) => [`  - target: ${x}`, "    role: supports",
    "    grade: B", "    grade_axis: connection", "    grade_source: hunch",
    "    author: suite", "    date: 2026-09-23"]),
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${NOW} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

const promote = async (id, text, type, state, register = [], extra = []) => {
  const r = await POST(`op=promote&token=${MACHINE}`, {
    bundleId: id, base: null, snapKey: `${id}-${sha(text).slice(0, 8)}`, author: "d125-suite",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }, ...extra],
    register,
    meta: { object_type: type, group: "believe-in-oakland",
            current_state: state, created: NOW, last_updated: NOW } });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  return r;
};

try {
const stub = await mf.getDurableObjectNamespace("STORE");
const obj = stub.get(stub.idFromName("bio"));
const doPost = async (op, body) => (await obj.fetch(`http://x/${op}`,
  { method: "POST", body: JSON.stringify(body) })).json();

/* ============================ the ID → CLASS reader, held directly ========= */
console.log("\n--- the item's class is its id's own first segment, over every live id shape ---");
const shapes = [...STORE_SRC.matchAll(/id: `((?:FINDING|CONDITION)::[^`]*)`/g)].map((m) => m[1]);
t("store.mjs mints a non-trivial set of FINDING/CONDITION item ids (the corpus this reader is held over)",
  shapes.length >= 8, true);
t("every one of them classifies by its prefix, so the item form can name any producer's item",
  shapes.filter((s) => itemClassOf(s.replace(/\$\{[^}]*\}/g, "x")) !== s.split("::")[0]), []);
t("an opaque task id, a bare prefix and a made-up class classify as nothing (the store asks `tasks` for the first)",
  [itemClassOf("TASK-2026-abc"), itemClassOf("FINDING::"), itemClassOf("OBLIGATION::x"), itemClassOf(null)],
  [null, null, null, null]);
t("the read never matches an OBLIGATION, even if its id were in the set — the fence is not trusted to the write alone",
  mutedAsItem({ id: "TASK-1", class: "OBLIGATION" }, new Set(["TASK-1"])), false);
t("the FINDING refusal sentence is GONE and OBLIGATION alone keeps one (D-125's scope)",
  Object.keys(MUTE_REFUSAL_DETAIL), ["OBLIGATION"]);

/* ============================ the corpus ================================== */
const prog = await POST(`op=progressiondefine&token=${MACHINE}`, {
  progressionKey: "procure", label: "Procurement",
  stages: [
    { key: "award", label: "council award", cardinality: "1", required: "always" },
    { key: "kickoff", label: "kickoff meeting", after: "award", cardinality: "0..1",
      within: "before the meeting", required: "usually" },
    { key: "contract", label: "signed contract", after: "award", cardinality: "1",
      within: "90 days", required: "always" },
  ] });
if (!prog.ok) throw new Error(`progressiondefine: ${JSON.stringify(prog)}`);
const ent = await POST(`op=entitycreate&token=${MACHINE}`,
  { kind: "contract", label: "Contract Q", aliases: ["contract:CQ"] });
const AWARD_DOC = "INFO-2026-0125-award";
const awardSha = sha("d125-award");
{
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: awardSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "procurement", reader_version: 1, found: true, at: AWARD_AT,
               entities: [{ ref: "contract:CQ", kind: "contract", key: "CQ", label: "Contract Q" }] } }] });
  await promote(AWARD_DOC, infoMd(AWARD_DOC), "information", "collected", [],
    [{ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }]);
}
await POST(`op=resolve&token=${MACHINE}`, { captureSha: awardSha });
const thr = await POST(`op=thread&token=${MACHINE}`, {
  progressionKey: "procure", entityId: ent.entity_id,
  placements: [{ stage: "award", captureSha: awardSha }] });
if (!thr || thr.ok === false) throw new Error(`thread: ${JSON.stringify(thr)}`);
const INQ = "INQ-2026-0125-award-question";
await promote(INQ, inquiryMd(INQ, "Was the contract signed on time?", [AWARD_DOC]), "inquiry", "open");

/* An OBLIGATION, the drain's own way (queue-state.test.mjs's shape). */
const OB_DOC = "INFO-2026-0126-agenda";
const cap = "d".repeat(64);
await doPost("taskenqueue", { kind: "authority-undetermined", captureSha: cap,
  subject: "https://www.oaklandca.gov/documents/agenda.pdf", at: NOW });
await promote(OB_DOC, infoMd(OB_DOC), "information", "collected",
  [{ sha256: cap, path: "snapshots/agenda.pdf", encoding: "binary", bytes: 10 }]);
const drained = await POST(`op=taskdrain&token=${MACHINE}`, { actor: "consumer", now: NOW });
const task = (drained.created || []).find((c) => c.refers_to === OB_DOC);
if (!task) throw new Error(`drain created no task: ${JSON.stringify(drained)}`);

/* The roster. */
const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=adm-d125`,
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await member("ruth", ["contribute"], "admin");
await member("gus", ["contribute"], "admin");
const ann = await member("ann", ["contribute"]);
const ben = await member("ben", ["contribute"]);
const cara = await member("cara", ["contribute"]);

const F_KICK = "FINDING::procure::kickoff";
const F_CONTRACT = "FINDING::procure::contract";
const ids = (q) => q.items.map((i) => i.id);
const kindOf = (q, id) => (q.items.find((i) => i.id === id) || {}).kind ?? null;

console.log("\n--- fixture: two FINDINGs on one case, and the SAME stage before and after its deadline ---");
const annBefore = await queueOf(ann);
const annAfter0 = await queueOf(ann, AFTER_MS);
t("both findings reach ann, filed under the inquiry that cites the award (a real case home)",
  [ids(annBefore).includes(F_KICK), ids(annBefore).includes(F_CONTRACT),
   (annBefore.items.find((i) => i.id === F_KICK)?.case.ancestors || []).some((a) => a.id === INQ)],
  [true, true, true]);
t("BEFORE the deadline the contract item is missing_predecessor; AFTER it the SAME id is overdue_successor",
  [kindOf(annBefore, F_CONTRACT), kindOf(annAfter0, F_CONTRACT), kindOf(annAfter0, F_KICK)],
  ["missing_predecessor", "overdue_successor", "missing_predecessor"]);
t("and the obligation is on ann's feed too, under its opaque task id",
  ids(annBefore).includes(task.id), true);

/* ============== 1 · DEC-10 (b): ann's ITEM mute of finding F ============== */
console.log("\n--- (b) ann mutes ONE finding by its own id: her feed only, nothing written ---");
const mF = await muteItem(ann, F_KICK);
t("op=queuemute accepts the item form for a FINDING and names its class",
  [mF.ok, mF.form, mF.item, mF.item_class, mF.muted_items], [true, "item", F_KICK, "FINDING", [F_KICK]]);
t("and it wrote ONE item-mute row and nothing of the record's",
  mF.wrote, { queue_item_mutes: 1, queue_state: 0, tasks: 0, proposal_dispositions: 0, bundles: 0 });
const annQ = await queueOf(ann);
t("ACCEPTS: F is gone from ann's items and IN her `suppressed`, stated with scope 'item'",
  [ids(annQ).includes(F_KICK),
   annQ.mute.suppressed.filter((s) => s.id === F_KICK).map((s) => [s.class, s.scope, s.case]),
   annQ.mute.items],
  [false, [["FINDING", "item", null]], [F_KICK]]);
t("the OTHER finding on the same case still reaches ann — an item mute is one item",
  ids(annQ).includes(F_CONTRACT), true);
const benQ = await queueOf(ben);
t("B-FEED: ben's feed STILL carries F, and reports nothing suppressed — the mute is ann's alone",
  [ids(benQ).includes(F_KICK), benQ.mute.suppressed_count, benQ.mute.items], [true, 0, []]);
const props = await GET(`op=proposals&token=${MACHINE}`);
t("op=proposals STILL carries F: the record's own question did not move",
  props.proposals.some((p) => p.key === "procure::kickoff"), true);
t("and NO disposition row exists: a preference did not enter the record as an authored act",
  [props.dispositions.length, props.disposition_count], [0, 0]);
t("F keeps the act that DOES clear it for the team, on ben's copy of the item",
  !!(benQ.items.find((i) => i.id === F_KICK)?.disposition), true);

/* ============== 2 · DEC-10 (c): a CASE mute over the kinds named ========== */
console.log("\n--- (c) cara mutes overdue_successor on the case: that kind, not the case ---");
const mC = await muteKinds(cara, INQ, ["overdue_successor"]);
t("the case form now accepts a FINDING kind",
  [mC.ok, mC.case, mC.muted_kinds], [true, INQ, ["overdue_successor"]]);
const caraAfter = await queueOf(cara, AFTER_MS);
t("ACCEPTS: AFTER the deadline the overdue contract is suppressed for cara, named by the case, scope 'case'",
  [ids(caraAfter).includes(F_CONTRACT),
   caraAfter.mute.suppressed.filter((s) => s.id === F_CONTRACT).map((s) => [s.kind, s.case, s.scope])],
  [false, [["overdue_successor", INQ, "case"]]]);
t("while a NEW kind on the same case still reaches cara (the kickoff's missing_predecessor)",
  ids(caraAfter).includes(F_KICK), true);
t("and ben, who muted nothing, still holds the overdue contract",
  ids(await queueOf(ben, AFTER_MS)).includes(F_CONTRACT), true);

/* ============== D-534: the case mute's KINDS are published ================ */
console.log("\n--- D-534: a case mute holding nothing back today still names its kinds ---");
/* BEFORE the deadline no item on INQ is overdue_successor, so cara's mute
   suppresses nothing: `suppressed` cannot name its kinds, and until D-534 the
   mute block published `cases` as ids and the kinds nowhere. */
const caraNow = await queueOf(cara);
t("fixture: before the deadline cara's case mute is holding NOTHING back (no case-scoped suppression)",
  [caraNow.mute.suppressed.filter((s) => s.scope === "case").length, caraNow.mute.cases], [0, [INQ]]);
t("ACCEPTS: a kind holding nothing back today is still nameable — `case_kinds` names it under its case",
  caraNow.mute.case_kinds, { [INQ]: ["overdue_successor"] });
t("a member with no case mute publishes an empty map beside an empty `cases` (the same shape, never absent)",
  [benQ.mute.cases, benQ.mute.case_kinds], [[], {}]);
const undo = await POST(`op=queuemute&token=${cara}`,
  { case: INQ, kinds: (caraNow.mute.case_kinds || {})[INQ] ?? [], unmute: true });
/* guarded so a missing map fails the arms below BY NAME rather than ending the module (its control found that) */
t("and it is UNDOABLE from what op=queue published alone: the case form's unmute over those kinds removes them",
  [undo.ok, undo.removed, undo.muted_kinds], [true, ["overdue_successor"], []]);
const caraUndone = await queueOf(cara, AFTER_MS);
t("read back: the case leaves `cases` and `case_kinds`, and the overdue contract reaches cara again",
  [caraUndone.mute.cases, caraUndone.mute.case_kinds, ids(caraUndone).includes(F_CONTRACT)], [[], {}, true]);

console.log("\n--- DEC-10's escalation: a mute of the stage's OLD kind does not hold it once it is overdue ---");
const mE = await muteKinds(ben, INQ, ["missing_predecessor"]);
const benBefore = await queueOf(ben);
const benAfter = await queueOf(ben, AFTER_MS);
t("before the deadline ben's case mute of missing_predecessor holds BOTH findings",
  [mE.ok, ids(benBefore).includes(F_KICK), ids(benBefore).includes(F_CONTRACT)], [true, false, false]);
t("after it the contract turns overdue_successor — a kind ben never named — and REACHES him again",
  [ids(benAfter).includes(F_CONTRACT), kindOf(benAfter, F_CONTRACT), ids(benAfter).includes(F_KICK)],
  [true, "overdue_successor", false]);

/* ============== 3 · an OBLIGATION is refused BY NAME, in both forms ======= */
console.log("\n--- an OBLIGATION stays unmutable, by kind and by id ---");
const oK = await muteKinds(ann, INQ, ["authority-undetermined"]);
t("by KIND: refused KIND_NOT_PERSONAL naming the class OBLIGATION and the act that clears it",
  [oK.ok ?? false, oK.reason, oK.kind_class, /taskresolve/.test(oK.detail || "")],
  [false, "KIND_NOT_PERSONAL", "OBLIGATION", true]);
const oI = await muteItem(ann, task.id);
t("by ITEM: the task's own id is refused the same way — named OBLIGATION, not merely unknown",
  [oI.ok ?? false, oI.reason, oI.kind_class, oI.item], [false, "KIND_NOT_PERSONAL", "OBLIGATION", task.id]);
t("and the obligation is still on ann's feed",
  ids(await queueOf(ann)).includes(task.id), true);
const oU = await muteItem(ann, "SOMETHING::nobody-minted");
t("an id that names no class and no task is refused SEPARATELY — unknown is not forbidden",
  [oU.ok ?? false, oU.reason], [false, "UNKNOWN_KIND"]);
const oBoth = await POST(`op=queuemute&token=${ann}`, { item: F_CONTRACT, case: INQ, kinds: ["overdue_successor"] });
t("an item named beside a case and kinds is refused rather than guessed at",
  [oBoth.ok ?? false, oBoth.reason], [false, "BAD_KIND"]);
t("a machine credential has no member to mute for (NO_MEMBER)",
  (await POST(`op=queuemute&token=${MACHINE}`, { item: F_KICK })).reason, "NO_MEMBER");

/* ============== 4 · D-170: an UNGROUPED CONDITION by its item id ========== */
console.log("\n--- D-170: the item form reaches a held host, which no case form can ---");
const HOST = "www.oaklandca.gov";
const GOV = `CONDITION::governor-holding-host::${HOST}`;
const held = await doPost("governorreport", { host: HOST, status: 429 });
if (!held.result || held.result.recorded !== true) throw new Error(`governorreport: ${JSON.stringify(held)}`);
const annG0 = await queueOf(ann);
t("the held host is on ann's feed as a CONDITION",
  (annG0.items.find((i) => i.id === GOV) || {}).class ?? null, "CONDITION");
const noCase = await muteKinds(ann, null, ["governor-holding-host"]);
t("a case-less per-KIND condition mute is STILL refused (REC-32's hazard stands)",
  [noCase.ok ?? false, noCase.reason], [false, "NO_CASE"]);
const mG = await muteItem(ann, GOV);
t("the item mute of the held host is accepted and writes one item-mute row",
  [mG.ok, mG.item_class, mG.wrote.queue_item_mutes, mG.wrote.proposal_dispositions, mG.wrote.queue_state],
  [true, "CONDITION", 1, 0, 0]);
const annG = await queueOf(ann);
t("ACCEPTS: the held host is in ann's `suppressed` by item, and gone from her items",
  [ids(annG).includes(GOV), annG.mute.suppressed.some((s) => s.id === GOV && s.scope === "item")],
  [false, true]);
t("while ben's feed still carries it",
  ids(await queueOf(ben)).includes(GOV), true);

/* ============== unmute, and the purge ===================================== */
console.log("\n--- unmute is per item, and a purge takes the item mutes ---");
const un = await muteItem(ann, F_KICK, true);
t("unmuting removes that item and leaves the other standing",
  [un.ok, un.removed, un.muted_items], [true, [F_KICK], [GOV]]);
t("and F is back on ann's feed",
  ids(await queueOf(ann)).includes(F_KICK), true);
const st = await GET(`op=stats&token=adm-d125`);
t("stats counts the item mutes (a count and nothing else)", st.queueItemMutes, 1);
const purged = await POST(`op=purge&token=adm-d125&confirm=bio`, {});
t("a whole-store purge clears them (D-113)",
  [purged.ok, (await GET(`op=stats&token=adm-d125`)).queueItemMutes], [true, 0]);

} catch (e) {
  console.log(`  FAIL  suite threw: ${e && e.stack ? e.stack : e}`);
  fail++;
}

await mf.dispose();

console.log(`\nd125-findingmute: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
