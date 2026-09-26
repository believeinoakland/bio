import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { Membership } from "../../../src/membership/index.mjs";

test("R21 expertiseDeclare: the member's own act; refusals; labels normalised", async () => {
  const w = await world().group("ann", "bob");
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.equal(w.m.expertiseDeclare({ memberId: "nobody", label: "CPA" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w.m.expertiseDeclare({ memberId: "bob", label: "CPA" }).reason, "NOT_ACTIVE");
  assert.equal(w.m.expertiseDeclare({ memberId: "ann", label: "  \n " }).reason, "NO_LABEL");
  const d = w.m.expertiseDeclare({ memberId: "ann", label: "  Certified   Public\tAccountant " });
  assert.deepEqual([d.ok, d.label, d.state], [true, "Certified Public Accountant", "declared"]);
  assert.equal(w.m.expertiseDeclare({ memberId: "ann", label: "Certified Public Accountant" }).reason, "ALREADY_DECLARED");
  w.m.expertiseConfirm({ memberId: "ann", label: "Certified Public Accountant", by: "admin" });
  assert.equal(w.m.expertiseDeclare({ memberId: "ann", label: "Certified Public Accountant" }).reason, "ALREADY_DECLARED");
  assert.equal(w.m.expertiseDeclare({ memberId: "ann", label: "x".repeat(200) }).label.length, 120);
  assert.equal(w.row(`SELECT actor FROM member_expertise WHERE member_id='ann' ORDER BY seq LIMIT 1`).actor, "ann");
});

test("R22 expertiseConfirm: ADMIN_ONLY, NO_SUCH_MEMBER, NOT_DECLARED, ALREADY_CONFIRMED, NOT_CONFIRMED; admin for admin", async () => {
  const w = await world().group("ann");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  assert.equal(w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "ann" }).reason, "ADMIN_ONLY");
  assert.equal(w.m.expertiseConfirm({ memberId: "nobody", label: "CPA", by: "admin" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w.m.expertiseConfirm({ memberId: "ann", label: "Lawyer", by: "admin" }).reason, "NOT_DECLARED");
  assert.equal(w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin", withdraw: true }).reason, "NOT_CONFIRMED");
  const c = w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "second" });
  assert.deepEqual([c.ok, c.state, c.by], [true, "confirmed", "second"]);
  assert.equal(w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" }).reason, "ALREADY_CONFIRMED");
  w.m.expertiseDeclare({ memberId: "second", label: "Engineer" });
  assert.equal(w.m.expertiseConfirm({ memberId: "second", label: "Engineer", by: "admin" }).ok, true);
});

test("R23 every declaration, confirmation and withdrawal is a new entry, none overwritten", async () => {
  const w = await world().group("ann");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" });
  w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "second", withdraw: true });
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  assert.deepEqual(w.rows(`SELECT event, actor FROM member_expertise ORDER BY seq`).map((r) => [r.event, r.actor]),
    [["declared", "ann"], ["confirmed", "admin"], ["withdrawn", "second"], ["declared", "ann"]]);
});

test("R24 expertiseList: per label the state, who and when, the full history; expertise gates nothing", async () => {
  const w = await world().group("ann");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  w.m.expertiseDeclare({ memberId: "ann", label: "Architect" });
  w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" });
  const l = w.m.expertiseList({ memberId: "ann" });
  assert.equal(l.gates, "nothing");
  assert.deepEqual(l.expertise.map((e) => [e.label, e.state, e.confirmed, e.by, e.history.map((h) => h.event)]),
    [["Architect", "declared", false, "ann", ["declared"]], ["CPA", "confirmed", true, "admin", ["declared", "confirmed"]]]);
  for (const e of l.expertise) assert.match(e.at, /^\d{4}-/);
  // gates nothing: capabilities and sight are the same with and without it
  const tokBefore = w.m.session((await w.m.login({ role: "member:ann", password: "ann-passphrase-x" })).token);
  w.m.expertiseConfirm({ memberId: "ann", label: "Architect", by: "admin" });
  const tokAfter = w.m.session((await w.m.login({ role: "member:ann", password: "ann-passphrase-x" })).token);
  assert.deepEqual({ ...tokBefore, expires: 0 }, { ...tokAfter, expires: 0 });
});

test("R25 signerAdd: refusals in order; a known key rebinds and reactivates, never a second row", async () => {
  const w = await world().group("ann", "bob");
  const invited = await w.m.memberAdd({ memberId: "cal", cover: "c", by: "admin" });
  assert.ok(invited.ok);
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.equal(w.m.signerAdd({ keyB64: "AAAAkey1", memberId: "ann", by: "ann" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.m.signerAdd({ keyB64: "ssh-ed25519 AAAA", memberId: "ann", by: "admin" }).reason, "BAD_KEY");
  assert.equal(w.m.signerAdd({ keyB64: "AAAAkey1", memberId: "nobody", by: "admin" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w.m.signerAdd({ keyB64: "AAAAkey1", memberId: "cal", by: "admin" }).reason, "SIGNER_MEMBER_NOT_ENROLLED");
  assert.equal(w.m.signerAdd({ keyB64: "AAAAkey1", memberId: "bob", by: "admin" }).reason, "SIGNER_MEMBER_NOT_ACTIVE");
  const a = w.m.signerAdd({ keyB64: "AAAAkey1", memberId: "ann", comment: "laptop", by: "admin" });
  assert.deepEqual([a.ok, a.by], [true, "admin"]);
  w.m.signerSet({ keyB64: "AAAAkey1", status: "revoked", by: "admin" });
  w.m.signerAdd({ keyB64: "AAAAkey1", memberId: "second", by: "second" });
  assert.deepEqual(w.rows(`SELECT member_id, status, status_by FROM signers`),
    [{ member_id: "second", status: "active", status_by: "second" }]);
});

test("R26 signerSet: refusals; activation refused as R25; revoking never refused", async () => {
  const w = await world().group("ann");
  w.m.signerAdd({ keyB64: "AAAAkey1", memberId: "ann", by: "admin" });
  assert.equal(w.m.signerSet({ keyB64: "AAAAkey1", status: "revoked", by: "ann" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.m.signerSet({ keyB64: "AAAAkey1", status: "lost", by: "admin" }).reason, "BAD_STATUS");
  assert.equal(w.m.signerSet({ keyB64: "AAAAnone", status: "revoked", by: "admin" }).reason, "NO_SUCH_KEY");
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  assert.equal(w.m.signerSet({ keyB64: "AAAAkey1", status: "active", by: "admin" }).reason, "SIGNER_MEMBER_NOT_ACTIVE");
  assert.equal(w.m.signerSet({ keyB64: "AAAAkey1", status: "revoked", by: "second" }).ok, true);
});

test("R27 R70 signerList's attests is the one predicate, and attestingKeys is exactly the attesting set", async () => {
  const w = await world().group("ann", "bob", "cal");
  for (const [k, m] of [["AAAAa", "ann"], ["AAAAb", "bob"], ["AAAAc", "cal"], ["AAAAs", "second"]])
    w.m.signerAdd({ keyB64: k, memberId: m, by: "admin" });
  w.m.signerSet({ keyB64: "AAAAa", status: "revoked", by: "admin" });
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });   // revokes bob's key too
  w.sql.exec(`UPDATE signers SET status='active' WHERE key_b64='AAAAb'`);   // a key left active on a revoked member
  w.sql.exec(`INSERT INTO signers (key_b64, member_id, status, added) VALUES ('AAAAz','ghost','active','t')`);
  const list = Object.fromEntries(w.m.signerList().signers.map((s) => [s.key_b64, s]));
  assert.deepEqual([list.AAAAa.attests, list.AAAAa.attests_why], [false, "key_revoked"]);
  assert.deepEqual([list.AAAAb.attests, list.AAAAb.attests_why, list.AAAAb.member_status], [false, "member_revoked", "revoked"]);
  assert.deepEqual([list.AAAAz.attests, list.AAAAz.attests_why], [false, "member_absent"]);
  assert.deepEqual([list.AAAAc.attests, list.AAAAc.attests_why], [true, null]);
  assert.equal(list.AAAAa.status_by, "admin");
  const attesting = w.m.attestingKeys().map((k) => k.key_b64).sort();
  assert.deepEqual(attesting, Object.values(list).filter((s) => s.attests).map((s) => s.key_b64).sort());
  assert.deepEqual(attesting, ["AAAAc", "AAAAs"]);
  assert.deepEqual(Object.keys(w.m.attestingKeys()[0]).sort(), ["key_b64", "member_id"]);
});

const SHA = (c) => c.repeat(64);

test("R28 aiCredentialMint: refusals; records minted_by; never a secret, only its hash", async () => {
  const w = await world().group("ann");
  const base = { tokenId: "t1", secretSha: SHA("a"), principalKind: "member", taskScope: "investigative",
                 writes: ["promote", "capture"], note: "my agent" };
  assert.equal(w.m.aiCredentialMint({ ...base, who: null }).reason, "AI_CREDENTIAL_MINT_NOT_A_MEMBER");
  assert.equal(w.m.aiCredentialMint({ ...base, who: "class:admin" }).reason, "AI_CREDENTIAL_MINT_NOT_A_MEMBER");
  assert.equal(w.m.aiCredentialMint({ ...base, who: "ann", principalKind: "robot" }).reason, "AI_CREDENTIAL_PRINCIPAL_UNSTATED");
  assert.equal(w.m.aiCredentialMint({ ...base, who: "ann", tokenId: " " }).reason, "AI_CREDENTIAL_IDENTITY_TAKEN");
  const ok = w.m.aiCredentialMint({ ...base, who: "ann" });
  assert.equal(ok.ok, true);
  assert.deepEqual([ok.credential.mintedBy, ok.credential.principal, ok.credential.writes],
    ["ann", "member:ann", ["capture", "promote"]]);
  assert.equal(w.m.aiCredentialMint({ ...base, who: "ann" }).reason, "AI_CREDENTIAL_IDENTITY_TAKEN");
  assert.doesNotMatch(JSON.stringify(ok), /a{64}/);
  assert.equal(w.row(`SELECT secret_sha FROM ai_credentials`).secret_sha, SHA("a"));
});

test("R62 an organisation-scoped credential is minted only by an active administrator, the founder included", async () => {
  const w = await world().group("ann");
  const org = { secretSha: SHA("b"), principalKind: "organisation" };
  const r = w.m.aiCredentialMint({ ...org, tokenId: "o1", who: "ann" });
  assert.deepEqual([r.ok, r.reason], [false, "AI_CREDENTIAL_ORG_NOT_ADMIN"]);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM ai_credentials`).n, 0);
  assert.equal(w.m.aiCredentialMint({ ...org, tokenId: "o2", who: "admin" }).credential.principal, "class:ai");
  assert.equal(w.m.aiCredentialMint({ ...org, tokenId: "o3", who: "second" }).ok, true);
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='second'`);
  assert.equal(w.m.aiCredentialMint({ ...org, tokenId: "o4", who: "second" }).reason, "AI_CREDENTIAL_ORG_NOT_ADMIN");
  assert.equal(w.m.aiCredentialMint({ tokenId: "m1", secretSha: SHA("c"), principalKind: "member", who: "ann" }).ok, true,
    "a member-scoped credential stays open to every member");
});

test("R29 a member-scoped credential's principal is its minter; naming another member is refused", async () => {
  const w = await world().group("ann", "bob");
  const r = w.m.aiCredentialMint({ tokenId: "t", secretSha: SHA("d"), principalKind: "member", principalMember: "bob", who: "ann" });
  assert.deepEqual([r.ok, r.reason], [false, "AI_CREDENTIAL_PRINCIPAL_NOT_THE_MINTER"]);
  const same = w.m.aiCredentialMint({ tokenId: "t", secretSha: SHA("d"), principalKind: "member", principalMember: "ann", who: "ann" });
  assert.equal(same.credential.principal, "member:ann");
  const none = w.m.aiCredentialMint({ tokenId: "u", secretSha: SHA("e"), principalKind: "member", who: "bob" });
  assert.equal(none.credential.principal, "member:bob");
});

test("R30 revoke, look and list: machine and unknown refused, twice is already, never a secret, capped", async () => {
  const w = await world().group("ann");
  for (let i = 0; i < 5; i++)
    w.m.aiCredentialMint({ tokenId: `t${i}`, secretSha: SHA(String(i)), principalKind: "member", who: "ann" });
  assert.equal(w.m.aiCredentialRevoke({ who: null, tokenId: "t0" }).reason, "AI_CREDENTIAL_REVOKE_NOT_A_MEMBER");
  assert.equal(w.m.aiCredentialRevoke({ who: "class:ai", tokenId: "t0" }).reason, "AI_CREDENTIAL_REVOKE_NOT_A_MEMBER");
  assert.equal(w.m.aiCredentialRevoke({ who: "ann", tokenId: "nope" }).reason, "AI_CREDENTIAL_UNKNOWN");
  const r1 = w.m.aiCredentialRevoke({ who: "ann", tokenId: "t0" });
  assert.deepEqual([r1.ok, r1.already, r1.credential.revokedBy], [true, false, "ann"]);
  assert.equal(w.m.aiCredentialRevoke({ who: "ann", tokenId: "t0" }).already, true);
  const look = w.m.aiCredentialLook({ secretSha: SHA("1") });
  assert.deepEqual([look.found, look.credential.tokenId], [true, "t1"]);
  assert.deepEqual(w.m.aiCredentialLook({ secretSha: "not-a-hash" }), { found: false, credential: null });
  for (const out of [look, w.m.aiCredentials({})]) assert.doesNotMatch(JSON.stringify(out), /[0-9]{64}/);
  const all = w.m.aiCredentials({});
  assert.deepEqual([all.count, all.limit, all.truncated], [5, 200, false]);
  const two = w.m.aiCredentials({ limit: 2 });
  assert.deepEqual([two.count, two.truncated], [2, true]);
  assert.equal(w.m.aiCredentials({ limit: 10_000 }).limit, 500);
});
