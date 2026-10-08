/* R66, R67 — `POST /signin`: THE RELAY OF A MEMBER'S OWN CLAUDE SIGN-IN TO THAT MEMBER'S OWN RUNNER INSTANCE (N708;
 * DEC-156; K1819, K2134, K2200).
 *
 * WHAT IT IS. A member connects their own Claude subscription by signing in on Anthropic's own page (DEC-156). The
 * sign-in is Claude Code's own, run unmodified in that member's own `agent-runner` container instance (its R17–R21),
 * and stored there by Claude Code itself, serving only that member (K1819). The plane's door routes
 * `subscriptionsignin` here (`control-plane`, T37) with the member it stamped (`by`, never a value of the member's
 * choosing) and one step: `start` (the binary's sign-in begins, and its sign-in address comes back), `code` (the code
 * Anthropic's page showed the member, delivered to that sign-in), `state` (whether that instance holds the member's
 * sign-in) or `signout` (the binary's own logout). This member sends the step to the `RUNNER` instance named by the
 * member, and no other, and answers the runner's answer unchanged, status and body (R43).
 *
 * WHAT IT IS NOT. It holds nothing of the sign-in (R36, R67): the code is read from this request's body only, sent only
 * in the body of the one request to that member's own instance, and never logged, stored, echoed or put in an answer;
 * the sign-in address reaches no answer but the `start` answer the runner gives; the stored sign-in never leaves the
 * instance (`agent-runner` R8). It makes no plane call and needs no `PLANE` binding. Which member is connected is
 * `credentials`', told by the door after a `code` step answers `connected: true`; this member records nothing. */

/** The steps, and the `agent-runner` route each is sent to (its R17, R18, R19, R20). */
export const SIGNIN_ROUTES = Object.freeze({
  start: "/signin",
  code: "/signin/code",
  state: "/signin/state",
  signout: "/signout",
});
/** `agent-runner` R17's member: a non-empty string of at most 200 characters. */
export const MEMBER_MAX = 200;
/* A binding ignores the host; this names the request, it does not route it (as `agent-model`'s `RUNNER_URL`). */
const RUNNER_ORIGIN = "https://agent-runner";
const DETAIL_MAX = 300;

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** The binding's own error words, never carrying the code (R67): cut, with any copy of the code taken out. */
function scrubbed(text, code) {
  let s = String(text ?? "");
  if (typeof code === "string" && code) s = s.split(code).join("[the code]");
  return s.slice(0, DETAIL_MAX);
}

/** `POST /signin`. `deps` are the shell's own pieces (index.mjs): the refusal helper. */
export async function handleSignin(req, env, deps) {
  const { refusal } = deps;
  const runner = env.RUNNER;
  if (!runner || typeof runner.idFromName !== "function" || typeof runner.get !== "function")
    return refusal("RUNNER_NOT_CONFIGURED",
      "this member reaches a member's own Claude sign-in only through the runner binding, and the binding is absent, "
      + "so nothing was sent.", 503);
  const body = await req.json().catch(() => null);
  if (!isObject(body)) return refusal("BAD_BODY", "the request body could not be read as a JSON object.", 400);
  const { member, step } = body;
  if (!(typeof member === "string" && member.trim().length > 0 && member.length <= MEMBER_MAX))
    return refusal("BAD_MEMBER",
      `member is the member whose own sign-in this is, as the door stamps it: a non-empty string of at most `
      + `${MEMBER_MAX} characters.`, 400);
  if (!Object.hasOwn(SIGNIN_ROUTES, step))
    return refusal("BAD_STEP", `step is one of ${Object.keys(SIGNIN_ROUTES).join(", ")}.`, 400);
  const code = step === "code" ? body.code : undefined;
  if (step === "code" && !(typeof code === "string" && code.length > 0))
    return refusal("BAD_CODE",
      "the code step carries the code from Anthropic's page: a non-empty string. Nothing was sent.", 400);

  /* R66, agent-runner R21: the instance named by this member and no other. The code goes in this one request's body
     and nowhere else (R67). */
  const payload = step === "code" ? { member, code } : { member };
  let res, text;
  try {
    const stub = runner.get(runner.idFromName(member));
    res = await stub.fetch(`${RUNNER_ORIGIN}${SIGNIN_ROUTES[step]}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
    });
    text = await res.text();
  } catch (e) {
    return refusal("RUNNER_SILENT", "the member's own runner did not answer, so the step's outcome is not known: "
      + scrubbed(e?.message ?? e, code), 502);
  }
  let answer;
  try { answer = JSON.parse(text); } catch { answer = undefined; }
  if (answer === undefined)
    return refusal("RUNNER_SILENT", "the member's own runner answered with no JSON, so the step's outcome is not known "
      + `(status ${res.status}).`, 502);
  /* R43: the runner's answer, status and body, unchanged. */
  return new Response(text, { status: res.status, headers: { "content-type": "application/json" } });
}
