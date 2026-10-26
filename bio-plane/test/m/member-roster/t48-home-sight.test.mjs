/* T48 (T48-9): R58, when a member last looked at Home (N1036; DEC-218, K3146, K3189). Each with its control (K874).
   (R44's sight levels, `membership`'s, stay with its tests.) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, snapshot } from "./fixture.mjs";
import { Members, MEMBER_DECLARED_TABLES, MEMBER_EXEMPT_TABLES } from "../../../src/member-roster/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const tick = () => new Promise((r) => setTimeout(r, 3));

/* ---------------------------------------------------------------- R58 ---------------------------------------------- */

test("R58 lookedSince: a first look answers null and records the call's instant; the second answers the first's instant; each member's mark is her own; the founder has one once claimed", async () => {
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

test("R58 control: an absent by, a machine credential, an operator token, an unknown or inactive member, and the founder of an unclaimed instance record nothing and answer null; it never throws", async () => {
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
  const broken = new Members({ sql: { exec() { throw new Error("disk"); } } });
  assert.deepEqual(broken.lookedSince({ by: "ann" }), { since: null });
  /* control of the control: an active member does record */
  assert.deepEqual(w.m.lookedSince({ by: "ann" }), { since: null });
  assert.notEqual(snapshot(w), before);
});

test("R58 home_looks is declared with export never and sight owner, exempt from purge as the members are, and holds the member and an instant only", async () => {
  const decl = MEMBER_DECLARED_TABLES.find((t) => t.name === "home_looks");
  assert.deepEqual({ ...decl }, { name: "home_looks", purge: "exempt", expunge: "none", export: "never", sight: "owner",
                                  derive: "stored", version_chain: false });
  assert.ok(MEMBER_EXEMPT_TABLES.includes("home_looks"), "in the list of what purge keeps");
  assert.ok(Object.isFrozen(decl));
  /* control: a table of the module's declared in the default form is not declared apart */
  assert.equal(MEMBER_DECLARED_TABLES.some((t) => t.name === "members"), false);
});

test("R58 op=lookedsince answers the stamped member's own mark, read and recorded in one act; control: a body's `by` is never read, and no stamp records nothing", async () => {
  const w = await world().group("ann", "bob");
  assert.deepEqual(w.ops("by=ann", { by: "bob" }).lookedsince(), { since: null });
  const at = w.row(`SELECT at FROM home_looks WHERE member_id='ann'`).at;
  assert.equal(w.row(`SELECT at FROM home_looks WHERE member_id='bob'`), null, "the body's `by` moved no mark");
  await tick();
  assert.deepEqual(w.ops("by=ann").lookedsince(), { since: at }, "the second answers the first's instant");
  /* control: with no stamp, whatever the body names, nothing is recorded */
  const before = snapshot(w);
  assert.deepEqual(w.ops("", { by: "bob" }).lookedsince(), { since: null });
  assert.deepEqual(w.ops(`by=${MACHINE_CLASS_PREFIX}admin`).lookedsince(), { since: null });
  assert.equal(snapshot(w), before);
});
