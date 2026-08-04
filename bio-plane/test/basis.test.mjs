/* NEGATIVE CONTROL: (run 2026-08-03, each broken ALONE and restored) (a) store.mjs promote: `const cycle = this.#basisCyclePath(bundleId, inqTargets)` -> `const cycle = null` -> 2 fail ("C resting on A is refused AT THE CLOSING WRITE", "the refused write projected NOTHING"), and a standalone probe confirmed op=promote ACCEPTS the two-node A->B->A close (both writes ok:true); (b) store.mjs promote: the projection insert loop condition `if (isInquiry)` -> `if (false && isInquiry)` -> the two-leg bundle reads an EMPTY basis and the suite fails from "both legs read back, in document order" (got []); (c) bio-checks.mjs checkInquiryBasis: the references[] subset arm `} else if (!refTargets.has(t)) {` -> `} else if (false && ...)` -> 3 fail here ("the catalog names the drift", "the WRITE refuses the same document" — the drift doc is ACCEPTED — and the polluted reverse index downstream) + 1 fail in check-firing.test.mjs naming C-6.3. Restored after each; 28 pass. */
/* REC-11: inquiry_basis — the one genuinely new table, and basis recursion.
 * RECONCILED.md §3.1 (REC-11) is the design; DATA-MODEL.md §2.4.2 / D4 the
 * table; DEC-15 (hunch), DEC-23 (target stays an INFO-/INQ- id until D-164),
 * DEC-32 (single-basis arithmetic) the folded rulings.
 *
 * What is asserted, each in the direction that fails:
 *   1. PROJECTION: an inquiry whose basis names one INFO- and one INQ- reads
 *      both back from inquiry_basis IN ORDER, in the same transaction as refs,
 *      delete-then-insert — a projection of the document, never a second place
 *      to state it. A cuts_against leg is a ROW (invariant 7's storage).
 *   2. RECURSION + THE REVERSE INDEX: "which inquiries rest on this document"
 *      is ONE indexed lookup on inquiry_basis_target, and answers for an INQ-
 *      target exactly as for an INFO- one, because a leg to an inquiry is the
 *      same edge.
 *   3. THE DAG AT WRITE (R3): an inquiry citing itself is refused by name; a
 *      three-node cycle A->B->C->A is refused at the write that would CLOSE
 *      it, with the path named. Before this item the record's only acyclicity
 *      protection was a side effect of op=cite refusing non-information.
 *   4. THE AXIS ON THE LEG (R2): a connection-axis grade on an INFO- target
 *      reads back with its axis intact — the axis is NOT derivable from
 *      target_type. grade NULL means undetermined and STATED.
 *   5. THE HUNCH (DEC-15): grade_source 'hunch' requires an author and a date,
 *      refused BY NAME; testimony is grade D at no other value.
 *   6. ONE RULE, TWO GATES: the same catalog function refuses at op=promote
 *      (write) and findings-checks at checkBundle (C-2.8/C-6.3), including the
 *      arm that REPLACED elevated_into: a basis leg's target must be in
 *      references[], so refs and inquiry_basis cannot disagree.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");
const mf = new Miniflare({
  modules: true, script: STORE_SRC,
  modulesRoot: "/", scriptPath: SRC("store.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const call = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json()).result;

/* ------------------------------------------------------------- documents */

const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
/* A leg renders exactly the keys it carries, so an ABSENT grade is absent in
   the document too — undetermined, stated by the absence, never invented. */
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.grade_axis ? [`    grade_axis: ${l.grade_axis}`] : []),
      ...(l.grade_source ? [`    grade_source: ${l.grade_source}`] : []),
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : []),
      ...(l.note ? [`    note: "${l.note}"`] : [])])]
  : [];

const QUESTION = "Where does the sewer fund transfer basis come from?";
const inquiryMd = (id, { question = QUESTION, refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
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
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const promote = (id, text, type, base = null) => call("/promote", {
  bundleId: id, base, snapKey: `${id}-${base ? "rev" : "new"}`, author: "suite",
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected",
          created: NOW, last_updated: LATER },
});
const basisOf = (id) => call(`/basis?id=${id}`);
const restson = (id) => call(`/restson?id=${id}`);
const errorsOf = async (id, text) => {
  const { findings } = await checkBundle({ folderName: id,
    files: new Map([["bundle.md", text]]),
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    resolveTarget: () => true });
  return findings.filter((x) => x.severity === "error").map((x) => `${x.check}: ${x.message}`);
};

const DOC = "INFO-2026-0800-transfer-memo";
const INQ_LEAF = "INQ-2026-0800-leaf";
const INQ_MAIN = "INQ-2026-0800-main";
const INQ_SECOND = "INQ-2026-0800-second";

console.log("--- 1. the projection: one INFO- leg, one INQ- leg, read back in order ---");
{
  await promote(DOC, infoMd(DOC), "information");
  await promote(INQ_LEAF, inquiryMd(INQ_LEAF, { question: "What did the memo actually authorize?" }), "inquiry");
  const legs = [
    { target: DOC, role: "supports", grade: "B", grade_axis: "connection",
      grade_source: "hunch", author: "casey", date: "2026-08-03",
      note: "the memo names the fund by its old code" },
    { target: INQ_LEAF, role: "cuts_against" },
  ];
  const text = inquiryMd(INQ_MAIN, { refs: [DOC, INQ_LEAF], legs });
  t("a conformant inquiry carrying a basis draws zero errors from the catalog",
    await errorsOf(INQ_MAIN, text), []);
  const r = await promote(INQ_MAIN, text, "inquiry");
  t("the promotion is accepted", r.ok, true);
  const b = await basisOf(INQ_MAIN);
  t("both legs read back, in document order", b.legs.map((l) => [l.ord, l.target_id]),
    [[0, DOC], [1, INQ_LEAF]]);
  t("target_type is denormalised through the catalog's map",
    b.legs.map((l) => l.target_type), ["information", "inquiry"]);
  t("a cuts_against leg is a ROW, not a rendering choice (invariant 7)",
    b.legs[1].role, "cuts_against");
  t("the ungraded leg reads NULL: undetermined and STATED, never invented",
    [b.legs[1].grade, b.legs[1].grade_axis, b.legs[1].grade_source], [null, null, null]);
  t("a connection-axis grade on an INFO- target keeps its axis: not derivable from target_type (R2)",
    [b.legs[0].grade, b.legs[0].grade_axis], ["B", "connection"]);
  t("the hunch is visible as a hunch from the moment it is made (DEC-15)",
    [b.legs[0].grade_source, b.legs[0].at], ["hunch", "2026-08-03"]);
}

console.log("\n--- 2. the reverse index: which inquiries rest on this document — one lookup ---");
{
  await promote(INQ_SECOND, inquiryMd(INQ_SECOND,
    { question: "Does the transfer recur in the next cycle?",
      refs: [DOC], legs: [{ target: DOC, role: "supports" }] }), "inquiry");
  t("both dependents of the document answer from the reverse index",
    (await restson(DOC)).dependents.map((d) => d.bundle_id).sort(), [INQ_MAIN, INQ_SECOND]);
  t("an INQ- target answers the same way — a leg to an inquiry is the same edge (recursion)",
    (await restson(INQ_LEAF)).dependents.map((d) => d.bundle_id), [INQ_MAIN]);
  t("the lookup is INDEXED: schema declares inquiry_basis_target over target_id",
    /CREATE INDEX IF NOT EXISTS inquiry_basis_target ON inquiry_basis\(target_id\);/.test(SCHEMA_SRC), true);
  t("and it is ONE lookup: restingOn runs a single statement against inquiry_basis, no walk",
    (STORE_SRC.slice(STORE_SRC.indexOf("restingOn(targetId)"), STORE_SRC.indexOf("/* Eviction"))
      .match(/FROM inquiry_basis/g) || []).length, 1);
}

console.log("\n--- 3. the DAG, enforced at the write that would close the cycle (R3) ---");
{
  const id = "INQ-2026-0801-self";
  const text = inquiryMd(id, { refs: [id], legs: [{ target: id, role: "supports" }] });
  const r = await promote(id, text, "inquiry");
  t("an inquiry citing itself is refused by name",
    [r.ok, r.reason, r.path], [false, "SELF_BASIS", [id, id]]);

  /* A -> B -> C -> A: build the first two edges, then refuse the CLOSING one. */
  const A = "INQ-2026-0802-cyc-a", B = "INQ-2026-0802-cyc-b", C = "INQ-2026-0802-cyc-c";
  const a0 = inquiryMd(A, { question: "Cycle A?" });
  const b0 = inquiryMd(B, { question: "Cycle B?" });
  const c0 = inquiryMd(C, { question: "Cycle C?" });
  await promote(A, a0, "inquiry"); await promote(B, b0, "inquiry"); await promote(C, c0, "inquiry");
  const a1 = inquiryMd(A, { question: "Cycle A?", refs: [B], legs: [{ target: B, role: "supports" }] });
  const b1 = inquiryMd(B, { question: "Cycle B?", refs: [C], legs: [{ target: C, role: "supports" }] });
  t("A resting on B is legal", (await promote(A, a1, "inquiry", sha(a0))).ok, true);
  t("B resting on C is legal", (await promote(B, b1, "inquiry", sha(b0))).ok, true);
  const c1 = inquiryMd(C, { question: "Cycle C?", refs: [A], legs: [{ target: A, role: "supports" }] });
  const r2 = await promote(C, c1, "inquiry", sha(c0));
  t("C resting on A is refused AT THE CLOSING WRITE, the path named",
    [r2.ok, r2.reason, r2.path], [false, "BASIS_CYCLE", [C, A, B, C]]);
  t("the refused write projected NOTHING: C still has no basis", (await basisOf(C)).legs, []);
}

console.log("\n--- 4. the hunch requires its author and its date, by name (DEC-15) ---");
{
  const id = "INQ-2026-0803-hunch";
  const noAuthor = inquiryMd(id, { refs: [DOC],
    legs: [{ target: DOC, role: "supports", grade: "B", grade_axis: "connection",
             grade_source: "hunch", date: "2026-08-03" }] });
  const r1 = await promote(id, noAuthor, "inquiry");
  t("a hunch with no author is refused, naming the author",
    [r1.ok, r1.reason, (r1.findings ?? []).some((x) => /hunch with no author/.test(x.detail))],
    [false, "BASIS_REFUSED", true]);
  const noDate = inquiryMd(id, { refs: [DOC],
    legs: [{ target: DOC, role: "supports", grade: "B", grade_axis: "connection",
             grade_source: "hunch", author: "casey" }] });
  const r2 = await promote(id, noDate, "inquiry");
  t("a hunch with no date is refused, naming the date",
    [r2.ok, r2.reason, (r2.findings ?? []).some((x) => /hunch with no date/.test(x.detail))],
    [false, "BASIS_REFUSED", true]);
  const laundered = inquiryMd(id, { refs: [DOC],
    legs: [{ target: DOC, role: "supports", grade: "A", grade_axis: "connection",
             grade_source: "testimony", author: "casey", date: "2026-08-03" }] });
  const r3 = await promote(id, laundered, "inquiry");
  t("testimony is grade D at no other value: a hunch is the ONLY authored grade above D",
    [r3.ok, r3.reason, (r3.findings ?? []).some((x) => /testimony at grade A/.test(x.detail))],
    [false, "BASIS_REFUSED", true]);
  const graded = inquiryMd(id, { refs: [DOC],
    legs: [{ target: DOC, role: "supports", grade: "B", grade_axis: "connection" }] });
  const r4 = await promote(id, graded, "inquiry");
  t("a grade with no source is an invented one, refused",
    [r4.ok, r4.reason, (r4.findings ?? []).some((x) => /grade with no grade_source/.test(x.detail))],
    [false, "BASIS_REFUSED", true]);
  const axisless = inquiryMd(id, { refs: [DOC],
    legs: [{ target: DOC, role: "supports", grade: "B", grade_source: "resolution" }] });
  const r5 = await promote(id, axisless, "inquiry");
  t("a grade with no axis is refused: the axis is the leg's own fact (R2)",
    [r5.ok, r5.reason, (r5.findings ?? []).some((x) => /grade with no grade_axis/.test(x.detail))],
    [false, "BASIS_REFUSED", true]);
}

console.log("\n--- 5. refs and inquiry_basis cannot disagree (C-6.3, the arm that replaced elevated_into) ---");
{
  const id = "INQ-2026-0804-drift";
  const text = inquiryMd(id, { refs: [], legs: [{ target: DOC, role: "supports" }] });
  const errs = await errorsOf(id, text);
  t("the catalog names the drift: a basis leg absent from references[] is a C-6.3 error",
    errs.some((x) => x.startsWith("C-6.3:") && x.includes(DOC)), true);
  const r = await promote(id, text, "inquiry");
  t("and the WRITE refuses the same document with the same check — one rule, two gates",
    [r.ok, r.reason, (r.findings ?? []).some((x) => x.check === "C-6.3")], [false, "BASIS_REFUSED", true]);
  t("a leg on something that is neither information nor inquiry is refused",
    (await errorsOf(id, inquiryMd(id, { refs: ["PROJ-2026-0001-p"],
      legs: [{ target: "PROJ-2026-0001-p", role: "supports" }] })))
      .some((x) => x.includes("is a project")), true);
}

console.log("\n--- 6. the document stays authoritative: payload basis refused, purge clears the projection ---");
{
  const id = "INQ-2026-0805-payload";
  const text = inquiryMd(id, {});
  const r = await call("/promote", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "suite",
    basis: [{ target: DOC, role: "supports" }],
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: "x",
            current_state: "open", created: NOW, last_updated: LATER },
  });
  t("basis in the promote payload is refused outright (D-21: no second place to state it)",
    [r.ok, r.reason], [false, "BASIS_IN_PAYLOAD"]);
  await call(`/purge?bundleId=${INQ_SECOND}`);
  t("a per-bundle purge takes the purged inquiry's own legs",
    (await basisOf(INQ_SECOND)).legs, []);
  t("but not other inquiries' legs that TARGET the purged bundle's document",
    (await restson(DOC)).dependents.map((d) => d.bundle_id), [INQ_MAIN]);
}

await mf.dispose();
console.log(`\nbasis: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
