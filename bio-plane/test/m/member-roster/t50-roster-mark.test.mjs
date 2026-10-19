/* T50 (T50-2; N1119, N1092; K3369; DEC-238 S23 "A"): R62 `memberList` answers the founder's row, and R63 `lookedAt`, the
   Home mark read without moving it (amends R58). Each at the interface, each with its controls. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { Members } from "../../../src/member-roster/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const founderRow = (list) => list.members.find((r) => r.founder === true);

test("R62 a claimed group with no founder handle held lists the founder first, with the keys R14 gives every row and handle null", async () => {
  const w = await world().group("ann");
  const list = w.m.memberList({});
  assert.equal(list.members[0].member_id, "admin", "first, as R29 orders her");
  assert.deepEqual(list.members.map((r) => r.member_id), ["admin", "ann", "second"]);
  const f = list.members[0];
  assert.deepEqual(f, {
    member_id: "admin", handle: null, founder: true, role: "admin", status: "active",
    status_by: "not recorded", invited_by: "not recorded", capabilities: [...Members.CAPABILITIES],
    pairing_published: false, created: null, updated: null, invite_pending: 0, expertise: [],
  });
  assert.deepEqual(f.capabilities, ["contribute", "publish", "create_projects"], "every word of R1's vocabulary");
  assert.deepEqual(f.capabilities, w.m.sessionRights("admin").capabilities, "as R30 gives them");
  /* the same row through the op, whoever asks */
  assert.deepEqual(w.ops("").memberlist().members[0], f);
});

test("R62 after founderHandleSet the row names her handle; the string admin is member_id only and appears as no handle", async () => {
  const w = await world().group("ann");
  assert.equal(w.m.founderHandleSet({ handle: "steward", by: "admin" }).ok, true);
  for (const administer of [undefined, true]) {
    const rows = w.m.memberList({ administer }).members;
    assert.deepEqual([rows[0].member_id, rows[0].handle, rows[0].founder], ["admin", "steward", true]);
    assert.equal(rows.some((r) => r.handle === "admin"), false, "admin is no one's handle");
    assert.deepEqual(rows.map((r) => r.member_id).filter((id) => id === "admin"), ["admin"], "listed once");
  }
  assert.equal(w.m.memberByHandle("steward"), null, "R48: still a handle of members only; she is no members row");
});

test("R62 an administrator's roster carries her projects as the supplied projectsOf answers them (R71); never a cover, a door or an invitation", async () => {
  const w = await world().group("ann");
  const held = { admin: [{ project: "PROJ-F", state: "joined", owner: true }], ann: [{ project: "PROJ-G", state: "joined", owner: true }] };
  const asked = [];
  const projectsOf = (id, viewer) => { asked.push([id, viewer]); return held[id] ?? []; };
  const list = w.m.memberList({ administer: true, viewer: "admin", projectsOf });
  const f = founderRow(list);
  assert.deepEqual(f.projects, [{ project: "PROJ-F", state: "joined", owner: true }]);
  for (const key of ["cover", "door", "approvedBy", "expires", "invitation"]) assert.equal(key in f, false, key);
  /* as the function gives them for any member, the viewer it was handed deciding which she may see */
  assert.deepEqual(list.members.find((r) => r.member_id === "ann").projects, [{ project: "PROJ-G", state: "joined", owner: true }]);
  assert.deepEqual(list.members.find((r) => r.member_id === "second").projects, []);
  assert.deepEqual([...new Set(asked.map(([, v]) => v))], ["admin"], "the viewer the caller stamped");
  assert.deepEqual(asked.map(([id]) => id).sort(), ["admin", "ann", "second"], "one call per row, the founder's included");
});

test("R62 controls: an unclaimed group lists no founder row; no other row carries founder; a member's roster carries no cover on any row, hers included", async () => {
  const bare = world();
  bare.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('old','c','member','invited','t','t')`);
  assert.deepEqual(bare.m.memberList({ administer: true }).members.map((r) => r.member_id), ["old"]);
  assert.equal(founderRow(bare.m.memberList({})), undefined);
  const w = await world().group("ann");
  assert.equal(w.m.memberList({}).members.filter((r) => "founder" in r).length, 1, "only her row carries founder");
  for (const administer of [undefined, false, "0", "yes"])
    for (const r of w.m.memberList({ administer }).members) assert.equal("cover" in r, false, `${r.member_id} for ${administer}`);
  /* a group claimed later gains the row at once; the row is not a stored fact */
  const later = world();
  later.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('old','c','member','invited','t','t')`);
  assert.equal(founderRow(later.m.memberList({})), undefined);
  later.creds.claimed = true;
  assert.equal(later.m.memberList({}).members[0].member_id, "admin");
});

/* ---------------------------------------------------------------- R63 ---------------------------------------------- */

test("R63 lookedAt reads the mark without moving it: null, then lookedSince's instant, the same on every read; lookedSince still answers that instant and lookedAt then answers the later one", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.UTC(2026, 9, 17, 12, 0, 0) });
  const w = await world().group("ann");
  assert.deepEqual(w.m.lookedAt({ by: "ann" }), { since: null }, "no look recorded yet");
  assert.deepEqual(w.m.lookedAt({ by: "member:ann" }), { since: null }, "either spelling");
  const first = new Date(Date.now()).toISOString();
  assert.deepEqual(w.m.lookedSince({ by: "ann" }), { since: null }, "the first look answers null");
  t.mock.timers.tick(60_000);
  assert.deepEqual(w.m.lookedAt({ by: "ann" }), { since: first });
  t.mock.timers.tick(60_000);
  assert.deepEqual(w.m.lookedAt({ by: "ann" }), { since: first }, "two reads, the same instant");
  assert.deepEqual(w.m.lookedAt({ by: "member:ann" }), { since: first });
  const rows = JSON.stringify(w.rows(`SELECT * FROM home_looks`));
  w.m.lookedAt({ by: "ann" });
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM home_looks`)), rows, "it wrote nothing");
  /* the next lookedSince answers the instant lookedAt read: it was not moved */
  assert.deepEqual(w.m.lookedSince({ by: "ann" }), { since: first });
  const second = new Date(Date.now()).toISOString();
  assert.notEqual(second, first);
  assert.deepEqual(w.m.lookedAt({ by: "ann" }), { since: second }, "and lookedAt then answers the later one");
  /* the op, a read: the stamp from the query, and nothing the body says */
  assert.deepEqual(w.ops("by=ann", { by: "bob" }).lookedat(), { since: second });
});

test("R63 controls: a machine, an operator token, an absent or an inactive by answers {since: null}; one member's lookedAt never answers another's instant", async () => {
  const w = await world().group("ann", "bob");
  w.m.lookedSince({ by: "ann" });
  const annAt = w.m.lookedAt({ by: "ann" }).since;
  assert.ok(typeof annAt === "string");
  assert.deepEqual(w.m.lookedAt({ by: "bob" }), { since: null }, "bob's own mark is hers alone to hold");
  for (const by of [`${MACHINE_CLASS_PREFIX}admin`, `${MACHINE_CLASS_PREFIX}member`, "", "  ", null, undefined, 42, {}, "nobody"])
    assert.deepEqual(w.m.lookedAt({ by }), { since: null }, JSON.stringify(by));
  assert.deepEqual(w.m.lookedAt(), { since: null });
  assert.deepEqual(w.m.lookedAt(null), { since: null });
  /* a member not active has no mark, though one was recorded while she was */
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  assert.deepEqual(w.m.lookedAt({ by: "ann" }), { since: null });
  /* the founder has one once the instance is claimed, and none before */
  assert.deepEqual(w.m.lookedAt({ by: "admin" }), { since: null });
  w.m.lookedSince({ by: "admin" });
  assert.equal(typeof w.m.lookedAt({ by: "admin" }).since, "string");
  const unclaimed = world();
  assert.deepEqual(unclaimed.m.lookedSince({ by: "admin" }), { since: null });
  assert.deepEqual(unclaimed.m.lookedAt({ by: "admin" }), { since: null });
});
