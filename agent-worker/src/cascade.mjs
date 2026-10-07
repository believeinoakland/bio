/* R32, R33 (K1502, K1755) — WHICH CLAUDE ACCOUNT SERVES THE ACT: THE ONE THAT ARRIVED, JUDGED AT ITS OWN LEVEL.
 *
 * Bob's three options (K1755): an Anthropic API key held by an administrator for the group's copy, serving members with
 * no account of their own; a member's own subscription token (or API key), used only by that member; or no AI. WHICH
 * account serves a member's act is `credentials`' choice (its R35, `accountFor`: the member's own reference when held,
 * else the group's key while it is held and on), never this module's: this module judges the ONE account that arrived,
 * at the `level` it arrived with, `member` or `group`. There is no project level, and no account is read from this
 * member's environment (the copy binds no Claude credential, K1502). An act the group's key serves is still the
 * member's act (R10, R57). PURE: no network, no environment read, no state. The account arrives PER CALL from the plane
 * and is retained exactly as long as the `ai` credential is: not at all (R36).
 *
 * THE QUESTIONS ASKED OF IT are the only ones this repository can answer about a vendor's secret (DS-3's rule): is
 * there one, of a kind `agent-model` takes, and has it been published in this repository. Its format beyond that is
 * the vendor's claim, never this member's measurement. The denylist is the plane's own (`bio-plane/src/tokens.mjs`, a
 * bundle input hashed in this member's manifest), so the one list stays one list.
 *
 * STATUS CARRIES NO SECRET, AND THE REFERENCE ACCESSOR IS DERIVED FROM THE STATUS: `cascadeToken` re-runs the same
 * judgement and hands over only what `resolveClaudeCascade` would call available, so the two cannot disagree. */
import { PUBLISHED_TOKEN_HASHES, sha256hex } from "../../bio-plane/src/tokens.mjs";

/** The levels an account arrives at (R32; `credentials` R35): the member's own, or the group's API key. Nothing else
 *  may restate them, and there is no project level. */
export const CASCADE_ORDER = Object.freeze(["member", "group"]);
/** The kinds `agent-model` takes (its R2), as `credentials` R22 holds them. */
export const ACCOUNT_KINDS = Object.freeze(["apikey", "subscription"]);
/** The kinds each level holds: the group's account is an API key only (`credentials` R33; `agent-model` R11). */
export const LEVEL_KINDS = Object.freeze({ member: ACCOUNT_KINDS, group: Object.freeze(["apikey"]) });

/** The stated reasons. A caller renders these; it never invents one. */
export const CASCADE_NO_ACCOUNT = "NO_ACCOUNT";
export const LEVEL_UNSET = "unset";
export const LEVEL_REVOKED = "revoked_by_publication";
export const LEVEL_AVAILABLE = "available";

const isObject = (a) => a !== null && typeof a === "object" && !Array.isArray(a);
const secretOf = (account) => (isObject(account) && typeof account.secret === "string" ? account.secret : "");
/** The level an account arrived at: its own `level` when it is one of R32's, else `member` (the level judged when
 *  none, or none usable, arrived; R6 refuses an unknown level before this is asked). */
const levelOf = (account) => (isObject(account) && CASCADE_ORDER.includes(account.level) ? account.level : "member");

/** R32 — the arrived account's state at its level: `unset` (no account at a level R32 judges, no non-empty secret, or a
 *  kind its level does not hold), `revoked_by_publication` (its SHA-256 is published in this repository) or
 *  `available`. An account naming no level, or another (a project's, an instance's), is judged at no level. */
async function levelState(account) {
  if (!isObject(account) || !CASCADE_ORDER.includes(account.level)) return LEVEL_UNSET;
  if (!LEVEL_KINDS[account.level].includes(account.kind)) return LEVEL_UNSET;
  const v = secretOf(account);
  if (v.length === 0) return LEVEL_UNSET;
  if (PUBLISHED_TOKEN_HASHES.has(await sha256hex(v))) return LEVEL_REVOKED;
  return LEVEL_AVAILABLE;
}

/**
 * R32 — the status, carrying no secret: `{available: true, level, kind, member, levels}` or
 * `{available: false, reason: "NO_ACCOUNT", level, levels, detail}`, `level` the account's own (`member` when none
 * arrived). `account` is `{kind, level, secret, member, suggestions?}` as the plane sends it (R6); `member` is the
 * member whose act it serves, at either level.
 */
export async function resolveClaudeCascade(account) {
  const level = levelOf(account);
  const state = await levelState(account);
  const levels = [{ level, state }];
  if (state === LEVEL_AVAILABLE)
    return { available: true, level, kind: account.kind,
             member: typeof account.member === "string" ? account.member : null, levels };
  const whose = level === "group" ? "the group's API key" : "the member's own Claude account reference";
  return {
    available: false, reason: CASCADE_NO_ACCOUNT, level, levels,
    detail: state === LEVEL_REVOKED
      ? `${whose} has been published in this repository, which revokes it, so no model turn can run under it. `
        + (level === "group"
          ? "An administrator sets a new key for the group, or members connect their own."
          : "The member connects a new one; until then the group's API key serves them only while your group's "
            + "Civicsmith holds it and it is on.")
      : `no usable Claude account arrived for this act (${whose} was absent, empty, or of a kind its level does not `
        + "hold). Which account serves a member's act is your group's Civicsmith's to answer (the member's own, else "
        + "the group's API key while it is held and on); a member whom neither serves has no assistant.",
  };
}

/**
 * R33 — `{level, reference}` exactly when R32 resolves, else null; `level` the account's own (`member` or `group`).
 * `reference` is in `agent-model`'s terms (`{kind: "apikey", key}` or `{kind: "subscription", token}`), for the one
 * call it serves; never logged, echoed or kept by any state of this module (R36).
 */
export async function cascadeToken(account) {
  const st = await resolveClaudeCascade(account);
  if (!st.available) return null;
  const secret = secretOf(account);
  return { level: st.level,
           reference: account.kind === "apikey" ? { kind: "apikey", key: secret } : { kind: "subscription", token: secret } };
}
