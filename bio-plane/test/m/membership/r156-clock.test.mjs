/* T51 fix round 10 (R156; MEMBER-ROSTER #6 J9; K5197; K5132's rule, `credentials`' `#nowMs` its pattern): every instant this
   module records, and every judgement of one, reads the store's clock: a handed `now`, else the store's `env.BIO_NOW_MS`
   (the environment `membershipOps` is given), else the wall clock. Each instant is read back from the table the act wrote. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { Membership, membershipOps } from "../../../src/membership/index.mjs";
import { world } from "./fixture.mjs";

const PINNED = Date.UTC(2031, 2, 4, 9, 30);   // 2031-03-04T09:30:00.000Z: far from the wall clock of any run
const PINNED_ISO = new Date(PINNED).toISOString();
const pinnedEnv = (ms) => ({ BIO_NOW_MS: String(ms) });
const url = (query = "") => new URL(`http://x/?${query}`);

test("R156 every instant a project act records reads BIO_NOW_MS: claim, invite, join, leave, visibility and removal", async () => {
  const w = await world().group("ann", "cal", "dee");
  w.project("PROJ-A");
  const env = pinnedEnv(PINNED);
  const claimed = membershipOps(w.m, url(), { projectId: "PROJ-A", memberId: "ann" }, env).projectclaimowner();
  assert.equal(claimed.ok, true, "the owner is claimed");
  assert.equal(w.row(`SELECT joined_at FROM project_participants WHERE project_id=? AND member_id=?`, "PROJ-A", "ann").joined_at,
    PINNED_ISO, "the claim's joined instant reads BIO_NOW_MS");

  const visible = membershipOps(w.m, url("projectId=PROJ-A&setting=discoverable&reason=pinned&by=ann&viewer=member:ann"), {}, env)
    .projectvisibilityset();
  assert.equal(visible.ok, true, "the visibility is set");
  assert.equal(w.row(`SELECT at FROM project_visibility WHERE project_id=? ORDER BY seq DESC LIMIT 1`, "PROJ-A").at,
    PINNED_ISO, "the visibility record's instant reads BIO_NOW_MS");

  const invited = membershipOps(w.m, url("projectId=PROJ-A&handle=cal&by=ann&viewer=member:ann"), {}, env).projectinvite();
  assert.equal(invited.ok, true, "cal is invited");
  assert.equal(w.row(`SELECT created FROM project_participants WHERE project_id=? AND member_id=?`, "PROJ-A", "cal").created,
    PINNED_ISO, "the invitation's instant reads BIO_NOW_MS");

  const joined = membershipOps(w.m, url("projectId=PROJ-A&by=cal&viewer=member:cal"), {}, env).projectjoin();
  assert.equal(joined.ok, true, "cal joins");
  assert.equal(w.row(`SELECT joined_at FROM project_participants WHERE project_id=? AND member_id=?`, "PROJ-A", "cal").joined_at,
    PINNED_ISO, "the join's instant reads BIO_NOW_MS");

  const left = membershipOps(w.m, url("projectId=PROJ-A&by=cal&comment=pinned&viewer=member:cal"), {}, env).projectleave();
  assert.equal(left.ok, true, "cal asks to leave");
  assert.equal(w.row(`SELECT updated FROM project_participants WHERE project_id=? AND member_id=?`, "PROJ-A", "cal").updated,
    PINNED_ISO, "the request to leave is stamped on BIO_NOW_MS");

  membershipOps(w.m, url("projectId=PROJ-A&handle=dee&by=ann&viewer=member:ann"), {}, env).projectinvite();
  membershipOps(w.m, url("projectId=PROJ-A&by=dee&viewer=member:dee"), {}, env).projectjoin();
  const removed = membershipOps(w.m, url("projectId=PROJ-A&handle=dee&by=ann&comment=pinned&viewer=member:ann"), {}, env)
    .projectremove();
  assert.equal(removed.ok, true, "dee is removed");
  assert.equal(w.row(`SELECT at FROM project_removals WHERE project_id=? AND member_id=?`, "PROJ-A", "dee").at,
    PINNED_ISO, "the removal's instant reads BIO_NOW_MS");
});

test("R156 with no pinned clock, a project act's instant is the wall clock", async () => {
  const w = await world().group("ann");
  w.project("PROJ-W");
  const before = Date.now();
  const claimed = membershipOps(w.m, url(), { projectId: "PROJ-W", memberId: "ann" }, {}).projectclaimowner();
  assert.equal(claimed.ok, true);
  const stored = Date.parse(w.row(`SELECT joined_at FROM project_participants WHERE project_id=? AND member_id=?`, "PROJ-W", "ann").joined_at);
  assert.ok(stored >= before - 1000 && stored <= Date.now() + 1000, "with neither a handed clock nor BIO_NOW_MS, the wall clock");
});

test("R156 a handed clock answers before the environment's BIO_NOW_MS", async () => {
  const HANDED = Date.UTC(2032, 5, 1, 0, 0);
  const w = await world();
  w.bundle("PROJ-H", "project");
  const m = new Membership({ sql: w.sql, core: w.core, now: () => HANDED });
  m.migrate();
  const answer = membershipOps(m, url(), { projectId: "PROJ-H", memberId: "ann" }, pinnedEnv(PINNED)).projectclaimowner();
  assert.equal(answer.ok, true);
  assert.equal(w.row(`SELECT joined_at FROM project_participants WHERE project_id=? AND member_id=?`, "PROJ-H", "ann").joined_at,
    new Date(HANDED).toISOString(), "the handed `now` is read first, before BIO_NOW_MS");
});

test("R156 a member-roster instant recorded through membershipOps reads BIO_NOW_MS: the members delegate takes the same clock", async () => {
  const w = await world().group("ann");
  const answer = membershipOps(w.m, url("by=admin"), { holders: "ann", note: "pinned" }, pinnedEnv(PINNED)).hostingaccessset();
  assert.equal(answer.ok, true, "the hosting-access record is made");
  assert.equal(answer.at, PINNED_ISO, "member-roster's instant reads BIO_NOW_MS when the act comes through membership");
});
