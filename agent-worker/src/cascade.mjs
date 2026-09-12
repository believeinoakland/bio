/* FL-6 — THE CLAUDE-ACCOUNT CASCADE AT RUNTIME (§14a, INVESTIGATIVE-SESSION.md).
 *
 * **Resolution order: the MEMBER's account if they have one, otherwise the
 * PROJECT's, otherwise the INSTANCE's** — Bob's rule, verbatim. This module is
 * the ONE expression of that order and of the per-level judgement, and it is
 * PURE: no network, no environment read, no state. The material arrives PER
 * CALL from the one caller this member has (the plane), exactly as the `ai`
 * credential does, and is never retained — this member still holds no
 * credential of its own (fleet law, asserted one file over).
 *
 * WHY IT RESOLVES HERE AND NOT IN THE PLANE: `index.mjs`'s airunopen stamp says
 * it in the plane's own words — which level pays *"is resolved where the token
 * actually resolves, in the fleet member, and the plane learns it by being
 * told."* The record then refuses a run that cannot say (the store's
 * AI_RUN_CAPABILITY_UNAVAILABLE guard), which is the fail-closed direction.
 *
 * THE TWO QUESTIONS ASKED AT EVERY LEVEL are the only two this repository can
 * answer about a vendor's credential (DS-3's rule, and its reasoning): is there
 * a value, and has that value been published in this repository. Shape is
 * DELIBERATELY not checked — a vendor's format is their claim, not our
 * measurement, and a guessed regex would one day refuse a good key as a SILENT
 * unavailable. The denylist is the plane's own, imported from
 * `bio-plane/src/tokens.mjs` — a CROSS-TREE build input, hashed in this
 * member's bundle manifest by the FL-9 guard exactly as `pdf-worker`'s three
 * plane inputs are, so the one list stays one list.
 *
 * ABSENCE IS STATED PER LEVEL — sparse is the normal condition at every level,
 * and saying WHICH absence is a first-class obligation (CLAUDE.md). A level
 * with no entry and a level whose value was revoked by publication are
 * different facts, and a caller reading `levels` can tell them apart.
 *
 * STATUS CARRIES NO SECRET, AND THE TOKEN ACCESSOR IS DERIVED FROM THE STATUS
 * (DS-3's cannot-disagree shape): `cascadeToken` re-runs the same resolution
 * and spends only what `resolveClaudeCascade` would report available, so the
 * two can never answer differently about whether a value is spendable.
 */
import { PUBLISHED_TOKEN_HASHES, sha256hex } from "../../bio-plane/src/tokens.mjs";

/** Bob's order, one expression. Nothing else may restate it. */
export const CASCADE_ORDER = Object.freeze(["member", "project", "instance"]);

/** The stated reasons. A caller renders these; it never invents one. */
export const CASCADE_NO_ACCOUNT = "NO_ACCOUNT_RESOLVED";
export const LEVEL_UNSET = "unset";
export const LEVEL_REVOKED = "revoked_by_publication";
export const LEVEL_AVAILABLE = "available";

/** One level, two questions. `entry` is `{ token, ref }` or absent. */
async function levelState(entry) {
  const v = entry && typeof entry.token === "string" ? entry.token : "";
  if (v.length === 0) return LEVEL_UNSET;
  if (PUBLISHED_TOKEN_HASHES.has(await sha256hex(v))) return LEVEL_REVOKED;
  return LEVEL_AVAILABLE;
}

/**
 * The cascade's STATUS, carrying no secret — safe to log, publish on a
 * response, or compare against a run record. Every level is judged and named;
 * the resolved level is the FIRST available one in CASCADE_ORDER. A revoked
 * value is "not having one" and the cascade falls through it — publication is
 * revocation, not a wall.
 */
export async function resolveClaudeCascade(accounts = {}) {
  const levels = [];
  let resolved = null;
  for (const level of CASCADE_ORDER) {
    const entry = accounts?.[level];
    const state = await levelState(entry);
    levels.push({ level, state });
    if (!resolved && state === LEVEL_AVAILABLE)
      resolved = { level, ref: typeof entry.ref === "string" && entry.ref ? entry.ref : null };
  }
  if (resolved) return { available: true, level: resolved.level, ref: resolved.ref, levels };
  return {
    available: false,
    reason: CASCADE_NO_ACCOUNT,
    levels,
    detail: "no Claude account resolved at any level of the cascade (member, then project, then "
      + "instance). The capability is UNAVAILABLE and this is that statement — an honest absence, "
      + "stated, because a silent no-op is indistinguishable from a run that found nothing. Each "
      + "level's own absence is named beside this.",
  };
}

/**
 * The TOKEN for the one caller that must actually spend it, derived from the
 * same resolution so status and token cannot disagree. Returns
 * `{ level, token }` or null. Never logged, never echoed, never retained.
 */
export async function cascadeToken(accounts = {}) {
  const st = await resolveClaudeCascade(accounts);
  if (!st.available) return null;
  return { level: st.level, token: accounts[st.level].token };
}
