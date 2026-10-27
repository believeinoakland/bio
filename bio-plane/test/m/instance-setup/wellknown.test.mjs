/* R100 (T51 fix round; C11, DEC-374; K4164): the answers of `groupdomainset` and `groupidentity` carry the exact website file the
   verifier accepts for the claim, or the stated reason there is none. The file is read back through the verifier itself: it is
   planted at the domain and the check is run, never compared with a copy of the module's rule. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot } from "./fixture.mjs";
import { GROUP_WELL_KNOWN_PATH } from "../../../src/setup.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const ADDR = "https://river.example";
const DOMAIN = "river.example.org";
const world = async (env = { INSTANCE_NAME: "river-town" }) => {
  const w = await boot({ env });
  w.prov.answer = () => new Response("", { status: 404 });
  return w;
};
/* The domain publishes exactly `body` at the path the answer names, and nothing else. */
const plant = (w, wk, body = wk.body) => {
  w.prov.answer = (url) => (url === `https://${DOMAIN}${wk.path}` ? new Response(JSON.stringify(body), { status: 200 }) : new Response("", { status: 404 }));
};
const verdictAfterPlanting = async (w, wk, body) => { plant(w, wk, body); return (await w.prov.consumers[0].tick(Date.now())).groupdomain.verdict; };

test("R100 groupdomainset answers the website file the verifier accepts: its path is the one the verifier fetches and its body, planted there, verifies (control: another instance or another group is mismatched)", async () => {
  const w = await world();
  const r = await w.m.groupDomainSet({ domain: DOMAIN, by: "admin", origin: "HTTPS://River.Example/some/path" });
  assert.equal(r.ok, true);
  assert.equal(r.well_known.path, GROUP_WELL_KNOWN_PATH);
  assert.equal(w.prov.fetched[0].url, `https://${DOMAIN}${r.well_known.path}`, "the verifier fetches the path the answer names");
  assert.deepEqual(r.well_known.body, { instance: ADDR, group: "river-town" });
  assert.deepEqual(Object.keys(r.well_known).sort(), ["body", "path"]);
  assert.equal("well_known_detail" in r, false, "a file stated states no reason");
  assert.equal(await verdictAfterPlanting(w, r.well_known), "verified");
  /* the control: the same file with another instance, or another group, is not accepted */
  assert.equal(await verdictAfterPlanting(w, r.well_known, { ...r.well_known.body, instance: "https://other.example" }), "mismatched");
  assert.equal(await verdictAfterPlanting(w, r.well_known, { ...r.well_known.body, group: "other-town" }), "mismatched");
  assert.equal(await verdictAfterPlanting(w, r.well_known), "verified", "and the file as answered verifies again");
});

test("R100 groupidentity carries the same file for the current claim, and the file of the claim now current after a new one", async () => {
  const w = await world();
  assert.equal(w.m.groupIdentity().domain_claim, null, "no claim, no file");
  const first = await w.m.groupDomainSet({ domain: DOMAIN, by: "admin", origin: ADDR });
  const id = w.m.groupIdentity();
  assert.deepEqual(id.domain_claim.well_known, first.well_known);
  assert.equal("well_known_detail" in id.domain_claim, false);
  assert.equal(await verdictAfterPlanting(w, id.domain_claim.well_known), "verified");
  /* a claim made from another address is answered with that address */
  const second = await w.m.groupDomainSet({ domain: DOMAIN, by: "admin", origin: "https://river-two.example" });
  assert.deepEqual(second.well_known.body, { instance: "https://river-two.example", group: "river-town" });
  assert.deepEqual(w.m.groupIdentity().domain_claim.well_known, second.well_known);
  assert.notDeepEqual(second.well_known, first.well_known);
  /* the public projection carries no file (R10) */
  assert.equal("well_known" in w.m.groupIdentityPublic(), false);
});

test("R100 with no producing slug, or no recorded address, well_known is null and the answer states why by key (control: with both, no reason)", async () => {
  const noSlug = await world({});
  const a = await noSlug.m.groupDomainSet({ domain: DOMAIN, by: "admin", origin: ADDR });
  assert.equal(a.well_known, null);
  assert.equal(a.well_known_detail, word("instance-setup.domain.detail.no_team_name"));
  assert.equal(a.check.detail, a.well_known_detail, "the reason is the verdict's own");
  const claim = noSlug.m.groupIdentity().domain_claim;
  assert.equal(claim.well_known, null);
  assert.equal(claim.well_known_detail, word("instance-setup.domain.detail.no_team_name"));

  const noAddr = await world();
  const b = await noAddr.m.groupDomainSet({ domain: DOMAIN, by: "admin", origin: "not an origin" });
  assert.equal(b.well_known, null);
  assert.equal(b.well_known_detail, word("instance-setup.domain.detail.no_address"));
  assert.equal(b.check.detail, b.well_known_detail);
  assert.equal(noAddr.m.groupIdentity().domain_claim.well_known, null);
  assert.equal(noAddr.m.groupIdentity().domain_claim.well_known_detail, word("instance-setup.domain.detail.no_address"));
  assert.equal(noAddr.prov.fetched.length, 0, "nothing is fetched for a claim with no file to look for");

  const both = await world();
  const c = await both.m.groupDomainSet({ domain: DOMAIN, by: "admin", origin: ADDR });
  assert.notEqual(c.well_known, null);
  assert.equal("well_known_detail" in c, false);
});
