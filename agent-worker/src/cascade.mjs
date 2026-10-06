/* R32, R33 (K1502) — WHOSE CLAUDE ACCOUNT PAYS: THE MEMBER'S OWN, AND NO OTHER.
 *
 * There is no group-wide or project-wide Claude account (K1502, replacing K1429's three-level cascade): each member who
 * wants the assistant brings their own subscription token or API key, and it serves only that member's own asks, runs
 * and standing questions. So "the cascade" has one level, `member`, and this module is the one judgement of it. PURE:
 * no network, no environment read, no state. The reference arrives PER CALL from the plane (credentials R24 unseals it
 * for the one act it serves) and is retained exactly as long as the `ai` credential is: not at all (R36).
 *
 * THE QUESTIONS ASKED OF IT are the only ones this repository can answer about a vendor's secret (DS-3's rule): is
 * there one, of a kind `agent-model` takes, and has it been published in this repository. Its format beyond that is
 * the vendor's claim, never this member's measurement. The denylist is the plane's own (`bio-plane/src/tokens.mjs`, a
 * bundle input hashed in this member's manifest), so the one list stays one list.
 *
 * STATUS CARRIES NO SECRET, AND THE REFERENCE ACCESSOR IS DERIVED FROM THE STATUS: `cascadeToken` re-runs the same
 * judgement and hands over only what `resolveClaudeCascade` would call available, so the two cannot disagree. */
import { PUBLISHED_TOKEN_HASHES, sha256hex } from "../../bio-plane/src/tokens.mjs";

/** The one level (R32). Nothing else may restate it. */
export const CASCADE_ORDER = Object.freeze(["member"]);
/** The kinds `agent-model` takes (its R2), as `credentials` R22 holds them. */
export const ACCOUNT_KINDS = Object.freeze(["apikey", "subscription"]);

/** The stated reasons. A caller renders these; it never invents one. */
export const CASCADE_NO_ACCOUNT = "NO_ACCOUNT";
export const LEVEL_UNSET = "unset";
export const LEVEL_REVOKED = "revoked_by_publication";
export const LEVEL_AVAILABLE = "available";

const secretOf = (account) => (account && typeof account === "object" && typeof account.secret === "string"
  ? account.secret : "");

/** R32 — the member level's state: `unset` (no non-empty secret), `revoked_by_publication` (its SHA-256 is published
 *  in this repository) or `available`. */
async function levelState(account) {
  const v = secretOf(account);
  if (v.length === 0) return LEVEL_UNSET;
  if (PUBLISHED_TOKEN_HASHES.has(await sha256hex(v))) return LEVEL_REVOKED;
  return LEVEL_AVAILABLE;
}

/**
 * R32 — the status, carrying no secret: `{available: true, level: "member", kind, member, levels}` or
 * `{available: false, reason: "NO_ACCOUNT", level: "member", levels, detail}`. `account` is `{kind, secret, member}`
 * (K1601 (1)); a kind `agent-model` does not take is the caller's to refuse before this (R6), and is unset here.
 */
export async function resolveClaudeCascade(account) {
  const kindOk = account && typeof account === "object" && ACCOUNT_KINDS.includes(account.kind);
  const state = kindOk ? await levelState(account) : LEVEL_UNSET;
  const levels = [{ level: "member", state }];
  if (state === LEVEL_AVAILABLE)
    return { available: true, level: "member", kind: account.kind,
             member: typeof account.member === "string" ? account.member : null, levels };
  return {
    available: false, reason: CASCADE_NO_ACCOUNT, level: "member", levels,
    detail: state === LEVEL_REVOKED
      ? "the member's own Claude account reference has been published in this repository, which revokes it, so no "
        + "model turn can run under it. There is no group or project account to fall back to (K1502): the member "
        + "connects a new one, or has no assistant."
      : "no Claude account reference of the member's own arrived. There is no group or project account (K1502): a "
        + "member with neither their own subscription nor their own API key has no assistant.",
  };
}

/**
 * R33 — `{level: "member", reference}` exactly when R32 resolves, else null. `reference` is in `agent-model`'s terms
 * (`{kind: "apikey", key}` or `{kind: "subscription", token}`), for the one call it serves; never logged, echoed or
 * kept by any state of this module (R36).
 */
export async function cascadeToken(account) {
  const st = await resolveClaudeCascade(account);
  if (!st.available) return null;
  const secret = secretOf(account);
  return { level: "member",
           reference: account.kind === "apikey" ? { kind: "apikey", key: secret } : { kind: "subscription", token: secret } };
}
