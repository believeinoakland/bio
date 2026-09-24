/* Token hygiene, shared by the control plane and the livefire battery.
 *
 * Every token value that has ever appeared in this repository is denylisted.
 * A deploy-button flow pre-fills secret prompts from files it finds in the
 * repo, and a published postmortem describes every copy of an application
 * shipping with the same leaked credential that way, silently, showing green.
 * So any value on this list is treated as NOT SET: it can never authenticate
 * and can never arm the bootstrap claim.
 *
 * Values are listed as SHA-256 so the denylist does not itself republish
 * them. If a token value ever lands in the repository again, its hash goes
 * here in the same change that removes it.
 */

export const PUBLISHED_TOKEN_HASHES = new Set([
  // dist/SECRETS.txt of the 0.2.0 test deployment
  // ADMIN_TOKEN
  "34451e5e855bf8d45e93d89fca560e6bd392cf1d0cc6832e3121614d1c68d9db",
  // MEMBER_TOKEN
  "7ecc5d014e25ce4c2e8457424afa0420288742c69182db1be5f4caccd63d4c91",
  // PROBE_TOKEN
  "5910ebbfe7816d9d5e2451012f9db8ac92aaa3f65a8f50da3f7255ab8bdb26ad",
]);

export const sha256hex = async (v) => {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};

/* A token binding is LIVE only if it is a non-empty string that has never
   been published in the repository. Empty and published both mean "not set",
   so an instance that boots with a leaked or blank credential refuses every
   request on that credential rather than running open. */
export async function liveToken(v) {
  if (typeof v !== "string" || v.length === 0) return false;
  return !PUBLISHED_TOKEN_HASHES.has(await sha256hex(v));
}

/* ---------------------------------------------------------------------------
 * DS-3 — THE ACCOUNT CASCADE'S THIRD LEVEL: the instance's own Claude account.
 *
 * FL-6 resolves member -> project -> instance at runtime and records WHICH
 * level paid. The first two are rows a member wrote, read from the record. This
 * is the third, and it is CONFIGURATION rather than record: one Claude account
 * the whole instance falls back to when no member or project account answers.
 *
 * DO NOT CONFUSE IT WITH THE `ai` CREDENTIAL (`aik-…`, PL-11). That is BIO's own
 * credential, which an agent presents TO the plane and which the plane resolves
 * against the record. This is an ANTHROPIC credential the instance presents to
 * CLAUDE, and it decides who PAYS for a run. They travel in opposite directions
 * and the names in this repository are close enough that the distinction is
 * written here rather than assumed: `instance-level credential` elsewhere in
 * this source means the shared machine token (`class:member`), a third thing
 * again.
 *
 * IT HAS NO WRITE PATH, AND THAT IS THE ENFORCEMENT RATHER THAN A CONVENTION.
 * D-199 (3): minting and setting an account credential is a MEMBER act. So there
 * is deliberately no op, no store row and no setter here — the value arrives as
 * a Worker secret binding placed by the operator through the deploy or install
 * path, and nothing an agent can call reaches it. An agent-initiated scope
 * widening is refused because there is nothing to widen: the surface does not
 * exist. `bio-plane/test/claudecascade.test.mjs` asserts that absence over the
 * plane's own source, so adding a setter later fails a suite instead of
 * quietly becoming possible.
 *
 * SHAPE IS DELIBERATELY NOT CHECKED. `AI_TOKEN_SHAPE` pins `aik-[0-9a-f]{64}`
 * because WE mint that and know its shape. This credential is Anthropic's, and
 * a vendor's format is their claim and not our measurement (CLAUDE.md) — a
 * regex guessed here would one day refuse a perfectly good key on a format
 * change nobody told us about, and would do it as a silent UNAVAILABLE. So the
 * only questions asked are the two this repository can actually answer: is
 * there a value, and has that value been published.
 */

export const INSTANCE_CLAUDE_BINDING = "INSTANCE_CLAUDE_TOKEN";

/** The stated reasons. A caller renders these; it never invents one. */
export const CASCADE_UNSET = "NO_INSTANCE_ACCOUNT";
export const CASCADE_PUBLISHED = "INSTANCE_ACCOUNT_REVOKED_BY_PUBLICATION";

/**
 * The instance level's STATUS, carrying no secret. This is the shape a surface,
 * a log line or a run record may hold: it answers configured/unavailable and
 * says WHY, and it cannot leak a credential because it never holds one.
 * An honest absence is STATED (CLAUDE.md) — never an empty success, because a
 * silent no-op is indistinguishable from a run that found nothing (FL-6).
 */
export async function instanceClaudeStatus(env) {
  const v = env?.[INSTANCE_CLAUDE_BINDING];
  if (typeof v !== "string" || v.length === 0) {
    return { level: "instance", configured: false, reason: CASCADE_UNSET,
      detail: "This instance has no Claude account configured, so it cannot pay for a run "
        + "that no member or project account covers. An operator sets it; an agent cannot." };
  }
  if (PUBLISHED_TOKEN_HASHES.has(await sha256hex(v))) {
    return { level: "instance", configured: false, reason: CASCADE_PUBLISHED,
      detail: "The configured value has been published in this repository and is therefore "
        + "treated as NOT SET. Publication is revocation here; rotate the credential." };
  }
  return { level: "instance", configured: true, reason: null, detail: null };
}

/**
 * The instance level's TOKEN, for the one caller that must actually spend it.
 * Returns null whenever `instanceClaudeStatus` would report unavailable, so the
 * two can never disagree — the status is derived from this function's own test,
 * not from a second reading of the environment.
 */
export async function instanceClaudeToken(env) {
  const st = await instanceClaudeStatus(env);
  return st.configured ? env[INSTANCE_CLAUDE_BINDING] : null;
}

/* ---------------------------------------------------------------------------
 * D-260 — THE INSTANCE'S ORGANISATION-PRINCIPAL `ai` CREDENTIAL (BOB #22, 2026-09-21;
 * `BIO_Assistant_and_AI_Roles_v0_1.md` §6).
 *
 * THE SECOND INSTANCE-LEVEL SECRET, AND IT TRAVELS THE OTHER WAY FROM THE ONE ABOVE. `INSTANCE_CLAUDE_TOKEN`
 * is Anthropic's credential and decides who PAYS; this is BIO's own `aik-…` credential, which `agent-worker`
 * presents TO the plane when the plane hands it a woken run to resume. The ruling: an instance MAY hold ONE
 * organisation-principal `ai` credential as a deploy secret, `DAEMON_TOKEN`'s precedent one class over — minted by
 * a member (DEC-55 (3)) and resolved through its `ai_credentials` row like any other. So this module says only
 * whether a value is present and not published; WHICH principal it is, and whether it is still standing, is the
 * RECORD's answer, asked by the one caller (`Store#aiRunResumer`) at the row.
 *
 * IT HAS NO WRITE PATH, for DS-3's reason above: the value arrives as a Worker secret an operator places through
 * install or update (DIST's half of D-260), and nothing an agent can call reaches it. The fence is asserted by
 * `bio-plane/test/d260-resume.test.mjs` exactly as `claudecascade.test.mjs` asserts the Claude binding's: this
 * module is the only one in `bio-plane/src` that names the binding. PUBLICATION IS REVOCATION, as for every
 * token here: a value on `PUBLISHED_TOKEN_HASHES` is NOT SET.
 */
export const INSTANCE_AI_BINDING = "INSTANCE_AI_TOKEN";

/** The stated reasons, secret-free. `null` when a live value is present. */
export const INSTANCE_AI_UNSET = "NO_INSTANCE_AI_CREDENTIAL";
export const INSTANCE_AI_PUBLISHED = "INSTANCE_AI_CREDENTIAL_REVOKED_BY_PUBLICATION";

/** `{ token, reason }`: the live value and `reason: null`, or `token: null` and the stated reason. The caller spends
 *  `token` and publishes only `reason` — the two come from ONE test, so they cannot disagree. */
export async function instanceAiCredential(env) {
  const v = env?.[INSTANCE_AI_BINDING];
  if (typeof v !== "string" || v.length === 0) return { token: null, reason: INSTANCE_AI_UNSET };
  if (!(await liveToken(v))) return { token: null, reason: INSTANCE_AI_PUBLISHED };
  return { token: v, reason: null };
}
