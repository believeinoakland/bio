/* The RECOGNISERS: resolving a reading reference to a registry entity, and declaring
 * the method — which IS the framework's §8.1 connection grade (CONSTRUCTS Step 4
 * SLICE B / FW-7). This is the grading mechanism for referential connections and it
 * delivers the reverse index — "every document that concerns this entity" — the single
 * largest manual task the framework removes.
 *
 * FW-5 persisted readings and indexed every entity by its RAW reference (kind:key,
 * unresolved). FW-6 built the SUBJECT REGISTRY (entities + first-class aliases +
 * constitutive relations). FW-7 joins them: op=resolve matches a raw reference to an
 * entity and DECLARES THE GRADE FROM HOW IT MATCHED —
 *   A  the reference's composite key (kind:key) matched a registered IDENTIFIER exactly
 *      (the source's own identifier names the subject, both ends captured);
 *   B  the bare key matched a registered identifier exactly (an identifier the source
 *      uses, in content, at both ends), but not as the composite addressing key;
 *   C  the LABEL (a name/title) matched an entity ALIAS — correspondence, never
 *      established, flagged for a member to confirm.
 * A reference matching nothing stays honestly UNRESOLVED (never force-matched). The
 * recogniser NEVER mints a D; grade D is member TESTIMONY (op=resolvetestify), recorded
 * with an author and a date. Grade is IMPROVABLE: keyed (capture_sha, ref, entity_id),
 * a re-resolution that finds a stronger basis RAISES the grade IN PLACE, not a new row.
 *
 * Everything is driven THROUGH the control plane (op=…, a real caller's only route),
 * so coverage credits the control-plane surface, not only the store (the D-43 class).
 *
 * Two load-bearing negative controls, both RUN:
 *   (a) a Grade C resolution must never read back as established;
 *   (b) the reverse index (op=concerns) must depend on the resolver — dropping the
 *       resolution write empties it for a document known to concern the entity.
 *
 * NEGATIVE CONTROL: (a) make Store.#isEstablished return true for "C" in store.mjs -> op=resolutions and op=concerns report a Grade C correspondence as established:true (the "a C is never established" assertions flip). (b) neutralise the INSERT in Store.#upsertResolution -> op=resolve still REPORTS resolved but nothing is stored, so op=resolutions and the reverse index op=concerns empty for a document known to concern the entity. RUN 2026-07-31 framework-agent-fw7: (a) #isEstablished("C")=true -> 3 fail (the grade-C established assertion, the resolutions established:false, and the concerns established:false); (b) INSERT dropped -> resolutions(shaA) count 3->0 (and the reverse index concerns(E_ORD) 2->0), so the document known to concern the ordinance vanishes from the index. Both restored -> 39 pass, 0 fail.
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
  bindings: { ADMIN_TOKEN: "adm-fw7", MEMBER_TOKEN: "mem-fw7", PROBE_TOKEN: "prb-fw7", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-fw7") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok = "mem-fw7") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ---- seed captured documents by promoting a bundle whose data/provenance.json
   carries a crafted reading. #writeReadings (FW-5) projects the reading's entities
   into reading_refs exactly as op=promote does for a real acquire, so the references
   the recogniser resolves are the ones a promoted capture really holds. The reading is
   crafted here (not read from a doctype) so the ref/key/label the grade turns on are
   pinned, deterministic, and independent of the reader. */
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
/* Promote a captured document with the given capture sha and reading entities. */
const promoteReading = async (captureSha, entities) => {
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-res`;
  const md = bundleMd(id);
  const doc = { capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
                reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
                           at: NOW, entities } };
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: "20260724T010000Z_aaaa1111", author: "fw7",
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

/* Capture shas — fabricated, 64-hex, standing in for real reassembled-whole hashes. */
const shaA = sha("doc-A");   // carries an A, a B, a C, and an unresolvable reference
const shaB = sha("doc-B");   // carries the SAME ordinance reference as shaA (an A)
const shaC = sha("doc-C");   // the improvability document: a C that will be raised to A
const shaD = sha("doc-D");   // the testimony document: a reference no entity matches

console.log("\n--- build the SUBJECT REGISTRY (FW-6): entities the references will resolve to ---");
/* E_ORD carries the source's COMPOSITE identifier as an alias -> a reference of that
   exact composite key grades A. */
const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Rent Adjustment Ordinance", aliases: ["ordinance:13579"] });
t("ordinance entity created", eOrd.ok, true);
const ordId = eOrd.entity_id;
/* E_CON carries only the BARE identifier as an alias -> the composite won't match, the
   bare key will, so a reference to it grades B. */
const eCon = await post("entitycreate",
  { kind: "contract", label: "Recology Waste Contract", aliases: ["C-2024-88"] });
const conId = eCon.entity_id;
/* E_PERSON carries only NAMES -> only a label correspondence matches, grade C. */
const ePerson = await post("entitycreate", { kind: "person", label: "Sheng Thao" });
const personId = ePerson.entity_id;
/* E_PARCEL carries no matching identifier or name -> the recogniser leaves its
   reference unresolved; only member testimony (grade D) will connect it. */
const eParcel = await post("entitycreate", { kind: "parcel", label: "1200 Broadway Parcel" });
const parcelId = eParcel.entity_id;
t("four distinct entity ids were allocated",
  new Set([ordId, conId, personId, parcelId]).size, 4);

console.log("\n--- promote captured documents carrying raw references (FW-5) ---");
await promoteReading(shaA, [
  { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579" },
  { ref: "contract:C-2024-88", kind: "contract", key: "C-2024-88", label: "Recology Contract" },
  { ref: "person:12", kind: "person", key: "12", label: "Sheng Thao" },
  { ref: "parcel:999", kind: "parcel", key: "999", label: "A parcel nobody registered" },
]);
await promoteReading(shaB, [
  { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance 13579" },
]);
await promoteReading(shaC, [
  { ref: "person:42", kind: "person", key: "42", label: "Sheng Thao" },
]);
await promoteReading(shaD, [
  { ref: "parcel:999", kind: "parcel", key: "999", label: "A parcel nobody registered" },
]);
/* FW-5's raw-reference reverse index sees the references; the ENTITY reverse index must
   not, until the recogniser runs. This is negative control (b), shown constructively. */
t("FW-5: the raw reference ordinance:13579 is carried by two documents",
  (await get("readingref", "ref=" + encodeURIComponent("ordinance:13579"))).count, 2);
t("FW-7: op=concerns for the entity is EMPTY before any resolution (the reverse index depends on the resolver)",
  (await get("concerns", "id=" + ordId)).count, 0);

console.log("\n--- op=resolve: the recogniser grades each reference by HOW it matched ---");
const rA = await post("resolve", { captureSha: shaA });
t("resolve reports the reference count it saw", rA.references, 4);
t("three references resolved, one stayed unresolved", [rA.resolved_count, rA.unresolved_count], [3, 1]);
const byRef = Object.fromEntries(rA.resolved.map((m) => [m.ref, m]));
t("A — the source's own composite identifier grades A and is established",
  [byRef["ordinance:13579"].grade, byRef["ordinance:13579"].entity_id, byRef["ordinance:13579"].established],
  ["A", ordId, true]);
t("B — the source's bare identifier in content grades B and is established",
  [byRef["contract:C-2024-88"].grade, byRef["contract:C-2024-88"].entity_id, byRef["contract:C-2024-88"].established],
  ["B", conId, true]);
t("C — a name correspondence grades C, is NOT established, and is flagged for confirmation",
  [byRef["person:12"].grade, byRef["person:12"].entity_id, byRef["person:12"].established, byRef["person:12"].needs_confirmation],
  ["C", personId, false, true]);
t("the unresolvable reference is returned honestly UNRESOLVED, not force-matched",
  rA.unresolved.map((u) => u.ref), ["parcel:999"]);
t("resolve stamps who resolved, from the session, not the caller's body",
  byRef["ordinance:13579"].resolved_by, "class:member");

console.log("\n--- op=resolutions: a document's resolutions, with grade honestly surfaced ---");
const resA = await get("resolutions", "sha256=" + shaA);
t("three resolutions are stored for the document", resA.count, 3);
const cRow = resA.resolutions.find((r) => r.ref === "person:12");
t("NEGATIVE CONTROL (a): the Grade C row is never established and carries needs_confirmation",
  [cRow.grade, cRow.established, cRow.needs_confirmation], ["C", false, true]);
t("the A row's method NAMES the source's own identifier as the basis",
  /source identifier/.test(resA.resolutions.find((r) => r.ref === "ordinance:13579").method), true);

console.log("\n--- op=concerns: THE REVERSE INDEX — every document concerning an entity ---");
await post("resolve", { captureSha: shaB });   // shaB also carries ordinance:13579 (A)
const concOrd = await get("concerns", "id=" + ordId);
t("every document concerning the ordinance is returned (both captures)",
  concOrd.count, 2);
t("it returns the two capture shas, joined on the ENTITY, from the raw references",
  concOrd.documents.map((d) => d.capture_sha).sort(), [shaA, shaB].sort());
t("each concerning document reports the grade it resolved at (A here) and is established",
  [...new Set(concOrd.documents.map((d) => d.grade + ":" + d.established))], ["A:true"]);
t("concerns names the entity it answered for", concOrd.entity.entity_id, ordId);

const concPerson = await get("concerns", "id=" + personId);
t("NEGATIVE CONTROL (a): a document concerning the person via a C correspondence is NOT established",
  [concPerson.count, concPerson.documents[0].grade, concPerson.documents[0].established],
  [1, "C", false]);

console.log("\n--- grade is IMPROVABLE: a C is raised to A IN PLACE when the identifier is later registered ---");
const rC1 = await post("resolve", { captureSha: shaC });
t("person:42 first resolves by NAME only — grade C",
  [rC1.resolved[0].grade, rC1.resolved[0].entity_id], ["C", personId]);
/* A member registers the source's identifier for the person as an alias (FW-6). */
const alias = await post("entityalias", { entityId: personId, alias: "person:42" });
t("the source identifier is registered as a first-class alias", alias.ok, true);
const rC2 = await post("resolve", { captureSha: shaC });
t("re-resolving now grades A — the composite identifier matches — and reports the RAISE",
  [rC2.resolved[0].grade, rC2.resolved[0].raised, rC2.resolved[0].raised_from], ["A", true, "C"]);
const resC = await get("resolutions", "sha256=" + shaC);
t("the grade was raised IN PLACE — still ONE row for the triple, now A and established",
  [resC.count, resC.resolutions[0].grade, resC.resolutions[0].established, resC.resolutions[0].raised_from],
  [1, "A", true, "C"]);

console.log("\n--- op=resolvetestify: member TESTIMONY is grade D, and the recogniser never mints it ---");
t("the recogniser left parcel:999 unresolved (shaD), honestly",
  (await post("resolve", { captureSha: shaD })).unresolved.map((u) => u.ref), ["parcel:999"]);
const testify = await post("resolvetestify",
  { captureSha: shaD, ref: "parcel:999", entityId: parcelId, basis: "I attended the hearing; this is the parcel at issue." });
t("testimony records a grade-D resolution, NOT established (no captured basis)",
  [testify.grade, testify.established, testify.needs_confirmation], ["D", false, false]);
t("testimony stamps its author from the session (framework §8.1: recorded with an author)",
  testify.resolved_by, "class:member");
const concParcel = await get("concerns", "id=" + parcelId);
t("op=concerns returns the testified document at grade D, not established",
  [concParcel.count, concParcel.documents[0].grade, concParcel.documents[0].established],
  [1, "D", false]);
/* Testimony refuses to invent either end, and never downgrades a stronger resolution. */
t("testimony about a reference the document does not carry is refused",
  (await post("resolvetestify", { captureSha: shaD, ref: "parcel:000", entityId: parcelId, basis: "x" })).reason,
  "NO_SUCH_REFERENCE");
t("testimony about an unregistered entity is refused",
  (await post("resolvetestify", { captureSha: shaD, ref: "parcel:999", entityId: "ENT-9999-9999", basis: "x" })).reason,
  "NO_SUCH_ENTITY");
t("testimony with no basis is refused (grade D is RECORDED testimony)",
  (await post("resolvetestify", { captureSha: shaD, ref: "parcel:999", entityId: parcelId, basis: "  " })).reason,
  "NO_BASIS");
const downgrade = await post("resolvetestify",
  { captureSha: shaA, ref: "ordinance:13579", entityId: ordId, basis: "I also recall this." });
t("testimony NEVER downgrades an established A — the stronger grade is kept",
  [downgrade.grade, downgrade.kept], ["A", true]);

console.log("\n--- a relation is NOT traversed: concerns joins on the entity itself, never through a proxy ---");
/* Declaring a constitutive relation (FW-6) between the person and the ordinance must
   NOT make documents concerning one appear under the other (do not resolve THROUGH a
   relation — a declared relation is constitutive, not evidentiary, D-83). */
const rel = await post("relationdeclare",
  { fromEntity: personId, toEntity: ordId, relation: "proxy_for",
    justification: "the councilmember championed the ordinance", citation: "minutes 2026-05-01" });
t("a constitutive relation is declared between the two entities", rel.ok, true);
t("concerns(ordinance) is UNCHANGED by the relation — the person's C document does not leak in",
  (await get("concerns", "id=" + ordId)).documents.map((d) => d.capture_sha).sort(), [shaA, shaB].sort());

console.log("\n--- op=resolve refuses cleanly, and unknown references do not force-match ---");
t("resolve with no capture sha is refused by name", (await post("resolve", {})).reason, "NO_SHA");
t("resolve of a reference the document does not carry is refused",
  (await post("resolve", { captureSha: shaA, ref: "nope:1" })).reason, "NO_SUCH_REFERENCE");

console.log("\n--- purge clears the resolutions (D-113) ---");
const before = await get("concerns", "id=" + ordId);
t("before purge the reverse index is non-empty", before.count > 0, true);
const purge = rP(await (await mf.dispatchFetch(
  "http://x/api/?op=purge&token=adm-fw7&confirm=bio", { method: "POST" })).json());
t("a whole-store purge REPORTS the resolutions it removed (not a silent leftover)",
  purge.removed.resolutions > 0, true);
t("after purge the store holds zero resolutions", purge.after.resolutions, 0);
t("after purge the reverse index is empty for a document that had concerned the entity",
  (await get("concerns", "id=" + ordId)).count, 0);

await mf.dispose();
console.log(`\nresolution: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
