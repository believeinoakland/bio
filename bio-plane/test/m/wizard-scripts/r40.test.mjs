/* wizard-scripts R40 (R085-33; walk-085-r5 D9): the group-setup scripts are offered, in startFrom and its doors, only to a
   viewer who holds `administer`; the carried library and registry, the administrator acts as the plane registers them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";
import { SCREEN_REGISTRY, CIVICSMITH_LIBRARY } from "../../../src/wizard-scripts/index.mjs";

/* a local op table: every act and owed op the carried registry names, so the carried library is registered whole */
const OPS = [...new Set(SCREEN_REGISTRY.flatMap((s) => [...s.acts, ...(s.owed || []).map((o) => o.op)]))];
const ADMIN_ACTS = ["groupdescriptionset", "memberadd", "membercaps", "websitekeycreate"];
const ADMIN_SCREENS = ["updates"];
const SETUP = ["Say who your group is", "Invite a member", "Update your group's Civicsmith"];
const named = (r) => r.scripts.map((s) => s.name);

function world(extra = { adminActs: ADMIN_ACTS, adminScreens: ADMIN_SCREENS }) {
  const w = seeded({ register: false });
  assert.equal(w.wz.wizardRegister({ screens: SCREEN_REGISTRY, ops: OPS, library: CIVICSMITH_LIBRARY, ...extra }).ok, true);
  return w;
}

test("R40 a plain member's startFrom omits \"Say who your group is\", \"Invite a member\" and \"Update your group's Civicsmith\"; an administrator's lists them; the plain member still sees the scripts whose acts she may take", () => {
  const w = world();
  const member = w.wz.startFrom({ viewer: V("frank") });
  const admin = w.wz.startFrom({ viewer: V("erin") });
  for (const n of SETUP) {
    assert.ok(!named(member).includes(n), `${n} is not offered to a plain member`);
    assert.ok(named(admin).includes(n), `${n} is offered to an administrator`);
  }
  for (const n of ["Get a record", "Connect your Claude account", "Your ties"]) assert.ok(named(member).includes(n), `${n} stays offered to a plain member`);
  assert.ok(named(member).length < named(admin).length);
  const ids = new Set(CIVICSMITH_LIBRARY.filter((e) => SETUP.includes(e.name)).map((e) => e.id));
  for (const d of member.doors) for (const id of d.scripts) assert.ok(!ids.has(id), "no door of a plain member names a setup script");
  assert.ok(named(member).every((n) => named(admin).includes(n)), "an administrator is offered everything a member is");
});

test("R40 a viewer who is not a member, a machine, and a missing viewer hold no `administer` and are offered no setup script", () => {
  const w = world();
  for (const viewer of ["class:ai", "member:nobody", null, "nobody"]) {
    const r = w.wz.startFrom({ viewer });
    for (const n of SETUP) assert.ok(!named(r).includes(n), `${String(viewer)}: ${n}`);
  }
});

test("R40 with no administrator acts registered nothing is withheld, and the registration reads the acts from what it is given, never a list of its own", () => {
  const w = world({});
  assert.ok(SETUP.every((n) => named(w.wz.startFrom({ viewer: V("frank") })).includes(n)));
  const v = world({ adminActs: ["groupdescriptionset"], adminScreens: [] });
  const r = named(v.wz.startFrom({ viewer: V("frank") }));
  assert.ok(!r.includes("Say who your group is") && r.includes("Invite a member") && r.includes("Update your group's Civicsmith"));
});
