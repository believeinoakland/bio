/* wizard-scripts R51 (K5046 (c)): `ADMIN_ACTS` and `ADMIN_SCREENS`, exported frozen data, and the fixture `noSuchWizard`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";
import { noSuchWizard } from "./fixtures.mjs";
import { ADMIN_ACTS, ADMIN_SCREENS, SCREEN_REGISTRY, CIVICSMITH_LIBRARY } from "../../../src/wizard-scripts/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const ACTS = ["memberadd", "membercaps", "memberset", "adminendorse", "adminremove", "expertiseconfirm", "hostingaccessset",
  "invitewithdraw", "websitekeycreate", "websitekeyset", "websitekeyrevoke", "joinlinkenable", "joinlinkset", "joinlinkreplace",
  "joinlinkoff", "courtnoticeset", "groupdescriptionset", "joindoors", "projectownerrescue", "groupkeyset", "groupkeyremove",
  "groupkeyswitch", "aikeepaway", "personexpunge", "passwordresetlink", "signerset", "groupnameset", "grouplogoset",
  "groupdomainset", "grouplanguagesset", "profilesset", "placewanted", "officesseed", "translationgrant", "translationrevert",
  "securitytools", "securitytoolcatalogue", "securitytoolevents", "securitytooladd", "securitytooltest", "securitytoolremove",
  "signeradd", "instancegroupseed", "scanmirror", "officeconfirm"];

test("R51 ADMIN_ACTS holds exactly the 45 administrator acts and ADMIN_SCREENS exactly `updates`, both frozen", () => {
  assert.equal(ACTS.length, 45);
  assert.ok(ADMIN_ACTS instanceof Set && Object.isFrozen(ADMIN_ACTS));
  assert.deepEqual([...ADMIN_ACTS], ACTS, "the members and their order");
  assert.ok(Array.isArray(ADMIN_SCREENS) && Object.isFrozen(ADMIN_SCREENS));
  assert.deepEqual([...ADMIN_SCREENS], ["updates"]);
});

/* The interface-shell pair, `bio-plane/src/interface-shell/index.mjs` (`ADMIN_ACTS`, `ADMIN_SCREENS`), is the copy this was taken
   from; interface-shell's Wave B job deletes its pair and imports these, and with it this test (K624). */
test("R51 the copy equals interface-shell's pair, until that module imports these", async () => {
  const shell = await import("../../../src/interface-shell/index.mjs");
  assert.deepEqual([...ADMIN_ACTS], [...shell.ADMIN_ACTS]);
  assert.deepEqual([...ADMIN_SCREENS], [...shell.ADMIN_SCREENS]);
});

test("R51 handed to the registration, startFrom omits a script whose first act is among ADMIN_ACTS for a plain member and lists it for an administrator", () => {
  const ops = [...new Set(SCREEN_REGISTRY.flatMap((s) => [...s.acts, ...(s.owed || []).map((o) => o.op)]))];
  const w = seeded({ register: false });
  assert.equal(w.wz.wizardRegister({ screens: SCREEN_REGISTRY, ops, library: CIVICSMITH_LIBRARY, adminActs: [...ADMIN_ACTS], adminScreens: [...ADMIN_SCREENS] }).ok, true);
  const setup = word("wizard.WIZ-4d42b0233d48913f.name");
  const named = (r) => r.scripts.map((s) => s.name);
  assert.ok(!named(w.wz.startFrom({ viewer: V("frank") })).includes(setup));
  assert.ok(named(w.wz.startFrom({ viewer: V("erin") })).includes(setup));
});

test("R51 noSuchWizard is the real NO_SUCH_WIZARD refusal of the wizard-script read for an unknown id", () => {
  const r = noSuchWizard();
  assert.equal(r.ok, false);
  assert.equal(r.reason, "NO_SUCH_WIZARD");
  assert.equal(r.code, "NO_SUCH_WIZARD");
  assert.equal(r.script, "WIZ-0000000000000000");
});
