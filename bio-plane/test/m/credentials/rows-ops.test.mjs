/* This module's rows (C-63, C-29's mint and revocation rows, C-96.8, C-96.15–.17: R6, R9, R12, R14, R15) and its ops
   map, at the interface: each route answers its service, and the control plane's stamps in the query win over a body. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD, FOUNDER_PASSWORD, FOUNDER_HANDLE } from "./fixture.mjs";
import { aiAccountsOps } from "../../../src/ai-accounts/index.mjs";
import { CREDENTIALS_CHECKS, SIGNER_ENROLMENT_CHECKS, AI_CREDENTIAL_CHECKS, credentialsOps } from "../../../src/credentials/index.mjs";

const credentialsOpsNoVersion = (w) => credentialsOps(w.c, new URL("http://x/"), null, {});
const W = (fn, region) => `src/credentials/index.mjs ${fn} > ${region}`;

test("R6 R9 R12 R14 R15 R53 the rows: ids and words as copied, each where naming its one site in this module, frozen, one row per id", () => {
  const want = {
    SIGNER_MEMBER_NOT_ENROLLED: ["C-63.1", W("#signerMemberBar", "is-signer-member-attesting"), /has not enrolled yet/],
    SIGNER_MEMBER_NOT_ACTIVE: ["C-63.2", W("#signerMemberBar", "is-signer-member-attesting"), /membership is not active/],
    AI_CREDENTIAL_MINT_NOT_A_MEMBER: ["C-29.1", W("aiCredentialMint", "is-ai-credential-mint"), /Only a named person/],
    AI_CREDENTIAL_PRINCIPAL_UNSTATED: ["C-29.2", W("aiCredentialMint", "is-ai-credential-mint"), /who stands behind it/],
    AI_CREDENTIAL_IDENTITY_TAKEN: ["C-29.3", W("aiCredentialMint", "is-ai-credential-mint"), /already belongs/],
    AI_CREDENTIAL_REVOKE_NOT_A_MEMBER: ["C-29.4", W("aiCredentialRevoke", "is-ai-credential-revoke"), /recorded against the person/],
    AI_CREDENTIAL_UNKNOWN: ["C-29.5", W("aiCredentialRevoke", "is-ai-credential-revoke"), /no agent credential by that name/],
    AI_CREDENTIAL_PRINCIPAL_NOT_THE_MINTER: ["C-29.11", W("aiCredentialMint", "is-ai-credential-mint"), /member who creates it/],
    AI_CREDENTIAL_BAD_EXPIRY: ["C-29.28", W("aiCredentialMint", "is-ai-credential-expiry"), /from 1 to 365, and 90/],
    AI_CREDENTIAL_NO_SECRET: ["C-29.33", W("aiCredentialMint", "is-ai-credential-digest"), /could never be used/],
    /* (T47-9; R63) a run segment's credential's malformed request, the next free C-29 number after R64's */
    /* (T49; N1075) the words of words.json's `refusal.AI_RUN_CREDENTIAL_MALFORMED`, read by key */
    AI_RUN_CREDENTIAL_MALFORMED: ["C-29.41", W("aiRunCredentialMint", "is-ai-run-credential-shape"), /pass it needs to work for you was malformed/],
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

test("R1 R2 R3 R4 R5 the sign-in routes: bootstrap (with the store's build), claim (fingerprint from the query), login, setpassword (a member's own change, R3: the session and `by` from the query, never a body's role), session", async () => {
  const w = world();
  assert.deepEqual(w.ops("fp=fp-1").bootstrap(), { claimed: false, rearmed: false, consumedAt: null, storeVersion: "test-build" });
  assert.equal(credentialsOpsNoVersion(w).bootstrap().storeVersion, null, "no VERSION bound: null, never a default");
  const c = await w.ops("fp=fp-1", { password: FOUNDER_PASSWORD, handle: FOUNDER_HANDLE, tokenFp: "fp-forged" }).claim();
  assert.equal(c.ok, true);
  assert.deepEqual(w.ops("fp=fp-1").bootstrap().claimed, true, "the query's fingerprint was recorded, not the body's");
  assert.deepEqual(w.ops("fp=fp-forged").bootstrap().rearmed, true);
  const l = await w.ops("", { handle: FOUNDER_HANDLE, password: FOUNDER_PASSWORD }).login();
  assert.equal(l.ok, true);
  assert.equal((await w.ops("", { handle: "x", password: PASSWORD("x") }).setpassword()).reason, "MACHINE_CANNOT_SET_PASSWORD",
    "no stamp, no change; a body's role is no stamp");
  assert.equal((await w.ops(`by=admin&session=${l.token}`, { handle: "x", current: FOUNDER_PASSWORD, password: "founder-new-pass-1" })
    .setpassword()).role, "admin", "the session's role, never the body's");
  assert.equal(w.row(`SELECT role FROM credentials WHERE role='member:x'`), null);
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

test("R12 R15 R53 the AI credential routes: `who` from the query over the body, `secretSha` from the body only, never the query; revoke by the query's tokenId; the list; the internal look", async () => {
  const w = await world().group("ann");
  const m = w.ops(`who=ann&secretSha=${"b".repeat(64)}`,
    { who: "admin", secretSha: "a".repeat(64), tokenId: "t1", principalKind: "member" }).aicredentialmint();
  assert.deepEqual([m.ok, m.credential.mintedBy, m.credential.principal], [true, "ann", "member:ann"]);
  assert.equal(w.row(`SELECT secret_sha FROM ai_credentials`).secret_sha, "a".repeat(64), "the body's digest, never the query's");
  assert.equal(w.ops("who=class:ai", { tokenId: "t2", principalKind: "member", who: "ann" }).aicredentialmint().reason,
    "AI_CREDENTIAL_MINT_NOT_A_MEMBER");
  assert.equal(w.ops(`sha=${"a".repeat(64)}`).aicredentiallook().credential.tokenId, "t1");
  assert.deepEqual(w.ops("limit=1").aicredentials().limit, 1);
  assert.equal(w.ops("tokenId=t1&who=class:ai", { who: "ann" }).aicredentialrevoke().reason, "AI_CREDENTIAL_REVOKE_NOT_A_MEMBER");
  assert.equal(w.ops("tokenId=t1&who=ann").aicredentialrevoke().already, false);
  /* (T49; N1073, K3268) never hand-listed: the ops that moved to ai-accounts (R72) are read from its own declaration, and
     every route this module answers is one name, answered once */
  const moved = Object.keys(aiAccountsOps(w.c.accounts, new URL("http://x/"), null, {}));
  const routes = Object.keys(w.ops());
  assert.deepEqual(routes.sort(), Object.keys(credentialsOpsNoVersion(w)).sort(), "the routes are this module's own map");
  assert.ok(moved.every((op) => routes.includes(op)), "the moved routes are answered here, through their delegates");
});

test("R27 R28 R29 R31 R32 R65 R66 R69 R77 the C-29 and keyed-service rows this module holds: each id once, across every family, each where naming its one site, frozen; (T48) the AI accounts' rows left this file for ai-accounts; C-29.16 retired with R26 (K1756) and C-29.18 never reused", async () => {
  const { ACCOUNT_CHECKS, KEYED_SERVICE_CHECKS } = await import("../../../src/credentials/checks.mjs");
  const want = {
    GRANT_OP_REFUSED: ["C-29.23", W("aiGrantAdmit", "is-grant-op")],
    GRANT_NOT_HELD: ["C-29.24", W("#grantNotHeld", "is-grant-held")],
    STANDING_SWITCH_OFF: ["C-29.25", W("aiGrantMintStanding", "is-standing-grant")],
    NO_QUESTION: ["C-29.26", W("aiGrantMintStanding", "is-standing-grant")],
    /* (T47-81; R65, R66, R69, R71) the next free numbers of C-29 at that job's START */
    REAUTH_DUE: ["C-29.42", W("reauthDue", "is-reauth-window")],
    SESSION_LOCKED: ["C-29.43", W("sessionLockedRefusal", "is-session-unlocked")],
    RESET_LINK_DEAD: ["C-29.46", W("#resetLinkDead", "is-reset-link-live")],
    RESET_LINK_MEMBER_NOT_ACTIVE: ["C-29.47", W("passwordResetLinkMake", "is-reset-link-member")],
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
  /* (T48; K3101) the moved rows are ai-accounts' alone: none of their ids or codes is held in this module's checks.mjs */
  const CR = await import("../../../src/credentials/checks.mjs");
  const { AI_ACCOUNT_CHECKS } = await import("../../../src/ai-accounts/index.mjs");
  const held = Object.values(CR).filter((t) => t && typeof t === "object").flatMap((t) => Object.entries(t));
  for (const [code, r] of Object.entries(AI_ACCOUNT_CHECKS)) {
    assert.ok(!held.some(([c, x]) => c === code || x?.check === r.check), `${code} (${r.check}) left credentials' checks.mjs`);
    assert.match(r.where, /^src\/ai-accounts\//, code);
  }
  assert.ok(!("AI_WORDS" in CR), "AI_WORDS is ai-accounts'");
  assert.ok(!ids.includes("C-29.18"), "C-29.18, the held-back kind's row, is retired and not reused (K1547)");
  assert.ok(!ids.includes("C-29.16") && !("ACCOUNT_LEVEL_MEMBER_ONLY" in ACCOUNT_CHECKS), "C-29.16 retired with R26 (K1756), not reused");
});

test("R22 R23 R25 R27 R29 the T33-20 routes: `by`, `viewer`, `member` and `session` from the query over the body; the secret from the body only; never answered back", async () => {
  const w = await world().group("ann");
  const sub = await w.ops("by=ann", { member: "ann", kind: "subscription", secret: "sk-route-sub", by: "admin" }).accountreferenceset();
  assert.equal(sub.reason, "UNKNOWN_ACCOUNT_KIND", "T38: the subscription token retired");
  assert.equal(w.ops("member=ann&viewer=member:ann").accountreference().held, false);
  const set = await w.ops("by=ann", { member: "ann", kind: "apikey", secret: "sk-route", by: "admin" }).accountreferenceset();
  assert.equal(set.ok, true);
  assert.equal((await w.ops("by=second", { member: "ann", kind: "apikey", secret: "x", by: "ann" }).accountreferenceset()).ok, true,
    "the stamp wins over the body's `by` and `member` (ai-accounts R38): the caller sets its own reference");
  assert.equal(w.ops("member=second&viewer=member:second").accountreference().held, true, "R38: second's own reference, not ann's");
  assert.equal(w.ops("member=ann&viewer=member:ann").accountreference().held, true);
  assert.equal(w.ops("member=ann&viewer=member:second").accountreference().reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w.ops("by=ann", { owner: "member:ann", switch: "standing", on: true }).accountusesset().on, true, "T41: accountswitchset retired");
  const tok = (await w.c.login({ handle: "ann", password: PASSWORD("ann") })).token;
  const g = await w.ops(`member=ann&by=ann&session=${tok}`).aigrantmint();
  assert.equal((await w.c.aiGrantAdmit({ token: g.token, op: "search" })).member, "ann");
  assert.equal((await w.ops("by=ann", { service: "courtlistener", key: "k" }).keyedserviceset()).reason, "NOT_AN_ADMIN");
  assert.equal((await w.ops("by=admin", { service: "courtlistener", key: "k" }).keyedserviceset()).ok, true);
  assert.equal(w.ops("by=admin", { service: "courtlistener", on: true }).keyedserviceswitch().on, true);
  assert.deepEqual(w.ops().keyedservices(), w.c.keyedServices());
  assert.equal(w.ops("by=ann", { member: "ann" }).accountreferenceremove().removed, true);
  assert.ok(!JSON.stringify([sub, set, g]).includes("sk-route"));
});
