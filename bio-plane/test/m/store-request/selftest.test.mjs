/* store-request R17 (STORE-REQUEST #6, B15 (4); SCREENS-SETTINGS #20 J37 (1)): `selftest` through the world's door is the owner's answer for the storage the world binds. The default world binds
   the captures bucket alone, as a copy set up without the optional storage's pair does; a test unbinds or pairs it through `world.env`. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "./fixtures.mjs";

const selftest = async (w, f) => (await w.door({ url: "/api/?op=selftest" }, f));

test("R17: selftest through the door: the captures bucket unbound answers ok and says the optional storage is off; both bound answers ok; one without the other is the owner's refusal", async () => {
  const none = await storeWorld(), f = await none.signIn("admin");
  none.env.CAPTURES = undefined;
  const off = await selftest(none, f);
  assert.equal(off.status, 200, JSON.stringify(off.json).slice(0, 300));
  assert.equal(off.json.ok, true);
  assert.equal(off.json.r2Configured, false, "the optional storage is said not set up");
  const both = await storeWorld(), fb = await both.signIn("admin");
  both.env.PUBLISHED = both.env.CAPTURES;
  const on = await selftest(both, fb);
  assert.equal(on.status, 200, JSON.stringify(on.json).slice(0, 300));
  assert.equal(on.json.r2Configured, true);
  const half = await storeWorld(), fh = await half.signIn("admin");
  const refused = await selftest(half, fh);
  assert.equal(refused.status, 500);
  assert.equal(refused.json.ok, false);
  assert.match(refused.json.r2, /one bucket bound without the other/, "the owner's own refusal, its words in `r2`");
  await assert.rejects(fh.read("selftest"), /selftest was refused/, "an act through the world throws, naming the op");
});

test("R17: selftest is a read of the founder and an administrator's session, and the published recipe leaves the pair bound", async () => {
  const w = await storeWorld();
  const ada = await w.signIn("ada", { admin: true });
  w.env.PUBLISHED = w.env.CAPTURES;
  assert.equal((await ada.read("selftest")).ok, true);
  const owner = await w.signIn("owner", { capabilities: ["contribute", "create_projects", "publish"] });
  const projectId = await w.recipes.project(owner, "Published and self-tested");
  const found = await w.recipes.finding(owner, projectId);
  delete w.env.PUBLISHED;
  await w.recipes.published(owner, found);
  assert.ok(w.env.PUBLISHED, "publishing binds the published store as an installation that publishes has it");
  assert.equal((await ada.read("selftest")).r2Configured, true);
});
