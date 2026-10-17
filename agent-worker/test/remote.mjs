/* R109, R110 — THE `REMOTE` BINDING AS THE SUITES STAND IT UP: a Durable Object namespace that names instances (the
 * member's, or `version`) and answers the two routes the readiness gate asks of the remote class (`GET /remote/version`,
 * `GET /remote/check`) itself, passing every other request to the recording namespace it wraps. The wrapped namespace
 * sees the conversation's and the sign-in's requests only, never the gate's, so a suite that counts the instances named
 * or the frames sent counts what the member's act did. `passed: false` is a member whose check has not passed. */
export const REMOTE_VERSION = "remote-test-1";

export function gated(ns, { version = REMOTE_VERSION, passed = true, checkedVersion = version } = {}) {
  return {
    idFromName: (name) => ({ name, inner: null }),
    newUniqueId: () => ({ name: "<unique>", inner: null }),
    get: (id) => ({
      fetch: async (url, init) => {
        const path = new URL(String(url)).pathname;
        if (path === "/remote/version") return Response.json({ ok: true, name: "agent-runner", version, capabilities: ["image"] });
        if (path === "/remote/check") return Response.json({ ok: true, checked: passed, version: checkedVersion });
        id.inner ??= ns.idFromName(id.name);
        return ns.get(id.inner).fetch(url, init);
      },
    }),
  };
}
