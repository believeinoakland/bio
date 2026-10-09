/* R32, R33 (K1502, K1755) — WHICH CLAUDE ACCOUNT SERVES THE ACT: THE ONE THAT ARRIVED, JUDGED AT ITS OWN LEVEL.
 *
 * Bob's three options (K1755): an Anthropic API key held by an administrator for the group's copy, serving members with
 * no account of their own; a member's own API key or own Claude sign-in, used only by that member; or no AI. WHICH
 * account serves a member's act is `credentials`' choice (its R35, `accountFor`: the member's own reference when held,
 * else the group's key while it is held and on), never this module's: this module judges the ONE account that arrived,
 * at the `level` it arrived with, `member`, `project` or `group`. (T41; R71, K2373) A project's account (`credentials`
 * R54, R56) is an API key, or, while the project has one member, that member's own sign-in: it carries the `project` it
 * belongs to (an id, never a secret), and serves the member's act exactly as the group's key does. No account is read
 * from this member's environment (the copy binds no Claude credential, K1502). An act the group's or a project's key
 * serves is still the member's act (R10, R57). PURE: no network, no environment read, no state. The account arrives PER CALL from the plane
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

/** The levels an account arrives at (R32, R71; `credentials` R35, R56), in the order `credentials`' cascade tries them:
 *  a project's account, the member's own, the group's API key. Nothing else may restate them. */
export const CASCADE_ORDER = Object.freeze(["project", "member", "group"]);
/** The kinds `agent-model` takes (its R2): an API key, or (T38; N785, K2200) the member's own stored sign-in, which
 *  carries no secret (`credentials` R35's sign-in answer). `subscription` is retired (`credentials` R22). */
export const ACCOUNT_KINDS = Object.freeze(["apikey", "signin"]);
/** The kinds each level holds: the group's account is an API key only (`credentials` R33; `agent-model` R11); a
 *  project's is an API key or its one member's own sign-in (`credentials` R54; R71). */
export const LEVEL_KINDS = Object.freeze({ project: ACCOUNT_KINDS, member: ACCOUNT_KINDS, group: Object.freeze(["apikey"]) });

/** The stated reasons. A caller renders these; it never invents one. */
export const CASCADE_NO_ACCOUNT = "NO_ACCOUNT";
export const LEVEL_UNSET = "unset";
export const LEVEL_REVOKED = "revoked_by_publication";
export const LEVEL_AVAILABLE = "available";

const isObject = (a) => a !== null && typeof a === "object" && !Array.isArray(a);
const secretOf = (account) => (isObject(account) && typeof account.secret === "string" ? account.secret : "");
const memberOf = (account) => (isObject(account) && typeof account.member === "string" ? account.member : "");
/** R71: the project a project's account belongs to, an id carried beside it, never a secret. */
const projectOf = (account) => (isObject(account) && typeof account.project === "string" ? account.project : "");
/** The level an account arrived at: its own `level` when it is one of R32's, else `member` (the level judged when
 *  none, or none usable, arrived; R6 refuses an unknown level before this is asked). */
const levelOf = (account) => (isObject(account) && CASCADE_ORDER.includes(account.level) ? account.level : "member");

/** R32 — the arrived account's state at its level: `unset` (no account at a level R32 judges, no non-empty secret, or a
 *  kind its level does not hold), `revoked_by_publication` (its SHA-256 is published in this repository) or
 *  `available`. An account naming no level, or another (an instance's), is judged at no level. A `signin` account has
 *  no secret: it is `available` exactly when its `member` is a non-empty string, the member whose own stored sign-in
 *  serves the act, and `unset` otherwise (T38). A project's account naming no project is `unset` (R71). */
async function levelState(account) {
  if (!isObject(account) || !CASCADE_ORDER.includes(account.level)) return LEVEL_UNSET;
  if (!LEVEL_KINDS[account.level].includes(account.kind)) return LEVEL_UNSET;
  if (account.level === "project" && !projectOf(account)) return LEVEL_UNSET;
  if (account.kind === "signin") return memberOf(account) ? LEVEL_AVAILABLE : LEVEL_UNSET;
  const v = secretOf(account);
  if (v.length === 0) return LEVEL_UNSET;
  if (PUBLISHED_TOKEN_HASHES.has(await sha256hex(v))) return LEVEL_REVOKED;
  return LEVEL_AVAILABLE;
}

/**
 * R32 — the status, carrying no secret: `{available: true, level, kind, member, levels}` (and `project` at the project
 * level, R71) or `{available: false, reason: "NO_ACCOUNT", level, levels, detail}`, `level` the account's own (`member`
 * when none arrived). `account` is `{kind, level, secret, member, project?, suggestions?}` as the plane sends it (R6);
 * `member` is the member whose act it serves, at every level.
 */
export async function resolveClaudeCascade(account) {
  const level = levelOf(account);
  const state = await levelState(account);
  const levels = [{ level, state }];
  if (state === LEVEL_AVAILABLE)
    return { available: true, level, kind: account.kind,
             member: typeof account.member === "string" ? account.member : null,
             ...(level === "project" ? { project: projectOf(account) } : {}), levels };
  const whose = level === "group" ? "the group's API key"
    : level === "project" ? "the project's Claude account" : "the member's own Claude account reference";
  return {
    available: false, reason: CASCADE_NO_ACCOUNT, level, levels,
    detail: state === LEVEL_REVOKED
      ? `${whose} has been published in this repository, which revokes it, so no model turn can run under it. `
        + (level === "group"
          ? "An administrator sets a new key for the group, or members connect their own."
          : level === "project"
          ? "An owner of the project sets a new one; until then the member's own account, else the group's API key, "
            + "serves them only while your group's Civicsmith holds it and it is on."
          : "The member connects a new one; until then the group's API key serves them only while your group's "
            + "Civicsmith holds it and it is on.")
      : `no usable Claude account arrived for this act (${whose} was absent, empty, named no member${level === "project"
          ? " or no project" : ""}, or of a kind its level does not hold). Which account serves a member's act is your `
        + "group's Civicsmith's to answer (the project's, else the member's own, else the group's API key while it is "
        + "held and on); a member whom none serves has no assistant.",
  };
}

/**
 * R33 — `{level, reference}` exactly when R32 resolves, else null; `level` the account's own (`project`, `member` or
 * `group`). `reference` is in `agent-model`'s terms (`{kind: "apikey", key}` or `{kind: "signin", member}`, the member
 * whose own runner instance holds the sign-in; T38), for the one call it serves; never logged, echoed or kept by any
 * state of this module (R36). A project's sign-in is that one member's own and becomes exactly the member's own
 * reference; no reference names the project (R71; `agent-runner` R2).
 */
export async function cascadeToken(account) {
  const st = await resolveClaudeCascade(account);
  if (!st.available) return null;
  return { level: st.level,
           reference: account.kind === "signin" ? { kind: "signin", member: memberOf(account) }
                                                : { kind: "apikey", key: secretOf(account) } };
}
