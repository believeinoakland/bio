/* T35 (T35-15): agent-credential expiry (R42, with R12 and R15), the connected subscription as a fact (R43), the
   revocation's new reach (R16), T35's tables (R30), the account's answer (R35), the group key's switches as an
   in-plane read (R37), the words members read (R48, DEC-149), the new rows and the new routes, at the interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { world, sqlOver, PASSWORD, SEAL, SIGNIN_TOKEN } from "./fixture.mjs";
import { AI_CREDENTIAL_CHECKS, ACCOUNT_CHECKS, SIGN_IN_CHECKS, CREDENTIALS_CHECKS, SIGNER_ENROLMENT_CHECKS,
         KEYED_SERVICE_CHECKS, AI_CREDENTIAL_EXPIRY_DAYS, CREDENTIALS_TABLES, Credentials, credentialsOf }
  from "../../../src/credentials/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { word, localize } from "../../../src/setup-words/index.mjs";

const D = 24 * 3600e3;
const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const SHA = (c) => c.repeat(64);
const second = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");
async function at(t, fn) {
  const real = Date.now;
  Date.now = () => t;
  try { return await fn(); } finally { Date.now = real; }
}

test("R42 R12 aiCredentialMint takes an optional expiresInDays, a whole number from 1 to 365, 90 when not given; anything else AI_CREDENTIAL_BAD_EXPIRY (C-29.28), writing nothing; expiresAt that many whole days after the mint", async () => {
  const w = await world().group("ann");
  assert.deepEqual({ ...AI_CREDENTIAL_EXPIRY_DAYS }, { min: 1, max: 365, default: 90 });
  const base = { secretSha: SHA("a"), principalKind: "member", who: "ann", at: "2026-10-01T12:00:00Z" };
  const before = w.snapshot();
  for (const expiresInDays of [0, 366, -1, 1.5, "30", true, Number.NaN, Infinity, [], {}]) {
    const r = w.c.aiCredentialMint({ ...base, tokenId: "t", expiresInDays });
    assert.deepEqual(shape(r), { ok: false, reason: "AI_CREDENTIAL_BAD_EXPIRY", code: "AI_CREDENTIAL_BAD_EXPIRY", check: "C-29.28",
      translation: AI_CREDENTIAL_CHECKS.AI_CREDENTIAL_BAD_EXPIRY.translation }, String(expiresInDays));
    assert.equal(r.detail, word("credentials.index.expiresindays_is_a", { min: "1", max: "365", default: "90" }));
  }
  assert.equal(w.snapshot(), before, "nothing written");
  for (const [tokenId, expiresInDays, want] of [["d", undefined, "2026-12-30T12:00:00Z"], ["n", null, "2026-12-30T12:00:00Z"],
                                                  ["one", 1, "2026-10-02T12:00:00Z"], ["max", 365, "2027-10-01T12:00:00Z"]]) {
    const r = w.c.aiCredentialMint({ ...base, tokenId, expiresInDays });
    assert.deepEqual([r.ok, r.credential.expiresAt, r.credential.expired], [true, want, Date.now() >= Date.parse(want)], tokenId);
  }
  /* the machine and identity refusals still come first */
  assert.equal(w.c.aiCredentialMint({ ...base, tokenId: "x", who: "class:ai", expiresInDays: 0 }).reason, "AI_CREDENTIAL_MINT_NOT_A_MEMBER");
});

test("R42 R15 every answer showing a credential carries expiresAt and expired, true from expiresAt on; aiCredentialLook answers an expired one with expired: true, as it answers a revoked one, for the gate to refuse; a new mint replaces it", async () => {
  const w = await world().group("ann");
  const T = Date.parse("2026-11-01T00:00:00Z");
  await at(T, () => w.c.aiCredentialMint({ tokenId: "t1", secretSha: SHA("1"), principalKind: "member", who: "ann", expiresInDays: 1 }));
  const look = () => w.c.aiCredentialLook({ secretSha: SHA("1") }).credential;
  await at(T + D - 1000, () => {
    assert.deepEqual([look().expiresAt, look().expired, look().revoked], ["2026-11-02T00:00:00Z", false, false]);
    assert.equal(w.c.aiCredentials({}).credentials[0].expired, false);
  });
  await at(T + D, () => {
    assert.deepEqual([look().expired, look().revoked], [true, false], "from expiresAt on");
    assert.equal(w.c.aiCredentials({}).credentials[0].expired, true);
    const r = w.c.aiCredentialRevoke({ who: "ann", tokenId: "t1" });
    assert.deepEqual([r.credential.expiresAt, r.credential.expired, r.credential.revoked], ["2026-11-02T00:00:00Z", true, true]);
    assert.deepEqual([w.c.aiCredentialRevoke({ who: "ann", tokenId: "t1" }).credential.expired], [true]);
    const fresh = w.c.aiCredentialMint({ tokenId: "t2", secretSha: SHA("2"), principalKind: "member", who: "ann" });
    assert.deepEqual([fresh.credential.expired, fresh.credential.expiresAt], [false, second(T + D + 90 * D)]);
  });
  assert.ok(!Object.keys(w.ops()).some((op) => /renew|extend/.test(op)), "never renewed");
});

test("R42 a credential minted before expiry was recorded is given expiresAt 90 days after the migration that records it; a later boot changes nothing", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL, title TEXT)`);
  db.exec(`CREATE TABLE ai_credentials (token_id TEXT PRIMARY KEY, secret_sha TEXT NOT NULL, principal_kind TEXT NOT NULL,
           principal TEXT NOT NULL, task_scope TEXT NOT NULL, scope_writes TEXT NOT NULL, scope_note TEXT NOT NULL,
           minted_by TEXT NOT NULL, minted_at TEXT NOT NULL, revoked_at TEXT, revoked_by TEXT, confined_to TEXT)`);
  db.prepare(`INSERT INTO ai_credentials VALUES ('old', ?, 'member', 'member:ann', 'investigative', '[]', '', 'ann',
              '2025-01-01T00:00:00Z', NULL, NULL, NULL)`).run(SHA("e"));
  const ctx = { storage: { sql: sqlOver(db) } };
  const core = { declarePurge() { return { ok: true }; }, declareTable() { return { ok: true }; }, bundleInfo() { return null; } };
  const m = membershipOf(ctx, { record: core });
  m.migrate();
  const c = credentialsOf(ctx, { record: core, membership: m });
  const T = Date.parse("2026-10-07T10:00:00Z");
  await at(T, () => c.migrate());
  const look = c.aiCredentialLook({ secretSha: SHA("e") }).credential;
  assert.deepEqual([look.expiresAt, look.expired], [second(T + 90 * D), false], "90 days after the migration, not after its mint");
  await at(T + 5 * D, () => c.migrate());
  assert.equal(c.aiCredentialLook({ secretSha: SHA("e") }).credential.expiresAt, second(T + 90 * D));
});

test("R16 a member's revocation also spends their unspent recovery codes and clears their connected subscription, in the same act; no one else's", async () => {
  const w = await world().group("ann");
  const p = await w.m.memberAdd({ memberId: "third", cover: "c3", role: "admin", by: "admin" });
  const e = await w.m.adminEndorse({ memberId: "third", by: "second" });
  assert.equal(p.reason, "CONSENSUS_REQUIRED");
  await w.m.enroll({ invite: e.invite, handle: "third", password: PASSWORD("third") });
  const codes = w.c.recoveryCodesIssue({ by: "third" }).codes;
  w.c.recoveryCodesIssue({ by: "second" });
  for (const id of ["third", "ann"]) await w.signin(id);
  const r = await (async () => {
    for (const by of ["admin", "second"]) { const v = w.m.adminRemove({ memberId: "third", by, reason: "r" }); if (v.ok) return v; }
    return null;
  })();
  assert.equal(r?.ok, true);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM recovery_codes WHERE role='member:third' AND spent_at IS NULL`).n, 0);
  assert.equal(w.c.recoveryCodesState({ by: "second" }).remaining, 10, "no one else's");
  assert.deepEqual(w.rows(`SELECT member_id FROM subscription_connections`).map((x) => x.member_id), ["ann"]);
  w.m.memberSet({ memberId: "third", status: "active", by: "admin" });
  assert.equal((await w.c.recover({ handle: "third", code: codes[0], password: "new-passphrase-1" })).reason, "RECOVERY_REFUSED",
    "spent for good, whatever the member's later standing");
});

test("R30 T35's tables are declared through declareTable, each never exported and exempt from purge: the window, the tally with its waiting places and key, the recovery codes and recoveries the group's; (T48) the connected subscriptions are ai-accounts' (its R28), no longer declared here", () => {
  const w = world();
  const cls = (t) => w.core.declared.get(t)?.classes;
  for (const t of ["signin_window", "security_counts", "security_pending", "security_key", "recovery_codes", "recoveries"])
    assert.deepEqual([cls(t).module ?? "credentials", cls(t).purge, cls(t).export, cls(t).sight, cls(t).expunge],
      ["credentials", "exempt", "never", "group", "none"], t);
  assert.equal(w.core.declared.get("subscription_connections").module, "ai-accounts");
  assert.ok(CREDENTIALS_TABLES.every((t) => t.export !== "yes" || t.name === "signers"));
});

test("R3 R38 R39 R43 R44 R45 R46 R47 R49 R53 T35's rows, T36's R49 row and T37's R3 and R53 rows: the new refusals take the next free numbers of C-29 and C-96, each `where` naming its one site, frozen; one id per row across the module", () => {
  const W = (fn, region) => `src/credentials/index.mjs ${fn} > ${region}`;
  const want = {
    SIGN_IN_PAUSED: ["C-96.39", W("#paused", "is-sign-in-window")],
    NOT_SIGNED_IN: ["C-96.40", W("#notSignedIn", "is-session-live")],
    RECOVERY_REFUSED: ["C-96.41", W("#recoveryRefused", "is-recovery-code")],
    SECURITY_KIND_UNKNOWN: ["C-96.42", W("securityCount", "is-security-kind")],
    SECURITY_PERIOD_INVALID: ["C-96.43", W("#periodRefusal", "is-security-period")],   /* T36: one site for R45 and R49 */
    SECURITY_COUNTS_UNREADABLE: ["C-96.44", W("securityTotals", "is-security-counts-read")],   /* T36: R49 */
    MACHINE_CANNOT_SET_PASSWORD: ["C-96.45", W("passwordChange", "is-password-change-own")],   /* T37: R3 */
    CURRENT_PASSWORD_WRONG: ["C-96.46", W("passwordChange", "is-current-password")],   /* T37: R3 */
    RECOVERY_CODES_NOT_A_MEMBER: ["C-96.53", W("recoveryCodesIssue", "is-recovery-codes-member")],   /* T47: R68, R71 (5) */
  };
  assert.ok(Object.isFrozen(SIGN_IN_CHECKS));
  assert.deepEqual(Object.keys(SIGN_IN_CHECKS), Object.keys(want));
  for (const [code, r] of Object.entries(SIGN_IN_CHECKS)) {
    assert.ok(Object.isFrozen(r));
    assert.deepEqual(Object.keys(r).sort(), ["check", "translation", "where"]);
    assert.deepEqual([r.check, r.where], want[code], code);
    assert.match(r.translation, /\.$/);
  }
  assert.deepEqual([AI_CREDENTIAL_CHECKS.AI_CREDENTIAL_BAD_EXPIRY.check, ACCOUNT_CHECKS.SUBSCRIPTION_LOGIN_REFUSED.check], ["C-29.28", "C-29.29"]);
  assert.deepEqual([AI_CREDENTIAL_CHECKS.AI_CREDENTIAL_NO_SECRET.check, AI_CREDENTIAL_CHECKS.AI_CREDENTIAL_NO_SECRET.where],
    ["C-29.33", W("aiCredentialMint", "is-ai-credential-digest")], "T37: R53");
  const ids = [SIGNER_ENROLMENT_CHECKS, AI_CREDENTIAL_CHECKS, CREDENTIALS_CHECKS, ACCOUNT_CHECKS, KEYED_SERVICE_CHECKS, SIGN_IN_CHECKS]
    .flatMap((f) => Object.values(f).map((r) => r.check));
  assert.equal(new Set(ids).size, ids.length);
});

test("R1 R4 R39 R45 R46 R47 R43 the T35 routes: `source` and `country`, `by` and `session` are the control plane's stamps from the query, over the body", async () => {
  const w = await world().group("ann");
  /* the window counts the query's source, never the body's */
  for (let i = 0; i < 10; i++)
    assert.equal((await w.ops("source=stamped&country=NL", { handle: `r${i}`, password: "wrong-passphrase", source: `body-${i}` }).login()).reason,
      "SIGN_IN_REFUSED");
  assert.equal((await w.ops("source=stamped", { handle: "ann", password: PASSWORD("ann"), source: "elsewhere" }).login()).reason,
    "SIGN_IN_PAUSED");
  assert.equal((await w.ops("source=stamped", { password: "x".repeat(12), source: "elsewhere" }).claim()).reason, "SIGN_IN_PAUSED");
  assert.equal((await w.ops("source=stamped", { handle: "second", code: "x", password: "x".repeat(12) }).recover()).reason, "SIGN_IN_PAUSED");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM security_pending WHERE country='NL'`).n, 10, "the query's country");
  const tok = (await w.ops("source=other", { handle: "ann", password: PASSWORD("ann") }).login()).token;
  const tok2 = (await w.ops("source=other", { handle: "ann", password: PASSWORD("ann") }).login()).token;
  assert.deepEqual(w.ops(`session=${tok}`, { token: tok2 }).signout(), { ok: true, ended: 1 });
  assert.equal(w.c.session(tok), null);
  assert.deepEqual(w.ops(`session=${tok2}`).signouteverywhere(), { ok: true, ended: 1 });
  const now = Date.now();
  assert.equal(w.ops(`by=ann&from=${now - 3600e3}&to=${now}`, { by: "admin" }).securitymap().reason, "NOT_AN_ADMIN");
  assert.equal(w.ops(`by=second&from=${now - 3600e3}&to=${now}`).securitymap().ok, true);
  assert.equal(w.ops("by=second", { from: now - 3600e3, to: now }).securitymap().ok, true, "the period from the body");
  /* (T47; R68) the stamped member's own codes, never the body's */
  const anns = w.ops("by=ann", { by: "admin" }).recoverycodesissue();
  assert.equal(anns.codes.length, 10);
  assert.equal(w.c.recoveryCodesState({ by: "ann" }).remaining, 10);
  assert.equal(w.c.recoveryCodesState({ by: "admin" }).remaining, 0);
  const issued = w.ops("by=second", { by: "ann" }).recoverycodesissue();
  assert.equal(issued.codes.length, 10);
  assert.deepEqual(w.ops("by=second").recoverycodesstate(), { ok: true, held: true, remaining: 10, issuedAt: issued.issuedAt });
  assert.equal((await w.ops("source=r", { handle: "second", code: issued.codes[0], password: "new-passphrase-1" }).recover()).ok, true);
});

test("R48 the 17 sweep rows (DEC-149): each member-facing string says \"your group's Civicsmith\" where it said this instance, this copy or its seal secret, as answered at the interface", async () => {
  const w = await world().group("ann", "dee");
  await w.m.memberAdd({ memberId: "cal", cover: "c", by: "admin" });
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const has = (text, s) => assert.ok(String(text).includes(s), `${s}\n  in: ${text}`);
  /* checks.mjs :21, :27 (C-63.1, C-63.2) */
  const cal = w.c.signerAdd({ keyB64: "AAAAk", memberId: "cal", by: "admin" });
  has(cal.translation, word("refusal.SIGNER_MEMBER_NOT_ENROLLED"));
  has(w.c.signerAdd({ keyB64: "AAAAk", memberId: "dee", by: "admin" }).translation, word("refusal.SIGNER_MEMBER_NOT_ACTIVE"));
  /* index.mjs :342 (the bar's detail) */
  has(cal.detail, localize("credentials.index.memberid_has_not_enrolled_status", "{memberId} has not enrolled: status '{status}', no handle chosen. op=ratify weighs a signature against the member's own standing, so a key registered now would sit on the roster as one your team's Civicsmith would refuse. Nothing was written.", { memberId: cal.memberId, status: cal.member_status }));
  /* :39, :53, :66 (C-29.1, C-29.3, C-29.5) and index :588, :631 */
  has(w.c.aiCredentialMint({ who: "class:ai" }).translation, localize("credentials.checks.only_a_named_person_signed", "Only a named person signed in to your team's Civicsmith can create an agent credential. Deciding what an automated worker is allowed to reach is a judgement somebody has to be accountable for, so an automated worker cannot make it — not even about itself."));
  w.c.aiCredentialMint({ tokenId: "t", secretSha: SHA("a"), principalKind: "member", who: "ann" });
  const taken = w.c.aiCredentialMint({ tokenId: "t", secretSha: SHA("b"), principalKind: "member", who: "ann" });
  has(taken.translation, word("refusal.AI_CREDENTIAL_IDENTITY_TAKEN"));
  has(taken.detail, localize("credentials.index.id_already_names_a_credential", "'{id}' already names a credential in your team's Civicsmith. Acts cite the IDENTITY, so rebinding it would re-attribute work already done.", { id: "t" }));
  const unknown = w.c.aiCredentialRevoke({ who: "ann", tokenId: "nope" });
  has(unknown.translation, word("refusal.AI_CREDENTIAL_UNKNOWN"));
  has(unknown.detail, localize("credentials.index.no_credential_in_your_teams", "no credential in your team's Civicsmith is called '{v1}'. Nothing was withdrawn, and being told so is the point: believing an authority is gone when it is not is the worse of the two outcomes.", { v1: "nope" }));
  /* :153, :154 (C-29.22) and index :794 */
  const bare = await world({ sealSecret: null }).group("ann");
  const unsealed = await bare.c.accounts.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk", by: "ann" });
  /* (T50; plan rule 6) ai-accounts' rows are read by key, never quoted: the row's translation is the word itself */
  assert.equal(unsealed.translation, word("refusal.ACCOUNT_SEAL_UNAVAILABLE"));
  has(unsealed.detail, localize("ai-accounts.index.your_teams_civicsmith_has_no", "your team's Civicsmith has no seal secret set, so a key cannot be kept sealed or read. Nothing was stored or read."));
  /* index :822 */
  has((await w.c.accounts.accountReferenceSet({ member: "ann", kind: "oauth", secret: "sk", by: "ann" })).detail,
    "the kind your team's Civicsmith holds is apikey; a Claude subscription is connected through Claude Code's own sign-in");
  /* index :231, :237 (R4's SIGN_IN_REFUSED detail), re-worded to need no name and address no one (K2089; D-57) */
  const refused = await w.c.login({ handle: "nobody", password: "wrong-passphrase", source: "s" });
  assert.equal(refused.detail, localize("credentials.index.sign_in_refused", "no session was issued and nothing was written. Either no active credential is held under that role — a role that was never registered and one whose membership is no longer active are the same answer here — or a credential is stored and the password supplied does not derive its stored hash. The password itself is never kept, only a salted derivation of it, so that is the only comparison there is to make. Which of those happened, the record does not say: it is one answer deliberately, so that a refusal cannot be used to find out which roles hold a credential."));
  assert.doesNotMatch(refused.detail, /\b(?:you|your|yours)\b/i, "D-57: it addresses no one");
  /* index :880, :1060, :1243: a sealed key that no longer opens */
  await w.c.accounts.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  await w.c.accounts.groupKeySet({ key: "sk-group", by: "admin" });
  w.c.accounts.groupKeySwitch({ on: true, by: "admin" });
  w.c.accounts.groupKeyNoticeSeen({ member: "dee", by: "dee" });
  await w.c.keyedServiceSet({ service: "courtlistener", key: "cl", by: "admin" });
  w.c.keyedServiceSwitch({ service: "courtlistener", on: true, by: "admin" });
  const other = credentialsOf({ storage: { sql: w.sql } }, { record: w.core, membership: w.m, sealSecret: `${SEAL}-changed` });
  has((await other.accounts.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } })).detail,
    localize("ai-accounts.index.the_reference_does_not_open", "the reference does not open under the seal secret of your team's Civicsmith, which has changed; the member connects their account again. Nothing was used."));
  w.c.accounts.groupKeyNoticeSeen({ member: "second", by: "second" });
  has((await other.accounts.accountFor({ member: "second", act: { kind: "ask", member: "second" } })).detail,
    localize("ai-accounts.index.the_teams_key_does_not", "the team's key does not open under the seal secret of your team's Civicsmith, which has changed; an administrator sets it again. Nothing was used."));
  has((await other.keyedServiceFor({ service: "courtlistener" })).detail,
    localize("ai-accounts.index.the_key_does_not_open", "the key does not open under the seal secret of your team's Civicsmith, which has changed; an administrator sets it again. Nothing was used."));
});

test("R48 (T36: R29, R35, R49, R51 included) no member- or founder-facing string this module answers calls the group's Civicsmith a copy, an instance, a plane or a server, nor its seal secret bound: every row's translation and every refusal's detail and remedy", async () => {
  const w = await world().group("ann", "dee");
  await w.m.memberAdd({ memberId: "cal", cover: "c", by: "admin" });
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const said = [];
  const keep = async (p) => { said.push(await p); };
  for (const f of [SIGNER_ENROLMENT_CHECKS, AI_CREDENTIAL_CHECKS, CREDENTIALS_CHECKS, ACCOUNT_CHECKS, KEYED_SERVICE_CHECKS, SIGN_IN_CHECKS])
    for (const r of Object.values(f)) said.push({ translation: r.translation });
  said.push({ detail: Credentials.LOGIN_REFUSAL_DETAIL.SIGN_IN_REFUSED });
  const bare = await world({ sealSecret: null }).group("ann");
  for (const p of [
    w.c.signerAdd({ keyB64: "x", memberId: "ann", by: "admin" }), w.c.signerAdd({ keyB64: "AAAAk", memberId: "cal", by: "admin" }),
    w.c.signerAdd({ keyB64: "AAAAk", memberId: "dee", by: "admin" }), w.c.signerRegisterOwn({ keyB64: "AAAAk", by: "class:ai" }),
    w.c.aiCredentialMint({ who: "class:ai" }), w.c.aiCredentialMint({ who: "ann", principalKind: "x" }),
    w.c.aiCredentialMint({ who: "ann", principalKind: "member", principalMember: "dee", tokenId: "t" }),
    w.c.aiCredentialMint({ who: "ann", principalKind: "organisation", tokenId: "t" }),
    w.c.aiCredentialMint({ who: "ann", principalKind: "member", tokenId: "t", expiresInDays: 0 }),
    w.c.aiCredentialRevoke({ who: "class:ai" }), w.c.aiCredentialRevoke({ who: "ann", tokenId: "x" }),
    w.c.accounts.accountReferenceSet({ member: "ann", kind: "x", secret: "s", by: "ann" }), w.c.accounts.accountReferenceSet({ member: "ann", by: null }),
    w.c.accounts.accountReferenceSet({ member: "ann", by: "dee" }), w.c.accounts.accountReferenceSet({ member: "dee", by: "dee" }),
    w.c.accounts.accountReferenceSet({ member: "ann", kind: "apikey", secret: "", by: "ann" }), w.c.accounts.accountUsesSet({ owner: "member:ann", switch: "x", by: "ann" }),
    w.c.accounts.accountReferenceFor({ member: "ann", act: null }), w.c.accounts.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }),
    w.c.accounts.groupKeySet({ key: "k", by: "ann" }), w.c.accounts.groupKeyState({ viewer: null }),
    w.c.aiGrantAdmit({ token: "x" }), w.c.aiGrantMintStanding({ member: "ann", question: "q" }),
    w.c.keyedServiceFor({ service: "x" }), w.c.keyedServiceFor({ service: "courtlistener" }), w.c.keyedServiceSet({ service: "courtlistener", key: "", by: "admin" }),
    w.c.accounts.subscriptionConnected({ member: "ann", token: "t" }), w.c.accounts.subscriptionConnected({ member: "dee" }),
    w.c.securityCount({ kind: "x" }), w.c.securityMap({ from: "x", to: "y", by: "admin" }), w.c.securityMap({ by: "ann" }),
    w.c.signOut({ token: "x" }), w.c.recoveryCodesIssue({ by: "ann" }),
    w.c.recover({ handle: "ann", code: "x", password: "new-passphrase-1", source: "a" }),
    w.c.login({ handle: "x", password: "wrong-passphrase", source: "b" }),
    bare.c.accounts.accountReferenceSet({ member: "ann", kind: "apikey", secret: "s", by: "ann" }),
    /* T37's refusals: R3's three of its own, R53's mint with no digest */
    w.c.passwordChange({ by: "class:admin" }), w.c.passwordChange({ by: "ann", session: "none" }),
    w.c.aiCredentialMint({ who: "ann", tokenId: "nd", principalKind: "member" }),
    /* T36's refusals: AI_KEEP_AWAY_NO_REASON, a security tool's empty set, the totals' period and failure */
    w.c.accounts.aiKeepAwaySet({ on: true, by: "admin" }), w.c.keyedServiceSet({ service: "security:t1", key: { a: "" }, by: "admin" }),
    w.c.keyedServiceSet({ service: "security:", key: "k", by: "admin" }), w.c.securityTotals({ from: "x", to: "y" }),
    w.c.securityTotals.call(Object.create(Object.getPrototypeOf(w.c)), { from: 0, to: 1 })]) await keep(p);
  /* AI_KEPT_AWAY, read and unread */
  w.c.accounts.aiKeepAwaySet({ on: true, reason: "r", by: "admin" });
  await keep(w.c.accounts.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }));
  w.sql.exec(`DROP TABLE ai_keep_away`);
  await keep(w.c.accounts.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }));
  for (let i = 0; i < 10; i++) await w.c.login({ handle: "y", password: "wrong", source: `p${i}` });
  await keep(w.c.login({ handle: "y", password: "wrong", source: "p" }));
  let n = 0;
  /* membership's NOT_AN_ADMIN (C-96.1), answered through its `notAnAdmin`, is membership's string (its R112) */
  for (const a of said.filter((x) => x?.check !== "C-96.1"))
    for (const k of ["translation", "detail", "remedy", "message", "stated"]) {
      if (typeof a?.[k] !== "string") continue;
      n++;
      assert.doesNotMatch(a[k], /\b(?:instance|copy|copies|plane|server)\b/i, `${k}: ${a[k]}`);
      assert.doesNotMatch(a[k], /seal secret bound|secret is bound|no seal secret bound/i, `${k}: ${a[k]}`);
    }
  assert.ok(n > 60, `strings read: ${n}`);
});
