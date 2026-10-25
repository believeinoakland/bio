/* ratification R2 (fix round 10, follow-up 52; K5130, K5133; WALK-FINAL-10A R92, R171 (5), R93 (6)): the walker's case through the real door. A member testifies an observation, whose
   bytes the image holds inline (`testify`, not the evidence bucket); a finding of a case draft reaches it; the owner prepares the edition, the author chooses her credit, and the
   owner signs after the password again: `caseratify` answers ok. Before promotion R28 the gate's byte probe answered only the bucket, so the signing refused `GATE_REFUSED` with
   `PLANE_MISSING_BYTES` for the observation. The fixture-built tests missed it: their provenance has no register rows and their observation case stubs the reach. Run against the
   Miniflare plane (the seam kit), so the bytes are the ones `testify` wrote. Red on `ff7c96831e`, the tranche before promotion R28 merged.
   The first test is the walker's R93 (6) owner-c case: a joined member with publish capability who is not an owner is refused at the commit, and the owner's signing comes after it. */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { PARTS } from "../../../src/screens-publish/parts.mjs";
import { makeKit, BIAS } from "../control-plane/r8-kit.mjs";

const kit = makeKit({ tag: "r51obs" });
after(() => kit.mf.dispose());
const R = kit.R;
const OBSERVED = "I saw the RECEIVED stamp go on the amended contract at nine on Monday, before the council met.\n\nWhere: at the clerk's counter.";
const QUESTION = "Did a member see the stamp go on before the meeting?";

/* the walker's chain to a prepared edition, built once: the observation, its question and draft, the edition prepared, the author's credit chosen (cover, then name) */
let chain = null;
async function preparedObservationCase() {
  if (chain) return chain;
  const own = await kit.ownerOf("r51obs-owner");
  const cs = kit.screenCall(own.auth);
  const wb = await kit.person("r51obs-writer", "member", ["contribute"]);
  const wcs = kit.screenCall(wb);
  const oc = await kit.ownerOf("r51obs-owner-c");
  const project = await kit.projectOf(own.auth, "Walker observation, follow-up 52");
  for (const who of ["r51obs-writer", "r51obs-owner-c"]) {
    await kit.get(own.auth, { op: "projectinvite", projectId: project, handle: who });
    await kit.get(who === "r51obs-writer" ? wb : oc.auth, { op: "projectjoin", projectId: project });
  }

  /* a member's own observation, testified: its bytes are written inline in her image, and no evidence-bucket object holds them */
  const obs = R(await wcs.call("testify", { body: { words: OBSERVED, observedAt: "2026-10-20T09:00:00Z" } }));
  assert.ok(obs.bundle_id && obs.capture_sha, "the observation is testified: " + JSON.stringify(obs).slice(0, 300));

  /* the owner opens a question, finds the observation's sentence, cites it and concludes */
  const question = await kit.questionOf(own.auth, project, QUESTION);
  const found = R(await cs.call("findin", { body: { scope: { capture: obs.capture_sha }, kinds: ["term"], term: "RECEIVED stamp" } }));
  const item = found.kinds[0].items[0];
  const cited = R(await cs.call("cite", { body: { project: question, role: "supports", found: item } }));
  assert.deepEqual(cited.cited, [obs.bundle_id], "the question rests on the observation: " + JSON.stringify(cited).slice(0, 300));
  const concl = R(await cs.call("conclude", { query: { target: question, project, reading: "A member saw the stamp go on before the meeting.",
    falsifier: "A dated log showing otherwise would overturn this.", reason: "The member's own account says so." } }));
  assert.equal(concl.ok, true, "concluded: " + JSON.stringify(concl).slice(0, 400));

  /* the case editor's draft, and the ceremony's `publish` with the Ties step confirmed: the finding reaches the observation */
  const draft = R(await cs.call("casedraft", { body: { project, targets: [question], scope: "Whether a member saw the stamp go on before the vote.",
    statement: "This case covers the observation only; it leaves out the later amendments.", subjectPosition: "sought_and_answered",
    subjectJustification: "We put the question to the Clerk and printed the answer.", roles: { [question]: "load_bearing" }, excluded: [] } }));
  assert.ok(draft.draftId, "a draft: " + JSON.stringify(draft).slice(0, 300));
  const prepared = R(await cs.call("publish", { body: { draft: draft.draftId, project, tieAttested: true, biasAcknowledgement: BIAS } }));
  assert.equal(prepared.ok, true, "the edition is prepared: " + JSON.stringify(prepared).slice(0, 600));

  /* the author chooses her credit, cover and then name, each with its reason: the gate needs the choice in force before it signs */
  for (const level of ["cover", "name"]) {
    const a = R(await wcs.call("attribute", { body: { caseId: prepared.caseId, edition: prepared.edition, observation: obs.bundle_id, level,
      reason: `I choose ${level} because it fits what I saw.` } }));
    assert.equal(a.ok, true, `the credit is chosen (${level}): ` + JSON.stringify(a).slice(0, 300));
  }
  chain = { own, oc, cs, prepared, obs };
  return chain;
}

test("R2 (R93 (6)): an owner-capable member who is joined but not an owner is refused at the commit, CASE_SIGNER_NOT_AN_OWNER, before the owner signs", { timeout: 900000 }, async () => {
  const { oc, cs, prepared } = await preparedObservationCase();
  /* her own key, her own sitting: the sitting is read by the owner, as the walker reads it (the others cannot read the document) */
  const key = await kit.newKey();
  const reg = R(await kit.screenCall(oc.auth).call("signerregisterown", { body: { keyB64: key.keyB64 } }));
  assert.equal(reg.ok, true, "her key is registered: " + JSON.stringify(reg).slice(0, 300));
  const doc = R(await cs.call("casedocument", { query: { case: prepared.caseId, edition: String(prepared.edition) } }));
  const list = PARTS.sitting(doc, { findings: prepared.findings.map((f) => ({ target: f.target, bundleSha: f.bundleSha })) });
  const sigs = [];
  for (const x of list) sigs.push(await kit.signText(key, x.text, x.namespace));
  const ra = R(await kit.screenCall(oc.auth).call("reauth", { body: { password: oc.password } }));
  assert.equal(ra.ok, true, "re-authenticated: " + JSON.stringify(ra).slice(0, 200));
  const res = await kit.post(oc.auth, "caseratify", { caseId: prepared.caseId, edition: Number(prepared.edition), expectedSha: doc.doc_sha, sig: sigs[0],
    members: list.slice(1).map((x, i) => ({ id: x.id, sha: x.sha, signature: sigs[i + 1] })) });
  assert.equal(R(res.body).ok, false, kit.gateLine(res));
  assert.equal(R(res.body).reason, "CASE_SIGNER_NOT_AN_OWNER", kit.gateLine(res));
});

test("R2: the walker's case signs through the door: a member's testified observation, reached by a finding of the case draft, is signed by the owner after the password again", { timeout: 900000 }, async () => {
  const { own, cs, prepared, obs } = await preparedObservationCase();
  const { res, list } = await kit.sitAndSign({ auth: own.auth, password: own.password, cs, prepared });
  assert.ok(list.some((x) => x.id === obs.bundle_id), "the observation is in the sitting: " + JSON.stringify(list.map((x) => x.id)));
  assert.equal(res.status, 200, kit.gateLine(res));
  assert.equal(res.body.ok, true, kit.gateLine(res));
});
