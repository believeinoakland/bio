/* ai-accounts' published fixtures (K4990, K4993, K4995, K5044): what ai-accounts answers to a caller that asks for an account,
   a hop, a keep-away, a credential or an account's state, made by ai-accounts' own code when the test runs and never stored.
   A user's test takes the answer from here and does not write it by hand. Each is called by a test of ai-accounts' own,
   `fixtures.test.mjs`, which checks the real answer. Each runs the real module over `world()` (its real membership and
   record-core, a real SQLite database, and ai-catalogue's published fixture): the founder `admin` and a second administrator
   `second` hold the team, the members named are enrolled. */
import { world, SECRET } from "./fixture.mjs";
import { PLANS, ENTRIES } from "./catalogue.mjs";

const KEY = "sk-ant-fixture-key-0123456789";
const TOKEN = (who) => `sk-ant-oat01-fixture-${who}-0123456789`;
const actOf = (member, kind = "ask", more = {}) => ({ kind, member, ...more });
export { PLANS, ENTRIES };

/* A team with `member` enrolled (and the owner of project `P` when `project` is true), the recipient notice of Anthropic's
   host read by the member. */
async function groupWith(member, { project = false } = {}) {
  const w = await world().group(member);
  if (project) w.project("P", member);
  w.a.recipientNoticeSeen({ member, provider: PLANS.provider, host: "api.anthropic.com", by: member });
  return w;
}

/* A member's own account of the catalogue's member API plan, its key sealed, switched on, by her own act. */
async function ownOn(w, member, key = KEY, more = {}) {
  const set = await w.own(member, { secret: key, ...more });
  if (!set.ok) throw new Error(`ownOn: ${set.reason}`);
  const on = w.a.accountSwitch({ account_id: set.account_id, on: true, by: member });
  if (!on.ok) throw new Error(`ownOn: ${on.reason}`);
  return set;
}

/* `accountFor({member, act})` for a member whom no account serves: NO_ACCOUNT, the whole refusal with its check (C-29.20)
   and translation. */
export async function accountForRefused({ member = "ann", act = actOf(member) } = {}) {
  const w = await groupWith(member);
  return w.a.accountFor({ member, act });
}

/* `accountFor({member, act})` for a member whose own sealed API key `key` is set and on: `{ok: true, account_id, level:
   "member", owner, provider, plan, means: "sealed", entry_id, entries, member, suggestions, personal: false, disclosed,
   secret: key}`. */
export async function accountForResult({ member = "ann", key = KEY, act = actOf(member) } = {}) {
  const w = await groupWith(member);
  await ownOn(w, member, key);
  return w.a.accountFor({ member, act });
}

/* A real ai-accounts with the member's sealed API key `key` set and on: `accountFor({member, act})` is the service
   (`accounts.accountFor`), serving the member's own key as `accountForResult` answers. */
export async function accountsServing({ member = "ann", key = KEY } = {}) {
  const w = await groupWith(member);
  await ownOn(w, member, key);
  return { accounts: w.a, accountFor: (args) => w.a.accountFor(args), member, key, world: w };
}

/* The team's sealed account serves a member who holds none of her own: `accountFor` answers `level: "group"`, `owner:
   "group"`, the team's key `key` as `secret`. */
export async function teamAccountServing({ member = "ann", key = KEY, act = actOf(member) } = {}) {
  const w = await groupWith(member);
  const t = await w.team({ secret: key });
  w.a.accountSwitch({ account_id: t.account_id, on: true, by: "admin" });
  return w.a.accountFor({ member, act });
}

/* A project's sealed account, set by its owner `member`, serves an act naming the project: `accountFor` answers `level:
   "project"`, `project`, the key as `secret`. */
export async function projectAccountServing({ member = "ann", project = "P", key = KEY, act = actOf(member, "ask", { project }) } = {}) {
  const w = await groupWith(member, { project: true });
  const p = await w.projectAccount(project, member, { secret: key });
  w.a.accountSwitch({ account_id: p.account_id, on: true, by: member });
  return w.a.accountFor({ member, act });
}

/* A personal subscription (the plan `subscription`, means `issued`) set by the member serves her own act: `accountFor`
   answers `personal: true`, her token as `secret`. */
export async function personalSubscriptionServing({ member = "ann", act = actOf(member) } = {}) {
  const w = await groupWith(member);
  const s = await w.a.accountSet({ owner: `member:${member}`, provider: PLANS.provider, plan: PLANS.subscription, means: "issued", secret: TOKEN(member), by: member });
  if (!s.ok) throw new Error(`personalSubscriptionServing: ${s.reason}`);
  w.a.accountSwitch({ account_id: s.account_id, on: true, by: member });
  return w.a.accountFor({ member, act });
}

/* An account reached by reference serves with its pointer: `accountFor` answers `means: "reference"`, `reference: {store,
   locator}` and no secret. */
export async function referenceAccountServing({ member = "ann", reference = { store: "vault", locator: "kv/ann" }, act = actOf(member) } = {}) {
  const w = await groupWith(member);
  const s = await w.a.accountSet({ owner: `member:${member}`, provider: PLANS.provider, plan: PLANS.memberApi, means: "reference", reference, by: member });
  if (!s.ok) throw new Error(`referenceAccountServing: ${s.reason}`);
  w.a.accountSwitch({ account_id: s.account_id, on: true, by: member });
  return w.a.accountFor({ member, act });
}

/* The team's gateway account, its key held, serves a member: `accountFor` answers `means: "gateway"`, `gateway_id`. With
   `credits`, the first call's record says the platform's credits paid: the account is flagged and the next `accountFor` is
   PAYER_NOT_VERIFIED. */
export async function gatewayAccountServing({ member = "ann", gatewayId = "gw-fixture-1", act = actOf(member), credits = false } = {}) {
  const w = await groupWith(member);
  w.a.registerGatewayStore("fixture-root", { create: async () => gatewayId, put: async () => true, exists: async () => true });
  const t = await w.a.accountSet({ owner: "group", provider: PLANS.provider, plan: PLANS.teamApi, means: "gateway", by: "admin" });
  await w.a.gatewayKeyAttest({ account_id: t.account_id, by: "admin" });
  w.a.accountSwitch({ account_id: t.account_id, on: true, by: "admin" });
  const served = await w.a.accountFor({ member, act });
  if (!credits) return { served, account_id: t.account_id, world: w };
  const flagged = w.a.gatewayServedCheck({ account_id: t.account_id, record: { gateway_id: gatewayId, own_key_served: false, platform_credits_used: true } });
  return { served, flagged, refused: await w.a.accountFor({ member, act }), account_id: t.account_id, world: w };
}

/* `accountFor` for a member whose API account's recipient notice is due (a member served by the team's account who has not
   read what its host receives): RECIPIENT_NOTICE_DUE with the recipient `{provider, host}`. */
export async function recipientNoticeDue({ member = "ann", act = actOf(member) } = {}) {
  const w = await world().group(member);
  const t = await w.team();
  w.a.accountSwitch({ account_id: t.account_id, on: true, by: "admin" });
  return w.a.accountFor({ member, act });
}

/* `accountFor` for an act whose head plan is a free tier whose warning is not accepted: FREE_TIER_NOT_ACCEPTED `{plan}`. */
export async function freeTierNotAccepted({ member = "ann", act = actOf(member) } = {}) {
  const w = await world().group(member);
  const s = await w.a.accountSet({ owner: `member:${member}`, provider: PLANS.freeProvider, plan: PLANS.freeApi, means: "sealed", secret: KEY, by: member });
  w.a.accountSwitch({ account_id: s.account_id, on: true, by: member });
  w.a.recipientNoticeSeen({ member, provider: PLANS.freeProvider, host: "free.example", by: member });
  return w.a.accountFor({ member, act });
}

/* `hopFor` along a member's list of two accounts (entries claude-a, then claude-b of the first, then the second's): the pair
   after the one given, for each reason, and LIST_EXHAUSTED at the end. */
export async function hopAlongList({ member = "ann", reason = "limit" } = {}) {
  const w = await groupWith(member);
  const a1 = await ownOn(w, member, KEY, { entries: [ENTRIES.a, ENTRIES.b] });
  const a2 = await ownOn(w, member, KEY + "2", { entries: [ENTRIES.a] });
  const hop = (from) => w.a.hopFor({ member, act: actOf(member), from, reason, at_step_boundary: true });
  return { next: hop({ account_id: a1.account_id, entry_id: ENTRIES.a }), then: hop({ account_id: a1.account_id, entry_id: ENTRIES.b }),
           exhausted: hop({ account_id: a2.account_id, entry_id: ENTRIES.a }), accounts: [a1.account_id, a2.account_id] };
}

/* The member's account's state as its owner reads it, and as another member does (refused): no secret in either. */
export async function accountStateRead({ member = "ann", other = "bob" } = {}) {
  const w = await world().group(member, other);
  const x = await w.own(member, { secret: KEY });
  return { owner: w.a.accountState({ account_id: x.account_id, viewer: member }), other: w.a.accountState({ account_id: x.account_id, viewer: other }), account_id: x.account_id };
}

/* `aiKeepAwaySet({on, uses, reason, by})`, the ok answer for the body given (an administrator `by`, default the founder):
   `{ok: true, on, reason, set_by, set_at, uses}`. */
export async function keepAwaySet({ on = true, uses = null, reason = "A confidentiality order.", by = "admin" } = {}) {
  const w = await world().group();
  return w.a.aiKeepAwaySet({ on, uses, reason, by });
}

/* `aiKeepAwayState()` after a set (`kept`) and on a fresh account (`off`). */
export async function keepAwayState({ reason = "A confidentiality order.", by = "admin" } = {}) {
  const fresh = await world().group();
  const off = fresh.a.aiKeepAwayState();
  const w = await world().group();
  w.a.aiKeepAwaySet({ on: true, reason, by });
  return { kept: w.a.aiKeepAwayState(), off };
}

/* `aiKeepAwayState()` over an account whose SQL read throws (its table is gone): `{on: null, reason: null, set_by: null,
   set_at: null, uses: null}`. */
export async function keepAwayUnreadable() {
  const w = await world().group();
  w.sql.exec(`DROP TABLE ai_keep_away`);
  return w.a.aiKeepAwayState();
}

/* The team keeps its material away: `aiKeptAway()` and `accountFor({member, act})` for a member with an account, each
   AI_KEPT_AWAY (C-29.31) with `keep_away {reason, set_by, set_at}`. */
export async function keptAwayGroup({ member = "ann", reason = "A confidentiality order.", by = "admin", use = "ask" } = {}) {
  const w = await groupWith(member);
  await ownOn(w, member);
  w.a.aiKeepAwaySet({ on: true, reason, by });
  return { aiKeptAway: w.a.aiKeptAway({ use }), accountFor: await w.a.accountFor({ member, act: actOf(member, use) }) };
}

/* A project's material limit (R22) set by its owner `member`: `aiKeptAway({project})` and `accountFor` for an act naming the
   project, each PROJECT_AI_KEPT_AWAY (C-29.38) with `keep_away {reason, set_by, set_at}`. */
export async function keptAwayProject({ member = "ann", project = "P", reason = "A sealed case.", use = "ask" } = {}) {
  const w = await world().group(member);
  w.project(project, member);
  const set = w.a.projectAiKeepAwaySet({ project, on: true, reason, by: member });
  if (!set.ok) throw new Error(`keptAwayProject: ${set.reason}`);
  return { aiKeptAway: w.a.aiKeptAway({ project, use }), accountFor: await w.a.accountFor({ member, act: actOf(member, use, { project }) }) };
}

/* The keep-away setting cannot be read (R34; its table is gone): AI_KEPT_AWAY with `keep_away {reason: null, set_by: null,
   set_at: null}` and a `detail` saying so, from `aiKeptAway()` and from `accountFor`. */
export async function keptAwayUnreadable({ member = "ann", use = "ask" } = {}) {
  const w = await groupWith(member);
  w.sql.exec(`DROP TABLE ai_keep_away`);
  return { aiKeptAway: w.a.aiKeptAway({ use }), accountFor: await w.a.accountFor({ member, act: actOf(member, use) }) };
}

/* `accountFor` for a member whom no account serves: NO_ACCOUNT (C-29.20) carrying the member. */
export async function noAccount({ member = "ann", act = actOf(member) } = {}) {
  const w = await groupWith(member);
  return w.a.accountFor({ member, act });
}

/* `accountFor` for an act whose account's own switch for the use is off (R11): AI_USE_SWITCHED_OFF `{whose, use}`. `whose` is
   "own" (the member's account) or "group" (the team's account, on, held by an administrator). */
export async function switchedOff({ whose = "own", use = "ask", member = "ann" } = {}) {
  const w = await groupWith(member);
  if (whose === "group") {
    const t = await w.team({ secret: KEY });
    w.a.accountSwitch({ account_id: t.account_id, on: true, by: "admin" });
    w.a.accountUsesSet({ account_id: t.account_id, switch: use, on: false, by: "admin" });
  } else {
    const x = await ownOn(w, member);
    w.a.accountUsesSet({ account_id: x.account_id, switch: use, on: false, by: member });
  }
  return w.a.accountFor({ member, act: actOf(member, use) });
}

/* The token hold of a token that is not a token (too short, then not a string): ISSUED_TOKEN_MALFORMED (C-29.78), each
   writing nothing. A well-formed token is held, as the control. */
export async function issuedTokenMalformed({ member = "ann" } = {}) {
  const w = await groupWith(member);
  const s = await w.a.accountSet({ owner: `member:${member}`, provider: PLANS.provider, plan: PLANS.subscription, means: "issued", secret: TOKEN(member), by: member });
  return {
    tooShort: await w.a.issuedTokenHold({ account_id: s.account_id, token: "short" }),
    notAString: await w.a.issuedTokenHold({ account_id: s.account_id, token: 42 }),
    held: await w.a.issuedTokenHold({ account_id: s.account_id, token: TOKEN(member + "2") }),
  };
}
