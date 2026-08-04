/* PROGRESSION INSTANCES, N-stage weakest-grade inheritance, and the MISSING-PREDECESSOR
 * finding (CONSTRUCTS Step 5 SLICE B / FW-9; framework §8.2; M4's acceptance "a progression
 * with a missing predecessor is visible"). Builds on FW-8 (progression_defs/stages +
 * connections) and FW-7 (resolutions / op=concerns).
 *
 * A progression INSTANCE threads REAL captured documents through a definition's stages,
 * assembled by a THREADING ENTITY (framework §8.2). A document is admitted only if it
 * RESOLVES to the entity (FW-7) — a real connection, not one a caller can invent. The
 * INSTANCE grade is the WEAKEST connection along the chain: FW-8 graded the two-node base
 * case, this is the general N-stage inheritance (D-73 pair→chain). A REQUIRED stage
 * (always/usually) with no threaded document surfaces as a missing-predecessor finding
 * carrying the instance's grade — the framework's own example, an award with no solicitation.
 *
 * Doctrine proved here: requiredness is respected (a sometimes/never stage missing is NOT a
 * finding). NOTE: unless_exception was SILENT in FW-9 (DEC-9 provisional a); FW-10 landed the
 * exception-document machinery and GRADUATED unless_exception to fire when undischarged (DEC-9
 * mechanism / recommendation c), so the assertions below were CORRECTED (not exempted) where
 * that stage now fires — see the SUPERSEDED comments inline and progression-exception.test.mjs.
 * undetermined is honest (a one-document instance has no chain, so no invented grade); a
 * document that does not resolve to the entity cannot be threaded on it.
 *
 * Everything is driven THROUGH the control plane (a real caller's only route), so coverage
 * credits op=thread and op=instance on the control-plane surface, not only the store (D-43).
 *
 * NEGATIVE CONTROL: (1 — the missing-predecessor check, M4's gap) empty Store.#REQUIRED_FIRES (make it `new Set([])`) in store.mjs -> the missing 'solicitation' stage no longer surfaces, so op=instance finding_count 1->0 and the accepts-when "missing solicitation is a finding" assertions fail — the gap is hidden. (2 — the weakest-grade chain, D-73) make Store.#weakerGrade return the STRONGER end (swap the `<=` to `>=`) -> the need(A)→award(A)→contract(C) chain reads grade A not C, so "the instance grade is the weakest connection (C)" and "the finding carries the weak grade C" fail — a weak link is hidden. RUN 2026-07-31 framework-agent-fw9: (1) #REQUIRED_FIRES emptied -> the "exactly ONE missing-predecessor finding" assertion fails (finding_count 1->0) and the downstream finding[0] lookups then throw, so the suite is not green (the missing-predecessor check is load-bearing); restored. (2) #weakerGrade returns stronger -> 5 fail, 32 pass (the award→contract chain-link grade C->A; the instance grade C->A on both thread and instance read; the mirrored weakest-of-chain; the finding grade C->A); restored -> 37 pass, 0 fail.
 */
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
  bindings: { ADMIN_TOKEN: "adm-fw9", MEMBER_TOKEN: "mem-fw9", PROBE_TOKEN: "prb-fw9", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-fw9") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok = "mem-fw9") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ---- seed captured documents through the real FW-5 → FW-6 → FW-7 chain, exactly as the
   FW-8 connection suite does: promote a bundle whose data/provenance.json carries a crafted
   reading (FW-5 projects it into reading_refs), register the threading entity (FW-6), resolve
   each document's reference to it (FW-7). The instance threads those resolved documents. */
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
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-prog`;
  const md = bundleMd(id);
  const doc = { capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
                reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
                           at: NOW, entities } };
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: "20260724T010000Z_aaaa1111", author: "fw9",
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

/* the §8.1 grade rank, mirrored ONLY to assert the store's weakest-of-chain choice in the
   test's own terms (A strongest .. D weakest); the store owns the real rank. */
const weaker = (a, b) => { const r = { A: 4, B: 3, C: 2, D: 1 }; return (r[a] || 0) <= (r[b] || 0) ? a : b; };

console.log("\n--- register the threading entity (FW-6) and resolve the procurement documents to it (FW-7) ---");
/* The threading identifier is a contract/project number that runs through every stage
   (framework §8.3 — a shared identifier is what assembles a cross-system chain). */
const eContract = await post("entitycreate",
  { kind: "contract", label: "Recology Hauling Contract", aliases: ["contract:C-2024-88", "Recology Hauling Contract"] });
const cid = eContract.entity_id;
t("the threading contract entity is registered", eContract.ok, true);

const shaNeed = sha("proc-need");        // the staff report naming the anticipated contract number -> A
const shaAward = sha("proc-award");      // the award resolution naming the contract number -> A
const shaContract = sha("proc-contract"); // the signed contract, resolving by NAME only -> C
await promoteReading(shaNeed, [{ ref: "contract:C-2024-88", kind: "contract", key: "C-2024-88", label: "anticipated Recology contract" }]);
await promoteReading(shaAward, [{ ref: "contract:C-2024-88", kind: "contract", key: "C-2024-88", label: "Recology award" }]);
await promoteReading(shaContract, [{ ref: "contract:ZZ-0000", kind: "contract", key: "ZZ-0000", label: "Recology Hauling Contract" }]);

const rNeed = await post("resolve", { captureSha: shaNeed });
const rAward = await post("resolve", { captureSha: shaAward });
const rContract = await post("resolve", { captureSha: shaContract });
t("need and award resolve to the contract at grade A (the source's own composite identifier)",
  [rNeed.resolved[0].grade, rAward.resolved[0].grade], ["A", "A"]);
t("the signed contract resolves to the SAME entity by NAME correspondence only — grade C",
  [rContract.resolved[0].entity_id, rContract.resolved[0].grade], [cid, "C"]);

console.log("\n--- op=progressiondefine: the procurement definition, with a required, a deferred and non-required stages ---");
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

console.log("\n--- op=thread: thread need→award→contract MINUS the solicitation (the accepts-when) ---");
/* Before threading, the instance does not exist. */
t("op=instance is empty before any threading (found:false)",
  (await get("instance", "key=procurement&id=" + cid)).found, false);
const threaded = await post("thread", {
  progressionKey: "procurement", entityId: cid,
  placements: [
    { stage: "need", captureSha: shaNeed },
    { stage: "award", captureSha: shaAward },
    { stage: "contract", captureSha: shaContract },
  ],
});
t("three documents were threaded through the procurement definition", [threaded.ok, threaded.threaded], [true, 3]);
t("op=thread stamps the threading member from the session", threaded.threaded_by, "class:member");

console.log("\n--- N-stage weakest-grade inheritance: the instance grade is the weakest connection along the chain ---");
t("the chain is the placed stages in order: need → award → contract",
  threaded.chain.map((c) => `${c.from_stage}->${c.to_stage}`), ["need->award", "award->contract"]);
t("the need→award link is A—A -> grade A; the award→contract link is A—C -> grade C (the weaker end governs)",
  threaded.chain.map((c) => [c.from_stage, c.a_grade, c.b_grade, c.grade]),
  [["need", "A", "A", "A"], ["award", "A", "C", "C"]]);
t("the INSTANCE grade is the WEAKEST connection along the chain — grade C, not established (§8.1 weakest link)",
  [threaded.grade, threaded.grade_determined, threaded.established], ["C", true, false]);
t("the instance grade equals the mirrored weakest-of-chain (the store owns the rank, this checks it)",
  threaded.grade, [weaker("A", "A"), weaker("A", "C")].reduce((a, b) => weaker(a, b)));

console.log("\n--- the MISSING-PREDECESSOR finding (M4's acceptance) ---");
/* SUPERSEDED by FW-10 (the exception-document slice / DEC-9's mechanism). FW-9 asserted exactly
   ONE finding here because unless_exception was SILENT (DEC-9 provisional a — the exception-doc
   check did not exist). FW-10 builds that check, so unless_exception GRADUATES to dischargeable
   and fires when required-and-UNDISCHARGED (DEC-9 recommendation c). The 'recommendation' stage
   (unless_exception, absent, no exception document) now fires too, so TWO findings surface. The
   old "exactly ONE" was correct for FW-9's world and is corrected, not exempted. */
t("TWO missing-predecessor findings surface: solicitation (usually) and recommendation (unless_exception, undischarged — FW-10/DEC-9)",
  threaded.finding_count, 2);
const f = threaded.findings[0];  // findings are in stage order; solicitation (stage 2) precedes recommendation (stage 3)
t("the finding is the missing REQUIRED 'solicitation' stage (an award with no solicitation)",
  [f.kind, f.stage_key, f.required], ["missing_predecessor", "solicitation", "usually"]);
t("the finding CARRIES the instance's grade — the weakest grade the chain rests on (C)",
  [f.grade, f.grade_determined], ["C", true]);

console.log("\n--- requiredness is RESPECTED: a sometimes/never missing stage is NOT a finding ---");
t("the 'amendment' stage (never required), absent, produced NO finding",
  threaded.findings.some((x) => x.stage_key === "amendment"), false);
/* SUPERSEDED by FW-10: unless_exception is now DISCHARGEABLE and fires when undischarged (DEC-9's
   mechanism landed). This instance records NO exception document for 'recommendation', so it fires
   a dischargeable missing_predecessor finding. (FW-10's own suite proves that recording an exception
   document turns this back OFF — the discharged state.) */
t("the 'recommendation' stage (unless_exception, UNDISCHARGED), absent, now FIRES a dischargeable finding — FW-10/DEC-9",
  threaded.findings.some((x) => x.stage_key === "recommendation" && x.dischargeable === true), true);
t("the 'need' stage is present (placed), so it is not missing and not a finding",
  [threaded.stages.find((s) => s.stage_key === "need").present,
   threaded.findings.some((x) => x.stage_key === "need")], [true, false]);

console.log("\n--- op=instance: the persisted instance reads back with grade, chain and findings derived ---");
const inst = await get("instance", "key=procurement&id=" + cid);
/* SUPERSEDED by FW-10: finding_count is 2 now (solicitation + the graduated unless_exception
   recommendation), not 1 — same DEC-9 mechanism as above. Grade and the visible solicitation gap
   are unchanged. */
t("the instance reads back found, at grade C, with two findings",
  [inst.found, inst.grade, inst.finding_count], [true, "C", 2]);
t("the missing solicitation is VISIBLE on read (the M4 capability)",
  inst.findings[0].stage_key, "solicitation");
t("the placed stages carry their document and its end-grade; missing stages carry no document",
  [inst.stages.find((s) => s.stage_key === "award").grade,
   inst.stages.find((s) => s.stage_key === "contract").grade,
   inst.stages.find((s) => s.stage_key === "solicitation").present], ["A", "C", false]);

console.log("\n--- undetermined is HONEST: a one-document instance has no chain, so no invented grade ---");
const eSolo = await post("entitycreate", { kind: "contract", label: "Solo Contract", aliases: ["contract:SOLO-1"] });
const solo = eSolo.entity_id;
const shaSolo = sha("proc-solo-award");
await promoteReading(shaSolo, [{ ref: "contract:SOLO-1", kind: "contract", key: "SOLO-1", label: "solo award" }]);
await post("resolve", { captureSha: shaSolo });
const soloInst = await post("thread", { progressionKey: "procurement", entityId: solo,
  placements: [{ stage: "award", captureSha: shaSolo }] });
t("a one-document instance has an UNDETERMINED grade — never invented (undetermined is first-class)",
  [soloInst.grade, soloInst.grade_determined, soloInst.chain.length], [null, false, 0]);
t("its missing-required findings carry 'undetermined', not a fabricated grade",
  soloInst.findings.every((x) => x.grade === "undetermined" && x.grade_determined === false), true);
t("the missing 'contract' stage (always) IS a finding even when the grade is undetermined",
  soloInst.findings.some((x) => x.stage_key === "contract"), true);

console.log("\n--- a document that does not resolve to the entity CANNOT be threaded on it ---");
t("threading a capture that does not concern the entity is refused NOT_CONCERNED",
  (await post("thread", { progressionKey: "procurement", entityId: cid,
     placements: [{ stage: "award", captureSha: shaSolo }] })).reason, "NOT_CONCERNED");

console.log("\n--- op=thread refuses a malformed thread by name ---");
t("no progression key is refused", (await post("thread", { entityId: cid, placements: [{ stage: "award", captureSha: shaAward }] })).reason, "NO_KEY");
t("no entity is refused", (await post("thread", { progressionKey: "procurement", placements: [{ stage: "award", captureSha: shaAward }] })).reason, "NO_ENTITY");
t("no placements is refused", (await post("thread", { progressionKey: "procurement", entityId: cid, placements: [] })).reason, "NO_PLACEMENTS");
t("an unknown progression is refused", (await post("thread", { progressionKey: "ghost", entityId: cid, placements: [{ stage: "a", captureSha: shaAward }] })).reason, "NO_SUCH_PROGRESSION");
t("an unregistered entity is refused", (await post("thread", { progressionKey: "procurement", entityId: "ENT-nope", placements: [{ stage: "award", captureSha: shaAward }] })).reason, "NO_SUCH_ENTITY");
t("a stage that is not in the definition is refused BAD_STAGE",
  (await post("thread", { progressionKey: "procurement", entityId: cid, placements: [{ stage: "ghoststage", captureSha: shaAward }] })).reason, "BAD_STAGE");
t("the same document placed at one stage twice is refused DUPLICATE_PLACEMENT",
  (await post("thread", { progressionKey: "procurement", entityId: cid,
     placements: [{ stage: "award", captureSha: shaAward }, { stage: "award", captureSha: shaAward }] })).reason, "DUPLICATE_PLACEMENT");
t("op=instance with no key is refused by name", (await get("instance", "id=" + cid)).reason, "NO_KEY");

console.log("\n--- re-threading REPLACES the instance's placements (an instance is editable data) ---");
const rethread = await post("thread", { progressionKey: "procurement", entityId: cid,
  placements: [{ stage: "award", captureSha: shaAward }, { stage: "contract", captureSha: shaContract }] });
t("re-threading drops the need placement — the instance now holds award and contract only",
  [rethread.threaded, rethread.stages.filter((s) => s.present).map((s) => s.stage_key)],
  [2, ["award", "contract"]]);
/* re-thread the full chain back for the purge assertions below */
await post("thread", { progressionKey: "procurement", entityId: cid,
  placements: [{ stage: "need", captureSha: shaNeed }, { stage: "award", captureSha: shaAward }, { stage: "contract", captureSha: shaContract }] });

console.log("\n--- purge clears progression instances (D-113) ---");
const beforeInst = (await get("instance", "key=procurement&id=" + cid)).placed_count;
t("before purge the instance holds threaded documents", beforeInst > 0, true);
const purge = rP(await (await mf.dispatchFetch(
  "http://x/api/?op=purge&token=adm-fw9&confirm=bio", { method: "POST" })).json());
t("a whole-store purge REPORTS the progression instances it removed (not silent)",
  purge.removed.progressionInstances > 0, true);
t("after purge the store holds zero progression instances",
  purge.after.progressionInstances, 0);
t("after purge op=instance finds nothing for an entity that had an instance",
  (await get("instance", "key=procurement&id=" + cid)).found, false);

await mf.dispose();
console.log(`\nprogression-instance: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
