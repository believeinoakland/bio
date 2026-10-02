/* ratification's catalogue at its interface (`./checks.mjs`, re-exported by the module): the case-document catalogue
   C-41 with the case arms of C-2.8, C-3.1 and C-21.1 (R8), C-2.8's case-member arm and the pure vocabulary around it
   (R9), and the rows that moved here with their ids (R14). Each check is driven with its negative control: a document
   that draws no finding, and the one mutation that makes each arm fire. The copy of `isCaseMemberBytes` record-grammar
   keeps for C-3.1 (N69; it moved there from `legacy-checks`) is asserted to answer alike; `SUBJECT_POSITIONS` and
   `caseEditionClaimed` are this module's alone (N211). No name is read from the check catalogue (T19 rule 1): the
   shared grammar is record-grammar's, and C-2.8's inquiry arm runs through the grammars registered on a record. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as R from "../../../src/ratification/checks.mjs";
import * as RG from "../../../src/record-grammar/index.mjs";
import { world } from "./fixture.mjs";
import { isNoticeReference } from "../../../src/case-grammar/index.mjs";

const PIN = "a".repeat(64);
const M1 = "INQ-2026-0001-first", M2 = "INQ-2026-0002-second";

/* A bio-case-document/5 (the format op=publish authors; T17's finding) that draws no finding: every field the catalogue asks of a case document, and each member's
   frozen blocks as rule 12 states them (the case-member arm of C-2.8 runs over those). */
function doc() {
  return {
    format: "bio-case-document/5",
    case_id: "CASE-2026-0001", case_edition: 2, case_project: "PROJ-2026-0001-watch",
    case_scope: "whether the permits were issued as the minutes say",
    bias_acknowledgement: "we set out expecting the permits were late",
    case_findings: [M1, M2],
    case_roles: [{ target: M1, role: "load_bearing", version_sha: PIN, edition: 1 },
                 { target: M2, role: "supporting", version_sha: "b".repeat(64), edition: 3 }],
    completeness: { statement: "the 2019 permits are not covered", author: "alice", at: "2026-09-28T00:00:00Z",
                    subject_position: "not_sought", subject_justification: "the office is closed until October",
                    acknowledged: 1, statement_by: "bob" },
    completeness_acknowledgements: [{ kind: "participant", by: "carol", at: "2026-09-27T00:00:00Z" }],
    completeness_excluded: [{ target: null, description: "the 2019 permits", reason: "not yet requested" }],
    searched: { subject_source: "case_basis", subjects: 2 }, searched_levels: [],
    required_strength: { declared: true, capture: "B", connection: null },
    bias_manifest: { in_force: false, stated: "no manifest was in force", pins_proposed: 0,
                     pins_proposed_stated: "no adoption pinned a proposed revision" },
    bias_manifest_bundles: [], bias_manifest_pins_proposed: [],
    case_citations: [{ target: "INFO-2026-0001-minutes", version: "pinned", capture: "c".repeat(64) },
                     { target: "INFO-2026-0002-memo", version: "undetermined", capture: null }],
    case_strength: [M1, M2].flatMap((t) => [{ target: t, axis: "capture", state: "graded", grade: "B" },
                                            { target: t, axis: "connection", state: "unrated", grade: null }]),
    case_strength_grounds: [], case_tensions: [], case_tension_sentences: [], case_tensions_unread: [],
  };
}
const CTX = { caseId: "CASE-2026-0001", edition: 2 };
const BODY = "# Case\n\n## What This Excludes\n\nthe 2019 permits\n\n## What Changed in This Edition, and Why\n\nThe 2019 permits were added.\n";
const NO_WC = "# Case\n\n## What This Excludes\n\nthe 2019 permits\n";
const checks = (fm, ctx = CTX) => R.checkCaseDocument(fm, ctx).map((x) => x.check);
const fires = (mutate, check, ctx = CTX) => R.checkCaseDocument(mutate(doc()), ctx).some((x) => x.check === check);

/* The seventeen arms of C-41, each with the one mutation that fires it (casesign's list, extended to every arm). */
const ARMS = [
  ["FORMAT", "C-41.1", (d) => { d.format = "bio-case-document/9"; return d; }],
  ["IDENTITY", "C-41.2", (d) => { d.case_id = "CASE-2026-9999"; return d; }],
  ["EDITION", "C-41.3", (d) => { d.case_edition = 7; return d; }],
  ["PROJECT", "C-41.4", (d) => { d.case_project = "null"; return d; }],
  ["SCOPE", "C-41.5", (d) => { d.case_scope = " "; return d; }],
  ["BIAS", "C-41.6", (d) => { d.bias_acknowledgement = ""; return d; }],
  ["ROSTER", "C-41.7", (d) => { d.case_findings = []; return d; }, ["C-41.8"]],   /* the roles now name non-members */
  ["ROLES", "C-41.8", (d) => { d.case_roles = d.case_roles.map((r) => ({ ...r, role: "supporting" })); return d; }],
  ["PINS", "C-41.9", (d) => { d.case_roles[0].version_sha = "short"; return d; }],
  ["COMPLETENESS", "C-41.10", (d) => { d.searched.subject_source = "observation_log"; return d; }],
  ["EXCLUDED", "C-41.11", (d) => { delete d.completeness_excluded; return d; }, ["C-2.8"]],   /* and each member's copy of it */
  ["BAR", "C-41.12", (d) => { d.required_strength = { declared: true, capture: null, connection: null }; return d; }],
  ["DISCLOSURES", "C-41.13", (d) => { delete d.completeness.statement_by; return d; }],
  ["PENDING", "C-41.14", (d) => { d.bias_manifest.pins_proposed = 1; return d; }],
  ["CITATIONS", "C-41.15", (d) => { d.case_citations[0].capture = null; return d; }],
  /* asked only over a body: edition 2 with no "What changed" section */
  ["WHAT_CHANGED", "C-41.16", (d) => d, [], { ...CTX, body: NO_WC }],
  ["WORKING_ON", "C-41.17", (d) => { d.working_on = "not a notice"; return d; }],
];

test("R8: the baseline /5 case document draws no finding, with its body, member basis and a fresh prior edition; a /4 one, read as written, neither but C-41.16 (its format carries no What-changed statement)", () => {
  assert.deepEqual(checks(doc(), { ...CTX, body: BODY, memberBasis: { [M1]: [], [M2]: [] },
                                   priorCase: { edition: 1, statement: "older", bias_acknowledgement: "older" } }), []);
  const v4 = doc(); v4.format = "bio-case-document/4";
  for (const k of ["case_tensions", "case_tension_sentences", "case_tensions_unread"]) delete v4[k];
  assert.deepEqual(checks(v4, { ...CTX, body: BODY }), ["C-41.16"], "case-grammar reads no statement in a /4 edition 2");
  assert.deepEqual(checks({ ...v4, case_edition: 1 }, { ...CTX, edition: 1, body: BODY }), [], "edition 1 is not asked");
});

test("R8, R38: each of C-41.1–C-41.17 is declared in CASE_DOCUMENT_FAMILY and fires on its own mutation, and the arms cover the family exactly", () => {
  for (const [key, num, mutate, also = [], ctx = CTX] of ARMS) {
    assert.equal(R.CASE_DOCUMENT_FAMILY[key].check, num);
    assert.equal(fires(mutate, num, ctx), true, `${num} fires`);
    assert.deepEqual(R.checkCaseDocument(mutate(doc()), ctx).filter((x) => x.check !== num && !also.includes(x.check)), [],
      `${num}'s mutation draws no other finding`);
  }
  assert.deepEqual(ARMS.map(([k]) => k).sort(), Object.keys(R.CASE_DOCUMENT_FAMILY).sort());
  assert.deepEqual(Object.values(R.CASE_DOCUMENT_FAMILY).map((v) => v.check),
    Array.from({ length: 17 }, (_, i) => `C-41.${i + 1}`));
});

test("R8: the case arms of C-2.8 (each member's frozen blocks, as the document states them), C-3.1 (the section) and C-21.1 (a statement or acknowledgement reprinted from the previous edition)", () => {
  const noPair = doc(); noPair.case_strength = noPair.case_strength.filter((r) => !(r.target === M2 && r.axis === "capture"));
  const c28 = R.checkCaseDocument(noPair, CTX).filter((x) => x.check === "C-2.8");
  assert.equal(c28.length, 1);
  assert.match(c28[0].message, new RegExp(`^case document, member ${M2}: `), "prefixed with the member it is about");
  assert.ok(checks((() => { const d = doc(); delete d.case_strength; return d; })()).includes("C-2.8"), "the field itself");
  assert.ok(checks((() => { const d = doc(); d.case_roles[1].edition = 0; return d; })()).includes("C-2.8"), "a member's edition");
  assert.deepEqual(checks(doc(), { ...CTX, body: "# Case\n\nno section\n\n## What Changed in This Edition, and Why\n\nx\n" }), ["C-3.1"]);
  assert.deepEqual(checks(doc(), { ...CTX, body: null }), [], "C-3.1 is asked only when the body is supplied");
  assert.deepEqual(checks(doc(), { ...CTX, priorCase: { edition: 1, statement: doc().completeness.statement,
                                                        bias_acknowledgement: doc().bias_acknowledgement } }),
    ["C-21.1", "C-21.1"]);
  const legacy = doc(); legacy.format = "bio-case-document/1"; delete legacy.case_strength;
  delete legacy.bias_manifest; delete legacy.case_citations; delete legacy.bias_manifest_pins_proposed;
  assert.deepEqual(checks(legacy, { ...CTX, body: "no section" }), ["C-41.16"],
    "a /1 document states no member blocks and is not asked them; as an edition 2 it states no change either");
});

test("R8, R14: C-41.16 — an edition above 1 with no \"What changed\" statement, a blank one, or one its block's hash disowns is refused with R8's translation word for word; edition 1 without one, and edition 2 with one, pass", () => {
  const msg = "A new edition of a case says what changed in it, and why, before it is signed. This one does not. Write the "
            + "statement, then sign. Nothing was signed.";
  const wc = (body) => R.checkCaseDocument(doc(), { ...CTX, body }).filter((x) => x.check === "C-41.16");
  for (const body of [NO_WC, `${NO_WC}\n## What Changed in This Edition, and Why\n\n   \n`]) {
    const got = wc(body);
    assert.equal(got.length, 1);
    assert.deepEqual([got[0].severity, got[0].message], ["error", msg]);
  }
  const block = doc(); block.what_changed = { statement_sha: "0".repeat(64), began_as: "member", draft: null, adopted_as_drafted: null };
  assert.equal(R.checkCaseDocument(block, { ...CTX, body: BODY }).filter((x) => x.check === "C-41.16").length, 1,
    "a statement its block's hash disowns is no statement (case-grammar R8)");
  assert.deepEqual(wc(BODY), [], "edition 2 with a statement passes");
  const first = doc(); first.case_edition = 1;
  assert.deepEqual(R.checkCaseDocument(first, { ...CTX, edition: 1, body: NO_WC }).map((x) => x.check), [], "edition 1 is not asked");
  assert.deepEqual(wc(null), [], "asked only when the body is supplied");
});

test("R8: an absent member basis leaves the basis arms unasked; a present one asks them (the testimony row)", () => {
  const leg = [{ target: "INFO-2026-0003-said", role: "supports", grade: "D", grade_axis: "testimony", grade_source: "testimony" }];
  assert.deepEqual(checks(doc(), { ...CTX, memberBasis: null }), []);
  assert.deepEqual(checks(doc(), { ...CTX, memberBasis: { [M2]: [] } }), [], "a member absent from the map is not asked");
  const asked = R.checkCaseDocument(doc(), { ...CTX, memberBasis: { [M1]: leg } });
  assert.deepEqual(asked.map((x) => [x.check, x.code]), [["C-2.8", "testimony-axis-unfrozen"]]);
});

test("R8: pure over any input, never throws, and each finding names its check", () => {
  for (const fm of [null, undefined, 3, "x", [], {}, { case_roles: "x", case_findings: {}, completeness: 7 },
                    { format: "bio-case-document/4", completeness_acknowledgements: [null, 4], bias_manifest: [] }]) {
    const out = R.checkCaseDocument(fm, { memberBasis: { [M1]: "not a list" } });
    assert.ok(Array.isArray(out) && out.length > 0);
    for (const x of out) assert.match(x.check, /^C-(41\.\d+|2\.8|3\.1|21\.1)$/);
  }
  assert.doesNotThrow(() => R.checkCaseDocument(doc()));
  const d = doc(); const before = JSON.stringify(d); R.checkCaseDocument(d, CTX); assert.equal(JSON.stringify(d), before);
});

test("R8: CASE_CITATION_VERSIONS and SEARCHED_SUBJECT_SOURCES are exported; C-41.10 refuses any source but case_basis", () => {
  assert.deepEqual(R.CASE_CITATION_VERSIONS, ["pinned", "only_capture", "undetermined", "no_capture", "no_bytes"]);
  assert.deepEqual(Object.keys(R.SEARCHED_SUBJECT_SOURCES), ["case_basis"]);
  for (const v of R.CASE_CITATION_VERSIONS) {
    const d = doc(); d.case_citations = [{ target: "INFO-2026-0001-x", version: v,
                                           capture: v === "pinned" || v === "only_capture" ? PIN : null }];
    assert.deepEqual(checks(d), [], `${v} with the capture exactly where it names one`);
  }
  for (const src of ["observation_log", "", undefined]) {
    const d = doc(); d.searched.subject_source = src;
    assert.deepEqual(checks(d), ["C-41.10"]);
  }
});

test("R38: C-41.17 refuses a present working_on that is not a notice id by case-grammar R10's rule, null and empty included, before any write; a notice id and an absent field pass", () => {
  const with_ = (v) => { const d = doc(); d.working_on = v; return d; };
  for (const v of ["NOTICE-2026-0001", "NOTE-2026-0042-permits-late", "WO-2026-0003-a-b"])
    assert.deepEqual(checks(with_(v), { ...CTX, body: BODY }), [], `${v} is a notice id`);
  assert.deepEqual(checks(doc(), { ...CTX, body: BODY }), [], "absent: the case names no notice");
  for (const v of [null, "null", undefined, "", " ", "notice-2026-0001", "NOTICE-26-1", "NOTICE-2026-0001-", "NOTICE-2026-0001-Upper", "PROJ 2026 0001",
                   "https://example.org/notice", 7, true, ["NOTICE-2026-0001"], { id: "NOTICE-2026-0001" }]) {
    const got = R.checkCaseDocument(with_(v), CTX);
    assert.deepEqual(got.map((x) => [x.check, x.severity]), [["C-41.17", "error"]], JSON.stringify(v));
    assert.match(got[0].message, /is not a notice id/);
  }
  /* the arm and case-grammar's predicate agree over every value asked above */
  for (const v of ["NOTICE-2026-0001", "x", 3]) assert.equal(fires((d) => { d.working_on = v; return d; }, "C-41.17"), !isNoticeReference(v));
});

/* N211 (T18): the catalogue's copies of `SUBJECT_POSITIONS` and `caseEditionClaimed` were deleted, every importer reading
   this module's, their owner (Decided 4, 6); the shared grammar below this module, record-grammar, holds neither and
   keeps `isCaseMemberBytes` for C-3.1's heading rule (N69). */
test("R9, N211: SUBJECT_POSITIONS and caseEditionClaimed are this module's alone; the shared grammar does not export them", () => {
  assert.equal(RG.SUBJECT_POSITIONS, undefined);
  assert.equal(RG.caseEditionClaimed, undefined);
  assert.equal(typeof RG.isCaseMemberBytes, "function", "negative control: the copy C-3.1 reads is found there");
  assert.deepEqual(R.SUBJECT_POSITIONS, ["sought_and_answered", "sought_no_answer", "not_sought"]);
});

/* A legacy (/1) case member's own bytes: the frozen blocks C-2.8's case-member arm requires. */
function member() {
  return { id: M1, object_type: "inquiry", edition: 1,
           completeness: { statement: "s", author: "alice", at: "2026-09-28T00:00:00Z", subject_position: "sought_no_answer",
                           subject_justification: "asked twice" },
           completeness_excluded: [],
           published_strength: [{ axis: "capture", state: "graded", grade: "C" }, { axis: "connection", state: "undetermined", grade: null }] };
}
const armOf = (fm) => R.caseMemberFindings(fm).map((x) => x.check);

test("R9: checkPublishedExtension is C-2.8's case-member arm: a well-formed member draws nothing, and each block it requires is refused when missing or malformed", () => {
  assert.deepEqual(armOf(member()), []);
  const bad = [
    (m) => { m.edition = 0; }, (m) => { delete m.completeness; }, (m) => { m.completeness.statement = ""; },
    (m) => { m.completeness.author = ""; }, (m) => { m.completeness.at = "yesterday"; },
    (m) => { m.completeness.subject_position = "contacted"; }, (m) => { m.completeness.subject_justification = " "; },
    (m) => { delete m.completeness_excluded; }, (m) => { m.completeness_excluded = [{ reason: "x" }]; },
    (m) => { m.completeness_excluded = [{ description: "x" }]; },
    (m) => { m.published_strength.push({ axis: "capture", state: "unrated", grade: null }); },
    (m) => { m.published_strength[0].state = "strong"; }, (m) => { m.published_strength[0].grade = null; },
    (m) => { m.published_strength[1].grade = "A"; },
    (m) => { m.basis = [{ target: "INFO-2026-0001-x", role: "supports", grade: "A", grade_axis: "capture", ground: "g1" }]; },
    (m) => { m.basis = [{ target: "INFO-2026-0001-x", role: "supports", grade: "D", grade_axis: "testimony" }]; },
  ];
  for (const mutate of bad) {
    const m = member(); mutate(m);
    assert.ok(armOf(m).length >= 1 && armOf(m).every((c) => c === "C-2.8"), mutate.toString());
  }
  const out = []; R.checkPublishedExtension(member(), out); assert.deepEqual(out, [], "exported, and it appends to the list it is given");
});

test("R9: the arm is asked only of bytes isCaseMemberBytes answers true for, over a gate image and an audit image alike", () => {
  const unframed = member(); unframed.published_strength = []; unframed.edition = 0;
  assert.deepEqual(armOf(unframed), [], "a stray empty frozen block does not drag a working document into the ceremony");
  const md = (fm) => `---\nid: ${M1}\nobject_type: inquiry\nedition: ${fm.edition}\npublished_strength:\n`
    + fm.published_strength.map((a) => `  - axis: ${a.axis}\n    state: ${a.state}\n    grade: ${a.grade ?? "null"}\n`).join("")
    + "---\n\n# x\n";
  const parse = RG.parseFrontmatter;
  assert.deepEqual(R.caseMemberImageFindings({ "bundle.md": md(member()) }, parse).map((x) => x.check),
    ["C-2.8", "C-2.8"], "the completeness block and the exclusion field are missing from these bytes");
  assert.deepEqual(R.caseMemberImageFindings({ files: new Map([["bundle.md", md(member())]]) }, parse).length, 2);
  assert.deepEqual(R.caseMemberImageFindings({ "bundle.md": { blobSha: PIN } }, parse), [], "a blob is not read");
  const gate = { gateVersion: "g", ok: true, findings: [], warnings: 0 };
  const joined = R.withCaseMemberChecks({ "bundle.md": md(member()) }, gate, parse);
  assert.deepEqual([joined.ok, joined.findings.map((x) => x.check), joined.gateVersion], [false, ["C-2.8", "C-2.8"], "g"]);
  assert.equal(R.withCaseMemberChecks({ "bundle.md": "---\nid: x\n---\n" }, gate, parse), gate, "nothing to join: the gate's own answer");
});

test("R9: caseEditionClaimed, isCaseMemberBytes, completenessFields, biasAcknowledgementOf, CASE_MEMBER_ROLES and SUBJECT_POSITIONS are exported and pure", () => {
  assert.deepEqual(R.CASE_MEMBER_ROLES, ["load_bearing", "supporting"]);
  assert.deepEqual(R.SUBJECT_POSITIONS, ["sought_and_answered", "sought_no_answer", "not_sought"]);
  for (const [v, want] of [[undefined, false], [null, false], ["", false], ["null", false], [1, true], ["2", true]])
    assert.equal(R.caseEditionClaimed({ case_edition: v }), want, JSON.stringify(v));
  assert.equal(R.caseEditionClaimed(null), false);
  assert.equal(R.isCaseMemberBytes(member()), true);
  for (const s of [[], [{ axis: "capture" }], [{ axis: "capture" }, null], [{ axis: 1 }, { axis: "connection" }], "x", undefined])
    assert.equal(R.isCaseMemberBytes({ published_strength: s }), false, JSON.stringify(s));
  const three = [{ axis: "capture" }, { axis: "connection" }, { axis: "testimony" }];
  assert.equal(R.isCaseMemberBytes({ published_strength: three }), true, "a testimony axis keeps it a member (MK-2)");
  assert.deepEqual(R.completenessFields({ completeness: { statement: "s", subject_justification: "j", author: "a", at: "t" },
                                          completeness_excluded: [{ target: "INFO-2026-0001-x", description: "d", reason: "r" }, null] }),
    { statement: "s", subject_justification: "j", excluded: JSON.stringify([["INFO-2026-0001-x", "d", "r"], [null, "", ""]]) });
  assert.deepEqual(R.completenessFields(undefined), { statement: null, subject_justification: null, excluded: "[]" });
  assert.equal(R.biasAcknowledgementOf({ bias_acknowledgement: "b" }), "b");
  for (const v of [null, "null", 3, undefined]) assert.equal(R.biasAcknowledgementOf({ bias_acknowledgement: v }), null);
});

test("R9, N69: isCaseMemberBytes and the copy record-grammar keeps for C-3.1's heading rule answer alike over the case-member fixtures", () => {
  const cases = [member(), {}, null, { published_strength: [] }, { published_strength: [{ axis: "capture" }, { axis: "connection" }] },
                 { published_strength: [{ axis: "capture" }, { axis: 2 }] }, { published_strength: [null, null] },
                 { published_strength: [{ axis: "capture" }, { axis: "connection" }, { axis: "testimony" }] }];
  for (const fm of cases) assert.equal(R.isCaseMemberBytes(fm), RG.isCaseMemberBytes(fm), JSON.stringify(fm));
});

test("R14: the inquiry grammar a record runs (C-2.8's inquiry arm) asks no case-member question; this module's registration does", async () => {
  const text = `---\nid: ${M1}\nobject_type: inquiry\ntitle: t\ncurrent_state: concluded\ncreated: 2026-09-01T00:00:00Z\n`
    + `last_updated: 2026-09-01T00:00:00Z\nsurfaced_by: human\nedition: 0\npublished_strength:\n  - axis: capture\n    state: graded\n    grade: A\n`
    + `  - axis: connection\n    state: graded\n    grade: A\n---\n\n# t\n`;
  /* record-grammar's checkBundle with the grammars registered on a record (record-core R67), as promotion's gate runs it */
  const grammars = world().record.grammars();
  assert.ok(grammars.some((g) => g.ids.includes("C-2.8")), "negative control: the record runs a C-2.8 grammar");
  const r = await RG.checkBundle({ folderName: M1, files: new Map([["bundle.md", text]]) }, { grammars });
  assert.ok(r.findings.some((x) => x.check === "C-2.8"), "negative control: C-2.8's inquiry arm was asked of these bytes");
  const caseMember = r.findings.filter((x) => x.check === "C-2.8" && /case member/.test(x.message));
  assert.deepEqual(caseMember, [], "the record's grammar does not ask it");
  assert.ok(R.caseMemberFindings(RG.parseFrontmatter(text).data).some((x) => /integer edition/.test(x.message)));
});

/* Every row family this module exports (an object whose entries carry a `check`), named by export, that holds the code
   or the check id: read over the whole module, so no family's name is assumed. Each row has one home here (T19 rule 1:
   the catalogue's copies go with its tables). */
const familiesHolding = (code, check) => Object.entries(R)
  .filter(([, fam]) => fam && typeof fam === "object" && !Array.isArray(fam)
    && Object.values(fam).some((row) => typeof row?.check === "string"))
  .filter(([, fam]) => Object.hasOwn(fam, code) || Object.values(fam).some((row) => row?.check === check))
  .map(([name]) => name);

test("R14: C-32.12–C-32.15, C-53.10–C-53.12, C-58.1–C-58.5, C-65.1 and C-92.10–C-92.12 moved here with their codes, ids and translations, each row in one family of this module", () => {
  const want = {
    RATIFY_MACHINE_FENCE_CHECKS: { MACHINE_CANNOT_RATIFY: "C-32.12", MACHINE_CANNOT_RATIFY_CASE: "C-32.13",
                                   OPERATOR_TOKEN_CANNOT_RATIFY: "C-32.14", OPERATOR_TOKEN_CANNOT_RATIFY_CASE: "C-32.15" },
    RATIFY_TESTIMONY_CHECKS: { TESTIMONY_UNPUBLISHABLE: "C-53.10", TESTIMONY_CITED_UNPUBLISHABLE: "C-53.11",
                               TESTIMONY_CASE_UNPUBLISHABLE: "C-53.12" },
    RATIFY_ATTRIBUTION_CHECKS: { ATTRIBUTION_UNCHOSEN: "C-92.10", ATTRIBUTION_STATEMENT_STALE: "C-92.11",
                                 ATTRIBUTION_UNSTATED: "C-92.12" },
    CASE_CONCLUSION_CHECKS: { CASE_CONCLUSION_MOVED: "C-65.1" },
    RATIFY_SCOPE_CHECKS: { RATIFY_PROJECT_BUNDLE: "C-58.1", RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE: "C-58.2",
                           RATIFY_NOT_EVIDENCE_OF_A_RATIFIED_CASE: "C-58.3", CONTESTED_IN_BATCH: "C-58.4",
                           ANONYMOUS_TESTIMONY_UNCORROBORATED: "C-58.5" },
  };
  for (const [fam, rows] of Object.entries(want)) {
    assert.deepEqual(Object.fromEntries(Object.entries(R[fam]).map(([k, v]) => [k, v.check])), rows, fam);
    for (const [code, v] of Object.entries(R[fam])) {
      assert.match(v.where, /^src\/ratification\/(ops|index|refusals|release)\.mjs \w+ > is-[a-z-]+$/, code);
      assert.ok(typeof v.translation === "string" && v.translation.length > 60, code);
      assert.deepEqual(R.rowOf(code), { code, check: v.check, translation: v.translation });
      assert.deepEqual(familiesHolding(code, v.check), [fam], `${code}'s one home`);
    }
  }
  assert.deepEqual(familiesHolding("MACHINE_CANNOT_RELEASE", "C-32.1"), ["RELEASE_CHECKS"],
    "negative control: the walk finds a row this module holds outside the families above");
  assert.throws(() => R.rowOf("NOT_A_CODE"), /DEC-49/);
});

/* R14's two new rows (K1058), stamped by 1.53.0 (PROMOTION #24, T23 layer 2): their translations are R14's, word for word. */
test("R14, R22, R35: C-58.4 CONTESTED_IN_BATCH and C-58.5 ANONYMOUS_TESTIMONY_UNCORROBORATED carry R14's translations word for word, minted where R22 and R35 refuse", () => {
  assert.deepEqual(R.rowOf("CONTESTED_IN_BATCH"), { code: "CONTESTED_IN_BATCH", check: "C-58.4",
    translation: "Some of these documents are contested: a contradiction touching each is not yet resolved, and "
      + "contested material is never released in a batch. They are named. Nothing was released." });
  assert.deepEqual(R.rowOf("ANONYMOUS_TESTIMONY_UNCORROBORATED"), { code: "ANONYMOUS_TESTIMONY_UNCORROBORATED",
    check: "C-58.5",
    translation: "This edition rests on testimony credited only to the group or the project, with no independent "
      + "leg corroborating it. Such testimony counts as an anonymous tip and supports a finding only beside an "
      + "independent corroborating leg. Each such member and observation is named. Corroborate the claim with an "
      + "independent leg, ask the observation's author to choose cover or name, or drop the finding that rests on "
      + "it. Nothing was signed." });
  assert.equal(R.RATIFY_SCOPE_CHECKS.CONTESTED_IN_BATCH.where, "src/ratification/release.mjs release > is-release-contested");
  assert.equal(R.RATIFY_SCOPE_CHECKS.ANONYMOUS_TESTIMONY_UNCORROBORATED.where,
               "src/ratification/refusals.mjs anonymousTestimonyRefusal > is-anonymous-testimony");
});

test("R15: no place is named in the catalogue's rows, vocabularies or findings", () => {
  const said = JSON.stringify([
    R.RATIFY_MACHINE_FENCE_CHECKS, R.RATIFY_TESTIMONY_CHECKS, R.RATIFY_ATTRIBUTION_CHECKS, R.CASE_CONCLUSION_CHECKS,
    R.RATIFY_SCOPE_CHECKS, R.CASE_DOCUMENT_FAMILY, R.SEARCHED_SUBJECT_SOURCES,
    ...ARMS.map(([, , m]) => R.checkCaseDocument(m(doc()), CTX)), R.checkCaseDocument({}, {}), R.caseMemberFindings({ published_strength: [{ axis: "a" }, { axis: "b" }] }),
  ]);
  assert.doesNotMatch(said, /oakland|alameda|california|berkeley/i);
});
