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
  assert.deepEqual(Object.keys(w.ops()).sort(), ["accountreference", "accountreferenceremove", "accountreferenceset",
    "accountswitchset", "aicredentiallook", "aicredentialmint", "aicredentialrevoke", "aicredentials", "aigrantmint",
    "bootstrap", "claim", "keyedservices", "keyedserviceset", "keyedserviceswitch", "login", "session", "setpassword",
    "signeradd", "signerlist", "signerset"]);
});

test("R22 R23 R24 R25 R26 R27 R28 R29 the T33-20 rows: each id once, across every family, each where naming its one site, frozen", async () => {
  const { ACCOUNT_CHECKS, KEYED_SERVICE_CHECKS } = await import("../../../src/credentials/index.mjs");
  const want = {
    MACHINE_CANNOT_HOLD_ACCOUNT: ["C-29.13", W("#accountBar", "is-account-own-act")],
    NOT_YOUR_ACCOUNT: ["C-29.14", W("#notYours", "is-account-theirs")],
    ACCOUNT_MEMBER_NOT_ACTIVE: ["C-29.15", W("#accountBar", "is-account-own-act")],
    ACCOUNT_LEVEL_MEMBER_ONLY: ["C-29.16", W("#accountBar", "is-account-own-act")],
    UNKNOWN_ACCOUNT_KIND: ["C-29.17", W("accountReferenceSet", "is-account-kind")],
    ACCOUNT_KIND_NOT_OFFERED: ["C-29.18", W("accountReferenceSet", "is-account-kind")],
    NO_SECRET: ["C-29.19", W("accountReferenceSet", "is-account-kind")],
    NO_ACCOUNT: ["C-29.20", W("#noAccount", "is-account-held")],
    UNKNOWN_SWITCH: ["C-29.21", W("accountSwitchSet", "is-account-switch")],
    ACCOUNT_SEAL_UNAVAILABLE: ["C-29.22", W("#sealRefusal", "is-seal-bound")],
    GRANT_OP_REFUSED: ["C-29.23", W("aiGrantAdmit", "is-grant-op")],
    GRANT_NOT_HELD: ["C-29.24", W("aiGrantAdmit", "is-grant-op")],
    UNKNOWN_KEYED_SERVICE: ["C-96.19", W("#keyedService", "is-keyed-service")],
    KEYED_SERVICE_NO_KEY: ["C-96.20", W("keyedServiceSet", "is-keyed-service-key")],
    KEYED_SERVICE_OFF: ["C-96.21", W("keyedServiceFor", "is-keyed-service-on")],
  };
  const fresh = [ACCOUNT_CHECKS, KEYED_SERVICE_CHECKS];
  assert.deepEqual(fresh.flatMap((f) => Object.keys(f)).sort(), Object.keys(want).sort());
  for (const f of fresh) {
    assert.ok(Object.isFrozen(f));
    for (const [code, r] of Object.entries(f)) {
      assert.ok(Object.isFrozen(r), code);
      assert.deepEqual(Object.keys(r).sort(), ["check", "translation", "where"], code);
      assert.deepEqual([r.check, r.where], want[code], code);
      assert.match(r.translation, /\.$/, code);
    }
  }
  const ids = [SIGNER_ENROLMENT_CHECKS, AI_CREDENTIAL_CHECKS, CREDENTIALS_CHECKS, ...fresh].flatMap((f) => Object.values(f).map((r) => r.check));
  assert.equal(new Set(ids).size, ids.length, "one row per id across the module");
});

test("R22 R23 R25 R27 R29 the T33-20 routes: `by`, `viewer`, `member` and `session` from the query over the body; the secret from the body only; never answered back", async () => {
  const w = await world().group("ann");
  const set = await w.ops("by=ann", { member: "ann", kind: "apikey", secret: "sk-route", by: "admin" }).accountreferenceset();
  assert.equal(set.ok, true);
  assert.equal((await w.ops("by=second", { member: "ann", kind: "apikey", secret: "x", by: "ann" }).accountreferenceset()).reason,
    "NOT_YOUR_ACCOUNT", "the stamp wins over the body's `by`");
  assert.equal(w.ops("member=ann&viewer=member:ann").accountreference().held, true);
  assert.equal(w.ops("member=ann&viewer=member:second").accountreference().reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w.ops("by=ann", { member: "ann", switch: "standing", on: true }).accountswitchset().on, true);
  const tok = (await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).token;
  const g = await w.ops(`member=ann&by=ann&session=${tok}`).aigrantmint();
  assert.equal((await w.c.aiGrantAdmit({ token: g.token, op: "search" })).member, "ann");
  assert.equal((await w.ops("by=ann", { service: "courtlistener", key: "k" }).keyedserviceset()).reason, "NOT_AN_ADMIN");
  assert.equal((await w.ops("by=admin", { service: "courtlistener", key: "k" }).keyedserviceset()).ok, true);
  assert.equal(w.ops("by=admin", { service: "courtlistener", on: true }).keyedserviceswitch().on, true);
  assert.deepEqual(w.ops().keyedservices(), w.c.keyedServices());
  assert.equal(w.ops("by=ann", { member: "ann" }).accountreferenceremove().removed, true);
  assert.ok(!JSON.stringify([set, g]).includes("sk-route"));
});
