/* store-assembly's copy of plane's test. plane R90 -> R66 (fix round 7, G58; K4566; diagnosis-R7-g1-live.md Finding 2): THE FOUNDER'S `owedwork` CARRIES THE WATCHDOG'S FIELDS.
   The door stamps the founder's session with the bare viewer `admin` (admission `resolveSession`, `viewerPredicate`'s root spelling);
   `administers` must know it. The through-the-door cases (founder, member, administrator member, machine credential) are
   control-plane's seam file (`t51-round7-seam.test.mjs`); these are the plane's own, at the object's door with the viewer the door
   stamps. */
import "../../../src/store-assembly/register.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./fixture.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { administersOf, pendingOps } from "../../../src/store-assembly/pending.mjs";

const D = "d".repeat(64);
const FIELDS = ["alarm_at", "last_run", "oldest_overdue", "stale", "watchdog_seen"];
const own = (r) => FIELDS.filter((k) => Object.hasOwn(r, k));

async function world() {
  const x = await store({});
  const sql = x.ctx.storage.sql;
  for (const [id, role] of [["ada", "admin"], ["ann", "member"]])
    sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated) VALUES (?, ?, ?, ?, 'active', '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role);
  sql.exec(`INSERT INTO keeps_pending (sha, kind, parts, detail, attempts, registered_at, due_at) VALUES (?, 'reading', '[]', '{}', 0, 1, 1)`, D);
  const ask = async (q) => (await (await x.fetch(`/owedwork?${q}`)).json()).result;
  return { x, ask };
}

test("R66 (G58): the founder's session, whose viewer the door stamps as the bare `admin`, is shown the five watchdog fields by `owedwork`, with and without a digest (own properties, null allowed)", async () => {
  const { ask } = await world();
  for (const q of ["viewer=admin", `viewer=admin&sha=${D}`]) {
    const r = await ask(q);
    assert.deepEqual(own(r).sort(), FIELDS, q);
  }
});

test("R66 (G58): control: an ordinary member, an unenrolled spelling and a caller's own `cls` are shown none of them; an administrator member and the machine credential still are", async () => {
  const { ask } = await world();
  for (const q of ["viewer=member:ann", "viewer=member:ann&cls=admin", "viewer=member:nobody", "viewer=class:member", "viewer=admins", ""])
    assert.deepEqual(own(await ask(q)), [], q);
  for (const q of ["viewer=member:ada", "viewer=class:admin", `viewer=class:admin&sha=${D}`])
    assert.deepEqual(own(await ask(q)).sort(), FIELDS, q);
});

test("R66 (G58): `administers` knows the spellings the door stamps: the founder's `admin`, `class:admin`, an active administrator member; not a member, nothing, or a spelling that only looks like one", async () => {
  const { x } = await world();
  const administers = administersOf((id) => membershipOf(x.ctx).isAdministrator(id));
  assert.equal(administers("admin"), true);
  assert.equal(administers("class:admin"), true);
  assert.equal(administers("member:ada"), true);
  assert.equal(administers("member:ann"), false);
  assert.equal(administers("member:nobody"), false);
  assert.equal(administers(undefined), false);
  assert.equal(administers(null), false);
  assert.equal(administers(""), false);
  assert.equal(administers("class:member"), false);
  assert.equal(administers("administrator"), false);
});

test("R66 (K4566): with `health` handed and an administrator asking, a `health` that throws or answers no object gives the five fields as null and a `watchdog_why`; a member still gets none", async () => {
  const holder = { summary: () => ({}), list: () => [], add: async () => ({ ok: true }) };
  const url = new URL("http://do/owedwork?viewer=admin");
  const asked = async (health, viewer = "admin") => pendingOps(holder, new URL(`http://do/owedwork?viewer=${viewer}`), { health, administers: administersOf(() => false) }).owedwork();
  for (const bad of [() => { throw new Error("health broke"); }, async () => { throw new Error("health broke"); }, () => null, () => "nope", () => 7]) {
    const r = await asked(bad);
    assert.deepEqual(FIELDS.map((k) => r[k]), [null, null, null, null, null]);
    assert.deepEqual(own(r).sort(), FIELDS);
    assert.equal(typeof r.watchdog_why, "string");
    assert.ok(r.watchdog_why.length > 0);
    const m = await asked(bad, "member:ann");
    assert.deepEqual(own(m).concat(Object.hasOwn(m, "watchdog_why") ? ["watchdog_why"] : []), [], "a member is shown nothing of it");
  }
  /* control: a sound health is passed through and carries no `watchdog_why` */
  const good = await asked(() => ({ last_run: 5, alarm_at: 6, stale: false, oldest_overdue: null, watchdog_seen: 7 }));
  assert.deepEqual([good.last_run, good.alarm_at, good.watchdog_seen, Object.hasOwn(good, "watchdog_why")], [5, 6, 7, false]);
  void url;
});
