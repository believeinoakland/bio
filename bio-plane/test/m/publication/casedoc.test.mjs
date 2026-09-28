/* publication — the case document: its fenced reads (R1, R2, R29), its exclusions (R3), its grammar (R20), its writes
   (R21), the review provider (R23) and the read contract (R40). Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, caseDoc, V, SIG, NOW, sha } from "./fixture.mjs";
import { CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMATS_ACCEPTED, caseDocumentStatesMemberBlocks,
         caseDocumentRequiresDisclosures, caseDocumentRequiresV4Disclosures, REAUTHORABLE_SECTIONS,
         PUBLICATION_TABLES } from "../../../src/publication/index.mjs";
import { REVIEW_COPY_CHECKS } from "../../../checks/bio-checks.mjs";

/* One project owned by olive, one finding prepared into CASE-2026-0001 edition 1 (unsigned). */
function prepared(opts = {}) {
  const w = world();
  w.member("olive"); w.member("bo");
  const proj = w.project("Parks", "olive");
  w.doc("INFO-2026-0001-minutes");
  w.inquiry("INQ-2026-0001", { legs: [{ target: "INFO-2026-0001-minutes" }] });
  const pin = w.head("INQ-2026-0001");
  const roles = [{ target: "INQ-2026-0001", version_sha: pin }];
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, excluded: [{ target: "INFO-2026-0009-old" }], ...opts });
  return { w, proj, pin, roles };
}
const roster = (roles) => roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" }));

test("R1 an unsigned case document answers a viewer with standing in its project, and everyone else exactly as one never authored", () => {
  const { w } = prepared();
  const owner = w.p.caseDocument("CASE-2026-0001", 1, V("olive"));
  assert.equal(owner.ok, true);
  assert.equal(owner.ratified, false);
  assert.equal(owner.text, w.row(`SELECT text FROM case_documents`).text);
  assert.equal(owner.doc_sha, sha(owner.text));
  assert.equal(owner.authored_by, V("olive"));
  assert.equal(owner.delivered_by, null, "no delivery yet: unsigned");
  const fresh = world();
  const never = fresh.p.caseDocument("CASE-2026-0001", 1, V("bo"));
  for (const viewer of [V("bo"), null, "garbage", "member:"])
    assert.deepEqual(w.p.caseDocument("CASE-2026-0001", 1, viewer), never, `viewer ${viewer}`);
  assert.equal(never.reason, "NO_CASE_DOCUMENT");
  assert.deepEqual(w.p.caseDocument("CASE-2026-0001", 2, V("olive")), fresh.p.caseDocument("CASE-2026-0001", 2, V("olive")),
                   "an edition never authored answers the same");
  /* the machine credential's unfiltered scope has standing (viewerPredicate's member scope) */
  assert.equal(w.p.caseDocument("CASE-2026-0001", 1, "class:daemon").ok, true);
});

test("R1 hasCaseStanding is the standing test, exported, and a live review grant bound to exactly that edition admits", () => {
  const { w } = prepared();
  const doc = w.row(`SELECT * FROM case_documents`);
  assert.equal(w.p.hasCaseStanding(doc, V("olive")), true);
  assert.equal(w.p.hasCaseStanding(doc, V("bo")), false);
  assert.equal(w.p.hasCaseStanding(doc, "nobody"), false);
  const secret = "a".repeat(64);
  assert.equal(w.p.caseDocument("CASE-2026-0001", 1, V("bo"), secret).ok, false, "no provider: no grant admits");
  w.p.registerReviewProvider("legacy-store", {
    draftForMember: () => null, draftIdentity: () => null, caseIdentitySentence: () => null, statedEdition: () => null,
    liveGrant: () => null, deadAnswer: () => null,
    grantAdmitsCaseEdition: (s, c, e) => s === secret && c === "CASE-2026-0001" && e === 1 });
  assert.equal(w.p.caseDocument("CASE-2026-0001", 1, V("bo"), secret).ok, true);
  assert.equal(w.p.caseDocument("CASE-2026-0001", 1, V("bo"), "b".repeat(64)).ok, false);
});

test("R1 a signed document answers anybody, with its signature, deliverer and the citations its /4 bytes signed; an older one states them undetermined", () => {
  const { w, proj, roles } = prepared({ citations: [{ target: "INFO-2026-0001-minutes", version: "pinned" }] });
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) }).ok, true);
  const any = w.p.caseDocument("CASE-2026-0001", 1, null);
  assert.equal(any.ok, true);
  assert.equal(any.ratified, true);
  assert.equal(any.sig_armored, SIG(1));
  assert.equal(any.attestor_member, "olive");
  assert.deepEqual(any.delivered_by, { kind: "member", member: "olive" });
  assert.deepEqual(any.citations, { state: "signed", rows: [{ target: "INFO-2026-0001-minutes", version: "pinned" }] });
  assert.deepEqual(w.op("casedocument", { case: "CASE-2026-0001", edition: 1 }), any, "op=casedocument is the same read");
  /* an older format signed no citation: stated, never read from today's edges */
  const { w: w3, proj: p3, roles: r3 } = prepared({ format: "bio-case-document/3", citations: [{ target: "X", version: "pinned" }] });
  w3.signCase("CASE-2026-0001", 1, { project: p3, roster: roster(r3) });
  const old = w3.p.caseDocument("CASE-2026-0001", 1, null);
  assert.equal(old.citations.state, "undetermined");
  assert.equal(old.citations.rows, null);
  assert.match(old.citations.stated, /version undetermined/);
});

test("R2 caseDocumentFacts is fenced as R1 and answers the document, the previous edition's assertions, each member's basis at its pin, attribution and testimony", () => {
  const { w, proj, roles } = prepared();
  assert.deepEqual(w.p.caseDocumentFacts("CASE-2026-0001", 1, V("bo")), world().p.caseDocumentFacts("CASE-2026-0001", 1, V("bo")));
  assert.equal(w.p.caseDocumentFacts("", 1, V("olive")).reason, "MALFORMED");
  assert.equal(w.p.caseDocumentFacts("CASE-2026-0001", 0, V("olive")).reason, "MALFORMED");
  const f = w.p.caseDocumentFacts("CASE-2026-0001", 1, V("olive"));
  assert.equal(f.ok, true);
  assert.equal(f.doc.case_id, "CASE-2026-0001");
  assert.equal(f.priorCase, null, "no earlier ratified edition");
  assert.ok(Array.isArray(f.signers));
  assert.deepEqual(f.memberBasis["INQ-2026-0001"].map((l) => l.target), ["INFO-2026-0001-minutes"]);
  assert.deepEqual(f.testimony, { self: [], via: [] });
  assert.deepEqual(Object.keys(f.attribution).sort(), ["current", "legacy", "reached", "stated"]);
  /* ratified and published, then the finding moves on: the basis is still read at the PIN */
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) });
  assert.equal(w.signFinding("INQ-2026-0001").ok, true, "the edition completes when its last member is published");
  w.inquiry("INQ-2026-0001", { question: "Is it answered, revised?", legs: [] });
  assert.deepEqual(w.p.caseDocumentFacts("CASE-2026-0001", 1, V("bo")).memberBasis["INQ-2026-0001"].map((l) => l.target),
                   ["INFO-2026-0001-minutes"], "read at the pin, never at the working version; a ratified document to anybody");
  /* the previous RATIFIED edition's assertions */
  w.prepare("CASE-2026-0001", 2, { project: proj, roles });
  const f2 = w.p.caseDocumentFacts("CASE-2026-0001", 2, V("olive"));
  assert.equal(f2.priorCase.edition, 1);
  assert.equal(f2.priorCase.bias_acknowledgement, "none declared");
  assert.deepEqual(JSON.parse(f2.priorCase.completeness), { statement: "It leaves out the minutes.", author: V("olive") });
});

test("R3 a document's exclusions are projected whole when it is stored or re-authored, and excludedBy reads them", () => {
  const { w, proj, roles } = prepared({ excluded: [{ target: "INFO-2026-0009-old", description: "old minutes" },
                                                  { target: "INFO-2026-0010-annex", description: "the annex" }] });
  const rows = () => w.rows(`SELECT target_id, description FROM case_exclusions ORDER BY ord`);
  assert.deepEqual(rows(), [{ target_id: "INFO-2026-0009-old", description: "old minutes" },
                            { target_id: "INFO-2026-0010-annex", description: "the annex" }]);
  /* stored again with fewer: the projection is replaced whole, never appended */
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, excluded: [{ target: "INFO-2026-0010-annex", description: "the annex" }] });
  assert.deepEqual(rows(), [{ target_id: "INFO-2026-0010-annex", description: "the annex" }]);
  const by = w.p.excludedBy("INFO-2026-0010-annex", V("olive"));
  assert.equal(by.ok, true);
  assert.deepEqual(by.cases.map((c) => [c.case_id, c.case_edition, c.bundle_id, c.from]),
                   [["CASE-2026-0001", 1, "INQ-2026-0001", "case_document"]]);
});

test("R20 the case document's grammar: /4 is written, /1–/4 accepted, and the three predicates read the token, pure and never throwing", () => {
  assert.equal(CASE_DOCUMENT_FORMAT, "bio-case-document/4");
  assert.deepEqual(CASE_DOCUMENT_FORMATS_ACCEPTED, ["bio-case-document/4", "bio-case-document/3", "bio-case-document/2",
                                                   "bio-case-document/1"]);
  const f = (v) => ({ format: `bio-case-document/${v}` });
  assert.deepEqual([4, 3, 2, 1].map((v) => caseDocumentStatesMemberBlocks(f(v))), [true, true, true, false]);
  assert.deepEqual([4, 3, 2, 1].map((v) => caseDocumentRequiresDisclosures(f(v))), [true, true, false, false]);
  assert.deepEqual([4, 3, 2, 1].map((v) => caseDocumentRequiresV4Disclosures(f(v))), [true, false, false, false]);
  for (const odd of [null, undefined, 7, "x", {}, [], { format: null }])
    for (const pred of [caseDocumentStatesMemberBlocks, caseDocumentRequiresDisclosures, caseDocumentRequiresV4Disclosures])
      assert.equal(pred(odd), false);
});

test("R21 storeCaseDocument replaces an unsigned document, never a signed one, and answers what the store holds", () => {
  const { w, proj, roles } = prepared();
  const text2 = caseDoc("CASE-2026-0001", 1, { project: proj, roles, excludes: "Now this." });
  const r = w.p.storeCaseDocument({ case: "CASE-2026-0001", edition: 1, text: text2, author: V("olive") });
  assert.deepEqual([r.case_id, r.edition, r.doc_sha, r.stored], ["CASE-2026-0001", 1, sha(text2), true]);
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) });
  const before = w.snapshot(["case_documents", "case_exclusions"]);
  const again = w.p.storeCaseDocument({ case: "CASE-2026-0001", edition: 1, text: "---\nx: 1\n---\n", author: V("bo") });
  assert.deepEqual([again.ok, again.doc_sha, again.stored], [true, sha(text2), false], "the signed document is what is held");
  assert.deepEqual(w.snapshot(["case_documents", "case_exclusions"]), before, "a signed document is never touched");
  assert.equal(w.p.storeCaseDocument({ case: "", edition: 1, text: "t" }).reason, "MALFORMED");
  assert.equal(w.p.storeCaseDocument({ case: "C", edition: 0, text: "t" }).reason, "MALFORMED");
});

test("R21 writes only inside the caller's transaction: a caller that refuses leaves nothing written", () => {
  const w = world();
  const r = w.record.transact(() => {
    w.p.storeCaseDocument({ case: "CASE-2026-0002", edition: 1, text: caseDoc("CASE-2026-0002", 1), author: V("olive") });
    return { ok: false, reason: "CALLER_REFUSED" };
  });
  assert.equal(r.reason, "CALLER_REFUSED");
  assert.equal(w.count("case_documents"), 0);
});

test("R21 reauthorSection splices one named section only while unsigned and at docSha, projects the exclusions, and says when it did not", () => {
  const obs = "INFO-2026-0099-observation";
  const { w, proj, roles } = prepared({ attributions: [{ observation: obs }], ack: true });
  assert.deepEqual(REAUTHORABLE_SECTIONS, ["attribution", "acknowledgements"]);
  const held = w.row(`SELECT doc_sha, text FROM case_documents`);
  const lines = { frontmatter: ["observation_attributions:", `  - observation: ${obs}`, "    level: group",
                                '    shown: "g"', "    chosen_at_edition: 1"], body: ["## Whose Words These Are", "", "new words", ""] };
  const moved = w.p.reauthorSection({ case: "CASE-2026-0001", edition: 1, docSha: "0".repeat(64), section: "attribution", lines });
  assert.deepEqual([moved.reauthored, moved.doc_sha], [false, held.doc_sha]);
  assert.match(moved.why, /moved/);
  const done = w.p.reauthorSection({ case: "CASE-2026-0001", edition: 1, docSha: held.doc_sha, section: "attribution", lines });
  assert.equal(done.reauthored, true);
  const now = w.row(`SELECT doc_sha, text FROM case_documents`);
  assert.equal(done.doc_sha, now.doc_sha);
  assert.equal(now.doc_sha, sha(now.text));
  assert.match(now.text, /level: group[\s\S]*new words/);
  assert.equal(now.text.replace(/observation_attributions:[\s\S]*?(?=case_citations)/, "")
                 .replace(/## Whose Words These Are[\s\S]*?(?=## What This Excludes)/, ""),
               held.text.replace(/observation_attributions:[\s\S]*?(?=case_citations)/, "")
                 .replace(/## Whose Words These Are[\s\S]*?(?=## What This Excludes)/, ""),
               "only the two runs changed");
  /* the acknowledgement list is the other section */
  const ack = w.p.reauthorSection({ case: "CASE-2026-0001", edition: 1, docSha: now.doc_sha, section: "acknowledgements",
    lines: { frontmatter: ["  statement_sha: abc", "  acknowledged: 1"], body: ["**Who else read this statement.** Bo did."] } });
  assert.equal(ack.reauthored, true);
  assert.match(w.row(`SELECT text FROM case_documents`).text, /acknowledged: 1[\s\S]*Bo did\.\n\n## What Was Searched/);
  /* signed: left as it is */
  const cur = w.row(`SELECT doc_sha FROM case_documents`).doc_sha;
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) });
  const signed = w.p.reauthorSection({ case: "CASE-2026-0001", edition: 1, docSha: cur, section: "attribution", lines });
  assert.deepEqual([signed.reauthored, signed.doc_sha], [false, cur]);
  assert.match(signed.why, /signed/);
  /* a document carrying no such section, an unknown section, and an absent document */
  const { w: w2 } = prepared();
  const d2 = w2.row(`SELECT doc_sha FROM case_documents`).doc_sha;
  const none = w2.p.reauthorSection({ case: "CASE-2026-0001", edition: 1, docSha: d2, section: "attribution", lines });
  assert.deepEqual([none.reauthored, none.doc_sha], [false, d2]);
  assert.equal(w2.p.reauthorSection({ case: "CASE-2026-0001", edition: 1, section: "scope", lines }).reason, "MALFORMED");
  assert.equal(w2.p.reauthorSection({ case: "CASE-2026-0001", edition: 5, section: "attribution", lines }).doc_sha, null);
});

test("R23 one review provider, once; with none, no grant admits and every door refuses, the dead answer C-87.1's", () => {
  const w = world();
  const none = w.p.reviewProvider();
  assert.equal(none.registered, false);
  assert.equal(none.grantAdmitsCaseEdition("a".repeat(64), "CASE-2026-0001", 1), false);
  assert.equal(none.draftForMember("DRAFT-1", V("olive")), null);
  assert.equal(none.liveGrant("a".repeat(64)), null);
  assert.equal(none.draftIdentity({}), null);
  assert.equal(none.caseIdentitySentence("C", 1, false), null);
  assert.equal(none.statedEdition({}, false), null);
  const dead = none.deadAnswer();
  assert.deepEqual([dead.ok, dead.reason, dead.code, dead.check, dead.translation],
                   [false, "NO_REVIEW_COPY", "NO_REVIEW_COPY", "C-87.1", REVIEW_COPY_CHECKS.NO_REVIEW_COPY.translation]);
  const doors = { draftForMember: () => "d", draftIdentity: () => "i", caseIdentitySentence: () => "s",
                  statedEdition: () => 2, liveGrant: () => "g", grantAdmitsCaseEdition: () => true, deadAnswer: () => "x" };
  assert.equal(w.p.registerReviewProvider("legacy-store", { ...doors, deadAnswer: 3 }).reason, "PROVIDER_MALFORMED");
  assert.deepEqual(w.p.registerReviewProvider("legacy-store", doors), { ok: true, module: "legacy-store" });
  assert.equal(w.p.registerReviewProvider("review", doors).reason, "PROVIDER_DECLARED");
  const got = w.p.reviewProvider();
  assert.deepEqual([got.registered, got.module, got.draftForMember(), got.statedEdition()], [true, "legacy-store", "d", 2]);
});

test("R29 working material answers an outsider exactly as something that does not exist: the unsigned document, its facts and its exclusions", () => {
  const { w } = prepared();
  const fresh = world();
  for (const viewer of [V("bo"), null]) {
    assert.deepEqual(w.p.caseDocument("CASE-2026-0001", 1, viewer), fresh.p.caseDocument("CASE-2026-0001", 1, viewer));
    assert.deepEqual(w.p.caseDocumentFacts("CASE-2026-0001", 1, viewer), fresh.p.caseDocumentFacts("CASE-2026-0001", 1, viewer));
  }
  assert.deepEqual(w.p.excludedBy("INFO-2026-0009-old", V("bo")).cases, [], "an unsigned document's exclusion is not shown");
  assert.equal(w.p.excludedBy("INFO-2026-0009-old", V("olive")).cases.length, 1);
  assert.equal(w.p.excludedBy("", V("olive")).reason, "NO_ID");
});

test("R40 the five tables and the named columns are the stated read contract", () => {
  const w = world();
  const cols = (t) => w.rows(`PRAGMA table_info(${t})`).map((c) => c.name);
  const contract = { cases: ["case_id", "project_id"],
    published_cases: ["case_id", "edition", "completeness", "bias_acknowledgement", "ratified_at"],
    published_case_members: ["case_id", "bundle_id"], published_bundles: ["bundle_id", "edition", "bundle_sha"],
    case_documents: ["case_id", "edition", "doc_sha", "text", "draft_id", "authored_by", "authored_at", "sig_armored",
                     "ratified_at"] };
  for (const [t, want] of Object.entries(contract))
    for (const c of want) assert.ok(cols(t).includes(c), `${t}.${c}`);
  assert.ok(PUBLICATION_TABLES.some((t) => (t.name || t) === "case_documents"));
});
