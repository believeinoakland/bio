/* R109, R110, R111 — THE ONE ROAD TO A MEMBER'S ASSISTANT: THE REMOTE SESSION, AND WHETHER IT MAY BE TAKEN YET
 * (N1196; K3607–K3611, K3615; DEC-301).
 *
 * The assistant runs in a Claude Code cloud session that `agent-runner`'s second class (bound here as `REMOTE`, a
 * Durable Object namespace with no container) creates on the member's own sign-in. Every path of this member that
 * reaches a runner (`/ask`, `/run`, `/draft` in every task, `/transcribe` and `/signin`) reaches it through `remoteOf`,
 * which answers `env.REMOTE` and nothing else: the local container binding (`RUNNER`) is not declared, not read and
 * not named by any code here (R109). The binding is passed to `agent-model` as the `runner` it already takes, because
 * `REMOTE` accepts the conversation's connection and request unchanged (`agent-runner` R36).
 *
 * WHETHER IT MAY BE TAKEN (R110; K3610: until the remote path works on a copy, that copy's assistant does not run).
 * `remoteVersion` asks the remote class its `GET /remote/version` (`agent-runner` R40) on an instance named
 * `VERSION_INSTANCE`, there being no member in that question. `remoteReady` is true exactly when that answered and the
 * member's own instance states a passed check recorded at that very version (`GET /remote/check` on the member's
 * instance: `{ok: true, checked, version}`; R111's `check` step writes it with `POST /remote/check` `{version}`). A
 * check from another version is no check. Nothing here throws, and nothing here keeps anything: each answer is asked
 * of the instances and used once (R36). */

/* A binding ignores the host; this names the request, it does not route it (as `agent-model`'s `RUNNER_URL`). */
const REMOTE_ORIGIN = "https://agent-runner";
export const REMOTE_VERSION_URL = `${REMOTE_ORIGIN}/remote/version`;
export const REMOTE_CHECK_URL = `${REMOTE_ORIGIN}/remote/check`;
/** R110: the instance `GET /remote/version` is asked of, there being no member in `GET /version`'s question. */
export const VERSION_INSTANCE = "version";

const namespaceOf = (v) => (v && typeof v.idFromName === "function" && typeof v.get === "function" ? v : null);

/** R109 — the one function that answers a runner: `env.REMOTE` as a namespace that names instances, else null. */
export const remoteOf = (env) => namespaceOf(env?.REMOTE);

/** R110 — `{answered: true, version}` when the remote class answers `GET /remote/version` as `agent-runner` R5's shape
 *  (`{ok: true, version, …}`), else `{answered: false}`. Never throws. */
export async function remoteVersion(env) {
  const ns = remoteOf(env);
  if (!ns) return { answered: false, why: "absent" };
  try {
    const res = await ns.get(ns.idFromName(VERSION_INSTANCE)).fetch(REMOTE_VERSION_URL);
    if (!res || res.status !== 200) return { answered: false, why: "silent" };
    const body = await res.json();
    if (!body || body.ok !== true || typeof body.version !== "string" || !body.version) return { answered: false, why: "silent" };
    return { answered: true, version: body.version };
  } catch {
    return { answered: false, why: "silent" };
  }
}

/** R110 — `{ready: true}` exactly when the remote class answers its version and the member's instance states a passed
 *  check at that version; else `{ready: false, why}`, `why` one of `absent`, `silent`, `unchecked`. Never throws. */
export async function remoteReady(env, member) {
  const v = await remoteVersion(env);
  if (!v.answered) return { ready: false, why: v.why };
  const ns = remoteOf(env);
  try {
    const res = await ns.get(ns.idFromName(member)).fetch(REMOTE_CHECK_URL);
    if (!res || res.status !== 200) return { ready: false, why: "unchecked" };
    const body = await res.json();
    return body && body.ok === true && body.checked === true && body.version === v.version
      ? { ready: true, version: v.version } : { ready: false, why: "unchecked" };
  } catch {
    return { ready: false, why: "unchecked" };
  }
}
