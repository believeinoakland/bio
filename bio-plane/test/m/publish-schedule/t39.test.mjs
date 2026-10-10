/* publish-schedule — T41-37 (K624's copy of publication's `t39.test.mjs` R67 arm, re-labelled R2; T39, N805): a waiting
   edition stopped at its time keeps each stop entry's check and cause exactly as the publisher answered them, over
   `publication`'s real commit (its R57, C-122.6, C-122.7). `case-carriage.marksLapsed` is driven by a stand-in on the
   host's one case-carriage (reached through publication, which creates it) answering exactly its shape (`[{ref, sha, kind, why}]`). Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, infoMd } from "./fixture.mjs";
import { rowOf } from "../../../src/publication/checks.mjs";

const CASE = "CASE-2026-0001";
const S1 = "ab".repeat(32), S3 = "ef".repeat(32);
const DOC = (ref, sha, why = "a copy that is no longer the document's current copy") => ({ ref, sha, kind: "document", why });
const PHOTO = (ref, sha, why = "a mark was withdrawn since the case was prepared") => ({ ref, sha, kind: "photo", why });

function base() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  const p = w.promote("INFO-2026-0101-first", infoMd("INFO-2026-0101-first"), "information");
  assert.equal(p.ok, true, JSON.stringify(p));
  const roles = [{ target: "INFO-2026-0101-first", version_sha: p.bundleSha }];
  const roster = roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha }));
  const cc = w.p.caseCarriage;   /* the host's one case-carriage, as publication reaches it */
  w.prepare(CASE, 1, { project: proj, roles });
  return { w, proj, roster, cc };
}

test("R2 (T39) publication R57 a waiting edition stopped at its time by C-122.6 or C-122.7 keeps each stop entry's check and cause exactly as the publisher answered them, the commit's code and translation inside it; both are kept when both hold, and nothing is committed", async () => {
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
    const set = w.record.transact(() => w.ps.scheduleEdition({ case: CASE, edition: 1, docSha: doc.doc_sha, signature: "-----BEGIN SSH SIGNATURE-----\nsig1\n-----END SSH SIGNATURE-----",
      signer: "olive", deliveredBy: "member:olive", at: AT, checked: { sources: [], ties: [], holds: [] }, by: "member:olive" }));
    assert.equal(set.ok, true, JSON.stringify(set));
    cc.marksLapsed = () => answer;
    /* ratification's publisher, played as its R42 answers a commit refusal: one entry per refusal, the commit's code and
       translation in `cause` (ratification's own tests judge its entries) */
    w.ps.registerScheduledPublisher("ratification", { publishScheduled(entry, now) {
      const r = w.record.transact(() => w.p.commitCaseEdition({ case: entry.case, edition: entry.edition, project: proj,
        scope: "The question.", roster, sigArmored: entry.signature, attestorKey: "AAAAC3NzaC1lZDI1NTE5AAAAIKEY",
        attestorMember: entry.signer, gateVersion: "plane-gate/test", deliveredBy: entry.delivered_by, at: now }));
      return r.ok ? { published: true, published_at: now }
        : { stopped: r.refusals.map((x) => ({ code: "SCHEDULED_CHECK_REFUSED", check: x.check, translation: x.translation,
                                              cause: { code: x.code, translation: x.translation } })) };
    } });
    const before = w.snapshot(["published_cases", "published_case_members", "published_shas", "cases"]);
    const out = await w.ps.publishDue(DUE);
    const want = [...(answer.some((m) => m.kind === "photo") ? ["PHOTO_MARKS_CHANGED_SINCE"] : []),
                  ...(answer.some((m) => m.kind === "document") ? ["DOCUMENT_COPY_CHANGED_SINCE"] : [])]
      .map((code) => { const row = rowOf(code);
        return { code: "SCHEDULED_CHECK_REFUSED", translation: row.translation, check: row.check,
                 cause: { code, translation: row.translation } }; });
    assert.deepEqual(out.taken, [{ case: CASE, edition: 1, state: "stopped", reasons: want }]);
    const e = w.ps.scheduledEditions({}).editions[0];
    assert.deepEqual([e.state, e.reasons], ["stopped", want], "kept as answered, read back whole");
    assert.deepEqual(w.snapshot(["published_cases", "published_case_members", "published_shas", "cases"]), before, "nothing committed");
  }
});

