/* publication — T39 (T39-11): the commit refuses a member document whose publication copy is not the one the case was
   prepared with, `DOCUMENT_COPY_CHANGED_SINCE` (R57, R33's C-122.7; N806, K2333), from `case-carriage.marksLapsed`'s
   rows of `kind` `document` (its R13); its photo rows stay C-122.6, and both are answered when both hold.
   `marksLapsed` is driven by a stand-in on the host's one case-carriage answering exactly its shape (`[{ref, sha, kind,
   why}]`), so each lapse is exact; case-carriage's own tests judge when a document's copy lapses.
   Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { planeWorld as world, infoMd } from "./fixture.mjs";
import { rowOf, CASE_SOURCES_CHECKS, PUBLICATION_WORDS } from "../../../src/publication/checks.mjs";
import { caseCarriageOf } from "../../../src/case-carriage/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";

const CASE = "CASE-2026-0001";
const S1 = "ab".repeat(32), S2 = "cd".repeat(32), S3 = "ef".repeat(32);
const DOC = (ref, sha, why = "a copy that is no longer the document's current copy") => ({ ref, sha, kind: "document", why });
const PHOTO = (ref, sha, why = "a mark was withdrawn since the case was prepared") => ({ ref, sha, kind: "photo", why });
const named = ({ ref, sha, why }) => ({ ref, sha, why });

function base() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  const p = w.promote("INFO-2026-0101-first", infoMd("INFO-2026-0101-first"), "information");
  assert.equal(p.ok, true, JSON.stringify(p));
  const roles = [{ target: "INFO-2026-0101-first", version_sha: p.bundleSha }];
  const roster = roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha }));
  const cc = caseCarriageOf(w.host);
  w.prepare(CASE, 1, { project: proj, roles });
  return { w, proj, roster, cc, sign: () => w.signCase(CASE, 1, { project: proj, roster }) };
}

const WORDS = new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url);

test("R33 (T41) C-122.7 DOCUMENT_COPY_CHANGED_SINCE is held once in this module's C-122 family, its translation words.json's document.refused.changed, read by key, verbatim and protected (DEC-188 (7)), raised at the commit's document-copy site", () => {
  const list = JSON.parse(readFileSync(WORDS, "utf8"));
  const hits = (Array.isArray(list) ? list : list.words || []).filter((x) => x && x.key === "document.refused.changed");
  assert.equal(hits.length, 1, "one word in words.json");
  assert.deepEqual([hits[0].protected, hits[0].note], [true, "DOCUMENT_COPY_CHANGED_SINCE"]);
  assert.equal(PUBLICATION_WORDS["document.refused.changed"], hits[0].en, "held verbatim, by key");
  assert.deepEqual(rowOf("DOCUMENT_COPY_CHANGED_SINCE"), {
    code: "DOCUMENT_COPY_CHANGED_SINCE", check: "C-122.7", translation: hits[0].en });
  /* its words, R33's draft unchanged (K2483) */
  assert.equal(hits[0].en, "A document a member supplied now needs a different publication copy from the one this case was "
    + "prepared with. Prepare the case again. Nothing was published.");
  /* negative control: C-122.6's words are another key's */
  assert.notEqual(rowOf("PHOTO_MARKS_CHANGED_SINCE").translation, hits[0].en);
  assert.equal(CASE_SOURCES_CHECKS.DOCUMENT_COPY_CHANGED_SINCE.where,
               "src/publication/index.mjs commitCaseEdition > is-document-copy-current");
  assert.equal(Object.values(CASE_SOURCES_CHECKS).filter((x) => x.check === "C-122.7").length, 1, "held once");
  assert.equal(Object.values(CASE_SOURCES_CHECKS).filter((x) => x.check === "C-122.6").length, 1, "C-122.6 unchanged beside it");
});

test("R57 (T39) R33 every row case-carriage answers with kind document refuses the commit DOCUMENT_COPY_CHANGED_SINCE (C-122.7), naming each (at most 200), and nothing is committed; asked of the document's front matter; none lapsed commits", () => {
  const { w, cc, sign } = base();
  const asked = [];
  const lapses = [
    [DOC("INFO-2026-0030-letter", S1)],
    [DOC("INFO-2026-0030-letter", S1, "a document carried whole that needs a copy"),
     DOC("INFO-2026-0031-memo", S2, "its state cannot be read")],
  ];
  const before = w.snapshot();
  for (const answer of lapses) {
    cc.marksLapsed = (fm) => { asked.push(fm); return answer; };
    const r = sign();
    const row = rowOf("DOCUMENT_COPY_CHANGED_SINCE");
    assert.deepEqual({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation, caseId: r.caseId,
                       edition: r.edition, documents: r.documents, photos: r.photos },
                     { ok: false, reason: "DOCUMENT_COPY_CHANGED_SINCE", ...row, caseId: CASE, edition: 1,
                       documents: answer.map(named), photos: undefined });
    assert.match(r.detail, /Prepare the case again/);
    assert.deepEqual(r.refusals.map((x) => [x.reason, x.code, x.check, x.translation]),
                     [["DOCUMENT_COPY_CHANGED_SINCE", row.code, row.check, row.translation]]);
    assert.deepEqual(w.snapshot(), before, "nothing is committed");
  }
  assert.deepEqual(asked[0], parseFrontmatter(w.row(`SELECT text FROM case_documents WHERE case_id=?`, CASE).text).data,
                   "the document's front matter");
  /* at most 200 named */
  cc.marksLapsed = () => Array.from({ length: 250 }, (_, i) => DOC(`R${i}`, S1));
  const many = sign();
  assert.equal(many.reason, "DOCUMENT_COPY_CHANGED_SINCE");
  assert.equal(many.documents.length, 200);
  assert.deepEqual(w.snapshot(), before);
  /* negative control: none lapsed commits */
  cc.marksLapsed = () => [];
  assert.equal(sign().ok, true, "none lapsed commits");
});

test("R57 (T39) R33 photo rows stay C-122.6 (kind photo, or a row stating no kind); when both hold both are answered, C-122.6 first and refusals listing each with the rows it names; nothing is committed", () => {
  const { w, cc, sign } = base();
  const before = w.snapshot();
  /* photo rows alone: C-122.6, no document named */
  for (const photo of [PHOTO("INFO-2026-0020-photo", S3), { ref: "INFO-2026-0020-photo", sha: S3, why: "a photo carried whole" }]) {
    cc.marksLapsed = () => [photo];
    const r = sign();
    assert.deepEqual([r.ok, r.reason, r.check, r.documents], [false, "PHOTO_MARKS_CHANGED_SINCE", "C-122.6", undefined]);
    assert.deepEqual(r.photos, [named(photo)]);
    assert.deepEqual(r.refusals.map((x) => x.check), ["C-122.6"]);
  }
  /* both hold, interleaved: each row to its own refusal */
  const p = PHOTO("INFO-2026-0020-photo", S3), d1 = DOC("INFO-2026-0030-letter", S1), d2 = DOC("INFO-2026-0031-memo", S2);
  cc.marksLapsed = () => [d1, p, d2];
  const r = sign();
  assert.deepEqual({ ok: r.ok, reason: r.reason, ...rowOf(r.code), caseId: r.caseId, edition: r.edition, photos: r.photos },
                   { ok: false, reason: "PHOTO_MARKS_CHANGED_SINCE", ...rowOf("PHOTO_MARKS_CHANGED_SINCE"), caseId: CASE,
                     edition: 1, photos: [named(p)] });
  assert.deepEqual(r.refusals.map((x) => ({ reason: x.reason, code: x.code, check: x.check, translation: x.translation,
                                            photos: x.photos, documents: x.documents })),
                   [{ reason: "PHOTO_MARKS_CHANGED_SINCE", ...rowOf("PHOTO_MARKS_CHANGED_SINCE"), photos: [named(p)], documents: undefined },
                    { reason: "DOCUMENT_COPY_CHANGED_SINCE", ...rowOf("DOCUMENT_COPY_CHANGED_SINCE"), photos: undefined,
                      documents: [named(d1), named(d2)] }]);
  for (const x of r.refusals) assert.match(x.detail, /Prepare the case again/);
  assert.deepEqual(w.snapshot(), before, "nothing is committed");
  /* an answer that is not a list stays the photos' marks unread (fail closed) */
  cc.marksLapsed = () => null;
  const unread = sign();
  assert.deepEqual([unread.reason, unread.refusals.length], ["PHOTO_MARKS_CHANGED_SINCE", 1]);
  assert.deepEqual(w.snapshot(), before);
});

test("R57 (T39) document rows are read in R57's step, after R51 and before R59: a withdrawn consent is refused first, and a lapsed document copy before another group's withdrawn acceptance", () => {
  const { w, cc, sign } = base();
  const order = [];
  cc.sourcesLapsed = () => { order.push("R51"); return [{ capture: S1 }]; };
  cc.marksLapsed = () => { order.push("R57"); return [DOC("INFO-2026-0030-letter", S1)]; };
  cc.acceptedWorkLapsed = () => { order.push("R59"); return { withdrawn: [{ ref: "x" }], undisclosed: [] }; };
  assert.equal(sign().reason, "SOURCE_CONSENT_WITHDRAWN");
  assert.deepEqual(order, ["R51"]);
  cc.sourcesLapsed = () => { order.push("R51"); return []; };
  order.length = 0;
  assert.equal(sign().reason, "DOCUMENT_COPY_CHANGED_SINCE");
  assert.deepEqual(order, ["R51", "R57"]);
  cc.marksLapsed = () => { order.push("R57"); return []; };
  order.length = 0;
  assert.equal(sign().reason, "ACCEPTANCE_WITHDRAWN_SINCE");
  assert.deepEqual(order, ["R51", "R57", "R59"]);
  assert.equal(w.count("published_cases"), 0);
});

test("R67 (T39) R57 a waiting edition stopped at its time by C-122.6 or C-122.7 keeps each stop entry's check and cause exactly as the publisher answered them, the commit's code and translation inside it; both are kept when both hold, and nothing is committed", async () => {
  const AT = { date: "2026-10-01", time: "09:00" }, DUE = "2026-10-01T12:00:00Z";   /* 09:00 in the test profile's zone */
  const answers = [
    [DOC("INFO-2026-0030-letter", S1)],
    [PHOTO("INFO-2026-0020-photo", S3)],
    [PHOTO("INFO-2026-0020-photo", S3), DOC("INFO-2026-0030-letter", S1)],
  ];
  for (const answer of answers) {
    const { w, proj, roster, cc } = base();
    assert.equal(w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin").ok, true);
    const doc = w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, CASE);
    const set = w.record.transact(() => w.p.scheduleEdition({ case: CASE, edition: 1, docSha: doc.doc_sha, signature: "-----BEGIN SSH SIGNATURE-----\nsig1\n-----END SSH SIGNATURE-----",
      signer: "olive", deliveredBy: "member:olive", at: AT, checked: { sources: [], ties: [], holds: [] }, by: "member:olive" }));
    assert.equal(set.ok, true, JSON.stringify(set));
    cc.marksLapsed = () => answer;
    /* ratification's publisher, played as its R42 answers a commit refusal: one entry per refusal, the commit's code and
       translation in `cause` (ratification's own tests judge its entries) */
    w.p.registerScheduledPublisher("ratification", { publishScheduled(entry, now) {
      const r = w.record.transact(() => w.p.commitCaseEdition({ case: entry.case, edition: entry.edition, project: proj,
        scope: "The question.", roster, sigArmored: entry.signature, attestorKey: "AAAAC3NzaC1lZDI1NTE5AAAAIKEY",
        attestorMember: entry.signer, gateVersion: "plane-gate/test", deliveredBy: entry.delivered_by, at: now }));
      return r.ok ? { published: true, published_at: now }
        : { stopped: r.refusals.map((x) => ({ code: "SCHEDULED_CHECK_REFUSED", check: x.check, translation: x.translation,
                                              cause: { code: x.code, translation: x.translation } })) };
    } });
    const before = w.snapshot(["published_cases", "published_case_members", "published_shas", "cases"]);
    const out = await w.p.publishDue(DUE);
    const want = [...(answer.some((m) => m.kind === "photo") ? ["PHOTO_MARKS_CHANGED_SINCE"] : []),
                  ...(answer.some((m) => m.kind === "document") ? ["DOCUMENT_COPY_CHANGED_SINCE"] : [])]
      .map((code) => { const row = rowOf(code);
        return { code: "SCHEDULED_CHECK_REFUSED", translation: row.translation, check: row.check,
                 cause: { code, translation: row.translation } }; });
    assert.deepEqual(out.taken, [{ case: CASE, edition: 1, state: "stopped", reasons: want }]);
    const e = w.p.scheduledEditions({}).editions[0];
    assert.deepEqual([e.state, e.reasons], ["stopped", want], "kept as answered, read back whole");
    assert.deepEqual(w.snapshot(["published_cases", "published_case_members", "published_shas", "cases"]), before, "nothing committed");
  }
});

test("R57 (T39) R33 over the real case-carriage: a member document carried whole while its copy is pending, or one naming a copy that is not its current copy, refuses the commit DOCUMENT_COPY_CHANGED_SINCE naming it, nothing committed; once it is derived clean it commits whole; a document this copy fetched commits whole", async () => {
  const held = new Map(), bucket = {
    put: async (k, b) => { held.set(k, Buffer.from(b)); return { key: k }; },
    get: async (k) => (held.has(k) ? { arrayBuffer: async () => held.get(k) } : null),
    head: async (k) => (held.has(k) ? { size: held.get(k).length } : null) };
  const w = world({ carriage: { bucket, store: "bio" } });
  w.member("olive");
  const proj = w.project("Parks", "olive");
  const evidence = new Map();
  w.record.evidenceStore = () => ({ head: async (d) => (evidence.has(String(d)) ? { size: evidence.get(String(d)).length } : null),
                                    get: async (d) => (evidence.has(String(d)) ? { arrayBuffer: async () => evidence.get(String(d)) } : null),
                                    put: (d, b) => evidence.set(String(d), Buffer.from(b)) });
  const MINE = "INFO-2026-0030-letter", FETCHED = "INFO-2026-0031-minutes";
  w.doc(MINE, { fetched: false });
  w.doc(FETCHED);
  const shaOf = (id) => w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, id).capture_sha;
  const mine = shaOf(MINE), fetched = shaOf(FETCHED);
  evidence.set(mine, Buffer.from(w.row(`SELECT content FROM files WHERE bundle_id=? AND path LIKE 'snapshots/%'`, MINE).content));
  const cc = caseCarriageOf(w.host);
  const f = w.promote("INFO-2026-0101-first", infoMd("INFO-2026-0101-first"), "information");
  const roster = [{ bundle_id: "INFO-2026-0101-first", version_sha: f.bundleSha }];
  const roles = [{ target: "INFO-2026-0101-first", version_sha: f.bundleSha }];
  const row = (ref, sha, over) => ({ ref, kind: "document", sha, text_sha: null, origin: null, archived_copy: null,
                                     rests_under: "load_bearing", ...over });
  const refused = (r, ref, sha) => {
    assert.deepEqual({ ok: r.ok, reason: r.reason, ...rowOf(r.code) },
                     { ok: false, reason: "DOCUMENT_COPY_CHANGED_SINCE", ...rowOf("DOCUMENT_COPY_CHANGED_SINCE") });
    assert.deepEqual(r.documents.map((x) => [x.ref, x.sha]), [[ref, sha]]);
    assert.equal(r.photos, undefined);
  };
  let n = 0;
  const attempt = (materials) => {
    const c = `CASE-2026-000${++n}`;
    w.prepare(c, 1, { project: proj, roles, materials });
    return w.signCase(c, 1, { project: proj, roster });
  };

  /* the member's document carried whole, its copy not yet derived (pending) */
  assert.equal(cc.documentCopy(mine).state, "pending");
  let before = w.snapshot(["published_cases", "published_case_members", "published_shas", "cases"]);
  refused(attempt([row(MINE, mine, { included: true })]), MINE, mine);
  /* a row naming a copy that is not the document's current copy */
  refused(attempt([row(MINE, mine, { included: false, obscured: { copy: "9".repeat(64), label: "x" } })]), MINE, mine);
  assert.deepEqual(w.snapshot(["published_cases", "published_case_members", "published_shas", "cases"]), before, "nothing is committed");

  /* a document this copy fetched is carried as captured (negative control) */
  const ok = attempt([row(FETCHED, fetched, { included: true })]);
  assert.equal(ok.ok, true, JSON.stringify(ok));

  /* the member's document derived: plain text carries no details, so it is recorded clean and carried whole */
  const batch = await cc.copyBatch({});
  assert.deepEqual([batch.ok, batch.clean, batch.remaining], [true, 1, 0], JSON.stringify(batch));
  assert.equal(cc.documentCopy(mine).state, "clean");
  const r = attempt([row(MINE, mine, { included: true })]);
  assert.equal(r.ok, true, JSON.stringify(r));
});
