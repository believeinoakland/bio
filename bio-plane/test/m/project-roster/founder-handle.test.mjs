/* R29 (T49; N1072; K3265): wherever this module names the founder to a reader it names her by `membership.founderHandle()`
   (its R144), never by the id `admin`, and every `{member, handle}` naming her carries `founder: true`, with `handle:
   null` while she holds none. At the interface: membership's acts and the record's manifest set up the group, the
   founder's handle is set through the fixture (membership's `founderHandleSet`), and each answer that can name her is
   read: R1's participants, R6's decisions (the founder deciding a rescue), R2's removals, R21's and R24's `by`, R27's
   `owner` and R28's `members`. The records the founder cannot reach through an act of this module (a removal she made as
   an owner, a scope or an approval setting she set) are written as the rows membership's and this module's acts leave. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, realWorld, V, snapshot } from "./fixture.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const M = `${MACHINE_CLASS_PREFIX}member`;

/* No answer holds the string `admin` anywhere except as a `member` id (an identifier, never a name given to a reader). */
function noAdminAsAName(answer, path = "answer") {
  if (typeof answer === "string") return assert.notEqual(answer, "admin", `${path} names the founder by her id`);
  if (Array.isArray(answer)) return answer.forEach((x, i) => noAdminAsAName(x, `${path}[${i}]`));
  if (answer && typeof answer === "object")
    for (const [k, v] of Object.entries(answer)) if (k !== "member") noAdminAsAName(v, `${path}.${k}`);
}

/* P: ann opens it (hidden, owner), bob joins, the founder is invited; both owners are then revoked but ann, so the
   founder's rescue is a decision she carried; a removal, a scope and an approval setting she made are on record. */
async function founderWorld() {
  const w = await world().group("ann", "bob", "cal");
  w.owned("PROJ-P", "ann", ["bob"]);
  w.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
              VALUES ('PROJ-P','admin','invited',0,'t','t')`);
  w.sql.exec(`INSERT INTO project_removals (project_id, member_id, removed_by, comment, at) VALUES ('PROJ-P','gone','admin','x','t')`);
  w.sql.exec(`INSERT INTO project_scopes (project_id, scope, reason, set_by, at) VALUES ('PROJ-P','counsel_matter','r','admin','t')`);
  w.sql.exec(`INSERT INTO project_approval_settings (project_id, needs, reason, set_by, at)
              VALUES ('PROJ-P','[{"tier":2}]','r','admin','t')`);
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  const r = w.r.projectOwnerRescue({ projectId: "PROJ-P", handle: "cal", by: "admin", reason: "stranded", viewer: "admin" });
  assert.equal(r.ok, true, "the founder carries the rescue");
  w.project("PROJ-F");   // opened by the founder
  w.entry("PROJ-F", "admin");
  return w;
}

const readP = (w, by = "bob") => w.r.projectParticipants({ projectId: "PROJ-P", by });
const ownerOf = (w, id) => w.r.projectList({ viewer: M }).projects.find((p) => p.id === id).owner;
const membersOf = (w, id) => w.r.projectList({ viewer: M }).projects.find((p) => p.id === id).members;

test("R29 with a founder handle held, every answer that names her names her by it with founder: true: R1's participants, R6's deciders, R2's removals, R21's and R24's by, R27's owner, R28's members", async () => {
  const w = await founderWorld();
  w.founderHandle("foundress");
  const p = readP(w);
  assert.equal(p.ok, true);
  assert.deepEqual(p.participants.filter((x) => x.founder).map((x) => [x.handle, x.founder, x.state]), [["foundress", true, "invited"]]);
  assert.deepEqual(p.ownership.map((d) => [d.kind, d.handle, d.deciders]), [["rescue", "cal", ["foundress"]]], "R6: the founder a decider");
  assert.deepEqual(p.removals.map((x) => [x.handle, x.removedBy]), [["gone", "foundress"]], "R2: the founder removed");
  assert.deepEqual(p.scopes.map((x) => x.by), ["foundress"], "R21");
  assert.deepEqual(p.approvals.map((x) => x.by), ["foundress"], "R24");
  assert.deepEqual(ownerOf(w, "PROJ-F"), { member: "admin", handle: "foundress", founder: true }, "R27");
  assert.deepEqual(membersOf(w, "PROJ-P").filter((x) => x.founder), [{ member: "admin", handle: "foundress", founder: true }], "R28");
  noAdminAsAName([p, w.r.projectList({ viewer: M })]);
  /* a member is never marked: founder appears on her entries alone, and the shapes of the others are unchanged */
  for (const x of [...p.participants, ...membersOf(w, "PROJ-P")]) assert.equal("founder" in x, x.member === "admin" || x.handle === "foundress", JSON.stringify(x));
  for (const x of membersOf(w, "PROJ-P").filter((m) => m.member !== "admin")) assert.deepEqual(Object.keys(x).sort(), ["handle", "member"]);
});

test("R29 with no founder handle held, her handle is null and she still carries founder: true; no answer holds the string admin as a name, at any depth", async () => {
  const w = await founderWorld();
  const p = readP(w);
  assert.deepEqual(p.participants.filter((x) => x.founder).map((x) => [x.handle, x.founder]), [[null, true]]);
  assert.deepEqual(p.ownership[0].deciders, [null]);
  assert.deepEqual(p.removals.map((x) => x.removedBy), [null]);
  assert.deepEqual([p.scopes[0].by, p.approvals[0].by], [null, null]);
  assert.deepEqual(ownerOf(w, "PROJ-F"), { member: "admin", handle: null, founder: true });
  assert.deepEqual(membersOf(w, "PROJ-P").filter((x) => x.founder), [{ member: "admin", handle: null, founder: true }]);
  noAdminAsAName([p, w.r.projectList({ viewer: M }), w.r.projectList({ viewer: V("bob") })]);
  /* the handle chosen later shows at once, at each read */
  w.founderHandle("later");
  assert.equal(readP(w).participants.find((x) => x.founder).handle, "later");
  assert.equal(ownerOf(w, "PROJ-F").handle, "later");
});

test("R29 the founder's own place in the order: after the handles while she holds none, by her handle once she does; the same order in R1 and R28", async () => {
  const w = await founderWorld();
  const order = (viewer) => [readP(w).participants.map((x) => x.handle),
    w.r.projectList({ viewer }).projects.find((q) => q.id === "PROJ-P").members.map((x) => x.handle)];
  const [r1, r28] = order(V("bob"));
  assert.deepEqual(r1.at(-1), null, "no handle held: last");
  assert.deepEqual(r28, r1, "R28 lists R1's roster");
  w.founderHandle("alpha");
  const [r1b, r28b] = order(V("bob"));
  assert.deepEqual(r1b.filter((h) => h !== "alpha"), r1.filter((h) => h !== null), "the members keep their order");
  assert.deepEqual(r28b, r1b);
  assert.ok(r1b.includes("alpha"));
});

test("R29 control: a project the founder is not in names her nowhere; the reads write nothing; a founder id with no membership offering founderHandle answers null, never admin", async () => {
  const w = await founderWorld();
  w.founderHandle("foundress");
  w.owned("PROJ-Q", "bob");   // the founder is not in it
  const before = snapshot(w);
  assert.doesNotMatch(JSON.stringify(w.r.projectParticipants({ projectId: "PROJ-P", by: "bob" }).participants.filter((x) => !x.founder)), /founder/);
  assert.doesNotMatch(JSON.stringify(w.r.projectParticipants({ projectId: "PROJ-Q", by: "bob" })), /foundress|founder|admin/);
  assert.equal(snapshot(w), before, "nothing written");
  /* membership offering no founderHandle (a membership before R144), or one that throws: null, never the id */
  const w2 = await founderWorld();
  w2.m.founderHandle = () => { throw new Error("no"); };
  assert.equal(readP(w2).participants.find((x) => x.founder).handle, null);
  delete w2.m.founderHandle;
  assert.equal(readP(w2).participants.find((x) => x.founder).handle, null);
  noAdminAsAName(readP(w2));
});

test("R29 over the real record-core: the founder opened a project by a commit and is named by her handle in R27, and R28's members once invited", async () => {
  const w = await realWorld();
  const { m, r, rc } = w;
  await w.claim();
  await w.enrol("ann");
  rc.commit({ bundleId: "PROJ-F", type: "project", title: "F", snapKey: "K1", author: "admin", base: null, files: [], state: "forming",
    group: "g", created: "2026-10-01T00:00:00.000Z", lastUpdated: "2026-10-01T00:00:00.000Z", at: "2026-10-01T00:00:00.000Z" });
  m.reindexProjectSight("PROJ-F");
  const owner = () => r.projectList({ viewer: M }).projects[0].owner;
  assert.deepEqual(owner(), { member: "admin", handle: null, founder: true });
  w.founderHandle("foundress");
  assert.deepEqual(owner(), { member: "admin", handle: "foundress", founder: true });
  noAdminAsAName(r.projectList({ viewer: M }).projects.map((p) => p.owner));
});
