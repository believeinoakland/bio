/* ai-accounts' published fixtures (K4990, K4993, K4995, K5044): what ai-accounts answers to a caller that asks for an
   account, a keep-away, a sign-in or a member's reference, made by ai-accounts' own code when the test runs and never
   stored. A user's test takes the answer from here and does not write it by hand. Each is called by a test of
   ai-accounts' own, `fixtures.test.mjs`, which checks the real answer. Each runs the real module over `world()` (its
   real membership and record-core, a real SQLite database): the founder `admin` and a second administrator `second`
   hold the group, the members named are enrolled. */
import { world, SIGNIN_TOKEN } from "./fixture.mjs";

const KEY = "sk-ant-fixture-key-0123456789";
const actOf = (member, kind = "ask", more = {}) => ({ kind, member, ...more });

/* A group with `member` enrolled (and the owner of project `P` when `project` is true). */
async function groupWith(member, { project = false } = {}) {
  const w = await world().group(member);
  if (project) w.project("P", member);
  return w;
}

/* `accountFor({member, act})` for a member who holds no account (no reference, no sign-in, no group key): NO_ACCOUNT, the
   whole refusal with its check (C-29.1) and translation. */
export async function accountForRefused({ member = "ann", act = actOf(member) } = {}) {
  const w = await groupWith(member);
  return w.a.accountFor({ member, act });
}

/* `accountFor({member, act})` for a member whose API key `key` was set through `accountReferenceSet`:
   `{ok: true, kind: "apikey", level: "member", key}`. */
export async function accountForResult({ member = "ann", key = KEY, act = actOf(member) } = {}) {
  const w = await groupWith(member);
  await w.a.accountReferenceSet({ member, kind: "apikey", secret: key, by: member });
  return w.a.accountFor({ member, act });
}

/* The real `accountReferenceState` answer `{ok, held, subscription, ...}` for `member` reading their own account, over a
   group without a connected subscription (`without`) and with one, its token held (`with`). */
export async function accountReference({ member = "ann" } = {}) {
  const w = await groupWith(member);
  const without = w.a.accountReferenceState({ member, viewer: member });
  await w.signin(member);
  return { without, with: w.a.accountReferenceState({ member, viewer: member }) };
}

/* A real ai-accounts with an API key `key` referenced for `member`: `accountFor({member, act})` is the service
   (`accounts.accountFor`), serving the member's own key as `{ok: true, kind: "apikey", level: "member", key}`. */
export async function accountsServing({ member = "ann", key = KEY } = {}) {
  const w = await groupWith(member);
  const set = await w.a.accountReferenceSet({ member, kind: "apikey", secret: key, by: member });
  if (!set.ok) throw new Error(`accountsServing: ${set.reason}`);
  return { accounts: w.a, accountFor: (args) => w.a.accountFor(args), member, key, world: w };
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

/* The group keeps its material away: `aiKeptAway()` and `accountFor({member, act})` for a member with an account, each
   AI_KEPT_AWAY (C-29.31) with `keep_away {reason, set_by, set_at}`. */
export async function keptAwayGroup({ member = "ann", reason = "A confidentiality order.", by = "admin", use = "ask" } = {}) {
  const w = await groupWith(member);
  await w.a.accountReferenceSet({ member, kind: "apikey", secret: KEY, by: member });
  w.a.aiKeepAwaySet({ on: true, reason, by });
  return { aiKeptAway: w.a.aiKeptAway({ use }), accountFor: await w.a.accountFor({ member, act: actOf(member, use) }) };
}

/* A project's material limit (R22) set by its owner `member`: `aiKeptAway({project})` and `accountFor` for an act naming
   the project, each PROJECT_AI_KEPT_AWAY (C-29.38) with `keep_away {reason, set_by, set_at}`. */
export async function keptAwayProject({ member = "ann", project = "P", reason = "A sealed case.", use = "ask" } = {}) {
  const w = await world().group(member);
  w.project(project, member);
  const set = w.a.projectAiKeepAwaySet({ project, on: true, reason, by: member });
  if (!set.ok) throw new Error(`keptAwayProject: ${set.reason}`);
  return { aiKeptAway: w.a.aiKeptAway({ project, use }), accountFor: await w.a.accountFor({ member, act: actOf(member, use, { project }) }) };
}

/* The keep-away setting cannot be read (R34; its table is gone): AI_KEPT_AWAY with `keep_away {reason: null, set_by:
   null, set_at: null}` and a `detail` saying so, from `aiKeptAway()` and from `accountFor`. */
export async function keptAwayUnreadable({ member = "ann", use = "ask" } = {}) {
  const w = await groupWith(member);
  w.sql.exec(`DROP TABLE ai_keep_away`);
  return { aiKeptAway: w.a.aiKeptAway({ use }), accountFor: await w.a.accountFor({ member, act: actOf(member, use) }) };
}

/* `accountFor` for a member with no reference and no sign-in: NO_ACCOUNT (C-29.1) carrying the member. */
export async function noAccount({ member = "ann", act = actOf(member) } = {}) {
  const w = await groupWith(member);
  return w.a.accountFor({ member, act });
}

/* The real `subscriptionDisconnect({member, by})` answer of a member whose subscription is connected, its token held:
   `{ok: true, disconnected: true}`. */
export async function subscriptionDisconnect({ member = "ann" } = {}) {
  const w = await groupWith(member);
  await w.signin(member);
  return w.a.subscriptionDisconnect({ member, by: member });
}

/* `accountFor` for an act whose account's own switch for the use is off (R11): AI_USE_SWITCHED_OFF `{whose, use}`.
   `whose` is "own" (the member's reference) or "group" (the group's key, on, held by an administrator). */
export async function switchedOff({ whose = "own", use = "ask", member = "ann" } = {}) {
  const w = await groupWith(member);
  if (whose === "group") {
    await w.a.groupKeySet({ key: KEY, by: "admin" });
    w.a.groupKeySwitch({ on: true, by: "admin" });
    w.a.accountUsesSet({ owner: "group", switch: use, on: false, by: "admin" });
  } else {
    await w.a.accountReferenceSet({ member, kind: "apikey", secret: KEY, by: member });
    w.a.accountUsesSet({ owner: `member:${member}`, switch: use, on: false, by: member });
  }
  return w.a.accountFor({ member, act: actOf(member, use) });
}

/* The sign-in token hold of a token that is not a token (too short, then not a string): SUBSCRIPTION_TOKEN_MALFORMED
   (C-29.45), each writing nothing. A well-formed token (`SIGNIN_TOKEN(member)`) is held, as the control. */
export async function tokenMalformedHold({ member = "ann" } = {}) {
  const w = await groupWith(member);
  return {
    tooShort: await w.a.subscriptionTokenHold({ member, token: "short" }),
    notAString: await w.a.subscriptionTokenHold({ member, token: 42 }),
    held: await w.a.subscriptionTokenHold({ member, token: SIGNIN_TOKEN(member) }),
  };
}
