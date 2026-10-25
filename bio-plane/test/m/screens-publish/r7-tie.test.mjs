/* screens-publish, fix round 7, G62 (B46): once the member has attested the ties and the edition is prepared, the ceremony's
 * pre-flight carries `tieAttested: true` (as `caseratify` will), so the signing check is reached and the publishing time offered;
 * before the attestation it does not, and the not-reached sentence stands. The fake plane answers as case-authoring does: with no
 * `tieAttested` the signing check is not reached (`publish_at: null`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PUBLISH_AT_NOT_REACHED_SENTENCE } from "../../../src/case-authoring/index.mjs";
import { open, main, drew, last, press, tick, ok, PREFLIGHT, P, DR } from "./fixtures.mjs";

const PATH = `/app/ceremony/${P}/${DR}`;
const answer = (req) => {
  const pf = PREFLIGHT();
  const reached = !!(req.body && req.body.tieAttested === true);
  pf.steps[7] = reached ? { signer: "dev", open_requests: [], ratification: { reached: true, refusals: [] }, publish_at: { offered: true, zone: "America/Los_Angeles" } }
    : { signer: "dev", open_requests: [], ratification: { reached: false, why: "TIE_ATTESTATION_MISSING" }, publish_at: null, publish_at_stated: PUBLISH_AT_NOT_REACHED_SENTENCE };
  return ok(pf);
};

test("R50 G62 the pre-flight carries tieAttested once the edition is prepared and not before; the Sign step then offers the time in the team's zone", async () => {
  const p = await open(PATH, { plane: { publishpreflight: answer } });
  assert.equal(last(p, "publishpreflight").body.tieAttested, undefined, "before the attestation: not sent");
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: "because" });
  assert.equal(last(p, "publish").body.tieAttested, true);
  assert.equal(last(p, "publishpreflight").body.tieAttested, true, "the pre-flight after preparing carries it");
  assert.deepEqual(Object.keys(last(p, "publishpreflight").body).sort(), ["draft", "project", "tieAttested"], "R50: nothing else added");
  assert.equal(main(p).querySelector("[data-publish-at-none]"), null, "the check is reached");
  assert.ok(p.doc.getElementById("ce-date") && drew(p, "screen.ceremony.when.help", { zone: "America/Los_Angeles" }));
});

test("R50 G62 before the ties are attested the Sign step is not offered (control); \"Check again\" after preparing still carries tieAttested", async () => {
  const p = await open(PATH, { plane: { publishpreflight: answer } });
  assert.equal(p.doc.getElementById("ce-date"), null);
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: "because" });
  await press(p, "publishpreflight");
  assert.equal(last(p, "publishpreflight").body.tieAttested, true);
});
