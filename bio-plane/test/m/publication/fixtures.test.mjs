/* publication — the fixtures this module publishes for its users (fix round 10; `fixtures.mjs`): each is called here and
   its answer checked against what the real module answers, so a user's test that takes one takes the module's own word. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { caseDocumentFacts, caseFileLedger, publicationWorld, restingOf, stampEditionRefusal, storeCaseDocumentRefusal } from "./fixtures.mjs";
import { CASEFILE_GRACE_MS } from "../../../src/publication/index.mjs";
import { NOW } from "./fixture.mjs";

const T0 = Date.parse(NOW);

test("R1 R2 fixtures: caseDocumentFacts answers NO_CASE_DOCUMENT for an edition with no document and for a viewer with no standing in an unsigned one, the same answer, and the stored document to its owner and, once signed, to anyone", () => {
  const f = caseDocumentFacts();
  assert.deepEqual([f.absent.ok, f.absent.reason, f.absent.caseId, f.absent.edition], [false, "NO_CASE_DOCUMENT", f.absentCase, 1]);
  assert.deepEqual([f.unseen.ok, f.unseen.reason], [false, "NO_CASE_DOCUMENT"], "absent and invisible are one answer");
  assert.equal(f.unsigned.ok, true);
  assert.equal(typeof f.unsigned.doc.text, "string", "the text comes back whole");
  assert.equal(f.unsigned.doc.sig_armored, null, "unsigned");
  assert.equal(f.signed.ok, true, "a stranger reads a ratified document");
  assert.notEqual(f.signed.doc.sig_armored, null);
  assert.equal(f.signed.doc.doc_sha, f.unsigned.doc.doc_sha, "the same bytes");
});

test("R15 fixtures: caseFileLedger is the real ledger over complete editions: owed once the grace is up, its own refusals made by the real writer, a built edition never owed", () => {
  const l = caseFileLedger({ editions: 2 });
  assert.equal(l.cases.length, 2);
  assert.equal(l.nextAt() !== null, true);
  assert.deepEqual(l.owed({ now: T0 + CASEFILE_GRACE_MS }).map((x) => x.case), l.cases.map((c) => c.case));
  assert.deepEqual([l.refusals.malformed.ok, l.refusals.malformed.reason], [false, "MALFORMED"]);
  assert.deepEqual([l.refusals.noEdition.ok, l.refusals.noEdition.reason], [false, "NO_SUCH_CASE_EDITION"]);
  assert.deepEqual([l.refusals.noManifest.ok, l.refusals.noManifest.reason], [false, "NO_MANIFEST"]);
  const [a, b] = l.cases;
  assert.equal(l.record({ caseId: a.case, edition: 1, state: "building", at: new Date(T0).toISOString() }).attempts, 1);
  assert.equal(l.manifest(a.case).ok, true);
  assert.equal(l.record({ caseId: a.case, edition: 1, state: "built", at: new Date(T0 + 1).toISOString() }).state, "built");
  assert.equal(l.state(a.case).state, "built");
  assert.deepEqual(l.owed({ now: T0 + 1e9 }).map((x) => x.case), [b.case], "a built edition is never owed");
});

test("R15 fixtures: caseFileLedger's manifest takes built, recording the real manifest and the case file built in one call; without it the ledger is as before; a malformed built is the real MALFORMED", () => {
  const l = caseFileLedger({ editions: 2 });
  const [a, b] = l.cases;
  assert.equal(l.manifest(a.case, 1, { built: true }).ok, true);
  assert.equal(l.state(a.case).state, "built");
  assert.equal(l.manifest(b.case).ok, true);
  assert.equal(l.state(b.case).state, null, "without built the ledger is left alone");
  const bad = l.manifest(b.case, 1, { built: "true" });
  assert.deepEqual([bad.ok, bad.reason], [false, "MALFORMED"]);
});

test("R42 fixtures: publicationWorld's rest makes a published finding rest on its documents by the real acts, and restingCapturesOf answers their captures with the finding and its project", () => {
  const p = publicationWorld();
  const r = p.rest({ finding: "INQ-2026-0001", docs: ["INFO-2026-0001-a", "INFO-2026-0002-b"] });
  const got = p.publication.restingCapturesOf({});
  assert.deepEqual(got.captures.map((c) => c.capture_sha), [...r.captures].sort());
  for (const c of got.captures) assert.deepEqual(c.findings, [{ bundle_id: "INQ-2026-0001", projects: [r.project] }]);
  assert.deepEqual(r.captures, ["INFO-2026-0001-a", "INFO-2026-0002-b"].map(p.captureOf));
});

test("R62 fixtures: stampEditionRefusal makes the real refusals of a stamp: NO_SUCH_CASE_EDITION for a case with no ratified edition, STAMP_NO_ORDER for a ratified edition no court-order source confirms", () => {
  const s = stampEditionRefusal();
  assert.deepEqual([s.noEdition.ok, s.noEdition.reason], [false, "NO_SUCH_CASE_EDITION"]);
  assert.deepEqual([s.noOrder.ok, s.noOrder.reason, s.noOrder.case], [false, "STAMP_NO_ORDER", s.case]);
});

test("R21 fixtures: storeCaseDocumentRefusal is the real MALFORMED of a document with no text, and stores nothing", () => {
  const s = storeCaseDocumentRefusal();
  assert.deepEqual([s.refused.ok, s.refused.reason], [false, "MALFORMED"]);
  assert.equal(s.world.count("case_documents"), 0);
});

test("R42 fixtures: restingOf makes the named findings rest on exactly the named captures by the real acts, and restingCapturesOf answers them with the named projects, paged as the real module pages", () => {
  const d = (s) => s.repeat(64).slice(0, 64);
  const [a, b, c] = [d("a"), d("b"), d("c")];
  const r = restingOf([{ finding: "INQ-2026-0001", projects: ["PROJ-2026-0002-f"], digests: [a, b] },
                       { finding: "INQ-2026-0002", projects: ["PROJ-2026-0002-f", "PROJ-2026-0003-o"], digests: [b, c] }]);
  const got = r.restingCapturesOf({});
  assert.deepEqual(got.captures.map((x) => x.capture_sha), [a, b, c]);
  assert.deepEqual(got.captures.map((x) => x.findings), [
    [{ bundle_id: "INQ-2026-0001", projects: ["PROJ-2026-0002-f"] }],
    [{ bundle_id: "INQ-2026-0001", projects: ["PROJ-2026-0002-f"] },
     { bundle_id: "INQ-2026-0002", projects: ["PROJ-2026-0002-f", "PROJ-2026-0003-o"] }],
    [{ bundle_id: "INQ-2026-0002", projects: ["PROJ-2026-0002-f", "PROJ-2026-0003-o"] }]]);
  const page = r.restingCapturesOf({ limit: 2 });
  assert.deepEqual([page.captures.length, page.cursor], [2, b]);
  assert.deepEqual(r.restingCapturesOf({ after: page.cursor }).captures.map((x) => x.capture_sha), [c]);
  assert.deepEqual(restingOf([]).restingCapturesOf({}).captures, [], "nothing held, nothing rests");
});
