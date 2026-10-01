/* publication — converted from `test/mk6-bundle-names-no-author.test.mjs` (MK-6), publication's share: "the
   whole-population arm after a real publication, no published object naming the member". The old suite is not deleted
   (K619). Provenance's share (R28: the observation's own files name its author only as `observer:<id>`) is
   provenance's and is not asserted here. After a real publication (a member's firsthand observation, a finding resting
   on it, a case prepared over the finding, the author's attribution act, the case signed, the finding and then the
   observation published), at each of the four levels, nothing this module publishes names the member: every row of
   the published projection (R40's tables and the signed case document) and every published answer this module gives.
   The needles are the member id always, and the handle and the cover wherever the chosen level does not publish them
   (R17: each level publishes its own value). The positive controls: the working record does hold the member id (the
   register's author, the attribution act's chooser), and the matcher sees the signer's name and each level's value in
   the same population. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, V, SIG } from "./fixture.mjs";
import { ATTRIBUTION_LEVELS } from "../../../src/publication/index.mjs";

const M = "mk6memberid", HANDLE = "mk6handle", COVER = "the mk6coverword volunteer";
const F = "INQ-2026-0001", DOC = "INFO-2026-0009-minutes", CASE = "CASE-2026-0001";
/* The published projection (R40, R31's exempt list): these tables and the SIGNED case documents. */
const PUBLISHED_TABLES = ["published_bundles", "published_shas", "published_cases", "published_case_members", "cases",
                          "published_edges"];

/* A real publication at one attribution level: the member's observation, the finding F resting on it, the case over F
   excluding DOC and citing the observation's capture, the author's act at `level`, the case signed by olive, F
   published (its reference to the observation held privately), then the observation published as the case's evidence
   (the reference becomes a serve edge), then F revised so the case carries a revision flag. */
function published(level) {
  const w = world();
  w.member("olive");
  w.member(M, { handle: HANDLE, cover: COVER });
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  const obs = w.observe(M, "MK6-WORDS: I watched the clerk stamp the contract RECEIVED before the vote.");
  const capture = w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, obs).capture_sha;
  w.inquiry(F, { legs: [{ target: obs }] });
  const roles = [{ target: F, version_sha: w.head(F) }];
  w.prepare(CASE, 1, { project: proj, roles, attributions: [{ observation: obs }],
    excluded: [{ target: DOC, description: "the minutes", reason: "out of scope" }],
    citations: [{ target: obs, version: "pinned", capture }] });
  const acts = {
    attribute: w.op("attribute", { by: M }, { caseId: CASE, edition: 1, observation: obs, level }),
    case: w.signCase(CASE, 1, { project: proj,
      roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" })) }),
    finding: w.signFinding(F, { edges: [{ to: obs, kind: "cites" }] }),
    observation: w.signFinding(obs, { sig: SIG(10) }),
  };
  const revised = w.inquiry(F, { legs: [{ target: obs }], question: "Was it stamped first, on reflection?" });
  acts.revision = revised;
  return { w, proj, obs, capture, acts, docSha: w.row(`SELECT doc_sha FROM case_documents WHERE case_id=?`, CASE).doc_sha };
}

/* Every published row, table by table (the signed case documents' rows whole, text included). */
function publishedRows(w) {
  const out = {};
  for (const t of PUBLISHED_TABLES) out[t] = w.rows(`SELECT * FROM ${t}`);
  out.signed_case_documents = w.rows(`SELECT * FROM case_documents WHERE sig_armored IS NOT NULL`);
  return out;
}

/* Every published answer this module gives about that publication, by method and by op. */
function publishedAnswers(w, obs, docSha) {
  return {
    caseEditionState: w.p.caseEditionState(CASE, 1, "test-group"),
    caseDocument: w.p.caseDocument(CASE, 1, ""),
    "op=casedocument": w.op("casedocument", { case: CASE, edition: 1 }),
    "op=publishedcasedoctext": w.op("publishedcasedoctext", { sha256: docSha }),
    publishedRegistryFor: w.p.publishedRegistryFor(F, [obs]),
    publishedCaseRegistryFor: w.p.publishedCaseRegistryFor([CASE]),
    "op=publishedtargets": w.op("publishedtargets", { ids: `${F},${obs}` }),
    publishedEditionsOf: w.p.publishedEditionsOf({ finding: F }),
    publishedEditionsOfObservation: w.p.publishedEditionsOf({ finding: obs }),
    excludedBy: w.p.excludedBy(DOC, V("olive")),
    "op=excludedby": w.op("excludedby", { id: DOC, viewer: "class:daemon" }),
    excludedByObservation: w.p.excludedBy(obs, V("olive")),
    caseFlags: w.p.caseFlags({ caseId: CASE }),
    "op=caseflags": w.op("caseflags", {}),
    caseCitedParts: w.p.caseCitedParts({ case: CASE }),
    ratifiedCases: w.p.ratifiedCases({}),
  };
}

const hits = (population, needle) =>
  Object.entries(population).filter(([, v]) => JSON.stringify(v).includes(needle)).map(([k]) => k);

test("R17 R25 R40 after a real publication at each attribution level, no published row and no published answer names the member id, nor the handle or cover the level does not publish", () => {
  assert.deepEqual([...ATTRIBUTION_LEVELS], ["group", "project", "cover", "name"]);
  for (const level of ATTRIBUTION_LEVELS) {
    const { w, proj, obs, acts, docSha } = published(level);
    /* the publication was driven, every act answering ok, and the case edition is complete */
    assert.deepEqual(Object.entries(acts).map(([k, r]) => [k, r.ok]),
                     [["attribute", true], ["case", true], ["finding", true], ["observation", true], ["revision", true]], level);
    assert.equal(acts.attribute.level, level);
    assert.equal(acts.observation.heldLinked, 1, "the finding's reference to the observation became a serve edge");
    /* the working record names the member: the needle is live */
    assert.deepEqual(w.rows(`SELECT author FROM register WHERE bundle_id=?`, obs), [{ author: M }]);
    assert.deepEqual(w.rows(`SELECT chosen_by FROM observation_attributions`), [{ chosen_by: M }]);

    const rows = publishedRows(w);
    const answers = publishedAnswers(w, obs, docSha);
    /* the population is the publication, not empty */
    for (const [t, list] of Object.entries(rows)) assert.ok(list.length > 0, `${level}: ${t} holds the publication`);
    assert.deepEqual(rows.published_bundles.map((r) => r.bundle_id).sort(), [obs, F].sort());
    assert.deepEqual(rows.published_edges.map((e) => [e.from_bundle, e.to_bundle, e.disclosure]), [[F, obs, "serve"]]);
    const st = answers.caseEditionState;
    assert.deepEqual([st.complete, st.findings.map((f) => f.bundle_id), st.document.doc_sha], [true, [F], docSha]);
    assert.deepEqual([answers.caseDocument.ok, answers.caseDocument.ratified, answers["op=casedocument"].ok], [true, true, true]);
    assert.equal(answers["op=publishedcasedoctext"].found, true);
    assert.deepEqual(Object.keys(answers.publishedRegistryFor).sort(), [obs, F].sort());
    assert.deepEqual(Object.keys(answers["op=publishedtargets"].registry).sort(), [obs, F].sort());
    assert.deepEqual(answers.publishedEditionsOf.items.map((i) => [i.case, i.edition, i.project]), [[CASE, 1, proj]]);
    assert.deepEqual(answers.excludedBy.cases.map((c) => [c.case_id, c.bundle_id]), [[CASE, F]]);
    assert.deepEqual(answers["op=excludedby"].cases.map((c) => [c.case_id, c.bundle_id]), [[CASE, F]]);
    assert.deepEqual(answers.caseFlags.flags.map((f) => [f.case_id, f.bundle_id, f.outstanding]), [[CASE, F, true]]);
    assert.equal(answers["op=caseflags"].count, 1);
    assert.deepEqual(answers.caseCitedParts.parts.map((p) => p.bundle_id), [obs]);
    assert.deepEqual(answers.ratifiedCases.cases, [CASE]);

    /* THE MATCHER SEES NAMES: the signer is found in the published rows and answers, and so is the level's value */
    const population = { ...rows, ...answers };
    assert.ok(hits(population, "olive").includes("published_bundles"), `${level}: the signer is published`);
    assert.ok(hits(population, "olive").includes("caseEditionState"));
    const shown = { group: "test-group", project: proj, cover: COVER, name: HANDLE }[level];
    const signedText = rows.signed_case_documents[0].text;
    assert.ok(signedText.includes(`    level: ${level}\n    shown: "${shown}"`), `${level}: the signed document states the level's own value`);
    assert.equal(answers.caseDocument.text, signedText);

    /* NO PUBLISHED ROW AND NO PUBLISHED ANSWER NAMES THE MEMBER, nor the handle or cover this level does not publish */
    const needles = { member_id: M, ...(level === "name" ? {} : { handle: HANDLE }),
                      ...(level === "cover" ? {} : { cover: "mk6coverword" }) };
    assert.deepEqual(Object.fromEntries(Object.entries(needles).map(([k, v]) => [k, hits(population, v)])),
                     Object.fromEntries(Object.keys(needles).map((k) => [k, []])), level);
  }
});

test("R17 R25 the unsigned preparation, which names the member nowhere either, is not in the published population until signed, and the level's value enters it only with the signature", () => {
  const w = world();
  w.member("olive");
  w.member(M, { handle: HANDLE, cover: COVER });
  const proj = w.project("Parks", "olive");
  const obs = w.observe(M);
  w.inquiry(F, { legs: [{ target: obs }] });
  const roles = [{ target: F, version_sha: w.head(F) }];
  w.prepare(CASE, 1, { project: proj, roles, attributions: [{ observation: obs }] });
  assert.equal(w.op("attribute", { by: M }, { caseId: CASE, edition: 1, observation: obs, level: "cover" }).ok, true);
  /* prepared and chosen, not signed: the published projection holds nothing of it, and an outsider reads no document */
  const rowsBefore = publishedRows(w);
  assert.deepEqual(Object.values(rowsBefore).map((l) => l.length), PUBLISHED_TABLES.map(() => 0).concat([0]));
  assert.equal(w.p.caseDocument(CASE, 1, "").reason, "NO_CASE_DOCUMENT");
  assert.equal(w.p.caseEditionState(CASE, 1), null);
  /* the unsigned text itself names the level's value and never the member */
  const text = w.row(`SELECT text FROM case_documents`).text;
  assert.ok(text.includes(COVER));
  assert.ok(!text.includes(M) && !text.includes(HANDLE));
  /* signed: the document joins the population, carrying the value, and still not the member */
  w.signCase(CASE, 1, { project: proj, roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha })) });
  const after = { ...publishedRows(w), caseDocument: w.p.caseDocument(CASE, 1, ""),
                  caseEditionState: w.p.caseEditionState(CASE, 1) };
  assert.ok(hits(after, COVER).includes("signed_case_documents"));
  assert.deepEqual([hits(after, M), hits(after, HANDLE)], [[], []]);
});
