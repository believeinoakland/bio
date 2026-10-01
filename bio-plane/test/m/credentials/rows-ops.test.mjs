/* This module's rows (C-63, C-29's mint and revocation rows, C-96.8, C-96.15–.17: R6, R9, R12, R14, R15) and its ops
   map, at the interface: each route answers its service, and the control plane's stamps in the query win over a body. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD, FOUNDER_PASSWORD } from "./fixture.mjs";
import { CREDENTIALS_CHECKS, SIGNER_ENROLMENT_CHECKS, AI_CREDENTIAL_CHECKS, credentialsOps } from "../../../src/credentials/index.mjs";

const credentialsOpsNoVersion = (w) => credentialsOps(w.c, new URL("http://x/"), null, {});
const W = (fn, region) => `src/credentials/index.mjs ${fn} > ${region}`;

test("R6 R9 R12 R14 R15 the rows: ids and words as copied, each where naming its one site in this module, frozen, one row per id", () => {
  const want = {
    SIGNER_MEMBER_NOT_ENROLLED: ["C-63.1", W("#signerMemberBar", "is-signer-member-attesting"), /has not enrolled yet/],
    SIGNER_MEMBER_NOT_ACTIVE: ["C-63.2", W("#signerMemberBar", "is-signer-member-attesting"), /membership is not active/],
    AI_CREDENTIAL_MINT_NOT_A_MEMBER: ["C-29.1", W("aiCredentialMint", "is-ai-credential-mint"), /Only a named person/],
    AI_CREDENTIAL_PRINCIPAL_UNSTATED: ["C-29.2", W("aiCredentialMint", "is-ai-credential-mint"), /who stands behind it/],
    AI_CREDENTIAL_IDENTITY_TAKEN: ["C-29.3", W("aiCredentialMint", "is-ai-credential-mint"), /already belongs/],
    AI_CREDENTIAL_REVOKE_NOT_A_MEMBER: ["C-29.4", W("aiCredentialRevoke", "is-ai-credential-revoke"), /recorded against the person/],
    AI_CREDENTIAL_UNKNOWN: ["C-29.5", W("aiCredentialRevoke", "is-ai-credential-revoke"), /no agent credential by that name/],
    AI_CREDENTIAL_PRINCIPAL_NOT_THE_MINTER: ["C-29.11", W("aiCredentialMint", "is-ai-credential-mint"), /member who creates it/],
    BAD_KEY: ["C-96.8", W("signerAdd", "is-signer-key-shape"), /begins AAAA/],
    SIGNER_KEY_HELD_BY_ANOTHER: ["C-96.15", W("signerRegisterOwn", "is-signer-key-held"),
      /^This key is registered to another member, so it cannot be yours\. Make a new key in this browser\. Nothing was changed\.$/],
    SIGNER_KEY_REVOKED: ["C-96.16", W("signerRegisterOwn", "is-signer-key-revoked"),
      /^This key was revoked, so it cannot be registered again\. Make a new key in this browser, or ask an administrator\. Nothing was changed\.$/],
    MACHINE_CANNOT_REGISTER_KEY: ["C-96.17", W("signerRegisterOwn", "is-machine-register-key"), /from their own signed-in session/],
  };
  const families = [SIGNER_ENROLMENT_CHECKS, AI_CREDENTIAL_CHECKS, CREDENTIALS_CHECKS];
  assert.deepEqual(families.flatMap((f) => Object.keys(f)).sort(), Object.keys(want).sort());
  for (const f of families) {
    assert.ok(Object.isFrozen(f));
    for (const [code, r] of Object.entries(f)) {
      assert.ok(Object.isFrozen(r), code);
      assert.deepEqual(Object.keys(r).sort(), ["check", "translation", "where"], code);
      assert.deepEqual([r.check, r.where], want[code].slice(0, 2), code);
      assert.match(r.translation, want[code][2], code);
    }
  }
  const ids = families.flatMap((f) => Object.values(f).map((r) => r.check));
  assert.equal(new Set(ids).size, ids.length, "one row per id");
});

test("R1 R2 R3 R4 R5 the sign-in routes: bootstrap (with the store's build), claim (fingerprint from the query), login, setpassword, session", async () => {
  const w = world();
  assert.deepEqual(w.ops("fp=fp-1").bootstrap(), { claimed: false, rearmed: false, consumedAt: null, storeVersion: "test-build" });
  assert.equal(credentialsOpsNoVersion(w).bootstrap().storeVersion, null, "no VERSION bound: null, never a default");
  const c = await w.ops("fp=fp-1", { password: FOUNDER_PASSWORD, tokenFp: "fp-forged" }).claim();
  assert.equal(c.ok, true);
  assert.deepEqual(w.ops("fp=fp-1").bootstrap().claimed, true, "the query's fingerprint was recorded, not the body's");
  assert.deepEqual(w.ops("fp=fp-forged").bootstrap().rearmed, true);
  assert.deepEqual(await w.ops("", { role: "member:x", password: PASSWORD("x") }).setpassword(), { ok: true, role: "member:x" });
  const l = await w.ops("", { role: "admin", password: FOUNDER_PASSWORD }).login();
  assert.equal(l.ok, true);
  assert.equal((await w.ops("", null).login()).reason, "SIGN_IN_REFUSED");
  assert.equal(w.ops(`t=${l.token}`).session().session.role, "admin");
  assert.deepEqual(w.ops("t=nope").session(), { session: null });
});

test("R6 R7 R8 the key routes: signeradd and signerset take `by` from the query over the body; signerlist", async () => {
  const w = await world().group("ann");
  const forged = w.ops("by=ann", { keyB64: "AAAAk", memberId: "ann", by: "admin" }).signeradd();
  assert.equal(forged.reason, "NOT_AN_ADMIN", "the stamp wins over the body's `by`");
  assert.equal(w.ops("by=second", { keyB64: "AAAAk", memberId: "ann", by: "ann" }).signeradd().by, "second");
  assert.equal(w.ops("by=ann", { keyB64: "AAAAk", status: "revoked", by: "admin" }).signerset().reason, "NOT_AN_ADMIN");
  assert.deepEqual(w.ops("by=admin", { keyB64: "AAAAk", status: "revoked" }).signerset(),
    { ok: true, keyB64: "AAAAk", status: "revoked", by: "admin" });
  assert.deepEqual(w.ops().signerlist(), w.c.signerList());
});

test("R12 R15 the AI credential routes: `who` and `secretSha` from the query over the body; revoke by the query's tokenId; the list; the internal look", async () => {
  const w = await world().group("ann");
  const m = w.ops(`who=ann&secretSha=${"a".repeat(64)}`,
    { who: "admin", secretSha: "b".repeat(64), tokenId: "t1", principalKind: "member" }).aicredentialmint();
  assert.deepEqual([m.ok, m.credential.mintedBy, m.credential.principal], [true, "ann", "member:ann"]);
  assert.equal(w.row(`SELECT secret_sha FROM ai_credentials`).secret_sha, "a".repeat(64));
  assert.equal(w.ops("who=class:ai", { tokenId: "t2", principalKind: "member", who: "ann" }).aicredentialmint().reason,
    "AI_CREDENTIAL_MINT_NOT_A_MEMBER");
  assert.equal(w.ops(`sha=${"a".repeat(64)}`).aicredentiallook().credential.tokenId, "t1");
  assert.deepEqual(w.ops("limit=1").aicredentials().limit, 1);
  assert.equal(w.ops("tokenId=t1&who=class:ai", { who: "ann" }).aicredentialrevoke().reason, "AI_CREDENTIAL_REVOKE_NOT_A_MEMBER");
  assert.equal(w.ops("tokenId=t1&who=ann").aicredentialrevoke().already, false);
  assert.deepEqual(Object.keys(w.ops()).sort(), ["aicredentiallook", "aicredentialmint", "aicredentialrevoke", "aicredentials",
    "bootstrap", "claim", "login", "session", "setpassword", "signeradd", "signerlist", "signerset"]);
});
