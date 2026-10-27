/* store-request R19 (STORE-REQUEST #7, B18 START; K5197): the recipes `olderInstallation`, `owed`, `lapsed`, `delivered` and `releaseNotice`, each over the real store: the state is the store's own,
   each with a control that shows the recipe is what makes it. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld, olderInstallation, WORLD_RELEASE_KEY } from "./fixtures.mjs";

const caps = { capabilities: ["contribute", "create_projects"] };

test("R19 olderInstallation: no producing team is recorded: `groupidentity` answers group null and the team's website claim has no file; a world that names its team answers both", async () => {
  const old = await olderInstallation();
  const founder = await old.signIn("admin");
  assert.equal((await founder.read("groupidentity")).group, null);
  await founder.act("groupdomainset", { body: { domain: "eastoak.example" } });
  assert.equal((await founder.read("groupidentity")).domain_claim.well_known, null, "no file: the claim names no team");
  const named = await storeWorld({ instanceName: "world-town" });
  const nf = await named.signIn("admin");
  assert.equal((await nf.read("groupidentity")).group, "world-town");
  await nf.act("groupdomainset", { body: { domain: "eastoak.example" } });
  assert.equal((await nf.read("groupidentity")).domain_claim.well_known.body.group, "world-town");
  assert.equal((await (await storeWorld()).signIn("admin").then((a) => a.read("groupidentity"))).group, "town", "control: the default world records its team");
});

test("R19 owed: the real acquire parks a large capture; the member's open captures list it as an owed fetch; with no delivery the tick leaves it owed", async () => {
  const w = await storeWorld();
  const mai = await w.signIn("mai", caps);
  assert.deepEqual((await mai.read("opencaptures")).captures, []);
  const made = await w.recipes.owed(mai);
  assert.equal(made.listed.length, 1);
  assert.equal(made.listed[0].session, made.session);
  assert.ok(made.listed[0].fetch_pending, "listed as an owed fetch");
  await w.tick(60_000);
  const again = await (await w.signIn("mai")).read("opencaptures");
  assert.equal(again.captures.length, 1, "no delivery in the world: still owed");
});

test("R19 lapsed: the store's clock moves past the session and it leaves the list; control: before the clock moved it was listed", async () => {
  const w = await storeWorld();
  const mai = await w.signIn("mai", caps);
  const made = await w.recipes.lapsed(mai);
  assert.equal(made.listed.length, 1, "it was listed");
  assert.deepEqual(made.after, [], "and the clock took it off the list");
  assert.notEqual(made.as.token, mai.token, "she is signed in again");
});

test("R19 delivered: a world made with deliver: true runs the owed fetch on a tick: the real owedFetch drops the session and the delivery filed the document under the project; control: a world with none leaves it owed; the recipe refuses a world without it", async () => {
  const w = await storeWorld({ deliver: true });
  const mai = await w.signIn("mai", caps);
  const projectId = await w.recipes.project(mai, "Budgets");
  const made = await w.recipes.delivered(mai, { project: projectId });
  assert.equal(made.listed.length, 1);
  assert.deepEqual(made.after, [], "the delivery ended the session");
  assert.ok(made.copy && made.copy.document, JSON.stringify(made.copy));
  assert.equal(made.copy.project, projectId);
  const plain = await storeWorld();
  const bo = await plain.signIn("bo", caps);
  await assert.rejects(() => plain.recipes.delivered(bo), /deliver: true/);
});

test("R19 releaseNotice: a notice signed with the world's key is stored by the daily check and an administrator reads it as ready; control: signed with another key it is not; a world without the key refuses the recipe", async () => {
  const w = await storeWorld({ releaseKeys: true });
  const made = await w.recipes.releaseNotice(await w.signIn("admin"));
  assert.equal(made.read.ready.version, "0.85.0", JSON.stringify(made.read).slice(0, 300));
  assert.equal(made.read.last_check.outcome, "found");
  const other = await storeWorld({ releaseKeys: true });
  const otherKey = `BIOKEY-RAW1.bio-release.${Buffer.from(new Uint8Array(32).map((_, i) => (i * 43 + 9) % 256)).toString("base64")}`;
  assert.notEqual(otherKey, WORLD_RELEASE_KEY);
  const refused = await other.recipes.releaseNotice(await other.signIn("admin"), { key: otherKey });
  assert.equal(refused.read.ready, null, "another key's notice is refused");
  const bare = await storeWorld();
  await assert.rejects(() => bare.recipes.releaseNotice(null), /releaseKeys: true/);
});
