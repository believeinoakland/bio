/* T41 (T41-5; N796, Bob K2425), at the interface: a member her sign-in serves is asked her sign-in's `standing` switch
   for a standing question's grant, as a reference's is (R32). (T48; K3101) The switches and the sign-in are
   `ai-accounts`' (its R14, R18), reached through R72's delegates; the T41 tests of those moved there. The grant ends
   when she disconnects, through R73. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD } from "./fixture.mjs";
import { ACCOUNT_CHECKS } from "../../../src/credentials/index.mjs";

const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const refusal = (code) => ({ ok: false, reason: code, code, check: ACCOUNT_CHECKS[code].check, translation: ACCOUNT_CHECKS[code].translation });

/* ann owns P (hidden) with bob joined; cy owns S alone, connected through her subscription; dee owns D (discoverable)
   alone; eve is in nothing; second an administrator; the founder claimed. */
async function projectWorld(opts) {
  const w = await world(opts).group("ann", "bob", "cy", "dee", "eve");
  w.project("P", "ann");
  assert.equal(w.join("P", "ann", "bob").ok, true);
  w.project("S", "cy");
  w.project("D", "dee", "discoverable");
  await w.signin("cy");
  return w;
}


/* ===== R25, R37, R55: the one act ===== */

/* ===== R32: a sign-in's standing switch ===== */

test("R32 R55 a member served by their sign-in is asked their sign-in's standing switch as a reference's is: off by default STANDING_SWITCH_OFF, minting nothing; on, set only by their own act, a grant is minted; another's act cannot set it", async () => {
  const w = await projectWorld();
  const before = w.snapshot();
  const off = await w.c.aiGrantMintStanding({ member: "cy", question: "what is new?" });
  assert.deepEqual([shape(off), off.member], [refusal("STANDING_SWITCH_OFF"), "cy"]);
  assert.equal(w.snapshot(), before, "nothing minted");
  assert.equal(w.c.accountUsesSet({ owner: "member:cy", switch: "standing", on: true, by: "ann" }).reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w.c.accountUsesSet({ owner: "member:cy", switch: "standing", on: true, by: "admin" }).reason, "NOT_YOUR_ACCOUNT");
  assert.equal((await w.c.aiGrantMintStanding({ member: "cy", question: "q" })).reason, "STANDING_SWITCH_OFF", "still off");
  assert.equal(w.c.accountUsesSet({ owner: "member:cy", switch: "standing", on: true, by: "cy" }).ok, true);
  const g = await w.c.aiGrantMintStanding({ member: "cy", question: "what is new?" });
  assert.equal(g.ok, true);
  assert.deepEqual([(await w.c.aiGrantAdmit({ token: g.token, op: "search" })).viewer], ["member:cy"]);
  /* negative control: switched off again, refused again */
  w.c.accountUsesSet({ owner: "member:cy", switch: "standing", on: false, by: "cy" });
  assert.equal((await w.c.aiGrantMintStanding({ member: "cy", question: "q" })).reason, "STANDING_SWITCH_OFF");
  /* a grant her sign-in served ends when she disconnects it */
  w.c.accountUsesSet({ owner: "member:cy", switch: "standing", on: true, by: "cy" });
  const g2 = await w.c.aiGrantMintStanding({ member: "cy", question: "q" });
  w.c.subscriptionDisconnect({ member: "cy", by: "cy" });
  assert.equal((await w.c.aiGrantHeld({ token: g2.token })).reason, "GRANT_NOT_HELD");
});

/* ===== R54, R56, R57, R58: words read by key ===== */

/* ===== R60: an account's uses and keep-aways ===== */

/* ===== R61: an account's changes ===== */
