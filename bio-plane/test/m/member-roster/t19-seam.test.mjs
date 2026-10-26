/* T19 layer 2, the seam with `credentials` (K637): R30 `sessionRights` and R31 `registerClaimed` with what it decides
   (R23 `isAdministrator`, R29 `activeAdmins`). (R43's project fence, which R80 `inSight`, R88 `hiddenBundles` and R44
   `sight` read, is `membership`'s and stays with its tests.) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { Members } from "../../../src/member-roster/index.mjs";
import { MEMBER_ROSTER_ROWS } from "../../../src/member-roster/checks.mjs";
const { MEMBERSHIP_CHECKS } = MEMBER_ROSTER_ROWS;
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const ALL = [...Members.CAPABILITIES].sort();
const census = (w) => JSON.stringify(["members", "member_expertise", "admin_votes"]
  .map((t) => w.rows(`SELECT * FROM ${t}`)));

/* ---- R30 (was R92) ---- */

test("R30 sessionRights(role): the founder holds every capability, administer and rootOfTrust", async () => {
  const w = await world().group();
  const r = w.m.sessionRights(Members.ROOT_ADMIN);
  assert.deepEqual([...r.capabilities].sort(), ALL);
  assert.equal(r.administer, true);
  assert.equal(r.rootOfTrust, true);
  assert.equal(r.member, Members.ROOT_ADMIN);
});

test("R30 an active administrator holds every capability and administer whatever their row stores; never rootOfTrust", async () => {
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

test("R30 an active member holds their stored set, resolved at the call, so a change shows on the next read", async () => {
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

test("R30 a missing or inactive member, or an unrecognised role, holds none; it writes nothing and never throws", async () => {
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
  const broken = new Members({ sql: { exec() { throw new Error("disk"); } } });
  assert.deepEqual(broken.sessionRights("member:ann").capabilities, []);
  assert.equal(broken.sessionRights("member:ann").administer, false);
  assert.equal(census(w), before, "nothing written");
});

test("R30 the capabilities answered are a copy: changing one answer changes no later answer", async () => {
  const w = await world().group();
  w.m.sessionRights("admin").capabilities.push("administer");
  assert.deepEqual([...w.m.sessionRights("admin").capabilities].sort(), ALL);
});

/* ---- R31 (was R94), with R23 and R29 ---- */

test("R31 R23 R29 the founder is an administrator, first in the list, exactly when the registered fact answers true", async () => {
  const w = world({ omit: ["claimed"] });
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

test("R31 a fact that throws reads as not claimed, and nothing it is handed makes membership throw", async () => {
  const w = world({ omit: ["claimed"] });
  await w.enrol("second", "admin", `${MACHINE_CLASS_PREFIX}admin`);
  w.m.registerClaimed("credentials", () => { throw new Error("no store"); });
  assert.doesNotThrow(() => w.m.isAdministrator("admin"));
  assert.equal(w.m.isAdministrator("admin"), false);
  assert.deepEqual(w.m.activeAdmins(), ["second"]);
});

test("R31 with nothing registered and no founder credential, the instance reads as not claimed", async () => {
  const w = world({ omit: ["claimed"] });
  await w.enrol("second", "admin", `${MACHINE_CLASS_PREFIX}admin`);
  assert.equal(w.m.isAdministrator("admin"), false);
  assert.deepEqual(w.m.activeAdmins(), ["second"]);
});

test("R31 R26 one registration, whoever makes it: a second is LISTENER_DECLARED naming the holder, a malformed one LISTENER_MALFORMED", async () => {
  const w = world({ omit: ["claimed"] });
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

test("R31 it writes nothing", async () => {
  const w = await world({ omit: ["claimed"] }).group("ann");
  const before = census(w);
  w.m.registerClaimed("credentials", () => true);
  w.m.registerClaimed("credentials", () => true);
  w.m.isAdministrator("admin");
  w.m.activeAdmins();
  assert.equal(census(w), before);
});
