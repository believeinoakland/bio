/* AI credentials (R12–R15), at the interface; copied from membership's R28–R30 and R62 tests at the split (K637), and
   the old suite `test/aicredential.test.mjs`'s share converted here (K619 (2); `build/jobs/T17/legacy-tests.md`):
   the mint refused for every machine credential, the list's whole key set with `confinedTo` read back, a revoked row
   kept with its `revokedAt`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { AI_CREDENTIAL_CHECKS } from "../../../src/credentials/index.mjs";
import { notAnAdmin, MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

const SHA = (c) => c.repeat(64);
const row = (code) => AI_CREDENTIAL_CHECKS[code];
const PUBLIC = ["confinedTo", "mintedAt", "mintedBy", "note", "principal", "principalKind", "revoked", "revokedAt", "revokedBy",
                "taskScope", "tokenId", "writes"];

test("R12 aiCredentialMint: refusals in order with their rows, each writing nothing; records minted_by; never a secret, only its hash", async () => {
  const w = await world().group("ann");
  const base = { tokenId: "t1", secretSha: SHA("a"), principalKind: "member", taskScope: "investigative",
                 writes: ["promote", "capture"], note: "my agent" };
  const before = w.snapshot();
  /* every caller with no member behind it, asked first (aicredential.test.mjs §2: the MEMBER_TOKEN, ADMIN_TOKEN and
     agent credentials refused by name) */
  for (const who of [null, undefined, "", "class:admin", "class:member", "class:ai", "class:probe", "token:ai", "token:member"]) {
    const r = w.c.aiCredentialMint({ ...base, who, principalKind: "robot", tokenId: "" });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.who],
      [false, "AI_CREDENTIAL_MINT_NOT_A_MEMBER", "AI_CREDENTIAL_MINT_NOT_A_MEMBER", "C-29.1",
       row("AI_CREDENTIAL_MINT_NOT_A_MEMBER").translation, who || null], String(who));
  }
  const unstated = w.c.aiCredentialMint({ ...base, who: "ann", principalKind: "robot" });
  assert.deepEqual([unstated.reason, unstated.check, unstated.principalKind], ["AI_CREDENTIAL_PRINCIPAL_UNSTATED", "C-29.2", "robot"]);
  assert.deepEqual([w.c.aiCredentialMint({ ...base, who: "ann", principalKind: null }).reason,
                    w.c.aiCredentialMint({ ...base, who: "ann", principalKind: undefined }).principalKind],
    ["AI_CREDENTIAL_PRINCIPAL_UNSTATED", null]);
  for (const tokenId of [" ", "", null, undefined]) {
    const r = w.c.aiCredentialMint({ ...base, who: "ann", tokenId });
    assert.deepEqual([r.reason, r.check, r.tokenId], ["AI_CREDENTIAL_IDENTITY_TAKEN", "C-29.3", null], String(tokenId));
  }
  assert.equal(w.snapshot(), before, "no refusal writes");
  const ok = w.c.aiCredentialMint({ ...base, who: "ann", at: "2026-10-01T00:00:00Z" });
  assert.deepEqual(ok, { ok: true, minted: true, credential: { tokenId: "t1", principalKind: "member", principal: "member:ann",
    taskScope: "investigative", writes: ["capture", "promote"], note: "my agent", mintedBy: "ann", mintedAt: "2026-10-01T00:00:00Z",
    revokedAt: null, revokedBy: null, revoked: false, confinedTo: null } });
  const taken = w.c.aiCredentialMint({ ...base, who: "ann", secretSha: SHA("b") });
  assert.deepEqual([taken.reason, taken.tokenId], ["AI_CREDENTIAL_IDENTITY_TAKEN", "t1"], "an identity is never rebound");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM ai_credentials`).n, 1);
  assert.doesNotMatch(JSON.stringify(ok), /a{64}/);
  assert.deepEqual(w.row(`SELECT secret_sha, minted_by, scope_writes FROM ai_credentials`),
    { secret_sha: SHA("a"), minted_by: "ann", scope_writes: '["capture","promote"]' });
  /* defaults: an investigative scope, no writes, no note; a whole-second minting instant */
  const d = w.c.aiCredentialMint({ tokenId: "t2", secretSha: SHA("c"), principalKind: "Member", who: "ann" });
  assert.deepEqual([d.credential.principalKind, d.credential.taskScope, d.credential.writes, d.credential.note],
    ["member", "investigative", [], null]);
  assert.match(d.credential.mintedAt, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
});

test("R13 an organisation-scoped credential is minted only by an active administrator, the founder included; anyone else NOT_AN_ADMIN (membership R84) with its remedy", async () => {
  const w = await world().group("ann");
  const org = { secretSha: SHA("b"), principalKind: "organisation" };
  const r = w.c.aiCredentialMint({ ...org, tokenId: "o1", who: "ann" });
  assert.deepEqual(r, notAnAdmin("ann", "minting an organisation-wide AI credential",
    { remedy: "A member-scoped AI credential, which acts for you alone, is open to every member." }));
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.by], [false, "NOT_AN_ADMIN", "NOT_AN_ADMIN", "C-96.1", "ann"]);
  assert.match(r.remedy, /member-scoped/);
  assert.equal(r.message, `${MEMBERSHIP_CHECKS.NOT_AN_ADMIN.translation} ${r.remedy}`);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM ai_credentials`).n, 0);
  assert.equal(w.c.aiCredentialMint({ ...org, tokenId: "o2", who: "admin" }).credential.principal, "class:ai", "the founder");
  assert.equal(w.c.aiCredentialMint({ ...org, tokenId: "o3", who: "second" }).credential.principalKind, "organisation");
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='second'`);
  assert.equal(w.c.aiCredentialMint({ ...org, tokenId: "o4", who: "second" }).reason, "NOT_AN_ADMIN", "an inactive administrator");
  assert.equal(w.c.aiCredentialMint({ ...org, tokenId: "o5", who: "nobody" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.c.aiCredentialMint({ tokenId: "m1", secretSha: SHA("c"), principalKind: "member", who: "ann" }).ok, true,
    "a member-scoped credential stays open to every member");
  /* the founder before the instance is claimed is not an administrator (R17's fact) */
  const u = world();
  assert.equal(u.c.aiCredentialMint({ ...org, tokenId: "o6", who: "admin" }).reason, "NOT_AN_ADMIN");
});

test("R14 a member-scoped credential's principal is its minter; naming another member is refused", async () => {
  const w = await world().group("ann", "bob");
  const r = w.c.aiCredentialMint({ tokenId: "t", secretSha: SHA("d"), principalKind: "member", principalMember: "bob", who: "ann" });
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.principalMember],
    [false, "AI_CREDENTIAL_PRINCIPAL_NOT_THE_MINTER", "AI_CREDENTIAL_PRINCIPAL_NOT_THE_MINTER", "C-29.11",
     row("AI_CREDENTIAL_PRINCIPAL_NOT_THE_MINTER").translation, "bob"]);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM ai_credentials`).n, 0);
  const same = w.c.aiCredentialMint({ tokenId: "t", secretSha: SHA("d"), principalKind: "member", principalMember: "ann", who: "ann" });
  assert.equal(same.credential.principal, "member:ann");
  const none = w.c.aiCredentialMint({ tokenId: "u", secretSha: SHA("e"), principalKind: "member", principalMember: " ", who: "bob" });
  assert.equal(none.credential.principal, "member:bob");
});

test("R15 revoke, look and list: machine and unknown refused, twice is already and the row kept, never a secret, capped and measured", async () => {
  const w = await world().group("ann");
  for (let i = 0; i < 5; i++)
    w.c.aiCredentialMint({ tokenId: `t${i}`, secretSha: SHA(String(i)), principalKind: "member", who: "ann",
                           at: `2026-10-01T00:00:0${i}Z`, ...(i === 4 ? { confinedTo: "scratch" } : {}) });
  const before = w.snapshot();
  for (const who of [null, "", "class:ai", "class:member", "token:ai"]) {
    const r = w.c.aiCredentialRevoke({ who, tokenId: "t0" });
    assert.deepEqual([r.reason, r.check, r.translation], ["AI_CREDENTIAL_REVOKE_NOT_A_MEMBER", "C-29.4",
      row("AI_CREDENTIAL_REVOKE_NOT_A_MEMBER").translation], String(who));
  }
  for (const tokenId of ["nope", "", null]) {
    const r = w.c.aiCredentialRevoke({ who: "ann", tokenId });
    assert.deepEqual([r.reason, r.check], ["AI_CREDENTIAL_UNKNOWN", "C-29.5"], String(tokenId));
  }
  assert.equal(w.snapshot(), before);
  const r1 = w.c.aiCredentialRevoke({ who: "ann", tokenId: "t0", at: "2026-10-02T00:00:00Z" });
  assert.deepEqual([r1.ok, r1.revoked, r1.already, r1.credential.revoked, r1.credential.revokedBy, r1.credential.revokedAt],
    [true, true, false, true, "ann", "2026-10-02T00:00:00Z"]);
  const r2 = w.c.aiCredentialRevoke({ who: "second", tokenId: "t0" });
  assert.deepEqual([r2.ok, r2.already, r2.credential.revokedBy], [true, true, "ann"], "twice: already, nothing rewritten");
  /* look: by hash only; a revoked row is returned, not hidden; never a secret */
  const look = w.c.aiCredentialLook({ secretSha: SHA("1") });
  assert.deepEqual([look.found, look.credential.tokenId, look.credential.principal, look.credential.writes], [true, "t1", "member:ann", []]);
  assert.deepEqual(w.c.aiCredentialLook({ secretSha: SHA("0").toUpperCase() }).credential.revoked, true);
  for (const s of ["not-a-hash", null, undefined, SHA("9"), "a".repeat(63)])
    assert.deepEqual(w.c.aiCredentialLook({ secretSha: s }), { found: false, credential: null }, String(s));
  /* the list: every credential, the revoked one kept with its revokedAt, the whole key set (confinedTo read back) */
  const all = w.c.aiCredentials({});
  assert.deepEqual([all.count, all.limit, all.truncated], [5, 200, false]);
  assert.deepEqual(all.credentials.map((c) => c.tokenId), ["t0", "t1", "t2", "t3", "t4"]);
  for (const c of all.credentials) assert.deepEqual(Object.keys(c).sort(), PUBLIC, c.tokenId);
  assert.deepEqual(all.credentials.map((c) => [c.revoked, c.revokedAt, c.confinedTo]),
    [[true, "2026-10-02T00:00:00Z", null], [false, null, null], [false, null, null], [false, null, null], [false, null, "scratch"]]);
  for (const out of [look, all]) assert.doesNotMatch(JSON.stringify(out), /([0-9a-f])\1{63}/);
  const two = w.c.aiCredentials({ limit: 2 });
  assert.deepEqual([two.count, two.limit, two.truncated, two.credentials.map((c) => c.tokenId)], [2, 2, true, ["t0", "t1"]]);
  assert.deepEqual([w.c.aiCredentials({ limit: 5 }).truncated, w.c.aiCredentials({ limit: 4 }).truncated], [false, true]);
  for (const [limit, cap] of [[10_000, 500], [500, 500], [0, 200], [-3, 200], ["x", 200], [null, 200], [2.7, 2]])
    assert.equal(w.c.aiCredentials({ limit }).limit, cap, String(limit));
});
