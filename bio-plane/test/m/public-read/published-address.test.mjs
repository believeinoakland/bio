/* public-read R42 (T51 fix round 4; C48/N6; RC-R10): `publishedAddress({case, edition})` is the one builder of a published
   case's public address. Driven at the module's interface (`w.pr`, the instance a host holds) over a case the fixture's
   world prepares, signs and publishes by its own acts. The address must be the one the shell's route opens as the
   `published` screen at that case and edition (the shell's own parser is the oracle, not a copy of the string). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";

const CASE = "CASE-2026-4783", F = "INQ-2026-4783", DOC = "INFO-2026-4783-faq";
const roster = (roles) => roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" }));

function publishedWorld() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.head(F);
  const roles = [{ target: F, version_sha: pin }];
  w.prepare(CASE, 1, { project: proj, roles });
  assert.equal(w.signCase(CASE, 1, { project: proj, roster: roster(roles) }).ok, true);
  assert.equal(w.signFinding(F, { edges: [{ to: DOC, kind: "cites", disclosure: "serve" }] }).ok, true);
  return { w, proj, pin, roles };
}

/* what the shell's route does with an address: `/app/<screen>/<subject>`, the subject decoded once (interface-shell `parse`) */
const opens = (address) => {
  const [, app, screen, ...sub] = address.split("/");
  assert.equal(app, "app");
  return { screen, subject: decodeURIComponent(sub.join("/")) };
};

test("R42 the address of a published edition is the one the shell opens as the published screen at that case and edition", () => {
  const { w } = publishedWorld();
  const a = w.pr.publishedAddress({ case: CASE, edition: 1 });
  assert.equal(typeof a, "string");
  assert.deepEqual(opens(a), { screen: "published", subject: `${CASE}/1` });
  assert.equal(a, "/app/published/" + encodeURIComponent(`${CASE}/1`), "one spelling: the subject is one encoded part, as the screens' own links write it");
  assert.equal(w.pr.publishedAddress({ case: CASE, edition: "1" }), a, "an edition written as text names the same edition");
});

test("R42 a case or edition that is not published answers null", () => {
  const { w, proj, roles } = publishedWorld();
  w.prepare(CASE, 2, { project: proj, roles: [{ target: F, version_sha: w.head(F) }] }); // prepared, never signed or published
  assert.equal(w.pr.publishedAddress({ case: CASE, edition: 2 }), null, "an edition prepared and not published");
  assert.equal(w.pr.publishedAddress({ case: "CASE-2026-9999", edition: 1 }), null, "a case nobody published");
  for (const bad of [{}, { case: CASE }, { case: CASE, edition: 0 }, { case: CASE, edition: "x" }, { case: "", edition: 1 }, undefined])
    assert.equal(w.pr.publishedAddress(bad), null, `no case or edition named: ${JSON.stringify(bad)}`);
  assert.ok(roles.length);
});

test("R42 control: the address of edition 2 differs from edition 1's only by its edition", () => {
  const { w, proj } = publishedWorld();
  w.prepare(CASE, 2, { project: proj, roles: [{ target: F, version_sha: w.head(F) }] });
  const sealed = w.signCase(CASE, 2, { project: proj, roster: roster([{ target: F, version_sha: w.head(F) }]) });
  assert.equal(sealed.ok, true);
  const one = w.pr.publishedAddress({ case: CASE, edition: 1 }), two = w.pr.publishedAddress({ case: CASE, edition: 2 });
  assert.ok(one && two);
  assert.notEqual(one, two);
  assert.equal(two, one.replace(encodeURIComponent(`${CASE}/1`), encodeURIComponent(`${CASE}/2`)));
});
