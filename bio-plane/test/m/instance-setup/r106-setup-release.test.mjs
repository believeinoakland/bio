/* instance-setup R106 (fix round 10, K5182; screens-settings R73, R81; amends R89): `updateNotice` also answers `setup`,
   the release the copy was set up with: the oldest release `running_releases` records (R88's first sighting), else null.
   Each copy is this module's real start over a booted world, never a stub. Each test names the requirement it checks. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, providers } from "./fixture.mjs";

const T0 = Date.parse("2026-10-14T20:00:00Z");
const DAY = 86_400_000;
const ADMIN = "admin";

const copy = (opts = {}) => boot({ prov: providers({ admins: [ADMIN] }), now: () => T0, ...opts });

test("R106 a copy set up on one release, then running a second, answers the first as setup and the second as running", async () => {
  const first = await copy({ env: { VERSION: "0.84.0" } });
  const second = await copy({ st: first.st, env: { VERSION: "0.85.0" }, now: () => T0 + DAY });
  const r = second.m.updateNotice({ viewer: ADMIN });
  assert.equal(r.ok, true);
  assert.equal(r.running.version, "0.85.0");
  assert.deepEqual(r.setup, { version: "0.84.0", installed_at: "2026-10-14T20:00:00.000Z" });
});

test("R106 control: a copy on its first release answers that same release as both setup and running, with the same instant", async () => {
  const w = await copy({ env: { VERSION: "0.84.0" } });
  const r = w.m.updateNotice({ viewer: ADMIN });
  assert.deepEqual(r.setup, { version: "0.84.0", installed_at: "2026-10-14T20:00:00.000Z" });
  assert.equal(r.setup.version, r.running.version);
  assert.equal(r.setup.installed_at, r.running.installed_at);
});

test("R106 control: an empty running_releases table answers setup: null, and the rest of the answer is as R89 states it", async () => {
  const w = await copy({ env: { VERSION: "0.84.0" } });
  w.st.db.exec("DELETE FROM running_releases");
  const r = w.m.updateNotice({ viewer: ADMIN });
  assert.equal(r.setup, null);
  assert.equal(r.running.version, "0.84.0");
  assert.equal(r.running.installed_at, null);
});
