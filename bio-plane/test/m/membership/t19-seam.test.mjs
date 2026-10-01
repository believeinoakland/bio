/* T19 layer 2, the seam with `credentials` (K637) and the project fence (N426): R92 `sessionRights`, R94
   `registerClaimed` with what it decides (R64 `isAdministrator`, R86 `activeAdmins`), and R43's fence of a bundle that
   belongs to a project, which R80 `inSight`, R88 `hiddenBundles` and R44 `sight` read through it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { Membership, viewerPredicate, hiddenBundles, MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const ALL = [...Membership.CAPABILITIES].sort();
const census = (w) => JSON.stringify(["members", "member_expertise", "admin_votes", "project_participants"]
  .map((t) => w.rows(`SELECT * FROM ${t}`)));

/* ---- R92 ---- */

test("R92 sessionRights(role): the founder holds every capability, administer and rootOfTrust", async () => {
  const w = await world().group();
  const r = w.m.sessionRights(Membership.ROOT_ADMIN);
  assert.deepEqual([...r.capabilities].sort(), ALL);
  assert.equal(r.administer, true);
  assert.equal(r.rootOfTrust, true);
  assert.equal(r.member, Membership.ROOT_ADMIN);
});

test("R92 an active administrator holds every capability and administer whatever their row stores; never rootOfTrust", async () => {
  const w = await world().group();
  /* `second` was invited with the default set; the stored set is not consulted for an administrator. */
  assert.deepEqual(JSON.parse(w.row(`SELECT capabilities FROM members WHERE member_id='second'`).capabilities), ["contribute"]);
  const r = w.m.sessionRights("member:second");
  assert.deepEqual([...r.capabilities].sort(), ALL);
  assert.equal(r.administer, true);
  assert.equal(r.rootOfTrust, false);
  assert.equal(r.member, "second");
  assert.equal(r.handle, "second");
});

test("R92 an active member holds their stored set, resolved at the call, so a change shows on the next read", async () => {
  const w = await world().group("ann");
  assert.deepEqual(w.m.sessionRights("member:ann").capabilities, ["contribute"]);
  assert.equal(w.m.sessionRights("member:ann").administer, false);
  assert.equal(w.m.memberCaps({ memberId: "ann", capabilities: ["publish", "contribute"], by: "admin" }).ok, true);
  const r = w.m.sessionRights("member:ann");
  assert.deepEqual(r.capabilities, ["publish", "contribute"]);
  assert.equal(r.administer, false);
  assert.equal(r.rootOfTrust, false);
  assert.equal(r.handle, "ann");
});

test("R92 a missing or inactive member, or an unrecognised role, holds none; it writes nothing and never throws", async () => {
  const w = await world().group("ann");
  /* an invited member who has not enrolled is not active */
  await w.m.memberAdd({ memberId: "inv", cover: "cover of inv", by: "admin" });
  assert.equal(w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" }).ok, true);
  const before = census(w);
  for (const role of ["member:ann", "member:inv", "member:nobody", "member:", "class:admin", `${MACHINE_CLASS_PREFIX}member`,
                      "second", "ADMIN", "", null, undefined, 42, {}, [], () => "admin"]) {
    let r;
    assert.doesNotThrow(() => { r = w.m.sessionRights(role); }, String(role));
    assert.deepEqual(r.capabilities, [], String(role));
    assert.equal(r.administer, false, String(role));
    assert.equal(r.rootOfTrust, false, String(role));
  }
  /* a store that cannot be read holds no rights rather than throwing */
  const broken = new Membership({ sql: { exec() { throw new Error("disk"); } } });
  assert.deepEqual(broken.sessionRights("member:ann").capabilities, []);
  assert.equal(broken.sessionRights("member:ann").administer, false);
  assert.equal(census(w), before, "nothing written");
});

test("R92 the capabilities answered are a copy: changing one answer changes no later answer", async () => {
  const w = await world().group();
  w.m.sessionRights("admin").capabilities.push("administer");
  assert.deepEqual([...w.m.sessionRights("admin").capabilities].sort(), ALL);
});

/* ---- R94, with R64 and R86 ---- */

test("R94 R64 R86 the founder is an administrator, first in the list, exactly when the registered fact answers true", async () => {
  const w = world();
  await w.enrol("second", "admin", `${MACHINE_CLASS_PREFIX}admin`);
  let claimed = false;
  assert.deepEqual(w.m.registerClaimed("credentials", () => claimed), { ok: true, module: "credentials" });
  assert.equal(w.m.isAdministrator("admin"), false);
  assert.deepEqual(w.m.activeAdmins(), ["second"]);
  claimed = true;
  assert.equal(w.m.isAdministrator("admin"), true);
  assert.deepEqual(w.m.activeAdmins(), ["admin", "second"]);
  /* only `true` is a claim */
  for (const v of [1, "true", "yes", {}, [], Promise.resolve(true), undefined, null]) {
    claimed = v;
    assert.equal(w.m.isAdministrator("admin"), false, String(v));
    assert.deepEqual(w.m.activeAdmins(), ["second"], String(v));
  }
});

test("R94 a fact that throws reads as not claimed, and nothing it is handed makes membership throw", async () => {
  const w = world();
  await w.enrol("second", "admin", `${MACHINE_CLASS_PREFIX}admin`);
  w.m.registerClaimed("credentials", () => { throw new Error("no store"); });
  assert.doesNotThrow(() => w.m.isAdministrator("admin"));
  assert.equal(w.m.isAdministrator("admin"), false);
  assert.deepEqual(w.m.activeAdmins(), ["second"]);
});

test("R94 with nothing registered and no founder credential, the instance reads as not claimed", async () => {
  const w = world();
  await w.enrol("second", "admin", `${MACHINE_CLASS_PREFIX}admin`);
  assert.equal(w.m.isAdministrator("admin"), false);
  assert.deepEqual(w.m.activeAdmins(), ["second"]);
});

test("R94 R81 one registration, whoever makes it: a second is LISTENER_DECLARED naming the holder, a malformed one LISTENER_MALFORMED", async () => {
  const w = world();
  const bad = [[null, () => true], ["", () => true], ["credentials", null], ["credentials", "true"], [42, () => true]];
  for (const [mod, fn] of bad) {
    const r = w.m.registerClaimed(mod, fn);
    assert.equal(r.ok, false);
    assert.equal(r.reason, "LISTENER_MALFORMED");
    assert.equal(r.check, MEMBERSHIP_CHECKS.LISTENER_MALFORMED.check);
    assert.equal(r.translation, MEMBERSHIP_CHECKS.LISTENER_MALFORMED.translation);
  }
  assert.equal(w.m.registerClaimed("credentials", () => true).ok, true);
  for (const mod of ["credentials", "promotion"]) {
    const r = w.m.registerClaimed(mod, () => false);
    assert.equal(r.ok, false);
    assert.equal(r.reason, "LISTENER_DECLARED");
    assert.equal(r.module, "credentials", "names the holder");
    assert.equal(r.check, MEMBERSHIP_CHECKS.LISTENER_DECLARED.check);
  }
  assert.equal(w.m.isAdministrator("admin"), true, "a refused registration replaced nothing");
});

test("R94 it writes nothing", async () => {
  const w = await world().group("ann");
  const before = census(w);
  w.m.registerClaimed("credentials", () => true);
  w.m.registerClaimed("credentials", () => true);
  w.m.isAdministrator("admin");
  w.m.activeAdmins();
  assert.equal(census(w), before);
});

/* ---- R43's project fence (N426) ---- */

/* P has owner ann and invited bob; cal is outside it; second is an administrator. Bundles: ESC in P, PLN in P,
   INF in no project, BLANK with an empty project, ORPH naming a project no one holds. D is discoverable. */
async function fenceWorld() {
  const w = await world().group("ann", "bob", "cal");
  w.project("PROJ-P", "Project P");
  w.project("PROJ-D", "Project D");
  w.m.projectClaimOwner({ projectId: "PROJ-P", memberId: "ann" });
  w.m.projectClaimOwner({ projectId: "PROJ-D", memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-P", handle: "bob", by: "ann", viewer: V("ann") });
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  w.bundle("ESC-1", "escalation", "an escalation", "PROJ-P");
  w.bundle("PLN-1", "action_plan", "a plan", "PROJ-P");
  w.bundle("PLN-D", "action_plan", "a plan in D", "PROJ-D");
  w.bundle("INF-1", "information", "shared evidence", null);
  w.bundle("BLANK-1", "information", "blank project", "");
  w.bundle("ORPH-1", "information", "names a project no one holds", "PROJ-GONE");
  return w;
}
const sees = (w, viewer) => {
  const g = viewerPredicate(viewer);
  return w.rows(`SELECT b.bundle_id FROM bundles b WHERE ${g.sql} ORDER BY b.bundle_id`, ...g.args).map((r) => r.bundle_id);
};
const EVERY = ["BLANK-1", "ESC-1", "INF-1", "ORPH-1", "PLN-1", "PLN-D", "PROJ-D", "PROJ-P"];

test("R43 N426 a bundle that belongs to a project is seen exactly when its project is", async () => {
  const w = await fenceWorld();
  assert.deepEqual(sees(w, V("cal")), ["BLANK-1", "INF-1"], "outside every project: neither project, nor anything in them");
  assert.deepEqual(sees(w, V("bob")), ["BLANK-1", "ESC-1", "INF-1", "PLN-1", "PROJ-P"], "an invited participant of P");
  assert.deepEqual(sees(w, V("ann")), ["BLANK-1", "ESC-1", "INF-1", "PLN-1", "PLN-D", "PROJ-D", "PROJ-P"], "owner of both");
  assert.deepEqual(sees(w, V("second")), EVERY, "an active administrator sees every project and so all in them");
  for (const v of ["admin", V("admin"), ...["admin", "member", "probe", "daemon", "ai"].map((c) => `${MACHINE_CLASS_PREFIX}${c}`)])
    assert.deepEqual(sees(w, v), EVERY, v);
  for (const v of [null, "", "junk", `${MACHINE_CLASS_PREFIX}robot`]) assert.deepEqual(sees(w, v), [], String(v));
});

test("R43 N426 the fence follows participation: joining, removal and an administrator's revocation move it at once", async () => {
  const w = await fenceWorld();
  assert.ok(!sees(w, V("cal")).includes("ESC-1"));
  w.m.projectInvite({ projectId: "PROJ-P", handle: "cal", by: "ann", viewer: V("ann") });
  assert.ok(sees(w, V("cal")).includes("ESC-1"), "an invited member sees the project's bundles (any state)");
  w.m.projectRemove({ projectId: "PROJ-P", handle: "cal", by: "ann", viewer: V("ann") });
  assert.ok(!sees(w, V("cal")).includes("ESC-1"), "removed: fenced again");
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='second'`);
  assert.deepEqual(sees(w, V("second")), ["BLANK-1", "INF-1"], "an inactive administrator is no administrator");
});

test("R43 R80 R88 R44 inSight, hiddenBundles and sight read the fence: EXISTENCE never widens a read inside a project", async () => {
  const w = await fenceWorld();
  for (const v of [V("cal"), V("bob"), V("ann"), V("second"), "admin", `${MACHINE_CLASS_PREFIX}member`, "junk"]) {
    const seen = sees(w, v);
    for (const id of EVERY) assert.equal(w.m.inSight(id, v), seen.includes(id), `${v} ${id}`);
    const h = hiddenBundles(v);
    const hidden = h ? w.rows(`SELECT bundle_id FROM bundles WHERE bundle_id IN ${h.sql} ORDER BY bundle_id`, ...h.args)
      .map((r) => r.bundle_id) : [];
    assert.deepEqual(hidden, EVERY.filter((id) => !seen.includes(id)), `${v}: the complement, exactly`);
  }
  /* cal sees discoverable D at EXISTENCE, and nothing inside it */
  assert.equal(w.m.sight("PROJ-D", V("cal")), Membership.SIGHT_EXISTENCE);
  assert.equal(w.m.sight("PLN-D", V("cal")), Membership.SIGHT_NONE);
  assert.equal(w.m.inSight("PLN-D", V("cal")), false);
});

test("R43 N426 the directory is unchanged by the fence: it lists discoverable projects, never a project's bundles", async () => {
  const w = await fenceWorld();
  const d = w.m.projectDirectory({ viewer: V("cal") });
  assert.equal(d.ok, true);
  assert.deepEqual(d.projects.map((p) => p.id), ["PROJ-D"]);
  assert.deepEqual(w.m.projectDirectory({ viewer: V("ann") }).projects, []);
});
