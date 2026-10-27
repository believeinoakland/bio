/* review: the copy's zone (R35) reads the team's own time zone (local-facts R21, its path `@team/time_zone`), so a team with
   no place profile installed has its days local (T51 D-B1). Driven through local-facts' real code, over its own fixture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, P, V, SECRET } from "./fixture.mjs";
import { world as localFactsWorld } from "../local-facts/fixture.mjs";
import { TEAM_ZONE_PATH } from "../../../src/local-facts/index.mjs";

const END = "2026-09-29T07:59:59.000Z";
const SAY = { how: "the team's administrator chose it", source: "stated by the team's administrator" };

/* a local-facts instance with no place profile installed, and (when given) the team's zone stated in it */
const teamWorld = (zone) => {
  const lf = localFactsWorld({ profiles: [] });
  if (zone) lf.act(TEAM_ZONE_PATH, "correct", { value: zone, ...SAY });
  return lf;
};
const withGrant = (w, until) => {
  const d = w.r.act({ act: "draft", author: "ann", project: P, statement: "S" });
  w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "R1", secretSha: SECRET(1), ...(until ? { until } : {}) });
  return d;
};

test("R35: a team with no place profile that stated its zone answers that zone at the top level and in each grant part", () => {
  const lf = teamWorld("America/Los_Angeles");
  const w = standard({ localFacts: lf.lf });
  const plain = w.r.act({ act: "draft", author: "ann", project: P, statement: "S" });
  const top = w.r.copy({ draft: plain.draftId, viewer: V("ann") });
  assert.deepEqual([top.ok, top.zone, top.grants], [true, "America/Los_Angeles", []]);
  const d = withGrant(w, END);
  const m = w.r.copy({ draft: d.draftId, viewer: V("ann") });
  assert.deepEqual([m.zone, ...m.grants.map((g) => [g.until, g.zone])], ["America/Los_Angeles", [END, "America/Los_Angeles"]]);
  const rc = w.r.copy({ secretSha: SECRET(1), bySecret: true });
  assert.equal(rc.grant.zone, "America/Los_Angeles");
  /* the zone is read, nothing is written */
  const before = w.snapshot();
  w.r.copy({ draft: d.draftId, viewer: V("ann") });
  assert.deepEqual(w.snapshot(), before);
});

test("R35: a team that stated its zone governs it over the copy's zone at the recipient's door too, with an until", () => {
  const w = standard({ localFacts: teamWorld("America/Chicago").lf });
  const d = withGrant(w, END);
  const rc = w.r.copy({ secretSha: SECRET(1), bySecret: true });
  assert.deepEqual([rc.grant.until, rc.grant.zone], [END, "America/Chicago"]);
});

test("R35: control: nothing stated and no profile installed answers a null zone, never UTC, at the top level and in each grant part", () => {
  const w = standard({ localFacts: teamWorld(null).lf });
  const plain = w.r.act({ act: "draft", author: "ann", project: P, statement: "S" });
  const top = w.r.copy({ draft: plain.draftId, viewer: V("ann") });
  assert.equal("zone" in top, true);
  assert.equal(top.zone, null);
  const d = withGrant(w, END);
  const m = w.r.copy({ draft: d.draftId, viewer: V("ann") });
  assert.deepEqual([m.zone, ...m.grants.map((g) => [g.until, g.zone])], [null, [END, null]]);
  assert.equal(w.r.copy({ secretSha: SECRET(1), bySecret: true }).grant.zone, null);
});
