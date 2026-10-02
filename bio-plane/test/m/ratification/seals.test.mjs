/* ratification R37 (DEC-111; K1031 (3)): once a case edition's commit (R3) is accepted, the case ceremony calls
   `network-notices.openSeals({case, edition})` (its R17) outside the commit's transaction. A failure there never changes
   the ceremony's answer: it is stated, and the `working-on-attest` consumer retries it. Driven at the store half
   (`ratifyCaseDocument`) and the Worker half (`caseRatifyOp`), with a stand-in `openSeals` that answers, refuses, throws
   and rejects, and with the real network-notices module on the same host. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, caseMd, plane, newKey, signCase, cleanCase, fmText, CASE_BODY, V } from "./fixture.mjs";
import { caseConclusionRowLines } from "../../../src/ratification/index.mjs";
import { caseRatifyOp } from "../../../src/ratification/ops.mjs";
import { networkNoticesOf } from "../../../src/network-notices/index.mjs";

const Q1 = "INQ-2026-0001-first", CASE = "CASE-2026-0001";
const OWN = { version: "first", claim: "the council approved it", falsifier: "f", falsifier_override: null,
              by: "member:alice", at: "2026-09-27T10:00:00Z" };
const SIG = "-----BEGIN SSH SIGNATURE-----\nAAAA\n-----END SSH SIGNATURE-----\n";

function setup() {
  const w = world();
  w.member("alice");
  const P = w.project("Team", "alice");
  w.inquiry(Q1);
  w.bv.conc.set(w.key(P, Q1), OWN);
  const members = [{ id: Q1, pin: w.sha(Q1), role: "load_bearing" }];
  const text = caseMd({ caseId: CASE, edition: 1, project: P, members, rowLines: caseConclusionRowLines,
                        conclusions: [[Q1, w.r.caseConclusionFor(P, Q1, V("alice"), "open")]] });
  const docSha = w.caseDoc(CASE, 1, text);
  const commit = (o = {}) => w.r.ratifyCaseDocument({ caseId: CASE, edition: 1, docSha, sigArmored: SIG, attestorKey: "KEY",
    attestorMember: "alice", gateVersion: "plane-gate/1.0", deliveredBy: V("alice"), ...o });
  /* what the stand-in saw when it was called: whether a transaction was open, and whether the edition was committed */
  const seen = [];
  const answer = w.openSeals;
  w.openSeals = (a) => { seen.push({ inTransaction: w.st.db.isTransaction,
    ratified: w.row(`SELECT ratified_at FROM case_documents WHERE case_id=? AND edition=?`, a.case, a.edition)?.ratified_at ?? null });
    return answer(a); };
  return { w, P, docSha, commit, seen };
}
const ratified = (w) => w.row(`SELECT ratified_at FROM case_documents WHERE case_id=? AND edition=1`, CASE).ratified_at;

test("R37: once the commit is accepted, openSeals is called once with the committed case and edition, after the commit and outside its transaction; its answer is the act's `seals`", async () => {
  const { w, P, commit, seen } = setup();
  const r = await commit();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(w.sealCalls, [{ case: CASE, edition: 1 }], "once, with the committed case and edition");
  assert.equal(seen.length, 1);
  assert.equal(seen[0].inTransaction, false, "outside the commit's transaction");
  assert.ok(seen[0].ratified, "after the commit: the edition is already ratified when the seals are opened");
  assert.deepEqual(r.seals, { ok: true, case: CASE, edition: 1, project: null, opened: [], attestation: null });
  assert.deepEqual([r.caseId, r.edition, r.project, r.roster], [CASE, 1, P, [Q1]]);
});

test("R37: openSeals refusing, throwing or rejecting leaves the answer and the commit unchanged, and the failure is stated with its retry by working-on-attest", async () => {
  const base = setup();
  const ok = await base.commit();
  const { seals: _ignored, ratified_at: _at, project: _p, ...want } = ok;
  for (const [name, fail, reason] of [
    ["refuses", async () => ({ ok: false, reason: "NO_PUBLISHED_EDITION", detail: "no ratified edition" }), "NO_PUBLISHED_EDITION"],
    ["throws", () => { throw new Error("seal store unavailable"); }, "OPEN_SEALS_FAILED"],
    ["rejects", async () => { throw new Error("timestamp authority down"); }, "OPEN_SEALS_FAILED"],
    ["answers nothing", async () => undefined, "OPEN_SEALS_FAILED"]]) {
    const s = setup();
    s.w.openSeals = fail;
    const r = await s.commit();
    const { seals, ratified_at, project, ...rest } = r;
    assert.deepEqual(rest, want, `${name}: the ceremony's answer is unchanged`);
    assert.equal(project, s.P);
    assert.equal(typeof ratified_at, "string");
    assert.deepEqual([seals.ok, seals.opened, seals.reason], [false, false, reason], name);
    assert.match(seals.detail, new RegExp(`case ${CASE} edition 1 were not opened at this act`), name);
    assert.match(seals.detail, /The edition is committed and this answer stands; the working-on-attest consumer retries the opening\./, name);
    assert.ok(ratified(s.w), `${name}: the commit stands`);
    assert.equal(s.w.row(`SELECT COUNT(*) AS n FROM published_cases WHERE case_id=?`, CASE).n, 1, name);
    assert.equal(s.w.sealCalls.length, 1, name);
  }
});

test("R37: a refused commit, a rolled-back one and a retry answering existed call nothing", async () => {
  const { w, P, commit, docSha } = setup();
  assert.equal((await commit({ sigArmored: null })).reason, "CASE_UNSIGNED");
  assert.equal((await commit({ docSha: "f".repeat(64) })).reason, "CASE_RATIFY_STALE");
  assert.equal((await commit({ attestorMember: "bo" })).reason, "CASE_SIGNER_NOT_AN_OWNER");
  w.bv.conc.set(w.key(P, Q1), { ...OWN, version: "second" });
  const moved = await commit();
  assert.equal(moved.reason, "CASE_CONCLUSION_MOVED");
  assert.equal("seals" in moved, false);
  w.bv.conc.set(w.key(P, Q1), OWN);
  const real = w.publication.commitCaseEdition;
  w.publication.commitCaseEdition = () => ({ ok: false, reason: "CASE_EDITION_ALREADY_RATIFIED" });
  assert.equal((await commit()).reason, "CASE_EDITION_ALREADY_RATIFIED");
  w.publication.commitCaseEdition = () => { throw new Error("disk"); };
  await assert.rejects(commit(), /disk/);
  assert.deepEqual(w.sealCalls, [], "nothing refused or rolled back opens a seal");
  w.publication.commitCaseEdition = real;
  assert.equal((await commit()).ok, true);
  assert.equal(w.sealCalls.length, 1);
  assert.deepEqual(await commit(), { ok: true, existed: true, caseId: CASE, edition: 1 });
  assert.equal(w.sealCalls.length, 1, "a retry answering existed opens nothing");
  assert.ok(docSha);
});

test("R37: with the real network-notices module, an edition complete at its document's ratification has its opening requested and answered (no week sealed, none opened); one still awaiting members is refused by it and stated, the commit unchanged", async () => {
  const boot = (w) => {
    const nn = networkNoticesOf(w.host, { storage: w.st, record: w.record, membership: w.membership,
      credentials: w.credentials, promotion: w.promotion, publication: w.publication });
    w.openSeals = (a) => nn.openSeals(a);
  };
  /* complete at its document's ratification: every member already published at its pin, so publication stamps the
     edition's `ratified_at` in the commit (its R53), as it does when the last member lands */
  const done = setup();
  boot(done.w);
  const real = done.w.publication.commitCaseEdition;
  done.w.publication.commitCaseEdition = (a) => {
    const c = real(a);
    done.w.st.sql.exec(`UPDATE published_cases SET ratified_at=? WHERE case_id=? AND edition=?`, a.at, a.case, a.edition);
    return c;
  };
  const r = await done.commit();
  assert.equal(r.ok, true);
  assert.deepEqual([r.seals.ok, r.seals.case, r.seals.edition, r.seals.project, r.seals.opened, r.seals.attestation],
    [true, CASE, 1, done.P, [], null], JSON.stringify(r.seals));
  assert.deepEqual(done.w.st.sql.exec(`SELECT case_id, edition, project FROM nn_open_requests`),
    [{ case_id: CASE, edition: 1, project: done.P }], "the request is kept for the working-on-attest consumer");
  /* still awaiting its member: network-notices reads no published edition yet (reported to BOB) */
  const open = setup();
  boot(open.w);
  const o = await open.commit();
  assert.deepEqual([o.ok, o.seals.opened, o.seals.reason], [true, false, "NO_PUBLISHED_EDITION"]);
  assert.match(o.seals.detail, /working-on-attest consumer retries/);
  assert.ok(ratified(open.w), "the commit stands");
});

test("R37: op=caseratify relays `seals`; a throwing openSeals leaves the act's status and answer as they were, the failure stated", async () => {
  const run = async (fail) => {
    const w = world();
    const key = await newKey();
    w.member("alice", { signer: key });
    const P = w.project("Team", "alice");
    w.inquiry(Q1);
    w.bv.conc.set(w.key(P, Q1), OWN);
    const conc = w.r.caseConclusionFor(P, Q1, V("alice"), "open");
    const doc = cleanCase({ caseId: CASE, edition: 1, project: P, members: [{ id: Q1, pin: w.sha(Q1) }] });
    const text = fmText(doc, { raw: ["case_conclusions:", ...caseConclusionRowLines(Q1, conc)], body: CASE_BODY });
    const docSha = w.caseDoc(CASE, 1, text);
    w.pub.facts.set(`${CASE}#1`, { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
      attribution: { reached: [], legacy: [], stated: [], current: [] }, signers: w.credentials.attestingKeys(),
      memberBasis: null, priorCase: null });
    if (fail) w.openSeals = () => { throw new Error("seal store unavailable"); };
    const p = plane(w);
    const res = await caseRatifyOp(p.request({ caseId: CASE, edition: 1, expectedSha: docSha,
                                               sig: await signCase(key, CASE, 1, docSha) }), p.stub, p.ctx);
    return { res, w };
  };
  const good = await run(false), bad = await run(true);
  assert.deepEqual([good.res.status, good.res.body.ok, good.res.body.seals.ok], [200, true, true]);
  assert.deepEqual([bad.res.status, bad.res.body.ok, bad.res.body.seals.opened, bad.res.body.seals.reason],
    [200, true, false, "OPEN_SEALS_FAILED"]);
  const strip = ({ seals, ratified_at, project, attestor, ...b }) => ({ ...b, attestor: attestor.member });   /* two worlds: their own ids and keys */
  assert.deepEqual(strip(bad.res.body), strip(good.res.body), "the ceremony's answer is otherwise the same");
  assert.equal(bad.w.sealCalls.length, 1);
});
