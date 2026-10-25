/* T50 (T50-5; N1186, K3557), at the interface: a grant's and a run credential's optional project
   fences the viewer they make (R79: membership R149's `projectViewer`). Every refusal has a control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD, sha } from "./fixture.mjs";
import { projectViewer, noSuchProject } from "../../../src/membership/index.mjs";

const look = (w, token) => w.c.aiCredentialLook({ secretSha: sha(token) }).credential;

/* second (an administrator) owns A; ann owns B (discoverable, so the administrator sees it) and H (hidden); bob is in
   nothing. Records: one of A, one of B, one belonging to no project. Everyone holds an account of their own. */
async function projectWorld() {
  const w = await world().group("ann", "bob");
  w.project("A", "second");
  w.project("B", "ann", "discoverable");
  w.project("H", "ann");
  for (const [id, project, title] of [["recA", "A", "a record of A"], ["recB", "B", "a record of B"], ["recNone", null, "a record of none"]])
    w.core.addBundle(id, "finding", title, project);
  for (const id of ["second", "ann", "bob"])
    assert.equal((await w.c.accountReferenceSet({ member: id, kind: "apikey", secret: `sk-${id}`, by: id })).ok, true);
  w.session = {};
  for (const id of ["second", "ann", "bob"]) w.session[id] = (await w.c.login({ handle: id, password: PASSWORD(id) })).token;
  return w;
}

const seen = (w, viewer) => ["recA", "recB", "recNone"].map((id) => w.m.inSight(id, viewer));

test("R79 an ask's grant minted with a project makes the viewer membership R149 gives, narrowed to that project's records: the viewer aiGrantHeld and aiGrantAdmit answer; control: with no project it is the plain member viewer and sees B's record", async () => {
  const w = await projectWorld();
  const mint = (member, project) => w.c.aiGrantMint({ member, by: member, session: w.session[member], project });
  const g = await mint("second", "A");
  assert.equal(g.ok, true);
  const want = projectViewer("member:second", "A");
  assert.notEqual(want, "member:second", "the viewer carries the project");
  for (const r of [await w.c.aiGrantHeld({ token: g.token }), await w.c.aiGrantAdmit({ token: g.token, op: "search" })]) {
    assert.deepEqual([r.ok, r.member, r.viewer], [true, "second", want]);
    assert.deepEqual(seen(w, r.viewer), [true, false, false], "A's record only: not B's, not a record of no project");
  }
  assert.equal(w.row(`SELECT project FROM ai_grants`).project, "A", "the project is on the grant's row");
  /* control: no project, the viewer is as before and sees B's record */
  const plain = await mint("second", undefined);
  assert.equal(plain.ok, true);
  const held = await w.c.aiGrantHeld({ token: plain.token });
  assert.equal(held.viewer, "member:second");
  assert.deepEqual(seen(w, held.viewer), [true, true, true]);
  assert.equal(w.rows(`SELECT project FROM ai_grants WHERE project IS NULL`).length, 1, "no project: none recorded");
  /* control: a standing question's grant carries no project */
  w.c.accountUsesSet({ owner: "member:ann", switch: "standing", on: true, by: "ann" });
  const st = await w.c.aiGrantMintStanding({ member: "ann", question: "q" });
  assert.equal((await w.c.aiGrantHeld({ token: st.token })).viewer, "member:ann");
});

test("R79 an ask's grant for a project the member has not joined is refused PROJECT_ACT_NOT_A_PARTICIPANT, and for one they cannot see as absent, each minting nothing; control: the project they have joined is minted", async () => {
  const w = await projectWorld();
  const before = w.snapshot();
  const notJoined = await w.c.aiGrantMint({ member: "second", by: "second", session: w.session.second, project: "B" });
  assert.deepEqual([notJoined.ok, notJoined.code], [false, "PROJECT_ACT_NOT_A_PARTICIPANT"]);
  assert.deepEqual(await w.c.aiGrantMint({ member: "bob", by: "bob", session: w.session.bob, project: "H" }), noSuchProject("H"));
  assert.deepEqual(await w.c.aiGrantMint({ member: "bob", by: "bob", session: w.session.bob, project: "NOPE" }), noSuchProject("NOPE"));
  assert.equal(w.snapshot(), before, "nothing was minted");
  assert.equal((await w.c.aiGrantMint({ member: "second", by: "second", session: w.session.second, project: "A" })).ok, true);
});

test("R79 a run credential minted with a project is looked up with the viewer membership R149 gives, its project and its run and writes beside it; control: with no project the principal is the plain member viewer", async () => {
  const w = await projectWorld();
  const a = w.c.aiRunCredentialMint({ member: "second", run: "RUN-A", writes: ["airuntick"], project: "A" });
  assert.equal(a.ok, true);
  assert.deepEqual(Object.keys(a).sort(), ["expiresAt", "ok", "run", "token", "tokenId", "writes"], "the answer is R63's");
  const c = look(w, a.token);
  assert.equal(c.principal, projectViewer("member:second", "A"));
  assert.deepEqual([c.project, c.run, c.writes, c.revoked, c.expired], ["A", "RUN-A", ["airuntick"], false, false]);
  assert.deepEqual(seen(w, c.principal), [true, false, false], "A's record only: not B's, not a record of no project");
  assert.ok(!("project" in w.c.aiCredentials({}).credentials.find((x) => x.tokenId === a.tokenId)), "R15's list is as it was");
  /* control: no project */
  const p = w.c.aiRunCredentialMint({ member: "second", run: "RUN-P", writes: ["airuntick"] });
  const pc = look(w, p.token);
  assert.deepEqual([pc.principal, pc.project], ["member:second", null]);
  assert.deepEqual(seen(w, pc.principal), [true, true, true]);
  /* the project never changes after minting: the next segment of the run is a new credential with its own */
  const next = w.c.aiRunCredentialMint({ member: "second", run: "RUN-A", writes: ["airuntick"] });
  assert.equal(look(w, next.token).principal, "member:second");
  assert.equal(look(w, a.token).project, "A", "the earlier one keeps its project (and is revoked, R63)");
});

test("R79 a run credential's project is refused, in R63's order: the member first, then the shape (a project present and not a non-empty string is AI_RUN_CREDENTIAL_MALFORMED), then the project's sight and joining, then the keep-away; each minting nothing; control: a joined project is minted under the keep-away's own refusal", async () => {
  const w = await projectWorld();
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  const before = w.snapshot();
  const mint = (member, project, run = "RUN-1", writes = ["airuntick"]) => w.c.aiRunCredentialMint({ member, run, writes, project });
  assert.equal(mint("bob", "A").code, "ACCOUNT_MEMBER_NOT_ACTIVE", "the member first");
  for (const project of ["", "  ", 7, {}, ["A"], false]) {
    const r = mint("second", project);
    assert.deepEqual([r.ok, r.code, r.what], [false, "AI_RUN_CREDENTIAL_MALFORMED", "project"], JSON.stringify(project));
  }
  assert.equal(mint("second", 7, "").what, "run", "run before project");
  assert.equal(mint("second", 7, "RUN-1", ["promote"]).what, "writes", "writes before project");
  const b = mint("second", "B");
  assert.deepEqual([b.ok, b.code], [false, "PROJECT_ACT_NOT_A_PARTICIPANT"], "seen and not joined");
  assert.deepEqual(mint("ann", "NOPE"), noSuchProject("NOPE"), "unknown, as absent");
  assert.deepEqual(w.c.aiRunCredentialMint({ member: "ann", run: "RUN-1", writes: ["airuntick"], project: "H" }).ok, true, "control: ann owns H");
  const h = w.c.aiRunCredentialMint({ member: "second", run: "RUN-2", writes: ["airuntick"], project: "H" });
  assert.equal(h.ok, false, "a hidden project the administrator does not take part in");
  /* the keep-away comes after the project */
  assert.equal(w.c.aiKeepAwaySet({ on: true, uses: ["standing"], reason: "a review", by: "second" }).ok, true);
  assert.equal(mint("second", "B").code, "PROJECT_ACT_NOT_A_PARTICIPANT", "the project before the keep-away");
  assert.equal(mint("second", "A").code, "AI_KEPT_AWAY", "control: a joined project reaches the keep-away");
  assert.equal(w.rows(`SELECT run FROM ai_credentials WHERE run IS NOT NULL AND run <> 'RUN-1'`).length, 0, "nothing else minted");
  assert.notEqual(w.snapshot(), before);   /* ann's RUN-1 above is the only credential written */
});
