/* T48 (T48-9): R143, when a member last looked at Home (N1036; DEC-218, K3146, K3189), and R44's sight levels spelled as
   `sight` answers them (N1019, K3112). Each with its control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, realWorld } from "./fixture.mjs";
import { Membership, MEMBERSHIP_DECLARED_TABLES, MEMBERSHIP_EXEMPT_TABLES } from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));
const tick = () => new Promise((r) => setTimeout(r, 3));

/* ---------------------------------------------------------------- R143 --------------------------------------------- */

test("R143 lookedSince: a first look answers null and records the call's instant; the second answers the first's instant; each member's mark is her own; the founder has one once claimed", async () => {
  const w = await world().group("ann", "bob");
  const t0 = Date.now();
  const first = w.m.lookedSince({ by: "ann" });
  assert.deepEqual(first, { since: null }, "no look recorded before");
  const mark = w.row(`SELECT member_id, at FROM home_looks WHERE member_id='ann'`);
  assert.ok(mark && Date.parse(mark.at) >= t0 - 1 && Date.parse(mark.at) <= Date.now(), "the call's instant is the mark");
  await tick();
  const second = w.m.lookedSince({ by: "ann" });
  assert.deepEqual(second, { since: mark.at }, "the second answers the first's instant");
  const moved = w.row(`SELECT at FROM home_looks WHERE member_id='ann'`).at;
  assert.ok(Date.parse(moved) > Date.parse(mark.at), "and records its own as the new mark");
  assert.deepEqual(w.m.lookedSince({ by: V("ann") }), { since: moved }, "`member:ann` names the same member");
  /* another member's mark is her own: bob's first look is null, and never ann's instant */
  assert.deepEqual(w.m.lookedSince({ by: "bob" }), { since: null });
  /* the founder, once claimed (R94) */
  assert.deepEqual(w.m.lookedSince({ by: "admin" }), { since: null });
  const f = w.row(`SELECT at FROM home_looks WHERE member_id='admin'`).at;
  assert.deepEqual(w.m.lookedSince({ by: V("admin") }), { since: f });
  /* a mark holds its member and an instant and nothing else */
  assert.deepEqual(w.rows(`PRAGMA table_info(home_looks)`).map((c) => c.name), ["member_id", "at"]);
  assert.equal(w.rows(`SELECT * FROM home_looks`).length, 3, "one row per member that looked");
});

test("R143 control: an absent by, a machine credential, an operator token, an unknown or inactive member, and the founder of an unclaimed instance record nothing and answer null; it never throws", async () => {
  const w = await world().group("ann", "bob");
  const invited = await w.m.memberAdd({ memberId: "cal", cover: "c", by: "admin" });
  assert.equal(invited.ok, true);
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  const before = snapshot(w);
  for (const by of [null, undefined, "", "   ", `${MACHINE_CLASS_PREFIX}admin`, `${MACHINE_CLASS_PREFIX}member`,
                    "token:operator", "TOKEN:x", "nobody", "member:nobody", "member:", "bob", V("bob"), "cal", 7, {}, []])
    assert.deepEqual(w.m.lookedSince({ by }), { since: null }, JSON.stringify(by));
  assert.deepEqual(w.m.lookedSince(), { since: null });
  assert.deepEqual(w.m.lookedSince(null), { since: null });
  assert.equal(snapshot(w), before, "nothing recorded");
  /* the founder of an unclaimed instance has no mark */
  const u = world();
  assert.deepEqual(u.m.lookedSince({ by: "admin" }), { since: null });
  assert.equal(u.rows(`SELECT * FROM home_looks`).length, 0);
  /* never throws: a store that cannot be read answers null */
  const broken = new Membership({ sql: { exec() { throw new Error("disk"); } } });
  assert.deepEqual(broken.lookedSince({ by: "ann" }), { since: null });
  /* control of the control: an active member does record */
  assert.deepEqual(w.m.lookedSince({ by: "ann" }), { since: null });
  assert.notEqual(snapshot(w), before);
});

test("R143 home_looks is declared through record-core's declareTable with export never and sight owner, exempt from purge as the members are; a whole-store purge keeps every mark", async () => {
  const decl = MEMBERSHIP_DECLARED_TABLES.find((t) => t.name === "home_looks");
  assert.deepEqual({ ...decl }, { name: "home_looks", purge: "exempt", expunge: "none", export: "never", sight: "owner",
                                  derive: "stored", version_chain: false });
  assert.ok(MEMBERSHIP_EXEMPT_TABLES.includes("home_looks"), "in the list of what purge keeps");
  const w = await realWorld();
  await w.claim();
  const [d] = w.rc.declaredTables().filter((x) => x.module === "membership" && x.name === "home_looks");
  assert.deepEqual([d.purge, d.export, d.sight], ["exempt", "never", "owner"]);
  w.m.lookedSince({ by: "admin" });
  w.rc.purge({});
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM home_looks`).n, 1, "kept by purge");
  /* control: a table purge clears (a project-keyed one) is not declared so */
  const [pp] = w.rc.declaredTables().filter((x) => x.module === "membership" && x.name === "project_participants");
  assert.equal(pp.purge, "clear");
});

/* ---------------------------------------------------------------- R44 ---------------------------------------------- */

test("R44 sight answers the three levels as the strings \"full\", \"existence\" and \"none\", exported as Membership.SIGHT_FULL, SIGHT_EXISTENCE and SIGHT_NONE; control: no other spelling is answered", async () => {
  assert.deepEqual([Membership.SIGHT_FULL, Membership.SIGHT_EXISTENCE, Membership.SIGHT_NONE], ["full", "existence", "none"]);
  const w = await world().group("ann", "bob", "cal");
  w.project("PROJ-D", "Discoverable D");
  w.project("PROJ-H", "Hidden H");
  for (const p of ["PROJ-D", "PROJ-H"]) w.m.projectClaimOwner({ projectId: p, memberId: "ann" });
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  const answers = [
    [w.m.sight("PROJ-D", V("ann")), "full"], [w.m.sight("PROJ-D", V("cal")), "existence"],
    [w.m.sight("PROJ-H", V("cal")), "none"], [w.m.sight("PROJ-H", V("second")), "existence"],
    [w.m.sight("PROJ-NEVER", V("ann")), "none"],
  ];
  for (const [got, want] of answers) assert.equal(got, want);
  /* control: every answer is one of the three exported strings, never an upper-case form */
  const levels = new Set([Membership.SIGHT_FULL, Membership.SIGHT_EXISTENCE, Membership.SIGHT_NONE]);
  for (const [got] of answers) {
    assert.ok(levels.has(got), got);
    assert.notEqual(got, got.toUpperCase());
  }
  assert.ok(!levels.has("FULL") && !levels.has("EXISTENCE") && !levels.has("NONE"));
});
