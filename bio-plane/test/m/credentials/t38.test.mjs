/* T38 (T38-5; N785, K2200), at the interface: the ask grant mints for a member an account serves (R27), and (T41; N796,
   Bob K2425; T53, K5457) her standing questions are governed by the `standing` switch of the account that serves her, off
   by default (R32). (T48; K3101) The accounts, their switches and the cascade are `ai-accounts`' (its R7, R11, R14, R25);
   its T38 tests moved there with them. The standing grant ends when its account is removed (R73). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD } from "./fixture.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { ACCOUNT_CHECKS } from "../../../src/credentials/index.mjs";

const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const refusal = (code) => ({ ok: false, reason: code, code, check: ACCOUNT_CHECKS[code].check, translation: ACCOUNT_CHECKS[code].translation });
const RETIRED = ["GROUP_KEY_NOTICE_DUE", "PROJECT_KEY_NOTICE_DUE"];

test("R27 R32 R73 a member an account serves is granted an ask (no retired notice code asked or returned); refused NO_ACCOUNT once that account is removed with no other; their standing questions governed by the serving account's standing switch, off by default, and its grant ended when that account is removed", async () => {
  const w = await world().group("ann", "bob");
  assert.equal((await w.c.accounts.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" })).ok, true);
  const s = (await w.c.login({ handle: "ann", password: PASSWORD("ann") })).token;
  const mint = () => w.c.aiGrantMint({ member: "ann", by: "ann", session: s });
  const g = await mint();
  assert.deepEqual(Object.keys(g).sort(), ["expires", "ok", "token"]);
  assert.equal((await w.c.aiGrantAdmit({ token: g.token, op: "search" })).viewer, "member:ann");
  /* R22's refusals still come first */
  assert.deepEqual(shape(await w.c.aiGrantMint({ member: "ann", by: "bob", session: s })), refusal("NOT_YOUR_ACCOUNT"));
  /* R32: the serving account's own standing switch governs, off by default (the team's on does not) */
  await w.c.accounts.groupKeySet({ key: "sk-group", by: "admin" });
  w.c.accounts.groupKeySwitch({ on: true, by: "admin" });
  w.c.accounts.accountUsesSet({ owner: "group", switch: "standing", on: true, by: "admin" });
  const before = w.snapshot();
  const st = await w.c.aiGrantMintStanding({ member: "ann", question: "what is new?" });
  assert.deepEqual([shape(st), st.member], [refusal("STANDING_SWITCH_OFF"), "ann"]);
  assert.equal(st.detail, word("credentials.index.standing_questions_are_off", { who: "member's own account" }));
  assert.equal(w.snapshot(), before, "nothing minted or written");
  assert.equal(w.c.accounts.accountUsesSet({ owner: "member:ann", switch: "standing", on: true, by: "ann" }).ok, true, "on her account");
  const sg = await w.c.aiGrantMintStanding({ member: "ann", question: "what is new?" });
  assert.equal(sg.ok, true);
  assert.equal((await w.c.aiGrantHeld({ token: sg.token })).member, "ann");
  /* her account removed, the team's key off: no account, no grant, and the standing grant ended */
  w.c.accounts.accountReferenceRemove({ member: "ann", by: "ann" });
  assert.equal((await w.c.aiGrantHeld({ token: sg.token })).reason, "GRANT_NOT_HELD", "R32: ended when her account is removed");
  w.c.accounts.groupKeySwitch({ on: false, by: "admin" });
  const none = await mint();
  assert.deepEqual(shape(none), refusal("NO_ACCOUNT"));
  assert.ok(!RETIRED.includes(none.code));
});

/* The notice is `ai-accounts` R51's and the refusal reaches the grant through R25's `accountServing`; the provider's job
   (T53) gives the first act to a recipient its refusal, which this mint answers as given. */
test.todo("R27 a member whose serving account sends to a recipient whose notice they have not read is refused RECIPIENT_NOTICE_DUE, minting nothing; control: a member whose notice is read is granted, and no retired code is returned (awaits ai-accounts R51)");
