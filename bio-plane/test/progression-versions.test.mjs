/* THE DECLARED FLOW, AND ITS REVISIONS (D-128; framework §8.2 "The declared flow, and its
 * revisions", RULED 2026-09-22 by BOB #27). A progression definition is the group's DECLARED flow
 * — its claim about how a body ought to behave, authored and dated. Until D-128 `op=progressiondefine`
 * UPSERTED it (`progression_defs ON CONFLICT … DO UPDATE`, the stages deleted and rewritten), so a
 * group's earlier declared flow disappeared silently and a finding read against it lost its basis.
 *
 * Now a definition is APPEND-ONLY: a revision writes version N+1 carrying its author, date and BASIS
 * (the member's statement and a citation — both required on a revision, the anatomy an exception
 * document carries); the prior version stands and reads back through `op=progression&version=N`;
 * and an instance read, each finding (missing_predecessor, overdue_successor), each discharge, the
 * proposal feed and the per-document lookup NAME the version they were read against.
 *
 * HOW A LIAR PASSES (the row's own): a history table no read consults. So the prior-version arm
 * takes the version a FINDING named and reads THAT version back THROUGH THE OP, and asserts the
 * stage the finding accused is there with the requiredness that made it fire.
 *
 * Everything is driven through the control plane (a real caller's only route).
 *
 * NEGATIVE CONTROL: (run 2026-09-23, D-128) each arm ALONE, restored from a per-arm pristine copy of
 * src/store.mjs verified by sha256 AND `cmp` (2,892,228 bytes, 4c4c2c34597d… before and after every arm).
 * (0) baseline -> 36 pass 0 fail. (1) THE ROW'S OWN — restore the overwrite: in defineProgression's
 * transaction `DELETE FROM progression_def_versions` and `progression_stage_versions` for the key before
 * the writes -> 28/8, first at "PRIOR VERSION: the version the finding named reads back through the op",
 * then every arm that reads an earlier version (the version list, "three versions stand", version 2's
 * basis after version 3). (2) THE LIAR — readProgression ignores `version` and always answers the
 * current -> 31/5, at the same three PRIOR VERSION assertions, "a version the record does not hold is
 * refused" and "version 2 still reads back with its own basis". (3) drop `definition_version` from
 * #assembleInstance's missing_predecessor finding -> 30/6, at "the finding NAMES the version it was read
 * against", the three PRIOR VERSION assertions (the version read is then undefined) and the op=proposals
 * and op=captureprogressions arms. Arm 3's first draft DID NOT ARM — its anchor occurred twice (the
 * discharge carries the same line) — and was re-armed on the finding's own push. (4) OVER-STRICTNESS is
 * an assertion, green at baseline: the identical re-definition sent in the `stageKey`/`afterStage`
 * spelling reads UNCHANGED, so a revision detector keyed on spelling fails it by name.
 * WHAT IT CANNOT SEE: the legacy path — a definition declared BEFORE D-128, with no version rows, read
 * as version 1 and backfilled on its first revision — because no op can write a definition without its
 * version row; that path is reasoned from #progressionCurrent's `version_recorded`, not driven.
 */
import { statedJSON } from "./stated.mjs";
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
  bindings: { ADMIN_TOKEN: "adm-d128", MEMBER_TOKEN: "mem-d128", PROBE_TOKEN: "prb-d128", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-d128") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok = "mem-d128") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ---- seed captured documents through the real promote → resolve chain, as
   progression-instance.test.mjs does. */
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
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-d128`;
  const md = bundleMd(id);
  const doc = { capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
                reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
                           at: NOW, entities } };
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: "20260724T010000Z_aaaa1111", author: "d128",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Doc ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  });
  return r.ok !== false;
};

console.log("\n--- seed: a contract entity and two documents resolved to it ---");
const ent = await post("entitycreate",
  { kind: "contract", label: "Hauling Contract", aliases: ["contract:C-2024-88"] });
const eid = ent.entity_id;
t("the threading entity is registered", ent.ok, true);
const shaAward = sha("d128-award"), shaContract = sha("d128-contract");
t("both documents are promoted",
  [await promoteReading(shaAward, [{ ref: "contract:C-2024-88", kind: "contract", key: "C-2024-88", label: "award" }]),
   await promoteReading(shaContract, [{ ref: "contract:C-2024-88", kind: "contract", key: "C-2024-88", label: "contract" }])],
  [true, true]);
await post("resolve", { captureSha: shaAward });
await post("resolve", { captureSha: shaContract });

const V1_STAGES = [
  { key: "solicitation", label: "RFP", cardinality: "0..1", required: "usually" },
  { key: "award", label: "council resolution", after: "solicitation", cardinality: "1", required: "always" },
  { key: "contract", label: "signed agreement", after: "award", cardinality: "1", required: "always" },
];

console.log("\n--- version 1: the first declaration; its basis may be stated, and is not demanded ---");
const v1 = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement", stages: V1_STAGES });
t("the first declaration is version 1, no prior version", [v1.ok, v1.version, v1.prior_version, v1.unchanged], [true, 1, null, false]);
t("its basis reads back as NOT STATED rather than invented",
  v1.basis, { statement: null, citation: null, stated: false });
t("the declaring member is stamped server-side", v1.declared_by, "class:member");

console.log("\n--- an instance read against version 1, and the finding it raises ---");
const inst1 = await post("thread", { progressionKey: "procurement", entityId: eid,
  placements: [{ stage: "award", captureSha: shaAward }, { stage: "contract", captureSha: shaContract }] });
t("the instance is threaded", [inst1.ok, inst1.threaded], [true, 2]);
t("the instance NAMES the version it was read against", inst1.definition_version, 1);
const f1 = (inst1.findings || []).find((f) => f.stage_key === "solicitation");
t("an award with no solicitation is a missing_predecessor finding", f1 && [f1.kind, f1.required], ["missing_predecessor", "usually"]);
t("the finding NAMES the version it was read against", f1 && f1.definition_version, 1);

console.log("\n--- a re-declaration identical to the current version is not a revision ---");
const same = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement",
  stages: V1_STAGES.map((s) => ({ stageKey: s.key, label: s.label, afterStage: s.after, cardinality: s.cardinality, required: s.required })) });
t("OVER-STRICTNESS: identical content in the stageKey/afterStage spelling is UNCHANGED, version 1, no basis asked",
  [same.ok, same.unchanged, same.version], [true, true, 1]);

console.log("\n--- a revision must state its basis: the member's statement AND a citation ---");
const V2_STAGES = [
  { key: "solicitation", label: "RFP", cardinality: "0..1", required: "sometimes" },
  V1_STAGES[1], V1_STAGES[2],
];
const noBasis = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement", stages: V2_STAGES });
t("a revision with no basis is refused by name, naming the version that stands",
  [noBasis.ok, noBasis.reason, noBasis.version], [false, "NO_BASIS", 1]);
const noCite = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement", stages: V2_STAGES,
  basis: "Contracts under $50,000 may be awarded without a formal solicitation." });
t("a revision with a statement and no citation is refused by name", [noCite.ok, noCite.reason], [false, "NO_CITATION"]);
t("neither refusal wrote anything: the current version is still 1",
  (await get("progression", "key=procurement")).version, 1);
const badStage = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement",
  stages: [...V2_STAGES, { key: "x", cardinality: "1", required: "always", after: "nowhere" }] });
t("a bad stage is judged BEFORE the missing basis (the UI's preflight probe still hears UNKNOWN_AFTER)",
  badStage.reason, "UNKNOWN_AFTER");

console.log("\n--- version 2: the revision, carrying its basis ---");
const BASIS = "Contracts under $50,000 may be awarded without a formal solicitation.";
const CITE = "Oakland Municipal Code 2.04.050";
const v2 = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement", stages: V2_STAGES,
  basis: BASIS, citation: CITE });
t("the revision is version 2, naming version 1 as its prior", [v2.ok, v2.version, v2.prior_version, v2.unchanged], [true, 2, 1, false]);
t("the revision carries its basis", v2.basis, { statement: BASIS, citation: CITE, stated: true });

console.log("\n--- the PRIOR VERSION stands and reads back, through the op, at the version the finding named ---");
const prior = await get("progression", `key=procurement&version=${f1 && f1.definition_version}`);
t("PRIOR VERSION: the version the finding named reads back through the op",
  [prior.ok, prior.found, prior.version, prior.current], [true, true, 1, false]);
const priorSol = (prior.stages || []).find((s) => s.stage_key === "solicitation");
t("PRIOR VERSION: the stage the finding accused is there, with the requiredness that made it fire",
  priorSol && priorSol.required, "usually");
t("PRIOR VERSION: its author, date and (unstated) basis read back",
  [prior.declared_by, typeof prior.at === "string" && prior.at.length > 0, prior.basis && prior.basis.stated],
  ["class:member", true, false]);
const nowDef = await get("progression", "key=procurement");
t("the current read is version 2, current, and lists both versions",
  [nowDef.version, nowDef.current, nowDef.current_version, nowDef.version_count, (nowDef.versions || []).map((v) => v.version)],
  [2, true, 2, 2, [1, 2]]);
t("the current read carries the revision's basis", nowDef.basis, { statement: BASIS, citation: CITE, stated: true });
t("the current stages are the revised ones",
  (nowDef.stages || []).find((s) => s.stage_key === "solicitation").required, "sometimes");
t("the version list carries each version's basis",
  (nowDef.versions || []).map((v) => v.basis.stated), [false, true]);
const missing = await get("progression", "key=procurement&version=7");
t("a version the record does not hold is refused, naming the versions it holds",
  [missing.ok, missing.reason, missing.current_version], [false, "NOT_FOUND", 2]);

console.log("\n--- instance reads now name version 2 ---");
const inst2 = await get("instance", `key=procurement&id=${eid}`);
t("the instance is read against version 2", inst2.definition_version, 2);
t("under version 2 the skipped solicitation ('sometimes') is no finding",
  (inst2.findings || []).filter((f) => f.stage_key === "solicitation").length, 0);
t("the version-1 finding is still accounted for: the version it named is still readable",
  (await get("progression", "key=procurement&version=1")).found, true);

console.log("\n--- version 3, restoring the solicitation; every finding surface names it ---");
const v3 = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement", stages: V1_STAGES,
  basis: "The threshold exception was repealed.", citation: "Ordinance 13,999 C.M.S." });
t("the third declaration is version 3 — an old shape re-declared is a NEW version, not a rewind",
  [v3.version, v3.prior_version], [3, 2]);
const props = await get("proposals", "");
const pInst = (props.instances || []).find((i) => i.progression_key === "procurement" && i.entity_id === eid);
t("op=proposals: the instance and each of its findings name version 3",
  pInst && [pInst.definition_version, ...(pInst.findings || []).map((f) => f.definition_version)], [3, 3]);
const pProp = (props.proposals || []).find((p) => p.progression_key === "procurement" && p.stage_key === "solicitation");
t("op=proposals: the aggregated proposal names version 3", pProp && pProp.definition_version, 3);
const cp = await get("captureprogressions", `sha256=${shaAward}`);
t("op=captureprogressions: the instance and its findings name version 3",
  cp.instances && cp.instances[0] && [cp.instances[0].definition_version, ...cp.instances[0].findings.map((f) => f.definition_version)],
  [3, 3]);
const all = await get("progression", "key=procurement");
t("three versions stand", (all.versions || []).map((v) => v.version), [1, 2, 3]);
t("version 2 still reads back with its own basis after version 3",
  (await get("progression", "key=procurement&version=2")).basis, { statement: BASIS, citation: CITE, stated: true });

console.log("\n--- a whole-store purge clears every version (the scratch-reset tool) ---");
const purge = rP(await (await mf.dispatchFetch(
  "http://x/api/?op=purge&token=adm-d128&confirm=bio", { method: "POST" })).json());
t("the purge ran", purge.ok !== false, true);
t("after purge the definition is gone", (await get("progression", "key=procurement")).found, false);
const again = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement", stages: V1_STAGES });
t("after purge a declaration starts again at version 1 (no orphan version survived)", [again.ok, again.version], [true, 1]);

await mf.dispose();
console.log(`\nprogression-versions: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
