/* publication — a `/5` document's `captures:` and `sources:` blocks, answered by the facts read (R2), and what a case
   may state of a source: re-read at the commit (R51), never more than `publishableAt` answered then (R52). N364: DEC-81
   items 1 and 3, DEC-78 item 5. The blocks' grammar is `case-grammar`'s (its R1) and their public read `public-read`'s
   (its R3) since K651, each tested there. `sources` is the real module; the knocks it mints its
   sources from are pulled through the fixture's stand-in for capture. Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, caseDoc, V, SIG, NOW, sha } from "./fixture.mjs";
import { caseDocumentBlocks, sourceStatement, unnamedSourceStatement, BLOCKS_PREDATE_SENTENCE,
         CASE_SOURCES_CHECKS } from "../../../src/publication/index.mjs";

const F = "INQ-2026-0001";
const CAP = sha("the knocked bytes");
const CAP2 = sha("more knocked bytes");
const SIGNATURE = "-----BEGIN SSH SIGNATURE-----\nU1NIU0lH\nAAAA=\n-----END SSH SIGNATURE-----";

/* One project owned by olive, one finding, the source behind CAP minted from a pulled knock. */
function base() {
  const w = world();
  w.member("olive"); w.member("bo");
  const proj = w.project("Parks", "olive");
  w.doc("INFO-2026-0001-minutes");
  w.inquiry(F, { legs: [{ target: "INFO-2026-0001-minutes" }] });
  const pin = w.head(F);
  const roles = [{ target: F, version_sha: pin }];
  const source = w.knock(CAP, { pseudonym: "heron" });
  return { w, proj, pin, roles, source };
}
/* One disclosure, as a member records it (sources R2), and optionally its consent to the public (R7). */
function disclose(w, source, { kind = "attribute", attribute = "employer", value = "the water board", how = "self",
                               knownTo = "group", evidence = "said so at the door", recorded = true, consent = true,
                               claimedBy } = {}) {
  const r = w.src.recordDisclosure({ source, revealed: { kind, ...(kind === "attribute" ? { attribute } : {}),
                                                         ...(recorded ? { value } : {}) },
    how, knownTo, evidence, recorded, ...(recorded ? { sight: ["olive"] } : {}),
    ...(claimedBy ? { claimedBy } : {}), by: V("olive") });
  assert.equal(r.ok, true, JSON.stringify(r));
  if (consent) assert.equal(w.src.recordConsent({ source, entry: r.entry, audience: "public", evidence: "signed form",
                                                  by: V("olive") }).ok, true);
  return r.entry;
}
/* What case-authoring R37 writes for one capture: each entry `publishableAt` answers, or the unnamed statement. */
function statedRows(w, capture, source) {
  const p = w.src.publishableAt({ source, audience: "public", at: w.clock.now });
  assert.equal(p.ok, true);
  const received = w.row(`SELECT received FROM source_knocks WHERE capture_sha=? ORDER BY received, knock_id`, capture).received;
  return p.entries.length ? p.entries.map((e) => ({ capture, stated: sourceStatement(e), basis: e.basis }))
                          : [{ capture, stated: unnamedSourceStatement({ capture, received }), basis: null }];
}
const roster = (roles) => roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" }));
const captureRow = (over = {}) => ({ capture: CAP, member: F, grade: "B", grade_basis: "a knock held under its digest",
  co_attested: false, timestamp_at: null, co_archive: null, late: false, self_attested_only: true,
  acknowledgement: { reason: "the knocker's bytes, no public copy", acknowledged_by: V("olive"), at: NOW,
                     sentence: "Without co-attestation an outsider can verify the copy has not changed since capture." },
  accounts: [{ by: V("olive"), at: NOW, text: "I pulled it from the doorbell.\nThat evening.", signature: SIGNATURE }],
  ...over });
const tick = (w, iso) => { w.clock.now = iso; };

test("R2 caseDocumentFacts answers a /5 document's captures and sources blocks, fenced as R1; an older one states them null", () => {
  const { w, proj, roles, source } = base();
  disclose(w, source);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles,
    blocks: { captures: [captureRow()], sources: statedRows(w, CAP, source) } });
  const f = w.p.caseDocumentFacts("CASE-2026-0001", 1, V("olive"));
  assert.equal(f.ok, true);
  assert.deepEqual(f.captures, caseDocumentBlocks(f.doc.text).captures);
  assert.deepEqual(f.sources, [{ capture: CAP, stated: "attribute employer: the water board", basis: "consent" }]);
  assert.equal(f.blocks_detail, null);
  assert.equal(f.captures[0].accounts[0].signature, SIGNATURE);
  /* fenced: an outsider reads exactly what a store with no document answers */
  assert.deepEqual(w.p.caseDocumentFacts("CASE-2026-0001", 1, V("bo")), world().p.caseDocumentFacts("CASE-2026-0001", 1, V("bo")));
  /* a /4 document states neither */
  w.prepare("CASE-2026-0002", 1, { project: proj, roles, format: "bio-case-document/4" });
  const old = w.p.caseDocumentFacts("CASE-2026-0002", 1, V("olive"));
  assert.deepEqual([old.captures, old.sources, old.blocks_detail], [null, null, BLOCKS_PREDATE_SENTENCE]);
});

test("R51 commitCaseEdition re-reads publishableAt for every stated entry: a consent withdrawn since authoring is SOURCE_CONSENT_WITHDRAWN (C-122.1), nothing committed; a new preparation signs", () => {
  const { w, proj, roles, source } = base();
  const employer = disclose(w, source);
  disclose(w, source, { kind: "attribute", attribute: "role", value: "clerk" });
  const rows = statedRows(w, CAP, source);
  assert.equal(rows.length, 2, "two entries stated, both publishable at authoring");
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, blocks: { captures: [captureRow()], sources: rows } });
  tick(w, "2026-09-28T02:00:00Z");
  assert.equal(w.src.withdrawConsent({ source, entry: employer, audience: "public", by: V("olive") }).ok, true);
  const before = w.snapshot();
  const r = w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles), at: "2026-09-28T03:00:00Z" });
  assert.equal(r.ok, false);
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
                   ["SOURCE_CONSENT_WITHDRAWN", "SOURCE_CONSENT_WITHDRAWN", "C-122.1",
                    CASE_SOURCES_CHECKS.SOURCE_CONSENT_WITHDRAWN.translation]);
  assert.deepEqual(r.captures, [CAP]);
  assert.deepEqual(w.snapshot(), before, "nothing committed: no case row, no published_cases, no signature, no hash");
  assert.equal(w.p.caseDocument("CASE-2026-0001", 1, null).reason, "NO_CASE_DOCUMENT", "still unsigned, still unseen");
  /* the remedy: a new preparation, stating what may be published now, signs */
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, blocks: { captures: [captureRow()], sources: statedRows(w, CAP, source) } });
  const ok = w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles), at: "2026-09-28T03:00:00Z" });
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.deepEqual(caseDocumentBlocks(w.row(`SELECT text FROM case_documents`).text).sources.map((x) => x.stated),
                   ["attribute role: clerk"]);
});

test("R51 the re-read is at the commit's instant and covers every row: each basis, the unnamed statement, several sources behind one capture", () => {
  const { w, proj, roles, source } = base();
  /* public elsewhere: a knownTo public entry cited, needing no consent */
  disclose(w, source, { kind: "name", value: "Pat Doe", knownTo: "public", evidence: { cite: "https://news.example/a" },
                        consent: false });
  /* a second source behind CAP, and CAP2 whose source has nothing publishable */
  const second = w.knock(CAP, { knockId: "KNOCK-9", pseudonym: "wren" });
  assert.notEqual(second, source);
  disclose(w, second, { kind: "attribute", attribute: "occupation", value: "engineer" });
  const other = w.knock(CAP2, { pseudonym: "finch" });
  disclose(w, other, { consent: false });
  const rows = [...statedRows(w, CAP, source), ...statedRows(w, CAP, second), ...statedRows(w, CAP2, other)];
  assert.deepEqual(rows.map((x) => x.basis), ["public_elsewhere", "consent", null]);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, blocks: { captures: [], sources: rows } });
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) }).ok, true, "every row still holds");
  /* each kind of row failing alone refuses */
  const refusedWith = (bad, at = NOW) => {
    w.prepare("CASE-2026-0002", 1, { project: proj, roles, blocks: { captures: [], sources: bad } });
    const before = w.snapshot();
    const r = w.signCase("CASE-2026-0002", 1, { project: proj, roster: roster(roles), at });
    assert.equal(r.reason, "SOURCE_CONSENT_WITHDRAWN", JSON.stringify(bad));
    assert.deepEqual(w.snapshot(), before);
  };
  refusedWith([{ ...rows[0], basis: "consent" }]);                                   /* a basis it does not have */
  refusedWith([{ ...rows[2], stated: unnamedSourceStatement({ capture: CAP2, received: "2020-01-01T00:00:00Z" }) }]);
  refusedWith([{ ...rows[2], capture: CAP }]);                                       /* unnamed, but CAP has sources */
  refusedWith([{ capture: sha("no knock"), stated: "an unnamed source", basis: null }]); /* no source behind it */
  refusedWith([rows[1], { ...rows[1], stated: "attribute occupation: astronaut" }]);   /* one of two rows lapses */
  /* at the commit's instant: a consent recorded after it does not count */
  const later = disclose(w, other, { kind: "attribute", attribute: "role", value: "late", consent: false });
  tick(w, "2026-09-28T05:00:00Z");
  w.src.recordConsent({ source: other, entry: later, audience: "public", evidence: "form", by: V("olive") });
  refusedWith([{ capture: CAP2, stated: "attribute role: late", basis: "consent" }], "2026-09-28T04:00:00Z");
  /* a document stating no sources block, or an older format, has nothing to re-read */
  w.prepare("CASE-2026-0003", 1, { project: proj, roles, blocks: { captures: [] } });
  assert.equal(w.signCase("CASE-2026-0003", 1, { project: proj, roster: roster(roles) }).ok, true);
});

test("R51 a retry of the same signature after the withdrawal answers existed: a signed edition is not re-read", () => {
  const { w, proj, roles, source } = base();
  const entry = disclose(w, source);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, blocks: { captures: [], sources: statedRows(w, CAP, source) } });
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) }).ok, true);
  tick(w, "2026-09-28T02:00:00Z");
  w.src.withdrawConsent({ source, entry, audience: "public", by: V("olive") });
  const again = w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) });
  assert.deepEqual([again.ok, again.existed], [true, true]);
});

test("R52 no published answer states a source detail except what publishableAt answered at the commit", () => {
  const { w, proj, roles, source } = base();
  /* a detail only its sight list may read, never consented: stating it is refused at the commit */
  disclose(w, source, { kind: "name", value: "Pat Doe", consent: false });
  const secretRow = { capture: CAP, stated: "name: Pat Doe", basis: "consent" };
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, blocks: { captures: [], sources: [secretRow] } });
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) }).reason, "SOURCE_CONSENT_WITHDRAWN");
  assert.equal(w.p.caseEditionState("CASE-2026-0001", 1), null, "no published case edition");
  /* what was publishable at the commit is published, and stays exactly that */
  const employer = disclose(w, source);
  const rows = statedRows(w, CAP, source);
  assert.deepEqual(rows.map((x) => x.stated), ["attribute employer: the water board"]);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, blocks: { captures: [], sources: rows } });
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) }).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  const published = () => JSON.stringify([w.p.caseEditionState("CASE-2026-0001", 1), w.p.caseDocument("CASE-2026-0001", 1, null),
    w.p.caseDocumentFacts("CASE-2026-0001", 1, null).sources, w.p.publishedEditionsOf({ finding: F }),
    w.rows(`SELECT * FROM published_cases`), w.rows(`SELECT * FROM published_shas`)]);
  const at = published();
  /* afterwards: the consent withdrawn (what is published stays published), the name consented: no answer moves */
  tick(w, "2026-09-28T02:00:00Z");
  w.src.withdrawConsent({ source, entry: employer, audience: "public", by: V("olive") });
  assert.deepEqual(w.src.publishableAt({ source, audience: "public" }).entries, [], "withdrawn from the public now");
  const nameEntry = w.rows(`SELECT entry_id FROM source_entries WHERE kind='name'`)[0].entry_id;
  w.src.recordConsent({ source, entry: nameEntry, audience: "public", evidence: "form", by: V("olive") });
  assert.equal(published(), at, "the published answers are read from the signed bytes, never live");
  for (const detail of ["Pat Doe", "heron", source])
    assert.equal(at.includes(detail), false, `${detail} was never publishable at the commit, and is stated nowhere`);
  assert.ok(at.includes("attribute employer: the water board"));
});
