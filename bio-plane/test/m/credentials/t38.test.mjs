/* T38 (T38-5; N785, K2200), at the interface: the ask grant mints for a member her own sign-in serves (R27), and (T41;
   N796, Bob K2425) her standing questions are governed by her sign-in's own `standing` switch, off by default (R32).
   (T48; K3101) The sign-in, its switches and the cascade are `ai-accounts`' (its R7, R14, R18, R19), reached here through
   R72's delegates; its T38 tests moved there with them. The grant ends when she disconnects through R73. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD } from "./fixture.mjs";
import { ACCOUNT_CHECKS } from "../../../src/credentials/index.mjs";

const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const refusal = (code) => ({ ok: false, reason: code, code, check: ACCOUNT_CHECKS[code].check, translation: ACCOUNT_CHECKS[code].translation });

test("R27 R32 R73 a member served by their own sign-in is granted an ask (no notice asked, the group key on or off); refused NO_ACCOUNT once disconnected with no other account; (T41; N796) their standing questions governed by their sign-in's own standing switch, off by default, and its grant ended when the sign-in is disconnected", async () => {
  const w = await world().group("ann", "bob");
  await w.signin("ann");
  const s = (await w.c.login({ handle: "ann", password: PASSWORD("ann") })).token;
  const mint = () => w.c.aiGrantMint({ member: "ann", by: "ann", session: s });
  const g = await mint();
  assert.deepEqual(Object.keys(g).sort(), ["expires", "ok", "token"]);
  assert.equal((await w.c.aiGrantAdmit({ token: g.token, op: "search" })).viewer, "member:ann");
  await w.c.groupKeySet({ key: "sk-group", by: "admin" });
  w.c.groupKeySwitch({ on: true, by: "admin" });
  w.c.accountUsesSet({ owner: "group", switch: "standing", on: true, by: "admin" });
  assert.equal((await mint()).ok, true, "the group key's notice is not asked: the sign-in serves her");
  /* R22's refusals still come first */
  assert.deepEqual(shape(await w.c.aiGrantMint({ member: "ann", by: "bob", session: s })), refusal("NOT_YOUR_ACCOUNT"));
  /* R32 (T41; N796): her sign-in's own standing switch governs, off by default (the group key's on does not) */
  const before = w.snapshot();
  const st = await w.c.aiGrantMintStanding({ member: "ann", question: "what is new?" });
  assert.deepEqual([shape(st), st.member], [refusal("STANDING_SWITCH_OFF"), "ann"]);
  assert.match(st.detail, /member's own sign-in/);
  assert.equal(w.snapshot(), before, "nothing minted or written");
  assert.equal(w.c.accountUsesSet({ owner: "member:ann", switch: "standing", on: true, by: "ann" }).ok, true, "on her sign-in");
  const sg = await w.c.aiGrantMintStanding({ member: "ann", question: "what is new?" });
  assert.equal(sg.ok, true, "a sign-in is never refused for being one");
  assert.equal((await w.c.aiGrantHeld({ token: sg.token })).member, "ann");
  /* disconnected, the group key off: no account, no grant */
  w.c.subscriptionDisconnect({ member: "ann", by: "ann" });
  assert.equal((await w.c.aiGrantHeld({ token: sg.token })).reason, "GRANT_NOT_HELD", "R32: ended when she disconnects");
  w.c.groupKeySwitch({ on: false, by: "admin" });
  assert.deepEqual(shape(await mint()), refusal("NO_ACCOUNT"));
  assert.match(ACCOUNT_CHECKS.NO_ACCOUNT.translation, /Claude subscription/);
  assert.match((await mint()).detail, /not connected through their subscription/);
});
