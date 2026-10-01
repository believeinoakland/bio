/* publication — converted from `bio-plane/test/casesign.test.mjs` (layer 8, publication's share): R1/R29 standing on an
   unsigned case document, byte for byte, for an administrator, the instance MEMBER binding, invited and joined
   non-owners and agent credentials (block 1b of the old suite), with its strangers. The old suite, kept by K619, was
   deleted in T20; its ceremony, gate, container and signature arms are other modules' shares. Driven at the module's
   interface: `caseDocument`, `caseDocumentFacts`, `hasCaseStanding` and `op=casedocument`, with each viewer spelled as
   the control plane stamps it (membership R43's `viewerPredicate`; an `ai` credential stamps the principal membership
   records for it, read back through credentials' `aiCredentialLook`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, V, sha } from "./fixture.mjs";
import { viewerPredicate } from "../../../src/membership/index.mjs";

const CASE = "CASE-2026-7700";
const LEAD = "INQ-2026-7700-lead", SUPP = "INQ-2026-7700-supporting", INFO = "INFO-2026-7700-memo";
const SCOPE = "The question.";   /* the fixture's authored scope sentence */

/* iris owns the publishing project; omar is an administrator with no role in it; wen a plain member iris invites; vic a
   member who owns a project of her own and has no standing in iris's; nadia a revoked administrator. One unsigned case
   document, edition 1, over two findings of iris's project. */
function ceremony() {
  const w = world();
  w.member("iris"); w.member("omar", { role: "admin" }); w.member("wen"); w.member("vic");
  w.member("nadia", { role: "admin", status: "revoked" });
  const proj = w.project("Auditor", "iris");
  const vicProj = w.project("Elsewhere", "vic");
  w.doc(INFO);
  w.inquiry(LEAD, { legs: [{ target: INFO }] });
  w.inquiry(SUPP, { legs: [{ target: INFO }] });
  const roles = [{ target: LEAD, version_sha: w.head(LEAD) }, { target: SUPP, version_sha: w.head(SUPP), role: "supporting" }];
  w.prepare(CASE, 1, { project: proj, roles, author: "iris" });
  return { w, proj, vicProj, roles };
}
/* The answer for a case document never authored, from a world that never held one, at the same id and edition. */
const never = (viewer, edition = 1) => world().p.caseDocument(CASE, edition, viewer);
const neverFacts = (viewer, edition = 1) => world().p.caseDocumentFacts(CASE, edition, viewer);
const neverOp = (viewer, edition = 1) => JSON.stringify(world().op("casedocument", { case: CASE, edition, viewer }));
/* An `ai` credential minted by `who`, and the viewer the plane stamps for it: its recorded principal. */
function agent(w, who, kind = "member") {
  const secretSha = sha(`agent-secret-${who}-${kind}`);
  const m = w.credentials.aiCredentialMint({ who, tokenId: `agent-${who}-${kind}`, secretSha, principalKind: kind,
    principalMember: kind === "member" ? who : null, taskScope: "investigative", writes: [], note: "converted casesign" });
  assert.equal(m.ok, true, `mint ${who} ${kind}: ${JSON.stringify(m)}`);
  const look = w.credentials.aiCredentialLook({ secretSha });
  assert.equal(look.found, true);
  return look.credential.principal;
}
/* Every reader of the unsigned document, asserted as one: the whole answer, its facts, the op's bytes and the exported
   standing test. With standing the answer is the owner's, byte for byte; without it, a never-authored edition's. */
function assertReads(w, viewer, label) {
  const owner = w.p.caseDocument(CASE, 1, V("iris"));
  const got = w.p.caseDocument(CASE, 1, viewer);
  assert.deepEqual([got.ok, got.case_id, got.ratified, typeof got.text === "string" && got.text.includes(SCOPE)],
                   [true, CASE, false, true], `${label} reads the whole unsigned document`);
  assert.equal(JSON.stringify(got), JSON.stringify(owner), `${label} reads what the owner reads, byte for byte`);
  assert.equal(w.p.caseDocumentFacts(CASE, 1, viewer).ok, true, `${label}: its facts too (R2 is fenced as R1)`);
  assert.equal(JSON.stringify(w.op("casedocument", { case: CASE, edition: 1, viewer })), JSON.stringify(owner),
               `${label}: op=casedocument answers the same bytes`);
  assert.equal(w.p.hasCaseStanding(w.row(`SELECT * FROM case_documents WHERE edition=1`), viewer), true, `${label}: standing`);
}
function assertStranger(w, viewer, label) {
  const got = w.p.caseDocument(CASE, 1, viewer);
  assert.equal(got.reason, "NO_CASE_DOCUMENT", label);
  assert.equal(JSON.stringify(got), JSON.stringify(never(viewer)), `${label}: byte for byte a case never authored`);
  assert.equal(JSON.stringify(w.p.caseDocumentFacts(CASE, 1, viewer)), JSON.stringify(neverFacts(viewer)),
               `${label}: its facts answer as never authored`);
  assert.equal(JSON.stringify(w.op("casedocument", { case: CASE, edition: 1, viewer })), neverOp(viewer),
               `${label}: op=casedocument answers the never-authored bytes`);
  for (const s of [SCOPE, LEAD, SUPP, INFO])
    assert.equal(JSON.stringify(got).includes(s), false, `${label}: the answer carries nothing the document says (${s})`);
  assert.equal(w.p.hasCaseStanding(w.row(`SELECT * FROM case_documents WHERE edition=1`), viewer), false, `${label}: no standing`);
}

test("R1 R29 an unsigned case document answers the owner, an administrator, the MEMBER binding, an invited and a joined non-owner, and the owner's agent whole; each stranger byte for byte as a case never authored", () => {
  const { w, proj, vicProj } = ceremony();
  const m = w.membership;
  /* the ground: the owner reads it, unsigned, and the baseline is a genuine not-found */
  assertReads(w, V("iris"), "the OWNER");
  assert.equal(w.p.caseDocument(CASE, 1, V("iris")).sig_armored, null);
  assert.equal(never(V("iris")).reason, "NO_CASE_DOCUMENT");
  /* an ADMINISTRATOR with no role in the project (Membership v2 7.3: sees every project, directs none) */
  assert.equal(m.participation(proj, "omar") ?? null, null, "(fixture) omar has no role in the project");
  assertReads(w, V("omar"), "an active ADMINISTRATOR");
  /* the instance-level MEMBER binding, and every machine class the plane stamps, see all working material */
  for (const cls of ["class:member", "class:admin", "class:daemon"]) {
    assert.equal(viewerPredicate(cls).scope, "member", `(fixture) ${cls} is the unfiltered scope`);
    assertReads(w, cls, `the machine binding ${cls}`);
  }
  /* a PARTICIPANT who is not an owner: invited reads, and still reads once joined (standing is participation) */
  assertStranger(w, V("wen"), "wen before any invitation");
  assert.equal(m.projectInvite({ projectId: proj, handle: "h_wen", by: "iris", viewer: V("iris") }).ok, true);
  assert.equal(m.isProjectOwner(proj, "wen"), false);
  assertReads(w, V("wen"), "an INVITED non-owner");
  assert.equal(m.projectJoin({ projectId: proj, by: "wen", viewer: V("wen") }).ok, true);
  assert.equal(m.isJoinedParticipant(proj, "wen"), true);
  assertReads(w, V("wen"), "a JOINED non-owner");
  /* AGENT credentials stand as their declared principal: the owner's agent reads, another project's member's agent
     is a stranger, and an organisation agent (minted by an administrator) is the unfiltered machine scope */
  const irisAgent = agent(w, "iris"), vicAgent = agent(w, "vic"), orgAgent = agent(w, "omar", "organisation");
  assert.deepEqual([irisAgent, vicAgent, orgAgent], [V("iris"), V("vic"), "class:ai"]);
  assertReads(w, irisAgent, "an agent credential whose principal is the OWNER");
  assertStranger(w, vicAgent, "an agent credential whose principal is a member of another project");
  assertReads(w, orgAgent, "an organisation-scoped agent credential");
  /* the STRANGERS: anonymous, an unknown credential, malformed spellings, a member of another project who owns a
     project of her own (standing is in THIS case's project, not being an owner somewhere), and a revoked admin */
  assert.equal(m.isProjectOwner(vicProj, "vic"), true, "(fixture) vic owns a project elsewhere");
  for (const [viewer, label] of [[null, "ANONYMOUS"], [undefined, "no viewer"], ["", "an empty viewer"],
                                 ["not-a-credential", "an unknown credential"], ["member:", "a bare member: prefix"],
                                 ["class:nobody", "an unknown machine class"], [V("vic"), "a member of another project"],
                                 [V("nadia"), "a revoked administrator"], [V("ghost"), "a member id nobody enrolled"]])
    assertStranger(w, viewer, label);
});

test("R1 standing is required in every project the record names: an edition whose document names another project than the case's owner answers only a viewer seeing both", () => {
  const { w, proj, vicProj, roles } = ceremony();
  const m = w.membership;
  assert.equal(m.projectInvite({ projectId: proj, handle: "h_wen", by: "iris", viewer: V("iris") }).ok, true);
  assert.equal(m.projectJoin({ projectId: proj, by: "wen", viewer: V("wen") }).ok, true);
  /* edition 1 is ratified, so the record's `cases` row names iris's project; edition 2's document names vic's */
  assert.equal(w.signCase(CASE, 1, { project: proj, signer: "iris",
    roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: r.role ?? "load_bearing" })) }).ok, true);
  w.prepare(CASE, 2, { project: vicProj, roles, author: "iris" });
  const doc2 = w.row(`SELECT * FROM case_documents WHERE edition=2`);
  const stranger2 = (viewer, label) => {
    assert.equal(w.p.hasCaseStanding(doc2, viewer), false, label);
    assert.equal(JSON.stringify(w.p.caseDocument(CASE, 2, viewer)), JSON.stringify(never(viewer, 2)), label);
    assert.equal(JSON.stringify(w.op("casedocument", { case: CASE, edition: 2, viewer })), neverOp(viewer, 2), label);
  };
  const reads2 = (viewer, label) => {
    assert.equal(w.p.hasCaseStanding(doc2, viewer), true, label);
    const got = w.p.caseDocument(CASE, 2, viewer);
    assert.deepEqual([got.ok, got.edition, got.ratified], [true, 2, false], label);
  };
  stranger2(V("iris"), "the case's owner, with no standing in the project the document names");
  stranger2(V("vic"), "the named project's owner, with no standing in the case's project");
  stranger2(V("wen"), "a joined participant of the case's project only");
  stranger2(agent(w, "iris"), "the case owner's agent");
  reads2(V("omar"), "an active administrator sees both projects");
  reads2("class:member", "the MEMBER binding");
  reads2(agent(w, "omar", "organisation"), "an organisation agent");
  /* a participant of BOTH reads it: vic invites wen into her project too */
  assert.equal(m.projectInvite({ projectId: vicProj, handle: "h_wen", by: "vic", viewer: V("vic") }).ok, true);
  reads2(V("wen"), "a participant of both projects");
  /* and the ratified edition 1 still answers anybody */
  assert.equal(w.p.caseDocument(CASE, 1, null).ratified, true);
});
