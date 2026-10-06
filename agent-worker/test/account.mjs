/* R6, R10 (K1601 (1), K1755) — THE ACCOUNT THAT SERVES THE MEMBER'S ACT, AS THE PLANE SENDS IT, for the suites: here
 * the member's own (`level: "member"`; the group's API key is `level: "group"`, driven by the suites that test it).
 * Every `/run` carries one, the stubbed `judgements` path included, and the run's record names the same member as the
 * one whose act it is (`session.principal.claude`). NOT a `.test.mjs`: a fixture the suites
 * share. The secret is a fixture: no answer may ever carry it (R36). */
export const MEMBER = "member:ruth";
export const ACCOUNT_SECRET = "sk-ant-fixture-account-never-echoed";
export const ACCOUNT = Object.freeze({ kind: "apikey", level: "member", secret: ACCOUNT_SECRET, member: MEMBER });

/** A `/run` body as the plane sends it: the member's account, and (unless the body names its own account, the case
 *  that drives model turns) the stubbed path's `judgements`, so a body that supplies none walks the table with none
 *  rather than calling a model. A body naming `account` or the retired `claude_accounts` is sent as written. */
export function withAccount(body) {
  if (!body || typeof body !== "object" || "account" in body || "claude_accounts" in body) return body;
  return { ...body, account: ACCOUNT, judgements: body.judgements ?? [] };
}
