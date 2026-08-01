/* CONNECTIONS AS DATA carrying a GRADE, and the PROGRESSION DEFINITION as data
 * (CONSTRUCTS Step 5 SLICE A / FW-8; framework §8, §8.1, §8.2). Absorbs D-67
 * (connections were emitted and stored nowhere) and D-72 (connections had no grade).
 *
 * A CONNECTION is the two-node base case of a progression: two captured documents that
 * resolve (FW-7) to the SAME registry entity (FW-6) are connected, because two documents
 * concerning one subject is the raw material of a connection. op=connect DERIVES the
 * connections among the documents op=concerns already joins — built UNDER that reverse
 * index, not a parallel path — and each connection carries the §8.1 GRADE of its WEAKER
 * end (framework §8.2: "a progression instance inherits the weakest connection grade along
 * its chain", here the two-node case). established derives from the WEAKER grade, so a
 * connection resting on a Grade C correspondence at either end is NEVER established.
 * asserted_by is three-valued and DISTINCT from grade (framework:554): a derived
 * connection is 'system'-asserted, and a caller cannot pass it off as source/member.
 *
 * The PROGRESSION DEFINITION generalises the connection table (framework §8.2): an ordered
 * set of stages carrying after / cardinality / interval / required-ness, as DATA. BOTH of
 * Bob's example progressions must be expressible as rows — meeting→agenda→minutes AND
 * need→award→signed-contract — or the generalisation has not been made (the acceptance).
 *
 * Everything is driven THROUGH the control plane (op=…, a real caller's only route), so
 * coverage credits op=connect, op=connections, op=progressiondefine and op=progression on
 * the control-plane surface, not only the store (the D-43 class).
 *
 * NEGATIVE CONTROL: (1 — D-72, the grade) make Store.#weakerGrade return the STRONGER grade (swap the <= to >= so it returns the higher-rank end) in store.mjs -> a C-weak connection is stored graded A and established:true, so op=connect/op=connections report it established and the "the WEAKER end governs -> grade C, not established" and "carries the weaker of its two ends" assertions flip (the connection no longer carries its honest weakest grade, D-72 regressed). (2 — D-67, the persist) disable the `INSERT INTO connections` in Store.deriveConnections (guard it `if (false)`) -> op=connect still REPORTS connections formed but nothing is stored, so op=connections returns nothing for a pair known to concern the entity (the connection is emitted and stored nowhere, D-67 regressed). RUN 2026-07-31 framework-agent-fw8: (1) #weakerGrade returns stronger -> 2 fail (the A—C weaker-end grade/established assertion + the weaker-of-two assertion), 39 pass; restored. (2) INSERT disabled -> op=connect reports count 3 but op=connections(E_ORD) count 3->0 and by-capture 2->0 (2 fail, then the downstream reads that depend on a stored connection crash — the persist is load-bearing); restored -> 41 pass, 0 fail.
 */
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
  bindings: { ADMIN_TOKEN: "adm-fw8", MEMBER_TOKEN: "mem-fw8", PROBE_TOKEN: "prb-fw8", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-fw8") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok = "mem-fw8") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ---- seed captured documents by promoting a bundle whose data/provenance.json carries a
   crafted reading (FW-5 projects it into reading_refs at promote), then resolve each
   document's references to the registry (FW-7). The connection is DERIVED from those
   resolutions, so this is the real FW-5 → FW-6 → FW-7 → FW-8 chain, not a shortcut. */
const NOW = "2026-07-24T00:00:00Z";
let bseq = 0;
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Resolution ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Resolution bundle.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const promoteReading = async (captureSha, entities) => {
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-conn`;
  const md = bundleMd(id);
  const doc = { capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
                reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
                           at: NOW, entities } };
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: "20260724T010000Z_aaaa1111", author: "fw8",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Resolution ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  });
  return { id, ok: r.ok !== false };
};

const shaA = sha("conn-doc-A");   // concerns the ordinance (A) AND the contract (B)
const shaB = sha("conn-doc-B");   // concerns the ordinance (A)
const shaC = sha("conn-doc-C");   // concerns the ordinance by NAME only (C), later raised to A

console.log("\n--- build the registry (FW-6) and the resolutions (FW-7) the connections derive from ---");
const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Rent Adjustment Ordinance", aliases: ["ordinance:13579", "Rent Adjustment Ordinance"] });
const ordId = eOrd.entity_id;
const eCon = await post("entitycreate", { kind: "contract", label: "Recology Waste Contract", aliases: ["C-2024-88"] });
const conId = eCon.entity_id;
t("two entities registered", [eOrd.ok, eCon.ok], [true, true]);

await promoteReading(shaA, [
  { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579" },
  { ref: "contract:C-2024-88", kind: "contract", key: "C-2024-88", label: "Recology Contract" },
]);
await promoteReading(shaB, [{ ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance 13579" }]);
await promoteReading(shaC, [{ ref: "ordinance:99999", kind: "ordinance", key: "99999", label: "Rent Adjustment Ordinance" }]);

const rA = await post("resolve", { captureSha: shaA });
const rB = await post("resolve", { captureSha: shaB });
const rC = await post("resolve", { captureSha: shaC });
const rAby = Object.fromEntries(rA.resolved.map((m) => [m.entity_id, m.grade]));
t("shaA resolves the ordinance at A and the contract at B", [rAby[ordId], rAby[conId]], ["A", "B"]);
t("shaB resolves the ordinance at A", rB.resolved[0].grade, "A");
t("shaC resolves the ordinance by NAME correspondence only — grade C",
  [rC.resolved[0].entity_id, rC.resolved[0].grade], [ordId, "C"]);

console.log("\n--- op=connect: DERIVE connections among the documents that concern the ordinance ---");
/* Before deriving, there are no stored connections — the connection depends on op=connect
   (negative control 2, shown constructively). */
t("op=connections is EMPTY before any derivation (the connection depends on op=connect)",
  (await get("connections", "id=" + ordId)).count, 0);
const conn = await post("connect", { entityId: ordId });
t("op=connect reports it saw three documents concerning the ordinance", conn.documents, 3);
t("three pairwise connections were formed (shaA-shaB, shaA-shaC, shaB-shaC)", conn.count, 3);

const key = (c) => [c.a_capture_sha, c.b_capture_sha].sort().join("|");
const byPair = Object.fromEntries(conn.connections.map((c) => [key(c), c]));
const pAB = byPair[[shaA, shaB].sort().join("|")];
const pAC = byPair[[shaA, shaC].sort().join("|")];
t("A—A: two ends both at grade A -> the connection is grade A and ESTABLISHED",
  [pAB.a_grade, pAB.b_grade, pAB.grade, pAB.established], ["A", "A", "A", true]);
t("A—C: the WEAKER end governs -> the connection is grade C and NOT established (§8.1 weakest link)",
  [pAC.grade, pAC.established, pAC.needs_confirmation], ["C", false, true]);
t("a connection carries its GRADE as the weaker of its two ends (D-72: connections now graded)",
  [Store_min(pAC.a_grade, pAC.b_grade)], [pAC.grade]);
t("a derived connection is asserted_by the SYSTEM, DISTINCT from its grade (framework:554)",
  [...new Set(conn.connections.map((c) => c.asserted_by))], ["system"]);

console.log("\n--- op=connections: a persisted connection is RETRIEVABLE, by entity and by capture ---");
const byEnt = await get("connections", "id=" + ordId);
t("every connection through the ordinance is retrievable (D-67: connections now stored)", byEnt.count, 3);
const byCap = await get("connections", "sha256=" + shaA);
t("connections a document is an end of are retrievable by its capture sha (either side)", byCap.count, 2);
t("the retrieved connection carries the grade, both ends, established and asserted_by",
  (() => { const c = byCap.connections.find((x) => key(x) === [shaA, shaB].sort().join("|"));
           return [c.grade, c.established, c.asserted_by]; })(), ["A", true, "system"]);

console.log("\n--- a single-document subject yields NO connection (a connection needs two ends) ---");
const connC = await post("connect", { entityId: conId });
t("only shaA concerns the contract, so no pair, so no connection", [connC.documents, connC.count], [1, 0]);

console.log("\n--- asserted_by cannot be spoofed: a caller passing 'source' still stores 'system' ---");
const spoof = await post("connect", { entityId: ordId, assertedBy: "source" });
t("a caller-supplied asserted_by is overridden server-side to 'system'",
  [...new Set(spoof.connections.map((c) => c.asserted_by))], ["system"]);

console.log("\n--- grade is IMPROVABLE: raise shaC's resolution to A, re-derive, the connection improves IN PLACE ---");
await post("entityalias", { entityId: ordId, alias: "ordinance:99999" });
const rC2 = await post("resolve", { captureSha: shaC });
t("shaC now resolves the ordinance at A (the identifier was registered)", rC2.resolved[0].grade, "A");
const conn2 = await post("connect", { entityId: ordId });
const pAC2 = Object.fromEntries(conn2.connections.map((c) => [key(c), c]))[[shaA, shaC].sort().join("|")];
t("the A—C connection is RAISED to A and now established — improved in place, still 3 connections",
  [conn2.count, pAC2.grade, pAC2.established], [3, "A", true]);
t("op=connections reflects the raised grade (the same row, not a duplicate)",
  (await get("connections", "id=" + ordId)).count, 3);

console.log("\n--- op=progressiondefine: BOTH example progressions are expressible as rows (the acceptance) ---");
/* meeting → agenda → minutes: one system, days, linear. */
const meeting = await post("progressiondefine", {
  progressionKey: "meeting", label: "Public meeting",
  stages: [
    { key: "meeting", label: "scheduled meeting", cardinality: "1", required: "always" },
    { key: "agenda", label: "agenda", after: "meeting", cardinality: "0..1", within: "before the meeting", required: "usually" },
    { key: "minutes", label: "minutes", after: "meeting", cardinality: "0..1", within: "21 days", required: "usually" },
  ],
});
t("the meeting progression is defined with three stages", [meeting.ok, meeting.stage_count], [true, 3]);
/* need → budget_request → … → award → signed contract: several systems, years, branching. */
const proc = await post("progressiondefine", {
  progressionKey: "procurement", label: "Procurement",
  stages: [
    { key: "need", label: "staff report", cardinality: "0..n", required: "sometimes" },
    { key: "budget_request", label: "budget document", after: "need", cardinality: "0..n", required: "usually" },
    { key: "budget_approval", label: "council action", after: "budget_request", cardinality: "1", within: "1 year", required: "always" },
    { key: "solicitation", label: "RFP / RFQ / IFB", after: "budget_approval", cardinality: "0..1", required: "unless_exception" },
    { key: "responses", label: "bid list / proposals", after: "solicitation", cardinality: "0..n", within: "by due date", required: "usually" },
    { key: "recommendation", label: "staff report", after: "responses", cardinality: "0..1", required: "usually" },
    { key: "award", label: "council resolution", after: "recommendation", cardinality: "1", required: "always" },
    { key: "contract", label: "signed agreement", after: "award", cardinality: "1", within: "90 days", required: "always" },
    { key: "amendment", label: "change order", after: "contract", cardinality: "0..n", required: "never" },
  ],
});
t("the procurement progression is defined with nine stages", [proc.ok, proc.stage_count], [true, 9]);

const mRead = await get("progression", "key=meeting");
t("the meeting chain reads back as ordered stages meeting→agenda→minutes",
  mRead.stages.map((s) => s.stage_key), ["meeting", "agenda", "minutes"]);
t("each stage carries after / cardinality / interval / required-ness as DATA",
  mRead.stages.map((s) => [s.stage_key, s.after_stage, s.cardinality, s.within_interval, s.required]),
  [["meeting", null, "1", null, "always"],
   ["agenda", "meeting", "0..1", "before the meeting", "usually"],
   ["minutes", "meeting", "0..1", "21 days", "usually"]]);
const pRead = await get("progression", "key=procurement");
t("the procurement chain reads back need→…→award→contract, need is the head (no predecessor)",
  [pRead.stages.map((s) => s.stage_key).join(">"), pRead.stages[0].after_stage],
  ["need>budget_request>budget_approval>solicitation>responses>recommendation>award>contract>amendment", null]);
t("the award→contract link and its 90-day interval are DATA (framework §8.2 procurement row 8)",
  (() => { const c = pRead.stages.find((s) => s.stage_key === "contract");
           return [c.after_stage, c.within_interval, c.required]; })(),
  ["award", "90 days", "always"]);
t("the sole-source-able stage records unless_exception (a lawful skip needs an exception doc — slice B)",
  pRead.stages.find((s) => s.stage_key === "solicitation").required, "unless_exception");

console.log("\n--- a definition is editable data: re-defining a key REPLACES its stages ---");
const redef = await post("progressiondefine", {
  progressionKey: "meeting", label: "Public meeting (with attendance)",
  stages: [
    { key: "meeting", cardinality: "1", required: "always" },
    { key: "agenda", after: "meeting", cardinality: "0..1", required: "usually" },
    { key: "attendance", after: "meeting", cardinality: "0..1", required: "usually" },
    { key: "minutes", after: "meeting", cardinality: "0..1", within: "21 days", required: "usually" },
  ],
});
t("re-defining meeting now has four stages (the old three did not accumulate)",
  [redef.stage_count, (await get("progression", "key=meeting")).stages.length], [4, 4]);
t("a progression definition stamps its declaring member from the session",
  redef.declared_by, "class:member");

console.log("\n--- op=progressiondefine refuses a malformed definition by name ---");
t("no key is refused", (await post("progressiondefine", { label: "x", stages: [{ key: "a", cardinality: "1", required: "always" }] })).reason, "NO_KEY");
t("no stages is refused", (await post("progressiondefine", { progressionKey: "z", label: "x", stages: [] })).reason, "NO_STAGES");
t("an unknown requiredness is refused",
  (await post("progressiondefine", { progressionKey: "z", label: "x", stages: [{ key: "a", cardinality: "1", required: "maybe" }] })).reason,
  "BAD_REQUIRED");
t("a stage after a non-existent stage is refused",
  (await post("progressiondefine", { progressionKey: "z", label: "x", stages: [{ key: "a", after: "ghost", cardinality: "1", required: "always" }] })).reason,
  "UNKNOWN_AFTER");
t("a duplicate stage key is refused",
  (await post("progressiondefine", { progressionKey: "z", label: "x", stages: [{ key: "a", cardinality: "1", required: "always" }, { key: "a", cardinality: "1", required: "never" }] })).reason,
  "DUPLICATE_STAGE");
t("op=connect with no entity is refused by name", (await post("connect", {})).reason, "NO_ENTITY");
t("op=connections with neither key is refused by name", (await get("connections", "")).reason, "NO_KEY");
t("op=progression for an unknown key answers found:false, not an error",
  (await get("progression", "key=nope")).found, false);

console.log("\n--- purge clears connections AND progression definitions (D-113) ---");
const beforeConn = (await get("connections", "id=" + ordId)).count;
const beforeProg = (await get("progression", "key=procurement")).found;
t("before purge there are connections and a progression definition", [beforeConn > 0, beforeProg], [true, true]);
const purge = rP(await (await mf.dispatchFetch(
  "http://x/api/?op=purge&token=adm-fw8&confirm=bio", { method: "POST" })).json());
t("a whole-store purge REPORTS the connections and progression rows it removed (not silent)",
  [purge.removed.connections > 0, purge.removed.progressionDefs > 0, purge.removed.progressionStages > 0],
  [true, true, true]);
t("after purge the store holds zero connections and zero progression definitions",
  [purge.after.connections, purge.after.progressionDefs, purge.after.progressionStages], [0, 0, 0]);
t("after purge op=connections is empty for an entity that had connections",
  (await get("connections", "id=" + ordId)).count, 0);
t("after purge op=progression finds nothing for a defined key",
  (await get("progression", "key=procurement")).found, false);

await mf.dispose();
console.log(`\nconnection: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

/* the §8.1 grade rank, mirrored here only to ASSERT the store's weaker-of-two choice in
   the test's own terms (A strongest .. D weakest); the store owns the real rank. */
function Store_min(g1, g2) { const r = { A: 4, B: 3, C: 2, D: 1 }; return (r[g1] || 0) <= (r[g2] || 0) ? g1 : g2; }
