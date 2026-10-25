/* signin-door's published fixtures (K4990, K4993): each answer is made by the door's real code when the test runs, never stored.
   A user takes `signinRefusal(code, extra)` for what a member's sign-in is answered when the runner refuses a step. */
import { subscriptionSignin } from "../../../src/signin-door/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

/* the refusals `agent-runner` gives a `code` step and `agent-worker` relays (its R84), with the status the runner gives each */
const RUNNER_REFUSALS = Object.freeze({ NO_SIGNIN_WAITING: 409, SIGNIN_UNAVAILABLE: 502, SIGNIN_ADDRESS_UNEXPECTED: 502, SIGNIN_REFUSED: 409 });
/* the door's own refusal for a Worker with no assistant bound (R1) */
const DOOR_REFUSAL = "AGENT_WORKER_UNBOUND";
export const SIGNIN_REFUSAL_CODES = Object.freeze([...Object.keys(RUNNER_REFUSALS), DOOR_REFUSAL]);

export const FIXTURE_MEMBER = "member:ann";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
/* the store the door asks before a `code` step: the group does not keep its material away */
const openStore = async () => ({ answered: true, result: { ok: true } });

/** The answer a member's `subscriptionsignin` step `code` gets, `{status, body}` as the door sends it, when the runner
 *  refuses it with `code` (or, for AGENT_WORKER_UNBOUND, when no assistant is bound): the real `subscriptionSignin`, over a
 *  binding that answers the runner's refusal. `extra` is merged into the runner's body (a `detail` of the runner's own). */
export async function signinRefusal(code, extra = {}) {
  if (!SIGNIN_REFUSAL_CODES.includes(code)) throw new Error(`signinRefusal: no sign-in refusal ${code}`);
  const env = {};
  if (code !== DOOR_REFUSAL) {
    const detail = code === "SIGNIN_REFUSED" ? "invalid_grant" : word(`refusal.${code}`);
    env.AGENT_WORKER = { fetch: async () => json(RUNNER_REFUSALS[code], { ok: false, reason: code, code, detail, ...extra }) };
  }
  return subscriptionSignin({ env, member: FIXTURE_MEMBER, asked: { step: "code", code: "typed-code-never-answered" },
    store: openStore, log: () => {} });
}
