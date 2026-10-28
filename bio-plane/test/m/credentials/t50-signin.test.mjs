/* T50 (T50-5; N1060, K3218, K3224), at the interface: a sign-in dropped on Anthropic's refusal (`ai-accounts` R26's
   refused clause) revokes the member's run credentials (R73). Every refusal has a control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { sha } from "./fixture.mjs";

const look = (w, token) => w.c.aiCredentialLook({ secretSha: sha(token) }).credential;

test("R73 a sign-in dropped on Anthropic's refusal (ai-accounts R26) revokes the member's run credentials, inside the act; control: a refusal for a member with no held sign-in revokes no one's, and another member's run credential stays", async () => {
  const w = await world().group("ann", "bob", "cy");
  await w.signin("ann");
  await w.signin("bob");
  const a = w.c.aiRunCredentialMint({ member: "ann", run: "RUN-A", writes: ["airuntick"] });
  const b = w.c.aiRunCredentialMint({ member: "bob", run: "RUN-B", writes: ["airuntick"] });
  const c = w.c.aiRunCredentialMint({ member: "cy", run: "RUN-C", writes: ["airuntick"] });
  const own = w.c.aiCredentialMint({ who: "ann", tokenId: "ann-own", secretSha: "d".repeat(64), principalKind: "member" });
  assert.equal(own.ok, true);
  /* control: cy holds no sign-in; her refusal drops nothing and tells no listener */
  w.c.accounts.subscriptionTokenRefused({ member: "cy" });
  assert.deepEqual([look(w, a.token).revoked, look(w, b.token).revoked, look(w, c.token).revoked], [false, false, false]);
  w.c.accounts.subscriptionTokenRefused({ member: "ann" });
  assert.deepEqual([look(w, a.token).revoked, look(w, a.token).revokedBy], [true, null], "revoked in the act, no actor");
  assert.equal(look(w, b.token).revoked, false, "control: bob's");
  assert.equal(w.c.aiCredentialLook({ secretSha: "d".repeat(64) }).credential.revoked, false, "control: her R12 credential");
});
