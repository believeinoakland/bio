/* case-disclosures (DEC-96 item 4; N522): another group's work a case rests on — its acceptance stated (R13) and its
   open flags disclosed, never blocking (R14) — at this module's interface: `acceptedWorkJudged`, `flagsJudged`,
   `disclosureBlocks`' flags and `acceptedBodyLines`. Ported from case-authoring's `rests` and `imported` arms (N529).
   `case-import` is the fixture's stand-in at its ruled interface (its R4, R9, R16), and the real one in the last two
   arms, its case file built as case-import's own suite builds one. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { CASE_DISCLOSURE_CHECKS, FLAG_SENTENCE, FLAGS_SAY, acceptedBodyLines, acceptedWorkRow, flagsListed } from "../../../src/case-disclosures/index.mjs";
import { CASE_DOCUMENT_FORMAT, acceptedWorkBlockLines, acceptedWorkOf } from "../../../src/case-grammar/index.mjs";
import { caseFile, SOURCE, CASE } from "../case-import/fixture.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const IMP = "a".repeat(64), THEIRS = "INQ-2026-0042-x";
const AT = "2026-09-28T01:00:00Z";
function refused(r, code) {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
    [code, code, CASE_DISCLOSURE_CHECKS[code].check, CASE_DISCLOSURE_CHECKS[code].translation]);
}
function onTheirs(over = {}) {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  w.doc(DOC);
  w.imports.edition(IMP, 2, { findings: [{ finding: THEIRS, result: "recreated", pair: { capture: "B", connection: "C" } }] });
  const ref = w.imports.accept(IMP, 2, THEIRS, over);
  w.finding(Q, [{ target: DOC }, { target: ref, target_edition: 2 }]);
  const refs = w.cd.materialsJudged(w.prepared([Q]), w.roles([Q]), V("alice")).refs;
  return { w, ref, refs };
}

test("R13: acceptedWorkJudged reads, for each ref leg, case-import's acceptance and imported edition at the leg's target_edition (from the inquiry's own bundle.md), and answers accepted_work rows — who accepted which edition, when and why, the result, the gaps and the pair — never what was checked; editions for R14", () => {
  const { w, ref, refs } = onTheirs({ gaps: "the third page's image was not carried" });
  assert.deepEqual(refs, [{ member: Q, leg_of: Q, ord: 1, ref }]);
  const a = w.cd.acceptedWorkJudged(refs, V("alice"));
  assert.deepEqual(a.refusals, []);
  assert.deepEqual(a.rows, [{ member: Q, leg_of: Q, ref, group: "other-group", case: "CASE-2026-0900", edition: 2, finding: THEIRS,
    manifest_sha: "f".repeat(64), pair: { capture: "B", connection: "C" }, result: "recreated",
    gaps: "the third page's image was not carried", accepted_by: "alice", accepted_at: "2026-09-27T00:00:00Z",
    reason: "We recreated it whole." }]);
  assert.equal(JSON.stringify(a).includes("every passage"), false, "what was checked stays inside the group");
  assert.deepEqual(a.editions, [{ import: IMP, edition: 2, refs: [{ ref, finding: THEIRS, member: Q }] }]);
  /* the rows are case-grammar R16's, read back by its one reader */
  const fm = w.fm(["---", `format: ${CASE_DOCUMENT_FORMAT}`, ...acceptedWorkBlockLines({ rows: a.rows, flags: [] }), "---", ""].join("\n"));
  assert.deepEqual(acceptedWorkOf(fm).rows.map((r) => [r.ref, r.edition, r.reason]), [[ref, 2, "We recreated it whole."]]);
  const body = acceptedBodyLines({ rows: a.rows, flags: [] }).join("\n");
  assert.ok(body.includes("## Another Group's Work This Case Rests On"));
  assert.ok(body.includes(`- ${Q} rests, through ${Q}, on ${THEIRS} of other-group's case CASE-2026-0900, edition 2: accepted by alice on 2026-09-27T00:00:00Z, because: We recreated it whole.. It was recreated from that case file, with the gaps stated: the third page's image was not carried.`));
  /* the reason's own full stop is followed by the sentence's (`whole..`): the bytes as signed before the split (K1333) */
  assert.ok(body.includes("No flag was open on that work when this case was published."));
  assert.deepEqual(acceptedBodyLines({ rows: [], flags: [] }), [], "no accepted work: no section");
  assert.deepEqual(acceptedWorkRow({ member: "m", leg_of: "l", ref: "r", target_edition: 3 }, { finding: "f" }, {}, null, null),
    { member: "m", leg_of: "l", ref: "r", group: null, case: null, edition: 3, finding: "f", manifest_sha: null, pair: null,
      result: null, gaps: null, accepted_by: null, accepted_at: null, reason: null });
});

test("R13 (C-120.10): a leg with no acceptance in force — withdrawn, or a read that fails or throws — is ACCEPTED_WORK_NOT_IN_FORCE, naming the member, the leg and the source case and edition; it writes nothing", () => {
  const { w, ref, refs } = onTheirs();
  w.imports.withdraw(IMP, 2, THEIRS);
  const before = w.snapshot();
  const a = w.cd.acceptedWorkJudged(refs, V("alice"));
  refused(a.refusals[0], "ACCEPTED_WORK_NOT_IN_FORCE");
  assert.deepEqual(a.refusals[0].not_in_force, [{ target: Q, leg_of: Q, ord: 1, ref, source: { group: "other-group", case: "CASE-2026-0900", edition: 2 } }]);
  assert.deepEqual([a.rows, a.editions], [[], []]);
  assert.deepEqual(w.snapshot(), before);
  w.imports.accept(IMP, 2, THEIRS);
  assert.deepEqual(w.cd.acceptedWorkJudged(refs, V("alice")).refusals, [], "accepted again");
  /* a read that fails closed */
  for (const caseImport of [{ acceptanceOf: () => { throw new Error("down"); }, importedCase: () => { throw new Error("down"); } },
                            { acceptanceOf: () => ({ ok: false, reason: "NO" }), importedCase: () => null }]) {
    const x = world({ deps: { caseImport } });
    const r = x.cd.acceptedWorkJudged([{ member: Q, leg_of: Q, ord: 1, ref }], V("alice"));
    refused(r.refusals[0], "ACCEPTED_WORK_NOT_IN_FORCE");
    assert.deepEqual(r.refusals[0].not_in_force[0].source, { group: null, case: null, edition: null }, "no bundle: no edition");
  }
});

test("R14 (C-120.11–C-120.13): an open flag is FLAG_NOT_DISCLOSED until listed; a listed flag not open FLAG_DISCLOSURE_NOT_STANDING, after it; a failed or incomplete read FLAGS_UNDETERMINED, alone; a malformed list BAD_COMPLETENESS naming the field, alone; never refused because a flag is open", () => {
  const { w, ref, refs } = onTheirs();
  const editions = w.cd.acceptedWorkJudged(refs, V("alice")).editions;
  w.imports.flag(IMP, 2, { flag: "IMPFLAG-1", finding: THEIRS, issue: "page 3 is misread" });
  const before = w.snapshot();
  const j = w.cd.flagsJudged(editions, null);
  assert.deepEqual(j.refusals.map((r) => r.reason), ["FLAG_NOT_DISCLOSED"]);
  refused(j.refusals[0], "FLAG_NOT_DISCLOSED");
  assert.deepEqual(j.refusals[0].undisclosed, [{ flag: "IMPFLAG-1", ref, edition: 2, issue: "page 3 is misread" }]);
  assert.deepEqual(j.open, [{ flag: "IMPFLAG-1", finding: THEIRS, issue: "page 3 is misread", at: "2026-09-27T00:00:00Z", import: IMP, edition: 2, ref }]);
  assert.deepEqual(w.cd.flagsJudged(editions, [{ flag: "IMPFLAG-9" }]).refusals.map((r) => r.reason),
    ["FLAG_NOT_DISCLOSED", "FLAG_DISCLOSURE_NOT_STANDING"]);
  const ns = w.cd.flagsJudged(editions, [{ flag: "IMPFLAG-1" }, { flag: "IMPFLAG-9" }]).refusals;
  refused(ns[0], "FLAG_DISCLOSURE_NOT_STANDING");
  assert.deepEqual(ns[0].not_standing, [{ flag: "IMPFLAG-9", ord: 1 }]);
  for (const [list, field] of [["x", "flagsDisclosed"], [[{}], "flagsDisclosed[0]"], [[{ flag: "IMPFLAG-1", words: 3 }], "flagsDisclosed[0].words"],
                               [[{ flag: "IMPFLAG-1", words: 'a "q"' }], "flagsDisclosed[0].words"],
                               [[{ flag: "IMPFLAG-1", words: "x".repeat(2001) }], "flagsDisclosed[0].words"]])
    assert.deepEqual(w.cd.flagsJudged(editions, list).refusals.map((r) => [r.reason, r.field]), [["BAD_COMPLETENESS", field]]);
  for (const answer of [{ ok: true, complete: false, flags: [] }, { ok: true, truncated: true, flags: [] }, { ok: false, reason: "NO_SUCH_IMPORT" }, null, "throws"]) {
    w.imports.flagsRead = () => { if (answer === "throws") throw new Error("down"); return answer; };
    const u = w.cd.flagsJudged(editions, [{ flag: "IMPFLAG-1" }, { flag: "IMPFLAG-9" }]);
    assert.deepEqual(u.refusals.map((r) => r.reason), ["FLAGS_UNDETERMINED"], JSON.stringify(answer));
    refused(u.refusals[0], "FLAGS_UNDETERMINED");
    assert.deepEqual(u.refusals[0].undetermined.map((x) => [x.import, x.edition]), [[IMP, 2]]);
  }
  w.imports.flagsRead = null;
  assert.deepEqual(w.snapshot(), before, "nothing written");
  const ok = w.cd.flagsJudged(editions, [{ flag: "IMPFLAG-1", words: "we checked page 3 ourselves" }, { flag: "IMPFLAG-1", words: "later" }]);
  assert.deepEqual([ok.refusals, ok.byFlag.get("IMPFLAG-1").words], [[], "we checked page 3 ourselves"]);
  w.imports.clear("IMPFLAG-1");
  refused(w.cd.flagsJudged(editions, [{ flag: "IMPFLAG-1" }]).refusals[0], "FLAG_DISCLOSURE_NOT_STANDING");
  assert.deepEqual(w.cd.flagsJudged(editions, null), { refusals: [], open: [], byFlag: new Map() });
  assert.deepEqual(flagsListed(undefined), { ok: true, byFlag: new Map() });
});

test("R14: disclosureBlocks' flags carry the issue, when it was flagged, the owner's words, acknowledged_by (the author stamp) and the instant, the flagging member unnamed; FLAG_SENTENCE and FLAGS_SAY are the plain sentences", () => {
  const { w, ref, refs } = onTheirs();
  const a = w.cd.acceptedWorkJudged(refs, V("alice"));
  w.imports.flag(IMP, 2, { flag: "IMPFLAG-1", finding: THEIRS, issue: "page 3 is misread", by: "bo" });
  const j = w.cd.flagsJudged(a.editions, [{ flag: "IMPFLAG-1", words: "we checked page 3 ourselves" }]);
  const { flags } = w.cd.disclosureBlocks({ flags: j, author: "alice", at: AT });
  assert.deepEqual(flags, [{ ref, edition: 2, flag: "IMPFLAG-1", issue: "page 3 is misread", flagged_at: "2026-09-27T00:00:00Z",
    words: "we checked page 3 ourselves", acknowledged_by: "alice", acknowledged_at: AT }]);
  const fm = w.fm(["---", `format: ${CASE_DOCUMENT_FORMAT}`, ...acceptedWorkBlockLines({ rows: a.rows, flags }), "---", ""].join("\n"));
  assert.deepEqual(acceptedWorkOf(fm).flags, flags);
  const body = acceptedBodyLines({ rows: a.rows, flags }).join("\n");
  assert.ok(body.includes(`- Flag IMPFLAG-1 on ${ref}, edition 2, raised 2026-09-27T00:00:00Z: page 3 is misread. In the owner's words: we checked page 3 ourselves. Disclosed by alice on ${AT}.`));
  assert.equal((JSON.stringify(flags) + body).includes("bo"), false, "the flagging member is not named");
  assert.equal(FLAG_SENTENCE, "Rests on another group's work that carries an open flag, disclosed with this case: ");
  assert.equal(FLAGS_SAY, "publishing discloses each of these flags, and is never blocked by one (DEC-96 item 4): list each in flagsDisclosed at op=publish, with your own words if you choose.");
});

/* Alice imports another group's case file through the real case-import, recreated whole, and accepts edition 1. */
async function real() {
  const w = world({ realImports: true });
  for (const m of ["alice", "bob"]) w.member(m);
  w.doc(DOC);
  const PAIR = { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "C" } };
  const THEIRS1 = "INQ-2026-0001-transfers";
  Object.assign(w.checks, { group: SOURCE, case: CASE, edition: 1, findings: [{ finding: THEIRS1, pair: PAIR }] });
  const cf = caseFile({ findings: [THEIRS1] });
  const imp = await w.imports.importCaseFile({ parts: cf.parts, by: V("alice"), viewer: V("alice") });
  assert.equal(imp.ok, true, JSON.stringify(imp).slice(0, 300));
  const acc = w.imports.acceptImported({ import: imp.import, edition: 1, findings: [THEIRS1], checked: "every passage",
                                         reason: "We recreated it whole and read it.", by: V("alice"), viewer: V("alice") });
  assert.equal(acc.ok, true, JSON.stringify(acc).slice(0, 300));
  const ref = w.imports.importedCase({ import: imp.import, edition: 1, viewer: V("alice") }).edition.findings[0].ref;
  w.finding(Q, [{ target: DOC }, { target: ref, target_edition: 1 }]);
  return { w, ref, imp: imp.import, cf, THEIRS1, refs: w.cd.materialsJudged(w.prepared([Q]), w.roles([Q]), V("alice")).refs };
}

test("R13 (real case-import): the accepted_work row states, from acceptanceOf and importedCase, who accepted which edition, when and why, the result and the source case file's manifest; once withdrawn, ACCEPTED_WORK_NOT_IN_FORCE", async () => {
  const { w, ref, imp, cf, THEIRS1, refs } = await real();
  const a = w.cd.acceptedWorkJudged(refs, V("alice"));
  assert.deepEqual(a.refusals, []);
  const acc = w.imports.acceptanceOf({ import: imp, edition: 1, finding: THEIRS1 });
  assert.deepEqual(a.rows.map((x) => [x.member, x.ref, x.group, x.case, x.edition, x.finding, x.manifest_sha, x.result, x.accepted_by, x.accepted_at, x.reason]),
    [[Q, ref, SOURCE, CASE, 1, THEIRS1, cf.manifestSha, "recreated", acc.by, acc.at, "We recreated it whole and read it."]]);
  assert.equal(JSON.stringify(a.rows).includes("every passage"), false);
  assert.equal(w.imports.withdrawAcceptance({ import: imp, edition: 1, reason: "a later edition contradicts it", by: V("alice"),
                                              viewer: V("alice") }).ok, true);
  refused(w.cd.acceptedWorkJudged(refs, V("alice")).refusals[0], "ACCEPTED_WORK_NOT_IN_FORCE");
});

test("R14 (real case-import): a flag raised by flagImported is FLAG_NOT_DISCLOSED until listed; cleared by clearFlag, listing it is FLAG_DISCLOSURE_NOT_STANDING", async () => {
  const { w, imp, THEIRS1, refs } = await real();
  const editions = w.cd.acceptedWorkJudged(refs, V("alice")).editions;
  const f = w.imports.flagImported({ import: imp, edition: 1, finding: THEIRS1, issue: "page 3 is misread", by: V("bob"), viewer: V("bob") });
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  refused(w.cd.flagsJudged(editions, null).refusals[0], "FLAG_NOT_DISCLOSED");
  const ok = w.cd.flagsJudged(editions, [{ flag: f.flag, words: "we read page 3 ourselves" }]);
  assert.deepEqual([ok.refusals, ok.open.map((x) => [x.flag, x.issue])], [[], [[f.flag, "page 3 is misread"]]]);
  assert.equal(JSON.stringify(w.cd.disclosureBlocks({ flags: ok, author: "alice", at: AT }).flags).includes("bob"), false);
  assert.equal(w.imports.clearFlag({ flag: f.flag, reason: "page 3 re-read and right", by: V("bob"), viewer: V("bob") }).ok, true);
  refused(w.cd.flagsJudged(editions, [{ flag: f.flag }]).refusals[0], "FLAG_DISCLOSURE_NOT_STANDING");
});
