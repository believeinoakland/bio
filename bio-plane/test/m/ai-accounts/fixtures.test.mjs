/* The fixtures ai-accounts publishes (`fixtures.mjs`), each called here and its real answer checked: a user's test takes the
   answer from the fixture, and this is what shows the fixture's answer is the module's own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { AI_ACCOUNT_CHECKS } from "../../../src/ai-accounts/index.mjs";
import * as fx from "./fixtures.mjs";

const refusal = (code, extra = {}) => ({ ok: false, reason: code, code, check: AI_ACCOUNT_CHECKS[code].check, translation: AI_ACCOUNT_CHECKS[code].translation, ...extra });
const withoutDetail = (r) => { const { detail, ...rest } = r; assert.equal(typeof detail, "string", "a refusal says what happened"); return rest; };
const KEEP = ["check", "code", "detail", "keep_away", "ok", "reason", "translation"];

test("R7 (fixture accountForRefused, noAccount): a member whom no account serves is refused NO_ACCOUNT, the whole refusal with its check and translation", async () => {
  for (const r of [await fx.accountForRefused({ member: "ann" }), await fx.noAccount({ member: "ann" })]) {
    assert.equal(r.check, "C-29.20");
    assert.deepEqual(withoutDetail(r), refusal("NO_ACCOUNT", { member: "ann" }));
  }
});

test("R7 (fixture accountForResult, accountsServing): a member whose own sealed key was set and switched on is served by it: the account, its level, plan, means, entry and, for the one call, the secret", async () => {
  const r = await fx.accountForResult({ member: "ann", key: "sk-ann-1" });
  assert.deepEqual([r.ok, r.level, r.owner, r.means, r.secret, r.member, r.personal, r.entry_id], [true, "member", "member:ann", "sealed", "sk-ann-1", "ann", false, fx.ENTRIES.a]);
  assert.deepEqual([r.provider, r.plan, r.entries], [fx.PLANS.provider, fx.PLANS.memberApi, [fx.ENTRIES.a, fx.ENTRIES.b]]);
  const s = await fx.accountsServing({ member: "cy", key: "sk-cy-secret" });
  const got = await s.accountFor({ member: "cy", act: { kind: "draft", member: "cy" } });
  assert.deepEqual([got.ok, got.secret, got.level], [true, "sk-cy-secret", "member"]);
  assert.equal((await s.accounts.accountFor({ member: "cy", act: { kind: "ask", member: "cy" } })).secret, "sk-cy-secret");
  assert.equal(withoutDetail(await s.accountFor({ member: "other", act: { kind: "ask", member: "other" } })).code, "ACCOUNT_MEMBER_NOT_ACTIVE", "a name that is no member is not an active member");
});

test("R7 R40 (fixtures teamAccountServing, projectAccountServing, personalSubscriptionServing, referenceAccountServing, gatewayAccountServing): each means and level serves as stated", async () => {
  const t = await fx.teamAccountServing({ member: "ann", key: "sk-team-1" });
  assert.deepEqual([t.ok, t.level, t.owner, t.secret], [true, "group", "group", "sk-team-1"]);
  const p = await fx.projectAccountServing({ member: "ann", key: "sk-proj-1" });
  assert.deepEqual([p.ok, p.level, p.project, p.secret], [true, "project", "P", "sk-proj-1"]);
  const s = await fx.personalSubscriptionServing({ member: "ann" });
  assert.deepEqual([s.ok, s.personal, s.means, typeof s.secret], [true, true, "issued", "string"]);
  const r = await fx.referenceAccountServing({ member: "ann" });
  assert.deepEqual([r.ok, r.means, r.reference, "secret" in r], [true, "reference", { store: "vault", locator: "kv/ann" }, false]);
  const g = await fx.gatewayAccountServing({ member: "ann" });
  assert.deepEqual([g.served.ok, g.served.means, g.served.gateway_id, "secret" in g.served], [true, "gateway", "gw-fixture-1", false]);
  const flagged = await fx.gatewayAccountServing({ member: "ann", credits: true });
  assert.deepEqual([flagged.flagged, flagged.refused.code], [{ flagged: true, cause: "credits" }, "PAYER_NOT_VERIFIED"]);
});

test("R11 R51 R56 (fixtures recipientNoticeDue, freeTierNotAccepted, switchedOff): the head's refusals: RECIPIENT_NOTICE_DUE with the recipient, FREE_TIER_NOT_ACCEPTED naming the plan, AI_USE_SWITCHED_OFF naming whose and the use", async () => {
  const n = await fx.recipientNoticeDue({ member: "ann" });
  assert.deepEqual([n.code, n.check, n.recipient], ["RECIPIENT_NOTICE_DUE", "C-29.72", { provider: fx.PLANS.provider, host: "api.anthropic.com" }]);
  const f = await fx.freeTierNotAccepted({ member: "ann" });
  assert.deepEqual([f.code, f.check, f.plan], ["FREE_TIER_NOT_ACCEPTED", "C-29.71", fx.PLANS.freeApi]);
  for (const whose of ["own", "group"]) {
    const o = await fx.switchedOff({ whose, use: "draft", member: "ann" });
    assert.deepEqual(withoutDetail(o), refusal("AI_USE_SWITCHED_OFF", { whose, use: "draft" }), whose);
  }
});

test("R50 (fixture hopAlongList): along a member's two accounts a hop answers the next pair, then the next account's, then LIST_EXHAUSTED", async () => {
  const h = await fx.hopAlongList({ member: "ann" });
  assert.deepEqual([h.next.ok, h.next.account_id, h.next.entry_id, h.next.payer_change], [true, h.accounts[0], fx.ENTRIES.b, null]);
  assert.deepEqual([h.then.account_id, h.then.entry_id], [h.accounts[1], fx.ENTRIES.a]);
  assert.equal(h.exhausted.code, "LIST_EXHAUSTED");
});

test("R2 (fixture accountStateRead): the owner reads the account's state, another member is refused NOT_YOUR_ACCOUNT, neither carries a secret", async () => {
  const { owner, other, account_id } = await fx.accountStateRead({ member: "ann", other: "bob" });
  assert.deepEqual([owner.ok, owner.account_id, owner.means, owner.held, owner.on], [true, account_id, "sealed", true, false]);
  assert.equal(withoutDetail(other).code, "NOT_YOUR_ACCOUNT");
  assert.ok(!JSON.stringify([owner, other]).includes("sk-ant-fixture"));
});

test("R20 R21 (fixture keepAwaySet): an administrator's set answers {ok, on, reason, set_by, set_at, uses}", async () => {
  const r = await fx.keepAwaySet({ reason: "A hearing.", by: "second" });
  assert.deepEqual([r.ok, r.on, r.reason, r.set_by, Array.isArray(r.uses)], [true, true, "A hearing.", "second", true]);
  assert.equal((await fx.keepAwaySet({ on: true, reason: "", by: "admin" })).code, "AI_KEEP_AWAY_NO_REASON");
});

test("R21 R34 (fixtures keepAwayState, keepAwayUnreadable): the state after a set is kept with who and when, off on a fresh account; a state whose read throws is null throughout", async () => {
  const { kept, off } = await fx.keepAwayState({ reason: "r", by: "second" });
  assert.deepEqual([kept.on, kept.reason, kept.set_by, off.on, off.reason], [true, "r", "second", false, null]);
  assert.deepEqual(await fx.keepAwayUnreadable(), { on: null, reason: null, set_by: null, set_at: null, uses: null });
});

test("R7 R20 R22 R34 (fixtures keptAwayGroup, keptAwayProject, keptAwayUnreadable): the team's limit refuses aiKeptAway and accountFor alike with AI_KEPT_AWAY and keep_away; a project's PROJECT_AI_KEPT_AWAY; an unreadable setting AI_KEPT_AWAY with keep_away's three null", async () => {
  const g = await fx.keptAwayGroup({ reason: "A confidentiality order.", by: "second" });
  for (const r of [g.aiKeptAway, g.accountFor]) {
    assert.deepEqual(Object.keys(r).sort(), KEEP);
    assert.deepEqual(withoutDetail({ ...r, keep_away: undefined }), { ...refusal("AI_KEPT_AWAY"), keep_away: undefined });
    assert.deepEqual([r.keep_away.reason, r.keep_away.set_by], ["A confidentiality order.", "second"]);
  }
  const p = await fx.keptAwayProject({ member: "ann", project: "P", reason: "A sealed case." });
  for (const r of [p.aiKeptAway, p.accountFor]) {
    assert.equal(r.code, "PROJECT_AI_KEPT_AWAY");
    assert.deepEqual([r.project, r.keep_away.reason, r.keep_away.set_by], ["P", "A sealed case.", "ann"]);
  }
  const u = await fx.keptAwayUnreadable({ member: "ann" });
  for (const r of [u.aiKeptAway, u.accountFor]) {
    assert.equal(r.code, "AI_KEPT_AWAY");
    assert.deepEqual(r.keep_away, { reason: null, set_by: null, set_at: null });
    assert.match(r.detail, /could not be read/);
  }
});

test("R19 (fixture issuedTokenMalformed): a token too short or not a string is ISSUED_TOKEN_MALFORMED (C-29.78) and writes nothing; a well-formed token is held, as the control", async () => {
  const r = await fx.issuedTokenMalformed({ member: "ann" });
  for (const x of [r.tooShort, r.notAString]) assert.deepEqual(withoutDetail({ ...x, min: undefined, max: undefined }), { ...refusal("ISSUED_TOKEN_MALFORMED"), min: undefined, max: undefined });
  assert.deepEqual([r.tooShort.min, r.tooShort.max], [20, 200]);
  assert.equal(r.held.ok, true);
});
