/* control-plane R17, R29 (fix round 10; K5157; WALK-FINAL-11 L266, diag2-11 §1, case-check R1): the walker's case through the real door. The project's owner prepares a case edition with the
   ceremony's `publish`, then asks `publishcheck` for the same case: the check is held. Before the fix the door stamped `publishcheck`'s `author` with the positional identity
   (`member:<id>`), the form the declaration lists, where `op=publish` and `publishpreflight` stamp the bare member id case-authoring asks `isProjectOwner` of: the owner was
   refused NOT_THE_PROJECT_OWNER by her own check. Run against the Miniflare plane (the seam kit), the stamp the one the door makes. */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { PARTS } from "../../../src/screens-publish/parts.mjs";
import { makeKit, BIAS } from "./r8-kit.mjs";

const kit = makeKit({ tag: "r10pubchk" });
after(() => kit.mf.dispose());
const R = kit.R;

test("R17, R29 (case-check R1): the project's owner asks `publishcheck` for the case she prepared and is not refused NOT_THE_PROJECT_OWNER: the check is held (control: the same call by a member who owns no project is refused as the pre-flight refuses her)", { timeout: 900000 }, async () => {
  const e = await kit.preparedEdition("r10pubchk-owner", "r10pubchk", { vouch: true, prepare: false });
  /* her signing key, registered as the ceremony's Sign step asks (otherwise the check is held false for NO_ATTESTING_KEY, a blocker the owner test comes before) */
  const key = await kit.newKey();
  const reg = R(await e.cs.call("signerregisterown", { body: { keyB64: key.keyB64 } }));
  assert.equal(reg.ok, true, JSON.stringify(reg).slice(0, 300));
  const copy = R(await e.cs.call("reviewcopy", { query: { draft: e.draft } }));
  const body = Object.assign({}, PARTS.caseArgs(copy, e.draft), { biasAcknowledgement: BIAS, tieAttested: true });
  const pre = await kit.post(e.auth, "publishpreflight", body);
  const check = await kit.post(e.auth, "publishcheck", body);
  assert.notEqual(R(check.body).reason, "NOT_THE_PROJECT_OWNER", kit.gateLine(check));
  assert.equal(R(check.body).reason, R(pre.body).reason, `the check refuses or admits as the pre-flight does: ${kit.gateLine(check)} / ${kit.gateLine(pre)}`);
  assert.equal(R(check.body).ok, true, kit.gateLine(check));
  assert.equal(R(check.body).held, true, kit.gateLine(check));
  /* control: a member who owns no project of this case is refused by the owner test, the pre-flight's answer */
  const other = await kit.person("r10pubchk-other", "member", ["contribute", "publish"]);
  const refused = await kit.post(other, "publishcheck", body);
  const refusedPre = await kit.post(other, "publishpreflight", body);
  assert.equal(R(refused.body).held, false, kit.gateLine(refused));
  assert.equal(R(refused.body).reason, R(refusedPre.body).first?.reason, `the member who sees no such project is refused as the pre-flight refuses her: ${kit.gateLine(refused)} / ${kit.gateLine(refusedPre)}`);
});
