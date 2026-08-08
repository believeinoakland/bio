/* NEGATIVE CONTROL: (a) in store.mjs cite()'s inquiry arm, `spliced = Store.#spliceBasis(withRefs, filled)` -> `spliced = withRefs` with the legs INSERTed straight into inquiry_basis after the promote -> 13 fail, led by "THE LEG IS IN THE DOCUMENT'S OWN BYTES" and "THE TABLE IS A PROJECTION OF THAT DOCUMENT"; (b) in store.mjs promote, `const cycle = this.#basisCyclePath(bundleId, inqTargets)` -> `const cycle = null` -> 4 fail here and 2 in basis.test.mjs. Both arms in full below. */
/* THE TWO ARMS, RUN 2026-08-04 (rec37-agent), each broken ALONE and restored byte-identically to store.mjs sha256 36fb9758c3a6f83c45750eab93046b56bcdc045daf8679d6d5ad87003bb88510; 48 pass and battery 92/92 (4852) when whole.

   (a) BYPASS THE DOCUMENT — the item's own control. In store.mjs cite()'s inquiry arm, `spliced = Store.#spliceBasis(withRefs, filled)` -> `spliced = withRefs`, and the legs written STRAIGHT INTO THE TABLE after a successful promote instead: `if (ontoInquiry) for (let i = 0; i < filled.length; i++) this.sql.exec("INSERT INTO inquiry_basis (bundle_id,ord,target_id,target_type,role,grade,grade_axis,grade_source,note,at) VALUES (?,?,?,?,?,?,?,?,?,?)", project, i, filled[i].target, normalizeType(OBJECT_TYPES[filled[i].target.split("-")[0]]) ?? "", filled[i].role, filled[i].grade ?? null, filled[i].grade_axis ?? null, filled[i].grade_source ?? null, null, null)`, placed immediately after `if (!promoted.ok) return …`. -> cite-inquiry 35 pass, 13 FAIL; battery 91/92 (4839), this the only failing suite. The two that matter both fail: "THE LEG IS IN THE DOCUMENT'S OWN BYTES" (the document carries no basis at all) and "THE TABLE IS A PROJECTION OF THAT DOCUMENT" (three rows against zero legs).
   THE INSTRUMENT WAS CORRECTED BY THIS ARM, TWICE, and both corrections are the useful part. FIRST: the insert was originally placed BEFORE the promote, where promote's own `DELETE FROM inquiry_basis WHERE bundle_id=?` wiped it — so the table came back EMPTY, the document-vs-table equality held at [] === [], and the arm reported a passing projection assertion while the leg had been bypassed. Moved AFTER the promote, it fails as it must. That is the equality-that-costs-nothing rule biting inside a negative control. SECOND: `legFor` and the document reads THREW on a document with no basis block, so the control killed the run instead of NAMING what it broke; they are null-tolerant now and every projection assertion reports its own failure.
   THE FINDING: with the leg going straight to the table, `op=inquirystrength` still reports a graded connection axis and the DO path `basis` would still list three legs (M0-12: `basis` is DO-internal, not an op) — a table-only leg READS AS LANDED from every derived surface. Nothing but the document-vs-table pair notices, which is why D-21 is enforced structurally and not by convention.

   (b) PERMIT THE CYCLE. In store.mjs promote, `const cycle = this.#basisCyclePath(bundleId, inqTargets)` -> `const cycle = null`. -> cite-inquiry 44 pass, 4 FAIL; battery 90/92 (4846), and it takes REC-11's basis.test.mjs down with it (2 FAIL: "C resting on A is refused AT THE CLOSING WRITE, the path named" and "the refused write projected NOTHING"). The four here are "A CYCLE-CLOSING CITE IS REFUSED AT THE WRITE", "AND THE REFUSAL NAMES THE FULL PATH", "the refused write projected NOTHING" and the derived-pair assertion that reads the polluted graph afterwards. TWO ITEMS HOLDING ONE RULE FROM TWO PLACES, which is the point: this act reaches REC-11's guard rather than carrying one of its own, so breaking that guard is visible from the act as well as from the write.

   Restored after each; 92/92 (4852) and coverage --strict exit 0 (126/126 ops) afterwards. */
/* REC-37: CITE-TO-INQUIRY — the plane half of the record-becomes-a-case edge.
 *
 * UI-20 MEASURED THE GAP and could not close it: `op=cite` could not reach an
 * inquiry IN EITHER DIRECTION (the store refused NOT_A_PROJECT / NOT_INFORMATION
 * and `op=affordances` published `cite` for information and project only), and
 * `inquiry_basis` was a promote-projection that NO op appended a leg to. So the
 * only way an inquiry's basis grows did not exist, and UI-20's harness proved it
 * NEGATIVELY: a cite into a case left `inquiry_basis` byte-identical, and citing
 * onto a question rendered the plane's NOT_A_PROJECT verbatim.
 *
 * THE DECISION THIS ITEM MADE, reasoned in full at the site (`store.mjs`
 * cite()): the act was WIDENED rather than duplicated. It is one act in the
 * record's own terms — "this is why I think that" — and WHERE the record keeps
 * it (a case's `references[]`, a question's `basis[]`) is not what the member
 * did. A second op would hold a second copy of the most carefully ordered
 * refusal sequence in the file, or call this one and be it under another name.
 *
 * WHAT THIS SUITE HOLDS THE IMPLEMENTATION TO:
 *
 *   1. THE LEG LANDS THROUGH THE DOCUMENT. `inquiry_basis` is a projection of
 *      `basis[]` (D-21: never a second place to state it), so the act splices
 *      the leg into bundle.md and PROMOTES. Asserted from BOTH ends: the leg is
 *      in the document's own bytes (`op=image`), and every ROW the table holds
 *      says exactly what the document's leg says. Negative control (a) is what
 *      makes the pair mean something — a table-only leg reads as landed from
 *      every derived surface and is caught by nothing else.
 *   2. BOTH TARGET KINDS. A document AND another inquiry are cited onto one
 *      question through the one widened path. Basis recursion is REC-11's
 *      design (DEC-23), and it is why `inquiry_basis` carries a target_type.
 *   3. THE DAG GUARD IS REC-11'S, AT THE WRITE. `cite()` holds no cycle rule of
 *      its own, deliberately: the leg reaches promote, where SELF_BASIS and
 *      BASIS_CYCLE refuse and NAME THE FULL PATH. A second rule inside the act
 *      would be a second answer waiting to disagree with the one that actually
 *      protects the graph.
 *   4. THE GRADE IS FILLED, NEVER OFFERED. The connection grade comes from
 *      `earnedBasisRegistry` — the SAME function `op=earnedbasis` answers from
 *      and `op=promote` enforces with — so the read, the fill and the write
 *      cannot disagree. Asserted by reading `op=earnedbasis` FIRST and holding
 *      the landed leg to what it said. A target the record earns nothing for
 *      lands UNGRADED: no grade, no axis, no source — undetermined and STATED,
 *      INERT (DEC-18), never a guessed letter.
 *   5. THE ROLE IS REQUIRED AND REFUSED BY NAME. `cuts_against` is first-class
 *      (invariant 7), so a default would put a claim about the member's own
 *      reasoning into the record that the member never made. It is refused
 *      rather than dropped on the case arm too: a field honoured nowhere is the
 *      D-21 class in miniature.
 *   6. THE CASE ARM IS UNTOUCHED. A document cited onto a project still writes
 *      one `cites` edge and NOTHING on any basis — the widening took nothing
 *      away, and that is asserted rather than assumed.
 *   7. THE ONE GRAMMAR, BOTH GATES. The legs this act composes are judged by
 *      `checkInquiryBasis` at promote exactly like any other leg, so what lands
 *      also audits clean.
 *
 * Everything is driven THROUGH the control plane (`op=…`, a real caller's only
 * route) so coverage credits the surface a caller can actually reach — the D-43
 * class, and `op=invitelook`'s ReferenceError beside 1276 green assertions.
 *
 * D-168 DID NOT BITE: this act asks nothing about a target's STATE on either
 * arm, exactly as it never has. Citing retired material stays permitted and is
 * therefore published; the doctrine is still undecided and nothing here decides
 * it.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle, parseFrontmatter, BASIS_ROLES } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r37", MEMBER_TOKEN: "mem-r37", PROBE_TOKEN: "prb-r37", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r37") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r37") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";

/* ------------------------------------------------------------- documents */

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];

const inquiryMd = (id, { question = `What does ${id} rest on?`, subject = null, refs = [] } = {}) => ["---",
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
  ...(subject ? [`subject_entity: ${subject}`] : []),
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
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const projectMd = (id, title) => ["---",
  `id: ${id}`, "object_type: project", "schema: project@1",
  `title: "${title}"`, "current_state: forming", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A case.", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const promote = async (id, text, type, { base = null, register = [], reading = null, state = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return post("promote", {
    bundleId: id, base,
    snapKey: `20260804T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: state || (type === "inquiry" ? "open" : type === "project" ? "forming" : "collected"),
            created: NOW, last_updated: LATER },
    files, register });
};
const mustPromote = async (id, ...a) => {
  const r = await promote(id, ...a);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  return r;
};
const selectIds = async (ids) => {
  const r = await post("select", { ids }, "mem-r37");
  if (!r.handle) throw new Error(`select: ${JSON.stringify(r)}`);
  return r.handle;
};
/* THE ACT, through the control plane and nothing else. */
const cite = async (project, ids, extra = "") =>
  get("cite", `project=${project}&handle=${await selectIds(ids)}${extra}`);

const imageOf = async (id) => (await get("image", `id=${id}`))["bundle.md"];
/* The legs AS THE DOCUMENT STATES THEM — the authority, read back out of the
   bytes the act wrote rather than out of anything derived from them. */
const docLegs = async (id) => parseFrontmatter(await imageOf(id)).data.basis ?? null;
const docRefs = async (id) => parseFrontmatter(await imageOf(id)).data.references ?? null;
/* THE TABLE, read through the control plane and never from the bytes.
   `op=inquirystrength`'s walk reads `basisFor()` — a `SELECT … FROM
   inquiry_basis` — and NAMES every member it found, load-bearing or not, so the
   rows come back with their ord, role, grade and grade_source as the TABLE holds
   them. That is what makes the equality below an assertion about the PROJECTION
   rather than about the same bytes twice.
   Only `via: "leg"` members are this question's own rows: an `inherited` member
   is a sub-question's derived pair travelling up, which is a different fact. One
   leg is named on BOTH axes (inert on the one it is not graded on), so the
   copies are folded by `ord` and the graded one kept. */
const tableLegs = async (id) => {
  const s = await get("inquirystrength", `id=${id}`);
  const byOrd = new Map();
  for (const ax of ["capture", "connection"]) {
    const a = s[ax];
    if (!a) continue;
    for (const m of [...(a.weakest ? [a.weakest] : []), ...(a.not_load_bearing || []),
                     ...(a.undetermined_at || [])]) {
      if (m.via !== "leg") continue;
      const prev = byOrd.get(m.ord);
      if (!prev || (prev.grade == null && m.grade != null)) byOrd.set(m.ord, m);
    }
  }
  return [...byOrd.keys()].sort((a, b) => a - b).map((k) => byOrd.get(k));
};
const actIds = (a) => (a.acts || []).map((x) => x.id).sort();
/* NULL-TOLERANT DELIBERATELY, and it is an INSTRUMENT correction rather than a
   convenience: negative-control arm (a) leaves the document with no basis block
   at all, and the first version of this helper THREW there — so the control
   killed the run instead of NAMING the assertions it broke, which is the whole
   value of running it. It now returns an empty leg so every projection-of-the-
   document assertion reports its own failure. */
const legFor = (legs, target) => (legs ?? []).find((l) => (l.target ?? l.target_id) === target) ?? {};

/* ===================== 0. THE GROUND ===================================== */
console.log("--- 0. a registered subject, documents the recogniser can grade, and the questions ---");

const ent = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24680"] });
const ORD = ent.entity_id;

const SHA_A = sha("rec37-doc-earns-a");
const DOC_A = "INFO-2026-3700-earns-a";       // resolves to the subject: EARNS a grade
const DOC_BARE = "INFO-2026-3700-unresolved"; // resolves to nothing: earns NOTHING
const DOC_CASE = "INFO-2026-3700-for-a-case"; // the case arm's regression fixture
const readingOf = (captureSha, entities) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
             at: NOW, entities } });

await mustPromote(DOC_A, infoMd(DOC_A), "information", {
  reading: readingOf(SHA_A, [{ ref: "ordinance:24680", kind: "ordinance", key: "24680",
                               label: "Ordinance No. 24680" }]),
  register: [{ path: "snapshots/a.bin", sha256: SHA_A, encoding: "binary", bytes: 10 }] });
await mustPromote(DOC_BARE, infoMd(DOC_BARE), "information");
await mustPromote(DOC_CASE, infoMd(DOC_CASE), "information");
const res = await post("resolve", { captureSha: SHA_A });
t("op=resolve grades the composite-key reference A — the machine's own act, over the record",
  [res.resolved_count, res.resolved[0].grade, res.resolved[0].entity_id], [1, "A", ORD]);

const MAIN = "INQ-2026-3700-main";        // the question that will do the citing
const SUB = "INQ-2026-3700-sub";          // a question cited AS A LEG of MAIN
const CASE = "PROJ-2026-3700-case";
await mustPromote(MAIN, inquiryMd(MAIN,
  { question: "Did the sewer fund pay for the marina?", subject: ORD }), "inquiry");
await mustPromote(SUB, inquiryMd(SUB,
  { question: "What did the transfer ordinance authorise?" }), "inquiry");
await mustPromote(CASE, projectMd(CASE, "Sewer franchise diversion"), "project");
t("the question starts with NO basis at all — absent in the table and absent in its bytes",
  [await tableLegs(MAIN), await docLegs(MAIN)], [[], null]);

/* ===================== 1. WHAT THE PLANE PUBLISHES ======================= */
console.log("\n--- 1. op=affordances publishes the widened act, and the role vocabulary with it ---");

const affQ = await get("affordances", `target=${MAIN}`);
t("a QUESTION now publishes cite — the act by which a record becomes a case",
  actIds(affQ).includes("cite"), true);
const citeAct = (affQ.acts || []).find((a) => a.id === "cite");
t("published at the SAME weight, the SAME capability and the same unassigned rung — no new token for citing",
  [citeAct.weight, citeAct.needs, citeAct.rung], ["report", "contribute", null]);
const cat = await get("affordances");
t("the catalogue names all three ends of the ONE act, and the label no longer says 'in a project'",
  [cat.catalog.find((a) => a.id === "cite").appliesTo,
   /project/i.test(cat.catalog.find((a) => a.id === "cite").label)],
  [["information", "project", "inquiry"], false]);
t("the BASIS ROLES are published as a vocabulary, from the catalog that enforces them — never a surface's copy",
  cat.vocabularies.basis_roles, BASIS_ROLES);

/* ===================== 2. THE REFUSALS, BEFORE ANYTHING LANDS ============ */
console.log("\n--- 2. the role is required, and every refusal is the plane's own by name ---");

const noRole = await cite(MAIN, [DOC_A]);
t("citing onto a question with NO role is refused NO_ROLE, and the vocabulary travels with the refusal",
  [noRole.ok, noRole.reason, noRole.roles], [false, "NO_ROLE", BASIS_ROLES]);
t("and the refusal says WHY it is never assumed — a leg that cuts against you is first-class",
  /cuts against/i.test(noRole.detail), true);
const badRole = await cite(MAIN, [DOC_A], "&role=agrees_with");
t("a role outside the closed set is refused BAD_ROLE naming what was asked for",
  [badRole.ok, badRole.reason, badRole.got], [false, "BAD_ROLE", "agrees_with"]);
const roleOnCase = await cite(CASE, [DOC_CASE], "&role=supports");
t("a role sent to a CASE is REFUSED rather than dropped — a field honoured nowhere is how projections drift",
  [roleOnCase.ok, roleOnCase.reason], [false, "ROLE_NOT_APPLICABLE"]);
t("NOTHING was written by any of the three: the question still carries no basis",
  [await tableLegs(MAIN), await docLegs(MAIN)], [[], null]);

const ontoDoc = await cite(DOC_A, [DOC_BARE], "&role=supports");
t("a citing object that is NEITHER a case NOR a question is still refused NOT_A_PROJECT, its name unchanged",
  [ontoDoc.ok, ontoDoc.reason, ontoDoc.got], [false, "NOT_A_PROJECT", "information"]);
t("and the refusal now says what a case and a question each keep, rather than naming only projects",
  /neither a case nor a question/.test(ontoDoc.detail), true);
const notCitable = await cite(MAIN, [DOC_A, CASE], "&role=supports");
t("a member that is neither material nor a question is refused NOT_CITABLE with the offender named",
  [notCitable.ok, notCitable.reason, notCitable.offenders], [false, "NOT_CITABLE", [CASE]]);
t("the whole call is refused rather than narrowed to the citable part — the click is not reinterpreted",
  await tableLegs(MAIN), []);

/* ===================== 3. WHAT THE RECORD EARNS, BEFORE THE LEG ========== */
console.log("\n--- 3. op=earnedbasis is asked FIRST, and the act fills from the same function ---");

const earned = await get("earnedbasis", `id=${MAIN}&targets=${DOC_A},${DOC_BARE},${SUB}`);
t("the read reports what the resolved document earns on the connection axis, and the subject it earned it against",
  [earned.ok, earned.subject_entity, earned.earned.connection[DOC_A].grade,
   earned.earned.connection[DOC_A].mode], [true, ORD, "A", "value"]);
t("and it reports plainly that the unresolved document and the sub-question earn NOTHING",
  [DOC_BARE in earned.earned.connection, SUB in earned.earned.connection], [false, false]);

/* ===================== 4. THE ACT: A DOCUMENT AND A QUESTION ============= */
console.log("\n--- 4. citing a document AND another question onto one question, through the widened path ---");

const cited = await cite(MAIN, [DOC_A, DOC_BARE, SUB], "&role=supports&note=the+transfer+ordinance");
t("the act succeeds at the published REPORT weight and names every member it landed",
  [cited.ok, cited.weight, cited.cited.slice().sort(), cited.alreadyCited],
  [true, "report", [DOC_A, DOC_BARE, SUB].sort(), []]);
t("it reports the citing object's kind and the role it wrote, so a surface renders rather than infers",
  [cited.citingObjectType, cited.role], ["inquiry", "supports"]);

const docLegsNow = (await docLegs(MAIN)) ?? [];
t("THE EARNED GRADE IS FILLED FROM THE SAME DERIVATION op=earnedbasis ANSWERED FROM",
  [legFor(docLegsNow, DOC_A).grade, legFor(docLegsNow, DOC_A).grade_axis,
   legFor(docLegsNow, DOC_A).grade_source],
  [earned.earned.connection[DOC_A].grade, "connection", "resolution"]);
t("a target the record earns nothing for lands UNGRADED — no grade, no axis, no source (DEC-18's inert leg)",
  [legFor(docLegsNow, DOC_BARE).grade ?? null, legFor(docLegsNow, DOC_BARE).grade_axis ?? null,
   legFor(docLegsNow, DOC_BARE).grade_source ?? null], [null, null, null]);
t("the leg on ANOTHER QUESTION is ungraded too — an inquiry has no captures and no resolutions to earn from",
  legFor(docLegsNow, SUB).grade ?? null, null);
t("the act STATES the split rather than reporting only what landed",
  [cited.gradesFilled, cited.gradesUndetermined], [1, 2]);
t("it reports each leg with the registry's OWN sentence for a filled one and an explicit null for an undetermined one",
  [cited.legs.length, cited.legs.find((l) => l.target === DOC_A).grade,
   /resolves to/.test(cited.legs.find((l) => l.target === DOC_A).why || ""),
   cited.legs.find((l) => l.target === DOC_BARE).why],
  [3, "A", true, null]);
t("every leg carries the role the member stated, and no other",
  docLegsNow.map((l) => l.role), ["supports", "supports", "supports"]);
t("NO GRADE IS A PARAMETER OF THIS ACT AT ALL: the DO dispatch reads project, handle, viewer, owner, note, author, role",
  (/cite: \(\) => this\.cite\(\{[\s\S]*?\n        \}\),/.exec(STORE_SRC)[0]
    .match(/^\s+([a-z]+):/gm) || []).map((x) => x.trim().replace(":", "")).sort(),
  ["author", "handle", "note", "owner", "project", "role", "viewer"]);

/* ===================== 5. IT LANDED THROUGH THE DOCUMENT ================= */
console.log("\n--- 5. D-21: the leg is in the DOCUMENT, and the table is its projection ---");

t("THE LEG IS IN THE DOCUMENT'S OWN BYTES: basis[] carries all three, with their roles",
  docLegsNow.map((l) => [l.target, l.role]).sort(),
  [[DOC_A, "supports"], [DOC_BARE, "supports"], [SUB, "supports"]].sort());
t("and the earned grade is stated IN THE BYTES too, with its axis and its source",
  [legFor(docLegsNow, DOC_A).grade, legFor(docLegsNow, DOC_A).grade_axis,
   legFor(docLegsNow, DOC_A).grade_source], ["A", "connection", "resolution"]);
t("an UNDETERMINED leg states nothing at all rather than a null — absence is how this grammar says undetermined",
  ["grade" in legFor(docLegsNow, DOC_BARE), "grade_axis" in legFor(docLegsNow, DOC_BARE),
   "grade_source" in legFor(docLegsNow, DOC_BARE)], [false, false, false]);
t("THE TABLE IS A PROJECTION OF THAT DOCUMENT: every row it holds says exactly what the document's leg says",
  (await tableLegs(MAIN)).map((m) => [m.ord, m.target_id, m.role, m.grade, m.grade_source]),
  docLegsNow.map((l, i) => [i, l.target, l.role, l.grade ?? null, l.grade_source ?? null]));
const refsNow = (await docRefs(MAIN)) ?? [];
t("C-6.3 holds by construction: every leg's target is in references[] too, so the two projections cannot disagree",
  docLegsNow.every((l) => refsNow.some((r) => r.target === l.target)), true);
const basisInPayload = await post("promote", {
  bundleId: MAIN, base: (await get("projection", `id=${MAIN}`)).bundle_sha, snapKey: "20260804T999999Z_dead",
  meta: { object_type: "inquiry", group: "believe-in-oakland", title: "x", current_state: "open",
          created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text: "x", bytes: 1, sha256: sha("x") }],
  basis: [{ target: DOC_A, role: "supports" }] });
t("stating a leg in the promote PAYLOAD instead of the document is refused BY NAME — D-21, and this act gets no exemption",
  [basisInPayload.ok, basisInPayload.reason], [false, "BASIS_IN_PAYLOAD"]);

/* THE DOCUMENT STAYS CONFORMANT — a write that passes the store and fails the
   checker is a defect that ships invisibly, which is how the intake UI's
   defects shipped. */
/* The EARNED registry is injected the way every real caller injects it (the
   ratification gate and op=promote both do): a checker that can see only this
   bundle cannot confirm an earned grade and says so rather than passing the
   leg, which is checkEarnedLeg's own posture and not a gap. */
const errs = (await checkBundle({ folderName: MAIN,
  files: new Map([["bundle.md", await imageOf(MAIN)]]),
  sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
  resolveTarget: () => true,
  earnedRegistry: earned })).findings.filter((f) => f.severity === "error");
t("the question the act rewrote is still conformant against the catalog's own checker",
  errs.map((e) => e.check), []);
t("the act accounted for itself in the Session Log, naming the role AND how many legs are undetermined",
  [/Rested this question on 3 records \(supports\)/.test(await imageOf(MAIN)),
   /1 filled from the record's own resolutions/.test(await imageOf(MAIN)),
   /2 left undetermined and stated/.test(await imageOf(MAIN))],
  [true, true, true]);

/* ===================== 6. REPORT WEIGHT: PER ITEM, ON THIS ARM TOO ======= */
console.log("\n--- 6. the report weight's semantics survive the widening: N landed, M retained ---");

const again = await cite(MAIN, [DOC_A, DOC_CASE], "&role=supports");
t("citing a set that is half already-legged lands the new leg and RETAINS the one already there, per item",
  [again.ok, again.cited, again.alreadyCited], [true, [DOC_CASE], [DOC_A]]);
t("the retained target was not written a second time — the act stays safely retryable",
  ((await docLegs(MAIN)) ?? []).filter((l) => l.target === DOC_A).length, 1);
const allAlready = await cite(MAIN, [DOC_A], "&role=supports");
t("a call whose every member is already a leg is a SUCCESS that writes nothing",
  [allAlready.ok, allAlready.cited, allAlready.alreadyCited, allAlready.rowVersion],
  [true, [], [DOC_A], null]);

/* ===================== 7. THE DAG, AT THE WRITE, NAMING THE PATH ========= */
console.log("\n--- 7. a cycle-closing cite is refused by REC-11's guard, not by a rule of cite's own ---");

/* MAIN already rests on SUB. A leg the other way would close MAIN -> SUB -> MAIN. */
const cyc = await cite(SUB, [MAIN], "&role=supports");
t("A CYCLE-CLOSING CITE IS REFUSED AT THE WRITE, by name",
  [cyc.ok, cyc.reason], [false, "BASIS_CYCLE"]);
t("AND THE REFUSAL NAMES THE FULL PATH it found, so nobody re-derives the walk the store just did",
  cyc.path, [SUB, MAIN, SUB]);
t("the refused write projected NOTHING: the sub-question still rests on nothing, in the table and in its bytes",
  [await tableLegs(SUB), await docLegs(SUB)], [[], null]);
const self = await cite(SUB, [SUB], "&role=supports");
t("a question citing ITSELF is refused SELF_BASIS — a question is not evidence for its own answer",
  [self.ok, self.reason, self.path], [false, "SELF_BASIS", [SUB, SUB]]);
t("cite holds NO cycle rule of its own — it never calls the walk, and the guard it reaches is REC-11's",
  /#basisCyclePath\(/.test(STORE_SRC.split("cite({ project")[1].split("static #setScalar")[0]), false);

/* ===================== 8. THE CASE ARM, UNCHANGED ======================== */
console.log("\n--- 8. the widening took nothing away: citing onto a case is what it always was ---");

const onCase = await cite(CASE, [DOC_CASE], "&note=the+ledger+page");
t("a document cited onto a case still succeeds at report weight, with no role in sight",
  [onCase.ok, onCase.weight, onCase.cited], [true, "report", [DOC_CASE]]);
t("it wrote ONE cites edge into the case's own references and NOTHING anywhere near a basis",
  [(await docRefs(CASE)).map((r) => [r.rel, r.target, r.status]), await docLegs(CASE)],
  [[["cites", DOC_CASE, "confirmed"]], null]);
/* SUPERSEDED BY REC-72, CORRECTED AND NOT EXEMPTED, and why the old assertion
   was wrong is the whole of the item that replaced it.
   THIS ARM USED TO READ: "a case's members are still Information only, refused
   NOT_INFORMATION under its own unchanged name" -> [false, "NOT_INFORMATION",
   [SUB]]. It was true of the code and wrong about the record. D-216's model
   check then DROVE the sharing model and found that the project-to-question
   `cites` edge the whole investigative build rests on had NO CURATED PRODUCER:
   `op=promote` had always accepted it (C-6.1/C-6.2 never read a target's type)
   and `op=backlinks` had always walked it, so this refusal made one shape
   authorable and not actable. REC-72 widened the case arm by exactly one type.
   The rule that remains — and the one this arm was ACTUALLY protecting — is the
   `selfCase` arm below. The full drive lives in `citeproject-inquiry.test.mjs`;
   this arm is the REC-37 suite confirming its own case arm still agrees. */
const inqMember = await cite(CASE, [SUB]);
t("REC-72: a CASE may now cite a QUESTION, through the act, and the edge lands in its references",
  [inqMember.ok, inqMember.weight, inqMember.cited], [true, "report", [SUB]]);
t("and it landed as a plain cites edge with NO basis leg — a case keeps citations in references[], "
+ "which is the arm-conditional shape REC-37 built and REC-72 did not disturb",
  [(await docRefs(CASE)).map((r) => [r.rel, r.target, r.status]).sort(), await docLegs(CASE)],
  [[["cites", DOC_CASE, "confirmed"], ["cites", SUB, "confirmed"]].sort(), null]);
const selfCase = await cite(CASE, [CASE]);
t("a case citing ITSELF is still caught by that same arm — a cycle with nothing to mean",
  [selfCase.ok, selfCase.reason], [false, "NOT_INFORMATION"]);

/* ===================== 9. THE ONE GRAMMAR, BOTH GATES ==================== */
console.log("\n--- 9. what the act composed is judged by the same function the checker runs ---");

const audit = await get("audit", "");
t("op=audit reports no error against the question this act rewrote",
  (audit.findings || []).filter((f) => (f.bundle || f.bundle_id) === MAIN && f.severity === "error")
    .map((f) => f.check), []);
const pair = await get("inquirystrength", `id=${MAIN}`);
t("the derived pair reads the legs the act wrote: connection is graded, and the ungraded legs are NAMED, not dropped",
  [pair.connection.state, pair.connection.grade, pair.connection.not_load_bearing.length > 0],
  ["graded", "A", true]);

console.log(`\ncite-inquiry: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
