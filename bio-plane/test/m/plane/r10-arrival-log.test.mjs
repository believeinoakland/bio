/* plane R24 (d) (fix round 10, G5; K5050; R-LOG): THE WORKER LOGS EACH `captureupload` ARRIVAL. Four uploads in a walk were never answered and the Worker saw no request longer than 43 s, so they never reached it:
   the environment's route. For the redeploy (K4428) the Worker's entry states, for each request whose op is `captureupload`, one structured line with the declared size, the instant it arrived and Cloudflare's `cf-ray`,
   written before the first await so it exists even when the request is never answered, and holding no secret (no credential, no address, no statement, no name). Driven through the plane's own default export. */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import "./fixture.mjs";   /* answers `cloudflare:workers` for the import below */

const entry = await import("../../../src/plane/index.mjs");
const SECRET = "tok-r10-secret-0123456789abcdef", STATEMENT = "the clerk's private statement", NAME = "private-minutes.txt";
const never = new Promise(() => {});
/* a namespace whose object never answers: the door's work parks on its first await, so what was logged was logged before it */
const env = { STORE: { idFromName: (n) => n, get: () => ({ fetch: () => never }) }, ADMIN_TOKEN: SECRET, INSTANCE_NAME: "town", VERSION: "t" };
const upload = (extra = {}) => new Request(`http://plane/api?op=captureupload&statement=${encodeURIComponent(STATEMENT)}&name=${NAME}&type=text%2Fplain`,
  { method: "POST", headers: { authorization: `Bearer ${SECRET}`, "content-type": "application/octet-stream", "content-length": "4096", "cf-ray": "8f0a1b2c3d4e5f60-SJC", ...extra }, body: "x".repeat(4096) });
const lines = (spy) => spy.mock.calls.map((c) => c.arguments.map(String).join(" ")).filter((l) => l.includes("captureupload_arrival"));

test("R24 d R-LOG: a captureupload arrival is logged at once with its size, its arrival instant and its cf-ray, before the door has awaited anything, and holds no secret", async () => {
  const spy = mock.method(console, "log", () => {});
  try {
    const before = Date.now();
    const parked = entry.default.fetch(upload(), env, { waitUntil() {} });   /* not awaited: the line must already be there */
    parked.catch(() => {});
    const seen = lines(spy);
    assert.equal(seen.length, 1, "one line, written synchronously, before the slow await");
    const line = JSON.parse(seen[0]);
    assert.equal(line.event, "plane.captureupload_arrival");
    assert.equal(line.size, 4096, "the declared size");
    assert.equal(line.cf_ray, "8f0a1b2c3d4e5f60-SJC");
    const at = Date.parse(line.arrived_at);
    assert.ok(Number.isFinite(at) && at >= before - 1 && at <= Date.now() + 1, `the arrival instant ${line.arrived_at}`);
    for (const secret of [SECRET, STATEMENT, encodeURIComponent(STATEMENT), NAME, "authorization", "bearer"]) assert.equal(seen[0].toLowerCase().includes(secret.toLowerCase()), false, `the line holds ${secret}`);
    assert.deepEqual(Object.keys(line).sort(), ["arrived_at", "cf_ray", "event", "size"], "the fields and no other");
  } finally { spy.mock.restore(); }
});

test("R24 d R-LOG: no content-length or no cf-ray states null, never a made-up figure; every arrival gets its line; any other op gets none", async () => {
  const spy = mock.method(console, "log", () => {});
  try {
    const bare = new Request("http://plane/api?op=captureupload", { method: "POST", body: "x" });
    entry.default.fetch(bare, env, { waitUntil() {} }).catch(() => {});
    entry.default.fetch(upload(), env, { waitUntil() {} }).catch(() => {});
    entry.default.fetch(new Request("http://plane/api?op=whoami", { headers: { authorization: `Bearer ${SECRET}` } }), env, { waitUntil() {} }).catch(() => {});
    entry.default.fetch(new Request("http://plane/version"), env, { waitUntil() {} }).catch(() => {});
    const seen = lines(spy).map((l) => JSON.parse(l));
    assert.equal(seen.length, 2, "two uploads, two lines; whoami and version none");
    assert.deepEqual([seen[0].size, seen[0].cf_ray], [null, null]);
    assert.equal(seen[1].size, 4096);
  } finally { spy.mock.restore(); }
});
