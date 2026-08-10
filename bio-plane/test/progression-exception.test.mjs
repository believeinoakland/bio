/* EXCEPTION DOCUMENTS that discharge a LEGITIMATE SKIP (CONSTRUCTS Step 5 SLICE C / FW-10;
 * framework §8.2 "a skipped stage with no exception document is [a finding]. The table records
 * which document discharges which skip"). Builds on FW-9 (progression instances + the
 * missing-predecessor finding), FW-7 (resolutions / op=concerns) and FW-6 (the subject registry).
 *
 * An EXCEPTION DOCUMENT is a REAL captured document, threaded onto a progression instance and
 * NAMING the ONE stage it discharges, carrying a reason and a citation — the justification an
 * institution is supposed to publish for a lawful skip (a sole-source award discharging the
 * missing solicitation). A discharge must be EARNED: the document must ACTUALLY resolve to the
 * threading entity (FW-7 — NOT_CONCERNED otherwise, the same gate op=thread uses) and NAME a real
 * stage (BAD_STAGE otherwise), and carry a reason + citation (NO_REASON / NO_CITATION). A skip is
 * discharged only by a document in the record, never a caller's bare assertion (an equality a
 * caller can hand us is one a caller can invent). Whether the discharge APPLIES (the stage is
 * missing-and-required) is derived ON READ — derived findings inform, they do not decide.
 *
 * Doctrine proved here: a required stage missing but carrying a discharging exception → a distinct
 * "discharged" state (reason/citation + the document VISIBLE), NOT a missing_predecessor finding
 * and NOT silently absent; the SAME instance WITHOUT the exception still fires; unless_exception
 * fires ONLY when undischarged (DEC-9's mechanism); an exception naming a stage that is not missing
 * discharges nothing; undischarged-and-required still fires.
 *
 * Everything is driven THROUGH the control plane (a real caller's only route), so coverage credits
 * op=discharge and op=exceptions on the control-plane surface, not only the store (D-43).
 */
/* NEGATIVE CONTROL: in store.mjs #assembleInstance force `const discharged = false;` (ignore the exception documents) -> the DISCHARGED solicitation stage falls back to a missing_predecessor finding, so the finding reappears and the discharge vanishes. RUN 2026-07-31 framework-agent-fw10: the "AFTER the exception: solicitation no longer surfaces as a finding" and "solicitation is a distinct DISCHARGED state" assertions FAIL, then the suite throws on the now-undefined discharged-state lookup (dSol) — NOT green; restored -> 36 pass, 0 fail. */
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
  bindings: { ADMIN_TOKEN: "adm-fw10", MEMBER_TOKEN: "mem-fw10", PROBE_TOKEN: "prb-fw10", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-fw10") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok = "mem-fw10") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* seed captured documents through the real FW-5 -> FW-6 -> FW-7 chain, exactly as the FW-9 suite
   does: promote a bundle whose data/provenance.json carries a crafted reading, register the
   threading entity, resolve each document's reference to it. */
const NOW = "2026-07-24T00:00:00Z";
let bseq = 0;
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Procurement document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const promoteReading = async (captureSha, entities) => {
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-fw10`;
  const md = bundleMd(id);
  const doc = { capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
                reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
                           at: NOW, entities } };
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: "20260724T010000Z_aaaa1111", author: "fw10",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Doc ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  });
  return { id, ok: r.ok !== false };
};

console.log("\n--- seed: the threading contract entity, its procurement documents, and an emergency memo ---");
const eContract = await post("entitycreate",
  { kind: "contract", label: "Recology Hauling Contract", aliases: ["contract:C-2024-88", "Recology Hauling Contract"] });
const cid = eContract.entity_id;
t("the threading contract entity is registered", eContract.ok, true);

const shaNeed = sha("fw10-need");
const shaAward = sha("fw10-award");
const shaContract = sha("fw10-contract");
const shaMemo = sha("fw10-emergency-memo");     // the sole-source justification memo -> discharges solicitation
const shaWaiver = sha("fw10-council-waiver");    // a council waiver -> discharges recommendation
await promoteReading(shaNeed, [{ ref: "contract:C-2024-88", kind: "contract", key: "C-2024-88", label: "anticipated Recology contract" }]);
await promoteReading(shaAward, [{ ref: "contract:C-2024-88", kind: "contract", key: "C-2024-88", label: "Recology award" }]);
await promoteReading(shaContract, [{ ref: "contract:ZZ-0000", kind: "contract", key: "ZZ-0000", label: "Recology Hauling Contract" }]);
await promoteReading(shaMemo, [{ ref: "contract:C-2024-88", kind: "contract", key: "C-2024-88", label: "sole-source memo for contract C-2024-88" }]);
await promoteReading(shaWaiver, [{ ref: "contract:C-2024-88", kind: "contract", key: "C-2024-88", label: "council waiver for contract C-2024-88" }]);
for (const s of [shaNeed, shaAward, shaContract, shaMemo, shaWaiver]) await post("resolve", { captureSha: s });
t("the emergency memo resolves to the SAME contract entity (a document actually in the record concerning the subject)",
  (await post("resolve", { captureSha: shaMemo })).resolved[0].entity_id, cid);

/* a document that concerns a DIFFERENT entity — for the NOT_CONCERNED refusal. */
const eOther = await post("entitycreate", { kind: "contract", label: "Unrelated Contract", aliases: ["contract:OTHER-9"] });
const oid = eOther.entity_id;
const shaOther = sha("fw10-other");
await promoteReading(shaOther, [{ ref: "contract:OTHER-9", kind: "contract", key: "OTHER-9", label: "unrelated" }]);
await post("resolve", { captureSha: shaOther });

console.log("\n--- op=progressiondefine: procurement with a usually stage, an unless_exception stage, and always stages ---");
const proc = await post("progressiondefine", {
  progressionKey: "procurement", label: "Procurement",
  stages: [
    { key: "need", label: "staff report", cardinality: "0..n", required: "sometimes" },
    { key: "solicitation", label: "RFP / RFQ / IFB", after: "need", cardinality: "0..1", required: "usually" },
    { key: "recommendation", label: "staff recommendation", after: "solicitation", cardinality: "0..1", required: "unless_exception" },
    { key: "award", label: "council resolution", after: "recommendation", cardinality: "1", required: "always" },
    { key: "contract", label: "signed agreement", after: "award", cardinality: "1", within: "90 days", required: "always" },
    { key: "amendment", label: "change order", after: "contract", cardinality: "0..n", required: "never" },
  ],
});
t("the procurement progression is defined with six stages", [proc.ok, proc.stage_count], [true, 6]);

console.log("\n--- thread need->award->contract MINUS the solicitation: the gap is a finding BEFORE any discharge ---");
const threaded = await post("thread", {
  progressionKey: "procurement", entityId: cid,
  placements: [
    { stage: "need", captureSha: shaNeed },
    { stage: "award", captureSha: shaAward },
    { stage: "contract", captureSha: shaContract },
  ],
});
/* solicitation (usually) + recommendation (unless_exception) both missing and UNDISCHARGED -> two findings. */
t("BEFORE any exception document: the missing solicitation (usually) IS a missing_predecessor finding — the accepts-when 'still does'",
  threaded.findings.some((x) => x.stage_key === "solicitation" && x.kind === "missing_predecessor"), true);
t("BEFORE any exception document: the missing recommendation (unless_exception, undischarged) also fires — FW-10/DEC-9 mechanism",
  threaded.findings.some((x) => x.stage_key === "recommendation" && x.kind === "missing_predecessor" && x.dischargeable === true), true);
t("every missing-required finding is flagged DISCHARGEABLE (an exception document could discharge it)",
  threaded.findings.every((x) => x.dischargeable === true), true);
t("no discharged states yet", threaded.discharge_count, 0);

console.log("\n--- op=discharge: an emergency memo discharges the missing solicitation (the accepts-when core) ---");
const disc = await post("discharge", {
  progressionKey: "procurement", entityId: cid, stage: "solicitation", captureSha: shaMemo,
  reason: "sole-source emergency procurement under Municipal Code 2.04.051 — no solicitation was issued",
  citation: "City Administrator emergency finding, filed 2024-03-02",
});
t("op=discharge returns the reassembled instance, naming the discharged stage and the document", [disc.ok, disc.discharged_stage, disc.exception_document], [true, "solicitation", shaMemo]);
t("op=discharge stamps the declaring member from the session", disc.declared_by, "class:member");
t("AFTER the exception: the solicitation no longer surfaces as a missing_predecessor finding — the accepts-when 'NO finding'",
  disc.findings.some((x) => x.stage_key === "solicitation"), false);
t("instead, the solicitation is a distinct DISCHARGED state — a lawful, recorded skip, not a gap",
  disc.discharges.some((x) => x.stage_key === "solicitation" && x.kind === "discharged_skip"), true);
const dSol = disc.discharges.find((x) => x.stage_key === "solicitation");
t("the discharged state SHOWS why the skip is legitimate — the reason, the citation and the document (never just hidden)",
  [dSol.documents[0].reason.startsWith("sole-source emergency"), dSol.documents[0].citation, dSol.documents[0].capture_sha],
  [true, "City Administrator emergency finding, filed 2024-03-02", shaMemo]);
t("the solicitation stage itself reads discharged, carrying the exception document",
  [disc.stages.find((s) => s.stage_key === "solicitation").discharged,
   disc.stages.find((s) => s.stage_key === "solicitation").exception_count], [true, 1]);
t("the recommendation (unless_exception, STILL undischarged) still fires — a discharge is per-stage, earned separately",
  disc.findings.some((x) => x.stage_key === "recommendation"), true);

console.log("\n--- an unless_exception stage fires ONLY when undischarged (DEC-9's mechanism) ---");
const disc2 = await post("discharge", {
  progressionKey: "procurement", entityId: cid, stage: "recommendation", captureSha: shaWaiver,
  reason: "council waived the staff recommendation step by motion",
  citation: "Council motion 2024-041",
});
t("discharging the unless_exception recommendation stops its finding — fires only when undischarged",
  disc2.findings.some((x) => x.stage_key === "recommendation"), false);
t("with both skips discharged, ZERO missing_predecessor findings remain and TWO discharged states are recorded",
  [disc2.finding_count, disc2.discharge_count], [0, 2]);

console.log("\n--- op=instance reads the discharged instance back: the discharges persist and derive on read ---");
const inst = await get("instance", "key=procurement&id=" + cid);
t("op=instance: no findings, two discharged states, grade still the weakest connection (C)",
  [inst.finding_count, inst.discharge_count, inst.grade], [0, 2, "C"]);

console.log("\n--- a discharge must be EARNED: refuse-by-name when it is not ---");
t("an exception naming a stage NOT in the definition discharges nothing — BAD_STAGE",
  (await post("discharge", { progressionKey: "procurement", entityId: cid, stage: "ghoststage", captureSha: shaMemo, reason: "r", citation: "c" })).reason, "BAD_STAGE");
t("an exception whose document does NOT resolve to the threading entity is refused NOT_CONCERNED (never a caller's bare assertion)",
  (await post("discharge", { progressionKey: "procurement", entityId: cid, stage: "solicitation", captureSha: shaOther, reason: "r", citation: "c" })).reason, "NOT_CONCERNED");
t("an exception document with NO reason is refused NO_REASON (a discharge states why)",
  (await post("discharge", { progressionKey: "procurement", entityId: cid, stage: "solicitation", captureSha: shaMemo, citation: "c" })).reason, "NO_REASON");
t("an exception document with NO citation is refused NO_CITATION (a discharge cites where the justification is published)",
  (await post("discharge", { progressionKey: "procurement", entityId: cid, stage: "solicitation", captureSha: shaMemo, reason: "r" })).reason, "NO_CITATION");
t("no progression key is refused NO_KEY",
  (await post("discharge", { entityId: cid, stage: "solicitation", captureSha: shaMemo, reason: "r", citation: "c" })).reason, "NO_KEY");
t("no entity is refused NO_ENTITY",
  (await post("discharge", { progressionKey: "procurement", stage: "solicitation", captureSha: shaMemo, reason: "r", citation: "c" })).reason, "NO_ENTITY");
t("no stage is refused NO_STAGE",
  (await post("discharge", { progressionKey: "procurement", entityId: cid, captureSha: shaMemo, reason: "r", citation: "c" })).reason, "NO_STAGE");
t("no capture is refused NO_CAPTURE",
  (await post("discharge", { progressionKey: "procurement", entityId: cid, stage: "solicitation", reason: "r", citation: "c" })).reason, "NO_CAPTURE");
t("an unknown progression is refused NO_SUCH_PROGRESSION",
  (await post("discharge", { progressionKey: "ghost", entityId: cid, stage: "s", captureSha: shaMemo, reason: "r", citation: "c" })).reason, "NO_SUCH_PROGRESSION");
t("an unregistered entity is refused NO_SUCH_ENTITY",
  (await post("discharge", { progressionKey: "procurement", entityId: "ENT-nope", stage: "solicitation", captureSha: shaMemo, reason: "r", citation: "c" })).reason, "NO_SUCH_ENTITY");

console.log("\n--- an exception naming a stage that is NOT missing discharges nothing (framework 8.2) ---");
/* award is PRESENT (threaded). Recording an exception on it is admitted (the document is earned),
   but it discharges nothing: the stage is filled, so there is no skip. The exception is carried on
   the stage as inert, and op=instance produces NO discharged_skip for a present stage. */
const discAward = await post("discharge", {
  progressionKey: "procurement", entityId: cid, stage: "award", captureSha: shaMemo,
  reason: "recorded against a present stage", citation: "n/a",
});
t("the exception is recorded, but the award stage stays PRESENT and is NOT discharged (it was not skipped)",
  [discAward.stages.find((s) => s.stage_key === "award").present,
   discAward.stages.find((s) => s.stage_key === "award").discharged], [true, false]);
t("no discharged_skip is produced for the present award stage — a discharge naming a non-missing stage discharges nothing",
  discAward.discharges.some((x) => x.stage_key === "award"), false);

console.log("\n--- op=exceptions: the raw discharge rows are auditable (including the inert one) ---");
const exList = await get("exceptions", "key=procurement&id=" + cid);
t("op=exceptions lists all three recorded exception documents (solicitation, recommendation, and the inert award one)",
  [exList.ok, exList.exception_count, exList.exceptions.map((e) => e.stage_key).sort()],
  [true, 3, ["award", "recommendation", "solicitation"]]);
t("op=exceptions with no key is refused by name", (await get("exceptions", "id=" + cid)).reason, "NO_KEY");

console.log("\n--- re-discharging the same document at the same stage UPSERTS (an exception is editable data) ---");
const re = await post("discharge", {
  progressionKey: "procurement", entityId: cid, stage: "solicitation", captureSha: shaMemo,
  reason: "revised sole-source finding", citation: "City Administrator emergency finding, rev. 2024-03-05",
});
t("re-discharging updates the reason/citation in place (still one solicitation exception, revised)",
  [(await get("exceptions", "key=procurement&id=" + cid)).exceptions.filter((e) => e.stage_key === "solicitation").length,
   re.discharges.find((x) => x.stage_key === "solicitation").documents[0].reason], [1, "revised sole-source finding"]);

console.log("\n--- purge clears progression exceptions (D-113) ---");
const beforeExc = (await get("exceptions", "key=procurement&id=" + cid)).exception_count;
t("before purge the instance holds exception documents", beforeExc > 0, true);
const purge = rP(await (await mf.dispatchFetch(
  "http://x/api/?op=purge&token=adm-fw10&confirm=bio", { method: "POST" })).json());
t("a whole-store purge REPORTS the exception documents it removed (not silent)",
  purge.removed.progressionExceptions > 0, true);
t("after purge the store holds zero exception documents", purge.after.progressionExceptions, 0);
t("after purge op=exceptions finds nothing for an entity that had discharges",
  (await get("exceptions", "key=procurement&id=" + cid)).exception_count, 0);

await mf.dispose();
console.log(`\nprogression-exception: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
