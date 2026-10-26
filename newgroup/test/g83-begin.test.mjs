/* Fix round 7, G83 (K4746, K4747, K4752): R83 the team's room is created near the founder. `POST /begin` reads the founder's request's
 * `cf` (set on the Request the way workerd sets it), `installer-steps.locationHintFor` answers the hint, the install's cookie carries it
 * to `/callback`, and the install's plane upload carries `STORE_LOCATION` (`installer-steps` R41, R42). Driven through the routes
 * against the stateful fake account of `fixture.mjs`; `cf` exists only at the edge, so what Cloudflare does with the hint is the
 * platform's (the first real install shows it in `op=selftest`). Red until `installer-steps` R41 and R42 are merged. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.mjs";
import { RELEASE_VERSION } from "../src/release.mjs";
import { run, release, armWith, restoreSigners, SIGNER, bump, heldCopy, bindingOf, cookieOf, ORIGIN } from "./fixture.mjs";

after(restoreSigners);

/* `POST /begin` as the founder's browser sends it through the edge: the Request carries `cf` as workerd sets it (absent when none). */
async function beginAt(cf, slug, mode = "install", extra = {}) {
  const request = new Request(ORIGIN + "/begin", { method: "POST", body: JSON.stringify({ slug, mode, ...extra }) });
  if (cf !== undefined) Object.defineProperty(request, "cf", { value: cf, enumerable: true });
  const r = await worker.fetch(request);
  const j = await r.json();
  return { j, cookie: cookieOf(r), state: j.ok ? new URL(j.authorize).searchParams.get("state") : null };
}
const installAt = async (cf, slug, extra = {}) => {
  const b = await beginAt(cf, slug, "install", extra);
  assert.equal(b.j.ok, true, "/begin answers");
  return run({ slug, cookie: b.cookie, state: b.state });
};
const placed = (w) => w.planePuts.map((p) => bindingOf(p, "STORE_LOCATION"));

test("R83 a founder in western North America installs with STORE_LOCATION=wnam, one in Frankfurt with weur: the plane's creating upload carries the hint", async () => {
  const west = await installAt({ continent: "NA", country: "US", longitude: "-122.4" }, "g83-west");
  assert.equal(west.page.failed, null, "the install completes");
  assert.ok(west.page.done, "and says so");
  assert.deepEqual(placed(west)[0], { type: "plain_text", name: "STORE_LOCATION", text: "wnam" }, "the creating upload names the room's place");
  const fra = await installAt({ continent: "EU", country: "DE", longitude: "8.68" }, "g83-fra");
  assert.equal(fra.page.failed, null);
  assert.equal(placed(fra)[0].text, "weur");
  /* The edge hands longitude as a string (workerd) and the rule reads it as a number: a number works as well. */
  const east = await installAt({ continent: "NA", longitude: -74.0 }, "g83-east");
  assert.equal(placed(east)[0].text, "enam");
  /* Control: one hint, one binding, and the rest of the install is the install it was (the same steps in the same order). */
  assert.equal(west.planePuts[0].meta.bindings.filter((b) => b.name === "STORE_LOCATION").length, 1);
  const none = await installAt(undefined, "g83-west-none");
  assert.deepEqual(west.page.steps, none.page.steps, "the same steps");
});

test("R83 no cf, or a cf that gives no hint (a continent with none, a missing or non-numeric longitude), installs exactly as today: no STORE_LOCATION anywhere and the install completes", async () => {
  const cases = { "no-cf": undefined, empty: {}, antarctica: { continent: "AN", longitude: "0" }, "no-longitude": { continent: "NA" },
    "bad-longitude": { continent: "EU", longitude: "far" }, "not-an-object": "NA" };
  for (const [name, cf] of Object.entries(cases)) {
    const w = await installAt(cf, `g83-${name}`);
    assert.equal(w.page.failed, null, `${name}: the install completes`);
    assert.ok(w.page.done, `${name}: and says so`);
    assert.ok(w.planePuts.length >= 1);
    for (const p of w.planePuts) assert.equal(bindingOf(p, "STORE_LOCATION"), null, `${name}: no binding in any plane upload`);
  }
  /* Control: the same founder with a cf is placed (the cases above are not the install never placing anyone). */
  const placedOne = await installAt({ continent: "SA", longitude: "-46.6" }, "g83-sam");
  assert.equal(placed(placedOne)[0].text, "sam");
});

test("R83 an update restates the held STORE_LOCATION and never moves it: a founder's cf is not read for an update, a script that holds none gets none", async () => {
  armWith(SIGNER.line);
  const NEXT = bump(RELEASE_VERSION);
  const rel = await release({ version: NEXT });
  const copy = (slug, held) => {
    const c = heldCopy({ slug, version: "0.1.0", members: [] });
    return { slug, mode: "update", rel, ...c, pre: { [slug]: [...c.pre[slug], ...(held ? [{ type: "plain_text", name: "STORE_LOCATION", text: held }] : [])] } };
  };
  /* The /begin that starts the update comes from a browser in Frankfurt: the room is in western North America and stays there. */
  const slugA = "g83-upd-held";
  const a = await beginAt({ continent: "EU", longitude: "8.68" }, slugA, "update", { version: NEXT });
  assert.equal(a.j.ok, true);
  const held = await run({ ...copy(slugA, "wnam"), cookie: a.cookie, state: a.state });
  assert.equal(held.page.failed, null, "the update completes");
  assert.ok(held.planePuts.length >= 1);
  assert.deepEqual(bindingOf(held.planePuts.at(-1), "STORE_LOCATION"), { type: "plain_text", name: "STORE_LOCATION", text: "wnam" }, "the held value, restated unchanged");
  /* Control: a script that holds none is given none (an update never invents a place), whatever the founder's cf. */
  const slugB = "g83-upd-none";
  const b = await beginAt({ continent: "NA", longitude: "-122.4" }, slugB, "update", { version: NEXT });
  const bare = await run({ ...copy(slugB, null), cookie: b.cookie, state: b.state });
  assert.equal(bare.page.failed, null);
  for (const p of bare.planePuts) assert.equal(bindingOf(p, "STORE_LOCATION"), null, "no invented binding");
  restoreSigners();
});
