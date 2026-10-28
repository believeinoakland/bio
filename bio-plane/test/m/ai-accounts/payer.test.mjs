/* ai-accounts R26, R45, R60, R65, R66, R67, R68, R74, R75, R76 at the interface: who paid for a call (the payer flag and the
   stop it raises), the Worker's three ops, a credential that failed, the readiness summary, the credits stop and a dated terms
   change as notices. Every id is tested with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SECRET } from "./fixture.mjs";
import { PLANS as P, ENTRIES as E, setPendingTerms } from "./catalogue.mjs";
import { shape, refusal, ask, act, projectWorld, on, leaks } from "./helpers.mjs";

const WORKER = "token:agent-worker";
const seen = (w, ...members) => { for (const m of members) w.a.recipientNoticeSeen({ member: m, provider: P.provider, host: "api.anthropic.com", by: m }); };

/* a team gateway account whose key is held, switched on, with the port registered */
async function gatewayWorld() {
  const w = await projectWorld();
  seen(w, "ann", "bob");
  w.a.registerGatewayStore("root", { create: async () => "gw-1", put: async () => true, exists: async () => true });
  const t = await w.a.accountSet({ owner: "group", provider: P.provider, plan: P.teamApi, means: "gateway", by: "admin" });
  assert.equal((await w.a.gatewayKeyEnter({ account_id: t.account_id, key: "gw-key-sentinel-0123456789", by: "admin" })).ok, true);
  w.a.accountSwitch({ account_id: t.account_id, on: true, by: "admin" });
  return { w, t };
}
const rec = (more = {}) => ({ gateway_id: "gw-1", own_key_served: true, platform_credits_used: false, ...more });

test("R45: gatewayServedCheck answers {ok} only when the record's id is the account's, own_key_served is true and platform_credits_used is false; otherwise (credits paid, another gateway's record, or a record null, missing or unreadable) the account is flagged with its cause (credits, other_gateway, log_unreadable), PAYER_NOT_VERIFIED refuses every later call until cleared, the flag is a change (R16); control: a record that verifies flags nothing, a flagged account is flagged once", async () => {
  const { w, t } = await gatewayWorld();
  assert.deepEqual(w.a.gatewayServedCheck({ account_id: t.account_id, record: rec() }), { ok: true });
  assert.equal(w.a.accountState({ account_id: t.account_id, viewer: "admin" }).flagged, false);
  assert.equal((await w.a.accountFor({ member: "bob", act: ask("bob") })).ok, true);
  for (const [record, cause] of [[rec({ platform_credits_used: true }), "credits"], [rec({ gateway_id: "gw-other" }), "other_gateway"],
                                 [rec({ own_key_served: null, platform_credits_used: null }), "log_unreadable"], [null, "log_unreadable"], [{}, "log_unreadable"]]) {
    const { w: x, t: y } = await gatewayWorld();
    assert.deepEqual(x.a.gatewayServedCheck({ account_id: y.account_id, record }), { flagged: true, cause }, JSON.stringify(record));
    const st = x.a.accountState({ account_id: y.account_id, viewer: "admin" });
    assert.deepEqual([st.flagged, st.flag_cause], [true, cause]);
    const r = await x.a.accountFor({ member: "bob", act: ask("bob") });
    assert.deepEqual([shape(r), r.cause], [refusal("PAYER_NOT_VERIFIED"), cause], "every later call is refused");
    assert.equal(x.a.accountHistory({ owner: "group", viewer: "admin" }).changes.some((c) => c.change === "payer_flag" && c.cause === cause), true, "R16");
  }
  w.a.gatewayServedCheck({ account_id: t.account_id, record: rec({ platform_credits_used: true }) });
  const n = w.rows(`SELECT COUNT(*) AS n FROM account_changes WHERE change='payer_flag'`)[0].n;
  assert.deepEqual(w.a.gatewayServedCheck({ account_id: t.account_id, record: rec({ gateway_id: "gw-other" }) }), { flagged: true, cause: "credits" });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM account_changes WHERE change='payer_flag'`)[0].n, n, "a later flagged call adds none");
  assert.equal(w.a.gatewayServedCheck({ account_id: "acct-none", record: rec() }).reason, "NOT_YOUR_ACCOUNT");
  const s = await w.team({ secret: SECRET("sealed-team") });
  assert.equal(w.a.gatewayServedCheck({ account_id: s.account_id, record: rec() }).reason, "NOT_YOUR_ACCOUNT", "only a gateway account has a gateway's record");
});

test("R68 R75: aiCreditsClear clears the payer flag whatever its cause: by an active administrator for a team account (NOT_AN_ADMIN), a project owner for a project's, the member for their own (NOT_YOUR_ACCOUNT otherwise); a machine credential MACHINE_CANNOT_HOLD_ACCOUNT; recorded with name and time, no reason asked; in the same act creditsStopsOpen stops answering the account and the next call is served; an unflagged account answers {ok, was_flagged: false} and records nothing", async () => {
  const { w, t } = await gatewayWorld();
  const at = () => w.a.creditsStopsOpen({ viewer: "admin" });
  assert.deepEqual(at(), [], "an unflagged account has no entry");
  w.a.gatewayServedCheck({ account_id: t.account_id, record: rec({ platform_credits_used: true }) });
  const [item] = at();
  assert.deepEqual(Object.keys(item).sort(), ["account_id", "cause", "flagged_at", "key"]);
  assert.deepEqual([item.account_id, item.cause], [t.account_id, "credits"]);
  assert.deepEqual(w.a.creditsStopsOpen({ viewer: "second" }), [item], "every administrator");
  assert.deepEqual(w.a.creditsStopsOpen({ viewer: "admin", at: "2030-01-01T00:00:00Z" }), [item], "the same key on every read");
  w.a.gatewayServedCheck({ account_id: t.account_id, record: rec({ gateway_id: "gw-x" }) });
  assert.deepEqual(at(), [item], "a second flagged call adds none and keeps the key");
  for (const viewer of ["ann", "bob", "class:ai", null]) assert.deepEqual(w.a.creditsStopsOpen({ viewer }), [], `${String(viewer)} may not clear it`);
  const before = w.snapshot();
  for (const by of ["ann", "bob"]) assert.equal(w.a.aiCreditsClear({ account_id: t.account_id, by }).reason, "NOT_AN_ADMIN", by);
  for (const by of [null, "class:ai", "token:ai"]) assert.equal(w.a.aiCreditsClear({ account_id: t.account_id, by }).reason, "MACHINE_CANNOT_HOLD_ACCOUNT", String(by));
  assert.equal(w.a.aiCreditsClear({ account_id: "acct-none", by: "admin" }).reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w.snapshot(), before, "the flag and the item stand");
  assert.deepEqual(w.a.aiCreditsClear({ account_id: t.account_id, by: "second" }), { ok: true, account_id: t.account_id, was_flagged: true });
  assert.deepEqual(at(), [], "the Queue item closes in the same act");
  assert.equal((await w.a.accountFor({ member: "bob", act: ask("bob") })).ok, true, "the next call is served");
  const cleared = w.a.accountHistory({ owner: "group", viewer: "admin" }).changes.filter((c) => c.change === "payer_cleared");
  assert.deepEqual(cleared.map((c) => [c.by, c.cause]), [["second", "credits"]], "recorded with name and time, no reason");
  const n = w.snapshot();
  assert.deepEqual(w.a.aiCreditsClear({ account_id: t.account_id, by: "admin" }), { ok: true, account_id: t.account_id, was_flagged: false });
  assert.equal(w.snapshot(), n, "records nothing");
  /* the next call that fails R45 flags the account again; removing the account ends the item */
  w.a.gatewayServedCheck({ account_id: t.account_id, record: rec({ platform_credits_used: true }) });
  assert.equal(at().length, 1);
  w.a.accountRemove({ account_id: t.account_id, by: "admin" });
  assert.deepEqual(at(), []);
  /* a project's account: its owners; a member's own: the member */
  const w2 = await projectWorld();
  w2.a.registerGatewayStore("root", { create: async () => "gw-p", put: async () => true, exists: async () => true });
  const p = await w2.a.accountSet({ owner: "project:P", provider: P.provider, plan: P.teamApi, means: "gateway", by: "ann" });
  w2.a.gatewayServedCheck({ account_id: p.account_id, record: rec({ gateway_id: "gw-p", platform_credits_used: true }) });
  assert.deepEqual(w2.a.creditsStopsOpen({ viewer: "ann" }).map((x) => x.account_id), [p.account_id]);
  assert.deepEqual([w2.a.creditsStopsOpen({ viewer: "bob" }), w2.a.creditsStopsOpen({ viewer: "admin" })], [[], []]);
  assert.equal(w2.a.aiCreditsClear({ account_id: p.account_id, by: "bob" }).reason, "PROJECT_ACT_NOT_THE_OWNER");
  assert.equal(w2.a.aiCreditsClear({ account_id: p.account_id, by: "ann" }).was_flagged, true);
  const m = await w2.a.accountSet({ owner: "member:cy", provider: P.provider, plan: P.teamApi, means: "gateway", by: "cy" });
  w2.a.gatewayServedCheck({ account_id: m.account_id, record: rec({ gateway_id: "gw-p", platform_credits_used: true }) });
  assert.equal(w2.a.aiCreditsClear({ account_id: m.account_id, by: "admin" }).reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w2.a.aiCreditsClear({ account_id: m.account_id, by: "cy" }).was_flagged, true);
});

test("R65 R66 R67: the Worker's ops: `aicredential` answers the credential for one call (the secret, the pointer, the gateway id, nothing) from the act's own account only; `aigatewayserved` hands R45 a record and receives {ok} or {flagged}; `aicredentialfailed` reports R60; each is served to the agent Worker's principal alone (AI_CREDENTIAL_NOT_SERVED to any other, a member or an administrator included, writing nothing) and an account that is not the act's own is NOT_YOUR_ACCOUNT", async () => {
  const { w, t } = await gatewayWorld();
  const mine = await on(w, w.own("ann"));
  const refOnly = await on(w, w.a.accountSet({ owner: "member:cy", provider: P.provider, plan: P.memberApi, means: "reference", reference: { store: "vault", locator: "kv/cy" }, by: "cy" }));
  seen(w, "cy");
  const call = (op, body, by = WORKER) => w.ops(`by=${by}`, body)[op]();
  const cred = await call("aicredential", { account_id: mine.account_id, act: ask("ann") });
  assert.deepEqual(cred, { ok: true, account_id: mine.account_id, means: "sealed", secret: SECRET("ann") });
  assert.deepEqual(await call("aicredential", { account_id: refOnly.account_id, act: ask("cy") }), { ok: true, account_id: refOnly.account_id, means: "reference", reference: { store: "vault", locator: "kv/cy" } });
  assert.deepEqual(await call("aicredential", { account_id: t.account_id, act: ask("bob") }), { ok: true, account_id: t.account_id, means: "gateway", gateway_id: "gw-1" });
  assert.equal((await call("aicredential", { account_id: t.account_id, act: ask("bob") }, "class:agent-worker")).ok, true, "the other spelling of the Worker's stamp");
  const before = w.snapshot();
  for (const by of ["ann", "admin", "second", "class:ai", "token:other", "token:agent-worker-2", "", "null"])
    assert.deepEqual(shape(await call("aicredential", { account_id: mine.account_id, act: ask("ann") }, by)), refusal("AI_CREDENTIAL_NOT_SERVED"), by);
  assert.equal((await w.ops("", { account_id: mine.account_id, act: ask("ann") }).aicredential()).reason, "AI_CREDENTIAL_NOT_SERVED");
  assert.equal((await call("aicredential", { account_id: t.account_id, act: ask("ann") })).reason !== undefined, true, "ann's act is served by her own account, not the team's");
  assert.equal((await call("aicredential", { account_id: t.account_id, act: ask("ann") })).reason, "NOT_YOUR_ACCOUNT");
  assert.equal((await call("aicredential", { account_id: "acct-none", act: ask("ann") })).reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w.snapshot(), before, "nothing written");
  /* R66 */
  assert.deepEqual(call("aigatewayserved", { account_id: t.account_id, record: rec() }), { ok: true });
  for (const by of ["bob", "admin"]) assert.deepEqual(shape(call("aigatewayserved", { account_id: t.account_id, record: rec({ platform_credits_used: true }) }, by)), refusal("AI_CREDENTIAL_NOT_SERVED"), by);
  assert.equal(w.a.accountState({ account_id: t.account_id, viewer: "admin" }).flagged, false, "a member principal flags nothing");
  assert.equal(call("aigatewayserved", { account_id: t.account_id, record: rec(), act: ask("ann") }).reason, "NOT_YOUR_ACCOUNT");
  assert.deepEqual(call("aigatewayserved", { account_id: t.account_id, record: rec({ platform_credits_used: true }), act: ask("bob") }), { flagged: true, cause: "credits" });
  assert.equal(w.a.creditsStopsOpen({ viewer: "admin" }).length, 1, "R75: answered to its administrators once");
  /* R67 */
  const fresh = await projectWorld();
  const told = [];
  fresh.a.onAccountCleared("credentials", (n) => told.push(n));
  const r = await on(fresh, fresh.a.accountSet({ owner: "member:cy", provider: P.provider, plan: P.memberApi, means: "reference", reference: { store: "vault", locator: "gone" }, by: "cy" }));
  await on(fresh, fresh.team());
  seen(fresh, "bob", "cy");
  const f = (op, body, by = WORKER) => fresh.ops(`by=${by}`, body)[op]();
  assert.equal(f("aicredentialfailed", { account_id: r.account_id, why: "unresolved" }, "cy").reason, "AI_CREDENTIAL_NOT_SERVED");
  assert.equal(told.length, 0, "a member principal changes nothing");
  assert.equal(f("aicredentialfailed", { account_id: r.account_id, why: "unresolved", act: ask("bob") }).reason, "NOT_YOUR_ACCOUNT", "not the act's own account");
  assert.deepEqual(f("aicredentialfailed", { account_id: r.account_id, why: "unresolved", act: ask("cy") }), { ok: true, dropped: true });
  assert.deepEqual(told.map((n) => [n.why, n.account_id, n.member, n.means, n.by, n.other_account_serves]), [["unresolved", r.account_id, "cy", "reference", null, false]]);
  assert.equal(fresh.a.accountState({ account_id: r.account_id, viewer: "cy" }).held, false);
});

test("R60 R26: accountCredentialFailed records the change (R16), drops an issued token, marks the account held: false and tells the listeners once (`refused` or `unresolved`); a reference resolving to nothing tells `credentials` once; each `why` calls the listener once with {account_id, owner, member, means, by, why, other_account_serves}; control: an account with a good credential is not touched by a failure for another, a failure for an account with nothing held calls none, a throwing listener changes nothing", async () => {
  const w = await projectWorld();
  const told = [];
  const order = [];
  assert.equal(w.a.onAccountCleared("credentials", (n) => told.push(n)).ok, true);
  assert.equal(w.a.onAccountCleared("credentials", () => {}).code, "LISTENER_DECLARED");
  assert.equal(w.a.onAccountCleared("bad", "not a function").code, "LISTENER_MALFORMED");
  w.a.onAccountCleared("thrower", () => { order.push("t"); throw new Error("no"); });
  const ref = await w.a.accountSet({ owner: "member:ann", provider: P.provider, plan: P.memberApi, means: "reference", reference: { store: "v", locator: "a" }, by: "ann" });
  const good = await w.own("ann");
  const tok = await w.a.accountSet({ owner: "member:bob", provider: P.provider, plan: P.subscription, means: "issued", secret: "sk-ant-oat01-sentinel-bob-0123456789", by: "bob" });
  assert.deepEqual(w.a.accountCredentialFailed({ account_id: ref.account_id, why: "unresolved" }), { ok: true, dropped: true });
  assert.deepEqual(told.map((n) => [n.why, n.means, n.owner, n.member, n.other_account_serves]), [["unresolved", "reference", "member:ann", "ann", false]]);
  w.a.accountSwitch({ account_id: good.account_id, on: true, by: "ann" });
  assert.deepEqual(w.a.accountCredentialFailed({ account_id: good.account_id, why: "refused" }), { ok: true, dropped: true });
  assert.equal(w.a.accountState({ account_id: ref.account_id, viewer: "ann" }).held, false);
  assert.equal(told.length, 2);
  assert.equal(order.length, 2, "a throwing listener changes nothing of the act");
  assert.deepEqual(w.a.accountCredentialFailed({ account_id: ref.account_id, why: "refused" }), { ok: true, dropped: false }, "nothing held: calls none");
  assert.equal(told.length, 2);
  assert.deepEqual(w.a.accountCredentialFailed({ account_id: "acct-none", why: "refused" }), { ok: true, dropped: false });
  assert.deepEqual(w.a.accountCredentialFailed({ account_id: tok.account_id, why: "bogus" }), { ok: true, dropped: false });
  assert.deepEqual(w.a.accountCredentialFailed({ account_id: tok.account_id, why: "refused" }), { ok: true, dropped: true });
  assert.equal(w.row(`SELECT sealed FROM ai_accounts WHERE account_id=?`, tok.account_id).sealed, null, "an issued token is dropped");
  assert.equal(w.a.accountHistory({ owner: "member:bob", viewer: "bob" }).changes.some((c) => c.change === "account_removed" && c.why === "refused" && c.by === null), true, "R16");
  const other = told.filter((n) => n.account_id === tok.account_id);
  assert.deepEqual([other.length, other[0].why, other[0].other_account_serves], [1, "refused", false]);
  assert.equal(w.rows(`SELECT held FROM ai_accounts WHERE account_id=?`, good.account_id)[0].held, 0, "its own failure");
  const before = told.length;
  const clean = await w.own("cy");
  w.a.accountCredentialFailed({ account_id: ref.account_id, why: "unresolved" });
  assert.equal(w.rows(`SELECT held FROM ai_accounts WHERE account_id=?`, clean.account_id)[0].held, 1, "an account with a good credential is untouched");
  assert.equal(told.length, before);
  /* other_account_serves: a second held account of the owner is serving */
  const twin = await on(w, w.own("cy"));
  w.a.accountSwitch({ account_id: clean.account_id, on: true, by: "cy" });
  w.a.accountCredentialFailed({ account_id: clean.account_id, why: "refused" });
  assert.equal(told.at(-1).other_account_serves, true);
  assert.equal(twin.ok, true);
});

test("R74: accountsOnSummary answers {team_on, projects_on}: the number of the team's accounts that are on and held, and the ids of the projects that hold at least one account on and held and that the viewer may see; a member's own accounts and personal subscriptions are never counted and never named; a project the viewer cannot see is absent; unreadable answers {unreadable: true}, never team_on: 0", async () => {
  const w = await projectWorld();
  assert.deepEqual(w.a.accountsOnSummary({ viewer: "ann" }), { team_on: 0, projects_on: [] });
  await on(w, w.team());
  await on(w, w.team({ entries: [E.a] }));
  const off = await w.team({ secret: SECRET("off") });
  assert.equal(off.on, false);
  w.a.registerGatewayStore("root", { create: async () => "gw-z", put: async () => true, exists: async () => true });
  await on(w, w.a.accountSet({ owner: "group", provider: P.provider, plan: P.teamApi, means: "gateway", by: "admin" }).then((x) => x));
  assert.equal(w.a.accountsOnSummary({ viewer: "ann" }).team_on, 2, "two on and held; one off; one on and not held (no key)");
  await on(w, w.projectAccount("P", "ann"));
  await on(w, w.own("cy"));
  await on(w, w.a.accountSet({ owner: "member:dee", provider: P.provider, plan: P.subscription, means: "issued", secret: "sk-ant-oat01-sentinel-dee-0123456789", by: "dee" }));
  assert.deepEqual(w.a.accountsOnSummary({ viewer: "ann" }), { team_on: 2, projects_on: ["P"] });
  assert.deepEqual(w.a.accountsOnSummary({ viewer: "bob" }), { team_on: 2, projects_on: ["P"] }, "joined");
  assert.deepEqual(w.a.accountsOnSummary({ viewer: "eve" }), { team_on: 2, projects_on: [] }, "a project the viewer cannot see is absent");
  await on(w, w.projectAccount("S", "cy"));
  assert.deepEqual(w.a.accountsOnSummary({ viewer: "cy" }).projects_on, ["S"]);
  assert.deepEqual(w.a.accountsOnSummary({ viewer: "admin" }).projects_on.length <= 2, true);
  w.sql.exec(`ALTER TABLE ai_accounts RENAME TO ai_accounts_gone`);
  assert.deepEqual(w.a.accountsOnSummary({ viewer: "ann" }), { unreadable: true });
});

test("R76: termsNoticesDue answers for each account the viewer may manage each binding term of its plan whose effective_from is within TERMS_NOTICE_DAYS after `at`: {account_id, plan_id, doc, version, effective_from, key}, a stable key per (account, doc, version); a term past its date or beyond the window answers none; nothing waits on it, the account serves throughout; it writes nothing", async () => {
  const w = await projectWorld();
  seen(w, "bob");
  const t = await on(w, w.team());
  const mine = await w.own("ann", { plan: P.teamApi });
  const at = "2026-10-28T00:00:00Z";
  assert.deepEqual(w.a.termsNoticesDue({ viewer: "admin", at }), []);
  setPendingTerms(w, P.teamApi, [{ doc: "usage-policy", version: "v9", effective_from: "2026-11-02T00:00:00Z", days_until: 5 },
                                  { doc: "old", version: "v1", effective_from: "2026-10-01T00:00:00Z", days_until: -27 },
                                  { doc: "far", version: "v2", effective_from: "2027-03-01T00:00:00Z", days_until: 124 }]);
  const rows = w.a.termsNoticesDue({ viewer: "admin", at });
  assert.deepEqual(rows, [{ account_id: t.account_id, plan_id: P.teamApi, doc: "usage-policy", version: "v9", effective_from: "2026-11-02T00:00:00Z", key: rows[0].key }]);
  assert.deepEqual(w.a.termsNoticesDue({ viewer: "second", at }), rows, "every administrator, the same key on every read");
  assert.deepEqual(w.a.termsNoticesDue({ viewer: "admin", at }), rows);
  assert.deepEqual(w.a.termsNoticesDue({ viewer: "ann", at }).map((r) => r.account_id), [mine.account_id], "her own account's plan: its member");
  assert.deepEqual(w.a.termsNoticesDue({ viewer: "bob", at }), [], "not the team's, not hers");
  assert.deepEqual(w.a.termsNoticesDue({ viewer: "class:ai", at }), []);
  const before = w.snapshot();
  w.a.termsNoticesDue({ viewer: "admin", at });
  assert.equal(w.snapshot(), before);
  assert.equal((await w.a.accountFor({ member: "bob", act: ask("bob") })).ok, true, "the account serves throughout");
  assert.deepEqual(w.a.termsNoticesDue({ viewer: "admin", at: "2026-11-03T00:00:00Z" }), [], "a term past its date answers none");
  assert.equal(w.a.termsNoticesDue({ viewer: "admin", at: "2026-10-01T00:00:00Z" }).length, 0, "beyond the window");
});
