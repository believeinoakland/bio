/* plane R2 over F16 (K1881, K2038; capture R73, acquisition R42, capture-sources R55, R65): the group's own hosts, built
   by the composition root from the origin the administrator's session reached when the group's domain was claimed
   (instance-setup R7), and handed to capture (for acquisition) and to capture-sources' credentials. Driven on the
   Durable Object class, constructed twice on one storage: the claim made on the first, read at the second. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { store } from "./fixture.mjs";
import { ownHostsOf } from "../../../src/plane/wiring.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { credentialsOf as captureCredentialsOf } from "../../../src/capture-sources/credentials.mjs";

const PLANE_AT = "https://bio-oak.acct.workers.dev";
const claim = (address) => ({ domain_claim: { domain: "oakwatch.example.org", instance_address: address } });

test("R2 (F16, K2038): ownHostsOf answers the host the group's Civicsmith was reached at and, for a workers.dev name, the account's suffix that holds every fleet member; never the claimed domain; nothing when nothing is recorded", () => {
  assert.deepEqual(ownHostsOf(claim(PLANE_AT)), ["bio-oak.acct.workers.dev", ".acct.workers.dev"]);
  assert.deepEqual(ownHostsOf(claim("https://Civic.Example.NET:8443")), ["civic.example.net"], "a custom host: itself only, lower-cased, no port");
  assert.deepEqual(ownHostsOf(claim("https://acct.workers.dev")), ["acct.workers.dev"], "no subdomain to stand for the fleet");
  for (const nothing of [null, {}, { domain_claim: null }, claim(null), claim(""), claim("not a url"), claim("ftp://x.example.org")])
    assert.deepEqual(ownHostsOf(nothing), [], JSON.stringify(nothing));
});

async function claimed(address) {
  const db = new DatabaseSync(":memory:");
  const first = await store({ db });
  if (address)
    first.ctx.storage.sql.exec(`INSERT INTO group_identity_history (field, value, set_at, set_by, instance_address)
                                VALUES ('domain', 'oakwatch.example.org', 't', 'member:ada', ?)`, address);
  /* an evidence bucket bound, so an acquisition reaches its own-host check (it is never written: nothing is fetched) */
  const CAPTURES = { get: async () => null, head: async () => null, put: async () => ({}), delete: async () => {} };
  return store({ db, env: { CAPTURE_CREDENTIALS_KEY: "k".repeat(64), CAPTURES } });
}

test("R2 (F16, K2038; capture R73, acquisition R42, capture-sources R55): a store whose claim records where it was reached hands capture and capture-sources those hosts, so a credential for a fleet member's host and an acquisition of the plane's own address are refused, and the group's own website is not", async () => {
  const x = await claimed(PLANE_AT);
  assert.deepEqual([...captureOf(x.ctx).ownHosts], ["bio-oak.acct.workers.dev", ".acct.workers.dev"], "capture holds the list (R73)");
  x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                          VALUES ('ann', 'Cover ann', 'h_ann', 'member', 'active', '["contribute"]', 't', 't')`);
  const supply = (host) => captureCredentialsOf(x.ctx).credentialSupply({ kind: "other", host, secret: "s", scope: "member", by: "ann" });
  const own = await supply("pdf-worker.acct.workers.dev");
  assert.equal(own.reason ?? own.code, "CAPTURE_CREDENTIAL_OWN_HOST", JSON.stringify(own).slice(0, 300));
  const site = await supply("oakwatch.example.org");
  assert.notEqual(site.reason ?? site.code, "CAPTURE_CREDENTIAL_OWN_HOST", "the claimed domain is the group's website, not its Civicsmith");
  const real = globalThis.fetch, fetched = [];
  globalThis.fetch = async (u) => { fetched.push(String(u instanceof Request ? u.url : u)); return new Response("x"); };
  try {
    const a = await captureOf(x.ctx).acquire({ locator: `${PLANE_AT}/api/?op=bootstrap` }, { cls: "admin", storeName: "bio", member: false });
    assert.match(JSON.stringify(a), /OWN_HOST_REFUSED/, JSON.stringify(a).slice(0, 300));
  } finally { globalThis.fetch = real; }
  assert.deepEqual(fetched, [], "nothing was fetched");
});

test("R2 negative control (F16 low, capture-sources R65): a store with no claim recorded holds no own hosts, so nothing is refused on that ground", async () => {
  const x = await claimed(null);
  assert.deepEqual([...captureOf(x.ctx).ownHosts], []);
  x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                          VALUES ('ann', 'Cover ann', 'h_ann', 'member', 'active', '["contribute"]', 't', 't')`);
  const r = await captureCredentialsOf(x.ctx).credentialSupply({ kind: "other", host: "pdf-worker.acct.workers.dev", secret: "s", scope: "member", by: "ann" });
  assert.notEqual(r.reason ?? r.code, "CAPTURE_CREDENTIAL_OWN_HOST");
});

test("R5 (K2042; acquisition R43): the route map carries `coarchiveset` and `coarchivestate` on acquisition's one instance: on by default, set by an administrator, refused to anyone else, as acquisition answers called directly", async () => {
  const { acquisitionOf } = await import("../../../src/acquisition/index.mjs");
  const x = await store();
  x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                          VALUES ('ada', 'Cover ada', 'h_ada', 'admin', 'active', '["contribute"]', 't', 't'),
                                 ('ann', 'Cover ann', 'h_ann', 'member', 'active', '["contribute"]', 't', 't')`);
  assert.deepEqual(await x.call("/coarchivestate"), { on: true, set_by: null, set_at: null });
  const refused = await x.call("/coarchiveset?by=member:ann", { on: false });
  assert.equal(refused.ok, false, "a member who is not an administrator is refused");
  const set = await x.call("/coarchiveset?by=member:ada", { on: false });
  assert.deepEqual([set.ok, set.on, set.set_by], [true, false, "member:ada"]);
  assert.deepEqual(await x.call("/coarchivestate"), JSON.parse(JSON.stringify(acquisitionOf(x.ctx).coArchiveState())));
  assert.equal((await x.call("/coarchivestate")).on, false);
  const map = Object.keys(x.routes("/coarchivestate"));
  assert.ok(map.indexOf("coarchivestate") < map.indexOf("acquire"), "at acquisition's place, before capture's map");
});
